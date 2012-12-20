var fsa = require('fsa');
var path = require('path');
var fs = require('fs');
var abc = require('abc');
var childProcess = require('child_process');

var CACHE_DIR = '.flac';
var CACHE_FILE = 'index.json';
var GIT_DIR = '.fsa';

exports.load = function (dir, callback) {
    var cacheDir = path.join(dir, CACHE_DIR);

    fs.exists(cacheDir, function (exists) {
        if (!exists) {
            callback(null);
            return;
        }
        
        abc.file.read(
            path.join(cacheDir, CACHE_FILE), 
            function (cacheText) {
                var cache = JSON.parse(cacheText);
                if (cache) {
                    fsa.status(dir, {gitDir: path.join(CACHE_DIR, GIT_DIR)}, function (err, status) {
                        callback(cache, status);
                    })
                } else {
                    exports.remove(dir, function (err) {
                        if (err) {
                            console.log('Can\'t remove previous version of cache.');
                            throw err;
                        }
                        callback(null);
                    })
                }
            }
        );
    })
}

exports.remove = function (dir, callback) {
    var cacheDir = path.join(dir, CACHE_DIR);
    childProcess.exec('rm -r ' + cacheDir, callback);
}

exports.save = function (dir, objects, callback) {
    var cacheDir = path.join(dir, CACHE_DIR);
    var fsaOptions = {gitDir: path.join(CACHE_DIR, GIT_DIR)};

    function getCallback (callback) {
        return function (err) {
            if (err) {
                console.log('WARNING: ')
                console.log(err.message);
            }
            callback();
        }
    }

    abc.async.sequence(
        [
            function (callback) {
                abc.dir(cacheDir, getCallback(callback));
            },
            function (callback) {
                fsa.init(dir, fsaOptions, getCallback(callback));
            },
            function (callback) {
                fsa.add(dir, fsaOptions, getCallback(callback));
            },
            function (callback) {
                fsa.commit(dir, fsaOptions, getCallback(callback));
            },
            function (callback) {
                abc.file.write(
                    path.join(cacheDir, CACHE_FILE), 
                    JSON.stringify(objects),
                    getCallback(callback)
                )
            }
        ], 
        callback
    );
}