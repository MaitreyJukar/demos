(function () {

    /**
    * Contains gridArea data
    * @class GridArea
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.GridArea = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: {
            /*
            * Stores the count of the images drawn in the canvas
            * @type Array
            * @property countArray
            * @default null
            */
            countArray: null,

            /*
            * Stores the informations of tiles as its model
            * @type Array
            * @property tileCollection
            * @default []
            */
            tileCollection: [],

            /*
            * Stores the width of a single tile
            * @type Number
            * @property tileWidth
            * @default null
            */
            tileWidth: null,

            /*
            * Stores the height of a single tile
            * @type Number
            * @property tileHeight
            * @default null
            */
            tileHeight: null,

            /*
            * Stores the paths of the images to be drawn
            * @type images
            * @property Array
            * @default []
            */
            images: [],

            /*
            * Stores the paths of the hover images
            * @type hoverImages
            * @property Array
            * @default []
            */
            hoverImages: [],

            /*
            * canvas Type to access.
            * @type String
            * @property canvasType
            * @default null
            */
            canvasType: null,

            /*
            * current extreme point
            * @type String
            * @property extremeTilePosition
            * @default null
            */
            selectedTilesArray: null,

            /**
            * current tile position
            * @type String
            * @property currentTilePosition
            * @default null
            **/
            currentTilePosition: null
        },

        /*
        * Initializes model
        * @public
        * @method initialize
        */
        initialize: function () {
            this.set('tileCollection', new MathInteractives.Common.Components.Models.GridArea.TileCollection(this.get('tileCollection')));

            if (!this.get('countArray')) {
                this.set('countArray', new Array());
            }

            this.on('change:countArray', $.proxy(this._fireCountUpdateEvent, this));
        },

        /**
        * Triggers the count update event
        * @method _fireCountUpdateEvent
        * @private
        **/
        _fireCountUpdateEvent: function _fireCountUpdateEvent() {
            this.trigger(MathInteractives.Common.Components.Models.GridArea.EVENTS.COUNT_UPDATE_EVENT);
        },

        /*
        * Sets countArray
        * @public
        * @method setCountArray
        * @param {Array} [countArray] Array containing the counts of each type of images
        */
        setCountArray: function (countArray) {
            this.set('countArray', countArray);
        },

        /*
        * Sets canvasType
        * @public
        * @method setcanvasType
        * @param type {String} specifying type of canvas to access.
        */
        setCanvasType: function (type) {
            this.set('canvasType', type);
        },

        /*
        * Populates the path of the images to be drawn to images and hover images to hoverImages properties
        * @public
        * @method populateImages
        * @param {Array} [imagesArray] Array containing the paths of the images to be set to the tiles
        * @param {Array} [hoverImagesArray] Array containing the paths of the hover images to be shown on hover of the tiles
        */
        populateImages: function (imagesArray, hoverImagesArray) {
            this.set('images', imagesArray);
            this.set('hoverImages', hoverImagesArray);

            var array = [];

            if (this.get('countArray').length === 0) {
                for (var i = 0; i < this.get('images').length; i++) {
                    array[i] = 0;
                }
                this.set('countArray', array);
            }
        }

    },
    {
        /**
        * Stores the events names
        * @property EVENTS
        * @type Object
        **/
        EVENTS: {
            COUNT_UPDATE_EVENT: 'countUpdate'
        },

        /*
        * Returns a string by combining row and column which becomes the id of the tile model
        * @public
        * @method populateImages
        * @param {Number} [row] Row of tile in the grid
        * @param {Number} [col] Column of tile in the grid
        */
        getTileId: function (row, col) {
            return row.toString() + "-" + col.toString();
        },

        /**
        * Contains Tile data
        * @class Tile
        * @extends Backbone.Model
        */
        Tile: Backbone.Model.extend({
            defaults: {
                /*
                * Id of the tile
                * @type String
                * @property id
                * @default null
                */
                id: null,

                /*
                * Row of the tile in grid
                * @type Number
                * @property tileRow
                * @default null
                */
                tileRow: null,

                /*
                * Column of the tile in grid
                * @type Number
                * @property tileCol
                * @default null
                */
                tileCol: null,

                /*
                * Index of the type of image set to ths tile 
                * @type Number
                * @property imageIndex
                * @default null
                */
                imageIndex: null
            }
        }),

        /**
        * Contains the tiles informations inside a collection
        * @class TileCollection
        * @construtor
        * @extends Backbone.Collection
        */
        TileCollection: Backbone.Collection.extend({

            /*
            * Initializes collection with the tile model
            * @method initialize
            */
            initialize: function (options) {
                model = this.Tile;
            },

            /*
            * Adds tile model to the collection
            * @method add
            * @param {Object} [tiles] tiles model
            */
            add: function (tiles) {
                // For array
                tiles = _.isArray(tiles) ? tiles.slice() : [tiles]; //From backbone code itself
                for (i = 0, length = tiles.length; i < length; i++) {
                    var tile = ((tiles[i] instanceof this.model) ? tiles[i] : new this.model(tiles[i])); // Create a model if it's a JS object

                    var oldTile = this.where({ id: tile.get('id') });

                    if (oldTile.length > 0) {

                        // change the fillType attribute if new imagepath is given
                        for (var i = 0; i < oldTile.length; i++) {
                            //oldTile[i].set('fillTypeURL', tile.get('fillTypeURL'));
                            oldTile[i].set('imageIndex', tile.get('imageIndex'));
                        }
                        return false;
                    }
                    Backbone.Collection.prototype.add.call(this, tile);
                }
            },

            /*
            * Initializes the tile model with some values and calls add to add tiles to the collection
            * @method addTiles
            * @param {Array} [array] Array with tile position information i.e. tileRow, tileCol
            * @param {Number} [imageIndex] Index of the image from images property
            */
            addTiles: function (array, imageIndex/*imagePath*/) {
                var gridAreaModel = MathInteractives.Common.Components.Models.GridArea;
                for (var i = 0; i < array.length; i++) {

                    var tile = new MathInteractives.Common.Components.Models.GridArea.Tile({
                        id: gridAreaModel.getTileId(array[i].tileRow, array[i].tileCol),
                        tileRow: array[i].tileRow,
                        tileCol: array[i].tileCol,
                        //fillTypeURL: imagePath
                        imageIndex: imageIndex
                    });

                    this.add(tile);
                }
            },

            /*
            * Clears the collection
            * @method resetCollection
            */
            resetCollection: function () {
                var length = this.length;

                for (var i = 0; i < length; i++) {
                    this.remove(this.models[i]);
                    length--;
                    i--;
                }
            },

            /*
            * Removes a single tile model from the collection
            * @method removeTile
            * @param {Array} [row] Row of the tile in the grid to be removed
            * @param {Number} [col] Column of the tile in the grid to be removed
            */
            removeTile: function (row, col) {
                var gridAreaModel = MathInteractives.Common.Components.Models.GridArea,
                    id = gridAreaModel.getTileId(row, col);

                for (var i = 0; i < this.models.length; i++) {
                    if (id === this.models[i].id) {
                        this.remove(this.models[i]);
                        break;
                    }
                }
            },

            /*
            * Returns the count of a tile with the image whose index is received in this function
            * @method getTileCount
            * @param {Array} [index] Imageindex of the tile
            */
            getTileCount: function (index/*image*/) {
                var tiles = this.where({ imageIndex: index/*fillTypeURL: image*/ });
                //console.log(tile)
                return tiles.length;
            }
        })
    });

})();