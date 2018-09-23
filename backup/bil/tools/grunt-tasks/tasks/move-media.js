var grunt = require('grunt');
var config = {
    move: {
        move_multiple: {
            files: []
        }
    }
};
grunt.config.merge(config);
grunt.file.defaultEncoding = 'utf8';
grunt.file.preserveBOM = false;
grunt.loadNpmTasks('./../../../node_modules/grunt-move');

var FILESPATH = "./../../explorations/*/lang/en/**/*.*";
var _DEBUG = true;

var myLog = function () {
    if (!_DEBUG) {
        return;
    }
    console.log.apply(null, arguments);
};

var parseLocData = function (file) {
    grunt.config.data.move.move_multiple.files.push({
        src: file,
        dest: file.replace("lang/en/", "")
    });
};

grunt.registerTask('move-media', 'Moves all language specific files to data folder', function () {
    var files = grunt.file.expand(FILESPATH);
    for (var i = 0; i < files.length; i++) {
        parseLocData(files[i]);
    }
    myLog('> Moving files');
    grunt.task.run(["move"]);
    myLog('> Moving complete');
});