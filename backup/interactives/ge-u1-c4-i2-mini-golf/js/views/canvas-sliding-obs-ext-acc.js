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
        miniGolfModel = miniGolfModels.MiniGolfData,
        bridgeName = miniGolfModel.PAPER_OBJECT_UNIQUE_NAME.BRIDGE;

    MathInteractives.Interactivities.MiniGolf.Views.CanvasSlidingObsExtAcc = MathInteractives.Interactivities.MiniGolf.Views.CanvasSlidingObsExt.extend({

        /**
        * attach events on bridge and model
        *
        * @method _bindEvents      
        
        * @private
        **/
        _bindEvents: function _bindEvents() {
            this._superwrapper('_bindEvents', arguments);
            var model = this.model,
                activePaperObjects = null,
                setFocusRect = false,
                ballViewList = this.ballViewList,
                self = this;

            model.on('change:isBridgeDraggable', function (modelRef, currentValue) {

                if (currentValue === true) {
                    setFocusRect = false;
                }
                else if (currentValue === false && self.canvasAcc.getCurrentPaperItem().uniquePaperObjectName === bridgeName) {
                    self.bridgeGroup.sendToBack();
                    setFocusRect = true;
                }

                activePaperObjects = self._setActivePaperObjects(true);
                self._updatePaperItems(activePaperObjects, true);

                if (setFocusRect) {
                    self._showHideFocusRect(ballViewList[ballViewList.length - 1].ballFocusRect);
                }
            })


        },
        /**
        * handler for last ball dragging on arrow keys 
        * @method _handleLastBallDrag
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _handleLastBallDrag: function (event, data) {
            this._superwrapper('_handleLastBallDrag', arguments);
            if (this.model.get('isBridgeDraggable') === false) {
                this.bridgeGroup.sendToBack();
            }

        },

        /**
        * returns active acc paper objects
        * @method _setActivePaperObjects
        * @private
        * @return {object} active canvas items array
        */
        _setActivePaperObjects: function () {
            var bridgeGroup = this.bridgeGroup,
                activePaperObjects = [];

            activePaperObjects = this._superwrapper('_setActivePaperObjects', arguments);

            if (this.model.get('isBridgeDraggable')) {
                bridgeGroup.uniquePaperObjectName = bridgeName;
                activePaperObjects.push(bridgeGroup);
            }

            return activePaperObjects

        },
        /**
        * tab handler for canvas elements 
        * @method _handleTabOnPaperItem
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _handleTabOnPaperItem: function _handleTabOnPaperItem(event, data) {

            this._superwrapper('_handleTabOnPaperItem', arguments);
            this._handleTabOnBridge(event, data);
        },
        /**
        * tab handler bridge
        * @method _handleTabOnBridge
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _handleTabOnBridge: function _handleTabOnBridge(event, data) {

            var currentItem = data.item,
                setAccMessageObject = null;

            if (currentItem.uniquePaperObjectName === bridgeName) {
                event.point = this.obstacles[2].obstacleOnPaper.getPosition();
                this.obstacles[2].onObstacleMouseDown(event);
                if (this.model.get('isBridgeDraggable') === false) {
                    this.canvasAcc.canvasFocusOut();

                    this._showHideFocusRect();
                    this.setFocus('reset-course-btn-3', 10);

                }
                else {
                    setAccMessageObject = {
                        elementId: 'canvas-holder-' + this.model.get('levelId') + '-acc-container',
                        strMessage: this.getMessage('bridge-text', 0)
                    }
                    this.canvasAccModel.set('setAccMessageObject', setAccMessageObject);

                    this._showHideFocusRect(this.bridgeFocusRect);
                    //this._handleMouseDownOnDataAreaGroup(event);
                }
                this._drawView();
            }
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
            this._handleAccForBridge(event, data);

        },
        /**
        * handle draggig on bridge
        * @method _handleAccForBridge
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item
        * @private
        */
        _handleAccForBridge: function _handleAccForBridge(event, data) {
            var currentItem = data.item,
                model = this.model,
                customEventPoint = null,
                directionX = null,
                directionY = null,
                bridgeGroupPosition = null;

            
            if (currentItem.uniquePaperObjectName === bridgeName && this.model.get('isBridgeDraggable') === true) {
                this.currentObject = this.obstacles[2];
                bridgeGroupPosition = this.bridgeGroup.getPosition();

                customEventPoint = {
                    x: bridgeGroupPosition.x + data.directionX * 2,
                    y: bridgeGroupPosition.y
                }
                model.set('eventDelta', {
                    x: data.directionX * 2,
                    y: data.directionY
                });
                model.set('eventPoint', customEventPoint);
            }

        },
        /**
        * handler acc on keyup
        * @method _handleAccOnKeyUp
        * @param {object} event object from canvas element
        * @param {object} data from canvas acc related to current canvas item       
        
        * @private
        */
        _handleSpaceAndFocusOutOnObject: function _handleSpaceAndFocusOutOnObject(event, data, isFocusOutEvent) {

            var ballCountbefore = this.ballViewList.length;
            this._superwrapper('_handleSpaceAndFocusOutOnObject', arguments);
            var currentCanvasItem = data.item,
                canvasAcc = null,
                ballViewList = this.ballViewList,
                beforeMouseupBallCount = ballViewList.length,
                afterMouseupBallCount = null,
                nextBallView = null,
                currentItemName = currentCanvasItem.uniquePaperObjectName;
            
            if (currentItemName === bridgeName) {
                canvasAcc = this.canvasAcc;
                
                event.point = this.bridgeGroup.getPosition();
                this.tool.trigger('mouseup', event);
                if (!isFocusOutEvent && !this.model.get('isBridgeDraggable')) {
                    afterMouseupBallCount = ballViewList.length;

                    canvasAcc.updatePaperItems(this._setActivePaperObjects());

                    if (afterMouseupBallCount > beforeMouseupBallCount) {// new ball is created
                        nextBallView = ballViewList[afterMouseupBallCount - 2].view;
                        canvasAcc.setCurrentPaperItem(nextBallView, true);
                        this._showHideFocusRect(nextBallView.stickySliderFocusRect);
                    }
                    else {// no ball is create but bridge is disabled
                        nextBallView = ballViewList[afterMouseupBallCount - 1].view;
                        canvasAcc.setCurrentPaperItem(nextBallView, true);
                        this._showHideFocusRect(nextBallView.ballFocusRect);

                    }

                }

                this._drawView();
            }

        },
        /**
        * reset canvas holder text on canvas focus out
        * @method _canvasFocusOut
        
        * @private
        */
        _resetCanvasAccHolderText: function _onCanvasAccKeyup(event) {

            var coureTitle = null,
                keyCodeConstants = courseModelClassName.KEYCODE,

                obastacleLength = null,
                strMessage = null;



            //if (event.keyCode === keyCodeConstants.TAB) {
            coureTitle = this.getMessage('carousel-view-slide-3-title', 0)
            strMessage = this.getMessage('canvas-acc-cont-text', 0, [coureTitle]);
            if (Math.abs(this.ballViewList.length - 2) > 0) {
                strMessage = strMessage + this.getMessage('canvas-acc-cont-text', 1);
            }
            obastacleLength = this.obstacles.length;

            if (obastacleLength > 0) {
                strMessage = strMessage + this.getMessage('canvas-acc-cont-text', 2, [3]);
            }
            strMessage = strMessage + this.getMessage('canvas-acc-cont-text', 3);
            this.setAccMessage('canvas-holder-3-acc-container', strMessage);
            //  }

        }


    });
})();