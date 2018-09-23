
(function () {
    'use strict';

    /**
    * View for rendering Tooltip 
    *
    * @class Tooltip
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.Tooltip = Backbone.View.extend({
        /**
        * jQuery object of tooltip
        * 
        * @property $tooltip
        * @type Object
        * @defaults null
        */
        $tooltip: null,

        /**
        * Holds the model of path for preloading files
        *
        * @property filePath
        * @type Object
        * @default null
        */
        path: null,

        /**
        * Calls render
        *
        * @method initialize
        **/
        initialize: function initialize() {
            this.path = this.model.get('path');
            this.render();
        },

        /**
        * Renders the tooltip
        *
        * @method render
        **/
        render: function render() {
            var model = this.model,
                tooltiptext = model.get('text'),
                data = {
                    id: model.get('id'),
                    content: ''
                };

            this._toolTipHTML = MathInteractives.Common.Components.templates.tooltip(data).trim();
        },

        /**
        * Appends and positions the tooltip
        *
        * @method showTooltip
        **/
        showTooltip: function showtooltip() {
            var model = this.model,
                tooltipPos = model.get('tooltipPosition'), minWidth = 0;

            $('.de-mathematics-interactive-tooltip').remove();
            $('body').append(this._toolTipHTML);

            $('.de-mathematics-interactive-tooltip.tooltip-left, .de-mathematics-interactive-tooltip.tooltip-right, .de-mathematics-interactive-tooltip.tooltip-arrow').css({
                'background-image': 'url("' + this.path.getImagePath('player-lr') + '")'
            }).each(function () {
                minWidth += $(this).width();
            });

            $('.de-mathematics-interactive-tooltip.tooltip-mid').css({
                'background-image': 'url("' + this.path.getImagePath('player-m') + '")'
            }).html(model.get('text')).each(function () {
                minWidth += $(this).width();
            });

            this.$tooltip = $('#' + model.get('id'));

            if (tooltipPos === null) {
                tooltipPos = this._getTooltipPosition();
            }
           
            this.$tooltip.css({
                'top': tooltipPos.top, 'left': tooltipPos.left,
                'min-width': minWidth
            });
        },

        /**
        * Removes the tooltip from DOM
        *
        * @method showTooltip
        **/
        hideTooltip: function hideTooltip() {
            if (this.$tooltip !== null) {
                this.$tooltip.remove();
            }
        },

        /**
        * Changes the tooltip text
        *
        * @method changeTooltipText
        **/
        changeTooltipText: function (text) {
            this.model.set('text', text);

            if (this.$tooltip) {
                this.$tooltip.find('.tooltip-mid').html(text);
            }
        },

        /**
        * Determines the position of the tooltip
        *
        * @method _getTooltipPosition
        * @return {Object} [tooltipPosition] Position of the tooltip
        * @private
        **/
        _getTooltipPosition: function _getTooltipPosition() {
            var model = this.model,
                elementPos = model.get('elementOffsetPosition'),
                elementDimensions = model.get('elementDimensions'),
                tooltipPosition = {},
                $tooltip = this.$tooltip,
                toolTipWidth = $tooltip.outerWidth(),
                tooltipheight = $tooltip.outerHeight(),
                staticDataHolder = MathInteractives.Common.Components.Views.Tooltip,
                $player = model.get('player').$el,
                playerOffset = $player.offset(),
                playerWidth = $player.width(),
                invertedTooltipPadding = staticDataHolder.INVERTED_TOOLTIP_PADDING;

            tooltipPosition.top = elementPos.top - tooltipheight;
            tooltipPosition.left = elementPos.left + (elementDimensions.width / 2) - (toolTipWidth / 2);

            if (tooltipPosition.top < playerOffset.top) {
                tooltipPosition.top = elementDimensions.height + invertedTooltipPadding + elementPos.top;
                this.$tooltip.find('.tooltip-arrow').addClass('inverted-tootlip');
            }

            return tooltipPosition;
        },

        /**
        * Updates the position of the element in the model
        *
        * @method updateElementPos
        * @param {Object} [position] Position of element to which tooltip is attached
        **/
        updateElementPos: function (position) {
            this.model.set('elementOffsetPosition', position);
        }

    }, {

        /**
        * Top padding of inverted tooltip
        *
        * @static 
        **/
        INVERTED_TOOLTIP_PADDING: 6,

        generateTooltip: function (options) {
            if (options) {
                var tooltip = new MathInteractives.Common.Components.Models.Tooltip(options);
                var tooltipView = new MathInteractives.Common.Components.Views.Tooltip({ model: tooltip });

                return tooltipView;
            }
        }
    });

    MathInteractives.global.Tooltip = MathInteractives.Common.Components.Views.Tooltip;
})();