(function() {
    'use strict';
    /**
     * A customized Backbone.Model that represents Calculator
     * @module Calculator
     * @class Calculator
     * @constructor
     * @extends Backbone.Model
     * @namespace Tools.Calculator.Models
     */
    MathUtilities.Tools.Calculator.Models.Calculator = Backbone.Model.extend({
        /**
         * Specifies the default values of model properties.
         * @property defaults
         * @type Object
         */
        "defaults": {
            /**
             * Stores json data required for calculator.
             * @property jsonData
             * @type Object
             * @default null
             */
            "jsonData": null,

            /**
             * Identifies the currently selected unit of angular measurement.
             * @property isAngularMeasurementUnitDegree
             * @type Boolean
             * @default false
             */
            "isAngularMeasurementUnitDegree": false,

            /**
             * Identifies if result of computation should be displayed in scientific notation or not.
             * @property displayResultInScientificNotation
             * @type Boolean
             * @default false
             */
            "displayResultInScientificNotation": false,

            /**
             * Identifies the current expression in the display screen.
             * @property currentScreenState
             * @type String
             * @default ""
             */
            "currentScreenState": ""
        },

        /**
         * Sets jsonData property
         * @method parseData
         * @param {Object} jsonData Its JSON data for Calculator
         * @return
         */
        "parseData": function(jsonData) {
            this.set('jsonData', jsonData);
        }
    }, {
        /**
         * Identifies Number of digits to display in output screen
         * @property OUTPUT_LENGTH
         * @type Number
         * @static
         * @final
         **/
        "OUTPUT_LENGTH": 15,

        /**
         * @property KEYCODE_LEFT
         * @static
         * @type Integer
         */
        "KEYCODE_LEFT": 37,

        /**
         * @property KEYCODE_RIGHT
         * @static
         * @type Integer
         */
        "KEYCODE_RIGHT": 39,

        /**
         * @property KEYCODE_UP
         * @static
         * @type Integer
         */
        "KEYCODE_UP": 38,

        /**
         * @property KEYCODE_DOWN
         * @static
         * @type Integer
         */
        "KEYCODE_DOWN": 40,
        /**
         * @property KEYCODE_TAB
         * @static
         * @type Integer
         */
        "KEYCODE_TAB": 9
    });
})();
