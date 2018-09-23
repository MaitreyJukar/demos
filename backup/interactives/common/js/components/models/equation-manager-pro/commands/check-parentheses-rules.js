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

    modelNameSpace.CheckParenthesesRules = modelNameSpace.BaseCommand.extend({

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
		*
		*
		* @attribute isDummyCommand
		* @type Boolean
		* @default true
		**/
        isDummyCommand: true,

        /**
		* Will store the index in which terms are added
		*
		* @attribute isDummyCommand
		* @type Array
		* @default true
		**/
        extraTermsInserted: null,

        /**
        * Initialises CheckParenthesesRules model
        *
        * @method initialize
        **/
        initialize: function () {
            this.extraTermsInserted = [];
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

            return this._validateParentheses(refTile, data.root, sourceParentTiles);
        },

        /**
         * validate parentheses, as in whether it will continue to exist or not.
         * @method _validateParentheses
         * @private
         *
         * @param   {Object}  parentheses       The parentheses tile which has to be validated.
         * @param   {Object}  root              The tree root.
         * @param   {Object}  sourceParentTiles The parent collection.
         * @returns {Boolean} Will return false, if the the parent collection is not modified, and vica-versa.
         */
        _validateParentheses: function _validateParentheses (parentheses, root, sourceParentTiles) {
            var parNode = utilityMethods.tilesToNodes(root, [parentheses])[0];
            //if exp present, parentheses will stay.
            if(parentheses.get('exponent') !== null) {
                return false;
            }
            return this._checkParenthesesContents(parNode, sourceParentTiles);
        },

        /**
         * check parentheses contents
         * @method _checkParenthesesContents
         * @private
         *
         * @param   {Object}  parNode           The tree node conaining the parentheses
         * @param   {Object}  sourceParentTiles The collection of the source parent tiles.
         * @returns {Boolean} Whether the operation will be successull or not.
         */
        _checkParenthesesContents: function _checkParenthesesContents (parNode, sourceParentTiles) {
            //if there is no coeff present for a parentheses tile, no need to keep the parentheses.
            if (this._getParenthesesCoeff(parNode) === null || parNode.children[0] === null) {
                return this._removeParentheses(parNode.collectionData, sourceParentTiles);
            }

            //if 'x' term present, parenthese will saty.
            if(utilityMethods._hasVariableTermTile(parNode, utilityMethods._isVariableTermTile) && this._checkForMultipliedParentheses(parNode.collectionData)) {
                return false;
            }

            var mainChildNode = parNode.children[0],
                Operators = modelNameSpace.TileItem.OPERATORS;

            //if the direct child of parentheses ids leaf node, means thats the only child within parentheses, remove it.
            if(mainChildNode.isLeaf()) {
                return this._applyTermToCoefficient(parNode, mainChildNode, sourceParentTiles);
            }
            //if the direct child of the p[arentheses is '*', means there will not be any addition in it, so remove it.
            if(mainChildNode.data === Operators.MULTIPLICATION) {
                return this._applyMultiplicativeTermToCoefficient(parNode, sourceParentTiles);
            }

            // the case of fractions occurring within parentheses. Not happening.
            // eg: 3/4 * (4/5).
            if(mainChildNode.data === Operators.DIVISION && mainChildNode.contains([Operators.ADDITION]) === false) {
                return this._applyFractionToCoefficient(parNode, mainChildNode, sourceParentTiles);
            }
            return false;
        },

        /**
         * check for multiplied parentheses within parentheses
         * @method _checkForMultipliedParentheses
         * @private
         *
         * @param   {Object}  parTile The parebtheses tile.
         * @returns {Boolean} Whether such a tile is present or not.
         */
        _checkForMultipliedParentheses: function _checkForMultipliedParentheses (parTile) {
            var tileArray = parTile.get('tileArray'),
                index;

            for(index=0; index<tileArray.length; index++) {
                if(tileArray.at(index).get('type') !== modelNameSpace.TileItem.TileType.PARENTHESES) {
                    return true;
                }
            }
            return false;
        },

        /**
         * apply multiplicative term to coefficient.
         * eg: 4/3 * (2*33*4) = 4*2*33*4 / 3.
         * @method _applyMultiplicativeTermToCoefficient
         * @private
         *
         * @param   {Object}  parNode           The tree node conaining the parentheses
         * @param   {Object}  sourceParentTiles The collection of the source parent tiles.
         * @returns {Boolean} Whether the operation will be successull or not.
         */
        _applyMultiplicativeTermToCoefficient: function _applyMultiplicativeTermToCoefficient (parNode, sourceParentTiles) {
            var coeffNode = this._getParenthesesCoeff(parNode),
                Operators = modelNameSpace.TileItem.OPERATORS;

            if(coeffNode) {
                if(coeffNode.data === Operators.DIVISION && this._checkForMultipliedParentheses(parNode.collectionData)) {
                    return this._removeParenthesesCombineMulFraction(coeffNode.collectionData, parNode.collectionData, sourceParentTiles);
                }
            }
            return this._removeParentheses(parNode.collectionData, sourceParentTiles);
        },

        /**
         * apply term to coefficient.
         * eg: 3*(4) = 3*4, simlilar case for fractionos too.
         * @method _applyTermToCoefficient
         * @private
         *
         * @param   {Object}  parNode           The tree node conaining the parentheses
         * @param   {Object}  termNode          The term present within the parenthese
         * @param   {Object}  sourceParentTiles The collection of the source parent tiles.
         * @returns {Boolean} Whether the operation will be successull or not.
         */
        _applyTermToCoefficient: function _applyTermToCoefficient (parNode, termNode, sourceParentTiles) {
            var coeffNode = this._getParenthesesCoeff(parNode),
                Operators = modelNameSpace.TileItem.OPERATORS;

            if(coeffNode) {
                if(coeffNode.data === Operators.DIVISION) {
                    return this._removeParenthesesAndApplyFraction(coeffNode.collectionData, termNode.data, parNode.collectionData, sourceParentTiles);
                }
            }
            return this._removeParentheses(parNode.collectionData, sourceParentTiles);
        },

        _applyFractionToCoefficient: function _applyFractionToCoefficient (parNode, fracNode, sourceParentTiles) {
            var coeffNode = this._getParenthesesCoeff(parNode),
                Operators = modelNameSpace.TileItem.OPERATORS;

            if(coeffNode) {
                if(coeffNode.data === Operators.DIVISION) {
                    return this._removeParenthesesCombineFractions(coeffNode.collectionData, fracNode.collectionData, parNode.collectionData, sourceParentTiles);
                }
                else if (coeffNode.data instanceof modelNameSpace.TermTile) {
                    return this._removeParenthesesCombineTermFraction(parNode, fracNode, sourceParentTiles);
                }
            }
            //if a case arises in which there is a fraction inside the parentheses and a term tile outside. needs to be handled.
            return this._removeParentheses(parNode.collectionData, sourceParentTiles);
        },

        /**
         * Gets parentheses coeff
         * @method _getParenthesesCoeff
         * @private
         *
         * @param   {Object} parNode The parentheses node.
         * @returns {Object} The coefficient of the parentheses if any else would retrun null.
         */
        _getParenthesesCoeff: function _getParenthesesCoeff (parNode) {
            var Operators = modelNameSpace.TileItem.OPERATORS,
                parentNode = parNode.parent,
                parIndex;

            if(parentNode.data === Operators.MULTIPLICATION) {
                parIndex = parentNode.children.indexOf(parNode);
                if(parIndex !== 0) {
                    return parentNode.children[parIndex - 1];
                }
                if(parIndex !== parentNode.children.length - 1) {
                    return parentNode.children[parIndex + 1];
                }
            }
            return null;
        },

        /**
         * Removes parentheses from the parent collection.
         * @method _removeParentheses
         * @private
         *
         * @param   {Object}  parentheses The parenthese tile to remove.
         * @param   {Object}  parentTiles The parent collection.
         * @returns {Boolean} Returns true after the updation of parent tiles.
         */
        _removeParentheses: function _removeParentheses (parentheses, parentTiles) {
            var children = parentheses.get('tileArray'),
                Operators = modelNameSpace.TileItem.OPERATORS,
                index, cloned, operator;

            parentTiles.remove(parentheses);
            this.deletedTile = parentheses;

            if(parentheses.get('operator') === Operators.MULTIPLICATION) {
                if(utilityMethods.isBasicTileType(parentTiles.at(this.sourcePos - 1)) && _.isString(parentTiles.at(this.sourcePos - 1).get('base'))) {
                    operator = parentTiles.at(this.sourcePos - 1).get('operator');
                    parentTiles.at(this.sourcePos - 1).set('operator', Operators.MULTIPLICATION);
                    this.sourcePos -= 1;
                    this.tileAddedInMiddle = true;
                }
            }
            for(index=0; index<children.length; index++) {
                cloned = children.at(index).deepClone();
                if(index === 0) {
                    cloned.set('operator', typeof operator === 'undefined' ? parentheses.get('operator')  : operator);
                }
                parentTiles.add(cloned, {at: this.sourcePos + index});
            }
            this.numOfTilesAdded = index;
            return true;
        },

        /**
         * Removes parentheses and applies the contents of the parentheses to fraction
         * @method _removeParenthesesAndApplyFraction
         * @private
         *
         * @param   {Object}  fraction    The fraction term which is the coeffcient.
         * @param   {Object}  term        The term which is present within the parentheses
         * @param   {Object}  parentheses The parentheses model.
         * @param   {Object}  parentTiles The parent tiles.
         * @returns {Boolean} Whether the operation was successful or not.
         */
        _removeParenthesesAndApplyFraction: function _removeParenthesesAndApplyFraction (fraction, term, parentheses, parentTiles) {
            var fractionTiles = fraction.get('tileArray'),
                numLength = fraction.getNumeratorLength(),
                termCloned = term.deepClone(),
                Operators = modelNameSpace.TileItem.OPERATORS,
                newAddedIndexes = [], fractionIndex, modelToCheck;

            termCloned.set('operator', Operators.MULTIPLICATION);
            fractionIndex = parentTiles.indexOf(fraction);

            modelToCheck = fractionTiles.at(numLength-1);
            if(utilityMethods.isBasicTileType(modelToCheck) && _.isString(modelToCheck.get('base'))) {
                fractionTiles.at(numLength-1).set('operator', Operators.MULTIPLICATION);
                fractionTiles.add(termCloned, {at: numLength - 1});
                newAddedIndexes.push(fractionIndex + '.' + (numLength - 1));
            }
            else {
                fractionTiles.add(termCloned, {at: numLength});
                newAddedIndexes.push(fractionIndex + '.' + numLength);
            }

            fractionTiles.at(0).set('operator', null);
            this.extraTermsInserted = newAddedIndexes;
            this.numOfTilesAdded = 0;

            parentTiles.remove(parentheses);
            this.deletedTile = parentheses;
            return true;
        },

        _removeParenthesesCombineFractions: function _removeParenthesesCombineFractions (coeffFraction, termFraction, parentheses, parentTiles) {
            var coeffTiles = coeffFraction.get('tileArray'),
                coeffNumLength = coeffFraction.getNumeratorLength(),
                termFracCloned = termFraction.deepClone(),
                termFracTiles = termFracCloned.get('tileArray'),
                termFracNumLength = termFracCloned.getNumeratorLength(),
                Operators = modelNameSpace.TileItem.OPERATORS,
                newAddedIndex,
                newAddedIndexes = [], fractionIndex, i, counter = 0, currentTerm;

            fractionIndex = parentTiles.indexOf(coeffFraction);

            for(i=0; i<termFracNumLength; i++) {
                currentTerm = termFracTiles.at(i);
                currentTerm.set('operator', Operators.MULTIPLICATION);
                coeffTiles.add(currentTerm, {at: coeffNumLength + i});
                newAddedIndexes.push(fractionIndex + '.' + (coeffNumLength + i));
            }

            for (i = termFracNumLength; i < termFracTiles.length; i++) {
                currentTerm = termFracTiles.at(i);
                currentTerm.set('operator', Operators.MULTIPLICATION);
                newAddedIndex = coeffTiles.length + counter;
                coeffTiles.add(currentTerm, { at: newAddedIndex });
                newAddedIndexes.push(fractionIndex + '.' + newAddedIndex);
                counter++;
            }

            this.extraTermsInserted = newAddedIndexes;
            this.numOfTilesAdded = 0;

            parentTiles.remove(parentheses);
            this.deletedTile = parentheses;
            return true;
        },

        _removeParenthesesCombineTermFraction: function _removeParenthesesCombineTermFraction (parNode, fracNode, sourceParentTiles) {
            var parenthesesModel = parNode.collectionData,
                parenthesesRelativeIndex = sourceParentTiles.indexOf(parenthesesModel),
                coefficient, coefficients = [], coefficientsLength,
                operator,
                Operators = modelNameSpace.TileItem.OPERATORS,
                fractionModel = fracNode.collectionData,
                fractionClone = fractionModel.deepClone(),
                fractionTiles = fractionClone.get('tileArray'),
                insertionIndex,
                index;
            for (index = parenthesesRelativeIndex - 1; index >= 0; index--) {
                coefficient = sourceParentTiles.at(index);
                if (coefficient instanceof modelNameSpace.TermTile) {
                    coefficients.push(coefficient);
                }
                if ([Operators.ADDITION, null].indexOf(coefficient.get('operator')) > -1)
                    break;
            }
            insertionIndex = (index < 0) ? 0 : index;
            coefficientsLength = coefficients.length;
            this.coefficientsRemoved = {
                numberOfCoefficients: coefficientsLength,
                startingIndex: insertionIndex
            };
            fractionClone.set('operator', coefficients[coefficientsLength - 1].get('operator'));
            fractionTiles.at(0).set('operator', Operators.MULTIPLICATION);
            for (index = 0; index < coefficientsLength; index++) {
                fractionTiles.add(coefficients[index].deepClone(), { at: 0 });
            }
            fractionTiles.at(0).set('operator', null);
            sourceParentTiles.remove(coefficients);
            this.deletedTile = parenthesesModel;
            sourceParentTiles.remove(parenthesesModel);
            sourceParentTiles.add(fractionClone, { at: insertionIndex });
            return true;
        },

        /**
         * Removes parentheses and applies contents of the parenhteses to fraction
         * @method _removeParenthesesCombineMulFraction
         * @private
         *
         * @param   {Object}  fraction    The fraction term which is the coeffcient.
         * @param   {Object}  parentheses The parentheses model.
         * @param   {Object}  parentTiles The parent tiles.
         * @returns {Boolean} Whether the operation was successful or not.
         */
        _removeParenthesesCombineMulFraction: function _removeParenthesesCombineMulFraction (fraction, parentheses, parentTiles) {
            var fractionTiles = fraction.get('tileArray'),
                numLength = fraction.getNumeratorLength(),
                parTiles = parentheses.get('tileArray'),
                Operators = modelNameSpace.TileItem.OPERATORS,
                newAddedIndexes = [], fractionIndex, index, cloned;

            fractionIndex = parentTiles.indexOf(fraction);

            for(index=0; index<parTiles.length; index++) {
                cloned = parTiles.at(index).deepClone();
                cloned.set('operator', Operators.MULTIPLICATION);
                fractionTiles.add(cloned, {at: numLength + index});
                newAddedIndexes.push(fractionIndex + '.' + (numLength + index));
            }

            this.extraTermsInserted = newAddedIndexes;
            this.numOfTilesAdded = 0;

            parentTiles.remove(parentheses);
            this.deletedTile = parentheses;
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
                fraction, fractionTiles, insertionIndex, coeffTile,
                sourceParentTiles, sourceParent, index, firstTile;

            sourceParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(sourceIndex));
            sourceParentTiles = sourceParent.get('tileArray');

            if (this.coefficientsRemoved) {
                insertionIndex = this.coefficientsRemoved.startingIndex;
                fraction = sourceParentTiles.at(insertionIndex);
                fractionTiles = fraction.get('tileArray');
                for (index = this.coefficientsRemoved.numberOfCoefficients - 1; index >= 0; index--) {
                    coeffTile = fractionTiles.at(index).deepClone();
                    if (index === 0) {
                        coeffTile.set('operator', fraction.get('operator'));
                    }
                    sourceParentTiles.add(coeffTile, { at: insertionIndex });
                }
                sourceParentTiles.remove(fraction);
            }
            else if(numOfTilesAdded === 0) {
                for(index = this.extraTermsInserted.length-1; index>=0; index--) {
                    sourceParent.getModelFromIndex(this.extraTermsInserted[index]).destroy();
                }
                firstTile = this.extraTermsInserted[0].substring(0, this.extraTermsInserted[0].lastIndexOf('.')) + '.0';
                sourceParent.getModelFromIndex(firstTile).set('operator', null);
            }
            else {
                for (index = 0; index < numOfTilesAdded; index++) {
                    concernedTiles[index] = sourceParentTiles.at(this.sourcePos + index);
                }
                sourceParentTiles.remove(concernedTiles);
            }
            if(this.tileAddedInMiddle) {
                sourceParentTiles.at(this.sourcePos).set('operator', concernedTiles[0].get('operator'));
                this.sourcePos += 1;
            }
            sourceParentTiles.add(this.deletedTile, { at: this.sourcePos });
        }

    }, {

    });
})(window.MathInteractives);
