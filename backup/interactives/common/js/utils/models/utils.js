(function () {
    'use strict';
    /**
    * Holds the methods for utilities
    * @class Utils
    * @module Utilities
    * @extends Backbone.Model.extend
    * @namespace MathInteractives.Common.Utilities.Models
    * @constructor
    */
    MathInteractives.Common.Utilities.Models.Utils = Backbone.Model.extend({}, {

        /**
        * object used to convert given number in sceintific form
        * @private
        * @Property significantNumberMode
        * @type Object

        **/

        significantNumberMode: {
            MIXED: "Mixed",
            DECIMAL: "false",
            SCIENTIFIC: "true",
            bIsNegative: false
        },
        /**
        * Timer for touch start
        * @private
        * @Property _touchStartTimerObject
        * @type Object
        * @default {}
        **/
        _touchStartTimerObject: {},

        /**
        * Throbber Timer
        * @private
        * @property _throbberTimer
        * @type Object
        * @default null
        **/
        _throbberTimer: null,

        /*
        * Renders a throbber / loading animation in the given container
        * @method renderThrobber
        * @param containerId {String} id of the container for throbber
        * @param scope {Object} Scope in which to execute functions
        * @param type {String} decides throbber color
        * @param throbberRemoveCondition {Object} function will be executed continously while throbber is running, this function should check for any conditions required for throbber to stop.
        * @param throbberRemoveTime {number} Time in milliseconds after which the throbber should be removed
        * @param closeIfAnyConditionTrue {boolean} If true any one condition is enough to shut the throbber. If false, both conditions have to be fulfilled.
        * @param throbberFrameInterval {mixed} its the time required for frame change,pass 'default' for 100 ,  else pass numeric value (time in milliseconds)
        * @param closeCallBack {Object}  Function to be executed after throbber remove
        * @public
        */
        renderThrobber: function renderThrobber(containerId, scope, type, throbberRemoveCondition, throbberRemoveTime,
        closeIfAnyConditionTrue, throbberFrameInterval, closeCallback) {
            var startCallback;
            if (arguments.length === 1) {
                closeCallback = containerId.closeCallback;
                throbberFrameInterval = containerId.throbberFrameInterval;
                closeIfAnyConditionTrue = containerId.closeIfAnyConditionTrue;
                throbberRemoveTime = containerId.throbberRemoveTime;
                throbberRemoveCondition = containerId.throbberRemoveCondition;
                type = containerId.type;
                scope = containerId.scope;
                startCallback = containerId.startCallback;
                containerId = containerId.containerId;
            }

            var utilsScope = MathInteractives.Common.Utilities.Models.Utils,
             isThrobberRemoveConditionSet = false,
            maxThrobberSequence = 7,
            defaultFrameInterval = 100, startCheck = true,
            throbberClass = 'throb-0 throb-1 throb-2 throb-3 throb-4 throb-5 throb-6',
            closeIfAnyConditionTrue = (typeof closeIfAnyConditionTrue === 'undefined') ? false : closeIfAnyConditionTrue,
            throbberFrameInterval = (throbberFrameInterval === 'default' || throbberFrameInterval === null || typeof throbberFrameInterval === 'undefined') ? defaultFrameInterval : throbberFrameInterval,
            runInfinite = false,
            counter = 0,
            timeSinceThrobber = 0,
            $throbberContainer = scope.$('#' + containerId);
            $throbberContainer.addClass('throbber-container throbber-active ' + type);

            if ((throbberRemoveCondition === null || typeof throbberRemoveCondition === 'undefined') &&
            (throbberRemoveTime === null || typeof throbberRemoveTime === 'undefined')) {
                runInfinite = true;
            }
            else if (throbberRemoveCondition === null || typeof throbberRemoveCondition === 'undefined') {
                isThrobberRemoveConditionSet = true;
                closeIfAnyConditionTrue = false;
            }
            else if (throbberRemoveTime === null || typeof throbberRemoveTime === 'undefined') {
                throbberRemoveTime = -1;
                closeIfAnyConditionTrue = false;
            }


            scope._throbberTimer = setInterval(function singleThrob() {
                if (startCheck) {
                    if (startCallback) {
                        $.proxy(startCallback, scope)();
                    }
                    startCheck = false;
                }
                timeSinceThrobber = counter * throbberFrameInterval;
                $throbberContainer.removeClass(throbberClass).addClass('throb-' + counter++ % maxThrobberSequence);


                if (runInfinite !== true) {
                    if (closeIfAnyConditionTrue) {
                        if ((throbberRemoveTime < timeSinceThrobber) || ($.proxy(throbberRemoveCondition, scope))() === true) {
                            utilsScope.removeThrobber(containerId, scope, type, closeCallback);
                        }
                    }
                    else {
                        if ((throbberRemoveTime < timeSinceThrobber) && (isThrobberRemoveConditionSet || ($.proxy(throbberRemoveCondition, scope))() === true)) {
                            utilsScope.removeThrobber(containerId, scope, type, closeCallback);
                        }
                    }
                }
            }, throbberFrameInterval);
        },

        /**
        * Removes the thobber
        * @method removeThrobber
        * @public
        * @param containerId {string}
        * @param scope {object} Scope in which the function is called
        * @param type {String} decides throbber color
        * @param closeCallBack {Object} Function to be executed after throbber remove
        **/
        removeThrobber: function stopThrobber(containerId, scope, type, closeCallback) {
            var throbberClass = 'throb-0 throb-1 throb-2 throb-3 throb-4 throb-5 throb-6';
            clearInterval(scope._throbberTimer);
            scope.$('#' + containerId).removeClass('throbber-active ' + throbberClass + ' ' + type);
            if (typeof closeCallback !== 'undefined' && closeCallback !== null) {
                $.proxy(closeCallback, scope)();
            }
        },





        /**
        * Returns a random number between min (inclusive) and max (exclusive)
        * @method getRandomNumber
        * @public
        * @param {float} min limit
        * @param {float} max limit
        * @return {float} random number within range
        */

        getRandomNumber: function getRandomNumber(min, max) {



            var currentRandomNumber = null,
                temp = null;

            if (min > max) {

                temp = min;
                min = max;
                max = temp;
            }
            currentRandomNumber = Math.random() * (max - min) + min;


            if (currentRandomNumber < min || currentRandomNumber > max) {
                currentRandomNumber = this.getRandomNumber(min, max);
            }

            return currentRandomNumber;

        },




        /**
        * Returns a random integer between min (inclusive) and max (inclusive)
        * Using Math.round() will give you a non-uniform distribution!
        * @method getRandomIntegerNumber
        * @public
        * @param {integer} min limit
        * @param {integer} max limit
        * @return {integer} random number within range
        */

        //getRandomIntegerNumber: function getRandomIntegerNumber(min, max) {
        //    return Math.floor(Math.random() * (max - min + 1)) + min;
        //},


        /**
        * Return Rounded off random no between 0 to 1 or between limits provided
        * or If single parameter provided, returns no between 0 to specified no.
        *
        * @method getRandomNumberBetween
        * @param [min] {Number} minimum value of random no.
        * @param [max] {Number} maximum value of random no.
        * @return no {Number} random no. between limits provided.
        * @param {boolean} isMaxInclusive to be max included
        * @final
        **/

        getRandomIntegerNumber: function getRandomIntegerNumber(min, max, isMaxInclusive) {
            // Swap no if not in order; condition false if any of min/max is undefined


            var currentRandomNumber = null,
                temp = null,
                isMaximumIncluded = typeof isMaxInclusive === "undefined" || isMaxInclusive === true;


            if (min > max) {

                temp = min;
                min = max;
                max = temp;
            }
            if (isMaximumIncluded) {
                currentRandomNumber = Math.floor((Math.random() * (max - min + 1)) + min);
            }
            else {
                currentRandomNumber = Math.floor((Math.random() * (max - min)) + min);
            }
            // Generate rounded off no. between min to max


            // If no. is less than minimum value
            // OR if no is greater than maximum value when rounded off; recursively call function again
            if (isMaximumIncluded) {
                if (currentRandomNumber < min || currentRandomNumber > max) {
                    currentRandomNumber = getRandomIntegerNumber(min, max);
                }
            }
            else {

                if (currentRandomNumber < min || currentRandomNumber >= max) {
                    currentRandomNumber = getRandomIntegerNumber(min, max);
                }
            }


            return currentRandomNumber;

        },


        /**
        * Returns a rounded value for givn number
        * @method roundUpValue
        * @public
        * @param {float} value to be round up
        * @param {integer} range upto rounding should be done
        * @return {float} rounded value
        */
        roundUpValue: function (value, range) {

            var range = range || 0,
                multDivFactor = Math.pow(10, range);

            return (Math.round(value * multDivFactor) / multDivFactor);
        },


        /*
        * Inserts comma into a number.
        * Returns the same string if it contains more than one dot.
        * @method commaSeperateNumber
        * @public
        * @param val {number} number to be converted
        * @return {number} Converted string
        */
        commaSeparateNumber: function (val) {
            var integralPart = null,
                    fractionalPart = null,
                    numberOFCharsAfterDot = null,
                    dotIndex = null,
                    result = null,
                    pattern = new RegExp(/^[-]?[\d,]*[\.]?[\d,]+$/),
                    output = {
                        "success": false,
                        "result": val
                    };
            val = val.toString();
            if (!pattern.test(val)) {
                return output
            }
            else {
                var intVal = parseFloat(this.removeCommaFromString(val)).toString();
                dotIndex = intVal.indexOf(".");
                if (dotIndex === -1) {
                    numberOFCharsAfterDot = intVal.substr(dotIndex + 1 + intVal.length).length
                }
                else {
                    numberOFCharsAfterDot = intVal.substr(intVal.indexOf(".") + 1).length;
                }

                if (dotIndex !== -1) {
                    integralPart = (intVal.substring(0, dotIndex));
                    //debugger; //Math.floor(parseFloat(this.removeCommaFromString(val))).toString();
                    fractionalPart = parseFloat(intVal.substring(dotIndex)).toString().substring(1); //(parseFloat(this.removeCommaFromString(val)) % 1).toFixed(numberOFCharsAfterDot);
                } else {
                    integralPart = intVal;
                    fractionalPart = ""
                }
                if (integralPart.length === 0) {
                    integralPart = 0;
                }
                if (Number(fractionalPart) > 0/*.toFixed(2) !== '0.00'*/) {
                    result = this._insertCommaIntoNumber(integralPart).toString() + fractionalPart; //this._insertCommaIntoNumber(integralPart) + fractionalPart.substring(1, fractionalPart.length);
                }
                else {
                    result = this._insertCommaIntoNumber(integralPart);
                }
                output.success = true;
                output.result = result;
                return output;

            }
        },

        /**
        * converts numbers in scientific scienctific notation.
        * @method convertIntoScienceficNotaion
        * @public
        * @param numberObj {object} the number object
        * @return {object} number in scientific notation.
        */
        convertIntoScientificNotaion: function convertIntoScientificNotaion(numberObj) {
            var outputNumber = {
                number: '',
                numberPart: '',
                power: ''
            },
                tempString = null,
                number = numberObj.number.toString(),
                numberLength = number.length,
                string1 = null;
            outputNumber.number = numberObj.number.toString();
            if (number.indexOf('e') > -1) {
                outputNumber = this.replaceExponentialWithDecimal(number);
            }
            else {
                var dotIndex = number.indexOf('.');
                if (number > 1 || number < -1) {
                    if (dotIndex === -1) {
                        if (numberLength > numberObj.numberOfDigits) {
                            outputNumber = this.replaceExponentialWithDecimal(Number(number).toExponential());
                        }
                    }
                    else {
                        if (dotIndex >= numberObj.numberOfDigits) {
                            outputNumber = this.replaceExponentialWithDecimal(Number(number).toExponential());
                        }
                        else {
                            outputNumber.number = Number(number).toFixed(2).replace(/\.?0+$/, "");
                        }
                    }
                }
                else {
                    if (dotIndex > -1) {
                        tempString = number.split('.')[1];
                        if (tempString.length > numberObj.numberOfDigits) {
                            outputNumber = this.replaceExponentialWithDecimal(Number(number).toExponential());
                        }
                        else {
                            outputNumber.number = Number(number).toFixed(2).replace(/\.?0+$/, "");
                        }
                    }
                }
            }
            return outputNumber;
        },

        /**
        * Allow user to to get URL of specific part of the sprite image.
        * User need to provide url, left and top position of expected image along with size of the image        *
        * @method  getSpritePartBase64URL
        * @public
        * @param {Object} image Image element of the sprite
        * @param {Number} left Provides top position of image part from the sprite
        * @param {Number} top Provides left position of image part from the sprite
        * @param {Number} width Provides width of required image
        * @param {Number} height Provides height of the required image
        * @return {String} imgSpriteURL Returns the URL of the part of sprite image
        */
        getSpritePartBase64URL: function (image, left, top, width, height) {
            var canvas, context, imgSpriteURL = null;

            canvas = document.createElement('canvas');
            context = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            context.drawImage(image, left, top, width, height, 0, 0, width, height);
            imgSpriteURL = canvas.toDataURL('image/png');
            return imgSpriteURL;
        },

        /**
        * Function which converts number from exponential notation to decimal notation
        * @method replaceExponentialWithDecimal
        * @public
        * @param number {Object}
        **/
        replaceExponentialWithDecimal: function (number) {
            var outputNumber = {
                number: '',
                numberPart: '',
                power: ''
            },
                numberPart = null,
                baseNotationPart = null,
                powerPart = null,
                stringArray = null,
                power = null;
            outputNumber.number = number.toString();
            number = number.toString();
            stringArray = number.split('e');
            numberPart = Number(stringArray[0]).toFixed(2).replace(/\.?0+$/, "");
            baseNotationPart = ' &times; 10';
            power = stringArray[1].replace('+', '');
            powerPart = power.sup();
            outputNumber.numberPart = numberPart.trim();
            outputNumber.power = power;
            outputNumber.number = numberPart + baseNotationPart + powerPart;
            return outputNumber;
        },
        /*
        * function is internally used by commaSeparateNumber. Places comma after every 3 digit starting from left
        * This function is meant to be used within the Utils class and should not be accessed from outside the class.
        * @method _insertCommaIntoNumber
        * @private
        */
        _insertCommaIntoNumber: function (val) {
            while (/(\d+)(\d{3})/.test(val.toString())) {
                val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
            }
            return val;
        },


        /*
        * removes comma from input string and returns the string
        * @method removeCommaFromString
        * @public
        * @param val {string} number in string format
        * @return {string} number in string format
        */
        removeCommaFromString: function (val) {
            return (val.toString().replace(/,/g, ''));
        },

        /*
        * Shuffles the values of the received array and returns the reference of the array
        * @method shuffleArray
        * @public
        * @param array {Array} Array to be shuffled
        * @return {array} Shuffled array
        */
        shuffleArray: function (array) {
            var currentIndex = array.length,
                temporaryValue,
                randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        },

        /**
        * Calculates the distance between the two points and returns it.
        * @method distanceBetweenPoints
        * @public
        * @param x1 {Number} X Co-ordinates of point 1
        * @param y1 {Number} Y Co-ordinates of point 1
        * @param x2 {Number} X Co-Ordinates of point 2
        * @param y2 {Number} Y Co-Ordinates of point 2
        * @return {number} the distance between 2 points
        */
        distanceBetweenPoints: function (x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        },

        /**
        * Returns the lowest possible fraction of the inputted fraction
        *
        * @method getBaseRatio
        * @param {Number} Numerator of the fraction
        * @param {Number} Denominator of the fraction
        * @public
        * @return {Array} lowest possible fraction of the input fraction
        **/
        getBaseRatio: function (numerator, denominator) {
            var gcd = function gcd(a, b) {
                return b ? gcd(b, a % b) : a;
            };
            gcd = gcd(numerator, denominator);
            gcd = Math.abs(gcd);
            return [numerator / gcd, denominator / gcd];
        },

        /*
        * Returns the union of two arrays of objects using the property passed
        * @method unionOfArraysOfObjects
        * @public
        * @param arr1 {Array} Array of objects to unify
        * @param arr2 {Array} Array of objects to unify
        * @param prop1 {String} Property of objects to be compared
        * @return arr3 {Array} Union of arr1 and arr2
        */
        unionOfArraysOfObjects: function (arr1, arr2, prop1) {
            var arr1Length = arr1.length;
            var arr2Length = arr2.length;
            var arr3 = arr1.slice();
            var same;
            for (var i = 0; i < arr2Length; i++) {
                same = false;
                for (var j = 0; j < arr1Length; j++) {
                    if (arr1[j][prop1] === arr2[i][prop1]) {
                        same = true;
                        break;
                    }
                }
                if (!same) {
                    arr3.push(arr2[i]);
                }
            }
            return arr3;
        },

        /**
        * Adds touch and hold handler
        * @method addTouchAndHoldHandler
        * @public
        * @param context {object} Context in which function is called
        * @param $element {object} jQuery reference of the object
        * @param time {number} Time for touch and hold
        * @param touchStart {object} Callback for touch start
        * @param touchEnd {object} Callback for touch end
        * @param scope {object} Scope for touch start timer
        **/
        addTouchAndHoldHandler: function addTouchAndHoldHandler(context, $element, time, touchStart, touchEnd, scope, nameSpaceForEvent) {
            var self = this,
                $event = null;
            if (nameSpaceForEvent == null) {
                nameSpaceForEvent = 'touchAndHoldHandler';
            }

            $element.off('touchstart.' + nameSpaceForEvent).on('touchstart.' + nameSpaceForEvent, function (event) {
                $event = event;
                //var temp = scope;
                $element.one('touchmove.' + nameSpaceForEvent, function (event) {
                    event.preventDefault(); //fix for android. if we dont do event.preventDefault() mouse up doesnt fire in android
                    if (!scope) {
                        if (self._touchStartTimer !== null) {
                            window.clearTimeout(self._touchStartTimer);
                        }
                    } else {
                        if (self._touchStartTimerObject[scope]) {
                            window.clearTimeout(self._touchStartTimerObject[scope]);
                        }
                    }

                });

                if (!scope) {
                    self._touchStartTimer = window.setTimeout(function (event) {
                        $.proxy(touchStart, context, $event)();
                    }, time);
                } else {

                    self._touchStartTimerObject[scope] = window.setTimeout(function (event) {
                        $.proxy(touchStart, context, $event)();
                    }, time);
                    //$('#angle-explorer-overview-header').append(self._touchStartTimerObject[scope]);
                }
            });
            $element.off('touchend.' + nameSpaceForEvent + ' touchcancel.' + nameSpaceForEvent).on('touchend.' + nameSpaceForEvent + ' touchcancel.' + nameSpaceForEvent, function (event) {

                if (!scope) {
                    if (self._touchStartTimer !== null) {
                        window.clearTimeout(self._touchStartTimer);
                        $.proxy(touchEnd, context, event)();
                    }
                } else {
                    if (self._touchStartTimerObject[scope]) {
                        //$('#angle-explorer-overview-header').append(self._touchStartTimerObject[scope]);
                        window.clearTimeout(self._touchStartTimerObject[scope]);
                        $.proxy(touchEnd, context, event)();
                        delete self._touchStartTimerObject[scope];
                    }
                }

            });

        },

        /**
        * Converts value in one unit to another unit.
        * @method convertUnit
        * @public
        * @param unitValue {Number} value in second unit per unit value of first unit
        * @param noOfUnits {Number} value in terms of first unit that is to be converted
        * @return {Number}
        */
        convertUnit: function (unitValue, noOfUnits) {
            return (unitValue * noOfUnits);
        },

        /**
        * Finds point of the paper object using segment id.
        *
        * @method getPointOnLine
        * @param startPoint {Object} start point of line
        * @param endPoint {Object} end point of line
        * @param dDistance {Number} distance from either of end point
        * @param dOffsetAngle {Number} offset angle with line
        * @param bDistFromStartPt {Boolean} consider distance from start point if true , otherwise consider from end point
        * @return point {object} return point
        * @public
        **/
        getPointOnLine: function (startPoint, endPoint, dDistance, dOffsetAngle, bDistFromStartPt) {
            var dLineLength = this.getPointDistance(startPoint, endPoint),
                    u = dDistance / dLineLength,
                    ptOnLine;

            if (!bDistFromStartPt) {
                u = 1 - u;
            }
            ptOnLine = this.getPointUsing_U(startPoint, endPoint, u);
            return this.getRotatedPoint(ptOnLine, bDistFromStartPt ? startPoint : endPoint, dOffsetAngle);
        },



        /**
        * Calculates point on line by normalizing line between 0 to 1
        *
        * @method getPointUsing_U
        * @param startPoint {Object} point 1
        * @param endPoint {Object} point 2
        * @param u {Number} normalized number (0 to 1 for points on line , other for outside line)
        * @return point {Object} point on line according to u point
        * @public
        **/
        getPointUsing_U: function (startPoint, endPoint, u) {
            var x1 = startPoint.x, y1 = startPoint.y,
                    x2 = endPoint.x, y2 = endPoint.y,
                    px = x2 - x1, py = y2 - y1;
            if (px == 0 && py == 0) {
                return null;
            }
            var x3 = x1 + u * px,
                    y3 = y1 + u * py;
            return { x: x3, y: y3 };
        },

        /**
        * Calculates new position of the point
        *
        * @method getRotatedPoint
        * @param point {Object} point to be rotated
        * @param refPoint {Object} reference point aronud which rotation will occur
        * @param dRotationInDegree {Number} rotation angle in degrees
        * @return point {object} rotated point
        * @public
        **/
        getRotatedPoint: function (point, refPoint, dRotationInDegree) {
            var outPt = { x: 0, y: 0 };
            if (dRotationInDegree === 0) {
                return point;
            }
            var rotationInRad = dRotationInDegree * Math.PI / 180,
                    dx = point.x - refPoint.x,
                    dy = point.y - refPoint.y;
            outPt.x = ((Math.cos(rotationInRad) * (dx)) - (Math.sin(rotationInRad) * (dy))) + refPoint.x;
            outPt.y = ((Math.sin(rotationInRad) * (dx)) + (Math.cos(rotationInRad) * (dy))) + refPoint.y;
            return outPt;
        },

        /**
        * Calculates distance between points
        *
        * @method getPointDistance
        * @param point1 {Object} point 1
        * @param point2 {Object} point 2
        * @return distance {Number} distance between two points
        * @public
        **/
        getPointDistance: function (point1, point2) {
            return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
        },

        /**
        * Calculates mid point of the line.
        *
        * @method getMidPoint
        * @param point1 {Object} end point of line.
        * @param point2 {Object} end point of line.
        * @return point {object} returns center point of line
        * @private
        **/
        getMidPoint: function (point1, point2) {
            return { x: (point1.x + point2.x) / 2, y: (point1.y + point2.y) / 2 };
        },

        countDigitsAfterDecimalPoint: function (number) {
            var numberParts = number.toString().split('.');
            return numberParts.length === 2 ? numberParts[1].length : numberParts.length < 2 ? 0 : -1;
        },

        /**
        * Adds two decimal numbers
        * @method addDecimalNumber
        * @param {Number} number1 First number
        * @param {Number} number2 Second number
        * @return {Number} Addition of two numbers
        * @public
        **/
        addDecimalNumber: function addDecimalNumber(number1, number2) {
            var decimalDigits1 = this.countDigitsAfterDecimalPoint(number1),
                decimalDigits2 = this.countDigitsAfterDecimalPoint(number2),
                result = number1 + number2;

            result = this.roundUpValue(result, Math.max(decimalDigits1, decimalDigits2));
            return result;
        },

        /**
        * Subtracts second decimal number from first decimal number
        * @method subtractDecimalNumber
        * @param {Number} number1 First number
        * @param {Number} number2 Second number
        * @return {Number} Subtraction of two numbers
        * @public
        **/
        subtractDecimalNumber: function subtractDecimalNumber(number1, number2) {
            var decimalDigits1 = this.countDigitsAfterDecimalPoint(number1),
                decimalDigits2 = this.countDigitsAfterDecimalPoint(number2),
                result = number1 - number2;

            result = this.roundUpValue(result, Math.max(decimalDigits1, decimalDigits2));
            return result;
        },

        /**
        * Multiplies two decimal numbers
        * @method multiplyDecimalNumber
        * @param {Number} number1 First number
        * @param {Number} number2 Second number
        * @return {Number} Multiplication of two numbers
        * @public
        **/
        multiplyDecimalNumber: function multiplyDecimalNumber(number1, number2) {
            var decimalDigits1 = this.countDigitsAfterDecimalPoint(number1),
                decimalDigits2 = this.countDigitsAfterDecimalPoint(number2),
                result = number1 * number2;

            result = this.roundUpValue(result, (decimalDigits1 + decimalDigits2));
            return result;
        },
        /**
        * Returns the gcd of the 2 passed numbers
        * @method findGcd
        * @param number1{Number} The first number
        * @param number2{Number} The second number
        * @public
        */
        findGcd: function findGcd(number1, number2) {
            var i, smallerNo = number1, largerNo = number2,
                divisor, remainder;

            if (number1 > number2) {
                smallerNo = number2;
                largerNo = number1;
            }

            divisor = smallerNo;
            remainder = largerNo % smallerNo;

            while (remainder !== 0) {
                largerNo = divisor;
                divisor = remainder;
                remainder = largerNo % divisor;
            }

            return divisor;
        },
        /**
        * Returns the lcm of the 2 passed numbers
        * @method findLcm
        * @param number1{Number} The first number
        * @param number2{Number} The second number
        * @public
        */
        findLcm: function findLcm(number1, number2) {
            return ((number1 * number2) / this.findGcd(number1, number2));
        },

        /**
        * Returns the pixel Ratio of device. Its value is 2 for ipad Retina Display and 1 for other devices.
        * @method getDevicePixelRatio
        * @public
        */
        getDevicePixelRatio: function getDevicePixelRatio() {
            return (window.devicePixelRatio || Math.round(window.screen.availWidth / document.documentElement.clientWidth));
        },


        /**
        * get number in html for sceintific notations
        * @method getAsHtmlSignificant
        * @public
        * @param {array} arrNumber An array with first element as the number, and second element as the power of 10.

        * @return {string} html string
        */
        getAsHtmlSignificant: function (arrNumber) {
            var strHtml,
                spanElement = document.createElement('span');
            if (arrNumber.length == 2 && arrNumber[1] != 0) {
                strHtml = String(arrNumber[0] + " x " + String(10) + "<sup>" + arrNumber[1] + "</sup>");
            }
            else {
                strHtml = String(arrNumber[0]);
            }
            spanElement.innerHTML = strHtml;
            return spanElement;
        },

        handleMixedCase: function (nNumber, nSignificantDigit) {

            var nReqSigDig = Number(nSignificantDigit);

            var arrReturn = [];

            var arrDecimal = this.calculateSignificantNumber(nNumber, nSignificantDigit, false);
            if (String(nNumber).indexOf("-") == 0) {
                this.bIsNegative = true;
                nNumber = String(Number(nNumber) * -1);
            }
            var nSigDigDecimal = this.calculateSignificantDigit(arrDecimal[0]);
            if (nSigDigDecimal == nReqSigDig) {
                arrReturn = [arrDecimal[0]]
            }
            else {
                arrReturn = this.calculateSignificantNumber(nNumber, nReqSigDig, true);
            }
            this.handleNegative(arrReturn);
            return arrReturn;
        },

        getNumberSignificantNumber: function (arrSignificant) {
            var nNos = Number(arrSignificant[0])
            if (arrSignificant.length == 2) {
                nNos = nNos * Math.pow(10, Number(arrSignificant[1]))
            }

            return nNos;
        },
        shiftNumberSignificantNumber: function (nNumber, nPower, nDesiredPower) {
            var strNumber = String(nNumber);
            var strPower = String(nPower);
            var strDesiredPower = String(nDesiredPower);

            var strFinalisedNumber = "";

            var nShiftPower = Number(nPower) - Number(nDesiredPower);
            /*
            in effect what we need is Number * 10 raise to nShiftPower
            */

            if (strNumber.indexOf(".") == -1) {
                strNumber += ".";
            }

            var arrNumberParts = strNumber.split(".");
            var arrBeforeDecimal = arrNumberParts[0].split("");
            var arrAfterDecimal = arrNumberParts[1].split("");
            //debugger;
            var nAbsShiftInPower = Math.abs(nShiftPower);
            //need to shift left
            if (nShiftPower < 0) {
                //if decimal point is to be shifted through more digits then available
                if (arrBeforeDecimal.length < nAbsShiftInPower) {
                    //prepend array with zeroes
                    var nDeficit = nAbsShiftInPower - arrBeforeDecimal.length;
                    for (var i = 0; i < nDeficit; i++) {
                        arrBeforeDecimal.unshift("0");
                    }
                }


                for (i = 0; i < nAbsShiftInPower; i++) {
                    arrAfterDecimal.unshift(arrBeforeDecimal.pop());
                }

            }
            else {
                //if decimal point is to be shifted through more digits then available
                if (arrAfterDecimal.length < nAbsShiftInPower) {
                    //add zeroes at end of array
                    var nDeficit = nAbsShiftInPower - arrBeforeDecimal.length;
                    for (var i = 0; i < nDeficit; i++) {
                        arrAfterDecimal.push("0");
                    }
                }

                for (i = 0; i < nAbsShiftInPower; i++) {
                    arrBeforeDecimal.push(arrAfterDecimal.shift());
                }
            }

            strFinalisedNumber = this.getNumberFromArraySignificantNumber(arrBeforeDecimal, arrAfterDecimal);


            return strFinalisedNumber;
        },

        getNumberFromArraySignificantNumber: function getNumberFromArraySignificantNumber(arrBefore, arrAfter) {
            var strFinal = "";
            var strAfter = arrAfter.toString().replace(/,/g, "");
            var strBefore = arrBefore.toString().replace(/,/g, "");

            if (arrBefore.length == 0) {
                strFinal = this.getZeroesSignificantNumber(1, true) + strAfter;
            }
            else if (arrAfter.length == 0) {
                strFinal = strBefore;
            }
            else {
                strFinal = strBefore + "." + strAfter;
            }

            return strFinal;

        },

        getZeroesSignificantNumber: function getZeroesSignificantNumber(nNumberOfZeroes, bDecimal) {
            nNumberOfZeroes = Math.abs(nNumberOfZeroes);
            var strRet = "";

            if (bDecimal == true) {
                nNumberOfZeroes--;
                strRet = String(Math.pow(10, nNumberOfZeroes)).replace("1", "0.")
            }
            else {
                strRet = String(Math.pow(10, nNumberOfZeroes)).replace("1", "")
            }


            return strRet;
        },
        /**
        * returns a array to convert number into scientific notation
        * @method calculateSignificantNumber
        * @public
        * @param {float} nNumber the Number to be converted into desired significant digits.
        * @param {float} nSignificantDigit the number of significant digits desired.
        * @param {float} bScientificNotation if output desired is in scientific notation, then pass true here, else pass false.
        * @param {float} bInternalCall
        * @return {array} array containing values of sceintific form
        */

        calculateSignificantNumber: function (nNumber, nSignificantDigit, bScientificNotation, bInternalCall) {
            //console.log(nNumber + " " + nSignificantDigit);
            //debugger

            if (bScientificNotation == null || bScientificNotation == undefined || bScientificNotation == this.significantNumberMode.MIXED) {
                //bScientificNotation = this.significantNumberMode.MIXED;
                arrReturn = this.handleMixedCase(nNumber, nSignificantDigit);
                return arrReturn;
            }
            if (String(nNumber).indexOf("-") == 0) {

                this.bIsNegative = true;
                nNumber = String(Number(nNumber) * -1);
            }

            var arrReturn = new Array();
            var arrScientificValue = [];
            var arrDecimalValue = [];
            var bSpecialCase = false;

            if (bScientificNotation == true || bScientificNotation == "true") {
                bScientificNotation = this.significantNumberMode.SCIENTIFIC;
            }
            else if (bScientificNotation == false || bScientificNotation == "false") {
                bScientificNotation = this.significantNumberMode.DECIMAL;
            }



            var strNumber = "";
            strNumber = nNumber.toString();  // input number



            var iConversion = nSignificantDigit;
            var iSigNum = 0;
            var iCount;
            var iDecimalPosition;
            var bIsNonZero = false;
            var bIsDecimal = false; // boolean for decimal point
            var iNumberLength = strNumber.length;
            // to check if decimal point is present
            for (iCount = 0; iCount < strNumber.length; iCount++) {
                if (strNumber.charAt(iCount) == ".") {
                    bIsDecimal = true;
                    iDecimalPosition = iCount;
                    break;
                }
            }

            if (strNumber == 0) {
                //          document.getElementById("SigniDigits").value = 1;
                arrReturn = this.convert(bIsDecimal, iSigNum, strNumber, iConversion, iDecimalPosition, iNumberLength, bScientificNotation);
                if (Number(arrReturn[0]) == 0) {
                    arrReturn = ["0"]
                }
                return arrReturn;
            }

            iSigNum = strNumber.length;

            // calculate significant digits for number without Decimal point
            if (bIsDecimal == true) {


                for (iCount = 0; iCount < strNumber.length; iCount++) {

                    if (strNumber[iCount] == 0 || strNumber[iCount] == ".") {
                        if (strNumber[iCount] == 0) {
                            iSigNum = iSigNum - 1;
                        }
                    }
                    else {
                        break;

                    }

                }
                iSigNum--;
                arrReturn = this.convert(bIsDecimal, iSigNum, strNumber, iConversion, iDecimalPosition, iNumberLength, bScientificNotation);

                return arrReturn;
            }

                // calculate significant nos without Decimal point

            else {
                // if zeroes are present at the start
                for (iCount = 0; iCount < strNumber.length; iCount++) {
                    //

                    if (strNumber[iCount] == 0 || strNumber[iCount] == ".") {
                        if (strNumber[iCount] == 0) {
                            iSigNum = iSigNum - 1;
                            //                    strNumber = fncRemoveZero(strNumber);
                            //                    alert(strNumber);
                        }
                    }
                    else {
                        break;

                    }

                }

                // if zeroes are present at the end
                for (iCount = strNumber.length - 1; iCount >= 0; iCount--) {
                    if (strNumber[iCount] == 0 || strNumber[iCount] == ".") {
                        if (strNumber[iCount] == 0) {
                            iSigNum = iSigNum - 1;
                        }
                    }
                    else {
                        break;

                    }
                }
                arrReturn = this.convert(bIsDecimal, iSigNum, strNumber, iConversion, iDecimalPosition, iNumberLength, bScientificNotation);
                return arrReturn;
            }
        },

        handleNegative: function handleNegative(arrReturn) {
            if (this.bIsNegative == true) {
                arrReturn[0] = "-" + String(arrReturn[0]);
            }

            this.bIsNegative = false;

            return arrReturn;
        },



        convert: function convert(bIsDecimal, iSigNum, strNumber, iConversion, iDecimalPosition, iNumberLength, bScientificNotation) {
            var arrReturn = new Array();
            var arrNumberScientific = new Array();
            var iNewSigDigit;
            var iCount;
            var bLessThanOne = false;
            var iPower;
            var iExponentialPosition;
            //console.log(strNumber + " " + iSigNum);
            if (strNumber < 1) {
                bLessThanOne = true;
            }
            if (strNumber == 0) {
                strNumber = "0.";
                for (iCount = 0; iCount < iConversion - 1; iCount++) {
                    strNumber += "0";
                }
                if (bScientificNotation == this.significantNumberMode.DECIMAL || bScientificNotation == this.significantNumberMode.DECIMAL) {
                    arrReturn = [strNumber];
                }
                else {
                    arrReturn = [strNumber, 0];
                }
                return arrReturn;
            }
            var strOriginalNumber = strNumber;
            strNumber = Number(strNumber);
            strNumber = strNumber.toExponential(iConversion - 1);
            strNumber = strNumber.toString();

            for (iCount = 0; iCount < strNumber.length; iCount++) {
                if (strNumber.charAt(iCount) == "e") {
                    break;
                }
            }
            iExponentialPosition = iCount;
            iPower = parseInt(strNumber.substring(iExponentialPosition + 1, strNumber.length));
            if (bScientificNotation == this.significantNumberMode.SCIENTIFIC) {
                arrReturn[0] = arrReturn[0] = strNumber.substring(0, iExponentialPosition);
                arrReturn[1] = iPower;
                arrReturn = this.handleNegative(arrReturn);
                return arrReturn;
            }
            var isNegative = false;
            if (iPower < 0) {
                isNegative = true;
            }
            arrReturn[0] = strNumber.substring(0, iExponentialPosition);
            var arrTemp = String(arrReturn[0]).split(".");
            if (isNegative) {

                var strAppendZeros = Number(0).toFixed(Math.abs(iPower));
                strAppendZeros = strAppendZeros.substring(0, strAppendZeros.length - 1);

                strNumber = strAppendZeros + arrTemp[0] + arrTemp[1];
                arrReturn[0] = strNumber;
                arrReturn = this.handleNegative(arrReturn);
                return arrReturn;
            }
            else {
                arrTemp[0] += String(arrTemp[1]).substring(0, Math.abs(iPower));
                if (arrTemp[1].length > Math.abs(iPower)) {
                    arrTemp[0] += ".";
                    arrTemp[0] += String(arrTemp[1]).substr(Math.abs(iPower));
                }
                if (arrTemp[1].length < Math.abs(iPower)) {
                    var strAppendZeros = Math.abs(iPower) - arrTemp[1].length;
                    strAppendZeros = String(Math.pow(10, strAppendZeros));
                    arrTemp[0] += strAppendZeros.substr(1);
                }
                arrReturn[0] = String(arrTemp[0]);
                arrReturn = this.handleNegative(arrReturn);
                return arrReturn;

            }

        },



        calculateSignificantDigit: function calculateSignificantDigit(strNumber) {
            var iSigNum = 0;
            var iCount;
            var iDecimalPosition;
            var bIsNonZero = false;
            var bIsDecimal = false; // boolean for decimal point
            var iNumberLength = strNumber.length;
            // to check if decimal point is present
            for (iCount = 0; iCount < strNumber.length; iCount++) {
                if (strNumber.charAt(iCount) == ".") {
                    bIsDecimal = true;
                    iDecimalPosition = iCount;
                    break;
                }
            }
            iSigNum = strNumber.length;

            // calculate significant digits for number without Decimal point
            if (bIsDecimal == true) {
                for (iCount = 0; iCount < strNumber.length; iCount++) {

                    if (strNumber[iCount] == 0 || strNumber[iCount] == ".") {
                        if (strNumber[iCount] == 0) {
                            iSigNum = iSigNum - 1;
                        }
                    }
                    else {
                        break;

                    }

                }
                iSigNum--;
                return iSigNum;
            }

                // calculate significant nos without Decimal point

            else {
                // if zeroes are present at the start
                for (iCount = 0; iCount < strNumber.length; iCount++) {
                    //

                    if (strNumber[iCount] == 0 || strNumber[iCount] == ".") {
                        if (strNumber[iCount] == 0) {
                            iSigNum = iSigNum - 1;

                        }
                    }
                    else {
                        break;

                    }

                }

                // if zeroes are present at the end
                for (iCount = strNumber.length - 1; iCount >= 0; iCount--) {
                    if (strNumber[iCount] == 0 || strNumber[iCount] == ".") {
                        if (strNumber[iCount] == 0) {
                            iSigNum = iSigNum - 1;
                        }
                    }
                    else {
                        break;

                    }
                }
                return iSigNum;
            }
        },

        /**
         * Gets the html string for operator sign
         * @method getOperatorHtml
         * @param {String} operator One of the value from static constant OPERATORS
         * @param {String} [pronounceText] Text to be pronounced from TTS in place of operator sign
         * @return {String} Returns the html string with span tag for the operator sign
         * @public
        **/
        getOperatorHtml: function getOperatorHtml(operator, pronounceText) {
            var operatorCode = '',
                operatorClass = '',
                operatorHtml = '';
            switch (operator) {
                case this.OPERATOR.PLUS: {
                    operatorCode = '&#043;';
                    operatorClass = 'operator-plus-text';
                }
                    break;
                case this.OPERATOR.MINUS: {
                    operatorCode = '&#8722;';
                    operatorClass = 'operator-minus-text';
                }
                    break;
                case this.OPERATOR.MULTIPLY: {
                    operatorCode = '&#215;';
                    operatorClass = 'operator-multiply-text';
                }
                    break;
                case this.OPERATOR.DIVIDE: {
                    operatorCode = '&#247;';
                    operatorClass = 'operator-divide-text';
                }
                    break;
                default:
            }
            operatorHtml = '<span' + (pronounceText ? ' pron="' + pronounceText + '"' : '') + ' class="operator-text ' + operatorClass + '">' + operatorCode + '</span>';
            return operatorHtml;
        },

        /**
        * Operator signs
        * @property OPERATOR
        * @type Object
        * @static
        **/
        OPERATOR: {
            PLUS: 'plus',
            MINUS: 'minus',
            MULTIPLY: 'multiply',
            DIVIDE: 'divide'
        }

    });
}());
