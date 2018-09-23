(function () {
    'use strict';

    /**
    * View for rendering Custom Spinner
    *
    * @class CustomSpinner
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Theme2.Views.CustomSpinner = MathInteractives.Common.Player.Views.Base.extend({
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
        * @type Number
        * @default null
        */
        minValue: null,
        /**
        * Maximum Value of Spinner's text
        *
        * @property maxValue
        * @type Number
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
        * @type Number
        * @default null
        */
        spinValue: null,
        /**
        * Height of Spinner
        *
        * @property spinnerHeight
        * @type Number
        * @default null
        */
        spinnerHeight: null,
        /**
        * Width of Spinner
        *
        * @property spinnerWidth
        * @type Number
        * @default null
        */
        spinnerWidth: null,
        /**
        * Sign of Value of Spinner
        *
        * @property spinSign
        * @type Boolean
        * @default false
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
        * Precision values allowed after decimal point.
        *
        * @property inputPrecision
        * @type Number
        * @default null
        */
        inputPrecision: null,
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
        * @default null
        */
        spinnerTextbox: null,

        /**
        * Place holder values for the accessibility text when spinner is empty/null
        *
        * @property emptySpinnerPlaceHolderValues
        * @type Object
        * @default null
        **/
        emptySpinnerPlaceHolderValues: null,

        /**
        * Place holder values for the default accessibility text
        *
        * @property defaultAllPlaceHolderValues
        * @type Object
        * @default null
        **/
        defaultAllPlaceHolderValues: null,

        /**
        * Place holder values for the minimum limit accessibility text
        *
        * @property minLimitAllPlaceHolderValues
        * @type Object
        * @default null
        **/
        minLimitAllPlaceHolderValues: null,

        /**
        * Place holder values for the maximum limit accessibility text
        *
        * @property maxLimitAllPlaceHolderValues
        * @type Object
        * @default null
        **/
        maxLimitAllPlaceHolderValues: null,

        /**
        * Place holder values for the decrease accessibility text
        *
        * @property onDecreaseAllPlaceHolderValues
        * @type Object
        * @default null
        **/
        onDecreaseAllPlaceHolderValues: null,

        /**
        * Place holder values for the increase accessibility text
        *
        * @property onIncreaseAllPlaceHolderValues
        * @type Object
        * @default null
        **/
        onIncreaseAllPlaceHolderValues: null,
        /**
        * Reference to an interval timer variable used for mousedown/touchstart event
        *
        * @property btnInterval
        * @type Number
        * @default null
        */
        btnInterval: null,
        /**
        * Checks whether textbox is focused and at the same time keypress is being fired.
        *
        * @property isFocusedPress
        * @type Boolean
        * @default false
        */
        isFocusedPress: false,

        /**
        * stored user supplied button width.
        *
        * @property buttonWidth
        * @type Number
        * @default null
        */
        buttonWidth: null,

        /**
        * stored user supplied button height.
        *
        * @property buttonHeight
        * @type Number
        * @default null
        */
        buttonHeight: null,

        /**
        * stored user supplied input Box width.
        *
        * @property inputBoxWidth
        * @type Number
        * @default null
        */
        inputBoxWidth: null,

        /**
        * stored user supplied input Box height.
        *
        * @property inputBoxHeight
        * @type Number
        * @default null
        */
        inputBoxHeight: null,

        /**
        * Get data from model & set in view, Calls render
        *
        * @namespace MathInteractives.Common.Components.Views
        * @class CustomSpinner
        * @constructor
        */
        initialize: function initialize() {
            var currentModel = this.model,
                customSpinner = MathInteractives.global.Theme2.CustomSpinner,
                self = this,
                alignType,
                buttonWidth = currentModel.get('buttonWidth'),
                buttonHeight = currentModel.get('buttonHeight'),
                inputBoxHeight = currentModel.get('inputBoxHeight'),
                inputBoxWidth = currentModel.get('inputBoxWidth');

            // Get Values from models
            this.manager = currentModel.getManager();
            this.player = currentModel.getPlayer();
            this.idPrefix = currentModel.getIdPrefix();
            this.spinBoxId = currentModel.getSpinId();
            this.alignType = alignType = currentModel.getAlignType();
            this.minValue = currentModel.getMinValue();
            this.maxValue = currentModel.getMaxValue();
            this.stepValue = currentModel.getStepValue();
            this.buttonWidth = (alignType === customSpinner.VERTICAL_ALIGN || alignType === customSpinner.CENTER_ALIGN || alignType === customSpinner.VERTICAL_RIGHT || alignType === customSpinner.VERTICAL_LEFT) ? buttonWidth !== null && typeof buttonWidth !== 'undefined' ? buttonWidth : 43 : 30;
            this.buttonHeight = (alignType === customSpinner.VERTICAL_ALIGN || alignType === customSpinner.CENTER_ALIGN || alignType === customSpinner.VERTICAL_RIGHT || alignType === customSpinner.VERTICAL_LEFT) ? buttonHeight !== null && typeof buttonHeight !== 'undefined' ? buttonHeight : 31 : 30;
            this.inputBoxWidth = (alignType === customSpinner.VERTICAL_ALIGN || alignType === customSpinner.CENTER_ALIGN || alignType === customSpinner.VERTICAL_RIGHT || alignType === customSpinner.VERTICAL_LEFT) ? inputBoxWidth !== null && typeof inputBoxWidth !== 'undefined' ? inputBoxWidth : 39 : inputBoxWidth || 66;
            this.inputBoxHeight = (alignType === customSpinner.VERTICAL_ALIGN || alignType === customSpinner.CENTER_ALIGN || alignType === customSpinner.VERTICAL_RIGHT || alignType === customSpinner.VERTICAL_LEFT) ? inputBoxHeight !== null && typeof inputBoxHeight !== 'undefined' ? inputBoxHeight : 34 : inputBoxHeight || 42;
            this.buttonBaseClass = currentModel.get('buttonBaseClass');
            this.downBtnFontAwesomeClass = currentModel.get('downBtnFontAwesomeClass');
            this.upBtnFontAwesomeClass = currentModel.get('upBtnFontAwesomeClass');
            this.spinValue = currentModel.getValue();
            this.spinnerHeight = currentModel.getHeight();
            this.spinnerWidth = currentModel.getWidth();
            this.spinSign = currentModel.getShowSign();
            this.screenId = currentModel.getScreenId();
            this._path = currentModel.getPath();
            this.isEditable = currentModel.getIsEditable();
            this.inputPrecision = currentModel.getInputPrecision();
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
                this.alignType = MathInteractives.global.Theme2.CustomSpinner.CENTER_ALIGN;
            }
            var data = { spinBoxId: this.spinBoxId },
                templateHtml = MathInteractives.Common.Components.templates.theme2CustomSpinner(data);

            this._render(templateHtml);

            this._setAlignments();
        },

        /**
        * Renders the Custom Spinner
        *
        * @method render
        * @private
        * @param template {String} template of customSpin
        */
        _render: function _render(template) {
            var textBoxOptions,
                model = this.model,
                value = model.get('value'),
                customSpinner = MathInteractives.global.Theme2.CustomSpinner,
                downArrowButton = this.$('.spin-down-arrow'),
                textBoxStyle = model.get('textBoxStyle'),
                alignType = this.alignType,
                inputBoxHeight = this.inputBoxHeight,
                self = this,
                inputCustomClass = model.get('inputCustomClass') !== null ? 'spinner-input-box ' + model.get('inputCustomClass') : 'spinner-input-box',
                inputType = model.getInputType(),
                maxCharLength = model.getMaxCharLength();

            this.$el.append(template.trim());

            if (this.isEditable) {
                textBoxOptions = {
                    containerId: this.spinBoxId + '-text',
                    filePath: this._path,
                    manager: this.manager,
                    player: this.player,
                    idPrefix: this.idPrefix,
                    inputType: inputType,
                    customClass: inputCustomClass,
                    precision: this.inputPrecision,
                    maxCharLength: maxCharLength,
                    width: this.inputBoxWidth,
                    height: inputBoxHeight
                };
                if (inputType === MathInteractives.global.Theme2.InputBox.INPUT_TYPE_CUSTOM) {
                    textBoxOptions.regexString = this.inputRegEx;
                }
                if (textBoxStyle != null) {
                    textBoxOptions.style = textBoxStyle;
                }
                this.spinnerTextbox = MathInteractives.global.Theme2.InputBox.createInputBox(textBoxOptions);
                this.$('.spin-textbox,.spin-down-arrow,.spin-up-arrow').addClass('editable-textbox');
            }

            this.$('.spinbox,.spin-textbox,.spin-down-arrow,.spin-up-arrow').addClass(alignType + '-aligned');
            if (alignType === customSpinner.TOP_ALIGN) {
                // Direct Access of spinner DOM to arrange elements in top alignment.
                $(this.$('.spin-down-arrow').parent()).append(this.$('.spin-down-arrow'));
                $(this.$('.spin-up-arrow').parent()).append(this.$('.spin-up-arrow'));
                $('<div style="clear:both" ></div>').insertBefore(this.$('.spin-down-arrow'));
            }
            else if (alignType === customSpinner.LEFT_ALIGN) {
                // Direct Access of spinner DOM to arrange elements in left alignment.
                $(this.$('.spin-down-arrow').parent()).append(this.$('.spin-down-arrow'));
            }
            else if (alignType === customSpinner.VERTICAL_ALIGN) {
                $(this.$('.spin-up-arrow').parent()).prepend(this.$('.spin-up-arrow'));
                $(this.$('.spin-down-arrow').parent()).append(this.$('.spin-down-arrow'));
            }
            else if (this.alignType === customSpinner.VERTICAL_LEFT || this.alignType === customSpinner.VERTICAL_RIGHT) {
                var $buttonContainer = $('<div id=' + this.idPrefix + 'custom-spinner-button-container class="custom-spinner-' + this.alignType + '"></div>'),
                    $inputBoxContainer = $('<div id=' + this.idPrefix + 'custom-spinner-input-box-container class="custom-spinner-input-box-container-' + this.alignType + '"></div>');
                if (this.isEditable === true) {
                    $inputBoxContainer.addClass('editable-input-box');
                }
                if (this.alignType === customSpinner.VERTICAL_LEFT) {
                    $(this.$('.spin-down-arrow').parent()).prepend($buttonContainer);
                    $(this.$('.spin-down-arrow').parent()).append($inputBoxContainer);
                }
                else {
                    $(this.$('.spin-down-arrow').parent()).prepend($inputBoxContainer);
                    $(this.$('.spin-down-arrow').parent()).append($buttonContainer);
                }
                $buttonContainer.append(this.$('.spin-up-arrow'));
                $buttonContainer.append(this.$('.spin-down-arrow'));
                $inputBoxContainer.append(this.$('.spin-textbox'));
                if (this.isEditable === false) {
                    var inputMarginTop = ($inputBoxContainer.height() - this.inputBoxHeight - 2) / 2;
                    $inputBoxContainer.css('margin-top', inputMarginTop + 'px');
                }
            }
            if (this.isEditable) {
                this.createAccDiv(this.model.getTextAccObj());
            }
            else {
                this.$('.spin-textbox').css({ 'height': inputBoxHeight, 'width': this.inputBoxWidth, 'line-height': inputBoxHeight + 'px' });
                this.createAccDiv({
                    "elementId": model.getTextAccId(),
                    "tabIndex": model.getTabIndex(),
                    "acc": value
                });

            }
            this.setAccMessage(this.model.getTextAccId(), this.model.getDefaultAccText(), this.defaultAllPlaceHolderValues);
            this.focusOut(this.model.getTextAccId(), function () {
                if (!self.isEditable) {
                    if (self.currentValue === null) {
                        self.setAccMessage(self.model.getTextAccId(), self.model.getEmptySpinnerAccText(), self.emptySpinnerPlaceHolderValues);
                    }
                    else {
                        self.setAccMessage(self.model.getTextAccId(), self.model.getDefaultAccText(), self.defaultAllPlaceHolderValues);
                    }
                }
            });
        },

        /**
        * Sets the place holder values depending on whether to consider the place holder value or not
        *
        * @method _setPlaceHolderValues
        * @private
        * @param placeHoldersToConsider {Array of Strings} Array of place holders to be considered
        * @param placeHolderValues {Array of Numbers} Array holding the place holder values
        */
        _setPlaceHolderValues: function _setPlaceHolderValues(placeHoldersToConsider, placeHolderValues) {
            this._setPlaceHolderValue(placeHoldersToConsider, MathInteractives.global.Theme2.CustomSpinner.PREV_VAL, placeHolderValues, Number(this.previousValue));
            this._setPlaceHolderValue(placeHoldersToConsider, MathInteractives.global.Theme2.CustomSpinner.CURR_VAL, placeHolderValues, Number(this.currentValue));
            this._setPlaceHolderValue(placeHoldersToConsider, MathInteractives.global.Theme2.CustomSpinner.MIN_VAL, placeHolderValues, Number(this.minValue));
            this._setPlaceHolderValue(placeHoldersToConsider, MathInteractives.global.Theme2.CustomSpinner.MAX_VAL, placeHolderValues, Number(this.maxValue));
            if (this.isEditable) {
                this._setPlaceHolderValue(placeHoldersToConsider, MathInteractives.global.Theme2.CustomSpinner.CURR_VAL, placeHolderValues, Number(this.$('.spinbox .spinner-input-box').val()));
            }
        },

        /**
        * Sets the place holder value in the placeHolderValues array depending on whether to consider the place holder value or not
        *
        * @method _setPlaceHolderValues
        * @private
        * @param placeHolders {Array of Strings} Array of place holders to be considered
        * @param placeHolder {String} Place holder for which corresponding value to be set
        * @param placeHolderValues  {Array of Numbers} Array holding the place holder values
        * @param newValue {Number} New value for the corresponding place holder
        */
        _setPlaceHolderValue: function _setPlaceHolderValue(placeHolders, placeHolder, placeHolderValues, newValue) {
            var index = placeHolders.indexOf(placeHolder);
            if (index >= 0) {
                placeHolderValues[index] = $.isNumeric(newValue) ? MathInteractives.Common.Utilities.Models.Utils.commaSeparateNumber(newValue).result : newValue;
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

            //if (this.spinValue === null) {
            //    var defaultValue = MathInteractives.global.Theme2.CustomSpinner.DEFAULT_VALUE;
            //    this.$('.spinner-input-box').val(defaultValue);
            //    this._disableBtn(this.downBtn);
            //}

            var intvalueDown = 0, intvalueUp = 0;
            clearInterval(intvalueDown);
            clearInterval(intvalueUp);

            $spinBoxDownButtonJObj.mousedown(function (event) {
                clearInterval(self.btnInterval);
                if (self.downBtn.getButtonState() != MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                    self.$el.find('.spin-down-arrow').unbind('click');
                    //intvalueDown = setInterval($.proxy(self.spinDownArrowClick, self), 500);
                    if ((event !== undefined && (typeof event.which !== 'undefined' && event.which === 1)) || (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile)) {
                        self.btnInterval = setInterval($.proxy(self.spinDownArrowClick, self), 500);
                    }
                }
                else {
                    self.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(self.spinDownArrowClick, self));
                }
            }).on('touchstart', function () {
                clearInterval(self.btnInterval);
                if (self.downBtn.getButtonState() != MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
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

            $spinBoxUpButtonJObj.mousedown(function (event) {
                clearInterval(self.btnInterval);
                if (self.upBtn.getButtonState() != MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                    self.$el.find('.spin-up-arrow').unbind('click');

                    if ((event !== undefined && (typeof event.which !== 'undefined' && event.which === 1)) || (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile)) {
                        self.btnInterval = setInterval($.proxy(self.spinUpArrowClick, self), 500);
                    }
                }
                else {
                    self.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(self.spinUpArrowClick, self));
                }
            }).on('touchstart', function () {
                clearInterval(self.btnInterval);
                if (self.upBtn.getButtonState() != MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
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
            var self = this,
                currentModel = this.model,
                customSpinner = MathInteractives.global.Theme2.CustomSpinner,
                buttonType = MathInteractives.global.Theme2.Button.TYPE,
                generateButtonClass = MathInteractives.global.Theme2.Button,
                buttonBaseClass = this.buttonBaseClass,
                _generateSpinnerButton,
                upArrowAccText = currentModel.getUpArrowAccText(),
                width = this.buttonWidth,
                height = this.buttonHeight,
                downArrowAccText = currentModel.getDownArrowAccText(),
                fontColor = currentModel.get('buttonFontColor'),
                fontSize = currentModel.get('buttonFontSize');
            upArrowAccText = (upArrowAccText !== null) ? upArrowAccText : this.getAccMessage('up-arrow-acc-text', 0);
            downArrowAccText = (downArrowAccText !== null) ? downArrowAccText : this.getAccMessage('down-arrow-acc-text', 0);
            currentModel.setUpArrowAccText(upArrowAccText);
            currentModel.setDownArrowAccText(downArrowAccText);

            _generateSpinnerButton = function (btnId, fontAwesomeClass) {
                var btnView = generateButtonClass.generateButton({
                    'player': self.player,
                    'manager': self.manager,
                    'path': self._path,
                    'idPrefix': self.idPrefix,
                    'data': {
                        'id': self.spinBoxId + btnId,
                        'type': buttonType.FA_ICON,
                        'icon': {
                            'faClass': self._path.getFontAwesomeClass(fontAwesomeClass),
                            'fontSize': fontSize,
                            'fontColor': fontColor,
                            'fontWeight': 'normal',
                            'applyIconButtonWrapper': true,
                            'iconButtonWrapperClass': 'custom-spinner-font-awesome-icon-container'
                        },
                        'width': width,
                        'height': height,
                        'baseClass': buttonBaseClass
                    }
                });
                return btnView;
            }

            this.upBtn = _generateSpinnerButton('-up-arrow', this.upBtnFontAwesomeClass);
            this.downBtn = _generateSpinnerButton('-down-arrow', this.downBtnFontAwesomeClass);

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
        * @public
        * @param spinValue {String} value which is to set in spinner
        */
        setSpinBoxValue: function setSpinBoxValue(spinValue) {
            var self = this,
                minValue = this.minValue,
                maxValue = this.maxValue,
                showSign = this.spinSign,
                spinBoxId = this.spinBoxId,
                defaultValue = this.model.get('defaultText');

            if (!this.disableSpin) {
                if (spinValue === null || spinValue === defaultValue) {
                    if (this.isEditable) {
                        this.$('.spinner-input-box').val(defaultValue);
                        this.setAccMessage(this.model.getTextAccId(), this.model.getEmptySpinnerAccText(), this.emptySpinnerPlaceHolderValues);
                    }
                    else {
                        //this.setMessage(this.screenId + '-text', defaultValue);
                        this.$('.spin-value').text(defaultValue);
                        this.setAccMessage(this.model.getTextAccId(), this.model.getEmptySpinnerAccText(), this.emptySpinnerPlaceHolderValues);
                    }
                    this.model.set('value', null);
                    this.currentValue = null;
                    this._disableBtn(this.downBtn);
                }
                else {
                    this.currentValue = (this.spinSign) ? self.getSpinBoxSignValue(spinValue) : spinValue;
                    this.model.set('value', spinValue);
                    if (this.isEditable) {
                        this.$('.spinner-input-box').val(this.currentValue);
                    }
                    else {
                        //this.setMessage(this.screenId + '-text', this.currentValue);
                        this.$('.spin-value').text(this.currentValue);
                    }
                }
                if (minValue == spinValue) {
                    if (this.upBtn.getButtonState() !== MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) {
                        this._enableBtn(this.upBtn, this.model.getUpArrowAccId());
                    }
                    this._disableBtn(this.downBtn, this.model.getDownArrowAccId());

                    this.$el.find('.spin-down-arrow').unbind('click');
                    this.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(this.spinUpArrowClick, this));
                }
                else if (maxValue == spinValue) {
                    this._disableBtn(this.upBtn, this.model.getUpArrowAccId());
                    if (this.downBtn.getButtonState() !== MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) {
                        this._enableBtn(this.downBtn, this.model.getDownArrowAccId());
                    }

                    this.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(this.spinDownArrowClick, this));
                    this.$el.find('.spin-up-arrow').unbind('click');
                }
                else {
                    if (this.upBtn.getButtonState() !== MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) {
                        this._enableBtn(this.upBtn, this.model.getUpArrowAccId());
                    }
                    if (this.downBtn.getButtonState() !== MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE && this.currentValue != null) {
                        this._enableBtn(this.downBtn, this.model.getDownArrowAccId());
                    }

                    this.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(this.spinDownArrowClick, this));
                    this.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(this.spinUpArrowClick, this));
                }
            }
            else { }
        },

        /**
        * Method to get Spin Box Value
        *
        * @method getSpinBoxValue
        * @public
        * @return {String} Spin Box Value
        **/
        getSpinBoxValue: function getSpinBoxValue() {
            var spinValue = this.currentValue;
            if (spinValue != null) {
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
        * @public
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
                this.$('.spinner-input-box').removeAttr('disabled').removeClass('disabled-input-box');
            }

            if (spinBoxValue != null && spinBoxValue > iMin) {
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
        * @public
        **/
        disableSpinBox: function disableSpinBox() {
            this.$el.addClass('disabled');
            this.disableSpin = true;

            this._disableBtn(this.upBtn, this.model.getUpArrowAccId());
            this._disableBtn(this.downBtn, this.model.getDownArrowAccId());

            this.$('.spin-textbox').addClass('disabled-spin-box');

            if (this.isEditable) {
                this.$('.spinner-input-box').attr('disabled', 'disabled').addClass('disabled-input-box');
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
        * @public
        * @param value {String} value in spinner
        * @return {string} sign value of spin box
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
        * @public
        * @param event {Object} click event object
        **/
        spinUpArrowClick: function spinUpArrowClick(event) {
            if (this.upBtn.getButtonState() === 'disabled') {
                return;
            }
            if (event !== undefined && (typeof event.which !== 'undefined' && event.which !== 1)) {
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
                if (this.model.get('isStepper') !== true) {
                    var iTemp = Number(iCurrentValue) + Number(iStep);
                    if (this.inputPrecision !== null) {
                        iTemp = iTemp.toFixed(this.inputPrecision);
                        numberSplit = String(iTemp).split('.');
                        if (Number(numberSplit[1]) === 0) {
                            iTemp = parseInt(iTemp);
                        }
                    }
                }
                else {
                    var stepValues = this.model.get('stepperValues'),
                        stepIndex = this.model.get('currentStepperIndex'),
                        iTemp;
                    if (stepValues[stepIndex + 1]) {
                        iTemp = stepValues[stepIndex + 1];
                        this.model.set('currentStepperIndex', stepIndex + 1);
                    }
                }
                this.previousValue = this.currentValue;
                this.currentValue = (bShowSign) ? this.getSpinBoxSignValue(iTemp) : iTemp;
                this.validateInputValue(this.currentValue);
                if (this.isEditable) {
                    this.$('.spinner-input-box').val(this.currentValue);
                }
            }
            this._setPlaceHolderValue(this.model.getDefaultPlaceHolders(), MathInteractives.global.Theme2.CustomSpinner.PREV_VAL, this.defaultAllPlaceHolderValues, Number(this.previousValue));
            this._setPlaceHolderValue(this.model.getDefaultPlaceHolders(), MathInteractives.global.Theme2.CustomSpinner.CURR_VAL, this.defaultAllPlaceHolderValues, Number(this.currentValue));
            this._setPlaceHolderValue(this.model.getOnIncreasePlaceHolders(), MathInteractives.global.Theme2.CustomSpinner.PREV_VAL, this.onIncreaseAllPlaceHolderValues, Number(this.previousValue));
            this._setPlaceHolderValue(this.model.getOnIncreasePlaceHolders(), MathInteractives.global.Theme2.CustomSpinner.CURR_VAL, this.onIncreaseAllPlaceHolderValues, Number(this.currentValue));
            this.setAccMessage(this.model.getTextAccId(), this.model.getOnIncreaseAccText(), this.onIncreaseAllPlaceHolderValues);

            // old code is wrong.. in place of -1 der should b step

            if (iCurrentValue == (iMax - iStep)) {
                this._disableBtn(this.upBtn, this.model.getUpArrowAccId());
                clearInterval(this.btnInterval);
                this.$el.find('.spin-up-arrow').unbind('click');
                this.setAccMessage(this.model.getTextAccId(), this.model.getMaxLimitAccText(), this.maxLimitAllPlaceHolderValues);
            }

            this.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(this.spinDownArrowClick, this));
            this.trigger(MathInteractives.global.Theme2.CustomSpinner.VALUE_CHANGED, { actionPerformed: MathInteractives.global.Theme2.CustomSpinner.BUTTON_CLICK, buttonType: 'spinner-up' });
            this.model.setButtonState('active');
            this.setFocusOnSpinner();
        },

        /**
        * Method to be called when spin down is fired
        *
        * @method spinDownArrowClick
        * @public
        * @param event {Object} click event object
        **/
        spinDownArrowClick: function spinDownArrowClick(event) {
            if (this.downBtn.getButtonState() === 'disabled') {
                return;
            }
            if (event !== undefined && (typeof event.which !== 'undefined' && event.which !== 1)) {
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
                if (this.model.get('isStepper') !== true) {
                    this.currentValue = (bShowSign) ? this.getSpinBoxSignValue(iCurrentValue - iStep) : iCurrentValue - iStep;
                }
                else {
                    var stepValues = this.model.get('stepperValues'),
                        stepIndex = this.model.get('currentStepperIndex');
                    if (stepValues[stepIndex - 1]) {
                        this.currentValue = stepValues[stepIndex - 1];
                        this.model.set('currentStepperIndex', stepIndex - 1);
                    }
                }

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
                    //this.setMessage(this.screenId + '-text', this.currentValue);
                    this.$('.spin-value').text(this.currentValue);
                }
            }
            this._setPlaceHolderValue(this.model.getDefaultPlaceHolders(), MathInteractives.global.Theme2.CustomSpinner.PREV_VAL, this.defaultAllPlaceHolderValues, Number(this.previousValue));
            this._setPlaceHolderValue(this.model.getDefaultPlaceHolders(), MathInteractives.global.Theme2.CustomSpinner.CURR_VAL, this.defaultAllPlaceHolderValues, Number(this.currentValue));
            this._setPlaceHolderValue(this.model.getOnDecreasePlaceHolders(), MathInteractives.global.Theme2.CustomSpinner.PREV_VAL, this.onDecreaseAllPlaceHolderValues, Number(this.previousValue));
            this._setPlaceHolderValue(this.model.getOnDecreasePlaceHolders(), MathInteractives.global.Theme2.CustomSpinner.CURR_VAL, this.onDecreaseAllPlaceHolderValues, Number(this.currentValue));
            this.setAccMessage(this.model.getTextAccId(), this.model.getOnDecreaseAccText(), this.onDecreaseAllPlaceHolderValues);

            if (iCurrentValue === (iMin + iStep)) {
                this._disableBtn(this.downBtn, this.model.getDownArrowAccId());
                clearInterval(this.btnInterval);
                this.$el.find('.spin-down-arrow').unbind('click');
                this.setAccMessage(this.model.getTextAccId(), this.model.getMinLimitAccText(), this.minLimitAllPlaceHolderValues);
            }

            this.$el.find('.spin-up-arrow').unbind('click').bind('click', $.proxy(this.spinUpArrowClick, this));

            this.trigger(MathInteractives.global.Theme2.CustomSpinner.VALUE_CHANGED, {
                actionPerformed: MathInteractives.global.Theme2.CustomSpinner.BUTTON_CLICK,
                buttonType: 'spinner-down'
            });
            this.model.setButtonState('active');
            this.setFocusOnSpinner();
        },

        /**
        * Enables the button
        *
        * @method _enableBtn
        * @private
        * @param btn {Object} Button to be enabled
        * @param accId {String} Accessibility Id for the button to be enabled
        **/
        _enableBtn: function _enableBtn(btn, accId) {
            btn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
            if (accId != null) {
                this.enableTab(accId, true);
            }
        },

        /**
        * Disables the button
        *
        * @method _disableBtn
        * @private
        * @param btn {Object} Button to be enabled
        * @param accId {String} Accessibility Id for the button to be enabled
        **/
        _disableBtn: function _disableBtn(btn, accId) {
            btn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED)
            if (accId != null) {
                this.enableTab(accId, false);
            }
        },

        /**
        * Backbone property for binding events to DOM elements.
        * @property events
        * @private
        */
        events: {
            'focusout .spinbox .spinner-input-box': '_spinBoxInputFocusOut',
            'focusin .spinbox .spinner-input-box': '_spinBoxInputFocusIn',
            'keyup .spinbox .spinner-input-box': '_spinBoxInputKeyPress'
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
            this.currentValue = (this.spinSign) ? self.getSpinBoxSignValue(inputValue) : inputValue;
            this.trigger(MathInteractives.global.Theme2.CustomSpinner.VALUE_CHANGED, { actionPerformed: MathInteractives.global.Theme2.CustomSpinner.FOCUS_OUT });
            //if (this.upBtn.getButtonState() === MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) {
            //    this.setFocus(this.screenId + '-up-arrow');
            //}
        },

        /**
        * Handler for focus in event on spinner input box
        * @method _spinBoxInputFocusIn
        * @private
        * @param event {Object} Event on the textbox
        */
        _spinBoxInputFocusIn: function _spinBoxInputFocusIn(event) {
            var inputValue,
                keyCode = event.which || event.keyCode,
                inputElement = this.$('#' + event.currentTarget.id);


            this.isFocusedPress = true;
            if (inputElement.val() === this.model.get('defaultText')) {
                inputElement.val('');
            }
        },

        /**
        * Event called on keypress of spinner text box.
        *
        * @method spinBoxInputKeyPress
        * @private
        * @param event {Object} Event on the textbox
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
            this.currentValue = (this.spinSign) ? self.getSpinBoxSignValue(inputValue) : inputValue;
            this.trigger(MathInteractives.global.Theme2.CustomSpinner.VALUE_CHANGED, {
                actionPerformed: MathInteractives.global.Theme2.CustomSpinner.KEY_PRESS,
                keyCode: keyCode
            });
        },

        /**
        * Validate the input value to be in range specified
        *
        * @method validateInputValue
        * @public
        * @param inputValue {Number} Number enetered by the user
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
        * @method setEmptySpinnerAcc
        * @public
        * @param emptySpinnerAccText {String} Accessibility text for the input box
        * @param [emptySpinnerPlaceHolders] {Array of Strings} Place holders for the default accessibility text
        */
        setEmptySpinnerAcc: function setEmptySpinnerAcc(emptySpinnerAccText, emptySpinnerPlaceHolders) {
            if (emptySpinnerAccText != null) {
                this.model.setEmptySpinnerAccText(emptySpinnerAccText);
            }
            if (emptySpinnerPlaceHolders != null) {
                this.model.setEmptySpinnerPlaceHolders(emptySpinnerPlaceHolders);
            }
        },

        /**
        * Gets the spinner up button state
        * @method getUpButtonState
        * @public
        * @return {String} Spinner up button state
        */
        getUpButtonState: function getUpButtonState() {
            return this.upBtn.getButtonState();
        },

        /**
        * Gets the spinner down button state
        * @method getDownButtonState
        * @public
        * @return {String} Spinner down button state
        */
        getDownButtonState: function getDownButtonState() {
            return this.downBtn.getButtonState();
        },

        /**
        * Gets the custom spinner model
        * @method getModel
        * @public
        * @return {Object} Spinner model
        */
        getModel: function getModel() {
            return this.model;
        },

        /**
        * Sets the default accessibility text and place holders for the input box
        * @method setDefaultAcc
        * @public
        * @param defaultAccText {String} Accessibility text for the input box
        * @param [defaultPlaceHolders] {Array of Strings} Place holders for the default accessibility text
        */
        setDefaultAcc: function setDefaultAcc(defaultAccText, defaultPlaceHolders) {
            if (defaultAccText != null) {
                this.model.setDefaultAccText(defaultAccText);
            }
            if (defaultPlaceHolders != null) {
                this.model.setDefaultPlaceHolders(defaultPlaceHolders);
            }
        },

        /**
        * Sets the minimum limit accessibility text and place holders for the input box
        * @method setMinLimitAcc
        * @public
        * @param minLimitAccText {String} Accessibility text for the input box
        * @param [minLimitPlaceHolders] {Array of Strings} Place holders for the minimum limit accessibility text
        */
        setMinLimitAcc: function setMinLimitAcc(minLimitAccText, minLimitPlaceHolders) {
            if (minLimitAccText != null) {
                this.model.setMinLimitAccText(minLimitAccText);
            }
            if (minLimitPlaceHolders != null) {
                this.model.setMinLimitPlaceHolders(minLimitPlaceHolders);
            }
        },

        /**
        * Sets the maximum limit accessibility text and place holders for the input box
        * @method setMaxLimitAcc
        * @public
        * @param maxLimitAccText {String} Accessibility text for the input box
        * @param [maxLimitPlaceHolders] {Array of Strings} Place holders for the maximum limit accessibility text
        */
        setMaxLimitAcc: function setMaxLimitAcc(maxLimitAccText, maxLimitPlaceHolders) {
            if (maxLimitAccText != null) {
                this.model.setMaxLimitAccText(maxLimitAccText);
            }
            if (maxLimitPlaceHolders != null) {
                this.model.setMaxLimitPlaceHolders(maxLimitPlaceHolders);
            }
        },

        /**
        * Sets the on-decrease accessibility text and place holders for the input box
        * @method setOnDecreaseAcc
        * @public
        * @param onDecreaseAccText {String} Accessibility text for the input box
        * @param [onDecreasePlaceHolders] {Array of Strings} Place holders for the on-decrease accessibility text
        */
        setOnDecreaseAcc: function setOnDecreaseAcc(onDecreaseAccText, onDecreasePlaceHolders) {
            if (onDecreaseAccText != null) {
                this.model.setOnDecreaseAccText(onDecreaseAccText);
            }
            if (onDecreasePlaceHolders != null) {
                this.model.setOnDecreasePlaceHolders(onDecreasePlaceHolders);
            }
        },

        /**
        * Sets the on-increase accessibility text and place holders for the input box
        * @method setOnIncreaseAcc
        * @public
        * @param onIncreaseAccText {String} Accessibility text for the input box
        * @param [onIncreasePlaceHolders] {Array of Strings} Place holders for the on-increase accessibility text
        */
        setOnIncreaseAcc: function setOnIncreaseAcc(onIncreaseAccText, onIncreasePlaceHolders) {
            if (onIncreaseAccText != null) {
                this.model.setOnIncreaseAccText(onIncreaseAccText);
            }
            if (onIncreasePlaceHolders != null) {
                this.model.setOnIncreasePlaceHolders(onIncreasePlaceHolders);
            }
        },

        /**
        * Sets the up arrow accessibility text
        * @method setUpArrowAccText
        * @public
        * @param upArrowAccText {String} Accessibility text for the up arrow
        */
        setUpArrowAccText: function setUpArrowAccText(upArrowAccText) {
            if (upArrowAccText != null) {
                this.model.setUpArrowAccText(upArrowAccText);
            }
        },

        /**
        * Sets the down arrow accessibility text
        * @method setDownArrowAccText
        * @public
        * @param downArrowAccText {String} Accessibility text for the down arrow
        */
        setDownArrowAccText: function setDownArrowAccText(downArrowAccText) {
            if (downArrowAccText != null) {
                this.model.setDownArrowAccText(downArrowAccText);
            }
        },
        hideSpinnerButtons: function hideSpinnerButtons() {
            this.upBtn.hideButton();
            this.downBtn.hideButton();
        },
        showSpinnerButtons: function showSpinnerButtons() {
            this.upBtn.showButton();
            this.downBtn.showButton();
        },
        /**
        * enable disable spinner buttons
        *
        * @method enableDisableButton
        * @param {Object} [btnView]
        * @param {Boolean} [enableBtn]
        * @private
        **/
        enableDisableButton: function (buttonIndex, enableBtn) {
            if (enableBtn === true) {
                if (buttonIndex === MathInteractives.global.Theme2.CustomSpinner.DOWN_BTN_INDEX) {
                    this.downBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                } else {
                    this.upBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
                }
            }
            else {
                if (buttonIndex === MathInteractives.global.Theme2.CustomSpinner.DOWN_BTN_INDEX) {
                    this.downBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                } else {
                    this.upBtn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
                }
            }
        },

        /**
        * Setter function for property minValue
        * @method setMinValue
        * @param minValue {Number} The minValue of the spinning range
        * @param currValue {Number} The current value for spinner
        * @public
        */
        setMinValue: function setMinValue(minValue,currValue) {
            var currentValue=this.currentValue;
            this.model.set('minValue', minValue);
            this.minValue=minValue;
            if(!(currValue===null||currValue===undefined)){
                this.setSpinBoxValue(currValue);
            }else{
                if(currentValue < minValue){
                    this.setSpinBoxValue(minValue);
                }else{
                    this.setSpinBoxValue(currentValue);
                }
            }
        },

        /**
        * Set Min and max value
        * @method setMinMaxValue
        * @param minValue {Number} The minValue of the spinning range
        * @param maxValue {Number} The maxValue of the spinning range
        * @param currValue {Number} The current value for spinner
        * @public
        */
        setMinMaxValue: function setMinMaxValue(minValue,maxValue,currValue) {
            this.setMinValue(minValue,currValue);
            this.setMaxValue(maxValue,currValue);
        },

        /**
        * Setter function for property maxValue
        * @method setMaxValue
        * @param maxValue {Number} The maxValue of the spinning range
        * @param currValue {Number} The current value for spinner
        * @public
        */
        setMaxValue: function setMaxValue(maxValue,currValue) {
            var currentValue=this.currentValue;
            this.model.set('maxValue', maxValue);
            this.maxValue=maxValue;
            if(!(currValue===null||currValue===undefined)){
                this.setSpinBoxValue(currValue);
            }else{
                if(currentValue > maxValue){
                    this.setSpinBoxValue(maxValue);
                }else{
                    this.setSpinBoxValue(currentValue);
                }
            }
        }
    },
    {
        /**
        * Generates a spinner element on to the screen
        * @method generateCustomSpinner
        * @static
        * @param options {Object} Properties required to generate a spinner
        * @return {Object} spinner view
        */
        generateCustomSpinner: function (options) {
            if (options) {
                var customSpinnerModel = new MathInteractives.Common.Components.Theme2.Models.CustomSpinner(options);
                var customSpinnerView = new MathInteractives.Common.Components.Theme2.Views.CustomSpinner({
                    model: customSpinnerModel,
                    el: '#' + options.spinId
                });

                return customSpinnerView;
            }
        },

        /**
        * Constant holding custom event name fired on spinner value change.
        * @property VALUE_CHANGED
        * @type String
        * @static
        */
        VALUE_CHANGED: 'value-changed',
        /**
        * Constant action name fired on spinner button click.
        * @property BUTTON_CLICK
        * @type String
        * @static
        */
        BUTTON_CLICK: 'button-click',
        /**
        * Constant action name fired on spinner text-box focus out.
        * @property FOCUS_OUT
        * @type String
        * @static
        */
        FOCUS_OUT: 'focus-out',
        /**
        * Constant action name fired on spinner text-box key press.
        * @property KEY_PRESS
        * @type String
        * @static
        */
        KEY_PRESS: 'key-press',
        /**
        * Constant holding default value for spinner in value is set to null.
        * @property DEFAULT_VALUE
        * @type String
        * @static
        */
        DEFAULT_VALUE: '---',
        /**
        * Constant holding value for spinner alignment with text box in center.
        * @property DEFAULT_ALIGN
        * @type String
        * @static
        */
        CENTER_ALIGN: 'center',
        /**
        * Constant holding value for spinner alignment with text box on top.
        * @property TOP_ALIGN
        * @type String
        * @static
        */
        TOP_ALIGN: 'top',
        /**
        * Constant holding value for spinner alignment with text box on left.
        * @property LEFT_ALIGN
        * @type String
        * @static
        */
        LEFT_ALIGN: 'left',
        /**
        * Constant holding value for spinner alignment with text box in middle and all are vertical align.
        * @property VERTICAL_ALIGN
        * @type String
        * @static
        */
        VERTICAL_ALIGN: 'vertical',
        /**
        * Constant signifying previous value of spinner
        * @property PREV_VAL
        * @type String
        * @static
        */
        PREV_VAL: 'prev_val',
        /**
        * Constant signifying current value of spinner
        * @property CURR_VAL
        * @type String
        * @static
        */
        CURR_VAL: 'curr_val',
        /**
        * Constant signifying minimum value of spinner
        * @property MIN_VAL
        * @type String
        * @static
        */
        MIN_VAL: 'min_val',
        /**
        * Constant signifying maximum value of spinner
        * @property MAX_VAL
        * @type String
        * @static
        */
        MAX_VAL: 'max_val',
        VERTICAL_LEFT: 'vertical-left',
        VERTICAL_RIGHT: 'vertical-right',
        DOWN_BTN_INDEX: 0,
        UP_BTN_INDEX: 1
    });

    MathInteractives.global.Theme2.CustomSpinner = MathInteractives.Common.Components.Theme2.Views.CustomSpinner;
})();
