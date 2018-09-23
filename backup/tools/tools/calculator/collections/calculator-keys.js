(function () {
    'use strict';
    /**
    * A customized Backbone.Collection that represents collection of calculator keys
    * @module Calculator
    * @class CalculatorKey
    * @constructor
    * @extends Backbone.Collection
    * @namespace Tools.Calculator.Collections
    */
    MathUtilities.Tools.Calculator.Collections.CalculatorKey = Backbone.Collection.extend({
        /**
        * Identifies model type of model that collection will contain.
        * @property model
        * @type Object
        */
        model: MathUtilities.Tools.Calculator.Models.Key
    })
})();