(function () {
    'use strict';

    var models = MathInteractives.Interactivities.MiniGolf.Models,
        modelClassName = models.Obstacle,
        miniGolfModel = models.MiniGolfData,
        obstacleName = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME.OBSTACLE;
    /**
    * CanvasWithObstacles holds the all the methods and properties regarding game area.
    * @class CanvasWithObstacles
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.CanvasWithObstaclesAcc = MathInteractives.Interactivities.MiniGolf.Views.CanvasWithObstacles.extend({

        draggableObstaclesArray: [],

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
            //this._setDraggableObstacles();

            //this._initAccessiblity();// will call base-canvas-acc function

        },
        _bindAccessibilityListeners: function _bindAccessibilityListeners() {

            this._superwrapper('_bindAccessibilityListeners', arguments);

            var self = this,
                canvasAccModel = MathInteractives.Common.Player.Models.CanvasAcc,
                keyEvents = canvasAccModel.CANVAS_KEY_EVENTS,
                canvasKeyupEvents = canvasAccModel.CANVAS_KEYUP_EVENTS,
                obstacles = this.obstacles,
                obstacleCount = obstacles.length,
                count = null,
                $canvasHolder = this.$('#' + this.idPrefix + 'canvas-holder-' + this.model.get('levelId') + '-acc-container');


            $canvasHolder.on(canvasKeyupEvents.DELETE_KEYUP, function (customEvents, event, keyCode, currentObject) {
                event.isAccessibility = true;
                self._handleDeleteOnObstacle(customEvents, event, keyCode, currentObject);
            });

            for (count = 0; count < obstacleCount; count++) {

                obstacles[count].on(miniGolfModel.EVENTS.STICKY_SLIDER_ATTACHED_TO_OBSTACLE, function () {

                    if (this.model.get('type') === 'default') {
                        self._updatePaperItemsOnStickySliderAttachment();
                    }
                })

            }
        },
        /**
        * bind canvas acc events
        * @method _bindAccessibilityListeners
        * @private
        */
        _updatePaperItemsOnStickySliderAttachment: function () {
            var activePaperObjects = this._setActivePaperObjects();

            this._updatePaperItems(activePaperObjects, true);
        },

        /**
        * returns active acc paper objects
        * @method _setActivePaperObjects
        * @private
        * @ return{object} active canvas items array
        */
        _setActivePaperObjects: function (keepCurrentFocus) {

            var ballViewArray = [],
                obstacleViewArray = [],
                activePaperObjects = [];

            ballViewArray = this._superwrapper('_setActivePaperObjects', arguments);
            obstacleViewArray = this._getActiveObstacles();

            return ballViewArray.concat(obstacleViewArray);



        },
        /**
        * returns active obstacle to add into the active paper object array
        * @method _getActiveObstacles
        * @private
        *
        */
        _getActiveObstacles: function () {
            var result = [],
                obstacles = this.obstacles,
                count = null,
                currentObstacle = null,
                currentObstacleModel = null,
             //   obstacleName = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME.OBSTACLE,
                obstaclesLength = obstacles.length;


            for (count = 0; count < obstaclesLength; count++) {
                currentObstacle = obstacles[count];
                currentObstacleModel = currentObstacle.model;
                if (currentObstacleModel.get('type') === 'default' && currentObstacleModel.get('numberOfBallsAttached') <= 0) {
                    currentObstacle.uniquePaperObjectName = obstacleName;
                    result.push(currentObstacle)
                }

            }

            this.draggableObstaclesArray = result.slice();
            return result;

        },

        /**
        * arrow key handler for canvas elements
        * @method _handleDraggingOnKeyDown
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _handleDraggingOnKeyDown: function _handleDraggingOnKeyDown(event, data) {

            this._superwrapper('_handleDraggingOnKeyDown', arguments);
            this._handleAccForObstacle(event, data);

        },
        /**
        * bind canvas acc events
        * @method _handleTabOnPaperItem
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _handleTabOnPaperItem: function _handleTabOnPaperItem(event, data) {

            this._superwrapper('_handleTabOnPaperItem', arguments);
            this._handleTabOnObstacle(event, data);
        },
        /**
        * tab handler for obstacles
        * @method _handleTabOnObstacle
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _handleTabOnObstacle: function (event, data) {


            var uniqueNames = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME,
                currentItemView = data.item,


                currentItemName = currentItemView.uniquePaperObjectName,
                ballView = null,
                rotationHandleView = null,
                currentHandle = null;



            if (currentItemName === obstacleName) {
                // obstacleNumber = currentItemView.model;


                event.point = currentItemView.obstacleOnPaper.getPosition();
                currentItemView.onObstacleMouseDown(event);
                this._showHideObsRotationHandles(currentItemView);

                var activePaperObejcts = this._setActivePaperObjects();
                this._updatePaperItems(activePaperObejcts, true);

                this._showHideFocusRect(currentItemView.obstacleFocusRect);
                data.isTabEvent = true;
                this._setObstacleAccMessage(currentItemView, data);
                this._drawView();


            }

        },
        /**
        * set obstacle messages
        * @method _setObstacleAccMessage
        * @param {object} currentObstacleView object to check conditions
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _setObstacleAccMessage: function _setObstacleAccMessage(currentObstacleView, data) {

            var strMessage = null,
                canvasTextElementId = 'obstacle-text',
                model = this.model,
                obstacleModel = currentObstacleView.model,
                isObstacleDropped = obstacleModel.get('isObstacleDropped'),
                setAccMessageObject = {
                    elementId: 'canvas-holder-' + model.get('levelId') + '-acc-container',

                },
               currentObstacleNumber = obstacleModel.get('obstacleNumber');

            if (this.model.get('levelId') === 3) {
                currentObstacleNumber = currentObstacleNumber - 3;
            }

            if (data.isTabEvent || data.isObstacleMoved) {// when obstacle is moved
                strMessage = this.getMessage(canvasTextElementId, 5, [currentObstacleNumber]);
            }
            else if (data.isPlacedEvent === true) {// when space and is on correct path in course boundry
                strMessage = this.getMessage(canvasTextElementId, 3, [currentObstacleNumber]);
            }
            else if (data.isDeleteEvent === true) {// obstacle is deleted

                strMessage = this.getMessage(canvasTextElementId, 4);
            }
            else if (data.isReverted === true) {

                strMessage = this.getMessage(canvasTextElementId, 2);
            }
            if (!data.isPlacedEvent) {
                if (!currentObstacleView.isInDispenser() && isObstacleDropped === true) {// for delete case to check if obstacle is placed 
                    strMessage = strMessage + this.getMessage(canvasTextElementId, 7);
                }
                strMessage = strMessage + this.getMessage(canvasTextElementId, 0);


                if (!currentObstacleView.isInDispenser() && isObstacleDropped === true) {// for delete case to check if obstacle is placed 
                    strMessage = strMessage + this.getMessage(canvasTextElementId, 1);
                }
                if (currentObstacleNumber < this.obstacles.length - 2 && !data.isObstacleMoved) {// for tab to the next obstacle
                    strMessage = strMessage + this.getMessage(canvasTextElementId, 6);
                }
            }


            setAccMessageObject.strMessage = strMessage;

            this.canvasAccModel.set({ 'setAccMessageObject': null }, { silent: true });
            this.canvasAccModel.set('setAccMessageObject', setAccMessageObject);

        },

        /**
        * show hide rotation handles for given obstacle
        * @method _showHideObsRotationHandles
        * @param {object} currentItemView object to which has focus
        * @param {boolean} isFocusOutEvent to check if to hide or show handles
        * @private
        */
        _showHideObsRotationHandles: function _showHideObsRotationHandles(currentItemView, isFocusOutEvent) {

            if (!isFocusOutEvent && !currentItemView.isInDispenser() && currentItemView.model.get('numberOfBallsAttached') <= 0 &&
              currentItemView.model.get('isObstacleDropped')) {

                currentItemView.showHideRotationDragHandle(true);
            }
            else {

                currentItemView.showHideRotationDragHandle(false);
            }
        },

        /**
        * handler for obstacle acc on keydown
        * @method _handleAccForObstacle
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _handleAccForObstacle: function _handleAccForObstacle(event, data) {

            var rotationAngle = modelClassName.ACC_ROTATION_ANGLE,
                currentItemView = data.item,
                currentItemModel = currentItemView.model,
                currentItemName = currentItemView.uniquePaperObjectName,
                eventType = event.type,
                obstaclePosition = null,
                obsMinDragDistance = modelClassName.DRAG_DISTANCE_ACC,
                canvasAccModel = MathInteractives.Common.Player.Models.CanvasAcc,


                keyEvents = canvasAccModel.CANVAS_KEY_EVENTS;

            if (eventType === keyEvents.ARROW) {

                if (currentItemName === obstacleName) {
                    //   this._handleTabOnObstacle(event, data);
                    currentItemView.name = 'obstacle';
                    this.currentObject = currentItemView;

                    if (!event.point) {

                        obstaclePosition = currentItemView.obstacleOnPaper.getPosition();


                        obstaclePosition = {
                            x: obstaclePosition.x + data.directionX * obsMinDragDistance,
                            y: obstaclePosition.y + data.directionY * obsMinDragDistance
                        }
                        event.point = obstaclePosition;
                    }
                    currentItemView.onObstacleMouseDrag(event);
                    this._showHideObsRotationHandles(currentItemView);
                    data.isObstacleMoved = true;
                    this._setObstacleAccMessage(currentItemView, data);
                }

            }
            else {
                if (eventType === keyEvents.ROTATE_ANTI_CLOCKWISE || eventType === keyEvents.ROTATE_CLOCKWISE) {

                    if (currentItemName === obstacleName && !currentItemView.isInDispenser() === true &&
                        currentItemModel.get('numberOfBallsAttached') <= 0 && currentItemModel.get('isObstacleDropped') === true) {

                        this.currentObject = currentItemView;

                        currentItemView.onRotationHandle2MouseDown(event);

                        if (eventType === keyEvents.ROTATE_ANTI_CLOCKWISE) {
                            currentItemView.rotate(-rotationAngle);
                        }
                        else {
                            currentItemView.rotate(rotationAngle);
                        }


                    }

                }
            }
        },

        /**
        * handler for obstacle space and focus out event
        * @method _handleSpaceAndFocusOutOnObject
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @param {boolean} isFocusOutEvent to check if its a space or focus out event
        * @private
        */
        _handleSpaceAndFocusOutOnObject: function _handleSpaceAndFocusOutOnObject(event, data, isFocusOutEvent) {

            this._superwrapper('_handleSpaceAndFocusOutOnObject', arguments);
            var currentCanvasItem = data.item,
               currentItemName = currentCanvasItem.uniquePaperObjectName;


            if (currentItemName === obstacleName) {

                event.point = currentCanvasItem.obstacleOnPaper.getPosition();
                this.tool.trigger('mouseup', event);
                this._showHideObsRotationHandles(currentCanvasItem, isFocusOutEvent);

                //data.isReverted = true;
                //this._setObstacleAccMessage(currentCanvasItem, data);
            }

        },

        /**
        * handler for delete obstacle
        * @method _handleDeleteOnObstacle
        * @param {object} customEvents object from jquery
        * @param {object} event from canvas acc 
        * @param {number} keyCode to check keycode of key
        * @param {object} currentObject current obstacle view
        
        * @private
        */
        _handleDeleteOnObstacle: function _handleDeleteOnObstacle(customEvents, event, keyCode, currentObject) {
            var data = {};
            if (currentObject.uniquePaperObjectName === obstacleName) {

                if (!currentObject.isInDispenser() && currentObject.model.get('isObstacleDropped') === true) {
                    currentObject.revertToInitialPosition();
                    this._drawView();
                    data.isDeleteEvent = true;
                    this._setObstacleAccMessage(currentObject, data);
                }
            }
        },
        /**
        * place obstacle at some given position
        * @method placeObstacle
        
        * @param {object} obstacleViewObj current obstacle view
        
        * @private
        */
        placeObstacle: function placeObstacle(obstacleViewObj) {
            var data = {
                isPlacedEvent: true
            };
            this._superwrapper('placeObstacle', arguments);
            obstacleViewObj.showHideRotationDragHandle(true);
            if (obstacleViewObj.model.get('obstacleNumber') < this.draggableObstaclesArray.length) {
                this._setObstacleAccMessage(obstacleViewObj, data);
            }

        },
        /**
        * revert obstacle at last correct position
        * @method revertToLastPosition
        
        * @param {object} obstacleViewObj current obstacle view
        
        * @private
        */
        revertToLastPosition: function (obstacleViewObj) {
            var data = {
                isReverted: true
            };
            this._superwrapper('revertToLastPosition', arguments);

            this._setObstacleAccMessage(obstacleViewObj, data);

        },
        _createSliderOnObstacleBallDrop: function _createSliderOnObstacleBallDrop(ballView, event) {

            this._superwrapper('_createSliderOnObstacleBallDrop', arguments);
            var sliderToFocus = this.ballViewList[this.ballViewList.length - 2].view;
            this.canvasAcc.setCurrentPaperItem(sliderToFocus, true);// generated slider

            this._showHideFocusRect(sliderToFocus.stickySliderFocusRect);

        },
        /**
        * on canvas focus out handle focus rect and other things
        * @method _canvasFocusOut
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item 
        
        * @private
        */
        _canvasFocusOut: function _canvasFocusOut(event, data) {
            var isFocusOutEvent = true;
            this._handleSpaceAndFocusOutOnObject(event, data, isFocusOutEvent);
            this._superwrapper('_canvasFocusOut', arguments);
        }

    })
})();