/**
 * Handles context creation/destruction, might do state tracking later...
 */
goog.provide('wideboard.Context');



/**
 * @param {!HTMLCanvasElement} canvas
 * @constructor
 * @struct
 */
wideboard.Context = function(canvas) {
  /** @type {!HTMLCanvasElement} */
  this.canvas = canvas;

  /** @private {WebGLRenderingContext} */
  this.gl_ = null;

  /** @type {Object} */
  this.instanceExtension = null;

  /** @type {number} */
  this.frameCounter = 0;

  /** @type {WebGLProgram} */
  this.activeProgram = null;

  /** @type {WebGLBuffer} */
  this.activeArrayBuffer = null;

  /** @type {WebGLBuffer} */
  this.activeIndexBuffer = null;

  /** @type {!Array.<WebGLTexture>} */
  this.activeTextures = new Array(32);

  this.init();
};


/**
 * @return {!WebGLRenderingContext}
 */
wideboard.Context.prototype.getGl = function() {
  return /** @type {!WebGLRenderingContext} */(this.gl_);
};


/**
 */
wideboard.Context.prototype.init = function() {
  // Create the GL context & kick off the render loop.
  var options = {
    alpha: true,
    depth: true,
    stencil: false,
    antialias: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true
  };

  this.gl_ = /** @type {WebGLRenderingContext} */(this.canvas.getContext('webgl', options));
  if (!this.gl_) {
    goog.asserts.fail('Creating WebGL context failed');
    return;
  }

  this.installExtension('ANGLE_instanced_arrays');
};


/**
 * @param {string} extensionName
 */
wideboard.Context.prototype.installExtension = function(extensionName) {
  var extension = this.gl_.getExtension(extensionName);

  if (extension) {
    for (var name in extension) {
      var val = extension[name];
      if (val && typeof(val) == 'function') {
        this.gl_[name] = goog.bind(val, extension);
        console.log(name);
      } else {
        this.gl_[name] = val;
      }
    }
    console.log('Extension ' + extensionName + ' installed');
  } else {
    console.log('Extension ' + extensionName + ' not found');
  }
};

/**
 */
wideboard.Context.prototype.beginFrame = function() {
  this.frameCounter++;
};


/**
 */
wideboard.Context.prototype.endFrame = function() {
};


/**
 * @param {!WebGLProgram} glProgram
 */
/*
wideboard.Context.prototype.bindProgram = function(glProgram) {
  if (this.activeProgram == glProgram) {
    return;
  }
  this.gl.useProgram(glProgram);
  this.activeProgram = glProgram;
};
*/


/**
 * @param {!WebGLBuffer} glBuffer
 */
/*
wideboard.Context.prototype.bindIndexBuffer = function(glBuffer) {
  if (this.activeIndexBuffer == glBuffer) {
    return;
  }
  this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, glBuffer);
  this.activeIndexBuffer = glBuffer;
};
*/


/**
 * @param {!WebGLBuffer} glBuffer
 */
/*
wideboard.Context.prototype.bindArrayBuffer = function(glBuffer) {
  if (this.activeArrayBuffer == glBuffer) {
    return;
  }
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, glBuffer);
  this.activeArrayBuffer = glBuffer;
};
*/


/**
 * @param {number} slot
 * @param {!WebGLTexture} glTexture
 */
/*
wideboard.Context.prototype.bindTexture = function(slot, glTexture) {
  if (this.activeTextures[slot] == glTexture) {
    return;
  }
  this.gl.activeTexture(this.gl.TEXTURE0 + slot);
  this.gl.bindTexture(this.gl.TEXTURE_2D, glTexture);
  this.activeTextures[slot] = glTexture;
};
*/
