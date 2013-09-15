goog.provide('wideboard.Shader');



/**
 * Simple shader class.
 * @param {!WebGLRenderingContext} gl
 * @param {string} filename
 * @param {!Array.<string>} attribList
 * @param {!Array.<string>} uniformList
 * @constructor
 * @struct
 */
wideboard.Shader = function(gl, filename, attribList, uniformList) {
  /** @type {WebGLRenderingContext} */
  this.gl = gl;

  /** @type {string} */
  this.filename = filename;

  /** @type {WebGLShader} */
  this.vshader = null;

  /** @type {WebGLShader} */
  this.fshader = null;

  /** @type {WebGLProgram} */
  this.program = null;

  /** @type {!Array.<string>} */
  this.attribList = attribList;

  /** @type {!Object.<string, number>} */
  this.attribMap = {};

  /** @type {!Array.<string>} */
  this.uniformList = uniformList;

  /** @type {!Object.<string, WebGLUniformLocation>} */
  this.uniformMap = {};

  /** @type {boolean} */
  this.ready = false;
};


/**
 * Kicks off XHRs to load the vertex and fragment shader, compiling
 * and linking them when the requests come back.
 */
wideboard.Shader.prototype.asyncLoad = function() {
  var self = this;

  var xhr1 = new XMLHttpRequest();
  xhr1.onreadystatechange = function() {
    if (this.readyState == 4) self.sourceLoaded(this.responseText);
  };
  xhr1.open('GET', this.filename, true);
  xhr1.send();
};


/**
 * When the vertex shader request returns, creates and compiles the shader.
 * Links the program if the fragment shader is also ready.
 * @param {string} source
 */
wideboard.Shader.prototype.sourceLoaded = function(source) {
  var gl = this.gl;

  var prefix = '#ifdef _FRAGMENT_\n' +
               '#define attribute //attribute\n' +
               '#endif\n' +
               'precision mediump float;\n';

  this.vshader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(this.vshader, '#define _VERTEX_\n' + prefix + source);
  gl.compileShader(this.vshader);

  if (!gl.getShaderParameter(this.vshader, gl.COMPILE_STATUS)) {
    goog.global.console.log('Fragment shader compile failed');
  }

  this.fshader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(this.fshader, '#define _FRAGMENT_\n' + prefix + source);
  gl.compileShader(this.fshader);

  if (!gl.getShaderParameter(this.fshader, gl.COMPILE_STATUS)) {
    goog.global.console.log('Fragment shader compile failed');
  }

  this.program = gl.createProgram();
  gl.attachShader(this.program, this.vshader);
  gl.attachShader(this.program, this.fshader);

  for (var i = 0; i < this.attribList.length; i++) {
    gl.bindAttribLocation(this.program, i, this.attribList[i]);
    this.attribMap[this.attribList[i]] = i;
  }

  gl.linkProgram(this.program);

  if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
    goog.global.console.log('Shader link failed!');
  } else {
    goog.global.console.log('Shader ' + this.filename + ' linked');
    this.ready = true;
  }

  gl.useProgram(this.program);

  for (var i = 0; i < this.uniformList.length; i++) {
    var location = gl.getUniformLocation(this.program, this.uniformList[i]);
    this.uniformMap[this.uniformList[i]] = location;
  }
};


/**
 * Binds this shader to the WebGL context.
 */
wideboard.Shader.prototype.bind = function() {
  if (this.ready) {
    this.gl.useProgram(this.program);
    this.gl.enableVertexAttribArray(0);
  }
};


/**
 * @param {wideboard.Buffer} buffer
 */
wideboard.Shader.prototype.bindBuffer = function(buffer) {
  if (!buffer) return;
  var gl = this.gl;
  var slot = this.attribMap[buffer.name];
  gl.enableVertexAttribArray(slot);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
  gl.vertexAttribPointer(slot, buffer.size, buffer.type, false, buffer.stride, 0);
};


/**
 * @param {string} name
 * @param {number} x
 * @param {number} y
 */
wideboard.Shader.prototype.setUniform2f = function(name, x, y) {
  var loc = this.uniformMap[name];
  if (loc) {
    this.gl.uniform2f(loc, x, y);
  }
};


/**
 * @param {string} name
 * @param {number} x
 */
wideboard.Shader.prototype.setUniform1i = function(name, x) {
  var loc = this.uniformMap[name];
  if (loc) {
    this.gl.uniform1i(loc, x);
  }
};
