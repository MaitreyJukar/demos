(function () {
    'use strict';

    /*
	*
	*   D E S C R I P T I O N
	*	
	* @class Carousel
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */

    MathInteractives.Common.Components.Theme2.Models.Carousel = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * Store idSuffix 
                * @property idSuffix
                * @type string
                **/
                idSuffix: '',   // Please keep all the references null in defaults.

                /**
                * Store container id
                * @property containerId
                * @type object
                * @default null
                **/
                containerId: null,

                /**
                * stores image path 
                * @property imagePath
                * @type Object
                * @default null
                **/
                imagePath: null,

                /**
                * stores default blocks count 
                * @property defaultBlocks
                * @type Object
                * @default 1
                **/
                defaultBlocks: 1,

                /**
                * Store stepper index,  evrytime pass index if using more than 1 stepper in an interactivity
                * @property stepperIndex
                * @type Number
                * @default 0
                **/
                stepperIndex: 0,

                /**
                * Store boolean for 3 row 
                * @property challenge2Data
                * @type boolean
                * @default false
                **/
                challenge2Data: false,

                /**
                * Boolean for block is with background or not 
                * @property isBockWithImage
                * @type Boolean
                * @default false
                **/
                isBockWithImage: false,

                /**
                * stores model 
                * @property currentTabModel
                * @type object
                * @default null
                **/
                currentTabModel: null,
                /**
                * Button-options for left button
                * @property leftButtonOption
                * @type object
                * @default null
                **/
                leftButtonOption: null,

                /**
                * Button-options for right button
                * @property rightButtonOption
                * @type object
                * @default null
                **/
                rightButtonOption: null,

                /**
                * boolean for navigation with image 
                * @property isNavigationWithImage
                * @type boolean
                * @default null
                **/
                isNavigationWithImage: false,

                /**
                * stores animate step
                * @property animateStep
                * @type number
                * @default 1
                **/
                animateStep: 1,
                /**
                * stores animate duration
                * @property animationDuration
                * @type number
                * @default 100
                **/
                animationDuration: 100,
                /**
                * Stores the visible first column number .
                * @property firstVisibleColumn
                * @type Number
                * @default 0
                */
                firstVisibleColumn: 0
            };
        }

    });
})();