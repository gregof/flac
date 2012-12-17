{
    exec:'async',
    beforeEach: function (tc, callback) {
        tc.execConsole = function exec (command, callback) {
            require('child_process').exec(command, function (err, stdout, stderr) {
                console.log(command);
                if (err) {
                    tc.out(command + ':' + err);
                }
                callback();
            });
        };
        tc.sort = function (arr) {
            arr.sort(function (a, b) {
                return a.desc.name > b.desc.name ? 1 : -1
            })
            return arr;
        }
        tc.execConsole('mkdir tmp', callback);
    },
    afterEach: function (tc, callback) {
        tc.execConsole('rm -rf tmp', callback);
    }
}