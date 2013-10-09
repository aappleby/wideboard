goog.provide('wideboard.Uniform');


/**
 * @param {!WebGLRenderingContext} gl
 * @param {string} name
 * @param {number} type
 * @param {WebGLUniformLocation=} opt_location
 * @param {wideboard.Uniform=} opt_parent
 * @constructor
 * @struct
 */
wideboard.Uniform = function(gl, name, type, opt_location, opt_parent) {
  /** @type {!WebGLRenderingContext} */
  this.gl = gl;

  /** @type {string} */
  this.name = name;

  /** @type {number} */
  this.type = type;

  /** @type {WebGLUniformLocation} */
  this.location = opt_location || null;

  /** @type {wideboard.Uniform} */
  this.parent = opt_parent || null;

  /** @type {!Array.<number>} */
  this.value = opt_parent ? opt_parent.value : new Array(16);

  /** @type {boolean} */
  this.dirty = false;

  /** @type {!function(...)} */
  this.set = goog.nullFunction;

  /** @type {!function()} */
  this.glSet = goog.nullFunction;

  switch (this.type) {
  case gl.FLOAT:
    this.set = this.set1f;
    this.glSet = this.glSet1f;
    break;
  case gl.FLOAT_VEC2:
    this.set = this.set2f;
    this.glSet = this.glSet2f;
    break;
  case gl.FLOAT_VEC3:
    this.set = this.set3f;
    this.glSet = this.glSet3f;
    break;
  case gl.FLOAT_VEC4:
    this.set = this.set4f;
    this.glSet = this.glSet4f;
    break;
  case gl.INT:
    this.set = this.set1i;
    this.glSet = this.glSet1i;
    break;
  case gl.SAMPLER_2D:
    this.set = this.set1i;
    this.glSet = this.glSet1i;
    break;
  default:
    goog.asserts.fail('Bad uniform type');
  }
};

/**
 */
wideboard.Uniform.prototype.glSet1f = function() {
  if (this.location) {
    this.gl.uniform1f(this.location, this.value[0]);
    this.dirty = false;
  }
};

/**
 */
wideboard.Uniform.prototype.glSet2f = function() {
  if (this.location) {
    this.gl.uniform2f(this.location, this.value[0], this.value[1]);
    this.dirty = false;
  }
};

/**
 */
wideboard.Uniform.prototype.glSet3f = function() {
  if (this.location) {
    this.gl.uniform3f(this.location, this.value[0], this.value[1], this.value[2]);
    this.dirty = false;
  }
};

/**
 */
wideboard.Uniform.prototype.glSet4f = function() {
  if (this.location) {
    this.gl.uniform4f(this.location, this.value[0], this.value[1], this.value[2], this.value[3]);
    this.dirty = false;
  }
};

/**
 */
wideboard.Uniform.prototype.glSet1i = function() {
  if (this.location) {
    this.gl.uniform1i(this.location, this.value[0]);
    this.dirty = false;
  }
};

/**
 * @param {number} x
 */
wideboard.Uniform.prototype.set1f = function(x) {
  goog.asserts.assert(arguments.length == 1);
  this.value[0] = x;
  this.dirty = true;
};

/**
 * @param {number} x
 * @param {number} y
 */
wideboard.Uniform.prototype.set2f = function(x, y) {
  goog.asserts.assert(arguments.length == 2);
  this.value[0] = x;
  this.value[1] = y;
  this.dirty = true;
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
wideboard.Uniform.prototype.set3f = function(x, y, z) {
  goog.asserts.assert(arguments.length == 3);
  this.value[0] = x;
  this.value[1] = y;
  this.value[2] = z;
  this.dirty = true;
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} w
 */
wideboard.Uniform.prototype.set4f = function(x, y, z, w) {
  goog.asserts.assert(arguments.length == 4);
  this.value[0] = x;
  this.value[1] = y;
  this.value[2] = z;
  this.value[3] = w;
  this.dirty = true;
};

/**
 * @param {number} x
 */
wideboard.Uniform.prototype.set1i = function(x) {
  goog.asserts.assert(arguments.length == 1);
  this.value[0] = x;
  this.dirty = true;
};
