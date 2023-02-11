// Simple texture class.

export class Texture {
  gl : WebGLRenderingContext;
  handle : WebGLTexture;
  width : number;
  height : number;
  format : GLenum;
  ready : boolean;
  url : string = "<none>";

  constructor(gl : WebGLRenderingContext, format : GLenum, width : number, height : number) {
    this.gl = gl;
    this.handle = gl.createTexture()!;
    this.width = width;
    this.height = height;
    this.format = format;
    this.ready = false;

    gl.bindTexture(gl.TEXTURE_2D, this.handle);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE);

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

  load(url : string) {
    let gl = this.gl;
    let image = new Image();
    let self = this;
    self.url = url;
    image.onload = () => {
      console.log("Image " + self.url + " loaded");
      self.width = image.width;
      self.height = image.height;

      if (self.format == gl.LUMINANCE) {
        let rgba = self.extractBytes(image);
        let luminance = new Uint8Array(rgba.length / 4);
        for (let i = 0; i < luminance.length; i++) {
          luminance[i] = rgba[i * 4];
        }
        gl.bindTexture(gl.TEXTURE_2D, self.handle);
        gl.texImage2D(gl.TEXTURE_2D, 0, self.format,
                      self.width, self.height, 0,
                      self.format, gl.UNSIGNED_BYTE, luminance);

                      let proxy = new Array(128);

        for (let cell_y = 0; cell_y < 8; cell_y++) {
          for (let cell_x = 0; cell_x < 16; cell_x++) {
            let accum = 0;
            for (let glyph_y = 0; glyph_y < 14; glyph_y++) {
              for (let glyph_x = 0; glyph_x < 6; glyph_x++) {
                let x = cell_x * 8  + glyph_x;
                let y = cell_y * 16 + glyph_y;
                accum += luminance[x + y * 256];
              }
            }
            proxy[cell_x + cell_y * 16] = accum / (6 * 14);
          }
        }
        console.log(proxy);
      } else {
        gl.bindTexture(gl.TEXTURE_2D, self.handle);
        gl.texImage2D(gl.TEXTURE_2D, 0, self.format, self.format, gl.UNSIGNED_BYTE, image);
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
    gl.bindTexture(gl.TEXTURE_2D, this.handle);
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
    gl.bindTexture(gl.TEXTURE_2D, this.handle);
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
    gl.bindTexture(gl.TEXTURE_2D, this.handle);
  };
};
