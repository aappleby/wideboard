import { Bitvec } from "./wb-bitvec.js";
import { Texture } from "./wb-texture.js";
// The linemap is a dynamically-allocated texture atlas that stores the actual
// text characters for each line.
export class Linemap {
    gl;
    width;
    height;
    texture;
    buffer;
    cursorX; // Dumb initial implementation just has an allocation cursor.
    cursorY;
    cleanCursorX;
    cleanCursorY;
    dirty;
    bitvec;
    constructor(gl, width, height) {
        this.gl = gl;
        this.width = width;
        this.height = height;
        this.texture = new Texture(gl, gl.LUMINANCE, 2048, 2048);
        this.buffer = new Uint8Array(width * height);
        this.cursorX = 0;
        this.cursorY = 0;
        this.cleanCursorX = 0;
        this.cleanCursorY = 0;
        this.dirty = true;
        this.bitvec = new Bitvec(width * height);
        gl.bindTexture(gl.TEXTURE_2D, this.texture.handle);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.texture.format, this.width, this.height, 0, this.texture.format, gl.UNSIGNED_BYTE, null);
    }
    allocate(size) {
        if (this.cursorX + size > this.width) {
            this.cursorX = 0;
            this.cursorY++;
        }
        var result = this.cursorX + this.cursorY * this.width;
        this.cursorX += size;
        return result;
    }
    ;
    addLine(source, offset, length) {
        var pos = this.allocate(length);
        for (var j = 0; j < length; j++) {
            this.buffer[pos + j] = source[offset + j];
        }
        return pos;
    }
    ;
    updateTexture() {
        var gl = this.gl;
        if ((this.cursorX == this.cleanCursorX) &&
            (this.cursorY == this.cleanCursorY)) {
            return;
        }
        var linecount = (this.cursorY - this.cleanCursorY + 1);
        var byteOffset = this.cleanCursorY * this.width;
        var byteSize = linecount * this.width;
        gl.bindTexture(gl.TEXTURE_2D, this.texture.handle);
        var blob = new Uint8Array(this.buffer.buffer, byteOffset, byteSize);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, this.cleanCursorY, this.width, linecount, this.texture.format, gl.UNSIGNED_BYTE, blob);
        this.texture.ready = true;
        this.cleanCursorX = this.cursorX;
        this.cleanCursorY = this.cursorY;
    }
    ;
}
;
//# sourceMappingURL=wb-linemap.js.map