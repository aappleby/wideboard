import { Attribute } from "./wb-attribute.js"
import { Uniform } from "./wb-uniform.js"

export class Shader  {
  gl : WebGLRenderingContext;
  filename : string;
  vshader : WebGLShader;
  fshader : WebGLShader;
  glProgram : WebGLProgram;
  attributes : Map<string, Attribute>;
  attributeList : Array<Attribute>;
  globalUniforms : Map<string, Uniform>;
  uniforms : Map<string, Uniform>;
  uniformList : Array<Uniform>;
  ready : boolean;

  constructor(
    gl : WebGLRenderingContext,
    filename : string,
    opt_uniforms : Map<string, Uniform> | null
  ) {
    this.gl = gl;
    this.filename = filename;
    this.vshader = gl.createShader(gl.VERTEX_SHADER)!;
    this.fshader = gl.createShader(gl.FRAGMENT_SHADER)!;
    this.glProgram = gl.createProgram()!;
    this.attributes = new Map<string, Attribute>;
    this.attributeList = [];
    this.globalUniforms = opt_uniforms || new Map<string, Uniform>;
    this.uniforms = new Map<string, Uniform>;
    this.uniformList = [];
    this.ready = false;

    this.init();
  }

  glStringToType(gl : WebGLRenderingContext, t : string) : GLenum {
    switch (t) {
    case 'float': return gl.FLOAT;
    case 'vec2': return gl.FLOAT_VEC2;
    case 'vec3': return gl.FLOAT_VEC3;
    case 'vec4': return gl.FLOAT_VEC4;
    case 'mat2': return gl.FLOAT_MAT2;
    case 'mat3': return gl.FLOAT_MAT3;
    case 'mat4': return gl.FLOAT_MAT4;
    case 'sampler2D': return gl.SAMPLER_2D;
    default: console.log('Unknown GLSL type'); return -1;
    }
  }

  init() {
    let xhr1 = new XMLHttpRequest();
    xhr1.open('GET', this.filename, false);
    xhr1.send();
    let source = xhr1.responseText;

    let gl = this.gl;
    //goog.asserts.assert(gl);

    let tokenMatch = /\w+/g;
    let lines = source.split('\n');
    for (let i = 0; i < lines.length; i++) {
      // Skip commented-out lines.
      if (lines[i][0] == '/') continue;

      let tokens = lines[i].match(tokenMatch);
      if (!tokens) continue;
      if (tokens.length < 3) continue;

      if (tokens[0] == 'uniform') {
        let uniformType = tokens[1];
        let uniformName = tokens[2];
        //console.log('Uniform ' + uniformType + ' ' + uniformName + ' ' + glStringToType(gl, uniformType));

        let globalUniform = this.globalUniforms[uniformName];
        let uniform = new Uniform(gl, uniformName, this.glStringToType(gl, uniformType), null, globalUniform);
        this.uniforms[uniformName] = uniform;
        this.uniformList.push(uniform);
      }

      if (tokens[0] == 'attribute') {
        let attributeType = tokens[1];
        let attributeName = tokens[2];
        //console.log('Attribute ' + attributeType + ' ' + attributeName + ' ' + glStringToType(gl, attributeType));

        let attribute = new Attribute(gl, attributeName, this.glStringToType(gl, attributeType));
        this.attributes[attributeName] = attribute;
        this.attributeList.push(attribute);
      }
    }

    let prefix = '#ifdef _FRAGMENT_\n' +
                 '#define attribute //attribute\n' +
                 '#endif\n' +
                 'precision mediump float;\n';

    gl.shaderSource(this.vshader, '#define _VERTEX_\n' + prefix + source);
    gl.compileShader(this.vshader);

    if (!gl.getShaderParameter(this.vshader, gl.COMPILE_STATUS)) {
      console.log('Fragment shader compile failed');
    }

    gl.shaderSource(this.fshader, '#define _FRAGMENT_\n' + prefix + source);
    gl.compileShader(this.fshader);

    if (!gl.getShaderParameter(this.fshader, gl.COMPILE_STATUS)) {
      console.log('Fragment shader compile failed');
    }

    gl.attachShader(this.glProgram, this.vshader);
    gl.attachShader(this.glProgram, this.fshader);
    gl.linkProgram(this.glProgram);

    if (!gl.getProgramParameter(this.glProgram, gl.LINK_STATUS)) {
      console.log('Shader link failed!');
    } else {
      console.log('Shader ' + this.filename + ' linked');
      this.ready = true;
    }

    gl.useProgram(this.glProgram);

    //console.log('Attributes:');
    let attribCount = /** @type {number} */(gl.getProgramParameter(this.glProgram, gl.ACTIVE_ATTRIBUTES));
    for (let i = 0; i < attribCount; i++) {
      let attribInfo = gl.getActiveAttrib(this.glProgram, i)!;
      let location = gl.getAttribLocation(this.glProgram, attribInfo.name);
      if (location !== null && location !== undefined) {
        //console.log(attribInfo);
        let attribute = this.attributes[attribInfo.name];
        //goog.asserts.assert(attribute);
        attribute.location = location;
      }
    }

    //console.log('Uniforms:');
    let uniformCount = /** @type {number} */(gl.getProgramParameter(this.glProgram, gl.ACTIVE_UNIFORMS));
    for (let i = 0; i < uniformCount; i++) {
      let uniformInfo = gl.getActiveUniform(this.glProgram, i)!;
      let location = gl.getUniformLocation(this.glProgram, uniformInfo.name);
      if (location !== null && location !== undefined) {
        //console.log(uniformInfo);
        let uniform = this.uniforms[uniformInfo.name];
        //goog.asserts.assert(uniform);
        uniform.location = location;
      }
    }
  };

  setUniforms() {
    let uniforms = this.uniformList;
    for (let i = 0; i < uniforms.length; i++) {
      uniforms[i].glSet();
    }
  };

  bind() {
    this.gl.useProgram(this.glProgram);
    this.setUniforms();
  };
};
