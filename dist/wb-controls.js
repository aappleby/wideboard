let wavey = 0.0;
export class Controls {
    mouseX;
    mouseY;
    mouseDown;
    mouseDownX;
    mouseDownY;
    mouseUpX;
    mouseUpY;
    dragging;
    targets = [];
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
    install(element) {
        var target = window;
        target.addEventListener('mousedown', this.onMouseDown.bind(this), true);
        target.addEventListener('mouseup', this.onMouseUp.bind(this), true);
        target.addEventListener('mousemove', this.onMouseMove.bind(this), true);
        target.addEventListener('mousewheel', this.onMouseWheel.bind(this), true);
        target.addEventListener('keydown', this.onKeyDown.bind(this), true);
        console.log('Wideboard controls installed.');
    }
    ;
    addTarget(target) {
        this.targets.push(target);
    }
    ;
    onMouseDown(event) {
        this.mouseDown = true;
        this.mouseDownX = event.x;
        this.mouseDownY = event.y;
    }
    ;
    onMouseUp(event) {
        this.mouseDown = false;
        this.mouseUpX = event.x;
        this.mouseUpY = event.y;
        var targets = this.targets;
        if (this.dragging) {
            for (var i = 0; i < targets.length; i++) {
                targets[i].onDragEnd(event.x, event.y, event.shiftKey, event.ctrlKey, event.altKey);
            }
            this.dragging = false;
        }
        else {
            for (var i = 0; i < targets.length; i++) {
                targets[i].onMouseClick(event.x, event.y, event.shiftKey, event.ctrlKey, event.altKey);
            }
        }
    }
    ;
    handleMouseMove(event, mouseX, mouseY) {
        var targets = this.targets;
        if (this.mouseDown) {
            if (this.dragging) {
                for (var i = 0; i < targets.length; i++) {
                    targets[i].onDragUpdate(mouseX - this.mouseX, mouseY - this.mouseY, event.shiftKey, event.ctrlKey, event.altKey);
                }
            }
            else {
                if ((Math.abs(this.mouseDownX - mouseX) > 2) ||
                    (Math.abs(this.mouseDownY - mouseY) > 2)) {
                    for (var i = 0; i < targets.length; i++) {
                        targets[i].onDragBegin(this.mouseDownX, this.mouseDownY, event.shiftKey, event.ctrlKey, event.altKey);
                        targets[i].onDragUpdate(mouseX - this.mouseDownX, mouseY - this.mouseDownY, event.shiftKey, event.ctrlKey, event.altKey);
                    }
                    this.dragging = true;
                }
            }
        }
        this.mouseX = mouseX;
        this.mouseY = mouseY;
    }
    ;
    onMouseMove(event) {
        this.handleMouseMove(event, event.x, event.y);
    }
    ;
    onMouseWheel(event) {
        this.handleMouseMove(event, event.x, event.y);
        var targets = this.targets;
        for (var i = 0; i < targets.length; i++) {
            // FIXME check delta
            targets[i].onMouseWheel(event.x, event.y, event.deltaY, event.shiftKey, event.ctrlKey, event.altKey);
        }
    }
    ;
    onKeyDown(event) {
        var targets = this.targets;
        for (var i = 0; i < targets.length; i++) {
            targets[i].onKeyDown(event.key, event.shiftKey, event.ctrlKey, event.altKey);
        }
    }
    ;
}
;
//# sourceMappingURL=wb-controls.js.map