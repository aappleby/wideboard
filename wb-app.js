goog.provide('wideboard.App');

goog.require('goog.math.Vec2');
goog.require('goog.string');
goog.require('goog.webgl');
goog.require('wideboard.Buffer');
goog.require('wideboard.Camera');
goog.require('wideboard.Context');
goog.require('wideboard.Controls');
goog.require('wideboard.Document');
goog.require('wideboard.Draw');
goog.require('wideboard.Grid');
goog.require('wideboard.Librarian');
goog.require('wideboard.Linemap');
goog.require('wideboard.Shader');
goog.require('wideboard.Shelf');
goog.require('wideboard.Texture');



var allFiles = [
  //'warandpeace.txt',
  'index.html',
  'simple.glsl',
  'text1.glsl',
  'texture.glsl',
  'wb-app.js',
  'wb-attribute.js',
  'wb-bitvec.js',
  'wb-buffer.js',
  'wb-camera.js',
  'wb-context.js',
  'wb-controls.js',
  'wb-document.js',
  'wb-dragtarget.js',
  'wb-draw.js',
  'wb-file.js',
  'wb-grid.js',
  'wb-librarian.js',
  'wb-linemap.js',
  'wb-scrap.js',
  'wb-shader.js',
  'wb-shelf.js',
  'wb-texture.js',
  'wb-uniform.js',
  'wb-util.js'
];



/**
 * @constructor
 * @struct
 */
wideboard.App = function() {
  /** @type {string} */
  this.name = 'Wideboard';

  /** @type {wideboard.Context} */
  this.context = null;

  /** @type {Object} */
  this.extension = null;

  /** @type {number} */
  this.frameCounter = 0;

  /** @type {number} */
  this.lastFrameTime = performance.now();

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

  /** @type {wideboard.Shader} */
  this.textShader = null;

  /** @type {wideboard.Texture} */
  this.texture = null;

  /** @type {wideboard.Librarian} */
  this.librarian = null;

  /** @type {wideboard.Texture} */
  this.glyphmap = null;

  /** @type {wideboard.Uniform} */
  this.screenUniform = null;

  /** @type {wideboard.Controls} */
  this.controls = new wideboard.Controls();

  /** @type {wideboard.Draw} */
  this.debugDraw = null;

  /** @type {wideboard.Grid} */
  this.grid = null;

  /** @type {wideboard.Camera} */
  this.camera = null;

  /** @type {function(number)} */
  this.frameCallback = goog.bind(this.onRequestAnimationFrame, this);

  /** @type {!Object.<string, !wideboard.Uniform>} */
  this.uniforms = {};

  this.pickX = 0;
  this.pickY = 0;
};


/**
 * @param {number} delta
 */
wideboard.App.prototype.update = function(delta) {
  this.camera.update(delta);

  var lerpFactor = 1.0 - Math.pow(0.1, delta / 80);
  this.pickX += (this.controls.mouseDownX - this.pickX) * lerpFactor;
  this.pickY += (this.controls.mouseDownY - this.pickY) * lerpFactor;
};


/**
 * Handles pre-draw bookkeeping.
 * @return {boolean} True if we're OK to render.
 */
wideboard.App.prototype.beginFrame = function() {
  if (!this.context) return false;

  if (!this.simpleShader) return false;
  if (!this.simpleShader.ready) return false;
  if (!this.texShader) return false;
  if (!this.texShader.ready) return false;

  var canvas = this.context.canvas;
  if ((canvas.width != canvas.clientWidth) ||
      (canvas.height != canvas.clientHeight)) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  return true;
};

//======================================================================================================================

/**
 * Main render function.
 */
