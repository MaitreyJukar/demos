/* globals window */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Components.MathJaxTooltip = {};

    MathUtilities.Components.MathJaxTooltip.Models = {};

    MathUtilities.Components.MathJaxTooltip.Views = {};

    MathUtilities.Components.MathJaxTooltip.Models.MathJaxTooltip = Backbone.Model.extend({

        "defaults": function() {
            return {
                "element": null,

                "appendTo": null,

                "playerContainer": null,

                "baseClass": null,

                "latex": null,

                "idPrefix": null,

                "arrowPosition": null,

                "hideArrow": null,

                "isMathQuillTooltip": true
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
                ARROW_HEIGHT = 10,
                BASE_WIDTH_OF_ARROW = 10,
                ARROW_IN = 1,
                arrowType = data.arrowType,
                borderWidth = data.borderWidth,
                tooltipLeft = null,
                arrowDivLeft = null,
                borderDivLeft = null,
                borderDivTop = null,
                deg = null,
                PADDING = 5,
                arrowDivTop = null;


            switch (arrowType) {
                case 'top':
                    arrowDivTop = tooltipHeight - borderWidth - ARROW_IN;
                    arrowDivLeft = tooltipWidth / 2 - borderWidth - BASE_WIDTH_OF_ARROW;

                    borderDivLeft = arrowDivLeft;
                    borderDivTop = tooltipHeight - borderWidth - (ARROW_IN - 1);
                    deg = '180deg';
                    tooltipTop = Math.ceil(elementTop - (tooltipHeight + ARROW_HEIGHT));
                    tooltipLeft = Math.ceil(elementLeft + elementWidth / 2 - tooltipWidth / 2);
                    break;

                case 'left':

                    arrowDivTop = Math.round(tooltipHeight / 2 - borderWidth - BASE_WIDTH_OF_ARROW / 2);
                    arrowDivLeft = tooltipWidth - BASE_WIDTH_OF_ARROW + borderWidth + ARROW_IN;
                    borderDivLeft = arrowDivLeft + ARROW_IN;
                    borderDivTop = arrowDivTop;
                    tooltipTop = Math.ceil(elementTop + elementHeight / 2 - tooltipHeight / 2);
                    tooltipLeft = Math.ceil(elementLeft - (ARROW_HEIGHT + tooltipWidth));
                    deg = '90deg';
                    break;

                case 'bottom':
                    arrowDivTop = -ARROW_HEIGHT + ARROW_IN;
                    arrowDivLeft = tooltipWidth / 2 - borderWidth - ARROW_HEIGHT;
                    borderDivLeft = arrowDivLeft;
                    borderDivTop = -ARROW_HEIGHT;
                    deg = '0deg';
                    tooltipTop = Math.ceil(elementTop + elementHeight + ARROW_HEIGHT);
                    tooltipLeft = Math.ceil(elementLeft + elementWidth / 2 - tooltipWidth / 2);
                    break;

                case 'right':
                    arrowDivTop = tooltipHeight / 2 - borderWidth - ARROW_HEIGHT / 2;
                    arrowDivLeft = -ARROW_HEIGHT - PADDING + ARROW_IN;
                    borderDivLeft = -ARROW_HEIGHT - PADDING;
                    borderDivTop = arrowDivTop;
                    deg = '270deg';
                    tooltipTop = Math.ceil(elementTop + elementHeight / 2 - tooltipHeight / 2);
                    tooltipLeft = Math.ceil(elementLeft + elementWidth + ARROW_HEIGHT);
                    break;
            }
            return {
                "tooltipTop": tooltipTop,
                "tooltipLeft": tooltipLeft,
                "arrowDivTop": arrowDivTop,
                "arrowDivLeft": arrowDivLeft,
                "borderDivLeft": borderDivLeft,
                "borderDivTop": borderDivTop,
                "deg": deg
            };
        }


    });
}(window.MathUtilities));
