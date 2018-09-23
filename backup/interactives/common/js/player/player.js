(function () {
    'use strict';
    $(document).ready(function () {
        var uagent = navigator.userAgent.toLowerCase();
        var queryStringValues = getQueryStringData();
        var options = {};
        options.folder = queryStringValues.app;
        options.initialTabindex = 0;
		// Setting Accessibility default to true
        options.bAllowAccessibility = true;
        if (queryStringValues.tabindex) {
            options.initialTabindex = queryStringValues.tabindex;
        }

        options.basePath = '../';
        if (queryStringValues.basePath) {
            options.basePath = queryStringValues.basePath;
        }
        options.prefix = options.folder + '-';
        options.containerId = '.de-mathematics-interactive.' + options.folder;
        $('body').addClass('de-mathematics-interactive ' + options.folder +' player-theme-2');
        var interactivityPreload = new MathInteractives.Common.Player.Models.InteractivityPreloader({ interactiveOptions: options });
        var interactivityPreloadView =
                    new MathInteractives.Common.Player.Views.InteractivityPreloader({ model: interactivityPreload });
        //interactivityPreload.preload(MathInteractives.Common.Preloader)

        interactivityPreload.initiatePreload();

        /*Add role for accessibility*/
        if (uagent.indexOf('chrome') != -1) {
            $('.player').attr('role', 'application');
        }
        else {
            $('body').attr('role', 'application');

        }

        createFunctionBindWhenUndefined();

    });

    function getQueryStringData() {
        var queryString = decodeURIComponent(location.search.substring(1, location.search.length));
        var queryStringData = {};
        //generate key value player
        var keyValuePairs = queryString.split('&');

        for (var keyIndex in keyValuePairs) {
            var currentKeyValue = keyValuePairs[keyIndex].split('=');
            queryStringData[currentKeyValue[0]] = currentKeyValue[1]
        }
        return queryStringData;
    }


    /**
    * Function.prototype.bind functionality is not present in all broswers. 
    * To allow the use of the functionality the following function is created.
    * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
    */


    function createFunctionBindWhenUndefined() {

        if (typeof Function.prototype.bind === 'undefined') {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== "function") {
                    // closest thing possible to the ECMAScript 5 internal IsCallable function
                    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    fNOP = function () { },
                    fBound = function () {
                        return fToBind.apply(this instanceof fNOP && oThis
                                               ? this
                                               : oThis,
                                             aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                fNOP.prototype = this.prototype;
                fBound.prototype = new fNOP();

                return fBound;
            };
        }
    }
})();