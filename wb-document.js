goog.provide('wideboard.Document');

goog.require('wideboard.Scrap');



/**
 * Main document class for Wideboard.
 * @constructor
 * @struct
 */
wideboard.Document = function() {
  /** @type {string} */
  this.filename = 'filename';

  /** @type {!Array.<number>} */
  this.linePos = [];

  /** @type {!Array.<number>} */
  this.lineLength = [];

  /** @type {!Array.<wideboard.Scrap>} */
  this.scraps = [];

  /**
   * Where this document lives on the shelf.
   * @type {number}
   */
  this.shelfPos = -1;

  /**
   * True when the document is loaded.
   * @type {boolean}
   */
  this.ready = false;
};
