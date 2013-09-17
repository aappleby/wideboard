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

  /** @type {!WebGLTexture} */
  this.glTexture = gl.createTexture();

  /** @type {number} */
  this.width = width;

  /** @type {number} */
  this.height = height;

  /** @type {boolean} */
  this.ready = false;

  this.init();
};


/**
 * Creates texture.
 */
wideboard.Texture.prototype.init = function() {
  var gl = this.gl;

  gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                this.width, this.height, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, null);

  this.ready = true;
};


/**
 * @param {string} url
 */
wideboard.Texture.prototype.load = function(url) {
  var gl = this.gl;
  var image = new Image();
  var self = this;
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, self.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    self.ready = true;
  };
  image.src = url;
};


/**
 */
wideboard.Texture.prototype.makeLoremIpsum = function() {
  var text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed ' +
             'do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
             'Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
             'laboris nisi ut aliquip ex ea commodo consequat. Duis aute ' +
             'irure dolor in reprehenderit in voluptate velit esse cillum ' +
             'dolore eu fugiat nulla pariatur. Excepteur sint occaecat ' +
             'cupidatat non proident, sunt in culpa qui officia deserunt ' +
             'mollit anim id est laborum. ';

  var gl = this.gl;
  var data = new Uint32Array(this.width * this.height);
  var cursor = 0;
  for (var j = 0; j < this.height; j++) {
    for (var i = 0; i < this.width; i++) {
      data[cursor] = text.charCodeAt(cursor % text.length) | 0xFF000000;
      cursor++;
    }
  }
  var blob = new Uint8Array(data.buffer);
  gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                this.width, this.height, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data.buffer));
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
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                this.width, this.height, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data.buffer));
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
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                this.width, this.height, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data.buffer));
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
