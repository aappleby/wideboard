/**
 * Our 'camera'.
 */

goog.provide('wideboard.Camera');

goog.require('wideboard.DragTarget');
goog.require('wideboard.util');



/**
 * @param {!WebGLRenderingContext} gl
 * @constructor
 * @struct
 * @implements {wideboard.DragTarget}
 */
wideboard.Camera = function(gl) {
  /** @type {!WebGLRenderingContext} */
  this.gl = gl;

  /** @type {!wideboard.View} */
  this.oldView = new wideboard.View();

  /** @type {!wideboard.View} */
  this.view = new wideboard.View();

  /** @type {!wideboard.View} */
  this.viewGoal = new wideboard.View();
};


/**
 * @param {number} delta Time increment, in milliseconds.
 */
wideboard.Camera.prototype.update = function(delta) {
  wideboard.util.easeView(this.view, this.viewGoal, delta);
};


/**
 * @param {goog.math.Vec2} p
 * @return {goog.math.Vec2}
 */
wideboard.Camera.prototype.screenToView = function(p) {
  p.x -= this.gl.canvas.width / 2;
  p.y -= this.gl.canvas.height / 2;
  return p;
};


/**
 * @param {goog.math.Vec2} p
 * @return {goog.math.Vec2}
 */
wideboard.Camera.prototype.viewToScreen = function(p) {
  p.x += this.gl.canvas.width / 2;
  p.y += this.gl.canvas.height / 2;
  return p;
};


/**
 * @param {number} x
 * @param {number} y
 */
wideboard.Camera.prototype.onMouseClick = function(x, y) {
};


/**
 * @param {number} x
 * @param {number} y
 * @param {number} delta
 */
wideboard.Camera.prototype.onMouseWheel = function(x, y, delta) {
  this.viewGoal.scale.x *= Math.pow(2.0, delta);
  this.viewGoal.scale.y *= Math.pow(2.0, delta);
};


/**
 * @param {number} x
 * @param {number} y
 */
wideboard.Camera.prototype.onDragBegin = function(x, y) {
  this.oldView.copy(this.view);
};


/**
 * @param {number} dx
 * @param {number} dy
 */
wideboard.Camera.prototype.onDragUpdate = function(dx, dy) {
  this.viewGoal.copy(this.oldView);
  this.viewGoal.origin.x -= dx;
  this.viewGoal.origin.y -= dy;
};


/**
 * @param {number} x
 * @param {number} y
 */
wideboard.Camera.prototype.onDragCancel = function(x, y) {
};


/**
 * @param {number} x
 * @param {number} y
 */
wideboard.Camera.prototype.onDragEnd = function(x, y) {
};
