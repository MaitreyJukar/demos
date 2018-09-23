var grunt = require('grunt');
var foldersToRename = [];
var config = {
    rename: {
        main: {
            files: foldersToRename
        }
    }
};
grunt.config.merge(config);
grunt.file.defaultEncoding = 'utf8';
grunt.file.preserveBOM = false;
grunt.loadNpmTasks('./../../../node_modules/grunt-rename-util');

var FILESPATH = "./../../explorations/**/main.json";
var _DEBUG = true;
var EXP_PARSER = /(19NA\d{2}_)(c\d{2})(s\d{2})(_.+)/;
var FL_EXP_PARSER = /(20FL.{2}_)(c\d{2})(s\d{2})(_.+)/;

var myLog = function () {
    if (!_DEBUG) {
        return;
    }
    console.log.apply(null, arguments);
};

var parseJSONData = function (filePath) {
    var json = grunt.file.readJSON(filePath),
        explorationData = parseExplorationData(json),
        oldDir = filePath.replace("/data/main.json", "");
    if (explorationData) {
        json.explorationID = explorationData.newName;
        grunt.file.write(filePath, JSON.stringify(json, null, 4));
        grunt.config.data.rename.main.files.push({
            src: oldDir,
            dest: oldDir.replace(explorationData.name, explorationData.newName)
        });
    }
};

var parseExplorationData = function (json) {
    //var matches = json.explorationID.match(FL_EXP_PARSER);
    var matches = json.explorationID.match(EXP_PARSER);
    var data;
    if (matches) {
        data = {
            "name": json.explorationID,
            "newName": matches[1] + matches[2] + "_" + matches[3] + matches[4]
        };
    }
    return data;
};

grunt.registerTask('rename-explorations', 'Renames all explorations as per naming convention', function () {
    var files = grunt.file.expand(FILESPATH);
    for (var i = 0; i < files.length; i++) {
        parseJSONData(files[i]);
        myLog('> Updating data from ', files[i]);
    }
    myLog('> Renaming explorations');
    grunt.task.run(["rename"]);
    myLog('> Renaming complete');
});