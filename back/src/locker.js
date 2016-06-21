'use strict';

var fs = require('fs');
var Promise = require('bluebird');

module.exports = function() {
  var LOCK_FILE = 'lock';

  return {
    check: check,
    lock: lock
  };

  function check() {
    return new Promise(function(resolve, reject) {
      fs.stat(LOCK_FILE, function(err, stat) {
        if (err == null) {
            return resolve(true);
        } else if(err.code == 'ENOENT') {
            return resolve(false);
        } else {
            return reject('Error while checing the lock file.');
        }
      });
    });
  }

  function lock() {
    fs.writeFile(LOCK_FILE, 'locked');
  }
};
