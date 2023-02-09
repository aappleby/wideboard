import { Buffer } from "./wb-buffer.js"
import { Camera } from "./wb-camera.js"
import { Context } from "./wb-context.js"
import { Controls } from "./wb-controls.js"
import { Document } from "./wb-document.js"
import { Draw } from "./wb-draw.js"
import { Grid } from "./wb-grid.js"
import { Librarian } from "./wb-librarian.js"
import { Linemap } from "./wb-linemap.js"
import { Shader } from "./wb-shader.js"
import { Shelf } from "./wb-shelf.js"
import { Texture } from "./wb-texture.js"
import { Uniform } from "./wb-uniform.js"
import { Vec2 } from "./wb-util.js"

export class App {
  name : string;
  context : Context;
  extension : Object | null;
  frameCounter : number;
  lastFrameTime : number;
  posBuffer : Buffer;
  colBuffer : Buffer;
  texBuffer : Buffer;
  indexBuffer : Buffer;
  simpleShader : Shader;
  texShader : Shader;
  textShader : Shader;
  texture : Texture;
  librarian : Librarian;
  glyphmap : Texture;
  controls : Controls;
  debugDraw : Draw;
  grid : Grid;
  camera : Camera;
  frameCallback : (time : number) => void;
  uniforms : Map<string, Uniform>;
  appStart : number;
  pickX : number;
  pickY : number;

  constructor(canvasElementId : string) {
    let canvas : HTMLCanvasElement = document.getElementById(canvasElementId)! as HTMLCanvasElement;
    if (!canvas) console.log('No canvas element!');
    let context = new Context(canvas);
    let gl = context.getGl();

    this.name = 'Wideboard';
    this.context = context;
    this.extension = null;
    this.frameCounter = 0;
    this.lastFrameTime = performance.now();
    this.posBuffer = new Buffer(gl, 'vpos', gl.STATIC_DRAW);
    this.colBuffer = new Buffer(gl, 'iColor', gl.STATIC_DRAW);
    this.texBuffer = new Buffer(gl, 'vtex', gl.STATIC_DRAW);
    this.indexBuffer = new Buffer(gl, 'indices', gl.STATIC_DRAW);
    this.simpleShader = new Shader(gl, 'simple.glsl', this.uniforms);
    this.texShader = new Shader(gl, 'texture.glsl', this.uniforms);
    this.textShader = new Shader(gl, 'text1.glsl', this.uniforms);

    this.texture = new Texture(gl, 128, 128, gl.RGBA, true);
    this.texture.makeNoise();

    this.librarian = new Librarian(context);
    this.glyphmap = new Texture(gl, 256, 256, gl.LUMINANCE, true);
    this.controls = new Controls();
    this.debugDraw = new Draw(gl);
    this.camera = new Camera(gl);
    this.grid = new Grid(this.debugDraw, this.camera);
    this.frameCallback = this.onRequestAnimationFrame.bind(this);

    this.uniforms = new Map<string, Uniform>();
    this.uniforms['screenSize'] = new Uniform(gl, 'screenSize', gl.FLOAT_VEC4);
    this.uniforms['modelToWorld'] = new Uniform(gl, 'modelToWorld', gl.FLOAT_VEC4);
    this.uniforms['worldToView'] = new Uniform(gl, 'worldToView', gl.FLOAT_VEC4);

    this.appStart = performance.now();
    this.pickX = 0;
    this.pickY = 0;

    // Hook the controls up.
    this.controls.install(canvas);
    this.controls.addTarget(this.camera);

    this.posBuffer.initVec2([
      0, 0,
      0, 1,
      1, 1,
      1, 0
    ]);

    this.colBuffer.initVec4([
      0.5, 0.0, 0.5, 1.0,
      1.0, 0.5, 0.0, 1.0,
      0.5, 1.0, 0.5, 1.0,
      0.0, 0.5, 1.0, 1.0
    ]);

    this.texBuffer.initVec2([
      0, 0,
      0, 1,
      1, 1,
      1, 0
    ]);

    this.indexBuffer.initIndex8([
      0, 1, 2,
      0, 2, 3
    ]);

    this.glyphmap.load('terminus.bmp');
    this.librarian.loadDirectory('linux');
  }

  update(delta : number) {
    this.camera.update(delta);

    let lerpFactor = 1.0 - Math.pow(0.1, delta / 80);
    this.pickX += (this.controls.mouseDownX - this.pickX) * lerpFactor;
    this.pickY += (this.controls.mouseDownY - this.pickY) * lerpFactor;
  };


  // Handles pre-draw bookkeeping.
  beginFrame() {
    if (!this.context) return false;

    if (!this.simpleShader) return false;
    if (!this.simpleShader.ready) return false;
    if (!this.texShader) return false;
    if (!this.texShader.ready) return false;

    let canvas = this.context.canvas;
    if ((canvas.width != canvas.clientWidth) ||
        (canvas.height != canvas.clientHeight)) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    return true;
  };

  //======================================================================================================================
  // Main render function.

