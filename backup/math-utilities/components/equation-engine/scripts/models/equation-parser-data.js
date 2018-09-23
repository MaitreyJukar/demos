/* globals window */

(function(MathUtilities) {
    'use strict';

    /**
        Class to create equationData object to be used for plotting and parsing

        @class MathUtilities.Components.EquationEngine
    **/
    MathUtilities.Components.EquationEngine.Models.ParserData = Backbone.Model.extend({

        "defaults": function() {
            return {
                /**
                    Constants that are used to for parsing of equation with their values specified

                    @property _constants
                    @type {Object}
                    @public
                **/
                "_constants": null,

                /**
                    This the object that contains data related to left expression of the equation.
                    Properties :
                        expression: The latex left expression
                        tokens: The left hand tokens
                        constants: The constants existing in the left hand expression
                        freevars: The variables existing in the left hand expression

                    @property _leftExpression
                    @type {Object}
                    @public
                **/
                "_leftExpression": null,

                /**
                    It contains the left tree of the equation

                    @property _leftRoot
                    @type {Object}
                    @public
                **/
                "_leftRoot": null,

                /**
                    This the object that contains data related to right expression of the equation.
                    Properties :
                        expression: The latex right expression
                        tokens: The right hand tokens
                        constants: The constants existing in the right hand expression
                        freevars: The variables existing in the right hand expression

                    @property _rightExpression
                    @type {Object}
                    @public
                **/
                "_rightExpression": null,

                "definitionFor": null,

                /**
                    It contains the right tree of the equation

                    @property _rightRoot
                    @type {Object}
                    @public
                **/
                "_rightRoot": null,

                "_leftInequalityRoot": null,

                "_rightInequalityRoot": null
            };
        },

        "initialize": function() {
            this._setInitialStates();
        },

        "_setInitialStates": function() {
            this.set({
                "_leftExpression": {
                    "constants": {},
                    "freevars": {},
                    "expression": null,
                    "equationParameters": {

                        "operatorsList": [],

                        "variablesList": [],

                        "digitsList": [],

                        "constantsList": [],

                        "functionsList": []
                    }
                },
                "_rightExpression": {
                    "constants": {},
                    "freevars": {},
                    "expression": null,
                    "equationParameters": {

                        "operatorsList": [],

                        "variablesList": [],

                        "digitsList": [],

                        "constantsList": [],

                        "functionsList": []
                    }
                }
            });
        },

        /**
            Flushes all properties of the object and set them to their default values.

            @public
            @method flush
        **/
        "flush": function() {
            this.set({
                "_constants": null,
                "_leftRoot": null,
                "_rightRoot": null
            });
            this._setInitialStates();
        }

    }, {});
}(window.MathUtilities));
