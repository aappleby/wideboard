import { compile_shader } from "./gl-base.js"

export class Shader  {
  gl : WebGLRenderingContext;
  name : string;
  handle : WebGLProgram;

  constructor(gl : WebGLRenderingContext, name : string, text : string = null) {
    this.gl = gl;
    this.name = name;

    if (text !== null) {
      this.handle = compile_shader(gl, name, text);
    }
    else {
      /*
      let xhr1 = new XMLHttpRequest();
      xhr1.open('GET', this.name, false);
      xhr1.send();
      let source = xhr1.responseText;
      this.handle = compile_shader(gl, name, source);
      */

      let xhr = new XMLHttpRequest();
      xhr.open('GET', this.name);
      let self = this;
      xhr.onload = () => {
        //console.log(xhr);
        self.handle = compile_shader(self.gl, self.name, xhr.response);
      }
      xhr.send();

    }
  }
};
