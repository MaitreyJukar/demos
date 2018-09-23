/* globals $, window, _ */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Components.Tooltip.Views = {};
    /**
     * View for rendering Tool tip
     *
     * @class Tooltip
     * @constructor
     * @namespace MathUtilities.Components.Combo box.Views
     **/
    MathUtilities.Components.Tooltip.Views.CustomTooltip = Backbone.View.extend({
        /**
         * jQuery object of tool tip
         *
         * @property $tooltip
         * @type Object
         * @defaults null
         */
        "$tooltip": null,

        /**
         * Holds the model of path for preloading files
         *
         * @property filePath
         * @type Object
         * @default null
         */
        "path": null,

        /**
         * Boolean if touch-end occur for tab & hold functionality.
         * @property isTouchEnd
         */
        "isTouchEnd": null,

        /**
         * Calls render
         *
         * @method initialize
         **/
        "initialize": function() {
            this.path = this.model.get('path');
            this.delegateClass = this.model.get('delegateClass');
            this.render();
        },

        /**
         * Renders the tooltip
         *
         * @method render
         **/
        "render": function() {
            var model = this.model,
                $tooltipParent = null,
                data = {
                    "id": model.get('id'),
                    "content": ''
                };

            this._toolTipHTML = MathUtilities.Components.templates.tooltip(data).trim();

            if (model.get('$toolTipParent')) {
                $tooltipParent = model.get('$toolTipParent');
            } else {
                $tooltipParent = $('#' + model.get('id').replace('-tooltip', ''));
            }
            if (this.delegateClass) {
                $tooltipParent.on('mouseenter', this.delegateClass, _.bind(this.showTooltip, this)).on('mouseleave mouseup', this.delegateClass, _.bind(this.hideTooltip, this));
            } else {
                $tooltipParent.on('mouseenter', _.bind(this.showTooltip, this)).on('mouseleave mouseup', _.bind(this.hideTooltip, this));
                MathUtilities.Components.Utils.TouchSimulator.enableTouch($tooltipParent, {
                    "specificEvents": MathUtilities.Components.Utils.TouchSimulator.SPECIFIC_EVENTS.UP_DOWN
                });
            }
        },

        /**
         * Appends and positions the tool tip
         *
         * @method showTooltip
         **/
        "showTooltip": function(event) {
            var model = this.model,
                $tooltipParent, _showToolTip, _onTimeOut;
            if (this.delegateClass) {
                $tooltipParent = $(event.currentTarget);
            } else {
                $tooltipParent = (model.get('$toolTipParent')) ? model.get('$toolTipParent') : $('#' + this.model.get('id').replace('-tooltip', ''));
            }
            _showToolTip = _.bind(function() {
                var tooltipPos = model.get('position'),
                    minWidth = 0,
                    text = model.get('text'),
                    parentWidth = $tooltipParent.innerWidth(),
                    parentHeight = $tooltipParent.innerHeight(),
                    $tooltipArrow = null;
                $('.math-utilities-tooltip').remove();
                model.get('tool-holder').append(this._toolTipHTML);

                $('.math-utilities-tooltip.tooltip-arrow').each(function() {
                    minWidth += $(this).width();
                });
                if (model.get('alternateText') && $tooltipParent.find('.' + model.get('classIdentifier')).length !== 0) {
                    text = model.get('alternateText');
                }
                $('.math-utilities-tooltip.tooltip-holder').html(text).each(function() {
                    minWidth += $(this).width();
                });

                this.$tooltip = $('#' + model.get('id'));
                $tooltipArrow = this.$tooltip.find('.tooltip-arrow');


                switch (tooltipPos) {
                    case 'bottom':
                    case 'bottom-center-left':
                    case 'bottom-center-right':

                        $tooltipArrow.addClass('inverted-tootlip');
                        break;
                    case 'top':

                        break;
                }
                this.adjustTooltipPosition($tooltipParent, tooltipPos);

            }, this);
            _onTimeOut = _.bind(function() {
                if (!this.isTouchEnd) {
                    _showToolTip();
                }
            }, this);

            this.isTouchEnd = false;

            if ('ontouchstart' in window) {
                if (!$tooltipParent.hasClass('math-utilities-tooltip-holder')) {
                    $tooltipParent.addClass('math-utilities-tooltip-holder');
                }
                //timer fo tab-hold functionality
                setTimeout(_onTimeOut, MathUtilities.Components.Tooltip.Views.CustomTooltip.TAB_HOLD_TIME);
            } else {
                _showToolTip();
            }
        },

        "adjustTooltipPosition": function($element, arrowPosition) {
            var obj,
                $el = this.$tooltip,
                tooltipLeft = null,
                topPadding = this.model.get('topPadding');

            obj = this.calculatePosition(arrowPosition, $element);

            $el.offset({
                "top": obj.tooltipTop + topPadding,
                "left": obj.tooltipLeft
            }).css({
                "top": Math.floor($el.position().top),
                "left": Math.floor($el.position().left)
            });
            if (obj.arrowDivLeft) {
                this.$tooltip.find('.tooltip-arrow').css({
                    "margin-left": obj.arrowDivLeft
                });
            }

        },

        "calculatePosition": function(arrowType, $element) {
            var tooltipWidth = this.$tooltip.find('.tooltip-holder').outerWidth(),
                tooltipHeight = this.$tooltip.find('.tooltip-holder').outerHeight(),
                obj,
                elementWidth = $element.outerWidth(),
                elementHeight = $element.outerHeight();

            obj = this.model.calculateTooltipPosition({
                "elementTop": $element.offset().top,
                "elementLeft": $element.offset().left,
                "elementWidth": elementWidth,
                "elementHeight": elementHeight,
                "tooltipWidth": tooltipWidth,
                "tooltipHeight": tooltipHeight,
                "arrowType": arrowType
            });
            return obj;

        },

        /**
         * Removes the tooltip from DOM
         *
         * @method hideTooltip
         **/
        "hideTooltip": function hideTooltip() {
            this.isTouchEnd = true;
            if (this.$tooltip !== null) {
                this.$tooltip.hide();
            }

            $('#' + this.model.get('id').replace('-tooltip', '')).removeClass('math-utilities-tooltip-holder');
        },

        /**
         * Changes the tooltip text
         *
         * @method changeTooltipText
         **/
        "changeTooltipText": function(text) {
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
        "_getTooltipPosition": function _getTooltipPosition() {
            var tooltipPosition = {},
                $tooltip = this.$tooltip,
                tooltipOffset = $tooltip.offset(),
                tooltipHeight = $tooltip.outerHeight();


            if (tooltipOffset.top < tooltipHeight) {
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
        "updateElementPos": function(position) {
            this.model.set('elementOffsetPosition', position);
        }

    }, {

        /**
         * Top padding of inverted tooltip
         *
         * @static
         **/
        "INVERTED_TOOLTIP_PADDING": 10,

        "TAB_HOLD_TIME": 600,

        "generateTooltip": function(options) {
            if (options) {
                var tooltip = new MathUtilities.Components.Tooltip.Models.CustomTooltip(options),
                    tooltipView = new MathUtilities.Components.Tooltip.Views.CustomTooltip({
                        "model": tooltip
                    });

                return tooltipView;
            }
        }
    });

    MathUtilities.Components.CustomTooltip = MathUtilities.Components.Tooltip.Views.CustomTooltip;
})(window.MathUtilities);
