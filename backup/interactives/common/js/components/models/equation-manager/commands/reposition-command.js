(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * New Reposition command is responsible for the repositioning of the tiles
    * @class RepositionCommand
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */

    namespace.RepositionCommand = namespace.BaseCommand.extend({

        defaults: {},

        /**
		* The number of tiles that are selected by the user to reposition
		*
		* @attribute length
		* @type Number
		* @default null
		**/
        numOfTiles: null,

        /**
        * The Position of the the source tile w.r.t its parent collection
        *
        * @attribute sourcePos
        * @type Number
        * @default null
        **/
        sourcePos: null,

        /**
        * The Position of the the dest tile w.r.t its parent collection
        *
        * @attribute destPos
        * @type Number
        * @default null
        **/
        destPos: null,

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
            this.numOfTiles = data.source.numOfTiles;
            this.isDenominator =
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
            //this.tree = modelRef.getTree();
            this.oldOperators = [];

            var sourceIndexStr = this.source.index,
                destIndexStr = this.dest.index,
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE;
            if(sourceIndexStr.indexOf('-1') !== -1 || destIndexStr.indexOf('-1') !== -1 ) {
                return EXIT_CODE.FAILURE;
            }

            var sourceTile = modelRef.getItemFromIndex(sourceIndexStr),
                destTile = modelRef.getItemFromIndex(destIndexStr),
                sourceLoc = sourceTile.get('bDenominator'),
                destLoc = _.isBoolean(this.dest.isDenominator) ? this.dest.isDenominator : destTile.get('bDenominator'),
                sourceParent = modelRef.getItemFromIndex(this.getParentIndex(sourceIndexStr)),
                destParent = modelRef.getItemFromIndex(this.getParentIndex(destIndexStr));

            if(sourceTile && destTile) {
                this.sourceInDenominator = sourceTile.get('bDenominator');
                // int source & destination position w.r.t parent
                this.sourcePos = parseInt(this.getSourceWrtParent(sourceIndexStr), 10);
                this.destPos = parseInt(this.getSourceWrtParent(destIndexStr), 10);
                this.destLoc = destLoc;
                this.sourceTile = sourceTile;
                this.destTile = destTile;

                if (sourceParent === destParent) { //check for same parent
                    // if reposition from left to right
                    if (this.sourcePos < this.destPos) {
                        this.destPos -= this.numOfTiles;
                    }
                } else {
                    // don't allow across different parents
                    return EXIT_CODE.NOT_SAME_PARENT_COMBINE;
                }
                if (!this.isLeft) this.destPos++;

                // don't do anything if tile moved at it's own place
                if (sourceParent === destParent && this.destPos === this.sourcePos && sourceLoc === destLoc) {
                    return EXIT_CODE.FAILURE;
                }

                return this._executeReposition(sourceParent, destParent,  modelRef);
            }
            return EXIT_CODE.FAILURE;
        },

        /**
        * Undos the RepositionCommand
        *
        * @method undo
        * @param {Object} the model from which the command has to be indone
        **/
        undo: function (modelRef) {
            var sourceIndexStr = this.source.index,
                destIndexStr = this.dest.index,
                sourceParent = modelRef.getItemFromIndex(this.getParentIndex(sourceIndexStr)),
                destParent = modelRef.getItemFromIndex(this.getParentIndex(destIndexStr)),
                sourceParentTiles = sourceParent.get('tileArray'),
                destParentTiles = destParent.get('tileArray'),
                draggedTile = this.sourceTile,
                droppedTile = this.destTile,
                sourceLocation = draggedTile.get('bDenominator'),
                destLocation = droppedTile.get('bDenominator'),
                concernedTiles = this.movedTiles,
                sourceInDenominator = this.sourceInDenominator,
                firstDenominator = null,
                i = 0;

            if (modelRef.allOperatorsMultiplicative()) {
                this.addExtraOperators(sourceParentTiles, destParentTiles);

                if (this.oneTile) {
                    sourceParent.remove(this.oneTile);
                }

                if (this.removedOneTile) {
                    destParent.add(this.removedOneTile, { at: 0 });
                }

                destParentTiles.remove(concernedTiles);

                // add tiles to orig pos
                for (i = 0; i < concernedTiles.length; i++) {
                    concernedTiles[i].setBDenominator(sourceInDenominator);
                    sourceParentTiles.add(concernedTiles[i], { at: this.sourcePos + i });
                    if (sourceLocation !== sourceInDenominator) { this._invertExponent(concernedTiles[i]); }
                }

                if (this.addedTile) {
                    sourceParent.remove(this.addedTile);
                }

                this.removeExtraOperators(sourceParentTiles, destParentTiles);
                return;
            }

            destParentTiles.remove(concernedTiles);
            destParentTiles.at(0).set('operator', null);
            firstDenominator = destParentTiles.findWhere({ bDenominator: true });
            if (firstDenominator) firstDenominator.set('operator', null);

            for (i = 0, length = concernedTiles.length; i < length; i++) {
                sourceParentTiles.add(concernedTiles[i], { at: this.sourcePos + i });
            }
            draggedTile.set('operator', this.draggedOperator);
            droppedTile.set('operator', this.droppedOperator);
            sourceParentTiles.at(0).set('operator', null);
            firstDenominator = sourceParentTiles.findWhere({ bDenominator: true });
            if (firstDenominator) firstDenominator.set('operator', null);

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

            var sourceIndexStr = this.source.index,
                destIndexStr = this.dest.index,
                destIndex = null,
                nextTile = null,
                root = this.tree,
                sourceTile = this.modelRef.getItemFromIndex(this.source.index),
                destTile = this.modelRef.getItemFromIndex(this.dest.index),
                sourceLocation = sourceTile.get('bDenominator'),
                sourceParentTiles = sourceParent.get('tileArray'),
                destParentTiles = destParent.get('tileArray'),
                firstDenominator = null,
                sourceLocation = sourceTile.get('bDenominator'),
                tempNode = null,
                oldOperators = this.oldOperators,
                concernedTiles = [],
                toDenominator = this.destLoc,
                EXIT_CODE = modelClassNameSpace.CommandFactory.EXIT_CODE,
                TYPES = modelClassNameSpace.TileItem.BinTileType,
                modelRef =this.modelRef,
                i = 0;

            if (modelRef.allOperatorsMultiplicative()) {

                concernedTiles = this._getConcernedTiles(sourceParent);      // Tiles that are repositioned

                this.addExtraOperators(sourceParentTiles, destParentTiles);

                // removing tiles
                sourceParent.remove(concernedTiles);

                // adding tiles
                for (i = 0; i < concernedTiles.length; i++) {
                    if (sourceLocation !== toDenominator) { this._invertExponent(concernedTiles[i]); }
                    concernedTiles[i].setBDenominator(toDenominator);
                    destParent.add(concernedTiles[i], { at: this.destPos + i });
                }

                if (sourceParent.get('type') === TYPES.FRACTION && sourceParent.isNumeratorEmpty()) {
                    this._addOneTile(sourceParent);
                }

                if (destTile.isOne()) {
                    this.removedOneTile = destTile;
                    destParent.remove(destTile);
                }

                this.removeExtraOperators(sourceParentTiles, destParentTiles);
                this.movedTiles = concernedTiles;
                return EXIT_CODE.SUCCESS;
            }


            // Validate marquee
            if (this.numOfTiles > 1 && !this.validateMarquee(root, sourceTile, sourceParent, this.numOfTiles)) {
                return false;
            }
            // Validate reposition
            if (!this.validateReposition()) {
                return false;
            }

            this.exponent = sourceTile.get('exponent');                 // save exponent for undo
            concernedTiles = this._getConcernedTiles(sourceParent, sourceLocation === destLocation);      // Tiles that are repositioned

            if (modelRef.allOperatorsMultiplicative()) {
                // removing tiles
                sourceParentTiles.remove(concernedTiles);

                // adding tiles
                for (i = 0, length = concernedTiles.length; i < length; i++) {
                    destParentTiles.add(concernedTiles[i], { at: this.destPos + i });
                }
            }




            this.repositionTree(root, draggedNode, droppedNode);

            // removing tiles
            sourceParentTiles.remove(concernedTiles);

            // adding tiles
            for (i = 0, length = concernedTiles.length; i < length; i++) {
                destParentTiles.add(concernedTiles[i], { at: this.destPos + i });
            }

            this._handleEmptyDenOrNum(sourceParent);        // Handle the case when either the denominator is empty or the numerator is empty

            draggedOperator = this.getLeftOperator(this.draggedNode);
            droppedOperator = this.getLeftOperator(this.droppedNode);

            if (draggedOperator === '/') {
                draggedOperator = '*';
            }
            if (droppedOperator === '/') {
                droppedOperator = null;
            }
            sourceTile.set('operator', draggedOperator);
            tempNode = this.droppedNode;
            if (!_.isString(tempNode.data)) {
                tempNode.data.set('operator', droppedOperator);
            } else if (tempNode.collectionData) {
                tempNode.collectionData.set('operator', droppedOperator);
            }

            // Update operators of tiles next to the dragged and the dropped tile
            this._handleNextTileOperators(sourceTile, destTile);

            if (sourceParentTiles.length > 0) { sourceParentTiles.at(0).set('operator', null); }

            firstDenominator = sourceParentTiles.findWhere({ bDenominator: true });
            if (firstDenominator) firstDenominator.set('operator', null);

            if (destParentTiles.length > 0) { destParentTiles.at(0).set('operator', null); }
            firstDenominator = destParentTiles.findWhere({ bDenominator: true });
            if (firstDenominator) firstDenominator.set('operator', null);

            this._setDraggedExponent(draggedNode, droppedNode);

            return true;
        },

        /**
        * Performs the reposition operation in the tree. Useful for deducing the operators of the
        * tiles.
        *
        * @method repositionTree
        * @param {Object} Root of the n-ary tree
        * @param {Object} Dragged node
        * @param {Object} Dropped node
        */
        repositionTree: function (root, draggedNode, droppedNode) {
            var draggedParent = draggedNode.parent.children,
                droppedParent = droppedNode.parent.children,
                draggedOperator = draggedNode.parent,
                draggedPos = draggedParent.indexOf(draggedNode),
                droppedPos = null,
                currentNode = null,
                commonParent = this.getCommonParent(draggedNode, droppedNode),
                isLeft = this.isLeft;

            // For different parent.
            // Useful when say in   (6^7)^2  + 2^3*4^5
            // when parentheses is dragged beside 4^5 the dropped node is the
            // node representing the multiplication
            //      *
            //    /    \
            //  2^3    4^5
            if (draggedNode.parent !== droppedNode.parent) {
                currentNode = droppedNode;

                // iterate until you get representative node
                while (!currentNode.parent.isRoot() && !this._areSimilar(currentNode.parent, draggedOperator)) {
                    currentNode = currentNode.parent;
                }
                droppedNode = currentNode;

                // When dragging a tile from outside to inside a prentheses, the droppedNode
                // evaluates to ^ which is incorrect since
                // adding beside a ^ node doesn't make sense.
                // So make the left subtree's left subtree as the droppedNode
                //if (droppedNode.data === '^') {
                //    droppedNode = droppedNode.getLeftmostChild().getLeftmostChild();
                //}

                // All siblings of the dropped node
                droppedParent = droppedNode.parent.children;

            }

            this.droppedNode = droppedNode;
            this.draggedNode = draggedNode;

            if (droppedNode.parent.data === '/') { this._handleDivisionOperator(root, droppedNode); }

            draggedParent.splice(draggedPos, 1);
            //if (draggedNode.parent !== droppedNode.parent) {
            //    draggedParent.splice(draggedPos, 1);
            //} else {
            //    draggedNode.delete();
            //}
            droppedPos = droppedNode.parent.children.indexOf(droppedNode);
            droppedPos = isLeft ? droppedPos : droppedPos + 1;

            droppedNode.parent.children.splice(droppedPos, 0, draggedNode);
        },

        /**
        * Returns a boolean indicating if both nodes have similar operators.
        *
        * @method _areSimilar
        * @private
        * @param {Object} Node 1
        * @param {Object} Node 2
        * @return {Boolean} Boolean indicating if both nodes have similar operators.
        */
        _areSimilar: function (node1, node2) {
            if (node1.data === node2.data) return true;
            if (node1.data === '*' && node2.data === '/') return true;
            return false;
        },

        /**
        * Handle case when the dropped tile has a parent division operator. In that case a new * child
        * node has to be created.
        * e.g.      ÷
        *         /   \
        *       a       b
        *
        * If b is moved beside a then a  the new tree is
        *           ÷
        *         /   \
        *        *      1
        *      /   \
        *    a      b
        *
        * This method handles the creation of the new * node and the related handling
        *
        * @method _handleDivisionOperator
        * @private
        * @param {Object} Root of the tree
        * @param {Object} Dropped Node
        */
        _handleDivisionOperator: function (tree, droppedNode) {
            var mulNode = new modelClassNameSpace.TileItem.TreeNode('*'),
                siblings =  droppedNode.parent.children,
                index = siblings.indexOf(droppedNode);
            siblings.splice(index, 1);
            mulNode.children.push(droppedNode);
            siblings.splice(index, 0, mulNode);
            mulNode.parent = droppedNode.parent;
            droppedNode.parent = mulNode;
            this.droppedNode = droppedNode;
        },

        /**
        * Handles the case of an empty numerator or denominator. It adds a 1^1 tile if
        * an empty Numerator or Denominator is encountered
        *
        * @method _handleEmptyDenOrNum
        * @private
        * @param {Object} Source parent object
        */
        _handleEmptyDenOrNum: function (parent) {
            if (parent.get('type') !== modelClassNameSpace.TileItem.SolveTileType.FRACTION)
                return false;

            var tile,
                tiles = parent.get('tileArray');

            if (tiles.where({ 'bDenominator': false }).length === 0) {
                tile = new modelClassNameSpace.BaseExpTile();
                tile.set('base', 1);
                tile.set('exponent', 1);
                tile.set('bDenominator', false);
                tiles.add(tile, { at: 0 });
            }

            if (tiles.where({ 'bDenominator': true }).length === 0) {
                tile = new modelClassNameSpace.BaseExpTile();
                tile.set('base', 1);
                tile.set('exponent', 1);
                tile.set('bDenominator', true);
                tiles.add(tile);
            }
        },

        /**
        * Updates the tiles next to the dragged tile and the dropped tile
        *
        * @method _handleNextTileOperators
        * @private
        * @param {Object} Source tile which has been dragged
        * @param {Object} Destination tile which has been dropped next to
        */
        _handleNextTileOperators: function (sourceTile, destTile) {
            var sourceNext = sourceTile.next(),
                destNext = destTile.next(),
                root = this.tree,
                sourceNextNode = this.searchInTree(root, sourceNext),
                destNextNode = this.searchInTree(root, destNext);

            if (sourceNext) sourceNext.set('operator', this.getLeftOperator(sourceNextNode));
            if (destNext) destNext.set('operator', this.getLeftOperator(destNextNode));
        },

        /**
        * Validates whether a particular reposition command is allowable or not
        *
        * @method validateReposition
        * @return {Boolean} Boolean whether an operation is allowed or not
        */
        validateReposition: function () {
            var modelRef = this.modelRef,
                draggedTile = modelRef.getItemFromIndex(this.source.index),
                droppedTile = modelRef.getItemFromIndex(this.dest.index),
                root = this.tree,
                draggedNode = null,
                droppedNode = null,
                draggedOperator = null,
                droppedOperator = null,
                isLeft = this.isLeft,
                lastParentMulDivNode = null,
                dir = null;

            draggedNode = this.getDraggedNode(draggedTile);
            droppedNode = this.getDroppedNode(droppedTile);

            // move within same parent
            if (_.isEqual(draggedNode.parent, droppedNode.parent)) return true;


            draggedOperator = draggedNode.getOperator();
            droppedOperator = droppedNode.getOperator();

            // save this for later. this will be needed when you need to decide operators for the dragged & the dropped tile after reposition
            this.draggedOperator = draggedOperator;
            this.droppedOperator = droppedOperator;
            this.draggedTile = draggedTile;
            this.droppedTile = droppedTile;

            //dir = droppedNode.isLeftChild() ? 'left' : 'right';


            if (this.belongsTo(draggedOperator, ['*', '/']) && this.belongsTo(droppedOperator, ['*', '/'])) {
                // simple case in which dragged and dropped are multiplicative in nature
                // TODO this case is not needed
                return this.validatePath(draggedNode, droppedNode);
            } else if (this.isMulOrDiv(draggedOperator) && this.isAddOrSub(droppedOperator)) {
                // * can never be dropped on +
                return false;
            } else if (this.isAddOrSub(draggedOperator) && this.isMulOrDiv(droppedOperator)) {
                // + dragged on *
                if (droppedNode.isLeftmostChild() && isLeft || droppedNode.isRightmostChild() && !isLeft) {
                    if (droppedNode.isLeftmostChild()) { dir = 'left'; }
                    else if (droppedNode.isRightmostChild()) { dir = 'right'; }
                    lastParentMulDivNode = this.getLastParentMulOrDivNode(dir, droppedNode);
                    if (_.isEqual(lastParentMulDivNode.parent, draggedNode.parent)) { return true; }
                    return this.validatePath(draggedNode, lastParentMulDivNode);
                } else {
                    return this.validatePath(draggedNode, droppedNode);
                }
            }
            return false;
        },

        /**
        * Validates the operators that lie in the path from the draggedNode to the droppedNode
        *
        * @method validatePath
        * @param {Object} node which was dragged
        * @param {Object} node which was dropped upon
        * @return {Boolean} Whether or not to allow the reposition. It's a boolean representing the validity of the reposition operation.
        */
        validatePath: function (draggedNode, droppedNode) {
            var operators = this.getOperatorStringsBetween(draggedNode, droppedNode),
                draggedOperator = draggedNode.parent.data,
                droppedOperator = droppedNode.parent.data;

            // TODO this doesn't handle minus (-) operator
            if (this.allowPlusAndCarat(draggedNode, droppedNode) ||
                (this.allowedOperators(operators) && this.allowCarat(draggedNode, droppedNode))) {
                // also handles case when there is a single carat between the two nodes and the exponent of dragged tile matches
                return true;
            }

            return false;
        },

        /**
        * Return a boolean indicating whether to allow the reposition operation across carats
        *
        * @method allowCarat
        * @param {Object} Dragged node
        * @param {Object} Dropped node
        * @return {Boolean} boolean indicating whether to allow the reposition operation across carats
        */
        allowCarat: function (draggedNode, droppedNode) {
            var validCarats = 0,    // valid carats are all those carats that have exponent > 1 between commonparent & droppedNode
                exp = null,         // exponent of the dropped position
                commonParent = this.getCommonParent(draggedNode, droppedNode),
                currentNode = draggedNode,
                droppedOperators = this.getOperatorsBetween(commonParent, droppedNode),
                operators = this.getOperatorsBetween(commonParent, draggedNode),
                i = 0;

            // don't consider commonParents's exponent
            // useful when a child dragged beside a parentheses item
            if (commonParent.data === '^') droppedOperators = _.without(droppedOperators, commonParent);

            for (i = 0; i < droppedOperators.length; i++) {
                if (droppedOperators[i].data === '^' && droppedOperators[i].children[1].data !== 1) {
                    exp = droppedOperators[i].children[1].data;
                }
            }

            for (i = 0; i < operators.length; i++) {
                if (operators[i].data === '^' && operators[i].children[1].data !== 1) {
                    validCarats++;
                }
            }

            if (validCarats > 1) return false;
            else if (exp === null && validCarats === 0) return true;
            else if (exp === null) return false;
            else if (exp === draggedNode.getTotalExponentUpto(commonParent) && this.sameLocation(draggedNode, droppedNode)) {
                return true;
            }

            return false;
        },

        /**
        * Returns a boolean representing whether the draggedNode and the droppedNodes are both in the
        * numerator or the denominator.
        *
        * @method sameLocation
        * @param {Object} Dragged node
        * @param {Object} Dropped node
        * @return {Boolean} True if both the nodes are in the numerator or the denominator. False otherwise.
        */
        sameLocation: function (draggedNode, droppedNode) {
            var srcLoc, destLoc;
            if (!_.isString(draggedNode.data)) {
                srcLoc = draggedNode.data.get('bDenominator');
            } else {
                srcLoc = draggedNode.collectionData.get('bDenominator');
            }

            if (droppedNode.data) {
                destLoc = droppedNode.data.get('bDenominator');
            } else {
                destLoc = droppedNode.collectionData.get('bDenominator');
            }

            return srcLoc === destLoc;
        },


        /**
        * Return a boolean indicating whether to allow the reposition operation across carats and plus. It will return true when the
        * carat has exponent 1, in which case the plus is allowed to go inside the parentheses.
        *
        * @method allowPlusAndCarat
        * @param {Object} Dragged node
        * @param {Object} Dropped node
        * @return {Boolean} boolean indicating whether to allow the reposition operation across carats
        */
        allowPlusAndCarat: function (draggedNode, droppedNode) {
            //var validCarats = 0,    // valid carats are all those carats that have exponent > 1
            //    exp = null,
            //    commonParent = this.getCommonParent(draggedNode, droppedNode),
            //    currentNode = draggedNode,
            //    operators = this.getOperatorsBetween(draggedNode, droppedNode),
            //    operatorStrings = this.getOperatorStringsBetween(draggedNode, droppedNode),
            //    i = 0;

            //// if any operators between draggedNode and dropppedNode other than +, -, and ^ then return false
            //if (!_.isEqual(_.intersection(operatorStrings, ['*', '/']), [])) return false;

            //for (i = 0; i < operators.length; i++) {
            //    if (operators[i].data === '^' && operators[i].children[1].data !==1) {
            //        validCarats++;
            //        exp = operators[i].children[1].data;
            //    }
            //}

            //if (validCarats > 1) return false;
            //else if (exp === null) return true;
            //else if (exp === 1) return true;


            // Fails for some cases such as (ab+c)d
            // Say user tries to drag c outside parens. It's invalid
            // Dragging outside parens should always be not allowed
            // TODO discuss
            return false;
        },

        /**
        * Returns the multiplicative or divisive parent of a node
        *
        * @method getLastParentMulOrDivNode
        * @param {String} direction to move in
        * @param {Object} Node whose parent is to be found
        * @return {Object} multiplicative or divisive parent of a node
        */
        getLastParentMulOrDivNode: function (dir, node) {
            var root = this.tree;

            if (node.isRoot()) return node;

            if (node.parent.data !== '*' /*&& node.parent.data !== '/'*/ && node.parent.data !== '^') {
                return node;
            }

            if (node.isLeftmostChild() && dir === 'left' ||
                node.isRightmostChild() && dir === 'right') {
                return this.getLastParentMulOrDivNode(dir, node.parent);
            } else if (node.isLeftmostChild() && dir === 'right') {
                return node.parent;
            } else if (node.isRightmostChild() && dir === 'left') {
                return node.parent;
            }
        },

        /**
        * Returns the left most child tile of the param tile
        *
        * @method getLeftmostTile
        * @param {Object} Tile whose left most child has to be found
        * @return {Object} Left most child tile
        */
        getLeftmostTile: function (tile) {
            var child = tile.get('tileArray').at(0);

            if (child.get('type') === modelClassNameSpace.TileItem.SolveTileType.BASE_EXPONENT) return child;
            else return this.getLeftmostTile(child);
        },

        /**
        * Returns the nesting level of the left most child tile
        *
        * @method getNestingOfLeftmostTile
        * @param {Object} Tile whose left most child has to be found
        * @return {Number} Nesting of the left most child tile
        */
        getNestingOfLeftmostTile: function (tile) {
            var currentChild = tile.get('tileArray').at(0),
                nesting = 1;

            // if there is a tileArray increment nesting and look inside the tileArray
            while (currentChild.get('tileArray') !== null) {
                nesting++;
                currentChild = currentChild.get('tileArray').at(0);
            }
            return nesting;
        },

        /**
        * Returns the droppedNode, given the droppedTile. Useful in the case where the droppedTile is a PARENTHESES tile
        * In that case the carat node representing the parentheses tile is returned. Otherwise the base exponent node is returned.
        *
        * @method getDroppedNode
        * @param {Object} Tile which is dropped upon
        * @return {Object} Node representing the droppedTile
        */
        getDroppedNode: function (droppedTile) {
            return this.searchInTree(this.tree, droppedTile);
            //// if it's a simple leaf tile then use the searchTree method
            //if (droppedTile.get('type') === modelClassNameSpace.TileItem.SolveTileType.BASE_EXPONENT) {
            //    return this.searchInTree(this.tree, droppedTile);
            //}

            //var root = this.tree,
            //    leftMostTile = this.getLeftmostTile(droppedTile),
            //    currentNode = this.searchInTree(root, leftMostTile),
            //    nesting = this.getNestingOfLeftmostTile(droppedTile);

            //// traverse until you find the carat representing the droppedTile
            //while (currentNode.data !== '^' && nesting !== 0) {
            //    if (currentNode.data === '^') nesting--;

            //    currentNode = currentNode.parent;
            //}

            //return currentNode;

        },

        /**
        * Returns the draggedNode, given the draggedTile. Useful in the case where the draggedTile is a PARENTHESES tile
        * In that case the carat node representing the parentheses tile is returned. Otherwise the base exponent node is returned.
        *
        * @method getDraggedNode
        * @param {Object} Tile which is dragged
        * @return {Object} Node representing the draggedTile
        */
        getDraggedNode: function (draggedTile) {
            //if (draggedTile.get('type') === modelClassNameSpace.TileItem.SolveTileType.BASE_EXPONENT && this.numOfTiles === 1) {

            //}

            var root = this.tree,
                parent = this.modelRef.getItemFromIndex(this.getParentIndex(this.source.index));

            if (this.numOfTiles > 1) {
                return this.getMarqueeNode(root, draggedTile, parent, this.numOfTiles);
            } else {
                return this.searchInTree(this.tree, draggedTile);
            }
            //leftMostTile = this.getLeftmostTile(draggedTile);
            //nesting = this.getNestingOfLeftmostTile(draggedTile);

            //while (!currentNode.isRoot() && nesting !== 0) {
            //    currentNode = currentNode.parent;
            //    if (currentNode.data === '^') nesting--;
            //}

            //return currentNode;
        },

        /**
        * Returns the exponent at the level of the dropped node. Used when setting the exponent of the dragged node.
        *
        * @method getExponentUptoDroppedNode
        * @param {Object} Dragged node
        * @param {Object} Dropped node
        * @return {Number} EXPONENT at the level of the dropped node
        */
        getExponentUptoDroppedNode: function (draggedNode, droppedNode) {
            var commonParent = this.getCommonParent(draggedNode, droppedNode),
                currentNode = droppedNode,
                exponent = null;

            //  go from node2 to commonParent
            while (!_.isEqual(currentNode, commonParent) && !_.isEqual(currentNode.parent, commonParent)) {
                if (currentNode.parent.data === '^') exponent = currentNode.parent.getRightmostChild().data;
                currentNode = currentNode.parent;
            }

            return exponent;
        },

        /**
        * Sets the new exponent of the dragged tile according to exponent rules.
        * When dragged inside parentheses it divided the tile's exponent with the parentheses exponent.
        *
        * @method _setDraggedExponent
        * @private
        * @param {Object} Dragged node
        * @param {Object} Dropped node
        */
        _setDraggedExponent: function (draggedNode, droppedNode) {
            var exp = this.getExponentUptoDroppedNode(draggedNode, droppedNode),
                draggedTile = this.draggedTile;
            if (exp !==null) {
                draggedTile.set('exponent', draggedTile.get('exponent') / exp);
            }
        },

        ///**
        //* Returns the concerned tiles in question. The tiles that are dragged and are supposed
        //* to be repositioned are returned.
        //*
        //* @method _getConcernedTiles
        //* @private
        //* @param {Object} Parent tile of the repositioned tiles
        //* @return {Array} Tiles that are dragged and are supposed to be repositioned are returned.
        //*/
        //_getConcernedTiles: function (parent, samePos) {
        //    var sourceParentTiles = parent.get('tileArray'),
        //        concernedTiles = [],
        //        i;
        //    // Num to Num or Den to Den
        //    if (samePos) {
        //        for (i = 0; i < this.numOfTiles; i++) {
        //            concernedTiles[i] = sourceParentTiles.at(this.sourcePos + i);
        //        }
        //    } else {
        //        for (i = 0; i < this.numOfTiles; i++) {
        //            concernedTiles[i] = sourceParentTiles.at(this.sourcePos + i);
        //            // invert exponent if num to den or den to num
        //            this._invertLocation(concernedTiles[i]);
        //        }
        //    }

        //    return concernedTiles;
        //},

        /**
        * It negates the bDenominator in case of it moving from numerator to denominator or vica-versa
        *
        * @method _invertLocation
        * @private
        * @param {Object} The tile of which the exp has to be inverted
        */
        _invertLocation: function _invertLocation(tiles) {
            var i = 0,
                oldLoc = null;

            if (tiles instanceof Backbone.Model) { tiles = [tiles]}
            for (i = 0; i < tiles.length; i++) {
                oldLoc = tiles[i].get('bDenominator');
                tiles[i].setBDenominator(!oldLoc);
            }
        },

        /**
        * It negates the exponent in case of it moving from numerator to denominator or vica-versa
        *
        * @method _invertExponent
        * @private
        * @param {Object} The tile of which the exp has to be inverted
        */
        _invertExponent: function _invertLocation(tiles) {
            var i = 0,
                oldExp = null;

            if (tiles instanceof Backbone.Model) { tiles = [tiles]}
            for (i = 0; i < tiles.length; i++) {
                oldExp = tiles[i].get('exponent');
                if (oldExp) { tiles[i].set('exponent', oldExp * -1); }
            }
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
        * Adds a lone static BASE_ONLY tile with base = 1 and which is not draggable, nor droppable.
        * @method _addOneTile
        * @private
        * @param {Object} Fraction tile to which the one tile should be added
        */
        _addOneTile: function (fraction) {
            var createTileItem = modelClassNameSpace.TileItem.createTileItem,
                TYPES = modelClassNameSpace.TileItem.BinTileType;
            this.oneTile = createTileItem({
                type: TYPES.BASE_ONLY,
                isDraggable: false,
                isDroppable: false,
                base: 1,
                ignoreMarquee: true,
                operator: '*'
            });

            fraction.add(this.oneTile, { at: 0 });
        }

    });
})();
