(function (MathInteractives) {
    'use strict';
    MathInteractives.Common.Components.Views.MathUtilitiesGraphNew.plotterView = Backbone.View.extend({
        model: null,
        _graphView: null,
        _plottingFuntions: null,
        _worker: null,
        initialize: function initialize() {
            this.model = new MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plotterModel();
            this.graphView = this.options.graphView;
            //this._plottingFuntions = new `(this.graphView);
            //MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.setGraphView(this.graphView);
            this.graphView.on('graph:zoom-pan', $.proxy(function onzoom() {
                var equations = this.model._equations, i, equationSpecie, equationsLength = equations.length,
                    criticalPoints;
                for (i = 0; i < equationsLength; i++) {
                    equationSpecie = equations[i].getSpecie();
                    criticalPoints = equations[i].getCriticalPoints();
                    if (criticalPoints !== null && criticalPoints.getPointsGroup() !== null) {
                        criticalPoints.getPointsGroup().visible = false;
                    }
                    if (equationSpecie !== undefined && equationSpecie !== null && equationSpecie !== 'error' && equationSpecie !== 'expression' && equationSpecie !== 'number' && equationSpecie !== 'quadratic') {
                        if (equationSpecie === 'polygon') {
                            this.graphView.drawPolygon(equations[i]);
                        }
                        else if (equationSpecie === 'point') {
                            continue;
                        }
                        else if (equationSpecie === 'annotation') {

                            this.graphView.drawPolygon(equations[i]);

                        }
                        else if (equationSpecie === 'image') {
                            this.graphView.repositionImage(equations[i]);

                        }
                        else {
                            this._plot(equations[i]);
                        }
                    }
                }

            }, this));
            MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Productions.init();
            //Backbone.listenTo(plotModelObject, 'change:color', $.proxy(this._changePlotColor, plotModelObject));
        },

        addEquation: function addEquation(equationData) {
            var equations = this.model._equations,
            equationMap = this.model._equationsMap;

            if (equations.indexOf(equationData) !== -1) {
                return;
            }
            equations.push(equationData);
            equationMap[equationData.getId()] = equationData;
            equationData.on('change-visibility', $.proxy(function () {
                this.changePlotVisibility(equationData);
            }, this));
            if (equationData.getSpecie() === 'image') {
                this.graphView._paperScope.view.draw();
                return;
            }

            equationData.on('change-equation', $.proxy(function () {
                this._showConsole(true, 'Updating plot for equation ' + equationData);
                this.addPlot(equationData);

            }, this));

            equationData.on('plot-equation', $.proxy(function () {
                this._showConsole(true, 'Plotting equation ' + equationData);
                this._plot(equationData);

            }, this));

            equationData.on('change-color', $.proxy(function () {
                this.changePlotColor(equationData);
            }, this));

            equationData.on('change-points-color', $.proxy(function () {
                this.changePointsColor(equationData);
            }, this));

            equationData.on('change-constants', $.proxy(function () {
                //var allEquationConstantsLength = equationData.getAllConstants().length;
                var allEquationConstantsLength = equationData.getAllConstants().length;
                if (allEquationConstantsLength === 0 || equationData.getSpecie() === 'point') {
                    return;
                }
                if (equationData.getSpecie() === 'error' || equationData.getSpecie() === 'expression' || allEquationConstantsLength > 0) {
                    this.addPlot(equationData);
                }
                else {
                    this._plot(equationData);
                }
            }, this));

            equationData.on('change-thickness', $.proxy(function () {
                ////console.log(equationData.thickness);
                //                debugger;
                if (equationData.getSpecie() === 'point') {
                    if (equationData.getPointsGroup() !== null) {
                        //equationData.thickness = equationData.thickness; //check
                        this.graphView._redrawPoints();
                    }
                }
                else {
                    if (equationData.getPathGroup() !== null) {
                        equationData.getPathGroup().strokeWidth = equationData.getThickness();
                    }
                }


            }, this));
            if (equationData.getSpecie() === 'polygon' || equationData.getSpecie() === 'annotation') {

                if (equationData.getSpecie() === 'annotation') {
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
                if (equationData.getPathGroup() !== null) {
                    this.graphView.removePlottedGraph(equationData);
                }
                if (equationData.getPointsGroup() !== null) {
                    this.graphView.removePoint(equationData);
                }
                if (equationData.getRaster() !== null) {
                    this.graphView.removeRaster(equationData);
                }
                this.graphView.removeInEqualityPlots(equationData);
                //equations.splice(indices[i], 1);
                equations.splice(idx, 1);
                //}
            }
            delete equationMap[equationData.getId()];
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

        changePlotVisibility: function changePlotVisibility(equationData) {
            var i, pathGroup, specie, visible, pointGroup;
            if (equationData.getSpecie() === 'point') {
                pointGroup = equationData.getPointsGroup();
                for (i = 0; i < pointGroup.children.length; i++) {
                    if (pointGroup.children[i].hit) {
                        continue;
                    }
                    pointGroup.children[i].visible = equationData.getVisible().point;
                }


            } else {
                pathGroup = equationData.getPathGroup();
                visible = equationData.getVisible().curve;
                if (pathGroup && visible === false) {
                    pathGroup.visible = visible;
                    equationData.removePathGroup();
                } else {
                    if (!pathGroup) {
                        specie = equationData.getSpecie();
                        if (equationData.getSpecie() === 'plot') {
                            this._plot(equationData);
                        } else if (specie === 'annotation' || specie === 'polygon') {
                            this.graphView.drawPolygon(equationData);
                        }
                    }
                    // equationData.pathGroup.visible = equationData.visible;
                }


                if (equationData.getRaster()) {
                    equationData.getRaster().visible = equationData.getVisible().curve;
                }
            }
            this.graphView.refreshView();
        },
        changePlotColor: function changePlotColor(equationData) {
            var i, pathGroup = equationData.getPathGroup();
            if (equationData.getSpecie() === 'point') {
                if (equationData.getDashArray().length === 0) {
                    this.changePointsColor(equationData);
                }
                else {
                    this.changePointsColor(equationData);
                }
            }
            else {
                if (pathGroup) {
                    for (i = 0; i < pathGroup.children.length; i++) {
                        if (pathGroup.children[i].hit) {
                            continue;
                        }
                        pathGroup.children[i].strokeColor = equationData.getColor();
                    }
                }
            }
            this.graphView.refreshView();
        },
        changePointsColor: function changePointsColor(equationData) {
            var equationPointsGroup = equationData.getPointsGroup();
            if (equationPointsGroup === null) {
                return;
            }
            var i;
            if (equationData.getDashArray().length === 0) {
                for (i = 0; i < equationPointsGroup.children.length; i++) {
                    if (equationPointsGroup.children[i].hit) {
                        continue;
                    }
                    //equationData.pointsGroup.children[i].strokeColor = equationData.color;
                    equationPointsGroup.children[i].fillColor = equationData.getColor();
                }

            }
            else {
                for (i = 0; i < equationPointsGroup.children.length; i++) {
                    if (equationPointsGroup.children[i].hit) {
                        continue;
                    }
                    equationPointsGroup.children[i].strokeColor = equationData.getColor();
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
                equationOrder,
                functionCooefecient,
                solution;

            //MathUtilities.Components.EquationEngine.Models.Parser.parseEquation(equationData);
			if (!equationData.getBlind()) {
            	MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Parser.parseEquationToGetTokens(equationData);
            	if (equationData.isCanBeSolved() === false) {
                	return;
            	}
            	if (equationData.getSpecie() !== 'number' && equationData.getSpecie() !== 'point') {
                	MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Parser.processTokensWithRules(equationData);
                	if (equationData.isCanBeSolved() === false) {
                    	return;
                	}
                	MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Parser.generateTreeFromRules(equationData);
            	}
			}
            //debugger;
            if (equationData.getSpecie() === 'point') {
                //this.graphView.removePoint(equationData);

                if (!equationData.getBlind()) {
                    solution = equationData.getSolution();
                    pointsLength = solution.length;
                    equationData.setPoints([]);
                    for (pointCounter = 0; pointCounter < pointsLength; pointCounter++) {
                        point = [];
                        point.push(Number(solution[pointCounter][0]));
                        point.push(Number(solution[pointCounter][1]));
                        equationData.getPoints().push(point);
                    }
                }

                //equationData.thickness = 10;
                this.graphView.drawPoint(equationData);
            }
            else if (equationData.getBlind() === false && equationData.isCanBeSolved() === true && equationData.getSpecie() !== 'expression' && equationData.getSpecie() !== 'number') {
                //if (equationData.functionVariable !== undefined) {
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.TreeProcedures.convertToSolvableForm(equationData);
                if (equationData.getSpecie() === 'quadratic') {
                    solution = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.TreeProcedures.solveEquation(equationData, 1);
                    equationData.setSolution(solution);
                }
                if (equationData.getSpecie() === 'plot') {
                    equationOrder = equationData.getParamVariableOrder();
                    if (equationOrder < 2) {
                        functionCooefecient = equationData.getB();
                    }
                    else {
                        functionCooefecient = equationData.getA();
                    }
                    if (equationData.getInEqualityType() !== 'equal' && (functionCooefecient.sign === '-' || functionCooefecient.value < 0)) {
                        equationData.reverseInequality();
                    }
                    this._plot(equationData);
                }


                //            this.model._equations.push(equationData);
                //}
                //else {
                //    //console.log('Function variable is missing');
                //}
            }
            else if (equationData.getBlind() === true) {
                this._plot(equationData);
            }
            else {
                this._showConsole(true, 'Cant plot this equation');
            }


        },

        _plot: function _plot(equationData) {
            equationData.setLeftArray([]);
            equationData.setRightArray([]);
            var equationMap = this.model._equationsMap,
                calculatedTolerance, self = this, graphViewMarkerBounds = this.graphView.markerBounds, equationParamVariable = equationData.getParamVariable(),
            //getPoint2,
            MINRANGE = (Number)(graphViewMarkerBounds.min[equationParamVariable]),
            MAXRANGE = (Number)(graphViewMarkerBounds.max[equationParamVariable]),
            equationOrder,
            //solution,
            userAgent = navigator.userAgent.toLowerCase(),
            decimalsLength,
            leftArray = [],
            rightArray = [],
            plotData,
            criticalArray1 = [], eqn,
            criticalArray2 = [],
            discontinousPoints = [],
            criticalPoints,
            xCoord = 0,
            yCoord = 1,
            graphViewMarkerBound,
            arrILength,
            minRange,
            maxRange,
            translatedArray,
            equationRange = equationData.getRange(),
            graphView = this.graphView,
            step = 8 * ((Math.abs(MINRANGE) + Math.abs(MAXRANGE)) / 10000),
            arr, arr2, arrTranslated, sourceEquationData, i, engine, engine1, engine2;
            graphView._paperScope.activate();

            //            equationData._directives.range = {};
            //            equationData._directives.range.min = { include: false, value: -1.3 };
            //            equationData._directives.range.max = { include: false, value: 0.25 };
            equationRange = equationData.getRange();
            if (equationRange !== null && equationRange !== undefined) {
                if (equationRange.min !== null) {
                    MINRANGE = equationRange.min.value;
                    if (equationRange.min.include === false) {
                        MINRANGE += step;
                    }
                }
                if (equationRange.max !== null) {
                    MAXRANGE = equationRange.max.value;
                    if (equationRange.max.include === false) {
                        MAXRANGE -= step;
                    }
                }
            }
            calculatedTolerance = this.graphView.getMinimumMarkerValues();
            plotData = {
                minX: MINRANGE,
                maxX: MAXRANGE,
                minY: (Number)(graphViewMarkerBounds.min[equationData.getFunctionVariable()]),
                maxY: (Number)(graphViewMarkerBounds.max[equationData.getFunctionVariable()]),
                step: step,
                tolerance: calculatedTolerance.xMinMarker / 100,
                paramVariable: equationParamVariable
            };

            decimalsLength = (step.toString().split('.')[1] || []).length;
            //            if (nameSpace.Parser._debugFlag.plot) //console.log('Step used is :: ' + step);
            //            if (nameSpace.Parser._debugFlag.plot) //console.log('decimalsLength :: ' + decimalsLength);

            equationOrder = equationData.getParamVariableOrder();

            if (equationData.getVisible().curve === false) {
                return;
            }
            //function getPoint(param) {
            //    var solution = MathUtilities.Components.EquationEngine.Models.TreeProcedures.solveEquation(equationData, param);
            //    if (solution !== undefined) {
            //        return solution[0];
            //    }
            //    else {
            //        return undefined;
            //    }

            //}

            /*if (equationData.blind === false && equationData.freeVars[equationData.paramVariable] === 1 && equationData.freeVars[equationData.functionVariable] === 1) {
            leftArray = plottingFunctions.generateSimplePlot(getPoint, plotData);
            }
            else */
            {
                //leftArray = plottingFunctions.generatePlot(getPoint, plotData);
                if (false/*userAgent.indexOf('msie 9') === -1*/) {
                    if (this._worker === null) {
                        if (MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Parser._deploy === false) {
                            this._worker = new Worker('scripts/models/plot-worker.js');
                        }
                        else {
                            this._worker = new Worker(MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plotterModel.BASEPATH + 'js/math-utilities/components/equation-engine/scripts/models/plot-worker.js');
                        }



                        this._worker.addEventListener('message', function (e) {
                            sourceEquationData = equationMap[e.data.id];
                            if (!sourceEquationData) {
                                return;
                            }

                            discontinousPoints = [];
                            ////console.log('Plot Current Session ' + sourceEquationData.plotSessionCount + ' Response: ' + e.data.plotSession);
                            if (Number(sourceEquationData.getPlotSessionCount()) !== Number(e.data.plotSession)) {
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
                            //console.log(e.data.plot.paramVariable);
                            //console.log(equationData.getFunctionVariable());
                            graphViewMarkerBound = {
                                min: {
                                    x: graphViewMarkerBounds.min['x'] + 2 * e.data.plot.step,
                                    y: graphViewMarkerBounds.min['y'] + 2 * e.data.plot.step
                                },
                                max: {
                                    x: graphViewMarkerBounds.max['x'] - 2 * e.data.plot.step,
                                    y: graphViewMarkerBounds.max['y'] - 2 * e.data.plot.step
                                }
                            };
                            minRange = graphView._getCanvasPointCoordinates([graphViewMarkerBound.min.x, graphViewMarkerBound.min.y]);
                            maxRange = graphView._getCanvasPointCoordinates([graphViewMarkerBound.max.x, graphViewMarkerBound.max.y]);
                            graphViewMarkerBound.min = {
                                x: minRange[0],
                                y: maxRange[1]
                            };
                            graphViewMarkerBound.max = {
                                x: maxRange[0],
                                y: minRange[1]
                            };
                            for (i = 0; i < arr.length; i++) {

                                translatedArray = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.translateSegment(e.data.plot, arr[i], graphView);
                                arrTranslated.push(translatedArray);
                                arrILength = translatedArray.length;
                                if ((translatedArray[0][xCoord] > graphViewMarkerBound.min.x && translatedArray[0][xCoord] < graphViewMarkerBound.max.x) && (translatedArray[0][yCoord] > graphViewMarkerBound.min.y && translatedArray[0][yCoord] < graphViewMarkerBound.max.y)) {
                                    discontinousPoints.push(graphView._getGraphPointCoordinates(translatedArray[0]));
                                }
                                if ((translatedArray[arrILength - 1][xCoord] > graphViewMarkerBound.min.x && translatedArray[arrILength - 1][xCoord] < graphViewMarkerBound.max.x) && (translatedArray[arrILength - 1][yCoord] > graphViewMarkerBound.min.y && translatedArray[arrILength - 1][yCoord] < graphViewMarkerBound.max.y)) {
                                    discontinousPoints.push(graphView._getGraphPointCoordinates(translatedArray[arrILength - 1]));
                                }
                            }
                            ////console.log('this is ' + this + ' map is ' + equationMap);

                            // //console.log('data ready for ' + e.data.id);


                            ////console.log('data ready for equation ' + sourceEquationData.equation);

                            sourceEquationData.setLeftArray(arrTranslated);

                            if (arr2 !== undefined) {
                                arrTranslated = [];

                                for (i = 0; i < arr2.length; i++) {
                                    arrILength = arr2[i].length;
                                    translatedArray = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.translateSegment(e.data.plot, arr2[i], graphView);
                                    arrTranslated.push(translatedArray);
                                    arrILength = translatedArray.length;
                                    if ((translatedArray[0][0] > graphViewMarkerBound.min.x && translatedArray[0][0] < graphViewMarkerBound.max.x) && (translatedArray[0][1] > graphViewMarkerBound.min.y && translatedArray[0][1] < graphViewMarkerBound.max.y)) {
                                        discontinousPoints.push(graphView._getGraphPointCoordinates(translatedArray[0]));
                                    }
                                    if ((translatedArray[arrILength - 1][0] > graphViewMarkerBound.min.x && translatedArray[arrILength - 1][0] < graphViewMarkerBound.max.x) && (translatedArray[arrILength - 1][1] > graphViewMarkerBound.min.y && translatedArray[arrILength - 1][1] < graphViewMarkerBound.max.y)) {
                                        discontinousPoints.push(graphView._getGraphPointCoordinates(translatedArray[arrILength - 1]));
                                    }
                                }
                                sourceEquationData.setRightArray(arrTranslated);
                                engine = new Function('param,constants', sourceEquationData.getFunctionCode());
                                //engine1 = function eng1(param) { var soln = engine(param, sourceEquationData.getConstants()); return soln[0]; };
                                engine2 = function eng2(param) { var soln = engine(param, sourceEquationData.getConstants()); return soln[1]; };
                                //if (sourceEquationData.getCriticalPoints() === null) {
                                //    criticalPoints = self._createCriticalPointEquationData(sourceEquationData);
                                //}
                                //if (sourceEquationData.hasFocus && sourceEquationData.getCurveVisibility()) {
                                //    criticalPoints.setVisible(true);
                                //    //sourceEquationData.setThickness(sourceEquationData.getThickness() + 1);
                                //}
                                //else {
                                //    criticalPoints.setVisible(false);
                                //}
                                criticalArray2 = self.findCriticalPoints(arr2, sourceEquationData.getFunctionVariable(), engine2, false, e.data.plot.step);
                                //graphView.criticalPointsShowOnHover(sourceEquationData.getCriticalPoints().getPointsGroup(), sourceEquationData.getCriticalPoints());
                                //equationData.criticalPoints.setPoints(criticalArray2);
                                //graphView.drawPoint(equationData.criticalPoints);

                            }
                            if (sourceEquationData.getInEqualityType() !== 'equal') {
                                self.getInEqualityPlots(sourceEquationData, graphViewMarkerBounds, true);
                                graphView.drawInequalitites(sourceEquationData);
                            }
                            

                            sourceEquationData.setPoints(sourceEquationData.getLeftArray());
                            //console.log(arr);

                            engine = new Function('param,constants', sourceEquationData.getFunctionCode());

                            engine1 = function eng1(param) { var soln = engine(param, sourceEquationData.getConstants()); return soln[0]; };
                            engine2 = function eng2(param) { var soln = engine(param, sourceEquationData.getConstants()); return soln[1]; };

                            if (sourceEquationData.getCriticalPoints() === null) {
                                criticalPoints = self._createCriticalPointEquationData(sourceEquationData);
                            }
                            else {
                                criticalPoints = sourceEquationData.getCriticalPoints();
                            }
                            criticalArray1 = self.findCriticalPoints(arr, sourceEquationData.getFunctionVariable(), engine1, equationData, false, e.data.plot.step);
                            criticalArray1 = criticalArray1.concat(criticalArray2);
                            if (discontinousPoints.length !== 0) {
                                console.log('discontinous points::::::::', discontinousPoints)
                                criticalArray1 = criticalArray1.concat(discontinousPoints);

                            }
                            sourceEquationData.getCriticalPoints().setPoints(criticalArray1);
                            //equationData.setPointsGroup(criticalArray1);
                            //console.log('critical pts :');
                            //console.log(equationData.getCriticalPoints());
                            if (sourceEquationData.hasFocus && sourceEquationData.getCurveVisibility()) {
                                criticalPoints.showGraph();
                                //sourceEquationData.setThickness(sourceEquationData.getThickness() + 1);
                            }
                            else {
                                criticalPoints.hideGraph();
                            }
                            graphView.drawPoint(sourceEquationData.getCriticalPoints());

                            
                            // repeated bcoz points are redrawn and there is some issue with draggable points
                            if (sourceEquationData.hasFocus && sourceEquationData.getCurveVisibility()) {
                                criticalPoints.showGraph();
                                //sourceEquationData.setThickness(sourceEquationData.getThickness() + 1);
                            }
                            else {
                                criticalPoints.hideGraph();
                            }

                            //equationData.plotModel.points2 = rightArray;
                            //if (sourceEquationData.thickness === undefined) {
                            //    sourceEquationData.thickness = 2;
                            //}
                            for (var i = 0; i < criticalPoints.getPointsGroup().children.length; i++) {
                                criticalPoints.getPointsGroup().children[i].opacity = 0.5;
                            }
                            graphView.criticalPointsShowOnHover(criticalPoints.getPointsGroup(), criticalPoints);
                            //criticalPoints.getPointsGroup().opacity = 0.5;
                            graphView._addSegments(sourceEquationData);
                            self.graphView._paperScope.view.draw();
 							sourceEquationData.setPoints(sourceEquationData.getLeftArray());
                        }, false);

                    }
                    ////console.log('posting for eqn ' + equationData.equation + ' with code ' + equationData.analysis.functionCode);
                    equationData.setPlotSessionCount(equationData.getPlotSessionCount() + 1);
                    this._worker.postMessage({ 'code': equationData.getFunctionCode(), 'plot': plotData, 'constants': equationData.getConstants(), 'order': equationOrder, 'id': equationData.getId(), 'autonomous': equationData.getAutonomous(), 'plotSession': equationData.getPlotSessionCount() });
                    return;
                }
                else {
                    plotData.gridGraph = graphView;
                    if (equationData.getAutonomous()) {
                        engine = new Function('constants,plot', equationData.getFunctionCode());
                        leftArray = engine(equationData.getConstants(), plotData);
                        arrTranslated = [];
                        for (i = 0; i < leftArray.length; i++) {
                            arrTranslated.push(MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.translateSegment(plotData, leftArray[i], graphView));
                        }
                        leftArray = arrTranslated;
                    }
                    else {
                        engine = new Function('param,constants', equationData.getFunctionCode());

                        engine1 = function eng1(param) { var soln = engine(param, equationData.getConstants()); return soln[0]; };
                        engine2 = function eng2(param) { var soln = engine(param, equationData.getConstants()); return soln[1]; };

                        leftArray = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.generatePlot(engine1, plotData);

                        if (equationOrder === 2) {
                            rightArray = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.generatePlot(engine2, plotData);
                            equationData.setRightArray(rightArray);
                        }
                    }
                }
            }


            equationData.setLeftArray(leftArray);

            this.graphView._addSegments(equationData);

            equationData.setPoints(leftArray);
            if (equationData.getThickness() === undefined) {
                equationData.setThickness(3);
            }

        },

        _createCriticalPointEquationData: function _createCriticalPointEquationData(equationData) {
            equationData.setCriticalPoints(new MathUtilities.Components.EquationEngine.Models.EquationData());
            var criticalPoints = equationData.getCriticalPoints();
            criticalPoints.setColor('#8D8D8D', true);
            criticalPoints.hasParent = equationData;
            criticalPoints.setDraggable(true);
            criticalPoints.getStyle().setDragHitThickness(20);
            criticalPoints.setThickness(criticalPoints.getThickness() * 2.5);
            
            return criticalPoints;
        },

        getLinearContinuousInequalityPlots: function getLinearContinuousInequalityPlots(points, minX, minY, maxX, maxY, functionVariable, inEqualityType) {
            if (points.length < 2) {
                return;
            }
            var firstPointIntersection,
                secondPointIntersection,
                totalPoints = points.length,
                inEqualityPlots = [],
                isInEqualityLess = false,
                firstPoint = points[0],
                lastPoint = points[totalPoints - 1];

            firstPointIntersection = this._getPointIntersectionWithBounds(firstPoint, minX, minY, maxX, maxY);
            secondPointIntersection = this._getPointIntersectionWithBounds(lastPoint, minX, minY, maxX, maxY);

            if (firstPointIntersection === null || secondPointIntersection === null) {
                inEqualityPlots = this.getDiscontinuousInequalityPlots(points, minX, minY, maxX, maxY, functionVariable, inEqualityType);
                console.log('intersections not found');
                return inEqualityPlots;
            }

            if (inEqualityType === 'lesser' || inEqualityType === 'ltequal') {
                isInEqualityLess = true;
            }

            switch (firstPointIntersection) {
                case 'xMax':
                    switch (secondPointIntersection) {
                        case 'xMin':
                            if (functionVariable === 'y') {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([firstPoint[0], maxY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], maxY]);
                                }
                                else {
                                    inEqualityPlots.push([firstPoint[0], minY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], minY]);
                                }
                            }
                            else {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([firstPoint[0], minY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], minY]);
                                }
                                else {
                                    inEqualityPlots.push([firstPoint[0], maxY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], maxY]);
                                }
                            }
                            break;
                        case 'xMax':
                            if (isInEqualityLess) {
                                inEqualityPlots.push([minX, maxY]);
                                inEqualityPlots.push([firstPoint[0], maxY]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([lastPoint[0], minY]);
                                inEqualityPlots.push([minX, minY]);
                            }
                            else {
                                inEqualityPlots = inEqualityPlots.concat(points);
                            }
                            break;
                        case 'yMin':
                            if (isInEqualityLess) {
                                inEqualityPlots.push([firstPoint[0], maxY]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([minX, lastPoint[1]]);
                                inEqualityPlots.push([minX, maxY]);
                            }
                            else {
                                inEqualityPlots.push([firstPoint[0], lastPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                            }
                            break;
                    }
                    break;
                case 'xMin':
                    switch (secondPointIntersection) {
                        case 'xMax':
                            console.log('isInEqualityLess :: ' + isInEqualityLess);
                            if (isInEqualityLess) {
                                inEqualityPlots.push([firstPoint[0], maxY]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([lastPoint[0], maxY]);
                            }
                            else {
                                inEqualityPlots.push([firstPoint[0], minY]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([lastPoint[0], minY]);
                            }
                            break;
                        case 'yMax':
                            if (isInEqualityLess) {
                                inEqualityPlots.push([firstPoint[0], lastPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                            }
                            else {
                                inEqualityPlots.push([firstPoint[0], minY]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([maxX, lastPoint[1]]);
                                inEqualityPlots.push([maxX, minY]);
                            }
                            break;
                        case 'yMin':
                            if (functionVariable === 'y') {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([firstPoint[0], maxY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([maxX, lastPoint[1]]);
                                    inEqualityPlots.push([maxX, maxY]);
                                }
                                else {
                                    inEqualityPlots.push([firstPoint[0], lastPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                }
                            }
                            else {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([firstPoint[0], lastPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                }
                                else {
                                    inEqualityPlots.push([firstPoint[0], maxY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([maxX, lastPoint[1]]);
                                    inEqualityPlots.push([maxX, maxY]);
                                }
                            }
                            break;
                        case 'xMin':
                            if (isInEqualityLess) {
                                inEqualityPlots = inEqualityPlots.concat(points);
                            }
                            else {
                                inEqualityPlots.push([maxX, maxY]);
                                inEqualityPlots.push([firstPoint[0], maxY]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([lastPoint[0], minY]);
                                inEqualityPlots.push([maxX, minY]);
                            }
                            break;
                    }
                    break;
                case 'yMax':
                    switch (secondPointIntersection) {
                        case 'yMin':
                            if (functionVariable === 'y') {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([maxX, firstPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([maxX, lastPoint[1]]);
                                }
                                else {
                                    inEqualityPlots.push([minX, firstPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([minX, lastPoint[1]]);
                                }
                            }
                            else {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([minX, firstPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([minX, lastPoint[1]]);
                                }
                                else {
                                    inEqualityPlots.push([maxX, firstPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([maxX, lastPoint[1]]);
                                }
                            }
                            break;
                        case 'xMax':
                            if (functionVariable === 'y') {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([maxX, firstPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                }
                                else {
                                    inEqualityPlots.push([minX, firstPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], minY]);
                                    inEqualityPlots.push([minX, minY]);
                                }
                            }
                            else {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([minX, firstPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], minY]);
                                    inEqualityPlots.push([minX, minY]);
                                }
                                else {
                                    inEqualityPlots.push([maxX, firstPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                }
                            }
                            break;
                        case 'yMax':
                            if (isInEqualityLess) {
                                inEqualityPlots = inEqualityPlots.concat(points);
                            }
                            else {
                                inEqualityPlots.push([minX, minY]);
                                inEqualityPlots.push([minX, firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([maxX, lastPoint[1]]);
                                inEqualityPlots.push([maxX, minY]);
                            }
                            break;
                        case 'xMin':
                            if (isInEqualityLess) {
                                inEqualityPlots.push([lastPoint[0], firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                            }
                            else {
                                inEqualityPlots.push([maxX, firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([lastPoint[0], minY]);
                                inEqualityPlots.push([maxX, minY]);
                            }
                            break;
                    }
                    break;
                case 'yMin':
                    switch (secondPointIntersection) {
                        case 'xMax':
                            //if (functionVariable === 'y') {
                            if (isInEqualityLess) {
                                inEqualityPlots.push([minX, firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([lastPoint[0], maxY]);
                                inEqualityPlots.push([minX, maxY]);
                            }
                            else {
                                inEqualityPlots.push([lastPoint[0], firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                            }
                            //}
                            //else {
                            //    if (isInEqualityLess) {
                            //        inEqualityPlots.push([minX, firstPoint[1]]);
                            //        inEqualityPlots = inEqualityPlots.concat(points);
                            //        inEqualityPlots.push([lastPoint[0], maxY]);
                            //        inEqualityPlots.push([minX, maxY]);
                            //    }
                            //    else {
                            //        inEqualityPlots.push([maxX, firstPoint[1]]);
                            //        inEqualityPlots = inEqualityPlots.concat(points);
                            //    }
                            //}
                            break;
                        case 'yMin':
                            if (isInEqualityLess) {
                                inEqualityPlots.push([minX, maxY]);
                                inEqualityPlots.push([minX, firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([maxX, lastPoint[1]]);
                                inEqualityPlots.push([maxX, maxY]);
                            }
                            else {
                                inEqualityPlots = inEqualityPlots.concat(points);
                            }
                            break;
                        case 'yMax':
                            if (isInEqualityLess) {
                                inEqualityPlots.push([minX, firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([minX, lastPoint[1]]);
                            }
                            else {
                                inEqualityPlots.push([maxX, firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([maxX, lastPoint[1]]);
                            }
                            break;
                    }
                    break;
            }
            return inEqualityPlots;
        },

        _getPointIntersectionWithBounds: function _getPointIntersectionWithBounds(point, minX, minY, maxX, maxY) {
            var pointIntersection = null;
            if (point[0].toFixed(11) <= minX) {
                pointIntersection = 'xMin';
            }
            else if (Math.ceil(point[0]) >= maxX) {
                pointIntersection = 'xMax';
            }
            else if (point[1].toFixed(11) <= minY) {
                pointIntersection = 'yMin';
            }
            else if (Math.ceil(point[1]) >= maxY) {
                pointIntersection = 'yMax';
            }
            return pointIntersection;
        },

        _getBoundsForDiscontinuousFucntion: function _getBoundsForDiscontinuousFucntion(points) {
            var firstPoint = points[0],
                pointsLength = points.length,
                lastPoint = points[pointsLength - 1],
                returnBounds = {
                    'min': {
                        x: 0,
                        y: 0
                    },
                    'max': {
                        x: 0,
                        y: 0
                    }
                };

            if (firstPoint[0] <= lastPoint[0]) {
                returnBounds.min.x = firstPoint[0];
                returnBounds.max.x = lastPoint[0];
            }
            else {
                returnBounds.max.x = firstPoint[0];
                returnBounds.min.x = lastPoint[0];
            }

            if (firstPoint[1] <= lastPoint[1]) {
                returnBounds.min.y = firstPoint[1];
                returnBounds.max.y = lastPoint[1];
            }
            else {
                returnBounds.max.y = firstPoint[1];
                returnBounds.min.y = lastPoint[1];
            }
            return returnBounds;
        },

        getInEqualityPlots: function getInEqualityPlots(equationData, graphViewMarkerBounds) {
            var equationOrder = equationData.getParamVariableOrder(),
                points = equationData.getLeftArray(),
                inEqualityType = equationData.getInEqualityType(),
                pointsLength = points.length,
                minX = 0,
                maxX = this.graphView._getCanvasPointCoordinates([Number(graphViewMarkerBounds.max.x), 0])[0],
                minY = 0,
                maxY = this.graphView._getCanvasPointCoordinates([0, Number(graphViewMarkerBounds.min.y)])[1],
                firstPointIntersection,
                lastPointIntersection,
                inEqualityPlots = [],
                plots,
                currentSetOfPoints,
                totalPlots,
                plotsCounter,
                bounds,
                currentInequalityPlot,
                boundValue,
                functionVariable = equationData.getFunctionVariable(),
                pointsCounter;

            maxX = Math.floor(maxX);
            maxY = Math.floor(maxY);
            console.log('functionVariable :: ' + functionVariable);
            if (equationOrder < 2) {
                if (pointsLength === 1) {
                    inEqualityPlots.push(this.getLinearContinuousInequalityPlots(points[0], minX, minY, maxX, maxY, functionVariable, inEqualityType));
                }
                else {
                    for (pointsCounter = 0; pointsCounter < pointsLength; pointsCounter++) {
                        currentSetOfPoints = points[pointsCounter];
                        //bounds = this._getBoundsForDiscontinuousFucntion(currentSetOfPoints);
                        inEqualityPlots.push(this.getDiscontinuousInequalityPlots(currentSetOfPoints, minX, minY, maxX, maxY, functionVariable, inEqualityType));
                        //firstPointIntersection = this._getPointIntersectionWithBounds(points[pointCounter][0], minX, minY, maxX, maxY);
                        //if (firstPointIntersection === null) {

                        //}
                    }
                }
                //if (points.length === 1) {
                //    inEqualityPlots.push(this.getLinearContinuousInequalityPlots(points[0], graphViewMarkerBounds, functionVariable, inEqualityType));
                //}
            }
            else {
                // left array
                for (pointsCounter = 0; pointsCounter < pointsLength; pointsCounter++) {
                    currentSetOfPoints = points[pointsCounter];
                    //bounds = this._getBoundsForDiscontinuousFucntion(currentSetOfPoints);
                    plots = this.getQuadraticDiscontinuousInequalityPlots(equationData.getLeftArray()[pointsCounter], equationData.getRightArray()[pointsCounter], minX, minY, maxX, maxY, functionVariable, inEqualityType, pointsLength);
                    totalPlots = plots.length;
                    for (plotsCounter = 0; plotsCounter < totalPlots; plotsCounter++) {
                        inEqualityPlots.push(plots[plotsCounter]);
                    }
                    //firstPointIntersection = this._getPointIntersectionWithBounds(points[pointCounter][0], minX, minY, maxX, maxY);
                    //if (firstPointIntersection === null) {

                    //}
                }

                // right array
                //points = equationData.getRightArray();
                //pointsLength = points.length
                //for (pointsCounter = 0; pointsCounter < pointsLength; pointsCounter++) {
                //    currentSetOfPoints = points[pointsCounter];
                //    //bounds = this._getBoundsForDiscontinuousFucntion(currentSetOfPoints);
                //    inEqualityPlots.push(this.getQuadraticDiscontinuousInequalityPlots(currentSetOfPoints, minX, minY, maxX, maxY, functionVariable, inEqualityType, null, false));
                //    //firstPointIntersection = this._getPointIntersectionWithBounds(points[pointCounter][0], minX, minY, maxX, maxY);
                //    //if (firstPointIntersection === null) {

                //    //}
                //}
            }
            equationData.setInEqualityPlots(inEqualityPlots);
        },

        getQuadraticDiscontinuousInequalityPlots: function getQuadraticDiscontinuousInequalityPlots(leftPoints, rightPoints, minX, minY, maxX, maxY, functionVariable, inEqualityType, totalPaths) {
            var inEqualityPlots = [],
                plot = [],
                pointsLength,
                //leftPoints = equationData.getLeftArray(),
                //rightPoints = equationData.getRightArray(),
                isLeftArray,
                rightFirstPoint = rightPoints[0],
                leftFirstPoint = leftPoints[0],
                leftFirstPointIntersection,
                leftLastPointIntersection,
                rightFirstPointIntersection,
                rightLastPointIntersection,
                rightLastPoint = rightPoints[rightPoints.length - 1],
                leftLastPoint = leftPoints[leftPoints.length - 1];
            if (rightPoints === undefined) {
                isLeftArray = true;
            }
            leftFirstPointIntersection = this._getPointIntersectionWithBounds(leftFirstPoint, minX, minY, maxX, maxY);
            leftLastPointIntersection = this._getPointIntersectionWithBounds(leftLastPoint, minX, minY, maxX, maxY);
            rightFirstPointIntersection = this._getPointIntersectionWithBounds(rightFirstPoint, minX, minY, maxX, maxY);
            rightLastPointIntersection = this._getPointIntersectionWithBounds(rightLastPoint, minX, minY, maxX, maxY);
            if (inEqualityType === 'lesser' || inEqualityType === 'ltequal') {
                //if (functionVariable === 'y') {
                plot.push(rightFirstPoint);
                if (totalPaths === 1 && leftFirstPointIntersection === 'yMin' && leftLastPointIntersection === 'yMin' && rightFirstPointIntersection === 'yMax' && rightLastPointIntersection === 'yMax') {
                    plot.push([minX, rightFirstPoint[1]]);
                    plot.push([minX, leftFirstPoint[1]]);
                }
                plot.push(leftFirstPoint);
                plot = plot.concat(leftPoints);
                plot.push(leftLastPoint);
                if (totalPaths === 1 && leftFirstPointIntersection === 'yMin' && leftLastPointIntersection === 'yMin' && rightFirstPointIntersection === 'yMax' && rightLastPointIntersection === 'yMax') {
                    plot.push([maxX, leftLastPoint[1]]);
                    plot.push([maxX, rightLastPoint[1]]);
                }
                plot.push(rightLastPoint);
                plot = plot.concat(rightPoints.reverse());
                inEqualityPlots.push(plot);
                //}
            }
            else {
                if (functionVariable === 'y') {
                    plot = [];
                    plot.push([leftFirstPoint[0], minY]);
                    plot = plot.concat(leftPoints);
                    if (leftFirstPointIntersection === 'xMin' && leftLastPointIntersection === 'xMin') {
                        plot.push([leftLastPoint[0], maxY]);
                    }
                    else {
                        plot.push([leftLastPoint[0], minY]);
                    }
                    inEqualityPlots.push(plot);
                    plot = [];

                    if (rightFirstPointIntersection === 'xMax' && rightLastPointIntersection === 'xMax') {
                        plot.push([rightFirstPoint[0], minY]);
                    }
                    else {
                        plot.push([rightFirstPoint[0], maxY]);
                    }


                    plot = plot.concat(rightPoints);
                    plot.push([rightLastPoint[0], maxY]);

                    inEqualityPlots.push(plot);
                }
                else {
                    plot = [];
                    plot.push([maxX, leftFirstPoint[1]]);
                    plot = plot.concat(leftPoints);
                    if (leftFirstPointIntersection === 'yMax' && leftLastPointIntersection === 'yMax') {
                        plot.push([minX, leftLastPoint[1]]);
                    }
                    else {
                        plot.push([maxX, leftLastPoint[1]]);
                    }
                    inEqualityPlots.push(plot);
                    plot = [];

                    if (rightFirstPointIntersection === 'yMin' && rightLastPointIntersection === 'yMin') {
                        plot.push([maxX, rightFirstPoint[1]]);
                    }
                    else {
                        plot.push([minX, rightFirstPoint[1]]);
                    }


                    plot = plot.concat(rightPoints);
                    plot.push([minX, rightLastPoint[1]]);

                    inEqualityPlots.push(plot);
                }
            }
            return inEqualityPlots;
        },

        getDiscontinuousInequalityPlots: function getDiscontinuousInequalityPlots(points, minX, minY, maxX, maxY, functionVariable, inEqualityType) {
            var inEqualityPlots = [],
                pointsLength = points.length,
                firstPoint = points[0],
                lastPoint = points[pointsLength - 1];

            if (functionVariable === 'y') {
                if (inEqualityType === 'lesser' || inEqualityType === 'ltequal') {
                    inEqualityPlots.push([firstPoint[0], maxY]);
                    inEqualityPlots = inEqualityPlots.concat(points);
                    inEqualityPlots.push([lastPoint[0], maxY]);
                }
                else {
                    inEqualityPlots.push([firstPoint[0], minY]);
                    inEqualityPlots = inEqualityPlots.concat(points);
                    inEqualityPlots.push([lastPoint[0], minY]);
                }
            }
            else {
                if (inEqualityType === 'lesser' || inEqualityType === 'ltequal') {
                    inEqualityPlots.push([minX, firstPoint[1]]);
                    inEqualityPlots = inEqualityPlots.concat(points);
                    inEqualityPlots.push([minX, lastPoint[1]]);
                }
                else {
                    inEqualityPlots.push([maxX, firstPoint[1]]);
                    inEqualityPlots = inEqualityPlots.concat(points);
                    inEqualityPlots.push([maxX, lastPoint[1]]);
                }
            }
            return inEqualityPlots;

        },

        regressExtremaEdges: function regressExtremaEdges(leftPoint, middlePoint, rightPoint, engine, functionVariable) {
            var x1,
                y1,
                x2,
                y2,
                leftPointX = leftPoint[0],
                leftPointY = leftPoint[1],
                middlePointX = middlePoint[0],
                middlePointY = middlePoint[1],
                rightPointX = rightPoint[0],
                rightPointY = rightPoint[1];

            //if (!((isFinite(leftPointY) && isFinite(middlePointY) && isFinite(rightPointY)) && (leftPointY !== middlePointY && middlePointY !== rightPointY) && (middlePointY > leftPointY) === (middlePointY > rightPointY))) {
            //    return;
            //}

            while (true) {
                if (functionVariable === 'y') {
                    x1 = this.getCenterOfCoordinates(leftPointX, middlePointX);
                    y1 = engine(x1);
                    x2 = this.getCenterOfCoordinates(middlePointX, rightPointX);
                    y2 = engine(x2);
                    if (!isFinite(y1) || !isFinite(y2)) {
                        return null;
                    }

                    // As x values are so close that we cannot bisect it further.
                    if (x1 === leftPointX || x1 === middlePointX || x2 === middlePointX || x2 === rightPointX) {
                        if ((y1 > middlePointY) === (middlePointY > leftPointY)) {
                            return [x1, y1];
                        }
                        if ((y2 > middlePointY) === (middlePointY > leftPointY)) {
                            return [x2, y2];
                        }
                        return [middlePointX, middlePointY];
                    }

                    // A flat region has occurred where the slope is constant we take the edges of the flat and take its center.
                    if (y1 === middlePointY || y2 === middlePointY) {
                        return this.getCenterOfFlatRegion(leftPointX, leftPointY, middlePointX, middlePointY, rightPointX, rightPointY, engine, functionVariable);
                    }

                    // We take the edge point which contains zero
                    if ((y1 > leftPointY) === (middlePointY > leftPointY) && (y1 > leftPointY) === (y1 > middlePointY)) {
                        rightPointX = middlePointX;
                        rightPointY = middlePointY;
                        middlePointX = x1;
                        middlePointY = y1;
                    }
                    else if ((y2 > rightPointY) === (middlePointY > rightPointY) && (y2 > middlePointY) === (y2 > rightPointY)) {
                        leftPointX = middlePointX;
                        leftPointY = middlePointY;
                        middlePointX = x2;
                        middlePointY = y2;
                    }
                    else {
                        leftPointX = x1;
                        leftPointY = y1;
                        rightPointX = x2;
                        rightPointY = y2;
                    }
                }
                else {
                    y1 = this.getCenterOfCoordinates(leftPointY, middlePointY);
                    x1 = engine(y1);
                    y2 = this.getCenterOfCoordinates(middlePointY, rightPointY);
                    x2 = engine(y2);

                    if (!isFinite(x1) || !isFinite(x2)) {
                        return null;
                    }

                    // As y values are so close that we cannot bisect it further.
                    if (y1 === leftPointY || y1 === middlePointY || y2 === middlePointY || y2 === rightPointY) {
                        if ((x1 > middlePointX) === (middlePointX > leftPointX)) {
                            return [x1, y1];
                        }
                        if ((x2 > middlePointX) === (middlePointX > leftPointX)) {
                            return [x2, y2];
                        }
                        return [middlePointX, middlePointY];
                    }

                    // A flat region has occurred where the slope is constant we take the edges of the flat and take its center.
                    if (x1 === middlePointX || x2 === middlePointX) {
                        return this.getCenterOfFlatRegion(leftPointX, leftPointY, middlePointX, middlePointY, rightPointX, rightPointY, engine, functionVariable);
                    }

                    // We take the edge point which contains zero
                    if ((x1 > leftPointX) === (middlePointX > leftPointX) && (x1 > leftPointX) === (x1 > middlePointX)) {
                        rightPointX = middlePointX;
                        rightPointY = middlePointY;
                        middlePointX = x1;
                        middlePointY = y1;
                    }
                    else if ((x2 > rightPointX) === (middlePointX > rightPointX) && (x2 > middlePointX) === (x2 > rightPointX)) {
                        leftPointX = middlePointX;
                        leftPointY = middlePointY;
                        middlePointX = x2;
                        middlePointY = y2;
                    }
                    else {
                        leftPointX = x1;
                        leftPointY = y1;
                        rightPointX = x2;
                        rightPointY = y2;
                    }
                }

            }
        },

        _MAX_FLOAT: 1e-2,

        getCenterOfCoordinates: function getCenterOfCoordinates(coordinate1, coordinate2) {
            var coordinate,
                firstCoordinatePosition,
                secondCoordinatePosition,
                maxFirstCoordinate,
                maxSecondCoordinate,
                geometricMean;
            if (coordinate1 > coordinate2) {
                coordinate = coordinate1;
                coordinate1 = coordinate2;
                coordinate2 = coordinate;
            }
            firstCoordinatePosition = coordinate1 > 0;
            secondCoordinatePosition = coordinate2 > 0;
            maxFirstCoordinate = Math.abs(coordinate1) > this._MAX_FLOAT;
            maxSecondCoordinate = Math.abs(coordinate2) > this._MAX_FLOAT;
            if (maxFirstCoordinate || maxSecondCoordinate) {
                return this.getMean(coordinate1, coordinate2);
            }
            if (coordinate1 === 0) {
                return coordinate2 * Math.abs(coordinate2);
            }
            if (coordinate2 === 0) {
                return coordinate1 * Math.abs(coordinate1);
            }
            if (firstCoordinatePosition !== secondCoordinatePosition) {
                return 0;
            }
            geometricMean = (firstCoordinatePosition) ? Math.sqrt(coordinate1 * coordinate2) : -Math.sqrt(coordinate1 * coordinate2);
            // if geometric mean does not belong between the points return normal mean
            return ((geometricMean >= coordinate1) && (coordinate2 >= geometricMean)) ? geometricMean : this.getMean(coordinate1, coordinate2);
        },

        getMean: function getMean(coordinate1, coordinate2) {
            if ((coordinate1 > 0) === (coordinate2 > 0)) {
                return coordinate1 + 0.5 * (coordinate2 - coordinate1);
            }
            else {
                return 0.5 * (coordinate1 + coordinate2);
            }
        },

        // Returns the center of the flat curve having constant y value
        getCenterOfFlatRegion: function getCenterOfFlatRegion(leftPointX, leftPointY, middlePointX, middlePointY, rightPointX, rightPointY, engine, functionVariable) {

            var edge,
                extrema,
                leftSideFlat,
                rightSideFlat;
            if (functionVariable === 'y') {
                if (!isFinite(middlePointY)) {
                    return;
                }

                if (!isFinite(leftPointY)) {
                    edge = this.getBisectedFiniteValues(leftPointX, leftPointY, middlePointX, middlePointY, engine);
                    leftPointX = edge[0];
                    leftPointY = edge[1];
                }

                if (!isFinite(rightPointY)) {
                    edge = this.getBisectedFiniteValues(middlePointX, middlePointY, rightPointX, rightPointY, engine);
                    rightPointX = edge[0];
                    rightPointY = edge[1];
                }

                if (leftPointY === middlePointY) {
                    leftSideFlat = [leftPointX, leftPointY];
                }
                else {
                    leftSideFlat = this.divideCoordinateForConstantValue(leftPointX, leftPointY, middlePointX, middlePointY, engine, middlePointY);
                }

                if (rightPointY === middlePointY) {
                    rightSideFlat = [rightPointX, rightPointY];
                }
                else {
                    rightSideFlat = this.divideCoordinateForConstantValue(middlePointX, middlePointY, rightPointX, rightPointY, engine, middlePointY);
                }

                extrema = this.getCenterOfCoordinates(leftSideFlat[0], rightSideFlat[0]);
                return [extrema, engine(extrema)];
            }
            else {
                if (!isFinite(middlePointX)) {
                    return;
                }

                if (!isFinite(leftPointX)) {
                    edge = this.getBisectedFiniteValues(leftPointY, leftPointX, middlePointY, middlePointX, engine);
                    leftPointX = edge[1];
                    leftPointY = edge[0];
                }

                if (!isFinite(rightPointX)) {
                    edge = this.getBisectedFiniteValues(middlePointY, middlePointX, rightPointY, rightPointX, engine);
                    rightPointX = edge[1];
                    rightPointY = edge[0];
                }

                if (leftPointX === middlePointX) {
                    leftSideFlat = [leftPointX, leftPointY];
                }
                else {
                    leftSideFlat = this.divideCoordinateForConstantValue(leftPointY, leftPointX, middlePointY, middlePointX, engine, middlePointX);
                    var temp = leftSideFlat[0];
                    leftSideFlat[0] = leftSideFlat[1];
                    leftSideFlat[1] = temp;
                }

                if (rightPointX === middlePointX) {
                    rightSideFlat = [rightPointX, rightPointY];
                }
                else {
                    rightSideFlat = this.divideCoordinateForConstantValue(middlePointY, middlePointX, rightPointY, rightPointX, engine, middlePointX);
                    var temp = rightSideFlat[0];
                    rightSideFlat[0] = rightSideFlat[1];
                    rightSideFlat[1] = temp;
                }

                extrema = this.getCenterOfCoordinates(leftSideFlat[1], rightSideFlat[1]);
                return [engine(extrema), extrema];
            }
        },

        getBisectedFiniteValues: function getBisectedFiniteValues(firstPointX, firstPointY, lastPointX, lastPointY, engine) {

            if (isFinite(firstPointY) === isFinite(lastPointY)) {
                return;
            }
            var xCoordinate,
                yCoordinate;
            while (true) {
                xCoordinate = this.getCenterOfCoordinates(firstPointX, lastPointX);
                yCoordinate = engine(xCoordinate);

                // if all x values are same we cannot divide it further hence return
                if (xCoordinate === firstPointX || xCoordinate === lastPointX) {
                    return isFinite(firstPointY) ? [firstPointX, firstPointY] : [lastPointX, lastPointY];
                }

                // we divide all the side which contains the value 0
                if (isFinite(yCoordinate) !== isFinite(firstPointY)) {
                    lastPointX = xCoordinate;
                    lastPointY = yCoordinate;
                }
                else {
                    firstPointX = xCoordinate;
                    firstPointY = yCoordinate;
                }
            }
        },

        divideCoordinateForConstantValue: function divideCoordinateForConstantValue(firstPointX, firstPointY, lastPointX, lastPointY, engine, constant) {
            if ((firstPointY === constant) === (lastPointY === constant)) {
                return;
            }
            var xCoordinate,
                yCoordinate;
            while (true) {
                xCoordinate = this.getCenterOfCoordinates(firstPointX, lastPointX);
                yCoordinate = engine(xCoordinate);

                if (xCoordinate === firstPointX || xCoordinate === lastPointX) {
                    return (firstPointY === constant) ? [firstPointX, firstPointY] : [lastPointX, lastPointY];
                }

                if ((yCoordinate === constant) !== (firstPointY === constant)) {
                    lastPointX = xCoordinate;
                    lastPointY = yCoordinate;
                }
                else {
                    firstPointX = xCoordinate;
                    firstPointY = yCoordinate;
                }
            }

        },


        findCriticalPoints: function findCriticalPoints(leftArray, functionVariable, engine, equationData, drawInflection) {
            var criticalPoints,
                slope,
                nextSlope,
                row = 0,
                pointsCount = 0,
                rowNew = 0,
                length,
                x1,
                y1,
                x2,
                y2,
                x3,
                y3,
                rowInf = 0,
                threshold,
                minArray = [],
                maxArray = [],
                secondOrder,
                rowMin = 0,
                rowMax = 0,
                foundZero,
                newSlope,
                xdifference,
                prevSlope,
                thirdSlope,
                prevSecond,
                nextSecond,
                x4,
                y4,
                temp,
                inflectionArray = [];

            criticalPoints = new Array();
            threshold = 0.01;
            xdifference = 0.0001;
            drawInflection = true;
            //length = leftArray[0].length;
            MathUtilities.Components.EquationEngine.Models.Profile.getStartTime('criticalPoints');
            //to iterate through the rows of initial array
            for (row = 0; row < leftArray.length; row++) {

                //  console.log('row= ' + row);
                pointsCount = 0;
                length = leftArray[row].length;
                if (length > 1) {
                    prevSlope = 0;
                }
                else {
                    //console.log('only one point in array');
                    return criticalPoints;
                }

                //to iterate upto end of the row after a critical point found and break
                //while (pointsCount < length) {

                for (pointsCount = pointsCount; pointsCount < length - 2; pointsCount = pointsCount + 2) {
                    //console.log('count=' + pointsCount);
                    if (drawInflection === true) {
                        if (functionVariable === 'y') {
                            x1 = leftArray[row][pointsCount - 2];
                            y1 = leftArray[row][pointsCount - 1];
                            x2 = leftArray[row][pointsCount];
                            y2 = leftArray[row][pointsCount + 1];
                            x3 = leftArray[row][pointsCount + 2];
                            y3 = leftArray[row][pointsCount + 3];
                            x4 = leftArray[row][pointsCount + 4];
                            y4 = leftArray[row][pointsCount + 5];
                        }
                        else {
                            y1 = leftArray[row][pointsCount - 2];
                            x1 = leftArray[row][pointsCount - 1];
                            y2 = leftArray[row][pointsCount];
                            x2 = leftArray[row][pointsCount + 1];
                            y3 = leftArray[row][pointsCount + 2];
                            x3 = leftArray[row][pointsCount + 3];
                            y4 = leftArray[row][pointsCount + 4];
                            x4 = leftArray[row][pointsCount + 5];
                        }
                        slope = (y2 - y1) / (x2 - x1);
                        nextSlope = (y3 - y2) / (x3 - x2);
                        thirdSlope = (y4 - y3) / (x4 - x3);
                        secondOrder = nextSlope - slope;

                        foundZero = false;

                        //                        console.log('slope :' + slope);
                        //                        console.log('next slope :' + nextSlope);
                        //                        console.log('third slope :' + thirdSlope);
                        if ((slope < nextSlope && nextSlope > thirdSlope) || (slope > nextSlope && nextSlope < thirdSlope)) {

                            //if (secondOrder < 0.1 && secondOrder > -0.1) {
                            while (foundZero === false) {

                                if (functionVariable === 'y') {
                                    x2 = (x1 + x3) / 2;
                                    y2 = engine(x2);
                                }
                                else {
                                    y2 = (y1 + y3) / 2;
                                    x2 = engine(y2);
                                }
                                slope = (y2 - y1) / (x2 - x1);
                                nextSlope = (y3 - y2) / (x3 - x2);
                                thirdSlope = (y4 - y3) / (x4 - x3);

                                prevSecond = slope - prevSlope;
                                secondOrder = nextSlope - slope;
                                nextSecond = thirdSlope - nextSlope;

                                if (Math.abs(x3 - x2) < xdifference || Math.abs(x2 - x1) < xdifference || Math.abs(x4 - x3) < xdifference) {
                                    break;
                                }

                                if ((prevSecond < 0 && nextSecond > 0) || (prevSecond > 0 && nextSecond < 0)) {

                                    //console.log('point :' + x2 + '   ' + y2);
                                    inflectionArray[rowInf] = [x2, y2];
                                    rowInf++;
                                    foundZero = true;
                                }
                                else if (secondOrder > 0) {

                                    if (nextSlope > 0) {
                                        nextSlope = thirdSlope;
                                        x3 = x2;
                                        y3 = y2;
                                    }
                                    else {
                                        x1 = x2;
                                        y1 = y2;
                                    }
                                }
                                else if (secondOrder < 0) {

                                    if (slope < 0) {
                                        slope = nextSlope;
                                        x1 = x2;
                                        y1 = y2;
                                    }
                                    else {
                                        x3 = x2;
                                        y3 = y2;
                                    }
                                }
                            }
                            // }
                        }
                    }
                    if (functionVariable === 'y') {
                        x1 = leftArray[row][pointsCount - 2];
                        y1 = leftArray[row][pointsCount - 1];
                        x2 = leftArray[row][pointsCount];
                        y2 = leftArray[row][pointsCount + 1];
                        x3 = leftArray[row][pointsCount + 2];
                        y3 = leftArray[row][pointsCount + 3];
                        x4 = leftArray[row][pointsCount + 4];
                        y4 = leftArray[row][pointsCount + 5];
                        if (x1 > x2) {
                            temp = x1;
                            x1 = x2;
                            x2 = temp;
                            //    temp = y1;
                            //    y1 = y2;
                            //    y2 = temp;
                        }
                        if (x2 > x3) {
                            temp = x2;
                            x2 = x3;
                            x3 = temp;
                            //    temp = y2;
                            //    y2 = y3;
                            //    y3 = temp;
                        }
                    }
                    else {
                        y1 = leftArray[row][pointsCount - 2];
                        x1 = leftArray[row][pointsCount - 1];
                        y2 = leftArray[row][pointsCount];
                        x2 = leftArray[row][pointsCount + 1];
                        y3 = leftArray[row][pointsCount + 2];
                        x3 = leftArray[row][pointsCount + 3];
                        y4 = leftArray[row][pointsCount + 4];
                        x4 = leftArray[row][pointsCount + 5];
                        // for asymtodes
                        if (y1 > y2) {
                            //temp = x1;
                            //x1 = x2;
                            //x2 = temp;
                            temp = y1;
                            y1 = y2;
                            y2 = temp;
                        }
                        if (y2 > y3) {
                            //temp = x2;
                            //x2 = x3;
                            //x3 = temp;
                            temp = y2;
                            y2 = y3;
                            y3 = temp;
                        }
                    }

                    //if (x1 !== undefined && x1.toString().split('.')[1] && x1.toString().split('.')[1].length > 14) {
                    //    x1 = x1.toFixed(14);
                    //}
                    //if (x2 !== undefined && x2.toString().split('.')[1] && x2.toString().split('.')[1].length > 14) {
                    //    x2 = x2.toFixed(14);
                    //}
                    //if (x3 !== undefined && x3.toString().split('.')[1] && x3.toString().split('.')[1].length > 14) {
                    //    x3 = x3.toFixed(14);
                    //}

                    slope = (y2 - y1) / (x2 - x1);
                    nextSlope = (y3 - y2) / (x3 - x2);
                    thirdSlope = (y4 - y3) / (x4 - x3);
                    secondOrder = nextSlope - slope;
                    foundZero = false;

                    if ((slope > 0 && nextSlope < 0) || (nextSlope > 0 && slope < 0)) {

                        minArray.push(this.regressExtremaEdges([x1, y1], [x2, y2], [x3, y3], engine, functionVariable));

                        //console.log('x1 :' + x1 + ' y1 :' + y1);
                        //console.log('x2 :' + x2 + ' y2 :' + y2);
                        //console.log('x3 :' + x3 + ' y3 :' + y3);
                        //console.log(leftArray);
                        //var count = 0;

                        ////                            temp = new Array;
                        ////                            temp[0] = [x1, y1];
                        ////                            temp[1] = [x3, y3];
                        ////                            if (equationData.temp === undefined) {
                        ////                                equationData.temp = new MathUtilities.Components.EquationEngine.Models.EquationData();
                        ////                                equationData.temp.setColor('red', true);

                        ////                                equationData.temp.setThickness(equationData.criticalPoints.getThickness());
                        ////                            }

                        ////                            equationData.temp.setPoints(temp);
                        ////                            this.graphView.drawPoint(equationData.temp);

                        //while (foundZero === false) {
                        //    if (functionVariable === 'y') {

                        //        x2 = (x1 + x3) / 2;
                        //        y2 = engine(x2);
                        //    }
                        //    else {
                        //        y2 = (y1 + y3) / 2;
                        //        x2 = engine(y2);
                        //    }
                        //    newSlope = (y3 - y2) / (x3 - x2);
                        //    slope = (y2 - y1) / (x2 - x1);
                        //    nextSlope = (y4 - y3) / (x4 - x3);
                        //    if (isNaN(newSlope) || isNaN(slope) || isNaN(nextSlope)) {

                        //        if (Math.abs(x3 - x2) < xdifference && Math.abs(y3 - y2) < xdifference) {

                        //            secondOrder = nextSlope - newSlope;
                        //            pointsCount += 2;
                        //            //console.log('isNAN ::::::local minima point :' + x2 + ' ' + y2);
                        //            minArray[rowMin] = [x2, y2];
                        //            rowMin++;
                        //            //if (secondOrder > 0) {
                        //            //    console.log('local minima point :' + x2 + ' ' + y2);
                        //            //    minArray[rowMin] = [x2, y2];
                        //            //    rowMin++;
                        //            //}
                        //            //else if (secondOrder < 0) {
                        //            //    console.log('local maxima point :' + x2 + ' ' + y2);
                        //            //    maxArray[rowMax] = [x2, y2];
                        //            //    rowMax++;
                        //            //}
                        //            //else {
                        //            //    if (drawInflection === true) {
                        //            //        //console.log('inflection point :' + x2 + ' ' + y2);
                        //            //        inflectionArray[rowInf] = [x2, y2];
                        //            //        rowInf++;
                        //            //    }
                        //            //}
                        //            break;
                        //        }
                        //    }

                        //    //if (newSlope > -threshold && newSlope < threshold) {
                        //    if (newSlope === threshold) {

                        //        //console.log('new slope :' + newSlope);
                        //        //console.log('count=' + pointsCount);
                        //        //console.log('inside');
                        //        secondOrder = newSlope - slope;
                        //        foundZero = true;
                        //        pointsCount += 2;

                        //        if (secondOrder > 0) {
                        //            //console.log('local minima point :' + x2 + ' ' + y2);
                        //            minArray[rowMin] = [x2, y2];
                        //            rowMin++;
                        //        }
                        //        else if (secondOrder <= 0) {
                        //            //console.log('local maxima point :' + x2 + ' ' + y2);
                        //            maxArray[rowMax] = [x2, y2];
                        //            rowMax++;
                        //        }


                        //    }
                        //    else if (newSlope > 0) {

                        //        if (nextSlope > 0) {
                        //            nextSlope = newSlope;
                        //            x3 = x2;
                        //            y3 = y2;
                        //        }
                        //        else {
                        //            x1 = x2;
                        //            y1 = y2;
                        //        }
                        //    }
                        //    else if (newSlope < 0) {

                        //        if (slope < 0) {
                        //            slope = newSlope;
                        //            x1 = x2;
                        //            y1 = y2;
                        //        }
                        //        else {
                        //            x3 = x2;
                        //            y3 = y2;
                        //        }
                        //    }
                        //    count++;
                        //}
                        //prevSlope = slope;
                    }
                }
                //pointsCount = pointsCount + 2;

                //}
            }

            if (drawInflection === true) {
                //console.log('inflection array :');
                //console.log(inflectionArray);
                criticalPoints = criticalPoints.concat(minArray, maxArray, inflectionArray);
            }
            else {
                criticalPoints = criticalPoints.concat(minArray, maxArray);
            }

            //console.log('min array :: ' + minArray);
            //console.log(minArray);
            //console.log('max array:');
            //console.log(maxArray);
            //console.log('critical array :');
            //console.log(criticalPoints);
            //console.log('processing time =' + MathUtilities.Components.EquationEngine.Models.Profile.getProcessingTime('criticalPoints'));
            return criticalPoints;
        },

        refinePoint: function refinePoint(point, engine, shouldBeMax, plottingStep) {
            var step = plottingStep / 20,
                pt1, pt2;

            if (shouldBeMax) {
                while (true) {
                    pt1 = engine(point[0] + step);
                    if (pt1 > point[1]) {
                        point = [point[0] + step, pt1];
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    pt1 = engine(point[0] - step);
                    if (pt1 > point[1]) {
                        point = [point[0] + step, pt1];
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                while (true) {
                    pt1 = engine(point[0] + step);
                    if (pt1 < point[1]) {
                        point = [point[0] + step, pt1];
                    }
                    else {
                        break;
                    }
                }
                while (true) {
                    pt1 = engine(point[0] - step);
                    if (pt1 < point[1]) {
                        point = [point[0] + step, pt1];
                    }
                    else {
                        break;
                    }
                }
            }
            return point;
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
            equationData.setPoints([]);
            equationData.getPoints().push(this.graphView._getGraphPointCoordinates([x, y]));
            this.addEquation(equationData);
            this.graphView._gridGraphModelObject.get('_images').push(equationData);
            ////console.log('.............image :: x:' + x + ', y:' + y + '.................. >> ' + this.graphView._getGraphPointCoordinates([x, y]));
            return raster;

        }
    }, {});




    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions = Backbone.Model.extend({}, {
        _graphView: null,

        generateSimplePlot: function generateSimplePlot(engine, plotData) {
            var plot = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.getPlotObject(plotData);
            MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.addPoint(plot, plotData.minX, engine(plotData.minX));
            MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.addPoint(plot, plotData.maxX, engine(plotData.maxX));
            MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.finishSegment(plot);
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
            MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.removeUnsettledPoints(plot);
            var lines, line, i;
            if (plot.temporaryLines) {
                lines = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.fitPointsInsideDomain(plot, plot.temporaryLines);

                for (i = 0; i < lines.length; i++) {
                    if (lines[i].length < 2) {
                        continue;
                    }
                    line = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.translateSegment(plot, lines[i], this._graphView);
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

                if (graphView) {
                    point = graphView._getCanvasPointCoordinates(point);
                }
                else {
                    point = plot.gridGraph._getCanvasPointCoordinates(point);
                }


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
                gridGraph: domain.gridGraph,
                tolerance: domain.tolerance,
                domain: domain,
                basePoint: null,
                unsettledPoint: null,
                paramVariable: domain.paramVariable
            };
        },

        refine: function (pt1, pt2, engine, plot) {
            var breakingPoint, xmean;
            xmean = geomFunctions.mean(pt1[0], pt2[0]);
            breakingPoint = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.detectJump(engine, plot.domain.tolerance, pt1[0], pt1[1], xmean, engine(xmean), pt2[0], pt2[1]);
            if (breakingPoint) {
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.addPoint(plot, breakingPoint[0][0], breakingPoint[0][1]);
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.finishSegment(plot);
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.addPoint(plot, breakingPoint[1][0], breakingPoint[1][1]);
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
            var plot = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.getPlotObject(plotData),

                refinedPoint,
                x = plotData.minX,
                y = engine(x),
                currentPoint = [x, y];


            if (isFinite(y)) {
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.addPoint(plot, x, y);
            }
            x += plotData.step;


            while (x <= plotData.maxX) {
                y = engine(x);
                if (isFinite(y) && isFinite(currentPoint[1])) {
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.refine(currentPoint, [x, y], engine, plot);
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.addPoint(plot, x, y);
                }
                else if (isFinite(y) && !isFinite(currentPoint[1])) {
                    refinedPoint = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.limitedRefine(currentPoint[0], currentPoint[1], x, y, engine);
                    if (refinedPoint[0] !== x) {
                        MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.addPoint(plot, refinedPoint[0], refinedPoint[1]);
                    }
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.refine(refinedPoint, [x, y], engine, plot);
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.addPoint(plot, x, y);
                }
                else if (!isFinite(y) && isFinite(currentPoint[1])) {
                    refinedPoint = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.limitedRefine(currentPoint[0], currentPoint[1], x, y, engine);
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.refine(currentPoint, refinedPoint, engine, plot);
                    if (refinedPoint[0] !== currentPoint[0]) {
                        MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.addPoint(plot, refinedPoint[0], refinedPoint[1]);
                    }
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.finishSegment(plot);
                }
                currentPoint = [x, y];
                x += plotData.step;
            }
            MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.finishSegment(plot);
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
                    jumpFrom = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.limitedRefine(x1, y1, pole1, flag1, engine);
                    jumpTo = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.limitedRefine(pole1, flag1, x2, y2, engine);
                    return [jumpFrom, jumpTo];
                }
                if (!isFinite(flag2)) {
                    jumpFrom = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.limitedRefine(x1, y1, pole2, flag2, engine);
                    jumpTo = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.limitedRefine(pole2, flag2, x2, y2, engine);
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
                    return MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.selectJumpPoint(x1, y1, xmean, ymean, pole2, flag2, x2, y2);
                }
                if (pole2 === xmean || pole2 === x2) {
                    return MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.selectJumpPoint(x1, y1, pole1, flag1, xmean, ymean, x2, y2);
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
} (window.MathInteractives));