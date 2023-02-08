goog.provide('wideboard.LineInfo');
goog.provide('wideboard.Scrap');



/**
 * Stores data about one line. Probably don't want one of these per actual
 * line, might be too much ram.
 * @constructor
 * @struct
 */
wideboard.LineInfo = function() {
  // location
  this.lineX = 0;
  this.lineY = 0;

};

/**
 * @constructor
 * @struct
 */
wideboard.Scrap = function() {

  /** @type {number} */
  this.lineStart = 0;

  /** @type {number} */
  this.lineEnd = 0;

  /**
   * Coordinates of each line in this scrap in the linemap.
   * @type {!Array.<number>}
   */

  this.lines = [];
};
