(function () {
    'use strict';
    /**
    * MiniGolfData holds properties and methods required for the whole interactive
    *
    * @class MiniGolfData
    * @module MiniGolf
    * @type Object
    * @constructor
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @namespace MathInteractives.Interactivities.MiniGolf.Models
    */
    MathInteractives.Interactivities.MiniGolf.Models.Course = MathInteractives.Common.Player.Models.BaseInteractive.extend({
        defaults: function () {
            return {
                state: 'unlocked',
                timesPlayed: null,
                holesInOne: null,
                courseBoundaries: null,
                matBoundaries: null,
                obstaclesData: null,
                holeRadius: null,
                holePosition: null,
                rotationHandlePosition: null,
                rotationHandleAngle: null,
                endBallPosition: null,
                balls: null,
                directionTextView: null,
                levelId: null,
                resetCourseButton: null,
                jsonData: null,
                invalidPathIndex: null,
                modelStaticData: null,


                /**
                * A object to to store bridge position
                *
                * @attribute bridgeGroupPosition
                * @type object
                * @default null
                */
                bridgeGroupPosition: null,

                /**
                * A object to store bridge initial position
                *
                * @attribute initialBridgePosition
                * @type object
                * @default  {
                    x: 586,
                    y: 215
                }
                */
                initialBridgePosition: {
                    x: 586,
                    y: 215
                },

                /**
                * A object to store bridge group position
                *
                * @attribute bridgeRasterPosition
                * @type object
                * @default {
                    x: 586,
                    y: 215
                }
                */
                bridgeRasterPosition: {
                    x: 586,
                    y: 215
                },

                /**
                * A object to store event point
                *
                * @attribute eventPoint
                * @type object
                * @default {
                    x: 586,
                    y: 215
                }
                */
                eventPoint: {
                    x: 586,
                    y: 215
                },
                /**
                * A object to store event delta
                *
                * @attribute eventDelta
                * @type object
                * @default {
                    x: 0,
                    y: 0
                }
                */
                eventDelta: {
                    x: 0,
                    y: 0
                },
                /**
                * A boolean attribute, defining whether the course has to be loaded from save state or not
                *
                * @attribute toResetCourse
                * @type Boolean
                * @default null
                */
                toResetCourse: null,
                isBridgeDraggable: true,
                customImageCountObject: null,
                customPopupShown: null,
                invalidPathStartPoint : null,
                invalidPathEndPoint : null
            };
        },

        /**
        * Initialises MiniGolfData Model
        *
        * @method initialize
        **/
        initialize: function (options) {
            
            this.set('resetCourseButton', !!this.get('resetCourseButton'));
            var obstaclesData = this.get('obstaclesData'),
                balls = this.get('balls'),
                miniGolfModelsNamespace = MathInteractives.Interactivities.MiniGolf.Models;
            if (balls === null || typeof balls === 'undefined') {
                this.set('balls', []);
            }
            else {
                this._createBalls();
            }
            if (obstaclesData) {    // from saved state
                for (var index in obstaclesData) {
                    obstaclesData[index]['jsonData'] = this.get('jsonData');
                    obstaclesData[index]['numberOfBallsAttached'] = 0;
                }
                obstaclesData = new miniGolfModelsNamespace.Obstacle.Obstacles(obstaclesData);
                this.set('obstaclesData', obstaclesData);
            }
            else {
                this._createObstacles();
            }
            if (this.get('toResetCourse') === null) {
                this.set('toResetCourse', false);
            }
        },

        _attachEvents: function () {

        },

        addBall: function (newBallModel) {
            var balls = this.get('balls'),
                position = newBallModel.get('position');
            balls.push(newBallModel);
            this.set('balls', balls);
        },

        deleteBall: function (ballToDelete) {
            var balls = this.get('balls'),
                deletedBall;
            for (var i = 0; i < balls.length; i++) {
                if (balls[i].cid === ballToDelete.cid) {
                    deletedBall = balls.splice(i, 1);
                    break;
                }
            }
            this.set('balls', balls);
            return deletedBall;

        },

        /**
        * Creates obstacle models and pushes them into a collection.
        *
        * @method _createObstacles
        * @private
        */
        _createObstacles: function _createObstacles() {

            var courseNumber = this.get('levelId'),
                miniGolfModelsNamespace = MathInteractives.Interactivities.MiniGolf.Models,
                obstaclesStaticData = miniGolfModelsNamespace.MiniGolfData.OBSTACLES['COUESE_' + courseNumber],
                numberOfObstacles, index,
                obstacle, obstacleProperties,
                obstaclesCollection = new miniGolfModelsNamespace.Obstacle.Obstacles(),
                jsonData = this.get('jsonData');

            if (obstaclesStaticData) {
                numberOfObstacles = obstaclesStaticData.length;
                for (var index = 0; index < numberOfObstacles; index++) {
                    obstacleProperties = obstaclesStaticData[index];
                    obstacleProperties.jsonData = jsonData;
                    // obstacleProperties.modelStaticData = obstaclesStaticData[index];
                    obstacle = new miniGolfModelsNamespace.Obstacle(obstacleProperties);
                    obstaclesCollection.push(obstacle);
                }
            }
            this.set('obstaclesData', obstaclesCollection);
        },

        _createBalls: function () {
            var ballModelClass = MathInteractives.Interactivities.MiniGolf.Models.Ball,
                ballModels = [],
                balls = this.get('balls');
            for (var i = 0 ; i < balls.length ; i++) {
                var newBallModel = new ballModelClass(balls[i]);
                ballModels.push(newBallModel);
            }
            this.set('balls', ballModels);
        }
    }, {

        COURSE_TYPE: {
            TYPE_1: 'won',
            TYPE_2: 'unlocked',
            TYPE_3: 'locked'
        },
        BRIDGE_PATH_DATA: {

            RASTER_COUNT: 3,
            BRIDGE_RASTER_NAME: 'bridgeRaster',
            BRIDGE_RASTER_RIGHT_BUTTON: 'bridgeRasterRightButton',
            BRIDGE_RASTER_LEFT_BUTTON: 'bridgeRasterLeftButton',

            BEIDGE_WALL_WIDTH: 9,
            BRIDGE_PATH_WIDTH: 60,
            BRIDGE_PATH_HEIGHT: 96,
            ROTATING_ANGLE: 14,
            RIVER_LINE: {
                FROM: [485, 261],
                TO: [701, 199]

            },

            BUTTON_DATA: {
                HEIGHT: 29,
                WIDTH: 25,
                RIGHT_TRANSLATE: [54, -17],
                LEFT_TRANSLATE: [-46, 14],
                BG_COLOR: '#4F1689'
            }

        },
        KEYCODE: {
            TAB: 9
        },
        CUSTOM_IMAGE_COUNT: {
            COURSE_1: [{ imageNumber: 1 }, { imageNumber: 2 }, { imageNumber: 3 }, { imageNumber: 4, textDiv: true }],
            COURSE_2: [{ imageNumber: 1 }, { imageNumber: 2 }]
        }


    });
})();