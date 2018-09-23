(function (MathUtilities) {
    'use strict';

    /**
    * A customized Backbone.Views that represents 'Result' section in Matrix Tool.
    * @class Result
    * @constructor
    * @namespace Tools.MatrixTool.MatrixToolHolder.Views
    * @module MatrixTool
    * @submodule MatrixToolHolder
    * @extends Backbone.View
    */
    MathUtilities.Tools.MatrixTool.MatrixToolHolder.Views.Result = Backbone.View.extend({

        /**
        * Instantiates all the data required for rendering Result section.
        * @method initialize
        */
        initialize: function initialize() {

            var $el = this.$el,
                showStepsView = null;

            $el.html(MathUtilities.Tools.MatrixTool.templates.resultContent().trim());

            //showStepsView = MathUtilities.Components.Button.generateButton({
            //    'id': 'show-steps',
            //    'text': 'Show Steps',
            //    'height': 40,
            //    'width': 135,
            //    'baseClass': 'show-hide-toggle-result'
            //});

            /*commented for alpha*/
            //$('#show-steps').html(MathUtilities.Tools.MatrixTool.templates['show-steps-data']().trim()).on('click', $.proxy(this.onShowStepsClick, this));
            //$('#show-steps').html(MathUtilities.Tools.MatrixTool.templates['show-steps-data']().trim());

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
        * Displays result.
        * @method renderResult
        * @returns {Array}
        * @private
        */
        renderResult: function (matrixData, answer) {
            if (matrixData !== '') {

                var resultMatrixData = {
                    tr: []
                },
                    rowData = matrixData.split('$'),
                    rowDataLen = rowData.length,
                    rowObject = {},
                    colData = [],
                    colDataLen = 0,
                    colnObject = {},
                    column = [],
                //                    row = [],
                    i = 0,
                    j = 0;

                this.model.set('resultValue', matrixData);
                this.model.set('isArray', true);

                for (; i < rowDataLen; i++) {
                    rowObject = {};
                    column = [];
                    colData = rowData[i].split('@');
                    colDataLen = colData.length;
                    for (j = 0; j < colDataLen; j++) {
                        colnObject = {};
                        if (colData[j].indexOf('.') === -1) {
                            colnObject.text = colData[j];
                        }
                        else {
                            colnObject.text = Number(Number(colData[j]).toFixed(2)).toString();
                        }
                        column.push(colnObject);
                    }
                    rowObject.td = column;
                    resultMatrixData.tr.push(rowObject);
                }

                $('.result-matrix-holder').html('').append(MathUtilities.Tools.MatrixTool.templates.resultTable({ trData: resultMatrixData.tr }).trim());

                return resultMatrixData.tr;
            }
            else {
                this.model.set('resultValue', answer);
                this.model.set('isArray', false);
                //$('.result-matrix-holder').html('').html(answer);
                if (answer !== null && answer !== '') {
                    $('.result-matrix-holder').html('').append(MathUtilities.Tools.MatrixTool.templates.determinantUi({ answer: answer }).trim());
                }
                else {
                    $('.result-matrix-holder').html('');
                }

                return null;
            }
        },

        /**
        * Action to be performed on 'Show Steps' button click.
        * @method onShowStepsClick
        * @private
        */
        onShowStepsClick: function (skipUndoRedoRegistration) {
            alert('This feature will be available in the future version of this tool.');

            //$('.result-holder').hide();
            //$('.step-by-step-holder').show();
            //$('#hide-steps').show();
            //$('#show-steps').hide();

            //if (skipUndoRedoRegistration !== true) {
            //    this.trigger('undoRedoRegister', { actionName: 'showHideStep', undoRedoData: { undo: { actionType: 'hideStep' }, redo: { actionType: 'showStep' } } });
            //}
        }
    });
}(window.MathUtilities));