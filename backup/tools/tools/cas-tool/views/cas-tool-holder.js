(function (MathUtilities) {
    'use strict';

    /**
    * A customized Backbone.View that represents Cas Tool.
    * @class CasTool
    * @constructor
    * @namespace Tools.CasTool.Views
    * @module CasTool
    * @extends Backbone.View
    */
    MathUtilities.Tools.CasTool.CasToolHolder.Views.CasToolHolder = Backbone.View.extend({
        initialize: function initialize() {
            var $el = this.$el,
                enterEquationModel = null,
                enterEquationView = null,
                chooseEquationModel = null,
                chooseEquationView = null,
                stepByStepModel = null,
                stepByStepView = null;

            $el.html(MathUtilities.Tools.CasTool.templates.casToolContentHolder().trim());

            chooseEquationModel = new MathUtilities.Tools.CasTool.CasToolHolder.Models.ChooseEquation();
            chooseEquationView = new MathUtilities.Tools.CasTool.CasToolHolder.Views.ChooseEquation({
                model: chooseEquationModel,
                el: ('.choose-equation-holder')
            });

            enterEquationModel = new MathUtilities.Tools.CasTool.CasToolHolder.Models.EnterEquation();
            enterEquationView = new MathUtilities.Tools.CasTool.CasToolHolder.Views.EnterEquation({
                model: enterEquationModel,
                el: ('.enter-equation-holder')
            });

            stepByStepModel = new MathUtilities.Tools.CasTool.CasToolHolder.Models.StepByStep();
            stepByStepView = new MathUtilities.Tools.CasTool.CasToolHolder.Views.StepByStep({
                model: stepByStepModel,
                el: ('.step-by-step-holder')
            });

            this.render();
        },
        render: function render() {
            return this;
        }
    });
}(window.MathUtilities));