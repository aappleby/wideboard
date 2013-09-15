goog.provide('wideboard.App');

goog.require('goog.math.Vec2');
goog.require('goog.string');
goog.require('goog.webgl');
goog.require('wideboard.Buffer');
goog.require('wideboard.Controls');
goog.require('wideboard.Draw');
goog.require('wideboard.Shader');
goog.require('wideboard.Texture');



/**
 * @constructor
 * @struct
 */
wideboard.App = function() {
  /** @type {string} */
  this.name = 'Wideboard';

  /** @type {HTMLCanvasElement} */
  this.canvas = null;

  /** @type {WebGLRenderingContext} */
  this.context = null;

  /** @type {Object} */
  this.extension = null;

  /** @type {number} */
  this.requestID = 0;

  /** @type {number} */
  this.frameCounter = 0;

  /** @type {wideboard.Buffer} */
  this.posBuffer = null;

  /** @type {wideboard.Buffer} */
  this.colBuffer = null;

  /** @type {wideboard.Buffer} */
  this.texBuffer = null;

  /** @type {wideboard.Buffer} */
  this.indexBuffer = null;

  /** @type {wideboard.Shader} */
  this.simpleShader = null;

  /** @type {wideboard.Shader} */
  this.texShader = null;

  /** @type {wideboard.Texture} */
  this.texture = null;

  /** @type {wideboard.Uniform} */
  this.screenUniform = null;

  /** @type {wideboard.Controls} */
  this.controls = new wideboard.Controls();

  /** @type {wideboard.Draw} */
  this.draw = null;

  /** @type {function(number)} */
  this.renderCallback = goog.bind(this.render, this);
};


/**
 * Main render loop, called by requestAnimationFrame.
 * @param {number} time
 */
wideboard.App.prototype.render = function(time) {
  if (!this.simpleShader || !this.simpleShader.ready) {
    window.requestAnimationFrame(this.renderCallback);
    return;
  }

  this.frameCounter++;

  var canvas = this.canvas;
  if ((canvas.width != canvas.clientWidth) || (canvas.height != canvas.clientHeight)) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  var gl = this.context;

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.1, 0.1, 0.2, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);

  this.simpleShader.bind();
  this.simpleShader.setUniform2f('screen', canvas.width, canvas.height);
  this.simpleShader.setUniform2f('offset', 200, 50); //this.controls.mouseDownX, this.controls.mouseDownY);
  this.simpleShader.bindBuffer(this.posBuffer);
  this.simpleShader.bindBuffer(this.colBuffer);
  this.indexBuffer.bind();
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

  this.texShader.bind();
  this.texShader.setUniform2f('screen', canvas.width, canvas.height);
  this.texShader.setUniform2f('offset', 100, 50);
  this.texShader.setUniform1i('texture', 0);
  this.texShader.bindBuffer(this.posBuffer);
  this.texShader.bindBuffer(this.texBuffer);
  this.indexBuffer.bind();
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

  var draw = this.draw;
  draw.setColor(1, 0, 0);
  draw.moveTo(100 + Math.sin(time / 1000) * 100, 100);
  draw.lineTo(200, 200);
  draw.setColor(0, 1, 0);
  draw.lineTo(300, 200);
  draw.setColor(0, 0, 1);
  draw.moveTo(500, 40);
  draw.lineTo(500, 400);
  draw.endFrame();

  goog.asserts.assert(!gl.getError());
  window.requestAnimationFrame(this.renderCallback);
};


/**
 * Entry point for the Wideboard app.
 * @param {string} canvasElementId The ID of the canvas to run in.
 */
wideboard.App.prototype.run = function(canvasElementId) {
  var canvas = /** @type {!HTMLCanvasElement} */(document.getElementById(canvasElementId));

  if (!canvas) {
    goog.global.console.log('No canvas element!');
    return;
  }

  // Hook the controls up.
  this.controls.install(canvas);

  // Create the GL context & kick off the render loop.
  this.canvas = canvas;
  var options = {
    alpha: true,
    depth: true,
    stencil: false,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false
  };

  this.context = /** @type {WebGLRenderingContext} */(this.canvas.getContext('webgl', options));
  if (!this.context) {
    goog.global.console.log('Creating WebGL context failed');
    return;
  }

  this.extension = this.context.getExtension('ANGLE_instanced_arrays');

  var gl = this.context;

  this.draw = new wideboard.Draw(gl);
  this.draw.init();

  this.posBuffer = new wideboard.Buffer(gl, 'vpos', gl.STATIC_DRAW);
  this.posBuffer.initVec2([0, 0, 0, 64, 64, 64, 64, 0]);

  this.colBuffer = new wideboard.Buffer(gl, 'vcol', gl.STATIC_DRAW);
  this.colBuffer.initVec4([
    0.5, 0, 0.5, 1,
    1, 0.5, 0, 1,
    0.5, 1, 0.5, 1,
    0, 0.5, 1, 1
  ]);

  this.texBuffer = new wideboard.Buffer(gl, 'vtex', gl.STATIC_DRAW);
  this.texBuffer.initVec2([0, 0, 0, 1, 1, 1, 1, 0]);

  this.indexBuffer = new wideboard.Buffer(gl, 'indices', gl.STATIC_DRAW);
  this.indexBuffer.initIndex8([0, 1, 2, 0, 2, 3]);

  this.texture = new wideboard.Texture(gl, 64, 64);
  this.texture.makeNoise();

  this.simpleShader = new wideboard.Shader(gl, 'simple.glsl', ['vpos', 'vcol'], ['screen', 'offset']);
  this.simpleShader.asyncLoad();

  this.texShader = new wideboard.Shader(gl, 'texture.glsl', ['vpos', 'vtex'], ['screen', 'offset', 'texture']);
  this.texShader.asyncLoad();

  window.requestAnimationFrame(this.renderCallback);
};

goog.exportSymbol('wideboard.App', wideboard.App);
