(function () {

    /**
    * virus zapper number line model.
    *
    * @class NumberLine
    * @construtor
    * @namespace MathInteractives.Common.Interactivities.VirusZapper.Models
    */
    MathInteractives.Common.Interactivities.VirusZapper.Models.NumberLine = MathInteractives.Common.Player.Models.Base.extend({
        defaults: function () {
            return {

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
                * Line Width
                * @property lineLength
                * @type Number
                * @default 847
                */
                lineLength: 873,

                /**
                * Line Length
                * @property lineWidth
                * @type Number
                * @default 2
                */
                lineWidth: 2,

                /**
                * Tick Mark Height
                * @property tickHeight
                * @type Number
                * @default null
                */
                tickHeight: null,


                /**
                * Center Tick Height
                * @property tickHeight
                * @type Number
                * @default 20
                */
                centerTickHeight: 20,

                /**
                * Interval Between ticks 
                * @property tickinterval
                * @type Number
                * @default null
                */
                tickinterval: null,

                /**
                * Total number of parts/divisions of line.
                * @property numberOfIntervals
                * @type number
                * @default 20
                */
                numberOfIntervals: 20,

                /**
                * line color
                * @property color
                * @type string
                * @default 'black'
                */
                color: '#222222',

                /**
                * text color
                * @property textColor
                * @type string
                * @default 'black'
                */
                textColor: '#222222',

                /**
                * Stores the correct value of the x-coordinate
                * @property correctVirusXCoordinate
                * @type Number
                * @default null
                */
                correctVirusXCoordinate : null,

                firstClick:true,
                ansValue: null
            }
        },
        initialize: function () {
        }
       
    });
})();