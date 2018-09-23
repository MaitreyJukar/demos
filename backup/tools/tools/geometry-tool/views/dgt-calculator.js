/* globals geomFunctions */
(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Dgt.Views.DgtCalculator = Backbone.View.extend({

        "initialize": function(options) {
            this.model = options.model;
            this.setAnswerInRHSRef = _.bind(this.setAnswerInRHS, this);
            this.handleCalculatorInputRef = _.bind(this.handleCalculatorInput, this);
            this.mouseHoverOnkeysRef = _.bind(this.mouseHoverOnkeys, this);
            this.render();
            return this;
        },

        "render": function() {
            var $calculatorArea = this.$('.modal-body'),
                model = this.model,
                calculatorStructure = MathUtilities.Tools.Dgt.templates.CalculatorStructure({
                    "numberKeypad": {
                        "row1": [{
                            "id": 'number-key-seven',
                            "class": 'number-key-7',
                            "key": '7',
                            "charCode": '55'
                        }, {
                            "id": 'number-key-eight',
                            "class": 'number-key-8',
                            "key": '8',
                            "charCode": '56'
                        }, {
                            "id": 'number-key-nine',
                            "class": 'number-key-9',
                            "key": '9',
                            "charCode": '57'
                        }, {
                            "class": 'plus-operator',
                            "id": 'operator-key-plus',
                            "key": '+',
                            "charCode": '43'
                        }, {
                            "id": 'operator-key-caret',
                            "class": 'caret-operator',
                            "key": '^',
                            "charCode": '94'
                        }],

                        "row2": [{
                            "id": 'number-key-four',
                            "class": 'number-key-4',
                            "key": '4',
                            "charCode": '52'
                        }, {
                            "id": 'number-key-five',
                            "class": 'number-key-5',
                            "key": '5',
                            "charCode": '53'
                        }, {
                            "id": 'number-key-six',
                            "class": 'number-key-6',
                            "key": '6',
                            "charCode": '54'
                        }, {
                            "id": 'operator-key-minus',
                            "class": 'minus-operator',
                            "key": '-',
                            "charCode": '45'
                        }, {
                            "id": 'opening-round-bracket-key',
                            "class": 'opening-round-bracket',
                            "key": '(',
                            "charCode": '40'
                        }],

                        "row3": [{
                            "id": 'number-key-one',
                            "class": 'number-key-1',
                            "key": '1',
                            "charCode": '49'
                        }, {
                            "id": 'number-key-two',
                            "class": 'number-key-2',
                            "key": '2',
                            "charCode": '50'
                        }, {
                            "id": 'number-key-three',
                            "class": 'number-key-3',
                            "key": '3',
                            "charCode": '51'
                        }, {
                            "id": 'operator-key-multiplication',
                            "class": 'multiplication-operator',
                            "key": '*',
                            "charCode": '42'
                        }, {
                            "id": 'closing-round-bracket-key',
                            "class": 'closing-round-bracket',
                            "key": ')',
                            "charCode": '41'
                        }],

                        "row4": [{
                            "id": 'number-key-zero',
                            "class": 'number-key-0',
                            "key": '0',
                            "charCode": '48'
                        }, {
                            "id": 'operator-key-dot',
                            "class": 'dot-operator',
                            "key": '.',
                            "charCode": '190'
                        }, {
                            "id": 'operator-key-division',
                            "class": 'division-operator',
                            "key": '÷',
                            "charCode": '47'
                        }, {
                            "id": 'operator-backspace-key',
                            "class": 'backspace-key',
                            "key": '←',
                            "charCode": '8'
                        }]
                    }
                });

            $calculatorArea.append(calculatorStructure);
            $calculatorArea.find('.keys').on('click', this.handleCalculatorInputRef)
                .on('mouseover mouseleave', this.mouseHoverOnkeysRef);
            $calculatorArea.find('.function, .constant').on('click', this.handleCalculatorInputRef);
            model.$mathInputField = $calculatorArea.find('#calculator-input');
            model.$outputLHS = $calculatorArea.find('#output-lhs');
            model.$outputRHS = $calculatorArea.find('#output-rhs');
            return this;
        },

        "handleCalculatorInput": function(event) {

            var loopCtr,
                keyDownEvent = $.Event('keydown'),
                keyPressEvent = $.Event('keypress'),
                curInputCharacterCharCodes,
                model = this.model,
                accManager = model.engine.accManager,
                charCode = accManager ? event.currentTarget.getAttribute('data-charcode') : event.target.getAttribute('data-charcode'),
                inputCharacterCharCodes = charCode.split('-'),
                inputCharacterCharCodesLength = inputCharacterCharCodes.length,
                $mathInputField = model.$mathInputField;

            for (loopCtr = 0; loopCtr < inputCharacterCharCodesLength; loopCtr++) {
                curInputCharacterCharCodes = parseInt(inputCharacterCharCodes[loopCtr], 10);
                keyDownEvent.charCode = curInputCharacterCharCodes;
                keyPressEvent.charCode = curInputCharacterCharCodes;
                $mathInputField.trigger(keyDownEvent);
                $mathInputField.trigger(keyPressEvent);
            }
            //after pressing any key in calculator focus should remain on the same button
            // or if it is dropdown then focus should go to its parent
            if (accManager) {
                $(event.target).closest('.parent-container').removeClass('open');
                if ($(event.target).hasClass('keys')) {
                    accManager.setFocus($(event.target).prop('id'));
                } else {
                    accManager.setFocus($(event.target).parents('.parent-container:first').prop('id'));
                }
                event.preventDefault();

            }
        },
        "mouseHoverOnkeys": function(event) {
            $(event.currentTarget).toggleClass('hover');
        },

        "setAnswerInRHS": function(answer) {
            if (answer === null) {
                this.model.$outputRHS.html('?');
            } else {
                this.model.$outputRHS.html(answer);
            }
        }

    }, {

    });
})(window.MathUtilities);
