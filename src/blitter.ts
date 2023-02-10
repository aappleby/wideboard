import { Buffer }  from "./wb-buffer.js"
import { Shader }  from "./wb-shader.js"
import { Texture } from "./wb-texture.js"
import { View }    from "./wb-util.js";

export class Blitter {
  gl : WebGLRenderingContext;
  texShader : Shader;
  square : Buffer;
  white_texel : Texture;

  constructor(gl : WebGLRenderingContext) {
    this.gl = gl;

    let square_data = [
      0, 0, 0, 1,   1, 1, 1, 1,   0, 0, 0, 1,
      1, 0, 0, 1,   1, 1, 1, 1,   1, 0, 0, 1,
      0, 1, 0, 1,   1, 1, 1, 1,   0, 1, 0, 1,
      1, 1, 0, 1,   1, 1, 1, 1,   1, 1, 0, 1,
    ];

    this.square = new Buffer(gl, 'square', gl.FLOAT, 12, 4, square_data);
    this.texShader = new Shader(gl, "blitter.glsl");
    this.white_texel = new Texture(gl, gl.LUMINANCE, 1, 1);

    gl.bindTexture(gl.TEXTURE_2D, this.white_texel.handle);
    gl.texImage2D(
      gl.TEXTURE_2D, 0,
      gl.LUMINANCE, 1, 1, 0,
      gl.LUMINANCE, gl.UNSIGNED_BYTE,
      new Uint8Array([255, 255, 255, 255]));
  }

  draw(canvas : HTMLCanvasElement, view : View, tex_handle : WebGLTexture, x : number, y : number, w : number, h : number) {
    let gl = this.gl;

    let prog = this.texShader.handle;
    gl.useProgram(prog);

    let canvasLeft = -Math.round(canvas.width / 2.0);
    let canvasTop = -Math.round(canvas.height / 2.0);

    let ss  = gl.getUniformLocation(prog, "screenSize");
    let m2w = gl.getUniformLocation(prog, "modelToWorld");
    let w2v = gl.getUniformLocation(prog, "worldToView");
    let tex = gl.getUniformLocation(prog, "texture");

    gl.uniform4f(ss,  canvasLeft, canvasTop, 1.0 / canvas.width, 1.0 / canvas.height);
    gl.uniform4f(m2w, x, y, w, h);
    gl.uniform4f(w2v, -view.origin.x, -view.origin.y, view.scale, view.scale);
    gl.uniform1i(tex, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex_handle);

    let vpos_loc = gl.getAttribLocation(prog, "vpos");
    let vcol_loc = gl.getAttribLocation(prog, "vcol");
    let vtex_loc = gl.getAttribLocation(prog, "vtex");

    this.square.bind();
    gl.enableVertexAttribArray(vpos_loc);
    gl.enableVertexAttribArray(vcol_loc);
    gl.enableVertexAttribArray(vtex_loc);
    gl.vertexAttribPointer(vpos_loc, 4, gl.FLOAT, false, 48,  0);
    gl.vertexAttribPointer(vcol_loc, 4, gl.FLOAT, false, 48, 16);
    gl.vertexAttribPointer(vtex_loc, 4, gl.FLOAT, false, 48, 32);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
};
