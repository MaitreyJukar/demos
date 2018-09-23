(function () {
    'use strict';

    var modelNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro;

    /**
    * Properties required for populating ExponentAccordion releted data.
    *
    * @class Expression
    * @construtor
    * @extends MathInteractives.Common.Components.Models.EquationManagerPro.TileItem
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    */
    modelNameSpace.Expression = modelNameSpace.TileItem.extend({

        defaults: $.extend(true, {}, modelNameSpace.TileItem.prototype.defaults, {

            /** Stores the type of the tile: fraction, parenthesis, base-exp
            *
            * @attribute type
            * @type String
            * @default expression
            **/
            type: modelNameSpace.TileItem.TileType.EXPRESSION

        }),

        /**
        * Initializes the TileItem model object
        *
        * @method initialize
        **/
        initialize: function () {
            modelNameSpace.Expression.__super__.initialize.apply(this, arguments);
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
                    lstTiles[i] = modelNameSpace.TileItem.createTileItem(arrTiles[i]);
                }
                this.set('tileArray', new Backbone.Collection(lstTiles));
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
                length = tiles.length,
                currentSymbol, currentTile,
                operatorStack = [], postfixModels = [];

            // for each child in children
            for(index = 0; index<length; index++) {
                currentTile = tiles.at(index);
                currentSymbol = currentTile.get('operator');
                if (modelNameSpace.EquationManagerPro.Utils.isBasicTileType(currentTile)) {
                    if(currentSymbol === null) {
                        while(operatorStack.length !== 0) {
                            postfixModels.push(operatorStack.pop());
                        }
                        postfixModels.push(currentTile);
                    }
                    else {
                        while(operatorStack.length > 0 && this.isPrecedent(operatorStack[operatorStack.length - 1], currentSymbol))
                        {
                            postfixModels.push(operatorStack.pop());
                        }
                        operatorStack.push(currentSymbol);
                        postfixModels.push(currentTile);
                    }
                }
                else {
                    if(currentSymbol !== null) {
                        while(operatorStack.length > 0 && this.isPrecedent(operatorStack[operatorStack.length - 1], currentSymbol))
                        {
                            postfixModels.push(operatorStack.pop());
                        }
                        operatorStack.push(currentSymbol);
                    }
                    /*childTiles = currentTile.getTree();
                    for(j = 0; j<childTiles.length; j++) {
                        postfixModels.push(childTiles[j]);
                    }*/
                    Array.prototype.push.apply(postfixModels, currentTile.getTree());
                }
            }
            while(operatorStack.length > 0)
            {
                postfixModels.push(operatorStack.pop());
            }

            return postfixModels;
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
        * Prints a string representation of the current expression
        *
        * @method printExpr
        * @return {String} String representation of the current expression
        */
        printExpr: function () {
            var tiles = this.get('tileArray'),
		        i = 0,
		        str = '';

            for (i = 0; i < tiles.length; i++) {
                str = str + tiles.at(i).printExpr();
            }

            return str;
        },

        /**
        * Returns a string for getting the simplest form of the expression
        *
        * @method checkSimplest
        * @return {String} String representation of the current equation
        */
        checkSimplest: function checkSimplest () {
            var tiles = this.get('tileArray'),
                i = 0,
                str = '', currentString;

            for (i = 0; i < tiles.length; i++) {
                currentString = tiles.at(i).checkSimplest();
                if(currentString === false) {
                    return false;
                }
                str = str + currentString;
            }

            return str;
        },

        checkIfSimplestFormFractionCase: function checkIfSimplestFormFractionCase () {
            var tiles = this.get('tileArray');
            if(tiles.length > 1) {
                return false;
            }
            return tiles.at(0).checkIfSimplestFormFractionCase();
        },

        checkFractionToDecimalCase: function checkFractionToDecimalCase() {
            var tiles = this.get('tileArray');
            if(tiles.length > 1) {
                return false;
            }
            return tiles.at(0).checkFractionToDecimalCase();
        }
    }, {

    });
})();
