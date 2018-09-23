(function (MathUtilities) {
    'use strict';

    /**
    * A customized Backbone.Views that represents 'Step by Step' section in Matrix Tool.
    * @class StepByStep
    * @constructor
    * @namespace Tools.MatrixTool.MatrixToolHolder.Views
    * @module MatrixTool
    * @submodule MatrixToolHolder
    * @extends Backbone.View
    */
    MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.StepByStep = Backbone.View.extend({

        /**
        * Instantiates all the data required for rendering Result section.
        * @method initialize
        */
        initialize: function initialize() {

            var $el = this.$el,
                hideStepsView = null;

            $el.html(MathUtilities.Tools.MatrixTool.templates.stepByStepContent().trim());


            hideStepsView = MathUtilities.Components.Button.generateButton({
                'id': 'hide-steps',
                'text': 'Hide Steps',
                'height': 40,
                'width': 135,
                'baseClass': 'show-hide-toggle-step'
            });

            $('#hide-steps').html(MathUtilities.Tools.MatrixTool.templates['hide-steps-data']().trim()).on('click', $.proxy(this.onHideStepsClick, this));

            this.render();
        },

        /**
        * Chainable function.
        * @method render
        * @chainable
        * @return {Object}
        */
        render: function render() {
            return this;
        },

        /**
        * Action to be performed on 'Hide Steps' button click.
        * @method onHideStepsClick
        * @private
        */
        onHideStepsClick: function (skipUndoRedoRegistration) {
            $('.result-holder').show();
            $('.step-by-step-holder').hide();
            $('#show-steps').show();
            $('#hide-steps').hide();

            if (skipUndoRedoRegistration !== true) {
                this.trigger('undoRedoRegister', { actionName: 'showHideStep', undoRedoData: { undo: { actionType: 'showStep' }, redo: { actionType: 'hideStep' } } });
            }
        }
    });
} (window.MathUtilities));