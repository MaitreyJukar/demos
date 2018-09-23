(function () {
    'use strict';
    //Global parameters: MathInteractives, Backbone


    /**
    * holds functions related to basic set-up of the interactivity window.
    * @class InputBox
    * @namespace MathInteractives.Common.Components.Theme2.Views
    * @submodule MathInteractives.Common.Components.Theme2.Views.InputBox
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Views.InputBox = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * idPrefix of interactive
        * @property idPrefix
        * @type Object
        * @default null
        */
        idPrefix: null,

        /**
        * manager of interactive
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * filePath of interactive
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * player of interactive
        * @property player
        * @type Object
        * @default null
        */
        player: null,

        /**
        * jquery element of input box
        * @property inputEle
        * @type Object
        * @default null
        */
        inputEle: null,

        /**
        * type of input
        * @property inputType
        * @type string
        * @default null
        */
        inputType: null,


        /**
        * maximum value to be allowed
        * @property maxValue
        * @type string
        * @default null
        */
        maxValue: null,

        /**
        * precision of the input on case of float numbers
        * @property precision
        * @type number
        * @default null
        */
        precision: null,

        /**
        * default value when empty
        * @property player
        * @type string
        * @default null
        */
        defaultValue: null,

        /**
        * length of max number of characters allowed
        * @property maxCharLength
        * @type number
        * @default null
        */
        maxCharLength: null,

        /**
        * key code of characters to be allowed
        * @property keyCodeArray
        * @type number
        * @default null
        */
        keyCodeArray: null,

        /**
        * regex string for custom type
        * @property regexString
        * @type string
        * @default null
        */
        regexString: null,

        /**
        * allow negative input for integer and float
        * @property allowNegative
        * @type boolean
        * @default null
        */
        allowNegative: null,

        /**
        * String after every key down
        * @property resultantString
        * @type string
        * @default ''
        */
        resultantString: '',

        /**
        * true if resultant string is valid
        * @property isValidInput
        * @type boolean
        * @default null
        */
        isValidInput: null,


        /**
        * unit provided by user
        * @property unit
        * @type string
        * @default null
        */
        unit: null,


        /**
        * Sets color to unit element
        * @property unitColor
        * @type string
        * @default null
        */
        unitColor: null,


        /**
        * Sets position of unit element
        * @property unitElementPosition
        * @type string
        * @default null
        */
        unitElementPosition: null,


        /**
        * container id of the ele
        * @property containerId
        * @type string
        * @default null
        */
        containerId: null,

        /**
        * case when keypress is not triggerd (for shift)
        * @property keyDownCase
        * @type boolean
        * @default null
        */
        keyDownCase: false,


        /**
        * case when input box is blurred with empty string
        * @property defaultTextOnEmptyInputBox
        * @type string
        * @default null
        */
        defaultTextOnEmptyInputBox: null,

        isMaxValueExceeded: false,

        /**
        * entryFieldText when no default value and when input box empty
        * @property entryFieldText
        * @type string
        * @default null
        */
        entryFieldText: null,

        /**
        * width of the input box
        * @property width
        * @type string
        * @default null
        */
        width: null,

        /**
        * custom class to be added to input box
        * @property _customClass
        * @type string
        * @default null
        */
        _customClass: null,

        /**
        * input box user provided styles
        * @property style
        * @type object
        * @default null
        */
        style: null,

        /**
        * default input when input box empty
        * @property defaultInput
        * @type string
        * @default null
        */
        defaultInput: null,

        /**
        * boolean if device is android
        * @property isTouchDevice
        * @type boolean
        * @default false
        */
        isTouchDevice: false,

        /**
        * hold the static data of current view
        * @property staticDataHolder
        * @type objet
        * @default null
        */
        staticDataHolder: null,

        /**
        * initializes a view
        * @method initialize
        * @public
        **/
        initialize: function () {
            var browerCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
            this.isTouchDevice = browerCheck.isMobile;
            this.idPrefix = this.model.get('idPrefix');
            this.manager = this.model.get('manager');
            this.filePath = this.model.get('filePath');
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
            this.unit = this.model.get('unit');
            this.unitColor = this.model.get('unitColor');
            this.unitElementPosition = this.model.get('unitElementPosition');
            this.containerId = this.model.get('containerId');
            this.defaultTextOnEmptyInputBox = this.model.getDefaultTextOnEmptyInputBox();
            this._customClass = this.model.getCustomClass();
            this.style = this.model.getStyle('style');
            this.width = this.model.getWidth('width');
            this.height = this.model.getHeight('height');
            this.defaultInput = this.model.getDefaultInput('defaultInput');
            this.tabIndex = this.model.get('tabIndex');
            this._addJqueryFunction();
            this._addStringFunction();

            this._render();
            this._bindEvents();

            this.staticDataHolder = MathInteractives.global.Theme2.InputBox;

        },

        /**
        * Renders the inputbox component
        * @method _render
        * @private
        **/
        _render: function () {
            var staticDataHolder = MathInteractives.Common.Components.Theme2.Views.InputBox;
            if (this.unitElementPosition === staticDataHolder.UNIT_ELEMENT_POSITION_LEFT || this.unitElementPosition === staticDataHolder.UNIT_ELEMENT_POSITION_TOP) {
                if (this.unit !== null) {
                    this._createUnitElement();
                    if (this.unitColor !== null) {
                        this._setUnitElementColor();
                    }

                }
                this._renderInputBox();

                if (this.unitElementPosition === staticDataHolder.UNIT_ELEMENT_POSITION_LEFT) {
                    this._changePaddingOfUnitElement();
                }
            }
            else if (this.unitElementPosition === staticDataHolder.UNIT_ELEMENT_POSITION_RIGHT || this.unitElementPosition === staticDataHolder.UNIT_ELEMENT_POSITION_BOTTOM) {
                this._renderInputBox();
                if (this.unit !== null) {
                    this._createUnitElement();
                    if (this.unitColor !== null) {
                        this._setUnitElementColor();
                    }
                }

                if (this.unitElementPosition === staticDataHolder.UNIT_ELEMENT_POSITION_RIGHT) {
                    this._changePaddingOfUnitElement();
                }
            }
            else if (this.unitElementPosition === null) {
                this._renderInputBox();
                if (this.unit !== null) {
                    this._createUnitElement();
                    if (this.unitColor !== null) {
                        this._setUnitElementColor();
                    }
                }
                this._changePaddingOfUnitElement();
            }

            if (this.style !== null) {
                this._applyStyle();
            }

            if (this.width !== null) {
                this._setWidth();
            }

            if (this.height !== null) {
                this._setHeight();
            }


            //set default value "Entry Field" when there is no default value
            this._setEntryField();
            this._createHackDivForInputBox();
        },

        /**
        * renders input box
        * @method _renderInputBox
        * @private
        **/
        _renderInputBox: function () {
            var container,
                containerId = this.containerId;

            container = $('<div></div>');

            container.attr('id', containerId + 'textbox');

            container.addClass('textbox');
            this.$el.append(container);

            this.inputEle = $('<input></input>');
            //  this.inputEle.attr('type', 'number');
            this.inputEle.attr('id', containerId + '-input-box');
            
            this.inputEle.attr('autocomplete', 'off');
            this._addCustomClass();
            this.inputEle.addClass('input-box-common-component');
            this.inputEle.val(this.defaultValue);
            if (this.defaultInput !== null) {
                this.inputEle.val('');
                this.inputEle.val(this.defaultInput);
                this.resultantString = this.defaultInput.toString();
            }
            container.append(this.inputEle);


            //Set the width of the Unit Element same as that of Input Box when Unit element position = top
            if (this.unitElementPosition === 'top') {
                this.$el.css({ 'width': this.$el.find('#' + this.containerId + '-input-box').outerWidth() });
            }
        },

        /**
        * create hackdiv for input box.
        * @method _createHackDivForInputBox
        * @private
        **/
        _createHackDivForInputBox: function () {

            this.$('.textbox').css({
                'height': this.$('.input-box-common-component').outerHeight() + 'px',
                'width': this.$('.input-box-common-component').outerWidth() + 'px'
            });

            if (this.tabIndex) {
                this.loadScreen('input-box-acc-screen');
                var hackObj = {
                    elementId: this.containerId.replace(this.idPrefix, '') + 'textbox',
                    tabIndex: this.tabIndex,
                    acc: this.tabIndex ? this.getAccMessage('input-box-acc-text', 0) : ''
                };
                this.createAccDiv(hackObj);
            }

        },

        /**
        * changes padding between unit element and input box
        * when unit element at left or right position
        * @method _changePaddingOfUnitElement
        * @private
        **/
        _changePaddingOfUnitElement: function () {
            var staticDataHolder = MathInteractives.Common.Components.Theme2.Views.InputBox,
                idSelector = '#' + this.containerId + '-input-box',
                inputBoxEle = this.$el.find(idSelector),
                inputBoxHeight = this.$el.find(idSelector).height(),

                paddingTop = inputBoxEle.css('padding-top'),

                paddingBottom = inputBoxEle.css('padding-bottom'),

                heightUnitElement = staticDataHolder.HEIGHT_UNIT_ELEMENT_TEXT,

                borderSize = inputBoxEle.css("border-top-width"),

            // borderSize multiply by 2 because border top and bottom to be calculated to get entire height of textbox
                paddingTopBottomOfUnitElement = ((inputBoxHeight + parseInt(paddingBottom) + parseInt(paddingTop) + parseInt(borderSize) * 2) - heightUnitElement) / 2;

            this.$el.find('.unit').css({ 'padding-top': paddingTopBottomOfUnitElement + 'px', 'padding-bottom': paddingTopBottomOfUnitElement + 'px', 'padding-right': +staticDataHolder.DEFAULT_PADDING_BETWEEN_INPUT_AND_UNIT + 'px', 'padding-left': +staticDataHolder.DEFAULT_PADDING_BETWEEN_INPUT_AND_UNIT + 'px' });

        },

        /**
        * applies style to input box as specified by user
        * @method _applyStyle
        * @private
        **/
        _applyStyle: function () {
            var idselector = '#' + this.containerId + '-input-box',
                currentInputBox = this.$el.find(idselector),
                color = this.style.color,
                backgroundColor = this.style.backgroundColor,
                backgroundImage = this.style.backgroundImage,
                borderColor = this.style.borderColor;

            if (typeof color !== 'undefined') {
                currentInputBox.css({ 'color': color });
            }
            if (typeof backgroundColor !== 'undefined') {
                currentInputBox.css({ 'background-color': backgroundColor });
            }
            if (typeof backgroundImage !== 'undefined') {
                currentInputBox.css({ 'background-image': 'url("' + this.filePath.getImagePath(backgroundImage) + '")' });
            }
            if (typeof borderColor !== 'undefined') {
                currentInputBox.css({ 'border-color': borderColor });
            }
        },

        /**
        * sets width of the input box
        * @method _setWidth
        * @private
        */
        _setWidth: function () {
            var idselector = '#' + this.containerId + '-input-box',
                currentInputBox = this.$el.find(idselector);
            currentInputBox.css({ 'width': this.width });
        },


        /**
        * sets height of the input box
        * @method _setHeight
        * @private
        */
        _setHeight: function () {
            var idselector = '#' + this.containerId + '-input-box',
                currentInputBox = this.$el.find(idselector);
            currentInputBox.css({ 'height': this.height });
        },
        /**
        * applies style specified by user on focus of input box
        * @method _applyStyleOnFocus
        * @private
        **/
        _applyStyleOnFocus: function () {
            var idselector = '#' + this.containerId + '-input-box',
                currentInputBox = this.$el.find(idselector),
                onFocusColor = this.style.onFocusColor,
                onFocusBackgroundColor = this.style.onFocusBackgroundColor,
                onFocusBackgroundImage = this.style.onFocusBackgroundImage,
                onFocusBorderColor = this.style.onFocusBorderColor;

            if (typeof onFocusColor !== 'undefined') {
                currentInputBox.css({ 'color': onFocusColor });
            }
            if (typeof onFocusBackgroundColor !== 'undefined') {
                currentInputBox.css({ 'background-color': onFocusBackgroundColor });
            }
            if (typeof onFocusBackgroundImage !== 'undefined') {
                currentInputBox.css({ 'background-image': 'url("' + this.filePath.getImagePath(onFocusBackgroundImage) + '")' });
            }
            if (typeof onFocusBorderColor !== 'undefined') {
                currentInputBox.css({ 'border-color': onFocusBorderColor });
            }
        },
        /**
        * Creates Unit element
        * @method _createUnitElement
        * @private
        **/
        _createUnitElement: function () {
            var unitElement,
                idselector = '#' + this.containerId + '-input-box',
                currentInputBox = this.$el.find(idselector);

            unitElement = $('<div></div>');
            unitElement.attr('id', this.idPrefix + 'unit');
            unitElement.attr('class', 'unit');
            this.$el.append(unitElement);
            this.$el.find('#' + this.idPrefix + 'unit').text(this.unit);



            if (this.unitElementPosition === 'top') {
                unitElement.addClass('unit-element-at-top');
            }
            else if (this.unitElementPosition === 'bottom') {
                this.$el.find('#' + this.containerId + 'textbox').css({ 'float': 'none' });
                currentInputBox.css({ 'float': 'none' });
                unitElement.addClass('unit-element-at-bottom');
            }
        },


        /**
        * Sets color to unit element
        * @method _setUnitElementColor
        * @private
        **/
        _setUnitElementColor: function () {
            if (this.unitColor.indexOf('#') === 0)
                this.$el.find('#' + this.idPrefix + 'unit').css({ 'color': this.unitColor });
            else if (this.unitColor.indexOf('#') === -1) {
                this.$el.find('#' + this.idPrefix + 'unit').addClass(this.unitColor);
            }
            else {
                return;
            }
        },


        /**
        * sets "Entry Field" as a text when there is no default values or textbox is empty
        * @method _setEntryField
        * @private
        **/
        _setEntryField: function () {
            var idselector = '#' + this.containerId + '-input-box',
                currentInputBox = this.$el.find(idselector);
            this.entryFieldText = this.manager.getMessage('entry-field-text', 0);

            if (this.defaultValue === null) {
                this.defaultValue = this.entryFieldText;
            }

            currentInputBox.val(this.defaultValue);
            if (this.defaultInput !== null) {
                currentInputBox.val('');
                currentInputBox.val(this.defaultInput);
            }
        },

        /**
        * clears the input box
        * @method clearInputBox
        * @public
        **/
        clearInputBox: function () {
            var model = this.model;
            var inputBoxAccText = this.getAccMessage('input-box-acc-text', 0);
            this.inputEle.val('');
            model.setPreviousValue('');
            if (this.tabIndex) {
                this.setAccMessage(this.containerId.replace(this.idPrefix, '') + 'textbox', inputBoxAccText);
            }
            model.setAndroidDevicePreviousValue('');
        },

        /**
        * enables the input box
        * @method enableInputBox
        * @public
        **/
        enableInputBox: function () {

            var idselector = '#' + this.containerId + '-input-box',
                manager = this.manager;

            this.inputEle.removeAttr('disabled').removeClass('disabled');
            this.enableTab(this.containerId.replace(this.idPrefix, '') + 'textbox', true);
        },

        /**
        * hides the input box
        * @method hideInputBox
        * @public
        **/
        hideInputBox: function () {

            this.inputEle.hide();

        },

        /**
        * shows the input box
        * @method showInputBox
        * @public
        **/
        showInputBox: function () {

            this.inputEle.show();
        },

        /**
        * disables the input box
        * @method disableInputBox
        * @public
        **/
        disableInputBox: function () {
            this.inputEle.attr('disabled', 'disabled').addClass('disabled');
            if (this.inputEle.hasClass('focused')) {
                this.inputEle.blur(); // In Ipads textbox not getting blurred on disable.
            }
            this.enableTab(this.containerId.replace(this.idPrefix, '') + 'textbox', false);
        },

        /**
        * set tab index to input box on key down and key up to its parent
        * @method _enableInputTab
        * @private
        **/
        _enableInputTab: function (isEnable) {
            if (this.isAccessible() !== true) {
                return;
            }
            var self = this,
                $el = this.$el,
                startTabindex = this.player.model.get('startTabindex'),
                idselector = '#' + this.containerId + '-input-box',
                currentInputBox = $el.find(idselector),
                parentId = self.containerId.split(self.idPrefix)[1] + 'textbox',
                tabIndex = self.getTabIndex(parentId);

            if (isEnable === true) {
                self.enableTab(parentId, false);
                currentInputBox.attr('tabindex', startTabindex + tabIndex);

            }
            else {
                self.enableTab(parentId, true);
                currentInputBox.removeAttr('tabindex');
            }
        },

        /**
        * bind the events
        * @method _bindEvents
        * @private
        **/
        _bindEvents: function () {
            var containerId = this.containerId,
                idselector = '#' + containerId + '-input-box',
                events = {},
                self = this,
                eventType = null,
                $el = this.$el.find('#' + containerId + 'textbox'),
                currentInputBox = $el.find(idselector),
                manager = this.manager,
                staticDataHolder = MathInteractives.Common.Components.Theme2.Views.InputBox,
                defaultTextOnEmptyInputBox = self.defaultTextOnEmptyInputBox,
                $element = null;


            /*events['keypress ' + idselector] = function (e) {

            }

            events['keyup ' + idselector] = function (e) {
            self.trigger('input-box-keyup', [this.isValidInput, this.resultantString]);
            }*/

            this.player.$el.off('mousedown.player-click' + containerId).on('mousedown.player-click' + containerId, function (event) {
                $element = $(event.target);
                if ($element.attr('id') !== currentInputBox.attr('id') && $element.parents('#' + containerId).length === 0) {
                    if (currentInputBox.hasClass('focused')) {
                        currentInputBox.blur();
                    }
                }
            });

            $el.off('click.element-click').on('click.element-click', function (event) {
                //var unitClass = event.target.classList[0];
                if (currentInputBox.attr('disabled') !== 'disabled') {
                    self.setAccMessage(self.containerId.replace(self.idPrefix, '') + 'textbox', '');
                    //self._enableInputTab(true);
                    currentInputBox.focus();
                    if (currentInputBox.val() === self.defaultValue) {
                        currentInputBox.val('');
                        if (this.defaultInput !== null) {
                            currentInputBox.val(this.defaultInput);
                        }
                    }
                }
            });

            currentInputBox.on('focus.input-box-focus', function (event) {
                if (currentInputBox.attr('disabled') !== 'disabled' && currentInputBox.hasClass('focused') === false) {
                    MathInteractives.global.SpeechStream.stopReading();
                    if (currentInputBox.val() === self.defaultValue) {
                        currentInputBox.val('');
                        if (this.defaultInput !== null) {
                            currentInputBox.val(this.defaultInput);
                        }
                        if (self.style !== null) {
                            self._applyStyleOnFocus();
                        }
                    }
                    currentInputBox.addClass('focused');
                    self._setFocusToEnd(currentInputBox[0]);
                    self._isValidated = false;
                    window.setTimeout(function () { self.model.setAndroidDevicePreviousValue(currentInputBox.val()) }, 0);
                    self.trigger(staticDataHolder.INPUT_TYPE_FOCUS_EVENT, event);
                }
            });

            $el.off('keydown.element-keydown').on('keydown.element-keydown', function (event) {
                if (event.keyCode === 32 && currentInputBox.attr('disabled') !== 'disabled') {
                    MathInteractives.global.SpeechStream.stopReading();
                    self.setAccMessage(self.containerId.replace(self.idPrefix, '') + 'textbox', '');
                    self._enableInputTab(true);
                    //currentInputBox.focus();
                }

            });

            currentInputBox.off('blur.input-box-blur').on('blur.input-box-blur', function (event) {
                var inputBoxString = currentInputBox.val() || null,
                    inputBoxAccText = null;

                if (inputBoxString === null || inputBoxString.trim() === '') {
                    inputBoxString = defaultTextOnEmptyInputBox;
                    currentInputBox.val(self.defaultValue);
                    if (self.style !== null) {
                        self._applyStyle();
                    }
                }
                self._enableInputTab(false);
                self._checkForMinusZero(event);
                self.trigger(staticDataHolder.INPUT_TYPE_BLUR_EVENT, inputBoxString, event, self.isValidInput);
                if ($(event.target).val() !== "") {
                    inputBoxAccText = self.getAccMessage('input-box-acc-text', 1, [$(event.target).val(), self.model.get('unitAccText') ? self.model.get('unitAccText') : '']);
                }
                else {
                    inputBoxAccText = self.getAccMessage('input-box-acc-text', 0);
                }
                if (self.tabIndex) {
                    self.setAccMessage(self.containerId.replace(self.idPrefix, '') + 'textbox', inputBoxAccText);
                }
                currentInputBox.removeClass('focused');
            });

            currentInputBox.off('paste.input-box').on('paste.input-box', function (e) {
                var clipboarddata = e.originalEvent.clipboardData,
                    inputVal = '',
                    selectionStart = currentInputBox.prop('selectionStart') || null,
                selectionEnd = currentInputBox.prop('selectionEnd') || null;
                if (typeof clipboarddata !== 'undefined') {
                    clipboarddata = clipboarddata.getData('text/plain');
                    inputVal = currentInputBox.val().inputBoxCommonComponentInsertT2(selectionStart, selectionEnd, clipboarddata);
                }
                // Prevent paste in Android devices, unable to get clipboard data
                // To Do: Reasearch on getting clipboard data in android
                if (self._checkForValidInput(e, inputVal) === false || MathInteractives.Common.Utilities.Models.BrowserCheck.isAndroid) {
                    e.preventDefault();
                }
                else {
                    if (self._checkIfInputChanged(inputVal)) {
                        self.trigger(inputBoxContainerId + staticDataHolder.CUSTOM_CHANGE_EVENT_NAME, e, self.charCode, self.isValidInput, self.model.getPreviousValue());
                    }
                }
            });

            currentInputBox.off('keydown.input-box-keydown').on('keydown.input-box-keydown', function (e) {
                e = (e) ? e : window.event;
                var charCode = (e.keyCode) ? e.keyCode : e.which;
                if (self.model.get('bAllowQuotes') !== true) {
                    if (charCode === staticDataHolder.CHAR_CODE_ENUM.SINGLEQUOTE) {
                        self.keyDownCase = true;
                        return false;
                    } else {
                        self.keyDownCase = false;
                    }
                }
                if (self.isTouchDevice) {
                    self._setValuesOnKeyDown(e);
                }
                /* To fix the issue on app.dev
                    Click of clear my data was geting fired
                    when enter key was pressed on input box
                */
                if (charCode == staticDataHolder.CHAR_CODE_ENUM.ENTER) {
                    e.preventDefault();
                }
                if (charCode === staticDataHolder.CHAR_CODE_ENUM.BACKSPACE || charCode === staticDataHolder.CHAR_CODE_ENUM.DELETE) {
                    return self._checkForValidInput(e);
                }
            });

            currentInputBox.off('keypress.input-box-keypress').on('keypress.input-box-keypress', function (e) {
                /* To fix the issue on app.dev
                    Click of clear my data was geting fired
                    when enter key was pressed on input box
                */

                if (self.isTouchDevice === true) {
                    return true;
                }
                if (charCode == staticDataHolder.CHAR_CODE_ENUM.ENTER) {
                    e.preventDefault();
                }
                //    self._isValidated = true;
                //return self._keyPressEventHandle(e);

            });

            var staticDataHolder = MathInteractives.Common.Components.Theme2.Views.InputBox,
                inputBoxContainerId = self.containerId,
                currentTouchDeviceInputBoxValue = null,
                charCode = null,
                inputVal = null;

            currentInputBox.off('keyup.input-box-keyup').on('keyup.input-box-keyup', function (e) {
                if (!self.isTouchDevice) {

                    e = (e) ? e : window.event;
                    var charCode = (e.keyCode) ? e.keyCode : e.which;
                    if (charCode === staticDataHolder.CHAR_CODE_ENUM.BACKSPACE) {
                        self.isValidInput = true;
                    }
                    self.trigger(inputBoxContainerId + staticDataHolder.KEYUP_EVENT_NAME, e, charCode, self.isValidInput, self.resultantString);
                    if (charCode == staticDataHolder.CHAR_CODE_ENUM.ENTER) {
                        self.trigger(inputBoxContainerId + staticDataHolder.ENTER_PRESS_EVENT_NAME, e, charCode, self.isValidInput, self.resultantString);
                    }
                    inputVal = currentInputBox.val();
                    if (self.maxValue !== null && Number(inputVal) > self.maxValue) {
                        currentInputBox.val(self.model.getMaxValue());
                        inputVal = currentInputBox.val();
                    }
                    if (self._checkIfInputChanged(inputVal)) {
                        self.trigger(inputBoxContainerId + staticDataHolder.CUSTOM_CHANGE_EVENT_NAME, e, self.charCode, self.isValidInput, self.model.getPreviousValue());
                    }
                    self.model.setPreviousValue(inputVal);
                    return self._keyPressEventHandle(e);
                }
                else {
                    eventType = 'keyup';
                    charCode = e.keyCode || e.which;

                    currentTouchDeviceInputBoxValue = self.model.getAndroidDevicePreviousValue();
                    self.resultantString = self.$el.find('input').val().toString();
                    //self._checkForSpecialCharInAndroid(e, eventType);
                    self.trigger(staticDataHolder.ANDROID_KEYUP_EVENT, e, currentTouchDeviceInputBoxValue);
                    self.trigger(inputBoxContainerId + staticDataHolder.KEYUP_EVENT_NAME, e, currentTouchDeviceInputBoxValue);

                    if (charCode == staticDataHolder.CHAR_CODE_ENUM.ENTER) {
                        self.trigger(inputBoxContainerId + staticDataHolder.ENTER_PRESS_EVENT_NAME, e, currentTouchDeviceInputBoxValue);
                    }
                }
            });


            currentInputBox.off('input.input-box-input').on('input.input-box-input', function (event) {
                event = (event) ? event : window.event;
                var charCode = (event.keyCode) ? event.keyCode : event.which,
				    $target = $(event.target),
				    maxLengthString,
				    currentLength;
                eventType = 'input';

                if (self._isValidated !== true) {
                    self.resultantString = self.$el.find('input').val().toString();
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
        * Checks whether the value in the input box is different from previous value or not
        * @method _checkIfInputChanged
        * @param inputVal {String} value in the inputbox
        * @return {Boolean} returns true if the input value is diferent from previous value
        **/
        _checkIfInputChanged: function (inputVal) {
            if (!isNaN(inputVal)) {
                // Convert the value to float only if it is a numeric value
                if (parseFloat(this.model.getPreviousValue()) !== parseFloat(inputVal)) {
                    return true;
                }
            }
                // Use string comparison
            else if (this.model.getPreviousValue() !== inputVal) {
                return true;
            }
            return false;
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
                selectionStart = $currentTarget.prop('selectionStart') || null,
                selectionEnd = $currentTarget.prop('selectionEnd') || null,
                currentVal = $currentTarget.val(),
                currentLength = this._getActualLength(selectionStart, selectionEnd),
                validInput = false,
                androidDevicePreviousValue = model.getAndroidDevicePreviousValue() || '',
                regexExp = model.getCurrentRegex();

            if (regexExp.test(currentVal) && currentLength <= self.maxCharLength) {
                model.setAndroidDevicePreviousValue(currentVal);
                validInput = true;
                if (currentVal !== androidDevicePreviousValue) {
                    self.trigger(self.containerId + staticDataHolder.CUSTOM_CHANGE_EVENT_NAME, event, self.charCode, validInput, androidDevicePreviousValue);
                }

                return true;
            }
            else {
                /*if (eventType === 'keyup') {*/
                $currentTarget.val(androidDevicePreviousValue);
                return false
                //}
            }
        },

        /**
        * add function to String class to reduce callstack
        * insert string at given index range
        * @method _addStringFunction
        * @return string {String}
        * @private
        **/
        _addStringFunction: function () {
            var self = this;

            if (!String.prototype.inputBoxCommonComponentInsertT2) {
                String.prototype.inputBoxCommonComponentInsertT2 = function (indexStart, indexEnd, string) {
                    return this.substring(0, indexStart) + string + this.substring(indexEnd, this.length);
                };
            }

            if (!String.prototype.inputBoxCommonComponentDeleteT2) {
                String.prototype.inputBoxCommonComponentDeleteT2 = function (indexStart, indexEnd, isDelKey) {
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
        * handler for keypress event
        * @method _keyPressEventHandle
        * @param evt {object} event object
        * @return isValidInput {boolean}
        * @private
        **/
        _keyPressEventHandle: function (evt) {
            var $targetElement = $(evt.target),
                selectionStart = $targetElement.prop('selectionStart') || null,
                selectionEnd = $targetElement.prop('selectionEnd') || null,
                idselector = '#' + this.containerId + '-input-box',
                currentInputBox = this.$el.find(idselector),
                checkBrowser = MathInteractives.Common.Utilities.Models.BrowserCheck,
                staticDataHolder = MathInteractives.Common.Components.Theme2.Views.InputBox,
                isValid = null,
                evt = (evt) ? evt : window.event,
                charCode = (evt.keyCode) ? evt.keyCode : evt.which;

            if (checkBrowser.isFirefox) {
                if (this._checkSpecialKeys(evt)) {
                    return true;
                }
            }

            if (this.keyDownCase) {
                this.isValidInput = false;
                return this.isValidInput;
            }

            this.charCode = charCode;

            isValid = this._checkForValidInput(evt);
            var currentLength = this._getActualLength(selectionStart, selectionEnd);

            if ((currentLength > this.maxCharLength)) {
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

        /**
        * Returns the length of the string in the input box
        * @method _getActualLength
        * @param selectionStart {Number} Start index of selection
        * @param selectionEnd {Number} End index of selection
        * @return {Number} Length of the input string
        * @private
        **/
        _getActualLength: function (selectionStart, selectionEnd) {
            var currentLength = this.resultantString.length;

            if (this.allowNegative && this.resultantString.indexOf('-') === 0) {
                currentLength -= 1;
            }

            currentLength = currentLength - (selectionEnd - selectionStart);

            return currentLength;
        },
        /**
        * Returns whether the string in the input box is valid or not
        * @method _checkForValidInput
        * @param evt {Object} Event object
        * @return {Boolean} Returns true if input is valid
        * @private
        **/
        _checkForValidInput: function (evt, input) {
            var inputType = this.inputType,
                staticDataHolder = MathInteractives.Common.Components.Theme2.Views.InputBox,
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
                        inputString = val.inputBoxCommonComponentDeleteT2(selectionStart, selectionEnd, true);
                    }
                    else {
                        inputString = val.inputBoxCommonComponentDeleteT2(selectionStart, selectionEnd, false);
                    }
                }
                else {
                    inputString = val.inputBoxCommonComponentInsertT2(selectionStart, selectionEnd, String.fromCharCode(charCode));
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
                case staticDataHolder.INPUT_TYPE_TITLE:
                    {
                        isValid = this._isValidTitle(val, evt, charCode, inputString);
                        break;
                    }
            }

            return isValid;
        },

        /**
        * check for direction keys and special keys
        * @method _checkSpecialKeys
        * @private
        * @param evt {Object} event object
        * @return {Boolean} returns true if special(tab, backspace, etc.) keys are pressed.
        **/
        _checkSpecialKeys: function (evt) {
            var charCode = evt.keyCode,
                staticDataHolder = MathInteractives.Common.Components.Theme2.Views.InputBox;

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
                staticDataHolder = MathInteractives.Common.Components.Theme2.Views.InputBox,
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

            if (this.allowNegative && (selectionEnd - selectionStart) === val.length && charCode === staticDataHolder.CHAR_CODE_ENUM.MINUS_KEY_KEYCODE) {// on selection of entire value of input box and then minus keypress event handle
                return true;
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
        * check if minus zero is present
        * @method _checkForMinusZero
        * @return {boolean} return true if minus zero is present
        * @private
        **/

        _checkForMinusZero: function (event) {

            var $currentTarget = $(event.target),
                currentValue = $currentTarget.val(),
                charCode = event.keyCode || event.which,
                staticDataHolder = MathInteractives.Common.Components.Theme2.Views.InputBox;

            if (Number(currentValue) === -0) {
                currentValue = currentValue.replace('-', '');
                $currentTarget.val(currentValue);
                return true
            }
            return false
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
                staticDataHolder = MathInteractives.Common.Components.Theme2.Views.InputBox,
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
            var regexExp = new RegExp(/^\w*$/),
                result = regexExp.test(inputString);

            if (this.keyCodeArray.indexOf(charCode) >= 0) {
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
        * @return result {Number} if result is valid
        * @private
        **/
        _isValidCustom: function (val, evt, charCode, input) {
            var $currentTarget = $(evt.target),
                currentVal = $currentTarget.val(),
                selectionStart = $currentTarget.prop('selectionStart'),
                selectionEnd = $currentTarget.prop('selectionEnd'),
                staticDataHolder = MathInteractives.Common.Components.Theme2.Views.InputBox,
                currentTargetValLength = currentVal.length,
                regexExp = new RegExp(this.regexString),
                inputString,
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
            if (input && input.trim() !== '') {
                inputString = input
            }
            else {
                if (evt.type === 'keydown') {
                    if (charCode === staticDataHolder.CHAR_CODE_ENUM.DELETE) {
                        inputString = val.inputBoxCommonComponentDeleteT2(selectionStart, selectionEnd, true);
                    }
                    else {
                        inputString = val.inputBoxCommonComponentDeleteT2(selectionStart, selectionEnd, false);
                    }
                }
                else {
                    if (Math.abs(selectionEnd - selectionStart) !== 0) {
                        if (selectionEnd < currentTargetValLength) {
                            inputString = currentVal.substring(0, selectionStart) + currChar + currentVal.substring(selectionEnd + 1, currentTargetValLength - 1);
                        }
                        else {
                            inputString = currentVal.substring(0, selectionStart) + currChar;
                        }
                    }
                    else {
                        inputString = val.inputBoxCommonComponentInsertT2(selectionStart, selectionEnd, currChar);
                    }
                }
            }
            result = regexExp.test(inputString);

            this.resultantString = inputString;
            return result;
        },
        /**
        * check for title validation,text without '<' and '>' chars
        * @method _isValidTitle
        * @param val {Number} entered number
        * @param evt {Object} event object
        * @param charCode {Number} charCode of the entered value
        * @param inputString {String} string to be validated
        * @return result {Number} if float is valid
        * @private
        **/
        _isValidTitle: function (val, evt, charCode, inputString) {
            var regexExp = new RegExp(/^[^<>]*$/),
                result = regexExp.test(inputString);

            if (this.keyCodeArray.indexOf(charCode) >= 0) {
                return true;
            }
            this.resultantString = inputString;
            return result;
        },

        /**
        * adds custom class
        * @method _addCustomClass
        * @private
        **/
        _addCustomClass: function () {
            if (this._customClass !== null && this.inputEle !== null) {
                this.inputEle.addClass(this._customClass);
            }
        },
        /**
        * returns current value of input box
        * @method getCurrentInputValue
        * @return {Number} current value in the input box
        * @public
        **/
        getCurrentInputValue: function () {
            return this.$el.find('input').val() || null;
        },
        /**
        * sets value in the input box
        * @method setCurrentInputValue
        * @param value {Number} currently set value
        * @public
        **/
        setCurrentInputValue: function (value) {
            value = value == null ? '' : value;
            this.$el.find('input').val(value);
            this.model.set('previousValue', value);
            this.resultantString = value.toString();
            if (this.isTouchDevice) {
                this.model.set('androidDevicePreviousValue', value);
            }
        },

        /**
        * updates regular expression
        * @method updateRegularExpression
        * @param value {String} regular expression to be set
        * @public
        **/
        updateRegularExpression: function (value) {
            this.regexString = value;
            this.model.set('regexString', value);
            this.model._setRegexForCurrentType();
        },

        /**
      * focus textbox and go to end, but ALSO set the position of the cursor so user can see it
      *
      * @method _setFocusToEnd
      * @private
      **/
        _setFocusToEnd: function (inputBox) {
            var valLength;
            valLength = inputBox.value.length,
                inputBox.setSelectionRange(valLength, valLength),
            inputBox.scrollLeft = inputBox.scrollWidth;
        },

    }, {
        /**
        * fires when input box is focused
        *
        * @event INPUT_TYPE_FOCUS_EVENT
        * @param inputBoxString {String} value inside input box
        * @param event {Object} event object
        * @param {boolean} input is valid or not
        * @static
        **/
        INPUT_TYPE_FOCUS_EVENT: 'input-focus',

        /**
        * fires when input box is blurred
        *
        * @event INPUT_TYPE_BLUR_EVENT
        * @param inputBoxString {String} value inside input box
        * @param event {Object} event object
        * @param {boolean} input is valid or not
        * @static
        **/
        INPUT_TYPE_BLUR_EVENT: 'input-blur',

        /**
        * charCodes of access keys
        * @property CHAR_CODE_ENUM
        * @type Object
        * @static
        */
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

        /**
        * integer type value
        * @property INPUT_TYPE_INTEGER
        * @type String
        * @static
        */
        INPUT_TYPE_INTEGER: 'integer',
        /**
        * floating type value
        * @property INPUT_TYPE_FLOATING
        * @type String
        * @static
        */
        INPUT_TYPE_FLOATING: 'floating',
        /**
        * alphanumeric type value
        * @property INPUT_TYPE_ALPHANUMERIC
        * @type String
        * @static
        */
        INPUT_TYPE_ALPHANUMERIC: 'alphanumeric',
        /**
        * currency type value
        * @property INPUT_TYPE_CURRENCY
        * @type String
        * @static
        */
        INPUT_TYPE_CURRENCY: 'currency',
        /**
        * custom type input
        * @property INPUT_TYPE_CUSTOM
        * @type String
        * @static
        */
        INPUT_TYPE_CUSTOM: 'custom',

        /**
        * alphanumeric type value with spacial char exept '>' and '<'
        * @property INPUT_TYPE_TITLE
        * @type String
        * @static
        */
        INPUT_TYPE_TITLE: 'title',

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

        /**
        * fires when keypress on input box
        *
        * @event KEYPRESS_EVENT_NAME
        * @param evt {Object} event object
        * @param charCode {Number} charCode Of currently pressed key
        * @param isValidInput {boolean} if input is valid
        * @param resultantString {String} current input box value
        * @static
        **/
        KEYPRESS_EVENT_NAME: 'input-box-keypress', //interactive should listen to idprefix + containerID + this string

        /**
        * fires when keyup on input box
        *
        * @event KEYUP_EVENT_NAME
        * @param evt {Object} event object
        * @param charCode {Number} charCode Of currently pressed key
        * @param isValidInput {boolean} if input is valid
        * @param resultantString {String} current input box value
        * @static
        **/
        KEYUP_EVENT_NAME: 'input-box-keyup', //interactive should listen to idprefix + containerID +this string
        /**
        * fires when enter pressed on input box
        *
        * @event ENTER_PRESS_EVENT_NAME
        * @param e {Object} event object
        * @param charCode {Number} charCode Of currently pressed key
        * @param isValidInput {boolean} if input is valid
        * @param resultantString {String} current input box value
        * @static
        **/
        ENTER_PRESS_EVENT_NAME: 'input-box-enterpress', //interactive should listen to idprefix + containerID +this string
        /**
        * fires when enter pressed on input box
        *
        * @event INPUT_EVENT_NAME
        * @param event {Object} event object
        * @param charCode {Number} charCode Of currently pressed key
        * @param isValidInput {boolean} if input is valid
        * @param resultantString {String} current input box value
        * @static
        **/
        INPUT_EVENT_NAME: 'input-box-input-event', //interactive should listen to idprefix + containerID + this string
        /**
        * fires change event occurs on input box
        *
        * @event CUSTOM_CHANGE_EVENT_NAME
        * @param e {Object} event object
        * @param charCode {Number} charCode Of currently pressed key
        * @param isValidInput {boolean} if input is valid
        * @param previousValue {String} previous value in input box
        * @static
        **/
        CUSTOM_CHANGE_EVENT_NAME: 'input-box-value-changed',

        /**
        * height of unit element
        * @property HEIGHT_UNIT_ELEMENT_TEXT
        * @type Number
        * @default 22
        * @static
        */
        HEIGHT_UNIT_ELEMENT_TEXT: 22,

        /**
        * padding between unit element and input box
        * @property DEFAULT_PADDING_BETWEEN_INPUT_AND_UNIT
        * @type Number
        * @default 7
        * @static
        */
        DEFAULT_PADDING_BETWEEN_INPUT_AND_UNIT: 7,
        /**
        * unit element position left
        * @property UNIT_ELEMENT_POSITION_LEFT
        * @type String
        * @default 'left'
        * @static
        */
        UNIT_ELEMENT_POSITION_LEFT: 'left',
        /**
        * unit element position top
        * @property UNIT_ELEMENT_POSITION_TOP
        * @type String
        * @default 'top'
        * @static
        */
        UNIT_ELEMENT_POSITION_TOP: 'top',
        /**
        * unit element position right
        * @property UNIT_ELEMENT_POSITION_RIGHT
        * @type String
        * @default 'right'
        * @static
        */
        UNIT_ELEMENT_POSITION_RIGHT: 'right',
        /**
        * unit element position bottom
        * @property UNIT_ELEMENT_POSITION_BOTTOM
        * @type String
        * @default 'bottom'
        * @static
        */
        UNIT_ELEMENT_POSITION_BOTTOM: 'bottom',

        /**
        * Generates Input box view
        * @method createInputBox
        * @public
        * @param inputOptions {Object} parameters to be passed to object
        * @return inputBoxView {Object} input box view
        * @static
        */
        createInputBox: function (inputOptions) {
            if (inputOptions.containerId === null) {
                console.log('No id specified');
                return;
            }

            var inputBoxModel, inputBoxView, id = '#' + inputOptions.containerId;
            inputBoxModel = new MathInteractives.Common.Components.Theme2.Models.InputBox(inputOptions);
            inputBoxView = new MathInteractives.Common.Components.Theme2.Views.InputBox({ el: id, model: inputBoxModel });

            return inputBoxView;
        }

    });

    MathInteractives.global.Theme2.InputBox = MathInteractives.Common.Components.Theme2.Views.InputBox;
})();
