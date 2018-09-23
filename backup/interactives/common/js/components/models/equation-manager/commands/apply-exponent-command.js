(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * When called on a PARENTHESES tile item, it applies the exponent to the inner items.
    * @class ApplyExponentCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */
    namespace.ApplyExponentCommand = namespace.BaseCommand.extend({

        /**
        * Defaults values for the model attributes
        *
        * @attribute defaults
        * @type Object
        * @default {}
        **/
        defaults: {

        },

        /**
        * Source TileLocation object
        * @attribute source
        * @type Object
        * @default null
        **/
        source: null,

        /**
        * Index of the source w.r.t parent
        * @attribute sourceWrtParent
        * @type Number
        * @default null
        **/
        sourceWrtParent: null,

        /**
        * EXPONENT of the added tile
        * @attribute exponent
        * @type Number
        * @default null
        **/
        exponent: null,

        /**
        * Type of the added tile
        * @attribute type
        * @type Number
        * @default null
        **/
        type: null,

        /**
        * Reference to the main model
        * @attribute modelRef
        * @type Object
        * @default null
        **/
        modelRef: null,

        /**
        * PARENTHESES that is removed while applying the exponent.
        *
        * @attribute oldTile
        * @type Object
        * @default null
        **/
        oldTile: null,

        /**
        * FRACTION tile that in inside a parentheses. It's required when undo since the same fraction tile
        * needs to be removed and the old oldTile is to be inserted.
        *
        * @attribute fractionTile
        * @type Object
        * @default null
        **/
        fractionTile: null,

        /**
        * TIles inside a prentheses tile whose exponents are multiplied.
        *
        * @attribute innerTiles
        * @type Object
        * @default []
        **/
        innerTiles: [],

        /**
        * Initializes the Break exponent command
        *
        * @method initialize
        */
        initialize: function () {
        },

        /**
        * Initialize the model instance attrs with the passed data
        *
        * @method _initializeInstanceAttributes
        * @chainable
        * @private
        */
        _initializeInstanceAttributes: function (data) {
            // save these for later. will be needed when undo
            this.source = data.source;
            this.sourceWrtParent = parseInt(this.getSourceWrtParent(this.source.index), 10);
            return this;
        },

        /**
        * Executes the break exponent command
        *
        * @method execute
        */
        execute: function (rules, modelRef, data) {
            this.modelRef = modelRef;

            // store data in model instance attrs
            this._initializeInstanceAttributes(data);

            var index = this.source.index,
                tileItemTypes = modelClassNameSpace.TileItem.SolveTileType,
                tile = modelRef.getItemFromIndex(index),
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE,
                parent = modelRef.getItemFromIndex(this.getParentIndex(index)),
                retClass = namespace.ApplyExponentCommand.RETURN_VAL;

            this.exponent = tile.get('exponent');
            this.type = tile.at(0).get('type');          // type of first inner child

            switch (this.type) {
                case tileItemTypes.FRACTION:
                    // this is the case when there is a fraction inside a parentheses
                    if (this._executeFractionInParens(tile, parent) === retClass.TILE_VALUE_EXCEEDING_COMBINE) {
                        return EXIT_CODE.TILE_VALUE_EXCEEDING_COMBINE;
                    }
                    break;
                default:
                    if (this._executeTilesInParens(tile, parent) === retClass.TILE_VALUE_EXCEEDING_COMBINE) {
                        return EXIT_CODE.TILE_VALUE_EXCEEDING_COMBINE;
                    }
            };

            return EXIT_CODE.SUCCESS;
        },

        /**
        * Undoes the command according to the data passed
        *
        * @method undo
        */
        undo: function (modelRef) {
            var tileItemTypes = modelClassNameSpace.TileItem.SolveTileType,
                parent = modelRef.getItemFromIndex(this.getParentIndex(this.source.index));

            switch (this.type) {
                case tileItemTypes.FRACTION:
                    // this is the case when there is a fraction inside a parentheses
                    this._undoFractionInParens(parent);
                    break;
                default:
                    this._undoTilesInParens(parent);
            };
        },

        /**
        * Execute method when there is a fraction inside a parentheses
        * @method
        * @private
        * @param {Object} PARENTHESES tile whose exponent is clicked
        * @param {Object} Parent of clicked parentheses tile
        */
        _executeFractionInParens: function (tile, parent) {
            var retClass = namespace.ApplyExponentCommand.RETURN_VAL;


            this.fractionTile = tile.at(0);  // assuming there's only a single child inside the parentheses and it's a fraction
            this.oneIndices = this.fractionTile.multiplyChildExponentsBy(this.exponent);

            if (this.oneIndices === false) {
                return retClass.TILE_VALUE_EXCEEDING_COMBINE;
            }
            parent.remove(tile);
            this.oldTile = tile;

            parent.add(this.fractionTile, { at: this.sourceWrtParent });

            return retClass.SUCCESS;
        },

        /**
        * Execute method when there are parentheses tiles or base-exp tiles inside a parentheses
        * @method _executeTilesInParens
        * @private
        * @param {Object} PARENTHESES tile whose exponent is clicked
        * @param {Object} Parent of clicked parentheses tile
        */
        _executeTilesInParens: function (tile, parent) {
            var index = parent.indexOf(tile),
                retClass = namespace.ApplyExponentCommand.RETURN_VAL;

            this.oneIndices = tile.multiplyChildExponentsBy(this.exponent);

            if (this.oneIndices === false) {
                return retClass.TILE_VALUE_EXCEEDING_COMBINE;
            }
            this.innerTiles = tile.get('tileArray').models;
            this.oldOperator = this.innerTiles[0].get('operator');
            this.oldTile = tile;
            parent.remove(tile);
            this.innerTiles[0].set('operator', tile.get('operator'));
            parent.addMultiple(this.innerTiles, index);

            return retClass.SUCCESS;
        },

        /**
        * Undo method when there is a fraction inside a parentheses
        * @method _undoFractionInParens
        * @private
        * @param {Object} Parent of clicked parentheses tile
        */
        _undoFractionInParens: function (parent) {
            parent.remove(this.fractionTile);
            parent.add(this.oldTile, { at: this.sourceWrtParent });
            this.fractionTile.divideChildExponentsBy(1 / this.exponent, this.oneIndices);
        },

        /**
        * Undo method when there are parentheses tiles or base-exp tiles inside a parentheses
        * @method _undoTilesInParens
        * @private
        * @param {Object} Parent of clicked parentheses tile
        */
        _undoTilesInParens: function (parent) {
            parent.remove(this.innerTiles);
            this.innerTiles[0].set('operator', this.oldOperator);
            parent.add(this.oldTile, { at: this.sourceWrtParent });
            this.oldTile.divideChildExponentsBy(1 / this.exponent, this.oneIndices);
        }
    },
    {
        RETURN_VAL: {
            TILE_VALUE_EXCEEDING_COMBINE: 0,
            SUCCESS: 1
        }
    });

})();
