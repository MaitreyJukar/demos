(function() {
    "use strict";

    var intersectionPoints = {

        "createCustomFunctions": function(localFunctions, equationFunctions, constants, functions) {
            var functionCounter,
                currentFunction,
                actualEngine, scopeFunction,
                tempEngine,
                engine;
            if (!functions) {
                functions = {};
            }
            for (functionCounter in localFunctions) {
                currentFunction = localFunctions[functionCounter];
                if (currentFunction) {
                    scopeFunction = function(param) {
                        engine = new Function('param,constants,functions', param);
                        tempEngine = function(engineName) {
                            actualEngine = function(data) {
                                var soln = engineName(data, constants, functions);
                                return soln[0];
                            };
                        };
                        tempEngine(engine);
                    };
                    scopeFunction(currentFunction);
                    functions[functionCounter] = actualEngine;
                }
            }
            return functions;
        },

        "_refinePoints": function(dataObj) {
            var points = dataObj.points,
                engine1 = dataObj.engine1,
                engine2 = dataObj.engine2,
                order1 = dataObj.order1,
                order2 = dataObj.order2,
                constants = dataObj.constants,
                pts1 = dataObj.pts1,
                pts2 = dataObj.pts2,
                data = dataObj.data,
                refinedPoints = [],
                engine11,
                engine12,
                engine21,
                engine22,
                engineA,
                engineB,
                pointCounter,
                point,
                functions,
                customFunctions = data.customFunctions,
                equation1Functions = data.equation1Functions,
                equation2Functions = data.equation2Functions,
                useEngine2 = pts2 < pts1,
                noOfPoints = points.length,
                refinedPoint;

            functions = this.createCustomFunctions(customFunctions, equation1Functions, constants);
            engine1 = new Function('param,constants,functions', engine1);
            engine11 = function eng2(param) {
                var soln = engine1(param, constants, functions);
                return soln[0];
            };
            engine12 = function eng2(param) {
                var soln = engine1(param, constants, functions);
                return soln[1];
            };

            functions = this.createCustomFunctions(customFunctions, equation2Functions, constants);
            engine2 = new Function('param,constants,functions', engine2);
            engine21 = function eng2(param) {
                var soln = engine2(param, constants, functions);
                return soln[0];
            };
            engine22 = function eng2(param) {
                var soln = engine2(param, constants, functions);
                return soln[1];
            };

            for (pointCounter = 0; pointCounter < noOfPoints; pointCounter++) {
                engineA = engine11;
                engineB = engine21;
                point = points[pointCounter];

                if (order1 > 1) {
                    engineA = this._selectRequiredEngine(point, engine11, engine12);
                }
                if (order2 > 1) {
                    engineB = this._selectRequiredEngine(point, engine21, engine22);
                }
                refinedPoint = this._refineIntersection(this._getIntersection(point, engineA, engineB, useEngine2)[0], engineA, engineB);
                refinedPoints.push(refinedPoint);
            }
            return refinedPoints;
        },

        "_selectRequiredEngine": function(point, engine1, engine2) {
            var y1, y2;

            y1 = engine1(point[0]);
            y2 = engine2(point[0]);
            if (Math.abs(point[1] - y1) < Math.abs(point[1] - y2)) {
                return engine1;
            }
            return engine2;
        },

        /**
         *It is used to get distance between two points
         *@method _getDistance
         *@param {Object} x1 Abscissa of first point
         *@param {Object} y1 Ordinate of first point
         *@param {Object} x2 Abscissa of second point
         *@param {Object} y2 Ordinate of second point
         */
        "_getDistance": function(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
        },

        "_refineIntersection": function(x, engine1, engine2) {
            var xDash = this._getRoundedNumber(x),
                y1,
                y2,
                y1Dash,
                y2Dash;

            y1 = engine1(x);
            y2 = engine2(x);
            y1Dash = engine1(xDash);
            y2Dash = engine2(xDash);
            if (this._getDistance(x, y1, x, y2) >= this._getDistance(xDash, y1Dash, xDash, y2Dash)) {
                return [xDash, y1Dash];
            }
            return [x, y1];
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

        "_getIntersection": function(point, engine1, engine2, useEngine2) {
            var y1,
                y2,
                x1,
                x2,
                STEP = 1e-5,
                THRESHOLD = 1e-15,
                SQUARE = 2,
                isTrue = true,
                distance,
                xLeft,
                y1Left,
                xRight,
                y1Right,
                y2Left,
                y2Right,
                newDistance;

            y1 = engine1(point[0]);
            y2 = engine2(point[0]);
            distance = this._getDistance(point[0], y1, point[0], y2);
            if (distance < THRESHOLD) {
                if (useEngine2) {
                    return [point[0], y2];
                }
                return [point[0], y1];
            }

            xLeft = point[0] - STEP;
            xRight = point[0] + STEP;
            y1Left = engine1(xLeft);
            y1Right = engine1(xRight);
            y2Left = engine2(xLeft);
            y2Right = engine2(xRight);

            if (this._getDistance(xLeft, y1Left, xLeft, y2Left) < this._getDistance(xRight, y1Right, xRight, y2Right)) {
                STEP *= -1;
            }

            while (isTrue) {
                point[0] = point[0] + STEP;
                x1 = point[0];
                x2 = point[0];
                point[1] = engine1(point[0]);
                y1 = point[1];
                y2 = engine2(point[0]);
                if (distance < THRESHOLD) {
                    if (useEngine2) {
                        return [point[0], y2];
                    }
                    return [point[0], y1];
                }
                newDistance = this._getDistance(x1, y1, x2, y2);
                if (distance <= newDistance) {
                    if (Math.abs(STEP) < THRESHOLD) {
                        if (useEngine2) {
                            return [point[0], y2];
                        }
                        return [point[0], y1];
                    }
                    STEP *= -1;
                    STEP /= 2;
                }
                if (!isFinite(newDistance)) {
                    if (useEngine2) {
                        return [point[0], y2];
                    }
                    return [point[0], y1];
                }
                distance = this._getDistance(x1, y1, x2, y2);
            }
        }
    };
    self.addEventListener('message', function(e) {
        var data = e.data,
            newPoints,
            id1 = data.id1,
            id2 = data.id2,
            functions = {
                "customFunctions": data.functions,
                "equation1Functions": data.equationFunctions,
                "equation2Functions": data.equation1Functions
            },
            dataObj = {
                "points": data.points,
                "engine1": data.code1,
                "engine2": data.code2,
                "order1": data.order1,
                "order2": data.order2,
                "constants": data.constants,
                "pts1": data.pts1,
                "pts2": data.pts2,
                "data": functions
            };

        newPoints = intersectionPoints._refinePoints(dataObj);
        self.postMessage({
            "points": newPoints,
            "id1": id1,
            "id2": id2
        });

    }, false);
})();
