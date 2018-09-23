(function () {
    'use strict';

    /**
    * Conatins button data
    *
    * @class Button
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.Button = Backbone.Model.extend({

        defaults: function () {
            return {
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
                imagePathIds: null,

                /**
                * Width for corner slice of button image
                * @property cornerSliceImgWidth
                * @type number
                * @defaults null
                */
                cornerSliceImgWidth: null,

                /**
                * Specifies type of button to be generated
                * @property type
                * @type Object
                * @defaults MathInteractives.Common.Components.Views.Button.Type.GENERAL
                */
                type: MathInteractives.Common.Components.Views.Button.TYPE.GENERAL,

                 /**
                * Stores whether buttons is draggable or not
                * @property isDraggable
                * @type Boolean
                * @defaults false
                */
                isDraggable: false,


                /**
               * Add group name to buttons in same group to keep there width equal
               * @property btnWidthGroup
               * @type String
               * @defaults null
               */
                btnWidthGroup:null,

                /**
                * boolean to identify whether button is legend or not
                * @property isLegend
                * @type boolean
                * @defaults false
                */
                isLegend: false, //used for graphlegend

                /**
                * chart object for which legend is created
                * @property chartConianerID
                * @type String
                * @defaults null
                */
                chartConianerID: null, //used for graphlegend

                /**
                * ID for graph series
                * @property seriesID
                * @type String
                * @defaults null
                */
                seriesID: null, //used for graphlegend

                /**
                * callbackFunction for legend button
                * @property callbackFnc
                * @type reference
                * @defaults null
                */
                callbackFnc: null,//used for graphlegend

                /**
                * customEvent for legend button
                * @property customEvent
                * @type boolean
                * @defaults false
                */
                customEvent: false,//used for graphlegend

                /**
                * Boolean indicating whether the buttons have a fixed min width or they can be as small as the text
                * @property fixedMinWidth
                * @type Boolean
                * @default false
                */
                fixedMinWidth: false,

                imagePositions: null
            }
        },

        /**
        * State of the button by default
        *
        * @property currentState
        * @type String
        */
        currentState: MathInteractives.Common.Components.Views.Button.BUTTON_STATE_ACTIVE
    });
})();