// Simple immediate-mode debug draw support.

import { Buffer } from "./wb-buffer.js"
import { Shader } from "./wb-shader.js"
import { View }   from "./wb-util.js";

export class Pen {
  gl   : WebGLRenderingContext;
  buf  : Buffer;
  penX : number = 0;
  penY : number = 0;
  penZ : number = 0;
  penW : number = 1;
  penR : number = 1;
  penG : number = 1;
  penB : number = 1;
  penA : number = 1;

  shader : Shader;

  constructor(gl : WebGLRenderingContext) {
    this.gl = gl;
    this.buf = new Buffer(gl, 'debugdraw', gl.FLOAT, 8, 4096);
    this.shader = new Shader(gl, 'simple.glsl');
  }

  reset() {
    this.buf.cursor = 0;
    this.penX = 0;
    this.penY = 0;
    this.penZ = 0;
    this.penW = 1;
    this.penR = 1;
    this.penG = 1;
    this.penB = 1;
    this.penA = 1;
  }

  color(r : number, g : number, b : number, a : number = 1) {
    this.penR = r;
    this.penG = g;
    this.penB = b;
    this.penA = a;
  };

  moveTo(x : number, y : number, z : number = 0, w : number = 0) {
    this.penX = x;
    this.penY = y;
    this.penZ = z;
    this.penW = w;
  };

  lineTo(x : number, y : number, z : number = 0, w : number = 0) {
    this.pushVert(this.penX, this.penY, this.penZ, this.penW, this.penR, this.penG, this.penB, this.penA);
    this.penX = x;
    this.penY = y;
    this.penZ = z;
    this.penW = w;
    this.pushVert(this.penX, this.penY, this.penZ, this.penW, this.penR, this.penG, this.penB, this.penA);
  };

  strokeRect(x1 : number, y1 : number, x2 : number, y2 : number) {
    this.moveTo(x1, y1);
    this.lineTo(x2, y1);
    this.lineTo(x2, y2);
    this.lineTo(x1, y2);
    this.lineTo(x1, y1);
  };

  pushVert(x : number, y : number, z : number, w : number, r : number, g : number, b : number, a : number) {
    let buf = this.buf;
    if (buf.data.length - buf.cursor < 8) return;

    buf.data[buf.cursor++] = x;
    buf.data[buf.cursor++] = y;
    buf.data[buf.cursor++] = z;
    buf.data[buf.cursor++] = w;
    buf.data[buf.cursor++] = r;
    buf.data[buf.cursor++] = g;
    buf.data[buf.cursor++] = b;
    buf.data[buf.cursor++] = a;
  };

  draw(canvas : HTMLCanvasElement, view : View) {
    if (!this.shader.handle) return;
    let gl = this.gl;
    let buf = this.buf;
    let prog = this.shader.handle;

    gl.useProgram(prog);
    buf.upload();

    let canvasLeft = -Math.round(canvas.width / 2.0);
    let canvasTop = -Math.round(canvas.height / 2.0);

    gl.uniform4f(gl.getUniformLocation(prog, "screenSize"), canvasLeft, canvasTop, 1.0 / canvas.width, 1.0 / canvas.height);
    gl.uniform4f(gl.getUniformLocation(prog, "modelToWorld"), 0, 0, 1, 1);
    gl.uniform4f(gl.getUniformLocation(prog, "worldToView"), -view.origin.x, -view.origin.y, view.scale, view.scale);

    let vpos_loc = gl.getAttribLocation(prog, "vpos");
    let vcol_loc = gl.getAttribLocation(prog, "vcol");
    gl.enableVertexAttribArray(vpos_loc);
    gl.enableVertexAttribArray(vcol_loc);
    gl.vertexAttribPointer(vpos_loc, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(vcol_loc, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.LINES, 0, buf.cursor / 8);

  }

  /*
  draw() {

    //shader.attributes['vpos'].set3f(buffer.glBuffer, 28, 0);
    //shader.attributes['vcol'].set4f(buffer.glBuffer, 28, 12);

    buf.upload();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.handle);
    gl.drawArrays(gl.LINES, 0, buf.cursor / 7);
    buf.cursor = 0;
  };
  */
};
