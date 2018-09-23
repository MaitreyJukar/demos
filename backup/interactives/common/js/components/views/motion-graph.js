(function () {
    'use strict';

    var MotionGraph = null;

    /**
    * Model for properties used in the 'Explore' tab
    *
    * @class ExploreMotion
    * @constructor
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @namespace MathInteractives.Common.Components.Models
    **/
    MotionGraph = MathInteractives.Common.Player.Views.Base.extend({

        manager: null,

        filePath: null,

        idPrefix: null,

        disabledBtnRaster: null,

        hoverBtnRaster: null,

        activeBtnRaster: null,

        allowLineDraw: false,

        allowLineDrag: false,

        myPaper: null,

        tool: null,

        myPath: null,

        currentGroup: null,

        xMaxBoundry: null,

        xMinBoundry: null,

        yMaxBoundry: null,

        yMinBoundry: null,

        allPaths: [],

        pathCount: 0,

        pointToMove: null,

        endPointRadius: 9,

        originalPoint: null,

        drawingColor: '#4c1787',

        drawingLineHoverColor: '#BC417E',

        drawingCircleColor: '#FFFFFF',

        hitAreaCircleRadius: 11,

        drawingCircleStrokeColor: '#7C708C',

        staticCircleColor: '#00b9e6',

        staticCircleStrokeColor: '#00b9e6',

        lineWidth: 5,

        invisibleLine: null,

        invisibleLineStrokeWidth: 12,

        plotColor: '#00b9e6',

        gridLineThickness: 1,

        gridLineColor: '#BBBBBB',

        axisLineThickness: 1,

        axisLineColor: '#BBBBBB',

        axisLabelFontSize: 16,

        startPoints: null,

        endPoints: null,

        clearAllBtn: null,

        drawLineBtnView: null,
        dragLineBtnView: null,

        userGraphBtnView: null,
        feedbackGraphBtnView: null,

        xMinGraph: null,
        xMaxGraph: null,
        yMinGraph: null,
        yMaxGraph: null,

        originX: null,
        originY: null,

        player: null,

        currentGridPosition: {},

        preventLongTap: false,

        showControls: false,

        toolTipText: null,

        /**
        * Vertical distance of labels on x-axis from the x-axis
        * @property xLabelDistFromAxis
        * @type Number
        * @default 29
        */
        xLabelDistFromAxis: 29,

        /**
        * Horizontal distance of labels on y-axis from the y-axis
        * @property yLabelDistFromAxis
        * @type Number
        * @default 22
        */
        yLabelDistFromAxis: 22,

        /**
        * Vertical distance of labels on y-axis by which they must be pulled down to vertically align them to the grid
        * @property yLabelVerticalOffset
        * @type Number
        * @default 5
        */
        yLabelVerticalOffset: 5,

        /**
        * The horizontal distance by which the tooltip should be positioned away from mouse pointer.
        * @property toolTipXOffset
        * @type Number
        * @default 25
        */
        toolTipXOffset: null,
        /**
        * The vertical distance by which the tooltip should be positioned away from mouse pointer.
        * @property toolTipYOffset
        * @type Number
        * @default null
        */
        toolTipYOffset: null,

        toolTipBackGroundImageIds: null,

        initialize: function () {

            var view = this,
                $el = null,
                model = null,
                $canvas = null,
                currentTool = null,
                myPaper;

            $el = view.$el;
            model = view.model;

            view.manager = model.get('manager');
            view.filePath = model.get('path');
            view.idPrefix = model.get('idPrefix');

            //            this.unloadScreen('motion-graph-text');
            //            this.loadScreen('motion-graph-text');
            view.toolTipText = model.get('toolTipText');

            view.toolTipXOffset = model.get('toolTipXOffset');
            view.toolTipYOffset = model.get('toolTipYOffset');

            view.toolTipXOffset = (view.toolTipXOffset === null || typeof view.toolTipXOffset === 'undefined') ? 25 : Number(view.toolTipXOffset);

            view.toolTipBackGroundImageIds = model.get('toolTipBackGroundImageIds');

            view.xLabelDistFromAxis = model.get('xLabelDistFromAxis') || view.xLabelDistFromAxis;
            view.yLabelDistFromAxis = model.get('yLabelDistFromAxis') || view.yLabelDistFromAxis;
            view.yLabelVerticalOffset = model.get('yLabelVerticalOffset') || view.yLabelVerticalOffset;

            $canvas = $el.find('canvas');

            this.myPaper = new paper.PaperScope();
            myPaper = this.myPaper;
            myPaper.setup($canvas[0]);
            myPaper.activate();
            currentTool = this.tool = new myPaper.Tool();
            currentTool.view = this;
            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) {

                currentTool.onMouseDrag = $.proxy(this.manageMouseMovefeatures, view);
                currentTool.onMouseUp = function (event) {

                    view.positionTooltip(event);
                    var $tooltip = view.$('#' + view.idPrefix + 'tooltip-container');

                    $tooltip.hide();
                    view.fireEventOnMouseup(event);


                }
            } else {
                currentTool.onMouseMove = $.proxy(this.manageMouseMovefeatures, this);
                currentTool.onMouseUp = $.proxy(this.fireEventOnMouseup, this);
            }


            this.setUpGraph();
            this.model.on('change', this.repaint, this);

            if (this.model.get('showControls')) {
                this.showControls = this.model.get('showControls');
            }

            this.render();
            if (this.model.get('allowDrawing')) {
                this.allowLineDrawing();
            }

            this.player = model.get('player');

            this.xMinGraph = (model.get('xAxis')).get('min');
            this.xMaxGraph = (model.get('xAxis')).get('max');


            this.yMinGraph = (model.get('yAxis')).get('min');
            this.yMaxGraph = (model.get('yAxis')).get('max');

            this.originX = (model.get('origin')).get('x');
            this.originY = (model.get('origin')).get('y');

            //   this._hideTrashCanRaster();


        },

        render: function () {

            this.repaint();
            this.generateButtons();
            this._renderTooltip();
            this._hideTrashCanRaster();
            this._hideControlButtons();
        },

        _renderTooltip: function () {
            var tooltip = '<div id="' + this.idPrefix + 'tooltip-container" class="draggable-tooltip-container"><div id="' + this.idPrefix + 'tooltip-left" class="draggable-tooltip-left"></div><div id="' + this.idPrefix + 'tooltip-mid" class="draggable-tooltip-mid typography-body-text"></div><div id="' + this.idPrefix + 'tooltip-right" class="draggable-tooltip-right"></div></div>';

            this.$el.find('.graph-it-graph-container-main-wrapper').append(tooltip);
            //            this.$el.append(tooltip);

            var bGImageIds = this.toolTipBackGroundImageIds;
            if (bGImageIds !== 'none') {
                var tooltipPart, imageId;
                imageId = (bGImageIds && bGImageIds.left) ? bGImageIds.left : 'tooltip-left';
                tooltipPart = this.filePath.getImagePath(imageId);
                this.$('.draggable-tooltip-left').css({ 'background-image': 'url("' + tooltipPart + '")' });

                imageId = (bGImageIds && bGImageIds.left) ? bGImageIds.middle : 'tooltip-middle';
                tooltipPart = this.filePath.getImagePath(imageId);
                this.$('.draggable-tooltip-mid').css({ 'background-image': 'url("' + tooltipPart + '")' });

                imageId = (bGImageIds && bGImageIds.left) ? bGImageIds.right : 'tooltip-right';
                tooltipPart = this.filePath.getImagePath(imageId);
                this.$('.draggable-tooltip-right').css({ 'background-image': 'url("' + tooltipPart + '")' });
                this.$('.draggable-tooltip-container').hide();
            }
        },


        fireEventOnMouseup: function (event) {

            var $tooltip = this.$('#' + this.idPrefix + 'tooltip-container');
            this.positionTooltip(event);
            if ($tooltip !== null || $tooltip !== "undefined") {
                $tooltip.hide();
            }

            this.trigger(MathInteractives.Common.Components.Views.MotionGraph.CUSTOM_MOUSEUP_EVENT_FIRED, event, this.currentGridPosition);

        },
        _hideTrashCanRaster: function () {
            var self = this,
                hideRaster = self.model.get('hideRaster');

            if (hideRaster === true) {

                this.disabledBtnRaster.visible = false;
                this.activeBtnRaster.visible = false;
                this.hoverBtnRaster.visible = false;

            }



        },


        _hideControlButtons: function _hideControlButtons() {

            if (this.model.get('hideControlButtons')) {

                this.$('#' + this.idPrefix + 'graph-controls').hide();

            }


        },



        generateButtons: function () {
            if (this.showControls === false) {
                return;
            }
            if (this.$el.find('.graph-controls').length === 0) {
                return;
            }

            var drawLineBtn, dragLineBtn, usersGraphButton, feedbackGraphButton, clearAllBtn;

            this.$('.graph-controls').show();

            drawLineBtn = {
                id: this.idPrefix + 'draw-line-btn',
                type: MathInteractives.Common.Components.Views.Button.TYPE.ACTION_DRAW_LINE,
                path: this.filePath
            };
            this.drawLineBtnView = MathInteractives.global.Button.generateButton(drawLineBtn);

            this.$('#' + this.idPrefix + 'draw-line-label').addClass('typography-label');

            dragLineBtn = {
                id: this.idPrefix + 'move-line-btn',
                type: MathInteractives.Common.Components.Views.Button.TYPE.ACTION_MOVE,
                path: this.filePath
            };

            this.dragLineBtnView = MathInteractives.global.Button.generateButton(dragLineBtn);

            this.$('#' + this.idPrefix + 'move-line-label').addClass('typography-label');

            //this.drawLineBtnView.$el.trigger('click');

            this.dragLineBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);

            MathInteractives.global.Button.toggleButtonHandler({ buttonObjects: [this.drawLineBtnView, this.dragLineBtnView] });
            //this.drawLineBtnView.$el.trigger('click');

            usersGraphButton = {
                id: this.idPrefix + 'users-graph-btn',
                type: MathInteractives.Common.Components.Views.Button.TYPE.ACTION,
                toggleButton: true,
                icon: {
                    pathId: 'users-graph-line',
                    width: 26,
                    height: 2
                },
                width: 56,
                height: 32,
                path: this.filePath
            };
            this.userGraphBtnView = MathInteractives.global.Button.generateButton(usersGraphButton);

            this.userGraphBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_SELECTED);

            this.$('#' + this.idPrefix + 'users-graph-label').addClass('typography-body-text');

            feedbackGraphButton = {
                id: this.idPrefix + 'feedback-graph-btn',
                type: MathInteractives.Common.Components.Views.Button.TYPE.ACTION,
                toggleButton: true,
                icon: {
                    pathId: 'feedback-graph-line',
                    width: 26,
                    height: 2
                },
                width: 56,
                height: 32,
                path: this.filePath
            };
            this.feedbackGraphBtnView = MathInteractives.global.Button.generateButton(feedbackGraphButton);

            this.feedbackGraphBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_SELECTED);

            this.$('#' + this.idPrefix + 'feedback-graph-label').addClass('typography-body-text');

            clearAllBtn = {
                id: this.idPrefix + 'clear-graph-btn',
                type: MathInteractives.Common.Components.Views.Button.TYPE.ACTION,
                path: this.filePath,
                text: 'Clear All'
            };
            this.clearAllBtn = MathInteractives.global.Button.generateButton(clearAllBtn);
            this.clearAllBtn.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);
        },

        events: {
            'click .draw-line-btn.click-enabled': 'allowLineDrawing',
            'click .move-line-btn.click-enabled': 'allowLineDraging',
            'click .users-graph-btn': 'showHideUserDrawnGraph',
            'click .feedback-graph-btn': 'showHideFeedbackGraph',
            'click .clear-graph-btn.click-enabled': 'clearUserCreatedGraph'
        },

        setUpGraph: function () {
            var i, path, points, yTicks, xTicks, yInterval, xInterval,
                x, y, xLabel, yLabel, verticalLineHeight, title, horizontalLineLength, origin, model, graphObject, tickLength,
                origin = {}, xStepSize, yStepSize, xAxis, yAxis, graphTitle, xUnitsPerStepSize, yUnitsPerStepSize, myPaper,
                verticalLineSize, horizontalLineSize,
                stepValueColor, characterStyle, showGridLines, ignoreZero;

            myPaper = this.myPaper;
            graphObject = this.model;
            xAxis = graphObject.get('xAxis');
            yAxis = graphObject.get('yAxis');
            yTicks = yAxis.get('max');
            xTicks = xAxis.get('max');
            yInterval = yAxis.get('unitsPerStepSize');
            xInterval = xAxis.get('unitsPerStepSize');
            tickLength = graphObject.get('tickLength');
            origin.x = graphObject.get('origin').get('x');
            origin.y = graphObject.get('origin').get('y');
            xStepSize = xAxis.get('stepSize');
            yStepSize = yAxis.get('stepSize');
            graphTitle = graphObject.get('title');
            xUnitsPerStepSize = xAxis.get('unitsPerStepSize');
            yUnitsPerStepSize = yAxis.get('unitsPerStepSize');
            verticalLineSize = graphObject.get('verticalLineSize');
            horizontalLineSize = graphObject.get('horizontalLineSize');
            stepValueColor = graphObject.get('stepValueColor');
            characterStyle = graphObject.get('characterStyle');
            showGridLines = graphObject.get('showGridLines');
            ignoreZero = graphObject.get('ignoreZero');
            if (stepValueColor === null) {
                stepValueColor = '#777777';
            }
            this.axisLineColor = graphObject.get('xAxisStrokeColor') || this.axisLineColor;
            this.gridLineColor = graphObject.get('xAxisStrokeColor') || this.gridLineColor;

            if (verticalLineSize !== null) {

                verticalLineHeight = verticalLineSize;
                yTicks = verticalLineSize;
                // yAxis.set('max', verticalLineSize);
                yStepSize = graphObject.get('yAxisStepSize');
                yAxis.set('stepSize', yStepSize);
            }
            else {
                verticalLineHeight = (yStepSize * yTicks / yInterval) + tickLength;
            }

            if (horizontalLineSize !== null) {

                horizontalLineLength = horizontalLineSize;
                xTicks = horizontalLineSize;
                //  xAxis.set('max', horizontalLineSize);
                xStepSize = graphObject.get('xAxisStepSize');
                xAxis.set('stepSize', xStepSize);

            }
            else {
                horizontalLineLength = (xStepSize * xTicks / xInterval) + tickLength;
            }

            for (i = 0; i < xTicks / xInterval + 1; i++) {
                // verticle
                x = origin.x + i * xStepSize;
                if (i === 0) {
                    path = new myPaper.Path.Line({
                        from: [x, origin.y + tickLength],
                        to: [x, origin.y + tickLength - verticalLineHeight]
                    });
                    if (showGridLines === true) {
                        path.strokeColor = this.axisLineColor;
                        path.strokeWidth = this.axisLineThicknes;
                    }
                }
                else {
                    path = new myPaper.Path.Line({
                        from: [x, origin.y + tickLength],
                        to: [x, origin.y + tickLength - verticalLineHeight]
                    });
                    if (showGridLines === true) {
                        path.strokeColor = this.gridLineColor;
                        path.strokeWidth = this.gridLineThickness;
                    }
                }

                points = new myPaper.PointText(new myPaper.Point(x, origin.y + tickLength + this.xLabelDistFromAxis));
                points.style = {
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'bold',
                    fontSize: 16,
                    fillColor: stepValueColor
                }

                if (characterStyle !== null || typeof characterStyle !== 'undefined') {
                    points.characterStyle = characterStyle;
                }

                points.content = (xInterval * i).toString();
                points.justification = 'center';
                if (ignoreZero === true && i === 0) {
                    points.remove();
                }
            }

            for (i = 0; i < yTicks / yInterval + 1; i++) {
                y = origin.y - i * yStepSize;

                // horizontal
                if ((y > 10 && verticalLineSize !== null) || verticalLineSize === null) {
                    points = new myPaper.PointText(new myPaper.Point(origin.x - tickLength - this.yLabelDistFromAxis, y + this.yLabelVerticalOffset));


                    points.style = {
                        fontFamily: 'Arial, sans-serif',
                        fontWeight: 'bold',
                        fontSize: 16,
                        fillColor: stepValueColor
                    }

                    if (characterStyle !== null || typeof characterStyle !== 'undefined') {
                        points.characterStyle = characterStyle;
                    }

                    points.content = (yInterval * i).toString();
                    points.justification = 'center';
                    if (ignoreZero === true && i === 0) {
                        points.remove();
                    }
                }
                if (i === 0) {
                    path = new myPaper.Path.Line({
                        from: [origin.x - tickLength, y],
                        to: [horizontalLineLength + origin.x - tickLength, y]
                    });
                    if (showGridLines === true) {
                        path.strokeColor = this.axisLineColor;
                        path.strokeWidth = this.axisLineThicknes;
                    }
                }
                else {
                    path = new myPaper.Path.Line({
                        from: [origin.x - tickLength, y],
                        to: [horizontalLineLength + origin.x - tickLength, y]
                    });
                    if (showGridLines === true) {
                        path.strokeColor = this.gridLineColor;
                        path.strokeWidth = this.gridLineThickness;
                    }
                }
            }

            // draw graph controls
            this.trashCanRasters(graphObject.get('trashCanCustomPosition'));

            // set visibility of graph controls as per input
            this.showHideGraphControls(this.model.get('showControlOnInit'));

            // record graph boundries

            this.xMaxBoundry = xTicks * (xStepSize / xUnitsPerStepSize) + origin.x;
            this.xMinBoundry = origin.x;
            this.yMaxBoundry = origin.y;
            this.yMinBoundry = origin.y - yTicks * (yStepSize / yUnitsPerStepSize);
        },

        allowLineDrawing: function (event) {
            this.allowLineDraw = true;
            this.allowLineDrag = false;
            this.detachSegmentRelocateEvents();
            this.attachDrawingEvents();
            //this.showHideLineEndPoints(false)
        },

        allowLineDraging: function (event) {
            this.allowLineDraw = false;
            this.allowLineDrag = true;

            this.detachDrawingEvents();
            //this.showHideLineEndPoints(true);
            this.attachSegmentRelocateEvents();
        },

        _isPathDisjoint: function () {
            var allPaths = this.allPaths;
            var pathNumber = allPaths.length;

            if (pathNumber <= 0) {
                return false;
            }

            var line, lineLength, startPoint, endPoint, startPoints = new Array(), endPoints = new Array(), convertedStartPoint, convertedEndPoint;
            for (var i = 0; i < pathNumber; i++) {
                line = allPaths[i].children[0];
                lineLength = line.segments.length;

                startPoint = line.segments[0];
                endPoint = line.segments[lineLength - 1];

                convertedStartPoint = (this._getPointFromLogicalCoordinate({ x: startPoint.point.x, y: startPoint.point.y })).attributes;
                convertedEndPoint = (this._getPointFromLogicalCoordinate({ x: endPoint.point.x, y: endPoint.point.y })).attributes;

                startPoints.push({ x: Math.round(Number(convertedStartPoint.x)), y: Math.round(Number(convertedStartPoint.y)) });
                endPoints.push({ x: Math.round(Number(convertedEndPoint.x)), y: Math.round(Number(convertedEndPoint.y)) });
            }

            this.startPoints = startPoints;
            this.endPoints = endPoints;

            var arrPoints = this._bubbleSortArray(startPoints, endPoints);

            startPoints = arrPoints[0];
            endPoints = arrPoints[1];

            for (var z = 0; z < (pathNumber - 1); z++) {
                if ((endPoints[z].x !== startPoints[z + 1].x) || (endPoints[z].y !== startPoints[z + 1].y)) {
                    return true;
                }
            }

            return false;
        },

        _bubbleSortArray: function myBubbleSort(startPoints, endPoints) {
            var dummy;
            var length = startPoints.length;
            for (var i = 0; i < (length - 1); i++) {

                for (var j = i + 1; j < length; j++)

                    if (startPoints[j].x < startPoints[i].x) {

                        dummy = startPoints[i];
                        startPoints[i] = startPoints[j];
                        startPoints[j] = dummy;

                        dummy = endPoints[i];
                        endPoints[i] = endPoints[j];
                        endPoints[j] = dummy;
                    }
            }

            return [startPoints, endPoints];
        },

        _arePointsDrawnCorrect: function _arePointsDrawnCorrect() {
            var plot = this.model.get('referencePlot');

            if (!plot || !this.startPoints || !this.endPoints) {
                return false;
            }

            var correctPoints = plot.get('points').toJSON();

            var totalPoints = correctPoints.length;

            if (totalPoints <= 0) {
                return false;
            }

            var newPoints = this.startPoints;
            newPoints.push(this.endPoints[this.endPoints.length - 1]);

            for (var i = 0; i < totalPoints; i++) {
                if ((correctPoints[i].x !== newPoints[i].x) || (correctPoints[i].y !== newPoints[i].y)) {
                    return false;
                }
            }
            return true;
        },

        arePointsCorrect: function arePointsCorrect() {
            if (!this._isPathDisjoint()) {
                if (this._arePointsDrawnCorrect()) {
                    return true;
                }
            }
            this.startPoints = null;
            this.endPoints = null;
            return false;
        },

        showHideLineEndPoints: function (showEndpoints) {
            var endPointRadius, allGroups, allGroupsCount, i, path, currentGroup,
                firstEndPoint, secondEndPoint, myPaper;

            myPaper = this.myPaper;

            showEndpoints ? endPointRadius = this.endPointRadius : endPointRadius = 0;

            allGroups = this.allPaths;
            allGroupsCount = this.allPaths.length;

            for (i = 0; i < allGroupsCount; i++) {
                currentGroup = allGroups[i];
                path = allGroups[i].children[0];

                firstEndPoint = currentGroup.children[1];
                if (showEndpoints) {
                    firstEndPoint.scale(100);
                }
                else {
                    firstEndPoint.scale(0.01);
                }

                secondEndPoint = currentGroup.children[2];

                if (showEndpoints) {
                    secondEndPoint.scale(100);
                }
                else {
                    secondEndPoint.scale(0.01);
                }
            }
        },

        attachDrawingEvents: function () {
            var tool = this.tool;
            tool.onMouseUp = null;
            tool.onMouseDown = this.startLine;
            tool.onMouseDrag = $.proxy(this.drawLineOnDrag, this);
            tool.onMouseUp = $.proxy(this.endLine, this);
            tool.onDoubleClick = this.doubleClickOnLine;
        },

        detachDrawingEvents: function () {
            var tool = this.tool, self = this;
            tool.onMouseUp = null;
            tool.onMouseDown = null;
            tool.onMouseDrag = null;
            tool.onMouseUp = function () {
                var $tooltip = self.$('#' + self.idPrefix + 'tooltip-container');
                $tooltip.hide();
            };
        },

        doubleClickOnLine: function (event) {
            return;
        },

        startLine: function (event) {

            var myView = this.view;
            var point, snappedPoint, isValidPoint, startPointRadius, myPaper;

            if (myView.preventLongTap) {
                return
            }

            myView.preventLongTap = true;

            myPaper = myView.myPaper;

            isValidPoint = myView.isValidPoint(event.point);
            startPointRadius = myView.endPointRadius;

            // return if point is not valid
            if (!isValidPoint) {
                myView.preventLongTap = false;
                return;
            }

            if (myView.allowLineDraw && !myView.allowLineDrag) {
                // enable move line button

                snappedPoint = myView.model.getSnappedPoint(event.point);
                point = new myPaper.Point(snappedPoint.x, snappedPoint.y);

                myView.currentGroup = new myPaper.Group();

                myView.myPath = new myPaper.Path();
                myView.myPath.add(point);
                myView.myPath.strokeColor = myView.drawingColor;
                myView.myPath.strokeWidth = myView.lineWidth;
                myView.myPath.strokeCap = 'round';
                myView.myPath.strokeJoin = 'bevel';

                myView.myPath.shadowColor = new myPaper.Color(0, 0, 0);
                myView.myPath.shadowColor.alpha = 0.68;
                myView.myPath.shadowBlur = 3;
                myView.myPath.shadowOffset = new myPaper.Point(2, 2);




                var firstEndPoint = new myPaper.Path.Circle(point, startPointRadius);
                firstEndPoint.fillColor = {
                    gradient: {
                        stops: [['#ffffff', 0], ['#cec8d8', 1]],
                        radial: false
                    },
                    origin: { x: firstEndPoint.position._x, y: firstEndPoint.position._y - startPointRadius },
                    destination: { x: firstEndPoint.position._x, y: firstEndPoint.position._y + startPointRadius }
                };
                firstEndPoint.strokeColor = myView.drawingCircleStrokeColor;

                firstEndPoint.shadowColor = new myPaper.Color(0, 0, 0);
                firstEndPoint.shadowBlur = 3;
                firstEndPoint.shadowOffset = new myPaper.Point(2, 1);

                myView.invisibleLine = new myPaper.Path();
                myView.invisibleLine.add(point);
                myView.invisibleLine.strokeColor = 'green';
                myView.invisibleLine.strokeWidth = myView.invisibleLineStrokeWidth;
                myView.invisibleLine.strokeCap = 'round';
                myView.invisibleLine.strokeJoin = 'round';
                myView.invisibleLine.opacity = 0.01;

                var firstInvisibleEndPoint = new myPaper.Path.Circle(point, myView.hitAreaCircleRadius);
                firstInvisibleEndPoint.fillColor = myView.drawingCircleColor;
                firstInvisibleEndPoint.strokeColor = myView.drawingCircleStrokeColor;
                firstInvisibleEndPoint.opacity = 0.01;

                myView.currentGroup = new myPaper.Group([myView.myPath, firstEndPoint, myView.invisibleLine, firstInvisibleEndPoint]);
            }
        },

        drawLineOnDrag: function (event) {
            var point, myPaper;
            if (!this.myPath) {
                return;
            }

            myPaper = this.myPaper;

            if (this.allowLineDraw && !this.allowLineDrag) {
                point = {};

                if (this.myPath.segments.length > 1) {
                    this.myPath.segments.pop();
                    this.invisibleLine.segments.pop();
                }

                point = this.getValidPoint(event.point)
                this.myPath.add(new myPaper.Point(point));
                this.invisibleLine.add(new myPaper.Point(point));
            }

            this.positionTooltip(event);

            return;
        },

        endLine: function (event) {
            var firstEndPoint, secondEndPoint, startPointRadius, myPaper,
                snappedPoint, point, validPoint;
            var $tooltip = this.$('#' + this.idPrefix + 'tooltip-container');
            $tooltip.hide();
            if (!this.myPath) {
                return;
            }



            this.preventLongTap = false;

            myPaper = this.myPaper;
            firstEndPoint = this.myPath.segments[0].point;
            if (this.allowLineDraw && !this.allowLineDrag) {
                validPoint = this.getValidPoint(event.point);
                snappedPoint = this.model.getSnappedPoint(validPoint);
                point = new myPaper.Point(snappedPoint.x, snappedPoint.y);

                if (point.x === firstEndPoint.x && point.y === firstEndPoint.y) {
                    this.currentGroup.remove();
                    this.currentGroup = null;
                    this.myPath = null;
                    this.myPaper.view.draw();
                    return;
                }

                if (this.myPath.segments.length > 1) {
                    this.myPath.segments.pop();
                }

                this.myPath.add(point);
                startPointRadius = this.endPointRadius;
                secondEndPoint = new myPaper.Path.Circle(point, startPointRadius);
                secondEndPoint.fillColor = {
                    gradient: {
                        stops: [['#ffffff', 0], ['#cec8d8', 1]],
                        radial: false
                    },
                    origin: { x: secondEndPoint.position._x, y: secondEndPoint.position._y - startPointRadius },
                    destination: { x: secondEndPoint.position._x, y: secondEndPoint.position._y + startPointRadius }
                };

                secondEndPoint.shadowColor = new myPaper.Color(0, 0, 0);
                secondEndPoint.shadowBlur = 3;
                secondEndPoint.shadowOffset = new myPaper.Point(2, 1);
                secondEndPoint.strokeColor = this.drawingCircleStrokeColor;
                this.currentGroup.insertChild(2, secondEndPoint);

                var secondInvisibleEndPoint = new myPaper.Path.Circle(point, this.hitAreaCircleRadius);
                secondInvisibleEndPoint.fillColor = this.drawingCircleColor;
                secondInvisibleEndPoint.strokeColor = this.drawingCircleStrokeColor;
                secondInvisibleEndPoint.opacity = 0.01;
                this.currentGroup.insertChild(5, secondInvisibleEndPoint);

                this.currentGroup.pos = this.pathCount;
                this.currentGroup.name = 'name-' + this.pathCount.toString();
                this.allPaths.push(this.currentGroup);
                this.pathCount += 1;

                if (this.allPaths.length > 0) {
                    this.disabledBtnRaster.visible = false;
                    this.activeBtnRaster.visible = true;
                }
                else {
                    this.disabledBtnRaster.visible = true;
                    this.activeBtnRaster.visible = false;
                }

                this.myPath = null;

                this.dragLineBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_ACTIVE);
                this.clearAllBtn.setButtonState(MathInteractives.global.Button.BUTTON_STATE_ACTIVE);
                this.trigger(MathInteractives.Common.Components.Views.MotionGraph.FIRST_LINE_DRAWN);
            }
        },

        manageMouseMovefeatures: function (event) {
            this.positionTooltip(event);

            if (!this.allowLineDraw) {
                return;
            }

            this.manageCursor(event.point);

        },

        manageCursor: function (point) {
            if (this.isValidPoint(point)) {
                this.$el.find('.graph-it-canvas').addClass('crossHairCursor');
            }
            else {
                this.$el.find('.graph-it-canvas').removeClass('crossHairCursor');
            }
            return
        },

        positionTooltip: function (event) {

            var points = (this._getPointFromLogicalCoordinate({ x: event.point.x, y: event.point.y })).attributes,
                roundedPoints = null,
                verticalLineSize = this.model.get('verticalLineSize'),
                graphModel = this.model,
                xAxis = graphModel.get('xAxis'),
                yAxis = graphModel.get('yAxis'),
                xStepSize = xAxis.get('stepSize'),
                yStepSize = yAxis.get('stepSize'),
                xUnitsPerStep = xAxis.get('unitsPerStepSize'),
                yUnitsPerStep = yAxis.get('unitsPerStepSize'),
                eventPointX = event.point.x,
                eventPointY = event.point.y,
                toolTipYOffset = this.toolTipYOffset,
                toolTipTextPrecision = this.model.get('toolTipTextPrecision'),
                currentGridPosition = this.currentGridPosition;

            toolTipTextPrecision = (toolTipTextPrecision && toolTipTextPrecision !== 0) ? Number(toolTipTextPrecision) : 1;

            roundedPoints = {
                x: Math.round(points.x / toolTipTextPrecision) * toolTipTextPrecision,
                y: Math.round(points.y / toolTipTextPrecision) * toolTipTextPrecision
            };

            var $tooltip = this.$('#' + this.idPrefix + 'tooltip-container');

            if (this.player.getModalPresent()) {
                return;
            }
            if ((roundedPoints.x >= this.xMinGraph) && (roundedPoints.x <= this.xMaxGraph) && (roundedPoints.y >= this.yMinGraph) && (roundedPoints.y <= this.yMaxGraph)) {

                var xValue = roundedPoints.x;
                var yValue = roundedPoints.y;

                currentGridPosition.xValue = xValue;
                currentGridPosition.yValue = yValue;

                var tooltipText = this.toolTipText;
                var tooltipTextMsg = (tooltipText && tooltipText.message) ? tooltipText.message : '%@$%, %@$%';
                var tooltipMsgUnits = (tooltipText && tooltipText.units) ? tooltipText.units : [];
                var params = [];
                if (tooltipMsgUnits.length && tooltipMsgUnits.length === 4) {
                    params.push(xValue + tooltipMsgUnits[(xValue === 1 || xValue === 0) ? 0 : 1]);
                    params.push(yValue + tooltipMsgUnits[(yValue === 1 || yValue === 0) ? 2 : 3]);
                }
                else {
                    params.push(xValue);
                    params.push(yValue);
                }
                tooltipTextMsg = this._replaceSpecialStr(tooltipTextMsg, params);
                this.$('.draggable-tooltip-mid').html(tooltipTextMsg);
                toolTipYOffset = (toolTipYOffset === null || typeof toolTipYOffset === 'undefined') ? $tooltip.height() / 2 : Number(toolTipYOffset);
                $tooltip.show().css({ 'left': String(event.point.x + this.toolTipXOffset) + 'px', 'top': String(event.point.y + toolTipYOffset) + 'px' });
            }
            else {
                $tooltip.hide();
            }
        },

        /**
        * Replaces the '%@$%' in given message with strings in the given array.
        * @method _replaceSpecialStr
        * @private
        * @param message {String} Message which is to be modified.
        * @param arrParam Array of strings.
        * @return {String} Returns The modified message removing'%@$%'.
        **/
        _replaceSpecialStr: function (message, arrParam) {
            for (var i = 0; i < arrParam.length; i++) {
                message = message.replace('%@$%', arrParam[i]);
            }
            return message;
        },

        triggerMouseUp: function (event) {
            var group, e, viewObj, target, cond, self;

            group = event.data.group;
            viewObj = event.data.viewObj;
            target = $(event.target);
            self = this;

            cond = target.parents('#' + viewObj.$el.attr('id')).length > 0;

            if (!cond) {
                e = {};
                e.point = viewObj.originalPoint;
                group.fire('mouseup', e);
            }

            $(this).off('mouseup', viewObj.triggerMouseUp);
        },

        attachSegmentRelocateEvents: function () {
            var allPathsCount, allPaths, i, currView;

            allPaths = this.allPaths
            allPathsCount = allPaths.length;
            currView = this;

            for (i = 0; i < allPathsCount; i++) {
                allPaths[i].onMouseDown = function (event) {
                    var viewObj, firstEndPoint, secondEndPoint, pointToMove, line, self;

                    this.bringToFront();
                    viewObj = currView;
                    viewObj.pointToMove = null;
                    line = this.children[0];
                    self = this;

                    firstEndPoint = line.segments[0].point;
                    secondEndPoint = line.segments[line.segments.length - 1].point;

                    // check on which part of the line is pointer
                    if (currView.distanceBetweenTwoPoints(event.point, firstEndPoint) < currView.hitAreaCircleRadius) {
                        viewObj.pointToMove = {};
                        viewObj.pointToMove.endPoint = this.children[1];
                        viewObj.pointToMove.index = 0;
                    }
                    else if (currView.distanceBetweenTwoPoints(event.point, secondEndPoint) < currView.hitAreaCircleRadius) {
                        viewObj.pointToMove = {};
                        viewObj.pointToMove.endPoint = this.children[2];
                        viewObj.pointToMove.index = this.children[0].segments.length - 1;
                    }
                    else {
                        viewObj.originalPoint = this.position;
                    }

                    $(document.body).on('mouseup', { group: self, viewObj: viewObj }, viewObj.triggerMouseUp);
                    return;
                },

                    allPaths[i].onMouseDrag = function (event) {
                        var viewObj, firstEndPoint, secondEndPoint, line, validPoint, invisibleLine;

                        viewObj = currView;
                        line = this.children[0];
                        invisibleLine = this.children[3];


                        if (viewObj.pointToMove) {
                            validPoint = currView.getValidPoint(event.point);
                            viewObj.pointToMove.endPoint.position = validPoint;

                            this.children[viewObj.pointToMove.index + 4].position = validPoint;
                            line.removeSegment(viewObj.pointToMove.index);
                            line.insert(viewObj.pointToMove.index, validPoint);

                            invisibleLine.removeSegment(viewObj.pointToMove.index);
                            invisibleLine.insert(viewObj.pointToMove.index, validPoint);
                        }

                        else {
                            this.position = event.point;
                        }


                        if (viewObj.pointerOverTrashCan(event.point)) {
                            viewObj.activeBtnRaster.visible = false;
                            viewObj.hoverBtnRaster.visible = true;
                        }
                        else {
                            viewObj.activeBtnRaster.visible = true;
                            viewObj.hoverBtnRaster.visible = false;
                        }

                        viewObj.positionTooltip(event);

                        return;
                    },

                    allPaths[i].onMouseEnter = function () {
                        var viewObj = currView;
                        this.children[0].strokeColor = viewObj.drawingLineHoverColor;
                        //this.children[1].strokeColor = viewObj.drawingLineHoverColor;
                        //this.children[2].strokeColor = viewObj.drawingLineHoverColor;

                        this.children[1].fillColor = {
                            gradient: {
                                stops: [['#cec8d8', 0], ['#ffffff', 1]],
                                radial: false
                            },
                            origin: { x: this.children[1].position._x, y: this.children[1].position._y - viewObj.endPointRadius },
                            destination: { x: this.children[1].position._x, y: this.children[1].position._y + viewObj.endPointRadius }
                        };
                        this.children[2].fillColor = {
                            gradient: {
                                stops: [['#cec8d8', 0], ['#ffffff', 1]],
                                radial: false
                            },
                            origin: { x: this.children[2].position._x, y: this.children[2].position._y - viewObj.endPointRadius },
                            destination: { x: this.children[2].position._x, y: this.children[2].position._y + viewObj.endPointRadius }
                        };

                        this.children[1].radius = 30;
                        this.children[2].radius = 30;

                        this.children[1].strokeWidth = 1;
                        this.children[2].strokeWidth = 1;

                        this.children[1].strokeColor = viewObj.drawingCircleStrokeColor;
                        this.children[2].strokeColor = viewObj.drawingCircleStrokeColor;

                        // add hand cursor
                        viewObj.$('.graph-it-canvas').addClass('handCursor');
                        return;
                    },

                    allPaths[i].onMouseLeave = function () {
                        var viewObj = currView, self = this;
                        this.children[0].strokeColor = viewObj.drawingColor;
                        //this.children[1].strokeColor = viewObj.drawingColor;
                        //this.children[2].strokeColor = viewObj.drawingColor;
                        //this.children[1].strokeWidth = 0;
                        //this.children[2].strokeWidth = 0;
                        this.children[1].fillColor = {
                            gradient: {
                                stops: [['#ffffff', 0], ['#cec8d8', 1]],
                                radial: false
                            },
                            origin: { x: this.children[1].position._x, y: this.children[1].position._y - viewObj.endPointRadius },
                            destination: { x: this.children[1].position._x, y: this.children[1].position._y + viewObj.endPointRadius }
                        };
                        this.children[2].fillColor = {
                            gradient: {
                                stops: [['#ffffff', 0], ['#cec8d8', 1]],
                                radial: false
                            },
                            origin: { x: this.children[2].position._x, y: this.children[2].position._y - viewObj.endPointRadius },
                            destination: { x: this.children[2].position._x, y: this.children[2].position._y + viewObj.endPointRadius }
                        };
                        // remove hand cursor
                        viewObj.$('.graph-it-canvas').removeClass('handCursor');
                        return;

                        this.children[1].strokeWidth = 1;
                        this.children[2].strokeWidth = 1;

                        this.children[1].radius = 9;
                        this.children[2].radius = 9;


                        this.children[1].strokeColor = viewObj.drawingCircleStrokeColor;
                        this.children[2].strokeColor = viewObj.drawingCircleStrokeColor;
                    },

                    allPaths[i].onMouseUp = function (event) {

                        var $tooltip = self.$('#' + self.idPrefix + 'tooltip-container');
                        $tooltip.hide();

                        var viewObj, pointDetails, snappedPoint, validPoint, validSnappedPoint, line, invisibleLine;
                        viewObj = currView;

                        line = this.children[0];
                        invisibleLine = this.children[3];

                        if (viewObj.pointToMove) {
                            //snap
                            validPoint = viewObj.getValidPoint(event.point)
                            validSnappedPoint = viewObj.getValidSnappedPoint(validPoint, this.pos);

                            viewObj.pointToMove.endPoint.position = validSnappedPoint;
                            this.children[viewObj.pointToMove.index + 4].position = validSnappedPoint;
                            line.removeSegment(viewObj.pointToMove.index);
                            line.insert(viewObj.pointToMove.index, validSnappedPoint);

                            invisibleLine.removeSegment(viewObj.pointToMove.index);
                            invisibleLine.insert(viewObj.pointToMove.index, validPoint);
                        }
                        else {
                            if (viewObj.pointerOverTrashCan(event.point)) {
                                // pointer over trash can then remove line
                                this.trigger('mouseleave');
                                viewObj.detachEventsOnIndividualSegments(this);
                                viewObj.removePath(this);
                                this.remove();
                                viewObj.hoverBtnRaster.visible = false;

                                if (currView.allPaths.length > 0) {
                                    viewObj.activeBtnRaster.visible = true;
                                    viewObj.disabledBtnRaster.visible = false;
                                }
                                else {
                                    viewObj.drawLineBtnView.$el.trigger('click');
                                    viewObj.dragLineBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);
                                    viewObj.clearAllBtn.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);
                                    viewObj.trigger(MathInteractives.Common.Components.Views.MotionGraph.ALL_LINES_CLEARED);
                                    viewObj.disabledBtnRaster.visible = true;
                                    viewObj.activeBtnRaster.visible = false;

                                    viewObj.allowLineDrawing();
                                    return;
                                }
                            }

                            // drop
                            this.position = event.point;

                            // legal drop -> snap
                            if (viewObj.isValidPoint(line.segments[0].point) && viewObj.isValidPoint(line.segments[line.segments.length - 1].point)) {
                                return;
                                var distance1, distance2
                                var utils = MathInteractives.Common.Utilities.Models.Utils;
                                var validSnappedPoint1, validSnappedPoint2;

                                // first endpoint
                                var point1 = line.segments[0].point;
                                var pointDetails = viewObj.getPointDetailsInVicinity(point1, this.pos);

                                validSnappedPoint1 = pointDetails.index ? viewObj.allPaths[pointDetails.index].children[0].segments[pointDetails.segmentIndex].point : null;
                                if (validSnappedPoint1) {
                                    distance1 = utils.distanceBetweenPoints(validSnappedPoint1.x, validSnappedPoint1.y, point1.x, point1.y);
                                }
                                else {
                                    distance1 = 900;
                                }

                                // second endpoint
                                var point2 = line.segments[line.segments.length - 1].point;
                                pointDetails = viewObj.getPointDetailsInVicinity(point2, this.pos);

                                validSnappedPoint2 = pointDetails.index ? viewObj.allPaths[pointDetails.index].children[0].segments[pointDetails.segmentIndex].point : null;
                                if (validSnappedPoint2) {
                                    distance2 = utils.distanceBetweenPoints(validSnappedPoint2.x, validSnappedPoint2.y, point2.x, point2.y);
                                }
                                else {
                                    distance2 = 900;
                                }

                                // first check for end point overlapping any circle
                                if (distance1 > distance2) {
                                    this.position.x += validSnappedPoint2.x - point2.x;
                                    this.position.y += validSnappedPoint2.y - point2.y;
                                }
                                else if ((distance2 > distance1) || (distance1 === distance2 && distance2 !== 900)) {
                                    this.position.x += validSnappedPoint1.x - point1.x;
                                    this.position.y += validSnappedPoint1.y - point1.y;
                                }
                                else {
                                    // if no overlap with circle get nearest snap-point
                                    validSnappedPoint1 = viewObj.getValidSnappedPoint(point1, this.pos);
                                    distance1 = utils.distanceBetweenPoints(validSnappedPoint1.x, validSnappedPoint1.y, point1.x, point1.y);
                                    validSnappedPoint2 = viewObj.getValidSnappedPoint(point2, this.pos);
                                    distance2 = utils.distanceBetweenPoints(validSnappedPoint2.x, validSnappedPoint2.y, point2.x, point2.y);

                                    if (distance1 > distance2) {
                                        this.position.x += validSnappedPoint2.x - point2.x;
                                        this.position.y += validSnappedPoint2.y - point2.y;
                                    }
                                    else {
                                        this.position.x += validSnappedPoint1.x - point1.x;
                                        this.position.y += validSnappedPoint1.y - point1.y;
                                    }
                                }
                            }
                            // pointer not over trash can and illegal drop -> go back
                            else {
                                this.position = viewObj.originalPoint;
                            }
                        }

                        //viewObj.allowLineDrawing();
                        //viewObj.allowLineDraging();


                        viewObj.pointToMove = null;
                        viewObj.originalPoint = null;

                        return;
                    }
            }
        },

        detachSegmentRelocateEvents: function () {
            var allPathsCount, allPaths, i;

            allPaths = this.allPaths
            allPathsCount = allPaths.length;
            for (i = 0; i < allPathsCount; i++) {
                this.detachEventsOnIndividualSegments(allPaths[i]);
            }
        },

        detachEventsOnIndividualSegments: function (path) {
            var self = this;
            path.onMouseDown = null;
            path.onMouseDrag = null;
            path.onMouseLeave = null;
            path.onMouseEnter = null;
            path.onMouseUp = function () {
                var $tooltip = self.$('#' + self.idPrefix + 'tooltip-container');
                $tooltip.hide();
            };
            path.onMouseMove = null;
        },

        removePath: function (path) {
            var allPathCount, allPaths, i;

            allPaths = this.allPaths;
            allPathCount = allPaths.length;

            for (i = 0; i < allPathCount; i++) {
                if (path.pos === allPaths[i].pos) {
                    this.detachEventsOnIndividualSegments(allPaths[i]);
                    allPaths.splice(i, 1);
                    break;
                }
            }
            return;
        },

        pointerOverTrashCan: function (point) {
            var xMin, xMax, yMin, yMax, pointX, pointY,
                trashCanCustomPosition = this.model.get('trashCanCustomPosition'),
                DELETE_BTN_X = trashCanCustomPosition ? trashCanCustomPosition.x : MotionGraph.DELETE_BTN_X,
                DELETE_BTN_Y = trashCanCustomPosition ? trashCanCustomPosition.y : MotionGraph.DELETE_BTN_Y;

            xMin = DELETE_BTN_X - (MotionGraph.DELETE_BTN_WIDTH / 2);
            xMax = DELETE_BTN_X + MotionGraph.DELETE_BTN_WIDTH - (MotionGraph.DELETE_BTN_WIDTH / 2);
            yMin = DELETE_BTN_Y - (MotionGraph.DELETE_BTN_HEIGHT / 2);
            yMax = DELETE_BTN_Y + MotionGraph.DELETE_BTN_HEIGHT - (MotionGraph.DELETE_BTN_HEIGHT / 2);
            pointX = point.x;
            pointY = point.y;

            if (pointX > xMin && pointX < xMax && pointY > yMin && pointY < yMax) {
                return true;
            }

            return false;
        },

        trashCanRasters: function _drawRasters(trashCanCustomPosition) {
            //return;
            var model = this.model,
                rasterPosition = trashCanCustomPosition ? trashCanCustomPosition : { x: MotionGraph.DELETE_BTN_X, y: MotionGraph.DELETE_BTN_Y },
                myPaper;

            myPaper = this.myPaper;

            this.activeBtnRaster = new myPaper.Raster({
                source: this.filePath.getImagePath('trashcan-up'),
                position: rasterPosition,
                visible: false
            });

            this.disabledBtnRaster = new myPaper.Raster({
                source: this.filePath.getImagePath('trashcan-disabled'),
                position: rasterPosition,
                visible: true
            });

            this.hoverBtnRaster = new myPaper.Raster({
                source: this.filePath.getImagePath('trashcan-hover'),
                position: rasterPosition,
                visible: false
            });
        },

        showHideGraphControls: function (showControls) {
            if (showControls) {
                this.$el.find('.graph-controls').show();
                this.activeBtnRaster.visible = false;
                this.hoverBtnRaster.visible = false;
                this.disabledBtnRaster.visible = true;
            }
            else {
                this.$el.find('.graph-controls').hide();
                this.activeBtnRaster.visible = false;
                this.hoverBtnRaster.visible = false;
                this.disabledBtnRaster.visible = false;
            }

            return;
        },

        distanceBetweenTwoPoints: function (firstPoint, secondPoint) {
            var distance;
            distance = MathInteractives.Common.Utilities.Models.Utils.distanceBetweenPoints(firstPoint.x, firstPoint.y, secondPoint.x, secondPoint.y);

            distance = Math.floor(distance);

            return distance;
        },

        isValidPoint: function (point) {
            if (point.x < this.xMinBoundry || point.x > this.xMaxBoundry || point.y > this.yMaxBoundry || point.y < this.yMinBoundry) {
                return false;
            }
            return true;
        },

        getValidPoint: function (point) {
            var validPoint;

            if (this.isValidPoint(point)) {
                validPoint = point;
            }
            else {
                validPoint = {}
                validPoint.x = (point.x > this.xMaxBoundry) ? this.xMaxBoundry : ((point.x < this.xMinBoundry) ? this.xMinBoundry : point.x);
                validPoint.y = (point.y > this.yMaxBoundry) ? this.yMaxBoundry : ((point.y < this.yMinBoundry) ? this.yMinBoundry : point.y);
                validPoint = new this.myPaper.Point(validPoint);
            }
            return validPoint;
        },

        getPointDetailsInVicinity: function (point, pos) {
            var pointDetails, allPaths, allPathCount, i, firstEndPoint,
                secondEndPoint, segmentLength, minDist, dist1, dist2,
                firstPointClose, secondPointClose, line;

            pointDetails = {};
            pointDetails.index = null;
            pointDetails.segmentIndex = null;
            minDist = 2 * this.endPointRadius;
            allPaths = this.allPaths
            allPathCount = allPaths.length;

            for (i = 0; i < allPathCount; i++) {
                if (allPaths[i].pos === pos) {
                    continue;
                }
                line = allPaths[i].children[0];
                segmentLength = line.segments.length;
                firstEndPoint = line.segments[0].point;
                secondEndPoint = line.segments[segmentLength - 1].point;

                dist1 = this.distanceBetweenTwoPoints(point, firstEndPoint);
                dist2 = this.distanceBetweenTwoPoints(point, secondEndPoint);

                dist1 < dist2 ? (dist1 < minDist ? firstPointClose = true : firstPointClose = false) : (dist2 < minDist ? secondPointClose = true : secondPointClose = false);

                if (firstPointClose) {
                    minDist = dist1;
                    pointDetails.index = i;
                    pointDetails.segmentIndex = 0;
                }
                else if (secondPointClose) {
                    minDist = dist2;
                    pointDetails.index = i;
                    pointDetails.segmentIndex = segmentLength - 1;
                }

                firstPointClose = secondPointClose = false;
            }

            return pointDetails;
        },

        getValidSnappedPoint: function (point, pos) {
            var snappedPoint, vicinityPointDetails, line, pointDetails, validSnappedPoint;

            snappedPoint = this.model.getSnappedPoint(point);
            snappedPoint = new this.myPaper.Point(snappedPoint.x, snappedPoint.y);

            pointDetails = this.getPointDetailsInVicinity(point, pos);

            validSnappedPoint = pointDetails.index ? this.allPaths[pointDetails.index].children[0].segments[pointDetails.segmentIndex].point : snappedPoint;

            return validSnappedPoint;
        },

        repaint: function paperPathObject() {
            // Activate the current scope.
            // Prevents drawing on other canvas using paper.js.
            this.myPaper.activate();

            var paperPath, pointsCount, points, i, point, x, y, paperPathObject,
                originX, originY, graphObject, xAxis, yAxis, xStepSize, yStepSize, plot,
                xInterval, yInterval, myPaper, lineType, lineTypes, paperEndPointCircleGroup,
                endPointCircle, endPointRadius;


            myPaper = this.myPaper;
            graphObject = this.model;
            plot = this.model.get('plotToRepaint');
            endPointRadius = 5;

            if (plot === null && this.myPaper.view) {
                this.myPaper.view.draw();
                return;
            }
            this.model.set('plotToRepaint', null);
            originX = graphObject.get('origin').get('x');
            originY = graphObject.get('origin').get('y');

            xAxis = graphObject.get('xAxis');
            yAxis = graphObject.get('yAxis');
            xStepSize = xAxis.get('stepSize');
            yStepSize = yAxis.get('stepSize');
            yInterval = yAxis.get('unitsPerStepSize');
            xInterval = xAxis.get('unitsPerStepSize');
            lineType = plot.get('lineType');

            lineTypes = MotionGraph.LINE_TYPES;

            points = plot.get('points').models;
            pointsCount = points.length;

            paperPathObject = plot.paperPathObject ? plot.paperPathObject : new myPaper.Path();
            paperEndPointCircleGroup = plot.paperEndPointCircleGroup ? plot.paperEndPointCircleGroup : new myPaper.Group();
            //paperPathObject.segments = [];

            // remove previous segments
            paperPathObject.removeSegments();

            // remove previous endpoints circle
            paperEndPointCircleGroup.removeChildren();


            paperPathObject.strokeColor = this.plotColor;
            paperPathObject.strokeWidth = this.lineWidth;
            switch (lineType) {
                case lineTypes.DASHED_THIN_LINE:
                    paperPathObject.dashArray = [8, 4]
                    break;
            }

            for (i = 0; i < pointsCount; i++) {
                x = Math.floor((points[i].get('x') * xStepSize / xInterval) + originX);
                y = Math.floor(originY - (points[i].get('y') * yStepSize / yInterval));
                point = new myPaper.Point(x, y);
                paperPathObject.add(point);

                paperEndPointCircleGroup
                //this.myPaper.view.draw();
            }

            if (this.model.get('paintWithEndPoints')) {
                for (i = 0; i < pointsCount; i++) {
                    x = Math.floor((points[i].get('x') * xStepSize / xInterval) + originX);
                    y = Math.floor(originY - (points[i].get('y') * yStepSize / yInterval));
                    point = new myPaper.Point(x, y);

                    endPointCircle = new myPaper.Path.Circle({
                        center: point,
                        radius: endPointRadius
                    })

                    endPointCircle.strokeColor = this.staticCircleStrokeColor;
                    endPointCircle.fillColor = this.staticCircleColor;

                    paperEndPointCircleGroup.addChild(endPointCircle);
                    //this.myPaper.view.draw();
                }
            }

            plot.paperPathObject = paperPathObject;
            plot.paperEndPointCircleGroup = paperEndPointCircleGroup;

            this.myPaper.view.draw();
        },

        _getPointFromLogicalCoordinate: function (logicalPoint) {
            var graphObject = this.model;
            var originX = graphObject.get('origin').get('x');
            var originY = graphObject.get('origin').get('y');

            var xAxis = graphObject.get('xAxis');
            var yAxis = graphObject.get('yAxis');
            var xStepSize = xAxis.get('stepSize');
            var yStepSize = yAxis.get('stepSize');
            var yInterval = yAxis.get('unitsPerStepSize');
            var xInterval = xAxis.get('unitsPerStepSize');





            var x = (logicalPoint.x - originX) * xInterval / xStepSize;
            var y = (originY - logicalPoint.y) * yInterval / yStepSize;
            var point = new MathInteractives.Common.Components.Models.MotionGraph.Point({ x: x, y: y });

            return point;
        },
        _setTitleTextInModel: function _setTitleTextInModel(titleText) {
            if (titleText) {
                this.model.get('title').set('content', titleText);
            }
            return;
        },

        _getTitleTextFromModel: function _getTitleTextFromModel() {
            return this.model.get('title').get('content');
        },

        _setXAxisLabelInModel: function _setXAxisLabelInModel(labelText) {
            if (labelText) {
                this.model.get('xAxis').set('labelText', labelText);
            }
            return;
        },

        _getXAxisLabelFromModel: function _getXAxisLabelFromModel() {
            return this.model.get('xAxis').get('labelText');
        },

        _setYAxisLabelInModel: function _setYAxisLabelInModel(labelText) {
            if (labelText) {
                this.model.get('yAxis').set('labelText', labelText);
            }
            return;
        },

        _getYAxisLabelFromModel: function _getYAxisLabelFromModel() {
            return this.model.get('yAxis').get('labelText');
        },

        _alignLabel: function _alignLabel(label) {
            if (typeof (label) === 'undefined') {
                return;
            }
            var self = this,
                playerClassName = MathInteractives.Common.Player.Views.Player,
                className = MathInteractives.Common.Components.Views.MotionGraph,
                AXIS_LABEL_PADDING = className.AXIS_LABEL_PADDING,
                TITLE_LABEL_PADDING = className.TITLE_LABEL_PADDING,
                xMinBoundry = this.xMinBoundry,
                xMaxBoundry = this.xMaxBoundry,
                yMinBoundry = this.yMinBoundry,
                yMaxBoundry = this.yMaxBoundry,
                graphArea = {
                    topLeft: {
                        x: xMinBoundry,
                        y: yMinBoundry
                    },
                    bottomRight: {
                        x: xMaxBoundry,
                        y: yMaxBoundry
                    },
                    topRight: {
                        x: xMaxBoundry,
                        y: yMinBoundry
                    },
                    bottomLeft: {
                        x: xMinBoundry,
                        y: yMaxBoundry
                    },

                    xAxisLength: xMaxBoundry - xMinBoundry,
                    yAxisLength: yMaxBoundry - yMinBoundry
                },
                container = null,
                containerDimensions = null;

            switch (label) {
                case 'xAxis':
                    container = this.$('#' + this.idPrefix + 'draw-graph-x-axis-label');
                    containerDimensions = this.player.getTextHeightWidth(this._getXAxisLabelFromModel(), 'draw-graph-x-axis-label typography-label');
                    container.css({
                        top: graphArea.bottomLeft.y + AXIS_LABEL_PADDING,
                        left: graphArea.bottomLeft.x + graphArea.xAxisLength / 2 - containerDimensions.width / 2
                    });
                    break;
                case 'yAxis':
                    container = this.$('#' + this.idPrefix + 'draw-graph-y-axis-label');
                    containerDimensions = this.player.getTextHeightWidth(this._getYAxisLabelFromModel(), 'draw-graph-y-axis-label typography-label');
                    container.css({
                        top: graphArea.bottomLeft.y - graphArea.yAxisLength / 2 - containerDimensions.height / 2,
                        left: graphArea.bottomLeft.x - containerDimensions.width / 2 - containerDimensions.height / 2 - AXIS_LABEL_PADDING
                    });
                    break;
                case 'title':
                    container = this.$('#' + this.idPrefix + 'draw-graph-title');
                    containerDimensions = this.player.getTextHeightWidth(this._getTitleTextFromModel(), 'draw-graph-title typography-header');
                    container.css({
                        top: graphArea.topLeft.y - containerDimensions.height / 2 - TITLE_LABEL_PADDING,
                        left: graphArea.topLeft.x + graphArea.xAxisLength / 2 - containerDimensions.width / 2
                    });
                    break;
                default: break;

            }

            return;
        },

        showHideFeedbackGraph: function () {
            var referencePlot, referencePlotPaperObj, referencePlotEndPoints;

            referencePlot = this.model.get('referencePlot');

            if (referencePlot && referencePlot.paperPathObject) {
                referencePlotPaperObj = referencePlot.paperPathObject;
                referencePlotPaperObj.visible = !referencePlotPaperObj.visible;
            }

            if (referencePlot && referencePlot.paperEndPointCircleGroup) {
                referencePlotEndPoints = referencePlot.paperEndPointCircleGroup;
                referencePlotEndPoints.visible = !referencePlotEndPoints.visible;

            }
            this.myPaper.view.draw();

            return;
        },

        showFeedbackGraph: function () {
            var referencePlot, referencePlotPaperObj, referencePlotEndPoints;

            referencePlot = this.model.get('referencePlot');

            if (referencePlot && referencePlot.paperPathObject) {
                referencePlotPaperObj = referencePlot.paperPathObject;
                referencePlotPaperObj.visible = true;
                this.myPaper.view.draw();
            }

            if (referencePlot && referencePlot.paperEndPointCircleGroup) {
                referencePlotEndPoints = referencePlot.paperEndPointCircleGroup;
                referencePlotEndPoints.visible = true;
            }

            return;
        },

        showHideUserDrawnGraph: function () {
            var allPaths, allPathCount, i, visibility;

            allPaths = this.allPaths;
            allPathCount = allPaths.length

            for (i = 0; i < allPathCount; i++) {
                allPaths[i].visible = !allPaths[i].visible;
            }

            this.myPaper.view.draw();

            return;
        },

        showUserDrawnGraph: function () {
            var allPaths, allPathCount, i, visibility;

            allPaths = this.allPaths;
            allPathCount = allPaths.length

            for (i = 0; i < allPathCount; i++) {
                allPaths[i].visible = true;
            }

            this.myPaper.view.draw();

            return;
        },

        enableDrawing: function () {
            //disable raster
            this.hoverBtnRaster.visible = false;
            if (this.allPaths.length > 0) {
                this.activeBtnRaster.visible = true;
                this.disabledBtnRaster.visible = false;
                this.clearAllBtn.setButtonState(MathInteractives.global.Button.BUTTON_STATE_ACTIVE);
            }
            else {
                this.disabledBtnRaster.visible = true;
                this.activeBtnRaster.visible = false;
                this.clearAllBtn.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);
            }

            this.drawLineBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_SELECTED);
            this.dragLineBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);

            this.allowLineDrawing();

            return;
        },

        disableDrawing: function () {
            this.allowLineDraw = false;
            this.allowLineDrag = false;

            this.detachDrawingEvents()
            this.detachSegmentRelocateEvents();

            //disable drawing buttons
            this.drawLineBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);
            this.dragLineBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);

            //disable raster
            this.activeBtnRaster.visible = false;
            this.hoverBtnRaster.visible = false;
            this.disabledBtnRaster.visible = true;

            this.clearAllBtn.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);

            return;
        },

        showHideGraphDisplayBtns: function (bShow) {
            if (bShow) {
                this.userGraphBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_SELECTED);
                this.feedbackGraphBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_SELECTED);

                this.$el.find('.users-graph-control').show();
                this.$el.find('.feedback-graph-control').show();

                this.showFeedbackGraph();
                this.showUserDrawnGraph();
            }
            else {
                this.$el.find('.users-graph-control').hide();
                this.$el.find('.feedback-graph-control').hide();
            }
        },

        clearUserCreatedGraph: function () {
            var allPaths, allPathCount;

            // remove drawing and dragging events
            this.detachSegmentRelocateEvents();
            this.detachDrawingEvents();

            // attach drawing and dragging events
            this.allowLineDrawing();


            allPaths = this.allPaths;
            allPathCount = allPaths.length;

            while (allPaths.length > 0) {
                allPaths[0].remove();
                this.removePath(allPaths[0]);
            }

            // reset trash can state
            this.activeBtnRaster.visible = false;
            this.hoverBtnRaster.visible = false;
            this.disabledBtnRaster.visible = true;

            //reset clear buton state
            this.drawLineBtnView.$el.trigger('click');
            this.clearAllBtn.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);
            this.dragLineBtnView.setButtonState(MathInteractives.global.Button.BUTTON_STATE_DISABLED);


            this.myPaper.view.draw();

            this.trigger(MathInteractives.Common.Components.Views.MotionGraph.ALL_LINES_CLEARED);
        },

        getUserDrawLineCount: function () {
            if (this.allPaths) {
                return this.allPaths.length;
            }

            return 0;
        },

        setTitle: function setTitle(titleText) {
            if (titleText) {
                this._setTitleTextInModel(titleText)
                this.$('#' + this.idPrefix + 'draw-graph-title').append(this._getTitleTextFromModel());
                this._alignLabel('title');
                return;
            }
        },

        setXAxisLabel: function setXAxisLabel(labelText) {
            if (labelText) {
                this._setXAxisLabelInModel(labelText)
                this.$('#' + this.idPrefix + 'draw-graph-x-axis-label').append(this._getXAxisLabelFromModel());
                this._alignLabel('xAxis');
                return;
            }
        },

        setYAxisLabel: function setYAxisLabel(labelText) {
            if (labelText) {
                this._setYAxisLabelInModel(labelText)
                this.$('#' + this.idPrefix + 'draw-graph-y-axis-label').append(this._getYAxisLabelFromModel());
                this._alignLabel('yAxis');
                return;
            }
        },

        setTooltipText: function setTooltipText(texts) {
            this.model.set('toolTipText', texts);
            this.toolTipText = texts;
        }
    },
                                                                   {
                                                                       LINE_TYPES: {
                                                                           CONTINUES_THIN_LINE: 0,
                                                                           DASHED_THIN_LINE: 1
                                                                       },

                                                                       FIRST_LINE_DRAWN: "first_line_drawn",
                                                                       ALL_LINES_CLEARED: "all_lines_cleared",
                                                                       CUSTOM_MOUSEUP_EVENT_FIRED: "mouseup-event-fired",

                                                                       AXIS_LABEL_PADDING: 35,
                                                                       TITLE_LABEL_PADDING: 20,

                                                                       DELETE_BTN_X: 345,
                                                                       DELETE_BTN_Y: 357,
                                                                       DELETE_BTN_HEIGHT: 49,
                                                                       DELETE_BTN_WIDTH: 127
                                                                   });

    MathInteractives.Common.Components.Views.MotionGraph = MotionGraph;
    return;
})();
