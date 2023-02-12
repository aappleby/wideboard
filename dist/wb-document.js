// Main document class for Wideboard.
export class Document {
    filename;
    linePos;
    lineLength;
    shelfIndex;
    shelfPos;
    screenX;
    screenY;
    ready; // True when the document is loaded.
    constructor() {
        this.filename = 'filename';
        this.linePos = [];
        this.lineLength = [];
        this.shelfIndex = -1;
        this.shelfPos = -1;
        this.screenX = 0;
        this.screenY = 0;
        this.ready = false;
    }
}
;
//# sourceMappingURL=wb-document.js.map