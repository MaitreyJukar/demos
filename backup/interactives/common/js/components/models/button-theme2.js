(function () {
    'use strict';

    /**
    * Holds the business logic and data of the view
    * @class Button
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @submodule MathInteractives.Common.Components.Theme2.Models.Button
    * @namespace MathInteractives.Common.Components.Theme2.Models
    * @constructor
    */
    MathInteractives.Common.Components.Theme2.Models.Button = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * Button ID
                * 
                * @property id
                * @type String
                * @default Empty string
                */
                id: '',

                /**
                * Base class of the button
                * 
                * @property baseClass
                * @type String
                * @default Empty string
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
                * Icon to be displayed on the button
                * 
                * @property icon
                * @type String
                * @default null
                */
                icon: null,

                /**
                * Text to be displayed in the tooltip
                * 
                * @property tooltipText
                * @type String
                * @default Empty string
                */
                tooltipText: '',

                /**
                * Position of tooltip
                * 
                * @property tooltipPosition
                * @type Object
                * @default null
                */
                tooltipPosition: null,
                
                /**
                * user specified width of button
                * @property width
                * @type number
                * @default null
                */
                width: null,


                /**
                * user specified height of button
                * @property height
                * @type number
                * @default null
                */
                height: null,


                /**
                * Specifies type of button to be generated
                * @property type
                * @type Object
                * @default MathInteractives.Common.Components.Theme2.Views.Button.TYPE.GENERAL
                */
                type: null,

                /**
                * Specifies color type of button to be generated
                * @property colorType
                * @type Object
                * @default null
                */
                colorType: null,
                /**
                * Specifies color of boxshadow.
                * @property boxShadowColor
                * @type Object
                * @default null
                */
                boxShadowColor:null,
                /**
                * Specifies border color for button
                * @property borderColor
                * @type string
                * @default null
                */
                borderColor: null,
                /**
                * Specifies text color for button
                * @property textColor
                * @type string
                * @default null
                */
                textColor: null,
                /**
                * Specifies border width
                * @property borderWidth
                * @type int
                * @default null
                */
                borderWidth: null,
                /**
                * Specifies whether button has border or not
                * @property border
                * @type boolean
                * @default false
                */
                border: false,
                /**
                * Specifies border radius for button
                * @property borderRadius
                * @type int
                * @default null
                */
                borderRadius: null,
                /**
                * Specifies left and right padding around text
                * @property textPadding
                * @type int
                * @default null
                */
                textPadding: null,
                /**
                * Specifies path for image icon
                * @property imagePath
                * @type string
                * @default null
                */
                imagePath: null,

                /**
                * Specifies whether button is toggle or not
                * @property isToggle
                * @type boolean
                * @default false
                */
                isToggle: false,

                /**
               * Add group name to buttons in same group to keep there width equal
               * @property btnWidthGroup
               * @type String
               * @default null
               */
                btnGroup:null,
                 /**
               * Define the tooltip arrow type for button
               * @property tooltipType
               * @type Object
               * @default MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.BOTTOM_MIDDLE
               */
                tooltipType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.BOTTOM_MIDDLE,
                /**
                * Define the tooltip type for button
                * @property tooltipColorType
                * @type Object
                * @default MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL
                */
                tooltipColorType: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL,
                /**
                * State of the button by default
                * 
                * @property currentState
                * @type String
                */
                currentState: MathInteractives.Common.Components.Theme2.Views.Button.BUTTON_STATE_ACTIVE,

                /**
                * Specifies whether button is toggle or not
                * @property isToggle
                * @type boolean
                * @default false
                */
                paddingBetnIconText: null
            }
        }
    });
})();