(function () {
    'use strict';

    /**
    * Contains Custom Spinner data
    * @class CustomSpinner  
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Theme2.Models.CustomSpinner = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * CustomSpinner ID
                * @attribute spinId
                * @type String
                * @default null
                */
                spinId: null,
                /**
                * Manager
                * @attribute manager
                * @type object
                * @default null
                */
                manager: null,
                /**
                * path for custom spinner
                * @attribute screenId
                * @type String
                * @default null
                */
                path: null,
                /**
                * Screen ID for custom spinner screen to be loaded
                * @attribute screenId
                * @type String
                * @default null
                */
                screenId: null,
                /**
                * Id Prefix for custom spinner screen to be loaded
                * @attribute idPrefix
                * @type String
                * @default null
                */
                idPrefix: null,
                /**
                * Height of spinner div
                * @attribute height
                * @type Number
                * @default 35
                */
                height: 35,
                /**
                * Width of spinner div
                * @attribute width
                * @type Number
                * @default 50
                */
                width: 50,
                /**
                * Lower limit of the spinning range
                * @attribute minValue
                * @type Number
                * @default 0
                */
                minValue: -10,
                /**
                * Upper limit of the spinning range
                * @attribute maxValue
                * @type Number
                * @default 0
                */
                maxValue: 10,
                /**
                * Value of spinner input box
                * @attribute value
                * @type Number
                * @default null
                */
                value: null,
                /**
                * Step size of increment/decrement on single spin click
                * @attribute step
                * @type Number
                * @default 1
                */
                step: 1,
                /**
                * A boolean indicating whether to show positive or negative sign before the spinner input box value
                * @attribute showSign
                * @type Boolean
                * @default false
                */
                showSign: false,
                /**
                * Update change in button state to notify parent element
                * @attribute buttonState
                * @type String
                * @default 'disabled'
                */
                buttonState: 'disabled',
                /**
                * Boolean indicating whether the spinner is editable
                * @attribute isEditable
                * @type Boolean
                * @default false
                */
                isEditable: false,
                /**
                * Precision allowed after decimal point.
                * @attribute inputPrecision
                * @type Number
                * @default null
                */
                inputPrecision: null,
                /**
                * 
                * @attribute maxCharLength
                * @type Number
                * @default null
                */
                maxCharLength: 4,
                /**
                * Value indicating text-box alignment with respect to the spinner buttons.
                * @attribute alignType
                * @type String
                * @default null
                */
                alignType: null,
                /**
                * Enum value indicating allowed input type
                * @attribute inputType
                * @type String
                * @default null
                */
                inputType: null,
                /**
                * Regular expression string to be applied on to the spinner text box.
                * @attribute inputRegEx
                * @type String
                * @default null
                */
                inputRegEx: null,
                /**
                * Custom class to be applied to spinner input box.
                * @attribute inputCustomClass
                * @type String
                * @default null
                */
                inputCustomClass: null,
                /**
                * Custom style to be applied to spinner input box.
                * @attribute textBoxStyle
                * @type String
                * @default null
                */
                textBoxStyle: null,
                /**
                * Text for spinner text box when its value is null/empty.
                * @attribute defaultText
                * @type String
                * @default '---'
                */
                defaultText: '---',
                /**
                * Accessibility text for spinner text box when its value is null/empty.
                * @attribute emptySpinnerAccText
                * @type String
                * @default null
                */
                emptySpinnerAccText: null,
                /**
                * Accessibility text for the spinner text box
                * @attribute defaultAccText
                * @type String
                * @attribute null
                */
                defaultAccText: null,
                /**
                * Accessibility text for the spinner text box when the minimum limit is reached
                * @attribute minLimitAccText
                * @type String
                * @default null
                */
                minLimitAccText: null,
                /**
                * Accessibility text for the spinner text box when the maximum limit is reached
                * @attribute maxLimitAccText
                * @type String
                * @default null
                */
                maxLimitAccText: null,
                /**
                * Accessibility text for the spinner text box when the increase button is pressed
                * @attribute onIncreaseAccText
                * @type String
                * @default null
                */
                onIncreaseAccText: null,
                /**
                * Accessibility text for the spinner text box when the decrease button is pressed
                * @attribute onDecreaseAccText
                * @type String
                * @default null
                */
                onDecreaseAccText: null,
                /**
                * Place holders for the accessibility text when spinner is empty/null.
                * @attribute emptySpinnerPlaceHolders
                * @type Array of Strings
                * @default null
                */
                emptySpinnerPlaceHolders: null,
                /**
                * Place holders for the default accessibility text
                * @attribute defaultPlaceHolders
                * @type Array of Strings
                * @default null
                **/
                defaultPlaceHolders: null,
                /**
                * Place holders for the minimum limit accessibility text
                * @attribute minLimitPlaceHolders
                * @type Array of Strings
                * @default null
                */
                minLimitPlaceHolders: null,
                /**
                * Place holders for the maximum limit accessibility text
                * @attribute maxLimitPlaceHolders
                * @type Array of Strings
                * @default null
                */
                maxLimitPlaceHolders: null,
                /**
                * Place holders for the increase accessibility text
                * @attribute onIncreasePlaceHolders
                * @type Array of Strings
                * @default null
                */
                onIncreasePlaceHolders: null,
                /**
                * Place holders for the decrease accessibility text
                * @attribute onDecreasePlaceHolders
                * @type Array of Strings
                * @default null
                */
                onDecreasePlaceHolders: null,
                /**
                * Accessibility text for the up arrow
                * @attribute upArrowAccText
                * @type String
                * @default null
                */
                upArrowAccText: null,
                /**
                * Accessibility text for the down arrow
                * @attribute downArrowAccText
                * @type String
                * @default null
                */
                downArrowAccText: null,
                /**
                * Text element's accessibility id
                * @attribute textAccId
                * @type String
                * @default null
                */
                textAccId: null,
                /**
                * Up arrow element's accessibility id
                * @attribute upArrowAccId
                * @type String
                * @default null
                */
                upArrowAccId: null,
                /**
                * Down arrow element's accessibility id
                * @attribute downArrowAccId
                * @type String
                * @default null
                */
                downArrowAccId: null,
                /**
                * Text element's tab index
                * @attribute tabIndex
                * @type Integer
                * @default 0
                */
                tabIndex: 0,
                /**
                * Up arrow element's tab index
                * @attribute upArrowTabIndex
                * @type Integer
                * @default 2
                */
                upArrowTabIndex: 2,
                /**
                * Down arrow element's tab index
                * @attribute downArrowTabIndex
                * @type Integer
                * @default 4
                */
                downArrowTabIndex: 4,
                /**
                * Text element's accessibility object from which text element's hack-div will be created
                * @attribute textAccObj
                * @type Object
                * @default null
                */
                textAccObj: null,
                /**
                * Up arrow element's accessibility object from which up arrow element's hack-div will be created
                * @attribute upArrowAccObj
                * @type Object
                * @default null
                */
                upArrowAccObj: null,
                /**
                * Down arrow element's accessibility object from which down arrow element's hack-div will be created
                * @attribute downArrowAccObj
                * @type Object
                * @default null
                */
                downArrowAccObj: null,
                /**
                * Boolean indicating whether values are to be incremented in steps
                * @attribute isStepper
                * @type Boolean
                * @default false
                */
                isStepper: false,
                /**
                * Stores values for stepper functionality
                * @attribute stepperValues
                * @type Array
                * @default []
                */
                stepperValues: [],
                /**
                * Stores index of currently selected stepper value
                * @attribute currentStepperIndex
                * @type Number
                * @default 0
                */
                currentStepperIndex: 0,

                /**
                * Spinner Button color.
                * @attribute buttonFontColor
                * @type String
                * @default #FFFFFF
                */
                buttonFontColor: '#FFFFFF',

                /**
                * Button font size.
                * @attribute buttonFontSize
                * @type Number
                * @default 14
                */
                buttonFontSize: 14,
                /**
                * specifies font awesome class for spinner down button.
                * @attribute downBtnFontAwesomeClass
                * @type string
                * @default 'minus'
                */
                downBtnFontAwesomeClass: 'minus',
                /**
                * specifies font awesome class for spinner up button.
                * @attribute upBtnFontAwesomeClass
                * @type string
                * @default 'plus'
                */
                upBtnFontAwesomeClass: 'plus',
            }
        },

        /**
        * @namespace MathInteractives.Common.Components.Models
        * @class CustomSpinner 
        * @constructor
        */
        initialize: function initialize() {
            var textAccObj = null;

            if (this.get('emptySpinnerAccText') === null) {
                this.setEmptySpinnerAccText('%@$%');
            }
            if (this.get('defaultAccText') === null) {
                this.setDefaultAccText('%@$%');
            }
            if (this.get('minLimitAccText') === null) {
                this.setMinLimitAccText('%@$%');
            }
            if (this.get('maxLimitAccText') === null) {
                this.setMaxLimitAccText('%@$%');
            }
            if (this.get('onIncreaseAccText') === null) {
                this.setOnIncreaseAccText('%@$%');
            }
            if (this.get('onDecreaseAccText') === null) {
                this.setOnDecreaseAccText('%@$%');
            }
            if (this.get('emptySpinnerPlaceHolders') === null) {
                this.setEmptySpinnerPlaceHolders([MathInteractives.global.Theme2.CustomSpinner.MIN_VAL, MathInteractives.global.Theme2.CustomSpinner.MAX_VAL]);
            }
            if (this.get('defaultPlaceHolders') === null) {
                this.setDefaultPlaceHolders([MathInteractives.global.Theme2.CustomSpinner.CURR_VAL]);
            }
            if (this.get('minLimitPlaceHolders') === null) {
                this.setMinLimitPlaceHolders([MathInteractives.global.Theme2.CustomSpinner.MIN_VAL]);
            }
            if (this.get('maxLimitPlaceHolders') === null) {
                this.setMaxLimitPlaceHolders([MathInteractives.global.Theme2.CustomSpinner.MAX_VAL]);
            }
            if (this.get('onIncreasePlaceHolders') === null) {
                this.setOnIncreasePlaceHolders([MathInteractives.global.Theme2.CustomSpinner.CURR_VAL]);
            }
            if (this.get('onDecreasePlaceHolders') === null) {
                this.setOnDecreasePlaceHolders([MathInteractives.global.Theme2.CustomSpinner.CURR_VAL]);
            }

            this.setScreenId(this.getSpinId().replace(this.getIdPrefix(), ''));
            if (this.getIsEditable()) {
                this._setTextAccId(this.getScreenId() + '-texttextbox');
            } else {
                this._setTextAccId(this.getScreenId() + '-text');
            }
            this._setTabIndex(this.getTabIndex());
            textAccObj = {
                "elementId": this.getTextAccId(),
                "tabIndex": this.getTabIndex(),
                "acc": this.getDefaultAccText()
            };
            this._setTextAccObj(textAccObj);
            //this.setButtonAccText();
        },

        /**
        * Initialize button acc text.
        * @method setButtonAccText
        * @public
        */
        setButtonAccText: function setButtonAccText() {
            var upArrowAccObj = null,
                downArrowAccObj = null;

            this._setUpArrowAccId(this.getScreenId() + '-up-arrow');
            this._setDownArrowAccId(this.getScreenId() + '-down-arrow');
            this._setUpArrowTabIndex(this.getTabIndex() + 2);
            this._setDownArrowTabIndex(this.getUpArrowTabIndex() + 2);

            upArrowAccObj = {
                "elementId": this.getUpArrowAccId(),
                "tabIndex": this.getUpArrowTabIndex(),
                "acc": this.getUpArrowAccText(),
                "role": "button"
            };
            downArrowAccObj = {
                "elementId": this.getDownArrowAccId(),
                "tabIndex": this.getDownArrowTabIndex(),
                "acc": this.getDownArrowAccText(),
                "role": "button"
            };
            this._setUpArrowAccObj(upArrowAccObj);
            this._setDownArrowAccObj(downArrowAccObj);
        },

        /**
        * Getter function for property Spin id
        * @method getId
        * @return {String} The DOM Spin id of custom spinner to be displayed
        * @public
        */
        getSpinId: function getSpinId() {
            return this.get('spinId');
        },

        /**
        * Setter function for property Spin id
        * @method setId
        * @param value {String} The DOM Spin id of custom spinner to be displayed
        * @public
        */
        setSpinId: function setSpinId(value) {
            this.set('spinId', value);
        },

        /**
        * Getter function for property Id Prefix
        * @method getId
        * @return {String} The DOM Id Prefix of custom spinner to be displayed
        * @public
        */
        getIdPrefix: function getIdPrefix() {
            return this.get('idPrefix');
        },

        /**
        * Setter function for property Id Prefix
        * @method setId
        * @param value {String} The DOM Id Prefix of custom spinner to be displayed
        * @public
        */
        setIdPrefix: function setIdPrefix(value) {
            this.set('idPrefix', value);
        },

        /**
        * Getter function for property path
        * @method getPath
        * @return {String} path of Button
        * @public
        */
        getPath: function getPath() {
            return this.get('path');
        },

        /**
        * Setter function for property path
        * @method setPath
        * @param value {String} path of Button
        * @public
        */
        setPath: function setPath(value) {
            this.set('path', value);
        },

        /**
        * Getter function for manager
        * @method getManager
        * @return {Object} Manager object
        * @public
        */
        getManager: function getManager() {
            return this.get('manager');
        },

        /**
        * Setter function for manager
        * @method setManager
        * @param {Object} Manager object
        * @public
        */
        setManager: function setManager(manager) {
            this.set('manager', manager);
        },

        /**
        * Getter function for player
        * @method getPlayer
        * @return {Object} Player view
        * @public
        */
        getPlayer: function getPlayer() {
            return this.get('player');
        },

        /**
        * Getter function for property height
        * @method getHeight
        * @return {Number} The height of the spinner div
        * @public
        */
        getHeight: function getHeight() {
            return this.get('height');
        },

        /**
        * Setter function for property height
        * @method setHeight
        * @param value {Number} The height of the spinner div
        * @public
        */
        setHeight: function setHeight(value) {
            this.set('height', value);
        },

        /**
        * Getter function for property width
        * @method getWidth
        * @return {Number} The width of the spinner div
        * @public
        */
        getWidth: function getWidth() {
            return this.get('width');
        },

        /**
        * Setter function for property width
        * @method setWidth
        * @param value {Number} The width of the spinner div
        * @public
        */
        setWidth: function setWidth(value) {
            this.set('width', value);
        },

        /**
        * Getter function for property minValue
        * @method getMinValue
        * @return {Number} The minValue of the spinning range
        * @public
        */
        getMinValue: function getMinValue() {
            return this.get('minValue');
        },

        /**
        * Setter function for property minValue
        * @method setMinValue
        * @param value {Number} The minValue of the spinning range
        * @public
        */
        setMinValue: function setMinValue(value) {
            this.set('minValue', value);
        },

        /**
        * Getter function for property maxValue
        * @method getMaxValue
        * @return {Number} The maxValue of the spinning range
        * @public
        */
        getMaxValue: function getMaxValue() {
            return this.get('maxValue');
        },

        /**
        * Setter function for property maxValue
        * @method setMaxValue
        * @param value {Number} The maxValue of the spinning range
        * @public
        */
        setMaxValue: function setMaxValue(value) {
            this.set('maxValue', value);
        },

        /**
        * Getter function for property value
        * @method getValue
        * @return {Number} The value of the spinning range
        * @public
        */
        getValue: function getValue() {
            return this.get('value');
        },

        /**
        * Setter function for property value
        * @method setValue
        * @param value {Number} The value of the spinning range
        * @public
        */
        setValue: function setValue(value) {
            this.set('value', value);
        },

        /**
        * Getter function for property step
        * @method getStepValue
        * @return {Number} The step value of the spinning range
        * @public
        */
        getStepValue: function getStepValue() {
            return this.get('step');
        },

        /**
        * Setter function for property step
        * @method setStepValue
        * @param value {Number} The step value of the spinning range
        * @public
        */
        setStepValue: function setStepValue(stepValue) {
            this.set('step', stepValue);
        },

        /**
        * Getter function for property showSign
        * @method getShowSign
        * @return {Boolean} True if sign is to be displayed
        * @public
        */
        getShowSign: function getShowSign() {
            return this.get('showSign');
        },

        /**
        * Setter function for property showSign
        * @method setShowSign
        * @param value {Boolean} True if sign is to be displayed
        * @public
        */
        setShowSign: function setShowSign(value) {
            this.set('showSign', value);
        },

        /**
        * Getter function for property screenId
        * @method getScreenId
        * @return {String} The screen ID of custom spinner screen to be loaded
        * @public
        */
        getScreenId: function getScreenId() {
            return this.get('screenId');
        },

        /**
        * Setter function for property screenId
        * @method setScreenId
        * @param value {String} The screen ID of custom spinner screen to be loaded
        * @public
        */
        setScreenId: function setScreenId(value) {
            this.set('screenId', value);
        },

        /**
        * Getter function for buttonState
        * @method getPath
        * @return {String} path of Button
        * @public
        */
        getButtonState: function getButtonState() {
            return this.get('buttonState');
        },

        /**
        * Setter function for buttonState
        * @method setButtonState
        * @param {String} btnState State of the button.
        * @public
        */
        setButtonState: function setButtonState(btnState) {
            this.set('buttonState', btnState);
        },

        /**
        * Getter function for isEditable
        * @method getIsEditable
        * @return {Boolean} Whether textbox is editable
        * @public
        */
        getIsEditable: function getIsEditable() {
            return this.get('isEditable');
        },

        /**
        * Setter function for buttonState
        * @method setButtonState
        * @param {Boolean} isEditable Text box to be editable.
        * @public
        */
        setIsEditable: function getIsEditable(isEditable) {
            this.set('isEditable', isEditable)
        },

        /**
        * Getter function for alignType
        * @method getAlignType
        * @return {String} Alignment of text-box with respect to buttons.
        * @public
        */
        getAlignType: function getAlignType() {
            return this.get('alignType');
        },

        /**
        * Setter function for button alignment
        * @method setButtonState
        * @param isBottomAligned {Boolean} Buttons to be bottom aligned.
        * @public
        */
        setIsBottomAligned: function getIsBottomAligned(isBottomAligned) {
            this.set('isBottomAligned', isBottomAligned);
        },

        /**
        * Getter function for input type validations
        * @method getInputType
        * @return {String} Type of allowed input 
        * @public
        */
        getInputType: function getInputType() {
            return this.get('inputType');
        },

        /**
        * Getter function for input box precision value after decimal point
        * @method getInputPrecision
        * @return {Number} Precision value
        * @public
        */
        getInputPrecision: function getInputPrecision() {
            return this.get('inputPrecision')
        },

        /**
        * Getter function for maximum charecter allowed in the input box.
        * @method getMaxCharLength
        * @return {Number} maximum allowed charecters
        * @public
        */
        getMaxCharLength: function getMaxCharLength() {
            return this.get('maxCharLength');
        },

        /**
        * Getter function for regular expression for entries allowed in the input box.
        * @method getInputRegEx
        * @return {String} regular expression to be applied
        * @public
        */
        getInputRegEx: function getInputRegEx() {
            return this.get('inputRegEx');
        },

        /**
        * Sets the accessibility text for spinner text box when empty.
        * @method setEmptySpinnerAccText
        * @param emptySpinnerAccText {String} Accessibility text for spinner text box when empty.
        * @public
        */
        setEmptySpinnerAccText: function setEmptySpinnerAccText(emptySpinnerAccText) {
            var textAccObj = this.getTextAccObj();

            this.set('emptySpinnerAccText', emptySpinnerAccText);
            if (textAccObj !== null && (emptySpinnerAccText !== null || emptySpinnerAccText !== undefined)) {
                textAccObj.acc = emptySpinnerAccText;
                this._setTextAccObj(textAccObj);
            }
        },

        /**
        * Gets accessibility text for spinner text box when empty.
        * @method getEmptySpinnerAccText
        * @return {String} Accessibility text for spinner text box when empty.
        * @public
        */
        getEmptySpinnerAccText: function getEmptySpinnerAccText() {
            return this.get('emptySpinnerAccText');
        },

        /**
        * Sets the place holders for the default accessibility text
        * @method setEmptySpinnerPlaceHolders
        * @param emptyPlaceHolders {Array} Place holders for the default accessibility text
        * @public
        */
        setEmptySpinnerPlaceHolders: function setEmptySpinnerPlaceHolders(emptyPlaceHolders) {
            this.set('emptySpinnerPlaceHolders', emptyPlaceHolders);
        },

        /**
        * Gets the place holders for the default accessibility text
        * @method getEmptySpinnerPlaceHolders
        * @return {Array} Place holders for the default accessibility text
        * @public
        */
        getEmptySpinnerPlaceHolders: function getEmptySpinnerPlaceHolders() {
            return this.get('emptySpinnerPlaceHolders');
        },

        /**
        * Sets the default accessibility text for the input box
        * @method setDefaultAccText
        * @param defaultAccText {String} Accessibility text for the input box
        * @public
        */
        setDefaultAccText: function setDefaultAccText(defaultAccText) {
            var textAccObj = this.getTextAccObj(),
                emptyAccText = this.getEmptySpinnerAccText();

            this.set('defaultAccText', defaultAccText);
            if (textAccObj !== null && (emptyAccText === null || emptyAccText === undefined)) {
                textAccObj.acc = defaultAccText;
                this._setTextAccObj(textAccObj);
            }
        },

        /**
        * Gets the default accessibility text for the input box
        * @method getDefaultAccText
        * @return {String} Accessibility text for the input box
        * @public
        */
        getDefaultAccText: function getDefaultAccText() {
            return this.get('defaultAccText');
        },

        /**
        * Sets the place holders for the default accessibility text
        * @method setDefaultPlaceHolders
        * @param defaultPlaceHolders {Array} Place holders for the default accessibility text
        * @public
        */
        setDefaultPlaceHolders: function setDefaultPlaceHolders(defaultPlaceHolders) {
            this.set('defaultPlaceHolders', defaultPlaceHolders);
        },

        /**
        * Gets the place holders for the default accessibility text
        * @method getDefaultPlaceHolders
        * @return {Array} Place holders for the default accessibility text
        * @public
        */
        getDefaultPlaceHolders: function getDefaultPlaceHolders() {
            return this.get('defaultPlaceHolders');
        },

        /**
        * Sets the minimum limit accessibility text for the input box
        * @method setMinLimitAccText
        * @param minLimitAccText {String} Minimum limit accessibility text for the input box
        * @public
        */
        setMinLimitAccText: function setMinLimitAccText(minLimitAccText) {
            this.set('minLimitAccText', minLimitAccText);
        },

        /**
        * Gets the minimum limit accessibility text for the input box
        * @method getMinLimitAccText
        * @return {String} Minimum limit accessibility text for the input box
        * @public
        */
        getMinLimitAccText: function getMinLimitAccText() {
            return this.get('minLimitAccText');
        },

        /**
        * Sets the place holders for the minimum limit accessibility text
        * @method setMinLimitPlaceHolders
        * @param minLimitPlaceHolders {Array} Place holders for the minimum limit accessibility text
        * @public
        */
        setMinLimitPlaceHolders: function setMinLimitPlaceHolders(minLimitPlaceHolders) {
            this.set('minLimitPlaceHolders', minLimitPlaceHolders);
        },

        /**
        * Gets the place holders for the minimum limit accessibility text
        * @method getMinLimitPlaceHolders
        * @return {Array} Place holders for the minimum limit accessibility text
        * @public
        */
        getMinLimitPlaceHolders: function getMinLimitPlaceHolders() {
            return this.get('minLimitPlaceHolders');
        },

        /**
        * Sets the maximum limit accessibility text for the input box
        * @method setMaxLimitAccText
        * @param maxLimitAccText {String} Maximum limit accessibility text for the input box
        * @public
        */
        setMaxLimitAccText: function setMaxLimitAccText(maxLimitAccText) {
            this.set('maxLimitAccText', maxLimitAccText);
        },

        /**
        * Gets the maximum limit accessibility text for the input box
        * @method getMaxLimitAccText
        * @return {String} Maximum limit accessibility text for the input box
        * @public
        */
        getMaxLimitAccText: function getMaxLimitAccText() {
            return this.get('maxLimitAccText');
        },

        /**
        * Sets the place holders for the maximum limit accessibility text
        * @method setMaxLimitPlaceHolders
        * @param maxLimitPlaceHolders {String} Place holders for the maximum limit accessibility text
        * @public
        */
        setMaxLimitPlaceHolders: function setMaxLimitPlaceHolders(maxLimitPlaceHolders) {
            this.set('maxLimitPlaceHolders', maxLimitPlaceHolders);
        },

        /**
        * Gets the place holders for the maximum limit accessibility text
        * @method getMaxLimitPlaceHolders
        * @return {Array} Place holders for the maximum limit accessibility text
        * @public
        */
        getMaxLimitPlaceHolders: function getMaxLimitPlaceHolders() {
            return this.get('maxLimitPlaceHolders');
        },

        /**
        * Sets the on-increase accessibility text for the input box
        * @method setOnIncreaseAccText
        * @param onIncreaseAccText {String} Accessibility text for the input box when the increase button is pressed
        * @public
        */
        setOnIncreaseAccText: function setOnIncreaseAccText(onIncreaseAccText) {
            this.set('onIncreaseAccText', onIncreaseAccText);
        },

        /**
        * Gets the on-increase accessibility text for the input box
        * @method getOnIncreaseAccText
        * @return {String} Accessibility text for the input box when the increase button is pressed
        * @public
        */
        getOnIncreaseAccText: function getOnIncreaseAccText() {
            return this.get('onIncreaseAccText');
        },

        /**
        * Sets the place holders for the on-increase accessibility text
        * @method setOnIncreasePlaceHolders
        * @param onIncreasePlaceHolders {Array} Place holders for the on-increase accessibility text
        * @public
        */
        setOnIncreasePlaceHolders: function setOnIncreasePlaceHolders(onIncreasePlaceHolders) {
            this.set('onIncreasePlaceHolders', onIncreasePlaceHolders);
        },

        /**
        * Gets the place holders for the on-increase accessibility text
        * @method getOnIncreasePlaceHolders
        * @return {Array} Place holders for the on-increase accessibility text
        * @public
        */
        getOnIncreasePlaceHolders: function getOnIncreasePlaceHolders() {
            return this.get('onIncreasePlaceHolders');
        },

        /**
        * Sets the on-decrease accessibility text for the input box
        * @method setOnDecreaseAccText
        * @param onDecreaseAccText {String} Accessibility text for the input box when the decrease button is pressed
        * @public
        */
        setOnDecreaseAccText: function setOnDecreaseAccText(onDecreaseAccText) {
            this.set('onDecreaseAccText', onDecreaseAccText);
        },

        /**
        * Gets the on-decrease accessibility text for the input box
        * @method getOnDecreaseAccText
        * @return {String} Accessibility text for the input box when the decrease button is pressed
        * @public
        */
        getOnDecreaseAccText: function getOnDecreaseAccText() {
            return this.get('onDecreaseAccText');
        },

        /**
        * Sets the place holders for the on-decrease accessibility text
        * @method setOnDecreasePlaceHolders
        * @param onDecreasePlaceHolders {Array} Place holders for the on-decrease accessibility text
        * @public
        */
        setOnDecreasePlaceHolders: function setOnDecreasePlaceHolders(onDecreasePlaceHolders) {
            this.set('onDecreasePlaceHolders', onDecreasePlaceHolders);
        },

        /**
        * Gets the place holders for the on-decrease accessibility text
        * @method getOnDecreasePlaceHolders
        * @return {Array} Place holders for the on-decrease accessibility text
        * @public
        */
        getOnDecreasePlaceHolders: function getOnDecreasePlaceHolders() {
            return this.get('onDecreasePlaceHolders');
        },

        /**
        * Sets the accessibility text for the up arrow
        * @method setUpArrowAccText
        * @param upArrowAccText {String} Accessibility text for the up arrow
        * @public
        */
        setUpArrowAccText: function setUpArrowAccText(upArrowAccText) {
            this.set('upArrowAccText', upArrowAccText);
            var upArrowAccObj = this.getUpArrowAccObj();
            if (upArrowAccObj !== null) {
                upArrowAccObj.acc = upArrowAccText;
                this._setTextAccObj(upArrowAccObj);
            }
        },

        /**
        * Gets the accessibility text for the up arrow
        * @method getUpArrowAccText
        * @return {String} Accessibility text for the up arrow
        * @public
        */
        getUpArrowAccText: function getUpArrowAccText() {
            return this.get('upArrowAccText');
        },

        /**
        * Sets the accessibility text for the down arrow
        * @method setDownArrowAccText
        * @param downArrowAccText {String} Accessibility text for the down arrow
        * @public
        */
        setDownArrowAccText: function setDownArrowAccText(downArrowAccText) {
            this.set('downArrowAccText', downArrowAccText);
            var downArrowAccObj = this.getDownArrowAccObj();
            if (downArrowAccObj !== null) {
                downArrowAccObj.acc = downArrowAccText;
                this._setDownArrowAccObj(downArrowAccObj);
            }
        },

        /**
        * Gets the accessibility text for the down arrow
        * @method getDownArrowAccText
        * @return {String} Accessibility text for the down arrow
        * @public
        */
        getDownArrowAccText: function getDownArrowAccText() {
            return this.get('downArrowAccText');
        },

        /**
        * Sets the text element's accessibility id
        * @method _setTextAccId
        * @param textAccId {String} Text element's accessibility id
        * @private
        */
        _setTextAccId: function _setTextAccId(textAccId) {
            this.set('textAccId', textAccId);
            var textAccObj = this.getTextAccObj();
            if (textAccObj !== null) {
                textAccObj.elementId = textAccId;
                this._setTextAccObj(textAccObj);
            }
        },

        /**
        * Gets the text element's accessibility id
        * @method getTextAccId
        * @return {String} Text element's accessibility id
        * @public
        */
        getTextAccId: function getTextAccId() {
            return this.get('textAccId');
        },

        /**
        * Sets the up arrow element's accessibility id
        * @method _setUpArrowAccId
        * @param upArrowAccId {String} Up arrow element's accessibility id
        * @private
        */
        _setUpArrowAccId: function _setUpArrowAccId(upArrowAccId) {
            this.set('upArrowAccId', upArrowAccId);
            var upArrowAccObj = this.getUpArrowAccObj();
            if (upArrowAccObj !== null) {
                upArrowAccObj.elementId = upArrowAccId;
                this._setTextAccObj(upArrowAccObj);
            }
        },

        /**
        * Gets the up arrow element's accessibility id
        * @method getUpArrowAccId
        * @return {String} Up arrow element's accessibility id
        * @public
        */
        getUpArrowAccId: function getUpArrowAccId() {
            return this.get('upArrowAccId');
        },

        /**
        * Sets the down arrow element's accessibility id
        * @method _setDownArrowAccId
        * @param downArrowAccId {String} Down arrow element's accessibility id
        * @private
        */
        _setDownArrowAccId: function _setDownArrowAccId(downArrowAccId) {
            this.set('downArrowAccId', downArrowAccId);
            var downArrowAccObj = this.getDownArrowAccObj();
            if (downArrowAccObj !== null) {
                downArrowAccObj.elementId = downArrowAccId;
                this._setDownArrowAccObj(downArrowAccObj);
            }
        },

        /**
        * Gets the down arrow element's accessibility id
        * @method getDownArrowAccId
        * @return {String} Down arrow element's accessibility id
        * @public
        */
        getDownArrowAccId: function getDownArrowAccId() {
            return this.get('downArrowAccId');
        },

        /**
        * Sets the text element's tab index
        * @method _setTabIndex
        * @param tabIndex {Integer} Text element's tab index
        * @private
        */
        _setTabIndex: function _setTabIndex(tabIndex) {
            this.set('tabIndex', parseInt(tabIndex));
            var textAccObj = this.getTextAccObj();
            if (textAccObj !== null) {
                textAccObj.tabIndex = tabIndex;
                this._setTextAccObj(textAccObj);
            }
        },

        /**
        * Gets the text element's tab index
        * @method getTabIndex
        * @return {String} Text element's tab index
        * @public
        */
        getTabIndex: function getTabIndex() {
            return this.get('tabIndex');
        },

        /**
        * Sets the up arrow element's tab index
        * @method _setUpArrowTabIndex
        * @param upArrowTabIndex {Integer} Up arrow element's tab index
        * @private
        */
        _setUpArrowTabIndex: function _setUpArrowTabIndex(upArrowTabIndex) {
            this.set('upArrowTabIndex', parseInt(upArrowTabIndex));
            var upArrowAccObj = this.getUpArrowAccObj();
            if (upArrowAccObj !== null) {
                upArrowAccObj.tabIndex = upArrowTabIndex;
                this._setTextAccObj(upArrowAccObj);
            }
        },

        /**
        * Gets the up arrow element's tab index
        * @method getUpArrowTabIndex
        * @return {String} Up arrow element's tab index
        * @public
        */
        getUpArrowTabIndex: function getUpArrowTabIndex() {
            return this.get('upArrowTabIndex');
        },

        /**
        * Sets the down arrow element's tab index
        * @method _setDownArrowTabIndex
        * @param downArrowTabIndex {Integer} Down arrow element's tab index
        * @private
        */
        _setDownArrowTabIndex: function _setDownArrowTabIndex(downArrowTabIndex) {
            this.set('downArrowTabIndex', parseInt(downArrowTabIndex));
            var downArrowAccObj = this.getDownArrowAccObj();
            if (downArrowAccObj !== null) {
                downArrowAccObj.tabIndex = downArrowTabIndex;
                this._setDownArrowAccObj(downArrowAccObj);
            }
        },

        /**
        * Gets the down arrow element's tab index
        * @method getDownArrowTabIndex
        * @return {String} Down arrow element's tab index
        * @public
        */
        getDownArrowTabIndex: function getDownArrowTabIndex() {
            return this.get('downArrowTabIndex');
        },

        /**
        * Sets the text element's accessibility object
        * @method _setTextAccObj
        * @param textAccObj {Object} Text element's accessibility object
        * @private
        */
        _setTextAccObj: function _setTextAccObj(textAccObj) {
            this.set('textAccObj', textAccObj);
        },

        /**
        * Gets the text element's accessibility object
        * @method getTextAccObj
        * @return {Object} Text element's accessibility object
        * @public
        */
        getTextAccObj: function getTextAccObj() {
            return this.get('textAccObj');
        },

        /**
        * Sets the up arrow element's accessibility object
        * @method _setUpArrowAccObj
        * @param upArrowAccObj {Object} Up arrow element's accessibility object
        * @private
        */
        _setUpArrowAccObj: function _setUpArrowAccObj(upArrowAccObj) {
            this.set('upArrowAccObj', upArrowAccObj);
        },

        /**
        * Gets the up arrow element's accessibility object
        * @method getUpArrowAccObj
        * @return {Object} Up arrow element's accessibility object
        * @public
        */
        getUpArrowAccObj: function getUpArrowAccObj() {
            return this.get('upArrowAccObj');
        },

        /**
        * Sets the down arrow element's accessibility object
        * @method _setDownArrowAccObj
        * @param downArrowAccObj {Object} Down arrow element's accessibility object
        * @private
        */
        _setDownArrowAccObj: function _setDownArrowAccObj(downArrowAccObj) {
            this.set('downArrowAccObj', downArrowAccObj);
        },

        /**
        * Gets the down arrow element's accessibility object
        * @method getDownArrowAccObj
        * @return {Object} Down arrow element's accessibility object
        * @public
        */
        getDownArrowAccObj: function getDownArrowAccObj() {
            return this.get('downArrowAccObj');
        }

    });
})();