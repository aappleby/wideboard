export class Buffer {
    gl;
    buf_name;
    buf_type;
    buf_mode;
    glBuffer;
    size;
    length;
    indices;
    primType;
    data;
    cursor;
    stride;
    constructor(gl, buf_name, mode) {
        this.gl = gl;
        this.buf_name = buf_name;
        this.buf_type = -1;
        this.buf_mode = mode;
        this.glBuffer = gl.createBuffer();
        this.size = -1;
        this.length = -1;
        this.indices = false;
        this.primType = -1;
        this.data = null;
        this.cursor = -1;
        this.stride = -1;
    }
    initVec2(data) {
        var gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), this.buf_mode);
        this.buf_type = gl.FLOAT;
        this.size = 2;
        this.length = data.length / 2;
        this.stride = 8;
    }
    ;
    initVec3(data) {
        var gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), this.buf_mode);
        this.buf_type = gl.FLOAT;
        this.size = 3;
        this.length = data.length / 3;
        this.stride = 12;
    }
    ;
    initVec4(data) {
        var gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), this.buf_mode);
        this.buf_type = gl.FLOAT;
        this.size = 4;
        this.length = data.length / 4;
        this.stride = 16;
    }
    ;
    initIndex8(data) {
        var gl = this.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(data), this.buf_mode);
        this.buf_type = gl.UNSIGNED_BYTE;
        this.size = 1;
        this.length = data.length;
        this.indices = true;
    }
    ;
    initDynamic(size, capacity) {
        var gl = this.gl;
        this.data = new Float32Array(size * capacity);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.DYNAMIC_DRAW);
        this.buf_type = gl.FLOAT;
        this.size = size;
        this.length = capacity;
        this.cursor = 0;
        this.stride = size * 4;
    }
    ;
    resetCursor() {
        this.cursor = 0;
    }
    ;
    // Re-uploads the whole buffer.
    upload() {
        var gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.DYNAMIC_DRAW);
    }
    ;
    // Re-uploads only the elements in [begin,end)
    uploadDirty(begin, end) {
        if (this.data !== null) {
            var gl = this.gl;
            var byteOffset = begin * this.stride;
            var length = (end - begin) * this.size;
            var chunk = new Float32Array(this.data.buffer, byteOffset, length);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, byteOffset, chunk);
        }
    }
    ;
}
;
//# sourceMappingURL=wb-buffer.js.map