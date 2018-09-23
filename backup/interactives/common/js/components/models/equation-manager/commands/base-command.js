(function () {
    'use strict';

    var namespace = MathInteractives.Common.Components.Models.EquationManager,
        modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * BaseCommans
    * @module EquationManager
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    * @extends MathInteractives.Common.Components.Models.EquationManager.BaseCommand
    * @type Object
    * @constructor
    */
    namespace.BaseCommand = MathInteractives.Common.Player.Models.Base.extend({

        /**
        * Initializes the command.
        * This method should be overridden is a subclass.
        *
        * @method initialize
        */
        initialize: function () {
        },

        /**
        * Executes the function specified and adds it to the stack.
        * This method should be overridden is a subclass, otherwise it throws an exception.
        *
        * @method execute
        */
        execute: function () {
            throw 'Execute function not implemented';
        },

        /**
        * Undoes the last command performed and pops it from the stack.
        * This method should be overridden is a subclass, otherwise it throws an exception.
        *
        * @method undo
        */
        undo: function () {
            throw 'Undo function not implemented';
        },

        /**
        * Returns the position of a tile inside the parent.
        * For a location string "0.1.2.3" the position of the parent is "0.1.2" and the position of the tile
        * with respect to parent is "3"
        *
        * @method getSourceWrtParent
        * @param {String} index of a tile
        * @return {String} index of tile with respect to parent
        */
        getSourceWrtParent: function (index) {
            var lastIndexSeparator = index.lastIndexOf(namespace.CommandFactory.SEPARATOR);
            return index.substring(lastIndexSeparator + 1);
        },

        /**
        * Returns the index string of the parent.
        * For an index string "0.1.2.3" the position of the parent is "0.1.2"
        *
        * @method getParentIndex
        * @private
        * @param {String} index of a tile
        * @return {String} index string of parent
        */
        getParentIndex: function (index) {
            if (index.length === 1) {
                return "";
            }
            var lastIndexSeparator = index.lastIndexOf(namespace.CommandFactory.SEPARATOR);
            return index.substring(0, lastIndexSeparator);
        },

        /**
		 * Will return the parent tiles the givwn tile index
		 * @param   {Object}   modelRef The reference to the equation view model
		 * @param   {String}   index    The index string refering a tile
		 * @param   {[[Type]]} length   [[Description]]
		 *
		 * @method getParentTiles
		 */
		getParentTiles: function (modelRef, index) {
			index = this.getParentIndex(index);
			return modelRef.getItemFromIndex(index).get('tileArray');
		},

        /**
        * Returns a boolean representing whether the child is not alone in the parent
        *
        * @method isNotAlone
        * @param {Object} Parent of the child
        * @param {Object} Child who is checked if it's not alone
        * @return {Object} Boolean representing whether the child is not alone in the parent
        */
        isNotAlone: function (parent, child) {
            if(parent.get('type') === modelClassNameSpace.TileItem.SolveTileType.EQUATION_COMPONENT) {
                return parent.where({ bDenominator: child.get('bDenominator') }).length > 2;
            }
            return parent.where({ bDenominator: child.get('bDenominator') }).length > 1;
        },

       /**
		 * Searches for the given model in the tree
		 * @param   {Object} root  The root node
		 * @param   {Object} model The given model needed to be searched
		 * @returns {Object} The tree node where that model resides
		 */
		searchInTree: function (root, model) {
			var index, foundNode;
			if(root === null || root === undefined) {
				return null;
			}
			if(root.data === model || root.collectionData === model) {
				return root;
			}
			else {
				for(index=0; index<root.children.length; index++) {
					foundNode = this.searchInTree(root.children[index], model);
					if(foundNode !== null && foundNode !== undefined) {
						return foundNode;
					}
				}
			}
		},

        /**
        * Returns the position of a node. The array returned is reversed. This is mostly an internal function.
        * getPositin should be used whenever required.
        *
        * @method getReversePosition
        * @private
        * @param {Object} root object to start searching from
        * @param {Object} model to find the position of
        * @param {Array} position array that is populated internally
        * @return {Array} position array of a model
        */
		_getReversePosition: function (node, model, position) {
		    if (position === undefined) position = [];

		    if (node === null || node === undefined) {
		        return null;
		    }

		    // tried using unshift instead of push but encountered some problems. So use this as an internal method
		    // and call a separate getPosition method instead which simply reverses this array.
            // push and reverse also performs better than unshift
		    if (node.data === model) {
		        if (node.isLeftChild()) position.push(0);
		        else if (node.isRightChild()) position.push(1);
		        return position;
		    } else {
		        position = this.getPosition(node.left, model, position);
		        if (position !== null && position !== undefined && position !== []) {
		            position.push(0);
		            return position;
		        }
		        position = this.getPosition(node.right, model, position);
		        if (position !== null && position !== undefined && position !== []) {
		            position.push(1);
		            return position;
                }
		    }
		    return null;
		},

        /**
        * Returns the position of a model in the tree in an array form.
        *
        * @method getPosition
        * @param {Object} root object to start searching from
        * @param {Object} model to find the position of
        * @return {Array} position array of a model
        */
		getPosition: function (node, model) {
		    return this._getReversePosition(node, model, []).reverse();
		},

        /**
        * Returns the left operator of the given operand. This should only be called on a leaf operator.
        *
        * @method getLeftOperator
        * @param {Object} Node object whose left operator is to be returned
        * @return {String} Left operator of the given operand
        */
		getLeftOperator: function (node) {
		    if (node.isRoot()){
		        return node.data;
		    } else if (!node.isLeftmostChild()) {
		        return node.parent.data;
		    } else if (node.parent.data === '^') {  // if first tile in a parentheses then return null
		        return null;
		    } else {
		        return this.getLeftOperator(node.parent);
		    }

		    return null;
		},

        /**
        * Return the common parent of the  two nodes
        *
        * @method getCommonParent
        * @param {Object} one node whose common parent is to be found
        * @param {Object} another node whose common parent is to be found
        * @return {Object} common parent of the two nodes i.e. node1 and node2
        */
		getCommonParent: function (node1, node2) {
		    var node1Path = node1.getPath(),
                node2Path = node2.getPath(),
                root = node1.getTreeRoot(),
                length = Math.min(node1Path.length, node2Path.length),
		        commonParentPos = [],       // root node
                i = 0;

		    for (i = 0; i < length; i++) {
		        if (node1Path[i] === node2Path[i]) {
		            commonParentPos[i] = node1Path[i];
		        } else break;
		    }
		    return root.get(commonParentPos);
		},

        /**
        * Return the common parent of the  multiple nodes
        *
        * @method getCommonParentFromMultiple
        * @param {Array} Nodes whose common parent is to be found
        * @return {Object} common parent of all the nodes
        */
		getCommonParentFromMultiple: function (nodes) {
		    if (nodes.length === 1) return nodes[0];

		    var currentCommonParent = this.getCommonParent(nodes[0], nodes[1]),
                i = 0;
		    if (nodes.length === 2) return currentCommonParent;

		    for (i = 2; i < nodes.length && !currentCommonParent.isRoot(); i++) {
		        currentCommonParent = this.getCommonParent(currentCommonParent, nodes[i]);
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
        */
		getOperatorsBetween: function (node1, node2) {
		    var commonParent = this.getCommonParent(node1, node2),
		        operators = [],
                operator = null,
		        currentNode = node1;

            // add commonParent operator
		    operators.push(commonParent);

            //  go from node1 to commonParent
		    while (!_.isEqual(currentNode, commonParent) && !_.isEqual(currentNode.parent, commonParent)) {
		        operator = currentNode.parent;
		        operators.push(operator);
		        currentNode = currentNode.parent;
		    }

		    currentNode = node2;
		    //  go from node2 to commonParent
		    while (!_.isEqual(currentNode, commonParent) && !_.isEqual(currentNode.parent, commonParent)) {
		        operator = currentNode.parent;
		        operators.push(operator);
		        currentNode = currentNode.parent;
		    }

		    return operators;
		},

        /**
        * Returns operator strings between two nodes
        *
        * @method getOperatorsBetween
        * @param {Object} First node
        * @param {Object} Second node
        * @return {Array} Operator strings between the two nodes
        */
		getOperatorStringsBetween: function (node1, node2) {
		    var operators = this.getOperatorsBetween(node1, node2),
                operatorStrings = [],
		        i = 0;

		    for (i=0; i<operators.length; i++) {
		        operatorStrings.push(operators[i].data);
		    }

		    return operatorStrings;
		},

        /**
        * Returns a boolean whether all operators in the array are same
        *
        * @method allOperatorsSame
        * @param {Array} Array of operators
        * @return {Boolean} Boolean representing whether all operators in the array are same
        */
		allOperatorsSame: function (operators) {
		    var i = 0,
                operator = null;

		    if (operators.length) operator = operators[0];

		    if (operator === '^') return false;

		    for (i = 0; i < operators.length; i++) {
		        if (operator !== operators[i]) return false;
		    }

		    return true;
		},

        /**
        * Returns a boolean representing whether all operators in the array are * or / or ^
        *
        * @method allowedOperators
        * @param {Array} Array of operators
        * @return {Boolean} Boolean representing whether all operators in the array are * or / or ^
        */
		allowedOperators: function (operators) {
		    var allowedOperators = ['*', '/', '^'],
                i = 0;

		    for (i = 0; i < operators.length; i++) {
		        if (allowedOperators.indexOf(operators[i]) === -1) return false;
		    }

		    return true;
		},

        /**
        * Count occurences of elem in array
        *
        * @method countOccurences
        * @param {Array} Array of elems
        * @param {any} Element whose occurence is to be counted
        * @return {Number} Number of occurences
        */
		countOccurences: function (arr, elem) {
		    var indices = [];
		    var idx = arr.indexOf(elem);
		    while (idx !== -1) {
		        indices.push(idx);
		        idx = arr.indexOf(elem, idx + 1);
		    }
		    return indices.length;
		},

        /**
        * Returns an array of BASE EXPONENT that are children of node
        *
        * @method getBaseExponentLeaves
        * @param {Object} Node whose leaf nodes are to be returnes
        * @return {Array} Array of leaf nodes that are BASE Exponents
        */
		getBaseExponentLeaves: function (node) {
		    var returnArr = [],
		        i = 0;

            // base case
		    if (_.isNumber(node.data)) return [];
		    else if (!_.isString(node.data) && node.data.get('type') === modelClassNameSpace.TileItem.SolveTileType.BASE_EXPONENT) return [node];

		    for (i = 0; i < node.children.length; i++) {
		        Array.prototype.push.apply(returnArr, this.getBaseExponentLeaves(node.children[i]));
		    }

		    return returnArr;
		},

        /**
        * Returns the child tiles of a tile.
        * Useful to find the child tiles of a parentheses tile.
        * It recursively finds all leaf tiles.
        *
        * @method getChildTiles
        * @param {Object} Tile whose child (leaf) tiles is to be returned
        * @return {Array} Array of children tiles
        */
		getChildTiles: function (tile) {
		    if (tile.get('type') === modelClassNameSpace.TileItem.SolveTileType.BASE_EXPONENT) return tile;

		    var tiles = tile.get('tileArray'),
		        returnTiles = [];

		    tiles.each(function (tile) {
		        if (tile.get('type') === modelClassNameSpace.TileItem.SolveTileType.BASE_EXPONENT) returnTiles.push(tile);
		        else {
		            returnTiles.concat(this.getChildTiles(tile));
		        }
		    }, this);

		    return returnTiles;
		},

        ///**
        //* Returns the PARENTHESES node given the PARENTHESES tile
        //*
        //* @method getParenthesesNode
        //* @param {Object} Root node of the tree
        //* @param {Object} PARENTHESES tile to find
        //* @return {Node} Parent node of the tile represneting the PARENTHESES
        //*/
		//getParenthesesNode: function (root, tile) {
		//    var childTiles = this.getChildTiles(tile),
        //        nodes = [],
        //        parentNode = null;

		//    nodes = this.tilesToNodes(root, childTiles);

		//    parentNode = this.getCommonParentFromMultiple(nodes);
		//    return parentNode.parent;
		//},

        /**
        * Converts an array of tiles to an array of nodes.
        *
        * @method tilesToNodes
        * @param {Object} Root node of the tree
        * @param {Array} Array of tiles
        * @return {Array} Array of nodes
        */
		tilesToNodes: function (root, tiles) {
		    var nodes = [],
		        i = 0;
		    for (i=0; i<tiles.length; i++) {
		        nodes.push(this.searchInTree(root, tiles[i]));
		    }
		    return nodes;
		},

        /**
        * Checks and returns a boolean representing whether the operator is present in the operators array
        *
        * @method belongsTo
        * @param {String} operator that should be present
        * @param {Array} operator array to search
        * @return {Boolean} Whether the operator is found in the operator array
        */
		belongsTo: function (operator, operators) {
		    return !(operators.indexOf(operator) === -1);
		},

        /**
        * Returns true if the operator is + or -
        *
        * @method isAddOrSub
        * @param {String} operator that is checked
        * @return {Boolean} True if the operator is + or -
        */
		isAddOrSub: function (operator) {
		    return this.belongsTo(operator, ['+', '-']);
		},

        /**
        * Returns true if the operator is / or *
        *
        * @method isMulOrDiv
        * @param {String} operator that is checked
        * @return {Boolean} True if the operator is / or *
        */
		isMulOrDiv: function (operator) {
		    return this.belongsTo(operator, ['/', '*']);
		},

        /**
        * Returns the operators from the nodes to the uptoNode
        *
        * @method getOperatorsUpto
        * @param {Array} Array of nodes
        * @param {Object} Node upto which the operators are to be found
        * @return {Array} Array of operator strings
        */
		getOperatorsUpto: function (nodes, uptoNode) {
		    var operators = [],
		        currentNode = null,
		        i = 0;

		    for (i = 0; i < nodes.length; i++) {
		        operators.push(this.getOperatorStringsBetween(nodes[i], uptoNode));
		    }
		    return operators;
		},

        /**
        * Checks if all operators are either multiplication or division
        *
        * @method allOperatorsMulOrDiv
        * @param {Array} Array of operators
        * @return {Boolean} True if all operators are either * or /. False otherwise
        */
		allOperatorsMulOrDiv: function (operators) {
		    for (var i = 0; i < operators.length; i++) {
		        if (!this.isMulOrDiv(operators[i])) { return false; }
		    }
		    return true;
		},

		//It validates whether a plus node in a marquee selection is valid.
        //If a plus node is inside a marquee then atleast 1 branch should be
        //selected in the marquee. And if a branch is in the marquee then all it's
        //children should be valid marquee nodes.
        //If an asterik node  is found then all it's nodes should be selected.
		validatePlusNode: function (node, marqueeLeaves) {
		    var children,
		        i = 0;
		    if (node.isLeaf()) return true;

		    if (this.isAddOrSub(node.data) || node.data === '^') {
		        for (i = 0; i < node.children.length; i++) {
		            if (!this.validatePlusNode(node.children[i], marqueeLeaves)) { return false;}
		        }
		        return true;
		    } else if (this.isMulOrDiv(node.data)) {
		        children = this.getBaseExponentLeaves(node)
                // if all children are in marquee then it's valid
		        if (_.difference(children, marqueeLeaves).length === 0 || _.difference(children, marqueeLeaves).length === children.length) return true;
		        else return false;
		    }
		},

        /**
        *
        * Works by getting the common node of the draggedTiles. Then it computes an array of all leaf nodes
        * of the common node. It then compares this array with draggedTiles. If they are not equal
        * then it's an invalid marquee.
        *
        * @method validateMarquee
        * @param {String} msg A description of...
        * @return {Object} Copy of ...
        */
		validateMarquee: function (root, tile, parent, numOfTiles) {
		    var nodes = [],
                node = null,
                currentTile = null,
                parentArr = parent/*.get('tileArray')*/, //Do NOT uncomment
                index = parentArr.indexOf(tile),
                commonParent = null,
                operators = [],
                baseExpLeaves = [],
                marqueeLeaves = [],
                i = 0;

            // get nodes of all dragged tiles
		    for (i = 0; i < numOfTiles; i++) {
		        currentTile = parentArr.at(index + i);
		        node = this.searchInTree(root, currentTile);
		        marqueeLeaves.push(this.getBaseExponentLeaves(node));
		        nodes.push(node);
		        if (!node.isRoot()) operators.push(node.parent.data);
		    }

		    marqueeLeaves = _.flatten(marqueeLeaves);

            // common parent of all dragged tiles
		    commonParent = this.getCommonParentFromMultiple(nodes);
		    baseExpLeaves = this.getBaseExponentLeaves(commonParent);

		    if (this.isMulOrDiv(commonParent.data)) {
		        // check path
		        return this.allOperatorsMulOrDiv(operators);
		    } else if (this.isAddOrSub(commonParent.data)) {
		        // check if completely selected
		        return this.validatePlusNode(commonParent, marqueeLeaves);
		    }
		},

        /**
        * Returns the node representing the marquee selection
        *
        * @method getMarqueeNode
        * @param {Object} Root Node
        * @param {Object} Tile selected in marquee
        * @param {Object} Parent of the tile selected in marquee
        * @param {Number} Number of tiles selected in marquee
        * @return {Object} Common node representing the marquee selection
        */
		getMarqueeNode: function (root, tile, parent, numOfTiles) {
		    var marqueeLeaves = [],
                i = 0,
                currentTile = null,
                parentArr = parent.get('tileArray'),
                index = parentArr.indexOf(tile),
                commonParent = null,
                node = null;


		    // get nodes of all dragged tiles
		    for (i = 0; i < numOfTiles; i++) {
		        currentTile = parentArr.at(index + i);
		        node = this.searchInTree(root, currentTile);
		        marqueeLeaves.push(this.getBaseExponentLeaves(node));
		    }

		    marqueeLeaves = _.flatten(marqueeLeaves);

		    commonParent = this.getCommonParentFromMultiple(marqueeLeaves);

		    return commonParent;
		},

        /**
        * Returns the leftmost child of a node
        *
        * @method getLeftmostChild
        * @param {Object} Node whose left most child is to be found
        * @return {Object} Left most child of the given node
        */
		getLeftmostChild: function (node) {
		    if (node.isLeaf()) { return node; }
		    else if (node.collectionData) {
		        return node;
		    }
		    return this.getLeftmostChild(node.children[0]);
		},

        /**
        * Sets the operators in the model once the operation is performed
        *
        * @method _setOperators
        * @private
        * @param {Object} the parent collectioon of the tile present at source index
        * @param {Object} the parent collectioon of the tile present at dest index
        * @param {Boolean} Whether you want to set the operators or unset them
        */
		_setOperators: function _setOperators (sourceParentTiles, destParentTiles, enable) {
			var denSourceStartIndex, denDestStartIndex;

			this._toggleOperator(sourceParentTiles, 0, enable);
			this._toggleOperator(destParentTiles, 0, enable);

			denSourceStartIndex = this._getDenominatorStartIndex(sourceParentTiles);
			denDestStartIndex = this._getDenominatorStartIndex(destParentTiles);

			if(denSourceStartIndex !== -1) {
				this._toggleOperator(sourceParentTiles, denSourceStartIndex, enable);
			}
			if(denDestStartIndex !== -1) {
				this._toggleOperator(destParentTiles, denDestStartIndex, enable);
			}
		},

        /**
        * It tiggles the operator depending on the boolean passed
        *
        * @method _toggleOperator
        * @private
        * @param {Object} the parent collectioon of the tile
        * @param {Object} the index of the tile item w.r.t parent
        * @param {Boolean} Whether you want to set the operators or unset them
        */
		_toggleOperator: function _toggleOperator (parentTiles, index, enable) {
			var model = parentTiles.at(index),
				operator = model.get('operator');

			if(enable === true) {
				if(operator !== '*') {
					model.set('operator', '*');
				}
			}
			else {
				if(operator !== null) {
					model.set('operator', null);
				}
			}
		},

        /**
        * Gets the start index of the denominator in case of a fration tile item
        *
        * @method _getDenominatorStartIndex
        * @private
        * @param {Object} the parent collectioon of the tile
        */
		_getDenominatorStartIndex: function _getDenominatorStartIndex (parentTiles) {
			var index,
				length = parentTiles.length;
			for(index=0; index<length; index++) {
				if(parentTiles.at(index).get('bDenominator') === true){
					return index;
				}
			}
			if(index === length) {
				return -1;
			}
		},

        /**
        * Similar to _setOperators(true) but more concise.
        * It simply adds * to all tiles in sourceParentTiles & destParentTiles.
        * @method addExtraOperators
        * @param {Object} Collection containing the source
        * @param {Object} Collection containing the destination
        */
		addExtraOperators: function (sourceParentTiles, destParentTiles) {
		    sourceParentTiles.invoke('set', 'operator', '*');
		    destParentTiles.invoke('set', 'operator', '*');
		},

        /**
        * Similar to _setOperators(false) but it was causing an exception. So using this instead.
        * @method removeExtraOperators
        * @param {Object} Collection containing the source
        * @param {Object} Collection containing the destination
        */
		removeExtraOperators: function (sourceParentTiles, destParentTiles) {
		    var firstDen = sourceParentTiles.findWhere({'bDenominator': true});
		    sourceParentTiles.at(0).set('operator', null);
		    destParentTiles.at(0).set('operator', null);
		    if (firstDen) {
		        firstDen.set('operator', null);
		    }

		    firstDen = destParentTiles.findWhere({ 'bDenominator': true });

		    if (firstDen) {
		        firstDen.set('operator', null);
		    }
        }
    });

})();
