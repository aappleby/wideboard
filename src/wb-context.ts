// Handles context creation/destruction, might do state tracking later...

export class Context {
  canvas : HTMLCanvasElement;
  gl_ : WebGLRenderingContext;
  instanceExtension : Object | null;
  frameCounter : number;
  activeIndexBuffer : WebGLBuffer | null;
  activeTextures : Array<WebGLTexture>;

  constructor(canvas : HTMLCanvasElement) {
    this.canvas = canvas;
    this.instanceExtension = null;
    this.frameCounter = 0;
    this.activeIndexBuffer = null;
    this.activeTextures = new Array(32);
  }

  getGl() {
    return this.gl_;
  };

  beginFrame() {
    this.frameCounter++;
  }

  endFrame() {
  }

  /**
  bindProgram(glProgram : WebGLProgram) {
    this.gl.useProgram(glProgram);
  };

  bindIndexBuffer(glBuffer : WebGLBuffer) {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, glBuffer);
  };

  bindArrayBuffer(glBuffer : WebGLBuffer) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, glBuffer);
  };

  bindTexture(slot : number, glTexture : WebGLTexture) {
    this.gl.activeTexture(this.gl.TEXTURE0 + slot);
    this.gl.bindTexture(this.gl.TEXTURE_2D, glTexture);
  };
  */
};
