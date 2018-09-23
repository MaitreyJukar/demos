(function () {
    'use strict';


    /**
    * MiniGolfData holds properties and methods required for the whole interactive
    *
    * @class MiniGolfData
    * @module MiniGolf
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @namespace MathInteractives.Interactivities.MiniGolf.Models
    */
    MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        courseModelClassName: null,

        defaults: function () {
            return {

                /**
                * Stores a string indicating the current view to be displayed: carousel or golf-course.
                *
                * @attribute currentView
                * @type String
                * @default null
                **/
                currentView: null,

                /**
                * Stores a string indicating the current golf course view to be displayed: course 1 to 4.
                *
                * @attribute currentCourseLevel
                * @type String
                * @default null
                **/
                currentCourseLevel: null,

                /**
                * A boolean indicating if the score card is visible.
                *
                * @attribute scoreCardVisible
                * @type Boolean
                * @default null
                */
                scoreCardVisible: null,

                /**
                * Elements of Help Screen
                *
                * @property helpElements
                * @type Array
                * @default Empty 
                **/
                helpElements: null,

                courses: null,

                /**
                * A boolean indicating if the clear button on the score card was clicked.
                *
                * @attribute clearScoreCard
                * @type Boolean
                * @default null
                */
                clearScoreCard: null,

                animationPlaying: false,
                allowSlideSelfFocus: true,

                showCourseHowToPopUp: [true, true]
            };
        },

        /**
        * Initialises MiniGolfData Model
        *
        * @method initialize
        **/
        initialize: function (options) {

            this.set('helpElements', []);
            var courseModelClassName = null,
                modelClass = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData,
                index;
            this.courseModelClassName = courseModelClassName = MathInteractives.Interactivities.MiniGolf.Models.Course;

            if (this.get('currentView') === null) {
                this.set('currentView', modelClass.CURRENT_VIEW.CAROUSEL);
            }
            if (this.get('currentCourseLevel') === null) {
                this.set('currentCourseLevel', 0);
            }
            if (this.get('clearScoreCard') === null) {
                this.set('clearScoreCard', false);
            }
            this.set('scoreCardVisible', !!this.get('scoreCardVisible'));
            this.createCourseModels();

        },
        createCourseModels: function () {

            var coursesDefaults = this.get('courses'),
                courseDefault = null,
                courseModelClassName = this.courseModelClassName,
                customPopupData = courseModelClassName.CUSTOM_IMAGE_COUNT,
                courseType = courseModelClassName.COURSE_TYPE,
                defaultModelProps = {
                    player: this.get('player'),
                    manager: this.get('manager'),
                    path: this.get('path'),
                    jsonData: this.get('jsonData')
                },
                courses = [],
                currentCourseModel = null,
                index = null;

            for (index = 0; index < MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.NUMBER_OF_COURSES; index++) {
                courseDefault = null;
                defaultModelProps.levelId = index;
                if (coursesDefaults) {  // if reopening from saved state
                    courseDefault = $.extend(true, {}, defaultModelProps, coursesDefaults[index]);
                }
                else {
                    if (index === 0) {
                        defaultModelProps.state = courseType.TYPE_2;
                        defaultModelProps.customImageCountObject = customPopupData.COURSE_1;
                        defaultModelProps.customPopupShown = false;
                    }
                    else {
                        if (index === 1) {
                            defaultModelProps.customImageCountObject = customPopupData.COURSE_2;
                            defaultModelProps.customPopupShown = false;
                        }
                        else {
                            defaultModelProps.customPopupShown = null;
                        }
                        defaultModelProps.state = courseType.TYPE_3;
                    }
                    courseDefault = $.extend(true, {}, defaultModelProps);
                }


                courses[index] = currentCourseModel = new MathInteractives.Interactivities.MiniGolf.Models.Course(courseDefault);
                this.bindEventOnCourseModel(currentCourseModel);
            }
            this.set('courses', courses);
        },

        bindEventOnCourseModel: function bindEventOnCourseModel(currentCourseModel) {
            var self = this;

            currentCourseModel.on('change:holesInOne', function () {

                self.setNextSlideState(this);

            })
        },

        setNextSlideState: function setNextSlideState(modelRef) {

            var courseArray = this.get('courses'),
                courseArrayLength = courseArray.length,
                coursesState = this.courseModelClassName.COURSE_TYPE,
                nextModel = null,
                 levelId = modelRef.get('levelId'),
                nextLevelId = levelId + 1,
                nextModelState = null;



            if (modelRef.get('holesInOne') && nextLevelId < courseArrayLength) {

                nextModel = courseArray[nextLevelId];
                nextModelState = nextModel.get('state');

                if (nextModelState !== coursesState.TYPE_1) {
                    nextModel.set('state', coursesState.TYPE_2)
                }

            }

        },
        /**
        * Returns the model for course number specified
        *
        * @method getCourseModel
        * @param courseNumber {Number} The course number whose model is required.
        */
        getCourseModel: function getCourseModel(courseNumber) {
            var courses = this.get('courses');
            return (courses) ? courses[courseNumber] : false;
        },

        /**
        * Called on clicking the Save button, it returns the stringified model.
        *
        * @method getCurrentStateData
        * @return The stringified model object without player, manager, path and similar properties not needed for
        save-resume functionality.
        */
        getCurrentStateData: function getCurrentStateData() {
            var result = JSON.stringify(this, this.getJSONAttributes);
            return result;
        },

        /**
        * Replacer function for stringify method call of the model. Returns undefined for properties to be ignored.
        *
        * @method getJSONAttributes
        * @param key {String} The model object's properties' name
        * @param value {Object} The value of the property.
        * @private
        */
        getJSONAttributes: function getJSONAttributes(key, value) {
            var result = value;
            switch (key) {
                case 'path':
                case 'filePath':
                case 'manager':
                case 'player':
                case 'idPrefix':
                case 'nextBallModel':
                case 'previousBallModel':
                case 'jsonData':
                case 'helpElements':
                    result = undefined;
                    break;
            }
            return result;
        }
    }, {
        CURRENT_VIEW: {
            CAROUSEL: 'carousel',
            COURSE: 'course',
        },
        EVENTS: {
            /**
            * Fired when user clicks on the new hole button from any of the 4 courses.
            *
            * triggered in the function {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Course/_onNewHoleClicked:method"}}{{/crossLink}}
            * @event NEW_HOLE_CLICKED
            */
            NEW_HOLE_CLICKED: 'newHoleBtnClicked',

            /**
            * Fired when user clicks on the score card button from any other view
            *
            * triggered in the function {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Carousel/_onScoreCardBtnClick:method"}}{{/crossLink}}
            * @event SCORECARD_BTN_CLICKED
            */
            SCORECARD_BTN_CLICKED: 'scoreCardBtnClicked',

            /**
            * Fired when user clicks on the score-card's clear-all-data button
            *
            * triggered in the function {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.ScoreCardContainer/clearAllData:method"}}{{/crossLink}}
            * @event SCORECARD_CLEARED
            */
            SCORECARD_CLEARED: 'scoreCardCleared',

            /**
            * Fired when user closes the score-card.
            *
            * triggered in the function {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.ScoreCardContainer/closeScoreCard:method"}}{{/crossLink}}
            * @event SCORECARD_CLOSED
            */
            SCORECARD_CLOSED: 'scoreCardClosed',

            /**
            * Fired by carousel-container view on {{#crossLink "MathInteractives.Interactivities.MiniGolf.Models.Carousel/SLIDE_CHANGE_ANIMATION_END:event"}}custom event{{/crossLink}}, triggered when user clicks on the current slide.
            * Triggered in the function {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.CarouselContainer/_attachEventsOnCarousel:method"}}{{/crossLink}}
            * @event CURRENT_SLIDE_CLICKED
            */
            CURRENT_SLIDE_CLICKED: 'currentCarouselSlideClicked',

            /**
            * Fired in the course view when the times-played count is incremented
            * 
            * @event ENABLE_CLEAR_BUTTON
            */
            ENABLE_CLEAR_BUTTON: 'enableClearBtn',

            /**
            * Fired on mouse down on an obstacle's actual paper.js path on canvas.
            * @event OBSTACLE_DRAG_START
            */
            OBSTACLE_DRAG_START: 'obstacleDragStart',

            /**
            * Fired on mouse up on an obstacle's actual paper.js path on canvas.
            * @event OBSTACLE_DRAG_STOP
            */
            OBSTACLE_DRAG_STOP: 'obstacleDragStop',

            /**
            * Fired on mouse down on an obstacle's rotation handles' paper.js paths on canvas.
            * @event OBSTACLE_ROTATE_START
            */
            OBSTACLE_ROTATE_START: 'obstacleRotationHandleMouseDown',

            /**
            * Fired on mouse up on an obstacle's rotation handles' paper.js paths on canvas.
            * @event OBSTACLE_ROTATE_END
            */
            OBSTACLE_ROTATE_END: 'obstacleRotationHandleMouseUp',

            OBSTACLE_DRAG_EVENT: 'obstacle-drag-event',
            /**
            * Fired when the current level is cleared i.e. hole in one achieved
            * @event UNLOCK_NEXT_COURSE
            */
            UNLOCK_NEXT_COURSE: 'unlockNextCourse',

            /**
            * Fired when the next hole button is clicked in the correct-feedback popup
            * @event NEXT_HOLE
            */
            NEXT_HOLE: 'nextHoleClicked',

            /**
            * Fired at the end of obstacle render method; used to keep code in sync.
            *
            * @event OBSTACLE_RENDERED
            */
            OBSTACLE_RENDERED: 'obstacleRendered',


            STICKY_SLIDER_ATTACHED_TO_OBSTACLE: 'sticky-slider-attached-to-obstacle'
        },
        NUMBER_OF_COURSES: 4,
        BOUNDRIES: {
            COUESE_0: [{ x: 48, y: 49 }, { x: 882, y: 49 }, { x: 882, y: 452 }, { x: 572, y: 452 }, { x: 572, y: 253 }, { x: 48, y: 253 }],
            COUESE_1: [{ x: 38, y: 47 }, { x: 758, y: 47 }, { x: 758, y: 190 }, { x: 889, y: 190 }, { x: 889, y: 448 }, { x: 481, y: 448 }, { x: 481, y: 248 }, { x: 38, y: 248 }],
            COUESE_2: [{ x: 34, y: 48 }, { x: 691, y: 48 }, { x: 755, y: 100 }, { x: 755, y: 243 }, { x: 886, y: 243 }, { x: 886, y: 450 }, { x: 515, y: 450 }, { x: 433, y: 382 }, { x: 433, y: 251 }, { x: 34, y: 251 }],
            COUESE_3: [{ x: 34, y: 48 }, { x: 652, y: 48 }, { x: 652, y: 132 }, { x: 757, y: 132 }, { x: 757, y: 243 }, { x: 888, y: 243 }, { x: 888, y: 450 }, { x: 529, y: 450 }, { x: 435, y: 369 }, { x: 433, y: 252 }, { x: 34, y: 252 }]
        },
        PHYSICAL_BOUNDRIES: {
            COURSE_0: [{ x: 38, y: 39 }, { x: 892, y: 39 }, { x: 892, y: 462 }, { x: 562, y: 462 }, { x: 562, y: 263 }, { x: 38, y: 263 }],
            COURSE_1: [{ x: 28, y: 37 }, { x: 768, y: 37 }, { x: 768, y: 180 }, { x: 899, y: 180 }, { x: 899, y: 458 }, { x: 471, y: 458 }, { x: 471, y: 258 }, { x: 28, y: 258 }],
            COURSE_2: [{ x: 24, y: 38 }, { x: 693, y: 38 }, { x: 765, y: 95 }, { x: 765, y: 233 }, { x: 896, y: 233 }, { x: 896, y: 460 }, { x: 513, y: 460 }, { x: 423, y: 387 }, { x: 423, y: 261 }, { x: 24, y: 261 }],
            COURSE_3: [{ x: 24, y: 38 }, { x: 662, y: 38 }, { x: 662, y: 122 }, { x: 767, y: 122 }, { x: 767, y: 233 }, { x: 898, y: 233 }, { x: 898, y: 460 }, { x: 529, y: 460 }, { x: 425, y: 369 }, { x: 423, y: 262 }, { x: 24, y: 262 }]
        },
        MAT_BOUNDRIES: {
            COUESE_0: [{ x: 124, y: 125 }, { x: 200, y: 125 }, { x: 200, y: 180 }, { x: 124, y: 180 }],
            COUESE_1: [{ x: 112, y: 121 }, { x: 186, y: 121 }, { x: 186, y: 174 }, { x: 112, y: 174 }],
            COUESE_2: [{ x: 109, y: 123 }, { x: 184, y: 123 }, { x: 184, y: 177 }, { x: 109, y: 177 }],
            COUESE_3: [{ x: 109, y: 123 }, { x: 187, y: 123 }, { x: 187, y: 180 }, { x: 109, y: 180 }]

        },
        PHYSICAL_MAT_BOUNDRIES: {
            COURSE_0: [{ x: 114, y: 115 }, { x: 210, y: 115 }, { x: 210, y: 190 }, { x: 114, y: 190 }],
            COURSE_1: [{ x: 102, y: 111 }, { x: 196, y: 111 }, { x: 196, y: 184 }, { x: 102, y: 184 }],
            COURSE_2: [{ x: 99, y: 113 }, { x: 194, y: 113 }, { x: 194, y: 187 }, { x: 99, y: 187 }],
            COURSE_3: [{ x: 99, y: 113 }, { x: 197, y: 113 }, { x: 197, y: 190 }, { x: 99, y: 190 }]
        },
        HOLES: {
            COURSE_0: { POSITION: { x: 661, y: 406 }, RADIUS: 15 },
            COURSE_1: { POSITION: { x: 617, y: 421 }, RADIUS: 15 },
            COURSE_2: { POSITION: { x: 489, y: 337 }, RADIUS: 15 },
            COURSE_3: { POSITION: { x: 801, y: 323 }, RADIUS: 15 }
        },
        MATBALL_POSITIONS: {
            COURSE_0: { x: 162, y: 155 },
            COURSE_1: { x: 151, y: 149 },
            COURSE_2: { x: 146, y: 153 },
            COURSE_3: { x: 148, y: 152 }
        },
        OBSTACLES: {

            COUESE_1: [
                {
                    courseNumber: 1,
                    obstacleNumber: 0,
                    initialPosition: { x: 373, y: 148 },
                    rectangleData: {
                        height: 95,
                        width: 15
                    },

                    isDraggable: false,
                    type: 'fixed'
                },
                {
                    courseNumber: 1,
                    obstacleNumber: 1,
                    rotationHandle1Vertex: 1,
                    rotationHandle2Vertex: 4,
                    initialPosition: { x: 300, y: 338 },
                    focusRectHeight: 120,
                    focusRectWidth: 108,
                    type: 'default'
                },
                {
                    courseNumber: 1,
                    obstacleNumber: 2,
                    rotationHandle1Vertex: 2,
                    rotationHandle2Vertex: 4,
                    initialPosition: { x: 403, y: 337 },
                    focusRectHeight: 110,
                    focusRectWidth: 84,
                    type: 'default'
                },
                {
                    courseNumber: 1,
                    obstacleNumber: 3,
                    rotationHandle1Vertex: 0,
                    rotationHandle2Vertex: 2,
                    initialPosition: { x: 344, y: 433 },
                    focusRectHeight: 80,
                    focusRectWidth: 170,
                    type: 'default'
                },
                {
                    courseNumber: 1,
                    obstacleNumber: 4,
                    initialPosition: { x: 707, y: 276 },
                    rectangleData: {
                        height: 95,
                        width: 15
                    },

                    isDraggable: false,
                    type: 'fixed'
                }
            ],

            COUESE_2: [
                {
                    courseNumber: 2,
                    obstacleNumber: 0,
                    initialPosition: { x: 417, y: 172 },
                    rectangleData: {
                        height: 85,
                        width: 15
                    },

                    isDraggable: false,
                    type: 'fixed'
                },
                {
                    courseNumber: 2,
                    obstacleNumber: 1,
                    rotationHandle1Vertex: 1,
                    rotationHandle2Vertex: 4,
                    initialPosition: { x: 317, y: 418 },
                    focusRectHeight: 110,
                    focusRectWidth: 120,
                    type: 'default'
                },
                {
                    courseNumber: 2,
                    obstacleNumber: 2,
                    rotationHandle1Vertex: 2,
                    rotationHandle2Vertex: 4,
                    initialPosition: { x: 316, y: 325 },
                    focusRectHeight: 90,
                    focusRectWidth: 100,
                    type: 'default'
                }
            ],
            COUESE_3: [
		        {
		            courseNumber: 3,
		            obstacleNumber: 0,
		            type: 'left-river',
		            ignoreBallSnap: true,
		            ignoreOnBridgeDrag: true
		        },
                {
                    courseNumber: 3,
                    obstacleNumber: 1,
                    type: 'right-river',
                    ignoreBallSnap: true,
                    ignoreOnBridgeDrag: true
                },
                {
                    courseNumber: 3,
                    obstacleNumber: 2,
                    initialPosition: { x: 586, y: 213 },
                    rectangleData: {
                        height: 98,
                        width: 12
                    },
                    translateX: -36,
                    translateY: 10,
                    isDraggable: false,
                    type: 'left-fixed',
                    rotatingAngle: -14,
                    ignoreOnBridgeDrag: true

                },
                {
                    courseNumber: 3,
                    obstacleNumber: 3,
                    initialPosition: { x: 586, y: 213 },
                    rectangleData: {
                        height: 98,
                        width: 12
                    },
                    translateX: 34,
                    translateY: -7,
                    isDraggable: false,
                    type: 'right-fixed',

                    rotatingAngle: -14,
                    ignoreOnBridgeDrag: true
                },
                //sword stone
                {
                    courseNumber: 3,
                    obstacleNumber: 4,
                    rotationHandle1Vertex: 0,
                    rotationHandle2Vertex: 3,
                    initialPosition: { x: 274, y: 406 },
                    focusRectHeight: 110,
                    focusRectWidth: 120,
                    type: 'default'
                },
                //wooden obs
                {
                    courseNumber: 3,
                    obstacleNumber: 5,
                    rotationHandlesNotAtVertex: true,
                    rotationHandle1Vertex: [1, 2],
                    rotationHandle2Vertex: [0, 3],
                    initialPosition: { x: 362, y: 352 },
                    focusRectHeight: 84,
                    focusRectWidth: 74,
                    type: 'default'
                }

            ]
        },
        DRAGGABLE: 'draggble',
        ROTATION_ANGLE: 1,

        PAPER_OBJECT_UNIQUE_NAME: {
            MAT_BALL: 'mat-ball',
            START_BALL: 'start-ball',
            BALL: 'ball',
            LAST_BALL: 'last-ball',
            STICKY_SLIDER: 'sticky-slider',
            STICKY_SLIDER_START: 'sticky-slider-start',
            OBSTACLE: 'obstacle',
            BRIDGE: 'bridge'


        },

        SPRITE_POSITIONS: {
            SLIDES_BG_IMAGE: {
                COURSE_0: { LEFT: 10, TOP: 10, WIDTH: 616, HEIGHT: 366 },
                COURSE_1: { LEFT: 10, TOP: 386, WIDTH: 616, HEIGHT: 366 },
                COURSE_2: { LEFT: 10, TOP: 762, WIDTH: 616, HEIGHT: 366 },
                COURSE_3: { LEFT: 10, TOP: 1138, WIDTH: 616, HEIGHT: 366 },
                LOCKED_COURSE: { LEFT: 10, TOP: 1514, WIDTH: 616, HEIGHT: 366 }
            },
            OBSTACLE_1_1: { LEFT: 720, TOP: 194, WIDTH: 101, HEIGHT: 102 },
            OBSTACLE_1_2: { LEFT: 720, TOP: 194, WIDTH: 101, HEIGHT: 102 },
            OBSTACLE_1_3: { LEFT: 720, TOP: 304, WIDTH: 101, HEIGHT: 102 },


            OBSTACLE_3_0: { LEFT: 720, TOP: 194, WIDTH: 101, HEIGHT: 102 },
            OBSTACLE_3_1: { LEFT: 720, TOP: 194, WIDTH: 101, HEIGHT: 102 },
            OBSTACLE_3_2: { LEFT: 720, TOP: 304, WIDTH: 101, HEIGHT: 102 }
        },
        SLIDE_DISTANCE: 644,


        ACC_DATA: {
            BALL_ACC_DATA: {
                HEIGHT: 28,
                WIDTH: 28

            },
            STICKY_SLIDER_ACC_DATA: {
                HEIGHT: 42,
                WIDTH: 35
            },
            BRIDGE_ACC_DATA: {
                HEIGHT: 126,
                WIDTH: 140

            },
            DASH_ARRAY: [3, 3],
            STROKE_COLOR: '#ffffff',
            STROKE_WIDTH: 3

        }
    });
})();