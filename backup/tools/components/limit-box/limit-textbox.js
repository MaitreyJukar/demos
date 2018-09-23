/* globals $, window */

(function(MathUtilities) {
    'use strict';

    /* Initialize MathUtilities Data */
    MathUtilities.Components.LimitTextBox = {};

    /**
     * Packages all the views used in the LimitTextBox module.
     * @module Views
     * @namespace MathUtilites.Components.LimitTextBox
     **/
    MathUtilities.Components.LimitTextBox.Views = {};


    MathUtilities.Components.LimitTextBox.Views.limitTextBox = Backbone.View.extend({

        "allowedKeys": null,

        "minInput": null,

        "maxInput": null,

        "isValidMove": false,

        "allowMinus": null,

        "inputLastVal": null,

        "initialize": function() {

            var option = this.options.option;
            this.allowedKeys = option.allowedKeys;
            this.minInput = option.minInput;
            this.maxInput = option.maxInput;
            this.allowMinus = option.allowMinus;
            this.onlyPositiveDecimal = option.onlyPositiveDecimal;
            this.inputLastVal = option.inputLastVal;
            this.allowDecimal = option.allowDecimal;
            if (this.allowMinus) {
                this.$el.on('keyup', _.bind(this._allowMinus, this));
            } else {
                if (this._isNexus()) {
                    this.$el.on('keyup', _.bind(this._checkNumericInputOnKeyUp, this));
                } else {
                    this.$el.on('keypress', _.bind(this._limitInput, this)).on('keydown', _.bind(this._onKeyDown, this));
                }
            }
            this.$el.on('paste', _.bind(this._preventInputPaste, this))
                .on("focusout", _.bind(this._validateValue, this));
        },

        "_preventInputPaste": function(event) {
            event.preventDefault();
        },
        "_allowMinus": function(e) {
            var $target = $(e.target),
                targetVal = $target.val(),
                regex = this.onlyPositiveDecimal ? /^\d*(\.\d*)?$/ : /^\-?\d*(\.\d*)?$/; // regex to check if the input is a valid number allowing decimal with and without minus sign
            if (targetVal === '' || targetVal === '-') {
                $target.attr('data-value', this.inputLastVal);
                return;
            }
            if (regex.test(targetVal)) {
                if (this.allowDecimal) {
                    this.inputLastVal = targetVal;
                } else {
                    this._allowDecimal(e);
                }
            } else {
                $target.val(this.inputLastVal);
            }
        },
        "_checkNumericInputOnKeyUp": function(e) {
            var $target = $(e.target),
                keyCode = e.which || e.keyCode || e.charCode,
                targetVal = $target.val(),
                regex = /^[0-9]+$/,
                maxInput = this.maxInput,
                minInput = this.minInput,
                CODE = MathUtilities.Components.LimitTextBox.Views.limitTextBox.CODE;


            if (targetVal === '' || regex.test(targetVal) && targetVal.length - targetVal.replace(/\./g, '').length <= 1 && targetVal.length - targetVal.replace(/\-/g, '').length <= 1 && targetVal.indexOf('-') <= 0) {

                //condition to check if enter value is in given limit
                if (keyCode === CODE.ENTER_KEY) {
                    if (targetVal > maxInput) {
                        this.inputLastVal = maxInput;
                        $target.val(this.inputLastVal);
                    } else if (targetVal < minInput) {
                        this.inputLastVal = minInput;
                        $target.val(this.inputLastVal);
                    } else {
                        this.inputLastVal = targetVal;
                    }
                } else {
                    this.inputLastVal = targetVal;
                }
                return true;
            }
            $target.val(this.inputLastVal);
        },
        "_isNexus": function() {
            return navigator.platform === 'Linux armv7l';
        },

        "_validateValue": function(event) {
            var maxInput = this.maxInput,
                minInput = this.minInput,
                $target = $(event.target),
                targetValue = $target.val();
            if (targetValue < minInput) {
                $target.val(minInput);
            } else {
                if (targetValue > maxInput) {
                    $target.val(maxInput);
                }
            }
            if (targetValue === '') {
                this.trigger('empty-textbox-field-value');
            }
            event.preventDefault();
        },

        "_limitInput": function(event) {
            var keyCode = event.keyCode || event.charCode,
                CODE = MathUtilities.Components.LimitTextBox.Views.limitTextBox.CODE;
            if (!this.isValidMove && !(keyCode === CODE.BACKSPACE_KEY || keyCode === CODE.ENTER_KEY) && (keyCode < CODE.ZERO_KEY || keyCode > CODE.NINE_KEY)) {
                return false;
            } else {
                if (keyCode === CODE.ENTER_KEY) {
                    this._validateValue(event);
                }
            }
        },
        "_onKeyDown": function(event) {
            var keyCode = event.keyCode,
                CODE = MathUtilities.Components.LimitTextBox.Views.limitTextBox.CODE;
            //for firefox delete and arrow keys.
            this.isValidMove = [CODE.DELETE_KEY, CODE.LEFT_ARROW_KEY, CODE.UP_ARROW_KEY, CODE.RIGHT_ARROW_KEY, CODE.DOWN_ARROW_KEY].indexOf(keyCode) !== -1;
        },

        "_allowDecimal": function(event) {
            var keyCode = event.keyCode,
                $target = $(event.target),
                targetVal = $target.val(),
                CODE = MathUtilities.Components.LimitTextBox.Views.limitTextBox.CODE;

            if (keyCode === CODE.DECIMAL_POINT_KEY) {
                $target.val(this.inputLastVal);
            } else {
                this.inputLastVal = targetVal;
            }
        }
    }, {
        "CODE": {
            "LEFT_ARROW_KEY": 37,
            "RIGHT_ARROW_KEY": 39,
            "UP_ARROW_KEY": 38,
            "DOWN_ARROW_KEY": 40,
            "BACKSPACE_KEY": 8,
            "ENTER_KEY": 13,
            "DELETE_KEY": 46,
            "ZERO_KEY": 48,
            "NINE_KEY": 57,
            "DECIMAL_POINT_KEY": 110
        }
    });
}(window.MathUtilities));
