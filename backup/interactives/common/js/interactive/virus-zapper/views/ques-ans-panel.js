(function () {
    'use strict';

    var quesAnsClass = null;
    /**
    * Class for question-answer panel ,  contains properties and methods of question-answer panel
    * @class QuesAnsPanel
    * @module VirusZapper
    * @namespace MathInteractives.Interactivities.VirusZapper.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Common.Interactivities.VirusZapper.Views.QuesAnsPanel = MathInteractives.Common.Player.Views.Base.extend({



        /**
        * stores already generated question value.
        * 
        * @property alreadyGeneratedQuesValues 
        * @type object
        * @default null
        **/
        alreadyGeneratedQuesValues: [],

        /**
        * stores answer value.
        * 
        * @property answerValue 
        * @type number
        * @default null
        **/
        answerValue: null,

        /**
        * Contains virus zapper class events.
        * 
        * @property virusZapperEvents 
        * @type object
        * @default null
        **/
        virusZapperEvents: null,

        /**
        * stores interactivityType value.
        * 
        * @property interactivityType 
        * @type number
        * @default null
        **/
        interactivityType: null,

        /**
        * stores blank/number value.
        * 
        * @property digitRevealed 
        * @type number
        * @default null
        **/
        digitRevealed: 0,

        /**
        * Initializes question answer panel
        *
        * @method initialize
        * @public 
        **/
        initialize: function () {
            this.initializeDefaultProperties();
            this.interactivityType = this.model.get('interactivityType');

            this.render();
            this.loadScreen('question-answer-panel');
            this._changeQuePanelAcc();

        },

        /**
        * Changes panel's acc text
        *
        * @method _changeQuePanelAcc
        * @private 
        **/
        _changeQuePanelAcc: function _changeQuePanelAcc() {
            var $digits = this.$('.second-digit,.third-digit,.fourth-digit'),
                $firstDigit = this.$('.first-digit'),
                firstDigitText = parseInt($firstDigit.text()),
            digitText = parseInt($digits.text()), finalText = '';


            if (!isNaN(firstDigitText)) {
                finalText = firstDigitText.toString();
            }
            if (!isNaN(digitText)) {
                finalText += '.' + digitText.toString();
            }
            this.changeAccMessage('question-answer-panel', this.digitRevealed, [
                this.model.get('healthMeter'),
                this.model.get('root') === 2 ? this.getMessage('square-cube', 'square') : this.getMessage('square-cube', 'cube'),
                this.model.get('questionValue'),
                finalText
            ]);
        },

        /**
        * Renders the view.
        *
        * @method initialize
        * @public 
        **/
        render: function () {

            this.virusZapperEvents = MathInteractives.Common.Interactivities.VirusZapper.Views.VirusZapper.Events;

            var options = { idPrefix: this.idPrefix };
            this.$el.append(MathInteractives.Common.Interactivities.VirusZapper.templates.quesAnsPanel(options).trim());
            this.generateQuestion(this.interactivityType);
            this._renderElements();
            this._attachEvents();
            this.digitRevealed = 0;
        },
        /**
        * Binds events on elements
        *
        * @method _attachEvents
        * @private
        **/
        _attachEvents: function _attachEvents() {
            this.model.off(this.virusZapperEvents.DECREMENT_HEALTH_METER).on(this.virusZapperEvents.DECREMENT_HEALTH_METER, $.proxy(this.decrementLifeMeter, this));
            this.model.off(this.virusZapperEvents.INCREMENT_HEALTH_METER).on(this.virusZapperEvents.INCREMENT_HEALTH_METER, $.proxy(this.showAnsValueBeforeDecimalPoint, this));
        },

        /**
        * Renders all other elements of Ques-ans panel.
        * @method _renderElements
        * @private
        */
        _renderElements: function _renderElements() {
            var $queAnsPanel = this.$el;
            this.model.set('healthMeter', 5);
            this.model.set('initialHealthMeter', 5);
            //$queAnsPanel.find('.health-meter-title').text(this.getMessage('health-meter-title', 0));
            //$queAnsPanel.find('.answer-title').text(this.getMessage('answer-title', 0));
            //$queAnsPanel.find('.symbol-container').html();
            //            $queAnsPanel.find('.question-title-part1').text(this.getMessage('health-meter-title', 0));
            //            $queAnsPanel.find('.question-title-part2').text(this.getMessage('health-meter-title', 0));

            $queAnsPanel.find('.health-meter-bars > div').addClass('green');
            this._drawAnswerContainer();
        },

        /**
        * Renders answer container.
        * @method drawAnswerContainer
        * @private
        */
        _drawAnswerContainer: function () {
            var $queAnsPanel = this.$el;
            $queAnsPanel.find('.answer-value-container > div').html(quesAnsClass.DASH);
            $queAnsPanel.find('.symbol-dot').html(quesAnsClass.DOT);
        },

        /**
        * Generates question.
        * @method generateQuestion
        * @param interactivityType {number}
        * @public
        */
        generateQuestion: function generateQuestion(interactivityType, reShuffle) {
            this.digitRevealed = 0;
            var $quesContainer, randomValue, root;
            $quesContainer = this.$('.question-display-area');
            randomValue = this.model.generateQuestion(interactivityType, reShuffle);
            root = this.model.get('root');
            var templateData =
            {
                symbol: quesAnsClass.ROOT_SIGN,
                qsn: randomValue,
                sqrCubeClass: 'square-cube-type',
                symbolClass: 'base64-symbol-qsn-panel',
                qsn1Class: 'qsn1'
            };

            if (root === 2) {
                templateData['squareCubeType'] = '';

                $quesContainer.html(MathInteractives.Common.Interactivities.VirusZapper.templates.qsnDisplay(templateData).trim());
            }
            else {
                templateData['squareCubeType'] = '3';
                $quesContainer.html(MathInteractives.Common.Interactivities.VirusZapper.templates.qsnDisplay(templateData).trim());
            }
            this._drawAnswerContainer();
            if (reShuffle)
                this.resetLifeMeter();
            this._splitAnswerValueInDigits();
            this._changeQuePanelAcc();
        },


        /**
        * Increments health meter value.
        * @method incrementLifeMeter
        * @public
        */
        incrementLifeMeter: function () {
            var healthBars, $healthMeterBar;
            this.model.incrementHealthMeter();
            healthBars = this.model.get('healthMeter');
            $healthMeterBar = this.$('.health-meter-bar' + healthBars);
            $healthMeterBar.removeClass('white');
            $healthMeterBar.addClass('green');
            this._changeQuePanelAcc();
        },

        /**
        * decrements health meter value.
        * @method decrementLifeMeter
        * @public
        */
        decrementLifeMeter: function () {
            var healthBars, $healthMeterBar;
            healthBars = this.model.get('healthMeter');
            $healthMeterBar = this.$('.health-meter-bar' + healthBars);
            $healthMeterBar.removeClass('green');
            $healthMeterBar.addClass('white');
            this.model.decrementHealthMeter();
            this._changeQuePanelAcc();
        },

        /**
        * reset health meter to its original value.
        * @method resetLifeMeter
        * @public
        */
        resetLifeMeter: function () {
            var initialHealthMeterValue, $healthMeterBar;
            initialHealthMeterValue = this.model.get('initialHealthMeter');
            this.model.set('healthMeter', initialHealthMeterValue);
            for (var i = 1; i <= initialHealthMeterValue; i++) {
                $healthMeterBar = this.$('.health-meter-bar' + i);
                $healthMeterBar.removeClass('white');
                $healthMeterBar.addClass('green');
            }
            this._changeQuePanelAcc();
        },

        /**
        * reset health meter to its original value.
        * @method _splitAnswerValueInDigits
        * @return digitArray {object}
        * @private
        */
        _splitAnswerValueInDigits: function () {
            var answerValue = 0, digit1, digit, digit2, digit3, digit4, digitArray = [];
            answerValue = this.model.get('ansValue');
            answerValue = Math.abs(answerValue);
            //            answerValue = +(answerValue).toFixed(3);
            //            //answerValue = Math.floor(answerValue * 1000);
            //            answerValue = answerValue * 1000;
            answerValue = answerValue * 1000;
            answerValue = +(answerValue).toFixed(3);
            answerValue = Math.round(answerValue);

            for (var i = 0; i < 4; i++) {
                digit = answerValue % 10;
                answerValue = Math.floor(answerValue / 10);
                digitArray.push(digit);
            }
            this.model.set('digitArray', digitArray);
            return digitArray;
        },

        /**
        * Displays entire answer.
        * @method showEntireAnswer
        * @param isPositive {boolean}
        * @public
        */
        showEntireAnswer: function (isPositive) {
            var digitArray = this._splitAnswerValueInDigits();
            this.$('.first-digit').html(digitArray[3]);
            if (isPositive === false) {
                this.$('.first-digit').html(quesAnsClass.MINUS + digitArray[3]);
            }
            this.$('.second-digit').html(digitArray[2]);
            this.$('.third-digit').html(digitArray[1]);
            this.$('.fourth-digit').html(digitArray[0]);
            this.digitRevealed = 1;
        },

        /**
        * Displays 10th place value of answer after decimal point.
        * @method showTenthPlaceAnsValue
        * @public
        */
        showTenthPlaceAnsValue: function () {
            this.digitRevealed = 1;
            var digitArray = this._splitAnswerValueInDigits();
            this.$('.second-digit').html(digitArray[2]);
            this._changeQuePanelAcc();
        },

        /**
        * Displays 100th place value of answer after decimal point.
        * @method showHundredthPlaceAnsValue
        * @public
        */
        showHundredthPlaceAnsValue: function () {
            this.digitRevealed = 1;
            var digitArray = this._splitAnswerValueInDigits();
            this.$('.third-digit').html(digitArray[1]);
            this._changeQuePanelAcc();
        },

        /**
        * Displays 1000th place value of answer after decimal point.
        * @method showThousandthPlaceAnsValue
        * @public
        */
        showThousandthPlaceAnsValue: function () {
            this.digitRevealed = 1;
            var digitArray = this._splitAnswerValueInDigits();
            this.$('.fourth-digit').html(digitArray[0]);
            this._changeQuePanelAcc();
        },

        /**
        * Displays part of the answer before decimal point.
        * @method showEntireAnswer
        * @public
        */
        showAnsValueBeforeDecimalPoint: function (isPositive) {
            this.digitRevealed = 1;
            var digitArray = this._splitAnswerValueInDigits();
            this.$('.first-digit').html(digitArray[3]);
            if (isPositive === false) {
                this.$('.first-digit').html(quesAnsClass.MINUS + digitArray[3]);
            }
            this._changeQuePanelAcc();
        }


    },
    {
        TILD: '≈',
        ROOT_SIGN: '√',
        SIXTY_FOUR: 64,
        DOT: '.',
        DASH: '­­­­­­­­­­-',
        MINUS: '-',


        /**
        * Generates the question-answer panel
        * @method generateQuesAnsPanel
        * @param quesAnsPanelObj {Object} Model values to be passed to generate question-answer view
        * @return quesAnsPanelView {Object} Reference to the generated question-answer panel view
        * @public
        */
        generateQuesAnsPanel: function (quesAnsPanelObj) {
            if (quesAnsPanelObj) {
                var quesAnsPanelView, quesAnsPanelModel, el;
                el = quesAnsPanelObj.containerId;
                quesAnsPanelModel = new MathInteractives.Common.Interactivities.VirusZapper.Models.QuesAnsPanel(quesAnsPanelObj);
                quesAnsPanelView = new MathInteractives.Common.Interactivities.VirusZapper.Views.QuesAnsPanel({ model: quesAnsPanelModel, el: el });
                return quesAnsPanelView;
            }
        }

    });
    quesAnsClass = MathInteractives.Common.Interactivities.VirusZapper.Views.QuesAnsPanel;
})()