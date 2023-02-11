export class Buffer {
  gl : WebGLRenderingContext;

  handle     : WebGLBuffer;
  buf_name   : string;
  buf_type   : GLenum; // ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER
  buf_format : GLenum; // FLOAT or UNSIGNED_BYTE
  buf_arity  : number;
  buf_len    : number;
  data   : Float32Array | Uint8Array;
  cursor : number;

  constructor(gl : WebGLRenderingContext, buf_name : string, buf_type : GLenum, buf_format : GLenum, buf_arity : number, buf_len : number, data : Array<number> | null = null) {
    this.gl = gl;

    this.handle     = gl.createBuffer()!;
    this.buf_name   = buf_name;
    this.buf_type   = buf_type;
    this.buf_format = buf_format;
    this.buf_arity  = buf_arity;
    this.buf_len    = buf_len;
    this.cursor     = 0;

    if (data === null) {
      this.data  = buf_format == gl.UNSIGNED_BYTE ? new Uint8Array(buf_arity * buf_len) : new Float32Array(buf_arity * buf_len);
    }
    else {
      this.data  = buf_format == gl.UNSIGNED_BYTE ? new Uint8Array(data) : new Float32Array(data);
    }

    gl.bindBuffer(this.buf_type, this.handle);
    gl.bufferData(this.buf_type, this.data, gl.DYNAMIC_DRAW);
  }

  // Re-uploads the whole buffer.
  upload() {
    let gl = this.gl;
    gl.bindBuffer(this.buf_type, this.handle);
    gl.bufferData(this.buf_type, this.data, gl.DYNAMIC_DRAW);
  };

  bind() {
    let gl = this.gl;
    gl.bindBuffer(this.buf_type, this.handle);
  }

  // Re-uploads only the elements in [begin,end)
  uploadDirty(begin : number, end : number) {
    let gl = this.gl;
    let byte_begin = begin * this.buf_arity * this.data.BYTES_PER_ELEMENT;
    let byte_end   = end   * this.buf_arity * this.data.BYTES_PER_ELEMENT;

    var chunk = new Uint8Array(this.data.buffer, byte_begin, byte_end - byte_begin);
    gl.bindBuffer(this.buf_type, this.handle);
    gl.bufferSubData(this.buf_type, byte_begin, chunk);
  };
};
