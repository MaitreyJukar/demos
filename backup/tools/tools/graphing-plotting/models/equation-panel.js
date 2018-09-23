/* globals _, window, MatrixData  */

(function(MathUtilities) {
    "use strict";

    MathUtilities.Tools.Graphing.Models.EquationPanel = Backbone.Model.extend({
        "defaults": function() {
            return {

                /**
                 * holds cursor class object in table
                 * @property tableCursorClass
                 * @type {Object}
                 */
                "tableCursorClass": null,

                /**
                 * holds collection of table views
                 * @property tableViews
                 * @type {Array}
                 */
                "tableViews": null,

                /**
                 * holds table count value
                 * @property tableCounter
                 * @type {Number}
                 */
                "tableCounter": 0,

                /**
                 * holds equation data collection object
                 * @property equationDataCollection
                 * @type {Object}
                 */
                "equationDataCollection": null,

                /**
                 * holds keyboardView object
                 * @property keyboardView
                 * @type {Object}
                 */
                "keyboardView": null,

                /**
                 * holds Slider collection array
                 * @property sliderViewsCollection
                 * @type {Array}
                 */
                "sliderViewsCollection": null,

                /**
                 * holds cursor class object
                 * @property cursorClassTag
                 * @type {Object}
                 */
                "cursorClassTag": null,

                /**
                 * holds thickness slider collection array
                 * @property thicknessSliderCollections
                 * @type {Array}
                 */
                "thicknessSliderCollections": null,

                /**
                 * holds data of slider when sliding starts
                 * @property slidingStartData
                 * @type {Object}
                 */
                "slidingStartData": null,

                /**
                 * holds slider limit data
                 * @property sliderLimitData
                 * @type {Object}
                 */
                "sliderLimitData": null,

                /**
                 * Specifies units for equationData
                 * @property equationDataUnits
                 * @type {String}
                 * @default 'rad'
                 */
                "equationDataUnits": null,

                /**
                 * holds equationData manager object
                 * @property _equationDataManager
                 * @type {Object}
                 */
                "_equationDataManager": null,

                /**
                 * Flag which determines animate charts property
                 * @property animateCharts
                 * @type {Boolean}
                 * @default false
                 */
                "animateCharts": false,

                /**
                 * holds data related to error messages
                 * @property ERROR_STRINGS
                 * @type {Object}
                 */
                "ERROR_STRINGS": null,

                "precision": MathUtilities.Components.Utils.Models.MathHelper.DEFAULT_PRECISION_VALUE_GRAPHING_TOOL,

                "_selectedColorIndex": null,

                "COLOR_NAMES": null,
                "pointsIndicatorObject": null,

                "_PLOT_COLORS": null,
                "listCounter": 0,
                "residualColumnDependency": null
            };
        },

        "initialize": function(options) {
            MathUtilities.Tools.Graphing.Models.EquationPanel.BASEPATH = MathUtilities.Tools.Graphing.Models.GraphingToolModel.BASEPATH;
            this.set({
                "chartTableMapping": {},
                "equationDataUnits": "rad",
                "sliderViewsCollection": [],
                "tableViews": [],
                "thicknessSliderCollections": [],
                "pointsIndicatorObject": {}
            });
            var PLOT_COLOR_1, PLOT_COLOR_2, PLOT_COLOR_3,
                PLOT_COLOR_4, PLOT_COLOR_5, PLOT_COLOR_6,
                accData = MathUtilities.Tools.Graphing.Models.GraphingToolModel.JSON_DATA,
                accDataScreen,
                ERROR_STRINGS = {
                    "TABLE_ERRORS": {},
                    "LIST_ERRORS": {}

                },
                COLOR_NAMES;
            PLOT_COLOR_1 = "#6732be";

            PLOT_COLOR_2 = "#0086a7";

            PLOT_COLOR_3 = "#ff9600";

            PLOT_COLOR_4 = "#29c38e";

            PLOT_COLOR_5 = "#edc900";

            PLOT_COLOR_6 = "#cb3e87";
            this.set({
                "_PLOT_COLORS": [PLOT_COLOR_1, PLOT_COLOR_2, PLOT_COLOR_3, PLOT_COLOR_4, PLOT_COLOR_5, PLOT_COLOR_6],
                "_selectedColorIndex": 0
            });
            var accManager = options.accManager;
            _.each(accData, function(screens) {
                if (screens.id === 'error-strings') {
                    accDataScreen = screens;
                    _.each(accDataScreen.elements, function(element) {
                        if (element.id === 'table-errors') {
                            _.each(element.messages, function(message) {
                                ERROR_STRINGS.TABLE_ERRORS[message.id] = accManager.getMessage('table-errors', message.id);
                            });
                        } else {
                            _.each(element.messages, function(message) {
                                ERROR_STRINGS.LIST_ERRORS[message.id] = accManager.getMessage('list-errors', message.id);
                            });
                        }
                    });
                }
            });

            COLOR_NAMES = {
                "#6732be": "purple",
                "#0086a7": "blue",
                "#ff9600": "orange",
                "#29c38e": "green",
                "#edc900": "lightblue",
                "#cb3e87": "pink"
            };
            this.set({
                "ERROR_STRINGS": ERROR_STRINGS,
                "COLOR_NAMES": COLOR_NAMES
            });
        },
        /**
        Returns random color code
        @method generateRandomColorCode
        @return {String} random color code string
        **/
        "generateRandomColorCode": function() {
            var _PLOT_COLORS = this.get("_PLOT_COLORS"),
                _selectedColorIndex = this.get("_selectedColorIndex"),
                selectedColor = _PLOT_COLORS[_selectedColorIndex];

            this.set("_selectedColorIndex", (_selectedColorIndex + 1) % _PLOT_COLORS.length);
            return selectedColor;
        },

        /**
         * Calculates Inverse of given matrix using row transformation
         * @method _calculateInverse
         * @param firstArray {Object}
         * @return {Array} Array of inverse matrix elements
         */
        "_calculateInverse": function(firstArray) {
            var rows,
                inputMatrixElements,
                identityMatrixElements,
                identityMatrix,
                rowCounter,
                colCounter,
                identityMatrixData,
                inputData,
                dataArray,
                nextElement,
                pivotCounter,
                pivotIndex,
                pivotElement;
            rows = firstArray.rows();
            identityMatrix = MatrixData.eye(rows);
            // ___getElements is a Matrix library function
            inputMatrixElements = firstArray.___getElements();
            identityMatrixElements = identityMatrix.___getElements();
            inputData = this._getElementsInMultiDimensionalArray(inputMatrixElements, rows, rows);
            identityMatrixData = this._getElementsInMultiDimensionalArray(identityMatrixElements, rows, rows);
            for (colCounter = 1; colCounter <= rows; colCounter++) {
                pivotElement = inputData[colCounter][colCounter];
                pivotCounter = 0;
                if (pivotElement === 0) {
                    pivotIndex = colCounter;
                    // if pivot element is equal to zero
                    do {
                        pivotIndex = (pivotIndex + 1) % (rows + 1);
                        if (inputData[pivotIndex] === void 0) {
                            nextElement = 0;
                        } else {
                            nextElement = inputData[pivotIndex][colCounter];
                        }
                        pivotCounter++;
                        if (pivotCounter > rows) {
                            return false;
                        }
                    } while (nextElement === 0);
                    if (nextElement !== 0) {
                        inputData[colCounter] = this._addTwoRows(inputData[colCounter], inputData[pivotIndex]);
                        identityMatrixData[colCounter] = this._addTwoRows(identityMatrixData[colCounter], identityMatrixData[pivotIndex]);
                    }
                    pivotElement = inputData[colCounter][colCounter];
                }
                // make pivot element equal to 1
                inputData[colCounter] = this._divideRowBy(inputData[colCounter], pivotElement);
                identityMatrixData[colCounter] = this._divideRowBy(identityMatrixData[colCounter], pivotElement);
                // make other elements of the same column equal to zero
                for (rowCounter = 1; rowCounter <= rows; rowCounter++) {
                    if (rowCounter === colCounter) {
                        continue;
                    }
                    identityMatrixData[rowCounter] = this._rowTransform(identityMatrixData[rowCounter],
                        identityMatrixData[colCounter], inputData[rowCounter][colCounter]);
                    inputData[rowCounter] = this._rowTransform(inputData[rowCounter], inputData[colCounter], inputData[rowCounter][colCounter]);
                }
            }
            dataArray = this._getElementsArray(identityMatrixData, rows, rows);
            return dataArray;
        },

        /**
         * Adds two rows
         * @method _addTwoRows
         * @param row1 {Array} Row 1
         * @param row2 {Array} Row 2
         * @return {Array} Sum of two given rows
         */
        "_addTwoRows": function(row1, row2) {
            var rowLength = row1.length,
                rowCounter;
            for (rowCounter = 1; rowCounter < rowLength; rowCounter++) {
                row1[rowCounter] = row1[rowCounter] + row2[rowCounter];
            }
            return row1;
        },

        /**
         * Converts multidimensional matrix into array of elements
         * @method _getElementsArray
         * @param inputData {Array} two dimensional matrix data
         * @param rows {Number} Number of rows
         * @param cols {Number} Number of cols
         * @return {Array} Array of elements
         */
        "_getElementsArray": function(inputData, rows, cols) {
            var rowCounter,
                colCounter,
                dataArray = [];
            for (rowCounter = 1; rowCounter <= rows; rowCounter++) {
                for (colCounter = 1; colCounter <= cols; colCounter++) {
                    dataArray.push(inputData[rowCounter][colCounter]);
                }
            }
            return dataArray;
        },

        /**
         * Performs standard row transformation
         * @method _rowTransform
         * @param row2 {Array}
         * @param row1 {Array}
         * @param element {Number}
         * @return {Array} row after transformation
         */
        "_rowTransform": function(row2, row1, element) {
            var rowLength = row1.length,
                rowCounter;
            for (rowCounter = 1; rowCounter < rowLength; rowCounter++) {
                row2[rowCounter] = row2[rowCounter] - row1[rowCounter] * element;
            }
            return row2;
        },

        /**
         * Divides row by the given element
         * @method _divideRowBy
         * @param row {Array} Row to be divided
         * @param divider {Number} number by which row is to be divided
         * @return {Array} Row after division
         */
        "_divideRowBy": function(row, divider) {
            var rowLength = row.length,
                rowCounter;
            for (rowCounter = 1; rowCounter < rowLength; rowCounter++) {
                row[rowCounter] = row[rowCounter] / divider;
            }
            return row;
        },

        /**
         * _getElementsInMultiDimensionalArray returns two dimensional array of given matrix data
         * @method _getElementsInMultiDimensionalArray
         * @param {Array} Array of matrix elements
         * @param {Number} Number of rows
         * @param {Number} Number of columns
         * @return {Array} two dimensional array
         */
        "_getElementsInMultiDimensionalArray": function(inputData, rows, cols) {
            var multiDimensionalData = [],
                rowCounter,
                colCounter,
                index = 1,
                noOfElements = inputData.length;
            for (colCounter = 1; colCounter <= noOfElements; colCounter += rows) {
                multiDimensionalData[index] = [];
                for (rowCounter = 1; rowCounter <= rows; rowCounter++) {
                    multiDimensionalData[index][rowCounter] = inputData[rowCounter - 1 + (colCounter - 1)];
                }
                index++;
            }
            return multiDimensionalData;
        },

        // best fit calculations:
        "_updateInvalidPoints": function(points) {
            if (points === void 0 || points === null) {
                return points;
            }
            var loopVar,
                MathHelper = MathUtilities.Components.Utils.Models.MathHelper,
                noOfPoints = 0;
            points = points.slice();
            noOfPoints = points.length;
            for (loopVar = 0; loopVar < noOfPoints; loopVar++) {
                if (!(isFinite(points[loopVar][0]) && isFinite(points[loopVar][1]))) {
                    points[loopVar][0] = MathHelper._generateNumberFromLatex(points[loopVar][0]);
                    points[loopVar][1] = MathHelper._generateNumberFromLatex(points[loopVar][1]);
                    if (!(isFinite(points[loopVar][0]) && isFinite(points[loopVar][1]))) {
                        points.splice(loopVar, 1);
                        noOfPoints--;
                    }
                }
            }
            return points;
        },
        "_getBestFitLine": function(points, isIntermediateCall, bestFitObject, alertProp, focusElementId) {
            var slope,
                yIntercept,
                pointCounter,
                currentPoint,
                x,
                y,
                solutionSlope,
                solutionIntercept,
                pointsLength,
                sumOfX = 0,
                sumOfY = 0,
                sumOfXY = 0,
                solutionObject = {},
                displayString,
                sumOfXSquare = 0,
                displaySlope,
                solutionString,
                MIN_POINTS = 2,
                displayIntercept,
                bestFitData;
            if (alertProp) {
                alertProp = this.get("ERROR_STRINGS").TABLE_ERRORS._BEST_FIT_CHART_LINE_STRING + alertProp.chartName;
            }
            if ((points === null || points === void 0 || points.length < MIN_POINTS) && !isIntermediateCall) {
                this.trigger('best-fit-line-alert', alertProp, focusElementId);
                return void 0;
            }
            if (!points || points.length < MIN_POINTS) {
                return void 0;
            }
            pointsLength = points.length;
            for (pointCounter = 0; pointCounter < pointsLength; pointCounter++) {
                currentPoint = points[pointCounter];
                x = Number(currentPoint[0]);
                y = Number(currentPoint[1]);
                if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y) && !isIntermediateCall) {
                    this.trigger("best-fit-slope-alert", alertProp);
                    return void 0;
                }
                sumOfX += x;
                sumOfXSquare += Math.pow(x, 2);
                sumOfY += y;
                sumOfXY += x * y;
            }
            slope = (pointsLength * sumOfXY - sumOfX * sumOfY) / (pointsLength * sumOfXSquare - Math.pow(sumOfX, 2));
            yIntercept = (sumOfY - slope * sumOfX) / pointsLength;
            solutionString = 'y=' + this._trimNumberForDisplay(slope, true) + 'x+' + this._trimNumberForDisplay(yIntercept, true);
            displaySlope = String(this._trimNumberForDisplay(slope));
            displayIntercept = String(this._trimNumberForDisplay(yIntercept));
            solutionSlope = String(this._trimNumberForDisplay(slope, true));
            solutionIntercept = String(this._trimNumberForDisplay(yIntercept, true));
            slope = this._generateLatexForNumber(slope);
            yIntercept = this._generateLatexForNumber(yIntercept);
            bestFitData = "y=" + slope + "x+" + yIntercept;
            solutionObject.coef = [slope, yIntercept];
            solutionObject.constants = {
                "d_x_1": slope,
                "d_x_2": yIntercept
            };
            solutionObject.degree = 1;
            if (displaySlope === "0" || isNaN(slope)) {
                displaySlope = " ";
            } else if (displaySlope === "1") {
                displaySlope = "x";
            } else if (displaySlope === "-1") {
                displaySlope = "-x";
            } else {
                displaySlope = displaySlope + "x";
            }
            if (solutionSlope === "0" || isNaN(slope)) {
                solutionSlope = " ";
            } else if (solutionSlope === "1") {
                solutionSlope = "x";
            } else if (solutionSlope === "-1") {
                solutionSlope = "-x";
            } else {
                solutionSlope += "x";
            }
            if (yIntercept === "0" || isNaN(yIntercept)) {
                displayIntercept = "";
                solutionIntercept = "";
            } else {
                if (displaySlope !== " ") {
                    displayIntercept = "+" + displayIntercept;
                    solutionIntercept = "+" + solutionIntercept;
                }
            }
            solutionString = "y=" + solutionSlope + solutionIntercept;
            displayString = "y = " + displaySlope + displayIntercept;
            if (displaySlope === " " && displayIntercept === "") {
                displayString += "0";
                solutionString += "0";
            }
            if (isNaN(slope)) {
                if (points !== null && points !== void 0 && points.length >= MIN_POINTS && !isIntermediateCall) {
                    this.trigger("best-fit-slope-alert", alertProp);
                }
                return void 0;
            }
            // replace "+ -" with "-"
            displayString = displayString.replace(/\s\+\s\-/g, " - ");
            solutionObject.solutionString = solutionString;
            solutionObject.displayString = displayString;
            solutionObject.orgSolution = bestFitData;
            solutionObject.functionCode = "param===0?param=0:param=param;var solution,a = (0),b=((1)), c=((-((constants['d_x_1'])*param)+-(constants['d_x_2'])));solution = []; a !== 0 ? (solution[0] = (-b + Math.sqrt(b*b - 4*a*c))/(2*a),solution[1] = (-b - Math.sqrt(b*b - 4*a*c))/(2*a)) :(solution[0] = -c/b,solution[1] = solution[0]); return solution;";
            return solutionObject;
        },

        "_generateLatexForNumber": function(num) {
            num = String(num);
            var indexOfE = num.indexOf("e"),
                numLatex;
            if (indexOfE !== -1) {
                numLatex = num.split("e");
                num = numLatex[0] + "\\cdot10^{" + numLatex[1] + "}";
            }
            return num;
        },
        "_getBestFitCurve": function(points, power, isIntermediateCall, alertProp, focusElementId) {
            var noOfTerms,
                pointCounter,
                x = [],
                y = [],
                data,
                sumOfxRaisedToN = [],
                sumOfy = 0,
                sumOfxRaisedToNy = [],
                matrixa,
                matrixb,
                matrixFormData = new Array(power),
                matrixBFormData = new Array(power),
                solution, solutionForX,
                solutionForXLatex,
                displayString, firstPoint, secondPoint,
                solutionObject = {},
                funcCodeAndCoeffObj = {},
                solutionString,
                orgSolution,
                xIndexCounter,
                MIN_POINTS = 2,
                yIndexCounter;
            solutionObject.degree = power;
            if (alertProp) {
                alertProp = this.get("ERROR_STRINGS").TABLE_ERRORS._BEST_FIT_CHART_CURVE_STRING + alertProp.chartName;
            }
            if ((!points || points.length < MIN_POINTS) && isIntermediateCall === false) {
                this.trigger("best-fit-line-alert", alertProp, focusElementId);
                return void 0;
            }
            if (!points || points.length < MIN_POINTS) {
                return void 0;
            }
            noOfTerms = points.length;
            power++;
            firstPoint = points[0];
            secondPoint = points[1];
            if (firstPoint[0] === secondPoint[0] && firstPoint[1] === secondPoint[1]) {
                this.trigger("best-fit-curve-error-alert", alertProp);
                return void 0;
            }
            for (pointCounter = 0; pointCounter < noOfTerms; pointCounter++) {
                x.push(Number(points[pointCounter][0]));
                y.push(Number(points[pointCounter][1]));
                sumOfy += y[pointCounter];
            }
            data = this._getSumOfWithPower(x, y, (power - 1) * 2);
            sumOfxRaisedToN = data.elemSum;
            sumOfxRaisedToNy = data.elemSumWithY;
            sumOfxRaisedToN[0] = noOfTerms;
            sumOfxRaisedToNy[0] = sumOfy;
            for (xIndexCounter = 0; xIndexCounter < power; xIndexCounter++) {
                matrixFormData[xIndexCounter] = new Array(power);
                matrixBFormData[xIndexCounter] = [sumOfxRaisedToNy[xIndexCounter]];
                for (yIndexCounter = 0; yIndexCounter < power; yIndexCounter++) {
                    matrixFormData[xIndexCounter][yIndexCounter] = sumOfxRaisedToN[xIndexCounter + yIndexCounter];
                }
            }
            matrixa = new MatrixData(matrixFormData);
            matrixa = this._calculateInverse(matrixa);
            if (matrixa === false) {
                this.trigger("best-fit-curve-error-alert", alertProp);
                return void 0;
            }
            matrixa = new MatrixData(matrixa);
            matrixb = new MatrixData(matrixBFormData);
            // ___getElements is a Matrix library function
            solution = matrixa.multiply(matrixb).___getElements();
            funcCodeAndCoeffObj = this._setFuncCodeAndCoeffForBestFitCurve(solution.slice().reverse(), power);
            orgSolution = "y=";
            displayString = "y = ";
            solutionString = "y = ";
            for (xIndexCounter = solution.length - 1; xIndexCounter > 0; xIndexCounter--) {
                if (isNaN(solution[xIndexCounter])) {
                    this.trigger("best-fit-curve-error-alert", alertProp);
                    return void 0;
                }
                solutionForX = String(this._trimNumberForDisplay(solution[xIndexCounter]));
                solutionForXLatex = String(this._trimNumberForDisplay(solution[xIndexCounter], true));
                solution[xIndexCounter] = this._generateLatexForNumber(solution[xIndexCounter]);
                orgSolution += solution[xIndexCounter] + "x^" + xIndexCounter + "+";
                if (solutionForX === "0" || solutionForX === "-0") {
                    //no x
                    continue;
                }
                switch (solutionForX) {
                    case "1":
                        solutionString += " x";
                        displayString += " x";
                        break;
                    case "-1":
                        solutionString += "- x";
                        displayString += "- x";
                        break;
                    default:
                        solutionString += solutionForXLatex + "x";
                        displayString += solutionForX + "x";
                }
                if (xIndexCounter !== 1) {
                    displayString += "<sup>" + xIndexCounter + "</sup> + ";
                    solutionString += "^" + xIndexCounter + "+ ";
                } else {
                    displayString += " + ";
                    solutionString += " + ";
                }
            }
            orgSolution += this._generateLatexForNumber(solution[0]);
            solutionForX = String(this._trimNumberForDisplay(solution[0]));
            solutionForXLatex = String(this._trimNumberForDisplay(solution[0], true));
            if (solutionForX !== "0" && solutionForX !== "-0") {
                displayString += solutionForX;
                solutionString += solutionForXLatex;
            } else {
                if (displayString === "y = ") {
                    displayString += "0";
                    solutionString += "0";
                } else {
                    displayString = displayString.substr(0, displayString.length - MIN_POINTS);
                    solutionString = solutionString.substr(0, solutionString.length - MIN_POINTS);
                }
            }
            // replace "+ -" with "-"
            displayString = displayString.replace(/\s\+\s\-/g, " - ");
            solutionString = solutionString.replace(/\+\s\-/g, " - ");
            solutionObject.functionCode = funcCodeAndCoeffObj.functionCode;
            solutionObject.coef = solution.slice().reverse();
            solutionObject.constants = funcCodeAndCoeffObj.constants;
            solutionObject.solutionString = solutionString.replace(/\s/g, ""); //removes spaces and tabs
            solutionObject.displayString = displayString;
            solutionObject.orgSolution = orgSolution;
            return solutionObject;
        },

        "_setFuncCodeAndCoeffForBestFitCurve": function(coef, power) {
            var counter = 0,
                length = coef.length,
                degree = power - 1,
                functionCode,
                funcCodeAndCoeffObj,
                constants = {};

            for (; counter < length; counter++) {
                constants['d_x_' + --power] = Number(coef[counter]);
            }

            switch (degree) {
                case 2: // eqn of degree 2 will be y = d_x_2 * x^2 + d_x_1 * x + d_x_0
                    functionCode = "param===0?param=0:param=param;var solution,a = (0),b=((1)), c=((-((constants['d_x_2'])*(raised=0,absBase=0,sign=0,num=param,pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_1'])*param)+-(constants['d_x_0'])));solution = []; a !== 0 ? (solution[0] = (-b + Math.sqrt(b*b - 4*a*c))/(2*a),solution[1] = (-b - Math.sqrt(b*b - 4*a*c))/(2*a)) :(solution[0] = -c/b,solution[1] = solution[0]); return solution;";
                    break;
                case 3: // eqn of degree 3 will be y = d_x_3 * x^3 + d_x_2 * x^2 + d_x_1 * x + d_x_0
                    functionCode = "param===0?param=0:param=param;var solution,a = (0),b=((1)), c=((-((constants['d_x_3'])*(raised=0,absBase=0,sign=0,num=param,pow=(3),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_2'])*(raised=0,absBase=0,sign=0,num=param,pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_1'])*param)+-(constants['d_x_0'])));solution = []; a !== 0 ? (solution[0] = (-b + Math.sqrt(b*b - 4*a*c))/(2*a),solution[1] = (-b - Math.sqrt(b*b - 4*a*c))/(2*a)) :(solution[0] = -c/b,solution[1] = solution[0]); return solution;";
                    break;
                case 4: // eqn of degree 4 will be y = d_x_4 * x^4 + d_x_3 * x^3 + d_x_2 * x^2 + d_x_1 * x + d_x_0
                    functionCode = "param===0?param=0:param=param;var solution,a = (0),b=((1)), c=((-((constants['d_x_4'])*(raised=0,absBase=0,sign=0,num=param,pow=(4),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_3'])*(raised=0,absBase=0,sign=0,num=param,pow=(3),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_2'])*(raised=0,absBase=0,sign=0,num=param,pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_1'])*param)+-(constants['d_x_0'])));solution = []; a !== 0 ? (solution[0] = (-b + Math.sqrt(b*b - 4*a*c))/(2*a),solution[1] = (-b - Math.sqrt(b*b - 4*a*c))/(2*a)) :(solution[0] = -c/b,solution[1] = solution[0]); return solution;";
                    break;
                case 5: // eqn of degree 5 will be y = d_x_5 * x^5 + d_x_4 * x^4 + d_x_3 * x^3 + d_x_2 * x^2 + d_x_1 * x + d_x_0
                    functionCode = "param===0?param=0:param=param;var solution,a = (0),b=((1)), c=((-((constants['d_x_5'])*(raised=0,absBase=0,sign=0,num=param,pow=(5),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_4'])*(raised=0,absBase=0,sign=0,num=param,pow=(4),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_3'])*(raised=0,absBase=0,sign=0,num=param,pow=(3),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_2'])*(raised=0,absBase=0,sign=0,num=param,pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_1'])*param)+-(constants['d_x_0'])));solution = []; a !== 0 ? (solution[0] = (-b + Math.sqrt(b*b - 4*a*c))/(2*a),solution[1] = (-b - Math.sqrt(b*b - 4*a*c))/(2*a)) :(solution[0] = -c/b,solution[1] = solution[0]); return solution;";
                    break;
                case 6: // eqn of degree 6 will be y = d_x_6 * x^6 + d_x_5 * x^5 + d_x_4 * x^4 + d_x_3 * x^3 + d_x_2 * x^2 + d_x_1 * x + d_x_0
                    functionCode = "param===0?param=0:param=param;var solution,a = (0),b=((1)), c=((-((constants['d_x_6'])*(raised=0,absBase=0,sign=0,num=param,pow=(6),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_5'])*(raised=0,absBase=0,sign=0,num=param,pow=(5),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_4'])*(raised=0,absBase=0,sign=0,num=param,pow=(4),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_3'])*(raised=0,absBase=0,sign=0,num=param,pow=(3),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_2'])*(raised=0,absBase=0,sign=0,num=param,pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_1'])*param)+-(constants['d_x_0'])));solution = []; a !== 0 ? (solution[0] = (-b + Math.sqrt(b*b - 4*a*c))/(2*a),solution[1] = (-b - Math.sqrt(b*b - 4*a*c))/(2*a)) :(solution[0] = -c/b,solution[1] = solution[0]); return solution;";
                    break;
                case 7: // eqn of degree 7 will be y = d_x_7 * x^7 + d_x_6 * x^6 + d_x_5 * x^5 + d_x_4 * x^4 + d_x_3 * x^3 + d_x_2 * x^2 + d_x_1 * x + d_x_0
                    functionCode = "param===0?param=0:param=param;var solution,a = (0),b=((1)), c=((-((constants['d_x_7'])*(raised=0,absBase=0,sign=0,num=param,pow=(7),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_6'])*(raised=0,absBase=0,sign=0,num=param,pow=(6),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_5'])*(raised=0,absBase=0,sign=0,num=param,pow=(5),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_4'])*(raised=0,absBase=0,sign=0,num=param,pow=(4),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_3'])*(raised=0,absBase=0,sign=0,num=param,pow=(3),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_2'])*(raised=0,absBase=0,sign=0,num=param,pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+-((constants['d_x_1'])*param)+-(constants['d_x_0'])));solution = []; a !== 0 ? (solution[0] = (-b + Math.sqrt(b*b - 4*a*c))/(2*a),solution[1] = (-b - Math.sqrt(b*b - 4*a*c))/(2*a)) :(solution[0] = -c/b,solution[1] = solution[0]); return solution;";
                    break;
            }
            funcCodeAndCoeffObj = {
                "constants": constants,
                "functionCode": functionCode
            };
            return funcCodeAndCoeffObj;
        },

        "_trimNumberForDisplay": function(givenNumber, getLatex) {
            var newNumber, exp, noToDisplay, numberExp,
                LOWER_PRECISION = -MathUtilities.Components.Utils.Models.MathHelper.SCI_NOTATION_POWER_GRAPHING_TOOL,
                PRECISION = this.get("precision"),
                HIGHER_PRECISION = MathUtilities.Components.Utils.Models.MathHelper.SCI_NOTATION_POWER_GRAPHING_TOOL;

            givenNumber = Number(givenNumber);
            numberExp = givenNumber.toExponential();
            newNumber = numberExp.split("e");
            exp = Number(newNumber[1]);
            newNumber = Number(newNumber[0]);
            if (exp <= LOWER_PRECISION || exp >= HIGHER_PRECISION) {
                noToDisplay = this._graphingToolView._callGetNumberForToolTip(newNumber, PRECISION);
                if (getLatex) {
                    noToDisplay += " \\cdot 10^{" + exp + "}";
                } else {
                    noToDisplay += " &middot; 10<sup>" + exp + "</sup> ";
                }
            } else {
                noToDisplay = this._graphingToolView._callGetNumberForToolTip(givenNumber, PRECISION);
            }
            return noToDisplay;
        },
        "_getSumOfWithPower": function(x, y, upto) {
            var noOfElements = x.length,
                elemCounter,
                elemSum = new Array(upto + 1),
                elemSumWithY = new Array(upto + 1),
                elemSumCounter;
            for (elemSumCounter = 1; elemSumCounter <= upto; elemSumCounter++) {
                elemSum[elemSumCounter] = 0;
                elemSumWithY[elemSumCounter] = 0;
            }
            for (elemCounter = 1; elemCounter <= noOfElements; elemCounter++) {
                for (elemSumCounter = 1; elemSumCounter <= upto; elemSumCounter++) {
                    elemSum[elemSumCounter] += Math.pow(x[elemCounter - 1], elemSumCounter);
                    elemSumWithY[elemSumCounter] += Math.pow(x[elemCounter - 1], elemSumCounter) * y[elemCounter - 1];
                }
            }
            return {
                "elemSum": elemSum,
                "elemSumWithY": elemSumWithY
            };
        },

        "_getBestFitExp": function(points, isIntermediateCall, alertProp, noAlert, focusElementId) {
            var noOfTerms,
                pointcounter,
                x,
                y,
                math = Math,
                sumofx = 0,
                sumofxraisedto2 = 0,
                sumofy = 0,
                sumofxy = 0,
                xraisedto2,
                slope,
                intercept, secondPoint,
                displayString, firstPoint,
                solutionObject = {},
                solution,
                orgSolution,
                a,
                r, MIN_POINTS = 2;
            if (alertProp) {
                if (alertProp.chartName === void 0) {
                    noAlert = true;
                }
                alertProp = this.get('ERROR_STRINGS').TABLE_ERRORS._BEST_FIT_CHART_EXP_STRING + alertProp.chartName;
            }
            if ((points === null || points === void 0 || points.length < MIN_POINTS) && !isIntermediateCall) {
                this.trigger('best-fit-line-alert', alertProp, focusElementId);
                return void 0;
            }
            if (!points || points.length < MIN_POINTS) {
                return void 0;
            }
            noOfTerms = points.length;
            firstPoint = points[0];
            secondPoint = points[1];
            if (firstPoint[0] === secondPoint[0] && firstPoint[1] === secondPoint[1]) {
                if (!noAlert) {
                    this.trigger("best-fit-curve-error-alert", alertProp);
                }
                return void 0;
            }
            for (pointcounter = 0; pointcounter < noOfTerms; pointcounter++) {
                x = Number(points[pointcounter][0]);
                y = Number(points[pointcounter][1]);
                xraisedto2 = math.pow(x, 2);
                sumofx += x;
                sumofy += math.log(y) / math.log(10);
                sumofxraisedto2 += xraisedto2;
                sumofxy += x * math.log(y) / math.log(10);
            }
            //slope of the line = (n*sxy - sx*sy)/(nsx2 - (sx)^2)
            slope = (noOfTerms * sumofxy - sumofx * sumofy) / (noOfTerms * sumofxraisedto2 - math.pow(sumofx, 2));
            intercept = (sumofy - slope * sumofx) / noOfTerms;
            a = math.pow(10, intercept);
            r = math.pow(10, slope);
            if (isNaN(a) || isNaN(r)) {
                if (!noAlert) {
                    this.trigger("best-fit-exp-alert", alertProp, focusElementId);
                }
                return void 0;
            }
            solutionObject.constants = {
                "d_x_1": a,
                "d_x_2": r
            };
            displayString = "y = " + this._trimNumberForDisplay(a) + " &middot; " + this._trimNumberForDisplay(r) + "<sup>x</sup>";
            solution = 'y=' + this._trimNumberForDisplay(a, true) + '\\cdot((' + this._trimNumberForDisplay(r, true) + ')^x)';
            a = this._generateLatexForNumber(a);
            r = this._generateLatexForNumber(r);
            orgSolution = 'y=' + a + '\\cdot(' + r + '^x)';
            solutionObject.degree = 'e';
            solutionObject.coef = [a, r];
            // replace "+ -" with "-"
            displayString = displayString.replace(/\s\+\s\-/g, " - ");
            solutionObject.solutionString = solution;
            solutionObject.displayString = displayString;
            solutionObject.orgSolution = orgSolution;
            solutionObject.functionCode = "param===0?param=0:param=param;var solution,a = (0),b=((1)), c=(-((constants['d_x_1'])*(raised=0,absBase=0,sign=0,num=(constants['d_x_2']),pow=param,num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))));solution = []; a !== 0 ? (solution[0] = (-b + Math.sqrt(b*b - 4*a*c))/(2*a),solution[1] = (-b - Math.sqrt(b*b - 4*a*c))/(2*a)) :(solution[0] = -c/b,solution[1] = solution[0]); return solution;";
            return solutionObject;
        },

        "_getBestFitPolynomial": function(data) {
            var points = data.points,
                isIntermediateCall = data.isIntermediateCall,
                alertProp = data.alertProp,
                focusElementId = data.focusElementId,
                bestFitData = {},
                degree = 1,
                bestFitObject = data.parentEquation.getBestFit(),
                lengthOfPoints = points.length,
                chiSquared,
                chiSquaredArray = [],
                min, curveObj,
                MIN_POINTS = 2,
                MIN_DEGREE = 2;

            if (alertProp) {
                alertProp = this.get('ERROR_STRINGS').TABLE_ERRORS._BEST_FIT_CHART_CURVE_STRING + alertProp.chartName;
            }
            if ((points === null || points === void 0 || points.length < MIN_POINTS) && !isIntermediateCall) {
                this.trigger('best-fit-line-alert', alertProp, focusElementId);
                return void 0;
            }
            if (!points || lengthOfPoints < MIN_POINTS) {
                return void 0;
            }

            //calculate chi square and set degree
            for (curveObj in bestFitObject.curve) {
                chiSquared = this.calculateChiSquare(bestFitObject.curve[curveObj].equationData, points);
                if (min === void 0) {
                    min = chiSquared;
                }
                min = Math.min(chiSquared, min);
                chiSquaredArray.push(chiSquared);
            }
            degree = chiSquaredArray.indexOf(min) + MIN_DEGREE;
            if (chiSquaredArray.indexOf(min) === -1) {
                degree = 2;
            }
            bestFitData = this._getBestFitCurve(points, degree, isIntermediateCall, alertProp);
            return bestFitData;
        },

        "calculateChiSquare": function(equationData, points) {
            var observedY,
                engine = new Function('param,constants,functions', equationData.getFunctionCode()),
                engineToBePassed = function eng1(param) {
                    return engine(param, equationData.getConstants(), equationData.getFunctions())[0];
                },
                lengthOfPoints = points.length,
                expectedY,
                term,
                sum = 0,
                counter = 0;

            //formula for chi square is summation of ((observed-expected)^2 / expected)
            for (; counter < lengthOfPoints; counter++) {
                expectedY = Number(points[counter][1]);
                observedY = engineToBePassed(Number(points[counter][0]));
                term = Math.pow(observedY - expectedY, 2) / expectedY;
                if (isNaN(term)) {
                    term = 0;
                }
                sum += term; // raised to power 2 to get chi square
            }

            return Math.abs(sum);
        },

        "sortArrayOfPoints": function(points) {
            var counter, swap, temp = [];
            points = points.slice();
            do {
                swap = false;
                for (counter = 0; counter < points.length - 1; counter++) {
                    if (points[counter][0] > points[counter + 1][0]) {
                        temp = points[counter];
                        points[counter] = points[counter + 1];
                        points[counter + 1] = temp;
                        swap = true;
                    }
                }
            } while (swap);
            return points;
        }
    }, {
        /**
        Specifies the default min value for slider

        @property SLIDER_MIN_VALUE
        @type {Number}
        @static
        @default -10
        **/
        "SLIDER_MIN_VALUE": -10,

        /**
        Specifies the default max value for slider

        @property SLIDER_MAX_VALUE
        @type {Number}
        @static
        @default 10
        **/
        "SLIDER_MAX_VALUE": 10,

        /**
        Specifies the default initial value for slider

        @property SLIDER_INITIAL_VALUE
        @type {Number}
        @static
        @default 1
        **/
        "SLIDER_INITIAL_VALUE": 1,

        /**
        Specifies the default step value for slider

        @property SLIDER_STEP_VALUE
        @type {Number}
        @static
        @default 0.10
        **/
        "SLIDER_STEP_VALUE": 0.10,

        "ENTER_KEY": 13,

        "BACKSPACE_KEY": 8,

        "DELETE_KEY": 46,

        "DOWN_ARROW_KEY": 40,

        "UP_ARROW_KEY": 38,

        "LEFT_ARROW_KEY": 37,

        "RIGHT_ARROW_KEY": 39,

        "TAB_KEY": 9,
        "bestFitMapForText": {
            "line": "Line",
            "curve2": "Quadratic",
            "curve3": "Cubic",
            "curve4": "Quartic",
            "curve5": "Quintic",
            "curve6": "Sextic",
            "curve7": "Septic",
            "polynomial": "Polynomial",
            "exp": "Exponential"
        },

        "DATA_ANALYSIS_ERRORS": {
            "INSUFFICIENT_POINTS": "Insufficient Points",
            "MULTIPLE_BESTFIT": "Select only one best fit option",
            "NO_BESTFIT": "Select a best fit option",
            "NO_MODE": 'No mode'
        }
    });
}(window.MathUtilities));
