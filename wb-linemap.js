goog.provide('wideboard.Linemap');

goog.require('wideboard.Context');
goog.require('wideboard.Texture');

/**
 * The linemap is a dynamically-allocated texture atlas that stores the actual
 * text characters for each line.
 * @param {!wideboard.Context} context
 * @param {number} width
 * @param {number} height
 * @constructor
 * @struct
 */
wideboard.Linemap = function(context, width, height) {
  /** @type {wideboard.Context} */
  this.context = context;

  /** @type {number} */
  this.width = width;

  /** @type {number} */
  this.height = height;

  /** @type {wideboard.Texture} */
  this.texture = null;

  /**
   * Dumb initial implementation just has an allocation cursor.
   * @type {number}
   */
  this.cursorX = 0;

  /** @type {number} */
  this.cursorY = 0;

  /** @type {boolean} */
  this.dirty = true;
};


/**
 */
wideboard.Linemap.prototype.init = function() {
  this.texture = new wideboard.Texture(gl, 2048, 2048, gl.LUMINANCE, false);
  this.texture.makeLinemap();
};


/**
 * @param {number} size
 * @return {number}
 */
wideboard.Linemap.prototype.allocate = function(size) {
  var result = this.cursorX + this.cursorY * this.width;
  this.cursorX += size;
  if (this.cursorX >= this.width) {
    this.cursorX = 0;
    this.cursorY++;
  }
  return result;
};
