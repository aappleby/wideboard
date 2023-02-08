// Handles context creation/destruction, might do state tracking later...

export class Context {
  canvas : HTMLCanvasElement;
  gl_ : WebGLRenderingContext;
  instanceExtension : Object | null;
  frameCounter : number;
  activeProgram : WebGLProgram | null;
  activeArrayBuffer : WebGLBuffer | null;
  activeIndexBuffer : WebGLBuffer | null;
  activeTextures : Array<WebGLTexture>;

  constructor(canvas : HTMLCanvasElement) {
    this.canvas = canvas;
    this.instanceExtension = null;
    this.frameCounter = 0;
    this.activeProgram = null;
    this.activeArrayBuffer = null;
    this.activeIndexBuffer = null;
    this.activeTextures = new Array(32);

    var options = {
      alpha: true,
      depth: true,
      stencil: false,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true
    };

    // @ts-ignore
    this.gl_ = this.canvas.getContext('webgl', options)!;

    var extension = this.gl_.getExtension("ANGLE_instanced_arrays");

    if (extension) {
      for (var name in extension) {
        var val = extension[name];
        if (val && typeof(val) == 'function') {
          // FIXME
          this.gl_[name] = val.bind(extension);
          console.log(name);
        } else {
          this.gl_[name] = val;
        }
      }
      console.log('Extension ANGLE_instanced_arrays installed');
    } else {
      console.log('Extension ANGLE_instanced_arrays not found');
    }
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
    if (this.activeProgram == glProgram) {
      return;
    }
    this.gl.useProgram(glProgram);
    this.activeProgram = glProgram;
  };

  bindIndexBuffer(glBuffer : WebGLBuffer) {
    if (this.activeIndexBuffer == glBuffer) {
      return;
    }
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, glBuffer);
    this.activeIndexBuffer = glBuffer;
  };

  bindArrayBuffer(glBuffer : WebGLBuffer) {
    if (this.activeArrayBuffer == glBuffer) {
      return;
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, glBuffer);
    this.activeArrayBuffer = glBuffer;
  };

  bindTexture(slot : number, glTexture : WebGLTexture) {
    if (this.activeTextures[slot] == glTexture) {
      return;
    }
    this.gl.activeTexture(this.gl.TEXTURE0 + slot);
    this.gl.bindTexture(this.gl.TEXTURE_2D, glTexture);
    this.activeTextures[slot] = glTexture;
  };
  */
};
