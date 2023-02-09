// Stores data about one line. Probably don't want one of these per actual
// line, might be too much ram.

export class LineInfo {
  lineX : number;
  lineY : number;

  constructor() {
    this.lineX = 0;
    this.lineY = 0;
  }
};

export class Scrap {
  lineStart : number;
  lineEnd : number;
  // Coordinates of each line in this scrap in the linemap.
  lines : Array<number>;

  constructor() {
    this.lineStart = 0;
    this.lineEnd = 0;
    this.lines = [];
  }
};
