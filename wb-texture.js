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

var linePos = [];
var lineLength = [];


/**
 * @param {!XMLHttpRequest} xhr
 */
wideboard.Texture.prototype.onDocLoad = function(xhr) {
  var response = /** @type {!ArrayBuffer} */(xhr.response);
  var bytes = new Uint8Array(response);

  var cursor = 0;

  // Skip byte order mark if present.
  if (bytes[0] == 239) {
    cursor = 3;
  }

  var end = bytes.length;
  var lineStart = cursor;

  for (var i = cursor; i < bytes.length; i++) {

    if (bytes[i] == 10) {
      // Hit a \n.
      linePos.push(cursor);
      lineLength.push(i - cursor);
      cursor = i + 1;
    }
  }
  if (cursor < bytes.length) {
    linePos.push(cursor);
    lineLength.push(i - cursor - 1);
  }

  var data = new Uint8Array(this.width * this.height);
  data.set(bytes);
  var blob = new Uint8Array(data.buffer);

  var gl = this.gl;
  gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, this.format,
                this.width, this.height, 0,
                this.format, gl.UNSIGNED_BYTE, blob);
  this.ready = true;
};


/**
 */
wideboard.Texture.prototype.makeLinemap = function() {
  var xhr1 = new XMLHttpRequest();
  xhr1.open('GET', 'wb-app.js');
  xhr1.responseType = 'arraybuffer';

  xhr1.onload = goog.bind(this.onDocLoad, this, xhr1);

  xhr1.send();
};


/**
 * Generates a texture where each texel stores a location in the linemap and
 * the length of the line.
 */
wideboard.Texture.prototype.makeDocmap = function() {
  var gl = this.gl;
  var data = new Uint32Array(this.width * this.height);
  /*
  for (var j = 0; j < this.height; j++) {
    for (var i = 0; i < this.width; i++) {
      data[j * this.width + i] = (lineLength[i] << 24) | linePos[i];
      //data[j * this.width + i] = (255 << 24) | (255 * i);
    }
  }
  */
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
