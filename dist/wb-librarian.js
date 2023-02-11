// The librarian coordinates loading files, splitting them into chunks,
// splitting the chunks into lines, and storing the various bits of data
// in the linemaps and docmaps.
import { Shelf } from "./wb-shelf.js";
const fake_document = String.raw `A graphics processing unit (GPU) is a specialized electronic circuit designed to
manipulate and alter memory to accelerate the creation of images in a frame
buffer intended for output to a display device. GPUs are used in embedded
systems, mobile phones, personal computers, workstations, and game consoles.

Modern GPUs are efficient at manipulating computer graphics and image
processing. Their parallel structure makes them more efficient than general-
purpose central processing units (CPUs) for algorithms that process large blocks
of data in parallel. In a personal computer, a GPU can be present on a video
card or embedded on the motherboard. In some CPUs, they are embedded on the CPU
die.[1]

In the 1970s, the term "GPU" originally stood for graphics processor unit and
described a programmable processing unit independently working from the CPU and
responsible for graphics manipulation and output.[2][3] Later, in 1994, Sony
used the term (now standing for graphics processing unit) in reference to the
PlayStation console's Toshiba-designed Sony GPU in 1994.[4] The term was
popularized by Nvidia in 1999, who marketed the GeForce 256 as "the world's
first GPU".[5] It was presented as a "single-chip processor with integrated
transform, lighting, triangle setup/clipping, and rendering engines".[6] Rival
ATI Technologies coined the term "visual processing unit" or VPU with the
release of the Radeon 9700 in 2002.[7]
`;
let totalLines = 0;
let totalFiles = 0;
export class Librarian {
    gl;
    screenCursorX;
    screenCursorY;
    shelves;
    documentsRequested;
    dirQueue;
    docQueue;
    inFlight;
    constructor(gl) {
        this.gl = gl;
        this.screenCursorX = 0;
        this.screenCursorY = 0;
        this.shelves = [];
        this.shelves.push(new Shelf(gl, 1024, 1024));
        this.documentsRequested = 0;
        this.dirQueue = [];
        this.docQueue = [];
        this.inFlight = 0;
    }
    // Pops files or directories off the queue and loads them until we have five
    // requests in flight.
    loadNext() {
        //console.log("loadNext()");
        while (1) {
            if (this.docQueue.length) {
                let doc = this.docQueue.pop();
                //console.log(doc);
                this.loadDocument(doc);
            }
            else if (this.dirQueue.length) {
                let dir = this.dirQueue.pop();
                //console.log(dir);
                this.loadDirectory(dir);
            }
            else {
                break;
            }
        }
        //console.log("loadNext() done");
        /*
        while (this.inFlight < 100) {
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
        */
    }
    loadFakeDocument() {
        this.inFlight++;
        let blob = new Uint8Array(fake_document.length);
        for (let i = 0; i < blob.length; i++) {
            blob[i] = fake_document.charCodeAt(i);
        }
        this.onDocumentLoad("fake_document.txt", blob);
    }
    onDocumentLoad(filename, bytes) {
        //console.log("onDocumentLoad(" + filename + ")");
        this.inFlight--;
        totalFiles++;
        let cursor = 0;
        // Skip byte order mark if present.
        if (bytes[0] == 239) {
            cursor = 3;
        }
        // Add all lines in the file to the linemap.
        let end = bytes.length;
        let lineStarts = [];
        let lineLengths = [];
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
        console.log("Total lines " + totalLines);
        let shelfIndex = this.shelves.length - 1;
        let linemap = this.shelves[shelfIndex].linemap;
        if (linemap.cursorY > 3800) {
            this.shelves.push(new Shelf(this.gl, 1024, 1024));
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
    }
    ;
    onDirectoryLoad(path, response, url) {
        this.inFlight--;
        //console.log(path);
        //console.log(url);
        //console.log(response);
        let re = /<a href="(.*?)">/g;
        let matches = [...response.matchAll(re)];
        //console.log(matches);
        let file_filter = /href="[a-zA-Z].*?\.(h|hpp|c|cc|cpp|sh|ts)"/g;
        let dir_filter = /href="[a-zA-Z].*?\/"/g;
        for (let match of matches) {
            let text = match[0];
            let href = match[1];
            if (text.match(file_filter)) {
                //console.log("File: " + path + href);
                this.docQueue.push(path + href);
            }
            else if (text.match(dir_filter)) {
                //console.log("Dir: " + path + href);
                this.dirQueue.push(path + href);
            }
            else {
                //console.log("Link: " + text);
            }
            /*
            if (text.includes("icon-directory")) {
              //console.log(text);
              let dir_match = text.match(/href="(.*?)"/);
              if (dir_match && dir_match[1].length > 1) {
                console.log("Dir: " + dir_match[1]);
              }
            }
            */
            //console.log(match[0]);
        }
        /*
        let files : Array<Object> = JSON.parse(response);
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
        */
        this.loadNext();
    }
    ;
    loadDocument(filename) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', filename);
        xhr.responseType = 'arraybuffer';
        let self = this;
        xhr.onload = () => {
            let response = /** @type {!ArrayBuffer} */ (xhr.response);
            let bytes = new Uint8Array(response);
            self.onDocumentLoad(filename, bytes);
        };
        xhr.send();
        this.inFlight++;
    }
    ;
    loadDirectory(path) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', path);
        let self = this;
        xhr.onload = () => {
            //console.log(xhr);
            self.onDirectoryLoad(path, xhr.response, xhr.responseURL);
        };
        xhr.send();
        this.inFlight++;
    }
    ;
}
;
//# sourceMappingURL=wb-librarian.js.map