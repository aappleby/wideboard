export class Attribute {
    gl;
    attribute_name;
    type;
    location;
    constructor(gl, attribute_name, type, location = -1) {
        this.gl = gl;
        this.attribute_name = attribute_name;
        this.type = type;
        this.location = location;
    }
    set1f(buffer, stride, offset) {
        if (this.location >= 0) {
            var gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(this.location);
            gl.vertexAttribPointer(this.location, 1, gl.FLOAT, false, stride, offset);
        }
    }
    ;
    set2f(buffer, stride, offset) {
        if (this.location >= 0) {
            var gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(this.location);
            gl.vertexAttribPointer(this.location, 2, gl.FLOAT, false, stride, offset);
        }
    }
    ;
    set3f(buffer, stride, offset) {
        if (this.location >= 0) {
            var gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(this.location);
            gl.vertexAttribPointer(this.location, 3, gl.FLOAT, false, stride, offset);
        }
    }
    ;
    set4f(buffer, stride, offset, instanced = false) {
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
    }
    ;
}
;
//# sourceMappingURL=wb-attribute.js.map