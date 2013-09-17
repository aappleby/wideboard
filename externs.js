var console = {};

/** @param {string} text */
console.log = function(text) {};

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
