/**
 * Dummy file to force Closure to compile everything.
 */

goog.provide('wideboard.Root');

goog.require('wideboard.App');
goog.require('wideboard.Server');


/**
 * @constructor
 * @struct
 */
wideboard.Root = function() {
  this.app = new wideboard.App();
  this.server = new wideboard.Server();
};
