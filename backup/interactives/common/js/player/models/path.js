(function (MathInteractives) {
    'use strict';

    var _pathData = {
        'dist': 'dist/',
        'common': 'common/',
        'theme': [
            'theme-1/',
            'theme-2/'
        ],
        'interactivities': '/',
        'data': 'data/',
        'css': 'css/',
        'animate': 'animate/',
        'fonts': 'fonts/',
        'js': 'js/',
        'vendor': 'vendor/',
        'plugin': 'plugin/',
        'backbone': 'backbone/',
        'bootstrap': 'bootstrap/',
        'canvg': 'canvg/',
        'elrte': 'elrte-1.3/',
        'handlebars': 'handlebars/',
        'highcharts': 'highcharts/',
        'html2canvas': 'html2canvas',
        'jquery': 'jquery/',
        'loader': 'loader/',
        'mathjax': 'mathjax/',
        'mathquill': 'mathquill/',
        'paperJs': 'paper/',
        'requireJs': 'requirejs/',
        'threeJs': 'threejs/',
        'tts': 'tts/',
        'underscore': 'underscore/',
        'languages': {
            'en': 'lang/en/',
            'es': 'lang/es/'
        },
        'image': 'media/image/',
        'audio': 'media/audio/',
        'video': 'media/video/',
        'templates': 'templates/',
        'math_utilities_css': 'css/',
        'math_utilities_js': 'js/math-utilities/',
        'math_utilities_templates': 'templates/core/math-utilities/',
        'math_utilities_data': 'data/math-utilities/',
        'interactive': 'interactive/'
    },

    /*
    * Stores a mapping for fontAwesome icons
    * 'fixed' prefix should be used only if the default font size has to be applied
    * @attribute _fontAwesomeIconData
    * @type Object
    */
    _fontAwesomeIconData = {
        'fixed-next': 'fa fa-chevron-right font-size-14',
        'fixed-back': 'fa fa-chevron-left font-size-14',
        'fixed-reset': 'fa fa-undo font-size-20',
        'fixed-undo': 'fa fa-reply font-size-18',
        'fixed-redo': 'fa fa-mail-forward font-size-18',
        'fixed-zoom-in': 'fa fa-search-minus font-size-18',
        'fixed-zoom-out': 'fa fa-search-plus font-size-18',
        'fixed-copy': 'fa fa-copy font-size-20',
        'fixed-cut': 'fa fa-scissors font-size-20',
        'fixed-trash': 'fa fa-trash-o font-size-20',
        'fixed-delete': 'fa fa-trash-o font-size-20',
        'fixed-skip-animation': 'fa fa-fast-forward font-size-18',
        'fixed-view': 'fa fa-eye font-size-20',
        'fixed-rotate': 'fa fa-de-rotate font-size-20',
        'fixed-reflect-x': 'fa fa-de-reflect-x font-size-18',
        'fixed-reflect-y': 'fa fa-de-reflect-y font-size-18',
        'fixed-translate': 'fa fa-arrows font-size-20',
        'fixed-view-data': 'fa fa-table font-size-20',
        'fixed-edit-pencil': 'fa fa-pencil font-size-20',


        'help': 'fa fa-question-circle',
        'save': 'fa fa-folder',
        'camera': 'fa fa-camera',
        'tts-play': 'fa fa-play',
        'tts-pause': 'fa fa-pause',
        'tts-sound': 'fa fa-volume-up',
        'drawer': 'fa fa-bars',
        'pop-out': '',
        'mute': 'fa fa-volume-off',
        'unmute': 'fa fa-volume-up',
        'back': 'fa fa-chevron-left',
        'next': 'fa fa-chevron-right',
        'back-circle': 'fa fa-chevron-circle-left',
        'next-circle': 'fa fa-chevron-circle-right',
        'reset': 'fa fa-undo',
        'plus': 'fa fa-plus',
        'minus': 'fa fa-minus',
        'zoom-in': 'fa fa-search-plus',
        'zoom-out': 'fa fa-search-minus',
        'arrow-left': 'fa fa-arrow-left',
        'arrow-right': 'fa fa-arrow-right',
        'trash': 'fa fa-trash-o',
        'delete': 'fa fa-trash-o',
        'eye': 'fa fa-eye',
        'trophy': 'fa fa-trophy',
        'close': 'fa fa-times',
        'sort-up': 'fa fa-sort-up',
        'sort-down': 'fa fa-sort-down',
        'caret-left': 'fa fa-caret-left',
        'lock': 'fa fa-lock',
        'caret-right': 'fa fa-caret-right',
        'plus-square': 'fa fa-plus-square',
        'edit-pencil': 'fa fa-pencil',
        'chevron-up': 'fa fa-chevron-up',
        'chevron-down': 'fa fa-chevron-down',
        'search': 'fa fa-search',
        'play-circle-o': 'fa fa-play-circle-o',
        'check-circle': 'fa fa-check-circle',
        'arrow-circle-left': 'fa fa-arrow-circle-left',
        'arrow-circle-right': 'fa fa-arrow-circle-right',
        'reply': 'fa fa-reply',
        'slide-down': 'fa fa-chevron-down',
        'slide-up': 'fa fa-chevron-up',
        'dot': 'fa fa-circle',
        'degree-sign': 'fa fa-circle-o',
        'angle-double-left': 'fa fa-angle-double-left',
        'angle-double-right': 'fa fa-angle-double-right',
        'star': 'fa fa-star',
        'skip-animation': 'fa fa-fast-forward',
        'gallery': 'fa fa-th',
    };
    /**
    * Holds functions and data related to path of the files to be rendered for activities
    *
    * @class Path
    * @namespace MathInteractives.Common.Player.Models
    * @extends Backbone.Model
    * @static
    */
    MathInteractives.Common.Player.Models.Path = Backbone.Model.extend({
        /**
        * Holds the data for paths as given in json file
        *
        * @property _pathData
        * @type Object
        * @default null
        */
        _pathData: null,

        /**
        * Holds the path interactivities folder
        *
        * @property _interactivitiesPath
        * @type Object
        * @default null
        */
        _interactivitiesPath: null,

        /**
        * Contains path for common folder
        *
        * @property _commonPath
        * @type String
        * @default ''
        */
        _commonPath: '',

        /**
        * Contains path for base path as provided
        *
        * @property _basePath
        * @type String
        * @default ''
        */
        _basePath: '',

        /**
        * Contains path for tts
        *
        * @property _ttsPath
        * @type String
        * @default ''
        */
        _ttsPath: '',

        /**
        * Contains name for current interactivity
        *
        * @property _appName
        * @type String
        * @default ''
        */
        _appName: '',

        /**
        * Contains path for css
        *
        * @attribute _cssPath
        * @type String
        * @default ''
        */
        _cssPath: '',

        /**
        * Contains path for animate css
        *
        * @attribute _animateCSSPath
        * @type String
        * @default ''
        */
        _animateCSSPath: '',

        /**
        * Contains path for data
        *
        * @attribute _dataPath
        * @type String
        * @default ''
        */
        _dataPath: '',

        /**
        * Contains path for js file
        *
        * @attribute _scriptPath
        * @type String
        * @default ''
        */
        _scriptPath: '',

        /**
        * Contains path for vendor folder
        *
        * @attribute _vendorPath
        * @type String
        * @default ''
        */
        _vendorPath: '',

        /**
        * Contains path for jQuery folder
        *
        * @attribute _jqueryPath
        * @type String
        * @default ''
        */
        _jqueryPath: '',

        /**
        * Contains path for Paper Js folder
        *
        * @attribute _paperJsPath
        * @type String
        * @default ''
        */
        _paperJsPath: '',

        /**
        * Contains path for Three Js folder
        *
        * @attribute _threeJsPath
        * @type String
        * @default ''
        */
        _threeJsPath: '',

        /**
        * Contains path for language folder
        *
        * @attribute _language
        * @type String
        * @default ''
        */
        _language: '',

        /**
        * Contains path for image folder
        *
        * @attribute _imagePath
        * @type String
        * @default ''
        */
        _imagePath: '',

        /**
        * Contains path for highcharts folder
        *
        * @attribute _highchartsPath
        * @type String
        * @default ''
        */
        _highchartsPath: '',

        /**
        * Contains path for mathQuill folder
        *
        * @attribute _mathquillPath
        * @type String
        * @default ''
        */
        _mathquillPath: '',

        /**
        * Contains path for video folder
        *
        * @attribute _videoPath
        * @type String
        * @default ''
        */
        _videoPath: '',

        /**
        * Contains path for audio folder
        *
        * @attribute _audioPath
        * @type String
        * @default ''
        */
        _audioPath: '',

        /**
        * Contains path for fonts folder
        *
        * @attribute _fontsPath
        * @type String
        * @default ''
        */
        _fontsPath: '',

        /**
        * Contains path for templates folder
        *
        * @attribute _templatePath
        * @type String
        * @default ''
        */
        _templatePath: '',

        /**
        * Holds the image files in interactivity
        *
        * @property imageFiles
        * @type Array
        * @default null
        */
        imageFiles: null,

        /**
        * Contains path of static directory of the core repository.
        *
        * @attribute _coreStaticPath
        * @type String
        * @default ''
        */
        _coreStaticPath: null,

        /**
        * Contains path for math utility css.
        *
        * @attribute _cssPath
        * @type String
        * @default ''
        */
        _mathUtilitiesCssPath: null,

        /**
        * Contains path for math utility js files.
        *
        * @attribute _mathUtilityJsPath
        * @type String
        * @default ''
        */
        _mathUtilitiesJsPath: null,

        /**
        * Contains path for math utility templates folder.
        *
        * @attribute _mathUtilityTemplatePath
        * @type String
        * @default ''
        */
        _mathUtilitiesTemplatePath: null,

        /**
        * Contains path for math utility data.
        *
        * @attribute _mathUtilityDataPath
        * @type String
        * @default ''
        */
        _mathUtilitiesDataPath: null,

        /**
        * Contains path for interactive folder.
        *
        * @attribute _mathUtilityDataPath
        * @type String
        * @default ''
        */
        _interactivePath: null,

        /**
        * Contains minify bool.
        *
        * @property _minify
        * @type bool
        * @default false
        */
        _minify: false,

        /**
        * Contains dist folder path .
        *
        * @property _dist
        * @type string
        * @default null
        */
        _dist: null,

        /**
        * Contains audio file data wrt to its audio id.
        *
        * @property _audioFilesDataMap
        * @type {object}
        * @default null
        */
        _audioFilesDataMap: null,

        /**
        * Called upon intialization of the model's object.
        * @method initialize
        */
        initialize: function initialize() {
            this._loadPathInformation();
            this._loadFontAwesomeIconData();
        },

        /**
        * Get json file.
        * @method _loadPathInformation
        */
        _loadPathInformation: function _loadPathInformation() {
            this._pathData = _pathData;
        },

        /**
        * Get icon classes.
        * @method _loadFontAwesomeIconData
        */
        _loadFontAwesomeIconData: function _loadFontAwesomeIconData() {
            this._fontAwesomeIconData = _fontAwesomeIconData;
        },

        /**
        * Called to initialize path w.r.t. app name and language.
        * @method initializeAppPath
        * @param {Object} pathOptions Stores the options for path
        */
        initializeAppPath: function initializeAppPath(pathOptions) {


            var isApp,
                isBase,
                isCoreStatic,
                appName = pathOptions.folder,
                language = pathOptions.lang,
                basePath = pathOptions.basePath,
                coreStaticPath = pathOptions.coreStaticPath || basePath + '/temporary-static/';

            this._minify = pathOptions.minify;

            if (appName) {
                isApp = appName.trim().length;
            }
            if (isApp > 0) {
                this._appName = appName;
            }

            if (basePath) {
                isBase = basePath.trim().length;
            }
            if (isBase > 0) {
                this._basePath = basePath;
            }

            if (coreStaticPath) {
                isCoreStatic = coreStaticPath.trim().length;
            }
            if (isCoreStatic > 0) {
                this._coreStaticPath = coreStaticPath;
            }


            switch (language) {
                case 'en':
                    this._language = this._pathData.languages.en;
                    break;

                case 'es':
                    this._language = this._pathData.languages.es;
                    break;

                default:
                    this._language = this._pathData.languages.en;
            }
            this._setPathInformation();

        },

        /**
        * Set attributes after json file loaded.
        * @method _setPathInformation
        */
        _setPathInformation: function _setPathInformation() {
            this._commonPath = this._pathData.common;
            this._interactivitiesPath = this._pathData.interactivities;
            this._cssPath = this._pathData.css;
            this._dataPath = this._pathData.data;
            this._scriptPath = this._pathData.js;
            this._jqueryPath = this._pathData.jquery;
            this._paperJsPath = this._pathData.paperJs;
            this._threeJsPath = this._pathData.threeJs;
            this._highchartsPath = this._pathData.highcharts;
            this._mathquillPath = this._pathData.mathquill;
            this._imagePath = this._pathData.image;
            this._videoPath = this._pathData.video;
            this._audioPath = this._pathData.audio;
            this._templatePath = this._pathData.templates;
            this._vendorPath = this._pathData.vendor;
            this._pluginPath = this._pathData.plugin;
            this._ttsPath = this._pathData.tts;
            this._fontsPath = this._pathData.fonts;
            this._theme = this._pathData.theme[0];
            this._mathUtilitiesCssPath = this._pathData.math_utilities_css;
            this._mathUtilitiesJsPath = this._pathData.math_utilities_js;
            this._mathUtilitiesTemplatePath = this._pathData.math_utilities_templates;
            this._mathUtilitiesDataPath = this._pathData.math_utilities_data;
            this._dist = this._pathData.dist;
            this._interactivePath = this._pathData.interactive;
            this._animateCSSPath = this._pathData.animate;
        },


        /*Sets theme folder
        * @param themeId {Nmber}
        */
        setCSSThemeFolder: function setCSSThemeFolder(themeId) {
            this._theme = this._pathData.theme[themeId - 1] || this._pathData.theme[0];
        },

        /**
        * Set imageBase64Map which contains base64 strings of images mapped on its url
        * This value is set from initApp() function of MathInteractives.Common.Player.Models.InteractivityPreloader
        * @public
        * @method setImageBase64Map
        */
        setImageBase64Map: function setImageBase64Map(imageBase64Map) {
            this.set('_imageBase64Map', imageBase64Map);
        },

        _getImageBase64Map: function () {
            return this.get('_imageBase64Map');
        },

        /**
        * Called to get path for the file as type specified.
        * @method getImagePath
        * @param {String} imageId id of image file
        * @return {String} path
        */
        getImagePath: function getImagePath(imageId) {
            var imageFiles = this.imageFiles,
                currentImage, imageURL;

            return imageFiles[imageId].path;
        },

        /**
        * Called to get class of font-awesome icon
        * @method getFontAwesomeClass
        * @param {String} iconId id of icon
        */
        getFontAwesomeClass: function getFontAwesomeClass(iconId) {
            var fontAwesomeIconData = this._fontAwesomeIconData;
            return fontAwesomeIconData[iconId];
        },

        /**
        * Called to get elemnt for the file as type specified.
        * @method getImageElement
        * @param {String} imageId id of image file
        * @return {Object} img element
        */
        getImageElement: function getImageElement(imageId) {
            var currentImage = this.imageFiles[imageId] || {};
            return currentImage.element;
        },

        /**
        * Called to get base64 string for an image by its id
        * @method getImageBase64
        * @param {String} id of image file
        * @return {String} base64 string
        */
        getImageBase64: function getImageBase64(imageId, successCallBack, errorCallBack) {

            return this.getImagePath(imageId);

            var imageBase64Map = this._getImageBase64Map(),
                base64 = imageBase64Map[this.getImagePath(imageId)],
            base64URL = 'data:image/png;base64,' + base64;
            if (typeof base64 === 'undefined') {
                base64URL = '';
            }
            return base64URL;
        },


        /**
        * Called to get path for the file as type specified.
        * @method getPath
        * @param {String} option Type of file whose path to get
        * @return {String} path
        */
        getPath: function getPath(option) {
            var folders = MathInteractives.Common.Player.Models.Path.FOLDERS,
                basePath = this._basePath,
                appName = this._appName,
                startPath = '',
                coreStaticPath = this._coreStaticPath,
                commonStartPath = basePath + this._commonPath,
                commonCSSVendorPath = commonStartPath + this._cssPath + this._vendorPath,
                commonVendorPath = commonStartPath + this._scriptPath + this._vendorPath,
                interactiveActualPath, commonActualPath = commonStartPath;



            if (basePath) {
                basePath += '/';
            }
            if (appName) {
                startPath += basePath + this._interactivitiesPath + appName + '/';
                interactiveActualPath = startPath;
            }
            if (coreStaticPath) {
                coreStaticPath += '/';
            }

            //changes commonStartPath if minify files to load
            commonStartPath = (this._minify) ? (commonStartPath + this._dist) : commonStartPath;
            //changes interactive startPath if minify files to load
            startPath = (this._minify) ? (startPath + this._dist) : startPath;

            switch (option) {
                case folders.CSS:
                    return startPath + this._cssPath;
                    break;

                case folders.DATA:
                    return startPath + this._dataPath;
                    break;

                case folders.LANG_JSON:
                    return startPath + this._language + this._dataPath;
                    break;

                case folders.SCRIPT:
                    return startPath + this._scriptPath;
                    break;

                case folders.IMAGE:
                    return interactiveActualPath + this._imagePath;
                    break;

                case folders.AUDIO:
                    return interactiveActualPath + this._audioPath;
                    break;

                case folders.VIDEO:
                    return interactiveActualPath + this._videoPath;
                    break;

                case folders.TEMPLATE:
                    return startPath + this._templatePath;
                    break;

                case folders.JQUERY_JS:
                    return commonVendorPath
                                + this._jqueryPath + this._scriptPath;
                    break;

                case folders.THREE_JS:
                    return commonVendorPath
                                + this._threeJsPath;
                    break;

                case folders.PAPER_JS:
                    return commonVendorPath
                                + this._paperJsPath;
                    break;

                case folders.COMMON_CSS:
                    return commonStartPath + this._cssPath + this._theme;
                    break;

                case folders.COMMON_DATA:
                    return commonStartPath + this._dataPath;
                    break;

                case folders.COMMON_LANG_JSON:
                    return commonStartPath + this._language + this._dataPath;
                    break;

                case folders.COMMON_LANG_IMAGE:
                    return commonStartPath + this._language + this._imagePath;
                    break;

                case folders.INTERACTIVE_LANG_IMAGE:
                    return interactiveActualPath + this._language + this._imagePath;
                    break;

                case folders.COMMON_SCRIPT:
                    return commonStartPath + this._scriptPath;
                    break;

                case folders.COMMON_TEMPLATE:
                    return commonStartPath + this._templatePath;
                    break;

                case folders.COMMON_IMAGE:
                    return commonActualPath + this._imagePath;
                    break;

                case folders.COMMON_AUDIO:
                    return commonActualPath + this._audioPath;
                    break;

                case folders.TTS:
                    //return commonVendorPath + this._ttsPath;
                    return coreStaticPath + this._vendorPath + this._ttsPath;
                    break;
                case folders.FONTS:
                    return commonActualPath + this._fontsPath;
                    break;
                case folders.HIGHCHARTS:
                    return coreStaticPath + this._vendorPath
                                + this._highchartsPath;
                    break;
                case folders.JQUERY_CSS:
                    return commonVendorPath
                                + this._jqueryPath + this._cssPath;
                    break;
                case folders.PLUGIN:
                    return commonStartPath + this._scriptPath + this._pluginPath;
                    break;
                case folders.MATHQUILL:
                    return coreStaticPath + this._vendorPath + this._mathquillPath;
                    break;

                case folders.MATH_UTILITIES_CORE: {
                    return coreStaticPath;
                    break;
                }
                case folders.MATH_UTILITIES_CSS:
                    return coreStaticPath + this._mathUtilitiesCssPath;
                    break;

                case folders.MATH_UTILITIES_JS:
                    return coreStaticPath + this._mathUtilitiesJsPath;
                    break;

                case folders.MATH_UTILITIES_TEMPLATES:
                    return coreStaticPath + this._mathUtilitiesTemplatePath;
                    break;

                case folders.MATH_UTILITIES_DATA:
                    return coreStaticPath + this._mathUtilitiesDataPath;
                    break;

                case folders.COMMON_INTERACTIVE_CSS:
                    return commonStartPath + this._cssPath + this._interactivePath;
                    break;

                case folders.COMMON_SCRIPT_FONTS:
                    return commonActualPath + this._scriptPath + this._fontsPath;
                    break;

                case folders.COMMON_INTERACTIVE_IMAGE:
                    return commonActualPath + this._imagePath + this._interactivePath;
                    break;

                case folders.COMMON_VENDOR:
                    {
                        return commonVendorPath;
                        break;
                    }

                case folders.COMMON_VENDOR_CSS:
                    return commonCSSVendorPath;
                    break;

                case folders.ANIMATE_CSS:
                    return coreStaticPath + this._cssPath + this._animateCSSPath;
                    break;

                case folders.VENDOR_DIST:
                    return commonStartPath + this._scriptPath + this._vendorPath;
                    break;

                default:
                    return '';
            }
        },

        /*
        * Updates audio files data map into model props
        * @method updateAudioDataMap
        * @param audioFileDataMap {object}
        * @public
        */
        updateAudioDataMap: function updateAudioDataMap(audioFileDataMap) {
            this._audioFilesDataMap = audioFileDataMap;
        },

        /*
        * Returns audio path wrt to id
        * @method getAudioPath
        * @param audioId {string}
        * @return {string} audio path
        * @public
        *
        */
        getAudioPath: function getAudioPath(audioId) {
            var audio = this._audioFilesDataMap[audioId] || null;
            if (audio !== null) {
                return audio.url;
            }
            return '';
        },

        /*
        * Returns audio sprite data wrt to id
        * @method getAudioData
        * @param audioId {string}
        * @return {object} audio data
        * @public
        *
        */
        getAudioData: function getAudioData(audioId) {
            var audio = this._audioFilesDataMap[audioId] || null;
            if (audio !== null) {
                return audio.data;
            }
            return {};
        }

    }, {

        /**
        * Holds the types of files to be rendered
        *
        * @static
        **/
        FOLDERS: {
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
            MATHQUILL: 'MATHQUILL',
            COMMON_CSS: 'COMMON_CSS',
            COMMON_DATA: 'COMMON_DATA',
            COMMON_LANG_JSON: 'COMMON_LANG_JSON',
            COMMON_LANG_IMAGE: 'COMMON_LANG_IMAGE',
            INTERACTIVE_LANG_IMAGE: 'INTERACTIVE_LANG_IMAGE',
            COMMON_SCRIPT: 'COMMON_SCRIPT',
            COMMON_TEMPLATE: 'COMMON_TEMPLATE',
            COMMON_IMAGE: 'COMMON_IMAGE',
            COMMON_AUDIO: 'COMMON_AUDIO',
            TTS: 'TTS',
            FONTS: 'FONTS',
            JQUERY_CSS: 'JQUERY_CSS',
            PLUGIN: 'PLUGIN',
            MATH_UTILITIES_CORE: 'MATH_UTILITIES_CORE',
            MATH_UTILITIES_CSS: 'MATH_UTILITIES_CSS',
            MATH_UTILITIES_JS: 'MATH_UTILITIES_JS',
            MATH_UTILITIES_TEMPLATES: 'MATH_UTILITIES_TEMPLATES',
            MATH_UTILITIES_DATA: 'MATH_UTILITIES_DATA',
            COMMON_VENDOR: 'COMMON_VENDOR',
            COMMON_INTERACTIVE_CSS: 'COMMON_INTERACTIVE_CSS',
            COMMON_VENDOR_CSS: 'COMMON_VENDOR_CSS',
            COMMON_INTERACTIVE_IMAGE: 'COMMON_INTERACTIVE_IMAGE',
            ANIMATE_CSS: "ANIMATE_CSS",
            VENDOR_DIST: "VENDOR_DIST"
        },

        /**
        * Holds the types of Theme to be rendered
        *
        * @static
        **/
        THEME: {
            THEME_1: 0,
            THEME_2: 1
        }

    });


    MathInteractives.global.Path = MathInteractives.Common.Player.Models.Path;
    return MathInteractives.global.Path;
})(window.MathInteractives);
