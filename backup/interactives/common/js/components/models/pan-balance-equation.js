(function () {
    'use strict';

    /**
    * Conatins pan balance equation data
    * @class PanBalanceEquation
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.PanBalanceEquation = Backbone.Model.extend({

        defaults: function () {
            return {
                /**
                * Coefficient of variable
                * @property coefficient
                * @type Number
                * @defaults null
                */
                coefficient: null,

                /**
                * Variable to be calculate in equation
                * @property variable
                * @type String
                * @defaults x
                */
                variable: 'x',

                /**
                * Constant at LHS of equation
                * @property constantA
                * @type Number
                * @defaults null
                */
                constantA: null,

                /**
                * Constant at RHS of equation
                * @property constantB
                * @type Number
                * @defaults null
                */
                constantB: null
            }
        },

        /**
        * Returns a equation in string form
        * @method getEquationString
        * return {String} Equation in string
        */
        getEquationString: function getEquation() {
            var equationStr = '';
            var coefficient = this.get('coefficient');
            var variable = this.get('variable');
            var constantA = this.get('constantA');
            var constantB = this.get('constantB');

            if (coefficient === 0) {
                return null;
            }

            /*Add variable part*/
            if (coefficient === 1) {
                equationStr += variable;
            }
            else {
                equationStr += (coefficient + variable);
            }

            /*Add LHS constant i.e. constant A*/
            if (constantA !== 0) {
                if (constantA < 0) {
                    equationStr += ' - ' + constantA;
                }
                else {
                    equationStr += ' + ' + constantA;
                }
            }

            /*Add RHS constant i.e. constant B*/
            equationStr += ' = ' + constantB;

            return equationStr;
        },

        /**
        * Returns a value of variable in equation after solving it
        * @method getVariableValue
        * return {Number} Value of variable
        */
        getVariableValue: function getVariableValue() {
            var result = (this.get('constantB') - this.get('constantA')) / this.get('coefficient');
            return result;
        }
    });
})();