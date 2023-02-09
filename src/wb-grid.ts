import { Draw } from "./wb-draw.js"
import { Camera } from "./wb-camera.js"

/**
 * @param {!wideboard.Draw} draw
 * @param {!wideboard.Camera} camera
 * @constructor
 * @struct
 */
export class Grid {
  pen : Draw;
  camera : Camera;

  constructor(draw : Draw, camera : Camera) {
    this.pen = draw;
    this.camera = camera;
  }

  // Draws a grid.
  draw() {
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
};