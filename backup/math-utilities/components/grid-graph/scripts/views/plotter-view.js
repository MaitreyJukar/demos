/* globals _, $, window, geomFunctions  */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Components.Graph.Views.plotterView = Backbone.View.extend({
        "model": null,
        "graphView": null,
        "_plottingFuntions": null,
        "_worker": null,
        "equationDataCounter": 0,
        "_intersectionWorker": null,
        "generateIntersections": null,
        "_updateAllPlots": null,
        "doesManageDepth": null,
        "_depthUpdationTimer": null,
        "_onPlotCompleteFuncRef": null,
        "updateDepthFuncRef": null,
        "initialize": function(options) {
            this.options = options || {};
            this.model = new MathUtilities.Components.Graph.Models.plotterModel();
            this.graphView = this.options.graphView;
            this.generateIntersections = this.options.generateIntersections;
            this.doesManageDepth = this.options.doesManageDepth;
            this._onPlotCompleteFuncRef = _.bind(this._onPlotComplete, this);
            this.updateDepthFuncRef = _.bind(this.updateDepth, this);
            this._updateAllPlots = _.bind(function onzoom() {
                var equations = this.model._equations,
                    i, equationSpecie, equationsLength = equations.length;
                this.equationDataCounter = 0;
                for (i = 0; i < equationsLength; i++) {
                    equationSpecie = equations[i].getSpecie();
                    this.updateCriticalPointsVisiblity(equations[i], false);
                    if (equationSpecie && ['error', 'expression', 'number'].indexOf(equationSpecie) === -1) {
                        switch (equationSpecie) {
                            case 'polygon':
                            case 'annotation':
                                this.graphView.drawPolygon(equations[i]);
                                break;
                            case 'image':
                                this.graphView.repositionImage(equations[i]);
                                break;
                            case 'quadraticPlot':
                                this._plot(equations[i]);
                                break;
                            case 'point':
                                break;
                            default:
                                this.hasMultipleCall = true;
                                this.equationDataCounter++;
                                this._plot(equations[i]);
                                break;
                        }
                    }
                }
            }, this);


            this._createAnnotationMouseDown = _.bind(function createAnnotationMouseDown(event) {
                //2 and 3 denotes middle and right mouse button
                if ([2, 3].indexOf(event.event.which) > -1) {
                    return void 0;
                }
                this.graphView.on('grid-graph-mousedrag', this._createAnnotationMove);
                this.graphView.setGridMode('annotation-mode'); //when changing grid type during incomplete annotation operation
                var model = this.model,
                    annotationPath = new this.graphView._paperScope.Path();
                annotationPath.strokeWidth = model._annotationPaths.strokeWidth;
                this.graphView._paperScope.tool.minDistance = 1;
                annotationPath.strokeColor = this.model._annotationPaths.strokeColor;
                annotationPath.strokeWidth = this.model._annotationPaths.strokeWidth;
                model.incompleteAnnotations.push(this.graphView._getGraphPointCoordinates(geomFunctions.getCanvasCoordinates(event)));
                model._firstPoint = event.point;
                model._annotationPaths.addChild(annotationPath);
                annotationPath.minimumDistance = 1;
                annotationPath.maximumDistance = 2;
                annotationPath.strokeCap = 'round';
                annotationPath.strokeJoin = 'round';
            }, this);

            this._createAnnotationMove = _.bind(function createAnnotationMove(event) {
                //2 and 3 denotes middle and right mouse button
                if ([2, 3].indexOf(event.event.which) > -1) {
                    return void 0;
                }
                var annotationPathChildren = this.model._annotationPaths._children,
                    model = this.model;
                if (!annotationPathChildren) {
                    return void 0;
                }
                if (model._firstPoint) {
                    annotationPathChildren[annotationPathChildren.length - 1].add(model._firstPoint);
                    model._firstPoint = null;
                }
                annotationPathChildren[annotationPathChildren.length - 1].add(event.point);
                model.incompleteAnnotations.push(this.graphView._getGraphPointCoordinates(geomFunctions.getCanvasCoordinates(event)));
            }, this);

            this._createAnnotationMouseUp = _.bind(function createAnnotationMouseUp(event) {
                //2 and 3 denotes middle and right mouse button
                if ([2, 3].indexOf(event.event.which) > -1) {
                    return void 0;
                }
                this.graphView.off('grid-graph-mousedrag', this._createAnnotationMove);
                event = void 0;
                var model = this.model,
                    annotationPathChildren = this.model._annotationPaths._children,
                    firstPointX, firstPointY, noOfPaths;
                noOfPaths = annotationPathChildren.length - 1;

                if (model._firstPoint) {
                    firstPointX = model._firstPoint.x;
                    firstPointY = model._firstPoint.y;
                    annotationPathChildren[noOfPaths].add([firstPointX, firstPointY]);
                    annotationPathChildren[noOfPaths].add([firstPointX + 1, firstPointY + 1]);
                    this.model.incompleteAnnotations.push(this.graphView._getGraphPointCoordinates([firstPointX + 2, firstPointY + 4]));
                    model._firstPoint = null;
                }
                this.model.incompleteAnnotations.push(void 0);
                this.graphView.refreshView();

            }, this);

            this.createAnnotationEnd = _.bind(function createAnnotationEnd() {
                var returnAnnotations;
                returnAnnotations = this.model.incompleteAnnotations;

                this.model.incompleteAnnotations.pop();

                this.model.incompleteAnnotations = [];
                this.graphView.off('grid-layer-annotate-start')
                    .off('draw-annotation')
                    .off('grid-layer-annotate-end')
                    .off('shape-layer-annotate-end', this.createAnnotationEnd);

                //removing call to reset grid from here for BZ17237: Shape/Circle is not drawn using click and drag if marker drawings are present
                return returnAnnotations;
            }, this);

            this.graphView.on('graph:zoom-pan', this._updateAllPlots);

            MathUtilities.Components.EquationEngine.Models.Productions.init();
        },

        "_onPlotComplete": function() {
            var TIMER = 40;
            if (this._depthUpdationTimer) {
                clearTimeout(this._depthUpdationTimer);
            }

            // For optimizing multiple calls to manage depth
            this._depthUpdationTimer = setTimeout(this.updateDepthFuncRef, TIMER);
        },

        "updateDepth": function() {
            var key, layers = this.graphView._projectLayers,
                pathArray,
                looper,
                sortFunc = function(a, b) {
                    return a.children && a.children[0] && a.children[0].equation &&
                        b.children && b.children[0] && b.children[0].equation &&
                        a.children[0].equation.depthLevel > b.children[0].equation.depthLevel ? 1 : -1;
                },
                sortFuncForImageAndText = function(a, b) {
                    return a.equation && b.equation &&
                        a.equation.depthLevel > b.equation.depthLevel ? 1 : -1;
                };
            for (key in layers) {
                if (['image', 'text'].indexOf(layers[key].name) > -1) {
                    layers[key].children.sort(sortFuncForImageAndText);
                } else {
                    layers[key].children.sort(sortFunc);
                }
                // Using Paper JS function to update index of pathGroups according to sorted position.
                // Inserting pathGroups in the layer according to the sorted index.
                pathArray = layers[key].removeChildren();
                layers[key].addChildren(pathArray);
            }
            this.graphView.refreshView();
        },

        "updateCriticalPointsVisiblity": function(equationData, isVisible) {
            var allCriticalPointsEquations = [equationData.getCriticalPoints(),
                    equationData.getInterceptPoints(),
                    equationData.getDiscontinuousPoints(),
                    equationData.getHollowPoints()
                ],
                counter, currentEquation,
                intersectionsObj = equationData.getIntersectionPoints(),
                length = allCriticalPointsEquations.length;
            for (counter = 0; counter < length; counter++) {
                currentEquation = allCriticalPointsEquations[counter];
                this.setIsVisible(currentEquation, isVisible);
            }
            if (intersectionsObj !== null) {
                for (counter in intersectionsObj) {
                    currentEquation = intersectionsObj[counter];
                    this.setIsVisible(currentEquation, isVisible);
                }
            }
        },

        "setIsVisible": function(currentEquation, isVisible) {
            if (currentEquation !== null && currentEquation.getPointsGroup() !== null) {
                currentEquation.getPointsGroup().visible = isVisible;
            }
        },

        "bindEventsOnEquationData": function(equationData) {
            equationData.off('change-visibility').on('change-visibility', _.bind(function() {
                this.changePlotVisibility(equationData);
            }, this));
            if (equationData.getSpecie() === 'image') {
                this.graphView.refreshView();
                return void 0;
            }
            equationData.off('change-inEqualityOpacity').on('change-inEqualityOpacity', _.bind(function() {
                this.changeInEqualityOpacity(equationData);
            }, this));
            equationData.off('change-equation').on('change-equation', _.bind(function() {
                this.addPlot(equationData);
            }, this));
            equationData.off('plot-equation').on('plot-equation', _.bind(function() {
                this._plot(equationData);
            }, this));
            equationData.off('change-color').on('change-color', _.bind(function() {
                this.changePlotColor(equationData);
            }, this));
            equationData.off('change-points-color').on('change-points-color', _.bind(function() {
                this.changePointsColor(equationData);
            }, this));
            equationData.off('redraw-graph').on('redraw-graph', _.bind(function() {
                this.graphView.refreshView(equationData);
            }, this));
            equationData.off('change-constants').on('change-constants', _.bind(function() {
                var allEquationConstantsLength = equationData.getAllConstants().length;
                if (allEquationConstantsLength === 0 || equationData.getSpecie() === 'point') {
                    return void 0;
                }
                if (['error', 'expression'].indexOf(equationData.getSpecie()) > -1 || allEquationConstantsLength > 0) {
                    this.addPlot(equationData);
                } else {
                    this._plot(equationData);
                }
            }, this));

            equationData.off('change-thickness').on('change-thickness', _.bind(function() {
                if (equationData.getPointsGroup() !== null) {
                    this._changePointsGroupThickness(equationData, equationData.getThickness());
                } else {
                    if (equationData.getPathGroup() !== null) {
                        equationData.getPathGroup().strokeWidth = equationData.getThickness();
                    }
                    this._updatePointsThickness(equationData);
                }
            }, this));
        },

        "_changePointsGroupThickness": function(equationData, radius) {
            var pointsGroup = equationData.getPointsGroup(),
                oldRadius,
                noOfChildrens,
                childCounter,
                path,
                TOLERANCE = 1.5,
                children;
            radius *= TOLERANCE;
            if (pointsGroup !== null) {
                children = pointsGroup.children;
                noOfChildrens = children.length;
                for (childCounter = 0; childCounter < noOfChildrens; childCounter++) {
                    path = children[childCounter];
                    if (!path.hit) {
                        oldRadius = path.bounds.width / 2;
                        path.scale(radius / oldRadius);
                    }
                }
            }
        },

        "_updatePointsThickness": function(equationData) {
            var pointThickness = equationData.getThickness(),
                allCriticalPointsEquations = [equationData.getCriticalPoints(),
                    equationData.getInterceptPoints(),
                    equationData.getDiscontinuousPoints(),
                    equationData.getHollowPoints()
                ],
                counter, currentEquation,
                intersectionsObj = equationData.getIntersectionPoints(),
                length = allCriticalPointsEquations.length;
            for (counter = 0; counter < length; counter++) {
                currentEquation = allCriticalPointsEquations[counter];
                this.setThickness(currentEquation, pointThickness);
            }
            if (intersectionsObj !== null) {
                for (counter in intersectionsObj) {
                    currentEquation = intersectionsObj[counter];
                    this.setThickness(currentEquation, pointThickness);
                }
            }
        },

        "setThickness": function(currentEquation, pointThickness) {
            if (currentEquation !== null && currentEquation.getPointsGroup() !== null) {
                currentEquation.setThickness(pointThickness);
                this._changePointsGroupThickness(currentEquation, pointThickness);
            }
        },

        "addEquation": function(equationData, isParsed) {
            var equations = this.model._equations,
                equationMap = this.model._equationsMap;

            if (equations.indexOf(equationData) !== -1) {
                return 'alreadyAdded';
            }
            equations.push(equationData);
            equationMap[equationData.getId()] = equationData;
            this.bindEventsOnEquationData(equationData);

            if (this.doesManageDepth) {
                equationData.on('plotComplete', this._onPlotCompleteFuncRef);
            }

            if (equationData.getSpecie() === 'image') {
                //No need of `this.graphView._paperScope.view.draw()` as its done in `bindEventsOnEquationData` function if equation.getSpecie is image
                this.graphView.addImage(equationData);
                return void 0;
            }
            if (['polygon', 'annotation'].indexOf(equationData.getSpecie()) > -1) {
                if (equationData.getSpecie() === 'annotation' && this.model._annotationPaths !== null) {
                    this.model._annotationPaths.remove();
                    this.graphView._paperScope.view.draw();
                }
                this.graphView.drawPolygon(equationData);
                return void 0;
            }
            if (isParsed) {
                this._plot(equationData);
            } else {
                this.addPlot(equationData);
            }
        },

        "removeEquation": function(equationData) {
            var equations = this.model._equations,
                equationMap = this.model._equationsMap,
                gridPlots = this.graphView._gridGraphModelObject.get('_plots'),
                idx = equations.indexOf(equationData);

            if (this.doesManageDepth) {
                equationData.off('plotComplete', this._onPlotCompleteFuncRef);
            }
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
                equations.splice(idx, 1);
            }
            if (equationData) {
                delete equationMap[equationData.getId()];
            }
            if (gridPlots.indexOf(equationData) > -1) {
                gridPlots.splice(gridPlots.indexOf(equationData), 1);
            }
            this.graphView.updateVisibleDomain();
            return void 0;
        },

        "createAnnotationStart": function(color, thickness) {
            this.graphView._projectLayers.annotationLayer.activate();
            this.graphView.setGridMode('annotation-mode');
            this.graphView.on('grid-layer-annotate-start', this._createAnnotationMouseDown)
                .on('grid-layer-annotate-end', this._createAnnotationMouseUp);
            this.model._annotationPaths = new this.graphView._paperScope.Group();
            this.model._annotationPaths.strokeColor = color;
            this.model._annotationPaths.strokeWidth = thickness;
        },




        "changePlotVisibility": function(equationData) {
            var specie, visible, pointGroup, pathGroup;
            if (equationData.getSpecie() === 'point') {
                pointGroup = equationData.getPointsGroup();
                if (equationData.getVisible().point) {
                    this.graphView.drawPoint(equationData);
                } else {
                    if (pointGroup) {
                        /*
                        For removing pathGroup we are not using paper.js remove function,
                        because if we are sorting pathGroups in current layer &
                        then removing a particular pathGroup using remove function
                        then it removes inappropriate pathGroup from current layer...
                        */
                        this.graphView.removeDrawingObject(pointGroup);
                        equationData.setPointsGroup(void 0);
                        this.graphView._removePathRollOverListeners(pointGroup);
                    }
                }
            } else {
                visible = equationData.getVisible().curve;
                if (visible) {
                    specie = equationData.getSpecie();
                    if (['plot', 'curve'].indexOf(specie) > -1) {
                        this._plot(equationData);
                    } else if (['annotation', 'polygon'].indexOf(specie) > -1) {
                        this.graphView.drawPolygon(equationData);
                    }
                } else {
                    pathGroup = equationData.getPathGroup();
                    /*
                    For removing pathGroup we are not using paper.js remove function,
                    because if we are sorting pathGroups in current layer &
                    then removing a particular pathGroup using remove function
                    then it removes inappropriate pathGroup from current layer...
                    */
                    this.graphView.removeDrawingObject(pathGroup);
                }
                if (equationData.getRaster()) {
                    equationData.getRaster().visible = equationData.getVisible().curve;
                }
            }
            this.graphView.refreshView();
        },

        "changeOpacity": function(equationData, opacity) {

            var pathCounter,
                noOfChildren,
                group;
            if (equationData.getSpecie() === 'plot') {
                group = equationData.getPathGroup();
            } else {
                group = equationData.getPointsGroup();
            }
            if (group !== null) {
                noOfChildren = group.children.length;
                for (pathCounter = 0; pathCounter < noOfChildren; pathCounter++) {
                    group.children[pathCounter].opacity = opacity;
                }
            }
        },

        "changeInEqualityOpacity": function(equationData) {
            if (equationData.getInEqualititesPathGroup()) {
                return void 0;
            }
            var pathGroup = equationData.getPathGroup();
            if (pathGroup && typeof pathGroup.fillColor !== 'undefined') {
                pathGroup.fillColor.alpha = equationData.getInEqualityOpacity();
            }
        },
        "changePlotColor": function(equationData) {
            var i, pathGroup = equationData.getPathGroup(),
                doRefresh,
                currentChild,
                pathGroupChildrenLength;
            if (equationData.getSpecie() === 'point') {
                this.changePointsColor(equationData);
                doRefresh = true;
            } else {
                if (pathGroup) {
                    pathGroupChildrenLength = pathGroup.children.length;
                    for (i = 0; i < pathGroupChildrenLength; i++) {
                        currentChild = pathGroup.children[i];
                        if (currentChild.hit) {
                            continue;
                        }
                        if (equationData.getIsFilled()) {
                            currentChild.fillColor = equationData.getColor();
                            currentChild.fillColor.alpha = equationData.getInEqualityOpacity();

                        } else {
                            currentChild.strokeColor = equationData.getColor();
                        }
                    }
                    doRefresh = true;
                }
                if (equationData.getInEqualititesPathGroup()) {
                    this.graphView.drawInequalitites(equationData);
                    this.changeInEqualityOpacity(equationData);
                    doRefresh = true;
                }
            }
            if (doRefresh) {
                this.graphView.refreshView();
            }
        },
        "changePointsColor": function(equationData) {
            var equationPointsGroup = equationData.getPointsGroup(),
                i,
                currentPoint,
                pointsGroupLength;
            if (!equationPointsGroup) {
                return void 0;
            }
            pointsGroupLength = equationPointsGroup.children.length;
            if (equationData.getDashArray().length === 0) {
                for (i = 0; i < pointsGroupLength; i++) {
                    currentPoint = equationPointsGroup.children[i];
                    if (currentPoint.hit) {
                        continue;
                    }
                    currentPoint.fillColor = equationData.getColor();
                }
            } else {
                for (i = 0; i < pointsGroupLength; i++) {
                    currentPoint = equationPointsGroup.children[i];
                    if (currentPoint.hit) {
                        continue;
                    }
                    currentPoint.strokeColor = equationData.getColor();
                }
            }
            this.graphView.refreshView();
        },

        "addPlot": function(equationData) {
            var pointCounter,
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                pointsLength,
                point,
                equationOrder,
                paramVariable,
                functionCooefecient,
                errorOccurred = false,
                functionA,
                functionB,
                solution;
            if (!equationData.getBlind()) {
                EquationEngine.Parser.parseEquationToGetTokens(equationData);
                if (!equationData.isCanBeSolved()) {
                    return void 0;
                }
                if (equationData.getSpecie() !== 'number' && equationData.getSpecie() !== 'point') {
                    EquationEngine.Parser.processTokensWithRules(equationData);
                    if (!equationData.isCanBeSolved()) {
                        return void 0;
                    }
                    EquationEngine.Parser.generateTreeFromRules(equationData);
                }
            }
            if (equationData.getSpecie() === 'point') {
                if (!equationData.getBlind()) {
                    solution = equationData.getSolution();
                    pointsLength = solution.length;
                    equationData.setPoints([]);
                    for (pointCounter = 0; pointCounter < pointsLength; pointCounter++) {
                        point = [];
                        point.push(Number(solution[pointCounter][0]), Number(solution[pointCounter][1]));
                        equationData.getPoints().push(point);
                    }
                }

                this.graphView.drawPoint(equationData);
            } else if (!equationData.getBlind() && equationData.isCanBeSolved() &&
                equationData.getSpecie() !== 'expression' && equationData.getSpecie() !== 'number') {
                EquationEngine.TreeProcedures.convertToSolvableForm(equationData);
                functionA = equationData.getA();
                functionB = equationData.getB();
                EquationEngine.TreeProcedures.checkForInfinity(equationData, functionA);
                EquationEngine.TreeProcedures.checkForInfinity(equationData, functionB);
                if (!equationData.isCanBeSolved()) {
                    return void 0;
                }
                if ((functionA === void 0 || $.isEmptyObject(functionA) || functionA.value === 0 ||
                        functionA.value !== void 0 && isFinite(functionA.value) === false) &&
                    (functionB === void 0 || $.isEmptyObject(functionB) || functionB.value === 0 ||
                        functionB.value !== void 0 && isFinite(functionB.value) === false)) {
                    paramVariable = equationData.getParamVariable();
                    if (equationData.getPossibleFunctionVariables().indexOf(paramVariable) === -1) {
                        errorOccurred = true;
                    } else {
                        EquationEngine.Parser.parseEquationToGetTokens(equationData);
                        if (!equationData.isCanBeSolved()) {
                            this._plotterView._removeIntersectionsEquationData(equationData);
                            return void 0;
                        }
                        if (equationData.getSpecie() !== 'number' && equationData.getSpecie() !== 'point') {
                            EquationEngine.Parser.processTokensWithRules(equationData);
                            if (!equationData.isCanBeSolved()) {
                                this._plotterView._removeIntersectionsEquationData(equationData);
                                return void 0;
                            }
                            EquationEngine.Parser.generateTreeFromRules(equationData);
                        }
                        equationData.setParamVariable(equationData.getFunctionVariable());
                        equationData.setFunctionVariable(paramVariable);
                        EquationEngine.TreeProcedures.convertToSolvableForm(equationData);
                        functionA = equationData.getA();
                        functionB = equationData.getB();
                        if ((functionA === void 0 || $.isEmptyObject(functionA) || functionA.value === 0 ||
                                functionA.value !== void 0 && isFinite(functionA.value) === false) &&
                            (functionB === void 0 || $.isEmptyObject(functionB) || functionB.value === 0 ||
                                functionB.value !== void 0 && isFinite(functionB.value) === false)) {
                            errorOccurred = true;
                        }
                    }
                    if (errorOccurred) {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('CannotUnderstandThis');
                        return void 0;
                    }
                }
                if (equationData.getSpecie() === 'quadratic') {
                    solution = EquationEngine.TreeProcedures.solveEquation(equationData, 1);
                    equationData.setSolution(solution);
                    if (equationData.getInEqualityPlots() !== 'equal') {
                        equationData.setSpecie('quadraticPlot');
                        this._plot(equationData);
                    }
                }
                if (equationData.getSpecie() === 'plot') {
                    equationOrder = equationData.getParamVariableOrder();
                    if (equationOrder < 2) {
                        functionCooefecient = equationData.getB();
                        if (typeof functionCooefecient === 'undefined') {
                            return void 0;
                        }
                    } else {
                        functionCooefecient = equationData.getA();
                    }
                    EquationEngine.TreeProcedures.checkForInfinity(equationData, equationData.getLeftRoot());
                    if (!equationData.isCanBeSolved()) {
                        return void 0;
                    }
                    if (equationData.getInEqualityType() === 'equal' && this._checkIfEquationContainsFunction(equationData, ['\\prod', '\\sum'])) {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('SumProdForInEquality');
                        return void 0;
                    }
                    this._plot(equationData);
                }

            } else if (equationData.getBlind()) {
                if (['polygon', 'annotation'].indexOf(equationData._specie) > -1) {
                    this.graphView.drawPolygon(equationData);
                } else {
                    this._plot(equationData);
                }
            }
            this.graphView.updateVisibleDomain();
        },

        "getPathForEllipseInterior": function(arr, arr2, plotObj, equationData) {
            var i, j, len, arr2Replica = [],
                upperPathLength, lowerPathLength,
                objectPath = [],
                index, maxima, minima, getConnector, connectSegments,
                BOUNDARY_THRESHOLD = 0.037276595744664576;

            getConnector = function(fromX, fromY, toX, toY) {
                var outCode1 = geomFunctions.calculateLineOutCode(fromX, fromY, plotObj.minX, plotObj.maxX, plotObj.minY, plotObj.maxY, BOUNDARY_THRESHOLD),
                    outCode2 = geomFunctions.calculateLineOutCode(toX, toY, plotObj.minX, plotObj.maxX, plotObj.minY, plotObj.maxY, BOUNDARY_THRESHOLD),
                    cornerPointsMapping = [0, 9, 6, 0, 5, 5, 6, 0, 10, 9, 10],
                    positionMapping = [0, 8, 4, 0, 1, 0, 0, 0, 2, 0, 0],
                    connector = [],
                    code, corner;

                code = outCode1;
                while (code && code !== outCode2) {
                    corner = cornerPointsMapping[code];
                    switch (corner) {
                        case 9:
                            connector.push(plotObj.minX, plotObj.maxY);
                            break;
                        case 5:
                            connector.push(plotObj.minX, plotObj.minY);
                            break;
                        case 6:
                            connector.push(plotObj.maxX, plotObj.minY);
                            break;
                        case 10:
                            connector.push(plotObj.maxX, plotObj.maxY);
                            break;

                    }
                    if (corner === outCode2) {
                        break;
                    }
                    code = positionMapping[code];
                }
                connector.push(toX, toY);
                return connector;
            };

            connectSegments = function connectSegments(arr1, arr2, singlePath) {
                var fromX = arr1[arr1.length - 2],
                    fromY = arr1[arr1.length - 1],
                    toX = arr2[0],
                    toY = arr2[1],
                    connector, ctr;
                connector = getConnector(fromX, fromY, toX, toY, singlePath);
                if (connector && connector.length > 0) {
                    for (ctr = 0; ctr < connector.length; ctr++) {
                        objectPath.push(connector[ctr]);
                    }
                }
            };
            if (typeof arr === 'undefined') {
                arr = [];
            }
            if (typeof arr2 === 'undefined') {
                arr2 = [];
            }
            upperPathLength = arr.length;
            lowerPathLength = arr2.length;
            if (lowerPathLength > 0) {
                for (index = 0, i = lowerPathLength - 1; i >= 0; i--, index++) {
                    len = arr2[i].length;
                    arr2Replica[index] = [];
                    for (j = len; j > 0; j = j - 2) {
                        arr2Replica[index].push(arr2[i][j - 2], arr2[i][j - 1]);
                    }
                }
            }
            maxima = equationData.getCurveMaxima();
            minima = equationData.getCurveMinima();

            if (upperPathLength === 0 && lowerPathLength === 0 && minima[0] < plotObj.minX && minima[1] < plotObj.minY && maxima[0] > plotObj.maxX && maxima[1] > plotObj.maxY) {
                objectPath.push(plotObj.minX, plotObj.maxY, plotObj.maxX, plotObj.maxY, plotObj.maxX, plotObj.minY, plotObj.minX, plotObj.minY, plotObj.minX, plotObj.maxY);
            } else if (lowerPathLength === 0) {
                if (upperPathLength >= 1) {
                    for (i = 0; i < upperPathLength - 1; i++) {
                        objectPath = objectPath.concat(arr[i]);
                        connectSegments(arr[i], arr[i + 1]);
                    }
                    objectPath = objectPath.concat(arr[i]);
                    connectSegments(arr[upperPathLength - 1], arr[0], true);
                }

            } else if (upperPathLength === 0) {
                if (lowerPathLength >= 1) {
                    for (i = 0; i < lowerPathLength - 1; i++) {
                        objectPath = objectPath.concat(arr2Replica[i]);
                        connectSegments(arr2Replica[i], arr2Replica[i + 1]);
                    }
                    objectPath = objectPath.concat(arr2Replica[i]);
                    connectSegments(arr2Replica[lowerPathLength - 1], arr2Replica[0], true);
                }

            } else if (upperPathLength !== 0 && lowerPathLength !== 0) {
                if (upperPathLength >= 1) {
                    for (i = 0; i < upperPathLength - 1; i++) {
                        objectPath = objectPath.concat(arr[i]);
                        connectSegments(arr[i], arr[i + 1]);
                    }
                    objectPath = objectPath.concat(arr[i]);
                }
                if (lowerPathLength >= 1) {
                    connectSegments(arr[upperPathLength - 1], arr2Replica[0]);
                    for (j = 0; j < lowerPathLength - 1; j++) {
                        objectPath = objectPath.concat(arr2Replica[j]);
                        connectSegments(arr2Replica[j], arr2Replica[j + 1]);
                    }
                    objectPath = objectPath.concat(arr2Replica[j]);
                    connectSegments(arr2Replica[lowerPathLength - 1], arr[0]);
                }
            }

            arr = [];
            arr2 = 'undefined';
            arr.push(objectPath.splice(0, objectPath.length));
            objectPath = [];
            return arr;
        },

        "_plot": function(equationData) {
            if (equationData.getSpecie() === 'point') {
                this.graphView.drawPoint(equationData);
                return void 0;
            }
            if (equationData.getVisible().curve === false) {
                this.equationDataCounter--;
                return void 0;
            }
            if (equationData.getSpecie() === 'point') {
                this.graphView.drawPoint(equationData);
                equationData.trigger('plotComplete', equationData);
                this.equationDataCounter--;
                return void 0;
            }
            equationData.setLeftArray([]);
            equationData.setRightArray([]);
            var equationMap = this.model._equationsMap,
                calculatedToleranceX, calculatedToleranceY, markerValues,
                graphViewMarkerBounds = this.graphView.markerBounds,
                equationParamVariable = equationData.getParamVariable(),
                MINRANGE,
                MAXRANGE,
                MINYRANGE,
                MAXYRANGE,
                equationOrder,
                userAgent = navigator.userAgent.toLowerCase(),
                functionVariable = equationData.getFunctionVariable(),
                leftArray = [],
                rightArray = [],
                plotData,
                criticalArray1 = [],
                criticalArray2 = [],
                discontinousPoints = [],
                xCoord = 0,
                yCoord = 1,
                graphViewMarkerBound,
                arrILength,
                translatedArray,
                equationRange = equationData.getRange(),
                hasDiscontinousPoints = equationData.getHasDiscontinuousPoints(),
                hasIntercepts = equationData.getHasIntercepts(),
                hasMaximaMinima = equationData.getHasMaximaMinima(),
                graphView = this.graphView,
                step,
                arrayLength,
                currentPoint = [],
                arr, arr2, arrTranslated, sourceEquationData, i, j,
                temp, arrI, lastXCoord, lastYCoord,
                plotObj,
                hollowPoints, rightEngine,
                leftEngine,
                engineA1,
                criticalPointsObj = {},
                checkAndSetRange,
                engineB1,
                functions,
                minMaxObj, minMaxYObj,
                engineC1,
                inequalityData,
                canvasPt, inequalityPlots,
                plottingFunctions = MathUtilities.Components.Graph.Models.plottingFunctions,
                plottingObj = {
                    "domain": null,
                    "discontinousPoints": null,
                    "hollowPoints": null,
                    "functionVariable": null
                },
                rangePointObj = {
                    "engine": null,
                    "point": null,
                    "equationRange": null,
                    "plot": null,
                    "domain": null,
                    "checkForMinMax": null
                },
                calculatedStep,
                JUMP_COORDINATE = 2,
                engine, engine1, engine2, postProcessFunctionCode,
                range;

            if (equationData.getInEqualityType() !== 'equal') {
                range = equationData.getRange();
                if (range && range.variable === equationData.getFunctionVariable() &&
                    (equationData.getFreeVars()[equationData.getParamVariable()] === 'c' ||
                        equationData.getFreeVars()[equationData.getParamVariable()] === void 0)) {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('InequalityInvalidRange');
                }
            }
            if (equationParamVariable !== 'y') {
                equationParamVariable = 'x';
                equationData.setParamVariable('x');
            }
            MINRANGE = Number(graphViewMarkerBounds.min[equationParamVariable]);
            MAXRANGE = Number(graphViewMarkerBounds.max[equationParamVariable]);
            step = 8 * ((Math.abs(MINRANGE) + Math.abs(MAXRANGE)) / 10000); //calculates step for points calculation
            graphView._paperScope.activate();

            equationRange = equationData.getRange();
            checkAndSetRange = function(rangeObj) {
                var minRange, maxRange,
                    RANGE_STEP = 0.008; // fixed step to get same first point
                if (rangeObj.min !== null) {
                    if (rangeObj.min.value !== null && typeof rangeObj.min.value === 'object') {
                        minRange = equationData.getConstants()[rangeObj.min.value.value];
                    } else {
                        minRange = rangeObj.min.value;
                    }
                }
                if (rangeObj.max !== null) {
                    if (rangeObj.max.value !== null && typeof rangeObj.max.value === 'object') {
                        maxRange = equationData.getConstants()[rangeObj.max.value.value];
                    } else {
                        maxRange = rangeObj.max.value;
                    }
                }
                return {
                    "min": minRange,
                    "max": maxRange
                };
            };

            //if(!MINRANGE) returns true if value is 0.
            if (MINRANGE === void 0) {
                MINRANGE = Number(graphViewMarkerBounds.min[equationParamVariable]);
            }
            if (MAXRANGE === void 0) {
                MAXRANGE = Number(graphViewMarkerBounds.max[equationParamVariable]);
            }
            if (MINYRANGE === void 0) {
                MINYRANGE = Number(graphViewMarkerBounds.min[functionVariable]);
            }
            if (MAXYRANGE === void 0) {
                MAXYRANGE = Number(graphViewMarkerBounds.max[functionVariable]);
            }
            if (equationRange) {
                if (equationRange.rangeForFunctionVariable && equationRange.rangeForFunctionVariable.variable !== null) {
                    if (equationRange.rangeForFunctionVariable.variable === 'y') {
                        minMaxYObj = checkAndSetRange(equationRange.rangeForFunctionVariable);
                    } else {
                        minMaxObj = checkAndSetRange(equationRange.rangeForFunctionVariable);
                    }
                }
                if (equationRange.variable === 'y') {
                    minMaxYObj = checkAndSetRange(equationRange);
                } else {
                    minMaxObj = checkAndSetRange(equationRange);
                }
                if (equationData.isCanBeSolved() === false) {
                    return void 0;
                }
                if (equationParamVariable === 'x') {
                    //set minMaxObj in MINRANGE,MAXRANGE
                    //set minMaxYobj in MINYRANGE
                    if (minMaxObj) {
                        if (minMaxObj.min === 0 && MINRANGE < 0) {
                            MINRANGE = 0;
                        } else if (minMaxObj.min && MINRANGE < minMaxObj.min) {
                            MINRANGE = minMaxObj.min;
                        }
                        if (minMaxObj.max === 0 && MAXRANGE > 0) {
                            MAXRANGE = 0;
                        } else if (minMaxObj.max && MAXRANGE > minMaxObj.max) {
                            MAXRANGE = minMaxObj.max;
                        }
                    }
                    if (minMaxYObj) {
                        if (minMaxYObj.min === 0 && MINYRANGE < 0) {
                            MINYRANGE = 0;
                        } else if (minMaxYObj.min && MINYRANGE < minMaxYObj.min) {
                            MINYRANGE = minMaxYObj.min;
                        }
                        if (minMaxYObj.max === 0 && MAXYRANGE < 0) {
                            MAXYRANGE = 0;
                        } else if (minMaxYObj.max && MAXYRANGE > minMaxYObj.max) {
                            MAXYRANGE = minMaxYObj.max;
                        }
                    }
                } else {
                    //set minMaxYObj in MINRANGE,MAXRANGE
                    //set minmaxobj in min range
                    if (minMaxYObj) {
                        if (minMaxYObj.min === 0 && MINRANGE < 0) {
                            MINRANGE = 0;
                        } else if (minMaxYObj.min && MINRANGE < minMaxYObj.min) {
                            MINRANGE = minMaxYObj.min;
                        }
                        if (minMaxYObj.max === 0 && MAXRANGE > 0) {
                            MAXRANGE = 0;
                        } else if (minMaxYObj.max && MAXRANGE > minMaxYObj.max) {
                            MAXRANGE = minMaxYObj.max;
                        }
                    }
                    if (minMaxObj) {
                        if (minMaxObj.min === 0 && MINYRANGE < 0) {
                            MINYRANGE = 0;
                        } else if (minMaxObj.min && MINYRANGE < minMaxObj.min) {
                            MINYRANGE = minMaxObj.min;
                        }
                        if (minMaxObj.max === 0 && MAXYRANGE < 0) {
                            MAXYRANGE = 0;
                        } else if (minMaxObj.max && MAXYRANGE > minMaxObj.max) {
                            MAXYRANGE = minMaxObj.max;
                        }
                    }
                }

            }
            // Done because of sin x in degree mode and changing the range
            markerValues = this.graphView.getMinimumMarkerValues();

            calculatedToleranceX = markerValues.xMinMarker / 100;
            calculatedToleranceY = markerValues.yMinMarker / 100;
            plotData = {
                "minX": MINRANGE,
                "maxX": MAXRANGE,
                "minY": MINYRANGE,
                "maxY": MAXYRANGE,
                "step": step,
                "toleranceX": calculatedToleranceX,
                "toleranceY": calculatedToleranceY,
                "paramVariable": equationParamVariable
            };
            if (equationData.getSpecie() === 'quadraticPlot' && equationData.getInEqualityType() !== 'equal') {
                this.plotInequalityForquadraticWithOne(equationData, plotData);
                if (equationData.isCanBeSolved() === false) {
                    return void 0;
                }
                if (equationData.getInEqualityType().indexOf('equal') === -1) {
                    equationData.dashedGraph(true);
                } else {
                    equationData.normalGraph();
                }
                return void 0;
            }

            equationOrder = equationData.getParamVariableOrder();
            if (equationData.getInEqualityType() !== 'equal') {
                inequalityData = this.prepareInequalityData(equationData, graphViewMarkerBounds);
            }

            if (userAgent.indexOf('msie 9') === -1 && equationData._directives.processingInstructions & MathUtilities.Components.EquationEngine.Models.EquationEnums.PROCESS_INSTRUCTION_USE_WORKER) {
                if (this._worker === null) {
                    if (MathUtilities.Components.EquationEngine.Models.Parser._deploy === false) {
                        this._worker = new Worker('scripts/models/plot-worker.js');
                    } else {
                        this._worker = new Worker(MathUtilities.Components.Graph.Models.plotterModel.BASEPATH + 'js/math-utilities/components/equation-engine/scripts/models/plot-worker.js');
                    }
                    this._worker.addEventListener('message', _.bind(function(e) {
                        sourceEquationData = equationMap[e.data.id];
                        if (!(sourceEquationData && sourceEquationData.getVisible().curve &&
                                (sourceEquationData.getInEqualityType() === 'equal' || sourceEquationData.getPlotInEqualities()))) {
                            return void 0;
                        }
                        if (sourceEquationData.getInEqualityType() !== 'equal' && !sourceEquationData.getPlotInEqualities()) {
                            return void 0;
                        }
                        // return to avoid issues with multiple math quill event trigger
                        if (sourceEquationData.getSpecie() === 'quadraticPlot') {
                            return void 0;
                        }
                        equationRange = sourceEquationData.getRange();
                        equationParamVariable = sourceEquationData.getParamVariable();

                        postProcessFunctionCode = sourceEquationData.getPostProcessFunctionCode();
                        plotObj = e.data.plot;
                        discontinousPoints = [];
                        hollowPoints = {
                            "points": [],
                            "displayPoints": []
                        };
                        equationOrder = sourceEquationData.getParamVariableOrder();
                        if (Number(sourceEquationData.getPlotSessionCount()) !== Number(e.data.plotSession)) {
                            return void 0;
                        }
                        arr = e.data.lines;
                        arr2 = e.data.lines2;

                        if (postProcessFunctionCode) {

                            arr = this.getPathForEllipseInterior(arr, arr2, plotObj, equationData);
                            arr2 = [];
                        }
                        arrTranslated = [];
                        calculatedStep = 2 * plotObj.step; // multiplied by 2 to get exact step value
                        graphViewMarkerBound = {
                            "min": {
                                "x": plotObj.minX + calculatedStep,
                                "y": plotObj.minY + calculatedStep
                            },
                            "max": {
                                "x": plotObj.maxX - calculatedStep,
                                "y": plotObj.maxY - calculatedStep
                            }
                        };
                        rangePointObj.domain = plotObj;
                        if (hasDiscontinousPoints) {
                            functions = sourceEquationData.getFunctions();
                            engine = new Function('param,constants,functions', sourceEquationData.getFunctionCode());

                            engine1 = function eng1(param) {
                                var soln = engine(param, sourceEquationData.getConstants(), functions);
                                if (soln) {
                                    return soln[0];
                                }
                            };
                            engine2 = function eng2(param) {
                                var soln = engine(param, sourceEquationData.getConstants(), functions);
                                if (soln) {
                                    return soln[1];
                                }
                            };
                            sourceEquationData.setEngine({
                                "engine1": engine1,
                                "engine2": engine2
                            });
                        }

                        equationParamVariable = sourceEquationData.getParamVariable();
                        xCoord = 0;
                        yCoord = 1;
                        if (equationParamVariable === 'y') {
                            xCoord = 1;
                            yCoord = 0;
                        }
                        plottingObj.domain = plotData;
                        plottingObj.functionVariable = sourceEquationData.getFunctionVariable();
                        plottingObj.discontinousPoints = discontinousPoints;
                        plottingObj.hollowPoints = hollowPoints;
                        var canvasPoint;
                        if (sourceEquationData.getSpecie() === 'curve') {
                            arrTranslated = [];
                            if (!arr) {
                                return void 0;
                            }
                            arrayLength = arr.length;
                            for (i = 0; i < arrayLength; i++) {
                                arrTranslated.push([]);
                                if (arr[i]) {
                                    arrILength = arr[i].length;
                                    for (j = 0; j < arrILength; j += JUMP_COORDINATE) {
                                        canvasPoint = this.graphView._getCanvasPointCoordinates([arr[i][j], arr[i][j + 1]]);
                                        arrTranslated[i].push(canvasPoint[0], canvasPoint[1]);
                                    }
                                }
                            }
                        } else {
                            arrayLength = arr.length;
                            rangePointObj.equationRange = equationRange;
                            rangePointObj.plot = plottingObj;
                            for (i = 0; i < arrayLength; i++) {
                                arrI = arr[i];
                                arrILength = arrI.length;
                                lastXCoord = arrILength - JUMP_COORDINATE;
                                lastYCoord = arrILength - 1;
                                if (equationParamVariable === 'y') {
                                    lastXCoord = arrILength - 1;
                                    lastYCoord = arrILength - JUMP_COORDINATE;
                                }
                                if (hasDiscontinousPoints) {

                                    if (arrI[xCoord] > graphViewMarkerBound.min.x &&
                                        arrI[xCoord] < graphViewMarkerBound.max.x &&
                                        arrI[yCoord] > graphViewMarkerBound.min.y &&
                                        arrI[yCoord] < graphViewMarkerBound.max.y && !(i === 0 && equationRange)) {
                                        currentPoint = [arrI[xCoord], arrI[yCoord]];
                                        temp = MathUtilities.Components.Graph.Models.plottingFunctions._checkForDiscontinuity(
                                            currentPoint.slice(), engine1, equationParamVariable, -plotObj.step, equationOrder);
                                        if (isNaN(temp[0]) || isNaN(temp[1]) || !isFinite(temp[0]) || !isFinite(temp[1])) {
                                            hollowPoints.displayPoints.push(temp);
                                            hollowPoints.points.push(currentPoint);
                                        } else {
                                            discontinousPoints.push(currentPoint);
                                        }
                                    } else if (equationRange) {
                                        //min point
                                        currentPoint = [arrI[xCoord], arrI[yCoord]];
                                        rangePointObj.engine = engine1;
                                        rangePointObj.point = currentPoint.slice();
                                        rangePointObj.checkForMinMax = 'min';
                                        plottingFunctions.calculateDiscontinuousPoint(rangePointObj);
                                    }
                                    if (arrI[lastXCoord] > graphViewMarkerBound.min.x &&
                                        arrI[lastXCoord] < graphViewMarkerBound.max.x &&
                                        arrI[lastYCoord] > graphViewMarkerBound.min.y &&
                                        arrI[lastYCoord] < graphViewMarkerBound.max.y &&
                                        !(i === arrayLength - 1 && equationRange)) {
                                        currentPoint = [arrI[lastXCoord], arrI[lastYCoord]];
                                        temp = MathUtilities.Components.Graph.Models.plottingFunctions._checkForDiscontinuity(
                                            currentPoint.slice(), engine1, equationParamVariable, plotObj.step, equationOrder);
                                        if (isNaN(temp[0]) || isNaN(temp[1]) || !isFinite(temp[0]) || !isFinite(temp[1])) {
                                            hollowPoints.displayPoints.push(temp);
                                            hollowPoints.points.push(currentPoint);
                                        } else {
                                            discontinousPoints.push(currentPoint);
                                        }
                                    } else if (equationRange) {
                                        //max point
                                        currentPoint = [arrI[lastXCoord], arrI[lastYCoord]];
                                        rangePointObj.engine = engine1;
                                        rangePointObj.point = currentPoint.slice();
                                        rangePointObj.checkForMinMax = 'max';
                                        plottingFunctions.calculateDiscontinuousPoint(rangePointObj);
                                    }
                                }
                                translatedArray = MathUtilities.Components.Graph.Models.plottingFunctions.translateSegment(plotObj, arrI, graphView);
                                arrTranslated.push(translatedArray);
                            }
                        }
                        sourceEquationData.setLeftArray(arrTranslated);
                        if (arr2) {
                            arrTranslated = [];
                            arrayLength = arr2.length;
                            for (i = 0; i < arrayLength; i++) {
                                arrI = arr2[i];
                                arrILength = arrI.length;
                                lastXCoord = arrILength - JUMP_COORDINATE;
                                lastYCoord = arrILength - 1;
                                if (equationParamVariable === 'y') {
                                    lastXCoord = arrILength - 1;
                                    lastYCoord = arrILength - JUMP_COORDINATE;
                                }
                                if (hasDiscontinousPoints) {
                                    if (arrI[xCoord] > graphViewMarkerBound.min.x && arrI[xCoord] < graphViewMarkerBound.max.x &&
                                        arrI[yCoord] > graphViewMarkerBound.min.y && arrI[yCoord] < graphViewMarkerBound.max.y &&
                                        !(i === 0 && equationRange)) {
                                        currentPoint = [arrI[xCoord], arrI[yCoord]];
                                        if (!this.discontinuosPointAlreadyPresent(currentPoint, discontinousPoints)) {
                                            temp = MathUtilities.Components.Graph.Models.plottingFunctions
                                                ._checkForDiscontinuity(currentPoint.slice(), engine2, equationParamVariable, -e.data.step, equationOrder);
                                            if (isNaN(temp[0]) || isNaN(temp[1]) || !isFinite(temp[0]) || !isFinite(temp[1])) {
                                                hollowPoints.displayPoints.push(temp);
                                                hollowPoints.points.push(currentPoint);
                                            } else {
                                                discontinousPoints.push(currentPoint);
                                            }
                                        }
                                    } else if (equationRange) {
                                        //min point
                                        currentPoint = [arrI[xCoord], arrI[yCoord]];
                                        rangePointObj.engine = engine2;
                                        rangePointObj.point = currentPoint.slice();
                                        rangePointObj.checkForMinMax = 'min';
                                        plottingFunctions.calculateDiscontinuousPoint(rangePointObj);
                                    }
                                    if (arrI[lastXCoord] > graphViewMarkerBound.min.x && arrI[lastXCoord] < graphViewMarkerBound.max.x &&
                                        arrI[lastYCoord] > graphViewMarkerBound.min.y && arrI[lastYCoord] < graphViewMarkerBound.max.y &&
                                        !(i === arrayLength - 1 && equationRange)) {
                                        currentPoint = [arrI[lastXCoord], arrI[lastYCoord]];
                                        if (!this.discontinuosPointAlreadyPresent(currentPoint, discontinousPoints)) {
                                            temp = MathUtilities.Components.Graph.Models.plottingFunctions
                                                ._checkForDiscontinuity(currentPoint.slice(), engine2, equationParamVariable,
                                                    e.data.step, equationOrder);
                                            if (isFinite(temp[0]) || isFinite(temp[1])) {
                                                discontinousPoints.push(currentPoint);
                                            } else {
                                                hollowPoints.displayPoints.push(temp);
                                                hollowPoints.points.push(currentPoint);
                                            }
                                        }
                                    } else if (equationRange) {
                                        //max point
                                        currentPoint = [arrI[lastXCoord], arrI[lastYCoord]];
                                        rangePointObj.engine = engine2;
                                        rangePointObj.point = currentPoint.slice();
                                        rangePointObj.checkForMinMax = 'max';
                                        plottingFunctions.calculateDiscontinuousPoint(rangePointObj);
                                    }
                                }
                                translatedArray = MathUtilities.Components.Graph.Models.plottingFunctions.translateSegment(plotObj, arr2[i], graphView);
                                arrTranslated.push(translatedArray);
                            }
                            sourceEquationData.setRightArray(arrTranslated);
                        }
                        if (sourceEquationData.getInEqualityType() !== 'equal') {
                            this.prepareInEqualityPlots(sourceEquationData, graphViewMarkerBounds, e.data.inequalityPlots);
                            graphView.drawInequalitites(sourceEquationData);
                        }
                        criticalArray1 = e.data.criticalArray;
                        criticalPointsObj = {
                            "sourceEquationData": sourceEquationData,
                            "criticalArray": criticalArray1,
                            "interceptPoints": plotObj.interceptPoints || [],
                            "graphView": graphView,
                            "hollowPoints": hollowPoints,
                            "discontinousPoints": discontinousPoints
                        };
                        this._setCriticalPoints(criticalPointsObj);
                        if (sourceEquationData.getSpecie() === 'curve') {
                            graphView._addCurve(sourceEquationData);
                        } else {
                            graphView._addSegments(sourceEquationData);
                        }

                        if (typeof arr2 !== 'undefined') {
                            sourceEquationData.setArr(arr.concat(arr2));
                        } else {
                            sourceEquationData.setArr(arr);
                            sourceEquationData.trigger('best-fit-points-calculated', arr[0]);
                        }
                        if (sourceEquationData.getInEqualityType() !== 'equal') {
                            if (sourceEquationData.getInEqualityType().indexOf('equal') === -1) {
                                sourceEquationData.dashedGraph(true);
                            } else {
                                sourceEquationData.normalGraph();
                            }
                        }
                        if (sourceEquationData.getDashArray().length !== 0) {
                            sourceEquationData.dashedGraph();
                        }
                        if (this.generateIntersections) {
                            if (this.hasMultipleCall) {
                                this.equationDataCounter--;
                            }
                            if (this.equationDataCounter < 1) {
                                if (this.hasMultipleCall) {
                                    this._generateInterSectionPointsForAllEquation();
                                    this.hasMultipleCall = false;
                                } else {
                                    this.graphView.trigger('generate:intersections');
                                    this._generateInterSectionPointsForAllEquation(sourceEquationData);
                                }
                            }
                        }
                        sourceEquationData.trigger('plotComplete', sourceEquationData);
                    }, this), false);

                }
                equationData.setPlotSessionCount(equationData.getPlotSessionCount() + 1);
                this._worker.postMessage({
                    "code": equationData.getFunctionCode(),
                    "plot": plotData,
                    "constants": equationData.getConstants(),
                    "order": equationOrder,
                    "id": equationData.getId(),
                    "autonomous": equationData.getAutonomous(),
                    "plotSession": equationData.getPlotSessionCount(),
                    "functionVariable": equationData.getFunctionVariable(),
                    "hasIntercepts": hasIntercepts,
                    "hasMaximaMinima": hasMaximaMinima,
                    "inequalityData": inequalityData,
                    "functions": equationData.getCustomFunctions(),
                    "equationFunctions": equationData.getAllFunctions()
                });
                return void 0;
            }

            plotData.gridGraph = graphView;
            sourceEquationData = equationData;

            if (equationData.getAutonomous()) {
                engine = new Function('constants,plot', equationData.getFunctionCode());
                leftArray = engine(equationData.getConstants(), plotData);
                arr = leftArray;
                arrTranslated = [];
                arrayLength = leftArray.length;

                if (sourceEquationData.getSpecie() === 'curve') {
                    if (!arr) {
                        return void 0;
                    }
                    for (i = 0; i < arrayLength; i++) {
                        arrTranslated.push([]);
                        if (leftArray[i]) {
                            for (j = 0; j < leftArray[i].length; j += 2) {
                                canvasPt = this.graphView._getCanvasPointCoordinates([leftArray[i][j], arr[i][j + 1]]);
                                arrTranslated[i].push(canvasPt[0], canvasPt[1]);
                            }
                        }
                    }
                } else {
                    for (i = 0; i < arrayLength; i++) {
                        arrTranslated.push(MathUtilities.Components.Graph.Models.plottingFunctions.translateSegment(plotData, leftArray[i], graphView));
                    }
                }

                sourceEquationData.setLeftArray(arrTranslated);
            } else {
                functions = equationData.getFunctions();
                engine = new Function('param,constants,functions', equationData.getFunctionCode());

                engine1 = function eng1(param) {
                    var soln = engine(param, equationData.getConstants(), functions);
                    return soln[0];
                };
                engine2 = function eng2(param) {
                    var soln = engine(param, equationData.getConstants(), functions);
                    return soln[1];
                };

                equationData.setEngine({
                    "engine1": engine1,
                    "engine2": engine2
                });
                calculatedStep = 2 * plotData.step; // multiplied by 2 to get exact step value
                graphViewMarkerBound = {
                    "min": {
                        "x": plotData.minX + calculatedStep,
                        "y": plotData.minY + calculatedStep
                    },
                    "max": {
                        "x": plotData.maxX - calculatedStep,
                        "y": plotData.maxY - calculatedStep
                    }
                };
                leftArray = MathUtilities.Components.Graph.Models.plottingFunctions.generatePlot(engine1, plotData, sourceEquationData.getFunctionVariable(), hasIntercepts, hasDiscontinousPoints, graphViewMarkerBound, false, sourceEquationData.getRange());
                if (hasMaximaMinima) {
                    criticalArray1 = this.findCriticalPoints(plotData.plot.tempArr, sourceEquationData.getFunctionVariable(), engine1, equationData, plotData);
                }
                arr = plotData.plot.tempArr;
                sourceEquationData.setLeftArray(leftArray);
                postProcessFunctionCode = sourceEquationData.getPostProcessFunctionCode();
                plotData.discontinousPoints = plotData.plot.discontinousPoints;
                hollowPoints = plotData.plot.hollowPoints;
                if (equationOrder === 2) {
                    rightArray = MathUtilities.Components.Graph.Models.plottingFunctions.generatePlot(engine2, plotData, sourceEquationData.getFunctionVariable(), hasIntercepts, hasDiscontinousPoints, graphViewMarkerBound, true, sourceEquationData.getRange());
                    arr2 = plotData.plot.tempArr;
                    if (hasMaximaMinima) {
                        criticalArray2 = this.findCriticalPoints(plotData.plot.tempArr, sourceEquationData.getFunctionVariable(), engine2, equationData, plotData);
                    }
                    if (hasIntercepts) {
                        plotData.interceptPoints = plotData.interceptPoints.concat(MathUtilities.Components.Graph.Models.plottingFunctions.findInterceptsForTwoArrays(arr, arr2, engine1, engine2, sourceEquationData.getFunctionVariable(), plotData));
                    }
                    equationData.setRightArray(rightArray);
                }

            }

            /*Review and then fix it*/
            if (postProcessFunctionCode && equationData.getParent().division === 'interior') {
                arr = this.getPathForEllipseInterior(arr, arr2, plotData, equationData);
                arrTranslated = [];
                arrayLength = arr.length;
                for (i = 0; i < arrayLength; i++) {
                    arrTranslated.push(MathUtilities.Components.Graph.Models.plottingFunctions.translateSegment(plotData, arr[i], graphView));
                }
                sourceEquationData.setLeftArray(arrTranslated);
                sourceEquationData.setRightArray([]);
                arr2 = [];
            }

            if (typeof arr2 !== 'undefined') {
                sourceEquationData.setArr(arr.concat(arr2));
            } else {
                sourceEquationData.setArr(arr);
            }
            if (typeof inequalityData !== 'undefined' && inequalityData.inEqualityType !== 'equal') {
                if (typeof inequalityData.functionCodeA !== 'undefined') {
                    engineA1 = new Function('constants', inequalityData.functionCodeA);
                }
                if (typeof inequalityData.functionCodeB !== 'undefined') {
                    engineB1 = new Function('constants', inequalityData.functionCodeB);
                }
                if (typeof inequalityData.functionCodeC !== 'undefined') {
                    engineC1 = new Function('constants', inequalityData.functionCodeC);
                }
                if (typeof inequalityData.leftFunctionCode !== 'undefined') {
                    leftEngine = new Function('constants', inequalityData.leftFunctionCode);
                }
                if (typeof inequalityData.rightFunctionCode !== 'undefined') {
                    rightEngine = new Function('constants', inequalityData.rightFunctionCode);
                }
                if (equationOrder < 2) {
                    inequalityPlots = MathUtilities.Components.Graph.Models.inequalityPlottingFunctions
                        .getInequalityPlots(engineA1, engineB1, engineC1, functionVariable, inequalityData.maxX,
                            inequalityData.minX, inequalityData.maxY, inequalityData.minY, plotData.paramVariable,
                            plotData.minX, plotData.maxX, plotData.step, sourceEquationData.getConstants(), engine1,
                            inequalityData.graphViewMarkerBounds, inequalityData.inEqualityType, this);
                } else {
                    inequalityPlots = MathUtilities.Components.Graph.Models.inequalityPlottingFunctions
                        .getInequalityPlotForQuadratic(engine1, engine2, inequalityData.inEqualityType,
                            inequalityData.graphViewMarkerBounds, plotData.minX, plotData.maxX, plotData.step,
                            inequalityData.minX, inequalityData.minY, inequalityData.maxX, inequalityData.maxY,
                            engineA1, engineB1, engineC1, functionVariable, sourceEquationData.getConstants(),
                            sourceEquationData.getParamVariable(), leftEngine, rightEngine, this);
                }
            }
            if (sourceEquationData.getInEqualityType() !== 'equal') {

                this.prepareInEqualityPlots(sourceEquationData, graphViewMarkerBounds, inequalityPlots);
                graphView.drawInequalitites(sourceEquationData);
            }
            criticalArray1 = criticalArray1.concat(criticalArray2);
            if (!hollowPoints) {
                hollowPoints = [];
            }
            criticalPointsObj = {
                "sourceEquationData": sourceEquationData,
                "criticalArray": criticalArray1,
                "interceptPoints": plotData.interceptPoints || [],
                "graphView": graphView,
                "hollowPoints": hollowPoints,
                "discontinousPoints": plotData.plot.discontinousPoints
            };
            this._setCriticalPoints(criticalPointsObj);
            if (sourceEquationData.getSpecie() === 'curve') {
                graphView._addCurve(sourceEquationData);
            } else {
                graphView._addSegments(sourceEquationData);
            }
            if (sourceEquationData.getInEqualityType() !== 'equal') {
                if (sourceEquationData.getInEqualityType().indexOf('equal') === -1) {
                    sourceEquationData.dashedGraph(true);
                } else {
                    sourceEquationData.normalGraph();
                }
            }
            if (sourceEquationData.getDashArray().length !== 0) {
                sourceEquationData.dashedGraph();
            }

            this.graphView.refreshView();

            if (typeof equationData.getThickness() === 'undefined') {
                equationData.setThickness(3);
            }
            if (this.generateIntersections) {
                if (this.hasMultipleCall) {
                    this.equationDataCounter--;
                }

                if (this.equationDataCounter < 1) {
                    if (this.hasMultipleCall) {
                        this._generateInterSectionPointsForAllEquation();
                        this.hasMultipleCall = false;
                    } else {
                        this._generateInterSectionPointsForAllEquation();
                    }
                }
            }
        },



        "discontinuosPointAlreadyPresent": function(currentPoint, discontinuosArray) {
            var count, length = discontinuosArray.length,
                isPresent = false,
                xdifference, ydifference, THRESHOLD = 0.01;
            if (length === 0) {
                return isPresent;
            }
            for (count = 0; count < length; count++) {
                xdifference = Math.abs(currentPoint[0] - discontinuosArray[count][0]);
                ydifference = Math.abs(currentPoint[1] - discontinuosArray[count][1]);
                if (xdifference < THRESHOLD && ydifference < THRESHOLD) {
                    isPresent = true;
                    discontinuosArray.splice(count, 1);
                    break;
                }
            }

            return isPresent;
        },

        "_getParametersToSolveInequalities": function(equationData, varsToChange) {
            var TreeProcedures = MathUtilities.Components.EquationEngine.Models.TreeProcedures,
                A, B, C, ineqaulityLeftRoot,
                ineqaulityRightRoot;
            // A, B and C denote coefficients of quadratic equation
            A = TreeProcedures.getCloneOf(equationData.getA());
            B = TreeProcedures.getCloneOf(equationData.getB());
            C = TreeProcedures.getCloneOf(equationData.getC());
            ineqaulityLeftRoot = equationData.getLeftInequalityRoot();
            ineqaulityRightRoot = equationData.getRightInequalityRoot();

            TreeProcedures.changeVarsAsConstants(A, varsToChange);
            TreeProcedures.changeVarsAsConstants(B, varsToChange);
            TreeProcedures.changeVarsAsConstants(C, varsToChange);
            TreeProcedures.changeVarsAsConstants(ineqaulityLeftRoot, varsToChange);
            TreeProcedures.changeVarsAsConstants(ineqaulityRightRoot, varsToChange);

            return {
                "a": A,
                "b": B,
                "c": C,
                "inequalityLeftRoot": ineqaulityLeftRoot,
                "inequalityRightRoot": ineqaulityRightRoot
            };
        },

        "_setCriticalPoints": function(data) {
            var criticalPoints,
                pointsGroup,
                sourceEquationData = data.sourceEquationData,
                criticalArray = data.criticalArray,
                graphView = data.graphView,
                hollowPoints = data.hollowPoints,
                interceptPoints = data.interceptPoints || [],
                discontinousPoints = data.discontinousPoints || [],
                interceptPointsEquation,
                discontinousPointsEquation,
                hollowPointsEquation = null;

            if (hollowPoints && hollowPoints.points) {
                if (sourceEquationData.getHollowPoints() === null) {
                    hollowPointsEquation = this._createEquationData(sourceEquationData);
                    sourceEquationData.setHollowPoints(hollowPointsEquation);
                } else {
                    hollowPointsEquation = sourceEquationData.getHollowPoints(sourceEquationData);
                }
                hollowPointsEquation.setEquationDataType('hollowPoints');
                hollowPointsEquation.setPoints(hollowPoints.points);
                hollowPointsEquation.setHasHollowPointEquation(true);
                graphView.drawPoint(hollowPointsEquation, hollowPoints.displayPoints);
            }

            if (sourceEquationData.getCriticalPoints() === null) {
                criticalPoints = this._createCriticalPointEquationData(sourceEquationData);
            } else {
                criticalPoints = sourceEquationData.getCriticalPoints();
            }
            criticalPoints.setEquationDataType('criticalPoints');
            criticalPoints.setPoints(criticalArray);

            if (sourceEquationData.getInterceptPoints() === null) {
                interceptPointsEquation = this._createEquationData(sourceEquationData);
                sourceEquationData.setInterceptPoints(interceptPointsEquation);
            } else {
                interceptPointsEquation = sourceEquationData.getInterceptPoints();
            }
            interceptPointsEquation.setEquationDataType('interceptPoints');
            interceptPointsEquation.setPoints(interceptPoints);
            if (sourceEquationData.getDiscontinuousPoints() === null) {
                discontinousPointsEquation = this._createEquationData(sourceEquationData);
                sourceEquationData.setDiscontinuousPoints(discontinousPointsEquation);
            } else {
                discontinousPointsEquation = sourceEquationData.getDiscontinuousPoints();
            }
            discontinousPointsEquation.setEquationDataType('discontinousPoints');
            discontinousPointsEquation.setPoints(discontinousPoints);

            if (sourceEquationData.hasFocus && sourceEquationData.getCurveVisibility()) {
                criticalPoints.showGraph();
                discontinousPointsEquation.showGraph();
                interceptPointsEquation.showGraph();
                if (hollowPointsEquation !== null) {
                    hollowPointsEquation.showGraph();
                }
            } else {
                criticalPoints.hideGraph();
                discontinousPointsEquation.hideGraph();
                interceptPointsEquation.hideGraph();
                if (hollowPointsEquation !== null) {
                    hollowPointsEquation.hideGraph();
                }
            }
            graphView.drawPoint(criticalPoints);
            pointsGroup = criticalPoints.getPointsGroup();
            if (pointsGroup !== null) {
                this.changeOpacity(criticalPoints, this.graphView._criticalPointsProperties.normal.opacity);
                graphView.criticalPointsShowOnHover(pointsGroup, criticalPoints);
            }
            graphView.drawPoint(interceptPointsEquation);
            pointsGroup = interceptPointsEquation.getPointsGroup();
            if (pointsGroup !== null) {
                this.changeOpacity(interceptPointsEquation, this.graphView._criticalPointsProperties.normal.opacity);
                graphView.criticalPointsShowOnHover(pointsGroup, interceptPointsEquation);
            }
            graphView.drawPoint(discontinousPointsEquation);
            pointsGroup = discontinousPointsEquation.getPointsGroup();
            if (pointsGroup !== null) {
                this.changeOpacity(discontinousPointsEquation, this.graphView._criticalPointsProperties.normal.opacity);
                graphView.criticalPointsShowOnHover(pointsGroup, discontinousPointsEquation);
            }
            if (hollowPointsEquation !== null) {
                pointsGroup = hollowPointsEquation.getPointsGroup();
                if (pointsGroup !== null) {
                    this.changeOpacity(hollowPointsEquation, this.graphView._criticalPointsProperties.normal.opacity);
                    graphView.criticalPointsShowOnHover(pointsGroup, hollowPointsEquation);
                }
            }
        },

        "_createEquationData": function(sourceEquationData) {
            var equationData,
                HIT_AREA_THICKNESS = 25,
                THICKNESS = 0.5;
            equationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
            equationData.setColor(this.graphView._criticalPointsProperties.normal.color, true);
            equationData.hasParent = sourceEquationData;
            equationData.setExtraThickness(true);
            equationData.setDragHitThickness(HIT_AREA_THICKNESS);
            equationData.setThickness(sourceEquationData.getThickness() - THICKNESS);
            return equationData;
        },

        "_createCriticalPointEquationData": function(equationData) {
            equationData.setCriticalPoints(this._createEquationData(equationData));
            return equationData.getCriticalPoints();
        },

        "_createIntersectionPointEquationData": function(equationData) {
            var intersectionEquationdata = this._createEquationData(equationData);
            intersectionEquationdata.setEquationDataType('intersectionsPoints');
            return intersectionEquationdata;
        },

        "_setIntersectionPointsEquationData": function(equationData1, equationData2, intersectionPoints) {
            var intersections1 = equationData1.getIntersectionPoints(),
                intersections2 = equationData2.getIntersectionPoints(),
                id1 = equationData1.getCid(),
                id2 = equationData2.getCid();
            if (intersections1 === null) {
                equationData1.setIntersectionPoints({});
                intersections1 = equationData1.getIntersectionPoints();
            }
            if (intersections2 === null) {
                equationData2.setIntersectionPoints({});
                intersections2 = equationData2.getIntersectionPoints();
            }
            if (typeof intersections1[id2] === 'undefined' && typeof intersections2[id1] === 'undefined') {
                intersections1[id2] = this._createIntersectionPointEquationData(equationData1);
                intersections2[id1] = intersections1[id2];
            }
            intersections1[id2].setPoints(intersectionPoints);
            if (equationData1.getCurveVisibility() === false || equationData2.getCurveVisibility() === false) {
                intersections1[id2].setVisible(false);
            }
            this.graphView.drawPoint(intersections1[id2]);
            this.changeOpacity(intersections1[id2], this.graphView._criticalPointsProperties.normal.opacity);
            this.graphView.criticalPointsShowOnHover(intersections1[id2].getPointsGroup(), intersections1[id2]);
            this.graphView.refreshView();
        },

        "_getEquationDataUsingCid": function(cid) {
            var equationDataList = this.model._equations,
                noOfEquationData = equationDataList.length,
                equationDataCounter;
            for (equationDataCounter = 0; equationDataCounter < noOfEquationData; equationDataCounter++) {
                if (equationDataList[equationDataCounter].getCid() === cid) {
                    return equationDataList[equationDataCounter];
                }
            }
        },

        "_removeIntersectionsEquationData": function(equationData) {
            var intersections,
                id = equationData.getCid(),
                intersectionCounter;
            intersections = equationData.getIntersectionPoints();
            if (intersections !== null) {
                for (intersectionCounter in intersections) {
                    this.graphView.removePoint(intersections[intersectionCounter]);
                    delete intersections[intersectionCounter];
                    equationData = this._getEquationDataUsingCid(intersectionCounter);
                    this.graphView.removePoint(equationData.getIntersectionPoints()[id]);
                    delete equationData.getIntersectionPoints()[id];
                }
            }
        },

        "_generateInterSectionPointsForAllEquation": function(newEqaution) {
            this._generateInterSectionPoints(newEqaution);
        },
        "_createIntersectionWorker": function() {
            var equationData,
                equationData2,
                interSectionPoints,
                equationMap = this.model._equationsMap;

            if (typeof Worker !== 'undefined') {
                this._intersectionWorker = new Worker(MathUtilities.Components.Graph.Models.plotterModel.BASEPATH + 'js/math-utilities/components/equation-engine/scripts/models/intersection-points-worker.js');
                this._intersectionWorker.addEventListener('message', _.bind(function(e) {
                    equationData = equationMap[e.data.id1];
                    equationData2 = equationMap[e.data.id2];
                    interSectionPoints = e.data.points;
                    if (typeof equationData === 'undefined' || typeof equationData2 === 'undefined') {
                        return void 0;
                    }
                    this._setIntersectionPointsEquationData(equationData, equationData2, interSectionPoints);
                }, this), false);
            }
        },
        "_generateInterSectionPoints": function(newEqaution) {
            var equationData,
                equationData2,
                equationDataList = this.model._equations,
                noOfEquationData = equationDataList.length,
                noOfPoints,
                pointCounter,
                equationDataCounter = 0,
                equationDataCounter2 = 0,
                interSectionPoints = [],
                intersectionsObj,
                equation2Cid,
                intersectionPointsGroup,
                intersectionEquationdata,
                approxIntersectionPoints = [],
                approxIntersectionPointsArray = [];

            for (equationDataCounter = 0; equationDataCounter < noOfEquationData; equationDataCounter++) {
                equationData = equationDataList[equationDataCounter];
                intersectionsObj = equationData.getIntersectionPoints();
                if (typeof newEqaution === 'undefined') {
                    for (equationDataCounter2 = equationDataCounter + 1; equationDataCounter2 < noOfEquationData; equationDataCounter2++) {
                        equationData2 = equationDataList[equationDataCounter2];
                        approxIntersectionPointsArray = [];
                        if (equationData.getHasIntersections() === false || equationData2.getHasIntersections() === false
                            || equationData.getArr().length === 0 || equationData2.getArr().length === 0) {
                            continue;
                        }
                        if (equationData.getParamVariable() === 'x' && equationData2.getParamVariable() === 'x') {
                            if (this._isGraphSimilar(equationData, equationData2)) {
                                continue;
                            }
                            approxIntersectionPoints = this._getIntersectionPointsBetweenTwoGroups(equationData.getPathGroup(), equationData2.getPathGroup());
                            if (typeof Worker !== 'undefined') {
                                noOfPoints = approxIntersectionPoints.length;
                                for (pointCounter = 0; pointCounter < noOfPoints; pointCounter++) {
                                    approxIntersectionPointsArray.push(this.graphView._getGraphPointCoordinates([approxIntersectionPoints[pointCounter].point.x, approxIntersectionPoints[pointCounter].point.y]));
                                }
                                if (!this._intersectionWorker) {
                                    this._createIntersectionWorker();
                                }
                                equation2Cid = equationData2.getCid();
                                if (intersectionsObj !== null) {
                                    intersectionEquationdata = intersectionsObj[equation2Cid];
                                    if (typeof intersectionEquationdata !== 'undefined') {
                                        intersectionPointsGroup = intersectionEquationdata.getPointsGroup();
                                        if (intersectionPointsGroup !== null) {
                                            intersectionPointsGroup.visible = false;
                                        }
                                    }
                                }

                                this._intersectionWorker.postMessage({
                                    "code1": equationData.getFunctionCode(),
                                    "code2": equationData2.getFunctionCode(),
                                    "constants": equationData.getConstants(),
                                    "order1": equationData.getParamVariableOrder(),
                                    "order2": equationData2.getParamVariableOrder(),
                                    "id1": equationData.getId(),
                                    "id2": equationData2.getId(),
                                    "points": approxIntersectionPointsArray,
                                    "pts1": equationData.getArr()[0] ? equationData.getArr()[0].length : 0,
                                    "pts2": equationData2.getArr()[0] ? equationData2.getArr()[0].length : 0,
                                    "functions": equationData.getCustomFunctions(),
                                    "equationFunctions": equationData.getAllFunctions(),
                                    "equation1Functions": equationData2.getAllFunctions()
                                });

                            } else {
                                interSectionPoints = this._refinePoints(approxIntersectionPoints, equationData, equationData2);
                                this._setIntersectionPointsEquationData(equationData, equationData2, interSectionPoints);
                            }
                        }
                    }
                } else {
                    equationData = newEqaution;
                    equationData2 = equationDataList[equationDataCounter];
                    if (equationData.getCid() === equationData2.getCid() ||
                        equationData.getHasIntersections() === false || equationData2.getHasIntersections() === false) {
                        continue;
                    }
                    approxIntersectionPointsArray = [];
                    if (equationData.getParamVariable() === 'x' && equationData2.getParamVariable() === 'x') {
                        if (this._isGraphSimilar(equationData, equationData2)) {
                            continue;
                        }
                        approxIntersectionPoints = this._getIntersectionPointsBetweenTwoGroups(equationData.getPathGroup(), equationData2.getPathGroup());
                        if (typeof Worker !== 'undefined') {
                            noOfPoints = approxIntersectionPoints.length;
                            for (pointCounter = 0; pointCounter < noOfPoints; pointCounter++) {
                                approxIntersectionPointsArray.push(this.graphView._getGraphPointCoordinates([approxIntersectionPoints[pointCounter].point.x, approxIntersectionPoints[pointCounter].point.y]));
                            }
                            if (!this._intersectionWorker) {
                                this._createIntersectionWorker();
                            }

                            if (equationData.getIntersectionPoints() && equationData.getIntersectionPoints()[equationData2.getCid()] && equationData.getIntersectionPoints()[equationData2.getCid()].getPointsGroup()) {
                                equationData.getIntersectionPoints()[equationData2.getCid()].getPointsGroup().visible = false;
                            }
                            equation2Cid = equationData2.getCid();
                            if (intersectionsObj !== null) {
                                intersectionEquationdata = intersectionsObj[equation2Cid];
                                if (typeof intersectionEquationdata !== 'undefined') {
                                    intersectionPointsGroup = intersectionEquationdata.getPointsGroup();
                                    if (intersectionPointsGroup !== null) {
                                        intersectionPointsGroup.visible = false;
                                    }
                                }
                            }
                            this._intersectionWorker.postMessage({
                                "code1": equationData.getFunctionCode(),
                                "code2": equationData2.getFunctionCode(),
                                "constants": equationData.getConstants(),
                                "order1": equationData.getParamVariableOrder(),
                                "order2": equationData2.getParamVariableOrder(),
                                "id1": equationData.getId(),
                                "id2": equationData2.getId(),
                                "points": approxIntersectionPointsArray,
                                "pts1": equationData.getArr()[0] ? equationData.getArr()[0].length : 0,
                                "pts2": equationData2.getArr()[0] ? equationData2.getArr()[0].length : 0,
                                "functions": equationData.getCustomFunctions(),
                                "equationFunctions": equationData.getAllFunctions(),
                                "equation1Functions": equationData2.getAllFunctions()
                            });
                        } else {
                            interSectionPoints = this._refinePoints(approxIntersectionPoints, equationData, equationData2);
                            this._setIntersectionPointsEquationData(equationData, equationData2, interSectionPoints);
                        }
                    }
                }

            }
            this.graphView.refreshView();
        },
        "removeRangeCheck": function(functionCode) {
            var rangeCheck = "param===0?param=0:param=param;",
                splitArray,
                MAX_COUNT = 2,
                newFunctionCode;
            splitArray = functionCode.split(rangeCheck);
            if (splitArray.length > MAX_COUNT) {
                newFunctionCode = rangeCheck + splitArray[MAX_COUNT];
                return newFunctionCode;
            } else {
                return functionCode;
            }

        },

        "_isGraphSimilar": function(equationData1, equationData2) {
            var hasRange1 = equationData1.getRange(),
                engine1,
                engine2,
                engine11,
                functions1,
                functions2,
                engine22,
                counter,
                functionCode1 = equationData1.getFunctionCode(),
                functionCode2 = equationData2.getFunctionCode(),
                RANGE = 10,
                pathGroup1 = equationData1.getPathGroup(),
                pathGroup2 = equationData2.getPathGroup(),
                constants1 = equationData1.getConstants(),
                constants2 = equationData2.getConstants(),
                hasRange2 = equationData2.getRange(),
                STEP1 = 0.2,
                STEP2 = 0.6;
            pathGroup1 = equationData1.getPathGroup();
            pathGroup2 = equationData2.getPathGroup();
            if (pathGroup1 === null || pathGroup2 === null) {
                return true;
            }
            if (hasRange1 === null && hasRange2 === null) {
                if (pathGroup1.children.length !== 0 && pathGroup2.children.length !== 0 && pathGroup1.children[0].pathData === pathGroup2.children[0].pathData) {
                    return true;
                }
            } else {
                if (equationData1.getFunctionCode() === equationData2.getFunctionCode()) {
                    return true;
                }
                if (equationData1.getDefinitionFor()) {
                    functionCode1 = this.removeRangeCheck(functionCode1);
                }
                if (equationData2.getDefinitionFor()) {
                    functionCode2 = this.removeRangeCheck(functionCode2);
                }
                functions1 = equationData1.getFunctions();
                engine1 = new Function('param,constants,functions', functionCode1);
                engine11 = function eng2(param) {
                    var soln = engine1(param, constants1, functions1);
                    return soln[0];
                };

                functions2 = equationData2.getFunctions();
                engine2 = new Function('param,constants,functions', functionCode2);
                engine22 = function eng2(param) {
                    var soln = engine2(param, constants2, functions2);
                    return soln[1];
                };
                for (counter = -RANGE; counter < RANGE; counter++) {
                    if (engine11(counter) !== engine22(counter) ||
                        engine11(counter + STEP1) !== engine22(counter + STEP1) ||
                        engine11(counter + STEP2) !== engine22(counter + STEP2)) {
                        return false;
                    }
                }
                return true;
            }
        },

        "_getIntersectionPoints": function(equationData) {
            var equationDataCollection = this.model._equations,
                noOfEquationData = equationDataCollection.length,
                equationDataCounter = 0,
                intersectionPoints = [],
                pointCounter,
                approxIntersectionPointsArray = [],
                noOfPoints,
                approxIntersectionPoints;

            if (equationData.getParamVariable() !== 'x') {
                return [];
            }
            for (equationDataCounter = 0; equationDataCounter < noOfEquationData; equationDataCounter++) {
                if (equationData.cid === equationDataCollection[equationDataCounter].cid || equationDataCollection[equationDataCounter].getSpecie() !== 'plot') {
                    continue;
                }
                approxIntersectionPoints = this._getIntersectionPointsBetweenTwoGroups(equationData.getPathGroup(), equationDataCollection[equationDataCounter].getPathGroup());

                noOfPoints = approxIntersectionPoints.length;
                for (pointCounter = 0; pointCounter < noOfPoints; pointCounter++) {
                    approxIntersectionPointsArray.push(this.graphView._getGraphPointCoordinates([approxIntersectionPoints[pointCounter].point.x, approxIntersectionPoints[pointCounter].point.y]));
                }
                MathUtilities.Components.EquationEngine.Models.Profile.getStartTime('_refinePoints');
                this._intersectionWorker.postMessage({
                    "code1": equationData.getFunctionCode(),
                    "code2": equationDataCollection[equationDataCounter].getFunctionCode(),
                    "constants": equationData.getConstants(),
                    "order1": equationData.getParamVariableOrder(),
                    "order2": equationDataCollection[equationDataCounter].getParamVariableOrder(),
                    "id": equationData.getId(),
                    "points": approxIntersectionPointsArray,
                    "pts1": equationData.getArr()[0].length,
                    "pts2": equationDataCollection[equationDataCounter].getArr()[0].length,
                    "functions": equationData.getCustomFunctions(),
                    "equationFunctions": equationData.getAllFunctions(),
                    "equation1Functions": equationDataCollection[equationDataCounter].getAllFunctions()
                });

            }

            return intersectionPoints;
        },
        "_refinePoints": function(points, equationData1, equationData2) {

            var engine1,
                engine2,
                refinedPoints = [],
                engine11,
                engine12,
                engine21,
                engine22,
                enginea,
                engineb,
                functions1 = equationData1.getFunctions(),
                functions2 = equationData2.getFunctions(),
                pointCounter,
                noOfPoints = points.length,
                point;
            engine1 = new Function('param,constants,functions', equationData1.getFunctionCode());
            engine11 = function eng2(param) {
                var soln = engine1(param, equationData1.getConstants(), functions1);
                return soln[0];
            };
            engine12 = function eng2(param) {
                var soln = engine1(param, equationData1.getConstants(), functions1);
                return soln[1];
            };
            engine2 = new Function('param,constants,functions', equationData2.getFunctionCode());
            engine21 = function eng2(param) {
                var soln = engine2(param, equationData1.getConstants(), functions2);
                return soln[0];
            };
            engine22 = function eng2(param) {
                var soln = engine2(param, equationData1.getConstants(), functions2);
                return soln[1];
            };

            for (pointCounter = 0; pointCounter < noOfPoints; pointCounter++) {
                enginea = engine11;
                engineb = engine21;
                point = this.graphView._getGraphPointCoordinates([points[pointCounter].point.x, points[pointCounter].point.y]);
                if (equationData1.getParamVariableOrder() > 1) {
                    enginea = this._selectRequiredEngine(point, engine11, engine12);
                }
                if (equationData2.getParamVariableOrder() > 1) {
                    engineb = this._selectRequiredEngine(point, engine21, engine22);
                }
                refinedPoints.push(this._getIntersection(point, enginea, engineb));
            }
            return refinedPoints;
        },

        "_selectRequiredEngine": function(point, engine1, engine2) {
            var y1 = engine1(point[0]),
                y2 = engine2(point[0]);
            if (Math.abs(point[1] - y1) < Math.abs(point[1] - y2)) {
                return engine1;
            }
            return engine2;
        },

        "_getIntersection": function(point, engine1, engine2, useEngine2) {
            var step = 0.0001,
                y1 = engine1(point[0]),
                y2 = engine2(point[0]),
                x1,
                x2,
                difference = Math.abs(y1 - y2),
                deltaX,
                deltaY;
            if (difference === 0) {
                return [this.graphView._getNumberForToolTip(point[0]), this.graphView._getNumberForToolTip(point[1])];
            }
            if (Math.abs(engine1(point[0]) - engine2(point[0])) < Math.abs(engine1(point[0] + step) - engine2(point[0] + step))) {
                step = -step;
            }
            /*eslint-disable no-constant-condition*/
            while (true) {
                /*eslint-enable no-constant-condition*/
                x1 = point[0];
                point[0] += step;
                x2 = point[0];
                point[1] = engine1(point[0]);
                y1 = point[1];
                y2 = engine2(point[0]);
                deltaX = x2 - x1;
                deltaY = y2 - y1;
                if (isNaN(y1)) {
                    return [point[0], y2];
                }
                if (isNaN(y2)) {
                    return [point[0], y1];
                }
                if (difference < Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) {
                    if (useEngine2) {
                        return [point[0], y2];
                    }
                    return [point[0], y1];
                }
                difference = Math.pow(deltaX, 2) + Math.pow(deltaY, 2);
            }
        },

        "_getIntersectionPointsBetweenTwoGroups": function(group1, group2) {
            if (!(group1 && group2)) {
                return [];
            }
            var intersectionPoints = [],
                group1Children = group1.children,
                group2Children = group2.children,
                group1ChildrenLength = group1Children.length,
                group2ChildrenLength = group2Children.length,
                childCounter1,
                childCounter2;
            for (childCounter1 = 0; childCounter1 < group1ChildrenLength; childCounter1++) {
                if (group1Children[childCounter1].hit) {
                    continue;
                }
                for (childCounter2 = 0; childCounter2 < group2ChildrenLength; childCounter2++) {
                    if (group2Children[childCounter2].hit) {
                        continue;
                    }
                    intersectionPoints = intersectionPoints.concat(group1Children[childCounter1].getIntersections(group2Children[childCounter2]));
                }
            }
            return intersectionPoints;
        },


        "getLinearContinuousInequalityPlots": function(points, minX, minY, maxX, maxY, functionVariable, inEqualityType) {
            if (points.length < 2) {
                return void 0;
            }
            var firstPointIntersection,
                isDiscontinuos = false,
                secondPointIntersection,
                totalPoints = points.length,
                inEqualityPlots = [],
                isInEqualityLess = false,
                firstPoint = points[0],
                lastPoint = points[totalPoints - 1];

            firstPointIntersection = this._getPointIntersectionWithBounds(firstPoint, minX, minY, maxX, maxY);
            secondPointIntersection = this._getPointIntersectionWithBounds(lastPoint, minX, minY, maxX, maxY);

            isDiscontinuos = functionVariable === 'y' ? firstPoint[0] > minX || lastPoint[0] < maxX : lastPoint[1] > minY || firstPoint[1] < maxY;
            if (isDiscontinuos || firstPointIntersection === null || secondPointIntersection === null) {
                inEqualityPlots = this.getDiscontinuousInequalityPlots(points, minX, minY, maxX, maxY, functionVariable, inEqualityType);
                return inEqualityPlots;
            }

            isInEqualityLess = inEqualityType === 'lesser' || inEqualityType === 'ltequal';

            switch (firstPointIntersection) {
                case 'xMax':
                    switch (secondPointIntersection) {
                        case 'xMin':
                            if (functionVariable === 'y') {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([firstPoint[0], maxY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], maxY]);
                                } else {
                                    inEqualityPlots.push([firstPoint[0], minY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], minY]);
                                }
                            } else {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([firstPoint[0], minY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], minY]);
                                } else {
                                    inEqualityPlots.push([firstPoint[0], maxY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], maxY]);
                                }
                            }
                            break;
                        case 'xMax':
                            if (isInEqualityLess) {
                                inEqualityPlots.push([minX, maxY], [firstPoint[0], maxY]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([lastPoint[0], minY], [minX, minY]);
                            } else {
                                inEqualityPlots = inEqualityPlots.concat(points);
                            }
                            break;
                        case 'yMin':
                            if (isInEqualityLess) {
                                inEqualityPlots.push([firstPoint[0], maxY]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([minX, lastPoint[1]], [minX, maxY]);
                            } else {
                                inEqualityPlots.push([firstPoint[0], lastPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                            }
                            break;
                    }
                    break;
                case 'xMin':
                    switch (secondPointIntersection) {
                        case 'xMax':
                            if (functionVariable === 'y') {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([firstPoint[0], maxY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], maxY]);
                                } else {
                                    inEqualityPlots.push([firstPoint[0], minY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], minY]);
                                }
                            } else {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([firstPoint[0], minY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], minY]);
                                } else {
                                    inEqualityPlots.push([firstPoint[0], maxY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], maxY]);
                                }
                            }
                            break;
                        case 'yMax':
                            if (isInEqualityLess) {
                                inEqualityPlots.push([firstPoint[0], lastPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                            } else {
                                inEqualityPlots.push([firstPoint[0], minY]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([maxX, lastPoint[1]], [maxX, minY]);
                            }
                            break;
                        case 'yMin':
                            if (functionVariable === 'y') {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([firstPoint[0], maxY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([maxX, lastPoint[1]], [maxX, maxY]);
                                } else {
                                    inEqualityPlots.push([firstPoint[0], lastPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                }
                            } else {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([firstPoint[0], lastPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                } else {
                                    inEqualityPlots.push([firstPoint[0], maxY]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([maxX, lastPoint[1]], [maxX, maxY]);
                                }
                            }
                            break;
                        case 'xMin':
                            if (isInEqualityLess) {
                                inEqualityPlots = inEqualityPlots.concat(points);
                            } else {
                                inEqualityPlots.push([maxX, maxY], [firstPoint[0], maxY]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([lastPoint[0], minY], [maxX, minY]);
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
                                } else {
                                    inEqualityPlots.push([minX, firstPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([minX, lastPoint[1]]);
                                }
                            } else {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([minX, firstPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([minX, lastPoint[1]]);
                                } else {
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
                                } else {
                                    inEqualityPlots.push([minX, firstPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], minY], [minX, minY]);
                                }
                            } else {
                                if (isInEqualityLess) {
                                    inEqualityPlots.push([minX, firstPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                    inEqualityPlots.push([lastPoint[0], minY], [minX, minY]);
                                } else {
                                    inEqualityPlots.push([maxX, firstPoint[1]]);
                                    inEqualityPlots = inEqualityPlots.concat(points);
                                }
                            }
                            break;
                        case 'yMax':
                            if (isInEqualityLess) {
                                inEqualityPlots = inEqualityPlots.concat(points);
                            } else {
                                inEqualityPlots.push([minX, minY], [minX, firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([maxX, lastPoint[1]], [maxX, minY]);
                            }
                            break;
                        case 'xMin':
                            if (isInEqualityLess) {
                                inEqualityPlots.push([lastPoint[0], firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                            } else {
                                inEqualityPlots.push([maxX, firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([lastPoint[0], minY], [maxX, minY]);
                            }
                            break;
                    }
                    break;
                case 'yMin':
                    switch (secondPointIntersection) {
                        case 'xMax':
                            if (isInEqualityLess) {
                                inEqualityPlots.push([minX, firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([lastPoint[0], maxY], [minX, maxY]);
                            } else {
                                inEqualityPlots.push([lastPoint[0], firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                            }
                            break;
                        case 'yMin':
                            if (isInEqualityLess) {
                                inEqualityPlots.push([minX, maxY], [minX, firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([maxX, lastPoint[1]], [maxX, maxY]);
                            } else {
                                inEqualityPlots = inEqualityPlots.concat(points);
                            }
                            break;
                        case 'yMax':
                            if (isInEqualityLess) {
                                inEqualityPlots.push([minX, firstPoint[1]]);
                                inEqualityPlots = inEqualityPlots.concat(points);
                                inEqualityPlots.push([minX, lastPoint[1]]);
                            } else {
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

        "_getPointIntersectionWithBounds": function(point, minX, minY, maxX, maxY) {
            if (!point) {
                return void 0;
            }
            var pointIntersection = null;
            if (Math.round(point[0]) <= minX) {
                pointIntersection = 'xMin';
            } else if (Math.ceil(point[0]) >= maxX) {
                pointIntersection = 'xMax';
            } else if (Math.round(point[1]) <= minY) {
                pointIntersection = 'yMin';
            } else if (Math.ceil(point[1]) >= maxY) {
                pointIntersection = 'yMax';
            }
            return pointIntersection;
        },

        "_getBoundsForDiscontinuousFucntion": function(points) {
            var firstPoint = points[0],
                pointsLength = points.length,
                lastPoint = points[pointsLength - 1],
                returnBounds = {
                    "min": {
                        "x": 0,
                        "y": 0
                    },
                    "max": {
                        "x": 0,
                        "y": 0
                    }
                };

            if (firstPoint[0] <= lastPoint[0]) {
                returnBounds.min.x = firstPoint[0];
                returnBounds.max.x = lastPoint[0];
            } else {
                returnBounds.max.x = firstPoint[0];
                returnBounds.min.x = lastPoint[0];
            }

            if (firstPoint[1] <= lastPoint[1]) {
                returnBounds.min.y = firstPoint[1];
                returnBounds.max.y = lastPoint[1];
            } else {
                returnBounds.max.y = firstPoint[1];
                returnBounds.min.y = lastPoint[1];
            }
            return returnBounds;
        },

        "_checkIfEquationContainsFunction": function(equationData, functionNames) {
            var leftFunctionsList = equationData.getLeftEquationParameters().functionsList,
                rightFunctionsList = equationData.getRightEquationParameters().functionsList,
                functionsCounter,
                functionFound = false,
                functionsLength = functionNames.length;
            for (functionsCounter = 0; functionsCounter < functionsLength; functionsCounter++) {
                if (leftFunctionsList.indexOf(functionNames[functionsCounter]) !== -1 ||
                    rightFunctionsList.indexOf(functionNames[functionsCounter]) !== -1) {
                    functionFound = true;
                    break;
                }
            }
            return functionFound;
        },

        "prepareInequalityData": function(equationData, graphViewMarkerBounds) {
            var varsToChange = ['x', 'y'],
                solvingParameters = this._getParametersToSolveInequalities(equationData, varsToChange),
                A = solvingParameters.a,
                B = solvingParameters.b,
                C = solvingParameters.c,
                leftInequalityRoot = solvingParameters.inequalityLeftRoot,
                rightInequalityRoot = solvingParameters.inequalityRightRoot,
                nameSpace = MathUtilities.Components.EquationEngine.Models,
                functionCodeA,
                functionCodeB,
                functionCodeC,
                leftFunctionCode,
                rightFunctionCode,
                functionVariable = equationData.getFunctionVariable(),

                inequalityData,
                maxX = this.graphView._getCanvasPointCoordinates([Number(graphViewMarkerBounds.max.x), 0])[0],
                maxY = this.graphView._getCanvasPointCoordinates([0, Number(graphViewMarkerBounds.min.y)])[1],
                minX = 0,
                minY = 0;
            if (equationData.getBlind() !== true) {
                solvingParameters = this._getParametersToSolveInequalities(equationData, varsToChange);

                // A, B and C denote coefficients of quadratic equation
                A = solvingParameters.a;
                B = solvingParameters.b;
                C = solvingParameters.c;
                if (typeof A !== 'undefined') {
                    functionCodeA = nameSpace.TreeProcedures.getInequalityFunctionCode(A, equationData);
                }

                if (typeof B !== 'undefined') {
                    functionCodeB = nameSpace.TreeProcedures.getInequalityFunctionCode(B, equationData);
                }

                if (typeof C !== 'undefined') {
                    functionCodeC = nameSpace.TreeProcedures.getInequalityFunctionCode(C, equationData);
                }
            } else {
                functionCodeA = equationData.getFunctionCodeA();
                functionCodeB = equationData.getFunctionCodeB();
                functionCodeC = equationData.getFunctionCodeC();
            }
            if (typeof leftInequalityRoot !== 'undefined') {
                leftFunctionCode = nameSpace.TreeProcedures.getInequalityFunctionCode(leftInequalityRoot, equationData);
            }

            if (typeof rightInequalityRoot !== 'undefined') {
                rightFunctionCode = nameSpace.TreeProcedures.getInequalityFunctionCode(rightInequalityRoot, equationData);
            }
            if (equationData.getParamVariableOrder() < 2 && this._checkIfEquationContainsFunction(equationData, ['\\log_', '\\ln']) === true) {
                if (functionVariable === 'y') {
                    minX = this.graphView._getCanvasPointCoordinates([0, 0])[0];
                } else {
                    maxY = this.graphView._getCanvasPointCoordinates([0, 0])[1];
                }
            }
            inequalityData = {
                "functionCodeA": functionCodeA,
                "functionCodeB": functionCodeB,
                "functionCodeC": functionCodeC,
                "minX": minX,
                "minY": minY,
                "maxX": maxX,
                "maxY": maxY,
                "leftFunctionCode": leftFunctionCode,
                "rightFunctionCode": rightFunctionCode,
                "inEqualityType": equationData.getInEqualityType(),
                "graphViewMarkerBounds": graphViewMarkerBounds
            };

            return inequalityData;
        },

        "_projectInEqualityPlotsOnCanvas": function(graphPoints, functionVariable, graphViewMarkerBounds) {
            if (typeof graphPoints === 'undefined') {
                return graphPoints;
            }
            var pointCounter,
                pointsLength = graphPoints.length,
                functionVariableIndex,
                currentPoint,
                minFunctionVariableValue = 0,
                maxFunctionVariableValue,
                returnPoints = [];
            if (functionVariable === 'y') {
                functionVariableIndex = 1;
                maxFunctionVariableValue = this.graphView._getCanvasPointCoordinates([0, graphViewMarkerBounds.min.y])[1];
            } else {
                functionVariableIndex = 0;
                maxFunctionVariableValue = this.graphView._getCanvasPointCoordinates([graphViewMarkerBounds.max.x, 0])[0];
            }
            for (pointCounter = 0; pointCounter < pointsLength; pointCounter++) {
                currentPoint = this.graphView._getCanvasPointCoordinates(graphPoints[pointCounter]);
                if (currentPoint[functionVariableIndex] < minFunctionVariableValue) {
                    currentPoint[functionVariableIndex] = minFunctionVariableValue;
                } else if (currentPoint[functionVariableIndex] > maxFunctionVariableValue) {
                    currentPoint[functionVariableIndex] = maxFunctionVariableValue;
                }
                returnPoints.push(currentPoint);
            }
            return returnPoints;
        },

        "prepareInEqualityPlots": function(equationData, graphViewMarkerBounds, segmentsGroup) {
            var equationOrder = equationData.getParamVariableOrder(),
                minX = 0,
                maxX = this.graphView._getCanvasPointCoordinates([Number(graphViewMarkerBounds.max.x), 0])[0],
                minY = 0,
                maxY = this.graphView._getCanvasPointCoordinates([0, Number(graphViewMarkerBounds.min.y)])[1],
                inEqualityPlots = [],
                plots,
                plotCounter,
                plotsLength,
                totaltSegmentGroups,
                currentSetOfPoints,
                functionVariable = equationData.getFunctionVariable(),
                pointsCounter;

            maxX = Math.floor(maxX);
            maxY = Math.floor(maxY);
            if (equationOrder < 2) {
                totaltSegmentGroups = segmentsGroup.length;
                if (this._checkIfEquationContainsFunction(equationData, ['\\log_', '\\ln'])) {
                    if (functionVariable === 'y') {
                        minX = this.graphView._getCanvasPointCoordinates([0, 0])[0];
                    } else {
                        maxY = this.graphView._getCanvasPointCoordinates([0, 0])[1];
                    }
                }
                if (segmentsGroup.length === 1) {
                    segmentsGroup[0].segments = this._projectInEqualityPlotsOnCanvas(segmentsGroup[0].segments, functionVariable, graphViewMarkerBounds);
                    inEqualityPlots.push(this.getLinearContinuousInequalityPlots(segmentsGroup[0].segments, minX, minY, maxX, maxY, functionVariable, segmentsGroup[0].inEqualityType));
                } else {
                    for (pointsCounter = 0; pointsCounter < totaltSegmentGroups; pointsCounter++) {
                        currentSetOfPoints = segmentsGroup[pointsCounter].segments;
                        currentSetOfPoints = this._projectInEqualityPlotsOnCanvas(currentSetOfPoints, functionVariable, graphViewMarkerBounds);
                        inEqualityPlots.push(this.getDiscontinuousInequalityPlots(currentSetOfPoints, minX, minY, maxX, maxY, functionVariable, segmentsGroup[pointsCounter].inEqualityType));
                    }
                }
            } else {
                totaltSegmentGroups = segmentsGroup.length;
                for (pointsCounter = 0; pointsCounter < totaltSegmentGroups; pointsCounter++) {
                    currentSetOfPoints = segmentsGroup[pointsCounter];
                    currentSetOfPoints.firstRoots = this._projectInEqualityPlotsOnCanvas(currentSetOfPoints.firstRoots, functionVariable, graphViewMarkerBounds);
                    currentSetOfPoints.secondRoots = this._projectInEqualityPlotsOnCanvas(currentSetOfPoints.secondRoots, functionVariable, graphViewMarkerBounds);
                    plots = this._getInequalityPlotsForQuadraticFunctions(currentSetOfPoints, equationData, minX, maxX, minY, maxY);
                    plotsLength = plots.length;
                    for (plotCounter = 0; plotCounter < plotsLength; plotCounter++) {
                        inEqualityPlots.push(plots[plotCounter]);
                    }
                }
            }
            equationData.setInEqualityPlots(inEqualityPlots);
        },

        "plotInequalityForquadraticWithOne": function(equationData, plotData) {
            var functionVariable = equationData.getFunctionVariable(),
                solutionSet = equationData.getSolution(),
                minX = plotData.minX,
                inEqualityType = equationData.getInEqualityType(),
                currentInequalityType = inEqualityType,
                functionA = equationData.getA(),
                maxX = plotData.maxX,
                plot1, plot2,
                minY = plotData.minY,
                lineOnePoint,
                lineTwoPoint,
                maxY = plotData.maxY;

            if (isFinite(solutionSet[0]) === false || isFinite(solutionSet[1]) === false) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('ComplexRootInequality');
                return void 0;
            }
            if (functionVariable === 'x') {
                minX = plotData.minY;
                minY = plotData.minX;
                maxX = plotData.maxY;
                maxY = plotData.maxX;
            }

            if (typeof functionA !== 'undefined' && (functionA.sign === '-' || typeof functionA.value !== 'undefined' && functionA.value < 0)) {
                if (['lesser', 'ltequal'].indexOf(currentInequalityType) > -1) {
                    currentInequalityType = 'greater';
                } else {
                    currentInequalityType = 'lesser';
                }
                if (functionVariable === 'y') {
                    lineOnePoint = [this.graphView._getCanvasPointCoordinates([minX, solutionSet[0]]), this.graphView._getCanvasPointCoordinates([maxX, solutionSet[0]])];
                    lineTwoPoint = [this.graphView._getCanvasPointCoordinates([maxX, solutionSet[1]]), this.graphView._getCanvasPointCoordinates([minX, solutionSet[1]])];
                    plot1 = [this.graphView._getCanvasPointCoordinates([maxX, minY]), this.graphView._getCanvasPointCoordinates([minX, minY])];
                    plot2 = [this.graphView._getCanvasPointCoordinates([minX, maxY]), this.graphView._getCanvasPointCoordinates([maxX, maxY])];
                } else {
                    lineOnePoint = [this.graphView._getCanvasPointCoordinates([solutionSet[0], minY]), this.graphView._getCanvasPointCoordinates([solutionSet[0], maxY])];
                    lineTwoPoint = [this.graphView._getCanvasPointCoordinates([solutionSet[1], maxY]), this.graphView._getCanvasPointCoordinates([solutionSet[1], minY])];
                    plot1 = [this.graphView._getCanvasPointCoordinates([minX, maxY]), this.graphView._getCanvasPointCoordinates([minX, minY])];
                    plot2 = [this.graphView._getCanvasPointCoordinates([maxX, minY]), this.graphView._getCanvasPointCoordinates([maxX, maxY])];
                }
            } else {
                if (functionVariable === 'y') {
                    lineOnePoint = [this.graphView._getCanvasPointCoordinates([minX, solutionSet[0]]), this.graphView._getCanvasPointCoordinates([maxX, solutionSet[0]])];
                    lineTwoPoint = [this.graphView._getCanvasPointCoordinates([maxX, solutionSet[1]]), this.graphView._getCanvasPointCoordinates([minX, solutionSet[1]])];
                    plot2 = [this.graphView._getCanvasPointCoordinates([minX, minY]), this.graphView._getCanvasPointCoordinates([maxX, minY])];
                    plot1 = [this.graphView._getCanvasPointCoordinates([maxX, maxY]), this.graphView._getCanvasPointCoordinates([minX, maxY])];
                } else {
                    lineOnePoint = [this.graphView._getCanvasPointCoordinates([solutionSet[0], minY]), this.graphView._getCanvasPointCoordinates([solutionSet[0], maxY])];
                    lineTwoPoint = [this.graphView._getCanvasPointCoordinates([solutionSet[1], maxY]), this.graphView._getCanvasPointCoordinates([solutionSet[1], minY])];
                    plot2 = [this.graphView._getCanvasPointCoordinates([minX, minY]), this.graphView._getCanvasPointCoordinates([minX, maxY])];
                    plot1 = [this.graphView._getCanvasPointCoordinates([maxX, maxY]), this.graphView._getCanvasPointCoordinates([maxX, minY])];
                }
            }
            if (['lesser', 'ltequal'].indexOf(currentInequalityType) > -1) {
                equationData.setInEqualityPlots([lineOnePoint.concat(lineTwoPoint)]);
            } else {
                equationData.setInEqualityPlots([lineOnePoint.concat(plot1), lineTwoPoint.concat(plot2)]);
            }
            equationData.setLeftArray([lineOnePoint, lineTwoPoint]);
            equationData.setRightArray(null);
            this.graphView._addSegments(equationData);
            this.graphView.drawInequalitites(equationData);
            this.graphView.refreshView();
        },

        "_getInequalityPlotsForQuadraticFunctions": function(segmentsGroup, equationData, minX, maxX, minY, maxY) {
            var currentSegmentGroup = segmentsGroup,
                leftSegments = currentSegmentGroup.firstRoots,
                rightSegments = currentSegmentGroup.secondRoots,
                rightFirstPoint,
                rightLastPoint,
                leftFirstPoint,
                leftLastPoint,
                leftFirstPointIntersection,
                leftLastPointIntersection,
                rightFirstPointIntersection,
                rightLastPointIntersection,
                functionVariable = equationData.getFunctionVariable(),
                inEqualityPlots = [],
                plot;

            if (currentSegmentGroup.inEqualityType === 'lesser') {
                plot = [rightSegments[0]];
                plot = plot.concat(leftSegments);
                plot = plot.concat(rightSegments.reverse());
                inEqualityPlots.push(plot);
            } else if (currentSegmentGroup.inEqualityType === 'NanCase') {
                if (functionVariable === 'y') {
                    leftFirstPoint = leftSegments[0][0];
                    leftLastPoint = leftSegments[leftSegments.length - 1][0];
                    plot = [
                        [leftFirstPoint, minY],
                        [leftFirstPoint, maxY],
                        [leftLastPoint, maxY],
                        [leftLastPoint, minY]
                    ];
                    inEqualityPlots.push(plot);
                } else {
                    leftFirstPoint = leftSegments[0][1];
                    leftLastPoint = leftSegments[leftSegments.length - 1][1];
                    plot = [
                        [minX, leftFirstPoint],
                        [maxX, leftFirstPoint],
                        [maxX, leftLastPoint],
                        [minX, leftLastPoint]
                    ];
                    inEqualityPlots.push(plot);
                }
            } else {
                if (rightSegments.length <= 1 || leftSegments.length <= 1) {
                    return inEqualityPlots;
                }
                rightFirstPoint = rightSegments[0];
                if (isNaN(rightFirstPoint[0]) || isNaN(rightFirstPoint[1])) {
                    rightSegments.splice(0, 1);
                    rightFirstPoint = rightSegments[0];
                }
                rightLastPoint = rightSegments[rightSegments.length - 1];
                if (isNaN(rightLastPoint[0]) || isNaN(rightLastPoint[1])) {
                    rightSegments.splice(-1, 1);
                    rightLastPoint = rightSegments[rightSegments.length - 1];
                }
                leftFirstPoint = leftSegments[0];
                if (isNaN(leftFirstPoint[0]) || isNaN(leftFirstPoint[1])) {
                    leftSegments.splice(0, 1);
                    leftFirstPoint = leftSegments[0];
                }
                leftLastPoint = leftSegments[leftSegments.length - 1];
                if (isNaN(leftLastPoint[0]) || isNaN(leftLastPoint[1])) {
                    leftSegments.splice(-1, 1);
                    leftLastPoint = leftSegments[leftSegments.length - 1];
                }
                if (rightSegments.length <= 1 || leftSegments.length <= 1) {
                    return inEqualityPlots;
                }
                leftFirstPointIntersection = this._getPointIntersectionWithBounds(leftFirstPoint, minX, minY, maxX, maxY);
                leftLastPointIntersection = this._getPointIntersectionWithBounds(leftLastPoint, minX, minY, maxX, maxY);
                rightFirstPointIntersection = this._getPointIntersectionWithBounds(rightFirstPoint, minX, minY, maxX, maxY);
                rightLastPointIntersection = this._getPointIntersectionWithBounds(rightLastPoint, minX, minY, maxX, maxY);

                if (functionVariable === 'y') {
                    plot = [];
                    plot.push([leftFirstPoint[0], minY]);
                    plot = plot.concat(leftSegments);
                    if (leftFirstPointIntersection === 'xMin' && leftLastPointIntersection === 'xMin') {
                        plot.push([leftLastPoint[0], maxY]);
                    } else {
                        plot.push([leftLastPoint[0], minY]);
                    }
                    inEqualityPlots.push(plot);
                    plot = [];

                    if (rightFirstPointIntersection === 'xMax' && rightLastPointIntersection === 'xMax') {
                        plot.push([rightFirstPoint[0], minY]);
                    } else {
                        plot.push([rightFirstPoint[0], maxY]);
                    }
                    plot = plot.concat(rightSegments);
                    plot.push([rightLastPoint[0], maxY]);
                    inEqualityPlots.push(plot);
                } else {
                    plot = [];
                    plot.push([maxX, leftFirstPoint[1]]);
                    plot = plot.concat(leftSegments);
                    if (leftFirstPointIntersection === 'yMax' && leftLastPointIntersection === 'yMax') {
                        plot.push([minX, leftLastPoint[1]]);
                    } else {
                        plot.push([maxX, leftLastPoint[1]]);
                    }
                    inEqualityPlots.push(plot);
                    plot = [];

                    if (rightFirstPointIntersection === 'yMin' && rightLastPointIntersection === 'yMin') {
                        plot.push([maxX, rightFirstPoint[1]]);
                    } else {
                        plot.push([minX, rightFirstPoint[1]]);
                    }
                    plot = plot.concat(rightSegments);
                    plot.push([minX, rightLastPoint[1]]);
                    inEqualityPlots.push(plot);
                }
            }
            return inEqualityPlots;
        },

        "getQuadraticDiscontinuousInequalityPlots": function(leftPoints, rightPoints, minX, minY, maxX, maxY, functionVariable, inEqualityType, totalPaths) {
            var inEqualityPlots = [],
                plot = [],
                rightFirstPoint = rightPoints[0],
                leftFirstPoint = leftPoints[0],
                rightLastPoint = rightPoints[rightPoints.length - 1],
                leftLastPoint = leftPoints[leftPoints.length - 1],
                leftFirstPointIntersection = this._getPointIntersectionWithBounds(leftFirstPoint, minX, minY, maxX, maxY),
                leftLastPointIntersection = this._getPointIntersectionWithBounds(leftLastPoint, minX, minY, maxX, maxY),
                rightFirstPointIntersection = this._getPointIntersectionWithBounds(rightFirstPoint, minX, minY, maxX, maxY),
                rightLastPointIntersection = this._getPointIntersectionWithBounds(rightLastPoint, minX, minY, maxX, maxY);

            if (inEqualityType === 'lesser' || inEqualityType === 'ltequal') {
                plot.push(rightFirstPoint);
                if (totalPaths === 1 && leftFirstPointIntersection === 'yMin' && leftLastPointIntersection === 'yMin' && rightFirstPointIntersection === 'yMax' && rightLastPointIntersection === 'yMax') {
                    plot.push([minX, rightFirstPoint[1]], [minX, leftFirstPoint[1]]);
                }
                plot.push(leftFirstPoint);
                plot = plot.concat(leftPoints);
                plot.push(leftLastPoint);
                if (totalPaths === 1 && leftFirstPointIntersection === 'yMin' && leftLastPointIntersection === 'yMin' && rightFirstPointIntersection === 'yMax' && rightLastPointIntersection === 'yMax') {
                    plot.push([maxX, leftLastPoint[1]], [maxX, rightLastPoint[1]]);
                }
                plot.push(rightLastPoint);
                plot = plot.concat(rightPoints.reverse());
                inEqualityPlots.push(plot);
            } else {
                if (functionVariable === 'y') {
                    plot = [];
                    plot.push([leftFirstPoint[0], minY]);
                    plot = plot.concat(leftPoints);
                    if (leftFirstPointIntersection === 'xMin' && leftLastPointIntersection === 'xMin') {
                        plot.push([leftLastPoint[0], maxY]);
                    } else {
                        plot.push([leftLastPoint[0], minY]);
                    }
                    inEqualityPlots.push(plot);
                    plot = [];

                    if (rightFirstPointIntersection === 'xMax' && rightLastPointIntersection === 'xMax') {
                        plot.push([rightFirstPoint[0], minY]);
                    } else {
                        plot.push([rightFirstPoint[0], maxY]);
                    }
                    plot = plot.concat(rightPoints);
                    plot.push([rightLastPoint[0], maxY]);

                    inEqualityPlots.push(plot);
                } else {
                    plot = [];
                    plot.push([maxX, leftFirstPoint[1]]);
                    plot = plot.concat(leftPoints);
                    if (leftFirstPointIntersection === 'yMax' && leftLastPointIntersection === 'yMax') {
                        plot.push([minX, leftLastPoint[1]]);
                    } else {
                        plot.push([maxX, leftLastPoint[1]]);
                    }
                    inEqualityPlots.push(plot);
                    plot = [];
                    if (rightFirstPointIntersection === 'yMin' && rightLastPointIntersection === 'yMin') {
                        plot.push([maxX, rightFirstPoint[1]]);
                    } else {
                        plot.push([minX, rightFirstPoint[1]]);
                    }
                    plot = plot.concat(rightPoints);
                    plot.push([minX, rightLastPoint[1]]);
                    inEqualityPlots.push(plot);
                }
            }
            return inEqualityPlots;
        },

        "getDiscontinuousInequalityPlots": function(points, minX, minY, maxX, maxY, functionVariable, inEqualityType) {
            var inEqualityPlots = [],
                pointsLength = points.length,
                firstPoint = points[0],
                lastPoint = points[pointsLength - 1];

            if (functionVariable === 'y') {
                if (inEqualityType === 'lesser' || inEqualityType === 'ltequal') {
                    inEqualityPlots.push([firstPoint[0], maxY]);
                    inEqualityPlots = inEqualityPlots.concat(points);
                    inEqualityPlots.push([lastPoint[0], maxY]);
                } else {
                    inEqualityPlots.push([firstPoint[0], minY]);
                    inEqualityPlots = inEqualityPlots.concat(points);
                    inEqualityPlots.push([lastPoint[0], minY]);
                }
            } else {
                if (inEqualityType === 'lesser' || inEqualityType === 'ltequal') {
                    inEqualityPlots.push([minX, firstPoint[1]]);
                    inEqualityPlots = inEqualityPlots.concat(points);
                    inEqualityPlots.push([minX, lastPoint[1]]);
                } else {
                    inEqualityPlots.push([maxX, firstPoint[1]]);
                    inEqualityPlots = inEqualityPlots.concat(points);
                    inEqualityPlots.push([maxX, lastPoint[1]]);
                }
            }
            return inEqualityPlots;
        },

        "regressExtremaEdges": function(leftPoint, middlePoint, rightPoint, engine, functionVariable) {
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
            /*eslint-disable no-constant-condition*/
            while (true) {
                /*eslint-enable no-constant-condition*/
                if (functionVariable === 'y') {
                    x1 = this.getCenterOfCoordinates(leftPointX, middlePointX);
                    y1 = engine(x1);
                    x2 = this.getCenterOfCoordinates(middlePointX, rightPointX);
                    y2 = engine(x2);
                    if (!(isFinite(y1) && isFinite(y2))) {
                        return null;
                    }
                    // As x values are so close that we cannot bisect it further.
                    if (x1 === leftPointX || x1 === middlePointX || x2 === middlePointX || x2 === rightPointX) {
                        if (y1 > middlePointY === middlePointY > leftPointY) {
                            return [x1, y1];
                        }
                        if (y2 > middlePointY === middlePointY > leftPointY) {
                            return [x2, y2];
                        }
                        return [middlePointX, middlePointY];
                    }

                    // A flat region has occurred where the slope is constant we take the edges of the flat and take its center.
                    if (y1 === middlePointY || y2 === middlePointY) {
                        return this.getCenterOfFlatRegion(leftPointX, leftPointY, middlePointX, middlePointY, rightPointX, rightPointY, engine, functionVariable);
                    }

                    // We take the edge point which contains zero
                    if (y1 > leftPointY === middlePointY > leftPointY && y1 > leftPointY === y1 > middlePointY) {
                        rightPointX = middlePointX;
                        rightPointY = middlePointY;
                        middlePointX = x1;
                        middlePointY = y1;
                    } else if (y2 > rightPointY === middlePointY > rightPointY && y2 > middlePointY === y2 > rightPointY) {
                        leftPointX = middlePointX;
                        leftPointY = middlePointY;
                        middlePointX = x2;
                        middlePointY = y2;
                    } else {
                        leftPointX = x1;
                        leftPointY = y1;
                        rightPointX = x2;
                        rightPointY = y2;
                    }
                } else {
                    y1 = this.getCenterOfCoordinates(leftPointY, middlePointY);
                    x1 = engine(y1);
                    y2 = this.getCenterOfCoordinates(middlePointY, rightPointY);
                    x2 = engine(y2);

                    if (!(isFinite(x1) && isFinite(x2))) {
                        return null;
                    }

                    // As y values are so close that we cannot bisect it further.
                    if (y1 === leftPointY || y1 === middlePointY || y2 === middlePointY || y2 === rightPointY) {
                        if (x1 > middlePointX === middlePointX > leftPointX) {
                            return [x1, y1];
                        }
                        if (x2 > middlePointX === middlePointX > leftPointX) {
                            return [x2, y2];
                        }
                        return [middlePointX, middlePointY];
                    }

                    // A flat region has occurred where the slope is constant we take the edges of the flat and take its center.
                    if (x1 === middlePointX || x2 === middlePointX) {
                        return this.getCenterOfFlatRegion(leftPointX, leftPointY, middlePointX, middlePointY, rightPointX, rightPointY, engine, functionVariable);
                    }

                    // We take the edge point which contains zero
                    if (x1 > leftPointX === middlePointX > leftPointX && x1 > leftPointX === x1 > middlePointX) {
                        rightPointX = middlePointX;
                        rightPointY = middlePointY;
                        middlePointX = x1;
                        middlePointY = y1;
                    } else if (x2 > rightPointX === middlePointX > rightPointX && x2 > middlePointX === x2 > rightPointX) {
                        leftPointX = middlePointX;
                        leftPointY = middlePointY;
                        middlePointX = x2;
                        middlePointY = y2;
                    } else {
                        leftPointX = x1;
                        leftPointY = y1;
                        rightPointX = x2;
                        rightPointY = y2;
                    }
                }

            }
        },

        "_MAX_FLOAT": 1e-2,
        "getCenterOfCoordinates": function(coordinate1, coordinate2) {
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
            geometricMean = firstCoordinatePosition ? Math.sqrt(coordinate1 * coordinate2) : -Math.sqrt(coordinate1 * coordinate2);
            // if geometric mean does not belong between the points return normal mean
            return geometricMean >= coordinate1 && coordinate2 >= geometricMean ? geometricMean : this.getMean(coordinate1, coordinate2);
        },

        "getMean": function(coordinate1, coordinate2) {
            var HALF = 0.5;
            if (coordinate1 > 0 === coordinate2 > 0) {
                return coordinate1 + HALF * (coordinate2 - coordinate1);
            }
            return HALF * (coordinate1 + coordinate2);
        },

        // Returns the center of the flat curve having constant y value
        "getCenterOfFlatRegion": function(leftPointX, leftPointY, middlePointX, middlePointY, rightPointX, rightPointY, engine, functionVariable) {
            var edge,
                extreme,
                leftSideFlat,
                rightSideFlat,
                temp;
            if (functionVariable === 'y') {
                if (!isFinite(middlePointY)) {
                    return void 0;
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
                } else {
                    leftSideFlat = this.divideCoordinateForConstantValue(leftPointX, leftPointY, middlePointX, middlePointY, engine, middlePointY);
                }
                if (rightPointY === middlePointY) {
                    rightSideFlat = [rightPointX, rightPointY];
                } else {
                    rightSideFlat = this.divideCoordinateForConstantValue(middlePointX, middlePointY, rightPointX, rightPointY, engine, middlePointY);
                }
                extreme = this.getCenterOfCoordinates(leftSideFlat[0], rightSideFlat[0]);
                return [extreme, engine(extreme)];
            }
            if (!isFinite(middlePointX)) {
                return void 0;
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
            } else {
                leftSideFlat = this.divideCoordinateForConstantValue(leftPointY, leftPointX, middlePointY, middlePointX, engine, middlePointX);
                temp = leftSideFlat[0];
                leftSideFlat[0] = leftSideFlat[1];
                leftSideFlat[1] = temp;
            }
            if (rightPointX === middlePointX) {
                rightSideFlat = [rightPointX, rightPointY];
            } else {
                rightSideFlat = this.divideCoordinateForConstantValue(middlePointY, middlePointX, rightPointY, rightPointX, engine, middlePointX);
                temp = rightSideFlat[0];
                rightSideFlat[0] = rightSideFlat[1];
                rightSideFlat[1] = temp;
            }
            extreme = this.getCenterOfCoordinates(leftSideFlat[1], rightSideFlat[1]);
            return [engine(extreme), extreme];
        },

        "getBisectedFiniteValues": function(firstPointX, firstPointY, lastPointX, lastPointY, engine) {
            if (isFinite(firstPointY) === isFinite(lastPointY)) {
                return void 0;
            }
            var xCoordinate,
                yCoordinate;
            /*eslint-disable no-constant-condition*/
            while (true) {
                /*eslint-enable no-constant-condition*/
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
                } else {
                    firstPointX = xCoordinate;
                    firstPointY = yCoordinate;
                }
            }
        },

        "divideCoordinateForConstantValue": function(firstPointX, firstPointY, lastPointX, lastPointY, engine, constant) {
            if (firstPointY === constant === (lastPointY === constant)) {
                return void 0;
            }
            var xCoordinate,
                yCoordinate;
            /*eslint-disable no-constant-condition*/
            while (true) {
                /*eslint-enable no-constant-condition*/
                xCoordinate = this.getCenterOfCoordinates(firstPointX, lastPointX);
                yCoordinate = engine(xCoordinate);

                if (xCoordinate === firstPointX || xCoordinate === lastPointX) {
                    return firstPointY === constant ? [firstPointX, firstPointY] : [lastPointX, lastPointY];
                }

                if (yCoordinate === constant !== (firstPointY === constant)) {
                    lastPointX = xCoordinate;
                    lastPointY = yCoordinate;
                } else {
                    firstPointX = xCoordinate;
                    firstPointY = yCoordinate;
                }
            }

        },


        "findCriticalPoints": function(leftArray, functionVariable, engine, equationData, plotData) {
            if (!leftArray) {
                return [];
            }
            var criticalPoints = [],
                slope,
                nextSlope,
                row = 0,
                pointsCount = 0,
                length,
                x1,
                y1,
                x2,
                y2,
                x3,
                y3,
                rowInf = 0,
                minArray = [],
                maxArray = [],
                secondOrder,
                foundZero,
                X_DIFFERENCE = 0.0001,
                prevSlope,
                thirdSlope,
                prevSecond,
                nextSecond,
                x4,
                y4,
                temp,
                tempx, tempy,
                inflectionArray = [],
                drawInflection = false;
            MathUtilities.Components.EquationEngine.Models.Profile.getStartTime('criticalPoints');
            //to iterate through the rows of initial array
            for (row = 0; row < leftArray.length; row++) {
                pointsCount = 0;
                length = leftArray[row].length;
                if (length > 1) {
                    prevSlope = 0;
                } else {
                    return criticalPoints;
                }

                //to iterate upto end of the row after a critical point found and break

                for (pointsCount = pointsCount; pointsCount < length - 2; pointsCount = pointsCount + 2) {
                    if (drawInflection) {
                        if (functionVariable === 'y') {
                            x1 = leftArray[row][pointsCount - 2];
                            y1 = leftArray[row][pointsCount - 1];
                            x2 = leftArray[row][pointsCount];
                            y2 = leftArray[row][pointsCount + 1];
                            x3 = leftArray[row][pointsCount + 2];
                            y3 = leftArray[row][pointsCount + 3];
                            x4 = leftArray[row][pointsCount + 4];
                            y4 = leftArray[row][pointsCount + 5];
                        } else {
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
                        if (slope < nextSlope && nextSlope > thirdSlope || slope > nextSlope && nextSlope < thirdSlope) {
                            while (foundZero === false) {
                                if (functionVariable === 'y') {
                                    x2 = (x1 + x3) / 2;
                                    y2 = engine(x2);
                                } else {
                                    y2 = (y1 + y3) / 2;
                                    x2 = engine(y2);
                                }
                                slope = (y2 - y1) / (x2 - x1);
                                nextSlope = (y3 - y2) / (x3 - x2);
                                thirdSlope = (y4 - y3) / (x4 - x3);
                                prevSecond = slope - prevSlope;
                                secondOrder = nextSlope - slope;
                                nextSecond = thirdSlope - nextSlope;
                                if (Math.abs(x3 - x2) < X_DIFFERENCE || Math.abs(x2 - x1) < X_DIFFERENCE || Math.abs(x4 - x3) < X_DIFFERENCE) {
                                    break;
                                }
                                if (prevSecond < 0 && nextSecond > 0 || prevSecond > 0 && nextSecond < 0) {
                                    inflectionArray[rowInf] = [x2, y2];
                                    rowInf++;
                                    foundZero = true;
                                } else if (secondOrder > 0) {
                                    if (nextSlope > 0) {
                                        nextSlope = thirdSlope;
                                        x3 = x2;
                                        y3 = y2;
                                    } else {
                                        x1 = x2;
                                        y1 = y2;
                                    }
                                } else if (secondOrder < 0) {
                                    if (slope < 0) {
                                        slope = nextSlope;
                                        x1 = x2;
                                        y1 = y2;
                                    } else {
                                        x3 = x2;
                                        y3 = y2;
                                    }
                                }
                            }
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
                        }
                        if (x2 > x3) {
                            temp = x2;
                            x2 = x3;
                            x3 = temp;
                        }
                    } else {
                        y1 = leftArray[row][pointsCount - 2];
                        x1 = leftArray[row][pointsCount - 1];
                        y2 = leftArray[row][pointsCount];
                        x2 = leftArray[row][pointsCount + 1];
                        y3 = leftArray[row][pointsCount + 2];
                        x3 = leftArray[row][pointsCount + 3];
                        y4 = leftArray[row][pointsCount + 4];
                        x4 = leftArray[row][pointsCount + 5];
                        // for asymptotes
                        if (y1 > y2) {
                            temp = y1;
                            y1 = y2;
                            y2 = temp;
                        }
                        if (y2 > y3) {
                            temp = y2;
                            y2 = y3;
                            y3 = temp;
                        }
                    }

                    slope = (y2 - y1) / (x2 - x1);
                    nextSlope = (y3 - y2) / (x3 - x2);
                    thirdSlope = (y4 - y3) / (x4 - x3);
                    secondOrder = nextSlope - slope;
                    foundZero = false;
                    if (slope > 0 && nextSlope <= 0 || nextSlope > 0 && slope <= 0) {
                        temp = this.regressExtremaEdges([x1, y1], [x2, y2], [x3, y3], engine, functionVariable);
                        if (temp !== null && temp[1] <= plotData.maxY && temp[1] > plotData.minY) {
                            minArray.push(temp);
                            tempx = temp[0];
                            tempy = temp[1];
                            if (functionVariable === 'y') {
                                if (x1 < tempx && tempx < x3) {

                                    leftArray[row].splice(pointsCount, 2, tempx, tempy);
                                }
                            } else {
                                leftArray[row].splice(pointsCount, 0, tempy, tempx);
                            }
                            length = leftArray[row].length;
                            pointsCount = pointsCount + 2;
                        }

                    }
                }

            }
            if (drawInflection) {
                criticalPoints = criticalPoints.concat(minArray, maxArray, inflectionArray);
            } else {
                criticalPoints = criticalPoints.concat(minArray, maxArray);
            }
            return criticalPoints;
        },

        "refinePoint": function(point, engine, shouldBeMax, plottingStep) {
            var step = plottingStep / 20,
                pt1;
            /*eslint-disable no-constant-condition*/
            if (shouldBeMax) {
                while (true) {
                    pt1 = engine(point[0] + step);
                    if (pt1 > point[1]) {
                        point = [point[0] + step, pt1];
                    } else {
                        break;
                    }
                }
                while (true) {
                    pt1 = engine(point[0] - step);
                    if (pt1 > point[1]) {
                        point = [point[0] + step, pt1];
                    } else {
                        break;
                    }
                }
            } else {
                while (true) {
                    pt1 = engine(point[0] + step);
                    if (pt1 < point[1]) {
                        point = [point[0] + step, pt1];
                    } else {
                        break;
                    }
                }
                while (true) {
                    pt1 = engine(point[0] - step);
                    if (pt1 < point[1]) {
                        point = [point[0] + step, pt1];
                    } else {
                        break;
                    }
                }
            }
            /*eslint-enable no-constant-condition*/
            return point;
        },

        /**
         *Adds an image to the grid.
         * imgSrc: it can be url or Raster itself.
         * @method addImage
         * @param imgSrc {Object} Image raster or image source url
         * @param equationData {Object} equationData model object
         * @param position {Array} Image position
         * @param isText {Boolean} flag denoting whether the image is for text
         **/
        "addImage": function(imgSrc, equationData, position, isText) {

            var raster, x, y;
            this.graphView._paperScope.activate();
            if (typeof imgSrc === 'string') {
                if (isText) {
                    this.graphView.activateNewLayer('text');
                } else {
                    this.graphView.activateNewLayer('image');
                }
                //base64...url can be handled but should be avoided..use image-manager
                if (position) {
                    x = position[0] + position[2] / 2;
                    y = position[1] + position[3] / 2;
                    raster = new this.graphView._paperScope.Raster({
                        "source": imgSrc
                    }, [x, y]);
                } else {
                    raster = new this.graphView._paperScope.Raster({
                        "source": imgSrc
                    });
                    x = raster.width / 2;
                    y = raster.height / 2;
                    raster.position = new this.graphView._paperScope.Point(x, y);
                }
                this.graphView.activateEarlierLayer();
            } else {
                //direct raster
                raster = imgSrc;
                raster.position = new this.graphView._paperScope.Point(x, y);
            }
            geomFunctions.nudgeRaster(raster);
            equationData.position = this.graphView._getGraphPointCoordinates([x, y]);
            equationData.setPoints([]);
            equationData.getPoints().push(this.graphView._getGraphPointCoordinates([x, y]));
            equationData.setRaster(raster);
            this.addEquation(equationData);
            equationData.trigger('plotComplete');
            return raster;
        }
    }, {});

    MathUtilities.Components.Graph.Models.inequalityPlottingFunctions = Backbone.Model.extend({}, {
        "getInequalityPlots": function(engineA, engineB, engineC, functionVariable, maxX, minX, maxY, minY, paramVariable, startValue, endValue, step, constants, engine, graphViewMarkerBounds, inEqualityType, plotterView) {
            var triggeringPoint,
                previousInEqualityType = null,
                currentInEqualityType = null,
                segmentGroup,
                segments = [],
                curveXValue,
                currentGraphPoint,
                lhsValue,
                isDiscontinuous,
                lastPoint,
                checkForExponentialIndex,
                pointsCounter,
                leftReturnSegments = [],
                paramVariableIndex,
                curveYValue;

            if (functionVariable === 'y') {
                checkForExponentialIndex = 1;
                paramVariableIndex = 0;
            } else {
                checkForExponentialIndex = 0;
                paramVariableIndex = 1;
            }

            for (pointsCounter = startValue; pointsCounter <= endValue; pointsCounter += step) {
                curveXValue = pointsCounter;
                curveYValue = engine(pointsCounter);
                isDiscontinuous = false;
                if (isNaN(curveYValue)) {
                    if (segments.length <= 1) {
                        segments = [];
                        continue;
                    }
                    isDiscontinuous = true;
                } else {
                    currentGraphPoint = [];
                    currentGraphPoint[paramVariableIndex] = curveXValue;
                    currentGraphPoint[checkForExponentialIndex] = curveYValue;

                    lhsValue = MathUtilities.Components.Graph.Models.inequalityPlottingFunctions._getLhsValueForPoint(currentGraphPoint, engineA, engineB, engineC, functionVariable, graphViewMarkerBounds, paramVariable, constants, inEqualityType, 1, plotterView);
                    if (lhsValue <= 0) {
                        currentInEqualityType = 'lesser';
                    } else if (lhsValue > 0) {
                        currentInEqualityType = 'greater';
                    }
                }
                if (isDiscontinuous || pointsCounter >= endValue - step || previousInEqualityType !== null && currentInEqualityType !== previousInEqualityType) {
                    if (pointsCounter >= endValue - step) {
                        segments.push(currentGraphPoint);
                    }
                    triggeringPoint = MathUtilities.Components.Graph.Models.inequalityPlottingFunctions._findTriggeringPointForInequality(lastPoint, currentGraphPoint, engineA, engineB, engineC, functionVariable, previousInEqualityType, engine, graphViewMarkerBounds, paramVariable, constants, inEqualityType, 1, plotterView);

                    segments.push(triggeringPoint);
                    segmentGroup = {
                        "segments": segments,
                        "inEqualityType": previousInEqualityType
                    };
                    if (inEqualityType === 'greater' || inEqualityType === 'gtequal') {
                        if (previousInEqualityType === 'lesser' || previousInEqualityType === 'ltequal') {
                            segmentGroup.inEqualityType = 'greater';
                        } else {
                            segmentGroup.inEqualityType = 'lesser';
                        }
                    }
                    leftReturnSegments.push(segmentGroup);
                    segments = [triggeringPoint];
                } else {
                    segments.push(currentGraphPoint);
                }
                lastPoint = currentGraphPoint;
                previousInEqualityType = currentInEqualityType;
            }

            if (leftReturnSegments.length === 0 && segments.length > 0) {
                segmentGroup = {
                    "segments": segments,
                    "inEqualityType": previousInEqualityType
                };
                if (inEqualityType === 'greater' || inEqualityType === 'gtequal') {
                    if (previousInEqualityType === 'lesser' || previousInEqualityType === 'ltequal') {
                        segmentGroup.inEqualityType = 'greater';
                    } else {
                        segmentGroup.inEqualityType = 'lesser';
                    }
                }
                leftReturnSegments.push(segmentGroup);
            }

            return leftReturnSegments;
        },

        "getInequalityPlotForQuadratic": function(engine1, engine2, inEqualityType, graphViewMarkerBounds, startValue, endValue, step, minX, minY, maxX, maxY, engineA, engineB, engineC, functionVariable, constants, paramVariable, leftEngine, rightEngine, plotterView) {
            var pointCounter,
                functionVariableIndex,
                paramVariableIndex,
                currentParamVariableValue,
                currentFunctionVariableValue1,
                currentPoint1,
                currentPoint2, tempEngine,
                currentFunctionVariableValue2,
                lhsValue,
                isDiscontinuous,
                previousInEqualityType = null,
                leftSegments = [],
                rightSegments = [],
                segmentsGroup = [],
                segment,
                engineSwitchingDone = false,
                currentInEqualityType,
                triggeringPoint1,
                triggeringPoint2,
                lastPoint;

            if (functionVariable === 'y') {
                functionVariableIndex = 1;
                paramVariableIndex = 0;
            } else {
                functionVariableIndex = 0;
                paramVariableIndex = 1;
            }

            for (pointCounter = startValue; pointCounter <= endValue; pointCounter += step) {
                isDiscontinuous = false;
                currentParamVariableValue = pointCounter;
                currentFunctionVariableValue1 = engine1(currentParamVariableValue);
                currentFunctionVariableValue2 = engine2(currentParamVariableValue);

                currentPoint1 = [];
                currentPoint1[paramVariableIndex] = currentParamVariableValue;
                currentPoint1[functionVariableIndex] = currentFunctionVariableValue1;

                currentPoint2 = [];
                currentPoint2[paramVariableIndex] = currentParamVariableValue;
                currentPoint2[functionVariableIndex] = currentFunctionVariableValue2;

                if (engineSwitchingDone === false && currentFunctionVariableValue1 < currentFunctionVariableValue2) {
                    tempEngine = engine1;
                    engine1 = engine2;
                    engine2 = tempEngine;
                    engineSwitchingDone = true;
                    pointCounter -= step;
                    continue;
                }
                lhsValue = MathUtilities.Components.Graph.Models.inequalityPlottingFunctions._getLhsValueForPoint(currentPoint1, engineA, engineB, engineC, functionVariable, graphViewMarkerBounds, paramVariable, constants, inEqualityType, 2, plotterView);

                if (lhsValue <= 0) {
                    currentInEqualityType = 'lesser';
                } else if (isNaN(lhsValue)) {
                    currentInEqualityType = 'NanCase';
                } else {
                    currentInEqualityType = 'greater';
                }
                if (isDiscontinuous || pointCounter >= endValue - step || previousInEqualityType !== null && currentInEqualityType !== previousInEqualityType) {
                    if (pointCounter >= endValue - step) {
                        leftSegments.push(currentPoint1);
                        rightSegments.push(currentPoint2);
                    }
                    triggeringPoint1 = MathUtilities.Components.Graph.Models.inequalityPlottingFunctions._findTriggeringPointForInequality(lastPoint, currentPoint1, engineA, engineB, engineC, functionVariable, previousInEqualityType, engine1, graphViewMarkerBounds, paramVariable, constants, inEqualityType, 2, plotterView);
                    if (previousInEqualityType === 'NanCase') {
                        triggeringPoint1 = MathUtilities.Components.Graph.Models.inequalityPlottingFunctions._findTriggeringPointForNanCase(triggeringPoint1, currentPoint1, engine1, paramVariableIndex, functionVariableIndex, currentPoint1, plotterView);
                    }

                    triggeringPoint2 = [];
                    triggeringPoint2[paramVariableIndex] = triggeringPoint1[paramVariableIndex];
                    triggeringPoint2[functionVariableIndex] = engine2(triggeringPoint1[functionVariableIndex]);
                    leftSegments.push(triggeringPoint1);
                    rightSegments.push(triggeringPoint2);

                    segment = {
                        "firstRoots": leftSegments,
                        "secondRoots": rightSegments,
                        "inEqualityType": previousInEqualityType
                    };
                    if (previousInEqualityType === 'NanCase') {
                        segmentsGroup = segmentsGroup.concat(MathUtilities.Components.Graph.Models.inequalityPlottingFunctions._processInequalityNanCases(segment, leftEngine, rightEngine, inEqualityType, constants, functionVariable, paramVariable, plotterView));
                    } else {
                        segmentsGroup.push(segment);
                    }
                    leftSegments = [triggeringPoint1];
                    rightSegments = [triggeringPoint2];

                } else {
                    leftSegments.push(currentPoint1);
                    rightSegments.push(currentPoint2);
                }
                lastPoint = currentPoint1;
                previousInEqualityType = currentInEqualityType;
            }

            return segmentsGroup;
        },

        "_findTriggeringPointForNanCase": function(firstPoint, secondPoint, engine, paramVariableIndex, functionVariableIndex, lastValidPoint, plotterView) {
            if (firstPoint[paramVariableIndex].toFixed(5) === secondPoint[paramVariableIndex].toFixed(5)) {
                return lastValidPoint;
            }

            var newParamVariableValue,
                newFunctionVariableValue,
                validPoint;

            newParamVariableValue = plotterView.getCenterOfCoordinates(firstPoint[paramVariableIndex], secondPoint[paramVariableIndex]);
            newFunctionVariableValue = engine(newParamVariableValue);
            validPoint = [];
            validPoint[paramVariableIndex] = newParamVariableValue;
            validPoint[functionVariableIndex] = newFunctionVariableValue;
            if (isFinite(newFunctionVariableValue)) {
                validPoint = MathUtilities.Components.Graph.Models.inequalityPlottingFunctions._findTriggeringPointForNanCase(validPoint, secondPoint, engine, paramVariableIndex, functionVariableIndex, validPoint, plotterView);
            } else {
                validPoint = MathUtilities.Components.Graph.Models.inequalityPlottingFunctions._findTriggeringPointForNanCase(firstPoint, validPoint, engine, paramVariableIndex, functionVariableIndex, lastValidPoint, plotterView);
            }
            return validPoint;
        },

        "_cleanArrayFromNanValues": function(points) {
            var pointCounter,
                pointsLength = points.length,
                returnPoints = [],
                currentPoint;

            for (pointCounter = 0; pointCounter < pointsLength; pointCounter++) {
                currentPoint = points[pointCounter];
                if (isFinite(currentPoint[0]) && isFinite(currentPoint[1])) {
                    returnPoints.push(currentPoint);
                }
            }
            return returnPoints;
        },

        "_processInequalityNanCases": function(segmentGroup, leftEngine, rightEngine, inEqualityType, constants, functionVariable, paramVariable) {
            var variables = {
                    "x": null,
                    "y": null
                },
                satisfiesCondition,
                newSegments = [],
                plotObject,
                returnSegments = [],
                segments = segmentGroup.firstRoots,
                pointsCounter, currentConstant,
                paramVariableIndex = functionVariable === 'y' ? 0 : 1,
                pointsLength = segments.length,
                currentPoint;
            for (currentConstant in constants) {
                variables[currentConstant] = constants[currentConstant];
            }

            for (pointsCounter = 0; pointsCounter < pointsLength; pointsCounter++) {
                currentPoint = segments[pointsCounter];
                variables[paramVariable] = currentPoint[paramVariableIndex];
                variables[functionVariable] = -1;

                switch (inEqualityType) {
                    case 'lesser':
                    case 'ltequal':
                        satisfiesCondition = leftEngine(variables) <= rightEngine(variables);
                        break;
                    case 'greater':
                    case 'gtequal':
                        if (isFinite(leftEngine(variables)) === false || isFinite(rightEngine(variables)) === false) {
                            satisfiesCondition = true;
                        } else {
                            satisfiesCondition = leftEngine(variables) >= rightEngine(variables);
                        }
                        break;
                }
                if (satisfiesCondition === true && pointsCounter < pointsLength - 1) {
                    newSegments.push(currentPoint);
                } else {
                    if (newSegments.length > 1) {
                        plotObject = {
                            "firstRoots": newSegments,
                            "inEqualityType": 'NanCase',
                            "secondRoots": newSegments
                        };
                        returnSegments.push(plotObject);
                    }
                    newSegments = [];
                }
            }
            return returnSegments;
        },

        "_findTriggeringPointForInequality": function(firstPoint, secondPoint, engineA, engineB, engineC, functionVariable, previousInequalityType, engine, graphViewMarkerBounds, paramVariable, equationConstants, inEqualityType, equationOrder, plotterView) {
            var newPointX,
                newPointY,
                lhsValue,
                returnPoint;
            if (functionVariable === 'y') {
                newPointX = plotterView.getCenterOfCoordinates(firstPoint[0], secondPoint[0]);
                newPointY = engine(newPointX);
                if (isFinite(newPointY) === false) {
                    return firstPoint;
                }
                if (firstPoint[0].toFixed(5) === newPointX.toFixed(5) || secondPoint[0].toFixed(5) === newPointX.toFixed(5)) {
                    return [newPointX, newPointY];
                }
            } else {
                newPointY = plotterView.getCenterOfCoordinates(firstPoint[1], secondPoint[1]);
                newPointX = engine(newPointY);
                if (firstPoint[1] === newPointY || secondPoint[1] === newPointY) {
                    return [newPointX, newPointY];
                }
            }
            lhsValue = MathUtilities.Components.Graph.Models.inequalityPlottingFunctions._getLhsValueForPoint([newPointX, newPointY], engineA, engineB, engineC, functionVariable, graphViewMarkerBounds, paramVariable, equationConstants, inEqualityType, equationOrder, plotterView);
            if (lhsValue <= 0) {
                inEqualityType = 'lesser';
            } else if (equationOrder === 2 && isNaN(lhsValue) === true) {
                inEqualityType = 'NanCase';
            } else {
                inEqualityType = 'greater';
            }
            if (previousInequalityType === inEqualityType) {
                returnPoint = MathUtilities.Components.Graph.Models.inequalityPlottingFunctions._findTriggeringPointForInequality([newPointX, newPointY], secondPoint, engineA, engineB, engineC, functionVariable, previousInequalityType, engine, graphViewMarkerBounds, paramVariable, equationConstants, inEqualityType, equationOrder, plotterView);
            } else {
                returnPoint = MathUtilities.Components.Graph.Models.inequalityPlottingFunctions._findTriggeringPointForInequality(firstPoint, [newPointX, newPointY], engineA, engineB, engineC, functionVariable, previousInequalityType, engine, graphViewMarkerBounds, paramVariable, equationConstants, inEqualityType, equationOrder, plotterView);
            }
            return returnPoint;
        },

        "_getLhsValueForPoint": function(point, engineA, engineB, engineC, functionVariable, graphViewMarkerBounds, paramVariable, equationConstants, inequalityType, equationOrder) {
            var curveXValue = point[0],
                curveYValue = point[1],
                functionVariableValue,
                valueA,
                valueB,
                valueC,
                currentConstant,
                maxFunctionValue = graphViewMarkerBounds.max[paramVariable],
                minFunctionValue = graphViewMarkerBounds.min[paramVariable],
                lhsValue = 0,
                DIVISION_FACTOR = 2000,
                tolerance = (Math.abs(maxFunctionValue) + Math.abs(minFunctionValue)) / DIVISION_FACTOR,
                constants;

            if (functionVariable === 'y') {
                constants = {
                    "x": curveXValue
                };
                if ((inequalityType === 'greater' || inequalityType === 'gtequal') && equationOrder === 2) {
                    functionVariableValue = curveYValue + tolerance;
                } else {
                    functionVariableValue = curveYValue - tolerance;
                }
            } else {
                constants = {
                    "y": curveYValue
                };
                if ((inequalityType === 'greater' || inequalityType === 'gtequal') && equationOrder === 2) {
                    functionVariableValue = curveXValue + tolerance;
                } else {
                    functionVariableValue = curveXValue - tolerance;
                }
            }

            for (currentConstant in equationConstants) {
                constants[currentConstant] = equationConstants[currentConstant];
            }

            if (typeof engineA !== 'undefined') {
                valueA = engineA(constants);
                valueA = Math.pow(functionVariableValue, 2) * valueA;
                lhsValue += valueA;

            }
            if (typeof engineB !== 'undefined') {
                valueB = engineB(constants);
                valueB = functionVariableValue * valueB;
                lhsValue += valueB;
            }
            if (typeof engineC !== 'undefined') {
                valueC = engineC(constants);
                lhsValue += valueC;
            }
            return lhsValue;
        }
    });


    MathUtilities.Components.Graph.Models.plottingFunctions = Backbone.Model.extend({}, {
        "_graphView": null,

        "generateSimplePlot": function(engine, plotData) {
            var plottingFunctions = MathUtilities.Components.Graph.Models.plottingFunctions,
                plot = plottingFunctions.getPlotObject(plotData);

            plottingFunctions.addPoint(plot, plotData.minX, engine(plotData.minX));
            plottingFunctions.addPoint(plot, plotData.maxX, engine(plotData.maxX));
            plottingFunctions.finishSegment(plot);
            return plot.lines;
        },

        "convertPolarToCartesian": function(arrPolar) {
            var arrCart, segment, newSeg, i, j;
            arrCart = [];
            segment = [];
            for (i = 0; i < arrPolar.length; i++) {
                segment = arrPolar[i];
                newSeg = [];
                for (j = 0; j < segment.length - 1; j += 2) {
                    if (isFinite(segment[j]) && isFinite(segment[j + 1])) {
                        newSeg.push(segment[j + 1] * Math.cos(segment[j]), segment[j + 1] * Math.sin(segment[j]));
                    }
                }

                arrCart.push(newSeg);

            }
            return arrCart;
        },

        "addPoint": function(plot, x, y) {
            var point = [x, y],
                lastPoint,
                currentPivot = plot.basePoint;

            if (!plot.temporaryLines) {
                plot.temporaryLines = [point[0], point[1]];
                return void 0;
            }
            if (!currentPivot) {
                plot.basePoint = point;
                plot.unsettledPoint = point;
                return void 0;
            }

            lastPoint = [plot.temporaryLines[plot.temporaryLines.length - 2], plot.temporaryLines[plot.temporaryLines.length - 1]];

            if (!this.changePivot(lastPoint, currentPivot, point, plot.toleranceX, plot.toleranceY)) {
                this.removeUnsettledPoints(plot);
                plot.basePoint = point;
            }

            plot.unsettledPoint = point;
        },

        "removeUnsettledPoints": function(plot) {
            if (plot.unsettledPoint) {
                plot.temporaryLines.push(plot.unsettledPoint[0], plot.unsettledPoint[1]);
                plot.basePoint = null;
                plot.unsettledPoint = null;
            }
        },
        "discontinuosPointAlreadyPresent": function(currentPoint, discontinuosArray) {
            var count, length = discontinuosArray.length,
                isPresent = false,
                xdifference, ydifference, THRESHOLD = 0.01;
            if (length === 0) {
                return isPresent;
            }
            for (count = 0; count < length; count++) {
                xdifference = Math.abs(currentPoint[0] - discontinuosArray[count][0]);
                ydifference = Math.abs(currentPoint[1] - discontinuosArray[count][1]);
                if (xdifference < THRESHOLD && ydifference < THRESHOLD) {
                    isPresent = true;
                    discontinuosArray.splice(count, 1);
                    break;
                }
            }

            return isPresent;
        },
        "_checkForDiscontinuity": function(point, engine, paramVariable, step, order) {
            if (order === 2) {
                return point;
            }

            var orgPoint = point.slice(),
                coord,
                engineOutPut,
                TOLERANCE_MIN_1 = 1e-100,
                TOLERANCE_MIN_2 = 1e-50,
                TOLERANCE_MAX = 1e+30,
                LIMIT = 14,
                point2 = [],
                stepCounter, pointCoord,
                yCoord,
                MAX_COUNT = 10;
            step /= 10;
            if (paramVariable === 'x') {
                coord = 0;
                yCoord = 1;
            } else {
                coord = 1;
                yCoord = 0;
            }
            pointCoord = point[coord].toString();
            if (pointCoord.indexOf('e') === -1) {
                pointCoord = Number(pointCoord);
                point[coord] = Number(pointCoord.toFixed(LIMIT));
            }
            if (Math.abs(point[coord] - 0) < TOLERANCE_MIN_1) {
                point[coord] = 0;
            }
            engineOutPut = engine(point[coord]);
            if (isNaN(engineOutPut)) {
                point[yCoord] = engineOutPut;
                return point;
            }
            if (!isFinite(engineOutPut)) {
                point[coord] = orgPoint[coord];
                point[yCoord] = engineOutPut;
                return point;
            }
            //step function check
            if (engineOutPut !== point[yCoord]) {
                return orgPoint;
            }
            if (engineOutPut > TOLERANCE_MAX) {
                point[coord] = orgPoint[coord];
                point[yCoord] = Infinity;
                return point;
            }
            //for xlogx hollow point
            if (engineOutPut < TOLERANCE_MIN_2 && point[coord] < TOLERANCE_MIN_2 && engineOutPut > -TOLERANCE_MIN_2 && point[coord] > -TOLERANCE_MIN_2 && engineOutPut !== 0 && point[coord] !== 0) {
                point[coord] = 0;
                point[yCoord] = engine(0);
                return point;
            }
            point2[coord] = point[coord] + step;

            for (stepCounter = 0; stepCounter < MAX_COUNT; stepCounter++) {
                point[coord] += step;
                engineOutPut = engine(point[coord]);
                if (isNaN(engineOutPut)) {
                    return orgPoint;
                }
                if (!isFinite(engineOutPut)) {
                    point[coord] = orgPoint[coord];
                    point[yCoord] = engineOutPut;
                    return point;
                }
                if (engineOutPut > TOLERANCE_MAX) {
                    point[coord] = orgPoint[coord];
                    point[yCoord] = Infinity;
                    return point;
                }
            }

            return orgPoint;
        },
        "addDiscontinuousPoint": function(data) {
            var foundPoint = [],
                x = 0,
                insideRange,
                functionVariable = data.functionVariable,
                point = data.point,
                plotData = data.plotData,
                hasInclude = data.hasInclude,
                isPointAdded = data.isPointAdded,
                rangeVariable = data.rangeVariable,
                hollowPoints = data.hollowPoints,
                discontinousPoints = data.discontinousPoints,
                y = 1,
                step = data.step,
                maxX = plotData.maxX,
                maxY = plotData.maxY,
                minX = plotData.minX,
                minY = plotData.minY,
                xCoord = x,
                yCoord = y;
            if (functionVariable === 'y') {
                insideRange = point[y] <= maxY && point[y] >= minY &&
                    point[x] <= maxX && point[x] >= minX;
            } else {
                insideRange = point[y] <= maxX && point[y] >= minX &&
                    point[x] <= maxY && point[x] >= minY;
            }
            if (insideRange || isPointAdded) {
                if (functionVariable === 'x' && !isPointAdded) {
                    foundPoint[1] = point[x];
                    foundPoint[0] = point[y];
                } else {
                    foundPoint = point.slice();
                }
                if (hasInclude) {
                    insideRange = true;
                } else {
                    if (functionVariable === 'y') {
                        insideRange = point[y] <= maxY - step && point[y] >= minY + step &&
                            point[x] <= maxX - step && point[x] >= minX + step;
                    } else {
                        insideRange = point[y] <= maxX - step && point[y] >= minX + step &&
                            point[x] <= maxY - step && point[x] >= minY + step;
                    }
                }
                if (insideRange) {
                    discontinousPoints.push(foundPoint.slice());
                } else {
                    hollowPoints.points.push(foundPoint.slice());
                    hollowPoints.displayPoints.push(foundPoint.slice());
                }
            }
        },

        "calculateDiscontinuousPoint": function(dataObject) {
            var x = 0,
                pointAdded = false,
                temp = [],
                reqEngine = dataObject.engine,
                point = dataObject.point,
                equationRange = dataObject.equationRange,
                plot = dataObject.plot,
                checkForMinMax = dataObject.checkForMinMax,
                rangeLimit,
                data = {
                    "functionVariable": plot.functionVariable,
                    "point": null,
                    "plotData": dataObject.domain,
                    "hasInclude": null,
                    "isPointAdded": null,
                    "rangeVariable": null,
                    "hollowPoints": plot.hollowPoints,
                    "discontinousPoints": plot.discontinousPoints,
                    "step": plot.domain.step
                },
                y = 1;
            rangeLimit = equationRange.variable === 'x' ? point[x] : point[y];
            if (equationRange.min !== null && (checkForMinMax === 'min' || !checkForMinMax)) {
                temp = point.slice();
                pointAdded = true;
                data.point = temp.slice();
                data.isPointAdded = pointAdded;
                if (equationRange.rangeForFunctionVariable && equationRange.rangeForFunctionVariable.min !== null &&
                    equationRange.rangeForFunctionVariable.min.value === rangeLimit) {
                    data.hasInclude = equationRange.rangeForFunctionVariable.min.include;
                    data.rangeVariable = equationRange.rangeForFunctionVariable.variable;
                    this.addDiscontinuousPoint(data);
                    return;
                }
                data.hasInclude = equationRange.min.include;
                data.rangeVariable = equationRange.variable;
                this.addDiscontinuousPoint(data);
                return;
            }
            if (equationRange.max !== null && (checkForMinMax === 'max' || !checkForMinMax)) {
                temp = point.slice();
                pointAdded = true;
                data.point = temp.slice();
                data.isPointAdded = pointAdded;
                if (equationRange.rangeForFunctionVariable && equationRange.rangeForFunctionVariable.max !== null &&
                    equationRange.rangeForFunctionVariable.max.value === rangeLimit) {
                    data.hasInclude = equationRange.rangeForFunctionVariable.max.include;
                    data.rangeVariable = equationRange.rangeForFunctionVariable.variable;
                    this.addDiscontinuousPoint(data);
                    return;
                }
                data.hasInclude = equationRange.max.include;
                data.rangeVariable = equationRange.variable;
                this.addDiscontinuousPoint(data);
            }

        },

        "finishSegment": function(plot, hasDiscontinousPoints, graphViewMarkerBound, hasArr2, engine, equationRange) {

            MathUtilities.Components.Graph.Models.plottingFunctions.removeUnsettledPoints(plot);
            var lines, line, i,
                arrILength, arrI,
                xCoord = 0,
                yCoord = 1,
                currentPoint = [],
                equationOrder = 1,
                equationParamVariable = plot.paramVariable,
                rangePointObj = {
                    "engine": null,
                    "point": null,
                    "equationRange": null,
                    "plot": null,
                    "domain": null,
                    "checkForMinMax": null
                },
                temp, lastXCoord, lastYCoord;
            rangePointObj.domain = plot.domain;
            if (hasArr2) {
                equationOrder = 2; //order/degree of equation is 2
            }
            if (equationParamVariable === 'y') {
                xCoord = 1;
                yCoord = 0;
            }
            if (plot.temporaryLines) {
                lines = MathUtilities.Components.Graph.Models.plottingFunctions.fitPointsInsideDomain(plot, plot.temporaryLines);
                if (typeof plot.discontinousPoints === 'undefined') {
                    plot.discontinousPoints = [];
                }
                if (typeof plot.hollowPoints === 'undefined') {
                    plot.hollowPoints = {};
                    plot.hollowPoints.points = [];
                    plot.hollowPoints.displayPoints = [];
                }
                rangePointObj.equationRange = equationRange;
                rangePointObj.plot = plot;
                for (i = 0; i < lines.length; i++) {
                    if (lines[i].length < 2) { // Cannot draw curve if no of points is less than 2
                        continue;
                    }
                    arrI = lines[i];
                    arrILength = lines[i].length;
                    lastXCoord = arrILength - 2; // to get the x coordinate of last point
                    lastYCoord = arrILength - 1; // to get the y coordinate of last point
                    if (equationParamVariable === 'y') {
                        lastXCoord = arrILength - 1; // to get the x coordinate of last point for param variable 'y'
                        lastYCoord = arrILength - 2; // to get the y coordinate of last point for param variable 'y'
                    }
                    if (hasDiscontinousPoints) {
                        if (arrI[xCoord] > graphViewMarkerBound.min.x && arrI[xCoord] < graphViewMarkerBound.max.x && (arrI[yCoord] > graphViewMarkerBound.min.y &&
                                arrI[yCoord] < graphViewMarkerBound.max.y)) {
                            currentPoint = [arrI[xCoord], arrI[yCoord]];
                            if (hasArr2) {
                                if (this.discontinuosPointAlreadyPresent(currentPoint, plot.discontinousPoints) === false) {
                                    temp = this._checkForDiscontinuity(currentPoint.slice(), engine, plot.paramVariable, -plot.domain.step, equationOrder);
                                    if (isNaN(temp[0]) || isNaN(temp[1]) || !isFinite(temp[0]) || !isFinite(temp[1])) {
                                        plot.hollowPoints.displayPoints.push(temp);
                                        plot.hollowPoints.points.push(currentPoint);
                                    } else {
                                        plot.discontinousPoints.push(currentPoint);
                                    }
                                }
                            } else {
                                temp = this._checkForDiscontinuity(currentPoint.slice(), engine, plot.paramVariable, -plot.domain.step, equationOrder);
                                if (isNaN(temp[0]) || isNaN(temp[1]) || !isFinite(temp[0]) || !isFinite(temp[1])) {
                                    plot.hollowPoints.displayPoints.push(temp);
                                    plot.hollowPoints.points.push(currentPoint);
                                } else {
                                    plot.discontinousPoints.push(currentPoint);
                                }
                            }
                        } else if (equationRange) {
                            //addRange points min point
                            currentPoint = [arrI[xCoord], arrI[yCoord]];
                            rangePointObj.engine = engine;
                            rangePointObj.point = currentPoint.slice();
                            rangePointObj.checkForMinMax = 'min';
                            this.calculateDiscontinuousPoint(rangePointObj);
                        }
                        if (arrI[lastXCoord] > graphViewMarkerBound.min.x &&
                            arrI[lastXCoord] < graphViewMarkerBound.max.x &&
                            (arrI[lastYCoord] > graphViewMarkerBound.min.y && arrI[lastYCoord] < graphViewMarkerBound.max.y)) {
                            currentPoint = [arrI[lastXCoord], arrI[lastYCoord]];
                            if (hasArr2) {
                                if (this.discontinuosPointAlreadyPresent(currentPoint, plot.discontinousPoints) === false) {
                                    temp = this._checkForDiscontinuity(currentPoint.slice(), engine, plot.paramVariable, plot.domain.step, equationOrder);
                                    if (isNaN(temp[0]) || isNaN(temp[1]) || !isFinite(temp[0]) || !isFinite(temp[1])) {
                                        plot.hollowPoints.displayPoints.push(temp);
                                        plot.hollowPoints.points.push(currentPoint);
                                    } else {
                                        plot.discontinousPoints.push(currentPoint);
                                    }
                                }
                            } else {
                                temp = this._checkForDiscontinuity(currentPoint.slice(), engine, plot.paramVariable, plot.domain.step, equationOrder);
                                if (isNaN(temp[0]) || isNaN(temp[1]) || !isFinite(temp[0]) || !isFinite(temp[1])) {
                                    plot.hollowPoints.displayPoints.push(temp);
                                    plot.hollowPoints.points.push(currentPoint);
                                } else {
                                    plot.discontinousPoints.push(currentPoint);
                                }
                            }
                        } else if (equationRange) {
                            //addRange points max point
                            currentPoint = [arrI[lastXCoord], arrI[lastYCoord]];
                            rangePointObj.engine = engine;
                            rangePointObj.point = currentPoint.slice();
                            rangePointObj.checkForMinMax = 'max';
                            this.calculateDiscontinuousPoint(rangePointObj);
                        }
                    }
                    line = MathUtilities.Components.Graph.Models.plottingFunctions.translateSegment(plot, lines[i], this._graphView);
                    plot.lines.push(line);
                    if (!plot.tempArr) {
                        plot.tempArr = [];
                    }
                    plot.tempArr.push(lines[i]);
                }

                geomFunctions.traceConsole(plot.tempArr);
                plot.temporaryLines = null;
            } else {
                if (!plot.tempArr) {
                    plot.tempArr = [];
                }
            }

        },



        "translateSegment": function(plot, segment, graphView) {
            var point, i,
                newsegment = [];

            for (i = 0; i < segment.length - 1; i += 2) {

                if (plot.paramVariable === 'x') {
                    point = [segment[i], segment[i + 1]];
                } else {
                    point = [segment[i + 1], segment[i]];
                }

                if (graphView) {
                    point = graphView._getCanvasPointCoordinates(point);
                } else {
                    point = plot.gridGraph._getCanvasPointCoordinates(point);
                }
                newsegment.push(point);
            }
            return newsegment;
        },

        "projectPointOnDomain": function(plot, lastPointX, lastPointY, x, y) {

            var outCodeNew = geomFunctions.calculateLineOutCode(x, y, plot.domain.minX, plot.domain.maxX, plot.domain.minY, plot.domain.maxY),
                outCodeLast = geomFunctions.calculateLineOutCode(lastPointX, lastPointY, plot.domain.minX, plot.domain.maxX, plot.domain.minY, plot.domain.maxY),
                dlx1, dlx2, dly1, dly2, side, intersect;

            if (outCodeNew === outCodeLast || outCodeLast !== 0 && outCodeNew !== 0) {
                return void 0;
            }

            side = outCodeLast || outCodeNew;

            //LEFT = 1, RIGHT = 2, BOTTOM = 4, TOP = 8
            switch (side) {
                case 1:
                    dlx1 = plot.domain.minX;
                    dlx2 = plot.domain.minX;
                    dly1 = plot.domain.minY;
                    dly2 = plot.domain.maxY;
                    break;

                case 2:
                    dlx1 = plot.domain.maxX;
                    dlx2 = plot.domain.maxX;
                    dly1 = plot.domain.minY;
                    dly2 = plot.domain.maxY;
                    break;

                case 4:
                    dlx1 = plot.domain.minX;
                    dlx2 = plot.domain.maxX;
                    dly1 = plot.domain.minY;
                    dly2 = plot.domain.minY;
                    break;

                case 8:
                    dlx1 = plot.domain.minX;
                    dlx2 = plot.domain.maxX;
                    dly1 = plot.domain.maxY;
                    dly2 = plot.domain.maxY;
                    break;


                default:

                    return void 0;
            }
            intersect = geomFunctions.intersectionOfLines(dlx1, dly1, dlx2, dly2, lastPointX, lastPointY, x, y);
            return intersect;
        },

        "fitPointsInsideDomain": function(plot, segment) {
            if (!segment || segment.length < 2) {
                return void 0;
            }
            var i,
                lastX, lastY,
                lastDomain, currentDomain,
                currentSegment = [],
                dividedSegments = [currentSegment],
                slope,
                intersection,
                lastPushed = false;

            function getIntersectionWithSide(x1, y1, x2, y2, side, plot) {
                var dlx1, dlx2, dly1, dly2;

                switch (side) {
                    case 1:
                        dlx1 = plot.domain.minX;
                        dlx2 = plot.domain.minX;
                        dly1 = plot.domain.minY;
                        dly2 = plot.domain.maxY;
                        break;

                    case 2:
                        dlx1 = plot.domain.maxX;
                        dlx2 = plot.domain.maxX;
                        dly1 = plot.domain.minY;
                        dly2 = plot.domain.maxY;
                        break;

                    case 4:
                        dlx1 = plot.domain.minX;
                        dlx2 = plot.domain.maxX;
                        dly1 = plot.domain.minY;
                        dly2 = plot.domain.minY;
                        break;

                    case 8:
                        dlx1 = plot.domain.minX;
                        dlx2 = plot.domain.maxX;
                        dly1 = plot.domain.maxY;
                        dly2 = plot.domain.maxY;
                        break;
                    default:

                        return void 0;
                }
                slope = (x1 - x2) * (dly1 - dly2) - (y1 - y2) * (dlx1 - dlx2);

                if (slope === Infinity || slope === -Infinity) {
                    intersection = [x1, dly1];
                } else {
                    intersection = geomFunctions.intersectionOfLines(x1, y1, x2, y2, dlx1, dly1, dlx2, dly2);
                }
                return intersection;
            }

            function getIntersectionWithSides(x1, y1, x2, y2, side, plot) {
                if (side === 0) {
                    return void 0;
                }
                var intersection1, intersection2, out1, sides;

                sides = [];
                if (side & 1) {
                    sides.push(1);
                }
                if (side & 2) {
                    sides.push(2);
                }
                if (side & 4) {
                    sides.push(4);
                }
                if (side & 8) {
                    sides.push(8);
                }
                intersection1 = getIntersectionWithSide(x1, y1, x2, y2, sides[0], plot);

                if (sides.length > 1) {
                    out1 = geomFunctions.calculateLineOutCode(intersection1[0], intersection1[1], plot.domain.minX, plot.domain.maxX, plot.domain.minY, plot.domain.maxY);
                    intersection2 = getIntersectionWithSide(x1, y1, x2, y2, sides[1], plot);
                    if (out1 !== 0 && !(out1 & out1 - 1)) {
                        return intersection1;
                    }
                    return intersection2;
                }
                return intersection1;
            }
            lastPushed = false;
            for (i = 0; i < segment.length - 1; i += 2) {
                if (segment[i] === lastX && segment[i + 1] === lastY) {
                    continue;
                }
                currentDomain = geomFunctions.calculateLineOutCode(segment[i], segment[i + 1], plot.domain.minX, plot.domain.maxX, plot.domain.minY, plot.domain.maxY);
                if (lastX === void 0) {

                    lastX = segment[i];
                    lastY = segment[i + 1];
                    if (currentDomain === 0) {
                        lastPushed = true;
                        currentSegment.push(segment[i], segment[i + 1]);
                    }
                    lastDomain = currentDomain;
                    continue;
                }
                if (currentDomain & lastDomain) {
                    //totally outside so return

                    if (lastPushed) {
                        lastPushed = false;
                        currentSegment = [];
                        dividedSegments.push(currentSegment);
                    }

                } else if (currentDomain !== lastDomain) {

                    if (lastDomain !== 0) {
                        intersection = getIntersectionWithSides(segment[i], segment[i + 1], lastX, lastY, lastDomain, plot);
                        currentSegment.push(intersection[0], intersection[1]);

                    }

                    if (currentDomain !== 0) {
                        intersection = getIntersectionWithSides(segment[i], segment[i + 1], lastX, lastY, currentDomain, plot);
                        currentSegment.push(intersection[0], intersection[1]);

                    } else {
                        currentSegment.push(segment[i], segment[i + 1]);
                    }

                    lastPushed = true;

                } else if (currentDomain === 0) {
                    lastPushed = true;
                    currentSegment.push(segment[i], segment[i + 1]);
                }
                lastX = segment[i];
                lastY = segment[i + 1];
                lastDomain = currentDomain;
            }

            return dividedSegments;
        },

        "changePivot": function(lastPoint, pivot, point, toleranceX, toleranceY) {

            var p = geomFunctions.getSegmentParam(point[0], point[1], lastPoint[0], lastPoint[1], pivot[0], pivot[1]),
                interpolatedPoint;
            if (p < 1) {
                return false;
            }
            interpolatedPoint = [lastPoint[0] + p * (pivot[0] - lastPoint[0]), lastPoint[1] + p * (pivot[1] - lastPoint[1])];
            return Math.abs(point[0] - interpolatedPoint[0]) <= toleranceX && Math.abs(point[1] - interpolatedPoint[1]) <= toleranceY;
        },

        "isPointOutSideDomain": function(plot, x1, y1) {
            return this.getDomainForPoint(plot, x1, y1) === 0;
        },

        "getDomainForPoint": function(plot, x1, y1) {
            var x = 0,
                y = 0,
                PADDING = 10;
            if (x1 < plot.domain.minX - PADDING) {
                x = 1;
            } else if (x1 > plot.domain.maxX + PADDING) {
                x = 2;
            }

            if (y1 < plot.domain.minY) {
                y = 1;
            } else if (y1 > plot.domain.maxY) {
                y = 2;
            }
            return y * PADDING + x;
        },


        "getPlotObject": function(domain) {
            return {
                "lines": [],
                "segment": null,
                "gridGraph": domain.gridGraph,
                "toleranceX": domain.toleranceX,
                "toleranceY": domain.toleranceY,
                "domain": domain,
                "basePoint": null,
                "unsettledPoint": null,
                "paramVariable": domain.paramVariable
            };
        },

        "refine": function(pt1, pt2, engine, plot, hasDiscontinousPoints, graphViewMarkerBound, hasArr2) {
            var breakingPoint,
                xmean = geomFunctions.mean(pt1[0], pt2[0]),
                plottingFunctions = MathUtilities.Components.Graph.Models.plottingFunctions;
            breakingPoint = plottingFunctions.detectJump(engine, pt1[0], pt1[1], xmean, engine(xmean), pt2[0], pt2[1], plot.domain.toleranceX, plot.domain.toleranceY);
            if (breakingPoint) {
                plottingFunctions.addPoint(plot, breakingPoint[0][0], breakingPoint[0][1]);
                plottingFunctions.finishSegment(plot, hasDiscontinousPoints, graphViewMarkerBound, hasArr2, engine);
                plottingFunctions.addPoint(plot, breakingPoint[1][0], breakingPoint[1][1]);
            }
        },

        "generatePlot": function(engine, plotData, functionVariable, hasIntercepts, hasDiscontinousPoints, graphViewMarkerBound, hasArr2, equationRange) {

            var plottingFunctions = MathUtilities.Components.Graph.Models.plottingFunctions,
                plot = plottingFunctions.getPlotObject(plotData),
                refinedPoint, nextPoint = [],
                interceptPoints = [],
                x = plotData.minX,
                y = engine(x),
                yIntercept,
                currentPoint = [x, y];
            plotData.plot = plot;
            if (plotData.discontinousPoints) {
                plotData.plot.discontinousPoints = plotData.discontinousPoints;
            } else {
                plotData.plot.discontinousPoints = [];
            }
            if (isFinite(y)) {
                plottingFunctions.addPoint(plot, x, y);
            }
            x += plotData.step;
            yIntercept = engine(0);
            if (yIntercept !== void 0 && hasIntercepts && plotData.maxX >= 0 && yIntercept <= plotData.maxY &&
                plotData.minX < 0 && yIntercept > plotData.minY) {
                if (functionVariable === 'y') {
                    if (plotData.maxX > yIntercept && plotData.minX < yIntercept) {
                        interceptPoints.push([0, yIntercept]);
                    }
                } else {
                    if (plotData.maxY > yIntercept && plotData.minY < yIntercept) {
                        interceptPoints.push([yIntercept, 0]);
                    }
                }
            }
            while (x <= plotData.maxX) {
                y = engine(x);
                if (hasIntercepts && y !== void 0 && currentPoint[1] !== void 0 && x <= plotData.maxX &&
                    y <= plotData.maxY && x > plotData.minX && y > plotData.minY &&
                    y > 0 && currentPoint[1] < 0 || y < 0 && currentPoint[1] > 0) {
                    nextPoint = [x, y];
                    interceptPoints.push(this.findInterceptsDivision(currentPoint, nextPoint, engine, functionVariable, plotData));

                }
                if (isFinite(y) && isFinite(currentPoint[1])) {
                    plottingFunctions.refine(currentPoint, [x, y], engine, plot, hasDiscontinousPoints, graphViewMarkerBound, hasArr2);
                    plottingFunctions.addPoint(plot, x, y);
                } else if (isFinite(y) && !isFinite(currentPoint[1])) {
                    refinedPoint = plottingFunctions.limitedRefine(currentPoint[0], currentPoint[1], x, y, engine);
                    if (refinedPoint[0] !== x) {
                        plottingFunctions.addPoint(plot, refinedPoint[0], refinedPoint[1]);
                    }
                    plottingFunctions.refine(refinedPoint, [x, y], engine, plot, hasArr2);
                    plottingFunctions.addPoint(plot, x, y);
                } else if (!isFinite(y) && isFinite(currentPoint[1])) {
                    refinedPoint = plottingFunctions.limitedRefine(currentPoint[0], currentPoint[1], x, y, engine);
                    plottingFunctions.refine(currentPoint, refinedPoint, engine, plot, hasDiscontinousPoints, graphViewMarkerBound, hasArr2);
                    if (refinedPoint[0] !== currentPoint[0]) {
                        plottingFunctions.addPoint(plot, refinedPoint[0], refinedPoint[1]);
                    }
                    plottingFunctions.finishSegment(plot, hasDiscontinousPoints, graphViewMarkerBound, hasArr2, engine);
                }
                currentPoint = [x, y];
                x += plotData.step;
            }
            plottingFunctions.finishSegment(plot, hasDiscontinousPoints, graphViewMarkerBound, hasArr2, engine, equationRange);
            plotData.interceptPoints = interceptPoints;
            return plot.lines;
        },
        "findInterceptsForTwoArrays": function(lines, lines2, engine1, engine2, functionVariable) {

            var THRESHOLD = 0.001,
                interceptPointArr = [],
                rowLength = lines.length,
                length1, length2, xcoord, ycoord, interceptPoint = [],
                rowLength2 = lines2.length,
                row, x1, x2, y1, y2;
            if (functionVariable === 'y') {
                xcoord = 0;
                ycoord = 1;
            } else {
                xcoord = 1;
                ycoord = 0;
            }
            for (row = 0; row < rowLength && row < rowLength2; row++) {
                length1 = lines[row].length;
                length2 = lines2[row].length;
                x1 = lines[row][0];
                y1 = lines[row][1];
                x2 = lines2[row][0];
                y2 = lines2[row][1];
                if (Math.abs(y1) === 0) {
                    interceptPoint[xcoord] = x1;
                    interceptPoint[ycoord] = 0;
                    interceptPointArr.push(interceptPoint.slice());
                } else if (Math.abs(y2) === 0) {
                    interceptPoint[xcoord] = x2;
                    interceptPoint[ycoord] = 0;
                    interceptPointArr.push(interceptPoint.slice());
                } else {
                    if (Math.abs(y1) < THRESHOLD) {
                        interceptPoint[xcoord] = x1;
                        interceptPoint[ycoord] = 0;
                        interceptPointArr.push(interceptPoint.slice());
                    } else if (Math.abs(y2) < THRESHOLD) {
                        interceptPoint[xcoord] = x2;
                        interceptPoint[ycoord] = 0;
                        interceptPointArr.push(interceptPoint.slice());
                    }
                }
                x1 = lines[row][length1 - 2];
                y1 = lines[row][length1 - 1];
                x2 = lines2[row][length2 - 2];
                y2 = lines2[row][length2 - 1];
                if (Math.abs(y1) === 0) {
                    interceptPoint[xcoord] = x1;
                    interceptPoint[ycoord] = 0;
                    interceptPointArr.push(interceptPoint.slice());
                } else if (Math.abs(y2) === 0) {
                    interceptPoint[xcoord] = x2;
                    interceptPoint[ycoord] = 0;
                    interceptPointArr.push(interceptPoint.slice());
                } else {
                    if (Math.abs(y1) < THRESHOLD) {
                        interceptPoint[xcoord] = x1;
                        interceptPoint[ycoord] = 0;
                        interceptPointArr.push(interceptPoint.slice());
                    } else if (Math.abs(y2) < THRESHOLD) {
                        interceptPoint[xcoord] = x2;
                        interceptPoint[ycoord] = 0;
                        interceptPointArr.push(interceptPoint.slice());
                    }
                }
            }
            return interceptPointArr;
        },
        "findInterceptsDivision": function(currentPoint, nextPoint, engine, functionVariable, plotData) {
            var interceptPoint = [],
                x1 = currentPoint[0],
                y1 = currentPoint[1],
                x2 = nextPoint[0],
                y2 = nextPoint[1],
                startx = x1,
                starty, yDifference = Math.abs(y1) - Math.abs(y2),
                midx, midy, upperLimit = 0.9,
                endx = x2,
                endy, THRESHOLD = 0.00001;
            if (Math.abs(yDifference) > Math.abs(Math.abs(plotData.maxY) + Math.abs(plotData.minY))) {
                return [];
            }
            /*eslint-disable no-constant-condition*/
            while (true) {
                /*eslint-enable no-constant-condition*/
                if (Math.abs(startx - endx) < THRESHOLD) {
                    starty = engine(startx);
                    endy = engine(endx);
                    currentPoint = [startx, starty];
                    nextPoint = [endx, endy];
                    yDifference = Math.abs(starty) - Math.abs(endy);
                    if (Math.abs(yDifference) > Math.abs(Math.abs(plotData.maxY) + Math.abs(plotData.minY))) {
                        return [];
                    }
                    if (functionVariable === 'y') {
                        interceptPoint = [(startx + endx) / 2, 0];
                        if (Math.abs(interceptPoint[0]) < THRESHOLD) {
                            return [];
                        }
                        //case abs(x+3)/x+3
                        if (Math.abs(engine(interceptPoint[0])) > upperLimit) {
                            return [];
                        }
                    } else {
                        interceptPoint = [0, (startx + endx) / 2];
                        if (Math.abs(interceptPoint[1]) < THRESHOLD) {
                            return [];
                        }
                        //case abs(x+3)/x+3
                        if (Math.abs(engine(interceptPoint[1])) > upperLimit) {
                            return [];
                        }
                    }

                    return interceptPoint;
                }
                midx = (startx + endx) / 2;
                midy = engine(midx);
                startx = midx;
                if (midy < 0) {
                    if (y1 < 0) {
                        x1 = midx;
                        y1 = midy;
                        endx = x2;
                        endy = y2;

                    } else {
                        x2 = midx;
                        y2 = midy;
                        endx = x1;
                        endy = y1;
                    }
                } else {
                    if (y1 > 0) {
                        x1 = midx;
                        y1 = midy;
                        endx = x2;
                        endy = y2;
                    } else {
                        x2 = midx;
                        y2 = midy;
                        endx = x1;
                        endy = y1;
                    }
                }

                if (Math.abs(midy) > Math.abs(Math.abs(plotData.maxY) + Math.abs(plotData.minY))) {
                    return [];
                }
                if (Math.abs(midy) < THRESHOLD || midy === 0) {
                    if (functionVariable === 'y') {
                        interceptPoint[0] = midx;
                        interceptPoint[1] = midy;
                    } else {
                        interceptPoint[1] = midx;
                        interceptPoint[0] = midy;
                    }
                    return interceptPoint;
                }
            }

        },
        "detectJump": function(engine, x1, y1, xmean, ymean, x2, y2, toleranceX) {
            if (!(isFinite(y1) && isFinite(ymean) && isFinite(y2) && x1 <= xmean && xmean <= x2)) {
                return void 0;
            }
            var pole1, pole2, flag1, flag2, diff1, diff2, jumpFrom, jumpTo,
                plottingFunctions = MathUtilities.Components.Graph.Models.plottingFunctions;

            /*eslint-disable no-constant-condition*/
            while (1) {
                /*eslint-enable no-constant-condition*/
                pole1 = this.getInterpolationParam(x1, xmean);
                flag1 = engine(pole1);
                diff1 = Math.abs(flag1 - geomFunctions.mean(y1, ymean));

                pole2 = this.getInterpolationParam(xmean, x2);
                flag2 = engine(pole2);
                diff2 = Math.abs(flag2 - geomFunctions.mean(ymean, y2));
                //since the curve is very close to the mean values, we don't need to refine further
                if (diff1 <= toleranceX && diff2 <= toleranceX) {
                    return null;
                }

                if (!isFinite(flag1)) {
                    //check $\frac{1}{x^2}$ with upper values> ~20
                    jumpFrom = plottingFunctions.limitedRefine(x1, y1, pole1, flag1, engine);
                    jumpTo = plottingFunctions.limitedRefine(pole1, flag1, x2, y2, engine);
                    return [jumpFrom, jumpTo];
                }
                if (!isFinite(flag2)) {
                    jumpFrom = MathUtilities.Components.Graph.Models.plottingFunctions.limitedRefine(x1, y1, pole2, flag2, engine);
                    jumpTo = MathUtilities.Components.Graph.Models.plottingFunctions.limitedRefine(pole2, flag2, x2, y2, engine);
                    return [jumpFrom, jumpTo];
                }
                if ((pole1 === x1 || pole1 === xmean) && (pole2 === xmean || pole2 === x2)) {
                    if (Math.abs(ymean - y1) > Math.abs(y2 - ymean)) {
                        jumpFrom = [x1, y1];
                        jumpTo = [xmean, ymean];
                    } else {
                        jumpFrom = [xmean, ymean];
                        jumpTo = [x2, y2];
                    }
                    return [jumpFrom, jumpTo];
                }
                if (pole1 === x1 || pole1 === xmean) {
                    return MathUtilities.Components.Graph.Models.plottingFunctions.selectJumpPoint(x1, y1, xmean, ymean, pole2, flag2, x2, y2);
                }
                if (pole2 === xmean || pole2 === x2) {
                    return MathUtilities.Components.Graph.Models.plottingFunctions.selectJumpPoint(x1, y1, pole1, flag1, xmean, ymean, x2, y2);
                }
                if (diff1 > diff2) {
                    x2 = xmean;
                    y2 = ymean;
                    xmean = pole1;
                    ymean = flag1;
                } else {
                    x1 = xmean;
                    y1 = ymean;
                    xmean = pole2;
                    ymean = flag2;
                }
            }
        },


        "selectJumpPoint": function(x1, y1, x2, y2, x3, y3, x4, y4) {
            var diff1 = Math.abs(y2 - y1),
                diff2 = Math.abs(y3 - y2),
                diff3 = Math.abs(y4 - y3);

            if (diff1 > diff2 && diff1 > diff3) {
                return [
                    [x1, y1],
                    [x2, y2]
                ];
            }
            if (diff3 > diff2 && diff3 > diff1) {
                return [
                    [x3, y3],
                    [x4, y4]
                ];
            }
            return [
                [x2, y2],
                [x3, y3]
            ];
        },





        "getInterpolationParam": function(x1, x2) {
            if (x1 > x2) {
                //swap x1 x2
                x1 = x1 + x2 - (x2 = x1);
            }

            if (Math.abs(x1) > 0.01 || Math.abs(x2) > 0.01) {
                return geomFunctions.mean(x1, x2);
            }
            if (x1 === 0) {
                //$\left(\cos x\right)\cdot \log x$     This comment specifies the latex value for which  the above condition will be executed.
                return x2 * Math.abs(x2);
            }
            if (x2 === 0) {
                return x1 * Math.abs(x1);
            }
            if (x1 > 0 !== x2 > 0) {
                //if one is positive and one is negative then 0
                return 0;
            }
            return geomFunctions.mean(x1, x2);
        },
        "setGraphView": function(view) {
            this._graphView = view;
        },

        "limitedRefine": function(x1, y1, x2, y2, engine) {
            if (isFinite(y1) === isFinite(y2)) {
                return void 0;
            }
            var pole, flag;

            /*eslint-disable no-constant-condition*/
            while (1) {
                /*eslint-enable no-constant-condition*/
                pole = this.getInterpolationParam(x1, x2);
                flag = engine(pole);
                if (pole === x1 || pole === x2) {
                    if (isFinite(y1)) {
                        return [x1, y1];
                    }
                    return [x2, y2];
                }
                if (isFinite(flag) !== isFinite(y1)) {
                    x2 = pole;
                    y2 = flag;
                } else {
                    x1 = pole;
                    y1 = flag;
                }
            }
        }

    });
}(window.MathUtilities));
