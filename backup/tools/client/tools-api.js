/*global MathUtilities:false, requirejs:false */
/*eslint max-len:0, no-shadow:1 */

/**
 * This module contains classes for tools API.
 * @module Tools
 */
var Tools = function(toolOptions) {
    'use strict';

    /**
     * Tool controller object, hanlder of tool Id, url and its state defining tool is loaded or not.
     *
     * @property _toolLoadController
     * @default null
     * @private
     */
    this._toolLoadController = null;

    /**
     * Base path for the tools.
     *
     * @property _basePath
     * @default ""
     * @private
     */
    this._basePath = '';

    this._ToolsInitialized = false;
    this._LoadToolCalled = false;

    this._LoadToolParams = {};

    /**
     * Stores the configuration for the tools.
     *
     * @property _options
     * @private
     */
    this._options = {
        "callbackData": null,
        "onSuccess": null,
        "onError": null,
        "onComplete": null,
        "scope": this
    };

    /**
     * Stores path to the common folder containing files.
     *
     * @property _strPathToCommon
     * @default null
     * @private
     */
    this._strPathToCommon = null;

    this._minify = null;

    /**
     * Stores Error Codes to be used for the application.
     *
     * @property ERROR_CODES
     * @default null
     * @static
     */
    Tools.prototype.ERROR_CODES = null;


    /**
     * Holds list of names that are to be checked before preloading it.
     * For now this would work, though there are chances if versions of library are different,
     * we might not load the latest or oldest version depending on it.
     * @property _dependencies
     * @private
     */
    this._dependencies = {
        "jsDependencies": {
            "backbone": 'backbone'
        }
    };


    /**
     * Loads generic tool independent data
     * Acts as a constructor
     * @method initialize
     * @constructor
     */
    this.initialize = function(toolOptions) {
        // basePath will be allowed to change once only. Check if it exists.
        if (toolOptions && toolOptions.basePath && toolOptions.basePath.length >= 0) {
            this._basePath = toolOptions.basePath;
        } else {
            throw new Error("ZeusToolsAPI :: initialize : setOptions -- Expected 'basePath' while initializing Tools ");
        }
        this.setOptions(toolOptions);
        this._toolLoadController = new Tools.ToolLoadController();
        this._loadDependencies();
    };

    /**
     * Sets the internal configuration.
     * @method setOptions
     * @param {Object} toolOptions that holds callback function such as onSuccess, onError, etc.
     * @private
     */
    this.setOptions = function(toolOptions) {
        if (toolOptions.onSuccess) {
            this._options.onSuccess = toolOptions.onSuccess;
        }

        if (toolOptions.onError) {
            this._options.onError = toolOptions.onError;
        }

        if (toolOptions.onComplete) {
            this._options.onComplete = toolOptions.onComplete;
        }

        if (toolOptions.callbackData) {
            this._options.callbackData = toolOptions.callbackData;
        }

        if (toolOptions.strPathToCommon) {
            this._strPathToCommon = toolOptions.strPathToCommon;
        } else {
            this._strPathToCommon = '';
        }
        if (typeof toolOptions.minify !== 'undefined') {
            this._minify = toolOptions.minify;
        } else {
            this._minify = true;
        }
    };

    /**
     * Preloads all the files required by the tool
     * and renders the tool within the specified container
     *
     * @method loadTool
     * @param {Object} objToolData        ToolData object that holds toolId, containerElement, initialstate for the tools and some other config options.
     * @param {Integer}                 toolId Tool's Id to load the tool.
     * @param {Integer} objToolData.containerId     Elememt Id in which the tool will be loaded.
     * @param {Object} [objToolData.initialState]     Optional Initial state data of the tool to be loaded.
     * @param {Object} [objToolData.callbackData]     Optional Value to be passed to the callback functions.
     */
    this.loadTool = function(objToolData) {
        if (this._ToolsInitialized !== true) {
            this._LoadToolCalled = true;
            this._LoadToolParams[objToolData.toolId] = objToolData;
            return;
        }
        var bToolLoaded = this._toolLoadController.isToolLoaded(objToolData.toolId),
            objToolInfo = this._toolLoadController.getToolInfo(objToolData.toolId),
            self = this,
            appID = "app" + objToolInfo.strToolId,
            path = '{"' + appID + '" : "' + objToolInfo.strToolUrl + '"}';
        if (!bToolLoaded) {
            // The path to the app.js
            requirejs.config({
                "paths": JSON.parse(path)
            });

            // Load the app given the appId
            require([appID], function(appInitiator) {
                    /*eslint new-cap:0*/
                    var strID;
                    self.appObj = new appInitiator();
                    self.appObj.minify = self._minify;
                    if (typeof objToolData.data === 'string') {
                        self.appObj.data = JSON.parse(objToolData.data);
                    } else {
                        self.appObj.data = objToolData.data;
                    }

                    strID = appID.split("app")[1];

                    delete self._LoadToolParams[strID];
                    self._LoadToolCalled = false;

                    // If the app has successfully loaded, set as its loaded.
                    self._toolLoadController.setOptions({
                        "strToolId": strID,
                        "objTool": self.appObj,
                        "bToolLoaded": true
                    });

                    // Set the needed callbacks and pass the state values.
                    self.appObj.setOptions({
                        "basePath": self._basePath,
                        "containerElement": document.getElementById(objToolData.containerId),
                        "onComplete": objToolData.onComplete,
                        "onError": objToolData.onError,
                        "onSuccess": objToolData.onSuccess,
                        "scope": self,
                        "initialState": objToolData.initialState,
                        "callbackData": objToolData.callbackData,
                        "accessibility": objToolData.accessibility,
                        "startTabIndex": objToolData.startTabIndex,
                        "lang": objToolData.lang,
                        "minify": objToolData.minify
                    });

                    // Start preloading.
                    self.appObj.preload(MathUtilities.Preloader);
                },
                function() {
                    // on error
                    self._onError.call(self, new Tools.ErrorLogger({
                        "strLogMsg": 'ZeusToolsApi :: _loadDependencies -- Fail while loading initial tool dependencies.',
                        "strLogType": Tools.ErrorLogger.LogType.Error
                    }));
                });
        } else {
            if (this.appObj._switchView) {
                self.appObj.setOptions({
                    "basePath": self._basePath,
                    "containerElement": document.getElementById(objToolData.containerId),
                    "onComplete": objToolData.onComplete,
                    "onError": objToolData.onError,
                    "onSuccess": objToolData.onSuccess,
                    "scope": self,
                    "initialState": objToolData.initialState,
                    "callbackData": objToolData.callbackData,
                    "accessibility": objToolData.accessibility,
                    "startTabIndex": objToolData.startTabIndex,
                    "lang": objToolData.lang,
                    "minify": objToolData.minify
                });
                this.appObj._switchView();
            }
        }
    };

    this.isToolLoaded = function(objToolData) {
        if (objToolData && objToolData.toolId) {
            return this._toolLoadController.isToolLoaded(objToolData.toolId);
        } else {
            return false;
        }
    };

    /**
     * Unloads the specified tool from the DOM
     * Removes any instances of data and events related to the tool from the memory.
     *
     * @method unloadTool
     * @param {Object} objToolData Config object that holds toolId and optional callbackData
     * @param {String} objToolData.toolId toolId that represents ID of the toolObject to be unloaded.
     * @param {Object} [objToolData.callBackData] An optional Callback data to be passed when tool is getting unloaded.
     */
    this.unloadTool = function(objToolData) {
        var objToolInfo = this._toolLoadController.getToolInfo(objToolData.toolId);
        if (objToolInfo && objToolInfo.objTool) {
            objToolInfo.objTool.setOptions({
                "onSuccess": objToolData.onSuccess,
                "onError": objToolData.onError,
                "onComplete": objToolData.onComplete,
                "callbackData": objToolData.callbackData
            });
            objToolInfo.objTool.unload();
            this._toolLoadController.setOptions({
                "strToolId": objToolData.toolId,
                "bToolLoaded": false
            });
        }
    };

    this.commonFiles = {
        "arrResources": [{
            "url": "vendor/jquery-ui/jquery-ui.min.css",
            "type": 2
        }, {
            "url": "css/tools/common/combined/tools.combined.min.css",
            "type": 2
        }, {
            "url": "dist/js/tools/common/tools-common.combined.min.js",
            "type": 3
        }]
    };

    this.toolsProperties = {
        "tools": {
            "toolIds": {
                "calculator": "1",
                "unitconverter": "2",
                "graphingplotting": "4",
                "matrix": "6",
                "whiteboard": 7,
                "geometrytool": 8,
                "constructiontool": 9,
                "nbadatatool": 10
            },
            "toolUrlMin": {
                "calculator": "dist/js/tools/tools/calculator/calculator.combined.min",
                "unitconverter": "dist/js/tools/tools/unit-converter/unit-converter.combined.min",
                "graphingplotting": "dist/js/tools/tools/graphing-plotting/graphing-tool.combined.min",
                "whiteboard": "dist/js/tools/tools/whiteboard/whiteboard.combined.min",
                "matrix": "dist/js/tools/tools/matrix-tool/matrix-tool.combined.min",
                "geometrytool": "dist/js/tools/tools/geometry-tool/geometry-tool.combined.min",
                "constructiontool": "dist/js/tools/tools/construction-tool/construction-tool.combined.min",
                "nbadatatool": "dist/common/components/nba-data-tool/main"
            },
            "toolUrl": {
                "calculator": "js/tools/tools/calculator/app",
                "unitconverter": "js/tools/tools/unit-converter/app",
                "graphingplotting": "js/tools/tools/graphing-plotting/app",
                "matrix": "js/tools/tools/matrix-tool/app",
                "whiteboard": "js/tools/tools/whiteboard/app",
                "geometrytool": "js/tools/tools/geometry-tool/app",
                "constructiontool": "js/tools/tools/construction-tool/app",
                "nbadatatool": "common/components/nba-data-tool/main"
            }
        },
        "ERROR_CODES": {
            "FAIL_LOADING_API": "Fail loading ToolsAPI.",
            "BASE_PATH_NULL": "Base path can not be null.",
            "TOOL_ID_NULL": "Tool Id can not be null.",
            "FAIL_LOADING_RESOURCES": "Fail while loading resources.",
            "FAIL_LOADING_APP": "Fail to load the app.",
            "FAIL_UNLOADING_APP": "Fail to unload app.",
            "NETWORK_ERROR": "Failed to connect the network, please check your internet settings."
        }
    };

    /**
     * Loads dependencies/common files that are required for the tools-api.
     * Removes any instances of data and events related to the tool from the memory.
     *
     * @method _loadDependencies
     * @return
     * @private
     */
    this._loadDependencies = function() {
        var strPathToCommon = this._basePath + this._strPathToCommon,
            self = this,
            i,
            commonJsonPath;
        // Loading the requirePreloader first with its dependencies, i.e backbone, and loading backbone with dependencies first jquery and underscore.
        //TODO : Have this thing in a seperate JSON file.
        requirejs.config({
            "paths": {
                "preloader": strPathToCommon + 'dist/js/tools/common/preloader.min',
                "baseApp": strPathToCommon + 'dist/js/tools/common/app.min',
                'handlebars': strPathToCommon + 'vendor/handlebars/handlebars.runtime.amd',
                'CommonRequireConfig': strPathToCommon + 'dist/js/tools/common/common-require-config.min'
            }
        });

        // Load the actual Preloader over here
        require(["preloader"], function(preloader) {
                MathUtilities.Preloader = preloader;
                // Load the Tools json file.
                // Todo : Make preloader capable of loading any kind of file. for now atleast support of [Json]

                self._onPropertiesLoaded(self.toolsProperties, self._minify);

                require(["baseApp"], function(baseApp) {
                    /*eslint no-unused-vars:0*/
                    if (self._minify) {
                        var arrPreloadFiles = self.commonFiles.arrResources,
                            tempUrl = null;
                        // Append the basePath to each urls
                        for (i = 0; i < arrPreloadFiles.length; i++) {
                            tempUrl = arrPreloadFiles[i].url;
                            arrPreloadFiles[i].url = self._basePath + tempUrl;
                        }
                        MathUtilities.Preloader.preload(arrPreloadFiles, {
                                "bRequireCompatible": true,
                                "scope": self
                            },
                            null,
                            null,
                            function() { // on complete
                                self._onSuccess.call(self, new Tools.ErrorLogger({
                                    "strLogMsg": 'ZeusToolsApi :: _loadDependencies -- All dependencies loaded.'
                                }), self);
                            },
                            function() {
                                // on error
                                self._onError.call(self, new Tools.ErrorLogger({
                                    "strLogMsg": "ZeusToolsApi :: _loadDependencies -- Fail while loading initial tool dependencies.",
                                    "strLogType": Tools.ErrorLogger.LogType.Error
                                }));
                            }
                        );
                    } else {
                        commonJsonPath = self._basePath + self._strPathToCommon + 'data/tools/client/common-list.json';

                        $.getJSON(commonJsonPath,
                            function(json) {

                                // We get json object, that contains an array of resources. Use them to preload files.
                                var arrPreloadFiles = json.arrResources,
                                    tempUrl = null;
                                // Append the basePath to each urls
                                for (i = 0; i < arrPreloadFiles.length; i++) {
                                    tempUrl = arrPreloadFiles[i].url;
                                    arrPreloadFiles[i].url = self._basePath + tempUrl;
                                }

                                // Load the resources with Require Js.
                                MathUtilities.Preloader.preload(arrPreloadFiles, {
                                        "bRequireCompatible": true,
                                        "scope": self
                                    },
                                    null,
                                    null,
                                    function() { // on complete
                                        self._onSuccess.call(self, new Tools.ErrorLogger({
                                            "strLogMsg": 'ZeusToolsApi :: _loadDependencies -- All dependencies loaded.'
                                        }), self);
                                    },
                                    function() {
                                        // on error
                                        self._onError.call(self, new Tools.ErrorLogger({
                                            "strLogMsg": "ZeusToolsApi :: _loadDependencies -- Fail while loading initial tool dependencies.",
                                            "strLogType": Tools.ErrorLogger.LogType.Error
                                        }));
                                    }
                                );
                            });
                    }
                });
            },
            function(errDetails) {
                self._onError.call(self, new Tools.ErrorLogger({
                    "strLogMsg": "ZeusToolsApi :: _loadDependencies -- Fail while loading initial tool dependencies.",
                    "strLogType": Tools.ErrorLogger.LogType.Error
                }));
            });

    };

    /**
     * Checks for the libraries that are loaded , and sees if any dependency file has been loaded yet, so we do not load that file again.
     * @method _checkExistingLibs
     * @private
     * @return
     */
    this._checkExistingLibs = function() {
        /*
        var jsDependencies = this._dependencies.jsDependencies;
        for (var key in jsDependencies) {
            mapValue = jsDependencies[key];
        }
        */
    };

    /**
     * Even handler that gets fired when any error occurs while handling and loading files. Calls the onError callback of DE if specified to it.
     *
     * @method _onError
     * @params {Object} errDetails Error object defining the error string, type of error , priority of error.
     * @params {Object} [objThis] This object that is used to get the scope of the object that returned with error.
     * @private
     */
    this._onError = function(errDetails, objThis) {
        // Call the onError call back
        if (this._options.onError) {
            this._options.onError.call(this._options.scope || this, [this._options.callbackData]);
        }
        this._onComplete();
    };

    /**
     * Even handler that gets fired when each dependencies and files gets loaded.
     *
     * @method _onSuccess
     * @params {Object} objLog Log object defining the log string and other log details.
     * @params {Object} [objThis] Optional this object that is used to get the scope of the object that returned with current log.
     * @private
     */
    this._onSuccess = function(objLog, objThis) {
        // Call the onComplete call back
        this._ToolsInitialized = true;

        if (this._LoadToolCalled === true) {
            var toolIDCounter;
            for (toolIDCounter in this._LoadToolParams) {
                this.loadTool(this._LoadToolParams[toolIDCounter]);
            }
        }

        if (this._options.onSuccess) {
            this._options.onSuccess.call(this._options.scope || this, [this._options.callbackData]);
        }
        this._onComplete();
    };

    /**
     * Even handler that gets fired when each dependencies and files gets loaded, or after any error occured. Calls the onComplete callback for DE if specified.
     *
     * @params {Object} objLog Log object defining the log string and other log details.
     * @params {Object} [objThis] Optional this object that is used to get the scope of the object that returned with current log.
     * @method _onComplete
     * @private
     */
    this._onComplete = function(objLog, objThis) {
        // Call the onComplete call back
        if (this._options.onComplete) {
            this._options.onComplete.call(this._options.scope || this, [this._options.callbackData]);
        }
    };

    /**
     * Gets called, when tools-api loads it's properties files listed as tools.json
     *
     * @method _onPropertiesLoaded
     * @private
     */
    this._onPropertiesLoaded = function(jsonProperties, isMinified) {
        Tools.prototype.ERROR_CODES = jsonProperties.ERROR_CODES || {};
        jsonProperties.tools.basePath = this._basePath;
        this._toolLoadController.parseToolData(jsonProperties.tools, isMinified);
    };

    // Call our initialiser or say construcor for the moment.
    this.initialize.call(this, toolOptions);

    /**
     * Parses the log msg object passted to it and serializes it in a specific format.
     * @method _getParsedLogMsg
     * @params {Object} logDetails LogMessage object.
     * @private
     */
    this._getParsedLogMsg = function(logDetails) {
        if (!logDetails) {
            return new Tools.ErrorLogger({
                "strLogMsg": "DEToolsAPI :: _parseLogMsg -- LogDetails not specified. "
            });
        }

        var arrLogObj = [],
            logObj,
            i;

        if (logDetails) {
            if (typeof logDetails.length !== 'undefined' && logDetails.length !== 0) {
                for (i = 0; i < logDetails.length; i++) {
                    logObj = logDetails[i];
                    arrLogObj.push(logObj.getOptions());
                }
            } else {
                arrLogObj.push(logDetails.getOptions());
            }
        }
        return arrLogObj;
    };
};

