(function (MathInteractives) {
    'use strict';

    var modelNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro;
    /**
    * BaseExpTile holds the data for a simple tile
    *
    * @class BaseExpTile
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Models.EquationManagerPro.TileItem
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    */
    modelNameSpace.BaseExpTile = modelNameSpace.TileItem.extend({

        /**
        * Get child model item from index
        * @method getModelFromIndex
        * @param index {String} Index of an item.
        * @return {MathInteractives.Common.Components.Models.EquationManagers.TileItem}
        */
        getModelFromIndex: function getModelFromIndex(itemIndex) {
            if (index === '') {
                return this;
            }
            else {
                return null;
            }
        },

        /**
        * Convenience function that prints the expression.
        *
        * @method printExpr
        */
        printExpr: function () {
            var str = '';
            str = this.get('operator') || '';
            str = str + this.get('base') + modelNameSpace.TileItem.OPERATORS.PARENTHESES + this.get('exponent');
            return str;
        }
    },{

    });

});
