import { View } from "./wb-util.js";
import * as util from "./wb-util.js";
export class Camera {
    gl;
    canvas;
    oldView;
    view;
    viewGoal;
    viewSnap;
    viewGoalSnap;
    constructor(gl) {
        this.gl = gl;
        // @ts-ignore
        this.canvas = gl.canvas;
        this.oldView = new View();
        this.view = new View();
        this.viewGoal = new View();
        this.viewSnap = new View();
        this.viewGoalSnap = new View();
    }
    update(delta /* Time increment, in milliseconds.*/) {
        util.easeView(this.view, this.viewGoal, delta, this.canvas);
        util.easeView(this.viewSnap, this.viewGoalSnap, delta, this.canvas);
    }
    ;
    onMouseClick(x, y) {
    }
    ;
    onMouseWheel(x, y, delta, shiftKey, ctrlKey, altKey) {
        if (shiftKey) {
            // FIXME - what was this doing?
            //delta = (delta > 0) - (delta < 0);
            var oldZoom = Math.log(this.viewGoal.scale) / Math.log(2);
            var step = 0.5;
            oldZoom = Math.round(oldZoom / step) * step;
            var newZoom = oldZoom + delta * step;
            if (newZoom < -10)
                newZoom = -10;
            if (newZoom > 2)
                newZoom = 2;
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
        this.viewGoal.origin.y -= delta / this.viewGoal.scale;
        this.viewGoalSnap.copy(this.viewGoal);
        util.snapView(this.viewGoalSnap, this.canvas);
    }
    ;
    onDragBegin(x, y, shiftKey, ctrlKey, altKey) {
        if (shiftKey) {
            this.oldView.copy(this.view);
        }
    }
    ;
    onDragUpdate(dx, dy, shiftKey, ctrlKey, altKey) {
        //this.viewGoal.copy(this.oldView);
        if (shiftKey) {
            this.viewGoal.origin.x -= dx / this.viewGoal.scale;
            this.viewGoal.origin.y -= dy / this.viewGoal.scale;
            this.viewGoalSnap.copy(this.viewGoal);
            util.snapView(this.viewGoalSnap, this.canvas);
        }
    }
    ;
    onDragCancel(x, y) {
    }
    ;
    onDragEnd(x, y) {
    }
    ;
    onKeyDown(key, shiftKey, ctrlKey, altKey) {
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
    }
    ;
}
;
//# sourceMappingURL=wb-camera.js.map