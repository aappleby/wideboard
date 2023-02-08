require('./closure-library/closure/goog/bootstrap/nodejs');

goog.provide('wideboard.FileInfo');
goog.provide('wideboard.Request');
goog.provide('wideboard.Server');

var http = /** @type {!node.http} */ (require('http'));
var path = /** @type {!node.path} */ (require('path'));
var fs = /** @type {!node.fs} */ (require('fs'));
var url = /** @type {!node.url} */ (require('url'));

var when = /** @type {!node.when} */ (require('when'));
var nodefn = /** @type {!node.nodefn} */ (require('when/node/function'));


/**
 * @param {string} filename
 * @constructor
 * @struct
 */
wideboard.FileInfo = function(filename) {
  /** @type {string} */
  this.name = filename;

  /** @type {node.fs.Stats} */
  this.stat = null;
};


/**
 * @param {!node.http.ClientRequest} request
 * @param {!node.http.ServerResponse} response
 * @constructor
 * @struct
 */
wideboard.Request = function(request, response) {
  /**
   * @type {!node.http.ClientRequest}
   */
  this.request = request;

  /**
   * @type {!node.http.ServerResponse}
   */
  this.response = response;

  /** @type {!Array.<!wideboard.FileInfo>} */
  this.fileInfo = [];

  /** @type {Uint8Array} */
  this.contents = null;

  /** @type {number} */
  this.pendingStat = 0;

  /** @const {!Object.<string, boolean>} */
  this.extensionFilter = {
    '' : true,
    '.html': true,
    '.css': true,
    '.js': true,
    '.c': true,
    '.h': true,
    '.glsl': true
  };

  this.blacklist = {
    '.git': true
  };

  /** @type {number} */
  this.shouldnotwork = nodefn.call(fs.stat);
};


/**
 * @param {string} filename
 */
wideboard.Request.prototype.sendNotFound = function(filename) {
  this.response.writeHead(404, {'Content-Type': 'text/plain'});
  this.response.write('404 Not Found - ' + filename);
  this.response.end();
};


/**
 * @param {!Error} error
 */
wideboard.Request.prototype.sendError = function(error) {
  this.response.writeHead(500, {'Content-Type': 'text/plain'});
  this.response.write(JSON.stringify(error));
  this.response.end();
};


/**
 * @param {string} filename
 * @param {!ArrayBuffer} contents
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
  var encoded = JSON.stringify(object, null, 2);
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
 * @param {Error} error
 * @param {node.fs.Stats} stats
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
 * @param {Error} error
 * @param {!Array.<string>} files
 */
wideboard.Request.prototype.onReadDirectory = function(dirname, error, files) {
  if (error) {
    this.sendJson(error);
    return;
  }

  /** @type {!Array.<!node.when.Promise>} */
  var promises = [];

  for (var i = 0; i < files.length; i++) {
    promises.push(nodefn.call(fs.stat, path.join(dirname, files[i])));
  }

  var self = this;
  when.all(promises).then(
     function(stats) { self.onStatDirectory(dirname, null, files, stats); },
     function(error) { self.onStatDirectory(dirname, error, files, null); });
};


/**
 * @param {string} dirname
 * @param {Error} error
 * @param {!Array.<string>} files
 * @param {Array.<!node.fs.Stats>} stats
 */
wideboard.Request.prototype.onStatDirectory = function(dirname, error, files, stats) {
  if (error) {
    this.sendJson(error);
  }

  var response = [];
  for (var i = 0; i < stats.length; i++) {
    var base = path.basename(files[i]);
    if (this.blacklist[base]) continue;

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
 * @param {Error} error
 * @param {!ArrayBuffer} buffer
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
  var query = parsed['query'];

  if (query['dir']) {
    this.sendString('You asked for dir ' + query['dir']);
    return;
  }

  var uri = parsed.pathname;
  //console.log('=== ' + uri);
  //if (uri == '/') uri += "index.html";
  var filename = path.join(process.cwd(), uri);

  fs.stat(filename, this.onStatFile.bind(this, filename));
};


/**
 * @constructor
 * @struct
 */
wideboard.Server = function() {

  this.main = function(request, response) {
    var r = new wideboard.Request(request, response);
    r.dispatch();
  };

  var port = 65432;
  http.createServer(this.main.bind(this)).listen(port);
  goog.global.console.log('Started on port ' + port);
};


/**
 * @type {!wideboard.Server}
 */
goog.global.wbServer = new wideboard.Server();
