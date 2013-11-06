/**
 * The librarian coordinates loading files, splitting them into chunks,
 * splitting the chunks into lines, and storing the various bits of data
 * in the linemaps and docmaps.
 */

goog.provide('wideboard.Librarian');

goog.require('wideboard.Document');
goog.require('wideboard.Linemap');
goog.require('wideboard.Scrap');
goog.require('wideboard.Shelf');



var totalLines = 0;
var totalFiles = 0;


/**
 * @param {!wideboard.Context} context
 * @constructor
 * @struct
 */
wideboard.Librarian = function(context) {
  /** @type {!wideboard.Context} */
  this.context = context;

  /** @type {number} */
  this.screenCursorX = 0;

  /** @type {number} */
  this.screenCursorY = 0;

  /** @type {!Array.<!wideboard.Shelf>} */
  this.shelves = [];
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  /*
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  */

  /** @type {number} */
  this.documentsRequested = 0;

  /** @type {!Array.<string>} */
  this.dirQueue = [];

  /** @type {!Array.<string>} */
  this.docQueue = [];

  /** @type {number} */
  this.inFlight = 0;
};


/**
 * Pops files or directories off the queue and loads them until we have five
 * requests in flight.
 */
wideboard.Librarian.prototype.loadNext = function() {
  while (this.inFlight < 5) {
    if (this.docQueue.length) {
      var doc = this.docQueue.pop();
      this.loadDocument(doc);
    } else if (this.dirQueue.length) {
      var dir = this.dirQueue.pop();
      this.loadDirectory(dir);
    } else {
      break;
    }
  }
};


/**
 * @param {string} filename
 * @param {!Uint8Array} bytes
 */
wideboard.Librarian.prototype.onDocumentLoad = function(filename, bytes) {
  this.inFlight--;
  totalFiles++;
  var cursor = 0;

  // Skip byte order mark if present.
  if (bytes[0] == 239) {
    cursor = 3;
  }

  // Add all lines in the file to the linemap.

  var end = bytes.length;

  var lineStarts = [];
  var lineLengths = [];

  for (var i = cursor; i < bytes.length; i++) {

    if (bytes[i] == 10) {
      var lineLength = i - cursor;
      lineStarts.push(cursor);
      lineLengths.push(lineLength);
      cursor = i + 1;
    }
  }
  if (cursor < bytes.length) {
    var lineLength = i - cursor;
    lineStarts.push(cursor);
    lineLengths.push(lineLength);
  }

  var lineCount = lineStarts.length;
  totalLines += lineCount;

  var shelfIndex = this.shelves.length - 1;

  var linemap = this.shelves[shelfIndex].linemap;
  if (linemap.cursorY > 3800) {
    this.shelves.push(new wideboard.Shelf(this.context, 1024, 1024));
    shelfIndex = this.shelves.length - 1;
  }

  // We now have the text blob, the list of line starts, and the list of line lengths.
  // Create a new document and add all the lines we found to it.
  this.shelves[shelfIndex].addDocument2(bytes, lineStarts, lineLengths, this.screenCursorX, this.screenCursorY);

  this.screenCursorY += lineCount * 14 + 300;
  if (this.screenCursorY > 200000) {
    this.screenCursorY = 0;
    this.screenCursorX += 1024;
  }

  this.loadNext();
};


/**
 * @param {string} path
 * @param {!Array.<Object>} files
 */
wideboard.Librarian.prototype.onDirectoryLoad = function(path, files) {
  this.inFlight--;
  //console.log(path);
  //console.log(files);

  if (path.length && path[path.length - 1] == '/') {
    path = path.substr(0, path.length - 1);
  }

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    var newpath = path.length ? path + '/' + file.name : file.name;

    if (file.dir) {
      this.dirQueue.push(newpath);
    } else {
      this.docQueue.push(newpath);
    }
  }

  this.loadNext();
};


/**
 * @param {string} filename
 */
wideboard.Librarian.prototype.loadDocument = function(filename) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', filename);
  xhr.responseType = 'arraybuffer';
  var self = this;
  xhr.onload = function() {
    var response = /** @type {!ArrayBuffer} */(xhr.response);
    var bytes = new Uint8Array(response);
    self.onDocumentLoad(filename, bytes);
  };
  xhr.send();
  this.inFlight++;
};


/**
 * @param {string} path
 */
wideboard.Librarian.prototype.loadDirectory = function(path) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', path);
  var self = this;
  xhr.onload = function() {
    var response = JSON.parse(/** @type {string} */(xhr.response));
    self.onDirectoryLoad(path, /** @type {!Array.<!Object>} */(response));
  };
  xhr.send();
  this.inFlight++;
};
