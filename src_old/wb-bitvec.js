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
 * Gets a single bit in the vector
 * @param {number} i
 * @return {number}
 */
wideboard.Bitvec.prototype.getBit = function(i) {
  return (this.buffer[i >> 5] >> (i & 31)) & 1;
};


/**
 * Sets a single bit in the vector.
 * @param {number} i
 */
wideboard.Bitvec.prototype.setBit = function(i) {
  this.buffer[i >> 5] |= (1 << (i & 31));
};


/**
 * Clears a single bit in the vector.
 * @param {number} i
 */
wideboard.Bitvec.prototype.clearBit = function(i) {
  this.buffer[i >> 5] &= ~(1 << (i & 31));
};



/**
 * Set a range of bits in the bit vector.
 * @param {number} start
 * @param {number} length
 */
wideboard.Bitvec.prototype.set = function(start, length) {
  if (length == 0) return;

  var end = start + length - 1;
  var blockstart = (start >> 5);
  var blockend = (end) >> 5;

  var headmask = (0xFFFFFFFF << (start & 31)) >>> 0;
  var tailmask = (0xFFFFFFFF >>> ((31 - end) & 31)) >>> 0;

  if (blockstart == blockend) {
    this.buffer[blockstart] |= (headmask & tailmask);
    // All bits to set are in one block.
    return;
  }

  // Handle head block
  this.buffer[blockstart] |= headmask;

  // Handle body blocks
  for (var cursor = blockstart + 1; cursor != blockend; cursor++) {
    this.buffer[cursor] = 0xFFFFFFFF;
  }

  // Handle tail block
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

  var headmask = (0xFFFFFFFF << (start & 31)) >>> 0;
  var tailmask = (0xFFFFFFFF >>> ((31 - end) & 31)) >>> 0;

  // Handle all bits to clear in one block.
  if (blockstart == blockend) {
    this.buffer[blockstart] &= ~(headmask & tailmask);
    return;
  }

  // Handle head block
  this.buffer[blockstart] &= ~headmask;

  // Handle body blocks
  for (var cursor = blockstart + 1; cursor != blockend; cursor++) {
    this.buffer[cursor] = 0;
  }

  // Handle tail block
  this.buffer[blockend] &= ~tailmask;
};


/**
 * Searches for a block of cleared bits.
 * @param {number} start
 * @param {number} end
 * @param {number} length
 * @return {number}
 */
wideboard.Bitvec.prototype.findGap = function(start, end, length) {
  var buffer = this.buffer;

  var cursor = start;
  while (cursor <= end - length) {
    // Skip full blocks.
    if (this.buffer[cursor >> 5] == 0xFFFFFFFF) {
      cursor = (cursor & ~31) + 32;
      continue;
    }

    // Cursor is not in a full block, scan backwards along the potential gap
    // and skip forward if we hit a set bit.
    var j = length - 1;
    for (; j >= 0; j--) {
      var k = cursor + j;
      if (buffer[k >> 5] & (1 << (k & 31))) {
        cursor = k + 1;
        break;
      }
    }

    // If the above loop completed, we never found a set bit & so we have
    // a valid gap.
    if (j == -1) {
      return cursor;
    }
  }

  return -1;
};


/**
 * Self-test set, clear, findGap.
 */
wideboard.Bitvec.test = function() {
  for (var size = 1; size <= 128; size++) {
    var b = new wideboard.Bitvec(size);

    for (var i = 0; i < b.size; i++) {
      for (var j = i + 1; j <= b.size; j++) {
        var length = j - i;

        // Clearing all bits in the vector and then setting a block should
        // produce the expected clear-set-clear pattern.
        b.clear(0, b.size);
        b.set(i, length);

        for (var k = 0; k < i; k++) {
          goog.asserts.assert(b.getBit(k) == 0);
        }
        for (var k = i; k < j; k++) {
          goog.asserts.assert(b.getBit(k) == 1);
        }
        for (var k = j; k < b.size; k++) {
          goog.asserts.assert(b.getBit(k) == 0);
        }

        // Setting all bits in the vector and then making a hole should
        // produce the expected set-clear-set pattern.
        b.set(0, b.size);
        b.clear(i, length);

        for (var k = 0; k < i; k++) {
          goog.asserts.assert(b.getBit(k) == 1);
        }
        for (var k = i; k < j; k++) {
          goog.asserts.assert(b.getBit(k) == 0);
        }
        for (var k = j; k < b.size; k++) {
          goog.asserts.assert(b.getBit(k) == 1);
        }

        // Searching for a gap bigger than the hole should fail.
        var gap = b.findGap(0, b.size, length + 1);
        goog.asserts.assert(gap == -1);

        // Searching for a gap the size of the hole should succeed.
        gap = b.findGap(0, b.size, length);
        goog.asserts.assert(gap == i);

        // Searching for a gap the size of the hole, but starting after the start of the hole, should fail.
        gap = b.findGap(i + 1, b.size, length);
        goog.asserts.assert(gap == -1);

        // Searching for a gap the size of the hole, but ending before the end of the hole, should fail.
        gap = b.findGap(0, i + length - 1, length);
        goog.asserts.assert(gap == -1);

        // Setting a bit in the middle of the hole should cause the search
        // to fail.
        b.setBit(i + (length >> 1));
        gap = b.findGap(0, b.size, length);
        goog.asserts.assert(gap == -1);
      }
    }
  }
};
