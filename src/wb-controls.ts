import { DragTarget } from "./wb-dragtarget.js"

let wavey = 0.0;

export class Controls {
  mouseX : number;
  mouseY : number;
  mouseDown : boolean;
  mouseDownX : number;
  mouseDownY : number;
  mouseUpX : number;
  mouseUpY : number;
  dragging : boolean;
  targets : Array<DragTarget> = [];

  constructor() {
    this.mouseX = -1;
    this.mouseY = -1;
    this.mouseDown = false;
    this.mouseDownX = -1;
    this.mouseDownY = -1;
    this.mouseUpX = -1;
    this.mouseUpY = -1;
    this.dragging = false;
    this.targets = [];
  }

  install(element : HTMLCanvasElement) {
    var target = window;

    target.addEventListener('mousedown',  this.onMouseDown.bind(this),  true);
    target.addEventListener('mouseup',    this.onMouseUp.bind(this),    true);
    target.addEventListener('mousemove',  this.onMouseMove.bind(this),  true);
    target.addEventListener('mousewheel', this.onMouseWheel.bind(this), true);
    target.addEventListener('keydown',    this.onKeyDown.bind(this),    true);

    console.log('Wideboard controls installed.');
  };

  addTarget(target : DragTarget) {
    this.targets.push(target);
  };

  onMouseDown(event : MouseEvent) {
    this.mouseDown = true;
    this.mouseDownX = event.x;
    this.mouseDownY = event.y;
  };

  onMouseUp(event : MouseEvent) {
    this.mouseDown = false;
    this.mouseUpX = event.x;
    this.mouseUpY = event.y;

    var targets = this.targets;
    if (this.dragging) {
      for (var i = 0; i < targets.length; i++) {
        targets[i].onDragEnd(event.x, event.y,
                             event.shiftKey, event.ctrlKey, event.altKey);
      }
      this.dragging = false;
    } else {
      for (var i = 0; i < targets.length; i++) {
        targets[i].onMouseClick(event.x, event.y,
                                event.shiftKey, event.ctrlKey, event.altKey);
      }
    }
  };

  handleMouseMove(event: MouseEvent, mouseX : number, mouseY : number) {
    var targets = this.targets;
    if (this.mouseDown) {
      if (this.dragging) {
        for (var i = 0; i < targets.length; i++) {
          targets[i].onDragUpdate(mouseX - this.mouseX,
                                  mouseY - this.mouseY,
                                  event.shiftKey, event.ctrlKey, event.altKey);
        }
      } else {
        if ((Math.abs(this.mouseDownX - mouseX) > 2) ||
            (Math.abs(this.mouseDownY - mouseY) > 2)) {
          for (var i = 0; i < targets.length; i++) {
            targets[i].onDragBegin(this.mouseDownX, this.mouseDownY,
                                   event.shiftKey, event.ctrlKey, event.altKey);
            targets[i].onDragUpdate(mouseX - this.mouseDownX,
                                    mouseY - this.mouseDownY,
                                    event.shiftKey, event.ctrlKey, event.altKey);
          }
          this.dragging = true;
        }
      }
    }

    this.mouseX = mouseX;
    this.mouseY = mouseY;
  };

  onMouseMove(event : MouseEvent) {
    this.handleMouseMove(event, event.x, event.y);
  };

  onMouseWheel(event : WheelEvent) {
    this.handleMouseMove(event, event.x, event.y);
    var targets = this.targets;
    for (var i = 0; i < targets.length; i++) {
      // FIXME check delta
      targets[i].onMouseWheel(event.x, event.y, event.deltaY,
                              event.shiftKey, event.ctrlKey, event.altKey);
    }
  };

  onKeyDown(event : KeyboardEvent) {
    // FIXME check key code
    /*
    if (event.ctrlKey && event.keyCode == 81) {
      wavey = 1.0 - wavey;
    }

    var targets = this.targets;
    for (var i = 0; i < targets.length; i++) {
      targets[i].onKeyDown(event.keyCode,
                           event.shiftKey, event.ctrlKey, event.altKey);
    }
    */
  };
};
