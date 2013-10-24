/**
 * A shelf is a collection of documents.
 * It also owns the texture that contains each document's docmap (list of
 * lines encoded as a span of texels in a texture).
 */
goog.provide('wideboard.Shelf');

goog.require('goog.webgl');
goog.require('wideboard.Texture');



/**
 * @param {!wideboard.Context} context
 * @param {number} width
 * @param {number} height
 * @constructor
 * @struct
 */
wideboard.Shelf = function(context, width, height) {
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

  this.updateTexture();

  return pos;
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
