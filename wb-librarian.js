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

  /** @type {!Array.<!wideboard.Shelf>} */
  this.shelves = [];
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));
  this.shelves.push(new wideboard.Shelf(context, 1024, 1024));

  this.documentsRequested = 0;
};


/**
 * @param {!Array.<string>} files
 * @param {number} shelfIndex
 */
wideboard.Librarian.prototype.loadFiles = function(files, shelfIndex) {
  for (var i = 0; i < files.length; i++) {
    this.loadDocument(files[i], shelfIndex);
  }
};

/**
 * @param {string} filename
 * @param {!Uint8Array} bytes
 * @param {number} shelfIndex
 */
wideboard.Librarian.prototype.onDocumentLoad = function(filename, bytes, shelfIndex) {
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

  totalLines += lineStarts.length;

  // We now have the text blob, the list of line starts, and the list of line lengths.
  // Create a new document and add all the lines we found to it.
  this.shelves[shelfIndex].addDocument2(bytes, lineStarts, lineLengths);
};


/**
 * @param {string} path
 * @param {!Array.<Object>} files
 * @param {number} shelfIndex
 */
wideboard.Librarian.prototype.onDirectoryLoad = function(path, files, shelfIndex) {
  //console.log(path);
  //console.log(files);

  var toodeep = (path.split('/').length > 3);

  if (path.length && path[path.length - 1] == '/') {
    path = path.substr(0, path.length - 1);
  }

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    var newpath = path.length ? path + '/' + file.name : file.name;

    //console.log(newpath);

    if (file.dir) {
      if (!toodeep) {
        this.loadDirectory(newpath, shelfIndex);
      }
    } else {
      //if (this.documentsRequested < 500) {
        this.loadDocument(newpath, shelfIndex);
        this.documentsRequested++;
      //}
    }
  }
};


/**
 * @param {string} filename
 * @param {number} shelfIndex
 */
wideboard.Librarian.prototype.loadDocument = function(filename, shelfIndex) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', filename);
  xhr.responseType = 'arraybuffer';
  var self = this;
  xhr.onload = function() {
    var response = /** @type {!ArrayBuffer} */(xhr.response);
    var bytes = new Uint8Array(response);
    self.onDocumentLoad(filename, bytes, shelfIndex);
  };
  xhr.send();
};


/**
 * @param {string} path
 * @param {number} shelfIndex
 */
wideboard.Librarian.prototype.loadDirectory = function(path, shelfIndex) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', path);
  var self = this;
  xhr.onload = function() {
    var response = JSON.parse(/** @type {string} */(xhr.response));
    self.onDirectoryLoad(path, /** @type {!Array.<!Object>} */(response), shelfIndex);
  };
  xhr.send();
};
