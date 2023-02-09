// Simple texture class.

export class Texture {
  gl : WebGLRenderingContext;
  glTexture : WebGLTexture;
  texHalf : WebGLTexture;
  texQuarter : WebGLTexture;
  width : number;
  height : number;
  format : GLenum;
  filter : boolean;
  ready : boolean;

  constructor(gl : WebGLRenderingContext, width : number, height : number, format : GLenum, filter : boolean) {
    this.gl = gl;
    this.glTexture = gl.createTexture()!;
    this.texHalf = gl.createTexture()!;
    this.texQuarter = gl.createTexture()!;
    this.width = width;
    this.height = height;
    this.format = format;
    this.filter = filter;
    this.ready = false;

    let gl_filter = this.filter ? gl.LINEAR : gl.NEAREST;

    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl_filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, this.format,
                  this.width, this.height, 0,
                  this.format, gl.UNSIGNED_BYTE, null);
  }

  extractBytes(image : HTMLImageElement) {
    let canvas = document.createElement('canvas');
    // @ts-ignore
    canvas.width = image.width;
    // @ts-ignore
    canvas.height = image.height;
    let context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    let buffer = context.getImageData(0, 0, canvas.width, canvas.height).data;
    return buffer;
  }

  downscale(buffer : Uint8Array, width : number, height : number) {
    let width2 = width / 2;
    let height2 = height / 2;

    let out = new Uint8Array(width2 * height2);

    for (let j = 0; j < height2; j++) {
      for (let i = 0; i < width2; i++) {
        let sum = 0;
        sum += buffer[(i * 2 + 0) + (j * 2 + 0) * width];
        sum += buffer[(i * 2 + 0) + (j * 2 + 1) * width];
        sum += buffer[(i * 2 + 1) + (j * 2 + 0) * width];
        sum += buffer[(i * 2 + 1) + (j * 2 + 1) * width];
        out[i + j * width2] = sum / 4;
      }
    }

    return out;
  }

  load(url : string) {
    let gl = this.gl;
    let image = new HTMLImageElement();
    let self = this;
    image.onload = () => {
      self.width = image.width;
      self.height = image.height;

      if (self.format == gl.LUMINANCE) {
        let rgba = self.extractBytes(image);
        let luminance = new Uint8Array(rgba.length / 4);
        for (let i = 0; i < luminance.length; i++) {
          luminance[i] = rgba[i * 4];
        }
        //luminance = downscale(luminance, self.width, self.height);
        //self.width /= 2;
        //self.height /= 2;
        gl.bindTexture(gl.TEXTURE_2D, self.glTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, self.format,
                      self.width, self.height, 0,
                      self.format, gl.UNSIGNED_BYTE, luminance);
      } else {
        gl.bindTexture(gl.TEXTURE_2D, self.glTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, self.format, self.format, gl.UNSIGNED_BYTE, image);
      }

      if (self.filter) {
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        //gl.generateMipmap(gl.TEXTURE_2D);
      }
      self.ready = true;
    };
    image.src = url;
  };

  makeChecker() {
    let gl = this.gl;
    let data = new Uint32Array(this.width * this.height);
    let cursor = 0;
    for (let j = 0; j < this.height; j++) {
      for (let i = 0; i < this.width; i++) {
        if ((i ^ j) & 1) {
          data[cursor++] = 0xFFFFFFFF;
        } else {
          data[cursor++] = 0xFF000000;
        }
      }
    }
    let blob = new Uint8Array(data.buffer);
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.format,
                  this.width, this.height, 0,
                  this.format, gl.UNSIGNED_BYTE, new Uint8Array(data.buffer));
    this.ready = true;
  };

  makeNoise() {
    let gl = this.gl;
    let data = new Uint32Array(this.width * this.height);
    let rand = 1;
    let cursor = 0;
    for (let j = 0; j < this.height; j++) {
      for (let i = 0; i < this.width; i++) {
        let r = (rand >>> 0) & 0xFF;
        let g = (rand >>> 8) & 0xFF;
        let b = (rand >>> 16) & 0xFF;
        data[cursor++] = 0xFF000000 | (r << 0) | (g << 8) | (b << 16);
        rand *= 123456789;
        rand ^= rand >>> 13;
      }
    }
    let blob = new Uint8Array(data.buffer);
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.format,
                  this.width, this.height, 0,
                  this.format, gl.UNSIGNED_BYTE, new Uint8Array(data.buffer));
    this.ready = true;
  };

  bind(slot : number) {
    let gl = this.gl;
    //assert(this.glTexture);
    //assert(slot >= 0);
    //assert(slot < 32);
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
  };
};
