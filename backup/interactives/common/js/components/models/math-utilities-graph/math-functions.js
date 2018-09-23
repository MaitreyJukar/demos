(function (MathInteractives) {
    'use strict';    

    MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine.MathFunctions = Backbone.Model.extend({}, {

        /*
        Function to check whether a number is decimal or not.
        @returns true if not a decimal number else false
        */
        checkIfNotADecimalNumber: function checkIfNotADecimalNumber(number) {
            //console.log(number);
            //console.log((typeof number === 'number' && number % 1 === 0));
            return (typeof number === 'number' && number % 1 === 0);
        },
        //        /*
        //        Function to replace the regex pattern by the string replacement in the latexString and return the newLatexString.
        //        */
        //        replaceRegexByReplacement: function replaceRegexByReplacement(regex, latexString, replacement) {
        //            regex = /\\sqrt[\s]?\{/g;
        //            replacement = '\\sqrt[2]{';
        //            var newLatexString = latexString.replace(regex, replacement);
        //            return newLatexString;
        //        },

        /*
        Function to perform mathematical operations.
        @param operationName : Name of the operator in string . eg '+'
        @param values: Array of values on which the operation is to be performed.The values inside the array must be in Number format
        @param unit: Unit of the angle either degree or radian
        @return : the calculated value or null if the values are not in correct format or there is problem performing the action.
        
        imp: For division the values array must have only two values values[0]/values[1] and same for power function values[0] raised to values[1]
        */
        performMathematicalCalculations: function performMathematicalCalculations(operationName, values, units) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine,
                result,
                valuesLength,
                valuesCounter,
                b_unit,
                prodCounter,
                product,
                angle_radians,
                currentValue,
                sumCounter,
                sum,
                absoluteValueOfBase,
                sign,
                raisedToValue;
            if (operationName === undefined || values === undefined) {
                return null;
            }
            result = NaN;
            valuesLength = values.length;
            valuesCounter = 0;
            b_unit = null;
            if (units !== undefined && units.angle === 'rad') {
                b_unit = 1;
            }
            else {
                //if unit is degree or undefined
                b_unit = 0;
            }

            switch (operationName) {
                case '+':
                    result = 0;
                    for (valuesCounter; valuesCounter < valuesLength; valuesCounter++) {
                        currentValue = values[valuesCounter];
                        if (typeof (currentValue) !== 'number') {
                            result = NaN;
                            break;
                        }
                        result += currentValue;
                    }
                    break;
                case '-':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = values[0];
                    for (valuesCounter = 1; valuesCounter < valuesLength; valuesCounter++) {
                        currentValue = values[valuesCounter];
                        if (typeof (currentValue) !== 'number') {
                            result = NaN;
                            break;
                        }
                        result -= currentValue;
                    }
                    break;
                case '^':
                case 'pow':
                    if (typeof (values[0]) !== 'number' || typeof (values[1]) !== 'number') {
                        break;
                    }
                    //case for 0^0 = undefined
                    if (values[0] === 0 && values[1] === 0) {
                        break;
                    }

                    if (!nameSpace.MathFunctions.checkIfNotADecimalNumber(values[1])) {
                        raisedToValue = 1 / values[1];
                        absoluteValueOfBase = Math.abs(values[0]),
                        sign = (values[0] >= 0) ? 1 : -1;

                        if (raisedToValue % 2 === 0 && sign === -1) {
                            break;
                        }
                        result = sign * Math.pow(absoluteValueOfBase, values[1]);
                        break;
                    }
                    result = Math.pow(values[0], values[1]);
                    break;
                case '*':
                case '\\cdot':
                    result = 1;
                    for (valuesCounter; valuesCounter < valuesLength; valuesCounter++) {
                        currentValue = values[valuesCounter];
                        if (typeof (currentValue) !== 'number') {
                            result = NaN;
                            break;
                        }
                        result *= currentValue;
                    }
                    break;
                case '/':
                case '\\frac':
                    if (typeof (values[0]) !== 'number' || typeof (values[1]) !== 'number') {
                        break;
                    }
                    result = values[0] / values[1];
                    break;
                case '\\sqrt':
                    if (typeof (values[0]) !== 'number' || typeof (values[1]) !== 'number') {
                        break;
                    }
                    if (values[0] === 0 || (values[0] % 2 === 0 && values[1] < 0)) {
                        break;
                    }
                    else if (values[0] === 0) {
                        result = 0;
                        break;
                    }
                    //else if (values[0] % 2 === 0 && values[1] > 0) {

                    //}
                    if (values[0] < 0) {
                        result = 1 / Math.pow(Math.abs(values[1]), (1 / (values[0] * -1)));
                    }
                    else {
                        result = Math.pow(Math.abs(values[1]), (1 / values[0]));
                    }
                    if (values[1] < 0) {
                        result = -result;
                    }
                    break;

                case '\\ln':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = Math.log(values[0]);
                    break;
                case '\\log':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = Math.log(values[0]) / Math.LN10;
                    break;
                case '\\log_':
                    if (typeof (values[0]) !== 'number' || typeof (values[1]) !== 'number') {
                        break;
                    }
                    result = Math.log(values[1]) / Math.log(values[0]);
                    break;
                case '\\sin':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    if (b_unit === 0) {
                        angle_radians = values[0] * Math.PI / 180;
                        result = Math.sin(angle_radians);
                        break;
                    }
                    result = Math.sin(values[0]);
                    break;
                case '\\cos':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (b_unit === 0) {
                        angle_radians = values[0] * Math.PI / 180;
                        result = Math.cos(angle_radians);
                        break;
                    }
                    result = Math.cos(values[0]);
                    break;
                case '\\tan':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = nameSpace.MathFunctions.performMathematicalCalculations('\\sin', values, units) / nameSpace.MathFunctions.performMathematicalCalculations('\\cos', values, units);
                    //if (b_unit === 0) {
                    //    angle_radians = values[0] * Math.PI / 180;
                    //    result = Math.tan(angle_radians);
                    //    break;
                    //}
                    //result = Math.tan(values[0]);
                    break;
                case '\\sec':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    ////convert degrees into radians
                    //if (b_unit === 0) {
                    //    angle_radians = values[0] * Math.PI / 180;
                    //    result = 1 / Math.cos(angle_radians);
                    //    break;
                    //}
                    result = 1 / nameSpace.MathFunctions.performMathematicalCalculations('\\cos', values, units);
                    break;
                case '\\csc':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    //if (b_unit === 0) {
                    //    angle_radians = values[0] * Math.PI / 180;
                    //    result = 1 / Math.sin(angle_radians);
                    //    break;
                    //}
                    result = 1 / nameSpace.MathFunctions.performMathematicalCalculations('\\sin', values, units);
                    break;
                case '\\cot':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    //if (b_unit === 0) {
                    //    angle_radians = values[0] * Math.PI / 180;
                    //    result = 1 / Math.tan(angle_radians);
                    //    break;
                    //}
                    result = 1 / nameSpace.MathFunctions.performMathematicalCalculations('\\tan', values, units);
                    break;
                case '\\arcsin':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = Math.asin(values[0]);
                    if (b_unit === 0) {
                        result = result * 180 / Math.PI;
                    }
                    break;
                case '\\arccos':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = Math.acos(values[0]);
                    if (b_unit === 0) {
                        result = result * 180 / Math.PI;
                    }
                    break;
                case '\\arctan':
                    if (typeof (values[0]) !== 'number') {
                        break;

                    }
                    result = Math.atan(values[0]);
                    if (b_unit === 0) {
                        result = result * 180 / Math.PI;
                    }
                    break;
                case '\\arccsc':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = Math.asin(1 / values[0]);
                    //result = Math.PI/2 - Math.asin( values[0]);
                    if (b_unit === 0) {
                        result = result * 180 / Math.PI;
                    }
                    break;
                case '\\arcsec':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = Math.acos(1 / values[0]);
                    if (b_unit === 0) {
                        result = result * 180 / Math.PI;
                    }
                    break;
                case '\\arccot':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = Math.PI/2 - Math.atan(values[0]);
                    if (b_unit === 0) {
                        result = result * 180 / Math.PI;
                    }
                    break;
                case '\\sinh':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (b_unit === 0) {
                        angle_radians = values[0] * Math.PI / 180;
                        result = (Math.pow(Math.E, angle_radians) - Math.pow(Math.E, -angle_radians)) / 2;
                        break;
                    }
                    result = (Math.pow(Math.E, values[0]) - Math.pow(Math.E, -values[0])) / 2;
                    break;
                case '\\cosh':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (b_unit === 0) {
                        angle_radians = values[0] * Math.PI / 180;
                        result = (Math.pow(Math.E, angle_radians) + Math.pow(Math.E, -angle_radians)) / 2;
                        break;
                    }
                    result = (Math.pow(Math.E, values[0]) + Math.pow(Math.E, -values[0])) / 2;
                    break;
                case '\\tanh':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (b_unit === 0) {
                        angle_radians = values[0] * Math.PI / 180;
                        result = (Math.pow(Math.E, 2 * angle_radians) - 1) / (Math.pow(Math.E, 2 * angle_radians) + 1);
                        break;
                    }
                    result = (Math.pow(Math.E, 2 * values[0]) - 1) / (Math.pow(Math.E, 2 * values[0]) + 1);
                    break;
                case '\\csch':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (b_unit === 0) {
                        angle_radians = values[0] * Math.PI / 180;
                        result = 2 / (Math.pow(Math.E, angle_radians) - Math.pow(Math.E, -angle_radians));
                        break;
                    }
                    result = 2 / (Math.pow(Math.E, values[0]) - Math.pow(Math.E, -values[0]));
                    break;
                case '\\sech':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (b_unit === 0) {
                        angle_radians = values[0] * Math.PI / 180;
                        result = 2 / (Math.pow(Math.E, angle_radians) + Math.pow(Math.E, -angle_radians));
                        break;
                    }
                    result = 2 / (Math.pow(Math.E, values[0]) + Math.pow(Math.E, -values[0]));
                    break;
                case '\\coth':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    //convert degrees into radians
                    if (b_unit === 0) {
                        angle_radians = values[0] * Math.PI / 180;
                        result = (Math.pow(Math.E, 2 * angle_radians) + 1) / (Math.pow(Math.E, 2 * angle_radians) - 1);
                        break;
                    }
                    result = (Math.pow(Math.E, 2 * values[0]) + 1) / (Math.pow(Math.E, 2 * values[0]) - 1);
                    break;

                case '\\arsinh': 
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = nameSpace.MathFunctions.performMathematicalCalculations('\\sqrt', [2,nameSpace.MathFunctions.performMathematicalCalculations('^', [values[0],2], units) + 1], units);
                    result = nameSpace.MathFunctions.performMathematicalCalculations('\\ln', [values[0] + result], units);
                    //convert degrees into radians
                    if (b_unit === 0) {
                        result = result * 180 / Math.PI;
                    }
                    break;
                case '\\arcosh':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }

                    result = nameSpace.MathFunctions.performMathematicalCalculations('\\sqrt', [2, nameSpace.MathFunctions.performMathematicalCalculations('^', [values[0], 2], units) - 1], units);
                    result = nameSpace.MathFunctions.performMathematicalCalculations('\\ln', [values[0] + result], units);

                    //convert degrees into radians
                    if (b_unit === 0) {
                        result = result * 180 / Math.PI;
                    }
                    break;
                case '\\artanh':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }

                    result = nameSpace.MathFunctions.performMathematicalCalculations('\\frac', [1 + values[0], 1 - values[0]],units);
                    result = 0.5 * nameSpace.MathFunctions.performMathematicalCalculations('\\ln', [result], units);
                    //convert degrees into radians
                    if (b_unit === 0) {
                        result = result * 180 / Math.PI;
                    }
                    break;
                case '\\arcsch':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = (1 / values[0]) + nameSpace.MathFunctions.performMathematicalCalculations('\\sqrt', [2, (1 / nameSpace.MathFunctions.performMathematicalCalculations('^', [values[0], 2], units))+1], units);
                    result = nameSpace.MathFunctions.performMathematicalCalculations('\\ln', [result], units);
                    //convert degrees into radians
                    if (b_unit === 0) {
                        result = result * 180 / Math.PI;
                    }
                    break;
                case '\\arsech':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = (1 / values[0]) + nameSpace.MathFunctions.performMathematicalCalculations('\\sqrt', [2, (1 / nameSpace.MathFunctions.performMathematicalCalculations('^', [values[0], 2], units)) - 1], units);
                    result = nameSpace.MathFunctions.performMathematicalCalculations('\\ln', [result], units);
                    //convert degrees into radians
                    if (b_unit === 0) {
                        result = result * 180 / Math.PI;
                    }
                    break;
                case '\\arcoth':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = nameSpace.MathFunctions.performMathematicalCalculations('\\frac', [values[0] + 1, values[0] - 1], units);
                    result = 0.5 * nameSpace.MathFunctions.performMathematicalCalculations('\\ln', [result], units);
                    //convert degrees into radians
                    if (b_unit === 0) {
                        result = result * 180 / Math.PI;
                    }
                    break;
                case '!':
                    if (typeof (values[0]) !== 'number' || values[0]<0) {
                        break;
                    }
                    if (values[0] > 170 || !isFinite(values[0])) {
                        result = Infinity;
                        break;
                    }
                    if (values[0] === 0) {
                        result = 1;
                        break;
                    }
                    if (nameSpace.MathFunctions.checkIfNotADecimalNumber(values[0]) && values[0] > 0) {
                        result = nameSpace.MathFunctions.findFactorial(values[0]);
                    }
                    else {
                        result = (values[0]) * nameSpace.MathFunctions._gammaFunction(values[0]);
                    }
                    
                    // result = 1;
                    // if (values[0] === 0 || values[0] === 1) {
                    //    break;
                    // }
                    //                var input_value = values[0];
                    //                while (input_value != 1) {
                    //                    result = result * input_value;
                    //                    input_value--;
                    //                }
                    break;
                case '\\%':
                    if (values.length === 1) {
                        if (typeof (values[0]) === 'number') {
                            result = values[0] / 100;
                        }
                        else {
                            result = NaN;
                            break;
                        }
                    }
                    else {
                        if (typeof (values[0]) === 'number' && typeof (values[1]) === 'number') {
                            result = values[1] * (values[0] / 100);
                        }
                        else {
                            result = NaN;
                            break;
                        }
                    }
                    break;
                case '\\gcd':

                    if (typeof (values[0]) !== 'number' || typeof (values[1]) !== 'number') {
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
                    result = nameSpace.MathFunctions._calculateGcd(values[0], values[1]);
                    //while (values[0] !== values[1]) {
                    //    if (values[0] < values[1]) {
                    //        values[1] = values[1] - values[0];
                    //    }
                    //    else {
                    //        values[0] = values[0] - values[1]
                    //    }
                    //}
                    //result = values[0];
                    break;
                case '\\lcm':
                    if (typeof (values[0]) !== 'number' || typeof (values[1]) !== 'number') {
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
                    //                    if (values[0] === 0 || values[1] === 0) {
                    //                        result = 0;
                    //                        break;
                    //                    }

                    //calculating lcm
                    result = (values[0] * values[1]) / nameSpace.MathFunctions._calculateGcd(values[0], values[1]);
                    //var number1 = values[0],
                    //    number2 = values[1];
                    //while (number1 !== number2) {
                    //    if (number1 < number2) {
                    //        number2 = number2 - number1;
                    //    }
                    //    else {
                    //        number1 = number1 - number2;
                    //    }
                    //}
                    //result = (values[0] * values[1]) / number1;
                    break;
                case '\\ceil':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = Math.ceil(values[0]);
                    break;
                case '\\floor':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = Math.floor(values[0]);
                    break;
                case '\\round':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = Math.round(values[0]);
                    break;
                case '\\abs':
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = Math.abs(values[0]);
                    break;
                case '\\min':
                    if (typeof (values[0]) !== 'number' || typeof (values[1]) !== 'number') {
                        break;
                    }
                    result = Math.min(values[0], values[1]);
                    break;
                case '\\max':
                    if (typeof (values[0]) !== 'number' || typeof (values[1]) !== 'number') {
                        break;
                    }
                    result = Math.max(values[0], values[1]);
                    break;
                case '\\mod':
                    result = NaN;
                    if (typeof (values[0]) !== 'number' || typeof (values[1]) !== 'number' || values[1] === 0) {
                        break;
                    }
                    if (values[0] % values[1] === 0) {
                        result = 0;
                        break;
                    }
                    //Both numbers are positive or both the numbers are negative
                    if ((values[0] > 0 && values[1] > 0) || (values[0] < 0 && values[1] < 0)) {
                        result = values[0] % values[1];
                        break;
                    }
                    //One of the two values is negative
                    if ((values[0] < 0 && values[1] > 0) || (values[0] > 0 && values[1] < 0)) {
                        result = values[1] + (values[0] % values[1]);
                        break;
                    }
                    break;
                case '\\nCr':
                    if (typeof (values[0]) !== 'number' || typeof (values[1]) !== 'number') {
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
                    result = nameSpace.MathFunctions.findFactorial(values[0]) / (nameSpace.MathFunctions.findFactorial(values[1]) * nameSpace.MathFunctions.findFactorial(values[0] - values[1]));
                    break;
                case '\\nPr':
                    if (typeof (values[0]) !== 'number' || typeof (values[1]) !== 'number') {
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
                    result = nameSpace.MathFunctions.findFactorial(values[0]) / nameSpace.MathFunctions.findFactorial(values[0] - values[1]);
                    break;
                case '\\prod_':
                    if (typeof (values[1]) !== 'number' || typeof (values[2]) !== 'number') {
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

                    if (typeof (values[3]) === 'number') {
                        for (var range = Math.round(values[1]); range <= Math.round(values[2]); range++) {
                            product = product * values[3];
                        }
                    }
                    else {
                        for (var range = Math.round(values[1]); range <= Math.round(values[2]); range++) {

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
                    if (typeof (values[1]) !== 'number' || typeof (values[2]) !== 'number') {
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
                    if (typeof (values[0]) !== 'number') {
                        break;
                    }
                    result = Math.exp(values[0]);
                    break;
                default:
                    console.error('The operation ' + operationName + ' is not yet supported by the function');
                    break;
            }
            result = nameSpace.MathFunctions._processResultForTrignometricFunctions(operationName, result);
            return result;
        },

        getGUID: function getGUID() {
            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
            return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
        },

        findFactorialString:"function findFactorial(number) {            var factorial = 1,                input_value;    if (number === 0 || number === 1) {        return factorial;    }    input_value = number;    while (input_value !== 1) {        factorial = factorial * input_value;        input_value--;    }    return factorial;};",

        findFactorial: function findFactorial(number) {
            var factorial = 1,
                input_value;
            if (number === 0 || number === 1) {
                return factorial;
            }
            input_value = number;
            while (input_value !== 1) {
                factorial = factorial * input_value;
                input_value--;
            }
            return factorial;
        },

        _calculateGcd: function _calculateGcd(num1, num2) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine;
            return num2 ? nameSpace.MathFunctions._calculateGcd(num2, num1 % num2) : num1;
        },


        whileInOneLine: function whileInOneLine(init, condition, code, rtn) {
            var code = init + 'while(' + condition + '){' + code + '} return ' + rtn;
            var func = new Function('', code);
            return func();
        },

        _gammaFunctionString:"function gammaFunction(value) { var gammaCounter,gammaSum,gamma,arbitaryCounter = 7,gammaArray = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905,-0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];    if (value < 0.5) {        return Math.PI / (Math.sin(Math.PI * value) * gammaFunction(1 - value));    }    else {        value -= 1;        gamma = gammaArray[0];        for (gammaCounter = 1; gammaCounter < arbitaryCounter + 2; gammaCounter++) {            gamma += gammaArray[gammaCounter] / (value + gammaCounter);        }        gammaSum = value + arbitaryCounter + 0.5;        return Math.sqrt(2 * Math.PI) * Math.pow(gammaSum, (value + 0.5)) * Math.exp(-gammaSum) * gamma;    }};",


        //Function to find gamma of value using Lanczos approximation
        _gammaFunction: function _gammaFunction(value) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine,
                gammaCounter,
                gammaSum,
                gamma,  
                arbitaryCounter = 7,
                gammaArray = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905,
                     -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
            if (value < 0.5) {
                return Math.PI / (Math.sin(Math.PI * value) * nameSpace.MathFunctions._gammaFunction(1 - value));
            }
            else {
                value -= 1;

                gamma = gammaArray[0];
                for (gammaCounter = 1; gammaCounter < arbitaryCounter + 2; gammaCounter++) {
                    gamma += gammaArray[gammaCounter] / (value + gammaCounter);
                }
                gammaSum = value + arbitaryCounter + 0.5;

                return Math.sqrt(2 * Math.PI) * Math.pow(gammaSum, (value + 0.5)) * Math.exp(-gammaSum) * gamma;
            }
        },

        getSumString: function getSumString() {
            return "function sum(pivot, start, end, expression, param, constants) {var findFactorialString = \'" + MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine.MathFunctions.findFactorialString + "\';var gammaFunctionString=\'" + MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine.MathFunctions._gammaFunctionString + "\'; function addStringFunctionDependency(functionCode) {            if (functionCode.search('findFactorial') > -1) {                functionCode = findFactorialString + functionCode;            }    if (functionCode.search('gammaFunction') > -1) {        functionCode = gammaFunctionString + functionCode;    }  return functionCode;}; start = addStringFunctionDependency(start) + '; return ' +start;            end = addStringFunctionDependency(end) + '; return ' + end;    expression = addStringFunctionDependency(expression) + '; return ' + expression;    var funcStartRange = new Function('param,constants', start);            var funcEndRange = new Function('param,constants', end);            var funcExpression = new Function(pivot+',param,constants', expression);            var startValue = funcStartRange(param, constants);            var endValue = funcEndRange(param, constants);           var result = 0;    if (!isFinite(startValue) || !isFinite(endValue)) {            return;        }        for(i = startValue;i<=endValue;i+= 1){                result +=funcExpression(i,param, constants);                if (!isFinite(result)) {                    return;                }            }         return result;        };";
        },

        getProdString: function getProdString() {
            return "function prod(pivot, start, end, expression, param, constants) {var findFactorialString = \'" + MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine.MathFunctions.findFactorialString + "\';var gammaFunctionString=\'" + MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine.MathFunctions._gammaFunctionString + "\'; function addStringFunctionDependency(functionCode) {            if (functionCode.search('findFactorial') > -1) {                functionCode = findFactorialString + functionCode;            }    if (functionCode.search('gammaFunction') > -1) {        functionCode = gammaFunctionString + functionCode;    }  return functionCode;}; start = addStringFunctionDependency(start) + '; return ' +start;            end = addStringFunctionDependency(end) + '; return ' + end;    expression = addStringFunctionDependency(expression) + '; return ' + expression;  var funcStartRange = new Function('param,constants', start);            var funcEndRange = new Function('param,constants', end);            var funcExpression = new Function(pivot+',param,constants', expression);            var startValue = funcStartRange(param, constants);            var endValue = funcEndRange(param, constants);           var result = 1;   if (!isFinite(startValue) || !isFinite(endValue)) {            return;        }         for(i = startValue;i<=endValue;i+= 1){                result *=funcExpression(i,param, constants);                if (!isFinite(result)) {                    return;                }            }         return result;        };";
        },



        addStringFunctionDependency: function addStringFunctionDependency(functionCode) {
            if (functionCode.search('findFactorial') > -1) {
                functionCode = nameSpace.MathFunctions.findFactorialString + functionCode;

            }
            if (functionCode.search('gammaFunction') > -1) {
                functionCode = nameSpace.MathFunctions._gammaFunctionString + functionCode;

            }
            return functionCode;
        },
            
        
        sumProductPrototype: function sum(pivot, start, end, expression, param, constants) {
            var findFactorialString = '" + MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine.MathFunctions.findFactorialString + "';
            var gammaFunctionString='" + MathInteractives.Common.Components.Models.MathUtilitiesGraph.EquationEngine.MathFunctions._gammaFunctionString + "';
            
            function addStringFunctionDependency(functionCode) {            if (functionCode.search('findFactorial') > -1) {                functionCode = findFactorialString + functionCode;            }    if (functionCode.search('gammaFunction') > -1) {        functionCode = gammaFunctionString + functionCode;    }  return functionCode;};

            start = nameSpace.MathFunctions.addStringFunctionDependency(start) + "return " + start;
            end = nameSpace.MathFunctions.addStringFunctionDependency(end) + "return " + end;
            expression = nameSpace.MathFunctions.addStringFunctionDependency(expression) + "return " + expression;


            console.log('param :' + param + ' constants ' + constants);
            console.log('start code ' + start);
            console.log('end code ' + end);
            console.log('expr code ' + expression);

            var funcStartRange = new Function('param,constants', start);
            var funcEndRange = new Function('param,constants', end);
            var funcExpression = new Function(pivot + ',param,constants', expression);

            var startValue = funcStartRange(param, constants);
            var endValue = funcEndRange(param, constants);
            console.log('startvalue = ' + startValue + ' endvalue=' + endValue);
            var result = 0;
            if (!isFinite(startValue) || !isFinite(endValue)) {
                return;
            }
            for (i = startValue; i < endValue; i += 1) {
                result += funcExpression(i, param, constants);
                if (!isFinite(result)) {
                    return;
                }
            }
            //console.log('result is ' + result);
            return result;
        },

        decToFrac:function decToFrac(x, precision)
        {
            //var denom = 1;
            //for (var i = 0; i < precision; i++) {
            //    denom *= 10;
            //}

            //var num = x * denom + 0.5; // hack: round if imprecise
            //var gcdiv = _calculateGcd(num, denom);

            //var f;
            //f.num = num / gcdiv;
            //f.denom = denom / gcdiv;

            //return f;

            function recursive(x, call) {
                if (call === undefined) {
                    call = 0;
                
                }
                console.log('>>' + x);
                var arr = (x + "").split('.');
                console.log('arr >> ' + arr);
                var intPart = parseInt(arr[0]);
                var decPart = parseFloat("0."+arr[1]);


                console.log(intPart + "<>" + decPart);

                if (intPart > 10e4) {
                    console.log('result too small ' + intPart);
                    return {"n":1,"d":0};
                }
                if (call > 100) {
                    return { "n": 1, "d": 0 };
                }

                var result = recursive(1/decPart,call+1);
                
                
                console.log('>> ' + intPart + "+ 1/(" + result.d + "/" + result.n + ")");
                return { "n": intPart * result.n + result.d, "d": result.n };
                
            }


        },

        _processResultForTrignometricFunctions: function _processResultForTrignometricFunctions(functionName, result) {
            //return result;
            var TRIGNOMETRIC_FUNCTIONS = ['\\sin', '\\cos', '\\tan', '\\cot', '\\sec', '\\csc', '\\sinh', '\\cosh', '\\tanh', '\\coth', '\\sech', '\\csch'];
            if (TRIGNOMETRIC_FUNCTIONS.indexOf(functionName) !== -1) {
                if (!isNaN(result)) {
                    result = (Number)(result.toFixed(10));
                }
            }
            return result;
        }

    });
}(window.MathInteractives));