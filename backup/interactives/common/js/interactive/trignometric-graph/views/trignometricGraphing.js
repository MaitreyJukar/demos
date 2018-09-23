(function () {

    var modelClass = null, classNameTab1 = null;
    'use strict';



    var namespace = MathInteractives.Common.Interactivities.TrignometricGraphing.Views;

    /**
  * Class for exploreGraph of Sine , Cos
  * @class TrignometricGraphing
  * @module TrignometricGraphing
  * @namespace MathInteractives.Interactivities.TrignometricGraphing.Views
  * @extends MathInteractives.Common.Player.Views.Base
  * @type Object
  * @constructor
  */

    namespace.ExploreTrignometricGraphing = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Unique interactivity id prefix
        * @property _idprefix
        * @default null
        * @private
        */
        idPrefix: null,

        /**
        * Model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,

        /**
        * Manager object 
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,

        /**
        * Reference to player object
        * @property player
        * @type Object
        * @default null
        */
        player: null,


        /**
       * Used to store the current paperScope.
       * @property paperScope
       * @type String
       * @default null
       * @private
       */
        paperScope: null,

        /**
       * Used to store the ID of the canvas.
       * @property _canvasID
       * @type String
       * @default null
       * @private
       */
        _canvasID: null,

        /**
       * Paper object of center circle.
       * @property _centerCircle
       * @type Object
       * @default null
       * @private
       */
        _centerCircle: null,

        /**
      * Position of draggable circle item
      * @property dragItemPos
      * @type Object
      * @default null
      */
        dragItemPos: null,

        /**
       * Used to store object of plane.
       * @property _dragHandle
       * @type Object
       * @default null
       * @private
       */
        _dragHandle: null,

        _dragHandleDummy: null,

        angleToMove: null,

        /**
       * Used to store object of radius.
       * @property _radius
       * @type Object
       * @default null
       * @private
       */
        _radius: 70,

        /**
       * Used to store object of outer circle.
       * @property _circle
       * @type Object
       * @default null
       * @private
       */
        _circle: null,

        /**
        * Draggable Circle Item object
        * @property _dragCircle
        * @type Object
        * @default null
        */
        _dragCircle: null,

        /**
        * Radius Vector of drag Item from center of circle
        * @property _radiusVector
        * @type Object
        * @default null
        */
        _radiusVector: null,

        /**
        * Tool object of paper
        * @property tool
        * @type Object
        * @default null
        */
        tool: null,

        /**
        * To check mouse up event on tool object
        * @property toolMouseUpCheck
        * @type Boolean
        * @default false
        */
        toolMouseUpCheck: false,

        /**
       * Boolean to indicate which type of cursor to use
       * @property handCursorFlag
       * @type Boolean
       * @default false
       */
        handCursorFlag: false,

        /**
        * Last angle of drag circle item
        * @property lastAngle
        * @type Number
        * @default 0
        */
        lastAngle: 0,

        /**
        * Initial Angle of rotating
        * @property initialFlightAngle
        * @type Number
        * @default null
        */
        initialFlightAngle: null,

        /**
        * Previous angle while dragging
        * @property previousAngle
        * @type Number
        * @default null
        */
        previousAngle: null,

        /**
        * Boolean indicate whether clockwise rotation reached to max (360 deg)
        * @property positiveFullArc
        * @type Boolean
        * @default false
        */
        positiveFullArc: false,

        /**
        * Boolean indicate whether anti-clockwise rotation reached to min (-360 deg)
        * @property negativeFullArc
        * @type Boolean
        * @default false
        */
        negativeFullArc: false,

        /**
        * Boolean indicate whether to allow rotation 
        * @property allowRotation
        * @type Boolean
        * @default true
        */
        allowRotation: true,

        /**
       * Radius slider view
       * @property radiusView
       * @type object
       * @default null
       */
        radiusView: null,

        /**
        * Distance multiplier slider view
        * @property distanceView
        * @type object
        * @default null
        */
        distanceView: null,

        /**
        * Boolean indicates whether mouse down
        * @property mouseLeftClick
        * @type Boolean
        * @default false
        */
        mouseLeftClick: false,

        /**
       * Current angle of rotation of drag item
       * @property currentAngle
       * @type number
       * @default 0
       */
        currentAngle: 0,

        /**
       * Function type is sine/cos
       * @property trignometricFunction
       * @type Object
       * @default null
       */
        trignometricFunction: null,

        /**
        * Center point of circle
        * @property centerPoint
        * @type object
        * @default null
        */
        centerPoint: null,

        /**
       * Init vect angle
       * @property initVectAngle
       * @type number
       * @default 0
       */
        initVectAngle: 0,

        /**
       * Paper object to draw line in circle showing sine & cos bar
       * @property sineCosLine
       * @type object
       * @default null
       */
        sineCosLine: null,

        /**
        * Paper object to draw line in circle cos offset line
        * @property tempCosLine
        * @type object
        * @default null
        */
        tempCosLine: null,

        /**
       * Number of point to show on circle
       * @property showPointsCount
       * @type number
       * @default 12
       */
        showPointsCount: 6,

        /**
        * To store original value of radius
        * @property originalRadius
        * @type number
        * @default 0
        */
        originalRadius: 0,

        /**
        * Paper object to store bubble group(Colored circle's which shows visited point by drag item) 
        * @property bubbleGroup
        * @type object
        * @default null
        */
        bubbleGroup: null,

        /**
       * Base Angle ( 360/total points)
       * @property baseAngleValue
       * @type number
       * @default 0
       */
        baseAngleValue: 0,

        /**
        * Boolean to indicate whether circle/radial group & other elements are rendered
        * @property renderElements
        * @type Boolean
        * @default true
        */
        renderElements: false,

        /**
        * Group of radius objects
        * @property radialGroup
        * @type object
        * @default null
        */
        radialGroup: null,

        /**
       * Max visited angle by drag item in anticlockwise direction.
       * Used to manipulate bubble items
       * @property maxVisitedAnglePos
       * @type number
       * @default 0
       */

        maxVisitedAnglePos: 0,

        /**
        * Max visited angle by Imposed Circle in anti clock wise direction
        * Used to manipulate bubble items
        * @property maxVisitedImposedPos
        * @type number
        * @default 0
        */
        maxVisitedImposedPos: 0,

        /**
        * Max visited angle by Imposed Circle in clock wise direction
        * @property maxVisitedImposedNeg
        * @type number
        * @default 0
        */
        maxVisitedImposedNeg: 0,


        /**
      * Max visited angle by drag item in clockwise direction.
      * Used to manipulate bubble items
      * @property maxVisitedAngleNeg
      * @type number
      * @default 0
      */
        maxVisitedAngleNeg: 0,


        /**
        * Current direction clockwise/anticlockwise
        * @property rotatingDirection
        * @type String
        * @default ''
        */
        rotatingDirection: '',


        /**
        * Condition for clockwise /anticlockwise movement
        * @property condition
        * @type number
        * @default null
        */
        condition: null,

        /**
        * Whether tab is viewed before
        * @property isTabViewed
        * @type Boolean
        * @default false
        */
        isTabViewed: false,


        /**
        * Paper object which holds the diameter line
        * @property diameterLine
        * @type object
        * @default null
        */
        diameterLine: null,

        /**
        * Scale of current Radius
        * @property currentRadiusScale
        * @type number
        * @default 0
        */
        currentRadiusScale: 0,


        /**
        * Scale of current distance multiplier
        * @property currentDistanceScale
        * @type number
        * @default 0
        */
        currentDistanceScale: 0,


        /**
        * Point which is getting visited while dragging circle
        * @property currentDistanceScale
        * @type number
        * @default 0
        */
        maxVisiblePoint: 0,

        /**
       * Skipping first drag event trigger to graph
       * @property firstDrag
       * @type Boolean
       * @default true
       */
        firstDrag: true,


        /**
        * Paper object group of rotating circles
        * @property _rotatingCircleGroup
        * @type Object
        * @default null
        */
        _rotatingCircleGroup: null,


        /**
        * Previous Angle store to trigger change angle event
        * @property previousSavedAngle
        * @type number
        * @default 0
        */
        previousSavedAngle: 0,

        graphingFocusRect: null,

        colorChange: false,

        accCurrentAngle: 0,

        /**
       * Border on drag circle at infinite point in tan function
       * @property borderCircle
       * @type object
       * @default null
       */
        borderCircle: null,

        /**
        * Initializes properties of the view.
        * @method initialize
        * @constructor
        */

        initialize: function () {

            this.filePath = this.model.get('path');
            this.manager = this.model.get('manager');
            this.player = this.model.get('player');
            this.idPrefix = this.player.getIDPrefix();
            this.centerPoint = this.model.get('circleCenterPoint');
            this._radius = this.model.get('circleRadius');
            this.trignometricFunction = this.model.get('trignometricFunction');
            this.showPointsCount = this.model.get('initShowPoints');

            classNameTab1 = MathInteractives.Common.Interactivities.TrignometricGraphing.Views.ExploreTrignometricMapping;
            modelClass = MathInteractives.Common.Interactivities.TrignometricGraphing.Models.ExploreTrignometricGraphing;

            this._canvasID = this.idPrefix + 'rotate-animation-canvas';

            var options = { idPrefix: this.idPrefix };
            this.$el.append(MathInteractives.Common.Interactivities.TrignometricGraphing.templates.exploreTrigGraph(options).trim());

            this._setupPaperScope();
            this.tool = new this.paperScope.Tool();
            this.tool.onMouseDrag = function (event) {
                event.preventDefault();
            };
            this.render();
            this.enableTab('rotate-animation-acc-container', false);

            this.generateDropdown();
            this.comboBoxView.selectComboOptionByIndex(-1);
            MathInteractives.Common.Utilities.Models.Utils.EnableTouch(self.$('.rotate-animation-canvas'));
        },

        /**
        * Initializes all the necessary DOM elements
        * @method render
        * @private
        */
        render: function render() {
            //window.exploreTab = this;
            this.paperScope.activate();

            this.loadScreen('exploreGraph-tab');
            this.initialFlightAngle = this.initVectAngle;
            this._renderSliders();
            this.originalRadius = this._radius;

            this.radiusView.setSelectedValue(this.model.get('radiusSliderData').defaultValue);
            this.distanceView.setSelectedValue(this.model.get('distanceSliderData').defaultValue);

            this.currentRadiusScale = this.model.get('radiusSliderData').defaultValue;
            this.currentDistanceScale = this.model.get('distanceSliderData').defaultValue;

            this._renderInitElements();
            this.paperScope.view.draw();

            $('#' + this.idPrefix + 'activity-area-2').css({
                'background-image': 'url("' + this.filePath.getImagePath('activity-area') + '")'
            });

            // Bind function on change of sine/cosine values
            this.model.on('change:trignometricFunction', $.proxy(this.trigFunctionChange, this));

        },

        /**
        * Backbone property for binding events to DOM elements.
        * @property events
        * @private
        */
        events: {
            'mousedown .rotate-animation-canvas': '_activatePaperScope',

        },


        /**
        * _setupPaperScope sets up the paper-scope.
        * @method _setupPaperScope
        * @private
        */
        _setupPaperScope: function () {
            var paperScope = new paper.PaperScope();
            paperScope.setup(this._canvasID);
            this.paperScope = paperScope;
        },


        /**
        * Render initial circle 
        * @method _renderInitElements
        * @private
        */
        _renderInitElements: function () {

            this._activatePaperScope();

            // Drawing Outer white circle
            if (this._circle) {
                this._circle.remove();
            }
            this._circle = new this.paperScope.Path.Circle({
                radius: this._radius,
                position: this.centerPoint,
                strokeColor: modelClass.CENTER_CIRCLE_COLOR,
                strokeWidth: modelClass.OUTER_CIRCLE_STROKE_WIDTH

            });
            this.paperScope.project.activeLayer.insertChild(2, this._circle);

            // Drawing Center filled circle
            if (this._centerCircle) {
                this._centerCircle.remove();
            }
            this._centerCircle = this.paperScope.Path.Circle({
                radius: modelClass.CENTER_CIRCLE_RADIUS,
                position: { x: this.centerPoint.x, y: this.centerPoint.y },
                fillColor: modelClass.CENTER_CIRCLE_COLOR,
                shadowColor: modelClass.DRAG_CIRCLE_DATA.SHADOW_COLOR,
                shadowBlur: modelClass.DRAG_CIRCLE_DATA.SHADOW_BLUR,
                opacity: 0.93
            });
            this._centerCircle.shadowOffset = new this.paperScope.Point([2, 2]),

            this.$el.find('#' + this.idPrefix + 'equation-container').css('visibility', 'hidden');
        },


        /**
        * Render handle and Plane to their respective position, draw circle and radius.
        * @method _renderElements
        * @private
        */
        _renderElements: function (initVectAngle) {

            var dragItemPos = {};
            dragItemPos.x = this.centerPoint.x + this._radius * Math.cos((initVectAngle) * Math.PI / 180);
            dragItemPos.y = this.centerPoint.y + this._radius * Math.sin((initVectAngle) * Math.PI / 180);

            this._dragHandle = this.paperScope.Path.Circle({
                radius: modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS,
                position: dragItemPos
            });

            if (this.isAccessible()) {
                this.drawFocusRect(dragItemPos, 0);
            }
            this._dragHandleDummy = this.paperScope.Path.Circle({
                radius: modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS,
                position: dragItemPos
            });

            // Set base
            this.baseAngleValue = 360 / this.showPointsCount;
            this._renderInitElements();

            // Radius Line to draw for only sin/tan
            if (!this.trignometricFunction.Cos) {
                this._radiusLine = this.paperScope.Path.Line(this.centerPoint, dragItemPos);
                this._radiusLine.strokeColor = modelClass.RADIUS_LINE_COLOR;
                this._radiusLine.strokeWidth = modelClass.RADIUS_LINE_WIDTH;
                this.paperScope.project.activeLayer.insertChild(3, this._radiusLine);
            }

            // Radial Group
            this._createRadialGroup();

            this.$el.find('#' + this.idPrefix + 'equation-container').css('visibility', 'visible');

            // Radius Vector of Drag
            this._radiusVector = new this.paperScope.Point(this.centerPoint).subtract(new this.paperScope.Point(dragItemPos));

            // Draggable point
            this._drawDraggablePoint(dragItemPos);
            this.dragItemPos = dragItemPos;

            // Bind events to rotate draggable point on circumference of outer circle
            this._bindCanvasEvents();
            this.renderElements = true;

            // bubble Group initialize
            this.bubbleGroup = new this.paperScope.Group();

            this._renderDiameter();
        },


        drawFocusRect: function drawFocusRect(dragHandle, opacity) {

            if (this.graphingFocusRect) {
                this.graphingFocusRect.remove();
            }
            //var dragItemPos = {};
            //dragItemPos.x = this.centerPoint.x + this._radius * Math.cos((initVectAngle) * Math.PI / 180);
            //dragItemPos.y = this.centerPoint.y + this._radius * Math.sin((initVectAngle) * Math.PI / 180);


            var strokeColor = MathInteractives.Common.Interactivities.TrignometricGraphing.Models.ExploreTrignometricGraphing.FOCUS_RECT_COLOR,
                    strokeWidth = MathInteractives.Common.Interactivities.TrignometricGraphing.Models.ExploreTrignometricGraphing.FOCUS_RECT_STROKE_WIDTH,
                    style = {
                        strokeColor: strokeColor,
                        dashArray: [2, 2],
                        strokeWidth: strokeWidth
                    }


            this.graphingFocusRect = new this.paperScope.Path.Rectangle(new this.paperScope.Point(dragHandle.x - 12, dragHandle.y - 12), this._dragHandle.bounds.height + 6, this._dragHandle.bounds.width + 6);
            this.graphingFocusRect.style = style;
            this.graphingFocusRect.opacity = opacity;
            this.graphingFocusRect.insertAbove(this._dragHandle);
        },


        /**
        * Render horizontal diameter line in circle
        * @method _renderDiameter
        * @private
        */
        _renderDiameter: function () {

            // Diamter line drawing from 0 to π

            var pointA, PointB;

            if (this.trignometricFunction.Tan) {
                pointA = { x: this.centerPoint.x - 185, y: this.centerPoint.y };
                pointB = { x: this.centerPoint.x + 275, y: this.centerPoint.y };
            }
            else {
                pointA = { x: this.centerPoint.x - this._radius, y: this.centerPoint.y };
                pointB = { x: this.centerPoint.x + this._radius, y: this.centerPoint.y };
            }


            if (this.diameterLine) {
                this.diameterLine.remove();
            }

            this.diameterLine = this.paperScope.Path.Line(pointB, pointA);
            this.diameterLine.strokeColor = modelClass.VISIBLE_DIAMETER_LINE_COLOR;
            this.diameterLine.strokeWidth = modelClass.VISIBLE_DIAMETER_LINE_WIDTH;
            this.diameterLine.opacity = 0.2;
            this.diameterLine.dashArray = [10, 4];
            this.paperScope.project.activeLayer.insertChild(1, this.diameterLine);
        },


        /**
        * Render Sliders & initial radius & distance multiplier values in dom elements
        * @method _renderSliders
        * @private
        */
        _renderSliders: function () {


            var radiusSliderData = this.model.get('radiusSliderData'), distanceSliderData = this.model.get('distanceSliderData')

            var radiusOptions = {
                'containerId': 'radius-slider-container',
                'sliderId': 'radius-slider',
                'screenId': 'slider-1-text-screen',
                'filePath': this.filePath,
                'idPrefix': this.idPrefix,
                'player': this.player,
                'selectedValue': radiusSliderData.defaultValue,
                'manager': this.manager,
                'minValue': radiusSliderData.minValue,
                'maxValue': radiusSliderData.maxValue,
                'step': radiusSliderData.stepValue,
                'labelType': MathInteractives.Common.Components.Theme2.Models.Slider.LABEL_TYPE.MIN_MAX,
                'colorType': MathInteractives.Common.Components.Theme2.Models.Slider.COLOR_TYPE.CUSTOM,
                'tabIndex': 900
            };
            this.radiusView = MathInteractives.global.Theme2.Slider.generateSlider(radiusOptions);

            this.radiusView.on(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.VALUE_CHANGE, $.proxy(function (value, labelClick) { this._radiusChange(value); this._updateRadiusDomValue(value); }, this));
            this.radiusView.on(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.SLIDE, $.proxy(function (event, ui, value) { this._radiusChange(value); this._updateRadiusDomValue(value); }, this));
            if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                this.$el.find('#' + this.idPrefix + radiusOptions.sliderId + '-handle').off('mouseover.trig-graph').on('mouseover.trig-graph', $.proxy(this._sliderHandleOver, this));
                this.$el.find('#' + this.idPrefix + radiusOptions.sliderId + '-handle').off('mouseleave.trig-graph').on('mouseleave.trig-graph', $.proxy(this._sliderHandleOut, this));
            }


            var distanceOptions = {
                'sliderId': 'distance-slider',
                'filePath': this.filePath,
                'containerId': 'distance-slider-container',
                'screenId': 'slider-2-text-screen',
                'idPrefix': this.idPrefix,
                'player': this.player,
                'manager': this.manager,
                'selectedValue': distanceSliderData.defaultValue,
                'minValue': distanceSliderData.minValue,
                'maxValue': distanceSliderData.maxValue,
                'step': distanceSliderData.stepValue,
                'labelType': MathInteractives.Common.Components.Theme2.Models.Slider.LABEL_TYPE.MIN_MAX,
                'colorType': MathInteractives.Common.Components.Theme2.Models.Slider.COLOR_TYPE.CUSTOM,
                'tabIndex': 920
            };

            this.distanceView = MathInteractives.global.Theme2.Slider.generateSlider(distanceOptions);

            this.distanceView.on(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.VALUE_CHANGE, $.proxy(function (value, labelClick) {
                this._distMultiplierChange(value);
                this._updateDistanceMultDomValue(value);
            }, this));
            this.distanceView.on(MathInteractives.Common.Components.Theme2.Models.Slider.EVENTS.SLIDE, $.proxy(function (event, ui, value) {
                this._distMultiplierChange(value);
                this._updateDistanceMultDomValue(value);
            }, this));

            if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                this.$el.find('#' + this.idPrefix + distanceOptions.sliderId + '-handle').off('mouseover.trig-graph').on('mouseover.trig-graph', $.proxy(this._sliderHandleOver, this));
                this.$el.find('#' + this.idPrefix + distanceOptions.sliderId + '-handle').off('mouseleave.trig-graph').on('mouseleave.trig-graph', $.proxy(this._sliderHandleOut, this));
            }

            this.mathJaxOutput(modelClass.INITIAL_ANGLE, distanceOptions.selectedValue, radiusOptions.selectedValue);

            this._updateRadiusDomValue(radiusSliderData.defaultValue);
            this._updateDistanceMultDomValue(distanceSliderData.defaultValue);

            this.$el.find('#' + this.idPrefix + 'dummy-drag-help').css({ left: this.centerPoint.x + this._radius + 15 });

        },


        /**
       * Initializes accessibility
       *
       * @method _initAccessibility
       * @private
       */
        _initAccessibility: function () {
            var canvasAccOption = {
                canvasHolderID: this.idPrefix + 'rotate-animation-acc-container',
                paperItems: [],
                paperScope: this.paperScope,
                manager: this.manager,
                player: this.player
            };

            this.canvasAcc = MathInteractives.global.CanvasAcc.intializeCanvasAcc(canvasAccOption);
            this.canvasAcc.updatePaperItems(this.getPaperObjects());

            //console.log(canvasAccOption.paperItems);
        },

        _updateActivityAreaText: function _updateActivityAreaText(unitOrHandleCirlceMsgId) {
            if (unitOrHandleCirlceMsgId === undefined || unitOrHandleCirlceMsgId === null) {
                unitOrHandleCirlceMsgId = 0;
            }

            if (this.trignometricFunction.Sine) {
                this.changeAccMessage('graphing-tab-activity-acc-container', unitOrHandleCirlceMsgId, [this.getMessage('drop-down-trignometric-labels', 0)]);
            }
            else if (this.trignometricFunction.Cos) {
                this.changeAccMessage('graphing-tab-activity-acc-container', unitOrHandleCirlceMsgId, [this.getMessage('drop-down-trignometric-labels', 1)]);
            }
            else {
                this.changeAccMessage('graphing-tab-activity-acc-container', unitOrHandleCirlceMsgId);
            }
        },

        /**
        * Gets all current paper objects on canvas
        *     
        * @method getPaperObjects
        * return {Array} [paperObj] array of paper objects
        **/
        getPaperObjects: function () {
            var currSegment,
                paperObj = [];
            paperObj.push(this._dragHandle);
            //paperObj.push(this.rotatingCircle.bubbleGroup);

            return paperObj;

        },

        /**
       * bind listeners to accessibility
       *
       * @method _bindAccessibilityListeners
       * @private
       */
        _bindAccessibilityListeners: function () {
            var keyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                //canvasEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_EVENTS,
                $canvasHolder = $('#' + this.idPrefix + 'rotate-animation-acc-container');

            $canvasHolder.off(keyEvents.ROTATE_CLOCKWISE).on(keyEvents.ROTATE_CLOCKWISE, $.proxy(this.rotateClockWise, this));
            $canvasHolder.off(keyEvents.ROTATE_ANTI_CLOCKWISE).on(keyEvents.ROTATE_ANTI_CLOCKWISE, $.proxy(this.rotateAntiClockWise, this));
        },

        rotateClockWise: function rotateClockWise(event, data) {

            //this._rotatingCircleGroup.trigger('mousedrag');

            var item = data.item,
                step = 360 / parseInt(this.comboBoxView.model.get('selectedOptionData')),
                endPoint = false,
                    tempAngle = this.accCurrentAngle - step;

            if (tempAngle <= -360) {
                var currAngle = this.readAngleMessage(-360) + ' ' + this.getAccMessage('rotate-animation-acc-container', 12);
                this.setAccMessage('rotate-animation-acc-container', currAngle, 0);
                endPoint = true;
            }
            if (this.accCurrentAngle > -360) {
                var angleToMove = this.angleToMove / 2, cnt = 0;
                while (cnt < 2) {
                    this._dragHandleDummy.rotate(angleToMove, this.centerPoint);
                    this._rotatingCircleGroup.rotate(angleToMove, this.centerPoint);
                    event.target = item;
                    event.target.name = item.name;
                    event.event = event;
                    event.event.which = 1;
                    event.point = this._dragHandleDummy.position;
                    this._rotatingCircleGroup.trigger('mousedown', event);
                    this._rotatingCircleGroup.trigger('mousedrag', event);
                    this.accCurrentAngle = this.accCurrentAngle - angleToMove;
                    cnt++;
                }
                if (!endPoint) {
                    this.readAngleMessage(this.accCurrentAngle);
                }
            }

        },
        rotateAntiClockWise: function rotateAntiClockWise(event, data) {
            var item = data.item,
                step = 360 / parseInt(this.comboBoxView.model.get('selectedOptionData')),
                endPoint = false
            tempAngle = this.accCurrentAngle + step;
            if (tempAngle >= 360) {
                var currAngle = this.readAngleMessage(360) + ' ' + this.getAccMessage('rotate-animation-acc-container', 13);
                this.setAccMessage('rotate-animation-acc-container', currAngle, 0);
                endPoint = true;
            }

            if (this.accCurrentAngle < 360) {
                var angleToMove = this.angleToMove / 2, cnt = 0;
                while (cnt < 2) {
                    this._dragHandleDummy.rotate(-angleToMove, this.centerPoint);
                    this._rotatingCircleGroup.rotate(-angleToMove, this.centerPoint);
                    event.target = item;
                    event.target.name = item.name;
                    event.event = event;
                    event.event.which = 1;
                    event.point = this._dragHandleDummy.position;
                    this._rotatingCircleGroup.trigger('mousedown', event);
                    this._rotatingCircleGroup.trigger('mousedrag', event);
                    this.accCurrentAngle = this.accCurrentAngle + angleToMove;
                    cnt++;
                }
                if (!endPoint) {
                    this.readAngleMessage(this.accCurrentAngle);
                }
            }

        },

        setDefaultAcc: function setDefaultAcc(event) {

            var keycode = (event.keycode) ? event.keycode : event.which;

            if (keycode === 32) {
                this.graphingFocusRect.opacity = 1;
                this.readAngleMessage(this.accCurrentAngle);
                //this.changeAccMessage('rotate-animation-acc-container', 11);
            }
            if (keycode === 9) {
                this.graphingFocusRect.opacity = 0;
                var currAngle = this.getAccMessage('rotate-animation-acc-container', 11) + ' ' + this.readAngleMessage(this.accCurrentAngle);
                this.setAccMessage('rotate-animation-acc-container', currAngle, 0);
                this.paperScope.view.draw();
            }

        },


        readAngleMessage: function readAngleMessage(angle) {

            var angleRadian = classNameTab1.GET_ANGLE_IN_RADIANS(angle, true),
                numerator = angleRadian.numerator, denominator = angleRadian.denominator, lineValue;

            fractionSeperator = numerator.replace('π', '');
            lineValue = [fractionSeperator, denominator];

            if (numerator === '0') {
                this.changeAccMessage('rotate-animation-acc-container', 4, lineValue); // pass current angle
                return this.getAccMessage('rotate-animation-acc-container', 4, lineValue);
            }
            else if (fractionSeperator === '') {
                lineValue[0] = denominator;
                if (lineValue[0] === '') {
                    this.changeAccMessage('rotate-animation-acc-container', 7, lineValue);
                    return this.getAccMessage('rotate-animation-acc-container', 7, lineValue);
                }
                else {
                    this.changeAccMessage('rotate-animation-acc-container', 5, lineValue);
                    return this.getAccMessage('rotate-animation-acc-container', 5, lineValue);
                }
            }
            else if (fractionSeperator === '-') {

                if (lineValue[1] === '') {
                    this.changeAccMessage('rotate-animation-acc-container', 9, lineValue);
                    return this.getAccMessage('rotate-animation-acc-container', 9, lineValue);
                }
                else {
                    lineValue[0] = denominator;
                    this.changeAccMessage('rotate-animation-acc-container', 10, lineValue);
                    return this.getAccMessage('rotate-animation-acc-container', 10, lineValue);
                }
            }
            else {
                lineValue[1] = denominator;
                if (lineValue[1] === '') {
                    this.changeAccMessage('rotate-animation-acc-container', 8, lineValue);
                    return this.getAccMessage('rotate-animation-acc-container', 8, lineValue);
                }
                else {
                    numerator = fractionSeperator;
                    this.changeAccMessage('rotate-animation-acc-container', 6, lineValue);
                    return this.getAccMessage('rotate-animation-acc-container', 6, lineValue);
                }
            }
        },



        /**
        * Callback function on change of radius
        * @method _radiusChange
        * @private
        */
        _radiusChange: function (value) {

            var valueChanged = false,
                selectedRadius = value;

            if (this.renderElements) {
                if (this.currentRadiusScale !== selectedRadius) {
                    valueChanged = true;
                    this.currentRadiusScale = selectedRadius;
                    this._radius = this.originalRadius * this.currentRadiusScale;
                    this.resetData();
                    //this.trigger(namespace.ExploreTrignometricGraphing.RADIUS_CHANGE, event, { value: this.currentRadiusScale });
                }
            }
            else {
                this.currentRadiusScale = selectedRadius;
                this._radius = this.originalRadius * this.currentRadiusScale;
                this._renderInitElements();
                this._updateRadiusDomValue(this.currentRadiusScale);

            }

            this.trigger(namespace.ExploreTrignometricGraphing.RADIUS_CHANGE, { value: this.currentRadiusScale, valueChanged: valueChanged });
            this.paperScope.view.draw();
            MathInteractives.global.SpeechStream.stopReading();
            this.$el.find('#' + this.idPrefix + 'dummy-drag-help').css({ left: this.centerPoint.x + this._radius + 15 });
        },

        /**
        * Callback function on change of distance multiplier
        * @method _distMultiplierChange
        * @private
        */
        _distMultiplierChange: function (value) {

            var valueChanged = false;
            if (this.renderElements) {
                if (this.currentDistanceScale !== value) {
                    valueChanged = true;
                    this.currentDistanceScale = value;
                    this.resetData();
                    //this.trigger(namespace.ExploreTrignometricGraphing.DISTANCE_MULTIPLIER_CHANGE, event, { value: this.currentDistanceScale });
                }
            }
            else {
                if (this.currentDistanceScale !== value) {
                    this.currentDistanceScale = value;
                    this._updateDistanceMultDomValue(this.currentDistanceScale);
                }
            }

            this.trigger(namespace.ExploreTrignometricGraphing.DISTANCE_MULTIPLIER_CHANGE, { value: this.currentDistanceScale, valueChanged: valueChanged });
            MathInteractives.global.SpeechStream.stopReading();
        },


        /**
       * Callback function on change of drop down of show points
       * @method _showPointsChange
       * @private
       */
        _showPointsChange: function (event, selectedOptionData) {
            this.showPointsCount = Number(selectedOptionData);
            this.baseAngleValue = 360 / this.showPointsCount;
            this.angleToMove = 360 / this.showPointsCount;
            if (!this.renderElements && selectedOptionData !== '') {
                this.renderElements = true;
                this._renderElements();
                this.renderInitLabels();
                this._initAccessibility();
                this._bindAccessibilityListeners();
                this.$('#' + this.idPrefix + 'rotate-animation-acc-container-acc-elem').on('keydown', $.proxy(this.setDefaultAcc, this));
                this.enableTab('rotate-animation-acc-container', true);

            }

            if (selectedOptionData !== '') {
                this._updateActivityAreaText(1);
            }
            else {
                this._updateActivityAreaText(0);
            }

            this.resetData();
            this.trigger(namespace.ExploreTrignometricGraphing.SHOW_POINT_CHANGE, event, { value: this.showPointsCount });
            MathInteractives.global.SpeechStream.stopReading();

        },



        /**
        * Function to change trignometric Function sine/cos
        * @method trigFunctionChange
        * @private
        */
        trigFunctionChange: function (event) {

            this._activatePaperScope();
            this.trignometricFunction = this.model.get('trignometricFunction');
            if (this.renderElements) {

                this.resetData();
                this._changeLineColor();
            }
        },

        /**
        * Function to change color of Drag item & lines in circle
        * @method _changeLineColor
        * @private
        */
        _changeLineColor: function () {
            var color;
            if (this.trignometricFunction.Sine) {
                this._drawSinCosLine(modelClass.SINE_LINE_DRAG_COLOR);
                color = modelClass.SIN_GRADIENT
            }
            else if (this.trignometricFunction.Cos) {
                this._drawSinCosLine(modelClass.COS_LINE_DRAG_COLOR);
                color = modelClass.COS_GRADIENT
            }
            else {
                this._drawSinCosLine(modelClass.TAN_LINE_DRAG_COLOR);
                color = modelClass.TAN_GRADIENT
            }

            var fillColor = {
                gradient: {
                    stops: color
                },
                origin: [this._dragCircle.position.x, this._dragCircle.position.y - modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS],
                destination: [this._dragCircle.position.x, this._dragCircle.position.y + modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS]
            };

            this._dragCircle.fillColor = fillColor;
        },


        /**
        * Function to update radius value in dom element
        * @method _updateRadiusDomValue
        * @private
        */
        _updateRadiusDomValue: function (radius) {
            this.setMessage('radius-slider-value', radius);
        },


        /**
        * Function to update distance multiplier value in dom element
        * @method _updateDistanceMultDomValue
        * @private
        */
        _updateDistanceMultDomValue: function (currentDm) {

            this.setMessage('distance-slider-value', currentDm);
        },


        /**
        * Create combo boxes using common components
        * @method generateDropdown
        * @private
        */
        generateDropdown: function () {

            var showPointsArray = [], cnt = 0;

            while (this.getMessage('drop-down-show-points', cnt) !== null) {
                showPointsArray[cnt] = this.getMessage('drop-down-show-points', cnt);
                cnt++;
            }

            var comboOptions = {
                'player': this.player,
                'path': this.filePath,
                'idPrefix': this.idPrefix,
                'manager': this.manager,
                'screenId': 'graphing-points-combobox-screen',
                'containerId': 'show-points-select',
                'options': showPointsArray
            };

            var comboModel = new MathInteractives.Common.Components.Theme2.Models.Combobox(comboOptions);
            this.comboBoxView = new MathInteractives.Common.Components.Theme2.Views.Combobox({ el: '#' + comboOptions['idPrefix'] + comboOptions['containerId'], model: comboModel });

            this.comboBoxView.model.on('change:selectedOptionData', $.proxy(this._showPointsChange, this));

        },


        /**
        * Render radial group 
        * @method _createRadialGroup
        * @private
        */
        _createRadialGroup: function () {
            // Radial Group drawing

            var centrePoint = new this.paperScope.Point(this.centerPoint.x, this.centerPoint.y), index = null, radialline, centrePointClone,
                radiusGroup = new this.paperScope.Group();

            for (index = 0; index < this.showPointsCount; index++) {
                radialline = new this.paperScope.Path();
                centrePointClone = centrePoint.clone();
                radialline.add(centrePointClone);
                radialline.add(new this.paperScope.Point(centrePoint.x + this._radius, centrePoint.y));
                radialline.rotate(-this.baseAngleValue * index, centrePointClone);
                radiusGroup.addChild(radialline);
            }

            radiusGroup.visible = false;
            this.radialGroup = radiusGroup;
            // this.paperScope.project.activeLayer.insertChild(1, this.radialGroup);

        },


        /**
        * Renders point labels
        * @method renderLabels
        */
        renderLabels: function renderLabels() {

            var paperScope = this.paperScope,
                radialGroup = this.radialGroup,
                radialGroupChildren = radialGroup.children,
                noOfRadius = this.showPointsCount,
                radialGroupLength = radialGroup.children.length,
                circle = this._circle,
                LABEL_OFFSET = modelClass.LABEL_OFFSET,
                LABEL_OFFSET_HALF = LABEL_OFFSET / 2,
                labelCircle = null,
                currentRadius = null,
                labelTopLeftPoint = null,
                labelPoint = null,
                endPoint = null,
                index = null,
                labelDataArray = [],
                $canvasContainer = this.$('.circle-labels'),
                $fractionContainer = null,
                labelDataObject = null;

            this.$(modelClass.FRACTION_SELECTOR).remove();

            //labelCircle is the paper object used as reference for label placement.

            $canvasContainer.html('');

            labelCircle = new paperScope.Path.Circle(circle.bounds.getCenter(), this._radius + LABEL_OFFSET);

            for (index = 0; index < radialGroupLength; index++) {
                currentRadius = radialGroupChildren[index];

                // Get the div structure

                var angleRadian;
                if (this.rotatingDirection === 'clockwise') {
                    angleRadian = classNameTab1.GET_ANGLE_IN_RADIANS(index * 360 / this.showPointsCount, true);
                    if (index === 0) {
                        angleRadian = classNameTab1.GET_ANGLE_IN_RADIANS(360, true);
                    }
                }
                else {
                    angleRadian = classNameTab1.GET_ANGLE_IN_RADIANS(-(radialGroupLength - index) * 360 / this.showPointsCount, true);
                }

                $fractionContainer = classNameTab1.GET_FRACTION_DIV_STRUCTURE(angleRadian.numerator, angleRadian.denominator);

                // Get the end point of radius
                endPoint = currentRadius.lastSegment.point;

                // Get the point nearest to the circle from the endpoint
                labelPoint = labelCircle.getNearestPoint(endPoint);

                // Get the co-ordinates for the top left poent
                // i.e. the upper left corner of the label div
                labelTopLeftPoint = {
                    x: labelPoint.x - LABEL_OFFSET_HALF,
                    y: labelPoint.y - LABEL_OFFSET_HALF
                };

                $fractionContainer.css({
                    'top': labelTopLeftPoint.y,
                    'left': labelTopLeftPoint.x
                });

                if (angleRadian.denominator === '') {

                    $fractionContainer.css({
                        'margin-top': '-7px'
                    });
                }

                $canvasContainer.append($fractionContainer);
                labelDataObject = {
                    $div: $fractionContainer,
                    isOnCircle: false
                };
                labelDataArray.push(labelDataObject);
            }

            // remove reference the circle
            labelCircle.remove();

            return;
        },

        /**
        * Render 2 labels to the nearest point 0.
        * @method renderInitLabels
        */
        renderInitLabels: function renderInitLabels() {

            var angles = [this.baseAngleValue, -this.baseAngleValue], angleRadian, $canvasContainer = this.$('.circle-labels'),
                radialGroup = this.radialGroup,
                radialGroupChildren = radialGroup.children,
                radialGroupLength = radialGroup.children.length,
                labelCircle = null,
                currentRadius = null,
                labelTopLeftPoint = null,
                labelPoint = null,
                LABEL_OFFSET = modelClass.LABEL_OFFSET,
                LABEL_OFFSET_HALF = LABEL_OFFSET / 2,
                endPoint = null;
            var arrRadius = [1, radialGroupLength - 1];


            $canvasContainer.html('');
            labelCircle = new this.paperScope.Path.Circle(this.centerPoint, this._radius + LABEL_OFFSET);

            for (var i = 0; i < 2; i++) {

                currentRadius = radialGroupChildren[arrRadius[i]];

                angleRadian = classNameTab1.GET_ANGLE_IN_RADIANS(angles[i]);
                $fractionContainer = classNameTab1.GET_FRACTION_DIV_STRUCTURE(angleRadian.numerator, angleRadian.denominator);

                // Get the end point of radius
                endPoint = currentRadius.lastSegment.point;

                // Get the point nearest to the circle from the endpoint
                labelPoint = labelCircle.getNearestPoint(endPoint);

                // Get the co-ordinates for the top left poent
                // i.e. the upper left corner of the label div
                labelTopLeftPoint = {
                    x: labelPoint.x - LABEL_OFFSET_HALF,
                    y: labelPoint.y - LABEL_OFFSET_HALF
                };

                $fractionContainer.css({
                    'top': labelTopLeftPoint.y,
                    'left': labelTopLeftPoint.x
                });

                labelCircle.remove();
                $canvasContainer.append($fractionContainer);
            }

        },


        /**
        * Renders point labels
        * @method _drawDraggablePoint
        * @param dragItemPos text
        */
        _drawDraggablePoint: function (dragItemPos) {

            this._dragCircle = new this.paperScope.Path.Circle({
                radius: modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS,
                center: [dragItemPos.x, dragItemPos.y],
                shadowColor: modelClass.DRAG_CIRCLE_DATA.SHADOW_COLOR,
                shadowBlur: modelClass.DRAG_CIRCLE_DATA.SHADOW_BLUR,
                opacity: 0.93
            });


            var color;
            if (this.trignometricFunction.Sine) {
                color = modelClass.SIN_GRADIENT
            }
            else if (this.trignometricFunction.Cos) {
                color = modelClass.COS_GRADIENT
            }
            else {
                //Tan
                color = modelClass.TAN_GRADIENT
            }

            var fillColor = {
                gradient: {
                    stops: color
                },
                origin: [dragItemPos.x, dragItemPos.y - modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS],
                destination: [dragItemPos.x, dragItemPos.y + modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS]
            };


            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                this._dummyDragCircle = new this.paperScope.Path.Circle({
                    radius: modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS * modelClass.DRAG_DUMMY_CIRCLE_RADIUS_SCALE,
                    center: [dragItemPos.x, dragItemPos.y],
                    opacity: 0.01,
                    fillColor: '#FFFFFF'
                });
                this._rotatingCircleGroup = new this.paperScope.Group([this._dummyDragCircle, this._dragCircle]);
            }
            else {
                this._rotatingCircleGroup = this._dragCircle;
            }

            this._dragCircle.fillColor = fillColor;
            this._dragCircle.shadowOffset = new this.paperScope.Point([2, 2]),
            this.paperScope.project.activeLayer.insertChild(5, this._rotatingCircleGroup);
            this.trigger(namespace.ExploreTrignometricGraphing.CHANGE_ANGLE, 0, true);
        },


        /**
        * Bind Tool Events
        * @method _bindRotateToolEvents
        * @private
        */
        _bindRotateToolEvents: function () {
            var self = this, radiusVector, radiusLength = this._radius,
                conditionFirst = false, conditionSecond = false,
                initDragPos = self.dragItemPos,
                canvasKeyEvents = MathInteractives.Common.Player.Models.CanvasAcc.CANVAS_KEY_EVENTS;

            //var $sineBarVal = this.$el.find('.sine-bar-value');

            self.mouseLeftClick = false,

            this._radiusVector = new this.paperScope.Point(this.dragItemPos).subtract(new this.paperScope.Point(this.centerPoint));

            this._rotatingCircleGroup.on({
                mousedrag: function (event) {

                    //self._rotatePlane(event);
                    if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile && (event.event.which == 1 || event.event.which == 0)) {
                        self.$('.rotate-animation-canvas').css({ 'cursor': 'url("' + self.filePath.getImagePath('closed-hand') + '"), move' });
                    }
                    if (self.mouseLeftClick && (event.event.which == 1 || event.event.which == 0)) {

                        MathInteractives.global.SpeechStream.stopReading();

                        self.colorChange = false;
                        var varX = self.centerPoint.x,
                        varY = self.centerPoint.y,
                        newY = null,
                        newX = null,
                        _vector = null,
                        vectorAngle = null;

                        _vector = new self.paperScope.Point(varX, varY).subtract(new self.paperScope.Point(event.point.x, event.point.y));
                        vectorAngle = 180 + Math.round(_vector.angle);
                        self._allowRotate();

                        newX = varX + self._radius * Math.cos((vectorAngle) * Math.PI / 180);
                        newY = varY + self._radius * Math.sin((vectorAngle) * Math.PI / 180);

                        var newVect = new self.paperScope.Point(varX, varY).subtract(new self.paperScope.Point(newX, newY));
                        var newFlightAngle = newVect.angle + 180;


                        if (self.previousAngle !== null) {
                            if (self.previousAngle < -90 && (newFlightAngle - 180 >= 0)) {
                                self.condition = 1;
                                conditionFirst = true;

                            }
                            else if (self.previousAngle > 90 && (newFlightAngle - 180 <= 0)) {

                                self.condition = 2;
                                conditionSecond = true;

                            }
                            else if (self.previousAngle < -90 && (newFlightAngle >= 0 && newFlightAngle < 90) && self.condition !== null) {
                                if (conditionFirst === true) {
                                    if (self.previousAngle > -360) {
                                        self.condition = null;
                                        conditionFirst = false;
                                    }
                                }
                            }
                            else if (self.previousAngle > 90 && (newFlightAngle > 270 || newFlightAngle === 0) && self.condition !== null) {
                                if (conditionSecond === true) {
                                    if (self.previousAngle < 360) {
                                        self.condition = null;
                                        conditionSecond = false;
                                    }
                                }
                            }
                        }
                        else {
                            if (self.initialFlightAngle - newFlightAngle > 300 || self.initialFlightAngle - newFlightAngle < -300) {
                                newFlightAngle = 360 + (self.initialFlightAngle - newFlightAngle);
                            }
                        }

                        if (self.condition === 1) {
                            newFlightAngle -= 360;
                        }
                        else if (self.condition === 2) {
                            newFlightAngle = 360 + newFlightAngle;
                        }

                        var angleValue = Math.round(self.initialFlightAngle - newFlightAngle);


                        if (self.lastAngle - angleValue > 210) {
                            self.blockRotation = true;
                        }

                        if (angleValue > 0 && angleValue < 270 && self.currentAngle === 360) {
                            self.blockRotation = true;
                        }
                        if (self.blockRotation === true) {
                            self.allowRotation = false;
                            self.trigger(namespace.ExploreTrignometricGraphing.CHANGE_ANGLE, 360, true);
                            self._dragCircle.position.x = self.centerPoint.x + self._radius * Math.cos((-360) * Math.PI / 180);
                            self._dragCircle.position.y = self.centerPoint.y + self._radius * Math.sin((-360) * Math.PI / 180);
                            self._dragHandle.position = self._dragCircle.position;
                            if (!self.trignometricFunction.Cos) {
                                self._radiusLine.removeSegments(1);
                                self._radiusLine.add(self._dragCircle.position);
                            }
                            self._drawSinCosLine(modelClass.SIN_VERTICAL_LINE_COLOR);
                            self.drawImposedCircle(360);
                            self._drawBubbles(360, false);
                            self.currentAngle = 360;
                            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                                self._dummyDragCircle.position = self._dragCircle.position;
                            }
                            self.mathJaxOutput(360, self.currentDistanceScale, self.currentRadiusScale);
                            self._changeLineColor();
                            if (self.isAccessible()) {
                                self.drawFocusRect(self._dragHandle.position, 1);
                            }

                            return;
                        }

                        self.lastAngle = angleValue;

                        if (self.allowRotation === false) {
                            return;
                        }


                        self.previousAngle = newFlightAngle - 180;

                        self._dragHandle.position = new self.paperScope.Point(newX, newY);
                        self._radiusVector = new self.paperScope.Point(self.centerPoint.x, self.centerPoint.y).subtract(new self.paperScope.Point(self._dragHandle.position.x, self._dragHandle.position.y));

                        /*------------------------------------------------------------------*/




                        if (angleValue >= 360 || angleValue <= -360) {


                            if (angleValue >= 360) {
                                self.positiveFullArc = true;
                                self.allowRotation = false;
                                self.drawImposedCircle(360);

                            } else {
                                self.negativeFullArc = true;
                                self.allowRotation = false;


                                self._dragCircle.position.x = self.centerPoint.x + self._radius * Math.cos((360) * Math.PI / 180);
                                self._dragCircle.position.y = self.centerPoint.y + self._radius * Math.sin((360) * Math.PI / 180);
                                self._dragHandle.position = self._dragCircle.position;
                                if (!self.trignometricFunction.Cos) {
                                    self._radiusLine.removeSegments(1);
                                    self._radiusLine.add(self._dragCircle.position);
                                }
                                self._drawSinCosLine(modelClass.SIN_VERTICAL_LINE_COLOR);

                                self.trigger(namespace.ExploreTrignometricGraphing.CHANGE_ANGLE, -360, true);
                                self.drawImposedCircle(-360);
                                self._drawBubbles(-360, false);
                                self.currentAngle = -360;
                                if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                                    self._dummyDragCircle.position = self._dragCircle.position;
                                }
                            }

                        }
                        else {

                            self._dragCircle.position = self._dragHandle.position;

                            if (!self.trignometricFunction.Cos) {
                                self._radiusLine.removeSegments(1);
                                self._radiusLine.add(self._dragCircle.position);
                            }

                            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                                self._dummyDragCircle.position = self._dragCircle.position;
                            }

                            self.currentAngle = angleValue;

                            if (self.trignometricFunction.Sine) {
                                self._drawSinCosLine(modelClass.SIN_VERTICAL_LINE_COLOR);
                            }
                            else if (self.trignometricFunction.Cos) {
                                self._drawSinCosLine(modelClass.COS_VERTICAL_LINE_COLOR);
                            }
                            else {
                                self._drawSinCosLine(modelClass.TAN_VERTICAL_LINE_COLOR);
                            }


                            var fillColor = {
                                gradient: {
                                    stops: modelClass.DEFAULT_GRADIENT
                                },
                                origin: [self._dragCircle.position.x, self._dragCircle.position.y - modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS],
                                destination: [self._dragCircle.position.x, self._dragCircle.position.y + modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS]
                            };

                            self._dragCircle.fillColor = fillColor;



                            if (self.rotatingDirection === '') {
                                if (angleValue > modelClass.ANGLE_MARGIN_TO_DROP) {
                                    self.rotatingDirection = 'clockwise';
                                    self.renderLabels();
                                }
                                else if (angleValue < -(modelClass.ANGLE_MARGIN_TO_DROP)) {
                                    self.rotatingDirection = 'anticlockwise';
                                    self.renderLabels();
                                }
                                else {
                                    self.rotatingDirection = '';
                                    self.renderInitLabels();
                                }

                            }
                            else {
                                if (angleValue > modelClass.ANGLE_MARGIN_TO_DROP && self.rotatingDirection === 'anticlockwise') {
                                    self.rotatingDirection = 'clockwise';
                                    self.renderLabels();
                                }
                                else if (angleValue < -(modelClass.ANGLE_MARGIN_TO_DROP) && self.rotatingDirection === 'clockwise') {
                                    self.rotatingDirection = 'anticlockwise';
                                    self.renderLabels();
                                }

                                if (angleValue <= modelClass.ANGLE_MARGIN_TO_DROP && angleValue >= -(modelClass.ANGLE_MARGIN_TO_DROP)) {
                                    self.rotatingDirection = '';
                                    self.renderInitLabels();
                                }
                            }

                        }

                        self.drawImposedCircle(angleValue);

                        if (self.currentAngle !== 0) {

                            maxVisitedAngle = 0;
                            self._drawBubbles(maxVisitedAngle, true);

                            var angleValue = self.currentAngle;
                            if (Math.abs((self.currentAngle % self.baseAngleValue)) < modelClass.ANGLE_MARGIN_TO_DROP || Math.abs((self.currentAngle % self.baseAngleValue)) > (self.baseAngleValue - modelClass.ANGLE_MARGIN_TO_DROP)) {

                                if (Math.abs((angleValue % self.baseAngleValue)) < modelClass.ANGLE_MARGIN_TO_DROP) {
                                    angleValue = angleValue - Math.abs((angleValue % self.baseAngleValue));
                                }
                                else {
                                    angleValue = angleValue + (self.baseAngleValue - Math.abs((angleValue % self.baseAngleValue)));
                                }

                                self.colorChange = true;
                                self._changeLineColor();
                            }

                            var point = parseInt((angleValue / self.baseAngleValue), 10),
                                angle = point * self.baseAngleValue;




                            if (self.maxVisiblePoint !== point) {
                                self.maxVisiblePoint = point;
                                self.mathJaxOutput(angle, self.currentDistanceScale, self.currentRadiusScale);
                            }

                        }
                        else {
                            self.colorChange = true;
                            self._changeLineColor();
                            self.bubbleGroup.removeChildren();
                        }

                        if (self.currentAngle < 360 && self.currentAngle > -360) {
                            if (self.currentAngle !== self.previousSavedAngle && self.firstDrag === false) {
                                // If it trigonometric function is tan
                                // and it is a canvas key event
                                // then we trigger an extra event so that the graph tool can plot a curve till actual value.
                                if (self.trignometricFunction.Tan
                                &&
                                (event.type === canvasKeyEvents.ROTATE_CLOCKWISE || event.type === canvasKeyEvents.ROTATE_ANTI_CLOCKWISE)
                                ) {

                                    self.trigger(namespace.ExploreTrignometricGraphing.CHANGE_ANGLE, self.currentAngle - 1, self.colorChange);
                                }
                                self.trigger(namespace.ExploreTrignometricGraphing.CHANGE_ANGLE, self.currentAngle, self.colorChange);

                            }
                            if (self.firstDrag) {
                                self.trigger(namespace.ExploreTrignometricGraphing.CHANGE_ANGLE, 0, true);
                                self.firstDrag = false;
                            }
                            self.previousSavedAngle = self.currentAngle;
                        }

                    }
                    if (self.isAccessible()) {
                        self.drawFocusRect(self._dragHandle.position, 1);
                    }
                },
                mouseenter: function (event) {
                    self.handCursorFlag = true;
                    if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                        self.$('.rotate-animation-canvas').css({ 'cursor': 'url("' + self.filePath.getImagePath('open-hand') + '"), move' });
                        if (!self.player.getModalPresent()) {
                            self.dragHandleOver();
                        }
                    }
                },
                mouseleave: function (event) {
                    self.handCursorFlag = false;
                    self.$('.rotate-animation-canvas').css({ 'cursor': 'default' });
                    self.dragHandleOut();
                },
                mousedown: function (event) {
                    if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                        if (event.event.which === 1) {
                            self.mouseLeftClick = true;
                        }
                    }
                    else {
                        self.mouseLeftClick = true;
                        event.preventDefault();
                    }

                },
                mouseup: function (event) {
                    self.mouseLeftClick = false;
                }
            });
        },



        _sliderHandleOver: function (event) {
            if (!$(event.currentTarget).hasClass('color-type-custom-handle_hover')) {
                $(event.currentTarget).addClass('color-type-custom-handle_hover');
            }
        },

        _sliderHandleOut: function (event) {
            if ($(event.currentTarget).hasClass('color-type-custom-handle_hover')) {
                $(event.currentTarget).removeClass('color-type-custom-handle_hover');
            }
        },


        dragHandleOver: function () {
            var color, self = this;

            if (Math.abs((self.currentAngle % self.baseAngleValue)) < modelClass.ANGLE_MARGIN_TO_DROP || Math.abs((self.currentAngle % self.baseAngleValue)) > (self.baseAngleValue - modelClass.ANGLE_MARGIN_TO_DROP)) {
                if (this.trignometricFunction.Sine) {
                    color = modelClass.SIN_GRADIENT_HOVER;
                }
                else if (this.trignometricFunction.Cos) {
                    color = modelClass.COS_GRADIENT_HOVER;
                }
                else {
                    color = modelClass.TAN_GRADIENT_HOVER;
                }
            }
            else {
                color = modelClass.DEFAULT_GRADIENT_HOVER;
            }

            var fillColor = {
                gradient: {
                    stops: color
                },
                origin: [this._dragCircle.position.x, this._dragCircle.position.y - modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS],
                destination: [this._dragCircle.position.x, this._dragCircle.position.y + modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS]
            };

            this._dragCircle.fillColor = fillColor;
        },


        dragHandleOut: function () {
            var color, self = this;

            if (Math.abs((self.currentAngle % self.baseAngleValue)) < modelClass.ANGLE_MARGIN_TO_DROP || Math.abs((self.currentAngle % self.baseAngleValue)) > (self.baseAngleValue - modelClass.ANGLE_MARGIN_TO_DROP)) {
                if (this.trignometricFunction.Sine) {
                    color = modelClass.SIN_GRADIENT;
                }
                else if (this.trignometricFunction.Cos) {
                    color = modelClass.COS_GRADIENT;
                }
                else {
                    color = modelClass.TAN_GRADIENT;
                }
            }
            else {
                color = modelClass.DEFAULT_GRADIENT;
            }

            var fillColor = {
                gradient: {
                    stops: color
                },
                origin: [this._dragCircle.position.x, this._dragCircle.position.y - modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS],
                destination: [this._dragCircle.position.x, this._dragCircle.position.y + modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS]
            };

            this._dragCircle.fillColor = fillColor;
        },




        /**
      * Function to imposed circle while dragging item
      * @method drawImposedCircle   
      */
        drawImposedCircle: function (angleValue) {

            /*********** Arc ***********************/

            if (angleValue < -(modelClass.ANGLE_MARGIN_TO_DROP)) {
                if (angleValue > this.maxVisitedImposedNeg) {
                    angleValue = this.maxVisitedImposedNeg;
                }
                else {
                    this.maxVisitedImposedNeg = angleValue;
                }
            }
            else if (angleValue > modelClass.ANGLE_MARGIN_TO_DROP) {
                if (angleValue < this.maxVisitedImposedPos) {
                    angleValue = this.maxVisitedImposedPos;
                }
                else {
                    this.maxVisitedImposedPos = angleValue;
                }
            }

            if (angleValue > 358) {
                angleValue = 358;
            }
            if (angleValue < -358) {
                angleValue = -358;
            }

            var newX = this.centerPoint.x + this._radius * Math.cos((-angleValue) * Math.PI / 180),
            newY = this.centerPoint.y + this._radius * Math.sin((-angleValue) * Math.PI / 180);


            var from, to, through, nearY = 1, self = this;

            if (self.rotatingDirection === 'clockwise') {
                nearY = -1;
            }

            if (self.imposedCircle) {
                self.imposedCircle.remove();
            }

            from = new self.paperScope.Point((self.centerPoint.x + self._radius), self.centerPoint.y);
            to = new self.paperScope.Point(newX, newY);
            through = (self.centerPoint.x >= newX + self._radius) ?
                     self._circle.getNearestPoint(new self.paperScope.Point(self.centerPoint.x, self.centerPoint.y + self._radius * nearY)) :
                     self._circle.getNearestPoint(new self.paperScope.Point((from.x + to.x) / 2, (from.y + to.y) / 2));


            if (self.rotatingDirection === 'clockwise') {
                if (angleValue > 95) {
                    through = new self.paperScope.Point((self.centerPoint.x), (self.centerPoint.y - self._radius));

                }
            }
            else {
                if (angleValue < -95) {
                    through = new self.paperScope.Point((self.centerPoint.x), (self.centerPoint.y + self._radius));
                }
            }

            self.imposedCircle = new self.paperScope.Path.Arc(from, through, to);
            self.imposedCircle.strokeWidth = modelClass.IMPOSED_CIRCLE_WIDTH;
            self.imposedCircle.strokeColor = modelClass.IMPOSED_CIRCLE_COLOR;

            self.imposedCircle.shadowColor = modelClass.DRAG_CIRCLE_DATA.SHADOW_COLOR,
            self.imposedCircle.shadowBlur = modelClass.DRAG_CIRCLE_DATA.SHADOW_BLUR,
            self.imposedCircle.shadowOffset = new this.paperScope.Point([2, 2]),
            self.imposedCircle.opacity = 0.93;


            self.paperScope.project.activeLayer.insertChild(4, self.imposedCircle);
            self.paperScope.project.activeLayer.insertChild(2, self._circle);


            /**************************************/

        },


        /**
       * Function to draw bubbles on visited points
       * @method _drawBubbles
       * @private
       */
        _drawBubbles: function (maxVisitedAngle, maxAngleFind) {

            var self = this;
            if (maxAngleFind) {
                maxVisitedAngle = 0;
                if (self.currentAngle > modelClass.ANGLE_MARGIN_TO_DROP) {
                    maxVisitedAngle = self.maxVisitedAnglePos;
                }
                else if (self.currentAngle < -(modelClass.ANGLE_MARGIN_TO_DROP)) {
                    maxVisitedAngle = self.maxVisitedAngleNeg;
                }

                if (self.currentAngle > modelClass.ANGLE_MARGIN_TO_DROP && self.currentAngle % self.baseAngleValue < self.baseAngleValue && self.maxVisitedAnglePos <= self.currentAngle) {
                    maxVisitedAngle = self.currentAngle - self.currentAngle % self.baseAngleValue;
                }
                else if (self.currentAngle < -(modelClass.ANGLE_MARGIN_TO_DROP) && self.currentAngle % self.baseAngleValue > -self.baseAngleValue && self.maxVisitedAngleNeg >= self.currentAngle) {
                    maxVisitedAngle = self.currentAngle - self.currentAngle % self.baseAngleValue;
                }
            }
            if (maxVisitedAngle !== this.maxVisitedAnglePos || maxVisitedAngle !== this.maxVisitedAngleNeg) {


                if (this.bubbleGroup) {
                    this.bubbleGroup.removeChildren();
                }

                var angle = 0, newX = 0, newY = 0, baseAngleValue = this.baseAngleValue, bubbleElem;
                if (maxVisitedAngle < 0) {
                    baseAngleValue = -(this.baseAngleValue);
                    angle = -this.baseAngleValue;
                    this.maxVisitedAngleNeg = maxVisitedAngle;
                }
                else if (maxVisitedAngle > 0) {
                    angle = this.baseAngleValue;
                    this.maxVisitedAnglePos = maxVisitedAngle;
                }

                while (angle !== maxVisitedAngle + baseAngleValue) {

                    if (angle !== 0) {
                        newX = this.centerPoint.x + this._radius * Math.cos((-angle) * Math.PI / 180);
                        newY = this.centerPoint.y + this._radius * Math.sin((-angle) * Math.PI / 180);

                        bubbleElem = classNameTab1.SHOW_BUBBLE(this.paperScope, newX, newY, modelClass.BUBBLE_CIRCLE_RADIUS, modelClass.BUBBLE_CIRCLE_COLOR);
                        this.bubbleGroup.addChild(bubbleElem);
                    }
                    angle = angle + baseAngleValue;

                }

                this.paperScope.project.activeLayer.insertChild(5, this.bubbleGroup);
                this.paperScope.view.draw();
            }
        },

        /**
        * Function to allow rotate drag circle item in range of -360(-2π) to 360(2π)
        * @method _allowRotate
        * @private
        */
        _allowRotate: function () {
            if (this.positiveFullArc === false && this.negativeFullArc === false) {
                this.allowRotation = true;
                this.blockRotation = false;
                return true;
            }
            else if (this.positiveFullArc === true && (this.lastAngle > 354 && this.lastAngle <= 360)) {
                this.allowRotation = true;
                this.blockRotation = false;
                return true;
            }
            else if (this.negativeFullArc === true && (this.lastAngle < -354 && this.lastAngle >= -360)) {
                this.allowRotation = true;
                this.blockRotation = false;
                return true;
            }
            else if (this.blockRotation === true) {
                this.blockRotation = false;
                this.allowRotation = true;
            }
        },

        /**
        * Function to draw line representing sin(cos) value in circle while dragging 
        * @method _drawSinCosLine
        * @private
        */
        _drawSinCosLine: function (lineColor) {

            var self = this, xAxisPoint = { x: self._dragHandle.position.x, y: self.centerPoint.y }, bringBorderCircleToFront = false;

            if (self.sineCosLine) {
                self.sineCosLine.remove();
            }
            if (self.tempCosLine) {
                self.tempCosLine.remove();
            }
            if (self.tanLine) {
                self.tanLine.remove();
            }

            if (self.trignometricFunction.Sine) {
                self.sineCosLine = self.paperScope.Path.Line(xAxisPoint, self._dragHandle.position);
            }
            if (self.trignometricFunction.Cos) {
                self.sineCosLine = self.paperScope.Path.Line(xAxisPoint, self.centerPoint);
                self.tempCosLine = self.paperScope.Path.Line(xAxisPoint, self._dragHandle.position);
                self.tempCosLine.strokeColor = modelClass.COS_VERTICAL_LINE_COLOR;
                self.tempCosLine.strokeWidth = modelClass.COS_VERTICAL_LINE_WIDTH;
                self.paperScope.project.activeLayer.insertChild(3, self.tempCosLine);
            }

            if (self.trignometricFunction.Tan) {


                self.sineCosLine = self.paperScope.Path.Line(xAxisPoint, self._dragHandle.position);
                self.tempCosLine = self.paperScope.Path.Line(xAxisPoint, self.centerPoint);

                if (lineColor !== modelClass.TAN_VERTICAL_LINE_COLOR) {
                    self.tempCosLine.strokeColor = modelClass.COS_LINE_DRAG_COLOR;
                    self.sineCosLine.strokeColor = modelClass.SINE_LINE_DRAG_COLOR;
                } else {
                    self.tempCosLine.strokeColor = lineColor;
                    self.sineCosLine.strokeColor = lineColor;
                }

                self.tempCosLine.strokeWidth = modelClass.COS_VERTICAL_LINE_WIDTH;
                self.paperScope.project.activeLayer.insertChild(3, self.tempCosLine);

                var slope = (self._dragHandle.position.y - self.centerPoint.y) / (self._dragHandle.position.x - self.centerPoint.x), newX, newY;
                tanValue = self._dragHandle.position.x - (self._dragHandle.position.y - self.centerPoint.y) * (-slope);

                newX = self.centerPoint.x + self._radius * Math.cos((self.currentDistanceScale * self.currentAngle) * Math.PI / 180);
                newY = self.centerPoint.y + self._radius * Math.sin((self.currentDistanceScale * self.currentAngle) * Math.PI / 180);
                slope = (newY - self.centerPoint.y) / (newX - self.centerPoint.x);
                actualTanValue = newX - (newY - self.centerPoint.y) * (-slope);


                if (Math.abs(self.currentAngle) === 90 || Math.abs(self.currentAngle) === 270) {
                    tanValue = self.centerPoint.x + Math.abs(Math.tan((self.currentAngle - 0.3) * Math.PI / 180)) * this._radius + this._radius;
                    if (self.currentAngle === 270 || self.currentAngle === -90) {
                        tanValue = self.centerPoint.x - Math.abs(Math.tan((self.currentAngle - 0.3) * Math.PI / 180)) * this._radius - this._radius;
                    }
                }

                if (Math.abs(actualTanValue) > 90000) {
                    if ((self._dragHandle.position.x === self.centerPoint.x)) {
                        tanValue = 90000;
                        if (self.currentAngle === 270 || self.currentAngle === -90) {
                            tanValue = -90000;
                        }
                    }
                    actualTanValue = 90000;
                }

                self.tanLine = self.paperScope.Path.Line(new self.paperScope.Point(tanValue, self.centerPoint.y), self._dragHandle.position);

                if (self.tanLine) {
                    self.tanLine.strokeColor = lineColor;
                    self.tanLine.strokeWidth = modelClass.SIN_COS_BAR_WIDTH;
                    self.paperScope.project.activeLayer.insertChild(5, self.tanLine);
                    self.tanLine.bringToFront();
                    self._rotatingCircleGroup.bringToFront();
                }


                if (this.borderCircle) {
                    this.borderCircle.remove();
                }

                if (actualTanValue === 90000) {

                    self._dragCircle.opacity = 0.66;
                    self.borderCircle = new this.paperScope.Path.Circle({
                        radius: modelClass.DRAG_CIRCLE_DATA.DRAG_CIRCLE_RADIUS - 2,
                        center: [this._dragHandle.position.x, this._dragHandle.position.y],
                        strokeColor: '#FFFFFF',
                        strokeWidth: 3,
                        opacity: 1
                    });
                    bringBorderCircleToFront = true;
                }
                else {
                    self._dragCircle.opacity = 0.93;
                }
            }

            if (self.sineCosLine) {
                if (!self.trignometricFunction.Tan) {
                    self.sineCosLine.strokeColor = lineColor;
                }
                self.sineCosLine.strokeWidth = modelClass.SIN_COS_BAR_WIDTH;
                self.paperScope.project.activeLayer.insertChild(4, self.sineCosLine);
                if (!self.trignometricFunction.Cos && self._radiusLine) {
                    self.paperScope.project.activeLayer.insertChild(3, self._radiusLine);
                }
                self.sineCosLine.bringToFront();
            }

            if (self.tempCosLine && !self.trignometricFunction.Sine) {
                self.tempCosLine.bringToFront();
                // self._dummyDragCircle.bringToFront();
            }
            self._rotatingCircleGroup.bringToFront();

            if (bringBorderCircleToFront === true) {
                self.borderCircle.bringToFront();
            }


            self._centerCircle.bringToFront();
            self.paperScope.view.draw();

        },


        /**
        * Function to find sin(cos) values for given parameters
        * @method trignometricOutput
        * @param angle number 
        * @param distanceMultiplier number 
        * @param radius number current 
        */
        trignometricOutput: function (angle, distanceMultiplier, radius) {

            var equationValue = 0;
            if (this.trignometricFunction.Sine) {
                equationValue = radius * Math.sin(distanceMultiplier * (angle) * Math.PI / 180);
            }
            else if (this.trignometricFunction.Cos) {
                equationValue = radius * Math.cos(distanceMultiplier * (angle) * Math.PI / 180);
            }
            else {
                equationValue = radius * Math.tan(distanceMultiplier * (angle) * Math.PI / 180);
            }

            equationValue = Math.round(equationValue * 1000) / 1000;
            return equationValue;
        },


        /**
       * Functionality to reset tab to its original state
       * @method resetData
       */
        resetData: function resetData() {

            // Remove all canvas items from view

            if (this.renderElements) {

                this._resetViewParam();
                this._renderElements(this.initVectAngle);
                //this._radius = this.originalRadius;
                this.renderInitLabels();
                this._changeLineColor();

                this._updateDistanceMultDomValue(this.currentDistanceScale);
                this._updateRadiusDomValue(this.currentRadiusScale);

                this.mathJaxOutput(this.currentAngle, this.currentDistanceScale, this.currentRadiusScale);
                this.maxValuePossible(this.baseAngleValue, this.currentDistanceScale, this.currentRadiusScale);
                this.paperScope.view.draw();

            }
        },


        resetAllData: function () {
            if (this.renderElements) {

                this.paperScope.activate();
                this._resetViewParam();
                this.$el.find('.circle-labels').empty();

                this.currentRadiusScale = this.radiusView.getSelectedValue();
                this.currentDistanceScale = this.distanceView.getSelectedValue();
                this._radius = this.originalRadius * this.currentRadiusScale;

                this._renderInitElements();
                this._renderElements(this.initVectAngle);

                this.renderInitLabels();
                this._changeLineColor();
                this.mathJaxOutput(modelClass.INITIAL_ANGLE, this.currentDistanceScale, this.currentRadiusScale);
                this.maxValuePossible(this.baseAngleValue, this.currentDistanceScale, this.currentRadiusScale);
                this.paperScope.view.draw();
                this.trigger(namespace.ExploreTrignometricGraphing.CHANGE_ANGLE, 0, true);
            }
            else {

                this._activatePaperScope();
                this.currentRadiusScale = this.model.get('radiusSliderData').defaultValue;
                this.radiusView.setSelectedValue(this.model.get('radiusSliderData').defaultValue);
                this._updateRadiusDomValue(this.currentRadiusScale);
                this.currentDistanceScale = this.model.get('distanceSliderData').defaultValue;
                this.distanceView.setSelectedValue(this.model.get('distanceSliderData').defaultValue);
                this._updateDistanceMultDomValue(this.currentDistanceScale);
                this._renderInitElements();
                this.paperScope.view.draw();
            }

            MathInteractives.global.SpeechStream.stopReading();
        },


        /**
       * Function to reset all parameters & paper objects
       * @method _resetViewParam
       * @private
       */
        _resetViewParam: function () {

            this._activatePaperScope();
            this.bubbleGroup.removeChildren();
            if (this._dragHandle) {
                this._dragHandle.remove();
            }
            this._centerCircle.remove();
            this._circle.remove();

            this._dragCircle.remove();
            this._rotatingCircleGroup.remove();
            this.radialGroup.remove();
            if (this._radiusLine) {
                this._radiusLine.remove();
            }
            this.diameterLine.remove();
            if (this.imposedCircle) {
                this.imposedCircle.remove();
            }
            this.dragItemPos = null;
            this._radiusVector = null;
            this.lastAngle = 0;
            this.previousAngle = null;
            this.positiveFullArc = false;
            this.negativeFullArc = false;
            this.allowRotation = true;
            this.mouseLeftClick = false;
            this.currentAngle = 0;
            this.initVectAngle = 0;
            this.maxVisitedAnglePos = 0;
            this.maxVisitedAngleNeg = 0;
            this.maxVisitedImposedPos = 0;
            this.maxVisitedImposedNeg = 0;
            this.firstDrag = true;
            this.accCurrentAngle = 0;
            if (this.sineCosLine) {
                this.sineCosLine.remove();
            }
            if (this.tempCosLine) {
                this.tempCosLine.remove();
            }
            if (this.tanLine) {
                this.tanLine.remove();
            }

            this._dragHandle = null;
            this.toolMouseUpCheck = false;
            this.handCursorFlag = false;
            this.rotatingDirection = '',
            this.condition = null;


            //if (initVectAngle <= -180 && initVectAngle > -359) {
            //    this.condition = 1;
            //}

            this.initialFlightAngle = this.initVectAngle;
        },


        /**
       * Function to bind events on 
       * @method _bindCanvasEvents
       * @private
       */
        _bindCanvasEvents: function () {
            var self = this, maxVisitedAngle;

            this._bindRotateToolEvents();

            this.tool.on({
                mouseup: function (event) {
                    self.$('.rotate-animation-canvas').trigger('click');
                    self.mouseLeftClick = false;
                    if (self.toolMouseUpCheck === true) {
                        self._onMouseUpHandle(self.centerPoint);
                    }
                    if (self.handCursorFlag === false) {
                        self.$('.rotate-animation-canvas').css({ 'cursor': 'default' });
                    }
                    else {
                        if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                            self.$('.rotate-animation-canvas').css({ 'cursor': 'url("' + self.filePath.getImagePath('open-hand') + '"), move' });
                        }
                    }

                    self.toolMouseUpCheck = false;

                    /************* Function to drop drag item on nearest point on mouse up ****/

                    var dividerValue, arrValuesPositive = [0],
                    arrValuesNegative = [0],
                    arrValues, arrValuesNew, positiveNum = 0, negativeNum = 0, dropPoint = 'none';
                    dividerValue = self.showPointsCount + 1;


                    for (var k = 0; k < dividerValue; k++) {
                        positiveNum = positiveNum + self.baseAngleValue;
                        negativeNum = negativeNum - self.baseAngleValue;
                        arrValuesPositive.push(positiveNum);
                        arrValuesNegative.push(negativeNum);
                    }

                    if (self.currentAngle < 0) {
                        arrValues = arrValuesNegative;

                    }
                    else {
                        arrValues = arrValuesPositive;
                    }


                    if (self.currentAngle > 0) {
                        for (var i = 0; i < dividerValue; i++) {
                            if (self.currentAngle > arrValues[i] - modelClass.ANGLE_MARGIN_TO_DROP && self.currentAngle < arrValues[i] + modelClass.ANGLE_MARGIN_TO_DROP) {
                                dropPoint = i;
                                break;
                            }
                        }
                    }

                    else {
                        for (var i = 0; i < dividerValue; i++) {
                            if (self.currentAngle > arrValues[i] - modelClass.ANGLE_MARGIN_TO_DROP && self.currentAngle < arrValues[i] + modelClass.ANGLE_MARGIN_TO_DROP) {
                                dropPoint = i;
                                break;
                            }
                        }
                    }

                    if (dropPoint !== 'none' && arrValues[dropPoint] !== self.currentAngle) {

                        var newValue = 0, newY = null, newX = null;
                        if (self.currentAngle < 0) {
                            newValue = -(180 + arrValues[dropPoint] - self.initVectAngle);
                        }
                        else {
                            newValue = 180 + self.initVectAngle - arrValues[dropPoint];
                        }

                        newX = self.centerPoint.x + self._radius * Math.cos((newValue + 180) * Math.PI / 180);
                        newY = self.centerPoint.y + self._radius * Math.sin((newValue + 180) * Math.PI / 180);

                        self._dragCircle.position = new self.paperScope.Point(newX, newY);

                        self._dragHandle.position = new self.paperScope.Point(newX, newY);
                        self._radiusVector = new self.paperScope.Point(self.centerPoint.x, self.centerPoint.y).subtract(new self.paperScope.Point(self._dragHandle.position.x, self._dragHandle.position.y));

                        if (!self.trignometricFunction.Cos) {
                            self._radiusLine.removeSegments(1);
                            self._radiusLine.add(self._dragHandle.position);
                        }

                        self._dragCircle.rotate(arrValues[dropPoint]);
                        self.currentAngle = arrValues[dropPoint];

                        // self.equationAngleSurdFormat(self.currentAngle);

                        self._changeLineColor();
                        self.mathJaxOutput(self.currentAngle, self.currentDistanceScale, self.currentRadiusScale);
                        self.drawImposedCircle(self.currentAngle);

                        self.trigger(namespace.ExploreTrignometricGraphing.CHANGE_ANGLE, self.currentAngle, true);

                        maxVisitedAngle = 0;
                        self._drawBubbles(maxVisitedAngle, true);

                        if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {
                            self._dummyDragCircle.position = self._dragCircle.position;
                        }

                    }

                },
                mousedown: function (event) {
                    if (self.handCursorFlag === true) {
                        if (!MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile && (event.event.which == 1 || event.event.which == 0)) {
                            self.$('.rotate-animation-canvas').css({ 'cursor': 'url("' + self.filePath.getImagePath('closed-hand') + '"), move' });
                            if (event.event.which === 1) {
                                self.mouseLeftClick = true;
                            }
                        }
                        else {
                            self.mouseLeftClick = true;
                        }

                    }
                }
            });
        },


        /**
        * Function to create JSON object for current angle surd output
        * @method _getJsonOfSurd
        * @private
        */
        _getJsonOfSurd: function (initAngle, distance, radius) {

            var options = {};
            options.surdType = { Type1: false, Type2: false, Type3: false, Type4: false, Type5: false, Type6: false, Type7: false, Type8: false, Type9: false, Type10: false, Type11: false, Type12: false, Type13: false, Type14: false, Type15: false, Type16: false };


            var finalAngle = initAngle * distance, absOutput = 0;


            var equationValue = 0;
            if (this.trignometricFunction.Sine) {
                equationValue = Math.sin(finalAngle * Math.PI / 180);
            }
            else if (this.trignometricFunction.Cos) {
                equationValue = Math.cos(finalAngle * Math.PI / 180);
            }
            else {
                equationValue = Math.tan(finalAngle * Math.PI / 180);
            }
            equationValue = Math.round(equationValue * 10000) / 10000;

            absOutput = Math.abs(equationValue);

            if (absOutput > 100 || absOutput < -100) {
                absOutput = Infinity;
            }

            switch (absOutput) {

                case 0.7071:
                    options.surdType.Type7 = true;
                    options = { surdType: options.surdType, val1: 2, idPrefix: this.idPrefix, mainOperator: '', valDen: 2, radius: '' };
                    // latexString = '\frac{' +options.mainOperator+options.val1+'\sqrt{\sqrt'+options.val2+'\;+\;\sqrt'+dfjlsad+'}}2';
                    break;

                case 0.5:
                    options.surdType.Type6 = true;
                    options = { surdType: options.surdType, val1: 1, idPrefix: this.idPrefix, mainOperator: '', valDen: 2, radius: '' };
                    break;

                case 0.866:
                    options.surdType.Type7 = true;
                    options = { surdType: options.surdType, val1: 3, idPrefix: this.idPrefix, mainOperator: '', valDen: 2, radius: '' };
                    break;


                case 0.3827:
                    // angle 22.5(pie/8) & 157.5(7pie/8)
                    options.surdType.Type2 = true;
                    options = { surdType: options.surdType, val1: 2, idPrefix: this.idPrefix, operator: '-', mainOperator: '', val2: 2, valDen: 2, radius: '' };

                    break;

                case 0.2588:
                    // angle 15(pie/12) & 165(11pie/12)
                    options.surdType.Type1 = true;
                    options = { surdType: options.surdType, val1: 6, idPrefix: this.idPrefix, operator: '+', val2: 2, mainOperator: '', valDen: 4, radius: '' };

                    break;

                case 0.9659:
                    // angle 75(pie/12) & 105(11pie/12)
                    options.surdType.Type1 = true;
                    options = { surdType: options.surdType, val1: 6, idPrefix: this.idPrefix, operator: '-', val2: 2, mainOperator: '', valDen: 4, radius: '' };

                    break;

                case 0.9239:
                    // 67.5(3pie/8) &  112.5(5pie/8)
                    options.surdType.Type2 = true;
                    options = { surdType: options.surdType, val1: 2, idPrefix: this.idPrefix, operator: '+', val2: 2, mainOperator: '', valDen: 2, radius: '' };
                    break;

                case 0.1951:
                    // 11.25(pie/16) &  112.5(15pie/16)
                    options.surdType.Type5 = true;
                    options = { surdType: options.surdType, val1: 2, idPrefix: this.idPrefix, operator: '-', operator1: '+', val2: 2, val3: 2, val4: 2, mainOperator: '', valDen: 2, radius: '' };
                    break;

                case 1:
                case 0:
                    options.surdType.Type10 = true;
                    options = { surdType: options.surdType, val1: absOutput, idPrefix: this.idPrefix, mainOperator: '', radius: '', valDen: 1 };
                    if (absOutput === 0) { options.valDen = ''; options.val3 = ''; }
                    break;

                case 0.5556:  // 33.75 && 146.25  (Base value of Sin(3pie/16))
                    options.surdType.Type11 = true;
                    options = { surdType: options.surdType, val1: 2, idPrefix: this.idPrefix, operator: '-', operator1: '-', val2: 2, val3: 2, val4: 2, mainOperator: '', valDen: 2, radius: '' };
                    break;

                case 0.8315:  // 56.25 && 123.75  (Base value of Cos(3pie/16))

                    options.surdType.Type11 = true;
                    options = { surdType: options.surdType, val1: 2, idPrefix: this.idPrefix, operator: '+', operator1: '-', val2: 2, val3: 2, val4: 2, mainOperator: '', valDen: 2, radius: '' };
                    break;

                case 0.9808:  // 78.75 && 101.25   (Base value of Sin(7pie/16))

                    options.surdType.Type11 = true;
                    options = { surdType: options.surdType, val1: 2, idPrefix: this.idPrefix, operator: '+', operator1: '+', val2: 2, val3: 2, val4: 2, mainOperator: '', valDen: 2, radius: '' };
                    break;

                    /************************** Tan values ********************/

                case 0.1989:
                    options.surdType.Type12 = true;
                    options = { surdType: options.surdType, idPrefix: this.idPrefix, val1: 4, val2: 2, val4: 2, val5: 2, val6: 1, operator1: '+', operator2: '-', operator3: '-', mainOperator: '', valDen: 1, radius: '', fenced: false };
                    break;

                case 0.2679:
                    options.surdType.Type13 = true;
                    options = { surdType: options.surdType, val1: 2, idPrefix: this.idPrefix, operator: '-', val2: 3, mainOperator: '', valDen: 1, radius: '', fenced: false };
                    break;

                case 0.4142:
                    options.surdType.Type14 = true;
                    options = { surdType: options.surdType, val1: 2, idPrefix: this.idPrefix, operator: '-', val2: 1, mainOperator: '', valDen: 1, radius: '', fenced: false };
                    break;

                case 0.5774:
                    options.surdType.Type7 = true;
                    options = { surdType: options.surdType, val1: 3, idPrefix: this.idPrefix, mainOperator: '', valDen: 3, radius: '' };
                    break;

                case 0.6682:
                    options.surdType.Type12 = true;
                    options = { surdType: options.surdType, idPrefix: this.idPrefix, val1: 4, val2: 2, val4: 2, val5: 2, val6: 1, operator1: '-', operator2: '-', operator3: '+', mainOperator: '', valDen: 1, radius: '', fenced: false };
                    break;

                case 1.4966:
                    options.surdType.Type12 = true;
                    options = { surdType: options.surdType, idPrefix: this.idPrefix, val1: 4, val2: 2, val4: 2, val5: 2, val6: 1, operator1: '-', operator2: '+', operator3: '-', mainOperator: '', valDen: 1, radius: '', fenced: false };
                    break;

                case 1.7321:
                    options.surdType.Type7 = true;
                    options = { surdType: options.surdType, val1: 3, idPrefix: this.idPrefix, mainOperator: '', valDen: 1, radius: '' };
                    break;

                case 2.4142:
                    options.surdType.Type14 = true;
                    options = { surdType: options.surdType, val1: 2, idPrefix: this.idPrefix, operator: '+', val2: 1, mainOperator: '', valDen: 1, radius: '', fenced: false };
                    break;

                case 3.7321:
                    options.surdType.Type13 = true;
                    options = { surdType: options.surdType, val1: 2, idPrefix: this.idPrefix, operator: '+', val2: 3, mainOperator: '', valDen: 1, radius: '', fenced: false };
                    break;

                case 5.0273:
                    options.surdType.Type12 = true;
                    options = { surdType: options.surdType, idPrefix: this.idPrefix, val1: 4, val2: 2, val4: 2, val5: 2, val6: 1, operator1: '+', operator2: '+', operator3: '+', mainOperator: '', valDen: 1, radius: '', fenced: false };
                    break;

                case Infinity:
                    options.surdType.Type16 = true;
                    options = { surdType: options.surdType, idPrefix: this.idPrefix, Infinity: 'undefined', radius: '', mainOperator: '', valDen: 1 };
                    break;

            }


            options.radius = radius;

            switch (options.radius) {
                case 0.5: options.radius = 1;
                    options.valDen = options.valDen * 2;
                    break;
                case 0.75: options.radius = 3;
                    options.valDen = options.valDen * 4;
                    break;
                case 1.25:
                    options.radius = 5;
                    options.valDen = options.valDen * 4;
                    break;
                case 1.5: options.radius = 3;
                    options.valDen = options.valDen * 2;
                    break;
                case 1.75:
                    options.radius = 7;
                    options.valDen = options.valDen * 4;
                    break;
            }

            // Code if recalculated value for valDen is not 1
            if (options.valDen > 1 && options.surdType.Type10 === true && absOutput !== 0) {
                options.surdType.Type10 = false;
                options.surdType.Type6 = true;
            }

            // To append - if negative
            if (equationValue < 0 && absOutput !== Infinity) {
                options.mainOperator = '-';
            }

            // Code to factorize common multipler from Numerator & denominator
            if (options.valDen) {
                options.val3 = options.valDen;
                var GCD = this.findGCD(options.val3, options.radius);
                if (GCD > 1 && GCD % 1 === 0) {                   // If GCD is int greater than 1 cancellation
                    options.radius = options.radius / GCD;
                    options.val3 = options.val3 / GCD;
                    if (options.radius === 1) {
                        options.radius = '';
                    }
                    else {
                        // If numerator is digit. Multiply radius to digit.                                                                        
                        if (options.surdType.Type10 || options.surdType.Type6) {
                            options.val1 = options.val1 * options.radius;
                            options.radius = '';
                        }
                    }
                }
                else {
                    if (options.surdType.Type10 || options.surdType.Type6) {
                        options.val1 = options.val1 * options.radius;
                        options.radius = '';
                    }
                }

            }

            if (options.val3 === 1) {
                options.val3 = '';
            }

            // If equation value is 0 than radius will be 0 E.g  4.sin(0)=4*0=0;
            if ((options.radius === 1 && !options.surdType.Type11 && !options.surdType.Type5) || equationValue === 0) {
                options.radius = '';
            }

            // If denominator is none than boolean value to choose different set of template
            options.denominatorPresent = true;
            if ((options.val3 === 1 || options.val3 === '')) {
                options.denominatorPresent = false;
            }
            else {
                options.denominatorPresent = true;
            }



            if (options.surdType.Type12 || options.surdType.Type13 || options.surdType.Type14 || options.surdType.Type15) {
                if (options.radius !== '' || options.mainOperator === '-') {
                    options.fenced = true;
                }
            }


            return options;
        },


        _getLatexString: function (initAngle, distance, radius, options) {

            var finalAngle = initAngle * distance, absOutput = 0, prependLatex = '', latex = '', specialCase = '';




            // Sets radius value latex
            if (options.radiusValType.Type2) {
                prependLatex = options.radiusNormal + '. ' + options.radiusDecimal + ' \\cdot';
            }
            else if (options.radiusValType.Type3) {
                prependLatex = options.radiusNormal + ' \\cdot';
            }

            // Sets Trignometric function name (sine,cos or tan)

            prependLatex = prependLatex + '\\' + options.trignometricType;

            // Opening bracket
            prependLatex = prependLatex + '\\left( ';


            // Sets distance multiplier (type1: none , type 2: decimal , type3: integer value)
            if (options.distanceValType.Type1) {
            }

            else if (options.distanceValType.Type2) {
                prependLatex = prependLatex + '' + options.distanceNormal + ' . ' + options.distanceDecimal + ' \\cdot';
            }

            else {
                prependLatex = prependLatex + options.distanceNormal + ' \\cdot';
            }


            // Sets angle in radian (type1: -2π,2π,0 , type 2: π,-π , type3: 2π/3,-4π/2)
            if (options.angleType.Type1) {
                prependLatex = prependLatex + options.angleNormal;   // '-2\pi'
            }

            else if (options.angleType.Type2) {
                prependLatex = prependLatex + options.angleType.angleOperator + ' \\pi';
            }

            else {
                prependLatex = prependLatex + '\\frac{' + options.angleNormal + '}{' + options.angleDenominator + '}';
            }


            // Latex for closing braces
            prependLatex = prependLatex + '\\right)=';



            var equationValue = 0;
            if (this.trignometricFunction.Sine) {
                equationValue = Math.sin(finalAngle * Math.PI / 180);
            }
            else if (this.trignometricFunction.Cos) {
                equationValue = Math.cos(finalAngle * Math.PI / 180);
            }
            else {
                equationValue = Math.tan(finalAngle * Math.PI / 180);
            }
            equationValue = Math.round(equationValue * 10000) / 10000;

            absOutput = Math.abs(equationValue);

            if (absOutput > 100 || absOutput < -100) {
                absOutput = Infinity;
            }

            // Latex for output value i.e surd
            switch (absOutput) {

                case 0.7071:
                    latex = options.mainOperator + '\\frac{' + options.radius + ' \\sqrt{' + options.val1 + '}}{' + options.val3 + '}';
                    if (!options.denominatorPresent) {
                        latex = options.mainOperator + options.radius + '\\sqrt{' + options.val1 + '}';
                    }
                    break;

                case 0.5:
                    latex = options.mainOperator + '\\frac{' + options.val1 + '}{' + options.val3 + '}';
                    if (!options.denominatorPresent) {
                        latex = options.mainOperator + options.val1;
                    }
                    break;

                case 0.866:
                    latex = options.mainOperator + '\\frac{' + options.radius + ' \\sqrt{' + options.val1 + '}}{' + options.val3 + '}';
                    if (!options.denominatorPresent) {
                        latex = options.mainOperator + options.radius + '\\sqrt{' + options.val1 + '}';
                    }
                    break;


                case 0.3827:
                    latex = options.mainOperator + '\\frac{' + options.radius + ' \\sqrt{' + options.val1 + options.operator + ' \\sqrt{' + options.val2 + '}}}{' + options.val3 + '}';

                    if (!options.denominatorPresent) {
                        latex = options.mainOperator + options.radius + '\\sqrt{' + options.val1 + '' + options.operator + '\\sqrt{' + options.val2 + '}}';
                    }
                    break;

                case 0.2588:

                    latex = options.mainOperator + '$\\frac{' + options.radius + ' \\sqrt{\\sqrt{' + options.val1 + '} ' + options.operator + ' \\sqrt{' + options.val2 + '}}}{' + options.val3 + '}$';
                    if (!options.denominatorPresent) {
                        latex = options.mainOperator + options.radius + '\\sqrt{\\sqrt' + options.val1 + '' + options.operator + '\\sqrt{' + options.val2 + '}}';
                    }

                    break;

                case 0.9659:
                    latex = options.mainOperator + '$\\frac{' + options.radius + ' \\sqrt{\\sqrt{' + options.val1 + '} ' + options.operator + ' \\sqrt{' + options.val2 + '}}}{' + options.val3 + '}$';
                    if (!options.denominatorPresent) {
                        latex = options.mainOperator + options.radius + '\\sqrt{\\sqrt' + options.val1 + '' + options.operator + '\\sqrt{' + options.val2 + '}}';
                    }
                    break;

                case 0.9239:
                    latex = options.mainOperator + '$\\frac{' + options.radius + ' \\sqrt{' + options.val1 + options.operator + ' \\sqrt{' + options.val2 + '}}}{' + options.val3 + '}$';
                    if (!options.denominatorPresent) {
                        latex = options.mainOperator + options.radius + '\\sqrt{' + options.val1 + '' + options.operator + '\\sqrt{' + options.val2 + '}}';
                    }
                    break;

                case 0.1951:
                    latex = options.mainOperator + '$\\frac{' + options.radius + '}{' + options.val4 + '}\\sqrt{' + options.val1 + options.operator + ' \\sqrt{' + options.val2 + options.operator1 + ' \\sqrt{' + options.val3 + '}}}$';
                    if (!options.denominatorPresent) {
                        latex = options.mainOperator + options.radius + '\\sqrt{' + options.val1 + '' + options.operator + '\\sqrt{' + options.val2 + '' + options.operator1 + '\\sqrt{' + options.val3 + '}}}';
                    }
                    break;

                case 1:
                case 0:
                    prependLatex = prependLatex.replace('=', '');
                    var fraction = MathUtilities.Components.EquationEngine.Models.ParserAssist.getEquationAccessibility(options.mainOperator + '\\frac{' + options.val1 + '}{' + options.val3 + '}');
                    specialCase = 'equal to ' + fraction;
                    if (!options.denominatorPresent) {
                        specialCase = 'equal to ' + options.mainOperator + options.val1;
                    }

                    break;

                case 0.5556:  // 33.75 && 146.25  (Base options.value of Sin(3pie/16))
                    latex = options.mainOperator + '\\frac{' + options.radius + '}{' + options.val3 + '}\\sqrt{' + options.val1 + options.operator + ' \\sqrt{' + options.val2 + options.operator1 + ' \\sqrt{' + options.val4 + '}}}';
                    if (!options.denominatorPresent) {
                        latex = options.mainOperator + options.radius + '\\sqrt{' + options.val1 + options.operator + ' \\sqrt{' + options.val2 + options.operator1 + '\\sqrt{' + options.val4 + '}}}';
                    }
                    break;

                case 0.8315:  // 56.25 && 123.75  (Base options.value of Cos(3pie/16))
                    latex = options.mainOperator + '\\frac{' + options.radius + '}{' + options.val3 + '}\\sqrt{' + options.val1 + options.operator + ' \\sqrt{' + options.val2 + options.operator1 + ' \\sqrt{' + options.val4 + '}}}';
                    if (!options.denominatorPresent) {
                        latex = options.mainOperator + options.radius + '\\sqrt{' + options.val1 + options.operator + ' \\sqrt{' + options.val2 + options.operator1 + '\\sqrt{' + options.val4 + '}}}';
                    }
                    break;

                case 0.9808:  // 78.75 && 101.25   (Base options.value of Sin(7pie/16))
                    latex = options.mainOperator + '\\frac{' + options.radius + '}{' + options.val3 + '}\\sqrt{' + options.val1 + options.operator + ' \\sqrt{' + options.val2 + options.operator1 + ' \\sqrt{' + options.val4 + '}}}';
                    if (!options.denominatorPresent) {
                        latex = options.mainOperator + options.radius + '\\sqrt{' + options.val1 + options.operator + ' \\sqrt{' + options.val2 + options.operator1 + '\\sqrt{' + options.val4 + '}}}';
                    }
                    break;

                    /************************** Tan options.values ********************/

                case 0.1989:


                    //latex = options.mainOperator+'\\frac{' + options.radius + '}{' + options.val3 + '}\\left(( \\sqrt{' + options.val1 + options.operator1 + options.val2 + '\\sqrt{' + options.val4 + '}} ' + options.operator2 + ' \\sqrt{' + options.val5 + '} ' + options.operator3 + options.val6 + ' )\\right)';
                    latex = options.mainOperator + '\\frac{' + options.radius + '}{' + options.val3 + '}\\left(( \\sqrt{' + options.val1 + options.operator1 + options.val2 + '\\sqrt{' + options.val4 + '}} ' + options.operator2 + ' \\sqrt{' + options.val5 + '} ' + options.operator3 + options.val6 + ' )\\right)';
                    if (!options.denominatorPresent) {
                        if (options.fenced) {
                            latex = options.mainOperator + options.radius + '\\left(\\sqrt{' + options.val1 + options.operator1 + options.val2 + '\\sqrt{' + options.val4 + '}}' + options.operator2 + '\\sqrt{' + options.val5 + '}' + options.operator3 + options.val6 + '\\right)'
                        }
                        else {
                            latex = '\\sqrt{' + options.val1 + options.operator1 + options.val2 + '\\sqrt{' + options.val4 + '}}' + options.operator2 + '\\sqrt{' + options.val5 + '}' + options.operator3 + options.val6;
                        }
                    }
                    break;

                case 0.2679:
                    latex = options.mainOperator + '\\frac{' + options.radius + ' \\left(( ' + options.val1 + options.operator + ' \\sqrt{' + options.val2 + '} )\\right)}{' + options.val3 + '}';
                    if (!options.denominatorPresent) {
                        if (options.fenced) {
                            latex = options.mainOperator + options.radius + '\\left(' + options.val1 + options.operator + '\\sqrt{' + options.val2 + '} \\right)'
                        }
                        else {
                            latex = options.val1 + options.operator + '\\sqrt{' + options.val2 + '}';
                        }
                    }

                    break;

                case 0.4142:
                    latex = options.mainOperator + '\\frac{' + options.radius + ' \\left(( \\sqrt{' + options.val1 + '} ' + options.operator + options.val2 + ')\\right)}{' + options.val3 + '}';
                    if (!options.denominatorPresent) {
                        if (options.fenced) {
                            latex = options.mainOperator + options.radius + '\\left( \\sqrt{' + options.val1 + '}' + options.operator + options.val2 + ' \\right)'
                        }
                        else {
                            latex = '\\sqrt{' + options.val1 + '}' + options.operator + options.val2;
                        }
                    }
                    break;

                case 0.5774:
                    latex = options.mainOperator + '\\frac{' + options.radius + ' \\sqrt{' + options.val1 + '}}{' + options.val3 + '}';
                    if (!options.denominatorPresent) {
                        latex = options.mainOperator + options.radius + '\\sqrt' + options.val1;
                    }
                    break;

                case 0.6682:
                    latex = options.mainOperator + '\\frac{' + options.radius + '}{' + options.val3 + '}\\left(( \\sqrt{' + options.val1 + options.operator1 + options.val2 + '\\sqrt{' + options.val4 + '}} ' + options.operator2 + ' \\sqrt{' + options.val5 + '} ' + options.operator3 + options.val6 + ' )\\right)';
                    if (!options.denominatorPresent) {
                        if (options.fenced) {
                            latex = options.mainOperator + options.radius + '\\left(\\sqrt{' + options.val1 + options.operator1 + options.val2 + '\\sqrt{' + options.val4 + '}}' + options.operator2 + '\\sqrt{' + options.val5 + '}' + options.operator3 + options.val6 + '\\right)'
                        }
                        else {
                            latex = '\\sqrt{' + options.val1 + options.operator1 + options.val2 + '\\sqrt{' + options.val4 + '}}' + options.operator2 + '\\sqrt{' + options.val5 + '}' + options.operator3 + options.val6;
                        }
                    }
                    break;

                case 1.4966:
                    latex = options.mainOperator + '\\frac{' + options.radius + '}{' + options.val3 + '}\\left(( \\sqrt{' + options.val1 + options.operator1 + options.val2 + '\\sqrt{' + options.val4 + '}} ' + options.operator2 + ' \\sqrt{' + options.val5 + '} ' + options.operator3 + options.val6 + ' )\\right)';
                    if (!options.denominatorPresent) {
                        if (options.fenced) {
                            latex = options.mainOperator + options.radius + '\\left(\\sqrt{' + options.val1 + options.operator1 + options.val2 + '\\sqrt{' + options.val4 + '}}' + options.operator2 + '\\sqrt{' + options.val5 + '}' + options.operator3 + options.val6 + '\\right)'
                        }
                        else {
                            latex = '\\sqrt{' + options.val1 + options.operator1 + options.val2 + '\\sqrt{' + options.val4 + '}}' + options.operator2 + '\\sqrt{' + options.val5 + '}' + options.operator3 + options.val6;
                        }
                    }
                    break;

                case 1.7321:
                    latex = options.mainOperator + '\\frac{' + options.radius + ' \\sqrt{' + options.val1 + '}}{' + options.val3 + '}';
                    if (!options.denominatorPresent) {
                        latex = options.mainOperator + options.radius + '\\sqrt{' + options.val1 + '}';
                    }
                    break;

                case 2.4142:
                    latex = options.mainOperator + '\\frac{' + options.radius + ' \\left(( \\sqrt{' + options.val1 + '} ' + options.operator + options.val2 + ')\\right)}{' + options.val3 + '}';
                    if (!options.denominatorPresent) {
                        if (options.fenced) {
                            latex = options.mainOperator + options.radius + '\\left( \\sqrt{' + options.val1 + '}' + options.operator + options.val2 + ' \\right)'
                        }
                        else {
                            latex = '\\sqrt{' + options.val1 + '}' + options.operator + options.val2;
                        }
                    }
                    break;

                case 3.7321:
                    latex = options.mainOperator + '\\frac{' + options.radius + ' \\left(( ' + options.val1 + options.operator + ' \\sqrt{' + options.val2 + '} )\\right)}{' + options.val3 + '}';
                    if (!options.denominatorPresent) {
                        if (options.fenced) {
                            latex = options.mainOperator + options.radius + '\\left(' + options.val1 + options.operator + '\\sqrt{' + options.val2 + '} \\right)'
                        }
                        else {
                            latex = options.val1 + options.operator + '\\sqrt{' + options.val2 + '}';
                        }
                    }
                    break;

                case 5.0273:
                    latex = options.mainOperator + '\\frac{' + options.radius + '}{' + options.val3 + '}\\left(( \\sqrt{' + options.val1 + options.operator1 + options.val2 + '\\sqrt{' + options.val4 + '}} ' + options.operator2 + ' \\sqrt{' + options.val4 + '} ' + options.operator3 + options.val6 + ' )\\right)';
                    if (!options.denominatorPresent) {
                        if (options.fenced) {
                            latex = options.mainOperator + options.radius + '\\left(\\sqrt{' + options.val1 + options.operator1 + options.val2 + '\\sqrt{' + options.val4 + '}}' + options.operator2 + '\\sqrt{' + options.val5 + '}' + options.operator3 + options.val6 + '\\right)'
                        }
                        else {
                            latex = '\\sqrt{' + options.val1 + options.operator1 + options.val2 + '\\sqrt{' + options.val4 + '}}' + options.operator2 + '\\sqrt{' + options.val5 + '}' + options.operator3 + options.val6;
                        }
                    }
                    break;

                case Infinity:

                    prependLatex = prependLatex.replace('=', '');
                    specialCase = ' equal to ' + options.mainOperator + 'undefined';

                    break;
            }

            latex = prependLatex + latex;
            latex = latex.replace('π', '\\pi');
            latex = MathUtilities.Components.EquationEngine.Models.ParserAssist.getEquationAccessibility(latex);

            if (absOutput === 0 || absOutput === 1 || absOutput === Infinity) {
                latex = latex + specialCase;
            }

            return latex;
        },

        /**
        * Function to find GCD of two numbers
        * @method findGCD
        */
        findGCD: function (val1, val2) {

            var value = 1;
            if (val2 !== 1) {
                if (val2 > val1)
                    value = val1;
                else
                    value = val2;

                for (i = value; i >= 1; i--) {
                    if (val2 % i == 0 && val1 % i == 0) {
                        value = i;
                        break;
                    }
                }
                return value;
            }

            return value;
        },


        /**
       * Function to create json object which is to be used to create equation structure.
       * @method _trignometricMathEquation
       * @private
       */
        _trignometricMathEquation: function (option, initAngle, distance, radius) {

            var eqationType, angle;

            angle = classNameTab1.GET_ANGLE_IN_RADIANS(initAngle, true);

            // 0, π, π/3 type equation
            option.angleType = { Type1: false, Type2: false, Type3: false };
            if (angle.numerator === '0' || ((angle.numerator === '2π' || angle.numerator === '-2π') && angle.denominator === '')) {
                option.angleType.Type1 = true;
                option.angleNormal = angle.numerator;
            }
            else if ((angle.numerator === 'π' || angle.numerator === '-π') && angle.denominator === '') {
                option.angleType.Type2 = true;
                option.angleType.angleOperator = '';
                if (angle.numerator === '-π') {
                    option.angleType.angleOperator = '-';
                }
            }
            else {
                option.angleType.Type3 = true;
                option.angleNormal = angle.numerator;
                option.angleDenominator = angle.denominator;
            }


            // '',3,3.4 type of radius
            option.radiusValType = { Type1: false, Type2: false, Type3: false };
            if (radius === 1) {
                option.radiusValType.Type1 = true;
            }
            else if (radius % parseInt(radius, 10) > 0) {
                option.radiusValType.Type2 = true;
                option.radiusNormal = parseInt(radius, 10);
                var decimal = radius.toString().split('.');
                option.radiusDecimal = decimal[1];
            }
            else {
                option.radiusValType.Type3 = true;
                option.radiusNormal = radius;
            }


            // '',3,3.4 type of distance
            option.distanceValType = { Type1: false, Type2: false, Type3: false };
            if (distance === 1) {
                option.distanceValType.Type1 = true;
            }
            else if (distance % parseInt(distance, 10) > 0) {
                option.distanceValType.Type2 = true;
                option.distanceNormal = parseInt(distance, 10);
                var decimal = distance.toString().split('.');
                option.distanceDecimal = decimal[1];
            }
            else {
                option.distanceValType.Type3 = true;
                option.distanceNormal = distance;
            }


            // sin/cos/tan text
            var sineCosMsgNo = 0;
            if (this.trignometricFunction.Sine) {
                sineCosMsgNo = 0;
            }
            else if (this.trignometricFunction.Cos) {
                sineCosMsgNo = 1;
            }
            else if (this.trignometricFunction.Tan) {
                sineCosMsgNo = 2;
            }
            option.trignometricType = this.getMessage('sin-cos-text', sineCosMsgNo);

            return option;

        },



        maxValuePossible: function (baseAngle, distance, radius) {

            var maxValue = 0, angle = 0, equationValue;

            if (this.trignometricFunction.Tan && baseAngle !== 0) {
                while (angle <= 360) {

                    equationValue = radius * Math.tan(distance * (angle) * Math.PI / 180);
                    equationValue = Math.round(equationValue * 1000) / 1000;

                    if (maxValue < equationValue && equationValue < 100) {
                        maxValue = equationValue;
                    }
                    angle = angle + baseAngle;
                }
            }

            this.trigger(namespace.ExploreTrignometricGraphing.CHANGE_YAXIS_LIMIT, { value: maxValue });

        },


        /**
        * Function to render surds using math jax library.
        * @method mathJaxOutput
        */
        mathJaxOutput: function (initAngle, distance, radius) {

            var outputValue = this.trignometricOutput(initAngle, distance, radius);
            var option = this._getJsonOfSurd(initAngle, distance, radius);

            option = this._trignometricMathEquation(option, initAngle, distance, radius);

            var latex = this._getLatexString(initAngle, distance, radius, option);
            this.setAccMessage('equation-container', latex);

            if (option !== null) {

                outputVal = MathInteractives.Common.Interactivities.TrignometricGraphing.templates.surdsFormat(option).trim();
                this.setMessage('output-value', outputVal);

                if (!option.denominatorPresent && (option.surdType.Type10 || (option.surdType.Type6 && option.val3 === ''))) {
                    this.$el.find('.surd-format').css('margin-top', '0px');
                }
                else {
                    this.$el.find('.surd-format').css('margin-top', '-5px');
                }

                var idMathjax = this.idPrefix + 'surd-format';
                MathJax.Hub.Queue(['Typeset', MathJax.Hub, idMathjax]);

                var self = this;
                MathJax.Hub.Queue(function () {

                    if (self.trignometricFunction.Tan) {

                        $canvas = $('#' + self.idPrefix + 'graph-canvas-container');
                        var canvasWidth = $canvas.width(), canvasLeft = parseInt($canvas.css('left').replace('px', ''), 10),
                        equationWidth = $('#' + self.idPrefix + 'equation-container').width() + 30;

                        if (equationWidth < canvasWidth) {
                            $('#' + self.idPrefix + 'explore-tab-activity').find('.equation-container-box').css({ 'width': canvasWidth + 'px', 'left': canvasLeft + 'px' });
                        }
                        else {
                            var diff = equationWidth - canvasWidth, left = canvasLeft - diff;
                            $('#' + self.idPrefix + 'explore-tab-activity').find('.equation-container-box').css({ 'width': equationWidth + 'px', 'left': left + 'px' });
                        }
                    }
                    //self.updateFocusRect()
                    self.updateFocusRect('equation-container');
                });

            }
        },


        //  /**
        //* Stop moving of activity on touch move
        //* @method _labelEventStop
        //* @private
        //*/
        //  _labelEventStop: function () {

        //      this.$el.find('.fraction-container').one('touchmove', function (event) {
        //          event.preventDefault(); //fix for android. if we dont do event.preventDefault() mouse up doesnt fire in android
        //      });

        //  },

        /**
       * Activate current paper Scope
       * @method _activatePaperScope
       * @private
       */
        _activatePaperScope: function () {
            this.paperScope.activate();
        }

    },
    {
        CHANGE_ANGLE: 'change-angle',
        RADIUS_CHANGE: 'radiusChangeEvent',
        DISTANCE_MULTIPLIER_CHANGE: 'distanceMultiplierChangeEvent',
        SHOW_POINT_CHANGE: 'showPointChange',
        CHANGE_YAXIS_LIMIT: 'changeYaxisLimit',

        generateTrignometricGraphView: function (model, $_el) {
            if (model) {
                var trignometricGraphView = new namespace.ExploreTrignometricGraphing({ model: model, el: $_el });
                return trignometricGraphView;
            }
        }

    });


})();