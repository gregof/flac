var fsa = require('fsa');
var path = require('path');
var fs = require('fs');
var abc = require('abc');
var childProcess = require('child_process');

var CACHE_DIR = '.indx';
var CACHE_FILE = 'index.json';
var GIT_DIR = '.fsa';

exports.load = function (dir, callback) {
    console.log('call cache.load')
    var cacheDir = path.join(dir, CACHE_DIR);
    console.log('cacheDir:', cacheDir);

    fs.exists(cacheDir, function (exists) {
        if (exists) {
            var cacheFile = path.join(cacheDir, CACHE_FILE);
            abc.file.read(cacheFile, function (cacheText) {
                var cache = JSON.parse(cacheText);
                if (cache) {
                    console.log('cache loaded');
                    console.log(cache);
                    fsa.status(dir, { gitDir: path.join(CACHE_DIR, GIT_DIR) }, function (err, status) {
                        console.log('status: ', status);
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
            });
        } else {
            callback(null);
        }
    })
}

exports.remove = function (dir, callback) {
    console.log('call cache.remove')
    var cacheDir = path.join(dir, CACHE_DIR);
    console.log('cacheDir:', cacheDir);

    childProcess.exec('rm -r ' + cacheDir, callback);
}

exports.save = function (dir, objects, callback) {
    console.log('call cache.save')
    var cacheDir = path.join(dir, CACHE_DIR);
    console.log('cacheDir:', cacheDir);
    var fsaOptions = { gitDir: path.join(CACHE_DIR, GIT_DIR) }; 

    abc.dir(cacheDir, function (err) {
        if (err) {
            throw err;
        }
        fsa.init(dir, fsaOptions, function (err) {
            if (err) {
                throw err;
            }
            fsa.add(dir, fsaOptions, function (err) {
                if (err) {
                    throw err;
                }            
                fsa.commit(dir, fsaOptions, function (err) {
                    if (err) {
                        throw err;
                    }            
                    abc.file.write(
                        path.join(cacheDir, CACHE_FILE), 
                        JSON.stringify(objects),
                        function (err) {
                            if (err) {
                                throw err;
                            }
                            callback();
                        }
                    )
                })
            })
        })        
    })
}