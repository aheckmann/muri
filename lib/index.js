// muri

/**
 * MongoDB URI parser as described here:
 * http://www.mongodb.org/display/DOCS/Connections
 */

/**
 * Module dependencies
 */

var url = require('url');
var qs = require('querystring');

/**
 * Defaults
 */

const DEFAULT_PORT = 27017;
const DEFAULT_DB = 'admin';

/**
 * Muri
 */

module.exports = exports = function muri (str) {
  if (!/^mongodb:\/\//.test(str)) {
    throw new Error('Invalid mongodb uri. Must begin with "mongodb://"');
  }

  var ret = {
      hosts: []
    , db: 'admin'
    , options: {}
  }

  var match = /^mongodb:\/\/([^\/?]+)(\/?.*)$/.exec(str);
  if (!match) {
    throw new Error('Invalid mongodb uri. Missing hostname');
  }

  var uris = match[1];
  var path = match[2];

  uris.split(',').forEach(function (uri) {
    var o = url.parse('mongodb://' + uri);

    if (o.hostname) {
      ret.hosts.push({
          host: o.hostname
        , port: parseInt(o.port || DEFAULT_PORT, 10)
      })
    }

    if (o.auth) {
      var auth = o.auth.split(':');
      ret.auth = {
          user: auth[0]
        , pass: auth[1]
      }
    }
  })

  var parts = path.split('?');
  if (parts[0]) {
    var db = parts[0].replace(/^\//, '');
    if (db) {
      ret.db = db;
    }
  }

  if (parts[1]) {
    ret.options = options(parts[1]);
  }

  return ret;
}

/**
 * Parse str into key/val pairs casting values appropriately.
 */

function options (str) {
  var sep = /;/.test(str)
    ? ';'
    : '&';

  var ret = qs.parse(str, sep);

  Object.keys(ret).forEach(function (key) {
    var val = ret[key];
    var num;

    if ('true' == val) {
      val = true;
    } else if ('false' == val) {
      val = false;
    } else {
      num = parseInt(val, 10);
      if (!isNaN(num)) {
        val = num;
      }
    }

    ret[key] = val;
  });

  return ret;
}

/**
 * Version
 */

module.exports.version = JSON.parse(
  require('fs').readFileSync(__dirname + '/../package.json', 'utf8')
).version;
