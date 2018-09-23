(function (MathUtilities) {
    'use strict';

    /**
     * A customized Backbone.Views that represents 'Step by Step' section in Cas Tool.
     * @class StepByStep
     * @constructor
     * @namespace Tools.CasTool.CasToolHolder.Views
     * @module CasTool
     * @submodule CasToolHolder
     * @extends Backbone.View
     */
    MathUtilities.Tools.CasTool.CasToolHolder.Views.StepByStep = Backbone.View.extend({
        initialize: function initialize() {



            this.render();
        },
        render: function render() {
            return this;
        }
    });
}(window.MathUtilities));