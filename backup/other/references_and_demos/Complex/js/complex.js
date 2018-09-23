(function () {

    'use strict';
    var ClassName = null;
    /**
    * Holds the business logic for generation and operations on complex numbers.
    * @class ComplexNumbers
    * @extends Backbone.Model.extend
    * @namespace MathInteractives.Common.Utilities.Models
    * @constructor
    */
    window.ComplexNumbers = Backbone.Model.extend({
        /**
        * Sets the default properties of the complex number model.
        * @method defaults
        */
        defaults: function defaults() {
            return {
                /**
                * Stores coefficients of real parts of the complex number.
                * 
                * @property realCoefficients
                * @type Array
                * @default []
                */
                realCoefficients: [],
                /**
                * Stores coefficients of imaginary parts of the complex number.
                * 
                * @property imaginaryCoefficients
                * @type Array
                * @default []
                */
                imaginaryCoefficients: [],
                /**
                * Stores the value of the real part of the complex number.
                * 
                * @property realValue
                * @type Number
                * @default 0
                */
                realValue: 0,
                /**
                * Stores the value of the imaginary part of the complex number.
                * 
                * @property imaginaryValue
                * @type Number
                * @default 0
                */
                imaginaryValue: 0
            }
        },
        /**
        * Initializes default properties.
        * @method initialize
        */
        initialize: function initialize() {
            this._fillDefaultModelValues();
        },
        /**
        * Fills the default values in the model
        * @method _fillDefaultModelValues
        */
        _fillDefaultModelValues: function _fillDefaultModelValues() {
            var realCoefficients = this.get('realCoefficients'),
                imaginaryCoefficients = this.get('imaginaryCoefficients');

            if (realCoefficients.length > 0) {
                this._updateCoefficientValues('realCoefficients');
            }

            if (imaginaryCoefficients.length > 0) {
                this._updateCoefficientValues('imaginaryCoefficients');
            }

            this._updateRealAndImaginaryValue();
        },
        /**
        * Updates the default values of real and imaginary coefficients.
        * @method _updateCoefficientValues
        * @param {String} type Type of coefficient values to be updated, 'imaginaryCoefficients'/'realCoefficients'.
        */
        _updateCoefficientValues: function _updateCoefficientValues(type) {
            var coefficients = this.get(type),
                numberOfCoefficients = coefficients.length,
                value = null;

            for (var index = 0; index < numberOfCoefficients; index++) {
                var currentCoefficient = coefficients[index];
                if (currentCoefficient.numerator) {
                    if ((currentCoefficient.numerator.rational === null || typeof currentCoefficient.numerator.rational === 'undefined') && (currentCoefficient.numerator.irrational === null || typeof currentCoefficient.numerator.irrational === 'undefined')) {
                        currentCoefficient.numerator.rational = 0;
                        currentCoefficient.numerator.irrational = [{
                            value: 0,
                            type: ClassName.IRRATIONAL_TYPES.ZERO
                        }];
                    }
                    else if (currentCoefficient.numerator.rational === null || typeof currentCoefficient.numerator.rational === 'undefined') {
                        currentCoefficient.numerator.rational = 1;
                    }
                    else if (currentCoefficient.numerator.irrational === null || typeof currentCoefficient.numerator.irrational === 'undefined') {
                        currentCoefficient.numerator.irrational = [{
                            type: ClassName.IRRATIONAL_TYPES.DEFAULT
                        }];
                    }
                }
                if (currentCoefficient.denominator === null || typeof currentCoefficient.denominator === 'undefined') {
                    currentCoefficient.denominator = 1;
                }
                currentCoefficient.value = this._calculateCoefficientValue(currentCoefficient);
            }
        },
        /**
        * Updates the real value and imaginary value of the complex number.
        * @method _updateRealAndImaginaryValue
        */
        _updateRealAndImaginaryValue: function _updateRealAndImaginaryValue() {
            var value = null,
                types = [
                    'realCoefficients',
                    'imaginaryCoefficients'
                ],
                coefficients = null,
                numberOfCoefficients = null,
                currentType = null;

            for (var type = 0; type < types.length; type++) {
                currentType = types[type];
                coefficients = this.get(currentType);
                numberOfCoefficients = coefficients.length;
                value = 0;
                if (numberOfCoefficients > 0) {
                    for (var count = 0; count < numberOfCoefficients; count++) {
                        value += coefficients[count].value;
                    }
                }
                switch (type) {
                    case 0:
                        this.set('realValue', value);
                        break;

                    case 1:
                        this.set('imaginaryValue', value);
                        break;
                }
            }
        },
        /**
        * Returns the value of the coefficient.
        * @method _calculateCoefficientValue
        * @param {Object} currentCoefficient The coefficient whose value is to be calculated.
        */
        _calculateCoefficientValue: function _calculateCoefficientValue(currentCoefficient) {
            return (currentCoefficient.numerator.rational * this._getIrrationalValue(currentCoefficient.numerator.irrational) / currentCoefficient.denominator);
        },
        /**
        * Returns the value of the irrational part of the coefficient.
        * @method _getIrrationalValue
        * @param {Array} irrationalArray Array of irrational coefficients.
        */
        _getIrrationalValue: function _getIrrationalValue(irrationalArray) {
            var length = irrationalArray.length,
                value = 1,
                currentElement = null;

            for (var i = 0; i < length; i++) {
                currentElement = irrationalArray[i];

                switch (currentElement.type) {
                    case ClassName.IRRATIONAL_TYPES.ZERO:
                        value = 0;
                        break;
                    case ClassName.IRRATIONAL_TYPES.ROOT:
                        value *= Math.pow(currentElement.value, 1 / currentElement.root);
                        break;
                    case ClassName.IRRATIONAL_TYPES.LOG:
                        value *= Math.log(currentElement.value, currentElement.base);
                        break;
                    case ClassName.IRRATIONAL_TYPES.DEFAULT:
                        break;
                    case ClassName.IRRATIONAL_TYPES.CONSTANT:
                        break;
                }
            }

            return value;
        },

        // COMPLEX ARITHMETIC OPERATIONS

        /**
        * Adds a number/complex number to the current complex number.
        * @method add
        * @param {Mixed} complexNumber This can be a number, an object or an instance of another complex number model.
        * @return Returns the model instance with updated values.
        */
        add: function add(complexNumber) {
            var number = ClassName.returnRealAndImagParts(complexNumber);
            if (number) {
                ClassName.addComplexNumbers(this, number, this);
                return this;
            }
            return false;
        },
        /**
        * Subtracts a number/complex number from the current complex number.
        * @method subtract
        * @param {Mixed} complexNumber This can be a number, an object or an instance of another complex number model.
        * @return Returns the model instance with updated values.
        */
        subtract: function subtract(complexNumber) {
            var number = ClassName.returnRealAndImagParts(complexNumber);
            if (number) {
                ClassName.subtractComplexNumbers(this, number, this);
                return this;
            }
            return false;
        },
        /**
        * Multiplies a number/complex number with the current complex number.
        * @method multiply
        * @param {Mixed} complexNumber This can be a number, an object or an instance of another complex number model.
        * @return Returns the model instance with updated values.
        */
        multiply: function multiply(complexNumber) {
            var number = ClassName.returnRealAndImagParts(complexNumber);
            if (number) {
                ClassName.multiplyComplexNumbers(this, number, this);
                return this;
            }
            return false;
        },
        /**
        * Divides the current complex number by a number/complex number.
        * @method divide
        * @param {Mixed} complexNumber This can be a number, an object or an instance of another complex number model.
        * @return Returns the model instance with updated values.
        */
        divide: function divide(complexNumber) {
            var number = ClassName.returnRealAndImagParts(complexNumber);
            if (number) {
                ClassName.divideComplexNumbers(this, number, this);
                return this;
            }
            return false;
        },
        /**
        * Returns the negation of the current complex number.
        * @method negate        
        * @return Returns the model instance with updated values.
        */
        negate: function negate() {
            this.multiply(-1);
            return this;
        },

        //TO DO
        /**
        * Returns the conjugate of the current complex number.
        * @method conjugate        
        * @return Returns the model instance with updated values.
        */
        conjugate: function conjugate() {
            this.setRealPart(this.getRealPart());
            this.setImaginaryPart(-this.getImaginaryPart());

            return this;
        },
        /**
        * Returns the argument of the current complex number.
        * @method argument        
        * @return Returns the value of the argument of the complex number.
        */
        argument: function argument() {
            return Math.atan2(this.getImaginaryValue(), this.getRealValue());
        },
        /**
        * Returns the absolute value of the current complex number.
        * @method absolute        
        * @return Returns the absolute value of the current complex number.
        */
        absolute: function absolute() {
            return Math.sqrt(this.norm());
        },
        /**
        * Returns the normalized value of the current complex number.
        * @method normalize        
        * @return Returns the normalized value of the current complex number.
        */
        normalize: function normalize() {
            var real = this.getRealValue(),
                imag = this.getImaginaryValue();
            return real * real + imag * imag;
        },

        //TO DO
        /**
        * Returns the exponential form of the current complex number.
        * @method exp        
        * @return Returns the exponential form of the current complex number.
        */
        exp: function exp() {
            var abs = Math.exp(this.getRealPart()),
                arg = this.getImaginaryPart();

            this.setRealPart(abs * Math.cos(arg));
            this.setImaginaryPart(abs * Math.sin(arg));

            return this;
        },

        //TO DO
        /**
        * Returns the logarithm of the current complex number.
        * @method log        
        * @return Returns the logarithm of the current complex number.
        */
        log: function log() {
            var abs = this.abs(),
                arg = this.arg();

            return ClassName.generateComplexNumber({
                real: abs * Math.cos(arg),
                imag: abs * Math.sin(arg)
            });
        },
        /**
        * Returns a new copy of the current complex number.
        * @method copy        
        * @return Returns a new copy of the current complex number.
        */
        copy: function copy(complexNumber) {
            var number = ClassName.returnRealAndImagParts(complexNumber);
            if (number) {
                return ClassName.generateComplexNumber(number);
            }
            return false;
        },

        pow: function pow(complexNumber) {
            return (that.constructor === this.constructor)
                ? that.mul(this.log()).exp()
                : (new CPLX(that, 0)).mul(this.log()).exp();
        },
        sqrt: function sqrt() {
            /* return this.pow(0.5); */
            var r = this.abs();
            return new CPLX(
                Math.sqrt((r + this.re) / 2),
                this.im < 0 ? -Math.sqrt((r - this.re) / 2)
                    : Math.sqrt((r - this.re) / 2)
            );
        },

        // GETTERS and SETTERS

        getRealPart: function getRealPart() {
            return this.get('realCoefficients');
        },

        setRealPart: function setRealPart(coefficientArray) {
            return this.set('realCoefficients', coefficientArray);
        },

        getImaginaryPart: function getImaginaryPart() {
            return this.get('imaginaryCoefficients');
        },

        setImaginaryPart: function setImaginaryPart(coefficientArray) {
            return this.set('imaginaryCoefficients', coefficientArray);
        },

        getRealValue: function getRealValue() {
            return this.get('realValue');
        },

        setRealValue: function setRealValue(value) {
            return this.set('realValue', value);
        },

        getImaginaryValue: function getImaginaryValue() {
            return this.get('imaginaryValue');
        },

        setImaginaryValue: function setImaginaryValue(value) {
            return this.set('imaginaryValue', value);
        },

        toLatex: function () {
            var latex = '',
                coefficients = ClassName.returnRealAndImagParts(this),
                realCoefficients = coefficients.realCoefficients,
                imaginaryCoefficients = coefficients.imaginaryCoefficients,
                numberOfRealCoefficients = realCoefficients.length,
                numberOfImaginaryCoefficients = imaginaryCoefficients.length,
                isFirst = true,
                currentCoefficient = null;

            for (var i = 0; i < numberOfRealCoefficients; i++) {
                currentCoefficient = realCoefficients[i];
                if (currentCoefficient.numerator.rational === 0) {
                    continue;
                }
                if (!isFirst) {
                    latex += currentCoefficient.numerator.rational > 0 ? '+' : '-';
                }
                latex += ClassName._getLatexOfCoeffient(currentCoefficient);
                isFirst = false;
            }

            for (var j = 0; j < numberOfRealCoefficients; j++) {
                currentCoefficient = imaginaryCoefficients[j];
                if (currentCoefficient.numerator.rational === 0) {
                    continue;
                }
                if (!isFirst) {
                    latex += currentCoefficient.numerator.rational > 0 ? '+' : '-';
                }
                latex += ClassName._getLatexOfCoeffient(currentCoefficient, true);
                isFirst = false;
            }

            return latex;
        },

        //PRIVATE FUNCTIONS

        _errorLog: function _errorLog(errorMsg) {
            var debug = true;
            if (window.console && debug) {
                console.log(errorMsg);
            }
        }

    }, {
        /** 
        * Returns an instance of a complex number model
        *
        * @method generateComplexNumber
        * @param {Object} properties Stores values of coefficients of real and imaginary parts.
        * @param {Array} properties.real Stores values of coefficients of real parts.
        * @param {Array} properties.imag Stores values of coefficients of imaginary parts.
        * The values of the coefficients is an array of objects as generated in the method 
        * {{#crossLink "MathInteractives.Common.Utilities.Models.ComplexNumbers/generateNewCoefficientObject:method"}}{{/crossLink}}.
        * @return {Object} complexNumberModel Stores an instance of a complex number model.
        */
        generateComplexNumber: function generateComplexNumber(properties) {
            if (properties) {
                var complexNumberModel = new ClassName(properties);
                return complexNumberModel;
            }
        },
        /** 
        * Returns a new object which stores coefficients of the real and imaginary parts.
        *
        * @method generateNewCoefficientObject
        * This object can be used to generate properties of the model in the method 
        * {{#crossLink "MathInteractives.Common.Utilities.Models.ComplexNumbers/generateNewCoefficientObject:method"}}{{/crossLink}}.
        * @return {Object} obj Stores coefficients of the real or imaginary parts of complex numbers.
        * @return {Object} obj.numerator Stores numerator of the coefficient.
        * @return {Number} obj.numerator.rational Stores rational part of the numerator of the coefficient.
        * @return {Number} obj.numerator.irrational Stores irrational part of the numerator of the coefficient.
        * @return {Number} obj.denominator Stores denominator of the coefficient.
        */
        generateNewCoefficientObject: function generateNewCoefficientObject() {
            return obj = {
                numerator: {
                    rational: 0,
                    irrational: 0
                },
                denominator: 1
            }
        },
        /** 
        * Returns an instance of a complex number model
        *
        * @method generateSimpleComplexNumber        
        * @param {Number} real Stores value of coefficient of real part.
        * @param {Number} imag Stores value of coefficient of imaginary part.        
        * @return {Object} Returns an instance of a complex number model.
        */
        generateSimpleComplexNumber: function generateSimpleComplexNumber(real, imag) {
            var properties = {
                realCoefficients: [{
                    numerator: {
                        rational: real
                    }
                }],
                imaginaryCoefficients: [{
                    numerator: {
                        rational: imag
                    }
                }]
            }

            return window.ComplexNumbers.generateComplexNumber(properties);
        },

        addComplexNumbers: function addComplexNumbers(number1, number2, instanceToBeSet) {
            var _number1 = ClassName.returnRealAndImagParts(number1),
                _number2 = ClassName.returnRealAndImagParts(number2),
                realSum = ClassName._addCoefficients(_number1.realCoefficients, _number2.realCoefficients),
                imagSum = ClassName._addCoefficients(_number1.imaginaryCoefficients, _number2.imaginaryCoefficients);

            if (instanceToBeSet) {
                instanceToBeSet.setRealPart(realSum);
                instanceToBeSet.setImaginaryPart(imagSum);
            }
            else {
                var instanceToBeSet = new ClassName.generateComplexNumber({
                    realCoefficients: realSum,
                    imaginaryCoefficients: imagSum
                });
            }
            instanceToBeSet._updateRealAndImaginaryValue();
            return instanceToBeSet;
        },

        subtractComplexNumbers: function subtractComplexNumbers(number1, number2, instanceToBeSet) {
            var _number1 = ClassName.returnRealAndImagParts(number1),
                _number2 = ClassName.returnRealAndImagParts(number2),
                realSum = ClassName._addCoefficients(_number1.realCoefficients, ClassName.negateCoefficients(_number2.realCoefficients)),
                imagSum = ClassName._addCoefficients(_number1.imaginaryCoefficients, ClassName.negateCoefficients(_number2.imaginaryCoefficients));

            if (instanceToBeSet) {
                instanceToBeSet.setRealPart(realSum);
                instanceToBeSet.setImaginaryPart(imagSum);
            }
            else {
                var instanceToBeSet = new ClassName.generateComplexNumber({
                    realCoefficients: realSum,
                    imaginaryCoefficients: imagSum
                });
            }
            instanceToBeSet._updateRealAndImaginaryValue();
            return instanceToBeSet;
        },

        multiplyComplexNumbers: function multiplyComplexNumbers(number1, number2, instanceToBeSet) {
            var _number1 = ClassName.returnRealAndImagParts(number1),
                _number2 = ClassName.returnRealAndImagParts(number2),
                realProduct1 = ClassName._multiplyCoefficients(_number1.realCoefficients, _number2.realCoefficients),
                realProduct2 = ClassName._multiplyCoefficients(_number1.imaginaryCoefficients, _number2.imaginaryCoefficients),
                imagProduct1 = ClassName._multiplyCoefficients(_number1.realCoefficients, _number2.imaginaryCoefficients),
                imagProduct2 = ClassName._multiplyCoefficients(_number1.imaginaryCoefficients, _number2.realCoefficients),
                realPart = ClassName._addCoefficients(realProduct1, ClassName.negateCoefficients(realProduct2)),
                imagPart = ClassName._addCoefficients(imagProduct1, imagProduct2);

            if (instanceToBeSet) {
                instanceToBeSet.setRealPart(realPart);
                instanceToBeSet.setImaginaryPart(imagPart);
            }
            else {
                var instanceToBeSet = new ClassName.generateComplexNumber({
                    realCoefficients: realPart,
                    imaginaryCoefficients: imagPart
                });
            }
            instanceToBeSet._updateRealAndImaginaryValue();
            return instanceToBeSet;
        },

        //NOT COMPLETED
        //TO DO:
        divideComplexNumbers: function divideComplexNumbers(number1, number2, instanceToBeSet) {
            var _number1 = ClassName.returnRealAndImagParts(number1),
               _number2 = ClassName.returnRealAndImagParts(number2),
               numerator = ClassName.multiplyComplexNumbers(_number1, ClassName.conjugateComplexCoefficients(_number2)),
               denominator = ClassName.multiplyComplexNumbers(_number2, ClassName.conjugateComplexCoefficients(_number2));

            if (instanceToBeSet) {
                instanceToBeSet.setRealPart(realPart);
                instanceToBeSet.setImaginaryPart(imagPart);
            }
            else {
                var instanceToBeSet = new ClassName.generateComplexNumber({
                    realCoefficients: realPart,
                    imaginaryCoefficients: imagPart
                });
            }
            instanceToBeSet._updateRealAndImaginaryValue();
            return instanceToBeSet;
        },

        returnRealAndImagParts: function returnRealAndImagParts(complexNumber) {
            var real = [],
                imag = [];

            if (complexNumber instanceof ClassName) {
                real = complexNumber.getRealPart();
                imag = complexNumber.getImaginaryPart();
            }
            else if (typeof complexNumber === 'object') {
                if (complexNumber.realCoefficients) {
                    real = complexNumber.realCoefficients;
                }
                if (complexNumber.imaginaryCoefficients) {
                    imag = complexNumber.imaginaryCoefficients;
                }
            }
            else if (typeof complexNumber === 'number') {
                real = [{
                    numerator: {
                        rational: complexNumber,
                        irrational: [
                            {
                                type: ClassName.IRRATIONAL_TYPES.DEFAULT
                            }
                        ]
                    },
                    denominator: 1
                }];
            }
            else {
                this.errorLog('Invalid parameters');
                return false;
            }

            //Return a deep copy of the object to prevent values of passed to numbers from changing
            return $.extend(true, {}, {
                realCoefficients: real,
                imaginaryCoefficients: imag
            })
        },

        _getLatexOfCoeffient: function (coefficient, isImaginary) {

            var latex = '';
            if (isImaginary) {
                latex += 'i';
            }
            if (coefficient.denominator > 1) {
                latex += '\\frac{';
                latex += ClassName._getLatexOfRationalPart(Math.abs(coefficient.numerator.rational));
                latex += ClassName._getLatexOfIrrationalPart(coefficient.numerator.irrational);
                latex += '}{' + coefficient.denominator + '}';
            }
            else {
                latex += ClassName._getLatexOfRationalPart(Math.abs(coefficient.numerator.rational));
                latex += ClassName._getLatexOfIrrationalPart(coefficient.numerator.irrational);
            }
            return latex;
        },

        _getLatexOfRationalPart: function (rational) {
            var latex = '' + rational;

            if (rational === 1) {
                latex.replace('1', '');
            }

            return latex;
        },

        _getLatexOfIrrationalPart: function (irrationalArray) {
            var irrationals = irrationalArray.length,
                latex = '',
                currentIrrational = null;

            for (var i = 0; i < irrationals; i++) {
                currentIrrational = irrationalArray[i];
                latex += ClassName._getLatexOfIrrationalCoefficient(currentIrrational);
            }

            return latex;
        },

        _getLatexOfIrrationalCoefficient: function (irrational) {
            var latex = '';
            switch (irrational.type) {
                case ClassName.IRRATIONAL_TYPES.ROOT:
                    if (irrational.root === 2) {
                        latex += '\\sqrt{' + irrational.value + '}'
                    }
                    else {
                        latex += '\\sqrt[' + irrational.root + ']{' + irrational.value + '}'
                    }
                    break;
                case ClassName.IRRATIONAL_TYPES.LOG:
                    latex += '\\log _' + irrational.base + '\\left(' + irrational.value + '\\right)';
                    break;
                case ClassName.IRRATIONAL_TYPES.ZERO:
                case ClassName.IRRATIONAL_TYPES.DEFAULT:
                case ClassName.IRRATIONAL_TYPES.CONSTANT:
                    break;
            }
            return latex;
        },

        _addCoefficients: function _addCoefficients(arr1, arr2) {
            var arr1 = ClassName._returnDeepCopy(arr1),
                arr2 = ClassName._returnDeepCopy(arr2),
                arr1Length = arr1.length,
                arr2Length = arr2.length,
                answer = null;

            if (arr1Length > 0 && arr2Length > 0) {
                for (var i = 0; i < arr1.length; i++) {
                    for (var j = 0; j < arr2.length; j++) {
                        if (ClassName._compareIrrationals(arr1[i].numerator.irrational, arr2[j].numerator.irrational)) {
                            answer = ClassName._addRationalCoefficients(arr1[i], arr2[j]);
                            arr1[i].numerator = answer.numerator;
                            arr1[i].denominator = answer.denominator;
                            arr2.splice(j, 1);
                            j--;
                            if (arr1[i].numerator.rational === 0) {
                                arr1.splice(i, 1);
                                i--;
                            }
                        }
                    }
                }
                return arr1.concat(arr2);
            }
            else if (arr1Length > 0) {
                return arr1;
            }
            else {
                return arr2;
            }
        },

        _multiplyCoefficients: function _multiplyCoefficients(arr1, arr2) {
            var arr1 = ClassName._returnDeepCopy(arr1),
                arr2 = ClassName._returnDeepCopy(arr2),
                arr1Length = arr1.length,
                arr2Length = arr2.length,
                answerArray = [],
                answer = null;

            if (arr1Length > 0 && arr2Length > 0) {
                for (var i = 0; i < arr1Length; i++) {
                    for (var j = 0; j < arr2.length; j++) {
                        answer = ClassName._multiplyRationalCoefficients(arr1[i], arr2[j]);
                        answerArray = ClassName._addCoefficients(answerArray, [answer]);
                    }
                }
                return answerArray;
            }
            else {
                return [];
            }
        },

        negateCoefficients: function negateCoefficients(coefficients) {
            var numberOfCoefficients = coefficients.length;
            for (var i = 0; i < numberOfCoefficients; i++) {
                coefficients[i].numerator.rational *= -1;
            }
            return coefficients;
        },

        _compareIrrationals: function _compareIrrationals(irrational1, irrational2) {
            var same = false;
            if (irrational1.length === irrational2.length) {
                var irrationalsInArr1 = irrational1.length,
                    irrationalsInArr2 = irrational2.length,
                    count = 0;
                for (var i = 0; i < irrationalsInArr1; i++) {
                    for (var j = 0; j < irrationalsInArr2; j++) {
                        if (irrational1[i].type === irrational2[j].type) {
                            switch (irrational1[i].type) {
                                case ClassName.IRRATIONAL_TYPES.ZERO:
                                    count++;
                                    break;
                                case ClassName.IRRATIONAL_TYPES.ROOT:
                                    if (irrational1[i].root === irrational2[j].root) {
                                        count++;
                                    }
                                    break;
                                case ClassName.IRRATIONAL_TYPES.LOG:
                                    if (irrational1[i].base === irrational2[j].base) {
                                        count++;
                                    }
                                    break;
                                case ClassName.IRRATIONAL_TYPES.DEFAULT:
                                    count++;
                                    break;
                                case ClassName.IRRATIONAL_TYPES.CONSTANT:
                                    break;
                            }
                        }
                    }
                }
                if (count === irrationalsInArr1) {
                    same = true;
                }
            }
            return same;
        },

        _addRationalCoefficients: function _addRationalCoefficients(num1, num2) {
            var answer = {};
            answer.denominator = num1.denominator * num2.denominator;
            answer.numerator = {};
            answer.numerator.irrational = num1.numerator.irrational;
            answer.numerator.rational = num1.numerator.rational * num2.denominator + num2.numerator.rational * num1.denominator;
            answer = ClassName._simplifyFraction(answer);
            return answer;
        },

        _multiplyRationalCoefficients: function _multiplyRationalCoefficients(num1, num2) {
            var _num1 = $.extend(true, {}, num1),
                _num2 = $.extend(true, {}, num2),
                answer = {},
                gcd = null;

            answer.denominator = _num1.denominator * _num2.denominator;
            answer.numerator = {};
            answer.numerator.irrational = ClassName._multiplyIrrationals(_num1.numerator, _num2.numerator);
            //answer.numerator.irrational = _num1.numerator.irrational.concat(_num2.numerator.irrational);

            answer.numerator.rational = _num1.numerator.rational * _num2.numerator.rational;
            answer.numerator.rational = answer.numerator.rational * ClassName._rationalizeIrrationals(answer.numerator.irrational);
            answer = ClassName._simplifyFraction(answer);
            return answer;
        },

        _simplifyFraction: function _simplifyFraction(fraction) {
            var gcd = ClassName._calculateGCD(fraction.numerator.rational, fraction.denominator);
            if (Math.abs(gcd) > 1) {
                fraction.denominator /= gcd;
                fraction.numerator.rational /= gcd;
            }
            if (fraction.denominator < 0) {
                fraction.numerator.rational = -fraction.numerator.rational;
                fraction.denominator = -fraction.denominator;
            }
            return fraction;
        },

        _multiplyIrrationals: function _multiplyIrrationals(num1, num2) {
            var num1Irrationals = num1.irrational,
                num2Irrationals = num2.irrational,
                numberOfNum1Irrationals = num1Irrationals.length;

            for (var i = 0; i < numberOfNum1Irrationals; i++) {
                for (var j = 0; j < num2Irrationals.length; j++) {
                    if (ClassName._compareIrrationalRoots(num1Irrationals[i], num2Irrationals[j])) {
                        num1Irrationals[i].value = num1Irrationals[i].value * num2Irrationals[j].value;
                        num2Irrationals.splice(j, 1);
                    }
                }
            }
            return num1Irrationals.concat(num2Irrationals);
        },

        _compareIrrationalRoots: function _compareIrrationalRoots(irrational1, irrational2) {
            var same = false;
            if (irrational1.type === ClassName.IRRATIONAL_TYPES.ROOT && irrational2.type === ClassName.IRRATIONAL_TYPES.ROOT) {
                if (irrational1.root === irrational2.root) {
                    same = true;
                }
            }
            return same;
        },

        _rationalizeIrrationals: function _rationalizeIrrationals(irrationals) {
            var rational = 1;

            for (var i = 0; i < irrationals.length; i++) {
                var currentIrrational = irrationals[i];
                if (currentIrrational.type === ClassName.IRRATIONAL_TYPES.ROOT) {
                    var primeFactors = ClassName._calculatePrimeFactors(currentIrrational.value),
                        numberOfFactors = ClassName._returnArrayOccurenceObject(primeFactors),
                        nthRoot = currentIrrational.root,
                        toBeDeleted = false;

                    _.each(numberOfFactors, function (value, key, obj) {

                        if (value >= nthRoot) {

                            var factor = parseInt(value / nthRoot),
                                number = parseInt(key);

                            rational *= factor * number;
                            currentIrrational.value /= Math.pow(number, nthRoot);
                            obj[key] -= nthRoot * factor;
                            if (currentIrrational.value === 1) {
                                toBeDeleted = true;
                                return false;
                            }
                        }
                    });

                    if (toBeDeleted) {
                        delete irrationals[i];
                    }
                }
            }
            return rational;
        },

        _returnArrayOccurenceObject: function _returnArrayOccurenceObject(arr) {
            var obj = {};
            for (var i = 0, j = arr.length; i < j; i++) {
                obj[arr[i]] = (obj[arr[i]] || 0) + 1;
            }
            return obj;
        },

        _returnDeepCopy: function _returnDeepCopy(array) {
            var obj = {};
            obj.array = array;
            return $.extend(true, {}, obj).array;
        },

        _calculateGCD: function _calculateGCD(num1, num2) {
            if (!num2) {
                return num1;
            }
            return ClassName._calculateGCD(num2, num1 % num2);
        },

        _calculateLCM: function _calculateLCM(num1, num2) {
            if (num1 && num2) {
                return (num1 * num2) / ClassName._calculateGCD(num1, num2);
            }
        },

        _calculatePrimeFactors: function _calculatePrimeFactors(num) {

            num = Math.abs(num);

            var root = Math.sqrt(num),
                result = arguments[1] || [],
                x = 2;

            if (num % x) {
                x = 3;
                while ((num % x) && ((x = x + 2) < root)) { }
            }

            x = (x <= root) ? x : num;
            result.push(x);

            return (x === num) ? result : _calculatePrimeFactors(num / x, result);
        },

        IRRATIONAL_TYPES: {
            DEFAULT: 'not-irrational',
            ROOT: 'complex-irrational-root',
            LOG: 'complex-irrational-log',
            CONSTANT: 'complex-irrational-constant',
            ZERO: 'value-zero'
        }
    })

    ClassName = window.ComplexNumbers;
})();

