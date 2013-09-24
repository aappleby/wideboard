goog.provide('wideboard.Controls');


/**
 * @constructor
 * @struct
 */
wideboard.Controls = function() {
  /** @type {number} */
  this.mouseX = -1;

  /** @type {number} */
  this.mouseY = -1;

  /** @type {boolean} */
  this.mouseDown = false;

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

  /** @type {!Array.<!wideboard.DragTarget>} */
  this.targets = [];
};


/**
 * @param {!HTMLCanvasElement} element
 */
wideboard.Controls.prototype.install = function(element) {
  var target = window;

  target.addEventListener('mousedown',
      /** @type {function(Event)} */(goog.bind(this.onMouseDown, this)), true);
  target.addEventListener('mouseup',
      /** @type {function(Event)} */(goog.bind(this.onMouseUp, this)), true);
  target.addEventListener('mousemove',
      /** @type {function(Event)} */(goog.bind(this.onMouseMove, this)), true);
  target.addEventListener('mousewheel',
      /** @type {function(Event)} */(goog.bind(this.onMouseWheel, this)), true);

  goog.global.console.log('Wideboard controls installed.');
};


/**
 * @param {!wideboard.DragTarget} target
 */
wideboard.Controls.prototype.addTarget = function(target) {
  this.targets.push(target);
};


/**
 * @param {!MouseEvent} event
 */
wideboard.Controls.prototype.onMouseDown = function(event) {
  this.mouseDown = true;
  this.mouseDownX = event.x;
  this.mouseDownY = event.y;
};

/**
 * @param {!MouseEvent} event
 */
wideboard.Controls.prototype.onMouseUp = function(event) {
  this.mouseDown = false;
  this.mouseUpX = event.x;
  this.mouseUpY = event.y;

  var targets = this.targets;
  if (this.dragging) {
    for (var i = 0; i < targets.length; i++) {
      targets[i].onDragEnd(event.x, event.y);
    }
    this.dragging = false;
  } else {
    for (var i = 0; i < targets.length; i++) {
      targets[i].onMouseClick(event.x, event.y);
    }
  }
};


/**
 * @param {number} mouseX
 * @param {number} mouseY
 */
wideboard.Controls.prototype.handleMouseMove = function(mouseX, mouseY) {
  var targets = this.targets;
  if (this.mouseDown) {
    if (this.dragging) {
      for (var i = 0; i < targets.length; i++) {
        targets[i].onDragUpdate(mouseX - this.mouseX,
                                mouseY - this.mouseY);
      }
    } else {
      if ((Math.abs(this.mouseDownX - mouseX) > 2) ||
          (Math.abs(this.mouseDownY - mouseY) > 2)) {
        for (var i = 0; i < targets.length; i++) {
          targets[i].onDragBegin(this.mouseDownX, this.mouseDownY);
          targets[i].onDragUpdate(mouseX - this.mouseDownX,
                                  mouseY - this.mouseDownY);
        }
        this.dragging = true;
      }
    }
  }

  this.mouseX = mouseX;
  this.mouseY = mouseY;
};


/**
 * @param {!MouseEvent} event
 */
wideboard.Controls.prototype.onMouseMove = function(event) {
  this.handleMouseMove(event.x, event.y);
};


/**
 * @param {!WheelEvent} event
 */
wideboard.Controls.prototype.onMouseWheel = function(event) {
  this.handleMouseMove(event.x, event.y);
  var targets = this.targets;
  for (var i = 0; i < targets.length; i++) {
    targets[i].onMouseWheel(event.x, event.y, event.wheelDelta); //event.wheelDelta > 0 ? 1 : -1);
  }
};
