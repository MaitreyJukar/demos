(function (MathInteractives) {
    'use strict';

    var modelNameSpace = MathInteractives.Common.Components.Models.EquationManagerPro;

    /**
    * An individual tile item would be using this model
    *
    * @class TermTile
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Models.EquationManagerPro.TileItem
    * @namespace MathInteractives.Common.Components.Models.EquationManagerPro
    */
    modelNameSpace.TermTile = modelNameSpace.TileItem.extend({
        defaults: $.extend(true, {}, modelNameSpace.TileItem.prototype.defaults, {

            /**
            * Stores the value of the base
            *
            * @attribute base
            * @type Number
            * @default null
            **/
            base: null,

            /**
            * Stores the type of the tile: fraction, parenthesis, base-exp
            *
            * @attribute type
            * @type String
            * @default term-tile
            **/
            type: modelNameSpace.TileItem.TileType.TERM_TILE,

            /**
            * Whether the paticular tile is draggable
            *
            * @attribute isDraggable
            * @type Boolean
            * @default true
            **/
            isDraggable: true,

            /**
            * Whether the paticular tile is droppable
            *
            * @attribute isDroppable
            * @type Boolean
            * @default true
            **/
            isDroppable: true,

            /**
            * Whether the paticular tile is supposed to be ignored by marquee selection
            *
            * @attribute ignoreMarquee
            * @type Boolean
            * @default false
            **/
            ignoreMarquee: false,

            /**
            * Will consist of different properties of the iota. whether present, then its exponent
            *
            * @attribute iotaProps
            * @type Object
            * @default null
            **/
            iotaExponent: null,

            /**
            * Will consist of different properties of the root. whether present, then its degree.
            *
            * @attribute squareRootProps
            * @type Object
            * @default null
            **/
            squareRootProps: null,

            /**
            * is term tile constant or variable
            *
            * @attribute isVariable
            * @type Object
            * @default null
            **/
            isVariable: null,

            /**
            * this is used for displaying end result
            *
            * @attribute endResult
            * @type boolean
            * @default false
            **/
            endResult: false
        }),

        /**
        * Initializes the TileItem model object
        *
        * @method initialize
        **/
        initialize: function () {
            modelNameSpace.TermTile.__super__.initialize.apply(this, arguments);
        },

        /**
        * Get child model item from index
        * @method getModelFromIndex
        * @param itemIndex {String} Index of an item.
        * @return {MathInteractives.Common.Components.Models.EquationManagers.TileItem}
        */
        getModelFromIndex: function getModelFromIndex(itemIndex) {
            if (itemIndex === '') {
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
            var str = '',
                operators = modelNameSpace.TileItem.OPERATORS,
                base = this.get('base'),
				iotaExponent = this.get('iotaExponent'),
				squareRootProps = this.get('squareRootProps');
            str = this.get('operator') || '';
            if (squareRootProps) {
                if (squareRootProps.isNegative)
                    str += operators.SUBTRACTION;
                if (squareRootProps.exponent)
                    str += '√';
            }
			if (base || base === 0 || base === '0')
				str += base;
			if (iotaExponent)
				str += (iotaExponent > 1) ? 'i' + operators.PARENTHESES + iotaExponent : 'i';
            return str;
        },

        /**
        * Returns a string for getting the simplest form of the expression
        *
        * @method getExpression
        */
        checkSimplest: function checkSimplest() {
            var str = '',
                base = this.get('base'),
                iotaExponent = this.get('iotaExponent'),
                squareRootProps = this.get('squareRootProps');
            str = this.get('operator') || '';
            if (squareRootProps) {
                return false;
            }
            if (base || base === 0) {
                str += base;
            }
            if (iotaExponent) {
                if(iotaExponent > 1) {
                    return false;
                }
                else {
                    str += 'i';
                }
            }
            return str;
        },

        checkIfSimplestFormFractionCase: function checkIfSimplestFormFractionCase (toReturnBaseValue) {
            var base;
            if(toReturnBaseValue) {
                if(this.checkIfVariablePresent()) {
                    return false;
                }
                return this.get('base');
            }
            else {
                base = this.get('base');
                if(_.isString(base) && base.indexOf('-') !== -1) {
                    return false;
                }
                return true;
            }
        },

        checkFractionToDecimalCase: function checkFractionToDecimalCase() {
            var base = this.get('base');
            if (base === 't') {
                return true;
            }
            return false;
        },


        checkIfVariablePresent: function checkIfVariablePresent () {
            if(_.isString(this.get('base'))) {
                return true;
            }
            return false;
        }

    }, {

    });

})(window.MathInteractives);
