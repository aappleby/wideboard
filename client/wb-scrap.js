// Stores data about one line. Probably don't want one of these per actual
// line, might be too much ram.
export class LineInfo {
    lineX;
    lineY;
    constructor() {
        this.lineX = 0;
        this.lineY = 0;
    }
}
;
export class Scrap {
    lineStart;
    lineEnd;
    // Coordinates of each line in this scrap in the linemap.
    lines;
    constructor() {
        this.lineStart = 0;
        this.lineEnd = 0;
        this.lines = [];
    }
}
;
//# sourceMappingURL=wb-scrap.js.map