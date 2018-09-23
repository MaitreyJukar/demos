var Interactivities = function (playerOptions) {
    /**
    * Base path for the Interactivities.
    *
    * @property _basePath
    * @default ''
    * @private
    */
    this._basePath = '';

    /**
    * core static path of the static directory of core repository.
    *
    * @property _basePath
    * @default ''
    * @private
    */
    this._coreStaticPath = null;

    /**
    * Boolean which stores whether js is minified or not.
    *
    * @property _minify
    * @default true
    * @private
    */
    this._minify = true;

    /**
    * Stores the configuration for the player.
    *
    * @property _options
    * @private
    */
    this._options = {
        callbackData: null,
        onSuccess: null,
        onError: null,
        onComplete: null,
        debug: false,
        clientApi: null
    };

    /**
    * Stores the configuration for the interactivity till interactivity is being loaded.
    *
    * @property _interactiveOptions
    * @private
    */
    this._interactiveOptions = {};

    /**
    * States whether player is initialized.
    *
    * @property _isInitialized
    * @default `false`
    * @private
    */
    this._isInitialized = false;

    /**
    * Stores json of interactivities-id-map and css class
    *
    * @property _interactiviesIdMap
    * @default null
    * @private
    */
    this._interactiviesIdMap = null;


    /**
    * Interactivity controller object, hanlder of interactivity Id, url and its state defining interactivity is loaded or not.
    *
    * @property _interactivityLoadController
    * @default null
    * @private
    */
    this._interactivityLoadController = null;



    /**
    * Loads generic interactivity independent data
    * Acts as a constructor
    * @method initialize
    * @param {Object} playerOptions that holds basePath, callbackData, success, error, complete callbacks etc.
    * @param {String} [playerOptions.basePath] path of common files (not dependant on interactive type) to be loaded.
    * @param {Object} [playerOptions.callBackData] An optional Callback data. This value will be passed onto the callback functions as-is.
    * @param {Object} [playerOptions.success] Callback called on successful execution of the function.
    * @param {Object} [playerOptions.error] Callback called when error is encountered during function execution.
    * @param {Object} [playerOptions.complete] Callback called after execution of the function irrespective of success/error. This function will be called after success and error callbacks.
    * @constructor
    */
    this.initialize = function (playerOptions) {

        // basePath will be allowed to change once only. Check if it exists.        
        if (playerOptions && typeof playerOptions.basePath !== 'undefined' ) {
            this._basePath = playerOptions.basePath;
        }
        else {
            console.log('Error - Need to send options for player');
            return;
        }

        this._coreStaticPath='';
        if (playerOptions && playerOptions.coreStaticPath) {
            this._coreStaticPath = playerOptions.coreStaticPath;
        }
        if (playerOptions && playerOptions.minify !== undefined &&  playerOptions.minify !== null) {
            this._minify = playerOptions.minify;
        }
        this.setOptions(playerOptions);
        this._interactivityLoadController = new Interactivities.InteractivityLoadController();
        this._loadDependencies();
    };



    /**
    * Sets the internal configuration.
    * @method setOptions
    * @param {Object} playerOptions that holds callback function such as success, error, etc.
    * @private
    */
    this.setOptions = function (playerOptions) {

        if (playerOptions.success) {
            this._options.onSuccess = playerOptions.success;
        }

        if (playerOptions.error) {
            this._options.onError = playerOptions.error;
        }

        if (playerOptions.complete) {
            this._options.onComplete = playerOptions.complete;
        }
        if (playerOptions.debug) {
            this._options.debug = playerOptions.debug;
        }
        if (playerOptions.clientApi) {
            this._options.clientApi = playerOptions.clientApi;
        }

    };

    /**
    * Initializes variable required for preloader.
    *
    * @method _initializeVariables
    * @return
    * @private
    */
    this._initializeVariables = function () {
        var MathInteractives = {}

        MathInteractives.Common = {};

        window.MathInteractives = MathInteractives;
        return;
    };
    /**
    * Loads dependencies/common files that are required for the interactivities-api.
    *
    * @method _loadDependencies
    * @return
    * @private
    */
    this._loadDependencies = function () {

        var self = this,
            basepath = self._basePath, engineResourceList, resourceBasePath, EventTypes, successCallback, errorCallback, preloader;
        resourceBasePath = basepath + '/common/js/';

        if(this._minify === false){
            engineResourceList = [
            {
                "type": "css",
                "path": basepath + "/common/css/preloader.css"
            },
            {
                "type": "javascript",
                "path": resourceBasePath + "intialize.js",
            },
            {
                "type": "javascript",
                "path": resourceBasePath + "player/models/path.js",
            },
            {
                "type": "javascript",
                "path": resourceBasePath + "player/models/interactivity-preloader.js",
            },
            {
                "type": "javascript",
                "path": resourceBasePath + "player/views/interactivity-preloader.js",
            },
            {
                "type": "javascript",
                "path": basepath + "/common/templates/player/player.js",
            },
            {
                "type": "javascript",
                "path": resourceBasePath + "utils/models/debugger.js",
            }];
        }
        else{
            engineResourceList = [
            {
                "type": "css",
                "path": basepath + "/common/dist/css/preloader.min.css"
            },
            {
                "type": "javascript",
                "path": basepath + "/common/dist/js/interactive-engine-initialize.min.js"
            }];
        }
        Preloader = MathInteractives.Common.Preloader;
        EventTypes = Preloader.Event.Types;
        preloader = new Preloader({
            resourceList: engineResourceList

        });



        successCallback = function () {
            // Success Callback on initial file load
            MathInteractives.Debugger.DEBUG = self._options.debug;
            self._onSuccess.call(self, new Interactivities.ErrorLogger({
                'logMsg': 'ZeusInteractivitiesApi :: _loadDependencies -- All dependencies loaded.'
            }), self);
            self._setIsInitialized();

        };

        errorCallback = function () {
            // Error Callback
            self._onError.call(self, new Interactivities.ErrorLogger({
                'logMsg': 'DEInteractivitiesAPI :: _loadDependencies -- Fail while loading initial interactivity dependencies.',
                'logType': Interactivities.ErrorLogger.LogType.Error
            }));
        }

        preloader.off()
                 .on(EventTypes.PRELOAD_SUCCESS, successCallback)
                 .on(EventTypes.PRELOAD_ERROR, errorCallback);
        preloader.preload();
    };



    /**
    * Even handler that gets fired when each dependencies and files gets loaded.
    *
    * @method _onSuccess
    * @params {Object} log Log object defining the log string and other log details.
    * @params {Object} [thisObject] Optional this object that is used to get the scope of the object that returned with current log.
    * @private
    */
    this._onSuccess = function (log, thisObject) {

        var self = this;
        // Call the onComplete call back
        if (self._options.onSuccess) {

            self._options.onSuccess.call(self._options.scope || self, self._options.callbackData, self._getParsedLogMsg(log));
            self._onComplete(new Interactivities.ErrorLogger({
                'logMsg': 'ZeusInteractivitiesApi :: _loadDependencies -- Load dependencies completed.'
            }), self);
        }
    }



    /**
    * Even handler that gets fired when any error occurs while handling and loading files. Calls the onError callback of DE if specified to it.
    *
    * @method _onError
    * @params {Object} errDetails Error object defining the error string, type of error , priority of error.
    * @params {Object} thisObject This object that is used to get the scope of the object that returned with error.
    * @private
    */
    this._onError = function (errDetails, thisObject) {
        // Call the onError call back
        if (this._options.onError) {
            this._options.onError.call(this._options.scope || this, this._options.callbackData, this._getParsedLogMsg(errDetails));
        }
        this._onComplete(new Interactivities.ErrorLogger({
            'logMsg': 'ZeusInteractivitiesApi :: _loadDependencies -- Load dependencies completed.'
        }), self);
    }



    /**
    * Even handler that gets fired when each dependencies and files gets loaded, or after any error occured. Calls the onComplete callback for DE if specified.
    *
    * @params {Object} log Log object defining the log string and other log details.
    * @params {Object} [thisObject] Optional this object that is used to get the scope of the object that returned with current log.
    * @method _onComplete
    * @private
    */
    this._onComplete = function (log, thisObject) {
        // Call the onComplete call back        
        if (this._options.onComplete) {
            this._options.onComplete.call(this._options.scope || this, this._options.callbackData, this._getParsedLogMsg(log));
        }
    }



    /**
    * Loads the interactivity and stores the interactivity related data
    * @method loadInteractive
    * @param {Object} interactiveOptions that holds data like interactiveGuid, bAssessibilityAllowd, success, error, complete callbacks etc.
    * @param {String} interactiveOptions.interactiveGuid id of the Interactive to be loaded.
    * @param {String} [interactiveOptions.containerId] The element ID in which the interactive will be loaded.
    * @param {String} [interactiveOptions.bookId] Used for TTS.
    * @param {Number} [interactiveOptions.pageId] Used for TTS.
    * @param {Number} [interactiveOptions.pageId] Used for TTS.
    * @param {String} [interactiveOptions.lang] "en" for English and "es" for Spanish. If no value or incorrect value is passed then English will be loaded.
    * @param {Number} [interactiveOptions.initialTabIndex] This is the base tab index for this interactive.
    * @param {Object} [interactiveOptions.initialState] Optional initial state data of the interactive to be loaded. This can be the saveState data saved by the interactive earlier or can be pre-populated data that needs to be shown to the user.
    * @param {Boolean} [interactiveOptions.bAllowAccessibility] Optional boolean stating whether the interactive will be accessible or not.
    * @param {Object} [interactiveOptions.callBackData] An optional Callback data. This value will be passed onto the callback functions as-is.
    * @param {Object} [interactiveOptions.success] Callback called on successful execution of the function.
    * @param {Object} [interactiveOptions.error] Callback called when error is encountered during function execution.
    * @param {Object} [interactiveOptions.complete] Callback called after execution of the function irrespective of success/error. This function will be called after success and error callbacks.
    */
    this.loadInteractive = function (interactiveOptions) {

        var self = this,
            isInteractivitylLoaded = self._interactivityLoadController.isInteractivityLoaded(interactiveOptions.interactiveGuid),
            interactivityInfo = this._interactivityLoadController.getInteractivityInfo(interactiveOptions.interactiveGuid),
            log = null, ttsConfig = {}, bookId, pageId;
		
		// Setting Accessibility default to true
		if (interactiveOptions.bAllowAccessibility === 'undefined' || interactiveOptions.bAllowAccessibility === null) {
			interactiveOptions.bAllowAccessibility = true;
		}

        // Disables accessibility before loading the interactive. Used internally by interactive team.
        // Uncomment/comment the following line to disable/enable accessibility
		//interactiveOptions.bAllowAccessibility = false;

        if (!isInteractivitylLoaded) {
            var initialState = null,
                log = null;

            // interactive being loaded
            if (typeof self.getInteractiveOptions()[interactiveOptions.interactiveGuid] !== 'undefined') {
                log = new Interactivities.ErrorLogger({
                    'logMsg': 'ZeusInteractivitiesApi :: loadInteractive -- Interactive being loaded.',
                    'logType': Interactivities.ErrorLogger.LogType.Error
                });
                self._onInteractiveError.call(self, interactiveOptions, self._getParsedLogMsg(log));

                log = new Interactivities.ErrorLogger({
                    'logMsg': 'ZeusInteractivitiesApi :: loadInteractive -- Interactivity load call complete.'
                });
                self._onInteractiveComplete.call(self, interactiveOptions, self._getParsedLogMsg(log));

            }

            else {
                self._setInteractiveOptions(interactiveOptions);
                interactiveOptions = self.getInteractiveOptions()[interactiveOptions.interactiveGuid];


                //Setting customs props to load interactive depending on the options
                interactiveOptions.scope = self;
                interactiveOptions.folder = interactiveOptions.folderName;
                interactiveOptions.basePath = self._basePath;
                interactiveOptions.coreStaticPath = self._coreStaticPath;
                interactiveOptions.minify = self._minify;
                MathInteractives.Debugger.DEBUG = (typeof interactiveOptions.debug !== 'undefined') ? interactiveOptions.debug : self._options.debug;

                bookId = interactiveOptions.bookId || '4';
                pageId = interactiveOptions.pageId || '*';
                ttsConfig = { bookId: bookId, pageId: pageId }
                //Adding player template to the container
                var $playerContainer = $('<div>', {
                    'class': 'de-mathematics-interactive'
                }).appendTo($('#' + interactiveOptions.containerId))
                .html(MathInteractives.Common.Player.templates.player(ttsConfig).trim());
                var interactivityPreload = new MathInteractives.Common.Player.Models.InteractivityPreloader({ interactiveOptions: interactiveOptions }),
                    interactivityPreloadView = new MathInteractives.Common.Player.Views.InteractivityPreloader({
                        el: '#' + interactiveOptions.containerId + ' .preloader',
                        model: interactivityPreload
                    });

                interactivityPreload.initiatePreload();

            }


        }
        else {
            /*interactivity already loaded*/
            log = new Interactivities.ErrorLogger({
                'logMsg': 'ZeusInteractivitiesApi :: loadInteractive -- Interactivity already loaded.',
                'logType': Interactivities.ErrorLogger.LogType.Error
            });
            self._onInteractiveError.call(self, interactiveOptions, self._getParsedLogMsg(log));


            log = new Interactivities.ErrorLogger({
                'logMsg': 'ZeusInteractivitiesApi :: loadInteractive -- Interactivity load call complete.'
            });
            self._onInteractiveComplete.call(self, interactiveOptions, self._getParsedLogMsg(log));


            self._resetInteractiveOptions(interactiveOptions.interactiveGuid);
        }
    };



    /**
    * Sets the interactiveOptions passed during loadInteractivity call for interactivity being loaded.
    * @method _setInteractiveOptions
    * @param {Object} interactiveOptions that holds data like interactiveGuid, bAssessibilityAllowd, success, error, complete callbacks etc.
    * @private
    */
    this._setInteractiveOptions = function (interactiveOptions) {

        //convert to 2 level success callback
        interactiveOptions.successClientCallback = interactiveOptions.success;
        interactiveOptions.success = this.interactiveSuccess;
        
        interactiveOptions.errorClientCallback = interactiveOptions.error;
        interactiveOptions.error = this._interactiveError;

        this._interactiveOptions[interactiveOptions.interactiveGuid] = interactiveOptions;

    };



    /**
    * Sets the json of interactives-id-map.
    * @method getInteractiveOptions
    * @return {Object} returns object that holds options sends during the `loadInteractive` call.
    */
    this.getInteractiveOptions = function () {
        return this._interactiveOptions;
    };



    /**
    * Resets the interactiveOptions passed during loadInteractivity call for interactivity being loaded.
    * @method _resetInteractiveOptions
    * @private
    */
    this._resetInteractiveOptions = function (interactiveGuid) {
        delete this._interactiveOptions[interactiveGuid];
        //this._interactiveOptions = null;
    };



    /**
    * Sets the interactiveOptions passed during loadInteractivity call for interactivity being loaded.
    * @method interactiveSuccess
    * @param {Object} callbackData passed during the load interactivity call.
    * @param {Object} interactiveObj object of the interactivity loaded.
    * @private
    */
    this.interactiveSuccess = function (callbackData, interactiveObj, interactiveGuid) {

        var self = this,
            interactiveOptions = self.getInteractiveOptions()[interactiveGuid],
            log = null,
            isTwoStepLoad = callbackData.isTwoStepLoad;
            
        if(callbackData && callbackData.loadedStepNumber && callbackData.loadedStepNumber === 1){
        self._interactivityLoadController.setOptions({
            'interactivityId': interactiveOptions.interactiveGuid,
            'interactivityObj': interactiveObj,
            'isInteractivityLoaded': true
        });

        log = new Interactivities.ErrorLogger({
            'logMsg': 'ZeusInteractivitiesApi :: loadInteractive -- Interactivity loaded.'
        });
        
        interactiveObj.model.off('save-state').on('save-state', $.proxy(this.saveDataTriggered, this));
        interactiveObj.model.off('save-image').on('save-image', $.proxy(this.saveImageTriggered, this));
        
        log = new Interactivities.ErrorLogger({
            'logMsg': 'ZeusInteractivitiesApi :: loadInteractive -- Interactivity load call complete.'
        });

        self._onInteractiveComplete.call(self, interactiveOptions, self._getParsedLogMsg(log));
        }
        delete callbackData.isTwoStepLoad;
        interactiveOptions.successClientCallback(callbackData, self._getParsedLogMsg(log));

        if(isTwoStepLoad){
            return;
        }
        
        //should be last line of `interactiveSuccess` function
        self._resetInteractiveOptions(interactiveGuid);

    }



    /**
    * Even handler that gets fired when any error occurs while loading interactive. Calls the onError callback of DE if specified to it.
    *
    * @method _onInteractiveError
    * @params {Object} interactiveOptions object that holds options passed during load interactive call.
    * @params {Object} logDetails Error object defining the error string, type of error , priority of error.
    * @private
    */
    this._onInteractiveError = function (interactiveOptions, logDetails) {

        if (typeof interactiveOptions.error !== 'undefined' && interactiveOptions.error !== null) {
            interactiveOptions.error(interactiveOptions.callbackData, logDetails);
        }
    };

    
    /**
    * Even handler that gets fired when any error occurs while loading interactive. Calls the onError callback of DE if specified to it.
    *
    * @method _interactiveError
    * @params {Object} interactiveOptions object that holds options passed during load interactive call.
    * @params {Object} callbackData object that holds callback data.
    * @private
    */
    this._interactiveError = function (interactiveOptions, callbackData){
            interactiveOptions.errorClientCallback(callbackData);
    };

    /**
    * Even handler that gets fired when interactive is successfully loaded or after error occured during load interactive. Calls the onError callback of DE if specified to it.
    *
    * @method _onInteractiveComplete
    * @params {Object} interactiveOptions object that holds options passed during load interactive call.
    * @params {Object} logDetails Error object defining the error string, type of error , priority of error.
    * @private
    */
    this._onInteractiveComplete = function (interactiveOptions, logDetails) {

        if (typeof interactiveOptions.complete !== 'undefined' && interactiveOptions.complete !== null) {
            interactiveOptions.complete(interactiveOptions.callbackData, logDetails);
        }
    };

    /**
    * Calls getCurrentStateData
    * @method saveDataTriggered
    * @param event {Object} 
    * @private
    */
    this.saveDataTriggered = function (event) {

        var saveState = this.getCurrentStateData(event.interactiveGuid),
            clientApi = this._options.clientApi,
            self = this,
            interactiveGuid = event.interactiveGuid;

        var saveStateObject = {
            interactiveGuid : event.interactiveGuid,
            saveState : saveState,
            success : this._saveStateSuccessCallback,
            error : $.proxy(function(){this._saveStateErrorCallback(interactiveGuid)}, self),
            complete :this._saveStateCompleteCallback
        };

        //Calling DEApi funtion (if defined) to return the json object
        if (clientApi !== null && typeof clientApi !== 'undefined' && typeof clientApi.saveInteractiveState !== 'undefined') {
            clientApi.saveInteractiveState(saveStateObject);
        }
    }

    /**
    * Even handler that gets fired when current state of active interactivity is saved successfully.
    *
    * @method _saveStateSuccessCallback
    * @private
    */
    this._saveStateSuccessCallback = function (){
    //ToDo
    //will be listened in player.
    }
    
    /**
    * Even handler that gets fired when there is error in saving current state of active interactvity.
    *
    * @method _saveStateErrorCallback
    * @private
    */
    this._saveStateErrorCallback = function (interactiveGuid){
        var interactiveGuid, interactiveObject;
        interactiveGuid = interactiveGuid;
        interactiveObject = this._interactivityLoadController.getInteractivity(interactiveGuid);
        interactiveObject.model.trigger('save-state-error');
    }
    
    
    /**
    * Even handler that gets fired when there is success or error in save state.
    *
    * @method _saveStateCompleteCallback
    * @private
    */
    this._saveStateCompleteCallback = function (){
    //ToDo
    //will be listened in player.
    }


    /**
    * Gets base64 from the player
    * @method saveImageTriggered
    * @param event {Object} 
    * @private
    */
    this.saveImageTriggered = function (event) {
        var clientApi = this._options.clientApi;
        //Calling DEApi funtion (if defined) to return the json object
        if (clientApi !== null && typeof clientApi !== 'undefined' && typeof clientApi.saveImage !== 'undefined') {
            clientApi.saveImage(event.interactiveGuid, event.base64Image);
        }
    }



    /**
    * Unloads the specified interactive from the DOM
    * Removes any instances of data and events related to the interactive from the memory.
    *
    * @method unloadInteractive
    * @param {Object} interactivityData Config object that holds interactiveGuid and optional callbackData
    * @param {String} interactivityData.interactiveGuid interactiveGuid that represents ID of the interactiveObject to be unloaded.
    * @param {Object} [interactivityData.callBackData] An optional Callback data to be passed when interactive is getting unloaded.
    * @param {Object} [interactivityData.success] Callback called on successful execution of the function.
    * @param {Object} [interactivityData.error] Callback called when error is encountered during function execution.
    * @param {Object} [interactivityData.complete] Callback called after execution of the function irrespective of success/error. This function will be called after success and error callbacks.
    */
    this.unloadInteractive = function (interactivityData) {
        var interactivityInfo = this._interactivityLoadController.getInteractivityInfo(interactivityData.interactiveGuid);

        //Stopping TTS Reading
        if (MathInteractives.global.SpeechStream) {
            MathInteractives.global.SpeechStream.stopReading();
        }
        if (typeof interactivityInfo !== 'undefined' && interactivityInfo.isInteractivityLoaded) {


            if (interactivityInfo && interactivityInfo.interactivityObj) {

                /*remove interactivity from body*/
                $(interactivityInfo.interactivityObj.el).parent().parent().remove();

                this._interactivityLoadController.setOptions({
                    'interactivityId': interactivityData.interactiveGuid,
                    'isInteractivityLoaded': false,
                    'interactivityObj': null
                });

            }

            if (interactivityData.success) {
                interactivityData.success(interactivityData.callbackData, this._getParsedLogMsg(new Interactivities.ErrorLogger({
                    'logMsg': 'ZeusInteractivitiesAPI :: unloadInteractive -- Interactivity unloaded.',
                    'logType': Interactivities.ErrorLogger.LogType.Log
                })));
            }
        }
        else {
            if (interactivityData.error) {

                interactivityData.error(interactivityData.callbackData, this._getParsedLogMsg(new Interactivities.ErrorLogger({
                    'logMsg': 'ZeusInteractivitiesAPI :: unloadInteractive -- Interactivity not loaded.',
                    'logType': Interactivities.ErrorLogger.LogType.Error
                })));
            }
        }
        if (interactivityData.complete) {
            interactivityData.complete(interactivityData.callbackData, this._getParsedLogMsg(new Interactivities.ErrorLogger({
                'logMsg': 'ZeusInteractivitiesAPI :: unloadInteractive -- Interactivity unload completed.',
                'logType': Interactivities.ErrorLogger.LogType.Log
            })));
        }
    };



    /**
    * Parses the log msg object passted to it and serializes it in a specific format.
    * @method _getParsedLogMsg
    * @params {Object} logDetails LogMessage object.
    * @private
    */
    this._getParsedLogMsg = function (logDetails) {
        if (!logDetails) {
            return new Interactivities.ErrorLogger({
                'logMsg': 'ZeusInteractivitiesAPI :: _parseLogMsg -- LogDetails not specified. '
            });
        }

        var arrLogObj = [], logObj;
        if (logDetails) {
            if (logDetails.length !== undefined && logDetails.length != 0) {
                for (var i = 0; i < logDetails.length; i++) {
                    logObj = logDetails[i];
                    arrLogObj.push(logObj.getOptions());
                }
            }
            else {
                arrLogObj.push(logDetails.getOptions());
            }
        }

        return arrLogObj;
    }




    /**
    * Sets the `_isInitialized` to `true` once interactive-api is successfully initialized.
    * @method _setIsInitialized
    * @private
    */
    this._setIsInitialized = function () {
        this._isInitialized = true;
    };


    /**
    * Returns the loaded step number of the interactivity.
    * @method getLoadedStepNumber
    * @return {Number} '1' if overview tab is loded else returns '2' for other tabs.
    */
    this.getLoadedStepNumber = function (interactiveGuid) {
        var loadedStepNumber,
            interactiveOptions = this.getInteractiveOptions()[interactiveGuid],
            callbackData = interactiveOptions.callbackData;
        loadedStepNumber = callbackData.loadedStepNumber;
        return loadedStepNumber;
    };



    /**
    * States whether interactive-api is successfully initialized.
    * @method isInitialized
    * @return {Boolean} `true` if interactive-api is successfully initialized
    */
    this.isInitialized = function () {
        return this._isInitialized;
    };


    /**
    * Returns the object of the interactivity
    *
    * @method getCurrentStateData
    * @param {String} interactiveGuid interactiveGuid that represents ID of the interactiveObject to be unloaded.
    * @return {Object} Any kind of save data in JSON format.
    */
    this.getCurrentStateData = function (interactiveGuid) {

        var interactiveInfo = this._interactivityLoadController.getInteractivityInfo(interactiveGuid),
            initialState = null,
            currentState = {};
        if (typeof interactiveInfo !== 'undefined') {

            if (typeof interactiveInfo.interactivityObj.interactiveModel.getCurrentStateData === 'undefined') {
                return interactiveInfo.interactivityObj.interactiveModel.getCurrentStateData;
            }
            else {
                initialState = interactiveInfo.interactivityObj.interactiveModel.getCurrentStateData();
                currentState = $.parseJSON(initialState);
                return currentState;
            }
        }
        else {
            return interactiveInfo;
        }
    };

    // Call our initialiser or constructor
    this.initialize.call(this, playerOptions);
};



