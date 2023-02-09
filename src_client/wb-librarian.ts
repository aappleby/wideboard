// The librarian coordinates loading files, splitting them into chunks,
// splitting the chunks into lines, and storing the various bits of data
// in the linemaps and docmaps.

import { Context } from "./wb-context.js"
import { Document } from "./wb-document.js"
import { Linemap } from "./wb-linemap.js"
import { Scrap } from "./wb-scrap.js"
import { Shelf } from "./wb-shelf.js"

let totalLines = 0;
let totalFiles = 0;

export class Librarian {
  context : Context;
  screenCursorX : number;
  screenCursorY : number;
  shelves : Array<Shelf>;
  documentsRequested : number;
  dirQueue : Array<string>;
  docQueue : Array<string>;
  inFlight : number;

  constructor(context : Context) {
    this.context = context;
    this.screenCursorX = 0;
    this.screenCursorY = 0;
    this.shelves = [];
    this.shelves.push(new Shelf(context, 1024, 1024));
    this.documentsRequested = 0;
    this.dirQueue = [];
    this.docQueue = [];
    this.inFlight = 0;
  }

  // Pops files or directories off the queue and loads them until we have five
  // requests in flight.
  loadNext() {
    while (this.inFlight < 10) {
      if (this.docQueue.length) {
        let doc = this.docQueue.pop()!;
        this.loadDocument(doc);
      } else if (this.dirQueue.length) {
        let dir = this.dirQueue.pop()!;
        this.loadDirectory(dir);
      } else {
        break;
      }
    }
  };

  onDocumentLoad(filename : string, bytes : Uint8Array) {
    this.inFlight--;
    totalFiles++;
    let cursor = 0;

    // Skip byte order mark if present.
    if (bytes[0] == 239) {
      cursor = 3;
    }

    // Add all lines in the file to the linemap.

    let end = bytes.length;

    let lineStarts : Array<number> = [];
    let lineLengths  : Array<number> = [];

    let i = cursor;
    for (; i < bytes.length; i++) {
      if (bytes[i] == 10) {
        let lineLength = i - cursor;
        lineStarts.push(cursor);
        lineLengths.push(lineLength);
        cursor = i + 1;
      }
    }
    if (cursor < bytes.length) {
      let lineLength = i - cursor;
      lineStarts.push(cursor);
      lineLengths.push(lineLength);
    }

    let lineCount = lineStarts.length;
    totalLines += lineCount;

    let shelfIndex = this.shelves.length - 1;

    let linemap = this.shelves[shelfIndex].linemap;
    if (linemap.cursorY > 3800) {
      this.shelves.push(new Shelf(this.context, 1024, 1024));
      shelfIndex = this.shelves.length - 1;
    }

    // We now have the text blob, the list of line starts, and the list of line lengths.
    // Create a new document and add all the lines we found to it.
    this.shelves[shelfIndex].addDocument2(bytes, lineStarts, lineLengths, this.screenCursorX, this.screenCursorY);

    this.screenCursorY += lineCount * 14 + 300;
    if (this.screenCursorY > 200000) {
      this.screenCursorY = 0;
      this.screenCursorX += 1280;
    }

    this.loadNext();
  };

  onDirectoryLoad(path : string, files : Array<Object>) {
    this.inFlight--;
    //console.log(path);
    //console.log(files);

    if (path.length && path[path.length - 1] == '/') {
      path = path.substring(0, path.length - 1);
    }

    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      // @ts-ignore
      let newpath = path.length ? path + '/' + file.name : file.name;

      // @ts-ignore
      if (file.dir) {
        this.dirQueue.push(newpath);
      } else {
        this.docQueue.push(newpath);
      }
    }

    this.loadNext();
  };

  loadDocument(filename : string) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', filename);
    xhr.responseType = 'arraybuffer';
    let self = this;
    xhr.onload = () => {
      let response = /** @type {!ArrayBuffer} */(xhr.response);
      let bytes = new Uint8Array(response);
      self.onDocumentLoad(filename, bytes);
    };
    xhr.send();
    this.inFlight++;
  };

  loadDirectory(path : string) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', path);
    let self = this;
    xhr.onload = () => {
      let response = JSON.parse(xhr.response);
      self.onDirectoryLoad(path, response);
    };
    xhr.send();
    this.inFlight++;
  };

};
