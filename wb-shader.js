goog.provide('wideboard.Shader');

goog.require('wideboard.Attribute');
goog.require('wideboard.Uniform');



/**
 * Simple shader class.
 * @param {!WebGLRenderingContext} gl
 * @param {string} filename
 * @param {Object.<string, !wideboard.Uniform>=} opt_uniforms
 * @constructor
 * @struct
 */
wideboard.Shader = function(gl, filename, opt_uniforms) {
  /** @type {WebGLRenderingContext} */
  this.gl = gl;

  /** @type {string} */
  this.filename = filename;

  /** @type {!WebGLShader} */
  this.vshader = gl.createShader(gl.VERTEX_SHADER);

  /** @type {!WebGLShader} */
  this.fshader = gl.createShader(gl.FRAGMENT_SHADER);

  /** @type {!WebGLProgram} */
  this.glProgram = gl.createProgram();

  /** @type {!Object.<string, !wideboard.Attribute>} */
  this.attributes = {};

  /** @type {!Array.<!wideboard.Attribute>} */
  this.attributeList = [];

  /** @type {!Object.<string, !wideboard.Uniform>} */
  this.globalUniforms = opt_uniforms || {};

  /** @type {!Object.<string, !wideboard.Uniform>} */
  this.uniforms = {};

  /** @type {!Array.<!wideboard.Uniform>} */
  this.uniformList = [];

  /** @type {boolean} */
  this.ready = false;

  this.init();
};


/**
 */
wideboard.Shader.prototype.init = function() {
  var xhr1 = new XMLHttpRequest();
  xhr1.open('GET', this.filename, false);
  xhr1.send();
  var source = xhr1.responseText;

  var gl = this.gl;

  var prefix = '#ifdef _FRAGMENT_\n' +
               '#define attribute //attribute\n' +
               '#endif\n' +
               'precision mediump float;\n';

  gl.shaderSource(this.vshader, '#define _VERTEX_\n' + prefix + source);
  gl.compileShader(this.vshader);

  if (!gl.getShaderParameter(this.vshader, gl.COMPILE_STATUS)) {
    goog.global.console.log('Fragment shader compile failed');
  }

  gl.shaderSource(this.fshader, '#define _FRAGMENT_\n' + prefix + source);
  gl.compileShader(this.fshader);

  if (!gl.getShaderParameter(this.fshader, gl.COMPILE_STATUS)) {
    goog.global.console.log('Fragment shader compile failed');
  }

  gl.attachShader(this.glProgram, this.vshader);
  gl.attachShader(this.glProgram, this.fshader);
  gl.linkProgram(this.glProgram);

  if (!gl.getProgramParameter(this.glProgram, gl.LINK_STATUS)) {
    goog.global.console.log('Shader link failed!');
  } else {
    goog.global.console.log('Shader ' + this.filename + ' linked');
    this.ready = true;
  }

  gl.useProgram(this.glProgram);

  goog.global.console.log('Attributes:');
  var attribCount = /** @type {number} */(gl.getProgramParameter(this.glProgram, gl.ACTIVE_ATTRIBUTES));
  for (var i = 0; i < attribCount; i++) {
    var attribInfo = gl.getActiveAttrib(this.glProgram, i);
    var location = gl.getAttribLocation(this.glProgram, attribInfo.name);
    if (goog.isDefAndNotNull(location)) {
      goog.global.console.log(attribInfo);
      var attribute = new wideboard.Attribute(gl, attribInfo.name, attribInfo.type, location);
      this.attributes[attribInfo.name] = attribute;
      this.attributeList.push(attribute);
    }
  }

  goog.global.console.log('Uniforms:');
  var uniformCount = /** @type {number} */(gl.getProgramParameter(this.glProgram, gl.ACTIVE_UNIFORMS));
  for (var i = 0; i < uniformCount; i++) {
    var uniformInfo = gl.getActiveUniform(this.glProgram, i);
    var location = gl.getUniformLocation(this.glProgram, uniformInfo.name);
    if (goog.isDefAndNotNull(location)) {
      goog.global.console.log(uniformInfo);
      var globalUniform = this.globalUniforms[uniformInfo.name];
      var uniform = new wideboard.Uniform(gl, uniformInfo.name, uniformInfo.type, location, globalUniform);
      this.uniforms[uniformInfo.name] = uniform;
      this.uniformList.push(uniform);
    }
  }
};


/**
 */
wideboard.Shader.prototype.setUniforms = function() {
  var uniforms = this.uniformList;
  for (var i = 0; i < uniforms.length; i++) {
    uniforms[i].glSet();
  }
};

/**
 */
wideboard.Shader.prototype.bind = function() {
  this.gl.useProgram(this.glProgram);
  this.setUniforms();
};
