(function () {
    
    /**
    * Properties required for populating virus zapper releted data.
    *
    * @class VirusZapper
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Interactivities.TrignometricGraphing.Models
    */

    if (typeof MathInteractives.Interactivities.TrignometricGraphing === 'undefined') {
        MathInteractives.Common.Interactivities.TrignometricGraphing = {};
        MathInteractives.Common.Interactivities.TrignometricGraphing.Views = {};
        MathInteractives.Common.Interactivities.TrignometricGraphing.Models = {};
    }

    MathInteractives.Common.Interactivities.TrignometricGraphing.Models.ExploreTrignometricGraphing = MathInteractives.Common.Player.Models.BaseInteractive.extend({
        defaults: {

            /**
           * Radius of circle 
           * @property circleRadius
           * @default 65
           * @type {Number}
           */
            circleRadius: 65,

            /**
            * Center point of circle
            * @property circleCenterPoint
            * @default { x: 175.31, y: 155.68 }
            * @type {Object}
            */
            circleCenterPoint: { x: 175.31, y: 155.68 },

            /**
            * Init Drag point Angle
            * @property initDragAngle
            * @default 0
            * @type {Number}
            */
            initDragAngle: 0,

            /**
           * Number of points to display on circle
           * @property initShowPoints
           * @default 12
           * @type {Number}
           */
            initShowPoints: 12,

            /**
           * Radius Slider configuration. Radius slider is used to scale the circle
           * @property radiusSliderData
           * @type {Object}
           */
            radiusSliderData: {
                minValue: 0.75,
                stepValue: 0.25,
                maxValue: 2,
                defaultValue: 1

            },

            /**
            * Distance multiplier Slider configuration. Distance multiplier slider is used to scale the angle
            * @property distanceSliderData
            * @type {Object}
            */
            distanceSliderData: {
                minValue: 0.5,
                stepValue: 0.5,
                maxValue: 3,
                defaultValue: 1
            },

            /**
            * Current Function type Sine/Cos/Tan
            * @property trignometricFunction
            * @type {Object}
            */
            trignometricFunction: {
                Sine: true,
                Cos: false,
                Tan: false
            }

        },

        initialize: function () {
        }

    }, {
        FOCUS_RECT_STROKE_WIDTH: 2,
        FOCUS_RECT_COLOR: '#aaa',
        /**
           * Initial offset between circle & labels
           * @property LABEL_OFFSET
           * @type Number
           * @final
           **/
        LABEL_OFFSET: 24,

        /**
        * Outer circle stroke width
        * @property OUTER_CIRCLE_STROKE_WIDTH
        * @type Number
        * @final
        **/
        OUTER_CIRCLE_STROKE_WIDTH: 3,

        /**
        * Center Circle Radius 
        * @property CENTER_CIRCLE_RADIUS
        * @type Number
        * @final
        **/
        CENTER_CIRCLE_RADIUS: 7,

        /**
        * Color of Center circle
        * @property CENTER_CIRCLE_RADIUS
        * @type String
        * @final
        **/
        CENTER_CIRCLE_COLOR: '#FFFFFF',

        /**
        * Color of Sine Line Indicator
        * @property SINE_LINE_DRAG_COLOR
        * @type String
        * @final
        **/
        SINE_LINE_DRAG_COLOR: '#D13787',

        /**
       * Color of Cos Line Indicator
       * @property COS_LINE_DRAG_COLOR
       * @type String
       * @final
       **/
        COS_LINE_DRAG_COLOR: '#00A2C9',

        /**
        * Color of Tan Line Indicator
        * @property TAN_LINE_DRAG_COLOR
        * @type String
        * @final
        **/
        TAN_LINE_DRAG_COLOR: '#FFFFFF',

        /**
        * Drag Item Data
        * @property DRAG_CIRCLE_DATA
        * @type Object
        * @final
        **/
        DRAG_CIRCLE_DATA:
            {
                DRAG_CIRCLE_RADIUS: 9,
                SHADOW_COLOR: '#000000',
                SHADOW_BLUR: 2
            },

        /**
        * Color of Vertical line in cos
        * @property COS_VERTICAL_LINE_COLOR
        * @type String
        * @final
        **/
        COS_VERTICAL_LINE_COLOR: '#8E8E8E',

        /**
        * Color of Vertical line in sin
        * @property SIN_VERTICAL_LINE_COLOR
        * @type String
        * @final
        **/
        SIN_VERTICAL_LINE_COLOR: '#8E8E8E',

        /**
      * Color of Vertical line in tan
      * @property TAN_VERTICAL_LINE_COLOR
      * @type String
      * @final
      **/
        TAN_VERTICAL_LINE_COLOR: '#8E8E8E',

        /**
       * width of Vertical line in sin
       * @property COS_VERTICAL_LINE_WIDTH
       * @type Number
       * @final
       **/
        COS_VERTICAL_LINE_WIDTH: 3,

        /**
        * Radius of Bubble Circle
        * @property BUBBLE_CIRCLE_RADIUS
        * @type Number
        * @final
        **/
        BUBBLE_CIRCLE_RADIUS: 9,

        /**
        * Color of Bubble indicate visited points while dragging
        * @property BUBBLE_CIRCLE_COLOR
        * @type String
        * @final
        **/
        BUBBLE_CIRCLE_COLOR: '#77933C',

        /**
        * Width of Sine & Cos bar
        * @property SIN_COS_BAR_WIDTH
        * @type Number
        * @final
        **/
        SIN_COS_BAR_WIDTH: 3,

        /**
        * Color of imposed circle drawn while dragging the item on circumference
        * @property IMPOSED_CIRCLE_COLOR
        * @type String
        * @final
        **/
        IMPOSED_CIRCLE_COLOR: '#8CB61D',

        /**
        * Width of Imposed circle on circumference
        * @property IMPOSED_CIRCLE_WIDTH
        * @type Number
        * @final
        **/
        IMPOSED_CIRCLE_WIDTH: 3,



        ASYMTOTES_LINE_WIDTH: 2,


        /**
        * Angle Offset for dropping of draggable element on Label points
        * @property ANGLE_MARGIN_TO_DROP
        * @type Number
        * @final
        **/
        ANGLE_MARGIN_TO_DROP: 7,

        /**
        * Radius Line Color
        * @property RADIUS_LINE_COLOR
        * @type String
        * @final
        **/
        RADIUS_LINE_COLOR: '#8E8E8E',

        /**
        * Radius Line width
        * @property RADIUS_LINE_WIDTH
        * @type Number
        * @final
        **/
        RADIUS_LINE_WIDTH: 3,

        /**
       * Color of Diameter line connecting 0 & 180deg point
       * @property VISIBLE_DIAMETER_LINE_COLOR
       * @type String
       * @final
       **/
        VISIBLE_DIAMETER_LINE_COLOR: '#b9b9b9',

        /**
       * Gradient for Sin Drag cicle
       * @property SIN_GRADIENT
       * @type Array
       * @final
       **/
        SIN_GRADIENT: ['#A21E63', '#3C0321'],


        SIN_GRADIENT_HOVER: ['#3C0321', '#A21E63'],

        /**
        * Gradient for Cos Drag cicle
        * @property COS_GRADIENT
        * @type Array
        * @final
        **/
        COS_GRADIENT: ['#329fc3', '#02375c'],

        COS_GRADIENT_HOVER: ['#02375c', '#329fc3'],

        /**
        * Gradient for Tan Drag cicle
        * @property TAN_GRADIENT
        * @type Array
        * @final
        **/
        TAN_GRADIENT: ['#FFFFFF', '#878787'],

        TAN_GRADIENT_HOVER: ['#878787', '#FFFFFF'],


        /**
       * Gradient for default Drag cicle
       * @property DEFAULT_GRADIENT
       * @type Array
       * @final
       **/
        DEFAULT_GRADIENT: ['#ADADAD', '#6F6F6F'],

        DEFAULT_GRADIENT_HOVER: ['#6F6F6F', '#ADADAD'],

        VISIBLE_DIAMETER_LINE_WIDTH: 2,

        INITIAL_ANGLE: 0,


        DRAG_DUMMY_CIRCLE_RADIUS_SCALE: 2.5,

        TANGENT_LINE_LENGTH:200


    })

    
})();