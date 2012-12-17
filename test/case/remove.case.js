//in
var abc = require('abc');
var indexer = require(tc.fixPath('../../lib/index.js'));

abc.async.sequence(
    [
        function (callback) {
            tc.execConsole([
                'mkdir tmp/a',
                'echo \'{"name":"a"}\' > tmp/a/module.json',
                'mkdir tmp/b',
                'echo \'{"name":"b"}\' > tmp/b/module.json',
                'echo \'{"name":"pack"}\' > tmp/package.json'
            ].join(';'), callback)
        },
        function (callback) {
            indexer.scan('tmp', function (objects) {
                tc.out(JSON.stringify(tc.sort(objects), null, '  '))
                callback();
            })
        },
        function (callback) {
            tc.execConsole([
                'rm -r tmp/a'
            ].join(';'), callback)
        },
        function (callback) {
            indexer.scan('tmp', function (objects) {
                tc.out(JSON.stringify(tc.sort(objects), null, '  '))
                callback();
            })
        }

    ],
    function () {
        tc.finish();
    }
);
//out
[
  {
    "type": "module",
    "file": "a/module.json",
    "desc": {
      "name": "a"
    }
  },
  {
    "type": "module",
    "file": "b/module.json",
    "desc": {
      "name": "b"
    }
  },
  {
    "type": "package",
    "file": "package.json",
    "desc": {
      "name": "pack"
    }
  }
]
[
  {
    "type": "module",
    "file": "b/module.json",
    "desc": {
      "name": "b"
    }
  },
  {
    "type": "package",
    "file": "package.json",
    "desc": {
      "name": "pack"
    }
  }
]