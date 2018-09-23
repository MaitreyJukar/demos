(function (MathInteractives) {
    'use strict';

    /**
    * Holds the business logic and data of the view
    * @class InputBox
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @submodule MathInteractives.Common.Components.Theme2.Models.InputBox
    * @namespace MathInteractives.Common.Components.Theme2.Models
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Models.InputBox = Backbone.Model.extend({
        /*
        * Defaults initializes default parameters to textual data & canvasView to null.
        */
        defaults: {

            /**
            * maximum char length to be allowed to enter
            * @property maxCharLength
            * @type number
            * @default 10
            */
            maxCharLength: 10,

            /**
            * maximum value to be allowed
            * @property maxValue
            * @type number
            * @default null
            */
            maxValue: null,

            /**
            * previous character value in textbox previousValue
            * @property previousValue
            * @type string
            * @default blank
            */
            previousValue: '',
            /**
            * number of precision to be shown after decimal point
            * @property precision
            * @type number
            * @default 2
            */
            precision: 2,


            /**
            * default value or text to be shown when input box is empty
            * @property defaultValue
            * @type string
            * @default null
            */
            defaultValue: null,

            /**
            * key code array to store key codes of entered numbers
            * @property keyCodeArray
            * @type Array
            * @default blank
            */
            keyCodeArray: [],

            /**
            * regex string for inputbox
            * @property regexString
            * @type string
            * @default null
            */
            regexString: null,
            /**
            * Unit element to be shown for the value in the inputbox
            * @property unit
            * @type string
            * @default null
            */
            unit: null,

            /**
            * Unit element color to be shown
            * @property unitColor
            * @type string
            * @default null
            */
            unitColor: null,

            /**
            * Unit element position relative to inputbox
            * @property unitElementPosition
            * @type string
            * @default null
            */
            unitElementPosition: null,
            /**
            * contains negative sign or not
            * @property allowNegative
            * @type boolean
            * @default true
            */
            allowNegative: true,
            /**
            * type of input (integer/ float)
            * @property inputType
            * @type Object
            * @default null
            */
            inputType: null,
            /**
            * default text to be shown when input box is empty
            * @property defaultTextOnEmptyInputBox
            * @type string
            * @default null
            */
            defaultTextOnEmptyInputBox: null,
            /**
            * stores last input value entered
            * @property lastInputValue
            * @type string
            * @default null
            */
            lastInputValue: null,
            /**
            * base class for input box
            * @property customClass
            * @type string
            * @default null
            */
            customClass: null,

            /**
            * style to be applied for input box
            * @property style
            * @type Object
            * @default null
            */
            style: null,
            /**
            * width of the input box
            * @property style
            * @type Object
            * @default null
            */
            width: null,

            /**
            * default input to be set for input box
            * @property defaultInput
            * @type string
            * @default null
            */
            defaultInput: null,

            /**
            * boolean to allow quotes or not
            * @property bAllowQuotes
            * @type boolean
            * @default null
            */
            bAllowQuotes: null,


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

        /**
        * initializes the model
        * @method initialize
        * @public
        */
        initialize: function () {
            this._setRegexForCurrentType();
        },


        /**
        * returns default text to be shown when input box empty
        * 
        * @method getDefaultTextOnEmptyInputBox
        * @return defaultTextOnEmptyInputBox {number}
        * @public
        **/
        getDefaultTextOnEmptyInputBox: function () {
            return this.get('defaultTextOnEmptyInputBox');
        },

        /**
        * returns previous value in input box
        * 
        * @method getPreviousValue
        * @return previousValue {number}
        * @public
        **/
        getPreviousValue: function () {
            return this.get('previousValue');
        },

        setPreviousValue: function (value) {
            this.set('previousValue', value)
        },
        /**
        * returns last input value
        * 
        * @method getLastInputValue
        * @return lastInputValue {number}
        * @public
        **/
        getLastInputValue: function () {
            return this.get('lastInputValue');
        },
        /**
        * returns width of input box
        * 
        * @method getWidth
        * @return width {number}
        * @public
        **/
        getWidth: function () {
            return this.get('width');
        },
        /**
        * returns maximum value to be allowed
        * 
        * @method getMaxValue
        * @return maxValue {string}
        * @public
        **/
        getMaxValue: function () {
            return this.get('maxValue');
        },
        /**
        * sets maximum value to be allowed
        * 
        * @method setMaxValue
        * @param maxValue {number}
        * @public
        **/
        setMaxValue: function (value) {
            this.set('maxValue', value);
        },
        /**
        * returns default input to be shown when input box renders
        * 
        * @method getDefaultInput
        * @return defaultInput {string}
        * @public
        **/
        getDefaultInput: function () {
            return this.get('defaultInput');
        },
        /**
        * sets default input to be shown when input box renders
        * 
        * @method setDefaultInput
        * @param defaultInput {number}
        * @public
        **/
        setDefaultInput: function (value) {
            this.set('defaultInput', value);
        },
        /**
        * sets last input value
        * 
        * @method setLastInputValue
        * @param lastInputValue {number}
        * @public
        **/
        setLastInputValue: function (value) {
            this.set('lastInputValue', value);
        },
        /**
        * sets width of input
        * 
        * @method setWidth
        * @param width {string}
        * @public
        **/
        setWidth: function (value) {
            this.set('width', value);
        },
        /**
        * returns height of input
        * 
        * @method getHeight
        * @return height {string}
        * @public
        **/
        getHeight: function () {
            return this.get('height');
        },
        /**
        * sets height of input
        * 
        * @method setHeight
        * @param height {string}
        * @public
        **/
        setHeight: function (value) {
            this.set('height', value);
        },
        /**
        * sets default text on input box empty
        * 
        * @method setDefaultTextOnEmptyInputBox
        * @param defaultTextOnEmptyInputBox {string}
        * @public
        **/
        setDefaultTextOnEmptyInputBox: function (value) {
            this.set('defaultTextOnEmptyInputBox', value);
        },
        /**
        * sets length of max chars allowed
        * 
        * @method setMaxCharLength
        * @param maxCharLength {number}
        * @public
        **/
        setMaxCharLength: function (value) {
            this.set('maxCharLength', value);
        },
        /**
        * returns length of maximum characters allowed
        * 
        * @method getMaxCharLength
        * @return maxCharLength {string}
        * @public
        **/
        getMaxCharLength: function () {
            return this.get('maxCharLength');
        },
        /**
        * returns unit element of input value
        * 
        * @method getUnit
        * @return unit {string}
        * @public
        **/
        getUnit: function () {
            return this.get('unit');
        },
        /**
        * returns unit element color
        * 
        * @method getUnitColor
        * @return unitColor {string}
        * @public
        **/
        getUnitColor: function () {
            return this.get('unitColor');
        },
        /**
        * sets unit element
        * 
        * @method setUnit
        * @param unit {string}
        * @public
        **/
        setUnit: function (value) {
            this.set('unit', value)
        },
        /**
        * returns unit element position
        * 
        * @method getUnitElementPosition
        * @return unitElementPosition {string}
        * @public
        **/
        getUnitElementPosition: function () {
            return this.get('unitElementPosition');
        },
        /**
        * sets unit element position
        * 
        * @method setUnitElementPosition
        * @param unitElementPosition {string}
        * @public
        **/
        setUnitElementPosition: function (value) {
            this.set('unitElementPosition', value)
        },
        /**
        * sets unit element color
        * 
        * @method setUnitColor
        * @param unitColor {string}
        * @public
        **/
        setUnitColor: function (value) {
            this.set('unitColor', value)
        },
        /**
        * sets no of precision
        * 
        * @method setPrecision
        * @param precision {number}
        * @public
        **/
        setPrecision: function (value) {
            this.set('precision', value);
        },
        /**
        * returns precision to be allowed
        * 
        * @method getPrecision
        * @return precision {string}
        * @public
        **/
        getPrecision: function () {
            return this.get('precision');
        },
        /**
        * sets default value when input box renders
        * 
        * @method setDefaultValue
        * @param defaultValue {string}
        * @public
        **/
        setDefaultValue: function (value) {
            this.set('defaultValue', value);
        },
        /**
        * default value to be shown when input is empty
        * 
        * @method getDefaultValue
        * @return defaultValue {string}
        * @public
        **/
        getDefaultValue: function () {
            return this.get('defaultValue');
        },
        /**
        * sets key code array on valid input
        * 
        * @method setKeyCodeArray
        * @param keyCodeArray {Object} adds keyCode of every value entered
        * @public
        **/
        setKeyCodeArray: function (value) {
            this.set('keyCodeArray', value);
        },
        /**
        * returns keyCode array of entered values
        * 
        * @method getKeyCodeArray
        * @return keyCodeArray {Object}
        * @public
        **/
        getKeyCodeArray: function () {
            return this.get('keyCodeArray');
        },
        /**
        * sets regex string
        * 
        * @method setregexString
        * @param regexString {string}
        * @public
        **/
        setregexString: function (value) {
            this.set('regexString', value);
        },
        /**
        * returns regex for input box
        * 
        * @method getregexString
        * @return regexString {string}
        * @public
        **/
        getregexString: function () {
            return this.get('regexString');
        },
        /**
        * returns custom class
        * 
        * @method getCustomClass
        * @return customClass {string}
        * @public
        **/
        getCustomClass: function () {
            return this.get('customClass');
        },
        /**
        * sets custom class to input box
        * 
        * @method setCustomClass
        * @param customClass {string}
        * @public
        **/
        setCustomClass: function (value) {
            this.set('customClass', value);
        },
        /**
        * returns style properties
        * 
        * @method getStyle
        * @return style {Object}
        * @public
        **/
        getStyle: function () {
            return this.get('style');
        },
        /**
        * sets custom class to input box
        * 
        * @method setStyle
        * @param style {Object} contains style properties of inputbox 
        * @public
        **/
        setStyle: function (value) {
            this.set('style', value);
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
        _setRegexForCurrentType: function () {

            var inputType = this.get('inputType'),
                allowNegative = this.get('allowNegative'),
                regex = null,
                precision = this.get('precision'),
                maxCharLength = this.get('maxCharLength'),
                viewStaticData = MathInteractives.global.Theme2.InputBox;

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
        }
    });
})(window.MathInteractives);