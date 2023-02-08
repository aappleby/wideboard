goog.provide('wideboard.Allocator');


/**
 * Simple 2D allocator class.
 * @param {number} width
 * @param {number} height
 * @constructor
 * @struct
 */
wideboard.Allocator = function(width, height) {
  /** 
   * Allocator width.
   * @type {number}
   */
  this.width = width;

  /**
   * Allocator height.
   * @type {number}
   */
  this.height = height;
  
  /**
   * Cell occupancy bit vector.
   * @type {!wideboard.Bitvec}
   */
  this.bitvec = new wideboard.Bitvec(width * height);
  
  /**
   * Number of full cells in each row.
   * @type {!Uint32Array}
   */
  this.rowFill = new Uint32Array(height);
  
  /**
   * Row linked list pointers.
   * @type {!Uint32Array}
   */
  this.rowNext = new Int32Array(height);
  
  /**
   * Free row list head.
   * @type {number}
   */
  this.freeHead = -1;
  
  /**
   * Full row list head.
   * @type {number}
   */
  this.fullHead = -1;
  
  /**
   * Partially full row list head.
   * @type {number}
   */
  this.partialHead = -1;
  
  // Add all the rows to the free list & mark them as empty.
  for (var i = height - 1; i >= 0; i--) {
    this.rowFill[i] = 0;
    this.rowNext[i] = this.freeHead;
    this.freeHead = i;
  }
};


/**
 * @param {number} size
 * @return {number}
 */
wideboard.Allocator.prototype.alloc = function(size) {
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


/**
 * @param {number} handle
 * @param {number} size
 */
wideboard.Allocator.prototype.free = function(handle, size) {
  var handleX = (handle >> 0) & 0x7FFF;
  var handleY = (handle >> 15) & 0x7FFF;
  
  var rowFill = this.rowFill[handleY];
  
  if (row
  
  var bitStart = this.width * handleY + this.height;
  
  this.bitvec.clear(bitStart, size);
};