//in
var abc = require('abc');
var flac = require(tc.fixPath('../../lib/index.js'));

abc.async.sequence(
    [
        function (callback) {
            tc.execConsole([
                'mkdir tmp/a',
                'echo \'{"name":"a"}\' > tmp/a/module.json',
                'mkdir tmp/b',
                'echo \'{"name":"b"}\' > tmp/b/module.json'
            ].join(';'), callback)
        },
        function (callback) {
            flac.find('tmp', function (objects) {
                tc.out(JSON.stringify(tc.sort(objects), null, '  '))
                callback();
            })
        },
        function (callback) {
            tc.execConsole([
                'mv tmp/b/module.json tmp/b/module2.json'
            ].join(';'), callback)
        },
        function (callback) {
            flac.find('tmp', function (objects) {
                tc.out(JSON.stringify(tc.sort(objects), null, '  '))
                callback();
            })
        },
        function (callback) {
            tc.execConsole([
                'mv tmp/b/module2.json tmp/b/module.json'
            ].join(';'), callback)
        },
        function (callback) {
            flac.find('tmp', function (objects) {
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
  }
]
[
  {
    "type": "module",
    "file": "a/module.json",
    "desc": {
      "name": "a"
    }
  }
]
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
  }
]