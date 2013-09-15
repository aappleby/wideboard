goog.provide('wideboard.Controls');


/**
 * @constructor
 * @struct
 */
wideboard.Controls = function() {
  /** @type {HTMLCanvasElement} */
  this.element = null;

  /** @type {number} */
  this.mouseX = -1;

  /** @type {number} */
  this.mouseY = -1;

  /** @type {number} */
  this.mouseDownX = -1;

  /** @type {number} */
  this.mouseDownY = -1;

  /** @type {number} */
  this.mouseUpX = -1;

  /** @type {number} */
  this.mouseUpY = -1;

  /** @type {boolean} */
  this.dragging = false;
};


/**
 * @param {!HTMLCanvasElement} element
 */
wideboard.Controls.prototype.install = function(element) {
  this.element = element;

  this.element.onmousedown = /** @type {function(Event)} */(goog.bind(this.onMouseDown, this));
  this.element.onmouseup = /** @type {function(Event)} */(goog.bind(this.onMouseUp, this));

  this.element.onmouseover = /** @type {function(Event)} */(goog.bind(this.onMouseOver, this));
  this.element.onmousemove = /** @type {function(Event)} */(goog.bind(this.onMouseMove, this));
  this.element.onmouseout = /** @type {function(Event)} */(goog.bind(this.onMouseOut, this));

  this.element.onmousewheel = /** @type {function(Event)} */(goog.bind(this.onMouseWheel, this));

  goog.global.console.log('Wideboard controls installed.');
};


/**
 * @param {!MouseEvent} event
 */
wideboard.Controls.prototype.onMouseDown = function(event) {
  this.mouseDownX = event.x;
  this.mouseDownY = event.y;
  this.dragging = true;
};

/**
 * @param {!MouseEvent} event
 */
wideboard.Controls.prototype.onMouseUp = function(event) {
  this.mouseUpX = event.x;
  this.mouseUpY = event.y;
  this.dragging = false;
};

/**
 * @param {!MouseEvent} event
 */
wideboard.Controls.prototype.onMouseOver = function(event) {
};

/**
 * @param {!MouseEvent} event
 */
wideboard.Controls.prototype.onMouseMove = function(event) {
  this.mouseX = event.x;
  this.mouseY = event.y;
};

/**
 * @param {!MouseEvent} event
 */
wideboard.Controls.prototype.onMouseOut = function(event) {
  this.dragging = false;
};

/**
 * @param {!WheelEvent} event
 */
wideboard.Controls.prototype.onMouseWheel = function(event) {
};
