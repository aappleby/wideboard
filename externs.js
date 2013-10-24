var console = {};

/** @param {*} val */
console.log = function(val) {};

var performance = {};

/** @return {number} */
performance.now = function() {};

/** @constructor */
var WheelEvent = function() {
  /** @type {number} */
  this.x = 0;
  /** @type {number} */
  this.y = 0;
  /** @type {number} */
  this.wheelDelta = 0;
};
