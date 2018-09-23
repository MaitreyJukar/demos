(function () {
    'use strict';

    var modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * ParenthesisTile holds data for any parethesis item
    *
    * @class ParenthesisTile
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Models.EquationManager.TileItem
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    */
    modelClassNameSpace.ParenthesisTile = modelClassNameSpace.TileItem.extend({
        defaults: $.extend(true, {}, modelClassNameSpace.TileItem.prototype.defaults, {
            arrChilds: null,

            type: modelClassNameSpace.TileItem.SolveTileType.PARENTHESIS
        }),

         /**
        * Stores the array of operatiors
        *
        * @attribute operatorStack
        * @type Array
        * @default empty
        **/
        operatorStack: [],

        /**
        * To convert the given colllection into postfix models
        *
        * @attribute postfixModels
        * @type Array
        * @default empty
        **/
        postfixModels: [],

        /**
        * Initializes the TileItem model object
        *
        * @method initialize
        **/
        initialize: function () {
            modelClassNameSpace.ParenthesisTile.__super__.initialize.apply(this, arguments);
            var arrTiles = [], i, lstTiles = [];
            if (this.get('tileArray') === null) {
                this.set('tileArray', []);
            }
            arrTiles = this.get('tileArray');

            // Enter the for loop if arrTiles is an array.
            // This check needs to be done since this.clone() sets arrTiles to a Backbone.Collection which
            // causes an exception is this case.
            if (arrTiles instanceof Array) {
                for (i = 0; i < arrTiles.length; i++) {
                    lstTiles[i] = modelClassNameSpace.TileItem.createTileItem(arrTiles[i]);
                }
                this.set('tileArray', new Backbone.Collection(lstTiles));
            }

            //this.listenTo(this.get('tileArray'), 'remove', this.onRemoveTiles);
        },

        onRemoveTiles: function () {
            if (this.get('tileArray').length === 0) this.collection.remove(this);
        },

        /**
        * Get child item from index
        * @method getItemFromIndex
        * @param index {String} index of an item.
        * @return {MathInteractives.Common.Components.Models.EquationManager.TileItem}
        */
        getItemFromIndex: function (itemIndex) {
            var indexes, index;
            if (itemIndex) {
                indexes = itemIndex.split('.');
                index = parseInt(indexes[0], 10);
                indexes.splice(0, 1);
                return this.get('tileArray').at(index).getItemFromIndex(indexes.join('.'));
            }
            else if (itemIndex === '') {
                return this;
            }
            return null;
        },


        getIndexOfItem: function getIndexOfItem(point) {
            var counter = 0,
                tileArr = this.get('tileArray');
            for (; counter < tileArr.length; counter++) {
                if (point.getLeft() > tileArr.models[counter].get('rectTerm').getLeft()) {
                    return this.get('tileArray').at(counter).getIndexOfItem(point);
                }
                else {
                    return this;
                }
            }
            return null;
        },

         /**
         * Will get hoe many ever parenthesis present in the given expression
         * @returns {Array} The array consisting of all parenthesis present
         *
         * @method getAllParenthesis
         */
        getAllParenthesis : function getAllParenthesis () {
            var index,
                tileArr = this.get('tileArray'),
                childArr = [],
                types = modelClassNameSpace.TileItem.SolveTileType,
                currentTile, currentType;

            if(this.get('bDenominator')) {
                childArr.push(this.get('coefficient') * 2);
            }
            else {
                childArr.push(this.get('coefficient'));
            }

            for(index=0; index<tileArr.length; index++) {
                currentTile = tileArr.at(index);
                currentType = currentTile.get('type');
                if(currentType !== types.BASE_EXPONENT && currentType ===types.BASE_ONLY) {
                    childArr = childArr.concat(currentTile.getAllParenthesis());
                }
            }
            return childArr;
        },

         /**
         * To check whether this parenthesis does exist
         * @returns {Boolean} true if it does
         *
         * @method isParenthesisPresent
         */
        isParenthesisPresent: function isParenthesisPresent () {
            return true;
        },

         /**
         * To check whether this parenthesis exponent is not null
         * @returns {Boolean} true if it not else false
         *
         * @method checkParentesisExponent
         */
        checkParentesisExponent: function () {
            return this.get('exponent') === null ? false : true;
        },

        /**
        * Convenience function that prints the expression. Recursively calls printExpr of the child tiles.
        *
        * @method printExpr
        * @return {String} Expression string
        */
        printExpr: function () {
            var i = 0,
                exp = this.get('exponent'),
                tileArray = this.get('tileArray'),
                str = this.get('operator') || '';
            str = str + this.get('coefficient');
            str = str + '(';

            for (i = 0; i < tileArray.models.length; i++) {
                str = str + tileArray.at(i).printExpr();
            }

            str = str + ')^' + exp;
            return str;
        },

        /**
        * Returns a boolean representing whether the ParenthesisTileItem has a fraction as a child.
        *
        * @method hasFractionChild
        * @return {Boolean} Whether the ParenthesisTileItem has a fraction as a child.
        */
        hasFractionChild: function () {
            var fractionChildren = this.get('tileArray').where({ type: modelClassNameSpace.TileItem.SolveTileType.FRACTION });

            return fractionChildren.length === 0 ? false : true;
        },

        /**
        * Returns the tile's content in latex form.
        *
        * @method getTileContentInLatexForm
        * @return {String} The latex form of the tile's content.
        */
        getTileContentInLatexForm: function getTileContentInLatexForm() {
            var operator = this.get('operator'),
                equationLatexString = '',
                tileArray = this.get('tileArray'),
                index,
                exponent = this.get('exponent');
            if (operator === '*') {
                operator = '\\cdot ';
            }
            equationLatexString += operator || '';
            equationLatexString += '\\left(';
            for (index = 0; index < tileArray.length; index++) {
                equationLatexString += tileArray.models[index].getTileContentInLatexForm();
            }
            equationLatexString += '\\right)';
            if (exponent !== null) {
                if (exponent > 9 || exponent < 0) {
                    exponent = '{' + exponent + '}';
                }
                equationLatexString += '^' + exponent;
            }
            return equationLatexString;
        },

        /*getTree: function () {
            var index, j,
                tiles = this.get('tileArray'),
                currentSymbol,
                currentTile,
                childTiles = [],
                types = modelClassNameSpace.TileItem.SolveTileType,
                length = tiles.length;

            this.operatorStack = [];
            this.postfixModels = [];

            for (index = 0; index < length; index++) {
                currentTile = tiles.at(index);
                currentSymbol = currentTile.get('operator');
                if (currentTile.get('type') === types.BASE_EXPONENT || currentTile.get('type') === types.BASE_ONLY) {
                    if (currentSymbol === null) {
                        while (this.operatorStack.length !== 0) {
                            this.postfixModels.push(this.operatorStack.pop());
                        }
                        this.postfixModels.push(currentTile);
                    }
                    else {
                        while (this.operatorStack.length > 0 && this.isPrecedent(this.operatorStack[this.operatorStack.length - 1], currentSymbol)) {
                            this.postfixModels.push(this.operatorStack.pop());
                        }
                        this.operatorStack.push(currentSymbol);
                        this.postfixModels.push(currentTile);
                    }
                }
                else {
                    if (currentSymbol !== null) {
                        while (this.operatorStack.length > 0 && this.isPrecedent(this.operatorStack[this.operatorStack.length - 1], currentSymbol)) {
                            this.postfixModels.push(this.operatorStack.pop());
                        }
                        this.operatorStack.push(currentSymbol);
                    }
                    childTiles = currentTile.getTree();
                    for (j = 0; j < childTiles.length; j++) {
                        this.postfixModels.push(childTiles[j]);
                    }
                }
            }
            while (this.operatorStack.length > 0) {
                this.postfixModels.push(this.operatorStack.pop());
            }
            this.postfixModels.push(this.get('exponent'));
            this.postfixModels.push("^");
            this.postfixModels.push(this);
            return this.postfixModels;
        },*/

        /**
        * Returns true if the tle is empty
        *
        * @method isEmpty
        * @param {Object} Type denotes whether to check if only the base is empty or the exponent is empty or both
        * @return {Boolean} Boolean representing whether the tile is empty
        */
        isEmpty: function (type) {
            var isEmpty = true,
                tiles = this.get('tileArray'),
                TYPE = modelClassNameSpace.TileItem.BinTileType,
                exponent = this.get('exponent'),
                i = 0;
            
            if (exponent !== null && exponent !== undefined) { isEmpty = false; }
            if (type === TYPE.EXPONENT) {
                return isEmpty;
            }
            for (i = 0; i < tiles.length; i++) {
                if (!tiles.at(i).isEmpty()) { isEmpty = false; }
            }

            return isEmpty;
        },

        /**
         * To check whether this parenthesis exponent is negative
         * @returns {Boolean} true if it not else false
         *
         * @method isNegativeExpPresent
         */
        isNegativeExpPresent: function isNegativeExpPresent () {
            if(this.get('exponent') <= 0) {
                return false;
            }
            return true;
        }
    });

})();
