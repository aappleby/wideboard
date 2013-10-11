/**
 * The librarian coordinates loading files, splitting them into chunks,
 * splitting the chunks into lines, and storing the various bits of data
 * in the linemaps and docmaps.
 */

goog.provide('wideboard.Librarian');

goog.require('wideboard.Document');
goog.require('wideboard.Linemap');
goog.require('wideboard.Scrap');
goog.require('wideboard.Shelf');



/**
 * @param {!wideboard.Context} context
 * @constructor
 * @struct
 */
wideboard.Librarian = function(context) {
  /** @type {!wideboard.Context} */
  this.context = context;

  /** @type {!wideboard.Linemap} */
  this.linemap = new wideboard.Linemap(this.context, 2048, 2048);

  /** @type {!wideboard.Shelf} */
  this.shelf = new wideboard.Shelf(context, 512, 512);

  /** @type {!Array.<!wideboard.Document>} */
  this.documents = [];
  
  var files = [
    //'warandpeace.txt',
    'index.html',
    'simple.glsl',
    'text1.glsl',
    'texture.glsl',
    'wb-app.js',
    'wb-attribute.js',
    'wb-bitvec.js',
    'wb-buffer.js',
    'wb-camera.js',
    'wb-context.js',
    'wb-controls.js',
    'wb-document.js',
    'wb-dragtarget.js',
    'wb-draw.js',
    'wb-file.js',
    'wb-grid.js',
    'wb-librarian.js',
    'wb-linemap.js',
    'wb-scrap.js',
    'wb-shader.js',
    'wb-shelf.js',
    'wb-texture.js',
    'wb-uniform.js',
    'wb-util.js'
  ];
  
  for (var i = 0; i < files.length; i++) {
    this.documents.push(new wideboard.Document(this.shelf, this.linemap));
    this.documents[i].load(files[i]);
  }
};
