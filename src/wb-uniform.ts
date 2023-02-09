export class Uniform {
  gl : WebGLRenderingContext;
  name : string;
  type : number;
  location : WebGLUniformLocation | null;
  parent : Uniform | null;
  value : Array<number>;

  set : (...args) => void;
  glSet : (...args) => void;

  constructor(
    gl : WebGLRenderingContext,
    name : string,
    type : number,
    opt_location : WebGLUniformLocation | null = null,
    opt_parent : Uniform | null = null)
  {
    this.gl = gl;
    this.name = name;
    this.type = type;
    this.location = opt_location;
    this.parent = opt_parent;
    //this.value = (opt_parent !== null) ? opt_parent.value : new Array(16);
    this.value = new Array(16);
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

  dump() {
    console.log("class Uniform " + this.name + ":" + this.type + ":" + this.location);
  }

  glSet1f() {
    if (this.location) {
      this.gl.uniform1f(this.location, this.value[0]);
    }
  };

  glSet2f() {
    if (this.location) {
      this.gl.uniform2f(this.location, this.value[0], this.value[1]);
    }
  };

  glSet3f() {
    if (this.location) {
      this.gl.uniform3f(this.location, this.value[0], this.value[1], this.value[2]);
    }
  };

  glSet4f() {
    if (this.location) {
      /*
      if (this.value[0] === undefined) {
        console.log("glSet4f " + this.location + ":" +  this.value[0] + ":" +  this.value[1] + ":" +  this.value[2] + ":" +  this.value[3]);
      }
      */
      this.gl.uniform4f(this.location, this.value[0], this.value[1], this.value[2], this.value[3]);
    }
  };

  glSet1i() {
    if (this.location) {
      this.gl.uniform1i(this.location, this.value[0]);
    }
  };

  set1f(x : number) {
    //goog.asserts.assert(arguments.length == 1);
    this.value[0] = x;
  };

  set2f(x : number, y : number) {
    //goog.asserts.assert(arguments.length == 2);
    this.value[0] = x;
    this.value[1] = y;
  };

  set3f(x : number, y : number, z : number) {
    //goog.asserts.assert(arguments.length == 3);
    this.value[0] = x;
    this.value[1] = y;
    this.value[2] = z;
  };

  set4f(x : number, y : number, z : number, w : number) {
    //goog.asserts.assert(arguments.length == 4);
    this.value[0] = x;
    this.value[1] = y;
    this.value[2] = z;
    this.value[3] = w;
  };

  set1i(x : number) {
    //goog.asserts.assert(arguments.length == 1);
    this.value[0] = x;
  };

};
