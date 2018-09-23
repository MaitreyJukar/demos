(function (MathInteractives) {
    'use strict';

    var modelClassNameSpace = MathInteractives.Common.Components.Models.EquationManager;

    /**
    * BaseTile holds the data for a simple base tile
    *
    * @class BaseTile
    * @module EquationManager
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Models.EquationManager.TileItem
    * @namespace MathInteractives.Common.Components.Models.EquationManager
    */
    modelClassNameSpace.BaseTile = modelClassNameSpace.TileItem.extend({
        defaults: $.extend(true, {}, modelClassNameSpace.TileItem.prototype.defaults, {
            type: modelClassNameSpace.TileItem.SolveTileType.BASE_ONLY,
            isDraggable: true,
            isDroppable: true,
            ignoreMarquee: false
        }),

        /**
        * Initializes the TileItem model object
        *
        * @method initialize
        **/
        initialize: function () {
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
         * Returns the tile's content in latex form.
         *
         * @method getTileContentInLatexForm
         * @return {String} The latex form of the tile's content.
         */
        getTileContentInLatexForm: function getTileContentInLatexForm() {
            var operator = this.get('operator'),
                equationLatexString = '',
                base = this.get('base');
            if (operator === '*') {
                operator = '\\cdot ';
            }
            equationLatexString += operator || '';
            equationLatexString += base;
            return equationLatexString;
        },

        /**
        * Convenience function that prints the expression.
        *
        * @method printExpr
        */
        printExpr: function () {
            var str = '';
            str = this.get('operator') || '';
            str = str + this.get('base');
            return str;
        },

        getIndexFromItem : function getIndexFromItem (item) {
            return -1;
        },

        /**
         * Returns all bases present in the equation view
         * @returns {Array} An array consisting of all the bases
         *
         * @method getAllBases
         */
        getAllBases: function getAllBases () {
            var base = this.get('base');
            if(base !== null && this.isOne() === false) {
                return [base];
            }
            return [];
        },

        /**
         * To check whether this parenthesis exponent is negative
         * @returns {Boolean} true if it not else false
         *
         * @method isNegativeExpPresent
         */
        isNegativeExpPresent: function isNegativeExpPresent () {
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
        * Returns a boolean representing whether the tile is a static '1' tile in the numerator.
        * @method isOne
        * @return {Boolean} True if the tile is a static '1' tile. False otherwise.
        */
        isOne: function () {
            return this.get('base') === 1 && !this.get('isDraggable');
        },

        /**
         * To check if there is a term with exponent 1 or -1
         * @returns {Boolean} Return true if there is a term present else false
         *
         * @method isExpAbsOne
         */
        isExpAbsOne: function isExpAbsOne () {
            return false;
        }

    });

})(window.MathInteractives);
