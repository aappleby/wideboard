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
 * @param {goog.math.Vec2=} scale
 * @constructor
 * @struct
 */
wideboard.View = function(origin, scale) {
  /** @type {goog.math.Vec2} */
  this.origin = origin || new goog.math.Vec2(0, 0);

  /** @type {goog.math.Vec2} */
  this.scale = scale || new goog.math.Vec2(1, 1);
};


/**
 * @param {!wideboard.View} view
 */
wideboard.View.prototype.copy = function(view) {
  this.origin.x = view.origin.x;
  this.origin.y = view.origin.y;
  this.scale.x = view.scale.x;
  this.scale.y = view.scale.y;
};


/**
 * @return {!wideboard.View}
 */
wideboard.View.prototype.clone = function() {
  return new wideboard.View(this.origin.clone(),
                            this.scale.clone());
};


/**
 * @param {number} value
 * @param {number} goal
 * @param {number} delta
 * @return {number}
 */
wideboard.util.ease = function(value, goal, delta) {
  var t = 1.0 - Math.pow(0.1, delta / 80);
  value += (goal - value) * t;
  return value;
};


/**
 * @param {goog.math.Rect} value
 * @param {goog.math.Rect} goal
 * @param {number} delta
 */
wideboard.util.easeRect = function(value, goal, delta) {
  var t = 1.0 - Math.pow(0.1, delta / 80);
  value.top += (goal.top - value.top) * t;
  value.left += (goal.left - value.left) * t;
  value.width += (goal.width - value.width) * t;
  value.height += (goal.height - value.height) * t;
};


/**
 * @param {wideboard.View} value
 * @param {wideboard.View} goal
 * @param {number} delta
 */
wideboard.util.easeView = function(value, goal, delta) {
  var t = 1.0 - Math.pow(0.1, delta / 80);
  value.origin.x += (goal.origin.x - value.origin.x) * t;
  value.origin.y += (goal.origin.y - value.origin.y) * t;
  value.scale.x += (goal.scale.x - value.scale.x) * t;
  value.scale.y += (goal.scale.y - value.scale.y) * t;
};
