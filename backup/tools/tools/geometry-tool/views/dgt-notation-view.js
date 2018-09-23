/* globals _, $, window, geomFunctions   */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Views.DgtNotation = Backbone.View.extend({

        "initialize": function() {
            return this;
        },

        "drawMarkers": function() {
            var model = this.model,
                grid = model.engine.grid;

            //should be 1st line of this function
            grid.activateNewLayer('customShape');

            /*
            ...... :: check specie (from model) & call updateAngleMark or updateTickMark
            */
            if (model.species === 'tickMark') {
                this._drawTickMark();
                model.setProperties();
            } else if (model.species === 'angleMark') {
                this._drawAngleMark();

                if (!model.properties) {
                    model.setProperties();
                }
            }
            if (!model.isPreview && model.notationGroup) {
                model.notationGroup.on('mouseenter', _.bind(function() {
                    this.model.trigger('roll-over');
                }, this));
                model.notationGroup.on('mouseleave', _.bind(function() {
                    this.model.trigger('roll-out');
                }, this));
            }

            grid.refreshView();


            //should be last line of this function
            grid.activateEarlierLayer();
        },

        "getPointsForDrawingArrowOnArc": function(arcSeed) {

            var model = this.model,
                engine = model.engine,
                centerPoint = [],
                arrowAtPoint = [],
                atDistance = engine.grid._getGridDistance([10, 0])[0], // 10 is radius of arc
                pointOnArc, reverse, pointOnArrowLine, dist,
                offset, secondPointOfArrow, thirdPointOfArrow, arrowPoints = [],
                arrowAtPointX = arcSeed.r * Math.cos(arcSeed.to) + arcSeed.a,
                arrowAtPointY = arcSeed.r * Math.sin(arcSeed.to) + arcSeed.b,
                arcAngleInRadians = geomFunctions.getArcAngle(arcSeed, true),
                arcAngleInDegrees = Math.abs(arcAngleInRadians) * 180 / Math.PI, // converting radians to degree
                pointAtAngleInRad = atDistance * 360 / (2 * Math.PI * arcSeed.r), // 360 is 2pi
                RIGHT_ANGLE = 90;

            centerPoint.push([arcSeed.a, arcSeed.b]);

            arrowAtPoint.push([arrowAtPointX, arrowAtPointY]);

            if (Math.round(arcAngleInDegrees) === RIGHT_ANGLE && !model.isPreview) {
                reverse = arcAngleInRadians <= 0;

                pointOnArrowLine = geomFunctions.rotatePoint(arcSeed.a, arcSeed.b, arrowAtPointX, arrowAtPointY, RIGHT_ANGLE, true, reverse);
                dist = geomFunctions.distance2(arrowAtPointX, arrowAtPointY, pointOnArrowLine[0], pointOnArrowLine[1]);
                offset = atDistance / dist;
                pointOnArc = geomFunctions.getPointPositionFromOffset(arrowAtPointX, arrowAtPointY, pointOnArrowLine[0], pointOnArrowLine[1], offset);

            } else {
                pointOnArc = geomFunctions.rotatePoint(arrowAtPoint[0][0], arrowAtPoint[0][1], centerPoint[0][0], centerPoint[0][1], pointAtAngleInRad, true, arcAngleInRadians > 0);
            }

            secondPointOfArrow = geomFunctions.rotatePoint(pointOnArc[0], pointOnArc[1], arrowAtPoint[0][0], arrowAtPoint[0][1], 30, true, false);

            thirdPointOfArrow = geomFunctions.rotatePoint(pointOnArc[0], pointOnArc[1], arrowAtPoint[0][0], arrowAtPoint[0][1], 30, true, true);

            arrowPoints.push(engine.grid._getCanvasPointCoordinates(arrowAtPoint[0]),
                engine.grid._getCanvasPointCoordinates(secondPointOfArrow),
                engine.grid._getCanvasPointCoordinates(thirdPointOfArrow));
            return arrowPoints;
        },

        "drawArrow": function(tickMarkPoint, distanceBetweenTicks) {
            var x1 = 10,
                x2 = 20,
                x3 = 10,
                y1 = 10,
                y2 = 20,
                y3 = 30,
                index, path,
                model = this.model,
                creator = model.creator,
                strokeCount = creator._params.strokeCount,
                typeOfTickMark = creator._params.typeOfMarker,
                paperScope = model._paperScope;

            for (index = 0; index < strokeCount; index++) {
                path = new paperScope.Path([x1, y1], [x2, y2], [x3, y3]);
                path.equation = model.equation;
                if (['hollow-arrow', 'solid-arrow'].indexOf(typeOfTickMark) > -1) {
                    path.closed = true;
                    if (typeOfTickMark === 'hollow-arrow') {
                        path.fillColor = '#fff';
                    } else {
                        path.fillColor = '#888';
                    }
                    path.fillColor.alpha = 1;
                }
                model.notationGroup.addChild(path);
                x1 += distanceBetweenTicks;
                x2 += distanceBetweenTicks;
                x3 += distanceBetweenTicks;
            }
        },

        "_drawTickMark": function() {
            var model = this.model,
                engine = model.engine,
                creator = model.creator,
                selectedItem = creator.sources[0],
                params = creator._params,
                strokeColor = '#888',
                strokeWidth = params.thickness,
                strokeCount = params.strokeCount,
                typeOfTickMark = params.typeOfMarker,
                offset = params.offset,
                paperScope = model._paperScope,
                tickMarkPointOnGraph = MathUtilities.Tools.Dgt.Models.DgtEngine.getRandomPointOnObject(selectedItem, creator, offset),
                tickMarkPoint = engine.grid._getCanvasPointCoordinates(tickMarkPointOnGraph),
                slope, ROTATION_ANGLE = 180,
                //x1,y1,x2,y2,x3,y3 's are initial value of three points which are used for drawing arrow tick Mark
                x1, x2, x3, x4, y1, y2, y3, y4, index, path, distanceBetweenTicks;

            model.equation.setPoints([tickMarkPointOnGraph]);

            model.notationGroup = new paperScope.Group();

            if (['crossbar', 'open-arrow'].indexOf(typeOfTickMark) > -1) {
                distanceBetweenTicks = strokeWidth + 5; // 5 is padding
            } else if (['hollow-arrow', 'solid-arrow'].indexOf(typeOfTickMark) > -1) {
                distanceBetweenTicks = 10 + strokeWidth; // 10 is padding
            }

            //BackGround For TickMark
            x1 = y1 = 0;
            x2 = distanceBetweenTicks * (strokeCount - 1) + strokeWidth + 20; // 20 is padding
            y2 = 0;
            x3 = x2;
            y3 = 40; // width of tick mark
            x4 = 0;
            y4 = 40; // width of tick mark
            path = new paperScope.Path([x1, y1], [x2, y2], [x3, y3], [x4, y4]);
            path.closed = true;
            path.fillColor = '#008';
            path.fillColor.alpha = 0;
            path.opacity = 0;
            path.equation = model.equation;
            model.notationGroup.addChild(path);

            switch (typeOfTickMark) {
                case 'crossbar':
                    //x1,y1,x2,y2 's are initial coordinates of two end point of crossbar
                    x1 = 10;
                    x2 = 10;
                    y1 = 10;
                    y2 = 30;
                    for (index = 0; index < strokeCount; index++) {
                        path = new paperScope.Path([x1, y1], [x2, y2]);
                        path.equation = model.equation;
                        model.notationGroup.addChild(path);
                        x1 += distanceBetweenTicks;
                        x2 = x1;
                    }
                    break;
                case 'open-arrow':
                    this.drawArrow(tickMarkPoint, distanceBetweenTicks);
                    break;
                case 'hollow-arrow':
                case 'solid-arrow':
                    this.drawArrow(tickMarkPoint, distanceBetweenTicks);
                    break;
            }

            slope = -model.seed.slope;
            model.notationGroup.rotate(slope);
            model.notationGroup.position = new paperScope.Point(tickMarkPoint[0], tickMarkPoint[1]);

            if (typeOfTickMark === 'solid-arrow') {
                model.notationGroup.style = {
                    "fillColor": strokeColor,
                    "strokeColor": strokeColor,
                    "strokeWidth": strokeWidth
                };
            } else {
                model.notationGroup.style = {
                    "strokeColor": strokeColor,
                    "strokeWidth": strokeWidth
                };
            }

            if (params.direction === 1 && typeOfTickMark !== 'crossbar') {
                model.notationGroup.rotate(ROTATION_ANGLE);
            }

            model.equation.setPathGroup(model.notationGroup);

            model.notationGroup.equation = model.equation;
        },

        "_drawAngleMark": function() {
            var model = this.model,
                Utils = MathUtilities.Components.Utils.Models.Utils,
                seed = Utils.convertToSerializable(model.seed),
                paperScope = model._paperScope,
                creator = model.creator,
                engine = model.engine,
                angleBetweenPoints = Math.abs(geomFunctions.getArcAngle(seed)),
                ONE_ROTATION_ANGLE = 360,
                RIGHT_ANGLE = 90,
                MIN_ANGLE_BETWEEN_POINTS = 30,
                looper, pointsLength,
                loopVar, path, arrayOfSegments, ctr,
                params, strokeCount, RADIUS_IN_CANVAS = 30,
                arrowPoints = [],
                arcCenterInCanvas,
                pt1, pt2, pt3, pt4, arcRadiusInGrid,
                PADDING_IN_CANVAS = 7,
                paddingInGrid,
                thresholdValue, arrayOfSegmentsLength,
                MIN_THRESHOLD_VALUE = MathUtilities.Tools.Dgt.Models.DgtNotationEngine.MIN_THRESHOLD,
                MAX_THRESHOLD_VALUE = MathUtilities.Tools.Dgt.Models.DgtNotationEngine.MAX_THRESHOLD;

            paperScope = model._paperScope;
            if (creator) {
                params = creator._params;
            } else {
                params = Utils.convertToSerializable(model.engine.dgtUI.model.dgtPopUpView.model.valuesForNotation.angleMark);
            }

            if (model.isPreview) {
                strokeCount = 1;
            } else {
                strokeCount = params.strokeCount;
            }

            if (model.showDirection) {
                params.showDirection = model.showDirection;
            }

            if (isNaN(angleBetweenPoints) || Math.round(angleBetweenPoints) === ONE_ROTATION_ANGLE ||
                Math.round(angleBetweenPoints) === 0 || this.doesMaintainThresholdBetweenSources()) {
                return;
            }

            thresholdValue = angleBetweenPoints - RIGHT_ANGLE;
            model.notationGroup = new paperScope.Group();

            arcRadiusInGrid = engine.grid._getGridDistance([RADIUS_IN_CANVAS, 0])[0];
            paddingInGrid = engine.grid._getGridDistance([PADDING_IN_CANVAS, 0])[0];
            arcCenterInCanvas = engine.grid._getCanvasPointCoordinates([seed.a, seed.b]);

            if (thresholdValue >= MIN_THRESHOLD_VALUE && thresholdValue <= MAX_THRESHOLD_VALUE && !model.isPreview) {
                for (ctr = 0; ctr < strokeCount; ctr++) {
                    path = new paperScope.Path();
                    path.strokeColor = model.equation.getColor();
                    path.fillColor = model.equation.getColor();
                    path.fillColor.alpha = 0;
                    path.strokeWidth = params.thickness;
                    pt1 = engine.grid._getCanvasPointCoordinates([seed.a + arcRadiusInGrid * Math.cos(seed.from), seed.b + arcRadiusInGrid * Math.sin(seed.from)]);
                    pt2 = engine.grid._getCanvasPointCoordinates([seed.a + arcRadiusInGrid * Math.sqrt(2) * Math.cos(seed.via), seed.b + arcRadiusInGrid * Math.sqrt(2) * Math.sin(seed.via)]);
                    pt3 = engine.grid._getCanvasPointCoordinates([seed.a + arcRadiusInGrid * Math.cos(seed.to), seed.b + arcRadiusInGrid * Math.sin(seed.to)]);
                    path.add(
                        new paperScope.Point(pt1[0], pt1[1]),
                        new paperScope.Point(pt2[0], pt2[1]),
                        new paperScope.Point(pt3[0], pt3[1])
                    );


                    path.equation = model.equation;
                    model.notationGroup.addChild(path);

                    if (ctr === 0) {
                        path = new paperScope.Path();
                        path.strokeWidth = 0;
                        path.fillColor = this.model.equation.getColor();
                        path.fillColor.alpha = 0.5;
                        path.add(
                            new paperScope.Point(pt1[0], pt1[1]),
                            new paperScope.Point(pt2[0], pt2[1]),
                            new paperScope.Point(pt3[0], pt3[1])
                        );
                        path.add(arcCenterInCanvas[0], arcCenterInCanvas[1]);
                        path.equation = model.equation;
                        model.notationGroup.addChild(path);
                    }
                    arcRadiusInGrid += paddingInGrid;
                    seed.r = arcRadiusInGrid;
                }
            } else {
                for (ctr = 0; ctr < strokeCount; ctr++) {
                    path = new paperScope.Path();

                    arrayOfSegments = geomFunctions.createArc(arcRadiusInGrid, seed.from, seed.via, seed.to, seed.a, seed.b);
                    arrayOfSegmentsLength = arrayOfSegments.length;
                    for (loopVar = 0; loopVar < arrayOfSegmentsLength; loopVar++) {
                        pointsLength = arrayOfSegments[loopVar].length;
                        if (pointsLength >= 8) {
                            //8 points are minimum for a curve
                            //8 points x y alternate
                            //first start of C Bezier and followed by 3 points of C Bezier
                            for (looper = 0; looper < pointsLength; looper += 8) {
                                pt1 = engine.grid._getCanvasPointCoordinates([arrayOfSegments[loopVar][looper], arrayOfSegments[loopVar][looper + 1]]);
                                pt2 = engine.grid._getCanvasPointCoordinates([arrayOfSegments[loopVar][looper + 2], arrayOfSegments[loopVar][looper + 3]]);
                                pt3 = engine.grid._getCanvasPointCoordinates([arrayOfSegments[loopVar][looper + 4], arrayOfSegments[loopVar][looper + 5]]);
                                pt4 = engine.grid._getCanvasPointCoordinates([arrayOfSegments[loopVar][looper + 6], arrayOfSegments[loopVar][looper + 7]]);

                                path.add(pt1[0], pt1[1]);
                                path.cubicCurveTo(pt2[0], pt2[1],
                                    pt3[0], pt3[1],
                                    pt4[0], pt4[1]
                                );
                            }
                        }
                    }

                    model.notationGroup.addChild(path);
                    path.equation = model.equation;

                    path.strokeColor = this.model.equation.getColor();
                    path.fillColor = this.model.equation.getColor();
                    path.fillColor.alpha = 0;
                    path.strokeCap = 'butt';
                    path.strokeJoin = 'bevel';
                    path.strokeWidth = params.thickness;

                    if (ctr === 0) {
                        path = new paperScope.Path();
                        for (loopVar = 0; loopVar < arrayOfSegmentsLength; loopVar++) {
                            pointsLength = arrayOfSegments[loopVar].length;
                            if (pointsLength >= 8) {
                                //8 points are minimum for a curve
                                //8 points x y alternate
                                //first start of C Bezier and followed by 3 points of C Bezier
                                for (looper = 0; looper < pointsLength; looper += 8) {
                                    pt1 = engine.grid._getCanvasPointCoordinates([arrayOfSegments[loopVar][looper], arrayOfSegments[loopVar][looper + 1]]);
                                    pt2 = engine.grid._getCanvasPointCoordinates([arrayOfSegments[loopVar][looper + 2], arrayOfSegments[loopVar][looper + 3]]);
                                    pt3 = engine.grid._getCanvasPointCoordinates([arrayOfSegments[loopVar][looper + 4], arrayOfSegments[loopVar][looper + 5]]);
                                    pt4 = engine.grid._getCanvasPointCoordinates([arrayOfSegments[loopVar][looper + 6], arrayOfSegments[loopVar][looper + 7]]);

                                    path.add(pt1[0], pt1[1]);
                                    path.cubicCurveTo(pt2[0], pt2[1],
                                        pt3[0], pt3[1],
                                        pt4[0], pt4[1]
                                    );
                                }
                            }
                        }
                        path.add(arcCenterInCanvas[0], arcCenterInCanvas[1]);
                        path.equation = model.equation;
                        model.notationGroup.addChild(path);
                        path.strokeWidth = 0;
                        path.fillColor = this.model.equation.getColor();
                        path.fillColor.alpha = 0.5;
                    }
                    arcRadiusInGrid += paddingInGrid;
                    seed.r = arcRadiusInGrid;
                }
            }

            seed.r = arcRadiusInGrid - paddingInGrid;
            if (params && params.showDirection && angleBetweenPoints > MIN_ANGLE_BETWEEN_POINTS) {
                arrowPoints = this.getPointsForDrawingArrowOnArc(seed);
                path = new paperScope.Path();
                path.add(arrowPoints[1], arrowPoints[0], arrowPoints[2]);
                path.strokeColor = this.model.equation.getColor();
                path.fillColor = this.model.equation.getColor();
                path.strokeWidth = 1;
                path.equation = model.equation;
                model.notationGroup.addChild(path);
            }

            model.equation.setPathGroup(model.notationGroup);

            model.notationGroup.sendToBack();
        },

        "doesMaintainThresholdBetweenSources": function() {
            if (!this.model.creator) {
                return void 0;
            }
            var thresholdValueX, thresholdValueY,
                ctr, pointCoords, canvasCoords,
                grid = this.model.engine.grid,
                creator = this.model.creator,
                MIN_THRESHOLD_VALUE = MathUtilities.Tools.Dgt.Models.DgtNotationEngine.MIN_THRESHOLD,
                MAX_THRESHOLD_VALUE = MathUtilities.Tools.Dgt.Models.DgtNotationEngine.MAX_THRESHOLD,
                sources = creator.sources,
                noOfSources = sources.length,
                centerPointCoords = sources[1].equation.getPoints()[0],
                centerPointCanvasCoords = grid._getCanvasPointCoordinates(centerPointCoords);

            for (ctr = 0; ctr < noOfSources; ctr++) {
                if (ctr === 1) {
                    continue;
                }

                pointCoords = sources[ctr].equation.getPoints()[0];
                canvasCoords = grid._getCanvasPointCoordinates(pointCoords);

                thresholdValueX = Math.abs(centerPointCanvasCoords[0]) - Math.abs(canvasCoords[0]);
                thresholdValueY = Math.abs(centerPointCanvasCoords[1]) - Math.abs(canvasCoords[1]);

                if (thresholdValueX >= MIN_THRESHOLD_VALUE && thresholdValueX <= MAX_THRESHOLD_VALUE &&
                    (thresholdValueY >= MIN_THRESHOLD_VALUE && thresholdValueY <= MAX_THRESHOLD_VALUE)) {
                    return true;
                }
            }

            return false;

        },

        "removeNotation": function() {
            /*...... :: remove drawn entity*/

            if (this.model.notationGroup) {
                this.model.engine.grid.removeDrawingObject(this.model.notationGroup);
                this.model.notationGroup = null;
            }
        }


    });
})(window.MathUtilities);