wideboard.App.prototype.render = function() {
  var canvas = this.context.canvas;
  var gl = this.context.getGl();

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.3, 0.3, 0.4, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var view = this.camera.viewSnap;

  var canvasLeft = -Math.round(canvas.width / 2.0);
  var canvasTop = -Math.round(canvas.height / 2.0);

  this.uniforms['screenSize'].set(canvasLeft, canvasTop, 1.0 / canvas.width, 1.0 / canvas.height);
  this.uniforms['modelToWorld'].set(0, 0, 1, 1);
  this.uniforms['worldToView'].set(-view.origin.x, -view.origin.y,
                                   view.scale, view.scale);

  this.grid.draw();
  gl.useProgram(this.simpleShader.glProgram);
  this.uniforms['modelToWorld'].set(0, 0, 1, 1);
  this.simpleShader.setUniforms();
  this.debugDraw.draw(this.simpleShader);
  gl.useProgram(null);

  /*
  if (this.posBuffer && this.colBuffer && this.indexBuffer) {
    this.uniforms['modelToWorld'].set(-50, 50, 32, 32);

    var shader = this.simpleShader;
    var uniforms = shader.uniforms;
    var attributes = shader.attributes;

    gl.useProgram(shader.glProgram);
    shader.setUniforms();

    attributes['vpos'].set2f(this.posBuffer.glBuffer, 0, 0);
    attributes['vcol'].set4f(this.colBuffer.glBuffer, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.glBuffer);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
  }
  */

  if (this.posBuffer && this.texBuffer && this.indexBuffer) {

    var shader = this.texShader;

    gl.useProgram(shader.glProgram);

    shader.uniforms['texture'].set1i(0);
    shader.attributes['vpos'].set2f(this.posBuffer.glBuffer, 8, 0);
    shader.attributes['vtex'].set2f(this.texBuffer.glBuffer, 8, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.glBuffer);

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, this.librarian.linemap.texture.glTexture);
    this.uniforms['modelToWorld'].set(0, -48, 32, 32);
    shader.setUniforms();
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

    gl.disable(gl.BLEND);
    gl.bindTexture(gl.TEXTURE_2D, this.librarian.shelf.texture.glTexture);
    this.uniforms['modelToWorld'].set(48, -48, 32, 32);
    shader.setUniforms();
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
  }

  if (this.posBuffer && this.texBuffer && this.indexBuffer) {

    var shader = this.textShader;

    gl.useProgram(shader.glProgram);

    shader.uniforms['docmap'].set1i(0);
    shader.uniforms['docmapSize'].set2f(this.librarian.shelf.width, this.librarian.shelf.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.librarian.shelf.texture.glTexture);

    shader.uniforms['linemap'].set1i(1);
    shader.uniforms['linemapSize'].set2f(this.librarian.linemap.width, this.librarian.linemap.height);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.librarian.linemap.texture.glTexture);

    shader.uniforms['glyphmap'].set1i(2);
    shader.uniforms['glyphmapSize'].set2f(this.glyphmap.width, this.glyphmap.height);
    shader.uniforms['glyphSize'].set2f(6, 14);
    shader.uniforms['cellSize'].set2f(8, 16);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.glyphmap.glTexture);


    shader.attributes['vpos'].set2f(this.posBuffer.glBuffer, 8, 0);
    shader.attributes['vtex'].set2f(this.texBuffer.glBuffer, 8, 0);

    //----------

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.glBuffer);

    for (var i = 0; i < this.librarian.documents.length; i++) {
      var document = this.librarian.documents[i];

      this.uniforms['modelToWorld'].set(800 * i, 0, 1, 1);
      shader.uniforms['docSize'].set2f(120, document.linePos.length);
      shader.uniforms['docScroll'].set1f(document.shelfPos);
      shader.setUniforms();
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
    }
  }
};

//======================================================================================================================

/**
 *
 */
wideboard.App.prototype.endFrame = function() {
};

//======================================================================================================================

/**
 * requestAnimationFrame callback.
 * @param {number} time
 */
wideboard.App.prototype.onRequestAnimationFrame = function(time) {
  var delta = time - this.lastFrameTime;
  this.frameCounter++;

  this.update(delta);

  if (this.beginFrame()) {
    this.render();
    this.endFrame();
  }

  //goog.asserts.assert(!gl.getError());

  this.lastFrameTime = time;

  window.requestAnimationFrame(this.frameCallback);
};

//======================================================================================================================

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

  var context = new wideboard.Context(canvas);
  if (!context) return;
  this.context = context;

  var gl = context.getGl();

  // Hook the controls up.
  this.controls.install(canvas);

  this.camera = new wideboard.Camera(gl);
  this.controls.addTarget(this.camera);

  this.debugDraw = new wideboard.Draw(gl);

  this.grid = new wideboard.Grid(this.debugDraw, this.camera);

  this.posBuffer = new wideboard.Buffer(gl, 'vpos', gl.STATIC_DRAW);
  this.posBuffer.initVec2([0, 0, 0, 1, 1, 1, 1, 0]);

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

  this.texture = new wideboard.Texture(gl, 128, 128, gl.RGBA, true);
  this.texture.makeNoise();

  this.glyphmap = new wideboard.Texture(gl, 256, 256, gl.LUMINANCE, true);
  this.glyphmap.load('terminus.bmp');

  // Shaders

  this.uniforms['screenSize'] = new wideboard.Uniform(gl, 'screenSize', gl.FLOAT_VEC4);
  this.uniforms['modelToWorld'] = new wideboard.Uniform(gl, 'modelToWorld', gl.FLOAT_VEC4);
  this.uniforms['worldToView'] = new wideboard.Uniform(gl, 'worldToView', gl.FLOAT_VEC4);

  this.textShader = new wideboard.Shader(gl, 'text1.glsl', this.uniforms);

  this.simpleShader = new wideboard.Shader(gl, 'simple.glsl', this.uniforms);
  this.texShader = new wideboard.Shader(gl, 'texture.glsl', this.uniforms);

  // Librarian
  this.librarian = new wideboard.Librarian(context);
  this.librarian.loadFiles(allFiles);

  window.requestAnimationFrame(this.frameCallback);
};

goog.exportSymbol('wideboard.App', wideboard.App);
