goog.provide('wideboard.File');

/**
 * Simple file object.
 * @param {string} path
 * @param {boolean} binary
 * @constructor
 * @struct
 */
wideboard.File = function(path, binary) {
  /** @type {string} */
  this.path = path;
  /** @type {boolean} */
  this.binary = binary;
  /** @type {XMLHttpRequest} */
  this.request = null;
  /** @type {string|Uint8Array} */
  this.contents = null;
};


/**
 * Asynchronously loads a file.
 */
wideboard.File.prototype.load = function() {
  this.request = new XMLHttpRequest();
  this.request.onreadystatechange = goog.bind(this.callback, this);
  this.request.open('GET', this.path, true);
  if (this.binary) {
    this.request.responseType = 'arraybuffer';
  }
  this.request.send();
};


/**
 * File load callback.
 */
wideboard.File.prototype.callback = function() {
  if (this.request.readyState == 4) {
    goog.global.console.log('hit callback');
    if (this.binary) {
      var buffer = /** @type {ArrayBuffer} */(this.request.response);
      this.contents = new Uint8Array(buffer);
    } else {
      this.contents = this.request.responseText;
    }
    goog.global.console.log(this.contents);
  }
};
