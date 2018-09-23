(function () {
    'use strict';

    var modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * Tile Item holds the data for the tile Item View
    *
    * @class BaseExp
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Models.EquationManager.TileItem
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    */
    modelClassNameSpace.FractionTile = modelClassNameSpace.TileItem.extend({
        defaults: $.extend(true, {}, modelClassNameSpace.TileItem.prototype.defaults, {

            type: modelClassNameSpace.TileItem.SolveTileType.FRACTION
        }),

        operatorStack: [],

        postfixModels: [],

        initialize: function () {
            modelClassNameSpace.FractionTile.__super__.initialize.apply(this, arguments);
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
        },

        /**
        * Get child item from index
        * @method getItemFromIndex
        * @param index {String} index of an item.
        * @return {MathInteractives.Common.Components.Models.EquationManager.TileItem}
        */
        getItemFromIndex: function (itemIndex) {
            var indexes, index,
                tiles = this.get('tileArray');
            if (itemIndex) {
                indexes = itemIndex.split('.');
                index = parseInt(indexes[0], 10);
                indexes.splice(0, 1);
                if (tiles.at(index)) {
                    return this.get('tileArray').at(index).getItemFromIndex(indexes.join('.'));
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


        getIndexOfItem: function getIndexOfItem(point) {
            var counter = 0,
                tileArr = this.get('tileArray');

            for (; counter < tileArr.length; counter++) {
                if (point.getLeft() > tileArr.models[counter].get('rectTerm').getLeft()) {
                    return this.get('tileArray').at(counter).getIndexOfItem(point, counter);
                }
                else {
                    return this;
                }
            }
            return null;
        },

        getAllParenthesis : function getAllParenthesis () {
            var index,
                tileArr = this.get('tileArray'),
                types = modelClassNameSpace.TileItem.SolveTileType,
                childArr = [], currentTile, currentType;
            for(index=0; index<tileArr.length; index++) {
                currentTile = tileArr.at(index);
                currentType = currentTile.get('type');
                if(currentType !== types.BASE_EXPONENT && currentType !== types.BASE_ONLY) {
                    childArr = childArr.concat(currentTile.getAllParenthesis());
                }
            }
            return childArr;
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

            for (i = 0; i < arrTiles.length; i++) {
                if (arrTiles.at(i).get('bDenominator') === false) {
                    str = str + arrTiles.at(i).printExpr();
                }
                else {
                    break;
                }
            }
            str = str + '\n---------------------------------\n';
            for (; i < arrTiles.length; i++) {
                str = str + arrTiles.at(i).printExpr();
            }

            return str;
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
                index;
            if (operator === '*') {
                operator = '\\cdot ';
            }
            equationLatexString += operator || '';
            equationLatexString += '\\frac{';
            for (index = 0; index < tileArray.length; index++) {
                if (!tileArray.models[index].get('bDenominator')) {
                    equationLatexString += tileArray.models[index].getTileContentInLatexForm();
                }
            }
            equationLatexString += '}{';
            for (index = 0; index < tileArray.length; index++) {
                if (tileArray.models[index].get('bDenominator')) {
                    equationLatexString += tileArray.models[index].getTileContentInLatexForm();
                }
            }
            equationLatexString += '}';
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
                if(index === 0) {
                    if(currentTile.get('bDenominator') === true) {
                        this.postfixModels.push(1);
                    }
                }
                if (currentTile.get('type') === types.BASE_EXPONENT || currentTile.get('type') ===types.BASE_ONLY) {
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
            for(index=0; index<length; index++) {
                if(tiles.at(index).get('bDenominator') === true) {
                    break;
                }
            }
            if(index === length) {
                this.postfixModels.push(1);
            }
            this.postfixModels.push("/");
            this.postfixModels.push(this);
            return this.postfixModels;
        },*/

        /**
        * Returns true if the numerator is empty. False otherwise.
        * @method isNumeratorEmpty
        * @return {Boolean} True if the numerator is empty. False otherwise.
        */
        isNumeratorEmpty: function () {
            var tiles = this.get('tileArray'),
                numTiles = tiles.where({ bDenominator: false }),
                numLength = numTiles.length;

            return numLength === 0;
        },

        /**
        * Returns true if the denominator is empty. False otherwise.
        * @method isDenominatorEmpty
        * @return {Boolean} True if the denominator is empty. False otherwise.
        */
        isDenominatorEmpty: function () {
            var tiles = this.get('tileArray'),
                denTiles = tiles.where({ bDenominator: true }),
                denLength = denTiles.length;
            return denLength === 0;
        }
    });

})();
