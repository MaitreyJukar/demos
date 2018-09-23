(function(MathUtilities) {
    'use strict';


    /* Initialize MathUtilities Data */
    MathUtilities.Components.Slider = {};

    /**
     * Packages all the views used in the Slider module.
     * @module Views
     * @namespace MathUtilites.Components.Slider
     **/
    MathUtilities.Components.Slider.Views = {};

    /**
     * Packages all the models used in the Slider module.
     * @module Models
     * @namespace MathUtilites.Components.Slider
     **/
    MathUtilities.Components.Slider.Models = {};

    /**
     * A customized Backbone.Model that represents CustomSlider
     * @class slider
     * @constructor
     * @namespace MathUtilities.Components.Slider.Models
     * @extends Backbone.Model
     */
    MathUtilities.Components.Slider.Models.slider = Backbone.Model.extend({

        /**
         * @property defaults
         * @type Object
         */

        "defaults": {

            /**
             * @property min
             * @type Integer
             * @default -10
             */
            "min": -10,

            /**
             * @property max
             * @type Integer
             * @default 10
             */
            "max": 10,

            /**
             * @property step
             * @type Integer
             * @default -10
             */
            "step": 0.1,

            /**
             * @property val
             * @type Integer
             * @default 0
             */
            "val": 0,

            /**
             * @property currValue
             * @type Integer
             * @default 0
             */

            "currValue": 0,

            /**
             * @property currValuehide
             * @type boolean
             * @default false
             */
            "currValueHide": false,

            /**
             * @property sliderName
             * @type String
             * @default null
             */
            "sliderName": null,

            /**
             * @property orientation
             * @type String
             * @default horizontal
             */
            "orientation": 'horizontal',

            /**
             * @property valueDisplay
             * @type Boolean
             * @default true
             */
            "valueDisplay": true,

            /**
             * @property stepFunctionality
             * @type Boolean
             * @default true
             */
            "stepFunctionality": true,
            /**
             * @property ellipsesLimit
             * @type Number
             * @default 3
             */
            "ellipsesLimit": 3
        },

        /**
         * Sets new parameters for custom-slider
         * @method parseData
         * @param {Integer} min. It gives the minimum value for custom-slider.
         * @param {Integer} max. It gives the maximum value for custom-slider.
         * @param {Integer} step.It gives the step value for custom-slider header.
         * @param {Integer} val.It gives the initial position for custom-slider header.
         * @param {String} sliderName.It gives name to the slider added.
         * @param {String} orientation.Indicates what type of slider it is (horizontal or vertical).
         * @param {Boolean} valueDisplay.Indicates whether to display min / max values for slider.
         * @param {Boolean} stepFunctionality.Indicates whether functionality to change step is required.
         */
        "parseData": function(min, max, step, val, sliderName, orientation, valueDisplay, stepFunctionality) {

            this.set({

                "min": min,
                "max": max,
                "step": step,
                "val": val,
                "sliderName": sliderName,
                "orientation": orientation,
                "valueDisplay": valueDisplay,
                "stepFunctionality": stepFunctionality

            })
        }
    })
}(window.MathUtilities));
