var abc = require('abc');
var path = require('path');
var fsa = require('fsa');
var cache = require('./cache.js');

exports.scan = function (dir, callback) {

    function saveResult (newObjects) {
        cache.save(dir, newObjects, function () {
            callback(newObjects);
        })        
    }

    cache.load(dir, function (cachedObjects, status) {
        if (cachedObjects) {
            if (status.added.length || status.modified.length || status.deleted.length) {
                loadWithCache(dir, cachedObjects, status, saveResult);
            } else {
                callback(cachedObjects);
            }
        } else {
            findInDir(dir, '', saveResult);
        }        
    });
}

function loadWithCache (dir, cachedObjects, status, callback) {
    var statusManager = new fsa.StatusManager(status);    
    var newObjects = [];

    abc.async.forEach(
        [
            // check each cached object
            function (callback) {
                abc.async.forEach(
                    cachedObjects,
                    function (cachedObject, callback) {
                        var objectStatus = statusManager.getFileStatus(cachedObject.file);
                        if (objectStatus === 'M') {
                            loadModuleDescription(dir, {file: cachedObject.file, type: cachedObject.type}, function (object) {
                                newObjects.push(object)
                                callback();
                            })
                        } else if (objectStatus === '-') {
                            newObjects.push(cachedObject);
                            callback();
                        } else {
                           callback(); 
                        }
                    },
                    callback
                );
            },
            // load new modules
            function (callback) {
                var newFiles = statusManager.getAddedFiles();
                abc.async.forEach(
                    newFiles,
                    function (filePath, callback) {
                        var file = path.basename(filePath);
                        if (isModule(file)) {
                            loadModuleDescription(dir, {type: 'module', file: filePath}, function (newObject) {
                                newObjects.push(newObject);
                                callback();
                            });
                        } else if (isPackage(file)) {
                            loadModuleDescription(dir, {type: 'package', file: filePath}, function (newObject) {
                                newObjects.push(newObject);
                                callback();
                            });
                        } else {
                            callback();
                        }
                    },
                    callback
                );
            },
            // find in new directories
            function (callback) {
                abc.async.forEach(
                    statusManager.getAddedDirs(),
                    function (addedDir, callback) {
                        findInDir(dir, addedDir, function (objects) {
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

function findInDir (rootDir, dir, callback) {
    var objects = [];
    abc.find(
        path.join(rootDir, dir),
        function (file, dirPath) {
            var filePath = path.join(path.relative(rootDir, dirPath), file);
            if (isModule(file)) {
                objects.push({
                    type: 'module',
                    file: filePath
                });
            } else if (isPackage(file)) {
                objects.push({
                    type: 'package',
                    file: filePath
                });
            }
        },
        function () {
            abc.async.forEach(
                objects, 
                function (object, callback) {
                    loadModuleDescription(rootDir, object, callback);
                }, 
                function () {
                    callback(objects);
                }
            );
        }
    );
}

function isModule (file) {
    return file === 'module.json';
}

function isPackage (file) {
    return file === 'package.json';
}

function loadModuleDescription (dir, object, callback) {
    var filePath = path.join(dir, object.file);
    abc.file.read(filePath, function (text) {
        object.desc = JSON.parse(text);
        callback(object);
    })
}