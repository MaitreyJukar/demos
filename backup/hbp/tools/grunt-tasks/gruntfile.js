var grunt = require('grunt');

// Grunt setup.
grunt.initConfig({});
grunt.file.defaultEncoding = 'utf8';
grunt.file.preserveBOM = false;

var FILESPATH = "./../../content/spreadsheet-modeling/kepler-tasks/**/3*.json";
var TARGET_EXTENSION = "txt";
var _DEBUG = false;

var myLog = function() {
    if (!_DEBUG) {
        return;
    }
    console.log.apply(null, arguments);
};

/**
 * Gets complete transcript string from give json file path.
 * @param {string} filePath
 */
var getTransStringFromJSONPath = function(filePath) {
    myLog(">> Reading & Parsing file: " + filePath);
    var json = grunt.file.readJSON(filePath);
    var mp3 = json.manifest.items.item.mp3data.mp3;
    var transcriptArray = [];
    var oldStr = "";

    for (var j = 0; j < mp3.length; j++) {
        var steps = mp3[j].steps;
        for (var k = 0; k < steps.length; k++) {
            var newStr = steps[k]["#cdata-section"].trim();
            var lastStr = (steps.length - 1 === k && mp3.length - 1 === j) ? "" : " + ";
            if (oldStr !== newStr) {
                myLog(">>> " + newStr + lastStr);
                transcriptArray.push(newStr);
                oldStr = newStr;
            }
        }
    }

    return transcriptArray.join(" ");
};

/**
 * Writes json content's transcript data to text file in same folder.
 * @param {string} filePath File's full path.
 */
var writeTranscriptFileFromJSONURL = function(filePath) {
    var targetFilePathRegEx = /([^]*)(\.)([^]*)/g;
    var transStr = getTransStringFromJSONPath(filePath);
    var targetPath = (filePath.replace(targetFilePathRegEx, "$1$2")) + TARGET_EXTENSION;

    console.log(">> Generating file: " + targetPath);
    grunt.file.write(targetPath, transStr);
};

/**
 * Default grunt task to Generates Transcript files.
 */
grunt.registerTask('transcript', 'Generates Transcript files from given file path', function(path) {
    console.log('> Initializing Transcript generation');
    if (path !== void 0) {
        console.log("> Generating 1 file.");
        writeTranscriptFileFromJSONURL(path);
    } else {
        var jsonFiles = grunt.file.expand(FILESPATH);
        console.log("> Generating " + jsonFiles.length + " files.");
        for (var i = 0; i < jsonFiles.length; i++) {
            writeTranscriptFileFromJSONURL(jsonFiles[i]);
        }
    }
    console.log('> Transcript generation completed.');
});

grunt.registerTask('name-changer', function() {
    var fs = require('fs'),
        path = require('path'),
        options,
        reference,
        filetype,
        lettercase,
        spaces,
        prepend,
        append,
        filename,
        extension,
        remove,
        successful = 0,
        failed = 0,
        filter = ["isFile", "isDirectory"];

    options = this.options({
        reference: ['./../../dist/', './../../content/', './../../kepler/', './../../scratchpad/', './../../source/'],
        filetype: ['**/*'],
        lettercase: 'lowercase',
        spaces: null,
        remove: null,
        prepend: null,
        append: null
    });

    String.prototype.toCapitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    String.prototype.toTitleCase = function() {
        return this.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    };

    options.reference.forEach(function(directory) {
        filter.forEach(function(currFilter) {
            grunt.file.expand({
                filter: currFilter,
                cwd: directory
            }, options.filetype).forEach(function(file) {
                try {
                    successful++;

                    filename = file;

                    if (options.spaces != null) {
                        filename = file.replace(/\-/g, options.spaces).replace(/\_/g, options.spaces).replace(/\ /g, options.spaces);
                    }

                    extension = path.extname(filename);
                    filename = filename.replace(extension, '');

                    if (options.remove !== null) {
                        filename = filename.replace(options.remove, '')
                    }

                    if (options.lettercase === 'uppercase') {
                        filename = filename.toUpperCase();
                    } else if (options.lettercase === 'lowercase') {
                        filename = filename.toLowerCase();
                    } else if (options.lettercase === 'capitalize') {
                        filename = filename.toCapitalize();
                    } else if (options.lettercase === 'titlecase') {
                        filename = filename.toTitleCase();
                    }

                    //prepend
                    if (options.prepend !== null) {
                        filename = options.prepend + options.spaces + filename;
                    }
                    //append
                    if (options.append !== null) {
                        filename = filename + options.append + extension;
                    }


                    grunt.log.error(directory + filename);
                    // update file name
                    fs.rename(directory + file, directory + filename + extension);

                } catch (e) {
                    failed++;
                    grunt.log.error('File "' + file + '" failed to rename.');
                    grunt.fail.warn(e);
                }
            });
        });
    });

});

//grunt.registerTask("default", ["rename"]);