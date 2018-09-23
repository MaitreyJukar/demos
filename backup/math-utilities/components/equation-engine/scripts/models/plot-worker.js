/* globals MathUtilities, Highcharts */
var geomFunctions;
(function() {
    "use strict";
    var inequalityPlottingFunctions, plottingFunctions;
    geomFunctions = {

        "MAX_PRECISION": 10,

        "distance": function(point1, point2) {
            return Math.sqrt(Math.pow(point2.y - point1.y, 2) + Math.pow(point2.x - point1.x, 2));
        },

        "distance2": function(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
        },

        "hypotenuse": function(n1, n2) {
            if (n1 === 0 && n2 === 0) {
                return 0;
            }
            if (Math.abs(n1) > Math.abs(n2)) {
                return Math.abs(n1) * Math.sqrt(n2 / n1 * (n2 / n1) + 1);
            }
            return Math.abs(n2) * Math.sqrt(n1 / n2 * (n1 / n2) + 1);
        },

        //according to Cohen-Sutherland algorithm 
        "calculateLineOutCode": function(x, y, xmin, xmax, ymin, ymax) {
            var code = 0,
                LEFT = 1,
                RIGHT = 2,
                BOTTOM = 4,
                TOP = 8;
            if (x < xmin) {
                code |= LEFT;
            } else if (x > xmax) {
                code |= RIGHT;
            }
            if (y < ymin) {
                code |= BOTTOM;
            } else if (y > ymax) {
                code |= TOP;
            }
            return code;
        },

        "intersectionOfLines": function(x1, y1, x2, y2, x3, y3, x4, y4) {
            var x, y, det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4),
                calc1 = x1 * y2 - y1 * x2,
                calc2 = x3 * y4 - y3 * x4;
            if (det === 0) {
                return void 0;
            }
            x = (calc1 * (x3 - x4) - (x1 - x2) * calc2) / det;
            y = (calc1 * (y3 - y4) - (y1 - y2) * calc2) / det;
            return [x, y];
        },

        "mean": function(n1, n2) {
            if (n1 > 0 === n2 > 0) {
                return n1 + (n2 - n1) / 2;
            }
            return (n1 + n2) / 2;
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
            return [(point2[1] + point1[1]) / 2, (point2[0] + point1[0]) / 2];
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

        "distanceToSegment": function(x1, y1, x2, y2, x3, y3) {
            var point = this.closestPointOnSegment(x1, y1, x2, y2, x3, y3);
            return this.hypotenuse(x1 - point[0], y1 - point[1]);
        },

        //radians only
        "normalizeAngle": function(value) {
            return value % (Math.PI * 2);
        },

        //-1 clockwise, 1 anticlockwise
        "getArcDirection": function(from, via, to) {
            var temp, word = [],
                looper,
                map = [{
                    "name": "from",
                    "value": geomFunctions.normalizeAngle(from)
                }, {
                    "name": "via",
                    "value": geomFunctions.normalizeAngle(via)
                }, {
                    "name": "to",
                    "value": geomFunctions.normalizeAngle(to)
                }],
                sortFunc = function(a, b) {
                    return a.value > b.value ? 1 : -1;
                };
            map.sort(sortFunc);
            for (looper in map) {
                word.push(map[looper].name.charAt(0));
            }
            while (word.length > 0 && word[0] !== 'f') {
                temp = word.shift();
                word.push(temp);
            }
            return word[1] === 'v' ? 1 : -1;
        },

        "getArcAngle": function(source, useRadians) {
            var diff, clockWise, degAng = 360,
                HALF_ANGLE = 180,
                start, end;
            if (source.x1 && source.x1 === source.x3 && source.y3 && source.y3 === source.y3) { // circle case
                if (useRadians) {
                    return 2 * Math.PI;
                }
                return degAng;
            }
            clockWise = geomFunctions.getArcDirection(source.from, source.via, source.to);
            if (source.from > source.to) {
                start = source.from - Math.PI * 2;
            } else {
                start = source.from;
            }
            end = source.to;

            diff = end - start;

            if (clockWise < 0) {
                diff = -(2 * Math.PI - Math.abs(diff));
            }
            degAng = diff * HALF_ANGLE / Math.PI;

            if (useRadians) {
                return diff;
            }
            return degAng;
        },

        "createArc": function(radius, startAngle, viaAngle, endAngle, centerX, centerY) {
            // normalize startAngle, endAngle to [-2PI, 2PI]
            var EPSILON = 0.00001,
                curves = [],
                piOverTwo = Math.PI / 2,
                angleBetween,
                sgn,
                a1,
                via, totalAngle, a2, step, curvePoints = [],
                twoPI = Math.PI * 2;
            startAngle %= twoPI;
            endAngle %= twoPI;

            // Compute the sequence of arc curves, up to PI/2 at a time.  Total arc angle
            // is less than 2PI.

            if (!(isFinite(startAngle) && isFinite(viaAngle) && isFinite(endAngle))) {
                return void 0;
            }
            angleBetween = geomFunctions.getArcAngle({
                "from": startAngle,
                "via": viaAngle,
                "to": endAngle
            }, true);

            sgn = angleBetween > 0 ? 1 : -1;
            a1 = startAngle;
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
            if (!(isFinite(a1) && isFinite(viaAngle) && isFinite(a2)) || r > 10e10) { //10e10 is a zoom limit
                return void 0;
            }
            a1 = geomFunctions.normalizeAngle(a1);
            a2 = geomFunctions.normalizeAngle(a2);
            viaAngle = geomFunctions.normalizeAngle(viaAngle);
            /*
             *  This algorithm is based on the approach described in:
             *  A. Riškus, "Approximation of a Cubic Bezier Curve by Circular Arcs and Vice Versa," 
             *  Information Technology and Control, 35(4), 2006 pp. 371-378.
             *
             * Compute all four points for an arc that subtends the same total angle
             * but is centered on the X-axis
             */
            var a = (a2 - a1) / 2.0,
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
        }
    };
    plottingFunctions = {
        "_graphView": null,

        "generateSimplePlot": function(engine, plotData) {
            var plot = plottingFunctions.getPlotObject(plotData);
            plottingFunctions.addPoint(plot, plotData.minX, engine(plotData.minX));
            plottingFunctions.addPoint(plot, plotData.maxX, engine(plotData.maxX));
            plottingFunctions.finishSegment(plot);
            return plot.lines;
        },

        "createCustomFunctions": function(localFunctions, equationFunctions, constants, functions) {
            var functionCounter,
                currentFunction,
                engine,
                createEngineFunctions = function(engineName, objConstants, objFunctions) {
                    return function(data) {
                        return engineName(data, objConstants, objFunctions)[0];
                    };
                };
            if (!functions) {
                functions = {};
            }
            for (functionCounter in localFunctions) {
                currentFunction = localFunctions[functionCounter];
                if (currentFunction) {
                    engine = new Function('param,constants,functions', currentFunction);
                    functions[functionCounter] = createEngineFunctions(engine, constants, functions);
                }
            }
            return functions;
        },

        "findCriticalPoints": function(leftArray, functionVariable, engine, plotData, drawInflection) {
            if (typeof leftArray === "undefined") {
                return [];
            }
            var slope,
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
                prevSlope,
                thirdSlope,
                prevSecond,
                nextSecond,
                x4,
                y4,
                temp,
                tempx, tempy,
                inflectionArray = [],
                criticalPoints = [],
                pointsCountIncr,
                X_DIFFERENCE = 0.0001;

            drawInflection = false;

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
                        pointsCountIncr = pointsCount - 2;
                        if (functionVariable === 'y') {
                            x1 = leftArray[row][pointsCountIncr++];
                            y1 = leftArray[row][pointsCountIncr++];
                            x2 = leftArray[row][pointsCountIncr++];
                            y2 = leftArray[row][pointsCountIncr++];
                            x3 = leftArray[row][pointsCountIncr++];
                            y3 = leftArray[row][pointsCountIncr++];
                            x4 = leftArray[row][pointsCountIncr++];
                            y4 = leftArray[row][pointsCountIncr];
                        } else {
                            y1 = leftArray[row][pointsCountIncr++];
                            x1 = leftArray[row][pointsCountIncr++];
                            y2 = leftArray[row][pointsCountIncr++];
                            x2 = leftArray[row][pointsCountIncr++];
                            y3 = leftArray[row][pointsCountIncr++];
                            x3 = leftArray[row][pointsCountIncr++];
                            y4 = leftArray[row][pointsCountIncr++];
                            x4 = leftArray[row][pointsCountIncr];
                        }
                        slope = (y2 - y1) / (x2 - x1);
                        nextSlope = (y3 - y2) / (x3 - x2);
                        thirdSlope = (y4 - y3) / (x4 - x3);
                        secondOrder = nextSlope - slope;

                        foundZero = false;

                        if (slope < nextSlope && nextSlope > thirdSlope || slope > nextSlope && nextSlope < thirdSlope) {
                            while (!foundZero) {
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
                        // for asymtodes
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
                            temp[0] = this.refineExtrema(temp[0], engine);
                            temp[1] = engine(temp[0]);
                            minArray.push(temp);
                            tempx = temp[0];
                            tempy = temp[1];
                            if (functionVariable === 'y') {
                                leftArray[row].splice(pointsCount, 0, tempx, tempy);
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
        "getBisectedFiniteValues": function(firstPointX, firstPointY, lastPointX, lastPointY, engine) {

            if (isFinite(firstPointY) === isFinite(lastPointY)) {
                return void 0;
            }
            var xCoordinate, looper = true,
                yCoordinate;
            while (looper) {
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
        "getMean": function(coordinate1, coordinate2) {
            var HALF = 0.5;
            if (coordinate1 > 0 === coordinate2 > 0) {
                return coordinate1 + HALF * (coordinate2 - coordinate1);
            }
            return HALF * (coordinate1 + coordinate2);
        },

        "divideCoordinateForConstantValue": function(firstPointX, firstPointY, lastPointX, lastPointY, engine, constant) {
            if (firstPointY === constant === (lastPointY === constant)) {
                return void 0;
            }
            var xCoordinate, looper = true,
                yCoordinate;
            while (looper) {
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
        // Returns the center of the flat curve having constant y value
        "getCenterOfFlatRegion": function(leftPointX, leftPointY, middlePointX, middlePointY, rightPointX, rightPointY, engine, functionVariable) {

            var edge,
                extrema,
                temp,
                leftSideFlat,
                rightSideFlat;
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

                extrema = this.getCenterOfCoordinates(leftSideFlat[0], rightSideFlat[0]);
                extrema = this.refineExtrema(extrema, engine);
                return [extrema, engine(extrema)];
            } else {
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

                extrema = this.getCenterOfCoordinates(leftSideFlat[1], rightSideFlat[1]);
                extrema = this.refineExtrema(extrema, engine);
                return [engine(extrema), extrema];
            }
        },
        
        // to handle JavaScript floating point calculation issues
        "_getRoundedNumber": function(number) {
            if (Math.abs(Math.round(number) - number) < 1e-4) {
                return Math.round(number);
            }
            var roundingRegExp = /(\-?\d*\.(\d*))(0{4,}|9{4,})\d*/,
                matches = roundingRegExp.exec(number),
                precisionLength;

            if (matches) {
                precisionLength = matches[2].length;
                if (precisionLength) {
                    if (matches[3].indexOf('9') !== -1) {
                        precisionLength++;
                    }
                    return Number(Number(matches[0]).toFixed(precisionLength));
                }
                return Math.round(number);
            }
            return number;
        },

        "compareNumbers": function(num1, num2, precision) {
            precision = precision || this.MAX_PRECISION;
            return num1.toFixed(precision) === num2.toFixed(precision);
        },

        "refineExtrema": function(x, engine) {
            var xDash = this._getRoundedNumber(x),
                y = engine(x),
                yDash = this._getRoundedNumber(engine(xDash));

            if (this.compareNumbers(yDash, this._getRoundedNumber(y), this.MAX_PRECISION)) {
                return xDash;
            }
            return x;
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
                looper = true,
                rightPointY = rightPoint[1];

            while (looper) {
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

        "addPoint": function(plot, x, y) {
            var point = [x, y],
                lastPoint,
                currentPivot;

            if (!plot.temporaryLines) {
                plot.temporaryLines = [point[0], point[1]];
                return;
            }
            currentPivot = plot.basePoint;
            if (!currentPivot) {
                plot.basePoint = point;
                plot.unsettledPoint = point;
                return;
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

        "finishSegment": function(plot) {
            plottingFunctions.removeUnsettledPoints(plot);

            if (plot.temporaryLines) {
                var lines = plottingFunctions.fitPointsInsideDomain(plot, plot.temporaryLines),
                    line, count;
                for (count = 0; count < lines.length; count++) {
                    if (lines[count].length < 2) {
                        continue;
                    }
                    line = lines[count];
                    plot.lines.push(line);
                }
                plot.temporaryLines = null;
            }
        },

        "translateSegment": function(plot, segment) {

            var point, i,
                newsegment = [];

            for (i = 0; i < segment.length - 1; i += 2) {

                if (plot.paramVariable === 'x') {
                    point = [segment[i], segment[i + 1]];
                } else {
                    point = [segment[i + 1], segment[i]];
                }
                point = this._graphView._getCanvasPointCoordinates(point);
                newsegment.push(point);
            }
            return newsegment;
        },

        "projectPointOnDomain": function(plot, lastPointX, lastPointY, x, y) {

            var outCodeNew = geomFunctions.calculateLineOutCode(x, y, plot.domain.minX, plot.domain.maxX, plot.domain.minY, plot.domain.maxY),
                outCodeLast = geomFunctions.calculateLineOutCode(lastPointX, lastPointY, plot.domain.minX, plot.domain.maxX, plot.domain.minY, plot.domain.maxY),
                dlx1, dlx2, dly1, dly2,
                left = 1,
                right = 2,
                bottom = 4,
                top = 8,
                side, intersect;

            if (outCodeNew === outCodeLast || (outCodeLast !== 0 && outCodeNew !== 0)) {
                return void 0;
            }
            side = outCodeLast || outCodeNew;
            //LEFT = 1, RIGHT = 2, BOTTOM = 4, TOP = 8
            switch (side) {
                case left:
                    dlx1 = plot.domain.minX;
                    dlx2 = plot.domain.minX;
                    dly1 = plot.domain.minY;
                    dly2 = plot.domain.maxY;
                    break;
                case right:
                    dlx1 = plot.domain.maxX;
                    dlx2 = plot.domain.maxX;
                    dly1 = plot.domain.minY;
                    dly2 = plot.domain.maxY;
                    break;
                case bottom:
                    dlx1 = plot.domain.minX;
                    dlx2 = plot.domain.maxX;
                    dly1 = plot.domain.minY;
                    dly2 = plot.domain.minY;
                    break;
                case top:
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
            if (segment === void 0 || segment.length < 2) {
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
                lastPushed = false;
                slope = (x1 - x2) * (dly1 - dly2) - (y1 - y2) * (dlx1 - dlx2);

                if (slope === Infinity || slope === -Infinity) {
                    intersection = [x1, dly1];
                } else {
                    intersection = geomFunctions.intersectionOfLines(x1, y1, x2, y2, dlx1, dly1, dlx2, dly2);
                }
                return intersection;
            }

            function getIntersectionWithSides(x1, y1, x2, y2, side, plot) {
                var intersection1, intersection2, out1, sides;
                if (side === 0) {
                    return void 0;
                }
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
            for (i = 0; i < segment.length - 1; i += 2) {
                if (segment[i] === lastX && segment[i + 1] === lastY) {
                    continue;
                }

                currentDomain = geomFunctions.calculateLineOutCode(segment[i], segment[i + 1], plot.domain.minX, plot.domain.maxX, plot.domain.minY, plot.domain.maxY);

                if (typeof lastX === "undefined") {

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
                    //totally outside

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
            var interpolatedPoint,
                p = geomFunctions.getSegmentParam(point[0], point[1], lastPoint[0], lastPoint[1], pivot[0], pivot[1]);
            if (p < 1) {
                return false;
            }
            interpolatedPoint = [lastPoint[0] + p * (pivot[0] - lastPoint[0]), lastPoint[1] + p * (pivot[1] - lastPoint[1])];
            return Math.abs(point[0] - interpolatedPoint[0]) <= toleranceX && Math.abs(point[1] - interpolatedPoint[1]) <= toleranceY;
        },

        "getPlotObject": function(domain) {
            return {
                "lines": [],
                "segment": null,
                "toleranceX": domain.toleranceX,
                "toleranceY": domain.toleranceY,
                "domain": domain,
                "basePoint": null,
                "unsettledPoint": null,
                "paramVariable": domain.paramVariable
            };
        },

        "refine": function(pt1, pt2, engine, plot) {
            var xmean = geomFunctions.mean(pt1[0], pt2[0]),
                breakingPoint = plottingFunctions.detectJump(engine, pt1[0], pt1[1], xmean, engine(xmean), pt2[0], pt2[1], plot.domain.toleranceX, plot.domain.toleranceY);
            if (breakingPoint) {
                plottingFunctions.addPoint(plot, breakingPoint[0][0], breakingPoint[0][1]);
                plottingFunctions.finishSegment(plot);
                plottingFunctions.addPoint(plot, breakingPoint[1][0], breakingPoint[1][1]);
            }
        },

        "generatePlot": function(engine, plotData, functionVariable, hasIntercepts) {
            var plot = plottingFunctions.getPlotObject(plotData),
                refinedPoint, nextPoint = [],
                interceptPoints = [],
                x = plotData.minX,
                y = engine(x),
                currentPoint = [x, y],
                yIntercept,
                currentIntercept,
                currentInterceptX;

            if (isFinite(y)) {
                if (y <= plotData.maxY && y >= plotData.minY) {
                    plottingFunctions.addPoint(plot, x, y);
                }
            }
            x += plotData.step;
            yIntercept = engine(0);

            if (yIntercept !== void 0 && hasIntercepts) {
                if (plotData.maxX > 0 && yIntercept <= plotData.maxY && plotData.minX < 0 && yIntercept > plotData.minY) {
                    if (functionVariable === 'y' && plotData.maxY > yIntercept && plotData.minY < yIntercept) {
                        interceptPoints.push([0, yIntercept]);
                    } else if (plotData.maxX > yIntercept && plotData.minX < yIntercept && functionVariable === 'x') {
                        interceptPoints.push([yIntercept, 0]);
                    }
                }
            }
            while (x < plotData.maxX) {

                y = engine(x);
                if (hasIntercepts && y !== void 0 && currentPoint[1] !== void 0) {
                    if (x <= plotData.maxX && y <= plotData.maxY && x > plotData.minX && y > plotData.minY) {
                        if (y > 0 && currentPoint[1] < 0 || y < 0 && currentPoint[1] > 0) {
                            nextPoint = [x, y];
                            currentIntercept = this.findInterceptsDivision(currentPoint, nextPoint, engine, functionVariable, plotData);
                            if (currentIntercept.length) {
                                currentInterceptX = this.refineExtrema(currentIntercept[0], engine);
                                interceptPoints.push([currentInterceptX, engine(currentInterceptX)]);
                            }
                        }
                    }
                }
                if (isFinite(y) && isFinite(currentPoint[1])) {
                    plottingFunctions.refine(currentPoint, [x, y], engine, plot);
                    plottingFunctions.addPoint(plot, x, y);
                } else if (isFinite(y) && !isFinite(currentPoint[1])) {
                    refinedPoint = plottingFunctions.limitedRefine(currentPoint[0], currentPoint[1], x, y, engine);
                    if (refinedPoint[0] !== x) {
                        plottingFunctions.addPoint(plot, refinedPoint[0], refinedPoint[1]);
                    }
                    plottingFunctions.refine(refinedPoint, [x, y], engine, plot);
                    plottingFunctions.addPoint(plot, x, y);
                } else if (!isFinite(y) && isFinite(currentPoint[1])) {
                    refinedPoint = plottingFunctions.limitedRefine(currentPoint[0], currentPoint[1], x, y, engine);
                    plottingFunctions.refine(currentPoint, refinedPoint, engine, plot);
                    if (refinedPoint[0] !== currentPoint[0]) {
                        plottingFunctions.addPoint(plot, refinedPoint[0], refinedPoint[1]);
                    }
                    plottingFunctions.finishSegment(plot);
                }
                currentPoint = [x, y];
                x += plotData.step;
            }
            x = plotData.maxX;
            y = engine(x);
            if (isFinite(y)) {
                plottingFunctions.refine(currentPoint, [x, y], engine, plot);
                plottingFunctions.addPoint(plot, x, y);
            }
            plottingFunctions.finishSegment(plot);
            if (typeof plotData.interceptPoints === "undefined") {
                plotData.interceptPoints = [];
            }
            plotData.interceptPoints = plotData.interceptPoints.concat(interceptPoints);
            return plot.lines;
        },
        "findInterceptsForTwoArrays": function(lines, lines2, engine1, engine2, functionVariable) {
            var THRESHOLD = 0.001,
                interceptPointArr = [],
                rowlength = lines.length,
                length1, length2, xcoord, ycoord, interceptPoint = [],
                rowlength2 = lines2.length,
                row, x1, x2, y1, y2;
            if (functionVariable === 'y') {
                xcoord = 0;
                ycoord = 1;
            } else {
                xcoord = 1;
                ycoord = 0;
            }
            for (row = 0; row < rowlength && row < rowlength2; row++) {
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
                starty,
                midx, midy,
                looper = true,
                UPPER_LIMIT = 0.9,
                endx = x2,
                endy, threshold = plotData.step / 1e12,
                yDifference = Math.abs(y1) - Math.abs(y2);
            if (Math.abs(yDifference) > Math.abs(Math.abs(plotData.maxY) + Math.abs(plotData.minY))) {
                return [];
            }
            while (looper) {
                if (Math.abs(startx - endx) < threshold) {
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
                        if (Math.abs(interceptPoint[0]) < threshold) {
                            return [];
                        }
                        //case abs(x+3)/x+3
                        if (Math.abs(engine(interceptPoint[0])) > UPPER_LIMIT) {
                            return [];
                        }
                    } else {
                        interceptPoint = [0, (startx + endx) / 2];
                        if (Math.abs(interceptPoint[1]) < threshold) {
                            return [];
                        }
                        //case abs(x+3)/x+3
                        if (Math.abs(engine(interceptPoint[1])) > UPPER_LIMIT) {
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
                if (Math.abs(midy) < threshold || midy === 0) {
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
        "detectJump": function(engine, x1, y1, xmean, ymean, x2, y2, toleranceX, toleranceY) {

            var pole1, pole2, flag1, flag2, diff1, diff2, jumpFrom, looper = true,
                jumpTo;

            if (!(isFinite(y1) && isFinite(ymean) && isFinite(y2)) || x1 > xmean || xmean > x2) {
                return void 0;
            }
            while (looper) {

                pole1 = this.getInterpolationParam(x1, xmean);
                flag1 = engine(pole1);
                diff1 = Math.abs(flag1 - geomFunctions.mean(y1, ymean));

                pole2 = this.getInterpolationParam(xmean, x2);
                flag2 = engine(pole2);
                diff2 = Math.abs(flag2 - geomFunctions.mean(ymean, y2));
                //since the curve is very close to the mean values, we dont need to refine further
                if (diff1 <= toleranceY && diff2 <= toleranceY) {
                    return null;
                }

                if (!isFinite(flag1)) {
                    //check $\frac{1}{x^2}$ with upper values> ~20
                    jumpFrom = plottingFunctions.limitedRefine(x1, y1, pole1, flag1, engine);
                    jumpTo = plottingFunctions.limitedRefine(pole1, flag1, x2, y2, engine);
                    return [jumpFrom, jumpTo];
                }
                if (!isFinite(flag2)) {
                    jumpFrom = plottingFunctions.limitedRefine(x1, y1, pole2, flag2, engine);
                    jumpTo = plottingFunctions.limitedRefine(pole2, flag2, x2, y2, engine);
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
                    return plottingFunctions.selectJumpPoint(x1, y1, xmean, ymean, pole2, flag2, x2, y2);
                }
                if (pole2 === xmean || pole2 === x2) {
                    return plottingFunctions.selectJumpPoint(x1, y1, pole1, flag1, xmean, ymean, x2, y2);
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
                //$\left(\cos x\right)\cdot \log x$
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
            var pole, flag, looper = true;
            while (looper) {
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
    };

    inequalityPlottingFunctions = {
        "getInequalityPlots": function(engineA, engineB, engineC, functionVariable, maxX, minX, maxY, minY, paramVariable, startValue, endValue, step, constants, engine, graphViewMarkerBounds, inEqualityType) {
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
                if (!isFinite(curveYValue)) {
                    if (segments.length <= 1) {
                        segments = [];
                        continue;
                    }
                    isDiscontinuous = true;
                } else {
                    currentGraphPoint = [];
                    currentGraphPoint[paramVariableIndex] = curveXValue;
                    currentGraphPoint[checkForExponentialIndex] = curveYValue;

                    lhsValue = inequalityPlottingFunctions._getLhsValueForPoint(currentGraphPoint, engineA, engineB, engineC, functionVariable, graphViewMarkerBounds, paramVariable, constants, inEqualityType, 1);
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
                    triggeringPoint = inequalityPlottingFunctions._findTriggeringPointForInequality(lastPoint, currentGraphPoint, engineA, engineB, engineC, functionVariable, previousInEqualityType, engine, graphViewMarkerBounds, paramVariable, constants, inEqualityType, 1);

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

        "getInequalityPlotForQuadratic": function(engine1, engine2, inEqualityType, graphViewMarkerBounds, startValue, endValue, step, minX, minY, maxX, maxY, engineA, engineB, engineC, functionVariable, constants, paramVariable, leftEngine, rightEngine) {
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

                if (!engineSwitchingDone && currentFunctionVariableValue1 < currentFunctionVariableValue2) {
                    tempEngine = engine1;
                    engine1 = engine2;
                    engine2 = tempEngine;
                    engineSwitchingDone = true;
                    pointCounter -= step;
                    continue;
                }
                lhsValue = inequalityPlottingFunctions._getLhsValueForPoint(currentPoint1, engineA, engineB, engineC, functionVariable, graphViewMarkerBounds, paramVariable, constants, inEqualityType, 2);

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
                    triggeringPoint1 = inequalityPlottingFunctions._findTriggeringPointForInequality(lastPoint, currentPoint1, engineA, engineB, engineC, functionVariable, previousInEqualityType, engine1, graphViewMarkerBounds, paramVariable, constants, inEqualityType, 2);
                    if (previousInEqualityType === 'NanCase') {
                        triggeringPoint1 = inequalityPlottingFunctions._findTriggeringPointForNanCase(triggeringPoint1, currentPoint1, engine1, paramVariableIndex, functionVariableIndex, currentPoint1);
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
                        segmentsGroup = segmentsGroup.concat(inequalityPlottingFunctions._processInequalityNanCases(segment, leftEngine, rightEngine, inEqualityType, constants, functionVariable, paramVariable));
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

        "_findTriggeringPointForNanCase": function(firstPoint, secondPoint, engine, paramVariableIndex, functionVariableIndex, lastValidPoint) {
            var newParamVariableValue,
                newFunctionVariableValue,
                LIMIT = 5,
                validPoint;

            if (firstPoint[paramVariableIndex].toFixed(LIMIT) === secondPoint[paramVariableIndex].toFixed(LIMIT)) {
                return lastValidPoint;
            }
            newParamVariableValue = plottingFunctions.getCenterOfCoordinates(firstPoint[paramVariableIndex], secondPoint[paramVariableIndex]);
            newFunctionVariableValue = engine(newParamVariableValue);
            validPoint = [];
            validPoint[paramVariableIndex] = newParamVariableValue;
            validPoint[functionVariableIndex] = newFunctionVariableValue;
            if (!isFinite(newFunctionVariableValue)) {
                validPoint = inequalityPlottingFunctions._findTriggeringPointForNanCase(firstPoint, validPoint, engine, paramVariableIndex, functionVariableIndex, lastValidPoint);
            } else {
                validPoint = inequalityPlottingFunctions._findTriggeringPointForNanCase(validPoint, secondPoint, engine, paramVariableIndex, functionVariableIndex, validPoint);
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
                        satisfiesCondition = leftEngine(variables) <= rightEngine(variables, plottingFunctions.functions);
                        break;
                    case 'greater':
                    case 'gtequal':

                        satisfiesCondition = leftEngine(variables) >= rightEngine(variables, plottingFunctions.functions);
                        break;
                }
                if (satisfiesCondition && pointsCounter < pointsLength - 1) {
                    newSegments.push(currentPoint);
                } else {
                    if (newSegments.length > 1) {
                        plotObject = {
                            "firstRoots": newSegments,
                            "inEqualityType": "NanCase",
                            "secondRoots": newSegments
                        };
                        returnSegments.push(plotObject);
                    }
                    newSegments = [];
                }
            }
            return returnSegments;
        },

        "_findTriggeringPointForInequality": function(firstPoint, secondPoint, engineA, engineB, engineC, functionVariable, previousInequalityType, engine, graphViewMarkerBounds, paramVariable, equationConstants, inEqualityType, equationOrder) {
            var newPointX,
                newPointY,
                lhsValue,
                returnPoint,
                inEqualityType;
            if (functionVariable === 'y') {
                newPointX = plottingFunctions.getCenterOfCoordinates(firstPoint[0], secondPoint[0]);
                newPointY = engine(newPointX);
                if (!isFinite(newPointY)) {
                    return firstPoint;
                }
                if (firstPoint[0].toFixed(5) === newPointX.toFixed(5) || secondPoint[0].toFixed(5) === newPointX.toFixed(5)) {
                    return [newPointX, newPointY];
                }
            } else {
                newPointY = plottingFunctions.getCenterOfCoordinates(firstPoint[1], secondPoint[1]);
                newPointX = engine(newPointY);
                if (firstPoint[1] === newPointY || secondPoint[1] === newPointY) {
                    return [newPointX, newPointY];
                }
            }
            lhsValue = inequalityPlottingFunctions._getLhsValueForPoint([newPointX, newPointY], engineA, engineB, engineC, functionVariable, graphViewMarkerBounds, paramVariable, equationConstants, inEqualityType, equationOrder);
            if (lhsValue <= 0) {
                inEqualityType = 'lesser';
            } else if (equationOrder === 2 && isNaN(lhsValue)) {
                inEqualityType = 'NanCase';
            } else {
                inEqualityType = 'greater';
            }
            if (previousInequalityType === inEqualityType) {
                returnPoint = inequalityPlottingFunctions._findTriggeringPointForInequality([newPointX, newPointY], secondPoint, engineA, engineB, engineC, functionVariable, previousInequalityType, engine, graphViewMarkerBounds, paramVariable, inEqualityType, equationOrder);
            } else {
                returnPoint = inequalityPlottingFunctions._findTriggeringPointForInequality(firstPoint, [newPointX, newPointY], engineA, engineB, engineC, functionVariable, previousInequalityType, engine, graphViewMarkerBounds, paramVariable, inEqualityType, equationOrder);
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
            if (typeof engineA !== "undefined") {
                valueA = engineA(constants, plottingFunctions.functions);
                valueA = Math.pow(functionVariableValue, 2) * valueA;
                lhsValue += valueA;

            }
            if (typeof engineB !== "undefined") {
                valueB = engineB(constants, plottingFunctions.functions);
                valueB = functionVariableValue * valueB;
                lhsValue += valueB;
            }
            if (typeof engineC !== "undefined") {
                valueC = engineC(constants, plottingFunctions.functions);
                lhsValue += valueC;
            }
            return lhsValue;
        }
    };

    self.addEventListener('message', function(e) {
        var data = e.data,
            functionCode = data.code,
            plot = data.plot,
            constants = data.constants,
            id = data.id,
            inequalityPlots = null,
            inequalityData = data.inequalityData,
            plotSessionCount = data.plotSession,
            autonomous = data.autonomous,
            functionVariable = data.functionVariable,
            customFunctions = data.functions,
            equationFunctions = data.equationFunctions,
            engine, lines, lines2, criticalArray1 = [],
            criticalArray2 = [],
            hasMaximaMinima = data.hasMaximaMinima,
            hasIntercepts = data.hasIntercepts,
            engine1,
            rightEngine,
            leftEngine,
            engineA1,
            engineB1,
            engineC1,
            functions,
            engine2;

        if (autonomous) {
            engine = new Function('constants,plot', functionCode);
            lines = engine(constants, plot);

        } else {

            if (customFunctions) {
                functions = plottingFunctions.functions = plottingFunctions.createCustomFunctions(customFunctions, equationFunctions, constants);
            }

            engine = new Function('param,constants,functions', functionCode);

            engine1 = function eng1(param) {
                var soln = engine(param, constants, functions);
                return soln[0];
            };
            engine2 = function eng2(param) {
                var soln = engine(param, constants, functions);
                return soln[1];
            };
            lines = plottingFunctions.generatePlot(engine1, plot, functionVariable, hasIntercepts, functionCode, true, constants);

            // repeated because engine created is causing some problems in mac safari on 1st load
            engine = new Function('param,constants,functions', functionCode);

            if (hasMaximaMinima) {
                criticalArray1 = plottingFunctions.findCriticalPoints(lines, functionVariable, engine1, plot, false);
            }
            if (data.order === 2) {
                lines2 = plottingFunctions.generatePlot(engine2, plot, functionVariable, hasIntercepts, functionCode, false, constants);
                if (hasMaximaMinima) {
                    criticalArray2 = plottingFunctions.findCriticalPoints(lines2, functionVariable, engine2, plot, false);
                }
                if (hasIntercepts) {
                    plot.interceptPoints = plot.interceptPoints.concat(plottingFunctions.findInterceptsForTwoArrays(lines, lines2, engine1, engine2, functionVariable, plot));
                }
            }
        }
        criticalArray1 = criticalArray1.concat(criticalArray2);
        if (typeof inequalityData !== 'undefined') {
            if (inequalityData.inEqualityType !== 'equal') {
                if (typeof inequalityData.functionCodeA !== 'undefined') {
                    engineA1 = new Function('constants, functions', inequalityData.functionCodeA);
                }
                if (typeof inequalityData.functionCodeB !== 'undefined') {
                    engineB1 = new Function('constants, functions', inequalityData.functionCodeB);
                }
                if (typeof inequalityData.functionCodeC !== 'undefined') {
                    engineC1 = new Function('constants, functions', inequalityData.functionCodeC);
                }
                if (typeof inequalityData.leftFunctionCode !== 'undefined') {
                    leftEngine = new Function('constants, functions', inequalityData.leftFunctionCode);
                }
                if (typeof inequalityData.rightFunctionCode !== 'undefined') {
                    rightEngine = new Function('constants, functions', inequalityData.rightFunctionCode);
                }
                if (data.order < 2) {
                    inequalityPlots = inequalityPlottingFunctions.getInequalityPlots(engineA1, engineB1, engineC1, functionVariable, inequalityData.maxX,
                        inequalityData.minX, inequalityData.maxY, inequalityData.minY, plot.paramVariable, plot.minX, plot.maxX, plot.step, constants,
                        engine1, inequalityData.graphViewMarkerBounds, inequalityData.inEqualityType);
                } else {
                    inequalityPlots = inequalityPlottingFunctions.getInequalityPlotForQuadratic(engine1, engine2, inequalityData.inEqualityType,
                        inequalityData.graphViewMarkerBounds, plot.minX, plot.maxX, plot.step, inequalityData.minX, inequalityData.minY, inequalityData.maxX,
                        inequalityData.maxY, engineA1, engineB1, engineC1, functionVariable, constants, plot.paramVariable, leftEngine, rightEngine);
                }
            }
        }
        self.postMessage({
            "lines": lines,
            "lines2": lines2,
            "id": id,
            "plot": plot,
            "plotSession": plotSessionCount,
            "criticalArray": criticalArray1,
            "inequalityPlots": inequalityPlots
        });

    }, false);
})();
