goog.provide('wideboard.Attribute');


/**
 * @param {!WebGLRenderingContext} gl
 * @param {string} name
 * @param {number} type
 * @param {number} location
 * @constructor
 * @struct
 */
wideboard.Attribute = function(gl, name, type, location) {
  /** @type {!WebGLRenderingContext} */
  this.gl = gl;

  /** @type {string} */
  this.name = name;

  /** @type {number} */
  this.type = type;

  /** @type {number} */
  this.location = location;
};

/**
 * @param {!WebGLBuffer} buffer
 * @param {number} stride
 * @param {number} offset
 */
wideboard.Attribute.prototype.set1f = function(buffer, stride, offset) {
  var gl = this.gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(this.location);
  gl.vertexAttribPointer(this.location, 1, gl.FLOAT, false, stride, offset);
};

/**
 * @param {!WebGLBuffer} buffer
 * @param {number} stride
 * @param {number} offset
 */
wideboard.Attribute.prototype.set2f = function(buffer, stride, offset) {
  var gl = this.gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(this.location);
  gl.vertexAttribPointer(this.location, 2, gl.FLOAT, false, stride, offset);
};

/**
 * @param {!WebGLBuffer} buffer
 * @param {number} stride
 * @param {number} offset
 */
wideboard.Attribute.prototype.set3f = function(buffer, stride, offset) {
  var gl = this.gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(this.location);
  gl.vertexAttribPointer(this.location, 3, gl.FLOAT, false, stride, offset);
};

/**
 * @param {!WebGLBuffer} buffer
 * @param {number} stride
 * @param {number} offset
 */
wideboard.Attribute.prototype.set4f = function(buffer, stride, offset) {
  var gl = this.gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(this.location);
  gl.vertexAttribPointer(this.location, 4, gl.FLOAT, false, stride, offset);
};
