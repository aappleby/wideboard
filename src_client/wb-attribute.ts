export class Attribute {
  gl : WebGLRenderingContext;
  attribute_name : string;
  type : number;
  location : number;

  constructor(gl : WebGLRenderingContext, attribute_name : string, type : number, location : number = -1) {
    this.gl = gl;
    this.attribute_name = attribute_name;
    this.type = type;
    this.location = location;
  }

  set1f(buffer : WebGLBuffer, stride : number, offset : number) {
    if (this.location >= 0) {
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(this.location);
      gl.vertexAttribPointer(this.location, 1, gl.FLOAT, false, stride, offset);
    }
  };

  set2f(buffer : WebGLBuffer, stride : number, offset : number) {
    if (this.location >= 0) {
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(this.location);
      gl.vertexAttribPointer(this.location, 2, gl.FLOAT, false, stride, offset);
    }
  };

  set3f(buffer : WebGLBuffer, stride : number, offset : number) {
    if (this.location >= 0) {
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(this.location);
      gl.vertexAttribPointer(this.location, 3, gl.FLOAT, false, stride, offset);
    }
  };

  set4f(buffer : WebGLBuffer, stride : number, offset : number, instanced : boolean = false) {
    if (this.location >= 0) {
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(this.location);
      gl.vertexAttribPointer(this.location, 4, gl.FLOAT, false, stride, offset);
      if (instanced) {
        // @ts-ignore: this should actually be on the gl context I think.
        gl.vertexAttribDivisorANGLE(this.location, 1);
      }
    }
  };
};
