(function () {

    /**
    * Question-answer panel model.
    *
    * @class QuesAnsPanel
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Interactivities.VirusZapper.Models
    */
    MathInteractives.Common.Interactivities.VirusZapper.Models.QuesAnsPanel = MathInteractives.Common.Player.Models.Base.extend({
        defaults: function () {
            return {
                root: null,
                questionValue: null,
                ansValue: null,
                healthMeter: null,
                isHealthbarFull: true,
                alreadyGeneratedQuesValues: [],
                initialHealthMeter: null,
                digitArray: [],
                firstTime: null
            }
        },

        /*
        * Stores the question list for both the interactive
        * @property questionList
        * @type object
        * @public
        * @default null
        */
        questionList: null,

        /*
       * Stores current question index
       * @property currentQuestionIndex
       * @type number
       * @public
       * @default 0
       */
        currentQuestionIndex: 0,

        initialize: function () {
            this.set('firstTime', true);
            this.generateQuestionList();
        },


        generateQuestionList: function generateQuestionList() {
            var exceptionList = {
                '1': [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 8, 27, 64],
                '2': [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 85, 57, 99]
            }, questionList = [], questionData;

            this.questionList = {
                '1': [],
                '2': []
            };

            //generates list of question from 2 to 100 for both type of interactives
            for (var index = 2; index < 100; index++) {
                questionData = {
                    value: index,
                    root: 2
                };
                if (exceptionList[1].indexOf(index) === -1) {
                    this.questionList[1].push(questionData);
                }
                if (exceptionList[2].indexOf(index) === -1) {
                    this.questionList[2].push(questionData);
                }
            }

            //For interactive 1, 101 to 124 cube root added to the list
            for (var index = 2; index < 125; index++) {
                questionData = {
                    value: index,
                    root: 3
                };
                if (exceptionList[1].indexOf(index) === -1) {
                    this.questionList[1].push(questionData);
                }
            }

            //shuffle array at first time
            this.questionList[1] = _.shuffle(this.questionList[1]);
            this.questionList[2] = _.shuffle(this.questionList[2]);
        },


        /**
        * Returns next question in the list.
        * @method generateQuestion
        * @param interactivityType {Number} type of Interactive
        * @param reShuffle {Boolean} new array
        * @public
        */
        generateQuestion: function generateQuestion(interactivityType, reShuffle) {
            var questionList = this.questionList[interactivityType],
                root = [2, 3], rootValue, indexOfFirstSquare, tempStore,
            firstTime = this.get('firstTime'), questionData,
            answer, randomValue;

            //shuffles the array if try another is clicked
            if (reShuffle === true) {
                this.currentQuestionIndex = 0;
                questionList = _.shuffle(questionList);
            }

            //if all the questions are traversed then the list starts from 0
            if (this.currentQuestionIndex >= questionList.length) {
                this.currentQuestionIndex = 0;
            }

            questionData = questionList[this.currentQuestionIndex++];
            randomValue = questionData.value;
            rootValue = questionData.root;

            //for Interactive 1, initially square root allowed
            if (interactivityType === 1) {
                if (firstTime) {
                    while (randomValue > 100 || (rootValue > 2 && randomValue < 100)) {
                        indexOfFirstSquare = Math.floor(Math.random() * (questionList.length - 1));
                        randomValue = questionList[indexOfFirstSquare].value;
                        rootValue = 2;

                        //shifting the found value to 0th location
                        tempStore = questionList[indexOfFirstSquare];
                        questionList[indexOfFirstSquare] = questionList[0];
                        questionList[0] = tempStore;
                    }

                    this.set('firstTime', false);
                }
            }



            answer = Math.pow(randomValue, 1 / rootValue);
            //sets question and answer values in model.
            this.set('root', rootValue);
            this.set('ansValue', answer);
            this.set('questionValue', randomValue);
            return randomValue;
        },


        /**
        * Increments value of health meter.
        * @method incrementHealthMeter
        * @public
        */
        incrementHealthMeter: function () {
            var currentHealthMeter = this.get('healthMeter');
            if (currentHealthMeter < 5) {
                currentHealthMeter = currentHealthMeter + 1;
                this.set('healthMeter', currentHealthMeter);
            }
            else {
                this.set('isHealthbarFull', true);
            }
        },

        /**
        * Decrements value of health meter.
        * @method decrementHealthMeter
        * @public
        */
        decrementHealthMeter: function () {
            var currentHealthMeter = this.get('healthMeter');
            this.set('isHealthbarFull', false);
            if (currentHealthMeter > 0) {
                currentHealthMeter = currentHealthMeter - 1;
                this.set('healthMeter', currentHealthMeter);
            }
        },

        /**
        * Resets value of health meter.
        * @method resetHealthMeter
        * @public
        */
        resetHealthMeter: function () {
            var healthMeterValue = this.get('initialHealthMeter');
            this.set('healthMeter', healthMeterValue);
        }
    });
})();