(function () {
    'use strict';

    MathUtilities.Tools.Calculator = {};
    MathUtilities.Tools.Calculator.Models = {};
    MathUtilities.Tools.Calculator.Views = {};
    MathUtilities.Tools.Calculator.Collections = {};

    /**
    * A customized Backbone.Model that triggers calculator creation.
    * @module Calculator
    * @class Init
    * @static
    * @extends Backbone.Model
    * @namespace Tools.Calculator.Models
    */

    MathUtilities.Tools.Calculator.Models.Init = Backbone.Model.extend(null, {
        /**
        * Loads templates.htm and keys.json
        * Creates Calculator model instance and passed it as a parameter while creating calculatorView instance.
        * @method init
        * @static
        * @chainable
        */
        init: function init(jsonPath) {
            $.getJSON(jsonPath, function (json) {
                var calculatorModel, calculatorView, initialState;
                initialState = {};
                initialState.initialState = 1;
                calculatorModel = new MathUtilities.Tools.Calculator.Models.Calculator();
                calculatorModel.parseData(json);
                calculatorView = new MathUtilities.Tools.Calculator.Views.Calculator({
                    model: calculatorModel,
                    el: '#calculator'
                });
                
                calculatorView.setOptions(initialState);
                calculatorView.$el.removeClass('hide-calculator');
            });
            
            return this;
        }

    });
})();
