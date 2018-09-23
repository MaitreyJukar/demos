(function () {
    'use strict';
    var models = MathInteractives.Interactivities.MiniGolf.Models,
        miniGolfModel = models.MiniGolfData,
        courseModel = models.Course,
        obstacleModel = models.Obstacle;
    /**
    * BaseCanvas holds the all the methods and properties regarding game area.
    * @class BaseCanvas
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.BaseCanvasAcc = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.extend({
        prevFocusRect: null,
        canvasAccModel: null,
        canvasAcc: null,
        _isAccUsed: false,
        draggableObstaclesArray: [],
        initialize: function () {
            this._superwrapper('initialize', arguments);
        },

        /**
        * Loads the save state if ball counts are greater than 2 in model. Basically this method sets the position of the balls
          as same as in the save state and then triggers mosueUp event to simulate actual interaction.
          This is to avoid manually attaching events to objects.initializes accsessibility
          
          This function takes care of Help Elements visibility , incorrect path highlighiting and take shot button visibility.
        * <b> See also </b> {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/highLightIncorrectPath:method"}}{{/crossLink}},
        {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/enableDisableObstacleDispenserHelpElements:method"}}{{/crossLink}}.
        * @method _loadSaveState
        * @constructor
        * @private
        */
        _loadSaveState: function () {


            this._superwrapper('_loadSaveState', arguments);
            this._initAccessiblity();
            this._bindAccessibilityListeners();
            this._resetCanvasAccHolderText();
        },

        /**
        * initializes canvas acc view and model
        * @method _initAccessiblity
        * @private
        */
        _initAccessiblity: function () {

            this.loadScreen('canvas-text-screen');

            var canvasAccOption = {
                canvasHolderID: this.idPrefix + 'canvas-holder-' + this.model.get('levelId') + '-acc-container',
                paperItems: [],
                paperScope: this.paperScope,
                manager: this.manager,
                player: this.player
            },
            activePaperItems = null,
            canvasAccModel = new MathInteractives.Common.Player.Models.CanvasAcc(canvasAccOption);
            canvasAccOption.model = canvasAccModel;
            this.canvasAcc = MathInteractives.global.CanvasAccExt.intializeCanvasAcc(canvasAccOption);
            this.canvasAccModel = canvasAccModel;

            activePaperItems = this._setActivePaperObjects();
            this._updatePaperItems(activePaperItems);

        },

        /**
        * bind canvas acc events
        * @method _bindAccessibilityListeners
        * @private
        */
        _bindAccessibilityListeners: function _bindAccessibilityListeners() {
            var self = this,
                canvasAccModel = MathInteractives.Common.Player.Models.CanvasAcc,
                keyEvents = canvasAccModel.CANVAS_KEY_EVENTS,
                canvasKeyupEvents = canvasAccModel.CANVAS_KEYUP_EVENTS,
                $canvasHolder = this.$('#' + this.idPrefix + 'canvas-holder-' + this.model.get('levelId') + '-acc-container');

            // Handle tab
            $canvasHolder.on(keyEvents.TAB, function (event, data) {

                //set mousedown for all paper object
                event.isAccessibility = true;
                self._handleTabOnPaperItem(event, data);

            });

            // Handle space
            $canvasHolder.off(canvasAccModel.ITEM_EVENTS.ITEM_FOCUS_OUT).on(canvasAccModel.ITEM_EVENTS.ITEM_FOCUS_OUT, function (event, data) {
                var isFocusOutEvent = true;
                event.isAccessibility = true;
                self._handleSpaceAndFocusOutOnObject(event, data, isFocusOutEvent);
            })

            $canvasHolder.off(keyEvents.SPACE).on(keyEvents.SPACE, function (event, data) {
                event.isAccessibility = true;
                self._handleSpaceAndFocusOutOnObject(event, data);
            });
            $canvasHolder.off(canvasAccModel.CANVAS_EVENTS.FOCUS_OUT).on(canvasAccModel.CANVAS_EVENTS.FOCUS_OUT, function (event, data) {
                event.isAccessibility = true;
                self._canvasFocusOut(event, data);
            });


            $canvasHolder.off(keyEvents.ARROW + ' ' + keyEvents.ROTATE_CLOCKWISE + ' ' + keyEvents.ROTATE_ANTI_CLOCKWISE)
                        .on(keyEvents.ARROW + ' ' + keyEvents.ROTATE_CLOCKWISE + ' ' + keyEvents.ROTATE_ANTI_CLOCKWISE, function (event, data) {
                            event.isAccessibility = true;
                            self._handleDraggingOnKeyDown(event, data);
                        });

            $canvasHolder.off(canvasKeyupEvents.ANY_KEYUP).on(canvasKeyupEvents.ANY_KEYUP, function (customEvent, event, keyCode, currentCanvasItem) {

                event.isAccessibility = true;
                self._handleAccOnKeyUp(customEvent, event, keyCode, currentCanvasItem)
            });

            $canvasHolder.on(canvasKeyupEvents.DELETE_KEYUP, function (customEvents, event, keyCode, currentObject) {
                event.isAccessibility = true;

                self._handleDeleteOnItem(customEvents, event, keyCode, currentObject);
            })

        },

        /**
        * returns active acc paper objects
        * @method _setActivePaperObjects
        * @private
        * @ return{object} active canvas items array
        */
        _setActivePaperObjects: function () {

            var ballViewList = this.ballViewList,
                ballLength = ballViewList.length,
                startBallViewBall = this.startBallView,

                canvasAcc = this.canvasAcc,
                count = 0,
                uniqueNames = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME,


                activePaperObjects = [];

            this._addMatBallToCanvasItems();
            this._addBallViewToCanvasItems();// will add paper object to active paper object array



            if (ballLength <= 2) {// if start ball is last ball handling is diff

                startBallViewBall.uniquePaperObjectName = uniqueNames.START_BALL;
            }
            else {// if start ball is not last ball it will be a sticky slider whose rotation causes the rotation of rotation handle
                startBallViewBall.uniquePaperObjectName = uniqueNames.STICKY_SLIDER_START;
            }


            for (count = 0; count < ballLength; count++) {

                activePaperObjects.push(ballViewList[count].view);
            }

            return activePaperObjects;


        },
        /**
        * update canvas paper items
        * @method _updatePaperItems
        * @private

        */
        _updatePaperItems: function (activePaperObjects, keepCurrentFocus) {

            this.canvasAcc.updatePaperItems(activePaperObjects, keepCurrentFocus);

        },

        /**
        * add ball views to the active paper objects
        * @method _addBallViewToCanvasItems
        * @private
      
        */
        _addBallViewToCanvasItems: function () {

            var ballViewList = this.ballViewList,
                ballLength = ballViewList.length,
                startBallViewBall = this.startBallView,
                dargBallViewBall = ballViewList[ballLength - 1].view,

                count = 0,
                currentBall = null,
                uniqueNames = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME,
                ballName = uniqueNames.BALL,

                isStartBallLastBall = true;


            for (count = ballLength - 1 ; count > 1; count--) {

                currentBall = ballViewList[count].view;
                if (count === ballLength - 1) {

                    isStartBallLastBall = false;
                    currentBall.uniquePaperObjectName = uniqueNames.LAST_BALL;
                }
                else {

                    currentBall.uniquePaperObjectName = uniqueNames.STICKY_SLIDER;
                }
            }

        },
        /**
        * add mat ball view to the active paper objects
        * @method _addMatBallToCanvasItems
        * @param {array} active paper object array
        * @private
        */
        _addMatBallToCanvasItems: function (activePaperObjects) {

            var matballViewBall = this.matBallView,
                uniqueNames = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME;

            matballViewBall.uniquePaperObjectName = uniqueNames.MAT_BALL;


        },
        /**
        * tab handler for canvas elements 
        * @method _handleTabOnPaperItem
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _handleTabOnPaperItem: function (event, data) {

            var uniqueNames = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME,
                currentItemName = data.item.uniquePaperObjectName,
                ballView = null,
                rotationHandleView = null,
                currentHandle = null,
                ballModel = null,
                elementId = 'canvas-holder-' + this.model.get('levelId') + '-acc-container',
                angleOfIncidence = null,
                angleOfReflection = null,
                ballIndex = null,
                canvasAccModel = this.canvasAccModel,
                setMessageObject = {
                    elementId: elementId
                };


            switch (currentItemName) {

                case uniqueNames.MAT_BALL:
                    this._onTabOfMatBall(event, data);
                    break;

                case uniqueNames.START_BALL:
                case uniqueNames.LAST_BALL:
                    this._onTabOfLastBall(event, data);

                    break;

                case uniqueNames.STICKY_SLIDER:
                case uniqueNames.STICKY_SLIDER_START:

                    this._onTabOfSlider(event, data);

                    break;
            }

            this._drawView();

        },
        /**
        * mat ball tab handler 
        * @method _onTabOfMatBall
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _onTabOfMatBall: function (event, data) {

            var ballView = data.item,
                elementId = 'canvas-holder-' + this.model.get('levelId') + '-acc-container',
                 setMessageObject = {
                     elementId: elementId
                 };
            if (event) {
                event.event = {
                    which: 1
                };

                ballView._ballSelected(event);
            }
            this._isAccUsed = true;


            this._showHideFocusRect(ballView.ballFocusRect);
            setMessageObject.strMessage = this.getMessage('mat-ball', 0);
            this.canvasAccModel.set({ 'setAccMessageObject': null }, { silent: true });// fix to solve issue for model bug. 
            this.canvasAccModel.set('setAccMessageObject', setMessageObject);

        },

        /**
        * last ball tab handler 
        * @method _onTabOfLastBall
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _onTabOfLastBall: function (event, data) {


            var ballView = data.item;

            if (event) {
                event.event = {
                    which: 1
                };

                ballView._ballSelected(event);
            }
            if (event && !event.shiftKey) {
                var activeCanvasItems = this._setActivePaperObjects();
                this._updatePaperItems(activeCanvasItems, true);
            }

            this.currentObject = ballView.ball;
            this._showHideFocusRect(ballView.ballFocusRect);
            this._setLastBallMessage(ballView);

        },
        /**
        * set last ball acc message
        * @method _setLastBallMessage
        * @private
        */
        _setLastBallMessage: function (takeShotButtonAppeared) {
            var elementId = 'canvas-holder-' + this.model.get('levelId') + '-acc-container',
                   setMessageObject = {
                       elementId: elementId
                   },
                   canvasAccModel = this.canvasAccModel;
            if (takeShotButtonAppeared === true) {
                setMessageObject.strMessage = this.getMessage('destination-ball', 1);
            }
            else {
                setMessageObject.strMessage = this.getMessage('destination-ball', 0);
            }
            canvasAccModel.set({ 'setAccMessageObject': null }, { silent: true });
            canvasAccModel.set('setAccMessageObject', setMessageObject);

        },

        /**
        * sticky slider tab handler
        * @method _onTabOfSlider
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _onTabOfSlider: function _onTabOfSlider(event, data) {


            var ballView = data.item;

            if (event) {


                event.event = {
                    which: 1
                };

                this._reverseTransfer();
                ballView._stickySliderSelected(event);
            }
            ballView.setStickySliderFocusRectPosition();
            this._showHideFocusRect(ballView.stickySliderFocusRect);

            this._setSliderAccMessage(ballView, data);
            //  this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.HIDE_TAKE_SHOT_BUTTON, false);


        },

        /**
        * slider acc message will updated here
        * @method _setSliderAccMessage
        * @private
        */
        _setSliderAccMessage: function _setSliderAccMessage(ballView, data) {

            var ballModel = ballView.ballModel,
                ballIndex = null,
                nextBallAngle = null,
                prevBallAngle = null,
                strMessage = null,
                elementId = 'canvas-holder-' + this.model.get('levelId') + '-acc-container',
                 setMessageObject = {
                     elementId: elementId
                 },
                 messageId = null,
            newSlider = data.isNewSlider || false;

            ballIndex = this._getBallViewListIndex(ballView.cid);
            nextBallAngle = ballModel.get('nextBallAngle') || 0;
            prevBallAngle = ballModel.get('prevBallAngle') || 0;

            if (newSlider === true) {
                strMessage = this.getMessage('sticky-slider-text', 1, [ballIndex]);
                if (prevBallAngle === 1) {
                    messageId = 'one-deg-incident';
                }
                else if (nextBallAngle === 1) {
                    messageId = 'one-deg-reflection';
                }
                else {
                    messageId = 2;
                }
                strMessage = strMessage + this.getMessage('sticky-slider-text', messageId, [prevBallAngle, nextBallAngle]);
            }
            else if (data.isMoved) {
                if (prevBallAngle === 1) {
                    messageId = 'new-one-deg-incident';
                }
                else if (nextBallAngle === 1) {
                    messageId = 'new-one-deg-reflection';
                }
                else {
                    messageId = 4;
                }
                strMessage = this.getMessage('sticky-slider-text', messageId, [prevBallAngle, nextBallAngle]);
            }
            else {
                strMessage = this.getMessage('sticky-slider-text', 0, [ballIndex]);
                //strMessage = this.getMessage('sticky-slider-text', 1, [ballIndex]);

                if (prevBallAngle === 1) {
                    messageId = 'one-deg-incident';
                }
                else if (nextBallAngle === 1) {
                    messageId = 'one-deg-reflection';
                }
                else {
                    messageId = 2;
                }
                strMessage = strMessage + this.getMessage('sticky-slider-text', messageId, [prevBallAngle, nextBallAngle]);

                strMessage = strMessage + this.getMessage('sticky-slider-text', 3);
            }


            setMessageObject.strMessage = strMessage;


            this.canvasAccModel.set('setAccMessageObject', setMessageObject);

        },
        /**
        * redraw canvas 
        * @method _drawView
        * @private
        */

        _drawView: function _drawView() {

            this.paperScope.view.draw();
            this.paperScope2.view.draw();


        },

        /**
        * show hide focus rect for focused element of canvas
        * @method _showHideFocusRect
        * @private
        */
        _showHideFocusRect: function _showHideFocusRect(currentFocusRect) {
            if (this._isAccUsed === true) {
                var prevFocusRect = this.prevFocusRect || null;

                currentFocusRect = currentFocusRect || null;

                if (prevFocusRect !== null) {
                    prevFocusRect.visible = false;
                }

                if (currentFocusRect !== null) {
                    currentFocusRect.visible = true;
                    this.prevFocusRect = currentFocusRect;
                }
            }



        },
        /**
        * arrow key handler for canvas elements
        * @method _handleDraggingOnKeyDown
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _handleDraggingOnKeyDown: function (event, data) {

            var uniqueNames = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME,
                currentItem = data.item,
                currentItemName = currentItem.uniquePaperObjectName,
                eventType = event.type,
                canvasAccModel = MathInteractives.Common.Player.Models.CanvasAcc,
                isStartBallStickySlider = false,
                rotationHandleView = null,
                keyEvents = canvasAccModel.CANVAS_KEY_EVENTS;

            if (eventType === keyEvents.ARROW) {


                switch (currentItemName) {
                    case uniqueNames.START_BALL:

                        this._handleStartBallDragOnArraow(event, data);
                        break;

                    case uniqueNames.MAT_BALL:

                        this._handleMatBallDrag(event, data);
                        break;
                    case uniqueNames.LAST_BALL:

                        this._handleLastBallDrag(event, data);
                        break;

                    case uniqueNames.STICKY_SLIDER:
                        isStartBallStickySlider = false,
                        this._handleStickySliderDrag(event, data, isStartBallStickySlider);

                        break;
                    case uniqueNames.STICKY_SLIDER_START:
                        isStartBallStickySlider = true;
                        this._handleStickySliderDrag(event, data, isStartBallStickySlider);
                        break;
                }

            }
            else if (eventType === keyEvents.ROTATE_CLOCKWISE) {
                this._reverseTransfer();
                if (currentItemName === uniqueNames.MAT_BALL) {

                    event.event = {
                        which: 1
                    }
                    rotationHandleView = this.rotationHandleView;
                    rotationHandleView.onRotationHandleMouseDown(rotationHandleView.handle1, event);
                    this._rotateHandleClockWise(event);

                }
            }

            else if (eventType === keyEvents.ROTATE_ANTI_CLOCKWISE) {
                this._reverseTransfer();
                if (currentItemName === uniqueNames.MAT_BALL) {
                    event.event = {
                        which: 1
                    }
                    rotationHandleView = this.rotationHandleView;
                    rotationHandleView.onRotationHandleMouseDown(rotationHandleView.handle1, event);

                    this._rotateHandleAntiClockWise(event);

                }

            }
            this._drawView();


        },

        /**
        * delete key handler for canvas elements
        * @method _handleDeleteOnItem
        * @private
        */
        _handleDeleteOnItem: function (customEvents, event, keyCode, currentObject) {
            var uniqueNames = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME,
                currentItemName = currentObject.uniquePaperObjectName;


            if (currentItemName === uniqueNames.STICKY_SLIDER || currentItemName === uniqueNames.STICKY_SLIDER_START) {
                event.point = miniGolfModel.MATBALL_POSITIONS.COURSE_0;// currentObject.getBallPosition();
                // currentObject.setBallPosition(miniGolfModel.MATBALL_POSITIONS.COURSE_0);
                this.currentObject = currentObject.stickySliderRaster
                this._deleteCurrentSliderAndUpdateFocus(event);
                this._drawView();
            }

        },

        /**
        * delete key handler for canvas elements
        * @method _handleDeleteOnItem
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _handleStartBallDragOnArraow: function (event, data) {
            var ballView = data.item,
                currentBall = ballView.ball,
                currentItemPosition = currentBall.position,
                obsMinDragDistance = obstacleModel.DRAG_DISTANCE_ACC,
                customEvent = {
                    point: {
                        x: currentItemPosition.x + data.directionX * obsMinDragDistance,
                        y: currentItemPosition.y + data.directionY * obsMinDragDistance
                    },
                    isAccessibility: event.isAccessibility
                };

            this._onStartBallDrag(customEvent, ballView);

        },

        /**
        * handler for mat ball dragging on arrow keys 
        * @method _handleMatBallDrag
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _handleMatBallDrag: function (event, data) {
            var currentBall = data.item.ball,
              currentItemPosition = currentBall.position,
              obsMinDragDistance = obstacleModel.DRAG_DISTANCE_ACC,
              customEvent = {
                  point: {
                      x: currentItemPosition.x + data.directionX * obsMinDragDistance,
                      y: currentItemPosition.y + data.directionY * obsMinDragDistance

                  },
                  isAccessibility: event.isAccessibility
              };
            // data.item.selected = true;
            this._onMatBallDrag(customEvent);

        },
        /**
        * handler for last ball dragging on arrow keys 
        * @method _handleLastBallDrag
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _handleLastBallDrag: function (event, data) {

            var ballView = data.item,
                currentBall = ballView.ball,
                currentItemPosition = currentBall.position,
                obsMinDragDistance = obstacleModel.DRAG_DISTANCE_ACC,
                takeShotButtonAppeared = true,
              customEvent = {
                  point: {
                      x: currentItemPosition.x + data.directionX * obsMinDragDistance,
                      y: currentItemPosition.y + data.directionY * obsMinDragDistance
                  },
                  isAccessibility: event.isAccessibility
              };

            this._onBallDrag(ballView, customEvent);

        },


        /**
        * handler for mat ball rotation in clockwise direction 
        * @method _rotateHandleClockWise
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _rotateHandleClockWise: function (event, data) {
            var rotationAngle = miniGolfModel.ROTATION_ANGLE;
            this.rotationHandleView.rotate(-rotationAngle, event);
        },
        /**
        * handler for mat ball rotation in anticlockwise direction 
        * @method _rotateHandleAntiClockWise
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _rotateHandleAntiClockWise: function (event, data) {
            var rotationAngle = miniGolfModel.ROTATION_ANGLE;
            this.rotationHandleView.rotate(rotationAngle, event);
        },


        /**
        * sticky slider drag handler on arrow key press 
        * @method _handleStickySliderDrag
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @param {boolean} isStartStickySlider is first sticky slider or not
        * @private
        */
        _handleStickySliderDrag: function (event, data, isStartStickySlider) {
            //    console.log('sticky slider drag');
            if (!data.item.stickySliderRaster) {
                return
            }



            var ballView = data.item,
                currentItem = ballView.ball,
                stickySliderRaster = ballView.stickySliderRaster,

                stickySliderHeight = stickySliderRaster.bounds.height,
                stickySliderWidth = stickySliderRaster.bounds.width,

                currentItemPosition = ballView.getBallPosition(),//stickySliderRaster.position,
                ballPosition = currentItem.position,
                obsMinDragDistance = obstacleModel.DRAG_DISTANCE_ACC - 1,
                newX = currentItemPosition.x + data.directionX * obsMinDragDistance,
                newY = currentItemPosition.y + data.directionY * obsMinDragDistance,
                courseBounds = this.courseBounds,
                customEventPoint = {
                    x: newX,
                    y: newY
                },

                newPoint = null,
                customEvent = {
                    point: customEventPoint,
                    isAccessibility: true
                };




            if (!courseBounds.contains(customEventPoint)) {
                newPoint = this._simpleBallDragRestrict(customEventPoint, this.courseBounds);
                if (Math.round(newPoint.x) === Math.round(ballPosition.x) && Math.round(newPoint.y) === Math.round(ballPosition.y)) {
                    customEvent.point = {
                        x: newX + data.directionX * stickySliderWidth,
                        y: newY + data.directionY * stickySliderHeight
                    }
                }

            }

            this._stickySliderDragged(ballView, customEvent, true);
            ballView.setStickySliderFocusRectPosition();


            if (isStartStickySlider) {
                this.rotationHandleView._startBallStickySliderDragged(customEvent);
            }
            data.isMoved = true;
            this._setSliderAccMessage(ballView, data);
        },

        /**
        * Handles {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/stickySliderRaster:method"}}{{/crossLink}} dragging finished functionality.
        * @method _stickySliderDragFinished
        * @param ballView {Object} {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball"}}{{/crossLink}}
        * @param event {Object} paperjs mouse drag event.        
        * @private
        */

        _stickySliderDragFinished: function (ballView, event) {

            if (!event.point) {
                var currentBall = ballView.ball,
                    ballRadius = Math.round(ballView.ballInnerRaster.bounds.width / 2),
                    ballPosition = ballView.getBallPosition(),
                    boundryNearestPoint = this.actualCourseBounds.getNearestPoint(ballPosition),
                    ballCenterToCourseBoundDistance = Math.round(boundryNearestPoint.getDistance(ballPosition));



                if (ballRadius < ballCenterToCourseBoundDistance) {
                    event.point = ballView.getBallPosition();
                }
                else {
                    event.point = ballView.stickySliderRaster.position;
                }
            }

            this._superwrapper('_stickySliderDragFinished', arguments);


        },

        /**
        * call parent class function and set acc messages
        * The method calls the drag finish handler for the current ball's next ball's sticky slider.
        *
        * @method _onBallMouseUp
        * @param event {Object} The mouse up event object.
        * @param currentTargetCid {String} The 'cid' of the current ball dragged.
        */
        _onBallMouseUp: function (event, currentTargetCid) {

            var currentItem = null,
                currentPaperItemName = null,
                data = null,
                uniqueNames = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME,
                takeShotButtonAppeared = false,
                status = null;

            this._superwrapper('_onBallMouseUp', arguments);
            this._updatePaperItemsOnBallMosueup(true);
            currentItem = this.canvasAcc.getCurrentPaperItem();
            currentPaperItemName = currentItem.uniquePaperObjectName;

            if (event.isAccessibility) {
                if (currentPaperItemName === uniqueNames.STICKY_SLIDER || currentPaperItemName === uniqueNames.STICKY_SLIDER_START) {

                    this._showHideFocusRect(currentItem.stickySliderFocusRect);
                    data = {
                        item: currentItem,
                        isNewSlider: true

                    }
                    this._onTabOfSlider(event, data);
                }
                else {
                    if (currentPaperItemName !== uniqueNames.MAT_BALL) {
                        status = this._isLastBallThroughHole();

                        if (status !== -1) {
                            takeShotButtonAppeared = true;
                            this._setLastBallMessage(takeShotButtonAppeared);
                        }
                        else {
                            this._setLastBallMessage(takeShotButtonAppeared);
                        }
                    }
                }
            }





        },

        /**
        * update canvas active paper items on ball mouseup
        * @method _updatePaperItemsOnBallMosueup      
        * @param {boolean} keepCurrentItem to focus current item focus in or not 
        * @private
        */
        _updatePaperItemsOnBallMosueup: function (keepCurrentItem) {

            var canvasAcc = this.canvasAcc,
                ballViewList = this.ballViewList,
                ballViewListLength = ballViewList.length,
                activePaperItems = null,

                updateStartBoolean = true;

            activePaperItems = this._setActivePaperObjects();
            this._updatePaperItems(activePaperItems, keepCurrentItem);

        },
        /**
        * Returns event point if contained inside bounding path, else returns nearest point on bounding path.
        *
        * @method _simpleBallDragRestrict
        * @param eventPoint {Object} Paper.js event point
        * @param boundingPath {Object} Paper.js closed path object within which the ball is to be restricted.
        * @private
        **/
        _onBallDragFinished: function (ballView, event) {

            var uniqueNames = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME,
                currentItemName = ballView.uniquePaperObjectName;

            if (currentItemName === uniqueNames.START_BALL || currentItemName === uniqueNames.LAST_BALL
                || currentItemName === uniqueNames.MAT_BALL) {
                this._showHideFocusRect(ballView.ballFocusRect);
            }
            else if (currentItemName === uniqueNames.STICKY_SLIDER || currentItemName === uniqueNames.STICKY_SLIDER_START) {

                this._showHideFocusRect(ballView.stickySliderFocusRect);
            }
            this._superwrapper('_onBallDragFinished', arguments);

        },

        /**
        * handler acc on keyup
        * @method _handleAccOnKeyUp
        * @param {object} customEvent object 
        * @param {object} event object from canvas element
        * @param {number} keyCode of key
        * @param {object} currentCanvasItem item which has focus on canvas
        * @private
        */
        _handleAccOnKeyUp: function (customEvent, event, keyCode, currentCanvasItem) {

            var uniqueNames = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME,
                currentItemName = currentCanvasItem.uniquePaperObjectName,
                tabKey = 9,
                spaceKey = 32;




            if ((currentItemName === uniqueNames.START_BALL || currentItemName === uniqueNames.LAST_BALL
                || currentItemName === uniqueNames.MAT_BALL)) {

                this.tool.trigger('mouseup', event);

                this._drawView();

            }

        },

        /**
        * handler acc on keyup
        * @method _handleAccOnKeyUp
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item       
        
        * @private
        */
        _handleSpaceAndFocusOutOnObject: function _handleSpaceAndFocusOutOnObject(event, data) {
            var uniqueNames = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME,
                   currentItemName = data.item.uniquePaperObjectName;

            switch (currentItemName) {
                case uniqueNames.STICKY_SLIDER:
                case uniqueNames.STICKY_SLIDER_START:
                    this._deleteCurrentSliderAndUpdateFocus(event, data);
                    // this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.HIDE_TAKE_SHOT_BUTTON, false);
                    break;
                case uniqueNames.MAT_BALL:
                    this.tool.trigger('mouseup', event);
                    this._drawView();
                    break;

            }
        },
        /**
        * delete current slider on space or delete key 
        * @method _deleteCurrentSliderAndUpdateFocus
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item   
        
        * @private
        */
        _deleteCurrentSliderAndUpdateFocus: function (event, data) {
            //pending tast where to set focus when sticky slider is delted
            if (data && data.event) {

                event.shiftKey = data.event.shiftKey;
            }


            this.tool.trigger('mouseup', event);


        },

        reset: function reset() {
            this._superwrapper('reset');
            this._showHideFocusRect();

        },

        /**
        * Deletes {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball"}}{{/crossLink}}.
        * @method deleteBall    
        * @public
        */
        deleteBall: function (ballView, event, isResetDelete) {

            var currentBallIndex = this._getBallViewListIndex(ballView.cid),
                nextBallView = null;
            if (currentBallIndex < 0) {
                return;
            }
            var activePaperItems = null;

            this._superwrapper('deleteBall', arguments);

            if (event && event.shiftKey === true) {
                nextBallView = this.ballViewList[currentBallIndex - 1].view;
            }
            else {
                nextBallView = this.ballViewList[currentBallIndex].view;
            }

            activePaperItems = this._setActivePaperObjects();
            this._updatePaperItems(activePaperItems);

            if (isResetDelete !== false) {

                this.canvasAcc.setCurrentPaperItem(nextBallView, true);
                this._showHideFocusRect(nextBallView.ballFocusRect);
                this._setNewMessageOnDeleteBall(event, nextBallView);
            }


        },

        /**
        * delete current slider on space or delete key 
        * @method _setNewMessageOnDeleteBall
        * @param {object} event object from canvas element
        * @param {object} focusedBallView ball which is deleted
        
        * @private
        */
        _setNewMessageOnDeleteBall: function _setNewMessageOnDeleteBall(event, focusedBallView) {
            var uniqueNames = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME,
                currentItemName = focusedBallView.uniquePaperObjectName,
                data = {
                    item: focusedBallView
                };

            if (currentItemName === uniqueNames.MAT_BALL) {
                this._onTabOfMatBall(event, data);
            }
            else if (currentItemName === uniqueNames.LAST_BALL || currentItemName === uniqueNames.START_BALL) {
                this._onTabOfLastBall(event, data);
            }

            else if (currentItemName === uniqueNames.STICKY_SLIDER || currentItemName === uniqueNames.STICKY_SLIDER_START) {
                this._onTabOfSlider(event, data);

            }
        },

        /**
        * on canvas focus out handle focus rect and other things
        * @method _canvasFocusOut
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item   
        
        * @private
        */
        _canvasFocusOut: function _canvasFocusOut(event, data) {
            var activePaperObjects = this._setActivePaperObjects();

            this._showHideFocusRect();
            this._isAccUsed = false;
            this._drawView();
            // this._setActivePaperObjects();
            // this._updatePaperItems(activePaperObjects);
            //   this.canvasAcc.setCurrentPaperItem(this.ballViewList[0].view);
            this._resetCanvasAccHolderText();
            this.currentObject = null;

        },
        /**
        * reset canvas holder text on canvas focus out
        * @method _canvasFocusOut
      
        * @private
        */
        _resetCanvasAccHolderText: function () {

            var coureTitle = null,
                currentlevel = this.model.get('levelId'),
                keyCodeConstants = courseModel.KEYCODE,
                obastacleLength = null,
                strMessage = null;


            coureTitle = this.getAccMessage('carousel-view-slide-' + currentlevel + '-title', 0);

            strMessage = this.getMessage('canvas-acc-cont-text', 0, [coureTitle]);
            if (Math.abs(this.ballViewList.length - 2) > 0) {
                strMessage = strMessage + this.getMessage('canvas-acc-cont-text', 1);
            }
            obastacleLength = this.draggableObstaclesArray.length;
            if (obastacleLength > 0) {
                strMessage = strMessage + this.getMessage('canvas-acc-cont-text', 2, [obastacleLength]);
            }
            strMessage = strMessage + this.getMessage('canvas-acc-cont-text', 4);
            this.setAccMessage('canvas-holder-' + currentlevel + '-acc-container', strMessage);

        }
    })
})();