module.exports = function (grunt) {

    var _BASE_PATH = "../",
        _PARAM_SEPARATOR = "#",
        _BUILD_PARAMS_LIST = "",
        _DEFAULT_STEPS = [1, 2],
        _DEFAULT_THEMES = [1, 2],
        _DEFAULT_FILE_TYPES = ["css", "js", "json"], // templates are included in js 
        _DEFAULT_LANG = "en",
        _THEME_STRING = "theme",
        _THEMES = [],
        _LANGUAGES,
        _STEPS,
        _FILE_TYPES,
        _IS_NEXT_STEP_LOAD = "isNextStepLoad",
        pathData = {},
        FOLDERS = {
            CSS: 'CSS',
            DATA: 'DATA',
            SCRIPT: 'SCRIPT',
            LANGUAGE: 'LANGUAGE',
            LANG_JSON: 'LANG_JSON',
            IMAGE: 'IMAGE',
            AUDIO: 'AUDIO',
            VIDEO: 'VIDEO',
            TEMPLATE: 'TEMPLATE',
            JQUERY_JS: 'JQUERY_JS',
            HIGHCHARTS: 'HIGHCHARTS',
            THREE_JS: 'THREE_JS',
            PAPER_JS: 'PAPER_JS',
            COMMON_CSS: 'COMMON_CSS',
            COMMON_DATA: 'COMMON_DATA',
            COMMON_LANG_JSON: 'COMMON_LANG_JSON',
            COMMON_SCRIPT: 'COMMON_SCRIPT',
            COMMON_TEMPLATE: 'COMMON_TEMPLATE',
            COMMON_IMAGE: 'COMMON_IMAGE',
            COMMON_INTERACTIVE_CSS: 'COMMON_INTERACTIVE_CSS',
            COMMON_VENDOR_CSS: 'COMMON_VENDOR_CSS',
            COMMON_VENDOR: 'COMMON_VENDOR',
            TTS: 'TTS',
            FONTS: 'FONTS',
            COMMON_SCRIPT_FONTS: 'COMMON_SCRIPT_FONTS',
            JQUERY_CSS: 'JQUERY_CSS',
            PLUGIN: 'PLUGIN'
        },
        configJson = null,
        configFilePath = null,
        mainTaskList = null,
        taskCounter = 0,
        taskCounterMax = null,
        combineCommonFiles = true;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cssFiles: {
            step1: null,
            step2: null,
            fileNames: {
                step1: null,
                step2: null
            }
        },
        cssCommonFiles: {
            group1: null,
            group2: null,
            interactive: {},
            fileNames: {
                group1: null,
                group2: null,
                interactive: {}
            }
        },
        jsFiles: {
            step1: null,
            step2: null,
            fileNames: {
                step1: null,
                step2: null
            }
        },
        jsCommonFiles: {
            group1: null,
            group2: null,
            group3: null,
            group4: null,
            components: {},
            interactive: {},
            fileNames: {
                group1: null,
                group2: null,
                group3: null,
                group4: null,
                components: {},
                interactive: {}
            }
        },
        uglify: {
            options: {
                compress: {
                    drop_console: true
                },
                sourceMap: false
            },
            my_target: {
                files: {
                }
            },
            my_target1: {
                files: {
                }
            },
            // A new grunt task added to combine threejs vendor files and fonts used in it
            "threejs": {
                "files": {                    
                }
            }
        },
        "json-minify": {
            build: {
                files: []
            }
        },
        clean: {
            src: ""
        },
        cssmin: {
            my_target: {
                files: {}
            },
            my_target1: {
                files: {
                }
            }
        },
        "batch-iteration": {
            counter: 0,
            appName: []
        }
    });
    /*
    * 
    */
    var _loadTasks = function () {
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-cssmin');
        grunt.loadNpmTasks('grunt-contrib-clean');
    };

    _loadTasks();

    /*
    * Get array of complete filePaths for array of files objects passed
    * @param {arrFileParams} array : Array of file objects from config json
    * @param {fileType} string     : file type 
    * @param {pathHolder} array    : array to hold complete filepaths for files. 
    */
    var _getPathArray = function (arrFileParams, fileType, themeType, pathHolder) {
        if (typeof arrFileParams === "undefined") {
            return;
        }
        var counter = 0,
            filePath = "",
            fileLength = arrFileParams.length;
        for (; counter < fileLength; counter++) {
            filePath = _getFilePath(arrFileParams[counter], fileType, themeType);
            pathHolder.push(filePath + arrFileParams[counter]["url"]);

        }
    }

    /*
     *   Generate Global Path Data object from Path.json used to find path of file     
    */
    var _generatePathData = function () {
        var _pathDataFilePath = "path.json";


        if (!grunt.file.exists(_pathDataFilePath)) {
            grunt.log.error("file " + _pathDataFilePath + " not found");
            return false;
        }
        var _pathData = grunt.file.readJSON(_pathDataFilePath);

        pathData._commonPath = _pathData.common;
        pathData._interactivitiesPath = _pathData.interactivities;
        pathData._cssPath = _pathData.css;
        pathData._dataPath = _pathData.data;
        pathData._scriptPath = _pathData.js;
        pathData._jqueryPath = _pathData.jquery;
        pathData._paperJsPath = _pathData.paperJs;
        pathData._threeJsPath = _pathData.threeJs;
        pathData._highchartsPath = _pathData.highcharts;
        pathData._imagePath = _pathData.image;
        pathData._videoPath = _pathData.video;
        pathData._audioPath = _pathData.audio;
        pathData._templatePath = _pathData.templates;
        pathData._vendorPath = _pathData.vendor;
        pathData._pluginPath = _pathData.plugin;
        pathData._ttsPath = _pathData.tts;
        pathData._fontsPath = _pathData.fonts;
        pathData._languages = _pathData.languages;
        pathData._themes = _pathData.theme;
        pathData._outputDir = _pathData.outputDir;
        pathData._basePath = _BASE_PATH;
        pathData._langPath = _pathData.language;
        pathData._interactiveSpecific = _pathData.interactiveSpecific;
        pathData._components = _pathData.components;
    }

    /*
    * Generates list of all interactives inside the basepath
    * return {Array} Strings containing folder names
    */
    var _generateEntireBatch = function () {
        var fileListSrc = [],
            interactiveNames, interactivesCount,
            dataFilePath = "data.json";

        if (!grunt.file.exists(dataFilePath)) {
            grunt.log.error("file " + dataFilePath + " not found");
            return false;
        }
        var data = grunt.file.readJSON(dataFilePath);
        var batchExclusions = data.batchExclusions;
        var batchExclusionsLength = batchExclusions.length;

        fileListSrc.push(_BASE_PATH + '*');
        for (var i = 0; i < batchExclusionsLength; i++) {
            fileListSrc.push('!' + _BASE_PATH + batchExclusions[i]);
        }
        interactiveNames = grunt.file.expand({ filter: 'isDirectory' }, fileListSrc);
        interactivesCount = interactiveNames.length;
        for (var j = 0; j < interactivesCount; j++) {
            interactiveNames[j] = interactiveNames[j].replace(_BASE_PATH, '');
        }
        return interactiveNames;
    }

    /*
    * Generates the union or intersection of two arrays using the property passed
    * @method _combineArrays
    * @param arr1 {Array} Array of objects to combine
    * @param arr2 {Array} Array of objects to combine
    * @param prop1 {String} Property of objects to be compared
    * @param type {String} Type of operation to be performed on the 2 arrays
    * @return arr3 {Array} Union of arr1 and arr2
    */
    var _combineArrays = function (arr1, arr2, prop1, type) {
        var arr1Length = arr1.length,
            arr2Length = arr2.length,
            arr3 = arr1.slice(),
            arr4 = [],
            same;
        for (var i = 0; i < arr2Length; i++) {
            same = false;
            for (var j = 0; j < arr1Length; j++) {
                if (arr1[j][prop1] === arr2[i][prop1]) {
                    same = true;
                    arr4.push(arr1[j]);
                    break;
                }
            }
            if (!same) {
                arr3.push(arr2[i]);
            }
        }
        switch (type) {

            case 'union':
                return arr3;

            case 'intersection':
                return arr4;
        }
    }


    var _subtractArrays = function (arr1, arr2, prop1) {
        var arr1 = arr1.slice(),
            arr2Length = arr2.length;

        for (var i = 0; i < arr2Length; i++) {
            for (var j = 0; j < arr1.length; j++) {
                if (arr1[j][prop1] === arr2[i][prop1]) {
                    arr1.splice(j, 1);
                    break;
                }
            }
        }
        return arr1;
    }

    /*
    * Generate Config file path for current app.
    * param {appName}  String : Name of app. 
    * returns file path.
    */
    var _getConfigFilePath = function (appName) {
        grunt.log.writeln("appName:" + appName);
        var fileType, fileName;
        if (appName === "common") {
            fileType = FOLDERS.COMMON_DATA;
            fileName = "player-config.json";
        }
        else {
            fileType = FOLDERS.DATA;
            fileName = "interactivity-config.json";
        }
        var filePath = _getFilePath({ 'url': fileName }, fileType);
        filePath += fileName;
        return filePath;
    }

    /*
    * Set Global current app.
    * param {appName} String : Name of app. 
    * returns file path.
    */
    var _setAppName = function (appName) {
        pathData._appName = appName;
    }

    var _isVendor = function (filePath) {
        // Specific checks added as we need to combine below mentioned vendor files
        if (!(filePath.indexOf("rgb") === -1 && filePath.indexOf("stackblur") === -1 && filePath.indexOf("threejs") === -1)) {
            return false;
        }
        return ((filePath.indexOf("vendor") !== -1) || (filePath.indexOf("custom-slider.js") !== -1));
    }
    /*
    * Convert string params with key-value pair to object
    * param {params}  String
    * returns {Object}  key value pair of parameters
    */
    var parseParams = function (params) {
        var paramList = params.split(_PARAM_SEPARATOR),
            paramLength = paramList.length,
            paramHolder = {},
            counter = 0,
            curData = [];
        for (; counter < paramLength; counter++) {
            curData = paramList[counter].split('=');

            if (curData[0] === "fileTypes" || curData[0] === "lang") {
                paramHolder[curData[0]] = (curData[1].indexOf(',') !== -1) ? curData[1].split(',') : [curData[1]];
            }
            else { /** Params = Theme or Step **/
                if (curData[1].indexOf(',') === -1) {
                    paramHolder[curData[0]] = [parseInt(curData[1], 10)];
                }
                else {
                    var _arrData = curData[1].split(','),
                        dataLength = _arrData.length, counter = 0;
                    for (; counter < dataLength; counter++) {
                        _arrData[counter] = parseInt(_arrData[counter], 10);
                    }
                    paramHolder[curData[0]] = _arrData;
                }
            }
        }
        return paramHolder;
    }


    /*
    * update global language
    */

    var _updateLanguage = function (lang) {
        pathData._language = pathData._languages[lang];
    }

    var processNextTask = function (scope) {
        var done = scope.async();
        if (taskCounter < taskCounterMax) {
            setTimeout(function () {
                grunt.task.run([mainTaskList[taskCounter]]);
                done();
            }, 1000);
        }
        else {
            console.log('Minification successfully completed');
        }
    }


    var returnConfigFilePath = function (folderName) {
        var lengthTrim = folderName === 'common' ? 2 : 0,
            tempPathHolder = configFilePath.split(folderName + pathData._interactivitiesPath);

        return tempPathHolder[0] + folderName + pathData._interactivitiesPath + pathData._outputDir + tempPathHolder[1].substr(0, tempPathHolder[1].length - lengthTrim);
    }

    var getOverviewCSSFiles = function () {
        var fileListSrc = [],
            cssFiles = null,
            dataFilePath = "data.json",
            data = grunt.file.readJSON(dataFilePath),
            batchExclusions = data.batchExclusions,
            batchExclusionsLength = batchExclusions.length;

        fileListSrc.push(_BASE_PATH + '**/overview.css');
        for (var i = 0; i < batchExclusionsLength; i++) {
            fileListSrc.push('!' + _BASE_PATH + batchExclusions[i]);
        }
        cssFiles = grunt.file.expand(fileListSrc);        
        return cssFiles;
    }

    /*
    * Get file paths for particular file
    * @param {Object} fileData   : Object holding info of current file : url, basePath
    * @param fileType   {String} : File type
    * @param themeType  {Number} : themeType  ( 1 or 2 )
    * @return {String} : complete path of the file.
    */
    var _getFilePath = function (fileData, fileType, themeType) {
        var startPath = pathData._appName + '/',
            basePath = pathData._basePath,
            option = fileData["basePath"];
        startPath = (pathData._basePath !== "") ? pathData._basePath + pathData._interactivitiesPath + startPath : startPath;
        if (typeof option === "undefined") {
            switch (fileType) {
                case "css": {
                    option = FOLDERS.CSS;
                    break;
                }
                case "js": {
                    option = FOLDERS.SCRIPT;
                    break;
                }
                case "templates": {
                    option = FOLDERS.TEMPLATE;
                    break;
                }
                case "json": {
                    option = (pathData._appName === "common") ? FOLDERS.COMMON_DATA : FOLDERS.DATA;
                    break;
                }
                default: {
                    option = fileType;
                }

            }
        }
        switch (option) {
            case FOLDERS.CSS:
                return startPath + pathData._cssPath;
                break;

            case FOLDERS.DATA:
                return startPath + pathData._dataPath;
                break;

            case FOLDERS.LANG_JSON:
                var jsonPath = startPath + pathData._language + pathData._dataPath;
                return jsonPath;
                break;

            case FOLDERS.SCRIPT:
                return startPath + pathData._scriptPath;
                break;

            case FOLDERS.IMAGE:
                return startPath + pathData._imagePath;
                break;

            case FOLDERS.AUDIO:
                return startPath + pathData._audioPath;
                break;

            case FOLDERS.VIDEO:
                return startPath + pathData._videoPath;
                break;

            case FOLDERS.TEMPLATE:
                return startPath + pathData._templatePath;
                break;

            case FOLDERS.JQUERY_JS:
                return basePath + pathData._commonPath + pathData._scriptPath + pathData._vendorPath
                            + pathData._jqueryPath + pathData._scriptPath;
                break;

            case FOLDERS.THREE_JS:
                return basePath + pathData._commonPath + pathData._scriptPath + pathData._vendorPath
                            + pathData._threeJsPath;
                break;

            case FOLDERS.PAPER_JS:
                return basePath + pathData._commonPath + pathData._scriptPath + pathData._vendorPath
                            + pathData._paperJsPath;
                break;

            case FOLDERS.COMMON_CSS:
                return basePath + pathData._commonPath + pathData._cssPath + (pathData._themes[pathData._theme - 1]);
                break;

            case FOLDERS.COMMON_DATA:
                return basePath + pathData._commonPath + pathData._dataPath;
                break;

            case FOLDERS.COMMON_LANG_JSON:
                var fullPath = basePath + pathData._commonPath + pathData._language + pathData._dataPath;
                return fullPath;
                break;

            case FOLDERS.COMMON_SCRIPT:
                return basePath + pathData._commonPath + pathData._scriptPath;
                break;

            case FOLDERS.COMMON_TEMPLATE:
                return basePath + pathData._commonPath + pathData._templatePath;
                break;

            case FOLDERS.COMMON_IMAGE:
                return basePath + pathData._commonPath + pathData._imagePath;
                break;

            case FOLDERS.TTS:
                return basePath + pathData._commonPath + pathData._scriptPath + pathData._vendorPath + pathData._ttsPath;
                break;
            case FOLDERS.FONTS:
                return basePath + pathData._commonPath + pathData._fontsPath;
                break;
            case FOLDERS.HIGHCHARTS:
                return basePath + pathData._commonPath + pathData._scriptPath + pathData._vendorPath
                            + pathData._highchartsPath;
                break;
            case FOLDERS.JQUERY_CSS:
                return basePath + pathData._commonPath + pathData._scriptPath + pathData._vendorPath
                            + pathData._jqueryPath + pathData._cssPath;
                break;
            case FOLDERS.PLUGIN:
                return basePath + pathData._commonPath + pathData._scriptPath + pathData._pluginPath;
                break;

            case FOLDERS.COMMON_INTERACTIVE_CSS:
                return basePath + pathData._commonPath + pathData._cssPath + pathData._interactiveSpecific;
                break;

            case FOLDERS.COMMON_VENDOR:
                return basePath + pathData._commonPath + pathData._scriptPath + pathData._vendorPath
                break;

            case FOLDERS.COMMON_VENDOR_CSS:
                return basePath + pathData._commonPath + pathData._cssPath + pathData._vendorPath
                break;

            default:
                return '';
        }
    }

    /*
   * Grunt task to minify preloader files.
   * @param {gruntData}  string : parameters for fileTypes,step,lang or theme
   */
    grunt.registerTask('build-interactive-engine', function (mapParam) {
        var dataFilePath = "data.json";

        if (!grunt.file.exists(dataFilePath)) {
            grunt.log.error("file " + dataFilePath + " not found");
            return false;
        }

        var data = grunt.file.readJSON(dataFilePath);

        var basepath = pathData._basePath,
            resourceBasePath = pathData._basePath + pathData._commonPath + pathData._scriptPath,
            jsMinifiedFileName = 'interactive-engine-initialize.min.js',
            locationOfMinFile = pathData._basePath + pathData._commonPath + pathData._outputDir + pathData._scriptPath,
            jsMinifiedFilePath = locationOfMinFile + jsMinifiedFileName,
            jsFiles = {},
            jsFilesToMinify = [],
            jsFileCount = data.preloader.js.length;

        for (var i = 0; i < jsFileCount; i++) {
            if (data.preloader.js[i].basePath === 'resourceBasePath') {
                jsFilesToMinify.push(resourceBasePath + data.preloader.js[i].filePath);
            }
            else if (data.preloader.js[i].basePath === 'basepath') {
                jsFilesToMinify.push(basepath + data.preloader.js[i].filePath);
            }
        }
        jsFilesToMinify.push(returnConfigFilePath('common'));
        if (combineCommonFiles) {
            jsFilesToMinify.push(locationOfMinFile + 'common.min.js');
        }

        jsFiles[jsMinifiedFilePath] = jsFilesToMinify;

        if (typeof mapParam !== "undefined") {
            if (mapParam === 'nomap') {
                grunt.config('uglify.options.sourceMap', false);
            }
        }
        grunt.config.set('uglify.my_target.files', jsFiles);

        try {
            grunt.task.run(["uglify:my_target"]);
        }
        catch (err1) {
            console.log(err1);
        }

        var cssMinifiedFileName = 'preloader.min.css',
            cssMinifiedFilePath = pathData._basePath + pathData._commonPath + pathData._outputDir + pathData._cssPath + cssMinifiedFileName,
            cssFiles = {},
            cssFileCount = data.preloader.css.length,
            cssFilesToMinify = [];

        for (var i = 0; i < cssFileCount; i++) {
            cssFilesToMinify.push(basepath + data.preloader.css[i].filePath);
        }

        cssFiles[cssMinifiedFilePath] = cssFilesToMinify;
        grunt.config.set('cssmin.my_target.files', cssFiles);
        grunt.task.run(["cssmin:my_target"]);
    });

    /*
   * Grunt task to run grunt on common files.
   * @param {gruntData}  string : parameters for fileTypes,step,lang or theme
   */
    grunt.registerTask('build-common', function (gruntData) {
        var params = {},
            appName = "common";
        if (typeof gruntData !== "undefined") {
            params = parseParams(gruntData);
        }

        /* Set global values for steps, language, filetypes and themes from the parameter passed */
        _STEPS = (typeof params["step"] !== "undefined") ? params["step"] : _DEFAULT_STEPS;
        _LANGUAGES = (typeof params["lang"] !== "undefined") ? params["lang"] : [_DEFAULT_LANG];
        _FILE_TYPES = (typeof params["fileTypes"] !== "undefined") ? params["fileTypes"] : _DEFAULT_FILE_TYPES;
        _THEMES = (typeof params["themes"] !== "undefined") ? params["themes"] : _DEFAULT_THEMES;

        /* Generate Path Data from Path.json file and set common as App Name*/
        //_generatePathData();
        _setAppName(appName);

        /* Check Config file path  */
        configFilePath = _getConfigFilePath(appName);
        if (!grunt.file.exists(configFilePath)) {
            grunt.log.error("file " + configFilePath + " not found");
            return true;//return false to abort the execution
        }

        /* Read Config file */
        configJson = grunt.file.readJSON(configFilePath);
        pathData._theme = _THEMES[0];

        _updateLanguage(_LANGUAGES[0]);
        var taskList = [];
        pushCommonTasks(taskList);
        taskList.push("write_playerConfigJson_to_file");
        taskList.push("combine-three-js"); // A task added for minification of threejs specific files
        grunt.task.run(taskList);
    })

    /*
    * Grunt task to run grunt on common files.
    * @param {String} interactivityName : interactivity name 
    * @param {String} gruntData : parameters for fileTypes,step,lang or theme
    */
    grunt.registerTask('build-interactivity', function (interactivityName, gruntData) {
        var params = {},
            batchIterationCounter = grunt.config("batch-iteration.counter"),
            batchIterationAppName = grunt.config("batch-iteration.appName")[batchIterationCounter],
            appName = (typeof interactivityName !== "undefined") ? interactivityName : batchIterationAppName;

        if (typeof gruntData !== "undefined") {
            _BUILD_PARAMS_LIST = gruntData;
            params = parseParams(gruntData);
        }
        else if (_BUILD_PARAMS_LIST !== "") {
            params = parseParams(_BUILD_PARAMS_LIST);
        }

        /* Generate Path Data from Path.json file and set common as App Name*/
        //_generatePathData();
        _setAppName(appName);


        /* Check Config file path  */
        configFilePath = _getConfigFilePath(appName);
        if (!grunt.file.exists(configFilePath)) {
            grunt.log.error("file " + configFilePath + " not found");
            return true;//return false to abort the execution
        }

        /* Read Config file  */
        configJson = grunt.file.readJSON(configFilePath);

        /* Set global values for steps, language, filetypes and themes from the parameter passed */
        _STEPS = (typeof params["step"] !== "undefined") ? params["step"] : _DEFAULT_STEPS;
        _LANGUAGES = (typeof params["lang"] !== "undefined") ? params["lang"] : [_DEFAULT_LANG];
        _FILE_TYPES = (typeof params["fileTypes"] !== "undefined") ? params["fileTypes"] : _DEFAULT_FILE_TYPES;
        _THEMES = [configJson["config"]["themeType"]];
        pathData._theme = _THEMES[0];
        _updateLanguage(_LANGUAGES[0]);
        taskCounter++;
        var taskList = [];
        pushTasks(taskList);
        taskList.push("write_configJson_to_file");
        grunt.task.run(taskList);
        grunt.config("batch-iteration.counter", (batchIterationCounter + 1));
    })

    /*
    * Push task for filetypes passed when grunt is called.
    * @param {array} taskHolder : Array in which tasks are pushed to queue them.
    */
    var pushTasks = function (taskHolder) {
        if (_FILE_TYPES.indexOf("css") !== -1) {
            taskHolder.push("build_css");
        }
        if (_FILE_TYPES.indexOf("json") !== -1) {
            taskHolder.push("minify_json");
        }
        if (_FILE_TYPES.indexOf("js") !== -1) {
            taskHolder.push("build_js");
        }
        taskHolder.push("reset");
    }

    /*
    * Push task for common folder for filetypes passed when grunt is called.
    * @param {array} taskHolder : Array in which tasks are pushed to queue them.
    */
    var pushCommonTasks = function (taskHolder) {
        if (_FILE_TYPES.indexOf("css") !== -1) {
            taskHolder.push("build_common_css");
        }
        if (_FILE_TYPES.indexOf("json") !== -1) {
            taskHolder.push("minify_json");
        }
        if (_FILE_TYPES.indexOf("js") !== -1) {
            taskHolder.push("build_common_js");
        }
        taskHolder.push("reset-common");
    }

    /*
    * Task to change theme type is called in build-common task as task is performed for more than 1 theme type.
    */
    grunt.registerTask("change-theme", function () {
        pathData._theme = _THEMES[1];
    });

    /*
    * Task to perform grunt process on entire batch of interactivities
    * param {batchNo} Number  : Batch No.
    * param {appNames} String : interactivity names separated by comma
    * param {params} String   : grunt parameters for step,theme,language, fileTypes separated by #. Multiple values of specific parameter is separated by comma.
    */
    grunt.registerTask('build-MathInt-common', function (appNames, mapParam) {

        _generatePathData();
        var taskList = [];
        taskList.push("build-common");

        taskList.push("build-interactive-engine");
        if (combineCommonFiles) {
            taskList.push("delete-common-combined-minified-file");
        }
        taskList.push("delete-player-config");
        grunt.task.run(taskList);
    });

    /*
    * Task to perform grunt process on entire batch of interactivities
    * param {batchNo} Number  : Batch No.
    * param {appNames} String : interactivity names separated by comma
    */
    grunt.registerTask('build-MathInt', function (appNames, mapParam) {

        _generatePathData();

        var taskList = [],
            batchList = _generateEntireBatch(),
            curInteractivity, batchLength, tempBatchList;

        if (typeof appNames === "undefined") {
            grunt.log.error("No Interactivity specified to build.");
            return false;
        }
        else if (appNames !== "all") {
            tempBatchList = appNames.split(",");
            for (var i = 0; i < tempBatchList.length; i++) {
                if (batchList.indexOf(tempBatchList[i]) <= -1) {
                    grunt.log.error("Interactivity " + tempBatchList[i] + " not found.");
                    tempBatchList.splice(i, 1);
                }
            }
            if (tempBatchList.length > 0) {
                batchList = tempBatchList;
                batchLength = batchList.length;
            }
            else {
                grunt.log.error("No Interactivity to build.");
            }
        }
        else if (appNames === "all") {
            batchLength = batchList.length;
        }

        if (typeof mapParam !== "undefined") {
            //_BUILD_PARAMS_LIST = params;
            if (mapParam === 'nomap') {
                grunt.config('uglify.options.sourceMap', false);
            }
        }

        for (var counter = 0; counter < batchLength; counter++) {

            var pathToDelete = _BASE_PATH + batchList[counter] + pathData._interactivitiesPath + pathData._outputDir;
            pathToDelete = pathToDelete.substr(0, pathToDelete.length - 1);
            grunt.file.delete(pathToDelete, { force: true });

            curInteractivity = batchList[counter];

            taskList.push("build-interactivity");
        }
        mainTaskList = taskList;
        taskCounterMax = taskList.length;
        grunt.config('batch-iteration.appName', batchList);
        grunt.task.run(taskList);

    });

    /*
    * Task to reset global variables for next batch process.
    */
    grunt.registerTask("reset", function () {
        var stepsCounter = 0,
            stepsLength = _STEPS.length;
        for (; stepsCounter < stepsLength; stepsCounter++) {
            grunt.config("cssFiles.step" + (stepsCounter + 1), null);
            grunt.config("cssFiles.fileNames.step" + (stepsCounter + 1), null);
            grunt.config("jsFiles.step" + (stepsCounter + 1), null);
            grunt.config("jsFiles.fileNames.step" + (stepsCounter + 1), null);
        }
    });

    /*
    * Task to reset global variables for next batch process.
    */
    grunt.registerTask("reset-common", function () {
        var cssFiles = {
            group1: null,
            group2: null,
            interactive: {},
            fileNames: {
                group1: null,
                group2: null,
                interactive: {}
            }
        },
        jsFiles = {
            group1: null,
            group2: null,
            group3: null,
            group4: null,
            components: {},
            interactive: {},
            fileNames: {
                group1: null,
                group2: null,
                group3: null,
                group4: null,
                components: {},
                interactive: {}
            }
        };
        grunt.config("cssCommonFiles", cssFiles);
        grunt.config("jsCommonFiles", jsFiles);
    });

    /*
   * Task to minify all json files referenced in interactive folder.
   */
    grunt.registerTask("minify_json", function () {
        var jsonFile,
            jsonPath,
            playerConfigFilePath,
            distJsonPath,
            newJsonFilePath,
            interactiveFolderPath,
            tempPathHolder,
			qaImagesJson;

        interactiveFolderPath = pathData._appName + pathData._interactivitiesPath;
        jsonPath = _BASE_PATH + interactiveFolderPath + '**/*.json';
        playerConfigFilePath = '!' + _BASE_PATH + "common" + pathData._interactivitiesPath + pathData._dataPath + 'player-config.json';
        distJsonPath = '!' + _BASE_PATH + interactiveFolderPath + pathData._outputDir + '**/*.json';
        qaImagesJson = '!' + _BASE_PATH + interactiveFolderPath + 'qa-images/' + '**/*.json';

        var minFiles = grunt.file.expand({ filter: 'isFile' }, [jsonPath, playerConfigFilePath, distJsonPath, qaImagesJson]);

        for (var i = 0, count = minFiles.length; i < count; i++) {
            tempPathHolder = minFiles[i].split(interactiveFolderPath);
            newJsonFilePath = tempPathHolder[0] + interactiveFolderPath + pathData._outputDir + tempPathHolder[1];
            jsonFile = grunt.file.readJSON(minFiles[i]);
            grunt.file.write(newJsonFilePath, JSON.stringify(jsonFile));
        }
    });

    /*
    * Get step no in which the file is preloaded.
    * @param {file} Object : single file object as mentioned in config file.
    * @return {Number} Step no.
    */
    var getStepNoOfFile = function (file) {
        if (pathData._theme === 1) {
            return 1;
        }
        else {
            if ((pathData._appName === "common" && typeof file[_IS_NEXT_STEP_LOAD] === "undefined") || (pathData._appName !== "common" && file[_IS_NEXT_STEP_LOAD] === false)) {
                return 1;
            }
            else {
                return 2;
            }
        }

    }

    /*
    * Main Task to process css files. Creates array for different steps and calls "processCSS" task
    */
    grunt.registerTask("build_css", function () {
        var cssFiles = {},
            cssMinFiles = {},
            fileNames = {},
            counter = 0,
            stepsCounter = 0,
            themeCounter = 0,
            stepsLength = _STEPS.length,
            themeLength = _THEMES.length,
            destFileName,
            filesToGrunt = {},
            fileType,
            curStep,
            cssFilesInConfig,
            cssFilesLength,
            currentFileStep,
            curFile,
            curFilePath,
            curMinFilePath,
            concatPath,
            concatFileName;


        fileType = FOLDERS.CSS;
        cssFilesInConfig = configJson.resources.css;

        //Remove overview css entry from config
        for (var currentEntry = 0; currentEntry < cssFilesInConfig.length; currentEntry++) {
            if (cssFilesInConfig[currentEntry].url.indexOf('overview.css') > -1) {
                cssFilesInConfig.splice(currentEntry, 1);
                break;
            }
        }

        concatPath = pathData._basePath + pathData._appName + pathData._interactivitiesPath + pathData._outputDir + "css" + pathData._interactivitiesPath;

        if (cssFilesInConfig) {
            cssFilesLength = cssFilesInConfig.length;
            if (cssFilesLength !== 0) {
                for (; stepsCounter < stepsLength; stepsCounter++) {
                    cssFiles[_STEPS[stepsCounter]] = [];
                    cssMinFiles[_STEPS[stepsCounter]] = [];
                    fileNames[_STEPS[stepsCounter]] = [];
                }

                for (; counter < cssFilesLength ; counter++) {
                    curFile = cssFilesInConfig[counter];
                    currentFileStep = getStepNoOfFile(curFile);
                    curFilePath = (_getFilePath(curFile, fileType)) + curFile["url"];
                    // curMinFilePath = curFilePath.slice(0, curFilePath.length - 4) + ".min.css";

                    /** Check for vendor CSS files */
                    if (_isVendor(curFilePath)) {
                        continue;
                    }

                    if (typeof cssFiles[currentFileStep] !== "undefined") {
                        cssFiles[currentFileStep].push(curFilePath);
                        // cssMinFiles[currentFileStep].push(curMinFilePath);
                        fileNames[currentFileStep].push(curFile);
                    }
                }
                for (stepsCounter = 0; stepsCounter < stepsLength; stepsCounter++) {
                    curStep = _STEPS[stepsCounter];
                    concatFileName = pathData._appName + ".min.css";

                    if (cssFiles[_STEPS[stepsCounter]].length !== 0) {
                        destFileName = concatPath + concatFileName;
                        filesToGrunt[destFileName] = cssFiles[curStep];

                        if (grunt.file.exists(destFileName) === true) {
                            grunt.file.delete(destFileName, { force: true });
                        }
                        grunt.config("cssFiles.step" + curStep, cssFiles[curStep]);
                        grunt.config("cssFiles.fileNames.step" + curStep, fileNames[curStep]);
                    }
                }

                grunt.config.set('cssmin.my_target.files', filesToGrunt);
                grunt.task.run(["cssmin:my_target", "updateConfig_css"]);
            }
        }
    });

    /*
    * Update config json file with combined css. 
    */
    grunt.registerTask("updateConfig_css", function () {
        var cssConfigJson = configJson.resources.css,
            curStep, cssJsonToDel, configCounter, stepsCounter, stepsLength = _STEPS.length;

        //Remove overview css entry from config
        for (var currentEntry = 0; currentEntry < cssConfigJson.length; currentEntry++) {
            if (cssConfigJson[currentEntry].url.indexOf('overview.css') > -1) {
                cssConfigJson.splice(currentEntry, 1);
                break;
            }
        }

        for (stepsCounter = 0; stepsCounter < stepsLength; stepsCounter++) {
            curStep = _STEPS[stepsCounter];
            cssJsonToDel = grunt.config("cssFiles.fileNames.step" + curStep);
            var curMinCSSFile = {};
            curMinCSSFile.url = pathData._appName + ".min.css";
            curMinCSSFile.basePath = (pathData._appName === "common") ? FOLDERS.COMMON_CSS : FOLDERS.CSS

            if (pathData._theme !== 1) {
                if (pathData._appName === "common" && curStep !== 1) {
                    curMinCSSFile[_IS_NEXT_STEP_LOAD] = true
                }
                else if (pathData._appName !== "common" && curStep !== 2) {
                    curMinCSSFile[_IS_NEXT_STEP_LOAD] = false
                }
            }
            if (cssJsonToDel !== null && cssJsonToDel.length !== 0) {
                for (configCounter = 0; configCounter < cssConfigJson.length; configCounter++) { // length is calculated each time as the length of array gets changed.                    
                    if (cssJsonToDel.length === 0) {
                        break;
                    }
                    else if (cssConfigJson[configCounter]["url"] === cssJsonToDel[0]["url"]) {
                        cssJsonToDel.splice(0, 1);
                        cssConfigJson.splice(configCounter, 1);
                        --configCounter;
                    }
                }
                if (cssJsonToDel.length !== 0) {
                    grunt.fail.warn("=== ERROR in updateConfig_css task :: === All files not deleted :: ", cssJsonToDel);
                }
                cssConfigJson.push(curMinCSSFile);//push combined file which is newly created.
            }
        }
    });

    /*
    * Main Task to process common css files
    */
    grunt.registerTask("build_common_css", function () {
        var cssFiles,
            cssMinFiles = {},
            fileNames,
            counter = 0,
            stepsCounter = 0,
            themeCounter = 0,
            stepsLength = _STEPS.length,
            themeLength = _THEMES.length,
            destFileName,
            filesToGrunt = {},
            fileType,
            cssFilesInConfig = [],
            cssFilesLength,
            currentFileStep,
            curFile,
            curFilePath,
            curMinFilePath,
            concatPath = [],
            concatFileName,
            cssFilesForComponentsTheme1 = [],
            cssFilesForComponentsTheme2 = [],
            cssFilesForCommonTheme1 = [],
            cssFilesForCommonTheme2 = [],
            cssFilesForInteractive = {},
            concatInteractivePath,
            componentFiles;

        fileType = FOLDERS.COMMON_CSS;
        cssFilesInConfig[0] = configJson.resources.theme1.css;
        cssFilesInConfig[1] = configJson.resources.theme2.css;

        componentFiles = configJson.resources.components;

        for (var componentCounter in componentFiles) {
            if (!componentFiles.hasOwnProperty(componentCounter)) {
                continue;
            }
            if (typeof componentFiles[componentCounter].css !== 'undefined' && componentFiles[componentCounter].componentType !== 4) {
                switch (componentFiles[componentCounter].componentType) {
                    // Files to be merged into components folder
                    case 1:
                        switch (componentFiles[componentCounter].themeType) {
                            case 1:
                                cssFilesForComponentsTheme1 = cssFilesForComponentsTheme1.concat(componentFiles[componentCounter].css);
                                break;

                            case 2:
                                cssFilesForComponentsTheme2 = cssFilesForComponentsTheme2.concat(componentFiles[componentCounter].css);
                                break;

                            case 0:
                            default:
                                cssFilesForComponentsTheme1 = cssFilesForComponentsTheme1.concat(componentFiles[componentCounter].css);
                                cssFilesForComponentsTheme2 = cssFilesForComponentsTheme2.concat(componentFiles[componentCounter].css);
                                break;
                        }
                        break;

                        // Files to be merged into interactive folder
                    case 2:
                        cssFilesForInteractive[componentCounter] = componentFiles[componentCounter].css;
                        break;

                        // Files to be merged into common
                        // default used with common to prevent files from being loaded in case componentType isn't defined
                    case 0:
                    default:
                        switch (componentFiles[componentCounter].themeType) {
                            case 1:
                                cssFilesForCommonTheme1 = cssFilesForCommonTheme1.concat(componentFiles[componentCounter].css);
                                break;

                            case 2:
                                cssFilesForCommonTheme2 = cssFilesForCommonTheme2.concat(componentFiles[componentCounter].css);
                                break;

                            case 0:
                            default:
                                cssFilesForCommonTheme1 = cssFilesForCommonTheme1.concat(componentFiles[componentCounter].css);
                                cssFilesForCommonTheme2 = cssFilesForCommonTheme2.concat(componentFiles[componentCounter].css);
                                break;
                        }
                        break;
                }
            }
        }

        cssFilesInConfig[0] = cssFilesInConfig[0].concat(cssFilesForCommonTheme1, cssFilesForComponentsTheme1);
        cssFilesInConfig[1] = cssFilesInConfig[1].concat(cssFilesForCommonTheme2, cssFilesForComponentsTheme2);
        
        concatPath[0] = pathData._basePath + pathData._appName + pathData._interactivitiesPath + pathData._outputDir + "css" + pathData._interactivitiesPath + pathData._themes[0];
        concatPath[1] = pathData._basePath + pathData._appName + pathData._interactivitiesPath + pathData._outputDir + "css" + pathData._interactivitiesPath + pathData._themes[1];
        concatInteractivePath = pathData._basePath + pathData._appName + pathData._interactivitiesPath + pathData._outputDir + "css" + pathData._interactivitiesPath + pathData._interactiveSpecific;

        for (var groupCounter = 0; groupCounter < cssFilesInConfig.length; groupCounter++) {
            cssFiles = [];
            fileNames = [];
            cssFilesLength = cssFilesInConfig[groupCounter].length;
            pathData._theme = _THEMES[groupCounter];
            for (counter = 0; counter < cssFilesLength; counter++) {
                curFile = cssFilesInConfig[groupCounter][counter];
                curFilePath = (_getFilePath(curFile, fileType)) + curFile.url;
                // curMinFilePath = curFilePath.slice(0, curFilePath.length - 4) + ".min.css";

                /** Check for vendor CSS files */
                if (_isVendor(curFilePath)) {
                    continue;
                }

                cssFiles.push(curFilePath);
                // cssMinFiles[currentFileStep].push(curMinFilePath);
                fileNames.push(curFile);
            }
            concatFileName = pathData._appName + ".min.css";


            //Add overview.css from all interactives for theme-2
            if (groupCounter === 1) {
                cssFiles = cssFiles.concat(getOverviewCSSFiles());
            }

            if (cssFiles.length !== 0) {
                destFileName = concatPath[groupCounter] + concatFileName;
                filesToGrunt[destFileName] = cssFiles;

                if (grunt.file.exists(destFileName) === true) {
                    grunt.file.delete(destFileName, { force: true });
                }
                grunt.config("cssCommonFiles.group" + (groupCounter + 1), concatFileName);
                grunt.config("cssCommonFiles.fileNames.group" + (groupCounter + 1), fileNames);
            }
        }

        for (var interactiveName in cssFilesForInteractive) {
            cssFiles = [];
            fileNames = [];
            cssFilesLength = cssFilesForInteractive[interactiveName].length;
            for (counter = 0; counter < cssFilesLength; counter++) {
                curFile = cssFilesForInteractive[interactiveName][counter];
                curFilePath = (_getFilePath(curFile, fileType)) + curFile.url;
                // curMinFilePath = curFilePath.slice(0, curFilePath.length - 4) + ".min.css";

                /** Check for vendor CSS files */
                if (_isVendor(curFilePath)) {
                    continue;
                }

                cssFiles.push(curFilePath);
                // cssMinFiles[currentFileStep].push(curMinFilePath);
                fileNames.push(curFile);
            }
            concatFileName = interactiveName + ".min.css";

            if (cssFiles.length !== 0) {
                destFileName = concatInteractivePath + interactiveName + pathData._interactivitiesPath + concatFileName;
                filesToGrunt[destFileName] = cssFiles;
                if (grunt.file.exists(destFileName) === true) {
                    grunt.file.delete(destFileName, { force: true });
                }
                grunt.config("cssCommonFiles.interactive." + interactiveName, concatFileName);
                grunt.config("cssCommonFiles.fileNames.interactive." + interactiveName, fileNames);
            }
        }
        grunt.config.set('cssmin.my_target.files', filesToGrunt);
        grunt.task.run(["cssmin:my_target", "updatePlayerConfig_css"]);
    });

    /*
    * Update player config json file with combined css. 
    */
    grunt.registerTask("updatePlayerConfig_css", function () {
        var cssConfigJson = [],
            configComponents = configJson.resources.components,
            cssJsonToDel, configCounter;
        cssConfigJson[0] = configJson.resources.theme1.css;
        cssConfigJson[1] = configJson.resources.theme2.css;

        for (var groupCounter = 0; groupCounter < 2; groupCounter++) {
            cssJsonToDel = grunt.config("cssCommonFiles.fileNames.group" + (groupCounter + 1));
            var curMinCSSFile = {};
            curMinCSSFile.url = grunt.config("cssCommonFiles.group" + (groupCounter + 1));
            curMinCSSFile.basePath = FOLDERS.COMMON_CSS;
            for (var i = 0; i < cssJsonToDel.length; i++) {
                for (var j = 0; j < cssConfigJson[groupCounter].length; j++) {
                    if (cssConfigJson[groupCounter][j].url === cssJsonToDel[i].url) {
                        cssConfigJson[groupCounter].splice(j, 1);
                        j--;
                    }
                }
            }
            //push combined file which is newly created.
            cssConfigJson[groupCounter].push(curMinCSSFile);
        }

        for (var componentName in configComponents) {
            if (typeof configComponents[componentName].css !== 'undefined' && configComponents[componentName].componentType !== 4) {
                cssConfigJson = [];
                curMinCSSFile = [];
                cssJsonToDel = [];
                curMinCSSFile[0] = {};
                switch (configComponents[componentName].componentType) {
                    // Files to be merged into interactive folder
                    case 2:
                        cssJsonToDel[0] = grunt.config("cssCommonFiles.fileNames.interactive." + componentName);
                        curMinCSSFile[0].url = componentName + pathData._interactivitiesPath + grunt.config("cssCommonFiles.interactive." + componentName);
                        curMinCSSFile[0].basePath = FOLDERS.COMMON_INTERACTIVE_CSS;
                        if (configComponents[componentName].stepNumber === 1) {
                            curMinCSSFile[0].isNextStepLoad = false;
                        }
                        break;

                        // Files to be merged into common
                        // default used with common to prevent files from being loaded in case componentType isn't defined
                    case 0:
                    case 1:
                    default:
                        switch (configComponents[componentName].themeType) {
                            case 1:
                                cssJsonToDel[0] = grunt.config("cssCommonFiles.fileNames.group1");
                                curMinCSSFile[0].url = grunt.config("cssCommonFiles.group1");
                                curMinCSSFile[0].basePath = FOLDERS.COMMON_CSS;
                                break;

                            case 2:
                                cssJsonToDel[0] = grunt.config("cssCommonFiles.fileNames.group2");
                                curMinCSSFile[0].url = grunt.config("cssCommonFiles.group2");
                                curMinCSSFile[0].basePath = FOLDERS.COMMON_CSS;
                                if (configComponents[componentName].stepNumber === 1) {
                                    curMinCSSFile[0].isNextStepLoad = false;
                                }
                                break;

                            case 0:
                            default:
                                cssJsonToDel[0] = grunt.config("cssCommonFiles.fileNames.group1");
                                curMinCSSFile[0].url = grunt.config("cssCommonFiles.group1");
                                curMinCSSFile[0].basePath = FOLDERS.COMMON_CSS;
                                if (configComponents[componentName].stepNumber === 1) {
                                    curMinCSSFile[0].isNextStepLoad = false;
                                }
                                break;
                        }
                        break;
                }
                cssConfigJson = configComponents[componentName].css;
                for (var i = 0; i < cssJsonToDel.length; i++) {
                    for (var k = 0; k < cssJsonToDel[i].length; k++) {
                        for (var j = 0; j < cssConfigJson.length; j++) {
                            if (cssConfigJson[j].url === cssJsonToDel[i][k].url) {
                                cssConfigJson.splice(j, 1);
                                j--;
                            }
                        }
                    }
                    //push combined file which is newly created.
                    if (configComponents[componentName].componentType !== 0) {
                        cssConfigJson.push(curMinCSSFile[i]);
                    }
                }
            }
        }
    });

    /*
    * Task to clean (remove) unminified/minified css from folder structure - currently not called.
    */
    grunt.registerTask("clean_css", function () {
        //var curStep = parseInt(grunt.config("cssFiles.counter"), 10);
        var filesToDel = [],
            _cssFiles = grunt.config("cssFiles.step" + curStep),
            _cssMinFiles = grunt.config("cssFiles.step_min" + curStep),
                cssFilesLength = _cssFiles.length,
                counter = 0;

        for (; counter < cssFilesLength; counter++) {
            filesToDel.push(_cssFiles[counter]);
            filesToDel.push(_cssMinFiles[counter]);
        }
        grunt.config("clean.src", filesToDel);
        grunt.task.run("clean");

    });


    /*
   * Main Task to process js files. Creates array for different steps and calls "processJS" task
   */
    grunt.registerTask("build_js", function () {
        var jsFiles = {}, jsMinFiles = {}, jsFileNames = {},
            counter = 0, stepsCounter = 0, themeCounter = 0,
            stepsLength = _STEPS.length, themeLength = _THEMES.length,
            jsFilesInConfig, jsFilesLength, curFile, currentFileStep,
            templateFilesInConfig, templateFilesLength,
            jsFileType, templateFileType;


        for (; stepsCounter < stepsLength; stepsCounter++) {
            jsFiles[_STEPS[stepsCounter]] = [];
            jsMinFiles[_STEPS[stepsCounter]] = [];
            jsFileNames[_STEPS[stepsCounter]] = [];
        }

        jsFilesInConfig = configJson.resources.js;
        templateFilesInConfig = configJson.resources.templates;
        jsFileType = FOLDERS.SCRIPT;
        templateFileType = FOLDERS.TEMPLATE;

        jsFilesLength = jsFilesInConfig ? jsFilesInConfig.length : 0;
        templateFilesLength = templateFilesInConfig ? templateFilesInConfig.length : 0;

        /** pushing js files to array **/
        for (; counter < jsFilesLength; counter++) {
            curFile = jsFilesInConfig[counter];
            currentFileStep = getStepNoOfFile(curFile);
            curFilePath = (_getFilePath(curFile, jsFileType)) + curFile["url"];
            //curMinFilePath = curFilePath.slice(0, curFilePath.length - 3) + ".min.js"; // 3 subtracted for ".js" 

            /** Check for vendor JS files */
            if (_isVendor(curFilePath)) {
                continue;
            }

            if (curFile.basePath === 'MATH_UTILITIES_JS') {
                continue;
            }


            if (typeof jsFiles[currentFileStep] !== "undefined") {
                jsFiles[currentFileStep].push(curFilePath);
                // jsMinFiles[currentFileStep].push(curMinFilePath);
                jsFileNames[currentFileStep].push(curFile);
            }
        }

        /** pushing templates files to array **/
        for (counter = 0; counter < templateFilesLength; counter++) {
            curFile = templateFilesInConfig[counter];
            currentFileStep = getStepNoOfFile(curFile);
            curFilePath = (_getFilePath(curFile, templateFileType)) + curFile["url"];
            // curMinFilePath = curFilePath.slice(0, curFilePath.length - 3) + ".min.js"; // 3 subtracted for ".js" 

            /** Check for vendor JS files */
            if (_isVendor(curFilePath)) {
                continue;
            }

            if (typeof jsFiles[currentFileStep] !== "undefined") {
                jsFiles[currentFileStep].push(curFilePath);
                // jsMinFiles[currentFileStep].push(curMinFilePath);
                jsFileNames[currentFileStep].push(curFile);
            }
        }

        //grunt.config.set('uglify.tools.files', files);

        var files = {}, curStep,
            concatPath = pathData._basePath + pathData._appName + pathData._interactivitiesPath + pathData._outputDir + "js" + pathData._interactivitiesPath,
            concatFileName, destFileName;
        for (stepsCounter = 0; stepsCounter < stepsLength; stepsCounter++) {
            curStep = _STEPS[stepsCounter];
            concatFileName = pathData._appName + "-step-" + curStep + ".min.js";
            if (jsFiles[curStep].length !== 0) {
                destFileName = concatPath + concatFileName;
                // A check to avoid combining of threejs files in the minified file of interactive
                jsFiles[curStep] = jsFiles[curStep].filter(function(filePath) {
                    if (filePath.indexOf("threejs") === -1 && filePath.indexOf("typeface.js") === -1) {
                        return true;
                    }
                });
                files[destFileName] = jsFiles[curStep];
                if (grunt.file.exists(destFileName) === true) {
                    grunt.file.delete(destFileName, { force: true });
                }
                grunt.config("jsFiles.step" + curStep, jsFiles[curStep]);
                grunt.config("jsFiles.fileNames.step" + curStep, jsFileNames[curStep]);
            }
        }
        grunt.config.set('uglify.my_target.files', files);
        try {
            grunt.task.run(["uglify:my_target"]);
        }
        catch (err1) {
            console.log(err1);
        }
        try {
            grunt.task.run(["updateConfig_js"]);
        }
        catch (err2) {
            console.log(err2);
        }
    });


    /*
    * Update config json file with combined js. 
    */
    grunt.registerTask("updateConfig_js", function () {
        var jsConfigJson, templateConfigJson, curStep, jsJsonToDel, configCounter, stepsLength = _STEPS.length, stepsCounter = 0, 
        fileBasePath,
        threeJsPresent = false,
        threeJsFontsPresent = false,
        jsonEntryCounter,

        jsConfigJson = configJson.resources.js,
        templateConfigJson = configJson.resources.templates,
        fileBasePath = FOLDERS.SCRIPT,
        minifiedFile,
        configFilesCombined;
        for (; stepsCounter < stepsLength; stepsCounter++) {
            curStep = _STEPS[stepsCounter];
            jsJsonToDel = grunt.config("jsFiles.fileNames.step" + curStep);
            var curMinJSFile = {};
            curMinJSFile.url = pathData._appName + "-step-" + curStep + ".min.js";
            curMinJSFile.basePath = fileBasePath;

            if (pathData._theme !== 1) {
                if (pathData._appName === "common" && curStep !== 1) {
                    curMinJSFile[_IS_NEXT_STEP_LOAD] = true
                }
                else if (pathData._appName !== "common" && curStep !== 2) {
                    curMinJSFile[_IS_NEXT_STEP_LOAD] = false
                }
            }
            if (jsJsonToDel !== null && jsJsonToDel.length !== 0) {
                /** Update js node in config json **/
                for (jsonEntryCounter = 0; jsonEntryCounter < jsJsonToDel.length; jsonEntryCounter++) {
                    if (jsJsonToDel[jsonEntryCounter].basePath.indexOf("THREE_JS") !== -1) {
                        threeJsPresent = true;
                        continue;
                    }
                    if (jsJsonToDel[jsonEntryCounter].basePath.indexOf("COMMON_SCRIPT_FONTS") !== -1) {
                        threeJsFontsPresent = true;
                        if (threeJsPresent) {
                            break;
                        }
                    }
                }
                for (configCounter = 0; configCounter < jsConfigJson.length; configCounter++) { // length is calculated each time as the length of array gets changed.
                    if (jsJsonToDel.length === 0) {
                        break;
                    }
                    else if (jsConfigJson[configCounter].url === jsJsonToDel[0].url) {
                        jsJsonToDel.splice(0, 1);
                        jsConfigJson.splice(configCounter, 1);
                        --configCounter; // As array is changed dynamically & its length is updated, counter is reset at each change.
                    }
                }


                /** Update templates node in config json **/
                for (configCounter = 0; configCounter < templateConfigJson.length; configCounter++) { // length is calculated each time as the length of array gets changed.
                    if (jsJsonToDel.length === 0) {
                        break;
                    }
                    else if (templateConfigJson[configCounter]["url"] === jsJsonToDel[0]["url"]) {
                        jsJsonToDel.splice(0, 1);
                        templateConfigJson.splice(configCounter, 1);
                        --configCounter; // As array is changed dynamically & its length is updated, counter is reset at each change.
                    }
                }
                if (jsJsonToDel.length !== 0) {
                    grunt.log.writeln("=== ERROR in updateConfig_js task :: === All files not deleted :: ", jsJsonToDel);
                }
                if (threeJsPresent) {
                    jsConfigJson.push({
                        "url": "threejs.min.js",
                        "basePath": "VENDOR_DIST"
                    });
                }
                if (threeJsFontsPresent) {
                    jsConfigJson.push({
                        "url": "threejs-fonts.min.js",
                        "basePath": "VENDOR_DIST"
                    }); 
                }
                configFilesCombined = grunt.config("uglify.my_target.files");
                for (minifiedFile in configFilesCombined) {
                    if (minifiedFile.indexOf(curMinJSFile.url) !== -1 && configFilesCombined[minifiedFile].length) {
                        jsConfigJson.push(curMinJSFile);
                        break;
                    }
                }
            }
        }
    });


    /*
   * Main Task to process common js and template files
   */
    grunt.registerTask("build_common_js", function () {
        var jsFiles = [],
            jsMinFiles = [],
            jsFileNames = [],
            counter = 0,
            stepsCounter = 0,
            themeCounter = 0,
            stepsLength = _STEPS.length,
            themeLength = _THEMES.length,
            jsFilesInConfig = [],
            jsFilesInConfigTheme1 = [],
            jsFilesInConfigTheme2 = [],
            jsFilesLength,
            curFile,
            currentFileStep,
            templateFilesInConfig,
            templateFilesInConfigTheme1,
            templateFilesInConfigTheme2,
            templateFilesLength,
            filesToMinify = [[]],
            jsFileType,
            templateFileType,
            componentFiles,
            jsFilesForComponents = {},
            jsFilesForInteractive = {},
            jsFilesForCommonTheme1 = [],
            jsFilesForCommonTheme2Step1 = [],
            jsFilesForCommonTheme2Step2 = [],
            files = {},
            concatPath = pathData._basePath + pathData._appName + pathData._interactivitiesPath + pathData._outputDir + "js" + pathData._interactivitiesPath,
            concatFileName,
            destFileName,
            concatTemplate;

        /*
        Store list of JS and Template files from config json
        */
        jsFilesInConfigTheme1 = configJson.resources.theme1.js;
        jsFilesInConfigTheme2 = configJson.resources.theme2.js;
        templateFilesInConfigTheme1 = configJson.resources.theme1.templates;
        templateFilesInConfigTheme2 = configJson.resources.theme2.templates;

        /*
        Store base path of JS and Template files
        */
        jsFileType = FOLDERS.COMMON_SCRIPT;
        templateFileType = FOLDERS.COMMON_TEMPLATE;

        /*
        List of files to be pushed into common.min.js
        Includes common files required for both theme1 & theme2
        */
        jsFilesInConfig = _combineArrays(jsFilesInConfigTheme1, jsFilesInConfigTheme2, 'url', 'intersection');
        templateFilesInConfig = _combineArrays(templateFilesInConfigTheme1, templateFilesInConfigTheme2, 'url', 'intersection');
        jsFilesLength = jsFilesInConfig.length,
        templateFilesLength = templateFilesInConfig.length;

        /*
        Store list of components from config json
        */
        componentFiles = configJson.resources.components;

        /*
        List of files to be minified into common.min.js        
        */
        filesToMinify[0] = filesToMinify[0].concat(jsFilesInConfig, templateFilesInConfig);

        /*
        Remaining js files which are not common to both theme1 & theme2
        */
        jsFilesForCommonTheme1 = jsFilesForCommonTheme1.concat(_subtractArrays(jsFilesInConfigTheme1, filesToMinify[0], 'url'));
        jsFilesForCommonTheme1 = jsFilesForCommonTheme1.concat(_subtractArrays(templateFilesInConfigTheme1, filesToMinify[0], 'url'));
        jsFilesForCommonTheme2Step1 = jsFilesForCommonTheme2Step1.concat(_subtractArrays(jsFilesInConfigTheme2, filesToMinify[0], 'url'));
        jsFilesForCommonTheme2Step1 = jsFilesForCommonTheme2Step1.concat(_subtractArrays(templateFilesInConfigTheme2, filesToMinify[0], 'url'));

        /*
        Segregate components based on their type, theme and step number
        */
        for (var componentCounter in componentFiles) {
            if (!componentFiles.hasOwnProperty(componentCounter)) {
                continue;
            }

            if (((typeof componentFiles[componentCounter].js !== 'undefined') || (typeof componentFiles[componentCounter].templates !== 'undefined')) && componentFiles[componentCounter].componentType !== 4) {

                if (typeof componentFiles[componentCounter].js === 'undefined') {
                    componentFiles[componentCounter].js = [];
                }
                if (typeof componentFiles[componentCounter].templates === 'undefined') {
                    componentFiles[componentCounter].templates = [];
                }

                switch (componentFiles[componentCounter].componentType) {

                    case 1:
                        /*
                        Individual component files to be placed in the components folder
                        */
                        jsFilesForComponents[componentCounter] = (componentFiles[componentCounter].js).concat(componentFiles[componentCounter].templates);
                        break;


                    case 2:
                        /*
                        Individual interactive related component files to be placed in the interactive folder
                        */
                        jsFilesForInteractive[componentCounter] = (componentFiles[componentCounter].js).concat(componentFiles[componentCounter].templates);
                        break;


                    case 0:
                    default:
                        /*
                        Files to be merged into a common file
                        default case used to prevent files from being loaded in case componentType isn't defined
                        */
                        switch (componentFiles[componentCounter].themeType) {
                            case 1:
                                /*
                                Files to be merged into common-theme-1.min.js
                                */
                                jsFilesForCommonTheme1 = jsFilesForCommonTheme1.concat(componentFiles[componentCounter].js, componentFiles[componentCounter].templates);
                                break;

                            case 2:
                                switch (componentFiles[componentCounter].stepNumber) {
                                    case 2:
                                        /*
                                        Files to be merged into common-theme-2-step-2.min.js
                                        */
                                        jsFilesForCommonTheme2Step2 = jsFilesForCommonTheme2Step2.concat(componentFiles[componentCounter].js, componentFiles[componentCounter].templates);
                                        break;

                                    case 1:
                                    default:
                                        /*
                                        Files to be merged into common-theme-2-step-1.min.js
                                        */
                                        jsFilesForCommonTheme2Step1 = jsFilesForCommonTheme2Step1.concat(componentFiles[componentCounter].js, componentFiles[componentCounter].templates);
                                        break;
                                }
                                break;

                            case 0:
                            default:
                                /*
                                Files to be merged into common.min.js
                                */
                                filesToMinify[0] = filesToMinify[0].concat(componentFiles[componentCounter].js, componentFiles[componentCounter].templates);
                                break;
                        }
                }
            }
        }

        filesToMinify[1] = jsFilesForCommonTheme1;
        if (combineCommonFiles) {
            filesToMinify[0] = filesToMinify[0].concat(jsFilesForCommonTheme2Step1);
            filesToMinify[2] = [];
        }
        else {
            filesToMinify[2] = jsFilesForCommonTheme2Step1;
        }
        filesToMinify[3] = jsFilesForCommonTheme2Step2;
        /** pushing js files to array **/
        for (var groupCounter = 0; groupCounter < filesToMinify.length; groupCounter++) {

            jsFiles = [];
            jsFileNames = [];
            jsFilesLength = filesToMinify[groupCounter].length;

            for (var counter = 0; counter < jsFilesLength; counter++) {
                curFile = filesToMinify[groupCounter][counter];
                curFilePath = (_getFilePath(curFile, jsFileType)) + curFile.url;

                /** Check for vendor JS files */
                if (_isVendor(curFilePath)) {
                    continue;
                }
                jsFiles.push(curFilePath);
                jsFileNames.push(curFile);
            }

            /*
            Set file names of minified common files
            */
            switch (groupCounter) {
                case 0:
                    concatFileName = pathData._appName + ".min.js";
                    break;
                case 1:
                    concatFileName = pathData._appName + "-theme-1.min.js";
                    break;
                case 2:
                    concatFileName = pathData._appName + "-theme-2-step-1.min.js";
                    break;
                case 3:
                    concatFileName = pathData._appName + "-theme-2-step-2.min.js";
                    break;
            }

            if (jsFiles.length !== 0) {
                destFileName = concatPath + concatFileName;
                files[destFileName] = jsFiles;

                /*
                Delete previously minified file
                */
                if (grunt.file.exists(destFileName) === true) {
                    grunt.file.delete(destFileName, { force: true });
                }

                /*
                Save list of files minified into a common file for updating player-config.json
                */
                grunt.config("jsCommonFiles.group" + (groupCounter + 1), concatFileName);
                grunt.config("jsCommonFiles.fileNames.group" + (groupCounter + 1), jsFileNames);
            }
            //grunt.file.write(destFileName + 'on', JSON.stringify(jsFileNames));
        }

        for (var componentName in jsFilesForComponents) {
            jsFiles = [];
            jsFileNames = [];
            filesToMinify = jsFilesForComponents[componentName];
            jsFilesLength = filesToMinify.length;
            for (var counter = 0; counter < jsFilesLength; counter++) {
                curFile = filesToMinify[counter];
                curFilePath = (_getFilePath(curFile, jsFileType)) + curFile.url;
                //curMinFilePath = curFilePath.slice(0, curFilePath.length - 3) + ".min.js"; // 3 subtracted for ".js" 

                /** Check for vendor JS files */
                if (_isVendor(curFilePath)) {
                    continue;
                }
                jsFiles.push(curFilePath);
                // jsMinFiles[currentFileStep].push(curMinFilePath);
                jsFileNames.push(curFile);
                concatFileName = componentName + ".min.js";

                if (jsFiles.length !== 0) {
                    destFileName = concatPath + pathData._components + concatFileName;
                    files[destFileName] = jsFiles;
                    if (grunt.file.exists(destFileName) === true) {
                        grunt.file.delete(destFileName, { force: true });
                    }
                    grunt.config("jsCommonFiles.components." + componentName, concatFileName);
                    grunt.config("jsCommonFiles.fileNames.components." + componentName, jsFileNames);
                }
            }
        }

        for (var interactiveName in jsFilesForInteractive) {
            jsFiles = [];
            jsFileNames = [];
            filesToMinify = jsFilesForInteractive[interactiveName];
            jsFilesLength = filesToMinify.length;
            for (var counter = 0; counter < jsFilesLength; counter++) {
                curFile = filesToMinify[counter];
                curFilePath = (_getFilePath(curFile, jsFileType)) + curFile.url;
                //curMinFilePath = curFilePath.slice(0, curFilePath.length - 3) + ".min.js"; // 3 subtracted for ".js" 

                /** Check for vendor JS files */
                if (_isVendor(curFilePath)) {
                    continue;
                }
                jsFiles.push(curFilePath);
                // jsMinFiles[currentFileStep].push(curMinFilePath);
                jsFileNames.push(curFile);
                concatFileName = interactiveName + ".min.js";

                if (jsFiles.length !== 0) {
                    destFileName = concatPath + pathData._interactiveSpecific + interactiveName + pathData._interactivitiesPath + concatFileName;
                    files[destFileName] = jsFiles;
                    if (grunt.file.exists(destFileName) === true) {
                        grunt.file.delete(destFileName, { force: true });
                    }
                    grunt.config("jsCommonFiles.interactive." + interactiveName, concatFileName);
                    grunt.config("jsCommonFiles.fileNames.interactive." + interactiveName, jsFileNames);
                }
            }
        }

        grunt.config.set('uglify.my_target.files', files);

        try {
            grunt.task.run(["uglify:my_target"]);
        }
        catch (err1) {
            console.log(err1);
        }
        try {
            grunt.task.run(["updatePlayerConfig_js"]);
        }
        catch (err2) {
            console.log(err2);
        }
    });

    /*
    * Update player config json file with combined js. 
    */
    grunt.registerTask("updatePlayerConfig_js", function () {
        var jsConfigJson = [], templatesConfigJson = [],
            configComponents = configJson.resources.components,
            jsJsonToDel = [], configCounter;
        jsConfigJson[0] = configJson.resources.theme1.js;
        jsConfigJson[1] = configJson.resources.theme2.js;
        templatesConfigJson[0] = configJson.resources.theme1.templates;
        templatesConfigJson[1] = configJson.resources.theme2.templates;
        for (var groupCounter = 1; groupCounter <= 4; groupCounter++) {
            jsJsonToDel = jsJsonToDel.concat(grunt.config("jsCommonFiles.fileNames.group" + groupCounter));
        }

        for (var themeCounter = 0; themeCounter < 2; themeCounter++) {
            var curMinJSFile = {};
            curMinJSFile.url = grunt.config("jsCommonFiles.group1");
            curMinJSFile.basePath = FOLDERS.COMMON_SCRIPT;
            for (var i = 0; i < jsJsonToDel.length; i++) {
                for (var j = 0; j < jsConfigJson[themeCounter].length; j++) {
                    if (jsConfigJson[themeCounter][j] != null && jsJsonToDel[i] != null) {
                        if (jsConfigJson[themeCounter][j].url === jsJsonToDel[i].url) {
                            jsConfigJson[themeCounter].splice(j, 1);
                            j--;
                        }
                    }
                }
                for (var k = 0; k < templatesConfigJson[themeCounter].length; k++) {
                    if (templatesConfigJson[themeCounter][k] != null && jsJsonToDel[i] != null) {
                        if (templatesConfigJson[themeCounter][k].url === jsJsonToDel[i].url) {
                            templatesConfigJson[themeCounter].splice(k, 1);
                            k--;
                        }
                    }
                }
            }
            if (!combineCommonFiles) {
                //push combined file which is newly created.
                jsConfigJson[themeCounter].push(curMinJSFile);
            }
        }
        //grunt.file.write('../files-new.json', JSON.stringify(jsConfigJson));
        for (var componentName in configComponents) {
            if (((typeof configComponents[componentName].js !== 'undefined') || (typeof configComponents[componentName].templates !== 'undefined')) && configComponents[componentName].componentType !== 4) {

                jsConfigJson = [];
                templatesConfigJson = [];
                curMinJSFile = [];
                jsJsonToDel = [];
                curMinJSFile[0] = {};
                switch (configComponents[componentName].componentType) {
                    case 1:
                        jsJsonToDel[0] = grunt.config("jsCommonFiles.fileNames.components." + componentName);
                        curMinJSFile[0].url = pathData._components + grunt.config("jsCommonFiles.components." + componentName);
                        curMinJSFile[0].basePath = FOLDERS.COMMON_SCRIPT;
                        if (configComponents[componentName].stepNumber === 1) {
                            curMinJSFile[0].isNextStepLoad = false;
                        }
                        break;

                        // Files to be merged into interactive folder
                    case 2:
                        jsJsonToDel[0] = grunt.config("jsCommonFiles.fileNames.interactive." + componentName);
                        curMinJSFile[0].url = pathData._interactiveSpecific + componentName + pathData._interactivitiesPath + grunt.config("jsCommonFiles.interactive." + componentName);
                        curMinJSFile[0].basePath = FOLDERS.COMMON_SCRIPT;
                        if (configComponents[componentName].stepNumber === 1) {
                            curMinJSFile[0].isNextStepLoad = false;
                        }
                        break;

                        // Files to be merged into common
                        // default used with common to prevent files from being loaded in case componentType isn't defined
                    case 0:
                    default:

                        if (combineCommonFiles && configComponents[componentName].themeType === 2 && configComponents[componentName].stepNumber === 1) {
                            configComponents[componentName].themeType = 0;
                        }

                        switch (configComponents[componentName].themeType) {
                            case 1:
                                jsJsonToDel[0] = grunt.config("jsCommonFiles.fileNames.group2");
                                curMinJSFile[0].url = grunt.config("jsCommonFiles.group2");
                                curMinJSFile[0].basePath = FOLDERS.COMMON_SCRIPT;
                                break;

                            case 2:
                                switch (configComponents[componentName].stepNumber) {
                                    case 2:
                                        jsJsonToDel[0] = grunt.config("jsCommonFiles.fileNames.group4");
                                        curMinJSFile[0].url = grunt.config("jsCommonFiles.group4");
                                        curMinJSFile[0].basePath = FOLDERS.COMMON_SCRIPT;
                                        break;

                                    case 1:
                                    default:
                                        jsJsonToDel[0] = grunt.config("jsCommonFiles.fileNames.group3");
                                        curMinJSFile[0].url = grunt.config("jsCommonFiles.group3");
                                        curMinJSFile[0].basePath = FOLDERS.COMMON_SCRIPT;
                                        break;
                                }
                                break;

                            case 0:
                            default:
                                jsJsonToDel[0] = grunt.config("jsCommonFiles.fileNames.group1");
                                curMinJSFile[0].url = grunt.config("jsCommonFiles.group1");
                                curMinJSFile[0].basePath = FOLDERS.COMMON_SCRIPT;
                                break;
                        }
                        break;
                }
                if (typeof configComponents[componentName].js === 'undefined') {
                    configComponents[componentName].js = [];
                }
                else if (typeof configComponents[componentName].templates === 'undefined') {
                    configComponents[componentName].templates = [];
                }
                jsConfigJson = configComponents[componentName].js;
                templatesConfigJson = configComponents[componentName].templates;

                for (var i = 0; i < jsJsonToDel.length; i++) {
                    for (var k = 0; k < jsJsonToDel[i].length; k++) {
                        for (var j = 0; j < jsConfigJson.length; j++) {
                            if (typeof jsConfigJson[j] !== 'undefined') {
                                if (jsConfigJson[j].url === jsJsonToDel[i][k].url) {
                                    jsConfigJson.splice(j, 1);
                                    j--;
                                }
                            }
                        }

                        for (var j = 0; j < templatesConfigJson.length; j++) {
                            if (typeof templatesConfigJson[j] !== 'undefined') {
                                if (templatesConfigJson[j].url === jsJsonToDel[i][k].url) {
                                    templatesConfigJson.splice(j, 1);
                                    j--;
                                }
                            }
                        }
                    }

                    //push combined file which is newly created.
                    if (configComponents[componentName].componentType !== 0) {
                        jsConfigJson.push(curMinJSFile[i]);
                    }
                }
            }
        }

        configJson.resources.theme1.components.push('theme1-components');
        configJson.resources.theme2.components.push('theme2-components');
        configJson.resources.components['theme1-components'] = {
            "js": [
                {
                    "url": "common-theme-1.min.js",
                    "basePath": "COMMON_SCRIPT"
                }
            ]
        };
        if (combineCommonFiles) {
            configJson.resources.components['theme2-components'] = {
                "js": [
                    {
                        "url": "common-theme-2-step-2.min.js",
                        "basePath": "COMMON_SCRIPT",
                        "isNextStepLoad": true
                    }
                ]
            };
        }
        else {
            configJson.resources.components['theme2-components'] = {
                "js": [
                    {
                        "url": "common-theme-2-step-1.min.js",
                        "basePath": "COMMON_SCRIPT"
                    },
                    {
                        "url": "common-theme-2-step-2.min.js",
                        "basePath": "COMMON_SCRIPT",
                        "isNextStepLoad": true
                    }
                ]
            };
        }
    });

    /*
    * Copy and minify config file
    *
    */
    grunt.registerTask("write_configJson_to_file", function () {

        var tempPathHolder = configFilePath.split(pathData._appName + pathData._interactivitiesPath),
            _newConfigFilePath = returnConfigFilePath(pathData._appName);

        grunt.file.write(_newConfigFilePath, JSON.stringify(configJson));
        processNextTask(this);
    });

    /*
    * Copy and minify config file
    *
    */
    grunt.registerTask("write_playerConfigJson_to_file", function () {

        var variableName = '(function(MathInteractives){MathInteractives.Common.Player._configData=',
            _newConfigFilePath = returnConfigFilePath('common');

        grunt.file.write(_newConfigFilePath, variableName + JSON.stringify(configJson) + '})(MathInteractives);');
    });

    grunt.registerTask("delete-common-combined-minified-file", function () {
        var commonMinFileToDelete = pathData._basePath + pathData._commonPath + pathData._outputDir + pathData._scriptPath + 'common.min.js';
        grunt.file.delete(commonMinFileToDelete, { force: true });
    });

    grunt.registerTask("delete-player-config", function () {
        var configFilePath = returnConfigFilePath('common');
        grunt.file.delete(configFilePath, { force: true });
    });

    grunt.registerTask("combine-three-js", function () {
        _generatePathData();
        var pathToCommonJs = pathData._basePath + pathData._commonPath + pathData._scriptPath,
            vendorPath = pathToCommonJs + pathData._vendorPath,
            threejsFiles = [
                vendorPath + pathData._threeJsPath + "polyfill.js",
                vendorPath + pathData._threeJsPath + "polyfill-typedarray.js",
                vendorPath + pathData._threeJsPath + "Three.js",
                vendorPath + pathData._threeJsPath + "Detector.js",
                vendorPath + pathData._threeJsPath + "OrbitControls.js",
                vendorPath + pathData._threeJsPath + "OrbitControls-Touch.js",
                vendorPath + pathData._threeJsPath + "THREEx.FullScreen.js",
                vendorPath + pathData._threeJsPath + "THREEx.KeyboardState.js",
                vendorPath + pathData._threeJsPath + "THREEx.WindowResize.js",
            ],
            threeJsFontList = [
                pathToCommonJs + pathData._fontsPath + "gentilis_bold.typeface.js",
                pathToCommonJs + pathData._fontsPath + "gentilis_regular.typeface.js",
                pathToCommonJs + pathData._fontsPath + "optimer_bold.typeface.js",
                pathToCommonJs + pathData._fontsPath + "optimer_regular.typeface.js",
                pathToCommonJs + pathData._fontsPath + "helvetiker_bold.typeface.js",
                pathToCommonJs + pathData._fontsPath + "helvetiker_regular.typeface.js",
                pathToCommonJs + pathData._fontsPath + "droid_sans_regular.typeface.js",
                pathToCommonJs + pathData._fontsPath + "droid_sans_bold.typeface.js",
                pathToCommonJs + pathData._fontsPath + "droid_serif_regular.typeface.js",
                pathToCommonJs + pathData._fontsPath + "droid_serif_bold.typeface.js"
            ],
            fileList = {
            "../common/dist/js/vendor/threejs.min.js": threejsFiles,
            "../common/dist/js/vendor/threejs-fonts.min.js": grunt.file.expand(pathToCommonJs + pathData._fontsPath + "*.js")
        };
        grunt.config.uglify = grunt.config.uglify || {};
        grunt.config.uglify.threejs = grunt.config.uglify;
        grunt.config.set('uglify.threejs.files', fileList);
        grunt.task.run('uglify:threejs');
    });

    /*
    * Task to minify loc-acc json. 
    */
    grunt.registerTask("minify_loc_acc", function (appName) {
        var jsonFile,
            jsonPath,
            distJsonPath,
            newJsonFilePath,
            langFolderPath,
            tempPathHolder,
            interactiveFolderPath;

        _generatePathData();
        _setAppName(appName);

        interactiveFolderPath = pathData._appName + pathData._interactivitiesPath;
        jsonPath = _BASE_PATH + interactiveFolderPath + pathData._langPath + '**/*.json';
        distJsonPath = '!' + _BASE_PATH + interactiveFolderPath + pathData._outputDir + pathData._langPath + '**/*.json';

        var minFiles = grunt.file.expand({ filter: 'isFile' }, [jsonPath, distJsonPath]);

        for (var i = 0, count = minFiles.length; i < count; i++) {
            tempPathHolder = minFiles[i].split(interactiveFolderPath);
            newJsonFilePath = tempPathHolder[0] + interactiveFolderPath + pathData._outputDir + tempPathHolder[1];
            jsonFile = grunt.file.readJSON(minFiles[i]);
            grunt.file.write(newJsonFilePath, JSON.stringify(jsonFile));
        }
    });
    /*
    * Task to clean (remove) unminified/minified js from folder structure - currently not called. 
    */
    grunt.registerTask("clean_js", function () {
        /**  CODE NEEDS TO BE UPDATED TO PERFORM CLEANING FOR BOTH STEPS. ALSO jsFiles.counter no longer used **/
        var curStep = parseInt(grunt.config("jsFiles.counter"), 10);
        var filesToDel = [],
            _jsFiles = grunt.config("jsFiles.step" + curStep),
            jsFilesLength = _jsFiles.length,
                counter = 0;

        for (; counter < jsFilesLength; counter++) {
            filesToDel.push(_jsFiles[counter]);
        }
        grunt.config("clean.src", filesToDel);
        grunt.task.run("clean");
    });
}
