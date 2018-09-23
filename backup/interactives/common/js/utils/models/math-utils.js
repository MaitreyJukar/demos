(function () {
    'use strict';
    MathInteractives.Common.Utilities.Models.MathUtils = Backbone.Model.extend({}, {

        /**
         * Decides ehether the given number is prime or not
         * @param   {Number}  num The number to decide whether prime or not
         * @returns {Boolean} true if prime else false
         */
        isPrime: function isPrime(num) {
            var limit = Math.abs(Math.ceil(num/2)) + 1;
            for (var i = 2; i < limit; i++) {
                if (num % i === 0) {
                    return false;
                }
            }
            return true;
        },

        /**
        * Generates prime Numbers in a given range
        *
        * @method getPrimeNumbersInRange
        * @param [limit] {Number} The limit till where the ptime numbers needs to be generated
        **/
        getPrimeNumbersInRange: function getPrimeNumbersInRange(limit) {
            var primes = [2],
				index;
            for (index = 3; index < limit; index += 2) {
                if (this.isPrime(index)) {
                    primes.push(index);
                }
            }
            return primes;
        },

        /**
        * Generates prime factors of the given base
        *
        * @method generatePrimeFactors
        * @param [upperLimit] {Number} till what limit to generate prime numbers
        * @param [base] {Number} the base whose prime factors are being computed
        **/
        generatePrimeFactors: function generatePrimeFactors(upperLimit, base) {
            var primeNumbers = this.getPrimeNumbersInRange(upperLimit),
                factors = [],
                pos = 0,
                index, length;
            for (index = 0, length = primeNumbers.length; index < length; index++) {
                if (base === primeNumbers[index])
                    return factors;
            }
            for (index = 0, length = primeNumbers.length; index < length; index++) {
                while (true) {
                    if (base % primeNumbers[index] === 0) {
                        base = base / primeNumbers[index];
                        factors[pos] = primeNumbers[index];
                        pos = pos + 1;
                    }
                    else {
                        break;
                    }
                }
            }
            return factors;
        },

        getGreatestMultiple: function getGreatestMultiple(base) {
            var multiple = [],
                absBase = Math.abs(base),
                midNumber = Math.ceil(absBase / 2),
                sign = base/absBase,
                index = 2;
            if (midNumber < index) {
                return multiple;
            }
            for (; index <= midNumber; index++) {
                if (absBase % index === 0) {
                    break;
                }
            }
            if (index !== midNumber + 1) {
                multiple.push(sign * absBase / index);
                multiple.push(index);
            }
            return multiple;
        },

        /**
        * Checks sign of given exponents of which one has to be negative and other positive
        * if both present in numerator/denominator else both having same sign
		*
        * @method isBaseCancellable
        * @param [sourceExp] {Number} Exponent of source
		* @param [destExp] {Number} Exponent of destination
		* @param [parentSourceArray] {Number} Container array of the source term
		* @param [parentDestArray] {Number} Container array of the destination term
		*
        **/
        isBaseCancellable: function checkLocationSign(sourceExp, destExp, sourceLocation, destLocation) {
            if (sourceLocation === destLocation) {
                if (sourceExp * destExp > 0) {
                    return false;
                }
            }
            else {
                if (sourceExp * destExp < 0) {
                    return false;
                }
            }
            return true;
        },

        /**
        * Adds both the given exponents
		*
        * @method addExponents
        * @param [exp1] {Number} Exponent 1
		* @param [exp2] {Number} Exponent 2
		*
        **/
        addExponents: function addExponents(exp1, exp2) {
            return exp1 + exp2;
        },

        /**
        * Subtracts exp2 from exp1
		*
        * @method addExponents
        * @param [exp1] {Number} Exponent 1
		* @param [exp2] {Number} Exponent 2
		*
        **/
        subExponents: function addExponents(exp1, exp2) {
            return exp1 - exp2;
        },

        invertSign: function invertSign(number) {
            return number * -1;
        }


    });
}());
