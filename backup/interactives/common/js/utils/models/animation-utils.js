(function () {
    'use strict';
    var AnimationUtils = Backbone.Model.extend({
},
    {
        _nID: 0,
        _oSelectors: {},
        _oBgSequences: {},
        _oTimers: {},
        _oStopWatches: {},
        _oIntervals: {},
        _arrAnimates: [],

        _TIMEOUT: "timeout",
        _BG_SEQUENCE: "bg_sequence",
        _ANIMATE: "animate",
        _FADE_IN: "fade_in",
        _FADE_OUT: "fade_out",


        setTimeout: function (fncOnTimeOut, nDuration) {
            return AnimationUtils.setInterval(fncOnTimeOut, nDuration, 0);
        },

        setInterval: function (fncOnTimeOut, nDuration, numIterations, strID) {
            nDuration = nDuration != undefined ? nDuration : 400;
            if (nDuration > 150) {
                var nOffset = 1;
                var nOriginalDuration = nDuration;
                while (AnimationUtils._oTimers[nDuration]) {
                    nDuration = nOriginalDuration + nOffset;
                    if (nOffset < 0) {
                        nOffset = (-nOffset) + 1;
                    }
                    else {
                        nOffset = -nOffset;
                    }
                }
            }
            var oConfig = new Object();
            oConfig.iCurrentFrame = 0;
            oConfig.iMaxFrame = numIterations;
            oConfig.iTimeoutDuration = nDuration;
            oConfig.fOnProgress = fncOnTimeOut;
            var oData = new Object();
            oData.strType = AnimationUtils._TIMEOUT;
            oData.oConfig = oConfig;
            oData.strID = strID ? strID : "animation" + AnimationUtils._nID++;
            if (AnimationUtils._oIntervals[oData.strID]) {
                throw new Error("Invalid Input Received");
            }
            AnimationUtils._oIntervals[oData.strID] = nDuration;
            AnimationUtils._runAnimation(oData);
            return oData.strID;
        },

        clearTimeout: function (strID, bFireComplete) {
            AnimationUtils.clearInterval(strID, bFireComplete);
        },

        clearInterval: function (strID, bFireComplete) {
            var oIntervals = AnimationUtils._oIntervals;
            var nTimerDuration = oIntervals[strID];
            var arrBgSequences = AnimationUtils._oBgSequences[nTimerDuration];
            if (nTimerDuration == null) {
                //	Debug("Warning --- AnimationUtils.clearInterval No such Timer exists " + strID);
                return;
            }

            var oAnimationObject;
            for (var i = arrBgSequences.length - 1; i >= 0; i--) {
                oAnimationObject = arrBgSequences[i];
                if (oAnimationObject.strID === strID) {
                    break;
                }
            }
            delete oIntervals[strID];
            AnimationUtils._stopAnimation(oAnimationObject);
            var fOnTimeout = oAnimationObject.fOnProgress;
            if (bFireComplete && fOnTimeout) {
                if (oAnimationObject.oConfig.iMaxFrame == 0) {
                    fOnTimeout();
                }
                else {
                    AnimationUtils.setInterval(fOnTimeout, 0, oAnimationObject.oConfig.iMaxFrame, strID);
                }
            }
        },

        animate: function (strSelector) {
            var arrOptions = [].splice.call(arguments, 0);
            AnimationUtils._setAnimationParams(arrOptions, AnimationUtils._ANIMATE);
        },

        fadeIn: function (strSelector) {
            var arrOptions = [].splice.call(arguments, 0);
            AnimationUtils._setAnimationParams(arrOptions, AnimationUtils._FADE_IN);
        },
        fadeOut: function (strSelector) {
            var arrOptions = [].splice.call(arguments, 0);
            AnimationUtils._setAnimationParams(arrOptions, AnimationUtils._FADE_OUT);
        },

        runBgSequence: function (strSelector, oConfig) {
            if (!oConfig) {
                var oConfig = new Object();
            }
            oConfig.bReverse = oConfig.bReverse ? oConfig.bReverse : false;
            oConfig.iMinFrame = oConfig.iMinFrame ? oConfig.iMinFrame : 0;
            oConfig.iCurrentFrame = oConfig.iCurrentFrame ? oConfig.iCurrentFrame : 0;
            oConfig.iMaxFrame = oConfig.iMaxFrame ? oConfig.iMaxFrame : (parseInt($(strSelector).attr("data-numFrames")) - 1);
            oConfig.bHorizontal = oConfig.bHorizontal ? oConfig.bHorizontal : false;
            oConfig.bRepeat = oConfig.bRepeat ? oConfig.bRepeat : false;
            oConfig.iPixelGap = oConfig.iPixelGap ? oConfig.iPixelGap : 5;
            oConfig.iTimeoutDuration = oConfig.iTimeoutDuration ? oConfig.iTimeoutDuration : parseInt($(strSelector).attr("data-durationPerFrame"));
            if (!oConfig.iTimeoutDuration) {
                throw new Error("No Timeout Duration Provided for " + strSelector);
            }
            var oData = new Object();
            oData.oConfig = oConfig;
            var oVisualElement = oData._oVisualElement = $(strSelector);
            oData.strSelector = strSelector;
            oData.strID = "animation" + AnimationUtils._nID++;

            var nWidth = oVisualElement.width() + parseInt(oVisualElement.css("padding-left")) + parseInt(oVisualElement.css("padding-right"));
            var nHeight = oVisualElement.height() + parseInt(oVisualElement.css("padding-top")) + parseInt(oVisualElement.css("padding-bottom"));

            // Optimization starts-------------------------------------------------------

            var checkBrowser = MathInteractives.Common.Utilities.Models.BrowserCheck,
            version = parseInt(checkBrowser.browserVersion),
             arrBGPos = [];
            if (checkBrowser.isIE && version === 9) {
                //  As IE9 doesn't support 'background-position' property while getting value.
                var defaultView = document.defaultView,
                    computedStyle = defaultView.getComputedStyle(oVisualElement[0]);
                arrBGPos[0] = computedStyle.getPropertyValue('background-position-x');
                arrBGPos[1] = computedStyle.getPropertyValue('background-position-y');
                //arrBGPos[0] = oVisualElement.css('background-position-x');
                //arrBGPos[1] = oVisualElement.css('background-position-y');
            }
            else {
                // Firefox doesn't support 'background-position-x' and 'background-position-y' while getting value.
                // Chrome and IE 11 supports both.
                var backPosition = oVisualElement.css("background-position");
                if (backPosition === null || backPosition === undefined) {
                 //    IE10 creates an issue on Local Inline.
                    backPosition = oVisualElement.css('background-position-x') + ' ' + oVisualElement.css('background-position-y');
                }
                arrBGPos = backPosition.split(" ");
            }

            // Optimized Code starts----------------------------------------------------
            if (oConfig.bHorizontal) {
                nWidth = nWidth + oConfig.iPixelGap;
                nHeight = parseFloat(arrBGPos[1]);
            }
            else {
                nWidth = parseFloat(arrBGPos[0]);
                nHeight = nHeight + oConfig.iPixelGap;
            }

            oData.nX = [];
            oData.nY = [];
            for (var i = oConfig.iMinFrame; i <= oConfig.iMaxFrame; i++) {
                // If sprite is horizontal : x should be zero, If sprite is vertical : y should be zero
                if (oConfig.bHorizontal) {
                    oData.nX[i] = -(i * nWidth);
                    oData.nY[i] = nHeight;
                }
                else {
                    oData.nX[i] = nWidth;
                    oData.nY[i] = -(i * nHeight);
                }
            }
            // Optimized Code ends------------------------------------------------------

            // Optimization ends--------------------------------------------------------

            oData.strType = AnimationUtils._BG_SEQUENCE;
            AnimationUtils._runAnimation(oData);
            //return AnimationUtils._runAnimation(oData);

        },

        pause: function () {

            var oTimers = AnimationUtils._oTimers;
            var oTimer;
            var oStopWatches = AnimationUtils._oStopWatches;
            for (var strItem in oTimers) {
                oTimer = oTimers[strItem];
                clearInterval(oTimer);
                oStopWatches[strItem].stop();
            }

            var oAnimationObject;
            var arrAnimates = AnimationUtils._arrAnimates;
            var nLapsedTime;
            var arrOptions;
            var nRemainingTime;
            var oStopWatch;
            for (var i = arrAnimates.length - 1; i >= 0; i--) {
                oAnimationObject = arrAnimates[i];
                oStopWatch = oAnimationObject.oStopWatch;
                oStopWatch.stop();
                nLapsedTime = oStopWatch.nElapsedMilliseconds;
                arrOptions = oAnimationObject.arrOptions;
                switch (oAnimationObject.strType) {
                    case AnimationUtils._FADE_IN:
                    case AnimationUtils._FADE_OUT:
                    case AnimationUtils.SHOW:
                    case AnimationUtils.HIDE:
                        nRemainingTime = arrOptions[0] = arrOptions[0] - nLapsedTime
                        break;
                    case AnimationUtils._ANIMATE:
                        var oOptions = arrOptions[1];
                        if (typeof oOptions == "object") {
                            nRemainingTime = oOptions.duration = oOptions.duration - nLapsedTime
                        }
                        else {
                            nRemainingTime = arrOptions[1] = arrOptions[1] - nLapsedTime;
                        }
                        break;
                }
                //cleaning up old animations which are already complete or stopped by user
                if (nRemainingTime <= 0) {
                    arrAnimates.splice(i, 1);
                }
                else {
                    $(oAnimationObject.strSelector).stop();
                }
            }
            //SoundManager.Pause();

            AnimationUtils.isPaused = true;
        },
        stop: function () {
            var oTimers = AnimationUtils._oTimers;
            var oStopWatches = AnimationUtils._oStopWatches;
            var oBgSequences = AnimationUtils._oBgSequences;
            var oTimer;
            for (var strItem in oTimers) {
                oTimer = oTimers[strItem];
                clearInterval(oTimer);
                delete oStopWatches[strItem];
                delete oTimers[strItem];
                delete oBgSequences[strItem];
            }
            AnimationUtils._oSelectors = {};
            var oAnimationObject;
            var arrAnimates = AnimationUtils._arrAnimates;
            for (var i = arrAnimates.length - 1; i >= 0; i--) {
                oAnimationObject = arrAnimates[i];
                $(oAnimationObject.strSelector).stop();
                arrAnimates.splice(i, 1);
            }
        },
        resume: function () {
            var oTimers = AnimationUtils._oTimers;
            for (var strItem in oTimers) {
                /* Required to pull strItem into the function. Or else it will use the value of strItem at the end of the loop each time */
                var fncTimeout = (function () {
                    var nTimeoutDuration = strItem;
                    return function () {
                        AnimationUtils._updateBgPosition(nTimeoutDuration);
                        if (oTimers[nTimeoutDuration] != null) {
                            clearInterval(oTimers[nTimeoutDuration]);
                            oTimers[nTimeoutDuration] = setInterval(function () {
                                AnimationUtils._updateBgPosition(nTimeoutDuration);
                            }, nTimeoutDuration);
                        }

                    }
                })();
                var oStopWatch = AnimationUtils._oStopWatches[strItem];
                oTimers[strItem] = setInterval(fncTimeout, strItem - oStopWatch.nElapsedMilliseconds);
            }

            var arrAnimates = AnimationUtils._arrAnimates;
            var oAnimationObject;
            for (var i = arrAnimates.length - 1; i >= 0; i--) {
                oAnimationObject = arrAnimates[i];
                AnimationUtils._applyAnimation(oAnimationObject);
            }
            //SoundManager.Resume();
            AnimationUtils.isPaused = false;
        },

        stopBgSequence: function (strSelector) {
            var nTimerDuration = AnimationUtils._oSelectors[strSelector];
            if (nTimerDuration == null) {
                return;
            }

            var arrBgSequences = AnimationUtils._oBgSequences[nTimerDuration];
            var oAnimationObject;
            for (var i = arrBgSequences.length - 1; i >= 0; i--) {
                oAnimationObject = arrBgSequences[i];
                if (oAnimationObject.strSelector == strSelector) {
                    break;
                }
            }
            delete AnimationUtils._oSelectors[strSelector];
            AnimationUtils._stopAnimation(oAnimationObject);
        },

        _setAnimationParams: function (arrOptions, strType) {
            var strSelector = arrOptions.splice(0, 1)[0];
            var nDuration;
            switch (strType) {
                case AnimationUtils._FADE_IN:
                case AnimationUtils._FADE_OUT:
                case AnimationUtils.SHOW:
                case AnimationUtils.HIDE:
                    if (!arrOptions[0] || typeof arrOptions[0] == "function") {
                        arrOptions[0] = 400;
                    }
                    else if (typeof arrOptions[0] == "string") {
                        switch (arrOptions[0]) {
                            case "slow":
                                arrOptions[0] = 600;
                                break;
                            case "fast":
                                arrOptions[0] = 200;
                                break;
                            default:
                                arrOptions[0] = 400;
                                break;
                        }
                    }
                    break;
                case AnimationUtils._ANIMATE:
                    var oOptions = arrOptions[1];
                    if (typeof oOptions == "object") {
                        if (!oOptions.duration) {
                            oOptions.duration = 400;
                        }
                        else if (typeof oOptions.duration == "string") {
                            switch (oOptions.duration) {
                                case "slow":
                                    oOptions.duration = 600;
                                    break;
                                case "fast":
                                    oOptions.duration = 200;
                                    break;
                                default:
                                    oOptions.duration = 400;
                                    break;
                            }
                        }
                    }
                    else {
                        if (!oOptions || typeof oOptions == "function") {
                            arrOptions[1] = 400;
                        }
                        else if (typeof oOptions == "string") {
                            switch (oOptions) {
                                case "slow":
                                    arrOptions[1] = 600;
                                    break;
                                case "fast":
                                    arrOptions[1] = 200;
                                    break;
                                default:
                                    arrOptions[1] = 400;
                                    break;
                            }
                        }

                    }
                    break;
            }

            var oAnimationObject = new Object();
            oAnimationObject.strSelector = strSelector;
            oAnimationObject.arrOptions = arrOptions;
            oAnimationObject.strType = strType;

            AnimationUtils._arrAnimates.push(oAnimationObject);

            AnimationUtils._applyAnimation(oAnimationObject);
        },

        _applyAnimation: function (oAnimationObject) {
            var strSelector = oAnimationObject.strSelector;
            var strType = oAnimationObject.strType;
            var arrOptions = oAnimationObject.arrOptions;
            var oStopWatch = new MathInteractives.Common.Utilities.Models.StopWatch();
            oAnimationObject.oStopWatch = oStopWatch;
            oStopWatch.start();

            switch (strType) {
                case AnimationUtils._FADE_IN:
                    $(strSelector).fadeIn.apply($(strSelector), arrOptions);
                    break;
                case AnimationUtils._FADE_OUT:
                    $(strSelector).fadeOut.apply($(strSelector), arrOptions);
                    break;
                case AnimationUtils._ANIMATE:
                    $(strSelector).animate.apply($(strSelector), arrOptions);
                    break;
                case AnimationUtils.SHOW:
                    $(strSelector).show.apply($(strSelector), arrOptions);
                    break;
                case AnimationUtils.HIDE:
                    $(strSelector).hide.apply($(strSelector), arrOptions);
                    break;

            }
        },

        _runAnimation: function (oAnimationObject) {
            var oConfig = oAnimationObject.oConfig;
            var strSelector = oAnimationObject.strSelector;
            switch (oAnimationObject.strType) {
                case AnimationUtils._TIMEOUT:
                    break;
                case AnimationUtils._BG_SEQUENCE:
                    if ($(strSelector).length == 0) {
                        throw new Error("No Such Element exists " + strSelector);
                    }
                    var oSelectors = AnimationUtils._oSelectors;
                    if (oSelectors[strSelector]) {
                        //throw new Error("A bg sequence is already running on  " + strSelector);
                    }
                    //var sameSelectorExists = false;
                    //_.each(AnimationUtils._oBgSequences[oSelectors[oAnimationObject.strSelector]],
                    //function (currBgSequence) {
                    //    if (currBgSequence.strSelector.selector === oAnimationObject.strSelector.selector) {
                    //        throw new Error("A bg sequence is already running on  " + strSelector);
                    //Since it somehow adds bgsequences even with above check
                    //sameSelectorExists = true;
                    //    }
                    //});
                    //if (sameSelectorExists === true) {
                    //    throw new Error("A bg sequence is already running on  " + strSelector);
                    //}
                    //else{
                    oSelectors[oAnimationObject.strSelector] = oConfig.iTimeoutDuration;
                    //}
                    break;
            }

            var oBgSequences = AnimationUtils._oBgSequences;
            var arrBgSequences = oBgSequences[oConfig.iTimeoutDuration];
            if (!arrBgSequences) {
                arrBgSequences = oBgSequences[oConfig.iTimeoutDuration] = [];
            }
            arrBgSequences.push(oAnimationObject);
            var oTimers = AnimationUtils._oTimers;
            if (!oTimers[oConfig.iTimeoutDuration]) {
                var oStopWatch = new MathInteractives.Common.Utilities.Models.StopWatch();
                oStopWatch.start();
                AnimationUtils._oStopWatches[oConfig.iTimeoutDuration] = oStopWatch;
                oTimers[oConfig.iTimeoutDuration] = setInterval(function () {
                    AnimationUtils._updateBgPosition(oConfig.iTimeoutDuration);
                }, oConfig.iTimeoutDuration);
            }
            //return oTimers[oConfig.iTimeoutDuration];
        },

        _stopAnimation: function (oAnimationObject) {
            var oBgSequences = AnimationUtils._oBgSequences;
            var nTimerDuration = oAnimationObject.oConfig.iTimeoutDuration;
            var arrBgSequences = oBgSequences[nTimerDuration];
            arrBgSequences.splice(arrBgSequences.indexOf(oAnimationObject), 1);
            if (arrBgSequences.length == 0) {
                clearInterval(AnimationUtils._oTimers[nTimerDuration]);
                delete AnimationUtils._oTimers[nTimerDuration];
                delete oBgSequences[nTimerDuration];
            }
        },

        _updateBgPosition: function (nTimeoutDuration) {
            AnimationUtils._oStopWatches[nTimeoutDuration].start();
            var arrBgSequences = AnimationUtils._oBgSequences[nTimeoutDuration];

            if (!arrBgSequences || arrBgSequences.length === 0) {
                return;
            }

            var oAnimationObject;
            var oVisualElement;
            var oConfig;

            for (var i = arrBgSequences.length - 1; i >= 0; i--) {
                oAnimationObject = arrBgSequences[i];
                if (!oAnimationObject) {
                    continue;
                }
                oConfig = oAnimationObject.oConfig;
                switch (oAnimationObject.strType) {
                    case AnimationUtils._TIMEOUT:
                        break;
                    case AnimationUtils._BG_SEQUENCE:
                        oVisualElement = oAnimationObject._oVisualElement;
                        if (!oVisualElement.is(":visible")) {
                            //	Debug("Warning --- The animating element is hidden " + oVisualElement.attr("id"));
                        }
                        // Optimization starts---------------------------------------------------------

                        // Replaced Code starts--------------------------------------------------------
                        var nCurrentFrame = oConfig.bReverse ? (oConfig.iMaxFrame - oConfig.iCurrentFrame) : oConfig.iCurrentFrame;

                        // Replaced Code ends----------------------------------------------------------

                        // Optimized Code starts-------------------------------------------------------
                        var strPos = oAnimationObject.nX[nCurrentFrame] + "px " + oAnimationObject.nY[nCurrentFrame] + "px"
                        oVisualElement.css("background-position", strPos);
                        // Optimized Code ends---------------------------------------------------------

                        // Optimization ends-----------------------------------------------------------
                        break;
                }

                if (typeof (oConfig.fOnProgress) == "function") {
                    oConfig.fOnProgress(oConfig.iCurrentFrame);
                }

                if (oConfig.iCurrentFrame == oConfig.iMaxFrame) {
                    if (oConfig.bRepeat) {
                        oConfig.iCurrentFrame = oConfig.iMinFrame;
                    }
                    else {
                        arrBgSequences.splice(i, 1);
                        switch (oAnimationObject.strType) {
                            case AnimationUtils._TIMEOUT:
                                delete AnimationUtils._oIntervals[oAnimationObject.strID];
                                break;
                            case AnimationUtils._BG_SEQUENCE:
                                delete AnimationUtils._oSelectors[oAnimationObject.strSelector];
                                break;
                        }

                        if (arrBgSequences.length == 0) {
                            clearInterval(AnimationUtils._oTimers[nTimeoutDuration]);
                            delete AnimationUtils._oTimers[nTimeoutDuration];
                        }
                        if (typeof (oConfig.fOnComplete) == "function") {
                            oConfig.fOnComplete(oConfig.iCurrentFrame);
                        }
                    }
                }
                oConfig.iCurrentFrame++;
            }
        }
    });

MathInteractives.Common.Utilities.Models.AnimationUtils = AnimationUtils;
} ());