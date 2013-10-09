goog.provide('wideboard.Color');
goog.provide('wideboard.View');
goog.provide('wideboard.util');

goog.require('goog.math.Rect');
goog.require('goog.math.Vec2');


/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} a
 * @constructor
 * @struct
 */
wideboard.Color = function(r, g, b, a) {
  /** @type {number} */
  this.r = r;

  /** @type {number} */
  this.g = g;

  /** @type {number} */
  this.b = b;

  /** @type {number} */
  this.a = a;
};


/**
 * @param {goog.math.Vec2=} origin
 * @param {number=} scale
 * @constructor
 * @struct
 */
wideboard.View = function(origin, scale) {
  /** @type {goog.math.Vec2} */
  this.origin = goog.isDef(origin) ? origin.clone() : new goog.math.Vec2(0, 0);

  /** @type {number} */
  this.scale = goog.isDef(scale) ? scale : 1;
};


/**
 * @param {!wideboard.View} view
 */
wideboard.View.prototype.copy = function(view) {
  this.origin.x = view.origin.x;
  this.origin.y = view.origin.y;
  this.scale = view.scale;
};


/**
 * @return {!wideboard.View}
 */
wideboard.View.prototype.clone = function() {
  return new wideboard.View(this.origin.clone(),
                            this.scale);
};


/**
 * @param {number} value
 * @param {number} goal
 * @param {number} delta
 * @return {number}
 */
wideboard.util.ease = function(value, goal, delta) {
  if (value == goal) return value;
  var oldValue = value;
  var t = 1.0 - Math.pow(0.1, delta / 70);
  value += (goal - value) * t;
  if (value == oldValue) {
    value = goal;
  }
  return value;
};


/**
 * @param {goog.math.Rect} value
 * @param {goog.math.Rect} goal
 * @param {number} delta
 */
wideboard.util.easeRect = function(value, goal, delta) {
  value.top = wideboard.util.ease(value.top, goal.top, delta);
  value.left = wideboard.util.ease(value.left, goal.left, delta);
  value.width = wideboard.util.ease(value.width, goal.width, delta);
  value.height = wideboard.util.ease(value.height, goal.height, delta);
};


/**
 * @param {!wideboard.View} view
 * @param {!wideboard.View} goal
 * @param {number} delta
 * @param {!HTMLCanvasElement} canvas
 */
wideboard.util.easeView = function(view, goal, delta, canvas) {
  var util = wideboard.util;

  view.origin.x = util.ease(view.origin.x, goal.origin.x, delta);
  view.origin.y = util.ease(view.origin.y, goal.origin.y, delta);
  view.scale = 1.0 / util.ease(1.0 / view.scale, 1.0 / goal.scale, delta);

  // If we're within 3% of the goal scale, and 1/3 a pixel of the goal origin,
  // snap to the goal.
  var ds = view.scale / goal.scale;
  if ((ds < 0.99) || (ds > 1.01)) return;

  var dx = util.worldToScreenX(0, view, canvas) -
           util.worldToScreenX(0, goal, canvas);
  var dy = util.worldToScreenY(0, view, canvas) -
           util.worldToScreenY(0, goal, canvas);

  var dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 0.33) {
    view.origin.x = goal.origin.x;
    view.origin.y = goal.origin.y;
    view.scale = goal.scale;
  }
};


/**
 * Translates a view so that its origin falls exactly on a pixel center.
 * @param {!wideboard.View} view
 * @param {!HTMLCanvasElement} canvas
 */
wideboard.util.snapView = function(view, canvas) {
  var util = wideboard.util;

  var x = util.worldToScreenX(0, view, canvas);
  var y = util.worldToScreenY(0, view, canvas);

  x = Math.round(x);
  y = Math.round(y);

  x = util.screenToWorldX(x, canvas, view);
  y = util.screenToWorldY(y, canvas, view);

  view.origin.x -= x;
  view.origin.y -= y;
};


/**
 * @param {!goog.math.Vec2} v
 * @param {!HTMLCanvasElement} canvas
 * @param {!wideboard.View} view
 * @param {!goog.math.Vec2} out
 */
wideboard.util.screenToWorld = function(v, canvas, view, out) {
  var screenCenterX = Math.round(canvas.width / 2);
  var screenCenterY = Math.round(canvas.height / 2);

  var x = v.x;
  var y = v.y;

  x -= screenCenterX;
  y -= screenCenterY;
  x /= view.scale;
  y /= view.scale;
  x += view.origin.x;
  y += view.origin.y;

  out.x = x;
  out.y = y;
};


/**
 * @param {number} x
 * @param {!HTMLCanvasElement} canvas
 * @param {!wideboard.View} view
 * @return {number}
 */
wideboard.util.screenToWorldX = function(x, canvas, view) {
  x -= Math.round(canvas.width / 2);
  x /= view.scale;
  x += view.origin.x;
  return x;
};


/**
 * @param {number} y
 * @param {!HTMLCanvasElement} canvas
 * @param {!wideboard.View} view
 * @return {number}
 */
wideboard.util.screenToWorldY = function(y, canvas, view) {
  y -= Math.round(canvas.height / 2);
  y /= view.scale;
  y += view.origin.y;
  return y;
};


/**
 * @param {!goog.math.Vec2} v
 * @param {!wideboard.View} view
 * @param {!HTMLCanvasElement} canvas
 * @param {!goog.math.Vec2} out
 */
wideboard.util.worldToScreen = function(v, view, canvas, out) {
  var screenCenterX = Math.round(canvas.width / 2);
  var screenCenterY = Math.round(canvas.height / 2);

  var x = v.x;
  var y = v.y;

  x -= view.origin.x;
  y -= view.origin.y;
  x *= view.scale;
  y *= view.scale;
  x += screenCenterX;
  y += screenCenterY;

  out.x = x;
  out.y = y;
};


/**
 * @param {number} x
 * @param {!wideboard.View} view
 * @param {!HTMLCanvasElement} canvas
 * @return {number}
 */
wideboard.util.worldToScreenX = function(x, view, canvas) {
  x -= view.origin.x;
  x *= view.scale;
  x += Math.round(canvas.width / 2);
  return x;
};


/**
 * @param {number} y
 * @param {!wideboard.View} view
 * @param {!HTMLCanvasElement} canvas
 * @return {number}
 */
wideboard.util.worldToScreenY = function(y, view, canvas) {
  y -= view.origin.y;
  y *= view.scale;
  y += Math.round(canvas.height / 2);
  return y;
};
