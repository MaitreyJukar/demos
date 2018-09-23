/* globals MathUtilities */

(function() {
    'use strict';
    MathUtilities.Components.Tooltip = {};
    MathUtilities.Components.Tooltip.Models = {};
    /**
     * Contains tool tip data
     *
     * @class Tooltip
     * @constructor
     * @extends Backbone.Model
     * @namespace MathUtilities.Components.Tooltip.Models
     */
    MathUtilities.Components.Tooltip.Models.CustomTooltip = Backbone.Model.extend({

        "defaults": function() {
            return {
                /**
                 * Tool tip ID
                 * 
                 * @property id
                 * @type String
                 * @defaults Empty string
                 */
                "id": "",

                /**
                 * Text to be displayed in the Tool tip
                 * 
                 * @property text
                 * @type String
                 * @default null
                 */
                "text": null,

                /**
                 * Position of tool tip
                 * 
                 * @property tooltipPosition
                 * @type Object
                 * @defaults null
                 */
                "tooltipPosition": null,

                /**
                 * Position of element to which tool tip belongs
                 * 
                 * @property elementOffsetPosition
                 * @type Object
                 * @defaults null
                 */
                "elementOffsetPosition": null,

                /**
                 * Size of the element to which tool tip belongs
                 * 
                 * @property elementDimensions
                 * @type Object
                 * @defaults null
                 */
                "elementDimensions": null,

                /**
                 * User specified image for Tool tip
                 * @property player
                 * @type Object
                 * @defaults null
                 */
                "player": null,

                "topPadding": 0
            };
        },

        "calculateTooltipPosition": function(data) {
            var elementTop = data.elementTop,
                elementLeft = data.elementLeft,
                elementWidth = data.elementWidth,
                elementHeight = data.elementHeight,
                tooltipWidth = data.tooltipWidth,
                tooltipHeight = data.tooltipHeight,
                tooltipTop = null,
                ARROW_HEIGHT = 7,
                BASE_WIDTH_OF_ARROW = 7,
                SPACE = 10,
                arrowType = data.arrowType,
                arrowDivLeft = null,
                tooltipLeft = null;


            switch (arrowType) {
                case 'top':
                    tooltipTop = Math.ceil(elementTop - (tooltipHeight + ARROW_HEIGHT));
                    tooltipLeft = Math.ceil(elementLeft + elementWidth / 2 - tooltipWidth / 2);
                    break;

                case 'bottom':
                    tooltipTop = Math.ceil(elementTop + elementHeight + ARROW_HEIGHT);
                    tooltipLeft = Math.ceil(elementLeft + elementWidth / 2 - tooltipWidth / 2);
                    break;

                case 'bottom-center-left':
                    tooltipTop = Math.ceil(elementTop + elementHeight + ARROW_HEIGHT);
                    tooltipLeft = Math.ceil((elementLeft - tooltipWidth + (elementWidth / 2) + BASE_WIDTH_OF_ARROW + SPACE));
                    arrowDivLeft = (elementLeft - tooltipLeft) + (elementWidth / 2) - (BASE_WIDTH_OF_ARROW / 2);
                    break;

                case 'bottom-center-right':
                    tooltipTop = Math.ceil(elementTop + elementHeight + ARROW_HEIGHT);
                    tooltipLeft = Math.ceil((elementLeft + (elementWidth / 2) - (BASE_WIDTH_OF_ARROW + SPACE)));
                    arrowDivLeft = (elementWidth / 2) - (tooltipLeft - elementLeft) - (BASE_WIDTH_OF_ARROW / 2);
                    break;

                case 'top-center-left':
                    tooltipTop = Math.ceil(elementTop - (tooltipHeight + ARROW_HEIGHT));
                    tooltipLeft = Math.ceil(((elementLeft + (elementWidth / 2)) - tooltipWidth + (SPACE + (BASE_WIDTH_OF_ARROW))));
                    arrowDivLeft = (elementLeft - tooltipLeft) + (elementWidth / 2) - (BASE_WIDTH_OF_ARROW / 2);
                    break;

                case 'top-center-right':
                    tooltipTop = Math.ceil(elementTop - (tooltipHeight + ARROW_HEIGHT));
                    tooltipLeft = Math.ceil(((elementLeft + (elementWidth / 2)) - (SPACE + (BASE_WIDTH_OF_ARROW))));
                    arrowDivLeft = (elementWidth / 2) - (tooltipLeft - elementLeft) - (BASE_WIDTH_OF_ARROW / 2);
                    break;
            }
            return {
                "tooltipTop": tooltipTop,
                "tooltipLeft": tooltipLeft,
                "arrowDivLeft": arrowDivLeft
            };
        }
    });
})();
