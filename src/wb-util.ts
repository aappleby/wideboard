
//--------------------------------------------------------------------------------

export class Vec2 {
  x : number;
  y : number;

  constructor(x : number, y : number) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }
};

//--------------------------------------------------------------------------------

export class Rect {
  top : number;
  left : number;
  width : number;
  height : number;

  constructor(top : number, left : number, width : number, height : number) {
    this.top = top;
    this.left = left;
    this.width = width;
    this.height = height;
  }

  clone() {
    return new Rect(this.top, this.left, this.width, this.height);
  }
};

//--------------------------------------------------------------------------------

export class Color {
  r : number;
  g : number;
  b : number;
  a : number;

  constructor(r : number, g : number, b : number, a : number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
};

//--------------------------------------------------------------------------------

export class View  {
  origin : Vec2;
  scale : number;

  constructor(origin : Vec2 = new Vec2(0,0), scale : number = 1) {
    this.origin = origin;
    this.scale = scale;
  }

  copy(view : View) {
    this.origin.x = view.origin.x;
    this.origin.y = view.origin.y;
    this.scale = view.scale;
  };

  clone() {
    return new View(this.origin.clone(), this.scale);
  };
};

//--------------------------------------------------------------------------------

export function ease(value : number, goal : number, delta : number) {
  if (value == goal) return value;
  var oldValue = value;
  var t = 1.0 - Math.pow(0.1, delta / 80);
  value += (goal - value) * t;
  if (value == oldValue) {
    value = goal;
  }
  return value;
};

//--------------------------------------------------------------------------------

export function easeRect(value : Rect, goal : Rect, delta : number) {
  value.top = ease(value.top, goal.top, delta);
  value.left = ease(value.left, goal.left, delta);
  value.width = ease(value.width, goal.width, delta);
  value.height = ease(value.height, goal.height, delta);
};

//--------------------------------------------------------------------------------

export function easeView(view : View, goal : View, delta : number, canvas : HTMLCanvasElement) : boolean {
  view.origin.x = ease(view.origin.x, goal.origin.x, delta);
  view.origin.y = ease(view.origin.y, goal.origin.y, delta);
  view.scale = 1.0 / ease(1.0 / view.scale, 1.0 / goal.scale, delta);

  // If we're within 0.01% of the goal scale and 0.01 of a pixel of the goal
  // origin, snap to the goal.
  var ds = view.scale / goal.scale;
  var dx = worldToScreenX(0, view, canvas) - worldToScreenX(0, goal, canvas);
  var dy = worldToScreenY(0, view, canvas) - worldToScreenY(0, goal, canvas);
  var dist = Math.sqrt(dx * dx + dy * dy);

  if ((ds > (1 / 1.0001)) && (ds < 1.0001) && (dist < 0.01)) {
    view.origin.x = goal.origin.x;
    view.origin.y = goal.origin.y;
    view.scale = goal.scale;
    return true;
  }

  return false;
};

//--------------------------------------------------------------------------------
// Translates a view so that its origin falls exactly on a pixel center.

export function snapView(view : View, canvas : HTMLCanvasElement) {
  var x = worldToScreenX(0, view, canvas);
  var y = worldToScreenY(0, view, canvas);

  x = Math.round(x);
  y = Math.round(y);

  x = screenToWorldX(x, canvas, view);
  y = screenToWorldY(y, canvas, view);

  view.origin.x -= x;
  view.origin.y -= y;
};

//--------------------------------------------------------------------------------

export function screenToWorld(v : Vec2, canvas : HTMLCanvasElement, view : View, out : Vec2) {
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
};

//--------------------------------------------------------------------------------

export function screenToWorldX(x : number, canvas : HTMLCanvasElement, view : View) {
  x -= Math.round(canvas.width / 2);
  x /= view.scale;
  x += view.origin.x;
  return x;
};

//--------------------------------------------------------------------------------

export function screenToWorldY(y : number, canvas : HTMLCanvasElement, view : View) {
  y -= Math.round(canvas.height / 2);
  y /= view.scale;
  y += view.origin.y;
  return y;
};

//--------------------------------------------------------------------------------

export function worldToScreen(v : Vec2, view : View, canvas : HTMLCanvasElement, out : Vec2) {
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
};

//--------------------------------------------------------------------------------

export function worldToScreenX(x : number, view : View, canvas : HTMLCanvasElement) {
  x -= view.origin.x;
  x *= view.scale;
  x += Math.round(canvas.width / 2);
  return x;
};

//--------------------------------------------------------------------------------

export function worldToScreenY(y : number, view : View, canvas : HTMLCanvasElement) {
  y -= view.origin.y;
  y *= view.scale;
  y += Math.round(canvas.height / 2);
  return y;
};

//--------------------------------------------------------------------------------
