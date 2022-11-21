goog.provide('wideboard.DragTarget');



/**
 * @interface
 */
wideboard.DragTarget = function() {};

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean} shiftKey
 * @param {boolean} ctrlKey
 * @param {boolean} altKey
 */
wideboard.DragTarget.prototype.onDragBegin = goog.abstractMethod;

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean} shiftKey
 * @param {boolean} ctrlKey
 * @param {boolean} altKey
 */
wideboard.DragTarget.prototype.onDragUpdate = goog.abstractMethod;

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean} shiftKey
 * @param {boolean} ctrlKey
 * @param {boolean} altKey
 */
wideboard.DragTarget.prototype.onDragCancel = goog.abstractMethod;

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean} shiftKey
 * @param {boolean} ctrlKey
 * @param {boolean} altKey
 */
wideboard.DragTarget.prototype.onDragEnd = goog.abstractMethod;

/**
 * @param {number} x
 * @param {number} y
 * @param {number} delta
 * @param {boolean} shiftKey
 * @param {boolean} ctrlKey
 * @param {boolean} altKey
 */
wideboard.DragTarget.prototype.onMouseWheel = goog.abstractMethod;

/**
 * @param {number} x
 * @param {number} y
 */
wideboard.DragTarget.prototype.onMouseClick = goog.abstractMethod;

/**
 * @param {number} key
 * @param {boolean} shiftKey
 * @param {boolean} ctrlKey
 * @param {boolean} altKey
 */
wideboard.DragTarget.prototype.onKeyDown = goog.abstractMethod;
