import * as wb from "./wb-bitvec.js"

// Simple 2D allocator class.
export class Allocator {
  width       : number;      // Allocator width.
  height      : number;      // Allocator height.
  bitvec      : wb.Bitvec;   // Cell occupancy bit vector.
  rowFill     : Uint32Array; // Number of full cells in each row.
  rowNext     : Int32Array;  // Row linked list pointers.
  freeHead    : number;      // Free row list head.
  fullHead    : number;      // Full row list head.
  partialHead : number;      // Partially full row list head.

  constructor(width : number, height : number) {
    this.bitvec = new wb.Bitvec(width * height);
    this.rowFill = new Uint32Array(height);
    this.rowNext = new Int32Array(height);
    this.freeHead = -1;
    this.fullHead = -1;
    this.partialHead = -1;

    // Add all the rows to the free list & mark them as empty.
    for (var i = height - 1; i >= 0; i--) {
      this.rowFill[i] = 0;
      this.rowNext[i] = this.freeHead;
      this.freeHead = i;
    }
  }

  alloc(size : number) {
    // Check partial rows for a free block.
    var cursor = this.partialHead;
    while(cursor != -1) {
      var bitStart = this.width * cursor;
      var gap = this.bitvec.findGap(bitStart, bitStart + this.width, size);
      if (gap != -1) {
        var handleX = gap % this.width;
        var handleY = (gap / this.width) >>> 0;
        var handle = (handleY << 15) | handleX;
      }
    }

    // No partial row could hold the chunk, can we allocate a chunk at the start
    // of a free row?
    if (this.freeHead != -1) {
      var row = this.freeHead;
      var handleX = 0;
      var handleY = row;
      this.freeHead = this.rowNext[row];
      this.rowNext[row] = this.partialHead;
      this.partialHead = row;
      var bitStart = this.width * row;
      this.bitvec.set(bitStart, size);
      var handle = (handleY << 15) | handleX;
      return handle;
    }

    // No free rows, allocation fails.
    return -1;
  };

  /*
  // I guess I never finished this?
  free(handle : number, size : number) {
    var handleX = (handle >> 0) & 0x7FFF;
    var handleY = (handle >> 15) & 0x7FFF;

    //var rowFill = this.rowFill[handleY];
    //if (row

    var bitStart = this.width * handleY + this.height;
    this.bitvec.clear(bitStart, size);
  };
  */
};
