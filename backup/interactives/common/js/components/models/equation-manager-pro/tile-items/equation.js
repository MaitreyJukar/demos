(function () {
    'use strict';

    var modelNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro,
        utilityMethods = modelNameSpace.EquationManagerPro.Utils;

    /**
    * Properties required for populating ExponentAccordion releted data.
    *
    * @class Equation
    * @construtor
    * @extends MathInteractives.Common.Components.Models.EquationManagerPro.TileItem
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    */
    modelNameSpace.Equation = modelNameSpace.TileItem.extend({

        defaults: $.extend(true, {}, modelNameSpace.TileItem.prototype.defaults, {

            /** Stores the type of the tile: fraction, parenthesis, base-exp
            *
            * @attribute type
            * @type String
            * @default equation
            **/
            type: modelNameSpace.TileItem.TileType.EQUATION

        }),

        /**
        * Initializes the TileItem model object
        *
        * @method initialize
        **/
        initialize: function () {
            modelNameSpace.Equation.__super__.initialize.apply(this, arguments);
            var arrEquation, i = 0, lstEquation = [];

            if (this.get('tileArray') === null) {
                this.set('tileArray', []);
            }

            arrEquation = this.get('tileArray');
            if (arrEquation instanceof Array) {
                for (i = 0; i < arrEquation.length; i++) {
                    lstEquation[i] = modelNameSpace.TileItem.createTileItem(arrEquation[i]);
                }
                this.set('tileArray', new Backbone.Collection(lstEquation));
            }
        },

        /**
         * Starts to create the tree structure by converting the models to postfix format.
         * @method getTree
         * @public
         *
         * @returns {modelNameSpace.TileItem.TreeNode} Returns (object) the root of the tree.
         */
        getTree: function () {
            var index,
                tiles = this.get('tileArray'),
                currentTile,
                length = tiles.length,
                postfixModels = [];

            for (index = 0; index < length; index++) {
                currentTile = tiles.at(index);
                /*childTiles = currentTile.getTree();
                for(j = 0; j<childTiles.length; j++) {
                    postfixModels.push(childTiles[j]);
                }*/
                Array.prototype.push.apply(postfixModels, currentTile.getTree());
            }
            if (length === 1) {
                postfixModels.push(null);
            }
            postfixModels.push(modelNameSpace.TileItem.OPERATORS.EQUAL);
            postfixModels.push(this);
            return this._createTree(postfixModels);
        },

        /**
         * Creates n-ary tree for the given postfix models.
         * @method _createTree
         * @private
         *
         * @param   {Array}  postfixModels Consists of the postfix models from which the tree to be generated.
         * @returns {modelNameSpace.TileItem.TreeNode} Returns (object) the root of the tree.
         */
        _createTree: function (postfixModels) {
            var operandStack = [],
                operators = modelNameSpace.TileItem.OPERATORS,
                treeNode, treeNode1, treeNode2,
                currentSymbol,
                treeRoot,
                index, length;
            for (index = 0, length = postfixModels.length; index < length; index++) {
                currentSymbol = postfixModels[index];
                treeNode = new modelNameSpace.TreeNode();
                if ([operators.PARENTHESES, operators.DIVISION, operators.EQUAL].indexOf(currentSymbol) > -1) {
                    // TODO: for sin cos etc
                    treeNode.setData(currentSymbol, postfixModels[index + 1]);
                    index += 1;
                }
                else {
                    treeNode.setData(currentSymbol, null);
                }
                if (typeof (currentSymbol) !== "string") {
                    operandStack.push(treeNode);
                }
                else {
                    treeNode2 = operandStack.pop();
                    treeNode1 = operandStack.pop();
                    if (treeNode1.data === treeNode.data && treeNode1.data !== operators.PARENTHESES) {
                        treeNode1.children.push(treeNode2);
                        treeNode2.parent = treeNode1;
                        operandStack.push(treeNode1);
                    }
                    else {
                        treeNode.children.push(treeNode1, treeNode2);
                        treeNode1.parent = treeNode2.parent = treeNode;
                        operandStack.push(treeNode);
                    }
                }
            }
            treeRoot = operandStack.pop();
            this._cacheTakeOutCommonRelatedNodes(treeRoot);

            return treeRoot;
        },

        /**
       * Calls the parsing of the left and right child of the main node i.e '=' separately
       *
       * @method parseTree
       * @param treeRoot {Object} The root node of the tree.
       * @return {Array}  Array containing the index of the tiles in a order
       * @public
       */
        parseTree: function parseTree(treeRoot) {
            var arr = [];

            Array.prototype.push.apply(arr, this._parseTreeForAcc(treeRoot.children[0]));
            Array.prototype.push.apply(arr, this._parseTreeForAcc(treeRoot.children[1]));

            return arr;
        },

        /**
      * Parses the tree and its subtrees recursively
      *
      * @method _parseTreeForAcc
      * @param treeRoot {Object} The root node of the tree.
      * @return {Array}  Array containing the index of the tiles in a order
      * @private
      */
        _parseTreeForAcc: function _parseTreeForAcc(tree) {

            var arr = [],
                value = null;

            for (var i = 0; i < tree.children.length; i++) {
                var subtree = tree.children[i];


                if (subtree && (subtree.data === '*' || subtree.data === '+')) {
                    //  '+' is to handle numerator of a fraction
                    //  '*' is to get multiplicative nodes together

                    var subArr = [];

                    for (var j = 0; j < subtree.children.length; j++) {
                        value = this.getModelIndexFromNode(subtree.children[j]);
                        if (value != null) {
                            subArr.push(value);
                        }
                        else if (subtree.children[j].children.length > 0) {
                            subArr.push(this._parseTreeForAcc(subtree.children[j]));
                        }
                    }

                    arr.push(subArr);
                }
                else {
                    // '/' node already containes the fraction model so get the model directly

                    value = this.getModelIndexFromNode(subtree);

                    if (value != null) {
                        arr.push(value);
                    }
                }

                if (subtree.children.length > 0) {

                    // Skip the left child of the '^' node as we have already taken parentheses model from its '^' node and its left child will again give the same thing without the parentheses

                    if (subtree.data === '^') {

                        //TO DO: Handle exponent in case of parentheses - It has data value as null in the right child of '^' node in case of no exponent

                        Array.prototype.push.apply(arr, this._parseTreeForAcc(subtree.children[0]));
                    }
                    else {
                        Array.prototype.push.apply(arr, this._parseTreeForAcc(subtree));

                    }
                }

            }

            return arr;
        },

        /**
        * Returns the model index from a given node
        *
        * @method _getModelIndexFromNode
        * @param node {Object} The node of the tree.
        * @return {Object}  Model of the node
        * @private
        */
        getModelIndexFromNode: function getModelIndexFromNode(node) {

            //if (node.data) {
            //    if (typeof node.data === 'string') {
            //        node.collectionData !== null ? console.log(node.collectionData.get('type')) : console.log(node.data);
            //    }
            //    else {
            //        console.log(node.data.get('type'));
            //    }
            //}

            if (node.collectionData || typeof node.data !== 'string') {
                return this.getIndexFromItemModel(node.collectionData || node.data);
            }

        },

        /**
        * Sets property 'multipleInParentheses' for all leafnodes with related tile model index that can be dragged
        * out of the parentheses and if not found then with null.
        *
        * @method _cacheTakeOutCommonRelatedNodes
        * @param treeRoot {Object} The root node of the tree.
        * @private
        */
        _cacheTakeOutCommonRelatedNodes: function _cacheTakeOutCommonRelatedNodes(treeRoot) {
            this._setMultipleInParenthesesForAllLeaves(treeRoot, null);
            this._cacheTakeOutCommonRelatedNodesIndices(treeRoot);
        },

        /**
        * Sets attribute 'multipleInParentheses' for all leaf nodes below passed tree node to the passed value.
        *
        * @method _setMultipleInParenthesesForAllLeaves
        * @param parentNode {Object} The tree node whose child leaf nodes' attribute is to be set.
        * @param value {Object} The value to be set; could be null or an enum.
        * @private
        */
        _setMultipleInParenthesesForAllLeaves: function _setMultipleInParenthesesForAllLeaves(parentNode, value) {
            var nodes = utilityMethods.getAllLeaves(parentNode),
                index;
            for (index = 0; index < nodes.length; index++) {
                if (typeof nodes[index].data !== 'number')
                    nodes[index].data.set('multipleInParentheses', value);
            }
            nodes = this._getChildParenthesesNodes(parentNode);
            for (index = 0; index < nodes.length; index++) {
                nodes[index].collectionData.set('multipleInParentheses', value);
            }
        },

        /**
        * Returns an array of parentheses nodes found inside the passed node.
        *
        * @method _getChildParenthesesNodes
        * @param {Object} Node whose child nodes are to be checked for nested parentheses nodes.
        * @return {Array}  Array of parentheses nodes.
        * @private
        */
        _getChildParenthesesNodes: function _getChildParenthesesNodes(node) {
            var index, parenthesesNodes = [],
                nodeData = node.data;

            if (nodeData === null) {
                return [];
            }
            if (nodeData === modelNameSpace.TileItem.OPERATORS.PARENTHESES) {
                return [node];
            }
            for (index = 0; index < node.children.length; index++) {
                Array.prototype.push.apply(parenthesesNodes, this._getChildParenthesesNodes(node.children[index]));
            }
            return parenthesesNodes;
        },

        /**
        * Parses the tree looking for parentheses and if found calls _cacheRelatedNodesIndicesInParentheses.
        *
        * @method _cacheTakeOutCommonRelatedNodesIndices
        * @param node {Object} The node that needs to be parsed.
        * @private
        */
        _cacheTakeOutCommonRelatedNodesIndices: function _cacheTakeOutCommonRelatedNodesIndices(node) {
            var operators, index, children, numberOfChildren, nodeData,
                parenthesesChildNode;

            operators = modelNameSpace.TileItem.OPERATORS;
            children = node.children;
            numberOfChildren = children.length;
            nodeData = node.data;
            switch (nodeData) {
                case operators.DIVISION:
                    //numberOfChildren = 1; // no parentheses encountered in denominator
                    node.collectionData.set('treeNodeRef', node);
                case operators.EQUAL:
                case operators.ADDITION:
                case operators.MULTIPLICATION:
                    for (index = 0; index < numberOfChildren; index++) {
                        this._cacheTakeOutCommonRelatedNodesIndices(children[index]);
                    }
                    break;
                case operators.PARENTHESES:
                    parenthesesChildNode = children[0]; //children[1] = exponent
                    if (!children[1].data) { // if exponent exists, then nothing can be taken out common
                        this._setMultipleInParenthesesForAllLeaves(parenthesesChildNode, null);
                        this._cacheRelatedNodesIndicesInParentheses(parenthesesChildNode, node.collectionData);
                    }
                    this._cacheTakeOutCommonRelatedNodesIndices(parenthesesChildNode);
                    node.collectionData.set('treeNodeRef', node);
                    break;
                default: // could be a term tile
                    if (nodeData instanceof modelNameSpace.TermTile) {
                        nodeData.set('treeNodeRef', node);
                    }
                    break;
            }
        },

        /**
        * Parses the parentheses node passed to find multiples that will get reduced if a
        * tile is dragged out. Indices of such related tiles are stored in the tile's model.
        *
        * @method _cacheRelatedNodesIndicesInParentheses
        * @param parenthesesNode {Object} The parentheses node that needs to be checked.
        * @param parenthesesModel {Object} The parentheses tile's model.
        * @private
        */
        _cacheRelatedNodesIndicesInParentheses: function _cacheRelatedNodesIndicesInParentheses(parenthesesNode, parenthesesModel) {
            //parentheses node is the 1st child of the parentheses
            var operators = modelNameSpace.TileItem.OPERATORS,
                parenthesesChildren, numerator, denominator,
                draggableChildren, index,
                draggableChildData,
                exitCodes = modelNameSpace.CommandFactory.EXIT_CODE,
                returnedValue;
            parenthesesChildren = parenthesesNode.children;
            if (parenthesesNode.data === operators.ADDITION) {
                returnedValue = this._cacheRelatedNodesIndicesInParenthesesForPolynomial(parenthesesChildren);
                //means that there are like terms
                if (returnedValue === modelNameSpace.Equation.RETURN_TYPE.FAILURE) {
                    this._updateMultipleInParenthesesForLikeTerms(parenthesesModel, false, true);
                }
                else if (returnedValue === modelNameSpace.Equation.RETURN_TYPE.CHILDREN_EXCEED) {
                    // more than 2 monomials in polynomial
                    this._setMultipleInParenthesesForAllLeaves(parenthesesNode, exitCodes.SIMPLIFY_TERMS_FIRST);
                }
                else if (returnedValue === modelNameSpace.Equation.RETURN_TYPE.LIKE_TERMS_FACTOR) {
                    this._setMultipleInParenthesesForAllLeaves(parenthesesNode, exitCodes.NOT_LIKE_TERMS);
                }
                else if (returnedValue === modelNameSpace.Equation.RETURN_TYPE.HAS_ZERO) {
                    this._setMultipleInParenthesesForAllLeaves(parenthesesNode, exitCodes.SIMPLIFY_TERMS_FIRST);
                }
                else {
                    if (utilityMethods.hasCombinableImaginaryTerms(parenthesesNode)) {
                        // There must not be a "i^2" term in the parentheses
                        this._updateMultipleInParenthesesForLikeTerms(parenthesesModel, true, true);
                    }
                    else {
                        this._updateMultipleInParenthesesForLikeTerms(parenthesesModel, false, false);
                    }
                }
            }
                //TODO:
                //no text string integrated in division case.
            else if (parenthesesNode.data === operators.DIVISION) {
                numerator = parenthesesChildren[0];
                denominator = parenthesesChildren[1];
                // Take out common allowed only if the numerator contains a polynomial
                if (numerator.data === operators.ADDITION) {
                    // cache related nodes indices in parentheses
                    returnedValue = this._cacheRelatedNodesIndicesInParenthesesForPolynomial(numerator.children);
                    if (returnedValue === modelNameSpace.Equation.RETURN_TYPE.FAILURE) {
                        this._updateMultipleInParenthesesFractionCase(parenthesesNode.collectionData, true, exitCodes.SIMPLIFY_TERMS_FIRST);
                    }
                    else if (returnedValue === modelNameSpace.Equation.RETURN_TYPE.CHILDREN_EXCEED) {
                        // more than 2 monomials in numerator
                        this._setMultipleInParenthesesForAllLeaves(parenthesesNode, exitCodes.SIMPLIFY_TERMS_FIRST);
                    }
                    else if (returnedValue === modelNameSpace.Equation.RETURN_TYPE.LIKE_TERMS_FACTOR) {
                        this._setMultipleInParenthesesForAllLeaves(parenthesesNode, exitCodes.NOT_LIKE_TERMS);
                    }
                    else if (returnedValue === modelNameSpace.Equation.RETURN_TYPE.HAS_ZERO) {
                        this._setMultipleInParenthesesForAllLeaves(parenthesesNode, exitCodes.SIMPLIFY_TERMS_FIRST);
                    }
                    else {
                        this._checkForNegativeFactorInFractionCase(numerator.children);

                        // cache if the denominator tiles can be dragged out
                        draggableChildren = this._getDraggableNodesFromMonomial(denominator);

                        for (index = 0; index < draggableChildren.length; index++) {
                            draggableChildData = draggableChildren[index].data;
                            if (draggableChildData.get('base') === 1) { // no square roots, imaginary terms in fraction
                                draggableChildData.set('multipleInParentheses', exitCodes.FACTOR_ONE_FROM_PARANTHESES);
                            }
                            else {
                                draggableChildData.set('multipleInParentheses', '-1');
                            }
                        }
                    }
                }
            }
        },

        /**
        * Checks the numerators' children passed for negative term tiles and sets feedback related value in the tile's
        * multipleInParentheses attribute.
        *
        * @method _checkForNegativeFactorInFractionCase
        * @param numeratorChildren {Array} An array of numerator node's children.
        * @private
        */
        _checkForNegativeFactorInFractionCase: function _checkForNegativeFactorInFractionCase(numeratorChildren) {
            var index, index2,
                draggables, draggableData, tileBase;
            for (index = 0; index < numeratorChildren.length; index++) {
                draggables = this._getDraggableNodesFromMonomial(numeratorChildren[index]);
                for (index2 = 0; index2 < draggables.length; index2++) {
                    draggableData = draggables[index2].data;
                    if (draggableData instanceof modelNameSpace.TermTile) {
                        tileBase = draggableData.get('base');
                        if ((typeof tileBase === 'number' && tileBase < -1) ||
                            (typeof tileBase === 'string' &&
                            tileBase.indexOf(modelNameSpace.TileItem.OPERATORS.SUBTRACTION) > -1)) {
                            draggableData.set('multipleInParentheses', modelNameSpace.CommandFactory.EXIT_CODE.NEGATIVE_NUMBER_COMMON_OUT);
                        }
                    }
                }
            }
        },

        _updateMultipleInParenthesesForLikeTerms: function _updateMultipleInParenthesesForLikeTerms(parenthesesModel, squarePresent, toModifyModel) {
            var parenthesesChildTiles = parenthesesModel.get('tileArray'),
                Operators = modelNameSpace.TileItem.OPERATORS,
                cmdFactoryClassExit = modelNameSpace.CommandFactory.EXIT_CODE,
                leftMonomial = [], rightMonomial = [],
                feedBackToShow, index, currentTerm, flag = false;

            feedBackToShow = squarePresent ? cmdFactoryClassExit.SIMPLIFY_TERMS_FIRST : cmdFactoryClassExit.SIMPLIFY_TERM_TAKE_COMMON;
            for (index = 0; index < parenthesesChildTiles.length; index++) {
                currentTerm = parenthesesChildTiles.at(index);
                if (currentTerm.get('operator') === Operators.ADDITION) {
                    flag = true;
                }
                if (flag === true) {
                    rightMonomial.push(currentTerm);
                }
                else {
                    leftMonomial.push(currentTerm);
                }
            }

            this._matchingAllElements(leftMonomial, rightMonomial, feedBackToShow, toModifyModel);
            this._matchingAllElements(rightMonomial, leftMonomial, feedBackToShow, toModifyModel);
        },

        _matchingAllElements: function _matchingAllElements(concernedMonomial, monomialToSearch, feedbackToShow, toModifyModel) {
            var index, currentTerm, multipleInParentheses;
            for (index = 0; index < concernedMonomial.length; index++) {
                currentTerm = concernedMonomial[index];
                if (utilityMethods.isBasicTileType(currentTerm)) {
                    multipleInParentheses = currentTerm.get('multipleInParentheses');
                    if (typeof multipleInParentheses === 'string' && toModifyModel) {
                        currentTerm.set('multipleInParentheses', feedbackToShow);
                    }
                    else if (typeof multipleInParentheses === 'number') {
                        continue;
                    }
                    else {
                        this._tryFindingMatchingTermOnOtherSide(currentTerm, monomialToSearch, feedbackToShow, toModifyModel);
                    }
                }
                else if (currentTerm.get('type') === modelNameSpace.TileItem.TileType.FRACTION) {
                    this._updateMultipleInParenthesesFractionCase(currentTerm, toModifyModel, feedbackToShow);
                }
            }
        },

        _updateMultipleInParenthesesFractionCase: function _updateMultipleInParenthesesFractionCase(fracTerm, toModifyModel, feedbackToShow) {
            var fracChildren = fracTerm.get('tileArray'),
                cmdFactoryClassExit = modelNameSpace.CommandFactory.EXIT_CODE,
                multipleInParentheses, currentTerm, index, base;

            for (index = 0; index < fracChildren.length; index++) {
                currentTerm = fracChildren.at(index);
                base = currentTerm.get('base');
                multipleInParentheses = currentTerm.get('multipleInParentheses');
                if (typeof multipleInParentheses === 'string' && toModifyModel) {
                    currentTerm.set('multipleInParentheses', feedbackToShow);
                }
                if (base / Math.abs(base) === -1 && base !== -1) {
                    currentTerm.set('multipleInParentheses', cmdFactoryClassExit.NEGATIVE_NUMBER_COMMON_OUT);
                    //return;
                    /*
                    Commented out 'cause it would not update the tile "6" in following case if returned.
                        t      t
                    2 (--- + -----)
                       -12   -3.6
                    */
                }
            }
        },

        _tryFindingMatchingTermOnOtherSide: function _tryFindingMatchingTermOnOtherSide(termToCompare, otherSideTiles, feedbackToShow, toModifyModel) {
            var iotaExp = termToCompare.get('iotaExponent'),
                base = termToCompare.get('base'),
                rootProps = termToCompare.get('squareRootProps'),
                cmdFactoryClassExit = modelNameSpace.CommandFactory.EXIT_CODE,
                index, currentTerm;

            if (typeof termToCompare.get('multipleInParentheses') === 'string' || typeof termToCompare.get('multipleInParentheses') === 'number') {
                return;
            }

            if ((base / Math.abs(base) === -1 && rootProps === null) || (rootProps && rootProps.isNegative)) {
                termToCompare.set('multipleInParentheses', cmdFactoryClassExit.NEGATIVE_NUMBER_COMMON_OUT);
                return;
            }

            for (index = 0; index < otherSideTiles.length; index++) {
                currentTerm = otherSideTiles[index];
                //if the source and dest tiles both have an iota term, then its divisible.
                if (iotaExp && currentTerm.get('iotaExponent') && currentTerm.get('base') % base === 0) {
                    termToCompare.set('multipleInParentheses', feedbackToShow);
                    break;
                }

                //so both terms dont have root, dest term has iota exp, and bases are divisible
                if (!iotaExp && currentTerm.get('base') % base === 0 && currentTerm.get('iotaExponent') /*&& !rootProps && rootProps === currentTerm.get('squareRootProps')*/) {
                    termToCompare.set('multipleInParentheses', cmdFactoryClassExit.BREAK_IMAGINARY_NUMBER);
                    break;
                }

                if (rootProps && currentTerm.get('squareRootProps') && rootProps.exponent === currentTerm.get('squareRootProps').exponent && currentTerm.get('base') % base === 0 && !iotaExp) {
                    termToCompare.set('multipleInParentheses', cmdFactoryClassExit.ROOT_MAGNITUDE);
                    break;
                }
            }

        },

        _setSimplifyValueInAllNumeratorTerms: function _setSimplifyValueInAllNumeratorTerms(children) {
            var index, currentChild,
                simplifyTermText = modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST;
            for (index = 0; index < children.length; index++) {
                currentChild = children[index];
                if (currentChild.isLeaf()) {
                    currentChild.data.set('multipleInParentheses', simplifyTermText);
                }
                else if (currentChild.data === modelNameSpace.TileItem.OPERATORS.MULTIPLICATION) {
                    this._setSimplifyValueInAllNumeratorTerms(currentChild.children);
                }
            }
        },

        _cacheRelatedNodesIndicesInParenthesesForPolynomial: function (children) {
            var operators = modelNameSpace.TileItem.OPERATORS,
                numberOfChildren, index, index2,
                draggablesList = [], draggables,
                draggableNode, draggableModel, multipleFound;
            numberOfChildren = children.length;
            //if (true || numberOfChildren === 2 /* Condition 1: Polynomial must not have more than 2 addition operands */ &&
            /* Condition 2: One of the two operands must have a variable and the other must not */
            //(utilityMethods._hasVariableTermTile(children[0], utilityMethods._isNonNumericTermTile) ^
            // utilityMethods._hasVariableTermTile(children[1], utilityMethods._isNonNumericTermTile)) &&
            /* Condition 3: Disallow take out common for cases like
                 4 * x     12 + 4
               ( -----  +  ------ )
                   8          8
                since there's a polynomial in the numerator of one of the fractions inside parentheses
            */
            //!((children[0].data === operators.DIVISION && children[0].children[0].data === operators.ADDITION) ||
            //children[1].data === operators.DIVISION && children[1].children[0].data === operators.ADDITION)) {
            if (numberOfChildren === 2) {
                if (!(utilityMethods._hasVariableTermTile(children[0], utilityMethods._isVariableImaginaryTermTile) ^
                     utilityMethods._hasVariableTermTile(children[1], utilityMethods._isVariableImaginaryTermTile))) {
                    return modelNameSpace.Equation.RETURN_TYPE.LIKE_TERMS_FACTOR;
                }
                if (utilityMethods._hasVariableTermTile(children[0], utilityMethods._isZeroTile) ||
                    utilityMethods._hasVariableTermTile(children[1], utilityMethods._isZeroTile)) {
                    return modelNameSpace.Equation.RETURN_TYPE.HAS_ZERO;
                }
                draggablesList[0] = this._getDraggableNodesFromMonomial(children[0]);
                draggablesList[1] = this._getDraggableNodesFromMonomial(children[1]);
                for (index = 0; index < numberOfChildren; index++) {
                    draggables = draggablesList[index];
                    for (index2 = 0; index2 < draggables.length; index2++) {
                        draggableNode = draggables[index2];
                        // For the draggable node, check if a multiple exists on the other side of "+" sign
                        multipleFound = this._findMultiple(children[numberOfChildren - 1 - index], draggableNode);
                        if (draggableNode.data === operators.PARENTHESES) {
                            draggableModel = draggableNode.collectionData;
                        }
                        else { // draggableNode is term tile
                            draggableModel = draggableNode.data;
                        }
                        if (multipleFound) {
                            draggableModel.set('multipleInParentheses', this.getIndexFromItemModel(multipleFound));
                        }
                        else if (typeof draggableModel.get('multipleInParentheses') !== 'number') {
                            draggableModel.set('multipleInParentheses', null);
                        }
                    }
                }
                this._checkForNonDraggableNegativeOnes(draggablesList);
            }
            else if (numberOfChildren !== 2) {
                return modelNameSpace.Equation.RETURN_TYPE.CHILDREN_EXCEED;
            }
            if (numberOfChildren === 2 /* Condition 1: Polynomial must not have more than 2 addition operands */ &&
                /* Condition 2: One of the two operands must have a variable and the other must not */
                (utilityMethods._hasVariableTermTile(children[0], utilityMethods._isVariableImaginaryTermTile) ^
                 utilityMethods._hasVariableTermTile(children[1], utilityMethods._isVariableImaginaryTermTile))/**/ &&
                // Condition 3: Disallow take out common for cases like
                //     4 * x     12 + 4
                //   ( -----  +  ------ )
                //       8          8
                //    since there's a polynomial in the numerator of one of the fractions inside parentheses
                !((children[0].data === operators.DIVISION && children[0].children[0].data === operators.ADDITION) ||
                  children[1].data === operators.DIVISION && children[1].children[0].data === operators.ADDITION)) {
                return modelNameSpace.Equation.RETURN_TYPE.SUCCESS;
            }

            else {
                //should be the case of when there are like terms which can be simplifies further. Not handling fraction cases.
                return modelNameSpace.Equation.RETURN_TYPE.FAILURE;
            }
        },

        /**
        * Parses the passed node assuming it is contained in a parentheses and returns an array of nodes that can be
        * dragged out of the parentheses, not necessarily if the dragging is valid or not.
        *
        * @method _getDraggableNodesFromMonomial
        * @param monomial {Object} The node that needs to parsed.
        * @return {Array} An array of nodes that represent tiles which can be dragged out of a parentheses.
        */
        _getDraggableNodesFromMonomial: function _getDraggableNodesFromMonomial(monomial) {
            monomial = monomial || {};
            var index, draggables = [],
                operators = modelNameSpace.TileItem.OPERATORS;
            switch (monomial.data) {
                //this case will occur when there is an addition sign in the numerator of the fraction.
                case operators.ADDITION:
                case operators.PARENTHESES:
                    // won't look inside nested parentheses
                    break;
                case operators.MULTIPLICATION:
                case operators.DIVISION:
                    for (index = 0; index < monomial.children.length; index++) {
                        Array.prototype.push.apply(draggables, this._getDraggableNodesFromMonomial(monomial.children[index]));
                    }
                    break;
                default:
                    if (monomial.data instanceof modelNameSpace.TermTile) {
                        draggables.push(monomial);
                    }
                    break;
            }
            return draggables;
        },

        /**
        * Checks if a passed node is divisible by the other node passed and returns the node that is divisible.
        *
        * @method _findMultiple
        * @param nodeToCheck {Object} Tree node object of the node that needs to be checked.
        * @param divideByNode {Object} Tree node object of the node that was dragged out.
        * @private
        * @return {Object} nodeToCheck or it's child node that is divisble by divideByNode.
        */
        _findMultiple: function _findMultiple(nodeToCheck, divideByNode) {
            var divideByNodeData = divideByNode.data;
            if (divideByNodeData === modelNameSpace.TileItem.OPERATORS.PARENTHESES) {
                return this._findMultipleOfParentheses(nodeToCheck, divideByNode);
            }
            else if (divideByNodeData && divideByNodeData.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE) {
                return this._findMultipleOfTermTile(nodeToCheck, divideByNode);
            }
          //  else console.log('CASE NOT HANDLED YET!!!');
            return false;
        },

        /**
        * Checks the array of draggable nodes passed as an array for "-1" tiles nodes that whether or not there exists
        * any sibling which has a multiple in the parentheses; if found then the "-1" tiles property
        * 'multipleInParentheses' is unset as per new requirement.
        *
        * @method _checkForNonDraggableNegativeOnes
        * @param draggablesList {Array} Array of draggable nodes in a parentheses.
        * @private
        */
        _checkForNonDraggableNegativeOnes: function _checkForNonDraggableNegativeOnes(draggablesList) {
            var index, index2,
                draggables = draggablesList[0].concat(draggablesList[1]),
                isNegativeOneNode = function (nodeToCheck) {
                    return (typeof nodeToCheck.data !== 'string' &&
                    nodeToCheck.data.get('type') === modelNameSpace.TileItem.TileType.TERM_TILE &&
                    nodeToCheck.data.get('base') === -1 && !nodeToCheck.data.get('squareRootProps') &&
                    !nodeToCheck.get('iotaExponent'));
                },
                negativeOnesToCheck = [], negativeOneNode,
                siblingOfNegative, siblingMultipleIndex;
            for (index = 0; index < draggables.length; index++) {
                if (isNegativeOneNode(draggables[index])) {
                    negativeOnesToCheck.push(draggables[index]);
                }
            }
            for (index = 0; index < negativeOnesToCheck.length; index++) {
                negativeOneNode = negativeOnesToCheck[index];
                for (index2 = 0; index2 < draggables.length; index2++) {
                    siblingOfNegative = draggables[index2];
                    if (siblingOfNegative === negativeOneNode || isNegativeOneNode(siblingOfNegative)) {
                        continue;
                    }
                    if (typeof siblingOfNegative.data !== 'string') {
                        siblingMultipleIndex = siblingOfNegative.data.get('multipleInParentheses');
                        if (typeof siblingMultipleIndex === 'string' && siblingMultipleIndex.length > 0) {
                            negativeOneNode.data.set('multipleInParentheses', modelNameSpace.CommandFactory.EXIT_CODE.MINUS_ONE_COMMON_OUT);
                            break;
                        }
                    }
                }
            }
        },

        /**
        * Checks if given node is divisible by the other parentheses tile node.
        *
        * @method _findMultipleOfParentheses
        * @param nodeToCheck {Object} Tree node object of the node that needs to be checked.
        * @param divideByNode {Object} Tree node object of the parentheses tile node that was dragged out.
        * @private
        * @return {Object} The node that is a multiple of the divideByNode. It could be the nodeToCheck itself or a
        * child; and if nodeToCheck is not divisible by divideByNode then null is returned.
        */
        _findMultipleOfParentheses: function _findMultipleOfParentheses(nodeToCheck, divideByNode) {
            var nodeToCheckData = nodeToCheck.data,
                divideByNodeData = divideByNode.data,
                operators = modelNameSpace.TileItem.OPERATORS,
                index, isValid = null,
                tileModelToChange, tileModelIndex, tileModelParent,
                node1Children, node2Children;
            switch (nodeToCheckData) {
                case operators.MULTIPLICATION: // check if any one of the multiplicands is divisible
                    for (index = 0; index < nodeToCheck.children.length; index++) {
                        isValid = this._findMultipleOfParentheses(nodeToCheck.children[index], divideByNode);
                        if (isValid !== null) break;
                    }
                    break;
                case operators.DIVISION: // check numerator or denominator depending on the value of isDenominator of divideByNode
                   // console.log('Fraction cases not handled yet!!!');
                    break;
                case operators.ADDITION: // might occur inside fraction case
                  //  console.log('case not handled yet!');
                    break;
                case operators.PARENTHESES: // might not be the immediate child of parentheses but
                    // might be encountered within '*'
                    node1Children = nodeToCheck.children;
                    node2Children = divideByNode.children;
                    // TODO: Handle cases where parentheses will have an exponent
                    /* As per requirements, the parentheses content won't be evaluated to check for divisibility
                        'cause a number of cases would then have to be handled.
                        Currently, checking only if the 2 parentheses are equal. */
                    if (utilityMethods._compareParenthesesEqual(nodeToCheck, divideByNode)) {
                        isValid = nodeToCheck;
                    }
                    break;
            }
            return isValid;
        },

        /**
        * Checks if given node is divisible by the other term tile node.
        *
        * @method _findMultipleOfTermTile
        * @param nodeToCheck {Object} Tree node object of the node that needs to be checked.
        * @param divideByNode {Object} Tree node object of the term tile node that was dragged out.
        * @param [options] {Object} Additional data can be sent using this parameter.
        * @param [options.update] {Boolean} If set to false, the method will just check for divisibility and won't
        * actually update the models.
        * @private
        * @return {Boolean} Operation success result. If options.update was passed as false, then the method will
        * return an object with resultant base after taking out common.
        */
        _findMultipleOfTermTile: function _findMultipleOfTermTile(nodeToCheck, divideByNode, options) {
            options = options || {};
            var nodeToCheckData = nodeToCheck.data,
                divideByNodeData = divideByNode.data,
                operators = modelNameSpace.TileItem.OPERATORS,
                index, isValid = false, cancelOutCommon = false, cancelAtIndex,
                isNegative, absoluteVariableBase, resultantVariableBase,
                base1, base2, resultantBase,
                iotaExponent1, iotaExponent2,
                squareRootProps1, squareRootProps2,
                specialCase = options.specialCase;

            base2 = divideByNodeData.get('base');
            // dragging out "1" or "0" not allowed
            if (base2 === 1 && !divideByNodeData.get('iotaExponent')) {
                divideByNodeData.set('multipleInParentheses', modelNameSpace.CommandFactory.EXIT_CODE.FACTOR_ONE_FROM_PARANTHESES);
                return false;
            }
            if (base2 === 0) {
                divideByNodeData.set('multipleInParentheses', modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST);
                return false;
            }
            iotaExponent2 = divideByNodeData.get('iotaExponent');
            if (iotaExponent2)    // "i" cannot be taken out common
                return false;
            squareRootProps2 = divideByNodeData.get('squareRootProps') || {};
            // As per new requirement, user can drag only -1 and positive numbers out of a parentheses
            if (squareRootProps2.isNegative ||
                (!squareRootProps2.exponent && !iotaExponent2 &&
                (/*(typeof base2 === 'string' && base2.indexOf(operators.SUBTRACTION) > -1)*/ false ||
                (typeof base2 === 'number' && base2 < -1)))) {
                return false;
            }

            if (specialCase !== false)
                specialCase = (base2 === -1 && divideByNodeData.get('isDenominator'));

            switch (nodeToCheckData) {
                case operators.MULTIPLICATION: // check if any one of the multiplicands is divisible
                    for (index = 0; index < nodeToCheck.children.length; index++) {
                        isValid = this._findMultipleOfTermTile(nodeToCheck.children[index], divideByNode, { update: false });
                        if (isValid && isValid.answer === 1) {
                            cancelOutCommon = true;
                            cancelAtIndex = index;
                            break;
                        }
                    }
                    if (cancelOutCommon) {
                        isValid = this._findMultipleOfTermTile(nodeToCheck.children[cancelAtIndex], divideByNode);
                    }
                    else {
                        for (index = 0; index < nodeToCheck.children.length; index++) {
                            isValid = this._findMultipleOfTermTile(nodeToCheck.children[index], divideByNode);
                            if (isValid) break;
                        }
                    }
                    break;
                case operators.DIVISION: // check numerator or denominator depending on the value of isDenominator of divideByNode
                    if (divideByNodeData.get('isDenominator')) {
                        isValid = this._findMultipleOfTermTile(nodeToCheck.children[1], divideByNode, { specialCase: false });
                    }
                    else {
                        isValid = this._findMultipleOfTermTile(nodeToCheck.children[0], divideByNode, { specialCase: false });
                    }
                    break;
                case operators.PARENTHESES: // not taking out common from inside child parentheses
                case operators.ADDITION: // might occur inside fraction case
                    break;
                default:
                    if (nodeToCheckData instanceof modelNameSpace.TermTile) {
                        if (nodeToCheckData.get('isDenominator') !== divideByNodeData.get('isDenominator') && !specialCase) {
                            return false;
                        }
                        // check base
                        base1 = nodeToCheckData.get('base');
                        //added so that in the case of 3 * (-1 + 0i), -1 could not be removed common
                        if (base1 === 0) {
                            divideByNodeData.set('multipleInParentheses', modelNameSpace.CommandFactory.EXIT_CODE.SIMPLIFY_TERMS_FIRST);
                            return false;
                        }
                        iotaExponent1 = nodeToCheckData.get('iotaExponent');
                        squareRootProps1 = nodeToCheckData.get('squareRootProps') || {};
                        if ((squareRootProps1.exponent && (squareRootProps1.exponent === squareRootProps2.exponent)) &&
                            (!iotaExponent1 && iotaExponent1 === iotaExponent2 /* For cases like ([?9] + [?9•i]) */) &&
                            (base1 && (base1 === base2))) {
                            resultantBase = (squareRootProps1.isNegative ^ squareRootProps2.isNegative) ? -1 : 1;
                            if (options.update === false) {
                                isValid = {
                                    answer: resultantBase
                                }
                            }
                            else {
                                isValid = nodeToCheckData;
                            }
                        } //if ((iotaExponent2 && (iotaExponent2 === iotaExponent1)) && base1 && base2) { }
                        else if (!(squareRootProps1.exponent || squareRootProps2.exponent || iotaExponent1 || iotaExponent2)) {
                            if (typeof base2 === 'string' && typeof base1 === 'string') {
                                isNegative = base2.indexOf(operators.SUBTRACTION) > -1 ^ base1.indexOf(operators.SUBTRACTION) > -1;
                                absoluteVariableBase = base1.replace(operators.SUBTRACTION, '');
                                if (absoluteVariableBase === base2.replace(operators.SUBTRACTION, '')) {
                                    resultantVariableBase = isNegative ? -1 : 1;
                                    if (options.update === false) {
                                        isValid = {
                                            answer: resultantVariableBase
                                        }
                                    }
                                    else {
                                        isValid = nodeToCheckData;
                                    }
                                }
                            }
                            else if (typeof base1 === 'string' && base2 === -1) {
                                if (options.update === false) {
                                    isValid = {
                                        answer: base1.indexOf(operators.SUBTRACTION) > -1 ?
                                            base1.replace(operators.SUBTRACTION, '') : operators.SUBTRACTION + base1
                                    };
                                }
                                else {
                                    isValid = nodeToCheckData;
                                }
                            }
                            else if (base1 && base1 % base2 === 0) {
                                resultantBase = base1 / base2;
                                if (options.update === false) {
                                    isValid = {
                                        answer: resultantBase
                                    }
                                }
                                else {
                                    isValid = nodeToCheckData;
                                }
                            }
                        }
                        else if (base2 === -1 && !squareRootProps2.exponent)
                            isValid = nodeToCheckData;
                    }
            }
            return isValid;
        },

        /**
        * Get child model item from index
        * @method getModelFromIndex
        * @param itemIndex {String} Index of an item.
        * @return {MathInteractives.Common.Components.Models.EquationManagers.TileItem}
        */
        getModelFromIndex: function getModelFromIndex(itemIndex) {
            var indexes, index,
                tiles = this.get('tileArray');
            if (itemIndex) {
                indexes = itemIndex.split('.');
                index = parseInt(indexes[0], 10);
                indexes.splice(0, 1);
                if (tiles.at(index)) {
                    return this.get('tileArray').at(index).getModelFromIndex(indexes.join('.'));
                }
                else {
                    return null;
                }
            }
            else if (itemIndex === '') {
                return this;
            }
            return null;
        },

        /**
        * Prints a string representation of the current equation
        *
        * @method printExpr
        * @return {String} String representation of the current equation
        */
        printExpr: function () {
            var tiles = this.get('tileArray'),
                str = tiles.at(0).printExpr();
            if (tiles.length > 1) {
                str += '\n = \n' + tiles.at(1).printExpr();
            }
            return str;
        },

        /**
        * Returns a string for getting the simplest form of the expression
        *
        * @method checkSimplest
        * @return {String} String representation of the current equation
        */
        checkSimplest: function getExpression() {
            var tiles = this.get('tileArray'),
                str = tiles.at(0).checkSimplest(),
                nextStr;
            if (str === false) {
                return false;
            }
            if (tiles.length > 1) {
                nextStr = tiles.at(1).checkSimplest();
                if (nextStr === false) {
                    return false;
                }
                str += '=' + nextStr;
            }
            return str;
        },

        checkIfSimplestFormFractionCase: function checkIfSimplestFormFractionCase() {
            var tiles = this.get('tileArray'),
                index;
            for (index = 0; index < tiles.length; index++) {
                if (tiles.at(index).checkIfSimplestFormFractionCase() === false) {
                    return false;
                }
            }
            return true;
        },

        checkFractionToDecimalCase: function checkFractionToDecimalCase() {
            var tiles = this.get('tileArray'),
                index;
            for (index = 0; index < tiles.length; index++) {
                if (tiles.at(index).checkFractionToDecimalCase() === false) {
                    return false;
                }
            }
            return true;
        }


    }, {

        RETURN_TYPE: {
            SUCCESS: 1,
            CHILDREN_EXCEED: 2,
            FAILURE: 3,
            LIKE_TERMS_FACTOR: 4,
            HAS_ZERO: 5
        },

        SOLVE_FRACTION_TO_DECIMAL: 'solve-fraction-to-decimal'

    });
})();
