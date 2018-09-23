(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //line view start **********************************************
    WhiteboardTool.Views.Line = WhiteboardTool.Views.BasePolygon.extend({
        "initModel": function() {
            this.model = new WhiteboardTool.Models.Line();
        },


        "initialize": function() {
            WhiteboardTool.Views.BasePolygon.__super__.initialize.apply(this, arguments);

            var data = this.model.get("_data");

            data.isDashed = this.options.dashed;
            data.isArrow = this.options.arrow;
        },

        "processTouchEnd": function() {
            WhiteboardTool.Views.Line.__super__.processTouchEnd.apply(this, arguments);
            this.trigger("equation-complete");
        },

        "draw": function() {
            WhiteboardTool.Views.Line.__super__.draw.apply(this, arguments);

            var isDashed = this.model.get('_data').isDashed;

            this._intermediatePath.strokeCap = 'round';
            if (isDashed) {
                this._intermediatePath.dashArray = [10, 20]; // pixel length of dash and the following gaps
            }
            window.debugPath = this._intermediatePath;
            this.drawArrowHead();

            if ("ontouchstart" in window) {
                this._intermediatePath.hitPath = this._intermediatePath.clone();
                this._intermediatePath.hitPath.strokeColor = "black";
                this._intermediatePath.hitPath.strokeColor.alpha = 0;
                this._intermediatePath.hitPath.strokeWidth = 20;
            }
        },

        "drawArrowHead": function drawArrowHead() {
            var isArrow = this.model.get('_data').isArrow,
                pointOnSegment, arrowPoint2, ANGLE = 30,
                offset,
                DISTANCE = 15,
                arrowPoint1, segDistance, THRESHOLD = 0.00001,
                points, style,
                point1, point2, segments = this._intermediatePath.segments;

            if (!isArrow) {
                return;
            }

            points = [segments[0].point, segments[1].point];

            point1 = points[0];
            point2 = points[1];

            segDistance = geomFunctions.distance2(point1.x, point1.y, point2.x, point2.y);
            if (segDistance < THRESHOLD) {
                return;
            }
            offset = DISTANCE / segDistance;
            pointOnSegment = geomFunctions.getPointPositionFromOffset(point2.x, point2.y, point1.x, point1.y, offset);

            arrowPoint1 = geomFunctions.rotatePoint(pointOnSegment[0], pointOnSegment[1], point2.x, point2.y, ANGLE, true);
            arrowPoint2 = geomFunctions.rotatePoint(pointOnSegment[0], pointOnSegment[1], point2.x, point2.y, -ANGLE, true);

            this.arrowPath = new paper.Path({
                "segments": [arrowPoint1, point2, arrowPoint2]
            });

            style = this._getApplicableStrokeStyle(this.isSelected());

            this.applyStyleToPathGroup(this.arrowPath, style);
            this.arrowPath.fillColor = new paper.Color(0, 0, 0, 0);
        },

        "processTouchMove": function(eventObject) {
            var boundingBox = this.model.getBoundingBox(),
                curPoint = eventObject.point,
                zeropoint,
                lastIndex = this.model.getFedPoints().length - 1;

            this.model._feedPoint(curPoint.clone(), lastIndex);
            this.draw();
            zeropoint = new paper.Point(boundingBox.x, boundingBox.y);
            if (this._intermediatePath) {
                this._intermediatePath.segments[0].point = zeropoint;
                this._intermediatePath.segments[1].point = curPoint;
            }
            paper.view.draw();

            if (boundingBox) {
                boundingBox.width = curPoint.x - boundingBox.x;
                boundingBox.height = curPoint.y - boundingBox.y;
            }

            this.flip(this.model.getFlipDirection(boundingBox.clone()), false);
            this.resize(boundingBox.clone(), false);
            this._curPoint = eventObject.point;
        },

        "getShapePoints": function(boundingRect) {
            var topLeft, bottomRight,
                boxWidth = Math.abs(boundingRect.width),
                boxHeight = Math.abs(boundingRect.height),
                arrTempPoints = [];

            topLeft = {
                "x": boundingRect.x,
                "y": boundingRect.y
            };
            bottomRight = {
                "x": boundingRect.x + boxWidth,
                "y": boundingRect.y + boxHeight
            };

            arrTempPoints.push(topLeft);
            arrTempPoints.push(bottomRight);

            return arrTempPoints;
        }
    });

    //line view end **********************************************
})(window.MathUtilities);
