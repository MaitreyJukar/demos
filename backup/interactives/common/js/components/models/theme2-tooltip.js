(function () {
    'use strict';

    /**
    * Conatins Tooltip data
    *
    * @class Tooltip
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    MathInteractives.Common.Components.Theme2.Models.Tooltip = Backbone.Model.extend({

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

                /**
                * It stores the base class of tts button
                * 
                * @property ttsBaseClass
                * @type String
                * @default null
                */
                ttsBaseClass: null,

                /**
                * Offset to be givent to text of acc div
                * 
                * @property accDivOffset
                * @type Object
                * @default null
                */
                accDivOffset: null,

                /*
                * Position of the close button
                *
                * @property closeBtnPosition
                * @type Object
                * @default MathInteractives.Common.Components.Theme2.Views.Tooltip.CLOSE_BTN_POSITION_TYPE.TOP_RIGHT
                */
                closeBtnPosition: MathInteractives.Common.Components.Theme2.Views.Tooltip.CLOSE_BTN_POSITION_TYPE.TOP_RIGHT
            }
        },

        /**
        * @namespace MathInteractives.Common.Components.Theme2.Models
        * @class Tooltip
        * @constructor
        */
        initialize: function () {
            this.on("show.tooltip", this._showTooltip, this);
        },

        /**
        * it set the postion of tooltip as per the type
        * @method _showTooltip
        * @private
        * @param data {Object} parameters passed by user to generate tooltip
        **/
        _showTooltip: function (data) {
            //

            var arrowDivTop, arrowDivLeft, borderDivLeft, borderDivTop, deg,
                tooltipHeight = data.tooltipHeight,
                boarderWidth = data.boarderWidth,
                tooltipWidth = data.tooltipWidth,
                baseWidthOfArrow = data.baseWidthOfArrow,
                elementTop = data.elementTop,
                elementLeft = data.elementLeft,
                elementWidth = data.elementWidth,
                elementHeight = data.elementHeight,
                eleCenter = data.eleCenter,
                space = data.space,
                positionType = data.positionType,
                arrowFlag = data.isArrow,
                arrowType = this.get('arrowType'),
                arrowIn = this.get('arrowIn'),

                calcData, namespaceForArrowType = MathInteractives.Common.Components.Theme2.Views.Tooltip, tooltipTop, tooltipTop, tooltipLeft;

            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isIOS === true || MathInteractives.Common.Utilities.Models.BrowserCheck.isNexus === true
                || MathInteractives.Common.Utilities.Models.BrowserCheck.isIE11 === true || this.get('type') === MathInteractives.Common.Components.Theme2.Views.Tooltip.TYPE.FORM_VALIDATION) {
                arrowIn = 2;
            }
            if ((MathInteractives.Common.Utilities.Models.BrowserCheck.isIE === true || MathInteractives.Common.Utilities.Models.BrowserCheck.isIE11 === true)
                && (arrowType === namespaceForArrowType.ARROW_TYPE.BOTTOM || arrowType === namespaceForArrowType.ARROW_TYPE.BOTTOM_LEFT
                    || arrowType === namespaceForArrowType.ARROW_TYPE.BOTTOM_RIGHT || arrowType === namespaceForArrowType.ARROW_TYPE.BOTTOM_MIDDLE)) {
                arrowIn = 1;
            }

            switch (arrowType) {
                case namespaceForArrowType.ARROW_TYPE.TOP_MIDDLE:
                    //here minus one for we need to place arrow inside the boundary of tooltip
                    arrowDivTop = tooltipHeight - boarderWidth - arrowIn;
                    arrowDivLeft = ((tooltipWidth / 2) - boarderWidth - baseWidthOfArrow);

                    borderDivLeft = arrowDivLeft;
                    borderDivTop = (tooltipHeight - boarderWidth) - (arrowIn - 1);    // Fix IE related arrow dettach issue
                    deg = '180deg';

                    tooltipTop = Math.ceil((elementTop - (tooltipHeight + baseWidthOfArrow)));
                    tooltipLeft = Math.ceil((elementLeft + (elementWidth / 2)) - (tooltipWidth / 2));
                    tooltipTop += eleCenter.y;
                    break;
                case namespaceForArrowType.ARROW_TYPE.TOP_LEFT:
                    //here minus one for we need to place arrow inside the boundary of tooltip
                    arrowDivTop = tooltipHeight - boarderWidth - arrowIn;

                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    //+space beacause we want some space at right side after placing the arrow
                    arrowDivLeft = ((tooltipWidth) - ((baseWidthOfArrow * 2) + space));
                    borderDivLeft = arrowDivLeft;
                    borderDivTop = (tooltipHeight - boarderWidth);
                    deg = '180deg';
                    tooltipTop = Math.ceil((elementTop - (tooltipHeight + baseWidthOfArrow)));
                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    //+space beacause we want some space at right side after placing the arrow
                    tooltipLeft = Math.ceil((elementLeft - tooltipWidth + (space + (baseWidthOfArrow * 2))));
                    tooltipTop += eleCenter.y;
                    break;
                case namespaceForArrowType.ARROW_TYPE.TOP_LEFT_CENTER:
                    //here minus one for we need to place arrow inside the boundary of tooltip
                    arrowDivTop = tooltipHeight - boarderWidth - arrowIn;

                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    //+space beacause we want some space at right side after placing the arrow
                    arrowDivLeft = ((tooltipWidth) - ((baseWidthOfArrow * 2) + space));
                    borderDivLeft = arrowDivLeft;
                    borderDivTop = (tooltipHeight - boarderWidth);
                    deg = '180deg';
                    tooltipTop = Math.ceil((elementTop - (tooltipHeight + baseWidthOfArrow)));
                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    //+space beacause we want some space at right side after placing the arrow
                    tooltipLeft = Math.ceil(((elementLeft + (elementWidth / 2)) - tooltipWidth + (space + (baseWidthOfArrow))));
                    tooltipTop += eleCenter.y;
                    break;
                case namespaceForArrowType.ARROW_TYPE.TOP_RIGHT:
                    //here minus one for we need to place arrow inside the boundary of tooltip
                    arrowDivTop = tooltipHeight - boarderWidth - arrowIn;
                    arrowDivLeft = space;
                    borderDivLeft = arrowDivLeft;
                    borderDivTop = (tooltipHeight - boarderWidth);
                    deg = '180deg';
                    tooltipTop = Math.ceil((elementTop - (tooltipHeight + baseWidthOfArrow)));
                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    //+space beacause we want some space at left side after placing the arrow

                    tooltipLeft = Math.ceil((elementLeft + elementWidth - (space + (baseWidthOfArrow * 2))));
                    tooltipTop += eleCenter.y;
                    break;
                case namespaceForArrowType.ARROW_TYPE.TOP_RIGHT_CENTER:
                    //here minus one for we need to place arrow inside the boundary of tooltip
                    arrowDivTop = tooltipHeight - boarderWidth - arrowIn;
                    arrowDivLeft = space;
                    borderDivLeft = arrowDivLeft;
                    borderDivTop = (tooltipHeight - boarderWidth);
                    deg = '180deg';
                    tooltipTop = Math.ceil((elementTop - (tooltipHeight + baseWidthOfArrow)));
                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    //+space beacause we want some space at left side after placing the arrow

                    tooltipLeft = Math.ceil(((elementLeft + (elementWidth / 2)) - (space + (baseWidthOfArrow))));
                    tooltipTop += eleCenter.y;
                    break;
                case namespaceForArrowType.ARROW_TYPE.BOTTOM_MIDDLE:
                    //here add one for we need to place arrow inside the boundary of tooltip
                    arrowDivTop = (-baseWidthOfArrow) + arrowIn;
                    arrowDivLeft = ((tooltipWidth / 2) - boarderWidth - baseWidthOfArrow);
                    borderDivLeft = arrowDivLeft;
                    borderDivTop = (-baseWidthOfArrow);
                    deg = '0deg';
                    tooltipTop = Math.ceil((elementTop + elementHeight + baseWidthOfArrow));
                    tooltipLeft = Math.ceil((elementLeft + (elementWidth / 2)) - (tooltipWidth / 2));
                    tooltipTop -= eleCenter.y;
                    break;
                case namespaceForArrowType.ARROW_TYPE.BOTTOM_LEFT:
                    //here add one for we need to place arrow inside the boundary of tooltip
                    arrowDivTop = (-baseWidthOfArrow) + arrowIn;
                    arrowDivLeft = ((tooltipWidth) - ((baseWidthOfArrow * 2) + space));
                    borderDivLeft = arrowDivLeft;
                    borderDivTop = (-baseWidthOfArrow);
                    deg = '0deg';
                    tooltipTop = Math.ceil((elementTop + (elementHeight + baseWidthOfArrow)));
                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    //+ space beacause we want some space at right side after placing the arrow
                    tooltipLeft = Math.ceil((elementLeft - tooltipWidth + (space + (baseWidthOfArrow * 2))));
                    tooltipTop -= eleCenter.y;
                    break;
                case namespaceForArrowType.ARROW_TYPE.BOTTOM_LEFT_CENTER:
                    //here add one for we need to place arrow inside the boundary of tooltip
                    arrowDivTop = (-baseWidthOfArrow) + arrowIn;
                    arrowDivLeft = ((tooltipWidth) - ((baseWidthOfArrow * 2) + space));
                    borderDivLeft = arrowDivLeft;
                    borderDivTop = (-baseWidthOfArrow);
                    deg = '0deg';
                    tooltipTop = Math.ceil((elementTop + (elementHeight + baseWidthOfArrow)));
                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    //+ space beacause we want some space at right side after placing the arrow

                    tooltipLeft = Math.ceil((elementLeft - tooltipWidth + (elementWidth / 2) + baseWidthOfArrow + space));
                    tooltipTop -= eleCenter.y;
                    break;
                case namespaceForArrowType.ARROW_TYPE.BOTTOM_RIGHT:
                    //here add one for we need to place arrow inside the boundary of tooltip
                    arrowDivTop = (-baseWidthOfArrow) + arrowIn;
                    arrowDivLeft = space;
                    borderDivLeft = arrowDivLeft;
                    borderDivTop = (-baseWidthOfArrow);
                    deg = '0deg';
                    tooltipTop = Math.ceil((elementTop + (elementHeight + baseWidthOfArrow)));
                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    //+ space beacause we want some space at left side after placing the arrow
                    tooltipLeft = Math.ceil((elementLeft + elementWidth - (space + (baseWidthOfArrow * 2))));

                    tooltipTop -= eleCenter.y;
                    break;
                case namespaceForArrowType.ARROW_TYPE.BOTTOM_RIGHT_CENTER:
                    //here add one for we need to place arrow inside the boundary of tooltip
                    arrowDivTop = (-baseWidthOfArrow) + arrowIn;
                    arrowDivLeft = space;
                    borderDivLeft = arrowDivLeft;
                    borderDivTop = (-baseWidthOfArrow);
                    deg = '0deg';
                    tooltipTop = Math.ceil((elementTop + (elementHeight + baseWidthOfArrow)));
                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    //+ space beacause we want some space at left side after placing the arrow
                    tooltipLeft = Math.ceil((elementLeft + (elementWidth / 2) - (baseWidthOfArrow + space)));
                    tooltipTop -= eleCenter.y;
                    break;
                case namespaceForArrowType.ARROW_TYPE.LEFT_BOTTOM:
                    arrowDivTop = space;
                    //here minus one for we need to place arrow inside the boundary of tooltip
                    arrowDivLeft = tooltipWidth - (baseWidthOfArrow) + boarderWidth + arrowIn;
                    borderDivLeft = arrowDivLeft + 1;
                    borderDivTop = arrowDivTop;
                    deg = '90deg';

                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    //+ space beacause we want some space at top side after placing the arrow
                    tooltipTop = Math.ceil((elementTop + elementHeight - (space + (baseWidthOfArrow * 2))));

                    tooltipLeft = Math.ceil((elementLeft - (tooltipWidth + baseWidthOfArrow)));
                    tooltipLeft += eleCenter.x;
                    break;
                case namespaceForArrowType.ARROW_TYPE.LEFT_MIDDLE:
                    arrowDivTop = Math.round((tooltipHeight / 2) - boarderWidth - (baseWidthOfArrow / 2));
                    //here minus one for we need to place arrow inside the boundary of tooltip
                    arrowDivLeft = tooltipWidth - (baseWidthOfArrow) + boarderWidth + arrowIn - 1;
                    borderDivLeft = arrowDivLeft + 2
                    borderDivTop = arrowDivTop;
                    deg = '90deg';
                    tooltipTop = Math.ceil((elementTop + (elementHeight / 2)) - (tooltipHeight / 2));
                    tooltipLeft = Math.ceil((elementLeft - (tooltipWidth + baseWidthOfArrow)));
                    tooltipLeft += eleCenter.x;
                    break;
                case namespaceForArrowType.ARROW_TYPE.LEFT_TOP:

                    arrowDivTop = Math.round((tooltipHeight) - boarderWidth - ((baseWidthOfArrow) + space));
                    //here minus one for we need to place arrow inside the boundary of tooltip
                    arrowDivLeft = tooltipWidth - (baseWidthOfArrow) + boarderWidth + arrowIn;
                    borderDivLeft = arrowDivLeft + 1;
                    borderDivTop = arrowDivTop;
                    deg = '90deg';
                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    //+ space beacause we want some space at bottom side after placing the arrow
                    tooltipTop = Math.ceil(((elementTop - (tooltipHeight)) + space + (baseWidthOfArrow * 2)));

                    tooltipLeft = Math.ceil((elementLeft - (tooltipWidth + baseWidthOfArrow)));
                    tooltipLeft += eleCenter.x;
                    break;
                case namespaceForArrowType.ARROW_TYPE.RIGHT_BOTTOM:
                    arrowDivTop = space;
                    //here add one for we need to place arrow inside the boundary of tooltip
                    //minus 5 for placing arrow to the left side of tooltip
                    arrowDivLeft = (-baseWidthOfArrow - 5) + arrowIn;
                    borderDivLeft = (-baseWidthOfArrow - 5);
                    borderDivTop = arrowDivTop;
                    deg = '270deg';
                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    //+ space beacause we want some space at top side after placing the arrow
                    tooltipTop = Math.ceil((elementTop + elementHeight - (space + (baseWidthOfArrow * 2))));
                    tooltipLeft = Math.ceil((elementLeft + (elementWidth + baseWidthOfArrow)));
                    tooltipLeft -= eleCenter.x;
                    break;
                case namespaceForArrowType.ARROW_TYPE.RIGHT_MIDDLE:
                    arrowDivTop = ((tooltipHeight / 2) - boarderWidth - (baseWidthOfArrow / 2));
                    //here add one for we need to place arrow inside the boundary of tooltip
                    //- 5 for placing arrow to the left side of tooltip
                    arrowDivLeft = (-baseWidthOfArrow - 5) + arrowIn;
                    borderDivLeft = (-baseWidthOfArrow - 5);
                    borderDivTop = arrowDivTop;
                    deg = '270deg';
                    tooltipTop = Math.ceil((elementTop + (elementHeight / 2)) - (tooltipHeight / 2));
                    tooltipLeft = Math.ceil((elementLeft + elementWidth + baseWidthOfArrow));
                    tooltipLeft -= eleCenter.x;
                    break;
                case namespaceForArrowType.ARROW_TYPE.RIGHT_TOP:
                    arrowDivTop = ((tooltipHeight) - boarderWidth - ((baseWidthOfArrow) + space));
                    //here add one for we need to place arrow inside the boundary of tooltip
                    //minus 5 for placing arrow to the left side of tooltip
                    arrowDivLeft = (-baseWidthOfArrow - 5) + arrowIn;
                    borderDivLeft = (-baseWidthOfArrow - 5);
                    borderDivTop = arrowDivTop;
                    deg = '270deg';
                    //baseWidthOfArrow * 2 beacause the arrow width=arrow left border width + arrow right border width
                    // + space beacause we want some space at bottom side after placing the arrow
                    tooltipTop = Math.ceil(((elementTop - (tooltipHeight)) + space + (baseWidthOfArrow * 2)));

                    tooltipLeft = Math.ceil((elementLeft + (elementWidth + baseWidthOfArrow)));
                    tooltipTop += eleCenter.y;
                    break;
            }

            if (arrowFlag === false) {
                switch (positionType) {
                    case namespaceForArrowType.POSITION_TYPE.LEFT:
                        tooltipLeft = Math.ceil(elementLeft);
                        break;
                    case namespaceForArrowType.POSITION_TYPE.RIGHT:
                        tooltipLeft = Math.ceil((elementLeft + elementWidth) - tooltipWidth);
                        break;
                    case namespaceForArrowType.POSITION_TYPE.TOP:
                        tooltipTop = Math.ceil(elementTop);
                        break;
                    case namespaceForArrowType.POSITION_TYPE.BOTTOM:
                        tooltipTop = Math.ceil(elementTop + elementHeight - tooltipHeight);
                        break;
                }
            }

            calcData = {
                "arrowDivTop": arrowDivTop,
                "arrowDivLeft": arrowDivLeft,
                "borderDivLeft": borderDivLeft,
                "borderDivTop": borderDivTop,
                "deg": deg,
                "tooltipTop": tooltipTop,
                "tooltipLeft": tooltipLeft,
                "tooltipHeight": tooltipHeight
            };
            this.set('calcData', calcData);
        }
    });
})();
