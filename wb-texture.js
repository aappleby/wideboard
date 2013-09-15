goog.provide('wideboard.Texture');

goog.require('goog.asserts');

/**
 * Simple texture class.
 * @param {!WebGLRenderingContext} gl
 * @param {number} width
 * @param {number} height
 * @constructor
 * @struct
 */
wideboard.Texture = function(gl, width, height) {
  /** @type {!WebGLRenderingContext} */
  this.gl = gl;

  /** @type {number} */
  this.width = width;

  /** @type {number} */
  this.height = height;

  /** @type {WebGLTexture} */
  this.texture = null;

  /** @type {number} */
  this.boundSlot = -1;

  this.init();
};


/**
 * Creates texture.
 */
wideboard.Texture.prototype.init = function() {
  var gl = this.gl;

  this.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                this.width, this.height, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, null);
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
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                this.width, this.height, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data.buffer));
};


/**
 */
wideboard.Texture.prototype.makeNoise = function() {
  var gl = this.gl;
  var data = new Uint32Array(this.width * this.height);
  var rand = 0x384872247;
  var cursor = 0;
  for (var j = 0; j < this.height; j++) {
    for (var i = 0; i < this.width; i++) {
      var r = (rand >> 0) & 0xFF;
      var g = (rand >> 8) & 0xFF;
      var b = (rand >> 16) & 0xFF;
      data[cursor++] = 0xFF000000 | (r << 0) | (g << 8) | (b << 16);
      rand *= 0x71287693; rand ^= rand >> 16;
      rand *= 0x71287693; rand ^= rand >> 16;
    }
  }
  var blob = new Uint8Array(data.buffer);
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                this.width, this.height, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data.buffer));
};


/**
 * @param {number} slot
 */
wideboard.Texture.prototype.bind = function(slot) {
  var gl = this.gl;
  goog.asserts.assert(this.texture);
  goog.asserts.assert(slot >= 0);
  goog.asserts.assert(slot < 32);

  gl.activeTexture(gl.TEXTURE0 + slot);
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
};
