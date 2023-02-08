// Simple immediate-mode debug draw support.

import { Shader } from "./wb-shader.js"
import { Buffer } from "./wb-buffer.js"

export class Draw {
  gl : WebGLRenderingContext;

  currentBuffer : Buffer | null; // The buffer we're currently filling.
  bufferPool  : Array<Buffer>; // Pool of empty buffers.
  fullBuffers : Array<Buffer>; // List of full buffers.

  penX : number; // The pen X position.
  penY : number; // The pen Y position.
  penZ : number; // The pen Z position.

  penR : number; // The pen red component.
  penG : number; // The pen green component.
  penB : number; // The pen blue component.
  penA : number; // The pen alpha component.

  penPath : Array<number>; // The current pen path.

  penDown : boolean; // Whether the pen is up or down.

  constructor(gl : WebGLRenderingContext) {
    this.gl = gl;
    this.currentBuffer = null;
    this.bufferPool = [];
    this.fullBuffers = [];
    this.penX = -1;
    this.penY = -1;
    this.penZ = -1;
    this.penR = 1;
    this.penG = 1;
    this.penB = 1;
    this.penA = 1;
    this.penPath = [];
    this.penDown = false;
  }

  color(r : number, g : number, b : number, a : number = 1) {
    this.penR = r;
    this.penG = g;
    this.penB = b;
    this.penA = a;
  };

  moveTo(x : number, y : number, z : number = 0) {
    if (this.penDown) {
      this.flushPath();
      this.penDown = false;
    }
    z = z || 0;
    this.penX = x;
    this.penY = y;
    this.penZ = z;
  };

  lineTo(x : number, y : number, z : number = 0) {
    z = z || 0;
    this.penPath.push(this.penX);
    this.penPath.push(this.penY);
    this.penPath.push(this.penZ);
    this.penPath.push(this.penR);
    this.penPath.push(this.penG);
    this.penPath.push(this.penB);
    this.penPath.push(this.penA);
    this.penX = x;
    this.penY = y;
    this.penZ = z;
    this.penDown = true;
  };

  strokeRect(x1 : number, y1 : number, x2 : number, y2 : number) {
    this.moveTo(x1, y1);
    this.lineTo(x2, y1);
    this.lineTo(x2, y2);
    this.lineTo(x1, y2);
    this.lineTo(x1, y1);
    this.flushPath();
  };

  // Ends the current pen path & adds the primitives it generated to the current buffer.
  flushPath() {
    if (this.penDown) {
      this.penPath.push(this.penX);
      this.penPath.push(this.penY);
      this.penPath.push(this.penZ);
      this.penPath.push(this.penR);
      this.penPath.push(this.penG);
      this.penPath.push(this.penB);
      this.penPath.push(this.penA);
      this.penDown = false;
    }

    let path = this.penPath;
    let count = (path.length / 7) - 1;
    for (let i = 0; i < count; i++) {
      let c = i * 7;
      this.pushSegment(path[c + 0], path[c + 1], path[c + 2], path[c + 3], path[c + 4], path[c + 5], path[c + 6],
                       path[c + 7], path[c + 8], path[c + 9], path[c + 10], path[c + 11], path[c + 12], path[c + 13]);
    }

    this.penPath.length = 0;
  };

  // Adds one line segment to the current buffer.
  pushSegment(x1 : number, y1 : number, z1 : number,
              r1 : number, g1 : number, b1 : number, a1 : number,
              x2 : number, y2 : number, z2 : number,
              r2 : number, g2 : number, b2 : number, a2 : number) {
    if (!this.currentBuffer || (this.currentBuffer.primType != this.gl.LINES)) {
      this.endBuffer();
      this.startBuffer(this.gl.LINES);
    }
    if (!this.currentBuffer) return;

    if ((this.currentBuffer.length - this.currentBuffer.cursor) < 14) {
      this.endBuffer();
      this.startBuffer(this.gl.LINES);
    }

    let data = this.currentBuffer.data!;
    let cursor = this.currentBuffer.cursor;

    data[cursor++] = x1;
    data[cursor++] = y1;
    data[cursor++] = z1;
    data[cursor++] = r1;
    data[cursor++] = g1;
    data[cursor++] = b1;
    data[cursor++] = a1;
    data[cursor++] = x2;
    data[cursor++] = y2;
    data[cursor++] = z2;
    data[cursor++] = r2;
    data[cursor++] = g2;
    data[cursor++] = b2;
    data[cursor++] = a2;

    this.currentBuffer.cursor = cursor;
  };

  startBuffer(primitiveType : GLenum) {
    let nextBuffer = this.bufferPool.pop()!;
    if (!nextBuffer) {
      nextBuffer = new Buffer(this.gl, 'debugdraw', this.gl.DYNAMIC_DRAW);
      // Each buffer can hold 4096 vertices.
      nextBuffer.initDynamic(7, 4096);
    }
    nextBuffer.primType = primitiveType;
    this.currentBuffer = nextBuffer;
  };

  endBuffer() {
    if (this.currentBuffer) {
      this.fullBuffers.push(this.currentBuffer);
      this.currentBuffer = null;
    }
  };

  draw(shader : Shader) {
    this.flushPath();

    if (this.currentBuffer) {
      this.fullBuffers.push(this.currentBuffer);
      this.currentBuffer = null;
    }

    let gl = shader.gl;
    gl.useProgram(shader.glProgram);

    for (let i = 0; i < this.fullBuffers.length; i++) {
      let buffer = this.fullBuffers[i];
      buffer.upload();
      shader.attributes['vpos'].set3f(buffer.glBuffer, 28, 0);
      shader.attributes['vcol'].set4f(buffer.glBuffer, 28, 12);
      gl.drawArrays(gl.LINES, 0, buffer.cursor / 7);
    }

    while (this.fullBuffers.length) {
      let buffer = this.fullBuffers.pop()!;
      buffer.resetCursor();
      this.bufferPool.push(buffer);
    }
  };
};
