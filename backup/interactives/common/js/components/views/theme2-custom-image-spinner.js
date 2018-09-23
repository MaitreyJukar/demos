(function () {
    'use strict';

    /**
    * View for rendering Custom Spinner
    *
    * @class CustomImageSpinner
    * @constructor
    * @namespace MathInteractives.Common.Components.Theme2.Views
    **/
    MathInteractives.Common.Components.Theme2.Views.CustomImageSpinner = MathInteractives.Common.Player.Views.Base.extend({
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
        * @property filePath
        * @type String
        * @default null
        */
        filePath: null,
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
        * Reference to an interval timer variable used for mousedown/touchstart event
        * @property btnInterval
        * @type Number
        * @default null
        */
        btnInterval: null,

        /**
        * stored user supplied button width.
        * @property buttonWidth
        * @type Number
        * @default null
        */
        buttonWidth: null,

        /**
        * stored user supplied button height.
        * @property buttonHeight
        * @type Number
        * @default null
        */
        buttonHeight: null,

        /**
        * stored user supplied input Box width.
        * @property imageHolderWidth
        * @type Number
        * @default null
        */
        imageHolderWidth: null,

        /**
        * stored user supplied input Box height.
        * @property imageHolderHeight
        * @type Number
        * @default null
        */
        imageHolderHeight: null,
        /**
        * specifies the total image count to be used within the stepper.
        * @property customImageStepperCounter
        * @type Number
        * @default null
        */
        customImageStepperCounter: null,
        /**
        * specifies the initial index of the image.
        * @property initialImageCounter
        * @type Number
        * @default null
        */
        initialImageCounter: null,

        /**
        * Get data from model & set in view, Calls render
        *
        * @method initialize
        * @private
        **/
        initialize: function initialize() {
            var currentModel = this.model,
                modelNameSpace = MathInteractives.Common.Components.Theme2.Models.CustomImageSpinner,
                customImageSpinner = MathInteractives.global.Theme2.CustomImageSpinner,
                self = this,
                alignType,
                buttonWidth = currentModel.get('buttonWidth'),
                buttonHeight = currentModel.get('buttonHeight'),
                imageHolderHeight = currentModel.get('imageHolderHeight'),
                imageHolderWidth = currentModel.get('imageHolderWidth');
            this.initializeDefaultProperties();
            this.customImageStepperCounter = this.initialImageCounter = currentModel.get('currentImageCounter') || modelNameSpace.CUSTOM_IMAGE_STEPPER_COUNTER;
            this.upFontAwesomeClass = currentModel.get('upFontAwesomeClass') || modelNameSpace.UP_BUTTON_FONT_AWESOME_CLASS;
            this.downFontAwesomeClass = currentModel.get('downFontAwesomeClass') || modelNameSpace.DOWN_BUTTON_FONT_AWESOME_CLASS;
            this.customImageStepperImageId = currentModel.get('customImageStepperImageId');
            this.stepperClass = currentModel.get('stepperClass');
            this.numberOfImages = currentModel.get('numberOfImages');
            this.spinBoxId = currentModel.get('spinId');
            this.alignType = alignType = currentModel.get('alignType');
            this.buttonWidth = (buttonWidth !== null && typeof buttonWidth !== 'undefined') ? buttonWidth : modelNameSpace.BUTTON_WIDTH;
            this.buttonHeight = (buttonHeight !== null && typeof buttonHeight !== 'undefined') ? buttonHeight : modelNameSpace.BUTTON_HEIGHT;
            this.imageHolderWidth = (imageHolderWidth !== null && typeof imageHolderWidth !== 'undefined') ? imageHolderWidth : modelNameSpace.IMAGE_HOLDER_WIDTH;
            this.imageHolderHeight = (imageHolderHeight !== null && typeof imageHolderHeight !== 'undefined') ? imageHolderHeight : modelNameSpace.IMAGE_HOLDER_HEIGHT;
            this.topButtonBaseClass = currentModel.get('topButtonBaseClass');
            this.bottomButtomBaseClass = currentModel.get('bottomButtomBaseClass');
            this.spinnerHeight = currentModel.get('height');
            this.spinnerWidth = currentModel.get('width');
            this.applyTopIconButtonWrapper = currentModel.get('applyTopIconButtonWrapper');
            this.applyBottomIconButtonWrapper = currentModel.get('applyBottomIconButtonWrapper');
            this.topIconButtonWrapperClass = currentModel.get('topIconButtonWrapperClass');
            this.bottomIconButtonWrapperClass = currentModel.get('bottomIconButtonWrapperClass');
            this.screenId = currentModel.get('screenId');
            //this.loadScreen('spinner-acc-text-screen');
            var data = { spinBoxId: this.spinBoxId },
                templateHtml = MathInteractives.Common.Components.templates.theme2CustomImageSpinner(data);
            this._render(templateHtml);
            this._setAlignments();
            if (this.screenId) {
                this.loadScreen(this.screenId);
            }
            if (this.customImageStepperCounter > 0) {
                this._changeSpinnerAcc(this.initialImageCounter);
            }
        },

        /**
        * Renders the Custom Spinner
        *
        * @method render
        * @param {String} template of customSpin
        * @private
        **/
        _render: function _render(template) {
            var imageHolderHeight = this.imageHolderHeight;

            this.$el.append(template.trim());
            this.$('.spinbox,.spin-content-container,.spin-down-arrow,.spin-up-arrow').addClass(this.alignType + '-aligned');
            var $innerTextBoxDiv = $('<div></div>', { 'class': 'custom-image-stepper-image-holder' }),
                $innerTextBoxHolder = $('<div></div>', { 'class': 'custom-image-stepper-image-container' });
            this.$('.spin-content-container').css({ 'height': imageHolderHeight, 'width': this.imageHolderWidth }).append($innerTextBoxHolder);
            $innerTextBoxHolder.append($innerTextBoxDiv);
            $innerTextBoxDiv.css({ 'background-image': 'url("' + this.filePath.getImagePath(this.customImageStepperImageId) + '")' }).addClass(this.stepperClass + '-' + this.customImageStepperCounter);
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
            var intvalueDown = 0, intvalueUp = 0;
            clearInterval(intvalueDown);
            clearInterval(intvalueUp);

            $spinBoxDownButtonJObj.mousedown(function (event) {
                clearInterval(self.btnInterval);
                if (self.downBtn.getButtonState() != MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                    $spinBoxDownButtonJObj.unbind('click');
                    if ((event !== undefined && (typeof event.which !== 'undefined' && event.which === 1)) || (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile)) {
                        self.btnInterval = setInterval($.proxy(self.spinDownArrowClick, self), 500);
                    }
                }
                else {
                    $spinBoxDownButtonJObj.unbind('click').bind('click', $.proxy(self.spinDownArrowClick, self));
                }
            }).on('touchstart', function () {
                clearInterval(self.btnInterval);
                if (self.downBtn.getButtonState() != MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                    $spinBoxDownButtonJObj.unbind('click');
                    self.btnInterval = setInterval($.proxy(self.spinDownArrowClick, self), 500);
                }
                else {
                    self.$el.find('.spin-down-arrow').unbind('click').bind('click', $.proxy(self.spinDownArrowClick, self));
                }
            }).mouseup(function () {
                clearInterval(self.btnInterval);
                $spinBoxDownButtonJObj.unbind('click').bind('click', $.proxy(self.spinDownArrowClick, self));
            }).mouseout(function () {
                clearInterval(self.btnInterval);
                $spinBoxDownButtonJObj.unbind('click').bind('click', $.proxy(self.spinDownArrowClick, self));
            }).on('touchend', function () {
                clearInterval(self.btnInterval);
                $spinBoxDownButtonJObj.unbind('click').bind('click', $.proxy(self.spinDownArrowClick, self));
            });

            $spinBoxUpButtonJObj.mousedown(function (event) {
                clearInterval(self.btnInterval);
                if (self.upBtn.getButtonState() != MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                    $spinBoxUpButtonJObj.unbind('click');

                    if ((event !== undefined && (typeof event.which !== 'undefined' && event.which === 1)) || (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile)) {
                        self.btnInterval = setInterval($.proxy(self.spinUpArrowClick, self), 500);
                    }
                }
                else {
                    $spinBoxUpButtonJObj.unbind('click').bind('click', $.proxy(self.spinUpArrowClick, self));
                }
            }).on('touchstart', function () {
                clearInterval(self.btnInterval);
                if (self.upBtn.getButtonState() != MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                    $spinBoxUpButtonJObj.unbind('click');
                    self.btnInterval = setInterval($.proxy(self.spinUpArrowClick, self), 500);
                }
                else {
                    $spinBoxUpButtonJObj.unbind('click').bind('click', $.proxy(self.spinUpArrowClick, self));
                }
            }).mouseup(function () {
                clearInterval(self.btnInterval);
                $spinBoxUpButtonJObj.unbind('click').bind('click', $.proxy(self.spinUpArrowClick, self));
            }).mouseout(function () {
                clearInterval(self.btnInterval);
                $spinBoxUpButtonJObj.unbind('click').bind('click', $.proxy(self.spinUpArrowClick, self));
            }).on('touchend', function () {
                clearInterval(self.btnInterval);
                $spinBoxUpButtonJObj.unbind('click').bind('click', $.proxy(self.spinUpArrowClick, self));
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
                buttonType = MathInteractives.global.Theme2.Button.TYPE,
                generateButtonClass = MathInteractives.global.Theme2.Button,
                _generateSpinnerButton,
                width = this.buttonWidth,
                height = this.buttonHeight,
                fontColor = currentModel.get('buttonFontColor'),
                fontSize = currentModel.get('buttonFontSize');
            _generateSpinnerButton = function (btnId, fontAwesomeClass, applyIconButtonWrapper, iconButtonWrapperClass, buttonClass) {
                var btnView = generateButtonClass.generateButton({
                    'player': self.player,
                    'manager': self.manager,
                    'path': self.filePath,
                    'idPrefix': self.idPrefix,
                    'data': {
                        'id': self.spinBoxId + btnId,
                        'type': buttonType.FA_ICON,
                        'icon': {
                            'faClass': self.filePath.getFontAwesomeClass(fontAwesomeClass),
                            'fontSize': fontSize,
                            'fontColor': fontColor,
                            'fontWeight': 'normal',
                            'applyIconButtonWrapper': applyIconButtonWrapper,
                            'iconButtonWrapperClass': iconButtonWrapperClass
                        },
                        'width': width,
                        'height': height,
                        'baseClass': buttonClass
                    }
                });
                return btnView;
            }

            this.upBtn = _generateSpinnerButton('-up-arrow', this.upFontAwesomeClass, this.applyTopIconButtonWrapper, this.topIconButtonWrapperClass, this.topButtonBaseClass);
            this.downBtn = _generateSpinnerButton('-down-arrow', this.downFontAwesomeClass, this.applyBottomIconButtonWrapper, this.bottomIconButtonWrapperClass, this.bottomButtomBaseClass);
        },




        /**
        * Method to be called when spin up is fired
        *
        * @method spinUpArrowClick
        **/
        spinUpArrowClick: function spinUpArrowClick(event) {
            var $customImageSteppedImageHolder = this.$('.custom-image-stepper-image-holder'),
                stepperClass = this.stepperClass,
                numberOfImages = this.numberOfImages;
            $customImageSteppedImageHolder.removeClass(stepperClass + '-' + this.customImageStepperCounter);
            if (this.customImageStepperCounter === numberOfImages - 1) {
                this.customImageStepperCounter = 0;
            }
            else {
                this.customImageStepperCounter++;
            }
            var currentCounter = (this.customImageStepperCounter % numberOfImages);
            if (this.screenId) {
                this.changeAccMessage(this.$('.spin-down-arrow').attr('id').replace(this.idPrefix, ''), currentCounter);
                this.changeAccMessage(this.$('.spin-up-arrow').attr('id').replace(this.idPrefix, ''), currentCounter);
            }
            $customImageSteppedImageHolder.addClass(stepperClass + '-' + currentCounter);
            this.trigger(MathInteractives.global.Theme2.CustomImageSpinner.VALUE_CHANGED, { actionPerformed: MathInteractives.global.Theme2.CustomImageSpinner.BUTTON_CLICK, buttonType: 'spinner-up', currentImageCounter: currentCounter });
        },

        /**
        * Method to be called when spin down is fired
        *
        * @method spinDownArrowClick
        **/
        spinDownArrowClick: function spinDownArrowClick(event) {
            var $customImageSteppedImageHolder = this.$('.custom-image-stepper-image-holder'),
                stepperClass = this.stepperClass,
                numberOfImages = this.numberOfImages;
            $customImageSteppedImageHolder.removeClass(stepperClass + '-' + this.customImageStepperCounter);
            if (this.customImageStepperCounter === 0) {
                this.customImageStepperCounter = numberOfImages - 1;
            }
            else {
                this.customImageStepperCounter--;
            }
            var currentCounter = (this.customImageStepperCounter % numberOfImages);
            $customImageSteppedImageHolder.addClass(stepperClass + '-' + currentCounter);
            if (this.screenId) {
                this.changeAccMessage(this.$('.spin-down-arrow').attr('id').replace(this.idPrefix, ''), currentCounter);
                this.changeAccMessage(this.$('.spin-up-arrow').attr('id').replace(this.idPrefix, ''), currentCounter);
            }
            this.trigger(MathInteractives.global.Theme2.CustomImageSpinner.VALUE_CHANGED, {
                actionPerformed: MathInteractives.global.Theme2.CustomImageSpinner.BUTTON_CLICK,
                buttonType: 'spinner-down',
                currentImageCounter: currentCounter
            });
        },

        /**
        * Enables the button
        *
        * @method _enableBtn
        * @param {Object} btn Button to be enabled
        * @param {String} accId Accessibility Id for the button to be enabled
        **/
        _enableBtn: function _enableBtn(btn, accId) {
            btn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
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
            btn.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED)
            if (accId !== null && accId !== 'undefined') {
                this.enableTab(accId, false);
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
        * Sets image specified by passed image index.
        * @method imageIndex
        * @public
        **/
        setImage: function setImage(imageIndex) {
            var $customImageSteppedImageHolder = this.$('.custom-image-stepper-image-holder'),
                stepperClass = this.stepperClass,
                numberOfImages = this.numberOfImages;
            if (imageIndex < numberOfImages) {
                $customImageSteppedImageHolder.removeClass(stepperClass + '-' + this.customImageStepperCounter);
                this.customImageStepperCounter = imageIndex;
                var currentCounter = (this.customImageStepperCounter % numberOfImages);
                $customImageSteppedImageHolder.addClass(stepperClass + '-' + currentCounter);
                this.trigger(MathInteractives.global.Theme2.CustomImageSpinner.VALUE_CHANGED, {
                    actionPerformed: MathInteractives.global.Theme2.CustomImageSpinner.SET_IMAGE,
                    currentImageCounter: currentCounter
                });
            }
        },
        /**
        * Sets tab index for up and down button as specified by function argument.
        * @method changeTabIndex
        * @public
        **/
        changeTabIndex: function changeTabIndex(tabIndex) {
            this.setTabIndex(this.$('.spin-down-arrow').attr('id').replace(this.idPrefix, ''), tabIndex);
            this.setTabIndex(this.$('.spin-up-arrow').attr('id').replace(this.idPrefix, ''), tabIndex + 2);
        },
        /**
        * Sets tab index for up and down button as specified by function argument.
        * @method resetSpinnerAcc
        * @public
        **/
        resetAcc: function resetAcc() {
            this._changeSpinnerAcc(this.initialImageCounter);
        },

        /**
        * Sets appropriate acc message for top and bottom spinner buttons.
        * @method _changeSpinnerAcc
        * @private
        **/
        _changeSpinnerAcc: function _changeSpinnerAcc(msgId) {
            this.changeAccMessage(this.$('.spin-down-arrow').attr('id').replace(this.idPrefix, ''), msgId);
            this.changeAccMessage(this.$('.spin-up-arrow').attr('id').replace(this.idPrefix, ''), msgId);
        }

    },
    {
        /**
        * Generates a spinner element on to the screen
        * @method generateCustomImageSpinner
        * @param {Object} options Properties required to generate a spinner
        * @static
        */
        generateCustomImageSpinner: function (options) {
            if (options) {
                var CustomImageSpinnerModel = new MathInteractives.Common.Components.Theme2.Models.CustomImageSpinner(options);
                var CustomImageSpinnerView = new MathInteractives.Common.Components.Theme2.Views.CustomImageSpinner({
                    model: CustomImageSpinnerModel,
                    el: '#' + options.spinId
                });

                return CustomImageSpinnerView;
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
        * Constant specifying action of image set by function called on spinner view.
        * @property SET_IMAGE
        * @static
        */
        SET_IMAGE: 'set-image',
        /**
        * Constant action name fired on spinner button click.
        * @property BUTTON_CLICK
        * @static
        */
        CUSTOM_IMAGE_STEPPER: 'custom-image-stepper',
    });

    MathInteractives.global.Theme2.CustomImageSpinner = MathInteractives.Common.Components.Theme2.Views.CustomImageSpinner;
})();
