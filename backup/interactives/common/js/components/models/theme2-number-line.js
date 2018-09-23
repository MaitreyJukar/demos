(function () {

    /**
    * Properties required for populating Number Line in canvas.
    *
    * @class NumberLine
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    MathInteractives.Common.Components.Theme2.Models.NumberLine = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: function () {
            return {

                /**
                * Line Width
                * @property width
                * @type Number
                * @default 2
                */
                width: 2,

                /**
                * Line Length
                * @property length
                * @type Number
                * @default 847
                */
                length: 847,

                /**
                * Line color
                * @property color
                * @type String
                * @default '#000000'
                */
                color: '#000000',

                /**
                * text color
                * @property textColor
                * @type String
                * @default '#000000'
                */
                textColor: '#000000',

                /**
                * Tick Mark Height
                * @property tickHeight
                * @type Number
                * @default null
                */
                tickHeight: null,

                /**
                * Center Tick Height
                * @property centerTickHeight
                * @type Number
                * @default null
                */
                centerTickHeight: null,

                /**
                * Interval Between ticks 
                * @property tickInterval
                * @type Number
                * @default null
                */
                tickInterval: null,

                /**
                * Minimum value on the number line
                * @property minValue
                * @type Number
                * @default -10
                */
                minValue: -10,

                /**
                * Maximum value on the number line
                * @property maxValue
                * @type Number
                * @default 10
                */
                maxValue: 10,

                /**
                * Total number of parts/divisions of line.
                * @property numberOfIntervals
                * @type number
                * @default 20
                */
                numberOfIntervals: 20,

                /**
                * Boolean value for ticks clickable or not.
                * @property ticksClickable
                * @type boolean
                * @default true
                */
                ticksClickable: true,

                /**
                * Boolean value for whether parts clickable or not.
                * @property partsClickable
                * @type boolean
                * @default true
                */
                partsClickable: true,

                /**
                * start point value/text of clicked range.
                * @property clickedRangeStartValue
                * @type number
                * @default null
                */
                clickedRangeStartValue: null,

                /**
                * end point value/text of clicked range.
                * @property clickedRangeEndValue
                * @type number
                * @default null
                */
                clickedRangeEndValue: null,


                /**
                * value/text of clicked tick.
                * @property clickedTickValue
                * @type number
                * @default null
                */
                clickedTickValue: null,

                /**
                * x coordinate of start point of clicked range.
                * @property clickedRangeStartXCoordinate
                * @type number
                * @default null
                */
                clickedRangeStartXCoordinate: null,


                /**
                * x coordinate of end point of clicked range.
                * @property clickedRangeEndXCoordinate
                * @type number
                * @default null
                */
                clickedRangeEndXCoordinate: null,


                /**
                * Shape of tick.
                * @property tickShape
                * @type string
                * @default 'line'
                */
                tickShape: 'line',

                /**
                * x coordinate of start point of first tick.
                * @property firstTickPointX
                * @type number
                * @default null
                */
                firstTickPointX: null,

                /**
                * x coordinate of start point of last tick.
                * @property lastTickPointX
                * @type number
                * @default null
                */
                lastTickPointX: null,

                /**
                * y-coordinate of end point of any tick.
                * @property newEndPointY
                * @type number
                * @default null
                */
                newEndPointY: null,

                /**
                * y-coordinate of start point of any tick.
                * @property newStartPointY
                * @type number
                * @default null
                */
                newStartPointY: null,

                /**
                * stores clicked range data..
                * @property clickedRangeObject
                * @type object
                * @default null
                */
                clickedRangeObject: null,

                /**
                * Boolean value for whether to animate number line or not.
                * @property animate
                * @type boolean
                * @default false
                */
                animate: false,

                /**
                * Boolean value for whether to show all decimal numbers or only the whole numbers/integers.
                * @property displayWholeNumOnly
                * @type boolean
                * @default false
                */

                displayWholeNumOnly: false,

                /**
                * denominator value if the number of ticks/intervals depends on the denominator.
                * @property denominator
                * @type Number
                * @default null
                */

                denominator: null,

                /**
                * Value upto which the decimal number should be fixed.
                * @property toFixedDecimal
                * @type Number
                * @default 3
                */

                toFixedDecimal: 3,

                /**
                * Value upto which the whole number should be fixed.
                * @property toFixedInteger
                * @type Number
                * @default 0
                */

                toFixedInteger: 0,

                /**
                * distance between two sticks
                * @property distanceBetweenTwoSticks
                * @type Number
                * @default null
                */

                distanceBetweenTwoSticks: null,

                /**
                * Color of the tick
                * @property tickColor
                * @type String
                * @default #000000
                */

                tickColor: null,

                /**
                * Color of the tick when whole number/integer is to be displayed
                * @property integerTickColor
                * @type String
                * @default #ffffff
                */

                integerTickColor: '#ffffff',

                /**
                * Width of the tick
                * @property tickWidth
                * @type Number
                * @default 2
                */

                tickWidth: 2,

                /**
                * Length/height of the tick
                * @property tickLength
                * @type Number
                * @default null
                */

                tickLength: null,

                /**
                * Boolean value for whether the center tick of the number line should be bigger than the other ticks or not.
                * @property centerTickHeightBigger
                * @type Boolean
                * @default true
                */

                centerTickHeightBigger: true,

                /**
                * Distance between the number line & the number text
                * @property textPadding
                * @type Number
                * @default null
                */

                textPadding: null,

                /**
                * style properties for the number text 
                * @property textStyle
                * @type Object
                * @default null
                */

                textStyle: null,

                /**
                * Width of arrow at both number line ends 
                * @property arrowWidth
                * @type number
                * @default null
                */
                arrowWidth: null,

                /**
                * Id of hac div in accessibility of component.
                * @property hacDivId
                * @type string
                * @default null
                */
                hacDivId: null,

                /**
                * Tick hit area dimensions.
                * @property tickHitAreaDimentions
                * @type object
                * @default {width: 24, height: 24}
                */
                tickHitAreaDimentions: { width: 24, height: 24 },


                /**
                * Details of the highlighted part.
                * @property highlightData
                * @type object
                * @default { height: 20, color: 'red', opacity: 1, highlightPath: true, highlightHitArea: false }
                */
                highlightData: { height: 20, color: 'red', opacity: 1, highlightPath: true, highlightHitArea: false },

                /**
                * Distance between the text and the tick of the number line.
                * @property textPaddingFromNumberLine
                * @type number
                * @default null
                */

                textPaddingFromNumberLine: null,

                /**
                * Boolean to know whether tick to be shown or not.
                * @property showTicks
                * @type Boolean
                * @default true
                */

                showTicks: true,

                /**
                * Boolean to know whether lable number for each tick to be shown or not.
                * @property showLable
                * @type Boolean
                * @default true
                */

                showLable: true,

                /**
                * Color of the left & right end triangle
                * @property triangleColor
                * @type String
                * @default null
                */

                triangleColor: null,

                /**
                * Boolean to know whether base lines of number line to be shown or not.
                * @property showBaseLine
                * @type Boolean
                * @default true
                */

                showBaseLine: true,

                /**
                * Boolean to know whether the lables need to be shown alternately in case of overlapping or not.
                * @property showAlternateLableWhenOverlap
                * @type Boolean
                * @default false
                */

                showAlternateLableWhenOverlap: false,

                /**
                * Boolean to know whether the lables need to be always shown alternately or not.
                * @property showAlternateAlways
                * @type Boolean
                * @default false
                */

                showAlternateAlways: false,

                /**
                * Number of ticks to be skipped in case of alternate ticks.
                * @property skipTickCount
                * @type Number
                * @default 0
                */

                skipTickCount: 0,

                /**
                * Whether the arrow head size is customized or not
                * @property customArrowSize
                * @type Boolean
                * @default false
                */

                customArrowSize: false,

                /**
                * Height of the arrow head
                * @property arrowHeight
                * @type Number
                * @default null
                */

                arrowHeight: null,

                /**
                * distance between the left arrow head and the first tick
                * @property leftArrowTickDistance
                * @type Number
                * @default null
                */

                leftArrowTickDistance: null,

                /**
                * distance between the last arrow head and the last tick
                * @property rightArrowTickDistance
                * @type Number
                * @default null
                */

                rightArrowTickDistance: null,

                /**
                * Holds the value whether the labels to be showed in fraction format or not.
                * @property showFractionFormatLabels
                * @type Boolean
                * @default false
                */

                showFractionFormatLabels: false,


                /**
                * Holds the value which tells whether the commas to be added in label or not
                * @property isCommaAddedInLabel
                * @type Boolean
                * @default false
                */
                addCommaInLabel: false
            }
        },

        /**
        * Sets the property style.
        * @method initialize
        **/
        initialize: function (options) {
        },


        /**
        * Changes properties of number line.
        * @method changeNumberLine
        * @public
        **/
        changeNumberLine: function (object) {
            if (object) {
                this.set(object);
                this.trigger(MathInteractives.global.Theme2.NumberLine.Events.NUMBERLINE_VALUES_CHANGED);
            }
        }

    });
})();