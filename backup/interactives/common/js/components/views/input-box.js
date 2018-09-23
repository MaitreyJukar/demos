(function () {
    'use strict';
    /**
    * View for InputBox
    * @class InputBox
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.InputBox = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * idPrefix of interactive
        * @property idPrefix
        * @type Object
        * @defaults null
        */
        idPrefix: null,

        /**
        * manager of interactive
        * @property manager
        * @type Object
        * @defaults null
        */
        manager: null,

        /**
        * filePath of interactive
        * @property filePath
        * @type Object
        * @defaults null
        */
        filePath: null,

        /**
        * player of interactive
        * @property player
        * @type Object
        * @defaults null
        */
        player: null,

        /**
        * jquery element of input box
        * @property inputEle
        * @type Object
        * @defaults null
        */
        inputEle: null,

        /**
        * type of input
        * @property inputType
        * @type string
        * @defaults null
        */
        inputType: null,

        maxValue: null,

        /**
        * precision of the input on case of float numbers
        * @property precision
        * @type number
        * @defaults null
        */
        precision: null,

        /**
        * default value when empty
        * @property player
        * @type string
        * @defaults null
        */
        defaultValue: null,

        /**
        * max number of characters allowed
        * @property maxCharLength
        * @type number
        * @defaults null
        */
        maxCharLength: null,

        /**
        * key code of characters to be allowed
        * @property keyCodeArray
        * @type number
        * @defaults null
        */
        keyCodeArray: null,

        /**
        * regex string for custom type
        * @property regexString
        * @type string
        * @defaults null
        */
        regexString: null,

        /**
        * allow negative input for integer and float
        * @property allowNegative
        * @type boolean
        * @defaults null
        */
        allowNegative: null,

        /**
        * String after every key down
        * @property resultantString
        * @type string
        * @defaults null
        */
        resultantString: null,

        /**
        * true if resultant string is valid
        * @property isValidInput
        * @type boolean
        * @defaults null
        */
        isValidInput: null,

        /**
        * container id of the ele
        * @property containerId
        * @type string
        * @defaults null
        */
        containerId: null,

        /**
        * case when keypress is not triggerd (for shift)
        * @property keyDownCase
        * @type boolean
        * @defaults null
        */
        keyDownCase: false,


        /**
        * case when input box is blurred with empty string
        * @property defaultTextOnEmptyInputBox
        * @type string
        * @defaults null
        */
        defaultTextOnEmptyInputBox: null,

        isMaxValueExceeded: false,

        /**
        * custom class to be added to input box
        */
        _customClass: null,

        enterFiredOnInputParent: false,

        /**
        * boolean if device is android
        * @property isTouchDevice
        * @type boolean
        * @default false
        */
        isTouchDevice: false,

        /**
        * Calls render
        * @method initialize
        **/
        initialize: function () {
            var browerCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
            this.isTouchDevice = browerCheck.isMobile;
            this.idPrefix = this.model.get('idPrefix');
            this.manager = this.model.get('manager');
            this.filePath = this.model.get('path');
            this.player = this.model.get('player');
            this.inputType = this.model.get('inputType');
            this.maxValue = this.model.getMaxValue();
            this.maxCharLength = this.model.get('maxCharLength');
            this.precision = this.model.get('precision');
            this.defaultValue = this.model.get('defaultValue');
            this.keyCodeArray = this.model.get('keyCodeArray');
            this.regex = this.model.get('regexString');
            this.allowNegative = this.model.get('allowNegative');
            this.regexString = this.model.get('regexString');
            this.containerId = this.model.get('containerId');
            this.defaultTextOnEmptyInputBox = this.model.getDefaultTextOnEmptyInputBox();
            this._customClass = this.model.getCustomClass();

            this._addJqueryFunction();
            this._addStringFunction();
            this._render();
            this._bindEvents();

            this.model.setRegexForCurrentType();
            this.staticDataHolder = MathInteractives.global.InputBox;
        },

        /**
        * Renders the inputbox component
        * @method render
        **/
        _render: function () {

            this.inputEle = $('<input></input>');

            this.inputEle.attr('id', this.containerId + '-input-box');
            if (this.model.getDefaultTabIndexToInputBox() && this.isAccessible()) {
                this.inputEle.removeAttr('tabindex');
            }
            this._addCustomClass();
            this.inputEle.addClass('input-box-common-component');
            this.inputEle.val(this.defaultValue);
            this.$el.html(this.inputEle);

        },

        /**
        * enables the input box
        * @method enableInputBox
        **/
        enableInputBox: function () {

            var idselector = '#' + this.containerId + '-input-box',
                manager = this.manager;

            this.inputEle.removeAttr('disabled');

        },

        /**
        * disables the input box
        * @method disableInputBox
        **/
        disableInputBox: function () {

            this.inputEle.attr('disabled', 'disabled');
        },

        /**
        * hides the input box
        * @method hideInputBox
        **/
        hideInputBox: function () {

            this.inputEle.hide();

        },

        /**
        * shows the input box
        * @method showInputBox
        **/
        showInputBox: function () {

            this.inputEle.show();
        },

        /**
        * clears the input box
        * @method clearInputBox
        **/
        clearInputBox: function () {

            this.inputEle.val('');
            this.model.setPreviousValue('');
        },

        /**
        * set tab index to input box on key down and key up to its parent
        * @method _enableInputTab
        **/
        _enableInputTab: function (isEnable) {
            if (this.manager.model.get('isAccessible') !== true) {
                return;
            }
            var self = this,
                $el = this.$el,
                startTabindex = this.player.model.get('startTabindex'),
                idselector = '#' + this.containerId + '-input-box',
                currentInputBox = $el.find(idselector),
                parentId = self.containerId.split(self.idPrefix)[1],
                tabIndex = self.getTabIndex(parentId);
            if (isEnable === true) {
                self.enableTab(parentId, false);
                currentInputBox.attr('tabindex', startTabindex + tabIndex);
            }
            else {
                self.enableTab(parentId, true);
                currentInputBox.removeAttr('tabindex', -1);
            }
        },
        /**
        * bind the events
        * @method _bindEvents
        **/
        _bindEvents: function () {

            var idselector = '#' + this.containerId + '-input-box',
                events = {},
                self = this,
                eventType = null,
                $el = this.$el,
                currentInputBox = $el.find(idselector),
                manager = this.manager,
                keyCode = null,
                staticDataHolder = MathInteractives.Common.Components.Views.InputBox,
                currentTouchDeviceInputBoxValue = null,
                inputBoxContainerId = self.containerId,
                defaultTextOnEmptyInputBox = self.defaultTextOnEmptyInputBox;
            /*events['keypress ' + idselector] = function (e) {

            }

            events['keyup ' + idselector] = function (e) {
            self.trigger('input-box-keyup', [this.isValidInput, this.resultantString]);
            }*/
            $el.off('click').on('click', function (event) {

                if (currentInputBox.attr('disabled') !== 'disabled') {
                    //self._enableInputTab(true);
                    currentInputBox.focus();
                }

            });

            $el.off('keydown').on('keydown', function (event) {
                keyCode = event.keyCode;

                if (keyCode === 32 && currentInputBox.attr('disabled') !== 'disabled') {
                    self._enableInputTab(true);
                    currentInputBox.focus();
                    event.stopPropagation();
                }
                else {
                    if (keyCode === 13) {
                        self.enterFiredOnInputParent = true;
                    }
                }

            });

            currentInputBox.on('focus.input-box-focus', function (event) {
                if (currentInputBox.attr('disabled') !== 'disabled' && currentInputBox.hasClass('focused') === false) {
                    self._isValidated = false;
                    self.model.setAndroidDevicePreviousValue(currentInputBox.val());
                }
            });

            currentInputBox.off('blur').on('blur', function (event) {
                var inputBoxString = currentInputBox.val() || null;

                if (inputBoxString === null) {
                    inputBoxString = defaultTextOnEmptyInputBox;
                }
                self._enableInputTab(false);
                self.trigger(staticDataHolder.INPUT_TYPE_BLUR_EVENT, inputBoxString, event, self.isValidInput);

            });

            this.$el.find(idselector).off('keydown').on('keydown', function (e) {
                self.enterFiredOnInputParent = false;
                e = (e) ? e : window.event;
                var charCode = (e.keyCode) ? e.keyCode : e.which;
                if (charCode === staticDataHolder.CHAR_CODE_ENUM.SINGLEQUOTE) {
                    self.keyDownCase = true;
                    return false;
                } else {
                    self.keyDownCase = false;
                }

                if (charCode === staticDataHolder.CHAR_CODE_ENUM.BACKSPACE || charCode === staticDataHolder.CHAR_CODE_ENUM.DELETE) {
                    return self._checkForValidInput(e);
                }
            });

            currentInputBox.off('paste').on('paste', function (e) {
                var clipboarddata = e.originalEvent.clipboardData,
                   inputVal = '',
                   selectionStart = currentInputBox.prop('selectionStart') || null,
               selectionEnd = currentInputBox.prop('selectionEnd') || null;
                if (typeof clipboarddata !== 'undefined') {
                    clipboarddata = clipboarddata.getData('text/plain');
                    inputVal = currentInputBox.val().inputBoxCommonComponentInsert(selectionStart, selectionEnd, clipboarddata);
                }
                // Prevent paste in Android devices, unable to get clipboard data
                // To Do: Reasearch on getting clipboard data in android
                if (self._checkForValidInput(e, inputVal) === false || MathInteractives.Common.Utilities.Models.BrowserCheck.isAndroid) {
                    e.preventDefault();
                }
                else {                    
                        self.trigger(inputBoxContainerId + staticDataHolder.CUSTOM_CHANGE_EVENT_NAME, e, self.charCode, self.isValidInput, self.model.getPreviousValue());                    
                }
            });

            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isAndroid) {

                self.enterFiredOnInputParent = false;
                currentInputBox.off('keydown').on('keydown', function (e) {
                    //self.model.setPreviousValue(currentInputBox.val());
                    self._setValuesOnKeyDown(e);
                });
            }
            else {
                currentInputBox.off('keypress').on('keypress', function (e) {
                    if (self.isTouchDevice === true) {
                        return true;
                    }
                    self.enterFiredOnInputParent = false;
                    //self._isValidated = true;
                    //return self._keyPressEventHandle(e);
                });
            }

            this.$el.find(idselector).off('keyup').on('keyup', function (e) {
                var staticDataHolder = MathInteractives.Common.Components.Views.InputBox,
                        inputVal = currentInputBox.val();
                e = (e) ? e : window.event;
                var charCode = (e.keyCode) ? e.keyCode : e.which;

                if (!self.isTouchDevice) {
                    if (charCode === staticDataHolder.CHAR_CODE_ENUM.BACKSPACE) {
                        self.isValidInput = true;
                    }
                    if (!self.enterFiredOnInputParent) {

                        self.trigger(self.containerId + staticDataHolder.KEYUP_EVENT_NAME, e, charCode, self.isValidInput, self.resultantString);
                    }
                    if (charCode == staticDataHolder.CHAR_CODE_ENUM.ENTER) {
                        self.trigger(self.containerId + staticDataHolder.ENTER_PRESS_EVENT_NAME, e, charCode, self.isValidInput, self.resultantString);
                    }
                    if (self.maxValue !== null && Number(inputVal) > self.maxValue) {
                        self.trigger(self.containerId + staticDataHolder.GREATER_VALUE_ENTERED);
                        currentInputBox.val(self.model.getMaxValue());
                        inputVal = currentInputBox.val();
                    }
                    //if (Number(self.model.getPreviousValue()) !== Number(inputVal)) { // commented out cause Number('') = 0
                    if (self.model.getPreviousValue() !== inputVal) {
                        self.trigger(self.containerId + staticDataHolder.CUSTOM_CHANGE_EVENT_NAME, e, self.charCode, self.isValidInput, self.model.getPreviousValue());
                    }
                    self.model.setPreviousValue(inputVal);
                    return self._keyPressEventHandle(e);
                }
                else {
                    currentTouchDeviceInputBoxValue = self.model.getAndroidDevicePreviousValue();
                    if (self.maxValue !== null && Number(currentTouchDeviceInputBoxValue) > self.maxValue) {
                        self.trigger(self.containerId + staticDataHolder.GREATER_VALUE_ENTERED);
                        currentInputBox.val(self.model.getMaxValue());
                        currentTouchDeviceInputBoxValue = currentInputBox.val();
                    }
                    self.model.setAndroidDevicePreviousValue(currentTouchDeviceInputBoxValue);
                    //self._checkForSpecialCharInAndroid(e, 'keyup');
                    self.trigger(staticDataHolder.ANDROID_KEYUP_EVENT, e, currentTouchDeviceInputBoxValue);
                    self.trigger(inputBoxContainerId + staticDataHolder.KEYUP_EVENT_NAME, e, charCode, self.isValidInput, currentTouchDeviceInputBoxValue);
                    if (charCode == staticDataHolder.CHAR_CODE_ENUM.ENTER) {
                        self.trigger(inputBoxContainerId + staticDataHolder.ENTER_PRESS_EVENT_NAME, e, charCode, self.isValidInput, currentTouchDeviceInputBoxValue);
                    }
                }
            });

            this.$el.find(idselector).off('input').on('input', function (event) {
                event = (event) ? event : window.event;
                var charCode = (event.keyCode) ? event.keyCode : event.which,
				    $target = $(event.target),
				    maxLengthString,
				    currentLength;
                eventType = 'input';
                if (self._isValidated !== true) {

                    self.resultantString = currentInputBox.val().toString();
                    self._checkForSpecialCharInAndroid(event, eventType);
                }
                currentLength = currentInputBox.val().length;
                if (self.allowNegative && self.resultantString.indexOf('-') === 0) {
                    currentLength -= 1;
                }
                if (currentLength <= self.maxCharLength) {
                    self.trigger(self.containerId + staticDataHolder.INPUT_EVENT_NAME, event, charCode, self.isValidInput, self.resultantString);
                } else {
                    // To prevent exceeding max char length by swipe typing
                    maxLengthString = currentInputBox.val().substring(0, self.maxCharLength);
                    // check if the input is valid
                    if (self._checkForValidInput(event, maxLengthString) === true) {
                        currentInputBox.val(maxLengthString);
                        self.trigger(self.containerId + staticDataHolder.INPUT_EVENT_NAME, event, charCode, self.isValidInput, self.resultantString);
                    }
                    event.preventDefault();
                }
            });
        },

        /**
        * add function to jquery to reduce callstack
        * get the current cursor position
        * @method _addJqueryFunction
        **/
        _addJqueryFunction: function () {

            if (!$.fn.inputBoxCommonComponenetgetCursorPosition) {
                $.fn.inputBoxCommonComponenetgetCursorPosition = function () {
                    var input = this.get(0);
                    if (!input) return;
                    if ('selectionStart' in input) {
                        return input.selectionStart;
                    } else if (document.selection) {
                        input.focus();
                        var sel = document.selection.createRange();
                        var selLen = document.selection.createRange().text.length;
                        sel.moveStart('character', -input.value.length);
                        return sel.text.length - selLen;
                    }
                }
            }
        },

        /**
        * add function to String class to reduce callstack
        * insert string at given index
        * @method _addJqueryFunction
        **/
        _addStringFunction: function () {
            if (!String.prototype.inputBoxCommonComponentInsert) {
                String.prototype.inputBoxCommonComponentInsert = function (indexStart, indexEnd, string) {
                    return this.substring(0, indexStart) + string + this.substring(indexEnd, this.length);
                };
            }

            if (!String.prototype.inputBoxCommonComponentDelete) {
                String.prototype.inputBoxCommonComponentDelete = function (indexStart, indexEnd, isDelKey) {
                    if (indexStart !== indexEnd) {
                        return this.substring(0, indexStart) + this.substring(indexEnd, this.length);
                    }
                    else {
                        if (!isDelKey) {
                            return this.substring(0, indexStart - 1) + this.substring(indexEnd, this.length);
                        }
                        else {
                            return this.substring(0, indexStart) + this.substring(indexEnd + 1, this.length);
                        }
                    }
                };
            }
        },

        /**
        * check for special chars in input box for android devices

        * @method _checkForSpecialCharInAndroid
        * @param event {object} current input event object
        * @param eventType {object} type of event
        * @private
        **/
        _checkForSpecialCharInAndroid: function (event, eventType) {

            var self = this,
                staticData = this.staticData,
                staticDataHolder = this.staticDataHolder,
                inputType = self.inputType,
                model = self.model,
                $currentTarget = $(event.target),
                currentVal = $currentTarget.val(),
             
                androidDevicePreviousValue = model.getAndroidDevicePreviousValue() || '',
                regexExp = new RegExp(model.getCurrentRegex());

            if (regexExp.test(currentVal) && currentVal.length <= self.maxCharLength) {
                model.setAndroidDevicePreviousValue(currentVal);
                self.isValidInput = true;
                if (currentVal !== androidDevicePreviousValue) {
                    self.trigger(self.containerId + staticDataHolder.CUSTOM_CHANGE_EVENT_NAME, event, self.charCode, self.isValidInput, androidDevicePreviousValue);
                }

                return true;
            }
            else {
                /*if (eventType === 'keyup') {*/
                    self.isValidInput = false;
                    $currentTarget.val(androidDevicePreviousValue);
                    return false
                /*}*/
            }
           
        },

        /**
        * handler for keypress event
        * @method _keyPressEventHandle
        **/
        _keyPressEventHandle: function (evt) {
            var $targetElement = $(evt.target),
                selectionStart = $targetElement.prop('selectionStart') || null,
                selectionEnd = $targetElement.prop('selectionEnd') || null,
                idselector = '#' + this.containerId + '-input-box',
                currentInputBox = this.$el.find(idselector),
                checkBrowser = MathInteractives.Common.Utilities.Models.BrowserCheck,
                regExpIos = new RegExp(/[$%(&]/);

            if (checkBrowser.isFirefox) {
                if (this._checkSpecialKeys(evt)) {
                    return true;
                }
            }

            if (this.keyDownCase) {
                this.isValidInput = false;
                return this.isValidInput;
            }

            var inputType = this.inputType,
                staticDataHolder = MathInteractives.Common.Components.Views.InputBox,
                isValid = null;

            var val = this.inputEle.val(),
                pos = $(this.inputEle).inputBoxCommonComponenetgetCursorPosition(),
                evt = (evt) ? evt : window.event,
                charCode = (evt.keyCode) ? evt.keyCode : evt.which;

            this.charCode = charCode;

            isValid = this._checkForValidInput(evt);

            var currentLength = this.resultantString.length;

            if (this.allowNegative && this.resultantString.indexOf('-') === 0) {
                currentLength -= 1;
            }

            currentLength = currentLength - (selectionEnd - selectionStart);

            if ((currentLength > this.maxCharLength)) {
                //IOS handle for %&(' characters
                if (regExpIos.test(this.resultantString)) {//input box accept special char in ios input  box, it is a fox for it
                    return false;
                }

                if ((charCode == staticDataHolder.CHAR_CODE_ENUM.BACKSPACE || charCode == staticDataHolder.CHAR_CODE_ENUM.ENTER || charCode == staticDataHolder.CHAR_CODE_ENUM.LEFTARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.TOPARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.RIGHTARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.BOTTOMARROW) && !evt.shiftKey) {
                    this.isValidInput = true;
                } else {
                    this.isValidInput = false;
                }
            } else {
                this.isValidInput = isValid;
            }
            this.trigger(this.containerId + staticDataHolder.KEYPRESS_EVENT_NAME, evt, this.charCode, this.isValidInput, this.resultantString);
            return this.isValidInput;
        },

        _checkForValidInput: function (evt, input) {
            var inputType = this.inputType,
                staticDataHolder = MathInteractives.Common.Components.Views.InputBox,
                isValid = null;

            var val = this.inputEle.val(),
                evt = (evt) ? evt : window.event,
                evtType = evt.type,
                inputString = null,
                $currentTarget = $(evt.target),
                selectionStart = $currentTarget.prop('selectionStart'),
                selectionEnd = $currentTarget.prop('selectionEnd'),
                charCode = (evt.keyCode) ? evt.keyCode : evt.which;
            if (input && input.trim() !== '') {
                inputString = input;
            }
            else {
                if (evtType === 'keydown') {
                    if (charCode === staticDataHolder.CHAR_CODE_ENUM.DELETE) {
                        inputString = val.inputBoxCommonComponentDelete(selectionStart, selectionEnd, true);
                    }
                    else {
                        inputString = val.inputBoxCommonComponentDelete(selectionStart, selectionEnd, false);
                    }
                }
                else {
                    inputString = val.inputBoxCommonComponentInsert(selectionStart, selectionEnd, String.fromCharCode(charCode));
                }
            }


            switch (inputType) {
                case staticDataHolder.INPUT_TYPE_INTEGER:
                    {

                        isValid = this._isValidInteger(val, evt, charCode, inputString);
                        break;
                    }

                case staticDataHolder.INPUT_TYPE_FLOATING:
                    {
                        isValid = this._isValidFloat(val, evt, charCode, inputString);
                        break;
                    }

                case staticDataHolder.INPUT_TYPE_ALPHANUMERIC:
                    {
                        isValid = this._isValidAlphanumeric(val, evt, charCode, inputString);
                        break;
                    }

                case staticDataHolder.INPUT_TYPE_CURRENCY:
                    {
                        isValid = this._isValidCurrency(val, evt, charCode, inputString);
                        break;
                    }

                case staticDataHolder.INPUT_TYPE_CUSTOM:
                    {
                        isValid = this._isValidCustom(val, evt, charCode, inputString);
                        break;
                    }               
            }

            return isValid;
        },


        /**
        * check for direction keys and special keys
        * @method _checkSpecialKeys
        **/
        _checkSpecialKeys: function (evt) {
            var charCode = evt.keyCode,
                staticDataHolder = MathInteractives.Common.Components.Views.InputBox;

            if ((charCode == staticDataHolder.CHAR_CODE_ENUM.BACKSPACE || charCode == staticDataHolder.CHAR_CODE_ENUM.TAB || charCode == staticDataHolder.CHAR_CODE_ENUM.DELETE || charCode == staticDataHolder.CHAR_CODE_ENUM.LEFTARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.TOPARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.RIGHTARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.BOTTOMARROW)) {
                return true;
            }

            return false;
        },

        /**
        * check for integer validation
        * @method _isValidInteger
        * @param val {Number} entered number
        * @param evt {Object} event object
        * @param charCode {Number} charCode of the entered value
        * @param inputString {String} string to be validated
        * @return result {Number} if integer is valid
        * @private
        **/
        _isValidInteger: function (val, evt, charCode, inputString) {

            var regexExp = new RegExp(/^\-{0,1}\d*$/),
                regExpIos = new RegExp(/[$%(&]/),
                $currentTarget = $(evt.target),
                selectionStart = $currentTarget.prop('selectionStart'),
                selectionEnd = $currentTarget.prop('selectionEnd'),
                result = regexExp.test(inputString),
                staticDataHolder = MathInteractives.Common.Components.Views.InputBox,
                charKeyCode = evt.keyCode;

            this.resultantString = inputString;

            if (this.keyCodeArray.indexOf(charCode) >= 0) {
                return true;
            }

            if (evt.shiftKey) {
                return false;
            }

            if (regExpIos.test(inputString)) {//input box accept special char in ios input  box, it is a fox for it
                return false;
            }

            if (charCode === staticDataHolder.CHAR_CODE_ENUM.SINGLEQUOTE) {
                return false;
            }
            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isFirefox) {
                //if (inputString.indexOf('.') > -1 && charKeyCode === 0) {
                //    return false;
                //}
                if (charKeyCode === staticDataHolder.CHAR_CODE_ENUM.DELETE) {
                    return true;
                }
            }
            if (charCode == staticDataHolder.CHAR_CODE_ENUM.BACKSPACE || charCode == staticDataHolder.CHAR_CODE_ENUM.ENTER || charCode == staticDataHolder.CHAR_CODE_ENUM.LEFTARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.TOPARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.RIGHTARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.BOTTOMARROW) {
                return true;
            }

            if (inputString.substring(selectionStart + 1, selectionEnd + 1).indexOf('-') !== -1 && charKeyCode >= 48 && charKeyCode <= 57) {
                return true;
            }

            // on selection of entire value of input box and then minus keypress event handle
            if (this.allowNegative && (selectionEnd - selectionStart) === val.length && charCode === staticDataHolder.CHAR_CODE_ENUM.MINUS_KEY_KEYCODE) {
                return true
            }

            if (!result) {

                if (this.allowNegative) {

                    $currentTarget.val(val.replace(/[^-0-9]/g, ''));
                }
                else {

                    $currentTarget.val(val.replace(/[^0-9]/g, ''));

                }
            }

            if (this.allowNegative) {
                return result;
            } else {
                if (inputString.indexOf('-') >= 0) {
                    $currentTarget.val(val.replace(/[^0-9]/g, ''));
                    return false;
                } else {
                    return result;
                }

            }
        },

        /**
        * check for float validation
        * @method _isValidFloat
        * @param val {Number} entered number
        * @param evt {Object} event object
        * @param charCode {Number} charCode of the entered value
        * @param inputString {String} string to be validated
        * @return result {Number} if float is valid
        * @private
        **/
        _isValidFloat: function (val, evt, charCode, inputString) {

            var precision = this.precision,
                $currentTarget = $(evt.target),
                $currentTargetValue = $currentTarget.val(),
                selectionStart = $currentTarget.prop('selectionStart'),
                selectionEnd = $currentTarget.prop('selectionEnd'),
                regexExp = new RegExp('^\\-{0,1}\\d*(?:\\.\\d{0,' + precision + '})?$'),
                regExpIos = new RegExp(/[$%(&]/),
                result = regexExp.test(inputString),
                staticDataHolder = MathInteractives.Common.Components.Views.InputBox,
                modelObject = this.model,
                charKeyCode = evt.keyCode,
                maxCharLength = this.maxCharLength,
                lastInputValue = modelObject.getLastInputValue() || null,
                allowNegative = this.allowNegative;

            this.resultantString = inputString;

            if (this.keyCodeArray.indexOf(charCode) >= 0) {
                return true;
            }

            if (evt.shiftKey) {
                return false;
            }

            if (charCode === staticDataHolder.CHAR_CODE_ENUM.SINGLEQUOTE) {
                return false;
            }

            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isIOS) {
                if (regExpIos.test(inputString)) {//input box accept special char in ios input  box, it is a fox for it
                    return false;
                }
            }

            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isFirefox) {
                if (charKeyCode === staticDataHolder.CHAR_CODE_ENUM.DELETE) {
                    return true;
                }
            }
            if (charCode == staticDataHolder.CHAR_CODE_ENUM.BACKSPACE || charCode == staticDataHolder.CHAR_CODE_ENUM.ENTER || charCode == staticDataHolder.CHAR_CODE_ENUM.LEFTARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.TOPARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.RIGHTARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.BOTTOMARROW) {
                return true;
            }

            if (inputString.substring(selectionStart + 1, selectionEnd + 1).indexOf('-') !== -1 && ((charKeyCode >= 48 && charKeyCode <= 57) || charKeyCode === 110 || charCode === 45)) {
                if (allowNegative === true && charCode === 45) {
                    return true;
                } else {
                    if (allowNegative === false) {
                        return true;
                    }

                }
            }

            if (inputString.substring(selectionStart + 1, selectionEnd + 1).indexOf('-') !== -1 && charKeyCode >= 48 && charKeyCode <= 57) {
                return true;
            }

            if (!result) {


                if (val.length <= maxCharLength && val.split('.').length < 3) {
                    if (allowNegative) {

                        $currentTarget.val(val.replace(/[^-0-9.]/g, ''));
                    }
                    else {
                        $currentTarget.val(val.replace(/[^0-9.]/g, ''));
                    }
                }
                else {

                    if ($currentTargetValue === null) {
                        $currentTargetValue = '';
                    }
                    $currentTarget.val($currentTargetValue);
                }
            }

            modelObject.setLastInputValue($currentTarget.val());
            if (allowNegative) {
                return result;
            }
            else {

                if (inputString.indexOf('-') >= 0) {
                    if (val.length <= maxCharLength && val.split('.').length < 3) {
                        if (allowNegative) {

                            $currentTarget.val(val.replace(/[^-0-9.]/g, ''));
                        }
                        else {
                            $currentTarget.val(val.replace(/[^0-9.]/g, ''));
                        }
                    }
                    else {

                        if ($currentTargetValue === null) {
                            $currentTargetValue = '';
                        }
                        $currentTarget.val($currentTargetValue);

                    }
                    modelObject.setLastInputValue($currentTarget.val());
                    return false;
                } else {
                    return result;
                }

            }

        },

        /**
        * check for alphanumeric validation
        * @method _isValidAlphanumeric
        * @param val {Number} entered number
        * @param evt {Object} event object
        * @param charCode {Number} charCode of the entered value
        * @param inputString {String} string to be validated
        * @return result {Number} if result is valid
        * @private
        **/
        _isValidAlphanumeric: function (val, evt, charCode, inputString) {
            var staticDataHolder = MathInteractives.Common.Components.Views.InputBox;
            var regexExp = new RegExp(/^\w*$/),
                result = regexExp.test(inputString);

            if (this.keyCodeArray.indexOf(charCode) >= 0) {
                return true;
            }

            if (charCode == staticDataHolder.CHAR_CODE_ENUM.BACKSPACE || charCode == staticDataHolder.CHAR_CODE_ENUM.ENTER || charCode == staticDataHolder.CHAR_CODE_ENUM.LEFTARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.TOPARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.RIGHTARROW || charCode == staticDataHolder.CHAR_CODE_ENUM.BOTTOMARROW) {
                return true;
            }

            this.resultantString = inputString;
            return result;
        },

        /**
        * check for currency validation
        * @method _isValidCurrency
        * @param val {Number} entered number
        * @param evt {Object} event object
        * @param charCode {Number} charCode of the entered value
        * @param inputString {String} string to be validated
        * @return result {Number} if result is valid
        * @private
        **/
        _isValidCurrency: function (val, evt, charCode, inputString) {
            var regexExp = new RegExp(/^-?(?:0|[1-9]\d{0,2}(?:,?\d{3})*)(?:\.\d+)?$/),
                $currentTarget = $(evt.target),
                selectionStart = $currentTarget.prop('selectionStart'),
                selectionEnd = $currentTarget.prop('selectionEnd'),
                result = regexExp.test(inputString),
                charKeyCode = evt.keyCode;


            if (inputString.substring(selectionStart + 1, selectionEnd + 1).indexOf('-') !== -1 && ((charKeyCode >= 48 && charKeyCode <= 57) || charKeyCode === 188)) {
                return true;
            }
            if (!result) {
                if (this.allowNegative) {
                    $currentTarget.val(val.replace(/[^-0-9.]/g, ''));
                }
                else {
                    $currentTarget.val(val.replace(/[^0-9.]/g, ''));
                }
            }
            this.resultantString = inputString;
            return result;
        },

        /**
        * check for valid custom type
        * @method _isValidCustom
        * @param val {Number} entered number
        * @param evt {Object} event object
        * @param charCode {Number} charCode of the entered value
        * @param inputString {String} string to be validated
        * @return result {Number} if result is valid
        * @private
        **/
        _isValidCustom: function (val, evt, charCode, inputString) {
            var $currentTarget = $(evt.target),
                currentVal = $currentTarget.val(),
                selectionStart = $currentTarget.prop('selectionStart'),
                selectionEnd = $currentTarget.prop('selectionEnd'),
                currentTargetValLength = currentVal.length,
                regexExp = new RegExp(this.regexString),
                currChar = String.fromCharCode(charCode),
                result;

            if (this.keyCodeArray.indexOf(charCode) >= 0) {
                return true;
            }

            if (currentTargetValLength - (selectionEnd - selectionStart) === 0 && currentTargetValLength !== 0) {

                result = regexExp.test(currChar);
                if (result) {

                    this.resultantString = currChar;
                    return result;
                }
            }

            result = regexExp.test(inputString);

            this.resultantString = inputString;
            return result;
        },

        /**
        * sets values on key down
        * @method _setValuesOnKeyDown
        * @param event {Object} event object
        * @private
        **/
        _setValuesOnKeyDown: function (event) {

            this.charCode = event.charCode || event.which;
            this.trigger(this.staticDataHolder.ANDROID_KEYDOWN_EVENT, event);

        },

        /**
        * add custom class to the input box
        */
        _addCustomClass: function () {
            if (this._customClass !== null && this.inputEle !== null) {
                this.inputEle.addClass(this._customClass);
            }
        },
        /**
        * returns value of current input box
        */
        getCurrentInputValue: function () {
            return this.$el.find('input').val() || null;
        }

    }, {

        INPUT_TYPE_BLUR_EVENT: 'input-blur',

        CHAR_CODE_ENUM: {
            BACKSPACE: 8,
            ENTER: 13,
            LEFTARROW: 37,
            TOPARROW: 38,
            RIGHTARROW: 39,
            BOTTOMARROW: 40,
            SINGLEQUOTE: 222,
            DELETE: 46,
            TAB: 9,
            MINUS_KEY_KEYCODE: 45
        },

        INPUT_TYPE_INTEGER: 'integer',

        INPUT_TYPE_FLOATING: 'floating',

        INPUT_TYPE_ALPHANUMERIC: 'alphanumeric',

        INPUT_TYPE_CURRENCY: 'currency',

        INPUT_TYPE_CUSTOM: 'custom',

        /**
        * fires when keyup on input box for android devices
        *
        * @event ANDROID_KEYUP_EVENT
        * @param e {Object} event object
        * @param currentTouchDeviceInputBoxValue {String} current value of input box
        * @static
        **/
        ANDROID_KEYUP_EVENT: 'android-keyup-event', // event on keyup specifically for android devices

        /**
        * fires when keydown on input box for android devices
        *
        * @event ANDROID_KEYDOWN_EVENT
        * @param event {Object} event object
        * @static
        **/
        ANDROID_KEYDOWN_EVENT: 'android-input-keydown', // event on keydown specifically for android devices

        KEYPRESS_EVENT_NAME: 'input-box-keypress', //interactive should listen to idprefix + containerID + this string

        KEYUP_EVENT_NAME: 'input-box-keyup', //interactive should listen to idprefix + containerID +this string

        ENTER_PRESS_EVENT_NAME: 'input-box-enterpress', //interactive should listen to idprefix + containerID +this string

        INPUT_EVENT_NAME: 'input-box-input-event', //interactive should listen to idprefix + containerID + this string

        CUSTOM_CHANGE_EVENT_NAME: 'input-box-value-changed',

        GREATER_VALUE_ENTERED: 'value-greater-than-maximum',

        createInputBox: function (inputOptions) {
            if (inputOptions.containerId === null) {
                console.log('No id specified');
                return;
            }

            var inputBoxModel, inputBoxView, id = '#' + inputOptions.containerId;
            inputBoxModel = new MathInteractives.Common.Components.Models.InputBox(inputOptions);
            inputBoxView = new MathInteractives.Common.Components.Views.InputBox({ el: id, model: inputBoxModel });

            return inputBoxView;
        }

    });
    MathInteractives.global.InputBox = MathInteractives.Common.Components.Views.InputBox;
})();
