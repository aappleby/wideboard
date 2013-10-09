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


function glStringToType(gl, t) {
  switch (t) {
  case 'float': return gl.FLOAT;
  case 'vec2': return gl.FLOAT_VEC2;
  case 'vec3': return gl.FLOAT_VEC3;
  case 'vec4': return gl.FLOAT_VEC4;
  case 'mat2': return gl.FLOAT_MAT2;
  case 'mat3': return gl.FLOAT_MAT3;
  case 'mat4': return gl.FLOAT_MAT4;
  case 'sampler2D': return gl.SAMPLER_2D;
  default: goog.asserts.fail('Unknown GLSL type'); return -1;
  }
}



/**
 */
wideboard.Shader.prototype.init = function() {
  var xhr1 = new XMLHttpRequest();
  xhr1.open('GET', this.filename, false);
  xhr1.send();
  var source = xhr1.responseText;

  var gl = this.gl;
  goog.asserts.assert(gl);

  var tokenMatch = /\w+/g;
  var lines = source.split('\n');
  for (var i = 0; i < lines.length; i++) {
    // Skip commented-out lines.
    if (lines[i][0] == '/') continue;

    var tokens = lines[i].match(tokenMatch);
    if (!tokens) continue;
    if (tokens.length < 3) continue;

    if (tokens[0] == 'uniform') {
      var uniformType = tokens[1];
      var uniformName = tokens[2];
      console.log('Uniform ' + uniformType + ' ' + uniformName + ' ' + glStringToType(gl, uniformType));

      var globalUniform = this.globalUniforms[uniformName];
      var uniform = new wideboard.Uniform(gl, uniformName, glStringToType(gl, uniformType), null, globalUniform);
      this.uniforms[uniformName] = uniform;
      this.uniformList.push(uniform);
    }

    if (tokens[0] == 'attribute') {
      var attributeType = tokens[1];
      var attributeName = tokens[2];
      console.log('Attribute ' + attributeType + ' ' + attributeName + ' ' + glStringToType(gl, attributeType));

      var attribute = new wideboard.Attribute(gl, attributeName, glStringToType(gl, attributeType));
      this.attributes[attributeName] = attribute;
      this.attributeList.push(attribute);
    }
  }

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
      var attribute = this.attributes[attribInfo.name];
      goog.asserts.assert(attribute);
      attribute.location = location;
    }
  }

  goog.global.console.log('Uniforms:');
  var uniformCount = /** @type {number} */(gl.getProgramParameter(this.glProgram, gl.ACTIVE_UNIFORMS));
  for (var i = 0; i < uniformCount; i++) {
    var uniformInfo = gl.getActiveUniform(this.glProgram, i);
    var location = gl.getUniformLocation(this.glProgram, uniformInfo.name);
    if (goog.isDefAndNotNull(location)) {
      goog.global.console.log(uniformInfo);
      var uniform = this.uniforms[uniformInfo.name];
      goog.asserts.assert(uniform);
      uniform.location = location;
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
