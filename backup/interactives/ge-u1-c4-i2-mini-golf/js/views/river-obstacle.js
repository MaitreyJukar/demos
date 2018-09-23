
(function () {
    'use strict';
    /**
    * Obstacle holds the necessary structure for the obstacles.
    * @class Obstacle
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    var miniGolfModels = MathInteractives.Interactivities.MiniGolf.Models,
        obstacleModelClassName = miniGolfModels.Obstacle,
        miniGolfModel = miniGolfModels.MiniGolfData;

    MathInteractives.Interactivities.MiniGolf.Views.RiverObstacle = MathInteractives.Interactivities.MiniGolf.Views.Obstacle.extend({


        /**
        * Holds the left river paper object
        * @property leftRiverObstacle
        * @default null
        * @private 
        */
        leftRiverObstacle: null,
        /**
        * Holds the right river paper object
        * @property rightRiverObstacle
        * @default null
        * @private 
        */
        rightRiverObstacle: null,

        /**
        * Holds the actual bridge raster path
        * @property bridgeRasterActualPath
        * @default null
        * @private 
        */
        bridgeRasterActualPath: null,

        /**
        * Holds the current type of obstacle
        * @property type
        * @default null
        * @private 
        */
        type: null,

        /**
        * Holds the line above the river to get the intersection of line and bridgeRasterActualPath
        * @property startPointLine
        * @default null
        * @private 
        */
        startPointLine: null,
        /**
        * Holds the line below the river to get the intersection of line and bridgeRasterActualPath
        * @property endPointLine
        * @default null
        * @private 
        */
        endPointLine: null,


        /**
        * Holds the actual path of obstacle
        * @property actualObstaclePath
        * @default null
        * @private 
        */
        actualObstaclePath: null,
        /**
        * Holds the relflection path of obstacle
        * @property reflectionPath
        * @default null
        * @private 
        */
        reflectionPath: null,

        /**
        * Holds the group of actualObstaclePath and reflectionPath
        * @property obstacleOnPaper
        * @default null
        * @private 
        */
        obstacleOnPaper: null,

        /**
        * Initializes function of view.
        * @method initialize
        * @param {object} options to initialize current obstacle
        * @constructor
        */
        initialize: function initialize(options) {

            // this._callBaseViewInitialize(options);
            this._superwrapper('initialize', arguments);
            this._initializeSlidingObstacleProp(options);
            this._render();
            this._bindEvents();
        },


        /**
        * cached some imp data at the start.
        * @method _initializeSlidingObstacleProp
        * @param {object} options to initialize current obstacle
        
        */
        _initializeSlidingObstacleProp: function (options) {
            // var viewProp = options.viewProperties;

            this.bridgeRasterActualPath = options.bridgeRasterActualPath;
            this.type = options.type;

            //this.rightBridgeWall = options.rightBridgeWall;


        },

        /**
        * render current view 
        * @method _render
      
        * @private 
        */
        _render: function () {
            this.model.set('isInDispenser', false);
            this._createJoiningLines();
            this._createRiverObs();

            this.model.trigger(miniGolfModel.EVENTS.OBSTACLE_RENDERED);
        },



        /**
        * render river object according to its type
        * @method _createRiverObs
       
        * @private 
        */
        _createRiverObs: function () {
            var type = this.type,
                obsTypes = obstacleModelClassName.TYPES

            if (type === obsTypes.LEFT_RIVER) {
                this._createLeftRiver();
            }
            else if (type === obsTypes.RIGHT_RIVER) {
                this._createRightRiver();
            }

            //this._setBaseViewProp();
        },

        /**
        * render joining lines of river (create river path)
        * @method _createJoiningLines
        
        * @private 
        */
        _createJoiningLines: function () {

            var paperScope = this.paperScope,
                leftSideRiverPoint = obstacleModelClassName.LEFT_SIDE_RIVER_POINT,
                rightSideRiverPoint = obstacleModelClassName.RIGHT_SIDE_RIVER_POINTS;

            this.startPointLine = new paperScope.Path.Line({
                from: rightSideRiverPoint.START_POINT,
                to: leftSideRiverPoint.START_POINT//,
                // selected: true
            })

            this.endPointLine = new paperScope.Path.Line({
                from: rightSideRiverPoint.END_POINT,
                to: leftSideRiverPoint.END_POINT//,
                //selected: true
            })






        },

        /**
        * attach events on model
        * @method _bindEvents
        
        * @private 
        */
        _bindEvents: function () {

            var model = this.model,
                self = this;

            model.on('change:lastCorrectPosition', function () {
                self._createRiverObs();

            })
        },


        /**
        * create left side river
        * @method _createLeftRiver
        
        * @private 
        */
        _createLeftRiver: function () {
            this._resetCurrentObsPath();

            var paperScope = this.paperScope,
                bridgeRasterActualPath = this.bridgeRasterActualPath,
                endLine = this.endPointLine,
                startLine = this.startPointLine,
                topPoint = null,
                bottomPoint = null,
                leftSideRiverPoint = obstacleModelClassName.LEFT_SIDE_RIVER_POINT,
                startPoint = leftSideRiverPoint.START_POINT,
                endPoint = leftSideRiverPoint.END_POINT;

            topPoint = startLine.getIntersections(bridgeRasterActualPath)[0].point;
            bottomPoint = endLine.getIntersections(bridgeRasterActualPath)[0].point;

            this.actualObstaclePath = new paperScope.Path({

                segments: [leftSideRiverPoint.START_POINT, topPoint, bottomPoint, leftSideRiverPoint.END_POINT],
                closed: true
            });

            this.reflectionPath = new paperScope.Path({

                segments: [[startPoint.x - 14, startPoint.y - 2], [topPoint.x - 2, topPoint.y - 11], [bottomPoint.x + 3, bottomPoint.y + 9], [endPoint.x, endPoint.y + 10]],
                closed: true

            });
            this._setBaseViewProp();

        },


        /**
        * create left side river
        * @method _createRightRiver
        
        * @private 
        */
        _createRightRiver: function () {
            this._resetCurrentObsPath();

            var paperScope = this.paperScope,
                bridgeRasterActualPath = this.bridgeRasterActualPath,
                endLine = this.endPointLine,
                startLine = this.startPointLine,
                topPoint = null,
                bottomPoint = null,
                rightSideRiverPoint = obstacleModelClassName.RIGHT_SIDE_RIVER_POINTS,
                startPoint = rightSideRiverPoint.START_POINT,
                endPoint = rightSideRiverPoint.END_POINT;

            topPoint = startLine.getIntersections(bridgeRasterActualPath)[1].point;
            bottomPoint = endLine.getIntersections(bridgeRasterActualPath)[1].point;

            this.actualObstaclePath = new paperScope.Path({

                segments: [startPoint, topPoint, bottomPoint, endPoint],
                closed: true
            });

            this.reflectionPath = new paperScope.Path({

                segments: [[startPoint.x, startPoint.y - 8], [topPoint.x - 1, topPoint.y - 8], [bottomPoint.x + 2, bottomPoint.y + 8], [endPoint.x, endPoint.y + 10]],
                closed: true

            })
            this._setBaseViewProp();
        },


        /**
        * reset view props
        * @method _resetCurrentObsPath
        
        * @private 
        */
        _resetCurrentObsPath: function () {


            if (this.actualObstaclePath !== null) {

                this.obstacleOnPaper.removeChildren();
                this.obstacleOnPaper.remove();

                this.actualObstaclePath.removeChildren();
                this.actualObstaclePath.remove();
                this.reflectionPath.removeChildren();
                this.reflectionPath.remove();

                delete this.reflectionPath;
                delete this.actualObstaclePath;
                delete this.obstacleOnPaper;

                this.reflectionPath = null;
                this.actualObstaclePath = null;
                this.obstacleOnPaper = null;

            }
        },

        /**
        * set view props
        * @method _setBaseViewProp
        
        * @private 
        */
        _setBaseViewProp: function () {


            this.obstacleOnPaper = new this.paperScope.Group([this.actualObstaclePath, this.reflectionPath]);
            //this.obstacleOnPaper.selected = true;
            this.obstacleOnPaper.sendToBack();


        },

        /*
        * reset the river positions
        * @method revertToInitialPosition
        
        * @private 
        */
        revertToInitialPosition: function () {

            this._createRiverObs();

        }
    })
})();