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


/**
 * @param {!wideboard.Context} context
 * @constructor
 * @struct
 */
wideboard.Librarian = function(context) {
  /** @type {!wideboard.Context} */
  this.context = context;

  /** @type {!wideboard.Shelf} */
  this.shelf = new wideboard.Shelf(context, 1024, 1024);

  /** @type {!Array.<!wideboard.Document>} */
  this.documents = [];

  this.documentsRequested = 0;
};


/**
 * @param {!Array.<string>} files
 */
wideboard.Librarian.prototype.loadFiles = function(files) {
  /*
  for (var i = 0; i < files.length; i++) {
    this.loadDocument(files[i]);
  }
  */

  this.loadDirectory('closure-library/closure/goog');
  this.loadDocument('warandpeace.txt');
  //this.loadDirectory("closure-library/closure/goog");
  //this.loadDirectory("closure-library/closure/goog");
  //this.loadDirectory("closure-library/closure/goog");
};

var totalLines = 0;
var totalFiles = 0;

/**
 * @param {string} filename
 * @param {!Uint8Array} bytes
 */
wideboard.Librarian.prototype.onDocumentLoad = function(filename, bytes) {
  totalFiles++;
  var cursor = 0;

  // Skip byte order mark if present.
  if (bytes[0] == 239) {
    cursor = 3;
  }

  // Add all lines in the file to the linemap.

  var document = new wideboard.Document();

  var end = bytes.length;
  var lineStart = cursor;

  for (var i = cursor; i < bytes.length; i++) {

    if (bytes[i] == 10) {
      var lineLength = i - cursor;
      var pos = this.shelf.linemap.addLine(bytes, cursor, lineLength);

      document.linePos.push(pos);
      document.lineLength.push(lineLength);
      cursor = i + 1;
    }
  }
  if (cursor < bytes.length) {
    var lineLength = i - cursor;
    var pos = this.shelf.linemap.addLine(bytes, cursor, lineLength);

    // Hit a \n.
    document.linePos.push(pos);
    document.lineLength.push(lineLength);
  }

  totalLines += document.linePos.length;

  this.shelf.linemap.updateTexture();

  // Add the document to the shelf.
  document.shelfPos = this.shelf.addDocument(document.linePos, document.lineLength);
  //this.shelf.updateTexture();

  document.ready = true;

  this.documents.push(document);
};


/**
 * @param {string} path
 * @param {!Array.<Object>} files
 */
wideboard.Librarian.prototype.onDirectoryLoad = function(path, files) {
  console.log(path);
  console.log(files);

  var toodeep = (path.split('/').length > 3);

  if (path.length && path[path.length - 1] == '/') {
    path = path.substr(0, path.length - 1);
  }

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    var newpath = path.length ? path + '/' + file.name : file.name;

    console.log(newpath);

    if (file.dir) {
      if (!toodeep) {
        this.loadDirectory(newpath);
      }
    } else {
      //if (this.documentsRequested < 500) {
        this.loadDocument(newpath);
        this.documentsRequested++;
      //}
    }
  }
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
};
