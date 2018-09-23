define("preloader", function () {
    var crossOriginCommuterFrame = document.createElement('iframe');
    var URLCallBackMap = {};
    crossOriginCommuterFrame.id = 'de-mathematics-interactive-cross-origin-commuter-frame';
    $(crossOriginCommuterFrame).css({
        position: 'absolute',
        top: '0px',
        left: '-999999px'
    });
    crossOriginCommuterFrame.onload = function () {
        crossOriginCommuterFrame.loaded = true;
    }
    $('body')[0].appendChild(crossOriginCommuterFrame);
    /**
    * This function is binded with 'message' event on window. It is fired when window.postMessage is called from iframe's cross domain src
    *
    * @method onBase64Recieved
    * @private
    */
    var onBase64Recieved = function (event) {
        var data = JSON.parse(event.originalEvent.data);
        if (data.nameSpace !== 'MathInteractives') {
            return;
        }
        var imageURL = data.url;
        var imageBase64 = data.imageBase64;
        var callBack = URLCallBackMap[imageURL];
        delete URLCallBackMap[imageURL];
        if (data.success) {
            callBack.success(imageBase64);
        } else {
            callBack.error(imageBase64);
        }
        return;
    };
    /**
    * Accepts cross origin image URL and returns its base64 string in the call back function. 
    *
    * @method getBase64FromImageURL
    * @public
    * @param {String} [imageURL] URL of the image whose base64 string is reuired
    * @param {function} [completeCallBack] Call back function that is called when base64 generation is complete with base64 string as an arguement.
    */
    MathInteractives.Common.Utilities.getBase64FromImageURL = function getBase64FromImageURL(imageURL, successCallBack, errorCallBack) {
        var thisRef;
        if (crossOriginCommuterFrame.loaded === true) {
            var callBack = {
                success: successCallBack,
                error: errorCallBack
            };
            URLCallBackMap[imageURL] = callBack;
            crossOriginCommuterFrame.contentWindow.postMessage(imageURL, '*');
        } else {
            crossOriginCommuterFrame.onload = function () {
                crossOriginCommuterFrame.loaded = true;
                getBase64FromImageURL(imageURL, successCallBack, errorCallBack);
            }
        }
        return;
    };
    $(window).on('message', onBase64Recieved);

    MathInteractives.Common.Preloader = (function () {
        'use strict';

        /**
        * Generic utility for preloading resources
        * 
        * @class Preloader
        * @namespace MathInteractives
        * @extends Backbone.Model
        * @param {Array} fileList An array of objects containing the list of files to preload.
        *   Each item should be a JSON like `{ url: '', type: ENUMERATION, forceLoad: true/false }`
        * @param {Object} [options] A JSON containing various options for preloading the files
        *   @param {Boolean} [options.sandboxed] If set to `true` the files will be preloaded in a sandboxed `iframe`.
        * @param {Function} [beforeStartCallback] This callback is triggered just before the preloading starts.
        * @param {Function} [progressCallback] Triggered after progress of each file preload.
        * @param {Function} [completeCallback] Triggered after preloading completes successfully.
        * @param {Function} [errorCallback] Triggered when there's an error preloading a file.
        */
        var Preloader = Backbone.Model.extend(
        {
            defaults: function () {
                return {
                    _options: null,

                    /**
                    * bool to identify if the preloader is backbone compatible, so that require,define config options can be used to load the files.
                    * 
                    * @property _bRequireCompatible
                    * @private
                    * @type boolean
                    * @default false
                    */
                    _bRequireCompatible: true,


                    /**
                    * Array of the file list to be preloaded.
                    * 
                    * @property _fileList
                    * @private
                    * @type Array
                    * @default []
                    */
                    _fileList: [],

                    /**
                    * Array of the file list to be preloaded.
                    * 
                    * @property _fileList
                    * @private
                    * @type Array
                    * @default []
                    */
                    _fileListMap: {},

                    /**
                    * Current file number that is preloaded.
                    * 
                    * @property _fileList
                    * @private
                    * @type Number
                    * @default 0
                    */
                    _currentFileNumber: 0,

                    /**
                    * Total file count to be preloaded.
                    * 
                    * @property _totalFileCount
                    * @private
                    * @type Number
                    */
                    _totalFileCount: 0,

                    _preloadContainer: null,

                    _preloadContainerDocument: null,

                    _sandboxReady: false,

                    /**
                    * Before file preload start event.
                    * 
                    * @method onbeforestart
                    * @event
                    * @param {Number} totalFileCount Total file count.
                    */
                    onbeforestart: null,

                    /**
                    * File preload progress event.
                    * 
                    * @method onprogress
                    * @event
                    * @param {Object} currentFile The original preload file JSON.
                    * @param {Number} currentFileNumber The current file number of progress.
                    * @param {Number} totalFileCount Total file count.
                    * @param {Number} percentComplete Percentage preloading completed.
                    */
                    onprogress: null,

                    /**
                    * File preload complete event.
                    * 
                    * @method oncomplete
                    * @event
                    * @param {Number} totalFileCount Total file count.
                    */
                    oncomplete: null,

                    /**
                    * File preload error event.
                    * 
                    * @method onerror
                    * @event
                    * @param {Object} currentFile The original preload file JSON.
                    * @param {Number} currentFileNumber The current file number of progress.
                    * @param {Number} totalFileCount Total file count.
                    * @param {Number} percentComplete Percentage preloading completed.
                    */
                    onerror: null,

                    scope: this,

                    /**
                    * Stores Json Data
                    * 
                    * @property jsonData
                    * @type {object}
                    * @default []
                    * 
                    */
                    jsonData: [],

                    /**
                   * Stores Pronunciation Data
                   * 
                   * @property pronunciationData
                   * @type {object}
                   * @default []
                   * 
                   */
                    pronunciationData: [],

                    /**
                    * Stores Image Base64 Mapped on URL
                    * 
                    * @property imageBase64Map
                    * @type {object}
                    * @default {}
                    * 
                    */
                    _imageBase64Map: {},

                    /**
                    * Stores call back function mapped on image url that is to be called when base64 of that url is recieved
                    * 
                    * @property _URLCallBackMap
                    * @type {object}
                    * @default {}
                    * 
                    */
                    _URLCallBackMap: {}

                }
            },


            /**
            * Before file preload start event. This method is called internally which in
            * turn triggers any user defined event listeners.
            * 
            * @method _onbeforestart
            * @private
            * @event
            * @param {Number} totalFileCount Total file count.
            */
            _onbeforestart: function _onbeforestart(totalFileCount) {
                var beforeStartCallback = this.get('onbeforestart'), scope = this.get("scope");

                if (beforeStartCallback) {
                    beforeStartCallback.apply(scope || this, arguments);
                }

                return;
            },

            /**
            * File preload progress event. This method is called internally which in
            * turn triggers any user defined event listeners.
            * 
            * @method _onprogress
            * @private
            * @event
            * @param {Object} currentFile The original preload file JSON.
            * @param {Number} currentFileNumber The current file number of progress.
            * @param {Number} totalFileCount Total file count.
            * @param {Number} percentComplete Percentage preloading completed.
            */
            _onprogress: function _onprogress(currentFile, currentFileNumber, totalFileCount, percentComplete) {
                var progressCallback = this.get('onprogress'), scope = this.get("scope");
                if (progressCallback) {
                    progressCallback.apply(scope || this, arguments);
                }

                return;
            },

            /**
            * File preload complete event. This method is called internally which in
            * turn triggers any user defined event listeners.
            * 
            * @method _oncomplete
            * @private
            * @event
            * @param {Number} totalFileCount Total file count.
            */
            _oncomplete: function _oncomplete(totalFileCount) {
                $(window).off('message.MathInteractivePreloader');

                var completeCallback = this.get('oncomplete'), scope = this.get("scope");

                if (completeCallback) {
                    completeCallback.apply(scope || this, [this.get('jsonData'), this.get('_imageBase64Map'), this.get('pronunciationData')]);
                }

                return;
            },

            /**
            * File preload error event. This method is called internally which in
            * turn triggers any user defined event listeners.
            * 
            * @method _onerror
            * @private
            * @event
            * @param {Object} currentFile The original preload file JSON.
            * @param {Number} currentFileNumber The current file number of progress.
            * @param {Number} totalFileCount Total file count.
            * @param {Number} percentComplete Percentage preloading completed.
            */
            _onerror: function _onerror(currentFile, currentFileNumber, totalFileCount, percentComplete) {
                var errorCallback = this.get('onerror'), scope = this.get("scope");
                if (currentFile.url) {
                    MathInteractives.Debugger.log('Preloader :: Error:: ' + currentFile.url);
                }
                else {
                    MathInteractives.Debugger.log('Preloader :: Error:: Issue in A file');
                }
                if (errorCallback) {
                    errorCallback.apply(scope || this, arguments);
                }

                return;
            },

            initialize: function initialize(fileList, options, beforeStartCallback, progressCallback, completeCallback, errorCallback, basePath) {
                this.setOptions(options);

                var i = null,
                totalFileCount = null,
                fileListMap = {},
                currentFile = null;

                this.set('_fileList', fileList);

                totalFileCount = fileList.length;
                this.set('_totalFileCount', totalFileCount);

                for (i = 0; i < totalFileCount; i++) {
                    currentFile = fileList[i];
                    currentFile.index = i;
                    fileListMap[currentFile.url] = i;
                }

                this.set('_fileListMap', fileListMap);

                this.set('onbeforestart', beforeStartCallback);
                this.set('onprogress', progressCallback);
                this.set('oncomplete', completeCallback);
                this.set('onerror', errorCallback);

                if (!crossOriginCommuterFrame.src) {
                    crossOriginCommuterFrame.src = basePath + '/common/image-to-base64-converter.htm';
                }
                return;
            },

            /**
            * This function is binded with 'message' event on window. It is fired when window.postMessage is called from iframe's cross domain src
            *
            * @method _onBase64Recieved
            * @private
            */
            _onBase64Recieved: function (event) {
                var data = JSON.parse(event.originalEvent.data);
                var imageURL = data.url;
                var imageBase64 = data.imageBase64;
                var URLCallBackMap = this.get('_URLCallBackMap');
                var callBack = URLCallBackMap[imageURL];
                delete URLCallBackMap[imageURL];
                if (data.success) {
                    callBack.success(imageBase64);
                } else {
                    callBack.error(imageBase64);
                }

                return;
            },

            /**
            * Accepts cross origin image URL and returns its base64 string in the call back function. 
            *
            * @method _getBase64FromImageURL
            * @private
            * @param {String} [imageURL] URL of the image whose base64 string is reuired
            * @param {function} [completeCallBack] Call back function that is called when base64 generation is complete with base64 string as an arguement.
            */
            _getBase64FromImageURL: function (imageURL, successCallBack, errorCallBack) {
                var thisRef;
                if (this._crossOriginCommuterFrame.loaded === true) {
                    var URLCallBackMap = this.get('_URLCallBackMap');
                    var callBack = {
                        success: successCallBack,
                        error: errorCallBack
                    };
                    URLCallBackMap[imageURL] = callBack;
                    this._crossOriginCommuterFrame.contentWindow.postMessage(imageURL, '*');
                } else {
                    thisRef = this;
                    this._crossOriginCommuterFrame.onload = function () {
                        thisRef._crossOriginCommuterFrame.loaded = true;
                        thisRef._getBase64FromImageURL(imageURL, successCallBack, errorCallBack);
                    }
                }

                return;
            },

            setOptions: function setOptions(options) {
                options = options || this.get('_options');
                options.sandboxed = options.sandboxed || false;

                // Make the preloader require js compatible.
                this.set("_bRequireCompatible", !!options.bRequireCompatible);
                this.set('_options', options);
                if (options.scope) {
                    this.set('scope', options.scope);
                }
                return;
            },

            getOptions: function getOptions() {
                var options = this.get('_options') || {};
                return options;
            },

            /**
            * Calling this method starts the preloading of resources.
            * 
            * @method preload
            */
            preload: function preload() {

                this._createPreloadContainer();
                this._preloadProgress();

                return;
            },

            _createPreloadContainer: function _createPreloadContainer() {
                var preloader = this,
                preloadContainer = preloader.get('_preloadContainer'),
                preloadContainerDocument = null,
                options = preloader.getOptions(),
                sandboxReady = false;

                if (preloadContainer !== null) {
                    var preloadParent = preloadContainer.parentNode;
                    preloadParent.removeChild(preloadContainer);
                }

                if (options.sandboxed) {
                    preloadContainer = document.createElement('iframe');
                    preloadContainer.setAttribute('style', 'position: absolute; top: 0px; left: -999999px; width: 1px, height: 1px;');
                }
                else {
                    preloadContainer = document.getElementsByTagName('head')[0];
                    preloadContainerDocument = document;
                }

                //preloadContainer = document.appendChild(preloadContainer);

                if (options.sandboxed) {

                    preloadContainer.onload = function () {
                        sandboxReady = true;
                        preloadContainerDocument = preloadContainer.contentWindow.document;
                        preloadContainer = preloadContainerDocument.body;


                        preloader.set('_preloadContainer', preloadContainer);
                        preloader.set('_preloadContainerDocument', preloadContainerDocument);
                        preloader.set('_sandboxReady', sandboxReady);

                        preloader._preloadProgress();
                        return;
                    };

                    preloadContainer.src = 'about:blank';
                }

                preloader.set('_preloadContainer', preloadContainer);
                preloader.set('_preloadContainerDocument', preloadContainerDocument);
                preloader.set('_sandboxReady', sandboxReady);

                return;
            },

            /**
            * This is called internally to record the preloading progress, load
            * the next resource and trigger any callback events for the same.
            * 
            * @method _preloadProgress
            * @private
            */
            _preloadProgress: function _preloadProgress(fileItem, hasError) {
                hasError = hasError || false;

                if (!hasError) {
                    if (fileItem)
                        MathInteractives.Debugger.log('Preloader :: Success :: ' + fileItem.url);
                }
                var preloader = this,
                options = preloader.getOptions(),
                sandboxReady = preloader.get('_sandboxReady'),
                currentFileNumber = preloader.get('_currentFileNumber'),
                fileList = preloader.get('_fileList'),
                totalFileCount = preloader.get('_totalFileCount'),
                fileIndex = null,
                percentComplete = 0,
                currentFile = null;

                if (options.sandboxed && !sandboxReady) {
                    return;
                }

                fileItem = fileItem || null;

                if (fileItem === null) {
                    preloader._onbeforestart(totalFileCount);
                }
                else {
                    currentFileNumber++;
                    preloader.set('_currentFileNumber', currentFileNumber);

                    percentComplete = (currentFileNumber * 100) / totalFileCount;

                    if (hasError) {
                        preloader._onerror(fileItem, currentFileNumber, totalFileCount, percentComplete);
                        return;
                    }
                    else {
                        Preloader.preloadedFiles[fileItem.url] = true;
                        preloader._onprogress(fileItem, currentFileNumber, totalFileCount, percentComplete);
                    }
                }

                if (percentComplete === 100) {
                    preloader._oncomplete(totalFileCount);
                }
                else {
                    fileIndex = currentFileNumber;
                    currentFile = fileList[fileIndex];
                    preloader._preloadFile(currentFile);
                }

                return;
            },

            /**
            * Called internally to load an individual file.
            * 
            * @method _preloadFile
            * @private
            */
            _preloadFile: function _preloadFile(fileItem) {
                var FileTypes = Preloader.FileTypes,
                preloader = this,
                preloadContainer = preloader.get('_preloadContainer'),
                preloadContainerDocument = preloader.get('_preloadContainerDocument'),
                type = fileItem.type,
                url = fileItem.url,
                forceLoad = fileItem.forceLoad,
                domElement = null,
                srcAttributeName = 'src',
                removeElementAfterPreload = true,
                bRequireCompatible = this.get("_bRequireCompatible");

                if (fileItem !== null) {
                    if (Preloader.preloadedFiles[fileItem.url] && !fileItem.forceLoad && type !== FileTypes.JSON) {
                        // The file is already preloaded and this is not a force load
                        preloader._preloadProgress(fileItem);
                        return;
                    }
                }

                switch (type) {

                    case FileTypes.CSS:
                        {
                            srcAttributeName = 'href';
                            domElement = preloadContainerDocument.createElement('link');
                            domElement.setAttribute('rel', 'stylesheet');
                            domElement.type = 'text/css';

                            removeElementAfterPreload = false;

                            break;
                        }

                    case FileTypes.JS:
                        {
                            domElement = preloadContainerDocument.createElement('script');
                            domElement.type = 'text/javascript';
                            break;
                        }

                    case FileTypes.IMAGE:
                        {
                            domElement = preloadContainerDocument.createElement('img');
                            domElement.setAttribute('style', 'position: absolute; top: 0px; left: -999999px;');

                            break;
                        }
                    case FileTypes.FONT:
                        {
                            domElement = preloadContainerDocument.createElement('span');
                            domElement.innerHTML = 'Dummy Text';
                            preloadContainer = preloadContainerDocument.getElementsByTagName('body')[0];
                            domElement.setAttribute('style', 'position: absolute; top: 0px; left: -999999px; font-family:' + fileItem.name);
                            break;
                        }
                    case FileTypes.OTHER:
                    default:
                        {
                            domElement = preloadContainerDocument.createElement('embed');
                            removeElementAfterPreload = true;
                            break;
                        }
                }

                var bCurFileRequireCompatible;
                if (fileItem.bRequireCompatible === undefined) {
                    bCurFileRequireCompatible = this.get("_bRequireCompatible");
                }
                else {
                    bCurFileRequireCompatible = fileItem.bRequireCompatible;
                }

                if (FileTypes.IMAGE == type) {

                    if (String(url).substring(url.length - 3).toLocaleLowerCase() == "gif" && MathInteractives.Common.Utilities.Models.BrowserCheck.isFirefox) {

                        var oImage = new Image();
                        oImage = $('<img />', {
                            src: url,
                            style: 'display:none'
                        });
                        var oObjImage = oImage.get(0);
                        $('body').append(oImage);

                        oObjImage.onload = function () {
                            $(this).remove();
                        }

                    }

                }

                if (FileTypes.JS == type && bCurFileRequireCompatible) {

                    // remove the extension js, as it does not need a js extension.
                    //var strCleanUrl = url.split(".js")[0]; <-- commented because for cross server loading we need to give .js extension in module name
                    var strCleanUrl = url;
                    // @param preloadedJsModule is not always the jsModule that is loaded inside require, need to use requireConfig path for making this possible
                    require([strCleanUrl], function (preloadedJsModule) {
                        if (removeElementAfterPreload) {
                            $(domElement).remove();
                        }
                        preloader._preloadProgress(fileItem);
                        return;
                        // This gets called when preloaderModule js is loaded, and the param is the returned data from that function.
                    },
                    $.proxy(this._onerror, this)
                    );
                }
                else if (type === FileTypes.CSS) {
                    ///as link onload is not supported on cross bowser; ajax request has been sent

                    this.ajaxTransport(url, function () {
                        if (removeElementAfterPreload) {
                            $(domElement).remove();
                        }

                        preloader._preloadProgress(fileItem);
                    },
					function () {
					    preloader._preloadProgress(fileItem, true);
					});

                    domElement.setAttribute(srcAttributeName, url);


                }
                else if (type === FileTypes.FONT || type === FileTypes.CUR) {

                    this.ajaxTransport(url, function () {
                        if (removeElementAfterPreload) {
                            $(domElement).remove();
                        }


                        preloader._preloadProgress(fileItem);
                        domElement.setAttribute(srcAttributeName, url);
                    },
                       function () {
                           preloader._preloadProgress(fileItem, true);
                       }, true);
                }
                else if (type === FileTypes.JSON) {
                    this.ajaxTransport(url, function (response) {

                        if (removeElementAfterPreload) {
                            $(domElement).remove();
                        }

                        var jsonData = response;
                        var json = $.parseJSON(jsonData);
                        if (typeof response === 'object') {
                            json = jsonData;
                        }
                        
                        if (fileItem.pron) {
                            preloader.get('pronunciationData').push(json);
                            preloader.set('pronunciationData', preloader.get('pronunciationData'));
                        }
                        else {
                            preloader.get('jsonData').push(json);
                            preloader.set('jsonData', preloader.get('jsonData'));
                        }
                        preloader._preloadProgress(fileItem);

                    },
						function () {
						    preloader._preloadProgress(fileItem, true);
						});
                }
                else if (type === FileTypes.IMAGE) {
                    if (fileItem.isBase64) {
                        var imageBase64Map = this.get('_imageBase64Map');
                        MathInteractives.Common.Utilities.getBase64FromImageURL(url, function (imageBase64) {//on success
                            imageBase64Map[url] = imageBase64;
                            if (removeElementAfterPreload) {
                                $(domElement).remove();
                            }
                            preloader._preloadProgress(fileItem);
                            return;
                        }, function () {//on error
                            preloader._preloadProgress(fileItem, true);
                            return;
                        });
                    }
                    else {
                        domElement.onload = function () {
                            if (removeElementAfterPreload) {
                                $(domElement).remove();
                            }
                            preloader._preloadProgress(fileItem);
                        };
                        domElement.onerror = function () {
                            preloader._preloadProgress(fileItem, true);
                            return;
                        };
                        domElement.setAttribute(srcAttributeName, url);

                    }


                }
                else {
                    domElement.onload = function () {
                        if (removeElementAfterPreload) {
                            $(domElement).remove();
                        }

                        preloader._preloadProgress(fileItem);
                        return;
                    };

                    domElement.onerror = function () {
                        preloader._preloadProgress(fileItem, true);
                        return;
                    };
                    domElement.setAttribute(srcAttributeName, url);
                }




                preloadContainer.appendChild(domElement);


                return;
            },

            /**
            * Send request to fetch the resources. Here sends and XDomainRequest if MSIE9 else an ajax request
            *
            * @method ajaxTransport
            * @param {string} url url of resource
            * @param {object} successCallback Callback on success of request
            * @param {object} errorCallback Callback on error of request
            * @param {bool} handleForIE9 Font handling for IE9
            * @public
            */
            ajaxTransport: function (url, successCallback, errorCallback, handleForIE9) {
                var currentLocation = location.protocol + '//' + location.host,
                    passedLocation = url.substr(0, url.indexOf('/', 7));
                if (this._isMSIE9() && XDomainRequest && url.indexOf('http') > -1 && currentLocation !== passedLocation) {
                    var xdr = new XDomainRequest();
                    xdr.open("get", url);

                    xdr.onload = function () {
                        successCallback(xdr.responseText);
                    };
                    xdr.onerror = function () {
                        errorCallback();
                    }
                    xdr.send();
                }
                else {
                    //In IE9 the @font-face used in the CSS, preloads the fonts before its used, 
                    //hence we do not need to send a ajax request to load the font and we call the success for the font.
                    //this is done for local machine fetch as it always goes in error callback

                    // Similarly for .cur files, as it do not go inside success callback even if the response code if 200/304
                    if (this._isMSIE9() && handleForIE9 === true) {
                        successCallback();
                        return;
                    }
                    $.ajax({
                        url: url,
                        success: function (json) {
                            successCallback(json);
                        },
                        error: function () {
                            errorCallback();
                        }

                    });
                }
            },

            /* 
            * Check for MSIE version 9.0
            * @method _isMSIE9
            * @private
            * @return {bool} true if MSIE9            */
            _isMSIE9: function () {
                if (navigator.userAgent.toLowerCase().indexOf('msie 9') > -1) {
                    return true;
                }
                return false;
            }


        },

        {
            /**
            * Enumeration of file types.
            * 
            * @property FileTypes
            * @type Object
            * @static
            * @final
            */
            /**
            * Enumeration of file types.
            * 
            * @property FileTypes
            * @type Object
            * @static
            * @final
            */
            FileTypes: {

                /**
                * Use this if the type of file to be preloaded is unknown or does not match any of the other specified types.
                * 
                * @property OTHER
                * @type Number
                * @static
                * @final
                */
                OTHER: 1,
                /**
                * Use this type to load resources of type CSS [style sheet]
                * 
                * @property CSS
                * @type Number
                * @static
                * @final
                */
                CSS: 2,
                /**
                * Use this type to load resources of type JS i.e of javascript.
                * 
                * @property JS
                * @type Number
                * @static
                * @final
                */
                JS: 3,
                /**
                * Use this type to load images into the DOM.
                * 
                * @property IMAGE
                * @type Number
                * @static
                * @final
                */
                IMAGE: 4,
                /**
                * Use this type to load resources of type JSON.
                * 
                * @property JSON
                * @type Number
                * @static
                * @final
                */
                JSON: 5,

                /**
                * Use this type to load resources of type CUR.
                * 
                * @property CUR
                * @type Number
                * @static
                * @final
                */
                CUR: 6,

                /**
                * Use this type to load resources of type FONT.
                * 
                * @property FONT
                * @type Number
                * @static
                * @final
                */
                FONT: 7
            },

            preloadedFiles: {},

            preload: function preload(fileList, options, beforeStartCallback, progressCallback, completeCallback, errorCallback, basePath) {
                //this.preloadedFiles = {};
                var preloader = new Preloader(fileList, options, beforeStartCallback, progressCallback, completeCallback, errorCallback, basePath);
                preloader.preload();
                return;
            }
        }
        );

        return Preloader;
    })();

    // Returning the util preloader for now, to be used in require statment.
    return MathInteractives.Common.Preloader;

});