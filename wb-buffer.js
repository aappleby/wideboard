goog.provide('wideboard.Buffer');



/**
 * @param {!WebGLRenderingContext} gl
 * @param {string} name
 * @param {number} mode
 * @constructor
 * @struct
 */
wideboard.Buffer = function(gl, name, mode) {
  /** @type {!WebGLRenderingContext} */
  this.gl = gl;

  /** @type {string} */
  this.name = name;

  /** @type {number} */
  this.mode = mode;

  /** @type {number} */
  this.type = -1;

  /** @type {number} */
  this.size = -1;

  /** @type {number} */
  this.length = -1;

  /** @type {boolean} */
  this.indices = false;

  /** @type {WebGLBuffer} */
  this.buffer = null;

  /** @type {number} */
  this.primitiveType = -1;

  /** @type {Float32Array} */
  this.data = null;

  /** @type {number} */
  this.cursor = -1;

  /** @type {number} */
  this.stride = -1;
};


/**
 * @param {!Array.<number>} data
 */
wideboard.Buffer.prototype.initVec2 = function(data) {
  var gl = this.gl;
  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), this.mode);
  this.type = gl.FLOAT;
  this.size = 2;
  this.length = data.length / 2;
  this.stride = 8;
};


/**
 * @param {!Array.<number>} data
 */
wideboard.Buffer.prototype.initVec3 = function(data) {
  var gl = this.gl;
  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), this.mode);
  this.type = gl.FLOAT;
  this.size = 3;
  this.length = data.length / 3;
  this.stride = 12;
};


/**
 * @param {!Array.<number>} data
 */
wideboard.Buffer.prototype.initVec4 = function(data) {
  var gl = this.gl;
  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), this.mode);
  this.type = gl.FLOAT;
  this.size = 4;
  this.length = data.length / 4;
  this.stride = 16;
};


/**
 * @param {!Array.<number>} data
 */
wideboard.Buffer.prototype.initIndex8 = function(data) {
  var gl = this.gl;
  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(data), this.mode);
  this.type = gl.UNSIGNED_BYTE;
  this.size = 1;
  this.length = data.length;
  this.indices = true;
};


/**
 * @param {number} size
 * @param {number} capacity
 */
wideboard.Buffer.prototype.initDynamic = function(size, capacity) {
  var gl = this.gl;
  this.buffer = gl.createBuffer();
  this.data = new Float32Array(size * capacity);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.DYNAMIC_DRAW);
  this.type = gl.FLOAT;
  this.size = size;
  this.length = capacity;
  this.cursor = 0;
};


/**
 */
wideboard.Buffer.prototype.resetCursor = function() {
  this.cursor = 0;
};


/**
 */
wideboard.Buffer.prototype.dispose = function() {
  var gl = this.gl;
  gl.deleteBuffer(this.buffer);
  this.buffer = null;
  this.type = -1;
  this.size = -1;
  this.length = -1;
};


/**
 * @param {number=} attribute
 */
wideboard.Buffer.prototype.bind = function(attribute) {
  var gl = this.gl;
  if (this.indices) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
  } else {
    goog.asserts.assert(goog.isDef(attribute));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.vertexAttribPointer(attribute, this.size, this.type, false, this.stride, 0);
  }
};
