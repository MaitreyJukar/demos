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

    modelNameSpace.ParenthesesExpClick = modelNameSpace.BaseCommand.extend({

        /**
		* Stores the number of new tiles created
		*
		* @attribute numOfTilesAdded
		* @type Number
		* @default null
		**/
        numOfTilesAdded: 0,

        /**
		* Stores the parentheses which was deleted.
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
        * Initialises BreakBase model
        *
        * @method initialize
        **/
        initialize: function () {

        },

        /**
         * executes the check of the parentheses
         * @method execute
         * @public
         *
         * @param   {MathInteractives.Common.Components.Models.EquationManagerPro.CommandFactory.Rules} rules    the object specifying whether the breaking of base is possible or not.
         * @param   {Object}                                                                            modelRef The equation model.
         * @param   {Object}                                                                            data     The object storring the source tile, dest tile and tree root information.
         * @returns {Boolean}                                                                           Whether the operation is successful or not.
         */
        execute: function (rules, modelRef, data) {
            var sourceIndex = data.source.index,
                sourceParent, sourceParentTiles, refTile;

            this.sourceIndex = sourceIndex;
            this.sourcePos = parseInt(utilityMethods.getSourceWrtParent(sourceIndex));

            sourceParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(sourceIndex));
            sourceParentTiles = sourceParent.get('tileArray');

            refTile = sourceParentTiles.at(this.sourcePos);

            if(refTile.get('type') !== modelNameSpace.TileItem.TileType.PARENTHESES) {
                return false;
            }

            return this._duplicateParentheses(refTile, sourceParentTiles);
        },

        /**
         * duplicate parentheses bases on the exponent number
         * @method _duplicateParentheses
         * @private
         *
         * @param   {Object}  parentheses The parentheses tile model, whose expoenent has been clicked
         * @param   {Object}  parentTiles The parent tile collection.
         * @returns {Boolean} Will return true on successful completion of duplication the parentheses.
         */
        _duplicateParentheses: function _duplicateParentheses (parentheses, parentTiles) {
            var exponent = parentheses.get('exponent'),
                Operators = modelNameSpace.TileItem.OPERATORS,
                cloned, index;

            parentTiles.remove(parentheses);
            this.deletedTile = parentheses;

            for (index=0; index<exponent; index++) {
                cloned = parentheses.deepClone();
                cloned.set({
                    operator: Operators.MULTIPLICATION,
                    exponent: null,
                    isAnimate: true
                });
                if(index === 0) {
                    cloned.set('operator', parentheses.get('operator'));
                }
                parentTiles.add(cloned, {at: this.sourcePos + index});
            }
            this.numOfTilesAdded = index;
            return true;
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
                sourceParentTiles, index;

            sourceParentTiles = utilityMethods.getParentTiles(modelRef, sourceIndex);

            for (index = 0; index < numOfTilesAdded; index++) {
                concernedTiles[index] = sourceParentTiles.at(this.sourcePos + index);
            }

            sourceParentTiles.remove(concernedTiles);
            sourceParentTiles.add(this.deletedTile, { at: this.sourcePos });
        }

    }, {

    });
})(window.MathInteractives);
