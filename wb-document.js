goog.provide('wideboard.Document');

goog.require('wideboard.Scrap');



/**
 * Main document class for Wideboard.
 * @param {!wideboard.Shelf} shelf
 * @param {!wideboard.Linemap} linemap
 * @constructor
 * @struct
 */
wideboard.Document = function(shelf, linemap) {
  /** @type {string} */
  this.filename = 'filename';

  /** @type {!wideboard.Shelf} */
  this.shelf = shelf;

  /** @type {!wideboard.Linemap} */
  this.linemap = linemap;

  /** @type {!Array.<number>} */
  this.linePos = [];

  /** @type {!Array.<number>} */
  this.lineLength = [];

  /** @type {!Array.<wideboard.Scrap>} */
  this.scraps = [];

  /**
   * Where this document lives on the shelf.
   * @type {number}
   */
  this.shelfPos = -1;

  /**
   * True when the document is loaded.
   * @type {boolean}
   */
  this.ready = false;
};


/**
 * @param {!Uint8Array} bytes
 */
wideboard.Document.prototype.onLoad = function(bytes) {
  var cursor = 0;

  // Skip byte order mark if present.
  if (bytes[0] == 239) {
    cursor = 3;
  }

  // Add all lines in the file to the linemap.

  var end = bytes.length;
  var lineStart = cursor;

  for (var i = cursor; i < bytes.length; i++) {

    if (bytes[i] == 10) {
      var lineLength = i - cursor;
      var pos = this.linemap.addLine(bytes, cursor, lineLength);

      this.linePos.push(pos);
      this.lineLength.push(lineLength);
      cursor = i + 1;
    }
  }
  if (cursor < bytes.length) {
    var lineLength = i - cursor;
    var pos = this.linemap.addLine(bytes, cursor, lineLength);

    // Hit a \n.
    this.linePos.push(pos);
    this.lineLength.push(lineLength);
  }

  this.linemap.updateTexture();

  // Add the document to the shelf.
  this.shelfPos = this.shelf.addDocument(this.linePos, this.lineLength);
  this.shelf.updateTexture();

  this.ready = true;
};


/**
 * @param {string} filename
 */
wideboard.Document.prototype.load = function(filename) {
  var xhr1 = new XMLHttpRequest();
  xhr1.open('GET', filename);
  xhr1.responseType = 'arraybuffer';
  var self = this;
  xhr1.onload = function() {
    var response = /** @type {!ArrayBuffer} */(xhr1.response);
    var bytes = new Uint8Array(response);
    self.onLoad(bytes);
  };
  xhr1.send();
};
