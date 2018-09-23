/* globals _, window  */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Components.EquationEngine.Models.RangeProductionRules = Backbone.Model.extend({}, {
        "rangeRules": null,
        "rangeRulesTable": null,
        "solution": null,

        "generateRules": function() {
            var nodes = ['var', 'digit', 'const'],
                separators = ['\\le', '\\ge', '<', '>'],
                possibleSeparatorCombinations = {
                    "\\le": '<',
                    "\\ge": '>'
                },
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                separatorsCounter,
                currentSeparator,
                separatorsLength = separators.length,
                rule = null,
                possibleCombinationSeparator;
            EquationEngine.RangeProductionRules.rangeRulesTable = {
                "$%^&": {
                    "var": [],
                    "digit": [],
                    "const": []
                }
            };
            EquationEngine.RangeProductionRules.rangeRules = [];
            EquationEngine.RangeProductionRules.solution = [];

            for (separatorsCounter = 0; separatorsCounter < separatorsLength; separatorsCounter++) {
                currentSeparator = separators[separatorsCounter];

                // rule for var 'separator' digit
                rule = [nodes[0], currentSeparator, nodes[1]];
                EquationEngine.RangeProductionRules._createAndPushRule(rule);
                EquationEngine.RangeProductionRules.solution.push(EquationEngine.RangeProductionRules._setSequenceRules(currentSeparator, 1, true));

                // rule for digit 'separator' var
                rule = [nodes[1], currentSeparator, nodes[0]];
                EquationEngine.RangeProductionRules._createAndPushRule(rule);
                EquationEngine.RangeProductionRules.solution.push(EquationEngine.RangeProductionRules._setSequenceRules(currentSeparator, 1));

                // rule for var 'separator' constant
                rule = [nodes[0], currentSeparator, nodes[2]];
                EquationEngine.RangeProductionRules._createAndPushRule(rule);
                EquationEngine.RangeProductionRules.solution.push(EquationEngine.RangeProductionRules._setSequenceRules(currentSeparator, 1, true));

                // rule for constant 'separator' var
                rule = [nodes[2], currentSeparator, nodes[0]];
                EquationEngine.RangeProductionRules._createAndPushRule(rule);
                EquationEngine.RangeProductionRules.solution.push(EquationEngine.RangeProductionRules._setSequenceRules(currentSeparator, 1));

                // rule for constant 'separator' digit
                rule = [nodes[2], currentSeparator, nodes[1]];
                EquationEngine.RangeProductionRules._createAndPushRule(rule);
                EquationEngine.RangeProductionRules.solution.push(EquationEngine.RangeProductionRules._setSequenceRules(currentSeparator, 1, true));

                // rule for digit 'separator' constant
                rule = [nodes[1], currentSeparator, nodes[2]];
                EquationEngine.RangeProductionRules._createAndPushRule(rule);
                EquationEngine.RangeProductionRules.solution.push(EquationEngine.RangeProductionRules._setSequenceRules(currentSeparator, 1));

                // rule for constant 'separator' constant
                rule = [nodes[2], currentSeparator, nodes[2]];
                EquationEngine.RangeProductionRules._createAndPushRule(rule);
                EquationEngine.RangeProductionRules.solution.push(EquationEngine.RangeProductionRules._setSequenceRules(currentSeparator, 1, true));

                // rule for digit 'separator' var 'separator' digit
                EquationEngine.RangeProductionRules._getRulesForSeparatorCombination(currentSeparator);

                if (possibleSeparatorCombinations[currentSeparator] !== void 0) {
                    possibleCombinationSeparator = possibleSeparatorCombinations[currentSeparator];
                    EquationEngine.RangeProductionRules._getRulesForSeparatorCombination(currentSeparator, possibleCombinationSeparator);
                    EquationEngine.RangeProductionRules._getRulesForSeparatorCombination(possibleCombinationSeparator, currentSeparator);
                }
            }
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'rules :: ');
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, EquationEngine.RangeProductionRules.rangeRules);
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'rules table :: ');
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, EquationEngine.RangeProductionRules.rangeRulesTable);

        },
        "validateRange": function(rangeLatex, equationData) {
            var rangeEquationData = new MathUtilities.Components.EquationEngine.Models.EquationData(),
                leftRangeLatex = '',
                tokens,
                counter,
                hasError = false,
                // to check operators
                operators = rangeLatex.match(/(<|>|\\le\s|\\ge\s)/g), // It checks less than, greater than ,less than equal to and greater than equal to symbols.
                separatorsCounter,
                currentSeparator,
                rangeElements,
                length,
                rangeAccText = equationData.getRangeAccText(),
                separatorsLength;
            if (operators) {
                operators = _.uniq(operators);
                separatorsLength = operators.length;
                for (separatorsCounter = 0; separatorsCounter < separatorsLength; separatorsCounter++) {
                    currentSeparator = operators[separatorsCounter];
                    rangeElements = rangeLatex.split(currentSeparator);
                    length = rangeElements.length;
                    for (counter = 0; counter < length; counter++) {
                        leftRangeLatex = rangeElements[counter];
                        rangeEquationData.setLatex(leftRangeLatex);
                        rangeLatex = this.callParseEquation(rangeEquationData, equationData, rangeLatex);
                        rangeAccText.push({
                            "solution": rangeEquationData.getSolution(),
                            "accText": leftRangeLatex === "y" ? "y" : rangeEquationData.getAccText()
                        });
                        if (rangeEquationData.getSpecie() === 'error' && rangeEquationData.getLatex() !== 'y' &&
                            equationData.getErrorCode() !== 'ConstantDeclaration') {
                            hasError = true;
                            break;
                        }
                    }
                    if (hasError) {
                        break;
                    }
                }
                equationData.setRangeAccText(rangeAccText);
            }
            tokens = this.createRangeTokens(rangeLatex, equationData);
            this.generateRules();
            return tokens;
        },
        "callParseEquation": function(equationData, parentEquationData, rangeLatex) {
            var solution;
            equationData.setUnits(parentEquationData.getUnits());
            equationData.setConstants(parentEquationData.getConstants());
            equationData.setCustomFunctions(parentEquationData.getCustomFunctions());
            equationData.setFunctions(parentEquationData.getFunctions());
            equationData.setSupportedParamVar(parentEquationData.getSupportedParamVar());
            MathUtilities.Components.EquationEngine.Models.Parser.parseEquation(equationData);
            solution = equationData.getSolution();
            if (!(solution === null || isNaN(solution))) {
                //check added for latex having /le and e as constants
                if (equationData.getLatex() === 'e') {
                    rangeLatex = rangeLatex.replace(' e', ' ' + solution);
                } else {
                    solution = solution.toString();
                    if (solution.indexOf('e') !== -1) {
                        solution = this.convertNumberToString(solution);
                    }
                    rangeLatex = rangeLatex.replace(equationData.getLatex(), solution);
                }
            }
            if (parentEquationData.getParentEquation()) {
                this.setParentEquationDataValues(parentEquationData.getParentEquation(), equationData);
            }
            this.setParentEquationDataValues(parentEquationData, equationData);
            return rangeLatex;
        },
        "setParentEquationDataValues": function(parentEquationData, equationData) {
            this._callGetAllConstants(equationData, false).forEach(function(entry) {
                parentEquationData.getRightEquationParameters().constantsList.push(entry);
            });
            this._callGetAllConstants(equationData, true).forEach(function(entry) {
                parentEquationData.getRightEquationParameters().functionsList.push(entry);
            });
            if (!isFinite(equationData.getSolution())) {
                parentEquationData.setCanBeSolved(false);
                equationData.setCanBeSolved(false);
                parentEquationData.setErrorCode('UndefinedValues');
                equationData.setSpecie('error');
            }
            if (equationData.getErrorCode() === 'ConstantDeclaration') {
                parentEquationData.setErrorCode('ConstantDeclaration');
                if (parentEquationData.getErrorData() === null) {
                    parentEquationData.setErrorData([]);
                }
                parentEquationData.setErrorData(_.union(parentEquationData.getErrorData(), equationData.getErrorData()));
                parentEquationData.setCanBeSolved(false);
                return void 0;
            }
            if (!equationData.isCanBeSolved() && equationData.getLatex() !== 'y') {
                parentEquationData.setCanBeSolved(false);
            }
        },
        "_callGetAllConstants": function(equationData, isFunctionRequired) {
            var constants = isFunctionRequired ? equationData.getAllFunctions() : equationData.getAllConstants(),
                constantCounter,
                noOfConstants = constants.length;
            for (constantCounter = 0; constantCounter < noOfConstants; constantCounter++) {
                constants[constantCounter] = constants[constantCounter].replace('-', '');
            }
            return constants;
        },
        "createRangeTokens": function(latex, equationData) {
            var Parser = MathUtilities.Components.EquationEngine.Models.Parser,
                counter, tokensLength, supportedVar = equationData.getSupportedParamVar(),
                currentToken,
                tokens = Parser._generateTokens(latex, equationData);
            if (!tokens) {
                return tokens;
            }
            tokens = Parser._processNegativeTokens(tokens, equationData, null);
            tokensLength = tokens.length;
            for (counter = 0; counter < tokensLength; counter++) {
                currentToken = tokens[counter];
                if (currentToken.type === "var" && currentToken.sign === "-" || (supportedVar && supportedVar === currentToken.value && currentToken.sign === "-")) {
                    equationData.setCanBeSolved(false);
                    break;
                }
            }
            return tokens;
        },

        "_setSequenceRules": function(separator, separatorIndex, isVarFirst) {
            var sequenceString;
            switch (separator) {
                case '\\le':
                    if (separatorIndex === 1) {
                        if (isVarFirst) {
                            sequenceString = 'var.' + (separatorIndex - 1) + ' max.equal.' + (separatorIndex + 1);
                        } else {
                            sequenceString = 'min.equal.0 var.' + (separatorIndex + 1);
                        }
                    } else {
                        sequenceString = 'max.equal.' + (separatorIndex + 1);
                    }
                    break;
                case '\\ge':
                    if (separatorIndex === 1) {
                        if (isVarFirst) {
                            sequenceString = 'var.' + (separatorIndex - 1) + ' min.equal.' + (separatorIndex + 1);
                        } else {
                            sequenceString = 'max.equal.0 var.' + (separatorIndex + 1);
                        }
                    } else {
                        sequenceString = 'min.equal.' + (separatorIndex + 1);
                    }
                    break;
                case '<':
                    if (separatorIndex === 1) {
                        if (isVarFirst) {
                            sequenceString = 'var.' + (separatorIndex - 1) + ' max.' + (separatorIndex + 1);
                        } else {
                            sequenceString = 'min.0 var.' + (separatorIndex + 1);
                        }
                    } else {
                        sequenceString = 'max.' + (separatorIndex + 1);
                    }
                    break;
                case '>':
                    if (separatorIndex === 1) {
                        if (isVarFirst) {
                            sequenceString = 'var.' + (separatorIndex - 1) + ' min.' + (separatorIndex + 1);
                        } else {
                            sequenceString = 'max.0 var.' + (separatorIndex + 1);
                        }
                    } else {
                        sequenceString = 'min.' + (separatorIndex + 1);
                    }
                    break;
            }
            return sequenceString;
        },

        "_getRulesForSeparatorCombination": function(separator1, separator2) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                rule = [
                    ['digit', 'var', 'digit'],
                    ['const', 'var', 'const'],
                    ['digit', 'var', 'const'],
                    ['const', 'var', 'digit'],
                    ['digit', 'const', 'digit'],
                    ['const', 'const', 'const'],
                    ['digit', 'const', 'const'],
                    ['const', 'const', 'digit']
                ],
                length = rule.length,
                counter,
                FIRST_NODE = 1,
                THIRD_NODE = 3,
                currentRule,
                sequenceString;

            if (separator2 === void 0) {
                separator2 = separator1;
            }
            for (counter = 0; counter < length; counter++) {
                currentRule = rule[counter];
                currentRule.splice(FIRST_NODE, 0, separator1);
                currentRule.splice(THIRD_NODE, 0, separator2);
                EquationEngine.RangeProductionRules._createAndPushRule(currentRule);
                sequenceString = EquationEngine.RangeProductionRules._setSequenceRules(separator1, FIRST_NODE);
                sequenceString += ' ' + EquationEngine.RangeProductionRules._setSequenceRules(separator2, THIRD_NODE);
                EquationEngine.RangeProductionRules.solution.push(sequenceString);
            }
        },
        "convertNumberToString": function(number) {
            var power = number.split('e'),
                powerString,
                ans,
                counter,
                length = 0,
                hasNegative,
                num = power[0];
            power = power[1];
            if (num.indexOf('.') > -1) {
                num = num.replace('.', '');
            }
            hasNegative = power.indexOf('-');
            if (hasNegative !== -1) {
                power = power.replace('-', '');
                length = Number(power);
                powerString = '0.';
            } else {
                powerString = '0';
                length = Number(power) - num.length;
            }

            for (counter = 0; counter < length; counter++) {
                powerString = powerString + "0";
            }
            if (hasNegative !== -1) {
                ans = powerString + num;
            } else {
                ans = num + powerString;
            }
            return ans;

        },
        "_createAndPushRule": function(rule) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models;
            EquationEngine.RangeProductionRules.rangeRules.push(rule);
            EquationEngine.RangeProductionRules.rangeRulesTable['$%^&'][rule[0]].push(EquationEngine.RangeProductionRules.rangeRules.length - 1);
        },
        "_getAccTextForSeparator": function(separator) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                OPERATOR_TEXT = EquationEngine.TreeProcedures.OPERATOR_TEXT;
            switch (separator) {
                case "\\le":
                    return OPERATOR_TEXT.GT;
                case "\\ge":
                    return OPERATOR_TEXT.LT;
                case "<":
                    return OPERATOR_TEXT.LE;
                case ">":
                    return OPERATOR_TEXT.GE;
            }
        }
    });
}(window.MathUtilities));
