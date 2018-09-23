(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Responsible for breaking tiles when a base tile is double clicked
    * @class BreakBaseCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */

    namespace.BreakBaseCommand = namespace.BaseCommand.extend({

        defaults: {

            /**
            * Stores the source properties
            *
            * @attribute source
            * @type MathInteractives.Common.Interactivities.ExponentAccordion.EquationManager.Models.CommandFactory.TileLocation
            * @default null
            **/
            source: null,

        },

        sourcePos: null,

        /**
		* Stores the the number of new tiles created
		*
		* @attribute numOfTiles
		* @type Number
		* @default null
		**/

        numOfTiles: null,

        /**
		* Stores reference of deleted tile
		*
		* @attribute deletedTile
		* @type Object
		* @default null
		**/
        deletedTile: null,

        /**
        * Initialises EXPONENT BreakBaseCommand model
        *
        * @method initialize
        **/
        initialize: function () {
        },

        /**
        * Initialize the model instance attrs with the passed data
        *
        * @method _initializeModelAttributes
        * @chainable
        * @private
        */
        _initializeModelAttributes: function _initializeModelAttributes(data) {
            this.set('source', data.source);
        },

        /**
        * Executes the Break BASE Command
        *
        * @method execute
        * @param {Object} consisting the allowed operation and prime limit
        * @param {Object} the model on which the operation is being performed
        * @param {Object} the data required to perform the break base cmd
        **/
        execute: function (rules, modelRef, data) {
            this._initializeModelAttributes(data);
            var baseClass = namespace.EquationComponent.Operations,
                commandFactoryClass = MathInteractives.Common.Components.Models.EquationManager.CommandFactory,
				source = this.get('source'),
				sourceIndex = source.index,
                givenOperation = rules.allowedOperation,
                flag = true,
                sourceParentTiles, refTile;

            //sourceIndexArray = sourceIndex.split('.');
            //this.sourcePos = parseInt(sourceIndexArray.splice(sourceIndexArray.length-1, 1), 10);
            //sourceParentTiles = modelRef.getItemFromIndex(sourceIndexArray.join('.')).get('tileArray');

            this.sourcePos = parseInt(this.getSourceWrtParent(sourceIndex));
            sourceParentTiles = this.getParentTiles(modelRef, sourceIndex);

            refTile = sourceParentTiles.at(this.sourcePos);
            if (refTile.get('type') !== namespace.TileItem.SolveTileType.BASE_EXPONENT) {
                return false;
            }
            this.deletedTile = refTile;

            if ((givenOperation & baseClass.BREAK_BASE_EXP_ANY) === baseClass.BREAK_BASE_EXP_ANY) {
                flag = false;
            }

            if ((givenOperation & baseClass.BREAK_BASE_EXP_1) === baseClass.BREAK_BASE_EXP_1) {
                if(flag === false || refTile.get('exponent') === 1) {
                    if(this._separateNegativePrimeNumber(sourceParentTiles, refTile)) {
                        return commandFactoryClass.EXIT_CODE.SUCCESS;
                    }
                }
            }

            if(flag === true) {
                return commandFactoryClass.EXIT_CODE.FAILURE;
            }

            if(this._modifyParentArray(sourceParentTiles, refTile)) {
                return commandFactoryClass.EXIT_CODE.SUCCESS;
            }
            return commandFactoryClass.EXIT_CODE.FAILURE;
        },

        /**
        * Modeifies the parent Collection of the model by breaking the base along with splitting the negative exp out
        *
        * @method _separateNegativePrimeNumber
        * @private
        * @param {Object} Parent tile of refTile
        * @param {Object} Tile that was clicked
        */
        _separateNegativePrimeNumber: function _separateNegativePrimeNumber (sourceParentTiles, refTile) {
            var base = refTile.get('base'),
                mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils,
                primeFactors = [],
                concernedTiles = [],
                length = null,
                index=  0;

            if(Math.abs(base) !== 1 && mathUtilClass.isPrime(base) && base/Math.abs(base) === -1) {
                primeFactors.push(-1, Math.abs(base));
                this.numOfTiles = primeFactors.length;
                sourceParentTiles.remove(refTile);
                for (index = 0, length = primeFactors.length; index < length; index++) {
                    concernedTiles[index] = refTile.deepClone();
                    concernedTiles[index].set('base', primeFactors[index]);
                    concernedTiles[index].set('isAnimate', true);
                    if (index != 0) {
                        concernedTiles[index].set('operator', '*')
                    }
                    sourceParentTiles.add(concernedTiles[index], { at: this.sourcePos + index });
                }
                return true;
            }
            else {
                return false;
            }
        },

        /**
        * Modeifies the parent Collection of the model
        *
        * @method _modifyParentArray
        * @private
        * @param {Object} Parent tile of refTile
        * @param {Object} Tile that was clicked
        */
        _modifyParentArray: function _modifyParentArray(sourceParentTiles, refTile) {
            var primeFactors = [],
				concernedTiles = [],
				mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils,
                index, length;

            primeFactors = mathUtilClass.getGreatestMultiple(refTile.get('base'));
            if (primeFactors.length === 0) {
                return false;
            }
            this.numOfTiles = primeFactors.length;
            sourceParentTiles.remove(refTile);
            for (index = 0, length = primeFactors.length; index < length; index++) {
                concernedTiles[index] = refTile.deepClone();
                concernedTiles[index].set('base', primeFactors[index]);
                concernedTiles[index].set('isAnimate', true);
                if (index != 0) {
                    concernedTiles[index].set('operator', '*');
                }
                sourceParentTiles.add(concernedTiles[index], { at: this.sourcePos + index });
            }
            return true;
        },


        /**
        * Undos the RepositionCommand
        *
        * @method undo
        * @param {Object} the model from which the command has to be indone
        **/
        undo: function (modelRef) {
            var baseClass = namespace.EquationComponent.Operations,
				mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils,
				source = this.get('source'),
				sourceIndex = source.index,
                numOfTiles = this.numOfTiles,
				concernedTiles = [],
				base = 1,
                sourceParentTiles, allowed, refTile, index;

            sourceParentTiles = this.getParentTiles(modelRef, sourceIndex);

            for (index = 0; index < numOfTiles; index++) {
                concernedTiles[index] = sourceParentTiles.at(this.sourcePos + index);
                base *= concernedTiles[index].get('base');
            }

            refTile = concernedTiles[0].deepClone();
            refTile.set('base', base);
            sourceParentTiles.remove(concernedTiles);
            sourceParentTiles.add(this.deletedTile, { at: this.sourcePos });
        }
    });
})();
