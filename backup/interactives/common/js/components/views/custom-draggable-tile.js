
(function () {
    'use strict';

    /**
    * View for rendering Draggable Tile UI
    *
    * @class CustomDraggableTile
    * @constructor
    * @extends MathInteractives.Common.Player.Views.Base
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.CustomDraggableTile = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Whether or not the tile is disabled
        * @property _isDisabled
        * @type Boolean
        * @defaults false
        */
        _isDisabled: false,

        /**
        * jQuery object of dots on lower section 
        * @property _$dots
        * @type Object
        * @defaults null
        */
        _$dots: null,

        /**
        * jQuery object of left slice of lower section 
        * @property _$bottomLeftSlice
        * @type Object
        * @defaults null
        */
        _$bottomLeftSlice: null,

        /**
        * jQuery object of right slice of lower section 
        * @property _$bottomRightSlice
        * @type Object
        * @defaults null
        */
        _$bottomRightSlice: null,

        /**
        * jQuery object of middle portion of lower section 
        * @property _$bottomMid
        * @type Object
        * @defaults null
        */
        _$bottomMid: null,

        /**
        * Calls render
        * @method initialize
        **/
        initialize: function initialize() {
            this.filePath = this.model.get('filePath');
            this.idPrefix = this.model.get('idPrefix');
            this.manager = this.model.get('manager');
            this.player = this.model.get('player');
            this._attachEvents();
            this.render();

            this._$dots = this.$('.draggable-tile-dots');
            this._$bottomLeftSlice = this.$('.tile-bottom-left');
            this._$bottomRightSlice = this.$('.tile-bottom-right');
            this._$bottomMid = this.$('.tile-bottom-mid');
        },

        /**
        * Attaches mouse and touch events 
        *
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            var $el = this.$el,
                Utils = MathInteractives.Common.Utilities.Models.Utils;

            $el.off('mouseenter').on('mouseenter', $.proxy(this._mouseEnter, this));
            $el.off('mouseleave').on('mouseleave', $.proxy(this._mouseLeave, this));

            Utils.EnableTouch($el);
        },

        /**
        * Renders the tile component
        * @method render
        **/
        render: function render() {
            var $el = this.$el,
                model = this.model,
                tileWidth = model.get('width'),
                tileHeight = model.get('height'),
                Model = MathInteractives.Common.Components.Models.CustomDraggableTile,
                tileSectionsHTML = '<div class="draggable-tile-upper-section"></div>'
                                    + '<div class="draggable-tile-lower-section">'
                                        + '<div class="tile-bottom-left"></div>'
                                        + '<div class="tile-bottom-mid">'
                                            + '<div class="draggable-tile-dots"></div></div>'
                                        + '<div class="tile-bottom-right"></div>'
                                    + '</div>';

            // Appending the child divs and styling the tile
            $el.append(tileSectionsHTML)
               .addClass('draggable-tile-ui');

            // Apply suitable height and width to upper section and append content into it
            this.$('.draggable-tile-upper-section').css({
                height: tileHeight - Model.TILE_BOTTOM_HEIGHT - Model.PADDING_TOP - Model.TOP_BORDER_ADJUSTMENT + 'px',
                width: tileWidth - Model.PADDING_LEFT - Model.PADDING_RIGHT - Model.SIDE_BORDER_ADJUSTMENT + 'px'
            }).append(model.get('contentHTML'));

            this.$('.draggable-tile-lower-section').css({
                width: tileWidth
            });

            this.$('.tile-bottom-mid').css({
                width: tileWidth - (2 * Model.TILE_BOTTOM_SLICE_WIDTH)
            });

            this._addImages();
        },

        /**
        * Adds background images
        * @method _addImages
        * @private
        **/
        _addImages: function () {
            var filePath = this.filePath;

            this.$('.draggable-tile-dots').css({
                'background-image': 'url("' + filePath.getImagePath('buttons-icons') + '")'
            });

            this.$('.tile-bottom-left, .tile-bottom-right').css({
                'background-image': 'url("' + filePath.getImagePath('player-lr') + '")'
            });

            this.$('.tile-bottom-mid').css({
                'background-image': 'url("' + filePath.getImagePath('player-m') + '")'
            });
        },

        /**
        * Attaches events to elements in $el
        * @type Object
        **/
//        events: {
//            'mouseenter': '_mouseEnter',
//            'mouseleave': '_mouseLeave'
//        },

        /**
        * Shows hover state and pointer cursor
        * @method _mouseEnter
        * @private
        **/
        _mouseEnter: function () {
//            if ($.support.touch || this._isDisabled) {
//                return;
//            }

            this.$el.css('cursor', 'pointer');

            this._$bottomLeftSlice.addClass('tile-bottom-left-hover');
            this._$bottomRightSlice.addClass('tile-bottom-right-hover');
            this._$bottomMid.addClass('tile-bottom-mid-hover');
        },

        /**
        * Removes hover state 
        * @method _mouseLeave
        * @private
        **/
        _mouseLeave: function () {
            this._$bottomLeftSlice.removeClass('tile-bottom-left-hover');
            this._$bottomRightSlice.removeClass('tile-bottom-right-hover');
            this._$bottomMid.removeClass('tile-bottom-mid-hover');
        },

        /**
        * Shows disabled state of tile
        * @method disableTile
        **/
        disableTile: function () {
            this._$dots.hide();
            this._isDisabled = true;

            this._$bottomLeftSlice.addClass('tile-bottom-left-disabled');
            this._$bottomRightSlice.addClass('tile-bottom-right-disabled');
            this._$bottomMid.addClass('tile-bottom-mid-disabled');
        },

        /**
        * Removes disabled state of tile
        * @method enableTile
        **/
        enableTile: function () {
            this._$dots.show();
            this._isDisabled = false;

            this._$bottomLeftSlice.removeClass('tile-bottom-left-disabled');
            this._$bottomRightSlice.removeClass('tile-bottom-right-disabled');
            this._$bottomMid.removeClass('tile-bottom-mid-disabled');
        }

    }, {

        /**
        * Creates a model and view object for the draggable tile
        *
        * @method generateCustomDraggableTile
        * @param options {Object} 
        * @return {Object} The tile view object.
        */
        generateCustomDraggableTile: function (options) {
            if (options) {
                var tileId, tile, tileView;

                tileId = '#' + options.tileId;
                tile = new MathInteractives.Common.Components.Models.CustomDraggableTile(options);
                tileView = new MathInteractives.Common.Components.Views.CustomDraggableTile({ el: tileId, model: tile });

                return tileView;
            }
        }
    });

    MathInteractives.global.CustomDraggableTile = MathInteractives.Common.Components.Views.CustomDraggableTile;

})();