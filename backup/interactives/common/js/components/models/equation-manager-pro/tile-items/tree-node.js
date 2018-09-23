(function () {
    'use strict';

    var modelNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro;

    /**
    * Properties required for populating ExponentAccordion releted data.
    *
    * @class TreeNode
    * @construtor
    * @extends MathInteractives.Common.Player.Models.Base
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    */
    modelNameSpace.TreeNode = MathInteractives.Common.Player.Models.Base.extend({

        /**
        * Stores the value of the tree node, either the model or the operator String
        *
        * @attribute data
        * @type Object/String
        * @default null
        **/
        data: null,

        /**
        * Stores the additional value for the operator tree node.
        * like for '^' will store parentheses tile item model and so on.
        *
        * @attribute collectionData
        * @type Object
        * @default null
        **/
        collectionData: null,

        /**
        * Stores the reference of the children for that node.
        *
        * @attribute children
        * @type Array
        * @default null
        **/
        children: null,

        /**
        * Stores the reference of the parent node.
        *
        * @attribute parent
        * @type Object
        * @default null
        **/
        parent: null,

        /**
         * Sets data
         * @method setData
         * @public
         *
         * @param {Object/String} data           As Descibed above
         * @param {Object}        collectionData As described above.
         */
        setData: function setData(data, collectionData) {
            this.data = data;
            this.collectionData = collectionData;
            this.children = [];
            this.parent = null;
        },

        /**
        * Returns true if the node is a leaf node
        *
        * @method isLeaf
        * @return {Boolean} Boolean indicating whether the node is a leaf
        */
        isLeaf: function () {
            return this.children.length === 0;
        },

        /**
        * Returns true if the node is the root node
        *
        * @method isRoot
        * @return {Boolean} Boolean indicating whether the node is the root
        */
        isRoot: function isRoot() {
            if (!this.parent) {
                return true;
            }
            return false;
        },

        /**
        * Returns the position array of this node
        *
        * @method getPath
        * @return {Array} Position array of the node
        */
        getPath: function getPath() {
            var currentNode = this,
                index = null,
                position = [];

            while (!currentNode.isRoot()) {
                index = currentNode.parent.children.indexOf(currentNode);
                position.push(index);
                currentNode = currentNode.parent;
            }
            position.reverse();
            return position;
        },

        /**
        * Returns the root of the entire tree
        *
        * @method getTreeRoot
        * @return {Object} Root node of the entire tree
        */
        getTreeRoot: function getTreeRoot() {
            var currentNode = this;
            while (!currentNode.isRoot()) {
                currentNode = currentNode.parent;
            }
            return currentNode;
        },

		/**
		* Returns the child at given position.
		*
		* @method getChildAt
		* @param positionArray {Array} The relative position of the child in the form of array where the first
		* element in array indicates the child, the second element points to the grand child.
		*/
		getChildAt: function getChildAt(positionArray) {
			if(positionArray.length) {
				return this.children[positionArray.shift()].getChildAt(positionArray);
			}
			return this;
		},

        /**
         * retrun the next sibling child
         * @method next
         * @public
         *
         * @returns {TreeNode} The next child or null
         */
        next: function () {
            var index = this.parent.children.indexOf(this);
            if(index === this.parent.children.length - 1) {
                return null;
            }
            return this.parent.children[index + 1];
        },

        /**
         * retrun the previous sibling child
         * @method prev
         * @public
         *
         * @returns {TreeNode} The previous child or null
         */
        prev: function () {
            var index = this.parent.children.indexOf(this);
            if(index === 0) {
                return null;
            }
            return this.parent.children[index - 1];
        },

        /**
         * Will return depending whether each child of the given node are leaf nodes or not.
         * @method areChildrenLeafNodes
         * @public
         *
         * @returns {Boolean} Will retrun true if above condition is met, else false.
         */
        areChildrenLeafNodes: function () {
            var index;
            for(index=0; index<this.children.length; index++) {
                if(this.children[index].isLeaf() === false) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Will check if the given node data is present in any of its children.
         * @method contains
         * @public
         *
         * @param {Array} operators  The operators are present or not.
         */
        contains: function contains (operators) {
            var children = this.children ? this.children : [],
                index;
            if(this.isLeaf()) {
                return false;
            }
            for(index = 0; index<children.length; index++) {
                if(operators.indexOf(children[index].data) !== -1) {
                    return true;
                }
                if(children[index].contains(operators) === true) {
                    return true;
                }
            }
            return false;
        }
    }, {

    });
})();
