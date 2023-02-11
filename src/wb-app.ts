import { Buffer } from "./wb-buffer.js"
import { Camera } from "./wb-camera.js"
import { Controls } from "./wb-controls.js"
import { Pen } from "./wb-draw.js"
import { Librarian } from "./wb-librarian.js"
import { Shader } from "./wb-shader.js"
import { Texture } from "./wb-texture.js"
import { init_gl } from "./gl-base.js"
import { Blitter } from "./blitter.js"

//------------------------------------------------------------------------------

export class App {

  canvas : HTMLCanvasElement;
  gl : WebGLRenderingContext;
  camera : Camera;
  controls : Controls;

  frameCallback : (time : number) => void;
  frameCounter : number = 0;
  appStart : number = performance.now();
  lastFrameTime : number = performance.now();

  textShader : Shader;
  librarian : Librarian;
  glyphmap : Texture;

  square : Buffer;
  doc_inst : Buffer;

  pen : Pen;
  blitter : Blitter;

  grid_x : number = 16;
  grid_y : number = 16;

  //----------------------------------------

  constructor(canvasElementId : string) {
    console.log("App::constructor()");

    let canvas : HTMLCanvasElement = document.getElementById(canvasElementId)! as HTMLCanvasElement;

    var options = {
      alpha: true,
      depth: true,
      stencil: false,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true
    };

    let gl = canvas.getContext('webgl', options)! as WebGLRenderingContext;

    console.log("GL : " + gl);
    init_gl(gl);

    this.canvas = canvas;
    this.gl = gl;
    this.camera = new Camera(canvas);
    this.controls = new Controls();
    this.controls.install(canvas);
    this.controls.addTarget(this.camera);

    this.blitter = new Blitter(gl);

    this.frameCallback = this.onRequestAnimationFrame.bind(this);
    this.pen = new Pen(gl);

    this.textShader = new Shader(gl, 'text1.glsl');
    this.glyphmap = new Texture(gl, gl.LUMINANCE, 256, 256);
    this.glyphmap.load('terminus.bmp');

    let square_verts = [
      0,0,
      0,1,
      1,1,
      0,0,
      1,1,
      1,0,
    ];
    this.square = new Buffer(gl, "square", gl.FLOAT, 2, 1024, square_verts);

    let inst_verts = [];

    for (let x = 0; x < this.grid_x; x++) {
      for (let y = 0; y < this.grid_y; y ++) {
        inst_verts = inst_verts.concat(
          [
            0.2,0.2,0.2,1.0,
            x * 768, y * 640,
            22,
            //4038,
            (x + y * this.grid_x) * 22]);
      }
    }
    this.doc_inst = new Buffer(gl, "doc_inst", gl.FLOAT, 8, 65536, inst_verts);

    this.librarian = new Librarian(gl);

    /*
    for (let i = 0; i < this.grid_x * this.grid_y; i++) {
      this.librarian.loadFakeDocument();
    }
    */

    //this.librarian.loadDirectory('../docs');
    //this.librarian.loadDocument("../Metron/src/MtCursor.cpp");
    this.librarian.loadDirectory("../Metron/");

    let shelf = this.librarian.shelves[0];
    console.log(shelf);

    console.log("App::constructor() done");
  }

  //----------------------------------------
  // Main render function.

