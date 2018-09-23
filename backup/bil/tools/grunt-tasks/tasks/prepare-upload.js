var grunt = require('grunt');

var foldersToCopy = [];
var config = {
    copy: {
        main: {
            files: foldersToCopy
        }
    }
}
grunt.config.merge(config);
grunt.file.defaultEncoding = 'utf8';
grunt.file.preserveBOM = false;
grunt.loadNpmTasks('./../../../node_modules/grunt-contrib-copy');

var _DEBUG = false;

var myLog = function () {
    if (!_DEBUG) {
        return;
    }
    console.log.apply(null, arguments);
};

var gatherFoldersToUpload = function (type, batch) {
    var filePath = "./batches.json";
    var json = grunt.file.readJSON(filePath);
    console.log(json[type][batch])
    var explorationsList = json[type][batch];
    var srcPath;
    var destPath;
    if (explorationsList.length > 0) {
        for (var i = 0; i < explorationsList.length; i++) {
            var expName = explorationsList[i];
            if(expName.trim() !== "") {
                srcPath = "./../../explorations/" + expName;
                destPath = "./../../upload/" +  expName;
                foldersToCopy.push({
                    expand: true,
                    cwd: srcPath,
                    src: ['**'],
                    dest: destPath
                });
            }
        }
    }

}

grunt.registerTask('upload', 'Copy batch wise folders to upload folder', function (path) {
    console.log("-> Initializing copy process");
    var type = "k5";
    var batch = 2;
    gatherFoldersToUpload(type, batch);
    grunt.task.run(["copy"]);
    console.log("-> Copy process completed");
});

grunt.registerTask("prepare-upload", ["upload"]);