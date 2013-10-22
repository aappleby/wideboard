/**
 * NodeJS 'require'
 * @param {string} module
 * @return {Object}
 */
function require(module) {}


/**
 * NodeJS builtin module.
 * @constructor
 */
var process = function() {};

/**
 * @return {string}
 */
process.cwd = function() {};



/**
 * @constructor
 */
var node = function() {};



/**
 * @constructor
 */
node.http = function() {};

/**
 * @param {function(node.http.ClientRequest, node.http.ServerResponse)} callback
 * @return {!node.http.Server}
 */
node.http.prototype.createServer = function(callback) {};



/**
 * @constructor
 * @struct
 */
node.http.Server = function() {};

/**
 * @param {number} port
 * @param {string=} hostname
 * @param {number=} backlog
 * @param {function(string)=} callback
 */
node.http.Server.prototype.listen = function(port, hostname, backlog, callback) {};



/**
 * @constructor
 * @struct
 */
node.http.ClientRequest = function() {
  /** @type {string} */
  this.url;
};



/**
 * @constructor
 * @struct
 */
node.http.ServerResponse = function() {};

/**
 * @param {number} statusCode
 * @param {(string|Object)=} reasonPhrase
 * @param {Object=} headers
 */
node.http.ServerResponse.prototype.writeHead = function(statusCode, reasonPhrase, headers) {};

/**
 * @param {(string|ArrayBuffer)} chunk
 * @param {string=} encoding
 */
node.http.ServerResponse.prototype.write = function(chunk, encoding) {};

/**
 * @param {(string|ArrayBuffer)=} data
 * @param {string=} encoding
 */
node.http.ServerResponse.prototype.end = function(data, encoding) {};


/**
 * @constructor
 * @struct
 */
node.path = function() {};

/**
 * @param {string} p
 * @return {string}
 */
node.path.prototype.extname = function(p) {};

/**
 * @param {string} base
 * @param {...string} var_args
 * @return {string}
 */
node.path.prototype.join = function(base, var_args) {};


/**
 * @constructor
 * @struct
 */
node.fs = function() {};

/**
 * @param {string} path}
 * @param {function(!Array.<string>)} callback
 */
node.fs.prototype.readdir = function(path, callback) {};

/**
 * @param {string} filename
 * @param {(Object|function(!ArrayBuffer))} options
 * @param {function(!ArrayBuffer)=} callback
 */
node.fs.prototype.readFile = function(filename, options, callback) {};

/**
 * @param {string} path
 * @param {function(!node.fs.Stats)} callback
 */
node.fs.prototype.stat = function(path, callback) {};



/**
 * @constructor
 * @struct
 */
node.fs.Stats = function() {
  /** @type {number} */
  this.dev;
  /** @type {number} */
  this.ino;
  /** @type {number} */
  this.mode;
  /** @type {number} */
  this.nlink;
  /** @type {number} */
  this.uid;
  /** @type {number} */
  this.gid;
  /** @type {number} */
  this.rdev;
  /** @type {number} */
  this.size;
  /** @type {number} */
  this.blksize;
  /** @type {number} */
  this.blocks;
  /** @type {Date} */
  this.atime;
  /** @type {Date} */
  this.mtime;
  /** @type {Date} */
  this.ctime;
};

/**
 * @return {boolean}
 */
node.fs.Stats.prototype.isFile = function() {};

/**
 * @return {boolean}
 */
node.fs.Stats.prototype.isDirectory = function() {};

/**
 * @return {boolean}
 */
node.fs.Stats.prototype.isBlockDevice = function() {};

/**
 * @return {boolean}
 */
node.fs.Stats.prototype.isCharacterDevice = function() {};

/**
 * @return {boolean}
 */
node.fs.Stats.prototype.isSymbolicLink = function() {};

/**
 * @return {boolean}
 */
node.fs.Stats.prototype.isFIFO = function() {};

/**
 * @return {boolean}
 */
node.fs.Stats.prototype.isSocket = function() {};



/**
 * @constructor
 * @struct
 */
node.url = function() {};

/**
 * @param {string} urlStr
 * @param {boolean=} parseQueryString
 * @param {boolean=} slashesDenoteHost
 * @return {!Object}
 */
node.url.prototype.parse = function(urlStr, parseQueryString, slashesDenoteHost) {};



/**
 * @constructor
 * @struct
 */
node.when = function() {};

/**
 * @param {!Array.<!node.when.Promise>} promises
 * @return {!node.when.Promise}
 */
node.when.prototype.all = function(promises) {};



/**
 * @constructor
 * @struct
 */
node.when.Promise = function() {};

/**
 * @param {function(*)=} onFulfill
 * @param {function(*)=} onReject
 * @return {!node.when.Promise}
 */
node.when.Promise.prototype.then = function(onFulfill, onReject) {};



/**
 * @constructor
 * @struct
 */
node.nodefn = function() {};

/**
 * @param {function(...)} f
 * @param {...} var_args
 * @return {!node.when.Promise}
 */
node.nodefn.prototype.call = function(f, var_args) {};
