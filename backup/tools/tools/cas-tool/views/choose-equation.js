(function (MathUtilities) {
    'use strict';

    /**
     * A customized Backbone.Views that represents 'Choose Equation' section in Cas Tool.
     * @class ChooseEquation
     * @constructor
     * @namespace Tools.CasTool.CasToolHolder.Views
     * @module CasTool
     * @submodule CasToolHolder
     * @extends Backbone.View
     */
    MathUtilities.Tools.CasTool.CasToolHolder.Views.ChooseEquation = Backbone.View.extend({
        initialize: function initialize() {

            var $el = this.$el,
                optionData = null;

            optionData = {
                optionsGeneral: [{
                    optionID: 'evaluate',
                    optionValue: '0',
                    optionText: 'Evaluate an expression'
                },
                {
                    optionID: 'factorize',
                    optionValue: '1',
                    optionText: 'Factorize an expression'
                },
                {
                    optionID: 'equation',
                    optionValue: '2',
                    optionText: 'Solve - equation'
                },
                {
                    optionID: 'systemEquation',
                    optionValue: '3',
                    optionText: 'Solve - system of equations'
                },
                {
                    optionID: 'domain',
                    optionValue: '4',
                    optionText: 'Find domain and range'
                },
                {
                    optionID: 'inverse',
                    optionValue: '5',
                    optionText: 'Find inverse'
                }],
                optionsSequence: [{
                    optionID: 'ap',
                    optionValue: '6',
                    optionText: 'Compute arithmetic progression'
                },
                {
                    optionID: 'gp',
                    optionValue: '7',
                    optionText: 'Compute geometric progression'
                }]
            };

            $el.html(MathUtilities.Tools.CasTool.templates.chooseEquationContent(optionData).trim());
            $('.choose-editor-holder').hide();
            $('.onlyEquation').show();

            var inputParams = {
                'holderDiv': $('#only-equation'),
                'editorCall': true,
            }
            MathUtilities.Components.MathEditor.Models.Application.init(inputParams);

            $('#choose-go').on('click', $.proxy(this.onChooseGoClick, this));
            $('.textbox').on('keypress', $.proxy(this.onKeyPress, this))
            this.render();
        },
        render: function render() {
            $('#equation-dropdown').on('change', $.proxy(this.onDropdownChange, this));
            return this;
        },
        onDropdownChange: function onDropdownChange() {
            var dropdownValue = $('#equation-dropdown').val();
            this.model.set('dropdownValue', dropdownValue);

            switch (dropdownValue) {
                case '6':
                    {
                        $('.choose-editor-holder').hide();
                        $('.arithmetic').show();
                        break;
                    }
                case '7':
                    {
                        $('.choose-editor-holder').hide();
                        $('.geometric').show();
                        break;
                    }
                default:
                    {
                        $('.choose-editor-holder').hide();
                        $('.onlyEquation').show();
                        break;
                    }
            }
        },
        onChooseGoClick: function () {
            alert('Mathematica Call');
        },
        onKeyPress: function (event) {
            var regex=/^\d$/;
            if (regex.test(String.fromCharCode(event.keyCode))) {
                return true;
            }
            else {
                return false;
            }
        }
    });
}(window.MathUtilities));