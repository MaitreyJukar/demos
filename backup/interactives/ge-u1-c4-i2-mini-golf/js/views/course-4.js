(function () {
    'use strict';
    /**
    * Course holds method and properties to render a course 4
    * @class Course4
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Interactivities.MiniGolf.Views.Course
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.Course4 = MathInteractives.Interactivities.MiniGolf.Views.Course.extend({

        /**
        * Initializer function of view.
        * @method initialize
        * @constructor
        */
        initialize: function () {


            this._setUpCourseProperties();
            // this.constructor.__super__.initialize.apply(this, arguments);
            this._superwrapper('initialize', arguments);
            this._addCanvasObject();
            this.loadScreen('course-3-screen');


        },
        _addCanvasObject: function () {

            var canvasViewElId = '#' + this.idPrefix + 'work-area-' + this.model.get('levelId'),
                canvasObj = null;

            if (this.isAccessible() === true) {
                canvasObj = new MathInteractives.Interactivities.MiniGolf.Views.CanvasSlidingObsExtAcc({
                    canvasId: this.canvasId,
                    model: this.model,
                    el: canvasViewElId
                });

            }
            else {

                canvasObj = new MathInteractives.Interactivities.MiniGolf.Views.CanvasSlidingObsExt({
                    canvasId: this.canvasId,
                    model: this.model,
                    el: canvasViewElId
                });
            }
            this.baseSetUp(canvasObj);
        },


        _setUpCourseProperties: function () {
            var className = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData,
                model = this.model;
            model.set('courseBoundaries', className.BOUNDRIES.COUESE_3);
            model.set('matBoundaries', className.MAT_BOUNDRIES.COUESE_3);
            model.set('holePosition', className.HOLES.COURSE_3.POSITION);
            model.set('holeRadius', className.HOLES.COURSE_3.RADIUS);
        },


        _createCourse4Popup: function () {
            var player = this.player,
                idPrefix = this.idPrefix,
                model = this.model,
                options = {
                    text: this.getMessage('hole-in-1-pop-up-text', 'body-text-course-4'),
                    accText: this.getAccMessage('hole-in-1-pop-up-text', 'body-text-course-4'),
                    containsTts: true,
                    showCallback: {
                        fnc: function () {
                            this.confettiView.setUpConfetti();
                        },
                        scope: this
                    },
                    closeCallback: {
                        fnc: function (response) {

                            this.confettiView.stopConfetti();
                            this.popupView.$el.find('#' + idPrefix + 'theme-2-pop-up-modal').removeClass('bg-transparent');
                            this.canvasView.reset();
                            if (response.buttonClicked === 'play-again-button') {
                                this.setFocus('main-container-' + model.get('levelId'));
                            }
                            else {
                                this.trigger(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.NEW_HOLE_CLICKED);
                            }


                            model.set('resetCourseButton', false);
                            player.enableAllHeaderButtons(true);
                            this.enableResetBtn(false);
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
                            id: 'new-course-button',
                            type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                            text: this.getMessage('hole-in-1-pop-up-text', 'new-course-btn'),
                            response: { isPositive: true, buttonClicked: 'new-course-button' },
                            baseClass: 'course-pop-up-btn'
                        }
                    ],
                    width: 454,
                    title: this.getMessage('hole-in-1-pop-up-text', 'title'),
                    accTitle: this.getAccMessage('hole-in-1-pop-up-text', 'title'),
                    manager: this.manager,
                    player: player,
                    path: this.filePath,
                    idPrefix: idPrefix,
                    foregroundImageBackgroundPosition: '-720px -530px',//'0px -2429px',
                    foregroundImage: {
                        imageId: 'sprites',
                        imageHeight: 116,//599,
                        imageWidth: 113//928,                    
                    },
                    titleTextColorClass: 'course-pop-up-title-color-blue',
                    bodyTextColorClass: 'course-pop-up-body-color'
                };
            return options;
        }


    });

    var currentModelName = MathInteractives.Interactivities.MiniGolf.Models.Course;
})();