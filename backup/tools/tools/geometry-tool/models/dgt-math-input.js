/* globals $, window */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Dgt.Models.MathInput = Backbone.Model.extend({
        "intellisenseInputString": null,
        "checkForIntellisenseMapping": false,
        "$textarea": null,
        "valueObject": null,
        "answer": null,
        "inputReference": null,
        "tempInputReference": null,
        "latex": null,
        "inputReferencePointer": null,
        "cursorIndex": null,
        "intellisenseMapping": null,
        "parsedAns": null,
        "cursorPositionsWhenBlurred": null,
        "constantsMapping": null,
        "constantsCounter": null,
        "hasKeyDownEvent": null,
        "isSpecialKey": null,
        "isNavigationKeyKeptPressed": null,
        "characterWidthMap": null,
        "browserCheck": null,
        "engine": null,

        "initialize": function() {
            this.inputReference = [];
            this.tempInputReference = [];
            this.intellisenseInputString = '';
            this.inputReferencePointer = 0;
            this.isNavigationKeyKepPressed = false;
            this.parsedAns = null;
            this.characterWidthMap = {};
            this.browserCheck = MathUtilities.Components.Utils.Models.BrowserCheck;
            this.cursorPositionsWhenBlurred = {
                "caretPosition": 0,
                "inputReferencePointer": 0
            };
            this.intellisenseMapping = {
                "functions": {
                    "a": 'a',
                    "ab": 'abs()',
                    "ar": 'ar',
                    "arc": 'arc',
                    "arcs": 'arcsin()',
                    "arcc": 'arccos()',
                    "arct": 'arctan()',
                    "c": 'cos()',
                    "t": 't',
                    "ta": 'tan()',
                    "tr": 'trunc()',
                    "s": 's',
                    "si": 'sin()',
                    "sg": 'sgn()',
                    "sq": 'sqrt()',
                    "l": 'l',
                    "ln": 'ln()',
                    "lo": 'log()',
                    "r": 'round()'

                },
                "constants": {
                    "102": MathUtilities.Tools.Dgt.Models.MathInput.STRING_FOR_EXPONENTIAL,
                    "112": MathUtilities.Tools.Dgt.Models.MathInput.STRING_FOR_PI
                },
                "operators": {
                    "+": ' + ',
                    "-": ' - ',
                    "*": ' * ',
                    "/": ' / ',
                    "^": ' ^ '
                }
            };
            this.constantsMapping = {};
            this.constantsCounter = 0;
            return this;
        },

        "getAnswerFromParser": function() {
            var latex, parsedAns,
                replaceFunction, equationData = this.equationData,
                inputRefereneceInConstantMode = this.getInputReferenceWithMeasurementAsConstant(),
                MathHelper = MathUtilities.Components.Utils.Models.MathHelper,
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput,
                /*to find numbers of type -2.5, .2, 22, 23.5*/
                numRegEx = /^\-?(\d+?|\d*?\.\d+?)$/;

            replaceFunction = function(snip, index, original) {
                return MathHelper._generateLatexForNumber(snip);
            };

            latex = MathInput.textToLatex(inputRefereneceInConstantMode);

            equationData.setUnits({
                "angle": 'deg'
            });

            equationData.setConstants(this.getConstantValueMapping());

            latex = latex.replace(/\s/gi, '') // to replace space characters..
                .replace(/^\-?(\d+?|\d*?\.\d+?)e[\+\-]?\d+?$/gi, replaceFunction); //replace exponential numbers with scientific notation..

            equationData.setLatex(latex);

            MathUtilities.Components.EquationEngine.Models.Parser.parseEquation(this.equationData);

            parsedAns = equationData.getSolution();
            if (numRegEx.test(latex)) {
                parsedAns = '';
            } else if (isNaN(parsedAns)) { //If answer is not a number then return the string undefined
                parsedAns = 'undefined';
            } else {
                parsedAns = equationData.getSolution();
            }

            return parsedAns;

        },

        "setLatexForCalculationLabel": function() {
            var inputReferenceInStringMode = this.getInputReferenceWithMeasurementAsLatex(),
                answer, latex, value, indexOfDot, MAX_SIGNIFICAND = 6,
                parsedAns = this.getAnswerFromParser(),
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput,
                MathInputView = MathUtilities.Tools.Dgt.Views.MathInputView,
                MathHelper = MathUtilities.Components.Utils.Models.MathHelper,
                /*to find numbers of type -2.5, .2, 22, 23.5*/
                numRegEx = /^\-?(\d+?|\d*?\.\d+?)$/;

            /*If parsedAns parses the inputReference and returns an answer or
            undefined string then generate latex from textToLatex function or
            else generate valid latex*/
            if (typeof parsedAns === 'number' || parsedAns === 'undefined' || parsedAns === '') {
                latex = MathInput.textToLatex(inputReferenceInStringMode);
            } else {
                latex = this.getValidLatex(this.inputReference.slice());
            }

            if (this.$mathjaxDisplayArea) {
                /*as no need to render mathJax in case of parameters*/

                /*For larger numbers we need to get Latex in the form of scientific notation*/
                latex = MathInput.getLatexWithLargerNumberInScientificNotation(latex);

                if (inputReferenceInStringMode && (inputReferenceInStringMode.length === 0 ||
                        numRegEx.test(inputReferenceInStringMode.join('')))) {
                    answer = '';
                } else if (this.answer !== null && this.answer.length !== 0) {
                    answer = this.answer;
                } else {
                    answer = '{ ...?}';
                }

                latex = latex.replace(/\s/g, ''); // replace space

                /*If the answer is parsed then convert the answer in scientific notation*/
                if (answer !== '{ ...?}' && answer !== '') {
                    this.latex = latex;
                    value = answer.toString();
                    indexOfDot = value.indexOf('.');
                    if (indexOfDot > MAX_SIGNIFICAND || indexOfDot === -1 && value.length > MAX_SIGNIFICAND) {
                        answer = '=' + MathHelper._convertToDisplayableForm(answer, MAX_SIGNIFICAND);
                    } else {
                        answer = '=' + DgtEngine.roundOff(answer, MAX_SIGNIFICAND);
                    }

                }

                /*Show the input and answer in the math input field area*/
                if ($(this.$mathjaxDisplayArea).is(':visible')) {
                    MathInputView.latexToMathjax(latex + answer, this.$mathjaxDisplayArea, null, true);
                }
            }
        },

        "getInputReferenceWithMeasurementAsString": function() {
            var inputReferenceInStringMode = this.inputReference.slice(),
                inputReferenceLength = this.inputReference.length,
                loopVar, curInput;

            for (loopVar = 0; loopVar < inputReferenceLength; loopVar++) {
                curInput = inputReferenceInStringMode[loopVar];
                if (typeof curInput === 'object' && curInput.division === 'measurement') {
                    inputReferenceInStringMode[loopVar] = curInput.getDisplayedValueAsString().toString();
                }
            }
            return inputReferenceInStringMode;
        },

        "getInputReferenceWithMeasurementAsLatex": function() {
            var inputReferenceInStringMode = this.inputReference.slice(),
                inputReference = this.inputReference.slice(),
                inputReferenceLength = this.inputReference.length,
                loopVar, curInput,
                prevInput, nextInput, prevObject, nextObject,
                curInputString,
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput;

            for (loopVar = 0; loopVar < inputReferenceLength; loopVar++) {
                curInput = inputReferenceInStringMode[loopVar];
                if (typeof curInput === 'object' && curInput.division === 'measurement') {

                    prevObject = inputReference[loopVar - 1];
                    nextObject = inputReference[loopVar + 1];

                    prevInput = inputReferenceInStringMode[loopVar - 1];
                    nextInput = inputReferenceInStringMode[loopVar + 1];

                    curInputString = curInput.getDisplayedLabel();
                    if (curInput.properties.labelType === 'current-label') {
                        curInputString = MathInput.updateMeasurementLabelLatex(curInputString);
                    }

                    if (prevInput && nextInput && typeof prevObject !== 'object' &&
                        typeof nextObject !== 'object' && prevInput.indexOf('(') > -1 &&
                        nextInput.indexOf(')') > -1) {
                        inputReferenceInStringMode[loopVar] = curInputString;
                    } else {
                        if (MathInput.addBrackets(curInputString)) {
                            inputReferenceInStringMode[loopVar] = '\\left(' + curInputString + '\\right)';
                        } else {
                            inputReferenceInStringMode[loopVar] = curInputString;
                        }
                    }
                }

            }
            return inputReferenceInStringMode;
        },

        "getInputReferenceWithMeasurementAsConstant": function() {
            var inputReferenceInStringMode = this.inputReference.slice(),
                inputReferenceLength = this.inputReference.length,
                loopVar, curInput;

            for (loopVar = 0; loopVar < inputReferenceLength; loopVar++) {
                curInput = inputReferenceInStringMode[loopVar];
                if (typeof curInput === 'object' && curInput.division === 'measurement') {
                    inputReferenceInStringMode[loopVar] = this.getConstantForMeasurement(curInput);
                }
            }
            return inputReferenceInStringMode;
        },

        "getConstantValueMapping": function() {
            var constantValueMap = {},
                constantsMapping = this.constantsMapping,
                keys;

            for (keys in constantsMapping) {
                constantValueMap[keys] = Number(constantsMapping[keys].value);
            }
            return constantValueMap;
        },

        "setAnswer": function(answer) {
            this.answer = answer;
        },

        /*
        adds measurement as a part of calculation & update it in constant Mapping for equation parser
        */
        "updateConstantMapping": function(measurement) {
            var constantsMapping = this.constantsMapping,
                ALPHA_A = 65,
                NO_OF_CHARACTERS = 26;

            if (!this.getConstantForMeasurement(measurement)) {
                /*......handle for more than 26 measurements*/
                constantsMapping[String.fromCharCode(ALPHA_A + this.constantsCounter++ % NO_OF_CHARACTERS)] = measurement;

            }
        },

        "getConstantForMeasurement": function(measurement) {

            var keys, constantsMapping = this.constantsMapping;

            for (keys in this.constantsMapping) {
                if (constantsMapping[keys] === measurement) {
                    return keys;
                }
            }
        },

        "getSources": function() {
            /*......sources can be retrieved from constantMapping*/
            var sources = [],
                loopVar, inputReference = this.inputReference,
                inputReferenceLength = inputReference.length;
            for (loopVar = 0; loopVar < inputReferenceLength; loopVar++) {
                if (typeof inputReference[loopVar] !== 'string') {
                    sources.push(inputReference[loopVar]);
                }
            }
            return sources;
        },

        "reloadConstantMapping": function() {
            var loopVar, inputReference = this.inputReference,
                inputReferenceLength = inputReference.length,
                curInput;

            for (loopVar = 0; loopVar < inputReferenceLength; loopVar++) {
                curInput = inputReference[loopVar];
                if (typeof curInput === 'object' && curInput.division === 'measurement') {
                    this.updateConstantMapping(curInput);
                }
            }
        },

        "resetMathInputDetails": function(mathInputDetails) {
            this.inputReference = mathInputDetails.inputReference.slice();
            this.answer = mathInputDetails.answer;
            this.constantsCounter = 0; /*......shift to flush on close*/
            this.constantsMapping = {}; /*......shift to flush on close*/
            this.reloadConstantMapping();
        },

        "doesMeasurementExistsInInputReference": function() {
            var loopCtr, inputReference = this.inputReference.slice(),
                inputReferenceLength = inputReference.length;
            for (loopCtr = 0; loopCtr < inputReferenceLength; loopCtr++) {
                if (typeof inputReference[loopCtr] === 'object' &&
                    inputReference[loopCtr].division === 'measurement') {
                    return true;
                }
            }
            return false;
        },

        /*Generate Valid latex for displaying in the math-input-field*/
        "getValidLatex": function(plainText) {
            var loopCtr, numRegEx = /[\d]/, //find digits
                binaryIndexArray = [],
                binaryIndexArrayLength, middleIndex, minIndex, maxIndex,
                latex, recentInputReference = [],
                tempInputReference = [],
                answer, inputReferenceInStringMode,
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput,
                inputReferenceLength = plainText.length,
                inputReference = plainText.slice(0, inputReferenceLength);

            for (loopCtr = 0; loopCtr < inputReferenceLength; loopCtr++) {
                if (typeof inputReference[loopCtr] !== 'object') {
                    inputReference[loopCtr] = inputReference[loopCtr].trim();
                }
            }

            for (loopCtr = 0; loopCtr < inputReferenceLength; loopCtr++) {
                if (MathInput.isOperator(inputReference[loopCtr])) {
                    if (numRegEx.test(inputReference[loopCtr - 1]) || inputReference[loopCtr - 1] === ')' ||
                        typeof inputReference[loopCtr - 1] === 'object') {
                        binaryIndexArray.push(loopCtr - 1);
                    }
                }
            }

            /*binaryIndexArray stores the index of text before the operators*/

            binaryIndexArrayLength = binaryIndexArray.length;
            minIndex = 0;
            maxIndex = binaryIndexArrayLength;

            /*Using binary search we check for valid latex
            If it is a valid text then look in the second half
            or else look in the first half*/
            do {
                middleIndex = Math.floor((minIndex + maxIndex) / 2);
                tempInputReference = inputReference.slice(0, binaryIndexArray[middleIndex] + 1);
                this.inputReference = tempInputReference.slice();
                answer = this.getAnswerFromParser();
                if (typeof answer === 'number' || answer === 'undefined' || answer === '') {
                    recentInputReference = tempInputReference.slice();
                    minIndex = middleIndex + 1;
                } else {
                    maxIndex = middleIndex - 1;
                    if (recentInputReference.length !== 0) {
                        break;
                    }
                }

            } while (maxIndex >= minIndex);

            this.inputReference = recentInputReference.slice();
            inputReferenceInStringMode = this.getInputReferenceWithMeasurementAsLatex();

            this.inputReference = this.tempInputReference.slice();

            latex = MathInput.textToLatex(inputReferenceInStringMode);
            return latex;


        }

    }, {
        "CHARCODE_PAGEUP_KEY": 33,
        "CHARCODE_PAGEDOWN_KEY": 34,
        "CHARCODE_END_KEY": 35,
        "CHARCODE_HOME_KEY": 36,
        "CHARCODE_LEFT_KEY": 37,
        "CHARCODE_UP_KEY": 38,
        "CHARCODE_RIGHT_KEY": 39,
        "CHARCODE_DOWN_KEY": 40,
        "CHARCODE_NUMBER_1": 49,
        "CHARCODE_NUMBER_5": 53,
        "CHARCODE_NUMBER_7": 55,

        "CHARCODE_DOT_KEY": 190,
        "CHARCODE_NUMPAD_DOT_KEY": 110,

        "CHARCODE_NUMPAD_KEY_0": 48,
        "CHARCODE_NUMPAD_KEY_9": 57,

        "CHARCODE_DELETE": 46,
        "CHARCODE_BACKSPACE": 8,
        "CHARCODE_ALPHABET_V": 86,
        "CHARCODE_FOR_SINGLE_QUOTE": 222,
        "STRING_FOR_PI": '\u03C0',
        "STRING_FOR_EXPONENTIAL": 'e',
        "lastInputReferenceValue": null,

        "bracketCount": function(inputReferenceData, isRoundBrace, isOpeningBrackCount) {
            var openingBrace, closingBrace, count = 0;

            if (isRoundBrace) {
                openingBrace = '(';
                closingBrace = ')';
            } else {
                openingBrace = '{';
                closingBrace = '}';
            }
            if (isOpeningBrackCount) {
                if (inputReferenceData.indexOf(openingBrace) >= 0) {
                    count++;
                }
                if (inputReferenceData.indexOf(closingBrace) >= 0) {
                    count--;
                }
            } else {
                if (inputReferenceData.indexOf(openingBrace) >= 0) {
                    count--;
                }
                if (inputReferenceData.indexOf(closingBrace) >= 0) {
                    count++;
                }
            }
            return count;

        },

        "addBrackets": function(latex) {
            var ctr, openingBraceCounter = 0,
                inputReferenceAsLatex = latex.split(''),
                len = inputReferenceAsLatex.length;

            for (ctr = 0; ctr < len; ctr++) {
                if (ctr !== 0 && openingBraceCounter === 0 &&
                    MathUtilities.Tools.Dgt.Models.MathInput.isOperator(inputReferenceAsLatex[ctr])) {
                    return true;
                }
                if (inputReferenceAsLatex[ctr].indexOf('(') !== -1) {
                    openingBraceCounter++;
                }
                if (inputReferenceAsLatex[ctr].indexOf(')') !== -1) {
                    openingBraceCounter--;
                }
            }

            return false;

        },

        /*For displaying the value of larger numbers in scientific notation*/
        "getLatexWithLargerNumberInScientificNotation": function(latex) {

            var loopCtr, startIndex = null,
                endIndex = null,
                partialString = '',
                tempInputReference = [],
                numRegEx = /^\.[\d]+?$|^[\d]+?\.?[\d]*?$/, // find numbers
                numberStartEndIndexArray = [],
                isNumber,
                ctr = 0,
                rowCtr, numberStartEndIndexArrayLength,
                inputReference = latex.split(' '),
                inputReferenceLength = inputReference.length;

            /*Add start and end index of numbers in numberStartEndIndexArray*/
            for (loopCtr = 0; loopCtr < inputReferenceLength; loopCtr++) {
                partialString += inputReference[loopCtr];
                isNumber = numRegEx.test(partialString);
                if (startIndex === null && isNumber) {
                    startIndex = loopCtr;
                    numberStartEndIndexArray[ctr] = [];
                    numberStartEndIndexArray[ctr].push(startIndex);
                } else if (startIndex !== null && !isNumber) {
                    endIndex = loopCtr;
                    numberStartEndIndexArray[ctr].push(endIndex);
                }
                if (startIndex !== null && loopCtr + 1 === inputReferenceLength && isNumber) {
                    endIndex = loopCtr + 1;
                    numberStartEndIndexArray[ctr].push(endIndex);
                }
                if (startIndex !== null && endIndex !== null) {
                    startIndex = endIndex = null;
                    partialString = '';
                    ctr++;
                }
            }

            partialString = '';
            numberStartEndIndexArrayLength = numberStartEndIndexArray.length;

            for (rowCtr = 0; rowCtr < numberStartEndIndexArrayLength; rowCtr++) {
                if (rowCtr === 0 && numberStartEndIndexArray[rowCtr][0] !== 0) {
                    for (ctr = 0; ctr < numberStartEndIndexArray[rowCtr][0]; ctr++) {
                        tempInputReference.push(inputReference[ctr]);
                    }
                } else if (rowCtr !== 0) {
                    for (ctr = numberStartEndIndexArray[rowCtr - 1][1]; ctr < numberStartEndIndexArray[rowCtr][0]; ctr++) {
                        tempInputReference.push(inputReference[ctr]);
                    }
                }
                for (ctr = numberStartEndIndexArray[rowCtr][0]; ctr < numberStartEndIndexArray[rowCtr][1]; ctr++) {
                    partialString += inputReference[ctr];
                }
                if (partialString.length > 0) {
                    partialString = MathUtilities.Components.Utils.Models.MathHelper._convertToDisplayableForm(Number(partialString), 6);
                    tempInputReference.push(partialString);
                    partialString = '';
                }
                if (rowCtr + 1 === numberStartEndIndexArrayLength) {
                    for (ctr = numberStartEndIndexArray[rowCtr][1]; ctr < inputReferenceLength; ctr++) {
                        tempInputReference.push(inputReference[ctr]);
                    }
                }

            }

            if (tempInputReference.length > 0) {
                return tempInputReference.join(' ');
            }
            return latex;
        },

        "isOperator": function(data) {
            var mathOperators = ['+', '-', '/', '*', '^'];
            if (mathOperators.indexOf(data) > -1) {
                return true;
            }
            return false;
        },

        "textToLatex": function(plainText) {

            var inputType, loopCtr, curInputRef,
                latexCode = [],
                inputFunctionLength, backwardTraversalCtr, forwardTraversalCtr,
                openingBrackCount = 0,
                closingBrackCount = 0,
                recentInputReferenceLength,
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput,
                inputReferenceLength = plainText.length,
                inputReference = plainText.slice(0, inputReferenceLength),
                backwardTraversalCtrMinusOne;


            inputReferenceLength = plainText.length;
            inputReference = plainText.slice(0, inputReferenceLength);

            for (loopCtr = 0; loopCtr < inputReferenceLength; loopCtr++) {
                inputReference[loopCtr] = typeof inputReference[loopCtr] === 'string' ? inputReference[loopCtr].trim() : inputReference[loopCtr];
            }

            ///* For Outer Brackets for raised-to power of caret operator */

            /*For Fraction*/

            for (loopCtr = 0; loopCtr < inputReferenceLength; loopCtr++) {

                if (inputReference[loopCtr] === '/') {

                    backwardTraversalCtr = loopCtr - 1;

                    /*Backward Traversal before the division sign*/
                    if (backwardTraversalCtr >= 0) {

                        for (backwardTraversalCtr = loopCtr - 1; backwardTraversalCtr >= 0; backwardTraversalCtr--) {

                            closingBrackCount += MathInput.bracketCount(inputReference[backwardTraversalCtr], true, false);
                            backwardTraversalCtrMinusOne = backwardTraversalCtr -1;
                            if (closingBrackCount === 0 && (backwardTraversalCtr === 0 ||
                                    ['{', '+', '-'].indexOf(inputReference[backwardTraversalCtrMinusOne]) > -1 ||
                                    inputReference[backwardTraversalCtrMinusOne].indexOf('(') >= 0)) {
                                inputReference.splice(backwardTraversalCtr, 0, '\\frac{');
                                inputReference.splice(loopCtr + 1, 1, '}');
                                inputReferenceLength += 1;
                                loopCtr += 1;
                                break;
                            } //end of if
                        } //end of loop

                    } // end of if (backwardTraversalCtr >= 0)

                    loopCtr++;

                    /*Forward Traversal after the division sign*/
                    if (loopCtr < inputReferenceLength) {

                        for (forwardTraversalCtr = loopCtr; forwardTraversalCtr < inputReferenceLength; forwardTraversalCtr++) {
                            openingBrackCount += MathInput.bracketCount(inputReference[forwardTraversalCtr], true, true);
                            curInputRef = inputReference[forwardTraversalCtr + 1];
                            if (openingBrackCount === 0 && (forwardTraversalCtr + 1 === inputReferenceLength ||
                                    ['}', '+', '-'].indexOf(curInputRef) > -1 ||
                                    curInputRef.indexOf(')') >= 0)) {
                                inputReference.splice(loopCtr, 0, '{');
                                inputReference.splice(forwardTraversalCtr + 2, 0, '}');
                                loopCtr += 1;
                                inputReferenceLength = inputReferenceLength + 2;
                                break;
                            }
                        }
                    }
                }
            }

            openingBrackCount = 0;
            closingBrackCount = 0;

            /* For Outer Brackets for raised-to power of caret operator */

            for (loopCtr = 0; loopCtr < inputReferenceLength; loopCtr++) {

                if (inputReference[loopCtr] === '^') {

                    /*Forward Traversal after the division sign*/
                    if (loopCtr < inputReferenceLength) {
                        for (forwardTraversalCtr = loopCtr + 1; forwardTraversalCtr < inputReferenceLength; forwardTraversalCtr++) {
                            curInputRef = inputReference[forwardTraversalCtr];
                            openingBrackCount += MathInput.bracketCount(curInputRef, true, true);
                            if (openingBrackCount === 0) {
                                if (forwardTraversalCtr + 1 === inputReferenceLength) {
                                    inputReference.splice(loopCtr + 1, 0, '{');
                                    inputReference.splice(forwardTraversalCtr + 2, 0, '}');
                                    loopCtr += 2;
                                    inputReferenceLength = inputReferenceLength + 2;
                                    break;
                                }
                                if (inputReference[loopCtr] === '^' &&
                                    curInputRef === '-' &&
                                    inputReference[forwardTraversalCtr + 1] === '-') {
                                    forwardTraversalCtr += 1;
                                }
                                if (['*', '}', '+'].indexOf(curInputRef) > -1 ||
                                    inputReference[forwardTraversalCtr - 1] !== '^' &&
                                    curInputRef === '-' && loopCtr !== forwardTraversalCtr - 1 ||
                                    curInputRef.indexOf(')') >= 0) {
                                    inputReference.splice(loopCtr + 1, 0, '{');
                                    inputReference.splice(forwardTraversalCtr + 1, 0, '}');
                                    loopCtr += 2;
                                    inputReferenceLength = inputReferenceLength + 2;
                                    break;
                                }
                            }
                        }
                    }
                }
            }


            /* For Outer Brackets in numerator and denominator of Fraction */
            openingBrackCount = 0;
            closingBrackCount = 0;

            for (loopCtr = 0; loopCtr < inputReferenceLength; loopCtr++) {
                recentInputReferenceLength = inputReferenceLength;
                if (inputReference[loopCtr] === '}' && inputReference[loopCtr + 1] === '{') {

                    backwardTraversalCtr = loopCtr - 1;

                    if (inputReference[backwardTraversalCtr] === ')') {

                        for (backwardTraversalCtr = loopCtr; backwardTraversalCtr >= 0; backwardTraversalCtr--) {
                            closingBrackCount += MathInput.bracketCount(inputReference[backwardTraversalCtr], false, false);

                            if (closingBrackCount === 0 && inputReference[backwardTraversalCtr].indexOf('{') >= 0 &&
                                inputReference[backwardTraversalCtr + 1] === '(') {
                                inputReference.splice(loopCtr - 1, 1);
                                inputReference.splice(backwardTraversalCtr + 1, 1);
                                inputReferenceLength -= 2;
                                loopCtr -= 2;
                                break;
                            } // end of if

                        } // end of for

                    } //end of if (inputReference[backwardTraversalCtr] === ')')

                    forwardTraversalCtr = loopCtr + 2;
                    curInputRef = inputReference[forwardTraversalCtr];
                    if (curInputRef === '(') {

                        for (forwardTraversalCtr = loopCtr + 1; forwardTraversalCtr < inputReferenceLength; forwardTraversalCtr++) {
                            openingBrackCount += MathInput.bracketCount(curInputRef, false, true);

                            if (openingBrackCount === 0 && curInputRef === '}' &&
                                inputReference[forwardTraversalCtr - 1] === ')') {

                                inputReference.splice(forwardTraversalCtr - 1, 1);
                                inputReference.splice(loopCtr + 2, 1);
                                inputReferenceLength -= 2;
                                break;
                            }
                        }
                    }
                }

                if (inputReferenceLength !== recentInputReferenceLength) {
                    loopCtr = -1;
                } // end of if

            } // end of loop

            openingBrackCount = 0;
            closingBrackCount = 0;
            /*For Square Root*/
            for (loopCtr = 0; loopCtr < inputReferenceLength; loopCtr++) {
                if (inputReference[loopCtr] === 'sqrt(') {

                    for (forwardTraversalCtr = loopCtr; forwardTraversalCtr < inputReferenceLength; forwardTraversalCtr++) {
                        curInputRef = inputReference[forwardTraversalCtr];
                        openingBrackCount += MathInput.bracketCount(curInputRef, true, true);

                        if (openingBrackCount === 0 && curInputRef === ')') {
                            inputReference.splice(loopCtr, 1, '\\sqrt{');
                            inputReference.splice(forwardTraversalCtr, 1, '}');
                            loopCtr = -1;
                            break;
                        } //end of if
                    } //end of loop

                } //end of if (inputReference[loopCtr] === '\sqrt(')
            } //end of loop

            for (loopCtr = 0; loopCtr < inputReferenceLength; loopCtr++) {
                if (inputReference[loopCtr].lastIndexOf('(') > 0) {
                    inputType = 'function';
                } else if (inputReference[loopCtr] === MathUtilities.Tools.Dgt.Models.MathInput.STRING_FOR_PI ||
                    inputReference[loopCtr] === MathUtilities.Tools.Dgt.Models.MathInput.STRING_FOR_EXPONENTIAL) {
                    inputType = 'constant';
                } else if (inputReference[loopCtr] === '/' || inputReference[loopCtr] === '*') {
                    inputType = 'operator';
                } else if (inputReference[loopCtr] === '(' || inputReference[loopCtr] === ')') {
                    inputType = 'bracket';
                } else {
                    inputType = 'other';
                }
                switch (inputType) {
                    case 'function':
                        inputFunctionLength = inputReference[loopCtr].length - 1;
                        if (inputReference[loopCtr] === 'sqrt(') {
                            latexCode.push('\\' + inputReference[loopCtr].substring(0, inputFunctionLength) + '{');
                        } else if (inputReference[loopCtr].lastIndexOf('(') === inputReference[loopCtr].length - 1) {
                            latexCode.push('\\' + inputReference[loopCtr].substring(0, inputFunctionLength) + '\\left(');
                        } else {
                            latexCode.push(inputReference[loopCtr]);
                        }
                        break;
                    case 'constant':
                        if (inputReference[loopCtr] === 'e') {
                            latexCode.push('e');
                        } else {
                            latexCode.push('\\pi');
                        }
                        break;
                    case 'operator':
                        if (inputReference[loopCtr] === '*') {
                            latexCode.push('\\cdot');
                        } else {
                            latexCode.push(inputReference[loopCtr]);
                        }
                        break;
                    case 'bracket':
                        if (inputReference[loopCtr] === '(') {
                            latexCode.push('\\left(');
                        } else if (inputReference[loopCtr] === ')') {
                            latexCode.push('\\right)');
                        }
                        break;
                    case 'other':
                        latexCode.push(inputReference[loopCtr]);
                        break;

                }
            }

            return latexCode.join(' ');
        }, //end of function textToLatex

        "changeLatex": function(latexCode) {
            if (typeof latexCode === 'undefined' || latexCode === null || latexCode === '') {
                return latexCode;
            }
            return latexCode.replace(/\\round\\left\(/g, '{round}\\left(') //Adding brackets to satisfy latex constraints.
                .replace(/\\abs\\left\(/g, '{abs}\\left(')
                .replace(/\\trunc\\left\(/g, '{trunc}\\left(')
                .replace(/\\sgn\\left\(/g, '{sgn}\\left(')
                .replace(/\\cdot/g, '\\cdot{}')
                .replace(/\\pi/g, '\\pi{}');
        },

        "updateMeasurementLabelLatex": function(labelText) {
            return labelText.replace(/(\#|\$|\%|\&|\_|\{|\})/g, '\\$1') //search for special characters #,$,%,&,_,{,}
                .replace(/(\~)/g, '\\tilde{}') //search for special character ~
                .replace(/(\|)/g, '\\mid{}') //search for special character |
                .replace(/(\@)/g, '\\lower{1pt}\\hbox{$1}') //search for special character @
                .replace(/(\\\,)/g, '\\hspace{1pt}') //search for special character \\,
                .replace(/(\,|\;)/g, '\\hspace{1pt}$1') //search for special characters , & ;
                .replace(/(\s)/g, '\\hspace{1pt}'); //search for space
        }
    });
})(window.MathUtilities);