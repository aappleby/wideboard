
// Main document class for Wideboard.
export class Document {
  filename : string;
  linePos : Array<number>;
  lineLength : Array<number>;
  shelfIndex : number;
  shelfPos : number;
  screenX : number;
  screenY : number;
  ready : boolean; // True when the document is loaded.

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
};
