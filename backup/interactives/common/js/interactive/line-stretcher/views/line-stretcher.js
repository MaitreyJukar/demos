(function (MathInteractives) {
    'use strict';

    // Defining namespace
    if (typeof MathInteractives.Common.Interactivities.LineStretcher === 'undefined') {
        MathInteractives.Common.Interactivities.LineStretcher = {};
        MathInteractives.Common.Interactivities.LineStretcher.Views = {};
        MathInteractives.Common.Interactivities.LineStretcher.Models = {};
    }

    /**
    * Class for Explore Tab, contains properties and methods of Explore tab
    * @class Explore
    * @module LineStretcher
    * @namespace MathInteractives.Interactivities.LineStretcher.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Common.Interactivities.LineStretcher.Views.Explore = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Stores filepaths for resources, value set on initialize
        *   
        * @property filePath 
        * @type Object
        * @default null
        **/
        filePath: null,

        /**
        * Stores manager instance for using common level functions, value set on initialize
        *
        * @property manager 
        * @type Object
        * @default null
        **/
        manager: null,

        /**
        * Stores reference to player, value set on initialize
        * 
        * @property player 
        * @type Object
        * @default null
        **/
        player: null,

        /**
        * id-prefix of the interactive, value set on initialize
        * 
        * @property idPrefix 
        * @type String
        * @default null
        **/
        idPrefix: null,

        /**
        * Stores reference to paper scope
        * 
        * @property scope 
        * @type Object
        * @default null
        **/
        scope: null,

        /**
        * Stores reference to left Input Box.
        * 
        * @property leftInputBoxView 
        * @type Object
        * @default null
        **/
        leftInputBoxView: null,

        /**
        * Stores reference to right Input Box.
        * 
        * @property rightInputBoxView 
        * @type Object
        * @default null
        **/
        rightInputBoxView: null,

        /**
        * Stores reference to Chop Button.
        * 
        * @property chopButtonView 
        * @type Object
        * @default null
        **/
        chopButtonView: null,

        /**
        * Stores reference to See Math Button.
        * 
        * @property seeMathButtonView 
        * @type Object
        * @default null
        **/
        seeMathButtonView: null,

        /**
        * Stores reference to Try Another Button.
        * 
        * @property tryAnotherButtonview 
        * @type Object
        * @default null
        **/
        tryAnotherButtonview: null,

        /**
        * Stores reference to Try Again Button.
        * 
        * @property tryAgainButtonview 
        * @type Object
        * @default null
        **/
        tryAgainButtonview: null,

        /**
        * Stores reference to Kick Button.
        * 
        * @property kickButtonView 
        * @type Object
        * @default null
        **/
        kickButtonView: null,

        /**
        * Stores path to access static model properties.
        * 
        * @property modelPath 
        * @type Object
        * @default null
        **/
        modelPath: null,

        /**
        * Stores your answer div for displaying user answer.
        * 
        * @property $yourAnswer
        * @type Object
        * @default null
        **/
        $yourAnswer: null,

        /**
        * Stores plank left coordinate div for displaying left coordinate on feedback screen.
        * 
        * @property $plankLeftCordinate
        * @type Object
        * @default null
        **/
        $plankLeftCordinate: null,

        /**
        * Stores plank right coordinate div for displaying right coordinate on feedback screen.
        * 
        * @property $plankRightCordinate
        * @type Object
        * @default null
        **/
        $plankRightCordinate: null,

        /**
        * Stores feedback ratio div for displaying ratio on feedback screen.
        * 
        * @property $feedbackRatioDiv
        * @type Object
        * @default null
        **/
        $feedbackRatioDiv: null,

        /**
        * Stores answer bullet div for displaying bullet near your answer on feedback screen.
        * 
        * @property $yourAnswerBullet
        * @type Object
        * @default null
        **/
        $yourAnswerBullet: null,

        /**
        * Container div for your answer and bullet div, displayed only on feedback screen else it is hidden.
        * 
        * @property $yourAnswerContainer
        * @type Object
        * @default null
        **/
        $yourAnswerContainer: null,

        /**
        * Stores jQuery object for the object container div which stores the trophy stand, punching bag stand or bookshelf
        * 
        * @property $objectContainer
        * @type Object
        * @default null
        **/
        $objectContainer: null,

        /**
        * Stores reference for left Input Box Tool Tip.
        * 
        * @property leftInputToolTip 
        * @type Object
        * @default null
        **/
        leftInputToolTip: null,

        /**
        * Stores reference for right Input Box Tool Tip.
        * 
        * @property rightInputToolTip 
        * @type Object
        * @default null
        **/
        rightInputToolTip: null,

        /**
        * Stores reference for both Input Box Tool Tip without arrow head.
        * 
        * @property errorToolTip 
        * @type Object
        * @default null
        **/
        errorToolTip: null,

        /**
        * ImageBase64 for horizontal plank raster
        *
        * @property horizontalPlankBase64
        * @type object
        * @default null
        **/
        horizontalPlankBase64: null,

        /**
        * ImageBase64 for vertical plank raster
        *
        * @property verticalPlankBase64
        * @type object
        * @default null
        **/
        verticalPlankBase64: null,

        /**
        * ImageBase64 for trophy raster
        *
        * @property trophyBase64
        * @type object
        * @default null
        **/
        trophyBase64: null,

        /**
        * ImageBase64 for punching bag raster
        *
        * @property punchingBagBase64
        * @type object
        * @default null
        **/
        punchingBagBase64: null,

        /**
        * ImageBase64 for the short book group raster
        *
        * @propert booksShortBase64
        * @type Object
        * @default null
        **/
        $booksShort: null,

        /**
        * ImageBase64 for the long book group raster
        *
        * @propert booksLongBase64
        * @type Object
        * @default null
        **/
        //booksLongBase64: null,
        $booksLong: null,

        /**
        * Stores reference to current paper group
        *
        * @property currentPaperGroup
        * @type object
        * @default null
        **/
        currentPaperGroup: null,

        /**
        * Stores reference to currently selected group of values
        *
        * @property chosenSet
        * @type object
        * @default null
        **/
        chosenSet: null,

        /**
        * Stores reference to currently selected object to be built
        *
        * @property currentObject
        * @type object
        * @default null
        **/
        currentObject: null,

        /**
        * Stores paper group of the plank which Rodney breaks
        *
        * @property rodneyPlank
        * @type object
        * @default null
        **/
        rodneyPlankGroup: null,

        /**
        * Stores paper group of any bricks which might be needed to keep the plank up
        *
        * @property rodneyBrickGroup
        * @type object
        * @default null
        **/
        rodneyBrickGroup: null,

        /**
        * Stores paper group of the feedback screen
        *
        * @property feedbackGroup
        * @type object
        * @default null
        **/
        feedbackGroup: null,

        /**
        * Stores reference to paper group for the feedback planks which appear over the object
        * 
        * @property feedbackPlankGroup
        * @type Object
        * @default null
        **/
        feedbackPlankGroup: null,

        /**
        * Stores jQuery object for the answer div of first broken piece of plank on feedback screen.
        * 
        * @property  $answerFt1
        * @type Object
        * @default null
        **/
        $answerFt1: null,

        /**
        * Stores jQuery object for the answer container div on feedback screen.
        * 
        * @property $feedbackAnswers
        * @type Object
        * @default null
        **/
        $feedbackAnswers: null,

        /**
        *Stores jQuery object for displaying x1 and y1 of plank on feedback screen.
        * 
        * @property $startCoordinate
        * @type Object
        * @default null
        **/
        $startCoordinate: null,

        /**
        * Stores jQuery object for displaying x2 and y2 of plank on feedback screen.
        * 
        * @property  $endCoordinate
        * @type Object
        * @default null
        **/
        $endCoordinate: null,

        /**
        *Stores jQuery object for container div of start coordinate and endcoordinate of plank on feedback screen.
        * 
        * @property $exploreTabCoordinates
        * @type Object
        * @default null
        **/
        $exploreTabCoordinates: null,

        /**
        * Stores jQuery object for the answer div of second broken piece of plank on feedback screen.
        * 
        * @property $answerFt2
        * @type Object
        * @default null
        **/
        $answerFt2: null,
        /**
        * Array of sides which will be dotted side
        * 
        * @property dottedSideIndex
        * @type array
        * @default null
        **/
        dottedSideIndex: null,

        /**
        * Flag to check if interactivity is used
        *
        * @property isScreenDirty
        * @type boolean
        * @default null
        **/
        isScreenDirty: null,

        /**
        * object of clipped group for right side broken planks
        * 
        * @property rightBrokenRasterGroup
        * @type object
        * @default null
        **/

        rightBrokenRasterGroup: null,

        /**
        * Object of clipped group for left side broken planks
        * 
        * @property rightBrokenRasterGroup
        * @type object
        * @default null
        **/
        leftBrokenRasterGroup: null,

        /**
        * Direction text view
        * 
        * @property directionTextView
        * @type object
        * @default null
        **/
        directionTextView: null,

        /**
        * Stores reference for chop button div
        * 
        * @property $chopButton
        * @type object
        * @default null
        **/
        $chopButton: null,

        /**
        * Stores reference for see math button div
        * 
        * @property $seeMathButton
        * @type object
        * @default null
        **/
        $seeMathButton: null,

        /**
        * Stores reference for try again button div
        * 
        * @property $tryAgainButton
        * @type object
        * @default null
        **/
        $tryAgainButton: null,

        /**
        * Stores reference for kick button div
        * 
        * @property $kickButton
        * @type object
        * @default null
        **/
        $kickButton: null,

        /**
        * Stores reference to currently selected object text to be built
        *
        * @property currentObjectMessage
        * @type object
        * @default null
        **/
        currentObjectMessage: null,

        counter: 0,

        /**
        * Initializes the explore tab
        *
        * @method initialize
        **/
        initialize: function () {
            var self = this,
                model = self.model,
                plankType = null;

            self.modelPath = MathInteractives.Common.Interactivities.LineStretcher.Models.Line;
            self.filePath = model.get('path'),
            self.manager = model.get('manager');
            self.player = model.get('player');
            self.idPrefix = this.player.getIDPrefix();

            this.$el.append(MathInteractives.Common.Interactivities.LineStretcher.templates.explore({
                idPrefix: self.idPrefix
            }).trim());

            self._cacheDomElements();
            self._generateImageBase64();
            self.loadScreen('explore-tab');

            this.counter = 0;
            this.player.bindTabChange(function () {
                if (this.directionTextView === null) {
                    this._createDirectionText();
                    this._changeInstructionText(this.currentObject, this.chosenSet.get('isMidPoint'), this.chosenSet.get('ratio'));
                    this.$('.direction-text-text').css('font-size', '14px');
                }
                this.setFocus('explorer-direction-text-direction-text-text');
            }, this, 1);

            self.counter = 0;
            self.possibleArrayLength = 0;
            self.render();

            this._storeImagePaths();
            self._hideOnRender();
            self._renderNewScenario(true);

            this._attachCustomEventsToPlanks();
            this._bindEvents();
            this._changeText();
        },

        /**
        * Changes Acc text of activity area.
        *
        * @method _changeText
        * @private
        **/
        _changeText: function () {

            var path = this.chosenSet.attributes, type, left, right, objectMessage;
            if (path.type === "horizontal") {
                type = "horizontal";
                left = "left";
                right = "right";
            }
            else if (path.type === "diagonal") {
                type = "diagonal";
                left = "left";
                right = "right";
            }
            else {
                type = "vertical";
                right = "top";
                left = "bottom";
            }
            var coordinates = path.coordinates,
                    leftX = coordinates.startPoint[0],
                    leftY = coordinates.startPoint[1],
                    rightX = coordinates.endPoint[0],
                    rightY = coordinates.endPoint[1];

            this.inputBoxCanvasArea = [type, left, leftX, leftY, right, rightX, rightY, this.currentObjectMessage];
            this.changeAccMessage('canvas-activity-area', 0, this.inputBoxCanvasArea);
        },

        /**
        * Attaches custom events
        *
        * @method _attachCustomEventsToPlanks
        * @private
        **/
        _attachCustomEventsToPlanks: function () {
            var self = this, plankType;

            this.on('plank-hit', function () {
                if (self.rodneyPlankGroup) {
                    self.rodneyPlankGroup.remove();
                    self.$exploreTabCoordinates.hide();

                    var xVal = parseFloat(self.leftInputBoxView.getCurrentInputValue()),
                        yVal = parseFloat(self.rightInputBoxView.getCurrentInputValue()),
                        chosenSet = self.chosenSet,
                        coordinates = chosenSet.get('coordinates'),
                        startPoint = coordinates.startPoint,
                        endPoint = coordinates.endPoint;

                    window.setTimeout(function () {
                        plankType = chosenSet.get('type');
                        self.scope.activate();

                        if (plankType === 'horizontal' || plankType === 'diagonal') {
                            self._drawDiagonalHorizontalBrokenPlanks(startPoint, endPoint, [xVal, yVal]);
                        }
                        else if (plankType === 'vertical') {
                            self._drawVerticalBrokePlanks(endPoint, startPoint, [xVal, yVal]);
                        }
                        paper.view.draw();
                    }, 100);
                }
            });

            this.on('breaking-animation-ends', function () {
                var xVal = parseFloat(self.leftInputBoxView.getCurrentInputValue()),
                    yVal = parseFloat(self.rightInputBoxView.getCurrentInputValue()),
                    chosenSet = self.chosenSet,
                    coordinates = chosenSet.get('coordinates'),
                    startPoint = coordinates.startPoint,
                    endPoint = coordinates.endPoint,
                    lengths, max, min, isAnswerCorrect = false,
                    answers = chosenSet.get('answers');

                this._fadeOutPlanks();
                lengths = this.model.getSectionLengths({
                    x: startPoint[0],
                    y: startPoint[1]
                }, {
                    x: endPoint[0],
                    y: endPoint[1]
                }, { x: xVal, y: yVal });

                if (lengths[1] > lengths[0]) {
                    max = lengths[1];
                    min = lengths[0];
                }
                else {
                    max = lengths[0];
                    min = lengths[1];
                }

                var ratio = this.model.getLengthsRatio(Math.round(lengths[0] * 10), Math.round(lengths[1] * 10)),
                    chosenRatio = chosenSet.get('ratio');

                if (((xVal === answers[0][0] && yVal === answers[0][1]) || (xVal === answers[1][0] && yVal === answers[1][1]))
                    || ((ratio[0] === chosenRatio[0] && ratio[1] === chosenRatio[1]) || (ratio[0] === chosenRatio[1] && ratio[1] === chosenRatio[0]))) {
                    isAnswerCorrect = true;
                    ratio = chosenRatio;

                    if (lengths[0] > lengths[1]) {
                        ratio = [ratio[1], ratio[0]];
                    }

                    var actualLengths = chosenSet.get('segments');

                    min = actualLengths[0];
                    max = actualLengths[1];
                }

                this._displayFeedbackPlanks([max, min], isAnswerCorrect);
                /* Uncomment to show approximation symbol in feedback screen for part lengths
                if (chosenSet.get('type') === 'diagonal') {
                lengths[0] = '~' + lengths[0];
                lengths[1] = '~' + lengths[1];
                }
                */
                this._dataForFeedbackScreen = {
                    ratio: ratio,
                    type: chosenSet.get('type'),
                    startPoint: startPoint,
                    endPoint: endPoint,
                    userAnswer: [xVal, yVal],
                    isCorrect: isAnswerCorrect,
                    sectionLengths: lengths
                };


            });

            this.on('feedback-animation-ends', function () {
                var rodenyFeedback = null;

                self.$inputBoxContainer.hide();
                self.kickButtonView.hideButton();
                self.chopButtonView.hideButton();
                self.seeMathButtonView.showButton();

                self._enableState();
                if (this._dataForFeedbackScreen.isCorrect) {
                    rodenyFeedback = this._positiveFeedback;
                    this.isScreenDirty = false;
                }
                else {
                    rodenyFeedback = this._negativeFeedback;
                }
                this.$rodney.css('background-position', rodenyFeedback);
                self.setFocus('see-math-button');
            });
        },

        _checkAnswerForDiagonals: function (answer, lengths) {




        },

        /**
        * Creates direction text.
        *
        * @method _createDirectionText
        * @private
        */
        _createDirectionText: function _createDirectionText() {
            var self = this, directionProperties = {
                containerId: this.idPrefix + 'explorer-direction-text',
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                text: this.getMessage('instruction-text', 3),
                accText: this.getMessage('instruction-text', 3),
                showButton: true,
                buttonText: this.getMessage('try-another', 0),
                buttonAccText: this.getAccMessage('try-another', 0),
                btnColorType: MathInteractives.global.Theme2.Button.COLORTYPE.GREEN,
                containmentBGcolor: 'rgba(34, 34, 34, 0.0)',
                //                ttsBaseClass: 'direction-tts',
                btnBaseClass: 'custom-black-button',
                clickCallback: {
                    fnc: this._tryAnotherCallback,
                    scope: this
                },
                textColor: '#000000',
                tabIndex: 510,
                buttonTabIndex: 600,
                customClass: 'direction-text-custom-class'
            };
            this.directionTextView = MathInteractives.global.Theme2.DirectionText.generateDirectionText(directionProperties);
            this.tryAnotherButtonview = this.directionTextView.tryAnotherView;
        },

        /**
        * Function used for calling try another popup.
        * 
        * @method _tryAnotherCallback
        * @private         
        **/
        _tryAnotherCallback: function () {
            this._renderPopUps('try-another');
        },

        /**
        *Hides feedback screen and disables button while rendering plank and rodney on screen.
        *
        *@method _hideOnRender
        *@private         
        **/
        _hideOnRender: function () {
            var self = this;
            self.seeMathButtonView.hideButton();
            self._disableButton(self.chopButtonView);
            self._disableButton(self.kickButtonView);
            self.$feedbackInstructionTryAgain.hide();
            self.$yourAnswerContainer.hide();
        },

        /**
        * Attaches events to elements with view's 'el'
        *
        *@method _bindEvents
        *@private      
        **/
        _bindEvents: function () {
            this.$chopButton.on('click.chopClickEnabled', $.proxy(this._showToolTip, this));
            this.$seeMathButton.on('click.seeMathClickEnabled', $.proxy(this._feedbackScreen, this));
            this.$tryAgainButton.on('click.tryAgainClickEnabled', $.proxy(this._renderOnTryAgain, this));
            this.$kickButton.on('click.kickClickEnabled', $.proxy(this._showToolTip, this));
        },

        /**
        * Checks if the user has interacted with the text boxes
        * 
        * @method _setScreenDirtyFlag
        * @private
        **/
        _setScreenDirtyFlag: function () {
            var self = this,
                leftValue = self.leftInputBoxView.getCurrentInputValue(),
                rightValue = self.rightInputBoxView.getCurrentInputValue();

            if (leftValue !== null || rightValue !== null) {
                self.isScreenDirty = true;
            }
            else {
                self.isScreenDirty = false;
            }
        },

        /**
        *Enables chop button if value is entered in both input boxes.
        *
        *@method _enableDisableChopButton
        *@private         
        **/
        _enableDisableChopButton: function () {
            var self = this,
                globalButton = MathInteractives.global.Theme2.Button,
                leftValue = self.leftInputBoxView.getCurrentInputValue(),
                rightValue = self.rightInputBoxView.getCurrentInputValue();

            if ((leftValue === null) || (rightValue === null) || isNaN(leftValue) || isNaN(rightValue)) {
                self._disableButton(self.chopButtonView);
                self._disableButton(self.kickButtonView);
            }
            else {
                self._enableButton(self.chopButtonView);
                self._enableButton(self.kickButtonView);
            }

            self._hideAllTooltip();
        },

        /**
        *Hides tool tip message shown to user on key down.
        *
        *@method _hideAllTooltip
        *@private        
        **/
        _hideAllTooltip: function _hideAllTooltip() {
            var self = this;
            if (self.leftInputBoxView !== null) { self.leftInputToolTip.hideTooltip(); }
            if (self.rightInputBoxView !== null) { self.rightInputToolTip.hideTooltip(); }
            if (self.leftInputBoxView !== null && self.rightInputBoxView !== null) { self.errorToolTip.hideTooltip(); }
        },

        /**
        *Displays tooltip message to user if wrong input values are entered.
        *
        *@method _showToolTip
        *@private        
        **/
        _showToolTip: function () {
            var self = this, chosenType = self.chosenSet.attributes.type,
                leftInputValue = self.leftInputBoxView.getCurrentInputValue(),
                rightInputValue = self.rightInputBoxView.getCurrentInputValue();

            

            if ((chosenType === 'vertical' && self.kickButtonView.getButtonState() === 'disabled')
                || ((chosenType === 'horizontal' || chosenType === 'diagonal') && self.chopButtonView.getButtonState() === 'disabled')) {

                return;
            }

            MathInteractives.global.SpeechStream.stopReading();

            if ((leftInputValue !== null && (leftInputValue < 1 || leftInputValue > 11))
                && (rightInputValue !== null && (rightInputValue < 1 || rightInputValue > 10))) {
                self.errorToolTip.showTooltip();
                self._disableButton(self.chopButtonView);
                self._disableButton(self.kickButtonView);
                self.setFocus('input-box-container-tooltip-text-container');
                this.changeAccMessage('x-input-boxtextbox', 1, [self.leftInputBoxView.getCurrentInputValue()]);
                this.changeAccMessage('y-input-boxtextbox', 1, [self.rightInputBoxView.getCurrentInputValue()]);
            }
            else if (leftInputValue !== null && (leftInputValue < 1 || leftInputValue > 11)) {
                self.leftInputToolTip.showTooltip();
                self._disableButton(self.chopButtonView);
                self._disableButton(self.kickButtonView);
                self.setFocus('x-input-box-tooltip-text-container');
                this.changeAccMessage('x-input-boxtextbox', 1, [self.leftInputBoxView.getCurrentInputValue()]);
                this.changeAccMessage('y-input-boxtextbox', 1, [self.rightInputBoxView.getCurrentInputValue()]);
            }
            else if ((rightInputValue !== null && rightInputValue < 1 || rightInputValue > 10)) {
                self.rightInputToolTip.showTooltip();
                self._disableButton(self.chopButtonView);
                self._disableButton(self.kickButtonView);
                self.setFocus('y-input-box-tooltip-text-container');
                this.changeAccMessage('x-input-boxtextbox', 1, [self.leftInputBoxView.getCurrentInputValue()]);
                this.changeAccMessage('y-input-boxtextbox', 1, [self.rightInputBoxView.getCurrentInputValue()]);
            }
            else {
                // User entered coord lies on the plank
                var xVal = parseFloat(leftInputValue),
                    yVal = parseFloat(rightInputValue),
                    StaticData = this.modelPath,
                    canvasXVal = (xVal + StaticData.xAxisOffset) * StaticData.gridSize,
                    chosenSet = this.chosenSet,
                    answers = chosenSet.get('answers'),
                    coordinates = chosenSet.get('coordinates'),
                    startPoint = coordinates.startPoint,
                    endPoint = coordinates.endPoint,
                    type = chosenSet.get('type'),
                    model = this.model,
                    canvasYVal = (StaticData.yAxisOffset - yVal) * StaticData.gridSize,
                    obj = model.liesOnPlank({ x: startPoint[0], y: startPoint[1] }, { x: endPoint[0], y: endPoint[1] }, { x: xVal, y: yVal }, type);

                if (obj.liesOnPlank) {
                    if ((type === 'horizontal' && (xVal <= (startPoint[0] + 1) || xVal >= (endPoint[0] - 1))) ||
                         (type === 'vertical' && (yVal <= (startPoint[1] + 0.3) || yVal >= (endPoint[1] - 0.3))) ||
                         (type === 'diagonal' && !obj.isAllowed)) {

                        self._headScratch(false, true);
                        self._disableButton(self.chopButtonView);
                        self._disableButton(self.kickButtonView);
                    }
                    else {
                        this._disableState();
                        this._breakPlank(this.chosenSet.get('type'), { x: canvasXVal, y: canvasYVal });
                    }
                }
                else {

                    this._headScratch(true);
                    self.leftInputBoxView.disableInputBox();
                    self.rightInputBoxView.disableInputBox();
                    self._disableButton(self.chopButtonView);
                    self._disableButton(self.kickButtonView);
                }
            }
        },

        /**
        * Displays head scratch animation
        *
        * @method _headScratch
        * @param {Boolean} If animation should be followed by pop up or not
        * @private        
        **/
        _headScratch: function (showAlert, isBoundaryInput) {
            var $rodney = this.$rodney,
                index = 0,
                imgs = this._headScratchAnim, animationInterval,
                placeHolder = imgs.indexOf('last-frame'), self = this;

            this._disableState();
            self.leftInputBoxView.disableInputBox();
            self.rightInputBoxView.disableInputBox();
            if (placeHolder !== -1) {
                if (this.chosenSet.get('type') === 'vertical') {
                    imgs[placeHolder] = { imgPath: this._kickImages.kickInitialPos };
                }
                else {
                    imgs[placeHolder] = { imgPath: this.horizontalChopImgs.startPos };
                }
            }

            animationInterval = setInterval(function () {
                $rodney.css('background-position', imgs[index].imgPath);
                index++;
                if (index === imgs.length) {
                    clearInterval(animationInterval);
                    self._enableState();
                    if (showAlert) {
                        self._renderPopUps('out-of-plank');
                    }
                    if (isBoundaryInput === true) {
                        self._renderPopUps('boundary-input');

                    }
                }
            }, 400);
        },

        /**
        *Called when See Math button is clicked.
        * Contains necessary functions to hide and show containers for feedback scrren.
        *
        *@method _feedbackScreen
        *@private        
        **/
        _feedbackScreen: function () {
            MathInteractives.global.SpeechStream.stopReading();

            var self = this, feedbackRatio1, feedbackRatio1Nume,
                feedbackRatio1Deno, userRatio, userRatioNume, userRatioDemo, isValid;


            this._resetClippedPathPosition();
            self.$feedbackAnswers.show();
            self.$yourAnswerContainer.show();
            self.$inputBoxContainer.hide();
            self.$exploreTabCoordinates.hide();
            self.seeMathButtonView.hideButton();
            self.chopButtonView.hideButton();
            self.kickButtonView.hideButton();
            self._axisGroup.visible = false;
            if (this.rodneyPlankGroup !== null) {
                this.rodneyPlankGroup.remove();
            }
            if (this.rodneyBrickGroup !== null) {
                this.rodneyBrickGroup.remove();
            }
            self.$booksShort.hide();
            self.$booksLong.hide();
            self.$rodney.hide();
            self.currentPaperGroup.remove();
            self.$axisLabel.hide();
            self.$objectContainer.hide();
            self.$feedbackInstructionTryAgain.show();
            if (self.feedbackPlankGroup) {
                self.feedbackPlankGroup.remove();
            }

            var data = this._dataForFeedbackScreen,
                ratio = data.ratio[0] + ':' + data.ratio[1],
                actualRatio = this.chosenSet.get('ratio'),
                color = self.modelPath.color;

            this.scope.activate();
            self._drawSeeMathPlank();
            //self._disableButton(self.tryAnotherButtonview);
            self._disableState();
            self._disableButton(self.tryAgainButtonview);
            self.$feedbackInstructionTryAgain.css({ 'bottom': '-95px' }).animate({ 'bottom': '0px' }, 400, function () {
                //self._enableButton(self.tryAnotherButtonview);

                self._enableState();
                self._enableButton(self.tryAgainButtonview);
            });

            if (data.isCorrect) {
                // Positive Feedback
                self.changeMessage('feedback-instruction-text', 0, [data.ratio[0], data.ratio[1]]);
                self.changeAccMessage('feedback-instruction-try-again', 0, [data.ratio[0], data.ratio[1]]);
                self.isScreenDirty = false;
                //                self.$feedbackInstructionHeadingText.text(this.getMessage('try-again', 2));
                self.tryAgainButtonview.hideButton();
                self.$yourAnswer.css({ 'color': color.green });
                self.$yourAnswerBullet.css({ 'background-color': color.green });
                self.$feedbackInstructionHeadingText.text(this.getMessage('feedback-heading', 1));
            }
            else {
                // Negative feedback
                if (actualRatio[0] === actualRatio[1]) {
                    self.changeMessage('feedback-instruction-text', 1, [data.ratio[0], data.ratio[1], actualRatio[0], actualRatio[1]]);
                    self.changeAccMessage('feedback-instruction-try-again', 1, [data.ratio[0], data.ratio[1], actualRatio[0], actualRatio[1]]);
                }
                else {
                    self.changeMessage('feedback-instruction-text', 2, [data.ratio[0], data.ratio[1], actualRatio[0], actualRatio[1], actualRatio[1], actualRatio[0]]);
                    self.changeAccMessage('feedback-instruction-try-again', 2, [data.ratio[0], data.ratio[1], actualRatio[0], actualRatio[1], actualRatio[1], actualRatio[0]]);
                }
                //                self.$feedbackInstructionHeadingText.text(this.getMessage('try-again', 1));
                self.tryAgainButtonview.showButton();
                self.$yourAnswer.css({ 'color': color.red });
                self.$yourAnswerBullet.css({ 'background-color': color.red });
                self.$feedbackInstructionHeadingText.text(this.getMessage('feedback-heading', 0));
            }
            self.setFocus('canvas-activity-area');
        },

        /**
        * Returns pixel coordinates
        * 
        * @method _getPixelValues
        * @private        
        **/
        _getPixelValues: function (gridPoint) {
            var modelPath = this.modelPath,
                canvasX = (gridPoint[0] + modelPath.xAxisOffset) * modelPath.gridSize,
                canvasY = (modelPath.yAxisOffset - gridPoint[1]) * modelPath.gridSize;

            return {
                x: canvasX,
                y: canvasY
            }
        },

        /**
        * Calculates top and left value using center value
        * 
        * @method _getPosition
        * @private        
        **/
        _getPosition: function ($div, centerY, centerX) {
            return {
                top: centerY - ($div.height() / 2),
                left: centerX - ($div.width() / 2)
            }
        },

        /**
        * Common function for rendering horizontal, vertical and diagonal plank on 'See Math' screen.
        * 
        * @method _drawSeeMathPlank
        * @private        
        **/
        _drawSeeMathPlank: function () {
            var self = this,
                plankData = this._dataForFeedbackScreen,
                startPoint = this._getPixelValues(plankData.startPoint),
                endPoint = this._getPixelValues(plankData.endPoint),
                userAnswer = this._getPixelValues(plankData.userAnswer),
                scope = this.scope,
                model = this.model,
                modelPath = this.modelPath,
                tickLength = modelPath.tickLength,
                dist1 = model.getDistance(startPoint, endPoint),
                dist2 = model.getDistance(startPoint, userAnswer),
                dot = new scope.Path.Circle({ radius: 5, position: { x: userAnswer.x + 0.5, y: userAnswer.y - 1} }), // Adjustment for exact grid location
                delta = 11, // Vertical distance between plank and line 
                line1 = new scope.Path.Line({
                    x: startPoint.x,
                    y: startPoint.y - delta
                }, {
                    x: startPoint.x,
                    y: startPoint.y - tickLength - delta
                }),
                line2 = new scope.Path.Line({
                    x: startPoint.x + dist1,
                    y: startPoint.y - delta
                }, {
                    x: startPoint.x + dist1,
                    y: startPoint.y - tickLength - delta
                }),
                line3 = new scope.Path.Line({
                    x: startPoint.x + dist2,
                    y: startPoint.y - delta
                }, {
                    x: startPoint.x + dist2,
                    y: startPoint.y - tickLength - delta
                }),
                horizontalLine = new scope.Path.Line({
                    x: startPoint.x,
                    y: startPoint.y - tickLength / 2 - delta
                }, {
                    x: startPoint.x + dist1,
                    y: startPoint.y - tickLength / 2 - delta
                }),
                lines = new scope.Group([line1, line2, line3, horizontalLine]),
                $plankLeftCordinate = this.$plankLeftCordinate,
                $plankRightCordinate = this.$plankRightCordinate,
                $answerFt1 = this.$answerFt1,
                $answerFt2 = this.$answerFt2,
                $feedbackRatioDiv = this.$feedbackRatioDiv,
                plank, theta, ratioPos,
                ratioDivGap = 77, coordsGap = 17,
                leftAdjustment = 0, topAdjustment = 0,
                allLines = lines.children, allGroup,
                ftText = this.getMessage('feedback-answer-Ft', 0);

            lines.strokeColor = modelPath.color.feedBackLine;
            lines.strokeWidth = 2;

            if (plankData.isCorrect) {
                dot.fillColor = modelPath.color.green;
                this.$yourAnswer.removeClass('wrong-answer').addClass('right-answer');
                this.$yourAnswerBullet.removeClass('wrong-answer-bullet').addClass('right-answer-bullet');
            }
            else {
                dot.fillColor = modelPath.color.red;
                this.$yourAnswer.removeClass('right-answer').addClass('wrong-answer');
                this.$yourAnswerBullet.removeClass('right-answer-bullet').addClass('wrong-answer-bullet');
            }

            plank = this._drawDiagonalPlank(startPoint.x, startPoint.y, endPoint.x, endPoint.y, true, true);
            theta = Math.atan2((endPoint.y - startPoint.y), (endPoint.x - startPoint.x));

            if (plankData.type === 'diagonal') {
                var slope = Math.tan(theta),
                    graphPointY = plankData.startPoint[1] - ((plankData.userAnswer[0] - plankData.startPoint[0]) * slope),
                    newCoords = this._getPixelValues([plankData.userAnswer[0], graphPointY]);

                dot.position = { x: newCoords.x + 0.5, y: newCoords.y - 1 }; // Adjustment for exact grid location
            }

            allGroup = new scope.Group([plank, lines]);
            allGroup.rotate(theta * 180 / Math.PI, startPoint);

            plank.children[0].children[1].rotate(-theta * 180 / Math.PI, startPoint);

            // Display feedback values
            this.changeMessage('your-answer', 0, [plankData.userAnswer[0], plankData.userAnswer[1]]);
            $feedbackRatioDiv.html(plankData.ratio[0] + ':' + plankData.ratio[1]);
            $plankLeftCordinate.html(this.getMessage('start-coordinate', 0, plankData.startPoint));
            $plankRightCordinate.html(this.getMessage('start-coordinate', 0, plankData.endPoint));
            $answerFt1.html('<span>' + plankData.sectionLengths[0] + ftText + '</span>');
            $answerFt2.html('<span>' + plankData.sectionLengths[1] + ftText + '</span>');

            // Position divs
            if (plankData.type === 'vertical') {
                ratioDivGap = 40;
                ratioPos = this._getPosition($feedbackRatioDiv, endPoint.y - ratioDivGap, endPoint.x);
                var leftPos = this._getPosition($plankLeftCordinate, startPoint.y, startPoint.x + 50),
                    rightPos = this._getPosition($plankRightCordinate, endPoint.y, endPoint.x + 50);

                // 6 has been added to adjust positioning accordint to the UI
                $plankLeftCordinate.css({ top: leftPos.top, left: leftPos.left + 6 });
                $plankRightCordinate.css({ top: rightPos.top, left: rightPos.left + 6 });
                leftAdjustment = 3;
            }
            else {
                ratioPos = this._getPosition($feedbackRatioDiv, (startPoint.y + endPoint.y) / 2 - ratioDivGap, (startPoint.x + endPoint.x) / 2);
                $plankLeftCordinate.css({ top: startPoint.y - ($plankLeftCordinate.height() / 2), left: startPoint.x - coordsGap - $plankLeftCordinate.width() + 8 });
                $plankRightCordinate.css({ top: endPoint.y - ($plankRightCordinate.height() / 2), left: endPoint.x + coordsGap - 8 });
            }

            if (plankData.type === 'diagonal') {
                topAdjustment = 25;
                if (theta < 0) {
                    leftAdjustment = 11 * Math.cos(theta);
                }
                else {
                    leftAdjustment = -11 * Math.cos(theta);
                }
            }

            $feedbackRatioDiv.css({ left: ratioPos.left, top: ratioPos.top - 11 });

            var leftLengthPos = this._getPosition($answerFt1, (allLines[0].position.y + allLines[2].position.y) / 2, (allLines[0].position.x + allLines[2].position.x) / 2);
            $answerFt1.css({ top: leftLengthPos.top - topAdjustment, left: leftLengthPos.left - leftAdjustment });

            var rightLengthPos = this._getPosition($answerFt2, (allLines[1].position.y + allLines[2].position.y) / 2, (allLines[1].position.x + allLines[2].position.x) / 2);
            $answerFt2.css({ top: rightLengthPos.top - topAdjustment, left: rightLengthPos.left - leftAdjustment });
            theta *= 180 / Math.PI;

            // Reset rotation of answer div
            var resetTheta = 0;
            $answerFt1.css({
                '-webkit-transform': 'rotate(' + (resetTheta) + 'deg)',
                '-moz-transform': 'rotate(' + (resetTheta) + 'deg)',
                '-ms-transform': 'rotate(' + (resetTheta) + 'deg)',
                'transform': 'rotate(' + (resetTheta) + 'deg)',

                '-ms-transform-origin': '50% 50%', /* IE 9 */
                '-webkit-transform-origin': '50% 50%' /* Opera, Chrome, and Safari */
            });

            $answerFt2.css({
                '-webkit-transform': 'rotate(' + (resetTheta) + 'deg)',
                '-moz-transform': 'rotate(' + (resetTheta) + 'deg)',
                '-ms-transform': 'rotate(' + (resetTheta) + 'deg)',
                'transform': 'rotate(' + (resetTheta) + 'deg)',

                '-ms-transform-origin': '50% 50%', /* IE 9 */
                '-webkit-transform-origin': '50% 50%' /* Opera, Chrome, and Safari */
            });


            if (plankData.type !== 'vertical') {
                $answerFt1.css({
                    '-webkit-transform': 'rotate(' + (theta) + 'deg)',
                    '-moz-transform': 'rotate(' + (theta) + 'deg)',
                    '-ms-transform': 'rotate(' + (theta) + 'deg)',
                    'transform': 'rotate(' + (theta) + 'deg)',

                    '-ms-transform-origin': '50% 50%', /* IE 9 */
                    '-webkit-transform-origin': '50% 50%' /* Opera, Chrome, and Safari */
                });

                $answerFt2.css({
                    '-webkit-transform': 'rotate(' + (theta) + 'deg)',
                    '-moz-transform': 'rotate(' + (theta) + 'deg)',
                    '-ms-transform': 'rotate(' + (theta) + 'deg)',
                    'transform': 'rotate(' + (theta) + 'deg)',

                    '-ms-transform-origin': '50% 50%', /* IE 9 */
                    '-webkit-transform-origin': '50% 50%' /* Opera, Chrome, and Safari */
                });
            }
            else {
                // Prevent length values from overlapping the plank
                var xDiff = $answerFt2.position().left + $answerFt2.outerWidth() - startPoint.x;

                if (Math.abs(xDiff) < 2) {
                    $answerFt2.css('left', $answerFt2.position().left += xDiff);
                    $answerFt1.css('left', $answerFt1.position().left += xDiff);
                }

                // Hack to position the feedback dot along the plank border.
                allGroup.position.x = allGroup.position.x + 1.5;
            }


            this.feedbackPlankGroup = new scope.Group([plank, lines, dot]);
            dot.bringToFront();
            this.feedbackCanvasArea = [plankData.userAnswer[0], plankData.userAnswer[1], plankData.startPoint[0], plankData.startPoint[1], plankData.endPoint[0], plankData.endPoint[1], plankData.sectionLengths[0], plankData.sectionLengths[1]];
            this.changeAccMessage('canvas-activity-area', 1, this.feedbackCanvasArea);
        },

        /**
        *Displays popup if both input values are within range but not on board.
        *
        *@method _renderPopUps
        *@private        
        **/
        _renderPopUps: function (popUp) {

            var self = this, popUpBox, popUpProps,
                filePath = self.filePath, errorPopUp, wrongInputPopUp,
                idPrefix = self.idPrefix,
                manager = self.manager,
                player = self.player;

            popUpBox = MathInteractives.global.Theme2.PopUpBox;

            popUpProps = {
                path: filePath,
                manager: manager,
                player: player,
                idPrefix: idPrefix,
                type: popUpBox.CONFIRM,
                closeCallback: {
                    fnc: function () {

                        self.leftInputBoxView.enableInputBox();
                        self.rightInputBoxView.enableInputBox();
                        this.changeAccMessage('x-input-boxtextbox', 1, [self.leftInputBoxView.getCurrentInputValue()]);
                        this.changeAccMessage('y-input-boxtextbox', 1, [self.rightInputBoxView.getCurrentInputValue()]);
                        self.setFocus('x-input-boxtextbox');
                    },
                    scope: self
                }
            };

            switch (popUp) {

                case 'out-of-plank':
                    popUpProps.text = this.getMessage('pop-up-box', 1);
                    popUpProps.title = this.getMessage('pop-up-box', 0);
                    self.leftInputBoxView.disableInputBox();
                    self.rightInputBoxView.disableInputBox();
                    popUpBox.createPopup(popUpProps);
                    self._disableButton(self.kickButtonView);
                    self._disableButton(self.chopButtonView);
                    break;

                case 'boundary-input':
                    popUpProps.text = this.getMessage('pop-up-box', 7);
                    popUpProps.title = this.getMessage('pop-up-box', 0);
                    self.leftInputBoxView.disableInputBox();
                    self.rightInputBoxView.disableInputBox();
                    popUpBox.createPopup(popUpProps);
                    self._disableButton(self.kickButtonView);
                    self._disableButton(self.chopButtonView);
                    break;

                case 'try-another':

                    MathInteractives.global.SpeechStream.stopReading();
                    if (this.tryAnotherButtonview.getButtonState() === 'disabled') {
                        return;
                    }
                    if (this.isScreenDirty === true) {
                        var self = this;
                        popUpProps.text = this.getMessage('pop-up-box', 4);
                        popUpProps.title = this.getMessage('pop-up-box', 3);
                        popUpProps.closeCallback = ({
                            fnc: self._tryAnotherBoard,
                            scope: self
                        });
                        popUpProps.buttons = [{
                            id: self.idPrefix + 'ok-btn',
                            text: self.getMessage('pop-up-box', 5),
                            response: { isPositive: true, buttonClicked: self.idPrefix + 'ok-btn' }
                        },
                        {
                            id: self.idPrefix + 'cancel-btn',
                            text: self.getMessage('pop-up-box', 6),
                            response: { isPositive: false, buttonClicked: self.idPrefix + 'cancel-btn' }
                        }];

                        popUpBox.createPopup(popUpProps);
                        this.errorToolTip.hideTooltip();
                        this.leftInputToolTip.hideTooltip();
                        this.rightInputToolTip.hideTooltip();
                    }
                    else {
                        this._tryAnotherBoard(true);
                    }
                    break;
            }
        },

        /** Renders the plank for the horizontal chop scenario
        *
        * @method _renderChopScenarioHorizontal
        * @param {string} plankType
        * @private
        **/
        _renderChopScenarioHorizontal: function (plankType) {
            var chosenSet = this.chosenSet,
                plankLength = chosenSet.get('plankLength'),
                pointCoOrdinates,
                xStartPoint, yStartPoint, xEndPoint, yEndPoint,
                x1, y1, x2, y2,
                counter, arrayIndex, groupArray = [],
                plankArray = [],
                plankBrickGroup,
                paperScope = this.scope,
                staticModelPath = this.modelPath,
                plankWidth = staticModelPath.plankWidth,
                gridSize = staticModelPath.gridSize,
                xAxisOffset = staticModelPath.xAxisOffset,
                yAxisOffset = staticModelPath.yAxisOffset,
                horizontalBrickWidth = staticModelPath.horizontalBrickWidth,
                horizontalBrickHeight = staticModelPath.horizontalBrickHeight;

            if (this.rodneyPlankGroup !== null) {
                this.rodneyPlankGroup.remove();
            }
            if (this.rodneyBrickGroup !== null) {
                this.rodneyBrickGroup.remove();
            }

            pointCoOrdinates = this.chosenSet.get('coordinates');

            var startTop = (14 - pointCoOrdinates.startPoint[1]) * gridSize - (gridSize / 4),
             startLeft = (pointCoOrdinates.startPoint[0]) * gridSize - (gridSize / 3),
             endTop = startTop - (gridSize / 2),
             endLeft = (1 + pointCoOrdinates.endPoint[0]) * gridSize + (gridSize / 4) - 1;

            // '+3' and '-3' have been added to adjust padding between board and co-ordinate text
            this.$startCoordinate.css({ 'top': startTop, 'left': startLeft });
            this.$endCoordinate.css({ 'top': endTop + 3, 'left': endLeft - 3 });
            this.changeMessage('start-coordinate', 0, [pointCoOrdinates.startPoint[0], pointCoOrdinates.startPoint[1]]);
            this.changeMessage('end-coordinate', 0, [pointCoOrdinates.endPoint[0], pointCoOrdinates.endPoint[1]]);

            x1 = (pointCoOrdinates.startPoint[0] + xAxisOffset) * gridSize;
            y1 = (yAxisOffset - pointCoOrdinates.startPoint[1]) * gridSize - 1;
            x2 = (pointCoOrdinates.endPoint[0] + xAxisOffset) * gridSize;
            y2 = y1 + plankWidth;

            plankArray = this._drawEndPointsPlank(x1, y1, x2, y2, plankType);

            //            for (arrayIndex = 0; arrayIndex < 3; arrayIndex++) {
            //                groupArray[arrayIndex] = plankArray[arrayIndex];
            //            }

            for (counter = 0, arrayIndex = 0; counter < 4; counter++, arrayIndex++) {
                //this._drawBricks(x1, y2 + 1, plankType);
                //this._drawBricks(x2 - horizontalBrickWidth, y2 + 1, plankType);

                groupArray[arrayIndex] = this._drawBricks(x1, y2 + 1, plankType);
                groupArray[arrayIndex + 4] = this._drawBricks(x2 - horizontalBrickWidth, y2 + 1, plankType);
                y2 = y2 + horizontalBrickHeight;
            }

            this.rodneyPlankGroup = new paperScope.Group(plankArray);
            plankBrickGroup = new paperScope.Group(groupArray);
            this.rodneyBrickGroup = plankBrickGroup;
            this.rodneyPlankGroup.bringToFront();
            this._positionRodney(this.rodneyPlankGroup.position, 'horizontal');
        },

        /**
        * renders the plank for the vertical chop scenario
        *
        * @method _renderKickScenarioVertical
        * @param {string} plankType
        * @private
        **/
        _renderKickScenarioVertical: function (plankType) {
            var chosenSet = this.chosenSet,
                plankLength = chosenSet.get('plankLength'),
                pointCoOrdinates,
                xStartPoint, yStartPoint, xEndPoint, yEndPoint,
                x1, y1, x2, y2,
                counter, arrayIndex, groupArray = [],
                plankArray = [],
                plankBrickGroup,
                paperScope = this.scope,
                staticModelPath = this.modelPath,
                plankWidth = staticModelPath.plankWidth,
                gridSize = staticModelPath.gridSize,
                xAxisOffset = staticModelPath.xAxisOffset,
                yAxisOffset = staticModelPath.yAxisOffset;

            if (this.rodneyPlankGroup !== null) {
                this.rodneyPlankGroup.remove();
            }
            if (this.rodneyBrickGroup !== null) {
                this.rodneyBrickGroup.remove();
            }

            pointCoOrdinates = this.chosenSet.get('coordinates');

            var startTop = (14 - pointCoOrdinates.startPoint[1]) * gridSize - (gridSize / 4),
             startLeft = (pointCoOrdinates.startPoint[0] + 1.5) * gridSize,
             endTop = (14 - 1 - pointCoOrdinates.endPoint[1]) * gridSize + 10,
             endLeft = startLeft;

            this.$startCoordinate.css({ 'top': startTop, 'left': startLeft });
            this.$endCoordinate.css({ 'top': endTop, 'left': endLeft });
            this.changeMessage('start-coordinate', 0, [pointCoOrdinates.startPoint[0], pointCoOrdinates.startPoint[1]]);
            this.changeMessage('end-coordinate', 0, [pointCoOrdinates.endPoint[0], pointCoOrdinates.endPoint[1]]);

            x1 = (pointCoOrdinates.startPoint[0] + xAxisOffset) * gridSize;
            y1 = (yAxisOffset - pointCoOrdinates.startPoint[1]) * gridSize - 1;
            y2 = (yAxisOffset - pointCoOrdinates.endPoint[1]) * gridSize;
            x2 = x1 + plankWidth;

            plankArray = this._drawEndPointsPlank(x1, y1, x2, y2, plankType, true);
            for (arrayIndex = 0; arrayIndex < 3; arrayIndex++) {
                groupArray[arrayIndex] = plankArray[arrayIndex];
            }

            plankBrickGroup = new paperScope.Group(groupArray);
            this.rodneyPlankGroup = plankBrickGroup;
            this._positionRodney(plankBrickGroup.position, 'vertical', (y1 - y2));
        },
        /**
        * Positions rodney wrt the plank
        *
        * @method _positionRodney
        * @param {object} plankPosition
        * @param {string} plankType
        * @Param {number} verticalPlankLength
        **/
        _positionRodney: function (plankPosition, plankType, verticalPlankLength) {
            var top, left,
                modelPath = this.modelPath,
                rodneyHorizontalTopOffset = modelPath.rodneyHorizontalTopOffset,
                rodneyImageHeight = modelPath.rodneyImageHeight,
                rodneyImageWidth = modelPath.rodneyImageWidth;
            switch (plankType) {
                case 'horizontal':
                    top = plankPosition.y - modelPath.horizontalRodneyTopOffset;
                    left = plankPosition.x - (rodneyImageWidth / 2);
                    break;
                case 'vertical':
                    top = plankPosition.y + (verticalPlankLength / 2) - rodneyImageHeight;
                    left = plankPosition.x - 270;
                    break;
                case 'diagonal':
                    top = this.diagonalBase - 302;
                    left = plankPosition.x - (291 / 2);
                    break;
            }

            this.$rodney.css({
                top: top,
                left: left
            });
        },

        /**
        * Sets the dimensions for the bookshelf
        *
        * @method _setBookshelfDimensions
        * @param {array} segments
        * @private
        **/
        _setBookshelfDimensions: function (segments) {
            var sideLengthArray, dottedSideIndex, counter,
                temp;

            sideLengthArray = [null, 0, 0, 0, 0];

            // Sets dimension when it is the midpoint scenario
            if (segments[0] === segments[1]) {
                if (segments[0] <= 7.5 && segments[0] >= 5) {
                    sideLengthArray = [null, segments[0], segments[1], 4, 4];
                    dottedSideIndex = [1, 2];
                    //this._drawBookshelf(sideLengthArray, dottedSideIndex);
                }
                if (segments[0] <= 4 && segments[0] >= 3.5) {
                    sideLengthArray = [null, 7.5, 7.5, segments[0], segments[0]];
                    dottedSideIndex = [3, 4];

                }
            }
            // Sets dimensions when the 2 planks are inequal
            else {
                sideLengthArray = [null, 7.5, 7.5, null, null];
                dottedSideIndex = [];
                for (counter = 0; counter < 2; counter++) {
                    if (segments[counter] >= 3.5 && segments[counter] <= 4) {
                        sideLengthArray[3] = segments[counter];
                        sideLengthArray[4] = segments[counter];
                        dottedSideIndex[counter] = 3;
                        continue;
                    }
                    if (segments[counter] >= 4.5 && segments[counter] <= 5) {
                        sideLengthArray[0] = segments[counter];
                        dottedSideIndex[counter] = 0;
                        continue;
                    }
                    if (segments[counter] > 5 && segments[counter] <= 7.5) {
                        sideLengthArray[1] = segments[counter];
                        sideLengthArray[2] = segments[counter];
                        dottedSideIndex[counter] = 1;
                        continue;
                    }
                }
                temp = dottedSideIndex[0];
                dottedSideIndex[0] = dottedSideIndex[1];
                dottedSideIndex[1] = temp;
            }
            this._drawBookshelf(sideLengthArray, dottedSideIndex);
        },

        /**
        * Draw a bookshelf
        *
        * @method _drawBookshelf
        * @param {array} sideLengthArray
        * @param {array} dottedSideIndex
        * @private
        **/
        _drawBookshelf: function (sideLengthArray, dottedSideIndex) {
            var bookshelfGroup, groupBounds, bookshelfArray = [],
                x1, x2, y1, y2,
                imgLongBookGroupX,
                imgLongBookGroupY,
                imgShortBookGroupX,
                imgShortBookGroupY,
                counter,
                staticModelPath = this.modelPath,
                drawTableGroup, containerDivHeight,
                verticalDirection = staticModelPath.verticalDirection,
                horizontalDirection = staticModelPath.horizontalDirection,
                plankWidth = staticModelPath.plankWidth,
                containerHeightOffset = staticModelPath.containerHeightOffset,
                containerTopOffset = staticModelPath.containerTopOffset,
                imgLongBookGroup = staticModelPath.longBookImageCoOrdinates,
                gridSize = staticModelPath.gridSize,
                objectContainerXMidPoint = staticModelPath.objectContainerXMidPoint,
                imgShortBookGroup,
                groupHeight = 0,
                paperScope = this.scope;

            // Render plank 1
            x1 = 0;
            if (sideLengthArray[0] !== null) {
                x2 = sideLengthArray[0] * gridSize;
            }
            else {
                x2 = sideLengthArray[3] * gridSize + (2 * plankWidth);
            }
            imgLongBookGroupX = (x2 - x1) / 2;
            y1 = 0;
            y2 = plankWidth;
            groupHeight = plankWidth;
            if (dottedSideIndex.indexOf(0) === -1) {
                bookshelfArray[0] = this._drawPlank(x1, y1, x2, y2, horizontalDirection);
                bookshelfArray[0].visible = false;
            }
            else {
                bookshelfArray[0] = this._drawEmptyPlank(x1, y1, x2, y2);
            }

            // Render plank 3
            x1 = x2 - plankWidth;
            x2 = x2;
            y1 = y2;
            y2 = sideLengthArray[2] * gridSize + y1;
            groupHeight += y2 - y1;

            if (dottedSideIndex.indexOf(2) === -1) {
                bookshelfArray[2] = this._drawPlank(x1, y1, x2, y2, verticalDirection);
                bookshelfArray[2].visible = false;
            }
            else {
                bookshelfArray[2] = this._drawEmptyPlank(x1, y1, x2, y2);
            }

            // Render plank 2
            x1 = 0;
            x2 = x1 + plankWidth;
            y1 = y1;
            y2 = y2;

            if (dottedSideIndex.indexOf(1) === -1) {
                bookshelfArray[1] = this._drawPlank(x1, y1, x2, y2, verticalDirection);
                bookshelfArray[1].visible = false;
            }
            else {
                bookshelfArray[1] = this._drawEmptyPlank(x1, y1, x2, y2);
            }

            // Render plank 4
            x1 = x2;
            if (sideLengthArray[0] !== null) {
                x2 = sideLengthArray[0] * gridSize - (2 * plankWidth) + x1;
            }
            else {
                x2 = sideLengthArray[3] * gridSize + x1;
            }
            y1 = 2 * gridSize + plankWidth;
            y2 = y1 + plankWidth;

            imgLongBookGroupY = y1 - 35;
            if (dottedSideIndex.indexOf(3) === -1) {
                bookshelfArray[3] = this._drawPlank(x1, y1, x2, y2, horizontalDirection);
                bookshelfArray[3].visible = false;
            }
            else {
                bookshelfArray[3] = this._drawEmptyPlank(x1, y1, x2, y2);
            }

            // Render plank 5
            x1 = x1;
            x2 = x2;
            y1 = 4 * gridSize + plankWidth;
            y2 = y1 + plankWidth;

            imgShortBookGroupX = imgLongBookGroupX;
            imgShortBookGroupY = y1 - 33;
            if (dottedSideIndex.indexOf(4) === -1) {
                bookshelfArray[4] = this._drawPlank(x1, y1, x2, y2, horizontalDirection);
                bookshelfArray[4].visible = false;
            }
            else {
                bookshelfArray[4] = this._drawEmptyPlank(x1, y1, x2, y2);
            }

            // Add book rasters
            bookshelfArray[5] = new paperScope.Raster({
                source: this.booksLongBase64,
                position: { x: imgLongBookGroupX, y: imgLongBookGroupY }
            });
            //            bookshelfArray[6] = new paperScope.Raster({
            //                source: this.booksShortBase64,
            //                position: { x: imgShortBookGroupX, y: imgShortBookGroupY }
            //            });
            var x = imgShortBookGroupX;
            var y = imgShortBookGroupY;

            bookshelfGroup = new paperScope.Group(bookshelfArray);
            this.$el.find('.object-container').css({
                'height': groupHeight + containerHeightOffset
            });
            containerDivHeight = this._adjustObjectContainerDivHeight();
            for (counter = 0; counter < 5; counter++) {
                bookshelfArray[counter].visible = true;
            }

            bookshelfGroup.position = new paperScope.Point(objectContainerXMidPoint, (containerDivHeight + 80 + (groupHeight) / 2));
            var y = bookshelfArray[4].position.y - 66;
            y = Math.floor(y);
            //var y = imgShortBookGroupY;
            this.$booksShort.css({
                'top': y - 8,
                'left': objectContainerXMidPoint - 55
            });
            var y = bookshelfArray[3].position.y - 71;
            y = Math.floor(y);
            this.$booksLong.css({
                'top': y - 8,
                'left': objectContainerXMidPoint - 65
            });
            this.$booksShort.show();
            this.$booksLong.show();
            this.currentPaperGroup = bookshelfGroup;
            this.dottedSideIndex = dottedSideIndex;
            this._adjustObjectContainerDivHeight();
        },



        /**
        * Draw a trophy stand
        *
        * @method _drawTrophyStand
        * @param {array} sideLengthArray
        * @param {array} dottedSideIndex
        * @private
        **/
        _drawTrophyStand: function (sideLengthArray, dottedSideIndex) {

            var tableGroup = [],
                staticModelPath = this.modelPath,
                drawTableGroup, trophyRaster, groupPositionY, renderedTableGroup,
                x1, x2, y1, y2, imgX, imgY, containerDivHeight, counter,
                verticalDirection = staticModelPath.verticalDirection,
                horizontalDirection = staticModelPath.horizontalDirection,
                plankWidth = staticModelPath.plankWidth,
                containerHeightOffset = staticModelPath.containerHeightOffset,
                containerTopOffset = staticModelPath.containerTopOffset,
                gridSize = staticModelPath.gridSize,
                objectContainerXMidPoint = staticModelPath.objectContainerXMidPoint,
                groupHeight = 0,
                paperScope = this.scope;

            // Render plank 1
            x1 = 0;
            y1 = staticModelPath.trophyCoOrdinates[1] * 2;
            x2 = sideLengthArray[0] * gridSize;
            x2 = (Math.round(x2 * 10)) / 10;
            y2 = y1 + plankWidth;
            groupHeight += y2;
            imgX = x2 / 2;
            imgY = staticModelPath.trophyCoOrdinates[1];
            if (dottedSideIndex.indexOf(0) === -1) {
                tableGroup[0] = this._drawPlank(x1, y1, x2, y2, horizontalDirection);
                tableGroup[0].visible = false;

            }
            else {
                tableGroup[0] = this._drawEmptyPlank(x1, y1, x2, y2, horizontalDirection);
            }

            // Render plank 3
            x1 = x2 - plankWidth;
            y1 = y2 - 1;
            x2 = x2;
            y2 = sideLengthArray[2] * gridSize + y1;
            y2 = (Math.round(y2 * 10)) / 10;
            groupHeight += y2 - y1;
            if (dottedSideIndex.indexOf(2) === -1) {
                tableGroup[2] = this._drawPlank(x1, y1, x2, y2, verticalDirection);
                tableGroup[2].visible = false;
            }
            else {
                tableGroup[2] = this._drawEmptyPlank(x1, y1, x2, y2, verticalDirection);
            }

            // Render plank 2
            x1 = 0;
            y1 = y1;
            x2 = plankWidth;
            y2 = sideLengthArray[1] * gridSize + y1;
            y2 = (Math.round(y2 * 10)) / 10;
            if (dottedSideIndex.indexOf(1) === -1) {
                tableGroup[1] = this._drawPlank(x1, y1, x2, y2, verticalDirection);
                tableGroup[1].visible = false;
            }
            else {
                tableGroup[1] = this._drawEmptyPlank(x1, y1, x2, y2, verticalDirection);
            }

            // Trophy Raster
            trophyRaster = new paperScope.Raster({
                source: this.trophyBase64,
                position: { x: imgX, y: imgY }
            });
            drawTableGroup = new paperScope.Group(tableGroup);

            this.$el.find('.object-container').css({
                'height': groupHeight + containerHeightOffset
            });
            containerDivHeight = this._adjustObjectContainerDivHeight();
            groupPositionY = containerDivHeight + containerTopOffset + (groupHeight / 2) + staticModelPath.trophyCoOrdinates[1];
            drawTableGroup.position = new paperScope.Point(objectContainerXMidPoint, groupPositionY);
            for (counter = 0; counter < 3; counter++) {
                tableGroup[counter].visible = true;
            }

            trophyRaster.position.y = groupPositionY - (staticModelPath.trophyCoOrdinates[1]) - (plankWidth + (y2 - y1) / 2);
            if (dottedSideIndex.indexOf(0) === -1) {
                trophyRaster.position.y = trophyRaster.position.y + 12;
                drawTableGroup.position.y = drawTableGroup.position.y + 10;
            }
            else {
                trophyRaster.position.y = trophyRaster.position.y + 12;
                drawTableGroup.position.y = drawTableGroup.position.y + 3;
            }

            trophyRaster.position.x = objectContainerXMidPoint;

            renderedTableGroup = new paperScope.Group([drawTableGroup, trophyRaster]);

            this.currentPaperGroup = renderedTableGroup;
            this.dottedSideIndex = dottedSideIndex;
            //            this._adjustObjectContainerDivHeight();
        },

        /**
        * Sets the dimensions for the bag stand
        *
        * @method _setBagStandDimensions
        * @param {array} segments
        * @private
        **/
        _setBagStandDimensions: function (segments) {
            var sideLengthArray, dottedSideIndex;
            // Sets dimensions if it is Mid Point scenario
            if (segments[0] === segments[1]) {
                sideLengthArray = [segments[0], 7, segments[1]];
                dottedSideIndex = [0, 2];
            }
            // Sets dimensions if the planks are inequal
            else {
                sideLengthArray = [segments[0], segments[1], segments[0]];
                dottedSideIndex = [1, 0];
            }
            this._drawBagStand(sideLengthArray, dottedSideIndex);
        },

        /**
        * _drawBagStand
        * draw a punching bag stand
        *
        * @method _drawBagStand
        * @param {array} sideLengthArray
        * @param {array} dottedSideIndex
        * @private
        **/
        _drawBagStand: function (sideLengthArray, dottedSideIndex) {
            var paperScope = this.scope,
                punchingBagStandArray = [],
                punchingBagStandGroup = null, x1, x2, y1, y2,
                staticModelPath = this.modelPath,
                imgX = staticModelPath.punchingBagCoOrdinates[0],
                imgY = staticModelPath.punchingBagCoOrdinates[1],
                verticalDirection = staticModelPath.verticalDirection,
                horizontalDirection = staticModelPath.horizontalDirection,
                plankWidth = staticModelPath.plankWidth,
                containerHeightOffset = staticModelPath.containerHeightOffset,
                containerTopOffset = staticModelPath.containerTopOffset,
                gridSize = staticModelPath.gridSize,
                objectContainerXMidPoint = staticModelPath.objectContainerXMidPoint,
                groupHeight = 0,
                counter, containerDivHeight;

            // Plank 1
            x1 = 0;
            y1 = 0;
            x2 = sideLengthArray[0] * gridSize;
            x2 = (Math.round(x2 * 10)) / 10;
            y2 = plankWidth;
            groupHeight += y2;
            if (dottedSideIndex.indexOf(0) === -1) {
                punchingBagStandArray[0] = this._drawPlank(x1, y1, x2, y2, horizontalDirection);
                punchingBagStandArray[0].visible = false;
            }
            else {
                punchingBagStandArray[0] = this._drawEmptyPlank(x1, y1, x2, y2);
            }

            // Plank 3
            x1 = x2 - plankWidth;
            y1 = y2 - 1;
            x2 = x2;
            y2 = sideLengthArray[1] * gridSize + plankWidth;
            y2 = (Math.round(y2 * 10)) / 10;
            groupHeight += y2 - y1;
            if (dottedSideIndex.indexOf(1) === -1) {
                punchingBagStandArray[1] = this._drawPlank(x1, y1, x2, y2, verticalDirection);
                punchingBagStandArray[1].visible = false;
            }
            else {
                punchingBagStandArray[1] = this._drawEmptyPlank(x1, y1, x2, y2);
            }

            // Plank 2
            x1 = 0;
            y1 = y2;
            x2 = sideLengthArray[2] * gridSize;
            x2 = (Math.round(x2 * 10)) / 10;
            y2 = y1 + plankWidth;
            groupHeight += plankWidth - 1;
            if (dottedSideIndex.indexOf(2) === -1) {
                punchingBagStandArray[2] = this._drawPlank(x1, y1, x2, y2, horizontalDirection);
                punchingBagStandArray[2].visible = false;
            }
            else {
                punchingBagStandArray[2] = this._drawEmptyPlank(x1, y1, x2, y2);
            }

            // Punching Bag raster
            punchingBagStandArray[3] = new paperScope.Raster({
                source: this.punchingBagBase64,
                position: { x: imgX, y: imgY }
            });
            punchingBagStandGroup = new paperScope.Group(punchingBagStandArray);
            this.$el.find('.object-container').css({
                'height': groupHeight + containerHeightOffset
            });
            containerDivHeight = this._adjustObjectContainerDivHeight();
            for (counter = 0; counter < 3; counter++) {
                punchingBagStandArray[counter].visible = true;
            }
            punchingBagStandGroup.position = new paperScope.Point(objectContainerXMidPoint, (containerDivHeight + containerTopOffset + (groupHeight) / 2));

            this.dottedSideIndex = dottedSideIndex;
            this.currentPaperGroup = punchingBagStandGroup;
        },

        /**
        * Adjusts the height for the object container div
        *
        * @method _adjustObjectContainerDivHeight
        * @private
        **/
        _adjustObjectContainerDivHeight: function () {
            var $objectContainerDiv = this.$el.find('.object-container'),
                buttonHeight = 40,
                buttonPaddingTop = 20,
                containerHeight = parseInt($objectContainerDiv.css('height'), 10),
                xAxisPosition = this.modelPath.Points.xAxisCenterPoints[1],
                containerTopPosition = ((xAxisPosition - buttonHeight - buttonPaddingTop - containerHeight) / 2 + buttonHeight + buttonPaddingTop - 4);

            $objectContainerDiv.css({
                'top': containerTopPosition
            });

            return containerTopPosition
        },

        /**
        * Displays feedback planks after they are placed on the object
        *
        * @method _displayFeedbackPlanks
        * @private
        **/
        _displayFeedbackPlanks: function (plankLength, result) {
            var paperGroupChildren = this.currentPaperGroup.children,
                dottedSideIndex = this.dottedSideIndex,
                segment = [],
                feedbackPlankGroup = [],
                feedbackPlank = [],
                feedbackGlow = [],
                feedbackShadow = [],
                onFrameCounter,
                plankHeight, plankWidth, counter, positionOffset, self = this,
                x1, x2, y1, y2, type,
                scope = this.scope;


            if (this.currentObject === 'trophy-stand') {
                paperGroupChildren = paperGroupChildren[0].children;
            }

            segment[1] = paperGroupChildren[dottedSideIndex[1]];
            for (counter = 0; counter < 2; counter++) {
                segment[counter] = paperGroupChildren[dottedSideIndex[counter]];
                plankHeight = segment[counter].bounds.height;
                plankWidth = segment[counter].bounds.width;
                if (plankHeight > plankWidth) {
                    x1 = 0;
                    y1 = 0;
                    x2 = 16;
                    y2 = plankLength[counter] * 42 - 1;
                    type = 'vertical';
                }
                else {
                    x1 = 0;
                    y1 = 0;
                    x2 = plankLength[counter] * 42;
                    y2 = 16;
                    type = 'horizontal';
                }
                feedbackPlank[counter] = this._drawPlank(x1, y1, x2, y2, type);
                feedbackPlank[counter].opacity = 0;
                feedbackPlank[counter].position = segment[counter].position;
                if (result === false) {
                    switch (type) {
                        case 'vertical':
                            positionOffset = ((segment[counter].bounds.height - y2) / 2);
                            feedbackPlank[counter].position.y = feedbackPlank[counter].position.y - positionOffset + 1;
                            break;
                        case 'horizontal':
                            positionOffset = (segment[counter].bounds.width - x2) / 2;
                            feedbackPlank[counter].position.x = feedbackPlank[counter].position.x - positionOffset;
                    }
                    var x = new this.scope.Rectangle({ x: x1, y: y1 }, { x: x2, y: y2 });

                    feedbackShadow[counter] = new this.scope.Path.Rectangle(x);
                    feedbackGlow[counter] = new this.scope.Path.Rectangle(x);
                    feedbackGlow[counter].fillColor = new scope.Color(1, 0, 0);
                    feedbackShadow[counter].fillColor = new scope.Color(1, 1, 1);
                    feedbackGlow[counter].opacity = 0;
                    feedbackShadow[counter].visible = false;
                    feedbackShadow[counter].shadowColor = new scope.Color(1, 0, 0);
                    feedbackShadow[counter].shadowBlur = 10;
                    //feedbackGlow[0].shadowColor.alpha = 0.68;
                    feedbackShadow[counter].position = feedbackPlank[counter].position;
                    feedbackGlow[counter].position = feedbackPlank[counter].position;
                    //feedbackShadow[counter].sendToBack();
                    feedbackShadow[counter].shadowOffset = new scope.Point(0, 0);
                }
            }
            scope.view.onFrame = function () {

                if (feedbackPlank[1]) {
                    feedbackPlank[1].opacity += 0.05;
                }
                if (feedbackPlank[0]) {
                    feedbackPlank[0].opacity += 0.05;
                }

                if (feedbackPlank[0] && feedbackPlank[0].opacity > 0.95) {
                    scope.view.onFrame = null;
                    self.trigger('feedback-animation-ends');
                    if (result === true) {
                        paperGroupChildren[dottedSideIndex[0]].visible = false;
                        paperGroupChildren[dottedSideIndex[1]].visible = false;
                        feedbackPlankGroup.push(feedbackPlank[0]);
                        feedbackPlankGroup.push(feedbackPlank[1]);
                    }
                    if (feedbackGlow !== [] && feedbackGlow[0] && feedbackGlow[1]) {
                        for (onFrameCounter = 1; onFrameCounter >= 0; onFrameCounter--) {
                            feedbackShadow[onFrameCounter].visible = true;
                            feedbackPlankGroup.push(feedbackShadow[onFrameCounter]);
                            feedbackPlankGroup.push(feedbackPlank[onFrameCounter]);
                            feedbackPlankGroup.push(feedbackGlow[onFrameCounter]);
                            feedbackShadow[onFrameCounter].sendToBack();
                            feedbackPlankGroup[onFrameCounter].bringToFront()
                            feedbackGlow[onFrameCounter].opacity = 0.3;
                            feedbackGlow[onFrameCounter].bringToFront();
                        }

                    }
                    self.feedbackPlankGroup = new scope.Group(feedbackPlankGroup);
                }
            }
        },

        /**
        * Draws an empty plank which is to be filled in
        *
        * @method _drawEmptyPlank
        * @param {number} x1
        * @param {number} y1
        * @param {number} x2
        * @param {number} y2
        * @private
        **/
        _drawEmptyPlank: function (x1, y1, x2, y2) {
            var paperScope = this.scope;
            var emptyPlank = new paperScope.Rectangle({ x: x1, y: y1 }, { x: x2, y: y2 });
            var emptyPlankPath = new paperScope.Path.Rectangle(emptyPlank);
            emptyPlankPath.strokeColor = this.modelPath.color.plankBorder;
            emptyPlankPath.dashArray = [1, 2];
            return emptyPlankPath;
        },

        // ----------------------------------------------------------------------------------------------------------------------------------------------

        /**
        * Renders the view of Explore tab
        *
        * @method render
        **/
        render: function () {
            var scope = new paper.PaperScope(), self = this,
                canvasId = self.idPrefix + 'my-canvas',
                model = self.model,
                $canvasCont = this.$('.canvas-container');

            // Append canvas and set up scope
            $('<canvas height=' + model.get('canvasHeight') + ' width=' + model.get('canvasWidth') + '>').attr({ id: canvasId/*, height: model.get('canvasHeight'), width: model.get('canvasWidth') */ }).appendTo($canvasCont);
            scope.setup(canvasId);
            self.scope = scope;

            self.$el.css({
                'background-image': 'url("' + self.filePath.getImagePath('explore-grid') + '")'
            });

            self._drawAxis();
            self._renderButtonsAndInputBox();

            self.loadScreen('buttons-screen');
            self._renderToolTip();
            self._setBrokenPlankGroup();


        },

        /**
        * Renders buttons and input boxes
        *
        * @method _renderButtonsAndInputBox
        * @private
        **/
        _renderButtonsAndInputBox: function () {

            var self = this, globalInputBox = MathInteractives.global.Theme2.InputBox, leftInputEvent, rightInputEvent, accText,
                globalButton = MathInteractives.global.Theme2.Button,
                InputBox = MathInteractives.Common.Components.Theme2.Views.InputBox,
                filePath = self.filePath,
                idPrefix = self.idPrefix,
                manager = self.manager,
                player = self.player;



            var regex = new RegExp('^[0-9]{0,2}\\.[0-9]?$|^[0-9]{0,2}$'); // Input can be 2 digit whole number or followed by decimal point and 1 digit 
            var inputProps = {
                filePath: filePath,
                manager: manager,
                player: player,
                idPrefix: idPrefix,
                defaultValue: '',
                height: 42,
                width: 58,
                inputType: InputBox.INPUT_TYPE_CUSTOM,
                maxCharLength: 4,
                precision: 1,
                customClass: 'line-stretcher-coordinate-input-box'
            };


            // Render input boxes and bind change event
            inputProps.regexString = regex;
            inputProps.containerId = idPrefix + 'x-input-box';
            inputProps.defaultTabIndexToInputBox = false

            leftInputEvent = idPrefix + 'x-input-box' + InputBox.CUSTOM_CHANGE_EVENT_NAME;
            self.leftInputBoxView = globalInputBox.createInputBox(inputProps);

            self.leftInputBoxView.on(leftInputEvent, function () {
                self._enableDisableChopButton();
                self._setScreenDirtyFlag();

                if (self.leftInputBoxView.getCurrentInputValue() !== null) {
                    this.changeAccMessage('x-input-boxtextbox', 1, [self.leftInputBoxView.getCurrentInputValue()]);
                }
            });

            self.leftInputBoxView.on(inputProps.containerId + InputBox.KEYUP_EVENT_NAME, function (event) {
                if (event.keyCode === 13 || event.which === 13) {
                    this.setAccMessage('x-input-boxtextbox', ' ');
                    self._showToolTip();
                    this.$(' input').blur();
                }
            })

            inputProps.containerId = idPrefix + 'y-input-box';
            rightInputEvent = idPrefix + 'y-input-box' + InputBox.CUSTOM_CHANGE_EVENT_NAME;
            self.rightInputBoxView = globalInputBox.createInputBox(inputProps);

            self.loadScreen('input-box-screen');

            self.rightInputBoxView.on(rightInputEvent, function () {
                self._enableDisableChopButton();
                self._setScreenDirtyFlag();

                if (self.rightInputBoxView.getCurrentInputValue() !== null) {
                    this.changeAccMessage('y-input-boxtextbox', 1, [self.rightInputBoxView.getCurrentInputValue()]);
                }
            });

            self.rightInputBoxView.on(inputProps.containerId + InputBox.KEYUP_EVENT_NAME, function (event) {

                if (event.keyCode === 13 || event.which === 13) {
                    //                    this.setAccMessage('y-input-boxtextbox', this.getAccMessage('y-input-boxtextbox', 4));
                    this.setAccMessage('y-input-boxtextbox', ' ');
                    self._showToolTip();
                    this.$('input').blur();
                }

            })

            var buttonProps = {
                idPrefix: idPrefix,
                player: player,
                manager: manager,
                path: filePath,
                colorType: MathInteractives.global.Theme2.Button.COLORTYPE.BLUE
            };

            buttonProps.data = {
                id: idPrefix + 'chop-button',
                text: self.getMessage('chop-button', 0),
                type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                baseClass: 'custom-black-button'
            }
            self.chopButtonView = new globalButton.generateButton(buttonProps);

            buttonProps.data = {
                id: idPrefix + 'see-math-button',
                text: self.getMessage('see-math-button', 0),
                type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                baseClass: 'custom-black-button'
            };
            self.seeMathButtonView = new globalButton.generateButton(buttonProps);

            buttonProps.data = {
                id: idPrefix + 'kick-button',
                text: self.getMessage('kick-button', 0),
                type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                baseClass: 'custom-black-button'
            };
            self.kickButtonView = new globalButton.generateButton(buttonProps);

            //            buttonProps.data = {
            //                id: idPrefix + 'try-another-button',
            //                text: self.getMessage('try-another', 0),
            //                type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
            //                baseClass: 'custom-black-button'
            //            };
            //self.tryAnotherButtonview = new globalButton.generateButton(buttonProps);

            buttonProps.data = {
                id: idPrefix + 'try-again',
                text: self.getMessage('try-again', 0),
                type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                baseClass: 'custom-black-button'
            };
            self.tryAgainButtonview = new globalButton.generateButton(buttonProps);

        },


        /**
        * Draws the axis lines
        *
        * @method _drawAxis
        * @private
        **/
        _drawAxis: function () {
            this.scope.activate();
            var xtriangle, ytriangle, scope = this.scope,
                modelPath = this.modelPath,
                color = modelPath.color,
                points = modelPath.Points,
                strokeWidth = modelPath.strokeWidth,
                xAxis = new scope.Path.Line({
                    x: points.xAxisStartPoints[0],
                    y: points.xAxisStartPoints[1]
                }, {
                    x: points.xAxisEndPoints[0],
                    y: points.xAxisEndPoints[1]
                }),

                yAxis = new scope.Path.Line({
                    x: points.yAxisStartPoints[0],
                    y: points.yAxisStartPoints[1]
                }, {
                    x: points.yAxisEndPoints[0],
                    y: points.yAxisEndPoints[1]
                });

            // Draw axis arrows
            xAxis.strokeColor = color.axis;
            xAxis.strokeWidth = strokeWidth.axisStrokeWidth;
            yAxis.strokeColor = color.axis;
            yAxis.strokeWidth = strokeWidth.axisStrokeWidth;

            ytriangle = new scope.Path();
            ytriangle.add({ x: -(points.axisTriangleWidth / 2), y: 0 });
            ytriangle.add({ x: points.axisTriangleWidth / 2, y: 0 });
            ytriangle.add({ x: 0, y: -points.axisTriangleHeight });
            ytriangle.closed = true;
            ytriangle.position = [points.yAxisArrowCenterPoints[0], points.yAxisArrowCenterPoints[1]];
            ytriangle.strokeColor = color.axis;
            ytriangle.fillColor = color.axis;

            xtriangle = ytriangle.clone();
            xtriangle.strokeColor = color.axis;
            xtriangle.rotate(90);
            xtriangle.position = [points.xAxisArrowCenterPoints[0], points.xAxisArrowCenterPoints[1]];
            scope.view.draw();

            this._axisGroup = new scope.Group([xAxis, yAxis, ytriangle, xtriangle]);
        },

        /**
        * Cache neccessary dom elements for futher reference.
        * @method _cacheDomElements
        */
        _cacheDomElements: function () {
            var self = this;
            self.$yourAnswer = self.$('.your-answer');
            self.$plankLeftCordinate = self.$('.plank-left-cordinate');
            self.$plankRightCordinate = self.$('.plank-right-cordinate');
            self.$feedbackRatioDiv = self.$('.feedback-ratio-div');
            self.$yourAnswerBullet = self.$('.your-answer-bullet');
            self.$yourAnswerContainer = self.$('.your-answer-container');
            self.$axisLabel = self.$('.axis-label');
            self.$objectContainer = self.$('.object-container');
            self.$feedbackInstructionTryAgain = self.$('.feedback-instruction-try-again');
            self.$feedbackInstructionHeadingText = self.$('.feedback-instruction-heading-text');
            self.$inputBoxContainer = self.$('.input-box-container');
            self.$rodney = self.$('.child-cont');
            self.$answerFt1 = self.$('.answerFt1');
            self.$answerFt2 = self.$('.answerFt2');
            self.$feedbackAnswers = self.$('.feedback-answers');
            self.$startCoordinate = self.$('.start-coordinate');
            self.$endCoordinate = self.$('.end-coordinate');
            self.$exploreTabCoordinates = self.$('.explore-tab-coordinates');
            self.$tryAnotherButton = self.$('.try-another-button');
            self.$chopButton = self.$('.chop-button');
            self.$seeMathButton = self.$('.see-math-button');
            self.$tryAgainButton = self.$('.try-again');
            self.$kickButton = self.$('.kick-button');
            self.$booksShort = self.$('.book-container-2');
            self.$booksLong = self.$('.book-container-1');
            self.$booksShort.hide();
            self.$booksLong.hide();
        },

        /**
        * Generates tooltips to be shown when input is validated
        *
        * @method _renderToolTip
        * @private
        **/
        _renderToolTip: function () {
            var toolTip = MathInteractives.global.Theme2.Tooltip, self = this,
                toolTipPath = MathInteractives.Common.Components.Theme2.Views.Tooltip,
                leftInputValue = self.leftInputBoxView.getCurrentInputValue(),
                rightInputValue = self.rightInputBoxView.getCurrentInputValue(),
                toolTipProps = {
                    _player: self.player,
                    idPrefix: this.idPrefix,
                    manager: self.manager,
                    path: self.filePath,
                    borderColor: '1 px solid #A16106',
                    backgroundColor: '#FFD08E',
                    textColor: '#7C5218',
                    type: toolTipPath.TYPE.FORM_VALIDATION,
                    isTts: false
                };


            toolTipProps.id = self.idPrefix + 'left-input-tooltip';
            toolTipProps.elementEl = self.idPrefix + 'x-input-box';
            toolTipProps.text = self.getMessage('tool-tip-text', 0);
            toolTipProps.arrowType = toolTipPath.ARROW_TYPE.TOP_MIDDLE;
            toolTipProps.tabIndex = 524;
            self.leftInputToolTip = toolTip.generateTooltip(toolTipProps);

            toolTipProps.id = self.idPrefix + 'right-input-tooltip';
            toolTipProps.elementEl = self.idPrefix + 'y-input-box';
            toolTipProps.text = self.getMessage('tool-tip-text', 1);
            toolTipProps.arrowType = toolTipPath.ARROW_TYPE.TOP_MIDDLE;
            toolTipProps.tabIndex = 535;
            self.rightInputToolTip = toolTip.generateTooltip(toolTipProps);

            toolTipProps.containerWidth = 302;
            toolTipProps.id = self.idPrefix + 'error-tooltip';
            toolTipProps.elementEl = self.idPrefix + 'input-box-container';
            toolTipProps.text = self.getMessage('tool-tip-text', 2);
            toolTipProps.isArrow = false;
            toolTipProps.tabIndex = 526;
            self.errorToolTip = toolTip.generateTooltip(toolTipProps);
        },

        /**
        * Stores reference to image paths
        *
        * @method _generateImageBase64
        * @private
        **/
        _generateImageBase64: function () {
            this.horizontalPlankBase64 = this.getSpritePartBase64URL('raster-sprite', 0, 344, 928, 14);
            this.verticalPlankBase64 = this.getSpritePartBase64URL('raster-sprite', 0, 368, 14, 599);
            this.trophyBase64 = this.getSpritePartBase64URL('raster-sprite', 0, 224, 64, 110);
            this.punchingBagBase64 = this.getSpritePartBase64URL('raster-sprite', 0, 0, 41, 57);
            //this.booksShortBase64 = this.filePath.getImageBase64('book-group'); //this.getSpritePartBase64URL('raster-sprite', 0, 148, 111, 66);
            //this.booksLongBase64 = this.getSpritePartBase64URL('raster-sprite', 0, 67, 130, 71);
            this.diagonalPlankBase64 = this.getSpritePartBase64URL('raster-sprite', 0, 977, 928, 599);
            var url = this.getImagePath('raster-sprite');
            this.$booksShort.css({
                'background-image': 'url(' + url + ')',
                'background-position': '0px -147px'
            })
            this.$booksLong.css({
                'background-image': 'url(' + url + ')',
                'background-position': '0px -66px'

            })
        },

        /**
        * Callback on Try Another pop-up
        *
        * @method _tryAnotherBoard
        * @param {Object} Response of confirmation pop-up
        * @private
        **/
        _tryAnotherBoard: function (response) {
            MathInteractives.global.SpeechStream.stopReading();

            var self = this;

            self.leftInputToolTip.hideTooltip();
            self.rightInputToolTip.hideTooltip();
            self.errorToolTip.hideTooltip();
            if (response.isPositive || response === true) {

                self._renderNewScenario(false);
                self._hideOnRender();
                self.$rodney.show();
                self.$objectContainer.show();
                self._hideFeedbackScreen();
                self._resetClippedPathPosition();
                self._setBrokenPlankGroup();
                this._changeText();
                self.setFocus('canvas-activity-area');
            }
            else {
                self.setFocus('explorer-direction-text-direction-text-buttonholder');
            }
            if (self.leftInputBoxView.getCurrentInputValue() !== null) {
                this.changeAccMessage('x-input-boxtextbox', 1, [self.leftInputBoxView.getCurrentInputValue()]);
            }
            else {
                this.changeAccMessage('x-input-boxtextbox', 0, [self.leftInputBoxView.getCurrentInputValue()]);
            }
            if (self.rightInputBoxView.getCurrentInputValue() !== null) {
                this.changeAccMessage('y-input-boxtextbox', 1, [self.rightInputBoxView.getCurrentInputValue()]);
            }
            else {
                this.changeAccMessage('y-input-boxtextbox', 0, [self.rightInputBoxView.getCurrentInputValue()]);
            }
        },

        _hideFeedbackScreen: function () {
            var self = this;
            self.$feedbackInstructionTryAgain.hide();
            self.$yourAnswerContainer.hide();
            self.$axisLabel.show();
            self.$feedbackAnswers.hide();
            self.$inputBoxContainer.show();
            self.$exploreTabCoordinates.show();
            self.$rodney.show();
            self.seeMathButtonView.hideButton();
            self.$objectContainer.show();
            if (self.feedbackGroup !== null) {
                self.feedbackGroup.remove();
            }
            if (self.feedbackGroup !== null) {
                self.feedbackGroup.remove();
            }

            if (this.feedbackPlankGroup !== null) {
                this.feedbackPlankGroup.remove();
                paper.view.draw();
            }
            self._axisGroup.visible = true;
            self.leftInputBoxView.clearInputBox();
            self.rightInputBoxView.clearInputBox();
            self._hideOnRender();
        },

        /**
        * Calls to renders instructions and the objects
        *
        * @method _renderNewScenario
        * @param {Boolean} isFirstScenario
        * @private
        **/
        _renderNewScenario: function (isFirstScenario) {
            this._renderObject(isFirstScenario);
            this._changeInstructionText(this.currentObject, this.chosenSet.get('isMidPoint'), this.chosenSet.get('ratio'));
        },

        _renderOnTryAgain: function () {
            MathInteractives.global.SpeechStream.stopReading();
            var self = this;
            this._resetClippedPathPosition();
            this._setBrokenPlankGroup();
            this._hideFeedbackScreen();
            this._renderObject(false, true);
            this.changeAccMessage('x-input-boxtextbox', 0, [self.leftInputBoxView.getCurrentInputValue()]);
            this.setFocus('x-input-boxtextbox');
            this.changeAccMessage('y-input-boxtextbox', 0, [self.rightInputBoxView.getCurrentInputValue()]);
            this.changeAccMessage('canvas-activity-area', 0, this.inputBoxCanvasArea);

        },

        /**
        * Calls to render object on right, show Chop/ Kick button
        * change image of Rodney
        *
        * @method _renderObject
        * @param {Boolean} isFirstScenario
        * @private
        **/
        _renderObject: function (isFirstScenario, isTryAgain) {
            this.scope.activate();
            if (isTryAgain !== true) {
                var modelObject = this.model,
                validItems = modelObject.ValidItems,
                modelsArray, modelsArrayLength, possibleObjectsArray, possibleObjectsArrayLength,
                ratio, segments, plankType, initialRodney, randomIndex, startPos,
                randomObj, // object to be drawn
                randomValidObject; // randomly chosen model from the collection

                if (this.currentPaperGroup !== null) {
                    this.currentPaperGroup.remove();
                    this.$booksShort.hide();
                    this.$booksLong.hide();
                }

                if (isFirstScenario === true) {
                    modelsArray = validItems.filter(function (objectModel) {
                        return (objectModel.get('isMidPoint') === true && objectModel.get('type') !== 'diagonal');
                    });

                    randomIndex = modelObject.getRandomInt(0, modelsArray.length - 1);
                }
                else {
                    modelsArray = validItems;
                    randomIndex = this.counter;
                    this.counter++;

                    if (this.counter === validItems.length) {
                        this.counter = 0;
                    }
                }

                // modelsArray = validItems;

                if (this.feedbackPlankGroup !== null) {
                    this.feedbackPlankGroup.remove();
                    paper.view.draw();
                }

                //                });
                randomValidObject = modelsArray[randomIndex];
                this.chosenSet = randomValidObject;

                plankType = randomValidObject.get('type');
                this.type = plankType;
            }
            var chosenSet = this.chosenSet,
                    coordinates = chosenSet.get('coordinates'),
                    startPoint = coordinates.startPoint,
                    endPoint = coordinates.endPoint,
                    type = chosenSet.get('type');
            switch (type) {
                case 'horizontal':
                    this._renderChopScenarioHorizontal(type);
                    this.chopButtonView.showButton();
                    this.kickButtonView.hideButton();
                    initialRodney = this.filePath.getImagePath('horizontal-sequence-sprite');
                    startPos = this.horizontalChopImgs.startPos
                    break;
                case 'vertical':
                    this._renderKickScenarioVertical(type);
                    this.chopButtonView.hideButton();
                    this.kickButtonView.showButton();
                    initialRodney = this.filePath.getImagePath('vertical-sequence-sprite');
                    startPos = this._kickImages.kickInitialPos;
                    break;
                case 'diagonal':
                    this._renderChopScenarioDiagonal(type);
                    this.chopButtonView.showButton();
                    this.kickButtonView.hideButton();
                    initialRodney = this.filePath.getImagePath('diagonal-sequence-sprite');
                    startPos = this.horizontalChopImgs.startPos;
                    break;
            }

            this.$rodney.css('background-image', 'url(' + initialRodney + ')');
            this.$rodney.css('background-position', startPos);
            if (isTryAgain !== true) {
                possibleObjectsArray = randomValidObject.get('possibleObjects');
                possibleObjectsArrayLength = possibleObjectsArray.length;
                randomObj = possibleObjectsArray[modelObject.getRandomInt(0, (possibleObjectsArrayLength - 1))];

                this.isScreenDirty = false;
                this.currentObject = randomObj;
                this.loadScreen('object-acc-text');

                if (this.currentObject === "bag-stand") {
                    this.currentObjectMessage = this.getAccMessage('object-text', 0);
                }
                else if (this.currentObject === "trophy-stand") {
                    this.currentObjectMessage = this.getAccMessage('object-text', 1);
                }
                else {
                    this.currentObjectMessage = this.getAccMessage('object-text', 2);
                }

                this.type = plankType;
                this.segments = randomValidObject.get('segments');

                //  console.log(this.chosenSet.attributes)
            }
            else {
                this.isScreenDirty = true;
            }
            switch (this.currentObject) {

                case 'trophy-stand':
                    this._setTrophyStandDimensions(this.segments);
                    this.changeMessage('object-name-text', 0);
                    break;
                case 'book-shelf':
                    this._setBookshelfDimensions(this.segments);
                    this.changeMessage('object-name-text', 2);
                    break;
                case 'bag-stand':
                    this._setBagStandDimensions(this.segments);
                    this.changeMessage('object-name-text', 1);
                    break;
            }

        },

        /**
        * Sets the dimensions for the trophy stand
        *
        * @method _setTrophyStandDimensions
        * @param {array} segments
        * @private
        **/
        _setTrophyStandDimensions: function (segments) {
            var sideLengthArray, dottedSideIndex;

            // Sets dimensions for mid point scenario
            if (segments[0] === segments[1]) {
                sideLengthArray = [4, segments[0], segments[1]];
                dottedSideIndex = [1, 2];
            }
            // Sets dimensions if the segments are inequal
            else {
                sideLengthArray = [segments[1], segments[0], segments[0]];
                dottedSideIndex = [0, 1];
            }
            this._drawTrophyStand(sideLengthArray, dottedSideIndex);
        },

        /**
        * Renders the plank for the diagonal chop scenario
        *
        * @method _renderChopScenarioDiagonal
        * @private
        **/
        _renderChopScenarioDiagonal: function () {
            var chosenSet = this.chosenSet, startLeft,
                plankLength = chosenSet.get('plankLength'),
                pointCoOrdinates,
                xStartPoint, yStartPoint, xEndPoint, yEndPoint,
                x1, y1, x2, y2,
                counter, arrayIndex, groupArray = [],
                plankArray = [],
                plankBrickGroup,
                paperScope = this.scope,
                staticModelPath = this.modelPath,
                plankWidth = staticModelPath.plankWidth,
                gridSize = staticModelPath.gridSize,
                xAxisOffset = staticModelPath.xAxisOffset;

            if (this.rodneyPlankGroup !== null) {
                this.rodneyPlankGroup.remove();
            }
            if (this.rodneyBrickGroup !== null) {
                this.rodneyBrickGroup.remove();
            }

            pointCoOrdinates = chosenSet.get('coordinates');

            var startTop = (14 - pointCoOrdinates.startPoint[1]) * gridSize - (gridSize / 4),
                endTop = (14 - 1 - pointCoOrdinates.endPoint[1]) * gridSize + 11,
                endLeft = (pointCoOrdinates.endPoint[0]) * gridSize + gridSize * 1.3;

            if (pointCoOrdinates.startPoint[0] % 1 !== 0 && pointCoOrdinates.startPoint[1] % 1 !== 0) {
                startLeft = (pointCoOrdinates.startPoint[0]) * gridSize - (gridSize * 1.3);
            }
            else if (pointCoOrdinates.startPoint[0] % 1 !== 0 || pointCoOrdinates.startPoint[1] % 1 !== 0) {
                startLeft = (pointCoOrdinates.startPoint[0] - 0.7) * gridSize;
            }
            else {
                startLeft = (pointCoOrdinates.startPoint[0] - 0.1) * gridSize - (gridSize / 3);
            }

            // '-1' and '-5' have been added to adjust padding between board and co-ordinate text
            this.$startCoordinate.css({ 'top': startTop, 'left': startLeft - 1 });
            this.$endCoordinate.css({ 'top': endTop, 'left': endLeft - 5 });
            this.changeMessage('start-coordinate', 0, [pointCoOrdinates.startPoint[0], pointCoOrdinates.startPoint[1]]);
            this.changeMessage('end-coordinate', 0, [pointCoOrdinates.endPoint[0], pointCoOrdinates.endPoint[1]]);


            x1 = (pointCoOrdinates.startPoint[0] + xAxisOffset) * gridSize;
            y1 = (14 - pointCoOrdinates.startPoint[1]) * gridSize - 1;

            y2 = (14 - pointCoOrdinates.endPoint[1]) * gridSize - 1;
            x2 = (pointCoOrdinates.endPoint[0] + xAxisOffset) * gridSize;

            this.rodneyPlankGroup = this._drawDiagonalPlank(x1, y1, x2, y2);
            this._positionRodney(this.rodneyBrickGroup.position, 'diagonal');
        },

        /**
        * Render a single wooden plank
        *
        * @method _drawPlank()
        * @param {number} x1
        * @param {number} y1
        * @param {number} x2
        * @param {number} y2
        * @param {string} type
        * @private
        **/
        _drawPlank: function (x1, y1, x2, y2, type, isLeftSidePlank) {
            var paperScope = this.scope,
                plankBorderRectangle = new paperScope.Rectangle({ x: x1, y: y1 }, { x: x2, y: y2 }),
                borderPath = new paperScope.Path.Rectangle(plankBorderRectangle),
                midX = (x1 + x2) / 2,
                midY = (y1 + y2) / 2, clippingRect,
                plankImageBase64, plankRaster, plankGroup, path2;

            // Adjustment to show borders
            y1 = y1 - 1;
            y2 = y2 + 1;


            switch (type) {
                case 'horizontal':
                    plankImageBase64 = this.horizontalPlankBase64;
                    break;
                case 'vertical':
                    plankImageBase64 = this.verticalPlankBase64;
                    // Adjustment to show borders when plank coordinates are flipped
                    if (isLeftSidePlank) {
                        y1 = y1 + 3;
                        y2 = y2 - 3;
                    }
                    break;
                case 'none':
                    plankImageBase64 = this.diagonalPlankBase64;
                    break;

            }


            plankRaster = new paperScope.Raster({
                source: plankImageBase64,
                position: { x: midX, y: midY }
            });

            clippingRect = new paperScope.Rectangle({ x: x1 - 2, y: y1 }, { x: x2 + 2, y: y2 }),

            borderPath.strokeWidth = 2;
            borderPath.strokeColor = this.modelPath.color.plankBorder;
            path2 = new paperScope.Path.Rectangle(clippingRect);
            plankGroup = new paperScope.Group(path2, borderPath, plankRaster);

            plankGroup.clipped = true;
            borderPath.bringToFront();
            return plankGroup;
        },


        /**
        * Draws a wooden plank with end points
        * 
        * @method _drawEndPointsPlank
        * @param {number} x1
        * @param {number} y1
        * @param {number} x2
        * @param {number} y2
        * @param {string} type
        * @private
        **/
        _drawEndPointsPlank: function (x1, y1, x2, y2, type, isLeftSidePlank) {
            var paperScope = this.scope, color = this.modelPath.color.plankEndpoint,
            circleCenterPointX = x1,
                circleCenterPointY = y1,
                renderedPlank = this._drawPlank(x1, y1, x2, y2, type, isLeftSidePlank);
            var circle1 = paperScope.Path.Circle({ position: { x: circleCenterPointX, y: circleCenterPointY }, radius: 5 });
            circle1.fillColor = color;
            switch (type) {
                case 'horizontal':
                    circleCenterPointX = x2;
                    circleCenterPointY = y1;
                    break;
                case 'vertical':
                    circleCenterPointY = x1;
                    circleCenterPointY = y2;
                    break;

            }
            var circle2 = paperScope.Path.Circle({ position: { x: circleCenterPointX, y: circleCenterPointY }, radius: 5 });
            circle2.fillColor = color;

            return [renderedPlank, circle1, circle2];
        },


        /**
        * Render a diagonal wooden plank
        * 
        * @method _drawDiagonalPlank
        * @private        
        **/
        _drawDiagonalPlank: function (x1, y1, x2, y2, noBricks, dontRotatePlank) {
            var paperScope = this.scope, path2, plankGroup, theta,
                length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
                extraPadding = 2, // For clipping window
                plankWidth = 16,
                plankBorderRectangle = new paperScope.Rectangle({
                    x: x1,
                    y: y1
                }, {
                    x: x1 + length,
                    y: y1 + plankWidth
                }),
                clippingRect = new paperScope.Rectangle({
                    x: x1 - extraPadding,
                    y: y1 - extraPadding
                }, {
                    x: x1 + length + extraPadding,
                    y: y1 + plankWidth + extraPadding
                }),
                midX = (x1 + (x2 - x1) / 2),
                midY = (y1 + (y2 - y1) / 2),
                diagonalGroup, circle1, circle2,
                plankRaster = new paperScope.Raster({
                    source: this.diagonalPlankBase64,
                    position: { x: midX, y: midY }
                }),
                modelPath = this.modelPath,
                fixedBricks = modelPath.diagonalFixedBricks,
                brickHeight = this.modelPath.diagonalBrickHeight,
                brickWidth = this.modelPath.diagonalBrickWidth,
                borderPath;

            extraPadding = 0.8; // Adjustment to make border visible
            borderPath = new paperScope.Path.Rectangle({
                x: x1 - extraPadding,
                y: y1 - extraPadding
            }, {
                x: x1 + length + extraPadding,
                y: y1 + plankWidth + extraPadding
            });

            borderPath.strokeWidth = 2;
            borderPath.strokeColor = this.modelPath.color.plankBorder;

            path2 = new paperScope.Path.Rectangle(clippingRect);
            plankGroup = new paperScope.Group(path2, plankRaster, borderPath);
            plankGroup.clipped = true;

            theta = Math.atan2((y2 - y1), (x2 - x1));
            theta *= 180 / Math.PI;

            if (!dontRotatePlank) {
                borderPath.rotate(theta, new paperScope.Point(x1, y1));
                path2.rotate(theta, new paperScope.Point(x1, y1));
            }

            circle1 = paperScope.Path.Circle({ position: plankGroup.children[2].segments[1].point, radius: 5 });
            circle1.fillColor = this.modelPath.color.plankEndpoint;
            circle2 = paperScope.Path.Circle({ position: plankGroup.children[2].segments[2].point, radius: 5 });
            circle2.fillColor = this.modelPath.color.plankEndpoint;

            if (!noBricks) {
                var diagonalBrickGroup = new paperScope.Group(), baseY, topY, topX, baseX,
                    segments = plankGroup.children[2].segments,
                    isPositiveSlope, height1, height2;

                if (theta < 0) {
                    baseY = segments[0].point.y;
                    baseX = segments[0].point.x;
                    topY = segments[3].point.y;
                    topX = segments[3].point.x;
                    isPositiveSlope = true;
                }
                else {
                    baseY = segments[3].point.y;
                    baseX = segments[3].point.x;
                    topY = segments[0].point.y;
                    topX = segments[0].point.x;
                    isPositiveSlope = false;
                }

                var dist = baseY - topY,
                    offsetHeight = Math.tan(Math.abs(theta * Math.PI / 180)) * 21,
                    numOfBricks = Math.floor((dist - offsetHeight) / 21),
                    x = topX - (brickWidth / 2), rect, i,
                    y = baseY + (brickHeight * fixedBricks);

                this.diagonalBase = y;

                numOfBricks = numOfBricks + fixedBricks;

                for (i = 0; i < numOfBricks; i++) {
                    rect = new paperScope.Path.RoundRectangle({
                        x: x,
                        y: y - ((i + 1) * brickHeight)
                    }, {
                        x: x + brickWidth,
                        y: y - (i * brickHeight)
                    }, 3);
                    diagonalBrickGroup.addChild(rect);
                }

                rect = new paperScope.Path.RoundRectangle({
                    x: x,
                    y: topY + offsetHeight + 2
                }, {
                    x: x + brickWidth,
                    y: y - (numOfBricks * brickHeight)
                }, 3);
                diagonalBrickGroup.addChild(rect);

                var bigStackPoint = rect.segments[2].point;
                height1 = diagonalBrickGroup.bounds.height;
                height2 = fixedBricks * brickHeight;
                x = baseX - (brickWidth / 2);
                y = baseY;

                for (i = 0; i < fixedBricks; i++) {
                    rect = new paperScope.Path.RoundRectangle({
                        x: x,
                        y: y + ((i + 1) * brickHeight)
                    }, {
                        x: x + brickWidth,
                        y: y + (i * brickHeight)
                    }, 3);
                    diagonalBrickGroup.addChild(rect);
                }

                var smallStackPoint = rect.segments[2].point;


                if (isPositiveSlope) {
                    this.bricksHeight = [{
                        height: height2,
                        tipPoint: smallStackPoint,
                        plankPoint: { x: baseX, y: baseY }

                    }, {
                        height: height1,
                        tipPoint: bigStackPoint,
                        plankPoint: { x: topX, y: topY }
                    }]
                }
                else {
                    this.bricksHeight = [{
                        height: height1,
                        tipPoint: bigStackPoint,
                        plankPoint: { x: topX, y: topY }
                    }, {
                        height: height2,
                        tipPoint: smallStackPoint,
                        plankPoint: { x: baseX, y: baseY }
                    }]
                }

                diagonalBrickGroup.strokeColor = '#222';
                diagonalBrickGroup.strokeWidth = 2;
                diagonalBrickGroup.fillColor = '#FFF';
                this.rodneyBrickGroup = diagonalBrickGroup;
            }

            diagonalGroup = new paperScope.Group([plankGroup, circle1, circle2]);
            return diagonalGroup;
        },

        /**
        * Draws bricks for horizontal and diagonal planks
        *
        * @method _drawBricks
        * @param {number} x1
        * @param {number} y1
        * @param {string} type
        * @private
        **/
        _drawBricks: function (x1, y1, type) {
            var brickEndPointX, brickEndPointY,
                rectanglePath, cornerPath,
                roundedRectanglePath,
                paperScope = this.scope,
                modelPath = this.modelPath;

            if (type === 'diagonal') {
                brickEndPointX = x1 + modelPath.diagonalBrickWidth;
                brickEndPointY = y1 + modelPath.diagonalBrickHeight;
            }
            else {
                brickEndPointX = x1 + modelPath.horizontalBrickWidth;
                brickEndPointY = y1 + modelPath.horizontalBrickHeight;
            }

            rectanglePath = new paperScope.Rectangle({ x: x1, y: y1 }, { x: brickEndPointX, y: brickEndPointY });
            cornerPath = new paperScope.Size(modelPath.brickCornerRadius, modelPath.brickCornerRadius);
            roundedRectanglePath = new paperScope.Path.RoundRectangle(rectanglePath, cornerPath);
            roundedRectanglePath.fillColor = new paperScope.Color(1, 1, 1);

            roundedRectanglePath.strokeWidth = 2;
            roundedRectanglePath.strokeColor = modelPath.color.brickColor;
            return roundedRectanglePath;
        },

        /**
        * Animates the charater to chop/kick at given point
        *
        * @method _breakPlank
        * @param {String} [plankType]
        * @param {Object} Point to strike at {x:left, y:top}
        * @private
        **/
        _breakPlank: function (plankType, strikeAt) {
            var $rodney = this.$('.child-cont'),
                rodneyCenter = {},
                ModelStaticData = this.modelPath,
                $rodneyPos = $rodney.position(),
                rodneyWidth = $rodney.width(),
                rodneyHeight = $rodney.height();

            rodneyCenter.x = $rodneyPos.left + (rodneyWidth / 2);
            rodneyCenter.y = $rodneyPos.top + (rodneyHeight / 2);

            switch (plankType) {
                case 'horizontal':
                    var imgSeq = null, animationInterval = null,
                        horizontalBarAnimData = ModelStaticData.horizontalBarAnimData,
                        imgIndex = 1, self = this, isMoved = false,
                        movementRequired = true, placeHolderIndex = null,
                        replaceWith = null, numOfImgs = null, self = this,
                        threshold = horizontalBarAnimData.minDistanceForSlide,
                        relativeChopPoint = horizontalBarAnimData.chopOffset;

                    if (strikeAt.x > rodneyCenter.x) {
                        // To the left of Rodney
                        replaceWith = this.horizontalChopImgs.chopLeft;
                    }
                    else {
                        // To the right of Rodney
                        relativeChopPoint = -relativeChopPoint;
                        replaceWith = this.horizontalChopImgs.chopRight;
                    }

                    // Check if sliding Rodney is necessary
                    if (Math.abs(strikeAt.x - relativeChopPoint - (rodneyWidth / 2) - $rodneyPos.left) < threshold) {
                        movementRequired = false;
                        imgSeq = this._horizontalImgSeq.slice(0);
                    }
                    else {
                        imgSeq = this._horizontalImgSeqWithSlide.slice(0);
                    }

                    numOfImgs = imgSeq.length;
                    placeHolderIndex = imgSeq.indexOf('direction-place-holder');

                    if (placeHolderIndex !== -1) {
                        imgSeq[placeHolderIndex] = { imgPath: replaceWith, isStrikeFrame: true };
                    }

                    $rodney.css('background-image', 'url("' + this.filePath.getImagePath('horizontal-sequence-sprite') + '")');
                    animationInterval = setInterval(function () {

                        $rodney.css({
                            'background-position': imgSeq[imgIndex].imgPath
                        });
                        if (movementRequired && imgSeq[imgIndex].toFade) {
                            // Fade the image and move to required location and fade in
                            $rodney.fadeOut(horizontalBarAnimData.fadeDuration, function () {
                                if (isMoved) {
                                    // Move Rodney to center of plank and fade in
                                    $rodney.css('left', rodneyCenter.x - (rodneyWidth / 2)).fadeIn(0);
                                    isMoved = false;
                                } else {
                                    // Move Rodney to strike point and fade in
                                    $rodney.css('left', strikeAt.x - relativeChopPoint - (rodneyWidth / 2)).fadeIn(0);
                                    isMoved = true;
                                }
                            });
                        }

                        if (imgSeq[imgIndex].isStrikeFrame) {
                            self.trigger('plank-hit');
                        }

                        imgIndex++;
                        if (imgIndex === numOfImgs) {
                            clearInterval(animationInterval);
                            self.trigger('breaking-animation-ends');
                        }

                    }, horizontalBarAnimData.frameDuration);
                    break;

                case 'vertical':
                    var imgSeq = this._verticalKickWithJump.slice(0), animationInterval,
                        imgIndex = 1, replaceWith = null, placeHolderIndex,
                        verticalAnimData = ModelStaticData.verticalAnimData, self = this,
                        verticalImgs = this._kickImages, isKickHigh = false,
                        relativePos = $rodneyPos.top + verticalAnimData.rodneyEffectiveHeight - strikeAt.y,
                        numOfImages, isMovedUp = false, jumpRequired = false, jumpBy = 0;

                    // "relativePos" is the distance to strike point from Rodney's foot

                    // Determine type of kick to be used and whether jump is required
                    if (relativePos < verticalAnimData.kickLowMax) {
                        // Kick low
                        replaceWith = { imgPath: verticalImgs.kickLow, isStrikeFrame: true };
                        // Kick low with jump
                        if (relativePos - verticalAnimData.kickLowMin > 0) {
                            jumpRequired = true;
                            jumpBy = relativePos - verticalAnimData.kickLowMin;
                        }
                    }
                    else if (relativePos >= verticalAnimData.kickLowMax && relativePos <= verticalAnimData.kickMidMax) {
                        // Kick mid
                        replaceWith = { imgPath: verticalImgs.kickMid, isStrikeFrame: true };
                    }
                    else if (relativePos > verticalAnimData.kickMidMax && relativePos < verticalAnimData.kickMidWithJumpMax) {
                        replaceWith = { imgPath: verticalImgs.kickMid, isStrikeFrame: true };
                        // Kick mid with jump
                        if (relativePos - verticalAnimData.kickMidMax > 0) {
                            jumpRequired = true;
                            jumpBy = relativePos - verticalAnimData.kickMidMax;
                        }
                    }
                    else {
                        // Kick high
                        replaceWith = { imgPath: verticalImgs.kickHigh1 };
                        isKickHigh = true;
                        // Kick high with jump
                        if (relativePos - verticalAnimData.kickMidWithJumpMax > 2) {
                            jumpRequired = true;
                            jumpBy = relativePos - verticalAnimData.kickMidWithJumpMax;
                        }
                    }

                    // Determine the image sequence to be used
                    if (jumpRequired) {
                        imgSeq = this._verticalKickWithJump.slice(0);
                    }
                    else {
                        imgSeq = this._verticalKick.slice(0);
                    }

                    // Insert the type of kick in the image sequence
                    placeHolderIndex = imgSeq.indexOf('kick-type');
                    if (placeHolderIndex !== -1) {
                        imgSeq[placeHolderIndex] = replaceWith;
                    }

                    // Kick high has 2 images for kicking action
                    if (isKickHigh) {
                        imgSeq.splice(placeHolderIndex + 1, 0, { imgPath: verticalImgs.kickHigh2, isStrikeFrame: true });
                    }

                    numOfImages = imgSeq.length;

                    // Kick animation
                    animationInterval = setInterval(function () {
                        $rodney.css('background-position', imgSeq[imgIndex].imgPath);
                        // Move Rodney up or down as required
                        if (imgSeq[imgIndex].toMove) {
                            if (isMovedUp) {
                                $rodney.css('top', '+=' + jumpBy);
                                isMovedUp = false;
                            }
                            else {
                                $rodney.css('top', '-=' + jumpBy);
                                isMovedUp = true;
                            }
                        }

                        if (imgSeq[imgIndex].isStrikeFrame) {
                            self.trigger('plank-hit');
                        }

                        imgIndex++;
                        if (imgIndex === numOfImages) {
                            clearInterval(animationInterval);
                            self.trigger('breaking-animation-ends');
                        }

                    }, verticalAnimData.frameDuration);
                    break;

                case 'diagonal':
                    var imgSeq = this._diagonalImgs.slice(0), animationInterval, imgIndex = 1, isMoved = false,
                        numOfImgs = imgSeq.length, hasJumped = false, self = this,
                        placeHolderIndex, self = this, xDiff,
                        yDiff = $rodneyPos.top - (strikeAt.y - 224),
                        coods = this.chosenSet.get('coordinates');

                    if (coods.startPoint[1] < coods.endPoint[1]) {
                        replaceWith = "0px -314px";
                        xDiff = strikeAt.x - 230 - $rodneyPos.left;
                    }
                    else {
                        replaceWith = "0px -628px";
                        xDiff = strikeAt.x - 61 - $rodneyPos.left;
                    }

                    placeHolderIndex = imgSeq.indexOf('direction-place-holder');

                    if (placeHolderIndex !== -1) {
                        imgSeq[placeHolderIndex] = { imgPath: replaceWith, isStrikeFrame: true };
                    }

                    animationInterval = setInterval(function () {
                        $rodney.css('background-position', imgSeq[imgIndex].imgPath);

                        if (imgSeq[imgIndex].toFade) {
                            // Fade the image and move to required location and fade in
                            $rodney.fadeOut(200, function () {
                                if (isMoved) {
                                    // Move Rodney to center of plank and fade in
                                    $rodney.css('left', "-=" + xDiff).fadeIn(0);
                                    isMoved = false;
                                } else {
                                    // Move Rodney to strike point and fade in
                                    $rodney.css('left', "+=" + xDiff).fadeIn(0);
                                    isMoved = true;
                                }
                            });
                        }

                        if (imgSeq[imgIndex].toJump) {
                            if (hasJumped) {
                                // Move Rodney to center of plank and fade in
                                $rodney.css('top', '+=' + yDiff);
                                hasJumped = false;
                            } else {
                                // Move Rodney to strike point and fade in
                                $rodney.css('top', '-=' + yDiff);
                                hasJumped = true;
                            }
                        }

                        if (imgSeq[imgIndex].isStrikeFrame) {
                            self.trigger('plank-hit');
                        }

                        imgIndex++;
                        if (imgIndex === numOfImgs) {
                            clearInterval(animationInterval);
                            self.trigger('breaking-animation-ends');
                        }

                    }, 400);
                    break;
            }
        },

        /**
        *set the broken plank group objects
        *
        * @method _setBrokenPlankGroup    
        * @private
        **/
        _setBrokenPlankGroup: function () {

            var plankPath = null,
                borderPath = null,
                myPaper = this.scope,
                imagePathDiagonal = this.diagonalPlankBase64,
                imagePathBorder = this,
                raster = null;

            plankPath = new myPaper.Path.Rectangle({// clipped path for one side broken plank height and width is set as 1 pixel
                from: [0, 0],
                to: [1, 1],
                position: [0, 0]


            });
            raster = new myPaper.Raster({// image raster
                source: imagePathDiagonal,
                position: myPaper.view.center

            })
            borderPath = new myPaper.Path.Rectangle({//to show border to raster we use this path 
                from: [0, 0],
                to: [1, 1],
                position: [0, 0],
                strokeWidth: 1,
                strokeColor: 'black'
            })

            this.rightBrokenRasterGroup = new myPaper.Group(plankPath, raster, borderPath);
            this.rightBrokenRasterGroup.clipped = true;

            plankPath = new myPaper.Path.Rectangle({// clipped path for one side broken plank height and width is set as 1 pixel
                from: [0, 0],
                to: [1, 1],
                position: [0, 0]

            });
            raster = new myPaper.Raster({// image raster
                source: imagePathDiagonal,
                position: myPaper.view.center

            })
            borderPath = new myPaper.Path.Rectangle({//to show border to raster we use this path 
                from: [0, 0],
                to: [1, 1],
                position: [0, 0],
                strokeWidth: 1,
                strokeColor: 'black'

            })
            this.leftBrokenRasterGroup = new myPaper.Group(plankPath, raster, borderPath);
            this.leftBrokenRasterGroup.clipped = true;
        },

        /**
        *draw broken planks for diagonal plank
        *
        * @method _drawDiagonalHorizontalBrokenPlanks    
        * @param {array} topPointPosition graph coordinates of top point
        * @param {array} bottomPointPosition graph coordinates of bottom plank point
        * @param {array} chopPointPosition graph coordinates of chopping point
        * @private
        **/
        _drawDiagonalHorizontalBrokenPlanks: function (plankStartPoint, plankEndPoint, chopPoint) {

            var self = this,
                model = self.model,
                modelStaticData = this.modelPath,
                plankWidth = modelStaticData.plankWidth + 2,
                rightBrokenRasterGroup = this.rightBrokenRasterGroup,
                leftBrokenRasterGroup = this.leftBrokenRasterGroup,
                unitBrickWidth = modelStaticData.diagonalBrickWidth,

                bricksData = this.rodneyBrickGroup,
                bricksDataChildrens = bricksData.children,

                leftSideBricksData = null,

                leftSidePlankPoint = self._getPixelValues(plankStartPoint),
                leftSidePlankPointX = leftSidePlankPoint.x,
                leftSidePlankPointY = leftSidePlankPoint.y,

                leftSideTipPoint = {},
                leftSideTipPointX = null,
                leftSideTipPointY = null,

                group1 = [],
                group2 = [],
                testPath = null,

                rightSidebricksData = null,
                rightSidePlankPoint = self._getPixelValues(plankEndPoint),
                rightSidePlankPointX = rightSidePlankPoint.x,
                rightSidePlankPointY = rightSidePlankPoint.y,

                rightSideTipPoint = {},
                rightSideTipPointX = null,
                rightSideTipPointY = null,

                chopPointPosition = self._getPixelValues(chopPoint),

                totalPlankLength = model.getDistance(rightSidePlankPoint, rightSidePlankPoint), //self._getDistanceBetweenTwoPoints(rightSidePlankPoint, rightSidePlankPoint),
                leftSidePlankLength = null,
                rightSidePlankLength = null,
                leftSideRotateDistance = null,
                rightSideRotateDistance = null,
                leftSidePlankLengthOnBrick = null,
                rightSidePlankLengthOnBrick = null,

                rotatingAngle = null,
                translateX = null,
                translateY = null,

                totalBrickHeightLeft = 0,
                totalBrickHeightRight = 0,

                currentBounds = null,

                rightPlankClipPath = self.rightBrokenRasterGroup.children[0],
                rightPlankBorderPath = self.rightBrokenRasterGroup.children[2],
                leftPlankClipPath = self.leftBrokenRasterGroup.children[0],
                leftPlankBorderPath = self.leftBrokenRasterGroup.children[2],


                count = null;


            // from the group of bricks we need to sort out the left side and right side brick 
            testPath = bricksDataChildrens[0];

            group1.push(testPath);

            for (count = 1; count < bricksDataChildrens.length; count++) {// will store same x position in an array eventually will create two array
                if (testPath.bounds.x === bricksDataChildrens[count].bounds.x) {
                    group1.push(bricksDataChildrens[count]);
                }
                else {
                    group2.push(bricksDataChildrens[count]);

                }

            }


            if (testPath.bounds.x > group2[0].bounds.x) { //will determine the left or right side array by comparing x position

                leftSideBricksData = group2;
                rightSidebricksData = group1;

            }
            else {
                leftSideBricksData = group1;
                rightSidebricksData = group2;
            }

            currentBounds = leftSideBricksData[0].bounds;
            leftSideTipPoint.x = currentBounds.x + unitBrickWidth;
            leftSideTipPoint.y = currentBounds.y;
            totalBrickHeightLeft = currentBounds.height;

            for (count = 1; count < leftSideBricksData.length; count++) {// will determine the rotate point for left side brick

                currentBounds = leftSideBricksData[count].bounds;
                totalBrickHeightLeft = totalBrickHeightLeft + currentBounds.height;

                if (currentBounds.y < leftSideTipPoint.y) {
                    leftSideTipPoint.y = currentBounds.y

                }
            }

            currentBounds = rightSidebricksData[0].bounds;
            rightSideTipPoint.x = currentBounds.x;
            rightSideTipPoint.y = currentBounds.y;
            totalBrickHeightRight = currentBounds.height;

            for (count = 1; count < rightSidebricksData.length; count++) {// will determine the rotate point for right side brick

                currentBounds = rightSidebricksData[count].bounds;
                totalBrickHeightRight = totalBrickHeightRight + currentBounds.height;

                if (currentBounds.y < rightSideTipPoint.y) {
                    rightSideTipPoint.y = currentBounds.y

                }
            }



            rightSideTipPointX = rightSideTipPoint.x
            rightSideTipPointY = rightSideTipPoint.y;
            leftSideTipPointX = leftSideTipPoint.x
            leftSideTipPointY = leftSideTipPoint.y;

            // following lines will calculate the varios distances for left point to chop point rotate point to chop point
            leftSidePlankLength = model.getDistance(leftSidePlankPoint, chopPointPosition), //self._getDistanceBetweenTwoPoints(leftSidePlankPoint, chopPointPosition);
            rightSidePlankLength = model.getDistance(rightSidePlankPoint, chopPointPosition), //self._getDistanceBetweenTwoPoints(rightSidePlankPoint, chopPointPosition);
            leftSideRotateDistance = leftSidePlankLength - unitBrickWidth;
            rightSideRotateDistance = rightSidePlankLength - unitBrickWidth;
            leftSidePlankLengthOnBrick = leftSidePlankLength - leftSideRotateDistance;
            rightSidePlankLengthOnBrick = rightSidePlankLength - rightSideRotateDistance;

            //following function will set the path position and height width to clipped path
            self._setClippedPathPosition(self.leftBrokenRasterGroup, [leftSideTipPointX - unitBrickWidth, leftSideTipPointY - plankWidth],
                                                                     [leftSidePlankLength, plankWidth]);
            self._setClippedPathPosition(self.rightBrokenRasterGroup, [rightSideTipPointX - rightSidePlankLength + unitBrickWidth,
                                                                            rightSideTipPointY - plankWidth],
                                                                      [rightSidePlankLength, plankWidth]);


            if (leftSidePlankLength >= totalBrickHeightLeft) {


                // only rotate by roting angle at rotating point
                rotatingAngle = (Math.asin(totalBrickHeightLeft / leftSideRotateDistance)) * 180 / Math.PI;

                if (isNaN(rotatingAngle)) {

                    translateX = totalBrickHeightLeft - leftSideRotateDistance + 12;
                    leftPlankClipPath.translate(translateX, 0); // in isNan condition will translate clipped path by calculated distance
                    leftPlankBorderPath.translate(translateX, 0);
                    rotatingAngle = (Math.asin(totalBrickHeightLeft / (translateX + leftSideRotateDistance))) * 180 / Math.PI;
                }
                leftPlankClipPath.rotate(rotatingAngle, leftSideTipPoint); // rotate the clipped path and border at rotating point
                leftPlankBorderPath.rotate(rotatingAngle, leftSideTipPoint);
            }
            else {

                //translate and rotate by rotating angle
                rotatingAngle = this._returnRotatingAngleForSmallPlank(totalPlankLength, leftSidePlankLength);
                translateY = totalBrickHeightLeft - (Math.sin(rotatingAngle * Math.PI / 180) * leftSidePlankLength);

                leftPlankClipPath.translate(unitBrickWidth, translateY).rotate(rotatingAngle,
                                       [leftSideTipPoint.x, leftSideTipPoint.y + translateY]);
                leftPlankBorderPath.translate(unitBrickWidth, translateY).rotate(rotatingAngle,
                                        [leftSideTipPoint.x, leftSideTipPoint.y + translateY]);



            }



            if (rightSidePlankLength >= totalBrickHeightRight) {


                // only rotate by roting angle
                rotatingAngle = (Math.asin(totalBrickHeightRight / rightSideRotateDistance)) * 180 / Math.PI;

                if (isNaN(rotatingAngle)) {

                    translateX = totalBrickHeightRight - rightSideRotateDistance + 12;
                    rightPlankClipPath.translate(-translateX, 0); // in isNan condition will translate clipped path by calculated distance
                    rightPlankBorderPath.translate(-translateX, 0);
                    rotatingAngle = (Math.asin(totalBrickHeightRight / (translateX + rightSideRotateDistance))) * 180 / Math.PI;
                }
                rightPlankClipPath.rotate(-rotatingAngle, rightSideTipPoint); // rotate clipped path and border path at rotating point
                rightPlankBorderPath.rotate(-rotatingAngle, rightSideTipPoint);
            }
            else {

                //translate and rotate by rotating angle
                rotatingAngle = this._returnRotatingAngleForSmallPlank(totalPlankLength, rightSidePlankLength);
                translateY = totalBrickHeightRight - (Math.sin(rotatingAngle * Math.PI / 180) * rightSidePlankLength);

                rightPlankClipPath.translate(-unitBrickWidth, translateY).rotate(-rotatingAngle,
                                         [rightSideTipPoint.x, rightSideTipPoint.y + translateY]);
                rightPlankBorderPath.translate(-unitBrickWidth, translateY).rotate(-rotatingAngle,
                                         [rightSideTipPoint.x, rightSideTipPoint.y + translateY]);



            }



        },


        /**
        *draw broken planks for vertical plank
        *
        * @method _drawVerticalBrokePlanks    
        * @param {array} topPointPosition graph coordinates of top point
        * @param {array} bottomPointPosition graph coordinates of bottom plank point
        * @param {array} chopPointPosition graph coordinates of chopping point
        * @private
        **/

        _drawVerticalBrokePlanks: function (topPointPosition, bottomPointPosition, chopPointPosition) {

            var self = this,
                model = self.model,
                modelStaticData = this.modelPath,
                topBrokenPlankDistance = null,
                bottomBrokenPlankDistance = null,
                topPointCanvasPosition = null,
                bottomPointCanvasPosition = null,
                chopPointCanvasPosition = null,
                bottomCanvasPointLeft = null,
                plankWidth = modelStaticData.plankWidth,

                leftClippedPath = self.leftBrokenRasterGroup.children[0],
                leftBorderPath = self.leftBrokenRasterGroup.children[2],
                topBrokenPlankOffset = 42,
                angleOfRotation = null,
                adjustDistance = null,
                diagonalDistance = null,
                adjustmentoffset = 5;



            bottomCanvasPointLeft = bottomPointCanvasPosition = self._getPixelValues(bottomPointPosition);
            chopPointCanvasPosition = self._getPixelValues(chopPointPosition);
            topPointCanvasPosition = self._getPixelValues(topPointPosition);

            bottomBrokenPlankDistance = bottomPointCanvasPosition.y - chopPointCanvasPosition.y;
            topBrokenPlankDistance = chopPointCanvasPosition.y - topPointCanvasPosition.y;

            // will set the bottom plank group at the static position with given height and width
            self._setClippedPathPosition(self.rightBrokenRasterGroup, [bottomPointCanvasPosition.x, bottomPointCanvasPosition.y],
                                                                      [bottomBrokenPlankDistance, plankWidth], true);

            // will set the bottom plank group at the temp position with given height and width
            self._setClippedPathPosition(self.leftBrokenRasterGroup, [bottomPointCanvasPosition.x, bottomPointCanvasPosition.y],
                                                                     [topBrokenPlankDistance, plankWidth], true);

            adjustDistance = bottomBrokenPlankDistance - topBrokenPlankOffset;

            if (topBrokenPlankDistance - topBrokenPlankOffset <= 0) {

                adjustDistance = adjustDistance + topBrokenPlankOffset - 4;
                topBrokenPlankOffset = 0;

            }

            diagonalDistance = Math.sqrt(Math.pow((topBrokenPlankDistance - topBrokenPlankOffset), 2) + Math.pow(plankWidth, 2)); // calculate rotating distance for top/left in case where 41 px should be above the bottom/right plank
            leftClippedPath.translate(-adjustDistance, 0);
            leftBorderPath.translate(-adjustDistance, 0);
            //angleOfRotation = Math.asin(plankWidth / (topBrokenPlankDistance - topBrokenPlankOffset)) * 180 / Math.PI;
            angleOfRotation = Math.asin(plankWidth / diagonalDistance) * 180 / Math.PI; // calculate angle of rotation for left/top side plank


            if (isNaN(angleOfRotation)) {// to handle nan condition where plank width and diagonal distance diff is too small and 14px above bottom plank can not set

                leftClippedPath.translate(-topBrokenPlankOffset + adjustmentoffset, 0);
                leftBorderPath.translate(-topBrokenPlankOffset + adjustmentoffset, 0);
                angleOfRotation = Math.asin(plankWidth / (topBrokenPlankDistance + adjustmentoffset)) * 180 / Math.PI;

                leftClippedPath.rotate(-angleOfRotation, [bottomPointCanvasPosition.x - adjustDistance - topBrokenPlankDistance * 2 +
                                                          adjustmentoffset, bottomPointCanvasPosition.y]);

                leftBorderPath.rotate(-angleOfRotation, [bottomPointCanvasPosition.x - adjustDistance - topBrokenPlankDistance * 2 +
                                                         adjustmentoffset, bottomPointCanvasPosition.y]);
            }
            else {
                leftClippedPath.rotate(-angleOfRotation, [bottomPointCanvasPosition.x - adjustDistance - topBrokenPlankDistance,
                                                          bottomPointCanvasPosition.y]);
                leftBorderPath.rotate(-angleOfRotation, [bottomPointCanvasPosition.x - adjustDistance - topBrokenPlankDistance,
                                                         bottomPointCanvasPosition.y]);
            }

        },

        /**
        *set height width and position for clipping paths 
        *
        * @method _setClippedPathPosition    
        * @param {object} currentGroup group of raster and its clipping path along with border
        * @param {array} startPoint canvas x and y co-ordinates of group 
        * @param {array} bounds height and width of clipping path
        * @param {boolean} adjustVerticalPosition boolean to adjust position for vertical plank
        * @private
        **/
        _setClippedPathPosition: function (currentGroup, startPoint, bounds, adjustVerticalPosition) {

            // will set the clipped path rect position 
            // will set height and width according to broken plank length and width
            var currentPath = currentGroup.children[0],
                borderPath = currentGroup.children[2],
                adjustVerticalPosition = adjustVerticalPosition || false;

            currentPath.scale(bounds);
            borderPath.scale([bounds[0] - 2, bounds[1] - 2]);

            if (adjustVerticalPosition) {

                currentPath.position = [startPoint[0] - bounds[0] / 2, startPoint[1] - bounds[1] / 2];
                borderPath.position = [startPoint[0] - bounds[0] / 2, startPoint[1] - bounds[1] / 2];

            }
            else {
                currentPath.position = [startPoint[0] + bounds[0] / 2, startPoint[1] + bounds[1] / 2];
                borderPath.position = [startPoint[0] + bounds[0] / 2, startPoint[1] + bounds[1] / 2];
            }

        },

        /**
        *set the clipped path to null a
        *
        * @method _resetClippedPathPosition    
        * @private
        **/
        _resetClippedPathPosition: function () {

            if (this.rightBrokenRasterGroup !== null) {
                this.rightBrokenRasterGroup.remove();
                this.rightBrokenRasterGroup = null;
            }

            if (this.leftBrokenRasterGroup !== null) {
                this.leftBrokenRasterGroup.remove();
                this.leftBrokenRasterGroup = null;
            }

        },

        /**
        *return the approx angle to rotate small planks
        *
        * @method _returnRotatingAngleForSmallPlank    
        * @param {integer} totalPlankLength total length of plank
        * @param {integer}broken plank length     
        * @private
        **/
        _returnRotatingAngleForSmallPlank: function (totalPlankLength, brokenPlankLength) {
            // check the length of broken plank with total plank length in percentage
            // so accordingly a angle will be return , for small percantage roatating angle will be large and vice versa
            var modelStaticData = this.modelPath,
                startingAngle = modelStaticData.rotationStartAngle,
                decrementor = modelStaticData.rotationAngleDecerementor;


            if (brokenPlankLength >= totalPlankLength * 4 / 10) {
                return startingAngle;

            }
            else if (brokenPlankLength >= totalPlankLength * 3.5 / 10) {
                return startingAngle - decrementor;

            }
            else if (brokenPlankLength >= totalPlankLength * 3 / 10) {
                return startingAngle - decrementor * 2;
            }
            else if (brokenPlankLength >= totalPlankLength * 2.5 / 10) {

                return startingAngle - decrementor * 3;

            }
            else if (brokenPlankLength >= totalPlankLength * 2 / 10) {

                return startingAngle - decrementor * 4;
            }
            else if (brokenPlankLength >= totalPlankLength * 1.5 / 10) {

                return startingAngle - decrementor * 5;
            }
            // else if (ratioOfPlankLenths >= totalPlankLength * 1 / 10) {
            else {

                return startingAngle - decrementor * 6;
            }


        },

        /**
        *fade out animation after the planks broke up
        * @method _fadeOutPlanks           
        * @private
        **/
        _fadeOutPlanks: function () {

            var modelStataicData = this.modelPath,
                plankOpacity = modelStataicData.plankOpacity,
                plankOpacityDivident = modelStataicData.plankOpacityDivident,
                plankFadeOutInterval = modelStataicData.plankFadeOutInterval,
                self = this,
                view = self.scope.view;

            var interval = setInterval(function () {

                if (plankOpacity > 0.1) {


                    self.rightBrokenRasterGroup.opacity = plankOpacity;
                    self.leftBrokenRasterGroup.opacity = plankOpacity;
                    plankOpacity = plankOpacity / plankOpacityDivident;
                    view.draw();
                }
                else {
                    clearInterval(interval);
                    self._resetClippedPathPosition();
                    view.draw();
                }

            }, plankFadeOutInterval)

        },

        /**
        * Stores paths of frequently used images
        *
        * @method _storeImagePaths
        * @private
        **/
        _storeImagePaths: function () {
            var horizontalChopImgs = {
                startPos: "0px -942px",
                eyeBrowRaise: "0px -1256px",
                chopRight: "0px -314px",
                chopLeft: "0px 0px",
                slidingImg: "0px -628px"
            }

            this._horizontalImgSeq = [{ imgPath: horizontalChopImgs.startPos },
                                       { imgPath: horizontalChopImgs.eyeBrowRaise },
                                       { imgPath: horizontalChopImgs.startPos },
                                       'direction-place-holder',
                                       { imgPath: horizontalChopImgs.startPos}];

            this._horizontalImgSeqWithSlide = [{ imgPath: horizontalChopImgs.startPos },
                                        { imgPath: horizontalChopImgs.eyeBrowRaise },
                                        { imgPath: horizontalChopImgs.startPos },
                                        { imgPath: horizontalChopImgs.slidingImg, toFade: true },
                                        { imgPath: horizontalChopImgs.startPos },
                                        'direction-place-holder',
                                        { imgPath: horizontalChopImgs.startPos },
                                        { imgPath: horizontalChopImgs.slidingImg, toFade: true },
                                        { imgPath: horizontalChopImgs.startPos}];

            this.horizontalChopImgs = horizontalChopImgs;

            // Images used in Kicking
            var kickImages = {
                kickLow: "-341px -628px",
                kickMid: "-341px -942px",
                kickHigh1: "0px 0px",
                kickHigh2: "0px -314px",
                kickIntermediatePos: "0 -628px",
                kickInitialPos: "0px -942px",
                kickJumpCrouch: "0px -1256px"
            }

            // 'Kick without jump' sequence
            this._verticalKick = [{ imgPath: kickImages.kickInitialPos },
                                          { imgPath: kickImages.kickIntermediatePos },
                                          'kick-type', // Low|Mid|High
                                          {imgPath: kickImages.kickInitialPos}];

            // 'Kick with jump' sequence
            this._verticalKickWithJump = [{ imgPath: kickImages.kickInitialPos },
                                            { imgPath: kickImages.kickJumpCrouch },
                                            { imgPath: kickImages.kickIntermediatePos, toMove: true },
                                            'kick-type', // Low|Mid|High
                                            {imgPath: kickImages.kickJumpCrouch, toMove: true },
                                            { imgPath: kickImages.kickInitialPos}];

            this._kickImages = kickImages;

            this._headScratchAnim = [
                        { imgPath: "0px -1884px" },
                        { imgPath: "-341px 0px" },
                        { imgPath: "0px -1884px" },
                        { imgPath: "0 -1570px" },
                        'last-frame'
            ]


            this._diagonalImgs = [
                        { imgPath: "0px -942px" },
                        { imgPath: "0px -1256px" },
                        { imgPath: "0px -942px" },
                        { imgPath: "-341px -628px", toFade: true },

                        { imgPath: "0px -942px" },
                        { imgPath: "0px 0px" },
                        { imgPath: "0px -942px", toJump: true },
                        'direction-place-holder',

                        { imgPath: "0px 0px", toJump: true },
                        { imgPath: "0px -942px" },
                        { imgPath: "-341px -628px", toFade: true },
                        { imgPath: "0px -942px" }
            ]
            this._positiveFeedback = "-341px -315px";
            this._negativeFeedback = "0px -1571px";
        },

        /**
        * Changes the instruction text
        *
        * @method _changeInstructionText
        * @param {String} Object type
        * @param {Boolean} isMidPoint
        * @param {Array} Array of ratio numerator and denominator
        * @private
        */
        _changeInstructionText: function (type, isMidPoint, currentRatio) {

            if (!this.directionTextView) {
                return;
            }

            var ratioNumerator = currentRatio[0], self = this, ratioDenominator = currentRatio[1],
            newText, newAccText;

            switch (type) {
                case 'trophy-stand':
                    if (isMidPoint) {
                        //self.changeMessage('instruction-text', 1);
                        newText = self.getMessage('instruction-text', 1);
                        newAccText = self.getAccMessage('instruction-text', 1);
                        self.directionTextView.changeDirectionText(newText, false, newAccText);
                    }
                    else {
                        //self.changeMessage('instruction-text', 0, [ratioNumerator, ratioDenominator, ratioDenominator, ratioNumerator]);
                        newText = self.getMessage('instruction-text', 0, [ratioNumerator, ratioDenominator, ratioDenominator, ratioNumerator]);
                        newAccText = self.getAccMessage('instruction-text', 0, [ratioNumerator, ratioDenominator, ratioDenominator, ratioNumerator]);
                        self.directionTextView.changeDirectionText(newText, false, newAccText);
                    }
                    break;
                case 'bag-stand':
                    if (isMidPoint) {
                        //self.changeMessage('instruction-text', 3);
                        newText = self.getMessage('instruction-text', 3);
                        newAccText = self.getAccMessage('instruction-text', 3);
                        self.directionTextView.changeDirectionText(newText, false, newAccText);
                    }
                    else {
                        //self.changeMessage('instruction-text', 2, [ratioNumerator, ratioDenominator, ratioDenominator, ratioNumerator]);
                        newText = self.getMessage('instruction-text', 2, [ratioNumerator, ratioDenominator, ratioDenominator, ratioNumerator]);
                        newAccText = self.getAccMessage('instruction-text', 2, [ratioNumerator, ratioDenominator, ratioDenominator, ratioNumerator]);
                        self.directionTextView.changeDirectionText(newText, false, newAccText);
                    }
                    break;
                case 'book-shelf':
                    if (isMidPoint) {
                        //self.changeMessage('instruction-text', 5);
                        newText = self.getMessage('instruction-text', 5);
                        newAccText = self.getAccMessage('instruction-text', 5);
                        self.directionTextView.changeDirectionText(newText, false, newAccText);
                    }
                    else {
                        //self.changeMessage('instruction-text', 4, [ratioNumerator, ratioDenominator, ratioDenominator, ratioNumerator]);
                        newText = self.getMessage('instruction-text', 4, [ratioNumerator, ratioDenominator, ratioDenominator, ratioNumerator]);
                        newAccText = self.getAccMessage('instruction-text', 4, [ratioNumerator, ratioDenominator, ratioDenominator, ratioNumerator]);
                        self.directionTextView.changeDirectionText(newText, false, newAccText);
                    }
                    break;
            }
        },

        /**
        * Sets button state as 'ACTIVE'
        *
        * @method _enableButton
        * @param {Object} [btnView]
        * @private
        **/
        _enableButton: function (btnView) {
            if (btnView.getButtonState() === 'disabled') {
                btnView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE);
            }
        },

        /**
        * Sets button state as 'DISABLED'
        *
        * @method _disableButton
        * @param {Object} [btnView]
        * @private
        **/
        _disableButton: function (btnView) {
            btnView.setButtonState(MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED);
        },

        /**
        * Disables all buttons and input boxes.
        * @method _disableState
        */
        _disableState: function () {
            var self = this;
            self.kickState = this.kickButtonView.getButtonState();
            self.chopState = this.chopButtonView.getButtonState();
            self.player.enableAllHeaderButtons(false);
            self._disableButton(self.tryAnotherButtonview);
            self.leftInputBoxView.disableInputBox();
            self.rightInputBoxView.disableInputBox();
            self._disableButton(self.kickButtonView);
            self._disableButton(self.chopButtonView);
        },

        /**
        * Enables all buttons and input boxes based on their previous state.
        * @method _enableState
        */
        _enableState: function () {
            var self = this;
            self.player.enableAllHeaderButtons(true);
            self._enableButton(self.tryAnotherButtonview);
            self.leftInputBoxView.enableInputBox();
            self.rightInputBoxView.enableInputBox();
            if (self.kickState === 'active') {
                self._enableButton(self.kickButtonView);
            }
            if (self.chopState === 'active') {
                self._enableButton(self.chopButtonView);
            }
        }

    });
})(window.MathInteractives);
