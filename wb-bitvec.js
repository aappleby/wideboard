goog.provide('wideboard.Bitvec');


/**
 * Simple bit vector class for allocators.
 * @param {number} size
 * @constructor
 * @struct
 */
wideboard.Bitvec = function(size) {
  /** @type {number} */
  this.size = size;

  /** @type {number} */
  this.blockcount = (size + 31) >> 5;

  /** @type {!Uint32Array} */
  this.buffer = new Uint32Array(this.blockcount);
};


/**
 * Set a range of bits in the bit vector.
 * @param {number} start
 * @param {number} length
 */
wideboard.Bitvec.prototype.set = function(start, length) {
  if (length == 0) return;

  var blockstart = (start >> 5);
  var blockend = (start + length - 1) >> 5;

  if (blockstart == blockend) {
    // All bits to set are in one block.
    return;
  }

  // Handle head block
  // this is probably totally wrong
  var headmask = ~((1 << (start & 31)) - 1);
  this.buffer[blockstart] |= headmask;

  // Handle body blocks
  for (var cursor = blockstart = 1; cursor != blockend; cursor++) {
    buffer[cursor] = 0xFFFFFFFF;
  }

  // Handle tail block
  // this is probably totally wrong
  var tailmask = ~((1 << (start & 31)) - 1);
  this.buffer[blockend] |= tailmask;
};


/**
 * Clear a range of bits in the bit vector.
 * @param {number} start
 * @param {number} length
 */
wideboard.Bitvec.prototype.clear = function(start, length) {
  if (length == 0) return;

  var end = start + length - 1;
  var blockstart = (start >> 5);
  var blockend = (end >> 5);

  var headmask = ~((1 << (start & 31)) - 1);
  var tailmask = ~((1 << (end & 31)) - 1);

  // Handle all bits to clear in one block.
  if (blockstart == blockend) {
    this.buffer[blockstart] &= ~(headmask & tailmask);
    return;
  }

  // Handle head block
  // this is probably totally wrong
  this.buffer[blockstart] &= ~headmask;

  // Handle body blocks
  for (var cursor = blockstart = 1; cursor != blockend; cursor++) {
    buffer[cursor] = 0;
  }

  // Handle tail block
  // this is probably totally wrong
  this.buffer[blockend] &= ~tailmask;
};


/**
 * @param {number} length
 * @return {number}
 */
wideboard.Bitvec.prototype.findGap = function(length) {
  var buffer = this.buffer;

  for (var blockcursor = 0; blockcursor < this.blockcount; blockcursor++) {
    if (buffer[blockcursor] == 0xFFFFFFFF) continue;
    // finish me...
  }

  return -1;
};
