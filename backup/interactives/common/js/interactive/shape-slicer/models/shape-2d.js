(function () {
    'use strict';
    if (MathInteractives.Common.Interactivities.ShapeSlicer.Models.Shape2D) {
        return;
    }
    /*
	*
	*  2D Shape Model
	*	
	* @class Shape2D
	* @namespace MathInteractives.Interactivities.ShapeSlicer.Models
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
	* @constructor
	*/

    MathInteractives.Common.Interactivities.ShapeSlicer.Models.Shape2D = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: function () {
            return {

                /**
                 * Player
                 * @property player
                 * @type Object
                 * @default null
                 * @public
                 **/
                player: null,

                /**
                 * Right canvas panels current background type
                 * @property backgroundType
                 * @type Object
                 * @default null
                 * @public
                 **/
                backgroundType: null,

                /**
                 * Array of available shape colors
                 * @property shapeColorsToUse
                 * @type Array
                 * @default null
                 * @public
                 **/
                shapeColorsToUse: null,

                /**
                 * Index using which shape color to be chosen from shape colors array
                 * @property shapeColorIndex
                 * @type Number
                 * @default -1
                 * @public
                 **/
                shapeColorIndex: -1,

                /**
                 * All shapes data in right panel canvas
                 * @property shapeData
                 * @type Object
                 * @default null
                 * @public
                 **/
                shapeData: null,

                /**
                 * Currently selected shape group's name
                 * @property selectedShapeGroupName
                 * @type String
                 * @default ''
                 * @public
                 **/
                selectedShapeGroupName: '',

                /**
                 * Counter for the next shape
                 * @property shapeCounter
                 * @type Number
                 * @default -1
                 * @public
                 **/
                shapeCounter: -1
            };
        },


        /**
        * Initializes Shape2DModel
        *
        * @method initialize
        */
        initialize: function () {

        }
    });
})();