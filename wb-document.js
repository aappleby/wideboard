goog.provide('wideboard.Document');

/**
 * Main document class for Wideboard.
 * @constructor
 * @struct
 */
 wideboard.Document = function() {
  /** @type {string} */
  this.filename = 'filename';
  /** @type {!Array.<number>} */
  this.lines = [];
 };
