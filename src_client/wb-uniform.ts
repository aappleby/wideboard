export class Uniform {
  gl : WebGLRenderingContext;
  name : string;
  type : number;
  location : WebGLUniformLocation | null;
  parent : Uniform | null;
  value : Array<number>;
  dirty : boolean;

  set : (...args) => void;
  glSet : (...args) => void;

  constructor(
    gl : WebGLRenderingContext,
    name : string,
    type : number,
    opt_location : WebGLUniformLocation | null,
    opt_parent : Uniform | null)
  {
    this.gl = gl;
    this.name = name;
    this.type = type;
    this.location = opt_location || null;
    this.parent = opt_parent || null;
    this.value = opt_parent ? opt_parent.value : new Array(16);
    this.dirty = false;
    this.set = () => {};
    this.glSet = () => {};

    switch (this.type) {
    case gl.FLOAT:
      this.set = this.set1f;
      this.glSet = this.glSet1f;
      break;
    case gl.FLOAT_VEC2:
      this.set = this.set2f;
      this.glSet = this.glSet2f;
      break;
    case gl.FLOAT_VEC3:
      this.set = this.set3f;
      this.glSet = this.glSet3f;
      break;
    case gl.FLOAT_VEC4:
      this.set = this.set4f;
      this.glSet = this.glSet4f;
      break;
    case gl.INT:
      this.set = this.set1i;
      this.glSet = this.glSet1i;
      break;
    case gl.SAMPLER_2D:
      this.set = this.set1i;
      this.glSet = this.glSet1i;
      break;
    default:
      //goog.asserts.fail('Bad uniform type');
      console.log("Bad uniform type");
      break;
    }
  }

  glSet1f() {
    if (this.location) {
      this.gl.uniform1f(this.location, this.value[0]);
      this.dirty = false;
    }
  };

  glSet2f() {
    if (this.location) {
      this.gl.uniform2f(this.location, this.value[0], this.value[1]);
      this.dirty = false;
    }
  };

  glSet3f() {
    if (this.location) {
      this.gl.uniform3f(this.location, this.value[0], this.value[1], this.value[2]);
      this.dirty = false;
    }
  };

  glSet4f() {
    if (this.location) {
      this.gl.uniform4f(this.location, this.value[0], this.value[1], this.value[2], this.value[3]);
      this.dirty = false;
    }
  };

  glSet1i() {
    if (this.location) {
      this.gl.uniform1i(this.location, this.value[0]);
      this.dirty = false;
    }
  };

  set1f(x : number) {
    //goog.asserts.assert(arguments.length == 1);
    this.value[0] = x;
    this.dirty = true;
  };

  set2f(x : number, y : number) {
    //goog.asserts.assert(arguments.length == 2);
    this.value[0] = x;
    this.value[1] = y;
    this.dirty = true;
  };

  set3f(x : number, y : number, z : number) {
    //goog.asserts.assert(arguments.length == 3);
    this.value[0] = x;
    this.value[1] = y;
    this.value[2] = z;
    this.dirty = true;
  };

  set4f(x : number, y : number, z : number, w : number) {
    //goog.asserts.assert(arguments.length == 4);
    this.value[0] = x;
    this.value[1] = y;
    this.value[2] = z;
    this.value[3] = w;
    this.dirty = true;
  };

  set1i(x : number) {
    //goog.asserts.assert(arguments.length == 1);
    this.value[0] = x;
    this.dirty = true;
  };

};
