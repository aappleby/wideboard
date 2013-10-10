goog.provide('wideboard.Linemap');

goog.require('wideboard.Bitvec');
goog.require('wideboard.Context');
goog.require('wideboard.Texture');

/**
 * The linemap is a dynamically-allocated texture atlas that stores the actual
 * text characters for each line.
 * @param {!wideboard.Context} context
 * @param {number} width
 * @param {number} height
 * @constructor
 * @struct
 */
wideboard.Linemap = function(context, width, height) {
  /** @type {!wideboard.Context} */
  this.context = context;

  /** @type {number} */
  this.width = width;

  /** @type {number} */
  this.height = height;

  /** @type {wideboard.Texture} */
  this.texture = null;

  /**
   * Dumb initial implementation just has an allocation cursor.
   * @type {number}
   */
  this.cursorX = 0;

  /** @type {number} */
  this.cursorY = 0;

  /** @type {boolean} */
  this.dirty = true;

  /** @type {!Array.<number>} */
  this.linePos = [];

  /** @type {!Array.<number>} */
  this.lineLength = [];

  /** @type {!wideboard.Bitvec} */
  this.bitvec = new wideboard.Bitvec(width * height);

  this.init();
};


/**
 */
wideboard.Linemap.prototype.init = function() {
  var gl = this.context.getGl();
  this.texture = new wideboard.Texture(gl, 2048, 2048, gl.LUMINANCE, false);
};


/**
 * @param {number} size
 * @return {number}
 */
wideboard.Linemap.prototype.allocate = function(size) {
  if (this.cursorX + size > this.width) {
    this.cursorX = 0;
    this.cursorY++;
  }
  var result = this.cursorX + this.cursorY * this.width;
  this.cursorX += size;
  return result;
};



/**
 * @param {!XMLHttpRequest} xhr
 */
wideboard.Linemap.prototype.onDocLoad = function(xhr) {
  var response = /** @type {!ArrayBuffer} */(xhr.response);
  var bytes = new Uint8Array(response);

  var cursor = 0;

  // Skip byte order mark if present.
  if (bytes[0] == 239) {
    cursor = 3;
  }

  var data = new Uint8Array(this.width * this.height);
  var end = bytes.length;
  var lineStart = cursor;

  for (var i = cursor; i < bytes.length; i++) {

    if (bytes[i] == 10) {
      var lineLength = i - cursor;
      var pos = this.allocate(lineLength);
      for (var j = 0; j < lineLength; j++) {
        data[pos + j] = bytes[cursor + j];
      }
      // Hit a \n.
      this.linePos.push(pos);
      this.lineLength.push(lineLength);
      cursor = i + 1;
    }
  }
  if (cursor < bytes.length) {
    var lineLength = i - cursor;
    var pos = this.allocate(lineLength);
    for (var j = 0; j < lineLength; j++) {
      data[pos + j] = bytes[cursor + j];
    }
    // Hit a \n.
    this.linePos.push(pos);
    this.lineLength.push(lineLength);
  }

  //data.set(bytes);
  var blob = new Uint8Array(data.buffer);

  var gl = this.context.getGl();
  gl.bindTexture(gl.TEXTURE_2D, this.texture.glTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, this.texture.format,
                this.width, this.height, 0,
                this.texture.format, gl.UNSIGNED_BYTE, blob);
  this.texture.ready = true;
};


/**
 * @param {string} filename
 */
wideboard.Linemap.prototype.load = function(filename) {
  var xhr1 = new XMLHttpRequest();
  xhr1.open('GET', filename);
  xhr1.responseType = 'arraybuffer';

  xhr1.onload = goog.bind(this.onDocLoad, this, xhr1);

  xhr1.send();
};


