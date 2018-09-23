/* globals geomFunctions, window */

(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //Polygon view start **********************************************
    WhiteboardTool.Views.Polygon = WhiteboardTool.Views.BasePolygon.extend({
        "_drawingInProgress": null,
        "initModel": function() {
            this.model = new WhiteboardTool.Models.Polygon();
        },
        "processTouchStart": function(event) {
            var point = event.point,
                oldState = {};

            if (this._drawingInProgress) {
                this.model._feedPoint(point);
                this.drawIntermediate(event);
            } else {
                this._drawingInProgress = true;

                this.model._feedPoint(new WhiteboardTool.Models.Point(point.x, point.y));

                // Undo redo state saves
                oldState.bRemove = true;
                oldState.id = this.getId();
                this.drawIntermediate(event);
                this._savePreviousState(oldState);
                this.updatePathZindex();

                //HitPath for 1st polygon point added to test hit test to complete polygon
                this._hitPath = new WhiteboardTool.Views.PaperScope.Path.Circle({
                    "center": [point.x, point.y],
                    "radius": 5,
                    "fillColor": '#fff'
                });
                this._hitPath.fillColor.alpha = 0;
                this.trigger("bindMouseMove");
            }
        },
        "processTouchMove": function(event) {
            var curPoint = event.point,
                arrDataPoints = this.model.getFedPoints(),
                lastIndex = arrDataPoints.length - 1;

            if (this.isPolygonComplete(curPoint)) {
                curPoint = arrDataPoints[0];
            }
            if (lastIndex === 0) {
                this.model._feedPoint(curPoint.clone());
            } else {
                this.model._feedPoint(curPoint.clone(), lastIndex);
            }


            this.drawIntermediate(event);
        },

        "processTouchEnd": function(event) {
            var point = event.point,
                arrDataPoints = this.model.getFedPoints(),
                lastIndex = arrDataPoints.length - 1,
                curState;

            if (this.isPolygonComplete(point)) {
                point = arrDataPoints[0];
                this._drawingInProgress = false;
                this.trigger("unbindMouseMove");

            }
            this.model._feedPoint(point, lastIndex);
            this.model.setBackupFedPoints(this.model.getFedPoints());

            this.setBoundingBoxOnPathBounds();
            this.model.setBackupBoundingBox(this.model.getBoundingBox());
            this.model.setRotationPoint(this.model.getRotationReferencePoint());

            this.drawIntermediate(event);
            if (!this._drawingInProgress) {
                this.trigger("equation-complete");
            }

            // Undo redo state saves
            curState = this.model.getCloneData();
            curState = this.getViewOptions(curState);
            curState.backupBoundingBox = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.getBackupBoundingBox());
            curState.id = this.getId();
            this._saveCurrentState(curState);
        },

        "drawIntermediate": function() {
            var intermediatePath = this._intermediatePath,
                arrPoints = this.model.getFedPoints(),
                style = this._getApplicableStrokeStyle(this.isSelected()),
                data = this.model.getData();

            if (intermediatePath) {
                intermediatePath.remove();
            }
            this._intermediatePath = intermediatePath = new WhiteboardTool.Views.PaperScope.Path({
                "segments": arrPoints,
                "strokeJoin": "round"
            });
            if (this.isPolygonComplete()) {
                intermediatePath.closed = true;
            }

            this.applyStyleToPathGroup(intermediatePath, style);
            this.updatePathZindex();
            if (data.bSelected) {
                this.drawBounds();
            }
        },

        "getShapePoints": function(boundingRect) {
            var backupPoints = this.model.getBackupFedPoints(),
                backupBoundinBox = this.getPolygonBoundingBox(backupPoints),
                xScaleFactor = boundingRect.width / backupBoundinBox.width,
                yScaleFactor = boundingRect.height / backupBoundinBox.height,
                flipData = this.model.getFlipData(),
                iLooper = 0,
                arrTempPoints = [],
                curPoint;

            for (; iLooper < backupPoints.length; iLooper++) {
                curPoint = backupPoints[iLooper];
                arrTempPoints[iLooper] = new WhiteboardTool.Models.Point({
                    "x": boundingRect.x + flipData.x * Math.abs(backupBoundinBox.x - curPoint.x) * xScaleFactor,
                    "y": boundingRect.y + flipData.y * Math.abs(backupBoundinBox.y - curPoint.y) * yScaleFactor
                });
            }
            return arrTempPoints;
        },

        "isPolygonComplete": function(lastPoint) {
            var dataPoints = this.model.getFedPoints();
            if (!this._hitPath || dataPoints.length < 3) {
                return false;
            }
            return !!this._hitPath.hitTest(lastPoint || dataPoints[dataPoints.length - 1]);
        },

        "isValidPolygon": function() {
            var dataPoints = this.model.getFedPoints(),
                validPoints = [],
                point, curPoint, ptLooper, isValid;
            for (point in dataPoints) {
                curPoint = dataPoints[point];
                isValid = true;
                for (ptLooper = 0; ptLooper < validPoints.length; ptLooper++) {
                    if (curPoint.x === validPoints[ptLooper].x && curPoint.y === validPoints[ptLooper].y) {
                        isValid = false;
                    }
                }
                if (isValid) {
                    validPoints.push(curPoint);
                }
            }

            return validPoints.length >= 3;

        },

        "checkPolygonComplete": function() {
            return !this._drawingInProgress;
        },

        "getPolygonBoundingBox": function(points) {
            points = points || this.model.getFedPoints();
            var xMax, xMin, yMax, yMin, boundingBox = new WhiteboardTool.Models.Rect(),
                topLeft, iLooper = 1,
                width, height, curPoint;

            if (points.length < 3) {
                return boundingBox;
            }
            xMin = xMax = points[0].x;
            yMin = yMax = points[0].y;

            for (; iLooper < points.length; iLooper++) {
                curPoint = points[iLooper];

                if (curPoint.x < xMin) {
                    xMin = curPoint.x;
                }
                if (curPoint.x > xMax) {
                    xMax = curPoint.x;
                }
                if (curPoint.y < yMin) {
                    yMin = curPoint.y;
                }
                if (curPoint.y > yMax) {
                    yMax = curPoint.y;
                }
            }

            topLeft = geomFunctions.intersectionOfLines(xMin, 0, xMin, -1, 0, yMin, -1, yMin);
            width = xMax - xMin;
            height = yMax - yMin;
            boundingBox = new WhiteboardTool.Models.Rect({
                "x": topLeft[0],
                "y": topLeft[1],
                "width": width,
                "height": height
            });
            return boundingBox;

        },

        "setBoundingBoxOnPathBounds": function() {
            var box = new WhiteboardTool.Models.Rect(),
                bounds = null,
                intermediatePath = this._intermediatePath;

            if (intermediatePath) {
                bounds = intermediatePath.bounds;
            }
            if (bounds) {
                box.x = bounds.x;
                box.y = bounds.y;
                box.width = bounds.width;
                box.height = bounds.height;
            }
            this.model.setBoundingBox(box);
        }

    });

    //Polygon view end **********************************************
})(window.MathUtilities);
