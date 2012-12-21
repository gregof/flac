var abc = require('abc');
var path = require('path');
var fsa = require('fsa');

var cache = require('./cache.js');

exports.find = function (dir, options, callback) {
    var filters = options.filters;
    var noCache = options.noCache;

    function saveResult (newObjects) {
        cache.save(dir, newObjects, function () {
            callback(newObjects);
        })        
    }

    if (noCache) {
        findInDir(dir, '', filters, callback);
    } else {
        cache.load(dir, function (cachedObjects, status) {
            if (cachedObjects) {
                if (status.added.length || status.modified.length || status.deleted.length) {
                    loadWithCache(dir, filters, cachedObjects, status, saveResult);
                } else {
                    callback(cachedObjects);
                }
            } else {
                findInDir(dir, '', filters, saveResult);
            }        
        });    
    }
}

function loadWithCache (dir, filters, cachedObjects, status, callback) {
    var statusManager = new fsa.StatusManager(status);    
    var newObjects = [];

    abc.async.forEach(
        [
            // check each cached object
            function (callback) {
                checkCachedObjects(dir, cachedObjects, statusManager, function (objects) {
                    newObjects = newObjects.concat(objects);
                    callback();
                });
            },
            // load new modules
            function (callback) {
                loadObjectsFromFiles(dir, statusManager.getAddedFiles(), filters, function (objects) {
                    newObjects = newObjects.concat(objects);
                    callback();
                });
            },
            // find in new directories
            function (callback) {
                abc.async.forEach(
                    statusManager.getAddedDirs(),
                    function (addedDir, callback) {
                        findInDir(dir, addedDir, filters, function (objects) {
                            newObjects = newObjects.concat(objects);
                            callback();
                        })
                    },
                    callback
                );
            }
        ], 
        function () {
            callback(newObjects);
        }
    );
}

function checkCachedObjects (dir, cachedObjects, statusManager, callback) {
    var objects = [];

    abc.async.forEach(
        cachedObjects,
        function (cachedObject, callback) {
            var objectStatus = statusManager.getFileStatus(cachedObject.file);
            /* 
                status can be equals to three value: 
                  'M' - modified, 
                  'D' - deleted, 
                  '-' - not changed.
            */
            if (objectStatus === 'M') {
                // reload modified objects
                loadText(dir, cachedObject.file,
                    function (text) {
                        cachedObject.text = text;
                        objects.push(cachedObject)
                        callback();
                    }
                )
            } else if (objectStatus === '-') {
                // copy unchanged objects
                objects.push(cachedObject);
                callback();
            } else {
                // ignore deleted objects
                callback();
            }
        },
        function () {
            callback(objects);
        }
    );
}

function loadObjectsFromFiles (dir, newFiles, filters, callback) {
    var objects = [];
    abc.async.forEach(
        newFiles,
        function (filePath, callback) {
            var file = path.basename(filePath);
            var isObject = filters.some(function (filter) {

                if (filter.test(file, filePath)) {

                    loadText(dir, filePath, function (text) {
                        objects.push({
                            filter: filter.name,
                            file: filePath,
                            text: text
                        });
                        callback();
                    })                                
                    return true;
                }
            });

            if (!isObject) {
                callback();
            }
        },
        function () {
            callback(objects);
        }
    );
}

function findInDir (rootDir, dir, filters, callback) {
    var objects = [];
    abc.find(
        path.join(rootDir, dir),
        function (file, dirPath) {
            var filePath = path.join(path.relative(rootDir, dirPath), file);
            filters.some(function (filter) {
                if (filter.test(file, filePath)) {
                    objects.push({
                        filter: filter.name,
                        file: filePath
                    });
                    return true;
                }
            })
        },
        function () {
            abc.async.forEach(
                objects, 
                function (object, callback) {
                    loadText(rootDir, object.file, function (text) {
                        object.text = text;
                        callback();
                    });
                }, 
                function () {
                    callback(objects);
                }
            );
        }
    );
}

function loadText (dir, file, callback) {
    var filePath = path.join(dir, file);
    abc.file.read(filePath, callback);
}