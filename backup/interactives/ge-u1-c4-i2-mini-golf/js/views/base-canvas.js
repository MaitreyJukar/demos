(function () {
    'use strict';
    var miniGolfModel = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData;
    /**
    * BaseCanvas holds the all the methods and properties regarding game area.
    * @class BaseCanvas
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Paperscope of the active canvas.
        * @property paperScope
        * @default null
        * @public 
        */
        paperScope: null,


        /**
        * Paperscope of the passive canvas which will be not taking any events.
        * @property paperScope2
        * @default null
        * @public 
        */
        paperScope2: null,

        /**
        * Holds the view of the rotation handle
        * @property rotationHandleView
        * @default null
        * @public 
        */
        rotationHandleView: null,

        /**
        * Holds the view root ball which is initialized by loading rasters.
        * @property rootBall
        * @default null
        * @type Object 
        */
        rootBall: null,

        /**
        * Drag Ball view is the ball that is attached with the {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/matBallView:property"}}{{/crossLink}} .
        * This view is passed as an argument when {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle"}}{{/crossLink}} class is initialized. 
        * @property startBallView
        * @default null
        * @type Object
        */
        startBallView: null,

        /**
        * matBallView is the ball which is placed between rotation handles.
        * This view is passed as an argument when this class is initialized.
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/startBallView:property"}}{{/crossLink}} .
        * @property matBallView
        * @default null
        * @type Object
        */
        matBallView: null,

        /**
        * Holds the paper.js path item denoting the course boundary.
        *
        * @property courseBounds
        * @type Object
        * @default null
        */
        courseBounds: null,

        /**
        * Holds the paper.js path item denoting the mat boundary.
        *
        * @property matBounds
        * @type Object
        * @default null
        */
        matBounds: null,

        /**
        * Array of paper.js paths representing the obstacles on the canvas.
        *
        * @property obstacles
        * @type Object
        * @default null
        */
        obstacles: [],

        /**
        * Holds the list of all  {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball"}}BallViews{{/crossLink}}.
        *
        * @property ballViewList
        * @type Object
        * @default null
        */
        ballViewList: null,

        /**
        * Holds the Tool object of {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/paperScope:property"}}paperScope{{/crossLink}}.
        * On which mouseUp event is bound to detect mouseUp event though the cursor is not on that peperObject.
        *
        * @property tool
        * @type Object
        * @default null
        */
        tool: null,

        /**
        * Holds the paperObject of the hole which is compound path. This is the green tolerance region.
        * If any {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/ball:property"}}{{/crossLink}} or 
             {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/connectorLine:property"}}{{/crossLink}} is passing through hole,
             {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_retractball:method"}}{{/crossLink}} will retract the ball.
        * Initial opacity is set to 0.
        *
        * <b>See also</b> {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_isLastBallThroughHole:property"}}{{/crossLink}},
           {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_isLastBallThroughHole:property"}}{{/crossLink}},
           {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_isLineThroughHole:property"}}{{/crossLink}}
        * @property hole
        * @type Object
        * @default null
        */
        hole: null,

        /**
        * Holds the paperObject of the arrow , which is actually Group consisting arrow head and line.
        *
        * * <b>See also</b> {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/trivializeIncorrectPath:method"}}{{/crossLink}},
           {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/highLightIncorrectPath:method"}}{{/crossLink}},
        * @property arrow
        * @type Object
        * @default null
        */
        arrow: null,


        /**
        * Initializer function of view.
        * @method initialize
        * @constructor
        */
        initialize: function () {
            this.ballViewList = [];
            this.initializeDefaultProperties();
            this._setUpCanvas();
            this._attachToolEvents();
            this.render();

            this._snapBoundary = {
                path: this.courseBounds,
                isObstacle: false
            }

        },

        /**
        * Clears active any passive canvases on
         {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/paperScope:property"}}{{/crossLink}},
         {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/paperScope2:property"}}{{/crossLink}}.
        * @method initialize
        * @constructor
        */
        clearCanvas: function () {
            this.paperScope.project.activeLayer.removeChildren();
            this.paperScope2.project.activeLayer.removeChildren();
        },


        /**
        * Loads the save state if ball counts are greater than 2 in model. Basically this method sets the position of the balls
          as same as in the save state and then triggers mosueUp event to simulate actual interaction.
          This is to avoid manually attaching events to objects.
          
          This function takes care of Help Elements visibility , incorrect path highlighiting and take shot button visibility.
        * <b> See also </b> {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/highLightIncorrectPath:method"}}{{/crossLink}},
        {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/enableDisableObstacleDispenserHelpElements:method"}}{{/crossLink}}.
        * @method _loadSaveState
        * @constructor
        * @private
        */
        _loadSaveState: function () {
            var self = this,
                model = self.model,
                originalBalls = model.get('balls'),
                currentball,
                invalidPathIndex = model.get('invalidPathIndex'),
                prevBallView,
                event = {},
                resetButtonState;


            if (this.model.get('toResetCourse') === false) {
                this.reset();
                this.model.set('toResetCourse', true);
                this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.ENABLE_RESET, false);
                this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.READY);
                return;
            }
            if (this._isNullOrUndefined(originalBalls) || originalBalls.length < 3) {
                this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.READY);
                return;
            }
            var balls = originalBalls.splice(0, originalBalls.length - 2);
            this.rotationHandleView.setRotationHandlePosition(balls[0].get('position'));
            event.point = balls[1].get('position');
            resetButtonState = model.get('resetCourseButton');
            if (this.ballViewList[0].view.connectorLine) {
                this.ballViewList[0].view.connectorLine.bringToFront();
            }
            this._onStartBallDrag(event);
            // set stickySliderAngle to null and use rest of the stored model properties for start ball's save-state.
            balls[1].attributes.stickySliderAngle = null;
            this.ballViewList[this.ballViewList.length - 1].view.ballModel.set(balls[1].attributes);

            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.ENABLE_RESET, resetButtonState);

            for (var i = 2; i < balls.length; i++) {
                currentball = balls[i];
                prevBallView = this._getBallViewAtListIndex(i - 1).view;
                event.point = prevBallView.getBallPosition();

                event['saveResume'] = true; // checked in extended class 'canvas-with-obstacles'

                this._onBallDragFinished(prevBallView, event);
                this.ballViewList[this.ballViewList.length - 1].view.setBallPosition(balls[i].get('position'));
                // set stickySliderAngle to null and use rest of the stored model properties for ball's save-state.
                currentball.attributes.stickySliderAngle = null;
                this.ballViewList[this.ballViewList.length - 1].view.ballModel.set(currentball.attributes);
            }
            // To highlight the hole in case , last ball line is passing through hole.
            var status = this._isLastBallThroughHole();
            if (!this._isNullOrUndefined(invalidPathIndex)) {
                // Highlight incorrect path 
                this.highLightIncorrectPath(invalidPathIndex);
            }
            else {
                this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.HOLE_ENCOUNTERED, status !== -1);
            }
            self.rotationHandleView._resetCursor();
            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.READY);
            if (this.enableDisableObstacleDispenserHelpElements) {
                this.enableDisableObstacleDispenserHelpElements();
            }
            this.hideHole(true);
            this.currentObject = null;


        },

        /**
        * Creates the scope object for the course scope.
        * @method _setUpCanvas
        * @private
        */
        _setUpCanvas: function () {
            var newScope1 = new paper.PaperScope(),
                newScope2 = new paper.PaperScope(),
                ballView,
                ballNames = MathInteractives.Interactivities.MiniGolf.Views.Ball.NAMES,
                self = this;
            newScope1.setup(this.idPrefix + this.options.canvasId);
            newScope2.setup(this.idPrefix + this.options.canvasId + '-2');
            this.paperScope2 = newScope2;
            this.paperScope = newScope1;
            this.paperScope.activate();
            this.clearCanvas();
        },





        /**
        * Attaches event on {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/tool:property"}}{{/crossLink}}.
          This method handles the issue of reflecting ball on same angle at corners.
        * @method _attachToolEvents
        * @constructor
        * @private
        */
        _attachToolEvents: function () {
            var newScope1 = this.paperScope,
               newScope2 = this.paperScope2,
               ballView,
               ballNames = MathInteractives.Interactivities.MiniGolf.Views.Ball.NAMES,
               self = this;
            this.tool = new newScope1.Tool();

            this.tool.onMouseDrag = function (event) {
                event.event.preventDefault();
            }
            this.tool.onMouseUp = function (event) {
                self.rotationHandleView._resetCursor();
                var currentTarget = self.currentObject;
                if (self._isNullOrUndefined(currentTarget)) {
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
                            if (nextBallView.stickySliderRaster) {
                                self.sendPaperItemToBack(nextBallView.stickySliderRaster.parent);
                            }
                            self._stickySliderDragFinished(nextBallView, event);
                        }
                        if (previousBall && previousBallView.getBallSnap()) {
                            event.point = previousBallView.stickySliderRaster.position;
                            self._stickySliderDragFinished(previousBallView, event);
                            if (previousBallView.stickySliderRaster) {
                                self.sendPaperItemToBack(previousBallView.stickySliderRaster.parent);
                            }
                        }
                        if (ballView.view.stickySliderRaster) {
                            ballView.view.stickySliderRaster.parent.bringToFront();
                        }
                        if (nextBallView) {
                            if (nextBallView.arcWithNextBall) {
                                self.sendPaperItemToBack(nextBallView.arcWithNextBall);
                            }
                            if (nextBallView.arcWithPrevBall) {
                                self.sendPaperItemToBack(nextBallView.arcWithPrevBall);
                            }
                        }
                        ballView.arcWithNextBall && self.sendPaperItemToBack(ballView.arcWithNextBall);
                        ballView.arcWithPrevBall && self.sendPaperItemToBack(ballView.arcWithPrevBall);
                        if (previousBallView) {
                            if (previousBallView.arcWithNextBall) {
                                self.sendPaperItemToBack(previousBallView.arcWithNextBall);
                            }
                            if (previousBallView.arcWithPrevBall) {
                                self.sendPaperItemToBack(previousBallView.arcWithPrevBall);
                            }
                        }
                        var status = self._isLastBallThroughHole();
                        if (status !== -1) {
                            self._holeEncountered(status);
                            self.hideHole(true);
                        }
                        break;
                    case ballNames.ROTATION_HANDLE:
                        self.rotationHandleView.onRotationHandleRotate(event);
                        self.rotationHandleView._resetCursor();
                        break;
                }
                if (self.arrow) {
                    self.arrow.removeChildren();
                }
                if (event && event.getItem && event.getItem() && event.getItem().name === miniGolfModel.DRAGGABLE) {
                    self.rotationHandleView._openHandCursor(event);
                }
                else {

                    self.rotationHandleView._resetCursor();
                }

                self.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.TOOL_UP_EVENT);
                self.model.set('invalidPathIndex', null);
                setTimeout(function () {
                    self.paperScope.view.draw();
                    self.paperScope2.view.draw();
                }, 1);
            }
        },

        /**
        * Called after call to _onBallDragFinished in mouse up handler of paper.js tool for ball.
        * The method calls the drag finish handler for the current ball's next ball's sticky slider.
        *
        * @method _onBallMouseUp
        * @param event {Object} The mouse up event object.
        * @param currentTargetCid {String} The 'cid' of the current ball dragged.
        */
        _onBallMouseUp: function _onBallMouseUp(event, currentTargetCid) {
            var currentIndex = this._getBallViewListIndex(currentTargetCid),
               nextIndex = currentIndex === -1 ? currentIndex : currentIndex + 1,
               nextBall = this._getBallViewAtListIndex(nextIndex),
               nextBallView = nextBall ? nextBall.view : null;
            if (nextBallView && nextBallView.getBallSnap() && nextIndex === 1) {
                event.point = nextBallView.stickySliderRaster.position;
                this._stickySliderDragFinished(nextBallView, event);
            }
            this._bringBallBack();
        },

        /**
        * Renders canvas view.
        * Canvas contains rasters and rasters are loaded using bse64 URLs .
        * Loading rasters is a time consuming operation and hence the whole process of rendering required to be 
          executed in sequence .
        * Rendering occurs in following sequence :
           [1].{{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/renderBoundry:method"}}{{/crossLink}}
           [2].Initially one time loading of {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/ball:property"}}{{/crossLink}} is done.
               On receieving {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/RASTERS_LOADED:event"}}{{/crossLink}} ,
               {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_onRastersLoaded:method"}}{{/crossLink}} is called.
           [3].{{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_onRastersLoaded:method"}}{{/crossLink}} subsequently calls
               methods for rendering hole ( because it requires the ball radius ) and 
               {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_renderRotationHandle:method"}}{{/crossLink}} are called.
        * Finally on completing rendering task {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/READY:event"}}{{/crossLink}} is triggered
          to resume callers task.
        * On completion of rendering {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_loadSaveState:metho"}}{{/crossLink}} is called.
        * @method render
        * @public 
        **/
        render: function () {
            this.renderBoundry();
            this._renderStartBall();
            this.arrow = new this.paperScope.Group();
        },

        /**
        * Renders the green {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/hole:property"}}{{/crossLink}}.
        *
        * @method _renderHole
        * @private 
        **/
        _renderHole: function () {
            var paperScope = this.paperScope,
                holeRadius = Number(this.model.get('holeRadius')), // R
                ballRadius = this.rootBall.ballInnerRaster.bounds.width / 2, // r
                initialOpacity = 0.4,
                holePosition = this.model.get('holePosition');
            paperScope.activate();
            this.hole = new paperScope.CompoundPath({
                children: [
                    new paperScope.Path.Circle({
                        center: new paperScope.Point(holePosition),
                        radius: holeRadius + ballRadius / 2 // Green concentric circle radius = R + r / 2
                    })
                    ,
                    new paperScope.Path.Circle({
                        center: new paperScope.Point(holePosition),
                        radius: holeRadius
                    })
                ],
                fillColor: 'green',
                opacity: initialOpacity
            });
            this.hideHole(true);
        },

        /**
        * Renders the boundry of the working area.
        *
        * @method renderBoundry
        * @public 
        **/
        renderBoundry: function () {
            this.courseBounds = this._getPathFromStoredPointsArray(this.model.get('courseBoundaries'));
            this.matBounds = this._getPathFromStoredPointsArray(this.model.get('matBoundaries'));

            var miniGolfModel = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData;
            this.actualCourseBounds = this._getPathFromStoredPointsArray(miniGolfModel.PHYSICAL_BOUNDRIES['COURSE_' + this.model.get('levelId')]);
            this.actualMatBounds = this._getPathFromStoredPointsArray(miniGolfModel.PHYSICAL_MAT_BOUNDRIES['COURSE_' + this.model.get('levelId')]);
        },

        /**
        * Creates a path from given array of points using the last point as the offset for the path.
        *
        * @method _getPathFromStoredPointsArray
        * @param points {Object} An array of points with the last element storing the offset for the whole path.
        * @private
        */
        _getPathFromStoredPointsArray: function _getPathFromStoredPointsArray(points) {
            var path, index, paperScope, numberOfPoints;
            paperScope = this.paperScope;
            path = new paperScope.Path();
            numberOfPoints = points.length;
            for (index = 0; index < numberOfPoints; index++) {
                path.add(new paperScope.Point(points[index]));
            }
            path.closed = true;
            path.selected = false;
            return path;
        },

        /**
        * Renders the rotation handle. This function is called only after recieving 
          {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/RASTERS_LOADED:event"}}{{/crossLink}}.
        *
        * @method _renderRotationHandle    
        * @private
        */
        _renderRotationHandle: function () {
            this.rotationHandleView = new MathInteractives.Interactivities.MiniGolf.Views.RotationHandle({
                paperScope: this.paperScope,
                model: this.model,
                dragBallView: this.startBallView,
                matBallView: this.matBallView,
                courseBounds: this.courseBounds
            });
            var rotationHandleClassEvents = MathInteractives.Interactivities.MiniGolf.Views.RotationHandle.EVENTS;
            this.rotationHandleView.on(rotationHandleClassEvents.ROTATION_HANDLE_ROTATED, $.proxy(this._rotationHandleRotating, this, this.matBallView.cid))
            .on(rotationHandleClassEvents.ROTATION_HANDLE_ROTATION_ENDED, $.proxy(this._rotationHandleRotated, this, this.matBallView.cid))
            .on(rotationHandleClassEvents.ROTATION_HANDLE_SELECTED, $.proxy(this._rotationHandleSelected, this))
            .on(rotationHandleClassEvents.ROTATION_HANDLE_RENDERED, $.proxy(this._loadSaveState, this));
            this._bindEventOnHandleBalls();
            this.rootBall.setBallPosition(new this.paperScope.Point(-200, -200));
            this.rootBall.rectangleCover.position = this.rootBall.getBallPosition();
            var self = this;
        },

        /**
        * One time loading of rasters from the base64 URLs provided.
        * Once the {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/rootBall:property"}}{{/crossLink}} is created,
          the same object is used to create another balls . 
          This strategy prevents multiple reading of URLs and hence saves from the sluggishness issues.
        *  
        * <b> See also </b> {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball"}}Ball{{/crossLink}}.
        * @method _renderStartBall    
        * @private
        */
        _renderStartBall: function () {
            var ballModel = new MathInteractives.Interactivities.MiniGolf.Models.Ball();
            this.rootBall = new MathInteractives.Interactivities.MiniGolf.Views.Ball({
                paperScope: this.paperScope,
                model: this.model,
                ballModel: ballModel
            });
            this.rootBall.on(MathInteractives.Interactivities.MiniGolf.Views.Ball.EVENTS.RASTERS_LOADED, $.proxy(this._onRastersLoaded, this));
        },

        /**
        * Once the {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/RASTERS_LOADED:event"}}{{/crossLink}} is recieved
          {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_renderMatBall:method"}}{{/crossLink}} ,
          {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_renderRotationHandle:method"}}{{/crossLink}} and
          {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_renderHole:method"}}{{/crossLink}}.
        * @method _onRastersLoaded    
        * @private
        */
        _onRastersLoaded: function () {
            this._renderMatBall();
            this._renderRotationHandle();
            this._renderHole();
        },

        /**
        * Renders the balls {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/matBallView:property"}}{{/crossLink}} and
          {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/startBallView:property"}}{{/crossLink}}.
        * @method _renderMatBall    
        * @private
        */
        _renderMatBall: function () {
            this.matBallView = this._createNewBall();
            this.startBallView = this._createNewBall();
            this.matBallView.rectangleCover.opacity = 0;
            this.startBallView.rectangleCover.opacity = 0;
        },

        /**
        * Binds event on ball {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/matBallView:property"}}{{/crossLink}} and
          {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/startBallView:property"}}{{/crossLink}}.
        * @method _bindEventOnHandleBalls    
        * @private
        */
        _bindEventOnHandleBalls: function () {
            var ballEvents = MathInteractives.Interactivities.MiniGolf.Views.Ball.EVENTS;

            this.startBallView.off(ballEvents.BALL_DRAGGED).on(ballEvents.BALL_DRAGGED, $.proxy(this._onStartBallDrag, this));
            this.startBallView.on(ballEvents.STICKYSLIDER_DRAGGED, $.proxy(this.rotationHandleView._startBallStickySliderDragged, this.rotationHandleView));

            this.matBallView.off(ballEvents.BALL_DRAGGED).on(ballEvents.BALL_DRAGGED, $.proxy(this._onMatBallDrag, this));
            this.matBallView.off(ballEvents.BALL_DRAGGING_FINISHED);
            this.matBallView.off(ballEvents.STICKYSLIDER_DRAGGED);
            this.matBallView.off(ballEvents.STICKYSLIDER_DRAGGING_FINISHED);
        },

        /**
        * Creates new {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball"}}{{/crossLink}}.
        * @method _createNewBall    
        * @private
        */
        _createNewBall: function () {
            var ballViewClass = MathInteractives.Interactivities.MiniGolf.Views.Ball,
                ballModel = new MathInteractives.Interactivities.MiniGolf.Models.Ball();
            var ballView = new MathInteractives.Interactivities.MiniGolf.Views.Ball({
                paperScope: this.paperScope,
                model: this.model,
                ballModel: ballModel,
                ball: this.rootBall
            });
            this.model.addBall(ballModel);
            ballView.on(ballViewClass.EVENTS.BALL_SELECTED, $.proxy(this._onBallSelected, this, ballView));
            ballView.on(ballViewClass.EVENTS.BALL_DRAGGED, $.proxy(this._onBallDrag, this, ballView));
            ballView.on(ballViewClass.EVENTS.BALL_DRAGGING_FINISHED, $.proxy(this._onBallDragFinished, this, ballView));
            ballView.on(ballViewClass.EVENTS.STICKYSLIDER_SELECTED, $.proxy(this._stickySliderSelected, this, ballView));
            ballView.on(ballViewClass.EVENTS.STICKYSLIDER_DRAGGED, $.proxy(this._stickySliderDragged, this, ballView));
            ballView.on(ballViewClass.EVENTS.STICKYSLIDER_DRAGGING_FINISHED, $.proxy(this._stickySliderDragFinished, this, ballView));
            ballView.listenTo(ballModel, 'change:position', $.proxy(this._currentBallMoved, this, ballView.cid));
            this.ballViewList.push({ view: ballView, model: ballModel });
            return ballView;
        },

        /**
        * Deletes {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball"}}{{/crossLink}}.
        * @method deleteBall    
        * @public
        */
        deleteBall: function (ballView, event) {// event is used in extended class just abstact entry here
            var itemIndex = this._getBallViewListIndex(ballView.cid);
            if (itemIndex < 0) {
                return;
            }
            var deletedObj = this.ballViewList.splice(itemIndex, 1),
                ballSiblings = this._getSiblingBalls(itemIndex),
                prevBallView = ballSiblings.previous.view,
                nextBall = this._getSiblingBalls(itemIndex - 1).next,
                nextBallView = nextBall.view,
                modelOfDeletedObject,
                obstacles = this.obstacles, index, obstacle,
                obstacleBallIsSnappedTo = null;
            if (deletedObj.length > 0) {
                for (var i = 0; i < deletedObj.length; i++) {
                    deletedObj[i].view.remove();
                    modelOfDeletedObject = deletedObj[i].model;
                    //if ball being deleted was attached to an obstacle
                    // decrement the obstacle's snapped-ball count.
                    obstacleBallIsSnappedTo = modelOfDeletedObject.get('isSnappedTo');
                    if (obstacleBallIsSnappedTo !== null) {
                        for (index in obstacles) {
                            obstacle = obstacles[index];
                            if (obstacle.model.get('obstacleNumber') == obstacleBallIsSnappedTo) {
                                obstacle.decrementSnappedBallCount();
                            }
                        }
                    }
                    this.model.deleteBall(modelOfDeletedObject);
                }
            }
            if (prevBallView) {
                this._currentBallMoved(prevBallView.cid);
            }

            // If slider is released in course such that , path connecting previous ball and next ball passes through hole.
            if (nextBallView) {
                this._currentBallMoved(nextBallView.cid);
            }

            // If the ball which is directly conencted to the rotation handle , in that case , replace the dragballView
            // with next ball view.
            if (itemIndex === 1 && nextBall) {
                this.startBallView = nextBall.view;
                this._bindEventOnHandleBalls();
                this.rotationHandleView.replaceDragball(this.startBallView);
            }
        },

        /**
        * Handles currently being operated ball's rendering part.
        * Interanlly calls {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/updateConnections:method"}}{{/crossLink}}
        * @method _currentBallMoved 
        * @param currentBallViewIndex {Number} ball's view cid.
        * @public
        */
        _currentBallMoved: function (currentBallViewIndex) {
            var listIndex = this._getBallViewListIndex(currentBallViewIndex);
            if (listIndex < 0) {
                return;
            }
            this.updateConnections(listIndex);
        },

        /**
        * Returns ball from the {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/ballViewList:property"}}{{/crossLink}} using 
          provided list index.
        * Interanlly calls {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/updateConnections:method"}}{{/crossLink}}
        * @method _getBallViewAtListIndex 
        * @param listIndex {Number} index in the list
        * @private
        */
        _getBallViewAtListIndex: function (listIndex) {
            var ballViewList = this.ballViewList;
            for (var i = 0; i < ballViewList.length; i++) {
                if (listIndex === i) {
                    return ballViewList[i];
                }
            }
            return null;
        },

        /**
        * Returns ball from the {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/ballViewList:property"}}{{/crossLink}} using 
          provided ball view's cid.        
        * @method _getBallViewAtIndex 
        * @param ballId {String} cid 
        * @private
        */
        _getBallViewAtIndex: function (ballId) {
            var ballViewList = this.ballViewList;
            for (var i = 0; i < ballViewList.length; i++) {
                if (ballViewList[i].view.cid === ballId) {
                    return ballViewList[i];
                }
            }
            return null;
        },

        /**
        * Returns ball index in  {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/ballViewList:property"}}{{/crossLink}} using 
          provided ball view's cid.     
        * @method _getBallViewListIndex 
        * @param ballId {String} cid 
        * @private
        */
        _getBallViewListIndex: function (currentBallViewIndex) {
            var ballViewList = this.ballViewList;
            for (var i = 0; i < ballViewList.length; i++) {
                if (ballViewList[i].view.cid === currentBallViewIndex) {
                    return i;
                }
            }
            return -1;
        },

        /**
        * Renders the line with previous ball view's {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/ball:property"}}{{/crossLink}} and next ball view's {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/ball:property"}}{{/crossLink}} on change event of
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Models.Ball/position:attribute"}}{{/crossLink}}.
        * Internally calls {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_drawLine:method"}}{{/crossLink}},
          and {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_renderAngle:method"}}{{/crossLink}}.
        * @param currentBallIndex {String} cid 
        * @method updateConnections
        * @public 
        **/
        updateConnections: function (currentBallIndex) {
            var self = this;
            var ballViewList = self.ballViewList,
                siblingViews = self._getSiblingBalls(currentBallIndex),
                curBallView = siblingViews.current ? siblingViews.current.view : null,
                nextBallView = siblingViews.next ? siblingViews.next.view : null,
                prevBallView = siblingViews.previous ? siblingViews.previous.view : null;
            self._drawLine(prevBallView, curBallView);
            self._drawLine(curBallView, nextBallView);
            self._renderAngle(curBallView, prevBallView, nextBallView);
        },

        /**
        * Returns the object which consists previous , current and next attributes containing {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/ball:property"}}{{/crossLink}} and next ball view's {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball"}}{{/crossLink}} object.
        * @method _getSiblingBalls
        * @param currentBallIndex {String} cid
        * @return {Object} the object which consists previous , current and next balls.
        * @private 
        **/
        _getSiblingBalls: function (currentBallIndex) {
            var ballViewList = this.ballViewList,
                nextBallIndex = currentBallIndex + 1,
                prevBallIndex = currentBallIndex - 1,
                curBallView = currentBallIndex >= 0 ? ballViewList[currentBallIndex] : null,
                nextBallView = nextBallIndex >= 0 && nextBallIndex < ballViewList.length ? ballViewList[nextBallIndex] : null,
                prevBallView = prevBallIndex >= 0 ? ballViewList[prevBallIndex] : null;
            return { previous: prevBallView, current: curBallView, next: nextBallView };
        },

        /**
        * Renders the line between two balls provided.
        * @method _drawLine
        * @param curBallView {Object} {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball"}}{{/crossLink}}
        * @param nextBallView {Object} {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball"}}{{/crossLink}}
        * @return {Object} the object which consists previous , current and next balls.
        * @private
        **/
        _drawLine: function (curBallView, nextBallView) {
            if (this._isNullOrUndefined(nextBallView) || this._isNullOrUndefined(curBallView)
                || this._isNullOrUndefined(nextBallView.getBallPosition()) || this._isNullOrUndefined(curBallView.getBallPosition())) {
                return;
            }
            var line = curBallView.connectorLine,
                currentClass = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas,
                ballClass = MathInteractives.Interactivities.MiniGolf.Views.Ball,
                curBallPosition = curBallView.getBallPosition(),
                nextBallPosition = nextBallView.getBallPosition(),
                ballClassViewConstant = MathInteractives.Interactivities.MiniGolf.Views.Ball.CONSTANTS,
                paperScope = this.paperScope;
            if (this._isNullOrUndefined(line)) {
                line = new paperScope.Path();
                line.add(0, 0);
                line.add(0, 0);
                line.strokeColor = ballClassViewConstant.ARC_COLOR;
                line.strokeWidth = 2;
                if (currentClass.CONSTANTS.SHOW_SHADOW) {
                    line.shadowColor = new this.paperScope.Color(0, 0, 0, 0.55);
                    line.shadowBlur = 3;
                    line.shadowOffset = new this.paperScope.Point(2, 2);
                }
            }
            var segments = line.segments;
            segments[0].point = curBallPosition;
            segments[1].point = nextBallPosition;
            curBallView.connectorLine = line;
            curBallView.ballGroup.bringToFront();
            nextBallView.ballGroup.bringToFront();
            if (currentClass.CONSTANTS.SHOW_SHADOW) {
                line.shadowColor = new this.paperScope.Color(0, 0, 0, 0.55);
            }
            if (nextBallView.getBallSnap() === false || this._isNullOrUndefined(nextBallView.getBallSnap())) {
                line.dashArray = ballClass.CONSTANTS.DASH_ARRAY;
            }
            else {
                line.dashArray = null;
            }
        },

        snapLine: function (curBallView) {
            return;
            var isSnapped = curBallView.getBallSnap();
            if (this._isNullOrUndefined(isSnapped) || isSnapped === false) {
                //return;
            }
            var ballListIndex = this._getBallViewListIndex(curBallView.cid),
                siblings = this._getSiblingBalls(ballListIndex),
                curBall = siblings.current,
                prevBall = siblings.previous,
                nextBall = siblings.next;
            if (this._isNullOrUndefined(prevBall)) {
                return;
            }
            var curPosition = curBallView.getBallPosition(),
                prevBallView = prevBall.view,
                snapPoint = prevBallView.ballModel.get('snapPoint'),
                mirrorPoint = prevBallView.ballModel.get('mirrorPoint');
            if (this._isNullOrUndefined(snapPoint) || this._isNullOrUndefined(mirrorPoint)) {
                return;
            }

            // Find out angle with previous ball . If it has fractional part, rotate current ball by that fractional part, considering previous
            // ball's position as pivot point.
            var angle = this._calculateAngle(curPosition, snapPoint, mirrorPoint),
                lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                angleDiff = angle - Number(angle.toFixed(0)),
                reflectionLineAngle = Number(lineUtility.getAngleWithXAxis(mirrorPoint, snapPoint).toFixed(0)),
                mulFactor = 1;
            // Multiplication factor to determine the rotation of the current ball depending on the incident surface.
            mulFactor = reflectionLineAngle === 90 ? 1 : mulFactor;
            mulFactor = reflectionLineAngle === 180 ? 1 : mulFactor;
            mulFactor = reflectionLineAngle === 270 ? -1 : mulFactor;
            mulFactor = reflectionLineAngle === 0 ? 1 : mulFactor;
            var newBallPosition = lineUtility.GetRotatedvar(curPosition, snapPoint, mulFactor * angleDiff),
                extPt = lineUtility.GetvarOnLineUsingDistance(snapPoint, newBallPosition, 4, 0, true),
                mirrorPts = this._getTangent(this.courseBounds, newBallPosition);
            newBallPosition = lineUtility.GetvarOnLineUsingDistance(newBallPosition, extPt, -24, 0, true);
            var dummyLine = this._getDummyLine(newBallPosition, extPt),
                interSectionWithPath = dummyLine.getIntersections(this.courseBounds);
            if (interSectionWithPath.length > 0) {
                newBallPosition = interSectionWithPath[interSectionWithPath.length - 1].point;
            }
            curBallView.setBallPosition(new this.paperScope.Point(newBallPosition));
            dummyLine.remove();
            //this._currentBallMoved(prevBallView.cid);
        },

        /**
        * Renders the angle with previous ball view's {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/ball:property"}}{{/crossLink}} and next ball view's {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/ball:property"}}{{/crossLink}} on change event of
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Models.Ball/position:attribute"}}{{/crossLink}}.
        * Internally calls {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/_renderPrevBallAngle:method"}}{{/crossLink}} and {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/_renderNextBallAngle:method"}}{{/crossLink}}.
        *
        * @method _renderAngle
        * @private 
        **/
        _renderAngle: function (curBallView, prevBallView, nextBallView) {
            this._renderPrevBallAngle(curBallView, prevBallView);
            this._renderPrevBallAngle(nextBallView, curBallView);
            this._renderNextBallAngle(curBallView, nextBallView);
            this._renderNextBallAngle(prevBallView, curBallView);
        },

        /**
        * Renders the angle with previous ball view's {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/ball:property"}}{{/crossLink}}.
        * See also {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/_renderAngle:method"}}{{/crossLink}}.
        *
        * @method _renderPrevBallAngle
        * @private 
        **/
        _renderPrevBallAngle: function (curBallView, prevBallView) {

            if (this._isNullOrUndefined(curBallView) || this._isNullOrUndefined(prevBallView) || !curBallView.ballModel.get('isSnapped')) {
                return;
            }

            var ballModel = curBallView.ballModel,
                canvasClass = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.CONSTANTS,
                ballClassViewConstant = MathInteractives.Interactivities.MiniGolf.Views.Ball.CONSTANTS,
                currBallPosition = curBallView.getBallPosition(),
                prevBallPosition = prevBallView.getBallPosition(),
                lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                angleSliceStyleConst = ballClassViewConstant.PREV_ANGLE_SLICE,
                radius = ballClassViewConstant.ANGLE_ARC_RADIUS,
                angleSliceRadius = angleSliceStyleConst.RADIUS,
                angleSliceFromPt, angleSliceViaPt, angleSliceToPt,
                snapPoint = ballModel.get('snapPoint'),
                pt1 = lineUtility.GetvarOnLineUsingDistance(snapPoint, prevBallPosition, radius, 0, true),
                mirrorPoint = ballModel.get('mirrorPoint'),
                arcWithPrevBall = curBallView.arcWithPrevBall,
                paperScope = this.paperScope,
                angleText = curBallView.prevAngleText,
                middlePoint;

            pt1 = new paperScope.Point(pt1);
            if (arcWithPrevBall) {
                arcWithPrevBall.remove();
            }
            if (angleText) {
                angleText.remove();
            }

            angleSliceFromPt = lineUtility.GetvarOnLineUsingDistance(snapPoint, prevBallPosition, angleSliceRadius, 0, true);
            angleSliceToPt = lineUtility.GetvarOnLineUsingDistance(snapPoint, mirrorPoint, angleSliceRadius, 0, true);
            angleSliceViaPt = lineUtility.GetvarOnLineUsingDistance(snapPoint, this._getMidPoint(angleSliceFromPt, angleSliceToPt), angleSliceRadius, 0, true);

            mirrorPoint = lineUtility.GetvarOnLineUsingDistance(snapPoint, mirrorPoint, radius, 0, true);
            middlePoint = lineUtility.GetvarOnLineUsingDistance(snapPoint, this._getMidPoint(pt1, mirrorPoint), radius, 0, true);
            mirrorPoint = new paperScope.Point(mirrorPoint);

            angleSliceFromPt = new paperScope.Point(angleSliceFromPt);
            angleSliceViaPt = new paperScope.Point(angleSliceViaPt);
            angleSliceToPt = new paperScope.Point(angleSliceToPt);

            if ((this._equalX(angleSliceFromPt, angleSliceViaPt) || this._equalX(angleSliceFromPt, angleSliceToPt) || this._equalX(angleSliceViaPt, angleSliceToPt)) ||
             (this._equalY(angleSliceFromPt, angleSliceViaPt) || this._equalY(angleSliceFromPt, angleSliceToPt) || this._equalY(angleSliceViaPt, angleSliceToPt))) {
                // andgle is 0
            }
            else {
                arcWithPrevBall = new paperScope.Path.Arc(angleSliceFromPt, angleSliceViaPt, angleSliceToPt);
                arcWithPrevBall.add(new paperScope.Point(snapPoint));
                arcWithPrevBall.closed = true;

                arcWithPrevBall.strokeWidth = angleSliceStyleConst.STROKE_WIDTH;
                arcWithPrevBall.strokeColor = angleSliceStyleConst.STROKE_COLOR;

                arcWithPrevBall.fillColor = angleSliceStyleConst.FILL_COLOR;
                arcWithPrevBall.fillColor.alpha = angleSliceStyleConst.FILL_ALPHA;
                arcWithPrevBall.shadowColor = new paperScope.Color(0, 0, 0, 0);
                arcWithPrevBall.guide = true;// fix for pointer event null
                arcWithPrevBall.miterLimit = 1;

                this.sendPaperItemToBack(arcWithPrevBall);
                curBallView.mirrorLine && curBallView.mirrorLine.bringToFront();
                curBallView.arcWithPrevBall = arcWithPrevBall;
            }
            var angleMagnitude = this._calculateAngle(pt1, snapPoint, mirrorPoint);
            angleText = new paperScope.PointText({
                content: angleMagnitude + '' + canvasClass.DEGREE_SYMBOL
            });
            this._applyCSSToAngleText(angleText);
            middlePoint = lineUtility.GetvarOnLineUsingDistance(snapPoint, middlePoint, ballClassViewConstant.INCIDENCE_ANGLE_LABEL_ARC_RAIDUS, 0, true);
            angleText.position = new paperScope.Point(middlePoint);
            curBallView.prevAngleText = angleText;
            curBallView.ballModel.set('prevBallAngle', angleMagnitude);
        },

        /**
        * Renders the angle with next ball view's {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/ball:property"}}{{/crossLink}}.
        * See also {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/_renderAngle:method"}}{{/crossLink}}.
        *
        * @method _renderNextBallAngle
        * @private 
        **/
        _renderNextBallAngle: function (curBallView, nextBallView) {
            if (this._isNullOrUndefined(curBallView) || this._isNullOrUndefined(nextBallView) || !curBallView.ballModel.get('isSnapped')) {
                return;
            }

            var ballModel = curBallView.ballModel,
                canvasClass = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.CONSTANTS,
                nextBallPosition = nextBallView.getBallPosition(),
                ballClassViewConstant = MathInteractives.Interactivities.MiniGolf.Views.Ball.CONSTANTS,
                currBallPosition = curBallView.getBallPosition(),
                lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                angleSliceStyleConst = ballClassViewConstant.NEXT_ANGLE_SLICE,
                radius = ballClassViewConstant.ANGLE_ARC_RADIUS,
                angleSliceRadius = angleSliceStyleConst.RADIUS,
                angleSliceFromPt, angleSliceViaPt, angleSliceToPt,
                snapPoint = ballModel.get('snapPoint'),
                pt2 = lineUtility.GetvarOnLineUsingDistance(snapPoint, nextBallPosition, ballClassViewConstant.ANGLE_ARC_RADIUS, 0, true),
                mirrorPoint = ballModel.get('mirrorPoint'),
                arcWithNextBall = curBallView.arcWithNextBall,
                paperScope = this.paperScope,
                angleText = curBallView.nextAngleText,
                middlePoint;
            if (arcWithNextBall) {
                arcWithNextBall.remove();
            }
            if (angleText) {
                angleText.remove();
            }

            angleSliceFromPt = lineUtility.GetvarOnLineUsingDistance(snapPoint, nextBallPosition, angleSliceRadius, 0, true);
            angleSliceToPt = lineUtility.GetvarOnLineUsingDistance(snapPoint, mirrorPoint, angleSliceRadius, 0, true);
            angleSliceViaPt = lineUtility.GetvarOnLineUsingDistance(snapPoint, this._getMidPoint(angleSliceFromPt, angleSliceToPt), angleSliceRadius, 0, true);

            mirrorPoint = lineUtility.GetvarOnLineUsingDistance(snapPoint, mirrorPoint, radius, 0, true);
            middlePoint = lineUtility.GetvarOnLineUsingDistance(snapPoint, this._getMidPoint(pt2, mirrorPoint), radius, 0, true);
            mirrorPoint = new paperScope.Point(mirrorPoint);

            angleSliceFromPt = new paperScope.Point(angleSliceFromPt);
            angleSliceViaPt = new paperScope.Point(angleSliceViaPt);
            angleSliceToPt = new paperScope.Point(angleSliceToPt);

            if ((this._equalX(angleSliceFromPt, angleSliceViaPt) || this._equalX(angleSliceFromPt, angleSliceToPt) || this._equalX(angleSliceViaPt, angleSliceToPt)) ||
             (this._equalY(angleSliceFromPt, angleSliceViaPt) || this._equalY(angleSliceFromPt, angleSliceToPt) || this._equalY(angleSliceViaPt, angleSliceToPt))) {

                // 0 angle
            } else {

                arcWithNextBall = new paperScope.Path.Arc(angleSliceFromPt, angleSliceViaPt, angleSliceToPt);
                arcWithNextBall.add(new paperScope.Point(snapPoint));
                arcWithNextBall.closed = true;

                arcWithNextBall.strokeWidth = angleSliceStyleConst.STROKE_WIDTH;
                arcWithNextBall.strokeColor = angleSliceStyleConst.STROKE_COLOR;

                arcWithNextBall.fillColor = angleSliceStyleConst.FILL_COLOR;
                arcWithNextBall.fillColor.alpha = angleSliceStyleConst.FILL_ALPHA;
                arcWithNextBall.shadowColor = new paperScope.Color(0, 0, 0, 0);
                arcWithNextBall.guide = true; //fix for pointer event null

                arcWithNextBall.miterLimit = 1;

                this.sendPaperItemToBack(arcWithNextBall);
                curBallView.mirrorLine.bringToFront();
                curBallView.arcWithNextBall = arcWithNextBall;
            }

            var angleMagnitude = this._calculateAngle(pt2, snapPoint, mirrorPoint);
            angleText = new paperScope.PointText({
                content: angleMagnitude + '' + canvasClass.DEGREE_SYMBOL
            });
            this._applyCSSToAngleText(angleText);
            middlePoint = lineUtility.GetvarOnLineUsingDistance(snapPoint, middlePoint, ballClassViewConstant.REFLECTION_ANGLE_LABEL_ARC_RAIDUS, 0, true);
            angleText.position = new paperScope.Point(middlePoint);
            curBallView.nextAngleText = angleText;

            curBallView.ballModel.set('nextBallAngle', angleMagnitude);
        },

        /**
        * Calculates angle between provided points.
        *        
        * @method _calculateAngle
        * @param ptOnArc1 {Object} point object
        * @param center {Object} point object
        * @param ptOnArc2 {Object} point object
        * @return {Number} angle value 
        * @private 
        **/
        _calculateAngle: function (ptOnArc1, center, ptOnArc2) {
            var lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                angle = lineUtility.AngleBetweenLineAndPointF(ptOnArc1, ptOnArc2, center);
            angle = Math.round(angle * 1000) / 1000;
            angle = isNaN(angle) ? 0 : angle;
            return Number(angle.toFixed(0));
        },

        /**
        * Apply common CSS to angle text paperobject.
        *        
        * @method _applyCSSToAngleText
        * @param paperObject {Object} text angle paperobject on which common css is to be applied.
        * @private 
        **/
        _applyCSSToAngleText: function (paperObject) {
            if (this._isNullOrUndefined(paperObject)) {
                return;
            }
            var ballClassViewConstant = MathInteractives.Interactivities.MiniGolf.Views.Ball.CONSTANTS,
                canvasClass = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.CONSTANTS;
            paperObject.strokeWidth = ballClassViewConstant.ANGLE_TEXT_STROKE_WIDTH;
            paperObject.fontSize = ballClassViewConstant.ANGLE_TEXT_FONT_SIZE;
            paperObject.fontFamily = ballClassViewConstant.ANGLE_TEXT_FONT_FAMILY;
            paperObject.strokeColor = ballClassViewConstant.ARC_COLOR;
            paperObject.fillColor = ballClassViewConstant.ARC_COLOR;
            if (canvasClass.SHOW_SHADOW) {
                paperObject.shadowColor = new this.paperScope.Color(0, 0, 0);
                paperObject.shadowBlur = 3;
                paperObject.shadowOffset = new this.paperScope.Point(1, 1);
                paperObject.characterStyle = {
                    fontSize: ballClassViewConstant.ANGLE_TEXT_FONT_SIZE,
                    font: 'Montserrat',
                };
            }
        },

        /**
        * Event handler for start ball drag event, it calls a method to restrict ball within course boundaries
        *
        * @method _onStartBallDrag
        * @param event {Object} Paper.js mouse drag event object        
        * @private
        */
        _onStartBallDrag: function _onStartBallDrag(event) {
            var validBallPosition = this._restrictBallOnDrag(event.point, { ballView: this.startBallView });
            event.point = validBallPosition;
            this.rotationHandleView.startBallDragged(event);
            this.currentObject = this.startBallView.ball;
            this.trivializeIncorrectPath(this.model.get('invalidPathIndex'));
            this.model.set('invalidPathIndex', null);
            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.DISABLE_RESET);
        },

        /**
        * Event handler for mat ball drag event, it calls a method to restrict ball within mat boundaries
        *
        * @method _onMatBallDrag
        * @param event {Object} Paper.js mouse drag event object
        
        * @private
        */
        _onMatBallDrag: function _onMatBallDrag(event) {
            var validBallPosition = this._simpleBallDragRestrict(event.point, this.matBounds);
            this.rotationHandleView.setRotationHandlePosition(validBallPosition);
            this.currentObject = this.matBallView.ball;
            this._isLineThroughHole(this.matBallView.cid);
            this.trivializeIncorrectPath(this.model.get('invalidPathIndex'));
            this.model.set('invalidPathIndex', null);
            var status = this._isLastBallThroughHole();
            if (this.ballViewList[0].view.connectorLine) {
                this.ballViewList[0].view.connectorLine.bringToFront();
                this.ballViewList[0].view.ball.parent.bringToFront();
                this.ballViewList[1].view.ball.parent.bringToFront();
            }
            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.DISABLE_RESET);
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
            if (this.ballViewList.length < 3) {
                return;
            }
            this.trivializeIncorrectPath(this.model.get('invalidPathIndex'));
            this.model.set('invalidPathIndex', null);
            this._transferStaticObject(ballView);
            this.currentObject = ballView.ball;
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
            if (this.ballViewList.length < 3) {
                //return;
            }
            this.trivializeIncorrectPath(this.model.get('invalidPathIndex'));
            this.model.set('invalidPathIndex', null);
            this._transferStaticObject(ballView);
            this.currentObject = ballView.stickySliderRaster;
        },

        /**
        * Transfers objects except active objects from active canvas to static canvas.To know more use 'See also' links.
        *
        * <b> See also </b>
            {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_getSiblingBalls:method"}}{{/crossLink}},
            {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/getActivePaperChildren:method"}}{{/crossLink}},
            {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/getPaperItemsWhenSnapped:method"}}{{/crossLink}},
            {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_getBallViewListIndex:method"}}{{/crossLink}}.

        * @method _transferStaticObject
        * @param ballView {Object} ball view which is currently active        
        * @private
        */
        _transferStaticObject: function (ballView) {
            var ballListIndex = this._getBallViewListIndex(ballView.cid),
                siblings = this._getSiblingBalls(ballListIndex),
                movableObjsId = ballView.getActivePaperChildren(),
                movableObjsLen = movableObjsId.length,
                activeCanvasItems = this.paperScope.project.activeLayer.removeChildren(),
                activeCanvasItemsLen = activeCanvasItems.length,
                deletedObj,
                passiveCanvasItems = [];

            if (!this._isNullOrUndefined(siblings.previous)) {
                var prevBallView = siblings.previous.view,
                    ballSnap = prevBallView.getBallSnap();
                movableObjsId = movableObjsId.concat(ballSnap ? prevBallView.getPaperItemsWhenSnapped(false, true) : prevBallView.getActivePaperChildren());
            }
            else {
                movableObjsId = movableObjsId.concat([this.rotationHandleView.handleGroup.id]);
            }
            if (!this._isNullOrUndefined(siblings.next)) {
                var nextBallView = siblings.next.view,
                    ballSnap = nextBallView.getBallSnap();
                movableObjsId = movableObjsId.concat(ballSnap ? nextBallView.getPaperItemsWhenSnapped(true, false) : nextBallView.getActivePaperChildren());
            }
            movableObjsId.push(this.hole.id);
            movableObjsLen = movableObjsId.length;

            for (var i = 0; i < movableObjsLen; i++) {
                for (var j = 0; j < activeCanvasItemsLen; j++) {
                    if (activeCanvasItems[j].id === movableObjsId[i]) {
                        deletedObj = activeCanvasItems.splice(j, 1);
                        for (var k = 0; k < deletedObj.length; k++) {
                            passiveCanvasItems.push(deletedObj[k]);
                            activeCanvasItemsLen--;
                        }
                        break;
                    }

                    // In case , current item is group then check the group children to match current id 
                    // of the object to be transfered.
                    var groupitem = activeCanvasItems[j].children;
                    if (this._isNullOrUndefined(groupitem)) {
                        continue;
                    }
                    for (var l = 0; l < groupitem.length; l++) {
                        if (groupitem[l].id === movableObjsId[i]) {
                            deletedObj = activeCanvasItems.splice(j, 1);
                            for (var k = 0; k < deletedObj.length; k++) {
                                passiveCanvasItems.push(deletedObj[k]);
                                activeCanvasItemsLen--;
                            }
                            break;
                        }
                    }
                }
            }
            this.paperScope.project.activeLayer.addChildren(passiveCanvasItems);
            this.paperScope2.project.activeLayer.addChildren(activeCanvasItems);
            if (prevBallView) {
                this.sendPaperItemToBack(prevBallView.connectorLine);
            }
            nextBallView && nextBallView.arcWithPrevBall && this.sendPaperItemToBack(nextBallView.arcWithPrevBall);
            ballView.arcWithNextBall && this.sendPaperItemToBack(ballView.arcWithNextBall);
            ballView.arcWithPrevBall && this.sendPaperItemToBack(ballView.arcWithPrevBall);
            prevBallView && prevBallView.arcWithNextBall && this.sendPaperItemToBack(prevBallView.arcWithNextBall);
            //$('#' + this.idPrefix + 'game-canvas-' + this.model.get('levelId') + '-2').hide();
            this.paperScope.view.draw();
            this.paperScope2.view.draw();
            this.paperScope.activate();
        },

        sendPaperItemToBack: function sendPaperItemToBack(paperItem) {
            if (paperItem && paperItem.isInserted()) {
                paperItem.sendToBack();
            }
        },

        /**
        * Transfer the objects from the static canvas to the active canvas.
        *
        * <b>See also</b> {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas/_reverseTransfer:method"}}{{/crossLink}}
        *
        * @method _reverseTransfer
        * @private
        */
        _reverseTransfer: function () {
            //$('#' + this.idPrefix + 'game-canvas-' + this.model.get('levelId')).show();
            this.paperScope.project.activeLayer.insertChildren(0, this.paperScope2.project.activeLayer.removeChildren());
            this.paperScope2.view.draw();
            this.paperScope.view.draw();
            this.paperScope.activate();
            this.currentObject = null;
            this.ballViewList[0].view.ball.parent.bringToFront(); // Bring matBallView to the top
            this.ballViewList[this.ballViewList.length - 1].view.ball.parent.bringToFront(); // Bring Last ball to the top
        },

        /**
        * Event handler for drag event of balls other than start and mat balls, it restricts ball within valid bounds.
        *
        * @method _onBallDrag
        * @param event {Object} Paper.js mouse drag event object
        * @param ballView {Object} View object of ball being dragged
        * @return {Object} Point where the ball must be positioned.
        * @private
        */
        _onBallDrag: function _onBallDrag(ballView, event) {
            var boundingPath, validBallPosition;
            boundingPath = null; /*new this.paperScope.CompoundPath({
                children: [
                    this.courseBounds
                ]
            });*/
            validBallPosition = this._restrictBallOnDrag(event.point, { ballView: ballView });
            ballView.setBallPosition(validBallPosition);
            this.currentObject = ballView.ball;
            this._isLineThroughHole(ballView.cid);
            // todo: call ballView method to reposition the ball
        },

        /**
        * Returns the valid position of the ball inside bounding path.
        *
        * @method _restrictBallOnDrag
        * @param eventPoint {Object} Paper.js event point
        * @param boundingPath {Object} Paper.js closed path object within which the ball is to be restricted.
        * @param ballView {Object} View object of ball being dragged
        */
        _restrictBallOnDrag: function _restrictBallOnDrag(eventPoint, options) {
            options = options || {};
            if (!options.boundingPath) {
                options['boundingPath'] = this.courseBounds;
            }
            var validPointWithoutObstacles, index = 0, obstacle,
                obstacles = this.obstacles,
                validPointWithObstacles;
            validPointWithoutObstacles = this._simpleBallDragRestrict(eventPoint, options.boundingPath);
            if (!options.checkForObstacles) {
                this._snapBoundary = { path: this.courseBounds, isObstacle: false };
                return validPointWithoutObstacles;
            }
            else {
                //ignore obstacles with property 'ignoreBallSnap'
                while ((index = this.getNextObstacleIndex(index, -1, ['ignoreBallSnap'])) != -1) {
                    //for (index = this.obstacles.length - 1; index >= 0; index--) {
                    obstacle = obstacles[index];
                    if (obstacle.reflectionPath.contains(validPointWithoutObstacles)) {
                        validPointWithObstacles = obstacle.reflectionPath.getNearestPoint(validPointWithoutObstacles);
                        if (!options.boundingPath.contains(validPointWithObstacles)) {
                            this._snapBoundary = { path: this.courseBounds, isObstacle: false };
                            return options.boundingPath.getNearestPoint(validPointWithObstacles);
                        }
                        this._snapBoundary = { path: obstacle.reflectionPath, isObstacle: true };
                        return validPointWithObstacles;
                    }
                    index++;
                }
                this._snapBoundary = { path: this.courseBounds, isObstacle: false };
                return validPointWithoutObstacles;
            }
        },

        /**
        * Returns event point if contained inside bounding path, else returns nearest point on bounding path.
        *
        * @method _simpleBallDragRestrict
        * @param eventPoint {Object} Paper.js event point
        * @param boundingPath {Object} Paper.js closed path object within which the ball is to be restricted.
        * @private
        **/
        _simpleBallDragRestrict: function _simpleBallDragRestrict(eventPoint, boundingPath) {
            if (boundingPath.contains(eventPoint)) {
                return eventPoint;
            }
            else {
                return boundingPath.getNearestPoint(eventPoint);
            }
        },

        /**
        * Returns event point if contained inside bounding path, else returns nearest point on bounding path.
        *
        * @method _simpleBallDragRestrict
        * @param eventPoint {Object} Paper.js event point
        * @param boundingPath {Object} Paper.js closed path object within which the ball is to be restricted.
        * @private
        **/
        _onBallDragFinished: function (ballView, event, options) {

            if (this._isNullOrUndefined(ballView) || this._isNullOrUndefined(event)) {
                return;
            }
            options = options || {};

            var ballPosition = ballView.getBallPosition(),
                lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                nearestPoint = this._snapBoundary.path.getNearestPoint(ballPosition),
                newBall,
                prevBall = this._getSiblingBalls(this._getBallViewListIndex(ballView.cid)).previous,
                prevBallView = prevBall ? prevBall.view : null,
                prevBallPosition = prevBallView ? prevBallView.getBallPosition() : null,
                canvasView = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas,
                ballReflectionLength = canvasView.CONSTANTS.BALL_REFLECTION,
                snapTolerance = canvasView.CONSTANTS.SNAP_TOLERANCE,
                newBallPosition,
                normal;
            var deleteStartIndex = this._isLineThroughHole(ballView.cid);
            if (deleteStartIndex !== -1) {
                this._holeEncountered(deleteStartIndex);

            }
            else if (lineUtility.GetDistBetweenvars(ballPosition, nearestPoint) < snapTolerance) {
                ballView.setBallPosition(nearestPoint);
                this.snapLine(ballView);
                ballPosition = ballView.getBallPosition(),
                nearestPoint = this._snapBoundary.path.getNearestPoint(ballPosition),
                newBall = this._createNewBall();
                normal = this._getTangent(this._snapBoundary.path, nearestPoint, { isObstacle: this._snapBoundary.isObstacle, sourcePoint: prevBallPosition });
                newBallPosition = lineUtility.GetvarOnLineUsingDistance(nearestPoint, normal.mirrorPoint, ballReflectionLength, 0, true);
                newBallPosition = new this.paperScope.Point(newBallPosition);
                if (!this.courseBounds.contains(newBallPosition)) {
                    var dummyLine = this._getDummyLine(ballPosition, newBallPosition),
                        boundaryIntersection = this.courseBounds.getIntersections(dummyLine);
                    dummyLine.remove();
                    if (boundaryIntersection.length > 0) {
                        newBallPosition = boundaryIntersection[0].point;
                    }
                }
                newBall.setBallPosition(newBallPosition);
                ballView.setBallSnap(true, normal.snapPoint, normal.mirrorPoint);
                ballView.ballModel.set('isSnappedTo', options.obstacleNumber);//obstacle number to which the ball is snapped
                this._currentBallMoved(ballView.cid);
            }
            this._reverseTransfer();
            var secondLastBallViewCID = this.ballViewList[this.ballViewList.length - 2].view.cid;
            var status = this._isLastBallThroughHole();
            
            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.HOLE_ENCOUNTERED, status !== -1);
            return {
                holeEncountered: (status !== -1 && status !== secondLastBallViewCID)
            };
        },


        /**
        * Returns the normal using nearest point provided on the path.
        *
        * @method _getTangent
        * @param bounds {Object} boundry on which the normal will be calculated.
        * @param nearestPoint {Object} nearest point that must be on path.
        * @param options {Object} options
        * @private
        **/
        _getTangent: function (bounds, nearestPoint, options) {
            //var offsetLength = bounds._getOffset(this.courseBounds.getLocationOf(nearestPoint)),
            var offsetLength = bounds._getOffset(bounds.getLocationOf(nearestPoint)),
                tangentPoint = bounds.getNormalAt(offsetLength);
            tangentPoint.length = -MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.CONSTANTS.MIRROR_LINE_LENGTH;
            if (options && options.isObstacle) {
                tangentPoint.length *= -1;
            }
            var tangentVector = { snapPoint: nearestPoint, mirrorPoint: this._addPoints(nearestPoint, tangentPoint) };
            if (this._isSegmentPoint(bounds, nearestPoint) !== -1 && options && options.sourcePoint) {
                var vector = this._subtractPoints(tangentVector.snapPoint, options.sourcePoint);
                vector.length = -MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.CONSTANTS.MIRROR_LINE_LENGTH;
                tangentVector.mirrorPoint = this._addPoints(tangentVector.snapPoint, vector);
            }
            return tangentVector;
        },

        isRendered: true,

        /**
        * Handles {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/stickySliderRaster:method"}}{{/crossLink}} dragging functionality.
        * @method _stickySliderDragged
        * @param ballView {Object} {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball"}}{{/crossLink}}
        * @param event {Object} paperjs mouse drag event.        
        * @private
        **/
        _stickySliderDragged: function (ballView, event, isBallPositionToUse) {
            if (!this.isRendered) {
                return;
            }
            this.isRendered = false;
            var obstacles = this.obstacles,
                nearestPoint = this._restrictBallOnDrag(event.point, { checkForObstacles: (obstacles.length > 0) }),
                prevBall = this._getSiblingBalls(this._getBallViewListIndex(ballView.cid)).previous,
                prevBallView = prevBall ? prevBall.view : null,
                prevBallPosition = prevBallView ? prevBallView.getBallPosition() : null,
                lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                tangent = this._getTangent(this._snapBoundary.path, nearestPoint, {
                    sourcePoint: prevBallPosition,
                    isObstacle: this._snapBoundary.isObstacle
                }),
                ballWasSnappedTo, ballToBeSnappedTo, index = 0, obstacle,
                handleDistance = this._subtractPoints(ballView.getBallPosition(), ballView.stickySliderRaster.position),
                distance = lineUtility.GetDistBetweenvars(event.point, nearestPoint);
            if (this._snapBoundary.isObstacle) {
                // set isSnappedTo obstacle number
                while ((index = this.getNextObstacleIndex(index, -1, ['ignoreBallSnap'])) != -1) {
                    obstacle = this.obstacles[index];
                    if (this._snapBoundary.path.contains(obstacle.actualObstaclePath.position)) {
                        ballWasSnappedTo = ballView.ballModel.get('isSnappedTo');
                        ballToBeSnappedTo = obstacle.model.get('obstacleNumber');
                        if (ballWasSnappedTo != ballToBeSnappedTo) {
                            this.decrementBallsAttachedCountOfObstacle(ballWasSnappedTo);
                            obstacle.incrementSnappedBallCount();
                        }
                        ballView.ballModel.set('isSnappedTo', ballToBeSnappedTo);
                    }
                    index++;
                }
            }
            else if (obstacles.length) {
                ballWasSnappedTo = ballView.ballModel.get('isSnappedTo');
                this.decrementBallsAttachedCountOfObstacle(ballWasSnappedTo);
                ballView.ballModel.set('isSnappedTo', null);
            }
            if (distance === 0 && !isBallPositionToUse) {
                nearestPoint = this._addValueInPoint(nearestPoint, 0, 30);
                tangent.snapPoint = this._addValueInPoint(tangent.snapPoint, 0, 30);
                tangent.mirrorPoint = this._addValueInPoint(tangent.mirrorPoint, 0, 30);
            }
            ballView.setBallPosition(nearestPoint);
            ballView.setBallSnapPoint(tangent.snapPoint, tangent.mirrorPoint);
            this.currentObject = ballView.stickySliderRaster;
            this._isLineThroughHole(ballView.cid);
            this._isLastBallThroughHole();
            this._currentBallMoved(ballView.cid);
            ballView.rectangleCover.opacity = 0.4;
            this.isRendered = true;
            //this.paperScope2.view.draw();
        },

        /**
        * Handles {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/stickySliderRaster:method"}}{{/crossLink}} dragging finished functionality.
        * @method _stickySliderDragFinished
        * @param ballView {Object} {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball"}}{{/crossLink}}
        * @param event {Object} paperjs mouse drag event.        
        * @private
        **/
        _stickySliderDragFinished: function (ballView, event) {
            var nearestPoint = this._restrictBallOnDrag(event.point, { ballView: ballView, checkForObstacles: (this.obstacles.length > 0) }),
                prevBall = this._getSiblingBalls(this._getBallViewListIndex(ballView.cid)).previous,
                prevBallView = prevBall ? prevBall.view : null,
                prevBallPosition = prevBallView ? prevBallView.getBallPosition() : null,
                lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                distance = lineUtility.GetDistBetweenvars(event.point, nearestPoint),
                ballDeleted = false,
                tangent;
            ballView.rectangleCover.opacity = 0.4;
            tangent = this._getTangent(this._snapBoundary.path, ballView.ball.position
                                       , { sourcePoint: prevBallPosition, isObstacle: this._snapBoundary.isObstacle });
            this._reverseTransfer();
            var deleteStartIndex = this._isLineThroughHole(ballView.cid);
            if (deleteStartIndex !== -1) {
                ballView.setBallSnapPoint(tangent.snapPoint, tangent.mirrorPoint);
                this._currentBallMoved(ballView.cid);
                this._holeEncountered(deleteStartIndex);  // To delete rest of the balls.
                ballDeleted = true;
            }
            if (this.ballViewList.length === 2) {
                event.point = this.ballViewList[this.ballViewList.length - 1].view.getBallPosition();
                this._onStartBallDrag(event);
            }
            if (distance === 0 && !this._snapBoundary.isObstacle) {
                this.deleteBall(ballView, event);
            }
            else if (!ballDeleted) {
                this.snapLine(ballView);
                ballView.setBallSnapPoint(tangent.snapPoint, tangent.mirrorPoint);
                this._currentBallMoved(ballView.cid);
            }
            var status = this._isLastBallThroughHole();
            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.HOLE_ENCOUNTERED, status !== -1);
        },

        _rotationHandleRotating: function (ballViewCid) {
            if (this.ballViewList[0].view.connectorLine) {
                this.ballViewList[0].view.connectorLine.bringToFront();
                this.ballViewList[0].view.ball.parent.bringToFront();
                this.ballViewList[1].view.ball.parent.bringToFront();
            }
            var deleteStartIndex = this._isLineThroughHole(ballViewCid);
            if (deleteStartIndex !== -1) {
                // TODO : customized task can be done.
            }
        },

        _bringBallBack: function () {
            var ballViewList = this.ballViewList;
            if (ballViewList.length < 3 && !this.courseBounds.contains(ballViewList[1].view.getBallPosition())) {
                var dummyLine = this._getDummyLine(ballViewList[0].view.getBallPosition(), ballViewList[1].view.getBallPosition()),
                    boundryIntersections = dummyLine.getIntersections(this.courseBounds);
                if (boundryIntersections.length > 0) {
                    ballViewList[1].view.setBallPosition(boundryIntersections[0].point);
                }
                dummyLine.remove();
            }
        },

        _rotationHandleRotated: function (ballViewCid) {
            var deleteStartIndex = this._isLineThroughHole(ballViewCid),
                ballViewList = this.ballViewList;
            this._bringBallBack();
            if (deleteStartIndex !== -1) {
                this._holeEncountered(deleteStartIndex);
                // To align rotation handle in the direction of the the last ball
                if (this.ballViewList.length === 2) {
                    var event = {};
                    event.point = this.ballViewList[1].view.getBallPosition();
                    this._onStartBallDrag(event);
                }
            }
            var status = this._isLastBallThroughHole();
            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.HOLE_ENCOUNTERED, status !== -1);
            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.DISABLE_RESET);
            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.EVENTS.TOOL_UP_EVENT);
        },

        _rotationHandleSelected: function _rotationHandleSelected(handleSelected) {
            this.currentObject = {
                name: MathInteractives.Interactivities.MiniGolf.Views.Ball.NAMES.ROTATION_HANDLE,
                handle: handleSelected
            };
            if (this.arrow) {
                this.arrow.removeChildren();
                this.trivializeIncorrectPath(this.model.get('invaildPathIndex'));
                this.model.set('invalidPathIndex', null);
            }
        },

        hideHole: function (hide) {
            var opacity = hide ? 0 : 0.4,
                hole = this.hole;
            if (this.currentObject && this._getBallViewListIndex(this.currentObject.cid) === 0) {

                return false

            }
            if (opacity !== hole.opacity) {
                hole.opacity = opacity;
                //alert('opacity : ' + opacity);               
            }
        },

        _holeEncountered: function (ballViewCid) {
            var ballListIndex = this._getBallViewListIndex(ballViewCid),
                ballViewList = this.ballViewList,
                deletedFirstBallPosition = ballViewList[ballListIndex + 1].view.getBallPosition(),
                cidArray = [];
            for (var i = ballListIndex + 1; i < ballViewList.length - 1; i++) {
                cidArray.push(ballViewList[i].view.cid);
            }
            for (var i = 0; i < cidArray.length; i++) {
                var ballViewToDelete = this._getBallViewAtIndex(cidArray[i]);
                this.deleteBall(ballViewToDelete.view);
            }
            this._retractball(deletedFirstBallPosition);
        },

        _retractball: function (directinoPoint) {

            var ballViewList = this.ballViewList,
                ballViewListLength = ballViewList.length,
                holePosition = this.model.get('holePosition'),
                lastballView = ballViewList[ballViewListLength - 1].view,
                secondLastBallView = ballViewList[ballViewListLength - 2].view,
                secondLastBallPosition = secondLastBallView.getBallPosition(),
                lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                nearestHolePoint = lineUtility.GetNormalvar(holePosition, directinoPoint, secondLastBallPosition),
                defaultObstcles = null,
                defaultObstclesLength = null,
                currentNearestPoint = null,
                currentDistance = null,
                currentObstacle = null,
                lastBallRadius = null,
                actualObstaclePath = null,
                lastBallPosition = null,
                reflectionNeareastPoint = null,

                holePosition = null,
                hole = this.hole,
                holeRadius = null,
                holeToBallDistance = null,

                count = null;
            if (hole) {


                holeRadius = hole.getBounds().getHeight() / 2;
                holeToBallDistance = hole.getPosition().getDistance(lastballView.ball.getPosition());
            }

            if (this.hole.opacity !== 0 && holeToBallDistance <= holeRadius) {

                lastBallRadius = lastballView.ballInnerRaster.bounds.height / 2;
                defaultObstcles = this.defaultObstacles || [];
                defaultObstclesLength = defaultObstcles.length;
                //holePosition == this.hole.getPosition();
                //holeToBallDistance = holePosition.getDistance(nearestHolePoint);

                for (count = 0; count < defaultObstclesLength; count++) {

                    currentObstacle = defaultObstcles[count];
                    actualObstaclePath = currentObstacle.actualObstaclePath;
                    currentNearestPoint = actualObstaclePath.getNearestLocation(nearestHolePoint);
                    currentDistance = currentNearestPoint.getDistance(nearestHolePoint);


                    if (currentDistance < lastBallRadius) {
                        nearestHolePoint = lastballView.ball.getPosition();
                        reflectionNeareastPoint = secondLastBallView.connectorLine.getIntersections(currentObstacle.reflectionPath);
                        if (actualObstaclePath.contains(nearestHolePoint) || reflectionNeareastPoint.length > 0) {

                            nearestHolePoint = reflectionNeareastPoint[0].getPoint();

                        }


                        break;
                    }


                }

            }
            lastballView.setBallPosition(new this.paperScope.Point(nearestHolePoint));
        },

        _isLastBallThroughHole: function () {
            var indexInList = this.ballViewList.length - 2,
               siblings = this._getSiblingBalls(indexInList),
               previous = siblings.previous,
               current = siblings.current,
               next = siblings.next,
               intersectionResult,
               hole = this.hole;
            if (this.model.get('isHoleCovered')) {
                return -1;
            }
            if (!this._isNullOrUndefined(previous) && !this._isNullOrUndefined(previous.view.connectorLine)) {
                intersectionResult = previous.view.connectorLine.getIntersections(hole);
                if (intersectionResult.length > 0) {
                    this.hideHole(!(intersectionResult.length > 0));
                    return previous.view.cid;
                }
            }
            if (!this._isNullOrUndefined(current) && !this._isNullOrUndefined(current.view.connectorLine)) {
                intersectionResult = current.view.connectorLine.getIntersections(hole);
                if (intersectionResult.length > 0) {
                    this.hideHole(!(intersectionResult.length > 0));
                    return current.view.cid;
                }
            }
            return -1;
        },

        _isLineThroughHole: function (currentBallViewCid) {
            if (this.model.get('isHoleCovered')) {
                return -1;
            }
            var indexInList = this._getBallViewListIndex(currentBallViewCid),
                siblings = this._getSiblingBalls(indexInList),
                previous = siblings.previous,
                current = siblings.current,
                next = siblings.next,
                intersectionResult,
                hole = this.hole;
            if (!this._isNullOrUndefined(previous) && !this._isNullOrUndefined(previous.view.connectorLine)) {
                intersectionResult = previous.view.connectorLine.getIntersections(hole);
                this.hideHole(!(intersectionResult.length > 0));
                if (intersectionResult.length > 0) {
                    return previous.view.cid;
                }
            }
            if (!this._isNullOrUndefined(current) && !this._isNullOrUndefined(current.view.connectorLine)) {
                intersectionResult = current.view.connectorLine.getIntersections(hole);
                this.hideHole(!(intersectionResult.length > 0));
                if (intersectionResult.length > 0) {
                    return current.view.cid;
                }
            }
            if (!this._isNullOrUndefined(next) && !this._isNullOrUndefined(next.view.connectorLine)) {
                intersectionResult = next.view.connectorLine.getIntersections(hole);
                this.hideHole(!(intersectionResult.length > 0));
                if (intersectionResult.length > 0) {
                    return next.view.cid;
                }
            }

            return -1;
        },

        trivializeIncorrectPath: function (ballListIndex) {
            if (ballListIndex < 0) {
                ballListIndex = this.model.get('invalidPathIndex');
            }
            var ball = this._getBallViewAtListIndex(ballListIndex),
                currentClass = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas,
                validLineColor = 'black';
            if (this._isNullOrUndefined(ball) || !currentClass.CONSTANTS.SHOW_SHADOW) {
                return;
            }
            var ballView = ball.view;
            if (this._isNullOrUndefined(ballView)) {
                return;
            }
            if (!this._isNullOrUndefined(ballView.connectorLine)) {
                ballView.connectorLine.shadowColor = validLineColor;
            }
            if (!this._isNullOrUndefined(ballView.arcWithNextBall)) {
                ballView.arcWithNextBall.shadowColor = validLineColor;
            }
            if (!this._isNullOrUndefined(ballView.nextAngleText)) {
                ballView.nextAngleText.shadowColor = validLineColor;
            }
            this.model.set('invalidPathIndex', null);
        },

        highLightIncorrectPath: function (ballListIndex) {
            var ball = this._getBallViewAtListIndex(ballListIndex),
                currentClass = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas,
                invalidLineColor = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.CONSTANTS.INVALID_LINE_COLOR;
            if (this._isNullOrUndefined(ball) || !currentClass.CONSTANTS.SHOW_SHADOW) {
                return;
            }
            var ballView = ball.view;
            if (this._isNullOrUndefined(ballView)) {
                return;
            }
            if (!this._isNullOrUndefined(ballView.connectorLine)) {
                ballView.connectorLine.shadowColor = invalidLineColor;
            }
            if (!this._isNullOrUndefined(ballView.arcWithNextBall)) {
                ballView.arcWithNextBall.shadowColor = invalidLineColor;
            }
            if (!this._isNullOrUndefined(ballView.nextAngleText)) {
                ballView.nextAngleText.shadowColor = invalidLineColor;
            }
            this._renderArrow(ballView);
            this.model.set('invalidPathIndex', ballListIndex);
        },

        _renderArrow: function (ballView) {
            if (this._isNullOrUndefined(ballView)) {
                return;
            }
            if (this.arrow) {
                this.arrow.removeChildren();
            }
            var ballModel = ballView.ballModel,
                tolerance = MathInteractives.Interactivities.MiniGolf.Views.Animation.CONSTANTS.ANGLE_TOLERANCE,
                prevAngle = ballModel.get('prevBallAngle'),
                nextAngle = ballModel.get('nextBallAngle');
            if (!this._isNullOrUndefined(prevAngle) && !this._isNullOrUndefined(nextAngle)) {
                prevAngle = Number(prevAngle.toFixed(0));
                nextAngle = Number(nextAngle.toFixed(0));
                if (nextAngle >= prevAngle - tolerance && nextAngle <= prevAngle + tolerance) {
                    return;
                }
            }
            if (this._isNullOrUndefined(this.arrow)) {
                this.arrow = new this.paperScope.Group();
            }

            var constants = MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.CONSTANTS,
                snapPoint = ballView.ballModel.get('snapPoint'),
                mirrorPoint = ballView.ballModel.get('mirrorPoint');
            if (this._isNullOrUndefined(snapPoint) || this._isNullOrUndefined(mirrorPoint)) {
                return;
            }

            var vector = this._subtractPoints(mirrorPoint, snapPoint),
                lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                nextAngleText = ballView.nextAngleText;
            if (ballView.nextAngleText === null) {
                return
            }
            vector.length = 7 + ballView.nextAngleText.bounds.height / 2;
            var arrowStartPt = this._addPoints(nextAngleText.position, vector);

            var arrow = new this.paperScope.Path();
            arrow.add(arrowStartPt);

            vector.length = constants.INVALID_ARROW_LENGTH;
            var arrowEndPt = this._addPoints(arrowStartPt, vector);
            arrow.add(arrowEndPt);

            vector.angle = -30;
            var arrowPointer1 = lineUtility.GetvarOnLineUsingDistance(arrowStartPt, arrowEndPt, constants.INVALID_ARROW_POINTER_LENGTH,
                -constants.INVALID_ARROW_POINTER_ANGLE, true);
            vector.angle = 30;
            var arrowPointer2 = lineUtility.GetvarOnLineUsingDistance(arrowStartPt, arrowEndPt, constants.INVALID_ARROW_POINTER_LENGTH,
                constants.INVALID_ARROW_POINTER_ANGLE, true);

            var arrowPointerPath = new this.paperScope.Path();
            arrowPointerPath.add(arrowPointer1);
            arrowPointerPath.add(arrowStartPt);
            arrowPointerPath.add(arrowPointer2);

            arrow.strokeWidth = constants.INVALID_LINE_STROKE;
            arrow.strokeColor = 'white';
            arrow.shadowColor = 'red';
            arrow.shadowBlur = 3;

            arrowPointerPath.strokeWidth = constants.INVALID_LINE_STROKE;
            arrowPointerPath.strokeColor = 'white';
            arrowPointerPath.shadowColor = 'red';
            arrowPointerPath.shadowBlur = 3;
            this.arrow.addChildren([arrow, arrowPointerPath]);
        },


        _addValueInPoint: function (point, x, y) {
            return (point) ? new this.paperScope.Point(point.x + x, point.y + y) : 'NaN';
        },

        _addPoints: function (point1, point2) {
            return (point1 && point2) ? new this.paperScope.Point(point1.x + point2.x, point1.y + point2.y) : 'NaN';
        },

        _subtractPoints: function (point1, point2) {
            return (point1 && point2) ? new this.paperScope.Point(point1.x - point2.x, point1.y - point2.y) : 'NaN';
        },

        _getMidPoint: function (point1, point2) {
            return (point1 && point2) ? new this.paperScope.Point((point1.x + point2.x) / 2, (point1.y + point2.y) / 2) : 'NaN';
        },

        _isNullOrUndefined: function (object) {
            return (object === null || typeof object === 'undefined');
        },

        _equalX: function (pt1, pt2) {
            return Number(pt1.x.toFixed(4)) === Number(pt2.x.toFixed(4));
        },

        /**
        * Compares whether y values for point1 and point2 are same or not.
        *
        * @method _equalY
        * @param {Object} pt1 point
        * @param {Object} pt2 point
        * @return {Boolean} whether both the y are same or not.
        * @private 
        **/
        _equalY: function (pt1, pt2) {
            return Number(pt1.y.toFixed(4)) === Number(pt2.y.toFixed(4));
        },

        _getDummyLine: function (point1, point2) {
            var path = new this.paperScope.Path();
            path.add(point1);
            path.add(point2);
            return path;
        },

        reset: function () {
            var model = this.model,
                balls = this.ballViewList,
                numberOfBalls = balls.length,
                ballsToRemove = balls.slice(1, numberOfBalls - 1);
            for (var i = 0; i < ballsToRemove.length; i++) {
                this.deleteBall(ballsToRemove[i].view, null, false);
            }
            var ballModels = model.get('balls'),
                modelsToRemove = ballModels.splice(0, ballModels.length - 2);
            this.rotationHandleView.setInitialPosition();
            if (this.arrow) {
                this.arrow.removeChildren();
                this.model.set('invalidPathIndex', null);
            }
            this.paperScope.view.draw();
            this.paperScope2.view.draw();
            this.currentObject = null;
        },

        onAnimationStarted: function () {
            var balls = this.ballViewList,
                currentBallView;
            for (var i = 0; i < balls.length; i++) {
                currentBallView = balls[i].view;
                currentBallView.setDisable(true);
                currentBallView.hideStickySlider(true);
            }
            this.rotationHandleView.setDisable(true);
            this.paperScope.view.draw();
            this.paperScope2.view.draw();
        },

        onAnimationEnded: function () {
            this.paperScope.activate();
            var balls = this.ballViewList,
                 currentBallView;
            for (var i = 0; i < balls.length; i++) {
                currentBallView = balls[i].view;
                currentBallView.setDisable(false);
                if (i !== balls.length - 1) {
                    currentBallView.hideStickySlider(false);
                }
            }
            this.rotationHandleView.setDisable(false);
            this.paperScope.view.draw();
            this.paperScope2.view.draw();
        },

        _isSegmentPoint: function (path, point) {
            if (this._isNullOrUndefined(path) || this._isNullOrUndefined(point)) {
                return;
            }
            var segments = path.segments;
            for (var i = 0; i < segments.length; i++) {
                if (this._isPointEqual(segments[i].point, point, 0)) {
                    return i;
                }
            }
            return -1;
        },

        _isPointEqual: function (point1, point2, precision) {
            precision = precision ? precision : 0;
            var pt1 = this._setNumberPrecision(point1, precision);
            var pt2 = this._setNumberPrecision(point2, precision);
            return (pt1.x === pt2.x && pt1.y === pt2.y);
        },

        _setNumberPrecision: function (point, precision) {
            var x = Math.round(100 * point.x) / 100,
                y = Math.round(100 * point.y) / 100;
            return new this.paperScope.Point(Number(x.toFixed(precision)), Number(y.toFixed(precision)));
        },

        _forwardTransfer: function () {
            this.paperScope2.project.activeLayer.addChildren(this.paperScope.project.activeLayer.removeChildren());
        },

        /** 
        *   Returns next obstacle based on ignoreProp search. 
        *   The properties to be ignored should be of type bool.
        * @method getNextObstacle
        * @param startIndex {Number} The starting index for search in the obstacles' array.
        * @param ignoreObstacleNumber {Number} 'obstacleNumber' of the obstacle to be ignored.
        * @param ignoreProp {Object} An array of boolean properties of an obstacle, which if true would make the obstacle ignored.
        */
        getNextObstacleIndex: function (startIndex, ignoreObstacleNumber, ignoreProp) {
            ignoreProp = ignoreProp || [];

            var obstacleCount = this.obstacles.length,
                nextObstacle = null,
                nextIndex = -1,
                ignorePrpoLength = ignoreProp.length,
                nextObsModel = null,
                ignore = false;

            if (startIndex !== -1 && startIndex < obstacleCount) {
                for (var i = startIndex; i < obstacleCount; i++) {
                    // ignore = false;
                    nextObstacle = this.obstacles[i];
                    nextObsModel = nextObstacle.model;
                    for (var j = 0; j < ignorePrpoLength; j++) {

                        ignore = false;

                        if (nextObsModel.get(ignoreProp[j]) === true) {
                            ignore = true;
                            break;//ignore
                        }

                    }
                    if (ignore) {
                        continue;
                    }

                    if (ignoreObstacleNumber === nextObsModel.get('obstacleNumber') || nextObsModel.get('isInDispenser')) {
                        continue;//ignore
                    }


                    nextIndex = i;
                    break;
                }
            }
            return nextIndex;
        }
    }, {
        EVENTS: {
            BALL_ENCOUNTERED_HOLE: 'ball-encountered-hole',
            HOLE_ENCOUNTERED: 'hole-encountered',
            DISABLE_RESET: 'disable-reset',
            ENABLE_RESET: 'enable-reset',
            TOOL_UP_EVENT: 'tool-up-on-canvas',
            READY: 'canvas-ready',
            HIDE_TAKE_SHOT_BUTTON:'hide-take-shot-button'
        },
        CONSTANTS: {
            BALL_REFLECTION: 100,
            MIRROR_LINE_LENGTH: 70,
            SNAP_TOLERANCE: 10,
            DEGREE_SYMBOL: '°',
            INVALID_LINE_COLOR: 'red',
            INVALID_LINE_STROKE: 2,
            INVALID_ARROW_LENGTH: 15,
            INVALID_ARROW_OFFSET: 10,
            INVALID_ARROW_POINTER_LENGTH: 8,
            INVALID_ARROW_POINTER_ANGLE: 45,
            SHOW_SHADOW: true
        }
    });
})();
