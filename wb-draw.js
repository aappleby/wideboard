/**
 * Simple immediate-mode debug draw support.
 */

goog.provide('wideboard.Draw');

goog.require('wideboard.Shader');



/**
 * @param {!WebGLRenderingContext} gl
 * @constructor
 * @struct
 */
wideboard.Draw = function(gl) {
  /** @type {!WebGLRenderingContext} */
  this.gl = gl;

  /**
   * The buffer we're currently filling.
   * @type {wideboard.Buffer}
   */
  this.currentBuffer = null;

  /**
   * Pool of empty buffers.
   * @type {!Array.<!wideboard.Buffer>}
   */
  this.bufferPool = [];

  /**
   * List of full buffers.
   * @type {!Array.<!wideboard.Buffer>}
   */
  this.fullBuffers = [];

  /**
   * The pen X position.
   * @type {number}
   */
  this.penX = -1;

  /**
   * The pen Y position.
   * @type {number}
   */
  this.penY = -1;

  /**
   * The pen Z position.
   * @type {number}
   */
  this.penZ = -1;

  /**
   * The pen red component.
   * @type {number}
   */
  this.penR = 1;

  /**
   * The pen green component.
   * @type {number}
   */
  this.penG = 1;

  /**
   * The pen blue component.
   * @type {number}
   */
  this.penB = 1;

  /**
   * The pen alpha component.
   * @type {number}
   */
  this.penA = 1;

  /**
   * The current pen path.
   * @type {!Array.<number>}
   */
  this.penPath = [];

  /**
   * Whether the pen is up or down.
   * @type {boolean}
   */
  this.penDown = false;
};


/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number=} a
 */
wideboard.Draw.prototype.color = function(r, g, b, a) {
  this.penR = r;
  this.penG = g;
  this.penB = b;
  this.penA = goog.isDef(a) ? a : 1;
};


/**
 * @param {number} x
 * @param {number} y
 * @param {number=} z
 */
wideboard.Draw.prototype.moveTo = function(x, y, z) {
  if (this.penDown) {
    this.flushPath();
    this.penDown = false;
  }
  z = z || 0;
  this.penX = x;
  this.penY = y;
  this.penZ = z;
};


/**
 * @param {number} x
 * @param {number} y
 * @param {number=} z
 */
wideboard.Draw.prototype.lineTo = function(x, y, z) {
  z = z || 0;
  this.penPath.push(this.penX);
  this.penPath.push(this.penY);
  this.penPath.push(this.penZ);
  this.penPath.push(this.penR);
  this.penPath.push(this.penG);
  this.penPath.push(this.penB);
  this.penPath.push(this.penA);
  this.penX = x;
  this.penY = y;
  this.penZ = z;
  this.penDown = true;
};


/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
wideboard.Draw.prototype.strokeRect = function(x1, y1, x2, y2) {
  this.moveTo(x1, y1);
  this.lineTo(x2, y1);
  this.lineTo(x2, y2);
  this.lineTo(x1, y2);
  this.lineTo(x1, y1);
  this.flushPath();
};


/**
 * Ends the current pen path & adds the primitives it generated to the current buffer.
 */
wideboard.Draw.prototype.flushPath = function() {
  if (this.penDown) {
    this.penPath.push(this.penX);
    this.penPath.push(this.penY);
    this.penPath.push(this.penZ);
    this.penPath.push(this.penR);
    this.penPath.push(this.penG);
    this.penPath.push(this.penB);
    this.penPath.push(this.penA);
    this.penDown = false;
  }

  var path = this.penPath;
  var count = (path.length / 7) - 1;
  for (var i = 0; i < count; i++) {
    var c = i * 7;
    this.pushSegment(path[c + 0], path[c + 1], path[c + 2], path[c + 3], path[c + 4], path[c + 5], path[c + 6],
                     path[c + 7], path[c + 8], path[c + 9], path[c + 10], path[c + 11], path[c + 12], path[c + 13]);
  }

  this.penPath.length = 0;
};


/**
 * Adds one line segment to the current buffer.
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} r1
 * @param {number} g1
 * @param {number} b1
 * @param {number} a1
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 * @param {number} r2
 * @param {number} g2
 * @param {number} b2
 * @param {number} a2
 */
wideboard.Draw.prototype.pushSegment = function(x1, y1, z1, r1, g1, b1, a1,
                                                x2, y2, z2, r2, g2, b2, a2) {
  if (!this.currentBuffer || (this.currentBuffer.primitiveType != this.gl.LINES)) {
    this.endBuffer();
    this.startBuffer(this.gl.LINES);
  }
  if ((this.currentBuffer.length - this.currentBuffer.cursor) < 14) {
    this.endBuffer();
    this.startBuffer(this.gl.LINES);
  }
  if (!this.currentBuffer) return;

  var data = this.currentBuffer.data;
  var cursor = this.currentBuffer.cursor;

  data[cursor++] = x1;
  data[cursor++] = y1;
  data[cursor++] = z1;
  data[cursor++] = r1;
  data[cursor++] = g1;
  data[cursor++] = b1;
  data[cursor++] = a1;
  data[cursor++] = x2;
  data[cursor++] = y2;
  data[cursor++] = z2;
  data[cursor++] = r2;
  data[cursor++] = g2;
  data[cursor++] = b2;
  data[cursor++] = a2;

  this.currentBuffer.cursor = cursor;
};


/**
 * @param {number} primitiveType
 */
wideboard.Draw.prototype.startBuffer = function(primitiveType) {
  var nextBuffer = this.bufferPool.pop();
  if (!nextBuffer) {
    nextBuffer = new wideboard.Buffer(this.gl, 'debugdraw', this.gl.DYNAMIC_DRAW);
    // Each buffer can hold 4096 vertices.
    nextBuffer.initDynamic(7, 4096);
  }
  nextBuffer.primitiveType = primitiveType;
  this.currentBuffer = nextBuffer;
};


/**
 */
wideboard.Draw.prototype.endBuffer = function() {
  if (this.currentBuffer) {
    this.fullBuffers.push(this.currentBuffer);
    this.currentBuffer = null;
  }
};


/**
 * @param {wideboard.Shader} shader
 */
wideboard.Draw.prototype.draw = function(shader) {
  this.flushPath();

  if (this.currentBuffer) {
    this.fullBuffers.push(this.currentBuffer);
    this.currentBuffer = null;
  }

  var gl = shader.gl;
  gl.useProgram(shader.glProgram);

  for (var i = 0; i < this.fullBuffers.length; i++) {
    var buffer = this.fullBuffers[i];
    buffer.upload();
    shader.attributes['vpos'].set3f(buffer.glBuffer, 28, 0);
    shader.attributes['vcol'].set4f(buffer.glBuffer, 28, 12);
    gl.drawArrays(gl.LINES, 0, buffer.cursor / 7);
  }

  while (this.fullBuffers.length) {
    var buffer = this.fullBuffers.pop();
    buffer.resetCursor();
    this.bufferPool.push(buffer);
  }
};
