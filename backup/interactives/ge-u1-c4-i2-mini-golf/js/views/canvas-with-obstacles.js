(function () {
    'use strict';

    var miniGolfModels = MathInteractives.Interactivities.MiniGolf.Models,
         modelClassName = miniGolfModels.Obstacle,
         miniGolfModel = miniGolfModels.MiniGolfData;
    /**
    * CanvasWithObstacles holds the all the methods and properties regarding game area.
    * @class CanvasWithObstacles
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.CanvasWithObstacles = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvasAcc.extend({

        /**
        * Initializer function of view.
        * @method initialize
        * @constructor
        */

        bridgeReflectionPath: null,

        bridgeWallObstacles: [],

        defaultObstacles: [],

        initialize: function () {
            this.ballViewList = [];
            this.initializeDefaultProperties();
            this._setUpCanvas();
            this._attachToolEvents();
            this.render();
        },

        /**
        * Renders the view of play game tab with obstacles
        *
        * @method render
        * @public 
        **/
        render: function () {
            this._renderObstacles();
            //Following line commented out 'cause it is now called after succesfull rendering of all obstacles.
            //this._superwrapper('render', arguments);
        },

        /**
        * Creates obstacles' view object
        * @method _renderObstacles
        * @private
        */
        _renderObstacles: function _renderObstacles() {


            var self = this,
                obstacleModels, obstacles,
                index, model,
                obstacleView, obstacleModel,
                idPrefix, levelId,
                miniGolfModels, miniGolfEvents,
                obsTypes = MathInteractives.Interactivities.MiniGolf.Models.Obstacle.TYPES,
                leftFixed = obsTypes.LEFT_FIXED, //bridge wall left
                rightFixed = obsTypes.RIGHT_FIXED, // bridge wall right doing it here so do not have to repeat the same code all again
                leftRiver = obsTypes.LEFT_RIVER,
                rightRiver = obsTypes.RIGHT_RIVER,
                defaultObstacle = obsTypes.DEFAULT,
                currentType = null,
                bridgeWallObstacles = [],
                bridgeRasterActualPath = this.bridgeRasterActualPath || null; // bridge refelction path 

            model = this.model;
            idPrefix = this.idPrefix;
            levelId = model.get('levelId');
            obstacleModels = model.get('obstaclesData');
            obstacles = [];
            miniGolfModels = MathInteractives.Interactivities.MiniGolf.Models;
            miniGolfEvents = miniGolfModels.MiniGolfData.EVENTS;
            this.defaultObstacles = [];
            for (index = 0; index < obstacleModels.length; index++) {
                obstacleModel = obstacleModels.models[index];
                obstacleModel.set({
                    player: this.player,
                    manager: this.manager,
                    idPrefix: idPrefix,
                    filePath: this.filePath

                });

                obstacleModel.off(miniGolfEvents.OBSTACLE_RENDERED).on(miniGolfEvents.OBSTACLE_RENDERED, $.proxy(this._onObstacleRendered, this));

                currentType = obstacleModel.get('type');

                obstacleView = miniGolfModels.Obstacle.generateObstacleOfType({
                    type: currentType,
                    viewProperties: {
                        paperScope: this.paperScope,
                        model: obstacleModel,
                        el: '#' + idPrefix + 'canvas-holder-' + levelId,
                        bridgeRasterActualPath: bridgeRasterActualPath
                    }
                });

                if (currentType === leftFixed || currentType === rightFixed || currentType === leftRiver || currentType === rightRiver) {
                    bridgeWallObstacles.push(obstacleView);

                }
                if (currentType === defaultObstacle) {
                    
                    this.defaultObstacles.push(obstacleView);
                }

                obstacleView.off(miniGolfEvents.OBSTACLE_DRAG_START)
                    .on(miniGolfEvents.OBSTACLE_DRAG_START, function (event) {
                        self.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.DISABLE_RESET);
                        self.onObstacleDragStart(event, this);
                    })

                    .off(miniGolfEvents.OBSTACLE_ROTATE_START)
                    .on(miniGolfEvents.OBSTACLE_ROTATE_START, $.proxy(this.onObstacleRotationStart, this))
                    .off(miniGolfEvents.OBSTACLE_DRAG_EVENT)
                    .on(miniGolfEvents.OBSTACLE_DRAG_EVENT, function (event) {


                        self._checkForObstacleCorrectPoint(event, this)
                    });
                obstacles.push(obstacleView);
            }
            this.obstacles = obstacles;
            this.bridgeWallObstacles = bridgeWallObstacles;
        },

        /**
        * A counter for number of obstacle views rendered.
        *
        * @property obstaclesRenderedCount
        * @type Number
        * @default 0
        * @private
        */
        _obstaclesRenderedCount: 0,

        /**
        * On every call increments obstaclesRenderedCount and when the count equals the number of obstacles
        * Calls the super class' render method if the count
        *
        * @method _onObstacleRendered
        * @private
        */
        _onObstacleRendered: function _onObstacleRendered() {
            this._obstaclesRenderedCount++;

            if (this._obstaclesRenderedCount === this.model.get('obstaclesData').length) {
                this._obstaclesRenderedCount = 0;
                MathInteractives.Interactivities.MiniGolf.Views.CanvasWithObstacles.__super__.render.apply(this, arguments);
            }
        },

        /* TODO: seperate the two methods
        * Attach paper.js canvas tool events
        *
        * @method _attachToolEvents
        * @private
        **/
        _attachToolEvents: function _attachToolEvents() {

            var newScope1 = this.paperScope,
                newScope2 = this.paperScope2,
                ballView,
                ballNames = MathInteractives.Interactivities.MiniGolf.Views.Ball.NAMES,
                self = this;

            this.tool = new newScope1.Tool();

            this.tool.onMouseDrag = function (event) {
                if (event.event.preventDefault) {
                    event.event.preventDefault();
                }
            }
            this.tool.onMouseUp = function (event) {

                var currentTarget = self.currentObject,
                    obstacleReverted = false,
                    skipObstacleNumberForHidingRotationHandle = -1,
                    eventItem = null,
                    getItem = event.getItem;
                if (getItem) {
                    eventItem = event.getItem();
                }
                self.enableDisableObstacleDispenserHelpElements();

                if (self._isNullOrUndefined(currentTarget)) {
                    self.hideRotationHandlesOfObstacles();
                    return;
                }
                switch (currentTarget.name) {
                    case ballNames.BALL:
                        ballView = self._getBallViewAtIndex(currentTarget.cid);
                        self._onBallDragFinished(ballView.view, event);
                        self._onBallMouseUp(event, currentTarget.cid);
                        break;
                    case ballNames.STICKY_SLIDER:

                        ballView = self._getBallViewAtIndex(currentTarget.cid);
                        self._stickySliderDragFinished(ballView.view, event);
                        var currentIndex = self._getBallViewListIndex(currentTarget.cid),
                            previousIndex = currentIndex === 0 ? -1 : currentIndex - 1,
                            previousBall = self._getBallViewAtListIndex(previousIndex),
                            previousBallView = previousBall ? previousBall.view : null,
                            nextIndex = currentIndex === -1 ? currentIndex : currentIndex + 1,
                            nextBall = self._getBallViewAtListIndex(nextIndex),
                            nextBallView = nextBall ? nextBall.view : null;
                        if (nextBallView && nextBallView.getBallSnap()) {
                            event.point = nextBallView.stickySliderRaster.position;
                            self._stickySliderDragFinished(nextBallView, event);
                        }
                        if (previousBall && previousBallView.getBallSnap()) {
                            event.point = previousBallView.stickySliderRaster.position;
                            self._stickySliderDragFinished(previousBallView, event);
                        }
                        var status = self._isLastBallThroughHole();
                        if (status !== -1) {
                            self._holeEncountered(status);
                            self.hideHole(true);
                        }
                        break;
                    case ballNames.ROTATION_HANDLE:

                        self.repositionStartBallStickySlider();
                        self.rotationHandleView.onRotationHandleRotate(event);
                        self.rotationHandleView._resetCursor();
                        break;
                    case ballNames.OBSTACLE:
                        obstacleReverted = self.onObstacleDragStop(event, currentTarget);

                        skipObstacleNumberForHidingRotationHandle = currentTarget.model.get('obstacleNumber');
                        if (obstacleReverted !== true) {
                            self._callLastBallMouseUp(event, currentTarget);
                        }
                        var status = self._isLastBallThroughHole();
                        self.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.HOLE_ENCOUNTERED, status !== -1);
                        break;
                    case ballNames.OBSTACLE_ROTATION_HANDLE:
                        obstacleReverted = self.onObstacleRotationEnd(currentTarget);
                        if (obstacleReverted !== true) {
                            self._callLastBallMouseUp(event, currentTarget);
                        }
                        var status = self._isLastBallThroughHole();
                        self.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.HOLE_ENCOUNTERED, status !== -1);
                }

                self._setCursorAndObstacleRotation(eventItem, currentTarget, skipObstacleNumberForHidingRotationHandle);



                if (self.bridgeWallObstacles.length > 0) {// patch for bridge obstacle as event need to set reset on mouseup
                    self.setEventHandlersOfBridge();
                }

                if (self.arrow) {
                    self.arrow.removeChildren();
                }
                self.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.TOOL_UP_EVENT);
            }
        },

        _setCursorAndObstacleRotation: function (eventItem, currentTarget, skipObstacleNumberForHidingRotationHandle) {
            var self = this,
                obstaclePosition = null,
                eventPosition = null;

            if (eventItem && eventItem.name === miniGolfModel.DRAGGABLE) {

                if (currentTarget.onObstacleMouseEnter) {
                    currentTarget.onObstacleMouseEnter(eventItem);
                    obstaclePosition = currentTarget.obstacleOnPaper.position;
                    eventPosition = eventItem.position;
                    if (obstaclePosition.x === eventPosition.x && obstaclePosition.y === eventPosition.y) {
                        skipObstacleNumberForHidingRotationHandle = currentTarget.model.get('obstacleNumber');
                    }
                }
            }
            else {

                self.rotationHandleView._resetCursor();

            }

            self.hideRotationHandlesOfObstacles(skipObstacleNumberForHidingRotationHandle);
        },
        onAnimationStarted: function () {
            this.hideRotationHandlesOfObstacles(-1);
            this._superwrapper('onAnimationStarted', arguments);

        },
        /**
        * Hides the rotation handles of all obstacles except the obstacle whose obstacleNumber is passed
        *
        * @method hideRotationHandlesOfObstacles
        * @param skipObstacleNumber {Number} The obstacleNumber of the obstacle to be skipped.
        */
        hideRotationHandlesOfObstacles: function hideRotationHandlesOfObstacles(skipObstacleNumber) {
            var index = 0, obstacle,
                skipObstacleNumber = this._isNullOrUndefined(skipObstacleNumber) ? -1 : skipObstacleNumber;
            while ((index = this.getNextObstacleIndex(index, skipObstacleNumber)) != -1) {
                obstacle = this.obstacles[index];
                obstacle.showHideRotationDragHandle(false);
                index++;
            }
        },

        /**
        * The method computes if the dispenser is empty and disables/enables help elements accordingly.
        *
        * @method enableDisableObstacleDispenserHelpElements
        * @private
        */
        enableDisableObstacleDispenserHelpElements: function enableDisableObstacleDispenserHelpElements() {
            var isEmpty = true,
                levelId = this.model.get('levelId'),
                obstacles = this.obstacles,
                courseBoundary = this.actualCourseBounds,
                obstacle, index,
                obstaclePosition;
            for (index = obstacles.length - 1; index >= 0; index--) {
                obstacle = obstacles[index];
                if (obstacle.obstacleOnPaper) {
                    obstaclePosition = obstacle.obstacleOnPaper.position;
                    if (courseBoundary && !courseBoundary.contains(obstaclePosition)) {
                        isEmpty = false;
                        break;
                    }
                }
            }
            this.player.enableHelpElement('obstacles-holder-' + levelId, '0', !isEmpty);
        },

        /**
        * Called at the end of ball dragging, the method is used to set the property '_snapBoundary' to course boundary
        * or obstacle based on the ball's position and then calls the super's method of same name.
        * @method _onBallDragFinished
        * @param ballView {Object} The ball's view object.
        * @param event {Object} The mouse up event object.
        */
        _onBallDragFinished: function _onBallDragFinished(ballView, event) {
            var ballSiblings = this._getSiblingBalls(this._getBallViewListIndex(ballView.cid)),
                result, obstacleCountIncremented = false,
                ballEncounteredHoleEvent = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.BALL_ENCOUNTERED_HOLE;
            if (!ballSiblings.previous) {   // for mat ball
                this._snapBoundary = {
                    path: this.courseBounds,
                    isObstacle: false
                };
            }
            else {
                var prevBallConnectorLine = ballSiblings.previous.view.connectorLine,
                    currentBallView = ballSiblings.current.view,
                    currentBallPosition = currentBallView.getBallPosition(),
                    validPointToSnapAt,
                    tempNearestPoint = null,
                    pointOverObstacle,
                    tolerance = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.CONSTANTS.SNAP_TOLERANCE,
                    pointNearObstacle,
                    obstacle,
                    intersections,
                    obstacleNumber = null;
                // if reopening from saved state, use model properties to decide where to snap the ball.
                if (event.saveResume) {
                    var currentBallModel = currentBallView.ballModel,
                        obstacleNumber = currentBallModel.get('isSnappedTo'),
                        index = 0, currentObstacleNumber;
                    if (obstacleNumber === null) { // if not snapped to any obstacle.
                        this._snapBoundary = {
                            path: this.courseBounds,
                            isObstacle: false
                        };
                    }
                    else {  // if snapped to an obstacle
                        while ((index = this.getNextObstacleIndex(index, -1)) != -1) {
                            obstacle = this.obstacles[index];
                            currentObstacleNumber = obstacle.model.get('obstacleNumber');
                            if (currentObstacleNumber == obstacleNumber) {
                                this._snapBoundary = {
                                    path: obstacle.reflectionPath,
                                    isObstacle: true
                                };
                                break;
                            }
                            index++;
                        }
                        obstacle.incrementSnappedBallCount();
                        obstacleCountIncremented = true;
                    }
                }
                else { // if not from save state
                    
                    this._snapBoundary = {
                        path: this.courseBounds,
                        isObstacle: false
                    };
                    pointOverObstacle = this._isPointInsideAnObstacle(currentBallPosition, -1, ['ignoreBallSnap']);
                    if (pointOverObstacle.isInside) {
                        obstacle = pointOverObstacle.obstacle;
                    }
                    else {
                        pointNearObstacle = this._isPointWithInObstacleTolerance(currentBallPosition, -1, ['ignoreBallSnap'], tolerance);
                        if (pointNearObstacle.isWithInTolerance) {
                            currentBallPosition = pointNearObstacle.pointToSnapAt;
                            obstacle = pointNearObstacle.obstacle;
                        }
                    }
                    if ((pointOverObstacle.isInside || pointNearObstacle.isWithInTolerance) && (this.hole.opacity === 0)) {

                        tempNearestPoint = obstacle.reflectionPath.getNearestPoint(currentBallPosition);
                        validPointToSnapAt = this._getNearestPointForObstacle(tempNearestPoint, prevBallConnectorLine, obstacle, ballSiblings.previous.view.ball);


                        if (!this.courseBounds.contains(validPointToSnapAt)) {
                            validPointToSnapAt = this.courseBounds.getNearestPoint(validPointToSnapAt);
                            this._snapBoundary = {
                                path: this.courseBounds,
                                isObstacle: false
                            };
                        }
                        else {
                            this._snapBoundary = {
                                path: obstacle.reflectionPath,
                                isObstacle: true
                            };

                            obstacle.incrementSnappedBallCount();
                            obstacleCountIncremented = true;
                            obstacleNumber = obstacle.model.get('obstacleNumber');
                        }
                        currentBallView.setBallPosition(validPointToSnapAt);

                    }
                }
            }
            this.off(ballEncounteredHoleEvent).on(ballEncounteredHoleEvent, $.proxy(this.holeEncountered, this, [obstacle]));
            result = this._superwrapper('_onBallDragFinished', [ballView, event, { obstacleNumber: obstacleNumber }]);
            if (result && result.holeEncountered && obstacleCountIncremented) {
                obstacle.decrementSnappedBallCount();
            }
        },

        _getNearestPointForObstacle: function (tempNearestPoint, prevBallConnectorLine, obstacle, prevBall) {

            var lineStartPoint = prevBallConnectorLine.getFirstSegment().getPoint(),//my code starts here
                lineEndPoint = prevBallConnectorLine.getLastSegment().getPoint(),
                lineLengthVector = lineStartPoint.subtract(lineEndPoint),
                lineVector = null,
                intersectPointArray = null,
                intersectPointArrayLength = null,
                newVectorLine = null,
                currentDistance = null,
                minDistance = null,
                minDistancePoint = tempNearestPoint,
                currentPoint = null,
                count = 0;

            lineLengthVector.length = -100;// random number increase it if you want to
            lineVector = lineEndPoint.add(lineLengthVector);
            newVectorLine = new this.paperScope.Path.Line({
                from: lineStartPoint,
                to: lineVector,
                strokeWidth: 2,
                opacity: 0

            });

            intersectPointArray = obstacle.reflectionPath.getIntersections(newVectorLine);
            intersectPointArrayLength = intersectPointArray.length;

            if (intersectPointArrayLength > 0) {

                currentPoint = intersectPointArray[0].getPoint();
                minDistance = tempNearestPoint.getDistance(currentPoint);
                minDistancePoint = currentPoint;

                for (count = 1; count < intersectPointArrayLength; count++) {

                    currentPoint = intersectPointArray[count].getPoint();

                    currentDistance = tempNearestPoint.getDistance(currentPoint);


                    if (currentDistance < minDistance) {

                        minDistance = currentDistance;
                        minDistancePoint = currentPoint;
                    }
                }
                if (prevBall.position && Math.round(prevBall.position.x) === Math.round(minDistancePoint.x) && Math.round(prevBall.position.y) === Math.round(minDistancePoint.y)) {

                    minDistancePoint = tempNearestPoint;
                }
            }
            return minDistancePoint;//my code ends here

        },


        /**
        * Listener for the custom event HOLE_ENCOUNTERED triggered on mouse up of ball.
        * Decrements snapped ball count of obstacle passed in args array if status equal to true.
        *
        * @method holeEncountered
        * @param args {Object} Array of arguments passed through jquery.proxy on listening custom event.
        * @param status {Boolean} Argument passed by the custom event. True if the hole was encountered.
        */
        holeEncountered: function holeEncountered(args) {
            if (args[0]) {
                var obstacle = args[0];
                // obstacle.decrementSnappedBallCount();
            }
        },

        /**
        * Decrements the count of attached balls for the obstacle whose obstacle number was passed.
        *
        * @method decrementBallsAttachedCountOfObstacle
        * @param obstacleNumber {Number} The obstacle's obstacleNumber.
        */
        decrementBallsAttachedCountOfObstacle: function decrementBallsAttachedCountOfObstacle(obstacleNumber) {
            var obstacle, index = 0, currentObstacleNumber;
            if (obstacleNumber !== null) {
                while ((index = this.getNextObstacleIndex(index, -1)) != -1) {
                    obstacle = this.obstacles[index];
                    currentObstacleNumber = obstacle.model.get('obstacleNumber');
                    if (currentObstacleNumber == obstacleNumber) {
                        obstacle.decrementSnappedBallCount();
                        break;
                    }
                    index++;
                }
            }
        },

        /**
        * Increments the count of attached balls for the obstacle whose obstacle number was passed.
        *
        * @method incrementBallsAttachedCountOfObstacle
        * @param obstacleNumber {Number} The obstacle's obstacleNumber.
        */
        incrementBallsAttachedCountOfObstacle: function incrementBallsAttachedCountOfObstacle(obstacleNumber) {
            var obstacle, index = 0, currentObstacleNumber;
            if (obstacleNumber !== null) {
                while ((index = this.getNextObstacleIndex(index, -1)) != -1) {
                    obstacle = this.obstacles[index];
                    currentObstacleNumber = obstacle.model.get('obstacleNumber');
                    if (currentObstacleNumber == obstacleNumber) {
                        obstacle.incrementSnappedBallCount();
                        break;
                    }
                    index++;
                }
            }
        },

        /**
        * Snaps sticky slider to obstacle boundary if dropped over it.
        *
        * @method _stickySliderDragFinished
        * @param ballView {Object} The ball view object whose sticky slider is dropped over the obstacle.
        * @param event {Object} The mouse up event object, passed to parent's _stickySliderDragFinished method as argument.
        */
        _stickySliderDragFinished: function (ballView, event) {
            var ballPosition, pointOverObstacle, obstacle, validPointToSnapAt,
                obstacleNumber = null,
                obstacleModels, obstacleModel, index,
                ballViewList, ballsCount;

            var setBallIsSnappedTo = function (isSnappedTo) {
                ballView.ballModel.set('isSnappedTo', isSnappedTo);
            };

            ballPosition = ballView.getBallPosition();
            validPointToSnapAt = ballPosition;
            pointOverObstacle = this._isPointInsideAnObstacle(ballPosition, -1);
            this._snapBoundary = {
                path: this.courseBounds,
                isObstacle: false
            };
            if (pointOverObstacle.isInside) {/* sticky slider dropped over obstacle */
                this._superwrapper('_stickySliderDragFinished', arguments);
            }
            else {
                ballViewList = this.ballViewList;
                ballsCount = ballViewList.length;
                var wasSnappedTo = ballView.ballModel.get('isSnappedTo');
                this._superwrapper('_stickySliderDragFinished', arguments);
                if (ballViewList.length === ballsCount) {
                    this.decrementBallsAttachedCountOfObstacle(wasSnappedTo);
                    setBallIsSnappedTo(null);
                }
            }
            for (var count = 0; count < this.obstacles.length; count++) {
                this.obstacles[count].sendObstacleToBack();
            }
        },

        /**
        * Checks if the point is inside obstacle, if true return the obstacle along with the result.
        *
        * @method _isPointInsideAnObstacle
        * @param point {Object} The point to be checked.
        * @param ignoreProp {Object} The obstacles matching ignore properties will not be considered while checking point.
        * @return {Object} An object containing a boolean 'isInside' and an object - the obstacle.
        */
        _isPointInsideAnObstacle: function _isPointInsideAnObstacle(point, ignoreObstacleNumber, ignoreProp) {

            ignoreProp = ignoreProp || [];
            var obstacles, index = 0, obstacle;
            while ((index = this.getNextObstacleIndex(index, ignoreObstacleNumber, ignoreProp)) != -1) {
                obstacle = this.obstacles[index];
                if (obstacle.reflectionPath.contains(point)) {
                    return {
                        isInside: true,
                        obstacle: obstacle
                    }
                }
                index++;
            }

            return {
                isInside: false
            }
        },

        /**
        * Checks if the point is within tolerance distance of an obstacle,
        * if true return the closest point on the obstacles' reflection path and the obstacle view object
        * along with the result.
        *
        * @method _isPointInsideAnObstacle
        * @param point {Object} The point to be checked.
        * @param ignoreObstacleNumber {Number} Obstacle index to be ignored.
        * @param ignoreProp {Object} Array of obstacle property names. The obstacles matching ignore properties will not be considered while checking point.
        * @param tolerance {Number} The tolerance distance.
        * @return {Object} An object containing a boolean 'isInside' and an object - the obstacle.
        */
        _isPointWithInObstacleTolerance: function _isPointWithInObstacleTolerance(point, ignoreObstacleNumber, ignoreProp, tolerance) {
            ignoreProp = ignoreProp || [];
            var index = 0, obstacle,
                lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                toleranceCircle,
                intersections,
                pointDistance,
                allIntersectionsObj = {},
                allIntersections = [],
                objectKeys, objectSize;
            toleranceCircle = new this.paperScope.Path.Circle(point, tolerance);
            //toleranceCircle.selected = true;
            while ((index = this.getNextObstacleIndex(index, ignoreObstacleNumber, ignoreProp)) != -1) {
                obstacle = this.obstacles[index];
                intersections = toleranceCircle.getIntersections(obstacle.reflectionPath);
                for (var i = intersections.length - 1; i >= 0; i--) {
                    intersections[i] = intersections[i].point;
                    pointDistance = Math.abs(lineUtility.GetDistBetweenPointFs(point, intersections[i]));
                    allIntersectionsObj[pointDistance] = {
                        point: intersections[i],
                        obstacle: obstacle
                    };
                }
                index++;
            }
            toleranceCircle.remove();
            objectKeys = Object.keys(allIntersectionsObj);
            objectSize = objectKeys.length;
            if (objectSize) {
                objectKeys.sort(function (a, b) {
                    return a - b;
                });
                for (index = 0; index < objectSize; index++) {
                    allIntersections.push(allIntersectionsObj[objectKeys[index]]);
                }
                return {
                    pointToSnapAt: allIntersections[0].point,
                    obstacle: allIntersections[0].obstacle,
                    isWithInTolerance: true
                };
            }
            return {
                isWithInTolerance: false
            }
        },

        /**
        * Validates if the obstacle is at a valid position for drop, if not calls obstacle's revertToLastPosition method
        *
        * @method onObstacleDragStop
        * @param obstacleViewObj {Object} The obstacle view object that is being dropped.
        */
        onObstacleDragStop: function onObstacleDragStop(event, obstacleViewObj) {

            var obstacleModel, model, eventPoint, obstacleNumber, validDroppablePath, obsActualObstaclePath, intersectionLength,
                obstacleTypes, currentObjectType, obstacleInValidRegion, obstacleInDropSlot,
                obstacleReverted = false;
            obstacleModel = obstacleViewObj.model;
            model = this.model;
            eventPoint = {
                x: event.point.x,
                y: event.point.y
            };
            obstacleNumber = obstacleModel.get('obstacleNumber');
            validDroppablePath = this.getDroppableCompoundPath(obstacleNumber);
            obstacleTypes = modelClassName.TYPES;
            currentObjectType = this.currentObject.model.get('type');
            obsActualObstaclePath = obstacleViewObj.actualObstaclePath,
            intersectionLength = obsActualObstaclePath.getIntersections(validDroppablePath).length,
            obstacleInValidRegion = obsActualObstaclePath.intersect(validDroppablePath);

            validDroppablePath.remove();

            if ((Math.round(obstacleInValidRegion.area) !== Math.round(obstacleViewObj.actualObstaclePath.area)) || intersectionLength > 0) {

                if (obstacleViewObj.dropSlot) {
                    obstacleInDropSlot = obstacleViewObj.actualObstaclePath.intersect(obstacleViewObj.dropSlot);

                    // send obstacle back to dispenser
                    if (obstacleInDropSlot.area / obstacleViewObj.actualObstaclePath.area > 0.5) {
                        obstacleViewObj.revertToInitialPosition();
                        obstacleModel.set('isInDispenser', true);
                    }
                        // send obstacle back to last valid position
                    else {
                        obstacleReverted = true;
                        this.revertToLastPosition(obstacleViewObj);
                        // obstacleViewObj.revertToLastPosition();
                    }
                    this.play('obstacle-drop-loofa-sound');
                    obstacleInDropSlot.remove();
                }
                //sliding obstacle model value will be set here
                // obstacleViewObj.model.set('eventPoint', event.point);
            }
            else {
                // drop obstacle at current position

                this.placeObstacle(obstacleViewObj);
                //  obstacleViewObj.placeObstacle(obstacleViewObj.obstacleOnPaper.position);
                obstacleModel.set('isInDispenser', false);
                this.play('obstacle-drop-loofa-sound');
            }

            /* Set/reset isHoleCovered boolean by intersecting all obstacles with the hole */
            var index = 0, obstacle,
                actualHole, holeObstacleIntersectionArea = 0;
            actualHole = this.hole.getChildren()[1];
            while (this.getNextObstacleIndex(index, -1, ['left-fixed', 'right-fixed', 'left-river', 'right-river']) !== -1) {
                obstacle = this.obstacles[index];
                holeObstacleIntersectionArea += actualHole.intersect(obstacle.actualObstaclePath).area;
                index++;
            }
            this.model.set('isHoleCovered',
                (holeObstacleIntersectionArea >= Math.abs(actualHole.area / modelClassName.OBSTACLE_HOLE_INTERSECTION_AREA_TOLERANCE))
            );

            // if (this.bridgeWallObstacles.length > 0) {// patch for bridge obstacle
            if (currentObjectType === obstacleTypes.LEFT_RIVER || currentObjectType === obstacleTypes.RIGHT_RIVER || currentObjectType === obstacleTypes.LEFT_FIXED || currentObjectType === obstacleTypes.RIGHT_FIXED) {

                model.set('eventPoint', eventPoint);
                this._checkForObstacleCorrectPoint(event, this.bridgeWallObstacles[0]);
            }

            obstacleInValidRegion.remove();
            this._reverseTransfer();
            obstacleViewObj.sendObstacleToBack();

            return obstacleReverted;
        },

        placeObstacle: function (obstacleViewObj) {
            obstacleViewObj.placeObstacle(obstacleViewObj.obstacleOnPaper.position);
        },
        revertToLastPosition: function (obstacleViewObj) {

            obstacleViewObj.revertToLastPosition();
        },
        /**
        * Used to mimic mouse up of last ball; used to snap the last ball in case an obstacle was dropped over it.
        *
        * @method _callLastBallMouseUp
        * @param event {Object} Mouse up event object.
        * @param obstacle {Object} Obstacle view object.
        * @private
        */
        _callLastBallMouseUp: function _callLastBallMouseUp(event, obstacle) {

            event = event || {};
            var ballViewList = this.ballViewList,
                ballsCount = ballViewList.length,
                ballView = ballViewList[ballsCount - 1].view,
                index = 0, obst,
                noBallsDeleted = true;
            for (index = 0; index < ballsCount; index++) {
                ballView = ballViewList[index].view;
                var deleteStartIndex = this._isLineThroughHole(ballView.cid);
                if (deleteStartIndex !== -1) {
                    this._holeEncountered(deleteStartIndex);
                    noBallsDeleted = false;
                    break;
                }
            }
            if (noBallsDeleted) {
                ballView = ballViewList[ballsCount - 1].view;
                if (!obstacle || (obstacle && obstacle.reflectionPath.contains(ballView.getBallPosition()))) {
                    this._createSliderOnObstacleBallDrop(ballView, event);

                }
            }
        },
        _createSliderOnObstacleBallDrop: function (ballView, event) {

            this._onBallDragFinished(ballView, event);
            this._onBallMouseUp(event, ballView.ball.cid);
        },
        /**
        * Computes a valid drop region for the obstacle whose obstacle number is passed.
        *
        * @method getDroppableCompoundPath
        * @param skipObstacleNumber {Number} The obstacle's unique number, used to skip it while creating a compound path.
        * @return {Object} Paper.js compound path that's covering only the valid region for dropping the obstacle.
        */
        getDroppableCompoundPath: function getDroppableCompoundPath(skipObstacleNumber, ignorePropArray) {
            var validDroppablePath, index = 0, obstacles,
                defaultObstacleType = null, obstacleType,
                obstacleViewObj, obstacleNumber; //, courseHole;

            //courseHole = this.hole.getChildren()[1];

            validDroppablePath = new this.paperScope.CompoundPath([
                this.actualCourseBounds,
                this.actualMatBounds//,
            //new this.paperScope.Path.Circle({
            //    position: courseHole.position,
            //    radius: courseHole.bounds.width/2
            //})
            ]);

            while ((index = this.getNextObstacleIndex(index, skipObstacleNumber, ignorePropArray)) != -1) {
                this.obstacles[index].actualObstaclePath.copyTo(validDroppablePath);
                index++;
            }
            return validDroppablePath;
        },

        /**
        * Called on start of obstacle's drag; the method is used to set property 'currentObject' and transfer inactive
        * objects to passive canvas.
        * @method onObstacleDragStart
        * @param obstacleViewObj {Object} Obstacle view object.
        */
        onObstacleDragStart: function onObstacleDragStart(event, obstacleViewObj) {
            var bridgeGroup = this.bridgeGroup,
                bridgeGrouPosition = null;

            this.hideRotationHandlesOfObstacles();
            this._transferAllExceptObstacle(obstacleViewObj);
            if (bridgeGroup) {

                bridgeGrouPosition = bridgeGroup.position;

                this.model.set({
                    'lastCorrectPosition': {
                        x: bridgeGrouPosition.x,
                        y: bridgeGrouPosition.y
                    }
                }, { silent: true });
            }
            obstacleViewObj.name = MathInteractives.Interactivities.MiniGolf.Views.Ball.NAMES.OBSTACLE;
            this.hideRotationHandlesOfObstacles();
            this.currentObject = obstacleViewObj;
        },

        /**
        * When ball is clicked , transfer of static paper objects from active canvas to static canvas is initialized.
        * Which will keep necessary paper objects on the active canvas and hence performance can be gained.
        * <b> See also </b> {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_transferStaticObject:method"}}{{/crossLink}}.
        *
        * @method _onBallSelected
        * @param ballView {Object} ball view
        * @param event {Object} Paper.js mouse down event object
        * @private
        */
        _onBallSelected: function (ballView, event) {

            this.hideRotationHandlesOfObstacles();
            this._superwrapper('_onBallSelected', arguments);
        },

        /**
        * When stickyslider is clicked , transfer of static paper objects from active canvas to static canvas is initialized.
        * Which will keep necessary paper objects on the active canvas and hence performance can be gained.
        * <b> See also </b> {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_transferStaticObject:method"}}{{/crossLink}}.
        *
        * @method _stickySliderSelected
        * @param ballView {Object} ball view
        * @param event {Object} Paper.js mouse down event object
        * @private
        */
        _stickySliderSelected: function (ballView, event) {
            this.hideRotationHandlesOfObstacles();
            this._superwrapper('_stickySliderSelected', arguments);
        },

        _rotationHandleSelected: function _rotationHandleSelected(handleSelected) {
            this.hideRotationHandlesOfObstacles();
            this._superwrapper('_rotationHandleSelected', arguments);
        },

        /**
        * Called on start of obstacle's rotation start; the method is used to set property 'currentObject' and transfer inactive
        * objects to passive canvas.
        * @method onObstacleDragStart
        * @param obstacleViewObj {Object} Obstacle view object.
        */
        onObstacleRotationStart: function onObstacleRotationStart(obstacleViewObj, rotationHandleNumber) {
            this._transferAllExceptObstacle(obstacleViewObj);
            obstacleViewObj.name = MathInteractives.Interactivities.MiniGolf.Views.Ball.NAMES.OBSTACLE_ROTATION_HANDLE;
            this.currentObject = obstacleViewObj;
        },

        /**
        * Transfers all paper objects except the obstacle whose view object is passed as parameter to a passive canvas
        * placed behind the active canvas.
        * @method _transferAllExceptObstacle
        * @param obstacleViewObj {Object} The obstacle's view object that is being dragged or rotated.
        * @private
        */
        _transferAllExceptObstacle: function _transferAllExceptObstacle(obstacleViewObj) {
            var movableObjsId = [obstacleViewObj.obstacleOnPaper.id],
                movableObjsLen = movableObjsId.length,
                activeCanvasItems = this.paperScope.project.activeLayer.removeChildren(),
                activeCanvasItemsLen = activeCanvasItems.length,
                deletedObj,
                passiveCanvasItems = [];

            for (var i = 0; i < movableObjsLen; i++) {
                for (var j = 0; j < activeCanvasItemsLen; j++) {
                    if (activeCanvasItems[j].id === movableObjsId[i]) {
                        deletedObj = activeCanvasItems.splice(j, 1);
                        passiveCanvasItems.push(deletedObj[0]);
                        activeCanvasItemsLen--;
                        break;
                    }
                }
            }

            this.paperScope.project.activeLayer.addChildren(passiveCanvasItems);
            this.paperScope2.project.activeLayer.addChildren(activeCanvasItems);

            this.paperScope.view.draw();
            this.paperScope2.view.draw();
            this.paperScope.activate();
        },

        /**
        * Validates if the obstacle is at a valid position for rotation, if not calls obstacle's revertToLastOrientation method
        *
        * @method onObstacleRotationEnd
        * @param obstacleViewObj {Object} The obstacle view object that is being dropped.
        */
        onObstacleRotationEnd: function onObstacleRotationEnd(obstacleViewObj) {
            var obstacleNumber = obstacleViewObj.model.get('obstacleNumber'),
                validDroppablePath = this.getDroppableCompoundPath(obstacleNumber),
                obstacleReverted = false,
                obstacleInValidRegion = obstacleViewObj.actualObstaclePath.intersect(validDroppablePath);
            validDroppablePath.remove();
            if (Math.round(obstacleInValidRegion.area) !== Math.round(obstacleViewObj.actualObstaclePath.area)) {
                obstacleViewObj.revertToLastOrientation();
                obstacleReverted = true;
            }
            else {
                obstacleViewObj.storeCurrentOrientation();
            }
            obstacleInValidRegion.remove();

            obstacleViewObj.attachObstacleGroupEventHandlers();

            this._reverseTransfer();

            obstacleViewObj.sendObstacleToBack();

            return obstacleReverted;
        },

        /**
        * Repositions the ball if dropped over an obstacle
        *
        * @method _snapBallIfDroppedOverObstacle
        * @param ballSiblings {Object} An object storing the ball bring dropped and it's sibling balls.
        * @private
        */
        _snapBallIfDroppedOverObstacle: function _snapBallIfDroppedOverObstacle(ballSiblings) {
            if (!ballSiblings.previous) {
                this._snapBoundary = {
                    path: this.courseBounds,
                    isObstacle: false
                };
                return;
            }
            var prevBallConnectorLine = ballSiblings.previous.view.connectorLine,
                currentBallView = ballSiblings.current.view,
                currentBallPosition = currentBallView.getBallPosition(),
                validPointToSnapAt,
                pointOverObstacle,
                obstacle;
            this._snapBoundary = {
                path: this.courseBounds,
                isObstacle: false
            };
            pointOverObstacle = this._isPointInsideAnObstacle(currentBallPosition, -1);
            if (pointOverObstacle.isInside) {
                obstacle = pointOverObstacle.obstacle;
                validPointToSnapAt = prevBallConnectorLine.getIntersections(obstacle.reflectionPath)[0].point;
                if (!this.courseBounds.contains(validPointToSnapAt)) {
                    validPointToSnapAt = this.courseBounds.getNearestPoint(validPointToSnapAt);
                    this._snapBoundary = {
                        path: this.courseBounds,
                        isObstacle: false
                    };
                }
                else {
                    this._snapBoundary = {
                        path: obstacle.reflectionPath,
                        isObstacle: true
                    };
                }
                currentBallView.setBallPosition(validPointToSnapAt);
            }
        },

        /**
        * Repositions the sticky slider if dropped over an obstacle
        *
        * @method _snapStickSliderIfDroppedNearObstacle
        * @param ballView {Object} The ball view object
        * @private
        */
        _snapStickSliderIfDroppedNearObstacle: function _snapStickSliderIfDroppedNearObstacle(ballView) {
            var ballPosition, pointOverObstacle, obstacle, validPointToSnapAt;
            ballPosition = ballView.getBallPosition();
            pointOverObstacle = this._isPointInsideAnObstacle(ballPosition, -1);
            if (pointOverObstacle.isInside) {
                obstacle = pointOverObstacle.obstacle;
                validPointToSnapAt = obstacle.reflectionPath.getNearestPoint(ballPosition);
                if (!this.courseBounds.contains(validPointToSnapAt)) {
                    validPointToSnapAt = this.courseBounds.getNearestPoint(validPointToSnapAt);
                    this._snapBoundary = {
                        path: this.courseBounds,
                        isObstacle: false
                    };
                }
                else {
                    this._snapBoundary = {
                        path: obstacle.reflectionPath,
                        isObstacle: true
                    };
                }
                ballView.setBallPosition(validPointToSnapAt);
                return {
                    point: ballPosition
                };
            }
        },

        /**
        * On mat ball rotation, this method is used to reposition the start ball if it was snapped.
        *
        * @method repositionStartBallStickySlider
        */
        repositionStartBallStickySlider: function repositionStartBallStickySlider() {
            var matBallView = this.matBallView,
                line = matBallView.connectorLine,
                startBallView = this.startBallView,
                startBallModel = this.startBallView.ballModel,
                isStartBallSnapped = startBallModel.get('isSnapped'),
                wasSnappedTo = startBallModel.get('isSnappedTo'),
                nowSnappedTo,
                intersectionsWithObstacles,
                obstacle,
                nearestPoint = null,
                normalOnSnap;
            if (isStartBallSnapped) {
                this.decrementBallsAttachedCountOfObstacle(wasSnappedTo);
                //intersectionsWithObstacles = this.getFirstIntersectionWithObstacles(line);
                //if (intersectionsWithObstacles[0]) {
                //    obstacle = intersectionsWithObstacles[0].obstacle;
                //    nearestPoint = intersectionsWithObstacles[0].point;
                //}
                nowSnappedTo = obstacle ? obstacle.model.get('obstacleNumber') : null;
                startBallModel.set('isSnappedTo', nowSnappedTo);
                //if (nowSnappedTo !== null) {
                //    obstacle.incrementSnappedBallCount();
                //    startBallView.setBallPosition(nearestPoint);
                //    normalOnSnap = this._getTangent(obstacle.reflectionPath, nearestPoint, {
                //        isObstacle: true,
                //        sourcePoint: matBallView.getBallPosition()
                //    });
                //    startBallView.setBallSnapPoint(normalOnSnap.snapPoint, normalOnSnap.mirrorPoint);
                //    this._currentBallMoved(startBallView.cid);
                //}
            }
        },

        /**
        * Calculates the intersections of all obstacles with the given line and returns them.
        * 
        * @method getFirstIntersectionWithObstacles
        * @param line {Object} Paper.js path object.
        * @return {Object} Returns an array of all intersection points and intersecting obstacle sorted in order -
        * closest to the line's first segment point first.
        */
        getFirstIntersectionWithObstacles: function getFirstIntersectionWithObstacles(line) {
            var lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                index = 0, i,
                obstacle,
                reflectionPath,
                intersections,
                allIntersections = [],
                allIntersectionsObj = {},
                objectKeys = 0,
                objectSize = 0,
                lineStartPoint = line.getFirstSegment().getPoint(),
                pointDistance;

            while ((index = this.getNextObstacleIndex(index, -1)) != -1) {
                obstacle = this.obstacles[index];
                reflectionPath = obstacle.reflectionPath;
                intersections = line.getIntersections(reflectionPath);
                for (i = intersections.length - 1; i >= 0; i--) {
                    intersections[i] = intersections[i].point;
                    pointDistance = Math.abs(lineUtility.GetDistBetweenPointFs(lineStartPoint, intersections[i]));
                    allIntersectionsObj[pointDistance] = {
                        point: intersections[i],
                        obstacle: obstacle
                    };
                }
                index++;
            }
            objectKeys = Object.keys(allIntersectionsObj);
            objectSize = objectKeys.length;
            objectKeys.sort(function (a, b) {
                return a - b;
            });
            for (index = 0; index < objectSize; index++) {
                allIntersections.push(allIntersectionsObj[objectKeys[index]]);
            }
            return allIntersections;
        },

        reset: function reset() {
            this.model.set('isHoleCovered', false);
            this.resetAllObstacles();
            this._superwrapper('reset', arguments);
            this.enableDisableObstacleDispenserHelpElements();
            this.currentObject = null;
        },

        /**
        * Resets all obstacles to intial position and resets the snapped-balls count.
        *
        * @method resetAllObstacles
        */
        resetAllObstacles: function resetAllObstacles() {
            var index = 0, obstacle;
            while ((index = this.getNextObstacleIndex(index, -1)) != -1) {
                obstacle = this.obstacles[index];
                obstacle.revertToInitialPosition();
                index++;
            }
        },

        /**
        * Resets all obstacles snapped-ball count
        *
        * @method resetObstaclesSnappedBallCount
        */
        resetObstaclesSnappedBallCount: function resetObstaclesSnappedBallCount() {
            var index = 0, obstacle;
            while ((index = this.getNextObstacleIndex(index, -1)) != -1) {
                obstacle = this.obstacles[index];
                obstacle.resetSnappedBallCount();
                index++;
            }
        }
    },
{});
})();
