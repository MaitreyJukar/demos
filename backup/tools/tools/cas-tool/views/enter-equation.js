(function (MathUtilities) {
    'use strict';

    /**
     * A customized Backbone.Views that represents 'Enter Equation' section in Cas Tool.
     * @class EnterEquation
     * @constructor
     * @namespace Tools.CasTool.CasToolHolder.Views
     * @module CasTool
     * @submodule CasToolHolder
     * @extends Backbone.View
     */
    MathUtilities.Tools.CasTool.CasToolHolder.Views.EnterEquation = Backbone.View.extend({
        initialize: function initialize() {
            var $el = this.$el;
            $el.html(MathUtilities.Tools.CasTool.templates.enterEquationContent().trim());

            $('#enter-go').on('click', $.proxy(this.onEnterGoClick, this));

            this.render();
        },
        render: function render() {
            var inputParams = {
                'holderDiv': $('#editor-holder'),
                'editorCall': true,
            }
            MathUtilities.Components.MathEditor.Models.Application.init(inputParams);
            return this;
        },
        onEnterGoClick: function () {
            alert('Mathematica Call');
        }
    });
}(window.MathUtilities));