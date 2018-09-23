(function () {
    'use strict';
    
    /**
    * Holds the methods for validation 
    * @class Validator
    * @module Utilities
    * @extends Backbone.Model.extend
    * @namespace MathInteractives.Common.Utilities.Models
    * @constructor
    */   
    MathInteractives.Common.Utilities.Models.Validator = Backbone.Model.extend({}, {        

        /**
        * Allow user to insert only numeric data & positive symbol, negative positive symbol is not allowed .
        * Invalid keypress won't show anything in input box.
        *
        * @method  validateIntegers
        * @static
        * @param event {Object} dom generated event object
        * @return {Boolean} whether number is valid positive integer or not
        */
        validateIntegers: function (event) {
            var retVal = null;

            retVal = MathInteractives.Validator.validateNegativeDecimals(event, true, true);

            return retVal;
        },

        /**
        * Allow user to insert only numeric data & negative symbol, positive symbol is not allowed .
        * Invalid keypress won't show anything in input box.
        *
        * @method  validateNegativeIntegers
        * @static
        * @param event {Object} dom generated event object
        * @return {Boolean} whether number is valid negative integer or not
        */
        validateNegativeIntegers: function (event) {
            var retVal = null;

            retVal = MathInteractives.Validator.validateNegativeDecimals(event, false, true);

            return retVal;
        },

        /**
        * Check if the text in given text Input element is completely selected.
        *
        * @method  isTextSelected
        * @static
        * @param textInputElement {Object} DOM element 
        * @return {Boolean} wheter input is completely selected or not
        */ 
        isTextSelected: function (textInputElement) {
            var isSelected = false,
                inputLength = null,
                selCharCount = null,
                $textInputElement = null;

            var selection = MathInteractives.Validator.getInputSelection(textInputElement);

            $textInputElement = $(textInputElement);
            if ($textInputElement.is('input:text')) {
                inputLength = $textInputElement.val().length;
                selCharCount = (selection.end - selection.start);
                isSelected = (inputLength === selCharCount);
            }
            return isSelected;
        },


        /**
        * get the selection start and selection end for the given input element.
        * If the given element is invalid 0,0 would be returned.
        *
        * @method  getInputSelection
        * @static 
        * @param el {Object} DOM element 
        * @return {Object} selection start and end
        */
        getInputSelection: function (el) {
            var start = 0,
                end = 0,
                normalizedValue = null,
                range = null,
                textInputRange = null,
                len = null,
                endRange = null;

            if (el) {
                if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
                    start = el.selectionStart;
                    end = el.selectionEnd;
                } else {
                    range = document.selection.createRange();

                    if (range && range.parentElement() == el) {
                        len = el.value.length;
                        normalizedValue = el.value.replace(/\r\n/g, "\n");

                        // Create a working TextRange that lives only in the input
                        textInputRange = el.createTextRange();
                        textInputRange.moveToBookmark(range.getBookmark());

                        // Check if the start and end of the selection are at the very end
                        // of the input, since moveStart/moveEnd doesn't return what we want
                        // in those cases
                        endRange = el.createTextRange();
                        endRange.collapse(false);

                        if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                            start = end = len;
                        } else {
                            start = -textInputRange.moveStart("character", -len);
                            start += normalizedValue.slice(0, start).split("\n").length - 1;

                            if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                                end = len;
                            } else {
                                end = -textInputRange.moveEnd("character", -len);
                                end += normalizedValue.slice(0, end).split("\n").length - 1;
                            }
                        }
                    }
                }
            }
            return {
                start: start,
                end: end
            };
        },


        /**
        * Check if event is a meta key press. This includes special combinations like Ctrl+C, Ctrl+V, etc.
        *
        * @method  isMetaKeyPress
        * @static 
        * @param event {Object} generated even object when key is press
        * @return {Boolean} whether meta key is press or not
        */
        isMetaKeyPress: function (event) {
            var character = null,
                keyCode = null,
                metaKeyMaps = null,
                currentMetaKeysPressed = null,
                retVal = false;

            keyCode = event.which || event.keyCode;
            character = String.fromCharCode(keyCode);

            metaKeyMaps = {
                CTRL: 2,
                SHIFT: 4,
                ALT: 8,
                META: 16
            }

            currentMetaKeysPressed = 0;
            if (event.ctrlKey) {
                currentMetaKeysPressed = (currentMetaKeysPressed | metaKeyMaps.CTRL);
            }

            if (event.shiftKey) {
                currentMetaKeysPressed = (currentMetaKeysPressed | metaKeyMaps.SHIFT);
            }

            if (event.altKey) {
                currentMetaKeysPressed = (currentMetaKeysPressed | metaKeyMaps.ALT);
            }

            if (event.metaKey) {
                currentMetaKeysPressed = (currentMetaKeysPressed | metaKeyMaps.META);
            }


            switch (keyCode) {

                case 8: // backspace
                case 9: // tab
                case 13: // enter
                case 17: // ctrl
                case 18: // alt
                case 19: // Pause brk
                case 20: // caps lock
                case 27: // escape
                case 45: // insert
                case 46: // delete
                case 33: // Pg up
                case 34: // Pg dn
                case 35: //end
                case 36: // home
                case 37: // left
                case 38: // up
                case 39: // right
                case 40: // down
                case 91: // start
                case 144: // num lock
                    {
                        retVal = true;
                        break;
                    }

                default:
                    {
                        break;
                    }
            }

            if (retVal) {
                return retVal;
            }

            if (
                (currentMetaKeysPressed === metaKeyMaps.CTRL && keyCode === 65) // Ctrl+A
                || (currentMetaKeysPressed === metaKeyMaps.CTRL && keyCode === 67) // Ctrl+C
                || (currentMetaKeysPressed === metaKeyMaps.CTRL && keyCode === 86) // Ctrl+V
                || (currentMetaKeysPressed === metaKeyMaps.CTRL && keyCode === 88) // Ctrl+X
                || (currentMetaKeysPressed === metaKeyMaps.CTRL && keyCode === 89) // Ctrl+Y
                || (currentMetaKeysPressed === metaKeyMaps.CTRL && keyCode === 90) // Ctrl+Z
                ) {
                retVal = true;
                return retVal;
            }

            return retVal;
        },

        /**
        * Restricts the input textbox to numeric characters and the desired length of the charactors
        * Invalid keypress won't show anything in input box.
        *
        * @method  restrictToNumeric
        * @param selector {Object} Event object related to the key down event
        * @param length {Number} length of selector's value
        */
        restrictToNumeric: function (selector, length) {
            console.log('restrictToNumeric')
            selector.each(function () {
                this.onkeypress = function keypresshandler(event) {
                    var charCode = event.which || event.keyCode;
                    if (typeof length !== 'undefined' && this.value.length >= length) {
                        return false;
                    }
                    //Restrict non-numeric characters
                    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                        return false;
                    }
                }
            });
        },

        /**
        * Allow user to insert only numeric & decimal data & negative symbol, positive symbol is not allowed .
        * Invalid keypress won't show anything in input box.
        *
        * @method  validateNegativeDecimals
        * @static
        * @param event {Object} Event object related to the key down event
        * @param checkPositiveOnly {Boolean} Set to `true` if only positive decimals need to be checked.
        * @param checkIntegersOnly {Boolean} Set to `true` if only integer need to be checked.
        * @return {Boolean} whether number satisfies specified condition or not
        */
        validateNegativeDecimals: function (event, checkPositiveOnly, checkIntegersOnly) {
            var character = null,
                keyCode = null,
                inputElement = null,
                textSelection = null,
                inputString = null,
                parsedString = null,
                pattern = null,
                patternMatch = null,
                retVal = true;

            checkPositiveOnly = checkPositiveOnly || false;
            checkIntegersOnly = checkIntegersOnly || false;

            if (MathInteractives.Validator.isMetaKeyPress(event)) {
                return retVal;
            }

            if (event.shiftKey) {
                retVal = false;
                event.preventDefault();
                return retVal;
            }

            keyCode = event.which || event.keyCode;

            if (keyCode === 109 || keyCode === 173 || keyCode === 189) {
                character = '-';
            }
            else if (keyCode === 110 || keyCode === 190) {
                character = '.';
            }
            else {
                character = String.fromCharCode(keyCode);
            }


            inputElement = event.target;

            textSelection = MathInteractives.Validator.getInputSelection(inputElement);

            inputString = inputElement.value;

            parsedString = inputString.substring(0, textSelection.start) + character + inputString.substring(textSelection.end);

            if (parsedString.length === 1) {
                pattern = (checkPositiveOnly) ? /^[\d]$/ : /^-|[\d]$/;
            }
            else if (checkIntegersOnly) {
                pattern = (checkPositiveOnly) ? /^[\d]+$/ : /^-{0,1}[\d]+$/;
            }
            else {
                pattern = (checkPositiveOnly) ? /^[\d]+\.{0,1}[\d]*$/ : /^-{0,1}[\d]+\.{0,1}[\d]*$/;
            }

            patternMatch = parsedString.match(pattern);
            retVal = !(patternMatch === null);

            if (!retVal) {
                event.preventDefault();
            }

            return retVal;
        },



        /**
        * Allow user to insert only decimal data.        *
        * Invalid keypress won't show anything in input box.
        *
        * @method  validateDecimals
        * @static 
        * @param event {Object} 
        * @return {Boolean} whether number is decimal or not
        */
        validateDecimals: function (event) {
            var retVal = null;

            retVal = MathInteractives.Validator.validateNegativeDecimals(event, true);

            return retVal;
        },

        /**
        * Checks whether list of array have 2 or more arrays repeating
        *
        * @method isArrayValuesRepeating 
        * @static 
        * @param responses {Object} array which have to be check for repeating values
        * @return {Boolean} Rerturn true if 2 or more arrays are repeating else returns false
        */
        isArrayValuesRepeating: function (responses) {
            var count = null,
                responsesLength = responses.length,
                newCount = null,
                isRepeat = false,
                previousElement = null,
                currElement = null;

            for (count = 0; count < responsesLength - 1; count++) {
                if (isRepeat === true) {
                    break;
                }
                previousElement = responses[count];
                if (previousElement.length === 0) {
                    return false;
                }
                for (newCount = count + 1; newCount < responsesLength; newCount++) {
                    currElement = responses[newCount];
                    if ((previousElement.join() === currElement.join()) && !MathInteractives.Validator.isArrayValuesEmpty(currElement)) {
                        isRepeat = true;
                    }
                }
            }
            return isRepeat;
        },

        /**
        * Checks whether list of array have any 1 array's element empty
        * Eg if responses = {[1, ],[1,1],[1,1],[1,1]}, then output will be false.
        *
        * @method isArrayValuesEmpty 
        * @static 
        * @param responses {Object} array which have to be check for empty values
        * @return isEmpty{boolean} Rerturn true if any 1 array's element empty, else returns false.
        */
        isArrayValuesEmpty: function (responses) {
            var count = null,
               isEmpty = false;

            responses.forEach(function (response) {
                if (response instanceof Array) {
                    response.forEach(function (element) {
                        if (element === undefined || element === '' || element === null) {
                            isEmpty = true
                        }
                    });
                }
                else {
                    if (response === null) {
                        return true;
                    }
                    if (response.toString().trim().length === 0) {
                        isEmpty = true;
                    }
                }
            });
            return isEmpty;
        },
        /**
       * Checks whether list of array have all values numeric
       * Eg if responses = {[1,asd ],[1,1],[1,1],[1,1]}, then output will be false.
       *
       * @method isArrayValuesNumeric 
       * @static 
       * @param responses {Object} array which have to be check for numeric values
       * @return isEmpty{boolean} Rerturns true if all array values are numeric else returns false.
       */
        isArrayValuesNumeric: function (responses) {
            var isNumeric = true;

            if (MathInteractives.Validator.isArrayValuesEmpty(responses)) {
                return false;
            }

            responses.forEach(function (response) {
                if (response instanceof Array) {
                    response.forEach(function (element) {
                        if (isNaN(element)) {
                            isNumeric = false;
                        }
                    });
                }
                else {
                    if (isNaN(response)) {
                        isNumeric = false;
                    }
                }
            });
            return isNumeric;
        }
    });
    MathInteractives.Validator = MathInteractives.Common.Utilities.Models.Validator;
})();