(function () {
    'use strict';
    /**
    * A customized Backbone.Model that represents switch-mode button
    * @module Calculator
    * @class ModeSwitchButtons
    * @constructor
    * @extends Backbone.Model
    * @namespace Tools.Calculator.Models
    */
    MathUtilities.Tools.Calculator.Models.ModeSwitchButtons = Backbone.Model.extend({
        /**
        * @property defaults
        * @type Object
        */
        defaults: {
            /**
            * @property jsonData
            * @type Object
            * @default null
            */
            jsonData: null
        },

        /**
        * Sets jsonData property
        * @method parseData
        * @param {Object} jsonData. Its JSON data for switch-mode buttons.
        * @return
        */
        parseData: function parseData(jsonData) {
            this.set('jsonData', jsonData);
            return;
        }
    });
})();