# FLAC
Find, Load and make the Cache.
Caching made by [fsa](https://github.com/gregof/fsa).

If your filters are changed, you have to `clearCache`, because filters doesn't apply to cached objects.

## Example
File structure:
```
test
  package.json
  a
    module.json
  b
    module.json
```
Define filters and exec flac.find for 'test' directory.
```javascript
var flacOptions = {
    filters: [
        {
            name: 'module',
            test: function (file) {
                return file === 'module.json'
            }
        },
        {
            name: 'package', 
            test: function (file) {
                return file === 'pack.json'
            }
        }
    ],
    noCache: false // not required, becouse false is default value
};
flac.find('test', flacOptions, function (res) {
    // print result
})
```
Result:
```json
[
    {
        "filter": "module",
        "file": "a/module.json",
        "text": "..."
    },
    {
        "filter": "module",
        "file": "b/module.json",
        "text": "..."
    },
    {
        "filter": "p",
        "file": "package",
        "text": "..."
    }
]
```