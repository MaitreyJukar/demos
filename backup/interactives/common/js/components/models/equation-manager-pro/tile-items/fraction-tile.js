(function () {
    'use strict';

    var modelNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro;

    /**
    * Tile Item holds the data for the tile Item View
    *
    * @class BaseExp
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Models.EquationManagerPro.TileItem
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    */
    modelNameSpace.FractionTile = modelNameSpace.TileItem.extend({

        defaults: $.extend(true, {}, modelNameSpace.TileItem.prototype.defaults, {

            /** Stores the type of the tile: fraction, parenthesis, base-exp
            *
            * @attribute type
            * @type String
            * @default fraction
            **/
            type: modelNameSpace.TileItem.TileType.FRACTION_TILE

        }),

        /**
        * Initializes the TileItem model object
        *
        * @method initialize
        **/
        initialize: function () {
            modelNameSpace.FractionTile.__super__.initialize.apply(this, arguments);
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
                if(index === 0) {
                    if(currentTile.get('isDenominator') === true) {
                        postfixModels.push(1);
                    }
                }
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
            while (operatorStack.length > 0) {
                postfixModels.push(operatorStack.pop());
            }

            if(typeof(this.getFirstDenominatorTile()) === 'undefined') {
                postfixModels.push(1);
            }
            postfixModels.push(modelNameSpace.TileItem.OPERATORS.DIVISION);
            postfixModels.push(this);
            return postfixModels;
        },

        /**
        * Returns true if the denominator is empty. False otherwise.
        * @method isDenominatorEmpty
        * @return {Boolean} True if the denominator is empty. False otherwise.
        */
        getDenominatorLength: function () {
            var tiles = this.get('tileArray'),
                denTiles = tiles.where({ isDenominator: true });

            return denTiles.length;
        },

        /**
        * Returns the first tile in the Denominator
        *
        * @method getFirstDenominatorTile
        * @return {Object} First tile in the denominator
        */
        getFirstDenominatorTile: function () {
            var tiles = this.get('tileArray');
            if (tiles) {
                return tiles.findWhere({ isDenominator: true });
            }
        },

        /**
         * Gets numerator length
         * @method getNumeratorLength
         * @public
         *
         * @returns {Number} The length of the numerator.
         */
        getNumeratorLength: function () {
            var tiles = this.get('tileArray'),
                numTiles = tiles.where({ isDenominator: false });

            return numTiles.length;
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
                arrTiles = this.get('tileArray'),
                str = this.get('operator') || '';

			str += '{';

            for (i = 0; i < arrTiles.length; i++) {
                if (arrTiles.at(i).get('isDenominator') === false) {
                    str += arrTiles.at(i).printExpr();
                }
                else {
                    break;
                }
            }
            str += '} / {';
            for (; i < arrTiles.length; i++) {
                str += arrTiles.at(i).printExpr();
            }
            str += '}';
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
            var tiles = this.get('tileArray'),
                numLength = this.getNumeratorLength(),
                numTile, denTile, numBase, denBase, gcf;
            if(numLength > 1 || tiles.length > 2) {
                return false;
            }
            //there will never exist a parentheses in a fraction. So no need of recursive approach. So both numerator and denominator are term tiles.
            numTile = tiles.at(0);
            denTile = tiles.at(1);

            numBase = numTile && numTile.checkIfSimplestFormFractionCase(true);
            denBase = denTile && denTile.checkIfSimplestFormFractionCase(true);

            if(numBase && denBase) {
                //if both are negative
                if(numBase < 0 && denBase < 0) {
                    return false;
                }
                //if denominator is 1 and numerator is positive.
                if(Math.abs(denBase) === 1) {
                    return false;
                }
                //if numerator is 1 and denominator is not 1.
                if(Math.abs(numBase) === 1) {
                    return true;
                }

                gcf = MathInteractives.Common.Components.Models.EquationManagerPro.EquationManagerPro.Utils.getGCF(numBase, denBase);
                if (Math.abs(gcf) === 1) {
                    // do not return true if fraction to be shown more precisely in decimals...
                    //this.trigger(modelNameSpace.FractionTile.SOLVE_FRACTION_TO_DECIMAL);
                    return true;
                }
                return false;
            }
            return false;
        },

        checkFractionToDecimalCase: function checkFractionToDecimalCase() {
            var tiles = this.get('tileArray'),
                numLength = this.getNumeratorLength(),
                numTile, denTile, numBase, denBase, gcf;
            if (numLength > 1 || tiles.length > 2) {
                return false;
            }
            //there will never exist a parentheses in a fraction. So no need of recursive approach. So both numerator and denominator are term tiles.
            numTile = tiles.at(0);
            denTile = tiles.at(1);

            numBase = numTile && numTile.checkIfSimplestFormFractionCase(true);
            denBase = denTile && denTile.checkIfSimplestFormFractionCase(true);

            if (numBase && denBase) {
               
                //if denominator is 1 and numerator is positive.
                if (Math.abs(denBase) === 1) {
                    return false;
                }
                return true;
            }
            return false;
        }

    }, {
        
    });

})(window.MathInteractives);
