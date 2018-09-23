/* globals window, geomFunctions, MathUtilities */

(function(MathUtilities) {
    'use strict';
    /* Initialize MathUtilities Data */
    MathUtilities.Components.EquationEngine = MathUtilities.Components.EquationEngine || {};
    /**
     * Packages all the models used in the MathEditor module.
     * @module Models
     * @namespace MathUtilites.Components.MathEditor
     **/
    MathUtilities.Components.EquationEngine.Models = MathUtilities.Components.EquationEngine.Models || {};
    MathUtilities.Components.EquationEngine.Models.MathFunctions = Backbone.Model.extend({}, {

        /*
        Function to check whether a number is decimal or not.
        @returns true if not a decimal number else false
        */
        "checkIfNotADecimalNumber": function(number) {
            return typeof number === 'number' && number % 1 === 0;
        },

        "checkIfWholeNumber": function(number) {
            return typeof number === 'number' && number > 0 && number % 1 === 0;
        },

        /*
        Function to perform mathematical operations.
        @param operationName : Name of the operator in string . eg '+'
        @param values: Array of values on which the operation is to be performed.The values inside the array must be in Number format
        @param unit: Unit of the angle either degree or radian
        @return : the calculated value or null if the values are not in correct format or there is problem performing the action.
        imp: For division the values array must have only two values values[0]/values[1] and same for power function values[0] raised to values[1]
        */
        "performMathematicalCalculations": function(operationName, values, units) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                result = NaN,
                valuesLength,
                valuesCounter = 0,
                bUnit = null,
                prodCounter,
                product,
                angleRadians,
                currentValue,
                sumCounter,
                isMinus,
                sum,
                sign,
                DEGREES = 180,
                PI = Math.PI,
                range,
                raisedToValue,
                firstAbsoluteValue,
                eToThePower,
                HALF = 0.5;
            if (typeof operationName === 'undefined' || typeof values === 'undefined') {
                return null;
            }
            valuesLength = values.length;
            if (typeof units !== 'undefined' && units.angle === 'rad') {
                bUnit = 1;
            } else {
                //if unit is degree or undefined
                bUnit = 0;
            }

            switch (operationName) {
                case '+':
                    result = 0;
                    for (valuesCounter; valuesCounter < valuesLength; valuesCounter++) {
                        currentValue = values[valuesCounter];
                        if (typeof currentValue !== 'number') {
                            result = NaN;
                            break;
                        }
                        result += currentValue;
                    }
                    break;
                case '-':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = values[0];
                    for (valuesCounter = 1; valuesCounter < valuesLength; valuesCounter++) {
                        currentValue = values[valuesCounter];
                        if (typeof currentValue !== 'number') {
                            result = NaN;
                            break;
                        }
                        result -= currentValue;
                    }
                    break;
                case '^':
                case 'pow': //case for 0^0 = undefined
                    if (typeof values[0] !== 'number' || typeof values[1] !== 'number' || values[0] === 0 && values[1] === 0) {
                        break;
                    }
                    if (!EquationEngine.MathFunctions.checkIfNotADecimalNumber(values[1])) {
                        raisedToValue = 1 / values[1];
                        sign = values[0] >= 0 ? 1 : -1;

                        if (raisedToValue % 2 === 0 && sign === -1) {
                            break;
                        }
                        result = Math.pow(values[0], values[1]);
                        if (result !== Math.pow(Math.abs(values[0]), 1 / values[1])) {
                            result = EquationEngine.MathFunctions.approximateNumber(result);
                        }
                        break;
                    }
                    result = Math.pow(values[0], values[1]);
                    break;
                case '*':
                case '\\cdot':
                    result = 1;
                    for (valuesCounter; valuesCounter < valuesLength; valuesCounter++) {
                        currentValue = values[valuesCounter];
                        if (typeof currentValue !== 'number') {
                            result = NaN;
                            break;
                        }
                        result *= currentValue;
                    }
                    break;
                case '/':
                case '\\frac':
                    if (typeof values[0] !== 'number' || typeof values[1] !== 'number') {
                        break;
                    } else if (values[1] === 0) {
                        result = NaN;
                    } else {
                        result = values[0] / values[1];
                    }
                    break;
                case '\\sqrt':
                    if (typeof values[0] !== 'number' || typeof values[1] !== 'number' || values[0] === 0 || values[0] % 2 === 0 && values[1] < 0) {
                        break;
                    }

                    if (values[0] < 0) {
                        result = 1 / Math.pow(Math.abs(values[1]), 1 / (values[0] * -1));
                    } else {
                        firstAbsoluteValue = Math.abs(values[1]);
                        result = Math.pow(firstAbsoluteValue, 1 / values[0]);
                        if (result !== Math.pow(firstAbsoluteValue, values[0])) {
                            result = EquationEngine.MathFunctions.approximateNumber(result);
                        }
                    }
                    if (values[1] < 0) {
                        result = -result;
                    }
                    break;

                case '\\ln':
                    if (typeof values[0] !== 'number') {
                        break;
                    } else if (values[0] <= 0) {
                        result = void 0;
                    } else {
                        result = Math.log(values[0]);
                    }
                    break;
                case '\\log':
                    if (typeof values[0] !== 'number') {
                        break;
                    } else if (values[0] <= 0) {
                        result = void 0;
                    } else {
                        result = Math.log(values[0]) / Math.LN10;
                    }
                    break;
                case '\\log_':
                    if (typeof values[0] !== 'number' || typeof values[1] !== 'number') {
                        break;
                    } else if (values[1] <= 0) {
                        result = void 0;
                    } else {
                        result = Math.log(values[1]) / Math.log(values[0]);
                    }
                    break;
                case '\\sin':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    if (bUnit === 0) {
                        angleRadians = values[0] * PI / DEGREES;
                        result = Math.sin(angleRadians);
                        break;
                    }
                    result = Math.sin(values[0]);
                    break;
                case '\\cos':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (bUnit === 0) {
                        angleRadians = values[0] * PI / DEGREES;
                        result = Math.cos(angleRadians);
                        break;
                    }
                    result = Math.cos(values[0]);
                    break;
                case '\\tan':
                    if (bUnit === 0) {
                        angleRadians = values[0] * PI / DEGREES;
                    } else {
                        angleRadians = values[0];
                    }
                    if (typeof values[0] !== 'number') {
                        break;
                    } else if (Math.abs(((Math.abs(angleRadians) / (PI / 2)) % 2) - 1) < 10e-7) { //10e-7 is the threshold
                        result = void 0;
                    } else {
                        result = EquationEngine.MathFunctions.performMathematicalCalculations('\\sin', values, units) / EquationEngine.MathFunctions.performMathematicalCalculations('\\cos', values, units);
                    }

                    break;
                case '\\sec':
                    if (bUnit === 0) {
                        angleRadians = values[0] * PI / DEGREES;
                    } else {
                        angleRadians = values[0];
                    }
                    if (typeof values[0] !== 'number') {
                        break;
                    } else if (Math.abs(((Math.abs(angleRadians) / (PI / 2)) % 2) - 1) < 10e-7) { //10e-7 is the threshold
                        result = void 0;
                    } else {
                        result = 1 / EquationEngine.MathFunctions.performMathematicalCalculations('\\cos', values, units);
                    }
                    break;
                case '\\csc':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    angleRadians = bUnit === 0 ? values[0] * PI / DEGREES : values[0];
                    if (Math.abs(angleRadians % PI) < 10e-7) { //10e-7 is the threshold
                        result = void 0;
                    } else {
                        result = 1 / EquationEngine.MathFunctions.performMathematicalCalculations('\\sin', values, units);
                    }
                    break;
                case '\\cot':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    angleRadians = bUnit === 0 ? values[0] * PI / DEGREES : values[0];
                    if (Math.abs(angleRadians % PI) < 10e-7) { //10e-7 is the threshold
                        result = void 0;
                    } else {
                        result = 1 / EquationEngine.MathFunctions.performMathematicalCalculations('\\tan', values, units);
                    }
                    break;
                case '\\arcsin':
                    if (typeof values[0] !== 'number') {
                        break;
                    } else if (Math.abs(values[0]) > 1) {
                        result = void 0;
                    } else {
                        result = Math.asin(values[0]);
                        if (bUnit === 0) {
                            result *= DEGREES / PI;
                        }
                    }

                    break;
                case '\\arccos':
                    if (typeof values[0] !== 'number') {
                        break;
                    } else if (Math.abs(values[0]) > 1) {
                        result = void 0;
                    } else {
                        result = Math.acos(values[0]);
                        if (bUnit === 0) {
                            result *= DEGREES / PI;
                        }
                    }
                    break;
                case '\\arctan':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = Math.atan(values[0]);
                    if (bUnit === 0) {
                        result *= DEGREES / PI;
                    }
                    break;
                case '\\arccsc':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = Math.asin(1 / values[0]);
                    if (bUnit === 0) {
                        result *= DEGREES / PI;
                    }
                    break;
                case '\\arcsec':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = Math.acos(1 / values[0]);
                    if (bUnit === 0) {
                        result *= DEGREES / PI;
                    }
                    break;
                case '\\arccot':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = PI / 2 - Math.atan(values[0]);
                    if (bUnit === 0) {
                        result *= DEGREES / PI;
                    }
                    break;
                case '\\sinh':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (bUnit === 0) {
                        angleRadians = values[0] * PI / DEGREES;
                        result = (Math.pow(Math.E, angleRadians) - Math.pow(Math.E, -angleRadians)) / 2;
                        break;
                    }
                    result = (Math.pow(Math.E, values[0]) - Math.pow(Math.E, -values[0])) / 2;
                    break;
                case '\\cosh':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (bUnit === 0) {
                        angleRadians = values[0] * PI / DEGREES;
                        result = (Math.pow(Math.E, angleRadians) + Math.pow(Math.E, -angleRadians)) / 2;
                        break;
                    }
                    result = (Math.pow(Math.E, values[0]) + Math.pow(Math.E, -values[0])) / 2;
                    break;
                case '\\tanh':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (bUnit === 0) {
                        angleRadians = values[0] * PI / DEGREES;
                        eToThePower = Math.pow(Math.E, 2 * angleRadians);
                        result = (eToThePower - 1) / (eToThePower + 1);
                        break;
                    }
                    eToThePower = Math.pow(Math.E, 2 * values[0]);
                    result = (eToThePower - 1) / (eToThePower + 1);
                    break;
                case '\\csch':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (bUnit === 0) {
                        angleRadians = values[0] * PI / DEGREES;
                        result = 2 / (Math.pow(Math.E, angleRadians) - Math.pow(Math.E, -angleRadians));
                        break;
                    }
                    result = 2 / (Math.pow(Math.E, values[0]) - Math.pow(Math.E, -values[0]));
                    break;
                case '\\sech':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (bUnit === 0) {
                        angleRadians = values[0] * PI / DEGREES;
                        result = 2 / (Math.pow(Math.E, angleRadians) + Math.pow(Math.E, -angleRadians));
                        break;
                    }
                    result = 2 / (Math.pow(Math.E, values[0]) + Math.pow(Math.E, -values[0]));
                    break;
                case '\\coth':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (bUnit === 0) {
                        angleRadians = values[0] * PI / DEGREES;
                        eToThePower = Math.pow(Math.E, 2 * angleRadians);
                        result = (eToThePower + 1) / (eToThePower - 1);
                        break;
                    }
                    eToThePower = Math.pow(Math.E, 2 * values[0]);
                    result = (eToThePower + 1) / (eToThePower - 1);
                    break;

                case '\\arsinh':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = EquationEngine.MathFunctions.performMathematicalCalculations('\\sqrt', [2, EquationEngine.MathFunctions.performMathematicalCalculations('^', [values[0], 2], units) + 1], units);
                    result = EquationEngine.MathFunctions.performMathematicalCalculations('\\ln', [values[0] + result], units);
                    //convert degrees into radians
                    if (bUnit === 0) {
                        result *= DEGREES / PI;
                    }
                    break;
                case '\\arcosh':
                    if (typeof values[0] !== 'number') {
                        break;
                    }

                    result = EquationEngine.MathFunctions.performMathematicalCalculations('\\sqrt', [2, EquationEngine.MathFunctions.performMathematicalCalculations('^', [values[0], 2], units) - 1], units);
                    result = EquationEngine.MathFunctions.performMathematicalCalculations('\\ln', [values[0] + result], units);

                    //convert degrees into radians
                    if (bUnit === 0) {
                        result *= DEGREES / PI;
                    }
                    break;
                case '\\artanh':
                    if (typeof values[0] !== 'number') {
                        break;
                    }

                    result = EquationEngine.MathFunctions.performMathematicalCalculations('\\frac', [1 + values[0], 1 - values[0]], units);
                    result = HALF * EquationEngine.MathFunctions.performMathematicalCalculations('\\ln', [result], units);
                    //convert degrees into radians
                    if (bUnit === 0) {
                        result *= DEGREES / PI;
                    }
                    break;
                case '\\arcsch':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = 1 / values[0] + EquationEngine.MathFunctions.performMathematicalCalculations('\\sqrt', [2, 1 / EquationEngine.MathFunctions.performMathematicalCalculations('^', [values[0], 2], units) + 1], units);
                    result = EquationEngine.MathFunctions.performMathematicalCalculations('\\ln', [result], units);
                    //convert degrees into radians
                    if (bUnit === 0) {
                        result *= DEGREES / PI;
                    }
                    break;
                case '\\arsech':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = 1 / values[0] + EquationEngine.MathFunctions.performMathematicalCalculations('\\sqrt', [2, 1 / EquationEngine.MathFunctions.performMathematicalCalculations('^', [values[0], 2], units) - 1], units);
                    result = EquationEngine.MathFunctions.performMathematicalCalculations('\\ln', [result], units);
                    //convert degrees into radians
                    if (bUnit === 0) {
                        result *= DEGREES / PI;
                    }
                    break;
                case '\\arcoth':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = EquationEngine.MathFunctions.performMathematicalCalculations('\\frac', [values[0] + 1, values[0] - 1], units);
                    result = HALF * EquationEngine.MathFunctions.performMathematicalCalculations('\\ln', [result], units);
                    //convert degrees into radians
                    if (bUnit === 0) {
                        result *= DEGREES / PI;
                    }
                    break;
                case '!':
                    if (typeof values[0] !== 'number' || values[0] < 0) {
                        break;
                    }
                    // factorial of values greater are too high and towards infinity
                    if (values[0] > 170 || !isFinite(values[0])) {
                        result = Infinity;
                        break;
                    }
                    if (values[0] === 0) {
                        result = 1;
                        break;
                    }
                    if (EquationEngine.MathFunctions.checkIfNotADecimalNumber(values[0]) && values[0] > 0) {
                        result = EquationEngine.MathFunctions.findFactorial(values[0]);
                    } else {
                        result = values[0] * EquationEngine.MathFunctions._gammaFunction(values[0]);
                    }


                    break;
                case '\\%':
                    if (values.length === 1) {
                        if (typeof values[0] === 'number') {
                            result = values[0] / 100;
                        } else {
                            result = NaN;
                            break;
                        }
                    } else {
                        if (typeof values[0] === 'number' && typeof values[1] === 'number') {
                            result = values[1] * (values[0] / 100);
                        } else {
                            result = NaN;
                            break;
                        }
                    }
                    break;
                case '\\gcd':

                    if (typeof values[0] !== 'number' || typeof values[1] !== 'number') {
                        break;
                    }
                    //making the negative value positive and decimals into integers.
                    values[0] = Math.floor(Math.abs(values[0]));
                    values[1] = Math.floor(Math.abs(values[1]));
                    if (values[0] === 0) {
                        result = values[1];
                        if (values[1] === 0) {
                            result = 0;
                        }
                        break;
                    }
                    if (values[1] === 0) {
                        result = values[0];
                        break;
                    }

                    //calculating gcd
                    result = EquationEngine.MathFunctions._calculateGcd(values[0], values[1]);

                    break;
                case '\\lcm':
                    if (typeof values[0] !== 'number' || typeof values[1] !== 'number') {
                        break;
                    }
                    //making the negative value positive and decimals into integers.
                    values[0] = Math.floor(Math.abs(values[0]));
                    values[1] = Math.floor(Math.abs(values[1]));
                    if (values[0] === 0) {
                        if (values[1] === 0) {
                            result = NaN;
                            break;
                        }
                        result = 0;
                        break;
                    }
                    if (values[1] === 0) {
                        result = 0;
                        break;
                    }

                    //calculating lcm
                    result = values[0] * values[1] / EquationEngine.MathFunctions._calculateGcd(values[0], values[1]);

                    break;
                case '\\ceil':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = Math.ceil(values[0]);
                    break;
                case '\\mixedfrac':
                    if (typeof values[0] !== 'number' || typeof values[1] !== 'number' || typeof values[2] !== 'number') {
                        break;
                    }
                    isMinus = 1;
                    if (values[0] < 0) {
                        isMinus = -1;
                        values[0] = Math.abs(values[0]);
                    }
                    result = (values[0] * values[2] + values[1]) * isMinus / values[2];
                    break;
                case '\\trunc':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    if (values[0] > 0) {
                        result = Math.floor(values[0]);
                    } else {
                        result = Math.ceil(values[0]);
                    }
                    break;
                case '\\floor':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = Math.floor(values[0]);
                    break;
                case '\\sgn':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = values[0] === 0 ? 0 : values[0] > 0 ? 1 : -1;
                    break;
                case '\\round':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = Math.round(values[0]);
                    break;
                case '\\abs':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = Math.abs(values[0]);
                    break;
                case '\\min':
                    if (typeof values[0] !== 'number' || typeof values[1] !== 'number') {
                        break;
                    }
                    result = Math.min(values[0], values[1]);
                    break;
                case '\\max':
                    if (typeof values[0] !== 'number' || typeof values[1] !== 'number') {
                        break;
                    }
                    result = Math.max(values[0], values[1]);
                    break;
                case '\\mod':
                    result = NaN;
                    if (typeof values[0] !== 'number' || typeof values[1] !== 'number' || values[1] === 0) {
                        break;
                    }
                    if (values[0] % values[1] === 0) {
                        result = 0;
                        break;
                    }
                    //Both numbers are positive or both the numbers are negative
                    if (values[0] > 0 && values[1] > 0 || values[0] < 0 && values[1] < 0) {
                        result = values[0] % values[1];
                        break;
                    }
                    //One of the two values is negative
                    if (values[0] < 0 && values[1] > 0 || values[0] > 0 && values[1] < 0) {
                        result = values[1] + values[0] % values[1];
                        break;
                    }
                    break;
                case '\\nCr':
                case '\\ncr':
                    if (!(typeof values[0] === 'number' && typeof values[1] === 'number' && isFinite(values[0]) && isFinite(values[1]))) {
                        break;
                    }
                    if (values[0] < 0 || values[1] < 0) {
                        result = 0;
                        break;
                    }
                    values[0] = Math.floor(Math.abs(values[0]));
                    values[1] = Math.floor(Math.abs(values[1]));
                    if (values[0] < values[1]) {
                        result = 0;
                        break;
                    }
                    result = EquationEngine.MathFunctions.findFactorial(values[0]) /
                        (EquationEngine.MathFunctions.findFactorial(values[1]) *
                            EquationEngine.MathFunctions.findFactorial(values[0] - values[1]));
                    break;
                case '\\nPr':
                case '\\npr':
                    if (!(typeof values[0] === 'number' && typeof values[1] === 'number' && isFinite(values[0]) && isFinite(values[1]))) {
                        break;
                    }
                    if (values[0] < 0 || values[1] < 0) {
                        result = 0;
                        break;
                    }
                    values[0] = Math.floor(Math.abs(values[0]));
                    values[1] = Math.floor(Math.abs(values[1]));
                    if (values[0] < values[1]) {
                        result = 0;
                        break;
                    }
                    result = EquationEngine.MathFunctions.findFactorial(values[0]) / EquationEngine.MathFunctions.findFactorial(values[0] - values[1]);
                    break;
                case '\\prod_':
                    if (typeof values[1] !== 'number' || typeof values[2] !== 'number') {
                        break;
                    }
                    if (values[1] > values[2]) {
                        result = 1;
                        break;
                    }
                    if (values[3] === 0) {
                        result = 0;
                        break;
                    }
                    prodCounter = Math.round(values[2]) - Math.round(values[1]) + 1;
                    product = 1;

                    if (typeof values[3] === 'number') {
                        for (range = Math.round(values[1]); range <= Math.round(values[2]); range++) {
                            product = product * values[3];
                        }
                    } else {
                        for (range = Math.round(values[1]); range <= Math.round(values[2]); range++) {

                            product = product * values[3];
                        }
                    }
                    while (prodCounter !== 0) {
                        product = product * values[3];
                        prodCounter--;
                    }
                    result = product;
                    break;
                case '\\sum_':
                    if (typeof values[1] !== 'number' || typeof values[2] !== 'number') {
                        break;
                    }
                    if (values[1] > values[2] || values[3] === 0) {
                        result = 0;
                        break;
                    }
                    sumCounter = Math.round(values[1]) - Math.round(values[0]) + 1;
                    sum = 0;
                    while (sumCounter !== 0) {
                        sum = sum + values[2];
                        sumCounter--;
                    }
                    result = sum;
                    break;
                case '\\exp':
                    if (typeof values[0] !== 'number') {
                        break;
                    }
                    result = Math.exp(values[0]);
                    break;
                default:
                    break;
            }
            result = EquationEngine.MathFunctions._processResultForTrignometricFunctions(operationName, result);
            return result;
        },

        "getGUID": function() {
            var s4 = function() {
                // 16 is the length of the GUID
                return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
            };
            return (s4() + s4() + "-" + s4() + "-4" + s4().substr(0, 3) + "-" + s4() + "-" + s4() + s4() + s4()).toLowerCase();
        },

        "findFactorialString": "function findFactorial(number) {            var factorial = 1,                input_value;    if (number === 0 || number === 1) {        return factorial;    }    input_value = number;    while (input_value !== 1) {        factorial = factorial * input_value;        input_value--;    }    return factorial;};",

        "findFactorial": function(number) {
            var factorial = 1,
                inputValue;
            if (number === 0 || number === 1) {
                return factorial;
            }
            inputValue = number;
            while (inputValue !== 1) {
                factorial *= inputValue;
                inputValue--;
            }
            return factorial;
        },

        "_calculateGcd": function(num1, num2) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models;
            return num2 ? EquationEngine.MathFunctions._calculateGcd(num2, num1 % num2) : num1;
        },


        "whileInOneLine": function(init, condition, code, rtn) {
            code = init + 'while(' + condition + '){' + code + '} return ' + rtn;
            var func = new Function('', code);
            return func();
        },

        "_gammaFunctionString": "function gammaFunction(value) { var gammaCounter,gammaSum,gamma,arbitaryCounter = 7,gammaArray = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905,-0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];    if (value < 0.5) {        return Math.PI / (Math.sin(Math.PI * value) * gammaFunction(1 - value));    }    else {        value -= 1;        gamma = gammaArray[0];        for (gammaCounter = 1; gammaCounter < arbitaryCounter + 2; gammaCounter++) {            gamma += gammaArray[gammaCounter] / (value + gammaCounter);        }        gammaSum = value + arbitaryCounter + 0.5;        return Math.sqrt(2 * Math.PI) * Math.pow(gammaSum, (value + 0.5)) * Math.exp(-gammaSum) * gamma;    }};",


        //Function to find gamma of value using Lanczos approximation
        "_gammaFunction": function(value) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                gammaCounter,
                gammaSum,
                gamma,
                HALF = 0.5,
                arbitaryCounter = 7,
                // gamma numbers.
                gammaArray = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
            if (value < HALF) {
                return Math.PI / (Math.sin(Math.PI * value) * EquationEngine.MathFunctions._gammaFunction(1 - value));
            } else {
                value -= 1;

                gamma = gammaArray[0];
                for (gammaCounter = 1; gammaCounter < arbitaryCounter + 2; gammaCounter++) {
                    gamma += gammaArray[gammaCounter] / (value + gammaCounter);
                }
                gammaSum = value + arbitaryCounter + HALF;

                return Math.sqrt(2 * Math.PI) * Math.pow(gammaSum, value + HALF) * Math.exp(-gammaSum) * gamma;
            }
        },
        // self here is the reference of the worker process instance
        "getSumString": function() {
            return "self.sum = function sum(pivot, start, end, expression, param, constants, functions) {var findFactorialString = \'" +
                MathUtilities.Components.EquationEngine.Models.MathFunctions.findFactorialString +
                "\';var gammaFunctionString=\'" +
                MathUtilities.Components.EquationEngine.Models.MathFunctions._gammaFunctionString +
                "\'; function addStringFunctionDependency(functionCode) {            if (functionCode.search('findFactorial') > -1) {                functionCode = findFactorialString + functionCode;            }    if (functionCode.search('gammaFunction') > -1) {        functionCode = gammaFunctionString + functionCode;    }  return functionCode;}; start = addStringFunctionDependency(start) + '; return ' +start;            end = addStringFunctionDependency(end) + '; return ' + end;    expression = addStringFunctionDependency(expression) + '; return ' + expression;    var funcStartRange = new Function('param,constants,functions', start);            var funcEndRange = new Function('param,constants,functions', end);            var funcExpression = new Function(pivot+',param,constants,functions', expression);            var startValue = funcStartRange(param, constants, functions);            var endValue = funcEndRange(param, constants, functions);           var result = 0;    if (!isFinite(startValue) || !isFinite(endValue)) {            return;        }        for(i = startValue;i<=endValue;i+= 1){                result +=funcExpression(i,param, constants, functions);                if (!isFinite(result)) {                    return;                }            }         return result;        };";
        },

        "getProdString": function() {
            return "self.prod = function prod(pivot, start, end, expression, param, constants, functions) {var findFactorialString = \'" +
                MathUtilities.Components.EquationEngine.Models.MathFunctions.findFactorialString +
                "\';var gammaFunctionString=\'" +
                MathUtilities.Components.EquationEngine.Models.MathFunctions._gammaFunctionString +
                "\'; function addStringFunctionDependency(functionCode) {            if (functionCode.search('findFactorial') > -1) {                functionCode = findFactorialString + functionCode;            }    if (functionCode.search('gammaFunction') > -1) {        functionCode = gammaFunctionString + functionCode;    }  return functionCode;}; start = addStringFunctionDependency(start) + '; return ' +start;            end = addStringFunctionDependency(end) + '; return ' + end;    expression = addStringFunctionDependency(expression) + '; return ' + expression;  var funcStartRange = new Function('param,constants,functions', start);            var funcEndRange = new Function('param,constants,functions', end);            var funcExpression = new Function(pivot+',param,constants,functions', expression);            var startValue = funcStartRange(param, constants, functions);            var endValue = funcEndRange(param, constants, functions);           var result = 1;   if (!isFinite(startValue) || !isFinite(endValue)) {            return;        }         for(i = startValue;i<=endValue;i+= 1){                result *=funcExpression(i,param, constants, functions);                if (!isFinite(result)) {                    return;                }            }         return result;        };";
        },

        "addStringFunctionDependency": function(functionCode) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models;
            if (functionCode.search('findFactorial') > -1) {
                functionCode = EquationEngine.MathFunctions.findFactorialString + functionCode;

            }
            if (functionCode.search('gammaFunction') > -1) {
                functionCode = EquationEngine.MathFunctions._gammaFunctionString + functionCode;

            }
            return functionCode;
        },


        "sumProductPrototype": function(pivot, start, end, expression, param, constants) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                findFactorialString = '" + MathUtilities.Components.EquationEngine.Models.MathFunctions.findFactorialString + "',
                funcStartRange, funcEndRange, funcExpression, startValue, endValue, result, i,
                gammaFunctionString = '" + MathUtilities.Components.EquationEngine.Models.MathFunctions._gammaFunctionString + "';

            function addStringFunctionDependency(functionCode) {
                if (functionCode.search('findFactorial') > -1) {
                    functionCode = findFactorialString + functionCode;
                }
                if (functionCode.search('gammaFunction') > -1) {
                    functionCode = gammaFunctionString + functionCode;
                }
                return functionCode;
            }

            start = EquationEngine.MathFunctions.addStringFunctionDependency(start) + "return " + start;
            end = EquationEngine.MathFunctions.addStringFunctionDependency(end) + "return " + end;
            expression = EquationEngine.MathFunctions.addStringFunctionDependency(expression) + "return " + expression;


            geomFunctions.traceConsole('param :' + param + ' constants ' + constants);
            geomFunctions.traceConsole('start code ' + start);
            geomFunctions.traceConsole('end code ' + end);
            geomFunctions.traceConsole('expr code ' + expression);

            funcStartRange = new Function('param,constants', start);
            funcEndRange = new Function('param,constants', end);
            funcExpression = new Function(pivot + ',param,constants', expression);
            startValue = funcStartRange(param, constants);
            endValue = funcEndRange(param, constants);
            result = 0;
            geomFunctions.traceConsole('startvalue = ' + startValue + ' endvalue=' + endValue);
            if (!(isFinite(startValue) && isFinite(endValue))) {
                return void 0;
            }
            for (i = startValue; i < endValue; i += 1) {
                result += funcExpression(i, param, constants);
                if (!isFinite(result)) {
                    return void 0;
                }
            }

            return result;
        },

        "decToFrac": function(x, precision) {
            var arr, intPart, decPart, result;

            function recursive(x, call) {
                if (typeof call === 'undefined') {
                    call = 0;

                }
                geomFunctions.traceConsole('>>' + x);
                arr = (x + "").split('.');
                geomFunctions.traceConsole('arr >> ' + arr);
                intPart = parseInt(arr[0], 10);
                decPart = parseFloat("0." + arr[1]);


                geomFunctions.traceConsole(intPart + "<>" + decPart);

                if (intPart > 10e4) {
                    geomFunctions.traceConsole('result too small ' + intPart);
                    return {
                        "n": 1,
                        "d": 0
                    };
                }
                if (call > 100) {
                    return {
                        "n": 1,
                        "d": 0
                    };
                }

                result = recursive(1 / decPart, call + 1);

                geomFunctions.traceConsole('>> ' + intPart + "+ 1/(" + result.d + "/" + result.n + ")");
                return {
                    "n": intPart * result.n + result.d,
                    "d": result.n
                };

            }

        },

        "approximateNumber": function(number) {
            if (MathUtilities.Components.EquationEngine.Models.MathFunctions.checkIfRecurring(number)) {
                return Number(number.toPrecision(15)); // A precision of 15 numbers.
            }
            return number;
        },

        "checkIfRecurring": function(number) {
            if (isNaN(number)) {
                return false;
            }
            var numberString = number.toString(),
                decimalPart,
                counter,
                decimalPartLength,
                occurenceCounter = -1,
                recurringString;
            if (numberString.indexOf('.') === -1) {
                return false;
            }
            decimalPart = numberString.split('.')[1];
            decimalPartLength = decimalPart.length;
            recurringString = decimalPart.charAt(decimalPartLength - 2);
            for (counter = decimalPartLength - 2; counter >= 0; counter--) {
                if (decimalPart.charAt(counter) === recurringString) {
                    occurenceCounter++;
                } else {
                    break;
                }
            }
            return occurenceCounter > 3;
        },

        "_processResultForTrignometricFunctions": function(functionName, result) {
            var TRIGNOMETRIC_FUNCTIONS = ['\\sin', '\\cos', '\\tan', '\\cot', '\\sec', '\\csc', '\\sinh', '\\cosh', '\\tanh', '\\coth', '\\sech', '\\csch'],
                limit = 10;
            if (!(TRIGNOMETRIC_FUNCTIONS.indexOf(functionName) === -1 || isNaN(result))) {
                result = Number(result.toFixed(limit));
            }
            return result;
        }

    });
}(window.MathUtilities));