/**
 * Data structure for the classes of Tools Module.
 *
 * @class DsTool
 */
Tools.DsTool = function() {
    'use strict';

    return {
        "objTool": null,
        "strToolId": null,
        "strToolUrl": null,
        "bToolLoaded": false
    };
};

/**
 * Error logger, holds error related data structure.
 * @class ErrorLogger
 */
Tools.ErrorLogger = function(loggerOptions) {
    'use strict';

    var errorObj = {
            "strLogMsg": null,
            "strLogType": null,
            "strLogPriority": null,
            "strLogObj": null
        },
        setOptions;

    /**
     * Constructor
     * @constructor Sets the initial passed value to the closure objects.
     * @params {Object} errOptions The options to be set to the logger.
     */
    setOptions = function(loggerOptions) {
        if (loggerOptions) {
            if (loggerOptions.strLogType) {
                errorObj.strLogType = loggerOptions.strLogType;
            }

            if (loggerOptions.strLogMsg) {
                errorObj.strLogMsg = loggerOptions.strLogMsg;
            }

            if (loggerOptions.strLogPriority) {
                errorObj.strLogPriority = loggerOptions.strLogPriority;
            }

            if (loggerOptions.strLogObj) {
                errorObj.strLogObj = loggerOptions.strLogObj;
            }
        }
    };

    setOptions(loggerOptions);

    return {
        "setOptions": setOptions,
        "getOptions": function() {
            return errorObj;
        }
    };
};

