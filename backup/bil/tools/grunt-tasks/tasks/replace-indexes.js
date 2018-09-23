var grunt = require('grunt');

// Grunt setup.
// grunt.initConfig({});
grunt.file.defaultEncoding = 'utf8';
grunt.file.preserveBOM = false;

var FILESPATH = "./../../revised-explorations/";
var INDEX_FILE_PATH = "./base-index.html";
var K5_INDEX_FILE_PATH = "./k-5-index.html";
var G_6_8_INDEX_FILE_PATH = "./g-6-8-index.html";
var _DEBUG = true;

var myLog = function () {
    if (!_DEBUG) {
        return;
    }
    console.log.apply(null, arguments);
};

grunt.registerTask('replace-indexes', 'Replacing all indexes', function () {
    var folders = grunt.file.expand({
        filter: 'isDirectory'
    }, [FILESPATH + "*", "!" + FILESPATH + "zeus_common"]);
    for (var i = 0; i < folders.length; i++) {
        console.log(folders[i]);
        if (folders[i].match(/(19NA|20FL)0[0-5]_.+/)) {
            grunt.file.copy(K5_INDEX_FILE_PATH, folders[i] + "/index.html");
        } else if (folders[i].match(/(19NA)0[6-8]_.+/)) {
            grunt.file.copy(G_6_8_INDEX_FILE_PATH, folders[i] + "/index.html");
        } else {
            grunt.file.copy(INDEX_FILE_PATH, folders[i] + "/index.html");
        }
        myLog('> Replacing index.html in ', folders[i]);
    }

    // var folders = grunt.file.expand({ filter: 'isDirectory' }, [K5_FILESPATH + "*", "!" + K5_FILESPATH + "zeus_common"]);
    // for (var i = 0; i < folders.length; i++) {
    //     grunt.file.copy(K5_INDEX_FILE_PATH, folders[i] + "/index.html");
    //     myLog('> Replacing index.html in ', folders[i]);
    // }
    myLog('> Replacing all indexes');
});