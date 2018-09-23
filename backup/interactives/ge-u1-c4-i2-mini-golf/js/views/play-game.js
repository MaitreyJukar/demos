(function () {
    'use strict';
    /**
    * PlayGame is the interactive's main view for it's first tab (after overview tab)
    * @class PlayGame
    * @module MiniGolf
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @type Object
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.PlayGame = MathInteractives.Common.Player.Views.Base.extend({
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

        courseViewArray: [],

        /**
        * Initializer function of view.
        * @method initialize
        * @constructor
        */
        initialize: function () {
            this.initializeDefaultProperties();

            this.loadScreen('buttons-text');
            this.loadScreen('pop-up-texts');
            this.loadScreen('direction-texts');

            this._generateChildViews();
            if (this.model.get('currentView') === MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.CURRENT_VIEW.COURSE) {
                this.createCourseView({ slideNumber: this.model.get('currentCourseLevel') });
            }
            this.render();

            this.model.on('change:currentView', $.proxy(this.onCurrentViewChange, this));
            this._setHelpElements();
        },

        /**
        * Renders the view of play game tab
        *
        * @method initialize
        * @public 
        **/
        render: function render() {
            this.onCurrentViewChange(); // Hides/shows carousel/course view as per data stored in model
            if (!this.model.get('scoreCardVisible')) {
                this._scoreCardContainerView.closeScoreCard();
            }
        },

        /**
        * Generates child views for the different course levels and make calls to generate the carousel and score card.
        *
        * @method _generateChildViews
        * @private
        */
        _generateChildViews: function _generateChildViews() {
            // generate carousel view
            this._generateCarouselPage();
            // course views now created on clicking on slides or through save state
            // generate score card view
            this._generateScoreCard();
        },

        /**
        * Creates a carousel view instance, direction text and score card view.
        *
        * @method _generateCarouselPage
        * @private
        */
        _generateCarouselPage: function _generateCarouselPage() {
            this._carouselContainerView = new MathInteractives.Interactivities.MiniGolf.Views.CarouselContainer({
                el: '#' + this.idPrefix + 'carousel-page-container',
                model: this.model
            });
            this._attachEventsOnCarouselContainer();
        },

        /**
        * Attaches events on carousel-container view and/or its $el
        *
        * @method _attachEventsOnCarouselContainer
        * @param enable {Boolean} Detaches the event handlers if false.
        * @private
        **/
        _attachEventsOnCarouselContainer: function _attachEventsOnCarouselContainer(enable) {
            var mainModelEvents = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS;
            if (enable === false) {
                this._carouselContainerView.off(mainModelEvents.SCORECARD_BTN_CLICKED)
                    .off(mainModelEvents.CURRENT_SLIDE_CLICKED);
            }
            else {
                this._carouselContainerView.on(mainModelEvents.SCORECARD_BTN_CLICKED, $.proxy(this._showScoreCard, this));
                this._carouselContainerView.on(mainModelEvents.CURRENT_SLIDE_CLICKED, $.proxy(this._onCurrentSlideClicked, this));
            }
        },

        /**
        * Attaches event handlers on child view course
        *
        * @method _attachCommonEventsOfCourses
        * @param currentCourse {Object} The course view object on which the event handler is to be attached
        * @private
        */
        _attachCommonEventsOfCourses: function (currentCourse) {
            var modelClass = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData;
            currentCourse.off(modelClass.EVENTS.NEW_HOLE_CLICKED)
                .on(modelClass.EVENTS.NEW_HOLE_CLICKED, $.proxy(function () {
                    this.model.set('currentView', modelClass.CURRENT_VIEW.CAROUSEL);
                }, this))
                .off(modelClass.EVENTS.SCORECARD_BTN_CLICKED)
                .on(modelClass.EVENTS.SCORECARD_BTN_CLICKED, $.proxy(this._showScoreCard, this))
                .off(modelClass.EVENTS.ENABLE_CLEAR_BUTTON)
                .on(modelClass.EVENTS.ENABLE_CLEAR_BUTTON, $.proxy(function () {
                    this.model.set('clearScoreCard', true);

                }, this))
                .off(modelClass.EVENTS.UNLOCK_NEXT_COURSE)
                .on(modelClass.EVENTS.UNLOCK_NEXT_COURSE, $.proxy(this._unlockNextCourse, this))
                .off(modelClass.EVENTS.NEXT_HOLE)
                .on(modelClass.EVENTS.NEXT_HOLE, $.proxy(this._onNextHoleClicked, this));
        },

        /**
        * Goes to the next Course on click in the positive feedback popup 
        *
        * @method _onNextHoleClicked
        * @private
        */
        _onNextHoleClicked: function _nextCourse() {
            var currentLevel = Number(this.model.get('currentCourseLevel'));
            this.model.set('currentCourseLevel', currentLevel + 1);

            this._carouselContainerView.updateDefaultSlideNumberParent();

            if (this.model.get('currentView') === MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.CURRENT_VIEW.COURSE) {
                this.createCourseView({ slideNumber: currentLevel + 1 });
            }

            if (this.courseViewArray[currentLevel]) {
                this.courseViewArray[currentLevel].destroyView();
                delete this.courseViewArray[currentLevel];
            }
        },

        /**
        * Unlocks the next course on successful completion of the current course
        *
        * @method _unlockNextCourse
        * @private
        */
        _unlockNextCourse: function _unlockNextCourse() {
            var minigoldModels = MathInteractives.Interactivities.MiniGolf.Models,
                totalCourses = minigoldModels.MiniGolfData.NUMBER_OF_COURSES,
                currentCourse = Number(this.model.get('currentCourseLevel')),
                courseType = minigoldModels.Course.COURSE_TYPE,
                courses = this.model.get('courses'),
                nextCourse = courses[currentCourse + 1];

            if (currentCourse === totalCourses - 1) {
                return;
            }
            else {
                if (nextCourse.get('state' === courseType.TYPE_3)) {
                    nextCourse.set('state', courseType.TYPE_2);
                }
                if (this.courseViewArray[currentCourse].isNextCourseLocked && courses[currentCourse].get('timesPlayed') > 1)
                    this.courseViewArray[currentCourse].isNextCourseLocked = false;
            }
        },

        /**
        * Displays the score card view.
        *
        * @method _showScoreCard
        * @private
        */
        _showScoreCard: function _showScoreCard() {
            this._scoreCardContainerView.showScoreCard();
        },

        _onCurrentSlideClicked: function _onCurrentSlideClicked(eventData) {
            this.model.set('currentView', MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.CURRENT_VIEW.COURSE);
            this.createCourseView(eventData);
        },
        createCourseView: function (eventData) {

            var index = eventData.slideNumber,
                idPrefix = this.idPrefix,
                courseViewArray = this.courseViewArray,
                $courseEl = $('<div class="level-' + index + '">'),

                $courseContainer = this.$('#' + idPrefix + 'courses-view-container'),
                courseView = null,
                courseModel = null;

            $courseEl.attr('id', idPrefix + 'course-' + index + '-view-container');

            if (courseViewArray[index]) {

                courseViewArray[index].remove();
                delete courseViewArray[index];
            }

            $courseContainer.append($courseEl);
            courseModel = this.model.getCourseModel(index);
            courseModel.set('levelId', index);
            courseViewArray[index] = courseView = new MathInteractives.Interactivities.MiniGolf.Views['Course' + (index + 1)]({ el: $courseEl, model: courseModel });

            if (index + 1 != MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.NUMBER_OF_COURSES) {
                if (this.model.getCourseModel(index + 1).get('state') == MathInteractives.Interactivities.MiniGolf.Models.Course.COURSE_TYPE.TYPE_3)
                    courseViewArray[index].isNextCourseLocked = true;
            }
            this._attachCommonEventsOfCourses(courseView);

        },
        /**
        * Loads the score card template and generates the DOM for the score card.
        *
        * @method _generateScoreCard
        * @param miniGolfTemplates {Object} An object containing the pre-compiled handlebar templates for minigolf.
        * @private
        */
        _generateScoreCard: function _generateScoreCard() {
            this._scoreCardContainerView = new MathInteractives.Interactivities.MiniGolf.Views.ScoreCardContainer({
                el: '#' + this.idPrefix + 'score-card-container',
                model: this.model
            });
            this._scoreCardContainerView.on(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.SCORECARD_CLEARED,
                $.proxy(this._onScoreCardCleared, this));
            this._scoreCardContainerView.on(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.SCORECARD_CLOSED,
                $.proxy(this._onScoreCardClose, this));
        },

        /**
        * Calls canvas with obstacles' enableDisableObstacleDispenserHelpElements method 
        *
        * @method _onScoreCardCleared
        * @private
        */
        _onScoreCardClose: function _onScoreCardClose() {
            var ModelClass = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData,
                currentView = this.model.get('currentView'),
                currentCourseLevel = this.model.get('currentCourseLevel'),
                currentCourseView = this.courseViewArray[currentCourseLevel],
                canvasView;
            if (currentCourseView) {
                canvasView = currentCourseView.canvasView;
                if (canvasView && canvasView.enableDisableObstacleDispenserHelpElements) {
                    canvasView.enableDisableObstacleDispenserHelpElements();
                }
            }
            if (currentView === ModelClass.CURRENT_VIEW.CAROUSEL) {
                this.setFocus('carousel-page-score-card-btn');
            }
            else {
                this.setFocus('course-score-card-btn-' + currentCourseLevel);
            }
        },

        /**
        * Reset the course and changes view to carousel.
        *
        * @method _onScoreCardCleared
        * @private
        */
        _onScoreCardCleared: function _onScoreCardCleared() {
            var modelClass = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData,
                courses = this.model.get('courses'),
                index;
            for (index = 0; index < courses.length; index++) {
                courses[index].set('toResetCourse', false);
            }
            this._carouselContainerView.updateAllSlides();
            this.model.set('currentView', modelClass.CURRENT_VIEW.CAROUSEL);
        },

        /**
        * Change event handler bind on model's "currentView" property, it displays the current view and hides the
        * displayed carousel/course view
        *
        * @method onCurrentViewChange
        */
        onCurrentViewChange: function onCurrentViewChange() {
            var currentViewTypes, viewToDisplay, courseViewObject, courseLevel, showCourseHowToPopUp;
            currentViewTypes = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.CURRENT_VIEW;
            viewToDisplay = this.model.get('currentView');
            courseLevel = this.model.get('currentCourseLevel');
            courseViewObject = this.courseViewArray[courseLevel];
            if (viewToDisplay === currentViewTypes.CAROUSEL) {
                this._carouselContainerView.updateAllSlides();
                this.$('.carousel-page-container').show();
                this._carouselContainerView.setFocusToDirectionText();
                if (courseViewObject) {
                    courseViewObject.destroyView();
                }
                this.$('.courses-view-container').hide();
            }
            else {
                this.$('.carousel-page-container').hide();
                this.$('.courses-view-container').show();
            }
        },

        /**
        * Set help elements.
        *
        * @method _setHelpElements
        * @private
        */
        _setHelpElements: function _setHelpElements() {
            var helpElements = this.model.get('helpElements');

            helpElements.push(
            {
                elementId: 'carousel-view',
                helpId: 'carousel-view-help',
                fromElementCenter: true,
                msgId: '0',
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'carousel-page-score-card-btn-holder',
                helpId: 'score-card-btn-help',
                msgId: '0',
                position: 'top',
                dynamicArrowPosition: true
            }, {    /* ---------------- HELP FOR BALLS ---------------- */
                elementId: 'canvas-holder-0',
                helpId: 'ball-help',
                msgId: 'mat-ball',
                fromElementCenter: true,
                offset: { x: -82, y: -148 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-0',
                helpId: 'ball-help',
                msgId: 'start-ball',
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                tooltipWidth: 250,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-0',
                helpId: 'ball-help',
                msgId: 'sticky-slider',
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-0',
                helpId: 'ball-help',
                msgId: 'destination-ball',
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-0',
                helpId: 'ball-help',
                msgId: 'hole',
                fromElementCenter: true,
                offset: { x: 263, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-1',
                helpId: 'ball-help',
                msgId: 'mat-ball',
                fromElementCenter: true,
                offset : { x: -88, y: -153 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-1',
                helpId: 'ball-help',
                msgId: 'start-ball',
                tooltipWidth: 250,
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-1',
                helpId: 'ball-help',
                msgId: 'sticky-slider',
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-1',
                helpId: 'ball-help',
                msgId: 'destination-ball',
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-1',
                helpId: 'ball-help',
                msgId: 'hole',
                fromElementCenter: true,
                offset: { x: 220, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-2',
                helpId: 'ball-help',
                msgId: 'mat-ball',
                fromElementCenter: true,
                offset : {x : -88, y : -150},
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-2',
                helpId: 'ball-help',
                msgId: 'start-ball',
                tooltipWidth: 250,
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-2',
                helpId: 'ball-help',
                msgId: 'sticky-slider',
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-2',
                helpId: 'ball-help',
                msgId: 'destination-ball',
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-2',
                helpId: 'ball-help',
                msgId: 'hole',
                fromElementCenter: true,
                offset: { x: 190, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-3',
                helpId: 'ball-help',
                msgId: 'mat-ball',
                fromElementCenter: true,
                offset : {x : -88, y : -150},
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-3',
                helpId: 'ball-help',
                msgId: 'start-ball',
                tooltipWidth: 250,
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-3',
                helpId: 'ball-help',
                msgId: 'sticky-slider',
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-3',
                helpId: 'ball-help',
                msgId: 'destination-ball',
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-3',
                helpId: 'ball-help',
                msgId: 'hole',
                fromElementCenter: true,
                offset: { x: 130, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {    /* ---------------- HELP FOR OBSTACLES ---------------- */
                elementId: 'obstacles-holder-1',
                helpId: 'obstacles-help',
                msgId: 'holder',
                position: 'right',
                dynamicArrowPosition: true,
                tooltipWidth: 330
            }, {
                elementId: 'obstacles-holder-1',
                helpId: 'obstacles-help',
                msgId: 'placed-obstacle',
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'obstacles-holder-1',
                helpId: 'obstacles-help',
                msgId: 'multiple-obstacles',
                tooltipWidth: 258,
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'obstacles-holder-2',
                helpId: 'obstacles-help',
                msgId: 'holder',
                position: 'right',
                dynamicArrowPosition: true,
                tooltipWidth: 330
            }, {
                elementId: 'obstacles-holder-2',
                helpId: 'obstacles-help',
                msgId: 'placed-obstacle',
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'obstacles-holder-2',
                helpId: 'obstacles-help',
                msgId: 'multiple-obstacles',
                tooltipWidth: 258,
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'obstacles-holder-3',
                helpId: 'obstacles-help',
                msgId: 'holder',
                position: 'right',
                dynamicArrowPosition: true,
                tooltipWidth: 330
            }, {
                elementId: 'obstacles-holder-3',
                helpId: 'obstacles-help',
                msgId: 'placed-obstacle',
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {
                elementId: 'obstacles-holder-3',
                helpId: 'obstacles-help',
                msgId: 'multiple-obstacles',
                tooltipWidth: 258,
                fromElementCenter: true,
                offset: { x: 0, y: 0 },
                hideArrowDiv: true,
                dynamicArrowPosition: true
            }, {    /* ---------------- HELP FOR BRIDGE ---------------- */
                elementId: 'canvas-holder-3',
                helpId: 'bridge-help',
                msgId: 'bridge',
                fromElementCenter: true,
                offset : { x : 130, y : -31},                
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-3',
                helpId: 'bridge-help',
                msgId: 'bridge-wall',
                fromElementCenter: true,
                offset: { x: 130, y: -31 },
                dynamicArrowPosition: true
            }, {
                elementId: 'canvas-holder-3',
                helpId: 'bridge-help',
                msgId: 'bridge-movement',
                fromElementCenter: true,
                offset: { x: 130, y: -31 },
                dynamicArrowPosition: true
            }, {    /* ---------------- HELP FOR RESET BUTTON ---------------- */
                elementId: 'reset-course-btn-holder-0',
                helpId: 'reset-course-btn-holder-help',
                position: 'right',
                msgId: "0",
                tooltipWidth:250,
                dynamicArrowPosition: true
            }, {
                elementId: 'reset-course-btn-holder-1',
                helpId: 'reset-course-btn-holder-help',
                position: 'right',
                msgId: "0",
                tooltipWidth: 250,
                dynamicArrowPosition: true
            }, {
                elementId: 'reset-course-btn-holder-2',
                helpId: 'reset-course-btn-holder-help',
                position: 'right',
                msgId: "0",
                tooltipWidth: 250,
                dynamicArrowPosition: true                
            }, {
                elementId: 'reset-course-btn-holder-3',
                helpId: 'reset-course-btn-holder-help',
                position: 'right',
                msgId: "0",
                tooltipWidth: 250,
                dynamicArrowPosition: true
            }, {    /* ---------------- HELP FOR SCORE CARD BUTTON ---------------- */
                elementId: 'course-score-card-btn-0',
                helpId: 'score-card-btn-help',
                msgId: '0',
                position: 'top',
                dynamicArrowPosition: true
            }, {
                elementId: 'course-score-card-btn-1',
                helpId: 'score-card-btn-help',
                msgId: '0',
                position: 'top',
                dynamicArrowPosition: true
            }, {
                elementId: 'course-score-card-btn-2',
                helpId: 'score-card-btn-help',
                msgId: '0',
                position: 'top',
                dynamicArrowPosition: true
            }, {
                elementId: 'course-score-card-btn-3',
                helpId: 'score-card-btn-help',
                msgId: '0',
                position: 'top',
                dynamicArrowPosition: true
            }, {    /* ---------------- HELP FOR NEW COURSE BUTTON ---------------- */
                elementId: 'direction-text-0-direction-text-buttonholder',
                helpId: 'new-course-btn-help',
                msgId: "0",
                position: 'bottom',
                dynamicArrowPosition: true
            }, {
                elementId: 'direction-text-1-direction-text-buttonholder',
                helpId: 'new-course-btn-help',
                msgId: "0",
                position: 'bottom',
                dynamicArrowPosition: true
            }, {
                elementId: 'direction-text-2-direction-text-buttonholder',
                helpId: 'new-course-btn-help',
                msgId: "0",
                position: 'bottom',
                dynamicArrowPosition: true
            }, {
                elementId: 'direction-text-3-direction-text-buttonholder',
                helpId: 'new-course-btn-help',
                msgId: "0",
                position: 'bottom',
                dynamicArrowPosition: true
            });
        }
    }, {});
})();