/**
 * Log type property object.
 *
 * @property LogType
 * @static
 * @final
 */
Tools.ErrorLogger.LogType = {
    "Warn": 1,
    "Error": 2,
    "Log": 3
};


/**
 * Tools controller, capable of storing tool id, specific URL of tools and state of tool defining whether the tool is loaded or not.
 *
 * @class ToolLoadController
 */
Tools.ToolLoadController = function() {
    'use strict';

    var _mapToolProp = {},
        setOptions,
        key,
        getTool,
        isToolLoaded,
        getToolInfo,
        parseToolData;

    /**
     * Parses the tool data passed to it. And stores it in internal data structure.
     * @method parseToolData  Sets the initial passed value to the closure objects.
     * @params {Object} objToolData The cofiguration options to be set to the controller.
     */
    parseToolData = function(objToolData, isMinified) {
        if (!objToolData) {
            return;
        }
        var mapToolIds = objToolData.toolIds,
            mapToolUrl,
            objToolProp = null;
        if (isMinified) {
            mapToolUrl = objToolData.toolUrlMin;
        } else {
            mapToolUrl = objToolData.toolUrl;
        }
        for (key in mapToolIds) {
            objToolProp = new Tools.DsTool();
            objToolProp.strToolId = mapToolIds[key];
            objToolProp.strToolUrl = objToolData.basePath + mapToolUrl[key];
            setOptions(objToolProp);
        }
    };

    /**
     * Sets internal config objects. Also acts as a constructor.
     *
     * @method setOptions  Sets the initial passed value to the closure objects.
     * @params {Object} objToolOptions The cofiguration options to be set to the controller.
     */
    setOptions = function(objToolOptions) {
        if (!objToolOptions) {
            return;
        }

        var objToolProp = null;

        if (objToolOptions && objToolOptions.strToolId) {
            objToolProp = _mapToolProp[objToolOptions.strToolId];
            if (!objToolProp) {
                objToolProp = new Tools.DsTool();
            }
        } else {
            objToolProp = new Tools.DsTool();
        }

        if (objToolOptions.strToolId) {
            objToolProp.strToolId = objToolOptions.strToolId;
        }
        if (objToolOptions.strToolUrl) {
            objToolProp.strToolUrl = objToolOptions.strToolUrl;
        }
        if (typeof objToolOptions.bToolLoaded !== 'undefined') {
            objToolProp.bToolLoaded = objToolOptions.bToolLoaded;
        }
        if (objToolOptions.objTool) {
            objToolProp.objTool = objToolOptions.objTool;
        }

        // Add the new options into the map.
        _mapToolProp[objToolOptions.strToolId] = objToolProp;
    };

    /**
     * Returns the tool info object holding toolId, toolLoad status and actual tool object.
     *
     * @method getToolInfo
     * @param {String} Id of the tool whose object is needed.
     * @returns {Object} toolInfo The tool object holding toolId, toolLoad status and actual tool object.
     */
    getToolInfo = function(strToolId) {
        return _mapToolProp[strToolId];
    };

    /**
     * Returns the actual tool object.
     *
     * @method getTool
     * @param {String} Id of the tool whose object is needed.
     * @returns {Object} toolInfo The actual tool object that represents an app.
     */
    getTool = function(strToolId) {
        var objToolInfo = getToolInfo(strToolId);
        if (objToolInfo) {
            return objToolInfo.objTool;
        }
    };

    /**
     * Returns the tool load status for the toolId specified.
     *
     * @method isToolLoaded
     * @param {String} Id of the tool whose tool state is needed.
     * @returns {Object} True if tool is loaded with specific ID or returns false.
     */
    isToolLoaded = function(strToolId) {
        var toolObj,
            key;
        for (key in _mapToolProp) {
            toolObj = _mapToolProp[key];
            if (toolObj.strToolId === strToolId) {
                if (toolObj.bToolLoaded) {
                    return true;
                }
            }
        }
        return false;
    };

    return {
        "setOptions": setOptions,
        "getTool": getTool,
        "getToolInfo": getToolInfo,
        "parseToolData": parseToolData,
        "isToolLoaded": isToolLoaded
    };
};

