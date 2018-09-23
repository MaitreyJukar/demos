/* globals $ */
var geomFunctions = (function() {
    "use strict";
    var object = {
        /**
            FOR CODE REVIEW
            This file is imported by workers.
            Since we cannot provide entire math-utilities to the worker object we need to provide the worker with an independent object, thus there is no namespace here.
        **/


        "isDebugMode": false,
        "THRESHOLD_VALUE": 1e-8,
        /**
         *It returns distance between two points
         *@method distance
         *@param {Object} point1 contain first point coordinates
         *@param {Object} point2 contain second point coordinates
         */
        "distance": function(point1, point2) {

            return Math.sqrt(Math.pow(point2.y - point1.y, 2) + Math.pow(point2.x - point1.x, 2));

        },
        /**
         *It is used to get distance between two points
         *@method distance
         *@param {Object} x1 Abscissa of first point
         *@param {Object} y1 Ordinate of first point
         *@param {Object} x2 Abscissa of second point
         *@param {Object} y2 Ordinate of second point
         */
        "distance2": function(x1, y1, x2, y2) {

            return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

        },

        "roundIfTooSmall": function(num) {
            var rounded = Math.round(num);

            return geomFunctions.compareWithThreshold(rounded, num) ? rounded : num;
        },

        "compareWithThreshold": function(num1, num2) {
            return Math.abs(num1 - num2) <= geomFunctions.THRESHOLD_VALUE;
        },

        "hypotenuse": function(n1, n2) {

            if (n1 === 0 && n2 === 0) {
                return 0;
            }
            if (Math.abs(n1) > Math.abs(n2)) {
                return Math.abs(n1) * Math.sqrt(Math.pow(n2 / n1, 2) + 1);
            }
            return Math.abs(n2) * Math.sqrt(Math.pow(n1 / n2, 2) + 1);
        },

        /**
         *It take points in sequence returns area of polygon
         *@method areaOfEllipse
         *@param {Number} a semi major axis of ellipse
         *@param {Number} b semi minor axis of ellipse
         */
        "areaOfEllipse": function(a, b) {

            return Math.PI * a * b;

        },

        /**
         *It adjusts raster so that it does not blur when given bounds x,y are in decimal value
         *@method nudgeRaster
         *@param {Object} raster of the image object.
         */
        "nudgeRaster": function(raster) {

            raster.bounds.x = Math.round(raster.bounds.x);
            raster.bounds.y = Math.round(raster.bounds.y);
        },

        /**
         *It return area of arc segments
         *@method areaOfArcSegment
         *@param {Object} source fundamental properties required to draw shape
         */
        "areaOfArcSegment": function(source) {
            var areaOfSector = geomFunctions.areaOfArcSector(source),
                pointArr = [
                    [source.x1, source.y1],
                    [source.a, source.b],
                    [source.x3, source.y3],
                    [source.x1, source.y1]
                ],
                areaOfTriangle = geomFunctions.areaOfIrregularPolygon(pointArr),
                HALF_ANGLE = 180;
            return Math.abs(geomFunctions.getArcAngle(source)) <= HALF_ANGLE ? areaOfSector - areaOfTriangle : areaOfSector + areaOfTriangle;
        },

        /**
         *It return area of arc sector
         *@method areaOfArcSector
         *@param {Object} source fundamental properties required to draw shape
         */
        "areaOfArcSector": function(source) {
            var FULL_ANGLE = 360;
            return Math.abs(geomFunctions.getArcAngle(source)) / FULL_ANGLE * (Math.PI * Math.pow(source.r, 2));
        },

        "pointLineDistance": function(constants, point) {
            return Math.abs((constants.a * point[0] + constants.b * point[1] + constants.c) / Math.sqrt(Math.pow(constants.a, 2) + Math.pow(constants.b, 2)));
        },

        "intersectionOfLines": function(x1, y1, x2, y2, x3, y3, x4, y4) {
            var det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4),
                x = null,
                y = null,
                num1 = (x1 * y2 - y1 * x2),
                num2 = (x3 * y4 - y3 * x4);
            if (det === 0) {
                return void 0;
            }

            x = (num1 * (x3 - x4) - (x1 - x2) * num2) / det;
            y = (num1 * (y3 - y4) - (y1 - y2) * num2) / det;
            return [x, y];
        },

        "intersectionOfCircles": function(xc1, yc1, xc2, yc2, r1, r2) {

            var distCenter1ToIntLine, distCenter2ToIntLine, point, point1, point2, resDistance, intersectionLine = {},
                lineJoiningCenters = {},
                r1Square = Math.pow(r1, 2),
                r2Square = Math.pow(r2, 2),
                r1SquareMinusr2Square = r1Square - r2Square,
                distInCenters = geomFunctions.distance2(xc1, yc1, xc2, yc2),
                distInCentersSquare = Math.pow(distInCenters, 2),
                distInCentersDouble = 2 * distInCenters;
            if (distInCenters > r1 + r2 || distInCenters < Math.abs(r1 - r2)) {
                return [];
            }
            distCenter1ToIntLine = (r1SquareMinusr2Square + distInCentersSquare) / distInCentersDouble;
            distCenter2ToIntLine = (-r1SquareMinusr2Square + distInCentersSquare) / distInCentersDouble;
            // perpendicular distance from intersection Point to point on line joining centers of circles
            resDistance = Math.sqrt(r1Square - Math.pow(distCenter1ToIntLine, 2));

            lineJoiningCenters.a = yc1 - yc2;
            lineJoiningCenters.b = -(xc1 - xc2);
            lineJoiningCenters.c = -lineJoiningCenters.b * yc1 - lineJoiningCenters.a * xc1;
            point1 = geomFunctions.getPointAtADistance(lineJoiningCenters.a, lineJoiningCenters.b, lineJoiningCenters.c, xc1, yc1, distCenter1ToIntLine);

            point2 = geomFunctions.getPointAtADistance(lineJoiningCenters.a, lineJoiningCenters.b, lineJoiningCenters.c, xc2, yc2, distCenter2ToIntLine);
            if (point1[0][0].toFixed(3) === point2[0][0].toFixed(3) && point1[0][1].toFixed(3) === point2[0][1].toFixed(3) ||
                point1[0][0].toFixed(3) === point2[1][0].toFixed(3) && point1[0][1].toFixed(3) === point2[1][1].toFixed(3)) { // fix up to 3 decimal places.
                point = point1[0];
            } else {
                point = point1[1];
            }

            intersectionLine.a = -lineJoiningCenters.b;
            intersectionLine.b = lineJoiningCenters.a;
            intersectionLine.c = -lineJoiningCenters.a * point[0] + lineJoiningCenters.b * point[1];
            return geomFunctions.getPointAtADistance(intersectionLine.a, intersectionLine.b, intersectionLine.c, point[0], point[1], resDistance);
        },

        "isArcPossible": function(x1, y1, x2, y2, x3, y3) {

            var r,
                circumCenter = geomFunctions.getTriangleCircumCentre(x1, y1, x2, y2, x3, y3);
            if (geomFunctions.isPaperRenderableValue(circumCenter[0]) && geomFunctions.isPaperRenderableValue(circumCenter[1])) {
                r = geomFunctions.distance2(x1, y1, circumCenter[0], circumCenter[1]);
                return geomFunctions.isPaperRenderableValue(r);
            } else {
                return false;
            }
        },

        // Given three collinear points p, q, r, the function checks if
        // point q lies on line segment 'pr'
        "onSegment": function(p, q, r) {

            return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
                q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
        },

        // To find orientation of ordered triplet (p, q, r).
        // The function returns following values
        // 0 --> p, q and r are collinear
        // 1 --> Clockwise
        // 2 --> Counterclockwise
        "orientation": function(p, q, r) {

            // See 10th slides from following link for derivation of the formula
            // http://www.dcs.gla.ac.uk/~pat/52233/slides/Geometry1x1.pdf
            var val = (q.y - p.y) * (r.x - q.x) -
                (q.x - p.x) * (r.y - q.y);

            if (val === 0) {
                return 0;
            } // collinear

            return val > 0 ? 1 : 2; // clock or counterclock wise
        },

        // The main function that returns true if line segment 'p1q1'
        // and 'p2q2' intersect.
        "doSegmentIntersect": function(p1, q1, p2, q2) {

            // Find the four orientations needed for general and
            // special cases
            var o1 = geomFunctions.orientation(p1, q1, p2),
                o2 = geomFunctions.orientation(p1, q1, q2),
                o3 = geomFunctions.orientation(p2, q2, p1),
                o4 = geomFunctions.orientation(p2, q2, q1);

            // General case
            if (o1 !== o2 && o3 !== o4) {
                return true;
            }

            // Special Cases
            // p1, q1 and p2 are collinear and p2 lies on segment p1q1
            if (o1 === 0 && geomFunctions.onSegment(p1, p2, q1)) {
                return true;
            }

            // p1, q1 and p2 are collinear and q2 lies on segment p1q1
            if (o2 === 0 && geomFunctions.onSegment(p1, q2, q1)) {
                return true;
            }

            // p2, q2 and p1 are collinear and p1 lies on segment p2q2
            if (o3 === 0 && geomFunctions.onSegment(p2, p1, q2)) {
                return true;
            }

            // p2, q2 and q1 are collinear and q1 lies on segment p2q2
            if (o4 === 0 && geomFunctions.onSegment(p2, q1, q2)) {
                return true;
            }

            return false; // Doesn't fall in any of the above cases
        },


        //according to Cohen-Sutherland algorithm
        "calculateLineOutCode": function(x, y, xmin, xmax, ymin, ymax, boundaryThreshold) {

            var code = 0,
                LEFT = 1,
                RIGHT = 2,
                BOTTOM = 4,
                TOP = 8;
            if (typeof boundaryThreshold === 'undefined' || boundaryThreshold === null) {
                boundaryThreshold = 0;
            }
            if (isNaN(x) || isNaN(y)) {
                return -1;
            }
            if (x <= xmin + boundaryThreshold) {
                code |= LEFT;
            } else if (x >= xmax - boundaryThreshold) {
                code |= RIGHT;
            }
            if (y <= ymin + boundaryThreshold) {
                code |= BOTTOM;
            } else if (y >= ymax - boundaryThreshold) {
                code |= TOP;
            }
            return code;
        },


        "doesLineIntersectRectangle": function(x0, y0, x1, y1, xmin, xmax, ymin, ymax) {

            var result;

            result = geomFunctions.doSegmentIntersect({
                "x": x0,
                "y": y0
            }, {
                "x": x1,
                "y": y1
            }, {
                "x": xmin,
                "y": ymin
            }, {
                "x": xmax,
                "y": ymin
            });
            if (result) {
                return true;
            }


            result = geomFunctions.doSegmentIntersect({
                "x": x0,
                "y": y0
            }, {
                "x": x1,
                "y": y1
            }, {
                "x": xmax,
                "y": ymin
            }, {
                "x": xmax,
                "y": ymax
            });
            if (result) {
                return true;
            }

            result = geomFunctions.doSegmentIntersect({
                "x": x0,
                "y": y0
            }, {
                "x": x1,
                "y": y1
            }, {
                "x": xmax,
                "y": ymax
            }, {
                "x": xmin,
                "y": ymax
            });
            if (result) {
                return true;
            }

            result = geomFunctions.doSegmentIntersect({
                "x": x0,
                "y": y0
            }, {
                "x": x1,
                "y": y1
            }, {
                "x": xmin,
                "y": ymax
            }, {
                "x": xmin,
                "y": ymin
            });

            return result;

        },

        "intersectionOfLineAndCircle": function(xc, yc, r, a, b, c) {

            var projOfCenterOnLine, distance, distOfCenterToLine;
            projOfCenterOnLine = geomFunctions.getProjectionOfPointOnLine(xc, yc, a, b, c);
            distOfCenterToLine = geomFunctions.distance2(xc, yc, projOfCenterOnLine[0], projOfCenterOnLine[1]);
            if (distOfCenterToLine > r && Math.abs(distOfCenterToLine - r) > this.THRESHOLD_VALUE) {
                return void 0;
            }
            if (Math.abs(distOfCenterToLine - r) < this.THRESHOLD_VALUE) {
                distance = 0;
            } else {
                distance = Math.sqrt(Math.pow(r, 2) - Math.pow(distOfCenterToLine, 2));
            }
            return geomFunctions.getPointAtADistance(a, b, c, projOfCenterOnLine[0], projOfCenterOnLine[1], distance);
        },
        "findSegmentPointAtADistance": function(startPoint, endPoint, distance) {
            var segmentDistance, ratio,
                pointX, pointY;

            segmentDistance = Math.sqrt(Math.pow(startPoint.x - endPoint.x, 2) + Math.pow(startPoint.y - endPoint.y, 2));
            ratio = segmentDistance === 0 ? 0 : distance / segmentDistance;
            pointX = (1 - ratio) * startPoint.x + ratio * endPoint.x;
            pointY = (1 - ratio) * startPoint.y + ratio * endPoint.y;
            return [pointX, pointY];
        },
        "getPointAtADistance": function(a, b, c, x, y, d) {

            var vx = -b,
                vy = a,
                ptDistance, resultPt = [
                    [],
                    []
                ],
                vxd,
                vyd;
            ptDistance = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
            vx /= ptDistance;
            vy /= ptDistance;
            vxd = vx * d;
            vyd = vy * d;
            resultPt[0][0] = x + vxd;
            resultPt[0][1] = y + vyd;
            resultPt[1][0] = x - vxd;
            resultPt[1][1] = y - vyd;
            return resultPt;
        },
        "mean": function(n1, n2) {
            if (n1 > 0 && n2 > 0) {
                return n1 + (n2 - n1) / 2;
            }
            return (n1 + n2) / 2;
        },

        "getLineABC": function(x1, y1, x2, y2, useThis) {

            var seed = useThis || {};
            seed.a = y2 - y1;
            seed.b = -(x2 - x1);
            seed.c = -seed.b * y1 - seed.a * x1;
            return seed;
        },

        "isPaperRenderableValue": function(val) {
            /* paper.js rendering causes problems when canvas co-ordinates goes beyond 10000 */
            return isFinite(val) && Math.abs(val) <= 10e10;
        },

        "getProjectionOfPointOnLine": function(x, y, a, b, c) {

            var cp = -a * y + b * x,
                det = Math.pow(a, 2) + Math.pow(b, 2);
            return [(-c * a + b * cp) / det, (-a * cp - b * c) / det];
        },

        "reflectPointAroundLine": function(x, y, a, b, c) {

            var coord = this.getProjectionOfPointOnLine(x, y, a, b, c),
                dx = coord[0] - x,
                dy = coord[1] - y;

            coord[0] += dx;
            coord[1] += dy;

            return coord;
        },

        /**
         *It take points in sequence returns area of polygon
         *@method areaOfIrregularPolygon
         *@param {Array} points contain list of points
         */
        "areaOfIrregularPolygon": function(points) {

            // push first point again in the array of points before calling this function. (i.e. for triangle 4 points should be present).
            var i, areal = 0,
                arear = 0;
            for (i = 0; i < points.length - 1; i++) {
                areal += points[i][0] * points[i + 1][1];
            }
            for (i = 0; i < points.length - 1; i++) {
                arear += points[i][1] * points[i + 1][0];
            }
            return Math.abs(areal - arear) / 2;
        },

        //-1 clockwise, 1 anticlockwise
        "getArcDirection": function(from, via, to) {

            var map = [{
                    "name": 'FROM',
                    "value": from
                }, {
                    "name": 'VIA',
                    "value": via
                }, {
                    "name": 'TO',
                    "value": to
                }],
                sortFunc = function(a, b) {
                    /* for angle markers drawn from point on axis or line parallel to axis
                       if two angles are having same value then to avoid sorting in such case
                       we are returning zero if they are equal */
                    if (a.value === b.value) {
                        return 0;
                    }
                    if (a.value > b.value) {
                        return 1;
                    }
                    return -1;
                },
                word = [],
                looper, temp;
            map.sort(sortFunc);


            for (looper in map) {
                word.push(map[looper].name.charAt(0));
            }

            while (word.length > 0 && word[0] !== 'F') {
                temp = word.shift();
                word.push(temp);
            }

            return word[1] === 'V' ? 1 : -1;

        },

        "isAngleInRegion": function(from, via, to, angle) {

            return geomFunctions.getArcDirection(from, via, to) === geomFunctions.getArcDirection(from, angle, to);
        },

        //radians only
        "normalizeAngle": function(value) {
            return value % (Math.PI * 2);
        },
        "getArcAngle": function(source, useRadians) {

            if (typeof source.x1 !== 'undefined' && typeof source.x3 !== 'undefined' && source.x1 === source.x3 && source.y1 === source.y3) { // circle case
                if (useRadians) {
                    return 2 * Math.PI;
                }
                return 360; // 360 is 2pi
            }
            return geomFunctions.calculateArcAngle(source.from, source.via, source.to, useRadians);
        },

        "createArc": function(radius, startAngle, viaAngle, endAngle, centerX, centerY) {

            // normalize startAngle, endAngle to [-2PI, 2PI]
            var EPSILON = 0.00001,
                twoPI = Math.PI * 2,
                curves = [],
                piOverTwo = Math.PI / 2,
                angleBetween = geomFunctions.calculateArcAngle(startAngle, viaAngle, endAngle, true),
                sgn = angleBetween > 0 ? 1 : -1,
                a1 = startAngle,
                via, totalAngle, a2, step, curvePoints = [];
            startAngle %= twoPI;
            endAngle %= twoPI;

            // Compute the sequence of arc curves, up to PI/2 at a time.  Total arc angle
            // is less than 2PI.

            if (!(isFinite(startAngle) && isFinite(viaAngle) && isFinite(endAngle))) {
                return void 0;
            }

            curves.push(curvePoints);

            for (totalAngle = angleBetween;;) {
                step = Math.min(Math.abs(totalAngle), piOverTwo);
                a2 = a1 + sgn * step;
                via = a1 + sgn * step / 2;

                geomFunctions.createSmallArc(radius, a1, via, a2, centerX, centerY, curvePoints);

                totalAngle -= sgn * step;
                a1 = a2;

                if (sgn >= 0 && totalAngle < EPSILON || sgn < 0 && totalAngle > -EPSILON) {
                    break;
                }
            }

            return curves;
        },

        "createSmallArc": function(r, a1, viaAngle, a2, centerX, centerY, curvePoints) {
            if (!(isFinite(a1) && isFinite(viaAngle) && isFinite(a2)) || r > 10e10) { // 10e10 is MAX value for radius
                return void 0;
            }
            a1 = geomFunctions.normalizeAngle(a1);
            a2 = geomFunctions.normalizeAngle(a2);
            viaAngle = geomFunctions.normalizeAngle(viaAngle);
            /*
             *  This algorithm is based on the approach described in:
             *  A. Riškus, "Approximation of a Cubic Bezier Curve by Circular Arcs and Vice Versa,"
             * Information Technology and Control, 35(4), 2006 pp. 371-378.
             *
             * Compute all four points for an arc that subtends the same total angle
             * but is centered on the X-axis
             */

            var a = (a2 - a1) / 2,
                x4 = r * Math.cos(a),
                y4 = r * Math.sin(a),
                x1 = x4,
                y1 = -y4,

                /* for calculation of control point,
                 * refer blog "http://hansmuller-flex.blogspot.in/2011/10/more-about-approximating-circular-arcs.html"
                 */
                q1 = Math.pow(x1, 2) + Math.pow(y1, 2),
                q2 = q1 + x1 * x4 + y1 * y4,
                k2 = 4 / 3 * (Math.sqrt(2 * q1 * q2) - q2) / (x1 * y4 - y1 * x4),

                x2 = x1 - k2 * y1,
                y2 = y1 + k2 * x1,
                x3 = x2,
                y3 = -y2,

                // Find the arc points actual locations by computing (x1, y1) and (x4, y4)
                // and rotating the control points by a + a1
                ar = a + a1,
                cosAr = Math.cos(ar),
                sinAr = Math.sin(ar);
            curvePoints.push(
                centerX + r * Math.cos(a1),
                centerY + r * Math.sin(a1),
                centerX + x2 * cosAr - y2 * sinAr,
                centerY + x2 * sinAr + y2 * cosAr,
                centerX + x3 * cosAr - y3 * sinAr,
                centerY + x3 * sinAr + y3 * cosAr,
                centerX + r * Math.cos(a2),
                centerY + r * Math.sin(a2));
        },

        "calculateArcAngle": function(from, via, to, useRadians) {
            var diff,
                start, end, degAng,
                clockWise = geomFunctions.getArcDirection(from, via, to);
            if (from > to) {
                start = from - Math.PI * 2;
            } else {
                start = from;
            }
            end = to;
            diff = end - start;
            if (clockWise < 0) {
                diff = -(2 * Math.PI - Math.abs(diff));
            }
            degAng = diff * 180 / Math.PI; // 180 is pi radians
            if (useRadians) {
                return diff;
            }
            return degAng;
        },

        "getPointOnArcFromOffset": function(seed, offset) {
            //This function takes offset for arcLength and returns point on arc at offset.
            // fromPoint is point from which offset is to be calculated (can be 1 or 3).
            var arcAngle = geomFunctions.getArcAngle(seed, true),
                angle = arcAngle * offset;

            return geomFunctions.rotatePoint(seed.x1, seed.y1, seed.a, seed.b, angle);
        },

        "isPointProjectionOnArc": function(seed, point) {

            var pointAngle = Math.atan2(point[1] - seed.b, point[0] - seed.a);
            return geomFunctions.isAngleInRegion(seed.from, seed.via, seed.to, pointAngle);
        },
        "getPositiveAngle": function(angle) {

            if (angle < 0) {
                angle += 2 * Math.PI;
            }
            return angle;
        },
        "reflectLineAroundLine": function(a1, b1, c1, a, b, c) {

            return [
                a1 * (Math.pow(b, 2) - Math.pow(a, 2)) - 2 * b1 * a * b,
                b1 * (Math.pow(a, 2) - Math.pow(b, 2)) - 2 * a1 * a * b,
                c1 * (Math.pow(a, 2) + Math.pow(b, 2)) - 2 * c * (a * a1 + b * b1)
            ];
        },
        "dilateLine": function(a, b, c, x, y, params) {

            var cp = -a * y + b * x,
                det = Math.pow(a, 2) * Math.pow(b, 2),
                coord = [(-c * a + b * cp) / det, (-a * cp - b * c) / det];

            return this.dilatePoint(coord[0], coord[1], x, y, params);
        },

        "getRotatedImageMatrix": function(matrix, anchor, params) {

            var angle = -params.angle * Math.PI / 180, // 180 is pi radians
                translationMatrix = [
                    [1, 0, 0],
                    [0, 1, 0],
                    [-anchor[0], -anchor[1], 1]
                ],
                rotationMatrix = [
                    [Math.cos(angle), Math.sin(angle), 0],
                    [-Math.sin(angle), Math.cos(angle), 0],
                    [0, 0, 1]
                ],
                translationInverseMatrix = [
                    [1, 0, 0],
                    [0, 1, 0],
                    [anchor[0], anchor[1], 1]
                ],
                rasterImageMatrix = [
                    [matrix._a, matrix._c, 0],
                    [matrix._b, matrix._d, 0],
                    [matrix._tx, matrix._ty, 1]
                ];

            rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, translationMatrix);
            rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, rotationMatrix);
            rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, translationInverseMatrix);

            return matrix.set(rasterImageMatrix[0][0], rasterImageMatrix[0][1], rasterImageMatrix[1][0], rasterImageMatrix[1][1], rasterImageMatrix[2][0], rasterImageMatrix[2][1]);
        },

        "getTranslatedImageMatrix": function(matrix, params) {

            var tx = params.dx,
                ty = params.dy,
                translationMatrix = [
                    [1, 0, 0],
                    [0, 1, 0],
                    [tx, ty, 1]
                ],
                rasterImageMatrix = [
                    [matrix._a, matrix._c, 0],
                    [matrix._b, matrix._d, 0],
                    [matrix._tx, matrix._ty, 1]
                ];

            rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, translationMatrix);

            return matrix.set(rasterImageMatrix[0][0], rasterImageMatrix[0][1], rasterImageMatrix[1][0], rasterImageMatrix[1][1], rasterImageMatrix[2][0], rasterImageMatrix[2][1]);

        },

        "getDilatedImageMatrix": function(matrix, matrixCenter, anchor, params) {

            var newCenter = this.dilatePoint(matrixCenter[0], matrixCenter[1], anchor[0], anchor[1], params),
                translationMatrix = [
                    [1, 0, 0],
                    [0, 1, 0],
                    [-matrixCenter[0], -matrixCenter[1], 1]
                ],
                scalingMatrix = [
                    [params.ratio, 0, 0],
                    [0, params.ratio, 0],
                    [0, 0, 1]
                ],
                translationInverseMatrix = [
                    [1, 0, 0],
                    [0, 1, 0],
                    [matrixCenter[0], matrixCenter[1], 1]
                ],
                rasterImageMatrix = [
                    [matrix._a, matrix._c, 0],
                    [matrix._b, matrix._d, 0],
                    [matrix._tx, matrix._ty, 1]
                ];

            rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, translationMatrix);
            rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, scalingMatrix);
            rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, translationInverseMatrix);

            translationMatrix = [
                [1, 0, 0],
                [0, 1, 0],
                [newCenter[0] - matrixCenter[0], newCenter[1] - matrixCenter[1], 1]
            ];

            rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, translationMatrix);

            return matrix.set(rasterImageMatrix[0][0], rasterImageMatrix[0][1], rasterImageMatrix[1][0], rasterImageMatrix[1][1], rasterImageMatrix[2][0], rasterImageMatrix[2][1]);
        },


        "getReflectedImageMatrix": function(matrix, lineConstants, anchor) {

            var slopeOfAnchor = -lineConstants.a / lineConstants.b,
                angle = Math.atan(slopeOfAnchor),
                translationMatrix = [
                    [1, 0, 0],
                    [0, 1, 0],
                    [-anchor[0], -anchor[1], 1]
                ],
                rotationMatrix = [
                    [Math.cos(angle), Math.sin(angle), 0],
                    [-Math.sin(angle), Math.cos(angle), 0],
                    [0, 0, 1]
                ],
                reflectionMatrix = [
                    [1, 0, 0],
                    [0, -1, 0],
                    [0, 0, 1]
                ],
                rotationInverseMatrix = [
                    [Math.cos(angle), -Math.sin(angle), 0],
                    [Math.sin(angle), Math.cos(angle), 0],
                    [0, 0, 1]
                ],
                translationInverseMatrix = [
                    [1, 0, 0],
                    [0, 1, 0],
                    [anchor[0], anchor[1], 1]
                ],
                rasterImageMatrix = [
                    [matrix._a, matrix._c, 0],
                    [matrix._b, matrix._d, 0],
                    [matrix._tx, matrix._ty, 1]
                ];

            rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, translationMatrix);
            rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, rotationMatrix);
            rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, reflectionMatrix);
            rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, rotationInverseMatrix);
            rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, translationInverseMatrix);

            return matrix.set(rasterImageMatrix[0][0], rasterImageMatrix[0][1], rasterImageMatrix[1][0], rasterImageMatrix[1][1], rasterImageMatrix[2][0], rasterImageMatrix[2][1]);
        },

        "matrixMultiplication": function(a, b) {

            var c = [
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0]
                ],
                i, j, k;

            for (i = 0; i < 3; i++) {
                for (j = 0; j < 3; j++) {
                    for (k = 0; k < 3; k++) {
                        c[i][j] += a[i][k] * b[k][j];
                    }
                }
            }
            return c;
        },

        "getPolarCoordinate": function(x, y, isDeg) {
            var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
                ang = Math.atan2(y, x);
            if (isDeg) {
                ang *= 180 / Math.PI; // 180 is pi radians
            }
            return [r, ang];
        },

        "dotProduct": function(x1, y1, x2, y2) {

            return x1 * x2 + y1 * y2;
        },

        "getSegmentParam": function(x1, y1, x2, y2, x3, y3) {
            var hypot = this.hypotenuse(x3 - x2, y3 - y2);
            if (hypot === 0) {
                return 0;
            }
            return this.dotProduct((x1 - x2) / hypot, (y1 - y2) / hypot, (x3 - x2) / hypot, (y3 - y2) / hypot);
        },


        "midPoint": function(point1, point2) {

            return [(point2[0] + point1[0]) / 2, (point2[1] + point1[1]) / 2];
        },

        "midPoint2": function(x1, y1, x2, y2) {

            return [(x1 + x2) / 2, (y1 + y2) / 2];
        },

        "closestPointOnSegment": function(pointX, pointY, x1, y1, x2, y2) {
            var param = this.getSegmentParam(pointX, pointY, x1, y1, x2, y2);

            if (param <= 0) {
                return [x1, y1];
            }
            if (param >= 1) {
                return [x2, y2];
            }
            return [x1 + param * (x2 - x1), y1 + param * (y2 - y1)];
        },

        "getPointOffset": function(x1, y1, x2, y2, x, y) {
            var segDistance, distanceFromStartPoint, distanceFromEndPoint;

            segDistance = geomFunctions.distance2(x1, y1, x2, y2);
            distanceFromStartPoint = geomFunctions.distance2(x1, y1, x, y);
            distanceFromEndPoint = geomFunctions.distance2(x2, y2, x, y);
            if (distanceFromEndPoint > segDistance && distanceFromEndPoint > distanceFromStartPoint) {
                return -distanceFromStartPoint / segDistance;
            }
            return distanceFromStartPoint / segDistance;

        },


        "getPointPositionFromOffset": function(x1, y1, x2, y2, offset) {
            var segDistance = geomFunctions.distance2(x1, y1, x2, y2),
                distanceFromStartPoint, distanceFromEndPoint, ratio, point = [],
                compRatio;
            if (offset < 0) {
                distanceFromStartPoint = -offset * segDistance;
                distanceFromEndPoint = segDistance + distanceFromStartPoint;
            } else {
                distanceFromStartPoint = offset * segDistance;
                if (offset > 1) {
                    distanceFromEndPoint = distanceFromStartPoint - segDistance;
                } else {
                    distanceFromEndPoint = segDistance - distanceFromStartPoint;
                }
            }
            if (distanceFromStartPoint < distanceFromEndPoint) {
                ratio = distanceFromEndPoint / segDistance;
                compRatio = 1 - ratio;
                point[0] = compRatio * x2 + ratio * x1;
                point[1] = compRatio * y2 + ratio * y1;
            } else {
                ratio = distanceFromStartPoint / segDistance;
                compRatio = 1 - ratio;
                point[0] = compRatio * x1 + ratio * x2;
                point[1] = compRatio * y1 + ratio * y2;
            }
            return point;
        },
        "pointAtADistanceFromMidPoint": function(x1, y1, x2, y2, d) {
            var midpoint = geomFunctions.midPoint2(x1, y1, x2, y2),
                ang = Math.atan2(x1 - x2, y2 - y1);
            return [midpoint[0] + d * Math.cos(ang), midpoint[1] + d * Math.sin(ang)];
        },

        "pointAtADistanceFromMidPointWithBetterName": function(x1, y1, x2, y2, x3, y3, x4, y4, d) {
            var midpoint1 = geomFunctions.midPoint2(x1, y1, x2, y2),
                midpoint2 = geomFunctions.midPoint2(x3, y3, x4, y4),
                ang = Math.atan2(midpoint1[1] - midpoint2[1], midpoint1[0] - midpoint2[0]);

            return [midpoint1[0] + d * Math.cos(ang), midpoint1[1] + d * Math.sin(ang)];
        },

        "distanceToSegment": function(x1, y1, x2, y2, x3, y3) {
            var point = this.closestPointOnSegment(x1, y1, x2, y2, x3, y3);
            return this.hypotenuse(x1 - point[0], y1 - point[1]);
        },

        /**
         *It return parameter value of given point on parabola
         *@method getParameterOfParabola
         *@param {Number} i Abscissa of focus of parabola
         *@param {Namber} j Ordinate of focus of parabola
         *@param {Number} p translation of parabola in x direction
         *@param {Number} q translation of parabola in y direction
         *@param {Number} x1 Abscissa of point on parabola
         *@param {Namber} y1 Ordinate of point on parabola
         */
        "getParameterOfParabola": function(i, j, p, q, x1, y1) {
            var abscissaDiff = i - p,
                ordinateDiff = j - q,
                a = Math.sqrt(Math.pow(abscissaDiff, 2) + Math.pow(ordinateDiff, 2)),
                d = Math.atan(ordinateDiff / abscissaDiff);
            return (Math.cos(d) * (y1 - q) - Math.sin(d) * (x1 - p)) / (2 * a); // offset
        },
        /**
         *It return parameter value of given point on hyperbola
         *@method getParameterOfHyperbola
         *@param {Number} i Abscissa of first focus of hyperbola
         *@param {Namber} j Ordinate of first focus of hyperbola
         *@param {Number} k Abscissa of first focus of hyperbola
         *@param {Namber} l Ordinate of first focus of hyperbola
         *@param {Namber} d angle of axis of hyperbola with respect to x-axis
         *@param {Namber} b semi major axis of hyperbola
         *@param {Number} p translation of hyperbola in x direction
         *@param {Number} q translation of hyperbola in y direction
         *@param {Number} x1 Abscissa of point on hyperbola
         *@param {Namber} y1 Ordinate of point on hyperbola
         */
        "getParameterOfHyperbola": function(p, q, b, d, x1, y1, k, l, i, j) {
            var dist1 = Math.sqrt(Math.pow(x1 - k, 2) + Math.pow(y1 - l, 2)),
                dist2 = Math.sqrt(Math.pow(x1 - i, 2) + Math.pow(y1 - j, 2)),
                offset = Math.atan((Math.cos(d) * (y1 - q) - Math.sin(d) * (x1 - p)) / b);
            if (dist1 < dist2) {
                return offset;
            }
            return -Math.PI + offset;
        },
        /**
         *It return parameter value of given point on ellipse
         *@method getParameterOfEllipse
         *@param {Number} i Abscissa of first focus of ellipse
         *@param {Namber} j Ordinate of first focus of ellipse
         *@param {Number} k Abscissa of first focus of ellipse
         *@param {Namber} l Ordinate of first focus of ellipse
         *@param {Namber} d angle of axis of ellipse with respect to x-axis
         *@param {Namber} a semi major axis of ellipse
         *@param {Namber} b semi minor axis of ellipse
         *@param {Number} p translation of hyperbola in x ellipse
         *@param {Number} q translation of hyperbola in y ellipse
         *@param {Number} x1 Abscissa of point on ellipse
         *@param {Namber} y1 Ordinate of point on ellipse
         */
        "getParameterOfEllipse": function(a, p, q, b, d, x1, y1, k, l, i, j) {
            var dist1 = Math.sqrt(Math.pow(x1 - k, 2) + Math.pow(y1 - l, 2)),
                dist2 = Math.sqrt(Math.pow(x1 - i, 2) + Math.pow(y1 - j, 2)),
                offset = Math.atan(a * (Math.cos(d) / (x1 - p) - Math.sin(d) / (y1 - q)) / (b *
                    (Math.cos(d) / (y1 - q) + Math.sin(d) / (x1 - p))));

            if (dist1 < dist2) {
                return offset;
            }
            if (offset < 0) {
                return Math.PI + offset;
            }
            return -Math.PI + offset;
        },

        "angleBetweenPoints": function(x1, y1, x2, y2, x3, y3, isDeg) {
            if (Math.abs(x1 - x2) < this.THRESHOLD_VALUE && Math.abs(y1 - y2) < this.THRESHOLD_VALUE ||
                Math.abs(x2 - x3) < this.THRESHOLD_VALUE && Math.abs(y2 - y3) < this.THRESHOLD_VALUE) {
                return void 0;
            }

            var ang = Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y1 - y2, x1 - x2);
            return isDeg ? ang * 180 / Math.PI : ang; // 180 is pi radians
        },

        "getAngleBetweenLines": function(x1, y1, x2, y2, x3, y3, x4, y4) {
            var angle1, angle2, angleDifference;

            angle1 = Math.atan2(y2 - y1, x2 - x1);
            angle2 = Math.atan2(y4 - y3, x4 - x3);

            angleDifference = angle2 - angle1;

            angleDifference = Math.abs(angleDifference * 180 / Math.PI);

            if (angleDifference > 90) {
                angleDifference = 180 - angleDifference;
            }

            return angleDifference;
        },

        "smallerAngleBetweenPoints": function(x1, y1, x2, y2, x3, y3, isDeg) {
            var ang = this.angleBetweenPoints(x1, y1, x2, y2, x3, y3, false);
            if (Math.abs(ang) > Math.PI) {
                if (ang > 0) {
                    ang = Math.PI * 2 - ang;
                } else {
                    ang += Math.PI * 2;
                    ang = -ang;
                }
            }
            return isDeg ? ang * 180 / Math.PI : ang; // 180 is pi radians
        },

        "rotatePoint": function(x, y, xc, yc, angle, isDeg, reverse) {
            if (isDeg) {
                angle *= Math.PI / 180; // 180 is pi radians
            }
            if (reverse) {
                angle *= -1;
            }
            var c = Math.cos(angle),
                s = Math.sin(angle),
                compXC = x - xc,
                compYC = y - yc;

            return [xc + compXC * c - compYC * s, yc + compXC * s + compYC * c];
        },
        "rotateLine": function(a, b, c, xc, yc, angle, isDeg) {
            if (isDeg) {
                angle *= Math.PI / 180; // 180 is pi radians
            }
            var cosOfAngle = Math.cos(angle),
                sinOfAngle = Math.sin(angle);
            return [
                a * cosOfAngle - b * sinOfAngle,
                a * sinOfAngle + b * cosOfAngle,
                a * xc + b * yc + c - (a * xc + b * yc) * cosOfAngle - (a * yc - b * xc) * sinOfAngle
            ];
        },
        "getPolarCoordinates": function(x, y, xc, yc, isDeg) {
            var r,
                dx = x - xc,
                dy = y - yc,
                theta = Math.atan2(dy, dx);
            if (theta < 0) {
                theta += 2 * Math.PI;
            }
            if (isDeg) {
                theta *= 180 / Math.PI; // 180 is pi radians
            }
            r = this.distance2(x, y, xc, yc);
            return [r, theta];
        },
        "getCartesianCoordinates": function(xc, yc, r, theta, isDeg) {
            if (isDeg) {
                theta *= Math.PI / 180; // 180 is pi radians
            }
            return [xc + r * Math.cos(theta), yc + r * Math.sin(theta)];
        },
        "translatePoint": function(x, y, params, reverse) {
            var factor = reverse ? -1 : 1;
            if (params.coordinateSystem === 'polar') {
                return this.rotatePoint(x + params.r, y, x, y, params.angle, true, reverse);
            }
            return [x + params.dx * factor, y + params.dy * factor];
        },

        "getTriangleCircumCentre": function(x1, y1, x2, y2, x3, y3) {
            var d = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)),
                x1y1AddSquare = Math.pow(x1, 2) + Math.pow(y1, 2),
                x2y2AddSquare = Math.pow(x2, 2) + Math.pow(y2, 2),
                x3y3AddSquare = Math.pow(x3, 2) + Math.pow(y3, 2),
                xc = (x1y1AddSquare * (y2 - y3) + x2y2AddSquare * (y3 - y1) + x3y3AddSquare * (y1 - y2)) / d,
                yc = (x1y1AddSquare * (x3 - x2) + x2y2AddSquare * (x1 - x3) + x3y3AddSquare * (x2 - x1)) / d;

            return [xc, yc];
        },

        "getTriangleIncentre": function(x1, y1, x2, y2, x3, y3) {
            var a = this.distance2(x1, y1, x2, y2),
                b = this.distance2(x1, y1, x3, y3),
                c = this.distance2(x3, y3, x2, y2),
                p = a + b + c;

            return [(a * x3 + b * x2 + c * x1) / p, (a * y3 + b * y2 + c * y1) / p];
        },

        "dilatePoint": function(x, y, xc, yc, params) {
            return [xc - (xc - x) * params.ratio, yc - (yc - y) * params.ratio];
        },

        "getXYInterceptsOfLine": function(a, b, c) {
            // Equation of line is in form ax+by+c=0
            var xIntercept, yIntercept;
            if (a === 0) {
                xIntercept = null;
            } else {
                xIntercept = -c / a;
            }
            if (b === 0) {
                yIntercept = null;
            } else {
                yIntercept = -c / b;
            }
            return {
                "xIntercept": xIntercept,
                "yIntercept": yIntercept
            };
        },

        "getCanvasCoordinates": function(event) {
            return [event.point.x, event.point.y];
        },

        "traceConsole": function(string) {
            /*eslint-disable no-console,no-undef*/
            if (this.isDebugMode === true) {
                console.log(string);
            }
            /*eslint-enable no-console,no-undef*/
        },

        "calculatePerimeter": function(sourceData) {
            var perimeter = 0,
                distanceBetweenTwoPts, arrayOfPoints = [],
                i, xCoord, yCoord, xString = 'x',
                yString = 'y',
                lengthOfObj = Object.keys(sourceData[0]).length,
                HALF = 0.5,
                numberOfPoints = lengthOfObj * HALF;
            for (i = 0; i < numberOfPoints; i++) {
                xString += i;
                yString += i;
                xCoord = sourceData[0][xString];
                yCoord = sourceData[0][yString];
                arrayOfPoints.push([xCoord, yCoord]);
                xString = 'x';
                yString = 'y';
            }
            arrayOfPoints.push(arrayOfPoints[0]);
            for (i = 0; i < numberOfPoints; i++) {
                distanceBetweenTwoPts = geomFunctions.distance2(arrayOfPoints[i][0], arrayOfPoints[i][1], arrayOfPoints[i + 1][0], arrayOfPoints[i + 1][1]);
                perimeter += distanceBetweenTwoPts;
            }
            return perimeter;
        },

        "convertExponentialToDecimal": function(exponentialNumber) {
            var exponent, significant, indexOfE, indexOfDot, decimalNumber,
                noOfDigitsAfterDecimalPt, extraZeroesToAppend, extraZeroesToPrepend;

            exponentialNumber = exponentialNumber.toString();
            indexOfE = exponentialNumber.indexOf('e');

            if (indexOfE === -1) {
                return Number(exponentialNumber);
            }

            significant = exponentialNumber.substring(0, indexOfE);
            exponent = Number(exponentialNumber.substring(indexOfE + 1, exponentialNumber.length));

            indexOfDot = significant.indexOf('.');

            if (exponent < 0) {
                extraZeroesToPrepend = Math.abs(exponent) - 1;
                if (indexOfDot === -1) {
                    decimalNumber = significant;
                } else {
                    decimalNumber = significant.substring(0, indexOfDot) +
                        significant.substring(indexOfDot + 1, significant.length);
                }
                while (extraZeroesToPrepend > 0) {
                    decimalNumber = '0' + decimalNumber;
                    extraZeroesToPrepend--;
                }
                decimalNumber = '0.' + decimalNumber;
            } else {

                if (indexOfDot === -1) {
                    indexOfDot = significant.length;
                }

                if (significant !== 0) {
                    noOfDigitsAfterDecimalPt = significant.indexOf('.') === -1 ? 0 : significant.length - indexOfDot - 1;

                    if (noOfDigitsAfterDecimalPt <= exponent) {
                        decimalNumber = significant.substring(0, indexOfDot) +
                            significant.substring(indexOfDot + 1, significant.length);
                        extraZeroesToAppend = exponent - noOfDigitsAfterDecimalPt;
                        while (extraZeroesToAppend > 0) {
                            decimalNumber += '0';
                            extraZeroesToAppend--;
                        }
                    } else {
                        decimalNumber = significant.substring(0, indexOfDot) +
                            significant.substring(indexOfDot + 1, indexOfDot + 1 + exponent) + '.' +
                            significant.substring(indexOfDot + 1 + exponent, significant.length);
                    }
                }
            }

            return decimalNumber;

        }
    };
    return object;
})();
