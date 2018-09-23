(function () {
    'use strict';

    MathUtilities.Components.Models = {};

    MathUtilities.Components.Models.Button = {};

    /**
    * Conatins button data
    *
    * @class Button
    * @construtor
    * @extends Backbone.Model
    * @namespace Components.Models
    */
    MathUtilities.Components.Models.Button = Backbone.Model.extend({
        
        defaults: {
            /**
            * Button ID
            * 
            * @property id
            * @type String
            * @defaults Empty string
            */
            id: '',

            /**
            * Base class of the button
            * 
            * @property baseClass
            * @type String
            * @defaults Empty string
            */
            baseClass: '',

            /**
            * Text to be displayed on the button
            * 
            * @property text
            * @type String
            * @default null
            */
            text: null,

            /**
            * Text to be displayed in the tooltip
            * 
            * @property tooltipText
            * @type String
            * @defaults Empty string
            */
            tooltipText: '',

            /**
            * Position of tooltip
            * 
            * @property tooltipPosition
            * @type Object
            * @defaults null
            */
            tooltipPosition: null,

            /**
            * Indicates whether the button is of type 'toggle'
            * @property toggleButton
            * @type Boolean
            * @defaults false
            */
            toggleButton: false,

            /**
            * Indicates whether the button custom or user specific
            * @property isCustomButton
            * @type Boolean
            * @defaults true
            */
            isCustomButton: false,


            /**
            * user specified width of button
            * @property width
            * @type number
            * @defaults null
            */
            width: null,

            
            /**
            * user specified height of button
            * @property height
            * @type number
            * @defaults null
            */
            height: null,

            /**
           * padding in between in sprites
           * @property padding
           * @type number
           * @defaults null
           */
            padding: null,

            /**
            * user specified image for button
            * @property imagePathIds
            * @type array
            * @defaults null
            */
            imagePathIds: null

        },

        /**
        * State of the button by default
        * 
        * @property currentState
        * @type String
        */
        currentState: MathUtilities.Components.Views.Button.BUTTON_STATE_ACTIVE
    });
})();