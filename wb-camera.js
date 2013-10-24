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

  /** @type {!wideboard.View} */
  this.viewSnap = new wideboard.View();

  /** @type {!wideboard.View} */
  this.viewGoalSnap = new wideboard.View();
};


/**
 * @param {number} delta Time increment, in milliseconds.
 */
wideboard.Camera.prototype.update = function(delta) {
  wideboard.util.easeView(this.view, this.viewGoal, delta, this.gl.canvas);
  wideboard.util.easeView(this.viewSnap, this.viewGoalSnap, delta, this.gl.canvas);
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
  delta = (delta > 0) - (delta < 0);

  var oldZoom = Math.log(this.viewGoal.scale) / Math.log(2);
  var step = 1.0;
  oldZoom = Math.round(oldZoom / step) * step;
  var newZoom = oldZoom + delta * step;
  if (newZoom < -10) newZoom = -10;
  if (newZoom > 2) newZoom = 2;
  var newDelta = newZoom - oldZoom;

  // Convert from screen space to graph space.

  x = wideboard.util.screenToWorldX(x, this.gl.canvas, this.viewGoal);
  y = wideboard.util.screenToWorldY(y, this.gl.canvas, this.viewGoal);

  this.viewGoal.origin.x -= x;
  this.viewGoal.origin.y -= y;
  this.viewGoal.origin.x /= Math.pow(2.0, newDelta);
  this.viewGoal.origin.y /= Math.pow(2.0, newDelta);
  this.viewGoal.origin.x += x;
  this.viewGoal.origin.y += y;

  this.viewGoal.scale = Math.pow(2.0, newZoom);

  this.viewGoalSnap.copy(this.viewGoal);
  wideboard.util.snapView(this.viewGoalSnap, this.gl.canvas);
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
  //this.viewGoal.copy(this.oldView);
  this.viewGoal.origin.x -= dx / this.viewGoal.scale;
  this.viewGoal.origin.y -= dy / this.viewGoal.scale;

  this.viewGoalSnap.copy(this.viewGoal);
  wideboard.util.snapView(this.viewGoalSnap, this.gl.canvas);
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