Tools.DeApi = function() {
    /*global alert:false */
    /*eslint no-alert:0*/
    'use strict';

    return {
        "closeTool": function (objToolData) {
            if (window.DEToolsClient) {
                window.DEToolsClient.closeTool(objToolData);
            } else {
                alert('The feature has been implemented but, needs to communicate with the DE page to execute.');
            }
        },
        "hideTool": function (objToolData) {
            if (window.DEToolsClient && window.DEToolsClient.hideTool) {
                window.DEToolsClient.hideTool(objToolData);
            } else {
                alert('The feature will be available in the final release of the tool.');
            }
        },
        "saveImage": function (objToolData) {
            return window.DEToolsClient.saveImage(objToolData);
        },
        /*Dummy Names*/
        "restoreTool": function (objToolData) {
            if (window.DEToolsClient && window.DEToolsClient.restoreTool) {
                window.DEToolsClient.restoreTool(objToolData);
            } else {
                alert('The feature will be available in the final release of the tool.');
            }
        },
        "helpTool": function (objToolData) {
            if (window.DEToolsClient && window.DEToolsClient.helpTool) {
                window.DEToolsClient.helpTool(objToolData);
            } else {
                alert('The feature will be available in the final release of the tool.');
            }
        },

        "saveImageSuccess": function (objToolData) {
            return;
        },

        "saveImageError": function (objToolData) {
            return;
        },

        "saveImageComplete": function (objToolData) {
            return;
        },

        "saveState": function (objToolData) {
            if (window.DEToolsClient) {
                window.DEToolsClient.saveToolState(objToolData);
            } else {
                alert('The feature will be available in the final release of the tool.');
            }
        },

        "saveToolStateSuccess": function (objToolData) {
            return;
        },

        "saveToolStateError": function (objToolData) {
            return;
        },

        "saveToolStateComplete": function (objToolData) {
            return;
        }
    };
}();
