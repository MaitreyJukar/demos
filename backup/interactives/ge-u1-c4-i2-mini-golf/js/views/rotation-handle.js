(function () {
    'use strict';

    var miniGolfModel = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData;
    /**
    * Rotation Handle class contains member function to perform necessary tasks for rotation , translation.
    * This view is initialized by {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas"}}{{/crossLink}}.
    * @class RotationHandle
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base.extend
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.RotationHandle = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Holds base64 URL for curved arrow handle.
        * @property curvedArrow64URL
        * @default null
        * @type String
        */
        curvedArrow64URL: null,

        /**
        * Holds curved raster paper object.
        * Image URL is taken from {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/curvedArrow64URL:property"}}{{/crossLink}}.
        * @property curvedArrowRaster
        * @default null
        * @type Object
        */
        curvedArrowRaster: null,

        /**
        * Holds paper object of the handle1.
        * Handle1 is generated by {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/_renderHandle:method"}}{{/crossLink}} function.
        * @property handle1
        * @default null
        * @type Object
        */
        handle1: null,

        /**
        * Holds paper object of the handle2.
        * Handle2 is generated by {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/_renderHandle:method"}}{{/crossLink}} function.
        * @property handle2
        * @default null
        * @type Object
        */
        handle2: null,

        /**
        * Paperscope of the canvas.
        * @property paperScope
        * @default null
        * @type Object
        */
        paperScope: null,

        /**
        * HandleGroup contains
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle1:property"}}{{/crossLink}} ,
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle2:property"}}{{/crossLink}} ,
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/triangleGroup:property"}}{{/crossLink}} and
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/matBallView:property"}}{{/crossLink}} as a children.
        * @property handleGroup
        * @default null
        * @type Object
        */
        handleGroup: null,

        /**
        * Current angle of the rotation Handle.
        * @property currentAngle
        * @default 90
        * @type Number
        */
        currentAngle: 90,

        /**
        * Drag Ball view is the ball that is attached with the {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/matBallView:property"}}{{/crossLink}} .
        * This view is passed as an argument when this class is initialized.
        * @property dragBallView
        * @default null
        * @type Object
        */
        dragBallView: null,

        /**
        * matBallView is the ball which is placed between rotation handles.
        * This view is passed as an argument when this class is initialized.
        * See also {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/dragBallView:property"}}{{/crossLink}} .
        * @property matBallView
        * @default null
        * @type Object
        */
        matBallView: null,

        /**
        * Holds the group of small triangles which are connected to the rotation handle.
        * This group is created by {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/_renderTriangleGroup:method"}}{{/crossLink}} function.
        * @property triangleGroup
        * @default null
        * @type Object
        */
        triangleGroup: null,

        courseBounds: null,

        isDisabled: null,

        /**
        * Initialises Rotation Handle class.
        *
        * @method initialize
        **/
        initialize: function () {
            this.initializeDefaultProperties();
            this._readProperties();
            this._initializeURLS();
            this._asyncImageLoader();
            this.setDisable(false);
        },
        initializeDefaultProperties:function initializeDefaultProperties(){
            this._superwrapper('initializeDefaultProperties',arguments);
            this.isMobile=MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;
        },
        /**

        * Reads the properties supplied at the time of initialization.
        * Properties like
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/dragBallView:property"}}{{/crossLink}} ,
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/matBallView:property"}}{{/crossLink}} ,
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/paperScope:property"}}{{/crossLink}} are must to supply at the time of creation.
        * Function is called from {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/initialize:method"}}{{/crossLink}}.
        *
        * @method _readProperties
        * @private
        **/
        _readProperties: function () {
            var options = this.options;
            this.paperScope = options.paperScope;
            this.courseBounds = options.courseBounds;
            this.dragBallView = options.dragBallView;
            this.matBallView = options.matBallView;
            this.matBallView.deleteStickySlider();
            this.matBallView.hidePurpleBorder(true);
            this.matBallView.hideBallShadow(false);
            this.matBallView.hideGhostBall(true);
        },

        /**
        * Initializes URLs of the images.
        *
        * @method _initializeURLS
        * @public
        **/
        _initializeURLS: function () {
            var base64 = this.getJson('baseURL');
            this.curvedArrow64URL = base64.curvedArrow64URL;
        },

        /**
        * Initializes images from the URLs loaded by {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/_initializeURLS:method"}}{{/crossLink}}.
        * This method is called only after {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/_initializeURLS:method"}}{{/crossLink}} is called.
        * Following image rasters are initialized ,
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/curvedArrowRaster:property"}}{{/crossLink}}.
        * On completion  of raster loading , {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/render:method"}}{{/crossLink}} is triggered.
        *
        * @method _asyncImageLoader
        * @private
        **/
        _asyncImageLoader: function () {
            var self = this,
                paperScope = this.paperScope;
            this.curvedArrowRaster = new paperScope.Raster({
                source: this.curvedArrow64URL
            })
            this.curvedArrowRaster.onLoad = function (event) {
                this.opacity = 0;
                self.render();
            }
        },

        /**
        * Renders the view of the rotation handle on completion of the raster loading.
        * Called by {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/_asyncImageLoader:method"}}{{/crossLink}}
        *
        * @method render
        * @public
        **/
        render: function () {
            this._renderHandleGroup();
            this._attachHandleEvents();
            this._attachBallEvents();
            this._loadSaveState();
            this._freshRun();
            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.RotationHandle.EVENTS.ROTATION_HANDLE_RENDERED);
        },

        _loadSaveState: function () {

        },

        _freshRun: function () {
            this.setInitialPosition();
        },

        /**
        * Initializes images from the URLs loaded by {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/_initializeURLS:method"}}{{/crossLink}}.
        * This method is called only after {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/_initializeURLS:method"}}{{/crossLink}} is called.
        * Following image rasters are initialized ,
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/curvedArrowRaster:property"}}{{/crossLink}}.
        * Called by {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/initialize:method"}}{{/crossLink}}.
        *
        * @method setInitialPosition
        **/
        setInitialPosition: function () {
            var currentClass = MathInteractives.Interactivities.MiniGolf.Views.RotationHandle,
                mainModel = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData,
                position = mainModel.MATBALL_POSITIONS['COURSE_' + this.model.get('levelId')],
                constants = currentClass.CONSTANTS,
                event = {},
                lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility;

            this.setRotationHandlePosition(position);
            if ((this.currentAngle + 360) % 360 != 90) {
                this.rotate(-this.currentAngle + 90);
            }
            this.rotate(constants.INITIAL_ANGLE);
            var ballPosition = new this.paperScope.Point(lineUtility.GetvarOnLineUsingDistance(this.handleGroup.position, this.dragBallView.ball.position, 100, 0, true));
            event.point = ballPosition;
            this.startBallDragged(event);
            this._defaultCursor();
        },

        /**
        * This function is triggered when the {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Ball/STICKYSLIDER_DRAGGED:event"}}{{/crossLink}} is fired.
        *
        * @method _startBallStickySliderDragged
        * @param {Object} event event supplied by paper js library.
        * @private
        **/
        _startBallStickySliderDragged: function (event) {
            event.point = this.dragBallView.getBallPosition();
            this.startBallDragged(event);
        },


        /**
        * Renders handle group.
        * See also {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handleGroup:property"}}{{/crossLink}}
        *
        * @method _renderHandleGroup
        * @private
        **/
        _renderHandleGroup: function () {
            var paperScope = this.paperScope,
                handleGroup = null,
                modelClass = MathInteractives.Interactivities.MiniGolf.Views.RotationHandle.ROTATION_HANDLE;

            this.handle1 = this._renderHandle();
            this.handle2 = this.handle1.clone();
            this.handle1.name = 'handle1';
            this.handle2.name = 'handle2';
            this.handle1.position = new paperScope.Point(0, -modelClass.LENGTH / 2);
            this.handle2.rotate(180);
            this.handle2.position = new paperScope.Point(0, modelClass.LENGTH / 2);
            var triangleGroup = this._renderTriangleGroup();
            this.handleGroup = handleGroup = new paperScope.Group(this.handle1, this.handle2);
            handleGroup.name = miniGolfModel.DRAGGABLE;

            this.handleGroup.position = new paperScope.Point(modelClass.GROUP_POSITION);
            triangleGroup.position = this._addValueInPoint(handleGroup.position, (triangleGroup.bounds.width + this.handle1.bounds.width) / 2 + 5, 0);
            this.matBallView.setBallPosition(this._addPoints(handleGroup.position, modelClass.MATBALL_OFFSET));
            handleGroup.addChildren([triangleGroup, this.matBallView.ball]);
            this.handle1.bringToFront();
            this.handle2.bringToFront();
        },

        /**
        * Render the single handle.
        *
        * @method _renderHandle
        * @return {Object} handle containing {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/curvedArrowRaster:property"}}{{/crossLink}} and violet rectangle.
        * @private
        **/
        _renderHandle: function () {
            var paperScope = this.paperScope,
                modelClass = MathInteractives.Interactivities.MiniGolf.Views.RotationHandle.ROTATION_HANDLE,
                size = modelClass.SIZE,
                color = modelClass.COLOR,
                handle = new paperScope.Path.Rectangle(0, 0, size.width, size.height),
                arrow = this.curvedArrowRaster.clone();
            handle.fillColor = color;
            arrow.rotate(-60);
            arrow.opacity = 1;
            handle.position = new paperScope.Point(modelClass.ARROW_OFFSET);
            arrow.position = new paperScope.Point(modelClass.ARROW_OFFSET);
            var handleItemGroup = new paperScope.Group(handle, arrow);
            handleItemGroup.shadowColor = new this.paperScope.Color(0, 0, 0),
                handleItemGroup.shadowBlur = 3,
                handleItemGroup.shadowOffset = new this.paperScope.Point(2, 2);
            return handleItemGroup;
        },

        /**
        * Render the triangle group.
        * See also  {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/triangleGroup:property"}}{{/crossLink}}.
        *
        * @method _renderTriangleGroup
        * @return {Object} triangle group.
        * @private
        **/
        _renderTriangleGroup: function () {
            var triangle = this._renderTriangle(),
                modelClass = MathInteractives.Interactivities.MiniGolf.Views.RotationHandle.ROTATION_HANDLE,
                count = modelClass.TRIANGLE_COUNT,
                tempTriangle,
                spacing = modelClass.TRIANGLE_SPACING,
                triangleGroup = new this.paperScope.Group();

            for (var i = 0; i < count; i++) {
                tempTriangle = triangle.clone();
                tempTriangle.position.x += i * (triangle.bounds.width + spacing);
                triangleGroup.addChild(tempTriangle);
            }
            triangle.remove();
            return triangleGroup;
        },

        /**
        * Render the single triangle paper object.
        * Called by {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/triangleGroup:property"}}{{/crossLink}}.
        *
        * @method _renderHandle
        * @return {Object} triangle paper object according desired specification.
        * @private
        **/
        _renderTriangle: function () {
            var paperScope = this.paperScope,
                modelClass = MathInteractives.Interactivities.MiniGolf.Views.RotationHandle.ROTATION_HANDLE,
                base = modelClass.TRIANGLE_BASE,
                height = modelClass.TRIANGLE_HEIGHT,
                triangle = new paperScope.Path();
            triangle.add(new paperScope.Point(0, height));
            triangle.add(new paperScope.Point(-base / 2, 0));
            triangle.add(new paperScope.Point(base / 2, 0));
            triangle.closed = true;
            triangle.strokeColor = modelClass.TRIANGLE_COLOR;
            triangle.opacity = modelClass.TRIANGLE_OPACITY;
            triangle.rotate(-90);
            triangle.strokeWidth = 2;
            triangle.shadowColor = new this.paperScope.Color(0, 0, 0),
                triangle.shadowBlur = 3,
                triangle.shadowOffset = new this.paperScope.Point(2, 2);
            return triangle;
        },

        /**
        * Attaches events to the
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle1:property"}}{{/crossLink}},
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle2:property"}}{{/crossLink}}.
        *
        * @method _attachHandleEvents
        * @private
        **/
        _attachHandleEvents: function (enable) {
            if (enable === false) {
                this.handle1.detach('mousedrag');
                this.handle2.detach('mousedrag');
                return;
            }
            var lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                self = this,
                handleGroup = this.handleGroup,
                pivotPoint = this._getMidPoint(this.handle1.position, this.handle2.position);

            this.handle1.onMouseDrag = function (event) {
                self._onHandle1Rotate(event);
            }

            this.handle2.onMouseDrag = function (event) {

                self._onHandle2Rotate(event);
            }

            this.handle1.onMouseDown = $.proxy(this.onRotationHandleMouseDown, this, this.handle1);

            this.handle2.onMouseDown = $.proxy(this.onRotationHandleMouseDown, this, this.handle2);

            this._bindMouseEvents();
        },

        _onHandle2Rotate: function (event) {

            var lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                self = this,
                handleGroup = this.handleGroup,
                pivotPoint = this._getMidPoint(this.handle1.position, this.handle2.position);


            if (self.isDisabled) {
                return;
            }
            if (this._islfLeftClick(event)) {
                self._closedHandCursor(event);
                pivotPoint = self._getMidPoint(self.handle1.position, self.handle2.position);
                var point = lineUtility.GetvarOnLineUsingDistance(pivotPoint, event.point, 20, 0, true);
                var angle = lineUtility.getAngleWithXAxis(point, pivotPoint);
                handleGroup.rotate(-self.currentAngle, pivotPoint);
                self.currentAngle = angle;
                handleGroup.rotate(self.currentAngle, pivotPoint);
                self._onHandleRotated(event);
            }
            if (event.event.preventDefault) {
                event.event.preventDefault();
            }
        },
        _islfLeftClick:function(paperEvent){
            var eventWhich=paperEvent.event.which;

            if(eventWhich===0||eventWhich===1){
                return true;
            }
            return false;

        },



        _onHandle1Rotate: function (event) {

            var lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                self = this,
                handleGroup = this.handleGroup,
                pivotPoint = this._getMidPoint(this.handle1.position, this.handle2.position);

            if (self.isDisabled) {
                return;
            }
            if (this._islfLeftClick(event)) {
                self._closedHandCursor(event);
                pivotPoint = self._getMidPoint(self.handle1.position, self.handle2.position);
                var point = lineUtility.GetvarOnLineUsingDistance(pivotPoint, event.point, 20, 0, true);
                var angle = lineUtility.getAngleWithXAxis(point, pivotPoint);
                handleGroup.rotate(-self.currentAngle, pivotPoint);
                self.currentAngle = angle - 180;
                handleGroup.rotate(self.currentAngle, pivotPoint);
                self._onHandleRotated(event);
            }
            if (event.event.preventDefault) {
                event.event.preventDefault();
            }

        },

        /**
        * Detaches mouse-enter and mouse-leave events and calls _closedHandCursor method
        *
        * @method onRotationHandleMouseDown
        * @param handle {Object} The rotation handle paper.js object on which mouse down occured.
        * @param [event] {Object} The paper.js mouse down event object.
        */
        onRotationHandleMouseDown: function onRotationHandleMouseDown(handle, event) {
            if (this.isdisabled) {
                return;
            }
            if (this._islfLeftClick(event)) {
                this.stopReading();
                handle.detach('mouseenter');
                handle.detach('mouseleave');

                this._closedHandCursor(event);
                this.trigger(MathInteractives.Interactivities.MiniGolf.Views.RotationHandle.EVENTS.ROTATION_HANDLE_SELECTED, [handle]);
            }
        },

        /**
        * Called on rotation handles' mouse up; the method calls _openHandCursor, snapAngle methods and triggers
        * the custom event ROTATION_HANDLE_ROTATION_ENDED
        * @method onRotationHandleRotate
        */
        onRotationHandleRotate: function onRotationHandleRotate(event) {
            if (this.isDisabled) {
                return;
            }
            this._openHandCursor(event);
            this.snapAngle(this.currentAngle);
            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.RotationHandle.EVENTS.ROTATION_HANDLE_ROTATION_ENDED);
        },

        /**
        * Attaches mouse enter event to handle1
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle1:property"}}{{/crossLink}},
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle2:property"}}{{/crossLink}}.
        *
        * @method _onMouseEnterHandle1
        * @private
        **/
        _onMouseEnterHandle1: function _onMouseEnterHandle1(event) {
            if (this.isDisabled) {
                return;
            }
            this._openHandCursor(event);
        },

        /**
        * Attaches mouse enter event to handle2
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle1:property"}}{{/crossLink}},
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle2:property"}}{{/crossLink}}.
        *
        * @method _onMouseEnterHandle2
        * @private
        **/
        _onMouseEnterHandle2: function _onMouseEnterHandle2(event) {
            if (this.isDisabled) {
                return;
            }
            this._openHandCursor(event);
        },

        /**
        * Changes the cursor to the open hand cursor
        *
        * @method _openHandCursor
        * @private
        **/
        _openHandCursor: function _openHandCursor(event) {
            if (!this.isMobile&& !event.isAccessibility) {
                $('#' + this.idPrefix + 'game-canvas-' + this.model.get('levelId')).css({ 'cursor': 'url("' + this.filePath.getImagePath('open-hand') + '"), move' });
            }
        },

        /**
        * Changes the cursor to the closed hand cursor
        *
        * @method _closedHandCursor
        * @private
        **/
        _closedHandCursor: function _closedHandCursor(event) {
            if (!this.isMobile && !event.isAccessibility && event.manualEvent !== true) {

                $('#' + this.idPrefix + 'game-canvas-' + this.model.get('levelId')).css({ 'cursor': 'url("' + this.filePath.getImagePath('closed-hand') + '"), move' });
            }
        },

        /**
        * Attaches mouse leave event to handle1
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle1:property"}}{{/crossLink}},
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle2:property"}}{{/crossLink}}.
        *
        * @method _onMouseLeaveHandle1
        * @private
        **/
        _onMouseLeaveHandle1: function _onMouseLeaveHandle1() {
            if (this.isDisabled) {
                return;
            }
            this._defaultCursor();
        },

        /**
        * Attaches mouse leave event to handle2
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle1:property"}}{{/crossLink}},
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle2:property"}}{{/crossLink}}.
        *
        * @method _onMouseLeaveHandle2
        * @private
        **/
        _onMouseLeaveHandle2: function _onMouseLeaveHandle2() {
            if (this.isDisabled) {
                return;
            }
            this._defaultCursor();
        },

        /**
        * Triggered from the canvas view, on mouse up on the canvas, the cursor is reset.
        *
        * @method _resetCursor
        * @private
        **/
        _resetCursor: function () {
            this._defaultCursor();
            this._bindMouseEvents();
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
        * Binds the mouse events on the handles
        *
        * @method _bindMouseEvents
        * @private
        **/
        _bindMouseEvents: function bindMouseEvents() {
            this.handle1.onMouseEnter = $.proxy(this._onMouseEnterHandle1, this);
            this.handle2.onMouseEnter = $.proxy(this._onMouseEnterHandle2, this);
            this.handle1.onMouseLeave = $.proxy(this._onMouseLeaveHandle1, this);
            this.handle2.onMouseLeave = $.proxy(this._onMouseLeaveHandle2, this);
        },

        _attachBallEvents: function () {
            var self = this;
            this.listenTo(this.matBallView.ballModel, 'change:position', function () {
                self.model.set('rotationHandlePosition', self.matBallView.getBallPosition());
            });
        },

        /**
        * Rotates the handle by provided angle ( In degree, not in radian ).
        * Internally triggers the
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle1:property"}}{{/crossLink}} mouse drag event.
        *
        * @method rotate
        * @param {Number} angle angle (In Degree, not in Radian)
        * @public
        **/
        rotate: function (angle, event) {
            var lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                pivotPoint = this._getMidPoint(this.handle1.position, this.handle2.position),

                extPoint = lineUtility.GetvarOnLineUsingDistance(pivotPoint, this.handle1.position, 20, angle, true);
            var event = event || {};
            event.point = new this.paperScope.Point(extPoint);
            event.event = {};
            event.event.which = 1;
            this.handle1.trigger('mousedrag', event);
        },

        snapAngle: function (currentAngle) {
            //function was being called on mouse up of rotation handle to display accurate angles in decimal
            return;//(function currently not required & was causing issue on rotate if start ball was snapped and connector line passes through hole)
            var fractionPart = currentAngle - Number(currentAngle.toFixed(0));
            if (Number(fractionPart.toFixed(3)) === 0) {
                return;
            }
            this.log("fractionpart", fractionPart);
            this.rotate(fractionPart);
        },

        /**
        * On encountering events on
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle1:property"}}{{/crossLink}} or
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handle2:property"}}{{/crossLink}} , this function is called.
        * Finds the perpendicular point to the rotation handle axis to reuse the code.
        *
        * @method _onHandleRotated
        * @param {Object} event provided by the events on handles.
        * @public
        **/
        _onHandleRotated: function (event) {
            var lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                pivotPoint = this._getMidPoint(this.handle1.position, this.handle2.position),
                ballDistance = lineUtility.GetDistBetweenPointFs(pivotPoint, this.dragBallView.ballInnerRaster.position),
                paperScope = this.paperScope,
                extPoint = lineUtility.GetvarOnLineUsingDistance(pivotPoint, this.handle1.position, ballDistance, 90, true);

            if (!this.dragBallView.getBallSnap()) {
                this.dragBallView.setBallPosition(new paperScope.Point(extPoint));
            }
            else {
                // manualEvent : true => when drag ball is snapped and handle is rotated . Following code is to keep the drag ball snapped.
                if (this._isNullOrUndefined(event.manualEvent)) {
                    this._adjustDragBallPosition();
                }
            }
            this.model.set('rotationHandleAngle', this.currentAngle);
            this.trigger(MathInteractives.Interactivities.MiniGolf.Views.RotationHandle.EVENTS.ROTATION_HANDLE_ROTATED);
        },

        _adjustDragBallPosition: function () {
            var lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                pivotPoint = this._getMidPoint(this.handle1.position, this.handle2.position),
                ballDistance = lineUtility.GetDistBetweenPointFs(pivotPoint, this.dragBallView.ballInnerRaster.position),
                paperScope = this.paperScope,
                extPoint = lineUtility.GetvarOnLineUsingDistance(pivotPoint, this.handle1.position, ballDistance, 90, true);
            extPoint = lineUtility.GetvarOnLineUsingDistance(pivotPoint, extPoint, 900, 0, true);
            var dummyLine = new paperScope.Path([pivotPoint, extPoint]),
                interSectionPt = this.courseBounds.getIntersections(dummyLine);
            if (interSectionPt.length > 0) {
                var lastInterSectionPt = interSectionPt[interSectionPt.length - 1];
                var tangents = this._getTangent(this.courseBounds, lastInterSectionPt.point);
                this.dragBallView.setBallSnapPoint(tangents.snapPoint, tangents.mirrorPoint);
                this.dragBallView.setBallPosition(lastInterSectionPt.point);
                this.dragBallView.setBallSnapPoint(tangents.snapPoint, tangents.mirrorPoint);
            }
        },

        /**
        * On encountering events on ball {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/dragBallView:property"}}{{/crossLink}} , this function is called.
        * Internally triggers mouse drag event of the handle.
        *
        * @method rotate
        * @param {Object} event provided by the events on handles.
        * @public
        **/
        startBallDragged: function (event) {

            var lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                pivotPoint = this._getMidPoint(this.handle1.position, this.handle2.position),
                point = lineUtility.GetvarOnLineUsingDistance(pivotPoint, event.point, 20, -90, true);
            this.dragBallView.setBallPosition(event.point);
            event.point = new this.paperScope.Point(point);
            event.manualEvent = true;
            event.event = {};
            event.event.which = 1;

            this.handle1.trigger('mousedrag', event);
            this.handleGroup.bringToFront();
        },

        /**
        * Sets the position of
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/matBallView:property"}}{{/crossLink}} ,
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/dragBallView:property"}}{{/crossLink}} , and
        * {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.RotationHandle/handleGroup:property"}}{{/crossLink}}.
        *
        * @method setRotationHandlePosition
        * @param {Object} ballPosition ballPosition Valid ball position on the mat.
        */
        setRotationHandlePosition: function setRotationHandlePosition(ballPosition) {
            var startBallPreviousPosition, startBallNewPosition,
                prevBallPosition = this.matBallView.ballInnerRaster.position,
                translationVector = this._subtractPoints(ballPosition, prevBallPosition);
            this.handleGroup.translate(translationVector);
            this.matBallView.setBallPosition(this.matBallView.ballInnerRaster.position);
            this.matBallView.ball.position = this._getMidPoint(this.handle1.position, this.handle2.position);
            startBallPreviousPosition = this.dragBallView.getBallPosition();
            startBallNewPosition = this._addPoints(startBallPreviousPosition, translationVector);
            startBallNewPosition = new this.paperScope.Point(startBallNewPosition);
            if (!this.dragBallView.getBallSnap()) {
                this.dragBallView.setBallPosition(startBallNewPosition);
            }
            else {
                var event = {};
                event.point = this.dragBallView.getBallPosition();
                this.startBallDragged(event);
            }
            this.matBallView.ball.bringToFront();
            this.matBallView.connectorLine.sendToBack();
        },

        /**
        * Adds numbers in point.
        *
        * @method _addValueInPoint
        * @param {Object} point point in which values are to be added.
        * @param {Number} x x value to be added.
        * @param {Number} y y value to be added.
        * @return {Object} Result.
        * @private
        */
        _addValueInPoint: function (point, x, y) {
            return (point) ? new this.paperScope.Point(point.x + x, point.y + y) : 'NaN';
        },

        replaceDragball: function (newDragBallView) {
            this.dragBallView = newDragBallView;
            var event = {};
            event.point = this.dragBallView.getBallPosition();
            this.startBallDragged(event);
        },

        /**
        * Adds two points.
        *
        * @method _addPoints
        * @param {Object} point1 point
        * @param {Object} point2 point
        * @return {Object} Result of addition of point1 and point2
        * @private
        **/
        _addPoints: function (point1, point2) {
            return (point1 && point2) ? new this.paperScope.Point(point1.x + point2.x, point1.y + point2.y) : 'NaN';
        },

        /**
        * Subtracts two points.
        *
        * @method _subtractPoints
        * @param {Object} point1 point
        * @param {Object} point2 point
        * @return {Object} Result of subtraction of point1 and point2
        * @private
        **/
        _subtractPoints: function (point1, point2) {
            return (point1 && point2) ? new this.paperScope.Point(point1.x - point2.x, point1.y - point2.y) : 'NaN';
        },

        /**
        * Calculates mid point of two points.
        *
        * @method _getMidPoint
        * @param {Object} point1 point
        * @param {Object} point2 point
        * @return {Object} Mid point of point1 and point2
        * @private
        **/
        _getMidPoint: function (point1, point2) {
            return (point1 && point2) ? new this.paperScope.Point((point1.x + point2.x) / 2, (point1.y + point2.y) / 2) : 'NaN';
        },

        _isNullOrUndefined: function (object) {
            return (object === null || typeof object === 'undefined');
        },

        _getTangent: function (bounds, nearestPoint) {
            var offsetLength = bounds._getOffset(this.courseBounds.getLocationOf(nearestPoint)),
                tangentPoint = bounds.getNormalAt(offsetLength);
            tangentPoint.length = -MathInteractives.Interactivities.MiniGolf.Views.BaseCanvas.CONSTANTS.MIRROR_LINE_LENGTH;
            return { snapPoint: nearestPoint, mirrorPoint: this._addPoints(nearestPoint, tangentPoint) };
        },

        setDisable: function (disable) {
            if (this.handle1 && this.handle2) {
                this.handle1.opacity = this.handle2.opacity = (disable ? 0.5 : 1);
            }
            this.isDisabled = disable;
        }

    },
                                                                                                                      {
        EVENTS: {
            ROTATION_HANDLE_RENDERED: 'rotation-handle-rendered',
            ROTATION_HANDLE_SELECTED: 'rotationHandleSelected',
            ROTATION_HANDLE_ROTATED: 'rotationHandleRotated',
            ROTATION_HANDLE_ROTATION_ENDED: 'rotationEnded'
        },
        ROTATION_HANDLE: {
            SIZE: { width: 31, height: 26 },
            POSITION: { x: 50, y: 50 },
            LENGTH: 60,
            COLOR: '#391165',
            ARROW_OFFSET: { x: 0, y: 0 },
            TRIANGLE_BASE: 15,
            TRIANGLE_HEIGHT: 10,
            TRIANGLE_COLOR: '#ffffff',
            TRIANGLE_OPACITY: 1,
            TRIANGLE_COUNT: 3,
            TRIANGLE_SPACING: 5,
            MATBALL_OFFSET: { x: 1, y: 2 }
        },
        CONSTANTS: {
            INITIAL_ANGLE: -45,
            INITIAL_DISTANCE: 75
        }
    });
})();