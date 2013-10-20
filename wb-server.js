require('./closure-library/closure/goog/bootstrap/nodejs');

goog.provide('wideboard.FileInfo');
goog.provide('wideboard.Request');

http = require('http');
fs = require('fs');
url = require('url');
path = require('path');
when = require('when');
nodefn = require('when/node/function');


/**
 * @param {string} filename
 * @constructor
 * @struct
 */
wideboard.FileInfo = function(filename) {
  /** @type {string} */
  this.name = filename;

  /** @type {Object} */
  this.stat = null;
};


/**
 * @param {Object} request
 * @param {Object} response
 * @constructor
 * @struct
 */
wideboard.Request = function(request, response) {
  /** @type {!Object} */
  this.request = request;

  /** @type {!Object} */
  this.response = response;

  /** @type {!Array.<!wideboard.FileInfo>} */
  this.fileInfo = [];

  /** @type {Uint8Array} */
  this.contents = null;

  /** @type {number} */
  this.pendingStat = 0;

  this.extensionFilter = {
    '.html': true,
    '.css': true,
    '.js': true,
    '.c': true,
    '.h': true,
    '.glsl': true
  };
};


/**
 * @param {string} filename
 */
wideboard.Request.prototype.sendNotFound = function(filename) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('404 Not Found - ' + filename);
  response.end();
};


/**
 * @param {Object} error
 */
wideboard.Request.prototype.sendError = function(error) {
  response.writeHead(500, {'Content-Type': 'text/plain'});
  response.write(JSON.stringify(error));
  response.end();
};


/**
 * @param {string} filename
 * @param {!Array.<number>} contents
 */
wideboard.Request.prototype.sendFile = function(filename, contents) {
  var types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript'
  };

  var header = {};
  header['Content-Type'] = types[path.extname(filename)];
  this.response.writeHead(200, header);
  this.response.write(contents, 'binary');
  this.response.end();
};


/**
 * @param {Object} object
 */
wideboard.Request.prototype.sendJson = function(object) {
  var encoded = JSON.stringify(object, true, 2);
  var headers = {};
  headers['Content-Type'] = 'text/plain';
  this.response.writeHead(200, headers);
  this.response.write(encoded, 'binary');
  this.response.end();
};


/**
 * @param {string} text
 */
wideboard.Request.prototype.sendString = function(text) {
  var headers = {};
  headers['Content-Type'] = 'text/plain';
  this.response.writeHead(200, headers);
  this.response.write(text, 'binary');
  this.response.end();
};


/**
 * @param {string} filename
 * @param {Object} error
 * @param {Object} stats
 */
wideboard.Request.prototype.onStatFile = function(filename, error, stats) {
  if (error) {
    this.sendJson(error);
    return;
  }

  if (stats.isDirectory()) {
    fs.readdir(filename, this.onReadDirectory.bind(this, filename));
  } else {
    fs.readFile(filename, this.onReadFile.bind(this, filename));
  }
};


/**
 * @param {string} dirname
 * @param {Object} error
 * @param {!Array.<string>} files
 */
wideboard.Request.prototype.onReadDirectory = function(dirname, error, files) {
  if (error) {
    this.sendJson(error);
    return;
  }

  var promises = [];
  for (var i = 0; i < files.length; i++) {
    promises[i] = nodefn.call(fs.stat, path.join(dirname, files[i]));
  }

  var self = this;
  when.all(promises).then(
     function(stats) { self.onStatDirectory(dirname, null, files, stats); },
     function(error) { self.onStatDirectory(dirname, error, files, null); });
};


/**
 * @param {string} dirname
 * @param {Object} error
 * @param {!Array.<string>} files
 * @param {!Array.<Object>} stats
 */
wideboard.Request.prototype.onStatDirectory = function(dirname, error, files, stats) {
  if (error) {
    this.sendJson(error);
  }

  var response = [];
  for (var i = 0; i < stats.length; i++) {
    var ext = path.extname(files[i]);
    if (!this.extensionFilter[ext]) continue;
    response.push({
      name: files[i],
      dir: stats[i].isDirectory(),
      size: stats[i].size
    });
  }

  this.sendJson(response);
};


/**
 * @param {string} filename
 * @param {Object} error
 * @param {!Array.<number>} buffer
 */
wideboard.Request.prototype.onReadFile = function(filename, error, buffer) {
  if (error) {
    this.sendJson(error);
    return;
  } else {
    this.sendFile(filename, buffer);
  }
};


/**
 */
wideboard.Request.prototype.dispatch = function() {
  var self = this;
  var request = this.request;
  var response = this.response;

  var parsed = url.parse(request.url, true);
  var query = parsed.query;

  if (query.dir) {
    this.sendString('You asked for dir ' + query.dir);
    return;
  }

  var uri = parsed.pathname;
  console.log('=== ' + uri);
  //if (uri == '/') uri += "index.html";
  var filename = path.join(process.cwd(), uri);

  fs.stat(filename, this.onStatFile.bind(this, filename));
};


/**
 * @param {Object} request
 * @param {Object} response
 */
function main(request, response) {
  var r = new wideboard.Request(request, response);
  r.dispatch();
}

var port = 65432;
http.createServer(main).listen(port);
console.log('Started on port ' + port);
