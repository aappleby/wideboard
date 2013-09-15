goog.provide('wideboard.Uniform');


/**
 * @param {!wideboard.Shader} shader
 * @param {string} name
 * @constructor
 * @struct
 */
wideboard.Uniform = function(shader, name) {
  /** @type {!WebGLRenderingContext} */
  this.gl = shader.gl;

  /** @type {string} */
  this.name = name;

  /** @type {WebGLUniformLocation} */
  this.location = this.gl.getUniformLocation(shader.program, this.name);
};


/**
 * @param {number} x
 */
wideboard.Uniform.prototype.set1f = function(x) {
  if (this.location) {
    this.gl.uniform1f(this.location, x);
  }
};

/**
 * @param {number} x
 * @param {number} y
 */
wideboard.Uniform.prototype.set2f = function(x, y) {
  if (this.location) {
    this.gl.uniform2f(this.location, x, y);
  }
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
wideboard.Uniform.prototype.set3f = function(x, y, z) {
  if (this.location) {
    this.gl.uniform3f(this.location, x, y, z);
  }
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} w
 */
wideboard.Uniform.prototype.set4f = function(x, y, z, w) {
  if (this.location) {
    this.gl.uniform4f(this.location, x, y, z, w);
  }
};
