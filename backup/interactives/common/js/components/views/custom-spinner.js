(function () {
    'use strict';

    /**
    * View for rendering Custom Spinner
    *
    * @class CustomSpinner
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.CustomSpinner = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Manager class object
        *
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,
        /**
        * Spinner Id
        *
        * @property spinBoxId
        * @type String
        * @default null
        */
        spinBoxId: null,
        /**
        * Spinner Path
        *
        * @property path
        * @type String
        * @default null
        */
        _path: null,
        /**
        * Spinner Screen Id
        *
        * @property screenId
        * @type String
        * @default null
        */
        screenId: null,
        /**
        * Spinner Id Prefix
        *
        * @property idPrefix
        * @type String
        * @default null
        */
        idPrefix: null,
        /**
        * Player view object
        *
        * @property player
        * @type Object
        * @default null
        */
        player: null,
        /**
        * Minimum Value of Spinner's text
        *
        * @property minValue
        * @type String
        * @default null
        */
        minValue: null,
        /**
        * Maximum Value of Spinner's text
        *
        * @property maxValue
        * @type String
        * @default null
        */
        maxValue: null,
        /**
        * Step Value of Spinner
        *
        * @property stepValue
        * @type String
        * @default null
        */
        stepValue: null,
        /**
        * Text Value of Spinner
        *
        * @property stepValue
        * @type String
        * @default null
        */
        spinValue: null,
        /**
        * Height of Spinner
        *
        * @property spinnerHeight
        * @type String
        * @default null
        */
        spinnerHeight: null,
        /**
        * Width of Spinner
        *
        * @property spinnerWidth
        * @type String
        * @default null
        */
        spinnerWidth: null,
        /**
        * Sign of Value of Spinner
        *
        * @property spinSign
        * @type String
        * @default null
        */
        spinSign: false,
        /**
        * Up Button View of Spinner
        *
        * @property upBtn
        * @type Object
        * @default null
        */
        upBtn: null,
        /**
        * Down Button View of Spinner
        *
        * @property downBtn
        * @type Object
        * @default null
        */
        downBtn: null,
        /**
        * Enable/Disable spinner
        *
        * @property disableSpin
        * @type Boolean
        * @default false
        */
        disableSpin: false,
        /**
        * Previous value of spinner
        *
        * @property previousValue
        * @type String
        * @default ''
        */
        previousValue: '',
        /**
        * Current Value of Spinner
        *
        * @property currentValue
        * @type String
        * @default ''
        */
        currentValue: '',
        /**
        * Check whether spinner text is editable.
        *
        * @property isEditable
        * @type Boolean
        * @default false
        */
        isEditable: false,
        /**
        * Check whether spinner buttons are bottom aligned.
        *
        * @property isBottomAligned
        * @type Boolean
        * @default false
        */
        alignType: false,
        /**
        * Type of input box to be added.
        *
        * @property inputType
        * @type String
        * @default null
        */
        inputType: null,
        /**
        * Precision values allowed after decimal point.
        *
        * @property inputPrecision
        * @type Number
        * @default null
        */
        inputPrecision: null,
        /**
        * Maximum allowed chacecters in a text box
        *
        * @property maxCharLength
        * @type Number
        * @default null
        */
        maxCharLength: null,
        /**
        * Regular expression string for validating the input text.
        *
        * @property inputRegEx
        * @type String
        * @default null
        */
        inputRegEx: null,
        /**
        * Spinner text box view
        *
        * @property spinnerTextbox
        * @type Object
        * @defaul null
        */
        spinnerTextbox: null,

        /**
        * Place holder values for the accessibility text when spinner is empty/null
        * @property emptySpinnerPlaceHolderValues
        * @type Array
        * @default null
        **/
        emptySpinnerPlaceHolderValues: null,

        /**
        * Place holder values for the default accessibility text
        * @property defaultAllPlaceHolderValues
        * @type Array
        * @default null
        **/
        defaultAllPlaceHolderValues: null,

        /**
        * Place holder values for the minimum limit accessibility text
        * @property minLimitAllPlaceHolderValues
        * @type Array
        * @default null
        **/
        minLimitAllPlaceHolderValues: null,

        /**
        * Place holder values for the maximum limit accessibility text
        * @property maxLimitAllPlaceHolderValues
        * @type Array
        * @default null
        **/
        maxLimitAllPlaceHolderValues: null,

        /**
        * Place holder values for the decrease accessibility text
        * @property onDecreaseAllPlaceHolderValues
        * @type Array
        * @default null
        **/
        onDecreaseAllPlaceHolderValues: null,

        /**
        * Place holder values for the increase accessibility text
        * @property onIncreaseAllPlaceHolderValues
        * @type Array
        * @default null
        **/
        onIncreaseAllPlaceHolderValues: null,
        /**
        * Reference to an interval timer variable used for mousedown/touchstart event
        * @property btnInterval
        * @type Number
        * @default null
        */
        btnInterval: null,
        /**
        * Checks whether textbox is focused and at the same time keypress is being fired.
        * @property isFocusedPress
        * @type Boolean
        * @default false
        */
        isFocusedPress: false,

        /**
        * Get data from model & set in view, Calls render
        *
        * @method initialize
        * @private
        **/
        initialize: function initialize() {
            var currentModel = this.model,
                self = this;

            // Get Values from models
            this.manager = currentModel.getManager();
            this.player = currentModel.getPlayer();
            this.idPrefix = currentModel.getIdPrefix();
            this.spinBoxId = currentModel.getSpinId();
            this.minValue = currentModel.getMinValue();
            this.maxValue = currentModel.getMaxValue();
            this.stepValue = currentModel.getStepValue();
            this.spinValue = currentModel.getValue();
            this.spinnerHeight = currentModel.getHeight();
            this.spinnerWidth = currentModel.getWidth();
            this.spinSign = currentModel.getShowSign();
            this.screenId = currentModel.getScreenId();
            this._path = currentModel.getPath();
            this.alignType = currentModel.getAlignType();
            this.isEditable = currentModel.getIsEditable();
            this.inputType = currentModel.getInputType();
            this.inputPrecision = currentModel.getInputPrecision();
            this.maxCharLength = currentModel.getMaxCharLength();
            this.inputRegEx = currentModel.getInputRegEx();

            this.currentValue = this.spinValue;
            this.previousValue = this.currentValue;

            this.loadScreen('spinner-acc-text-screen');

            if (currentModel.getEmptySpinnerAccText() === '%@$%') {
                this.setEmptySpinnerAcc(this.getAccMessage('empty-spinner-acc-text', 0));
            }

            this.emptySpinnerPlaceHolderValues = [];
            this.defaultAllPlaceHolderValues = [];
            this.minLimitAllPlaceHolderValues = [];
            this.maxLimitAllPlaceHolderValues = [];
            this.onDecreaseAllPlaceHolderValues = [];
            this.onIncreaseAllPlaceHolderValues = [];

            this._setPlaceHolderValues(currentModel.getEmptySpinnerPlaceHolders(), this.emptySpinnerPlaceHolderValues);
            this._setPlaceHolderValues(currentModel.getDefaultPlaceHolders(), this.defaultAllPlaceHolderValues);
            this._setPlaceHolderValues(currentModel.getMinLimitPlaceHolders(), this.minLimitAllPlaceHolderValues);
            this._setPlaceHolderValues(currentModel.getMaxLimitPlaceHolders(), this.maxLimitAllPlaceHolderValues);
            this._setPlaceHolderValues(currentModel.getOnDecreasePlaceHolders(), this.onDecreaseAllPlaceHolderValues);
            this._setPlaceHolderValues(currentModel.getOnIncreasePlaceHolders(), this.onIncreaseAllPlaceHolderValues);

            if (this.alignType === null) {
                this.alignType = MathInteractives.global.CustomSpinner.CENTER_ALIGN;
            }
            var data = { spinBoxId: this.spinBoxId },
                templateHtml = MathInteractives.Common.Components.templates.customSpin(data);

            this._render(templateHtml);

            this._setAlignments();
        },

        /**
        * Renders the Custom Spinner
        *
        * @method render
        * @param {String} template of customSpin
        * @private
        **/
        _render: function _render(template) {
            var textBoxOptions,
                downArrowButton = this.$('.spin-down-arrow'),
                self = this;

            this.$el.append(template.trim());

            if (this.isEditable) {
                textBoxOptions = {
                    containerId: this.spinBoxId + '-text',
                    filePath: this._path,
                    manager: this.manager,
                    player: this.player,
                    idPrefix: this.idPrefix,
                    inputType: this.inputType,
                    customClass: 'spinner-input-box',
                    precision: this.inputPrecision,
                    maxCharLength: this.maxCharLength
                };
                if (this.inputType === MathInteractives.global.InputBox.INPUT_TYPE_CUSTOM) {
                    textBoxOptions.regexString = this.inputRegEx;
                }
                
                this.spinnerTextbox = MathInteractives.global.InputBox.createInputBox(textBoxOptions);
                this.$('.spin-textbox,.spin-down-arrow,.spin-up-arrow').addClass('editable-textbox');
                this.spinnerTextbox.on(this.spinBoxId + '-text' + MathInteractives.Common.Components.Views.InputBox.CUSTOM_CHANGE_EVENT_NAME,
                        $.proxy(self._spinBoxInputKeyPress, self));
            }

            this.$('.spinbox,.spin-textbox,.spin-down-arrow,.spin-up-arrow').addClass(this.alignType + '-aligned');
            if (this.alignType === MathInteractives.global.CustomSpinner.TOP_ALIGN) {
                // Direct Access of spinner DOM to arrange elements in top alignment.
                $(this.$('.spin-down-arrow').parent()).append(this.$('.spin-down-arrow'));
                $(this.$('.spin-up-arrow').parent()).append(this.$('.spin-up-arrow'));
            }
            else if (this.alignType === MathInteractives.global.CustomSpinner.LEFT_ALIGN) {
                // Direct Access of spinner DOM to arrange elements in left alignment.
                $(this.$('.spin-down-arrow').parent()).append(this.$('.spin-down-arrow'));
            }

            this.createAccDiv(this.model.getTextAccObj());
            this.setAccMessage(this.model.getTextAccId(), this.model.getDefaultAccText(), this.defaultAllPlaceHolderValues);
            this.focusOut(this.model.getTextAccId(), function () {
                if (!self.isEditable) {
                    self.setAccMessage(self.model.getTextAccId(), self.model.getDefaultAccText(), self.defaultAllPlaceHolderValues);
                }
            });
        },

        /**
        * Sets the place holder values depending on whether to consider the place holder value or not
        *
        * @method _setPlaceHolderValues
        * @param {Array of Strings} placeHoldersToConsider Array of place holders to be considered
        * @param {Array of Numbers} placeHolderValues Array holding the place holder values
        * @private
        */
        _setPlaceHolderValues: function _setPlaceHolderValues(placeHoldersToConsider, placeHolderValues) {
            this._setPlaceHolderValue(placeHoldersToConsider, MathInteractives.global.CustomSpinner.PREV_VAL, placeHolderValues, Number(this.previousValue));
            this._setPlaceHolderValue(placeHoldersToConsider, MathInteractives.global.CustomSpinner.CURR_VAL, placeHolderValues, Number(this.currentValue));
            this._setPlaceHolderValue(placeHoldersToConsider, MathInteractives.global.CustomSpinner.MIN_VAL, placeHolderValues, Number(this.minValue));
            this._setPlaceHolderValue(placeHoldersToConsider, MathInteractives.global.CustomSpinner.MAX_VAL, placeHolderValues, Number(this.maxValue));
            if (this.isEditable) {
                this._setPlaceHolderValue(placeHoldersToConsider, MathInteractives.global.CustomSpinner.CURR_VAL, placeHolderValues, Number(this.$('.spinbox .spinner-input-box').val()));
            }
        },

        /**
        * Sets the place holder value in the placeHolderValues array depending on whether to consider the place holder value or not
        *
        * @method _setPlaceHolderValues
        * @param {Array of Strings} placeHolders Array of place holders to be considered
        * @param {String} placeHolder Place holder for which corresponding value to be set
        * @param {Array of Numbers} placeHolderValues Array holding the place holder values
        * @param {Number} newValue New value for the corresponding place holder
        * @private
        */
        _setPlaceHolderValue: function _setPlaceHolderValue(placeHolders, placeHolder, placeHolderValues, newValue) {
            var index = placeHolders.indexOf(placeHolder);
            if (index >= 0) {
                placeHolderValues[index] = newValue;
            }
        },

        /**
        * Setting alignments & other css properties of elements
        *
        * @method _setAlignments
        * @private
        **/
        _setAlignments: function _setAlignments() {
            var self = this,
                $spinBoxUpButtonJObj = this.$el.find('.spin-up-arrow'),
                $spinBoxDownButtonJObj = this.$el.find('.spin-down-arrow');

            this._generateButtons();
            this.setSpinBoxValue(this.spinValue);

            if (this.spinValue === null) {
                this.$('.spinner-input-box').val(MathInteractives.global.CustomSpinner.DEFAULT_VALUE);
            }

            var intvalueDown = 0, intvalueUp = 0;
            clearInterval(intvalueDown);
            clearInterval(intvalueUp);

            $spinBoxDownButtonJObj.mousedown(function () {
                clearInterval(self.btnInterval);
                if (self.downBtn.getButtonState() != MathInteractives.global.Button.BUTTON_STATE_DISABLED) {
                    self.$el.find('.spin-down-arrow').unbind('click');
                    if ((event !== undefined && (typeof event.which !== 'undefined' && event.which === 1)) || (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile)) {
                        //intvalueDown = setInterval($.proxy(self.spinDownArrowClick, self), 500);
                        self.btnInterval = setInterval($.proxy(self.spinDownArrowClick, self), 500);
                    }
                }
                else {
                    self.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(self.spinDownArrowClick, self));
                }
            }).on('touchstart', function () {
                clearInterval(self.btnInterval);
                if (self.downBtn.getButtonState() != MathInteractives.global.Button.BUTTON_STATE_DISABLED) {
                    self.$el.find('.spin-down-arrow').unbind('click');
                    //intvalueDown = setInterval($.proxy(self.spinDownArrowClick, self), 500);
                    self.btnInterval = setInterval($.proxy(self.spinDownArrowClick, self), 500);
                }
                else {
                    self.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(self.spinDownArrowClick, self));
                }
            }).mouseup(function () {
                clearInterval(self.btnInterval);
                self.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(self.spinDownArrowClick, self));
            }).mouseout(function () {
                clearInterval(self.btnInterval);
                self.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(self.spinDownArrowClick, self));
            }).on('touchend', function () {
                clearInterval(self.btnInterval);
                self.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(self.spinDownArrowClick, self));
            });

            $spinBoxUpButtonJObj.mousedown(function () {
                clearInterval(self.btnInterval);
                if (self.upBtn.getButtonState() != MathInteractives.global.Button.BUTTON_STATE_DISABLED) {
                    self.$el.find('.spin-up-arrow').unbind('click');
                    self.btnInterval = setInterval($.proxy(self.spinUpArrowClick, self), 500);
                }
                else {
                    self.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(self.spinUpArrowClick, self));
                }
            }).on('touchstart', function () {
                clearInterval(self.btnInterval);
                if (self.upBtn.getButtonState() != MathInteractives.global.Button.BUTTON_STATE_DISABLED) {
                    self.$el.find('.spin-up-arrow').unbind('click');
                    self.btnInterval = setInterval($.proxy(self.spinUpArrowClick, self), 500);
                }
                else {
                    self.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(self.spinUpArrowClick, self));
                }
            }).mouseup(function () {
                clearInterval(self.btnInterval);
                self.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(self.spinUpArrowClick, self));
            }).mouseout(function () {
                clearInterval(self.btnInterval);
                self.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(self.spinUpArrowClick, self));
            }).on('touchend', function () {
                clearInterval(self.btnInterval);
                self.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(self.spinUpArrowClick, self));
            });
        },

        /**
        *   Method to Generate Up & Down navigation Buttons
        *
        * @method _generateButtons
        * @private
        */
        _generateButtons: function _generateButtons() {
            var currentModel = this.model,
                upArrowAccText = currentModel.getUpArrowAccText(),
                downArrowAccText = currentModel.getDownArrowAccText();

            upArrowAccText = (upArrowAccText !== null) ? upArrowAccText : this.getAccMessage('up-arrow-acc-text', 0);
            downArrowAccText = (downArrowAccText !== null) ? downArrowAccText : this.getAccMessage('down-arrow-acc-text', 0);
            currentModel.setUpArrowAccText(upArrowAccText);
            currentModel.setDownArrowAccText(downArrowAccText);

            var upBtn = {
                id: this.spinBoxId + '-up-arrow',
                type: MathInteractives.Common.Components.Views.Button.TYPE.ACTION_ZOOM_IN,
                width: 32,
                path: this._path
            };
            this.upBtn = MathInteractives.global.Button.generateButton(upBtn);

            var downBtn = {
                id: this.spinBoxId + '-down-arrow',
                type: MathInteractives.Common.Components.Views.Button.TYPE.ACTION_ZOOM_OUT,
                width: 32,
                path: this._path

            };
            this.downBtn = MathInteractives.global.Button.generateButton(downBtn);

            this.$('.spin-down-arrow .button-icon').addClass('spinner-minus-btn');
            this.$('.spin-up-arrow .button-icon').addClass('spinner-plus-btn');

            currentModel.setButtonAccText();
            this.createAccDiv(currentModel.getUpArrowAccObj());
            this.createAccDiv(currentModel.getDownArrowAccObj());
        },

        /**
        *   Method to Set Spin Box Value
        *
        * @method setSpinBoxValue
        * @param spinBoxId {String} spin box container id
        * @param spinValue {String} value which is to set in spinner
        */
        setSpinBoxValue: function setSpinBoxValue(spinValue) {
            var self = this;
            var minValue = self.minValue;
            var maxValue = self.maxValue;
            var showSign = self.spinSign;
            var spinBoxId = this.spinBoxId;


            if (spinValue >= minValue && spinValue <= maxValue && !this.disableSpin) {

                this.currentValue = (this.spinSign) ? self.getSpinBoxSignValue(spinValue) : spinValue;
                if (this.isEditable) {
                    if (this.currentValue === null) {
                        this.$('.spinner-input-box').val(MathInteractives.global.CustomSpinner.DEFAULT_VALUE);
                        this.setAccMessage(this.model.getTextAccId(), this.model.getEmptySpinnerAccText(), this.emptySpinnerPlaceHolderValues);
                    }
                    else {
                        this.$('.spinner-input-box').val(this.currentValue);
                    }
                }
                else {
                    this.setMessage(this.screenId + '-text', this.currentValue);
                }

                if (minValue == spinValue) {
                    if (this.upBtn.getButtonState() !== MathInteractives.global.Button.BUTTON_STATE_ACTIVE) {
                        this._enableBtn(this.upBtn, this.model.getUpArrowAccId());
                    }
                    this._disableBtn(this.downBtn, this.model.getDownArrowAccId());

                    this.$el.find('.spin-down-arrow').unbind('click');
                    this.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(this.spinUpArrowClick, this));
                }
                else if (maxValue == spinValue) {
                    this._disableBtn(this.upBtn, this.model.getUpArrowAccId());
                    if (this.downBtn.getButtonState() !== MathInteractives.global.Button.BUTTON_STATE_ACTIVE) {
                        this._enableBtn(this.downBtn, this.model.getDownArrowAccId());
                    }

                    this.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(this.spinDownArrowClick, this));
                    this.$el.find('.spin-up-arrow').unbind('click');
                }
                else {
                    if (this.upBtn.getButtonState() !== MathInteractives.global.Button.BUTTON_STATE_ACTIVE) {
                        this._enableBtn(this.upBtn, this.model.getUpArrowAccId());
                    }
                    if (this.downBtn.getButtonState() !== MathInteractives.global.Button.BUTTON_STATE_ACTIVE) {
                        this._enableBtn(this.downBtn, this.model.getDownArrowAccId());
                    }

                    this.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(this.spinDownArrowClick, this));
                    this.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(this.spinUpArrowClick, this));
                }
                //this.trigger(MathInteractives.global.CustomSpinner.VALUE_CHANGED);
            }
            else {
                //console.log("incorrect value");
            }
        },

        /**
        * Method to get Spin Box Value
        *
        * @method getSpinBoxValue
        * @param spinBoxId {String} spin box container id
        **/
        getSpinBoxValue: function getSpinBoxValue() {
            var spinValue = this.currentValue;
            if (spinValue != null && spinValue != undefined) {
                return Number(spinValue);
            }
            else {
                return null;
            }
        },

        /**
        * Enabling Spin Box
        *
        * @method enableSpinBox
        **/
        enableSpinBox: function enableSpinBox() {
            var oSpinBoxTextJObj = this.$el.find('.spin-textbox');
            var oSpinBoxUpButtonJObj = this.$el.find('.spin-up-arrow');
            var oSpinBoxDownButtonJObj = this.$el.find('.spin-down-arrow');
            var spinBoxValue = this.getSpinBoxValue()

            var iMin = this.minValue;
            var iMax = this.maxValue;
            //var iValue = parseInt(oSpinBoxTextJObj.text());
            var iValue = Number(this.currentValue);

            this.$el.removeClass('disabled');
            this.$('.spin-textbox').removeClass('disabled-spin-box');
            if (this.isEditable) {
                this.$('.spinner-input-box').removeAttr('disabled');
            }
            if (spinBoxValue > iMin) {
                this._enableBtn(this.downBtn, this.model.getDownArrowAccId());
            }

            if (spinBoxValue < iMax) {
                this._enableBtn(this.upBtn, this.model.getUpArrowAccId());
            }

            this.disableSpin = false;
            this.enableTab(this.model.getTextAccId(), true);
            /*
            if (self.manager) {
            self.manager.enableTab(self.spinBoxId, true);
            }
            */
            this.setSpinBoxValue(this.currentValue);

            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                this.$el.find('.spin-down-arrow-touch').unbind('click').bind('click', function () {
                    this.$el.find('.spin-down-arrow').trigger('click')
                });
                this.$el.find('.spin-up-arrow-touch').unbind('click').bind('click', function () {
                    this.$el.find('.spin-up-arrow').trigger('click')
                });
            }
        },

        /**
        * Enabling Disabling Box
        *
        * @method disableSpinBox
        **/
        disableSpinBox: function disableSpinBox() {
            this.$el.addClass('disabled');
            this.disableSpin = true;

            this._disableBtn(this.upBtn, this.model.getUpArrowAccId());
            this._disableBtn(this.downBtn, this.model.getDownArrowAccId());

            this.$('.spin-textbox').addClass('disabled-spin-box');

            if (this.isEditable) {
                this.$('.spinner-input-box').attr('disabled', 'disabled');
            }
            this.enableTab(this.model.getTextAccId(), false);
            /*
            if (self.manager) {
            self.manager.enableTab(self.spinBoxId, false);
            }
            */
            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                this.$el.find('.spin-down-arrow-touch').unbind('click');
                this.$el.find('.spin-up-arrow-touch').unbind('click');
            }
        },

        /**
        * get Sign Value of Spin box
        *
        * @method getSpinBoxSignValue
        * @param value {String} value in spinner
        **/
        getSpinBoxSignValue: function getSpinBoxSignValue(value) {
            if (value >= 0) {
                return '+' + value;
            }
            else {
                return value;
            }
        },

        /**
        * Method to be called when spin up is fired
        *
        * @method spinUpArrowClick
        **/
        spinUpArrowClick: function spinUpArrowClick() {
            if (this.upBtn.getButtonState() === 'disabled') {
                return;
            }

            var iMax = this.maxValue,
                iStep = this.stepValue,
                iCurrentValue = Number(this.currentValue),
                bShowSign = this.spinSign,
                numberSplit;

            MathInteractives.global.SpeechStream.stopReading();

            if (this.isEditable) {
                this.validateInputValue(this.$('.spinner-input-box').val());
                iCurrentValue = Number(this.currentValue)
            }

            //If maximum value of spinner is less than current value in spinner,
            //on click of plus button, we have to show lowest limit and disable the button.
            if (iCurrentValue > iMax) {
                iCurrentValue = iMax - 1;
            }

            this._enableBtn(this.downBtn, this.model.getDownArrowAccId());
            if (iCurrentValue < iMax) {
                var iTemp = Number(iCurrentValue) + Number(iStep);
                if (this.inputPrecision !== null) {
                    iTemp = iTemp.toFixed(this.inputPrecision);
                    numberSplit = String(iTemp).split('.');
                    if (Number(numberSplit[1]) === 0) {
                        iTemp = parseInt(iTemp);
                    }
                }
                this.previousValue = this.currentValue;
                this.currentValue = (bShowSign) ? this.getSpinBoxSignValue(iTemp) : iTemp;
                this.validateInputValue(this.currentValue);
                if (this.isEditable) {
                    this.$('.spinner-input-box').val(this.currentValue);
                }
            }
            this._setPlaceHolderValue(this.model.getDefaultPlaceHolders(), MathInteractives.global.CustomSpinner.PREV_VAL, this.defaultAllPlaceHolderValues, Number(this.previousValue));
            this._setPlaceHolderValue(this.model.getDefaultPlaceHolders(), MathInteractives.global.CustomSpinner.CURR_VAL, this.defaultAllPlaceHolderValues, Number(this.currentValue));
            this._setPlaceHolderValue(this.model.getOnIncreasePlaceHolders(), MathInteractives.global.CustomSpinner.PREV_VAL, this.onIncreaseAllPlaceHolderValues, Number(this.previousValue));
            this._setPlaceHolderValue(this.model.getOnIncreasePlaceHolders(), MathInteractives.global.CustomSpinner.CURR_VAL, this.onIncreaseAllPlaceHolderValues, Number(this.currentValue));
            this.setAccMessage(this.model.getTextAccId(), this.model.getOnIncreaseAccText(), this.onIncreaseAllPlaceHolderValues);

            // old code is wrong.. in place of -1 der should b step

            if (iCurrentValue == (iMax - 1)) {
                this._disableBtn(this.upBtn, this.model.getUpArrowAccId());
                clearInterval(this.btnInterval);
                this.$el.find('.spin-up-arrow').unbind('click');
                this.setAccMessage(this.model.getTextAccId(), this.model.getMaxLimitAccText(), this.maxLimitAllPlaceHolderValues);
            }

            this.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(this.spinDownArrowClick, this));
            this.trigger(MathInteractives.global.CustomSpinner.VALUE_CHANGED, { actionPerformed: MathInteractives.global.CustomSpinner.BUTTON_CLICK });
            this.model.setButtonState('active');
            this.setFocus(this.screenId + '-text');
        },

        /**
        * Method to be called when spin down is fired
        *
        * @method spinDownArrowClick
        **/
        spinDownArrowClick: function spinDownArrowClick() {
            if (this.downBtn.getButtonState() === 'disabled') {
                return;
            }

            var iMin = this.minValue,
                iStep = this.stepValue,
                iCurrentValue = Number(this.currentValue),
                bShowSign = this.spinSign,
                numberSplit;

            MathInteractives.global.SpeechStream.stopReading();

            if (this.isEditable) {
                this.validateInputValue(this.$('.spinner-input-box').val());
                iCurrentValue = Number(this.currentValue)
            }

            //If minimum value of spinner is less than current value in spinner,
            //on click of minus button, we have to show lowest limit and disable the button.
            if (iCurrentValue < iMin) {
                iCurrentValue = iMin + 1;
            }

            this._enableBtn(this.upBtn, this.model.getUpArrowAccId());
            if (iCurrentValue > iMin) {
                this.previousValue = this.currentValue;
                this.currentValue = (bShowSign) ? this.getSpinBoxSignValue(iCurrentValue - iStep) : iCurrentValue - iStep;
                if (this.inputPrecision !== null) {
                    this.currentValue = this.currentValue.toFixed(this.inputPrecision);
                    numberSplit = String(this.currentValue).split('.');
                    if (parseInt(numberSplit[1]) === 0) {
                        this.currentValue = parseInt(this.currentValue);
                    }
                }
                this.validateInputValue(this.currentValue);
                if (this.isEditable) {
                    this.$('.spinner-input-box').val(this.currentValue);
                }
                else {
                    this.setMessage(this.screenId + '-text', this.currentValue);
                }
            }
            this._setPlaceHolderValue(this.model.getDefaultPlaceHolders(), MathInteractives.global.CustomSpinner.PREV_VAL, this.defaultAllPlaceHolderValues, Number(this.previousValue));
            this._setPlaceHolderValue(this.model.getDefaultPlaceHolders(), MathInteractives.global.CustomSpinner.CURR_VAL, this.defaultAllPlaceHolderValues, Number(this.currentValue));
            this._setPlaceHolderValue(this.model.getOnDecreasePlaceHolders(), MathInteractives.global.CustomSpinner.PREV_VAL, this.onDecreaseAllPlaceHolderValues, Number(this.previousValue));
            this._setPlaceHolderValue(this.model.getOnDecreasePlaceHolders(), MathInteractives.global.CustomSpinner.CURR_VAL, this.onDecreaseAllPlaceHolderValues, Number(this.currentValue));
            this.setAccMessage(this.model.getTextAccId(), this.model.getOnDecreaseAccText(), this.onDecreaseAllPlaceHolderValues);

            if (iCurrentValue === (iMin + 1)) {
                this._disableBtn(this.downBtn, this.model.getDownArrowAccId());
                clearInterval(this.btnInterval);
                this.$el.find('.spin-down-arrow').unbind('click');
                this.setAccMessage(this.model.getTextAccId(), this.model.getMinLimitAccText(), this.minLimitAllPlaceHolderValues);
            }

            this.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(this.spinUpArrowClick, this));

            this.trigger(MathInteractives.global.CustomSpinner.VALUE_CHANGED, { actionPerformed: MathInteractives.global.CustomSpinner.BUTTON_CLICK });
            this.model.setButtonState('active');
            this.setFocus(this.screenId + '-text');
        },

        /**
        * Enables the button
        *
        * @method _enableBtn
        * @param {Object} btn Button to be enabled
        * @param {String} accId Accessibility Id for the button to be enabled
        **/
        _enableBtn: function _enableBtn(btn, accId) {
            btn.setButtonState(MathInteractives.global.Button.BUTTON_STATE_ACTIVE);
            if (accId !== null && accId !== 'undefined') {
                this.enableTab(accId, true);
            }
        },

        /**
        * Disables the button
        *
        * @method _disableBtn
        * @param {Object} btn Button to be disabled
        * @param {String} accId Accessibility Id for the button to be disabled
        **/
        _disableBtn: function _disableBtn(btn, accId) {
            btn.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED)
            if (accId !== null && accId !== 'undefined') {
                this.enableTab(accId, false);
            }
        },

        /**
        *  Event handlers of dom elements
        *
        * @property events
        * @type Object
        */
        events: {
            'focusout .spinbox .spinner-input-box': '_spinBoxInputFocusOut',
            'focusin .spinbox .spinner-input-box': '_spinBoxInputFocusIn',
            //'keyup .spinbox .spinner-input-box': '_spinBoxInputKeyPress'
        },

        /**
        * Handler for focus out event on Spin Box
        *
        * @method _spinBoxInputFocusOut
        * @private
        */
        _spinBoxInputFocusOut: function _spinBoxInputFocusOut() {
            var inputValue,
                inputBoxElement = this.$('.spinner-input-box');

            inputValue = inputBoxElement.val();
            if (inputValue !== '') {
                inputValue = Number(inputValue);
                this.spinValue = inputValue;
                if (!isNaN(inputValue)) {
                    this._setPlaceHolderValues(this.model.getDefaultPlaceHolders(), this.defaultAllPlaceHolderValues);
                    this.setAccMessage(this.model.getTextAccId(), this.model.getDefaultAccText(), this.defaultAllPlaceHolderValues);
                }
                else {
                    this.setAccMessage(this.model.getTextAccId(), this.model.getEmptySpinnerAccText(), this.emptySpinnerPlaceHolderValues);
                }
            }
            else {
                this.spinValue = null;
                inputValue = this.spinValue;
                this.validateInputValue(inputValue);
                this.setAccMessage(this.model.getTextAccId(), this.model.getEmptySpinnerAccText(), this.emptySpinnerPlaceHolderValues);
            }
            //this.validateInputValue(inputValue);
            this.trigger(MathInteractives.global.CustomSpinner.VALUE_CHANGED, { actionPerformed: MathInteractives.global.CustomSpinner.FOCUS_OUT });
            //if (this.upBtn.getButtonState() === MathInteractives.global.Button.BUTTON_STATE_ACTIVE) {
            //    this.setFocus(this.screenId + '-up-arrow');
            //}
        },

        /**
        * Handler for focus in event on spinner input box
        * @method _spinBoxInputFocusIn
        * @param {Object} event Event on the textbox
        * @private
        */
        _spinBoxInputFocusIn: function _spinBoxInputFocusIn(event) {
            var inputValue,
                keyCode = event.which || event.keyCode,
                inputElement = this.$('#' + event.currentTarget.id);

            this.isFocusedPress = true;
            if (inputElement.val() === MathInteractives.global.CustomSpinner.DEFAULT_VALUE) {
                inputElement.val('');
            }
        },

        /**
        * Event called on keypress of spinner text box.
        *
        * @method spinBoxInputKeyPress
        * @param {Object} event Event on the textbox
        */
        _spinBoxInputKeyPress: function _spinBoxInputKeyPress(event) {
            var keyCode = event.which || event.keyCode,
                inputElement = this.$('#' + event.currentTarget.id),
                inputValue = inputElement.val();

            //// If 'enter' is clicked, validate the input value
            //if (event.keyCode === 13 && inputValue !== '') {
            //    inputValue = Number(inputElement.val());
            //this.validateInputValue(inputValue);
            //}

            // Disable minus button if the value entered is less than minimum limit of the spinner.
            if (inputValue <= this.minValue) {
                this._enableBtn(this.upBtn, this.model.getUpArrowAccId());
                this.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(this.spinUpArrowClick, this));
                this._disableBtn(this.downBtn, this.model.getDownArrowAccId());
                this.$el.find('.spin-down-arrow').unbind('click');
            }
            // Disable plus button if the value entered is more than maximum limit of the spinner.
            else if (inputValue >= this.maxValue) {
                this._disableBtn(this.upBtn, this.model.getUpArrowAccId());
                this.$el.find('.spin-up-arrow').unbind('click');
                this._enableBtn(this.downBtn, this.model.getDownArrowAccId());
                this.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(this.spinDownArrowClick, this));
            }
            // Enable spinner buttons if the value entered is in range of the spinner limits.
            else {
                this._enableBtn(this.upBtn, this.model.getUpArrowAccId());
                this.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(this.spinUpArrowClick, this));
                this._enableBtn(this.downBtn, this.model.getDownArrowAccId());
                this.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(this.spinDownArrowClick, this));
            }

            if (this.isFocusedPress) {
                this.isFocusedPress = false;
                if (keyCode === $.ui.keyCode.ENTER) {
                    return;
                }
            }
            this.trigger(MathInteractives.global.CustomSpinner.VALUE_CHANGED, {
                actionPerformed: MathInteractives.global.CustomSpinner.KEY_PRESS,
                keyCode: keyCode
            });
        },

        /**
        * Validate the input value to be in range specified
        *
        * @method validateInputValue
        * @param {Number} inputValue Number enetered by the user
        */
        validateInputValue: function validateInputValue(inputValue) {
            var validatedValue;
            if (this.minValue !== null && this.maxValue !== null) {
                validatedValue = (inputValue < this.minValue) ? this.minValue : (inputValue > this.maxValue) ? this.maxValue : inputValue;
            }
            else if (this.minValue !== null) {
                validatedValue = (inputValue < this.minValue) ? this.minValue : inputValue;
            }
            else if (this.maxValue !== null) {
                validatedValue = (inputValue > this.maxValue) ? this.maxValue : inputValue
            }

            this.setSpinBoxValue(validatedValue);
        },

        /**
        * Sets focus on spinner text element.
        * @method setFocusOnSpinnerText
        * @public
        */
        setFocusOnSpinner: function setFocusOnSpinner() {
            this.setFocus(this.model.getTextAccId(), 10);
        },

        /**
        * Sets the default accessibility text and place holders for the input box
        * @method setDefaultAcc
        * @param {String} defaultAccText Accessibility text for the input box
        * @param {Array of Strings} [defaultPlaceHolders] Place holders for the default accessibility text
        * @public
        */
        setEmptySpinnerAcc: function setEmptySpinnerAcc(emptySpinnerAccText, emptySpinnerPlaceHolders) {
            if (emptySpinnerAccText !== null && typeof (emptySpinnerAccText) !== 'undefined') {
                this.model.setEmptySpinnerAccText(emptySpinnerAccText);
            }
            if (emptySpinnerPlaceHolders !== null && typeof (emptySpinnerPlaceHolders) !== 'undefined') {
                this.model.setEmptySpinnerPlaceHolders(emptySpinnerPlaceHolders);
            }
        },

        /**
        * Gets the spinner up button state
        * @method getUpButtonState
        * @return {String} Spinner up button state
        * @public
        **/
        getUpButtonState: function getUpButtonState() {
            return this.upBtn.getButtonState();
        },

        /**
        * Gets the spinner down button state
        * @method getDownButtonState
        * @return {String} Spinner down button state
        * @public
        **/
        getDownButtonState: function getDownButtonState() {
            return this.downBtn.getButtonState();
        },

        /**
        * Gets the custom spinner model
        * @method getModel
        * @return {Object} Spinner model
        * @public
        **/
        getModel: function getModel() {
            return this.model;
        },

        /**
        * Sets the default accessibility text and place holders for the input box
        * @method setDefaultAcc
        * @param {String} defaultAccText Accessibility text for the input box
        * @param {Array of Strings} [defaultPlaceHolders] Place holders for the default accessibility text
        * @public
        */
        setDefaultAcc: function setDefaultAcc(defaultAccText, defaultPlaceHolders) {
            if (defaultAccText !== null && typeof (defaultAccText) !== 'undefined') {
                this.model.setDefaultAccText(defaultAccText);
            }
            if (defaultPlaceHolders !== null && typeof (defaultPlaceHolders) !== 'undefined') {
                this.model.setDefaultPlaceHolders(defaultPlaceHolders);
            }
        },

        /**
        * Sets the minimum limit accessibility text and place holders for the input box
        * @method setMinLimitAcc
        * @param {String} minLimitAccText Accessibility text for the input box
        * @param {Array of Strings} [minLimitPlaceHolders] Place holders for the minimum limit accessibility text
        * @public
        */
        setMinLimitAcc: function setMinLimitAcc(minLimitAccText, minLimitPlaceHolders) {
            if (minLimitAccText !== null && typeof (minLimitAccText) !== 'undefined') {
                this.model.setMinLimitAccText(minLimitAccText);
            }
            if (minLimitPlaceHolders !== null && typeof (minLimitPlaceHolders) !== 'undefined') {
                this.model.setMinLimitPlaceHolders(minLimitPlaceHolders);
            }
        },

        /**
        * Sets the maximum limit accessibility text and place holders for the input box
        * @method setMaxLimitAcc
        * @param {String} maxLimitAccText Accessibility text for the input box
        * @param {Array of Strings} [maxLimitPlaceHolders] Place holders for the maximum limit accessibility text
        * @public
        */
        setMaxLimitAcc: function setMaxLimitAcc(maxLimitAccText, maxLimitPlaceHolders) {
            if (maxLimitAccText !== null && typeof (maxLimitAccText) !== 'undefined') {
                this.model.setMaxLimitAccText(maxLimitAccText);
            }
            if (maxLimitPlaceHolders !== null && typeof (maxLimitPlaceHolders) !== 'undefined') {
                this.model.setMaxLimitPlaceHolders(maxLimitPlaceHolders);
            }
        },

        /**
        * Sets the on-decrease accessibility text and place holders for the input box
        * @method setOnDecreaseAcc
        * @param {String} onDecreaseAccText Accessibility text for the input box
        * @param {Array of Strings} [onDecreasePlaceHolders] Place holders for the on-decrease accessibility text
        * @public
        */
        setOnDecreaseAcc: function setOnDecreaseAcc(onDecreaseAccText, onDecreasePlaceHolders) {
            if (onDecreaseAccText !== null && typeof (onDecreaseAccText) !== 'undefined') {
                this.model.setOnDecreaseAccText(onDecreaseAccText);
            }
            if (onDecreasePlaceHolders !== null && typeof (onDecreasePlaceHolders) !== 'undefined') {
                this.model.setOnDecreasePlaceHolders(onDecreasePlaceHolders);
            }
        },

        /**
        * Sets the on-increase accessibility text and place holders for the input box
        * @method setOnIncreaseAcc
        * @param {String} onIncreaseAccText Accessibility text for the input box
        * @param {Array of Strings} [onIncreasePlaceHolders] Place holders for the on-increase accessibility text
        * @public
        */
        setOnIncreaseAcc: function setOnIncreaseAcc(onIncreaseAccText, onIncreasePlaceHolders) {
            if (onIncreaseAccText !== null && typeof (onIncreaseAccText) !== 'undefined') {
                this.model.setOnIncreaseAccText(onIncreaseAccText);
            }
            if (onIncreasePlaceHolders !== null && typeof (onIncreasePlaceHolders) !== 'undefined') {
                this.model.setOnIncreasePlaceHolders(onIncreasePlaceHolders);
            }
        },

        /**
        * Sets the up arrow accessibility text
        * @method setUpArrowAccText
        * @param {String} upArrowAccText Accessibility text for the up arrow
        * @public
        */
        setUpArrowAccText: function setUpArrowAccText(upArrowAccText) {
            if (upArrowAccText !== null && typeof (upArrowAccText) !== 'undefined') {
                this.model.setUpArrowAccText(upArrowAccText);
            }
        },

        /**
        * Sets the down arrow accessibility text
        * @method setDownArrowAccText
        * @param {String} downArrowAccText Accessibility text for the down arrow
        * @public
        */
        setDownArrowAccText: function setDownArrowAccText(downArrowAccText) {
            if (downArrowAccText !== null && typeof (downArrowAccText) !== 'undefined') {
                this.model.setDownArrowAccText(downArrowAccText);
            }
        }
    },
    {
        /**
        * Generates a spinner element on to the screen
        * @method generateCustomSpinner
        * @param {Object} options Properties required to generate a spinner
        * @static
        */
        generateCustomSpinner: function (options) {
            if (options) {
                var customSpinnerModel = new MathInteractives.Common.Components.Models.CustomSpinner(options);
                var customSpinnerView = new MathInteractives.Common.Components.Views.CustomSpinner({
                    model: customSpinnerModel,
                    el: '#' + options.spinId
                });

                return customSpinnerView;
            }
        },

        /**
        * Constant holding custom event name fired on spinner value change.
        * @property VALUE_CHANGED
        * @static
        */
        VALUE_CHANGED: 'value-changed',
        /**
        * Constant action name fired on spinner button click.
        * @property BUTTON_CLICK
        * @static
        */
        BUTTON_CLICK: 'button-click',
        /**
        * Constant action name fired on spinner text-box focus out.
        * @property FOCUS_OUT
        * @static
        */
        FOCUS_OUT: 'focus-out',
        /**
        * Constant action name fired on spinner text-box key press.
        * @property KEY_PRESS
        * @static
        */
        KEY_PRESS: 'key-press',
        /**
        * Constant holding default value for spinner in value is set to null.
        * @property DEFAULT_VALUE
        * @static
        */
        DEFAULT_VALUE: '---',
        /**
        * Constant holding value for spinner alignment with text box in center.
        * @property DEFAULT_ALIGN
        * @static
        */
        CENTER_ALIGN: 'center',
        /**
        * Constant holding value for spinner alignment with text box on top.
        * @property TOP_ALIGN
        * @static
        */
        TOP_ALIGN: 'top',
        /**
        * Constant holding value for spinner alignment with text box on left.
        * @property LEFT_ALIGN
        * @static
        */
        LEFT_ALIGN: 'left',
        /**
        * Constant signifying previous value of spinner
        * @property PREV_VAL
        * @static
        */
        PREV_VAL: 'prev_val',
        /**
        * Constant signifying current value of spinner
        * @property CURR_VAL
        * @static
        */
        CURR_VAL: 'curr_val',
        /**
        * Constant signifying minimum value of spinner
        * @property MIN_VAL
        * @static
        */
        MIN_VAL: 'min_val',
        /**
        * Constant signifying maximum value of spinner
        * @property MAX_VAL
        * @static
        */
        MAX_VAL: 'max_val'
    });

    MathInteractives.global.CustomSpinner = MathInteractives.Common.Components.Views.CustomSpinner;
})();
