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
      let self = this;
      fetch(this.name).then((response) => response.text()).then((text) => {
        self.handle = compile_shader(self.gl, self.name, text);
      });
    }
  }
};
