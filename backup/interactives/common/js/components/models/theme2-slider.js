
(function () {
    'use strict';

    /**
    * Contains Slider data
    * @class Slider
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    MathInteractives.Common.Components.Theme2.Models.Slider = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * ID of the container in which the slider is present
                * @property containerId
                * @type String
                * @default null
                */
                containerId: null,

                /**
                * Slider ID
                * @property sliderId
                * @type String
                * @default null
                */
                sliderId: null,

                /**
                * Screen ID of slider
                * @property screenId
                * @type String
                * @default null
                */
                screenId: null,

                /**
                * Minimum value 
                * @property minValue
                * @type Number
                * @default 1
                */
                minValue: 1,

                /**
                * Maximum value 
                * @property maxValue
                * @type Number
                * @default 10
                */
                maxValue: 10,

                /**
                * Currently selected value of slider
                * @property selectedValue
                * @type Number
                * @default null
                */
                selectedValue: null,

                /**
                * Currently nearest value to slider handle
                * @property nearestValue
                * @type Number
                * @default null
                */
                nearestValue: null,

                /**
                * Slider interval size
                * @property step
                * @type Number
                * @default 1
                */
                step: 1,

                /**
                * Whether the handle should move smoothly on slider
                * @property smoothSliding
                * @type Boolean
                * @default true
                */
                smoothSliding: true,

                /**
                * Animation duration of slider
                * @property animate
                * @type String/ Boolean/ Number
                * @default false
                */
                animate: false,

                /**
                * Slider orientation (Horizontal or vertical)
                * @property orientation
                * @type String
                * @default null
                */
                orientation: null,

                /**
                * Tab index of slider handle
                * @property tabIndex
                * @type Number
                * @default null
                */
                tabIndex: null,

                /**
                * slider background image id
                * @property sliderBackgroundImageId
                * @type String
                * @default null
                */
                sliderBackgroundImageId: null,

                /**
                * Type of labels for slider
                * @property labelType
                * @type String
                * @default null
                */
                labelType: null,

                /**
                * Label values to display for slider
                * @property labelValues
                * @type Array
                * @default null
                */
                labelValues: null,

                /**
                * Label texts to display for slider
                * @property labelTexts
                * @type Array
                * @default null
                */
                labelTexts: null,

                /**
                * Whether to allow change of slider value using lables or not
                * @property allowLabelNavigation
                * @type Array
                * @default true
                **/
                allowLabelNavigation: true,

                /**
                * Specific points to snap to
                * @property points
                * @type Array
                * @default null
                */
                points: null,

                /**
                * Specifies the type
                * @property type
                * @type String
                * @default null
                */
                themeType: null,

                /**
                * Slider, slider handle and slider box-shadow color type
                * @property colorType
                * @type Object
                * @default null
                **/
                colorType: null,

                /**
                * Specifies the number of dots on handle.
                * @property numberOfDots
                * @type Number
                * @default 6
                */
                numberOfDots: 6,

                /**
                * Whether to show the slider handle tooltip or not
                * @property showHandleTooltip
                * @type Boolean
                * @default false
                */
                showHandleTooltip: false,

                /**
                * Tooltip text for handle
                * @property handleTooltipText
                * @type String
                * @default null
                */
                handleTooltipText: null,

                /**
                * Tooltip text precision for handle
                * @property handleTooltipTextPrecision
                * @type Number
                * @default null
                */
                handleTooltipTextPrecision: null,

                /**
                * Type of value to be displayed in slider handle tooltip
                * @property handleTooltipValueType
                * @type String
                * @default null
                */
                handleTooltipValueType: null,

                /**
                * CSS class for the handle tooltip
                * @property handleTooltipCustomClass
                * @type String
                * @default ''
                */
                handleTooltipCustomClass: '',

                /**
                * Tool tip arrow pointing direction position
                * @property toolTipArrowType
                * @type String
                * @default MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE
                */
                toolTipArrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.TOP_MIDDLE,

                /**
                * Custom callback object consisting of function and scope 
                * (Returned string value from this function will be set as tooltip text)
                * @property customTooltipCallback
                * @type Object
                * @default null
                * @public
                **/
                customTooltipCallback: null,

                /**
                * Whether to show the slider value near slider handle or not
                * @property showSliderValue
                * @type Boolean
                * @default false
                */
                showSliderValue: false,

                /**
                * Position for value to display (above, below, left or right to slider handle)
                * @property valuePosition
                * @type String
                * @default null
                */
                valuePosition: null,

                /*
                * Custom Tooltip properties for slider handle.
                *
                * @property tooltipProp
                * @type Object
                * @default Object
                */
                tooltipProp: {},


                /**
                * Type of value to be displayed (exact value/nearest value according to step, arbitrary text)
                * @property valueType
                * @type String
                * @default null
                */
                valueType: null,

                /**
                * Text to be displayed rather than only slider value
                * @property valueText
                * @type String
                * @default Empty String
                */
                valueText: '',

                /**
                * Precision for slider value to be displayed near slider handle
                * @property valuePrecision
                * @type Number
                * @default 0
                */
                valuePrecision: 0,

                /**
                * Offset value to adjust the left position of the slider value displayed
                * @property sliderValueLeftOffset
                * @type Number
                * @default 0
                */
                sliderValueLeftOffset: 0,

                /**
                * Offset value to adjust the top position of the slider value displayed
                * @property sliderValueTopOffset
                * @type Number
                * @default 0
                */
                sliderValueTopOffset: 0,

                /**
                * Offset value to adjust the left position of the slider value displayed when being rendered
                * @property initialLeftAdjustment
                * @type Number
                * @default 0
                */
                initialLeftAdjustment: 0,

                /**
                * Offset value to adjust the top position of the slider value displayed when being rendered
                * @property initialTopAdjustment
                * @type Number
                * @default 0
                */
                initialTopAdjustment: 0,

                /**
                * Custom callback object consisting of function and scope 
                * (Returned string value from this function will be set as slider handle acc message)
                * @property customAccCallback
                * @type Object
                * @default null
                * @public
                **/
                customAccCallback: null,

                /**
                * Whether the slider container and handle default message should be set on value change or not
                * @property setDefaultMsgOnValueChange
                * @type Boolean
                * @default false
                * @public
                **/
                setDefaultMsgOnValueChange: false,

                /**
                * Whether TTS reading must be stoppped on slider interaction
                * @property stopReadingOnInteraction
                * @type Boolean
                * @default true
                * @public
                **/
                stopReadingOnInteraction: true
            };
        },
        /**
        * Sets the property style.
        * @method initialize
        * @public
        **/
        initialize: function () {
            var sliderBackgroundImageId = null,
                minValue = this.get('minValue'),
                maxValue = this.get('maxValue'),
                selectedValue = this.get('selectedValue'),
                points = this.get('points'),
                modelNamespace = MathInteractives.Common.Components.Theme2.Models.Slider;


            //this.on('change:selectedValue',)

            // Sets minimum value as the default value in the model
            if (points !== null) {
                minValue = points[0];
                maxValue = points[points.length - 1];
                this.set('minValue', minValue);
                this.set('maxValue', maxValue);
            }
            if (selectedValue === null) {
                selectedValue = this.get('minValue');
                this.set('selectedValue', selectedValue);
            }
            this.set('nearestValue', selectedValue);
            if (this.get('orientation') === null) {
                this.set('orientation', modelNamespace.ORIENTATION.HORIZONTAL);
            }
            if (this.get('themeType') === null) {
                this.set('themeType', modelNamespace.TYPE.TYPE1);
            }
            if (this.get('colorType') === null) {
                this.set('colorType', modelNamespace.COLOR_TYPE.PURPLE);
            }
            sliderBackgroundImageId = this.get('colorType').sliderBackgroundImageId;
            if (sliderBackgroundImageId !== null && typeof (sliderBackgroundImageId) !== 'undefined') {
                this.set('sliderBackgroundImageId', sliderBackgroundImageId);
            }
            if (this.get('showHandleTooltip') === true) {
                var handleTooltipValueType = this.get('handleTooltipValueType');
                if (handleTooltipValueType === null) {
                    handleTooltipValueType = modelNamespace.TOOLTIP_VALUE_TYPE.NEAREST_VALUE;
                    this.set('handleTooltipValueType', handleTooltipValueType);
                }

            }
            if (this.get('showSliderValue') === true) {
                var valuePosition = this.get('valuePosition'),
                    valueType = this.get('valueType');
                if (valuePosition === null) {
                    if (this.get('orientation') === modelNamespace.ORIENTATION.HORIZONTAL) {
                        valuePosition = modelNamespace.VALUE_POSITION.ABOVE;
                    }
                    else if (this.get('orientation') === modelNamespace.ORIENTATION.VERTICAL) {
                        valuePosition = modelNamespace.VALUE_POSITION.LEFT;
                    }
                    this.set('valuePosition', valuePosition);
                }
                if (valueType === null) {
                    valueType = modelNamespace.VALUE_TYPE.NEAREST_VALUE;
                    this.set('valueType', valueType);
                }
            }
        },

        /**
        * Sets tooltip text for the slider handle
        * @method setTooltipText
        * @param {String} handleTooltipText Slider handle tooltip text
        * @public
        **/
        setTooltipText: function setTooltipText(handleTooltipText) {
            if (this.get('showHandleTooltip') === true) {
                this.set('handleTooltipText', handleTooltipText);
            }
        },

        /**
        * Returns the appropriate tooltip text for the slider handle
        * @method getTooltipText
        * @return {String} Slider handle tooltip text
        * @public
        **/
        getTooltipText: function getTooltipText() {
            var tooltipText = '';
            if (this.get('showHandleTooltip') === true) {
                tooltipText = this.get('handleTooltipText');
                if (tooltipText === null) {
                    tooltipText = this.get('selectedValue');
                }
            }
            return tooltipText;
        },

        /**
        * Returns boolean to indicate if slider tooltip is permanent or not.
        * @method isSliderTooltipPermanent
        * @return {Boolean} Slider tooltip is Permanent
        * @public
        **/
        isSliderTooltipPermanent: function () {
            return this.get('tooltipProp').isTooltipPermanent;
        }

    }, {

        /**
        * Slider orientation (Horizontal or vertical)
        * @type Object
        * @static 
        * @property ORIENTATION
        * @namespace MathInteractives.Common.Components.Theme2.Models.Slider
        **/
        ORIENTATION: {
            HORIZONTAL: 'horizontal',
            VERTICAL: 'vertical'
        },

        /**
        * Type of slider.        
        * @type Object
        * @static 
        * @property TYPE
        * @namespace MathInteractives.Common.Components.Theme2.Models.Slider
        **/
        TYPE: {
            TYPE1: 'type1',
            TYPE2: 'type2'
        },

        /**
        * Slider, slider handle and slider box-shadow color type
        * @type Object
        * @static
        * @property COLOR_TYPES
        * @namespace MathInteractives.Common.Components.Theme2.Models.Slider
        **/
        COLOR_TYPE: {
            PURPLE: {
                classPrefix: 'color-type-purple'
            },
            GREEN: {
                classPrefix: 'color-type-green'
            },
            GRAY: {
                classPrefix: 'color-type-gray'
            },
            LIGHT_GREEN: {
                classPrefix: 'color-type-light-green'
            },
            BLUE: {
                classPrefix: 'color-type-blue'
            },
            PINK: {
                classPrefix: 'color-type-pink'
            },
            PINK_WITH_IMAGE: {
                classPrefix: 'color-type-pink',
                sliderBackgroundImageId: 'slider_texture_1'
            },
            CUSTOM: {
                classPrefix: 'color-type-custom'
            }
        },

        /**
        * Type of labels for slider
        * @type Object
        * @static
        * @property LABEL_TYPE
        * @namespace MathInteractives.Common.Components.Theme2.Models.Slider
        **/
        LABEL_TYPE: {
            MIN_MAX: 'min-max',
            MIN_MAX_BESIDE_SLIDER: 'min-max-beside-slider',
            MIN_MID_MAX: 'min-mid-max',
            CUSTOM: 'custom'
        },

        /**
        * Type of value to be displayed in slider handle tooltip
        * @type Object
        * @static
        * @property TOOLTIP_VALUE_TYPE
        * @namespace MathInteractives.Common.Components.Theme2.Models.Slider
        **/
        TOOLTIP_VALUE_TYPE: {
            EXACT_VALUE: 'exact-value',
            NEAREST_VALUE: 'nearest-value'
        },

        /**
        * Position for slider value
        * @type Object
        * @static
        * @property VALUE_POSITION
        * @namespace MathInteractives.Common.Components.Theme2.Models.Slider
        **/
        VALUE_POSITION: {
            ABOVE: 'above',
            BELOW: 'below',
            LEFT: 'left',
            RIGHT: 'right'
        },

        /**
        * Type of slider value
        * @type Object
        * @static
        * @property VALUE_TYPE
        * @namespace MathInteractives.Common.Components.Theme2.Models.Slider
        **/
        VALUE_TYPE: {
            EXACT_VALUE: 'exact-value',
            NEAREST_VALUE: 'nearest-value',
            ARBITRARY_TEXT: 'arbitrary-text',
            TEXT_WITH_EXACT_VALUE: 'text-with-exact-value',
            TEXT_WITH_NEAREST_VALUE: 'text-with-nearest-value'
        },

        /**
        * Events for the slider
        * @type Object
        * @static
        * @property EVENTS
        * @namespace MathInteractives.Common.Components.Theme2.Models.Slider
        **/
        EVENTS: {
            SLIDE_START: 'slide-start',
            SLIDE: 'slide',
            SLIDE_STOP: 'slide-stop',
            VALUE_CHANGE: 'value-change',
            SLIDER_CLICK: 'slider-click',
            SLIDER_HANDLE_CLICK: 'slider-handle-click',
            SLIDER_HANDLE_KEY_UP: 'slider-handle-key-up',
            SLIDER_HANDLE_KEY_DOWN: 'slider-handle-key-down',
            FINAL_SLIDE_STOP: 'final_slide_stop',
            NEAREST_VALUE_CHANGE: 'change-nearest-value'
        },
        /**
        * Stores value of left offset to position value div on horizontal slider
        * @property INITIAL_LEFT_OFFSET
        * @type Number
        * @default null
        * @static
        **/
        INITIAL_LEFT_OFFSET: -53,
        /**
        * Stores value of top offset to position value div on vertical slider
        * @property INITIAL_TOP_OFFSET
        * @type Number
        * @default null
        * @static
        **/
        INITIAL_TOP_OFFSET: -8.5,
        /**
        * Stores value of label offset to position value div on vertical slider
        * @property INITIAL_LABEL_OFFSET
        * @type Number
        * @default null
        * @static
        **/
        INITIAL_LABEL_OFFSET: 4,
        /**
        * Constant used to space the intervals of slider closer,
        * so that sliding is smooth
        * @type Number
        * @property SLIDER_INTERVAL_DIVIDER
        * @static
        */
        SLIDER_INTERVAL_DIVIDER: 30,

        /**
        * Timer to trigger slider events
        * @property SLIDER_TRIGGER_TIMER
        * @type Number
        * @static
        */
        SLIDER_TRIGGER_TIMER: 1,

        /**
        * Type of slider navigation
        * @property NAVIGATION
        * @type Object
        * @namespace MathInteractives.Common.Components.Theme2.Models.Slider
        * @static
        * @public
        **/
        NAVIGATION: {
            DEFAULT: 'default',
            DECREASE: 'decrease',
            INCREASE: 'increase',
            MIN: 'min',
            MAX: 'max'
        }

    });
})();