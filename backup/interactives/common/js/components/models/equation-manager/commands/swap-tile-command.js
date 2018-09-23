(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Replaces a tile in build mode.
    * @class SwapTileCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */
    namespace.SwapTileCommand = namespace.BaseCommand.extend({
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

        /**
        * Initialize the model instance attrs with the passed data
        *
        * @method _initializeInstanceAttributes
        * @chainable
        * @private
        */
        _initializeInstanceAttributes: function (data) {
            this.source = data.source;
            this.dest = data.dest;
            this.type = data.type;
        },

        /**
        * Executes the break exponent command
        *
        * @method execute
        */
        execute: function (rules, modelRef, data) {
            this._initializeInstanceAttributes(data);
            this._setAllowedExponents(rules);

            return this.swap(modelRef);
        },

        /**
        * Undos the last replace operation
        * @method undo
        */
        undo: function (modelRef) {
            var sourceIndex = this.source.index,
                destIndex = this.dest.index,
                type = this.type,
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE,
                sourceParent = modelRef.getItemFromIndex(this.getParentIndex(sourceIndex)),
                destTile = this.destTile,
                sourceWrtParent = parseInt(this.getSourceWrtParent(this.source.index), 10),
                dispenserTypes = modelClassNameSpace.TileItem.BinTileType;

            if (!this.removedTile) {
                this.swap(modelRef);
                return EXIT_CODE.SUCCESS;
            }

            switch (type) {
                case dispenserTypes.EXPONENT:
                    this._undoExponentSwap(sourceParent, destTile, sourceWrtParent);
                    break;
                case dispenserTypes.BASE:
                    this._undoBaseSwap(sourceParent, destTile, sourceWrtParent);
                    break;
            };
        },

        /**
        * Common function called by both execute and undo. 
        * All this does is Exchanges the src & the dest exponent or base
        * based on the type param
        *
        * @method 
        * @private
        * @param {String} msg A description of...
        * @return {Object} Copy of ...
        */
        swap: function (modelRef) {
            var sourceIndex = this.source.index,
                destIndex = this.dest.index,
                type = this.type,
                sourceTile = modelRef.getItemFromIndex(sourceIndex),
                sourceParent = modelRef.getItemFromIndex(this.getParentIndex(sourceIndex)),
                destTile = modelRef.getItemFromIndex(destIndex),
                dispenserTypes = modelClassNameSpace.TileItem.BinTileType,
                sourceBase = null,
                sourceExponent = null,
                destBase = null,
                destExponent = null;
            this.destTile = destTile;

            switch (type) {
                case dispenserTypes.EXPONENT:
                    return this._handleExponentSwap(sourceParent, sourceTile, destTile);
                    break;
                case dispenserTypes.BASE:
                    return this._handleBaseSwap(sourceParent, sourceTile, destTile);
                    break;
            };

        },

        /**
        * Called when two exponents are swapped
        *
        * @method _handleExponentSwap
        * @private
        * @param {Object} Parent of the source
        * @param {Object} Source Tile
        * @param {Object} Destination Tile
        */
        _handleExponentSwap: function (sourceParent, sourceTile, destTile) {
            var sourceExponent = sourceTile.get('exponent'),
                EXIT_CODE = MathInteractives.Common.Components.Models.EquationManager.CommandFactory.EXIT_CODE,
                destExponent = destTile.get('exponent');
            if ((destTile.get('type') === modelClassNameSpace.TileItem.SolveTileType.PARENTHESIS ||
                destTile.get('type') === modelClassNameSpace.TileItem.SolveTileType.BIG_PARENTHESIS) &&
                this.allowedExponents.indexOf(sourceExponent) === -1) { return EXIT_CODE.OUT_OF_RANGE_EXPONENT; }

            if ((sourceTile.get('type') === modelClassNameSpace.TileItem.SolveTileType.PARENTHESIS ||
                sourceTile.get('type') === modelClassNameSpace.TileItem.SolveTileType.BIG_PARENTHESIS)
                && this.allowedExponents.indexOf(destExponent) === -1) { return EXIT_CODE.OUT_OF_RANGE_EXPONENT; }

            if (destExponent === sourceExponent) {
                sourceTile.trigger('change:exponent', sourceTile, sourceExponent);
                return EXIT_CODE.NO_OPERATION;
            }
            sourceTile.set('exponent', destExponent);
            destTile.set('exponent', sourceExponent);
            this._handleEmptyTile(sourceParent, sourceTile);
            return EXIT_CODE.SUCCESS;
        },

        /**
        * Handle case when two bases are swapped
        * @method _handleBaseSwap
        * @private
        * @param {Object} Parent of source tile
        * @param {Object} Source tile
        * @param {Object} Dest tile
        * @return {Number} Exit code
        */
        _handleBaseSwap: function (sourceParent, sourceTile, destTile) {
            var sourceBase = sourceTile.get('base'),
                EXIT_CODE = MathInteractives.Common.Components.Models.EquationManager.CommandFactory.EXIT_CODE,
                destBase = destTile.get('base');
            if (destBase === sourceBase) {
                sourceTile.trigger('change:base', sourceTile, sourceBase);
                return EXIT_CODE.NO_OPERATION;
            }
            sourceTile.set('base', destBase);
            destTile.set('base', sourceBase);
            this._handleEmptyTile(sourceParent, sourceTile);
            return EXIT_CODE.SUCCESS;
        },

        /**
        * Handle case when Base Exp tile is empty and it's not alone and has siblings
        * @method _handleEmptyTile
        * @private
        * @param {Object} Parent of source tile
        * @param {Object} Source tile
        */
        _handleEmptyTile: function (sourceParent, sourceTile) {
            var nextTile = null,
                TYPES = modelClassNameSpace.TileItem.BinTileType;
            if (sourceTile.get('type') === TYPES.BASE_EXPONENT && sourceTile.isEmpty() && this.isNotAlone(sourceParent, sourceTile)) {
                this.removedTile = sourceTile;
                if (sourceParent.isFirstChild(sourceTile)) {
                    nextTile = sourceParent.nextTile(sourceTile);
                    if (nextTile.get('bDenominator') === sourceTile.get('bDenominator')) {
                        this.removedOperator = nextTile.get('operator');
                        nextTile.set('operator', null);
                        this.nextTile = nextTile;
                    }
                }
                sourceParent.remove(sourceTile);
            }
        },

        /**
        * Undo swap exponent 
        * @method _undoExponentSwap
        * @private
        * @param {Object} Parent of source tile
        * @param {Object} Destination tile
        * @param {Number} Index of source w.r.t parent
        */
        _undoExponentSwap: function (sourceParent, destTile, sourceWrtParent) {
            var destExp = destTile.get('exponent');
            destTile.set('exponent', null);
            if (this.removedTile) {
                sourceParent.add(this.removedTile, { at: sourceWrtParent });
                this.removedTile.set('exponent', destExp);
            }
            this._undoEmptyTile();

        },

        /**
        * Undo swap base 
        * @method _undoBaseSwap
        * @private
        * @param {Object} Parent of source tile
        * @param {Object} Destination tile
        * @param {Number} Index of source w.r.t parent
        */
        _undoBaseSwap: function (sourceParent, destTile, sourceWrtParent) {
            var destBase = destTile.get('base');
            destTile.set('base', null);
            if (this.removedTile) {
                sourceParent.add(this.removedTile, { at: sourceWrtParent });
                this.removedTile.set('base', destBase);
            }

            this._undoEmptyTile();
        },

        /**
        * Handle undo of the case when empty tile is deleted on swap.
        * @method _undoEmptyTile
        * @private
        */
        _undoEmptyTile: function () {
            if (this.removedOperator) {
                this.nextTile.set('operator', this.removedOperator);
            }
        },

        /**
        * Sets the allowed exponents for parens exponent based on Allowed operations.
        * @method _setAllowedExponents
        * @private
        * @param {Object} Rules for command. Containe allowedOperations
        */
        _setAllowedExponents: function (rules) {
            var OPERATION = modelClassNameSpace.EquationComponent.Operations;
            if ((rules.allowedOperation & OPERATION.PARENTHESIS_EXP_ALL) === 0) {
                this.allowedExponents = [1];
            } else {
                this.allowedExponents = [-3, -2, -1, 0, 1, 2, 3, null];
            }
        }

    });

})();