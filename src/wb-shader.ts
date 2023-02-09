import { compile_shader } from "./gl-base.js"

export class Shader  {
  gl : WebGLRenderingContext;
  filename : string;
  program : WebGLProgram;

  constructor(gl : WebGLRenderingContext, filename : string) {
    this.gl = gl;
    this.filename = filename;

    let xhr1 = new XMLHttpRequest();
    xhr1.open('GET', this.filename, false);
    xhr1.send();
    let source = xhr1.responseText;

    this.program = compile_shader(gl, filename, source);
  }
};
