goog.provide('wideboard.Grid');



/**
 * @param {!wideboard.Draw} draw
 * @param {!wideboard.Camera} camera
 * @constructor
 * @struct
 */
wideboard.Grid = function(draw, camera) {
  /** @type {!wideboard.Draw} */
  this.pen = draw;

  /** @type {!wideboard.Camera} */
  this.camera = camera;
};


/**
 * Draws a grid.
 */
wideboard.Grid.prototype.draw = function() {
  var pen = this.pen;
  pen.color(0.8, 0.8, 1, 1.0);
  for (var i = -5; i <= 5; i++) {
    pen.moveTo(i * 16, -300);
    pen.lineTo(i * 16, 300);
  }
  for (var i = -5; i <= 5; i++) {
    pen.moveTo(-300, i * 16);
    pen.lineTo(300, i * 16);
  }
};
