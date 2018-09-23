(function (MathInteractives) {
    'use strict';

    var modelNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro,
        utilityMethods = modelNameSpace.EquationManagerPro.Utils;

    /**
    * Responsible for repositioning tiles in an expression on drag drop.
    * @class RepositionCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */
    modelNameSpace.RepositionCommand = modelNameSpace.BaseCommand.extend({

        /**
        * Stores the position/index of the first tile to be repositioned.
        *
        * @property _sourceIndexString
        * @type String
        * @default null
        */
        _sourceIndexString: null,

        /**
        * Stores the position/index of the target where the tiles are to be placed.
        *
        * @property _destIndexString
        * @type String
        * @default null
        */
        _destIndexString: null,

        /**
        * Stores the number of tiles repositioned
        *
        * @property _numberOfTiles
        * @type Number
        * @default null
        */
        _numberOfTiles: null,

        /**
        * Boolean indicating if the tile is to be added to the left of the destination index.
        *
        * @property _bLeft
        * @type Boolean
        * @default true
        */
        _bLeft: true,

        /**
        * Stores the relative position of the first tile to be repositioned with respect to its parent.
        *
        * @attribute _sourcePosition
        * @type Number
        * @default null
        */
        _sourcePosition: null,

        /**
        * Stores the relative position of the destination with respect to its parent.
        *
        * @attribute _destPosition
        * @type Number
        * @default null
        */
        _destPosition: null,

        /**
        * Executes the Combine Command
        *
        * @method execute
        * @param rules {Object} consisting the allowed operation and prime limit
        * @param modelRef {Object} the model on which the operation is being performed
        * @param data {Object} the data required to perform the Combine Command
        * @return {Boolean} False, if reposition is mathematically incorrect or not allowed. Else, true.
        * @public
        */
        execute: function execute(rules, modelRef, data) {
            var source = data.source,
                dest = data.dest;
            this._sourceIndexString = source.index;
            this._destIndexString = dest.index;
            this._numberOfTiles = source.numOfTiles;
            this.fractionToDecimalAllowed = rules.fractionToDecimalAllowed;
            this._bLeft = (data.bLeft === null || typeof data.bLeft === 'undefined') ? this._bLeft : data.bLeft;
            var isValid = this._validateCommand(rules, modelRef, data.root);
            if (isValid) {
                this._performResposition(modelRef);
                modelRef.printExpr();
                return true;
            }
        },

        /**
        * Validates using tree if the reposition is allowed.
        *
        * @method _validateCommand
        * @param rules {Object} consisting the allowed operation and prime limit
        * @param modelRef {Object} the model on which the operation is being performed
        * @param root {Object} The tree root node.
        * @return {Boolean} False, if reposition is mathematically incorrect or not allowed. Else, true.
        * @private
        */
        _validateCommand: function _validateCommand(rules, modelRef, root) {
            var isValid = true,
                sourceIndexStr, destIndexStr,
                numberOfSourceTiles,
                sourceTileModel, destTileModel,
                sourceParentModel,
                relativeSourceModelIndex,
                sourceTileModels, sourceTileNodes, sourceNodesParent,
                destNode, operatorsInBetween,
                uniqueOperators,
                bLeft = this._bLeft,
                index = 0;

            sourceIndexStr = this._sourceIndexString;
            destIndexStr = this._destIndexString;

            this._sourcePosition = parseInt(utilityMethods.getSourceWrtParent(sourceIndexStr));
            this._destPosition = parseInt(utilityMethods.getSourceWrtParent(destIndexStr));

            sourceTileModel = modelRef.getModelFromIndex(sourceIndexStr);
            destTileModel = modelRef.getModelFromIndex(destIndexStr);
            numberOfSourceTiles = this._numberOfTiles;
            sourceParentModel = utilityMethods.getParentTiles(modelRef, sourceIndexStr);
            relativeSourceModelIndex = this._sourcePosition;
            // return false if dropped at operators on either side of the source tiles
            if (sourceIndexStr.charAt(0) === destIndexStr.charAt(0) &&
                ((bLeft && (sourceIndexStr == destIndexStr ||
                sourceParentModel.at(relativeSourceModelIndex + numberOfSourceTiles) === destTileModel)) ||
                (!bLeft && !sourceParentModel.at(relativeSourceModelIndex + numberOfSourceTiles)))) {
                isValid = false;
            }
            else {
                sourceTileModels = [];
                destNode = utilityMethods.tilesToNodes(root, [destTileModel])[0];
                for (index = 0; index < numberOfSourceTiles; index++) {
                    sourceTileModels.push(sourceParentModel.at(relativeSourceModelIndex + index));
                }
                sourceTileNodes = utilityMethods.tilesToNodes(root, sourceTileModels);
                sourceNodesParent = utilityMethods.getCommonParentFromMultiple(sourceTileNodes);

                if (sourceNodesParent.data === modelNameSpace.TileItem.OPERATORS.MULTIPLICATION &&
                    sourceNodesParent.children.length !== this._numberOfTiles) {
                    isValid = false;
                }
                else {
                    isValid = this._validateUsingOperatorString(sourceNodesParent, destNode);
                }
            }
            return isValid;
        },

        /**
        * Validates the reposition based on the operators in tree between source and destination.
        *
        * @method _validateUsingOperatorString
        * @param sourceNodesParent {Object} Tree node of source tile if single tile is being repositioned or else the
        * tree node of the common parent of marquee selected tiles.
        * @param destNode {Object} Tree node at the destination index.
        * @return {Boolean} True if valid. Else false.
        */
        _validateUsingOperatorString: function (sourceNodesParent, destNode) {
            var operatorsInBetween = utilityMethods.getOperatorStringsBetween(sourceNodesParent, destNode),
                operators = modelNameSpace.TileItem.OPERATORS,
                isValid = true,
                bLeft = this._bLeft;

            // reposition across the viniculum and through parentheses is not allowed
            if (operatorsInBetween.indexOf(operators.DIVISION) > -1 ||
                operatorsInBetween.indexOf(operators.PARENTHESES) > -1) {
                isValid = false;
            }
                // multiplication and addition are commutative
            else if (operatorsInBetween.length === 1 && operatorsInBetween[0] === operators.MULTIPLICATION) {
                isValid = false;    // but multipication swap not allowed
            }
            else if (operatorsInBetween[0] === operators.MULTIPLICATION &&
                (operatorsInBetween[1] === operators.ADDITION ||
                operatorsInBetween[1] === operators.EQUAL)) {
                // multipicand can't be taken out of multipication and repositioned with some addition operand
                isValid = false;
            }
            else if (destNode.data !== operators.EQUAL &&
                ((bLeft && destNode.prev() === null) || (!bLeft && destNode.next() === null))) {
                //if bLeft and dest node is left child in tree, then add to left of parent
                //if !(bLeft) and dest node is right child in tree, then add to right of parent
                isValid = this._validateUsingOperatorString(sourceNodesParent, destNode.parent);
            }
            return isValid;
        },

        /**
        * Repositions the tiles by removing if from the source position and adding them at the
        * destination position.
        *
        * @method _performResposition
        * @param modelRef {Object} The model on which the operation is being performed
        * @private
        */
        _performResposition: function _performResposition(modelRef) {
            if (this._sourceIndexString.charAt(0) === this._destIndexString.charAt(0)) {
                this._performIntraResposition(modelRef);
            }
            else {
                this._performInterResposition(modelRef);
                if (this.fractionToDecimalAllowed) {
                    this._setTilesForEndResult(modelRef, true);
                }
            }
        },

        /**
        * Repositions the tiles by removing if from the source position and adding them at the
        * destination position within an expression.
        *
        * @method _performIntraResposition
        * @param modelRef {Object} The model on which the operation is being performed
        * @private
        */
        _performIntraResposition: function _performIntraResposition(modelRef) {
            var sourceIndexStr = this._sourceIndexString,
                destIndexStr = this._destIndexString,
                numberOfTiles = this._numberOfTiles,
                index,
                operators = modelNameSpace.TileItem.OPERATORS,
                parent = utilityMethods.getParentTiles(modelRef, sourceIndexStr),
                relativeSourceModelIndex = this._sourcePosition,
                relativeDestModelIndex = this._destPosition,
                positionCorrection = 0,
                toRightOfTile = this._bLeft ? 0 : 1,
                tileModel, tileModels = [];
            // Since we are removing tiles first and then adding them
            //        the tiles' actual destination indices changes;
            //         this is corrected by subtracting the number of tiles.
            if (relativeSourceModelIndex < relativeDestModelIndex) {
                positionCorrection = -1 * numberOfTiles;
            }
            // remove tiles from source
            parent.at(0).set('operator', operators.ADDITION);
            for (index = 0; index < numberOfTiles; index++) {
                tileModel = parent.at(relativeSourceModelIndex + index);
                if (tileModel.get('operator') === null) {
                    tileModel.set('operator', operators.ADDITION);
                }
                tileModels[index] = tileModel;
            }
            parent.remove(tileModels);
            // add tiles at destination
            for (index = 0; index < numberOfTiles; index++) {
                parent.add(tileModels[index], { at: relativeDestModelIndex + index + positionCorrection + toRightOfTile });
            }
            parent.at(0).set('operator', null);
        },

        /**
        * Repositions the tiles by removing if from the source position and adding them at the
        * destination position across expressions.
        *
        * @method _performInterResposition
        * @param modelRef {Object} The model on which the operation is being performed
        * @private
        */
        _performInterResposition: function _performInterResposition(modelRef) {
            var sourceIndexStr = this._sourceIndexString,
                destIndexStr = this._destIndexString,
                operators = modelNameSpace.TileItem.OPERATORS,
                index,
                sourceParent = utilityMethods.getParentTiles(modelRef, sourceIndexStr),
                destParent = utilityMethods.getParentTiles(modelRef, destIndexStr),
                relativeSourceModelIndex = this._sourcePosition,
                relativeDestModelIndex = this._destPosition,
                toRightOfTile,
                staticZero,
                tileModel, tileModels = [];
            // remove tiles from source
            sourceParent.at(0).set('operator', operators.ADDITION);
            for (index = 0; index < this._numberOfTiles; index++) {
                tileModel = sourceParent.at(relativeSourceModelIndex + index);
                if (tileModel.get('operator') === null)
                    tileModel.set('operator', operators.ADDITION);
                this._negate(tileModel);
                tileModels[index] = tileModel;
            }
            sourceParent.remove(tileModels);
            this._convertDraggableZeroToStatic = false;
            if (sourceParent.length === 1) { // If destination expression contains only a zero tile, then remove "0"
                tileModel = sourceParent.at(0);   // and generate a static zero
                if (tileModel.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE &&
                   tileModel.get('base') === 0) {
                    sourceParent.remove(tileModel);
                    utilityMethods.checkAndGenerateStaticZeroForEquation(modelRef);
                    this._convertDraggableZeroToStatic = true;
                }
            }

            // if source parent becomes empty, add a "0" tile
            utilityMethods.checkAndGenerateStaticZeroForEquation(modelRef);
            //if (sourceParent.length === 0) {
            //    sourceParent.add(this._createLoneZeroTermTile());
            //}
            sourceParent.at(0).set('operator', null);
            // Add tiles at destination
            destParent.at(0).set('operator', operators.ADDITION);
            if (destParent.length === 1) { // If destination expression contains only a zero tile, then remove "0"
                tileModel = destParent.at(0);
                if (tileModel.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE &&
                   tileModel.get('base') === 0) {
                    destParent.remove(tileModel);
                    this._bLeft = true;
                }
            }
            toRightOfTile = this._bLeft ? 0 : 1;
            for (index = 0; index < this._numberOfTiles; index++) {
                tileModel = tileModels[index];
                tileModel.setIsLHS(!tileModel.get('isLHS'));
                destParent.add(tileModel, { at: relativeDestModelIndex + index + toRightOfTile });
            }
            destParent.at(0).set('operator', null);

            if (destParent.length === 1) { // If destination expression contains only a zero tile, then remove "0"
                tileModel = destParent.at(0);   // and generate a static zero
                if (tileModel.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE &&
                   tileModel.get('base') === 0) {
                    destParent.remove(tileModel);
                    utilityMethods.checkAndGenerateStaticZeroForEquation(modelRef);
                }
            }
        },

        /**
        * Negates the tile model. If it's a fraction, then each tile in the fraction's numerator is negated.
        *
        * @method _negate
        * @param tileModel {Object} The model of the tile item that needs to be negated.
        * @private
        */
        _negate: function _negate(tileModel) {
            var tileType = tileModel.get('type'),
                operators = modelNameSpace.TileItem.OPERATORS,
                types = MathInteractives.Common.Components.Models.EquationManagerPro.TileItem.TileType,
                base, tileArray, index, tile, minusIndex;
            // In case of multiplication, only the first multiplicand will be negated
            //                and the first multiplicand will be having a null or a '+' operator.
            if ([null, operators.ADDITION].indexOf(tileModel.get('operator')) > -1) {
                switch (tileType) {
                    case types.TERM_TILE:
                        base = tileModel.get('base');
                        if (typeof base === 'number') {
                            base *= -1;
                        }
                        else {// negate variable tile
                            minusIndex = base.indexOf(operators.SUBTRACTION);
                            base = (minusIndex > -1) ? base.slice(minusIndex + 1) : operators.SUBTRACTION + base;
                        }
                        tileModel.set('base', base);
                        break;
                    case types.FRACTION:
                        tileArray = tileModel.get('tileArray');
                        for (index = 0; index < tileArray.length; index++) {
                            tile = tileArray.at(index);
                            if (tile.get('isDenominator'))
                                break;
                            this._negate(tile);
                        }
                        break;
                    case types.PARENTHESES: // parentheses * parentheses case
                        tileArray = tileModel.get('tileArray');
                        for (index = 0; index < tileArray.length; index++) {
                            tile = tileArray.at(index);
                            this._negate(tile);
                        }
                        break;
                }
            }
        },

        _setTilesForEndResult: function _setTilesForEndResult(modelRef, setEndResult) {
            var lhsTiles, rhsTiles, lhsTile, rhsTile;
            if (modelRef) {
                lhsTiles = modelRef.get('tileArray').at(0).get('tileArray');
                rhsTiles = modelRef.get('tileArray').at(1) ? modelRef.get('tileArray').at(1).get('tileArray') : [];

                if (lhsTiles.length === 1 && rhsTiles.length === 1) {
                    lhsTile = lhsTiles.at(0);
                    rhsTile = rhsTiles.at(0);

                    if ((lhsTile.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE && rhsTile.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE && lhsTile.get('base') !== 't' && rhsTile.get('base') === 't') ||
                       (lhsTile.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE && rhsTile.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE && lhsTile.get('base') === 't' && rhsTile.get('base') !== 't')) {
                        lhsTile.set('endResult', setEndResult);
                        rhsTile.set('endResult', setEndResult);
                    }
                }
            }
        },

        /**
        * Undos the command
        *
        * @method undo
        * @param {Object} The model from which the command has to be undone
        * @public
        */
        undo: function (modelRef) {
            if (this._sourceIndexString.charAt(0) === this._destIndexString.charAt(0)) {
                this._undoIntraReposition(modelRef);
            }
            else {
                if (this.fractionToDecimalAllowed) {
                    this._setTilesForEndResult(modelRef, false);
                }
                this._undoInterReposition(modelRef);
            }
            modelRef.printExpr();
        },

        /**
        * Undos the intra-reposition
        *
        * @method _undoIntraReposition
        * @param {Object} The model from which the command has to be indone
        * @public
        */
        _undoIntraReposition: function _undoIntraReposition(modelRef) {
            var sourceIndexStr = this._sourceIndexString,
                destIndexStr = this._destIndexString,
                numberOfTiles = this._numberOfTiles,
                toRightOfTile = this._bLeft ? 0 : 1,
                operators = modelNameSpace.TileItem.OPERATORS,
                index,
                parent = utilityMethods.getParentTiles(modelRef, sourceIndexStr),
                relativeSourceModelIndex = this._sourcePosition,
                relativeDestModelIndex = this._destPosition,
                positionCorrection = 0,
                tileModel, tileModels = [];
            if (relativeSourceModelIndex < relativeDestModelIndex) {
                positionCorrection = -1 * numberOfTiles;
            }
            parent.at(0).set('operator', operators.ADDITION);
            for (index = 0; index < numberOfTiles; index++) {
                tileModel = parent.at(relativeDestModelIndex + index + positionCorrection + toRightOfTile);
                if (tileModel.get('operator') === null) {
                    tileModel.set('operator', operators.ADDITION);
                }
                tileModels[index] = tileModel;
            }
            parent.remove(tileModels);
            for (index = 0; index < numberOfTiles; index++) {
                parent.add(tileModels[index], { at: relativeSourceModelIndex + index });
            }
            parent.at(0).set('operator', null);
        },


        /**
        * Undos the intra-reposition
        *
        * @method _undoInterReposition
        * @param {Object} The model from which the command has to be indone
        * @public
        */
        _undoInterReposition: function _undoInterReposition(modelRef) {
            var sourceIndexStr = this._sourceIndexString,
                destIndexStr = this._destIndexString,
                numberOfTiles = this._numberOfTiles,
                operators = modelNameSpace.TileItem.OPERATORS,
                index,
                sourceParent = utilityMethods.getParentTiles(modelRef, sourceIndexStr),
                destParent = utilityMethods.getParentTiles(modelRef, destIndexStr),
                relativeSourceModelIndex = this._sourcePosition,
                relativeDestModelIndex = this._destPosition,
                toRightOfTile = this._bLeft ? 0 : 1,
                tileModel, tileModels = [];
            if (destParent.length === 1) { // If destination expression contains a static zero tile, then replace with "0"
                tileModel = destParent.at(0);   // tile.
                if (tileModel.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE &&
                   tileModel.get('base') === 0) {
                    destParent.remove(tileModel);
                    tileModel = modelNameSpace.TileItem.createTileItem({
                        type: modelNameSpace.TileItem.TileType.TERM_TILE,
                        base: 0,
                        operator: null,
                        isDraggable: true,
                        isDroppable: true,
                        ignoreMarquee: true,
                        isLHS: tileModel.get('isLHS')
                    });
                    destParent.add(tileModel);
                }
            }
            destParent.at(0).set('operator', operators.ADDITION);
            for (index = 0; index < numberOfTiles; index++) {
                tileModel = destParent.at(relativeDestModelIndex + index + toRightOfTile);
                if (tileModel.get('operator') === null) {
                    tileModel.set('operator', operators.ADDITION);
                }
                this._negate(tileModel);
                tileModels[index] = tileModel;
            }
            destParent.remove(tileModels);
            utilityMethods.checkAndGenerateStaticZeroForEquation(modelRef);
            //if (destParent.length === 0) {
            //    destParent.add(this._createLoneZeroTermTile());
            //}
            destParent.at(0).set('operator', null);

            if (this._convertDraggableZeroToStatic) {
                tileModel = sourceParent.at(0);
                sourceParent.remove(tileModel);
                tileModel = modelNameSpace.TileItem.createTileItem({
                    type: modelNameSpace.TileItem.TileType.TERM_TILE,
                    base: 0,
                    operator: null,
                    isDraggable: true,
                    isDroppable: true,
                    ignoreMarquee: true,
                    isLHS: tileModel.get('isLHS')
                });
                sourceParent.add(tileModel);
            }
            sourceParent.at(0).set('operator', operators.ADDITION);
            if (!this._convertDraggableZeroToStatic && sourceParent.length === 1) {
                tileModel = sourceParent.at(0);
                if (tileModel.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE &&
                   tileModel.get('base') === 0) {
                    sourceParent.remove(tileModel);
                }
            }
            for (index = 0; index < numberOfTiles; index++) {
                tileModel = tileModels[index];
                tileModel.setIsLHS(!tileModel.get('isLHS'));
                sourceParent.add(tileModel, { at: relativeSourceModelIndex + index });
            }
            sourceParent.at(0).set('operator', null);
        }
    }, {
    });
})(window.MathInteractives);