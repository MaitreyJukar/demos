(function () {
    'use strict';

    var modelNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro;

    /**
    * Properties required for populating ExponentAccordion releted data.
    *
    * @class Equation
    * @construtor
    * @extends MathInteractives.Common.Components.Models.EquationManagerPro.TileItem
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    */
    modelNameSpace.SquaredParenthesesTile = modelNameSpace.ParenthesesTile.extend({

        defaults: $.extend(true, {}, modelNameSpace.TileItem.prototype.defaults, {

            /** Stores the type of the tile: fraction, parenthesis, base-exp
            *
            * @attribute type
            * @type String
            * @default SQUARED_PARENTHESES
            **/
            type: modelNameSpace.TileItem.TileType.SQUARED_PARENTHESES

        }),

        /**
        * Initializes the TileItem model object
        *
        * @method initialize
        **/
        initialize: function () {
            modelNameSpace.SquaredParenthesesTile.__super__.initialize.apply(this, arguments);
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
            str = '[' + str + ']';
            if (exp) {
                str += modelNameSpace.TileItem.OPERATORS.PARENTHESES + exp;
            }
            str = operator + str;
            return str;
        }

    }, {

    });
})();
