(function (MathInteractives) {
    'use strict';

    var modelNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro,
        utilityMethods = modelNameSpace.EquationManagerPro.Utils;

    /**
    * Comnine command is responsible fot the combination and cancellation of tiles
    * @class CombineCommand
    * @module EquationManagerPro
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    * @extends MathInteractives.Common.Components.Models.EquationManagerPro.BaseCommand
    * @type Object
    * @constructor
    */

    modelNameSpace.CombineCommand = modelNameSpace.BaseCommand.extend({

        /**
        * An array of source Tiles
        *
        * @attribute sourceTiles
        * @type Array
        * @default null
        **/
        sourceTiles: null,

        /**
        * An array of dest Tiles
        *
        * @attribute destTiles
        * @type Array
        * @default null
        **/
        destTiles: null,

        /**
        * The source term position
        *
        * @attribute sourcePos
        * @type String
        * @default null
        **/
        sourcePos: null,

        /**
        * The dest term position
        *
        * @attribute destPos
        * @type String
        * @default null
        **/
        destPos: null,

        /**
        * Whether the operator of a paticular term has been changed.
        * For undo change the operator of the tile at source pos first to the original.
        *
        * @attribute operatorChangedSP
        * @type String
        * @default null
        **/
        operatorChangedSP: null,

        /**
        * The source Object containing all source related details
        *
        * @attribute sourceObj
        * @type Object
        * @default null
        **/
        sourceObj: null,

        /**
        * The dest Object containing all dest related details
        *
        * @attribute destObj
        * @type Object
        * @default null
        **/
        destObj: null,

        /**
        * Indicates ther number of tiles that are inserted
        *
        * @attribute numOfTilesInserted
        * @type Number
        * @default 0
        **/
        numOfTilesInserted: 0,

        /**
        * Indicates the operation that was performed.
        *
        * @attribute operationPerformed
        * @type String
        * @default null
        **/
        operationPerformed: null,

        /**
        * Whether the there was a lone 0 present in the source parent tiles that was converted to a static one.
        * @attribute staticZeroAdded
        * @type Boolean
        * @default false
        **/
        sourceStaticZeroAdd: false,

        /**
        *  Whether the there was a lone 0 present in the dest parent tiles that was converted to a static one.
        * @attribute staticZeroAdded
        * @type Boolean
        * @default false
        **/
        destStaticZeroAdd: false,

        /**
        * Whether the removed term was from source and dest parents or only from source
        * @attribute removedSingleTerm
        * @type Boolean
        * @default false
        **/
        removedSingleTerm: false,

        convertedToZero: null,

        /**
        * Initializes the Break exponent command
        *
        * @method initialize
        */
        initialize: function () {
            this.sourceTiles = [];
            this.destTiles = [];
        },

        /**
		 * Initializes the default model attributes
		 *
		 * @param   {Object} modelRef It is the reference to the equation view model
		 * @param   {Object} data     the data got by the command from the equation manager
		 * @returns {Object} An object containing the parent tiles of both the source and the destination
		 *
		 * @method _initializeModelAttributes
         * @private
		 */
        _initializeModelAttributes: function (modelRef, data) {
            var sourceIndex = data.source.index,
                sourceTileCount = data.source.numOfTiles,
                destIndex = data.dest.index,
                destTileCount = data.dest.numOfTiles,
                parentTileWrapper = {};

            this.sourceObj = data.source;
            this.destObj = data.dest;

            this.sourcePos = parseInt(utilityMethods.getSourceWrtParent(sourceIndex));
            this.destPos = parseInt(utilityMethods.getSourceWrtParent(destIndex));

            parentTileWrapper.sourceParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(sourceIndex));
            parentTileWrapper.destParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(destIndex));

            this._populateConcernedTilesArray(parentTileWrapper.sourceParent.get('tileArray'), sourceTileCount, 'source');
            this._populateConcernedTilesArray(parentTileWrapper.destParent.get('tileArray'), destTileCount, 'dest');

            return parentTileWrapper;
        },

        /**
		 * Fills and returns the array with the concerned tiles which are tp be deleted or combined and also validates marquee selection
		 *
		 * @method _populateConcernedTilesArray
		 * @param   {Object}  parentTiles The parent tiles collection of the concerned tiles
		 * @param   {Number}  tileCount   The number of tiles to be considered incase of marquee select
		 * @param   {String}  str         The string representing which prefix to use
		 * @returns {Boolean} Whteher marquee selection if present is valid or not
		 */
        _populateConcernedTilesArray: function (parentTiles, tileCount, str) {
            var index;
            for (index = 0; index < tileCount; index++) {
                this[str + 'Tiles'].push(parentTiles.at(this[str + 'Pos'] + index));
            }
        },

        /**
        * Executes the Combine Command
        *
        * @param {Object} consisting the allowed operation and prime limit
        * @param {Object} the model on which the operation is being performed
        * @param {Object} the data required to perform the Combine Command
        *
        * @method execute
        **/
        execute: function (rules, modelRef, data) {
            var parentTileWrapper = this._initializeModelAttributes(modelRef, data),
                operators = modelNameSpace.TileItem.OPERATORS,
                commonNodeObj = {};
            //a noolena to distinguish between test the solution and the rest and the rest
            this.isIotaPresent = rules.isIotaAllowed;
            this.fractionToDecimalAllowed = rules.fractionToDecimalAllowed;
            if (parentTileWrapper.sourceParent == null || parentTileWrapper.destParent == null) {
                return false;
            }
            commonNodeObj = this._getCommonNodeObject(data.root);

            if ([operators.ADDITION, operators.EQUAL].indexOf(commonNodeObj.commonParent.data) !== -1) {
                this.operationPerformed = operators.ADDITION;
                return this._performAddition(data.root, parentTileWrapper, commonNodeObj, modelRef);
            }
            // no '=' as that will be accross the '=' sign.
            if ([operators.MULTIPLICATION].indexOf(commonNodeObj.commonParent.data) !== -1) {
                this.operationPerformed = operators.MULTIPLICATION;
                return this._performMultiplication(data.root, parentTileWrapper, commonNodeObj, modelRef);
            }
            if ([operators.DIVISION].indexOf(commonNodeObj.commonParent.data) !== -1) {
                this.operationPerformed = operators.MULTIPLICATION;
                return this._performDivision(data.root, modelRef, parentTileWrapper, commonNodeObj);
            }
            return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
        },

        /**
         * Gets common node object of source and the dest, if they are multilple tiles, else will return that tile node itself from the tree.
         * @method _getCommonNodeObject
         * @private
         *
         * @param   {MathInteractives.Common.Components.Models.EquationManagerPro.TreeNode} root The root node of the tree
         * @returns {Object}                                                                The common node of source, dest and common of source and dest.
         */
        _getCommonNodeObject: function _getCommonNodeObject(root) {
            var sourceNodes, destNodes, sourceCommon, destCommon, commonParent;

            sourceNodes = utilityMethods.tilesToNodes(root, this.sourceTiles);
            destNodes = utilityMethods.tilesToNodes(root, this.destTiles);

            sourceCommon = utilityMethods.getCommonParentFromMultiple(sourceNodes);
            destCommon = utilityMethods.getCommonParentFromMultiple(destNodes);

            commonParent = utilityMethods.getCommonParent(sourceCommon, destCommon);

            return {
                sourceCommon: sourceCommon,
                destCommon: destCommon,
                commonParent: commonParent
            };
        },

        /******************************************************************* DIVISION SECTION STARTS ***************************************************************************/

        /**
         * it would perform division among terms.
         * @method _performDivision
         * @private
         *
         * @param   {Object}  root              The tree root.
         * @param   {Object}  parentTileWrapper The object containing the source and dest parent tiles.
         * @param   {Object}  commonNodeObj     The object which has common tree nodes of source and dest.
         * @returns {Boolean} [[Description]]
         */
        _performDivision: function _performDivision(root, modelRef, parentTileWrapper, commonNodeObj) {
            var sourceNode = commonNodeObj.sourceCommon,
                destNode = commonNodeObj.destCommon,
                betweenOperators = utilityMethods.getOperatorStringsBetween(sourceNode, destNode),
                Operators = modelNameSpace.TileItem.OPERATORS;

            // '+' operator check not required as if there is a '+' sign, '^' will be present too.
            // '^', multiplication of terms in and out of parentheses not allowed.
            if (betweenOperators.indexOf(Operators.PARENTHESES) !== -1 || parentTileWrapper.sourceParent !== parentTileWrapper.destParent) {
                return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
            }
            //the source tile has to be from the denominator and dropped on the numerator. And it can be only one tile.
            if (this.sourceTiles[0].get('isDenominator') === false) {
                return false;
            }
            //if the source node is more than one tile.
            if (sourceNode.isLeaf() === false) {
                return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
            }
            //means that the concerned tile in the numerator has to be divided.
            if (destNode.isLeaf()) {
                return this._performTermMultiplication(parentTileWrapper, modelRef);
            }
                //this is the case of easter egg divisions
            else {
                return this._performEasterEggDivision(root, parentTileWrapper, sourceNode, destNode);
            }

        },

        /**
         * performs easter egg division
         * @method _performEasterEggDivision
         * @private
         *
         * @param   {Object}  parentTileWrapper The object containing the source and dest parent tiles.
         * @param   {Object}  sourceNode        The source common node of all source tiles.
         * @param   {Object}  destNode          The dest common node of all dest tiles.
         * @returns {Boolean} Whether the operation is successful or not.
         */
        _performEasterEggDivision: function _performEasterEggDivision(root, parentTileWrapper, sourceNode, destNode) {
            var modelRef = root.collectionData,
                parentTiles = parentTileWrapper.sourceParent.get('tileArray'), //the fraction tiles
                sourceTile = this.sourceTiles[0], //the tile to be divided by
                tilesToDivideInNumerator = [],
                Operators = modelNameSpace.TileItem.OPERATORS,
                sourceBase = sourceTile.get('base'),
                fractionParent, cloned, clonedArray = [];

            tilesToDivideInNumerator = this._getDivisibilityInNumerator(sourceBase);
            if (tilesToDivideInNumerator.length === 0) {
                return this._emulateTakeCommonOut(root, parentTileWrapper, sourceNode);
            }
            else {
                cloned = this._getFractionAfterDivision(parentTileWrapper.sourceParent, tilesToDivideInNumerator, sourceBase);
                this._updateParentCollection(modelRef, parentTileWrapper.sourceParent, [cloned], 1, 0);
                return true;
            }
        },

        /**
         * emulate take common out command when easter egg division is not possible
         * @method _emulateTakeCommonOut
         * @private
         *
         * @param   {Object}  root              The Tree root
         * @param   {Object}  parentTileWrapper The object containing the source and dest parents
         * @param   {Object}  sourceNode        The source tree node
         * @returns {Boolean} The success of the operation
         */
        _emulateTakeCommonOut: function _emulateTakeCommonOut(root, parentTileWrapper, sourceNode) {
            var modelRef = root.collectionData,
                sourceTile = sourceNode.data,
                coefficientNodes = [],
                operators = modelNameSpace.TileItem.OPERATORS,
                fractionNode, parenthesesNode,
                fractionClone, parClone, cloned, clonedArray = [];

            fractionNode = this._getFractionNodeFromChild(sourceNode);

            parenthesesNode = fractionNode.parent.data === operators.PARENTHESES ? fractionNode.parent : null;
            //that means rhat we have to find the coefficients of the parentheses and apply a fraction to them
            if (parenthesesNode) {
                parClone = parenthesesNode.collectionData.deepClone();
                coefficientNodes = this._getCoeffTiles(parenthesesNode);
                //check if there are no coeffs
                if (coefficientNodes.length === 0) {
                    clonedArray = this._makeFractionTile(sourceTile, parClone);
                    this._updateParentCollection(modelRef, parentTileWrapper.sourceParent, clonedArray, 2, 0);
                    return true;
                }
                    //check if the coeff is already a fraction
                else if (coefficientNodes[0].data === operators.DIVISION) {
                    clonedArray = this._insertInTileFraction(coefficientNodes[0], sourceTile);
                    //parentheses will have only one child and that will be the fraction tile.
                    fractionClone = this._updateFractionTile(parClone.get('tileArray').at(0));
                    clonedArray.push(parClone);
                    this._updateParentCollection(modelRef, parentTileWrapper.sourceParent, clonedArray, 2, coefficientNodes.length);
                    return true;
                }
                    //coeff not a fraction. Make them a fraction.
                else {
                    clonedArray = this._convertCoeffToFraction(coefficientNodes, sourceTile);
                    //parentheses will have only one child and that will be the fraction tile.
                    fractionClone = this._updateFractionTile(parClone.get('tileArray').at(0));
                    clonedArray.push(parClone);
                    this._updateParentCollection(modelRef, parentTileWrapper.sourceParent, clonedArray, 2, coefficientNodes.length);
                    return true;
                }
            }
            else {
                fractionClone = fractionNode.collectionData.deepClone();
                parClone = this._wrapFractionIsideParentheses(fractionClone, sourceTile);
                clonedArray = this._makeFractionTile(sourceTile, parClone);
                this._updateParentCollection(modelRef, parentTileWrapper.sourceParent, clonedArray, 1, 0);
                return true;
            }
        },

        /**
         * wrap fraction iside parentheses
         * @method _wrapFractionIsideParentheses
         * @private
         *
         * @param   {Object} fractionClone The fraction clone
         * @param   {Object} sourceTile    The source Tile
         * @returns {Array}  The parentheses in which the fraction is wrapped.
         */
        _wrapFractionIsideParentheses: function _wrapFractionIsideParentheses(fractionClone, sourceTile) {
            var parentheses;
            parentheses = this._createParenthesesTile(fractionClone.get('operator'), fractionClone.get('isLHS'));
            fractionClone.set('operator', null);
            parentheses.set('tileArray', new Backbone.Collection([fractionClone]));
            return parentheses;
        },

        /**
         * Inserts a tile in the fraction
         * @method _wrapFractionIsideParentheses
         * @private
         *
         * @param   {Object} fractionNode  The fraction tree node
         * @param   {Object} sourceTile    The source Tile
         * @returns {Array}  The fraction after inserting the tile.
         */
        _insertInTileFraction: function _insertInTileFraction(fractionNode, sourceTile) {
            var newFractionCoeff, newFracTiles, cloned,
                operators = modelNameSpace.TileItem.OPERATORS;
            newFractionCoeff = fractionNode.collectionData.deepClone();
            newFracTiles = newFractionCoeff.get('tileArray');
            cloned = sourceTile.deepClone();
            cloned.set('operator', operators.MULTIPLICATION);
            newFracTiles.add(cloned);
            return [newFractionCoeff];
        },

        /**
         * Creates a new fraction tile.
         * @method _makeFractionTile
         * @private
         *
         * @param   {Object} sourceTile The source Tile
         * @param   {Object} parClone   The cloned parentheses model
         * @returns {Array}  The array consisting of all the cloned models.
         */
        _makeFractionTile: function _makeFractionTile(sourceTile, parClone) {
            var fracTile, fracOperator, fracLHS,
                operators = modelNameSpace.TileItem.OPERATORS,
                fractionClone, cloned, clonedArray = [];

            fracOperator = parClone.get('operator');
            fracLHS = parClone.get('isLHS');

            //create fraction tile.
            fracTile = this._createFractionTile(fracOperator, fracLHS);
            //create the numerator 1.
            clonedArray.push(this._createTermTile(1, null, fracLHS, false));
            cloned = sourceTile.deepClone();
            cloned.set('operator', null);
            clonedArray.push(cloned);

            fracTile.set('tileArray', new Backbone.Collection(clonedArray));
            clonedArray = [fracTile];

            //the parentheses would always be multiplied.
            parClone.set('operator', operators.MULTIPLICATION);
            fractionClone = this._updateFractionTile(parClone.get('tileArray').at(0));
            clonedArray.push(parClone);
            return clonedArray;
        },

        /**
         * After the removal of a concerned tile, the new fraction denominator has to be checked for their operators.
         * @method _makeFractionTile
         * @private
         *
         * @param   {Object} fractionClone   The cloned fraction model
         * @returns {Array}  The array consisting of all the cloned models.
         */
        _updateFractionTile: function _updateFractionTile(fractionClone) {
            var clonedFracTiles = fractionClone.get('tileArray'),
                index, currentTile, nextTile;
            //get the tile that is the divisor
            currentTile = clonedFracTiles.at(this.sourcePos);

            //once the divisor is removed, the operators of the next tile has to be changed
            if ((nextTile = clonedFracTiles.at(this.sourcePos + 1)) && nextTile) {
                nextTile.set('operator', currentTile.get('operator'));
            }
            clonedFracTiles.remove(currentTile);
            return fractionClone;
        },

        /**
         * All the coefficients of the parentheses are converted to a fraction tile.
         * @method _convertCoeffToFraction
         * @private
         *
         * @param   {Array}  coeffNodes The array od coefficient nodes
         * @param   {Object} sourceTile The source tile
         * @returns {Array}  After converting all the coefficients to a fraction.
         */
        _convertCoeffToFraction: function _convertCoeffToFraction(coeffNodes, sourceTile) {
            var index, validTerms = [], invalidTerms = [],
                operators = modelNameSpace.TileItem.OPERATORS,
                firstCoeff = _.isString(coeffNodes[0].data) ? coeffNodes[0].collectionData : coeffNodes[0].data,
                fracTile, fracOperator, fracLHS, cloned, clonedArray = [];

            //get the operators and isLHS for the newly created fraction.
            fracOperator = firstCoeff.get('operator');
            fracLHS = firstCoeff.get('isLHS');

            //segragate the coeff to parentheses and non parentheses. As parentheses would never be a part of the fraction
            for (index = 0; index < coeffNodes.length; index++) {
                if (coeffNodes[index].data === operators.PARENTHESES) {
                    invalidTerms.push(coeffNodes[index]);
                }
                else {
                    validTerms.push(coeffNodes[index]);
                }
            }
            //create fraction tile.
            fracTile = this._createFractionTile(fracOperator, fracLHS);
            //deep clone all existing models, and add them to the fraction.
            for (index = 0; index < validTerms.length; index++) {
                clonedArray.push(validTerms[index].data.deepClone());
            }
            //if there was no existing coeff, then add a 1 tile.
            if (clonedArray.length === 0) {
                clonedArray.push(this._createTermTile(1, null, fracLHS, false));
            }
            else {
                //1st model in the fraction collection
                clonedArray[0].set('operator', null);
            }
            //add denominator.
            cloned = sourceTile.deepClone();
            cloned.set('operator', null);
            clonedArray.push(cloned);
            fracTile.set('tileArray', new Backbone.Collection(clonedArray));
            //reset cloned array, consisting only the frac tile, as thats whats to be returned.
            clonedArray = [fracTile];
            //add the invalid: parentheses terms to the end of the cloned tiles, as it would stay as is.
            for (index = 0; index < invalidTerms.length; index++) {
                cloned = invalidTerms[index].collectionData.deepClone();
                cloned.set('operator', operators.MULTIPLICATION);
                clonedArray.push(cloned);
            }
            return clonedArray;
        },

        /**
         * Gets coeff tiles of a given node.
         * @method _getCoeffTiles
         * @private
         *
         * @param   {Object} node The tree node whose coeffcients have to be found out.
         * @returns {Array}  The array consisting all the coefficient nodes.
         */
        _getCoeffTiles: function _getCoeffTiles(node) {
            var parent = node.parent, index, coeffArray = [],
                children = parent.children,
                mulOp = modelNameSpace.TileItem.OPERATORS.MULTIPLICATION,
                nodeIndex = children.indexOf(node);
            if (parent.data === mulOp) {
                for (index = 0; index < nodeIndex; index++) {
                    coeffArray.push(children[index]);
                }
            }
            return coeffArray;
        },

        /**
         * Gets fraction node from child
         * @method _getFractionNodeFromChild
         * @private
         *
         * @param   {Object} sourceNode The tree source node.
         * @returns {Object} Will return the fraction tree node.
         */
        _getFractionNodeFromChild: function _getFractionNodeFromChild(sourceNode) {
            var parent = sourceNode.parent,
                divOp = modelNameSpace.TileItem.OPERATORS.DIVISION;
            while (parent.data !== divOp) {
                parent = parent.parent;
            }
            return parent;
        },

        /**
         * Gets fraction after division of easter egg
         * @method _getFractionAfterDivision
         * @private
         *
         * @param   {Object} fractionParent The parent of the fraction
         * @param   {Array}  tilesToDivide  The numerator tile that are going to be divided
         * @param   {Number} base           The divisor
         * @returns {Object} The fraction after division
         */
        _getFractionAfterDivision: function _getFractionAfterDivision(fractionParent, tilesToDivide, base) {
            var clonedFrac = fractionParent.deepClone(), //the fration tile.
                clonedFracTiles = clonedFrac.get('tileArray'),
                index, currentTile, nextTile, currentBase;
            //get the tile that is the divisor
            currentTile = clonedFracTiles.at(this.sourcePos);

            //once the divisor is removed, the operators of the next tile has to be changed
            if ((nextTile = clonedFracTiles.at(this.sourcePos + 1)) && nextTile) {
                nextTile.set('operator', currentTile.get('operator'));
            }
            clonedFracTiles.remove(currentTile);
            //divide the numerator tiles.
            for (index = 0; index < tilesToDivide.length; index++) {
                currentTile = clonedFracTiles.at(tilesToDivide[index]);
                currentBase = currentTile.get('base');
                //you will only get a string input here iff its -1 or 1
                if (_.isString(currentBase)) {
                    if (base === -1) {
                        currentTile.set('base', this._invertVariable(currentBase));
                    }
                }
                else {
                    currentTile.set('base', currentBase / base);
                }
            }
            return clonedFrac;
        },

        /**
         * Gets divisibility of the denominator term in all numerator terms
         * @method _getDivisibilityInNumerator
         * @private
         *
         * @param   {Number} base     The dividing number
         * @returns {Array}  The array of indices which have to divided in the array.
         */
        _getDivisibilityInNumerator: function _getDivisibilityInNumerator(base) {
            var tilesToDivideInNumerator = [],
                destTiles = this.destTiles, //the numerator tiles.
                Operators = modelNameSpace.TileItem.OPERATORS,
                hasDivided = false, exactDivideFound = false, absDivideFound = false,
                index, currentTerm, currentOperator, currentBase;
            for (index = 0; index < destTiles.length;) {
                if (index !== 0 && hasDivided === false) {
                    return [];
                }
                //reset booleans.
                hasDivided = false;
                exactDivideFound = false;
                absDivideFound = false;
                //will loop individually through each multiplicative group finding out which is the term to divide.
                do {
                    //if a term is found which is the same as the denominator,
                    //then no need to find more numbers which can be divided
                    if (exactDivideFound === true) {
                        index++;
                        continue;
                    }
                    currentTerm = destTiles[index];
                    currentOperator = currentTerm.get('operator');
                    currentBase = currentTerm.get('base');
                    //if exact same term is found.
                    if (currentBase === base) {
                        if (hasDivided) {
                            //cause its possible that there existed a multiple of the given base.
                            // which was in the same mul group and its index was pushed in the array. Hence, pop that one.
                            tilesToDivideInNumerator.pop();
                            hasDivided = false;
                        }
                        exactDivideFound = true;
                    }
                        //if abs value is the same
                    else if (Math.abs(currentBase) === Math.abs(base)) {
                        if (hasDivided) {
                            tilesToDivideInNumerator.pop();
                            hasDivided = false;
                        }
                        absDivideFound = true;
                    }
                    //checking if the number is divisibble and no other number was divided in the ssame mul group
                    if ((currentBase % base === 0 || (Math.abs(base) === 1 && _.isString(currentBase))) && hasDivided === false) {
                        tilesToDivideInNumerator.push(index);
                        hasDivided = true;
                    }
                    //increment counter.
                    index++;
                } while (destTiles[index] && destTiles[index].get('operator') === Operators.MULTIPLICATION);

                //for the last term, the for loop would break. So to check that in the last mul group too, there was a term that was divided.
                if (hasDivided === false) {
                    return [];
                }
            }
            //return an array of indices, where it has to be divided.
            return tilesToDivideInNumerator;
        },

        /*************************************************************** DIVISION SECTION ENDS *****************************************************************************/
        /************************************************************* MULTIPLICATION SECTION STARTS ************************************************************************/

        /**
         * perform multiplication between two terms. Is the parent method which will call related methods.
         * @method _performMultiplication
         * @private
         *
         * @param   {Object}  root              The tree root.
         * @param   {Object}  parentTileWrapper The object containing the source and dest parent tiles.
         * @param   {Object}  commonNodeObj     The object which has common tree nodes of source and dest.
         * @returns {Boolean} [[Description]]
         */
        _performMultiplication: function _performMultiplication(root, parentTileWrapper, commonNodeObj, modelRef) {
            var sourceNode = commonNodeObj.sourceCommon,
                destNode = commonNodeObj.destCommon,
                numerator, denominator,
                betweenOperators = utilityMethods.getOperatorStringsBetween(sourceNode, destNode),
                Operators = modelNameSpace.TileItem.OPERATORS;

            // '+' operator check not required as if there is a '+' sign, '^' will be present too.
            // '^', multiplication of terms in and out of parentheses not allowed.
            if (betweenOperators.indexOf(Operators.PARENTHESES) !== -1 || betweenOperators.indexOf(Operators.ADDITION) !== -1) {
                return false;
                //return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
            }
            //cases like 3*4, 3i*4i, sqrt(4)*sqrt(4)
            if (sourceNode.isLeaf() && destNode.isLeaf()) {
                return this._performTermMultiplication(parentTileWrapper, modelRef);
            }
                //if the source node is a term tile and the dest node is a parentheses.
            else if ((sourceNode.isLeaf()) && destNode.data === Operators.PARENTHESES) {
                return this._performTermParenthesesMultiplication(parentTileWrapper, sourceNode, destNode);
            }
            else if (sourceNode.data === Operators.PARENTHESES && destNode.data === Operators.PARENTHESES) {
                return this._performTwoParenthesesMultiplication(parentTileWrapper, sourceNode, destNode);
            }
                //if the dest node is a term tile or fraction and the source node is a parentheses.
            else if ((destNode.isLeaf() || destNode.data === Operators.DIVISION) && sourceNode.data === Operators.PARENTHESES) {
                return modelNameSpace.CommandFactory.EXIT_CODE.APPLY_COEFFECIENTS;
            }
            else if (sourceNode.data === Operators.MULTIPLICATION && destNode.data === Operators.PARENTHESES) {
                return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
            }
            else if (sourceNode.data === Operators.DIVISION && destNode.data === Operators.PARENTHESES) {
                numerator = sourceNode.children[0];
                denominator = sourceNode.children[1];
                if (numerator.isLeaf() && denominator.isLeaf()) {
                    return this._performFractionParenthesesMultiplication(parentTileWrapper, sourceNode, destNode);
                }
                else {
                    return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                }
            }
            else {
                if (this.isIotaPresent) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                }
                else {
                    return this._returnFeedbackForNonFractionVariableCase(this.sourceTiles);
                }
            }
        },

        /**
         * perform multiplication between a term tile and a parentheses tile.
         * @method _performTwoParenthesesMultiplication
         * @private
         *
         * @param   {Object}  parentTileWrapper The object containing the source and dest parent tiles.
         * @param   {Object}  sourceNode        The source common node of all source tiles.
         * @param   {Object}  destNode          The dest common node of all dest tiles.
         * @returns {Boolean} Whether the operation is successful or not.
         */
        _performTwoParenthesesMultiplication: function _performTwoParenthesesMultiplication(parentTileWrapper, sourceNode, destNode) {
            var sourceParentTiles = parentTileWrapper.sourceParent.get('tileArray'),
                destParentTiles = parentTileWrapper.destParent.get('tileArray'),
                sourceTile = this.sourceTiles[0], //the parentheses tile.
                destTile = this.destTiles[0], //the parentheses tile.
                Operators = modelNameSpace.TileItem.OPERATORS,
                sourceParCollection,
                clonedArray = [], clonedSourcePar, clonedDestPar, toAddParentheses = false, index;

            //in the case of multiplication the source and dest parent tiles will be the same.
            //also in the case of fraction interactives 2 parentheses will not be able to be solved EVER. According to the given conditions.
            if (sourceParentTiles !== destParentTiles || utilityMethods._hasVariableTermTile(sourceNode, utilityMethods._isVariableTermTile) || utilityMethods._hasVariableTermTile(destNode, utilityMethods._isVariableTermTile)) {
                return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
            }

            toAddParentheses = this._checkToAddParentheses(destNode, destTile.get('isLHS'));

            clonedSourcePar = sourceTile.deepClone();
            sourceParCollection = clonedSourcePar.get('tileArray');

            for (index = 0; index < sourceParCollection.length; index++) {
                clonedArray.push(sourceParCollection.at(index));
                while (sourceParCollection.at(index + 1) && sourceParCollection.at(index + 1).get('operator') !== Operators.ADDITION) {
                    index++;
                    clonedArray.push(sourceParCollection.at(index));
                }

                clonedDestPar = destTile.deepClone();
                //the entire parentheses with which the other terms would be multiplied.
                clonedDestPar.set('operator', Operators.MULTIPLICATION);
                clonedArray.push(clonedDestPar);
            }
            if (toAddParentheses) {
                toAddParentheses.set('tileArray', new Backbone.Collection(clonedArray));
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, [toAddParentheses]);
            }
            else {
                this._validateAndChangeOperators(sourceTile, destTile, clonedArray, sourceParentTiles);
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
            }
            return true;
        },

        _checkToAddParentheses: function _checkToAddParentheses(destNode, isLHS) {
            var parent = destNode.parent,
                Operators = modelNameSpace.TileItem.OPERATORS;
            //the parent will be the '*' node which is the common parent of both the parentheses.
            if (parent.children.length > 2) {
                //if more than 2 children, there will always be a coefficient. so safe to assume that the operator of the parentheses will be multiplication.
                return this._createParenthesesTile(Operators.MULTIPLICATION, isLHS);
            }
            return false;
        },

        /**
        * Perform multiplication between a fraction tile and a parentheses tile.

        * @method _performTermParenthesesMultiplication
        * @private
        *
        * @param   {Object}  parentTileWrapper The object containing the source and dest parent tiles.
        * @param   {Object}  sourceNode        The source node - fraction node.
        * @param   {Object}  destNode          The dest node - parentheses node.
        * @returns {Boolean} Whether the operation is successful or not.
        */
        _performFractionParenthesesMultiplication: function _performFractionParenthesesMultiplication(parentTileWrapper, sourceNode, destNode) {
            var sourceParent = parentTileWrapper.sourceParent,
                sourceParentTiles = sourceParent.get('tileArray'),
                destParentTiles = parentTileWrapper.destParent.get('tileArray'),
                numeratorNode = sourceNode.children[0],
                denominatorNode = sourceNode.children[1],
                numerator = numeratorNode.data,
                denominator = denominatorNode.data,
                sourceTile = this.sourceTiles[0],
                destTile = this.destTiles[0], //the parentheses tile.
                Operators = modelNameSpace.TileItem.OPERATORS,
                destChildOperatorNode = destNode.children[0],
                clonedArray = [], clonedParentheses, clonedSourceTerm;

            //multiply by zero case.
            if (numerator.get('base') === 0) {
                clonedSourceTerm = numerator.deepClone();
                clonedSourceTerm.set({
                    operator: destTile.get('operator'),
                    isLHS: destTile.get('isLHS'),
                    iotaExponent: null
                });
                clonedArray = this._validateAndChangeOperators(sourceTile, destTile, [numerator], sourceParentTiles);
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }
            clonedParentheses = destTile.deepClone();
            clonedSourceTerm = sourceTile.deepClone();

            // distribute the denominator
            clonedParentheses = this._applyTermInsideBigTermWithFraction(clonedSourceTerm.get('tileArray').at(1), clonedParentheses);

            // distribute the numerator
            clonedParentheses = this._applyTermInsideBigTerm(clonedSourceTerm.get('tileArray').at(0), clonedParentheses);

            clonedArray = [clonedParentheses];
            if (sourceParentTiles === destParentTiles) {
                //the case of multiplication of simple term, which is not in a fraction.
                clonedArray = this._validateAndChangeOperators(sourceTile, destTile, clonedArray, sourceParentTiles);
            }
            this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
            return true;
        },

        /**
         * perform multiplication between a term tile and a parentheses tile.
         * @method _performTermParenthesesMultiplication
         * @private
         *
         * @param   {Object}  parentTileWrapper The object containing the source and dest parent tiles.
         * @param   {Object}  sourceNode        The source common node of all source tiles.
         * @param   {Object}  destNode          The dest common node of all dest tiles.
         * @returns {Boolean} Whether the operation is successful or not.
         */
        _performTermParenthesesMultiplication: function _performTermParenthesesMultiplication(parentTileWrapper, sourceNode, destNode) {
            var sourceParent = parentTileWrapper.sourceParent,
                sourceParentTiles = sourceParent.get('tileArray'),
                destParentTiles = parentTileWrapper.destParent.get('tileArray'),
                sourceTile = this.sourceTiles[0],
                destTile = this.destTiles[0], //the parentheses tile.
                Operators = modelNameSpace.TileItem.OPERATORS,
                destChildOperatorNode = destNode.children[0],
                clonedArray = [], clonedParentheses, clonedSourceTerm;

            //multiply by zero case.
            if (sourceTile.get('base') === 0) {
                clonedArray = this._performMultiplicationWithZeroBase(sourceTile, destTile, false);
                clonedArray = this._validateAndChangeOperators(sourceTile, destTile, clonedArray, sourceParentTiles);
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }
            clonedParentheses = destTile.deepClone();
            clonedSourceTerm = sourceTile.deepClone();

            //source tile is the numerator
            if (sourceTile.get('isDenominator') === false) {
                clonedArray.push(this._applyTermInsideBigTerm(clonedSourceTerm, clonedParentheses));
                if (sourceParentTiles === destParentTiles) {
                    //the case of multiplication of simple term, which is not in a fraction.
                    clonedArray = this._validateAndChangeOperators(sourceTile, destTile, clonedArray, sourceParentTiles);
                }
                else if (sourceParent.get('type') === modelNameSpace.TileItem.TileType.FRACTION) {
                    //in the case of the fraction tiles, it will change the operator of concerned tiles within it.
                    this._validateAndChangeOperatorsFractionCase(sourceParentTiles, this.sourcePos);
                }
                else {
                    return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                }
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }
            else {
                clonedArray.push(this._applyTermInsideBigTermWithFraction(clonedSourceTerm, clonedParentheses));
                this._validateAndChangeOperatorsFractionCase(sourceParentTiles, this.sourcePos);
            }
            this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
            return true;
        },

        /**
         * Will recursively apply the given term inside the parentheses.
         * eg: 6 (2*4*1 + 2 + {3*4 + 5} /{7}) on applying 6 gives: 6*4 + 6*2 + {6*3*4 + ^*5} /{7})
         * @method _applyTermInsideBigTerm
         * @private
         *
         * @param   {Object} term    The term which is the source and which will be applied.
         * @param   {Object} bigTerm The parentheses/fraction term which is going to be combined with.
         * @returns {Object} The resultant model after the combination.
         */
        _applyTermInsideBigTermWithFraction: function _applyTermInsideBigTermWithFraction(term, bigTerm) {
            var collection = bigTerm.get('tileArray');

            collection = this._convertAllTilesToFraction(collection, term);
            bigTerm.set('tileArray', collection);
            return bigTerm;
        },

        /**
         * Converts all tiles in the given collection to fraction
         * @method _convertAllTilesToFraction
         * @private
         *
         * @param   {Object} collection The collection within which all terms are wanted as fractions
         * @param   {Object} term       The term with which the terms in the fraction are to be multiplied with.
         * @returns {Object} The collection containing the multiplies fraction term.
         */
        _convertAllTilesToFraction: function _convertAllTilesToFraction(collection, term) {
            var index, j, currentTerm, tilesToAddAtIndexes = [], denTiles = [], termBaseNegOne = false,
                newFraction, fractionTiles, mulTiles = [], currentFractionTiles,
                parenthesesIndex = [], parenthesesRef = [], currentFraction,
                currentOperator, currentTermIndex, cloned, toMultiply;
            //to check whether the term is -1 that is to be applied.
            if (term.get('base') === -1) {
                termBaseNegOne = true;
            }

            for (index = 0; index < collection.length;) {
                denTiles = [];
                mulTiles = [];
                parenthesesIndex = [];
                parenthesesRef = [];

                currentTerm = collection.at(index);
                if (currentTerm.get('type') === modelNameSpace.TileItem.TileType.FRACTION) {
                    fractionTiles = currentTerm.get('tileArray');
                    denTiles = fractionTiles.where({ isDenominator: true });
                    Array.prototype.push.apply(tilesToAddAtIndexes, this._getIndexOperatorOfTile(fractionTiles, termBaseNegOne, fractionTiles.length - denTiles.length));
                    index++;
                }
                else {
                    //added for the case of fraction into parentheses. Where that parentheses is unaccounted for, as no mul group would have been caluculated.
                    if (currentTerm.get('operator') === modelNameSpace.TileItem.OPERATORS.MULTIPLICATION) {
                        index++;
                        continue;
                    }
                    //gets the entire multiplicative group of tiles being multiplied.
                    mulTiles = this._getMultiplicativeGroup(collection, index);
                    //removes that entire group of mul tiles.
                    collection.remove(mulTiles);
                    //gets at which index there is a parentheses. As they would not be in the fraction
                    parenthesesIndex = this.getParenthesesIndex(mulTiles);
                    //remove all parentheses from the group.
                    for (j = parenthesesIndex.length - 1; j >= 0; j--) {
                        Array.prototype.push.apply(parenthesesRef, mulTiles.splice(parenthesesIndex[j], 1));
                    }
                    parenthesesRef.reverse();
                    //creates a new fraction to be added.
                    if (mulTiles[0]) {
                        newFraction = this._createFractionTile(mulTiles[0].get('operator'), mulTiles[0].get('isLHS'));
                    }
                    else {
                        newFraction = this._createFractionTile(parenthesesRef[0].get('operator'), parenthesesRef[0].get('isLHS'));
                    }
                    //if now the mul grp becomes 0, then add a 1 tile for the numerator.
                    if (mulTiles.length === 0) {
                        mulTiles.push(this._createTermTile(1, null, term.get('isLHS'), false));
                        parenthesesRef[0].set('operator', modelNameSpace.TileItem.OPERATORS.MULTIPLICATION);
                    }
                    else {
                        //sets operator of the 1st tile in the fraction to 0.
                        mulTiles[0].set('operator', null);
                    }
                    //sets the tile array of the fraction.
                    newFraction.set('tileArray', new Backbone.Collection(mulTiles));
                    //adds the fraction to the collection
                    collection.add(newFraction, { at: index });
                    index++;

                    //adds the parentheses removed to the collection
                    collection.add(parenthesesRef, { at: index });
                    index += parenthesesRef.length;

                    tilesToAddAtIndexes.push(mulTiles.length, null, false);
                }
            }
            for (index = collection.length - 1; index >= 0; index--) {
                currentFraction = collection.at(index);
                if (currentFraction.get('type') === modelNameSpace.TileItem.TileType.FRACTION) {
                    currentFractionTiles = collection.at(index).get('tileArray');
                    toMultiply = tilesToAddAtIndexes.pop();
                    currentOperator = tilesToAddAtIndexes.pop();
                    currentTermIndex = tilesToAddAtIndexes.pop();
                    //if the term to be applied is -1, then the 1st term in the multiplicative group has to get multiplied with -1 OR
                    // if there exists a 1 tile in the multiplicative group, does it have to get multiplied.\
                    //query 13606
                    /*if(termBaseNegOne === true && currentFractionTiles.at(currentTermIndex)) {
                        cloned = currentFractionTiles.at(currentTermIndex).deepClone();
                        //get the term after negating it.
                        cloned = this._negateTerm(cloned);
                        currentFractionTiles.remove(currentFractionTiles.at(currentTermIndex));
                    }
                    else {*/
                    cloned = term.deepClone();
                    if (toMultiply) {
                        cloned = this._negateTerm(cloned);
                    }
                    cloned.set('operator', currentOperator);
                    //}
                    currentFractionTiles.add(cloned, { at: currentTermIndex });
                }
            }
            return collection;
        },

        getParenthesesIndex: function getParenthesesIndex(tiles) {
            var TYPES = modelNameSpace.TileItem.TileType,
                parenthesesIndex = [],
                currentTerm, index;
            for (index = 0; index < tiles.length; index++) {
                currentTerm = tiles[index];
                if (currentTerm.get('type') === TYPES.PARENTHESES) {
                    parenthesesIndex.push(index);
                }
            }
            return parenthesesIndex;
        },

        /**
         * returns the multplicative group of tiles.
         * @method _getMultiplicativeGroup
         * @private
         *
         * @param   {Object}     tiles      The entire collection from which the groups have to be formed
         * @param   {Number}     startIndex The index from which the denominator starts
         * @returns {Collection} The multiplicative group
         */
        _getMultiplicativeGroup: function _getMultiplicativeGroup(tiles, startIndex) {
            var index = startIndex, mulTiles = [];
            mulTiles.push(tiles.at(startIndex));
            index++;
            while (tiles.at(index) && tiles.at(index).get('operator') === modelNameSpace.TileItem.OPERATORS.MULTIPLICATION) {
                mulTiles.push(tiles.at(index));
                index++;
            }
            return mulTiles;
        },

        /**
         * Gets index operator of tile
         * @method _getIndexOperatorOfTile
         * @private
         *
         * @param   {Object}  fractionTiles     The fraction child tiles.
         * @param   {Boolean} termBaseNegOne    Whether the multiplicative term is - 1.
         * @param   {Number}  posOfFirstDenTile The position of the denominator tile.
         * @returns {Array}   The array consisting of the index and oeprators
         */
        _getIndexOperatorOfTile: function _getIndexOperatorOfTile(fractionTiles, termBaseNegOne, posOfFirstDenTile) {
            var index, currentTerm, tilesToAddAtIndexes = [],
                Operators = modelNameSpace.TileItem.OPERATORS,
                negOneTermRemoved = false, oneTermRemoved = false,
                indexRemoved, cacheRemovedOneTile, tempOperator;

            for (index = posOfFirstDenTile; index < fractionTiles.length; index++) {
                currentTerm = fractionTiles.at(index);
                if (currentTerm.get('operator') === null) {
                    //storing the index at which the term will be added,
                    //the operator of the temr at that position so that when a new term is added, it can be given that operator,
                    // and whether the term which is inserted is to be negated or not. For -1 case.
                    tilesToAddAtIndexes.push(index, currentTerm.get('operator'), false);
                    /*query #13606
                    if(termBaseNegOne === false) {*/
                    //make the operator of the current tile as multiplication, as it will be multiplied with the coeff.
                    currentTerm.set('operator', Operators.MULTIPLICATION);
                    //reset the counter while entering a new multiplicative tile.
                    oneTermRemoved = false;
                    negOneTermRemoved = false;
                    //}
                }
                if (termBaseNegOne === true && currentTerm.get('base') === -1 && negOneTermRemoved === false) {
                    //if alread a one tile was removed, add it back from where it was
                    if (oneTermRemoved) {
                        fractionTiles.add(cacheRemovedOneTile, { at: indexRemoved });
                    }
                    oneTermRemoved = true;
                    //the flag met on the first encounter of a -1.
                    negOneTermRemoved = true;
                    //code explained in the next condition.
                    /* query #13606
                    tempOperator = tilesToAddAtIndexes.pop();
                    fractionTiles.at(tilesToAddAtIndexes.pop()).set('operator', tempOperator);
                    tilesToAddAtIndexes.push(index, currentTerm.get('operator'));*/
                    fractionTiles.remove(currentTerm);
                    index -= 1;
                    tilesToAddAtIndexes.pop();
                    tilesToAddAtIndexes.push(true);
                }
                //to remove the 1st 1 terms that come its way.
                if (currentTerm.get('base') === 1) {
                    //cause new requirement says not to remove all one tiles, only remove one tile per multiplicative term.
                    if (oneTermRemoved === false) {
                        /* query #13606
                        if(termBaseNegOne === true) {
                            //if the term to be applied is -1, and there exists a 1 tile within the multiplicative tiles,
                            // then the -1 will have to be appled on the one tile.
                            //so will have to pop the latest entry from the index stack, reset the operator of the tile that we changed and push new index in the stack.
                            tempOperator = tilesToAddAtIndexes.pop();
                            fractionTiles.at(tilesToAddAtIndexes.pop()).set('operator', tempOperator);
                            tilesToAddAtIndexes.push(index, currentTerm.get('operator'));
                        }
                        else {*/
                        //remove that one term.
                        fractionTiles.remove(currentTerm);
                        indexRemoved = index;
                        cacheRemovedOneTile = currentTerm;
                        index -= 1;
                        //}
                        //set the flag so that no other one would be removed from that multiplicative terms.
                        oneTermRemoved = true;
                    }
                }
            }
            return tilesToAddAtIndexes;
        },

        /**
         * Will recursively apply the given term inside the parentheses.
         * eg: 6 (2*4*1 + 2 + {3*4 + 5} /{7}) on applying 6 gives: 6*4 + 6*2 + {6*3*4 + ^*5} /{7})
         * @method _applyTermInsideBigTerm
         * @private
         *
         * @param   {Object} term    The term which is the source and which will be applied.
         * @param   {Object} bigTerm The parentheses/fraction term which is going to be combined with.
         * @returns {Object} The resultant model after the combination.
         */
        _applyTermInsideBigTerm: function _applyTermInsideBigTerm(term, bigTerm) {
            var collection = bigTerm.get('tileArray'),
                isVariable = typeof term.get('base') === 'string',
                tilesToAddAtIndexes = [], newBigTerm,
                Operators = modelNameSpace.TileItem.OPERATORS,
                oneTermRemoved = false, negOneTermRemoved = false,
                termBaseNegOne = false,
                oneTileRemovalIndex = [],
                index, currentTerm, cloned, tempOperator, indexRemoved, cacheRemovedOneTile,
                currentTermIndex, currentOperator, toMultiply, oneIndex;

            // if theres a one term being dragged, then retrun the same result.
            if (term.get('base') === 1 && term.get('iotaExponent') === null && term.get('squareRootProps') === null) {
                return bigTerm;
            }

            //to check whether the term is -1 that is to be applied.
            if (term.get('base') === -1 && term.get('iotaExponent') === null && term.get('squareRootProps') === null) {
                termBaseNegOne = true;
            }

            for (index = 0; index < collection.length; index++) {
                currentTerm = collection.at(index);
                if (currentTerm.get('isDenominator') === term.get('isDenominator')) {
                    if (isVariable && currentTerm.get('operator') === Operators.ADDITION && utilityMethods.isBasicTileType(collection.at(index - 1))) {
                        tilesToAddAtIndexes.push(index, Operators.MULTIPLICATION, false);
                    }
                    //if fraction is within parentheses, then recurse thriugh it.
                    if (currentTerm.get('type') === modelNameSpace.TileItem.TileType.FRACTION) {
                        collection.remove(currentTerm);
                        //replace that fraction with new fraction.
                        newBigTerm = this._applyTermInsideBigTerm(term, currentTerm);
                        collection.add(newBigTerm, { at: index });
                    }
                        // is term tile.
                    else {
                        if (currentTerm.get('operator') === null || currentTerm.get('operator') === Operators.ADDITION) {
                            if (!isVariable) {
                                //storing the index at which the term will be added,
                                //the operator of the temr at that position so that when a new term is added, it can be given that operator,
                                // and whether the term which is inserted is to be negated or not. For -1 case.
                                tilesToAddAtIndexes.push(index, currentTerm.get('operator'), false);
                                //Code removed query #13606
                                /*if(termBaseNegOne === false) { */
                                //make the operator of the current tile as multiplication, as it will be multiplied with the coeff.
                                currentTerm.set('operator', Operators.MULTIPLICATION);
                            }
                            /*}*/
                            //reset the counter while entering a new multiplicative tile.
                            oneTermRemoved = false;
                            negOneTermRemoved = false;
                        }
                        //if the coeff to be applied is -1, then giving -1 in the parentheses the highest priority to be combined.
                        if (termBaseNegOne === true && currentTerm.get('base') === -1 && negOneTermRemoved === false && currentTerm.get('iotaExponent') === null && term.get('squareRootProps') === null) {
                            //if there was a case in which the 1 term has been removed,
                            //again add it and remove the -1 tile, to give it more priority.
                            if (oneTermRemoved) {
                                collection.add(cacheRemovedOneTile, { at: indexRemoved });
                            }
                            oneTermRemoved = true;
                            //the flag met on the first encounter of a -1.
                            negOneTermRemoved = true;
                            //remove the boolean
                            tilesToAddAtIndexes.pop();
                            //Code removed query #13606

                            //code explained in the next condition.
                            /*tempOperator = tilesToAddAtIndexes.pop();
                            collection.at(tilesToAddAtIndexes.pop()).set('operator', tempOperator);
                            tilesToAddAtIndexes.push(index, currentTerm.get('operator'));*/
                            collection.remove(currentTerm);
                            index -= 1;
                            tilesToAddAtIndexes.push(true);
                        }
                        //to remove the 1st 1 terms that come its way.
                        if (currentTerm.get('base') === 1 && currentTerm.get('iotaExponent') === null) {
                            //cause new requirement says not to remove all one tiles, only remove one tile per multiplicative term.
                            if (oneTermRemoved === false) {
                                //Code removed query #13606

                                /*if(termBaseNegOne === true) {
                                    //if the term to be applied is -1, and there exists a 1 tile within the multiplicative tiles,
                                    // then the -1 will have to be appled on the one tile.
                                    //so will have to pop the latest entry from the index stack, reset the operator of the tile that we changed and push new index in the stack.
                                    tempOperator = tilesToAddAtIndexes.pop();
                                    collection.at(tilesToAddAtIndexes.pop()).set('operator', tempOperator);
                                    tilesToAddAtIndexes.push(index, currentTerm.get('operator'));
                                }
                                else {*/
                                //remove that one term.
                                if (isVariable) {
                                    oneTileRemovalIndex.push(currentTerm);
                                }
                                else {
                                    collection.remove(currentTerm);
                                    indexRemoved = index;
                                    cacheRemovedOneTile = currentTerm;
                                    index -= 1;
                                }
                                //}
                                //set the flag so that no other one would be removed from that multiplicative terms.
                                oneTermRemoved = true;
                            }
                        }
                        if (isVariable && index + 1 >= collection.length) {
                            tilesToAddAtIndexes.push(index + 1, Operators.MULTIPLICATION, false);
                        }
                    }
                }
                else {
                    if (isVariable) {
                        tilesToAddAtIndexes.push(index, Operators.MULTIPLICATION, false);
                    }
                    break;
                }
            }
            while (tilesToAddAtIndexes.length > 0) {
                toMultiply = tilesToAddAtIndexes.pop();
                currentOperator = tilesToAddAtIndexes.pop();
                currentTermIndex = tilesToAddAtIndexes.pop();
                //if the term to be applied is -1, then the 1st term in the multiplicative group has to get multiplied with -1 OR
                // if there exists a 1 tile in the multiplicative group, does it have to get multiplied.
                //Code removed query #13606

                /*if(termBaseNegOne === true) {
                    cloned = collection.at(currentTermIndex).deepClone();
                    //get the term after negating it.
                    cloned = this._negateTerm(cloned);
                    collection.remove(collection.at(currentTermIndex));
                }
                else {*/
                cloned = term.deepClone();
                if (toMultiply) {
                    cloned = this._negateTerm(cloned);
                }
                cloned.set('operator', currentOperator);
                //}
                collection.add(cloned, { at: currentTermIndex });
            }
            for (index = 0; index < oneTileRemovalIndex.length; index++) {
                currentTerm = oneTileRemovalIndex[index];
                oneIndex = collection.indexOf(currentTerm);
                collection.at(oneIndex + 1).set('operator', currentTerm.get('operator'));
                collection.remove(currentTerm);
            }
            bigTerm.set('tileArray', collection);
            return bigTerm;
        },

        /**
         * negates a guven term tile.
         * @method _negateTerm
         * @private
         *
         * @param   {Object} tile The tile to be negated
         * @returns {Object} The tile after negation.
         */
        _negateTerm: function _negateTerm(tile) {
            if (utilityMethods.isBasicTileType(tile)) {
                var base = tile.get('base'),
                    newBase, obj;
                if ((obj = tile.get('squareRootProps')) || obj) {
                    obj = $.extend(true, {}, obj);
                    obj.isNegative = !obj.isNegative;
                    tile.set('squareRootProps', obj);
                    return tile;
                }
                newBase = _.isString(base) ? this._invertVariable(base) : base * -1;
                tile.set('base', newBase);
                return tile;
            }
            else if (tile.get('type') === modelNameSpace.TileItem.TileType.FRACTION) {
                var tileArray = tile.get('tileArray'),
                    firstChild = tileArray.at(0);
                firstChild = this._negateTerm(firstChild);
                return tile;
            }
        },

        /**
         * perform multiplication between two term tiles.
         * @method _performTermMultiplication
         * @private
         *
         * @param   {Object}  parentTileWrapper The object containing the source and dest parent tiles.
         * @returns {Boolean} Whether the operation is successful or not.
         */
        _performTermMultiplication: function _performTermMultiplication(parentTileWrapper, modelRef) {
            var sourceParentTiles = parentTileWrapper.sourceParent.get('tileArray'),
                destParentTiles = parentTileWrapper.destParent.get('tileArray'),
                sourceTile = this.sourceTiles[0],
                destTile = this.destTiles[0],
                sourceBase = sourceTile.get('base'),
                destBase = destTile.get('base'),
                sourceSquareProps = sourceTile.get('squareRootProps'),
                destSquareProps = destTile.get('squareRootProps'),
                clonedArray = [], newBases = [], cloned, newIotaExp = null, rootObj = null, temp;

            //in the case of multiplication the source and dest parent tiles will be the same.
            if (sourceParentTiles !== destParentTiles) {
                return false;
            }
            //multiplication with 0 tile.
            if (sourceBase === 0 || destBase === 0) {
                clonedArray = this._performMultiplicationWithZeroBase(sourceTile, destTile, true);
            }
                //if either term has square root and not both.
            else if ((sourceSquareProps === null && destSquareProps !== null) || (sourceSquareProps !== null && destSquareProps === null)) {
                //for combination of root tile with 1 or -1. or with i or -i.
                clonedArray = this._checkRootTermMultiplicationWithOneTile(sourceTile, destTile);
                if (clonedArray.length === 0) {
                    //return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                    return false;
                }
            }
                //multiplying 2 root tiles.
            else if (sourceSquareProps !== null) {
                newBases = this._getBasesAfterSquareRootMultiplication(sourceTile, destTile);
                if (newBases.length === 0) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_IMAGINARY_NUMBER;
                }
                newIotaExp = (sourceTile.get('iotaExponent') || 0) + (destTile.get('iotaExponent') || 0);
                cloned = destTile.deepClone();
                if (sourceSquareProps.isNegative !== destSquareProps.isNegative) {
                    rootObj = {
                        isNegative: true, // since source is not equal to dest, hence will be negative.
                        exponent: sourceSquareProps.exponent //expoennt is the same for source and dest.
                    };
                }
                else { // source and dest have the same square root sign.
                    rootObj = {
                        isNegative: false, // since source is equal to dest, hence will be positive.
                        exponent: sourceSquareProps.exponent //expoennt is the same for source and dest.
                    };
                }
                cloned.set('squareRootProps', rootObj);
                cloned.set('base', newBases[0]);
                cloned.set('iotaExponent', newIotaExp || null);
                clonedArray.push(cloned);
            }
                //multiplying 2 tiles which have i tile.
            else if (sourceTile.get('iotaExponent') !== null && destTile.get('iotaExponent') !== null) {
                clonedArray = this._getBasesAfterIotaMultiplication(sourceTile, destTile);
                if (clonedArray.length === 0) {
                    return false;
                }
            }
            else {
                if (sourceTile.get('isDenominator') === destTile.get('isDenominator') && typeof sourceBase === 'string' && typeof destBase === 'number' && Math.abs(destBase) === 1) {
                    temp = this.sourceTiles;
                    this.sourceTiles = this.destTiles;
                    this.destTiles = temp;

                    temp = this.sourcePos;
                    this.sourcePos = this.destPos;
                    this.destPos = temp;

                    return this._performTermMultiplication(parentTileWrapper);
                }
                newBases = this._performMathMultiplication(sourceTile.get('isDenominator'), sourceBase, destTile.get('isDenominator'), destBase, modelRef);
                if (newBases.length === 0) {
                    //return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                    return false;
                }
                else if (this._checkMaxValueCondition(newBases)) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.MAX_VALUE_REACHED;
                }
                clonedArray = this._getClonedModels(newBases, destTile);
                //if any of the tiles have an iota. then the resultant also should have.
                if ((newIotaExp = sourceTile.get('iotaExponent') || destTile.get('iotaExponent')) || newIotaExp) {
                    clonedArray[0].set('iotaExponent', newIotaExp);
                }
            }
            //in the case of multiplication the source and dest parent tiles will be the same.
            //We need to specifically update operators looking at the operator of the source tile.
            //eg: 3 + 2*4*5, if combine 2 and 5, result = 3 + 4*10, we see that the operator of 4 has changed. Handling all such cases.
            clonedArray = this._validateAndChangeOperators(sourceTile, destTile, clonedArray, sourceParentTiles);
            this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray, modelRef);
            return true;
        },

        /**
         * perform multiplication with zero base
         * @method _performMultiplicationWithZeroBase
         * @private
         *
         * @param   {Object}  sourceTile  The sourcve tile
         * @param   {Object}  destTile    The dest tile.
         * @param   {Boolean} toCheckDest To check whether the dest tile contains a 0 base or not.
         * @returns {Array}   Cloned models of the result.
         */
        _performMultiplicationWithZeroBase: function _performMultiplicationWithZeroBase(sourceTile, destTile, toCheckDest) {
            var sourceIotaExp = sourceTile.get('iotaExponent'),
                destIotaExp = destTile.get('iotaExponent'),
                newIotaExp = null, cloned;

            //checks added to prevent a case of NAN for iota exp.
            if (typeof destIotaExp === 'undefined') {
                destIotaExp = 0;
            }
            if (typeof sourceIotaExp === 'undefined') {
                destIotaExp = 0;
            }
            if (sourceIotaExp || destIotaExp) {
                newIotaExp = sourceIotaExp + destIotaExp;
            }

            if (sourceTile.get('base') === 0) {
                cloned = sourceTile.deepClone();
                cloned.set({
                    operator: destTile.get('operator'),
                    isLHS: destTile.get('isLHS'),
                    //iotaExponent: newIotaExp
                    iotaExponent: null
                });
                return [cloned];
            }
            else if (toCheckDest === true) {
                cloned = destTile.deepClone();
                //cloned.set('iotaExponent', newIotaExp);
                cloned.set('iotaExponent', null);
                return [cloned];
            }
            return [];
        },

        /**
         * After the combination of tiles, the operators would have to be updated.
         * @method _validateAndChangeOperators
         * @private
         *
         * @param   {Object} sourceTile  The source tile being draged.
         * @param   {Object} destTile    The dest tile, on which the drop took place.
         * @param   {Array}  clonedArray The array of newly created models.
         * @param   {Object} parentTiles The parent collection of the soucre and dest tiles.
         * @returns {Array}  The modified array of models.
         */
        _validateAndChangeOperators: function _validateAndChangeOperators(sourceTile, destTile, clonedArray, parentTiles) {
            var sourceOperator = sourceTile.get('operator');
            //is the leftmost child wrt to its parent.
            if (sourceOperator === modelNameSpace.TileItem.OPERATORS.ADDITION || sourceOperator === null) {
                // a check to determine whether the source and dest tiles are placed next to eachother.
                //if they are, then change operator of cloned array, else change operator of the next tile.
                if (this.sourcePos === this.destPos - 1) {
                    clonedArray[0].set('operator', sourceOperator);
                }
                else {
                    //the operator of next tile to the source tile will have to be changed.
                    var toChangeOperatorModel = parentTiles.at(this.sourcePos + 1);
                    if (toChangeOperatorModel) {
                        this.operatorChangedSP = toChangeOperatorModel.get('operator');
                        toChangeOperatorModel.set('operator', sourceOperator);
                    }
                }
            }
            return clonedArray;
        },

        /**
         * validate and change operators fraction case
         * @method _validateAndChangeOperatorsFractionCase
         * @private
         *
         * @param {Object} fractionTiles The tiles of the fraction. It is a collection
         * @param {Number} sourcePos     The source position of the source tile, relative to the fraction parent.
         */
        _validateAndChangeOperatorsFractionCase: function _validateAndChangeOperatorsFractionCase(fractionTiles, sourcePos) {
            var currentTile = fractionTiles.at(sourcePos),
                sourceOperator = currentTile.get('operator'),
                nextTile;
            if (sourceOperator === modelNameSpace.TileItem.OPERATORS.ADDITION || sourceOperator === null) {
                nextTile = fractionTiles.at(sourcePos + 1);
                if (nextTile && nextTile.get('isDenominator') === currentTile.get('isDenominator')) {
                    this.operatorChangedSP = nextTile.get('operator');
                    nextTile.set('operator', sourceOperator);
                }
            }
        },

        /**
         * Will check whether the root tile is multiplied wih a plus or minus 1.
         * @method _checkRootTermMultiplicationWithOneTile
         * @private
         *
         * @param   {Object} sourceTile The source tile.
         * @param   {Object} destTile   The dest tile.
         * @returns {Array}  The array of concerned tiles.
         */
        _checkRootTermMultiplicationWithOneTile: function _checkRootTermMultiplicationWithOneTile(sourceTile, destTile) {

            var sourceSquareProps = sourceTile.get('squareRootProps'),
                destSquareProps = destTile.get('squareRootProps'),
                sourceBase = sourceTile.get('base'),
                destBase = destTile.get('base'),
                newIotaExp = (sourceTile.get('iotaExponent') || 0) + (destTile.get('iotaExponent') || 0),
                cloned, rootObj = null;
            //only one ie source or dest would have a root, not both.
            if (Math.abs(sourceBase) === 1 && sourceSquareProps === null) { //checking whether either the sourcve or the dest base is -1. If present then perform combination.
                cloned = destTile.deepClone();
                rootObj = {
                    isNegative: sourceBase === 1 ? destSquareProps.isNegative : !destSquareProps.isNegative, //inverting the sign of the square root.
                    exponent: destSquareProps.exponent
                };
                cloned.set('squareRootProps', rootObj);
                cloned.set('iotaExponent', newIotaExp || null);
                return [cloned];
            }
            else if (Math.abs(destBase) === 1 && destSquareProps === null) {
                cloned = sourceTile.deepClone();
                rootObj = {
                    isNegative: destBase === 1 ? sourceSquareProps.isNegative : !sourceSquareProps.isNegative, //inverting the sign of the square root.
                    exponent: sourceSquareProps.exponent
                };
                cloned.set('squareRootProps', rootObj);
                cloned.set('iotaExponent', newIotaExp || null);
                //always the operator of the dest tile is only used.
                cloned.set('operator', destTile.get('operator'));
                return [cloned];
            }
            return [];
        },

        /**
         * Gets bases after square root multiplication
         * @method _getBasesAfterSquareRootMultiplication
         * @private
         *
         * @param   {Object} sourceRootTile The source tile having the square root.
         * @param   {Object} destRootTile   The dest Tile having the square root.
         * @returns {Array}  The multiplied result.
         */
        _getBasesAfterSquareRootMultiplication: function _getBasesAfterSquareRootMultiplication(sourceRootTile, destRootTile) {
            var sourceRootObj = sourceRootTile.get('squareRootProps'),
                destRootObj = destRootTile.get('squareRootProps'),
                sourceRootExp = sourceRootObj.exponent,
                destRootExp = destRootObj.exponent;

            //add check for root multiplication
            //- the base inside of a root cannot be a negative number
            if (sourceRootExp !== destRootExp || sourceRootTile.get('base') < 0 || destRootTile.get('base') < 0) {
                return [];
            }
            return this._performMathMultiplication(false, sourceRootTile.get('base'), false, destRootTile.get('base'));
        },

        /**
         * performs multiplication of two iota tiles and returns an array of new bases created.
         * @method _getBasesAfterIotaMultiplication
         * @private
         *
         * @param   {Object} sourceIotaTile The source tle containing the iota, to be multiplied.
         * @param   {Object} destIotaTile   The dest tile containing the iota, to be multiplied.
         * @returns {Array}  The resulstant model array to the added.
         */
        _getBasesAfterIotaMultiplication: function (sourceIotaTile, destIotaTile) {
            var sourceIotaBase = sourceIotaTile.get('base'),
                destIotaBase = destIotaTile.get('base'),
                totalIotaExp, baseArray = [], cloned;

            // for casees like i * i, 4i * 9i, all in one tile.
            //will return a multiplied result.
            baseArray = this._performMathMultiplication(sourceIotaTile.get('isDenominator'), sourceIotaBase, destIotaTile.get('isDenominator'), destIotaBase);
            if (baseArray.length === 0) {
                return [];
            }
            //adding the ioata exp, which will be the new iota exp.
            totalIotaExp = sourceIotaTile.get('iotaExponent') + destIotaTile.get('iotaExponent');
            cloned = destIotaTile.deepClone();
            cloned.set({
                'iotaExponent': totalIotaExp,
                'base': baseArray[0]
            });

            return [cloned];
        },

        /**
         * perform math addition
         * @method _performMathMultiplication
         * @private
         *
         * @param   {Boolean}       LHS        The lhs of source tile.
         * @param   {String}        sourceBase The base of the source tile.
         * @param   {Boolean}       destLHS    the lhs of tghe dest tile.
         * @param   {String|Number} destBase   The base of the dest tile.
         * @returns {Array}         The array consisting of the resultant math operation.
         */
        _performMathMultiplication: function _performMathMultiplication(sourceDenominator, sourceBase, destDenominator, destBase, modelRef) {
            var newBases = [];
            if (sourceDenominator === destDenominator) { //is the same side of the fraction, hence multiplication
                //case of 2 * 2
                if (_.isNumber(sourceBase) && _.isNumber(destBase)) {
                    newBases.push(sourceBase * destBase);
                }
                    //the case of combining a 'x' term with 1 or -1.
                else if (Math.abs(sourceBase) === 1 && _.isString(destBase)) {
                    newBases.push(sourceBase === -1 ? this._invertVariable(destBase) : destBase);
                }
                else if (Math.abs(destBase) === 1 && _.isString(sourceBase)) {
                    newBases.push(destBase === -1 ? this._invertVariable(sourceBase) : sourceBase);
                }
                else if (sourceBase === 0 || destBase === 0) {
                    newBases.push(0);
                }
            }
                //opposite side of the fraction, hence division.
            else {
                // only the source tile could be in the denominator. rule.
                if (sourceDenominator === true) {
                    if (destBase === 0) {
                        newBases.push(0);
                    }
                    else if (destBase % sourceBase === 0 || (this.fractionToDecimalAllowed && !(_.isString(sourceBase) && _.isString(destBase)) && this._fractionToDecimalCase(modelRef))) {
                        //check if numerator is greater than denominator. also if its divisible.
                        newBases.push(destBase / sourceBase);
                    }
                        //the case of dividing x/x and so on.
                    else if (_.isString(sourceBase) && _.isString(destBase)) {
                        if (sourceBase === destBase) {
                            newBases.push(1);
                        }
                        else {
                            newBases.push(-1);
                        }
                    }
                        //the case of dividing a 'x' term with 1 or -1.
                    else if (Math.abs(sourceBase) === 1 && _.isString(destBase)) {
                        newBases.push(sourceBase === -1 ? this._invertVariable(destBase) : destBase);
                    }
                }
            }
            return newBases;
        },

        _fractionToDecimalCase: function _fractionToDecimalCase(modelRef) {
            var index = 0,
                tiles = modelRef.get('tileArray');
            for (index; index < tiles.length; index++) {
                //check length of expressions tile array 
                if (tiles.at(index).get('tileArray').length > 1) {
                    return false;
                }
            }
            var leftExprFirstTile = tiles.at(0).get('tileArray').at(0),
                rightExprFirstTile = tiles.at(1).get('tileArray').at(0);
            if (leftExprFirstTile.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE && leftExprFirstTile.get('base') === 't') {
                if (rightExprFirstTile.get('type') === modelNameSpace.TileItem.TileType.FRACTION && rightExprFirstTile.get('tileArray').length === 2) {
                    return true;
                }
            }
            else if (leftExprFirstTile.get('type') === modelNameSpace.TileItem.TileType.FRACTION && leftExprFirstTile.get('tileArray').length === 2) {
                if (rightExprFirstTile.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE && rightExprFirstTile.get('base') === 't') {
                    return true;
                }
            }

        },


        /**
         * inverts the sign of the variable
         * @method _invertVariable
         * @private
         *
         * @param   {String} variable The given variable whose sign is be inverted or negated.
         * @returns {String} The inverted/negated variable.
         */
        _invertVariable: function _invertVariable(variable) {
            var operators = modelNameSpace.TileItem.OPERATORS;
            //will converrt -x to x and vica-versa.
            if (variable.indexOf(operators.SUBTRACTION) !== -1) {
                return variable.replace(operators.SUBTRACTION, '');
            }
            return operators.SUBTRACTION + variable;
        },

        /************************************************************* MULTIPLICATION SECTION ENDS *******************************************************************************/

        /****************************************************************** ADDITION SECTION *************************************************************************************/

        _checkToGiveBinMulFeedback: function _checkToGiveBinMulFeedback(parentTileWrapper, sourceNode, destNode) {
            var sourceParent = parentTileWrapper.sourceParent,
                currentParent;
            if (sourceParent.get('type') !== modelNameSpace.TileItem.TileType.PARENTHESES) {
                currentParent = sourceNode.parent;
                if (this._checkWhetherAdditionOperatorExists(currentParent) === false) {
                    return false;
                }
                else {
                    currentParent = destNode.parent;
                    if (this._checkWhetherAdditionOperatorExists(currentParent) === false) {
                        return false;
                    }
                    else {
                        return modelNameSpace.CommandFactory.EXIT_CODE.DIVIDE_ON_OTHER_SIDE;
                    }
                }
            }
            else {
                return false;
            }
        },

        _checkWhetherAdditionOperatorExists: function _checkWhetherAdditionOperatorExists(currentParent) {
            var additionPresent = false,
                Operators = modelNameSpace.TileItem.OPERATORS;
            while (currentParent.data !== Operators.EQUAL) {
                if (currentParent.data === Operators.ADDITION) {
                    additionPresent = true;
                    break;
                }
                currentParent = currentParent.parent;
            }
            if (additionPresent === true) {
                return false;
            }
            return true;
        },

        /**
         * The parent method called once the common parent bertween the source and the destination is found out to be addition
         * @method _performAddition
         * @private
         *
         * @param   {modelNameSpace.TileItem.TreeNode} root              The root of the tree
         * @param   {Object}                           parentTileWrapper The wrapper object containing the source and the destination tile collection.
         * @param   {Object}                           commonNodeObj     A wrapper object consisting the common nodes of the source and destination.
         * @returns {Boolean}                          Depending upon whether the operation performed was successul or not.
         */
        _performAddition: function _performAddition(root, parentTileWrapper, commonNodeObj, modelRef) {
            var sourceNode = commonNodeObj.sourceCommon,
                destNode = commonNodeObj.destCommon,
                operators = modelNameSpace.TileItem.OPERATORS,
                betweenOperators = utilityMethods.getOperatorStringsBetween(sourceNode, destNode);

            if (betweenOperators.indexOf(operators.PARENTHESES) !== -1 ||
                betweenOperators.indexOf(operators.DIVISION) !== -1 ||
                betweenOperators.indexOf(operators.MULTIPLICATION) !== -1) {
                if (commonNodeObj.commonParent.data === operators.EQUAL && betweenOperators.indexOf(operators.PARENTHESES) === -1) {
                    return this._checkToGiveBinMulFeedback(parentTileWrapper, sourceNode, destNode);
                }
                return false;
            }

            if (sourceNode.data === operators.MULTIPLICATION && sourceNode.children.length !== this.sourceTiles.length) {
                if (commonNodeObj.commonParent.data === operators.EQUAL) {
                    return this._checkToGiveBinMulFeedback(parentTileWrapper, sourceNode, destNode);
                }
                return false;
            }

            if (sourceNode.data === operators.ADDITION) {
                return false;
            }

            if (sourceNode.isLeaf()) {
                if (destNode.isLeaf()) { //case of 8+8 || x + x, i.e both are term tiles.
                    return this._performTermAddition(parentTileWrapper, modelRef);
                }
                if (destNode.data === operators.MULTIPLICATION) {
                    return this._performTermMultiplicativeAddition(parentTileWrapper, destNode);
                }
                if (destNode.data === operators.DIVISION) {
                    return this._performTermFractionAddition(parentTileWrapper);
                }
            }
            if (destNode.isLeaf()) {
                if (sourceNode.data === operators.MULTIPLICATION) {
                    return this._performMultiplicativeTermAddition(parentTileWrapper, sourceNode);
                }
                if (sourceNode.data === operators.DIVISION) {
                    return this._performFractionAdditionWithTerm(parentTileWrapper, sourceNode);
                }
            }
            //condition of 3x + 5x
            if (sourceNode.data === operators.MULTIPLICATION) {
                if (destNode.data === operators.MULTIPLICATION) {
                    return this._performMultiplicationAddition(parentTileWrapper, sourceNode, destNode);
                }
                if (destNode.data === operators.DIVISION) {
                    return this._returnFeedbackForNonFractionVariableCase(this.sourceTiles);
                }
            }

            if (sourceNode.data === operators.DIVISION) {
                if (destNode.data === operators.DIVISION) {
                    return this._performOnlyFractionAddition(parentTileWrapper, sourceNode, destNode);
                }
                if (destNode.data === operators.MULTIPLICATION) {
                    return this._performFractionAdditionWithTerm(parentTileWrapper, sourceNode);
                }
            }
            return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
        },

        /************************************************************* SPECIFIC  FRACTION  CASES  STARTS **********************************************************************/

        /**
         * perform fraction addition
         * @method _performOnlyFractionAddition
         * @private
         *
         * @param   {Object}  parentTileWrapper Containing the source and the destination parents
         * @param   {Object}  sourceNode        The source common node of all source tiles.
         * @param   {Object}  destNode          The dest common node of all dest tiles.
         * @returns {Boolean} The success of the operation
         */
        _performOnlyFractionAddition: function _performOnlyFractionAddition(parentTileWrapper, sourceNode, destNode, toReturnFraction) {
            var sourceDenNode = sourceNode.children[1],
                destDenNode = destNode.children[1];
            //if the denominators of the source and dest fraction is a leaf node. Only then combination is allowed.
            if (sourceDenNode.isLeaf() && destDenNode.isLeaf()) {
                if (sourceDenNode.data.get('base') === destDenNode.data.get('base')) {
                    return this._addFractionNumerators(parentTileWrapper, sourceNode, destNode, toReturnFraction);
                }
                else {
                    if (toReturnFraction === true) {
                        return -1;
                    }
                    return this._getFeedbackForFractionCase(sourceNode);
                }
            }
            return this._getFeedbackForFractionCase(sourceNode);
        },

        /**
         * add numerators in a fraction
         * @method _addFractionNumerators
         * @private
         *
         * @param   {Object}  parentTileWrapper Contains parent details of the source and dest terms
         * @param   {Object}  sourceNode        The source tree Node
         * @param   {Object}  destNode          The dest tree node
         * @returns {Boolean} Whether the operation was successful or not.
         */
        _addFractionNumerators: function _addFractionNumerators(parentTileWrapper, sourceNode, destNode, toReturnFraction) {
            var sourceNumNode = sourceNode.children[0],
                destNumNode = destNode.children[0],
                commDenNode = destNode.children[1].data,
                Operators = modelNameSpace.TileItem.OPERATORS;
            //if the numerator of the source fraction is a leaf node.
            if (sourceNumNode.isLeaf()) {
                //if the numerator of the dest fraction is a leaf node.
                if (destNumNode.isLeaf()) {
                    return this._performFractionTermAddition(parentTileWrapper, sourceNumNode.data, destNumNode.data, commDenNode, toReturnFraction);
                }
                else if (destNumNode.data === Operators.MULTIPLICATION) {
                    return this._performTermMultiplicativeFractionAddition(parentTileWrapper, sourceNumNode.data, destNumNode, commDenNode, toReturnFraction);
                }
            }
            else if (destNumNode.isLeaf()) {
                if (sourceNumNode.data === Operators.MULTIPLICATION) {
                    return this._performMultiplicativeTermFractionAddition(parentTileWrapper, sourceNumNode, destNumNode.data, commDenNode, toReturnFraction);
                }
            }
            else if (destNumNode.data === Operators.MULTIPLICATION && sourceNumNode.data === Operators.MULTIPLICATION) {
                return this._performMultiplicationFractionAddition(parentTileWrapper, sourceNumNode, destNumNode, commDenNode, toReturnFraction);
            }
        },

        /**
         * perform numerator both multiplicative addition
         * @method _performMultiplicationFractionAddition
         * @private
         *
         * @param {Object}  parentTileWrapper Contains parent details of the source and dest terms
         * @param {Object}  sourceNode        The source Node
         * @param {Object}  destNode          The dest Node
         * @param {Object}  commonDenTile     The common denominator tile.
         * @returns {Boolean} Whether the operation was successful or not.
         */
        _performMultiplicationFractionAddition: function _performMultiplicationFractionAddition(parentTileWrapper, sourceNode, destNode, commonDenTile, toReturnFraction) {
            if (sourceNode.children.length > 2 || sourceNode.areChildrenLeafNodes() === false) {
                return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
            }
            if (destNode.children.length > 2 || destNode.areChildrenLeafNodes() === false) {
                return this._getFeedbackForFractionCase(sourceNode.parent);
            }

            var sourceCoeffTile = sourceNode.children[0].data,
                sourceVarTile = sourceNode.children[1].data,
                destCoeffTile = destNode.children[0].data,
                destVarTile = destNode.children[1].data,
                sourceVarBase = sourceVarTile.get('base'),
                destVarBase = destVarTile.get('base'),
                Operators = modelNameSpace.TileItem.OPERATORS,
                newBases = [], clonedArray = [], newFraction;

            //the variable  has to be a string
            if (!_.isString(sourceVarBase)) {
                return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
            }
            //the variable  has to be a string
            if (!_.isString(destVarBase)) {
                return false;
            }
            //creating a fraction tile.
            //this.destTiles[0] == the destination fraction tile.
            newFraction = this._createFractionTile(this.destTiles[0].get('operator'), this.destTiles[0].get('isLHS'));

            //this means that there are multiplicative tiles in the numnerator: and each have a x term. like 2x + 3x etc in the numerator
            if (sourceVarBase.replace(Operators.SUBTRACTION, '') !== destVarBase.replace(Operators.SUBTRACTION, '')) {
                return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
            }
            newBases = this._getBasesAfterNegationOfVariables(sourceCoeffTile.get('base'), sourceVarBase, sourceCoeffTile.get('isLHS'), destCoeffTile.get('base'), destVarBase, destCoeffTile.get('isLHS'));
            if (newBases.length === 0) {
                return false;
                //return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
            }
            else if (this._checkMaxValueCondition(newBases)) {
                return modelNameSpace.CommandFactory.EXIT_CODE.MAX_VALUE_REACHED;
            }
            clonedArray = this._getClonedModels(newBases, destCoeffTile, destCoeffTile.get('operator'));
            //pushing the common denominator in the newly cretaed fraction.
            clonedArray.push(commonDenTile.deepClone());
            newFraction.set('tileArray', new Backbone.Collection(clonedArray));
            if (toReturnFraction === true) {
                return newFraction;
            }
            this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, [newFraction]);
            return true;
        },

        /**
         * perform numerator term and multiplication addition
         * @method _performMultiplicativeTermFractionAddition
         * @private
         *
         * @param {Object}  parentTileWrapper Contains parent details of the source and dest terms
         * @param {Object}  sourceNode        The term which is being multiplied.
         * @param {Object}  destTile          The leaf tile.
         * @param {Object}  commonDenTile     The common denominator tile.
         * @returns {Boolean} Whether the operation was successful or not.
         */
        _performMultiplicativeTermFractionAddition: function _performMultiplicativeTermFractionAddition(parentTileWrapper, sourceNode, destTile, commonDenTile, toReturnFraction) {
            if (sourceNode.children.length > 2 || sourceNode.areChildrenLeafNodes() === false) {
                return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
            }
            var sourceCoeffTile = sourceNode.children[0].data,
                sourceVarTile = sourceNode.children[1].data,
                destBase = destTile.get('base'),
                sourceVarBase = sourceVarTile.get('base'),
                Operators = modelNameSpace.TileItem.OPERATORS,
                newBases = [], clonedArray = [], newFraction;

            //the variable  has to be a string
            if (!_.isString(sourceVarBase)) {
                return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
            }
            //creating a fraction tile.
            newFraction = this._createFractionTile(this.destTiles[0].get('operator'), this.destTiles[0].get('isLHS'));

            //for the case of addition of 'x' term with a 5x term in thwe numerator.
            if (_.isString(destBase)) {
                //cause there are 2 children only. And comparing only 2nd child as that will be a variable.
                if (destBase.replace(Operators.SUBTRACTION, '') !== sourceVarBase.replace(Operators.SUBTRACTION, '')) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                }
                newBases = this._getBasesAfterNegationOfVariables(sourceCoeffTile.get('base'), sourceVarBase, sourceCoeffTile.get('isLHS'), 1, destBase, destTile.get('isLHS'));
                if (newBases.length === 0) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                }
                else if (this._checkMaxValueCondition(newBases)) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.MAX_VALUE_REACHED;
                }
                clonedArray = this._getClonedModels(newBases, destTile, destTile.get('operator'));

            }
                //for the case of adding a '3' i.e numeric term with a '2x' term in the numerator.
            else {
                clonedArray = this._joinTermsOfNumerators([sourceCoeffTile, sourceVarTile], sourceCoeffTile.get('isLHS'), [destTile], destTile.get('isLHS'));
            }
            //pushing the common denominator in the newly cretaed fraction.
            clonedArray.push(commonDenTile.deepClone());
            newFraction.set('tileArray', new Backbone.Collection(clonedArray));
            if (toReturnFraction === true) {
                return newFraction;
            }
            this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, [newFraction]);
            return true;
        },

        /**
         * perform numerator term and multiplication addition
         * @method _performTermMultiplicativeFractionAddition
         * @private
         *
         * @param {Object}  parentTileWrapper Contains parent details of the source and dest terms
         * @param {Object}  sourceTile        The leaf tile.
         * @param {Object}  destNode          The term which is being multiplied.
         * @param {Object}  commonDenTile     The common denominator tile.
         * @returns {Boolean} Whether the operation was successful or not.
         */
        _performTermMultiplicativeFractionAddition: function _performTermMultiplicativeFractionAddition(parentTileWrapper, sourceTile, destNode, commonDenTile, toReturnFraction) {
            if (destNode.children.length > 2 || destNode.areChildrenLeafNodes() === false) {
                return false;
            }
            var destCoeffTile = destNode.children[0].data,
                destVarTile = destNode.children[1].data,
                sourceBase = sourceTile.get('base'),
                destVarBase = destVarTile.get('base'),
                Operators = modelNameSpace.TileItem.OPERATORS,
                newBases = [], clonedArray = [], newFraction;

            //the variable  has to be a string
            if (!_.isString(destVarBase)) {
                return false;
            }
            //creating a fraction tile.
            newFraction = this._createFractionTile(this.destTiles[0].get('operator'), this.destTiles[0].get('isLHS'));

            //for the case of addition of 'x' term with a 5x term in thwe numerator.
            if (_.isString(sourceBase)) {
                //cause there are 2 children only. And comparing only 2nd child as that will be a variable.
                if (sourceBase.replace(Operators.SUBTRACTION, '') !== destVarBase.replace(Operators.SUBTRACTION, '')) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                }
                newBases = this._getBasesAfterNegationOfVariables(1, sourceBase, sourceTile.get('isLHS'), destCoeffTile.get('base'), destVarBase, destCoeffTile.get('isLHS'));
                if (newBases.length === 0) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                }
                else if (this._checkMaxValueCondition(newBases)) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.MAX_VALUE_REACHED;
                }
                clonedArray = this._getClonedModels(newBases, destCoeffTile, null);

            }
                //for the case of adding a '3' i.e numeric term with a '2x' term in the numerator.
            else {
                clonedArray = this._joinTermsOfNumerators([sourceTile], sourceTile.get('isLHS'), [destCoeffTile, destVarTile], destCoeffTile.get('isLHS'));
            }
            //pushing the common denominator in the newly cretaed fraction.
            clonedArray.push(commonDenTile.deepClone());
            newFraction.set('tileArray', new Backbone.Collection(clonedArray));
            if (toReturnFraction === true) {
                return newFraction;
            }
            this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, [newFraction]);
            return true;
        },

        /**
         * join terms of numerators, and make a common fraction from 2 factions
         * @method _joinTermsOfNumerators
         * @private
         *
         * @param   {Array}   sourceTiles The source Tiles
         * @param   {Boolean} sourceLHS   The source location
         * @param   {Array}   destTiles   The dest Tiles
         * @param   {Boolean} destLHS     The dest location
         * @returns {Array}   The cloned array after joining of terms
         */
        _joinTermsOfNumerators: function _joinTermsOfNumerators(sourceTiles, sourceLHS, destTiles, destLHS) {
            var cloned, clonedArray = [], index;
            for (index = 0; index < sourceTiles.length; index++) {
                cloned = sourceTiles[index].deepClone();
                if (sourceLHS !== destLHS) {
                    //just negate the 1st term as crossing the = sign.
                    if (index === 0) {
                        cloned = this._negateTerm(cloned);
                    }
                    cloned.set('isLHS', destLHS);
                }
                clonedArray.push(cloned);
            }
            for (index = 0; index < destTiles.length; index++) {
                cloned = destTiles[index].deepClone();
                //the 1st tile of the destination will have to have a addition operator.
                if (index === 0) {
                    cloned.set('operator', modelNameSpace.TileItem.OPERATORS.ADDITION);
                }
                clonedArray.push(cloned);
            }
            return clonedArray;
        },

        /**
         * perform numerator term addition
         * @method _performNumeratorTermAddition
         * @private
         *
         * @param {Object} parentTileWrapper Contains parent details of the source and dest terms
         * @param {Object} sourceTile        The source tile
         * @param {Object} destTile          The dest tIle
         * @param {Object} commonDenTile     The common denominator tile.
         * @returns {Boolean} Whether the operation was successful or not.
         */
        _performFractionTermAddition: function _performFractionTermAddition(parentTileWrapper, sourceTile, destTile, commonDenTile, toReturnFraction) {
            var destFraction = this.destTiles[0],
                sourceBase = sourceTile.get('base'),
                destBase = destTile.get('base'),
                newBases = [], clonedArray = [],
                newFraction;
            //creating a fraction tile.
            newFraction = this._createFractionTile(destFraction.get('operator'), destFraction.get('isLHS'));
            //if both the source and dest num are of the same type i.e sting or number
            if (typeof sourceBase === typeof destBase) {
                newBases = this._performMathAddition(sourceTile.get('isLHS'), sourceBase, destTile.get('isLHS'), destBase);
                clonedArray = this._getClonedModels(newBases, destTile, null);
            }
                //one string and one number
            else {
                clonedArray = this._joinTermsOfNumerators([sourceTile], sourceTile.get('isLHS'), [destTile], destTile.get('isLHS'));
            }
            //pushing the common denominator in the newly cretaed fraction.
            clonedArray.push(commonDenTile.deepClone());
            newFraction.set('tileArray', new Backbone.Collection(clonedArray));
            if (toReturnFraction === true) {
                return newFraction;
            }
            this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, [newFraction]);
            return true;
        },

        _joinTwoFractionsAndApplyParentheses: function _joinTwoFractionsAndApplyParentheses(sourceTile, destTile) {
            var cloned, parenthesesTile,
                sourceLHS = sourceTile.get('isLHS'),
                destLHS = destTile.get('isLHS'),
                sourceClone = sourceTile.deepClone(),
                destClone = destTile.deepClone(),
                additionOp = modelNameSpace.TileItem.OPERATORS.ADDITION,
                firstNumTile, parenthesesTiles;
            parenthesesTile = this._createParenthesesTile(additionOp, destLHS);
            parenthesesTiles = parenthesesTile.get('tileArray');
            if (sourceLHS !== destLHS) {
                //have to make this sign negative.
                firstNumTile = sourceClone.get('tileArray').at(0);
                firstNumTile.set('base', firstNumTile.get('base') * -1);
            }
            //as it will be the first tile in the parentheses
            sourceClone.set('operator', null);
            destClone.set('operator', additionOp);
            parenthesesTiles.add([sourceClone, destClone]);
            return parenthesesTile;
        },

        /**
         * perform Multiplication addition
         * @method _performTermFractionAddition
         * @private
         *
         * @param   {Object}  parentTileWrapper Containing the source and the destination parents
         * @returns {Boolean} The success of the operation
         */
        _performTermFractionAddition: function _performTermFractionAddition(parentTileWrapper) {
            var operators = modelNameSpace.TileItem.OPERATORS,
                sourceTile = this.sourceTiles[0],
                sourceBase = sourceTile.get('base'),
                clonedArray;
            if (sourceBase === 0) {
                clonedArray = this._performSeveralTileAdditionWithZeroBase([sourceTile], this.destTiles);
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }
            else {
                return false;
            }
        },

        /**
         * perform Multiplication addition
         * @method _performFractionAdditionWithTerm
         * @private
         *
         * @param   {Object}  parentTileWrapper Containing the source and the destination parents
         * @returns {Boolean} The success of the operation
         */
        _performFractionAdditionWithTerm: function _performFractionAdditionWithTerm(parentTileWrapper, sourceNode) {
            var destTile = this.destTiles[0],
                destBase = destTile.get('base'),
                clonedArray;
            if (destBase === 0) {
                clonedArray = this._performSeveralTileAdditionWithZeroBase(this.sourceTiles, [destTile]);
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }
            else {
                return this._getFeedbackForFractionCase(sourceNode);
            }
        },

        _getFeedbackForFractionCase: function _getFeedbackForFractionCase(sourceNode) {
            var sourceDenNode = sourceNode.children[1],
                sourceNumNode = sourceNode.children[0],
                operators = modelNameSpace.TileItem.OPERATORS,
                lengthToCheck = 2;
            //if the denominators of the source and dest fraction is a leaf node. Only then combination is allowed.
            if (sourceDenNode.isLeaf()) {
                if (sourceNumNode.data === operators.MULTIPLICATION) {
                    if (utilityMethods._hasVariableTermTile(sourceNumNode, utilityMethods._isVariableTermTile)) {
                        lengthToCheck = 3;
                    }
                    if (sourceNumNode.children.length >= lengthToCheck) {
                        return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                    }
                    else {
                        return false;
                    }
                }
                return false;
            }
            else {
                return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
            }
        },

        /************************************************************* SPECIFIC  FRACTION  CASES  ENDS *********************************************************/

        /**
         * perform Multiplication addition
         * @method _performMultiplicationAddition
         * @private
         *
         * @param   {Object}  parentTileWrapper Containing the source and the destination parents
         * @param   {Object}  sourceNode        The source common node of all source tiles.
         * @param   {Object}  destNode          The dest common node of all dest tiles.
         * @returns {Boolean} The success of the operation
         */
        _performMultiplicationAddition: function _performMultiplicationAddition(parentTileWrapper, sourceNode, destNode) {
            if (sourceNode.children.length > 2 || sourceNode.children.length !== destNode.children.length) {
                return this._returnAppropriateFeedbackMultipleChildrenCase(this.sourceTiles, this.destTiles);
            }

            var operators = modelNameSpace.TileItem.OPERATORS,
                sourceCoeffTile, sourceVarTile, destCoeffTile, destVarTile, cloned,
                sourceObj, destObj,
                binaryCombination = [], parenthesesTile, sourceBase, destBase, destVarBase, sourceVarBase,
                sourceIota, destIota, sourceRoot, destRoot, toNegateCoeff,
                newFractionTile, newParentheses, operator,
                clonedArray = [], newBases = [], obj;

            //i.e all children of that node are leaf nodes. cases like 5*x + 6*x. -5*x + 7*-x
            if (sourceNode.areChildrenLeafNodes() && destNode.areChildrenLeafNodes()) {
                sourceObj = this._setCommutativeTilesInOrder(sourceNode);
                destObj = this._setCommutativeTilesInOrder(destNode);
                //the case of a term having both terms as sqrt or iota.
                if (typeof sourceObj === 'number' || typeof destObj === 'number') {
                    return this._returnAppropriateFeedbackString(sourceObj, destObj);
                }

                sourceVarTile = sourceObj.var;
                sourceCoeffTile = sourceObj.coeff;
                destVarTile = destObj.var;
                destCoeffTile = destObj.coeff;

                destVarBase = destVarTile.get('base');
                sourceVarBase = sourceVarTile.get('base');

                if (sourceVarTile && destVarTile) {
                    //for cases like 2x + 3x etc.
                    if (_.isString(sourceVarBase) && _.isString(destVarBase)) {
                        //cause there are 2 children only. And comparing only 2nd child as that will be a variable. Also the coefficient cannot be a parentheses. only a fraction || term.
                        if (sourceVarBase.replace(operators.SUBTRACTION, '') !== destVarBase.replace(operators.SUBTRACTION, '') &&
                            sourceCoeffTile !== operators.PARENTHESES && destCoeffTile !== operators.PARENTHESES) {
                            return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                        }
                        newBases = this._getBasesAfterNegationOfVariables(sourceCoeffTile.get('base'), sourceVarBase, sourceCoeffTile.get('isLHS'), destCoeffTile.get('base'), destVarBase, destCoeffTile.get('isLHS'));
                        if (newBases.length === 0) {
                            return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                        }
                        else if (this._checkMaxValueCondition(newBases)) {
                            return modelNameSpace.CommandFactory.EXIT_CODE.MAX_VALUE_REACHED;
                        }
                        clonedArray = this._getClonedModels(newBases, destCoeffTile);
                        this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                        return true;
                    }

                        //for test the soln, iota and square root cases.
                    else if (this._checkIotaSame(sourceVarTile, destVarTile, true) && this._checkSquareRootsSame(sourceVarTile, destVarTile, false)) {
                        newBases = this._getBasesAfterIotaAddition(sourceCoeffTile.get('base'), sourceCoeffTile.get('isLHS'), sourceVarTile, destCoeffTile.get('base'), destCoeffTile.get('isLHS'), destVarTile);
                        if (newBases.length === 0) {
                            return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                        }
                        operator = destCoeffTile.get('operator') === operators.MULTIPLICATION ? destVarTile.get('operator') : destCoeffTile.get('operator');
                        clonedArray = this._getClonedModels(newBases, destCoeffTile, operator);
                        //check to remove all other tiles that would follow the 0 tile.
                        //EG 4*i + -4*i = 0. not 0*i
                        if (newBases[0] !== 0) {
                            //the i node which was common.
                            cloned = destVarTile.deepClone();
                            cloned.set('operator', operators.MULTIPLICATION);
                            //to check wheter tit has to be negated or not.
                            if (this._checkToNegateCoeffs(sourceVarTile, destVarTile)) {
                                if ((obj = cloned.get('squareRootProps')) || obj) {
                                    obj = $.extend(true, {}, obj);
                                    obj.isNegative = false;
                                    cloned.set('squareRootProps', obj);
                                }
                                else {
                                    cloned.set('base', Math.abs(cloned.get('base')));
                                }
                            }
                            clonedArray.push(cloned);
                        }
                        this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                        return true;
                    }
                        //checks and adds square roots.
                    else if (this._checkSquareRootsSame(sourceVarTile, destVarTile, true) && this._checkIotaSame(sourceCoeffTile, destCoeffTile, false)) {

                        if (sourceCoeffTile.get('iotaExponent') !== destCoeffTile.get('iotaExponent')) {
                            return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                        }
                        toNegateCoeff = this._checkToNegateCoeffs(sourceVarTile, destVarTile);
                        newBases = this._getBasesAfterSquareRootAddition(sourceCoeffTile.get('base'), sourceCoeffTile.get('isLHS'), sourceVarTile, destCoeffTile.get('base'), destCoeffTile.get('isLHS'), destVarTile, toNegateCoeff);
                        if (newBases.length === 0) {
                            return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                        }
                        clonedArray = this._getClonedModelsForSquareRoot(newBases[0], destCoeffTile, destVarTile, false, toNegateCoeff);
                        this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                        return true;
                    }
                    else if (_.isString(destVarBase) || _.isString(sourceVarBase)) {
                        return this._returnFeedbackForNonFractionVariableCase(this.sourceTiles);
                    }
                    return this._returnAppropriateFeedbackMultipleChildrenCase(this.sourceTiles, this.destTiles);
                }
            }

                //for cases of one being a term tile and the other parentheses.
            else if ((binaryCombination = this._checkParenthesesTermTileCombination(sourceNode, destNode)) && binaryCombination.length !== 0) {
                sourceCoeffTile = sourceNode.children[binaryCombination[0]];
                sourceVarTile = sourceNode.children[binaryCombination[1]];
                destCoeffTile = destNode.children[binaryCombination[2]];
                destVarTile = destNode.children[binaryCombination[3]];

                sourceBase = sourceCoeffTile.data.get('base');
                destBase = destCoeffTile.data.get('base');

                sourceIota = sourceCoeffTile.data.get('iotaExponent');
                destIota = destCoeffTile.data.get('iotaExponent');

                sourceRoot = sourceCoeffTile.data.get('squareRootProps');
                destRoot = destCoeffTile.data.get('squareRootProps');

                //addition with 0 tile.
                if (sourceBase === 0) {
                    clonedArray = this._performSeveralTileAdditionWithZeroBase([sourceCoeffTile], this.destTiles);
                    this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                    return true;
                }
                else if (destBase === 0) {
                    //giving the first tile of the destination as we will have to take the operator of that tile.
                    clonedArray = this._performSeveralTileAdditionWithZeroBase(this.sourceTiles, [this.destTiles[0]]);
                    this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                    return true;
                }

                if (utilityMethods._compareParenthesesEqual(sourceVarTile, destVarTile) === false) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                    //return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                }
                //i.e case like 4(5+2) + (5+2)x = (5+2)(4+x)
                if ((_.isString(sourceBase) && _.isNumber(destBase)) ||
                   (_.isString(destBase) && _.isNumber(sourceBase))) {

                    parenthesesTile = this._performNumberStringAddition(sourceCoeffTile.data, destCoeffTile.data, true);
                    //the parentheses tile, which is common
                    cloned = destVarTile.collectionData.deepClone();
                    cloned.set('operator', operators.ADDITION);
                    clonedArray.push(cloned, parenthesesTile);
                }
                else if ((sourceRoot && sourceRoot.exponent) || (destRoot && destRoot.exponent)) {
                    parenthesesTile = this._performNumberRootAddition(sourceCoeffTile.data, destCoeffTile.data, true);
                    //the parentheses tile, which is common
                    cloned = destVarTile.collectionData.deepClone();
                    clonedArray.push(parenthesesTile, cloned);
                }
                    //for cases like 4(5+2) + 2i(5+2) = (4+2i)(5+2)
                else if (sourceIota !== destIota) {
                    parenthesesTile = this._performNumberIotaAddition(sourceCoeffTile.data, destCoeffTile.data, true);
                    //the parentheses tile, which is common
                    cloned = destVarTile.collectionData.deepClone();
                    clonedArray.push(parenthesesTile, cloned);
                }
                else {
                    newBases = this._performMathAddition(sourceCoeffTile.data.get('isLHS'), sourceBase, destCoeffTile.data.get('isLHS'), destBase);
                    if (this._checkMaxValueCondition(newBases)) {
                        return modelNameSpace.CommandFactory.EXIT_CODE.MAX_VALUE_REACHED;
                    }
                    clonedArray = this._getClonedModels(newBases, destCoeffTile.data);
                    //i.e case like 3(x+2) + 5(x+2) = 8(x+2)
                    if (_.isNumber(sourceBase) && _.isNumber(destBase)) {
                        //check given so that the parentheses which is the common part will be displayed only if the coeff is non-zero.
                        if (newBases[0] !== 0) {
                            clonedArray.push(destVarTile.collectionData.deepClone());
                        }
                    }
                    else {
                        //i.e answer is (3+2)x + (4+6)x = 2(3+2)x
                        //TODO: CODE NEEDS UPDATION IF CASE ARISES.
                        /*clonedArray[0].set('operator', operators.ADDITION);
                        cloned = destVarTile.collectionData.deepClone();
                        cloned.set('operator', operators.MULTIPLICATION);
                        clonedArray.splice(1, 0, cloned);*/
                        return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                    }
                }
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }

                //for cases of one being a term tile and the other parentheses.
            else if ((binaryCombination = this._checkFractionParenthesesTileCombination(sourceNode, destNode)) && binaryCombination.length !== 0) {
                sourceCoeffTile = sourceNode.children[binaryCombination[0]]; //fraction source
                sourceVarTile = sourceNode.children[binaryCombination[1]]; //par source
                destCoeffTile = destNode.children[binaryCombination[2]]; //fract dest
                destVarTile = destNode.children[binaryCombination[3]]; //par dest

                if (utilityMethods._compareParenthesesEqual(sourceVarTile, destVarTile) === false) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                    //return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                }
                //means that the parentheses are equal at this stage.
                newFractionTile = this._performOnlyFractionAddition(parentTileWrapper, sourceCoeffTile, destCoeffTile, true);
                //unsuccessful command execution.
                //denominators are different.
                if (newFractionTile === -1) {
                    newParentheses = this._joinTwoFractionsAndApplyParentheses(sourceCoeffTile.collectionData, destCoeffTile.collectionData);
                    clonedArray.push(newParentheses);
                }
                else if (newFractionTile === false || typeof newFractionTile === 'number') {
                    return newFractionTile;
                }

                else {
                    clonedArray.push(newFractionTile);
                }
                cloned = destVarTile.collectionData.deepClone();
                cloned.set('operator', operators.MULTIPLICATION);
                clonedArray.push(cloned);
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }
            return this._returnAppropriateFeedbackMultipleChildrenCase(this.sourceTiles, this.destTiles);
        },

        /**
         * perform additon between a multiplicative tile and term tile.
         * @method _performMultiplicativeTermAddition
         * @private
         *
         * @param   {Object}                           parentTileWrapper The wrapper object containing the source and the destination tile collection.
         * @param   {modelNameSpace.TileItem.TreeNode} SourceNode        The common source node.
         * @returns {Boolean}                          Depending upon whether the operation performed was successul or not.
         */
        _performMultiplicativeTermAddition: function _performMultiplicativeTermAddition(parentTileWrapper, sourceNode) {
            var operators = modelNameSpace.TileItem.OPERATORS,
                destTile = this.destTiles[0],
                destBase = destTile.get('base'),
                destLHS = destTile.get('isLHS'),
                sourceObj, sourceCoeffTile, sourceVarTile, cloned, obj,
                clonedArray = [], newBases = [], index, toNegateCoeff;

            //addition with 0 tile.
            if (destBase === 0 && sourceNode.children.length === this.sourceTiles.length) {
                clonedArray = this._performSeveralTileAdditionWithZeroBase(this.sourceTiles, [destTile]);
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }

            //Number of tils to combine with cannot be more than 2.
            if (sourceNode.children.length > 2) {
                return this._returnAppropriateFeedbackMultipleChildrenCase(this.sourceTiles, this.destTiles);
            }

            //check to ensure that now all the terms involved are leaf nodes. No parentheses.
            if (sourceNode.areChildrenLeafNodes() === false) {
                //return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                return false;
            }

            sourceObj = this._setCommutativeTilesInOrder(sourceNode);

            //the case of a term having both terms as sqrt or iota.
            if (typeof sourceObj === 'number') {
                /*if (sourceObj === modelNameSpace.CombineCommand.RETURN_TYPE.NUMBER_EXISTS) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                }*/
                return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
            }

            sourceVarTile = sourceObj.var;
            sourceCoeffTile = sourceObj.coeff;

            if (sourceVarTile && _.isString(sourceVarTile.get('base')) && _.isString(destBase)) {
                //cause there are 2 children only. And comparing only 2nd child as that will be a variable. Also the coefficient cannot be a parentheses. only a fraction || term.
                if (sourceVarTile.get('base').replace(operators.SUBTRACTION, '') !== destBase.replace(operators.SUBTRACTION, '') &&
                    sourceCoeffTile !== operators.PARENTHESES) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                }

                // if the dest tile is a leaf node, i.e. a term tile, perform normal addition. for a case like x + 5x
                if (sourceNode.children[0].isLeaf()) {
                    newBases = this._getBasesAfterNegationOfVariables(sourceCoeffTile.get('base'), sourceVarTile.get('base'), sourceCoeffTile.get('isLHS'), 1, destBase, destLHS);
                    if (newBases.length === 0) {
                        return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                    }
                    else if (this._checkMaxValueCondition(newBases)) {
                        return modelNameSpace.CommandFactory.EXIT_CODE.MAX_VALUE_REACHED;
                    }
                    clonedArray = this._getClonedModels(newBases, destTile, destTile.get('operator'));
                    this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                    return true;
                }
            }

                //if both the source and dest have the same iota exponent and same base.
            else if (sourceVarTile && this._checkIotaSame(sourceVarTile, destTile, true) && this._checkSquareRootsSame(sourceVarTile, destTile, false)) {
                newBases = this._getBasesAfterIotaAddition(sourceCoeffTile.get('base'), sourceCoeffTile.get('isLHS'), sourceVarTile, null, destLHS, destTile);
                if (newBases.length === 0) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                }
                clonedArray = this._getClonedModels(newBases, sourceCoeffTile, destTile.get('operator'));
                //since we are cloning the source tile, we need to update the cloned models isLHS flag.
                //so if the source and dest have different isLHS, then update the cloned array flag.
                if (sourceCoeffTile.get('isLHS') !== destLHS) {
                    for (index = 0; index < clonedArray.length; index++) {
                        clonedArray[index].set('isLHS', destLHS);
                    }
                }
                //check to remove all other tiles that would follow the 0 tile.
                //EG i + -1*i = 0. not 0*i
                if (newBases[0] !== 0) {
                    //the i node which was common.
                    cloned = destTile.deepClone();
                    cloned.set('operator', operators.MULTIPLICATION);
                    if (this._checkToNegateCoeffs(sourceVarTile, destTile)) {
                        if ((obj = cloned.get('squareRootProps')) || obj) {
                            obj = $.extend(true, {}, obj);
                            obj.isNegative = false;
                            cloned.set('squareRootProps', obj);
                        }
                        else {
                            cloned.set('base', Math.abs(cloned.get('base')));
                        }
                    }
                    clonedArray.push(cloned);
                }
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }
                //checks and adds square roots.
            else if (sourceVarTile && this._checkSquareRootsSame(sourceVarTile, destTile, true) && this._checkIotaSame(sourceCoeffTile, destTile, false)) {
                toNegateCoeff = this._checkToNegateCoeffs(sourceVarTile, destTile);
                newBases = this._getBasesAfterSquareRootAddition(sourceCoeffTile.get('base'), sourceCoeffTile.get('isLHS'), sourceVarTile, null, destLHS, destTile, toNegateCoeff);
                if (newBases.length === 0) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                }
                clonedArray = this._getClonedModelsForSquareRoot(newBases[0], destTile, sourceVarTile, false, toNegateCoeff);
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }
            else if (sourceVarTile && (_.isString(sourceVarTile.get('base')) || _.isString(destBase))) {
                return this._returnFeedbackForNonFractionVariableCase(this.sourceTiles);
            }
            return this._returnAppropriateFeedbackMultipleChildrenCase(this.sourceTiles, this.destTiles);
        },

        /**
         * perform additon between a term tile and a multiplicative tile.
         * @method _performTermMultiplicativeAddition
         * @private
         *
         * @param   {Object}                           parentTileWrapper The wrapper object containing the source and the destination tile collection.
         * @param   {modelNameSpace.TileItem.TreeNode} destNode          The common dest node.
         * @returns {Boolean}                          Depending upon whether the operation performed was successul or not.
         */
        _performTermMultiplicativeAddition: function _performTermMultiplicativeAddition(parentTileWrapper, destNode) {
            var operators = modelNameSpace.TileItem.OPERATORS,
                sourceTile = this.sourceTiles[0],
                sourceBase = sourceTile.get('base'),
                destObj, destCoeffTile, destVarTile, cloned, operartor, obj,
                clonedArray = [], newBases = [], toNegateCoeff, index;

            //addition with 0 tile.
            if (sourceBase === 0 && destNode.children.length === this.destTiles.length) {
                clonedArray = this._performSeveralTileAdditionWithZeroBase([sourceTile], this.destTiles);
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }

            //Number of tils to combine with cannot be more than 2.
            if (destNode.children.length > 2) {
                return this._returnAppropriateFeedbackMultipleChildrenCase(this.sourceTiles, this.destTiles);
            }

            //check to ensure that now all the terms involved are leaf nodes. No parentheses.
            if (destNode.areChildrenLeafNodes() === false) {
                return false;
                //return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
            }

            destObj = this._setCommutativeTilesInOrder(destNode);
            //the case of a term having both terms as sqrt or iota.
            if (typeof destObj === 'number') {
                /*if (destObj === modelNameSpace.CombineCommand.RETURN_TYPE.NUMBER_EXISTS && !sourceTile.get('iotaExponent') && !sourceTile.get('squareRootProps')) {
                    return false;
                }*/
                return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
            }

            destVarTile = destObj.var;
            destCoeffTile = destObj.coeff;

            //the dest var tile if is parentheses, then there will be no possible combinations possible with a term tile.
            /*if(destVarTile === operators.PARENTHESES) {
                return false;
            }*/

            if (destVarTile && _.isString(destVarTile.get('base')) && _.isString(sourceBase)) {
                //cause there are 2 children only. And comparing only 2nd child as that will be a variable. Also the coefficient cannot be a parentheses. only a fraction || term.
                if (destVarTile.get('base').replace(operators.SUBTRACTION, '') !== sourceBase.replace(operators.SUBTRACTION, '') &&
                    destCoeffTile !== operators.PARENTHESES) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                }

                // if the dest tile is a leaf node, i.e. a term tile, perform normal addition. for a case like x + 5x
                if (destNode.children[0].isLeaf()) {
                    newBases = this._getBasesAfterNegationOfVariables(1, sourceBase, sourceTile.get('isLHS'), destCoeffTile.get('base'), destVarTile.get('base'), destCoeffTile.get('isLHS'));
                    if (newBases.length === 0) {
                        return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                    }
                    else if (this._checkMaxValueCondition(newBases)) {
                        return modelNameSpace.CommandFactory.EXIT_CODE.MAX_VALUE_REACHED;
                    }
                    clonedArray = this._getClonedModels(newBases, destCoeffTile);
                    this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                    return true;
                }
            }

                //if both the source and dest have the same iota exponent and same base.
            else if (destVarTile && this._checkIotaSame(sourceTile, destVarTile, true) && this._checkSquareRootsSame(sourceTile, destVarTile, false)) {
                newBases = this._getBasesAfterIotaAddition(null, sourceTile.get('isLHS'), sourceTile, destCoeffTile.get('base'), destCoeffTile.get('isLHS'), destVarTile);
                if (newBases.length === 0) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
                }
                operartor = destCoeffTile.get('operator') === operators.MULTIPLICATION ? destVarTile.get('operator') : destCoeffTile.get('operator');
                clonedArray = this._getClonedModels(newBases, destCoeffTile, operartor);
                //check to remove all other tiles that would follow the 0 tile.
                //EG i + -1*i = 0. not 0*i
                if (newBases[0] !== 0) {
                    //the i node which was common.
                    cloned = destVarTile.deepClone();
                    cloned.set('operator', operators.MULTIPLICATION);
                    if (this._checkToNegateCoeffs(sourceTile, destVarTile)) {
                        if ((obj = cloned.get('squareRootProps')) || obj) {
                            obj = $.extend(true, {}, obj);
                            obj.isNegative = false;
                            cloned.set('squareRootProps', obj);
                        }
                        else {
                            cloned.set('base', Math.abs(cloned.get('base')));
                        }
                    }
                    clonedArray.push(cloned);
                }

                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }
            //checks and adds square roots.
            if (destVarTile && this._checkSquareRootsSame(sourceTile, destVarTile, true) && this._checkIotaSame(sourceTile, destCoeffTile, false)) {
                toNegateCoeff = this._checkToNegateCoeffs(sourceTile, destVarTile);
                newBases = this._getBasesAfterSquareRootAddition(null, sourceTile.get('isLHS'), sourceTile, destCoeffTile.get('base'), destCoeffTile.get('isLHS'), destVarTile, toNegateCoeff);
                if (newBases.length === 0) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                }
                clonedArray = this._getClonedModelsForSquareRoot(newBases[0], destCoeffTile, destVarTile, false, toNegateCoeff);
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }
            else if (destVarTile && (_.isString(sourceBase) || _.isString(destVarTile.get('base')))) {
                //the source is always going to be a single tile and would not be simplified.
                return false;
            }
            return this._returnAppropriateFeedbackMultipleChildrenCase(this.sourceTiles, this.destTiles);
        },

        /**
         * performs addition of 2 term tiles.
         * @method _performTermAddition
         * @private
         *
         * @param   {Object}  parentTileWrapper Will contain the parent collection of the source and the destination
         * @returns {Boolean} if successful will return true, else false.
         */
        _performTermAddition: function _performTermAddition(parentTileWrapper, modelRef) {
            var sourceTile = this.sourceTiles[0],
                destTile = this.destTiles[0],
                sourceBase = sourceTile.get('base'),
                destBase = destTile.get('base'),
                sourceSquareProps = sourceTile.get('squareRootProps'),
                destSquareProps = destTile.get('squareRootProps'),
                clonedArray = [], newBases = [], toNegateCoeff;

            //addition with 0 tile.
            if (sourceBase === 0 || destBase === 0) {
                clonedArray = this._performAdditionWithZeroBase(sourceTile, destTile);
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                if (this.fractionToDecimalAllowed) {
                    this._setTilesForEndResult(modelRef, true);
                }
                return true;
            }

            //if either term has square root or either term has iota exponent. If one has and other does not, addition not possible.
            if ((sourceSquareProps === null && destSquareProps !== null) || (sourceSquareProps !== null && destSquareProps === null)) {
                return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
            }
            if (sourceTile.get('iotaExponent') !== destTile.get('iotaExponent')) {
                return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
            }

            if (sourceSquareProps !== null) {
                toNegateCoeff = this._checkToNegateCoeffs(sourceTile, destTile);
                newBases = this._getBasesAfterSquareRootAddition(null, sourceTile.get('isLHS'), sourceTile, null, destTile.get('isLHS'), destTile, toNegateCoeff);
                if (newBases.length === 0) {
                    return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
                }
                clonedArray = this._getClonedModelsForSquareRoot(newBases[0], destTile, destTile, false, toNegateCoeff);
                this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
                return true;
            }
            else if (sourceTile.get('iotaExponent') !== null) {
                newBases = this._getBasesAfterIotaAddition(null, sourceTile.get('isLHS'), sourceTile, null, destTile.get('isLHS'), destTile);
            }
            else {
                newBases = this._performMathAddition(sourceTile.get('isLHS'), sourceBase, destTile.get('isLHS'), destBase);
            }

            if (newBases.length === 0) {
                if (_.isString(sourceBase) || _.isString(destBase)) {
                    return false;
                }
                return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
            }
            else if (this._checkMaxValueCondition(newBases)) {
                return modelNameSpace.CommandFactory.EXIT_CODE.MAX_VALUE_REACHED;
            }
            clonedArray = this._getClonedModels(newBases, destTile);
            this._updateCollection(parentTileWrapper.sourceParent, parentTileWrapper.destParent, clonedArray);
            return true;
        },

        /**
         * perform addition with zero base
         * @method _performAdditionWithZeroBase
         * @private
         *
         * @param   {Object} sourceTile The source tile.
         * @param   {Object} destTile   The dest tile.
         * @returns {Array}  The clioend models to be inserted.
         */
        _performAdditionWithZeroBase: function _performAdditionWithZeroBase(sourceTile, destTile) {
            var cloned;
            if (sourceTile.get('base') === 0) {
                cloned = destTile.deepClone();
                if (cloned.get('base') === 0) {
                    cloned.set('iotaExponent', null);
                }
                return [cloned];
            }
            else {
                cloned = sourceTile.deepClone();
                cloned.set({
                    operator: destTile.get('operator'),
                    isLHS: destTile.get('isLHS')
                });
                if (sourceTile.get('isLHS') !== destTile.get('isLHS')) {
                    cloned = this._negateTerm(cloned);
                }
                if (cloned.get('base') === 0) {
                    cloned.set('iotaExponent', null);
                }
                return [cloned];
            }
        },

        /**
         * perform addition with zero base and several multiplicative tiles.
         * @method _performSeveralTileAdditionWithZeroBase
         * @private
         *
         * @param   {Array} sourceTiles The source tiles.
         * @param   {Array} destTiles   The dest tiles.
         * @returns {Array}  The clioend models to be inserted.
         */
        _performSeveralTileAdditionWithZeroBase: function _performSeveralTileAdditionWithZeroBase(sourceTiles, destTiles) {
            var zeroTile, index, cloned, clonedArray = [], zeroLHS;
            //is source tiles length is 0, then the 0 tile is in the source.
            if (sourceTiles.length === 1 && sourceTiles[0].get('base') === 0) {
                for (index = 0; index < destTiles.length; index++) {
                    clonedArray.push(destTiles[index].deepClone());
                }
            }
                //0 tile in tehe dest.
            else {
                zeroTile = destTiles[0];
                zeroLHS = zeroTile.get('isLHS');
                for (index = 0; index < sourceTiles.length; index++) {
                    cloned = sourceTiles[index].deepClone();
                    cloned.setIsLHS(zeroLHS);
                    clonedArray.push(cloned);
                }
                clonedArray[0].set('operator', zeroTile.get('operator'));
                if (zeroLHS !== sourceTiles[0].get('isLHS')) {
                    clonedArray[0] = this._negateTerm(clonedArray[0]);
                }
            }
            return clonedArray;
        },

        /**
         * Gets bases after negation of variables, so will take into condideration multiple negative signs in one gorup of tiles.
         * @method _getBasesAfterNegationOfVariables
         * @private
         *
         * @param   {Object}   sourceCoeff The source coefficient tile.
         * @param   {Object}   sourceVar   The source variable tile.
         * @param   {Boolean}  sourceLHS   Indicating LHS or RHS of the term in the equation.
         * @param   {Object}   destCoeff   The dest coefficient tile.
         * @param   {Object}   destVar     The dest variable tile.
         * @param   {Boolean}  destLHS     The LHS or RHS of the tile.
         * @returns {[[Type]]} [[Description]]
         */
        _getBasesAfterNegationOfVariables: function _getBasesAfterNegationOfVariables(sourceCoeff, sourceVar, sourceLHS, destCoeff, destVar, destLHS) {
            var newBases = [],
                operators = modelNameSpace.TileItem.OPERATORS;
            //if both the source and the destination has the same variable, as in x and x, or -x and -x.
            if (destVar === sourceVar) {
                newBases = this._performMathAddition(sourceLHS, sourceCoeff, destLHS, destCoeff);
                //add common part.
                newBases.push(sourceVar);
            }
                //if the dest tile has -x and source has x.
            else if (destVar.indexOf(operators.SUBTRACTION) !== -1) {
                newBases = this._performMathAddition(sourceLHS, sourceCoeff, destLHS, destCoeff * -1);
                newBases.push(sourceVar);
            }
                //if the sourtce tile has -x and dest has x.
            else if (sourceVar.indexOf(operators.SUBTRACTION) !== -1) {
                newBases = this._performMathAddition(sourceLHS, sourceCoeff * -1, destLHS, destCoeff);
                //add common part.
                newBases.push(destVar);
            }
            //to check if the addition result was 0 or not.
            if (newBases[0] === 0) {
                return [newBases[0]];
            }
            return newBases;
        },

        /**
         * Gets bases after square root addition
         * @method _getBasesAfterSquareRootAddition
         * @private
         *
         * @param   {Object}  sourceCoeff    The source coefficient tile
         * @param   {Boolean} sourceLHS      The location LHS/RHS in the equation of the source.
         * @param   {Object}  sourceRootTile The source tile containing the square root.
         * @param   {Object}  destCoeff      The dest coefficient tile.
         * @param   {Boolean} destLHS        The location LHS/RHS in the equation of the dest.
         * @param   {Object}  destRootTile   The dest tile containing the sqaure root
         * @returns {Array}   The resultant base array.
         */
        _getBasesAfterSquareRootAddition: function _getBasesAfterSquareRootAddition(sourceCoeff, sourceLHS, sourceRootTile, destCoeff, destLHS, destRootTile, toNegateCoeff) {
            var sourceRootObj = sourceRootTile.get('squareRootProps'),
                destRootObj = destRootTile.get('squareRootProps'),
                sourceRootExp = sourceRootObj.exponent,
                destRootExp = destRootObj.exponent,
                sourceRootBase = sourceRootTile.get('base'),
                destRootBase = destRootTile.get('base'),
                baseArray = [];

            if (sourceRootExp !== destRootExp || sourceRootBase !== destRootBase) {
                return [];
            }

            if (sourceCoeff === null && destCoeff === null) {
                //for cases like sqrt(2) + -sqrt(2)
                if (toNegateCoeff) {
                    baseArray = this._performMathAddition(sourceLHS, sourceRootObj.isNegative ? -1 : 1, destLHS, destRootObj.isNegative ? -1 : 1);
                }
                else {
                    baseArray = this._performMathAddition(sourceLHS, 1, destLHS, 1);
                }
            }
            else {
                sourceCoeff = sourceCoeff || 1;
                destCoeff = destCoeff || 1;
                if (toNegateCoeff) {
                    baseArray = this._performMathAddition(sourceLHS, sourceRootObj.isNegative ? sourceCoeff * -1 : sourceCoeff, destLHS, destRootObj.isNegative ? destCoeff * -1 : destCoeff);
                }
                else {
                    baseArray = this._performMathAddition(sourceLHS, sourceCoeff, destLHS, destCoeff);
                }
            }
            return baseArray;
        },

        /**
         * performs addition of two iota tiles and returns an array of new bases created.
         * @method _getBasesAfterIotaAddition
         * @private
         *
         * @param   {Object}  sourceCoeff    The source coefficient tile.
         * @param   {Boolean} sourceLHS      The location LHS/RHS in the equation of the source.
         * @param   {Object}  sourceIotaTile The source tile containing the iota tile.
         * @param   {Object}  destCoeff      The dest coefficient tile.
         * @param   {Boolean} destLHS        The location LHS/RHS in the equation of the dest.
         * @param   {Object}  destIotaTile   The dest tile containing the iota tile.
         * @returns {Array}   the resultant base array.
         */
        _getBasesAfterIotaAddition: function (sourceCoeff, sourceLHS, sourceIotaTile, destCoeff, destLHS, destIotaTile) {
            var sourceIotaExp = sourceIotaTile.get('iotaExponent'),
                destIotaExp = destIotaTile.get('iotaExponent'),
                sourceIotaBase = sourceIotaTile.get('base'),
                destIotaBase = destIotaTile.get('base'),
                newSourceCoeff, newDestCoeff,
                baseArray = [];

            //redundant check. If in case required later. for generic method.
            if (sourceIotaExp !== destIotaExp) {
                return [];
            }
            if (sourceCoeff === null && destCoeff === null) {
                // for casees like i + i, 4i + 9i, all in one tile.
                baseArray = this._performMathAddition(sourceLHS, sourceIotaBase, destLHS, destIotaBase);
            }
            else {
                //for cases like 9 * 9i + 8 * 9i,   8 * i + 7 * i
                if (Math.abs(sourceIotaBase) === Math.abs(destIotaBase)) {
                    sourceCoeff = sourceCoeff === null ? 1 : sourceCoeff;
                    destCoeff = destCoeff === null ? 1 : destCoeff;
                    if (this._checkToNegateCoeffs(sourceIotaTile, destIotaTile)) {
                        sourceCoeff = this._getAfterNegationOfIota(sourceCoeff, sourceIotaTile);
                        destCoeff = this._getAfterNegationOfIota(destCoeff, destIotaTile);
                    }
                    baseArray = this._performMathAddition(sourceLHS, sourceCoeff, destLHS, destCoeff);
                }
            }
            return baseArray;
        },

        /**
         * check for both tiles negative, the variable part. Needed so that we know whether to negate the coeff or not.
         * @method _checkToNegateCoeffs
         * @private
         *
         * @param   {Object}  sourceTile The source tile.
         * @param   {Object}  destTile   The dest tile.
         * @returns {Boolean} Whether inverting the coeff is needed or not.
         */
        _checkToNegateCoeffs: function _checkToNegateCoeffs(sourceTile, destTile) {
            var sourceRoot = sourceTile.get('squareRootProps'),
                destRoot = destTile.get('squareRootProps'),
                sourceBase = sourceTile.get('base'),
                destBase = destTile.get('base');

            if (sourceRoot || destRoot) {
                if (sourceRoot.isNegative === destRoot.isNegative) {
                    return false;
                }
            }

            else if (sourceBase / Math.abs(sourceBase) === destBase / Math.abs(destBase)) {
                return false;
            }

            return true;
        },

        /**
         * Gets after negation of iota
         * @method _getAfterNegationOfIota
         * @private
         *
         * @param   {Number} number  The number tile which will be negated.
         * @param   {Object} varTile The variable tile of whihc the negation has to be checked
         * @returns {Number} The negated number.
         */
        _getAfterNegationOfIota: function _getAfterNegationOfIota(number, varTile) {
            var squareRootProps = varTile.get('squareRootProps'),
                base = varTile.get('base');
            if (squareRootProps) {
                if (squareRootProps.isNegative) {
                    return number * -1;
                }
                else return number;
            }
            else {
                if (base / Math.abs(base) === -1) {
                    return number * -1;
                }
                else return number;
            }
        },

        /**
         * perform math addition
         * @method _performMathAddition
         * @private
         *
         * @param   {Boolean}       LHS        The lhs of source tile.
         * @param   {String}        sourceBase The base of the source tile.
         * @param   {Boolean}       destLHS    the lhs of tghe dest tile.
         * @param   {String|Number} destBase   The base of the dest tile.
         * @returns {Array}         The array consisting of the resultant math operation.
         */
        _performMathAddition: function _performMathAddition(sourceLHS, sourceBase, destLHS, destBase) {
            var newBases = [],
                operators = modelNameSpace.TileItem.OPERATORS;
            if (sourceLHS === destLHS) { //is the same side of the equation, hence same parent tiles.
                //case of 2 + 2
                if (_.isNumber(sourceBase) && _.isNumber(destBase)) {
                    newBases.push(sourceBase + destBase);
                }
                    //case of x + x
                else if (_.isString(sourceBase) && _.isString(destBase)) {
                    Array.prototype.push.apply(newBases, this._addStrings(sourceBase, destBase));
                }
            }

            else { //travelling accross the = sign.
                if (_.isNumber(sourceBase) && _.isNumber(destBase)) {
                    newBases.push(destBase - sourceBase);
                }
                else if (_.isString(sourceBase) && _.isString(destBase)) {
                    sourceBase = sourceBase.indexOf(operators.SUBTRACTION) !== -1 ? sourceBase.replace(operators.SUBTRACTION, '') : operators.SUBTRACTION + sourceBase;
                    Array.prototype.push.apply(newBases, this._addStrings(sourceBase, destBase));
                }
            }
            return newBases;
        },

        /**
         * perform number string addition
         * @method _performNumberStringAddition
         * @private
         *
         * @param   {Object}       sourceTile              The spurce tile
         * @param   {Object}       destTile                The dest tile
         * @param   {Boolean}      toReturnParenthesesTile Whether after adding the two tiles to return them along with parenthese or not
         * @returns {Array|Object} The addition of the number and string
         */
        _performNumberStringAddition: function _performNumberStringAddition(sourceTile, destTile, toReturnParenthesesTile) {
            var operators = modelNameSpace.TileItem.OPERATORS,
                sourceLHS = sourceTile.get('isLHS'),
                destLHS = destTile.get('isLHS'),
                sourceBase = sourceTile.get('base'),
                destBase = destTile.get('base');

            if (sourceLHS === destLHS) {
                if (_.isString(sourceBase) && _.isNumber(destBase)) {
                    return this._addNumberString(destBase, sourceBase, destTile, sourceTile, destTile.get('isLHS'), toReturnParenthesesTile);
                }
                else if (_.isString(destBase) && _.isNumber(sourceBase)) {
                    return this._addNumberString(sourceBase, destBase, sourceTile, destTile, destTile.get('isLHS'), toReturnParenthesesTile);
                }
            }
            else {
                if (_.isString(sourceBase) && _.isNumber(destBase)) {
                    sourceBase = sourceBase.indexOf(operators.SUBTRACTION) !== -1 ? sourceBase.replace(operators.SUBTRACTION, '') : operators.SUBTRACTION + sourceBase;
                    return this._addNumberString(destBase, sourceBase, destTile, sourceTile, destTile.get('isLHS'), toReturnParenthesesTile);
                }
                else if (_.isString(destBase) && _.isNumber(sourceBase)) {
                    return this._addNumberString(sourceBase * -1, destBase, sourceTile, destTile, destTile.get('isLHS'), toReturnParenthesesTile);
                }
            }
        },

        /**
         * perform number root addition
         * @method _performNumberIotaAddition
         * @private
         *
         * @param   {Object}       sourceTile              The spurce tile
         * @param   {Object}       destTile                The dest tile
         * @param   {Boolean}      toReturnParenthesesTile Whether after adding the two tiles to return them along with parenthese or not
         * @returns {Array|Object} The addition of the number and string
         */
        _performNumberRootAddition: function _performNumberRootAddition(sourceTile, destTile, toReturnParenthesesTile) {
            var operators = modelNameSpace.TileItem.OPERATORS,
                sourceLHS = sourceTile.get('isLHS'),
                destLHS = destTile.get('isLHS'),
                sourceBase = sourceTile.get('base'),
                destBase = destTile.get('base'),
                parenthesesTile = this._createParenthesesTile(destTile.get('operator'), destLHS),
                sourceClone = sourceTile.deepClone(),
                destClone = destTile.deepClone(),
                clonedArray = [], obj = {};

            sourceClone.set('operator', null);
            destClone.set('operator', operators.ADDITION);
            if (sourceLHS === destLHS) {
                clonedArray.push(sourceClone, destClone);
            }
            else {
                obj = sourceClone.get('squareRootProps');
                obj = $.extend(true, {}, obj);
                obj.isNegative = !obj.isNegative;
                sourceClone.set('squareRootProps', obj);
            }
            if (toReturnParenthesesTile) {
                parenthesesTile.set('tileArray', new Backbone.Collection(clonedArray));
                return parenthesesTile;
            }
            else {
                return clonedArray;
            }
        },

        /**
         * perform number iota addition
         * @method _performNumberIotaAddition
         * @private
         *
         * @param   {Object}       sourceTile              The spurce tile
         * @param   {Object}       destTile                The dest tile
         * @param   {Boolean}      toReturnParenthesesTile Whether after adding the two tiles to return them along with parenthese or not
         * @returns {Array|Object} The addition of the number and string
         */
        _performNumberIotaAddition: function _performNumberIotaAddition(sourceTile, destTile, toReturnParenthesesTile) {
            var operators = modelNameSpace.TileItem.OPERATORS,
                sourceLHS = sourceTile.get('isLHS'),
                destLHS = destTile.get('isLHS'),
                sourceBase = sourceTile.get('base'),
                destBase = destTile.get('base'),
                parenthesesTile = this._createParenthesesTile(destTile.get('operator'), destLHS),
                sourceClone = sourceTile.deepClone(),
                destClone = destTile.deepClone(),
                clonedArray = [];

            sourceClone.set('operator', null);
            destClone.set('operator', operators.ADDITION);
            if (sourceLHS === destLHS) {
                clonedArray.push(sourceClone, destClone);
            }
            else {
                sourceClone.set('base', sourceBase * -1);
            }
            if (toReturnParenthesesTile) {
                parenthesesTile.set('tileArray', new Backbone.Collection(clonedArray));
                return parenthesesTile;
            }
            else {
                return clonedArray;
            }
        },

        /**
         * will add a number to a variable and return the parentheses tile.
         * @method _addNumberString
         * @private
         *
         * @param   {Number} number              The number to be added
         * @param   {String} string              The string to be added.
         * @param   {Object} numberTileToClone   The number tile to clone.
         * @param   {Object} varTileToClone      The variable tile to clone
         * @param   {Object} toReturnParentheses Whether to return a parentheses tile or the cloned array.
         * @returns {Object} The resultant parentheses tile or the cloned array.
         */
        _addNumberString: function _addNumberString(number, string, numberTileToClone, varTileToClone, isLHS, toReturnParentheses) {
            var operators = modelNameSpace.TileItem.OPERATORS,
                //* operator as with string it will always come on the right side.
                parenthesesTile = this._createParenthesesTile(operators.MULTIPLICATION, isLHS),
                cloned, clonedArray = [];
            cloned = numberTileToClone.deepClone();
            cloned.set('operator', null);
            //parenthesesCollection.add(cloned);
            clonedArray.push(cloned);

            cloned = varTileToClone.deepClone();
            cloned.set('operator', operators.ADDITION);
            //parenthesesCollection.add(cloned);
            clonedArray.push(cloned);

            if (toReturnParentheses) {
                parenthesesTile.set('tileArray', new Backbone.Collection(clonedArray));
                return parenthesesTile;
            }
            else {
                return clonedArray;
            }
        },

        /**
         * add two strings
         * @method _addStrings
         * @private
         *
         * @param   {String} str1 The string to be added
         * @param   {String} str2 The string to be added
         * @returns {Array}  The result of the addition of two strings.
         */
        _addStrings: function _addStrings(str1, str2) {//add 2 strings. thats x + x ONLY.
            var basesArray = [],
                operators = modelNameSpace.TileItem.OPERATORS;
            if (str1.replace(operators.SUBTRACTION, '') !== str2.replace(operators.SUBTRACTION, '')) {
                return [];
            }
            if (str1 === str2) {
                if (str2.indexOf(operators.SUBTRACTION) !== -1) {
                    basesArray.push(-2, str2.replace(operators.SUBTRACTION, ''));
                }
                else {
                    basesArray.push(2, str1);
                }
            }
            else {
                basesArray.push(0);
            }

            return basesArray;
        },

        /**
         * checks the given node, for its children having a term tile and a parentheses tile.
         * @method _checkParenthesesTermTileCombination
         * @private
         *
         * @param   {Object} sourceNode The source node.
         * @param   {Object} destNode   The dest node.
         * @returns {Array}  If found the sedired combination, will return that combination, else empty.
         */
        _checkParenthesesTermTileCombination: function _checkParenthesesTermTileCombination(sourceNode, destNode) {
            var binaryArray = [];

            binaryArray.push(
                this._getBinaryStringParenthesesFromNode(sourceNode.children[0]),
                this._getBinaryStringParenthesesFromNode(sourceNode.children[1]),
                this._getBinaryStringParenthesesFromNode(destNode.children[0]),
                this._getBinaryStringParenthesesFromNode(destNode.children[1])
            );

            if (['0101', '1001', '0110', '1010'].indexOf(binaryArray.join('')) !== -1) {
                return binaryArray;
            }
            else {
                return [];
            }
        },

        /**
         * checks the given node, for its children having a fraction tile and a parentheses tile.
         * @method _checkParenthesesTermTileCombination
         * @private
         *
         * @param   {Object} sourceNode The source node.
         * @param   {Object} destNode   The dest node.
         * @returns {Array}  If found the sedired combination, will return that combination, else empty.
         */
        _checkFractionParenthesesTileCombination: function _checkFractionParenthesesTileCombination(sourceNode, destNode) {
            var binaryArray = [];

            binaryArray.push(
                this._getBinaryStringFractionFromNode(sourceNode.children[0]),
                this._getBinaryStringFractionFromNode(sourceNode.children[1]),
                this._getBinaryStringFractionFromNode(destNode.children[0]),
                this._getBinaryStringFractionFromNode(destNode.children[1])
            );

            if (['0101', '1001', '0110', '1010'].indexOf(binaryArray.join('')) !== -1) {
                return binaryArray;
            }
            else {
                return [];
            }
        },

        /**
         * return appropriate feedbacks for non-fraction variable cases
         * @method _returnAppropriateFeedbackMultipleChildrenCase
         * @private
         *
         * @param   {Array}   sourceTiles The source Tiles
         * @returns {Number}  The feedback to be displayed
         */
        _returnFeedbackForNonFractionVariableCase: function _returnFeedbackForNonFractionVariableCase(sourceTiles) {
            if (sourceTiles.length === 1) {
                return false;
            }
            var index, flag = false, lengthToCheck;
            for (index = 0; index < sourceTiles.length; index++) {
                if (sourceTiles[index].checkIfVariablePresent()) {
                    flag = true;
                    break;
                }
            }
            lengthToCheck = flag === true ? 3 : 2;
            if (sourceTiles.length >= lengthToCheck) {
                return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
            }
            return false;
        },

        /**
         * return appropriate feedbacks
         * @method _returnAppropriateFeedbackMultipleChildrenCase
         * @private
         *
         * @param   {Array}   sourceTiles The source Tiles
         * @param   {Array}   destTiles   The dest Tiles
         * @returns {Number}  The feedback to be displayed
         */
        _returnAppropriateFeedbackMultipleChildrenCase: function _returnAppropriateFeedbackMultipleChildrenCase(sourceTiles, destTiles) {
            var i, j, currentTerm1, currentTerm2,
                base1, //iotaExponent1, rootExp1,
                base2, //iotaExponent2, rootExp2,
                cmdExt = modelNameSpace.CommandFactory.EXIT_CODE;
            if (this.isIotaPresent) {
                //if any of the terms that are same are found in the terms to be combined, the return to simplify else otherwise.
                for (i = 0; i < sourceTiles.length; i++) {
                    currentTerm1 = sourceTiles[i];
                    if (utilityMethods.isBasicTileType(currentTerm1)) {
                        base1 = currentTerm1.get('base');
                        //iotaExponent1 = currentTerm1.get('iotaExponent');
                        //rootExp1 = currentTerm1.get('squareRootProps');
                        for (j = 0; j < destTiles.length; j++) {
                            currentTerm2 = destTiles[j];
                            if (utilityMethods.isBasicTileType(currentTerm2)) {
                                base2 = currentTerm2.get('base');
                                //iotaExponent2 = currentTerm2.get('iotaExponent');
                                //rootExp2 = currentTerm2.get('squareRootProps');
                                if (typeof base1 === 'string' && typeof base2 === 'string') {
                                    return cmdExt.SIMPLIFY_TERMS_FIRST;
                                }
                                if (this._checkIotaSame(currentTerm1, currentTerm2, true, true) && this._checkSquareRootsSame(currentTerm1, currentTerm2, false)) {
                                    return cmdExt.SIMPLIFY_TERMS_FIRST;
                                }
                                if (this._checkIotaSame(currentTerm1, currentTerm2, false, true) && this._checkSquareRootsSame(currentTerm1, currentTerm2, true)) {
                                    return cmdExt.SIMPLIFY_TERMS_FIRST;
                                }
                            }
                        }
                    }
                }
                // a loop for checking whether the source tiles and the dest tiles are purely numbers or not.
                //for source tiles.
                for (i = 0; i < sourceTiles.length; i++) {
                    currentTerm1 = sourceTiles[i];
                    if (!utilityMethods.isBasicTileType(currentTerm1) || !this._isNumberTile(currentTerm1)) {
                        break;
                    }
                }
                if (i === sourceTiles.length) {
                    //for dest tiles.
                    for (i = 0; i < destTiles.length; i++) {
                        currentTerm1 = destTiles[i];
                        if (!utilityMethods.isBasicTileType(currentTerm1) || !this._isNumberTile(currentTerm1)) {
                            break;
                        }
                    }
                    if (i === destTiles.length) {
                        return cmdExt.SIMPLIFY_TERMS_FIRST;
                    }
                }
                return cmdExt.NOT_LIKE_TERMS;
            }
            else {
                return this._returnFeedbackForNonFractionVariableCase(sourceTiles);
            }
        },

        /**
         * Will return whether the given term is a number tile or not.
         * @method _isNumberTile
         * @private
         *
         * @param   {Object} term the term to be checked for a number.
         * @returns {Boolean} Will return as explained above.
         */
        _isNumberTile: function _isNumberTile(term) {
            return term.get('iotaExponent') === null &&
                    term.get('squareRootProps') === null &&
                    !_.isString(term.get('base'));
        },

        /**
         * return appropriate feedback string
         * @method _returnAppropriateFeedbackString
         * @private
         *
         * @param   {Number} sourceReturn The source tile types as to whether both the tiles are root, iota or simple numbers.
         * @param   {Number} destReturn   The dest tile types
         * @returns {String} Tehe feedback which is to be returned and eventually displayed.
         */
        _returnAppropriateFeedbackString: function _returnAppropriateFeedbackString(sourceReturn, destReturn) {
            if (sourceReturn === destReturn) {
                return modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
            }
            else if (this.isIotaPresent) {
                return modelNameSpace.CommandFactory.EXIT_CODE.NOT_LIKE_TERMS;
            }
            else {
                return this._returnFeedbackForNonFractionVariableCase(this.sourceTiles);
            }
        },

        /**
         * To return the children of the node in a specific order.
         * @method _setCommutativeTilesInOrder
         * @private
         *
         * @param   {Object} node The source node.
         * @returns {Object} The object consisting of the coeff and variable tile in the order mentioned.
         */
        _setCommutativeTilesInOrder: function _setCommutativeTilesInOrder(node) {
            var children = node.children,
                currentCoeff = children[0].data,
                currentVar = children[1].data,
                coeffSquareRoot = currentCoeff.get('squareRootProps'),
                varSquareRoot = currentVar.get('squareRootProps'),
                coeffIota = currentCoeff.get('iotaExponent'),
                varIota = currentVar.get('iotaExponent');

            //if var is 'x' term, there will never arise a case of a square root or iota.
            if (_.isString(currentVar.get('base'))) {
                return {
                    coeff: currentCoeff,
                    var: currentVar
                };
            }
            else if (_.isString(currentCoeff.get('base'))) {
                return {
                    coeff: currentVar,
                    var: currentCoeff
                };
            }

            //if both terms are sqrt, then no addition is anyways possible.
            if (coeffSquareRoot && varSquareRoot) {
                return modelNameSpace.CombineCommand.RETURN_TYPE.SQRT_EXISTS;
            }
            //sort the order of iota wrt numbers
            if (coeffIota && varIota) {
                return modelNameSpace.CombineCommand.RETURN_TYPE.IOTA_EXISTS;
            }
            //if coeff is srt and var is not, then interchange
            if (coeffSquareRoot && varSquareRoot === null) {
                return {
                    coeff: currentVar,
                    var: currentCoeff
                };
            }
            //if is already in the given order dont do anything.
            if (varSquareRoot && coeffSquareRoot === null) {
                return {
                    coeff: currentCoeff,
                    var: currentVar
                };
            }

            //if coeff is iota and var is not, then interchange
            if (coeffIota && varIota === null) {
                return {
                    coeff: currentVar,
                    var: currentCoeff
                };
            }
            //if is already in the given order dont do anything.
            if (varIota && coeffIota === null) {
                return {
                    coeff: currentCoeff,
                    var: currentVar
                };
            }
            return {
                coeff: currentCoeff,
                var: currentVar
            };
            //return modelNameSpace.CombineCommand.RETURN_TYPE.NUMBER_EXISTS;
        },

        /**
         * Gets binary number for whether its a parentheses term or term tile.
         * @method _getBinaryStringParenthesesFromNode
         * @private
         *
         * @param   {Object} node The concerned node.
         * @returns {Number} Either 1 or 0. If not found then -1.
         */
        _getBinaryStringParenthesesFromNode: function _getBinaryStringParenthesesFromNode(node) {
            if (node.data === modelNameSpace.TileItem.OPERATORS.PARENTHESES) {
                return 1;
            }
            if (node.isLeaf()) {
                return 0;
            }
            return -1;
        },

        /**
         * Gets binary number for whether its a fraction or parentheses tile.
         * @method _getBinaryStringFractionFromNode
         * @private
         *
         * @param   {Object}   node The concerned node.
         * @returns {Number} Either 1 or 0. If not found then -1.
         */
        _getBinaryStringFractionFromNode: function _getBinaryStringFractionFromNode(node) {
            if (node.data === modelNameSpace.TileItem.OPERATORS.PARENTHESES) {
                return 1;
            }
            if (node.data === modelNameSpace.TileItem.OPERATORS.DIVISION) {
                return 0;
            }
            return -1;
        },

        /**
         * check square roots same
         * @method _checkSquareRootsSame
         * @private
         *
         * @param   {Object}  sourceTile The source tile
         * @param   {Object}  destTile   The dest tile.
         * @returns {Boolean} Whether the roots are equal or not.
         */
        _checkSquareRootsSame: function _checkSquareRootsSame(sourceTile, destTile, hasToBePresent) {
            var sourceRoot = sourceTile.get('squareRootProps'),
                destRoot = destTile.get('squareRootProps'),
                sourceIota = sourceTile.get('iotaExponent'),
                destIota = destTile.get('iotaExponent');
            //the term should have an root term.
            if (hasToBePresent && (sourceRoot === null || destRoot === null)) {
                return false;
            }
            else if (sourceRoot === null && destRoot === null) {
                return true;
            }
            //check if there is an iota exp present and if there is one, they have to be the same.
            if (sourceIota !== destIota) {
                return false;
            }
            //if either of them have, and other does not, false.
            if (sourceRoot !== null && destRoot === null ||
               sourceRoot === null && destRoot !== null) {
                return false;
            }
            //NOW: both of them have a root.
            if (sourceRoot.exponent === destRoot.exponent &&
               sourceTile.get('base') === destTile.get('base')) {
                return true;
            }
            return false;
        },

        /**
         * check iota exponents are same
         * @method _checkIotaSame
         * @private
         *
         * @param   {Object}  sourceTile The source tile
         * @param   {Object}  destTile   The dest tile.
         * @returns {Boolean} Whether the iota are equal or not.
         */
        _checkIotaSame: function _checkIotaSame(sourceTile, destTile, hasToBePresent, toIgnoreBase) {
            var sourceIota = sourceTile.get('iotaExponent'),
                destIota = destTile.get('iotaExponent');
            //the term should have an iota term.
            if (hasToBePresent && (sourceIota === null || destIota === null)) {
                return false;
            }
            else if (sourceIota === null && destIota === null) {
                return true;
            }

            if ((toIgnoreBase || Math.abs(sourceTile.get('base')) === Math.abs(destTile.get('base'))) &&
              sourceIota === destIota) {
                return true;
            }
            return false;
        },

        /********************************************************* ADDITION ENDS **********************************************************************/
        /**
         * Creates fraction tile
         * @method _createFractionTile
         * @private
         *
         * @param   {String}                  operator The operator of the parentheses tile
         * @returns {modelNameSpace.TileItem} the model of a parentheses tile item.
         */
        _createFractionTile: function _createFractionTile(operator, isLHS) {
            var createTileItem = modelNameSpace.TileItem.createTileItem,
                TYPES = modelNameSpace.TileItem.TileType;
            return createTileItem({
                type: TYPES.FRACTION,
                tileArray: null,
                exponent: null,
                operator: operator,
                isLHS: isLHS
            });
        },

        /**
         * Creates parentheses tile
         * @method _createParenthesesTile
         * @private
         *
         * @param   {String}                  operator The operator of the parentheses tile
         * @returns {modelNameSpace.TileItem} the model of a parentheses tile item.
         */
        _createParenthesesTile: function _createParenthesesTile(operator, isLHS) {
            var createTileItem = modelNameSpace.TileItem.createTileItem,
                TYPES = modelNameSpace.TileItem.TileType;
            return createTileItem({
                type: TYPES.PARENTHESES,
                tileArray: null,
                exponent: null,
                operator: operator,
                isLHS: isLHS
            });
        },

        /**
         * Creates term tile
         * @method _createTermTile
         * @private
         *
         * @param   {Number|String}           base     The base of the term tile.
         * @param   {String}                  operator The operator of the term tile.
         * @param   {Boolean}                 Whether  in the lhs or rhs
         * @param   {Boolean}                 Whether  in the numerator or denominator
         * @returns {modelNameSpace.TileItem} The model of the term tile.
         */
        _createTermTile: function _createTermTile(base, operator, isLHS, isDenominator) {
            var createTileItem = modelNameSpace.TileItem.createTileItem,
                TYPES = modelNameSpace.TileItem.TileType;
            return createTileItem({
                type: TYPES.TERM_TILE,
                base: base,
                operator: operator,
                isLHS: isLHS,
                isDenominator: isDenominator
            });
        },

        /**
         * check max value condition, that is whether there is a number in the array which is greater than 99
         * @method _checkMaxValueCondition
         * @private
         *
         * @param   {Array}   numbers The array of numbers which are to be checked.
         * @returns {Boolean} Whether there exists a number greater than 99
         */
        _checkMaxValueCondition: function _checkMaxValueCondition(numbers) {
            var index;
            for (index = 0; index < numbers.length; index++) {
                if (numbers[index] > 999 || numbers[index] < -999) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Gets cloned models for square root
         * @method _getClonedModelsForSquareRoot
         * @private
         *
         * @param   {Number|String} coeffBase   The base of the coefficient
         * @param   {String}        operator    The operator of the first tile.
         * @param   {Object}        destVarTile The common variable/square root tile.
         * @param   {Boolean}       Whether in the lhs or rhs
         * @param   {Boolean}       Whether in the numerator or denominator
         * @returns {Array}         The array containing the cloned models that are to be inserted.
         */
        _getClonedModelsForSquareRoot: function _getClonedModelsForSquareRoot(coeffBase, destCoeffTile, destVarTile, isDenominator, toNegateCoeff) {
            var clonedArray = [], cloned, obj = null, operator,
                mulOp = modelNameSpace.TileItem.OPERATORS.MULTIPLICATION;

            //clonedArray.push(this._createTermTile(coeffBase, operator, isLHS, isDenominator));
            cloned = destCoeffTile.deepClone();
            cloned.set({
                'base': coeffBase,
                'squareRootProps': null
            });
            //the 'i' can be present at only one side. not both places.
            if (destVarTile.get('iotaExponent')) {
                cloned.set('iotaExponent', null);
            }
            if (coeffBase === 0) {
                cloned.set('squareRootProps', null);
                cloned.set('iotaExponent', null);
            }
            if (destCoeffTile.get('operator') === mulOp) {
                operator = destVarTile.get('operator');
                cloned.set('operator', operator);
            }
            clonedArray.push(cloned);
            //as per the requirement of directly making it 0.
            if (coeffBase === 0) {
                return clonedArray;
            }

            obj = {
                exponent: destVarTile.get('squareRootProps').exponent,
                isNegative: destVarTile.get('squareRootProps').isNegative
            };

            //case of changinf the sign of coeff or not.
            if (toNegateCoeff) {
                obj.isNegative = false;
            }
            cloned = destVarTile.deepClone();
            cloned.set({
                'operator': mulOp,
                'squareRootProps': obj
            });
            clonedArray.push(cloned);

            return clonedArray;
        },

        /**
         * From the base array provided will return the cloned tile items.
         * @method _getClonedModels
         * @private
         *
         * @param   {Array}  newBases    The array of bases.
         * @param   {Object} tileToClone The tile item whose clone should be taken.
         * @param   {String} operator    The operator of the tile.
         * @returns {Array}  The array filled with the desired cloned models to be inserted.
         */
        _getClonedModels: function _getClonedModels(newBases, tileToClone, operator) {
            var cloned, index, currentTerm,
                clonedArray = [];
            for (index = 0; index < newBases.length; index++) {
                cloned = tileToClone.deepClone();
                currentTerm = newBases[index];
                cloned.set({
                    'base': newBases[index],
                    'isVariable': false
                });
                if (operator) {
                    cloned.set('operator', operator);
                }
                //if base of the tem is 0.
                if (currentTerm === 0) {
                    cloned.set({
                        'iotaExponent': null,
                        'squareRootExponent': null
                    });
                }
                if (_.isString(currentTerm)) {
                    cloned.set('isVariable', true);
                }
                else {
                    cloned.set('isVariable', false);
                }

                if (index !== 0) {
                    cloned.set('operator', modelNameSpace.TileItem.OPERATORS.MULTIPLICATION);
                }
                clonedArray.push(cloned);
            }
            return clonedArray;
        },

        /**
         * updates collection of. adds removes required tiles.
         * @method _updateCollection
         * @private
         *
         * @param {Object}  sourceParent         The parent of the source tile/s.
         * @param {Object}  destParent           The parent of the dest tile/s.
         * @param {Array}   clonedArray          The array containing the new models to be inderted.
         * @param {Boolean} notToUpdateOperators Whether or not to update operators.
         */
        _updateCollection: function _updateCollection(sourceParent, destParent, clonedArray, modelRef) {
            var sourceParentTiles = sourceParent.get('tileArray'),
                destParentTiles = destParent.get('tileArray'),
                destLHS = destParent.get('isLHS'),
                index, flag = false;
            if (sourceParentTiles === destParentTiles) {
                this._changeSourceDestPos();
                flag = true;
            }
            sourceParentTiles.remove(this.sourceTiles);
            destParentTiles.remove(this.destTiles);
            for (index = 0; index < clonedArray.length; index++) {
                clonedArray[index].setIsLHS(destLHS);
                destParentTiles.add(clonedArray[index], { at: this.destPos + index });
            }
            this.numOfTilesInserted = index; // as index is clonedArray.length

            //in the case of multiplication, we dont need to update operators, as there is another method handling the updation.
            //this should be only called for addition cases.
            if (this.operationPerformed === modelNameSpace.TileItem.OPERATORS.ADDITION) {
                if (sourceParentTiles.at(0)) {
                    sourceParentTiles.at(0).set('operator', null);
                }
                if (destParentTiles.at(0)) {
                    destParentTiles.at(0).set('operator', null);
                }
            }
            this.sourceStaticZeroAdd = this._checkForStaticZero(sourceParent, false, false);
            //because same parent check has been done before. Comparinf 2 collections again or a boolean.
            if (flag === false) {
                this.destStaticZeroAdd = this._checkForStaticZero(destParent, false, false);
            }
            if (this.fractionToDecimalAllowed) {
                this._setTilesForEndResult(modelRef, true);
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
         * updates collection of. adds removes required tiles.
         * @method _updateParentCollection
         * @private
         *
         * @param {Object}  sourceParent         The parent of the source tile/s.
         * @param {Array}   clonedArray          The array containing the new models to be inderted.
         * @param {Number}  parentLevelUp        Will tell us how many levels of parent to go up by.
         * @param {Boolean} notToUpdateOperators Whether or not to update operators.
         */
        _updateParentCollection: function _updateParentCollection(modelRef, sourceParent, clonedArray, parentLevelUp, toReduceSourcePosBy) {
            var sourceParentTiles = sourceParent.get('tileArray'),
                sourceIndex = this.destObj.index,
                index, foundParent, foundParentTiles;

            //find the parent of the concerned tiles. Or the collection in which that tiles have to be added
            for (index = 0; index < parentLevelUp; index++) {
                sourceIndex = utilityMethods.getParentIndex(sourceIndex);
            }
            //get the source Pos
            this.destPos = parseInt(utilityMethods.getSourceWrtParent(sourceIndex));

            this.destObj.index = sourceIndex;
            this.sourceObj.index = '0';
            //update sourcePos, as from this pos, will the tiles get deleted
            this.destPos = this.destPos - toReduceSourcePosBy;
            //get required data for found parent
            foundParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(sourceIndex));
            foundParentTiles = foundParent.get('tileArray');

            this.sourceTiles = [];
            this.destTiles = [];

            for (index = 0; index <= toReduceSourcePosBy; index++) {
                this.destTiles.push(foundParentTiles.at(index + this.destPos));
            }

            foundParentTiles.remove(this.destTiles);
            for (index = 0; index < clonedArray.length; index++) {
                foundParentTiles.add(clonedArray[index], { at: this.destPos + index });
            }
            this.numOfTilesInserted = index;
        },

        /**
         * Cheecks if ONLY 0 is present on either side of the equation. If yes, then make it non-draggable.
         * @method _checkForStaticZero
         * @private
         *
         * @param {Object} sourceParent The parent model of the concerned tile.
         */
        _checkForStaticZero: function _checkForStaticZero(parent, enable, fromUndo) {
            var parentTiles = parent.get('tileArray'),
                TileType = modelNameSpace.TileItem.TileType,
                cloned;

            if (parent.get('type') === TileType.EXPRESSION) {
                if (parentTiles.length === 1 &&
                   parentTiles.at(0).get('type') === TileType.TERM_TILE &&
                   parentTiles.at(0).get('base') === 0) {
                    cloned = parentTiles.at(0).deepClone();
                    cloned.set({
                        isDraggable: enable,
                        isDroppable: enable
                    });
                    parentTiles.remove(parentTiles.at(0));
                    parentTiles.add(cloned);
                    if (!fromUndo) {
                        this.convertedToZero = true;
                    }
                    return true;
                }
                if (parentTiles.length === 0) {
                    this._addStaticZeroTerm(parent);
                    if (!fromUndo) {
                        this.convertedToZero = false;
                    }
                    return true;
                }
            }
            return false;
        },

        /**
         * Will add the staticzero term to the expression
         * @method _addStaticZeroTerm
         * @private
         *
         * @param {Object} sourceParent The source tile's parent model
         */
        _addStaticZeroTerm: function _addStaticZeroTerm(sourceParent) {
            var createTileItem = modelNameSpace.TileItem.createTileItem,
                sourceParentTiles = sourceParent.get('tileArray'),
                termTile;
            termTile = createTileItem({
                base: 0,
                isDenominator: false,
                isLHS: sourceParent.get('isLHS'),
                operator: null,
                type: modelNameSpace.TileItem.TileType.TERM_TILE,
                isDroppable: false,
                isDraggable: false
            });
            sourceParentTiles.add(termTile);
        },

        /**
         * It checks the source and destPos and changes the dest Position accordingly.
         *
         * @method _changeSourceDestPos
         * @private
         */
        _changeSourceDestPos: function () {
            if (this.sourcePos < this.destPos) {
                this.destPos -= this.sourceTiles.length;
            }
        },

        /**
        * Undos the Combine Command
        *
        * @method undo
        * @param {Object} the model from which the command has to be indone
        **/
        undo: function (modelRef) {
            var sourceIndex = this.sourceObj.index,
                destIndex = this.destObj.index,
                Operators = modelNameSpace.TileItem.OPERATORS,
                index, sourceParent, destParent, sourceParentTiles, destParentTiles, concernedTiles = [];

            sourceParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(sourceIndex));
            destParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(destIndex));
            sourceParentTiles = sourceParent.get('tileArray');
            destParentTiles = destParent.get('tileArray');

            this._setTilesForEndResult(modelRef, false);

            //check to see if there was a zero which was converted. If yes, then make it draggable again.
            if (this.sourceStaticZeroAdd) {
                if (this.convertedToZero) {
                    this._checkForStaticZero(sourceParent, true, true);
                }
            }
            if (this.destStaticZeroAdd) {
                if (this.convertedToZero) {
                    this._checkForStaticZero(destParent, true, true);
                }
            }

            //in the case of addition, we have blindly changed the 1st tile operator to null everytime. so doing the reverse.
            if (this.operationPerformed === Operators.ADDITION) {
                sourceParentTiles.at(0).set('operator', Operators.ADDITION);
                destParentTiles.at(0).set('operator', Operators.ADDITION);
            }

            // there are cases in which we have changed the operator of a concerned tile, specially in multiplication case. So undoing it now.
            if (this.operatorChangedSP) {
                sourceParentTiles.at(this.sourcePos).set('operator', this.operatorChangedSP);
            }

            //check to see if there was a zero added. If yes, then make it remove it again.
            if (this.sourceStaticZeroAdd) {
                if (this.convertedToZero !== true) {
                    sourceParentTiles.remove(sourceParentTiles.at(0));
                }
            }
            if (this.destStaticZeroAdd) {
                if (this.convertedToZero !== true) {
                    destParentTiles.remove(destParentTiles.at(0));
                }
            }

            // removing all the tiles taht are added.
            for (index = 0; index < this.numOfTilesInserted; index++) {
                concernedTiles[index] = destParentTiles.at(this.destPos + index);
            }
            destParentTiles.remove(concernedTiles);

            //addiong stored tiles to the dest and source.
            for (index = 0; index < this.destTiles.length; index++) {
                destParentTiles.add(this.destTiles[index], { at: this.destPos + index });
            }
            for (index = 0; index < this.sourceTiles.length; index++) {
                sourceParentTiles.add(this.sourceTiles[index], { at: this.sourcePos + index });
            }

            if (this.operationPerformed === Operators.ADDITION) {
                sourceParentTiles.at(0).set('operator', null);
                destParentTiles.at(0).set('operator', null);
            }
        }

    }, {
        RETURN_TYPE: {
            IOTA_EXISTS: 0,
            SQRT_EXISTS: 1,
            NUMBER_EXISTS: 2
        }
    });
})(window.MathInteractives);
