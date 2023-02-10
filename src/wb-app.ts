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
  lastFrameTime : number = performance.now();

  textShader : Shader;
  librarian : Librarian;
  glyphmap : Texture;

  docbuf : Buffer;

  pen : Pen;
  blitter : Blitter;

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
    this.librarian = new Librarian(gl);

    for (let i = 0; i < 100; i++) {
      this.librarian.loadFakeDocument();
    }
    //this.librarian.loadDirectory('linux');

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

    this.blitter.draw(canvas, view, linemap.texture.handle,   0, -256, 256, 256);
    this.blitter.draw(canvas, view, shelf.texture.handle,   256, -256, 256, 256);
    this.blitter.draw(canvas, view, this.glyphmap.handle,   512, -256, 256, 256);


    /*
    let shader = this.textShader;
    let cursor = Math.floor(performance.now() / 30) % 5000;

    gl.useProgram(shader.program);

    gl.uniform1i(u_docmap,   0);
    gl.uniform1i(u_linemap,  1);
    gl.uniform1i(u_glyphmap, 2);

    gl.uniform2f(u_glyphmapSize, this.glyphmap.width, this.glyphmap.height);
    gl.uniform2f(u_glyphSize,    6, 14);
    gl.uniform2f(u_cellSize,     8, 16);
    gl.uniform2f(u_cursor,       cursor % 80, Math.floor(cursor / 80));
    gl.uniform4f(u_background,   0, 0, 0.2, 1);
    gl.uniform4f(u_foreground,   0.9, 0.9, 0.9, 1);
    gl.uniform1f(u_wavey,        0);
    gl.uniform1f(u_ftime,        (this.appStart - performance.now()) / 1000);

    shader.attributes['vpos'].set2f(this.posBuffer.glBuffer, 8, 0);
    shader.attributes['vtex'].set2f(this.texBuffer.glBuffer, 8, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.glBuffer);



    let s = Math.sin(performance.now() / 100) * 0.02;
    gl.uniform4f(u_lineHighlight, 0.15 + s, 0.15 + s, 0.15 + s, 0.0);

    for (let i = 0; i < this.librarian.shelves.length; i++) {
      let shelf = this.librarian.shelves[i];
      //shader.attributes['iColor'].set4f(shelf.docColorBuffer.glBuffer, 16, 0, true);
      //shader.attributes['iDocPos'].set4f(shelf.docPosBuffer.glBuffer, 16, 0, true);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, shelf.texture.glTexture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, shelf.linemap.texture.glTexture);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.glyphmap.glTexture);

      gl.uniform2f(u_docmapSize, shelf.width, shelf.height);
      gl.uniform2f(u_linemapSize, shelf.linemap.width, shelf.linemap.height);

      // @ts-ignore
      gl.drawElementsInstancedANGLE(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, shelf.documents.length);
    }
    */
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
