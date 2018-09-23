/* globals window */

(function(MathUtilities) {
    'use strict';

    /**
        @class MathUtilities.Components.EquationEngine.Models.TreeProcedures
        @public
    **/
    MathUtilities.Components.EquationEngine.Models.TreeProcedures = Backbone.Model.extend({}, {

        "_mathFunctions": MathUtilities.Components.EquationEngine.Models.MathFunctions,
        "_productions": MathUtilities.Components.EquationEngine.Models.Productions,

        "OPERATOR_TEXT": {
            "ADD": ' plus ',
            "SUBTRACT": ' minus ',
            "MULTIPLY": ' multiplied by ',
            "NEGATIVE": ' negative ',
            "DIVIDE": ' divided by ',
            "SIN": 'sine of ',
            "COS": 'cos of ',
            "TAN": 'tan of ',
            "CSC": 'cosec of ',
            "FACTORIAL": ' factorial',
            "NATURAL_LOG": 'Natural log of ',
            "\\pi": 'Pi',
            "e": ' Euler’s constant ',
            "RECIPROCAL": 'Reciprocal of ',
            "ABS": 'Absolute value of ',
            "SIN_INV": 'Inverse sine of ',
            "COS_INV": 'Inverse cos of ',
            "TAN_INV": 'Inverse tan of ',
            "CSC_INV": 'Inverse cosec of ',
            "INV": 'Inverse ',
            "SQUARE": ' squared',
            "CUBE": ' cube',
            "POWER": ' raised to ',
            "SQUARE_ROOT": 'Square root of ',
            "CUBE_ROOT": 'Cube root of ',
            "ROOT": 'root of ',
            "OPEN_BRACKET": 'open bracket ',
            "CLOSE_BRACKET": ' close bracket ',
            "PERCENT": ' Percentage',
            "TH": 'th ',
            "RD": 'rd ',
            "ST": 'st ',
            "ND": 'nd ',
            "GT": " greater than ",
            "LT": " less than ",
            "GE": " greater than equal to ",
            "LE": " less than equal to ",
            "EQUAL_TO": " equal to "
        },

        "IRRATIONAL_CONSTANTS": ["\\pi", "e"],

        /*
         * @method _toLatex Function to get the latex expression.
         * Cases handled: () , ^ , + , \cdot, \frac.
         * @param rootNode {Object} It provides the root node of the tree.
         * @return {String} The function returns the latex expression.

         */
        "_toLatex": function(rootNode) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                latexArray,
                latexExpression,
                paramCount,
                latexLength;
            if (rootNode.isTerminal) {
                if (rootNode.constantSubstituted) {
                    return (rootNode.sign !== "+" ? "-" : "") + rootNode.constantSubstituted;
                }
                return EquationEngine.TreeProcedures._getValueFromParam(rootNode);
            } else {

                latexArray = [];
                for (paramCount = 0; paramCount < rootNode.params.length; paramCount++) {
                    latexArray.push(EquationEngine.TreeProcedures._toLatex(rootNode.params[paramCount]));
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, latexArray, []);
                }

                latexExpression = '';
                if (rootNode.sign === '-') {
                    latexExpression = '-';
                }

                switch (rootNode.name) {
                    case 'do':
                        latexExpression += latexArray[0];
                        return latexExpression;
                    case '^':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression += latexArray[0];
                        } else {
                            if (EquationEngine.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.name) >
                                EquationEngine.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.params[0].name)) {
                                latexExpression += '\\left(' + latexArray[0] + '\\right)';
                            } else {
                                latexExpression += latexArray[0];
                            }
                        }
                        if (!rootNode.params[1].isTerminal &&
                            EquationEngine.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.name) >
                            EquationEngine.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.params[1].name)) {
                            latexExpression += '^' + '\\left(' + latexArray[1] + '\\right)';
                        } else {
                            latexExpression += '^' + latexArray[1];
                        }

                        return latexExpression;
                    case '+':
                        latexExpression += latexArray[0];
                        latexLength = latexArray.length;
                        for (paramCount = 1; paramCount < latexLength; paramCount++) {
                            latexExpression += '+' + latexArray[paramCount];
                        }
                        return latexExpression;

                    case '\\cdot':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression += latexArray[0];
                        } else {
                            latexExpression += latexArray[0];
                        }
                        latexLength = latexArray.length;
                        for (paramCount = 1; paramCount < latexLength; paramCount++) {
                            if (rootNode.params[paramCount].isTerminal) {
                                latexExpression += '\\cdot ' + latexArray[paramCount];
                            } else {
                                if (EquationEngine.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.name) >
                                    EquationEngine.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.params[paramCount].name)) {
                                    latexExpression += '\\cdot ' + '\\left(' + latexArray[paramCount] + '\\right)';
                                } else {
                                    latexExpression += '\\cdot ' + latexArray[paramCount];
                                }
                            }
                        }
                        return latexExpression;
                    case '\\frac':
                        latexExpression += '\\frac{' + latexArray[0] + '}{' + latexArray[1] + '}';
                        return latexExpression;

                        //\sqrt{2} \sqrt[3]{t}
                        //1.5\cdot \left(\sqrt[2]{2}\right)
                    case '\\sqrt':
                        if (rootNode.params[0].isTerminal) {
                            if (latexArray[0] != "2") {
                                latexExpression += '\\sqrt[' + latexArray[0] + ']';
                            } else {
                                latexExpression += '\\sqrt';
                            }
                        } else {
                            latexExpression += '\\sqrt[\\left(' + latexArray[0] + '\\right)]';
                        }
                        if (rootNode.params[1].isTerminal) {
                            latexExpression += '{' + MathUtilities.Components.Utils.Models.MathHelper._convertToDisplayableForm(latexArray[1], 10) + '}';
                        } else {
                            latexExpression += '{\\left(' + latexArray[1] + '\\right)}';
                        }
                        return latexExpression;
                    case '\\log_':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression += '\\log_{' + latexArray[0] + '}';
                        } else {
                            latexExpression += '\\log_{\\left(' + latexArray[0] + '\\right)}';
                        }
                        latexExpression += ' \\left(' + latexArray[1] + '\\right)';
                        return latexExpression;
                    case '\\log':
                    case '\\ln':
                    case '\\sin':
                    case '\\cos':
                    case '\\tan':
                    case '\\csc':
                    case '\\sec':
                    case '\\cot':
                    case '\\arcsin':
                    case '\\arccos':
                    case '\\arctan':
                    case '\\arccsc':
                    case '\\arcsec':
                    case '\\arccot':
                    case '\\sinh':
                    case '\\cosh':
                    case '\\tanh':
                    case '\\csch':
                    case '\\sech':
                    case '\\coth':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression += rootNode.name + ' ' + latexArray[0];
                        } else {
                            latexExpression += rootNode.name + ' \\left(' + latexArray[0] + '\\right)';
                        }
                        return latexExpression;
                    case '\\ceil':
                    case '\\floor':
                    case '\\round':
                    case '\\abs':
                    case '\\exp':
                        latexExpression += rootNode.name + ' \\left(' + latexArray[0] + '\\right)';
                        return latexExpression;
                    case '!':
                        latexExpression = '';
                        if (rootNode.params[0].isTerminal) {
                            latexExpression = latexArray[0] + '!';
                        } else {
                            latexExpression = '\\left(' + latexArray[0] + '\\right)!';
                        }
                        return latexExpression;
                    case '\\mod':
                    case '\\min':
                    case '\\max':
                    case '\\nCr':
                    case '\\nPr':
                    case '\\ncr':
                    case '\\npr':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression += rootNode.name + ' \\left( ' + latexArray[0] + ' , ';
                        } else {
                            latexExpression += rootNode.name + ' \\left( \\left( ' + latexArray[0] + '\\right) , ';
                        }
                        if (rootNode.params[1].isTerminal) {
                            latexExpression += latexArray[1] + '\\right)';
                        } else {
                            latexExpression += ' \\left( ' + latexArray[1] + '\\right) \\right)';
                        }
                        return latexExpression;
                    case '\\prod':
                    case '\\sum':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression += rootNode.name + '{n=' + latexArray[0] + '}^';
                        } else {
                            latexExpression += rootNode.name + '{n=' + '\\left(' + latexArray[0] + '\\right)}^';
                        }
                        if (rootNode.params[1].isTerminal) {
                            latexExpression += '{' + latexArray[1] + '}';
                        } else {
                            latexExpression += '{ \\left(' + latexArray[1] + '\\right)}';
                        }
                        if (rootNode.params[2].isTerminal) {
                            latexExpression += latexArray[2];
                        } else {
                            latexExpression += ' \\left(' + latexArray[2] + '\\right)';
                        }
                        return latexExpression;
                    case '\\%':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression += rootNode.params[0].value + rootNode.name;
                        } else {
                            latexExpression += latexArray[0] + rootNode.name;
                        }
                        return latexExpression;
                }
                return rootNode.sign + rootNode.value;
            }

        },

        /*
         * Function get postfix string for the number eg . 'st' for 1 and 'nd' for 2
         * @method getNumberPostFix
         * @param number {Number|String} The number for which the postfix operator has to be found out.
         * @return {String} The postfix string.

         */
        "getNumberPostFix": function(number) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                numberString,
                numberStringLength,
                lastDigit,
                OPERATOR_TEXT = EquationEngine.TreeProcedures.OPERATOR_TEXT;
            if (isNaN(number)) {
                return '';
            }
            numberString = number.toString();
            numberStringLength = numberString.length;
            if (numberString.indexOf('.') !== -1 || numberString.charAt(numberStringLength - 2) === '1') {
                return OPERATOR_TEXT.TH;
            }
            lastDigit = numberString.charAt(numberStringLength - 1);
            switch (lastDigit) {
                case '1':
                    return OPERATOR_TEXT.ST;
                case '2':
                    return OPERATOR_TEXT.ND;
                case '3':
                    return OPERATOR_TEXT.RD;
                default:
                    return OPERATOR_TEXT.TH;
            }
        },

        "_toAccessible": function(rootNode) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                latexArray,
                latexExpression = {
                    "negativeCaseType": rootNode.negativeCaseType === void 0 ? 0 : rootNode.negativeCaseType,
                    "expression": ''
                },
                paramCount,
                latexLength,
                OPERATOR_TEXT = EquationEngine.TreeProcedures.OPERATOR_TEXT;

            if (rootNode.isTerminal) {

                if (rootNode.sign === '+') {
                    if (rootNode.type === 'digit') {
                        if (rootNode.constantSubstituted !== void 0) {
                            latexExpression.expression = OPERATOR_TEXT[rootNode.constantSubstituted];
                        } else {
                            latexExpression.expression = EquationEngine.TreeProcedures._getAccessibleStringForNumber(rootNode.value);
                        }
                    } else {
                        latexExpression.expression = rootNode.value;
                    }
                    return latexExpression;
                } else {
                    if (rootNode.type === 'digit') {
                        if (rootNode.constantSubstituted !== void 0) {
                            if (rootNode.negativeCaseType !== EquationEngine.Parser._NEGATIVE_CASE_TYPES.SINGLE &&
                                rootNode.negativeCaseType !== EquationEngine.Parser._NEGATIVE_CASE_TYPES.NONE) {
                                latexExpression.expression = OPERATOR_TEXT.NEGATIVE + OPERATOR_TEXT[rootNode.constantSubstituted];
                            } else {
                                latexExpression.expression = OPERATOR_TEXT[rootNode.constantSubstituted];
                            }
                        } else {
                            if (rootNode.negativeCaseType !== EquationEngine.Parser._NEGATIVE_CASE_TYPES.SINGLE &&
                                rootNode.negativeCaseType !== EquationEngine.Parser._NEGATIVE_CASE_TYPES.NONE) {
                                latexExpression.expression = OPERATOR_TEXT.NEGATIVE + EquationEngine.TreeProcedures._getAccessibleStringForNumber(rootNode.value);
                            } else {
                                latexExpression.expression = EquationEngine.TreeProcedures._getAccessibleStringForNumber(rootNode.value);
                            }
                        }
                    } else if (rootNode.negativeCaseType === EquationEngine.Parser._NEGATIVE_CASE_TYPES.SINGLE) {
                        latexExpression.expression = rootNode.value;
                    } else {
                        latexExpression.expression = OPERATOR_TEXT.NEGATIVE + rootNode.value;
                    }
                    return latexExpression;
                }
            } else {

                latexArray = [];
                for (paramCount = 0; paramCount < rootNode.params.length; paramCount++) {
                    latexArray.push(EquationEngine.TreeProcedures._toAccessible(rootNode.params[paramCount]));
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, latexArray, []);
                }
                latexExpression.expression = '';
                if (latexExpression.negativeCaseType === EquationEngine.Parser._NEGATIVE_CASE_TYPES.NEGATIVE) {
                    latexExpression.expression = OPERATOR_TEXT.NEGATIVE;
                }

                switch (rootNode.name) {
                    case 'do':
                        if (rootNode.value === '{' || rootNode.value === '}') {
                            latexExpression.expression = '';
                        } else if (!(rootNode.params[0].isTerminal || rootNode.params[0].name === 'do')) {
                            latexExpression.expression += OPERATOR_TEXT.OPEN_BRACKET + latexArray[0].expression + OPERATOR_TEXT.CLOSE_BRACKET;
                        } else {
                            latexExpression.expression += latexArray[0].expression;
                        }
                        return latexExpression;
                    case '^':
                        latexExpression.expression += latexArray[0].expression;
                        if (rootNode.params[1].isTerminal) {
                            if (Number(rootNode.params[1].value) === 2) {
                                latexExpression.expression += OPERATOR_TEXT.SQUARE;
                            } else if (Number(rootNode.params[1].value) === 3) {
                                latexExpression.expression += OPERATOR_TEXT.CUBE;
                            } else {
                                latexExpression.expression += OPERATOR_TEXT.POWER + latexArray[1].expression;
                            }
                        }
                        return latexExpression;
                    case '+':
                        latexExpression.expression += latexArray[0].expression;
                        latexLength = latexArray.length;
                        for (paramCount = 1; paramCount < latexLength; paramCount++) {
                            switch (latexArray[paramCount].negativeCaseType) {
                                case EquationEngine.Parser._NEGATIVE_CASE_TYPES.NONE:
                                case EquationEngine.Parser._NEGATIVE_CASE_TYPES.NEGATIVE:
                                    latexExpression.expression += OPERATOR_TEXT.ADD + latexArray[paramCount].expression;
                                    break;
                                case EquationEngine.Parser._NEGATIVE_CASE_TYPES.SINGLE:
                                    latexExpression.expression += OPERATOR_TEXT.SUBTRACT + latexArray[paramCount].expression.replace('-', '');
                                    break;
                                case EquationEngine.Parser._NEGATIVE_CASE_TYPES.DOUBLE:
                                    latexExpression.expression += OPERATOR_TEXT.SUBTRACT + OPERATOR_TEXT.NEGATIVE + latexArray[paramCount].expression;
                                    break;
                                case EquationEngine.Parser._NEGATIVE_CASE_TYPES.PLUS_SINGLE:
                                    latexExpression.expression += OPERATOR_TEXT.ADD + latexArray[paramCount].expression.replace('-', '');
                                    break;
                            }
                        }

                        return latexExpression;

                    case '\\cdot':
                        if (!rootNode.params[0].isTerminal &&
                            EquationEngine.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.name) >
                            EquationEngine.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.params[0].name)) {
                            latexExpression.expression += '(' + latexArray[0].expression + ')';
                        } else {
                            latexExpression.expression += latexArray[0].expression;
                            latexExpression.negativeCaseType = latexArray[0].negativeCaseType;
                        }
                        latexLength = latexArray.length;
                        for (paramCount = 1; paramCount < latexLength; paramCount++) {
                            latexExpression.expression += OPERATOR_TEXT.MULTIPLY + latexArray[paramCount].expression;
                        }
                        return latexExpression;
                    case '\\frac':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression.expression += latexArray[0].expression;
                        } else {
                            latexExpression.expression += OPERATOR_TEXT.OPEN_BRACKET + latexArray[0].expression + OPERATOR_TEXT.CLOSE_BRACKET;
                        }
                        latexExpression.expression += OPERATOR_TEXT.DIVIDE;
                        if (rootNode.params[1].isTerminal) {
                            latexExpression.expression += latexArray[1].expression;
                        } else {
                            latexExpression.expression += OPERATOR_TEXT.OPEN_BRACKET + latexArray[1].expression + OPERATOR_TEXT.CLOSE_BRACKET;
                        }
                        return latexExpression;

                    case '\\sqrt':
                        latexExpression.expression = '';
                        if (rootNode.params[0].isTerminal) {
                            if (Number(rootNode.params[0].value) === 2) {
                                latexExpression.expression += OPERATOR_TEXT.SQUARE_ROOT;
                            } else if (Number(rootNode.params[0].value) === 3) {
                                latexExpression.expression += OPERATOR_TEXT.CUBE_ROOT;
                            }
                        }
                        latexExpression.expression += latexArray[0].expression +
                            EquationEngine.TreeProcedures.getNumberPostFix(latexArray[0].expression) + OPERATOR_TEXT.ROOT;
                        if (rootNode.params[1].isTerminal) {
                            latexExpression.expression += latexArray[1].expression;
                        } else {
                            latexExpression.expression += OPERATOR_TEXT.OPEN_BRACKET + latexArray[1].expression + OPERATOR_TEXT.CLOSE_BRACKET;
                        }
                        return latexExpression;

                    case '\\log_':
                        latexExpression.expression += 'Log of ' + latexArray[1].expression + ' to the base ' + latexArray[0].expression;
                        return latexExpression;

                    case '\\log':
                        latexExpression.expression += 'Log of ' + latexArray[0].expression + ' to the base 10';
                        return latexExpression;

                    case '\\ln':
                        latexExpression.expression += OPERATOR_TEXT.NATURAL_LOG + latexArray[0].expression;
                        return latexExpression;

                    case '\\sin':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression.expression += OPERATOR_TEXT.SIN + latexArray[0].expression;
                        } else {
                            latexExpression.expression += OPERATOR_TEXT.SIN + OPERATOR_TEXT.OPEN_BRACKET +
                                latexArray[0].expression + OPERATOR_TEXT.CLOSE_BRACKET;
                        }
                        return latexExpression;

                    case '\\csc':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression.expression += OPERATOR_TEXT.CSC + latexArray[0].expression;
                        } else {
                            latexExpression.expression += OPERATOR_TEXT.CSC + OPERATOR_TEXT.OPEN_BRACKET +
                                latexArray[0].expression + OPERATOR_TEXT.CLOSE_BRACKET;
                        }
                        return latexExpression;

                    case '\\customFunc':
                        latexExpression.expression += rootNode.value + ' of ' + OPERATOR_TEXT.OPEN_BRACKET +
                            latexArray[0].expression + OPERATOR_TEXT.CLOSE_BRACKET;
                        return latexExpression;

                    case '\\cos':
                    case '\\tan':
                    case '\\sec':
                    case '\\cot':
                    case '\\sinh':
                    case '\\cosh':
                    case '\\tanh':
                    case '\\csch':
                    case '\\sech':
                    case '\\coth':
                    case '\\ceil':
                    case '\\floor':
                    case '\\round':
                    case '\\exp':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression.expression += rootNode.name.substring(1) + ' of ' + latexArray[0].expression;
                        } else {
                            latexExpression.expression += rootNode.name.substring(1) + ' of ' + OPERATOR_TEXT.OPEN_BRACKET +
                                latexArray[0].expression + OPERATOR_TEXT.CLOSE_BRACKET;
                        }
                        return latexExpression;

                    case '\\abs':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression.expression += OPERATOR_TEXT.ABS + latexArray[0].expression;
                        } else {
                            latexExpression.expression += OPERATOR_TEXT.ABS + OPERATOR_TEXT.OPEN_BRACKET +
                                latexArray[0].expression + OPERATOR_TEXT.CLOSE_BRACKET;
                        }
                        return latexExpression;

                    case '\\arcsin':
                        latexExpression.expression += OPERATOR_TEXT.SIN_INV + latexArray[0].expression;
                        return latexExpression;

                    case '\\arccsc':
                        latexExpression.expression += OPERATOR_TEXT.CSC_INV + latexArray[0].expression;
                        return latexExpression;

                    case '\\arccos':
                    case '\\arctan':
                    case '\\arcsec':
                    case '\\arccot':
                        latexExpression.expression += OPERATOR_TEXT.INV + rootNode.name.replace('\\arc', '') + ' of ' + latexArray[0].expression;
                        return latexExpression;

                    case '!':
                        latexExpression.expression += latexArray[0].expression + OPERATOR_TEXT.FACTORIAL;
                        return latexExpression;

                    case '\\mod':
                    case '\\min':
                    case '\\max':
                    case '\\nCr':
                    case '\\nPr':
                    case '\\ncr':
                    case '\\npr':
                        latexExpression.expression += EquationEngine.TreeProcedures._getAccessibleName(rootNode.name) +
                            ' of ' + latexArray[0].expression + ' and ' + latexArray[1].expression;
                        return latexExpression;

                    case '\\sgn':
                    case '\\trunc':
                        latexExpression.expression += EquationEngine.TreeProcedures._getAccessibleName(rootNode.name) +
                            ' of ' + latexArray[0].expression;
                        return latexExpression;

                    case '\\mixedfrac':
                        latexExpression.expression += latexArray[0].expression + " and " + latexArray[1].expression +
                            " divided by " + latexArray[2].expression;
                        return latexExpression;

                    case '\\prod':
                    case '\\sum':
                        latexExpression.expression += rootNode.name.replace('\\', '') + ' from ' + latexArray[0].expression + ' equal to ';
                        if (rootNode.params[1].isTerminal) {
                            latexExpression.expression += latexArray[1].expression;
                        } else {
                            latexExpression.expression += OPERATOR_TEXT.OPEN_BRACKET + latexArray[1].expression + OPERATOR_TEXT.CLOSE_BRACKET;
                        }
                        latexExpression.expression += ' to ';
                        if (rootNode.params[2].isTerminal) {
                            latexExpression.expression += latexArray[2].expression;
                        } else {
                            latexExpression.expression += OPERATOR_TEXT.OPEN_BRACKET + latexArray[2].expression + OPERATOR_TEXT.CLOSE_BRACKET;
                        }
                        latexExpression.expression += ' of ';
                        latexExpression.expression += latexArray[3].expression;
                        return latexExpression;

                    case '\\%':
                        latexExpression.expression += latexArray[0].expression + OPERATOR_TEXT.PERCENT;
                        return latexExpression;
                }
            }
        },

        "_DECIMAL_POINT": '.',

        "_getAccessibleStringForNumber": function(number) {
            var returnString = '',
                numberString,
                returnStringLength,
                stringLength,
                charCounter,
                decimalPointOccured = false,
                seperatorAddedCount = 0,
                MIN_STRING_LENGTH = 3,
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                splittedString;
            if (isNaN(number)) {
                return number;
            }
            numberString = number.toString();
            if (numberString.indexOf(EquationEngine.TreeProcedures._DECIMAL_POINT) !== -1) {
                splittedString = numberString.split(EquationEngine.TreeProcedures._DECIMAL_POINT);
                decimalPointOccured = true;
                numberString = splittedString[0];
            }
            stringLength = numberString.length;
            if (stringLength < 4) {
                return number;
            }
            for (charCounter = stringLength - 1; charCounter >= 0; charCounter--) {
                if (returnStringLength === MIN_STRING_LENGTH || returnStringLength > MIN_STRING_LENGTH && (returnStringLength - (MIN_STRING_LENGTH + seperatorAddedCount)) % MIN_STRING_LENGTH === 0) {
                    returnString = ',' + returnString;
                    seperatorAddedCount++;
                }
                returnString = numberString.charAt(charCounter) + returnString;
                returnStringLength = returnString.length;
            }
            if (decimalPointOccured) {
                returnString += EquationEngine.TreeProcedures._DECIMAL_POINT + splittedString[1];
            }
            return returnString;
        },

        "_getAccessibleName": function(functionName) {
            var Mapping = {
                "\\lcm": 'least common multiplier',
                "\\gcd": 'greatest common divisor',
                "\\mod": 'modulas',
                "\\min": 'minimum',
                "\\max": 'maximum',
                "\\sgn": 'sign',
                "\\trunc": 'truncated value',
                "\\nCr": 'combinations',
                "\\nPr": 'permutations',
                "\\ceil": 'ceil value',
                "\\floor": 'floor value',
                "\\round": 'rounded value',
                "\\abs": 'absolute value',
                "\\exp": 'exponential value'
            };
            if (Mapping[functionName] === void 0) {
                return '';
            }
            return Mapping[functionName];
        },

        /**
        Clone the Tree node or terminal.

        @method _clone
        @private
        @param nodeOrTerminal{Object}
        @return Void
        @static
        **/
        "_clone": function(nodeOrTerminal) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                clone,
                paramCounter;
            if (nodeOrTerminal.isTerminal) {
                clone = EquationEngine.TreeProcedures._getParseTreeTerminalObject(void 0, nodeOrTerminal.type, nodeOrTerminal.sign, nodeOrTerminal.units);
                clone.isEmpty = nodeOrTerminal.isEmpty;
                clone.constantSubstituted = nodeOrTerminal.constantSubstituted;
                clone.irrational = nodeOrTerminal.irrational;
                clone.value = nodeOrTerminal.value;
            } else {
                clone = EquationEngine.TreeProcedures._getParseTreeNodeObject(void 0, nodeOrTerminal.name, nodeOrTerminal.sign, void 0);
                for (paramCounter = 0; paramCounter < nodeOrTerminal.params.length; paramCounter++) {
                    clone._addParam(EquationEngine.TreeProcedures._clone(nodeOrTerminal.params[paramCounter]));
                }
                clone.allTermsDigits = nodeOrTerminal.allTermsDigits;
                clone.isEmpty = nodeOrTerminal.isEmpty;
                if (nodeOrTerminal.name === "\\customFunc") {
                    clone.value = nodeOrTerminal.value;
                }
            }
            return clone;
        },

        /**

        Converts the equation left root to a solvable form Ax^2 + Bx + C. This function assumes that equation data passed has the left root ready that is equation is parsed and converted in tree form.

        @method convertToSolvableForm
        @private
        @param equationData{Object}
        @return Void
        @static
        **/
        "convertToSolvableForm": function(equationData) {
            var possibleFunctionVariables,
                functionVariable, solution,
                paramVariable, interceptPoints,
                transposeFuncVar,
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                transposeParamVar,
                supportParamVar = equationData.getSupportedParamVar();

            if (!supportParamVar) {
                supportParamVar = 'x';
            }
            functionVariable = equationData.getFunctionVariable();
            paramVariable = equationData.getParamVariable();
            possibleFunctionVariables = equationData.getPossibleFunctionVariables();

            if (possibleFunctionVariables.length > 1 && equationData.getHasCoefficient()) {
                if (functionVariable === 'y') {
                    transposeFuncVar = supportParamVar;
                    transposeParamVar = 'y';
                } else {
                    transposeFuncVar = 'y';
                    transposeParamVar = supportParamVar;
                }
                equationData.setParamVariable(transposeParamVar);
                equationData.setFunctionVariable(transposeFuncVar);
                this.convertToSolvableFormForPreferredFunctionVariable(equationData, transposeFuncVar, transposeParamVar, true);

                EquationEngine.Parser.processTokensWithRules(equationData);
                if (!equationData.isCanBeSolved()) {
                    return void 0;
                }
                EquationEngine.Parser.generateTreeFromRules(equationData);

                equationData.setParamVariable(paramVariable);
                equationData.setFunctionVariable(functionVariable);
            }


            this.convertToSolvableFormForPreferredFunctionVariable(equationData, functionVariable, paramVariable, false);

            //in this case compute the solutions of the equation
            if (equationData.getSpecie() === 'linear' || equationData.getSpecie() === 'quadratic') {
                solution = MathUtilities.Components.EquationEngine.Models.TreeProcedures.solveEquation(equationData);
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.info, '%c INFO%c: finding solutions for equation ' +
                    solution, [EquationEngine.Parser._BLUE_STYLE, void 0]);
            }
            if (equationData.getSaveIntercepts()) {
                interceptPoints = this._getInterceptsForEquationData(equationData);
                equationData.setInterceptPoints(interceptPoints);
                EquationEngine.Parser._showIntercepts(equationData);
            }
        },
        /**

        Converts the equation left root to a solvable form Ax^2 + Bx + C. This function assumes that equation data passed has the leftroot ready that is equation is parsed and converted in tree form.
        @method convertToSolvableForm
        @private
        @param equationData{Object} equation data model object
        @param functionVariable{String} equation function variable
        @param paramVariable{Object} equation pram variable
        @param hasTransposeFunction{Boolean} flag denoting whether to calculate transpose function
        @return void
        @static
        **/
        "convertToSolvableFormForPreferredFunctionVariable": function(equationData, functionVariable, paramVariable, hasTransposeFunction) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                rootNode = equationData.getLeftRoot(),
                temp,
                tempParam,
                A,
                B,
                C,
                allParams,
                secondDegreeParams,
                firstDegreeParams,
                zeroDegreeParams,
                powerTerm,
                fVarTerm,
                powerDegreeTerm,
                AX2,
                BX,
                i,
                quadraticParams,
                numberOfValidParams,
                lastProperParam;
            rootNode.expand(functionVariable, equationData);

            if (equationData.getHasCoefficient() && equationData.getPossibleFunctionVariables().length === 2 && !hasTransposeFunction) {
                equationData.setCoefficients({});
                this._getCoefficientsForEquation(rootNode, equationData);
            }

            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common,
                '%c[STAGE6 - Complete]' + 'Expansion Complete', [EquationEngine.Parser._YSTYLE]);
            if (!EquationEngine.Parser._deploy) {
                EquationEngine.Parser._printLatex(rootNode, 6, true);
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[CHECKPOINT]' + ' after expansion... ' +
                    EquationEngine.TreeProcedures._toLatex(rootNode), [EquationEngine.Parser._BLUE_STYLE]);
            }

            if (!rootNode.isTerminal && rootNode.name === '+') {
                allParams = EquationEngine.TreeProcedures._extractAllParams(rootNode);
            } else {
                //single segregation index
                allParams = [EquationEngine.TreeProcedures._clone(rootNode)];
                EquationEngine.TreeProcedures._removeAllParams(rootNode);
                //not converting root node here...it will be converted later depending on number of params
            }

            secondDegreeParams = [];
            firstDegreeParams = [];
            zeroDegreeParams = [];

            while (allParams.length > 0) {
                temp = EquationEngine.TreeProcedures._getFunctionVariableSegregationIndex(allParams[0], functionVariable);

                if (temp === void 0) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[FAIL - STAGE7]' + 'CANT CONVERT THIS EQUATION TO SOLVABLE FORM>>> SOMETHING IS WRONG', [EquationEngine.Parser._NSTYLE]);
                    return void 0;
                }
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.convert2q, 'Segregation index is ' + temp, []);

                switch (temp) {
                    case 2:
                        tempParam = allParams.shift();
                        EquationEngine.TreeProcedures._commonOutFunctionVariable(tempParam, functionVariable);
                        secondDegreeParams.push(tempParam);
                        break;

                    case 1:
                        tempParam = allParams.shift();
                        EquationEngine.TreeProcedures._commonOutFunctionVariable(tempParam, functionVariable);
                        firstDegreeParams.push(tempParam);
                        break;

                    case 0:
                        zeroDegreeParams.push(allParams.shift());
                        break;

                    default:
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[FAIL - STAGE7]' +
                            'CANT CONVERT THIS EQUATION TO SOLVABLE FORM>>> SOMETHING IS WRONG', [EquationEngine.Parser._NSTYLE]);
                        return void 0;
                }
            }

            //for all params that are separate
            //Ax^2 + Bx + C = 0 form

            //AX2
            if (secondDegreeParams.length > 0) {
                AX2 = EquationEngine.TreeProcedures._getParseTreeNodeObject(void 0, '\\cdot', '+', void 0);
                //x^2
                powerTerm = EquationEngine.TreeProcedures._getParseTreeNodeObject(AX2, '^', '+', void 0);

                fVarTerm = EquationEngine.TreeProcedures._getParseTreeTerminalObject(powerTerm, 'var', '+');
                fVarTerm.value = functionVariable;

                powerDegreeTerm = EquationEngine.TreeProcedures._getParseTreeTerminalObject(powerTerm, 'digit', '+');
                powerDegreeTerm.value = 2;

                if (secondDegreeParams.length > 1) {
                    A = EquationEngine.TreeProcedures._getParseTreeNodeObject(AX2, '+', '+', void 0);

                    while (secondDegreeParams.length > 0) {
                        A._addParam(secondDegreeParams.shift());
                    }
                } else {
                    A = secondDegreeParams.shift();
                    AX2._addParam(A);
                }

                if (!A.isTerminal) {
                    A.simplify(equationData);
                }
            }

            //BX
            if (firstDegreeParams.length > 0) {
                BX = EquationEngine.TreeProcedures._getParseTreeNodeObject(void 0, '\\cdot', '+', void 0);
                fVarTerm = EquationEngine.TreeProcedures._getParseTreeTerminalObject(BX, 'var', '+');
                fVarTerm.value = functionVariable;
                if (firstDegreeParams.length > 1) {
                    B = EquationEngine.TreeProcedures._getParseTreeNodeObject(BX, '+', '+', void 0);
                    while (firstDegreeParams.length > 0) {
                        B._addParam(firstDegreeParams.shift());
                    }

                } else {
                    B = firstDegreeParams.shift();
                    BX._addParam(B);
                }
                if (!B.isTerminal) {
                    B.simplify(equationData);
                }
            }
            if (zeroDegreeParams.length > 0) {

                if (zeroDegreeParams.length > 1) {
                    C = EquationEngine.TreeProcedures._getParseTreeNodeObject(void 0, '+', '+', void 0);

                    while (zeroDegreeParams.length > 0) {
                        C._addParam(zeroDegreeParams.shift());
                    }

                } else {
                    C = zeroDegreeParams.shift();
                }

                if (!C.isTerminal) {
                    C.simplify(equationData);
                }
            } else {
                C = EquationEngine.TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', '+', equationData.getUnits());
                C.value = 0;
            }
            quadraticParams = [AX2, BX, C];
            numberOfValidParams = 0;
            for (i = 0; i < quadraticParams.length; i++) {
                if (quadraticParams[i] !== void 0) {
                    numberOfValidParams++;
                    lastProperParam = quadraticParams[i];
                }
            }

            if (numberOfValidParams > 0) {
                EquationEngine.TreeProcedures._convertTreeNodeTo(rootNode, '+');

                for (i = 0; i < quadraticParams.length; i++) {
                    if (quadraticParams[i] !== void 0) {
                        rootNode._addParam(quadraticParams[i]);
                    }
                }

            } else {
                EquationEngine.TreeProcedures._convertTreeNodeTo(rootNode, lastProperParam);
            }
            equationData.setA(A);
            equationData.setB(B);
            equationData.setC(C);

            if (hasTransposeFunction) {
                equationData.setTransposeFunctionCode(EquationEngine.TreeProcedures._getMobileFunction(equationData));
            }
            equationData.setFunctionCode(EquationEngine.TreeProcedures._getMobileFunction(equationData));
            equationData.setParamVariableOrder(equationData.getA() !== void 0 ? 2 : 1);

            if (A !== void 0) {
                if (!EquationEngine.Parser._deploy) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'A:' + EquationEngine.TreeProcedures._toLatex(A), []);
                }
            } else {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'A:undefined', []);
            }

            if (B !== void 0) {
                if (!EquationEngine.Parser._deploy) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'B:' + EquationEngine.TreeProcedures._toLatex(B), []);
                }
            } else {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'B:undefined', []);
            }

            if (C !== void 0) {
                if (!EquationEngine.Parser._deploy) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'C:' + EquationEngine.TreeProcedures._toLatex(C), []);
                }
            } else {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'C:undefined', []);
            }

            if (!EquationEngine.Parser._deploy) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[STAGE7 - SUCCESS]' +
                    'Converted to quadratic form ' + EquationEngine.TreeProcedures._toLatex(rootNode), [EquationEngine.Parser._YSTYLE]);
            }

            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, equationData, []);
            if (!EquationEngine.Parser._deploy) {
                EquationEngine.Parser._printLatex(rootNode, 7, false);
            }

        },
        "_getCoefficientsForEquation": function(rootNode, equationData) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                coeffObjectArray, rootNodeParamLength, coeffObjLength,
                variableExpression, currentElement, isConstantTermPresent = false,
                termSign = '+',
                paramCount,
                supportParamVar = equationData.getSupportedParamVar();
            if (!supportParamVar) {
                supportParamVar = 'x';
            }
            if (rootNode.isTerminal) {
                if (rootNode.type === 'var' && rootNode.parentNode.name === '+') {
                    this._saveCoefficient([1, rootNode.value], equationData, rootNode.sign);
                }
                return rootNode.value;
            }
            coeffObjectArray = [];
            rootNodeParamLength = rootNode.params.length;
            for (paramCount = 0; paramCount < rootNodeParamLength; paramCount++) {
                coeffObjectArray.push(EquationEngine.TreeProcedures._getCoefficientsForEquation(rootNode.params[paramCount], equationData));
            }
            variableExpression = '';
            switch (rootNode.name) {
                case '^':
                    variableExpression += coeffObjectArray[0] + '^' + coeffObjectArray[1];
                    if (rootNode.params[0].isTerminal && rootNode.params[0].type === 'var' && rootNode.parentNode.name === '+') {
                        this._saveCoefficient([1, variableExpression], equationData, rootNode.sign);
                    }
                    return variableExpression;
                case '+':
                    variableExpression += coeffObjectArray[0];
                    coeffObjLength = coeffObjectArray.length;
                    for (paramCount = 1; paramCount < coeffObjLength; paramCount++) {
                        currentElement = coeffObjectArray[paramCount];
                        variableExpression += '+' + coeffObjectArray[paramCount];
                        if (typeof currentElement === 'number' || currentElement.indexOf(supportParamVar) === -1 && currentElement.indexOf('y') === -1) {
                            this._saveConstantTerm(equationData, currentElement);
                            isConstantTermPresent = true;
                        }
                    }
                    if (!isConstantTermPresent) {
                        equationData.setConstantTerm('0');
                    }
                    return variableExpression;
                case '\\cdot':
                    variableExpression += coeffObjectArray[0];
                    coeffObjLength = coeffObjectArray.length;
                    for (paramCount = 1; paramCount < coeffObjLength; paramCount++) {
                        //rootNode check for x=y equation
                        if (rootNode.params[paramCount].sign === '-' || rootNode.sign === '-') {
                            termSign = '-';
                        }
                        variableExpression += '\\cdot ' + coeffObjectArray[paramCount];
                    }
                    this._saveCoefficient(coeffObjectArray, equationData, termSign);
                    return variableExpression;
                default:
                    return variableExpression;
            }
        },
        "_saveCoefficient": function(objArray, equationData, sign) {
            var length,
                coefficient = '',
                counter,
                raiseToTwo = '^2',
                coeffObj, currentElement, currentVariableTerm,
                variableString = '',
                supportParamVar = equationData.getSupportedParamVar();

            if (!supportParamVar) {
                supportParamVar = 'x';
            }
            length = objArray.length;
            coeffObj = equationData.getCoefficients();
            for (counter = 0; counter < length; counter++) {
                currentElement = objArray[counter];
                if (typeof currentElement === 'number' || currentElement.indexOf(supportParamVar) === -1 && currentElement.indexOf('y') === -1) {
                    if (typeof currentElement === 'number') {
                        if (sign === '+') {
                            coefficient = currentElement + coefficient;
                        } else {
                            coefficient = currentElement * -1 + coefficient;
                        }
                    } else {
                        coefficient += currentElement;
                    }
                } else {
                    if (variableString.indexOf(currentElement) === -1) {
                        variableString += currentElement;
                    } else {
                        variableString = variableString.replace(currentElement, currentElement + raiseToTwo);
                    }
                }
            }
            if (coeffObj[variableString]) {
                currentVariableTerm = coeffObj[variableString];
                if (!(isNaN(currentVariableTerm) || isNaN(coefficient))) {
                    coefficient = Number(currentVariableTerm) + Number(coefficient);
                } else {
                    coefficient = currentVariableTerm + '+' + coefficient.toString();
                }
            }
            if (coefficient === '') {
                if (sign === '+') {
                    coefficient = '1';
                } else {
                    coefficient = '-1';
                }
            }
            if (coefficient === 0 || coefficient === '0') {
                delete coeffObj[variableString];
            } else {
                coeffObj[variableString] = coefficient.toString();
            }
        },
        "_saveConstantTerm": function(equationData, currentElement) {
            if (isNaN(currentElement)) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('invalidConstantTerm');
            } else {
                equationData.setConstantTerm(currentElement);
            }
        },
        "_getInterceptsForEquationData": function(equationData) {
            var functionCode = equationData.getFunctionCode(),
                functionVariable = equationData.getFunctionVariable(),
                paramVariable = equationData.getParamVariable(),
                transposeFunctionCode = equationData.getTransposeFunctionCode(),
                engine,
                functionEngine,
                engine1,
                transposeEngine,
                constants = equationData.getConstants(),
                interceptPoints = [],
                order = equationData.getParamVariableOrder(),
                x,
                y;
            engine = new Function('param,constants,functions', functionCode);
            functionEngine = function eng1(param) {
                var soln = engine(param, constants, equationData.getFunctions());
                return soln[0];
            };
            if (transposeFunctionCode) {
                engine1 = new Function('param,constants,functions', transposeFunctionCode);
                transposeEngine = function eng2(param) {
                    var soln = engine1(param, constants, equationData.getFunctions());
                    return soln[0];
                };
                if (paramVariable === 'y') {
                    x = 0;
                    y = transposeEngine(x);
                } else {
                    y = 0;
                    x = transposeEngine(y);
                }
                interceptPoints.push({
                    "x": x,
                    "y": y
                });

                transposeEngine = function eng2(param) {
                    var soln = engine1(param, constants);
                    return soln[1];
                };
                if (paramVariable === 'y') {
                    x = 0;
                    y = transposeEngine(x);
                } else {
                    y = 0;
                    x = transposeEngine(y);
                }
                interceptPoints.push({
                    "x": x,
                    "y": y
                });
            }
            if (functionVariable === 'y') {
                x = 0;
                y = functionEngine(x);
            } else {
                y = 0;
                x = functionEngine(y);
            }
            interceptPoints.push({
                "x": x,
                "y": y
            });
            if (order === 2) {
                functionEngine = function eng1(param) {
                    var soln = engine(param, constants);
                    return soln[1];
                };
                if (functionVariable === 'y') {
                    x = 0;
                    y = functionEngine(x);
                } else {
                    y = 0;
                    x = functionEngine(y);
                }
                interceptPoints.push({
                    "x": x,
                    "y": y
                });
            }
            return interceptPoints;
        },
        "getInequalityFunctionCode": function(node, equationData) {
            if (node === void 0) {
                return '0';
            }
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                functionCode;

            functionCode = ' return ' + EquationEngine.TreeProcedures._toMobileFunction(node, equationData);

            if (functionCode.search('findFactorial') > -1) {
                functionCode = EquationEngine.MathFunctions.findFactorialString + functionCode;
            }
            if (functionCode.search('gammaFunction') > -1) {
                functionCode = EquationEngine.MathFunctions._gammaFunctionString + functionCode;
            }

            if (functionCode.search('sum') > -1) {
                functionCode = EquationEngine.MathFunctions.getSumString() + functionCode;
            }

            if (functionCode.search('prod') > -1) {
                functionCode = EquationEngine.MathFunctions.getProdString() + functionCode;
            }
            return functionCode;
        },

        "_getMobileFunction": function(equationData) {

            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                codeA,
                codeB,
                codeC,
                functionCode;

            if (equationData.getA() !== void 0) {
                codeA = EquationEngine.TreeProcedures._toMobileFunction(equationData.getA(), equationData);

            } else {
                codeA = 0;
            }

            if (equationData.getB() !== void 0) {
                codeB = EquationEngine.TreeProcedures._toMobileFunction(equationData.getB(), equationData);
            } else {
                codeB = 0;
            }
            if (equationData.getC() !== void 0) {
                codeC = EquationEngine.TreeProcedures._toMobileFunction(equationData.getC(), equationData);
            }
            functionCode = 'param===0?param=0:param=param;var solution,a = (' + codeA + '),b=(' + codeB + '), c=(' + codeC + ');solution = []; a !== 0 ? (solution[0] = (-b + Math.sqrt(b*b - 4*a*c))/(2*a),solution[1] = (-b - Math.sqrt(b*b - 4*a*c))/(2*a)) :(solution[0] = -c/b,solution[1] = solution[0]); return solution;';

            if (functionCode.search('findFactorial') > -1) {
                functionCode = EquationEngine.MathFunctions.findFactorialString + functionCode;

            }
            if (functionCode.search('gammaFunction') > -1) {
                functionCode = EquationEngine.MathFunctions._gammaFunctionString + functionCode;
            }

            if (functionCode.search('sum') > -1) {
                functionCode = EquationEngine.MathFunctions.getSumString() + functionCode;
            }

            if (functionCode.search('prod') > -1) {
                functionCode = EquationEngine.MathFunctions.getProdString() + functionCode;
            }
            return functionCode;

        },


        "_toMobileFunction": function(node, equationData, pivotConstant) {
            if (node === void 0) {
                return void 0;
            }
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                myCode = '',
                childCode,
                pivot,
                functionName,
                inputAngleCode,
                outputAngleCode,
                paramCount;

            if (node.isTerminal) {
                if (node.type === 'var') {
                    if (node.value === equationData.getParamVariable()) {
                        return node.sign === '-' ? '(param*-1)' : 'param';
                    }
                } else if (node.type === 'const') {
                    switch (node.value) {
                        case "\\pi":
                            myCode = "Math.PI";
                            break;
                        case "e":
                            myCode = "Math.E";
                            break;
                        case '\\theta':
                            myCode = 'constants["\\\\theta"]';
                            break;
                        default:
                            if (pivotConstant && pivotConstant === node.value) {
                                myCode = node.value;
                            } else {
                                myCode = 'constants[\'' + node.value + '\']';
                            }
                    }
                } else {
                    myCode = node.value;
                }
            } else {
                childCode = [];
                pivot = pivotConstant;

                if (node.name === '\\sum' || node.name === '\\prod') {
                    pivot = node.params[0].value;
                }
                for (paramCount = 0; paramCount < node.params.length; paramCount++) {
                    childCode[paramCount] = EquationEngine.TreeProcedures._toMobileFunction(node.params[paramCount], equationData, pivot);
                }

                if (equationData.getUnits().angle === 'rad') {
                    inputAngleCode = 'angle=' + childCode[0] + ',';
                    outputAngleCode = '';
                } else {
                    inputAngleCode = 'angle=' + childCode[0] + ',angle = angle*Math.PI /180,';
                    outputAngleCode = ',angle = angle*180/Math.PI';
                }

                switch (node.name) {
                    case "+":
                        functionName = "+";
                        myCode = childCode[0];

                        for (paramCount = 1; paramCount < childCode.length; paramCount++) {
                            myCode += functionName + childCode[paramCount];
                        }
                        break;

                    case "\\cdot":
                        functionName = "*";
                        myCode = childCode[0];

                        for (paramCount = 1; paramCount < childCode.length; paramCount++) {
                            myCode += functionName + childCode[paramCount];
                        }
                        break;

                    case "\\customFunc":
                        myCode = "functions['" + node.value + "'](" + childCode[0] + ")";
                        break;

                    case "^":
                    case "pow":
                        //reverted to old logic by shashank because it was giving error for following graph
                        myCode = "raised=0,absBase=0,sign=0,num=" + childCode[0] + ",pow=" + childCode[1] + ",num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)";
                        break;

                    case '\\frac':
                        myCode = childCode[0] + '\/' + childCode[1];
                        break;

                    case '\\sqrt':
                        myCode = "num=(" + childCode[1] + "),pow = " + childCode[0] + ",result=(isFinite(num)&&isFinite(pow)&&pow%2===0&&num<0)?NaN:pow<0?(1/Math.pow(Math.abs(num),(1/-pow))):Math.pow(Math.abs(num),1/pow),num<0?result*-1:result";
                        break;

                    case '\\ln':
                        myCode = 'Math.log(' + childCode[0] + ')';
                        break;

                    case '\\log':
                        myCode = 'Math.log(' + childCode[0] + ')/Math.LN10';
                        break;
                    case '\\log_':
                        myCode = 'Math.log(' + childCode[1] + ')/Math.log(' + childCode[0] + ')';
                        break;

                        //TRIAGNOMETRIC FUNC
                    case '\\sin':
                    case '\\cos':
                        myCode = inputAngleCode + '(result=(Number)(' + EquationEngine.TreeProcedures.getMathFunction(node.name) + '(angle)),result===0?0:result)';
                        break;


                    case '\\tan':
                        myCode = inputAngleCode + "(result=(Number)(Math.sin(angle)),result===0?0:result)/(result=(Number)(Math.cos(angle)),result===0?0:result)";
                        break;
                    case '\\sec':
                        myCode = inputAngleCode + '1/(result=(Number)(Math.cos(angle)),result===0?0:result)';
                        break;

                    case '\\csc':
                        myCode = inputAngleCode + '1/(result=(Number)(Math.sin(angle)),result===0?0:result)';
                        break;
                    case '\\cot':
                        myCode = inputAngleCode + '(result=(Number)(Math.cos(angle)),result===0?0:result)/(result=(Number)(Math.sin(angle)),result===0?0:result)';
                        break;

                        //HYPERBOLIC FUNC
                    case "\\sinh":
                        myCode = inputAngleCode + "(Math.pow(Math.E, angle) - Math.pow(Math.E, -angle)) / 2";
                        break;

                    case "\\cosh":
                        myCode = inputAngleCode + "(Math.pow(Math.E, angle) + Math.pow(Math.E, -angle)) / 2";
                        break;

                    case '\\tanh':
                        myCode = inputAngleCode + "Math.pow(Math.E, 2 * angle) - 1) / (Math.pow(Math.E, 2 * angle) + 1";
                        break;

                    case '\\csch':
                        myCode = inputAngleCode + "2 / (Math.pow(Math.E, angle) - Math.pow(Math.E, -angle))";
                        break;

                    case '\\sech':
                        myCode = inputAngleCode + "2 / (Math.pow(Math.E, angle) + Math.pow(Math.E, -angle))";
                        break;

                    case '\\coth':
                        myCode = inputAngleCode + "Math.pow(Math.E, 2 * angle) + 1) / (Math.pow(Math.E, 2 * angle) - 1";
                        break;

                        //ARC FUNC
                    case '\\arcsin':
                        myCode = 'angle = ' + childCode[0] + ',angle = Math.asin(angle)' + outputAngleCode;
                        break;

                    case '\\arccos':
                        myCode = 'angle = ' + childCode[0] + ',angle = Math.acos(angle)' + outputAngleCode;
                        break;

                    case '\\arctan':
                        myCode = 'angle = ' + childCode[0] + ',angle = Math.atan(angle)' + outputAngleCode;
                        break;

                    case '\\arccsc':
                        myCode = 'angle = ' + childCode[0] + ',angle = Math.asin(1/angle)' + outputAngleCode;
                        break;

                    case '\\arcsec':
                        myCode = 'angle = ' + childCode[0] + ',angle = Math.acos(1/angle)' + outputAngleCode;
                        break;
                    case '\\arccot':
                        myCode = 'angle = ' + childCode[0] + ',angle = Math.PI/2 - Math.atan(angle)' + outputAngleCode;
                        break;

                    case '\\arsinh':
                        myCode = 'num = ' + childCode[0] + ',Math.log(num + Math.pow(num*num + 1 ,1/2))';
                        break;
                    case '\\arcosh':
                        myCode = 'num = ' + childCode[0] + ',Math.log(Math.pow(num*num - 1 ,1/2))';
                        break;

                    case '\\artanh':
                        myCode = 'num = ' + childCode[0] + ',Math.pow(num*num - 1 ,1/2)';
                        break;

                    case '\\arcsch':
                        myCode = 'num = ' + childCode[0] + ',1/num + Math.sqrt(1/(num*num + 1))';
                        break;

                    case '\\arsech':
                        myCode = 'num = ' + childCode[0] + ',1/num + Math.sqrt(1/(num*num - 1))';
                        break;
                    case '\\arcoth':
                        myCode = 'num = ' + childCode[0] + ',0.5* Math.log((num+1)/(num-1))';
                        break;

                    case "!":
                        myCode = "num = " + childCode[0] + ",num<0?NaN:num>170||!isFinite(num)?Infinity:num === 0?1:num%1===0 && num > 0?(findFactorial(num)):num*gammaFunction(num)";
                        break;
                    case '\\ceil':
                        myCode = 'Math.ceil(' + childCode[0] + ')';
                        break;
                    case '\\floor':
                        myCode = 'Math.floor(' + childCode[0] + ')';
                        break;
                    case '\\trunc':
                        myCode = childCode[0] + ',(num > 0) ? Math.floor(num) : Math.ceil(num)';
                        break;

                    case '\\mixedfrac':
                        myCode = 'isMinus=1, num0=' + childCode[0] + ',num1=' + childCode[1] + ',num2=' + childCode[2] + ', num0<0?isMinus=-1, num0 % 1 !==0 || num1 >= num2 ? NaN : (num0 * num2 + num1) * isMinus / num2';
                        break;
                    case '\\sgn':
                        myCode = 'num = ' + childCode[0] + ',(num === 0) ? 0 : (num > 0) ? 1 : -1';
                        break;
                    case '\\round':
                        myCode = 'Math.round(' + childCode[0] + ')';
                        break;
                    case '\\abs':
                        myCode = 'Math.abs(' + childCode[0] + ')';
                        break;
                    case '\\min':
                        myCode = 'Math.min(' + childCode[0] + ',' + childCode[1] + ')';
                        break;
                    case '\\max':
                        myCode = 'Math.max(' + childCode[0] + ',' + childCode[1] + ')';
                        break;
                    case '\\mod':
                        myCode = 'num0=' + childCode[0] + ',num1=' + childCode[1] + ',num1===0?NaN:num0>0 === num1>0?num0%num1:num1+num0%num1';
                        break;

                    case '\\nCr':
                    case '\\ncr':
                        myCode = 'num0=' + childCode[0] + ',num1=' + childCode[1] + ',isFinite(num0)!==true||isFinite(num1)!==true?NaN:num0<0||num1<0?0:(num0 = Math.floor(Math.abs(num0)),num1 = Math.floor(Math.abs(num1)),num0<num1?0:findFactorial(num0)/(findFactorial(num1) * findFactorial(num0 - num1)))';
                        break;

                    case '\\nPr':
                        myCode = 'num0=' +
                            childCode[0] +
                            ',num1=' + childCode[1] +
                            ',isFinite(num0)!==true||isFinite(num1)!==true?NaN:num0<0||num1<0?0:(num0 = Math.floor(Math.abs(num0)),num1 = Math.floor(Math.abs(num1)),num0<num1?0:findFactorial(num0)/findFactorial(num0 - num1))';
                        break;

                    case '\\exp':
                        myCode = 'Math.exp(' + childCode[0] + ')';
                        break;

                    case '\\sum':
                        childCode[3] = EquationEngine.TreeProcedures.handleMultipleSumProd(childCode[3]);
                        myCode = 'sum(\"' + node.params[0].value + '\",\"' + childCode[1] + '\",\"' + childCode[2] + '\",\"' + childCode[3] + '\",param,constants,functions)';
                        break;

                    case '\\prod':
                        childCode[3] = EquationEngine.TreeProcedures.handleMultipleSumProd(childCode[3]);
                        myCode = 'prod(\"' + node.params[0].value + '\",\"' + childCode[1] + '\",\"' + childCode[2] + '\",\"' + childCode[3] + '\",param,constants,functions)';
                        break;

                    default:
                        myCode = 0;
                }

            }

            if (node.sign === "-") {
                myCode = '-(' + myCode + ')';
            } else {
                myCode = "(" + myCode + ")";
            }
            return myCode;
        },
        "handleMultipleSumProd": function(childCode) {
            // replaced " with \" to avoid conflicts with other string on function call in multiple sum-prod cases
            if (childCode.indexOf('"') !== -1) {
                childCode = childCode.replace(/\"/g, '\\"');
            }
            return childCode;
        },
        "getMathFunction": function(func) {
            switch (func) {
                case '\\sin':
                    return 'Math.sin';

                case '\\cos':
                    return 'Math.cos';

                case '\\tan':
                    return 'Math.tan';
            }
        },

        /**

        Solves the equation from equationData that is in Ax^2 + Bx + C = 0 form

        @method solveEquation
        @private
        @param equationData {Object}
        @param paramValue {Number}
        @static
        **/
        "solveEquation": function(equationData, paramValue) {
            return MathUtilities.Components.EquationEngine.Models.TreeProcedures._solveCartesian(equationData, paramValue);
        },
        "getCloneOf": function(obj) {

            if (!obj) {
                return obj;
            }
            if (obj.clone) {
                return obj.clone();
            }
            if (obj === null || typeof obj !== "object") {
                return obj;
            }
            var copy, attr;
            copy = obj.constructor();
            for (attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = obj[attr];
                }
            }
            return copy;
        },

        "changeVarsAsConstants": function(node, varsToChange) {
            if (node === void 0) {
                return void 0;
            }
            if (node.isTerminal) {
                if (node.type === 'var' && varsToChange.indexOf(node.value) !== -1) {
                    node.type = 'const';
                }
            } else {
                var nodeChildren = node.params,
                    nodeChildrenLength = nodeChildren.length,
                    EquationEngine = MathUtilities.Components.EquationEngine.Models,
                    childCounter;
                for (childCounter = 0; childCounter < nodeChildrenLength; childCounter++) {
                    EquationEngine.TreeProcedures.changeVarsAsConstants(node.params[childCounter], varsToChange);
                }
            }
        },

        /**

        Solves the equation from equationData that is in Ax^2 + Bx + C = 0 form

        @method solveEquation
        @private
        @param equationData {Object}
        @param paramValue {Number}

        @static
        **/
        "_solveCartesian": function(equationData, paramValue) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                valueA,
                valueB,
                valueC,
                solution1,
                solution2,
                A = equationData.getA(),
                B = equationData.getB(),
                C = equationData.getC(),
                equationConstants = equationData.getConstants(),
                equationParamVariable = equationData.getParamVariable(),
                functionVariable = equationData.getFunctionVariable(),
                range = equationData.getRange(),
                isInRange,
                discriminant;

            if (EquationEngine.Parser._debugFlag.solve) {

                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'For paramValue = ' + paramValue, []);
            }

            if (A !== void 0) {
                valueA = EquationEngine.TreeProcedures._substituteParamVariableAndGetValue(A, equationConstants, equationParamVariable, paramValue, equationData);
            }

            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.solve, 'A=' + valueA, []);

            if (B !== void 0) {
                valueB = EquationEngine.TreeProcedures._substituteParamVariableAndGetValue(B, equationConstants, equationParamVariable, paramValue, equationData);
            }
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.solve, 'B=' + valueB, []);

            if (C !== void 0) {
                if (!EquationEngine.Parser._deploy) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.convert2q, 'C is ' + EquationEngine.TreeProcedures._toLatex(C), []);
                }
                valueC = EquationEngine.TreeProcedures._substituteParamVariableAndGetValue(C, equationConstants, equationParamVariable, paramValue, equationData);
            }
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.solve, 'C=' + valueC, []);

            if (valueA === void 0) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.convert2q, 'cant use quadratic formula since a = 0', []);
                if (valueB === void 0) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[FAIL - STAGE7]' +
                        'Cant process this equation', [EquationEngine.Parser._NSTYLE]);
                    return void 0;
                }
                if (valueC === void 0) {
                    solution1 = solution2 = void 0;
                } else {
                    solution1 = solution2 = -valueC / valueB;
                }
            } else {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.convert2q, 'Using quadratic formula since a != 0', []);
                if (valueB === void 0) {
                    valueB = 0;
                }
                if (valueC === void 0) {
                    valueC = 0;
                }
                discriminant = valueB * valueB - 4 * valueA * valueC;
                if (discriminant < 0) {
                    solution1 = solution2 = 'undefined';
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.convert2q, 'Solution is complex', []);
                    return [solution1, solution2];
                } else {
                    solution1 = (-valueB + Math.sqrt(discriminant)) / (2 * valueA);
                    if (discriminant === 0) {
                        solution2 = solution1;
                    } else {
                        solution2 = (-valueB - Math.sqrt(discriminant)) / (2 * valueA);
                    }
                }
            }
            solution1 = Number(solution1);
            solution2 = Number(solution2);
            if (range && equationData.getInEqualityType() === 'equal') {
                if (isNaN(solution1) && isNaN(solution2)) {
                    equationData.setRange(null);
                    return [Number(solution1), Number(solution2)];
                }
                if (range.variable !== null) {
                    if (range.variable === functionVariable) {
                        isInRange = EquationEngine.TreeProcedures.checkIfWithinRange(range, solution1);
                        if (!isInRange) {
                            solution1 = 'undefined';
                        }
                        isInRange = EquationEngine.TreeProcedures.checkIfWithinRange(range, solution2);
                        if (!isInRange) {
                            solution2 = 'undefined';
                        }
                        return [solution1, solution2];
                    } else if (equationData.getIsTableEquation() && range.variable === equationParamVariable) {
                        isInRange = EquationEngine.TreeProcedures.checkIfWithinRange(range, solution1);
                        if (!isInRange) {
                            solution1 = 'undefined';
                        }
                        isInRange = EquationEngine.TreeProcedures.checkIfWithinRange(range, solution2);
                        if (!isInRange) {
                            solution2 = 'undefined';
                        }
                    } else {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('InvalidRange');
                        return void 0;
                    }
                }
                if (range.rangeForFunctionVariable && range.rangeForFunctionVariable.variable !== null) {
                    if (range.rangeForFunctionVariable.variable === functionVariable) {
                        isInRange = EquationEngine.TreeProcedures.checkIfWithinRange(range.rangeForFunctionVariable, solution1);
                        if (!isInRange) {
                            solution1 = 'undefined';
                        }
                        isInRange = EquationEngine.TreeProcedures.checkIfWithinRange(range.rangeForFunctionVariable, solution2);
                        if (!isInRange) {
                            solution2 = 'undefined';
                        }
                    } else if (equationData.getIsTableEquation()) {
                        isInRange = EquationEngine.TreeProcedures.checkIfWithinRange(range.rangeForFunctionVariable, solution1);
                        if (!isInRange) {
                            solution1 = 'undefined';
                        }
                        isInRange = EquationEngine.TreeProcedures.checkIfWithinRange(range.rangeForFunctionVariable, solution2);
                        if (!isInRange) {
                            solution2 = 'undefined';
                        }
                    } else {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('InvalidRange');
                        return void 0;
                    }
                }
            }
            return [solution1, solution2];
        },

        /**
        Function that substitutes value of param variable and so that we can find values of A, B, C and find the roots of equation.


        @method _substituteParamVariableAndGetValue
        @private
        @param term {Object} Node root of A or B or C term from the equation Ax^2 + Bx + C = 0
        @param constants {Object} Object of constant values used in equation
        @param fVar {String} name of the param variable
        @param fValue {Number} value of param variable
        @param equationData {Object} equation data model object
        @return {Integer} value of the term with param variable substituted
        @static
        **/
        "_substituteParamVariableAndGetValue": function(term, constants, fVar, fValue, equationData) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                paramValues,
                value,
                signFactor,
                i,
                result,
                engine,
                sumRangeStart,
                sumRangeEnd,
                sumConstantCounter,
                range = equationData.getRange(),
                isInRange = true;
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.convert2q, 'Substituting param ' + fVar + ' with value ' + fValue, []);
            if (term.isTerminal) {
                if (term.type === 'digit') {
                    if (term.sign === '-') {
                        return -Number(term.value);
                    }
                    return Number(term.value);
                } else if (term.type === 'var') {
                    if (term.value === fVar) {
                        if (term.sign === '-') {
                            return -Number(fValue);
                        }
                        return Number(fValue);
                    } else {
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[FAIL-STAGE8]' + 'Unknown freevar occurred ' +
                            term.value, [EquationEngine.Parser._NSTYLE]);
                        return void 0;
                    }
                } else {
                    if (EquationEngine.Parser._constants[term.value] !== void 0) {
                        if (term.sign === '-') {
                            return -EquationEngine.Parser._constants[term.value];
                        }
                        return EquationEngine.Parser._constants[term.value];
                    }
                    if (constants[term.value] !== void 0) {
                        if (term.sign === '-') {
                            return -constants[term.value];
                        }
                        return constants[term.value];
                    }
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[FAIL-STAGE8]' +
                        'unsubstituted constant occurred ' + term.value, [EquationEngine.Parser._NSTYLE]);
                    return void 0;
                }
            }
            paramValues = [];
            signFactor = term.sign === '-' ? -1 : 1;
            switch (term.name) {
                case '\\sum':
                case '\\prod':
                    sumRangeStart = EquationEngine.TreeProcedures._substituteParamVariableAndGetValue(term.params[1], constants, fVar, fValue, equationData);
                    sumRangeEnd = EquationEngine.TreeProcedures._substituteParamVariableAndGetValue(term.params[2], constants, fVar, fValue, equationData);

                    if (!(isFinite(sumRangeEnd) && isFinite(sumRangeStart))) {
                        return void 0;
                    }
                    for (sumConstantCounter = sumRangeStart; sumConstantCounter <= sumRangeEnd; sumConstantCounter++) {
                        constants[term.params[0].value] = sumConstantCounter;
                        value = EquationEngine.TreeProcedures._substituteParamVariableAndGetValue(term.params[3], constants, fVar, fValue, equationData);
                        if (value === void 0) {
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[FAIL-STAGE8]' +
                                'Cant Calculate value of ' + term.name, [EquationEngine.Parser._NSTYLE]);
                            return void 0;
                        }
                        paramValues.push(value);
                    }
                    if (term.name === '\\sum') {
                        result = EquationEngine.TreeProcedures._mathFunctions.performMathematicalCalculations('+',
                            paramValues, EquationEngine.TreeProcedures._getUnits(term));
                    } else {
                        result = EquationEngine.TreeProcedures._mathFunctions.performMathematicalCalculations('\\cdot',
                            paramValues, EquationEngine.TreeProcedures._getUnits(term));
                    }
                    break;

                default:
                    for (i = 0; i < term.params.length; i++) {
                        value = EquationEngine.TreeProcedures._substituteParamVariableAndGetValue(term.params[i], constants, fVar, fValue, equationData);
                        if (value === void 0) {

                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[FAIL-STAGE8]' +
                                'Can not calculate value of ' + term.name, [EquationEngine.Parser._NSTYLE]);
                            return void 0;
                        }
                        paramValues.push(value);
                    }
                    if (term.name === '\\customFunc') {

                        engine = new Function('param,constants,functions', equationData.getCustomFunctions()[term.value]);
                        result = engine(paramValues[0], equationData.getConstants(), equationData.getFunctions())[0];
                        if (!result) {
                            result = NaN;
                        }

                    } else {
                        result = EquationEngine.TreeProcedures._mathFunctions.performMathematicalCalculations(term.name,
                            paramValues, EquationEngine.TreeProcedures._getUnits(term));
                    }
                    break;
            }
            if (result === null || isNaN(result)) {
                return result;
            }
            return signFactor * result;
        },

        "checkIfWithinRange": function(range, value) {
            var isInRange = true;
            if (range.max) {
                isInRange = !(range.max.value < value || !range.max.include && range.max.value === value);
            }
            if (isInRange && range.min) {
                isInRange = !(range.min.value > value || !range.min.include && range.min.value === value);
            }
            return isInRange;
        },

        /**

        Removes occurrences of functionVariable from the term. Eg. when functionVariable is 'x' it will convert (ax +bx) to (a + b); x to 1; y to y;

        @method _commonOutFunctionVariable
        @private
        @param term {Object} Node root from which functionVariable will be removed.
        @param functionVariable {String} equation function variable
        @return Void
        @static
        **/
        "_commonOutFunctionVariable": function(term, functionVariable) {

            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                i,
                reply, gotFunctionVariable = false;
            if (term.isTerminal) {
                if (term.value === functionVariable) {
                    term.value = 1;
                    term.type = 'digit';
                    return 1;
                }
                return void 0;
            }
            switch (term.name) {
                case '+':
                    for (i = 0; i < term.params.length; i++) {
                        reply = EquationEngine.TreeProcedures._commonOutFunctionVariable(term.params[i], functionVariable);
                    }
                    break;

                case '\\cdot':
                    for (i = 0; i < term.params.length; i++) {
                        reply = EquationEngine.TreeProcedures._commonOutFunctionVariable(term.params[i], functionVariable);
                        // Done below commenting and changes for (x+1)(x+1)=0 ..in this case we were not able to common out x.x
                        if (reply === 1) {
                            gotFunctionVariable = true;
                        }
                    }
                    if (gotFunctionVariable) {
                        return 1;
                    }
                    break;

                case '\\frac':
                    return EquationEngine.TreeProcedures._commonOutFunctionVariable(term.params[0], functionVariable);

                case '^':
                    return EquationEngine.TreeProcedures._commonOutFunctionVariable(term.params[0], functionVariable);
            }
        },

        /**
        Will add two equation tree term1 into term2.

        If term1 is + then term2 children are added in term1.
        If term2 is + then term1 children are added in term2.
        If neither are +, then a new addition Node is created and then term1 and term2 are added as children to it


        @method _add
        @private
        @param term1{Object} First term to add
        @param term2{Object} Second term to add
        @return {Object} root of the result term
        @static
        **/
        "_add": function(term1, term2) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                additionTerm,
                paramsToAdd,
                i;

            if (!term1.isTerminal && term1.name === '+') {
                additionTerm = term1;

                if (!term2.isTerminal && term2.name === '+') {
                    paramsToAdd = EquationEngine.TreeProcedures._extractAllParams(term2);
                    term2.incinerate();
                } else {
                    paramsToAdd = [term2];
                }

            } else if (!term2.isTerminal && term2.name === '+') {
                additionTerm = term2;

                if (!term1.isTerminal && term1.name === '+') {
                    paramsToAdd = EquationEngine.TreeProcedures._extractAllParams(term1);
                    term1.incinerate();
                } else {
                    paramsToAdd = [term1];
                }

            } else {
                additionTerm = EquationEngine.TreeProcedures._getParseTreeNodeObject(void 0, '+', '+', void 0);
                paramsToAdd = [term1, term2];
            }

            for (i = 0; i < paramsToAdd.length; i++) {
                additionTerm._addParam(paramsToAdd[i]);
            }
            return additionTerm;
        },


        /**
        Multiply term1 to term2. If either of term1 and term2 are \\cdot nodes then children are accommodated in them or a new \\cdot node is created.

        @method multiply
        @private
        @param term1{Object} First term to add
        @param term2{Object} Second term to add
        @return {Object} root of the result term
        @static
        **/
        "multiply": function(term1, term2) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                cdotParent,
                i;
            if (!term1.isTerminal && term1.name === '\\cdot') {
                cdotParent = term1;

                if (term2.isTerminal) {
                    cdotParent._addParam(term2);
                } else {
                    if (term2.name === '\\cdot') {
                        for (i = 0; i < term2.params.length; i++) {
                            cdotParent._addParam(term2.params[i]);
                        }
                        term2.incinerate();
                    } else {
                        cdotParent._addParam(term2);
                    }
                }
            } else if (!term2.isTerminal && term2.name === '\\cdot') {
                cdotParent = term2;

                if (term1.isTerminal) {
                    cdotParent._addParam(term1);
                } else {
                    if (term1.name === '\\cdot') {
                        for (i = 0; i < term1.params.length; i++) {
                            cdotParent._addParam(term1.params[i]);
                        }
                        term1.incinerate();
                    } else {
                        cdotParent._addParam(term1);
                    }
                }

            } else {
                cdotParent = EquationEngine.TreeProcedures._getParseTreeNodeObject(void 0, '\\cdot', '+', void 0);
                cdotParent._addParam(term1);
                cdotParent._addParam(term2);

            }
            return cdotParent;
        },
        /**

        Converts equation from Ax = By to Ax + By = 0; form.

        @method combineLeftRightTree
        @private
        @param equationData{Object}
        @return
        @static
        **/
        "combineLeftRightTree": function(equationData) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                freevar,
                left,
                right,
                rightExpression = equationData.getRightExpression(),
                leftExpression = equationData.getLeftExpression(),
                rightRoot = equationData.getRightRoot(),
                leftRoot = equationData.getLeftRoot(),
                newFlag;
            if (rightRoot) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Right tree is ' + equationData.rightRoot, []);
                EquationEngine.TreeProcedures.negateTree(rightRoot);
                // If right equation is just zero then we don't shift it.
                if (rightRoot.isTerminal && EquationEngine.TreeProcedures._getValueFromParam(rightRoot) === 0 && !leftRoot.isTerminal) {
                    return void 0;
                }
                equationData.setLeftRoot(EquationEngine.TreeProcedures._add(leftRoot, rightRoot));
                equationData.setRightRoot(EquationEngine.TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', '+', equationData.getUnits()));
                equationData.getRightRoot().value = '0';
            }


            for (freevar in rightExpression.freevars) {
                left = leftExpression.freevars[freevar];
                right = rightExpression.freevars[freevar];
                if (left) {
                    if (left === 'c') {
                        newFlag = left;
                    } else {
                        if (right === 'c') {
                            newFlag = right;
                        } else {
                            newFlag = left > right ? left : right;
                        }
                    }
                } else {
                    newFlag = right;
                }
                leftExpression.freevars[freevar] = newFlag;
                delete rightExpression.freevars[freevar];
            }
        },

        /**
        Multiplies the equation tree with -1.
        @method negateTree
        @private
        @param node{Object} root of the tree to multiply by -1
        @return
        @static
        **/
        "negateTree": function(node) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                propagateSign = !node.isTerminal && node.name === '+',
                paramCounter;

            if (propagateSign) {
                //only when sign is +
                for (paramCounter = 0; paramCounter < node.params.length; paramCounter++) {
                    EquationEngine.TreeProcedures.negateTree(node.params[paramCounter]);
                }
            } else {
                if (node.sign === '+') {
                    node.sign = '-';
                } else {
                    node.sign = '+';
                }
            }
        },


        /**
        Takes valid predictionStack as input and generates the equation tree.

        @method generateTree
        @private
        @param validPredictionStack {Array} array of tokens and rules
        @param pointer {Integer} used for recursive calls, index to start from
        @param units {Object} units object from the equationData to pass in the terminal objects
        @return
        @static
        **/
        "generateTree": function(validPredictionStack, pointer, units) {
            if (validPredictionStack === void 0) {
                return void 0;
            }

            function getNextPromotionNode(node) {
                if (node.parentNode === void 0) {
                    return void 0;
                }
                var myIndex = node.parentNode.params.indexOf(node),
                    sibling = node.parentNode.params[myIndex + 1];

                if (sibling === void 0) {
                    return node.parentNode;
                }
                return sibling;
            }


            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                rootNode,
                sumProduct = ['\\sum', '\\prod'],
                currentNode,
                currentObject,
                bracketsStack = [],
                liberationCode;

            while (pointer < validPredictionStack.length) {
                currentObject = validPredictionStack[pointer];
                //TRACE
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, '...Processing object ' + currentObject, []);
                //TRACE
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, '...Current Parent is ' + currentNode, []);

                if (typeof currentObject === 'number') {
                    //its a rule
                    liberationCode = EquationEngine.ParsingProcedures.getStackCode(bracketsStack);
                    currentNode = EquationEngine.TreeProcedures._getNodeForRule(currentNode, currentObject, liberationCode, units);
                    if (rootNode === void 0) {
                        rootNode = currentNode;
                        while (rootNode.parentNode !== void 0) {
                            rootNode = rootNode.parentNode;
                        }
                    }
                    //TRACE
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, 'rule returned ' + currentNode, []);
                } else if (currentObject.type === 'func') {
                    //TRACE
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, 'ignoring func token ' + currentObject, []);
                    if (currentObject.value === currentNode.name) {
                        currentNode.value = currentObject.name;
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, '%cCHECK' +
                            '...function name matches with currentNode ' + currentObject + '<>' + currentNode, [EquationEngine.Parser._YSTYLE]);
                        currentNode.sign = currentObject.sign;
                        currentNode.negativeCaseType = currentObject.negativeCaseType;
                    } else if (sumProduct.indexOf(currentObject.value) !== -1 && currentNode.parentNode &&
                        sumProduct.indexOf(currentNode.parentNode.name) !== -1) {
                        currentNode.parentNode.sign = currentObject.sign;
                        currentNode.parentNode.negativeCaseType = currentObject.negativeCaseType;
                    } else {
                        //This case was to check that node returned from rule is same as the node in the function. But this error is caught in production rule generation
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, '%cFAIL' +
                            '...function name does not match with currentNode ' + currentObject + '<>' + currentNode, [EquationEngine.Parser._NSTYLE]);
                    }
                } else if (currentObject.type === 'delim') {
                    //TRACE
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, 'skipping delimiter ' + currentObject, []);

                    if (currentObject.value === ',' && !EquationEngine.Parser._isCommaFunction(currentNode.name)) {

                        while (!EquationEngine.Parser._isCommaFunction(currentNode.name)) {
                            currentNode = getNextPromotionNode(currentNode);
                        }
                    }
                    EquationEngine.ParsingProcedures.recordBracket(bracketsStack, currentObject.value);

                    //so that bracket signs are incorporated in the tree
                    if (currentNode.name === 'do') {
                        currentNode.sign = currentObject.sign;
                        currentNode.negativeCaseType = currentObject.negativeCaseType;
                    }
                    while (currentNode.liberationCode > EquationEngine.ParsingProcedures.getStackCode(bracketsStack)) {
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Current node type ' + currentNode.type, []);
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree,
                            'shifting up parent because ' + currentNode + ' is Delimiter found... parent shift from ' +
                            currentNode + ' to ' + currentNode.parentNode, []);
                        currentNode = getNextPromotionNode(currentNode); //currentNode.parentNode;
                        if (currentNode === void 0) {
                            // This is the case where `do` is the parent node. But this case will never occur now as we skip `do` before as an optimization.
                            break;
                        }
                    }
                } else if (currentObject.type === 'opr') {
                    //TRACE
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, 'skipping operator ' + currentObject, []);
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree,
                        'Operator found...shifting parent from ' + currentNode + ' to ' + currentNode.parentNode + currentObject, []);

                    //means make parent current pointer and the bidding will be done for him
                    if (currentObject.value !== currentNode.name) {
                        //This case was to check that node returned from rule is same as the node in the function. But this error is caught in production rule generation
                        do {
                            //TRACE
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, currentObject.value + '<> ' + currentNode.name, []);
                            //TRACE
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree,
                                '!!!!!!!!!!!!!!!!!!! current operator does not match the current node !!!!!!!!!!!!! SHOULD SHIFT parent up to!!' +
                                currentNode.parentNode, []);
                            currentNode = getNextPromotionNode(currentNode);
                        }
                        while (currentNode !== void 0 && currentObject.value !== currentNode.name);

                    } else {
                        //TRACE
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, 'Operator ' +
                            currentNode.value + ' confirms with the parent >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', []);
                    }

                    if (currentNode !== void 0 && currentObject.value === currentNode.name) {
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, '%cCHECK' +
                            '...OPERATOR name matches with currentNode ' + currentObject + '<>' + currentNode, [EquationEngine.Parser._YSTYLE]);
                        currentNode.sign = currentObject.sign;
                        currentNode.negativeCaseType = currentObject.negativeCaseType;
                    } else {
                        //This case was to check that node returned from rule is same as the node in the function. But this error is caught in production rule generation
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%cFAIL' +
                            '...OPERATOR name does not match with currentNode ' + currentObject + '<>' + currentNode, [EquationEngine.Parser._NSTYLE]);
                    }
                } else if (currentObject.type === 'digit' || currentObject.type === 'const' || currentObject.type === 'var') {
                    if (!currentNode.isTerminal) {
                        // This case will only occur if the production rules are wrong.
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, '!!!!!!!!!!!!!!!! ERROR terminal expected found NODE------------', []);
                        return void 0;
                    }
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, '+++ found terminal ' +
                        currentObject + ' will be filled into shell ' + currentNode, []);
                    currentNode.sign = currentObject.sign;
                    currentNode.negativeCaseType = currentObject.negativeCaseType;
                    currentNode.value = currentObject.value;
                    currentNode.type = currentObject.type;
                    currentNode.isEmpty = false;
                    if (currentObject.constantSubstituted !== void 0) {
                        currentNode.constantSubstituted = currentObject.constantSubstituted;
                        currentNode.irrational = MathUtilities.Components.EquationEngine.Models.TreeProcedures.IRRATIONAL_CONSTANTS.indexOf(currentNode.constantSubstituted) > -1;
                    }

                } else {
                    //TRACE
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, "!!!!!!Check WHAT TO DO WITH " + currentObject, []);
                }

                if (currentNode !== void 0) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, 'Checking stackcode ' +
                        currentNode + ' ' + currentNode.liberationCode + ' <> ' + EquationEngine.ParsingProcedures.getStackCode(bracketsStack), []);

                    //not promoting operators to make sure they get the sign properly
                    while (currentNode.isEmpty === false && !EquationEngine.TreeProcedures.isOperator(currentNode.name)) {
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, 'Current node type ' + currentNode.type, []);
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tree, 'shifting up parent because ' +
                            currentNode + ' is NOT EMPTY parent shift from ' + currentNode + ' to ' + getNextPromotionNode(currentNode), []);
                        currentNode = getNextPromotionNode(currentNode);
                        if (currentNode === void 0) {
                            break;
                        }
                    }
                }
                pointer++;
                if (currentNode === void 0) {
                    break;
                }
            }

            return rootNode;
        },

        /**
        Checks if the passed character/string is a valid operator. Valid operators will be +,\\cdot, !,%


        @method isOperator
        @private
        @param opr{String} operator to check
        @return {Boolean}
        @static
        **/
        "isOperator": function(opr) {
            return MathUtilities.Components.EquationEngine.Models.TreeProcedures._productions._operatorsInPrecedenceOrder.indexOf(opr) !== -1;
        },

        /**

        Generates a dummy tree structure for the given rule no.
        @method _getNodeForRule
        @private
        @param parent{Object} tree structure will be created with this parent
        @param ruleNo {Integer} rule number
        @param liberationCode {Integer} create the node with liberation code.Liberation code is the level of brackets we are currently in eg in a+(b+(c+d)) b will have liberation code 1 c will have 2.
        @param units {String} equation unit
        @return
        @static
        **/
        "_getNodeForRule": function(parent, ruleNo, liberationCode, units) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                rule = EquationEngine.TreeProcedures._productions.treeGenerationRules[ruleNo],
                allTerms = rule.split(' '),
                directives,
                root,
                currentParent = parent,
                returnNode,
                i;

            if (allTerms.length > 0 && (allTerms[0] === 'node.\\sum' || allTerms[0] === 'node.\\prod')) {
                for (i = 0; i < allTerms.length; i++) {
                    directives = allTerms[i].split('.');

                    if (directives[0] === 'node') {

                        currentParent = EquationEngine.TreeProcedures._getParseTreeNodeObject(currentParent, directives[1], '+', liberationCode);
                    } else {
                        if (returnNode === void 0) {
                            returnNode = EquationEngine.TreeProcedures._getParseTreeTerminalObject(currentParent, directives[1], '+', units);
                        } else {
                            EquationEngine.TreeProcedures._getParseTreeTerminalObject(currentParent, directives[1], '+', units);
                        }
                    }

                    if (root === void 0) {
                        root = currentParent;
                    }
                }
                currentParent = returnNode;
            } else {
                for (i = 0; i < allTerms.length; i++) {
                    directives = allTerms[i].split('.');

                    if (directives[0] === 'node') {

                        currentParent = EquationEngine.TreeProcedures._getParseTreeNodeObject(currentParent, directives[1], '+', liberationCode);
                    } else {
                        currentParent = EquationEngine.TreeProcedures._getParseTreeTerminalObject(currentParent, directives[1], '+', units);
                    }

                    if (root === void 0) {
                        root = currentParent;
                    }
                }
            }
            //TRACE
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '------ Rule ' + ruleNo + ' Processing complete---------------', []);
            //we make assumption that all rules will create a tree which has leftmost node empty
            //TRACE
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'returning ' + currentParent, []);
            return currentParent;
        },


        /**
        Generates an empty terminal node with given parameters.

        @method _getParseTreeTerminalObject
        @private
        @param parent{Object}
        @param objectType{String} var/const/digit
        @param sign {String} '+' or '-'
        @param units{Object} used later for processing the trigonometric functions
        @return
        @static
        **/
        "_getParseTreeTerminalObject": function(parent, objectType, sign, units) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                nodeObject;
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Generating Node with parent ' + parent + ' and type ' + objectType, []);

            if (sign === void 0) {
                sign = '+';
            }
            //type will be const, digit, var
            nodeObject = {
                "toString": function() {
                    return '[' + this.sign + this.value + ' ' + this.type + ']';
                },
                "isTerminal": true,
                "type": objectType,
                "sign": sign,
                "value": void 0,
                "units": units,
                "isEmpty": true,
                "incinerate": function() {
                    this.value = 'incinerated (X)';
                    delete this.isTerminal;
                    delete this.type;
                    delete this.isEmpty;
                    delete this.units;
                    delete this.parentNode;
                },
                "parentNode": parent
            };
            if (parent !== void 0 && parent.isEmpty === true) {
                parent._addParam(nodeObject);
            }
            return nodeObject;
        },

        /**
        Finds the power of function variable in the given term. eg. in the equation 4x^2+3x=5y, term = 4x^2-->returns 2; term = 3x-->returns 1; term = 4y-->returns 0
        for functionVar = x. term is-->each of the "+" separated terms in the equation.

        @method _getFunctionVariableSegregationIndex
        @private
        @param term{Object}
        @param functionVar{String} name of the functionVariable to find.
        @return
        @static
        **/
        "_getFunctionVariableSegregationIndex": function(term, functionVar) {
            var i,
                fVarPower = 0,
                temp,
                EquationEngine = MathUtilities.Components.EquationEngine.Models;
            if (functionVar === void 0) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Cant segregate with unknown fVar', []);
                return void 0;
            }

            if (term.isTerminal) {
                return functionVar === term.value ? 1 : 0;
            }
            switch (term.name) {
                case '+':

                    for (i = 0; i < term.params.length; i++) {
                        temp = EquationEngine.TreeProcedures._getFunctionVariableSegregationIndex(term.params[i], functionVar);
                        //it should be same for everyone
                        if (i === 0) {
                            fVarPower = temp;
                        } else {
                            //u cant common out function variable
                            if (temp !== fVarPower) {
                                return void 0;
                            }
                        }

                    }

                    return fVarPower;

                case '\\cdot':
                    for (i = 0; i < term.params.length; i++) {
                        temp = EquationEngine.TreeProcedures._getFunctionVariableSegregationIndex(term.params[i], functionVar);
                        if (temp === void 0) {
                            return void 0;
                        }
                        if (temp > 0) {
                            fVarPower += temp;
                        }

                    }
                    return fVarPower;

                case '\\frac':
                    temp = EquationEngine.TreeProcedures._getFunctionVariableSegregationIndex(term.params[0], functionVar);
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.convert2q, 'fraction with numerator fvar power ' + temp, []);
                    return temp;

                case '^':
                    if (!term.params[1].isTerminal || term.params[1].type !== 'digit') {
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.convert2q, 'No point in checking when power is complicated for ' + term + ' power is ' + term.params[1], []);
                        return 0;
                    }

                    temp = EquationEngine.TreeProcedures._getFunctionVariableSegregationIndex(term.params[0], functionVar);
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.convert2q, 'power: fVar ' + temp + ' my power ' + term.params[1], []);
                    if (temp === void 0) {
                        return void 0;
                    }
                    if (temp > 0) {
                        return temp * EquationEngine.TreeProcedures._getValueFromParam(term.params[1]);
                    }
                    return 0;

                default:
                    //this means any other function apart from above ones... in such cases we assume that Function variable is not part of this function as such cases are eliminated in the round where we calculate powers.
                    //thus in this case we return 0
                    return 0;
            }
        },

        /**
        Optimize the equation tree for the immediate same operators. eg. +(a, +(b,c)) will be converted to +(a,b,c);

        @method _findSameOperatorAndMerge
        @private
        @param node{Object}
        @return
        @static
        **/
        "_findSameOperatorAndMerge": function(node) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                extractedParams,
                arrNewParamsTobeAdded,
                paramCounter,
                param;
            if (node.name === '+' || node.name === '\\cdot' || node.name === '-') {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Merging operator ' + node, []);
                arrNewParamsTobeAdded = [];
                //merge children with same operator
                paramCounter = 0;
                param = null;
                for (paramCounter = 0; paramCounter < node.params.length; paramCounter++) {
                    param = node.params[paramCounter];

                    if (param.name === node.name) {
                        extractedParams = EquationEngine.TreeProcedures._extractAllParams(param);
                        node._removeParam(param);
                        paramCounter--;
                        while (extractedParams.length > 0) {
                            arrNewParamsTobeAdded.push(extractedParams.shift());
                        }
                    }
                }
                if (arrNewParamsTobeAdded.length > 0) {
                    while (arrNewParamsTobeAdded.length > 0) {
                        node._addParam(arrNewParamsTobeAdded.shift());
                    }
                }
            } else {

                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Cant merge function ' + node, []);
                return void 0;
            }
        },

        /**
        Generates a node object with given parameters.

        @method _getParseTreeNodeObject
        @private
        @param parent{Object} parent node for the created node
        @param functionName{String} name of the function
        @param sign{String} '+' or '-'
        @param liberationCode {Integer} Liberation code is the level of brackets we are currently in eg in a+(b+(c+d)) b will have liberation code 1 c will have 2.
        @return
        @static
        **/
        "_getParseTreeNodeObject": function(parent, functionName, sign, liberationCode) {

            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                functionObject;
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Generating function ' + functionName + ' with parent ' + parent, []);

            if (sign === void 0) {
                sign = '+';
            }
            functionObject = {
                "toString": function() {
                    if (this.sign === '+') {
                        return this.name + '()';
                    }
                    return this.sign + this.name + '()';
                },
                "params": [],
                "isTerminal": false,
                "name": functionName,
                "isEmpty": true,
                "sign": sign,
                "allTermsDigits": void 0,
                "liberationCode": liberationCode,
                "maxParams": EquationEngine.TreeProcedures._productions.getMaximumParameters(functionName),

                "_addParam": function(param) {
                    if (this.params.length >= this.maxParams) {

                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '!!!!!!!! ERROR I CANT ACCEPT THIS CHILD', []);
                        return void 0;
                    }

                    param.parentNode = this;
                    this.params.push(param);
                    //TRACE
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Adding param ' +
                        param.name + ' to ' + this.name + ' at index ' + (this.params.length - 1), []);
                    if (this.params.length === this.maxParams) {

                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '---Function ' + this.name + ' is full---', []);
                        this.isEmpty = false;
                    }
                },

                "_addParamAt": function(param, index) {
                    if (this.params[index] === param) {
                        return;
                    }
                    var tempParam;
                    param.parentNode = this;
                    tempParam = this.params[index];
                    this.params[index] = param;
                    if (this.params.length === this.maxParams) {
                        this.isEmpty = false;
                    }
                    tempParam.incinerate();
                },

                "_removeParam": function(param, shouldBeIncinerated) {
                    var index,
                        objects,
                        removed;
                    index = typeof param === 'number' ? param : this.params.indexOf(param);
                    if (index === -1 || index >= this.params.length) {

                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Cant remove object at index ' + index, []);
                        return void 0;
                    }
                    objects = this.params.splice(index, 1);
                    removed = objects[0];

                    if (shouldBeIncinerated === void 0) {
                        shouldBeIncinerated = true;
                    }

                    if (shouldBeIncinerated) {
                        removed.incinerate();
                    } else {
                        return removed;
                    }

                },

                "convertToTerminal": function(terminalNode, calculateSign) {
                    this.isTerminal = true;
                    this.value = terminalNode.value;
                    this.isEmpty = terminalNode.isEmpty;
                    this.type = terminalNode.type;
                    this.units = terminalNode.units;
                    this.irrational = void 0;
                    this.sign = calculateSign ? EquationEngine.TreeProcedures._multiplySigns(this.sign, terminalNode.sign) : terminalNode.sign;
                    this.toString = function toString() {
                        return '[' + this.sign + this.value + ' ' + this.type + ']';
                    };

                    //this.parentNode unaffected
                    if (terminalNode.parentNode !== void 0) {
                        terminalNode.parentNode._removeParam(terminalNode);
                    }

                    delete this.params;
                    delete this.name;
                    delete this.liberationCode;
                    delete this.maxParams;
                    delete this._removeParam;
                    delete this.toEquation;
                    delete this._addParam;
                    delete this.simplify;
                },

                "incinerate": function() {
                    this.name = 'incinerated (+)';
                    delete this.params;
                    delete this.isTerminal;
                    delete this.isEmpty;
                    delete this.liberationCode;
                    delete this.parentNode;
                    delete this.maxParams;
                },

                "expand": function(functionVariable, equationData) {
                    /*
                     * expand function is used to facilitate solving of equations
                     *
                     * it expands a few basic functions on following terms
                     * frac on the basis addition of variables in the numerator (a+b)/c => a/c + b/c
                     *
                     * ^ func on the basis of left child is do with first child +, eg. (x+a)^2
                     *
                     */
                    var numerator,
                        denominator,
                        newNumerator,
                        newDenominator,
                        firstParam,
                        secondParam,
                        paramCounter,
                        expandPerformed,
                        additionGroups,
                        counter,
                        multipliedTerm,
                        termsToExpand,
                        powerTerm,
                        termsWithFreeVariable,
                        expansionTerm,
                        power2Term,
                        newFractionTerm,
                        powerFunction,
                        cdotParam,
                        hasCoefficient = equationData.getHasCoefficient(),
                        fractionSign;
                    switch (this.name) {
                        case '+':
                            for (paramCounter = 0; paramCounter < this.params.length; paramCounter++) {
                                if (!this.params[paramCounter].isTerminal) {
                                    this.params[paramCounter].expand(functionVariable, equationData);
                                }
                            }
                            EquationEngine.TreeProcedures._findSameOperatorAndMerge(this);
                            expandPerformed = true;
                            break;

                        case '\\cdot':
                            for (paramCounter = 0; paramCounter < this.params.length; paramCounter++) {
                                if (!this.params[paramCounter].isTerminal) {
                                    this.params[paramCounter].expand(functionVariable, equationData);
                                }
                            }
                            if (EquationEngine.TreeProcedures._getAdditionGroupCount(this.params) > 0) {

                                additionGroups = [];
                                counter = 0;
                                while (counter < this.params.length) {
                                    if (this.params[counter].name === '+') {
                                        additionGroups.push(this._removeParam(this.params[counter], false));
                                    } else {
                                        counter++;
                                    }
                                }
                                if (additionGroups.length > 1) {
                                    while (additionGroups.length > 1) {
                                        multipliedTerm = EquationEngine.TreeProcedures._expandMultiplication(additionGroups.shift(),
                                            additionGroups.shift(), this.sign);
                                        additionGroups.unshift(multipliedTerm);
                                    }
                                } else {
                                    multipliedTerm = additionGroups[0];
                                }

                                /*
                                 * if we have params left then there were non + terms, so just multiply them
                                 */
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand,
                                    'Remaining non plus params count is ' + this.params.length, []);
                                if (this.params.length > 0) {
                                    if (this.params.length > 1) {

                                        cdotParam = EquationEngine.TreeProcedures._getParseTreeNodeObject(void 0, '\\cdot', '+', void 0);
                                        EquationEngine.TreeProcedures._adoptAllParams(this, cdotParam);
                                        multipliedTerm = EquationEngine.TreeProcedures._expandMultiplication(cdotParam, multipliedTerm, this.sign);
                                    } else {
                                        multipliedTerm = EquationEngine.TreeProcedures._expandMultiplication(this.params[0], multipliedTerm, this.sign);
                                        EquationEngine.TreeProcedures._removeAllParams(this);
                                    }
                                }
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand, 'Addition group is ' + multipliedTerm, []);

                                EquationEngine.TreeProcedures._convertTreeNodeTo(this, '+');
                                EquationEngine.TreeProcedures._adoptAllParams(multipliedTerm, this);
                                EquationEngine.TreeProcedures.transferSignToExpandedTerms(this);

                            } else {
                                //nothing to expand
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand, 'Nothing to expand', []);
                            }
                            EquationEngine.TreeProcedures._findSameOperatorAndMerge(this);
                            break;

                        case '^':
                            firstParam = this.params[0];
                            if (!firstParam.isTerminal) {
                                firstParam.expand(functionVariable, equationData);
                            }
                            secondParam = this.params[1];
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand, 'Expanding ^ with params ' + this.params, []);
                            //Removing && secondParam.type === 'digit' as constants WILL be encountered now
                            if (firstParam.name === '+' && secondParam.isTerminal) {
                                //values 0 and 1 will be excluded since they will be simplified
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand, 'Possible expansion of ' +
                                    firstParam + ' at degree ' + secondParam, []);

                                if (secondParam.value === '2') {
                                    if (!EquationEngine.TreeProcedures._hasFreeVariable(this, functionVariable, hasCoefficient)) {
                                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand,
                                            'No function variable found in my params....Expansion is futile', []);
                                        return void 0;
                                    }
                                    //check for + in do
                                    //expand only (x+a)^2 type of terms
                                    termsToExpand = EquationEngine.TreeProcedures._extractAllParams(firstParam);


                                    EquationEngine.TreeProcedures._convertTreeNodeTo(this, '+');
                                    EquationEngine.TreeProcedures._removeAllParams(this);

                                    /*
                                     * all the terms in following array will be in first degree ONLY
                                     * terms with higher degree of free var should have been discarded when calculating powers of free variables
                                     */
                                    termsWithFreeVariable = EquationEngine.TreeProcedures._separateTermsWithFreeVariable(termsToExpand, functionVariable, hasCoefficient);

                                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand,
                                        'Terms with free Variable ' + functionVariable + ' are ' + termsWithFreeVariable, []);
                                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand,
                                        'Terms WITHOUT free Variable ' + functionVariable + ' are ' + termsToExpand, []);

                                    if (termsWithFreeVariable.length === 0) {
                                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand,
                                            '##############ERROR THIS SHOULDNT HAPPEN...@#@#######', []);
                                    } else {
                                        power2Term = EquationEngine.TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', '+');
                                        power2Term.value = 2;

                                        //reusing firstParam and secondParam variable names here
                                        if (termsWithFreeVariable.length > 0) {
                                            firstParam = EquationEngine.TreeProcedures._getParseTreeNodeObject(void 0, '+', void 0, void 0);
                                            for (paramCounter = 0; paramCounter < termsWithFreeVariable.length; paramCounter++) {
                                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand,
                                                    'Adding param ' + termsWithFreeVariable[paramCounter], []);
                                                firstParam._addParam(termsWithFreeVariable[paramCounter]);
                                            }
                                        } else {
                                            firstParam = termsWithFreeVariable[0];
                                        }

                                        if (termsToExpand.length > 0) {
                                            secondParam = EquationEngine.TreeProcedures._getParseTreeNodeObject(void 0, '+', void 0, void 0);
                                            for (paramCounter = 0; paramCounter < termsToExpand.length; paramCounter++) {
                                                secondParam._addParam(termsToExpand[paramCounter]);
                                            }
                                        } else {
                                            secondParam = termsToExpand[0];
                                        }
                                        //(a+b)^2
                                        //a^2
                                        expansionTerm = EquationEngine.TreeProcedures._getParseTreeNodeObject(void 0, '^', void 0, void 0);
                                        expansionTerm._addParam(EquationEngine.TreeProcedures._clone(firstParam));
                                        expansionTerm._addParam(EquationEngine.TreeProcedures._clone(power2Term));
                                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand,
                                            'expansion term 1 generated ' + expansionTerm, []);
                                        expansionTerm.sign = EquationEngine.TreeProcedures._multiplySigns(expansionTerm.sign, this.sign);
                                        this._addParam(expansionTerm);

                                        //b^2
                                        expansionTerm = EquationEngine.TreeProcedures._getParseTreeNodeObject(void 0, '^', void 0, void 0);
                                        expansionTerm._addParam(EquationEngine.TreeProcedures._clone(secondParam));
                                        expansionTerm._addParam(EquationEngine.TreeProcedures._clone(power2Term));
                                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand,
                                            'expansion term 2 generated ' + expansionTerm, []);
                                        expansionTerm.sign = EquationEngine.TreeProcedures._multiplySigns(expansionTerm.sign, this.sign);
                                        this._addParam(expansionTerm);

                                        //2ab
                                        expansionTerm = EquationEngine.TreeProcedures.multiply(firstParam, secondParam);
                                        //since the value is 2 :P
                                        expansionTerm = EquationEngine.TreeProcedures.multiply(expansionTerm, power2Term);
                                        expansionTerm.sign = EquationEngine.TreeProcedures._multiplySigns(expansionTerm.sign, this.sign);
                                        this._addParam(expansionTerm);
                                        expandPerformed = true;
                                    }
                                }
                            } else if (firstParam.name === '\\cdot' && secondParam.isTerminal && secondParam.type === 'digit') { //last 2 conditions to help skipping many useless expansions
                                //simplify like (a.b)^2 -> a^2. b^2...it helps later segregating function variables
                                powerTerm = this._removeParam(secondParam, false);
                                EquationEngine.TreeProcedures._convertTreeNodeTo(this, '\\cdot');

                                termsToExpand = EquationEngine.TreeProcedures._extractAllParams(firstParam);
                                EquationEngine.TreeProcedures._removeAllParams(this);
                                firstParam.incinerate();

                                while (termsToExpand.length > 0) {
                                    powerFunction = EquationEngine.TreeProcedures._getParseTreeNodeObject(void 0, '^', '+', void 0);
                                    powerFunction._addParam(termsToExpand.shift());
                                    powerFunction._addParam(EquationEngine.TreeProcedures._clone(powerTerm));
                                    this._addParam(powerFunction);
                                }
                                powerTerm.incinerate();
                                expandPerformed = true;
                            }
                            break;

                        case '\\frac':
                            numerator = this.params[0];

                            if (!numerator.isTerminal) {
                                numerator.expand(functionVariable, equationData);
                            }

                            if (numerator.name === '+') {
                                expandPerformed = true;
                                this.name = '+';
                                this.maxParams = EquationEngine.TreeProcedures._productions.getMaximumParameters(this.name);
                                denominator = this.params[1];

                                this._removeParam(numerator, false);
                                this._removeParam(denominator, false);

                                //fraction is expandable
                                while (numerator.params.length > 0) {
                                    fractionSign = this.sign;
                                    newNumerator = numerator.params[0];
                                    numerator._removeParam(newNumerator, false);

                                    if (numerator.params.length === 0) {
                                        newDenominator = denominator;
                                    } else {
                                        newDenominator = EquationEngine.TreeProcedures._clone(denominator);
                                    }

                                    newFractionTerm = EquationEngine.TreeProcedures._getParseTreeNodeObject(this, '\\frac');
                                    newFractionTerm._addParam(newNumerator);
                                    newFractionTerm._addParam(newDenominator);
                                    newFractionTerm.sign = fractionSign;
                                    newFractionTerm.simplify(equationData);

                                    this._addParam(newFractionTerm);
                                }
                                numerator.incinerate();
                            }
                            break;
                    }

                    if (expandPerformed) {
                        this.simplify(equationData);
                    }
                },

                "simplify": function(equationData) {
                    var allTermsDigitsFlag = true,
                        i,
                        childParamsLength;
                    if (this.name === '\\mixedfrac') {
                        EquationEngine.TreeProcedures._validateMixedFraction(this, equationData);
                    }

                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'Simplifying ' + this, []);

                    if (this.name === "\\sum" || this.name === "\\prod") {
                        EquationEngine.TreeProcedures.simplifySumProd(this, equationData);
                        return void 0;
                    }
                    childParamsLength = this.params.length;

                    for (i = childParamsLength - 1; i >= 0; i--) {
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '...processing ' + this.params[i], []);

                        if (this.params[i].isTerminal) {
                            if (this.params[i].type !== 'digit') {
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, this.params[i] + ' is not digit', []);
                                allTermsDigitsFlag = false;
                            }
                            continue;
                        }
                        this.params[i].simplify(equationData);
                        if (!this.params[i].isTerminal || this.params[i].type !== 'digit') {
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, this.params[i] + ' is not digit', []);
                            allTermsDigitsFlag = false;
                        }

                    }
                    this.allTermsDigits = allTermsDigitsFlag;
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'all terms digit flag is ' +
                        this.allTermsDigits + ' for function ' + this, []);
                    if (this.name === '\\sqrt' && Number(this.params[0].value) % 2 === 0 && this.params[1].sign === '-') {
                        equationData.setCanBeSolved(false);
                        return;
                    }
                    EquationEngine.TreeProcedures._performNumericalOptimizations(this, equationData);
                    EquationEngine.TreeProcedures._performStructuralOptimizations(this, equationData);
                },
                "parentNode": parent
            };
            if (parent !== void 0 && parent.isEmpty) {
                parent._addParam(functionObject);
            }
            //function can be parent less
            return functionObject;
        },

        /**
           Checks whether the function name provided is an Inversible function

           @method _isInversibleFunction
           @private
           @param functionName{String} name of the function to be checked
           @return {Boolean} true if it is an Inversible function else false
           @static
       **/
        "_isInversibleFunction": function(functionName) {
            return MathUtilities.Components.EquationEngine.Models.Parser._INVERSIBLE_FUNCTIONS.indexOf(functionName) !== -1;
        },

        /**
            Checks if the node has any variables in it. If it does then it is not simple.

            @method _isNodeSimple
            @private
            @param node{object}
            @return {Boolean} true if node is simple/does not have any variable in it
            @static
        **/
        "_isNodeSimple": function(node) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                result = true,
                i;
            if (node.isTerminal) {
                result = node.type !== "var";
            } else {
                for (i = 0; i < node.params.length; i++) {
                    result = result && EquationEngine.TreeProcedures._isNodeSimple(node.params[i]);
                    if (!result) {
                        return result;
                    }
                }
            }
            return result;
        },

        "simplifySumProd": function(node, equationData) {
            if (!(node && node.params) || node.params.length < 4) {
                return void 0;
            }
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                start = node.params[1],
                end = node.params[2],
                sum = node.params[3],
                sumCode,
                functionCode,
                func,
                result,
                terminal;

            if (!start.isTerminal) {
                start.simplify(equationData);
            }
            if (!end.isTerminal) {
                end.simplify(equationData);
            }
            if (!sum.isTerminal) {
                sum.simplify(equationData);
            }
            if (!(EquationEngine.TreeProcedures._isNodeSimple(start) && EquationEngine.TreeProcedures._isNodeSimple(end) &&
                    EquationEngine.TreeProcedures._isNodeSimple(sum) && start.isTerminal && start.type === "digit" && end.isTerminal && end.type === "digit")) {
                return void 0;
            }
            start.value = (Number(start.value)).toString();
            end.value = (Number(end.value)).toString();
            sumCode = EquationEngine.TreeProcedures._toMobileFunction(sum, equationData, node.params[0].value);

            if (sumCode.search('param') > -1) {
                return void 0;
            }
            functionCode = "return " + EquationEngine.TreeProcedures._toMobileFunction(node, equationData) + ";";

            if (functionCode.search('findFactorial') > -1) {
                functionCode = EquationEngine.MathFunctions.findFactorialString + functionCode;

            }
            if (functionCode.search('gammaFunction') > -1) {
                functionCode = EquationEngine.MathFunctions._gammaFunctionString + functionCode;
            }

            if (functionCode.search('sum') > -1) {
                functionCode = EquationEngine.MathFunctions.getSumString() + functionCode;
            }

            if (functionCode.search('prod') > -1) {
                functionCode = EquationEngine.MathFunctions.getProdString() + functionCode;
            }

            func = new Function('param,constants,functions', functionCode);
            result = func(0, equationData.getConstants(), equationData.getFunctions());

            terminal = EquationEngine.TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', '+', node.params[0].units);
            terminal.value = result;

            node.convertToTerminal(terminal);
        },

        /**
           Gets the first non-delimiter left child
           @method _getLeftChild
           @private
           @param node{Object} The node for which the left child is to be found out
           @return {Object} left child node object or null
           @static
       **/
        "_getLeftChild": function(node) {
            if (node.isTerminal) {
                return null;
            }
            if (node.params[0].name === 'do') {
                return MathUtilities.Components.EquationEngine.Models.TreeProcedures._getLeftChild(node.params[0]);
            }
            return node.params[0];
        },

        /**
           Gets the first non-delimiter right child

           @method _getRightChild
           @private
           @param node{Object} The node for which the right child is to be found out
           @return {Object} right child node object or null
           @static
       **/
        "_getRightChild": function(node) {
            if (node.isTerminal) {
                return null;
            }
            if (node.params[1].name === 'do') {
                return MathUtilities.Components.EquationEngine.Models.TreeProcedures._getLeftChild(node.params[1]);
            }
            return node.params[1];
        },

        /**
           Returns the function that has to be replaced for the inversible function
           eg. arcsin for sin


           @method _getInversibleFunctionReplacement
           @private
           @param functionName{String} name of the function to be checked
           @return {String} name of the function to be replaced else null
           @static
       **/
        "_getInversibleFunctionReplacement": function(functionName) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                inversibleFunctionIndex = EquationEngine.Parser._INVERSIBLE_FUNCTIONS.indexOf(functionName);
            if (inversibleFunctionIndex !== -1) {
                return EquationEngine.Parser._INVERT_FUNCTIONS_IN_ORDER[inversibleFunctionIndex];
            }
            return null;
        },

        /**
           Converts inverse trigonometric function to corresponding inverse functions
           eg. sin^-1 to arcsin
           @method _preNumericalStructuralOptimizations
           @private
           @param node{Object} The node for which the optimization have to be done
           @return Void
           @static
       **/
        "_preNumericalStructuralOptimizations": function(node) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                leftChild,
                rightChild,
                leftGrandChildrens,
                functionToReplace,
                childCounter,
                childrenLength;
            if (node.name === '^') {
                leftChild = EquationEngine.TreeProcedures._getLeftChild(node);
                if (leftChild !== null && EquationEngine.TreeProcedures._isInversibleFunction(leftChild.name)) {
                    rightChild = EquationEngine.TreeProcedures._getRightChild(node);
                    if (rightChild !== null && EquationEngine.TreeProcedures._getValueFromParam(rightChild) === -1) {
                        functionToReplace = EquationEngine.TreeProcedures._getInversibleFunctionReplacement(leftChild.name);
                        if (functionToReplace !== null) {
                            leftGrandChildrens = EquationEngine.TreeProcedures._extractAllParams(leftChild);
                            EquationEngine.TreeProcedures._convertTreeNodeTo(node, functionToReplace);
                            node.sign = EquationEngine.TreeProcedures._multiplySigns(node.sign, leftChild.sign);
                            EquationEngine.TreeProcedures._removeAllParams(node);

                            childrenLength = leftGrandChildrens.length;
                            for (childCounter = 0; childCounter < childrenLength; childCounter++) {
                                node._addParam(leftGrandChildrens[childCounter]);
                            }
                        }
                    }
                }
            }
        },

        "_validateMixedFraction": function(node, equationData) {
            var paramCounter,
                value,
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                MathFunctions = MathUtilities.Components.EquationEngine.Models.MathFunctions,
                currentNode,
                nodeParamlength,
                paramValues = [];
            nodeParamlength = node.params.length;
            for (paramCounter = 0; paramCounter < nodeParamlength; paramCounter++) {
                currentNode = node.params[paramCounter];
                if (currentNode.type !== 'digit' || currentNode.negativeCaseType === 2) {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('MixedFractionError');
                    return void 0;
                }
                value = EquationEngine.TreeProcedures._substituteParamVariableAndGetValue(currentNode, equationData.getConstants(), void 0, void 0, equationData);
                paramValues.push(value);
            }
            if (!MathFunctions.checkIfNotADecimalNumber(paramValues[0]) || paramValues[0] === 0 ||
                !MathFunctions.checkIfWholeNumber(paramValues[1]) || !MathFunctions.checkIfWholeNumber(paramValues[2]) || paramValues[1] >= paramValues[2]) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('MixedFractionError');
                return void 0;
            }
            return EquationEngine.TreeProcedures._mathFunctions.performMathematicalCalculations(node.name, paramValues, EquationEngine.TreeProcedures._getUnits(node));
        },

        /**
        Perform structural optimizations in the equation Tree.
        @method _performStructuralOptimizations
        @private
        @param node{Object} node to be optimized
        @return Void
        @static
        **/
        "_performStructuralOptimizations": function(node, equationData) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                performNumericalOptimizations = false,
                sign,
                childTerm,
                childPower,
                doChildParams,
                powerTerm,
                leftChild,
                numberOfPercentChilds,
                percentChild,
                value,
                replacementNode;
            switch (node.name) {
                case '^':
                    //1. merge powers (a^2)^2 will be a^4
                    if (node.params[0].name === '^') {
                        powerTerm = node._removeParam(1, false);
                        childTerm = node.params[0]._removeParam(0, false);
                        childPower = node.params[0]._removeParam(0, false);
                        node._removeParam(0);
                        powerTerm = EquationEngine.TreeProcedures.multiply(powerTerm, childPower);
                        node._addParam(childTerm);
                        node._addParam(powerTerm);

                        performNumericalOptimizations = true;
                    } else if (node.params[0].name === '\\%') {
                        numberOfPercentChilds = EquationEngine.TreeProcedures._getNumberOfPercentChildren(node);
                        leftChild = node.params[1];
                        percentChild = EquationEngine.TreeProcedures._getPercentChild(node.params[0]);
                        sign = percentChild.sign;
                        value = Math.pow(0.01, numberOfPercentChilds);
                        value = Math.pow(value, leftChild.value);
                        value *= percentChild.value;
                        replacementNode = EquationEngine.TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', sign, void 0);
                        replacementNode.value = value;
                        EquationEngine.TreeProcedures._removeAllParams(node);
                        node.convertToTerminal(replacementNode);
                    }
                    break;

                case 'do':
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'optimizing ' + node + ' with params ' + node.params, []);
                    doChildParams = EquationEngine.TreeProcedures._extractAllParams(node);
                    sign = node.sign;
                    EquationEngine.TreeProcedures._convertTreeNodeTo(node, doChildParams[0]);
                    sign = EquationEngine.TreeProcedures._multiplySigns(sign, doChildParams[0].sign);

                    if (doChildParams[0].name === '+' && sign === '-') {
                        EquationEngine.TreeProcedures.negateTree(node);
                    } else {
                        //pass on sign from parent do to children
                        node.sign = sign;
                    }
                    break;

                case '!':
                    if (node.params[0].name === '\\%') {
                        numberOfPercentChilds = EquationEngine.TreeProcedures._getNumberOfPercentChildren(node);
                        percentChild = EquationEngine.TreeProcedures._getPercentChild(node.params[0]);
                        sign = percentChild.sign;
                        value = Math.pow(0.01, numberOfPercentChilds);
                        value = EquationEngine.TreeProcedures._mathFunctions.performMathematicalCalculations('!', [value], EquationEngine.TreeProcedures._getUnits(node));
                        value *= percentChild.value;
                        replacementNode = EquationEngine.TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', sign, void 0);
                        replacementNode.value = value;
                        EquationEngine.TreeProcedures._removeAllParams(node);
                        node.convertToTerminal(replacementNode);
                    }
                    break;
            }
            if (performNumericalOptimizations) {
                EquationEngine.TreeProcedures._performNumericalOptimizations(node, equationData);
            }
        },

        /**
            Get the number of percent child for the node
            @method _performStructuralOptimizations
            @private
            @param node{Object} node for which the number of percent children have to be found out
            @return {Number} number of percent children present
            @static
        **/
        "_getNumberOfPercentChildren": function(node) {
            var numberOfPercentChildren = 0,
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                childCounter,
                childLength,
                currentChild;
            if (!node.isTerminal) {
                childCounter = 0;
                childLength = node.params.length;
                for (childCounter; childCounter < childLength; childCounter++) {
                    currentChild = node.params[childCounter];
                    if (currentChild.name === '\\%') {
                        numberOfPercentChildren++;
                        numberOfPercentChildren += EquationEngine.TreeProcedures._getNumberOfPercentChildren(currentChild);
                    }
                }
            }
            return numberOfPercentChildren;
        },

        /**
            Get child node of percent node
            @method _getPercentChild
            @private
            @param node{Object} percent node for which the child has to be found out
            @return node{Object} percent child node
            @static
        **/
        "_getPercentChild": function(node) {
            if (node.params[0].name === '\\%') {
                return MathUtilities.Components.EquationEngine.Models.TreeProcedures._getPercentChild(node.params[0]);
            }
            return node.params[0];
        },


        /**
        Converts (a+b)*(c+d) into ac+ad+bc+bd.
        @method _expandMultiplication
        @private
        @param term1{Object} first of the multiplied terms
        @param term2{Object} second of the multiplied terms
        @return '\\cdot' rootNode of the multiplied term
        @static
        **/
        "_expandMultiplication": function(term1, term2) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                term1Params,
                parentNode,
                incinerateTerm1Params,
                incinerateTerm2Params,
                term2Params,
                i,
                j,
                temp;

            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'multiplying ' + term1 + ' to ' + term2, []);
            //this function assumes that parent is cdot...since it is designed for cdot expansion
            if (term1.name !== '+' && term2.name !== '+') {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand, 'Both terms are not + series...just multiplying', []);
                return EquationEngine.TreeProcedures.multiply(term1, term2);
            }

            if (term1.name === '+') {
                term1Params = EquationEngine.TreeProcedures._extractAllParams(term1);
                parentNode = term1;
                incinerateTerm1Params = true;
            } else {
                term1Params = [term1];
                incinerateTerm1Params = false;
            }

            if (term2.name === '+') {
                term2Params = EquationEngine.TreeProcedures._extractAllParams(term2);

                incinerateTerm2Params = true;

                if (parentNode === void 0) {
                    parentNode = term2;
                } else {
                    term2.incinerate();
                }

            } else {
                term2Params = [term2];
                incinerateTerm2Params = false;
            }
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand, 'term1 params ' + term1Params, []);
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand, 'term2 params ' + term1Params, []);

            //if parent is not declared then skip adding
            if (parentNode === void 0) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand, 'Parent node not found...skip expand multiplication', []);
                return void 0;
            }


            for (i = 0; i < term1Params.length; i++) {
                for (j = 0; j < term2Params.length; j++) {
                    temp = EquationEngine.TreeProcedures.multiply(
                        EquationEngine.TreeProcedures._clone(term1Params[i]),
                        EquationEngine.TreeProcedures._clone(term2Params[j]));
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.expand, '>>>' + temp, []);
                    parentNode._addParam(temp);
                }
            }

            if (incinerateTerm1Params) {
                while (term1Params.length > 0) {
                    term1Params[0].incinerate();
                    term1Params.shift();
                }
            }

            if (incinerateTerm2Params) {
                while (term2Params.length > 0) {
                    term2Params[0].incinerate();
                    term2Params.shift();
                }
            }
            return parentNode;
        },

        /**
        Removes all parameters from the node and returns the array of those params. The node is NOT incinerated.
        @method _extractAllParams
        @private
        @param node{Object} node to extract parameters from
        @return Array of all params from node
        @static
        **/
        "_extractAllParams": function(node) {
            var allParams = [];
            while (node.params.length > 0) {
                allParams.push(node._removeParam(node.params[0], false));
            }
            return allParams;
        },



        /**
        Removes all parameters from the node. It provides option whether the parameters are to be incinerated.
        @method _removeAllParams
        @private
        @param node{Object} node to remove params from
        @param shouldBeIncinerated{Boolean} should the params be incinerated?
        @return Void
        @static
        **/
        "_removeAllParams": function(node, shouldBeIncinerated) {
            if (shouldBeIncinerated === void 0) {
                shouldBeIncinerated = true;
            }
            while (node.params.length > 0) {
                node._removeParam(node.params[0], shouldBeIncinerated);
            }
        },

        /**
        returns number of params that are nodes with function '+'. eg. in term \\cdot(+(a,b), +(c,d)) the count will be 2


        @method _getAdditionGroupCount
        @private
        @param params{Array} array of params to search in
        @return {Integer} count of the '+' nodes
        @static
        **/
        "_getAdditionGroupCount": function(params) {
            var iCount = 0,
                i = 0;
            for (; i < params.length; i++) {
                if (params[i].name === '+') {
                    iCount++;
                }
            }
            return iCount;

        },

        "transferSignToExpandedTerms": function(node) {
            var childLength,
                childCounter,
                parentSign = node.sign,
                nodeChildren,
                EquationEngine = MathUtilities.Components.EquationEngine.Models;

            if (!node.isTerminal && parentSign === '-') {
                nodeChildren = node.params;
                childLength = nodeChildren.length;
                for (childCounter = 0; childCounter < childLength; childCounter++) {
                    nodeChildren[childCounter].sign = EquationEngine.TreeProcedures._multiplySigns(parentSign, nodeChildren[childCounter].sign);
                }
                node.sign = '+';
            }
        },

        /**
        Appends all params from oldNode to existing parameters of newNode.

        @method _adoptAllParams
        @private
        @param newNode{Object} params will be added in this node
        @param oldNode{Object} params will be added from this node
        @return
        @static
        **/
        "_adoptAllParams": function(oldNode, newNode) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models;
            if (oldNode === newNode) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Skipping adopting your own params -_-', []);
                return void 0;
            }
            while (oldNode.params.length > 0) {
                newNode._addParam(oldNode._removeParam(0, false));
            }
        },


        /**
        Remove all the terms with which has provided free variable in it. eg.
        *REVIEW*

        @method _separateTermsWithFreeVariable
        @private
        @param terms {Array} tokens generate from equation
        @param freeVar {Object} variables present in equation
        @return Object
        @static
        **/
        "_separateTermsWithFreeVariable": function(terms, freeVar, hasCoefficient) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                termsWithFreeVariable = [],
                termCounter;
            for (termCounter = 0; termCounter < terms.length; termCounter++) {
                if (EquationEngine.TreeProcedures._hasFreeVariable(terms[termCounter], freeVar, hasCoefficient)) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'term ' + terms[termCounter] + ' have freevar ' + freeVar, []);
                    termsWithFreeVariable.push(terms[termCounter]);
                    terms.splice(termCounter, 1);
                    termCounter--;
                } else {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'term ' + terms[termCounter] +
                        '  doesn\'t have freevar ' + freeVar, []);
                }
            }
            return termsWithFreeVariable;
        },

        /**
        Checks if the term has the freeVariable in it.


        @method _hasFreeVariable
        @private
        @param nodeOrTerminal{Object} node/terminal to search in
        @param freeVariable{String} name of the free variable
        @return {Boolean}
        @static
        **/
        "_hasFreeVariable": function(nodeOrTerminal, freeVariable, hasCoefficient) {
            if (nodeOrTerminal.isTerminal && hasCoefficient) {
                return nodeOrTerminal.type === 'var';
            }
            if (nodeOrTerminal.isTerminal) {
                return nodeOrTerminal.type === 'var' && nodeOrTerminal.value === freeVariable;
            } else {
                var result,
                    EquationEngine = MathUtilities.Components.EquationEngine.Models,
                    paramCounter;
                for (paramCounter = 0; paramCounter < nodeOrTerminal.params.length; paramCounter++) {
                    result = EquationEngine.TreeProcedures._hasFreeVariable(nodeOrTerminal.params[paramCounter], freeVariable, hasCoefficient);
                    if (result) {
                        return true;
                    }
                }
                return false;
            }
        },


        /**
        Converts the tree node to another treeNode or Terminal.

        @method _convertTreeNodeTo
        @private
        @param node{Object} node to convert
        @param newNodeName{Object} can be string or object, if its a string then simply name is assigned otherwise all params are copied from the newNode as well.
        @param calculateSign{boolean} tells if sign of resultant node should be same or not.
        @return Void
        @static
        **/
        "_convertTreeNodeTo": function(node, newNodeName, calculateSign) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                allParams;
            if (node.isTerminal) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Cant convert terminal to a NODE', []);
                return void 0;
            }
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Converting the tree node ' + node +
                ' from ' + node.name + ' to ' + newNodeName, []);

            if (typeof newNodeName === 'string') {
                node.name = newNodeName;
                node.maxParams = EquationEngine.TreeProcedures._productions.getMaximumParameters(newNodeName);
            } else {
                if (newNodeName.isTerminal) {
                    node.convertToTerminal(newNodeName, calculateSign);
                } else {
                    node.name = newNodeName.name;
                    node.sign = calculateSign ? EquationEngine.TreeProcedures._multiplySigns(node.sign, newNodeName.sign) : newNodeName.sign;
                    node.value = newNodeName.value;
                    node.maxParams = EquationEngine.TreeProcedures._productions.getMaximumParameters(node.name);

                    allParams = EquationEngine.TreeProcedures._extractAllParams(newNodeName);
                    EquationEngine.TreeProcedures._removeAllParams(node);

                    while (allParams.length > 0) {
                        node._addParam(allParams.shift());
                    }
                }
            }
            if (node.maxParams === Infinity) {
                node.isEmpty = true;
            }
        },

        /**
        Get units from the node.
        @method _getUnits
        @private
        @param node{Object}
        @return
        @static
        **/
        "_getUnits": function(node) {
            var param = node.params[0];
            if (param.isTerminal) {
                return param.units;
            } else {
                return MathUtilities.Components.EquationEngine.Models.TreeProcedures._getUnits(param);
            }
        },

        /**
        Function to return values of child. All child should be terminal nodes
        @method _getAllParamsValues
        @private
        @param node{Object} The tree node object the values of whose children are to be found out.
        @return {Array} array of values of child nodes
        @static
        **/
        "_getAllParamsValues": function(node) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                values = [],
                paramChildCounter = 0,
                paramChildsLength = node.params.length,
                currentChild;

            for (paramChildCounter; paramChildCounter < paramChildsLength; paramChildCounter++) {
                currentChild = node.params[paramChildCounter];
                if (currentChild.isTerminal) {
                    values.push(EquationEngine.TreeProcedures._getValueFromParam(currentChild));
                } else {

                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[FAIL ]' +
                        'The Node provided is not terminal', [EquationEngine.Parser._NSTYLE]);
                }
            }
            return values;
        },

        "checkForInfinity": function(equationData, node) {
            if (typeof node === 'undefined') {
                return void 0;
            }
            if (!equationData.isCanBeSolved()) {
                return false;
            }
            if (node.isTerminal) {
                if (node.value === Infinity || node.value === -Infinity) {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('InfinityPlot');
                    return false;
                }
            } else {
                var childNodes = node.params,
                    EquationEngine = MathUtilities.Components.EquationEngine.Models,
                    childNodesLength = childNodes.length,
                    childCounter;
                for (childCounter = 0; childCounter < childNodesLength; childCounter++) {
                    if (!EquationEngine.TreeProcedures.checkForInfinity(equationData, childNodes[childCounter])) {
                        return false;
                    }
                }
            }
        },

        /**
        Function to get value of a node . The node has to be terminal node.
        @method _getValueFromParam
        @private
        @param node{Object} The node object whose value has to be retrieved
        @return {Integer} the value or else null
        @static
        **/
        "_getValueFromParam": function(node) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                value;
            if (node.isTerminal) {
                value = Number(node.value);
                if (isNaN(value)) {
                    return node.value;
                }
                if (node.sign === '-' && value !== 0) {
                    return -1 * value;
                }
                return value;

            }
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Value for a non terminal node was asked' + node.name, []);
            return null;
        },


        "_extractTerminalSign": function(terminal) {
            var val = MathUtilities.Components.EquationEngine.Models.TreeProcedures._getValueFromParam(terminal);
            terminal.sign = "+";
            terminal.value = Math.abs(val);
            return val < 0 ? "-" : "+";
        },

        /**

        Returns resultant sign when two digit/var/constants are multiplied with given sign.
        @method _multiplySigns
        @private
        @param sign1{String} '+' or '-'
        @param sign2{String} '+' or '-'
        @return resultant sign
        @static
        **/
        "_multiplySigns": function(sign1, sign2) {
            if (sign1 === "+" && sign2 === "+") {
                return "+";
            }
            if (sign1 === "+" || sign2 === "+") {
                //means one of them is -ve
                return "-";
            }
            //means both are -ve
            return "+";

        },

        /**

            Returns addition of all terminal digit values of addition node
            @method _getAdditionValue
            @private
            @param node{Object} addition node
            @return {Number} addition value
            @static
        **/
        "_getAdditionValue": function(node) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                value = null,
                childLength = node.params.length,
                childCounter = 0,
                currentChild;
            for (childCounter; childCounter < childLength; childCounter++) {
                currentChild = node.params[childCounter];
                if (currentChild.isTerminal && currentChild.type === 'digit') {
                    if (value === null) {
                        value = 0;
                    }
                    value += EquationEngine.TreeProcedures._getValueFromParam(currentChild);
                }
            }
            return value;
        },

        /**

           Simplify addition case of percent

           @method _performPercentOptimizations
           @private
           @param node{Object} percent node whose parent is addition
           @return {Number} Percent solved value
           @static
       **/
        "_performPercentOptimizations": function(node) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                parentNode = node.parentNode,
                value,
                allIncineratedChilds,
                percentOfValue;
            if (parentNode !== void 0) {
                if (parentNode.name === '+') {
                    percentOfValue = EquationEngine.TreeProcedures._getAdditionValue(parentNode);
                    if (parentNode.onlyPercent === void 0) {
                        parentNode.onlyPercent = percentOfValue === null;
                    }
                    if (parentNode.onlyPercent) {
                        value = EquationEngine.TreeProcedures._mathFunctions.performMathematicalCalculations(node.name, [EquationEngine.TreeProcedures._getValueFromParam(node.params[0])], EquationEngine.TreeProcedures._getUnits(node));
                    } else {
                        value = EquationEngine.TreeProcedures._mathFunctions.performMathematicalCalculations(node.name, [percentOfValue, EquationEngine.TreeProcedures._getValueFromParam(node.params[0])], EquationEngine.TreeProcedures._getUnits(node));
                    }
                    if (node.sign === '-') {
                        value *= -1;
                    }
                    allIncineratedChilds = EquationEngine.TreeProcedures._extractAllParams(node, false);
                    node.convertToTerminal(allIncineratedChilds[0]);
                    node.sign = allIncineratedChilds[0].sign;
                    node.value = value;
                    allIncineratedChilds[0].incinerate();
                } else if (parentNode.name === '^' || parentNode.name === '!') {
                    return void 0;
                } else {
                    return EquationEngine.TreeProcedures._mathFunctions.performMathematicalCalculations(node.name, [EquationEngine.TreeProcedures._getValueFromParam(node.params[0])], EquationEngine.TreeProcedures._getUnits(node));
                }
            } else {
                return EquationEngine.TreeProcedures._mathFunctions.performMathematicalCalculations(node.name, [EquationEngine.TreeProcedures._getValueFromParam(node.params[0])], EquationEngine.TreeProcedures._getUnits(node));
            }
        },
        "combineAllFracs": function(node, root, pushIntoNumerator, equationData, numArr, denArr) {
            var TreeProcedures = MathUtilities.Components.EquationEngine.Models.TreeProcedures,
                looper, params, i, localIndex, curNode, tempArr,
                tempNode, lastProcessed, pushIntoRoot, index, removeEmptyNode;

            removeEmptyNode = function(node) {
                if (!node.isTerminal && node.params.length === 0) {
                    if (node.parentNode && node.parentNode.name.indexOf('incinerated') === -1) {
                        node.parentNode._removeParam(node);
                    } else {
                        node.incinerate();
                    }
                    return;
                }
                for (looper = 0; looper < node.params.length; looper++) {
                    if (!node.params[looper].isTerminal && node.params[looper].params.length === 0) {
                        node._removeParam(looper);
                        return;
                    }
                    if (!node.params[looper].isTerminal) {
                        removeEmptyNode(node.params[looper]);
                    }
                }
            };
            pushIntoRoot = function(node, inNumerator) {
                if (inNumerator) {
                    numArr.push(node);
                } else {
                    denArr.push(node);
                }
            };
            if (node === root) {
                numArr = [];
                denArr = [];
                if (node.name === '\\sqrt') {
                    return;
                }
                if (node.name !== '\\frac') {
                    tempNode = TreeProcedures._getParseTreeNodeObject(void 0, '\\frac', '+');
                    TreeProcedures._getParseTreeTerminalObject(tempNode, 'digit', '+').value = 1;
                    TreeProcedures._getParseTreeTerminalObject(tempNode, 'digit', '+').value = 1;
                    params = TreeProcedures._extractAllParams(node);
                    for (i = 0; i < params.length; i++) {
                        tempNode.params[0] = TreeProcedures.multiply(tempNode.params[0], params[i]);
                    }
                    TreeProcedures._convertTreeNodeTo(node, tempNode, true);
                }
                pushIntoNumerator = true;
            } else {
                if (node.name === '\\sqrt') {
                    if (!node.params[1].isTerminal) {
                        node.params[1].simplify(equationData);
                    }
                    return;
                }
            }
            if (!node.isTerminal) {
                localIndex = 0;
                while (node.params.length > 0) {
                    curNode = node._removeParam(0, false);
                    localIndex++;
                    if (curNode.name === '\\cdot' || curNode.name === '\\frac') {
                        if (node.name === '\\frac' && localIndex === 2) { // denominator
                            TreeProcedures.combineAllFracs(curNode, root, !pushIntoNumerator, equationData, numArr, denArr);
                        } else {
                            TreeProcedures.combineAllFracs(curNode, root, pushIntoNumerator, equationData, numArr, denArr);
                        }

                    } else {
                        if (node.name === '\\frac' && localIndex === 2) { // denominator
                            if (curNode.isTerminal && Number(curNode.value) === 0) {
                                equationData.setCanBeSolved(false);
                                return;
                            }
                            pushIntoRoot(curNode, !pushIntoNumerator);
                        } else {
                            pushIntoRoot(curNode, pushIntoNumerator);
                        }
                    }
                }
                if (node !== root && node.params.length === 0) {
                    root.sign = TreeProcedures._multiplySigns(root.sign, node.sign);
                    node.incinerate();
                }
            } else {
                pushIntoRoot(node, pushIntoNumerator);
            }
            if (node === root) {
                tempArr = [numArr, denArr];
                for (looper in tempArr) {
                    if (tempArr[looper].length == 1) {
                        root._addParam(tempArr[looper].pop());
                    } else {
                        tempNode = TreeProcedures._getParseTreeNodeObject(void 0, '\\cdot', '+');
                        while (tempArr[looper].length > 0) {
                            tempNode._addParam(tempArr[looper].pop());
                        }
                        root._addParam(tempNode);
                    }
                }
            }
        },
        "isFracInsideFrac": function(node, fracFound) {
            var looper;
            if (fracFound === void 0) {
                fracFound = 0;
            }
            if (node.name === '\\frac') {
                fracFound++;
            }
            if (fracFound > 1) {
                return true;
            }
            if (!node.isTerminal) {
                for (looper = 0; looper < node.params.length; looper++) {
                    if (MathUtilities.Components.EquationEngine.Models.TreeProcedures.isFracInsideFrac(node.params[looper], fracFound)) {
                        return true;
                    }
                }
            }
        },
        "isFractionOptimizationRequired": function(node, root, fracFound) {
            var looper = 0,
                result,
                TreeProcedures = MathUtilities.Components.EquationEngine.Models.TreeProcedures;
            if (node === root && node.name === '^') {
                return false;
            }
            if (node.name === '\\sqrt' || node.irrational || (node.isTerminal && isFinite(node.value) && node.value % 1 !== 0)) {
                return true;
            }
            if (fracFound === void 0) {
                fracFound = 0;
            }
            if (node.name === '\\frac') {
                fracFound++;
                if (!TreeProcedures.isFracInsideFrac(root)) {
                    return true;
                }
            }
            if (!node.isTerminal) {
                for (; looper < node.params.length; looper++) {
                    result = TreeProcedures.isFractionOptimizationRequired(node.params[looper], root, fracFound);
                    if (result !== void 0) {
                        return result;
                    }
                }
            }
            if (node === root && fracFound > 0) {
                return fracFound === 1;
            }
        },

        "_performFractionAdjustment": function(node, equationData, root) {
            if (equationData.getDirectives().FDFlagMethod !== 'sciCalculator' || !equationData.isCanBeSolved() ||
                (node.isTerminal && !node.irrational) ||
                (!node.isTerminal && ["\\frac", "\\sqrt", "\\cdot", "do"].indexOf(node.name) === -1) ||
                node.simplified) {
                return;
            }
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                TreeProcedures = EquationEngine.TreeProcedures,
                gcd, newNodeCreated = false,
                factor, multiplyNode, simplifiedRoot, wholeNumeratorNode, wholeDenominatorNode,
                wholeNumber, rootNumber, firstParam, length,
                sqrt2Term, sqrtNode, result, sqrtRes, sqrtResSign = '+',
                i,
                lastProcessed, convertToFraction,
                resultNode, value, radicalInDenom, searchIn, shiftedRadical, cdotParam, tempDenom, hasNegativeSign = false,
                sqrtResult = 1,
                sqrtResultNode, sqrtAnswerNode, tempValue, nonTerminalRootNodes = [],
                fracNode, fracNodeNum, curParam, pendingIrrationals = [],
                dissolveDecimalIntoFraction, convertDecimalNodeToFrac,
                tempSign, params,
                fracNodeDen, fractionForDecimal, fracForDecimalNum, fracForDecimalDen, tempNode,
                allowedNodeArr = ["\\sqrt", "\\frac", "\\cdot"];
            if (node === root && TreeProcedures.isFracInsideFrac(node)) {
                TreeProcedures.combineAllFracs(node, root, void 0, equationData);
            }
            node.simplified = true;

            convertToFraction = function(value, forDenominator) {
                if (!isFinite(value)) {
                    return;
                }
                var tempValue;
                fractionForDecimal = MathUtilities.Components.FractDec.Models.FD.toFraction(value);
                if (forDenominator) {
                    tempValue = fractionForDecimal.denominator;
                    fractionForDecimal.denominator = fractionForDecimal.numerator;
                    fractionForDecimal.numerator = tempValue;
                }

                fracForDecimalNum = TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', '+');
                fracForDecimalNum.value = fractionForDecimal.numerator;
                fracForDecimalDen = TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', '+');
                fracForDecimalDen.value = fractionForDecimal.denominator;

                if (!fracNode) {
                    fracNode = TreeProcedures._getParseTreeNodeObject(void 0, '\\frac', '+');
                }
                fracNodeNum = fracNodeNum || TreeProcedures._getParseTreeNodeObject(fracNode, '\\cdot', '+');
                fracNodeDen = fracNodeDen || TreeProcedures._getParseTreeNodeObject(fracNode, '\\cdot', '+');
                fracNode.params[0]._addParam(fracForDecimalNum);
                fracNode.params[1]._addParam(fracForDecimalDen);
            };
            convertDecimalNodeToFrac = function(node) {
                tempNode = TreeProcedures._getParseTreeNodeObject(void 0, '\\frac', '+');
                TreeProcedures._getParseTreeTerminalObject(tempNode, 'digit', '+');
                TreeProcedures._getParseTreeTerminalObject(tempNode, 'digit', '+');
                fractionForDecimal = MathUtilities.Components.FractDec.Models.FD.toFraction(node.value);
                tempNode.params[0].value = fractionForDecimal.numerator;
                tempNode.params[1].value = fractionForDecimal.denominator;
                node.parentNode._addParamAt(tempNode, node.parentNode.params.indexOf(node));
            };
            dissolveDecimalIntoFraction = function(node) {
                var processed = false;
                if (node.params[0].isTerminal && !node.params[0].irrational && isFinite(node.params[0].value) &&
                    node.params[0].value % 1 !== 0) {
                    fractionForDecimal = MathUtilities.Components.FractDec.Models.FD.toFraction(node.params[0].value);
                    if (node.params[1].name === '\\cdot') {
                        tempNode = TreeProcedures._getParseTreeTerminalObject(node.params[1], 'digit', '+');
                        tempNode.value = fractionForDecimal.denominator;
                    } else {
                        tempNode = node._removeParam(1, false);
                        node._addParam(TreeProcedures._getParseTreeNodeObject(void 0, '\\cdot', '+'));
                        node.params[1]._addParam(tempNode);
                        TreeProcedures._getParseTreeTerminalObject(node.params[1], 'digit', '+');
                        node.params[1].params[1].value = fractionForDecimal.denominator;
                    }
                    tempSign = node._removeParam(0, false).sign;
                    tempNode = node._removeParam(0, false);
                    node._addParam(TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', tempSign));
                    node.params[0].value = fractionForDecimal.numerator;
                    node._addParam(tempNode);
                    processed = true;
                }
                if (node.params[1].isTerminal && !node.params[1].irrational && isFinite(node.params[1].value) &&
                    node.params[1].value % 1 !== 0) {
                    fractionForDecimal = MathUtilities.Components.FractDec.Models.FD.toFraction(node.params[1].value);
                    if (node.params[0].name === '\\cdot') {
                        tempNode = TreeProcedures._getParseTreeTerminalObject(node.params[0], 'digit', '+');
                        tempNode.value = fractionForDecimal.denominator;
                    } else {
                        tempNode = node._removeParam(0, false);
                        curParam = node._removeParam(0, false);
                        node._addParam(TreeProcedures._getParseTreeNodeObject(void 0, '\\cdot', '+'));
                        node._addParam(curParam);
                        node.params[0]._addParam(tempNode);
                        TreeProcedures._getParseTreeTerminalObject(node.params[0], 'digit', '+');
                        node.params[0].params[1].value = fractionForDecimal.denominator;
                    }
                    tempSign = node._removeParam(1, false).sign;
                    node._addParam(TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', tempSign));
                    node.params[1].value = fractionForDecimal.numerator;
                    processed = true;
                }
                return processed;
            };
            switch (node.name) {
                case "\\frac":
                    //Solving nested frac
                    if (node.params[0].name === '\\frac') {
                        node.params[0].simplify(equationData);
                    } else if (node.params[1].name === '\\frac') {
                        node.params[1].simplify(equationData);
                    }

                    //dissolve decimals immediately inside frac
                    dissolveDecimalIntoFraction(node);

                    //process DENOMINATOR recursively if its sqrt, frac or cdot else simply dissolve
                    if (allowedNodeArr.indexOf(node.params[1].name) > -1) {
                        TreeProcedures._performFractionAdjustment(node.params[1], equationData, root);
                    } else if (!node.params[1].isTerminal) {
                        node.params[1].simplify(equationData);
                        dissolveDecimalIntoFraction(node);
                    }

                    //find radicals in denominator
                    if (!node.params[1].isTerminal) {
                        if (node.params[1].name === '\\sqrt') {
                            radicalInDenom = node.params[1];
                        } else if (node.params[1].name === '\\cdot') {
                            for (i = 0; i < node.params[1].params.length; i++) {
                                if (node.params[1].params[i].name === '\\sqrt') {
                                    radicalInDenom = node.params[1].params[i];
                                    break;
                                }

                            }
                        }
                    } else if (node.params[1].value % 1 !== 0) {
                        convertToFraction(node.params[1].value, true);
                    }

                    //promoting radical to numerator
                    if (radicalInDenom) {
                        shiftedRadical = TreeProcedures._clone(radicalInDenom);
                        cdotParam = TreeProcedures.multiply(shiftedRadical, node.params[0]);
                        node._removeParam(0, false);
                        tempDenom = node._removeParam(0, false);
                        node._addParam(cdotParam);
                        node._addParam(tempDenom);

                        TreeProcedures._convertTreeNodeTo(radicalInDenom, TreeProcedures._clone(radicalInDenom.params[1]));
                        radicalInDenom.parentNode.simplified = false;
                        TreeProcedures._performFractionAdjustment(radicalInDenom.parentNode, equationData, root);
                    }

                    //don't continue if its a terminal node
                    if (node.isTerminal) {
                        return;
                    }

                    //process NUMERATOR recursively if its sqrt, frac or cdot else simply dissolve
                    if (allowedNodeArr.indexOf(node.params[0].name) > -1) {
                        TreeProcedures._performFractionAdjustment(node.params[0], equationData, root);
                    } else if (!node.params[0].isTerminal) {
                        node.params[0].simplify(equationData);
                        if (dissolveDecimalIntoFraction(node)) {
                            node.simplified = false;
                            TreeProcedures._performFractionAdjustment(node, equationData, root);
                        }
                    } else if (!node.params[0].irrational && node.params[0].value % 1 !== 0) {
                        convertToFraction(node.params[0].value);
                    }

                    //simply fraction
                    if (node.name === '\\frac') {
                        wholeNumeratorNode = this.getRationalTerminalNode(node.params[0]);
                        wholeDenominatorNode = this.getRationalTerminalNode(node.params[1]);
                        if (wholeNumeratorNode && wholeDenominatorNode) {
                            gcd = Math.abs(TreeProcedures._mathFunctions._calculateGcd(wholeNumeratorNode.value, wholeDenominatorNode.value));
                            if (gcd && Math.abs(gcd) > 10e-7) { // 10e-7 is Threshold
                                if (gcd !== parseInt(wholeNumeratorNode.value, 10)) {
                                    wholeNumeratorNode.value /= gcd;
                                } else {
                                    wholeNumeratorNode.value /= gcd;
                                    if (wholeNumeratorNode.parentNode !== node) {
                                        wholeNumeratorNode.parentNode._removeParam(wholeNumeratorNode, true);
                                    }
                                }
                                if (gcd !== Number(wholeDenominatorNode.value)) {
                                    wholeDenominatorNode.value /= gcd;
                                } else {
                                    if ((wholeDenominatorNode.isTerminal && TreeProcedures._getValueFromParam(wholeDenominatorNode) < 0) ||
                                        (!wholeDenominatorNode.isTerminal && wholeDenominatorNode.sign === '-')) {
                                        TreeProcedures.negateTree(node);
                                    }
                                    if (wholeDenominatorNode.parentNode === node) {
                                        wholeDenominatorNode.value /= gcd;
                                        TreeProcedures._convertTreeNodeTo(node, TreeProcedures._clone(node.params[0]), true);
                                    } else {
                                        wholeDenominatorNode.parentNode._removeParam(wholeDenominatorNode, true);
                                    }
                                }
                            }
                        }
                    }
                    //process signs
                    hasNegativeSign = TreeProcedures.processAndReturnSign(node);
                    if (hasNegativeSign && !node.isTerminal) {
                        TreeProcedures.negateTree(node);
                    }
                    if (node.name === "\\frac" && node.params[1].isTerminal && node.params[1].value == 1) {
                        TreeProcedures._convertTreeNodeTo(node, TreeProcedures._clone(node.params[0]), true);
                    }
                    break;

                case "\\sqrt":
                    if (node.params[0].value !== "2") {
                        node.simplify(equationData);
                        return;
                    }
                    firstParam = node.params[1];

                    if (!firstParam.isTerminal) {
                        firstParam.simplify(equationData);
                    }
                    // Simplifying square root terms
                    wholeNumber = TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', '+');
                    rootNumber = TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', '+');
                    if (TreeProcedures._getValueFromParam(firstParam) > 1e+21) {
                        node.simplify(equationData);
                        return;
                    }
                    simplifiedRoot = this.simplifyRoot(TreeProcedures._getValueFromParam(firstParam));
                    wholeNumber.value = simplifiedRoot.outside;
                    rootNumber.value = simplifiedRoot.inside;
                    if (rootNumber.value < 0) {
                        equationData.setCanBeSolved(false);
                        return;
                    }
                    if (isFinite(rootNumber.value) && rootNumber.value % 1 !== 0) {
                        if ((rootNumber.value + '').indexOf('e') > -1) {
                            rootNumber.value = geomFunctions.convertExponentialToDecimal(rootNumber.value);
                        }
                        length = (rootNumber.value + '').split('.')[1].length;
                        //checking if a number is a perfect square after ignoring decimal
                        if (length % 2 === 0 && Math.sqrt(rootNumber.value * Math.pow(10, length)) % 1 === 0) {
                            node.simplify(equationData);
                            if (node.value % 1 !== 0 && isFinite(node.value) && node !== root) {
                                convertDecimalNodeToFrac(node);
                            }
                            break;
                        }
                    }
                    if (firstParam.value === rootNumber.value) {
                        break;
                    }

                    if (!node.parentNode || node.parentNode.name !== "\\cdot") {
                        sqrt2Term = node._removeParam(0, false);
                        node._removeParam(0, false);

                        TreeProcedures._convertTreeNodeTo(node, "\\cdot");

                        sqrtNode = TreeProcedures._getParseTreeNodeObject(node, '\\sqrt', '+', void 0);
                        sqrtNode._addParam(sqrt2Term);
                        sqrtNode._addParam(rootNumber);
                        multiplyNode = node;
                        multiplyNode.simplified = false;

                        newNodeCreated = true;

                    } else {
                        multiplyNode = node.parentNode;
                        sqrtNode = node;
                        sqrtNode.params[1].value = rootNumber.value;
                        sqrtNode.irrational = true;
                    }
                    multiplyNode._addParam(wholeNumber);
                    if (sqrtNode.params[1].value === 1) {
                        sqrtNode.parentNode.sign = TreeProcedures._multiplySigns(sqrtNode.parentNode.sign, sqrtNode.sign);
                        sqrtNode.parentNode._removeParam(sqrtNode);
                    }

                    if (newNodeCreated) {
                        TreeProcedures._performFractionAdjustment(multiplyNode, equationData, root);
                    }
                    break;

                case "\\cdot":
                    result = 1;
                    sqrtResult = 1;
                    i = 0;

                    while (i < node.params.length) {
                        if (!node.params[i].isTerminal) {
                            lastProcessed = node.params[i];

                            //combine all sqrt results
                            if (node.params[i].name === "\\sqrt") {
                                TreeProcedures._performFractionAdjustment(node.params[i], equationData, root);
                                if (lastProcessed.name === '\\sqrt' && Number(lastProcessed.params[0].value) === 2) { // check for 2nd root
                                    tempValue = lastProcessed.params[1].value;
                                    if (sqrtResult !== 1 && tempValue > sqrtResult) {
                                        factor = sqrtResult;
                                        sqrtResult = tempValue;
                                        tempValue = factor;
                                    }
                                    sqrtResSign = TreeProcedures._multiplySigns(sqrtResSign, lastProcessed.params[1].sign);
                                    if (sqrtResult !== 1 && sqrtResult % tempValue === 0) {
                                        result *= tempValue;
                                        sqrtResult /= tempValue;
                                    } else {
                                        sqrtResult *= tempValue;
                                    }
                                    if (lastProcessed.sign === '-') {
                                        hasNegativeSign = !hasNegativeSign;
                                    }
                                    node._removeParam(lastProcessed);
                                    continue;
                                }
                            } else if (node.params[i].name === "\\frac") {
                                // simplify fractions based on their child nodes.

                                if (fracNode) {
                                    fracNode.sign = TreeProcedures._multiplySigns(fracNode.sign, node.params[i].sign);
                                    if (node.params[i].params[0].name === '\\cdot') {
                                        while (node.params[i].params[0].params.length > 0) {
                                            curParam = node.params[i].params[0]._removeParam(0, false);
                                            if (curParam.isTerminal && TreeProcedures._getValueFromParam(curParam) === 0) {
                                                equationData.setCanBeSolved(false);
                                                return;
                                            }
                                            if (curParam.isTerminal && curParam.value % 1 !== 0) {
                                                convertToFraction(curParam.value);
                                                fracNode.sign = TreeProcedures._multiplySigns(fracNode.sign, curParam.sign);
                                            } else {
                                                fracNodeNum._addParam(curParam);
                                            }
                                        }
                                    } else {
                                        if (node.params[i].params[0].isTerminal && TreeProcedures._getValueFromParam(node.params[i].params[0]) === 0) {
                                            equationData.setCanBeSolved(false);
                                            return;
                                        }
                                        if (node.params[i].params[0].isTerminal && node.params[i].params[0].value % 1 !== 0) {
                                            convertToFraction(node.params[i].params[0].value);
                                            fracNode.sign = TreeProcedures._multiplySigns(fracNode.sign, node.params[i].params[0].sign);
                                        } else {
                                            fracNodeNum._addParam(TreeProcedures._clone(node.params[i].params[0]));
                                        }
                                    }
                                    if (node.params[i].params[1].name === '\\cdot') {
                                        while (node.params[i].params[1].params.length > 0) {
                                            curParam = node.params[i].params[1]._removeParam(0, false);
                                            if (curParam.isTerminal && TreeProcedures._getValueFromParam(curParam) === 0) {
                                                equationData.setCanBeSolved(false);
                                                return;
                                            }
                                            if (curParam.isTerminal && curParam.value % 1 !== 0) {
                                                convertToFraction(curParam.value, true);
                                                fracNode.sign = TreeProcedures._multiplySigns(fracNode.sign, curParam.sign);
                                            } else {
                                                fracNodeDen._addParam(curParam);
                                            }
                                        }
                                    } else {
                                        if (node.params[i].params[1].isTerminal && TreeProcedures._getValueFromParam(node.params[i].params[1]) === 0) {
                                            equationData.setCanBeSolved(false);
                                            return;
                                        }
                                        if (node.params[i].params[1].isTerminal && node.params[i].params[1].value % 1 !== 0) {
                                            convertToFraction(node.params[i].params[1].value, true);
                                            fracNode.sign = TreeProcedures._multiplySigns(fracNode.sign, node.params[i].params[1].sign);
                                        } else {
                                            fracNodeDen._addParam(TreeProcedures._clone(node.params[i].params[1]));
                                        }
                                    }
                                } else {
                                    fracNode = TreeProcedures._getParseTreeNodeObject(void 0, '\\frac', node.params[i].sign);
                                    if (node.params[i].params[0].name !== '\\cdot') {
                                        if (node.params[i].params[0].isTerminal && node.params[i].params[0].value % 1 !== 0) {
                                            convertToFraction(node.params[i].params[0].value);
                                            fracNode.sign = TreeProcedures._multiplySigns(fracNode.sign, node.params[i].params[0].sign);
                                        } else {
                                            fracNodeNum = fracNodeNum || TreeProcedures._getParseTreeNodeObject(fracNode, '\\cdot', '+');
                                            fracNodeNum._addParam(TreeProcedures._clone(node.params[i].params[0]));
                                        }
                                    } else {
                                        fracNodeNum = fracNodeNum || TreeProcedures._clone(node.params[i].params[0]);
                                        fracNode._addParam(fracNodeNum);
                                    }
                                    if (node.params[i].params[1].name !== '\\cdot') {
                                        if (node.params[i].params[1].isTerminal && TreeProcedures._getValueFromParam(node.params[i].params[1]) === 0) {
                                            equationData.setCanBeSolved(false);
                                            return;
                                        }
                                        if (node.params[i].params[1].isTerminal && node.params[i].params[1].value % 1 !== 0) {
                                            convertToFraction(node.params[i].params[1].value, true);
                                            fracNode.sign = TreeProcedures._multiplySigns(fracNode.sign, node.params[i].params[1].sign);
                                        } else {
                                            fracNodeDen = fracNodeDen || TreeProcedures._getParseTreeNodeObject(fracNode, '\\cdot', '+');
                                            fracNodeDen._addParam(TreeProcedures._clone(node.params[i].params[1]));
                                        }
                                    } else {
                                        fracNodeDen = fracNodeDen || TreeProcedures._clone(node.params[i].params[1]);
                                        fracNode._addParam(fracNodeDen);
                                    }

                                }
                            } else {
                                node.params[i].simplify(equationData);
                            }
                            if (!lastProcessed.isTerminal && lastProcessed === node.params[i]) {
                                i++;
                            }
                            continue;
                        }
                        if (node.params[i].irrational) {
                            if (fracNode) {
                                fracNodeNum._addParam(TreeProcedures._clone(node.params[i]));
                            } else {
                                pendingIrrationals.push(TreeProcedures._clone(node.params[i]));
                            }
                            i++;
                        } else {
                            value = TreeProcedures._getValueFromParam(node.params[i]);
                            if (isFinite(value) && value % 1 !== 0) {
                                convertToFraction(value);
                            } else {
                                result *= value;
                            }
                            node._removeParam(i);
                        }
                    }

                    //use sqrtResult to make one sqrt term
                    if (sqrtResult !== 1) {
                        sqrt2Term = TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', '+');
                        sqrt2Term.value = "2"; // 2 specifies that it's a square root
                        sqrtAnswerNode = TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', '+');
                        sqrtAnswerNode.value = sqrtResult;
                        sqrtAnswerNode.sign = sqrtResSign;
                        sqrtAnswerNode.irrational = true;

                        if (hasNegativeSign) {
                            sqrtResultNode = TreeProcedures._getParseTreeNodeObject(node, '\\sqrt', '-', void 0);
                            hasNegativeSign = false;
                        } else {
                            sqrtResultNode = TreeProcedures._getParseTreeNodeObject(node, '\\sqrt', '+', void 0);
                        }
                        sqrtResultNode._addParam(sqrt2Term);
                        sqrtResultNode._addParam(sqrtAnswerNode);
                        if (fracNode) {
                            fracNodeNum._addParam(TreeProcedures._clone(sqrtResultNode));
                        }
                        TreeProcedures._performFractionAdjustment(sqrtResultNode, equationData, root);

                    }

                    if (result === 0) {
                        resultNode = TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', '+');
                        resultNode.value = 0;
                        node.convertToTerminal(resultNode, true);
                    } else {
                        if (result < 0) {
                            hasNegativeSign = !hasNegativeSign;
                            result = Math.abs(result);
                        }
                        resultNode = TreeProcedures._getParseTreeTerminalObject(void 0, 'digit', hasNegativeSign ? '-' : '+');

                        resultNode.value = result;

                        if (node.params.length > 0 && result !== 1) {
                            if (fracNode) {
                                fracNodeNum._addParam(resultNode);
                            } else {
                                node._addParam(resultNode);
                            }
                        } else if (node.params.length === 0) {
                            if (fracNode) {
                                fracNodeNum._addParam(resultNode);
                            } else {
                                node.convertToTerminal(resultNode, true);
                            }
                        } else if (resultNode.sign === '-') {
                            TreeProcedures.negateTree(fracNode ? fracNode : node);
                        }

                    }
                    if (!node.isTerminal) {
                        if (fracNode) {
                            while (pendingIrrationals.length > 0) {
                                fracNode.params[0]._addParam(pendingIrrationals.pop());
                            }
                            TreeProcedures._removeAllParams(node);
                            TreeProcedures._convertTreeNodeTo(node, fracNode, true);
                            node.simplified = false;
                            hasNegativeSign = TreeProcedures.processAndReturnSign(node.params[0]);
                            if (hasNegativeSign) {
                                TreeProcedures.negateTree(node.params[0]);
                            }
                            hasNegativeSign = TreeProcedures.processAndReturnSign(node.params[1]);
                            if (hasNegativeSign) {
                                TreeProcedures.negateTree(node.params[1]);
                            }
                            TreeProcedures._performFractionAdjustment(node, equationData, root);
                        } else {
                            // Sorting result node so that Terminal Rational node are placed first, then Terminal Irrational and
                            // others are placed last.
                            node.params.sort(function(a, b) {
                                return a.isTerminal === b.isTerminal ? 0 : (a.isTerminal < b.isTerminal ? 1 : -1);
                            });
                            node.params.sort(function(a, b) {
                                return a.irrational === b.irrational ? 0 : (a.irrational ? 1 : -1);
                            });
                            hasNegativeSign = TreeProcedures.processAndReturnSign(node);
                            if (hasNegativeSign) {
                                TreeProcedures.negateTree(node);
                            }
                        }
                    }
                    if (node.name === '\\cdot' && node.params[0] && node.params[0].isTerminal) {
                        node.sign = EquationEngine.TreeProcedures._multiplySigns(node.sign,
                            EquationEngine.TreeProcedures._extractTerminalSign(node.params[0]));
                    }
                    break;

            }

            if (node === root && (!node.isTerminal || node.irrational)) {
                if (node.name === '\\frac') {
                    if (!node.params[0].irrational && node.params[0].isTerminal && node.params[0].value % 1 !== 0 &&
                        isFinite(node.params[0].value)) {
                        convertDecimalNodeToFrac(node.params[0]);
                    }
                    if (!node.params[1].irrational && node.params[1].isTerminal && node.params[1].value % 1 !== 0 &&
                        isFinite(node.params[1].value)) {
                        convertDecimalNodeToFrac(node.params[1]);
                    }
                }
                if (MathUtilities.Components.EquationEngine.Models.TreeProcedures.isFracInsideFrac(node)) {
                    node.simplified = false;
                    node.params[0].simplified = false;
                    node.params[1].simplified = false;
                    MathUtilities.Components.EquationEngine.Models.TreeProcedures.combineAllFracs(node, root, void 0, equationData);
                    TreeProcedures._performFractionAdjustment(node, equationData, root);
                }
                equationData.setSimplifiedFractionLatex(TreeProcedures._toLatex(node));
            }

        },
        "processAndReturnSign": function(node) {
            var hasNegativeSign = false,
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                i = 0;
            if (node.isTerminal) {
                return EquationEngine.TreeProcedures._getValueFromParam(node) < 0;
            }
            while (i < node.params.length) {
                if (node.params[i].isTerminal && EquationEngine.TreeProcedures._getValueFromParam(node.params[i]) < 0) {
                    hasNegativeSign = !hasNegativeSign;
                    EquationEngine.TreeProcedures._extractTerminalSign(node.params[i]);
                } else if (node.params[i].sign === '-') {
                    hasNegativeSign = !hasNegativeSign;
                    node.params[i].sign = '+';
                }
                i++;
            }
            return hasNegativeSign;
        },
        "replaceDowithChild": function(node) {
            var looper = 0,
                parent,
                TreeProcedures = MathUtilities.Components.EquationEngine.Models.TreeProcedures;
            if (node.name === 'do') {
                TreeProcedures._convertTreeNodeTo(node, node._removeParam(0, false), true);
                parent = node.parentNode;
                if (parent && node.name === '\\cdot' && parent.name === '\\cdot') {
                    while (node.params.length !== 0) {
                        parent._addParam(node._removeParam(0, false));
                    }
                    parent._removeParam(parent.params.indexOf(node));
                    TreeProcedures.replaceDowithChild(parent);
                    return;
                }
                TreeProcedures.replaceDowithChild(node);
            }
            while (!node.isTerminal && looper < node.params.length) {
                TreeProcedures.replaceDowithChild(node.params[looper]);
                looper++;
            }
        },
        "getRationalTerminalNode": function(node) {
            var tempNode = node;
            if (!tempNode.isTerminal) {
                if (tempNode.name !== '\\cdot') {
                    return;
                }
                tempNode = tempNode.params[0];
            }
            if (!tempNode.irrational && tempNode.isTerminal) {
                return tempNode;
            }
        },
        "simplifyRoot": function(number) {
            var whole = 1,
                root = number,
                arr = [2],
                prime = 2,
                primeSquared,
                getNextPrime;

            getNextPrime = function(num) {
                var isPrime = false,
                    i;
                // finding if next number is divisible by any of the previous prime numbers less than the square root of that number,
                // if not then it is prime.
                // Ensuring that `num` is NOT even
                // because even numbers (except 2)
                // are NOT prime.
                if (num % 2 === 0) {
                    num++;
                }

                while (!isPrime) {
                    isPrime = true;

                    // Starting from index 1 because `num`
                    // is NOT an even number and so
                    // it is NOT divisible by 2 which is
                    // the first element of `arr`.
                    for (i = 1; i < arr.length; i++) {
                        if (num % arr[i] === 0) {
                            isPrime = false;
                            break;
                        } else if (arr[i] > Math.sqrt(num)) { // Any non prime number has at least one factor less than it's square root.
                            break;
                        }
                    }
                    if (!isPrime) {
                        num += 2; // Next odd number
                    }
                }
                arr.push(num);
                return num;
            };

            while ((primeSquared = Math.pow(prime, 2)) <= root) {
                if (root % primeSquared === 0) {
                    root /= primeSquared;
                    whole *= prime;
                } else {
                    prime = getNextPrime(prime + 1);
                }
            }

            return {
                "outside": whole,
                "inside": root
            };
        },

        /**
        Perform numerical optimizations in the equation tree.
        @method _performNumericalOptimizations
        @private
        @param node{Object} node to perform numerical optimizations
        @param equationData{object} to describe various properties for equation
        @return Void
        @static
        **/
        "_performNumericalOptimizations": function(node, equationData) {

            if (node.isTerminal) {
                return void 0;
            }
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                result,
                solvingComplete,
                reducedToNode,
                signFactor,
                i = 0,
                param,
                fractionInNumerator,
                denominator,
                newDenominator,
                lastParamLeft,
                engine,
                convertToTerminal,
                range = equationData.getRange(),
                paramValue,
                isInRange = true;
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'solving---------------' + node +
                ' with maxparams ' + node.maxParams, []);

            signFactor = 1;
            if (node.sign === '-') {
                signFactor = -1;
            }

            if (node.maxParams === Infinity) {
                //operator functions +, -, .

                //1. ADD ALL DIGITS
                for (; i < node.params.length; i++) {
                    param = node.params[i];

                    if (param.isTerminal && param.type === 'digit') {
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'processing digit ' + param, []);
                        if (result === void 0) {
                            result = EquationEngine.TreeProcedures._getValueFromParam(node.params[i]);
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'for operator ' +
                                node.name + ' Result init to ' + result, []);
                            reducedToNode = node.params[i];
                        } else {
                            switch (node.name) {
                                case '+':
                                    result += EquationEngine.TreeProcedures._getValueFromParam(node.params[i]);
                                    break;

                                case '-':
                                    result -= EquationEngine.TreeProcedures._getValueFromParam(node.params[i]);
                                    break;

                                case '\\cdot':
                                    result *= EquationEngine.TreeProcedures._getValueFromParam(node.params[i]);
                                    break;
                            }
                            node._removeParam(param);
                            i--;
                            //loop adjustment
                        }

                    } else {
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'param ' + param + ' is not terminal', []);
                        // If there are terminals other than digits we do not propagate the sign.
                        // Propagating the sign results in negative sign in both the operator and the terminal node.
                        signFactor = 1;
                    }


                }
                //2. convert x.x into x^2. Warning this wont convert (a+b).(a+b) into (a+b)^2. that is done when terms are expanded, since it is easier and meaningful at that time.
                if (result !== void 0) {
                    result *= signFactor;
                }


                //all simplifications are done at this point.

                if (node.params.length === 1) {
                    solvingComplete = true;
                }

                if (reducedToNode !== void 0) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'Reduced to result ' + result, []);
                    reducedToNode.value = result;
                    reducedToNode.sign = '+';
                }

            } else {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, node + ' all terms digits flag is ' + node.allTermsDigits, []);
                if (node.allTermsDigits === true) {
                    //terminal function
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, '!!!Processing function ' +
                        node.name + ' with params ' + node.params, []);
                    switch (node.name) {
                        case '\\%':
                            result = EquationEngine.TreeProcedures._performPercentOptimizations(node);
                            break;
                        case 'do':
                            solvingComplete = false;
                            break;

                        default:
                            if (node.name === '\\customFunc') {
                                paramValue = EquationEngine.TreeProcedures._getAllParamsValues(node)[0];

                                engine = new Function('param,constants,functions', equationData.getCustomFunctions()[node.value]);
                                result = engine(paramValue, equationData.getConstants(), equationData.getFunctions())[0];
                            } else {
                                result = EquationEngine.TreeProcedures._mathFunctions.performMathematicalCalculations(node.name,
                                    EquationEngine.TreeProcedures._getAllParamsValues(node), EquationEngine.TreeProcedures._getUnits(node));
                            }
                            if (result === null) {
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, "Don't know how to process function " + node, []);
                            }
                    }
                    if (result !== void 0) {
                        result *= signFactor;
                        node.params[0].value = result;
                        node.params[0].type = 'digit';
                        node.params[0].sign = '+';
                        while (node.params.length > 1) {
                            node._removeParam(node.params[1]);
                        }

                        solvingComplete = true;
                    }

                } else {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'Not all terms are digits in function ' +
                        node + ' params are ' + node.params, []);

                    //perform other miscellaneous simplifications
                    if (node.name === '\\frac') {
                        if (!node.params[0].isTerminal && node.params[0].name === '\\frac') {

                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Simplifying fraction in numerator', []);
                            /**
                             *Test cases
                             * (a/b)/c , (a/b)/(c.d) , (a/(b.c))/d
                             *
                             */

                            fractionInNumerator = node.params[0];
                            denominator = node.params[1];

                            node._removeParam(fractionInNumerator, false);
                            node._removeParam(denominator, false);

                            fractionInNumerator.params[0].sign = EquationEngine.TreeProcedures._multiplySigns(fractionInNumerator.params[0].sign, fractionInNumerator.sign);
                            node._addParam(fractionInNumerator.params[0]);

                            newDenominator = EquationEngine.TreeProcedures.multiply(denominator, fractionInNumerator.params[1]);
                            node._addParam(newDenominator);

                            //no point in simplifying numerator cause if it were digits then it would have simplified already :P
                            newDenominator.simplify(equationData);
                        } else {
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'Cant simplify frac any further', []);
                        }
                    }
                }

            }
            if (solvingComplete) {
                lastParamLeft = node.params[0];
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'node ' + node + ' has only param left ' + lastParamLeft, []);
                convertToTerminal = lastParamLeft.isTerminal || node.name === '+' || node.name === '\\cdot';
                if (convertToTerminal) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'CONVERTING last node from ' + node + ' to ' + lastParamLeft, []);
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'before conversion it was ' + node, []);
                    if (lastParamLeft.isTerminal) {
                        node.convertToTerminal(lastParamLeft);
                    } else {
                        EquationEngine.TreeProcedures._convertTreeNodeTo(node, lastParamLeft);
                        lastParamLeft.incinerate();
                    }
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'after conversion it is  ' + node, []);
                }
            }
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.simplify, 'Finished solving---------------' + node, []);
        }

    });
}(window.MathUtilities));
