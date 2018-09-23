(function (MathInteractives) {
    'use strict';

    var modelNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro;

    /**
    * Tile Item holds the data for the tile Item View
    *
    * @class TileItem
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Player.Models.Base
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    */
    modelNameSpace.TileItem = MathInteractives.Common.Player.Models.Base.extend({
        defaults: {

            /**
            * Stores an array of tiles
            *
            * @attribute tileArray
            * @type Array
            * @default null
            **/
            tileArray: null,

            /**
            * Left operator of the tile.
            * e.g. for 2^3*(8^2*5^4) for the tile 5^4 operator is '*'
            * It is null for tiles that are the first elems in the parent tile
            *
            * @attribute operator
            * @type String
            * @default null
            **/
            operator: null,

            /**
            * Stores whether term is in the numerator or deniminator
            *
            * @attribute isDenominator
            * @Boolean
            * @default false
            **/
            isDenominator: false,

            /**
            * Stores whether term is in the LHS or RHS of expression
            *
            * @attribute isLHS
            * @Boolean
            * @default true
            **/
            isLHS: true,

            /**
            * Stores the type of the tile: fraction, parenthesis, base-exp
            *
            * @attribute type
            * @type String
            * @default null
            **/
            type: null,
        },

        /**
        * Initializes the TileItem model object
        *
        * @method initialize
        **/
        initialize: function () {

        },

        /**
         * Starts to create the tree structure by converting the models to postfix format.
         * @method getTree
         * @public
         *
         */
        getTree: function () {
            throw new Error('Not implemented Get Tree');
        },

        /**
        * Get child model item from index
        * @method getModelFromIndex
        * @param index {String} Index of an item.
        * @return {MathInteractives.Common.Components.Models.EquationManagers.TileItem}
        */
        getModelFromIndex: function getModelFromIndex() {
            throw new Error('Not implemented getModelFromIndex');
        },

        /**
        * Get index of item.
        * @method getIndexFromItemModel
        * @param item {Object} The item whose index is to be found
        * @return {String} The index of the item passed.
        */
        getIndexFromItemModel: function (item) {
            var i, index, tiles;
            tiles = this.get('tileArray');
            if (!tiles) return -1;
            index = tiles.models.indexOf(item);
            // tile found
            if (index !== -1) {
                return index + '';
            }
            else {
                for (i = 0; i < tiles.length; i++) {
                    index = tiles.at(i).getIndexFromItemModel(item);
                    if (index !== -1) return i + '.' + index + '';
                }
                return -1;
            }
        },

        /**
         * An helper method for the getTree method.
         * Used to check the precedence of the operators.
         * @method isPrecedent
         * @public
         *
         * @param   {String}  top     The operator present at the top of the operator stack
         * @param   {String}  current The operator currently being compared with.
         * @returns {Boolean} Returns whether the current operator is to be pushed or not.
         */
        isPrecedent: function (top, current) {
            var operators = modelNameSpace.TileItem.OPERATORS;
            switch (top) {
                case operators.ADDITION:
                case operators.SUBTRACTION:
                    {
                        if ([operators.ADDITION, operators.SUBTRACTION].indexOf(current) > -1) {
                            return true;
                        }
                        if ([operators.MULTIPLICATION, operators.DIVISION].indexOf(current) > -1) {
                            return false;
                        }
                        break;
                    }
                case operators.MULTIPLICATION:
                case operators.DIVISION:
                    {
                        if ([operators.ADDITION, operators.SUBTRACTION,
                            operators.DIVISION, operators.MULTIPLICATION].indexOf(current) > -1) {
                            return true;
                        }
                    }
            }
            return true;
        },

        /**
        * Performs a deep copy and returns a clone of this object.
        *
        * @method deepClone
        * @return {Object} Deep copied clone of this object
        */
        deepClone: function () {
            // clones
            // exponent, type, base
            // but tileArray needs to be deep copied
            var clonedObj = this.clone(),
                i = null,
                tileArray = this.get('tileArray'),
                newTileArray = new Backbone.Collection(),
                newTile = null;

            // if tileArray is non-empty
            if (tileArray && tileArray.length > 0) {
                // iterate over tileArray and call each object's deepClone method
                for (i = 0; i < tileArray.length; i++) {
                    newTile = tileArray.at(i).deepClone();
                    newTileArray.add(newTile);
                }

                clonedObj.set('tileArray', newTileArray);
            }
            clonedObj.set({
                'multipleInParentheses': null,
                'treeNodeRef': null
            });
            return clonedObj;
        },

        /**
        * Sets the isDenominator of itself & all child tiles
        * @method setBDenominator
        * @param {Boolean} Boolean to set the isDenominator to.
        */
        setBDenominator: function (bool) {
            this.set('isDenominator', bool);
            var tiles = this.get('tileArray'),
                i = 0;
            if (tiles) {
                for (i = 0; i < tiles.length; i++) {
                    tiles.at(i).set('isDenominator', bool);
                }
            }
        },

        /**
        * Sets the isLHS of itself & all child tiles
        * @method setIsLHS
        * @param {Boolean} Boolean to set the isLHS to.
        */
        setIsLHS: function setIsLHS(bool) {
            this.set('isLHS', bool);
            var tiles = this.get('tileArray'),
                i = 0;
            if (tiles) {
                for (i = 0; i < tiles.length; i++) {
                    tiles.at(i).setIsLHS(bool);
                }
            }
        },

        /**
         * check if variable present inside term
         * @method checkIfVariablePresent
         * @public
         *
         * @returns {Boolean} Whether it is present or not.
         */
        checkIfVariablePresent: function checkIfVariablePresent () {
            var tiles = this.get('tileArray'),
                index;
            for(index=0; index<tiles.length; index++) {
                if(tiles.at(index).checkIfVariablePresent() === true) {
                    return true;
                }
            }
            return false;
        },

        checkFractionToDecimalCase: function checkFractionToDecimalCase() {
            return false;
        }

    }, {
        TileType: {
            BIN_TILE: 'BIN_TILE',
            TERM_TILE: 'TERM_TILE',
            PARENTHESES: 'PARENTHESES',
            FRACTION: 'FRACTION',
            EQUATION: 'EQUATION',
            EXPRESSION: 'EXPRESSION',
            SQUARED_PARENTHESES: 'SQUARED_PARENTHESES',
            MARQUEE: 'MARQUEE',
            PARENTHESES_EXPONENT : 'PARENTHESES_EXPONENT'
        },

        OPERATORS: {
            EQUAL: '=',
            ADDITION: '+',
            MULTIPLICATION: '*',
            DIVISION: '/',
            PARENTHESES: '^',
            SUBTRACTION: '-'
        },

        /**
         * Creates TileItem Model from data
         *
         * @method createTileItem
         * @static
         * @return {MathInteractives.Common.Interactivities.ExponentAccordion.EquationManagerPro.Models.TileItem} Created model object.
         */
        createTileItem: function (data) {
            var itemModel,
                itemTypes = modelNameSpace.TileItem.TileType;
            switch (data.type) {
                case itemTypes.BASE_EXPONENT:
                    {
                        itemModel = new modelNameSpace.BaseExpTile(data);
                    }
                    break;
                case itemTypes.PARENTHESES:
                    {
                        itemModel = new modelNameSpace.ParenthesesTile(data);
                    }
                    break;
                case itemTypes.FRACTION:
                    {
                        itemModel = new modelNameSpace.FractionTile(data);
                    }
                    break;
                case itemTypes.SQUARED_PARENTHESES:
                    {
                        itemModel = new modelNameSpace.SquaredParenthesesTile(data);
                    }
                    break;
                case itemTypes.TERM_TILE:
                    {
                        itemModel = new modelNameSpace.TermTile(data);
                    }
                    break;
                case itemTypes.EXPRESSION:
                    {
                        itemModel = new modelNameSpace.Expression(data);
                    }
                    break;
                default:
                    {
                        throw new Error('Item Type does not exist');
                    }
                    break;
            }
            return itemModel;
        }
    });


})(window.MathInteractives);
