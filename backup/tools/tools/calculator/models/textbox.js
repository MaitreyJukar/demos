(function () {
    'use strict';
    /**
    * A customized Backbone.Model that stores calculation related data.
    * @module Calculator
    * @class Textbox
    * @constructor
    * @extends Backbone.Model
    * @namespace Tools.Calculator.Models
    */
    MathUtilities.Tools.Calculator.Models.Textbox = Backbone.Model.extend({
        /**
        * Specifies the default values of model properties.
        * @property defaults
        * @type Object
        */
        defaults: {
            /**
            * Stores engineering notation for the last calculation result.
            * @property scientificNotationLatex
            * @type String
            * @default ''
            */
            scientificNotationLatex: '',

            /**
            * Stores engineering notation for the last calculation result.
            * @property scientificNotationLatex
            * @type String
            * @default ''
            */
            standardNotationLatex: ''

        }


    },
    {
        /**
        * Stores calculation history.
        * @property history
        * @static
        * @type Object
        */
        history: []
    });
})();