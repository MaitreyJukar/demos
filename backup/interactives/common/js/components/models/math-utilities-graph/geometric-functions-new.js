var geomFunctions = {
    isDebugMode: false,
    /**
    *It returns distance between two points
    *@method distance
    *@param {Object} point1 contain first point coordinates
    *@param {Object} point2 contain second point coordinates
    */
    distance: function distance(point1, point2) {
        return Math.sqrt((point2.y - point1.y) * (point2.y - point1.y) + (point2.x - point1.x) * (point2.x - point1.x));

    },
    /**
    *It is used to get distance between two points
    *@method distance
    *@param {Object} x1 Abscissa of first point
    *@param {Object} y1 Ordinate of first point 
    *@param {Object} x2 Abscissa of second point
    *@param {Object} y2 Ordinate of second point 
    */
    distance2: function distance2(x1, y1, x2, y2) {
        return Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));

    },

    hypotenuse: function (n1, n2) {
        if (n1 === 0 && n2 === 0) {
            return 0;
        }
        else {
            if (Math.abs(n1) > Math.abs(n2)) {
                return Math.abs(n1) * Math.sqrt((n2 / n1) * (n2 / n1) + 1);
            }
            else {
                return Math.abs(n2) * Math.sqrt((n1 / n2) * (n1 / n2) + 1);
            }
        }
    },
    /**
    *It take points in sequence returns area of polygon 
    *@method areaOfIrregularPolygon
    *@param {Array} points contain list of points 
    */

    /**
    *It take points in sequence returns area of polygon 
    *@method areaOfEllipse
    *@param {Number} a semi major axis of ellipse
    *@param {Number} b semi minor axis of ellipse
    */
    areaOfEllipse: function areaOfEllipse(a, b) {
        var area;
        area = Math.PI * a * b;
        return area;

    },
    /**
    *It return area of arc segments 
    *@method areaOfArcSegament
    *@param {Object} source fundamental properties required to draw shape
    */
    areaOfArcSegament: function areaOfArcSegament(source) {
        var area, areaOfSector, areaOfTraingle, pointArr;
        areaOfSector = geomFunctions.areaOfArcSector(source);
        pointArr = [[source.x1, source.y1], [source.a, source.b], [source.x3, source.y3], [source.x1, source.y1]];
        areaOfTraingle = geomFunctions.areaOfIrregularPolygon(pointArr);
        area = areaOfTraingle + areaOfSector;
        return area;
    },
    /**
    *It return area of arc sector 
    *@method areaOfArcSegament
    *@param {Object} source fundamental properties required to draw shape
    */
    areaOfArcSector: function areaOfArcSector(source) {
        var arcAngle, area;
        arcAngle = geomFunctions.getArcAngle(source);
        area = (arcAngle / 360) * (Math.PI * source.r * source.r);
        return area;

    },
    intersectionOfLines: function intersectionOfLines(x1, y1, x2, y2, x3, y3, x4, y4) {
        var det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (det === 0) {
            return;
        }

        var x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / det;
        var y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / det;
        return [x, y];
    },
    intersectionOfCircles: function intersectionOfCircles(xc1, yc1, xc2, yc2, r1, r2) {
        var distInCenters, distCenter1ToIntLine, distCenter2ToIntLine, point, point1, point2, resDistance, intersectionLine = {}, lineJoiningCenters = {}, resultPoints = [],
            distInCenters = geomFunctions.distance2(xc1, yc1, xc2, yc2);
        if (distInCenters > (r1 + r2)) {
            return resultPoints;
        }
        if (distInCenters < Math.abs(r1 - r2)) {
            return resultPoints;
        }
        distCenter1ToIntLine = ((r1 * r1) - (r2 * r2) + (distInCenters * distInCenters)) / (2 * distInCenters);
        distCenter2ToIntLine = ((r2 * r2) - (r1 * r1) + (distInCenters * distInCenters)) / (2 * distInCenters);
        // perpendicular distance from intersection Point to point on line joining centers of circles
        resDistance = Math.sqrt((r1 * r1) - (distCenter1ToIntLine * distCenter1ToIntLine));

        lineJoiningCenters.a = yc1 - yc2;
        lineJoiningCenters.b = -(xc1 - xc2);
        lineJoiningCenters.c = -lineJoiningCenters.b * yc1 - lineJoiningCenters.a * xc1;
        point1 = geomFunctions.getPointAtADistance(lineJoiningCenters.a, lineJoiningCenters.b, lineJoiningCenters.c, xc1, yc1, distCenter1ToIntLine);

        point2 = geomFunctions.getPointAtADistance(lineJoiningCenters.a, lineJoiningCenters.b, lineJoiningCenters.c, xc2, yc2, distCenter2ToIntLine);
        if ((point1[0][0].toFixed(3) === point2[0][0].toFixed(3) && point1[0][1].toFixed(3) === point2[0][1].toFixed(3)) || (point1[0][0].toFixed(3) === point2[1][0].toFixed(3) && point1[0][1].toFixed(3) === point2[1][1].toFixed(3))) {
            point = point1[0];
        }
        else {
            point = point1[1];
        }

        intersectionLine.a = -lineJoiningCenters.b;
        intersectionLine.b = lineJoiningCenters.a;
        intersectionLine.c = -lineJoiningCenters.a * point[0] + lineJoiningCenters.b * point[1];
        resultPoints = geomFunctions.getPointAtADistance(intersectionLine.a, intersectionLine.b, intersectionLine.c, point[0], point[1], resDistance);
        return resultPoints;


    },

    // Given three colinear points p, q, r, the function checks if
    // point q lies on line segment 'pr'
    onSegment: function (p, q, r) {
        return (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y));
    },

    // To find orientation of ordered triplet (p, q, r).
    // The function returns following values
    // 0 --> p, q and r are colinear
    // 1 --> Clockwise
    // 2 --> Counterclockwise
    orientation: function (p, q, r) {
        // See 10th slides from following link for derivation of the formula
        // http://www.dcs.gla.ac.uk/~pat/52233/slides/Geometry1x1.pdf
        var val = (q.y - p.y) * (r.x - q.x) -
                  (q.x - p.x) * (r.y - q.y);

        if (val == 0) return 0;  // colinear

        return (val > 0) ? 1 : 2; // clock or counterclock wise
    },

    // The main function that returns true if line segment 'p1q1'
    // and 'p2q2' intersect.
    doSegmentIntersect: function (p1, q1, p2, q2) {
        // Find the four orientations needed for general and
        // special cases
        var o1 = geomFunctions.orientation(p1, q1, p2);
        var o2 = geomFunctions.orientation(p1, q1, q2);
        var o3 = geomFunctions.orientation(p2, q2, p1);
        var o4 = geomFunctions.orientation(p2, q2, q1);

        // General case
        if (o1 != o2 && o3 != o4)
            return true;

        // Special Cases
        // p1, q1 and p2 are colinear and p2 lies on segment p1q1
        if (o1 == 0 && geomFunctions.onSegment(p1, p2, q1)) return true;

        // p1, q1 and p2 are colinear and q2 lies on segment p1q1
        if (o2 == 0 && geomFunctions.onSegment(p1, q2, q1)) return true;

        // p2, q2 and p1 are colinear and p1 lies on segment p2q2
        if (o3 == 0 && geomFunctions.onSegment(p2, p1, q2)) return true;

        // p2, q2 and q1 are colinear and q1 lies on segment p2q2
        if (o4 == 0 && geomFunctions.onSegment(p2, q1, q2)) return true;

        return false; // Doesn't fall in any of the above cases
    },


    //according to Cohen-Sutherland algorithm 
    calculateLineOutCode: function (x, y, xmin, xmax, ymin, ymax, boundaryThreshold) {
        var code = 0, LEFT = 1, RIGHT = 2, BOTTOM = 4, TOP = 8;
        if (typeof boundaryThreshold === 'undefined' || boundaryThreshold === null) {
            boundaryThreshold = 0;
        }
        if (x <= xmin + boundaryThreshold) {
            code |= LEFT;
        }
        else if (x >= xmax - boundaryThreshold) {
            code |= RIGHT;
        }
        if (y <= ymin + boundaryThreshold) {
            code |= BOTTOM;
        }
        else if (y >= ymax - boundaryThreshold) {
            code |= TOP;
        }
        return code;
    },


    doesLineIntersectRectangle: function (x0, y0, x1, y1, xmin, xmax, ymin, ymax) {

        var result;

        result = geomFunctions.doSegmentIntersect({ x: x0, y: y0 }, { x: x1, y: y1 },
        { x: xmin, y: ymin }, { x: xmax, y: ymin });
        if (result) return true;


        result = geomFunctions.doSegmentIntersect({ x: x0, y: y0 }, { x: x1, y: y1 },
        { x: xmax, y: ymin }, { x: xmax, y: ymax });
        if (result) return true;

        result = geomFunctions.doSegmentIntersect({ x: x0, y: y0 }, { x: x1, y: y1 },
        { x: xmax, y: ymax }, { x: xmin, y: ymax });
        if (result) return true;

        result = geomFunctions.doSegmentIntersect({ x: x0, y: y0 }, { x: x1, y: y1 },
        { x: xmin, y: ymax }, { x: xmin, y: ymin });
        if (result) return true;


        return false;

    },

    /*doesLineIntersectRectangle:function(x0, y0, x1, y1,xmin,xmax,ymin,ymax) {
    var outcode0 = geomFunctions.calculateLineOutCode(x0, y0, xmin, xmax, ymin, ymax),
    outcode1 = geomFunctions.calculateLineOutCode(x1, y1, xmin, xmax, ymin, ymax);

    return (outcode0 & outcode1);

    },*/


    //cohen sutherland algorithm>>> NOT TESTED VERIFY BEFORE USE
    lineClipWithRectangle: function (x0, y0, x1, y1, xmin, xmax, ymin, ymax) {
        var outcode0 = geomFunctions.calculateLineOutCode(x0, y0),
            outcode1 = geomFunctions.calculateLineOutCode(x1, y1),
            accept = false, x, y, outcodeOut, LEFT = 1, RIGHT = 2, BOTTOM = 4, TOP = 8;


        while (true) {
            if (!(outcode0 | outcode1)) {
                accept = true;
                break;
            }
            else if (outcode0 & outcode1) {
                break;
            }
            else {
                outcodeOut = outcode0 ? outcode0 : outcode1;

                if (outcodeOut & TOP) {
                    x = x0 + (x1 - x0) * (ymax - y0) / (y1 - y0);
                    y = ymax;
                }
                else if (outcodeOut & BOTTOM) { // point is below the clip rectangle
                    x = x0 + (x1 - x0) * (ymin - y0) / (y1 - y0);
                    y = ymin;
                } else if (outcodeOut & RIGHT) {  // point is to the right of clip rectangle
                    y = y0 + (y1 - y0) * (xmax - x0) / (x1 - x0);
                    x = xmax;
                } else if (outcodeOut & LEFT) {   // point is to the left of clip rectangle
                    y = y0 + (y1 - y0) * (xmin - x0) / (x1 - x0);
                    x = xmin;
                }

                // Now we move outside point to intersection point to clip
                // and get ready for next pass.
                if (outcodeOut == outcode0) {
                    x0 = x;
                    y0 = y;
                    outcode0 = ComputeOutCode(x0, y0);
                } else {
                    x1 = x;
                    y1 = y;
                    outcode1 = ComputeOutCode(x1, y1);
                }


            }
        }

        if (accept) {
            return {
                x0: x0,
                y0: y0,
                x1: x1,
                y1: y1
            };
        }
        else {
            return;
        }
    },

    intersectionOfLineAndCircle: function intersectionOfLineAndCircle(xc, yc, r, a, b, c) {
        var projOfCenterOnLine, distance, distOfCenterToLine, resultPoints;
        projOfCenterOnLine = geomFunctions.getProjectionOfPointOnLine(xc, yc, a, b, c);
        distOfCenterToLine = geomFunctions.distance2(xc, yc, projOfCenterOnLine[0], projOfCenterOnLine[1]);
        if (distOfCenterToLine > r) {
            return;
        }
        distance = Math.sqrt((r * r) - (distOfCenterToLine * distOfCenterToLine));
        resultPoints = geomFunctions.getPointAtADistance(a, b, c, projOfCenterOnLine[0], projOfCenterOnLine[1], distance);
        return resultPoints;
    },
    getPointAtADistance: function getPointAtADistance(a, b, c, x, y, d) {
        var vx, vy, ptDistance, resultPt = [[], []];
        vx = -b;
        vy = a;
        ptDistance = Math.sqrt((vx * vx) + (vy * vy));
        vx = vx / ptDistance;
        vy = vy / ptDistance;
        resultPt[0][0] = x + ((vx) * (d));
        resultPt[0][1] = y + ((vy) * (d));
        resultPt[1][0] = x - ((vx) * (d));
        resultPt[1][1] = y - ((vy) * (d));
        return resultPt;

    },
    mean: function (n1, n2) {

        if (n1 > 0 == n2 > 0) {
            return n1 + (n2 - n1) / 2;
        }
        else {
            return (n1 + n2) / 2;
        }

    },
    getProjectionOfPointOnLine: function getProjectionOfPointOnLine(x, y, a, b, c) {
        var cp = -a * y + b * x;
        var det = a * a + b * b;
        var coord = [(-c * a + b * cp) / det, (-a * cp - b * c) / det];
        return coord;
    },

    reflectPointAroundLine: function (x, y, a, b, c) {

        var coord = this.getProjectionOfPointOnLine(x, y, a, b, c);
        var dx = coord[0] - x;
        var dy = coord[1] - y;

        coord[0] += dx;
        coord[1] += dy;

        return coord;
    },
    areaOfIrregularPolygon: function areaOfIrregularPolygon(points) {
        // push first point again in the array of points before calling this function. (i.e. for triangle 4 points should be present).
        var i, areal = 0, arear = 0, area = 0;
        // points.push(points[0]);
        for (i = 0; i < points.length - 1; i++) {
            areal = areal + points[i][0] * points[i + 1][1];
        }
        for (i = 0; i < points.length - 1; i++) {
            arear = arear + points[i][1] * points[i + 1][0];
        }
        area = Math.abs(areal - arear) / 2;
        return area;
    },
    getArcAngle: function getArcAngle(source) {
        var angle1 = this.getPositiveAngle(source.from),
            viaAngle = this.getPositiveAngle(source.via),
            angle3 = this.getPositiveAngle(source.to),
            start, end;
        if (source.x1 === source.x3 && source.y3 === source.y3) { // circle case
            return 360;
        }
        if (angle1 > angle3) {
            start = angle3;
            end = angle1;
        }
        else {
            start = angle1;
            end = angle3;
        }
        if (start < viaAngle && viaAngle < end) {
            return (end - start) * 180 / Math.PI;
        }
        else {
            return (2 * Math.PI - (end - start)) * 180 / Math.PI;
        }

    },
    getPointOnArcFromOffset: function getPointOnArcFromOffset(seed, offset, fromPoint) {
        //This function takes offset for arcLength and returns point on arc at offset.
        // fromPoint is point from which offset is to be calculated (can be 1 or 3).
        var angle, arcAngle = geomFunctions.getArcAngle(seed),
            arcLength = (arcAngle / 360) * 2 * Math.PI * seed.r;
        offset = offset * arcLength;
        angle = ((offset * 360) / (2 * Math.PI * seed.r));
        if (fromPoint === 1) {
            return geomFunctions.rotatePoint(seed.x1, seed.y1, seed.a, seed.b, angle, true);
        }
        else if (fromPoint === 3) {
            return geomFunctions.rotatePoint(seed.x3, seed.y3, seed.a, seed.b, angle, true);

        }

    },
    isPointProjectionOnArc: function isPointProjectionOnArc(seed, point) {
        var pointAngle = Math.atan2(point[1] - seed.b, point[0] - seed.a),
            angle1 = geomFunctions.getPositiveAngle(seed.from),
            angle2 = geomFunctions.getPositiveAngle(seed.via),
            angle3 = geomFunctions.getPositiveAngle(seed.to),
            pointAngle = geomFunctions.getPositiveAngle(pointAngle),
            fromAngle, toAngle;
        if (angle1 > angle3) {
            fromAngle = angle3;
            toAngle = angle1;
        }
        else {
            fromAngle = angle1;
            toAngle = angle3;
        }
        if (fromAngle < angle2 && angle2 < toAngle) {
            if (!(pointAngle > fromAngle && pointAngle < toAngle)) {
                return false;
            }
        }
        else {
            if (pointAngle > fromAngle && pointAngle < toAngle) {
                return false;
            }
        }
        return true;
    },
    getPositiveAngle: function getPositiveAngle(angle) {
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        return angle;
    },
    reflectLineAroundLine: function (a1, b1, c1, a, b, c) {
        return [
            a1 * (Math.pow(b, 2) - Math.pow(a, 2)) - (2 * b1 * a * b),
            b1 * (Math.pow(a, 2) - Math.pow(b, 2)) - (2 * a1 * a * b),
            c1 * (Math.pow(a, 2) + Math.pow(b, 2)) - (2 * c * (a * a1 + b * b1))
        ];
    },
    dilateLine: function (a, b, c, x, y, params) {
        var cp = -a * y + b * x;
        var det = a * a + b * b;
        var coord = [(-c * a + b * cp) / det, (-a * cp - b * c) / det];
        return this.dilatePoint(coord[0], coord[1], x, y, params);

    },

    getRotatedImageMatrix: function getRotatedImageMatrix(matrix, anchor, params) {
        var rotatedMatrix, translationMatrix, rotationMatrix, translationInverseMatrix, angle, rasterImageMatrix;

        translationMatrix = [
                                    [1, 0, 0],
                                    [0, 1, 0],
                                    [-anchor[0], -anchor[1], 1]
        ];
        angle = -params.angle * Math.PI / 180;

        rotationMatrix = [
                                [Math.cos(angle), Math.sin(angle), 0],
                                [-Math.sin(angle), Math.cos(angle), 0],
                                [0, 0, 1]
        ];

        translationInverseMatrix = [
                                            [1, 0, 0],
                                            [0, 1, 0],
                                            [anchor[0], anchor[1], 1]
        ];

        rasterImageMatrix = [
                                            [matrix._a, matrix._c, 0],
                                            [matrix._b, matrix._d, 0],
                                            [matrix._tx, matrix._ty, 1]
        ];

        rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, translationMatrix);
        rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, rotationMatrix);
        rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, translationInverseMatrix);

        rotatedMatrix = matrix.set(rasterImageMatrix[0][0], rasterImageMatrix[0][1], rasterImageMatrix[1][0], rasterImageMatrix[1][1], rasterImageMatrix[2][0], rasterImageMatrix[2][1]);

        return rotatedMatrix;
    },

    getTranslatedImageMatrix: function getTranslatedImageMatrix(matrix, params) {
        var translatedMatrix, translationMatrix, tx, ty, angle, r;

        tx = params.dx;
        ty = params.dy;

        translationMatrix = [
                                    [1, 0, 0],
                                    [0, 1, 0],
                                    [tx, ty, 1]
        ];

        rasterImageMatrix = [
                                            [matrix._a, matrix._c, 0],
                                            [matrix._b, matrix._d, 0],
                                            [matrix._tx, matrix._ty, 1]
        ];

        rasterImageMatrix = this.matrixMultiplication(rasterImageMatrix, translationMatrix);

        translatedMatrix = matrix.set(rasterImageMatrix[0][0], rasterImageMatrix[0][1], rasterImageMatrix[1][0], rasterImageMatrix[1][1], rasterImageMatrix[2][0], rasterImageMatrix[2][1]);

        //translatedMatrix = matrix.translate(params.dx, params.dy);
        return translatedMatrix;

    },

    getDilatedImageMatrix: function getDilatedImageMatrix(matrix, matrixCenter, anchor, params) {
        var newCenter, translationMatrix, translationInverseMatrix, scalingMatrix, rasterImageMatrix;

        newCenter = this.dilatePoint(matrixCenter[0], matrixCenter[1], anchor[0], anchor[1], params);

        translationMatrix = [
                                    [1, 0, 0],
                                    [0, 1, 0],
                                    [-matrixCenter[0], -matrixCenter[1], 1]
        ];

        scalingMatrix = [
                                    [params.ratio, 0, 0],
                                    [0, params.ratio, 0],
                                    [0, 0, 1]
        ];

        translationInverseMatrix = [
                                            [1, 0, 0],
                                            [0, 1, 0],
                                            [matrixCenter[0], matrixCenter[1], 1]
        ];

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

        //matrix = matrix.translate(anchor[0] - newCenter[0], anchor[1] - newCenter[1]);
        //matrix = matrix.scale(params.ratio);


        matrix.set(rasterImageMatrix[0][0], rasterImageMatrix[0][1], rasterImageMatrix[1][0], rasterImageMatrix[1][1], rasterImageMatrix[2][0], rasterImageMatrix[2][1]);

        return matrix;
    },


    getReflectedImageMatrix: function getReflectedImageMatrix(matrix, lineConstants, anchor) {
        var translationMatrix, rotationMatrix, reflectionMatrix, rotationInverseMatrix, translationInverseMatrix,
            slopeOfAnchor, angle, rasterImageMatrix;


        translationMatrix = [
                                    [1, 0, 0],
                                    [0, 1, 0],
                                    [-anchor[0], -anchor[1], 1]
        ];

        slopeOfAnchor = -lineConstants.a / lineConstants.b;

        angle = Math.atan(slopeOfAnchor);

        rotationMatrix = [
                                [Math.cos(angle), Math.sin(angle), 0],
                                [-Math.sin(angle), Math.cos(angle), 0],
                                [0, 0, 1]
        ];
        reflectionMatrix = [
                                    [1, 0, 0],
                                    [0, -1, 0],
                                    [0, 0, 1]
        ];

        rotationInverseMatrix = [
                                        [Math.cos(angle), -Math.sin(angle), 0],
                                        [Math.sin(angle), Math.cos(angle), 0],
                                        [0, 0, 1]
        ];

        translationInverseMatrix = [
                                            [1, 0, 0],
                                            [0, 1, 0],
                                            [anchor[0], anchor[1], 1]
        ];

        //rasterImageTransformMatrix = rasterImage.matrix;

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

        matrix.set(rasterImageMatrix[0][0], rasterImageMatrix[0][1], rasterImageMatrix[1][0], rasterImageMatrix[1][1], rasterImageMatrix[2][0], rasterImageMatrix[2][1]);

        return matrix;
    },

    matrixMultiplication: function matrixMultiplication(a, b) {
        var c = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], i, j, k;

        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
                for (k = 0; k < 3; k++) {
                    c[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        return c;
    },

    getPolarCoordinate: function (x, y, isDeg) {
        var r = Math.sqrt(x * x + y * y);
        var ang = Math.atan2(y, x);
        if (isDeg) {
            ang = ang * 180 / Math.PI;
        }
        return [r, ang];
    },

    dotProduct: function (x1, y1, x2, y2) {
        return x1 * x2 + y1 * y2;
    },

    getSegmentParam: function (x1, y1, x2, y2, x3, y3) {
        var hypot = this.hypotenuse(x3 - x2, y3 - y2);
        if (hypot === 0) {
            return 0;
        }
        var param = this.dotProduct((x1 - x2) / hypot, (y1 - y2) / hypot, (x3 - x2) / hypot, (y3 - y2) / hypot);
        return param;
    },


    midPoint: function midpoint(point1, point2) {
        return [(point2[0] + point1[0]) / 2, (point2[1] + point1[1]) / 2];
    },


    midPoint2: function (x1, y1, x2, y2) {
        return [(x1 + x2) / 2, (y1 + y2) / 2];
    },

    closestPointOnSegment: function (pointX, pointY, x1, y1, x2, y2) {
        var param = this.getSegmentParam(pointX, pointY, x1, y1, x2, y2);

        if (param <= 0) {
            return [x1, y1];
        }
        else if (param >= 1) {
            return [x2, y2];
        }
        else {
            return [x1 + param * (x2 - x1), y1 + param * (y2 - y1)];
        }

    },

    getPointOffset: function getPointOffset(x1, y1, x2, y2, x, y) {
        var segDistance, distanceFromStartPoint, distanceFromEndPoint, offset;

        segDistance = geomFunctions.distance2(x1, y1, x2, y2);
        distanceFromStartPoint = geomFunctions.distance2(x1, y1, x, y);
        distanceFromEndPoint = geomFunctions.distance2(x2, y2, x, y);
        if (distanceFromEndPoint > segDistance && distanceFromEndPoint > distanceFromStartPoint) {
            offset = -distanceFromStartPoint / segDistance;
        }
        else {
            offset = distanceFromStartPoint / segDistance;
        }
        return offset;

    },


    getPointPositionFromOffset: function getPointPositionFromOffset(x1, y1, x2, y2, offset) {
        var segDistance, distanceFromStartPoint, distanceFromEndPoint, ratio, point = [];
        segDistance = geomFunctions.distance2(x1, y1, x2, y2);
        if (offset < 0) {
            distanceFromStartPoint = -offset * segDistance;
            distanceFromEndPoint = segDistance + distanceFromStartPoint;
        }
        else {
            distanceFromStartPoint = offset * segDistance;
            if (offset > 1) {
                distanceFromEndPoint = distanceFromStartPoint - segDistance;
            }
            else {
                distanceFromEndPoint = segDistance - distanceFromStartPoint;
            }
        }
        if (distanceFromStartPoint < distanceFromEndPoint) {
            ratio = distanceFromEndPoint / segDistance;
            point[0] = ((1 - ratio) * x2) + (ratio * x1);
            point[1] = ((1 - ratio) * y2) + (ratio * y1);
        }
        else {
            ratio = distanceFromStartPoint / segDistance;
            point[0] = ((1 - ratio) * x1) + (ratio * x2);
            point[1] = ((1 - ratio) * y1) + (ratio * y2);
        }
        return point;
    },
    pointAtADistanceFromMidPoint: function (x1, y1, x2, y2, d) {
        var midpoint = geomFunctions.midPoint2(x1, y1, x2, y2);

        var ang = Math.atan2(x1 - x2, y2 - y1);
        var coord = [midpoint[0] + d * Math.cos(ang), midpoint[1] + d * Math.sin(ang)];
        return coord;
    },

    pointAtADistanceFromMidPointWithBetterName: function (x1, y1, x2, y2, x3, y3, x4, y4, d) {
        var midpoint1 = geomFunctions.midPoint2(x1, y1, x2, y2);
        var midpoint2 = geomFunctions.midPoint2(x3, y3, x4, y4);

        var ang = Math.atan2(midpoint1[1] - midpoint2[1], midpoint1[0] - midpoint2[0]);
        var coord = [midpoint1[0] + d * Math.cos(ang), midpoint1[1] + d * Math.sin(ang)];
        return coord;

    },

    distanceToSegment: function (x1, y1, x2, y2, x3, y3) {
        var point = this.closestPointOnSegment(x1, y1, x2, y2, x3, y3);
        return this.hypotenuse(x1 - point[0], y1 - point[1]);
    },

    //calculateAngleWithXAxis: function calculateAngleWithXAxis(x2, y2, x1, y1) {
    //   var currentAngle = Math.atan((y2 - y1) / (x2 - x1));
    //    if ((x2 - x1 < 0 && y2 - y1 > 0) || (x2 - x1 < 0 && y2 - y1 < 0)) {
    //        currentAngle += Math.PI;
    //    }
    //    if (x2 - x1 > 0 && y2 - y1 < 0) {
    //        if (currentAngle < 0) {
    //            currentAngle += (Math.PI*2);
    //        }
    //    }
    //    return currentAngle;
    //},
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
    getParameterOfParabola: function getParameterOfParabola(i, j, p, q, x1, y1) {
        var a, d, offset;
        a = Math.sqrt((Math.pow((i - p), 2)) + (Math.pow((j - q), 2)));
        d = Math.atan((j - q) / (i - p));
        offset = (Math.cos(d) * (y1 - q) - Math.sin(d) * (x1 - p)) / (2 * a);
        return offset;
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
    getParameterOfHyperbola: function getParameterOfHyperbola(p, q, b, d, x1, y1, k, l, i, j) {
        var dist1 = Math.sqrt((Math.pow((x1 - k), 2)) + (Math.pow((y1 - l), 2))),
        dist2 = Math.sqrt((Math.pow((x1 - i), 2)) + (Math.pow((y1 - j), 2))),
        offset = Math.atan((Math.cos(d) * (y1 - q) - Math.sin(d) * (x1 - p)) / b);
        if (dist1 < dist2) {
            return offset;
        } else {
            return (-Math.PI + offset);
        }
    },
    /**
    *It return parameter value of given point on ellipse
    *@method getParameterOfEllipse
    *@param {Number} i Abscissa of first focus of ellipse
    *@param {Namber} j Ordinate of first focus of ellipse
    *@param {Number} k Abscissa of first focus of ellipse
    *@param {Namber} l Ordinate of first focus of ellipse
    *@param {Namber} d angle of axis of ellipse with respect to x-axis
    *@param {Namber} b semi major axis of ellipse
    *@param {Number} p translation of hyperbola in x ellipse
    *@param {Number} q translation of hyperbola in y ellipse
    *@param {Number} x1 Abscissa of point on ellipse
    *@param {Namber} y1 Ordinate of point on ellipse
    */
    getParameterOfEllipse: function getParameterOfEllipse(a, p, q, b, d, x1, y1, k, l, i, j) {

        var dist1 = Math.sqrt((Math.pow((x1 - k), 2)) + (Math.pow((y1 - l), 2))),
        dist2 = Math.sqrt((Math.pow((x1 - i), 2)) + (Math.pow((y1 - j), 2))),
        //offset = Math.asin((Math.cos(d) * (y1 - q) - Math.sin(d) * (x1 - p)) / b);
        slopeAngle, offset;
        offset = Math.atan((a * ((Math.cos(d) / (x1 - p)) - (Math.sin(d) / (y1 - q)))) / (b * ((Math.cos(d) / (y1 - q)) + (Math.sin(d) / (x1 - p)))));

        if (dist1 < dist2) {

            return offset;
        } else {
            if (offset < 0) {
                geomFunctions.traceConsole(3.14 + offset);
                return (3.14 + offset);
            }
            else {
                return (-3.14 + offset);
            }
        }


    },

    angleBetweenPoints: function (x1, y1, x2, y2, x3, y3, isDeg) {
        var ang = Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y1 - y2, x1 - x2);
        //        if (ang < 0) {
        //            ang = (Math.PI * 2) + (ang);
        //        }
        return isDeg ? ang * 180 / Math.PI : ang;
    },

    smallerAngleBetweenPoints: function (x1, y1, x2, y2, x3, y3, isDeg) {
        var ang;
        ang = this.angleBetweenPoints(x1, y1, x2, y2, x3, y3, false);
        if (Math.abs(ang) > Math.PI) {
            if (ang > 0) {
                ang = (Math.PI * 2) - ang;
            } else {
                ang = (Math.PI * 2) + ang;
            }
        }
        return isDeg ? ang * 180 / Math.PI : ang;
    },

    rotatePoint: function rotatePoint(x, y, xc, yc, angle, isDeg, reverse) {
        if (isDeg) {
            angle = angle * Math.PI / 180;
        }
        if (reverse) {
            angle *= (-1);
        }
        var c = Math.cos(angle), s = Math.sin(angle);

        return [
                        xc + (x - xc) * c - (y - yc) * s,
                        yc + (x - xc) * s + (y - yc) * c
        ];
    },
    rotateLine: function rotateLine(a, b, c, xc, yc, angle, isDeg) {
        var c,
           s;

        if (isDeg) {
            angle = angle * Math.PI / 180;
        }
        cos = Math.cos(angle);
        sin = Math.sin(angle);
        return [
            (a * cos - b * sin),
            (a * sin + b * cos),
            (a * xc + b * yc + c - ((a * xc + b * yc) * cos) - ((a * yc - b * xc) * sin))
        ];
    },
    getPolarCoordinates: function getPolarCoordinates(x, y, xc, yc, isDeg) {
        var dx, dy, r;
        dx = x - xc;
        dy = y - yc;
        theta = Math.atan2(dy, dx)
        if (theta < 0) {
            theta += 2 * Math.PI;
        }
        if (isDeg === true) {
            theta = theta * 180 / Math.PI;
        }
        r = this.distance2(x, y, xc, yc);
        return [r, theta];
    },
    getCartesianCoordinates: function getCartesianCoordinates(xc, yc, r, theta, isDeg) {
        var point = [];
        if (isDeg === true) {
            theta = theta * Math.PI / 180;
        }
        point[0] = xc + (r * Math.cos(theta));
        point[1] = yc + (r * Math.sin(theta));
        return point;
    },
    translatePoint: function translatePoint(x, y, params, reverse) {
        var factor = reverse ? -1 : 1;
        if (params.coordinateSystem === 'polar') {
            return this.rotatePoint(x + params.r, y, x, y, params.angle, true, reverse);
        }
        else {
            return [x + params.dx * factor, y + params.dy * factor];
        }
    },

    getTriangleCircumCentre: function (x1, y1, x2, y2, x3, y3) {


        var d = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
        var xc = ((x1 * x1 + y1 * y1) * (y2 - y3) + (x2 * x2 + y2 * y2) * (y3 - y1) + (x3 * x3 + y3 * y3) * (y1 - y2)) / d;
        var yc = ((x1 * x1 + y1 * y1) * (x3 - x2) + (x2 * x2 + y2 * y2) * (x1 - x3) + (x3 * x3 + y3 * y3) * (x2 - x1)) / d;
        return [xc, yc];

    },

    getTriangleIncentre: function (x1, y1, x2, y2, x3, y3) {
        var a = this.distance2(x1, y1, x2, y2);
        var b = this.distance2(x1, y1, x3, y3);
        var c = this.distance2(x3, y3, x2, y2);
        var p = a + b + c;
        return [
        (a * x3 + b * x2 + c * x1) / p,
        (a * y3 + b * y2 + c * y1) / p
        ];
    },

    dilatePoint: function dilatePoint(x, y, xc, yc, params) {
        var xNew, yNew;
        xNew = xc - (xc - x) * params.ratio;
        yNew = yc - (yc - y) * params.ratio;

        return [xNew, yNew];
    },
    getXYInterceptsOfLine: function (a, b, c) {
        // Equation of line is in form ax+by+c=0
        var xIntercept, yIntercept;
        if (a === 0) {
            xIntercept = null;
        }
        else {
            xIntercept = (-c / a);
        }
        if (b === 0) {
            yIntercept = null;
        }
        else {
            yIntercept = (-c / b);
        }
        return { xIntercept: xIntercept, yIntercept: yIntercept };
    },



    getCanvasCoordinates: function getCanvasCoordinates(event) {

        var curTarget = event.event.target,
            $targetCanvas = $(curTarget),
            targetCanvasOffset = $targetCanvas.offset(),
            coordinates = [event.point.x, event.point.y];


        return coordinates;
    },

    traceConsole: function traceConsole(string) {
        if (this.isDebugMode === true) {
            console.log(string);
        }
    },

    calculatePerimeter: function calculatePerimeter(sourceData) {
        var lengthOfObj, numberOfPoints, perimeter = 0, distanceBetweenTwoPts, arrayOfPoints = [], i, xCoord, yCoord, xString = 'x', yString = 'y';
        lengthOfObj = Object.keys(sourceData[0]).length;
        numberOfPoints = lengthOfObj * 0.5;
        for (i = 0; i < numberOfPoints; i++) {
            xString = xString + i;
            yString = yString + i;
            xCoord = sourceData[0][xString];
            yCoord = sourceData[0][yString];
            arrayOfPoints.push([xCoord, yCoord]);
            xString = 'x';
            yString = 'y';
        }
        arrayOfPoints.push(arrayOfPoints[0]);
        for (i = 0; i < numberOfPoints; i++) {
            distanceBetweenTwoPts = geomFunctions.distance2(arrayOfPoints[i][0], arrayOfPoints[i][1], arrayOfPoints[i + 1][0], arrayOfPoints[i + 1][1]);
            perimeter = perimeter + distanceBetweenTwoPts;
        }
        return perimeter;
    }

};



