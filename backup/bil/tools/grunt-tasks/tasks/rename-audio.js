var grunt = require('grunt');

var audioToRename = [];
var config = {
    rename: {
        main: {
            files: audioToRename
        }
    }
};
grunt.config.merge(config);
grunt.file.defaultEncoding = 'utf8';
grunt.file.preserveBOM = false;
grunt.loadNpmTasks('./../../../node_modules/grunt-rename-util');

var _DEBUG = false;

var myLog = function () {
    if (!_DEBUG) {
        return;
    }
    console.log.apply(null, arguments);
};
var FILESPATH = "./../../explorations/**/data/main.json";



/**
 * Update Json with new Audio IDs and Urls
 * Returns an array of old audio ID, new audio ID, url and audio path type
 * @param {any} json
 * @param {string} explorationID
 */
var renameAudioInJson = function (json, explorationID) {
    var audioIDs = null;
    audioIDs = [];
    var questions = json.questions;
    var resources = json.resources;
    var additionalInfo = (json.additionalInfo && json.additionalInfo.audioID) ? json.additionalInfo : null;
    explorationID = explorationID.replace("19NA_", "").replace("int_exploration", "");
    for (var i = 0; i < questions.length; i++) {
        if (questions[i].audioID) {
            var oldAudioID = questions[i].audioID;
            var newAudioID = explorationID + "q" + (i + 1);
            audioIDs.push({
                oldID: oldAudioID,
                newID: newAudioID
            });
            questions[i].audioID = newAudioID;
        }
    }
    if (additionalInfo) {
        var oldAudioID = additionalInfo.audioID;
        var newAudioID = explorationID.substring(0, explorationID.length - 1);
        additionalInfo.audioID = newAudioID;
        audioIDs.push({
            oldID: oldAudioID,
            newID: newAudioID
        });
    }

    var audioData = resources.media.audio;
    for (var i = 0; i < audioData.length; i++) {
        var id = audioData[i].id;
        var data = audioIDs.filter(function (data) {
            return data.oldID == id
        });
        audioData[i].id = data[0].newID;
        data[0].url = audioData[i].url;
        audioData[i].url = data[0].newID + ".mp3";
        data[0].type = audioData[i].type;
    }
    return {
        json,
        audioIDs
    };
}

/**
 * Create an array with src and dest paths of audio to be renamed
 * @param {string} filePath
 * @param {any[]} audioData
 */
var renameAudio = function (filePath, audioData) {
    var parentDir = filePath.replace("/data/main.json", "");
    for (var i = 0; i < audioData.length; i++) {
        var type = audioData[i].type;
        switch (type) {
            case "EXPLORATION_COMMON_AUDIO":
                var oldPath = parentDir + "/media/audio/" + audioData[i].url;
                var newPath = parentDir + "/media/audio/" + audioData[i].newID + ".mp3";
                audioToRename.push({
                    src: oldPath,
                    dest: newPath
                });
                break;
            case "EXPLORATION_LANG_AUDIO":
                var oldPath = parentDir + "/lang/en/media/audio/" + audioData[i].url;
                var newPath = parentDir + "/lang/en/media/audio/" + audioData[i].newID + ".mp3";
                audioToRename.push({
                    src: oldPath,
                    dest: newPath
                });
                oldPath = parentDir + "/lang/es/media/audio/" + audioData[i].url;
                newPath = parentDir + "/lang/es/media/audio/" + audioData[i].newID + ".mp3";
                audioToRename.push({
                    src: oldPath,
                    dest: newPath
                });
                break;
        }
    }
}

/**
 * Modifies json, creates an array of audios to be renamed
 * @param {string} filePath
 */
var renameAudioInExploration = function (filePath) {
    myLog(">> Reading & Parsing file: " + filePath);
    var json = grunt.file.readJSON(filePath);
    var explorationID = json.explorationID;
    var updatedData = renameAudioInJson(json, explorationID);
    json = updatedData.json;
    var updatedAudioData = updatedData.audioIDs;
    renameAudio(filePath, updatedAudioData);
    grunt.file.write(filePath, JSON.stringify(json, null, 4));
};


/**
 * Default grunt task to rename audio files.
 */
grunt.registerTask('audio-rename', 'Renames all audios across all explorations', function (path) {
    console.log('> Initializing Audio Rename');

    var jsonFiles = grunt.file.expand(FILESPATH);
    console.log("> Renaming audio files in " + jsonFiles.length + " explorations.");
    for (var i = 0; i < jsonFiles.length; i++) {
        renameAudioInExploration(jsonFiles[i]);
    }
    // Renames audios inside the exploration.
    grunt.task.run(["rename"]);
    console.log('> Audio rename completed.');
});

grunt.registerTask("rename-audio", ["audio-rename"]);