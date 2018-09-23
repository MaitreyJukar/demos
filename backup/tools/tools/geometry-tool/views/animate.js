/* globals geomFunctions */
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Views.Animate = Backbone.View.extend({

        "initialize": function() {
            this.model = this.options.model;
            this.model.animatePaperScope = this.options.animatePaperScope;
            this.model.grid = this.options.grid;
            this.render();

        },

        "markMirror": function markMirror(mirrorRect, intervalCtr) {
            var loopCtr, animatePaperScope, scaleRect1, scaleRect2, scaleRect3, rectStrokeWidth;
            animatePaperScope = this.model.animatePaperScope;
            scaleRect1 = 1.5;
            scaleRect2 = 1.8;
            scaleRect3 = 2.1;
            rectStrokeWidth = 0.5;
            if (intervalCtr < 3) {
                for (loopCtr = 0; loopCtr < 2; loopCtr++) {

                    mirrorRect[(3 * loopCtr)].scale(scaleRect1);
                    mirrorRect[(3 * loopCtr)].strokeWidth += rectStrokeWidth;

                    mirrorRect[3 * loopCtr + 1].scale(scaleRect2);
                    mirrorRect[3 * loopCtr + 1].strokeWidth += rectStrokeWidth;

                    mirrorRect[3 * loopCtr + 2].scale(scaleRect3);
                    mirrorRect[3 * loopCtr + 2].strokeWidth += rectStrokeWidth;

                }
                intervalCtr++;
                setTimeout(this.markMirror.bind(this, mirrorRect, intervalCtr), 100);
            } else if (intervalCtr >= 3 && intervalCtr < 6) {
                for (loopCtr = 0; loopCtr < 2; loopCtr++) {
                    mirrorRect[(3 * loopCtr)].scale(1 / scaleRect1);
                    mirrorRect[(3 * loopCtr)].strokeWidth -= rectStrokeWidth;

                    mirrorRect[3 * loopCtr + 1].scale(1 / scaleRect2);
                    mirrorRect[3 * loopCtr + 1].strokeWidth -= rectStrokeWidth;

                    mirrorRect[3 * loopCtr + 2].scale(1 / scaleRect3);
                    mirrorRect[3 * loopCtr + 2].strokeWidth -= rectStrokeWidth;

                }
                intervalCtr++;
                setTimeout(this.markMirror.bind(this, mirrorRect, intervalCtr), 100);
            } else {
                for (loopCtr = 0; loopCtr < 6; loopCtr++) {
                    mirrorRect[loopCtr].remove();
                }
                intervalCtr = 0;
                this.model.currentActiveLayer.activate();
            }
            animatePaperScope.view.draw();
        },

        "markCenter": function markCenter(pointCircle1, pointCircle2, intervalCtr) {
            var animatePaperScope, scalePointCircle1, scalePointCircle2, widthPointCircle1, widthPointCircle2;
            animatePaperScope = this.model.animatePaperScope;
            scalePointCircle1 = 1.2;
            scalePointCircle2 = 1.4;
            widthPointCircle1 = 0.5;
            widthPointCircle2 = 0.7;

            if (intervalCtr < 3) {
                pointCircle1.scale(scalePointCircle1);
                pointCircle2.scale(scalePointCircle2);
                pointCircle1.strokeWidth += widthPointCircle1;
                pointCircle2.strokeWidth += widthPointCircle2;
                intervalCtr++;
                setTimeout(this.markCenter.bind(this, pointCircle1, pointCircle2, intervalCtr), 100);
            } else if (intervalCtr >= 3 && intervalCtr < 6) {
                pointCircle1.scale(1 / scalePointCircle1);
                pointCircle2.scale(1 / scalePointCircle2);
                pointCircle1.strokeWidth -= widthPointCircle1;
                pointCircle2.strokeWidth -= widthPointCircle2;
                intervalCtr++;
                setTimeout(this.markCenter.bind(this, pointCircle1, pointCircle2, intervalCtr), 100);
            } else {
                pointCircle1.remove();
                pointCircle2.remove();
                this.model.currentActiveLayer.activate();
            }
            animatePaperScope.view.draw();
        },


        "markMeasurement": function markMeasurement(boundingRect, intervalCtr) {
            var animatePaperScope, scaleRectHorizontally, scaleRectVertically, widthRect;
            animatePaperScope = this.model.animatePaperScope;
            scaleRectHorizontally = 1.2;
            scaleRectVertically = 1.03;
            widthRect = 0.5;
            if (intervalCtr < 3) {
                boundingRect.scale(scaleRectVertically, scaleRectHorizontally);
                boundingRect.strokeWidth += widthRect;
                intervalCtr++;
                setTimeout(this.markMeasurement.bind(this, boundingRect, intervalCtr), 100);
            } else if (intervalCtr >= 3 && intervalCtr < 6) {
                boundingRect.scale(1 / scaleRectVertically, 1 / scaleRectHorizontally);
                boundingRect.strokeWidth -= widthRect;
                intervalCtr++;
                setTimeout(this.markMeasurement.bind(this, boundingRect, intervalCtr), 100);
            } else {
                boundingRect.remove();
                this.model.currentActiveLayer.activate();
            }
            animatePaperScope.view.draw();
        },



        "fadeOutLines": function fadeOutLines(animatedLines, animatedLinesLength) {

            var clearIntervalCtr, animatePaperScope;

            animatePaperScope = this.model.animatePaperScope;
            clearIntervalCtr = this.model.intervalCtr;
            animatedLines[clearIntervalCtr].remove();

            clearIntervalCtr++;

            if (clearIntervalCtr === animatedLinesLength) {
                clearInterval(this.model.fadeOutLine);
                clearIntervalCtr = 0;
                this.model.animatedLines = [];
                this.model.currentActiveLayer.activate();
            }
            this.model.intervalCtr = clearIntervalCtr;
            animatePaperScope.view.draw();
        },

        "drawSeg": function drawSeg(startPoint, endPoint) {
            var segmt, animatePaperScope;
            animatePaperScope = this.model.animatePaperScope;
            segmt = new animatePaperScope.Path.Line(startPoint, endPoint);
            segmt.strokeWidth = 3;
            segmt.strokeColor = 'red';
            animatePaperScope.view.draw();
            return segmt;
        },

        "fadeInLines": function fadeInLines(linePoints, linePointsLength, isDashArray) {

            var animatePaperScope, segmt, clearIntervalCtr, linePointsIndex, animateView, animatedLinesLength;

            animateView = this;
            clearIntervalCtr = this.model.intervalCtr;
            linePointsIndex = 2 * clearIntervalCtr;
            animatePaperScope = this.model.animatePaperScope;

            segmt = this.drawSeg(linePoints[linePointsIndex], linePoints[linePointsIndex + 1]);

            if (isDashArray) {
                segmt.dashArray = [2 / 5 * segmt.length, 1 / 5 * segmt.length];
            }

            this.model.animatedLines.push(segmt);

            animatePaperScope.view.draw();

            clearIntervalCtr++;

            if (clearIntervalCtr === linePointsLength / 2) {
                clearInterval(this.model.fadeInLine);
                clearIntervalCtr = 0;
                animatedLinesLength = this.model.animatedLines.length;
                animateView.model.fadeOutLine = setInterval(function() {
                    animateView.fadeOutLines(animateView.model.animatedLines, animatedLinesLength);
                }, 10);
            }
            this.model.intervalCtr = clearIntervalCtr;
        },

        "findSegPoints": function findSegPoints(startPoint, endPoint, distance, noOfPoints) {
            var first, last, segmentDistance, ratio, pointX, pointY, loopCounter, linePoints = [],
                animatePaperScope;
            animatePaperScope = this.model.animatePaperScope;
            first = startPoint;
            last = endPoint;
            for (loopCounter = 0; loopCounter < noOfPoints; loopCounter++) {
                segmentDistance = Math.sqrt(Math.pow(first.x - last.x, 2) + Math.pow(first.y - last.y, 2));
                if (segmentDistance === 0) {
                    ratio = 0;
                } else {
                    ratio = distance / segmentDistance;
                }
                pointX = (1 - ratio) * first.x + ratio * last.x;
                pointY = (1 - ratio) * first.y + ratio * last.y;
                linePoints[loopCounter] = new animatePaperScope.Point(pointX, pointY);
                first = linePoints[loopCounter];
            }
            return linePoints;
        },




        "animation": function animation(animationData, animationType) {
            var grid = this.model.grid,
                selectionPoints = [],
                selectionPointsLength, loopCtr,
                noOfPoints, linePoints = [],
                linePoints1 = [],
                linePoints2 = [],
                animatePaperScope, animateView,
                linePointsLength, linePointsIndex,
                boundingRect, animationPoints,
                pointCircle1, pointCircle2,
                segment1Distance, segment2Distance, distance, maxDistance, outerArcRadius, innerArcRadius, angle, tempPoint,
                outerArcStartPoint = [],
                innerArcStartPoint = [],
                innerArcPoints = [],
                outerArcPoints = [],
                mirrorRect = [],
                mirrorRectSize;

            animatePaperScope = this.model.animatePaperScope;
            animateView = this;
            this.model.currentActiveLayer = this.model.animatePaperScope.project.activeLayer;
            this.model.grid._projectLayers.serviceLayer.activate();


            if (animationType === 'markAngle' && animationData.length === 1) {
                animationPoints = [];
                animationPoints.push(grid._getCanvasPointCoordinates([animationData[0].x1, animationData[0].y1]));
                animationPoints.push(grid._getCanvasPointCoordinates([animationData[0].x2, animationData[0].y2]));
                animationPoints.push(grid._getCanvasPointCoordinates([animationData[0].x3, animationData[0].y3]));
                angle = -geomFunctions.getArcAngle(animationData[0]);
            } else {
                animationPoints = animationData.slice();
            }

            selectionPointsLength = animationPoints.length;
            for (loopCtr = 0; loopCtr < selectionPointsLength; loopCtr++) {
                selectionPoints[loopCtr] = new animatePaperScope.Point(animationPoints[loopCtr][0], animationPoints[loopCtr][1]);
            }

            switch (animationType) {

                case 'markVector':

                    noOfPoints = this.model.noOfPoints.markVector;
                    segment1Distance = geomFunctions.distance(selectionPoints[0], selectionPoints[1]);
                    distance = segment1Distance / (noOfPoints + 1);
                    linePoints = this.findSegPoints(selectionPoints[0], selectionPoints[1], distance, noOfPoints);
                    linePointsLength = linePoints.length;
                    animateView.model.fadeInLine = setInterval(function() {
                        animateView.fadeInLines(linePoints, linePointsLength, false);
                    }, 10);
                    break;

                case 'markSegmentRatio':

                    noOfPoints = this.model.noOfPoints.markSegmentRatio;
                    segment1Distance = geomFunctions.distance(selectionPoints[0], selectionPoints[2]);
                    distance = segment1Distance / (noOfPoints + 1);
                    linePoints1 = this.findSegPoints(selectionPoints[0], selectionPoints[2], distance, noOfPoints);

                    segment2Distance = geomFunctions.distance(selectionPoints[1], selectionPoints[3]);
                    distance = segment2Distance / (noOfPoints + 1);
                    linePoints2 = this.findSegPoints(selectionPoints[1], selectionPoints[3], distance, noOfPoints);

                    linePointsLength = linePoints1.length;

                    for (loopCtr = 0, linePointsIndex = 0; loopCtr < linePointsLength; loopCtr++, linePointsIndex += 2) {
                        linePoints[linePointsIndex] = linePoints1[loopCtr];
                        linePoints[linePointsIndex + 1] = linePoints2[loopCtr];
                    }

                    linePointsLength = linePoints.length;
                    linePoints.reverse();
                    animateView.model.fadeInLine = setInterval(function() {
                        animateView.fadeInLines(linePoints, linePointsLength, false);
                    }, 10);
                    break;

                case 'markMeasurement':

                    boundingRect = new animatePaperScope.Path.Rectangle(selectionPoints[0], selectionPoints[1]);
                    boundingRect.strokeWidth = 2;
                    boundingRect.strokeColor = 'pink';
                    this.markMeasurement(boundingRect, 0);
                    break;

                case 'markCenter':

                    pointCircle1 = new animatePaperScope.Path.Circle(selectionPoints[0], 5);
                    pointCircle2 = new animatePaperScope.Path.Circle(selectionPoints[0], 5);
                    pointCircle1.strokeColor = 'black';
                    pointCircle2.strokeColor = 'black';
                    pointCircle1.strokeWidth = 1;
                    pointCircle2.strokeWidth = 1;
                    this.markCenter(pointCircle1, pointCircle2, 0);
                    break;

                case 'markAngle':

                    noOfPoints = this.model.noOfPoints.markAngle;
                    maxDistance = 188;
                    segment1Distance = geomFunctions.distance(selectionPoints[0], selectionPoints[1]);
                    segment2Distance = geomFunctions.distance(selectionPoints[2], selectionPoints[1]);
                    if (segment1Distance < maxDistance || segment2Distance < maxDistance) {
                        if (segment1Distance < segment2Distance) {
                            outerArcRadius = segment1Distance;
                        } else {
                            outerArcRadius = segment2Distance;
                        }
                    } else {
                        outerArcRadius = maxDistance;
                    }

                    innerArcRadius = outerArcRadius - 37.795275591;

                    innerArcStartPoint = this.findSegPoints(selectionPoints[1], selectionPoints[0], innerArcRadius, 1);
                    outerArcStartPoint = this.findSegPoints(selectionPoints[1], selectionPoints[0], outerArcRadius, 1);
                    if (!angle) {
                        angle = geomFunctions.angleBetweenPoints(selectionPoints[0].x, selectionPoints[0].y, selectionPoints[1].x, selectionPoints[1].y, selectionPoints[2].x, selectionPoints[2].y, true);
                    }


                    for (loopCtr = 1; loopCtr <= noOfPoints; loopCtr++) {
                        tempPoint = geomFunctions.rotatePoint(innerArcStartPoint[0].x, innerArcStartPoint[0].y, selectionPoints[1].x, selectionPoints[1].y, loopCtr * angle / noOfPoints, true);
                        innerArcPoints[loopCtr - 1] = new animatePaperScope.Point(tempPoint);
                        tempPoint = geomFunctions.rotatePoint(outerArcStartPoint[0].x, outerArcStartPoint[0].y, selectionPoints[1].x, selectionPoints[1].y, loopCtr * angle / noOfPoints, true);
                        outerArcPoints[loopCtr - 1] = new animatePaperScope.Point(tempPoint);
                    }

                    linePointsLength = innerArcPoints.length;

                    for (loopCtr = 0, linePointsIndex = 0; loopCtr < linePointsLength; loopCtr++, linePointsIndex += 2) {
                        linePoints[linePointsIndex] = outerArcPoints[loopCtr];
                        linePoints[linePointsIndex + 1] = innerArcPoints[loopCtr];
                    }

                    linePointsLength = linePoints.length;
                    animateView.model.fadeInLine = setInterval(function() {
                        animateView.fadeInLines(linePoints, linePointsLength, true);
                    }, 10);
                    break;

                case 'markMirror':

                    noOfPoints = 2;
                    segment1Distance = geomFunctions.distance(selectionPoints[0], selectionPoints[1]);
                    distance = segment1Distance / (noOfPoints + 1);
                    linePoints = this.findSegPoints(selectionPoints[0], selectionPoints[1], distance, noOfPoints);

                    mirrorRectSize = new animatePaperScope.Size(3, 3);

                    linePoints[0].x = linePoints[0].x - 1.5;
                    linePoints[0].y = linePoints[0].y - 1.5;
                    linePoints[1].x = linePoints[1].x - 1.5;
                    linePoints[1].y = linePoints[1].y - 1.5;

                    mirrorRect[0] = new animatePaperScope.Path.Rectangle(linePoints[0], mirrorRectSize);
                    mirrorRect[1] = new animatePaperScope.Path.Rectangle(linePoints[0], mirrorRectSize);
                    mirrorRect[2] = new animatePaperScope.Path.Rectangle(linePoints[0], mirrorRectSize);
                    mirrorRect[3] = new animatePaperScope.Path.Rectangle(linePoints[1], mirrorRectSize);
                    mirrorRect[4] = new animatePaperScope.Path.Rectangle(linePoints[1], mirrorRectSize);
                    mirrorRect[5] = new animatePaperScope.Path.Rectangle(linePoints[1], mirrorRectSize);

                    for (loopCtr = 0; loopCtr < 6; loopCtr++) {
                        mirrorRect[loopCtr].strokeWidth = 1;
                        mirrorRect[loopCtr].strokeColor = 'black';
                    }

                    this.markMirror(mirrorRect, 0);
                    break;

            }



        },



        "render": function() {
            return this;
        }
    });
})(window.MathUtilities);
