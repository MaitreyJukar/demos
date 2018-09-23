
(function () {
    'use strict';

    /**
    * Conatins tooltip data
    *
    * @class Tooltip
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.Tooltip = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * Tooltip ID
                * 
                * @property id
                * @type String
                * @defaults Empty string
                */
                id: '',

                /**
                * Text to be displayed in the Tooltip
                * 
                * @property text
                * @type String
                * @default null
                */
                text: null,

                /**
                * Position of tooltip
                * 
                * @property tooltipPosition
                * @type Object
                * @defaults null
                */
                tooltipPosition: null,

                /**
                * Position of element to which tooltip belongs
                * 
                * @property elementOffsetPosition
                * @type Object
                * @defaults null
                */
                elementOffsetPosition: null,

                /**
                * Size of the element to which tooltip belongs
                * 
                * @property elementDimensions
                * @type Object
                * @defaults null
                */
                elementDimensions: null,

                /**
                * User specified image for Tooltip
                * @property imagePathClasses
                * @type array
                * @defaults null
                */
                imagePathClasses: null
            }
        }
    });
})();