/**
* Error logger, holds error related data structure.
* @class ErrorLogger
*/
Interactivities.ErrorLogger = function (loggerOptions) {

    /**
    * Constructor
    * @constructor Sets the initial passed value to the closure objects.
    * @params {Object} errOptions The options to be set to the logger.
    */
    var setOptions = function (loggerOptions) {
        if (loggerOptions) {
            if (loggerOptions.logType) {
                errorObj.logType = loggerOptions.logType;
            }

            if (loggerOptions.logMsg) {
                errorObj.logMsg = loggerOptions.logMsg;
            }

            if (loggerOptions.logPriority) {
                errorObj.logPriority = loggerOptions.logPriority;
            }

            if (loggerOptions.logObj) {
                errorObj.logObj = loggerOptions.logObj;
            }
        }
    }

    var errorObj = {
        logMsg: null,
        logType: null,
        logPriority: null,
        logObj: null
    };


    setOptions(loggerOptions);

    return {
        setOptions: setOptions,
        getOptions: function () {
            return errorObj;
        }
    };
}

/**
* Log type property object.
*
* @property LogType
* @static
* @final
*/
Interactivities.ErrorLogger.LogType = {
    'Warn': 1,
    'Error': 2,
    'Log': 3
}




/**
* Interactivities controller, capable of storing interactivity id, specific URL of Interactivities and state of interactivity defining whether the interactivity is loaded or not.
*
* @class InteractivityLoadController
*/
Interactivities.InteractivityLoadController = function () {
    var _mapInteractivityProp = {};

    /**
    * Parses the Interactivity data passed to it. And stores it in internal data structure.
    * @method parseInteractivityData  Sets the initial passed value to the closure objects.
    * @params {Object} interactivityData The cofiguration options to be set to the controller.
    */
    var parseInteractivityData = function (interactivityData) {
        if (!interactivityData) {
            return;
        }
        var mapInteractivityIds = interactivityData.interactivityIds,
        mapInteractivityUrl = interactivityData.interactivityUrl,
        interactivityProp = null;


        for (var key in mapInteractivityIds) {
            interactivityProp = new Interactivities.InteractivityData();
            interactivityProp.interactivityId = mapInteractivityIds[key];
            /*interactivityProp.interactivityUrl = interactivityData.basePath + mapInteractivityUrl[key];*/
            setOptions(interactivityProp);
        }

    }

    /**
    * Sets internal config objects. Also acts as a constructor.
    *
    * @method setOptions  Sets the initial passed value to the closure objects.
    * @params {Object} interactivityOptions The cofiguration options to be set to the controller.
    */
    var setOptions = function (interactivityOptions) {
        if (!interactivityOptions) {
            return;
        }

        var interactivityProp = {};

        if (interactivityOptions && interactivityOptions.interactivityId) {
            interactivityProp = _mapInteractivityProp[interactivityOptions.interactivityId];
            if (!interactivityProp) {
                interactivityProp = new Interactivities.InteractivityData();
            }
        }
        else {
            interactivityProp = new Interactivities.InteractivityData();
        }

        if (interactivityOptions.interactivityId) {
            interactivityProp.interactivityId = interactivityOptions.interactivityId;
        }
        /*if (interactivityOptions.interactivityUrl) {
            interactivityProp.interactivityUrl = interactivityOptions.interactivityUrl;
        }*/
        if (interactivityOptions.isInteractivityLoaded !== undefined) {
            interactivityProp.isInteractivityLoaded = interactivityOptions.isInteractivityLoaded;
        }
        if (interactivityOptions.interactivityObj !== undefined) {
            interactivityProp.interactivityObj = interactivityOptions.interactivityObj;
        }

        // Add the new options into the map.
        _mapInteractivityProp[interactivityOptions.interactivityId] = interactivityProp;

    }




    /**
	 * Returns the interactivity info object holding interactivityId, interactivityLoad status and actual interactivity object.
	 *
	 * @method getInteractivityInfo  
	 * @param {String} Id of the interactivity whose object is needed.
	 * @returns {Object} interactivityInfo The interactivity object holding interactivityId, interactivityLoad status and actual interactivity object.
	 */
    var getInteractivityInfo = function (interactivityId) {
        return _mapInteractivityProp[interactivityId];
    }

    /**
	 * Returns the actual interactivity object.
	 *
	 * @method getInteractivity  
	 * @param {String} Id of the interactivity whose object is needed.
	 * @returns {Object} interactivityInfo The actual interactivity object that represents an interactivity.
	 */
    var getInteractivity = function (interactivityId) {
        var interactivityInfo = getInteractivityInfo(interactivityId);
        if (interactivityInfo) {
            return interactivityInfo.interactivityObj;
        }
    }

    /**
	 * Returns the interactivity load status for the interactivityId specified.
	 *
	 * @method isInteractivityLoaded  
	 * @param {String} Id of the interactivity whose interactivity state is needed.
	 * @returns {Boolean} `true` if interactivity is loaded with specific ID or returns `false`.
	 */
    var isInteractivityLoaded = function (interactivityId) {
        var key = null,
            interactivityObj = null;

        for (key in _mapInteractivityProp) {
            interactivityObj = _mapInteractivityProp[key];
            if (interactivityObj.interactivityId === interactivityId) {
                if (interactivityObj.isInteractivityLoaded) {
                    return true;
                }
            }
        }

        return false;
    }


    return {
        setOptions: setOptions,
        getInteractivity: getInteractivity,
        getInteractivityInfo: getInteractivityInfo,
        parseInteractivityData: parseInteractivityData,
        isInteractivityLoaded: isInteractivityLoaded
    }
}



/**
* Data structure for the classes of Interactivities Module.
*
* @class InteractivityData
*/
Interactivities.InteractivityData = function () {
    return {
        interactivityObj: null,
        interactivityId: null,
        /*strToolUrl: null,*/
        isInteractivityLoaded: false
    }
}