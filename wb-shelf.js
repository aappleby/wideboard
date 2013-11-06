/**
 * A shelf is a collection of documents.
 * It also owns the texture that contains each document's docmap (list of
 * lines encoded as a span of texels in a texture).
 */
goog.provide('wideboard.Shelf');

goog.require('goog.webgl');
goog.require('wideboard.Buffer');
goog.require('wideboard.Texture');


var globalShelfIndex = 0;


/**
 * @param {!wideboard.Context} context
 * @param {number} width
 * @param {number} height
 * @constructor
 * @struct
 */
wideboard.Shelf = function(context, width, height) {
  this.shelfIndex = globalShelfIndex++;

  /** @type {!Array.<!wideboard.Document>} */
  this.documents = [];

  /** @type {!wideboard.Context} */
  this.context = context;

  /** @type {number} */
  this.width = width;

  /** @type {number} */
  this.height = height;

  /** @type {!wideboard.Texture} */
  this.texture = new wideboard.Texture(context.getGl(),
                                       this.width, this.height,
                                       goog.webgl.RGBA, false);

  /** @type {!Uint32Array} */
  this.buffer = new Uint32Array(this.width * this.height);

  /** @type {number} */
  this.cursorX = 0;

  /** @type {number} */
  this.cursorY = 0;

  /** @type {number} */
  this.cleanCursorX = 0;

  /** @type {number} */
  this.cleanCursorY = 0;

  /** @type {!wideboard.Linemap} */
  this.linemap = new wideboard.Linemap(this.context, 4096, 4096);

  /**
   * Document position buffer, can hold 65k documents.
   * @type {!wideboard.Buffer}
   */
  this.docPosBuffer = new wideboard.Buffer(context.getGl(), 'iDocPos', context.getGl().DYNAMIC_DRAW);
  this.docPosBuffer.initDynamic(4, 65536);

  /**
   * Document position buffer, can hold 65k documents.
   * @type {!wideboard.Buffer}
   */
  this.docColorBuffer = new wideboard.Buffer(context.getGl(), 'iDocColor', context.getGl().DYNAMIC_DRAW);
  this.docColorBuffer.initDynamic(4, 65536);
};


/**
 * @param {!Array.<number>} linePos
 * @param {!Array.<number>} lineLength
 * @return {number}
 */
wideboard.Shelf.prototype.addDocument = function(linePos, lineLength) {
  var size = linePos.length;

  var pos = this.cursorX + this.cursorY * this.width;

  for (var i = 0; i < size; i++) {
    this.buffer[pos + i] = (lineLength[i] << 24) | linePos[i];
  }

  this.cursorX = (pos + size) % this.width;
  this.cursorY = (pos + size - this.cursorX) / this.width;

  return pos;
};


/**
 * @param {!Uint8Array} bytes
 * @param {!Array.<number>} lineStarts
 * @param {!Array.<number>} lineLengths
 * @param {number} screenX
 * @param {number} screenY
 */
wideboard.Shelf.prototype.addDocument2 = function(bytes, lineStarts, lineLengths, screenX, screenY) {

  var document = new wideboard.Document();
  document.shelfIndex = this.documents.length;

  var lineCount = lineStarts.length;

  for (var i = 0; i < lineCount; i++) {
      var pos = this.linemap.addLine(bytes, lineStarts[i], lineLengths[i]);
      document.linePos.push(pos);
      document.lineLength.push(lineLengths[i]);
  }

  // Add the document to the shelf.
  document.shelfPos = this.addDocument(document.linePos, document.lineLength);

  document.ready = true;

  this.documents.push(document);

  document.screenX = screenX;
  document.screenY = screenY;

  this.docPosBuffer.data[document.shelfIndex * 4 + 0] = document.screenX;
  this.docPosBuffer.data[document.shelfIndex * 4 + 1] = document.screenY;
  this.docPosBuffer.data[document.shelfIndex * 4 + 2] = lineCount;
  this.docPosBuffer.data[document.shelfIndex * 4 + 3] = document.shelfPos;

  this.docColorBuffer.data[document.shelfIndex * 4 + 0] = (document.shelfIndex * 0.01) % 0.2;
  this.docColorBuffer.data[document.shelfIndex * 4 + 1] = (document.shelfIndex * 0.007) % 0.2;
  this.docColorBuffer.data[document.shelfIndex * 4 + 2] = 0.2;
  this.docColorBuffer.data[document.shelfIndex * 4 + 3] = 1.0;

  this.updateTexture();
  this.linemap.updateTexture();
  this.docPosBuffer.uploadDirty(document.shelfIndex, document.shelfIndex + 1);
  this.docColorBuffer.uploadDirty(document.shelfIndex, document.shelfIndex + 1);
};


/**
 * TODO(aappleby): This should flush only dirty chunks of the docmap to the
 * GPU, but for now it's easier to flush the whole thing.
 */
wideboard.Shelf.prototype.updateTexture = function() {
  if ((this.cursorX == this.cleanCursorX) &&
      (this.cursorY == this.cleanCursorY)) {
    return;
  }

  var linecount = (this.cursorY - this.cleanCursorY + 1);

  var byteOffset = this.cleanCursorY * this.width * 4;
  var byteSize = linecount * this.width * 4;

  var gl = this.context.getGl();
  gl.bindTexture(gl.TEXTURE_2D, this.texture.glTexture);

  var blob = new Uint8Array(this.buffer.buffer, byteOffset, byteSize);
  gl.texSubImage2D(gl.TEXTURE_2D, 0,
                   0, this.cleanCursorY,
                   this.width, linecount,
                   this.texture.format, gl.UNSIGNED_BYTE, blob);

  this.texture.ready = true;
  this.cleanCursorX = this.cursorX;
  this.cleanCursorY = this.cursorY;
};
