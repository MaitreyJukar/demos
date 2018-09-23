(function (MathInteractives) {
    'use strict';

    var modelNamespace = MathInteractives.Common.Components.Models.EquationManagerPro,
        utilityMethods = modelNamespace.EquationManagerPro.Utils;

    /**
    * Responsible for breaking tiles when a base tile is double clicked
    * @class BreakBaseCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */

    modelNamespace.TakeOutCommonCommand = modelNamespace.BaseCommand.extend({

        /**
        * Stores the original parentheses model object to be used in case of undo.
        *
        * @property parenthesesOriginalModel
        * @type Object
        * @default null
        */
        parenthesesOriginalModel: null,

        /**
        * Stores the cloned parentheses model object on which changes are made.
        *
        * @property parenthesesModel
        * @type Object
        * @default null
        */
        parenthesesModel: null,

        /**
        * Stores the index of parentheses tile from which tiles were dragged out.
        *
        * @property parenthesesIndex
        * @type String
        * @default null
        */
        parenthesesIndex: null,

        /**
        * Stores the parentheses' parent's model object.
        *
        * @property parenthesesParent
        * @type Object
        * @default null
        */
        parenthesesParent: null,

        /**
        * Stores the position where the dragged out tile is to be placed relative to the parentheses' parent.
        *
        * @property _commonTileRelativePosition
        * @type String
        * @default null
        */
        _commonTileRelativePosition: null,

        /**
        * Stores a string indicating the operator of the leftmost sibling of the parentheses in case dragged out tile
        * is to be placed there. Used to restore its operator on undo.
        *
        * @property _eldestSiblingOperator
        * @type String
        * @default null
        */
        _eldestSiblingOperator: null,

        /**
        * Executes the Take out common Command
        *
        * @method execute
        * @param rules {Object} consisting the allowed operation and prime limit
        * @param modelRef {Object} the model on which the operation is being performed
        * @param data {Object} the data required to perform the Combine Command
        * @return {Boolean} False, if it's an invalid operation. Else true.
        * @public
        */
        execute: function (rules, modelRef, data) {
            var source = data.source,
                dest = data.dest,
                root = data.root,
                sourceIndexStr = source.index,
                destIndexStr = dest.index,
                sourceTileModel, destTileModel,
                sourceParentModel, relativeSourceModelIndex, numberOfSourceTiles,
                sourceTileModels, sourceTileNodes, sourceNodesParent,
                relatedTileIndex,
                sourceNode, destNode,
                parenthesesChildPath,
                parenthesesNode, parenthesesChild,
                operators = modelNamespace.TileItem.OPERATORS,
                operatorsInBetween, sourceToCommonParentOperators, operatorsString = [], index,
                result = 0;

            sourceTileModel = modelRef.getModelFromIndex(sourceIndexStr);
            destTileModel = modelRef.getModelFromIndex(destIndexStr);

            sourceNode = utilityMethods.tilesToNodes(root, [sourceTileModel])[0];
            destNode = utilityMethods.tilesToNodes(root, [destTileModel])[0];

            relatedTileIndex = sourceTileModel.get('multipleInParentheses');
            this._draggingOutDenominator = sourceTileModel.get('isDenominator');

            parenthesesNode = this._getParentParenthesesNode(sourceNode);

            // can't take out common of (a + b)^c
            if (parenthesesNode === false || parenthesesNode.children[1].data !== null) {
                return modelNamespace.CommandFactory.EXIT_CODE.PARENTHESES_EXPONENT_PRESENT;               // children[1] refers to exponent of parentheses
            }

            numberOfSourceTiles = +source.numOfTiles;

            sourceParentModel = utilityMethods.getParentTiles(modelRef, sourceIndexStr);
            relativeSourceModelIndex = parseInt(utilityMethods.getSourceWrtParent(sourceIndexStr));
            sourceTileModels = [];
            for (index = 0; index < numberOfSourceTiles; index++) {
                sourceTileModels.push(sourceParentModel.at(relativeSourceModelIndex + index));
            }
            sourceTileNodes = utilityMethods.tilesToNodes(root, sourceTileModels);
            sourceNodesParent = utilityMethods.getCommonParentFromMultiple(sourceTileNodes);

            if (numberOfSourceTiles > 1) {
                if (this._checkForSimplifiableMarquee(sourceNodesParent, sourceTileNodes)) {//, numberOfSourceTiles)) {
                    return modelNamespace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                }
                else return false;
            }
            else if (sourceNode.data === operators.DIVISION) { // probably sourceNode needs to be replaced by parenthesesNode.children[0]
                if (this._checkForSimplifiableMarquee(sourceNode.children[0]) ||
                    this._checkForSimplifiableMarquee(sourceNode.children[1])) {
                    return modelNamespace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                }
                else return false;
            }

            /*
            if (+source.numOfTiles > 1 || sourceNode.data === operators.DIVISION)
                return modelNamespace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;        // Only one tile can be dragged out common
            */

            operatorsInBetween = utilityMethods.getOperatorsBetween(sourceNode, destNode);
            sourceToCommonParentOperators = operatorsInBetween.node1ToParentOperators;
            for (index = 0; index < sourceToCommonParentOperators.length; index++) {
                operatorsString.push(sourceToCommonParentOperators[index].data);
            }
            operatorsString = operatorsString.toString();
            // can't be taken out of two level of parentheses at once
            if (operatorsString.indexOf(operators.PARENTHESES) === operatorsString.lastIndexOf(operators.PARENTHESES)) {

                if (numberOfSourceTiles === 1 && this._checkForApplyCoefficientFeedback(parenthesesNode)) {
                    return modelNamespace.CommandFactory.EXIT_CODE.APPLY_COEFFECIENTS;
                }

                parenthesesChild = parenthesesNode.children[0];
                parenthesesChildPath = parenthesesChild.getPath();
                this.parenthesesOriginalModel = parenthesesNode.collectionData;
                this.parenthesesModel = this.parenthesesOriginalModel.deepClone();
                this.parenthesesIndex = modelRef.getIndexFromItemModel(this.parenthesesOriginalModel);
                this.parenthesesParent = modelRef.getModelFromIndex(this.parenthesesIndex.slice(0, this.parenthesesIndex.lastIndexOf('.')));

                if (parenthesesChild.data === operators.ADDITION) { // handle parentheses containing multiple terms
                    result = this._takeOutCommonFromPolynomial({
                        sourceNode: sourceNode,
                        monomials: parenthesesChild.children,
                        modelRef: modelRef,
                        sourceIndexString: sourceIndexStr,
                        relatedTileIndex: relatedTileIndex
                    });
                }
                else if (parenthesesChild.data === operators.DIVISION) { // handle parentheses containing a fraction
                    result = this._takeOutCommonFromFraction({
                        sourceNode: sourceNode,
                        numerator: parenthesesChild.children[0],
                        denominator: parenthesesChild.children[1],
                        modelRef: modelRef,
                        sourceIndexString: sourceIndexStr,
                        relatedTileIndex: relatedTileIndex
                    });
                }
            }
            if (typeof result !== 'number')
                sourceTileModel.set('multipleInParentheses', null);
            return result;
        },

        /**
        * Checks the passed node if it is a multiplicative term with 2 or more non-variable tiles that can be multiplied.
        *
        * @method _checkForSimplifiableMarquee
        * @param node {Object} The node that needs to be checked.
        * @param [numOfTiles] The number of tiles that the multiplicative tile must have.
        * @return {Boolean} The result of the check.
        * @private
        */
        _checkForSimplifiableMarquee: function _checkForSimplifiableMarquee(node, selectedNodeChildren) {
            selectedNodeChildren = selectedNodeChildren || [];
            var operators = modelNamespace.TileItem.OPERATORS,
                numOfTiles = node.children.length,
                index, constantTermsCount = 0,
                result;
            if (selectedNodeChildren.length) {
                if (node.data === operators.MULTIPLICATION) {
                    for (index = 0; index < selectedNodeChildren.length; index++) {
                        if (!(utilityMethods._hasVariableTermTile(selectedNodeChildren[index], utilityMethods._isNonNumericTermTile)))
                            constantTermsCount++;
                    }
                    result = (constantTermsCount > 1);
                }
                else {
                    result = false;
                }
            }
            else {
                result = (node.data === operators.MULTIPLICATION &&
                        (utilityMethods._hasVariableTermTile(node, utilityMethods._isNonNumericTermTile) ?
                        numOfTiles > 2 : numOfTiles > 1));
            }
            return result;
        },

        /**
        * Checks the parentheses node for cases where there's no immediate addition operation inside parentheses.
        *
        * @method _checkForApplyCoefficientFeedback
        * @param parenthesesNode {Object} The tree node object of the parentheses that needs to be checked.
        * @return {Boolean} True, if such a case is found and an "apply coefficient" feedback is required
        * @private
        */
        _checkForApplyCoefficientFeedback: function _checkForApplyCoefficientFeedback(parenthesesNode) {
            var parenthesesChild = parenthesesNode.children[0],
                operators = modelNamespace.TileItem.OPERATORS;
            return !((parenthesesChild.data === operators.DIVISION &&
                parenthesesChild.children[0].data === operators.ADDITION) ||
                parenthesesChild.data === operators.ADDITION);
        },

        /**
        * Traverses up the tree from the node passed and returns the first parentheses node encountered.
        *
        * @method _getParentParenthesesNode
        * @param node {Object} Tree node object.
        * @return {Object} The parentheses node parent object if the passed node is inside a parentheses; else false.
        */
        _getParentParenthesesNode: function _getParentParenthesesNode(node) {
            var parentNode = node.parent;
            if (parentNode)
                if (parentNode.data === modelNamespace.TileItem.OPERATORS.PARENTHESES)
                    return parentNode;
                else return this._getParentParenthesesNode(parentNode);
            else return false;
        },

        /**
        * If parentheses contains an addition of multiple terms, this method validates if the dragged out term can be
        * removed from each addition operand and if yes, then makes the necessary changes.
        *
        * @method _takeOutCommonFromPolynomial
        * @param data {Object} Data required for the operation.
        * @param data.sourceNode {Object} Tree node object of the tile being dragged out.
        * @param data.monomials {Array} An array of tree node objects representing each addition operand that needs to
        * be checked.
        * @param data.modelRef {Object} The model object of the equation view.
        * @param data.sourceIndexString {String} The index string of the source tile.
        * @param data.relatedTileIndex {String} The index string of the tile which is a multiple of the dragged tile
        * and needs to be factored.
        * @private
        * @return {Boolean} Operation success result.
        */
        _takeOutCommonFromPolynomial: function _takeOutCommonFromPolynomial(data) {
            var sourceNode = data.sourceNode,
                sourceIndex = data.sourceIndexString,
                monomials = data.monomials,
                modelRef = data.modelRef,
                divisibleTileIndex = data.relatedTileIndex,
                operators = modelNamespace.TileItem.OPERATORS,
                tileTypes = modelNamespace.TileItem.TileType,
                parenthesesTileArray, parenthesesRelativeIndex,
                parenthesesChildModels, swapRequired = false, childrenToSwap,
                plusEncounteredAt, childModel, plusEncountered = false,
                siblingsCollection,
                sourceRelativeIndex,    // relative to parentheses model
                divisibleTileRelativeIndex, // relative to parentheses model
                simpleTermTile, tileToReplace, tileToDivideWith,
                showOneTile,
                sibling, siblingOperator,
                siblingType, tilesToRemove, newFractionTile,
                fractionCoefficientTiles, fractionCoefficientChild,
                fractionCoefficientTileOperator, fractionCoefficientChildBase,
                fractionTileArray, fractionPosition, newParenthesesRelativeIndex,
                siblingBase, negatedSibling, modifiedTile,
                commonTile, commonTilePosition, commonTileOperator,
                affectedTilePosition, affectedTileOperator, affectedTileSiblingsCollection,
                negativeOneFoundAt = -1, oneTileFoundAt = -1,
                specialCase,
                index;

            if (typeof divisibleTileIndex !== 'string') {
                if (typeof divisibleTileIndex === 'number') {
                    return divisibleTileIndex;
                }
                else {
                    return false;
                }
            }
            sourceRelativeIndex = sourceIndex.replace(this.parenthesesIndex + '.', '');
            divisibleTileRelativeIndex = divisibleTileIndex.replace(this.parenthesesIndex + '.', '');
            parenthesesChildModels = this.parenthesesModel.get('tileArray');
            parenthesesTileArray = this.parenthesesParent.get('tileArray');
            parenthesesRelativeIndex = Number(this.parenthesesIndex.slice(this.parenthesesIndex.lastIndexOf('.') + 1));

            commonTile = sourceNode.data.deepClone();
            // When "-1" is dragged out, swap might be required.
            if (this._isTermTile(commonTile) && commonTile.get('base') === -1 &&
                commonTile.get('squareRootProps') === null) {
                swapRequired = true;
            }

            // Denominator dragged out common
            if (this._draggingOutDenominator) {
                // add cloned tile in coefficient
                tilesToRemove = [];
                for (index = parenthesesRelativeIndex; index >= 0; index--) {
                    sibling = parenthesesTileArray.at(index);
                    siblingOperator = sibling.get('operator');
                    if (sibling.get('type') === modelNamespace.TileItem.TileType.TERM_TILE) {
                        tilesToRemove.unshift(sibling);
                    }
                    if (siblingOperator === null || siblingOperator === operators.ADDITION) {
                        fractionPosition = index;
                        break;
                    }
                }
                if (sibling === this.parenthesesOriginalModel)
                    sibling = this.parenthesesModel;
                siblingType = sibling.get('type');
                switch (siblingType) {
                    case tileTypes.PARENTHESES:
                        // add a fraction with common tile as denominator
                        this._eldestSiblingOperator = siblingOperator;
                        sibling.set('operator', operators.MULTIPLICATION);
                    case tileTypes.TERM_TILE:
                        // remove all term tiles and add a fraction tile with these tiles as numerator
                        // and common tile as denominator
                        if (tilesToRemove.length > 0) {
                            parenthesesTileArray.remove(tilesToRemove);
                        }
                        commonTile.set('operator', null);
                        newFractionTile = modelNamespace.TileItem.createTileItem({
                            type: modelNamespace.TileItem.TileType.FRACTION,
                            operator: siblingOperator,
                            isLHS: commonTile.get('isLHS')
                        });
                        fractionTileArray = newFractionTile.get('tileArray');
                        for (index = 0; index < tilesToRemove.length; index++) {
                            fractionTileArray.add(tilesToRemove[index]);
                        }
                        if (fractionTileArray.length) {
                            fractionTileArray.at(0).set('operator', null);
                        }
                        fractionTileArray.add(commonTile);
                        parenthesesTileArray.add(newFractionTile, { at: fractionPosition });
                        this._draggedOutTilePosition = modelRef.getIndexFromItemModel(commonTile);
                        break;
                    case tileTypes.FRACTION:
                        // add common tile in denominator
                        fractionCoefficientTiles = sibling.get('tileArray');
                        this._multiplyCommonTileToCoefficient({
                            modelRef: modelRef,
                            commonTile: commonTile,
                            coefficients: fractionCoefficientTiles,
                            swapRequired: swapRequired,
                            rightToLeftSearchStartIndex: null
                        });
                        break;
                }

                tileToDivideWith = this.parenthesesModel.getModelFromIndex(sourceRelativeIndex);
                siblingsCollection = this._getParentsTileArray(sourceRelativeIndex, this.parenthesesModel);

                tileToReplace = this.parenthesesModel.getModelFromIndex(divisibleTileRelativeIndex);
                affectedTileSiblingsCollection = this._getParentsTileArray(divisibleTileRelativeIndex, this.parenthesesModel);

                specialCase = (tileToReplace.get('isDenominator') !== tileToDivideWith.get('isDenominator'));
                if (!specialCase) {
                    commonTilePosition = siblingsCollection.indexOf(tileToDivideWith);
                    commonTileOperator = tileToDivideWith.get('operator');
                    affectedTilePosition = affectedTileSiblingsCollection.indexOf(tileToReplace);
                    affectedTileOperator = tileToReplace.get('operator');
                }

                // swap addition operands
                if (swapRequired) {
                    childrenToSwap = [];
                    for (index = 0; index < parenthesesChildModels.length; index++) {
                        childModel = parenthesesChildModels.at(index);
                        if (!plusEncountered) {
                            if (childModel.get('operator') === operators.ADDITION) {
                                plusEncountered = true;
                                plusEncounteredAt = index;
                                break;
                            }
                            childrenToSwap.push(childModel);
                        }
                    }
                    parenthesesChildModels.at(0).set('operator', '+');
                    parenthesesChildModels.at(plusEncounteredAt).set('operator', null);
                    parenthesesChildModels.remove(childrenToSwap);
                    for (index = 0; index < childrenToSwap.length; index++)
                        parenthesesChildModels.add(childrenToSwap[index]);
                }

                if (specialCase) {
                    commonTilePosition = siblingsCollection.indexOf(tileToDivideWith);
                    commonTileOperator = tileToDivideWith.get('operator');
                    affectedTilePosition = affectedTileSiblingsCollection.indexOf(tileToReplace);
                    affectedTileOperator = tileToReplace.get('operator');
                }

                // replace original parentheses with modified parentheses
                newParenthesesRelativeIndex = modelRef.getIndexFromItemModel(this.parenthesesOriginalModel);
                newParenthesesRelativeIndex = Number(newParenthesesRelativeIndex.slice(
                    newParenthesesRelativeIndex.lastIndexOf('.') + 1));
                parenthesesTileArray.remove(this.parenthesesOriginalModel);
                parenthesesTileArray.add(this.parenthesesModel, { at: newParenthesesRelativeIndex });

                // remove dragged tile
                siblingsCollection.remove(tileToDivideWith);    // remove common tile
                showOneTile = false;
                for (index = siblingsCollection.length - 1; index >= 0; index--) {
                    if (siblingsCollection.at(index).get('isDenominator')) {
                        showOneTile = true;
                        break;
                    }
                }
                if (showOneTile) {  // if there's any tile left in denominator, show "1" tile in place of common tile
                    siblingsCollection.add(this._getResultantTermTile(tileToDivideWith), {
                        at: commonTilePosition
                    });
                }
                else if (siblingsCollection.at(commonTilePosition)) {
                    siblingsCollection.at(commonTilePosition).set('operator', commonTileOperator);
                }

                // remove related tile if any
                affectedTileSiblingsCollection.remove(tileToReplace);
                tileToReplace = this._getResultantTermTile(tileToReplace, commonTile);
                showOneTile = false;
                for (index = affectedTileSiblingsCollection.length - 1; index >= 0; index--) {
                    if (affectedTileSiblingsCollection.at(index).get('isDenominator')) {
                        showOneTile = true;
                        break;
                    }
                }
                if (tileToReplace.get('base') !== 1 || showOneTile || specialCase) {
                    affectedTileSiblingsCollection.add(tileToReplace, { at: affectedTilePosition });
                }
                else if (affectedTileSiblingsCollection.at(affectedTilePosition)) {
                    affectedTileSiblingsCollection.at(affectedTilePosition).set('operator', affectedTileOperator);
                }
                this._denominatorAddedAt = modelRef.getIndexFromItemModel(commonTile);
            }
            else {
                // Handle operator of tile dragged out
                for (index = parenthesesRelativeIndex; index >= 0; index--) {
                    sibling = parenthesesTileArray.at(index);
                    siblingOperator = sibling.get('operator');
                    if (siblingOperator === null || siblingOperator === operators.ADDITION) {
                        break;
                    }
                }
                if (sibling === this.parenthesesOriginalModel)
                    sibling = this.parenthesesModel;
                siblingType = sibling.get('type');
                switch (siblingType) {
                    case tileTypes.PARENTHESES:
                        // add the common tile at index
                        commonTile.set('operator', siblingOperator);
                        sibling.set('operator', operators.MULTIPLICATION);
                        parenthesesTileArray.add(commonTile, { at: index });
                        this._draggedOutTilePosition = modelRef.getIndexFromItemModel(commonTile);
                        this._eldestSiblingOperator = siblingOperator;
                        break;
                    case tileTypes.TERM_TILE:
                        // check all coefficients and replace "1" tile or "-1" tile or add the common tile
                        this._multiplyCommonTileToCoefficient({
                            modelRef: modelRef,
                            commonTile: commonTile,
                            coefficients: parenthesesTileArray,
                            swapRequired: swapRequired,
                            rightToLeftSearchStartIndex: parenthesesRelativeIndex
                        });
                        break;
                    case tileTypes.FRACTION:
                        // add common tile in numerator
                        fractionCoefficientTiles = sibling.get('tileArray');
                        this._multiplyCommonTileToCoefficient({
                            modelRef: modelRef,
                            commonTile: commonTile,
                            coefficients: fractionCoefficientTiles,
                            swapRequired: swapRequired,
                            rightToLeftSearchStartIndex: null
                        });
                        break;
                }

                // remove source tile and replace with "1" term tile
                tileToDivideWith = this.parenthesesModel.getModelFromIndex(sourceRelativeIndex);
                simpleTermTile = this._getResultantTermTile(tileToDivideWith);
                siblingsCollection = this._getParentsTileArray(sourceRelativeIndex, this.parenthesesModel);
                sourceRelativeIndex = siblingsCollection.indexOf(tileToDivideWith);
                siblingsCollection.remove(tileToDivideWith);
                siblingsCollection.add(simpleTermTile, { at: sourceRelativeIndex });

                // remove divisible tile and replace with correct term tile
                tileToReplace = this.parenthesesModel.getModelFromIndex(divisibleTileRelativeIndex);
                simpleTermTile = this._getResultantTermTile(tileToReplace, tileToDivideWith);
                siblingsCollection = this._getParentsTileArray(divisibleTileRelativeIndex, this.parenthesesModel);
                divisibleTileRelativeIndex = siblingsCollection.indexOf(tileToReplace);
                siblingsCollection.remove(tileToReplace);
                siblingsCollection.add(simpleTermTile, { at: divisibleTileRelativeIndex });

                // swap addition operands
                if (swapRequired) {
                    childrenToSwap = [];
                    for (index = 0; index < parenthesesChildModels.length; index++) {
                        childModel = parenthesesChildModels.at(index);
                        if (!plusEncountered) {
                            if (childModel.get('operator') === operators.ADDITION) {
                                plusEncountered = true;
                                plusEncounteredAt = index;
                                break;
                            }
                            childrenToSwap.push(childModel);
                        }
                    }
                    parenthesesChildModels.at(0).set('operator', '+');
                    parenthesesChildModels.at(plusEncounteredAt).set('operator', null);
                    parenthesesChildModels.remove(childrenToSwap);
                    for (index = 0; index < childrenToSwap.length; index++)
                        parenthesesChildModels.add(childrenToSwap[index]);
                }

                // replace original parentheses with modified parentheses
                parenthesesRelativeIndex = parenthesesTileArray.indexOf(this.parenthesesOriginalModel);
                parenthesesTileArray.remove(this.parenthesesOriginalModel);
                parenthesesTileArray.add(this.parenthesesModel, { at: parenthesesRelativeIndex });
            }
            return true;
        },

        /**
        * Multiplies the common tile dragged out of the parentheses to the coefficients of the parentheses
        *
        * @method _multiplyCommonTileToCoefficient
        * @param data {Object} Plain javascript object used to pass data to the method.
        * @param data.commonTile {Object} The cloned model object of the tile dragged out of the parentheses.
        * @param data.coefficients {Object} Collection of tile models that hold the parentheses coefficients.
        * @param data.swapRequired {Boolean} A boolean indicating whether the commonTile is a "-1" tile.
        * @param data.modelRef {Object} Model object of the equation view.
        * @param [data.rightToLeftSearchStartIndex] {Number} While parsing the coefficients to search for "1" tile or
        * "-1" tile, the search by default starts from the last child of coefficients; however, a starting index can be
        * passed.
        * @private
        */
        _multiplyCommonTileToCoefficient: function (data) {
            var commonTile = data.commonTile,
                coefficients = data.coefficients,
                swapRequired = data.swapRequired,
                modelRef = data.modelRef,
                operators = modelNamespace.TileItem.OPERATORS,
                tileTypes = modelNamespace.TileItem.TileType,
                negativeOneFoundAt = -1, oneTileFoundAt = -1,
                rightToLeftSearchStartIndex = data.rightToLeftSearchStartIndex,
                index, obj = {}, sqRootProps,
                coefficientToModify, coefficientOperator, coefficientBase;
            if (rightToLeftSearchStartIndex === null || typeof rightToLeftSearchStartIndex === 'undefined')
                rightToLeftSearchStartIndex = coefficients.length - 1;
            for (index = rightToLeftSearchStartIndex; index >= 0; index--) {
                coefficientToModify = coefficients.at(index);
                if (commonTile.get('isDenominator') === false && coefficientToModify.get('isDenominator'))
                    continue;
                coefficientOperator = coefficientToModify.get('operator');
                if (this._isTermTile(coefficientToModify)) {
                    coefficientBase = coefficientToModify.get('base'); // assuming that 'i' tile can't be dragged out common
                    if (coefficientBase === -1) {
                        negativeOneFoundAt = index;
                    }
                    else if (coefficientBase === 1) {
                        oneTileFoundAt = index;
                    }
                }
                if (coefficientOperator === null || coefficientOperator === operators.ADDITION) {
                    break;
                }
            }
            if (negativeOneFoundAt > -1 && (swapRequired || oneTileFoundAt === -1)) {
                // negate common tile and replace "-1" tile by it
                coefficientToModify = coefficients.at(negativeOneFoundAt);
                this._negativeOneTileReplacedAt = modelRef.getIndexFromItemModel(coefficientToModify);
                if (commonTile.get('squareRootProps')) {
                    sqRootProps = commonTile.get('squareRootProps');
                    obj = {
                        exponent: sqRootProps.exponent,
                        isNegative: !sqRootProps.isNegative
                    }
                    commonTile.set({
                        operator: coefficientToModify.get('operator'),
                        squareRootProps: obj
                    });
                }
                else {
                    commonTile.set({
                        operator: coefficientToModify.get('operator'),
                        base: commonTile.get('base') * -1
                    });
                }
                coefficients.remove(coefficientToModify);
                coefficients.add(commonTile, { at: negativeOneFoundAt });
            }
            else if (oneTileFoundAt > -1) { // replace one tile with common tile
                coefficientToModify = coefficients.at(oneTileFoundAt);
                this._oneTileReplacedAt = modelRef.getIndexFromItemModel(coefficientToModify);
                commonTile.set({
                    operator: coefficientToModify.get('operator')
                });
                coefficients.remove(coefficientToModify);
                coefficients.add(commonTile, { at: oneTileFoundAt });
            }
            else { // add common tile at index
                coefficientToModify = coefficients.at(index);
                coefficientOperator = coefficientToModify.get('operator');
                this._eldestSiblingOperator = coefficientOperator;
                this._draggedOutTilePosition = modelRef.getIndexFromItemModel(coefficientToModify);
                coefficientToModify.set('operator', operators.MULTIPLICATION);
                commonTile.set('operator', coefficientOperator);
                coefficients.add(commonTile, { at: index });
            }
        },

        /**
        * Gets the tile model's parent's tileArray.
        *
        * @method _getParentsTileArray
        * @param nodeIndex {String} Tile's index relative to the model passed as second parameter.
        * @param relativeTo {Object} The tile model relative to which the tile index is passed. (Could be equation's
        * model or any other tile model)
        * @return {Object} The backbone collection in which the tile model whose index is passed resides.
        * @private
        */
        _getParentsTileArray: function _getParentsTileArray(tileIndex, relativeTo) {
            var indexes, index, tileArray;
            indexes = tileIndex.split('.');
            index = indexes.shift();
            tileArray = relativeTo.get('tileArray');
            if (indexes.length > 0) {
                return this._getParentsTileArray(indexes.join('.'), tileArray.at(index));
            }
            else {
                return tileArray;
            }
        },

        /**
        * Generates the resultant term tile that will replace the given tile on taking out common.
        *
        * @method _getResultantTermTile
        * @param tileToReplace {Object} The tile model that needs to be replaced.
        * @param [tileToDivideWith] {Object} The tile model that is being taken out common. Used for calculating the
        * base of the resultant tile. Resultant tile will have base value as "1" if not passed.
        * @private
        */
        _getResultantTermTile: function _getResultantTermTile(tileToReplace, tileToDivideWith) {
            var resultantTile, operator, isLHS, isDenominator,
                isNegative, absoluteVariableBase, resultantVariableBase,
                base1, base2, resultantBase,
                iotaExponent1, iotaExponent2,
                operators = modelNamespace.TileItem.OPERATORS,
                squareRootProps1, squareRootProps2,
                squareRootProps = false, iotaExponent = false,
                tileCreationData,
                tileType, types;
            types = modelNamespace.TileItem.TileType;
            operator = tileToReplace.get('operator');
            isLHS = tileToReplace.get('isLHS');
            isDenominator = tileToReplace.get('isDenominator');
            resultantBase = 1;
            if (tileToDivideWith) {
                tileType = tileToDivideWith.get('type');
                if (tileType === types.TERM_TILE) {
                    base1 = tileToReplace.get('base');
                    iotaExponent1 = tileToReplace.get('iotaExponent');
                    squareRootProps1 = tileToReplace.get('squareRootProps') || {};
                    base2 = tileToDivideWith.get('base');
                    iotaExponent2 = tileToDivideWith.get('iotaExponent');
                    squareRootProps2 = tileToDivideWith.get('squareRootProps') || {};
                    if ((squareRootProps1.exponent && (squareRootProps1.exponent === squareRootProps2.exponent)) &&
                        (!iotaExponent1 && iotaExponent1 === iotaExponent2 /* For cases like ([?9] + [?9•i]) */) &&
                        (base1 && (base1 === base2))) {
                        resultantBase = (squareRootProps1.isNegative ^ squareRootProps2.isNegative) ? -1 : 1;
                    } //if ((iotaExponent2 && (iotaExponent2 === iotaExponent1)) && base1 && base2) { }
                    else if (!(squareRootProps1.exponent || squareRootProps2.exponent || iotaExponent1 || iotaExponent2)) {
                        if (typeof base2 === 'string' && typeof base1 === 'string') {
                            isNegative = base2.indexOf(operators.SUBTRACTION) > -1 ^ base1.indexOf(operators.SUBTRACTION) > -1;
                            absoluteVariableBase = base1.replace(operators.SUBTRACTION, '');
                            if (absoluteVariableBase === base2.replace(operators.SUBTRACTION, '')) {
                                resultantBase = isNegative ? -1 : 1;
                            }
                        }
                        else if (typeof base1 === 'string') {   // base1 is string, base2 is number (-1)
                            resultantBase = base1.indexOf(operators.SUBTRACTION) > -1 ?
                                base1.replace(operators.SUBTRACTION, '') : operators.SUBTRACTION + base1;
                        }
                        else if (base1 && base1 % base2 === 0) {    // both are numbers
                            resultantBase = base1 / base2;
                        }
                    }
                    else if (base2 === -1 && !squareRootProps2.exponent && !iotaExponent2) { // -1 tile
                        if (squareRootProps1.exponent) {
                            resultantBase = base1;
                            squareRootProps = $.extend(true, {}, squareRootProps1);
                            squareRootProps.isNegative = !squareRootProps.isNegative;
                        }
                        else if (typeof base1 === 'string') {
                            resultantBase = base1.indexOf(operators.SUBTRACTION) > -1 ?
                                base1.replace(operators.SUBTRACTION, '') : operators.SUBTRACTION + base1;
                        }
                        else resultantBase = base1 * -1;
                        iotaExponent = iotaExponent1;
                    }
                }
                // for parentheses, since we are allowing take out common only when the two parentheses are identical
                // so base = 1;
            }
            tileCreationData = {
                type: modelNamespace.TileItem.TileType.TERM_TILE,
                base: resultantBase,
                operator: operator,
                isLHS: isLHS,
                isDenominator: isDenominator
            };
            if (squareRootProps)
                tileCreationData.squareRootProps = squareRootProps;
            if (iotaExponent)
                tileCreationData.iotaExponent = iotaExponent;
            resultantTile = modelNamespace.TileItem.createTileItem(tileCreationData);
            return resultantTile;
        },

        /**
        * Checks whether the tile model passed is of a term tile.
        *
        * @method _isTermTile
        * @param tileModel {Object} The tile model that needs to be checked.
        * @return {Boolean} True, if the tile is a term tile.
        */
        _isTermTile: function _isTermTile(tileModel) {
            return (tileModel && tileModel.get('type') === modelNamespace.TileItem.TileType.TERM_TILE &&
                    tileModel.get('iotaExponent') === null && tileModel.get('squareRootProps') === null);
        },

        /**
        * Checks if the tile whose model is passed is a negative term tile.
        *
        * @method _isNegativeTile
        * @param tileModel {Object} The tile's model.
        * @return {Boolean} True if negative term tile, else false.
        * @private
        */
        _isNegativeTile: function _isNegativeTile(tileModel) {
            var tileTypes = modelNamespace.TileItem.TileType,
                squareRootProps, iotaExponent, base,
                type = tileModel.get('type'),
                index, result = false, fractionChildren;
            switch (type) {
                case tileTypes.TERM_TILE:
                    base = tileModel.get('base');
                    iotaExponent = tileModel.get('iotaExponent');
                    squareRootProps = tileModel.get('squareRootProps') || {};
                    if (squareRootProps.exponent) {
                        return squareRootProps.isNegative;
                    }
                    else {
                        if (typeof base === 'string') {
                            return (base.indexOf(modelNamespace.TileItem.OPERATORS.SUBTRACTION) > -1);
                        }
                        else {
                            return (base < 0);
                        }
                    }
                    break;
                case tileTypes.FRACTION:
                    // loop to check each child
                    // return true if odd number of children are negative
                    fractionChildren = tileModel.get('tileArray');
                    for (index = 0; index < fractionChildren.length; index++) {
                        result ^= this._isNegativeTile(fractionChildren.at(index));
                    }
                    return result;
                    break;
            }
            return false;
        },

        /**
        * If parentheses contains a fraction, this method validates if the dragged out term can be
        * removed from the parentheses and if yes, then makes the necessary changes.
        *
        * @method _takeOutCommonFromFraction
        * @param data {Object} Data required for the operation.
        * @param data.sourceNode {Object} Tree node object of the tile being dragged out.
        * @param data.numerator {Object} Tree node object of the fraction's numerator.
        * @param data.denominator {Object} Tree node object of the fraction's numerator.
        * @param data.modelRef {Object} The model object of the equation view.
        * @param data.sourceIndexString {String} The index string of the source tile.
        * @param data.relatedTileIndex {String} The index string of the tile which is a multiple of the dragged tile
        * and needs to be factored.
        * @private
        * @return {Boolean} Operation success result.
        */
        _takeOutCommonFromFraction: function _takeOutCommonFromFraction(data) {
            var sourceNode = data.sourceNode,
                sourceIndex = data.sourceIndexString,
                numerator = data.numerator,
                denominator = data.denominator,
                modelRef = data.modelRef,
                divisibleTileIndex = data.relatedTileIndex,
                operators = modelNamespace.TileItem.OPERATORS,
                tileTypes = modelNamespace.TileItem.TileType,
                fractionModel, fractionChildModels, fractionIndex,
                swapRequired = false, childrenToSwap,
                plusEncounteredAt, childModel, plusEncountered = false,
                numeratorEndIndex, numberOfChildrenToSwap,
                sourceRelativeIndex,    // relative to fraction model
                divisibleTileRelativeIndex, // relative to fraction model
                simpleTermTile, tileToReplace, tileToDivideWith,
                showOneTile = false,
                parenthesesTileArray, parenthesesRelativeIndex,
                commonTile, commonTilePosition, commonTileOperator,
                sibling, siblingOperator, siblingType,
                siblingBase, negatedSibling,
                negativeOneFoundAt = -1, oneTileFoundAt = -1,
                tilesToRemove, fractionPosition, newParenthesesRelativeIndex,
                newFractionTile, fractionTileArray,
                index;
            if (typeof divisibleTileIndex !== 'string') {
                if (typeof divisibleTileIndex === 'number') {
                    return divisibleTileIndex;
                }
                else {
                    return false;
                }
            }
            parenthesesTileArray = this.parenthesesParent.get('tileArray');
            parenthesesRelativeIndex = Number(this.parenthesesIndex.slice(this.parenthesesIndex.lastIndexOf('.') + 1));
            commonTile = sourceNode.data.deepClone();
            //// When "-1" is dragged out, swap might be required.
            //if (this._isTermTile(commonTile) && commonTile.get('base') === -1 &&
            //    commonTile.get('squareRootProps') === null) {
            //    swapRequired = true;
            //}
            if (divisibleTileIndex === '-1') { // indicates that a denominator tile is dragged out
                parenthesesRelativeIndex = Number(this.parenthesesIndex.slice(this.parenthesesIndex.lastIndexOf('.') + 1));

                // fraction is the first child model inside parentheses model's tileArray
                fractionModel = this.parenthesesModel.get('tileArray').at(0);
                fractionIndex = this.parenthesesIndex + '.0';
                fractionChildModels = fractionModel.get('tileArray');
                sourceRelativeIndex = sourceIndex.replace(fractionIndex + '.', '');
                divisibleTileRelativeIndex = divisibleTileIndex.replace(fractionIndex + '.', '');

                // remove dragged tile
                tileToDivideWith = fractionChildModels.at(sourceRelativeIndex);
                commonTileOperator = tileToDivideWith.get('operator');
                fractionChildModels.remove(tileToDivideWith);

                for (index = fractionChildModels.length - 1; index >= 0; index--) {
                    if (fractionChildModels.at(index).get('isDenominator')) {
                        showOneTile = true;
                        break;
                    }
                }
                if (showOneTile) {
                    fractionChildModels.add(this._getResultantTermTile(tileToDivideWith), { at: sourceRelativeIndex });
                }
                else if (fractionChildModels.at(sourceRelativeIndex)) {
                    fractionChildModels.at(sourceRelativeIndex).set('operator', commonTileOperator);
                }
                // add cloned tile in coefficient
                tilesToRemove = [];
                for (index = parenthesesRelativeIndex; index >= 0; index--) {
                    sibling = parenthesesTileArray.at(index);
                    siblingOperator = sibling.get('operator');
                    if (sibling.get('type') === modelNamespace.TileItem.TileType.TERM_TILE) {
                        tilesToRemove.unshift(sibling);
                    }
                    if (siblingOperator === null || siblingOperator === operators.ADDITION) {
                        fractionPosition = index;
                        break;
                    }
                }
                if (sibling === this.parenthesesOriginalModel)
                    sibling = this.parenthesesModel;
                siblingType = sibling.get('type');
                switch (siblingType) {
                    case tileTypes.PARENTHESES:
                        // add a fraction with common tile as denominator
                        this._eldestSiblingOperator = siblingOperator;
                        sibling.set('operator', operators.MULTIPLICATION);
                    case tileTypes.TERM_TILE:
                        // remove all term tiles and add a fraction tile with these tiles as numerator
                        // and common tile as denominator
                        if (tilesToRemove.length > 0) {
                            parenthesesRelativeIndex -= tilesToRemove.length;
                            parenthesesTileArray.remove(tilesToRemove);
                            tilesToRemove[0].set('operator', null); // numerator first tile operator is null
                        }
                        commonTile.set('operator', null); // denominator first tile operator is null
                        newFractionTile = modelNamespace.TileItem.createTileItem({
                            type: modelNamespace.TileItem.TileType.FRACTION,
                            operator: siblingOperator,
                            isLHS: commonTile.get('isLHS')
                        });
                        fractionTileArray = newFractionTile.get('tileArray');
                        for (index = 0; index < tilesToRemove.length; index++) {
                            fractionTileArray.add(tilesToRemove[index]);
                        }
                        fractionTileArray.at(0).set('operator', null);
                        fractionTileArray.add(commonTile);
                        parenthesesTileArray.add(newFractionTile, { at: fractionPosition });
                        parenthesesRelativeIndex++;
                        this._draggedOutTilePosition = modelRef.getIndexFromItemModel(commonTile);
                        break;
                    case tileTypes.FRACTION:
                        // add common tile in denominator
                        this._multiplyCommonTileToCoefficient({
                            modelRef: modelRef,
                            commonTile: commonTile,
                            coefficients: sibling.get('tileArray'),
                            swapRequired: swapRequired,
                            rightToLeftSearchStartIndex: null
                        });
                        break;
                }

                // replace original parentheses with modified parentheses
                parenthesesTileArray.remove(this.parenthesesOriginalModel);
                parenthesesTileArray.add(this.parenthesesModel, { at: parenthesesRelativeIndex });

                this._denominatorAddedAt = modelRef.getIndexFromItemModel(commonTile);
            }
            else {
                // fraction is the first child model inside parentheses model's tileArray
                fractionModel = this.parenthesesModel.get('tileArray').at(0);
                fractionIndex = this.parenthesesIndex + '.0';
                fractionChildModels = fractionModel.get('tileArray');
                sourceRelativeIndex = sourceIndex.replace(fractionIndex + '.', '');
                divisibleTileRelativeIndex = divisibleTileIndex.replace(fractionIndex + '.', '');

                // remove source tile and replace with "1" term tile
                tileToDivideWith = fractionChildModels.at(sourceRelativeIndex);
                simpleTermTile = this._getResultantTermTile(tileToDivideWith);
                fractionChildModels.remove(tileToDivideWith);
                fractionChildModels.add(simpleTermTile, { at: +sourceRelativeIndex });

                // remove divisible tile and replace with correct term tile
                tileToReplace = fractionModel.getModelFromIndex(divisibleTileRelativeIndex);
                simpleTermTile = this._getResultantTermTile(tileToReplace, tileToDivideWith);
                divisibleTileRelativeIndex = fractionChildModels.indexOf(tileToReplace);
                fractionChildModels.remove(tileToReplace);
                fractionChildModels.add(simpleTermTile, { at: +divisibleTileRelativeIndex });

                // replace original parentheses with modified parentheses
                parenthesesRelativeIndex = Number(this.parenthesesIndex.slice(this.parenthesesIndex.lastIndexOf('.') + 1));

                for (index = parenthesesRelativeIndex; index >= 0; index--) {
                    sibling = parenthesesTileArray.at(index);
                    siblingOperator = sibling.get('operator');
                    if (siblingOperator === null || siblingOperator === operators.ADDITION) {
                        break;
                    }
                }
                siblingType = sibling.get('type');
                switch (siblingType) {
                    case tileTypes.PARENTHESES:
                        // add the common tile at index
                        commonTile.set('operator', siblingOperator);
                        sibling.set('operator', operators.MULTIPLICATION);
                        parenthesesTileArray.add(commonTile, { at: index });
                        this._draggedOutTilePosition = modelRef.getIndexFromItemModel(commonTile);
                        this._eldestSiblingOperator = siblingOperator;
                        break;
                    case tileTypes.TERM_TILE:
                        // check all coefficients and replace "1" tile or "-1" tile or add the common tile
                        this._multiplyCommonTileToCoefficient({
                            modelRef: modelRef,
                            commonTile: commonTile,
                            coefficients: parenthesesTileArray,
                            swapRequired: swapRequired,
                            rightToLeftSearchStartIndex: parenthesesRelativeIndex
                        });
                        break;
                    case tileTypes.FRACTION:
                        // add common tile in numerator
                        this._multiplyCommonTileToCoefficient({
                            modelRef: modelRef,
                            commonTile: commonTile,
                            coefficients: sibling.get('tileArray'),
                            swapRequired: swapRequired,
                            rightToLeftSearchStartIndex: null
                        });
                        break;
                }
                parenthesesRelativeIndex = parenthesesTileArray.indexOf(this.parenthesesOriginalModel);
                parenthesesTileArray.remove(this.parenthesesOriginalModel);
                parenthesesTileArray.add(this.parenthesesModel, { at: parenthesesRelativeIndex });
            }
            // swap addition operands
            if (swapRequired) {
                childrenToSwap = [];
                for (index = 0; index < fractionChildModels.length; index++) {
                    childModel = fractionChildModels.at(index);
                    if (!plusEncountered && childModel.get('operator') === operators.ADDITION) {
                        plusEncountered = true;
                    }
                    if (!plusEncountered) {
                        childrenToSwap.push(childModel);
                    }
                    if (childModel.get('isDenominator'))
                        break;
                    else numeratorEndIndex = index;
                }
                numberOfChildrenToSwap = childrenToSwap.length;
                fractionChildModels.at(0).set('operator', '+');
                fractionChildModels.at(numberOfChildrenToSwap).set('operator', null);
                fractionChildModels.remove(childrenToSwap);
                for (index = numberOfChildrenToSwap - 1; index >= 0; index--)
                    fractionChildModels.add(childrenToSwap[index], {
                        at: numeratorEndIndex - numberOfChildrenToSwap + 1
                    });
            }
            return true;
        },

        /**
        * Undos the command
        *
        * @method undo
        * @param {Object} The model from which the command has to be undone
        * @public
        */
        undo: function (modelRef) {
            var parenthesesTileArray = this.parenthesesParent.get('tileArray'),
                tile, modifiedTile, indices, tileRelativeIndex, tileParentIndex, tileParent, tileSiblings,
                tileParentRelativeIndex, noDenominator = true, index, coefficients,
                parenthesesRelativeIndex = Number(this.parenthesesIndex.slice(this.parenthesesIndex.lastIndexOf('.') + 1));
            if (typeof this._oneTileReplacedAt === 'string') {
                tile = modelRef.getModelFromIndex(this._oneTileReplacedAt);
                indices = this._oneTileReplacedAt.split('.');
                tileRelativeIndex = Number(indices.pop());
                tileParentIndex = indices.join('.');
                tileSiblings = modelRef.getModelFromIndex(tileParentIndex).get('tileArray');
                modifiedTile = modelNamespace.TileItem.createTileItem({
                    type: modelNamespace.TileItem.TileType.TERM_TILE,
                    base: 1,
                    operator: tile.get('operator'),
                    isLHS: tile.get('isLHS'),
                    isDenominator: tile.get('isDenominator')
                });
                tileSiblings.remove(tile);
                tileSiblings.add(modifiedTile, { at: tileRelativeIndex });
            }
            else if (typeof this._negativeOneTileReplacedAt === 'string') {
                tile = modelRef.getModelFromIndex(this._negativeOneTileReplacedAt);
                indices = this._negativeOneTileReplacedAt.split('.');
                tileRelativeIndex = Number(indices.pop());
                tileParentIndex = indices.join('.');
                tileSiblings = modelRef.getModelFromIndex(tileParentIndex).get('tileArray');
                modifiedTile = modelNamespace.TileItem.createTileItem({
                    type: modelNamespace.TileItem.TileType.TERM_TILE,
                    base: -1,
                    operator: tile.get('operator'),
                    isLHS: tile.get('isLHS'),
                    isDenominator: tile.get('isDenominator')
                });
                tileSiblings.remove(tile);
                tileSiblings.add(modifiedTile, { at: tileRelativeIndex });
            }
            else {
                indices = this._draggedOutTilePosition.split('.');
                tileRelativeIndex = Number(indices.pop());
                tileParentIndex = indices.join('.');
                tileParent = modelRef.getModelFromIndex(tileParentIndex);
                tileSiblings = tileParent.get('tileArray');
                tileSiblings.remove(tileSiblings.at(tileRelativeIndex));
                modifiedTile = modelRef.getModelFromIndex(this._draggedOutTilePosition);
                if (modifiedTile) {
                    modifiedTile.set('operator', this._eldestSiblingOperator);
                }
                else if (tileParent instanceof modelNamespace.FractionTile) {
                    if (tileSiblings.length === 0) {
                        // fix for dragging out denominator from ()*() case
                        parenthesesTileArray.remove(tileParent);
                        parenthesesTileArray.at(tileParentIndex.slice(tileParentIndex.lastIndexOf('.') + 1))
                            .set('operator', this._eldestSiblingOperator);
                    }
                    else {
                        // Handle case where multiplicative coefficients were replaced with fraction
                        coefficients = [];
                        for (index = tileSiblings.length - 1; index >= 0; index--) {
                            modifiedTile = tileSiblings.at(index);
                            coefficients.push(modifiedTile);
                            if (modifiedTile.get('isDenominator')) {
                                noDenominator = false;
                                break;
                            }
                        }
                        if (noDenominator) {
                            parenthesesTileArray.remove(tileParent);
                            tileParentRelativeIndex = Number(tileParentIndex.slice(tileParentIndex.lastIndexOf('.') + 1));
                            for (index = 0; index < coefficients.length; index++) {
                                parenthesesTileArray.add(coefficients[index], { at: tileParentRelativeIndex })
                            }
                            if (coefficients.length) {
                                parenthesesTileArray.at(tileParentRelativeIndex).set('operator', tileParent.get('operator'));
                            }
                        }
                    }
                }
            }
            parenthesesTileArray.remove(parenthesesTileArray.at(parenthesesRelativeIndex));
            parenthesesTileArray.add(this.parenthesesOriginalModel, { at: parenthesesRelativeIndex });
        }
    }, {
    });
})(window.MathInteractives);
