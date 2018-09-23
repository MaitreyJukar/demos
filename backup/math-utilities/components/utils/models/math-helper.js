/* globals _, MathUtilities, $  */

(function() {
    "use strict";

    if (typeof MathUtilities.Components.Utils === "undefined") {
        MathUtilities.Components.Utils = {};
    }

    if (typeof MathUtilities.Components.Utils.Models === "undefined") {
        MathUtilities.Components.Utils.Models = {};
    }

    MathUtilities.Components.Utils.Models.MathHelper = Backbone.Model.extend({}, {

        /**
         *   Function trim and round of a number by the specified number of digits.
         *
         *@method trimAndRoundNumber
         *@param number {Number} number to be trimmed and to be rounded of
         *@param trimBy {Number} number of digits by which the number has to be trimmed
         *
         *@return {Number} trimmed and rounded number
         *@static
         *@public
         */
        "trimAndRoundNumber": function(number, trimBy) {
            var numberString,
                numberStringLength,
                trimmedString,
                roundOf,
                numberStringCounter,
                numberNineString,
                nineCheckString,
                nineCheckStringLength,
                decimalOccured,
                decimalIndex;
            if (trimBy > 0) {
                numberString = String(number);
                numberStringLength = numberString.length;
                trimmedString = numberString.substr(numberStringLength - trimBy, numberStringLength);
                trimmedString = trimmedString.replace(".", "");

                roundOf = numberString.charAt(numberStringLength - (trimBy + 1));
                if (roundOf === ".") {
                    roundOf = numberString.charAt(numberStringLength - (trimBy + 2));
                }
                if (roundOf === "9") {
                    numberNineString = "";
                    nineCheckString = numberString.substr(0, numberStringLength - trimBy);
                    nineCheckStringLength = nineCheckString.length;
                    for (numberStringCounter = nineCheckStringLength - 1; numberStringCounter >= 0; numberStringCounter--) {
                        if (nineCheckString.charAt(numberStringCounter) === "9") {
                            numberNineString = "9" + numberNineString;
                            continue;
                        }
                        if (nineCheckString.charAt(numberStringCounter) !== ".") {
                            numberNineString = nineCheckString.charAt(numberStringCounter) + numberNineString;
                            break;
                        }
                        decimalOccured = true;
                        decimalIndex = numberStringCounter;
                    }
                    roundOf = numberNineString;
                }
                roundOf += "." + trimmedString;
                roundOf = Math.round(Number(roundOf));
                if (decimalOccured) {
                    roundOf = String(roundOf).substring(0, decimalIndex) + "." + String(roundOf).substring(decimalIndex + 1, String(roundOf).length);
                    roundOf = Math.round(Number(roundOf));
                    numberString = numberString.substring(0, numberStringLength - (trimBy + String(roundOf).length + 1)) + roundOf;
                } else {
                    numberString = numberString.substring(0, numberStringLength - (trimBy + String(roundOf).length)) + roundOf;
                }
                number = Number(numberString);
            }
            return number;
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
        "calculateMinMax": function(values, operation) {
            var val;
            if (values.length === 0) {
                return NaN;
            }
            if (values.length === 1) {
                val = values.pop();
                if (typeof val === "number") {
                    return val;
                }
                return NaN;
            }
            val = values.pop();
            return operation(val, this.calculateMinMax(values, operation));
        },
        "_generateNumberFromLatex": function(num) {
            num = String(num);
            var indexOfCDot = num.indexOf("\cdot10^{"),
                numArr1, numArr2;

            if (indexOfCDot !== -1) {
                numArr1 = num.split("\\cdot10^{");
                numArr2 = numArr1[1].split("}");
                num = numArr1[0].trim() + "e" + numArr2[0];
            }
            return num;
        },
        "_generateLatexFromHtml": function(equation) {
            equation = equation.split("<sup>").join("^");
            equation = equation.split("</sup>").join("");
            equation = equation.split("&middot;").join("\\cdot");
            return equation;
        },
        "trimNumber": function(number, trimBy, conversionType) {
            var numberString = number.toString(),
                roundOfNum,
                answer,
                numberGiven = parseFloat(numberString);
            if (!conversionType) {
                conversionType = "round";
            }
            numberString = numberString.split('.');
            if (numberString[0].indexOf('-') !== -1) {
                trimBy--;
            }
            roundOfNum = numberString[1].length - trimBy;
            answer = Math[conversionType](numberGiven * Math.pow(10, roundOfNum));
            answer = answer / Math.pow(10, roundOfNum);

            return answer;
        },

        "_isNumberQualifiedForScientificNotations": function(num) {
            var MathHelper = MathUtilities.Components.Utils.Models.MathHelper,
                MIN_LIMIT_FACTOR = 9,
                limMax = Math.pow(10, MathHelper.SCI_NOTATION_MAX_POWER),
                limMin = MIN_LIMIT_FACTOR * Math.pow(10, MathHelper.SCI_NOTATION_MIN_POWER);
            return (Math.abs(num) >= limMax || Math.abs(num) <= limMin) && num !== 0;
        },

        "_convertToDisplayableForm": function(answer, precision) {
            var limMax, limMin, maxAnswerLength,
                nTrimDigits,
                power,
                MIN_LIMIT_FACTOR = 9,
                answerPower = 0,
                str,
                MathHelper = MathUtilities.Components.Utils.Models.MathHelper,
                getPower = function(ans) {
                    var exp, i, answerStr;
                    exp = ans.toExponential();
                    i = exp.indexOf("e");
                    answerStr = exp.substr(i + 1);
                    return Number(answerStr);
                };

            if (!isFinite(answer)) {
                return answer;
            }
            //MINIMUM is 0.0000001 that is 1e-7
            //MAXIMUM is 9999999999
            if (typeof precision === 'undefined') {
                limMax = Math.pow(10, MathHelper.SCI_NOTATION_MAX_POWER);
                limMin = MIN_LIMIT_FACTOR * Math.pow(10, MathHelper.SCI_NOTATION_MIN_POWER);
                maxAnswerLength = 11; //excluding \\cdot 10^power
            } else {
                limMax = Math.pow(10, precision);
                limMin = MIN_LIMIT_FACTOR * Math.pow(10, -1 * precision);
                maxAnswerLength = precision + 1; //excluding \\cdot 10^power
            }

            if (String(answer).indexOf("e") !== -1) {
                power = getPower(answer);
            }

            if (Math.abs(answer) >= limMax || Math.abs(answer) <= limMin && answer !== 0) {
                power = getPower(answer);
                answer /= Math.pow(10, power);
                if (String(answer).indexOf(".") > -1) {
                    maxAnswerLength++;
                }
                nTrimDigits = String(answer).length - maxAnswerLength;
                if (nTrimDigits > 0) {
                    answer = MathHelper.trimNumber(answer, nTrimDigits);
                }
                str = answer;
                while (str % 10 === 0) {
                    str /= Math.pow(10, 1);
                    answerPower++;
                }
                power += answerPower;
                if (power !== void 0 && power !== 0) {
                    str += ' \\cdot10^{' + power + '}';
                }
                return str + "";
            }
            if (String(answer).length > maxAnswerLength + 1) {
                nTrimDigits = String(answer).length - (maxAnswerLength + 1);
                if (nTrimDigits > 0) {
                    answer = MathHelper.trimNumber(answer, nTrimDigits);
                }
                str = String(answer);
                if (typeof power !== "undefined" && power !== 0) {
                    if (str.indexOf('e') !== -1) {
                        str = str.split('e')[0];
                    }
                    str += " \\cdot10^{" + power + "}";
                }
                return str;
            }
            str = String(answer);
            if (str.indexOf('e') !== -1) {
                power = getPower(answer);
                str = str.split('e')[0];
                str += ' \\cdot10^{' + power + '}';
            }
            return str;
        },

        "_convertDisplayToAppliedPrecisionForm": function(answer, precision, conversionType) {
            var limMax, limMin, maxAnswerLength,
                nTrimDigits,
                power,
                MIN_LIMIT_FACTOR = 1,
                str,
                positiveIntegerAnswer = Math.abs(parseInt(answer)),
                stringAnswer = positiveIntegerAnswer.toString(),
                stringLength = stringAnswer.length,
                MathHelper = MathUtilities.Components.Utils.Models.MathHelper,
                getPower = function(ans) {
                    var exp, i, answerStr;

                    exp = ans.toExponential();
                    i = exp.indexOf("e");
                    answerStr = exp.substr(i + 1);
                    return Number(answerStr);
                };

            if (!isFinite(answer)) {
                return answer;
            }

            //MINIMUM is 0.00001 that is 1e-5
            //MAXIMUM is 99999
            limMax = Math.pow(10, MathHelper.SCI_NOTATION_POWER_GRAPHING_TOOL);
            limMin = MIN_LIMIT_FACTOR * Math.pow(10, -1 * MathHelper.SCI_NOTATION_POWER_GRAPHING_TOOL);
            maxAnswerLength = precision + 1; //excluding \\cdot 10^power

            if (Math.abs(answer) >= limMax || Math.abs(answer) < limMin && answer !== 0) {
                power = getPower(answer);
                answer /= Math.pow(10, power);
                if (String(answer).indexOf(".") > -1) {
                    maxAnswerLength++;
                }
                nTrimDigits = String(answer).length - maxAnswerLength;
                if (nTrimDigits > 0) {
                    answer = MathHelper.trimNumber(answer, nTrimDigits, conversionType);
                }
                str = answer;
                if (power !== void 0 && power !== 0) {
                    str += " \\cdot10^{" + power + "}";
                }
                return str + "";
            }
            if (String(answer).length > maxAnswerLength + 1) {
                nTrimDigits = String(answer).length - (maxAnswerLength + 1) - (stringLength - 1);
                if (nTrimDigits > 0) {
                    answer = MathHelper.trimNumber(answer, nTrimDigits, conversionType);
                }
                str = String(answer);
                if (typeof power !== "undefined" && power !== 0) {
                    if (str.indexOf('e') !== -1) {
                        str = str.split('e')[0];
                    }
                    str += " \\cdot10^{" + power + "}";
                }
                return str;
            }
            str = String(answer);
            if (str.indexOf('e') !== -1) {
                power = getPower(answer);
                str = str.split('e')[0];
                str += " \\cdot10^{" + power + "}";
            }
            return str;
        },

        "isRectInRect": function(objRect1, objRect2) {
            return objRect2.x <= objRect1.x && objRect2.y <= objRect1.y && objRect2.x + objRect2.width >= objRect1.x + objRect1.width && objRect2.y + objRect2.height >= objRect1.y + objRect1.height;
        },

        "SCI_NOTATION_MAX_POWER": 10,
        "SCI_NOTATION_MIN_POWER": -7,
        "SCI_NOTATION_POWER_GRAPHING_TOOL": 5,
        "DEFAULT_PRECISION_VALUE_GRAPHING_TOOL": 2
    });

    /**
     * Static class containing functions to calculate statistical Data Analysis for Points
     *
     * @class MathUtilities.Components.Utils.Models.DataAnalysis
     **/
    MathUtilities.Components.Utils.Models.DataAnalysis = Backbone.Model.extend({}, {

        /**
            Function to calculate the data analysis for a set of values

            @public
            @static
            @method getStatisticalDataAnalysis
            @param arrayOfValues{Array} Array of set of points. If the array is 2 dimensional coeefecient of correlation will be calculated
                                        and mean and other calculations will be done for the second column
            @param isMultipleColumns{Boolean} Boolean to specify whether the array provided is multi dimensional (true) or not(false).

            @return {Object} returns object containing the data analysis values
            {
                "mean": mean,
                "median": median,
                "mode": mode,
                "standardDeviation": standardDeviation,
                "meanAbsoluteDeviation": meanAbsoluteDeviation,
                "fivePointSummary": fivePointSummary,
                "IQR": iQR,
                "numberOfDataPoints": numberOfDataPoints,
                "coefficientOfCorrelation": coefficientOfCorrelation,
                "coefficientOfCorrelation": coefficientOfCorrelation
            }
        **/
        "getStatisticalDataAnalysis": function(arrayOfValues, isMultipleColumns) {
            if (!arrayOfValues) {
                return null;
            }
            var column,
                DataAnalysis = MathUtilities.Components.Utils.Models.DataAnalysis,
                mean = null,
                median = null,
                mode = null,
                standardDeviation = null,
                populationStandardDeviation = null,
                meanAbsoluteDeviation = null,
                fivePointSummary = null,
                iQR = null,
                numberOfDataPoints = null,
                coefficientOfCorrelation = null,
                coefficientOfCorrelationSquared = null;

            if (isMultipleColumns === true) {
                coefficientOfCorrelation = DataAnalysis.getCoefficientOfCorrelation(arrayOfValues);
                coefficientOfCorrelationSquared = DataAnalysis.getCoefficientOfCorrelationSquared(arrayOfValues, coefficientOfCorrelation);
                column = arrayOfValues[1];
            } else {
                column = arrayOfValues;
            }
            mean = DataAnalysis.getMeanOfValues(column);
            median = DataAnalysis.getMedian(column);
            mode = DataAnalysis.getMode(column);
            standardDeviation = DataAnalysis.getStandardDeviation(column, mean);
            populationStandardDeviation = DataAnalysis.getPopulationStandardDeviation(column, mean);
            meanAbsoluteDeviation = DataAnalysis.getMeanAbsoluteDeviation(column, mean);
            fivePointSummary = DataAnalysis.getFivePointSummary(column, median);
            iQR = DataAnalysis.getIQR(column, fivePointSummary);
            numberOfDataPoints = DataAnalysis.getNumberOfDataPoints(column);

            return {
                "mean": mean,
                "median": median,
                "mode": mode,
                "standardDeviation": standardDeviation,
                "populationStandardDeviation": populationStandardDeviation,
                "meanAbsoluteDeviation": meanAbsoluteDeviation,
                "fivePointSummary": fivePointSummary,
                "IQR": iQR,
                "numberOfDataPoints": numberOfDataPoints,
                "coefficientOfCorrelation": coefficientOfCorrelation,
                "coefficientOfCorrelationSquared": coefficientOfCorrelationSquared
            };
        },

        /**
            Function to calculate the `mean` for a set of values

            @public
            @static
            @method getMeanOfValues
            @param arrayOfValues{Array} Array of set of points.
            @param calculatedSum{Number} `OPTIONAL` Sum of the set can be send so that it is not calculated again
            @return {null/Number} return null if mean cannot be calculated else the mean of the values
        **/

        "getMeanOfValues": function(arrayOfValues, calculatedSum) {
            if (!arrayOfValues) {
                return null;
            }
            var sum,
                valuesLength = arrayOfValues.length;
            if (typeof calculatedSum !== "undefined") {
                return calculatedSum / valuesLength;
            }

            sum = MathUtilities.Components.Utils.Models.DataAnalysis.getSumOfValues(arrayOfValues);
            return sum / valuesLength;
        },

        /**
            Function to calculate the `median` for a set of values
            @public
            @static
            @method getMedian
            @param arrayOfValues{Array} Array of set of points.
            @return {null/Number} return null if median cannot be calculated else the median of the values
        **/

        "getMedian": function(arrayOfValues) {
            if (!arrayOfValues) {
                return null;
            }
            var cloneArray = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(arrayOfValues),
                valuesLength = cloneArray.length,
                centerValue;
            cloneArray = cloneArray.map(Number);
            cloneArray.sort(function(a, b) {
                return a - b;
            });
            centerValue = valuesLength / 2;
            if (valuesLength % 2 === 0) {
                return (Number(cloneArray[centerValue]) + Number(cloneArray[centerValue - 1])) / 2;
            }
            return Number(cloneArray[Math.floor(centerValue)]);

        },

        /**
            Function to calculate the `mode` for a set of values
            @public
            @static
            @method getMode
            @param arrayOfValues{Array} Array of set of points.
            @return {null/Number} return null if mode cannot be calculated else the mode of the values
        **/

        "getMode": function(arrayOfValues) {
            if (!arrayOfValues) {
                return null;
            }
            var occurences = {},
                arrReturnValues = [],
                element,
                max = 0;

            _.each(arrayOfValues, function(el, i) {
                if (isNaN(el) === false) {
                    el = Number(el);
                    occurences[el] = occurences[el] + 1 || 1;
                    if (occurences[el] > max) {
                        max = occurences[el];
                    }
                }
            });
            if (max < 2) {
                return null;
            }
            for (element in occurences) {
                if (occurences[element] === max) {
                    arrReturnValues.push(element);
                }
            }
            if (arrReturnValues.length === 0 || Object.keys(occurences).length === arrReturnValues.length) {
                return null;
            }
            return arrReturnValues;
        },

        /**
            Function to calculate the `standard deviation` for a set of values
            @public
            @static
            @method getStandardDeviation
            @param arrayOfValues{Array} Array of set of points.
            @param meanOfValues{Number} `OPTIONAL` Mean of the set can be send so that it is not calculated again
            @return {null/Number} return null if standard deviation cannot be calculated else the standard deviation of the values
        **/
        "getStandardDeviation": function(arrayOfValues, meanOfValues) {
            if (!arrayOfValues) {
                return null;
            }
            var mean,
                sumOfDifferenceWithMean = 0,
                cloneArray = arrayOfValues.map(Number);
            if (typeof meanOfValues === "undefined") {
                mean = MathUtilities.Components.Utils.Models.DataAnalysis.getMeanOfValues(arrayOfValues);
            } else {
                mean = meanOfValues;
            }
            _.each(cloneArray, function(el, counter) {
                sumOfDifferenceWithMean += Math.pow(el - mean, 2);
            });
            sumOfDifferenceWithMean /= arrayOfValues.length - 1;
            return Math.sqrt(sumOfDifferenceWithMean);
        },
         /**
            Function to calculate the `population standard deviation` for a set of values
            @public
            @static
            @method getPopulationStandardDeviation
            @param arrayOfValues{Array} Array of set of points.
            @param meanOfValues{Number} `OPTIONAL` Mean of the set can be send so that it is not calculated again
            @return {null/Number} return null if standard deviation cannot be calculated else the standard deviation of the values
        **/
        "getPopulationStandardDeviation": function(arrayOfValues, meanOfValues) {
            if (!arrayOfValues) {
                return null;
            }
            var mean,
                sumOfDifferenceWithMean = 0,
                cloneArray = arrayOfValues.map(Number);

            if (meanOfValues === void 0) {
                mean = MathUtilities.Components.Utils.Models.DataAnalysis.getMeanOfValues(arrayOfValues);
            } else {
                mean = meanOfValues;
            }
            _.each(cloneArray, function(el, counter) {
                sumOfDifferenceWithMean += Math.pow(el - mean, 2);
            });
            sumOfDifferenceWithMean /= arrayOfValues.length;
            return Math.sqrt(sumOfDifferenceWithMean);
        },

        /**
            Function to calculate the `mean absolute deviation` for a set of values
            @public
            @static
            @method getMeanAbsoluteDeviation
            @param arrayOfValues{Array} Array of set of points.
            @param meanOfValues{Number} `OPTIONAL` Mean of the set can be send so that it is not calculated again.
            @return {null/Number} return null if mean absolute deviation cannot be calculated else the mean absolute deviation of the values
        **/
        "getMeanAbsoluteDeviation": function(arrayOfValues, meanOfValues) {
            if (!arrayOfValues) {
                return null;
            }
            var mean,
                sumOfDifferenceWithMean = 0,
                cloneArray = arrayOfValues.map(Number);

            if (typeof meanOfValues === "undefined") {
                mean = MathUtilities.Components.Utils.Models.DataAnalysis.getMeanOfValues(arrayOfValues);
            } else {
                mean = meanOfValues;
            }
            _.each(cloneArray, function(el, counter) {
                sumOfDifferenceWithMean += Math.abs(el - mean);
            });
            return sumOfDifferenceWithMean / arrayOfValues.length;
        },

        /**
            Function to calculate the `Five point summary` for a set of values
            @public
            @static
            @method getFivePointSummary
            @param arrayOfValues{Array} Array of set of points.
            @param medianOfValues{Number} `OPTIONAL` Median of the set can be send so that it is not calculated again
            @param outliersArray{Array} Array of outlier points.
            @return {null/Number} return null if mean Five point summary cannot be calculated else the Five point summary of the values
                                  in the form [minimum, First Quartile, Median, Third quartile, maximum]
        **/
        "getFivePointSummary": function(arrayOfValues, medianOfValues, outliersArray) {
            if (!arrayOfValues || arrayOfValues.length < 5) {
                return null;
            }
            var cloneArray = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(arrayOfValues),
                valuesLength = cloneArray.length,
                median,
                firstQuartileValues = [],
                thirdQuartileValues = [],
                firstQuartile,
                thirdQuartile,
                minimum,
                DataAnalysis = MathUtilities.Components.Utils.Models.DataAnalysis,
                splitIndex,
                fivePointSummary = [],
                maximum;
            cloneArray = cloneArray.map(Number);
            cloneArray.sort(function(a, b) {
                return a - b;
            });
            minimum = cloneArray[0];
            maximum = cloneArray[valuesLength - 1];

            if (medianOfValues === void 0 || medianOfValues === null) {
                median = DataAnalysis.getMedian(arrayOfValues);
            } else {
                median = medianOfValues;
            }
            splitIndex = valuesLength / 2;
            firstQuartileValues = cloneArray.slice(0, splitIndex);
            if (valuesLength % 2 === 0) {
                thirdQuartileValues = cloneArray.slice(splitIndex, valuesLength);
            } else {
                thirdQuartileValues = cloneArray.slice(splitIndex + 1, valuesLength);
            }
            firstQuartile = DataAnalysis.getMedian(firstQuartileValues);
            thirdQuartile = DataAnalysis.getMedian(thirdQuartileValues);
            fivePointSummary = [minimum, firstQuartile, median, thirdQuartile, maximum];
            if (outliersArray) {
                return this.getOutliersForBoxPlot(cloneArray, fivePointSummary);
            }
            return fivePointSummary;
        },

        "getOutliersForBoxPlot": function(arrayOfValues, fivePointSummary) {
            var setOutliers = [],
                arrayWithoutOutliers = [],
                actualMaxMin = [],
                q1 = fivePointSummary[1],
                q3 = fivePointSummary[3],
                iqr = q3 - q1,
                calculatedIqr = 1.5 * iqr,
                lowerLimit = q1 - calculatedIqr,
                upperLimit = calculatedIqr + q3,
                setSorted = null,
                value = null,
                MIN_INDEX = 0,
                MAX_INDEX = 4,
                indexOfArrayOfValues = 0,
                indexOfOutlier = 0,
                indexOfArrayExceptOutlier = 0;

            for (; indexOfArrayOfValues < arrayOfValues.length; indexOfArrayOfValues++) {
                value = arrayOfValues[indexOfArrayOfValues];
                if (value < lowerLimit || value > upperLimit) {
                    setOutliers[indexOfOutlier++] = value;
                } else {
                    arrayWithoutOutliers[indexOfArrayExceptOutlier++] = value;
                }
            }
            actualMaxMin.push(fivePointSummary[MIN_INDEX], fivePointSummary[MAX_INDEX]);
            fivePointSummary[MAX_INDEX] = arrayWithoutOutliers[arrayWithoutOutliers.length - 1];
            fivePointSummary[MIN_INDEX] = arrayWithoutOutliers[0];
            return {
                "fivePointSummary": fivePointSummary,
                "outlier": setOutliers,
                "actualMaxMin": actualMaxMin
            };
        },

        /**
            Function to calculate the `IQR` for a set of values.
            @public
            @static
            @method getIQR
            @param arrayOfValues{Array} Array of set of points.
            @param fivePointSummary{Number} `OPTIONAL` Five Point Summary of the set can be send so that it is not calculated again
            @return {null/Number} return null if mean IQR cannot be calculated else the IQR of the values
        **/

        "getIQR": function(arrayOfValues, fivePointSummary) {
            if (!(arrayOfValues && fivePointSummary)) {
                return null;
            }
            if (fivePointSummary === void 0) {
                fivePointSummary = MathUtilities.Components.Utils.Models.DataAnalysis.getFivePointSummary(arrayOfValues);
            }
            return fivePointSummary[3] - fivePointSummary[1];
        },

        /**
            Returns the number of data points provided
            @public
            @static
            @method getNumberOfDataPoints
            @param arrayOfValues{Array} Array of set of points.
            @return {Number} The count for the data points
        **/
        "getNumberOfDataPoints": function(arrayOfValues) {
            if (!arrayOfValues) {
                return 0;
            }
            return arrayOfValues.length;
        },

        "getCoefficientOfCorrelation": function(arrayOfValues) {
            if (!arrayOfValues || arrayOfValues.length !== 3) {
                return null;
            }
            var xValues = arrayOfValues[0],
                yValues = arrayOfValues[2],
                n = xValues.length,
                r,
                DataAnalysis = MathUtilities.Components.Utils.Models.DataAnalysis,
                sumOfX = DataAnalysis.getSumOfValues(xValues),
                sumOfY = DataAnalysis.getSumOfValues(yValues),
                sumOfXSquared = DataAnalysis.getSquaredSumOfValues(xValues),
                sumOfYSquared = DataAnalysis.getSquaredSumOfValues(yValues),
                sumOfProductOfXY = DataAnalysis.getSumOfProductOfXY(xValues, yValues);

            r = n * sumOfProductOfXY - sumOfX * sumOfY;
            r /= Math.sqrt(n * sumOfXSquared - Math.pow(sumOfX, 2)) * Math.sqrt(n * sumOfYSquared - Math.pow(sumOfY, 2));

            return r;
        },

        "getCoefficientOfCorrelationSquared": function(arrayOfValues, coefficientOfCorrelation) {
            if (!arrayOfValues) {
                return null;
            }
            if (typeof coefficientOfCorrelation === "undefined") {
                coefficientOfCorrelation = MathUtilities.Components.Utils.Models.DataAnalysis.getCoefficientOfCorrelation(arrayOfValues);
            }
            if (coefficientOfCorrelation !== null) {
                return Math.pow(coefficientOfCorrelation, 2);
            }
            return null;
        },

        "getSumOfProductOfXY": function(xValues, yValues) {
            var returnSum = 0,
                counter,
                currentXValue,
                currentYValue,
                xValuesLength = xValues.length,
                yValuesLength = yValues.length,
                valuesLength = xValuesLength >= yValuesLength ? xValuesLength : yValuesLength;

            for (counter = 0; counter < valuesLength; counter++) {
                currentXValue = xValues[counter];
                currentYValue = yValues[counter];
                if (currentXValue && currentYValue) {
                    returnSum += Number(currentXValue) * Number(currentYValue);
                }
            }
            return returnSum;
        },

        "getSquaredSumOfValues": function(arrayOfValues) {
            if (!arrayOfValues) {
                return 0;
            }
            var sum = 0,
                counter,
                currentValue,
                valuesLength = arrayOfValues.length;

            for (counter = 0; counter < valuesLength; counter++) {
                currentValue = arrayOfValues[counter];
                if (isNaN(currentValue) === false) {
                    sum += Math.pow(Number(currentValue), 2);
                }
            }
            return sum;
        },

        "getSumOfValues": function(arrayOfValues) {
            if (!arrayOfValues) {
                return 0;
            }
            var sum = 0,
                counter,
                currentValue,
                valuesLength = arrayOfValues.length;

            for (counter = 0; counter < valuesLength; counter++) {
                currentValue = arrayOfValues[counter];
                if (isNaN(currentValue) === false) {
                    sum += Number(currentValue);
                }
            }
            return sum;
        }
    });

}());