  render() {
    let canvas = this.context.canvas;
    let gl = this.context.getGl();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3, 0.3, 0.4, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let view = this.camera.viewSnap;

    let canvasLeft = -Math.round(canvas.width / 2.0);
    let canvasTop = -Math.round(canvas.height / 2.0);

    this.uniforms['screenSize'].set(canvasLeft, canvasTop, 1.0 / canvas.width, 1.0 / canvas.height);
    this.uniforms['modelToWorld'].set(0, 0, 1, 1);
    this.uniforms['worldToView'].set(-view.origin.x, -view.origin.y,
                                     view.scale, view.scale);

    this.grid.draw();
    gl.useProgram(this.simpleShader.glProgram);
    this.uniforms['modelToWorld'].set(0, 0, 1, 1);
    this.simpleShader.setUniforms();
    this.debugDraw.draw(this.simpleShader);
    gl.useProgram(null);

    // Draw textured boxes for shelf
    if (this.posBuffer && this.texBuffer && this.indexBuffer) {

      let shader = this.texShader;

      gl.useProgram(shader.glProgram);

      shader.uniforms['texture'].set1i(0);
      shader.attributes['vpos'].set2f(this.posBuffer.glBuffer, 8, 0);
      shader.attributes['vtex'].set2f(this.texBuffer.glBuffer, 8, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.glBuffer);

      gl.activeTexture(gl.TEXTURE0);

      let shelf = this.librarian.shelves[0];
      let linemap = shelf.linemap;

      gl.bindTexture(gl.TEXTURE_2D, linemap.texture.glTexture);
      this.uniforms['modelToWorld'].set(0,
                                        -linemap.height - 100,
                                        linemap.width,
                                        linemap.height);
      shader.setUniforms();
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

      gl.disable(gl.BLEND);
      gl.bindTexture(gl.TEXTURE_2D, shelf.texture.glTexture);
      this.uniforms['modelToWorld'].set(linemap.width, -linemap.height - 100, shelf.width, shelf.height);
      shader.setUniforms();
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
    }

    if (this.posBuffer && this.texBuffer && this.indexBuffer) {

      let shader = this.textShader;

      gl.useProgram(shader.glProgram);
      gl.enable(gl.BLEND);

      shader.uniforms['glyphmap'].set1i(2);
      shader.uniforms['glyphmapSize'].set2f(this.glyphmap.width, this.glyphmap.height);
      shader.uniforms['glyphSize'].set2f(6, 14);
      shader.uniforms['cellSize'].set2f(8, 16);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.glyphmap.glTexture);


      shader.attributes['vpos'].set2f(this.posBuffer.glBuffer, 8, 0);


      //----------

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.glBuffer);

      let cursor = Math.floor(performance.now() / 30) % 5000;

      shader.uniforms['cursor'].set(cursor % 80, Math.floor(cursor / 80));
      shader.uniforms['background'].set(0, 0, 0.2, 1);
      shader.uniforms['foreground'].set(0.9, 0.9, 0.9, 1);
      //shader.uniforms['wavey'].set(wavey);
      shader.uniforms['wavey'].set(0);
      shader.uniforms['ftime'].set((this.appStart - performance.now()) / 1000);

      let s = Math.sin(performance.now() / 100) * 0.02;
      shader.uniforms['lineHighlight'].set(0.15 + s, 0.15 + s, 0.15 + s, 0.0);

      /*
      for (let i = 0; i < shelf.documents.length; i++) {
        shelf.docPosBuffer.data[i * 4] = Math.sin(performance.now() / 10000 + i) * 100000 + 50000;
      }
      shelf.docPosBuffer.uploadDirty(0, shelf.documents.length);
      */

      for (let i = 0; i < this.librarian.shelves.length; i++) {
        let shelf = this.librarian.shelves[i];

        shader.uniforms['docmap'].set1i(0);
        shader.uniforms['docmapSize'].set2f(shelf.width, shelf.height);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, shelf.texture.glTexture);

        shader.uniforms['linemap'].set1i(1);
        shader.uniforms['linemapSize'].set2f(shelf.linemap.width, shelf.linemap.height);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, shelf.linemap.texture.glTexture);

        shader.attributes['iColor'].set4f(shelf.docColorBuffer.glBuffer, 16, 0, true);
        shader.attributes['iDocPos'].set4f(shelf.docPosBuffer.glBuffer, 16, 0, true);

        shader.setUniforms();

        // @ts-ignore
        gl.drawElementsInstancedANGLE(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, shelf.documents.length);
      }
    }
  }

  //======================================================================================================================

  endFrame() {
  }

  //======================================================================================================================
  // requestAnimationFrame callback.

  onRequestAnimationFrame(time : number) {
    let delta = time - this.lastFrameTime;
    this.frameCounter++;

    this.update(delta);

    if (this.beginFrame()) {
      this.render();
      this.endFrame();
    }

    //assert(!gl.getError());

    this.lastFrameTime = time;

    window.requestAnimationFrame(this.frameCallback);
  }

  //======================================================================================================================
  // Entry point for the Wideboard app.

  run(canvasElementId : string) {
    window.requestAnimationFrame(this.frameCallback);
  };

};
