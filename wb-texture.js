goog.provide('wideboard.Texture');

goog.require('goog.asserts');

/**
 * Simple texture class.
 * @param {!WebGLRenderingContext} gl
 * @param {number} width
 * @param {number} height
 * @param {number} format
 * @param {boolean} filter
 * @constructor
 * @struct
 */
wideboard.Texture = function(gl, width, height, format, filter) {
  /** @type {!WebGLRenderingContext} */
  this.gl = gl;

  /** @type {!WebGLTexture} */
  this.glTexture = gl.createTexture();

  /** @type {number} */
  this.width = width;

  /** @type {number} */
  this.height = height;

  /** @type {number} */
  this.format = format;

  /** @type {boolean} */
  this.filter = filter;

  /** @type {boolean} */
  this.ready = false;

  this.init();
};


/**
 * Creates texture.
 */
wideboard.Texture.prototype.init = function() {
  var gl = this.gl;
  var filter = this.filter ? gl.LINEAR : gl.NEAREST;

  gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_2D, 0, this.format,
                this.width, this.height, 0,
                this.format, gl.UNSIGNED_BYTE, null);

  this.ready = false;
};


/**
 * @param {string} url
 */
wideboard.Texture.prototype.load = function(url) {
  var gl = this.gl;
  var image = new Image();
  image.onload = goog.bind(function() {
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.format, gl.UNSIGNED_BYTE, image);
    /*
    if (self.filter) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    }
    */
    this.ready = true;
  }, this);
  image.src = url;
};


/**
 * Generates a texture where each texel stores a location in the linemap and
 * the length of the line.
 * @param {!Array.<number>} linePos
 * @param {!Array.<number>} lineLength
 */
wideboard.Texture.prototype.makeDocmap = function(linePos, lineLength) {
  var gl = this.gl;
  var data = new Uint32Array(this.width * this.height);
  for (var i = 0; i < lineLength.length; i++) {
    data[i] = (lineLength[i] << 24) | linePos[i];
  }

  var blob = new Uint8Array(data.buffer);
  gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, this.format,
                this.width, this.height, 0,
                this.format, gl.UNSIGNED_BYTE, blob);
  this.ready = true;
};


/**
 */
wideboard.Texture.prototype.makeChecker = function() {
  var gl = this.gl;
  var data = new Uint32Array(this.width * this.height);
  var cursor = 0;
  for (var j = 0; j < this.height; j++) {
    for (var i = 0; i < this.width; i++) {
      if ((i ^ j) & 1) {
        data[cursor++] = 0xFFFFFFFF;
      } else {
        data[cursor++] = 0xFF000000;
      }
    }
  }
  var blob = new Uint8Array(data.buffer);
  gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, this.format,
                this.width, this.height, 0,
                this.format, gl.UNSIGNED_BYTE, new Uint8Array(data.buffer));
  this.ready = true;
};


/**
 */
wideboard.Texture.prototype.makeNoise = function() {
  var gl = this.gl;
  var data = new Uint32Array(this.width * this.height);
  var rand = 1;
  var cursor = 0;
  for (var j = 0; j < this.height; j++) {
    for (var i = 0; i < this.width; i++) {
      var r = (rand >>> 0) & 0xFF;
      var g = (rand >>> 8) & 0xFF;
      var b = (rand >>> 16) & 0xFF;
      data[cursor++] = 0xFF000000 | (r << 0) | (g << 8) | (b << 16);
      rand *= 123456789;
      rand ^= rand >>> 13;
    }
  }
  var blob = new Uint8Array(data.buffer);
  gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, this.format,
                this.width, this.height, 0,
                this.format, gl.UNSIGNED_BYTE, new Uint8Array(data.buffer));
  this.ready = true;
};


/**
 * @param {number} slot
 */
wideboard.Texture.prototype.bind = function(slot) {
  var gl = this.gl;
  goog.asserts.assert(this.glTexture);
  goog.asserts.assert(slot >= 0);
  goog.asserts.assert(slot < 32);

  gl.activeTexture(gl.TEXTURE0 + slot);
  gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
};
