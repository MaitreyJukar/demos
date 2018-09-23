(function () {
    'use strict';
    MathInteractives.Common.Components.Models.InputBox = Backbone.Model.extend({
        defaults: {
            maxCharLength: 10,
            maxValue: null,
            previousValue: '',
            precision: 2,
            defaultValue: '',
            keyCodeArray: [],
            regexString: null,
            allowNegative: true,
            inputType: null,
            defaultTextOnEmptyInputBox: null,
            lastInputValue: null,
            defaultTabIndexToInputBox: true,
            customClass: null,

            /** 
            * hold the regex for current input box
            * @property currentRegex
            * @type string
            * @default null
            */
            currentRegex: null,
            /**
            * holds the previous input box value for android devices
            * @property androidDevicePreviousValue
            * @type string
            * @default null
            */
            androidDevicePreviousValue: null
        },

        _initialize: function () {

        },

        getDefaultTextOnEmptyInputBox: function () {
            return this.get('defaultTextOnEmptyInputBox');
        },

        getPreviousValue: function () {
            return this.get('previousValue');
        },
        setPreviousValue: function (value) {
            this.set('previousValue', value)
        },
        getLastInputValue: function () {

            return this.get('lastInputValue');
        },
        getMaxValue: function () {
            return this.get('maxValue');
        },
        setMaxValue: function (value) {
            this.set('maxValue', value);
        },
        setLastInputValue: function (value) {

            this.set('lastInputValue', value);
        },

        setDefaultTextOnEmptyInputBox: function (value) {

            this.set('defaultTextOnEmptyInputBox', value);
        },

        setMaxCharLength: function (value) {
            this.set('maxCharLenght', value);
        },
        getMaxCharLength: function () {
            return this.get('maxCharLenght');
        },

        setPrecision: function (value) {
            this.set('precision', value);
        },
        getPrecision: function () {
            return this.get('precision');
        },
        setDefaultValue: function (value) {
            this.set('defaultValue', value);
        },
        getDefaultValue: function () {
            return this.get('defaultValue');
        },
        setKeyCodeArray: function (value) {
            this.set('keyCodeArray', value);
        },
        getKeyCodeArray: function () {
            return this.get('keyCodeArray');
        },
        setregexString: function (value) {
            this.set('regexString', value);
        },
        getregexString: function () {
            return this.get('regexString');
        },
        getCustomClass: function () {
            return this.get('customClass');
        },
        setCustomClass: function (value) {
            this.set('customClass', value);
        },
        /** Returns the regex string
        * @method getCurrentRegex
        * @return {String} String of the regex.
        */
        getCurrentRegex: function () {
            return this.get('currentRegex');
        },

        /** set  the value precisionBeforeDecimal
        * @method setPrecisionBeforeDecimal
        * @param {integer} value to set
        */
        setCurrentRegex: function (value) {
            this.set('currentRegex', value);
        },
        /** return the touchDevicePreviousValue model value
        * @method getTouchDevicePreviousValue
        * @return {float} value of touchDevicePreviousValue
        */
        getAndroidDevicePreviousValue: function () {
            return this.get('androidDevicePreviousValue');
        },
        /** set the touchDevicePreviousValue model value
        * @method setTouchDevicePreviousValue
        * @param {float} value to set
        */
        setAndroidDevicePreviousValue: function (value) {
            this.set('androidDevicePreviousValue', value);
        },

        /** set the regex for current type
        * @method _setRegexForCurrentType
        * @private
        */
        setRegexForCurrentType: function () {

            var inputType = this.get('inputType'),
                allowNegative = this.get('allowNegative'),
                regex = null,
                precision = this.get('precision'),
                maxCharLength = this.get('maxCharLength'),
                viewStaticData = MathInteractives.global.InputBox;

            switch (inputType) {

                case viewStaticData.INPUT_TYPE_INTEGER:
                    {
                        if (allowNegative) {
                            regex = new RegExp('^\\-?\\d{0,' + maxCharLength + '}$'); // negative sign is optional in this regex 
                        }
                        else {
                            regex = new RegExp('^\\d{0,' + maxCharLength + '}$'); // only integers are allowed
                        }
                        break;
                    }

                case viewStaticData.INPUT_TYPE_FLOATING:
                    {
                        if (allowNegative) {
                            /* regex explanation 
                            1 negative sign is allowed
                            2 part will accept input digits before decimal point upto maxchar length and decimal point and two digits afterwards
                            3 part is to accept digits upto maxcharlength
                            */
                            regex = new RegExp('^\\-?\\d{0,' + maxCharLength + '}\\.\\d{0,' + precision + '}$|^\\-?\\d{0,' + maxCharLength + '}$');
                        }
                        else {
                            /* regex explanation                        
                            1 part will accept input digits before decimal point upto maxchar length and decimal point and two digits afterwards
                            2 part is to accept digits upto maxcharlength
                            */
                            regex = new RegExp('^\\d{0,' + maxCharLength + '}\\.\\d{0,' + precision + '}$|^\\d{0,' + maxCharLength + '}$');
                        }
                        break;
                    }
                case viewStaticData.INPUT_TYPE_ALPHANUMERIC:
                    {
                        regex = new RegExp('^[a-zA-Z0-9_]*$'); // only integers are allowed
                        break;
                    }
                case viewStaticData.INPUT_TYPE_CUSTOM:
                    {
                        regex = this.get('regexString');
                        break;
                    }
            }
            this.set('currentRegex', regex);
        },

        getDefaultTabIndexToInputBox: function () {
            return (this.get('defaultTabIndexToInputBox'));
        }

    });
})(window.MathInteractives);

