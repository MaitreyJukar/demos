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

    modelNameSpace.BreakBase = modelNameSpace.BaseCommand.extend({

        /**
		* Stores the number of new tiles created
		*
		* @attribute numOfTilesAdded
		* @type Number
		* @default null
		**/
        numOfTilesAdded: null,

        /**
		* Stores the deleted tiles
		*
		* @attribute deletedTiles
		* @type Array
		* @default null
		**/
        deletedTiles: null,

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
		* Will store whether the operator of the next tile was made null.
		*
		* @attribute operatorMadeNull
		* @type Boolean
		* @default false
		**/
        operatorMadeNull: false,

        /**
		* Whether added the static zero or not.
		*
		* @attribute addedStaticZero
		* @type Boolean
		* @default false
		**/
        addedStaticZero: false,

        /**
         * Initialize break base
         * @method initialize
         * @public
         *
         */
        initialize: function () {
            this.deletedTiles = [];
            this.numOfTilesAdded = 0;
        },

        /**
         * execute
         * @method execute
         * @public
         *
         * @param   {MathInteractives.Common.Components.Models.EquationManagerPro.CommandFactory.Rules} rules    the object specifying whether the breaking of base is possible or not.
         * @param   {Object}                                                                            modelRef The equation model.
         * @param   {Object}                                                                            data     The object storring the source tile, dest tile and tree root information.
         * @returns {Boolean}                                                                           Whether the operation is successful or not.
         */
        execute: function (rules, modelRef, data) {
            var root = data.root,
                sourceIndex = data.source.index,
                givenOperation = rules.allowedOperation, //TODO: integrate with the given operation.
                sourceParent, sourceParentTiles, refTile, base;

            this.sourceIndex = sourceIndex;
            this.sourcePos = parseInt(utilityMethods.getSourceWrtParent(sourceIndex));

            sourceParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(sourceIndex));
            sourceParentTiles = sourceParent.get('tileArray');

            refTile = sourceParentTiles.at(this.sourcePos);

            base = refTile.get('base');
            //if its a variable, check whether its negative then separate the -1, else return false.
            if (_.isString(base)) {
                return this._performBreakBase(sourceParentTiles, refTile);
            }

            if(base === 0) {
                return this._applyZeroBase(modelRef, sourceParent, sourceParentTiles, refTile, root);
            }

            if(refTile.get('iotaExponent') !== null) {
                return this._breakIotaBase(sourceParentTiles, refTile);
            }

            if(refTile.get('squareRootProps') !== null) {
                return this._breakSquareRootBase(sourceParentTiles, refTile);
            }

            return this._performBreakBase(sourceParentTiles, refTile);
        },

        /**
         * apply zero base
         * @method _applyZeroBase
         * @private
         *
         * @param   {Object}  sourceParentTiles The source parent tiles of the target tile that was clicked
         * @param   {Object}  refTile           The target tile.
         * @param   {Object}  root              The tree root.
         * @returns {Boolean} True if breaking of base was successful else false.
         */
         /*_applyZeroBase: function _applyZeroBase (modelRef, sourceParent, sourceParentTiles, refTile, root) {
            var refNode = utilityMethods.tilesToNodes(root, [refTile])[0], //returns an array of nodes, but we want only the 1st tile as given only one tile.
                TileType = modelNameSpace.TileItem.TileType,
                operators = modelNameSpace.TileItem.OPERATORS,
                parentNode, fractionParent;
            //to check if the parent of the 0 tile is expression and is the only 0 tile on the lhs/rhs, then dont break.
            if(sourceParent.get('type') === modelNameSpace.TileItem.TileType.EXPRESSION && sourceParentTiles.length === 1) {
                return false;
            }
            if(sourceParent.get('type') === TileType.FRACTION) { //sourceParent Parentheses and deleting parent tiles not handled, as parentheses will not be present if only multiplicative tiles.
                parentNode = $.extend(true, {}, refNode);

                //if parent is '*' then its multiplied and many other sibling tiles will have to be deleted.
                if(parentNode.parent && parentNode.parent.data === operators.MULTIPLICATION) {
                //parse till parent is '/' in case of fraction tile item. As have to delete entire tile.
                    while(parentNode.data !== operators.DIVISION) {
                        parentNode = parentNode.parent;
                    }

                    //update source index, source pos and tile, the entire fraction tile will be deleted and not only that 0 tile.
                    this.sourceIndex = utilityMethods.getParentIndex(this.sourceIndex);
                    this.sourcePos = parseInt(utilityMethods.getSourceWrtParent(this.sourceIndex));
                    sourceParentTiles = modelRef.getModelFromIndex(utilityMethods.getParentIndex(this.sourceIndex)).get('tileArray');

                    //Now if parent '*', means that have to delete its siblings too.
                    if(parentNode.parent && parentNode.parent.data === operators.MULTIPLICATION) {
                        parentNode = parentNode.parent;
                        this._removeAllChildren(sourceParent, parentNode);
                    }
                    else {
                        //have to delete only the fraction tile.
                        this._deleteOnlyChild(parentNode.collectionData, sourceParent);
                    }
                }
                else {
                    //have to delete only the fraction tile.
                    //update source index, source pos and tile, the entire fraction tile will be deleted and not only that tile, so getting the index of the parent of fration
                    this.sourceIndex = utilityMethods.getParentIndex(this.sourceIndex);
                    this.sourcePos = parseInt(utilityMethods.getSourceWrtParent(this.sourceIndex));
                    fractionParent = modelRef.getModelFromIndex(utilityMethods.getParentIndex(this.sourceIndex));
                    //source parent is the fraction tile and parent tiles are the parent tiles of the fraction.
                    this._deleteOnlyChild(sourceParent, fractionParent);
                }
            }
            else {
                parentNode = refNode.parent;
                if(parentNode.data === operators.MULTIPLICATION) {
                    this._removeAllChildren(sourceParent, parentNode);
                }
                else {
                    this._deleteOnlyChild(refTile, sourceParent);
                }
            }
            return true;
        },*/

        /**
         * apply zero base
         * @method _applyZeroBase
         * @private
         *
         * @param   {Object}  sourceParentTiles The source parent tiles of the target tile that was clicked
         * @param   {Object}  refTile           The target tile.
         * @param   {Object}  root              The tree root.
         * @returns {Boolean} True if breaking of base was successful else false.
         */
        _applyZeroBase: function _applyZeroBase (modelRef, sourceParent, sourceParentTiles, refTile, root) {
            var iotaExp = refTile.get('iotaExponent'),
                cloned;
            if(iotaExp) {
                cloned = refTile.deepClone();
                cloned.set({
                    'iotaExponent': null,
                    'isAnimate': true
                });
                this._updateCollection([cloned], sourceParentTiles, refTile);
                return true;
            }
            return false;
        },

        /**
         * Deletes the only child tile.
         * @method _deleteOnlyChild
         * @private
         *
         * @param {Object} tile         The concerned tile model.
         * @param {Object} sourceParent The parent tiles where the concerned tile is present.
         */
        _deleteOnlyChild: function _deleteOnlyChild (tile, sourceParent) {
            var sourceParentTiles = sourceParent.get('tileArray');

            this.deletedTiles.push(tile);
            tile.destroy();

            if(tile.get('operator') === null && sourceParentTiles.length !== 0) {
                this._updateTileOperator(sourceParentTiles);
            }
            this._checkAndAddStaticZero(sourceParent);
        },

        /**
         * Removes all children of the given node.
         * @method _removeAllChildren
         * @private
         *
         * @param {Object} sourceParent The parent where the concerned tile is present.
         * @param {Object} parentNode   The parent tree node of the concerned tiles.
         */
        _removeAllChildren: function _removeAllChildren (sourceParent, parentNode) {
            var sourceParentTiles = sourceParent.get('tileArray'),
                children = parentNode.children,
                firstChildNodeModel = utilityMethods.getModelDataFromTreeNode(children[0]),  //To save the operator of the first tile and also index
                index, currentChild, modelToBeDeleted, lastChildNodeModel;

            //update sourcePos, cause possible tile before 0 tile be deleted too, hence we need to update to first tile being deleted.
            //this.sourcePos = parseInt(sourceParent.getIndexFromItemModel(firstChildNodeModel));
            this.sourcePos = sourceParentTiles.indexOf(firstChildNodeModel);

            //delete all children of '*' or '/' nodes.
            for(index = 0; index<children.length; index++) {
                currentChild = children[index];
                modelToBeDeleted = utilityMethods.getModelDataFromTreeNode(currentChild);
                this.deletedTiles.push(modelToBeDeleted);
                sourceParentTiles.remove(modelToBeDeleted);
            }

            lastChildNodeModel = modelToBeDeleted; //since last child is out of for loop.
            this.numOfTilesAdded = 0;

            if(firstChildNodeModel.get('operator') === null) {
                this._updateTileOperator(sourceParentTiles);
            }
            this._checkAndAddStaticZero(sourceParent);
        },

        /**
         * check and add static zero if the expression is empty
         * @method _checkAndAddStaticZero
         * @private
         *
         * @param {Object} sourceParent The source tile's parent model
         */
        _checkAndAddStaticZero: function _checkAndAddStaticZero (sourceParent) {
            var sourceParentTiles = sourceParent.get('tileArray');
            if(sourceParent.get('type') === modelNameSpace.TileItem.TileType.EXPRESSION && sourceParentTiles.length === 0) {
                this._addStaticZeroTerm(sourceParent);
            }
        },

        /**
         * Will add the staticzero term to the expression
         * @method _addStaticZeroTerm
         * @private
         *
         * @param {Object} sourceParent The source tile's parent model
         */
        _addStaticZeroTerm: function _addStaticZeroTerm (sourceParent) {
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

            this.addedStaticZero = true;
            sourceParentTiles.add(termTile);
        },

        /**
         * update tile operator of the concerned tiles.
         * @method _updateTileOperator
         * @private
         *
         * @param {Object} sourceParentTiles The collection of parent tiles where the concerned tile is present.
         */
        _updateTileOperator: function _updateTileOperator (sourceParentTiles) {
            var tileToBeUpdated = sourceParentTiles.at(this.sourcePos);
            if(tileToBeUpdated) {
                //just update the operator of the concerned tile to null. Its operator would always be '+'.
                tileToBeUpdated.set('operator', null);
                this.operatorMadeNull = true;
                this.numOfTilesAdded = 0;
            }
        },

        /**
         * break iota base
         * @method _breakIotaBase
         * @private
         *
         * @param   {Object}  sourceParentTiles The source parent tiles of the target tile that was clicked
         * @param   {Object}  refTile           The target tile.
         * @returns {Boolean} True if breaking of base was successful else false.
         */
        _breakIotaBase: function _breakIotaBase (sourceParentTiles, refTile) {
            var iotaExp = refTile.get('iotaExponent'),
                base = refTile.get('base'),
                cloned, clonedArray = [];

            cloned = refTile.deepClone();
            if(base === 1 && iotaExp % 2 === 0) {
                cloned.set({
                    'base' : -1,
                    'iotaExponent': null,
                    'isAnimate': true
                });
                clonedArray.push(cloned);
            }
            //for the case of only i being present, should not be allowed to be broken.
            else if (base === 1) {
                return false;
            }
            else {
                cloned.set({
                    'base' : base,
                    'iotaExponent': null,
                    'isAnimate': true
                });
                clonedArray.push(cloned);

                cloned = refTile.deepClone();
                cloned.set({
                    'base' : 1,
                    'iotaExponent' : iotaExp,
                    'squareRootProps': null,
                    'operator' : modelNameSpace.TileItem.OPERATORS.MULTIPLICATION,
                    'isAnimate': true
                });
                clonedArray.push(cloned);
                if(refTile.get('squareRootProps')) {
                    clonedArray.reverse();
                    clonedArray[0].set('operator', clonedArray[1].get('operator'));
                    clonedArray[1].set('operator', modelNameSpace.TileItem.OPERATORS.MULTIPLICATION);
                }
            }

            this._updateCollection(clonedArray, sourceParentTiles, refTile);

            return true;
        },

        /**
         * break Square root
         * @method _breakSquareRootBase
         * @private
         *
         * @param   {Object}  sourceParentTiles The source parent tiles of the target tile that was clicked
         * @param   {Object}  refTile           The target tile.
         * @returns {Boolean} True if breaking of base was successful else false.
         */
        _breakSquareRootBase: function _breakSquareRootBase (sourceParentTiles, refTile) {
            var rootProps = refTile.get('squareRootProps'),
                rootExp = rootProps.exponent,
                base = refTile.get('base'),
                cloned, clonedArray = [], obj, newBase;

            cloned = refTile.deepClone();
            obj = $.extend(true, {}, rootProps);
            if(rootProps.isNegative === true) {
                cloned.set({
                    'base' : -1,
                    'squareRootProps' : null,
                    'isAnimate': true
                });
                clonedArray.push(cloned);

                obj.isNegative = false;
                cloned = refTile.deepClone();
                cloned.set({
                    'squareRootProps' : obj,
                    'operator': modelNameSpace.TileItem.OPERATORS.MULTIPLICATION,
                    'isAnimate': true
                });
                clonedArray.push(cloned);
            }
            else if(base/Math.abs(base) === -1) {
                newBase = Math.pow(Math.abs(base), 1 / rootExp);
                newBase = newBase % 1 === 0 ? newBase : base * -1;
                cloned.set({
                    'base': newBase,
                    'iotaExponent': 1, //case of only square root.
                    'isAnimate': true,
                    'squareRootProps' : newBase === Math.abs(base) ? obj : null
                });
                clonedArray.push(cloned);
            }
            else {
                newBase = Math.pow(base, 1/rootExp);
                //cehcking whether the number is a perfect square or not.
                if(newBase % 1 === 0) {
                    cloned.set({
                        'base' : Math.pow(base, 1/rootExp),
                        'squareRootProps' : null,
                        'isAnimate': true
                    });
                    clonedArray.push(cloned);
                }
                else {
                    return false;
                }
            }

            this._updateCollection(clonedArray, sourceParentTiles, refTile);
            return true;
        },

        /**
         * update collection i.e add and removes operation data.
         * @method _updateCollection
         * @private
         *
         * @param {Array}  clonedArray       Array consisting of all the tiles that are supposed to be inserted.
         * @param {Object} sourceParentTiles Parent tile of refTile
         * @param {Object} refTile           Tile that was clicked
         */
        _updateCollection: function _updateCollection (clonedArray, sourceParentTiles, refTile) {
            var index;
            this.numOfTilesAdded = clonedArray.length;
            this.deletedTiles.push(refTile);
            sourceParentTiles.remove(refTile);
            for (index = 0; index < clonedArray.length; index++) {
                sourceParentTiles.add(clonedArray[index], { at: this.sourcePos + index });
            }
        },

        /**
         * break iota base
         * @method _breakIotaBase
         * @private
         *
         * @param   {Object}  sourceParentTiles The source parent tiles of the target tile that was clicked
         * @param   {Object}  refTile           The target tile.
         * @returns {Boolean} True if breaking of base was successful else false.
         */
        _performBreakBase: function _modifyParentArray(sourceParentTiles, refTile) {
            var primeFactors = [],
                concernedTiles = [],
                base = refTile.get('base'),
                operators = modelNameSpace.TileItem.OPERATORS,
                mathUtilClass = MathInteractives.Common.Utilities.Models.MathUtils,
                index, length, newBase;

            if((_.isString(base) && base.indexOf(operators.SUBTRACTION) !== -1) || (Math.abs(base) !== 1 && mathUtilClass.isPrime(base) && base/Math.abs(base) === -1)) {
                newBase  = _.isString(base) ? base.replace(operators.SUBTRACTION, '') : Math.abs(base);
                primeFactors.push(-1, newBase);
            }
            else {
                if(_.isNumber(base)) {
                    primeFactors = mathUtilClass.getGreatestMultiple(base);
                }
            }
            if (primeFactors.length === 0) {
                return false;
            }
            this.numOfTilesAdded = primeFactors.length;
            this.deletedTiles.push(refTile);
            sourceParentTiles.remove(refTile);
            for (index = 0, length = primeFactors.length; index < length; index++) {
                concernedTiles[index] = refTile.deepClone();
                concernedTiles[index].set('base', primeFactors[index]);
                concernedTiles[index].set('isAnimate', true);
                if (index !== 0) {
                    concernedTiles[index].set('operator', operators.MULTIPLICATION);
                }
                sourceParentTiles.add(concernedTiles[index], { at: this.sourcePos + index });
            }
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
                sourceParentTiles, index, length;

            sourceParentTiles = utilityMethods.getParentTiles(modelRef, sourceIndex);

            if(this.addedStaticZero) {
                //the added non-draggabel 0 will always be at the 0th index. Remove that.
                sourceParentTiles.remove(sourceParentTiles.at(0));
            }
            for (index = 0; index < numOfTilesAdded; index++) {
                concernedTiles[index] = sourceParentTiles.at(this.sourcePos + index);
            }

            sourceParentTiles.remove(concernedTiles);

            if(this.operatorMadeNull) {
                //operator will always be + that is removed.
                sourceParentTiles.at(this.sourcePos).set('operator', modelNameSpace.TileItem.OPERATORS.ADDITION);
            }
            for(index = 0, length = this.deletedTiles.length; index<length; index++) {
                sourceParentTiles.add(this.deletedTiles.pop(), { at: this.sourcePos }); //pop cause the last entered element should come out first.
            }
        }

    }, {

    });
})(window.MathInteractives);
