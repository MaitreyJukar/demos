/* globals MathUtilities */

(function() {
    'use strict';

    /**
     * Provides the base class for fract-dec.
     *
     * @module MathUtilities.Components.FractDec
     */
    MathUtilities.Components.FractDec = {};

    /**
     * Provides a `Models` submodule for the base class FractDec.
     *
     * @submodule MathUtilities.Components.FractDec.Models
     */
    MathUtilities.Components.FractDec.Models = {};

    /**
     * Creates a fraction-decimal conversion model class.
     *
     * @class MathUtilities.Components.FractDec.Models.FD
     * @extends Backbone.View
     * @constructor
     */
    MathUtilities.Components.FractDec.Models.FD = Backbone.Model.extend({}, {
        /**
         * @property cfArray
         * @type Array
         * @private
         * @default null
         */
        "_cfArray": null,

        "ACCURACY_MARGIN": 1 * Math.pow(10, -7),

        "toDecimal": function(latex, numerator, denominator) {
            var res, isNegative = false;

            if (latex) {
                if (latex.charAt(0) === '-') {
                    isNegative = true;
                }
                res = this._extractNumeratorDenominator(latex);
            }
            if (res) {
                numerator = res.numerator;
                denominator = res.denominator;
            }

            if (isNegative) {
                return -numerator / denominator;
            }
            return numerator / denominator;
        },

        "_extractNumeratorDenominator": function(latex) {
            if (!latex.match(/frac/)) {
                return null;
            }

            var numbers = [];

            numbers[0] = latex.substring(latex.indexOf('{') + 1, latex.indexOf('}'));
            numbers[1] = latex.substring(latex.indexOf('}') + 2, latex.length - 1);

            // Check for Eng notation's latex.
            numbers = this._convertToEngg(numbers);

            return {
                "numerator": parseFloat(numbers[0]),
                "denominator": parseFloat(numbers[1])
            };
        },

        "_convertToEngg": function(numbers) {
            var index = 0,
                length = numbers.length,
                replaceStr = 'e+',
                number;

            for (; index < length; index++) {
                number = numbers[index];
                if (number.match(/cdot10\^/)) {
                    if (number.charAt(number.indexOf('^') + 2) === '-') { // to get 2nd element after ^
                        replaceStr = 'e-';
                    }
                    number = number.replace('\\cdot10^{', replaceStr);
                }
                number = number.replace('{', '').replace('}', '');
                numbers[index] = number;
            }
            return numbers;
        },
        "toFraction": function(inputValue) {
            var FractDecModel = MathUtilities.Components.FractDec.Models.FD,
                isNegative = false,
                res = {},
                numerator;

            if (!isFinite(parseFloat(inputValue))) {
                return null;
            }
            if (inputValue < 0) {
                isNegative = true;
                inputValue = Math.abs(inputValue);
            }

            FractDecModel._cfArray = [];
            FractDecModel._getCFValues(inputValue, FractDecModel);

            if (FractDecModel._cfArray.length > 1) {
                if (isNegative) {
                    res = FractDecModel._convertFromCFValues(FractDecModel);
                    return {
                        "numerator": -res.numerator,
                        "denominator": res.denominator
                    };
                }
                return FractDecModel._convertFromCFValues(FractDecModel);
            }
            numerator = isNegative ? -FractDecModel._cfArray[0] : FractDecModel._cfArray[0];
            return {
                "numerator": numerator,
                "denominator": 1
            };
        },

        "compareWithThreshold": function(number) {
            var THRESHOLD = 10e-5,
                ceil = Math.ceil(number),
                floor = Math.floor(number);
            if (ceil - number < THRESHOLD) {
                return ceil;
            }
            if (number - floor < THRESHOLD) {
                return floor;
            }
            return number;
        },

        "_getCFValues": function(input, FractDecModel) {
            var temp = input,
                integralPart = FractDecModel._getIntegralPart(temp),
                decResult, fractResult,
                LENGTH = 10,
                FAIL_SAFE_COUNTER = 20,
                continueLoop = true,
                DIGITS_IN_DECIMAL = 7;

            input = parseFloat(input).toFixed(LENGTH);

            // Initial addition of integral part.
            FractDecModel._cfArray.push(integralPart);

            //Start the loop
            while (continueLoop) {
                //  Get inputValue's decimal part
                temp = FractDecModel._getDecimalPart(temp);

                // Stopping condition
                if (temp === 0) {
                    return;
                }

                // Get it's reciprocal.
                temp = parseFloat((1 / temp).toPrecision(DIGITS_IN_DECIMAL));

                fractResult = FractDecModel._convertFromCFValues(FractDecModel);
                decResult = FractDecModel.toDecimal(null, fractResult.numerator, fractResult.denominator);

                // Check for stopping condition.
                if (Math.abs(input - decResult.toFixed(LENGTH)) < FractDecModel.ACCURACY_MARGIN &&
                    (FractDecModel._cfArray.length >= 2) || FractDecModel._cfArray.length === FAIL_SAFE_COUNTER) { //cfArray should have 2 elements at max.
                    return;
                }
                // Addition of integral part to an array.
                integralPart = FractDecModel._getIntegralPart(temp);
                FractDecModel._cfArray.push(integralPart);
            }
        },

        "_convertFromCFValues": function(FractDecModel) {
            var cfArray = FractDecModel._cfArray,
                length = cfArray.length,
                num = 1,
                den = cfArray[--length],
                temp = null,
                leftAdd = null;

            while (length > 0) {
                leftAdd = cfArray[--length];
                num += (den * leftAdd);

                //condition for interchanging num and denominator.
                if (length > 0) {
                    temp = num;
                    num = den;
                    den = temp;
                }
            }
            return {
                "numerator": num,
                "denominator": den
            };

        },

        "_getIntegralPart": function(value) {
            value = value.toString();
            if (value.indexOf('e') > -1) {
                value = geomFunctions.convertExponentialToDecimal(value);
            }
            var res;

            // Check for a integer number.
            if (value.indexOf('.') === -1) {
                return parseInt(value, 10);
            }
            res = value.substr(0, value.indexOf('.'));

            if (res === '') {
                res = 0;
            }

            return parseInt(res, 10);
        },

        "_getDecimalPart": function(value) {
            value = value.toString();
            if (value.indexOf('e') > -1) {
                value = geomFunctions.convertExponentialToDecimal(value);
            }
            // Check for a integer number.
            if (value.indexOf('.') === -1) {
                value = parseInt(value, 10).toFixed(6);
            }
            return parseFloat(value.substr(value.indexOf('.'), value.length));
        }
    });
})();
