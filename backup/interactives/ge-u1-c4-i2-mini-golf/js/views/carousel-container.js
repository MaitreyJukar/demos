(function () {
    'use strict';
    /**
    * CarouselContainer holds the necessary structure for the carousel, direction text and score card button.
    * @class Carousel
    * @module MiniGolf
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.CarouselContainer = MathInteractives.Common.Player.Views.Base.extend({

        courseModelClassName: null,
        /**
        * Unique interactivity id prefix
        * @property idprefix
        * @default null
        * @private
        */
        idPrefix: null,

        /**
        * Model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Manager object
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * Reference to player object
        * @property player
        * @type Object
        * @default null
        */
        player: null,

        /**
        * Score card button view instance visible at the bottom-right corner of carousel screen.
        * @property scoreCardBtn
        * @type Object
        * @default null
        */
        scoreCardBtn: null,

        /**
        * Carousel view instance.
        * @property carouselView
        * @type Object
        * @default null
        */
        carouselView: null,

        /**
        * Backbone property for binding events to DOM elements.
        *
        * @property events
        * @private
        */
        events: {
            'click .carousel-page-score-card-btn.clickEnabled': '_onScoreCardBtnClick'
        },

        /**
        * Initializes function of ball view.
        * @method initialize
        * @constructor
        */
        initialize: function () {
            var courseModelClassName = null;

            this.courseModelClassName = courseModelClassName = MathInteractives.Interactivities.MiniGolf.Models.Course;

            var htmlFromTemplate;
            this.initializeDefaultProperties();
            htmlFromTemplate = MathInteractives.Interactivities.MiniGolf.templates.carouselContainer({ idPrefix: this.idPrefix }).trim();
            this.$el.html(htmlFromTemplate);
            this._addCarouselDirectionText();
            this._addScoreCardButton();

            this._generateCarousel();

            this.render();
            this.loadScreen('carousel-page');

            this._attachEventsOnCarousel();
            this.player.bindTabChange(function () {

                this.updateFocusRect('carousel-page-direction-text-holder-direction-text-text');
            }, this, 1)
        },


        initializeDefaultProperties:function initializeDefaultProperties(){

            this._superwrapper('initializeDefaultProperties',arguments);
            this.isMobile=MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;
        },
        render: function render() {
            this._addImagesToSlides();
        },

        /**
        * Add component direction text in carousel view
        *
        * @method _addCarouselDirectionText
        * @private
        */
        _addCarouselDirectionText: function _addCarouselDirectionText() {
            var containerId, options;
            containerId = this.idPrefix + 'carousel-page-direction-text-holder';
            options = {
                tabIndex: 510,
                text: this.getMessage('carousel-direction-text', 0),
                accText: this.getAccMessage('carousel-direction-text', 0),
                idPrefix: this.idPrefix,
                containerId: containerId,
                manager: this.manager,
                player: this.player,
                path: this.filePath,
                ttsColorType: MathInteractives.global.Theme2.Button.COLORTYPE.TTS_WHITE,
                textColor: '#ffffff',
                containmentBGcolor: 'rgba(57, 92, 43, 1)',
                customClass: 'mini-golf-direction-custom-class'
            };
            MathInteractives.global.Theme2.DirectionText.generateDirectionText(options);
        },

        setFocusToDirectionText: function setFocusToDirectionText() {
            this.setFocus('carousel-page-direction-text-holder-direction-text-text');
        },

        /**
        * Add score card button in carousel view
        *
        * @method _addScoreCardButton
        * @private
        */
        _addScoreCardButton: function _addScoreCardButton() {
            var options;
            options = {
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                idPrefix: this.idPrefix,
                data: {
                    'id': this.idPrefix + 'carousel-page-score-card-btn',
                    'type': MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                    'colorType': MathInteractives.global.Theme2.Button.COLORTYPE.GREEN,
                    'text': this.getMessage('score-card-btn', 0), //'Score Card',
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
                    'baseClass': 'carousel-page-score-card-btn'
                }
            };
            this.scoreCardBtn = MathInteractives.global.Theme2.Button.generateButton(options);
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

        /**
        * Generates and stores instaces of carousel model, view.
        *
        * @method _generateCarousel
        * @private
        */
        _generateCarousel: function _generateCarousel() {
            var carouselProperties, savedCarouselModel,
                courseModel = this.model.get('courses'),
                timesPlayedText, holesInOneText, lockedText;
            savedCarouselModel = this.model.get('carouselModel');
            carouselProperties = {
                containerId: 'carousel-view',
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                filePath: this.filePath,
                screenId: 'carousel-screen',
                slidesData: [
                    {
                        'templateModule': "MiniGolf",
                        'templateName': 'slide',
                        'data': {
                            'slideNumber': 0,
                            'unlocked': true,
                            'timesPlayed': courseModel[0].get('timesPlayed') || 0,
                            'holesInOne': courseModel[0].get('holesInOne') || 0
                        }
                    },
                    {
                        'templateModule': "MiniGolf",
                        'templateName': 'slide',
                        'data': {
                            'slideNumber': 1,
                            'unlocked': false,
                            'timesPlayed': courseModel[1].get('timesPlayed') || 0,
                            'holesInOne': courseModel[1].get('holesInOne') || 0
                        }
                    },
                    {
                        'templateModule': "MiniGolf",
                        'templateName': 'slide',
                        'data': {
                            'slideNumber': 2,
                            'unlocked': false,
                            'timesPlayed': courseModel[2].get('timesPlayed') || 0,
                            'holesInOne': courseModel[2].get('holesInOne') || 0
                        }
                    },
                    {
                        'templateModule': "MiniGolf",
                        'templateName': 'slide',
                        'data': {
                            'slideNumber': 3,
                            'unlocked': false,
                            'timesPlayed': courseModel[3].get('timesPlayed') || 0,
                            'holesInOne': courseModel[3].get('holesInOne') || 0
                        }
                    }
                ],
                defaultSlideNumber: this.model.get('currentCourseLevel'),
                oneSlideShiftDistance: MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.SLIDE_DISTANCE
            };
            if (savedCarouselModel) {
                savedCarouselModel['player'] = this.player;
                savedCarouselModel['manager'] = this.manager;
                savedCarouselModel['filePath'] = this.filePath;
                savedCarouselModel['idPrefix'] = this.idPrefix;
                this.carouselModel = new MathInteractives.Interactivities.MiniGolf.Models.Carousel(savedCarouselModel);
            }
            else {
                this.carouselModel = new MathInteractives.Interactivities.MiniGolf.Models.Carousel(carouselProperties);
            }
            this.carouselView = new MathInteractives.Interactivities.MiniGolf.Views.Carousel({
                el: '#' + this.idPrefix + 'carousel-view',
                model: this.carouselModel
            });
            this.model.set('carouselModel', this.carouselModel);
        },

        /**
        * Attached event handlers for custom events triggered on carousel view.
        *
        * @method _attachEventsOnCarousel
        * @private
        **/
        _attachEventsOnCarousel: function _attachEventsOnCarousel() {
            var carouselEvents, $carouselAccDiv;
            carouselEvents = MathInteractives.Interactivities.MiniGolf.Models.Carousel.EVENTS;
            this.carouselView.on(carouselEvents.CAROUSEL_SLIDE_CLICK_EVENT, $.proxy(this._onCarouselSlideClick, this))
                .on(carouselEvents.SLIDE_CHANGE_ANIMATION_START, $.proxy(this._onSlideChangeAnimationStart, this))
                .on(carouselEvents.SLIDE_CHANGE_ANIMATION_END, $.proxy(this._onSlideChangeAnimationEnd, this))
                .on(carouselEvents.ALREADY_AT_END, $.proxy(this._onAttemptingSlideChangeAtCarouselEnd, this));

            this.$('.carousel-view-carousel-acc-div').off('keyup')
                .on('keyup', $.proxy(this._onCarouselAccDivKeyUp, this))
                .off('keydown').on('keydown', $.proxy(this._onCarouselAccDivKeyDown, this));

        },

        /**
        * Event handler for the event {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/BALL_DRAGGED:event"}}{{/crossLink}}
        * called when user tries to navigate left of leftmost slide and/or right of rightmost slide using arrow keys.
        * @method _onAttemptingSlideChangeAtCarouselEnd
        * @private
        */
        _onAttemptingSlideChangeAtCarouselEnd: function _onAttemptingSlideChangeAtCarouselEnd() {
            this._setCarouselText({ addPrefix: true, endOfSlide: true });
        },

        /**
        * Key down event handler for carousel accessibility DIV; it resets the accessibility text on TAB.
        *
        * @method _onCarouselAccDivKeyDown
        * @param e {Object} Key down event object.
        * @private
        */
        _onCarouselAccDivKeyDown: function _onCarouselAccDivKeyDown(e) {
            e = (e) ? e : window.event;
            var charCode = (e.keyCode) ? e.keyCode : e.which;
            if (charCode === 9) {
                this._setCarouselText({ setFocus: false });
            }
        },

        /**
        * Key up event handler for carousel accessibility DIV; used to navigate using arrow keys and click
        * using space or enter key.
        *
        * @method _onCarouselAccDivKeyUp
        * @param e {Object} Key up event object.
        * @private
        */
        _onCarouselAccDivKeyUp: function _onCarouselAccDivKeyUp(e) {
            e = (e) ? e : window.event;
                var model = this.model;

            var charCode = (e.keyCode) ? e.keyCode : e.which;
            switch (charCode) {
                case 13:
                case 32:
                    this.$('.current-slide').trigger('click');
                    break;
                case 37: // left arrow key
                    this.carouselView.onPrevSlideBtnClick();

                    break;
                case 39: // right arrow key
                    this.carouselView.onNextSlideBtnClick();
                    break;
                case 9:
                    if (model.get('animationPlaying') === true) {
                        model.set('allowSlideSelfFocus', false);
                    }
                    break;

            }
        },

        /**
        * Called on start of slide change animation; used to play the 'swoosh' sound.
        *
        * @method _onSlideChangeAnimationStart
        * @private
        */
        _onSlideChangeAnimationStart: function _onSlideChangeAnimationStart() {
            var hideSlideAccCont = true;
            this._showHideCanvasCont(hideSlideAccCont);
            this.enableAllHeaderButtons(false);
            this.model.set('animationPlaying', true);
            this.play('swoosh-sound');//add entry after creating a audio sprite
        },
        _showHideCanvasCont: function (hideSlideAccCont) {

            var model = this.model;
            if (hideSlideAccCont) {

                this.setFocus('carousel-view-carousel-temp-focus-div');
            }
            else {
                if (model.get('allowSlideSelfFocus') === true) {
                    this.setFocus('.carousel-view-carousel-acc-div');
                }
                else {
                    model.set('allowSlideSelfFocus', false);
                }

            }

        },
        enableAllHeaderButtons: function enableAllHeaderButtons(enableButtons) {
            var buttonState = MathInteractives.global.Theme2.Button;

            //activeButtonState = MathInteractives.global.Theme2.Button.BUTTON_STATE_ACTIVE,
            this.player.enableAllHeaderButtons(enableButtons);
            if (enableButtons === true) {
                this.scoreCardBtn.setButtonState(buttonState.BUTTON_STATE_ACTIVE);
            }
            else {
                this.scoreCardBtn.setButtonState(buttonState.BUTTON_STATE_DISABLED);
            }

        },
        /**
        * Event handler for the {{#crossLink "MathInteractives.Interactivities.MiniGolf.Models.Carousel/CAROUSEL_SLIDE_CLICK_EVENT:event"}}custom event{{/crossLink}}
        * triggers the {{#crossLink "MathInteractives.Interactives.MiniGolf.Models.MiniGolfData/CURRENT_SLIDE_CLICKED:event"}}custom event{{/#crossLink}} if the
        * course of that slide is unlocked else sets appropriate accessibility text.
        *
        * @method _onCarouselSlideClick
        * @param eventData {Object} Holds information about the slide clicked like 'isCurrentSlide', 'isUnlocked'.
        * @private
        */
        _onCarouselSlideClick: function _onCarouselSlideClick(eventData) {
            if (eventData.isCurrentSlide) {
                if (eventData.isUnlocked) {
                    this.trigger(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.CURRENT_SLIDE_CLICKED, eventData);
                }
                else {
                    this._setCarouselText({ locked: true });
                }
            }
        },

        /**
        * Event handler for the {{#crossLink "MathInteractives.Interactivities.MiniGolf.Models.Carousel/SLIDE_CHANGE_ANIMATION_END:event"}}custom event{{/crossLink}}
        * sets the course level in the model and sets appropriate carousel accessibility text.
        *
        * @method _onSlideChangeAnimationEnd
        * @param eventData {Object} Holds information about the slide animated like 'newSlideNumber'
        * @private
        */
        _onSlideChangeAnimationEnd: function _onSlideChangeAnimationEnd(eventData) {
            this.enableAllHeaderButtons(true);

            var model = this.model;

            var newCourseLevel = eventData.newSlideNumber;
            model.set('animationPlaying', false);
            model.set('currentCourseLevel', newCourseLevel);
            // hide all courses containers and display only the new course' container
            // all courses main container hidden
            this.$('.course-view-container').hide();
            this.$('.course-' + newCourseLevel + '-view-container').show();
            this._setCarouselText({ addPrefix: true });
        },

        /**
        * Sets the accessibility text for the carousel depending on options passed.
        *
        * @method _setCarouselText
        * @param options {Object} Holds information about the text to be set like 'locked' if the course is
        * locked, 'addPrefix' if it is to be mentioned if the current slide is the first or the last slide,
        * 'setFocus' if the focus is to be reset to the carousel.
        * @private
        */
        _setCarouselText: function _setCarouselText(options) {

            var courseLevel = Number(this.model.get('currentCourseLevel')),
                currentCourseModel = this.model.get('courses')[courseLevel],
                courseTitle = this.getAccMessage('carousel-view-slide-' + courseLevel + '-title', 0),
                carouselAccId = 'carousel-view-carousel-acc-div',
                carouselText,
                carouselTextPrefix = '',
                firstOrLast;

            this._showHideCanvasCont();
            if (options.locked) {
                carouselText = this.getAccMessage(carouselAccId, 'locked-course', [courseLevel + 1, courseTitle]);
            }
            else {
                if (options.addPrefix) {
                    if (courseLevel == 0) {
                        firstOrLast = this.getAccMessage(carouselAccId, 'first');
                        carouselTextPrefix = this.getAccMessage(carouselAccId, 1, [firstOrLast]);
                    }
                    else if (courseLevel == 3) {
                        firstOrLast = this.getAccMessage(carouselAccId, 'last');
                        carouselTextPrefix = this.getAccMessage(carouselAccId, 1, [firstOrLast]);
                    }
                }
                carouselText = carouselTextPrefix +
                    this.getAccMessage(carouselAccId, 0, [courseLevel + 1, courseTitle]);
            }
            this.setAccMessage(carouselAccId, carouselText);
            if (options.setFocus !== false) {
                this.setFocus('carousel-view-carousel-temp-focus-div');
                this.setFocus(carouselAccId);
            }
            if (currentCourseModel.get('customPopupShown') === false && !options.locked && !options.endOfSlide) {
                this._setCarouselTextOnKeyUp();
            }
        },
        _setCarouselTextOnKeyUp: function () {

            var model = this.model,
                currentCourseLevel = model.get('currentCourseLevel'),
                currentCourseModel = model.get('courses')[currentCourseLevel],
                customPopupShown = currentCourseModel.get('customPopupShown'),
                carouselAccId = 'carousel-view-carousel-acc-div',
                currentCourseTitle = null,
                strMessage = null;


            currentCourseTitle = this.getAccMessage('carousel-view-slide-' + currentCourseLevel + '-title', 0);

            strMessage = this.getAccMessage(carouselAccId, 0, [currentCourseLevel + 1, currentCourseTitle]) +
                         this.getMessage(carouselAccId, 'one-time-popup-text');

            this.setAccMessage(carouselAccId, strMessage);
            this.setFocus('carousel-view-carousel-temp-focus-div');
            this.setFocus(carouselAccId);

        },
        /**
        * Adds background images to slides.
        *
        * @method _addImagesToSlides
        * @private
        */
        _addImagesToSlides: function _addImagesToSlides() {
            var modelClass, slideBgImageSpritePositions,
                index,
                slideBgImageUrl, $slide, numberOfSlides;
            numberOfSlides = this.carouselModel.get('slidesData').length;
            modelClass = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData;
            slideBgImageSpritePositions = modelClass.SPRITE_POSITIONS.SLIDES_BG_IMAGE;
            for (index = 0; index < numberOfSlides; index++) {
                slideBgImageUrl = this.getSpritePartBase64URL('sprites',
                    slideBgImageSpritePositions['COURSE_' + index].LEFT,
                    slideBgImageSpritePositions['COURSE_' + index].TOP,
                    slideBgImageSpritePositions['COURSE_' + index].WIDTH,
                    slideBgImageSpritePositions['COURSE_' + index].HEIGHT
                );
                //slideBgImageUrl = ''; to set null bg to corusal cont
                $slide = this.$('.carousel-view-slide-' + index).css({
                    'background-image': 'url(' + slideBgImageUrl + ')'
                })
            }

            this._addLockedModalImage();
        },

        /**
        * Adds background image for locked course modal.
        *
        * @method _addLockedModalImage
        * @private
        */
        _addLockedModalImage: function _addLockedModalImage() {
            var slideBgImageUrl, slideBgImageSpritePositions, modelClass;
            modelClass = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData;
            slideBgImageSpritePositions = modelClass.SPRITE_POSITIONS.SLIDES_BG_IMAGE;
            slideBgImageUrl = this.getSpritePartBase64URL('sprites',
                slideBgImageSpritePositions.LOCKED_COURSE.LEFT,
                slideBgImageSpritePositions.LOCKED_COURSE.TOP,
                slideBgImageSpritePositions.LOCKED_COURSE.WIDTH,
                slideBgImageSpritePositions.LOCKED_COURSE.HEIGHT
            );
            if (!this.isMobile) {
                this.$('.carousel-view-slide-lock-modal').addClass('default-cursor');
            }
            this.$('.carousel-view-slide-lock-modal').css({
                'background-image': 'url(' + slideBgImageUrl + ')'
            });
            this.$('.carousel-view-slide-lock-symbol').addClass(this.getFontAwesomeClass('lock'));
        },

        /**
        * Updates all slide.
        *
        * @method updateAllSlide
        * @param newData {Object} Array of JSON describing new slides' data.
        **/
        updateAllSlides: function updateAllSlides(newData) {
            if (!newData) {
                newData = this.getSlidesDataFromModel();
            }
            this.carouselView.updateAllSlides(newData);
            this._addLockedModalImage();
            this._setCarouselText({ setFocus: false });
        },

        /**
        * Calls a method to update default slide number and current Slide in the carousel view.
        *
        * @method updateDefaultSlideNumberParent
        *
        */
        updateDefaultSlideNumberParent: function updateDefaultSlideNumberParent() {
            this.carouselView.updateDefaultSlideNumber();
        },

        /**
        * Fetched state of all courses and returns data to be sent to slides to update the carousel.
        *
        * @method getSlidesDataFromModel
        * @return {Object} An array of objects describing each slides new data/state.
        */
        getSlidesDataFromModel: function getSlidesDataFromModel() {
            var index, slideDatum, slidesData = [],
                currentModel = null,
                lockType = this.courseModelClassName.COURSE_TYPE.TYPE_3,
                courseModel = this.model.get('courses');

            for (index = 0; index < MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.NUMBER_OF_COURSES; index++) {

                currentModel = null;
                currentModel = courseModel[index];

                slideDatum = {
                    'templateModule': "MiniGolf",
                    'templateName': 'slide',
                    'data': {
                        'slideNumber': index,
                        'unlocked': (currentModel.get('state') !== lockType),
                        'timesPlayed': (currentModel && currentModel.get('timesPlayed')) || 0,
                        'holesInOne': (currentModel && currentModel.get('holesInOne')) || 0
                    }
                };
                slidesData.push(slideDatum);
            };
            return slidesData;
        }
    }, {});
})();
