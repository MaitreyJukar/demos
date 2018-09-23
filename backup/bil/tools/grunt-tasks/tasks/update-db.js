var grunt = require('grunt');

// Grunt setup.
// grunt.initConfig({});
grunt.file.defaultEncoding = 'utf8';
grunt.file.preserveBOM = false;

var FILESPATH = "./../../explorations/**/main.json";
var _DEBUG = true;
var explorationTable = [];
var EXP_PARSER = /19NA_(.{2})_c(\d{2})_s(\d{2})_.+/;
var SUBJECTS = {
    A1: "Algebra 1",
    A2: "Algebra 2",
    GE: "Geometry"
};

var myLog = function () {
    if (!_DEBUG) {
        return;
    }
    console.log.apply(null, arguments);
};

var parseJSONData = function (filePath) {
    var json = grunt.file.readJSON(filePath),
        explorationData = parseExplorationData(json);
    explorationTable.push(explorationData);
};

var parseExplorationData = function (json) {
    var matches = json.explorationID.match(EXP_PARSER);
    var data = {
            "name": json.explorationID,
            "subject": SUBJECTS[matches[1]],
            "chapter": matches[2],
            "section": matches[3],
            "desmos": 0,
            "learnosity": 0,
            "custom": 0
        },
        components = [],
        questions = json.questions;

    fillComponentData(components, questions);
    parseComponentData(data, components);
    return data;
};

var fillComponentData = function (components, questions) {
    for (var q = 0; q < questions.length; q++) {
        var currQuestion = questions[q];
        for (var l = 0; l < currQuestion.layouts.length; l++) {
            var currLayout = currQuestion.layouts[l];
            if (currLayout.multi) {
                Array.prototype.push.apply(components, currLayout.lcomponents.components);
                Array.prototype.push.apply(components, currLayout.rcomponents.components);
            } else {
                Array.prototype.push.apply(components, currLayout.components);
            }
        }
    }
};

var parseComponentData = function (data, components) {
    for (var i = 0; i < components.length; i++) {
        switch (components[i].type) {
            case "desmos":
            case "learnosity":
            case "custom":
                data[components[i].type]++;
                break;
            default:
                break;
        }
    }
}

grunt.registerTask('update-db', 'Updates all search parameters', function () {
    var files = grunt.file.expand(FILESPATH);
    for (var i = 0; i < files.length; i++) {
        parseJSONData(files[i]);
        myLog('> Updating data from ', files[i]);
    }
    var database = {
        explorations: explorationTable
    };
    myLog('> Updating database');
    grunt.file.write("explorations.json", JSON.stringify(database, null, 4));
});