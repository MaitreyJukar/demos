/*globals geomFunctions*/
(function(MathUtilities) {
    "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                          Compass                                */
    /*******************************************************************/
    /**
     * A customized Backbone.View that represents Compass.
     * @class MathUtilities.Tools.ConstructionTool.Views.Compass
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Views.BasePen
     */
    ConstructionTool.Views.Compass = ConstructionTool.Views.BaseShape.extend({
        "_ruler": null,

        "initModel": function() {
            this.model = new ConstructionTool.Models.Compass();
        },

        "processTouchStart": function() {
            var ruler = this._ruler,
                pencilPosition = ruler.model.get("_path").children["pencil-helper"].children["pencil-point"].position,
                pointOnArc = ruler._getPointOnArc(pencilPosition),
                oldState = {},
                arcCenter = ruler.model.getRulerCenter();

            if (ruler.model.get("_renderData").isActive === false) {
                return;
            }

            this.model.set("startPoint", new ConstructionTool.Models.Point(pointOnArc.x, pointOnArc.y));
            this.model.set("eventLastPoint", null);

            this.model.setOptions({
                "arcCenter": arcCenter
            });

            // Undo redo state saves
            oldState.bRemove = true;
            oldState.id = this.getId();
            this._savePreviousState(oldState);
        },

        "processTouchMove": function() {
            var model = this.model,
                ruler = this._ruler,
                pencilPosition = ruler.model.get("_path").children["pencil-helper"].children["pencil-point"].position,
                pointOnArc = ruler._getPointOnArc(pencilPosition),
                startPoint = model.get("startPoint"),
                arcCenter = model.get("_data").arcCenter,
                rotationAngle = null,
                throughPoint = null,
                endPoint = null,
                eventPointFromCenterAngle = null,
                eventLastPointFromCenterAngle = null;

            if (ruler.model.get("_renderData").isActive === false) {
                return;
            }

            // Calculate rotation angle
            eventPointFromCenterAngle = Math.atan2(pointOnArc.y - arcCenter.y, pointOnArc.x - arcCenter.x) * 180 / Math.PI;

            eventLastPointFromCenterAngle = Math.atan2(startPoint.y - arcCenter.y, startPoint.x - arcCenter.x) * 180 / Math.PI;

            rotationAngle = this.calculateRotationAngle(eventPointFromCenterAngle, eventLastPointFromCenterAngle);


            throughPoint = geomFunctions.rotatePoint(startPoint.x, startPoint.y, arcCenter.x, arcCenter.y, rotationAngle / 2, true);
            model.set("throughPoint", new ConstructionTool.Models.Point(throughPoint[0], throughPoint[1]));
            endPoint = geomFunctions.rotatePoint(startPoint.x, startPoint.y, arcCenter.x, arcCenter.y, rotationAngle, true);
            model.set("endPoint", new ConstructionTool.Models.Point(endPoint[0], endPoint[1]));

            this.drawIntermediate();

            //// To keep track of prev point
            model.set("startPoint", model.get("endPoint").clone());
        },

        "processTouchEnd": function() {
            var curState = {};

            // Saves undo-redo state
            curState = this.model.getCloneData();
            curState.id = this.getId();
            this._saveCurrentState(curState);
            this.trigger("equation-complete");
        },

        "drawIntermediate": function() {
            var model = this.model,
                style = this._getApplicableStrokeStyle(this.isSelected()),
                startPoint = model.get("startPoint"),
                throughPoint = model.get("throughPoint"),
                endPoint = model.get("endPoint"),
                arcCenter = model.get("_data").arcCenter,
                radius = geomFunctions.distance(arcCenter, startPoint),
                segments = [],
                angleFunc = null,
                fromAngle, toAngle, throughAngle, points = [],
                segmentsCounter, segmentsLength;

            angleFunc = function(point1, point2) {
                return Math.atan2(point1.y - point2.y, point1.x - point2.x);
            };
            fromAngle = angleFunc(startPoint, arcCenter);
            toAngle = angleFunc(endPoint, arcCenter);
            throughAngle = angleFunc(throughPoint, arcCenter);

            if (this._intermediatePath === null) {
                this._intermediatePath = new ConstructionTool.Views.PaperScope.Group();
            }

            segments = this._getArcSegments({
                "r": radius,
                "a": arcCenter.x,
                "b": arcCenter.y,
                "from": fromAngle,
                "via": throughAngle,
                "to": toAngle
            });

            segmentsLength = segments.length;
            for (segmentsCounter = 0; segmentsCounter < segmentsLength;) {
                points.push(new ConstructionTool.Models.Point(segments[segmentsCounter++], segments[segmentsCounter++]));
            }
            this.model._feedPoint(points);
            this.drawSegment(points);

            this.applyStyleToPathGroup(this._intermediatePath, style);
        },

        "drawSegment": function drawSegment(pointArray) {
            if (this._intermediatePath === null || typeof pointArray === "undefined") {
                return;
            }
            var paperScope = ConstructionTool.Views.PaperScope,
                pointsLength = pointArray.length,
                pointsCounter = 0,
                path = new paperScope.Path({
                    "strokeCap": "round"
                });

            for (; pointsCounter < pointsLength; pointsCounter++) {
                path.add(pointArray[pointsCounter]);
            }
            this._intermediatePath.addChild(path);
        },

        "_getArcSegments": function(constants) {
            var r = constants.r,
                epsilon = 0.1,
                delThetaSmall = epsilon / r,
                delTheta = Math.max(delThetaSmall, 0.01),
                a = constants.a,
                b = constants.b,
                from = constants.from,
                via = constants.via,
                to = constants.to,
                tempFrom = from,
                tempTo = to,
                lines = [],
                upWay, ang;

            from = Math.min(tempTo, tempFrom);
            to = Math.max(tempTo, tempFrom);
            upWay = Math.sin(from / 2) < Math.sin(via / 2) && Math.sin(via / 2) < Math.sin(to / 2);
            if (upWay) {
                while (from < 0) {
                    from += 2 * Math.PI;
                }
                while (via < from) {
                    via += 2 * Math.PI;
                }
                while (to < via) {
                    to += 2 * Math.PI;
                }
            } else {
                while (via > from) {
                    via -= 2 * Math.PI;
                }
                while (to > via) {
                    to -= 2 * Math.PI;
                }
                delTheta *= -1;
                delThetaSmall *= -1;
            }
            ang = from;

            function check(n) {
                if (upWay) {
                    return n < to;
                }
                return n > to;

            }
            while (check(ang)) {
                lines.push(a + r * Math.cos(ang), b + r * Math.sin(ang));
                if (!check(ang + delTheta) && Math.abs(delThetaSmall) < Math.abs(delTheta)) {
                    do {
                        delTheta /= 2;
                    } while (!check(ang + delTheta) && Math.abs(delTheta) > Math.abs(delThetaSmall));
                } else {
                    ang += delTheta;
                }
            }
            return lines;
        },

        "draw": function() {
            if (this._intermediatePath) {
                this._intermediatePath.remove();
                this._intermediatePath = null;
            }
            var points = this.model.getFedPoints(),
                pointCounter,
                pointsLength = points.length,
                paperScope = ConstructionTool.Views.PaperScope,
                style = this._getApplicableStrokeStyle(this.isSelected());


            this._intermediatePath = new paperScope.Group();

            for (pointCounter = 0; pointCounter < pointsLength; pointCounter++) {
                this.drawSegment(points[pointCounter]);
            }
            this.applyStyleToPathGroup(this._intermediatePath, style);
        },

        "translate": function(delta, bDraw) {
            if (this._intermediatePath === null) {
                return;
            }
            var points = [],
                pointCounter = null,
                pointsLength = null,
                path = this._intermediatePath,
                pathSegments = null,
                pathCounter = 0,
                tempPoints = null,
                pathLength = null,
                ModelPoint = ConstructionTool.Models.Point;

            if (bDraw === true) {
                path.position.y += delta.y;
                path.position.x += delta.x;
            }

            pathLength = path.children.length;
            for (; pathCounter < pathLength; pathCounter++) {
                pathSegments = path.children[pathCounter].segments;
                pointsLength = pathSegments.length;
                tempPoints = [];
                for (pointCounter = 0; pointCounter < pointsLength; pointCounter++) {
                    tempPoints.push(new ModelPoint(pathSegments[pointCounter].point));
                }
                points.push(tempPoints);
            }

            this.model.setRenderData({
                "dataPoints": points
            });
        },

        /**
         * calculateRotationAngle method returns angle between the two angle
         * @method calculateRotationAngle
         * @param startAngle {String} Starting angle
         * @param endAngle {String} Ending angle
         * @return {String}
         */
        // calculates rotation angle for drawing arc
        "calculateRotationAngle": function(startAngle, endAngle) {
            if (startAngle <= 180 && startAngle > 90 && endAngle <= -90 && endAngle > -180 ||
                startAngle <= -90 && startAngle > -180 && endAngle <= 180 && endAngle > 90) {
                return (startAngle + 360) % 360 - (endAngle + 360) % 360;
            }
            return startAngle - endAngle;

        }

    });

}(window.MathUtilities));
