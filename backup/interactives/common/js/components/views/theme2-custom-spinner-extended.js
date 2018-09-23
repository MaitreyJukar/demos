(function () {
    'use strict';

    /**
      * View for rendering Custom Spinner
      *
      * @class CustomSpinnerExtended
      * @constructor
      * @extends MathInteractives.Common.Components.Theme2.Views.CheckBoxExtended
      * @namespace MathInteractives.Common.Components.Theme2.Views
      **/
    MathInteractives.Common.Components.Theme2.Views.CustomSpinnerExtended = MathInteractives.Common.Components.Theme2.Views.CustomSpinner.extend({

        isClicked: false,

        timer: null,

        firstTimeout: null,

        /**
        * Get data from model & set in view, Calls render
        *
        * @namespace MathInteractives.Common.Components.Views
        * @class CustomSpinnerExtended
        * @constructor
        */
        initialize: function initialize() {
            this.constructor.__super__.initialize.apply(this, arguments);
            this._attachEvents();
        },

        /**
       * Setting alignments & other css properties of elements
       *
       * @method _setAlignments
       * @private
       **/
        _setAlignments: function _setAlignments() {
            this._generateButtons();
            this.setSpinBoxValue(this.spinValue);
        },

        _attachEvents: function _attachEvents() {

            var self = this,
                touchNamespace = MathInteractives.Common.Utilities.Models.Utils,
                 $spinBoxUpButtonJObj = this.$el.find('.spin-up-arrow'),
                 $spinBoxDownButtonJObj = this.$el.find('.spin-down-arrow');

            $spinBoxDownButtonJObj.off('.downButton')
                                   .on('mousedown.downButton', function (event) {
                                       if (self.downBtn.getButtonState() != MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                                           self.handleArrowClick(false, event);
                                           self._bindDocumentUpEvent(false);
                                       }
                                   });


            $spinBoxUpButtonJObj.off('.upButton')
                                .on('mousedown.upButton', function (event) {
                                    if (self.upBtn.getButtonState() != MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED) {
                                        self.handleArrowClick(true, event);
                                        self._bindDocumentUpEvent(true);
                                    }
                                });

            touchNamespace.EnableTouch($spinBoxDownButtonJObj);
            touchNamespace.EnableTouch($spinBoxUpButtonJObj);

        },

        _bindDocumentUpEvent: function _bindDocumentUpEvent(isUpBtn) {

            var self = this;

            $(document).off('.spinnerDocumentClick')
            .on('mouseup.spinnerDocumentClick touchend.spinnerDocumentClick touchcancel.spinnerDocumentClick',
            function (event) {
                self.isClicked = false;
                window.clearInterval(self.timer);
                window.clearTimeout(self.firstTimeout);
                $(document).off('.spinnerDocumentClick');
            });

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
                        this.$('.spin-value').text(this._replaceMinusSign(defaultValue));
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
                        this.$('.spin-value').text(this._replaceMinusSign(this.currentValue));
                    }
                }
                if (minValue == spinValue) {
                    if (this.upBtn.getButtonState() !== MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) {
                        this._enableBtn(this.upBtn, this.model.getUpArrowAccId());
                    }
                    this._disableBtn(this.downBtn, this.model.getDownArrowAccId());
                }
                else if (maxValue == spinValue) {
                    this._disableBtn(this.upBtn, this.model.getUpArrowAccId());
                    if (this.downBtn.getButtonState() !== MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) {
                        this._enableBtn(this.downBtn, this.model.getDownArrowAccId());
                    }
                }
                else {
                    if (this.upBtn.getButtonState() !== MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE) {
                        this._enableBtn(this.upBtn, this.model.getUpArrowAccId());
                    }
                    if (this.downBtn.getButtonState() !== MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE && this.currentValue != null) {
                        this._enableBtn(this.downBtn, this.model.getDownArrowAccId());
                    }
                }
            }
            else { }
        },

        handleArrowClick: function handleArrowClick(isUpBtn, event) {

            var self = this,
                timer = null,
                timerInterval = null,
                time = 500 / 3;

            this.isClicked = true;

            if (self.timer) {
                window.clearInterval(self.timer);
            }
            if (self.firstTimeout) {
                window.clearTimeout(self.firstTimeout);
            }

            timer = function () {
                if (!self.isClicked) {
                    window.clearInterval(timerInterval);
                }
                else {
                    isUpBtn ? self.spinUpArrowClick(event) : self.spinDownArrowClick(event);
                }
            }

            isUpBtn ? self.spinUpArrowClick(event) : self.spinDownArrowClick(event);

            if (timerInterval) {
                window.clearInterval(timerInterval);
            }

            this.firstTimeout = window.setTimeout(function () {
                self.timer = timerInterval = window.setInterval(timer, time);
            }, 2 * time);

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
                this.setAccMessage(this.model.getTextAccId(), this.model.getMaxLimitAccText(), this.maxLimitAllPlaceHolderValues);
            }

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
                    this.$('.spin-value').text(this._replaceMinusSign(this.currentValue));
                }
            }
            this._setPlaceHolderValue(this.model.getDefaultPlaceHolders(), MathInteractives.global.Theme2.CustomSpinner.PREV_VAL, this.defaultAllPlaceHolderValues, Number(this.previousValue));
            this._setPlaceHolderValue(this.model.getDefaultPlaceHolders(), MathInteractives.global.Theme2.CustomSpinner.CURR_VAL, this.defaultAllPlaceHolderValues, Number(this.currentValue));
            this._setPlaceHolderValue(this.model.getOnDecreasePlaceHolders(), MathInteractives.global.Theme2.CustomSpinner.PREV_VAL, this.onDecreaseAllPlaceHolderValues, Number(this.previousValue));
            this._setPlaceHolderValue(this.model.getOnDecreasePlaceHolders(), MathInteractives.global.Theme2.CustomSpinner.CURR_VAL, this.onDecreaseAllPlaceHolderValues, Number(this.currentValue));
            this.setAccMessage(this.model.getTextAccId(), this.model.getOnDecreaseAccText(), this.onDecreaseAllPlaceHolderValues);

            if (iCurrentValue === (iMin + iStep)) {
                this._disableBtn(this.downBtn, this.model.getDownArrowAccId());
                this.setAccMessage(this.model.getTextAccId(), this.model.getMinLimitAccText(), this.minLimitAllPlaceHolderValues);
            }

            this.trigger(MathInteractives.global.Theme2.CustomSpinner.VALUE_CHANGED, {
                actionPerformed: MathInteractives.global.Theme2.CustomSpinner.BUTTON_CLICK,
                buttonType: 'spinner-down'
            });
            this.model.setButtonState('active');
            this.setFocusOnSpinner();
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
                this._disableBtn(this.downBtn, this.model.getDownArrowAccId());
            }
                // Disable plus button if the value entered is more than maximum limit of the spinner.
            else if (inputValue >= this.maxValue) {
                this._disableBtn(this.upBtn, this.model.getUpArrowAccId());
                this._enableBtn(this.downBtn, this.model.getDownArrowAccId());
            }
                // Enable spinner buttons if the value entered is in range of the spinner limits.
            else {
                this._enableBtn(this.upBtn, this.model.getUpArrowAccId());
                this._enableBtn(this.downBtn, this.model.getDownArrowAccId());
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

        _replaceMinusSign: function _replaceMinusSign(value) {
            var minusSign = String.fromCharCode(8722)
            return value.toString().replace(/-/g, minusSign);
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
            var customSpinnerView = new MathInteractives.Common.Components.Theme2.Views.CustomSpinnerExtended({
                model: customSpinnerModel,
                el: '#' + options.spinId
            });

            return customSpinnerView;
        }
    }

});

    MathInteractives.global.Theme2.CustomSpinnerExtended = MathInteractives.Common.Components.Theme2.Views.CustomSpinnerExtended;
})();
