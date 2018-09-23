
(function () {
    'use strict';

    /**
    * Conatins Slider data
    * @class Slider
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.Slider = Backbone.Model.extend({

        defaults: {

            /**
            * ID of the container in which the slider is present
            * @property containerId
            * @type String
            * @defaults Empty string
            */
            containerId: '',

            /**
            * Slider ID
            * @property sliderId
            * @type String
            * @defaults Empty string
            */
            sliderId: '',

            /**
            * Slider width
            * @property width
            * @type Number
            * @defaults 200
            */
            width: 200,

            /**
            * Slider height
            * @property height
            * @type Number
            * @defaults 8
            */
            height: 8,

            /**
            * Minimum value 
            * @property minValue
            * @type Number
            * @defaults 1
            */
            minValue: 1,

            /**
            * Maximum value 
            * @property maxValue
            * @type Number
            * @defaults 10
            */
            maxValue: 10,

            /**
            * Slider interval size
            * @property step
            * @type Number
            * @defaults 1
            */
            step: 1,

            /**
            * Whether the handle should move smoothly on slider
            * @property smoothSliding
            * @type Boolean
            * @defaults true
            */
            smoothSliding: true,

            /**
            * Animation duration of slider
            * @property animate
            * @type String/ Boolean/ Number
            * @defaults true
            */
            animate: false,

            /**
            * Slider ID
            * @property orientation
            * @type String
            * @defaults Empty string
            */
            orientation: 'horizontal',

            /**
            * Slider ID
            * @property selectedValue
            * @type String
            * @defaults Empty string
            */
            selectedValue: 1,

            /**
            * Callback function when slider value changes
            * @property onChange
            * @type Object
            * @defaults null
            */
            onChange: null,

            /**
            * Callback function when sliding is on
            * @property onSlide
            * @type Object
            * @defaults null
            */
            onSlide: null,

            /**
            * Callback function on stopping sliding
            * @property onStop
            * @type Object
            * @defaults null
            */
            onStop: null,

            /**
            * Callback function on starting to slide
            * @property onStart
            * @type Object
            * @defaults null
            */
            onStart: null,

            /**
            * Tab index of slider handle
            * @property tabIndex
            * @type Number
            * @defaults -1
            */
            tabIndex: null,
            /**
            * Whether or not the slider has background image
            * @property isBackgroundImage
            * @type Boolean
            * @defaults true
            */
            isBackgroundImage: true,
            /**
            * Slider handle type.
            * @property _sliderHandleType
            * @type Number
            * @defaults 1
            */
            sliderHandleType: null,

            /**
            * Whether or not to append labels for slider
            * @property appendLabel
            * @type Boolean
            * @defaults true
            */
            appendLabel: true,

            /**
            * Specific points to snap to
            * @property points
            * @type Array
            * @defaults null
            */
            points: null,

            /**
            * Enables keyboard navigation
            * @property isAllowKeyboardNavigation
            * @type Bool
            * @defaults false
            */
            isAllowKeyboardNavigation: false,
            intervalGap:null,
            showIntervals:false
        },

        /**
        * Updates current selected value of slider in the model
        * @method updateSelectedValue
        * @param {Number} [value] Value to be set
        */
        updateSelectedValue: function (value) {
            this.set('selectedValue', value);
        }

    }, {

        /**
        * Constant used to space the intervals of slider closer,
        * so that sliding is smooth
        * @property SLIDER_INTERVAL_DIVIDER
        * @static
        */
        SLIDER_INTERVAL_DIVIDER: 30,

        /**
        * Width of the left end image of the slider
        * @property LEFT_IMAGE_WIDTH
        * @static
        */
        LEFT_IMAGE_WIDTH: 5,

        /**
        * Width of the right end image of the slider
        * @property RIGHT_IMAGE_WIDTH
        * @static
        */
        RIGHT_IMAGE_WIDTH: 5

    });
})();