  render() {
    let gl = this.gl;
    let canvas = this.canvas;
    let view = this.camera.viewSnap;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3, 0.3, 0.4, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    {
      let pen = this.pen;
      pen.reset();
      pen.color(0.23, 0.23, 0.23);
      let interval = 16;
      for (let i = -1024; i <= 1024; i += interval) {
        pen.moveTo(i, -1024);
        pen.lineTo(i,  1024);
        pen.moveTo(-1024, i);
        pen.lineTo( 1024, i);
      }
      pen.draw(canvas, view);
    }

    let shelf = this.librarian.shelves[0];
    let linemap = shelf.linemap;

    this.blitter.draw(canvas, view, linemap.texture.handle,        0, -256 - 16, 256, 256);
    this.blitter.draw(canvas, view, shelf.texture.handle,   256 + 16, -256 - 16, 256, 256);
    this.blitter.draw(canvas, view, this.glyphmap.handle,   512 + 32, -256 - 16, 256, 256);

    {
      let shader = this.textShader;
      let prog = shader.handle;
      let cursor = Math.floor(performance.now() / 30) % 5000;

      gl.useProgram(prog);

      let shelf = this.librarian.shelves[0];

      //----------
      // Textures

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, shelf.texture.handle);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, shelf.linemap.texture.handle);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.glyphmap.handle);

      //----------
      // Uniforms

      let u_worldToView = gl.getUniformLocation(prog, "worldToView");
      let u_screenSize  = gl.getUniformLocation(prog, "screenSize");

      let canvasLeft = -Math.round(canvas.width / 2.0);
      let canvasTop  = -Math.round(canvas.height / 2.0);

      gl.uniform4f(u_screenSize,  canvasLeft, canvasTop, 1.0 / canvas.width, 1.0 / canvas.height);
      gl.uniform4f(u_worldToView, -view.origin.x, -view.origin.y, view.scale, view.scale);

      let u_docmap   = gl.getUniformLocation(prog, "docmap");
      let u_linemap  = gl.getUniformLocation(prog, "linemap");
      let u_glyphmap = gl.getUniformLocation(prog, "glyphmap");

      gl.uniform1i(u_docmap,   0);
      gl.uniform1i(u_linemap,  1);
      gl.uniform1i(u_glyphmap, 2);

      let u_background    = gl.getUniformLocation(prog, "background");
      let u_foreground    = gl.getUniformLocation(prog, "foreground");
      let u_lineHighlight = gl.getUniformLocation(prog, "lineHighlight");
      let u_cursor        = gl.getUniformLocation(prog, "cursor");
      let u_wavey         = gl.getUniformLocation(prog, "wavey");
      let u_ftime         = gl.getUniformLocation(prog, "ftime");

      let s = Math.sin(performance.now() / 100) * 0.02;

      gl.uniform4f(u_background,   0, 0, 0.2, 1);
      gl.uniform4f(u_foreground,   0.9, 0.9, 0.9, 1);
      gl.uniform4f(u_lineHighlight, 0.15 + s, 0.15 + s, 0.15 + s, 0.0);
      gl.uniform2f(u_cursor,       cursor % 80, Math.floor(cursor / 80));
      gl.uniform1f(u_wavey,        0);
      gl.uniform1f(u_ftime,        (this.appStart - performance.now()) / 1000);

      //----------
      // Vertex Buffer

      let loc_vpos = gl.getAttribLocation(prog, "vpos");
      let loc_icol = gl.getAttribLocation(prog, "iColor");
      let loc_idoc = gl.getAttribLocation(prog, "iDocPos");

      /*

      if (loc_vpos >= 0) gl.enableVertexAttribArray(loc_vpos);
      if (loc_icol >= 0) gl.enableVertexAttribArray(loc_icol);
      if (loc_idoc >= 0) gl.enableVertexAttribArray(loc_idoc);
      if (loc_vpos >= 0) gl.vertexAttribPointer(loc_vpos, 2, gl.FLOAT, false, 40,  0);
      if (loc_icol >= 0) gl.vertexAttribPointer(loc_icol, 4, gl.FLOAT, false, 40,  8);
      if (loc_idoc >= 0) gl.vertexAttribPointer(loc_idoc, 4, gl.FLOAT, false, 40, 24);

      gl.drawArrays(gl.TRIANGLES, 0, 6 * 3);
      */

      let ext = gl.getExtension('ANGLE_instanced_arrays');
      //console.log(ext);

      //gl.bindBuffer(gl.ARRAY_BUFFER, shelf.docBuffer.handle);
      //gl.bufferData(gl.ARRAY_BUFFER, shelf.docBuffer.data, gl.DYNAMIC_DRAW);


      if (loc_vpos >= 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.square.handle);
        gl.enableVertexAttribArray(loc_vpos);
        gl.vertexAttribPointer(loc_vpos, 2, gl.FLOAT, false, 8,  0);
        ext.vertexAttribDivisorANGLE(loc_vpos, 0);
      }
      if (loc_icol >= 0) {
        //gl.bindBuffer(gl.ARRAY_BUFFER, this.doc_inst.handle);
        gl.bindBuffer(gl.ARRAY_BUFFER, shelf.docBuffer.handle);
        gl.enableVertexAttribArray(loc_icol);
        gl.vertexAttribPointer(loc_icol, 4, gl.FLOAT, false, 32,  0);
        ext.vertexAttribDivisorANGLE(loc_icol, 1);
      }
      if (loc_idoc >= 0) {
        //gl.bindBuffer(gl.ARRAY_BUFFER, this.doc_inst.handle);
        gl.bindBuffer(gl.ARRAY_BUFFER, shelf.docBuffer.handle);
        gl.enableVertexAttribArray(loc_idoc);
        gl.vertexAttribPointer(loc_idoc, 4, gl.FLOAT, false, 32,  16);
        ext.vertexAttribDivisorANGLE(loc_idoc, 1);
      }
      //gl.drawArrays(gl.TRIANGLES, 0, 6 * 3);
      //ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, this.grid_x * this.grid_y);
      //ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, 3);
      ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, shelf.documents.length);

      ext.vertexAttribDivisorANGLE(0, 0);
      ext.vertexAttribDivisorANGLE(1, 0);
      ext.vertexAttribDivisorANGLE(2, 0);
    }
  }

  //----------------------------------------
  // requestAnimationFrame callback.

  onRequestAnimationFrame(time : number) {
    this.frameCounter++;

    let top_span = document.getElementById("top_span")!;
    top_span.innerText = "Frame counter " + this.frameCounter;

    let delta = time - this.lastFrameTime;
    this.camera.update(delta);
    this.render();
    this.lastFrameTime = time;

    let bot_span = document.getElementById("bot_span")!;
    bot_span.innerText = "Frame delta " + delta;

    let err = this.gl.getError();
    if (err) {
      console.log("GL error: " + err);
    }

    window.requestAnimationFrame(this.frameCallback);
  }

};

//======================================================================================================================

window.onload = function () {
  console.log("Starting Wideboard");
  let app = new App("canvas");
  window.requestAnimationFrame(app.frameCallback);
};
