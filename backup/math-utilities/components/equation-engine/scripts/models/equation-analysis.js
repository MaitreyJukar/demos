/* globals window */

(function(MathUtilities) {
    'use strict';

    /**
        Class to create analysis object for analysis done during parsing of equation

        @class MathUtilities.Components.EquationAnalysis
    **/
    MathUtilities.Components.EquationEngine.Models.EquationAnalysis = Backbone.Model.extend({

        "defaults": function() {
            return {
                /**
                    The equation is solved using the form ax^2+bx+c. This is the 'a' part of the solving.

                    @property A
                    @type {Object}
                    @public
                **/
                "_A": null,

                /**
                    The equation is solved using the form ax^2+bx+c. This is the 'b' part of the solving.

                    @property B
                    @type {Object}
                    @public
                **/
                "_B": null,

                /**
                    The equation is solved using the form ax^2+bx+c. This is the 'c' part of the solving.

                    @property C
                    @type {Object}
                    @public
                **/
                "_C": null,

                /**
                    This is a boolean whether the given equation can be solved or not.

                    @property canBeSolved
                    @type {Boolean}
                    @public
                **/
                "_canBeSolved": true,

                /**
                    The possible variables for the equations along with their power in the equation.

                    @property freeVars
                    @type {Object}
                    @public
                **/
                "_freeVars": null,

                /**
                    The function variable of the equation for which the solution has to be calculated

                    @property functionVariable
                    @type {String}
                    @public
                **/
                "_functionVariable": null,

                /**
                    The param variable of the equation which is substituted to get the solution for the function variable of the equation

                    @property paramVariable
                    @type {String}
                    @public
                **/
                "_paramVariable": null,

                "_equationParameters": null,

                "_pivot": null,

                "_accText": null,

                "_rhsAuto": null,

                "_order": null,

                "_FDFlag": null,

                "_functionCode": null,
                "_transposeFunctionCode": null,

                "_functionCodeA": null,

                "_functionCodeB": null,

                "_functionCodeC": null,

                "_paramVariableOrder": null,

                "_inEquatlityType": null,

                "_possibleFunctionVariables": null,

                "_possibleFunctionVariablesPreference": null,

                "_interceptPoints": null,

                "_coefficients": null,

                "_constantTerm": null,

                "_simplifiedFractionLatex": null
            };
        },

        "initialize": function() {
            this.set({
                "_A": {},
                "_B": {},
                "_C": {},
                "_coefficients": {},
                "_freeVars": {},
                "_inEquatlityType": "equal",
                "_possibleFunctionVariablesPreference": {
                    "x": 0,
                    "y": 0
                }
            });
        },
        "addToAccText": function(accText) {
            this.set('_accText', this.get('_accText') + accText);
        },

        "setInEqualityType": function(inEqualityType) {
            switch (inEqualityType) {
                case '\\le':
                    this.set('_inEquatlityType', 'ltequal');
                    break;
                case '\\ge':
                    this.set('_inEquatlityType', 'gtequal');
                    break;
                case '>':
                    this.set('_inEquatlityType', 'greater');
                    break;
                case '<':
                    this.set('_inEquatlityType', 'lesser');
                    break;
                case '=':
                    this.set('_inEquatlityType', 'equal');
                    break;
                default:
                    this.set('_inEquatlityType', inEqualityType);
            }
        },

        /**
            Flushes all properties of the object and set them to their default values.

            @public
            @method flush
        **/
        "flush": function() {
            this.set({
                "_A": {},
                "_B": {},
                "_C": {},
                "_freeVars": {},
                "_inEquatlityType": "equal",
                "_possibleFunctionVariablesPreference": {
                    "x": 0,
                    "y": 0
                },
                "_canBeSolved": true,
                "_functionVariabl": null,
                "_paramVariable": null,
                "_accText": null,
                "_rhsAuto": null,
                "_order": null,
                "_FDFlag": null,
                "_functionCode": null,
                "_functionCodeA": null,
                "_functionCodeB": null,
                "_functionCodeC": null,
                "_possibleFunctionVariable": null

            });
        }

    }, {});
}(window.MathUtilities));
