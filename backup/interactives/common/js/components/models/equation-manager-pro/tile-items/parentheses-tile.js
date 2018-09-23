(function () {
    'use strict';

    var modelNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro;

    /**
    * ParenthesisTile holds data for any parethesis item
    *
    * @class ParenthesisTile
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Models.EquationManagerPro.TileItem
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    */
    modelNameSpace.ParenthesesTile = modelNameSpace.TileItem.extend({
        defaults: $.extend(true, {}, modelNameSpace.TileItem.prototype.defaults, {
            /**
            * Stores the type of the tile: fraction, parenthesis, base-exp
            *
            * @attribute type
            * @type string
            * @default term-tile
            **/
            type: modelNameSpace.TileItem.TileType.PARENTHESES_TILE,

            /**
            * exponent value on parentheses
            *
            * @attribute exponent
            * @type Number
            * @default null
            **/
            exponent: null,

        }),

        /**
        * Initializes the TileItem model object
        *
        * @method initialize
        **/
        initialize: function () {
            modelNameSpace.ParenthesesTile.__super__.initialize.apply(this, arguments);
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

            for (index = 0; index < length; index++) {
                currentTile = tiles.at(index);
                currentSymbol = currentTile.get('operator');
                if (modelNameSpace.EquationManagerPro.Utils.isBasicTileType(currentTile)) {
                    if (currentSymbol === null) {
                        while (operatorStack.length !== 0) {
                            postfixModels.push(operatorStack.pop());
                        }
                        postfixModels.push(currentTile);
                    }
                    else {
                        while (operatorStack.length > 0 && this.isPrecedent(operatorStack[operatorStack.length - 1], currentSymbol)) {
                            postfixModels.push(operatorStack.pop());
                        }
                        operatorStack.push(currentSymbol);
                        postfixModels.push(currentTile);
                    }
                }
                else {
                    if (currentSymbol !== null) {
                        while (operatorStack.length > 0 && this.isPrecedent(operatorStack[operatorStack.length - 1], currentSymbol)) {
                            postfixModels.push(operatorStack.pop());
                        }
                        operatorStack.push(currentSymbol);
                    }
                    /*childTiles = currentTile.getTree();
                    for (j = 0; j < childTiles.length; j++) {
                        postfixModels.push(childTiles[j]);
                    }*/
                    Array.prototype.push.apply(postfixModels, currentTile.getTree());
                }
            }
            if(length === 0) {
                //if nothing exists inside parentheses
                postfixModels.push(null);
            }
            while (operatorStack.length > 0) {
                postfixModels.push(operatorStack.pop());
            }
            postfixModels.push(this.get('exponent'));
            postfixModels.push(modelNameSpace.TileItem.OPERATORS.PARENTHESES);
            postfixModels.push(this);
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
        * Convenience function that prints the expression. Recursively calls printExpr of the child tiles.
        *
        * @method printExpr
        * @return {String} Expression string
        */
        printExpr: function () {
            var i = 0,
                exp = this.get('exponent'),
                tileArray = this.get('tileArray'),
                operator = this.get('operator') || '',
                str = '';
            for (i = 0; i < tileArray.models.length; i++) {
                str = str + tileArray.at(i).printExpr();
            }
            str = '(' + str + ')';
            if (exp) {
                str += modelNameSpace.TileItem.OPERATORS.PARENTHESES + exp;
            }
            str = operator + str;
            return str;
        },

        /**
        * Returns a string for getting the simplest form of the expression
        *
        * @method getExpression
        * @return {Boolean} String representation of the current equation
        */
        checkSimplest: function checkSimplest () {
            return false;
        },

        checkIfSimplestFormFractionCase: function checkIfSimplestFormFractionCase () {
            return false;
        }
    }, {

    });

})(window.MathInteractives);
