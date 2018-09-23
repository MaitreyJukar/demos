(function () {
    'use strict';

    var Classname = null;
    /**
    * View for creating pan balance draggable tile.
    *
    * @class PanBalanceDraggableTile
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.PanBalanceDraggableTile = MathInteractives.Common.Player.Views.Base.extend({

        /*
        * Stores background positions of different states of tile
        * @property _backgroundPositions
        * @default null
        * @type {object}
        * @private
        */
        _backgroundPositions: null,

        isSelected: false,

        /**
        * Calls render and attach events
        *
        * @method initialize
        **/
        initialize: function (options) {
            this.filePath = options.filePath;
            this.tileData = options.buttonData;
            this.viewClassName = options.viewClassName;
            this.dataType = options.dataType;
            this.dataText = options.dataText;
            this.dataValue = options.dataValue;
            this._generateBackgroundPosition();
            this.render();
            //this.attachEvents();
            if (options.buttonData.isDisabled) {
                this.disableTile();
            }
            else {
                this.enableTile();
            }
        },

        /**
        * Renders pan balance view
        *
        * @method render
        **/
        render: function () {

            var tileData = this.tileData,
            viewClassName = this.viewClassName,
            newTile,
            oThis = this,
            //$tile = $('#' + tileData.id);
            $tile = oThis.$el;
            var panBalanceDraggableTileHtml = MathInteractives.Common.Components.templates['panBalanceDraggableTile']({ idPrefix: tileData.id }).trim();
            $tile.append(panBalanceDraggableTileHtml);
            $tile.find('.pan-balance-draggable-tile-wrapper').css({
                'width': tileData.width + 'px',
                'height': tileData.height + 'px'
            });

            if (tileData.width === 82) {
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER).addClass('text-var-container');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER_MIDDLE_PART).addClass('text-var');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_RIGHT_SHADOW).addClass('var-tile-right-shadow');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_BOTTOM_SHADOW).addClass('var-tile-bottom-shadow');
            }
            else {
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER).removeClass('text-var-container');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER_MIDDLE_PART).removeClass('text-var');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_RIGHT_SHADOW).removeClass('var-tile-right-shadow');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_BOTTOM_SHADOW).removeClass('var-tile-bottom-shadow');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_RIGHT_SHADOW).addClass('num-tile-right-shadow');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_BOTTOM_SHADOW).addClass('num-tile-bottom-shadow');
            }

            $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_LEFT_SHADOW).css({
                'background-image': 'url("' + oThis.filePath.getImagePath('shadow-left') + '")',
                'background-position': '-17px -1058px'
            });

            $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_RIGHT_SHADOW).css({
                'background-image': 'url("' + oThis.filePath.getImagePath('shadow-right') + '") ',
                'background-position': '-593px -383px'
            });
            $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_BOTTOM_SHADOW).css({
                'background-image': 'url("' + oThis.filePath.getImagePath('shadow-middle') + '")',
                'background-position': '0px -3901px'
            });

            if (tileData.dataIsVarNegative === true) {
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER_LEFT_PART).addClass('red-tiles-left');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER_RIGHT_PART).addClass('red-tiles-right');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER_MIDDLE_PART).addClass('red-tiles-middle');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER).addClass('red-tile');
            }
            else {
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER_LEFT_PART).addClass('green-tiles-left');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER_RIGHT_PART).addClass('green-tiles-right');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER_MIDDLE_PART).addClass('green-tiles-middle');
                $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT_CONTAINER).addClass('green-tile');
            }

            $tile.find('.red-tiles-left').css({
                'background-image': 'url("' + oThis.filePath.getImagePath('red-tile-left-right') + '")',
                'background-position': '0px -3647px'
            });
            $tile.find('.red-tiles-right').css({
                'background-image': 'url("' + oThis.filePath.getImagePath('red-tile-left-right') + '")',
                'background-position': '-50px -1085px'
            });
            $tile.find('.red-tiles-middle').css({
                'background-image': 'url("' + oThis.filePath.getImagePath('red-tile-middle') + '")',
                'background-position': '0px -3647px'
            });
            $tile.find('.green-tiles-left').css({
                'background-image': 'url("' + oThis.filePath.getImagePath('green-tile-left-right') + '")',
                'background-position': '0 -814px'
            });
            $tile.find('.green-tiles-right').css({
                'background-image': 'url("' + oThis.filePath.getImagePath('green-tile-left-right') + '")',
                'background-position': '0 -814px'
            });
            $tile.find('.green-tiles-middle').css({
                'background-image': 'url("' + oThis.filePath.getImagePath('green-tile-middle') + '")',
                'background-position': '0px -1462px'
            });
            $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_DOTS).css({
                'background': 'url("' + oThis.filePath.getImagePath('buttons-icons') + '")',
                'background-position': '-258px -399px'
            });

            this._applyBackgroundPosition('active');

            if (this.dataType === 'Var') {
                if (tileData.dataIsVarNegative) {
                    $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT).addClass('negative-var');
                    $tile.find('.negative-var').html(tileData.text);
                }
                else {
                    $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT).addClass('positive-var');
                    $tile.find('.positive-var').html(tileData.text);
                }
            }
            else {
                if (tileData.dataIsVarNegative) {
                    $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT).addClass('positive-num');
                    $tile.find('.positive-num').text(tileData.text);
                }
                else {
                    $tile.find('.' + viewClassName.PAN_BALANCE_DRAGGABLE_TILE_TEXT).addClass('negative-num');
                    $tile.find('.negative-num').text(tileData.text);
                }
            }
        },

        /**
        * Attaches mouse and touch events to button
        *
        * @method _attachEvents
        * @private
        **/
        attachEvents: function attachEvents() {
            var $tile = $('#' + this.tileData.id),
                utilClass = MathInteractives.Common.Utilities.Models.Utils;

            //if (!$.support.touch) {
                $tile.off('mouseover.tile').on('mouseover.tile', $.proxy(this._onMouseOver, this));
                $tile.off('mouseout.tile').on('mouseout.tile', $.proxy(this._onMouseOut, this));
                //$btn.hover($.proxy(this._onMouseOver, this), $.proxy(this._onMouseOut, this));
                //$tile.on('mousedown', $.proxy(this._onMouseDown, this));
                //$tile.on('mouseup', $.proxy(this._removeTooltip, this));
            //}

            utilClass.EnableTouch($tile, {specificEvents: utilClass.SpecificEvents.DRAGGABLE});
        },

        detachEvents: function detachEvents() {
            var $tile = $('#' + this.tileData.id);
            //if (!$.support.touch) {
                $tile.off('mouseover.tile');
                $tile.off('mouseout.tile');
            //}
            MathInteractives.Common.Utilities.Models.Utils.DisableTouch($tile);
        },

        /*
        * Generates background positions for different states of tile
        * @method _generateBackgroundPosition
        * @private
        */
        _generateBackgroundPosition: function () {
            var backgroundPosition = { active: {}, hover: {}, down: {} };

            backgroundPosition.active[0] = 0;
            backgroundPosition.hover[0] = 94;
            backgroundPosition.down[0] = 94;

            backgroundPosition.active[1] = 0;
            backgroundPosition.hover[1] = 47;
            backgroundPosition.down[1] = 47;

            backgroundPosition.active[2] = 47;
            backgroundPosition.hover[2] = 141;
            backgroundPosition.down[2] = 141;

            this._backgroundPositions = backgroundPosition;
        },

        /*
        * Apply background position according to the state received in the argument
        * @method _applyBackgroundPosition
        * @param {string} state
        * @private
        */
        _applyBackgroundPosition: function (state) {
            var currentBackgroundPosition = this._backgroundPositions[state],
                $tile = $('#' + this.tileData.id);

            $tile.find('.red-tiles-left').css('background-position', '-50px -' + (currentBackgroundPosition[0] + 1085) + 'px');
            $tile.find('.red-tiles-middle').css('background-position', '0px -' + (currentBackgroundPosition[1] + 3647) + 'px');
            $tile.find('.red-tiles-right').css('background-position', '-50px -' + (currentBackgroundPosition[2] + 1085) + 'px');

            $tile.find('.green-tiles-left').css('background-position', '0px -' + (currentBackgroundPosition[0] + 814) + 'px');
            $tile.find('.green-tiles-middle').css('background-position', '0px -' + (currentBackgroundPosition[1] + 1462) + 'px');
            $tile.find('.green-tiles-right').css('background-position', '0px -' + (currentBackgroundPosition[2] + 814) + 'px');

        },

        /**
        * Adds hover effect
        *
        * @method _onMouseOver
        * @private
        **/
        _onMouseOver: function (event) {
            var $target = $(event.target);
            if ($target.hasClass('pan-balance-draggable-tile-right-shadow') || $target.hasClass('pan-balance-draggable-tile-bottom-shadow')) {
                return;
            }
            this._applyBackgroundPosition('hover');
            this.$el.find('div').addClass('hover');
        },

        /**
        * Removes hover effect
        *
        * @method _onMouseOver
        * @private
        **/
        _onMouseOut: function () {
            this._applyBackgroundPosition('active');
            this.$el.find('div').removeClass('hover');
        },

        _onMouseDown: function () {
            this._applyBackgroundPosition('down');
        },

        disableTile: function disableTile() {
            this.hideDraggableTileShadow();
            this.hideDraggableTileDots();
            this.detachEvents();
        },

        enableTile: function enableTile() {
            this.showDraggableTileDots();
            this.showDraggableTileShadow();
            this.attachEvents();
        },

        /**
        * Hides shadows of draggable tiles.
        *
        * @method hideDraggableTileShadow
        **/
        hideDraggableTileShadow: function () {
            //var tileData = this.tileData;
            //$('#' + tileData.id).find('.shadow').hide();
            var $tile = this.$el;
            $tile.find('.shadow').hide();
        },

        /**
        * Shows shadows of draggable tiles.
        *
        * @method showDraggableTileShadow
        **/
        showDraggableTileShadow: function () {
            //var tileData = this.tileData;
            //$('#' + tileData.id).find('.shadow').show();
            var $tile = this.$el;
            $tile.find('.shadow').show();
        },

        /**
        * Hides shadows of draggable tiles.
        *
        * @method hideDraggableTileShadow
        **/
        hideDraggableTileDots: function () {
            var tileData = this.tileData;
            $('#' + tileData.id).find('.pan-balance-draggable-tile-dots').hide();
            if (this.dataType === 'Var') {
                this.$el.find('.pan-balance-draggable-tile-text').css({ 'height': '37px', 'line-height': '35px' });
            }
            else {
                this.$el.find('.pan-balance-draggable-tile-text').css({ 'height': '37px', 'line-height': '37px' });
            }
        },

        /**
        * Shows shadows of draggable tiles.
        *
        * @method showDraggableTileShadow
        **/
        showDraggableTileDots: function () {
            var tileData = this.tileData;
            $('#' + tileData.id).find('.pan-balance-draggable-tile-dots').show();
            this.$el.find('.pan-balance-draggable-tile-text').css({ 'height': '25px', 'line-height': '25px' });
        },

        /**
        * Adds border to the tile when it is selected and removes it if clicked on a selected tile
        * @method showBorder
        * @param color{String} green or red
        * @type public
        */
        showBorder: function showBorder(color, accMessages) {
            var tileData = this.tileData,
                dataIsVarNegative = tileData.dataIsVarNegative,
                tileContainer = this.$('.pan-balance-draggable-tile-text-container'),
                className = null,
                BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;

            className = dataIsVarNegative ? 'red-tile-border' : 'green-tile-border';

            if (BrowserCheck.isFirefox) {
                className = dataIsVarNegative ? 'red-tile-border-shadow' : 'green-tile-border-shadow';
            }
            if (tileContainer.hasClass(className)) {
                tileContainer.removeClass(className);
                this.isSelected = false;
            } else {
                tileContainer.addClass(className);
                this.isSelected = true;
            }
            return this.isSelected;
        },
        /**
        * Removes border from the tile
        * @method removeBorder
        * @param color{String} green or red
        * @type public
        */
        removeBorder: function removeBorder(color, accMessages) {
            var tileData = this.tileData,
                dataIsVarNegative = tileData.dataIsVarNegative,
                tileContainer = this.$('.pan-balance-draggable-tile-text-container'),
                className = dataIsVarNegative ? 'red-tile-border' : 'green-tile-border',
                BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
            if (BrowserCheck.isFirefox) {
                className = dataIsVarNegative ? 'red-tile-border-shadow' : 'green-tile-border-shadow';
            }
            tileContainer.removeClass(className);
            this.isSelected = false;
            return false;
        },
        /**
        * Adds border to the tile
        * @method addBorder
        * @param color{String} green or red
        * @type public
        */
        addBorder: function addBorder(color) {
            var tileData = this.tileData,
                dataIsVarNegative = tileData.dataIsVarNegative,
                tileContainer = this.$('.pan-balance-draggable-tile-text-container'),
                className = dataIsVarNegative ? 'red-tile-border' : 'green-tile-border',
                BrowserCheck = MathInteractives.Common.Utilities.Models.BrowserCheck;
            if (BrowserCheck.isFirefox) {
                className = dataIsVarNegative ? 'red-tile-border-shadow' : 'green-tile-border-shadow';
            }
            tileContainer.addClass(className);
            //var tileData = this.tileData;
            //$('#' + tileData.id).find('.shadow').show();
            var $tile = this.$el;
            $tile.find('.shadow').show();
            this.isSelected = true;

        }


    }, {
        hideDraggableTileShadow: function ($tile) {
            $tile.find('.shadow').hide();
        },
        showDraggableTileShadow: function ($tile) {
            $tile.find('.shadow').show();
        },
        setPulseEffect: function setPulseEffect(step, $tile, isTileColor) {
            var $draggableTileTextContainer = $tile;
            var isTileColorGreen = isTileColor;
            if (isTileColorGreen) {
                $draggableTileTextContainer.css({
                    'box-shadow': '0px 0.732px 5px 1.5px rgba(31, 135, 99,' + step + ')',
                    '-moz-box-shadow': '0px 0.732px 5px 1.5px rgba(31, 135, 99,' + step + ')',
                    '-webkit-box-shadow': '0px 0.732px 5px 1.5px rgba(31, 135, 99,' + step + ')'
                });
            }
            else {
                $draggableTileTextContainer.css({
                    'box-shadow': '0px 0.732px 5px 1.5px rgba(152,0, 78,' + step + ')',
                    '-moz-box-shadow': '0px 0.732px 5px 1.5px rgba(152,0, 78,' + step + ')',
                    '-webkit-box-shadow': '0px 0.732px 5px 1.5px rgba(152,0, 78,' + step + ')'
                });
            }
        },
        showPulse: function showPulse($tile, isTileColor, enableTryAgainButton) {
            var isTileColorGreen = isTileColor, enableTryAgainButton = enableTryAgainButton;
            var $draggableTileTextContainer = $tile.find('.pan-balance-draggable-tile-text-container');
            Classname.hideDraggableTileShadow($tile);
            $({ step: 0.3 }).animate(
            { step: 1 },
            {
                step: function (step) {
                    Classname.setPulseEffect(step, $draggableTileTextContainer, isTileColorGreen);
                },
                complete: function () {
                    $({ step: 1 }).animate(
                    { step: 0.3 },
                    {
                        step: function (step) {
                            Classname.setPulseEffect(step, $draggableTileTextContainer, isTileColorGreen);
                        },
                        complete: function () {
                            $({ step: 0.3 }).animate(
                            { step: 1 },
                            {
                                step: function (step) {
                                    Classname.setPulseEffect(step, $draggableTileTextContainer, isTileColorGreen);
                                },
                                complete: function () {
                                    $({ step: 1 }).animate(
                                    { step: 0.3 },
                                    {
                                        step: function (step) {
                                            Classname.setPulseEffect(step, $draggableTileTextContainer, isTileColorGreen);
                                        },
                                        complete: function () {
                                            $({ step: 0.3 }).animate(
                                            { step: 1 },
                                            {
                                                step: function (step) {
                                                    Classname.setPulseEffect(step, $draggableTileTextContainer, isTileColorGreen);
                                                },
                                                complete: function () {
                                                    if (enableTryAgainButton) {
                                                        enableTryAgainButton();
                                                    }
                                                },
                                                duration: 500
                                            });
                                        },
                                        duration: 500
                                    });
                                },
                                duration: 500
                            });
                        },
                        duration: 500
                    });
                },
                duration: 500
            });

        },
        hidePulse: function hidePulse($tile) {
            //Classname.showDraggableTileShadow();
            var $draggableTileTextContainer = $tile.find('.pan-balance-draggable-tile-text-container');
            $draggableTileTextContainer.css({
                'box-shadow': 'none',
                '-moz-box-shadow': 'none',
                '-webkit-box-shadow': 'none'
            });
        },

        showHighlightedPulse: function showHighlightedPulse($tile, isTileColor) {
            var $draggableTileTextContainer = $tile.find('.pan-balance-draggable-tile-text-container');
            var isTileColorGreen = isTileColor;
            if (isTileColorGreen) {
                $draggableTileTextContainer.css({
                    'box-shadow': '0px 0.732px 5px 1.5px rgb(31, 135, 99)',
                    '-moz-box-shadow': '0px 0.732px 5px 1.5px rgb(31, 135, 99)',
                    '-webkit-box-shadow': '0px 0.732px 5px 1.5px rgb(31, 135, 99)'
                });
            }
            else {
                $draggableTileTextContainer.css({
                    'box-shadow': '0px 0.732px 5px 1.5px rgb(152,0, 78)',
                    '-moz-box-shadow': '0px 0.732px 5px 1.5px rgb(152,0, 78)',
                    '-webkit-box-shadow': '0px 0.732px 5px 1.5px rgb(152,0, 78)'
                });
            }
        }
    });

    Classname = MathInteractives.Common.Components.Views.PanBalanceDraggableTile;

})();
