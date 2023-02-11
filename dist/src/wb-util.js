//--------------------------------------------------------------------------------
export class Vec2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
}
;
//--------------------------------------------------------------------------------
export class Rect {
    top;
    left;
    width;
    height;
    constructor(top, left, width, height) {
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
    }
    clone() {
        return new Rect(this.top, this.left, this.width, this.height);
    }
}
;
//--------------------------------------------------------------------------------
export class Color {
    r;
    g;
    b;
    a;
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}
;
//--------------------------------------------------------------------------------
export class View {
    origin;
    scale;
    constructor(origin, scale) {
        this.origin = origin !== undefined ? origin.clone() : new Vec2(0, 0);
        this.scale = scale !== undefined ? scale : 1;
    }
    copy(view) {
        this.origin.x = view.origin.x;
        this.origin.y = view.origin.y;
        this.scale = view.scale;
    }
    ;
    clone() {
        return new View(this.origin.clone(), this.scale);
    }
    ;
}
;
//--------------------------------------------------------------------------------
export function ease(value, goal, delta) {
    if (value == goal)
        return value;
    var oldValue = value;
    var t = 1.0 - Math.pow(0.1, delta / 80);
    value += (goal - value) * t;
    if (value == oldValue) {
        value = goal;
    }
    return value;
}
;
//--------------------------------------------------------------------------------
export function easeRect(value, goal, delta) {
    value.top = ease(value.top, goal.top, delta);
    value.left = ease(value.left, goal.left, delta);
    value.width = ease(value.width, goal.width, delta);
    value.height = ease(value.height, goal.height, delta);
}
;
//--------------------------------------------------------------------------------
export function easeView(view, goal, delta, canvas) {
    view.origin.x = ease(view.origin.x, goal.origin.x, delta);
    view.origin.y = ease(view.origin.y, goal.origin.y, delta);
    view.scale = 1.0 / ease(1.0 / view.scale, 1.0 / goal.scale, delta);
    // If we're within 0.01% of the goal scale and 0.01 of a pixel of the goal
    // origin, snap to the goal.
    var ds = view.scale / goal.scale;
    var dx = worldToScreenX(0, view, canvas) - worldToScreenX(0, goal, canvas);
    var dy = worldToScreenY(0, view, canvas) - worldToScreenY(0, goal, canvas);
    var dist = Math.sqrt(dx * dx + dy * dy);
    console.log(dist);
    if ((ds > (1 / 1.0001)) && (ds < 1.0001) && (dist < 0.01)) {
        view.origin.x = goal.origin.x;
        view.origin.y = goal.origin.y;
        view.scale = goal.scale;
        return true;
    }
    return false;
}
;
//--------------------------------------------------------------------------------
// Translates a view so that its origin falls exactly on a pixel center.
export function snapView(view, canvas) {
    var x = worldToScreenX(0, view, canvas);
    var y = worldToScreenY(0, view, canvas);
    x = Math.round(x);
    y = Math.round(y);
    x = screenToWorldX(x, canvas, view);
    y = screenToWorldY(y, canvas, view);
    view.origin.x -= x;
    view.origin.y -= y;
}
;
//--------------------------------------------------------------------------------
export function screenToWorld(v, canvas, view, out) {
    var screenCenterX = Math.round(canvas.width / 2);
    var screenCenterY = Math.round(canvas.height / 2);
    var x = v.x;
    var y = v.y;
    x -= screenCenterX;
    y -= screenCenterY;
    x /= view.scale;
    y /= view.scale;
    x += view.origin.x;
    y += view.origin.y;
    out.x = x;
    out.y = y;
}
;
//--------------------------------------------------------------------------------
export function screenToWorldX(x, canvas, view) {
    x -= Math.round(canvas.width / 2);
    x /= view.scale;
    x += view.origin.x;
    return x;
}
;
//--------------------------------------------------------------------------------
export function screenToWorldY(y, canvas, view) {
    y -= Math.round(canvas.height / 2);
    y /= view.scale;
    y += view.origin.y;
    return y;
}
;
//--------------------------------------------------------------------------------
export function worldToScreen(v, view, canvas, out) {
    var screenCenterX = Math.round(canvas.width / 2);
    var screenCenterY = Math.round(canvas.height / 2);
    var x = v.x;
    var y = v.y;
    x -= view.origin.x;
    y -= view.origin.y;
    x *= view.scale;
    y *= view.scale;
    x += screenCenterX;
    y += screenCenterY;
    out.x = x;
    out.y = y;
}
;
//--------------------------------------------------------------------------------
export function worldToScreenX(x, view, canvas) {
    x -= view.origin.x;
    x *= view.scale;
    x += Math.round(canvas.width / 2);
    return x;
}
;
//--------------------------------------------------------------------------------
export function worldToScreenY(y, view, canvas) {
    y -= view.origin.y;
    y *= view.scale;
    y += Math.round(canvas.height / 2);
    return y;
}
;
//--------------------------------------------------------------------------------
// Scans a text file (represented as a blob) for line ends & returns an array
// of all the line start indices in the file.
export function findLines(bytes) {
    let lines = [];
    let cursor = 0;
    // Skip byte order mark if present.
    if (bytes[0] == 239) {
        cursor = 3;
    }
    for (var i = cursor; i < bytes.length; i++) {
        if (bytes[i] == 10) {
            var lineLength = i - cursor;
            lines.push(cursor);
            cursor = i + 1;
        }
    }
    if (cursor < bytes.length) {
        lines.push(cursor);
    }
    return lines;
}
;
//--------------------------------------------------------------------------------
//# sourceMappingURL=wb-util.js.map