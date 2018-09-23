/* globals _, MathUtilities, $, window, InstallTrigger  */
(function() {
    'use strict';
    /**
     * A customized Backbone.View that encapsulates logic behind the presentation of display screen.
     * @module Calculator
     * @class Text box
     * @constructor
     * @extends Backbone.View
     * @namespace Tools.Calculator.Views
     */
    MathUtilities.Tools.Calculator.Views.Textbox = Backbone.View.extend({
        /**
         * Identifies if undo or redo is pressed
         * @property isUndoRedoKeyPress
         * @type boolean
         * @default false
         */
        "isUndoRedoKeyPress": false,
        /**
         * Identifies if registration to be done or not.
         * @property skipRegistration
         * @type boolean
         * @default false
         */
        "skipRegistration": false,
        /**
         * It is called when an object of this class is created.
         * @method initialize
         * @return
         */
        "initialize": function() {
            MathUtilities.Components.EquationEngine.Models.Productions.init();
            this.$('textarea').attr('tabindex', "-1"); //set tab index of Mathquill text area to 0.
            if (MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) {
                this.$('textarea').attr('readonly', true);
            }
        },
        /**
         * Destroys view object
         * @method destroy
         */
        "destroy": function() {
            this.remove();
        },
        /**
         * It is called to bind event to textarea.
         * @method bindEvents
         * @return
         */
        "bindEvents": function(eventType, eventData) {
            switch (eventType) {
                case 'vmkClickStart':
                    this.$el.on('vmkClickStart', {
                        "self": this
                    }, this._vmlButtonClicked);
                    break;
                case 'vmkClickEnd':
                    this.$el.on('vmkClickEnd', {
                        "self": this
                    }, this._vmkButtonClickEnd);
                    break;
                case 'keydown':
                    this.$el.on('keydown', eventData, this._keydownHandler);
                    break;
                case 'keypress':
                    this.$el.on('keypress', eventData, this._keyPress);
                    break;
                case 'keyup':
                    this.$el.on('keyup', eventData, this._keyUpHandler);
                    break;
                case 'paste':
                    this.$el.on('paste', eventData, this._pastepHandler);
                    break;
            }
        },
        "_vmlButtonClicked": function(event) {
            event.data.self.skipRegistration = true;
        },
        "_vmkButtonClickEnd": function(event) {
            event.data.self.skipRegistration = false;
        },
        /**
         * It is paste handler on input box.
         * @method _pastepHandler
         * @return
         */
        "_pastepHandler": function(event) {
            var pastedText,
                calculatorView = event.data.calculatorView,
                $answerDisplay = calculatorView.$('#answer-display');
            calculatorView.disableFD();
            calculatorView.manageInputBoxPosition(true);
            if (window.clipboardData && window.clipboardData.getData) {
                pastedText = window.clipboardData.getData('Text');
            } else if (event.originalEvent.clipboardData && event.originalEvent.clipboardData.getData) {
                pastedText = event.originalEvent.clipboardData.getData('Text');
            }
            pastedText.trim();
            if (pastedText.length === 0) {
                return;
            }
            $answerDisplay.hide();
            calculatorView.equaltoClicked = false;
            calculatorView.textboxView.$el.removeClass('equationSmallFont');
            $('#divider', this.$el).remove();
            calculatorView.manageDisplay(false);
            calculatorView.resetStoredResults();
        },
        /**
         * It is keydown handler on input box.
         * @method _keydownHandler
         * @param event {object} event object
         * @return
         */
        "_keydownHandler": function(event) {
            var calculatorView = event.data.calculatorView,
                inputOutputBox = calculatorView.$('#input-output-box')[0],
                inputEvaluationTriggerKeys = [13],
                BACKSPACE_KEY = 8,
                TAB_KEY = 9,
                $answerDisplay = calculatorView.$('#answer-display'),
                textboxView = calculatorView.textboxView,
                keyCode = event.keyCode || event.charCode || event.which,
                inputHolder, cursorElement, currentHeight, cursorTop, inputElementTop, curScrollTop, cursorHeight;
            //if tab key is pressed remove focus from text area
            if (keyCode === TAB_KEY) {
                if (event.shiftKey) { //If shift tab key is pressed
                    calculatorView.accManagerView.setFocus('title-text', 0);
                } else if ($answerDisplay.css('display') === 'block') {
                    calculatorView.accManagerView.setFocus('answer-display', 0);
                } else if (calculatorView.$('#scientific-panel').css('display') === 'block') {
                    calculatorView.accManagerView.setFocus('scientific-panel', 0);
                } else {
                    calculatorView.accManagerView.setFocus('standard-panel', 0);
                }
                return;
            }
            if (keyCode === BACKSPACE_KEY && event.eventSubType) {
                // return for backspace on temporary div
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            this.isUndoRedoKeyPress = false;
            if (inputEvaluationTriggerKeys.indexOf(keyCode) !== -1 && event.shiftKey === false) {
                calculatorView.$('[key=equal]').trigger('click');
                if (calculatorView.$('#answer-display').css('display') === 'block') {
                    calculatorView.accManagerView.setTabIndex('answer-display', 80);
                }
                return;
            }
            if (keyCode === BACKSPACE_KEY) {
                // handle backspace
                // disable FD
                calculatorView.disableFD();
                $answerDisplay.hide();
                if (textboxView.$('#divider').length > 0) {
                    textboxView.$('#divider').remove();
                }
                calculatorView.manageDisplay(false);
                textboxView.$el.removeClass('equationSmallFont');
                // invalidate stored results.
                calculatorView.resetStoredResults();
            } else if (event.ctrlKey && event.keyCode === 88) { // 88 is keyCode for X.
                // CTRL x
                $answerDisplay.hide();
                calculatorView.equaltoClicked = false;
                textboxView.$el.removeClass('equationSmallFont');
                textboxView.$('#divider').remove();
                calculatorView.manageDisplay(false);
                calculatorView.resetStoredResults();
            } else if (event.ctrlKey && event.keyCode === 89) { // 89 is keyCode for Y.
                this.isUndoRedoKeyPress = true;
                _.delay(function() {
                    textboxView.$('textarea').focus();
                }, 0);
            } else if (event.ctrlKey && event.keyCode === 90) { // 90 is keyCode for Z.
                //undo
                this.isUndoRedoKeyPress = true;
                _.delay(function() {
                    textboxView.$('textarea').focus();
                }, 0);
            } else if (event.keyCode === 191 || event.keyCode === 111) { // 191 and 111 are for `/` to handle divide
                calculatorView.manageInputBoxPosition(true);
            } else if (event.keyCode === 38 || event.keyCode === 40 || event.keyCode === 37 || event.keyCode === 39) { // key code for number pad arrows
                inputHolder = calculatorView.$('#input-output-box');
                cursorElement = textboxView.$('.cursor')[0];
                if (cursorElement) {
                    if (inputHolder.height() < inputHolder[0].scrollHeight) {
                        cursorTop = cursorElement.getBoundingClientRect().top;
                        inputElementTop = inputHolder[0].getBoundingClientRect().top;
                        // Threshold for ignoring scroll within difference of 8px
                        cursorHeight = textboxView.$('.cursor').parent().height();
                        curScrollTop = inputHolder.scrollTop();
                        // Check if cursor is hidden at top behind input element
                        if (inputElementTop > cursorTop && event.keyCode === 38) {
                            inputHolder.scrollTop(curScrollTop - cursorHeight);
                        }
                        if (inputElementTop < cursorTop && event.keyCode === 40) {
                            inputHolder.scrollTop(curScrollTop + cursorHeight);
                        }
                        if (inputElementTop > cursorTop && event.keyCode === 37) {
                            inputHolder.scrollTop(curScrollTop - cursorHeight);
                        }
                        if (inputElementTop > cursorTop && event.keyCode === 39) {
                            inputHolder.scrollTop(curScrollTop - cursorHeight);
                        }
                    }
                }
            }
            if (!(event.eventSubType || this._scrollTimer)) {
                // set interval is used to set scrollTop
                this._scrollTimer = setInterval(function() {
                    cursorElement = textboxView.$('.cursor');
                    currentHeight = cursorElement.length > 0 ? cursorElement.position().top : inputOutputBox.scrollHeight;
                    $(inputOutputBox).scrollTop(currentHeight);
                }, 0.0001); // Interval in milliseconds
            }
        },
        /**
         * It is keyPress handler on input box.
         * @method _keyPress
         * @param event {object} event object
         * @return
         */
        "_keyPress": function(event) {
            var operatorKeysKeyCode = [42, 43, 45, 47], //keycode 42:Print, 43: /, 45: v , 47: backspace
                inputEvaluationTriggerKeys = [13, 61], //Keycode 13:enter, 61: =
                isEqualtoPressed, expressionResult, isIE,
                keyCode = event.keyCode || event.charCode || event.which,
                calculatorView = event.data.calculatorView,
                textboxView = calculatorView.textboxView,
                $answerDisplay = calculatorView.$('#answer-display'),
                calculatorDisplayDomElement = textboxView.$el,
                TextboxView = calculatorView.viewNameSpace.Textbox,
                isTriggerCode = event.isTriggerCode; // check for input is trigger by keydown event but focus is not in mathquill
            // Disable FD button.
            calculatorView.disableFD();
            if (keyCode === 8 && event.eventSubType) {
                // return for backspace on temporary div
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (event.ctrlKey || event.charCode === 0) {
                return;
            }

            // Hide the result div, on key down.
            $answerDisplay.hide();
            textboxView.$el.removeClass('equationSmallFont');
            isEqualtoPressed = calculatorView.equaltoClicked;
            if (inputEvaluationTriggerKeys.indexOf(keyCode) !== -1) {
                event.preventDefault();
                calculatorView.$('[key=equal]').trigger('click');
                return;
            }
            textboxView.$('#divider').remove();
            calculatorView.manageDisplay(false);
            if (keyCode === 47) {
                // backspace
                calculatorView.manageInputBoxPosition(true);
            }
            if (isEqualtoPressed && textboxView.$('textarea').get(0) !== document.activeElement) {
                expressionResult = TextboxView.getText($answerDisplay);
                // do not operate on infinity or math error
                expressionResult = expressionResult === '\\text{-Infinity}' ||
                    expressionResult === '\\text{Infinity}' ||
                    expressionResult === '\\text{Math Error}' ? '' : expressionResult;
                isIE = document.documentMode;
                if (!isTriggerCode && operatorKeysKeyCode.indexOf(keyCode) !== -1) {
                    // operator key
                    if (expressionResult.match(/^text\{Math Error}/)) { //error present
                        TextboxView.clearText(calculatorDisplayDomElement);
                    } else {
                        TextboxView.setText(expressionResult, calculatorDisplayDomElement, 'latex');
                    }
                } else if (keyCode !== 0) {
                    // any input key
                    if (expressionResult.match(/^text\{Math Error}/)) { //error present
                        TextboxView.clearText(calculatorDisplayDomElement);
                    } else {
                        textboxView.$('textarea').focus();
                        TextboxView.clearText(calculatorDisplayDomElement);
                        TextboxView.clearText($answerDisplay);
                        if (isTriggerCode) {
                            //set text if keyPress is trigger on element other than mathquill
                            textboxView.$('textarea').val(String.fromCharCode(keyCode));
                        }
                    }
                }
                calculatorView.equaltoClicked = false;
                if (isIE !== void 0) {
                    calculatorView._triggerKeyDown(calculatorView.textboxView.$('textarea'), keyCode);
                    _.delay(function() {
                        calculatorView.textboxView.$('textarea').focus();
                    }, 0);
                }
            }
            calculatorView.resetStoredResults();
        },
        /**
         * It is keyUpHandler handler on input box.
         * @method _keyUpHandler
         * @param event {object} event object
         * @return
         */
        "_keyUpHandler": function(event) {
            var bRecordScreenState,
                cursorElement, cursorHeight,
                calculatorView = event.data.calculatorView,
                textboxView = calculatorView.textboxView,
                newScreenState = calculatorView.viewNameSpace.Textbox.getText(textboxView.$el),
                oldScreenState = calculatorView.model.get('currentScreenState'),
                inputOutputBox = calculatorView.$('#input-output-box')[0],
                keysToSkip = [17], // keyCode for CTRL
                $answerDisplay = calculatorView.$('#answer-display');
            if (!$answerDisplay.is(':visible')) {
                calculatorView.manageDisplay(false);
            }
            clearInterval(this._scrollTimer);
            this._scrollTimer = null;
            if (newScreenState !== oldScreenState) {
                cursorElement = textboxView.$('.cursor').eq(0);
                if (cursorElement.length) {
                    cursorHeight = cursorElement.position().top;
                    inputOutputBox.scrollTop = cursorHeight;
                }
            }
            bRecordScreenState = keysToSkip.indexOf(event.keyCode) !== -1;
            bRecordScreenState = bRecordScreenState && this.isUndoRedoKeyPress;
            if (!this.isUndoRedoKeyPress && keysToSkip.indexOf(event.keyCode) === -1 && !textboxView.skipRegistration) {
                calculatorView._recordNewScreenState(newScreenState);
            }
            this.isUndoRedoKeyPress = false;
            calculatorView.manageInputBoxPosition(false);
        }
    }, {
        /**
         * Sets the latex string into Mathquill text-box.
         * @method setText
         * @static
         * @param {String} data. Latex String.
         * @param {Object} calculatorDisplayElement. jQuery object of calculator display element.
         * @param {String} writeCommand Mathquill command to render text
         * @return
         */
        "setText": function(data, calculatorDisplayElement, writeCommand) {
            writeCommand = writeCommand || 'write';
            if (calculatorDisplayElement[0].id === 'answer-display') {
                calculatorDisplayElement.mathquill('revert').mathquill();
            }
            calculatorDisplayElement.mathquill(writeCommand, data).focus()
                .find('textarea').focus();
        },
        /**
         * Gets the latex string from Mathquill text-box.
         * @method getText
         * @static
         * @param {Object} calculatorDisplayElement. jQuery object of calculator display element.
         * @return {String} Returns latex form of the content in calculator display.
         */
        "getText": function(calculatorDisplayElement) {
            return calculatorDisplayElement.mathquill('latex');
        },
        /**
         * Clears the Mathquill text-box.
         * @method clearText
         * @static
         * @param {Object} calculatorDisplayElement. jQuery object of calculator display element.
         * @return
         */
        "clearText": function(calculatorDisplayElement) {
            calculatorDisplayElement.mathquill('write', '').mathquill('latex', '');
            if (calculatorDisplayElement[0].id === 'answer-display') {
                calculatorDisplayElement.mathquill('revert').mathquill();
            }
        }
    });
})();
