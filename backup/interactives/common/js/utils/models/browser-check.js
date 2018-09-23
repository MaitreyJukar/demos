(function () {
    'use strict';


    /**
    * Holds the business logic and browser check functions
    * @class BrowserCheck
    * @extends Backbone.Model.extend
    * @namespace MathInteractives.Common.Utilities.Models
    * @constructor
    */
    MathInteractives.Common.Utilities.Models.BrowserCheck = Backbone.Model.extend({}, {

        /**
        * whether device is running on Android OS
        * @property isAndroid
        * @type boolean
        * @default null
        */
        isAndroid: null,
        /**
        * whether device is running on Windows OS
        * @property isWindows
        * @type boolean
        * @default null
        */
        isWindows: null,
        /**
        * whether device is mobile (excluding ipads)
        * @property isMobile
        * @type boolean
        * @default null
        */
        isMobile: null,
        /**
        * whether device using Mac Browser
        * @property isMac
        * @type boolean
        * @default null
        */
        isMac: null,
        /**
        * whether device using Internet Explorer
        * @property isIE
        * @type boolean
        * @default null
        */
        isIE: null,
        /**
        * whether device using Internet Explorer 11
        * @property isIE11
        * @type boolean
        * @default null
        */
        isIE11: null,
        /**
        * whether device using Firefox browser
        * @property isFirefox
        * @type boolean
        * @default null
        */
        isFirefox: null,
        /**
        * whether device using Chrome Browser
        * @property isChrome
        * @type boolean
        * @default null
        */
        isChrome: null,
        /**
        * whether device using Safari Browser
        * @property isSafari
        * @type boolean
        * @default null
        */
        isSafari: null,
        /**
        * whether mobile device using Safari Browser
        * @property isIOS
        * @type boolean
        * @default null
        */
        isIOS: null,
        /**
        * detects current browser version
        * @property browserVersion
        * @type String
        * @default null
        */
        browserVersion: null,
        /**
        * whether mobile device is Nexus
        * @property isNexus
        * @type String
        * @default null
        */
        isNexus: null,

        /**
        * initialises browser check properties
        *
        * @method init
        * @public
        **/
        init: function () {
            var userAgent, isAndroid, isMac, isWindows, isMobile, isIE, isFirefox, isChrome, isIE11, isNexus,
                isSafari, isIOS, browserVersion, match, sVersionMarker, iIndexOfVersion,
                USER_AGENTS = MathInteractives.Common.Utilities.Models.BrowserCheck.USER_AGENTS;
            userAgent = navigator.userAgent.toLowerCase();
            isAndroid = userAgent.indexOf(USER_AGENTS.ANDROID) > -1;
            isMac = userAgent.indexOf(USER_AGENTS.MACINTOSH) > -1;
            isWindows = userAgent.indexOf(USER_AGENTS.WINDOWS) > -1;
            isIE = userAgent.indexOf(USER_AGENTS.MSIE) > -1;
            isIE11 = userAgent.indexOf(USER_AGENTS.TRIDENT) > -1;
            isFirefox = userAgent.indexOf(USER_AGENTS.FIREFOX) > -1;
            isChrome = userAgent.indexOf(USER_AGENTS.CHROME) > -1;
            isSafari = !isChrome && userAgent.indexOf(USER_AGENTS.SAFARI) > -1;
            isIOS = userAgent.indexOf(USER_AGENTS.MOBILE) > -1 && isSafari;
            isNexus = userAgent.indexOf(USER_AGENTS.NEXUS) > -1;


            //This is the global flag for loading touchscreen specific versions
            //Currently, load tablet and touchscreen specific versions
            //For ANDROID and IOS
            //To extend support for other platforms, add them in OR conditions...
            isMobile = isAndroid || isIOS;
            //isMobile = userAgent.indexOf(USER_AGENTS.MOBILE) > -1 && userAgent.indexOf(USER_AGENTS.IPAD) === -1;

            // Don't clobber any existing jQuery.browser in case it's different
            match = /(chrome)[ \/]([\w.]+)/.exec(userAgent) || /(webkit)[ \/]([\w.]+)/.exec(userAgent) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(userAgent) || /(msie) ([\w.]+)/.exec(userAgent) || userAgent.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(userAgent) || [];

            browserVersion = match[2] || "0";

            if (isWindows && isChrome) {
                sVersionMarker = USER_AGENTS.CHROME;
                iIndexOfVersion = userAgent.indexOf(sVersionMarker);
                browserVersion = parseInt(userAgent.substring(iIndexOfVersion + sVersionMarker.length + 1, userAgent.indexOf(" ", iIndexOfVersion)), 10);
            }
            else if (isAndroid) {
                sVersionMarker = USER_AGENTS.ANDROID;
                iIndexOfVersion = userAgent.indexOf(sVersionMarker);
                browserVersion = parseFloat(userAgent.substring(iIndexOfVersion + sVersionMarker.length + 1, userAgent.indexOf(";", iIndexOfVersion)), 10);
            }
            else if (isIOS || (isWindows && isSafari)) {
                sVersionMarker = "version/";
                iIndexOfVersion = userAgent.indexOf(sVersionMarker);
                browserVersion = parseFloat(userAgent.substring(iIndexOfVersion + sVersionMarker.length, userAgent.indexOf(" ", iIndexOfVersion)), 10);
            }

            var BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
            BrowserCheck.isAndroid = isAndroid;
            BrowserCheck.isWindows = isWindows;
            BrowserCheck.isMobile = isMobile;
            BrowserCheck.isMac = isMac;
            BrowserCheck.isIE = isIE;
            BrowserCheck.isIE11 = isIE11;
            BrowserCheck.isFirefox = isFirefox;
            BrowserCheck.isChrome = isChrome;
            BrowserCheck.isSafari = isSafari;
            BrowserCheck.isIOS = isIOS;
            BrowserCheck.browserVersion = browserVersion;
            BrowserCheck.isNexus = isNexus;
        },
        USER_AGENTS: {
            ANDROID: 'android',
            MACINTOSH: 'macintosh',
            WINDOWS: 'windows',
            MOBILE: 'mobile',
            IPAD: 'ipad',
            MSIE: 'msie',
            TRIDENT: 'trident',
            FIREFOX: 'firefox',
            CHROME: 'chrome',
            SAFARI: 'safari',
            NEXUS: 'nexus'
        }
    });
    MathInteractives.Common.Utilities.Models.BrowserCheck.init();
})();

