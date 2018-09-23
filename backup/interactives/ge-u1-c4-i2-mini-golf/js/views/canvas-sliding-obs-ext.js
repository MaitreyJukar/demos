(function () {
    'use strict';
    /**
    * CanvasWithObstacles holds the all the methods and properties regarding game area.
    * @class CanvasWithObstacles
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    var miniGolfModels = MathInteractives.Interactivities.MiniGolf.Models,
        courseModelClassName = miniGolfModels.Course,
        obstacleModelClassName = miniGolfModels.Obstacle,
        miniGolfModel = miniGolfModels.MiniGolfData;

    MathInteractives.Interactivities.MiniGolf.Views.CanvasSlidingObsExt = MathInteractives.Interactivities.MiniGolf.Views.CanvasWithObstaclesAcc.extend({

        ballViewList: [],
        restOfTheCompoundPath: null,
        dragAreaGroup: null,
        buttonCompoundPath: null,
        bridgeGroup: null,
        riverLineSlope: null,
        bridgeRaster: null,
        bridgeRasterActualPath: null,
        bridgeReflectionPath: null,
        buttonGroup: null,
        bridgeFocusRect: null,


        /**
        * Initializer function of view.
        * @method initialize
        * @constructor
        */

        initialize: function (options) {
            this.ballViewList = [];
            this.initializeDefaultProperties();
            this._setUpCanvas();

            this._cachedtRasters();
            //this.render();


            // this._attachToolEvents();


        },

        initializeDefaultProperties:function initializeDefaultProperties(){

            this._superwrapper('initializeDefaultProperties',arguments);
            this.isMobile=MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;
        },

        /**
        * cached all the rasters at the start and store them in the view property Will call render on all raster load
        *
        * @method _cachedtRasters
        * @private
        **/
        _cachedtRasters: function () {

            var self = this,
                rasterCount = courseModelClassName.BRIDGE_PATH_DATA.RASTER_COUNT,
                count = null,
                loadedRaster = 0,
                paperScope = this.paperScope,
                currentRasterData = null,
                currentRaster = null;

            for (count = 0; count < rasterCount; count++) {

                currentRaster = null;
                currentRasterData = null;
                currentRasterData = this._getRasterData(count);

                currentRaster = new paperScope.Raster({
                    source: currentRasterData.source
                });
                this[currentRasterData.name] = currentRaster;

                currentRaster.onLoad = function () {

                    loadedRaster += 1;
                    if (loadedRaster === rasterCount) {
                        self.render();
                        self._attachToolEvents();
                        self._bindEvents();
                    }
                }

            }

        },


        /**
        * get necessary data to load raster
        *
        * @method _getRasterData
        * @param {intger} count to return data accordingly
        * @private
        **/
        _getRasterData: function (count) {
            var dataToReturn = null,
                bridgePathData = courseModelClassName.BRIDGE_PATH_DATA,
                baseUrl = this.getJson('baseURL');

            if (count === 0) {
                dataToReturn = {
                    source: baseUrl.bridgeObstacleBase64URL,
                    name: bridgePathData.BRIDGE_RASTER_NAME
                }

            }
            if (count === 1) {
                dataToReturn = {
                    source: baseUrl.bridgeDraggingButtonRight,
                    name: bridgePathData.BRIDGE_RASTER_RIGHT_BUTTON
                }
            }
            if (count === 2) {
                dataToReturn = {
                    source: baseUrl.bridgeDraggingButtonLeft,
                    name: bridgePathData.BRIDGE_RASTER_LEFT_BUTTON
                }
            }

            return dataToReturn

        },

        /**
        * render current view will be called on all raster load
        *
        * @method render

        * @public
        **/
        render: function () {

            this._createRiverLineSlope();
            this._createBridgeRaster();
            this._createStaticBridgeArrow();
            this._superwrapper('render', arguments);
            //this._setRiverObstaclesPosition();

        },

        /**
        * render bridge and set poisition accordingly
        *
        * @method _createBridgeRaster

        * @private
        **/
        _createBridgeRaster: function () {

            var paperScope = this.paperScope,
                model = this.model,
                bridgeReflectionPath = null,
                bridgeRasterActualPath = null,
                bridgeRasterPosition = model.get('bridgeRasterPosition'),
                bridgePathsConstants = courseModelClassName.BRIDGE_PATH_DATA,
                wallWidth = bridgePathsConstants.BEIDGE_WALL_WIDTH,
                wallHeight = bridgePathsConstants.BRIDGE_WALL_HEIGHT,
                bridgePathWidth = bridgePathsConstants.BRIDGE_PATH_WIDTH,
                bridgePathHeight = bridgePathsConstants.BRIDGE_PATH_HEIGHT,
                bridgeRaster = null,
                rightSideButton = null,
                baseUrl = model.getJson('baseURL'),
                bridgeDraggingButtonRight = baseUrl.bridgeDraggingButtonRight,
                bridgeDraggingButtonLeft = baseUrl.bridgeDraggingButtonLeft,
                rigthButton = null,
                leftButton = null,
                leftSideButtonGroup = null,
                rightSideButtonGroup = null,
                buttonData = bridgePathsConstants.BUTTON_DATA,
                leftTranslate = buttonData.LEFT_TRANSLATE,
                rightTranslate = buttonData.RIGHT_TRANSLATE,
                bridgeGroup = null,
                bridgeFocusRect = null,
                accConstants = miniGolfModel.ACC_DATA,
                bridgeAccConstants = accConstants.BRIDGE_ACC_DATA,
                rotatingAngle = bridgePathsConstants.ROTATING_ANGLE;



            this.bridgeRaster.position = bridgeRasterPosition;
            bridgeRaster = this.bridgeRaster;

            this.bridgeRasterActualPath = bridgeRasterActualPath = new paperScope.Path.Rectangle({
                height: bridgePathHeight,
                width: bridgePathWidth + 2 * wallWidth + 6,
                fillColor: '#ffffff',
                opacity: 0.00

            });

            this.bridgeReflectionPath = bridgeReflectionPath = new paperScope.Path.Rectangle({
                height: bridgePathHeight + 20,
                width: bridgePathWidth + 2 * wallWidth + 20

            });

            bridgeRasterActualPath.rotate(-rotatingAngle);

            bridgeReflectionPath.position.x = bridgeRasterPosition.x + 2;
            bridgeReflectionPath.position.y = bridgeRasterPosition.y - 4;
            bridgeRasterActualPath.position.x = bridgeRasterPosition.x + 2;
            bridgeRasterActualPath.position.y = bridgeRasterPosition.y - 4;


            this.bridgeReflectionPath.rotate(-rotatingAngle);


            this.bridgeRasterRightButton.position = bridgeRasterPosition
            this.bridgeRasterLeftButton.position = bridgeRasterPosition

            rigthButton = this.bridgeRasterRightButton;
            leftButton = this.bridgeRasterLeftButton;

            rigthButton.rotate(-rotatingAngle);
            leftButton.rotate(-rotatingAngle);
            rightSideButtonGroup = new paperScope.Group(rigthButton);

            leftSideButtonGroup = new paperScope.Group(leftButton);

            leftSideButtonGroup.translate(leftTranslate[0], leftTranslate[1]);
            rightSideButtonGroup.translate(rightTranslate[0], rightTranslate[1]);

            this.buttonGroup = new paperScope.Group(rightSideButtonGroup, leftSideButtonGroup);
            this.dragAreaGroup = new paperScope.Group(bridgeRasterActualPath, this.buttonGroup);

            this.bridgeFocusRect = bridgeFocusRect = new paperScope.Path.Rectangle({
                position: [bridgeRasterPosition.x + 4, bridgeRasterPosition.y - 3],
                height: bridgeAccConstants.HEIGHT,
                width: bridgeAccConstants.WIDTH,
                strokeColor: accConstants.STROKE_COLOR,
                strokeWidth: accConstants.STROKE_WIDTH,
                visible: false,
                dashArray: accConstants.DASH_ARRAY
            });

            this.bridgeGroup = bridgeGroup = new paperScope.Group(bridgeRaster, bridgeReflectionPath, this.dragAreaGroup, bridgeFocusRect);
            bridgeGroup.name = miniGolfModel.DRAGGABLE;
            bridgeGroup.bringToFront();
            // bridgeGroup.selected = true;

        },

        /**
        * render white arrow inside the river
        *
        * @method _createStaticBridgeArrow

        * @private
        **/

        _createStaticBridgeArrow: function () {

            var paperScope2 = this.paperScope2,
                initialBridgePosition = this.model.get('initialBridgePosition');

            this.bridgeArrow = new paperScope2.Raster({
                source: this.getJson('baseURL').bridgeArrow,
                position: {
                    x: initialBridgePosition.x + 9,
                    y: initialBridgePosition.y + 2

                }
            })
            this.bridgeArrow.sendToBack();

        },

        /**
        * attach events on bridge and model
        *
        * @method _bindEvents

        * @private
        **/
        _bindEvents: function () {
            var self = this,
                model = this.model,
                count = 0,
                obstacles = this.obstacles,
                obstaclesLength = obstacles.length,
                currentObject = this.bridgePathGroup,
                currentPosition = null,
                bridgeWallFirstObs = this.bridgeWallObstacles[0];



            this._setBridgeEvents();

            model.on('change:eventPoint', function () {

                self._setRiverBridgePosition();
            });
            //   model.on('change:bridgeRasterPosition', function () {
            model.on('change:bridgeGroupPosition', function () {
                self._setRiverObstaclesPosition();
            });

        },

        /**
        * attach specific bridge events
        *
        * @method _setBridgeEvents

        * @private
        **/

        _setBridgeEvents: function () {

            var model = this.model,
                dragAreaGroup = this.dragAreaGroup,
                isBridgeDraggable = null,
                //bridgeWallFirstObs = this.bridgeWallObstacles[2],// 0 and 1 are river obs and 2,3 are fixed wall obs
                self = this;
            this.buttonGroup.opacity = 1;
            this.bridgeArrow.visible = true;
            this.bridgeArrow.sendToBack();
            model.set('isBridgeDraggable', true);
            //  this._isBridgeDraggable = true;
            dragAreaGroup.onMouseDrag = function (event) {

                isBridgeDraggable = model.get('isBridgeDraggable');

                if (isBridgeDraggable) {
                    this.detach('mouseenter');
                    this.detach('mouseleave');
                    model.set('eventDelta', event.delta);
                    model.set('eventPoint', event.point);
                }
                else {
                    self._onDisabledBridgeDrag();
                }
            };



            dragAreaGroup.onMouseEnter = function (event) {
                self._openHandCursor(event);
            }
            dragAreaGroup.onMouseLeave = function () {
                self._defaultCursor();
            }


            dragAreaGroup.onMouseDown = function (event) {
                self._handleMouseDownOnDataAreaGroup(event);

            };


        },

        _handleMouseDownOnDataAreaGroup: function _handleMouseDownOnDataAreaGroup(event) {
            this._closedHandCursor(event);
            //0 and 1 are river obs and 2,3 are fixed wall obs
            this.bridgeWallObstacles[2].trigger(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.OBSTACLE_DRAG_START, event);
        },

        /**
        * A boolean to indicate whether the bridge is currently draggable.
        * @property _isBridgeDraggable
        * @type Boolean
        * @default false
        */
        _isBridgeDraggable: false,

        /**
        * Instance of the pop-up shown when user tries to drag the bridge obstacle when it is disabled.
        * @property obstacleDragPopUp
        * @type Object
        * @default null
        */
        obstacleDragPopUp: null,

        /**
        * Called when user tries to drag the disabled bridge obstacle; it is used to generate a pop-up
        * @method _onDisabledBridgeDrag
        * @private
        */
        _onDisabledBridgeDrag: function _onDisabledBridgeDrag() {
            var options = {
                manager: this.manager,
                path: this.filePath,
                player: this.player,
                idPrefix: this.idPrefix,
                containsTts: true,
                title: this.getMessage('obstacle-drag-pop-up-text', 'title'),
                accTitle: this.getAccMessage('obstacle-drag-pop-up-text', 'title'),
                text: this.getMessage('obstacle-drag-pop-up-text', 'body-text'),
                accText: this.getAccMessage('obstacle-drag-pop-up-text', 'body-text'),
                type: MathInteractives.global.Theme2.PopUpBox.CONFIRM,
                buttons: [
                    {
                        id: 'okay-button',
                        type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                        text: this.getMessage('reset-pop-up-text', 'okay-btn'),
                        response: { isPositive: true, buttonClicked: 'okay-button' }
                    }
                ],
                closeCallback: {
                    fnc: function (response) {
                        this.obstacleDragPopUp = null;
                    },
                    scope: this
                }
            };
            this.stopReading();
            if (!this.obstacleDragPopUp) {
                this.obstacleDragPopUp = MathInteractives.global.Theme2.PopUpBox.createPopup(options);
            }
        },

        /**
        * Changes the cursor to the open hand cursor
        *
        * @method _openHandCursor
        * @private
        **/
        _openHandCursor: function _openHandCursor(event) {
            if (!this.isMobile && !event.isAccessibility) {
                $('#' + this.idPrefix + 'game-canvas-' + this.model.get('levelId')).css({ 'cursor': 'url("' + this.getImagePath('open-hand') + '"), move' });
            }
        },

        /**
        * Changes the cursor to the closed hand cursor
        *
        * @method _closedHandCursor
        * @private
        **/
        _closedHandCursor: function _closedHandCursor(event) {
            if (!this.isMobile && !event.isAccessibility) {
                $('#' + this.idPrefix + 'game-canvas-' + this.model.get('levelId')).css({ 'cursor': 'url("' + this.getImagePath('closed-hand') + '"), move' });
            }
        },


        /**
        * Changes the cursor to the default cursor
        *
        * @method _defaultCursor
        * @private
        **/
        _defaultCursor: function _defaultCursor() {

            if (!this.isMobile) {
                $('#' + this.idPrefix + 'game-canvas-' + this.model.get('levelId')).css({ 'cursor': 'default' });
            }
        },

        /**
        * create river line slope to use in bridge positioning
        *
        * @method _createRiverLineSlope

        * @private
        **/
        _createRiverLineSlope: function () {

            var riverLineData = courseModelClassName.BRIDGE_PATH_DATA.RIVER_LINE,
                startPoint = riverLineData.FROM,
                endPoint = riverLineData.TO;
            this.riverLineSlope = (startPoint[1] - endPoint[1]) / (startPoint[0] - endPoint[0]);

        },

        /**
        * set bridge positioning on bridge mousefdrag using river line slope
        *
        * @method _setRiverBridgePosition

        * @private
        **/
        _setRiverBridgePosition: function () {

            var model = this.model,
                eventPoint = model.get('eventPoint'),
                eventDelta = model.get('eventDelta'),
                deltaX = eventDelta.x,
                bridgeGroup = this.bridgeGroup,
                bridgeGroupPosition = bridgeGroup.position,
                newBridgeX = bridgeGroupPosition.x + deltaX,
                riverLineData = courseModelClassName.BRIDGE_PATH_DATA.RIVER_LINE;

            this.stopReading();

            if (newBridgeX > riverLineData.FROM[0] && newBridgeX < riverLineData.TO[0]) {
                if ((deltaX > 0 && eventPoint.x > bridgeGroupPosition.x) || (deltaX < 0 && eventPoint.x < bridgeGroupPosition.x)) {
                    bridgeGroup.position.x = newBridgeX;
                    bridgeGroup.position.y = bridgeGroupPosition.y + (this.riverLineSlope * deltaX);
                }
            }



        },

        /**
        * set bridge wall obstacles and river obstacles position after bridge drag event
        *
        * @method _setRiverObstaclesPosition

        * @private
        **/
        _setRiverObstaclesPosition: function () {
            var count = null,
                lastCorrectPosition = this.model.get('lastCorrectPosition'),
                bridgeWallObstacles = this.bridgeWallObstacles,
                bridgeWallObstaclesLength = bridgeWallObstacles.length;

            this.bridgeGroup.position = lastCorrectPosition;
            this.restOfTheCompoundPath = null;

            for (count = 0; count < bridgeWallObstaclesLength; count++) {
                bridgeWallObstacles[count].model.set('lastCorrectPosition', lastCorrectPosition);
            }
            this.bridgeGroup.sendToBack();
        },

        /**
        *reset bridge position to the initial position
        *
        * @method _setBridgeToInitialPosition

        * @private
        **/
        _setBridgeToInitialPosition: function () {

            this.bridgeGroup.position = this.model.get('initialBridgePosition');

        },
        /**
        * Transfers all paper objects except the obstacle whose view object is passed as parameter to a passive canvas
        * placed behind the active canvas.
        * @method _transferAllExceptObstacle
        * @param obstacleViewObj {Object} The obstacle's view object that is being dragged or rotated.
        * @private
        */
        _transferAllExceptObstacle: function _transferAllExceptObstacle(obstacleViewObj) {


            var currentObsType = obstacleViewObj.model.get('type'),
                obsTypes = obstacleModelClassName.TYPES;

            if (currentObsType === obsTypes.LEFT_RIVER || currentObsType === obsTypes.RIGHT_RIVER
                || currentObsType === obsTypes.LEFT_FIXED || currentObsType === obsTypes.RIGHT_FIXED) {


                var movableObjsId = [obstacleViewObj.obstacleOnPaper.id],
                    movableObjsLen = movableObjsId.length,
                    bridgePathObstacle = this.bridgeWallObstacles,
                    bridgePathObstacleLength = bridgePathObstacle.length,
                    activeCanvasItems = this.paperScope.project.activeLayer.removeChildren(),
                    activeCanvasItemsLen = activeCanvasItems.length,
                    bridgeGroupId = this.bridgeGroup.id,
                    currentId = null,
                    deletedObj,
                    passiveCanvasItems = [];

                for (var i = 0; i < bridgePathObstacleLength; i++) {
                    for (var j = 0; j < activeCanvasItemsLen; j++) {

                        currentId = activeCanvasItems[j].id;
                        if (bridgePathObstacle[i].obstacleOnPaper.id === currentId || bridgeGroupId === currentId) {
                            deletedObj = activeCanvasItems.splice(j, 1);
                            passiveCanvasItems.push(deletedObj[0]);
                            activeCanvasItemsLen--;

                        }
                    }
                }

                this.paperScope.project.activeLayer.addChildren(passiveCanvasItems);
                this.paperScope2.project.activeLayer.addChildren(activeCanvasItems);

                this.paperScope.view.draw();
                this.paperScope2.view.draw();
                this.paperScope.activate();
            }
            else {
                this._superwrapper('_transferAllExceptObstacle', arguments);
            }

        },

        /**
        *check if bride is not places on any obsactacle
        *
        * @method _checkForObstacleCorrectPoint
        * @param {object} event paper.js event object
        * @param {object} obstacleViewObj draggable obstacle view
        * @private
        **/
        _checkForObstacleCorrectPoint: function (event, obstacleViewObj) {

            var obstacleNumber = obstacleViewObj.model.get('obstacleNumber'),
                validDroppablePath = this.getDroppableCompoundPath(obstacleNumber, ['ignoreOnBridgeDrag']),
                obstacleInValidRegion = this.bridgeRasterActualPath.getIntersections(validDroppablePath),
                //intersectingArea = validDroppablePath.intersect(this.bridgeRasterActualPath).area,

                obstacleInDropSlot,
                model = this.model,
                obsPosition = obstacleViewObj.obstacleOnPaper.position,
                bridgeGroup = this.bridgeGroup,
                bridgeGroupPosition = bridgeGroup.position,
                currentPosition = {
                    x: bridgeGroupPosition.x,
                    y: bridgeGroupPosition.y

                },
                bridgeRasterPosition = null;

            validDroppablePath.remove();
            this.restOfTheCompoundPath = validDroppablePath;

            if (obstacleInValidRegion.length > 0) {
                // model.set({ bridgeRasterPosition: null }, { silent: true });
                //   model.set('bridgeRasterPosition', model.get('lastCorrectPosition'));
                model.set({ bridgeGroupPosition: null }, { silent: true });
                model.set('bridgeGroupPosition', model.get('lastCorrectPosition'));
                //model.set('bridgeRasterPosition', this.bridgeGroup.children[0].position);
            }
            else {

                model.set('lastCorrectPosition', currentPosition);
                // model.set('bridgeRasterPosition', currentPosition);
                model.set('bridgeGroupPosition', currentPosition);
            }
            bridgeRasterPosition = this.bridgeGroup.children[0].position;
            model.set('bridgeRasterPosition', {
                x: bridgeRasterPosition.x,
                y: bridgeRasterPosition.y

            });

        },



        /**
        *enable disable events of bridge on tool mouseup
        *
        * @method setEventHandlersOfBridge

        * @private
        **/
        setEventHandlersOfBridge: function () {

            var bridgeWallObstacles = this.bridgeWallObstacles,
                leftBridgeWall = bridgeWallObstacles[2],
                bridgeGroup = this.bridgeGroup,
                dragAreaGroup = this.dragAreaGroup,
                obstacleIntersection = null,
                compoundPath = this._getObstacleCompoundPath(),
                passingThroughBridge = this._isPassingThroughBridge(),//  new this.paperScope.CompoundPath(),
                rightBridgeWall = bridgeWallObstacles[3];

            if (compoundPath !== null) {
                obstacleIntersection = this.bridgeRasterActualPath.intersect(compoundPath);
                compoundPath.remove();

            }
            dragAreaGroup.detach('mousedown');
            // this._isBridgeDraggable = false;

            dragAreaGroup.detach('mouseenter');
            dragAreaGroup.detach('mouseleave');
            this.bridgeArrow.visible = false;
            this.bridgeArrow.sendToBack();
            this.buttonGroup.opacity = 0.5;


            bridgeGroup.sendToBack();
            if (passingThroughBridge && leftBridgeWall.model.get('numberOfBallsAttached') <= 0 && rightBridgeWall.model.get('numberOfBallsAttached') <= 0
                && (obstacleIntersection === null || (obstacleIntersection !== null && obstacleIntersection.area <= 0))) {
                this._setBridgeEvents();


            }
            else {
                this.model.set('isBridgeDraggable', false);// instead of detaching 'mousedrag', set a boolean, used inside mousedrag event handler

            }
            if (obstacleIntersection !== null) {
                obstacleIntersection.remove();
            }
        },


        /**
        *get compound path consist of all the obsacles and boundry course
        *
        * @method _getObstacleCompoundPath

        * @private
        **/
        _getObstacleCompoundPath: function () {



            var count = 0,
                compoundPath = new this.paperScope.CompoundPath(),
                obstacles = this.obstacles,
                currentObs = null,
                currentModel = null,
                obstacleLength = obstacles.length;

            for (count = 0; count < obstacleLength; count++) {
                currentObs = obstacles[count];
                currentModel = currentObs.model;
                if (!currentModel.get('ignoreOnBridgeDrag') && !currentModel.get('isInDispenser')) {
                    currentObs.actualObstaclePath.copyTo(compoundPath);
                }
            }
            if (compoundPath.children.length <= 0) {
                compoundPath = null;
            }
            return compoundPath;
        },
        /**
        * Resets all obstacles to intial position and resets the snapped-balls count.
        *
        * @method resetAllObstacles
        */
        resetAllObstacles: function resetAllObstacles() {

            this._setBridgeToInitialPosition();
            this._setBridgeEvents();
            //this._setBridgeEvents();
            this._superwrapper('resetAllObstacles', arguments);


        },

        /**
        *reset current view
        *
        * @method reset

        * @private
        **/
        reset: function () {
            var model = this.model;

            model.set('bridgeRasterPosition', model.get('initialBridgePosition'));
            this._superwrapper('reset', arguments);

        },

        /**
        *check if connector line is passing through bridge
        *
        * @method reset

        * @private
        **/
        _isPassingThroughBridge: function () {
            var bridge = this.bridgeRasterActualPath,
                connectorLine,
                ballViewList = this.ballViewList;
            for (var i = 0 ; i < ballViewList.length ; i++) {
                connectorLine = ballViewList[i].view.connectorLine;

                if (connectorLine && bridge.getIntersections(connectorLine).length > 0) {
                    return false;
                }
            }

            return true;
        },


        /**
        * Computes a valid drop region for the obstacle whose obstacle number is passed.
        *
        * @method getDroppableCompoundPath
        * @param skipObstacleNumber {Number} The obstacle's unique number, used to skip it while creating a compound path.
        * @return {Object} Paper.js compound path that's covering only the valid region for dropping the obstacle.
        */
        getDroppableCompoundPath: function getDroppableCompoundPath(skipObstacleNumber, ignorePropArray) {

            var currentObsType = this.currentObject.model.get('type'),
                obsTypes = obstacleModelClassName.TYPES;

            if (currentObsType === obsTypes.LEFT_RIVER || currentObsType === obsTypes.RIGHT_RIVER
                || currentObsType === obsTypes.LEFT_FIXED || currentObsType === obsTypes.RIGHT_FIXED) {

                var validDroppablePath, index = 0, obstacles,
                    defaultObstacleType = null, obstacleType,
                    obstacleViewObj, obstacleNumber;



                validDroppablePath = new this.paperScope.CompoundPath();

                while ((index = this.getNextObstacleIndex(index, skipObstacleNumber, ignorePropArray)) != -1) {
                    this.obstacles[index].actualObstaclePath.copyTo(validDroppablePath);
                    index++;
                }
                return validDroppablePath;
            }
            else {

                return this._superwrapper('getDroppableCompoundPath', arguments);
            }
        },

        /**
        * will be fired on mousedown of draggable ball
        *
        * @method _onBallSelected

        * @private
        **/
        _onBallSelected: function (ballView, event) {


            this.bridgeGroup.sendToBack();
            this.bridgeArrow.sendToBack();


            this._superwrapper('_onBallSelected', arguments);
        },

        /**
        * will be fired load save state
        *
        * @method _loadSaveState

        * @private
        **/
        _loadSaveState: function () {
            this._superwrapper('_loadSaveState', arguments);
            this.setEventHandlersOfBridge();

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
            var currentObsType = obstacle.model.get('type'),
                obsTypes = obstacleModelClassName.TYPES;

            if (currentObsType === obsTypes.LEFT_RIVER || currentObsType === obsTypes.RIGHT_RIVER
                || currentObsType === obsTypes.LEFT_FIXED || currentObsType === obsTypes.RIGHT_FIXED) {

                this._superwrapper('_callLastBallMouseUp', arguments);
                this._superwrapper('_callLastBallMouseUp', [event, this.obstacles[3]]);
            }
            else {
                this._superwrapper('_callLastBallMouseUp', arguments);
            }


        },
    })
})()
