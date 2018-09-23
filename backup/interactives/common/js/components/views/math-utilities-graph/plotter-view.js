(function (MathUtilities) {
    'use strict';
    MathInteractives.Common.Components.Views.MathUtilitiesGraph.plotterView = Backbone.View.extend({
        model: null,
        _graphView: null,
        _plottingFuntions: null,
        _worker: null,
        initialize: function initialize() {
            this.model = new MathInteractives.Common.Components.Models.MathUtilitiesGraph.plotterModel();
            this.graphView = this.options.graphView;
            //this._plottingFuntions = new `(this.graphView);
            //MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.setGraphView(this.graphView);
            this.graphView.on('graph:zoom-pan', $.proxy(function onzoom() {
                var equations = this.model._equations, i;
                for (i = 0; i < equations.length; i++) {
                    if (equations[i].type !== undefined && equations[i].type !== null && equations[i].type !== 'error' && equations[i].type !== 'expression' && equations[i].type !== 'number' && equations[i].type !== 'quadratic') {
                        if (equations[i].type === 'polygon') {
                            this.graphView.drawPolygon(equations[i]);
                        }
                        else if (equations[i].type === 'point') {
                            continue;
                        }
                        else if (equations[i].type === 'annotation') {

                            this.graphView.drawPolygon(equations[i]);

                        }
                        else if (equations[i].type === 'image') {
                            this.graphView.repositionImage(equations[i]);

                        }
                        else {
                            this._plot(equations[i]);
                        }
                    }
                }

            }, this));

            MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine.Productions.init();
            //Backbone.listenTo(plotModelObject, 'change:color', $.proxy(this._changePlotColor, plotModelObject));
        },

        addEquation: function addEquation(equationData) {

            var equations = this.model._equations,
            equationMap = this.model._equationsMap;

            if (equations.indexOf(equationData) !== -1) {
                return;
            }
            equations.push(equationData);
            equationMap[equationData.id] = equationData;
            if (equationData.type === 'image') {
                this.graphView._paperScope.view.draw();
                return;
            }

            equationData.on('change-equation', $.proxy(function () {
                this._showConsole(true, 'Updating plot for equation ' + equationData);
                this.addPlot(equationData);

            }, this));

            equationData.on('change-color', $.proxy(function () {
                this.changePlotColor(equationData);
            }, this));

            equationData.on('change-points-color', $.proxy(function () {
                this.changePointsColor(equationData);
            }, this));

            equationData.on('change-constants', $.proxy(function () {
                if (equationData.containsConstant === false || equationData.type === 'point') {
                    return;
                }
                if (equationData.type === 'error' || equationData.type === 'expression' || equationData.containsConstant === true) {
                    this.addPlot(equationData);
                }
                else {
                    this._plot(equationData);
                }
            }, this));

            equationData.on('change-thickness', $.proxy(function () {

                if (equationData.type === 'point') {
                    if (equationData.pointsGroup !== undefined) {
                        equationData.thickness = equationData.thickness;
                        this.graphView._redrawPoints();
                    }
                }
                else {
                    if (equationData.pathGroup !== undefined) {
                        equationData.pathGroup.strokeWidth = equationData.thickness;
                    }
                }


            }, this));
            if (equationData.type === 'polygon' || equationData.type === 'annotation') {

                if (equationData.type === 'annotation') {
                    if (this.model._annotationPaths !== null) {
                        this.model._annotationPaths.remove();
                        this.graphView._paperScope.view.draw();
                    }
                }
                this.graphView.drawPolygon(equationData);
                return;
            }
            this.addPlot(equationData);
        },

        removeEquation: function removeEquation(equationData) {
            var equations = this.model._equations,
            equationMap = this.model._equationsMap,
            //            index = equations.indexOf(equationData),
            //indices = [],
            //i,
            idx;

            idx = equations.indexOf(equationData);
            //while (idx !== -1) {
            //    indices.push(idx);
            //    idx = equations.indexOf(equationData, idx + 1);
            //}

            //for (i = indices.length - 1; i >= 0; i--) {
            //            equations[indices[i]].equation = '';

            if (idx !== -1) {
                if (equationData.pathGroup !== undefined) {
                    this.graphView.removePlottedGraph(equationData);
                }
                if (equationData.pointsGroup !== undefined) {
                    this.graphView.removePoint(equationData);
                }
                if (equationData.raster !== undefined) {
                    this.graphView.removeRaster(equationData);
                }
                //equations.splice(indices[i], 1);
                equations.splice(idx, 1);
                //}
            }
            delete equationMap[equationData.id];
            return;
        },

        createAnnotationStart: function createAnnotationStart(color, thickness) {
            this.graphView._projectLayers.annotationLayer.activate();
            //this.graphView.setDefaultPanBehaviour(false);
            //this.graphView.setDefaultZoomBehaviour(false);
            this.graphView.setGridMode('annotation-mode');
            var self = this;
            //thickness = undefined;
            this.graphView.on('annotation-start', $.proxy(self._createAnnotationMouseDown, self));
            this.graphView.on('draw-annotation', $.proxy(self._createAnnotationMove, self));
            this.graphView.on('annotation-end', $.proxy(self._createAnnotationMouseUp, self));
            this.model._annotationPaths = new this.graphView._paperScope.Group();
            this.model._annotationPaths.strokeColor = color;
            this.model._annotationPaths.strokeWidth = thickness;

        },

        _createAnnotationMouseDown: function createAnnotationMouseDown(event) {
            this.graphView.setGridMode('annotation-mode'); //when changing grid type during incomplete annotation operation
            var model = this.model,
                annotationPath;
            annotationPath = new this.graphView._paperScope.Path();
            annotationPath.strokeWidth = model._annotationPaths.strokeWidth;
            this.graphView._paperScope.tool.minDistance = 1;
            annotationPath.strokeColor = this.model._annotationPaths.strokeColor;
            annotationPath.strokeWidth = this.model._annotationPaths.strokeWidth;
            //model.incompleteAnnotations.push(this.graphView._getGraphPointCoordinates([event.point.x,event.point.y]));
            model.incompleteAnnotations.push(this.graphView._getGraphPointCoordinates(getCanvasCoordinates(event)));
            model._firstPoint = event.point;
            model._annotationPaths.addChild(annotationPath);
            annotationPath.strokeCap = 'round';
        },
        _createAnnotationMove: function createAnnotationMove(event) {
            var annotationPathChildren = this.model._annotationPaths._children, model = this.model;

            this.graphView._paperScope.tool.minDistance = 1;
            if (model._firstPoint !== null) {
                annotationPathChildren[annotationPathChildren.length - 1].add(model._firstPoint);
                model._firstPoint = null;
            }
            annotationPathChildren[annotationPathChildren.length - 1].add(event.point);
            // model.incompleteAnnotations.push(this.graphView._getGraphPointCoordinates([event.point.x, event.point.y]));
            model.incompleteAnnotations.push(this.graphView._getGraphPointCoordinates(getCanvasCoordinates(event)));
            //this.graphView.refreshView();
        },

        _createAnnotationMouseUp: function createAnnotationMouseUp(event) {
            event = undefined;
            var model = this.model,
                annotationPathChildren = this.model._annotationPaths._children;
            if (model._firstPoint !== null) {
                annotationPathChildren[annotationPathChildren.length - 1].add([model._firstPoint.x, model._firstPoint.y]);
                annotationPathChildren[annotationPathChildren.length - 1].add([model._firstPoint.x + 1, model._firstPoint.y + 1]);
                this.model.incompleteAnnotations.push(this.graphView._getGraphPointCoordinates([model._firstPoint.x + 2, model._firstPoint.y + 4]));
                model._firstPoint = null;
            }
            ////console.log('annotation++++++++++++++++++++++++++++++++++++++++++++++++++');
            ////console.log(annotationPathChildren[annotationPathChildren.length - 1]);
            this.model.incompleteAnnotations.push(undefined);
            this.graphView.refreshView();

        },
        createAnnotationEnd: function createAnnotationEnd(event) {
            event = undefined;
            var returnAnnotations;
            this.model.incompleteAnnotations.pop();
            returnAnnotations = this.model.incompleteAnnotations;
            this.model.incompleteAnnotations = [];
            this.graphView.off('annotation-start'); //,this._createAnnotationMouseDown);
            this.graphView.off('draw-annotation'); //, this._createAnnotationMove);
            this.graphView.off('annotation-end'); //, this._createAnnotationMouseUp);
            //this.graphView.setDefaultPanBehaviour(true);
            //this.graphView.setDefaultZoomBehaviour(true);
            this.graphView.resetGridMode();

            return returnAnnotations;
        },


        changePlotColor: function changePlotColor(equationData) {
            var i;
            if (equationData.type === 'point') {
                if (equationData.dashArray.length === 0) {
                    this.changePointsColor(equationData);
                }
                else {
                    this.changePointsColor(equationData);
                }
            }
            else {
                if (equationData.pathGroup) {
                    for (i = 0; i < equationData.pathGroup.children.length; i++) {
                        if (equationData.pathGroup.children[i].hit) {
                            continue;
                        }
                        equationData.pathGroup.children[i].strokeColor = equationData.color;
                    }
                }
            }
            this.graphView.refreshView();
        },
        changePointsColor: function changePointsColor(equationData) {
            if (equationData.pointsGroup === undefined) {
                return;
            }
            var i;
            if (equationData.dashArray.length === 0) {
                for (i = 0; i < equationData.pointsGroup.children.length; i++) {
                    if (equationData.pointsGroup.children[i].hit) {
                        continue;
                    }
                    //equationData.pointsGroup.children[i].strokeColor = equationData.color;
                    equationData.pointsGroup.children[i].fillColor = equationData.color;
                }

            }
            else {
                for (i = 0; i < equationData.pointsGroup.children.length; i++) {
                    if (equationData.pointsGroup.children[i].hit) {
                        continue;
                    }
                    equationData.pointsGroup.children[i].strokeColor = equationData.color;
                }
            }
            //            equationData.pointsGroup.fillColor = equationData.color;
            this.graphView._paperScope.view.draw();
        },
        _showConsole: function _showConsole(flag, string, colorArray) {
            flag = undefined;
            string = undefined;
            colorArray = undefined;
            return;
            //            var length;
            //            if (window.console) {
            //                if (flag) {
            //                    if (colorArray === undefined) {
            //                        length = 0;
            //                    }
            //                    else {
            //                        length = colorArray.length;
            //                    }
            //                    switch (length) {
            //                        case 0:
            //                            //console.log(string);
            //                            break;
            //                        case 1:
            //                            //console.log(string, colorArray[0]);
            //                            break;
            //                        case 2:
            //                            //console.log(string, colorArray[0], colorArray[1]);
            //                            break;
            //                    }
            //                }
            //            }
        },

        addPlot: function addPlot(equationData) {
            var pointCounter,
                pointsLength,
                point,
                solution;
            //var allPlots = this.model.get('_plots');
            //if (allPlots.indexOf(equation) !== -1) {
            //    return;
            //}


            //allPlots.push(equationData);
            //var equationData = event.data.equationData;


            MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine.Parser.parseEquation(equationData);
            //debugger;
            if (equationData.type === 'point') {
                //this.graphView.removePoint(equationData);

                if (!equationData.blind) {
                    pointsLength = equationData.solution.length;
                    equationData.points = [];
                    for (pointCounter = 0; pointCounter < pointsLength; pointCounter++) {
                        point = [];
                        point.push(Number(equationData.solution[pointCounter][0]));
                        point.push(Number(equationData.solution[pointCounter][1]));
                        equationData.points.push(point);
                    }
                }

                //equationData.thickness = 10;
                this.graphView.drawPoint(equationData);
            }
            else if (equationData.canBeSolved === true && equationData.type !== 'expression' && equationData.type !== 'number') {
                //if (equationData.functionVariable !== undefined) {
                MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine.TreeProcedures.convertToSolvableForm(equationData);
                if (equationData.type === 'quadratic') {
                    solution = MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine.TreeProcedures.solveEquation(equationData, 1);
                    equationData.solution = solution;
                }
                if (equationData.type === 'plot') {
                    if (equationData.color === undefined) {
                        equationData.color = 'green';
                    }

                    this._plot(equationData);
                }


                //            this.model._equations.push(equationData);
                //}
                //else {
                //    //console.log('Function variable is missing');
                //}
            }
            else if (equationData.blind === true) {
                this._plot(equationData);
            }
            else {
                this._showConsole(true, 'Cant plot this equation');
            }


        },

        _plot: function _plot(equationData) {
            equationData.leftArray = equationData.rightArray = [];
            var equationMap = this.model._equationsMap,
                calculatedTolerance, self = this,
            //getPoint2
            MINRANGE = (Number)(this.graphView.markerBounds.min[equationData.paramVariable]),
            MAXRANGE = (Number)(this.graphView.markerBounds.max[equationData.paramVariable]),
            equationOrder,
            //solution,
            userAgent = navigator.userAgent.toLowerCase(),
            decimalsLength,
            leftArray = [],
            rightArray = [],
            plotData,
            graphView = this.graphView,
            step = 8 * ((Math.abs(MINRANGE) + Math.abs(MAXRANGE)) / 10000),
            arr, arr2, arrTranslated, sourceEquationData, i, engine, engine1, engine2;
            graphView._paperScope.activate();
            if (equationData.range !== null && equationData.range !== undefined) {
                if (equationData.range.min !== null) {
                    MINRANGE = equationData.range.min.value;
                    if (equationData.range.min.include === false) {
                        MINRANGE += step;
                    }
                }
                if (equationData.range.max !== null) {
                    MAXRANGE = equationData.range.max.value;
                    if (equationData.range.max.include === false) {
                        MAXRANGE -= step;
                    }
                }
            }
            calculatedTolerance = this.graphView.getMinimumMarkerValues();
            plotData = {
                minX: MINRANGE,
                maxX: MAXRANGE,
                minY: (Number)(this.graphView.markerBounds.min[equationData.functionVariable]),
                maxY: (Number)(this.graphView.markerBounds.max[equationData.functionVariable]),
                step: step,
                tolerance: calculatedTolerance.xMinMarker / 100,
                paramVariable: equationData.paramVariable
            };

            decimalsLength = (step.toString().split('.')[1] || []).length;
            //            if (nameSpace.Parser._debugFlag.plot) //console.log('Step used is :: ' + step);
            //            if (nameSpace.Parser._debugFlag.plot) //console.log('decimalsLength :: ' + decimalsLength);

            equationOrder = equationData.analysis.paramVariableOrder;


            function getPoint(param) {
                var solution = MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine.TreeProcedures.solveEquation(equationData, param);
                if (solution !== undefined) {
                    return solution[0];
                }
                else {
                    return undefined;
                }

            }
            //if (equationData.blind === false && equationData.freeVars[equationData.paramVariable] === 1 && equationData.freeVars[equationData.functionVariable] === 1) {
            //leftArray = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.generateSimplePlot(getPoint, plotData);
            //}
            /*else 
            {
            //leftArray = plottingFunctions.generatePlot(getPoint, plotData);
            /*if (userAgent.indexOf('msie 9') === -1) {
            if (this._worker === null) {
            if (MathUtilities.Components.EquationEngine.Models.Parser._deploy === false) {
            this._worker = new Worker('scripts/models/plot-worker.js');
            }
            else {
            this._worker = new Worker(MathUtilities.Components.Graph.Models.plotterModel.BASEPATH + 'js/math-utilities/components/equation-engine/scripts/models/plot-worker.js');
            }



            this._worker.addEventListener('message', function (e) {
            sourceEquationData = equationMap[e.data.id];
            if (!sourceEquationData) {
            return;
            }

            ////console.log('Plot Current Session ' + sourceEquationData.plotSessionCount + ' Response: ' + e.data.plotSession);
            if (Number(sourceEquationData.plotSessionCount) !== Number(e.data.plotSession)) {
            //console.log('Ignoring old session ' + e.data.plotSession + ' ...Waiting for ' + sourceEquationData.plotSessionCount);
            return;
            }
            ////console.log('Worker responded ' + e.data);
            arr = e.data.lines;
            arr2 = e.data.lines2;

            arrTranslated = [];
                            
            //var i;
            //if (sourceEquationData.coordinateSystem === 'polar') {
            //    arr = MathUtilities.Components.Graph.Models.plottingFunctions.convertPolarToCartesian(arr);
            //}
            for (i = 0; i < arr.length; i++) {

            arrTranslated.push(MathUtilities.Components.Graph.Models.plottingFunctions.translateSegment(e.data.plot, arr[i],graphView));
            }
            ////console.log('this is ' + this + ' map is ' + equationMap);


            //debugger;
            // //console.log('data ready for ' + e.data.id);
                            

            ////console.log('data ready for equation ' + sourceEquationData.equation);

            sourceEquationData.leftArray = arrTranslated;

            if (arr2 !== undefined) {
            arrTranslated = [];
            for (i = 0; i < arr2.length; i++) {
            arrTranslated.push(MathUtilities.Components.Graph.Models.plottingFunctions.translateSegment(e.data.plot, arr2[i],graphView));
            }
            sourceEquationData.rightArray = arrTranslated;
            }


            ////console.log('adding segments to ' + graphView);

            graphView._addSegments(sourceEquationData);
            self.graphView._paperScope.view.draw();

            sourceEquationData.points = leftArray;

            //equationData.plotModel.points2 = rightArray;
            //if (sourceEquationData.thickness === undefined) {
            //    sourceEquationData.thickness = 2;
            //}

            }, false);

            }
            ////console.log('posting for eqn ' + equationData.equation + ' with code ' + equationData.analysis.functionCode);
            equationData.plotSessionCount++;
            this._worker.postMessage({ 'code': equationData.analysis.functionCode, 'plot': plotData, 'constants': equationData.constants, 'order': equationOrder, 'id': equationData.id, 'autonomous': equationData.autonomous, 'plotSession': equationData.plotSessionCount });
            return;
            }
            else {*/
            plotData.gridGraph = graphView;
            if (equationData.autonomous) {
                engine = new Function('constants,plot', equationData.analysis.functionCode);
                leftArray = engine(equationData.constants, plotData);
                arrTranslated = [];
                for (i = 0; i < leftArray.length; i++) {

                    arrTranslated.push(MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.translateSegment(plotData, leftArray[i], graphView));
                }
                leftArray = arrTranslated;
            }
            else {
                engine = new Function('param,constants', equationData.analysis.functionCode);

                engine1 = function eng1(param) { var soln = engine(param, equationData.constants); return soln[0]; };
                engine2 = function eng2(param) { var soln = engine(param, equationData.constants); return soln[1]; };

                leftArray = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.generatePlot(engine1, plotData);

                if (equationOrder === 2) {
                    rightArray = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.generatePlot(engine2, plotData);
                    equationData.rightArray = rightArray;
                }
            }
            //}
            //}


            equationData.leftArray = leftArray;




            this.graphView._addSegments(equationData);

            equationData.points = leftArray;
            if (equationData.thickness === undefined) {
                equationData.thickness = 3;
            }

        },

        addImage: function (imgSrc, equationData, position) {

            var raster, x, y;
            this.graphView._paperScope.activate();
            this.graphView._projectLayers.imageLayer.activate();
            if (typeof imgSrc === 'string') {
                raster = new this.graphView._paperScope.Raster({ source: imgSrc });
            }
            else {
                raster = new this.graphView._paperScope.Raster(imgSrc);
            }
            if (position === undefined) {
                x = raster.width / 2;
                y = raster.height / 2;
            }
            else {
                x = position[0] + position[2] / 2;
                y = position[1] + position[3] / 2;
            }
            raster.position = new this.graphView._paperScope.Point(x, y);
            equationData.position = this.graphView._getGraphPointCoordinates([x, y]);
            equationData.points = [];
            equationData.points.push(this.graphView._getGraphPointCoordinates([x, y]));
            this.addEquation(equationData);
            this.graphView._gridGraphModelObject.get('_images').push(equationData);
            ////console.log('.............image :: x:' + x + ', y:' + y + '.................. >> ' + this.graphView._getGraphPointCoordinates([x, y]));
            return raster;

        }
    }, {});




    MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions = Backbone.Model.extend({}, {
        _graphView: null,

        generateSimplePlot: function generateSimplePlot(engine, plotData) {
            var plot = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.getPlotObject(plotData);
            MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.addPoint(plot, plotData.minX, engine(plotData.minX));
            MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.addPoint(plot, plotData.maxX, engine(plotData.maxX));
            MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.finishSegment(plot);
            return plot.lines;
        },

        convertPolarToCartesian: function (arrPolar) {
            var arrCart, segment, newSeg, i, j;
            arrCart = [];
            segment = [];
            //var newSeg;
            for (i = 0; i < arrPolar.length; i++) {
                segment = arrPolar[i];
                newSeg = [];
                for (j = 0; j < segment.length - 1; j += 2) {
                    if (!isFinite(segment[j]) || !isFinite(segment[j + 1])) {
                        //arrCart.push([undefined, undefined]);
                    }
                    else {
                        newSeg.push(segment[j + 1] * Math.cos(segment[j]));
                        newSeg.push(segment[j + 1] * Math.sin(segment[j]));
                    }
                }

                arrCart.push(newSeg);

            }
            return arrCart;
        },

        addPoint: function addPoint(plot, x, y) {
            var point = [x, y],
                lastPoint,
                currentPivot = plot.basePoint;

            if (!plot.temporaryLines) {
                plot.temporaryLines = [point[0], point[1]];
                return;
            }



            if (!currentPivot) {
                plot.basePoint = point;
                plot.unsettledPoint = point;
                return;
            }

            lastPoint = [plot.temporaryLines[plot.temporaryLines.length - 2], plot.temporaryLines[plot.temporaryLines.length - 1]];

            if (!this.changePivot(lastPoint, currentPivot, point, plot.tolerance)) {
                this.removeUnsettledPoints(plot);
                plot.basePoint = point;
            }

            plot.unsettledPoint = point;
        },

        removeUnsettledPoints: function removeUnsettledPoints(plot) {
            if (plot.unsettledPoint) {
                plot.temporaryLines.push(plot.unsettledPoint[0], plot.unsettledPoint[1]);
                plot.basePoint = null;
                plot.unsettledPoint = null;

            }
        },

        finishSegment: function finishSegment(plot) {
            MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.removeUnsettledPoints(plot);
            var lines, line, i;
            if (plot.temporaryLines) {
                lines = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.fitPointsInsideDomain(plot, plot.temporaryLines);

                for (i = 0; i < lines.length; i++) {
                    if (lines[i].length < 2) {
                        continue;
                    }
                    line = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.translateSegment(plot, lines[i]);
                    plot.lines.push(line);
                }
                plot.temporaryLines = null;
            }

        },





        translateSegment: function translateSegment(plot, segment, graphView) {
            var point, i,
                newsegment = [];

            for (i = 0; i < segment.length - 1; i += 2) {

                if (plot.paramVariable === 'x') {
                    point = [segment[i], segment[i + 1]];
                }
                else {
                    point = [segment[i + 1], segment[i]];
                }

                //if (graphView) {
                point = plot.gridGraph._getCanvasPointCoordinates(point);
                //}
                //else {
                //    point = this._graphView._getCanvasPointCoordinates(point);
                //}


                newsegment.push(point);
            }
            return newsegment;
        },

        projectPointOnDomain: function projectPointOnDomain(plot, lastPointX, lastPointY, x, y) {

            var horizLineX1, horizLineY1, vertLineX1, vertLineY1, calcHorizontal, calcVertical,
                horizLineX2, horizLineY2, vertLineX2, vertLineY2, intersect1, intersect2, d1, d2;

            if (!isFinite(y)) {
                y = (y > 0 ? 1e10 : -1e10);
            }
            if (!isFinite(lastPointY)) {
                lastPointY = (lastPointY > 0 ? 1e10 : -1e10);
            }

            ////console.log('projecting point on domain ' + lastPointX, lastPointY + ' >> ' + x, y);
            calcHorizontal = true;
            calcVertical = true;
            if (!isFinite(y)) {
                y = (y > 0 ? 1e10 : -1e10);
            }
            if (!isFinite(lastPointY)) {
                lastPointY = (lastPointY > 0 ? 1e10 : -1e10);
            }
            if (x < plot.domain.minX) {
                vertLineX1 = plot.domain.minX;
                vertLineY1 = plot.domain.minY;

                vertLineX2 = plot.domain.minX;
                vertLineY2 = plot.domain.maxY;
            }
            else if (x > plot.domain.maxX) {
                vertLineX1 = plot.domain.maxX;
                vertLineY1 = plot.domain.minY;

                vertLineX2 = plot.domain.maxX;
                vertLineY2 = plot.domain.maxY;
            }
            else {
                calcHorizontal = false;
            }

            if (calcHorizontal || calcVertical) {
                //debugger;
            }

            if (y < plot.domain.minY) {
                horizLineX1 = plot.domain.minX;
                horizLineY1 = plot.domain.minY;

                horizLineX2 = plot.domain.maxX;
                horizLineY2 = plot.domain.minY;
            }
            else if (y > plot.domain.maxY) {
                horizLineX1 = plot.domain.minX;
                horizLineY1 = plot.domain.maxY;

                horizLineX2 = plot.domain.maxX;
                horizLineY2 = plot.domain.maxY;
            }
            else {
                calcVertical = false;
            }

            //            var intersect1, intersect2, h1, h2, d1, d2;
            if (calcVertical) {
                intersect1 = geomFunctions.intersectionOfLines(horizLineX1, horizLineY1, horizLineX2, horizLineY2, lastPointX, lastPointY, x, y);
                //h1 = geomFunctions.getSegmentParam(horizLineX1, horizLineY1, horizLineX2, horizLineY2, intersect1[0], intersect1[1]);
                if (intersect1 !== undefined) {
                    d1 = geomFunctions.distance2(lastPointX, lastPointY, intersect1[0], intersect1[1]);
                }

            }
            if (calcHorizontal) {
                intersect2 = geomFunctions.intersectionOfLines(vertLineX1, vertLineY1, vertLineX2, vertLineY2, lastPointX, lastPointY, x, y);
                if (intersect2 !== undefined) {
                    d2 = geomFunctions.distance2(lastPointX, lastPointY, intersect2[0], intersect2[1]);
                }
                //h2 = geomFunctions.getSegmentParam(vertLineX1, vertLineY1, vertLineX2, vertLineY2, intersect2[0], intersect2[1]);

            }
            if (!d1 && !d2) {
                return;
            }
            if (d1 && d2) {
                if (d1 > d2) {
                    return intersect1;
                }
                else {
                    return intersect2;

                }
            }
            else {
                if (d1) {
                    return intersect1;
                }
                if (d2) {
                    return intersect2;
                }
            }


        },

        fitPointsInsideDomain: function fitPointsInsideDomain(plot, segment) {
            if (segment === undefined) {
                return;
            }
            if (segment.length < 2) {
                return;
            }
            var i,
            lastX, lastY,
            intersect,

            //            lastIntersect,
            //            beginFrom,
            lastDomain, currentDomain,
            //            adjustNewPoint,
            //            adjustOldPoint,
            //            newPointIntersect,
            //            lastPointIntersect,
            //            archiveNewPointIntersect,
            //            breakSegment,
            currentSegment = [],
            dividedSegments = [currentSegment],

            domainHistory = [];


            for (i = 0; i < segment.length - 1; i += 2) {
                if (segment[i] === lastX && segment[i + 1] === lastY) {
                    continue;
                }
                currentDomain = this.getDomainForPoint(plot, segment[i], segment[i + 1]);

                if (lastX === undefined) {

                    lastX = segment[i];
                    lastY = segment[i + 1];




                    if (currentDomain === 0) {
                        currentSegment.push(segment[i]);
                        currentSegment.push(segment[i + 1]);
                    }
                    lastDomain = currentDomain;
                    domainHistory.push(currentDomain);
                    continue;
                }



                if (currentDomain !== lastDomain) {

                    if (currentDomain === 0) {
                        if (domainHistory.indexOf(0) > -1) {

                            while (domainHistory.length > 0) { domainHistory.pop(); }
                            currentSegment = [];
                            dividedSegments.push(currentSegment);

                        }
                    }

                    domainHistory.push(currentDomain);
                }


                ////console.log('last domain ' + lastDomain + ' current domain ' + currentDomain);
                ////console.log('adjust old ' + adjustOldPoint + ' adjust new ' + adjustNewPoint);

                if (currentDomain === 0) {
                    if (lastDomain !== 0) {
                        intersect = this.projectPointOnDomain(plot, segment[i], segment[i + 1], lastX, lastY);
                        if (intersect === undefined) {
                            ////console.log("Cant project point ", lastX, lastY + " onto domain...skipping");
                            continue;
                        }
                        currentSegment.push(intersect[0]);
                        currentSegment.push(intersect[1]);
                    }

                    currentSegment.push(segment[i]);
                    currentSegment.push(segment[i + 1]);
                }
                else {
                    if (lastDomain === 0) {
                        intersect = this.projectPointOnDomain(plot, lastX, lastY, segment[i], segment[i + 1]);
                        if (intersect === undefined) {
                            ////console.log("Cant project point ", segment[i], segment[i + 1] + " onto domain...skipping");
                            continue;
                        }

                        currentSegment.push(intersect[0]);
                        currentSegment.push(intersect[1]);
                    }
                    else {
                        if (currentDomain !== lastDomain) {
                            intersect = this.projectPointOnDomain(plot, segment[i], segment[i + 1], lastX, lastY);
                            if (intersect === undefined) {
                                ////console.log("Cant project point ", lastX, lastY + " onto domain...skipping");
                                continue;
                            }
                            currentSegment.push(intersect[0]);
                            currentSegment.push(intersect[1]);

                            intersect = this.projectPointOnDomain(plot, lastX, lastY, segment[i], segment[i + 1]);
                            if (intersect === undefined) {
                                ////console.log("Cant project point ", segment[i], segment[i + 1] + " onto domain...skipping");
                                continue;
                            }
                            currentSegment.push(intersect[0]);
                            currentSegment.push(intersect[1]);


                        }
                    }
                }



                lastDomain = currentDomain;
                lastX = segment[i];
                lastY = segment[i + 1];



            }

            return dividedSegments;

        },

        changePivot: function changePivot(lastPoint, pivot, point, tolerance) {

            var p = geomFunctions.getSegmentParam(point[0], point[1], lastPoint[0], lastPoint[1], pivot[0], pivot[1]),
            interpolatedPoint;


            if (p < 1) {
                return false;
            }

            interpolatedPoint = [lastPoint[0] + p * (pivot[0] - lastPoint[0]), lastPoint[1] + p * (pivot[1] - lastPoint[1])];


            return (Math.abs(point[0] - interpolatedPoint[0]) <= tolerance && Math.abs(point[1] - interpolatedPoint[1]) <= tolerance);
        },

        isPointOutSideDomain: function isPointOutSideDomain(plot, x1, y1) {
            return this.getDomainForPoint(plot, x1, y1) === 0;
        },

        getDomainForPoint: function getDomainForPoint(plot, x1, y1) {
            //0 means inside 1 means below 2 means above
            //
            var x = 0, y = 0;
            if (x1 < plot.domain.minX - 10) {
                x = 1;
            }
            else if (x1 > plot.domain.maxX + 10) {
                x = 2;
            }

            if (y1 < plot.domain.minY) {
                y = 1;
            }
            else if (y1 > plot.domain.maxY) {
                y = 2;
            }
            return y * 10 + x;
        },


        getPlotObject: function getPlotObject(domain) {
            return {
                lines: [],
                segment: null,
                tolerance: domain.tolerance,
                domain: domain,
                gridGraph:domain.gridGraph,
                basePoint: null,
                unsettledPoint: null,
                paramVariable: domain.paramVariable
            };
        },

        refine: function (pt1, pt2, engine, plot) {
            var breakingPoint, xmean;
            xmean = geomFunctions.mean(pt1[0], pt2[0]);
            breakingPoint = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.detectJump(engine, plot.domain.tolerance, pt1[0], pt1[1], xmean, engine(xmean), pt2[0], pt2[1]);
            if (breakingPoint) {
                MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.addPoint(plot, breakingPoint[0][0], breakingPoint[0][1]);
                MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.finishSegment(plot);
                MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.addPoint(plot, breakingPoint[1][0], breakingPoint[1][1]);
            }
        },

        generatePlot: function generatePlot(engine, plotData) {

            //var plotWorker = new Worker('../grid-graph/scripts/views/plotWorker.js');
            //plotWorker.addEventListener('message', function (e) {

            //    //console.log('Worker responded ' + e.data);
            //}, false);
            //plotWorker.postMessage({ 'code': equationData.analysis.functionCode, 'plot': plotData,'constants':equationData.constants });
            //return;


            //TODO domain in plot is redundant...merge them in plot?
            var plot = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.getPlotObject(plotData),

                refinedPoint,
                x = plotData.minX,
                y = engine(x),
                currentPoint = [x, y];


            if (isFinite(y)) {
                MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.addPoint(plot, x, y);
            }
            x += plotData.step;


            while (x <= plotData.maxX) {
                y = engine(x);
                if (isFinite(y) && isFinite(currentPoint[1])) {
                    MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.refine(currentPoint, [x, y], engine, plot);
                    MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.addPoint(plot, x, y);
                }
                else if (isFinite(y) && !isFinite(currentPoint[1])) {
                    refinedPoint = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.limitedRefine(currentPoint[0], currentPoint[1], x, y, engine);
                    if (refinedPoint[0] !== x) {
                        MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.addPoint(plot, refinedPoint[0], refinedPoint[1]);
                    }
                    MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.refine(refinedPoint, [x, y], engine, plot);
                    MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.addPoint(plot, x, y);
                }
                else if (!isFinite(y) && isFinite(currentPoint[1])) {
                    refinedPoint = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.limitedRefine(currentPoint[0], currentPoint[1], x, y, engine);
                    MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.refine(currentPoint, refinedPoint, engine, plot);
                    if (refinedPoint[0] !== currentPoint[0]) {
                        MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.addPoint(plot, refinedPoint[0], refinedPoint[1]);
                    }
                    MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.finishSegment(plot);
                }
                currentPoint = [x, y];
                x += plotData.step;
            }
            MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.finishSegment(plot);
            return plot.lines;
        },

        detectJump: function detectJump(engine, tolerance, x1, y1, xmean, ymean, x2, y2) {

            var pole1, pole2, flag1, flag2, diff1, diff2, jumpFrom, jumpTo;

            if (!isFinite(y1) || !isFinite(ymean) || !isFinite(y2)) {
                return;
            }

            if (x1 > xmean || xmean > x2) {
                return;
            }

            ////console.log('detecting jump between ' + x1, y1 + ">> " + x2, y2);

            //tolerance = 0;

            while (1) {

                pole1 = this.getInterpolationParam(x1, xmean);
                flag1 = engine(pole1);
                diff1 = Math.abs(flag1 - geomFunctions.mean(y1, ymean));

                pole2 = this.getInterpolationParam(xmean, x2);
                flag2 = engine(pole2);
                diff2 = Math.abs(flag2 - geomFunctions.mean(ymean, y2));



                ////console.log('->[' + x1.toFixed(4), y1.toFixed(4) + ']  ~[' + m.toFixed(4), n.toFixed(4) + ']  mean[' + xmean.toFixed(4), ymean.toFixed(4) + '] ~2[' + o.toFixed(4), p.toFixed(4) + '] [' + x2.toFixed(4), y2.toFixed(4) + ']<-');


                //since the curve is very close to the mean values, we dont need to refine further
                if (diff1 <= tolerance && diff2 <= tolerance) {
                    ////console.log('curve going as expected');
                    return null;
                }

                if (!isFinite(flag1)) {
                    //check $\frac{1}{x^2}$ with upper values> ~20
                    jumpFrom = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.limitedRefine(x1, y1, pole1, flag1, engine);
                    jumpTo = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.limitedRefine(pole1, flag1, x2, y2, engine);
                    return [jumpFrom, jumpTo];
                }
                if (!isFinite(flag2)) {
                    jumpFrom = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.limitedRefine(x1, y1, pole2, flag2, engine);
                    jumpTo = MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.limitedRefine(pole2, flag2, x2, y2, engine);
                    return [jumpFrom, jumpTo];
                }


                if ((pole1 === x1 || pole1 === xmean) && (pole2 === xmean || pole2 === x2)) {
                    if (Math.abs(ymean - y1) > Math.abs(y2 - ymean)) {
                        jumpFrom = [x1, y1];
                        jumpTo = [xmean, ymean];
                        ////console.log('Jump point found ' + jumpFrom + " to " + jumpTo);
                    }
                    else {
                        jumpFrom = [xmean, ymean];
                        jumpTo = [x2, y2];
                        ////console.log('Jump point found ' + jumpFrom + " to " + jumpTo);
                    }
                    return [jumpFrom, jumpTo];
                }

                if (pole1 === x1 || pole1 === xmean) {
                    return MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.selectJumpPoint(x1, y1, xmean, ymean, pole2, flag2, x2, y2);
                }
                if (pole2 === xmean || pole2 === x2) {
                    return MathInteractives.Common.Components.Models.MathUtilitiesGraph.plottingFunctions.selectJumpPoint(x1, y1, pole1, flag1, xmean, ymean, x2, y2);
                }

                if (diff1 > diff2) {
                    x2 = xmean;
                    y2 = ymean;
                    xmean = pole1;
                    ymean = flag1;
                }
                else {
                    x1 = xmean;
                    y1 = ymean;
                    xmean = pole2;
                    ymean = flag2;
                }
            }
        },


        selectJumpPoint: function selectJumpPoint(x1, y1, x2, y2, x3, y3, x4, y4) {
            var diff1 = Math.abs(y2 - y1),
                diff2 = Math.abs(y3 - y2),
                diff3 = Math.abs(y4 - y3);

            if (diff1 > diff2 && diff1 > diff3) {
                return [[x1, y1], [x2, y2]];
            }
            else if (diff3 > diff2 && diff3 > diff1) {
                return [[x3, y3], [x4, y4]];
            }
            else {
                return [[x2, y2], [x3, y3]];
            }
        },





        getInterpolationParam: function getInterpolationParam(x1, x2) {
            if (x1 > x2) {
                //swap x1 x2
                x1 = x1 + x2 - (x2 = x1);
            }

            if (Math.abs(x1) > 0.01 || Math.abs(x2) > 0.01) {
                return geomFunctions.mean(x1, x2);
            }
            else {
                if (x1 === 0) {
                    //$\left(\cos x\right)\cdot \log x$
                    return x2 * Math.abs(x2);
                }
                else if (x2 === 0) {
                    return x1 * Math.abs(x1);
                }
                else {
                    if (x1 > 0 !== x2 > 0) {
                        //if one is positive and one is negative then 0
                        return 0;
                    }
                    return geomFunctions.mean(x1, x2);

                    /*if (x1 > 0) {
                    //both and +ve and we take a +ve root as interpolation param
                    root = Math.sqrt(x1 * x2);
                    }
                    else {
                    //both and -ve and we take a -ve root as interpolation param
                    root = -Math.sqrt(x1 * x2);
                    }

                    //x2 >= root >= x1
                    if (root >= x1 && x2 >= root) {
                    return root;
                    }
                    else {
                    return geomFunctions.mean(x1, x2);
                    }
                    */
                }
            }
        },
        setGraphView: function setGraphView(view) {
            this._graphView = view;
        },

        limitedRefine: function limitedRefine(x1, y1, x2, y2, engine) {
            var pole, flag;
            //            //console.log('limited Refine from ' + x1, y1 + ' to ' + x2, y2);

            if (isFinite(y1) === isFinite(y2)) {
                ////console.log('one of of the params has to be non-finite');
                return;
            }
            while (1) {
                pole = this.getInterpolationParam(x1, x2);
                flag = engine(pole);
                if (pole === x1 || pole === x2) {
                    if (isFinite(y1)) {
                        return [x1, y1];
                    }
                    else {
                        return [x2, y2];
                    }
                }
                if (isFinite(flag) !== isFinite(y1)) {
                    x2 = pole;
                    y2 = flag;
                }
                else {
                    x1 = pole;
                    y1 = flag;
                }
            }
        }

    });
} (window.MathUtilities));