(function () {
    'use strict';
    /**
    * A customized Backbone.Model that represents a calculator key.
    * @module Calculator
    * @class Key
    * @constructor
    * @extends Backbone.Model
    * @namespace Tools.Calculator.Models
    */
    MathUtilities.Tools.Calculator.Models.Key = Backbone.Model.extend({
        /**
        * Specifies the default values of model properties.
        * @property defaults
        * @type Object
        */
        defaults:
        {
            /**
            * Stores json data required for Calculator key.
            * @property jsonData
            * @type Object
            * @default null
            */
            jsonData: null,

            /**
            * Identifies the current state index. This index is used to identify the json data that calculator key is using currently.
            * @property currentState
            * @type Number
            * @default null
            */
            currentState: null
        },

        /**
        * Finds the next state of the key model and then sets it as the current state. State of a key
        * identifies the json data associated with the key model.
        * @method changeState
        * @return
        */
        changeState: function () {
            var currentState, newState, allStateCount;

            currentState = this.get('currentState');
            allStateCount = this.get('jsonData').length;

            newState = ((currentState + 1) >= allStateCount) ? 0 : (currentState + 1);

            if (newState !== currentState) {
                this.set('currentState', newState);
            }

            return;
        }
    });
})();