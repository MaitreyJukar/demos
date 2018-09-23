define([], function() {
    'use strict';

    var MathUtilities = window.MathUtilities || {};

    MathUtilities.Preloader = (function () {

        /**
        * Generic utility for preloading resources
        *
        * @class Preloader
        * @namespace MathUtilities
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
        var Preloader = Backbone.Model.extend({
            "defaults": {
                "_options": null,
                "_bRequireCompatible": true,
                "_fileList": [],
                "_fileListMap": {},
                "_currentFileNumber": 0,
                "_totalFileCount": 0,
                "_loadInBackground": [],
                "_preloadContainer": null,
                "_preloadContainerDocument": null,
                "_sandboxReady": false,
                "onbeforestart": null,
                "onprogress": null,
                "oncomplete": null,
                "onerror": null,
                "scope": this
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
            "_onbeforestart": function _onbeforestart(totalFileCount) {
                var beforeStartCallback = this.get('onbeforestart'), scope = this.get('scope');

                if (beforeStartCallback) {
                    beforeStartCallback.apply(scope || this, arguments);
                }
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
            "_onprogress": function _onprogress(currentFile, currentFileNumber, totalFileCount, percentComplete) {
                var progressCallback = this.get('onprogress'), scope = this.get('scope');
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
            "_oncomplete": function _oncomplete(totalFileCount) {
                var completeCallback = this.get('oncomplete'), scope = this.get('scope');

                if (completeCallback) {
                    completeCallback.apply(scope || this, arguments);
                }

                if (this.get('_loadInBackground').length > 0) {
                    this._loadDataInBackground(this.get('_loadInBackground'));
                }
            },

            "_loadDataInBackground": function(loadInBackground) {
                var domElement,
                srcAttributeName = 'src',
                url = '';

                for (var i = 0 ; i < loadInBackground.length ; ++i) {
                    domElement = this.get('_preloadContainerDocument').createElement('img');
                    domElement.setAttribute('style', 'position: absolute; top: 0px; left: -999999px;');
                    url = loadInBackground[i].url;
                    if (MathUtilities.Preloader.FileTypes.IMAGE) {
                        domElement.setAttribute(srcAttributeName, url);
                    }
                }
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
            "_onerror": function _onerror(currentFile, currentFileNumber, totalFileCount, percentComplete) {
                var errorCallback = this.get('onerror'), scope = this.get('scope');

                if (errorCallback) {
                    errorCallback.apply(scope || this, arguments);
                }
            },

            "initialize": function initialize(fileList, options, beforeStartCallback, progressCallback, completeCallback, errorCallback) {

                this.setOptions(options);

                var i = null,
                totalFileCount = null,
                fileListMap = {},
                currentFile = null,
                totalFileToBeLoaded = 0,
                totalFilesToLoadInBackground = [],
                countFilesToLoadInBackground = 0;

                this.set('_fileList', fileList);

                totalFileCount = fileList.length;

                for (i = 0; i < totalFileCount; i++) {
                    currentFile = fileList[i];
                    currentFile.index = i;
                    fileListMap[currentFile.url] = i;

                    if (currentFile.loadInBackground) {
                        totalFilesToLoadInBackground[countFilesToLoadInBackground] = fileList[i];
                        countFilesToLoadInBackground++;
                    } else {
                        totalFileToBeLoaded++;
                    }
                }

                this.set("_loadInBackground", totalFilesToLoadInBackground);

                this.set('_totalFileCount', totalFileToBeLoaded);

                this.set('_fileListMap', fileListMap);

                this.set('onbeforestart', beforeStartCallback);
                this.set('onprogress', progressCallback);
                this.set('oncomplete', completeCallback);
                this.set('onerror', errorCallback);
            },

            "setOptions": function setOptions(options) {
                options = options || this.get('_options');
                options.sandboxed = options.sandboxed || false;

                // Make the preloader require js compatible.
                this.set("_bRequireCompatible", !!options.bRequireCompatible);
                this.set('_options', options);
                if (options.scope) {
                    this.set('scope', options.scope);
                }
            },

            "getOptions": function getOptions() {
                return this.get('_options') || {};
            },

            /**
            * Calling this method starts the preloading of resources.
            *
            * @method preload
            */
            "preload": function preload() {
                this._createPreloadContainer();
                this._preloadProgress();
            },

            "_createPreloadContainer": function _createPreloadContainer() {
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
                } else {
                    preloadContainer = document.createElement('div');
                    preloadContainerDocument = document;
                }

                preloadContainer = document.body.appendChild(preloadContainer);

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
            },

            /**
            * This is called internally to record the preloading progress, load
            * the next resource and trigger any callback events for the same.
            *
            * @method _preloadProgress
            * @private
            */
            "_preloadProgress": function _preloadProgress(fileItem, hasError) {
                hasError = hasError || false;

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
                } else {
                    currentFileNumber++;
                    preloader.set('_currentFileNumber', currentFileNumber);

                    percentComplete = currentFileNumber * 100 / totalFileCount;

                    if (hasError) {
                        preloader._onerror(fileItem, currentFileNumber, totalFileCount, percentComplete);
                        return;
                    } else {
                        Preloader.preloadedFiles[fileItem.url] = true;
                        preloader._onprogress(fileItem, currentFileNumber, totalFileCount, percentComplete);
                    }
                }

                if (percentComplete === 100) {
                    preloader._oncomplete(totalFileCount);
                } else {
                    fileIndex = currentFileNumber;
                    currentFile = fileList[fileIndex];
                    preloader._preloadFile(currentFile);
                }
            },

            /**
            * Called internally to load an individual file.
            *
            * @method _preloadFile
            * @private
            */
            "_preloadFile": function _preloadFile(fileItem) {
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
                    if (Preloader.preloadedFiles[fileItem.url] && !fileItem.forceLoad) {
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
                    case FileTypes.MODULE:
                    case FileTypes.JS:
                        {
                            domElement = preloadContainerDocument.createElement('script');
                            domElement.type = 'text/javascript';
                            domElement.async = 'false';
                            if (type === FileTypes.MODULE) {
                                url = url.replace('/static/', '');
                            }
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
                            break;
                        }
                }

                var bCurFileRequireCompatible;
                if (typeof fileItem.bRequireCompatible === 'undefined') {
                    bCurFileRequireCompatible = this.get('_bRequireCompatible');
                } else {
                    bCurFileRequireCompatible = fileItem.bRequireCompatible;
                }

                if ((FileTypes.JS === type || FileTypes.MODULE === type) && bCurFileRequireCompatible) {
                    // remove the extension (.js), as requirejs does not need the extension.
                    var extensionReplaceRegex = /(.*)(.js)/,
                        strCleanUrl = url.replace(extensionReplaceRegex, function ($0, $1, $2) {
                            return $1;
                        });
                    // @param preloadedJsModule is not always the jsModule that is loaded inside require, need to use requireConfig path for making this possible
                    require([strCleanUrl], function (preloadedJsModule) {
                        if (removeElementAfterPreload) {
                            var parentElement = domElement.parentNode;
                            parentElement.removeChild(domElement);
                        }
                        preloader._preloadProgress(fileItem);
                        return;
                        // This gets called when preloaderModule js is loaded, and the param is the returned data from that function.
                    }, $.proxy(this._onerror, this));
                } else
                if (type === FileTypes.FONT) {

                    this.ajaxTransport(url, function () {
                        if (removeElementAfterPreload) {
                            $(domElement).remove();
                        }
                        preloader._preloadProgress(fileItem);
                    }, function () {
                       preloader._preloadProgress(fileItem, true);
                    }, true);
                } else {
                    domElement.onload = function () {
                        if (removeElementAfterPreload) {
                            var parentElement = domElement.parentNode;
                            parentElement.removeChild(domElement);
                        }

                        preloader._preloadProgress(fileItem);
                    };

                    domElement.onerror = function () {
                        preloader._preloadProgress(fileItem, true);
                    };

                    domElement.setAttribute(srcAttributeName, url);
                }

                preloadContainer.appendChild(domElement);
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
            "ajaxTransport": function (url, successCallback, errorCallback, handleForIE9) {
                /*global XDomainRequest*/
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
                    };
                    xdr.send();
                } else {
                    //In IE9 the @font-face used in the CSS, preloads the fonts before its used,
                    //hence we do not need to send a ajax request to load the font and we call the success for the font.
                    //this is done for local machine fetch as it always goes in error callback

                    // Similarly for .cur files, as it do not go inside success callback even if the response code if 200/304
                    if (this._isMSIE9() && handleForIE9 === true) {
                        successCallback();
                        return;
                    }
                    $.ajax({
                        "url": url,
                        "success": function (json) {
                            successCallback(json);
                        },
                        "error": function () {
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
            "_isMSIE9": function () {
                return navigator.userAgent.toLowerCase().indexOf('msie 9') > -1;
            }
        }, {
            /**
            * Enumeration of file types.
            */
            "FileTypes": {
                "OTHER": 1,
                "CSS": 2,
                "JS": 3,
                "IMAGE": 4,
                "FONT": 5,
                "MODULE": 6
            },

            "preloadedFiles": {},

            "preload": function preload(fileList, options, beforeStartCallback, progressCallback, completeCallback, errorCallback) {
                var preloader = new Preloader(fileList, options, beforeStartCallback, progressCallback, completeCallback, errorCallback);
                preloader.preload();
            }
        });

        return Preloader;
    })();

    // Returning the util preloader for now, to be used in require statment.
    return MathUtilities.Preloader;
});
