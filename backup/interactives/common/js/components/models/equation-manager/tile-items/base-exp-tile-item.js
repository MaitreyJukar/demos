(function (MathInteractives) {
    'use strict';

    var modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * BaseExpTile holds the data for a simple tile
    *
    * @class BaseExpTile
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Models.EquationManager.TileItem
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    */
    modelClassNameSpace.BaseExpTile = modelClassNameSpace.TileItem.extend({
        defaults: $.extend(true, {}, modelClassNameSpace.TileItem.prototype.defaults, {
            type: modelClassNameSpace.TileItem.SolveTileType.BASE_EXPONENT
        }),

        /**
        * Initializes the TileItem model object
        *
        * @method initialize
        **/
        initialize: function () {
            modelClassNameSpace.BaseExpTile.__super__.initialize.apply(this, arguments);
        },

        /**
        * Get child item from index
        * @method getItemFromIndex
        * @param index {String} index of an item.
        * @return {MathInteractives.Common.Components.Models.EquationManager.TileItem}
        */
        getItemFromIndex: function (index) {
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
            str = str + this.get('base') + '^' + this.get('exponent');
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
                base = this.get('base'),
                exponent = this.get('exponent');
            if (operator === '*') {
                operator = '\\cdot ';
            }
            equationLatexString += operator || '';
            equationLatexString += base;
            if (exponent !== null) {
                if (exponent > 9 || exponent < 0) {
                    exponent = '{' + exponent + '}';
                }
                equationLatexString += '^' + exponent;
            }
            return equationLatexString;
        },

        /**
         * Returns all bases present in the equation view
         * @returns {Array} An array consisting of all the bases
         *
         * @method getAllBases
         */
        getAllBases: function getAllBases () {
            var base = this.get('base');
            if(base !== null) {
                return [base];
            }
            return [];
        },

        getIndexFromItem : function getIndexFromItem (item) {
            return -1;
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
        },

        /**
         * To check whether this parenthesis does exist
         * @returns {Boolean} true if it does
         *
         * @method isParenthesisPresent
         */
        isParenthesisPresent: function isParenthesisPresent () {
            return false;
        },

        /**
         * To check if there is a term with exponent 1 or -1
         * @returns {Boolean} Return true if there is a term present else false
         *
         * @method isExpAbsOne
         */
        isExpAbsOne: function isExpAbsOne () {
            return Math.abs(this.get('exponent')) === 1;
        }

    }, {
        TILE_TYPES: {
            BASE: 0,
            EXPONENT: 1,
            BASE_EXPONENT: 2
        }
    });

})(window.MathInteractives);
