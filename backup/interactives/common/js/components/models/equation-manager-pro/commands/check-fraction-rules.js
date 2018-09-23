(function (MathInteractives) {
    'use strict';

    var modelNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro,
        utilityMethods = modelNameSpace.EquationManagerPro.Utils;

    /**
    * Responsible for breaking tiles when a base tile is double clicked
    * @class BreakBaseCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */

    modelNameSpace.CheckFractionRules = modelNameSpace.BaseCommand.extend({

        /**
		* Stores the number of new tiles created
		*
		* @attribute numOfTilesAdded
		* @type Number
		* @default null
		**/
        numOfTilesAdded: 0,

        /**
		* Stores the fraction which was deleted.
		*
		* @attribute deletedTiles
		* @type Object
		* @default null
		**/
        deletedTile: null,

        /**
		* Stores the position/index of the parentheses.
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
		* Whether this is user performed command of a system generated one. Uswd for the undo.
		*
		* @attribute isDummyCommand
		* @type Boolean
		* @default true
		**/
        isDummyCommand: true,

        /**
        * Initialises CheckFractionRules model
        *
        * @method initialize
        **/
        initialize: function () {

        },

        /**
         * executes the check of the fraction
         * @method execute
         * @public
         *
         * @param   {Object}  rules    the object specifying whether the breaking of base is possible or not.
         * @param   {Object}  modelRef The equation model.
         * @param   {Object}  data     The object storring the source tile, dest tile and tree root information.
         * @returns {Boolean} Whether the operation is successful or not.
         */
        execute: function (rules, modelRef, data) {
            var sourceIndex = data.source.index,
                sourceParent, sourceParentTiles, refTile;

            this.sourceIndex = sourceIndex;
            this.sourcePos = parseInt(utilityMethods.getSourceWrtParent(sourceIndex));
            this.fractionToDecimalAllowed = rules.fractionToDecimalAllowed;
            sourceParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(sourceIndex));
            sourceParentTiles = sourceParent.get('tileArray');

            refTile = sourceParentTiles.at(this.sourcePos);
            this.deletedTile = refTile;

            if (refTile.get('type') !== modelNameSpace.TileItem.TileType.FRACTION) {
                return false;
            }

            return this._validateFraction(refTile, sourceParentTiles, sourceParent, modelRef);
        },

        /**
         * validate parentheses, as in whether it will continue to exist or not.
         * @method _validateFraction
         * @private
         *
         * @param   {Object}  fraction          The parentheses tile which has to be validated.
         * @param   {Object}  sourceParentTiles The parent collection.
         * @returns {Boolean} Will return false, if the the parent collection is not modified, and vica-versa.
         */
        _validateFraction: function _validateFraction(fraction, sourceParentTiles, sourceParent, modelRef) {
            var clonedFraction = fraction.deepClone(),
                fracTiles = clonedFraction.get('tileArray'),
                numLength = fraction.getNumeratorLength(),
                termTile, tilesToAdd, index,
                firstTerm, cloned;

            if (fraction.getDenominatorLength() === 0) {
                tilesToAdd = fracTiles.models;
                sourceParentTiles.remove(fraction);
                for (index = 0; index < tilesToAdd.length; index++) {
                    if (index === 0) {
                        tilesToAdd[index].set('operator', fraction.get('operator'));
                    }
                    sourceParentTiles.add(tilesToAdd[index], { at: this.sourcePos + index });
                }
                this.numOfTilesAdded = index;
                if (this.numOfTilesAdded === 1 && sourceParent.get('type') === modelNameSpace.TileItem.TileType.EXPRESSION && sourceParentTiles.length === 1 && utilityMethods.isBasicTileType(sourceParentTiles.at(0)) && sourceParentTiles.at(0).get('base') === 0) {
                    cloned = sourceParentTiles.at(0).deepClone();
                    cloned.set({
                        isDraggable: false,
                        isDroppable: false
                    });
                    sourceParentTiles.remove(sourceParentTiles.at(0));
                    sourceParentTiles.add(cloned);
                }
                if (this.fractionToDecimalAllowed) {
                    this._setTilesForEndResult(modelRef, true);
                }
                return true;
            }
            else if (numLength === 0) {
                termTile = this._addTermTile(1, false, fraction.get('isLHS'), null, true);
                fracTiles.add(termTile, { at: 0 });
                sourceParentTiles.remove(fraction);
                sourceParentTiles.add(clonedFraction, { at: this.sourcePos });
                this.numOfTilesAdded = 1;
                return true;
            }
                /*else if (numLength === 1) {
                    firstTerm = fracTiles.at(0);
                    if(firstTerm.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE && firstTerm.get('base') === 0) {
                        sourceParentTiles.remove(fraction);
                        cloned = firstTerm.deepClone();
                        cloned.set('operator', fraction.get('operator'));
                        sourceParentTiles.add(cloned, {at: this.sourcePos});
                        this.numOfTilesAdded = 1;
                        return true;
                    }
                    return false;
                }*/
            else {
                return false;
            }
        },


        _setTilesForEndResult: function _setTilesForEndResult(modelRef, setEndResult) {
            var lhsTiles, rhsTiles, lhsTile, rhsTile;
            if (modelRef) {
                lhsTiles = modelRef.get('tileArray').at(0).get('tileArray');
                rhsTiles = modelRef.get('tileArray').at(1).get('tileArray');

                if (lhsTiles.length === 1 && rhsTiles.length === 1) {
                    lhsTile = modelRef.get('tileArray').at(0).get('tileArray').at(0);
                    rhsTile = modelRef.get('tileArray').at(1).get('tileArray').at(0);

                    if ((lhsTile.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE && rhsTile.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE && lhsTile.get('base') !== 't' && rhsTile.get('base') === 't') ||
                       (lhsTile.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE && rhsTile.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE && lhsTile.get('base') === 't' && rhsTile.get('base') !== 't')) {
                        lhsTile.set('endResult', setEndResult);
                        rhsTile.set('endResult', setEndResult);
                    }
                }
            }
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
        _addTermTile: function _addTermTile(base, isDenominator, isLHS, operator, toRegister) {
            var createTileItem = modelNameSpace.TileItem.createTileItem,
                termTile;
            termTile = createTileItem({
                base: base,
                isDenominator: isDenominator,
                isLHS: isLHS,
                operator: operator,
                type: modelNameSpace.TileItem.TileType.TERM_TILE
            });
            if (toRegister === true) {
                this.addedTile = termTile;
            }
            return termTile;
        },

        /**
        * Undos the Break Base Command
        *
        * @method undo
        * @param {Object} modelRef The equation model.
        **/
        undo: function undo(modelRef) {
            var sourceIndex = this.sourceIndex,
                numOfTilesAdded = this.numOfTilesAdded,
                concernedTiles = [],
                sourceParentTiles, sourceParent, index, refTile, refTileArray;

            sourceParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(sourceIndex));
            sourceParentTiles = sourceParent.get('tileArray');
            if (this.fractionToDecimalAllowed) {
                this._setTilesForEndResult(modelRef, false);
            }
            if (this.deletedTile) {
                for (index = 0; index < numOfTilesAdded; index++) {
                    concernedTiles[index] = sourceParentTiles.at(this.sourcePos + index);
                }
                sourceParentTiles.remove(concernedTiles);
                sourceParentTiles.add(this.deletedTile, { at: this.sourcePos });
            }
            else {
                refTile = sourceParentTiles.at(this.sourcePos);
                refTileArray = refTile.get('tileArray');
                refTileArray.remove(refTileArray.at(0));
            }
        }

    }, {

    });
})(window.MathInteractives);
