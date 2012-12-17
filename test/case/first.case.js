//in
var indexer = require(tc.fixPath('../../lib/index.js'));
indexer.scan(tc.fixPath('./src'), function (objects) {
    tc.out(JSON.stringify(objects, null, '  '))
    tc.finish();
})
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