var CurveDerivativeTracker = Backbone.Model.extend({
    _points: undefined,
    _arrOrderNo: undefined,
    currentDerivatives: undefined,
    flipState: undefined,


    initialize: function initialize() {
        this._points = [];
        this._arrOrderNo = [];
        this.currentDerivatives = [];
        this.flipState = [];
        this.curveAffinity = [];
    },

    trackPoint: function trackPoint(point) {
        var strPrint, arrPreviousOrder;
        var arrTemp;
        var delta;
        var slope;
        var currentAffinity;
        //geomFunctions.traceConsole('tracking ' + point);
        for (orderCounter = 0; orderCounter < 4; orderCounter++) {

            breakAfter = this._arrOrderNo[orderCounter] === undefined;
            if (orderCounter === 0) {
                strPrint = "";
                if (breakAfter) this._arrOrderNo[orderCounter] = [];

                this._arrOrderNo[orderCounter].push(point);


            }
            else {
                if (breakAfter) this._arrOrderNo[orderCounter] = [];
                arrPreviousOrder = this._arrOrderNo[orderCounter - 1];
                delta = this._getPointDiff(arrPreviousOrder);

                if (orderCounter === 1) {
                    slope = Math.atan2(delta[1], delta[0]) * 180 / Math.PI;
                    //geomFunctions.traceConsole('slope is ' + slope);
                    if (Math.abs(slope) > 85) {
                        if (slope > 0) {
                            currentAffinity = +Infinity;
                        }
                        else {
                            currentAffinity = -Infinity;
                        }

                        if (this.curveAffinity[this.curveAffinity.length - 1] !== currentAffinity) {
                            geomFunctions.traceConsole('Curve now leads to ' + currentAffinity);
                            this.curveAffinity.push(currentAffinity);
                        }
                    }
                }

                this._arrOrderNo[orderCounter].push(delta);

                //TODO optimize extra array storage
                this.flipState[orderCounter] = this._getFlipState(this._arrOrderNo[orderCounter]);

                strPrint += this.printPoint(arrPreviousOrder[arrPreviousOrder.length - 1]) + '>>';

            }

            arrTemp = this._arrOrderNo[orderCounter];


            this.currentDerivatives[orderCounter] = arrTemp[arrTemp.length - 1];



            if (breakAfter) {
                break;
            }

        } //for orderCounter
        //geomFunctions.traceConsole(strPrint);


        geomFunctions.traceConsole('Order Derivatives ' + this.printPoint(this.currentDerivatives[0]) + ' >> ' + this.printPoint(this.currentDerivatives[1]) + ' >> ' + this.printPoint(this.currentDerivatives[2]) + ' >> ' + this.printPoint(this.currentDerivatives[3]));
        if (this.currentDerivatives[1] !== undefined) {
            //geomFunctions.traceConsole('Order Derivatives ' + this.printPoint(this.currentDerivatives[0]) + ' >> ' + this.printPoint(this.currentDerivatives[1]) + ' SLOPE:x ' + this._radToDeg(Math.atan(this.currentDerivatives[1][1])));
        }
        else {
            //geomFunctions.traceConsole('Order Derivatives ' + this.printPoint(this.currentDerivatives[0]) + ' >> ' + this.printPoint(this.currentDerivatives[1]) );
        }

        //geomFunctions.traceConsole('Order Derivatives ' + this.flipState[0] + ' >> ' + this.flipState[1] + ' >> ' + this.flipState[2] + ' >> ' + this.flipState[3]);
    },

    _getFlipState: function getFlipState(array) {
        var lastPoint = array[array.length - 1];
        var secondLast = array[array.length - 2];

        if (secondLast === undefined) {
            return;
        }

        var d1 = lastPoint[0] >= 0 ? 1 : -1;
        var d2 = secondLast[0] >= 0 ? 1 : -1;
        var ans = [];
        ans[0] = d1 * d2 < 0 && (Math.abs(lastPoint[0]) > 1 && Math.abs(secondLast[0]) > 1);


        d1 = lastPoint[1] >= 0 ? 1 : -1;
        d2 = secondLast[1] >= 0 ? 1 : -1;


        ans[1] = d1 * d2 < 0 && (Math.abs(lastPoint[1]) > 1 && Math.abs(secondLast[1]) > 1);
        return ans;
    },

    printPoint: function printPoint(arr) {
        if (arr === undefined) {
            return
        }
        return arr[0].toFixed(2) + ',' + arr[1].toFixed(2);
    },

    _radToDeg: function radToDeg(ang) {
        return ang * 180 / Math.PI;
    },

    _getPointDiff: function _getPointDiff(array) {

        //debugger;
        var lastPoint = array[array.length - 1];
        var secondLast = array[array.length - 2];
        return [lastPoint[0] - secondLast[0], lastPoint[1] - secondLast[1]];
    },

    clear: function clear() {
        while (this._points.length > 0) {
            this._points.pop();
        }
        while (this._arrOrderNo.length > 0) {
            this._arrOrderNo.pop();
        }
        while (this.currentDerivatives.length > 0) {
            this.currentDerivatives.pop();
        }
        while (this.flipState.length > 0) {
            this.flipState.pop();
        }
    }
});




var getCanvasCoordinates = function (event) {

    var curTarget = event.event.target,
        $targetCanvas = $(curTarget),
        targetCanvasOffset = $targetCanvas.offset(),
    //coordinates = [event.event.offsetX || event.event.clientX - targetCanvasOffset.left,
    //                event.event.offsetY || event.event.clientY - targetCanvasOffset.top];

        coordinates = [event.point.x, event.point.y]


    return coordinates;
}