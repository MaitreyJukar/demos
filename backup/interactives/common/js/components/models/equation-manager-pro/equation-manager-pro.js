(function (MathInteractives) {
    'use strict';

    MathInteractives.Common.Components.Models.EquationManagerPro = {};
    MathInteractives.Common.Components.Views.EquationManagerPro = {};

    var modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro;

    /**
    * EquationManagerPro holds the data for the EquationManager View
    *
    * @class EquationManagerPro
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Player.Models.Base
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    */
    modelClassNameSpace.EquationManagerPro = MathInteractives.Common.Player.Models.Base.extend({
        defaults: {



            /**
            * allowed operations for an interactive
            *
            * @attribute allowedOperation
            * @type Number
            * @default null
            */
            allowedOperation: null,

            tileAddedFromBinValue: null,

            addTileInExpression: null,

            resetBtnStatus: false,

            isFirstTileDrop: false,

            isFractionToDecimalAllowed: false,

            operationPerformed: {
                'operation': null,
                'isDenominator': null
            },

            numberToReplaceInBin: null


        }
    }, {
        Utils: {

            /**
            * Checks if the tile item given is a basic tile type. like term tile or base exponent
            * @method isBasicTileType
            * @public
            *
            * @param   {Object}  tile The model whose type is to be determined.
            * @returns {Boolean} true if it is the basic tile tile type else false.
            * @static
            */
            isBasicTileType: function isBasicTileType(tile) {
                var tileType = tile.get('type'),
                    tileClass = modelClassNameSpace.TileItem.TileType;
                return tileType === tileClass.TERM_TILE || tileType === tileClass.BASE_EXPONENT;
            },

            /**
            * Returns the position of a tile inside the parent.
            * For a location string "0.1.2.3" the position of the parent is "0.1.2" and the position of the tile
            * with respect to parent is "3"
            *
            * @method getSourceWrtParent
            * @param {String} index of a tile
            * @return {String} index of tile with respect to parent
            * @static
            */
            getSourceWrtParent: function (index) {
                var lastIndexSeparator = index.lastIndexOf(modelClassNameSpace.CommandFactory.SEPARATOR);
                return index.substring(lastIndexSeparator + 1);
            },

            /**
            * Returns the index string of the parent.
            * For an index string "0.1.2.3" the position of the parent is "0.1.2"
            *
            * @method getParentIndex
            * @param {String} index of a tile
            * @return {String} index string of parent
            * @static
            */
            getParentIndex: function (index) {
                if (index.length === 1) {
                    return "";
                }
                var lastIndexSeparator = index.lastIndexOf(modelClassNameSpace.CommandFactory.SEPARATOR);
                return index.substring(0, lastIndexSeparator);
            },

            /**
            * Will return the parent tiles the givwn tile index
            * @param   {Object}   modelRef The reference to the equation view model
            * @param   {String}   index    The index string refering a tile
            * @param   {[[Type]]} length   [[Description]]
            *
            * @method getParentTiles
            * @static
            */
            getParentTiles: function (modelRef, index) {
                index = modelClassNameSpace.EquationManagerPro.Utils.getParentIndex(index);
                return modelRef.getModelFromIndex(index).get('tileArray');
            },

            /**
            * Return the common parent of the  two nodes
            *
            * @method getCommonParent
            * @param {Object} one node whose common parent is to be found
            * @param {Object} another node whose common parent is to be found
            * @return {Object} common parent of the two nodes i.e. node1 and node2
            * @static
            */
            getCommonParent: function (node1, node2) {
                var node1Path = node1.getPath(),
                    node2Path = node2.getPath(),
                    root = node1.getTreeRoot(),
                    length = Math.min(node1Path.length, node2Path.length),
                    commonParentPos = [],       // root node
                    i = 0;

                for (; i < length; i++) {
                    if (node1Path[i] === node2Path[i]) {
                        commonParentPos[i] = node1Path[i];
                    }
                    else {
                        break;
                    }
                }
                return root.getChildAt(commonParentPos);
            },

            /**
            * Return the common parent of the  multiple nodes
            *
            * @method getCommonParentFromMultiple
            * @param {Array} Nodes whose common parent is to be found
            * @return {Object} common parent of all the nodes
            * @static
            */
            getCommonParentFromMultiple: function (nodes) {
                if (nodes.length === 1) {
                    return nodes[0];
                }

                var currentCommonParent = modelClassNameSpace.EquationManagerPro.Utils.getCommonParent(nodes[0], nodes[1]),
                    i = 0;
                if (nodes.length === 2) {
                    return currentCommonParent;
                }

                for (i = 2; i < nodes.length && !currentCommonParent.isRoot() ; i++) {
                    currentCommonParent = modelClassNameSpace.EquationManagerPro.Utils.getCommonParent(currentCommonParent, nodes[i]);
                }

                return currentCommonParent;
            },

            /**
            * Returns an array of operators between node 1 and node 2
            *
            * @method getOperatorsBetween
            * @param {Object} First node
            * @param {Object} Second node
            * @return {Array} Operator nodes between the two nodes
            * @static
            */
            getOperatorsBetween: function (node1, node2) {
                var commonParent = modelClassNameSpace.EquationManagerPro.Utils.getCommonParent(node1, node2),
                    operators = {},
                    operator = null,
                    currentNode = node1,
                    parentOperator,
                    node1ToParentOperators = [],
                    node2ToParentOperators = [];

                // add commonParent operator
                operators.commonParentOperator = commonParent;

                //  go from node1 to commonParent
                while (!_.isEqual(currentNode, commonParent) && !_.isEqual(currentNode.parent, commonParent)) {
                    operator = currentNode.parent;
                    node1ToParentOperators.push(operator);
                    currentNode = currentNode.parent;
                }
                operators.node1ToParentOperators = node1ToParentOperators;

                currentNode = node2;
                //  go from node2 to commonParent
                while (!_.isEqual(currentNode, commonParent) && !_.isEqual(currentNode.parent, commonParent)) {
                    operator = currentNode.parent;
                    node2ToParentOperators.push(operator);
                    currentNode = currentNode.parent;
                }
                operators.node2ToParentOperators = node2ToParentOperators;

                return operators;
            },

            /**
            * Returns operator strings between two nodes
            *
            * @method getOperatorStringsBetween
            * @param {Object} First node
            * @param {Object} Second node
            * @return {Array} Operator strings between the two nodes
            * @static
            */
            getOperatorStringsBetween: function (node1, node2) {
                var operators = modelClassNameSpace.EquationManagerPro.Utils.getOperatorsBetween(node1, node2),
                    operatorStrings = [],
                    i = 0;
                for (i = 0; i < operators.node1ToParentOperators.length; i++) {
                    operatorStrings.push(operators.node1ToParentOperators[i].data);
                }
                operatorStrings.push(operators.commonParentOperator.data);
                for (i = 0; i < operators.node2ToParentOperators.length; i++) {
                    operatorStrings.push(operators.node2ToParentOperators[i].data);
                }
                return operatorStrings;
            },

            /**
            * Converts an array of tiles to an array of nodes.
            *
            * @method tilesToNodes
            * @param {Object} Root node of the tree
            * @param {Array} Array of tiles
            * @return {Array} Array of nodes
            * @static
            */
            tilesToNodes: function (root, tiles) {
                var nodes = [],
                    i = 0;
                for (i = 0; i < tiles.length; i++) {
                    nodes.push(modelClassNameSpace.EquationManagerPro.Utils.searchInTree(root, tiles[i]));
                }
                return nodes;
            },

            /**
            * Searches for the given model in the tree
            * @param   {Object} root  The root node
            * @param   {Object} model The given model needed to be searched
            * @returns {Object} The tree node where that model resides
            * @static
            */
            searchInTree: function (root, model) {
                var index, foundNode;
                if (root === null || root === undefined) {
                    return null;
                }
                if (root.data === model || root.collectionData === model) {
                    return root;
                }
                else {
                    for (index = 0; index < root.children.length; index++) {
                        foundNode = modelClassNameSpace.EquationManagerPro.Utils.searchInTree(root.children[index], model);
                        if (foundNode !== null && foundNode !== undefined) {
                            return foundNode;
                        }
                    }
                }
            },

            /**
            * Gets model from tree node
            * @method getModelDataFromTreeNode
            * @public
            *
            * @param   {Object} child The tree node
            * @returns {Object} The model from the tree node
            * @static
            */
            getModelDataFromTreeNode: function (child) {
                if (_.isString(child.data)) {
                    if (child.collectionData) {
                        return child.collectionData;
                    }
                }
                return child.data;
            },

            /**
            * Checks the equation's L.H.S. and R.H.S.; if empty then create a non-draggable, non-clickable, non-selectable
            * "0" tile and return it.
            *
            * @method checkAndGenerateStaticZeroForEquation
            * @param modelRef {Object} The equation's model instance.
            * @param [options] {Object} Additional data.
            * @param [options.ignoreRHS] {Boolean} If RHS is not to be checked, pass true.
            * @return {Object} Returns the static zero tile's model if added, else returns false.
            * @static
            */
            checkAndGenerateStaticZeroForEquation: function (modelRef, options) {
                options = options || {};
                var expressions = modelRef.get('tileArray'),
                    expression, tiles, newTile,
                    checkLimit = (options.ignoreRHS) ? 1 : 2,
                    index;
                for (index = 0; index < checkLimit; index++) {
                    expression = expressions.at(index);
                    tiles = expression.get('tileArray');
                    if (tiles.length === 0) {
                        newTile = modelClassNameSpace.TileItem.createTileItem({
                            type: modelClassNameSpace.TileItem.TileType.TERM_TILE,
                            base: 0,
                            operator: null,
                            isDraggable: false,
                            isDroppable: false,
                            ignoreMarquee: true,
                            isLHS: index === 0
                        });
                        tiles.add(newTile);
                        return newTile;
                    }
                }
                return false;
            },

            /**
            * Traverses down the tree, starting from the passed node and returns true if a term tile with 'i' (iota) or
            * string (variable) as base is encountered.
            *
            * @method _hasVariableTermTile
            * @param node {Object} The tree node object that needs to be checked.
            * @return {Boolean} True, is such a tile was found; else, false.
            */
            _hasVariableTermTile: function _hasVariableTermTile(node, checkingMethod) {
                var index, hasVariable = false;
                if (node.children.length) {
                    for (index = node.children.length - 1; index >= 0; index--) {
                        hasVariable = modelClassNameSpace.EquationManagerPro.Utils._hasVariableTermTile(
                            node.children[index], checkingMethod);
                        if (hasVariable) {
                            break;
                        }
                    }
                }
                else {
                    hasVariable = checkingMethod.call(this, node);
                }
                return hasVariable;
            },

            /**
            * Checks whether the node is a term tile with string (variable) as its base.
            *
            * @method _isVariableTermTile
            * @param node {Object} The tree node that needs to be checked.
            * @return {Boolean} True, if the node is a term tile with string (variable) as its base.
            */
            _isVariableTermTile: function _isVariableTermTile(node) {
                var nodeModel = node.data;
                return (nodeModel instanceof modelClassNameSpace.TermTile &&
                    typeof nodeModel.get('base') === 'string');
            },

            /**
            * Checks whether the node is a term tile with 'i' (iota) or string (variable) as its base.
            *
            * @method _isNonNumericTermTile
            * @param node {Object} The tree node that needs to be checked.
            * @return {Boolean} True, if the node is a term tile with 'i' (iota) or string (variable) as its base.
            */
            _isNonNumericTermTile: function _isNonNumericTermTile(node) {
                var nodeModel = node.data;
                return (nodeModel instanceof modelClassNameSpace.TermTile &&
                    (typeof nodeModel.get('base') === 'string' || nodeModel.get('iotaExponent')));
            },

            /**
            * Checks whether the node is a "0" tile.
            *
            * @method _isZeroTile
            * @param node {Object} The tree node that needs to be checked.
            * @return {Boolean} True, if the node is a "0" term tile.
            */
            _isZeroTile: function _isZeroTile(node) {
                var nodeModel = node.data;
                return (nodeModel instanceof modelClassNameSpace.TermTile &&
                    nodeModel.get('base') === 0);
            },

            /**
            * Checks whether the node is a term tile with 'i' (iota) or string (variable) as its base.
            *
            * @method _isVariableImaginaryTermTile
            * @param node {Object} The tree node that needs to be checked.
            * @return {Boolean} True, if the node is a term tile with 'i' (iota) or string (variable) as its base.
            */
            _isVariableImaginaryTermTile: function _isVariableImaginaryTermTile(node, options) {
                options = options || {};
                var nodeModel = node.data,
                    base, iotaExponent, squareRootProps,
                    isImaginary,
                    returnVal = false;
                if (nodeModel instanceof modelClassNameSpace.TermTile) {
                    base = nodeModel.get('base');
                    iotaExponent = nodeModel.get('iotaExponent');
                    squareRootProps = nodeModel.get('squareRootProps');
                    isImaginary = (iotaExponent && !squareRootProps) ||   // term with an "i" and no root
                        (iotaExponent && squareRootProps && base > 0) || // term with an "i" and root of positive number
                        (!iotaExponent && squareRootProps && base < 0); // term with no "i" and a root of negative number)
                    if (options.checkForIotaOnly) {
                        if (isImaginary) {
                            returnVal = true;
                        }
                    }
                    else if (typeof base === 'string' /* variable */ || isImaginary) {
                        returnVal = true;
                    }
                }
                return returnVal;
            },

            /**
            * Checks whether the node is a term tile with 'i' (iota) square in its base.
            *
            * @method _isIotaSquareTerm
            * @param node {Object} The tree node that needs to be checked.
            * @return {Boolean} True, if the node is a term tile with 'i' (iota) square in its base.
            */
            _isIotaSquareTerm: function _isIotaSquareTerm(node) {
                var nodeModel = node.data;
                return (nodeModel instanceof modelClassNameSpace.TermTile && nodeModel.get('iotaExponent') === 2);
            },

            /**
            * Checks for "i^2" tile or even number of "i" tiles multiplied to each other
            *
            * @method hasCombinableImaginaryTerms
            * @param node {Object} Node to be checked.
            */
            hasCombinableImaginaryTerms: function hasCombinableImaginaryTerms(node) {
                var nodeData = node.data,
                    index, count,
                    children = node.children,
                    operators = modelClassNameSpace.TileItem.OPERATORS;
                switch (nodeData) {
                    case operators.ADDITION:
                        // loop through all operands, break if even if one has Combinable Imaginary Terms
                        for (index = 0; index < children.length; index++) {
                            if (modelClassNameSpace.EquationManagerPro.Utils.hasCombinableImaginaryTerms(children[index])) {
                                return true;
                            }
                        }
                        return false;
                        break;
                    case operators.PARENTHESES:
                        // check if first child is imaginary
                        // ignore second child as it stores only the exponent
                        return modelClassNameSpace.EquationManagerPro.Utils.hasCombinableImaginaryTerms(children[0]);
                        break;
                    case operators.MULTIPLICATION:
                        // loop through all operands, break if even if one has Combinable Imaginary Terms
                        for (index = 0; index < children.length; index++) {
                            if (modelClassNameSpace.EquationManagerPro.Utils.hasCombinableImaginaryTerms(children[index])) {
                                return true;
                            }
                        }
                        // return true if number of imaginary operands is non-zero and even
                        count = 0;
                        for (index = 0; index < children.length; index++) {
                            if (modelClassNameSpace.EquationManagerPro.Utils._hasImaginaryTerm(children[index])) {
                                count++;
                            }
                        }
                        return (count > 0 && count % 2 === 0);
                        break;
                    case operators.DIVISION:
                        // no division and imaginary numbers possible
                        return false;
                        break;
                    default:
                        return modelClassNameSpace.EquationManagerPro.Utils._isIotaSquareTerm(node);
                        break;
                }
            },

            /**
            * Checks for "i" tile in node
            *
            * @method _hasImaginaryTerm
            * @param node {Object} Node to be checked.
            */
            _hasImaginaryTerm: function _hasImaginaryTerm(node) {
                var nodeData = node.data,
                    index, count,
                    children = node.children,
                    operators = modelClassNameSpace.TileItem.OPERATORS;
                switch (nodeData) {
                    case operators.ADDITION:
                        // loop through all operands, break if even if one has Combinable Imaginary Terms
                        for (index = 0; index < children.length; index++) {
                            if (modelClassNameSpace.EquationManagerPro.Utils._hasImaginaryTerm(children[index])) {
                                return true;
                            }
                        }
                        return false;
                        break;
                    case operators.PARENTHESES:
                        // check if first child is imaginary
                        // ignore second child as it stores only the exponent
                        return modelClassNameSpace.EquationManagerPro.Utils._hasImaginaryTerm(children[0]);
                        break;
                    case operators.MULTIPLICATION:
                        // return true if number of imaginary operands is odd
                        count = 0;
                        for (index = 0; index < children.length; index++) {
                            if (modelClassNameSpace.EquationManagerPro.Utils._hasImaginaryTerm(children[index])) {
                                count++;
                            }
                        }
                        return (count % 2 !== 0);
                        break;
                    case operators.DIVISION:
                        // no division and imaginary numbers possible
                        return false;
                        break;
                    default:
                        return (nodeData instanceof modelClassNameSpace.TermTile &&
                            modelClassNameSpace.EquationManagerPro.Utils._isVariableImaginaryTermTile(node, {
                                checkForIotaOnly: true
                            }));
                        break;
                }
            },

            /**
            * Returns an array of leaf nodes for a paticular parent node.
            *
            * @method getAllLeaves
            * @param node{Object} Node whose leaf nodes are to be returned
            * @param isExponent{Boolean} In case its an exponent return the exponent node first and then the base
            * @return {Array}  Array of leaf nodes.
            */
            getAllLeaves: function (node, isExponent) {
                var returnArr = [], i,
                    nodeData = node.data;

                if (nodeData === null) {
                    return [];
                }
                if (node.isLeaf()) {
                    return [node];
                }

                if (isExponent && node.data === '^') {
                    for (i = node.children.length - 1; i >= 0; i--) {
                        Array.prototype.push.apply(returnArr, this.getAllLeaves(node.children[i], isExponent));
                    }
                }
                else {
                    for (i = 0; i < node.children.length; i++) {
                        Array.prototype.push.apply(returnArr, this.getAllLeaves(node.children[i], isExponent));
                    }
                }
                return returnArr;
            },


            /**
             * compare parentheses nodes are equal
             * @method _compareParenthesesEqual
             * @private
             *
             * @param {TreeNode} sourceNode The source parentheses tree node.
             * @param {TreeNode} destNode   The dest Parentheses tree node.
             */
            _compareParenthesesEqual: function _compareParenthesesEqual(sourceNode, destNode) {
                var sourceChildren = sourceNode.children,
                    destChildren = destNode.children,
                    sourceLeaves, destLeaves, index;
                if (sourceChildren.length !== destChildren.length) {
                    return false;
                }
                //get the path along with data and operators to compare.
                sourceLeaves = this._getBaseWithParentsToCompare(modelClassNameSpace.EquationManagerPro.Utils.getAllLeaves(sourceNode));
                destLeaves = this._getBaseWithParentsToCompare(modelClassNameSpace.EquationManagerPro.Utils.getAllLeaves(destNode));

                if (sourceLeaves.length !== destLeaves.length) {
                    return false;
                }
                //same sorting algo on both will be used.
                sourceLeaves.sort();
                destLeaves.sort();

                for (index = 0; index < sourceLeaves.length; index++) {
                    if (sourceLeaves[index] !== destLeaves[index]) {
                        return false;
                    }
                }
                return true;
            },

            /**
             * Gets base with parents to compare. will return a string containing the base of the leaf node, with all its
             * parent operators till it reaches '^' operator.
             * eg: 4*+^. Used to compare the commutative property.
             * @method _getBaseWithParentsToCompare
             * @private
             *
             * @param   {Array} leafNodes All the leaf nodes whose parents are to be returned.
             * @returns {Array} The modified array of strings as shown above.
             */
            _getBaseWithParentsToCompare: function _getBaseWithParentsToCompare(leafNodes) {
                var index, currentNode, newString = '',
                    iotaExp, squareRootProps;
                for (index = 0; index < leafNodes.length; index++) {
                    currentNode = leafNodes[index];
                    iotaExp = currentNode.data.get('iotaExponent');
                    squareRootProps = currentNode.data.get('squareRootProps');
                    newString = currentNode.data.get('base') + '';
                    if (iotaExp) {
                        newString += 'i' + iotaExp + '';
                    }
                    if (squareRootProps) {
                        newString += squareRootProps.exponent + '';
                        newString += squareRootProps.isNegative + '';
                    }
                    while (currentNode.data !== modelClassNameSpace.TileItem.OPERATORS.PARENTHESES) {
                        currentNode = currentNode.parent;
                        newString += currentNode.data;
                    }
                    leafNodes[index] = newString;
                    newString = '';
                }
                return leafNodes;
            },

            getGCF: function getGCF(a, b) {
                var gcf;

                if (b !== 0) {
                    gcf = this.getGCF(b, a % b);
                }
                else {
                    gcf = a;
                }
                return gcf;
            }
        },

        FOCUS_DIV_STYLE: {
            'outline': '2px dotted #aaa',
            'height': '52px',
            'width': '52px',
            'position': 'absolute',
            'color': 'rgba(0,0,0,0)',
            'font-size': '0px',
            'z-index':'-1'
        }
    });
})(window.MathInteractives);
