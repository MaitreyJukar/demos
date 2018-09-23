(function () {
    'use strict';
    /**
    * Ball holds necessary data for ball view.
    *
    * @class Ball
    * @module MiniGolf
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Player.Models.Base
    * @namespace MathInteractives.Interactivities.MiniGolf.Models
    */
    MathInteractives.Interactivities.MiniGolf.Models.Ball = MathInteractives.Common.Player.Models.Base.extend({
        defaults: function () {
            return {
                /**
                * Stores the position of the ball.                
                *
                * @attribute position
                * @type Object
                * @default null
                **/
                position: null,

                /**
                * Stores the status of the ball whether it is snapped or not.
                *
                * @attribute isSnapped
                * @type Boolean
                * @default null
                **/
                isSnapped: null,

                /**
                * Stores the obstacle number to which the ball is snapped to.
                *
                * @attribute isSnappedTo
                * @type Number
                * @default null
                */
                isSnappedTo: null,

                /**
                * Stores angle of the sticky slider
                *
                * @attribute stickySliderAngle
                * @type Number
                * @default null
                **/
                stickySliderAngle: null,

                /**
                * Stores speed of the ball.
                *
                * @attribute speed
                * @type Number
                * @default null
                **/
                speed: null,

                /**
                * Stores angle value with the previous ball.
                *
                * @attribute prevBallAngle
                * @type Number
                * @default null
                **/
                prevBallAngle: null,

                /**
                * Stores angle value with the next ball.
                *
                * @attribute nextBallAngle
                * @type Number
                * @default null
                **/
                nextBallAngle: null,

                /**
                * Stores ghost ball's visibility.
                *
                * @attribute ghostBallVisible
                * @type Boolean
                * @default null
                **/
                ghostBallVisible: null,

                /**
                * Stores ball's shadow's visibility.
                *
                * @attribute shadowVisible
                * @type Boolean
                * @default null
                **/
                shadowVisible: null,

                /**
                * Stores sticky slider's visibility.
                *
                * @attribute stickySliderVisible
                * @type Boolean
                * @default null
                **/
                stickySliderVisible: null,

                /**
                * Stores snap point with boundry.
                *
                * @attribute snapPoint
                * @type Object
                * @default null
                **/
                snapPoint: null,

                /**
                * Stores reflection boundry's normal's end point.
                *
                * @attribute mirrorPoint
                * @type Object
                * @default null
                **/
                mirrorPoint: null
            };
        },

        /**
        * Initialises Ball Model
        *
        * @method initialize
        **/
        initialize: function (options) {
        }
    }, {
        EVENTS: {
            NEW_HOLE_CLICKED: 'newHoleBtnClicked'
        }
    });
})();