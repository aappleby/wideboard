// A shelf is a collection of documents.
// It also owns the texture that contains each document's docmap (list of
// lines encoded as a span of texels in a texture).
import { Buffer } from "./wb-buffer.js";
import { Texture } from "./wb-texture.js";
import { Chunk, Document } from "./wb-document.js";
import { Linemap } from "./wb-linemap.js";
let globalShelfIndex = 0;
export class Shelf {
    gl;
    shelfIndex;
    documents;
    width;
    height;
    texture;
    buffer;
    cursorX;
    cursorY;
    cleanCursorX;
    cleanCursorY;
    linemap;
    //docPosBuffer : Buffer; // Document position buffer, can hold 65k documents.
    //docColorBuffer : Buffer;
    docBuffer;
    tempBuffer;
    //----------------------------------------
    constructor(gl, width, height) {
        this.shelfIndex = globalShelfIndex++;
        this.documents = [];
        this.gl = gl;
        this.width = width;
        this.height = height;
        this.texture = new Texture(gl, gl.RGBA, width, height);
        this.buffer = new Uint32Array(width * height);
        this.cursorX = 0;
        this.cursorY = 0;
        this.cleanCursorX = 0;
        this.cleanCursorY = 0;
        this.linemap = new Linemap(gl, 4096, 4096);
        //this.docPosBuffer   = new Buffer(gl, 'iDocPos',   gl.ARRAY_BUFFER, gl.FLOAT, 4, 65536);
        //this.docColorBuffer = new Buffer(gl, 'iDocColor', gl.ARRAY_BUFFER, gl.FLOAT, 4, 65536);
        this.docBuffer = new Buffer(gl, 'doc', gl.ARRAY_BUFFER, gl.FLOAT, 12, 65536);
        this.tempBuffer = new Uint8Array(1024);
    }
    //----------------------------------------
    chunk_count() {
        let count = 0;
        for (let i = 0; i < this.documents.length; i++) {
            count += this.documents[i].chunks.length;
        }
        return count;
    }
    //----------------------------------------
    addDocument(filename, bytes, lineStarts, lineLengths, screenX, screenY) {
        let document = new Document(filename);
        let chunk = new Chunk();
        document.chunks.push(chunk);
        chunk.bufferIndex = this.documents.length;
        let lineCount = lineStarts.length;
        for (let i = 0; i < lineCount; i++) {
            let length = lineLengths[i];
            let start = lineStarts[i];
            if (this.tempBuffer.length < length * 2) {
                this.tempBuffer = new Uint8Array(length * 2);
            }
            let cursor2 = 0;
            for (let cursor1 = 0; cursor1 < length; cursor1++) {
                let c = bytes[start + cursor1];
                if (c == 9) {
                    this.tempBuffer[cursor2++] = 32;
                    while (cursor2 % 8) {
                        this.tempBuffer[cursor2++] = 32;
                    }
                }
                else {
                    this.tempBuffer[cursor2++] = c;
                }
            }
            let pos = this.linemap.addLine(this.tempBuffer, 0, cursor2);
            chunk.linePos.push(pos);
            chunk.lineLength.push(cursor2);
        }
        // Add the document to the shelf.
        let chunkLength = chunk.linePos.length;
        let chunkPos = this.cursorX + this.cursorY * this.width;
        for (let i = 0; i < chunkLength; i++) {
            this.buffer[chunkPos + i] = (chunk.lineLength[i] << 24) | chunk.linePos[i];
        }
        let new_pos = chunkPos + chunkLength;
        this.cursorX = new_pos % this.width;
        this.cursorY = Math.floor(new_pos / this.width);
        chunk.shelfPos = chunkPos;
        this.documents.push(document);
        chunk.screenX = screenX;
        chunk.screenY = screenY;
        let cursor = chunk.bufferIndex * 12;
        this.docBuffer.data[cursor++] = 0.2;
        this.docBuffer.data[cursor++] = 0.2;
        this.docBuffer.data[cursor++] = 0.2;
        this.docBuffer.data[cursor++] = 1.0;
        this.docBuffer.data[cursor++] = chunk.screenX;
        this.docBuffer.data[cursor++] = chunk.screenY;
        this.docBuffer.data[cursor++] = 0;
        this.docBuffer.data[cursor++] = 0;
        this.docBuffer.data[cursor++] = lineCount;
        this.docBuffer.data[cursor++] = 0;
        this.docBuffer.data[cursor++] = (chunk.shelfPos >> 0) & 0xFFF;
        this.docBuffer.data[cursor++] = (chunk.shelfPos >> 12) & 0xFFF;
        this.docBuffer.uploadDirty(chunk.bufferIndex, chunk.bufferIndex + 1);
        this.updateTexture();
        this.linemap.updateTexture();
        //console.log("doc " + chunk.bufferIndex + " " + chunk.shelfPos);
    }
    //----------------------------------------
    // TODO(aappleby): This should flush only dirty chunks of the docmap to the
    // GPU, but for now it's easier to flush the whole thing.
    updateTexture() {
        let gl = this.gl;
        if ((this.cursorX == this.cleanCursorX) &&
            (this.cursorY == this.cleanCursorY)) {
            return;
        }
        let linecount = (this.cursorY - this.cleanCursorY + 1);
        let byteOffset = this.cleanCursorY * this.width * 4;
        let byteSize = linecount * this.width * 4;
        gl.bindTexture(gl.TEXTURE_2D, this.texture.handle);
        let blob = new Uint8Array(this.buffer.buffer, byteOffset, byteSize);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, this.cleanCursorY, this.width, linecount, this.texture.format, gl.UNSIGNED_BYTE, blob);
        this.texture.ready = true;
        this.cleanCursorX = this.cursorX;
        this.cleanCursorY = this.cursorY;
    }
}
//# sourceMappingURL=wb-shelf.js.map