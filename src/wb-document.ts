

// Main document class for Wideboard.

export class Chunk {
  screenX : number = 0;
  screenY : number = 0;
  bufferIndex : number;
  shelfPos : number;
  linePos : Array<number> = [];
  lineLength : Array<number> = [];
};


export class Document {
  filename : string;
  chunks : Array<Chunk> = [];

  constructor(filename : string) {
    this.filename = filename;
  }
};
