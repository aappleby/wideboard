goog.provide('wideboard.Document');

/**
 * Main document class for Wideboard.
 * @constructor
 * @struct
 */
wideboard.Document = function() {
  /** @type {string} */
  this.filename = 'filename';
  /** @type {!Array.<number>} */
  this.lines = [];
};


/**
 * @param {string} filename
 * @param {!wideboard.Linemap} linemap
 */
wideboard.Document.prototype.load = function(filename, linemap) {
  /*
  var xhr1 = new XMLHttpRequest();
  xhr1.open('GET', 'wb-app.js');
  xhr1.responseType = 'arraybuffer';

  xhr1.onload = goog.bind(function() {
    var bytes = new Uint8Array(xhr1.response);

    var cursor = 0;

    // Skip byte order mark if present.
    if (bytes[0] == 239) {
      cursor = 3;
    }

    var end = bytes.length;
    var lineStart = cursor;

    for (var i = cursor; i < bytes.length; i++) {

      if (bytes[i] == 10) {
        // Hit a \n.
        linePos.push(cursor);
        lineLength.push(i - cursor);
        cursor = i + 1;
      }
    }
    if (cursor < bytes.length) {
      linePos.push(cursor);
      lineLength.push(i - cursor - 1);
    }

    var data = new Uint8Array(this.width * this.height);
    data.set(bytes);
    var blob = new Uint8Array(data.buffer);

    var gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.format,
                  this.width, this.height, 0,
                  this.format, gl.UNSIGNED_BYTE, blob);
    this.ready = true;
  }, this);

  xhr1.send();
  */
};
