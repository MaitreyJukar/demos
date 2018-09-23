/* globals _, $, window, geomFunctions  */
(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Dgt.Views.MathInputView = Backbone.View.extend({

        "initialize": function(options) {
            this.model = options.model;
            this.model.$mathjaxDisplayArea = options.$mathjaxDisplayArea;
            this.model.engine = options.engine;
            this.render();
            this.attachEvents(this.$el);
            this._setCursorPositionRef = _.bind(this._setCursorPosition, this);
            if (!this.model.engine.accManager) {
                this.$el.on('blur', this._setCursorPositionRef);
            }
            MathUtilities.Components.EquationEngine.Models.Productions.init();
            this.model.equationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
        },

        "render": function() {
            return this;
        },

        "addMathInputField": function($newMathInputField) {
            this.attachEvents($newMathInputField);
            this.$el = $newMathInputField;
            this.setExistingTextIntoInputReferenceFuncRef = _.bind(this._setExistingTextIntoInputReference, this);
            this.setParsedAnsIntoMathInputFieldFuncRef = _.bind(this._setParsedAnsIntoMathInputField, this);
            $newMathInputField.off('focus', this.setExistingTextIntoInputReferenceFuncRef)
                .on('focus', this.setExistingTextIntoInputReferenceFuncRef)
                .off('blur', this.setParsedAnsIntoMathInputFieldFuncRef)
                .on('blur', this.setParsedAnsIntoMathInputFieldFuncRef);
        },

        "attachEvents": function($newMathInputField) {
            $newMathInputField.on('keydown', _.bind(this._keyDownEvent, this))
                .on('keypress', _.bind(this._keyPressEvent, this))
                .on('keyup', _.bind(this._keyUpEvent, this))
                .on('focus', _.bind(this._validateCursorPosition, this))
                .on('click', _.bind(this._validateCursorPosition, this))
                .on('paste', function(event) {
                    event.preventDefault();
                })
                .select(_.bind(this._selectionDone, this));

        },

        "_setCursorPosition": function(event) {
            var caretPosition = this._getCaretPosition(event),
                textarea = this.$el[0];
            if (!this.model.engine.accManager) {
                textarea.focus();
            }
            this._setCaretPosition(event, caretPosition);
            this._updateInputReferencePointer(event, caretPosition);
        },

        "_setExistingTextIntoInputReference": function(event) {
            var $mathInputField = $(event.target),
                mathInputFieldData, mathInputFieldDataLength, loopCtr,
                inputReference = [];
            if ($mathInputField.val()) {
                mathInputFieldData = $mathInputField.val();
                mathInputFieldDataLength = mathInputFieldData.length;
                for (loopCtr = 0; loopCtr < mathInputFieldDataLength; loopCtr++) {
                    inputReference.push(mathInputFieldData.charAt(loopCtr));
                }
                this.model.inputReference = inputReference;

                this._setCaretPosition(null, $mathInputField.val().length);
                this._updateInputReferencePointer(null, $mathInputField.val().length);

            }
        },

        "_setParsedAnsIntoMathInputField": function(event) {
            var $mathInputField = $(event.target),
                mathInputFieldValue, mathInputUpdateEvent = jQuery.Event('math-input-updated'),
                lastInputReferenceValue,
                replaceFunction, latex,
                $divToDisplay;

            if ($mathInputField.hasClass('hide-text-field', 'parameter')) {
                return;
            }

            replaceFunction = function(snip, index, original) {
                return MathUtilities.Components.Utils.Models.MathHelper._generateLatexForNumber(snip);
            };

            mathInputFieldValue = this.model.getAnswerFromParser();

            if (mathInputFieldValue === '') {
                mathInputFieldValue = $mathInputField.val();
            }

            this.model.setAnswer(mathInputFieldValue);
            if (mathInputFieldValue === null || isNaN(mathInputFieldValue) || !isFinite(mathInputFieldValue)) {
                lastInputReferenceValue = MathUtilities.Tools.Dgt.Models.MathInput.lastInputReferenceValue;
                mathInputFieldValue = this.model.inputReference = lastInputReferenceValue;
            }

            latex = mathInputFieldValue.toString();
            latex = latex.replace(/\s/gi, '') // replace space
                .replace(/^\-?(\d+?|\d*?\.\d+?)e[\+\-]?\d+?$/gi, replaceFunction); // replace exponential numbers

            $divToDisplay = this.$el.parent().find('.dgt-measurement-value');

            MathUtilities.Tools.Dgt.Views.MathInputView.latexToMathjax(latex, $divToDisplay);

            $mathInputField.val(mathInputFieldValue);
            $mathInputField.trigger(mathInputUpdateEvent);
        },

        "_selectionDone": function(event) {
            var selectionStart = event.target.selectionStart,
                selectionEnd = event.target.selectionEnd;

            //this kind of selection is normally done to set focus throughout setCretPosition function...
            //in that case...selection event SHOUD NOT be prevented
            //WARNING -- further that will result into maximum call stack exceeded...as setCaretPosition triggers selection & to prevent selection we need to set focus using setCaretPosition...
            if (selectionStart === selectionEnd) {
                return true;
            }

            this._setCaretPosition(event, this._getCaretPosition(event));
            this._validateCursorPosition(event);
            event.preventDefault();
        },

        /*
        special keys don't have keypress event, & other keys give charCode equivalent to capital charCode of depressed key of keyboard...
        so for special keys on keyDown respective functions are called & for others on keyPress.
        Updated cursor position is retrieved on input & keyup event.
        so for cursor navigation keys respective functions are called on keyup.
        */
        "_keyDownEvent": function(event) {
            var charCode = event.which || event.charCode || event.keyCode,
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput;

            /*For char 'n' on keypress event we get char code 110 which is of dot key...
            Hence we set hasKeyDownEvent as true... and check that in keyPressEvent
            for distinguishing between char 'n' and special dot key
            */
            if (typeof event.originalEvent !== 'undefined') {
                this.model.hasKeyDownEvent = true;
            }
            /*preventing special characters to be added to the calculator math-input-field*/
            if ((charCode >= MathInput.CHARCODE_NUMBER_1 && charCode <= MathInput.CHARCODE_NUMBER_5 ||
                    charCode === MathInput.CHARCODE_NUMBER_7) && event.shiftKey ||
                charCode === MathInput.CHARCODE_FOR_SINGLE_QUOTE) {
                event.preventDefault();
            }

            this.model.isSpecialKey = this._isSpecialKey(charCode, event);

            /*If navigation key is kept pressed and during the time other key is pressed then it will prevent that key input*/
            if (this.model.isNavigationKeyKeptPressed && !this._isCursorNavigationKey(event)) {
                event.preventDefault();
            }

            /*While navigation key is pressed set isNavigationKeyKeptPressed as true*/
            if (this._isCursorNavigationKey(event) && !this.model.isNavigationKeyKeptPressed) {
                this.model.isNavigationKeyKeptPressed = true;
            }

            if (this.$el[0].selectionStart !== this.$el[0].selectionEnd) {
                /*some text is selected*/
                event.preventDefault();
                return false;
            }
            if (event.ctrlKey && charCode === MathInput.CHARCODE_ALPHABET_V) {
                //preventing paste
                event.preventDefault();
            }
            if (this._isSpecialKey(charCode, event) && !this.model.isNavigationKeyKeptPressed) {
                this._validateInput(event);
            }

            /*while entering intellisense input if navigation key is pressed then remove &
            handle current intellisenseInputsString*/
            if (this.model.checkForIntellisenseMapping && this._isCursorNavigationKey(event)) {
                this._validateCursorPosition(event);
                this._handleCurrentIntellisenseInput(event);
                this.model.intellisenseInputString = '';
                this.model.checkForIntellisenseMapping = false;
            }
            /*Update the reference pointer when navigation key is pressed*/

        },
        /*
        Note that keydown and keyup provide a code indicating which key is pressed, while keypress indicates which character was entered.
        For example, a lowercase "a" will be reported as 65 by keydown and keyup, but as 97 by keypress.
        So for numbers, characters, operators respective functions are called on keyPress events.
        */
        "_keyPressEvent": function(event) {

            var charCode = event.which || event.charCode || event.keyCode;

            if ((this.model.hasKeyDownEvent && this.model.isSpecialKey === false ||
                    this._isSpecialKey(charCode, event) === false) && this._isCursorNavigationKey(event) === false) {
                this._validateInput(event);
            }

            if (this.model.hasKeyDownEvent) {
                this.model.hasKeyDownEvent = false;
            }

        },

        /*
        Updated cursor position is retrieved on input & keyup event.
        so for cursor navigation keys respective functions are called on keyup.
        */
        "_keyUpEvent": function(event) {

            var charCode = event.which || event.charCode || event.keyCode;
            geomFunctions.traceConsole('KeyUp - ' + charCode + ' :: cursor Position = ' + this._getCaretPosition(event));

            /*While navigation key is pulled up set isNavigationKeyKeptPressed as false*/
            if (this.model.isNavigationKeyKeptPressed && this._isCursorNavigationKey(event)) {
                this.model.isNavigationKeyKeptPressed = false;
            }

            if (this._isCursorNavigationKey(event)) {
                this._validateCursorPosition(event);
            }

            if (this.model.hasKeyDownEvent) {
                this.model.hasKeyDownEvent = false;
            }

        },

        /****************functions called during keydown / keypress*********************/

        /*validate input for numeric & adding functions*/
        "_validateInput": function(event) {

            var charCode = event.which || event.charCode || event.keyCode,
                regexForCalculatorInput = /[acelprst\d\+\-\(\)\^\*\/\.]/, //allowing specific characters only
                curInput = this._getStringFromCharCode(event);


            /*validation for not accepting special and invalid chars*/
            if (regexForCalculatorInput.test(curInput) || this.model.checkForIntellisenseMapping ||
                this._isRemovalKey(charCode)) {
                this._handleValidInput(event); /*valid input means allowed chars, numbers & removal keys*/
            } else if (!this._isCursorNavigationKey(event)) {
                event.preventDefault();
            } else if (event.isDotKey) {
                event.preventDefault();
            }
        },

        "_handleCurrentIntellisenseInput": function(event) {
            var inputReferenceLength = this.model.inputReference.length,
                inputReference = this.model.inputReference.slice(0, inputReferenceLength),
                curInputString, caretPosition,
                textToRemove, newCaretPosition, MathInput = MathUtilities.Tools.Dgt.Models.MathInput,
                isFunctionString, removeNextChar = false;

            caretPosition = this._getCaretPosition(event);
            textToRemove = this._getTextToRemoveAroundCaretPosition(MathInput.CHARCODE_BACKSPACE, caretPosition);
            if (textToRemove) {
                newCaretPosition = this._removeTextAroundCaretPosition(event, MathInput.CHARCODE_BACKSPACE, textToRemove, caretPosition);
            }
            curInputString = inputReference[inputReferenceLength - 1];
            this._updateInputReferenceArray({
                "charCode": MathInput.CHARCODE_BACKSPACE,
                "curInputString": curInputString,
                "isFunctionString": isFunctionString,
                "removeNextChar": removeNextChar,
                "event": event
            });
            this._setCaretPosition(event, newCaretPosition);
            this._updateInputReferencePointer(event, newCaretPosition);
        },

        /*
        checkForIntellisenseMapping is set to false until there is no character that maps into intellisense Mapping or a function is mapped.
        intellisenseInputString is set when char maps into intellisense Mapping and empty when character does not map.
        */

        "_handleValidInput": function(event) {

            var charCode = event.which || event.charCode || event.keyCode,
                newCaretPosition, curInputString,
                intellisenseInputString = this.model.intellisenseInputString,
                isFunctionString, autoInputString,
                intellisenseMapping = this.model.intellisenseMapping,
                caretPosition, textToRemove,
                removeNextChar = false,
                checkForIntellisenseMapping = this.model.checkForIntellisenseMapping,
                inputReferenceLength = this.model.inputReference.length,
                regexForCalculatorInput = /[acelprst\d\+\-\(\)\^\*\/\.]/, // allowing specific characters only
                inputReferencePointer,
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput;


            /*If Character maps into intellisenseMapping.functions and it is not a complete function then set checkForIntellisenseMapping to true*/
            if (!checkForIntellisenseMapping && intellisenseMapping.functions[this._getStringFromCharCode(event)] &&
                intellisenseMapping.functions[this._getStringFromCharCode(event)].indexOf("(") === -1) {
                checkForIntellisenseMapping = this.model.checkForIntellisenseMapping = true;
            }

            /* set intellisenseInputString until checkForIntellisenseMapping is true */
            if (checkForIntellisenseMapping || intellisenseInputString === '') {
                this.model.intellisenseInputString += this._getStringFromCharCode(event);
                intellisenseInputString = this.model.intellisenseInputString;
            }

            if (intellisenseInputString.length > 1) {

                /*If intellisenseInputString maps into intellisenseMapping.functions or if it does not map*/

                this._handleCurrentIntellisenseInput(event);

                /*If intellisenseInputString maps into intellisenseMapping.functions and if is a complete function then set checkForIntellisenseMapping to false*/
                if (intellisenseMapping.functions[intellisenseInputString] &&
                    intellisenseMapping.functions[intellisenseInputString].indexOf('(') !== -1) {
                    checkForIntellisenseMapping = this.model.checkForIntellisenseMapping = false;
                }
                /*If intellisenseInputString does not map into intellisenseMapping.functions and current input character maps into intellisenseMapping.functions*/
                else if (typeof intellisenseMapping.functions[intellisenseInputString] === 'undefined' &&
                    intellisenseMapping.functions[this._getStringFromCharCode(event)]) {
                    /*If current input character maps into intellisenseMapping.functions then set checkForIntellisenseMapping to false else true
                    and set intellisenseInputString to current input character*/
                    checkForIntellisenseMapping = this.model.checkForIntellisenseMapping = intellisenseMapping.functions[this._getStringFromCharCode(event)].indexOf('(') === -1;
                    intellisenseInputString = this.model.intellisenseInputString = this._getStringFromCharCode(event);
                }
                /*If current input character does not map into intellisenseMapping.functions then set checkForIntellisenseMapping to false
                and empty intellisenseInputString*/
                else if (typeof intellisenseMapping.functions[this._getStringFromCharCode(event)] === 'undefined') {
                    checkForIntellisenseMapping = this.model.checkForIntellisenseMapping = false;
                    intellisenseInputString = this.model.intellisenseInputString = '';
                    if (!regexForCalculatorInput.test(this._getStringFromCharCode(event))) {
                        event.preventDefault();
                        return;
                    }
                }
            }

            /*check for intellisense*/

            if (intellisenseMapping.functions[intellisenseInputString]) {
                autoInputString = intellisenseMapping.functions[intellisenseInputString];
                /*if checkForIntellisenseMapping is set to false then set isFunctionString to true*/
                if (!checkForIntellisenseMapping) {
                    isFunctionString = true;
                }
            } else if (!checkForIntellisenseMapping && intellisenseMapping.constants[charCode]) {
                autoInputString = intellisenseMapping.constants[charCode];
                isFunctionString = false;
            } else if (!checkForIntellisenseMapping && intellisenseMapping.operators[intellisenseInputString]) {
                autoInputString = intellisenseMapping.operators[intellisenseInputString];
                isFunctionString = false;
            }

            /*event.isDotKey and event.type=keyDdown is checked for the dot operator*/
            if (autoInputString || event.isTrigger && event.type === 'keypress' ||
                event.isTrigger && event.type === 'keydown' && event.isDotKey) {
                if (!autoInputString && event.isTrigger) {
                    autoInputString = this._getStringFromCharCode(event);
                }
            } else if (this._isRemovalKey(charCode)) {
                /*remove text around caret position from array & textarea
                IMP - this function should return expected newCursorPosition*/
                caretPosition = this._getCaretPosition(event);
                inputReferencePointer = this.model.inputReferencePointer;
                if (inputReferencePointer > 0 && charCode === MathInput.CHARCODE_BACKSPACE ||
                    inputReferencePointer !== inputReferenceLength && charCode === MathInput.CHARCODE_DELETE) {
                    textToRemove = this._getTextToRemoveAroundCaretPosition(charCode, caretPosition);
                    if (textToRemove) {
                        newCaretPosition = this._removeTextAroundCaretPosition(event, charCode, textToRemove, caretPosition);
                    }
                } else {
                    newCaretPosition = caretPosition;
                    this.model.intellisenseInputString = '';
                    return;
                }

                event.preventDefault();
            }

            curInputString = autoInputString || this._getStringFromCharCode(event);

            if (this._isCursorNavigationKey(event) === false) {
                this._updateInputReferenceArray({
                    "charCode": charCode,
                    "curInputString": curInputString,
                    "isFunctionString": isFunctionString,
                    "removeNextChar": removeNextChar,
                    "event": event
                });
            }

            if (!isFunctionString && this._isRemovalKey(charCode)) {
                newCaretPosition = newCaretPosition || newCaretPosition === 0 ? newCaretPosition : this._getCaretPosition(event) + 1;
                this._setCaretPosition(event, newCaretPosition);
                this._updateInputReferencePointer(event, newCaretPosition);
            }

            /*empty intellisenseInputString if checkForIntellisenseMapping is false*/
            if (!checkForIntellisenseMapping) {
                this.model.intellisenseInputString = '';
            }
        },

        "_addTextAtCaretPosition": function(event, text, isFunctionString) {
            var $textarea = this.$el,
                contents = $textarea.val(),
                newCaretPosition,
                caretPosition = this._getCaretPosition(event);

            contents = contents.substr(0, caretPosition) + text + contents.substr(caretPosition);

            $textarea.val(contents);

            newCaretPosition = caretPosition + text.length;

            if (event) {
                event.preventDefault();
            }
            return newCaretPosition;
        },


        "_getTextToRemoveAroundCaretPosition": function(charCode) {
            var inputReference = this.model.inputReference,
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput,
                textToRemove = '',
                textRemovalIndex;


            if (charCode === MathInput.CHARCODE_BACKSPACE) {
                textRemovalIndex = this.model.inputReferencePointer - 1;
            } else if (charCode === MathInput.CHARCODE_DELETE) {
                textRemovalIndex = this.model.inputReferencePointer;
            }
            if (typeof inputReference[textRemovalIndex] === 'object') {
                textToRemove = inputReference[textRemovalIndex].getDisplayedValueAsString();
            } else {
                textToRemove = inputReference[textRemovalIndex];
            }

            return textToRemove;
        },

        "_removeTextAroundCaretPosition": function(event, charCode, textToRemove, caretPosition) {
            var $textarea = this.$el,
                contents = $textarea.val(),
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput,
                newCaretPosition,
                removalKey = MathInput.CHARCODE_BACKSPACE === charCode ? 'backspace' : 'delete';

            if (removalKey === 'backspace') {
                contents = contents.substr(0, caretPosition - textToRemove.length) + contents.substr(caretPosition);
                newCaretPosition = caretPosition - textToRemove.length;
            } else if (removalKey === 'delete') {
                contents = contents.substr(0, caretPosition) + contents.substr(caretPosition + textToRemove.length);
                newCaretPosition = caretPosition;
            }
            $textarea.val(contents);
            return newCaretPosition;

        },

        "isValidInput": function(charCode, curInputString, isFunctionString) {
            var MathInput = MathUtilities.Tools.Dgt.Models.MathInput;

            if (!charCode && curInputString.length === 1) {
                charCode = curInputString.charCodeAt(0);
            }


            return charCode >= MathInput.CHARCODE_NUMPAD_KEY_0 && charCode <= MathInput.CHARCODE_NUMPAD_KEY_9 ||
                curInputString === '\u03C0' || curInputString === 'e' || !!this.model.checkForIntellisenseMapping ||
                typeof curInputString === 'object' || !!isFunctionString;
        },

        "updateInputData": function(data) {
            var curInputString = typeof data.curInputString === 'object' ? data.curInputString.getDisplayedValueAsString() : data.curInputString,
                event = data.event,
                isFunctionString = data.isFunctionString,
                setCaretAtPreviousPosition = data.setCaretAtPreviousPosition,
                newCaretPosition;

            if (typeof data.curInputString === 'object' && isNaN(curInputString)) {
                curInputString = 'undefined';
            }

            newCaretPosition = this._addTextAtCaretPosition(event, curInputString, isFunctionString);
            if (setCaretAtPreviousPosition) {
                this._setCaretPosition(event, newCaretPosition - curInputString.length);
                this._updateInputReferencePointer(event, newCaretPosition - curInputString.length);
            } else {
                this._setCaretPosition(event, newCaretPosition);
                this._updateInputReferencePointer(event, newCaretPosition);
            }
        },

        /*to update that reference array using intpuReferencePointer*/
        "_updateInputReferenceArray": function(inputData) {

            var charCode = inputData.charCode,
                curInputString = inputData.curInputString,
                isFunctionString = inputData.isFunctionString,
                removeNextChar = inputData.removeNextChar,
                event = inputData.event,
                inputReferencePointer = this.model.inputReferencePointer,
                inputReference = this.model.inputReference,
                tempInputReference = [],
                closeFunction = ')',
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput,
                removalLength = removeNextChar ? 2 : 1,
                parsedAns, prevInput, nextInput, fillerString = ' * ';

            switch (charCode) {
                case MathInput.CHARCODE_BACKSPACE:
                    this.model.inputReference.splice(this.model.inputReferencePointer - 1, removalLength);
                    break;

                case MathInput.CHARCODE_DELETE:
                    this.model.inputReference.splice(this.model.inputReferencePointer, removalLength);
                    break;

                default:

                    if (isFunctionString) {
                        curInputString = curInputString.substring(0, curInputString.length - 1);
                    }

                    if (inputReferencePointer === inputReference.length) {

                        prevInput = inputReference[inputReferencePointer - 1];
                        if (prevInput && this.isValidInput(null, prevInput, isFunctionString) &&
                            this.isValidInput(charCode, curInputString, isFunctionString) &&
                            (typeof prevInput === 'object' || typeof curInputString === 'object')) {
                            inputReference.push(fillerString);
                            this.updateInputData({
                                "curInputString": fillerString,
                                "isFunctionString": isFunctionString
                            });
                        }

                        inputReference.push(curInputString);
                        this.updateInputData({
                            "curInputString": curInputString,
                            "isFunctionString": isFunctionString,
                            "event": event
                        });

                        if (isFunctionString) {
                            inputReference.push(closeFunction);
                            this.updateInputData({
                                "curInputString": closeFunction,
                                "isFunctionString": isFunctionString,
                                "setCaretAtPreviousPosition": true
                            });
                        }
                    } else {
                        prevInput = inputReference[inputReferencePointer - 1];
                        nextInput = inputReference[inputReferencePointer];

                        if (prevInput && this.isValidInput(null, prevInput, isFunctionString) &&
                            this.isValidInput(charCode, curInputString, isFunctionString) &&
                            (typeof prevInput === 'object' || typeof curInputString === 'object')) {
                            tempInputReference = tempInputReference.concat(inputReference.slice(0, inputReferencePointer), [fillerString], inputReference.slice(inputReferencePointer, inputReference.length));
                            inputReference = this.model.inputReference = tempInputReference.slice();
                            tempInputReference = [];
                            this.updateInputData({
                                "curInputString": fillerString,
                                "isFunctionString": isFunctionString,
                                "event": event
                            });
                            inputReferencePointer = this.model.inputReferencePointer;
                        }

                        if (!isFunctionString) {
                            tempInputReference = tempInputReference.concat(inputReference.slice(0, inputReferencePointer), [curInputString], inputReference.slice(inputReferencePointer, inputReference.length));
                            inputReference = this.model.inputReference = tempInputReference.slice();
                            tempInputReference = [];
                            this.updateInputData({
                                "curInputString": curInputString,
                                "isFunctionString": isFunctionString,
                                "event": event
                            });
                            inputReferencePointer = this.model.inputReferencePointer;

                            if (nextInput && this.isValidInput(null, nextInput, isFunctionString) &&
                                this.isValidInput(charCode, curInputString, isFunctionString) &&
                                !this.model.checkForIntellisenseMapping &&
                                (typeof nextInput === 'object' || typeof curInputString === 'object')) {
                                tempInputReference = tempInputReference.concat(inputReference.slice(0, inputReferencePointer), [fillerString], inputReference.slice(inputReferencePointer, inputReference.length));
                                inputReference = this.model.inputReference = tempInputReference.slice();
                                tempInputReference = [];
                                this.updateInputData({
                                    "curInputString": fillerString,
                                    "isFunctionString": isFunctionString,
                                    "event": event,
                                    "setCaretAtPreviousPosition": true
                                });
                            }

                        } else {
                            if (nextInput && this.isValidInput(null, nextInput, isFunctionString)) {
                                tempInputReference = tempInputReference.concat(inputReference.slice(0, inputReferencePointer), [curInputString], inputReference.slice(inputReferencePointer, inputReference.length));
                                inputReference = this.model.inputReference = tempInputReference.slice();
                                tempInputReference = [];
                                this.updateInputData({
                                    "curInputString": curInputString,
                                    "isFunctionString": isFunctionString,
                                    "event": event
                                });
                            } else {
                                tempInputReference = tempInputReference.concat(inputReference.slice(0, inputReferencePointer), [curInputString], [closeFunction], inputReference.slice(inputReferencePointer, inputReference.length));
                                inputReference = this.model.inputReference = tempInputReference.slice();
                                tempInputReference = [];
                                this.updateInputData({
                                    "curInputString": curInputString,
                                    "isFunctionString": isFunctionString,
                                    "event": event
                                });
                                this.updateInputData({
                                    "curInputString": closeFunction,
                                    "isFunctionString": isFunctionString,
                                    "setCaretAtPreviousPosition": true
                                });
                            }
                        }
                    }
                    break;
            }

            this.model.tempInputReference = this.model.inputReference.slice();

            parsedAns = this.model.getAnswerFromParser();

            this.model.setAnswer(parsedAns);

            this.model.setLatexForCalculationLabel();
        },

        /*******************************************************************/

        /****************functions called during keyUp**********************/

        /*if cursor at invalid position, set it at valid position*/
        "_validateCursorPosition": function(event) {
            var charCode = event.which || event.charCode || event.keyCode,
                inputReference = this.model.inputReference,
                caretPosition = this._getCaretPosition(event),
                loopVar, prevDiff, nextDiff,
                stringFromInputReference = '',
                newLength, MathInput = MathUtilities.Tools.Dgt.Models.MathInput,
                cursorRepositioned = false,
                newString;

            for (loopVar = 0; loopVar < inputReference.length; loopVar++) {

                if (typeof inputReference[loopVar] !== 'string') {
                    /*get constants value & find length of value to display*/
                    newString = inputReference[loopVar].getDisplayedValueAsString();
                } else { /*simple char or some function*/
                    newString = inputReference[loopVar];
                }

                newLength = stringFromInputReference.length + newString.length;

                if (newLength === caretPosition) {
                    /*at allowed position*/
                    break;
                } else if (newLength > caretPosition) {

                    switch (charCode) {
                        case MathInput.CHARCODE_LEFT_KEY:
                            this._setCaretPosition(event, stringFromInputReference.length);
                            cursorRepositioned = true;
                            break;

                        case MathInput.CHARCODE_RIGHT_KEY:
                            this._setCaretPosition(event, newLength);
                            cursorRepositioned = true;
                            break;

                            //kept for reference...do not delete comment
                            //default code should be executed for UP or DOWN key
                            //case dgtCalculator.CHARCODE_UP_KEY:
                            //case dgtCalculator.CHARCODE_DOWN_KEY:
                        default:

                            prevDiff = caretPosition - stringFromInputReference.length;
                            nextDiff = newLength - caretPosition;
                            if (prevDiff < nextDiff) {
                                this._setCaretPosition(event, stringFromInputReference.length);
                            } else {
                                this._setCaretPosition(event, newLength);
                            }
                            cursorRepositioned = true;
                            break;
                    }

                }

                stringFromInputReference += newString;
                if (cursorRepositioned) {
                    break;
                }
            }

            this._updateInputReferencePointer(event);
        },

        /*******************************************************************/

        /**************************general functions*************************/

        "_getCaretPosition": function() {
            var textarea = this.$el[0],
                range, storedRange, CaretPos = 0;
            // IE Support
            if (document.selection) {

                textarea.focus();

                if (textarea.type === 'textarea') {
                    range = document.selection.createRange();
                    // We'll use this as a 'dummy'
                    storedRange = range.duplicate();
                    // Select all text
                    storedRange.moveToElementText(textarea);
                    // Now move 'dummy' end point to end point of original range
                    storedRange.setEndPoint('EndToEnd', range);
                    // Now we can calculate start and end points
                    CaretPos = textarea.selectionStart = storedRange.text.length;
                } else if (textarea.type === 'text') {
                    range = document.selection.createRange();
                    storedRange = range.duplicate();
                    storedRange.moveEnd('character', textarea.value.length);
                    if (storedRange.text === '') {
                        CaretPos = textarea.value.length;
                    } else {
                        CaretPos = textarea.value.lastIndexOf(storedRange.text);
                    }
                }

            }
            // Firefox support
            else if (textarea.selectionStart || textarea.selectionStart === '0') {
                CaretPos = textarea.selectionStart;
            }
            return CaretPos;
        },

        "_setCaretPosition": function(event, pos) {
            var textarea = this.$el[0],
                range;
            if (textarea.setSelectionRange) {
                if (!this.model.engine.accManager) {
                    textarea.focus();
                }
                if (document.selection) {
                    document.selection.empty();
                }
                if ($(textarea).is(':visible')) {
                    textarea.setSelectionRange(pos, pos);
                }
            } else if (textarea.createTextRange) {
                range = textarea.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
        },

        "_updateInputReferencePointer": function(event, newCaretPosition) {

            var caretPosition = newCaretPosition || this._getCaretPosition(event),
                stringFromInputReference = '',
                loopVar, inputReference = this.model.inputReference,
                newString, newLength;

            if (caretPosition === 0) {
                this.model.inputReferencePointer = 0;
            } else {

                for (loopVar = 0; loopVar < inputReference.length; loopVar++) {
                    if (typeof inputReference[loopVar] !== 'string') {
                        /*...... get constants value & find length of value to display*/
                        newString = inputReference[loopVar].getDisplayedValueAsString();
                    } else { /*simple char or some function*/
                        newString = inputReference[loopVar];
                    }

                    newLength = stringFromInputReference.length + newString.length;

                    if (newLength === caretPosition) {
                        /*at allowed position*/
                        this.model.inputReferencePointer = loopVar + 1;
                        break;
                    }

                    stringFromInputReference += newString;
                }

            }
            if ('ontouchstart' in window) {
                this._updateCursorPosition();
            }
        },

        "_isCursorNavigationKey": function(event) {
            var MathInput = MathUtilities.Tools.Dgt.Models.MathInput,
                charCode = event.charCode || event.keyCode || event.which;

            return charCode === MathInput.CHARCODE_PAGEUP_KEY || charCode === MathInput.CHARCODE_PAGEDOWN_KEY ||
                charCode === MathInput.CHARCODE_END_KEY || charCode === MathInput.CHARCODE_HOME_KEY ||
                this._isArrowNavigation(event) && !event.isTrigger;
        },

        "_updateCursorPosition": function(event) {
            var $inputField = this.$el,
                $cursor = this.$el.siblings('.cur'),
                i, j,
                PADDING = 26,
                caretIndex, left, textAreaWidth = 300,
                curAtLine, top = 117,
                cursorIndex = 0,
                findWidth,
                inputReference;
            caretIndex = this._getCaretPosition();
            inputReference = this.model.getInputReferenceWithMeasurementAsString();

            findWidth = _.bind(function() {
                var width = 0,
                    loopvar = 0;

                for (i = loopvar; i < inputReference.length; i++) {
                    if (cursorIndex >= caretIndex) {
                        return width;
                    }
                    if (typeof inputReference[i] === 'object') {
                        inputReference[i] = '(' + inputReference[i].value + ')';
                    }
                    if (inputReference[i].length > 1) {
                        for (j = 0; j < inputReference[i].length; j++) {

                            if (cursorIndex === caretIndex) {
                                return width;
                            }
                            if (inputReference[i][j] === ' ') {
                                width += this._getTextWidth('&nbsp;');
                            } else {
                                width += this._getTextWidth(inputReference[i][j]);
                            }
                            cursorIndex++;
                        }
                    } else {
                        width += this._getTextWidth(inputReference[i]);
                        cursorIndex++;
                    }

                }
                return width;
            }, this);
            left = findWidth();
            $inputField.css({
                "white-space": "pre"
            });
            curAtLine = parseInt(left / textAreaWidth, 10);
            if (curAtLine !== 0) {
                top += curAtLine * 20;
                PADDING = 22;
            }
            while (left >= textAreaWidth) {
                left -= textAreaWidth;
            }
            if (this.model.browserCheck.isIOS) {
                PADDING = 30;
                left += curAtLine * 5;
            }
            if ($inputField.val().length === 0) {
                left = 0;
            }
            if (curAtLine === 2) {
                $cursor.hide();
            } else {
                $cursor.show();
            }

            $cursor.css({
                'left': left + PADDING,
                'top': top
            });

        },

        "_getTextWidth": function(string) {
            if (typeof string !== 'undefined') {
                var width = 0,
                    i,
                    text = '',
                    count = 1000;
                if (!this.model.characterWidthMap[string]) {
                    if (string === '-') {
                        width = 5;
                    } else {
                        if (string === '1') {
                            count = 1;
                        }
                        for (i = 0; i < count; i++) {
                            text += string;
                        }
                        $('body').append('<span id="text-dummy-elem" style="font-size: 14px;font-family: Helvetica;display:inline-block;">' + text + '</span>');
                        width = $('#text-dummy-elem').width() / count;
                        $('#text-dummy-elem').remove();
                    }
                    this.model.characterWidthMap[string] = width;

                } else {
                    width = this.model.characterWidthMap[string];
                }
                return width;
            }

        },
        "_isArrowNavigation": function(event) {
            var MathInput = MathUtilities.Tools.Dgt.Models.MathInput,
                charCode = event.charCode || event.keyCode || event.which;
            if (charCode >= MathInput.CHARCODE_LEFT_KEY && charCode <= MathInput.CHARCODE_DOWN_KEY) { /*cursor navigation*/

                return !(charCode === MathInput.CHARCODE_DOWN_KEY && event.shiftKey);
                /*'(' is having same charCode as down key & bracket can be typed only by pressing shift + 9 */

            }
            return false;
        },

        /*
        1. Ideally keyPress event should get triggered for special keys(like control, shift, delete, backspace).
        This function returns `true` for those special keys that affects(changes) input in the textarea (like backspace, delete).
        2. For `.` gives correct charCode in keydown & in in keypress gives charCode of `Delete` for `.`. So treating it as special key.
        */
        "_isSpecialKey": function(charCode, event) {
            var MathInput = MathUtilities.Tools.Dgt.Models.MathInput;

            if (charCode === MathInput.CHARCODE_DOT_KEY ||
                charCode === MathInput.CHARCODE_NUMPAD_DOT_KEY && !event.isTrigger) {
                event.isDotKey = true;
            }

            return charCode === MathInput.CHARCODE_BACKSPACE || charCode === MathInput.CHARCODE_DELETE || !!event.isDotKey;
        },

        /*check whether key that removes from textarea...(viz. backspace, delete)*/
        "_isRemovalKey": function(charCode) {
            var MathInput = MathUtilities.Tools.Dgt.Models.MathInput;
            return charCode === MathInput.CHARCODE_BACKSPACE || charCode === MathInput.CHARCODE_DELETE;
        },

        "_getStringFromCharCode": function(event) {
            var charCode = event.which || event.charCode || event.keyCode,
                stringForCharCode;

            if (event.isDotKey) {
                stringForCharCode = String.fromCharCode(MathUtilities.Tools.Dgt.Models.MathInput.CHARCODE_DELETE);
            } else {
                stringForCharCode = String.fromCharCode(charCode);
            }
            return stringForCharCode;
        },

        "_saveCursorPositionsOnBlur": function(event) {

            var model = this.model;
            model.cursorPositionsWhenBlurred.caretPosition = this._getCaretPosition(event);
            model.cursorPositionsWhenBlurred.inputReferencePointer = model.inputReferencePointer;

        },

        /*Adds measurement to calculator when clicked on the measurement while calculator popup is opened*/
        "addMeasurementToInput": function(measurement, event) {

            //While entering intellisense input if measurement is added...
            if (this.model.checkForIntellisenseMapping) {
                this._handleCurrentIntellisenseInput(event);
                this.model.checkForIntellisenseMapping = false;
                this.model.intellisenseInputString = '';
            }

            /*add measurement value at cursor position*/

            /*add in input reference array*/
            this.model.updateConstantMapping(measurement);
            this._updateInputReferenceArray({
                "curInputString": measurement
            });
        },

        /*reload text and answer in input field while we need to edit a measurement */
        "reloadInputAndOutput": function() {

            //reload text in input field & render in output--- set answer output (using this.inputReference)
            var $calculatorInput = this.$el,
                model = this.model,
                $mathjaxDisplayArea = model.$mathjaxDisplayArea,
                calculatorFieldInput, inputReferenceInStringMode,
                latex, parsedAns, latexToDisplay,
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput;


            inputReferenceInStringMode = model.getInputReferenceWithMeasurementAsString();
            calculatorFieldInput = inputReferenceInStringMode.join('');
            $calculatorInput.val(calculatorFieldInput);
            this._setCaretPosition(null, calculatorFieldInput.length);
            this._updateInputReferencePointer(null, calculatorFieldInput.length);
            inputReferenceInStringMode = model.getInputReferenceWithMeasurementAsLatex();
            latex = MathInput.textToLatex(inputReferenceInStringMode);
            this.model.latex = MathInput.getLatexWithLargerNumberInScientificNotation(latex.slice());
            parsedAns = model.getAnswerFromParser();
            latexToDisplay = MathInput.getLatexWithLargerNumberInScientificNotation(latex + '=' + parsedAns.toString());
            MathUtilities.Tools.Dgt.Views.MathInputView.latexToMathjax(latexToDisplay, $mathjaxDisplayArea, null, true);
            /*......reload text in input field & render in output--- set answer output (using this.inputReference),
            set cursorPosition/focus
            check:: if we need to set inputReferenceArray*/
            model.setAnswer(parsedAns);
        }
    }, {

        "latexToMathjax": function(latexCode, $mathjaxDisplayArea, callback, linebreak) {
            //to allow text to come in next line...
            linebreak = Boolean(linebreak);
            if (MathJax.Hub.config['HTML-CSS'].linebreaks.automatic !== linebreak) {
                MathJax.Hub.config['HTML-CSS'].linebreaks.automatic = linebreak;
            }
            var QUEUE, math = null;
            latexCode = MathUtilities.Tools.Dgt.Models.MathInput.changeLatex(latexCode);
            QUEUE = MathJax.Hub.queue;
            math = MathJax.Hub.getAllJax('math-output')[0];

            QUEUE.Push(['Text', math, latexCode]);
            QUEUE.Push(
                function() {
                    MathUtilities.Tools.Dgt.Views.MathInputView.toMathML(math, $mathjaxDisplayArea, callback);
                }
            );

        },

        "toMathML": function(jax, $mathjaxDisplayArea, callback) {
            var mml;
            mml = jax.root.toMathML('');
            if (callback) {
                MathJax.Callback(callback)(mml);
            }

            $mathjaxDisplayArea.html(mml);
            MathUtilities.Tools.Dgt.Views.MathInputView.renderMathML(null, callback);
        },

        "renderMathML": function(mathMlWindow, postRenderCallback) {
            var arrMathJaxArgs = null,
                mathJaxHub = null;

            mathMlWindow = mathMlWindow || window;

            arrMathJaxArgs = new mathMlWindow.Array();
            mathJaxHub = mathMlWindow.MathJax.Hub;

            arrMathJaxArgs.push('Typeset');
            arrMathJaxArgs.push(mathJaxHub);
            mathJaxHub.Queue(arrMathJaxArgs);

            postRenderCallback = postRenderCallback || null;
            if (postRenderCallback) {
                mathJaxHub.Queue(postRenderCallback);
            }
        }

    });
})(window.MathUtilities);
