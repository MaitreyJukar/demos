(function () {
    'use strict';

    /**
    * Conatins ToggleButton data
    *
    * @class ToggleButton    
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    MathInteractives.Common.Components.Theme2.Models.ToggleButton = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * ToggleButton ID
                * 
                * @attribute id
                * @type String
                * @default Empty string
                */
                id: '',

                /**
                * Base class of the ToggleButton
                * 
                * @attribute baseClass
                * @type String
                * @default Empty string
                */
                baseClass: '',

                /**
                * Text to be displayed on the ToggleButton
                * 
                * @attribute text
                * @type Object
                * @default Empty array
                */
                text: [],

                /**
                * Icon to be displayed on the ToggleButton
                * 
                * @attribute icon
                * @type String
                * @default null
                */
                icon: null,

                /**
                * Text to be displayed in the tooltip
                * 
                * @attribute tooltipText
                * @type String
                * @default Empty string
                */
                tooltipText: '',

                /**
                * Position of tooltip
                * 
                * @attribute tooltipPosition
                * @type Object
                * @default null
                */
                tooltipPosition: null,

                /**
                * Width of ToggleButton
                *
                * @attribute width
                * @type number
                * @default 65
                */
                width: 65,

                /**
                * Width of ToggleHandle
                *
                * @attribute width
                * @type number
                * @default 25
                */
                handleWidth: 25,


                /**
                * Height of ToggleButton
                *
                * @attribute height
                * @type number
                * @default 28
                */
                height: 28,

                /**
                * Height of ToggleHandle
                *
                * @attribute width
                * @type number
                * @default 25
                */
                handleHeight: 25,             

                /**
                * Image path for toggle button
                *
                * @attribute toggleImagePath
                * @type string
                * @default null
                */
                toggleImagePath: null,
                /**
                * Image path for toggle button handle 
                *
                * @attribute handleImagePath
                * @type string
                * @default null
                */
                handleImagePath: null,
                /**
                * Toggle button's background color
                *
                * @attribute toggleBackground
                * @type string
                * @default null
                */
                toggleBackground: null,
                /**
                * Tabindex of toggle button
                *
                * @attribute tabIndex
                * @type Number
                * @default 500
                */
                tabIndex: 500,
                /**
                * Toggle button's handle background color
                *
                * @attribute handleBackground
                * @type string
                * @default null
                */
                handleBackground:null,

                /**
                * Toggle button's shadow color
                *
                * @attribute toggleBoxShadowColor
                * @type string
                * @default null
                */
                toggleBoxShadowColor: null,
                /**
                * Specifies type of ToggleButton to be generated
                *
                * @attribute type
                * @type Object
                * @default MathInteractives.Common.Components.Theme2.Views.ToggleButton.Type.GENERAL
                */
                type: MathInteractives.Common.Components.Theme2.Views.ToggleButton.TYPE.GENERAL,

                /**
                * Stores whether ToggleButton handle is draggable or not
                *
                * @attribute isDraggable
                * @type Boolean
                * @default false
                */
                isDraggable: false,

                /**
                * User specified class. It get assign to toggle button,
                * if button type is MathInteractives.Common.Components.Theme2.Views.ToggleButton.TYPE.CUSTOM
                *
                * @attribute cssCustomClass
                * @type string
                * @default null
                */
                cssCustomClass: null,

                /**
                * Margin to be apply to toggle button
                *
                * @attribute margin
                * @type Number
                * @default 2
                */
                margin:2,
                /**
                * 
                * Hover class to be apply to toggle button
                * It get apply when mouseover event is generated 
                *
                * @attribute hoverClass
                * @type string
                * @default Empty string
                */
                hoverClass: '',
                /**
                * 
                * Hold prev state of toggle button
                *
                * @attribute prevState
                * @type string
                * @default Empty string
                */
                prevState: MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_ON


            }
        },

        /**
        * State of the Toggle Button by default
        * 
        * @property currentState
        * @private
        * @type String
        * @default MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_ON
        */
        currentState: MathInteractives.Common.Components.Theme2.Views.ToggleButton.TOGGLEBUTTON_STATE_ON
    });
})();