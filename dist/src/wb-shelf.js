// A shelf is a collection of documents.
// It also owns the texture that contains each document's docmap (list of
// lines encoded as a span of texels in a texture).
import { Buffer } from "./wb-buffer.js";
import { Texture } from "./wb-texture.js";
import { Document } from "./wb-document.js";
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
    docPosBuffer; // Document position buffer, can hold 65k documents.
    docColorBuffer;
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
        this.docPosBuffer = new Buffer(gl, 'iDocPos', gl.FLOAT, 4, 65536);
        this.docColorBuffer = new Buffer(gl, 'iDocColor', gl.FLOAT, 4, 65536);
        this.tempBuffer = new Uint8Array(1024);
    }
    //----------------------------------------
    addDocument(linePos, lineLength) {
        let size = linePos.length;
        let pos = this.cursorX + this.cursorY * this.width;
        for (let i = 0; i < size; i++) {
            this.buffer[pos + i] = (lineLength[i] << 24) | linePos[i];
        }
        this.cursorX = (pos + size) % this.width;
        this.cursorY = (pos + size - this.cursorX) / this.width;
        return pos;
    }
    //----------------------------------------
    addDocument2(bytes, lineStarts, lineLengths, screenX, screenY) {
        let document = new Document();
        document.shelfIndex = this.documents.length;
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
            //let pos = this.linemap.addLine(bytes, lineStarts[i], lineLengths[i]);
            let pos = this.linemap.addLine(this.tempBuffer, 0, cursor2);
            document.linePos.push(pos);
            document.lineLength.push(cursor2);
        }
        // Add the document to the shelf.
        document.shelfPos = this.addDocument(document.linePos, document.lineLength);
        document.ready = true;
        this.documents.push(document);
        document.screenX = screenX;
        document.screenY = screenY;
        this.docPosBuffer.data[document.shelfIndex * 4 + 0] = document.screenX;
        this.docPosBuffer.data[document.shelfIndex * 4 + 1] = document.screenY;
        this.docPosBuffer.data[document.shelfIndex * 4 + 2] = lineCount;
        this.docPosBuffer.data[document.shelfIndex * 4 + 3] = document.shelfPos;
        this.docColorBuffer.data[document.shelfIndex * 4 + 0] = (document.shelfIndex * 0.01) % 0.2;
        this.docColorBuffer.data[document.shelfIndex * 4 + 1] = (document.shelfIndex * 0.007) % 0.2;
        this.docColorBuffer.data[document.shelfIndex * 4 + 2] = 0.2;
        this.docColorBuffer.data[document.shelfIndex * 4 + 3] = 1.0;
        this.updateTexture();
        this.linemap.updateTexture();
        this.docPosBuffer.uploadDirty(document.shelfIndex, document.shelfIndex + 1);
        this.docColorBuffer.uploadDirty(document.shelfIndex, document.shelfIndex + 1);
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