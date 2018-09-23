(function (MathInteractives) {
    'use strict';

    var modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro,
        utilityMethods = modelClassNameSpace.EquationManagerPro.Utils;


    /**
    * Adds a new tile to the workspace
    * @class AddTile
    * @module EquationManagerPro
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    * @extends MathInteractives.Common.Components.Models.EquationManagerPro.BaseCommand
    * @type Object
    * @constructor
    */
    modelClassNameSpace.AddTile = modelClassNameSpace.BaseCommand.extend({

        /**
		* Stores the position/index of the target.
		*
		* @attribute sourceIndex
		* @type String
		* @default null
		**/
        sourceIndex: null,

        /**
		* Stores the relative position of the target tile wrt to its parent.
		*
		* @attribute sourcePos
		* @type Number
		* @default null
		**/
        sourcePos: null,

        /**
        * Tile added. Useful for undo.
        * @attribute addedTile
        * @type Object
        * @default null
        **/
        addedTile: null,

        /**
        * Tile added. Useful for undo.
        * @attribute parenthesesAdded
        * @type Object
        * @default null
        **/
        parenthesesAdded: null,

        /**
        * Tile added. Useful for undo.
        * @attribute fractionAdded
        * @type Object
        * @default null
        **/
        fractionAdded: null,

        /**
        * Will determine if an operator was inserted to the tile present at source index or not.
        * @attribute changeOperatorAtSP
        * @type Object
        * @default String
        **/
        changeOperatorAtSP: '',

        /**
        * Whether the static 0 was present and if it was whether it was removed
        * @attribute staticZeroRemoved
        * @type Object
        * @default Boolean
        **/
        staticZeroRemoved: false,
        /**
        * Whether this is user performed command of a system generated one. Uswd for the undo.
        *
        * @attribute isDummyCommand
        * @type Boolean
        * @default true
        **/
        isIgnoreUndo: false,

        /**
         * Initializes
         * @method initialize
         * @public
         *
         */
        initialize: function () {
        },


        /**
         * execute's the add tile command
         * @method execute
         * @public
         *
         * @param   {Object}  rules    The rules to be followed during the operation
         * @param   {Object}  modelRef The model of equation
         * @param   {Object}  data     The data given to perform the operaton.
         * @returns {Boolean} The success of the command.
         */
        execute: function (rules, modelRef, data) {
            var sourceIndex = data.source.index,
                sourceParent, sourceParentTiles;
            if (data.tileValue === null) {
                this.isIgnoreUndo = true;
                this.dummyTileValue = data.dummyTileValue;
            }
            this.sourceIndex = sourceIndex;
            this.sourcePos = parseInt(utilityMethods.getSourceWrtParent(sourceIndex));

            sourceParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(sourceIndex));
            sourceParentTiles = sourceParent.get('tileArray');

            this._makeNonDragZeroToDrag(sourceParent);
            if (data.parenthesesAdded) {
                this._addParenthesesToExpression(sourceParentTiles, data.isLHS);
            }
            if (data.fractionAdded) {
                return this._addFractionToExpression(sourceParentTiles, data.isLHS, data.tilesToAddInFraction, data.tileValue);
            }
            return this._addTileAtIndex(sourceParent, data.isLHS, data.isDenominator, data.tileValue, data.operation);
        },

        /**
         * adds the given tile tile at index provided
         * @method _addTileAtIndex
         * @private
         *
         * @param   {Object}        sourceParentTiles The parent tile collection
         * @param   {Boolean}       isLHS             Whether present in the lhs or rhs
         * @param   {Boolean}       isDenominator      Representing whetehr the tile is to be added in the denominator or not.
         * @param   {Number|String} tileValue         The base of the tile to be added
         * @param   {String}        operation         The operation to be performed, + or *.
         * @returns {Boolean}       returns true after successful completion of the operation.
         */
        _addTileAtIndex: function _addTileAtIndex (sourceParent, isLHS, isDenominator, tileValue, operation) {
            var sourceParentTiles = sourceParent.get('tileArray'),
                termTile = this._addTermTile(tileValue, isDenominator, isLHS, null, true),
                currentTile;

            currentTile = sourceParentTiles.at(this.sourcePos);
            if (currentTile && currentTile.get('isDenominator') === isDenominator) {
                this.changeOperatorAtSP = currentTile.get('operator');
                currentTile.set('operator', operation);
            }
            if(this.sourcePos !== 0 && isDenominator === false) {
                termTile.set('operator', operation);
            }
            sourceParentTiles.add(termTile, { at: this.sourcePos });
            return true;
        },

        /**
         * add fraction to expression
         * @method _addFractionToExpression
         * @private
         *
         * @param   {Object}        sourceParentTiles The parent tile collection
         * @param   {Boolean}       isLHS             Whether present in the lhs or rhs
         * @param   {Number}        tilesToAdd        The number of tile to be added in the fraction
         * @param   {Number|String} tileValue         The value of the tile to be added
         * @returns {Boolean}       returns true after successful completion of the operation.
         */
        _addFractionToExpression: function _addFractionToExpression(sourceParentTiles, isLHS, tilesToAdd, tileValue) {
            var createTileItem = modelClassNameSpace.TileItem.createTileItem,
                fractionTile, currentTile, fracTileArray,
                Operators = modelClassNameSpace.TileItem.OPERATORS,
                TileTypes = modelClassNameSpace.TileItem.TileType,
                index, tilesToRemove = [];

            fractionTile = createTileItem({
                type: modelClassNameSpace.TileItem.TileType.FRACTION,
                operator: null,
                isDenominator: false,
                isLHS: isLHS
            });
            fracTileArray = fractionTile.get('tileArray');
            if (tilesToAdd > 0) {
                for (index = this.sourcePos; index < tilesToAdd; index++) {
                    currentTile = sourceParentTiles.at(index);
                    //to remove all tiles from parent.
                    tilesToRemove.push(currentTile);
                    //add those tiles in the fraction
                    fracTileArray.add(currentTile);
                }
                sourceParentTiles.remove(tilesToRemove);
                //adding the new bin tile just dropped.
                fracTileArray.add(this._addTermTile(tileValue, true, isLHS, null, true));
            }
            else {
                //adding the one tile needed in the numerator.
                fracTileArray.add(this._addTermTile(1, false, isLHS, null, false));
                //adding the new bin tile just dropped.
                fracTileArray.add(this._addTermTile(tileValue, true, isLHS, null, false));
                if (sourceParentTiles.length === 2 && sourceParentTiles.at(0).get('type') === TileTypes.PARENTHESES &&
                    sourceParentTiles.at(1).get('type') === TileTypes.PARENTHESES &&
                    sourceParentTiles.at(1).get('operator') === Operators.MULTIPLICATION) {
                    sourceParentTiles.at(0).set('operator', Operators.MULTIPLICATION);
                }
            }

            //add fraction tile.
            sourceParentTiles.add(fractionTile, { at: this.sourcePos });
            this.fractionAdded = fractionTile;
            return true;
        },

        /**
         * add parentheses to expression when a new tile is added.
         * @method _addParenthesesToExpression
         * @private
         *
         * @param {Object}  modelRef The equations model.
         * @param {Boolean} isLHS    Whether the tile to be added is the lhs or rhs.
         */
        _addParenthesesToExpression: function _addParenthesesToExpression(sourceParentTiles, isLHS) {
            var createTileItem = modelClassNameSpace.TileItem.createTileItem,
                parenthesesTile, currentTile, parTileArr,
                index, tilesToRemove = [];

            parenthesesTile = createTileItem({
                type: modelClassNameSpace.TileItem.TileType.PARENTHESES,
                operator: '*', //whenever a parentheses is added, its always being multiplied.
                isDenominator: false,
                isLHS: isLHS
            });
            parTileArr = parenthesesTile.get('tileArray');
            for (index = 0; index < sourceParentTiles.length; index++) {
                currentTile = sourceParentTiles.at(index);
                //to remove all tiles from parent.
                tilesToRemove.push(currentTile);
                //add thode tiles in the parentheses
                parTileArr.add(currentTile);
            }
            sourceParentTiles.remove(tilesToRemove);
            //add parentheses tile.
            sourceParentTiles.add(parenthesesTile);
            this.parenthesesAdded = parenthesesTile;
        },

        /**
         * add term tile and returns it.
         * @method _addTermTile
         * @private
         *
         * @param   {Number|String} base         The base value of the tile to be added
         * @param   {Boolean}       isDenominator Representing whetehr the tile is to be added in the denominator or not.
         * @param   {Boolean}       isLHS        Whether present in the lhs or rhs
         * @param   {String}        operator     The operator to be assigned to the term tile.
         * @param   {Boolean}       toRegister   Whether to cache the term tile created or not.
         * @returns {Object}        The newly created term tile.
         */
        _addTermTile: function _addTermTile (base, isDenominator, isLHS, operator, toRegister) {
            var createTileItem = modelClassNameSpace.TileItem.createTileItem,
                termTile;
            termTile = createTileItem({
                base: base,
                isDenominator: isDenominator,
                isLHS: isLHS,
                operator: operator,
                type: modelClassNameSpace.TileItem.TileType.TERM_TILE,
                tileToReplace: base === null ? this.dummyTileValue : null
            });
            if (toRegister === true) {
                this.addedTile = termTile;
            }
            return termTile;
        },

        /**
         * Convert the non-draggable zeor tile to draggable
         * @method _makeNonDragZeroToDrag
         * @private
         *
         * @param {Object} sourceParent The parent model of the concerned tile.
         */
        _makeNonDragZeroToDrag: function _makeNonDragZeroToDrag (sourceParent) {
            var sourceParentTiles = sourceParent.get('tileArray'),
                TileType = modelClassNameSpace.TileItem.TileType,
                cloned;

            if(sourceParent.get('type') === TileType.EXPRESSION &&
               sourceParentTiles.length === 1 &&
               sourceParentTiles.at(0).get('type') === TileType.TERM_TILE &&
               sourceParentTiles.at(0).get('base') === 0) {
                cloned = sourceParentTiles.at(0).deepClone();
                cloned.set({
                    isDraggable: true,
                    isDroppable: true
                });
                sourceParentTiles.remove(sourceParentTiles.at(0));
                sourceParentTiles.add(cloned);
                this.staticZeroRemoved = true;
            }
        },

        /**
         * undo s the add tile tile commmand
         * @method undo
         * @public
         *
         * @param {Object} modelRef The equation model.
         */
        undo: function (modelRef) {
            var sourceParent, sourceParentTiles, tilesToAdd = [],
                Operators = modelClassNameSpace.TileItem.OPERATORS,
                TileTypes = modelClassNameSpace.TileItem.TileType,
                index, cloned;

            sourceParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(this.sourceIndex));
            sourceParentTiles = sourceParent.get('tileArray');

            if (this.fractionAdded) {
                if (this.addedTile) { //the added tile would be in the denominatior
                    tilesToAdd = this.fractionAdded.get('tileArray').where({ isDenominator : false });
                }
                //remove entire fraction
                sourceParentTiles.remove(this.fractionAdded);
                for(index=0; index<tilesToAdd.length; index++) {
                    sourceParentTiles.add(tilesToAdd[index], {at: index + this.sourcePos});
                }
                if (sourceParentTiles.length === 2 && sourceParentTiles.at(0).get('type') === TileTypes.PARENTHESES &&
                    sourceParentTiles.at(1).get('type') === TileTypes.PARENTHESES &&
                    sourceParentTiles.at(1).get('operator') === Operators.MULTIPLICATION) {
                    sourceParentTiles.at(0).set('operator', null);
                }
            }

            else if (this.addedTile) {
                //remove the added tile.
                sourceParentTiles.remove(sourceParentTiles.at(this.sourcePos));
                if (this.changeOperatorAtSP !== '') {
                    sourceParentTiles.at(this.sourcePos).set('operator', this.changeOperatorAtSP);
                }
            }
            if (this.parenthesesAdded) {
                tilesToAdd = this.parenthesesAdded.get('tileArray').models;
                sourceParentTiles.remove(this.parenthesesAdded);
                for (index = 0; index < tilesToAdd.length; index++) {
                    sourceParentTiles.add(tilesToAdd[index], { at: index + this.sourcePos });
                }
            }
            if(this.staticZeroRemoved) {
                cloned = sourceParentTiles.at(0).deepClone();
                cloned.set({
                    isDraggable: false,
                    isDroppable: false
                });
                sourceParentTiles.remove(sourceParentTiles.at(0));
                sourceParentTiles.add(cloned);
            }
        }
    });

})(window.MathInteractives);
