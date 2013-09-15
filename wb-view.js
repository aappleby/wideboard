/**
 * Our 'camera'.
 */

goog.provide('wideboard.View');



/**
 * @constructor
 * @struct
 */
wideboard.View = function() {
  /** @type {number} */
  this.screenWidth = 1280;
  /** @type {number} */
  this.screenHeight = 720;

  /** @type {number} */
  this.originX = 0;
  /** @type {number} */
  this.originY = 0;
  /** @type {number} */
  this.scaleX = 1;
  /** @type {number} */
  this.scaleY = 1;

  /** @type {number} */
  this.originXGoal = 0;
  /** @type {number} */
  this.originYGoal = 0;

  /** @type {number} */
  this.scaleXGoal = 1;
  /** @type {number} */
  this.scaleYGoal = 1;
};


/**
 * @param {vec2} p
 * @return {vec2}
 */
wideboard.View.prototype.screenToView = function(p) {
  return p;
};


/**
 * @param {vec2} p
 * @return {vec2}
 */
wideboard.View.prototype.viewToScreen = function(p) {
  return p;
};


/**
 * @param {vec2} p
 * @return {vec2}
 */
wideboard.View.prototype.startDrag = function(p) {
  return p;
};

/**
 * @param {vec2} p
 * @return {vec2}
 */
wideboard.View.prototype.updateDrag = function(p) {
  return p;
};

/**
 * @param {vec2} p
 * @return {vec2}
 */
wideboard.View.prototype.endDrag = function(p) {
  return p;
};
