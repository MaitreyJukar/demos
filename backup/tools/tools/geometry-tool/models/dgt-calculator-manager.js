/* globals $, window */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Dgt.Models.DgtCalculatorManager = Backbone.Model.extend({

        "inputReference": null,
        "engine": null,
        "$mathInputField": null,
        "$outputLHS": null,
        "$outputRHS": null,
        "mathInput": null,
        "mathInputView": null,
        "dgtCalculatorView": null,


        "initialize": function(options) {
            this.setEngine(options.engine);
            this.dgtCalculatorView = new MathUtilities.Tools.Dgt.Views.DgtCalculator({
                "el": this.engine.dgtUI.model.dgtPopUpView.model.$calculatorPopup,
                "model": this
            });
            this.mathInput = new MathUtilities.Tools.Dgt.Models.MathInput();
            this.mathInputView = new MathUtilities.Tools.Dgt.Views.MathInputView({
                "el": this.$mathInputField,
                "model": this.mathInput,
                "engine": this.engine,
                "$mathjaxDisplayArea": this.$outputLHS
            });
            this.mathInput.on('math-input-answer-changed', this.dgtCalculatorView.setAnswerInRHSRef);
            return this;
        },

        "setEngine": function(engine) {
            this.engine = engine;
        },

        "onCalculationComplete": function() {
            var calculationData, loopVar, sources, uniqueSources = [],
                mathInputModel = this.mathInputView.model,
                curReference;
            sources = mathInputModel.getSources().slice();

            for (loopVar in sources) {
                if (uniqueSources.indexOf(sources[loopVar]) === -1) {
                    uniqueSources.push(sources[loopVar]);
                }
            }
            calculationData = {
                "latex": mathInputModel.latex,
                "inputReference": mathInputModel.inputReference.slice(),
                "answer": mathInputModel.answer,
                "sources": mathInputModel.getSources().slice(),
                "objectIndexInInputReference": [],
                "noOfSources": uniqueSources.length
            };



            for (loopVar in calculationData.inputReference) {
                curReference = calculationData.inputReference[loopVar];
                if (curReference !== null && typeof curReference === 'object') {
                    calculationData.inputReference[loopVar] = calculationData.inputReference[loopVar].id;
                    calculationData.objectIndexInInputReference.push(loopVar);
                }
            }
            for (loopVar in calculationData.sources) {
                curReference = calculationData.sources[loopVar];
                if (curReference !== null && typeof curReference === 'object') {
                    calculationData.sources[loopVar] = calculationData.sources[loopVar].id;
                }
            }
            if (calculationData && calculationData.answer !== '' && calculationData.answer !== null && typeof calculationData.answer === 'number' || typeof calculationData.answer === 'string' && calculationData.answer === 'undefined') {
                this.isReopenedCalculation = false;
                return calculationData;
            }
            return false;
        },

        "clearCalculatorInputOutputData": function() {
            var mathInput = this.mathInput;
            mathInput.inputReference = [];
            mathInput.answer = null;
            this.$mathInputField.val('');
            this.$outputLHS.html('');
            this.$outputRHS.html('');
            this.isReopenedCalculation = false;
        },

        "addMeasurementToCalculator": function(measurement, event) {
            this.mathInputView.addMeasurementToInput(measurement, event);
        },


        "editCalculation": function(calculationDetails) {
            var DgtUiModel = MathUtilities.Tools.Dgt.Models.DgtUiModel,
                curIndex,
                loopVar;
            for (loopVar in calculationDetails.objectIndex) {
                curIndex = calculationDetails.objectIndex[loopVar];
                calculationDetails.inputReference[curIndex] =
                    this.engine.getEntityFromId(calculationDetails.inputReference[curIndex]);
            }
            this.engine.dgtUI.setTitleAndopenPopup(DgtUiModel.popupTitleMapping.editCalculation, null, 'calculator');
            this.mathInputView.model.resetMathInputDetails(calculationDetails);
            this.mathInputView.reloadInputAndOutput();
            this.isReopenedCalculation = true;
        },

        "regenerateLatex": function(calculationDetails, entity) {
            var mathInputModel = this.mathInputView.model,
                objIndex,
                loopVar,
                engineRef = entity._universe || this.engine;

            for (loopVar in calculationDetails.objectIndexInInputReference) {
                objIndex = calculationDetails.objectIndexInInputReference[loopVar];
                calculationDetails.inputReference[objIndex] = engineRef.getEntityFromId(calculationDetails.inputReference[objIndex]);
            }
            mathInputModel.resetMathInputDetails(calculationDetails);
            mathInputModel.setLatexForCalculationLabel();
            this.clearCalculatorInputOutputData();
            return mathInputModel.latex;
        },

        "recalculateAnswer": function(calculationDetails) {
            var mathInputModel = this.mathInput,
                answer;

            mathInputModel.resetMathInputDetails(calculationDetails);
            answer = mathInputModel.getAnswerFromParser();
            this.clearCalculatorInputOutputData();
            return answer;
        }
    });
})(window.MathUtilities);
