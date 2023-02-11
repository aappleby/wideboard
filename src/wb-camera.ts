import { DragTarget } from "./wb-dragtarget.js"
import { View } from "./wb-util.js";
import * as util from "./wb-util.js";

export class Camera implements DragTarget {
  canvas : HTMLCanvasElement;
  oldView : View;
  view : View;
  viewGoal : View;
  viewSnap : View;
  viewGoalSnap : View;

  constructor(canvas : HTMLCanvasElement) {
    // @ts-ignore
    this.canvas = canvas;
    this.oldView = new View();
    this.view = new View();
    this.viewGoal = new View();
    this.viewSnap = new View();
    this.viewGoalSnap = new View();
  }

  update(delta : number) {
    let ease_done = util.easeView(this.view, this.viewGoal, delta, this.canvas);
    if (!ease_done) {
      //console.log("View moved: " + this.view.origin.x + "," + this.view.origin.y);
    }
    util.easeView(this.viewSnap, this.viewGoalSnap, delta, this.canvas);
  };

  onMouseClick(x : number, y : number) {
    //console.log("Camera::onMouseClick");
  };

  onMouseWheel(x : number, y : number, delta : number, shiftKey : boolean, ctrlKey : boolean, altKey : boolean) {
    //console.log("Camera::onMouseWheel");
    if (shiftKey) {
      if (delta > 0) {
        delta = -1;
      }
      else if (delta < 0) {
        delta = 1;
      }

      var oldZoom = Math.log(this.viewGoal.scale) / Math.log(2);
      var step = 1.0;
      oldZoom = Math.round(oldZoom / step) * step;
      var newZoom = oldZoom + delta * step;
      if (newZoom < -10) newZoom = -10;
      if (newZoom > 4) newZoom = 4;
      var newDelta = newZoom - oldZoom;

      // Convert from screen space to graph space.

      x = util.screenToWorldX(x, this.canvas, this.viewGoal);
      y = util.screenToWorldY(y, this.canvas, this.viewGoal);

      this.viewGoal.origin.x -= x;
      this.viewGoal.origin.y -= y;
      this.viewGoal.origin.x /= Math.pow(2.0, newDelta);
      this.viewGoal.origin.y /= Math.pow(2.0, newDelta);
      this.viewGoal.origin.x += x;
      this.viewGoal.origin.y += y;

      this.viewGoal.scale = Math.pow(2.0, newZoom);

      this.viewGoalSnap.copy(this.viewGoal);
      util.snapView(this.viewGoalSnap, this.canvas);
      return;
    }
    else {
      this.viewGoal.origin.y += delta / this.viewGoal.scale;
    }

    this.viewGoalSnap.copy(this.viewGoal);
    util.snapView(this.viewGoalSnap, this.canvas);
  };

  onDragBegin(x : number, y : number, shiftKey : boolean, ctrlKey : boolean, altKey : boolean) {
    //console.log("Camera::onDragBegin");
    if (shiftKey) {
      this.oldView.copy(this.view);
    }
  };

  onDragUpdate(dx : number, dy : number, shiftKey : boolean, ctrlKey : boolean, altKey : boolean) {
    //console.log("Camera::onDragUpdate");
    //this.viewGoal.copy(this.oldView);
    if (shiftKey) {
      this.viewGoal.origin.x -= dx / this.viewGoal.scale;
      this.viewGoal.origin.y -= dy / this.viewGoal.scale;

      this.viewGoalSnap.copy(this.viewGoal);
      util.snapView(this.viewGoalSnap, this.canvas);
    }
  };

  onDragCancel(x : number, y : number) {
    //console.log("Camera::onDragCancel");
  };

  onDragEnd(x : number, y : number) {
    //console.log("Camera::onDragEnd");
  };

  onKeyDown(key : number, shiftKey : boolean, ctrlKey : boolean, altKey : boolean) {
    console.log("Camera::onKeyDown");
    if (key == 33) {
      this.viewGoal.origin.y -= 800 / this.viewGoal.scale;
      this.viewGoalSnap.copy(this.viewGoal);
      util.snapView(this.viewGoalSnap, this.canvas);
      return;
    }

    if (key == 34) {
      this.viewGoal.origin.y += 800 / this.viewGoal.scale;
      this.viewGoalSnap.copy(this.viewGoal);
      util.snapView(this.viewGoalSnap, this.canvas);
      return;
    }

    // left
    if (key == 37) {
      this.viewGoal.origin.x -= 100 / this.viewGoal.scale;
      this.viewGoalSnap.copy(this.viewGoal);
      util.snapView(this.viewGoalSnap, this.canvas);
      return;
    }

    // up
    if (key == 38) {
      this.viewGoal.origin.y -= 100 / this.viewGoal.scale;
      this.viewGoalSnap.copy(this.viewGoal);
      util.snapView(this.viewGoalSnap, this.canvas);
      return;
    }

    // right
    if (key == 39) {
      this.viewGoal.origin.x += 100 / this.viewGoal.scale;
      this.viewGoalSnap.copy(this.viewGoal);
      util.snapView(this.viewGoalSnap, this.canvas);
      return;
    }

    // down
    if (key == 40) {
      this.viewGoal.origin.y += 100 / this.viewGoal.scale;
      this.viewGoalSnap.copy(this.viewGoal);
      util.snapView(this.viewGoalSnap, this.canvas);
      return;
    }

    console.log(key);
  };
};
