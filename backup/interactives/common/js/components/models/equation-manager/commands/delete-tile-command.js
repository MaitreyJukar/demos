(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Deletes an existing tile from the workspace
    * @class DeleteTileCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */
    namespace.DeleteTileCommand = namespace.BaseCommand.extend({

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
        * Initializes the Break exponent command
        *
        * @method initialize
        */
        initialize: function () {
        },

        oldOperators: [],

        /**
        * Initialize the model instance attrs with the passed data
        *
        * @method _initializeInstanceAttributes
        * @chainable
        * @private
        */
        _initializeInstanceAttributes: function (data) {
            // save these for later. will be needed when undo
            this.type = data.type;
            this.source = data.source;
            this.sourceWrtParent = parseInt(this.getSourceWrtParent(data.source.index), 10),
            this.numOfTiles = this.source.numOfTiles;
            return this;
        },

        /**
        * Executes the break exponent command
        *
        * @method execute
        */
        execute: function (rules, modelRef, data) {

            // store data in model instance attrs
            this.modelRef = modelRef;
            this._initializeInstanceAttributes(data);
            this.oldOperators = [];
            var type = this.type,
                dispenserTypes = modelClassNameSpace.TileItem.BinTileType,
                tileItemTypes = modelClassNameSpace.TileItem.SolveTileType,
                index = this.source.index,
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE,
                EVENTS = modelClassNameSpace.CommandFactory.EVENTS,
                parent = modelRef.getItemFromIndex(this.getParentIndex(index)),
                
                tile = modelRef.getItemFromIndex(index);

            switch (this.type) {
                case dispenserTypes.BASE:
                    this._deleteBase(tile, parent);
                    break;
                case dispenserTypes.EXPONENT:
                    this._deleteExponent(tile, parent);
                    break;
                case dispenserTypes.PARENTHESIS:
                    this._deleteParentheses(tile, parent);
                    break;
                case dispenserTypes.BIG_PARENTHESIS:
                    this._deleteParentheses(tile, parent);
                    //modelRef.trigger(EVENTS.BIG_PARENTHESIS_REMOVED);
                    break;
                default:
                    // deletes entire tile/s
                    this._deleteTiles(parent, this.numOfTiles);
                    break;
            };

            this._setFirstTileOperator(parent);
            return EXIT_CODE.SUCCESS;
        },

        /**
        * Undoes the command according to the data passed
        *
        * @method undo
        */
        undo: function (modelRef) {
            var parent = modelRef.getItemFromIndex(this.getParentIndex(this.source.index)),
                EVENTS = modelClassNameSpace.CommandFactory.EVENTS,
                dispenserTypes = modelClassNameSpace.TileItem.BinTileType;

            switch (this.type) {
                case dispenserTypes.BASE:
                    this._undoDeleteBase(parent);
                    break;
                case dispenserTypes.EXPONENT:
                    this._undoDeleteExponent(parent);
                    break;
                case dispenserTypes.PARENTHESIS:
                    this._undoDeleteParentheses(parent);
                    break;
                case dispenserTypes.BIG_PARENTHESIS:
                    this._undoDeleteParentheses(parent);
                    modelRef.trigger(EVENTS.BIG_PARENTHESIS_ADDED);
                    break;
                default:
                    // deletes entire tile/s
                    this._undoDeleteTiles(parent);
                    break;
            };
            return true;
        },

        /**
        * Called when the entire tile is deleted
        * @method _deleteTile
        * @private
        * @param {Object} Parent of the tile to be deleted
        * @param {Number} Number of tiles to delete
        * @return {Object} Copy of ...
        */
        _deleteTiles: function (parent, numOfTiles) {
            var tiles = [],
                sourceWrtParent = this.sourceWrtParent,
                isDenominator = null,
                parentType = parent.get('type'),
                siblingTiles = [],
                TYPES = namespace.TileItem.BinTileType,
                operator = null,
                i = 0;
            for (i = 0; i < numOfTiles; i++) {
                //below it should be numOfTiles - 1
                tiles.push(parent.at(sourceWrtParent + i));
            }
            parent.remove(tiles);
            isDenominator = tiles[0].get('bDenominator');
            siblingTiles = parent.where({ bDenominator: isDenominator });

            if ((siblingTiles.length === 1 && parentType === TYPES.EQUATION_COMPONENT) ||
                (siblingTiles.length === 0 && parentType !== TYPES.EQUATION_COMPONENT)) {
                // reaches here if there are 0 tiles. so insert a null tile
                this.emptyTile1 = new modelClassNameSpace.BaseExpTile({
                    bDenominator: isDenominator
                });
                operator = parentType === TYPES.EQUATION_COMPONENT ? '*' : null;
                this.emptyTile1.set('operator', operator);
                parent.add(this.emptyTile1, { at: sourceWrtParent });
            } else if (siblingTiles.length === 0 && parentType === TYPES.EQUATION_COMPONENT) {
                // insert two null tiles
                this.emptyTile1 = new modelClassNameSpace.BaseExpTile({
                    bDenominator: isDenominator
                });
                parent.add(this.emptyTile1, { at: sourceWrtParent });

                this.emptyTile2 = new modelClassNameSpace.BaseExpTile({
                    bDenominator: isDenominator,
                    operator: '*'
                });
                parent.add(this.emptyTile2, { at: sourceWrtParent + 1 });
            } else {
                this.nextTile = parent.at(sourceWrtParent);
                if (this.nextTile) { this.nextOperator = this.nextTile.get('operator'); }
            }
            this.tiles = tiles;
        },

        /**
        * Called when only the base is deleted
        * @method _deleteBase
        * @private
        * @param {Object} Tile whose base is to be deleted
        * @param {Object} Parent of the tile to be deleted
        * @return {Object} Copy of ...
        */
        _deleteBase: function (tile, parent) {
            if (tile.get('exponent')) {
                this.base = tile.get('base');
                tile.set('base', null);
            } else if (this.isNotAlone(parent, tile)) {
                this.tile = tile;
                parent.remove(tile);
            } else {
                this.base = tile.get('base');
                tile.set('base', null);
            }
        },

        /**
        * Called when only the exponent is deleted
        * @method _deleteExponent
        * @private
        * @param {Object} Tile whose exponent is to be deleted
        * @param {Object} Parent of the tile to be deleted
        * @return {Object} Copy of ...
        */
        _deleteExponent: function (tile, parent) {
            if (tile.get('base') || tile.get('tileArray')) {
                this.exponent = tile.get('exponent');
                tile.set('exponent', null);
            } else if (this.isNotAlone(parent, tile)) {
                this.tile = tile;
                parent.remove(tile);
            } else {
                this.exponent = tile.get('exponent');
                tile.set('exponent', null);
            }
        },

        /**
        * Called when only the parentheses are deleted
        * @method _deleteParentheses
        * @private
        * @param {Object} Parentheses tile whose parentheses are deleted
        * @param {Object} Parent of the parentheses tile
        */
        _deleteParentheses: function (parenthesesTile, parent) {
            var tileArray = parenthesesTile.get('tileArray'),
                parenthesesIndex = parent.indexOf(parenthesesTile),
                innerTiles = null;
            if (tileArray) {
                innerTiles = tileArray.models;
                parent.remove(parenthesesTile);
                parent.addMultiple(innerTiles, parenthesesIndex);
                this.operator = parenthesesTile.get('operator');
                this.oldOperators.push([innerTiles[0], innerTiles[0].get('operator')]);
                innerTiles[0].set('operator', this.operator);
                this.tile = parenthesesTile;

                if (innerTiles[0].isEmpty() && this.isNotAlone(parent, innerTiles[0])) {
                    parent.remove(innerTiles[0]);
                    this.entireTileDeleted = true;
                }
            }
        },

        /**
        * Helper method when the base was deleted and it needs to be undone
        *
        * @method _undoDeleteBase
        * @private
        * @param {Object} Parent of the source tile
        */
        _undoDeleteBase: function (parent) {
            if (this.tile) {
                parent.add(this.tile, { at: this.sourceWrtParent });
                if (parent.isFirstChild(this.tile)) { parent.at(this.sourceWrtParent + 1).set('operator', this.operator) }
            } else {
                var tile = this.modelRef.getItemFromIndex(this.source.index);
                tile.set('base', this.base);
            }
        },

        /**
        * Helper method when the exponent was deleted and it needs to be undone
        * @method _undoDeleteExponent
        * @private
        * @param {Object} Parent of the source tile
        */
        _undoDeleteExponent: function (parent) {
            if (this.tile) {
                parent.add(this.tile, { at: this.sourceWrtParent });
                if (parent.isFirstChild(this.tile)) { parent.at(this.sourceWrtParent + 1).set('operator', this.operator) }
            } else {
                var tile = this.modelRef.getItemFromIndex(this.source.index);
                tile.set('exponent', this.exponent);
            }
        },

        /**
        * Handle undo of deletion of parentheses
        * @method _undoDeleteParentheses
        * @private
        * @param {Object} Parent of parentheses tile
        */
        _undoDeleteParentheses: function (parent) {
            var removedIndex = this.sourceWrtParent;
            if (!this.entireTileDeleted) {
                parent.remove(this.tile.get('tileArray').models);
            }
            parent.add(this.tile, { at: removedIndex });
            this._undoOldOperators();
        },

        /**
        * Helper method when one or more tiles were deleted and it needs to be undone
        * @method _undoDeleteTiles
        * @private
        * @param {Object} Parent of the source tile
        */
        _undoDeleteTiles: function (parent) {
            var i = 0;
            parent.addMultiple(this.tiles, this.sourceWrtParent);
            if (this.nextTile) { this.nextTile.set('operator', this.nextOperator); }
            if (this.emptyTile1) { parent.remove(this.emptyTile1); }
            if (this.emptyTile2) { parent.remove(this.emptyTile2); }
        },

        /**
        * Sets the operator of first tile in the numerator or denominator or the first
        * tile in the parentheses to null and save it to oldOperators
        * @method _setFirstTileOperator
        * @private
        * @param {Object} Parent of the tile that is deleted
        */
        _setFirstTileOperator: function (parent) {
            var firstNum = parent.at(0),
                oldOperators = this.oldOperators,
                firstOperator = firstNum.get('operator'),
                denominatorTiles = parent.where({ bDenominator: true });
            this.operator = firstOperator;
            oldOperators.push([firstNum, firstOperator]);
            firstNum.set('operator', null);
            if (denominatorTiles.length > 0) {
                if (!firstOperator) { this.operator = denominatorTiles[0].get('operator') };
                oldOperators.push([denominatorTiles[0], denominatorTiles[0].get('operator')]);
                denominatorTiles[0].set('operator', null)
            };
        },

        /**
        * Restores the old operators of all tiles whose operators were changed in 
        * execute. It simply stores a 2-d array `oldOperators` whose 0th elem is
        * the tile and the 1st elem is the operator.
        * @method _undoOldOperators
        * @private
        */
        _undoOldOperators: function () {
            var oldOperators = this.oldOperators,
                i = 0;
            for (i = 0; i < oldOperators.length; i++) {
                oldOperators[i][0].set('operator', oldOperators[i][1]);
            }
        }
    });

})();