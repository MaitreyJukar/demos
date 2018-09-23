(function () {
    'use strict';
    var miniGolfModels = MathInteractives.Interactivities.MiniGolf.Models,
        modelClassName = miniGolfModels.Obstacle,
        miniGolfModel = miniGolfModels.MiniGolfData;
    /**
    * Obstacle holds the necessary structure for the obstacles.
    * @class Obstacle
    * @namespace MathInteractives.Interactivities.MiniGolf.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Interactivities.MiniGolf.Views.Obstacle = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Paperscope of the canvas
        * @property paperScope
        * @default null
        * @public
        */
        paperScope: null,

        /**
        * Paper.js group representing an obstacle
        *
        * @property obstacleOnPaper
        * @default null
        */
        obstacleOnPaper: null,

        obstacleBase64URL: null,

        obstacleRaster: null,
        actualObstaclePath: null,
        reflectionPath: null,
        dropSlot: null,

        rotationHandle1: null,
        rotationHandle1InitialAngle: null,
        rotationHandle2: null,
        rotationHandle2InitialAngle: null,


        obstacleFocusRect: null,

        /**
        * Initializes function of ball view.
        * @method initialize
        * @constructor
        */
        initialize: function (options) {
            this.initializeDefaultProperties();
            this.paperScope = options.paperScope;
        },
        initializeDefaultProperties:function initializeDefaultProperties(){

            this._superwrapper('initializeDefaultProperties',arguments);
            this.isMobile=MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;
        },
        /**
        * Initialized the images' base64 URL, loads them and calls render on loading all images.
        *
        * @method addObstacleImages
        */
        addObstacleImages: function addObstacleImages() {
            this._initializeURLs();
            this._asyncImageLoader();
        },

        /**
        * Increments the model attribute numberOfBallsAttached by 1.
        *
        * @method incrementSnappedBallCount
        */
        incrementSnappedBallCount: function incrementSnappedBallCount() {
            this.model.set('numberOfBallsAttached', Number(this.model.get('numberOfBallsAttached')) + 1);
        },

        /**
        * Decrements the model attribute numberOfBallsAttached by 1.
        *
        * @method decrementSnappedBallCount
        */
        decrementSnappedBallCount: function decrementSnappedBallCount() {
            var currentSnappedBallsCount = Number(this.model.get('numberOfBallsAttached'));
            if (currentSnappedBallsCount > 0) {
                this.model.set('numberOfBallsAttached', currentSnappedBallsCount - 1);
            }
        },

        /**
        * Resets the model attribute numberOfBallsAttached to 0.
        *
        * @method resetSnappedBallCount
        */
        resetSnappedBallCount: function resetSnappedBallCount() {
            this.model.set('numberOfBallsAttached', 0);
        },

        /**
        * Initializes URLs of the images.
        * @method _initializeURLS
        * @private
        **/
        _initializeURLs: function _initializeURLs() {
            var mainModelClass = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData,
                spritePositions = mainModelClass.SPRITE_POSITIONS,
                courseNumber = this.model.get('courseNumber'),
                obstacleNumber = this.model.get('obstacleNumber'),
                baseJsonData = this.getJson('baseURL');
            this.obstacleBase64URL = baseJsonData['obstacle_' + courseNumber + '_' + obstacleNumber]

            //    obstacle = spritePositions['OBSTACLE_' + courseNumber + '_' + obstacleNumber];
            //this.obstacleBase64URL = this.getSpritePartBase64URL('sprites', obstacle.LEFT, obstacle.TOP, obstacle.WIDTH, obstacle.HEIGHT);
        },

        /**
        * Initializes images from the URLs loaded by {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Obstacle/_initializeURLS:method"}}{{/crossLink}}.
        * This method is called only after {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Obstacle/_initializeURLS:method"}}{{/crossLink}} is called.
        *
        * @method _asyncImageLoader
        * @private
        **/
        _asyncImageLoader: function _asyncImageLoader() {
            var self = this,
                imagesLoaded = 0,
                imageCount = 1,
                paperScope = this.paperScope;

            this.obstacleRaster = new paperScope.Raster({
                source: this.obstacleBase64URL
            });

            this.obstacleRaster.onLoad = function (event) {
                imagesLoaded++;
                self._triggerRender(imagesLoaded, imageCount);
            }
        },

        /**
        * Only after all rasters are loaded by {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Obstacle/_asyncImageLoader:method"}}{{/crossLink}}, rest of the rendering should be performed.
        *
        * @method _triggerRender
        * @param {Number} imagesLoaded indicates how many rasters are loaded
        * @param {Number} imageCount indicates how many total rasters are to be loaded by {{#crossLink "MathInteractives.Interactivities.MiniGolf.Views.Obstacle/_asyncImageLoader:method"}}{{/crossLink}}.
        * @private
        **/
        _triggerRender: function (imagesLoaded, imageCount) {
            if (imageCount === imagesLoaded) {
                this.getObstaclePathsFromSVG();
                this.render();
                this.attachEventHandlers();
            }
        },

        /**
        * Renders the obstacle
        *
        * @method render
        */
        render: function render() {
            this.obstacleOnPaper.rotate(this.model.get('angle'));
            this.model.set('position', this.model.get('position') || this.model.get('initialPosition'));
            this.obstacleOnPaper.position = this.model.get('position');
            this.model.trigger(miniGolfModel.EVENTS.OBSTACLE_RENDERED);
        },

        /**
        * Makes the obstacle to have a final rotation angle equivalent to the angle passed as parameter.
        *
        * @method rotate
        * @param angle {Number} The final angle of rotation of the obstacle.
        */
        rotate: function rotate(angle) {
            this.obstacleOnPaper.rotate(angle);
            this.model.set('currentAngle', angle + this.model.get('currentAngle'));
        },

        /**
        * Positions the obstacle to the position passed; doesn't updates the model.
        *
        * @method positionObstacle
        * @param position {Object} An object of the form { x: 0, y: 0 } where the obstacle is to be positioned.
        */
        positionObstacle: function positionObstacle(position) {
            this.obstacleOnPaper.position = position;
        },

        /**
        * Places the obstacle to the position passed and stores the position as a valid position.
        *
        * @method placeObstacle
        * @param position {Object} An object of the form { x: 0, y: 0 } where the obstacle is to be positioned.
        */
        placeObstacle: function placeObstacle(position) {
            this.positionObstacle(position);
            this.model.set('position', {
                x: position.x,
                y: position.y
            });
            this.model.set('isObstacleDropped', true);
        },

        /**
        * Sends the obstacle to the back and its drop slot behind it.
        *
        * @method sendObstacleToBack
        */
        sendObstacleToBack: function sendObstacleToBack() {
            var dropSlot = this.dropSlot || null;

            this.obstacleOnPaper.sendToBack();
            if (dropSlot) {
                dropSlot.sendToBack();
            }
        },

        /**
        * Stores currentAngle of obstacle as it's valid orientation angle in it's model.
        *
        * @method storeCurrentOrientation
        */
        storeCurrentOrientation: function storeCurrentOrientation() {
            this.model.set('angle', this.model.get('currentAngle'));
        },

        /**
        * Reverts the obstacle to the last orientation
        *
        * @method revertToLastOrientation
        * @param [options] {Object} Options like animate boolean, animation-duration.
        **/
        revertToLastOrientation: function revertToLastOrientation(options) {
            var delay,
                options = options || {};
            if (options.animate) {
                delay = options.duration || 2000;
                /* TODO: call rotate(angle) in a loop with
                different angles to animate the obstacle
                */
            }
            this.obstacleOnPaper.rotate(-this.model.get('currentAngle') + this.model.get('angle'));
            this.model.set('currentAngle', this.model.get('angle'));
        },

        /**
        * Reverts the obstacle to the last position
        *
        * @method revertToLastPosition
        * @param [options] {Object} Options like animate boolean, animation-duration.
        **/
        revertToLastPosition: function revertToLastPosition(options) {
            var delay,
                options = options || {};
            if (options.animate) {
                delay = options.duration || 2000;
                /* TODO: call this.positionObstacle(position) in a loop with
                different positions to animate the obstacle
                */
            }
            this.placeObstacle(this.model.get('position'));
        },

        /**
        * Reverts the obstacle to the intial position and resets the angle.
        *
        * @method revertToInitialPosition
        * @param [options] {Object} Options like animate boolean, animation-duration.
        **/
        revertToInitialPosition: function revertToInitialPosition(options) {

            var delay,
                options = options || {},
                model = this.model,
                initialPosition = model.get('initialPosition');

            if (options.animate) {
                delay = options.duration || 2000;
                /* TODO: call this.positionObstacle(position) & this.rotate(angle) in a loop with
                different positions and angle value to animate the obstacle
                */
            }
            this.rotate(-Number(this.model.get('currentAngle')));
            this.model.set('angle', 0);
            //  this.placeObstacle(this.model.get('initialPosition'));

            this._setObstacleInitialPosition();
            model.set('position', {
                x: initialPosition.x,
                y: initialPosition.y
            });
            this.isInDispenser();
            this.obstacleOnPaper.bringToFront();
            this.showHideRotationDragHandle(false);
            // this.setFocusRectPosition();
        },

        /**
        * Fetches the obstacle's actual path and reflection path from SVG, creates a paper.js group containing the same.
        *  Creates paper.js path for obstacle drop slot and calls _addRotationHandlesOnObstacle method.
        *
        * @method getObstaclePathsFromSVG
        */
        getObstaclePathsFromSVG: function getObstaclePathsFromSVG() {


            var paperScope = this.paperScope,
                model = this.model,
                obstacleNumber = model.get('obstacleNumber'),
                courseNumber = model.get('courseNumber'),
                accConstants = miniGolfModel.ACC_DATA;
            //svg = this.$('#course-' + courseNumber + '-obstacle-' + obstacleNumber)[0];


            var obstaclePathData = this.getJson('baseURL');

            var reflectionPath = new paperScope.Path(),
                actualPath = new paperScope.Path();

            reflectionPath.pathData = obstaclePathData['obstacle_' + courseNumber + '_' + obstacleNumber + 'Path1'];
            actualPath.pathData = obstaclePathData['obstacle_' + courseNumber + '_' + obstacleNumber + 'Path2']

            var obstacleOnPaper = new paperScope.Group(reflectionPath, actualPath);
            //  reflectionPath.selected = true;



            obstacleOnPaper.name = miniGolfModel.DRAGGABLE;
            this.obstacleOnPaper = obstacleOnPaper;

            this._setObstacleInitialPosition();
            this.reflectionPath = this.obstacleOnPaper.children[0];
            this.actualObstaclePath = this.obstacleOnPaper.children[1];
            this.obstacleRaster.position = this.actualObstaclePath.position;

            if (model.get('type') === 'default') {
                this.obstacleFocusRect = new paperScope.Path.Rectangle({
                    strokeColor: accConstants.STROKE_COLOR,
                    strokeWidth: accConstants.STROKE_WIDTH,
                    dashArray: accConstants.DASH_ARRAY,
                    position: actualPath.position,
                    height: model.get('focusRectHeight'),
                    width: model.get('focusRectWidth'),
                    visible: false
                });
                //  this.setFocusRectPosition();
                this.obstacleOnPaper.addChild(this.obstacleFocusRect)
            }

            if (obstacleNumber != 5 || courseNumber != 3) {
                this.obstacleRaster.translate(2.1, 3.5); // raster translated to fit into the SVGs.
            }
            obstacleOnPaper.addChild(this.obstacleRaster);

            this.actualObstaclePath.bringToFront();

            this.actualObstaclePath.closed = true;
            this.reflectionPath.closed = true;

            var transparentColor = new paperScope.Color(0, 0, 0, 0);
            this.actualObstaclePath.fillColor = transparentColor;
            this.reflectionPath.fillColor = transparentColor;

            this.dropSlot = this.actualObstaclePath.copyTo(paperScope.project.activeLayer);
            this.dropSlot.position = this.actualObstaclePath.position;
            this.dropSlot.sendToBack();

            this._addRotationHandlesOnObstacle();


            //this._addDragHandle();
        },

        setFocusRectPosition: function () {
            this.obstacleFocusRect.position = this.obstacleOnPaper.position;
            this.obstacleFocusRect.bringToFront();
            this.obstacleOnPaper.bringToFront();

        },

        _setObstacleInitialPosition: function () {

            var obstacleOnPaper = this.obstacleOnPaper,
                initialPosition = this.model.get('initialPosition');

            obstacleOnPaper.bounds.x = 0;
            obstacleOnPaper.bounds.y = 0;
            obstacleOnPaper.position = initialPosition;

            this.model.set('isObstacleDropped', true);
        },

        /**
        * Adds rotation handles on the paper.js obstacle group
        *
        * @method _addRotationHandlesOnObstacle
        * @private
        */
        _addRotationHandlesOnObstacle: function _addRotationHandlesOnObstacle() {
            var paperScope = this.paperScope,
                minigolfData = MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData,
                lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                tempPoint,
                actualObstaclePath = this.actualObstaclePath,
                obstacleGroup = this.obstacleOnPaper,
                baseUrl = this.getJson('baseURL'),
                actualObstaclePathSegments,
                rotationHandle1Vertex,
                rotationHandle2Vertex,
                rotationHandle1Position,
                rotationHandle2Position,
                rotation1Raster,
                rotation2Raster,
                rotationHandle1,
                rotationHandle2;

            rotation1Raster = new paperScope.Raster(baseUrl['rotationHandle']);
            rotation2Raster = new paperScope.Raster(baseUrl['rotationHandle']);
            actualObstaclePathSegments = actualObstaclePath.segments;
            rotationHandle1Vertex = this.model.get('rotationHandle1Vertex');
            rotationHandle2Vertex = this.model.get('rotationHandle2Vertex');
            if (this.model.get('rotationHandlesNotAtVertex')) {
                var tempPoint1 = actualObstaclePathSegments[rotationHandle1Vertex[0]].getPoint(),
                    tempPoint2 = actualObstaclePathSegments[rotationHandle1Vertex[1]].getPoint();
                rotationHandle1Position = lineUtility.getMidPoint(tempPoint1, tempPoint2);
                tempPoint1 = actualObstaclePathSegments[rotationHandle2Vertex[0]].getPoint();
                tempPoint2 = actualObstaclePathSegments[rotationHandle2Vertex[1]].getPoint();
                rotationHandle2Position = lineUtility.getMidPoint(tempPoint1, tempPoint2);
            }
            else {
                rotationHandle1Position = actualObstaclePathSegments[rotationHandle1Vertex].getPoint()
                rotationHandle2Position = actualObstaclePathSegments[rotationHandle2Vertex].getPoint()
            }

            rotation1Raster.position = rotationHandle1Position;
            rotation2Raster.position = rotationHandle2Position;

            rotation1Raster.opacity = 0;
            rotation1Raster.visible = false;
            rotation2Raster.opacity = 0;
            rotation2Raster.visible = false;

            rotationHandle1 = new paperScope.Path.Circle({
                center: rotationHandle1Position,
                radius: 10,
                fillColor: new paperScope.Color(0, 0, 0, 0),
                opacity: 0,
                visible: false
            });
            rotationHandle2 = new paperScope.Path.Circle({
                center: rotationHandle2Position,
                radius: 10,
                fillColor: new paperScope.Color(0, 0, 0, 0),
                opacity: 0,
                visible: false
            });

            obstacleGroup.addChild(rotation1Raster);
            obstacleGroup.addChild(rotation2Raster);
            obstacleGroup.addChild(rotationHandle1);
            obstacleGroup.addChild(rotationHandle2);
            this.rotationHandle1 = rotationHandle1;
            this.rotationHandle2 = rotationHandle2;
            this.rotation1Raster = rotation1Raster;
            this.rotation2Raster = rotation2Raster;
            paperScope.view.draw();
            this.rotationHandle1InitialAngle = 360 - lineUtility.getAngleWithXAxis(rotationHandle1.position, actualObstaclePath.position);
            this.rotationHandle2InitialAngle = 360 - lineUtility.getAngleWithXAxis(rotationHandle2.position, actualObstaclePath.position);
        },

        /**
        * Adds a drag icon on the paper.js obstacle group
        *
        * @method _addDragHandle
        * @private
        */
        _addDragHandle: function _addDragHandle() {
            var paperScope = this.paperScope,
                dragHandle,
                obstacleGroup = this.obstacleOnPaper;
            dragHandle = new paperScope.Path.Circle({
                center: obstacleGroup.position,
                radius: 20,
                fillColor: 'green'//,
                //opacity: 0
            });
            obstacleGroup.addChild(dragHandle);
            this.dragHandle = dragHandle;
            paperScope.view.draw();
        },

        /**
        * Checks whether the obstacle is in it's intial position.
        *
        * @method isInDispenser
        * @return {Boolean} True if the obstacle is in it's intial dispenser slot. Else false.
        */
        isInDispenser: function isInDispenser() {
            var returnObj = false,
                model = this.model,
                className = MathInteractives.Interactivities.MiniGolf.Models.Obstacle;
            if (this.model.get('type') == className.TYPES.DEFAULT) {
                var distance = this.actualObstaclePath.getPosition().getDistance(this.dropSlot.getPosition());
                if (Math.abs(distance) < className.OBSTACLE_DROPSLOT_INTERSECTION_AREA_TOLERANCE) {
                    returnObj = true;
                    model.set('isInDispenser', true);
                }
                else {
                    model.set('isInDispenser', false);
                }
            }
            return returnObj;
        },

        /**
        * Attaches paper mouse events on rotation handles and obstacle.
        *
        * @method attachEventHandlers
        * @param [enable] {Boolean} Detaches the events if false.
        */
        attachEventHandlers: function attachEventHandlers(enable) {
            var self = this,
                obstacleModel = this.model;

            if (enable === false) {
                // detach events
                this.actualObstaclePath.detach('mousedrag');
                this.actualObstaclePath.detach('mousedown');
            }
            else {
                this.paperScope.view.draw();
                this.actualObstaclePath.onMouseDrag = $.proxy(this.onObstacleMouseDrag, this);
                this.actualObstaclePath.onMouseDown = $.proxy(this.onObstacleMouseDown, this);
            }
            this.attachObstacleGroupEventHandlers(enable);
            this.attachRotationHandleEventHandlers(enable);

            obstacleModel.on('change:numberOfBallsAttached', function (modelObjet, currentValue) {

                if (!self.isInDispenser() && currentValue <= 0) {

                    obstacleModel.set('isObstacleDropped', true);

                }
                else {
                    if (currentValue === 1) {


                        self.trigger(miniGolfModel.EVENTS.STICKY_SLIDER_ATTACHED_TO_OBSTACLE);
                    }

                }
            })
        },

        /**
        * Attaches paper mouse events on the obstacle group.
        *
        * @method attachObstacleGroupEventHandlers
        * @param [enable] {Boolean} Detaches the events if false.
        */
        attachObstacleGroupEventHandlers: function attachObstacleGroupEventHandlers(enable) {

            if (!this.isMobile) {
                if (enable === false) {
                    // detach events

                    this.obstacleOnPaper.detach('mouseenter');
                    this.obstacleOnPaper.detach('mouseleave');

                }
                else {

                    this.obstacleOnPaper.onMouseEnter = $.proxy(this.onObstacleMouseEnter, this);
                    this.obstacleOnPaper.onMouseLeave = $.proxy(this.onObstacleMouseLeave, this);

                }
            }
        },

        /**
        * Attaches paper mouse events on the rotation handles.
        *
        * @method attachRotationHandleEventHandlers
        * @param [enable] {Boolean} Detaches the events if false.
        */
        attachRotationHandleEventHandlers: function attachRotationHandleEventHandlers(enable) {
            if (enable === false) {
                // detach events
                this.rotationHandle1.detach('mousedrag');
                this.rotationHandle2.detach('mousedrag');
                this.rotationHandle1.detach('mousedown');
                this.rotationHandle2.detach('mousedown');
            }
            else {
                this.rotationHandle1.onMouseDrag = $.proxy(this.onRotationHandle1Drag, this);
                this.rotationHandle2.onMouseDrag = $.proxy(this.onRotationHandle2Drag, this);
                this.rotationHandle1.onMouseDown = $.proxy(this.onRotationHandle1MouseDown, this);
                this.rotationHandle2.onMouseDown = $.proxy(this.onRotationHandle2MouseDown, this);
            }
        },

        /**
        * Called on mouse drag of obstacle, it repositions the obstacle group by event delta.
        *
        * @method onObstacleMouseDrag
        * @param event {Object} The event object.
        */
        onObstacleMouseDrag: function onObstacleMouseDrag(event) {

            if (event.preventDefault) {
                event.preventDefault();
            }
            if (this.model.get('numberOfBallsAttached') == 0) {



                //  if (this.isMobile && !this.model.get('isInDispenser')) {
                this.showHideRotationDragHandle(false);
                //  }
                //  }
                this._closedHandCursor(event);

                var obstacleOnPaper = this.obstacleOnPaper,
                    tempPosition = this._getDifference(event.point, this.mouseDownOffset);
                obstacleOnPaper.position = this._fitInBounds(obstacleOnPaper, tempPosition);
                //this.setFocusRectPosition();
                this.model.set('isObstacleDropped', false);
                this.obstacleOnPaper.bringToFront();
            }
            else {

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
                            // console.log('%cSet focus somewhere', 'font-size: 16px');
                        },
                        scope: this
                    }

                };


                this.stopReading();
                if (!this.obstacleDragPopUp) {
                    this.obstacleDragPopUp = MathInteractives.global.Theme2.PopUpBox.createPopup(options);


                }
            }
        },

        /**
        * The method repositions the paper.js object to the given position while restricting the shape within the
        * canvas.
        * @method _fitInBounds
        * @param shape {Object} The paper.js object to be repositioned.
        * @param position {Object} The new position at which the object is to be placed.
        * @return {Object} For the object to be placed, this method returns a position in terms of x and y such that
        * the object won't go outside the canvas.
        */
        _fitInBounds: function _fitInBounds(shape, position) {
            var shapePosition = shape.position,
                positionOffset = this._getDifference(position, shapePosition),
                shapeTop = shape.bounds.topCenter.y + positionOffset.y,
                shapeBottom = shape.bounds.bottomCenter.y + positionOffset.y,
                shapeLeft = shape.bounds.leftCenter.x + positionOffset.x,
                shapeRight = shape.bounds.rightCenter.x + positionOffset.x,
                paperScope = this.paperScope,
                canvasSize = paperScope.view.getSize(),
                maxX = canvasSize.getWidth(),
                maxY = canvasSize.getHeight(),
                minX = 0,
                minY = 0;

            if (shapeTop < minY) {
                position.y = minY + (shapePosition.y - shape.bounds.top);
            }
            else if (shapeBottom > maxY) {
                position.y = maxY - (shape.bounds.bottom - shapePosition.y);
            }

            if (shapeLeft < minX) {
                position.x = minX + (shapePosition.x - shape.bounds.left);
            }
            else if (shapeRight > maxX) {
                position.x = maxX - (shape.bounds.right - shapePosition.x);
            }
            return position;
        },

        /**
        * Returns the offset of point2 with respect to point1.
        *
        * @method _getDifference
        * @param point1 {Object} The reference point
        * @param point2 {Object} The point whose offset is to be calculated.
        * @return {Object}
        */
        _getDifference: function _getDifference(point1, point2) {
            return { x: point1.x - point2.x, y: point1.y - point2.y };
        },

        /**
        * Called on mouse drag of rotation handle 1, it rotates the obstacle group.
        *
        * @method onRotationHandle1Drag
        * @param event {Obejct} The event object.
        */
        onRotationHandle1Drag: function onRotationHandle1Drag(event) {
            if (this.model.get('numberOfBallsAttached') == 0) {
                if (event.preventDefault) {
                    event.preventDefault();
                }

                var pivotPoint = this.obstacleOnPaper.position,
                    lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                    angle = lineUtility.getAngleWithXAxis(event.point, pivotPoint) + this.rotationHandle1InitialAngle;
                this._closedHandCursor(event);
                this.obstacleOnPaper.rotate(angle - this.model.get('currentAngle'), pivotPoint);
                this.model.set('currentAngle', angle);
            }
        },

        /**
        * Called on mouse drag of rotation handle 2, it rotates the obstacle group.
        *
        * @method onRotationHandle2Drag
        * @param event {Obejct} The event object.
        */
        onRotationHandle2Drag: function onRotationHandle2Drag(event) {
            if (this.model.get('numberOfBallsAttached') == 0) {
                if (event.preventDefault) {
                    event.preventDefault();
                }
                var pivotPoint = this.obstacleOnPaper.position,
                    lineUtility = MathInteractives.Interactivities.MiniGolf.Views.LineUtility,
                    angle = lineUtility.getAngleWithXAxis(event.point, pivotPoint) + this.rotationHandle2InitialAngle;
                this._closedHandCursor(event);
                this.obstacleOnPaper.rotate(angle - this.model.get('currentAngle'), pivotPoint);
                this.model.set('currentAngle', angle);
            }
        },

        /**
        * Called on mouse down of rotation handle 1, it triggers a custom event.
        *
        * @method onRotationHandle1MouseDown
        */
        onRotationHandle1MouseDown: function onRotationHandle1MouseDown(event) {
            if (this.model.get('numberOfBallsAttached') == 0) {
                this.stopReading();
                this._closedHandCursor(event);
                this.attachObstacleGroupEventHandlers(false);
                //this.attachObstacleGroupEventHandlers(false);
                this.trigger(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.OBSTACLE_ROTATE_START, this, 1);
            }
        },

        /**
        * Called on mouse down of rotation handle 2, it triggers a custom event.
        *
        * @method onRotationHandle2MouseDown
        */
        onRotationHandle2MouseDown: function onRotationHandle2MouseDown(event) {
            if (this.model.get('numberOfBallsAttached') == 0) {
                this.stopReading();
                this._closedHandCursor(event);
                this.attachObstacleGroupEventHandlers(false);
                this.trigger(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.OBSTACLE_ROTATE_START, this, 2);
            }
        },

        /**
        * Called on mouse down of obstacle's actual boundary path, it triggers a custom event.
        *
        * @method onObstacleMouseUp
        */
        onObstacleMouseDown: function onObstacleMouseDown(event) {
            if (this.model.get('numberOfBallsAttached') == 0) {
                //if (this.isMobile && !this.model.get('isInDispenser')) {
                this.showHideRotationDragHandle(false);
                // }
                this.play('obstacle-drop-loofa-sound');
                this.mouseDownOffset = this._getDifference(event.point, this.obstacleOnPaper.position);
                this._closedHandCursor(event);
                this.stopReading();
                // this.setFocusRectPosition();
                this.obstacleOnPaper.bringToFront();
                this.trigger(MathInteractives.Interactivities.MiniGolf.Models.MiniGolfData.EVENTS.OBSTACLE_DRAG_START, this);
            }
            else {
                if (event.preventDefault) {
                    event.preventDefault();
                }

            }
        },

        /**
        * Called on mouse-enter of obstacle group; the method is used to show rotation handles.
        *
        * @method onObstacleMouseEnter
        */
        onObstacleMouseEnter: function onObstacleMouseEnter(event) {
            if (this.model.get('numberOfBallsAttached') == 0) {
                this._openHandCursor(event);
                if (!this.isInDispenser()) {
                    this.showHideRotationDragHandle();
                }
            }
        },

        /**
        * Called on mouse-leave of obstacle group; the method is used to hide rotation handles.
        *
        * @method onObstacleMouseLeave
        */
        onObstacleMouseLeave: function onObstacleMouseLeave(event) {
            this._defaultCursor();
            this.showHideRotationDragHandle(false);
        },

        /**
        * Shows/hides rotation & drag handles depending on parameter passed.
        *
        * @method showHideRotationDragHandle
        * @param [show] {Boolean} If false, the method hides the rotation handles.
        */
        showHideRotationDragHandle: function showHideRotationDragHandle(show) {

            if (!this.rotationHandle2) {
                return;
            }
            show = !(show === false);
            var result = (show) ? 1 : 0;
            if (this.player.getModalPresent() === true) {

                show = 0;
            }
            this.rotationHandle1.opacity = result;
            this.rotationHandle2.opacity = result;
            this.rotation1Raster.opacity = result;
            this.rotation2Raster.opacity = result;
            //this.dragHandle.opacity = (show) ? 1 : 0;

            this.rotationHandle1.visible = show;
            this.rotationHandle2.visible = show;
            this.rotation1Raster.visible = show;
            this.rotation2Raster.visible = show;
            //this.dragHandle.visible = show;
        },

        /**
        * Changes the cursor to the open hand cursor
        *
        * @method _openHandCursor
        * @private
        **/
        _openHandCursor: function _openHandCursor(event) {
            if (!this.isMobile && !event.isAccessibility) {
                $('#' + this.idPrefix + 'game-canvas-' + this.model.get('courseNumber')).css({ 'cursor': 'url("' + this.filePath.getImagePath('open-hand') + '"), move' });
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
                $('#' + this.idPrefix + 'game-canvas-' + this.model.get('courseNumber')).css({ 'cursor': 'url("' + this.filePath.getImagePath('closed-hand') + '"), move' });
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
                $('#' + this.idPrefix + 'game-canvas-' + this.model.get('courseNumber')).css({ 'cursor': 'default' });
            }
        }
    }, {});
})();
