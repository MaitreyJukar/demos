
(function () {
    'use strict';
    var staticData = MathInteractives.Common.Components.Models.CurveGraph;
    /**
    * View for rendering Curve Graph
    *
    * @class CurveGraph
    * @constructor
    * @namespace MathInteractives.Common.Components.Views.CurveGraph
    **/
    MathInteractives.Common.Components.Views.CurveGraph = MathInteractives.Common.Player.Views.Base.extend({

        /**
        * Paper.js scope of canvas
        * 
        * @property _scope
        * @type Object
        * @defaults null
        */
        _scope: null,

        /**
        * Whether or not to allow hover effect on points
        * 
        * @property _allowHoverOnPoint
        * @type Boolean
        * @defaults true
        */
        _allowHoverOnPoint: true,

        /**
        * Array of graph points of each curve
        * 
        * @property _graphPoints
        * @type Array
        * @defaults null
        */
        _graphPoints: null,
        /**
        * Array of paper objects of all points on graph.
        * 
        * @property _pointObject
        * @type Array
        * @defaults empty
        */
        _pointObject: [],

        _curvesGroup: null,

        _clickedPoints: [],

        _clikedPointsLabels: [],

        _noOfPointsClicked: 0,


        /**
        * Paper.js scope of graph axis label canvas
        * 
        * @property _graphAxisLabelScope
        * @type Object
        * @defaults null
        */
        _graphAxisLabelScope: null,

        currentTool1: null,

        graphAccPoints: null,

        /**
        * Calls render and draw grid functions
        *
        * @method initialize
        */
        initialize: function initialize() {
            var model = this.model;
            this.initializeDefaultProperties();
            this.graphAccPoints = [];
            this.render();
            this._graphPoints = [];

            


        },

        /**
        * Appends canvas in the container and sets up paper scope,
        * calls function to draw grid
        *
        * @method render
        */
        render: function render() {
            var model = this.model,
                idPrefix = this.idPrefix,
                $el = this.$el,
                canvasId = model.get('canvasId'),
                width = $el.width(),
                height = $el.height(),
                graphCurveCanvasId = idPrefix + canvasId + '-0',
                graphAxisCanvasId = idPrefix + canvasId + '-1',
                $graphCurveCanvas = $('<canvas>', { id: graphCurveCanvasId })[0],
                $graphAxisCanvas = $('<canvas>', { id: graphAxisCanvasId })[0],
                scope = new paper.PaperScope(),
                graphAxisScope = new paper.PaperScope();

            // Append canvas
            $graphCurveCanvas.width = width;
            $graphCurveCanvas.height = height;
            $graphAxisCanvas.width = width;
            $graphAxisCanvas.height = height;
            $el.append($graphAxisCanvas);
            $el.append($graphCurveCanvas);
            $($graphAxisCanvas).attr('style', 'position:absolute;left:0px:z-index:1');
            $($graphCurveCanvas).attr('style', 'position:absolute;left:0px;z-index:2');
            // $canvas2.css({ position: 'absolute', left: '0px' });
            // Set up paper scope
            scope.setup(graphCurveCanvasId);
            graphAxisScope.setup(graphAxisCanvasId);
            this._scope = scope;
            this._graphAxisLabelScope = graphAxisScope;
            model.calculateConversionFactors(width, height);
            this._drawGrid();
        },

        _bindMouseUpOnTool: function (){
            var self = this;
            //self.currentTool1.off('mouseup');
            self.currentTool1.on('mouseup', function (event) {
                if (self.model.get('showTooltip') === true) {
                    console.log('tool mouse up');
                    $('body').append('<div> tool mouse up </div>')
                    self._mouseLeaveOnPoint(event);
                }
            });
        },
        /**
        * Draws grid lines and the boundaries
        *
        * @method _drawGrid
        * @param {Boolean} [showGrid]
        * @private
        */
        _drawGrid: function (showGrid) {
            this._scope.activate();
            var model = this.model,
                gridLinesPoints = model.getGridLinesPoints(),
                numOfLines = gridLinesPoints.length,
                gridMode = model.get('gridMode'),
                lineTickLength = model.get('lineTickLength'),
                style = {
                    color: model.get('gridLinesColor'),
                    strokeWidth: model.get('gridLinesSize')
                },
                calculatedData = model.get('calculatedData'),
                currentLine = null,
                scope = this._scope,
                padding = model.get('padding'),
                gridData = model.get('gridData'),
                skipLabelX = model.get('skipXLabels') + 1,
                skipLabelY = model.get('skipYLabels') + 1,
                gridBackground, startPoint, endPoint, gridBackgroundClone,
                gridBackgroundColor = model.get('gridBackgroundColor') || null;

            gridBackground = new scope.Path.Rectangle({
                x: padding.left,
                y: padding.top
            }, {
                x: calculatedData.width - padding.right,
                y: calculatedData.height - padding.bottom
            }),

            gridBackgroundClone = gridBackground.clone();
            if (gridBackgroundColor !== null) {
                gridBackgroundClone.fillColor = model.get('gridBackgroundColor');
            }
            gridBackground.bringToFront();


            for (var i = 0; i < numOfLines; i++) {
                currentLine = gridLinesPoints[i];
                startPoint = currentLine.startPoint;
                endPoint = currentLine.endPoint;
                if (model.get('showGridLines') === true) {
                    switch (gridMode) {
                        case staticData.GRID_MODE.GRID:
                            this._drawLine(startPoint, endPoint, style);
                            break;
                        case staticData.GRID_MODE.HORIZONTAL:
                            if (currentLine.type === 'horizontal' || i === 0) {
                                this._drawLine(startPoint, endPoint, style);
                            }
                            break;
                        case staticData.GRID_MODE.VERTICAL:
                            if (currentLine.type === 'vertical' || i === numOfLines - 1) {
                                this._drawLine(startPoint, endPoint, style);
                            }
                            break;
                    }
                }
                else {
                    if (i === 0 || i === numOfLines - 1) {
                        this._drawLine(startPoint, endPoint, style);
                    }
                }

                // Appends labels of lines
                switch (currentLine.type) {
                    case MathInteractives.global.CurveGraph.ALIGN_TYPE.VERTICAL:
                        if (Math.floor(currentLine.value / gridData.scaleX) % skipLabelX === 0) {
                            this._renderLabel({
                                x: endPoint.x,
                                y: endPoint.y + model.get('xLabelsPadding')
                            }, currentLine.value, 'center', currentLine.type);
                            if (model.get('renderLineTicks') === true) {
                                if (i !== 0) {
                                    this._renderLineTicks({ x: endPoint.x, y: endPoint.y }, { x: endPoint.x, y: endPoint.y + lineTickLength });

                                }
                            }
                        }
                        break;

                    case MathInteractives.global.CurveGraph.ALIGN_TYPE.HORIZONTAL:
                        if (currentLine.value !== 0) {
                            if (Math.floor(currentLine.value / gridData.scaleY) % skipLabelY === 0) {
                                this._renderLabel({
                                    x: startPoint.x - model.get('yLabelsPadding'),
                                    y: startPoint.y + model.get('yLabelAdjustment')
                                }, currentLine.value, 'right', currentLine.type);
                            }
                            if (model.get('renderLineTicks') === true) {


                                if (i !== numOfLines - 1) {
                                    this._renderLineTicks({ x: startPoint.x, y: startPoint.y }, { x: startPoint.x - lineTickLength, y: startPoint.y });
                                }
                            }
                        }
                        break;
                }
            }

            this._curvesGroup = new scope.Group([gridBackground]);
            this._curvesGroup.clipped = true;
            this._scope.view.draw();
        },

        /**
        * Draws a line 
        *
        * @method _drawLine
        * @param {Object} [startPoint]
        * @param {Object} [endPoint]
        * @param {Object} [style] styling of the line
        * @private
        */
        _drawLine: function (startPoint, endPoint, style) {
            this._scope.activate();
            var line = new this._scope.Path({
                strokeColor: style.color,
                strokeWidth: style.strokeWidth
            });

            line.add(startPoint);
            line.add(endPoint);
        },

        /**
        * Renders label 
        *
        * @method _renderLabel
        * @param {Object} [position]
        * @param {String} [content]
        * @param {String} [justification] Center/ Right/ Left
        * @private
        */
        _renderLabel: function (position, content, justification, labelType) {
            var model = this.model;
            this._graphAxisLabelScope.activate();
            if (labelType === MathInteractives.global.CurveGraph.ALIGN_TYPE.VERTICAL) {
                if (model.get('xAxisLabelFormat') === MathInteractives.Common.Components.Models.CurveGraph.LABEL_FORMAT.THOUSAND_REPRESENTATION) {
                    content = model.getThousandRepresentation(content);
                }
            }
            else {
                if (model.get('yAxisLabelFormat') === MathInteractives.Common.Components.Models.CurveGraph.LABEL_FORMAT.THOUSAND_REPRESENTATION) {
                    content = model.getThousandRepresentation(content);
                }
            }
            var labelStyling = this.model.get('labelStyling'),
            label = new this._graphAxisLabelScope.PointText({
                position: position,
                content: content,
                justification: justification,
                fontSize: labelStyling.fontSize,
                fontColor: labelStyling.fontColor
            });

            if (labelStyling.isBold) {
                label.strokeWidth = 1;
                label.strokeColor = labelStyling.fontColor;
            }

            if (labelStyling.fontFamily) {
                label.font = labelStyling.fontFamily;
            }
            this._graphAxisLabelScope.view.draw();
        },

        /**
        * Draws a curve for given data
        *
        * @method drawCurve
        * @param {Object} [options]
        * @return {Object} [curveGroup] paper.js group of the curve
        * @private
        */
        drawCurve: function (options) {
            // ------------- Supported properties ---------------
            // ----------------- DO NOT REMOVE -------------
            /* options = {
            curvePoints: [], // Array of points to draw curve
            points: [], // Array of points where graph points are drawn
            isAnimated: true|false,
            animationDuration: Number // in ms
            curveWidth: Number,
            curveColor: String,
            dashArray: [], // paper.js array for dashed lines
            pointRadius: Number // radius of the point
            }*/

            this._scope.activate();
            this._pointObject = [];
            var points = options.points,
                isTouch = $.support.touch,
                curvePoints = options.curvePoints,
                numOfCurvePoints = curvePoints.length,
                numOfPoints = points ? points.length : 0,
                model = this.model,
                scope = this._scope,
                defaultCurveStyle = model.get('defaultCurveStyle'),
                defaultPointStyle = model.get('defaultPointStyle'),
                allowClickOnGraphCurve = model.get('allowClickOnGraphCurve'),
                maxY = model.get('gridData').maxY,
                curveColor = options.curveColor ? options.curveColor : defaultCurveStyle.strokeColor,
                path = new scope.Path({
                    strokeColor: curveColor,
                    strokeWidth: options.curveWidth ? options.curveWidth : defaultCurveStyle.strokeWidth,
                    strokeCap: 'round'
                }),
                dummyPath = null,
                pixelValue = null, i = 0, currentPoint = null,
                pointRadius = options.pointRadius ? options.pointRadius : defaultPointStyle.radius,
                curveGroup = new scope.Group(),
                pointsGroup = new scope.Group(),
                pointPaperObj = null;

            curveGroup.addChild(path);
            path.name = 'original-path';
            this._curvesGroup.addChild(curveGroup);
            if (options.dashArray) {
                path.dashArray = options.dashArray;
            }

            // Animated curve
            if (options.isAnimated) {
                var self = this,
                    j = 0, i = 0, pixels = null, currPoint = null,
                    curveAnimationInterval = options.animationDuration / curvePoints.length,
                    pointsInterval = null,
                    curveInterval = null;

                if (numOfPoints) {
                    var pointsAnimationInterval = options.animationDuration / points.length,
                    // Draws the curve using array of points' coordinates
                     pointsInterval = setInterval(function () {
                         currPoint = points[j];
                         pixels = model.getPixelCoords(currPoint);
                         path.add(pixels);
                         path.smooth();
                         pointPaperObj = self._drawPoints(pixels, pointRadius, curveColor, currPoint);
                         pointsGroup.addChild(pointPaperObj);
                         self._scope.view.draw();
                         j++;

                         if (j === points.length) {
                             clearInterval(pointsInterval);
                             self._scope.view.draw();
                             self.trigger(MathInteractives.global.CurveGraph.events.END_OF_ANIMATION);
                         }

                     }, pointsAnimationInterval);
                }
            }
            else {
                // Normal curve without animation
                // Drawing curve
                for (i = 0; i < numOfCurvePoints; i++) {
                    currentPoint = curvePoints[i];
                    pixelValue = model.getPixelCoords(currentPoint);
                    path.add(pixelValue);
                }

                // Drawing points
                if (model.get('highlightPoints') === true) {
                    if (numOfPoints) {
                        for (i = 0; i < numOfPoints; i++) {
                            currentPoint = points[i];
                            if (currentPoint.y <= maxY) {

                                pixelValue = model.getPixelCoords(currentPoint);
                                pointPaperObj = this._drawPoints(pixelValue, pointRadius, curveColor, currentPoint);
                                this._pointObject.push(pointPaperObj);
                                pointsGroup.addChild(pointPaperObj);
                            }

                        }
                    }
                }
            }

            this._scope.view.draw();

            this._graphPoints[curveGroup] = pointsGroup;
            pointsGroup.curve = curveGroup;
            this.pointsGroup = pointsGroup;
            if (model.get('isCustomEventBind') === false) {
                this._increaseCurveHitArea(curveGroup);
                this._bindMouseDownOnCurveGroup(curveGroup);
                this._bindMouseHoverEventOnCurveGroup(curveGroup);
                this._bindTooltipEventOnCurveGroup(curveGroup);
            }
            if (this._cover) {
                this._cover.bringToFront();
            }
            return curveGroup;
        },
        /**
        * Draws individual points
        *
        * @method addPointToCurve
        * @param {Object} [curve]
        * @param {Object} [point]
        * @param {String} [color]
        * @param {Number} [radius] Point radius
        * @public
        */
        addPointToCurve: function (curve, point, color, radius) {
            this._scope.activate();
            var model = this.model,
                currPoint = point,
                allowSmoothening = model.get('allowSmoothening'),
             pixels = model.getPixelCoords(currPoint);
            curve.children[0].add(pixels);
            if (allowSmoothening === true) {
                curve.children[0].smooth();
            }
            if (model.get('highlightPoints') === true) {
                var pointPaperObj = this._drawPoints(pixels, radius, color, currPoint);
                this._pointObject.push(pointPaperObj);
                this.pointsGroup.addChild(pointPaperObj);
            }
            this._scope.view.draw();
        },

        /**
        * Draws points
        *
        * @method _drawPoints
        * @param {Object} [position]
        * @param {Number} [radius]
        * @param {String} [color]
        * @param {Object} [coords] Grid coordinates of point
        * @return {Object} [point] Paper.js path
        * @private
        */
        _drawPoints: function (position, radius, color, coords) {
            var scope = this._scope,
                point = new scope.Path.Circle({
                    radius: radius,
                    position: position,
                    fillColor: color
                }),
                hitArea = new scope.Path.Circle({
                    radius: (/*$.support.touch*/ MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile) ? 10 : radius,
                    position: position,
                    fillColor: new scope.Color(1, 1, 1, 0)
                }),
                pointGroup = new scope.Group([point, hitArea]);

            hitArea.coords = coords;
            hitArea.name = 'graph-point-hitarea';
            point.name = 'actual-point';
            if (this.model.get('showTooltip') === true) {
                this._attachTooltipEvents(pointGroup);
            }
            return pointGroup;
        },

        /**
        * Attaches tooltip events
        *
        * @method _attachTooltipEvents
        * @param {Object} [pointPaperObj]
        * @private
        */
        _attachTooltipEvents: function (pointPaperObj) {
            var self = this,
                isTouch = $.support.touch;

            pointPaperObj.onMouseEnter = function (event) {
                if (self._allowHoverOnPoint /*&& !isTouch*/) {
                    self._mouseEnterOnPoint(event);
                }
            }


            pointPaperObj.onMouseLeave = function (event) {
                self._mouseLeaveOnPoint(event);
            }

            pointPaperObj.onMouseDown = function (event) {
                if (/*isTouch &&*/ self._allowHoverOnPoint) {
                    if (self.$tooltip) {
                        self.$tooltip.remove();
                    }

                    self._mouseEnterOnPoint(event);
                    //$(document).on('touchend.curve-graph', function () {
                    //    if (self.$tooltip) {
                    //        self.$tooltip.remove();
                    //        self.trigger(MathInteractives.global.CurveGraph.events.MOUSE_LEAVE_ON_POINT, { event: event });
                    //    }

                    //    $(document).off('touchend.curve-graph');
                    //});
                }
            }

            pointPaperObj.onMouseUp = function (event) {
                //if (isTouch) {
                self._mouseLeaveOnPoint(event);
                //}
            }
            
        },

        /**
        * Attaches tooltip for the point paper object
        *
        * @method _mouseEnterOnPoint
        * @param {Object} [event]
        * @private
        */
        _mouseEnterOnPoint: function (event) {
            if (this.model.get('player').getModalPresent()) {
                return;
            }


            var model = this.model,
                $tooltip = $($('<div>', { id: model.get('idPrefix') + 'graph-canvas-toolitp' })[0]),
                target = event.target,
                coords = target.coords,
                xUnit = model.get('xUnit'),
                yUnit = model.get('yUnit'),
                tooltipZindex = model.get('tooltipZIndex');

            if (model.get('yTooltipPrecision') && coords.y) {
                coords.y = parseFloat(coords.y).toFixed(model.get('yTooltipPrecision'));
            }

            if (model.get('xTooltipPrecision') && coords.x) {
                coords.x = parseFloat(coords.x).toFixed(model.get('xTooltipPrecision'));
            }

            this.$el.append($tooltip);
            $tooltip.addClass('curve-graph-tooltip')
                    .html(coords.x + xUnit + ', ' + coords.y + yUnit)
                    .css(model.getTooltipPosition(target.position, $tooltip));

            if (tooltipZindex) {
                $tooltip.css('z-index', tooltipZindex);
            }


            this.$tooltip = $tooltip;
            event.curveGroup = event.target.parent.parent.curve;

            this.trigger(MathInteractives.global.CurveGraph.events.MOUSE_ENTER_ON_POINT, { event: event });
        },

        /**
        * Removes tooltip
        *
        * @method _mouseEnterOnPoint
        * @param {Object} [event]
        * @private
        */
        _mouseLeaveOnPoint: function (event) {
            if (this.$tooltip) {
                this.$tooltip.remove();
                this.trigger(MathInteractives.global.CurveGraph.events.MOUSE_LEAVE_ON_POINT, { event: event });
            }
        },

        /**
        * Allows mouse enter event
        *
        * @method allowHover
        */
        allowHover: function () {
            this._allowHoverOnPoint = true;
        },

        /**
        * Prevents mouse enter event
        *
        * @method preventHover
        */
        preventHover: function () {
            this._allowHoverOnPoint = false;
        },

        /**
        * Removes the given curve
        *
        * @method removeCurve
        * @param {Object} [curveGroup]
        */
        removeCurve: function (curveGroup) {
            if (this._graphPoints[curveGroup]) {
                this._graphPoints[curveGroup].onMouseEnter = null;
                this._graphPoints[curveGroup].onMouseLeave = null;
                this._graphPoints[curveGroup].onMouseDown = null;
                this._graphPoints[curveGroup].onMouseUp = null;
                this._graphPoints[curveGroup].detach();
                this._graphPoints[curveGroup].remove();
                this._emptyClickedPoints();
                curveGroup.onMouseEnter = null;
                curveGroup.onMouseLeave = null;
                curveGroup.onMouseDown = null;
                curveGroup.onMouseUp = null;
                curveGroup.detach();
                curveGroup.remove();
                this._scope.view.draw();
                this.model.set('filledPixelPoints', []);
                this._emptyGraphAccPoints();
            }
        },
        _emptyClickedPoints: function _emptyClickedPoints() {
            var clickedPoints = this._clickedPoints,
                noOfClickedPoints = clickedPoints.length;
            for (var i = 0; i < noOfClickedPoints; i++) {
                clickedPoints[i].detach();
                clickedPoints[i].remove();
            }
            this._noOfPointsClicked = 0;
            this._clickedPoints = [];
        },
        _emptyGraphAccPoints: function _emptyGraphAccPoints() {
            var graphAccPoints = this.graphAccPoints,
                noOfGraphAccPoints = graphAccPoints.length;
            for (var i = 0; i < noOfGraphAccPoints; i++) {
                graphAccPoints[i].detach();
                graphAccPoints[i].remove();
            }
            this.graphAccPoints = [];
        },
        /**
        * Updates model and the view accordingly
        *
        * @method changeGraph
        * @param {Object} [options] Model options
        */
        changeGraph: function (options) {
            this.model.destroy();
            if (this.pointsGroup) {
                this.removeCurve(this.pointsGroup.curve);
            }

            var model = new MathInteractives.Common.Components.Models.CurveGraph(options),
                gridMode;
            this._scope.project.activeLayer.removeChildren();
            this._graphAxisLabelScope.project.activeLayer.removeChildren();
            this.model = model;
            this._setGridMode();
            model.calculateConversionFactors(this.$el.width(), this.$el.height());
            model.generatePixelPointsArray();
            this._drawGrid();
            this._graphPoints = [];
            this._noOfPointsClicked = 0;
            this._clickedPoints = [];
            this._scope.activate();
            this.currentTool1 = new this._scope.Tool();
            this.currentTool1.onMouseDrag = function (event) {
                event.preventDefault();
            }
            this._bindMouseUpOnTool();
            this._scope.view.draw();
        },

        /**
        * Pulsates points on the give curve group
        *
        * @method pulsatePoints
        * @param {Object} [curveGroup]
        * @param {Number} [numOfTimes] Number of times to pulsate
        */
        pulsatePoints: function (curveGroup, numOfTimes) {
            var scaleUp = true,
                graphPoints = this._graphPoints[curveGroup],
                paths = graphPoints.children,
                numOfTimes = numOfTimes ? numOfTimes : 3,
                points = [],
                j = 0, i = 0, interval = null,
                scaleFactor = null,
                graphPoints = null,
                pulseCount = 1,
                self = this;

            for (i = 0; i < paths.length; i++) {
                graphPoints = paths[i].children;
                for (var count = 0; count < 2; count++) {
                    if (graphPoints && graphPoints.length && graphPoints[count].name === 'actual-point') {
                        points.push(graphPoints[count]);
                    }
                }
            }

            this.preventHover();

            interval = setInterval(function () {
                if (scaleUp) {
                    scaleFactor = 1.1;
                }
                else {
                    scaleFactor = 1 / 1.1;
                }

                for (i = 0; i < points.length; i++) {
                    points[i].scale(scaleFactor);
                }

                paper.view.draw();

                j++;

                if (j % 3 === 0) {
                    scaleUp = !scaleUp;

                    if (pulseCount / 2 === numOfTimes) {
                        clearInterval(interval);
                        self.allowHover();
                        self.trigger(MathInteractives.global.CurveGraph.events.PULSATE_END);
                    }

                    pulseCount++;
                }

            }, 70);


        },

        /**
        * Draws a mask in the canvas
        *
        * @method drawCover
        * @param {Object} [options] top, left , width and height
        */
        drawCover: function (options) {
            var scope = this._scope,
                point = new scope.Point(options.left, options.top),
                size = new scope.Size(options.width, options.height),
                cover = new scope.Path.Rectangle(point, size);

            cover.fillColor = 'white';
            cover.fillColor.alpha = 0;
            this._cover = cover;
        },

        showCurve: function (curveGroup) {
            curveGroup.visible = true;
            this._scope.view.draw();
        },

        hideCurve: function (curveGroup) {
            curveGroup.visible = false;
            this._scope.view.draw();
        },
        /**
        * Binds mouse down event graph line
        *
        * @method _bindMouseDownOnCurveGroup
        * @param {Object} [options] top, left , width and height
        */
        _bindMouseDownOnCurveGroup: function _bindMouseDownOnCurveGroup(curveGroup) {
            var self = this,
                model = this.model,
                pointsClicked = this._clickedPoints,
                pointsLabels = this._clikedPointsLabels,
                noOfPointsToShowOnCurve = model.get('noOfPointsToShowOnCurve');
            if (model.get('allowClickOnGraphCurve') === true) {
                curveGroup.off('mousedown');
                curveGroup.onMouseDown = function (event) {
                    if (!self.player.getModalPresent()) {
                        //if ($.support.touch) {
                        self._graphCurveMouseEnterHandler(curveGroup);
                        //$(document).on('touchend.clickableCurveGraph', function (event) {
                        //    self._graphCurveMouseLeaveHandler(curveGroup);
                        //    $(document).off('touchend.clickableCurveGraph');
                        //});
                        //}
                        var item = this.getItem(),
                            result = { pointGroup: null, success: false },
                            filledPixelPoints = model.get('filledPixelPoints');
                        result = self._drawClikedPoint(item.getNearestPoint(event.point), this);
                        if (result.success === true) {
                            pointsClicked.push(result.pointGroup);
                        }
                        if (self._noOfPointsClicked > noOfPointsToShowOnCurve && (result.success === true)) {
                            var currentNoOfPoints = pointsClicked.length,
                                removeItemIndex = 0;//currentNoOfPoints - 2; /*remove point at 0th index. To remove last plotted point use currentNoOfPoints-2 as index
                            if (currentNoOfPoints > 0) {
                                pointsClicked[removeItemIndex].remove();
                                delete pointsClicked[removeItemIndex];
                                pointsClicked.splice(removeItemIndex, 1);
                                filledPixelPoints.splice(removeItemIndex, 1);
                                model.set('filledPixelPoints', filledPixelPoints);

                                //pointsLabels[removeItemIndex].remove();
                                //delete pointsLabels[removeItemIndex];
                                //pointsLabels.splice(removeItemIndex, 1);
                                self._noOfPointsClicked--;
                            }
                        }
                        //if (self._noOfPointsClicked === noOfPointsToShowOnCurve) {
                        if (result.success === true) {
                            self.trigger(MathInteractives.global.CurveGraph.events.MAX_NO_OF_POINTS_SELECTED, {
                                event: event,
                                data: {
                                    pointsClicked: pointsClicked,
                                    filledPixelPoints: filledPixelPoints,
                                    currentPointData: {
                                        pointClicked: pointsClicked[self._noOfPointsClicked - 1],
                                        filledPixelPoint: filledPixelPoints[self._noOfPointsClicked - 1]
                                    }
                                }
                            });
                        }
                    }

                }
            }
        },
        _drawClikedPoint: function _drawClikedPoint(point1, curveGroup) {
            this._scope.activate();
            if (this.model.checkPointAlreadyPlaced(this.model.getNearestPixelPoint(point1)) === true) {
                return { pointGroup: null, success: false };
            }
            var self = this,
                scope = this._scope,
                model = this.model,
                filledPixelPoints = model.get('filledPixelPoints'),
                clickablePointsStyling = model.get('clickablePointsStyling'),
                nearestPoint = model.getNearestPixelPoint(point1),
               point = new scope.Path.Circle({
                   radius: clickablePointsStyling.radius,
                   position: new scope.Point(nearestPoint.x, nearestPoint.y),
                   fillColor: clickablePointsStyling.fillColor
               }),
            //hitArea = new scope.Path.Circle({
            //    radius: 10,
            //    position: new scope.Point(nearestPoint.x, nearestPoint.y),
            //    fillColor:'red'
            //}),
            pointGroup = null;
            filledPixelPoints.push(nearestPoint);
            //hitArea.coords = model.getGraphCoords(nearestPoint);
            //hitArea.name = 'graph-point-hitarea';
            point.name = 'actual-point';
            point.coords = model.getGraphCoords(nearestPoint);
            pointGroup = new scope.Group([point]);
            pointGroup.on('mouseup', function (event) {
                self._graphCurveMouseLeaveHandler(curveGroup);
            });
            this._noOfPointsClicked++;
            //this._renderCoordinatesLabel(nearestPoint, point.coords);
            if (model.get('showTooltip') === true) {
                this._attachTooltipEvents(pointGroup);
            }
            return { pointGroup: pointGroup, success: true };
        },
        /**
        * Attaches tooltip events on passed curve
        *
        * @method _attachTooltipEventOnCurve
        * @param {Object} [curve]
        * @private
        */
        _attachTooltipEventOnCurve: function (curve) {
            var self = this,
                isTouch = $.support.touch;

            curve.onMouseEnter = function (event) {
                if (!self.player.getModalPresent() /* && !isTouch */) {
                    self._mouseEnterOnCurve(event);
                }
            }

            curve.onMouseLeave = function (event) {
                self._mouseLeaveOnCurve(event);
            }

            curve.onMouseDown = function (event) {
                if (/*isTouch && */!self.player.getModalPresent()) {
                    console.log('mouse down');
                    $('body').append('<div>mouse down</div>');
                    if (self.$tooltip) {
                        self.$tooltip.remove();
                    }

                    self._mouseEnterOnCurve(event);
                    //$(document).on('touchend.curve-graph-tooltip', function () {
                    //    if (self.$tooltip) {
                    //        self.$tooltip.remove();
                    //        self.trigger(MathInteractives.global.CurveGraph.events.MOUSE_LEAVE_ON_CURVE, { event: event });
                    //    }

                    //    $(document).off('touchend.curve-graph-tooltip');
                    //});
                }
            }

            curve.onMouseUp = function (event) {
                //if (isTouch) {
                self._mouseLeaveOnCurve(event);
                //}
            }
        },
        /**
        * Attaches tooltip for the curve paper object
        *
        * @method _mouseEnterOnCurve
        * @param {Object} [event]
        * @private
        */
        _mouseEnterOnCurve: function (event) {
            if (this.model.get('player').getModalPresent()) {
                return;
            }


            var model = this.model,
                $tooltip = $($('<div>', { id: model.get('idPrefix') + 'graph-canvas-toolitp' })[0]),
                coords = model.getGraphCoords(event.point),
                xUnit = model.get('xUnit'),
                yUnit = model.get('yUnit'),
                tooltipZindex = model.get('tooltipZIndex');

            if (model.get('yTooltipPrecision') && coords.y) {
                coords.y = parseFloat(coords.y).toFixed(model.get('yTooltipPrecision'));
            }

            if (model.get('xTooltipPrecision') && coords.x) {
                coords.x = parseFloat(coords.x).toFixed(model.get('xTooltipPrecision'));
            }

            this.$el.append($tooltip);
            $tooltip.addClass('curve-graph-tooltip')
                    .html(coords.x + xUnit + ', ' + coords.y + yUnit)
                    .css(model.getTooltipPosition(event.point, $tooltip));

            if (tooltipZindex) {
                $tooltip.css('z-index', tooltipZindex);
            }


            this.$tooltip = $tooltip;
            this.trigger(MathInteractives.global.CurveGraph.events.MOUSE_ENTER_ON_CURVE, { event: event });
        },

        /**
        * Removes tooltip from curve
        *
        * @method _mouseLeaveOnCurve
        * @param {Object} [event]
        * @private
        */
        _mouseLeaveOnCurve: function (event) {
            if (this.$tooltip) {
                this.$tooltip.remove();
                this.trigger(MathInteractives.global.CurveGraph.events.MOUSE_LEAVE_ON_CURVE, { event: event });
            }
        },
        /**
        * Checks showTooltip boolean and accordingly binds tooltip event on curve.
        *
        * @method _bindTooltipEventOnCurveGroup
        * @param {Object} [event]
        * @private
        */
        _bindTooltipEventOnCurveGroup: function _bindTooltipEventOnCurveGroup(curve) {
            if (this.model.get('showTooltipOnCurve') === true) {
                this._attachTooltipEventOnCurve(curve);
            }
        },
        /**
        * Renders Coordinated of points clicked over graph curve // Function not fully function. function is not currently used as little bugs are present in rendering cordinates label.
        *
        * @method _renderCoordinatesLabel
        * @param {Object} [position]
        * @param {Object} [point]
        * @private
        */
        _renderCoordinatesLabel: function _renderCoordinatesLabel(position, point) {

            var model = this.model,
                coordsStyling = model.get('clickablePointsCordsStyling'),
            label = new this._scope.PointText({
                //position: position,
                content: '(' + point.x.toFixed(model.get('clickablePointsCordsPrecision')) + ',' + point.y.toFixed(model.get('clickablePointsCordsPrecision')) + ')',
                justification: 'left',
                fontSize: coordsStyling.fontSize,
                fontColor: coordsStyling.fontColor
            })
            position.x = position.x - label.bounds.width;
            position.y = position.y;
            label.position = position;
            if (coordsStyling.isBold) {
                label.strokeWidth = 1;
                label.strokeColor = coordsStyling.fontColor;
            }

            if (coordsStyling.fontFamily) {
                label.fontFamily = coordsStyling.fontFamily;
            }
            this._clikedPointsLabels.push(label);
        },
        /**
        * Render tick lines on graph x and y axis.
        *
        * @method _renderLineTicks
        * @param {Object} [startPoint]
        * @param {Object} [endPoint]
        * @private
        */
        _renderLineTicks: function _renderLineTicks(startPoint, endPoint) {
            var tickStyle = this.model.get('lineTickStyle');
            this._drawLine(startPoint, endPoint, tickStyle);
        },
        /**
        * sets Default grid mode if grid mode is not specified
        *
        * @method _setGridMode
        * @private
        */
        _setGridMode: function _setGridMode() {
            var model = this.model,
                gridMode = model.get('gridMode');
            if (gridMode === null) {
                gridMode = staticData.GRID_MODE.GRID
                model.set('gridMode', gridMode);
            }
        },
        /**
        * Detach mouse down on curve
        *
        * @method detachMouseDownOnCurve
        * @private
        */
        detachMouseDownOnCurve: function detachMouseDownOnCurve(curveGroup) {
            curveGroup.detach('mousedown');
        },
        /**
        * Attaches mouse down on curve
        *
        * @method bindMouseDownOnCurve
        * @public
        */
        bindMouseEventsOnCurve: function bindMouseEventsOnCurve(curveGroup) {
            this._increaseCurveHitArea(curveGroup);
            this._bindMouseDownOnCurveGroup(curveGroup);
            this._bindMouseHoverEventOnCurveGroup(curveGroup);

        },
        /**
        * Attaches tooltip event on curve
        *
        * @method attachTooltipEvent
        * @public
        */
        attachTooltipEvent: function attachTooltipEvent(curveGroup) {
            this._bindTooltipEventOnCurveGroup(curveGroup);
        },
        _graphCurveMouseEnterHandler: function _graphCurveMouseEnterHandler(curveGroup) {
            if (!this.player.getModalPresent()) {
                this.trigger(MathInteractives.global.CurveGraph.events.HOVER_ON_CURVE);
                var scope = this._scope;
                scope.activate();
                curveGroup.children[0].strokeColor = new scope.Color(this.model.get('curveHoverColor'));
                scope.view.draw();
            }
        },
        _graphCurveMouseLeaveHandler: function _graphCurveMouseLeaveHandler(curveGroup) {
            if (!this.player.getModalPresent()) {
                this.trigger(MathInteractives.global.CurveGraph.events.HOVER_REMOVED_FROM_CURVE);
                var scope = this._scope;
                scope.activate();
                curveGroup.children[0].strokeColor = new scope.Color(this.model.get('curveActiveColor'));
                scope.view.draw();
            }
        },
        _bindMouseHoverEventOnCurveGroup: function _bindMouseHoverEventOnCurveGroup(curveGroup) {
            if (this.model.get('allowHoverOnCurve') === true) {
                var self = this,
                    isTouch = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;
                //if (!isTouch) {
                curveGroup.onMouseEnter = function (event) {
                    self._graphCurveMouseEnterHandler(curveGroup);
                }
                curveGroup.onMouseLeave = function (event) {
                    self._graphCurveMouseLeaveHandler(curveGroup);
                }
                //}
                //else {
                if (isTouch) {
                    console.log('touch device');
                    curveGroup.onMouseUp = function (event) {
                        self._graphCurveMouseLeaveHandler(curveGroup);
                    }
                    this.currentTool1.on('mouseup', function (event) {
                        self._graphCurveMouseLeaveHandler(curveGroup);
                    });
                }
                //}
            }
        },
        setPixelPoints: function setPixelPoints(pixelPointArr) {
            var model = this.model;
            model.set('points', pixelPointArr);
            model.generatePixelPointsArray();
        },
        increaseCurveHitArea: function increaseCurveHitArea(curveGroup) {
            this._increaseCurveHitArea(curveGroup);
        },
        _increaseCurveHitArea: function _increaseCurveHitArea(curveGroup) {
            if (MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile && this.model.get('allowClickOnGraphCurve') === true) {
                this._scope.activate();
                var dummyPath = null;
                dummyPath = curveGroup.children[0].clone();
                dummyPath.opacity = 0;
                dummyPath.strokeWidth = this.model.get('storkeWidthForTouchDevices');
                curveGroup.addChild(dummyPath);
                dummyPath.bringToFront();
                dummyPath.name = 'dummy-path';
                this._scope.view.draw();
            }
        },
        addGraphPointsForAcc: function addGraphPointsForAcc() {
            var graphPixelPoints = this.model.get('pixelPoints'),
                numberOfPixelPoints = graphPixelPoints.length,
                pointRadius = MathInteractives.global.CurveGraph.POINT_RADIUS_FOR_ACC,
                index = 0;
            for (; index < numberOfPixelPoints; index++) {
                this.graphAccPoints.push(this._drawPointsForAcc(graphPixelPoints[index], pointRadius));
            }
            this._scope.view.draw();
        },
        /**
        * Draws points for accessibility
        *
        * @method _drawPointsForAcc
        * @param {Object} [position]
        * @param {Number} [radius]
        * @private
        */
        _drawPointsForAcc: function _drawPointsForAcc(position, radius) {
            this._scope.activate;
            var scope = this._scope,
           point = new scope.Path.Circle({
               radius: radius,
               position: position
           });
            point.coords = this.model.getGraphCoords(position);
            point.opacity = 0;
            return point;
        }
    }, {

        /**
        * Generates model and view instances
        *
        * @method generateCurveGraph
        * @param {Object} [options]
        */
        generateCurveGraph: function (options) {
            if (options) {
                var containerId, graph, graphView;
                containerId = '#' + options.idPrefix + options.containerId;
                graph = new MathInteractives.Common.Components.Models.CurveGraph(options);
                graphView = new MathInteractives.Common.Components.Views.CurveGraph({ el: containerId, model: graph });

                return graphView;
            }
        },

        /**
        * Events on points on graph
        *
        * @type Object
        */
        events: {
            MOUSE_ENTER_ON_POINT: 'mouse-enter',
            MOUSE_LEAVE_ON_POINT: 'mouse-leave',
            END_OF_ANIMATION: 'animation-ends',
            PULSATE_END: 'pulsate-ends',
            MAX_NO_OF_POINTS_SELECTED: 'max-no-of-points-selected',
            MOUSE_ENTER_ON_CURVE: 'mouse-enter-on-curve',
            MOUSE_LEAVE_ON_CURVE: 'mouse-leave-on-curve',
            HOVER_ON_CURVE: 'hover-on-curve',
            HOVER_REMOVED_FROM_CURVE: 'hover-removed-from-curve'
        },
        ALIGN_TYPE: {
            VERTICAL: 'vertical',
            HORIZONTAL: 'horizontal'
        },
        POINT_RADIUS_FOR_ACC: 2.5

    });

    MathInteractives.global.CurveGraph = MathInteractives.Common.Components.Views.CurveGraph;

})();