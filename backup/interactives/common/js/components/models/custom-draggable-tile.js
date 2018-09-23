
(function () {
    'use strict';

    /**
    * Conatins draggable tile data
    * @class CustomDraggableTile
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.CustomDraggableTile = Backbone.Model.extend({

        defaults: {
            
            /**
            * ID of the tile
            * @property tileId
            * @type String
            * @defaults Empty string
            */
            tileId: '',

            /**
            * File path
            * @property filePath
            * @type Object
            * @defaults Empty string
            */
            filePath: null,

            /**
            * Height of the tile
            * @property height
            * @type Number
            * @defaults 100
            */
            height: 100,

            /**
            * Width of the tile
            * @property width
            * @type Number
            * @defaults 130
            */
            width: 150,

            /**
            * File path
            * @property filePath
            * @type Object
            * @defaults Empty string
            */
            contentHTML: ''

        }

    }, {

        /**
        * Padding of the upper section of tile
        * @property PADDING_TOP
        * @static
        */
        PADDING_TOP: 7,

        /**
        * Left padding of the upper section of tile
        * @property PADDING_LEFT
        * @static
        */
        PADDING_LEFT: 8,

        /**
        * Right padding of the upper section of tile
        * @property PADDING_RIGHT
        * @static
        */
        PADDING_RIGHT: 8,

        /**
        * Width of left and right slice of the lower section of tile
        * @property TILE_BOTTOM_SLICE_WIDTH
        * @static
        */
        TILE_BOTTOM_SLICE_WIDTH: 6,

        /**
        * Height of the lower section of tile
        * @property TILE_BOTTOM_HEIGHT
        * @static
        */
        TILE_BOTTOM_HEIGHT: 21,

        /**
        * Side border of the upper section of tile
        * @property SIDE_BORDER_ADJUSTMENT
        * @static
        */
        SIDE_BORDER_ADJUSTMENT: 2,

        /**
        * Top border of the upper section of tile
        * @property TOP_BORDER_ADJUSTMENT
        * @static
        */
        TOP_BORDER_ADJUSTMENT: 1

    });
})();