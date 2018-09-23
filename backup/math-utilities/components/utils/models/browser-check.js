/* global MathUtilities */

(function() {
    'use strict';
    if (MathUtilities.Components.Utils === void 0) {
        MathUtilities.Components.Utils = {};
    }

    if (MathUtilities.Components.Utils.Models === void 0) {
        MathUtilities.Components.Utils.Models = {};
    }

    MathUtilities.Components.Utils.Models.BrowserCheck = Backbone.Model.extend({}, {
        "isAndroid": null,
        "isWindows": null,
        "isMobile": null,
        "isMac": null,
        "isIE": null,
        "isFirefox": null,
        "isChrome": null,
        "isSafari": null,
        "isIOS": null,
        "isIOS8": null,
        "browserVersion": null,
        "init": function() {
            var userAgent, match, versionMarker, indexOfVersion,
                BrowserCheckModel = MathUtilities.Components.Utils.Models.BrowserCheck;

            userAgent = navigator.userAgent.toLowerCase();
            BrowserCheckModel.isAndroid = userAgent.indexOf("android") > -1;
            BrowserCheckModel.isMac = userAgent.indexOf("macintosh") > -1;
            BrowserCheckModel.isWindows = userAgent.indexOf("windows") > -1;
            BrowserCheckModel.isIE = userAgent.indexOf("msie") > -1;
            BrowserCheckModel.isIE11 = !!userAgent.match(/trident.*rv\:11\./); //check browser is ie 11 or not
            BrowserCheckModel.isFirefox = userAgent.indexOf("firefox") > -1;
            BrowserCheckModel.isChrome = userAgent.indexOf("chrome") > -1;
            BrowserCheckModel.isSafari = !BrowserCheckModel.isChrome && userAgent.indexOf("safari") > -1;
            BrowserCheckModel.isIOS = userAgent.indexOf("mobile") > -1 && BrowserCheckModel.isSafari;
            BrowserCheckModel.isIOS8 = /(iphone|ipod|ipad).*os 8_/.test(userAgent.toLowerCase());
            BrowserCheckModel.isMobile = BrowserCheckModel.isIOS || BrowserCheckModel.isAndroid;
            BrowserCheckModel.isChromeOS = userAgent.indexOf("cros") > -1;
            BrowserCheckModel.isChromeOSTouchAndType = BrowserCheckModel.isChromeOS && "ontouchstart" in window;

            if (BrowserCheckModel.isWindows && BrowserCheckModel.isChrome) {
                versionMarker = "chrome";
                indexOfVersion = userAgent.indexOf(versionMarker);
                BrowserCheckModel.browserVersion = parseInt(userAgent.substring(indexOfVersion + versionMarker.length + 1, userAgent.indexOf(" ", indexOfVersion)), 10);
            } else if (BrowserCheckModel.isAndroid) {
                versionMarker = "android";
                indexOfVersion = userAgent.indexOf(versionMarker);
                BrowserCheckModel.browserVersion = parseFloat(userAgent.substring(indexOfVersion + versionMarker.length + 1, userAgent.indexOf(";", indexOfVersion)));
            } else if (BrowserCheckModel.isIOS || BrowserCheckModel.isWindows && BrowserCheckModel.isSafari) {
                versionMarker = "version/";
                indexOfVersion = userAgent.indexOf(versionMarker);
                BrowserCheckModel.browserVersion = parseFloat(userAgent.substring(indexOfVersion + versionMarker.length, userAgent.indexOf(" ", indexOfVersion)));
            } else {
                // Don't clobber any existing jQuery.browser in case it's different
                match = /(chrome)[ \/]([\w.]+)/.exec(userAgent) ||
                    /(webkit)[ \/]([\w.]+)/.exec(userAgent) ||
                    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(userAgent) ||
                    /(msie) ([\w.]+)/.exec(userAgent) ||
                    userAgent.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(userAgent) || [];

                BrowserCheckModel.browserVersion = match[2] || "0";
            }
        }
    });
    MathUtilities.Components.Utils.Models.BrowserCheck.init();
})();
