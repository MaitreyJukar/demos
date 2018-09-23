(function () {
    'use strict';

    /**
    * Conatins Tooltip data
    *
    * @class BoundedTooltip   
    * @extends MathInteractives.Common.Components.Theme2.Models.Tooltip
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    MathInteractives.Common.Components.Models.BoundedTooltip = MathInteractives.Common.Components.Theme2.Models.Tooltip.extend({

        defaults: function () {
            return {
                /**
                * Tooltip ID
                *
                * @attribute id
                * @type String
                * @default Empty string
                */
                id: '',

                /**
                * Text to be displayed in the Tooltip
                *
                * @attribute text
                * @type String
                * @default null
                */
                text: null,

                /**
                * Base class applied  to tooltip
                *
                * @attribute baseClass
                * @type String
                * @default null
                */
                baseClass: null,

                /**
                * Base class applied  to tooltip arrow
                *
                * @attribute arrowbaseClass
                * @type String
                * @default null
                */
                arrowBaseClass: null,

                /**
                * Specifies type of Tooltip to be generated
                * @attribute type
                * @type Object
                * @default MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL
                */
                type: MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.GENERAL,

                /**
                * Specifies arrowType of Tooltip to be generated
                * @attribute arrowType
                * @type String
                * @default MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.BOTTOM_MIDDLE
                */
                arrowType: MathInteractives.Common.Components.Theme2.Views.Tooltip.ARROW_TYPE.BOTTOM_MIDDLE,

                /**
                * Stores whether tooltip contain the tts or not
                * @attribute isTts
                * @type Boolean
                * @default false
                */
                isTts: false,

                /**
                * BackgroundColor of the Tooltip
                *
                * @attribute backgroundColor
                * @type String
                * @default null
                */

                backgroundColor: null,

                /**
                * textColor of the Tooltip
                *
                * @attribute textColor
                * @type String
                * @default null
                */
                textColor: null,

                /**
                * containerWidth of the Tooltip
                *
                * @attribute containerWidth
                * @type Number
                * @default null
                */

                containerWidth: null,

                /**
                * containerHeight of the Tooltip
                *
                * @attribute containerHeight
                * @type Number
                * @default null
                */

                containerHeight: null,
                /**
                * border color of the Tooltip
                *
                * @attribute borderColor
                * @type String
                * @default null
                */

                borderColor: null,


                /**
                * accText for the Tooltip
                *
                * @attribute accText
                * @type String
                * @default null
                */
                accText: null,

                /**
                * elementEl for the Tooltip
                *
                * @attribute elementEl
                * @type String
                * @default null
                */
                elementEl: null,


                /**
                * Stores whether tooltip contain the arrow or not
                *
                * @attribute isArrow
                * @type Boolean
                * @default true
                */
                isArrow: true,

                /**
                * Stores the calulated data of tooltip
                *
                * @attribute calcData
                * @type Object
                * @default null
                */
                calcData: null,

                /**
               * Stores whether tooltip is to be shown from center of element
               *
                * @attribute fromElementCenter
               * @type Boolean
               * @default false
               */
                fromElementCenter: false,

                /**
               * Defines whether tooltip is for theme2 help
               *
                * @attribute isHelp
               * @type Boolean
               * @default false
               */
                isHelp: false,

                /**
               * Specifies position of tooltip when arrow is hide
               *
                * @attribute positionType
               * @type Object
               * @default MathInteractives.Common.Components.Theme2.Views.Tooltip.POSITION_TYPE.CENTER
               */
                positionType: MathInteractives.Common.Components.Theme2.Views.Tooltip.POSITION_TYPE.CENTER,
                arrowIn: 1,

                /**
                * class used to override specific css for tooltip
                *
                * @attribute identityClass
                * @type String
                * @default null
                */
                identityClass: null,

                /**
                * Is the tooltip shown on clicking the target element
                * @attribute isShownOnClick
                * @type Boolean
                * @default null
                **/
                isShownOnClick: null,

                /*
                * Checks whether the tooltip is to be closed on any click
                *
                * @attribute closeOnDocumentClick
                * @type Boolean
                * @default false
                */
                closeOnDocumentClick: false,
                /*
                * Player width
                *
                * @attribute playerWidth
                * @type Number
                * @default 928
                */
                playerWidth: 928,
                /*
                * Checks whether the close button is to be showed or not.
                *
                * @property showCloseBtn
                * @type Boolean
                * @default false
                */
                showCloseBtn: false,


                /*
                * Indicates if the tooltip is permanent. Will not show/hide on mouseenter/leave till explicit call is made.
                *
                * @property isTooltipPermanent
                * @type Boolean
                * @default undefined
                */
                isTooltipPermanent: undefined,


                /*
                * Position of the close button
                *
                * @property closeBtnPosition
                * @type Object
                * @default MathInteractives.Common.Components.Theme2.Views.Tooltip.CLOSE_BTN_POSITION_TYPE.TOP_RIGHT
                */
                closeBtnPosition: MathInteractives.Common.Components.Theme2.Views.Tooltip.CLOSE_BTN_POSITION_TYPE.TOP_RIGHT,

                positionArray : null,
                priorityArray : null,
                position : null,
                containmentArea : null,
                containerEleId : null,
                padding : null,
                dynamicArrowPosition : null,
                isBaseTooltip : false
            };
        },

        /**        
        * @namespace MathInteractives.Common.Components.Theme2.Models
        * @class Tooltip 
        * @constructor
        */
        initialize: function () {
            this._superwrapper('initialize', arguments);
        }      
    });
})();