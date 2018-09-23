(function (MathInteractives) {
    'use strict';

    /**
    * A customized Backbone.Model that represents a complete Preloader
    * @class InteractivityPreloader
    * @constructor
    * @namespace MathInteractives.Common.Player.Models
    * @module Common
    * @submodule Player
    * @extends Backbone.Model
    */
    MathInteractives.Common.Player.Models.InteractivityPreloader = Backbone.Model.extend(
        {
            /**
            * @property defaults
            * @type Object
            */
            defaults: function () {
                return {
                    /**
                    * @property interactivityConfig
                    * @type Object
                    */
                    interactivityConfig: {},

                    /**
                    * @property containerID
                    * @type string
                    * @default null
                    */
                    containerId: null,

                    /**
                    * @property playerView
                    * @type {object}
                    * @default null
                    */
                    playerView: null,

                    /**
                     * Stores the Files details which need to load.
                     * 
                     * @property _filesToLoad
                     * @type {object}
                     * @default null
                     * 
                     */
                    _filesToLoad: null,

                    /**
                     * Stores the Component dependency list
                     * 
                     * @property componentResourceList
                     * @type {object}
                     * @default null
                     * 
                     */
                    componentResourceList: null,

                    /*
                    * Stores the modules to load using require
                    * @property requireModules
                    * @type {object}
                    * @default null
                    */
                    requireModules: null,

                    /*
                    * Stores preloader's data
                    * @property preloaderData
                    * @type {object}
                    * @defualt null
                    */
                    preloaderData: null,

                    /*
                    * Stores audio files sprite data wrt to its id map
                    * @property audioFileDataMap
                    * @type {object}
                    * @defualt null
                    */
                    audioFileDataMap: null
                }
            },

            /**
            * Holds index of path
            * @property pathIndex
            * @type {number}
            * @default 0
            */
            pathIndex: 0,

            /**
            * Holds the model of path for preloading files
            *
            * @property path
            * @type Object
            * @default null
            */
            path: null,

            /**
            * Holds the array of paths for json files to be used for preloading
            *
            * @property paths
            * @type Array
            * @default null
            */
            paths: null,

            /**
            * Holds the array of objects with file details like url, 
            *
            * @property imageFiles
            * @type Array
            * @default null
            */
            imageFiles: null,

            /* 
            * Stored interactivity options
            * @param _interactiveOptions
            * @private
            * @default null
            * @type {object}
            */
            _interactiveOptions: null,

            /*
             * Stores the bool for two step loading process
             * @property _isTwoStepLoad
             * @default false
             * @type {bool}
             */
            _isTwoStepLoad: false,

            /*
             * Stores the current player theme defined for interactive
             * @property _playerTheme
             * @default 1
             * @type {Number}
             */
            _playerTheme: 1,


            /**
             * Initialization of preloader
             * @method initiatePreload
             * @constructor
             */

            initiatePreload: function () {
                var self = this, interactiveConfigId;
                this._interactiveOptions = this.get('interactiveOptions');
                this.set('containerId', this._interactiveOptions.containerId);

                interactiveConfigId = this._interactiveOptions.containerId + '_' + this._interactiveOptions.folder + '_config';
                this._initiatePath();
                this._loadConfigs(interactiveConfigId);

            },

            /**
            * Initiates path for respective apps
            *
            * @method _initiatePath
            * @private
            */
            _initiatePath: function _initiatePath(event) {
                var self = this, pathOptions = {
                    folder: self._interactiveOptions.folder,
                    lang: self._interactiveOptions.lang,
                    basePath: self._interactiveOptions.basePath,
                    coreStaticPath: self._interactiveOptions.coreStaticPath,
                    minify: self._interactiveOptions.minify
                };
                self.path = new MathInteractives.global.Path();
                self.path.initializeAppPath(pathOptions);
            },

            /**
             * Initialize player and interactive config and starts interactive preload on success
             *
             * @method _loadConfigs
             * @param interactiveConfigId {string} unique id for interactive config
             * @private
             */
            _loadConfigs: function _loadConfigs(interactiveConfigId) {
                var resources = [], Prelaoder, EventTypes, preloader, interactiveOption = this._interactiveOptions;

                //pushing player config details to resources
                resources.push($.extend(true, {}, interactiveOption.playerConfig.resources));

                //Preloading interactive config json
                Preloader = MathInteractives.Common.Preloader;
                EventTypes = Preloader.Event.Types;
                preloader = new Preloader({
                    resourceList: [{
                        type: 'json',
                        path: this.path.getPath(MathInteractives.global.Path.FOLDERS.DATA) + 'interactivity-config.json',
                        id: interactiveConfigId
                    }]

                });

                preloader.off()
                          .on(EventTypes.PRELOAD_SUCCESS, $.proxy(function (event) {
                              var configData = event.preloader.getPreloadData()[interactiveConfigId].data,
                                  self = this,
                                  playerTheme;


                              //pushing interactive config details to resources
                              resources.push($.extend(true, {}, configData.resources));

                              //setting up preloader as per interactive config
                              if (configData.hasOwnProperty('config')) {
                                  self.set('interactivityConfig', configData.config);
                                  self._isTwoStepLoad = configData.config.isTwoStepLoad || false;

                                  playerTheme = configData.config.playerTheme;
                                  if (typeof playerTheme !== 'undefined' && playerTheme !== null) {
                                      self.path.setCSSThemeFolder(playerTheme);
                                      self._playerTheme = playerTheme;
                                  }
                              }

                              //start preloading the resources
                              self.preload(Preloader, resources);
                          }, this))
                          .on(EventTypes.PRELOAD_ERROR, $.proxy(this._onError, this));
                preloader.preload();
            },

            /**
             * intiiate preloading for the given path
             *
             * @method preload
             * @param {object} preloader Preloader Model object
             * @public
             */
            preload: function (preloader, resourcesList) {

                var self = this,
                filesToUpload = { step1: [], step2: [] },
                fileToPreload = null,
                basePath = this.get('path'),
                    paths = self.paths;

                filesToUpload.step1 = self._loadLocAccJson(filesToUpload.step1);
                self._generatePreloadFileList(filesToUpload, resourcesList);
            },


            /**
           * Set loc-acc.json of common and itneractive in the resourceList
           *
           * @method _loadLocAccJson
           * @param {object} filesToUpload resource to upload
           * @return Array
           * @private
           */
            _loadLocAccJson: function _loadLocAccJson(filesToUpload) {
                filesToUpload.push({
                    'id': 'common-loc-acc',
                    'path': this.path.getPath(MathInteractives.global.Path.FOLDERS.COMMON_LANG_JSON) + 'loc-acc.json',
                    'type': 'json'
                });

                filesToUpload.push({
                    'id': 'interactive-loc-acc',
                    'path': this.path.getPath(MathInteractives.global.Path.FOLDERS.LANG_JSON) + 'loc-acc.json',
                    'type': 'json'
                });

                return filesToUpload;
            },


            /**
            * Fetches resources list from json path provided
            *
            * @method _generatePreloadFileList
            * @param {object} paths Url Paths of jsons
            * @param {object} fileToupload store the list of resources to be preload after completion
            * @param {object} preloader Preloader Model object
            * @private
            */
            _generatePreloadFileList: function (filesToUpload, resourcesList) {
                var self = this, resourcesFile = null;


                this.set('componentResourceList', resourcesList[0]['components'] || {});
                //Set the player-config data
                //Setting the second object of player-config data to resources
                resourcesList[0] = resourcesList[0]['theme' + this._playerTheme];

                //loading of sound-manager if any audio file is defined
                resourcesList = self._checkForSoundManagerDependency(resourcesList);

                //gets the compiled array of resources
                for (var resourceIndex in resourcesList) {

                    resourcesFile = self._getResourcesListToPreload(
                        self._updateResourceListOnComponentDependency(resourcesList[resourceIndex])
                        , Number(resourceIndex)
                        );
                    for (var index in resourcesFile) {
                        //divide resources if two step loading is enabled
                        if (self._isTwoStepLoad) {
                            if (resourcesFile[index].isNextStepLoad) {
                                filesToUpload.step2.push(resourcesFile[index]);
                            } else {
                                filesToUpload.step1.push(resourcesFile[index]);
                            }
                        } else {
                            filesToUpload.step1.push(resourcesFile[index]);
                        }
                    }
                }
                self.set('_filesToLoad', filesToUpload);


                // TTS loading should happen through require module
                /*Loading TTS File from SpeechStream Server*/
                /*
                filesToUpload.step1.push({
                    //'path': 'http://discoveryeducation.speechstream.net/SpeechStream/v191/texthelpMain.js',
                    'path': this.path.getPath(MathInteractives.global.Path.FOLDERS.TTS) + 'textHelpMain.js',
                    'type': 'javascript'
                });
                */
                var requireModules = this.get('requireModules'),
                    componentResourceList = this.get('componentResourceList');
                requireModules.step1 = requireModules.step1 || [];
                requireModules.step1 = requireModules.step1.concat(componentResourceList['tts-help-main'].requireModules[0].module);

                this.set('requireModules', requireModules);


                self._preloadResources(filesToUpload.step1);

            },


            /*
            * Checks for sound manager dependency as per audio file count
            * @method _checkForSoundManagerDependency
            * @param {object} resourceList json object
            * @return {object} resource list with added sound manager component
            * @private
            */
            _checkForSoundManagerDependency: function _checkForSoundManagerDependency(resourceList) {
                var resources, media, audio;


                for (var index = 0; index < resourceList.length; index++) {
                    resources = resourceList[index];
                    media = resources.media || {}, audio = media.audio || [];
                    if (audio.length > 0) {
                        //adds component to player list
                        resourceList[0].components.push('sound-manager');
                        break;
                    }
                }

                return resourceList;
            },

            /**
            * Reads the json fetched on ajax request; sort and create resource files object as per component dependencies
            *
            * @method _updateResourceListOnComponentDependency
            * @param {object} resources json object
            * @private
            * @return {object} updated resource list
            */
            _updateResourceListOnComponentDependency: function _updateResourceListOnComponentDependency(resources) {
                var components = resources.components || [],
                    componentResourceList = this.get('componentResourceList'),
                    componentIndex = 0,
                    currentComponent;

                //Looping and updating resourcelist as per compoenent dependency in the resources
                for (componentIndex = 0; componentIndex < components.length; componentIndex++) {

                    //sets the current component resource list
                    currentComponent = componentResourceList[components[componentIndex]] || {};

                    //js
                    resources.js = resources.js || [];
                    if (currentComponent.js) {
                        resources.js = resources.js.concat(currentComponent.js);
                    }

                    //css
                    resources.css = resources.css || [];
                    if (currentComponent.css) {
                        resources.css = resources.css.concat(currentComponent.css);
                    }
                    //templates
                    resources.templates = resources.templates || [];
                    if (currentComponent.templates) {
                        resources.templates = resources.templates.concat(currentComponent.templates);
                    }

                    //media/images
                    resources.media = resources.media || {};
                    resources.media.image = resources.media.image || [];
                    if (currentComponent.media
                        && currentComponent.media.image) {
                        resources.media.image = resources.media.image.concat(currentComponent.media.image);
                    }

                    //media/cur
                    resources.media.cur = resources.media.cur || [];
                    if (currentComponent.media
                        && currentComponent.media.cur) {
                        resources.media.cur = resources.media.cur.concat(currentComponent.media.cur);
                    }

                    //require modules
                    resources.requireModules = resources.requireModules || [];
                    if (currentComponent.requireModules) {
                        resources.requireModules = resources.requireModules.concat(currentComponent.requireModules);
                    }

                    //json
                    resources.json = resources.json || [];
                    if (currentComponent.json) {
                        resources.json = resources.json.concat(currentComponent.json);
                    }

                }
                return resources;

            },

            /**
            * Reads the json fetched on ajax request; sort and create resource files object as per their type
            *
            * @method _getResourcesListToPreload
            * @param {object} resources json object
            * @param {Number} reourceNumber Resource data index
            * @private
            */
            _getResourcesListToPreload: function (resources, resourceNumber) {

                var resourceList = [],
                   currentResource = null,
                   url,
                   self = this, resourceIndex = 0, file, name, resourceName, mediaProp, prop, isBase64,
                   FileType = MathInteractives.Common.Player.Models.InteractivityPreloader.FileTypes, isNextStepLoad;

                //Load media first so
                if (resources.media) {
                    url = '';
                    currentResource = resources.media;
                    for (mediaProp in currentResource) {

                        switch (mediaProp) {
                            case FileType.CUR:
                            case FileType.IMAGE: {

                                for (resourceIndex in currentResource[mediaProp]) {
                                    file = currentResource[mediaProp][resourceIndex]; isBase64 = false,
                                    isNextStepLoad = (resourceNumber === 1 && typeof file.isNextStepLoad === 'undefined') ? true : file.isNextStepLoad;

                                    if (file.hasOwnProperty('basePath')) {
                                        url = this.path.getPath(MathInteractives.global.Path.FOLDERS[file.basePath]) + file.url;
                                    }
                                    else {
                                        url = this.path.getPath(MathInteractives.global.Path.FOLDERS.IMAGE) + file.url;
                                    }

                                    if (mediaProp === 'cur') {
                                        resourceList.push({
                                            'id': file.id,
                                            'path': url,
                                            'type': 'cur',
                                            isNextStepLoad: isNextStepLoad
                                        });
                                    }
                                    else {
                                        if (typeof file.isBase64 !== 'undefined') {
                                            isBase64 = file.isBase64;
                                        }
                                        resourceList.push({
                                            'id': file.id,
                                            'path': url,
                                            'type': 'image',
                                            isNextStepLoad: isNextStepLoad,
                                            forceLoad: file.forceLoad || false
                                        });
                                    }
                                }
                                break;
                            }

                            case FileType.AUDIO: {
                                var audioFileDataMap = this.get('audioFileDataMap') || {};
                                for (resourceIndex in currentResource[mediaProp]) {
                                    file = currentResource[mediaProp][resourceIndex];

                                    if (!file.hasOwnProperty('data')) {
                                        continue;
                                    }

                                    if (file.hasOwnProperty('basePath')) {
                                        file.url = this.path.getPath(MathInteractives.global.Path.FOLDERS[file.basePath]) + file.url;
                                    } else {
                                        file.url = this.path.getPath(MathInteractives.global.Path.FOLDERS.AUDIO) + file.url;
                                    }

                                    //Normalizing url
                                    file.url = Preloader.normalizeURL(file.url).replace('.mp3', '');
                                    file.audioFilePath = file.url;
                                    file.audioData = file.data;


                                    //Updates audio data wrt to given audio id
                                    audioFileDataMap[file.id] = file;

                                    //deletes unnecessary props
                                    delete file.basePath;
                                    delete file.url;
                                    delete file.data;
                                    delete file.id;
                                }
                                //Sets back the audio data to model
                                this.set('audioFileDataMap', audioFileDataMap);
                                this.path.updateAudioDataMap(audioFileDataMap);
                                break;
                            }
                            case FileType.VIDEO: {
                                //TODO
                                break;
                            }
                        }

                    }
                }
                for (prop in resources) {
                    currentResource = resources[prop];
                    switch (prop) {
                        case FileType.JS:
                        case FileType.REQUIRE_JS:
                        case FileType.TEMPLATES: {
                            resourceName = prop;
                            if (resources.isNewJsonType === true) {
                                //Returns the resource list as per nw json type
                                resourceList = this._getJSResourcesListToPreloadForNewJSON(resourceName, currentResource, resourceList, resourceNumber);
                                break;
                            }

                            for (prop in currentResource) {
                                url = '';
                                for (resourceIndex in currentResource[prop]) {
                                    file = currentResource[prop][resourceIndex],
                                    isNextStepLoad = (resourceNumber === 1 && typeof file.isNextStepLoad === 'undefined') ? true : file.isNextStepLoad;
                                    if (file.hasOwnProperty('basePath')) {
                                        url = this.path.getPath(MathInteractives.global.Path.FOLDERS[file.basePath]) + file.url;
                                    }
                                    else {
                                        if (resourceName === 'js') {
                                            url = this.path.getPath(MathInteractives.global.Path.FOLDERS.SCRIPT) + file.url;
                                        }
                                        else if (resourceName === 'templates') {
                                            url = this.path.getPath(MathInteractives.global.Path.FOLDERS.TEMPLATE) + file.url;
                                        }
                                    }

                                    resourceList.push({
                                        'path': url,
                                        'type': 'javascript',
                                        isNextStepLoad: isNextStepLoad,
                                        forceLoad: file.forceLoad || false
                                    });

                                }
                            }
                            break;
                        }

                        case FileType.CSS: {
                            url = '';
                            for (resourceIndex in currentResource) {
                                file = currentResource[resourceIndex];
                                isNextStepLoad = (resourceNumber === 1 && typeof file.isNextStepLoad === 'undefined') ? true : file.isNextStepLoad;
                                if (file.hasOwnProperty('basePath')) {
                                    url = this.path.getPath(MathInteractives.global.Path.FOLDERS[file.basePath]) + file.url;
                                }
                                else {
                                    url = this.path.getPath(MathInteractives.global.Path.FOLDERS.CSS) + file.url;
                                }

                                resourceList.push({
                                    'path': url,
                                    'type': 'css',
                                    isNextStepLoad: isNextStepLoad,
                                    forceLoad: file.forceLoad || false
                                });
                            }
                            break;
                        }
                        case FileType.REQUIRE_JSON:
                        case FileType.JSON: {
                            url = '';

                            var resourceName, jsonType;
                            resourceName = prop;
                            for (resourceIndex in currentResource) {
                                file = currentResource[resourceIndex],
                                isNextStepLoad = (resourceNumber === 1 && typeof file.isNextStepLoad === 'undefined') ? true : file.isNextStepLoad;

                                //TODO: Temporary not adding loc acc inside resource list
                                if (file.url.indexOf('loc-acc') > -1) {
                                    continue;
                                }

                                if (file.hasOwnProperty('basePath')) {
                                    url = this.path.getPath(MathInteractives.global.Path.FOLDERS[file.basePath]) + file.url;
                                }
                                else {
                                    url = this.path.getPath(MathInteractives.global.Path.FOLDERS.DATA) + file.url;
                                }

                                jsonType = 'json';
                                if (resourceName === 'requirejson') {
                                    url = url + '?callback=define';
                                    jsonType = 'requirejs';
                                }
                                resourceList.push({
                                    'id': file.id || 'json-' + resourceIndex,
                                    'path': url,
                                    'type': jsonType,
                                    isNextStepLoad: isNextStepLoad,
                                    forceLoad: file.forceLoad || false
                                });
                            }
                            break;
                        }
                        case FileType.FONT: {
                            url = null;
                            var name, basePath, fontObjectforPreloader;
                            for (resourceIndex in currentResource) {
                                file = currentResource[resourceIndex],
                                isNextStepLoad = (resourceNumber === 1 && typeof file.isNextStepLoad === 'undefined') ? true : file.isNextStepLoad;

                                basePath = this.path.getPath('FONTS');
                                name = file.name;
                                if (file.hasOwnProperty('basePath')) {
                                    basePath = this.path.getPath(MathInteractives.global.Path.FOLDERS[file.basePath])
                                }
                                url = file.url;
                                fontObjectforPreloader = {
                                    'type': 'font',
                                    'fontFamily': name,
                                    'fontFormat': file.type || '',
                                    isNextStepLoad: isNextStepLoad,
                                    forceLoad: file.forceLoad || false
                                }


                                if ($.isArray(url)) {
                                    url.forEach(function (font) {
                                        font.path = basePath + font.path;
                                        font.fontFormat = font.type;
                                        delete font.type;
                                    });
                                    fontObjectforPreloader.fontPaths = url;
                                    fontObjectforPreloader.path = url[0].path;
                                } else {
                                    fontObjectforPreloader.path = basePath + url;
                                }

                                resourceList.push(fontObjectforPreloader);
                            }
                            break;
                        }
                        case FileType.REQUIRE_MODULES: {
                            //Divide the modules in step1 and 2
                            var requireModules = this.get('requireModules') || {};
                            requireModules.step1 = requireModules.step1 || [],
                            requireModules.step2 = requireModules.step2 || [];
                            currentResource.forEach(function (requireModule) {
                                //check if the interactive is of 2 step load type
                                if (self._isTwoStepLoad) {
                                    isNextStepLoad = (resourceNumber === 1 && typeof requireModule.isNextStepLoad === 'undefined') ? true : requireModule.isNextStepLoad;

                                    if (isNextStepLoad) {
                                        requireModules.step2.push(requireModule.module);
                                    }
                                    else {
                                        requireModules.step1.push(requireModule.module);
                                    }
                                }
                                else {
                                    requireModules.step1.push(requireModule.module);
                                }
                            });
                            this.set('requireModules', requireModules);
                            break;
                        }
                    }
                }

                return resourceList;

            },

            /**
            * Reads the modified config json for js and templates resource list 
            *
            * @method _getJSResourcesListToPreloadForNewJSON
            * @param {string} resourceType Type of resource (js/templates)
            * @param {Array} currentResource Array of current resource
            * @param {Array} resourceList Resource List
            * @param {Number} reourceNumber Resource data index
            * @private
            */
            _getJSResourcesListToPreloadForNewJSON: function (resourceType, currentResource, resourceList, resourceNumber) {

                var url,

                   self = this, resourceIndex = 0, file, resourceName, isNextStepLoad, jsType;

                resourceName = resourceType;
                for (resourceIndex in currentResource) {
                    url = '';
                    file = currentResource[resourceIndex],
                    isNextStepLoad = (resourceNumber === 1 && typeof file.isNextStepLoad === 'undefined') ? true : file.isNextStepLoad;

                    if (file.hasOwnProperty('basePath')) {
                        url = this.path.getPath(MathInteractives.global.Path.FOLDERS[file.basePath]) + file.url;
                    }
                    else {
                        if (resourceName === 'js') {
                            url = this.path.getPath(MathInteractives.global.Path.FOLDERS.SCRIPT) + file.url;
                        }
                        else if (resourceName === 'templates') {
                            url = this.path.getPath(MathInteractives.global.Path.FOLDERS.TEMPLATE) + file.url;
                        }
                    }

                    jsType = 'javascript';
                    if (resourceName === 'requirejs') {
                        jsType = 'requirejs';
                    }

                    // Check for files that are suppossed to be added through require from the common location like paper etc.
                    // New interactives have it through a component listing
                    // To maintain backward compatibility there is a check for those old files
                    if (!this._isVendorFile(file)) {

                        resourceList.push({
                            'path': url,
                            'type': jsType,
                            isNextStepLoad: isNextStepLoad,
                            forceLoad: file.forceLoad || false
                        });
                    }
                }
                return resourceList;

            },

            /*
            * Check if the file being passed is actually a vendor file that should be loaded through require js
            * @return {bool} 
            * @method _isRequireLoadNeededForStep1
            * @param file{Object} The file which has to be loaded
            */
            _isVendorFile: function _isVendorFile(file) {
                var currentNamespace = MathInteractives.Common.Player.Models.InteractivityPreloader,
                    vendorFiles = currentNamespace.VendorFiles,
                    requireModules = this.get('requireModules') || {},
                    componentResourceList = this.get('componentResourceList'),
                    reqMod, modules;

                requireModules.step1 = requireModules.step1 || [];
                requireModules.step2 = requireModules.step2 || [];

                switch (file.url) {
                    case vendorFiles.PaperJs.url:
                        reqMod = vendorFiles.PaperJs.require;
                        break;
                    case vendorFiles.JqueryUI.url:
                        reqMod = vendorFiles.JqueryUI.require;
                        break;
                    case vendorFiles.JqueryUITouch.url:
                        reqMod = vendorFiles.JqueryUITouch.require;
                        break;
                    case vendorFiles.JqueryMouseWheel.url:
                        reqMod = vendorFiles.JqueryMouseWheel.require;
                        break;
                        /* Commented because discusssion is needed about the difference in version(Virus zapper has JS error)
                        case vendorFiles.JqueryTableSorter.url:
                            reqMod = vendorFiles.JqueryTableSorter.require;
                            break;
                        */
                    case vendorFiles.CustomSlider.url:
                    case vendorFiles.CustomSlider1.url:
                        reqMod = vendorFiles.CustomSlider.require;
                        break;
                    case vendorFiles.HighCharts.url:
                        reqMod = vendorFiles.HighCharts.require;
                        break;
                    case vendorFiles.HighChartsMore.url:
                        reqMod = vendorFiles.HighChartsMore.require;
                        break;
                }

                if (reqMod) {
                    modules = componentResourceList[reqMod].requireModules;
                    requireModules.step1 = requireModules.step1.concat(Object.keys(modules).map(function (index) { return modules[index].module }));
                    this.set('requireModules', requireModules);
                    return true;
                }
                return false;
            },

            /*
            * Check if require module load is defined for the interactive for step 1
            * @return {bool} 
            * @method _isRequireLoadNeededForStep1
            */
            _isRequireLoadNeededForStep1: function _isRequireLoadNeededForStep1() {
                var requireModules = this.get('requireModules') || {};
                requireModules.step1 = requireModules.step1 || [];

                if (requireModules.step1.length > 0) {
                    return true;
                }
                return false;
            },

            /*
            * Check if require module load is defined for the interactive for step 2
            * @return {bool} 
            * @method _isRequireLoadNeededForStep2
            */
            _isRequireLoadNeededForStep2: function _isRequireLoadNeededForStep2() {
                var requireModules = this.get('requireModules') || {};
                requireModules.step2 = requireModules.step2 || [];

                if (requireModules.step2.length > 0) {
                    return true;
                }
                return false;
            },

            /*
            * On comletion of resourcelist generation preload starts
            * @method _preloadResources
            * @param {object} filesToupload Array of resources
            * @private
            */
            _preloadResources: function (filesToUpload) {


                var self = this, Preloader, EventTypes, preloader;

                Preloader = MathInteractives.Common.Preloader;
                EventTypes = Preloader.Event.Types;
                preloader = new Preloader({
                    resourceList: filesToUpload
                });

                self._beforeStart();
                //Attaching preloader events
                preloader.off()
                 //.on(EventTypes.PRELOAD_RESOURCE_START, $.proxy(self._beforeStart, self))
                 .on(EventTypes.PRELOAD_RESOURCE_PROGRESS, $.proxy(self._onProgress, self))
                 .on(EventTypes.PRELOAD_RESOURCE_SUCCESS, $.proxy(self._onPreloadComplete, self))
                 .on(EventTypes.PRELOAD_RESOURCE_ERROR, $.proxy(function () {
                     this._onError()
                 }, self));

                //Start preloading
                preloader.preload();
                this._preloader = preloader;
            },

            /*
             * Start loading resources for step 2
             * @method startStep2Preload
             */
            startStep2Preload: function startStep2Preload() {
                if (!this._isTwoStepLoad) {
                    return;
                }

                var self = this, Preloader, EventTypes, preloader, filesToLoad = self.get('_filesToLoad').step2;

                Preloader = MathInteractives.Common.Preloader;
                EventTypes = Preloader.Event.Types;
                preloader = new Preloader({
                    resourceList: filesToLoad
                });

                self._step2BeforeStart();
                //Attaching preloader events
                preloader.off()
                 //.on(EventTypes.PRELOAD_RESOURCE_START, $.proxy(self._beforeStart, self))
                 .on(EventTypes.PRELOAD_RESOURCE_PROGRESS, $.proxy(self._step2ProgressCallback, self))
                 .on(EventTypes.PRELOAD_RESOURCE_SUCCESS, $.proxy(self._step2CompleteCallback, self))
                 .on(EventTypes.PRELOAD_RESOURCE_ERROR, $.proxy(self._step2ErrorCallback, self));

                //Start preloading
                preloader.preload();
                this._step2preloader = preloader;

            },


            /* 
            * Before Start Callback
            * @method _beforeStart
            * @private
            */
            _beforeStart: function () {
                this.trigger('preloader-before-start', { basePath: this._interactiveOptions.basePath });
                this.off('interactive-load-complete').on('interactive-load-complete', this._triggersCompleteCallback);
            },

            /*
            * Step 1 preload complete
            * @method _onPreloadComplete             
            * @private
            */
            _onPreloadComplete: function (event) {
                var preloader = event.preloader,
                    preloadData,
                    managerData = {},
                    pronunciationData = {},
                    preloaderData = this.get('preloaderData') || {};

                preloadData = preloader.getPreloadData();
                this.path.imageFiles = preloader.getImages();

                managerData.common = preloadData['common-loc-acc'].data.locAccData;
                managerData.interactive = preloadData['interactive-loc-acc'].data.locAccData;

                pronunciationData.common = pronunciationData.interactive = {};
                if (this._interactiveOptions.bAllowAccessibility) {
                    pronunciationData.common = preloadData['common-loc-acc'].data.pronunciationData || {};
                    pronunciationData.interactive = preloadData['interactive-loc-acc'].data.pronunciationData || {};
                }

                //deleting loc data from preload data as not required further at interactive level
                delete preloadData['common-loc-acc'];
                delete preloadData['interactive-loc-acc'];

                preloaderData.step1 = {
                    jsonData: preloadData,
                    managerData: managerData,
                    startTabindex: this._interactiveOptions.initialTabIndex,
                    allowAccessibility: this._interactiveOptions.bAllowAccessibility,
                    isNoTextMode: this._interactiveOptions.isNoTextMode,
                    path: this.path,
                    initialState: this._interactiveOptions.initialState,
                    pronunciationData: pronunciationData
                }

                this.set('preloaderData', preloaderData);

                this._loadInteractiveStep1();
            },


            /*
            * Checks for require modulea for step 1 before triggering the preload complete
            * If modules need to be loaded then loads the modules first and trigger the event
            * @method _loadInteractiveStep1
            */
            _loadInteractiveStep1: function _loadInteractiveStep1() {
                var modules = null;

                if (this._isRequireLoadNeededForStep1() && typeof require !== 'undefined') {
                    modules = this.get('requireModules').step1;
                    require(modules, $.proxy(this._completeInteractiveStep1, this), $.proxy(this._onError, this));
                }
                else {
                    this._completeInteractiveStep1();
                }
            },

            /*
            * Triggers step interactive preload complete
            * @method _completeInteractiveStep1
            */
            _completeInteractiveStep1: function _completeInteractiveStep1() {
                this.trigger('preloader-complete', this.get('preloaderData').step1);
                this._initializeTouchSimulator();
            },

            /*
           * Initializes touch simulator objects
           * @method _initializeTouchSimulatorObjects
           */
            _initializeTouchSimulator: function _initializeTouchSimulator() {
                MathInteractives.Common.Utilities.Models.Utils.DisableTouch = MathUtilities.Components.Utils.TouchSimulator.disableTouch;
                MathInteractives.Common.Utilities.Models.Utils.EnableTouch = MathUtilities.Components.Utils.TouchSimulator.enableTouch;
                MathInteractives.Common.Utilities.Models.Utils.SPECIFIC_EVENTS = MathInteractives.Common.Utilities.Models.Utils.SpecificEvents = MathUtilities.Components.Utils.TouchSimulator.SPECIFIC_EVENTS;
            },

            /* 
            * Calls when the interactive is loaded successfully
            * @method _triggersCompleteCallback
            * @private
            */
            _triggersCompleteCallback: function _triggersCompleteCallback(event) {
                var callbackData = this._interactiveOptions.callbackData;
                callbackData.loadedStepNumber = event.loadedStepNumber;
                callbackData.isTwoStepLoad = this._isTwoStepLoad;
                if (this._isTwoStepLoad && callbackData.loadedStepNumber === 2) {
                    callbackData.isTwoStepLoad = false;
                }
                if (this._interactiveOptions.success) {
                    this._interactiveOptions.success.apply(this._interactiveOptions.scope || this, [callbackData, this.get('playerView'), this._interactiveOptions.interactiveGuid]);
                }

                if (this._interactiveOptions.complete) {
                    this._interactiveOptions.complete.apply(this._interactiveOptions.scope || this, [callbackData]);
                }
            },

            /* 
            * On Error Callback
            * @method _onError
            * @private
            */
            _onError: function (event) {
                var callbackData = this._interactiveOptions.callbackData;
                callbackData.loadedStepNumber = (event) ? event.loadedStepNumber : 1;

                this.trigger('preloader-error');

                if (this._interactiveOptions.error) {
                    this._interactiveOptions.error.apply(this._interactiveOptions.scope || this, [this._interactiveOptions, callbackData]);
                }

                if (this._interactiveOptions.complete) {
                    this._interactiveOptions.complete.apply(this._interactiveOptions.scope || this, [callbackData]);
                }
            },

            /* 
            * On Progress Callback
            * @method _beforeStart
            * @private
            */
            _onProgress: function (event) {
                this.trigger('preloader-progress', {
                    percentComplete: event.progressPercent
                });
            },

            /*
             * Callback before preload start of step 2. Sets preloader position and width
             * @method _step2BeforeStart
             * @event
             */
            _step2BeforeStart: function _step2BeforeStart() {
                this.trigger('step-2-preloader-before-start', { basePath: this._interactiveOptions.basePath });
            },

            /*
             * On Progress Callback for step 2. Updates the preloader width
             * @method _step2ProgressCallback
             * @event
             */
            _step2ProgressCallback: function _step2ProgressCallback(event) {
                this.trigger('step-2-preloader-progress', {
                    percentComplete: event.progressPercent
                });
            },

            /*
             * Complete callback on step 2 preload completion
             * @method _step2CompleteCallback
             * @event
             */
            _step2CompleteCallback: function _step2CompleteCallback(event) {
                var step2Preloader = event.preloader, preloader = this._preloader,
                    initialPreloadedData = preloader.getPreloadData(),
                    currentPreloadedData = step2Preloader.getPreloadData(), jsonData,
                    preloaderData = this.get('preloaderData') || {};

                //updating image data in path
                $.extend(this.path.imageFiles, step2Preloader.getImages());

                //updating json data of player
                jsonData = $.extend({
                }, initialPreloadedData, currentPreloadedData);

                preloaderData.step2 = {
                    jsonData: jsonData
                }

                this.set('preloaderData', preloaderData);
                this._loadInteractiveStep2();
            },

            /*
           * Checks for require modulea for step 2 before triggering the preload complete
           * If modules need to be loaded then loads the modules first and trigger the event
           * @method _loadInteractiveStep2
           */
            _loadInteractiveStep2: function _loadInteractiveStep2() {
                var modules = null;

                if (this._isRequireLoadNeededForStep2() && typeof require !== 'undefined') {
                    modules = this.get('requireModules').step2;
                    require(modules, $.proxy(this._completeInteractiveStep2, this), $.proxy(this._onError, this));
                }
                else {
                    this._completeInteractiveStep2();
                }
            },

            /*
            * Triggers step 2 interactive preload complete
            * @method _completeInteractiveStep2
            */
            _completeInteractiveStep2: function _completeInteractiveStep2() {
                this.trigger('step-2-preloader-complete', this.get('preloaderData').step2);
            },

            /*
             * Error Callback for step 2
             * @method _step2ErrorCallback
             * @event
             */
            _step2ErrorCallback: function _step2ErrorCallback(event) {
                this._onError({
                    loadedStepNumber: 2
                });
            },

            //Return the querystring key value pair as object
            getQueryStringData: function () {
                var queryString = decodeURIComponent(location.search.substring(1, location.search.length));
                var queryStringData = {
                };
                //generate key value player
                var keyValuePairs = queryString.split('&');

                for (var keyIndex in keyValuePairs) {
                    var currentKeyValue = keyValuePairs[keyIndex].split('=');
                    queryStringData[currentKeyValue[0]] = currentKeyValue[1]
                }
                return queryStringData;
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


        }, {
            /**
            * Type of preloader according to theme of the player
            * 
            * @property PRELOADER_TYPE1
            * @static
            */
            PRELOADER_TYPE1: 1,

            /**
            * Type of preloader according to theme of the player
            * 
            * @property PRELOADER_TYPE2
            * @static
            */
            PRELOADER_TYPE2: 2,


            /**
           * Type of files to preload
           * 
           * @property FileTypes
           * @static
           */
            FileTypes: {
                JS: 'js',
                CSS: 'css',
                IMAGE: 'image',
                AUDIO: 'audio',
                VIDEO: 'video',
                JSON: 'json',
                CUR: 'cur',
                TEMPLATES: 'templates',
                FONT: 'fonts',
                REQUIRE_JS: 'requirejs',
                REQUIRE_JSON: 'requirejson',
                REQUIRE_MODULES: 'requireModules'
            },
            /**
            * List of all vendor files that should be loaded through require js
            */
            VendorFiles: {
                PaperJs: {
                    "url": "paper-full.js",
                    "basePath": 'PAPER_JS',
                    "require": "paper-js"
                },
                JqueryUI: {
                    "url": "jquery.ui.js",
                    "basePath": "JQUERY_JS",
                    "require": "jquery-ui"
                },
                JqueryUITouch: {
                    "url": "jquery.ui.touch.js",
                    "basePath": "JQUERY_JS",
                    "require": "jquery-ui-touch"
                },
                JqueryMouseWheel: {
                    "url": "jquery.mousewheel.min.js",
                    "basePath": "JQUERY_JS",
                    "require": "jquery-mousewheel"
                },
                JqueryTableSorter: {
                    "url": "jquery.tablesorter.js",
                    "basePath": "JQUERY_JS",
                    "require": "jquery-table-sorter"
                },
                CustomSlider: {
                    "url": "custom-slider.js",
                    "basePath": "PLUGIN",
                    "require": "custom-slider"
                },
                CustomSlider1: {
                    "url": "plugin/custom-slider.js",
                    "basePath": "COMMON_SCRIPT",
                    "require": "custom-slider"
                },
                HighCharts: {
                    "url": "highcharts.js",
                    "basePath": "HIGHCHARTS",
                    "require": "highcharts"
                },
                HighChartsMore: {
                    "url": "highcharts-more.js",
                    "basePath": "HIGHCHARTS",
                    "require": "highcharts-more"
                }
            }


        });

    return MathInteractives.Common.Player.Models.InteractivityPreloader;

})(window.MathInteractives);
