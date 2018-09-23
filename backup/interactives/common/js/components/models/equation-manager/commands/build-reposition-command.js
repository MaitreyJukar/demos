(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Build Reposition command is responsible for the repositioning of the tiles in build mode
    * @class BuildRepositionCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */

    namespace.BuildRepositionCommand = namespace.BaseCommand.extend({

        defaults: {},

        /**
        * Source TileLocation object
        * @attribute source
        * @type Object
        * @default null
        **/
        source: null,

        /**
        * Destination TileLocation object
        * @attribute dest
        * @type Object
        * @default null
        **/
        dest: null,

        /**
        * Operator of the added tile
        * @attribute operator
        * @type String
        * @default null
        **/
        operator: null,

        /**
        * Num of tiles selected in marquee
        * @attribute numOfTiles
        * @type Number
        * @default null
        **/
        numOfTiles: null,

        /**
        * Boolean whether tile is dropped on the left of a tile.
        * @attribute isLeft
        * @type Boolean
        * @default null
        **/
        isLeft: null,

        /**
        * Reference of the main equation component model
        * @attribute modelRef
        * @type Object
        * @default null
        **/
        modelRef: null,

        /**
        * Position of source tile with respect to it's parent
        * @attribute sourcePos
        * @type Number
        * @default null
        **/
        sourcePos: null,

        /**
        * Position of destination tile with respect to it's parent
        * @attribute destPos
        * @type Number
        * @default null
        **/
        destPos: null,

        /**
        * Stores the location (bDenominator) of the source. Useful when undo.
        * @attribute sourceInDenominator
        * @type Boolean
        * @default null
        **/
        sourceInDenominator: null,

        /**
        * Initialises RepositionCommand Model
        *
        * @method initialize
        **/
        initialize: function () {
        },

        /**
        * Initialize the instance attrs with the passed data
        *
        * @method _initializeInstanceAttributes
        * @chainable
        * @private
        */
        _initializeInstanceAttributes: function (data) {
            this.source = data.source;
            this.dest = data.dest;
            this.operator = data.operator;
            this.numOfTiles = data.source.numOfTiles || 1;
            this.isLeft = data.isLeft;
        },

        /**
        * Executes the RepositionCommand
        *
        * @method execute
        * @param {Object} consisting the allowed operation and prime limit
        * @param {Object} the model on which the operation is being performed
        * @param {Object} the data required to perform the reposition cmd
        **/
        execute: function (rules, modelRef, data) {
            this._initializeInstanceAttributes(data);
            this.modelRef = modelRef;

            var sourceIndexStr = this.source.index,
                destIndexStr = this.dest.index,
                sourceTile = modelRef.getItemFromIndex(sourceIndexStr),
                destTile = modelRef.getItemFromIndex(destIndexStr),
                sourceLoc = sourceTile.get('bDenominator'),
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE,
                destLoc = destTile.get('bDenominator'),
                sourceParent = modelRef.getItemFromIndex(this.getParentIndex(sourceIndexStr)),
                destParent = modelRef.getItemFromIndex(this.getParentIndex(destIndexStr));

            // cache this for later use
            this.sourcePos = parseInt(this.getSourceWrtParent(sourceIndexStr), 10);
            this.destPos = parseInt(this.getSourceWrtParent(destIndexStr), 10);
            this.sourceParent = sourceParent;
            this.destParent = destParent;

            if (sourceParent === destParent) { //check for same parent
                // if reposition from left to right decrement the final destPos by numOfTiles
                if (this.sourcePos < this.destPos) {
                    this.destPos -= this.numOfTiles;
                }
            }
            if (!this.isLeft) { this.destPos++; }

            // don't do anything if tile moved at it's own place
            if (sourceParent === destParent && this.destPos === this.sourcePos && sourceLoc === destLoc) {
                return EXIT_CODE.FAILURE;
            }

            return this._executeReposition(sourceParent, destParent, modelRef);
        },

        /**
        * Undos the RepositionCommand
        *
        * @method undo
        * @param {Object} the model from which the command has to be indone
        **/
        undo: function (modelRef) {
            var sourceParent = this.sourceParent,
                destParent = this.destParent,
                sourceParentTiles = sourceParent.get('tileArray'),
                destParentTiles = destParent.get('tileArray'),
                concernedTiles = this.movedTiles,
                sourceInDenominator = this.sourceInDenominator,
                i = 0;

            if (this.removedEmptyTile) {
                destParent.add(this.removedEmptyTile, { at: this.removedEmptyTilePos });
            }

            destParentTiles.remove(concernedTiles);

            for (i = 0; i < concernedTiles.length; i++) {
                concernedTiles[i].setBDenominator(sourceInDenominator);
                sourceParentTiles.add(concernedTiles[i], { at: this.sourcePos + i });
            }

            if (this.addedTile) {
                sourceParent.remove(this.addedTile);
            }

            

            this._handleUndoOperators();
        },

        /**
        * Internal method that actually performs reposition
        *
        * @method _executeReposition
        * @private
        * @param {Object} Parent of the tile present at source index
        * @param {Object} Parent of the tile present at dest index
        */
        _executeReposition: function (sourceParent, destParent, modelRef) {

            var sourceIndex = this.source.index,
                destIndex = this.dest.index,
                sourceTile = modelRef.getItemFromIndex(sourceIndex),
                destTile = modelRef.getItemFromIndex(destIndex),
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE,
                concernedTiles = [],
                TYPES = namespace.TileItem.SolveTileType,
                toDenominator = destTile.get('bDenominator'),
                retVal = null,
                i = 0;

            this.sourceInDenominator = sourceTile.get('bDenominator');

            concernedTiles = this._getConcernedTiles(sourceParent);      // Tiles that are repositioned


            if ((retVal = this._checkNestedParens(modelRef)) === true) {
                return EXIT_CODE.FAILURE;
            }

            if (modelRef.allOperatorsMultiplicative()) {
                // removing tiles
                sourceParent.remove(concernedTiles);
                this._updateNextTileOperator(sourceParent);

                // adding tiles
                for (i = 0; i < concernedTiles.length; i++) {
                    concernedTiles[i].setBDenominator(toDenominator);
                    destParent.add(concernedTiles[i], { at: this.destPos + i });
                }

                this._handleEmptyDenOrNum(sourceParent);
            }

            this.draggedFirstOperator = concernedTiles[0].get('operator');  // for undo
            if (!this.isLeft) {
                concernedTiles[0].set('operator', this.operator);
            } else {
                this.droppedOperator = destTile.get('operator');
                destTile.set('operator', this.operator);
                concernedTiles[0].set('operator', this.droppedOperator);
            }

            if (destTile && destTile.get('type') === TYPES.BASE_EXPONENT && destTile.isEmpty()) {
                this.removedEmptyTilePos = destParent.indexOf(destTile);
                destParent.remove(destTile);
                this.removedEmptyTile = destTile;
            }

            this.draggedFirst = concernedTiles[0];
            this.movedTiles = concernedTiles;
            this.droppedTile = destTile;
            return EXIT_CODE.SUCCESS;
        },

        /**
        * Handles the case of an empty numerator or denominator. It adds a null^null tile if 
        * an empty Numerator or Denominator is encountered
        *
        * @method _handleEmptyDenOrNum
        * @private
        * @param {Object} Source parent object
        */
        _handleEmptyDenOrNum: function (parent) {

            var tile = null,
                tiles = parent.get('tileArray');

            if (tiles.where({ 'bDenominator': false }).length === 0 &&
                parent.get('type') === modelClassNameSpace.TileItem.SolveTileType.FRACTION) {
                tile = new modelClassNameSpace.BaseExpTile();
                tile.set('base', null);
                tile.set('exponent', null);
                tile.setBDenominator(false);
                tiles.add(tile, { at: 0 });
            }

            // Check for empty denominator only if it's a fraction item
            if (tiles.where({ 'bDenominator': true }).length === 0 &&
                parent.get('type') === modelClassNameSpace.TileItem.SolveTileType.FRACTION) {
                tile = new modelClassNameSpace.BaseExpTile();
                tile.set('base', null);
                tile.set('exponent', null);
                tile.setBDenominator(true);
                tiles.add(tile);
            }

            if (tiles.where({ 'bDenominator': parent.get('bDenominator') }).length === 0) {
                tile = new modelClassNameSpace.BaseExpTile();
                tile.set('base', null);
                tile.set('exponent', null);
                tile.setBDenominator(this.sourceInDenominator);
                tiles.add(tile);
            }

            this.addedTile = tile;
        },

        /**
        * Returns the concerned tiles in question. The tiles that are dragged and are supposed 
        * to be repositioned are returned.
        *
        * @method _getConcernedTiles
        * @private
        * @param {Object} Parent tile of the repositioned tiles
        * @return {Array} Tiles that are dragged and are supposed to be repositioned are returned.
        */
        _getConcernedTiles: function (parent) {
            var sourceParentTiles = parent.get('tileArray'),
                concernedTiles = [],
                i;
            for (i = 0; i < this.numOfTiles; i++) {
                concernedTiles[i] = sourceParentTiles.at(this.sourcePos + i);
            }
            return concernedTiles;
        },
        
        /**
        * Set the operator of the first tile in parent to 'null'
        * @method _setFirstTileOperator
        * @private
        * @param {Object} Parent of the tile whose operator should be set to null
        */
        _setFirstTileOperator: function (parent) {
            var firstNum = parent.at(0),
                denominatorTiles = parent.where({ bDenominator: true });
            firstNum.set('operator', null);
            if (denominatorTiles.length > 0) {
                denominatorTiles[0].set('operator', null);
            }
        },

        /**
        * Undo the operators and restore the operators to what they originally were.
        * @method _handleUndoOperators
        * @private
        */
        _handleUndoOperators: function () {
            if (this.sourceNextOperator !== undefined) { this.sourceNextTile.set('operator', this.sourceNextOperator); }
            if (this.draggedFirstOperator !== undefined) { this.draggedFirst.set('operator', this.draggedFirstOperator); }
            if (this.droppedOperator !== undefined) { this.droppedTile.set('operator', this.droppedOperator); }
        },
        
        /**
        * Update the operator of the next tile to null if it's the first tile.
        * @method _updateNextTileOperator
        * @private
        * @param {Object} Parent of the sourceTile
        */
        _updateNextTileOperator: function (parent) {
            var sourceNextTile = parent.at(parseInt(this.getSourceWrtParent(this.source.index), 10));
            if (sourceNextTile && parent.isFirstChild(sourceNextTile) /*parent.indexOf(sourceNextTile) === 0*/) {
                    this.sourceNextOperator = sourceNextTile.get('operator');
                    sourceNextTile.set('operator', null);
            }
            
            // required for undo
            this.sourceNextTile = sourceNextTile;
        },

        /**
        * Check if the reposition results in nested parentheses
        * @method _checkNestedParens
        * @private
        * @param {Object} Equation model
        * @return {Object} Boolean whether the reposition will result in nested parentheses.
        */
        _checkNestedParens: function (modelRef) {
            var sourceIndex = this.source.index,
                destIndex = this.dest.index,
                sourceTile = modelRef.getItemFromIndex(sourceIndex),
                sourceParent = modelRef.getItemFromIndex(this.getParentIndex(sourceIndex)),
                destParent = modelRef.getItemFromIndex(this.getParentIndex(destIndex)),
                TYPES = namespace.TileItem.SolveTileType;

            return sourceTile.get('type') === TYPES.PARENTHESIS && sourceParent !== destParent;
        }
    });
})();