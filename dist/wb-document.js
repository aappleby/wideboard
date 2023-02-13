// Main document class for Wideboard.
export class Chunk {
    screenX = 0;
    screenY = 0;
    bufferIndex;
    shelfPos;
    linePos = [];
    lineLength = [];
}
;
export class Document {
    filename;
    chunks = [];
    constructor(filename) {
        this.filename = filename;
    }
}
;
//# sourceMappingURL=wb-document.js.map