(function () {
    'use strict';
    /**
    * Course holds method and properties to render a course
    * @class Course
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.Course = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Locked status of next course. Used to display appropriate message on positive feedback.
        * @property isNextCourseLocked
        * @default false
        * @public 
        */
        isNextCourseLocked: false,

        /**
        * Paperscope of the canvas
        * @property paperScope
        * @default null
        * @public 
        */
        paperScope: null,

        /**
        * Holds the canvas id
        * @property canvasId
        * @default null
        * @private 
        */
        canvasId: null,

        /**
        * Holds the view of the canvas
        * @property canvasView
        * @default null
        * @private 
        */
        canvasView: null,

        /**
        * Holds the view of the confetti animation
        * @property confettiView
        * @default null
        * @private 
        */
        confettiView: null,

        takeShotBtn: null,

        /**
        * Score card button view instance visible at the bottom-right corner of carousel screen.
        * @property scoreCardBtn
        * @type Object
        * @default null
        */
        scoreCardBtn: null,

        skipAnimationBtn: null,

        animationView: null,

        popupView: null,

        readyCount: 0,

        /**
        * Backbone property for binding events to DOM elements.
        *
        * @property events
        * @private
        */
        events: {
            'click .reset-course-btn.clickEnabled': '_onResetCourseBtnClick',
            'click .course-score-card-btn.clickEnabled': '_onScoreCardBtnClick',
            'click .skip-animation-btn.clickEnabled': '_onSkipAnimationBtnClick'
        },

        /**
        * Initializes function of view.
        * @method initialize
        * @constructor
        */
        initialize: function () {
            this.initializeDefaultProperties();
            this.canvasId = 'game-canvas-' + this.model.get('levelId');
            this.render();
            //todo: baseSetUp not called, alert programmer!
            var courseNumber = Number(this.model.get('levelId')),
                courseTitle = this.getAccMessage('course-title-' + courseNumber, 0),
                obstaclesData = this.model.get('obstaclesData'),
                draggableObstacleCount = 0, index,
                activityAreaAccText;
            activityAreaAccText = this.getAccMessage('main-container-text', 0, [courseNumber + 1, courseTitle]);
            for (index = obstaclesData.length - 1; index >= 0; index--) {
                if (obstaclesData.models[index].get('type') === 'default') {
                    draggableObstacleCount++;
                }
            }
            if (draggableObstacleCount) {
                activityAreaAccText += this.getAccMessage('main-container-text', 1, [draggableObstacleCount]);
            }
            activityAreaAccText += this.getAccMessage('main-container-text', 2);
            this.setAccMessage('main-container-' + courseNumber, activityAreaAccText);
        },

        /**
        * Sets up the canvas view and animation view.
        *
        * @method baseSetUp
        * @param canvasObj {Object} The canvas view,
        **/
        baseSetUp: function (canvasObj) {
            this._attachCanvasEvents(canvasObj);
            this._setUpAnimation();
        },

        /**
        * Renders the view of play game tab
        *
        * @method initialize
        * @public 
        **/
        render: function render() {

            var level, options, model;
            model = this.model;
            level = model.get('levelId');
            options = {
                level: level,
                idPrefix: this.idPrefix,
                obstacles: {
                    level0: (0 == level),
                    level1: (1 == level),
                    level2: (2 == level),
                    level3: (3 == level)
                }
            };
            this.$el.html(MathInteractives.Interactivities.MiniGolf.templates.course(options).trim());
            this.showCanvas(false);
            this._renderBackGroundImage();
            this.loadScreen('course');
            this._initializeDirectionText();
            this._addButtons();
            this._generateConfettiView();
            //Palm Leave img added to below score card button
            this.$('.course-title-obstacle-holder-2').css({ 'background-image': ' url("' + this.filePath.getImagePath('sprites') + '")' });


            if (model.get('customPopupShown') === false) {
                model.set('customPopupShown', true);
                this._createCustomPopup();
                this._setCustomPopupProp();
            }
            else {
                this.setFocusToDirectionText();
            }

        },

        /**
        * Creates the instance of the Confetti View.
        * @method _generateConfettiView
        * @private
        */
        _generateConfettiView: function _generateConfettiView() {
            this.confettiView = new MathInteractives.Interactivities.MiniGolf.Views.Confetti({
                el: '#' + this.idPrefix + 'confetti-container',
                model: this.model,
                neverStop: true
            });
        },
        /**
        * Attaches events to the canvas view object passed.
        * @method _attachCanvasEvents
        * @private
        */
        _attachCanvasEvents: function (canvasObj) {
            this.canvasView = canvasObj;
            var baseCanvasEvents = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS,
                canvasView = canvasObj;
            canvasView.on(baseCanvasEvents.HOLE_ENCOUNTERED, $.proxy(this.showhideTakeShotButton, this));
            canvasView.on(baseCanvasEvents.DISABLE_RESET, $.proxy(this._setResetButtonInModel, this));
            canvasView.on(baseCanvasEvents.ENABLE_RESET, $.proxy(this.enableResetBtn, this));
            canvasView.on(baseCanvasEvents.TOOL_UP_EVENT, $.proxy(this._onCanvasInteraction, this));
            canvasView.on(baseCanvasEvents.READY, $.proxy(this._onCourseReady, this));
            canvasView.on(baseCanvasEvents.HIDE_TAKE_SHOT_BUTTON, $.proxy(this.showhideTakeShotButton, this));
        },

        _setUpAnimation: function () {
            var obj = new MathInteractives.Interactivities.MiniGolf.Views.Animation({
                model: this.model,
                canvasView: this.canvasView
            });
            this.animationView = obj;
            this.animationView.setPaperScope(this.canvasView.paperScope2);

            this.animationView.on(MathInteractives.Interactivities.MiniGolf.Views.Animation.EVENTS.READY,
                                  $.proxy(this._onCourseReady, this));
            this.attachEventsOnAnimationView();
        },

        _onCourseReady: function () {
            this.readyCount++;
            if (this.readyCount === 2) {
                this.readyCount = 0;
                this.showCanvas(true);
            }
        },

        showCanvas: function (show) {
            var $canvasHolder = this.$('.canvas-holder');
            if (show) {
                $canvasHolder.show();
                this.canvasView.paperScope.view.draw();
                this.canvasView.paperScope2.view.draw();
            }
            else {
                $canvasHolder.hide();
            }
        },


        /**
        * Attaches/detaches event handlers on animation view object depending on boolean passed.
        *
        * @method attachEventsOnAnimationView
        * @param [enable] {Boolean} If false, the event handlers are detached
        */
        attachEventsOnAnimationView: function attachEventsOnAnimationView(enable) {
            var animeViewObj = this.animationView,
                animationEvents = MathInteractives.Interactivities.MiniGolf.Views.Animation.EVENTS;
            if (enable === false) {
                animeViewObj.off(animationEvents.BALL_REFLECTED);
                animeViewObj.off(animationEvents.BALL_ANIMATION_STARTED);
                animeViewObj.off(animationEvents.INCORRECT_REFLECTION_ANGLE);
                animeViewObj.off(animationEvents.BALL_IN_HOLE);
                animeViewObj.off(animationEvents.BALL_ANIMATION_ENDED);
            }
            else {
                animeViewObj.on(animationEvents.BALL_REFLECTED, $.proxy(this._onBallReflection, this));
                animeViewObj.on(animationEvents.BALL_ANIMATION_STARTED, $.proxy(this._onAnimationStart, this));
                animeViewObj.on(animationEvents.INCORRECT_REFLECTION_ANGLE, $.proxy(this._onIncorrectAnimationEnd, this));
                animeViewObj.on(animationEvents.BALL_IN_HOLE, $.proxy(this._onCorrectAnimationEnd, this));
                animeViewObj.on(animationEvents.BALL_ANIMATION_ENDED, $.proxy(this._onAnimationEnd, this));
            }
        },

        _onBallReflection: function _onBallReflection() {
            this.log('play sound on reflection');
            //this.play('ball-collision');

        },

        /**
        * Called at start of animation, the method is used to disable all buttons.
        *
        * @method _onAnimationStart
        * @private
        */
        _onAnimationStart: function _onAnimationStart() {

            // todo: play sound at start of ball animation.

            this.player.enableAllHeaderButtons(false);

            var disabledButtonState = MathInteractives.global.Theme2.Button.BUTTON_STATE_DISABLED;
            this.directionTextView.changeButtonState(disabledButtonState);
            this.directionTextView.disableTTS(true);
            this.resetBtn.setButtonState(disabledButtonState);
            this.scoreCardBtn.setButtonState(disabledButtonState);
            this.showhideTakeShotButton(false);
            this.showHideSkipAnimationButton(true);
            this.canvasView.onAnimationStarted();
            var level = this.model.get('levelId');
            this.setFocus('skip-animation-btn-' + level);
            this.enableTab('main-container-' + level, false);
            this.enableTab('canvas-holder-' + level + '-acc-container', false);
            //$('#' + this.idPrefix + 'game-canvas-' + this.model.get('levelId')).hide();
        },

        /**
        * Called at end of animation, the method is used to enable all buttons.
        *
        * @method _onAnimationEnd
        * @private
        */
        _onAnimationEnd: function _onAnimationEnd() {
            var activeButtonState = MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE,
                level = this.model.get('levelId');
            this.enableTab('main-container-' + level);
            this.enableTab('canvas-holder-' + level + '-acc-container');
            this.directionTextView.changeButtonState(activeButtonState);
            this.directionTextView.disableTTS(false);
            this.resetBtn.setButtonState(activeButtonState);
            this.scoreCardBtn.setButtonState(activeButtonState);
            this.canvasView.onAnimationEnded();
            this.showHideSkipAnimationButton(false);
            $('#' + this.idPrefix + 'game-canvas-' + this.model.get('levelId')).css('z-index', 2);
            $('#' + this.idPrefix + 'game-canvas-' + this.model.get('levelId') + '-2').css('z-index', 1);
            this.animationView.changeBallLayer(this.canvasView.paperScope);
            this.canvasView.paperScope.view.draw();
            this.canvasView.paperScope2.view.draw();
        },

        /**
        * Called at end of correct shot animation, the method is used to generate a hole-in-one pop-up.
        *
        * @method _onCorrectAnimationEnd
        * @private
        */
        _onCorrectAnimationEnd: function _onCorrectAnimationEnd() {
            var model = this.model;
            model.set('state', MathInteractives.Interactivities.MiniGolf.Models.Course.COURSE_TYPE.TYPE_1);
            model.set('holesInOne', Number(model.get('holesInOne') || 0) + 1);
            this.trigger(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.UNLOCK_NEXT_COURSE);
            this.animationView.showHideAnimatingBall(false);

            var options, popUpView,
                currentLevelId, nextCourseLevelId,
                nextCourseName;
            var msgText = this.isNextCourseLocked ? "body-text" : "body-text-already-unlocked";

            currentLevelId = Number(model.get('levelId'));
            nextCourseLevelId = currentLevelId + 1;
            nextCourseName = this.getMessage('course-title-' + nextCourseLevelId, 0);

            options = {
                text: this.getMessage('hole-in-1-pop-up-text', msgText, [nextCourseName]),
                accText: this.getAccMessage('hole-in-1-pop-up-text', msgText, [nextCourseName]),
                containsTts: true,
                showCallback: {
                    fnc: function () {
                        this.confettiView.setUpConfetti();
                    },
                    scope: this
                },
                closeCallback: {
                    fnc: function (response) {
                        //this._onAnimationEnd();
                        if (response.buttonClicked === 'next-hole-button') {
                            this.trigger(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.NEXT_HOLE);
                        }
                        this.confettiView.stopConfetti();
                        this.popupView.$el.find('#' + this.idPrefix + 'theme-2-pop-up-modal').removeClass('bg-transparent');
                        this.canvasView.reset();
                        model.set('resetCourseButton', false);
                        this.enableResetBtn(false);
                        this.player.enableAllHeaderButtons(true);
                        if (response.buttonClicked === 'play-again-button') {
                            this.setFocus('main-container-' + model.get('levelId'));
                        }
                    },
                    scope: this
                },
                buttons: [
                    {
                        id: 'play-again-button',
                        type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                        text: this.getMessage('hole-in-1-pop-up-text', 'play-again-btn'),
                        response: { isPositive: true, buttonClicked: 'play-again-button' },
                        baseClass: 'course-pop-up-btn'
                    },
                    {
                        id: 'next-hole-button',
                        type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                        text: this.getMessage('hole-in-1-pop-up-text', 'next-hole-btn'),
                        response: { isPositive: true, buttonClicked: 'next-hole-button' },
                        baseClass: 'course-pop-up-btn'
                    }
                ],
                width: 454,
                title: this.getMessage('hole-in-1-pop-up-text', 'title'),
                accTitle: this.getAccMessage('hole-in-1-pop-up-text', 'title'),
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                idPrefix: this.idPrefix,
                foregroundImageBackgroundPosition: '-720px -687px',//'0px -2429px',
                foregroundImage: {
                    imageId: 'sprites',
                    imageHeight: 156,//599,
                    imageWidth: 131//928
                },
                titleTextColorClass: 'course-pop-up-title-color-blue',
                bodyTextColorClass: 'course-pop-up-body-color'
            };

            switch (currentLevelId) {
                case 0:
                    options.foregroundImage.imageHeight = 156;
                    options.foregroundImage.imageWidth = 131;
                    options.foregroundImageBackgroundPosition = '-720px -687px';
                    break;
                case 1:
                    options.foregroundImage.imageHeight = 165;
                    options.foregroundImage.imageWidth = 129;
                    options.foregroundImageBackgroundPosition = '-720px -853px';
                    break;
                case 2:
                    options.foregroundImage.imageHeight = 146;
                    options.foregroundImage.imageWidth = 145;
                    options.foregroundImageBackgroundPosition = '-720px -1028px';
                    break;
                case 3:
                    options = this._createCourse4Popup();
                    break;

            }

            this.popupView = popUpView = MathInteractives.global.Theme2.PopUpBox.createPopup(options);

            popUpView.$el.find('.theme2-pop-up-foreground').css({ left: 173, top: -111 });
            if (currentLevelId === 3) {
                popUpView.$el.find('.theme2-pop-up-foreground').css({ top: -81 });
            }

            popUpView.$el.find('#' + this.idPrefix + 'theme2-pop-up-modal').addClass('bg-transparent');

            //popUpView.$el.find('.theme2-pop-up-dialogue').addClass('bounceInUp');

            popUpView.$el.find('.theme2-pop-up-dialogue').addClass('bounceInDown').addClass('animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                $(this).removeClass('bounceInDown').removeClass('animated');
            });

        },



        /**
        * Called at end of incorrect shot animation, the method is used to generate a misjudged shot pop-up.
        *
        * @method _onIncorrectAnimationEnd
        * @private
        */
        _onIncorrectAnimationEnd: function _onIncorrectAnimationEnd(data) {
            var options, popUpView, popUpTextId;
            popUpTextId = 'body-text';
            options = {
                text: this.getMessage('misjudged-shot-pop-up-text', popUpTextId),
                accText: this.getAccMessage('misjudged-shot-pop-up-text', popUpTextId),
                containsTts: true,
                closeCallback: {
                    fnc: function () {
                        this.player.enableAllHeaderButtons(true);
                        this.setFocus('canvas-holder-' + this.model.get('levelId') + '-acc-container');
                        //this._onAnimationEnd();
                    },
                    scope: this
                },
                buttons: [
                    {
                        id: 'okay-button',
                        type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                        text: this.getMessage('misjudged-shot-pop-up-text', 'okay-btn'),
                        response: { isPositive: true, buttonClicked: 'okay-button' },
                        baseClass: 'course-pop-up-btn'
                    }
                ],
                width: 462,
                title: this.getMessage('misjudged-shot-pop-up-text', 'title'),
                accTitle: this.getAccMessage('misjudged-shot-pop-up-text', 'title'),
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                idPrefix: this.idPrefix,
                foregroundImageBackgroundPosition: '-700px -1220px',
                foregroundImage: {
                    imageId: 'sprites',
                    imageHeight: 108,
                    imageWidth: 135
                },
                titleTextColorClass: 'course-pop-up-title-color',
                bodyTextColorClass: 'course-pop-up-body-color'
            };
            this.canvasView.highLightIncorrectPath(this.animationView.ballIndex);
            if (!data.isFalseAngle) {
                if (this.canvasView.arrow) {
                    this.canvasView.arrow.removeChildren();
                }
            }
            popUpView = MathInteractives.global.Theme2.PopUpBox.createPopup(options);
            popUpView.$el.find('.theme2-pop-up-foreground').css({ left: 164, top: -75 });
        },

        /**
        * Renders the background with the proper couse image.
        * @method _renderBackGroundImage
        * @private
        */
        _renderBackGroundImage: function () {
            var levelId = this.model.get('levelId');
            this.$el.find('.main-container').css({
                'background-image': 'url(' + this.getImagePath('course-bg-sprite') + ')'
            });
        },


        /**
        * Initializes the direction text for play game course playing tab view.
        * @method _initializeDirectionText
        * @private
        */
        _initializeDirectionText: function () {
            var model = this.model,
                levelId = model.get('levelId'),
                directionProperties = {
                    tabIndex: 540,
                    buttonTabIndex: 600,
                    containerId: this.idPrefix + 'direction-text-' + levelId,
                    idPrefix: this.idPrefix,
                    player: this.player,
                    manager: this.manager,
                    path: this.filePath,
                    text: this.getMessage('course-direction-text', 0),
                    accText: this.getAccMessage('course-direction-text', 0),
                    textColor: '#ffffff',
                    containmentBGcolor: 'rgba(57, 92, 43, 1)',
                    showButton: true,
                    buttonText: this.getMessage('direction-text-button-text', 0),
                    btnTextColor: '#466E36',
                    clickCallback: {
                        fnc: this._onNewHoleClicked,
                        scope: this
                    },
                    customClass: 'mini-golf-direction-custom-class'
                };

            switch (levelId) {
                case 0:
                    directionProperties.textColor = '#ffffff';
                    directionProperties.containmentBGcolor = 'rgba(57, 92, 43, 1)';
                    directionProperties.btnTextColor = '#466E36';
                    directionProperties.ttsBaseClass = 'white-button-tts';
                    directionProperties.btnBaseClass = 'white-button';
                    break;
                case 1:
                    directionProperties.textColor = '#ffffff';
                    directionProperties.containmentBGcolor = 'rgba(0, 0, 0, 0.3)';
                    directionProperties.btnTextColor = '#222222';
                    directionProperties.ttsBaseClass = 'course-2-new-hole-tts';
                    directionProperties.btnBaseClass = 'course-2-new-hole';
                    break;
                case 2:
                    directionProperties.textColor = '#5E573F';
                    directionProperties.containmentBGcolor = 'rgba(255, 255, 255, 0.3)';
                    directionProperties.btnTextColor = '#FFFFFF';
                    directionProperties.ttsBaseClass = 'course-3-new-hole-tts';
                    directionProperties.btnBaseClass = 'course-3-new-hole';
                    break;
                case 3:
                    directionProperties.textColor = '#6B6052';
                    directionProperties.containmentBGcolor = 'rgba(255, 255, 255, 0.5)';
                    directionProperties.btnTextColor = '#FFFFFF';
                    directionProperties.ttsBaseClass = 'course-4-new-hole-tts';
                    directionProperties.btnBaseClass = 'course-4-new-hole';
                    break;
            }

            this.directionTextView = MathInteractives.global.Theme2.DirectionText.generateDirectionText(directionProperties);
        },

        setFocusToDirectionText: function setFocusToDirectionText() {
            var directionTextId = 'direction-text-' + this.model.get('levelId') + '-direction-text-text';
            this.setFocus(directionTextId);
            this.updateFocusRect(directionTextId);
        },

        /**
        * Generate reset level button, take shot button, score card button.
        *
        * @method _addButtons
        * @private
        **/
        _addButtons: function _addButtons() {
            var model, levelId, options;
            model = this.model;
            levelId = model.get('levelId');
            options = {
                'player': this.player,
                'manager': this.manager,
                'idPrefix': this.idPrefix,
                'path': this.filePath,
                'data': {
                    'id': this.idPrefix + 'reset-course-btn-' + levelId,
                    'type': MathInteractives.global.Theme2.Button.TYPE.RESET,
                    'height': 38,
                    'width': 45,
                    'tooltipText': this.getMessage('reset-btn', 0)
                }
            };
            this.resetBtn = MathInteractives.global.Theme2.Button.generateButton(options);

            options.data = {
                //todo: replace with this.idPrefix + 'take-shot-btn-' + levelId,
                'id': this.idPrefix + 'take-shot-btn-holder-' + levelId,
                'text': this.getMessage('take-shot-btn', 0),
                'type': MathInteractives.global.Theme2.Button.TYPE.TEXT,
                'width': 112,
                'height': 38
            };

            this.takeShotBtn = MathInteractives.global.Theme2.Button.generateButton(options);
            this.takeShotBtn.$el.on('click', $.proxy(this._onTakeShotClicked, this));

            this.showhideTakeShotButton(false);

            options.data = {
                'id': this.idPrefix + 'skip-animation-btn-' + levelId,
                'text': this.getMessage('skip-animation-btn-text', 0),
                'type': MathInteractives.global.Theme2.Button.TYPE.TEXT
            }
            this.skipAnimationBtn = MathInteractives.global.Theme2.Button.generateButton(options);
            this.showHideSkipAnimationButton(false);
            this._positionTakeShotButton();

            options.data = {
                'id': this.idPrefix + 'course-score-card-btn-' + levelId,
                'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                'colorType': MathInteractives.global.Theme2.Button.COLORTYPE.GREEN,
                'text': this.getMessage('score-card-btn', 0),
                'height': 38,
                'width': 150,
                'textColor': '#FFFFFF',
                'borderRadius': 3,
                'icon': {
                    'faClass': this.getFontAwesomeClass('trophy'),
                    'fontWeight': 'normal',
                    'fontSize': 18,
                    'fontColor': '#FFFFFF',
                    'height': 22,//18,
                    'width': 25
                },
                'textPosition': 'right',
                'baseClass': 'course-score-card-btn'
            }
            this.scoreCardBtn = MathInteractives.global.Theme2.Button.generateButton(options);

            this.enableResetBtn(this.model.get('resetCourseButton'));
        },

        /**
        * Position the take-shot button 20 pixels below the hole. 
        *
        * @method _positionTakeShotButton
        * @private
        */
        _positionTakeShotButton: function _positionTakeShotButton() {
            var model, levelId, holeData,
                holePosition, holeX, holeY,
                holeRadius,
                $btnEl = this.takeShotBtn.$el,
                distanceFromHole = 20,
                animationButtonLeftWidhtBy2 = 84,
                btnTop, btnLeft,
                $animationButtonHolder;
            model = this.model;
            levelId = model.get('levelId');
            holeData = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.HOLES['COURSE_' + levelId];
            holePosition = holeData.POSITION;
            holeX = holePosition.x;
            holeY = holePosition.y;
            holeRadius = holeData.RADIUS;
            $animationButtonHolder = this.$('.skip-animation-btn-holder-' + levelId);

            btnTop = holeY - holeRadius - distanceFromHole * 3 - 2;// button 20 px above the hole


            btnLeft = holeX - $btnEl.width() / 2;
            $btnEl.css({
                'top': btnTop,
                'left': btnLeft
            });
            if (levelId === 2) {
                btnLeft = btnLeft;
            }
            else {

                btnLeft = holeX - animationButtonLeftWidhtBy2;
            }
            $animationButtonHolder.css({
                'top': btnTop,
                'left': btnLeft
            })
        },

        /**
        * Enables/disables reset button depending on parameter passed. 
        *
        * @method enableResetBtn
        * @param enable {Boolean} False to disable the button.
        **/
        enableResetBtn: function enableResetBtn(enable) {
            var ButtonClass = MathInteractives.global.Theme2.Button;
            if (enable === false) {
                this.model.set('resetCourseButton', false);
                //this.resetBtn.setButtonState(ButtonClass.BUTTON_STATE_DISABLED);
            }
            else {
                this.resetBtn.setButtonState(ButtonClass.BUTTON_STATE_ACTIVE);
            }
        },

        showhideTakeShotButton: function (enable) {
            var animationClass = 'bounceIn';
            if (enable) {
                this.takeShotBtn.showButton();
                this.takeShotBtn.$el.addClass(animationClass).addClass('animated');
                this.canvasView.hideHole(true);
            }
            else {
                this.takeShotBtn.$el.removeClass(animationClass).removeClass('animated');
                this.takeShotBtn.hideButton();
            }
        },

        showHideSkipAnimationButton: function showHideSkipAnimationButton(enable) {
            if (enable) {
                this.skipAnimationBtn.showButton();
            }
            else {
                this.skipAnimationBtn.hideButton();
            }
        },

        _setResetButtonInModel: function _setResetButtonInModel() {
            this.model.set('resetCourseButton', true);
            this.enableResetBtn(true);
        },

        _onTakeShotClicked: function (event) {
            this.showhideTakeShotButton(false);
            var self = this;
            this.stopReading();
            this.play('ball-hit');
            $('#' + this.idPrefix + 'game-canvas-' + this.model.get('levelId')).css('z-index', 1);
            $('#' + this.idPrefix + 'game-canvas-' + this.model.get('levelId') + '-2').css('z-index', 2);
            var timesPlayed = this.model.get('timesPlayed') || 0;
            timesPlayed++;
            this.trigger(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.ENABLE_CLEAR_BUTTON);
            this.model.set('timesPlayed', timesPlayed);
            setTimeout(function () {
                self._launchBall();
            }, 200);
        },

        _launchBall: function () {
            var self = this;
            setTimeout(function () {
                self.animationView.launchBall()
            }, 100);
        },

        /**
        * Called on clicking on the score card button, it triggers the event {{#crossLink "MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData/SCORECARD_BTN_CLICKED:event"}}{{/#crossLink}}
        *
        * @method _onScoreCardBtnClick
        * @private
        */
        _onScoreCardBtnClick: function _onScoreCardBtnClick() {
            this.stopReading();
            this.trigger(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.SCORECARD_BTN_CLICKED);
        },

        _onSkipAnimationBtnClick: function _onSkipAnimationBtnClick() {
            this.animationView.skipAnimation();
        },

        /**
        * Generates an alert type pop-up warning the user that proceeding would clear all the angles formed.
        *
        * @method _onResetCourseBtnClick
        * @private
        */
        _onResetCourseBtnClick: function _onResetCourseBtnClick() {
            if (this.model.get('resetCourseButton')) {
                var options = {
                    manager: this.manager,
                    path: this.filePath,
                    player: this.player,
                    idPrefix: this.idPrefix,
                    containsTts: true,
                    title: this.getMessage('reset-pop-up-text', 'title'),
                    accTitle: this.getAccMessage('reset-pop-up-text', 'title'),
                    text: this.getMessage('reset-pop-up-text', 'body-text'),
                    accText: this.getAccMessage('reset-pop-up-text', 'body-text'),
                    type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                    buttons: [
                        {
                            id: 'okay-button',
                            type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                            text: this.getMessage('reset-pop-up-text', 'okay-btn'),
                            response: { isPositive: true, buttonClicked: 'okay-button' }
                        },
                        {
                            id: 'cancel-button',
                            type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                            text: this.getMessage('reset-pop-up-text', 'cancel-btn'),
                            response: { isPositive: false, buttonClicked: 'cancel-button' }
                        }
                    ],
                    closeCallback: {
                        fnc: function (response) {
                            if (response.isPositive === true) {
                                this.canvasView.reset();
                                this.animationView.showHideAnimatingBall(false);
                                this.model.set('resetCourseButton', false);
                                this.enableResetBtn(false);
                                this.showhideTakeShotButton(false);
                                this.animationView.reset();
                                this.setFocus('main-container-' + this.model.get('levelId'));
                            }
                            else {
                                this.setFocus('reset-course-btn-' + this.model.get('levelId'));
                            }
                        },
                        scope: this
                    }
                };
                this.stopReading();
                MathInteractives.global.Theme2.PopUpBox.createPopup(options);
            }
        },

        _onCanvasInteraction: function () {
            this.canvasView.trivializeIncorrectPath(this.animationView.ballIndex);
            this.animationView.reset();
        },

        /**
        * Displays the carousel view so that user can select new course.
        * @method _onNewHoleClicked
        * @private
        */
        _onNewHoleClicked: function () {
            this.stopReading();
            this.trigger(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.NEW_HOLE_CLICKED);
        },

        /**
        * Removes the view from DOM.
        *
        * @method destroyView
        */
        destroyView: function destroyView() {
            if (this.model.get('obstaclesData').length) {
                this.canvasView.resetObstaclesSnappedBallCount();
            }
            this.remove();
        },

        _createCustomPopup: function _createCustomPopup() {

            var idPrefix = this.idPrefix,
                levelId = this.model.get('levelId'),
                popUpOptions = {
                    player: this.player,
                    manager: this.manager,
                    filePath: this.filePath,
                    idPrefix: idPrefix,
                    emptyModalId: idPrefix + 'custom-pop-up',
                    bodyElemAccId: 'course-' + levelId + '-got-it-button',
                    dialogAccText: this.getMessage('course-' + levelId + '-custom-popup-text', 0)
                };


            this.emptyModalView = MathInteractives.global.Theme2.EmptyModal.createEmptyModal(popUpOptions);
        },
        _setCustomPopupProp: function _setCustomPopupProp() {

            var emptyModalView = this.emptyModalView,
                model = this.model,
                templateData = {
                    idPrefix: this.idPrefix,
                    courseNumber: model.get('levelId'),
                    imageCount: model.get('customImageCountObject')
                },
                currentTemplate = MathInteractives.Interactivities.MiniGolf.templates.customPopup(templateData).trim();

            emptyModalView.setBody(currentTemplate);

            this._createGotItButton();
            this._setPopupImages();


        },
        _setPopupImages: function _setPopupImages() {
            var spriteImage = this.getImagePath('sprites');

            this.emptyModalView.$('.image-cont').css({
                'background-image': 'url(' + spriteImage + ')'
            })
        },

        _createGotItButton: function () {

            var idPrefix = this.idPrefix,
                gotItButton = null,
                self = this,
                emptyModalView = this.emptyModalView,
                buttonData = {
                    'player': this.player,
                    'manager': this.manager,
                    'idPrefix': idPrefix,
                    'path': this.filePath,
                    'data': {
                        'id': idPrefix + 'course-' + this.model.get('levelId') + '-got-it-button',
                        type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                        'colorType': MathInteractives.global.Theme2.Button.COLORTYPE.BLUE,
                        'text': this.getMessage('got-it-btn', 0),
                        baseClass: 'one-time-popup-got-it-button'
                    }
                };
            ;
            this.gotItButton = gotItButton = MathInteractives.global.Theme2.Button.generateButton(buttonData);
            gotItButton.$el.on('click', function () {
                emptyModalView.hideEmptyModel();
                emptyModalView.remove();
                self.setFocusToDirectionText();
            })

        },
        _onCanvasAccKeyup: function _onCanvasAccKeyup(event) {
            var coureTitle = null,
                keyCodeConstants = currentModelName.KEYCODE,
                canvasView = this.canvasView,
                obastacleLength = null,
                strMessage = null;

            if (event.keyCode === keyCodeConstants.TAB) {
                coureTitle = this.getMessage('carousel-view-slide-0-title', 0)
                strMessage = this.getMessage('canvas-acc-cont-text', 0, [coureTitle]);
                if (Math.abs(canvasView.ballViewList.length - 2) > 0) {
                    strMessage = strMessage + this.getMessage('canvas-acc-cont-text', 1);
                }
                obastacleLength = canvasView.obstacles.length;

                if (obastacleLength > 0) {
                    strMessage = strMessage + this.getMessage('canvas-acc-cont-text', 2, [obastacleLength]);
                }
                this.setAccMessage('canvas-holder-0-acc-container', strMessage);
            }
        }

    });
    var currentModelName = MathInteractives.Interactivities.MiniGolf.Models.Course;
})();