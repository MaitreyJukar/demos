/* globals $, paper, window, _, geomFunctions */

(function(MathUtilities) {
    'use strict';

    /**
    Class to parse and plot the equations

    @class MathUtilities.Components.EquationEngine
    **/
    MathUtilities.Components.EquationEngine.Models.Parser = Backbone.Model.extend({}, {
        /**
        Flag that tells if the api is running in test mode or deploy mode

        @property _deploy
        @type Boolean
        @private
        @static
        @default "true"
        **/
        "_deploy": true,


        /**

        List of Mathematical constants used in the EquationEngine

        @property _constants
        @private
        @static
        @type Object
        **/

        "_constants": {
            "\\pi": Math.PI,
            "e": Math.E
        },

        "_debugFlag": {
            "tokens": false,
            "rules": false,
            "tree": false,
            "power": false,
            "simplify": false,
            "expand": false,
            "convert2q": false,
            "solve": false,
            "plot": false,
            "info": false,
            "common": false,
            "error": false
        },

        "_INVERSIBLE_FUNCTIONS": ['\\sin^{-1}', '\\cos^{-1}', '\\tan^{-1}', '\\cot^{-1}',
            '\\csc^{-1}', '\\sec^{-1}', '\\sinh^{-1}', '\\cosh^{-1}', '\\tanh^{-1}', '\\coth^{-1}', '\\csch^{-1}', '\\sech^{-1}'
        ],
        "_INVERT_FUNCTIONS_IN_ORDER": ['\\arcsin', '\\arccos', '\\arctan', '\\arccot',
            '\\arccsc', '\\arcsec', '\\arsinh', '\\arcosh', '\\artanh', '\\arcoth', '\\arcsch', '\\arsech'
        ],

        "_productions": MathUtilities.Components.EquationEngine.Models.Productions,
        "_mathFunctions": MathUtilities.Components.EquationEngine.Models.MathFunctions,

        "_NSTYLE": 'background: #c00; color: #fff',
        "_HSTYLE": 'background: #cc0; color: #fff',
        "_BLUE_STYLE": 'background: #004; color: #fff',
        "_YSTYLE": 'background: #0c0; color: #fff',
        "_borderColor": '#c1c1c1',
        /**

        Function to check whether a string is empty

        @private
        @method _isBlank
        @param stringToCheck{String} string to be checked if it is empty
        @return {Boolean} true if empty else false
        @static
        **/
        "_isBlank": function(stringToCheck) {
            if (stringToCheck === void 0) {
                return false;
            }
            stringToCheck = stringToCheck.trim();
            return stringToCheck === '';
        },

        "_checkOperator": function(latex, sumIndex) {
            var length = latex.length,
                loopVar = 0,
                operatorArr = ['+', '-', '\\cdot'];
            for (; loopVar < length; loopVar++) {
                if (operatorArr.indexOf(latex[loopVar]) > -1 && loopVar !== 0) {
                    return loopVar;
                }
            }
            return sumIndex - 1;
        },
        /**
              Function process latex if it contains sum product case. It converts \sum_{n=1}^1x to \sum_{n}{1}{1}{x}

              @private
              @method _checkSumProductCase
              @param latex{String} Latex string
              @param equationData{Object} The equation data model object
              @return {String} processed latex string
              @static
          **/

        "_checkSumProductCase": function(latex, equationData) {
            var charCounter,
                latexLength = latex.length,
                sumProdOccurred = false,
                checkingLowerLimit = false,
                checkingUpperLimit = false,
                currentChar,
                useEquation = false,
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                bracketCounter = 0,
                lowerLimit = '',
                upperLimit = '',
                upperLimitDone = false,
                lowerLimitDone = false,
                addToLatex = '',
                sumProductEquation = '',
                sumIndex,
                currIndex,
                updatedString,
                SUM_TEXT_LENGTH = 3,
                PROD_TEXT_LENGTH = 4,
                prodIndex,
                returnLatex = '';
            for (charCounter = 0; charCounter < latexLength; charCounter++) {
                currentChar = latex.charAt(charCounter);
                if (sumProdOccurred) {
                    if (bracketCounter === 0 && !lowerLimitDone && currentChar === '_') {
                        checkingLowerLimit = true;
                        checkingUpperLimit = false;

                    } else if (bracketCounter === 0 && !upperLimitDone && currentChar === '^') {
                        checkingLowerLimit = false;
                        checkingUpperLimit = true;
                    } else {
                        if (EquationEngine.ParsingProcedures._isOpeningBracket(currentChar)) {
                            bracketCounter++;
                        } else if (EquationEngine.ParsingProcedures._isClosingBracket(currentChar)) {
                            bracketCounter--;
                        }
                        if (checkingLowerLimit) {
                            lowerLimit += currentChar;
                            if (bracketCounter === 0) {
                                lowerLimitDone = true;
                                checkingLowerLimit = false;
                            }
                        } else if (checkingUpperLimit) {
                            upperLimit += currentChar;
                            if (bracketCounter === 0) {
                                upperLimitDone = true;
                                checkingUpperLimit = false;
                            }
                        } else {
                            if (bracketCounter === -1) {
                                sumProdOccurred = charCounter === latexLength - 1;
                                useEquation = false;
                                addToLatex = currentChar;
                                continue;
                            }

                            sumProductEquation += currentChar;
                            sumIndex = sumProductEquation.lastIndexOf('\\sum');
                            if (sumIndex !== -1) {
                                if (sumIndex === 0) {
                                    equationData.setCanBeSolved(false);
                                    equationData.setErrorCode('CannotUnderstandThis');
                                    return void 0;
                                }
                                currIndex = this._checkOperator(sumProductEquation, sumIndex);
                                updatedString = sumProductEquation.substr(0, currIndex);
                                if (sumProductEquation.indexOf('(') !== 0) {
                                    updatedString += '}';
                                }
                                updatedString += sumProductEquation.substring(currIndex, sumIndex) +
                                    EquationEngine.Parser._checkSumProductCase(latex.substring(charCounter - SUM_TEXT_LENGTH, latexLength), equationData);
                                sumProductEquation = updatedString;
                                break;
                            }
                            prodIndex = sumProductEquation.lastIndexOf('\\prod');
                            if (prodIndex !== -1) {
                                if (prodIndex === 0) {
                                    equationData.setCanBeSolved(false);
                                    equationData.setErrorCode('CannotUnderstandThis');
                                    return void 0;
                                }
                                currIndex = this._checkOperator(sumProductEquation, prodIndex);
                                updatedString = sumProductEquation.substr(0, currIndex);
                                if (sumProductEquation.indexOf('(') !== 0) {
                                    updatedString += '}';
                                }
                                updatedString += sumProductEquation.substring(currIndex, prodIndex) +
                                    EquationEngine.Parser._checkSumProductCase(latex.substring(charCounter - PROD_TEXT_LENGTH, latexLength), equationData);
                                sumProductEquation = updatedString;
                                break;
                            }
                        }
                    }
                } else {
                    if (sumProductEquation !== '') {
                        returnLatex += EquationEngine.Parser._prepareSumProductLatex(upperLimit, lowerLimit, sumProductEquation, equationData);
                        sumProductEquation = lowerLimit = upperLimit = '';
                        checkingLowerLimit = upperLimitDone = lowerLimitDone = checkingUpperLimit = false;
                        bracketCounter = 0;
                    }
                    if (addToLatex !== '') {
                        returnLatex += addToLatex;
                        addToLatex = '';
                    }
                    returnLatex += currentChar;
                    if (!useEquation && EquationEngine.Parser._checkSumProductCondition(returnLatex)) {
                        sumProdOccurred = true;
                        useEquation = true;
                    }
                }
            }
            if (sumProdOccurred) {
                returnLatex += EquationEngine.Parser._prepareSumProductLatex(upperLimit, lowerLimit, sumProductEquation, equationData);
                if (addToLatex !== '') {
                    returnLatex += addToLatex;
                    addToLatex = '';
                }
            }
            return returnLatex;
        },

        "_checkSumProductCondition": function(returnLatex) {
            var sumIndex = returnLatex.lastIndexOf('\\sum'),
                prodIndex = returnLatex.lastIndexOf('\\prod'),
                latexLength = returnLatex.length;
            if (sumIndex === -1 && prodIndex === -1) {
                return false;
            }
            return sumIndex !== -1 && sumIndex === latexLength - 4 || prodIndex !== -1 && prodIndex === latexLength - 5;
        },

        "_prepareSumProductLatex": function(upperLimit, lowerLimit, sumProductEquation, equationData) {
            var returnLatex = '',
                EQUALPRESENT = 2,
                lowerLimitSplit;
            if (lowerLimit.charAt(0) === '{') {
                lowerLimit = lowerLimit.substring(1, lowerLimit.length - 1);
            }
            if (lowerLimit.split('=').length !== EQUALPRESENT) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return void 0;
            }
            lowerLimitSplit = lowerLimit.split('=');
            returnLatex += '{' + lowerLimitSplit[0] + '}{' + lowerLimitSplit[1] + '}';
            equationData.setPivot(lowerLimitSplit[0]);
            if (upperLimit.charAt(0) === '{') {
                upperLimit = upperLimit.substring(1, upperLimit.length - 1);
            }
            returnLatex += '{' + upperLimit + '}';
            returnLatex += '{' + sumProductEquation;
            if (sumProductEquation.indexOf('\\sum') === -1 && sumProductEquation.indexOf('\\prod') === -1 ||
                ((sumProductEquation.indexOf('\\sum') > -1 || sumProductEquation.indexOf('\\prod') > -1) && sumProductEquation.indexOf('(') === 0)) {
                returnLatex += '}';
            }
            if (this._checkPivotInSumProductLimits(lowerLimitSplit[1], equationData) || this._checkPivotInSumProductLimits(upperLimit, equationData)) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return void 0;
            }
            return returnLatex;
        },

        "_checkPivotInSumProductLimits": function(limitString, equationData) {
            if (limitString === '') {
                return true;
            }
            var limitTokens = this._generateTokens(limitString, equationData),
                tokenCounter,
                currentToken,
                tokensLength;
            if (typeof limitTokens === 'undefined') {
                return true;
            }
            tokensLength = limitTokens.length;
            for (tokenCounter = 0; tokenCounter < tokensLength; tokenCounter++) {
                currentToken = limitTokens[tokenCounter];
                if (currentToken.type === 'const' && currentToken.value === equationData.getPivot()) {
                    return true;
                }
            }
            return false;
        },

        /**

        Takes equation data to parse the equation. This function parses the equation generates equation tree and saves it in the equationData.

        @public
        @method parseEquation
        @param equationData
        @return Void
        @static
        **/
        "parseEquation": function(equationData) {
            if (equationData.getBlind()) {
                return void 0;
            }
            var EquationEngine = MathUtilities.Components.EquationEngine.Models;
            EquationEngine.Parser.parseEquationToGetTokens(equationData);
            if (!equationData.isCanBeSolved()) {
                return void 0;
            }
            if (equationData.getSpecie() !== "number" && equationData.getSpecie() !== "point") {
                EquationEngine.Parser.processTokensWithRules(equationData);
                if (!equationData.isCanBeSolved()) {
                    return void 0;
                }
                EquationEngine.Parser.generateTreeFromRules(equationData);
            }
        },

        "processTokensWithRules": function(equationData) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                leftExpression = equationData.getLeftExpression(),
                rightExpression = equationData.getRightExpression(),
                leftTokens = leftExpression.tokens,
                rightTokens = rightExpression.tokens;
            leftExpression.validPredictionStack = EquationEngine.Parser._recursiveDescentParser(equationData, leftTokens, 0, 0, [void 0], false);
            if (!equationData.isCanBeSolved()) {
                return void 0;
            }

            rightExpression.validPredictionStack = EquationEngine.Parser._recursiveDescentParser(equationData, rightTokens, 0, 0, [void 0], false);
            if (!equationData.isCanBeSolved()) {
                return void 0;
            }
            EquationEngine.Parser._displayArrayOfObjects(rightExpression.validPredictionStack, 'production-rules-display-right', '#770', '#fff');
            if (leftExpression.validPredictionStack === void 0 || rightExpression.validPredictionStack === void 0) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[STAGE2 - FAIL]' +
                    'Left Prediction Rules Failed', [EquationEngine.Parser._NSTYLE]);
                return void 0;
            }
        },

        "generateTreeFromRules": function(equationData) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                TreeProcedures = EquationEngine.TreeProcedures,
                leftExpression = equationData.getLeftExpression(),
                rightExpression = equationData.getRightExpression(),
                rootNode,
                equationLeftRoot,
                equationRightRoot,
                equationUnits = equationData.getUnits(),
                directives = equationData.getDirectives(),
                possibleFunctionVariables,
                freeVar,
                functionVariablePreference,
                freeVarCount,
                equationRange,
                preferredFunctionVariable,
                chooseThis,
                accessibilityString,
                possibleFunctionVariableCounter,
                possibleFunctionVariablesLength,
                equationFreeVars,
                profiles = equationData.getProfiles(),
                supportParamVar,
                Utils = MathUtilities.Components.Utils.Models.Utils,
                OPERATOR_TEXT = EquationEngine.TreeProcedures.OPERATOR_TEXT;

            supportParamVar = equationData.getSupportedParamVar();
            if (!supportParamVar) {
                supportParamVar = 'x';
            }
            equationData.setLeftRoot(EquationEngine.TreeProcedures.generateTree(leftExpression.validPredictionStack, 0, equationUnits));
            equationData.setRightRoot(EquationEngine.TreeProcedures.generateTree(rightExpression.validPredictionStack, 0, equationUnits));

            //Generate accessibility text
            equationLeftRoot = equationData.getLeftRoot();
            equationRightRoot = equationData.getRightRoot();

            accessibilityString = EquationEngine.TreeProcedures._toAccessible(equationLeftRoot).expression;
            if (!equationData.getRhsAuto()) {
                switch (equationData.getInEqualityType()) {
                    case "greater":
                        accessibilityString += OPERATOR_TEXT.GT + EquationEngine.TreeProcedures._toAccessible(equationRightRoot).expression;
                        break;
                    case "lesser":
                        accessibilityString += OPERATOR_TEXT.LT + EquationEngine.TreeProcedures._toAccessible(equationRightRoot).expression;
                        break;
                    case "ltequal":
                        accessibilityString += OPERATOR_TEXT.LE + EquationEngine.TreeProcedures._toAccessible(equationRightRoot).expression;
                        break;
                    case "gtequal":
                        accessibilityString += OPERATOR_TEXT.GE + EquationEngine.TreeProcedures._toAccessible(equationRightRoot).expression;
                        break;
                    default:
                        accessibilityString += OPERATOR_TEXT.EQUAL_TO + EquationEngine.TreeProcedures._toAccessible(equationRightRoot).expression;
                        break;
                }
            }
            if (equationData.getRangeAccText().length > 0) {
                accessibilityString += equationData.getAccText();
            }
            equationData.setAccText(accessibilityString);
            if (!EquationEngine.Parser._deploy) {
                $('#accessibility-display').html('The Accessibility String is ' + accessibilityString);
            }
            if (directives.FDFlagMethod === "graphing" && equationData.getFdFlag() === "frac" &&
                (equationLeftRoot.name === '\\frac' || equationLeftRoot.name === 'do' && equationLeftRoot.params[0].name === '\\frac')) {
                equationData.setFdFlag('decimal');
                if (equationLeftRoot.name === 'do') {
                    EquationEngine.Parser._checkIfFracHasNonFracChilds(equationLeftRoot.params[0], equationData);
                } else {
                    EquationEngine.Parser._checkIfFracHasNonFracChilds(equationLeftRoot, equationData);
                }
            }

            if (directives.FDFlagMethod === 'calculator') {
                equationData.setFdFlag(EquationEngine.Parser._getAnalysisForFD(equationLeftRoot) === 0 ? "frac" : "decimal");
            }
            //simplify the equation

            if (!EquationEngine.Parser._deploy) {
                //start time for simplify stage.
                EquationEngine.Profile.getStartTime('simplify');
            }
            if (!equationLeftRoot.isTerminal || equationLeftRoot.irrational) {
                if (TreeProcedures.isFractionOptimizationRequired(equationLeftRoot, equationLeftRoot)) {
                    TreeProcedures.replaceDowithChild(equationLeftRoot);
                    TreeProcedures._performFractionAdjustment(equationLeftRoot, equationData, equationLeftRoot);
                }
                if (!equationLeftRoot.isTerminal) {
                    equationLeftRoot.simplify(equationData);
                }
            }
            if (equationRightRoot && !equationRightRoot.isTerminal) {
                equationRightRoot.simplify(equationData);
            }

            equationData.setLeftInequalityRoot(Utils.convertToSerializable(equationLeftRoot));
            equationData.setRightInequalityRoot(Utils.convertToSerializable(equationRightRoot));

            if (!EquationEngine.Parser._deploy) {
                //processing time for simplify stage.
                profiles[4] = EquationEngine.Profile.getProcessingTime('simplify');
            }

            if (equationLeftRoot.isTerminal && equationLeftRoot.type === "digit" &&
                equationRightRoot !== null && !equationData.getRhsAuto() && equationRightRoot.isTerminal &&
                equationRightRoot.type === "digit") {
                equationData.setCanBeSolved(false);
                if (equationData.getInEqualityType() !== 'equal') {
                    equationData.setErrorCode('InequalityOnlyNumbers');
                } else {
                    equationData.setErrorCode('OnlyNumbers');
                }
                return void 0;
            }

            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[STAGE4 - SUCCESS]' +
                'Tree Simplified', [EquationEngine.Parser._YSTYLE]);
            if (!EquationEngine.Parser._deploy) {
                EquationEngine.Parser._printLatex(equationLeftRoot, 4, true);
            }

            if (equationData.getSpecie() !== 'expression') {
                //delaying combining post simplify so that we have a clear idea of whether
                EquationEngine.TreeProcedures.combineLeftRightTree(equationData);
            }
            rootNode = equationLeftRoot;
            if (equationLeftRoot !== void 0) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[STAGE3 - Success]' +
                    'Equation Tree Generated', [EquationEngine.Parser._YSTYLE]);
                if (!EquationEngine.Parser._deploy) {
                    EquationEngine.Parser._printLatex(rootNode, 3, true);
                }
            } else {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[STAGE3 - FAIL]' +
                    'Left Equation Tree Generation Failed', [EquationEngine.Parser._NSTYLE]);
                return void 0;
            }
            //after simplification of the left side check if the left side is reduced to terminal. if it has then that means it is a constant
            if (equationData.getSpecie() === 'expression') {
                equationData.setSolution(EquationEngine.TreeProcedures._substituteParamVariableAndGetValue(equationData.getLeftRoot(), equationData.getConstants(),
                    void 0, void 0, equationData));
            }
            if (!EquationEngine.Parser._deploy) {
                EquationEngine.TreeProcedures._toLatex(rootNode);
            }

            if (!equationData.isCanBeSolved()) {
                equationData.setSpecie('error');
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, '%cError occurred :: ', ['#f00']);
                return void 0;
            }
            if (equationData.getSpecie() === 'expression') {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'The equation is solved', []);
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, equationData.getSolution(), []);
                return void 0;
            }

            EquationEngine.Parser._calculateMaxPowerOfVariable(equationData);

            if (!equationData.isCanBeSolved()) {
                equationData.setSpecie('error');
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, '%cError occurred :: ', ['#f00']);
                return void 0;
            }

            possibleFunctionVariables = [];
            freeVar = null;

            equationFreeVars = equationData.getFreeVars();
            freeVarCount = 0;
            for (freeVar in equationFreeVars) {
                freeVarCount++;
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'checking complexity of free var ' +
                    freeVar + ">> " + equationFreeVars[freeVar], []);

                if (typeof equationFreeVars[freeVar] === "number" && equationFreeVars[freeVar] <= 2 &&
                    EquationEngine.MathFunctions.checkIfNotADecimalNumber(equationFreeVars[freeVar])) {
                    possibleFunctionVariables.push(freeVar);
                }
            }
            equationData.setPossibleFunctionVariables(possibleFunctionVariables);

            //check if the equation can be plotted
            //if the equation has 1 free var and if there are no possible functional variable ie that free variable is complicated then the equation cant be solved
            // if the one free variable is the a function variable then the equation WILL NOT be plotted, it will be solved as a quadratic equation
            if (freeVarCount === 1) {
                if (possibleFunctionVariables.length === 0) {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('CannotUnderstandThis');
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, '%c ERROR: complicated equation. Cant solve');
                    equationData.setSpecie('error');
                    return void 0;
                }
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.info,
                    '%c INFO %c: Equation will yield solutions', [EquationEngine.Parser._BLUE_STYLE, void 0]);
                if (equationFreeVars[possibleFunctionVariables[0]] > 1) {
                    equationData.setSpecie('quadratic');
                } else {
                    equationData.setSpecie('linear');
                    if (equationFreeVars.x === 1 || equationFreeVars.y === 1) {
                        equationData.setSpecie('plot');
                    }
                }
            } else {
                // free vars > 1
                equationData.setSpecie('plot');
            }
            functionVariablePreference = equationData.getPossibleFunctionVariablesPreference();
            if (possibleFunctionVariables.length <= 2) {
                if (possibleFunctionVariables.length === 2 && functionVariablePreference.x !== functionVariablePreference.y) {
                    preferredFunctionVariable = functionVariablePreference.x > functionVariablePreference.y ? 'y' : supportParamVar;
                } else {
                    chooseThis = false;
                    possibleFunctionVariableCounter = 0;
                    possibleFunctionVariablesLength = possibleFunctionVariables.length;
                    for (possibleFunctionVariableCounter; possibleFunctionVariableCounter < possibleFunctionVariablesLength; possibleFunctionVariableCounter++) {

                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, EquationEngine.Parser._getFunctionVariablePrecedenceIndex(preferredFunctionVariable, equationData) + ">>" + EquationEngine.Parser._getFunctionVariablePrecedenceIndex(possibleFunctionVariables[possibleFunctionVariableCounter], equationData), []);
                        chooseThis = preferredFunctionVariable === void 0 ||
                            EquationEngine.Parser._getFunctionVariablePrecedenceIndex(preferredFunctionVariable, equationData) < EquationEngine.Parser._getFunctionVariablePrecedenceIndex(possibleFunctionVariables[possibleFunctionVariableCounter], equationData);
                        if (chooseThis) {
                            preferredFunctionVariable = possibleFunctionVariables[possibleFunctionVariableCounter];
                        }
                    }
                }

                equationData.setFunctionVariable(preferredFunctionVariable);
                equationRange = equationData.getRange();
                if (possibleFunctionVariables.length > 1 && equationRange !== null &&
                    possibleFunctionVariables.indexOf(equationRange.variable) !== -1) {
                    preferredFunctionVariable = equationRange.variable === 'y' ? supportParamVar : 'y';
                    equationData.setFunctionVariable(preferredFunctionVariable);
                }
                equationData.setParamVariable(preferredFunctionVariable === 'y' ? supportParamVar : 'y');
                if (equationData.getSolveOnlyY()) {
                    equationData.setFunctionVariable('x');
                    equationData.setParamVariable('y');
                }

                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[STAGE5 - SUCCESS]' +
                    ' Chosen function variable is ' + preferredFunctionVariable, [EquationEngine.Parser._YSTYLE]);

            } else {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('MoreFreeVariables');
                equationData.setErrorString(EquationEngine.EquationEnums.ERROR_TOO_MANY_FREE_VARIABLES);
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, '%c[STAGE5 - FAIL]' +
                    'TOO many free variables...it should NOT have been be detected so late', [EquationEngine.Parser._NSTYLE]);

            }
            return void 0;
        },

        "changeAbsoluteLatex": function(latex) {
            // replace pipe symbol latex with absolute latex
            return latex.replace(/\\lpipe(?:\\left)?/g, '\\abs\(')
                .replace(/\\rpipe(?:\\right)?/g, '\)');
        },

        "parseEquationToGetTokens": function(equationData) {
            if (equationData.getBlind()) {
                return void 0;
            }
            var EquationEngine,
                latexEquation,
                divideEquationIntoExpressionRegEx,
                expressionMatches,
                freeVariables,
                variable,
                noConstantDeclared,
                isRVariablePresent,
                isXYVariablePresent,
                newFreeVariables,
                variableCounter,
                freeVariablesLength,
                equationParameters,
                accText,
                firstRangeAccText,
                secondRangeAccText,
                leftExpression,
                rightExpression,
                splitRangeObj,
                directives = equationData.getDirectives(),
                profiles = equationData.getProfiles(),
                $leftPreprocessLatex,
                $leftPreProcessLatexExpression,
                $rightPreprocessLatex,
                $rightPreProcessLatexExpression,
                supportParamVar,
                MIN_FREE_VAR_LENGTH = 2;
            EquationEngine = MathUtilities.Components.EquationEngine.Models;
            if (!EquationEngine.Parser._deploy) {
                paper.install(window);
            }
            /*
             * EquationData will contain following data
             *
             *
             * ------PROVIDED EARLIER---------
             * * constants and their values
             *   constants
             *    |-a => null
             *    |-b => 2.3
             *
             *
             * ----------------ADDED LATER------------------
             * left expression
             * right expression
             *
             * analysis:
             *   rhsAuto: RHS auto generated? we do that for simple expressions such as 2x to make them into an equation 2x=y
             *   isLinearEquation:
             *
             * units
             *  |- angle => "rad"/ "deg"
             *
             * Equation Data will have following data
             * free Vars and their status [nth degree or complicated] as follows
             *   free vars
             *    |- x => "c"
             *    |- y => "1"
             *
             *
             * -----------------RESULT DATA------------------------
             * CanBeSolved? boolean
             * functionVariable
             * paramVariable
             * errorString
             *
             */

            /*
             * Expression will contain following data
             *
             *   free vars
             *    |- x => "c"
             *    |- y => "1"
             *
             *   constants
             *    |-a => null
             *    |-b => 2.3
             *
             * type of expression [node or leaf] ????
             */
            equationData.setSpecie('error');
            equationData.setRange(null);
            equationData.setSolution(null);
            equationData.flushError();
            equationData.flushAnalysis();
            equationData.flushParserData();
            equationData.setCanBeSolved(true);
            equationData.setPivot(null);
            if (EquationEngine.Parser._isBlank(equationData.getLatex())) {
                equationData.setCanBeSolved(false);
                equationData.setSpecie('error');
                equationData.setErrorCode('Blank');
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, '%cError occurred :: ', ['#f00']);
                return void 0;
            }
            leftExpression = equationData.getLeftExpression();
            rightExpression = equationData.getRightExpression();
            latexEquation = equationData.getLatex();

            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Processing equation ' + latexEquation, []);
            // Remove all unwanted latex from the equation latex
            latexEquation = latexEquation.replace(/\\spacing@|\\space|\\left|\\right|\\:|\$|\s/gi, "");
            //negative look behind doesn't work (?<!\\cdot)\d so removing spaces and adding space manually after cdot
            latexEquation = latexEquation.replace(/(\\cdot|\\pi|\\le|\\ge|\\theta)/gi, function($1, $2, $3) {
                return $1 + ' ';
            });
            splitRangeObj = EquationEngine.Parser._splitRangeFromSolution(latexEquation, equationData);
            if (!equationData.isCanBeSolved()) {
                return void 0;
            }
            latexEquation = splitRangeObj.latexEquation;
            // Function to process sum product case
            latexEquation = EquationEngine.Parser.changeAbsoluteLatex(latexEquation);
            latexEquation = EquationEngine.Parser._checkSumProductCase(latexEquation, equationData);
            if (!equationData.isCanBeSolved()) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, "%cError occurred in sum pivot case", ['#f00']);
                return void 0;
            }
            EquationEngine.Parser._preProcessLatexForErrors(latexEquation, equationData);
            if (!equationData.isCanBeSolved()) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, "%cError occurred in syntax of latex", ['#f00']);
                return void 0;
            }
            // divides equation into left expression and right expression at =, <=, >=, <, >.
            divideEquationIntoExpressionRegEx = /(.*?)(=|<|>|\\le|\\ge)(.*)/gi;
            expressionMatches = divideEquationIntoExpressionRegEx.exec(latexEquation);

            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, latexEquation, []);
            supportParamVar = equationData.getSupportedParamVar();
            if (!supportParamVar) {
                supportParamVar = 'x';
            }
            if (expressionMatches === null) {
                equationData.setInEqualityType('=');
                leftExpression.expression = latexEquation;
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Equation is an expression', []);
            } else {
                if (expressionMatches[1] === '' || expressionMatches[3] === '') {
                    if (expressionMatches[3] === '') {
                        leftExpression.expression = expressionMatches[1];
                        EquationEngine.Parser._preProcessExpression(leftExpression);
                        EquationEngine.Parser._parseExpression(leftExpression, equationData);
                        if (typeof leftExpression.tokens === 'undefined') {
                            return void 0;
                        }
                        if (EquationEngine.Parser._isFunctionDefinition(leftExpression.tokens, latexEquation)) {
                            equationData.setSpecie('function');
                            equationData.setDefinitionFor({
                                "name": leftExpression.tokens[0].value,
                                "constants": [leftExpression.tokens[2].value]
                            });
                        }
                        EquationEngine.Parser.postProcessTokens(leftExpression, equationData);
                    } else {
                        rightExpression.expression = expressionMatches[3];
                        EquationEngine.Parser._preProcessExpression(rightExpression);
                        EquationEngine.Parser._parseExpression(rightExpression, equationData);
                        EquationEngine.Parser.postProcessTokens(rightExpression, equationData);
                    }
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('CannotUnderstandThis');
                    return void 0;
                }
                equationData.setInEqualityType(expressionMatches[2]);
                leftExpression.expression = expressionMatches[1];
                rightExpression.expression = expressionMatches[3];
                if (splitRangeObj.secondRangeLatex && expressionMatches[2] !== '=') {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('InvalidRange');
                    return void 0;
                }
            }

            //start time for left expression pre process stage.
            if (!EquationEngine.Parser._deploy) {
                MathUtilities.Components.EquationEngine.Models.Profile.getStartTime('leftPreProcess');
            }

            EquationEngine.Parser._preProcessExpression(leftExpression);

            //processing time for left expression pre process stage.
            if (!EquationEngine.Parser._deploy) {
                profiles[0] = MathUtilities.Components.EquationEngine.Models.Profile.getProcessingTime('leftPreProcess');

                $leftPreprocessLatex = $("#pre-process-latex-left");
                $leftPreProcessLatexExpression = $('<div></div>');
                $leftPreprocessLatex.append($leftPreProcessLatexExpression);
                $leftPreProcessLatexExpression.attr('id', 'left-preprocess-latex-expression')
                    .append(leftExpression.expression)
                    .css({
                        "border": '1px solid',
                        "border-color": EquationEngine.Parser._borderColor,
                        "padding": '5px'
                    });
                $leftPreprocessLatex.parent().css({
                    "border": '1px solid #000'
                });
            }
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens, 'Left expression after preprocessing :: ', []);
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens, leftExpression, []);
            if (!EquationEngine.Parser._deploy) {
                //start time for left token generation stage.
                MathUtilities.Components.EquationEngine.Models.Profile.getStartTime('leftTokenGeneration');
            }
            EquationEngine.Parser._parseExpression(leftExpression, equationData);
            if (leftExpression.tokens === void 0) {
                return void 0;
            }
            if (EquationEngine.Parser._isFunctionDefinition(leftExpression.tokens, latexEquation)) {
                equationData.setSpecie('function');
                equationData.setDefinitionFor({
                    "name": leftExpression.tokens[0].value,
                    "constants": [leftExpression.tokens[2].value]
                });
            }
            EquationEngine.Parser.postProcessTokens(leftExpression, equationData);

            if (!EquationEngine.Parser._deploy) {
                equationParameters = equationData.getLeftEquationParameters();
                EquationEngine.Parser._displayArrayOfObjects(equationParameters.operatorsList, 'operators-display-container-left', '#770', '#fff');
                EquationEngine.Parser._displayArrayOfObjects(equationParameters.constantsList, 'constants-display-container-left', '#770', '#fff');
                EquationEngine.Parser._displayArrayOfObjects(equationParameters.variablesList, 'variables-display-container-left', '#770', '#fff');
                EquationEngine.Parser._displayArrayOfObjects(equationParameters.digitsList, 'digits-display-container-left', '#770', '#fff');
                EquationEngine.Parser._displayArrayOfObjects(equationParameters.functionsList, 'functions-display-container-left', '#770', '#fff');
            }
            if (!EquationEngine.Parser._deploy) {
                //processing time for left token generation stage.
                profiles[1] = MathUtilities.Components.EquationEngine.Models.Profile.getProcessingTime('leftTokenGeneration');
            }
            if (!equationData.isCanBeSolved() || equationData.getSpecie() === 'point') {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, '%cError occurred :: ', ['#f00']);
                return void 0;
            }

            EquationEngine.Parser._displayArrayOfObjects(leftExpression.tokens, 'tokens-display-container-left', '#770', '#fff');

            // case where only digit is give to parse in expression. So no need to parse the whole equation
            if (rightExpression.expression === null) {
                if (leftExpression.tokens.length === 1 && leftExpression.tokens[0].type === 'digit') {
                    equationData.setSpecie('number');
                    if (leftExpression.tokens[0].sign === '-') {
                        equationData.setAccText(EquationEngine.TreeProcedures.OPERATOR_TEXT.NEGATIVE +
                            ' ' + EquationEngine.TreeProcedures._getAccessibleStringForNumber(leftExpression.tokens[0].value));
                        equationData.setSolution(Number(leftExpression.tokens[0].value) * -1);
                    } else {
                        equationData.setAccText(EquationEngine.TreeProcedures._getAccessibleStringForNumber(leftExpression.tokens[0].value));
                        equationData.setSolution(Number(leftExpression.tokens[0].value));
                    }
                    if (!EquationEngine.Parser._deploy) {
                        $('#accessibility-display').html('The Accessibility string is ' + equationData.getAccText());
                    }
                    if (!splitRangeObj.rangeLatex) {
                        return void 0;
                    }
                    if (!equationData.getParentEquation()) {
                        equationData.setCanBeSolved(false);
                        return void 0;
                    }
                }
            }
            freeVariables = [];
            variable = null;
            for (variable in leftExpression.freevars) {
                if (freeVariables.indexOf(variable) === -1) {
                    freeVariables.push(variable);
                }
            }


            if (rightExpression.expression !== null) {
                equationData.setRhsAuto(false);
                if (!EquationEngine.Parser._deploy) {
                    //start time for right expression pre process stage.
                    MathUtilities.Components.EquationEngine.Models.Profile.getStartTime('rightPreProcess');
                }

                EquationEngine.Parser._preProcessExpression(rightExpression);
                if (!EquationEngine.Parser._deploy) {
                    //processing time for pre process stage.
                    profiles[0] += MathUtilities.Components.EquationEngine.Models.Profile.getProcessingTime('rightPreProcess');
                }

                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens, 'right expression after preprocessing :: ', []);
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens, rightExpression, []);
                if (!EquationEngine.Parser._deploy) {
                    //start time for right token generation stage.
                    MathUtilities.Components.EquationEngine.Models.Profile.getStartTime('rightTokenGeneration');
                }

                EquationEngine.Parser._parseExpression(rightExpression, equationData);
                EquationEngine.Parser.postProcessTokens(rightExpression, equationData);
                if (!EquationEngine.Parser._deploy) {
                    //processing time for token generation stage.
                    profiles[1] += MathUtilities.Components.EquationEngine.Models.Profile.getProcessingTime('rightTokenGeneration');
                }

                if (!equationData.isCanBeSolved()) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, '%cError occurred :: ', ['#f00']);
                    return void 0;
                }
                variable = null;
                for (variable in rightExpression.freevars) {
                    if (freeVariables.indexOf(variable) === -1) {
                        freeVariables.push(variable);
                    }
                }
            } else {
                if (freeVariables.length === 0) {
                    equationData.setRhsAuto(true);
                    rightExpression.expression = '0';
                } else if (freeVariables.length === 1) {
                    //check if its just x, if so then add y at RHS
                    if (freeVariables[0] === supportParamVar) {
                        freeVariables.push('y');
                        equationData.setRhsAuto(true);
                        rightExpression.expression = 'y';
                        if (equationData.getSolveOnlyY() && freeVariables[0] === 'x') {
                            equationData.setCanBeSolved(false);
                            equationData.setErrorCode('CannotUnderstandThis');
                            return void 0;
                        }
                    } else {
                        if (equationData.getSolveOnlyY()) {
                            freeVariables.push(supportParamVar);
                            equationData.setRhsAuto(true);
                            rightExpression.expression = supportParamVar;
                        } else {
                            equationData.setCanBeSolved(false);
                            equationData.setErrorCode('OnlyY');
                            equationData.setErrorString("Only y not allowed");
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, '%cError occurred :: ', ['#f00']);
                            return void 0;
                        }
                    }

                } else {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('Cant understand this');
                    equationData.setErrorString('Complicated');
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, '%cError occurred :: ', ['#f00']);
                    return void 0;
                }
                if (!EquationEngine.Parser._deploy) {
                    //start time for right expression pre processing stage.
                    MathUtilities.Components.EquationEngine.Models.Profile.getStartTime('rightPreProcess');
                }

                EquationEngine.Parser._preProcessExpression(rightExpression);
                if (!EquationEngine.Parser._deploy) {
                    //processing time for pre processing stage.
                    profiles[0] += MathUtilities.Components.EquationEngine.Models.Profile.getProcessingTime('rightPreProcess');

                    //start time for right token generation stage.
                    MathUtilities.Components.EquationEngine.Models.Profile.getStartTime('rightTokenGeneration');
                }
                EquationEngine.Parser._parseExpression(rightExpression, equationData);
                EquationEngine.Parser.postProcessTokens(rightExpression, equationData);
                if (!EquationEngine.Parser._deploy) {
                    //processing time for token generation stage.
                    profiles[1] += MathUtilities.Components.EquationEngine.Models.Profile.getProcessingTime('rightTokenGeneration');
                }
                if (!equationData.isCanBeSolved()) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, '%cError occurred :: ', ['#f00']);
                    return void 0;
                }

            }
            if (directives.FDFlagMethod === 'graphing') {
                EquationEngine.Parser._getFracDecAnalysis(equationData);
            }
            if (!equationData.isCanBeSolved()) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, '%cError occurred :: ', ['#f00']);
                return void 0;
            }
            if (!EquationEngine.Parser._deploy) {
                $rightPreprocessLatex = $("#pre-process-latex-right");
                $rightPreProcessLatexExpression = $('<div></div>');
                $rightPreprocessLatex.append($rightPreProcessLatexExpression);
                $rightPreProcessLatexExpression.attr('id', 'right-preprocess-latex-expression')
                    .append(rightExpression.expression)
                    .css({
                        "border": '1px solid',
                        "border-color": EquationEngine.Parser._borderColor,
                        "padding": '5px'
                    });
            }

            isXYVariablePresent = freeVariables.indexOf(supportParamVar) !== -1 || freeVariables.indexOf('y') !== -1;
            newFreeVariables = [];
            if (isRVariablePresent && isXYVariablePresent) {
                variableCounter = 0;
                freeVariablesLength = freeVariables.length;
                for (variableCounter; variableCounter < freeVariablesLength; variableCounter++) {
                    newFreeVariables.push(freeVariables[variableCounter]);
                }
                freeVariables = newFreeVariables;

                EquationEngine.Parser._setRAsConstantForCartesianEquation(leftExpression.tokens);

                EquationEngine.Parser._setRAsConstantForCartesianEquation(rightExpression.tokens);
            }

            if (!EquationEngine.Parser._deploy) {
                EquationEngine.Parser._displayArrayOfObjects(rightExpression.tokens, 'tokens-display-container-right', '#770', '#fff');
            }
            if (freeVariables.length > MIN_FREE_VAR_LENGTH) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('MoreFreeVariables');
                equationData.setErrorString(EquationEngine.EquationEnums.ERROR_TOO_MANY_FREE_VARIABLES);
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, '%cError occurred :: ', ['#f00']);
            }

            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[READY]' + 'Final equation is ' +
                equationData, [EquationEngine.Parser._YSTYLE]);
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, equationData, []);

            //check if we find any constants that we don't have value for

            noConstantDeclared = equationData.getConstants() === null;
            EquationEngine.Parser._checkIfOnlyNumbersAndConstantsPresent(equationData);
            if (!equationData.isCanBeSolved()) {
                return void 0;
            }

            EquationEngine.Parser._substituteConstants(leftExpression, equationData, noConstantDeclared);
            EquationEngine.Parser._substituteConstants(rightExpression, equationData, noConstantDeclared);

            // The below check is for constants error handling
            if (!equationData.isCanBeSolved()) {
                this._mergeConstantsErrorData(equationData);
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.error, '%cError occurred :: ', ['#f00']);
            }
            //validate and set range
            if (splitRangeObj.rangeLatex) {
                EquationEngine.Parser._parseAndSetRange(splitRangeObj.rangeLatex, equationData);
                firstRangeAccText = equationData.getAccText();
                equationData.setAccText(" and the range is " + firstRangeAccText);
            }
            if (splitRangeObj.secondRangeLatex) {
                EquationEngine.Parser._parseAndSetRange(splitRangeObj.secondRangeLatex, equationData, true);
                equationData.setAccText(" and has two ranges " + firstRangeAccText + " and " + equationData.getAccText());
            }
            if (equationData.getAccText()) {
                equationData.setRangeAccText([equationData.getAccText()]);
            }
            if (!equationData.isCanBeSolved()) {
                return void 0;
            }
            if (!EquationEngine.Parser._deploy) {
                EquationEngine.Parser._printTokens(leftExpression, 'Left expression ');
                EquationEngine.Parser._printTokens(rightExpression, 'Right expression ');

                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '%c[STAGE1 - Success]' +
                    'Token Generation Complete', [EquationEngine.Parser._YSTYLE]);
                $('#production-rules-display').html('');
            }
            if ($.isEmptyObject(leftExpression.freevars) && $.isEmptyObject(rightExpression.freevars)) {
                equationData.setSpecie('expression');
                if (!equationData.getParentEquation() && splitRangeObj.rangeLatex || splitRangeObj.secondRangeLatex) {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('InvalidRange');
                }
            }
        },

        "_setRAsConstantForCartesianEquation": function(tokens) {
            var tokensLength = tokens.length,
                tokenCounter,
                currentToken;
            for (tokenCounter = 0; tokenCounter < tokensLength; tokenCounter++) {
                currentToken = tokens[tokenCounter];
                if (currentToken.value === 'r') {
                    currentToken.type = 'const';
                }
            }
        },

        "_checkIfOnlyNumbersAndConstantsPresent": function(equationData) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                isLeftOnlyValues,
                leftExpression = equationData.getLeftExpression(),
                rightExpression = equationData.getRightExpression(),
                isRightOnlyValues;
            if (_.size(leftExpression.freevars) === 0 && _.size(rightExpression.freevars) === 0 &&
                !equationData.getRhsAuto()) {
                isLeftOnlyValues = EquationEngine.Parser._containsOnlyNumbersAndConstants(leftExpression.tokens);
                isRightOnlyValues = EquationEngine.Parser._containsOnlyNumbersAndConstants(rightExpression.tokens);
                if (isLeftOnlyValues && isRightOnlyValues) {
                    equationData.setCanBeSolved(false);
                    EquationEngine.Parser._substituteConstants(leftExpression, equationData, false);
                    EquationEngine.Parser._substituteConstants(rightExpression, equationData, false);
                    this._mergeConstantsErrorData(equationData);
                    if (equationData.getInEqualityType() !== 'equal') {
                        equationData.setErrorCode('InequalityOnlyNumbers');
                    } else {
                        equationData.setErrorCode('OnlyNumbers');
                    }
                }
            }
        },


        "_getFracDecAnalysis": function(equationData) {

            var removeFracDecTokens,
                flagL,
                leftExpression = equationData.getLeftExpression(),
                rightExpression = equationData.getRightExpression(),
                flagR,
                MIN_FREE_TOKEN_LENGTH = 2,
                analyseForFracDec = function(tokens) {
                    var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                        fracDecErrorTokenValues = ['\\pi', 'e', 'x', 'y'],
                        i = 1,
                        bracketStack = [],
                        err = false,
                        errorString = 'Syntax Error in FracDec',
                        tokenCounter,
                        tokensLength = tokens.length,
                        fracdecOccured = false,
                        currentToken;
                    if (tokens === void 0 || tokensLength === 0) {
                        return void 0;
                    }
                    if (tokensLength < MIN_FREE_TOKEN_LENGTH) {
                        removeFracDecTokens(tokens);
                        return void 0;

                    }
                    if (tokens[0].value !== '\\fracdec') {
                        for (tokenCounter = 0; tokenCounter < tokensLength; tokenCounter++) {
                            currentToken = tokens[tokenCounter];
                            if (currentToken.value === '\\fracdec') {
                                fracdecOccured = true;
                                continue;
                            }
                            if (EquationEngine.ParsingProcedures._isValidBracket(currentToken.value)) {
                                if (fracdecOccured) {
                                    EquationEngine.ParsingProcedures.recordBracket(bracketStack, currentToken.value);
                                }
                            } else {
                                if (bracketStack.length > 0 && fracDecErrorTokenValues.indexOf(currentToken.value) !== -1) {
                                    equationData.setCanBeSolved(false);
                                    equationData.setErrorString(errorString);
                                    equationData.setErrorCode('FracDecError');
                                    return void 0;
                                }
                            }
                        }
                        return 'decimal';
                    }

                    while (i < tokensLength) {
                        if (i === 1 && !EquationEngine.ParsingProcedures._isValidBracket(tokens[i].value)) {
                            err = true;
                            break;
                        }
                        EquationEngine.ParsingProcedures.recordBracket(bracketStack, tokens[i].value);

                        if (fracDecErrorTokenValues.indexOf(tokens[i].value) !== -1) {
                            err = true;
                            errorString = 'No \u03c0 or e allowed in fracdec';
                            break;
                        }
                        i++;
                        if (bracketStack.length === 0) {
                            break;
                        }
                    }

                    err = err || bracketStack.length > 0 ? errorString = 'No \u03C0 or e allowed in fracdec' : false;

                    if (err) {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorString(errorString);
                        equationData.setErrorCode('FracDecError');
                        return void 0;
                    }

                    if (i < tokens.length) {
                        return "decimal";
                    }

                    return "frac";
                };

            removeFracDecTokens = function(tokens) {
                var i = 0;
                if (!tokens) {
                    return void 0;
                }
                while (i < tokens.length) {
                    if (tokens[i].value === '\\fracdec') {
                        if (tokens.length > i + 1) {
                            if (tokens[i + 1].value !== '(') {
                                equationData.setCanBeSolved(false);
                                equationData.setErrorCode('CannotUnderstandThis');
                                return void 0;
                            }
                            tokens[i + 1].sign = tokens[i].sign;
                        }
                        tokens.splice(i, 1);
                        continue;
                    }
                    i++;
                }
            };

            flagL = analyseForFracDec(leftExpression.tokens);
            if (flagL === "frac" && rightExpression && rightExpression.tokens) {
                flagR = analyseForFracDec(rightExpression.tokens);
            }

            removeFracDecTokens(leftExpression.tokens);
            removeFracDecTokens(rightExpression.tokens);

            equationData.setFdFlag(flagR || flagL);
        },


        "_mergeConstantsErrorData": function(equationData) {
            var errorDataCounter,
                errorDataLength,
                errorData,
                leftExpression = equationData.getLeftExpression(),
                rightExpression = equationData.getRightExpression(),
                currentErrorData;
            equationData.setErrorData([]);
            errorData = equationData.getErrorData();
            if (leftExpression.errorData !== void 0) {
                errorDataCounter = 0;
                errorDataLength = leftExpression.errorData.length;
                for (errorDataCounter; errorDataCounter < errorDataLength; errorDataCounter++) {
                    currentErrorData = leftExpression.errorData[errorDataCounter];
                    if (errorData.indexOf(currentErrorData) === -1) {
                        errorData.push(currentErrorData);
                    }
                }
            }
            if (rightExpression.errorData !== void 0) {
                errorDataCounter = 0;
                errorDataLength = rightExpression.errorData.length;
                for (errorDataCounter; errorDataCounter < errorDataLength; errorDataCounter++) {
                    currentErrorData = rightExpression.errorData[errorDataCounter];
                    if (errorData.indexOf(currentErrorData) === -1) {
                        errorData.push(currentErrorData);
                    }
                }
            }
        },

        "_containsOnlyNumbersAndConstants": function(tokens) {
            var tokenCounter,
                tokensLength = tokens.length,
                isOnlyValues = true,
                onlyNumbersTokenTypes = ['digit', 'opr', 'func', 'delim'],
                currentToken;
            for (tokenCounter = 0; tokenCounter < tokensLength; tokenCounter++) {
                currentToken = tokens[tokenCounter];
                if (onlyNumbersTokenTypes.indexOf(currentToken.type) !== -1) {
                    continue;
                }
                if (currentToken.type === 'const') {
                    if (currentToken.value === 'e' || currentToken.value === '\\pi') {
                        isOnlyValues = false;
                        break;
                    }
                } else {
                    isOnlyValues = false;
                    break;
                }
            }
            return isOnlyValues;
        },

        /**

            Function to check whether the function name provided contains `,` in its latex expression.

            @private
            @method _isCommaFunction
            @param functionName{String} The name of the function for which `,` has to be checked
            @return {Boolean} true if function contains `,` in its latex
            @static
        **/
        "_isCommaFunction": function(functionName) {
            var COMMA_FUNCTIONS = ['\\lcm', '\\gcd', '\\min', '\\nPr', '\\nCr', '\\npr', '\\ncr', '\\mod'];
            return COMMA_FUNCTIONS.indexOf(functionName) !== -1;
        },

        "_parseAndSetRange": function(rangeLatex, equationData, isCallForSecondRange) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                tokens = equationData.getLeftExpression().tokens,
                rangeTokens,
                rangeLength,
                rangeObj,
                counter,
                MAX_LENGTH = 2,
                predictionStack,
                checkForError = function() {
                    if (!equationData.isCanBeSolved()) {
                        if (!equationData.getErrorCode()) {
                            equationData.setErrorCode('InvalidRange');
                        }
                        return true;
                    }
                    return false;
                };

            equationData.setRangeAccText([]);
            rangeTokens = EquationEngine.RangeProductionRules.validateRange(rangeLatex, equationData);
            if (checkForError()) {
                return void 0;
            }
            rangeLength = rangeTokens.length;
            if (rangeLength === 0) {
                //infinity case returns empty array
                return void 0;
            }
            if (rangeLength <= MAX_LENGTH) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('InvalidRange');
                return void 0;
            }
            if (isCallForSecondRange) {
                rangeObj = equationData.getRange();
                for (counter = 0; counter < rangeLength; counter++) {
                    if (rangeTokens[counter].value === rangeObj.variable) {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('InvalidRange');
                        return void 0;
                    }
                }
            }

            predictionStack = EquationEngine.Parser._recursiveDescentParser(equationData, rangeTokens, 0, 0, [void 0], true);
            if (predictionStack === void 0) {
                if (EquationEngine.Parser._isFunctionDefinition(tokens, equationData.getLatex())) {
                    equationData.setSpecie('function');
                    equationData.setDefinitionFor({
                        "name": tokens[0].value,
                        "constants": [tokens[2].value]
                    });
                }
                equationData.setCanBeSolved(false);
            }
            if (checkForError()) {
                return void 0;
            }
            equationData.setRange(EquationEngine.Parser._setRangeFromSequenceString(predictionStack, rangeTokens,
                equationData, isCallForSecondRange));
        },

        "_setRangeFromSequenceString": function(predictionStack, tokens, equationData, isCallForSecondRange) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                range = {
                    "min": null,
                    "max": null,
                    "variable": null,
                    "rangeForFunctionVariable": {
                        "min": null,
                        "max": null,
                        "variable": null
                    }
                },
                sequenceString,
                sequences,
                sequencesLength,
                minMax,
                prevRange = equationData.getRange(),
                equationConstants = equationData.getConstants(),
                isMin,
                rangeSplits,
                rangeStartAccText,
                accText,
                MIN_SEQUENCE_LENGTH = 2;
            sequenceString = EquationEngine.RangeProductionRules.solution[predictionStack[0]];
            sequences = sequenceString.split(' ');
            sequencesLength = sequences.length;
            if (sequencesLength === MIN_SEQUENCE_LENGTH) {
                if (sequences[0].indexOf('var') === -1) {
                    range.variable = sequences[1];
                    minMax = sequences[0];
                    isMin = sequences[0].indexOf('min') !== -1;
                } else {
                    range.variable = sequences[0];
                    minMax = sequences[1];
                    isMin = sequences[1].indexOf('min') !== -1;
                }
                if (isMin) {
                    range.min = EquationEngine.Parser._createMinMaxObject(minMax, tokens, equationConstants, equationData);
                } else {
                    range.max = EquationEngine.Parser._createMinMaxObject(minMax, tokens, equationConstants, equationData);
                }
            } else {
                range.variable = sequences[1];
                if (sequences[0].indexOf('min') !== -1) {
                    range.min = EquationEngine.Parser._createMinMaxObject(sequences[0], tokens, equationConstants, equationData);
                    range.max = EquationEngine.Parser._createMinMaxObject(sequences[2], tokens, equationConstants, equationData);
                } else {
                    range.min = EquationEngine.Parser._createMinMaxObject(sequences[2], tokens, equationConstants, equationData);
                    range.max = EquationEngine.Parser._createMinMaxObject(sequences[0], tokens, equationConstants, equationData);
                }
                if (typeof range.min.value !== 'object' && typeof range.max.value !== 'object') {
                    if (range.min.value > range.max.value) {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('InvalidRange');
                    } else if (range.min.value === range.max.value && !(range.min.include && range.max.include)) {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('InvalidRange');
                    }
                }
            }
            rangeSplits = range.variable.split('.');
            range.variable = tokens[Number(rangeSplits[rangeSplits.length - 1])].value;
            accText = this._generateRangeAccText(equationData, range);
            if (equationData.getDoNotAllowYRange() && range.variable === 'y' || (equationData.getSolveOnlyY() && range.variable !== 'y')) {
                equationData.setCanBeSolved(false);
            }
            if (isCallForSecondRange) {
                range.rangeForFunctionVariable.min = range.min;
                range.rangeForFunctionVariable.max = range.max;
                range.rangeForFunctionVariable.variable = range.variable;
                range.min = prevRange.min;
                range.max = prevRange.max;
                range.variable = prevRange.variable;
                accText = this._generateRangeAccText(equationData, range.rangeForFunctionVariable);
            }
            equationData.setAccText(accText);
            return range;
        },

        "_generateRangeAccText": function(equationData, range) {
            var rangeVariable = range.variable,
                rangeAccText = equationData.getRangeAccText(),
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                OPERATOR_TEXT = EquationEngine.TreeProcedures.OPERATOR_TEXT,
                max = range.max,
                min = range.min,
                accText = "",
                counter,
                lessThanOperatorText, maxRangeAccText, minRangeAccText,
                greaterThanOperatorText;
            if (range.min) {
                greaterThanOperatorText = range.min.include ? OPERATOR_TEXT.GE : OPERATOR_TEXT.GT;
            }
            if (range.max) {
                lessThanOperatorText = range.max.include ? OPERATOR_TEXT.LE : OPERATOR_TEXT.LT;
            }

            for (counter = 0; counter < rangeAccText.length; counter++) {
                if (rangeAccText[counter].accText === range.variable) {
                    continue;
                }
                if (max && rangeAccText[counter].solution === range.max.value) {
                    maxRangeAccText = rangeAccText[counter].accText;
                } else if (min && rangeAccText[counter].solution === range.min.value) {
                    minRangeAccText = rangeAccText[counter].accText;
                }

            }
            if (min && max) {
                accText = range.variable + lessThanOperatorText + maxRangeAccText;
                accText += " and" + greaterThanOperatorText + minRangeAccText;
            } else {
                if (min) {
                    accText = range.variable + greaterThanOperatorText + minRangeAccText;
                } else {
                    accText = range.variable + lessThanOperatorText + maxRangeAccText;
                }
            }
            return accText;
        },

        "_createMinMaxObject": function(sequence, tokens, equationConstants, equationData) {
            var minMax = {
                    "include": sequence.indexOf('equal') !== -1,
                    "value": null
                },
                sequenceSplits,
                constants,
                valueToken;
            sequenceSplits = sequence.split('.');
            valueToken = tokens[sequenceSplits[sequenceSplits.length - 1]];
            if (valueToken && valueToken.type === 'const') {
                if (valueToken.value === equationData.getSupportedParamVar()) {
                    equationData.setErrorCode('InvalidRange');
                    equationData.setCanBeSolved(false);
                    return minMax;
                }
                equationData.getRightEquationParameters().constantsList.push(valueToken.value);
                if (equationConstants[valueToken.value] !== void 0) {
                    minMax.value = valueToken;
                } else {
                    if (valueToken.value !== 'e' && valueToken.value !== '\\pi') {
                        equationData.setErrorCode('ConstantDeclaration');
                        equationData.setCanBeSolved(false);
                        if (equationData.getErrorData() === null) {
                            equationData.setErrorData([]);
                        }
                        constants = equationData.getErrorData();
                        if (constants.indexOf(valueToken.value)) {
                            constants.push(valueToken.value);
                        }
                    } else {
                        minMax.value = MathUtilities.Components.EquationEngine.Models.Parser._constants[valueToken.value];
                    }
                }
            } else {
                minMax.value = Number(valueToken.value);
            }
            if (valueToken.sign === '-') {
                minMax.value *= -1;
            }
            return minMax;
        },
        /**

            Function to split range from the equation latex provided

            @private
            @method _splitRangeFromSolution
            @param latexString{String} The equation latex string
            @param equationData{Object} The equation data object for the current equation
            @return {Object} The latex string with range separated
            @static
        **/
        "_splitRangeFromSolution": function(latexString, equationData) {
            var regexEnd = /(\\\})/,
                counter,
                equationRangeList = latexString.split('\\{'),
                END_RANGE_INDEX = 2,
                length = equationRangeList.length;
            if (length > 3) { // range set for more than 2 variables
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return void 0;
            }
            if (equationRangeList[1]) {
                if (equationRangeList[1].indexOf('\\}') !== equationRangeList[1].length - END_RANGE_INDEX) {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('CannotUnderstandThis');
                    return void 0;
                }
                equationRangeList[1] = equationRangeList[1].replace(regexEnd, '');
            }

            if (equationRangeList[2]) {
                if (equationRangeList[2].indexOf('\\}') !== equationRangeList[2].length - END_RANGE_INDEX) {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('CannotUnderstandThis');
                    return void 0;
                }
                equationRangeList[2] = equationRangeList[2].replace(regexEnd, '');
            }
            for (counter = 0; counter < length; counter++) {
                if (equationRangeList[counter] === '') {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('CannotUnderstandThis');
                }
            }
            return {
                "rangeLatex": equationRangeList[1],
                "latexEquation": equationRangeList[0],
                "secondRangeLatex": equationRangeList[2]
            };
        },


        /**
         * Function to check errors in equation that can be directly found out in the latex string
         *
         * @private
         * @method _preProcessLatexForErrors
         * @param latexEquation{String} The equation in latex form.
         * @param equationData{Object} The equation data object which is used to set the error variable if error occurs.
         * @return Void
         * @static
         **/
        "_preProcessLatexForErrors": function(latexEquation, equationData) {
            var raisedToErrorCaseRegex = /[\\a-zA-Z0-9]*[\^][a-zA-Z0-9](([0-9]+)|([\.]))/g,
                matches,
                matchCounter,
                matchesLength,
                match,
                errorCaseRegex;

            if (latexEquation.indexOf('---') !== -1) {
                // Case where more than 2 negative signs are used together in an equation
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return void 0;
            }

            matches = latexEquation.match(raisedToErrorCaseRegex);
            if (matches !== null) {
                matchesLength = matches.length;
                for (matchCounter = 0; matchCounter < matchesLength; matchCounter++) {
                    errorCaseRegex = /\\[a-zA-Z0-9]+[\^][a-zA-Z0-9][0-9]+(([\.]?[0-9])*)/g;
                    match = errorCaseRegex.exec(matches[matchCounter]);
                    if (match === null) {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('CannotUnderstandThis');
                        return void 0;
                    }
                }
            }
            if (latexEquation.indexOf('!!') !== -1) {
                // Multiple factorials are not supported
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return void 0;
            }
        },

        /**
        Returns function variable precedence index. This is used when equation has two free variables that are eligible to be chosen as a function variable.

        @private
        @method _getFunctionVariablePrecedenceIndex
        @param functionVariable{String}
        @return {integer} function variable precedence index
        @static
        **/

        "_getFunctionVariablePrecedenceIndex": function(funcVariable) {
            switch (funcVariable) {
                case "y":
                    return 3;
                case "x":
                    return 2;
                default:
                    return 0;
            }
        },


        /**
        Merges RHS tree of an equation to the LHS tree so that equation like A= B will be converted to A-B=0

        @private
        @method _shiftAllRightTokensToLeft
        @param  equationData{Object}
        @static
        @deprecated
        **/
        "_shiftAllRightTokensToLeft": function(equationData) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                rightExpression = equationData.getRightExpression(),
                rightTokens = rightExpression.tokens,
                leftExpression = equationData.getLeftExpression(),
                rightTokensLength = rightTokens.length,
                tokenCounter = 0,
                currentRightToken,
                plusToken,
                zeroToken;
            for (tokenCounter; tokenCounter < rightTokensLength; tokenCounter++) {
                currentRightToken = rightTokens[tokenCounter];
                plusToken = EquationEngine.Parser._getFactoryToken();
                plusToken.value = '+';
                plusToken.isValid = true;
                plusToken.type = 'opr';
                plusToken.sign = '+';
                leftExpression.tokens.push(plusToken);
                if (currentRightToken.sign === '-') {
                    currentRightToken.sign = '+';
                } else {
                    currentRightToken.sign = '-';
                }
                leftExpression.tokens.push(currentRightToken);
            }
            zeroToken = EquationEngine.Parser._getFactoryToken();
            zeroToken.value = '0';
            zeroToken.isValid = true;
            zeroToken.type = 'digit';
            zeroToken.sign = '+';

            rightExpression.tokens = [];
            rightExpression.tokens.push(zeroToken);
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Shifted all right tokens to left ----------------------------------------------', []);
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, equationData, []);
        },

        /*

        */
        /**
        Function to process expression string to
        1. convert a -- b to a + b, a - b to a + -b
        2. add invisible cdot to connecting variables or digits or constants. Eg.  abc will be a \cdot b \cdot c
        3. add brackets for functions for whom parsing without brackets is not possible such as log_ 55 which is interpreted as log_{5} 5

        @private
        @method _preProcessExpression
        @param  equationExpression{Object} left or right expression object from equationData
        @return Void
        @static
        **/
        "_preProcessExpression": function(equationExpression) {
            if (equationExpression === void 0) {
                return void 0;
            }
            equationExpression.expression = equationExpression.expression.replace(/\\times/g, '\\cdot ');
            // replaces '--' with '+'
            var lengthCounter,
                fracdecRegex = /\\text\{fracdec}/g,

                absRegex = /\\text\{abs}/g,

                //i/p:  \\left\\lceil ; o/p: \\ceil( ; same for floor
                leftCeilFloorRegex = /\\l((ceil)|(floor))/g,

                //i/p: \\right\\rceil ; o/p: ) ; same for floor
                rightCeilFloorRegex = /\\r(ceil|floor)/g,

                //i/p:  \\left\\lpipe ; o/p: \\abs( ;
                leftPipeRegex = /\\lpipe/g,

                //i/p: \\right\\rceil ; o/p: ) ;
                rightPipeRegex = /\\rpipe/g,

                replaceFunction,
                //ip: \\sin^{-1}; o/p \\arcsin
                inverseTrigoReplacementRegex = /(\\sin\^\{\-1\}|\\cos\^\{\-1\}|\\tan\^\{\-1\}|\\cot\^\{\-1\}|\\csc\^\{\-1\}|\\sec\^\{\-1\}|\\sinh\^\{\-1\}|\\cosh\^\{\-1\}|\\tanh\^\{\-1\}|\\coth\^\{\-1\}|\\csch\^\{\-1\}|\\sech\^\{\-1\})/g,
                //i/p: sqrt{3}; o/p: sqrt[2]{3}


                //i/p: \prod{n=1.2}^555 ; o/p: \prod{n=1.2}^{5}55
                prodRegex = /\\prod_\{[A-Za-z]=(([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[\.][0-9]+)|([\-]?\\theta|[\-]?\\pi|[\-]?[A-Za-z])[A-Za-z]*(\\theta)*(\\pi)*|[\-]?\\theta|[\-]?\\pi|[\-]?[a-zA-Z])\}\^([0-9]|[A-Za-z])/g,

                //i/p: \sum_{n=1.2}^555 ; o/p: \sum_{n=1.2}^{5}55
                sumRegex = /\\sum_\{[A-Za-z]=(([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[\.][0-9]+)|([\-]?\\theta|[\-]?\\pi|[\-]?[A-Za-z])[A-Za-z]*(\\theta)*(\\pi)*|[\-]?\\theta|[\-]?\\pi|[\-]?[a-zA-Z])\}\^([0-9]|[A-Za-z])/g,

                //i/p: 2^{25}\% ; o/p : (2^{25})\%
                powPercentRegex = /(([\-]?[0-9]*[\.]?[0-9]*[A-Za-z]*(\\theta)*(\\pi\s)*)[\^][\{]([\-]?[0-9]*[\.]?[0-9]*[A-Za-z]*(\\theta)*(\\pi\s)*)[\}])([\\][\%])/g,

                //i/p: 2^2\% ; o/p: (2^2)\%
                powPercentRegex1 = /(([0-9]*[\.]?[0-9]*[A-Za-z]*(\\theta)*(\\pi\s)*)[\^]([0-9]+[\.]?[0-9]*[A-Za-z]*(\\theta)*(\\pi\s)*))([\\][\%])/g,

                //i/p: x\\%\\% ; o/p: (x\\%)\\%
                percentRegex = /([\(|\)|\{|\}|\[|\]|\+|\-|\/|\%|\*|\^|])?((([\-]?[\.][0-9]+)|([\-]?[A-Za-z])|([\-]?(\\theta))|([\-]?(\\pi\s))|([\-]?[0-9]+[\.]?[0-9]*)))[\\][\%]([\\][\%])/g,

                //i/p: x\\%\\%\\% ; o/p: ((x\\%)\\%)\\%
                percentRegex1 = /([\(|\)|\{|\}|\[|\]|\+|\-|\/|\%|\*|\^])?([\(]+(([\-]?[\.][0-9]+)|([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[A-Za-z])|([\-]?(\\theta))|([\-]?(\\pi\s)))([\\][\%][\)])+)([\\][\%]([\\][\%]+))/g,

                //i/p: x!^y ; o/p: (x!)^y
                factPowRegex = /((([\-]?[0-9]+[\.]?[0-9]*)|([\-]?(\\theta))|([\-]?(\\pi\s))|([\-]?[\.][0-9]+)|([\-]?[a-zA-Z]))[\!])([/^]([\{]|[0-9A-Za-z]))/g,

                //i/p: \log_x^yz ; o/p: \log_{x}^{y}(z)
                logPowerRegex = /(\\log_)(([0-9A-Za-z])|[\{]([0-9a-zA-Z\+\_\.\-\\{}()\[\]\^]+|(?:[\-]?(\\pi\s)))[\}])[\^](([0-9A-Za-z])|[\{]([0-9a-zA-Z\+\_\.\-\\{}()\[\]\^]+|(?:[\-]?(\\pi\s)))[\}])(([\-]?[\.][0-9]+)|([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[A-Za-z])|([\-]?(\\theta))|([\-]?(\\pi\s)))/g;

            equationExpression.expression = equationExpression.expression.replace(inverseTrigoReplacementRegex, _.bind(function($0) {
                var trigIndex = this._INVERSIBLE_FUNCTIONS.indexOf($0);
                return this._INVERT_FUNCTIONS_IN_ORDER[trigIndex];
            }, this));

            equationExpression.expression = equationExpression.expression.replace(fracdecRegex, '\\fracdec');
            equationExpression.expression = equationExpression.expression.replace(absRegex, '\\abs');
            equationExpression.expression = equationExpression.expression.replace(leftCeilFloorRegex, function($0, $1) {
                return '\\' + $1 + '(';
            });
            equationExpression.expression = equationExpression.expression.replace(rightCeilFloorRegex, ')');
            equationExpression.expression = equationExpression.expression.replace(leftPipeRegex, '\\abs(');
            equationExpression.expression = equationExpression.expression.replace(rightPipeRegex, ')');
            //Handling square root cases
            // handled in token processing
            //equationExpression.expression = equationExpression.expression.replace(sRootRegex, sRootReplacement);

            // Handling log to the base cases
            // handled in token processing
            // Handling cases for product of terms from n=a to n=b
            equationExpression.expression = equationExpression.expression.replace(prodRegex, function($0, $1, $2, $3, $4, $5, $6, $7) {
                return "\\prod_{n=" + $1 + "}^{" + $7 + "}";
            });

            // Handling cases for sum of terms from n=a to n=b
            equationExpression.expression = equationExpression.expression.replace(sumRegex, function($0, $1, $2, $3, $4, $5, $6, $7) {
                return "\\sum_{n=" + $1 + "}^{" + $7 + "}";
            });
            //Handling cases for log and ln.
            // handled in token processing
            //Handling cases for trigonometric functions (sin, cos, tan, cosec, sec, cot), inverse trigonometric functions, hyperbolic functions.
            // handled in token processing
            //Handling cases for ^ followed by \%
            equationExpression.expression = equationExpression.expression.replace(powPercentRegex, function($0, $1, $2) {
                $2 = null;
                return "(" + $1 + ")\\%";
            });
            equationExpression.expression = equationExpression.expression.replace(powPercentRegex1, function($0, $1, $2) {
                $2 = null;
                return "(" + $1 + ")\\%";
            });

            //Handling cases for multiple factorials.
            //Handling cases for multiple \\%.
            equationExpression.expression = equationExpression.expression.replace(percentRegex, function($0, $1, $2) {
                if ($1 === void 0 || $1 === '') {
                    return '(' + $2 + '\\%)\\%';
                }
                return $1 + '(' + $2 + '\\%)\\%';
            });

            lengthCounter = 1;
            replaceFunction = function($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) {
                if ($13.length > lengthCounter) {
                    lengthCounter = $13.length;
                }
                if ($1 === void 0 || $1 === '') {
                    return '(' + $2 + '\\%)\\%';
                }
                return $1 + '(' + $2 + '\\%)\\%';
            };
            while (lengthCounter !== 0) {
                equationExpression.expression = equationExpression.expression.replace(percentRegex1, replaceFunction);
                lengthCounter--;
            }

            //Handling cases for multiple factorials and percent.
            //Handling cases for factorial followed by power.
            equationExpression.expression = equationExpression.expression.replace(factPowRegex, function($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) {
                return "(" + $1 + ")" + $10;
            });


            //Handling cases for type log_x^yz.
            equationExpression.expression = equationExpression.expression.replace(logPowerRegex, function($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) {
                var value = '';
                if ($4 === void 0 || $4 === '') {
                    value = $1 + '{' + $2 + '}^{';
                } else {
                    value = $1 + '{' + $4 + '}^{';
                }
                if ($8 === void 0 || $8 === '') {
                    return value + $6 + '}(' + $10 + ')';
                }
                return value + $8 + '}(' + $10 + ')';
            });
            //Handling cases for trigonometric or logarithmic functions to the power.
            // handled in token processing
        },
        /**
        Function for processing errors occurred during parsing of equation. The functions shows a pop up with error description.

        @private
        @method _processError
        @param  equationData{Object} The equation object passed to the parser
        @return void
        @static
        @deprecated
        **/
        "_processError": function(equationData) {
            var errorWindow = window.open('', '', 'width=200,height=200'),
                writer = errorWindow.document;
            writer.write('The error is :: <strong>' + equationData.getErrorString() + '</strong>\n');
            writer.write('The error data is :: <strong>' + equationData.getErrorData() + '</strong>\n');
        },


        /**
        Returns value of constant for a constant defined in the equationData

        @private
        @method _getValueOfConstantFromEquationData
        @param  equationData{Object}
        @param constantName {String}
        @return {Number} value of the constant
        @static
        @deprecated
        **/
        "_getValueOfConstantFromEquationData": function(equationData, constantName) {
            if (equationData === null || equationData === void 0) {
                return null;
            }
            var constants = equationData.getConstants();
            if (constants === null || constants[constantName] === void 0) {
                return null;
            }
            return constants[constantName];
        },

        /**
        Wrapper function to call functions to calculate max power of variables and checks whether the equation variables can be solved or not.

        @private
        @method _calculateMaxPowerOfVariable
        @param  equationData{Object}
        @return Void
        @static
        **/
        "_calculateMaxPowerOfVariable": function(equationData) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                returnPowers = null,
                variable = null,
                freeVar = null,
                leftExpression = equationData.getLeftExpression(),
                leftRoot = equationData.getLeftRoot(),
                equationFreeVars,
                isQuadraticVariablePresent = false,
                isNonComplicatedVariablePresent = false,
                currentVariableValue;
            returnPowers = EquationEngine.Parser._getFreeVarPower(leftRoot, leftExpression.freevars, equationData);
            for (variable in leftExpression.freevars) {
                leftExpression.freevars[variable] = returnPowers[variable];
            }
            freeVar = null;
            equationData.setFreeVars({});
            equationFreeVars = equationData.getFreeVars();
            for (freeVar in leftExpression.freevars) {
                if (freeVar in equationFreeVars) {
                    if (equationFreeVars[freeVar] !== 'c' && (equationFreeVars[freeVar] < leftExpression.freevars[freeVar] ||
                            leftExpression.freevars[freeVar] === 'c')) {
                        equationFreeVars[freeVar] = leftExpression.freevars[freeVar];
                    }
                } else {
                    equationFreeVars[freeVar] = leftExpression.freevars[freeVar];
                }
            }
            // Check if none of the variables are quadratic or linear then return error;
            variable = null;
            for (variable in equationFreeVars) {
                currentVariableValue = equationFreeVars[variable];
                if (currentVariableValue !== 'c' && currentVariableValue !== Infinity && !isNaN(currentVariableValue)) {
                    isNonComplicatedVariablePresent = true;
                    break;
                }
            }

            if (isNonComplicatedVariablePresent) {
                variable = null;
                for (variable in equationFreeVars) {
                    currentVariableValue = equationFreeVars[variable];
                    if (currentVariableValue !== 'c' && currentVariableValue !== Infinity && !isNaN(currentVariableValue) &&
                        currentVariableValue <= 2 && currentVariableValue !== 0) {
                        isQuadraticVariablePresent = true;
                        break;
                    }
                }
            } else {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode(equationData.getInEqualityType() !== 'equal' ? 'NoneVariablesQuadraticInequality' : 'NoneVariablesQuadratic');
                return void 0;
            }

            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Max power', []);
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, equationData.freeVars, []);
            if (!isQuadraticVariablePresent) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('NoneVariablesQuadratic');
                equationData.setErrorString(EquationEngine.EquationEnums.ERROR_VARIABLE_HAS_TO_BE_QUADRATIC);
                return void 0;
            }
        },

        /**
        Function to substitute value of constants provided inside the equation data object.
        If any of the constants has no value  provided then the error variable is set.
        This function also substitutes value of `pi` and `e`.
        @private
        @method _substituteConstants
        @param expression{Object} left or right expression from equationData
        @param  equationData{Object}
        @param noConstantDeclared {Boolean} true if equationData object has a property `constant` else false
        @return Void
        @static
        **/
        "_substituteConstants": function(expression, equationData, noConstantDeclared) {
            var constantValue,
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                errorData = [],
                errorOccured = false,
                i,
                equationConstants = equationData.getConstants(),
                addToErrorData,
                ignoreConstants,
                currentToken;
            if (equationData.getDefinitionFor()) {
                ignoreConstants = equationData.getDefinitionFor().name;
            }

            for (i = 0; i < expression.tokens.length; i++) {
                constantValue = void 0;
                addToErrorData = false;
                currentToken = expression.tokens[i];
                if (currentToken.type === "const") {
                    if (currentToken.value === ignoreConstants) {
                        continue;
                    }
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'substituting value of constant ' + currentToken.value, []);
                    if (constantValue === void 0) {
                        constantValue = EquationEngine.Parser._constants[currentToken.value];
                        currentToken.constantSubstituted = currentToken.value;
                    }
                    if (constantValue === void 0) {
                        if ((equationConstants === null || noConstantDeclared || equationConstants[currentToken.value] === void 0) &&
                            (currentToken.value !== equationData.getPivot() && currentToken.value !== equationData.getDefinitionFor())) {
                            addToErrorData = true;
                            errorOccured = true;
                        }
                    } else {
                        currentToken.value = constantValue;
                        currentToken.type = "digit";
                    }
                }
                if (addToErrorData && errorData.indexOf(currentToken.value) === -1) {
                    errorData.push(currentToken.value);
                }
            }
            if (errorOccured) {
                expression.errorData = errorData;

                // changes for tei
                equationData.setErrorCode('ConstantDeclaration');
                equationData.setCanBeSolved(false);
                equationData.setErrorString(EquationEngine.EquationEnums.ERROR_CONSTANTS_NOT_DEFINED);
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'I found a constant that didnt have value specified ', []);
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, equationData.getErrorData(), []);
            }
        },

        //tries to find end bracket
        /**
        finds the next opposite token of the token at the startIndex. It considers reoccurance of the same token.

        @private
        @method _getBracketBounds
        @param  tokens{Array} array of tokens
        @param startIndex{Number}
        @return {Integer} value of the index of the opposite token, -1 otherwise
        @static
        @deprecated
        **/
        "_getBracketBounds": function(tokens, startIndex) {
            var startToken = tokens[startIndex].value,
                endToken,
                repeatedStartTokensCount,
                tokensLength,
                tokensCounter,
                EquationEngine = MathUtilities.Components.EquationEngine.Models;
            if (!tokens || tokens.length === 0 || tokens.length < startIndex + 1) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Empty tokens', []);
                return -1;
            }

            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, "Finding end token for " + startToken, []);
            if (startToken === "{") {
                endToken = "}";
            } else {
                if (startToken === "(") {
                    endToken = ")";
                } else {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Invalid Start Token ' + startToken, []);
                }
            }
            repeatedStartTokensCount = 0;
            tokensLength = tokens.length;
            tokensCounter = null;
            for (tokensCounter = startIndex + 1; tokensCounter < tokensLength; tokensCounter++) {

                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, tokens[tokensCounter].value + " >> " + startToken, []);
                if (tokens[tokensCounter].value === startToken) {
                    repeatedStartTokensCount++;
                } else {
                    if (tokens[tokensCounter].value === endToken) {
                        repeatedStartTokensCount--;
                        if (repeatedStartTokensCount === -1) {
                            return tokensCounter;
                        }
                    }
                }
            }

            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, "Cant find end token", []);
            return -1;
        },

        /**
        Generates token factory object
        @private
        @method _getFactoryToken
        @return {Object} token object
        @static
        **/
        "_getFactoryToken": function() {
            var token = {};
            token.toString = function toString() {
                return '(' + this.value + ' ' + this.type + ' ' + this.sign + ' ' + this.negativeCaseType + ')';
            };
            return token;
        },

        /**
            Process powers specified for functions and adds the power to the end of the whole function
            @private
            @method _processFunctionPowers
            @param tokens{Array} array of token objects
            @return {Array} array of token objects
            @static
        **/
        "_processFunctionPowers": function(tokens) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                tokenCounter,
                currentToken,
                previousToken,
                raisedToTokens,
                functionTokens,
                startToken,
                endToken,
                beforeTokens,
                afterTokens,
                isFunctionPowerCase,
                logToBasePower = null;
            for (tokenCounter = 0; tokenCounter < tokens.length; tokenCounter++) {
                isFunctionPowerCase = false;
                currentToken = tokens[tokenCounter];
                if (tokenCounter !== 0) {
                    previousToken = tokens[tokenCounter - 1];
                    if (previousToken.type === 'func') {
                        isFunctionPowerCase = true;
                    } else {
                        logToBasePower = EquationEngine.Parser._checkLogToBasePowerCase(tokens.slice(0, tokenCounter));
                        if (logToBasePower !== null) {
                            isFunctionPowerCase = true;
                        }
                    }
                    if (currentToken.value === '^' && isFunctionPowerCase) {
                        raisedToTokens = EquationEngine.Parser._getFunctionTokens(tokens.slice(tokenCounter + 1));
                        functionTokens = EquationEngine.Parser._getFunctionTokens(tokens.slice(tokenCounter + 1 + raisedToTokens.length));
                        startToken = EquationEngine.Parser._getFactoryToken();
                        endToken = EquationEngine.Parser._getFactoryToken();
                        startToken.type = endToken.type = 'delim';
                        startToken.isValid = endToken.isValid = true;
                        startToken.sign = previousToken.sign;
                        startToken.negativeCaseType = previousToken.negativeCaseType;
                        previousToken.negativeCaseType = EquationEngine.Parser._NEGATIVE_CASE_TYPES.NONE;
                        previousToken.sign = '+';
                        endToken.sign = '+';
                        startToken.value = '(';
                        endToken.value = ')';
                        beforeTokens = tokens.slice(0, tokenCounter - 1);
                        afterTokens = tokens.slice(tokenCounter + raisedToTokens.length + 1 + functionTokens.length, tokens.length);
                        if (logToBasePower !== null) {
                            tokens = beforeTokens.slice(0, beforeTokens.length - logToBasePower.length - 2);
                            tokens.push(startToken);
                            tokens = tokens.concat(logToBasePower);
                        } else {
                            tokens = beforeTokens;
                            tokens.push(startToken, previousToken);
                        }
                        tokens = tokens.concat(functionTokens);
                        tokens.push(endToken, currentToken);
                        tokens = tokens.concat(raisedToTokens);
                        tokens = tokens.concat(afterTokens);
                    }
                }
            }
            return tokens;
        },

        /**
            Check whether the power functions is for log to the base case
            @private
            @method _checkLogToBasePowerCase
            @param tokens{Array} array of token objects
            @return {Array} array of token objects
            @static
        **/
        "_checkLogToBasePowerCase": function(tokens) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                tokenCounter,
                tokensLength = tokens.length,
                currentToken,
                bracketCounter = 0,
                logToBasePower = null;
            for (tokenCounter = tokensLength - 1; tokenCounter >= 0; tokenCounter--) {
                currentToken = tokens[tokenCounter];
                if (EquationEngine.ParsingProcedures._isOpeningBracket(currentToken.value)) {
                    bracketCounter++;
                } else if (EquationEngine.ParsingProcedures._isClosingBracket(currentToken.value)) {
                    bracketCounter--;
                } else {
                    if (bracketCounter === 0) {
                        //&& currentToken.isProcessed !== true was here
                        if (currentToken.value === '\\log_') {
                            logToBasePower = tokens.slice(tokenCounter, tokensLength);
                        }
                        break;
                    }
                }
            }
            return logToBasePower;
        },

        /**
            Returns parameter tokens for the current function
            @private
            @method _getFunctionTokens
            @param tokens{Array} array of token objects
            @return {Array} array of token objects
            @static
        **/
        "_getFunctionTokens": function(tokens) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                tokenCounter,
                tokensLength = tokens.length,
                currentToken,
                bracketCounter = 0,
                powerTokens = [];
            for (tokenCounter = 0; tokenCounter < tokensLength; tokenCounter++) {
                currentToken = tokens[tokenCounter];
                powerTokens.push(currentToken);
                if (EquationEngine.ParsingProcedures._isOpeningBracket(currentToken.value)) {
                    bracketCounter++;
                } else if (EquationEngine.ParsingProcedures._isClosingBracket(currentToken.value)) {
                    bracketCounter--;
                }
                if (bracketCounter === 0) {
                    break;
                }
            }
            return powerTokens;
        },

        "_isFunctionSupported": function(latex) {
            var supportedFunctions = ['\\cdot', '\\pi', '\\sqrt', '\\fracdec', '\\theta', '\\min',
                '\\max', '\\mod', '\\nCr', '\\nPr', '\\ncr', '\\npr', '\\frac', '\\%', '\\sin', '\\cos', '\\tan', '\\csc',
                '\\sec', '\\cot', '\\arccot', '\\arccsc', '\\arcsin', '\\arcsec', '\\arccos', '\\arctan',
                '\\log', '\\ln', '\\ceil', '\\floor', '\\round', '\\abs', '\\exp', '\\sum', '\\prod', '\\le ',
                '\\ge ', '\\sgn', '\\trunc', '\\mixedfrac'
            ];
            return supportedFunctions.indexOf(latex) !== -1;
        },

        "_createToken": function(value, isValid, type, sign) {
            var token = MathUtilities.Components.EquationEngine.Models.Parser._getFactoryToken();
            token.value = value;
            token.isValid = isValid;
            token.type = type;
            token.sign = sign;

            return token;
        },

        "_generateTokens": function(expression, equationData) {

            /*
             * each token will have following data
             *
             * token value
             * isValid Boolean
             * token type [var,const,func,digit,delim,opr]
             *
             */
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                tokens = [],
                expressionString,
                tokenUnderInspection = '',
                verifiedToken,
                readPointer = 0,
                tokenTypesInOrder = ["func", "delim", "var", "opr", "digit", "const"],
                isRangeParse,
                tokenVerificationResult,
                expressionStringLength,
                tokenFound = false,
                tokenRegularExpressions = [/^\\[a-z|\%|\_]+[\s]?$/i, /^[\[|\]|\}|\{|\(|\)|\,|\{|\}]$/i, /^[x|y]{1}$/, /^[\+|\-|\^|\!|<|\>|\_]{1}$/, /^(([\.][0-9]+)|([0-9]+[\.]?[0-9]*))$/, /^[a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|z|A-Z]$/],
                tokenRegularExpressionCounter = 0,
                prevIndex,
                tokenRegularExpressionsLength = tokenRegularExpressions.length,
                looper = true;

            if (typeof expression === 'string') {
                expressionString = expression;
                isRangeParse = true;
            } else {
                expressionString = expression.expression;
                isRangeParse = false;
            }
            expressionString = expressionString.trim();
            expressionStringLength = expressionString.length;
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'parse expression called', []);

            while (readPointer < expressionStringLength) {
                tokenFound = false;
                //TRACE
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens, '>>' + expressionString.charAt(readPointer) + '<<', []);
                if (tokenUnderInspection === ' ') {
                    tokenUnderInspection = '';
                }
                tokenUnderInspection = tokenUnderInspection + expressionString.charAt(readPointer);
                //TRACE
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens, 'Analyzing token ' + tokenUnderInspection, []);
                for (tokenRegularExpressionCounter = 0; tokenRegularExpressionCounter < tokenRegularExpressionsLength; tokenRegularExpressionCounter++) {
                    tokenVerificationResult = tokenRegularExpressions[tokenRegularExpressionCounter].test(tokenUnderInspection);

                    if (!tokenVerificationResult) {
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens, 'NO!! match ' +
                            tokenRegularExpressions[tokenRegularExpressionCounter] + ' >>' + tokenUnderInspection, []);
                        continue;
                    }
                    readPointer++;
                    if (tokenTypesInOrder[tokenRegularExpressionCounter] === 'func') {
                        if (!EquationEngine.Parser._isFunctionSupported(tokenUnderInspection)) {
                            break;
                        }
                        if (tokenUnderInspection === '\\frac' &&
                            expressionString.charAt(readPointer) + expressionString.charAt(readPointer + 1) +
                            expressionString.charAt(readPointer + 2) === 'dec') {
                            tokenUnderInspection = '\\fracdec';
                            readPointer += 3;
                        }
                        if (verifiedToken) {
                            prevIndex = verifiedToken.index;
                        }
                        verifiedToken = EquationEngine.Parser._createToken(tokenUnderInspection, true, tokenTypesInOrder[tokenRegularExpressionCounter], '+');
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens,
                            '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>TOKEN FOUND ' + verifiedToken.value, []);
                        tokens.push(verifiedToken);
                        tokenFound = true;

                        if (prevIndex !== void 0) {
                            verifiedToken.index = expressionString.indexOf(tokenUnderInspection, prevIndex + 1);
                        } else {
                            verifiedToken.index = expressionString.indexOf(tokenUnderInspection);
                        }
                        tokenUnderInspection = '';
                        break;
                    }
                    if (tokenTypesInOrder[tokenRegularExpressionCounter] === 'digit') {
                        if (verifiedToken && verifiedToken.type === 'opr' &&
                            (verifiedToken.value === '_' || verifiedToken.value === '^')) {
                            if (verifiedToken) {
                                prevIndex = verifiedToken.index;
                            }
                            verifiedToken = EquationEngine.Parser._createToken(tokenUnderInspection, true, tokenTypesInOrder[tokenRegularExpressionCounter], '+');
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens,
                                '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>TOKEN FOUND ' + verifiedToken.value, []);
                            tokens.push(verifiedToken);
                            tokenFound = true;
                            if (prevIndex !== void 0) {
                                verifiedToken.index = expressionString.indexOf(tokenUnderInspection, prevIndex + 1);
                            } else {
                                verifiedToken.index = expressionString.indexOf(tokenUnderInspection);
                            }
                            tokenUnderInspection = '';
                            break;
                        }
                        while (looper) {
                            if (expressionString.charAt(readPointer) !== '') {
                                tokenUnderInspection += expressionString.charAt(readPointer);
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens, 'Digit found', []);
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens, 'Analyzing token ' + tokenUnderInspection, []);
                                if (tokenRegularExpressions[4].test(tokenUnderInspection)) {
                                    readPointer++;
                                    continue;
                                }
                                readPointer--;
                                if (tokenUnderInspection.length !== 1) {
                                    tokenUnderInspection = tokenUnderInspection.substring(0, tokenUnderInspection.length - 1);
                                }
                            }
                            if (verifiedToken) {
                                prevIndex = verifiedToken.index;
                            }
                            verifiedToken = EquationEngine.Parser._createToken(tokenUnderInspection, true, tokenTypesInOrder[tokenRegularExpressionCounter], '+');
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens,
                                '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>TOKEN FOUND ' + verifiedToken.value, []);
                            tokens.push(verifiedToken);
                            tokenFound = true;
                            if (prevIndex !== void 0) {
                                verifiedToken.index = expressionString.indexOf(tokenUnderInspection, prevIndex + 1);
                            } else {
                                verifiedToken.index = expressionString.indexOf(tokenUnderInspection);
                            }
                            tokenUnderInspection = '';
                            break;
                        }
                    } else {
                        if (verifiedToken) {
                            prevIndex = verifiedToken.index;
                        }
                        verifiedToken = EquationEngine.Parser._createToken(tokenUnderInspection, true, tokenTypesInOrder[tokenRegularExpressionCounter], '+');
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens,
                            '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>TOKEN FOUND ' + verifiedToken.value, []);
                        tokens.push(verifiedToken);
                        tokenFound = true;
                        if (prevIndex !== void 0) {
                            verifiedToken.index = expressionString.indexOf(tokenUnderInspection, prevIndex + 1);
                        } else {
                            verifiedToken.index = expressionString.indexOf(tokenUnderInspection);
                        }
                        tokenUnderInspection = '';
                        break;
                    }
                }
                if (tokenRegularExpressionCounter === tokenRegularExpressionsLength) {
                    readPointer++;
                }
            }
            if (!tokenFound) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('Complicated');
                return tokens;
            }
            return EquationEngine.Parser._processTokens(tokens, expression, equationData, isRangeParse);
        },

        "_processTokens": function(tokens, expression, equationData, isRangeParse) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                tokenCounter,
                currentToken,
                nextToNextToken,
                nextToken,
                startCounter,
                noOfTokenToBeDeleted = 0,
                verifiedToken,
                verifiedTokenValue,
                nextCounter,
                processedTokens,
                braceCounter = 0,
                processedTokensLength,
                processingToken,
                processedTokenCounter,
                defaultRoundBrac = 0,
                roundBracCounter = 0,
                curlyBracCounter = 0,
                curlyBracBeforeRound = 0,
                customFunctions = equationData.getCustomFunctions(),
                tokensLength,
                supportParamVar = equationData.getSupportedParamVar(),
                looper = true;
            tokensLength = tokens.length;
            for (tokenCounter = 0; tokenCounter < tokens.length; tokenCounter++) {
                nextCounter = tokenCounter + 1;
                currentToken = tokens[tokenCounter];
                nextToken = tokens[nextCounter];
                switch (currentToken.type) {
                    case 'func':
                        switch (currentToken.value) {
                            case '\\cdot':
                                currentToken.value = '\\cdot';
                                currentToken.type = 'opr';
                                tokenCounter--;
                                break;
                            case '\\pi':
                                currentToken.value = '\\pi';
                                currentToken.type = 'const';
                                tokenCounter--;
                                break;
                            case '\\%':
                                currentToken.value = '\\%';
                                currentToken.type = 'opr';
                                break;
                            case '\\theta ':
                            case '\\theta':
                                currentToken.value = '\\theta';
                                currentToken.type = 'const';
                                tokenCounter--;
                                break;

                            case '\\le ':
                            case '\\le':
                                currentToken.value = '\\le';
                                currentToken.type = 'opr';
                                break;
                            case '\\ge ':
                            case '\\ge':
                                currentToken.value = '\\ge';
                                currentToken.type = 'opr';
                                break;
                        }
                        if (currentToken.type === 'func' && currentToken.value !== '\\frac') {
                            if (roundBracCounter !== 0) {
                                verifiedToken = EquationEngine.Parser._createToken(')', true, 'delim', '+');
                                tokens.splice(tokenCounter, 0, verifiedToken);
                                roundBracCounter--;
                                tokensLength++;
                            }
                            if (nextToken) {
                                if (nextToken.value === '\\pi') {
                                    nextToken.value = '\\pi';
                                    nextToken.type = 'const';
                                } else {
                                    if (nextToken.value === '\\theta' || nextToken.value === '\\theta ') {
                                        nextToken.value = '\\theta';
                                        nextToken.type = 'const';
                                    }
                                }
                                // Handle log to the base cases
                                if (currentToken.value === '\\log') {
                                    // convert log toh log_
                                    currentToken.value = '\\log_';
                                    currentToken.isProcessed = true;
                                    if (nextToken.value === '_') {

                                        // remove _ operator
                                        tokens.splice(++tokenCounter, 1);
                                        tokensLength--;
                                        if (typeof tokens[tokenCounter] === 'undefined') {
                                            break;
                                        }
                                        if (tokens[tokenCounter].value !== '{') {
                                            verifiedToken = EquationEngine.Parser._createToken('{', true, 'delim', '+');
                                            tokens.splice(tokenCounter++, 0, verifiedToken);
                                            verifiedToken = EquationEngine.Parser._createToken('}', true, 'delim', '+');
                                            tokens.splice(++tokenCounter, 0, verifiedToken);
                                        } else {

                                            braceCounter = 1;
                                            tokenCounter++;
                                            startCounter = tokenCounter;
                                            if (tokensLength === startCounter) {
                                                break;
                                            }
                                            while (braceCounter !== 0) {
                                                if (tokens[tokenCounter].value === '{') {
                                                    braceCounter++;
                                                } else if (tokens[tokenCounter].value === '}') {
                                                    braceCounter--;
                                                }
                                                tokenCounter++;
                                            }
                                            tokenCounter--;
                                            // process skipped tokens
                                            processedTokens = tokens.splice(startCounter, tokenCounter - startCounter);

                                            if (processedTokens.length > 1) {
                                                processedTokens = EquationEngine.Parser._processTokens(processedTokens, expression, equationData);
                                            }
                                            processedTokensLength = processedTokens.length;
                                            for (processedTokenCounter = 0; processedTokenCounter < processedTokensLength; processedTokenCounter++) {
                                                tokens.splice(startCounter, 0, processedTokens[processedTokenCounter]);
                                                startCounter++;
                                            }
                                            tokenCounter = startCounter;
                                        }
                                    } else {

                                        // add base value 10 for log without base
                                        verifiedToken = EquationEngine.Parser._createToken('{', true, 'delim', '+');
                                        tokens.splice(++tokenCounter, 0, verifiedToken);
                                        verifiedToken = EquationEngine.Parser._createToken('10', true, 'digit', '+');
                                        tokens.splice(++tokenCounter, 0, verifiedToken);
                                        verifiedToken = EquationEngine.Parser._createToken('}', true, 'delim', '+');
                                        tokens.splice(++tokenCounter, 0, verifiedToken);
                                        tokensLength += 3;
                                    }
                                } else {
                                    if (currentToken.value === '\\sqrt' && nextToken.value === '{') {
                                        // add param 2 for sqrt
                                        verifiedToken = EquationEngine.Parser._createToken('[', true, 'delim', '+');
                                        tokens.splice(++tokenCounter, 0, verifiedToken);
                                        verifiedToken = EquationEngine.Parser._createToken('2', true, 'digit', '+');
                                        tokens.splice(++tokenCounter, 0, verifiedToken);
                                        verifiedToken = EquationEngine.Parser._createToken(']', true, 'delim', '+');
                                        tokens.splice(++tokenCounter, 0, verifiedToken);
                                        tokensLength += 3;
                                        curlyBracCounter++;
                                    }
                                }
                                if (nextToken.value === '^') {

                                    if (tokens[tokenCounter + 2].value === '{') {

                                        braceCounter = 1;
                                        tokenCounter += 3;
                                        startCounter = tokenCounter;
                                        if (typeof tokens[tokenCounter]) {
                                            break;
                                        }
                                        while (braceCounter !== 0) {
                                            if (tokens[tokenCounter].value === '{') {
                                                braceCounter++;
                                            } else if (tokens[tokenCounter].value === '}') {
                                                braceCounter--;
                                            }
                                            tokenCounter++;
                                        }
                                        tokenCounter--;
                                        // process skipped tokens
                                        processedTokens = tokens.splice(startCounter, tokenCounter - startCounter);
                                        if (processedTokens.length > 1) {
                                            processedTokens = EquationEngine.Parser._processTokens(processedTokens, expression, equationData);
                                        }
                                        processedTokensLength = processedTokens.length;
                                        for (processedTokenCounter = 0; processedTokenCounter < processedTokensLength; processedTokenCounter++) {
                                            tokens.splice(startCounter, 0, processedTokens[processedTokenCounter]);
                                            startCounter++;
                                        }
                                        tokenCounter = startCounter;
                                    } else {
                                        tokenCounter += 2;
                                    }
                                }
                                nextToken = tokens[tokenCounter + 1];
                                // change for // sin sin 60
                                if (nextToken && (nextToken.type !== 'delim' && nextToken.type !== 'func')) {
                                    if (curlyBracCounter !== 0) {
                                        curlyBracBeforeRound++;
                                    }
                                    verifiedToken = EquationEngine.Parser._createToken('(', true, 'delim', '+');
                                    tokens.splice(tokenCounter + 1, 0, verifiedToken);
                                    roundBracCounter++;
                                    tokensLength = tokens.length;
                                } else {
                                    if (nextToken && nextToken.value === '\\frac') {
                                        verifiedToken = EquationEngine.Parser._createToken('(', true, 'delim', '+');
                                        tokens.splice(tokenCounter + 1, 0, verifiedToken);
                                        roundBracCounter++;
                                        tokensLength = tokens.length;
                                        tokenCounter++;
                                    }
                                }
                            }
                        }
                        break;

                    case 'var':
                        // to consider y_1 and x_1 as constants
                        if (typeof nextToken !== 'undefined' && nextToken.value === '_') {
                            currentToken.type = 'const';
                            tokenCounter--;
                            continue;
                        }
                        if (!isRangeParse) {
                            if (supportParamVar && currentToken.value === 'x') {
                                equationData.setCanBeSolved(false);
                                break;
                            }
                            if (expression.freevars === void 0) {
                                expression.freevars = {};
                            }
                            if (expression.freevars[currentToken.value] === void 0) {
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens,
                                    '---------------------recording var ' + currentToken.value + "-------------------------", []);
                                //by default status is 1... this will be updated later on
                                expression.freevars[currentToken.value] = 0;
                            }
                        }
                        break;

                    case 'const':
                        startCounter = tokenCounter;
                        nextToken = tokens[tokenCounter + 1];
                        nextToNextToken = tokens[tokenCounter + 2];
                        if (nextToken && nextToken.value === '_' &&
                            currentToken !== void 0 && (currentToken.type === 'var' || currentToken.type === 'const') &&
                            nextToNextToken !== void 0) {
                            // convert to constants
                            if (nextToNextToken.type !== 'delim') {
                                if (nextToNextToken.type !== 'const' && nextToNextToken.type !== 'digit' && nextToNextToken.type !== 'var') {
                                    equationData.setCanBeSolved(false);
                                    equationData.setErrorCode('CannotUnderstandThis');
                                    return void 0;
                                }
                                verifiedToken = EquationEngine.Parser._createToken(currentToken.value +
                                    nextToken.value + nextToNextToken.value, true, 'const', '+');
                                tokens.splice(tokenCounter, 3);
                                tokens.splice(tokenCounter, 0, verifiedToken);
                                currentToken = verifiedToken;
                                tokenCounter--;
                                tokensLength = tokens.length;
                            } else {
                                verifiedTokenValue = currentToken.value + nextToken.value + nextToNextToken.value;
                                noOfTokenToBeDeleted = 3;
                                tokenCounter += 2; // 2 is used for jumping
                                while (looper) {
                                    tokenCounter++;
                                    processingToken = tokens[tokenCounter];
                                    if (processingToken === void 0 || processingToken.type === 'delim' &&
                                        processingToken.value === '}') {
                                        break;
                                    }
                                    if (processingToken.type !== 'const' && processingToken.type !== 'digit' &&
                                        processingToken.type !== 'var') {
                                        equationData.setCanBeSolved(false);
                                        equationData.setErrorCode('CannotUnderstandThis');
                                        return void 0;
                                    }
                                    verifiedTokenValue += processingToken.value;
                                    noOfTokenToBeDeleted++;
                                }
                                verifiedTokenValue += '}';
                                tokenCounter++;
                                noOfTokenToBeDeleted++;
                                if (verifiedTokenValue.indexOf('{}') !== -1) {
                                    equationData.setCanBeSolved(false);
                                    equationData.setErrorCode('CannotUnderstandThis');
                                    return void 0;
                                }
                                verifiedToken = EquationEngine.Parser._createToken(verifiedTokenValue, true, 'const', '+');
                                tokens.splice(startCounter, noOfTokenToBeDeleted);
                                tokens.splice(startCounter, 0, verifiedToken);
                                currentToken = verifiedToken;
                                tokensLength = tokens.length;
                                tokenCounter = startCounter;
                            }
                        }
                        if (customFunctions && customFunctions[currentToken.value] && currentToken.value !== equationData.getDefinitionName()) {
                            currentToken.name = currentToken.value;
                            currentToken.value = '\\customFunc';
                            currentToken.type = 'func';
                            break;
                        }
                        if (!isRangeParse) {
                            if (supportParamVar === currentToken.value) {
                                if (expression.freevars === void 0) {
                                    expression.freevars = {};
                                }
                                if (expression.freevars[currentToken.value] === void 0) {
                                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens,
                                        '---------------------recording var ' + currentToken.value + "-------------------------", []);
                                    //by default status is 1... this will be updated later on
                                    expression.freevars[currentToken.value] = 0;
                                }
                                currentToken.type = 'var';
                                break;
                            }
                            if (expression.constants === void 0) {
                                expression.constants = {};
                            }
                            if (expression.constants[currentToken.value] === void 0) {
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.tokens,
                                    '------------------ recording constant ' + currentToken.value + "--------------------", []);
                                //by default status is 1... this will be updated later on
                                expression.constants[currentToken.value] = 1;
                            }
                            equationData.containsConstant = true;
                        }
                        break;
                    case 'delim':
                        if ((currentToken.value === '}' || currentToken.value === ')') && roundBracCounter) {
                            if (curlyBracCounter === 0 || curlyBracBeforeRound !== 0) {
                                verifiedToken = EquationEngine.Parser._createToken(')', true, 'delim', '+');
                                tokens.splice(tokenCounter, 0, verifiedToken);
                                roundBracCounter--;
                                tokensLength++;
                                if (curlyBracBeforeRound !== 0) {
                                    curlyBracBeforeRound--;
                                }
                            } else {
                                curlyBracCounter--;
                            }
                        } else {
                            if (currentToken.value === '{') {
                                curlyBracCounter++;
                            } else if (currentToken.value === '(') {
                                defaultRoundBrac++;
                            } else if (currentToken.value === ')') {
                                defaultRoundBrac--;
                            }
                        }
                        break;

                    case 'opr':
                        if ((currentToken.value === '+' || currentToken.value === '-') &&
                            roundBracCounter !== 0 && defaultRoundBrac !== 0) {
                            verifiedToken = EquationEngine.Parser._createToken(')', true, 'delim', '+');
                            tokens.splice(tokenCounter, 0, verifiedToken);
                            roundBracCounter--;
                            tokensLength++;
                        }
                        break;
                }
            }
            while (roundBracCounter !== 0) {
                verifiedToken = EquationEngine.Parser._createToken(')', true, 'delim', '+');
                tokens.splice(tokenCounter + 1, 0, verifiedToken);
                roundBracCounter--;
                tokensLength++;
            }

            return tokens;
        },

        "_checkIfFunctionParanthesis": function(tokens) {
            var tokenCounter,
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                tokensLength = tokens.length,
                currentToken,
                bracketCounter = 0,
                isFunctionCase = false;
            for (tokenCounter = tokensLength - 1; tokenCounter >= 0; tokenCounter--) {
                currentToken = tokens[tokenCounter];
                if (EquationEngine.ParsingProcedures._isClosingBracket(currentToken.value)) {
                    bracketCounter++;
                } else if (EquationEngine.ParsingProcedures._isOpeningBracket(currentToken.value)) {
                    bracketCounter--;
                    if (bracketCounter === 0 && tokenCounter !== 0) {
                        if (tokens[tokenCounter - 1].value === '^' && tokens[tokenCounter - 2].type === 'func') {
                            isFunctionCase = true;
                            break;
                        }
                        if (tokens[tokenCounter - 1].type === 'func') {
                            isFunctionCase = true;
                        } else if (tokens[tokenCounter - 1].type === 'delim') {
                            continue;
                        }
                        break;
                    }
                }
            }
            return isFunctionCase;
        },

        "_processPointEquation": function(tokens, equationData) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                tokenCounter,
                currentTokens = [],
                currentToken,
                previousToken,
                tokensLength = tokens.length,
                latex,
                solution;
            latex = equationData.getLatex();
            if (tokens[0].value !== '(' || tokens[tokensLength - 1].value !== ')') {
                return void 0;
            }
            equationData.setSolution([]);
            currentTokens.push(tokens[0]);
            for (tokenCounter = 1; tokenCounter < tokensLength; tokenCounter++) {
                previousToken = tokens[tokenCounter - 1];
                currentToken = tokens[tokenCounter];
                if (previousToken.value === ')' && currentToken.value === ',' || currentToken.value === ')' &&
                    tokenCounter === tokensLength - 1) {
                    if (tokenCounter === tokensLength - 1) {
                        currentTokens.push(currentToken);
                    } else {
                        if (EquationEngine.Parser._checkIfFunctionParanthesis(tokens.slice(0, tokenCounter))) {
                            currentTokens.push(currentToken);
                            continue;
                        }
                    }
                    solution = EquationEngine.Parser._checkIfPoint(currentTokens, equationData);
                    if (!equationData.isCanBeSolved() || solution === void 0) {
                        return void 0;
                    }
                    equationData.getSolution().push(solution);
                    currentTokens = [];
                } else {
                    currentTokens.push(currentToken);
                }
            }
            if (currentTokens.length > 0 && equationData.getSolution().length > 0) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return void 0;
            }
            if (equationData.getSolution().length > 0) {

                if (latex.indexOf('=') !== -1 || equationData.getInEqualityType() !== 'equal') {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('CannotUnderstandThis');
                    return void 0;
                }
                equationData.setSpecie('point');
            }
        },

        /**

            Function to check whether the latex expression provided is a latex string to plot points.
            If it is plot points latex the function splits the latex for x and y co-ordinate and
            calls parse equation for the individual latexes and finds the solution for it.
            @private
            @method _checkIfPoint
            @param tokens{Array} Array of token objects
            @param equationData{Object} equation data object for the current latex
            @return Void
            @static
        **/
        "_checkIfPoint": function(tokens, equationData) {
            var xCoordinateTokens = [],
                yCoordinateTokens = [],
                isXTokens = true,
                tokenCounter,
                tokenLength = tokens.length,
                commaCounter = 0,
                currentToken,
                equationPivot,
                equationConstants,
                equationUnits,
                xEquationErrorCode,
                xEquationSpecie,
                yEquationErrorCode,
                yEquationSpecie,
                equationErrorData,
                xequationErrorData,
                yequationErrorData,
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                xCordinateEquationData,
                yCordinateEquationData,
                splitIndex = -1,
                constantError = false,
                errorDataCounter,
                errorDataLength,
                currentErrorData,
                customFunction,
                functions,
                supportParamVar,
                solution;
            if (tokens[0].value !== '(' || tokens[tokenLength - 1].value !== ')') {
                return void 0;
            }
            for (tokenCounter = 1; tokenCounter < tokenLength - 1; tokenCounter++) {
                currentToken = tokens[tokenCounter];
                if (currentToken.type === 'func') {
                    if (EquationEngine.Parser._isCommaFunction(currentToken.value)) {
                        commaCounter++;
                    }
                } else if (currentToken.value === ',') {
                    if (commaCounter === 0) {
                        splitIndex = currentToken.index;
                        isXTokens = false;
                        continue;
                    }
                    commaCounter--;
                }
                if (isXTokens) {
                    xCoordinateTokens.push(currentToken);
                } else {
                    yCoordinateTokens.push(currentToken);
                }
            }
            if (!isXTokens) {
                xCordinateEquationData = new EquationEngine.EquationData();
                yCordinateEquationData = new EquationEngine.EquationData();
                xCordinateEquationData.setLatex(equationData.getLeftExpression().expression.substring(tokens[0].index + 1,
                    splitIndex), true);
                equationPivot = equationData.getPivot();
                if (equationPivot !== null) {
                    yCordinateEquationData.setPivot(equationPivot);
                    xCordinateEquationData.setPivot(equationPivot);
                }

                equationConstants = equationData.getConstants();
                yCordinateEquationData.setConstants(equationConstants, true);
                xCordinateEquationData.setConstants(equationConstants, true);

                customFunction = equationData.getCustomFunctions();
                functions = equationData.getFunctions();
                supportParamVar = equationData.getSupportedParamVar();
                yCordinateEquationData.setCustomFunctions(customFunction);
                yCordinateEquationData.setFunctions(functions);
                yCordinateEquationData.setSupportedParamVar(supportParamVar);
                xCordinateEquationData.setCustomFunctions(customFunction);
                xCordinateEquationData.setFunctions(functions);
                xCordinateEquationData.setSupportedParamVar(supportParamVar);

                equationUnits = equationData.getUnits();
                yCordinateEquationData.setUnits(equationUnits, true);
                xCordinateEquationData.setUnits(equationUnits, true);
                EquationEngine.Parser.parseEquationToGetTokens(xCordinateEquationData);
                if (!xCordinateEquationData.isCanBeSolved()) {
                    return void 0;
                }
                if (xCordinateEquationData.getSpecie() !== 'number' && xCordinateEquationData.getSpecie() !== 'point') {
                    EquationEngine.Parser.processTokensWithRules(xCordinateEquationData);
                    if (!xCordinateEquationData.isCanBeSolved()) {
                        return void 0;
                    }
                    EquationEngine.Parser.generateTreeFromRules(xCordinateEquationData);
                }

                xEquationSpecie = xCordinateEquationData.getSpecie();
                xEquationErrorCode = xCordinateEquationData.getErrorCode();

                if (xEquationSpecie === 'number' || xEquationErrorCode === 'ConstantDeclaration' ||
                    xEquationSpecie === 'expression') {
                    if (xEquationErrorCode === 'ConstantDeclaration') {
                        constantError = true;
                    }
                    yCordinateEquationData.setLatex(equationData.getLeftExpression()
                        .expression.substring(splitIndex + 1, tokens[tokenLength - 1].index), true);
                    EquationEngine.Parser.parseEquationToGetTokens(yCordinateEquationData);
                    if (!yCordinateEquationData.isCanBeSolved()) {
                        return void 0;
                    }
                    if (yCordinateEquationData.getSpecie() !== 'number' && yCordinateEquationData.getSpecie() !== 'point') {
                        EquationEngine.Parser.processTokensWithRules(yCordinateEquationData);
                        if (!yCordinateEquationData.isCanBeSolved()) {
                            return void 0;
                        }
                        EquationEngine.Parser.generateTreeFromRules(yCordinateEquationData);
                    }

                    yEquationSpecie = yCordinateEquationData.getSpecie();
                    if (yEquationSpecie === 'number' || yEquationSpecie === 'expression') {
                        solution = [xCordinateEquationData.getSolution(), yCordinateEquationData.getSolution()];

                        equationData.setAccText('Point of ' + xCordinateEquationData.getSolution() + ' and ' + yCordinateEquationData.getSolution());
                        $('#accessibility-display').html('The Accessibility string is ' + equationData.getAccText());
                    } else {
                        yEquationErrorCode = yCordinateEquationData.getErrorCode();
                        if (yEquationErrorCode === 'ConstantDeclaration') {
                            constantError = true;
                        } else {
                            equationData.setCanBeSolved(false);
                            equationData.setErrorCode('CannotUnderstandThis');
                        }
                    }
                } else {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('CannotUnderstandThis');
                }
                if (constantError) {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('ConstantDeclaration');
                    equationData.setErrorData([]);
                    equationErrorData = equationData.getErrorData();
                    xequationErrorData = xCordinateEquationData.getErrorData();
                    if (xequationErrorData !== null) {
                        errorDataCounter = 0;
                        errorDataLength = xequationErrorData.length;
                        for (errorDataCounter; errorDataCounter < errorDataLength; errorDataCounter++) {
                            currentErrorData = xequationErrorData[errorDataCounter];
                            if (equationErrorData.indexOf(currentErrorData) === -1) {
                                equationErrorData.push(currentErrorData);
                            }
                        }
                    }
                    yequationErrorData = yCordinateEquationData.getErrorData();
                    if (yequationErrorData !== null) {
                        errorDataCounter = 0;
                        errorDataLength = yequationErrorData.length;
                        for (errorDataCounter; errorDataCounter < errorDataLength; errorDataCounter++) {
                            currentErrorData = yequationErrorData[errorDataCounter];
                            if (equationErrorData.indexOf(currentErrorData) === -1) {
                                equationErrorData.push(currentErrorData);
                            }
                        }
                    }
                }
            }
            return solution;
        },

        /**
        Takes expression object and generates tokens that will be later used to parse the expression.
        These tokens are added as a property of the expression itself.
        @private
        @method _parseExpression
        @param  expression{Object}
        @param equationData{Object} The equation data model object
        @return Void
        @static
        **/
        "_parseExpression": function(expression, equationData) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                tokens;
            tokens = EquationEngine.Parser._generateTokens(expression, equationData);
            if (!equationData.isCanBeSolved()) {
                return void 0;
            }
            tokens = EquationEngine.Parser._processNegativeTokens(tokens, equationData, expression.equationParameters);
            if (tokens.length < 1) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return void 0;
            }
            EquationEngine.Parser._processPointEquation(tokens, equationData);
            if (!equationData.isCanBeSolved() || equationData.getSpecie() === 'point') {
                return void 0;
            }

            $('#left-column-container').width($('#button-container').width() + $('#equation').width() + $('.mathquill-editable').width() + 50);
            expression.tokens = tokens;
        },

        "_isFunctionDefinition": function(tokens, latex) {
            return latex.indexOf('=') !== -1 && tokens.length === 4 && tokens[0].type === 'const' &&
                tokens[0].sign === '+' && tokens[2].sign === '+' && tokens[1].value === '(' &&
                (tokens[2].type === 'const' || tokens[2].type === 'var') && tokens[3].value === ')';
        },
        "_isStandardConstant": function(constant) {
            return ['\\pi', 'e'].indexOf(constant) > -1;
        },

        "postProcessTokens": function(expression, equationData) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                tokens = expression.tokens;
            if (!tokens) {
                tokens = [];
            }
            tokens = EquationEngine.Parser._processFunctionPowers(tokens);
            //add cdot between expressions like 'abxy' to make them 'a.b.x.y'
            tokens = EquationEngine.Parser._addInvisibleCdotToTokens(tokens, equationData);
            //adjust powers for postfix operators such as ^ and !
            EquationEngine.Parser._adjustPostFixOperatorPowers(tokens);
            $('#left-column-container').width($('#button-container').width() + $('#equation').width() + $('.mathquill-editable').width() + 50);
            expression.tokens = tokens;
        },

        "_NEGATIVE_CASE_TYPES": {
            "NONE": 0,
            "SINGLE": 1,
            "DOUBLE": 2,
            "PLUS_SINGLE": 3,
            "NEGATIVE": 4
        },

        "_processNegativeTokens": function(tokens, equationData, equationParameters) {
            var returnTokens = [],
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                tokenCounter,
                negativeNumberRegex = /(\(|\[|\{|\+|\\cdot|,|<|>|\\le|\\ge)/,
                totalTokens = tokens.length,
                currentToken,
                plusToken,
                negativeCaseType = EquationEngine.Parser._NEGATIVE_CASE_TYPES.NONE,
                previousToken = null;
            for (tokenCounter = 0; tokenCounter < totalTokens; tokenCounter++) {
                currentToken = tokens[tokenCounter];
                if (currentToken.value === '-') {
                    if (previousToken !== null) {
                        if (negativeCaseType === EquationEngine.Parser._NEGATIVE_CASE_TYPES.NONE) {
                            if (previousToken.value === '+') {
                                negativeCaseType = EquationEngine.Parser._NEGATIVE_CASE_TYPES.PLUS_SINGLE;
                            } else if (previousToken !== null && previousToken.value.match(negativeNumberRegex) !== null) {
                                negativeCaseType = EquationEngine.Parser._NEGATIVE_CASE_TYPES.NEGATIVE;
                            } else {
                                if (equationParameters !== null) {
                                    equationParameters.operatorsList.push(currentToken.value);
                                }
                                negativeCaseType = EquationEngine.Parser._NEGATIVE_CASE_TYPES.SINGLE;
                                plusToken = EquationEngine.Parser._getFactoryToken();
                                plusToken.value = '+';
                                plusToken.isValid = true;
                                plusToken.type = 'opr';
                                plusToken.sign = '+';
                                plusToken.negativeCaseType = EquationEngine.Parser._NEGATIVE_CASE_TYPES.NONE;
                                returnTokens.push(plusToken);
                            }
                        } else {
                            negativeCaseType = EquationEngine.Parser._NEGATIVE_CASE_TYPES.DOUBLE;
                        }
                    } else {
                        negativeCaseType = EquationEngine.Parser._NEGATIVE_CASE_TYPES.NEGATIVE;
                    }
                } else {
                    if (equationParameters !== null) {
                        switch (currentToken.type) {
                            case 'var':
                                if (negativeCaseType !== EquationEngine.Parser._NEGATIVE_CASE_TYPES.NONE &&
                                    (negativeCaseType === EquationEngine.Parser._NEGATIVE_CASE_TYPES.DOUBLE ||
                                        negativeCaseType === EquationEngine.Parser._NEGATIVE_CASE_TYPES.PLUS_SINGLE ||
                                        negativeCaseType === EquationEngine.Parser._NEGATIVE_CASE_TYPES.NEGATIVE)) {
                                    equationParameters.variablesList.push('-' + currentToken.value);
                                } else {
                                    equationParameters.variablesList.push(currentToken.value);
                                }
                                break;
                            case 'const':
                                if (currentToken.value !== equationData.getPivot()) {
                                    if (negativeCaseType !== EquationEngine.Parser._NEGATIVE_CASE_TYPES.NONE &&
                                        (negativeCaseType === EquationEngine.Parser._NEGATIVE_CASE_TYPES.DOUBLE ||
                                            negativeCaseType === EquationEngine.Parser._NEGATIVE_CASE_TYPES.PLUS_SINGLE ||
                                            negativeCaseType === EquationEngine.Parser._NEGATIVE_CASE_TYPES.NEGATIVE)) {
                                        equationParameters.constantsList.push('-' + currentToken.value);
                                    } else {
                                        equationParameters.constantsList.push(currentToken.value);
                                    }
                                }
                                break;
                            case 'digit':
                                if (negativeCaseType !== EquationEngine.Parser._NEGATIVE_CASE_TYPES.NONE &&
                                    (negativeCaseType === EquationEngine.Parser._NEGATIVE_CASE_TYPES.DOUBLE ||
                                        negativeCaseType === EquationEngine.Parser._NEGATIVE_CASE_TYPES.PLUS_SINGLE ||
                                        negativeCaseType === EquationEngine.Parser._NEGATIVE_CASE_TYPES.NEGATIVE)) {
                                    equationParameters.digitsList.push('-' + currentToken.value);
                                } else {
                                    equationParameters.digitsList.push(currentToken.value);
                                }
                                break;
                            case 'opr':
                                equationParameters.operatorsList.push(currentToken.value);
                                break;
                            case 'func':
                                if (currentToken.value === '\\customFunc') {
                                    equationParameters.functionsList.push(currentToken.name);
                                } else {
                                    equationParameters.functionsList.push(currentToken.value);
                                }
                                break;
                        }
                    }
                    returnTokens.push(currentToken);
                    currentToken.negativeCaseType = negativeCaseType;
                    if (negativeCaseType !== EquationEngine.Parser._NEGATIVE_CASE_TYPES.NONE &&
                        negativeCaseType !== EquationEngine.Parser._NEGATIVE_CASE_TYPES.DOUBLE) {
                        if (currentToken.sign === '+') {
                            currentToken.sign = '-';
                        } else {
                            currentToken.sign = '+';
                        }
                    }
                    negativeCaseType = EquationEngine.Parser._NEGATIVE_CASE_TYPES.NONE;
                }
                previousToken = currentToken;
            }
            return returnTokens;
        },

        /**

        Manipulation for the power of the postfix operators such as ^, \\cdot and !. This is done for cases like -x^2. In this case if x gets -ve sign then it will be (-x)^2 which is +x^2  thus the sign is assigned to ^ operator.

        @private
        @method _adjustPostFixOperatorPowers
        @param  tokens{Array}
        @return Void
        @static
        **/
        "_adjustPostFixOperatorPowers": function(tokens) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                i,
                j,
                currentToken,
                arrClosingBracketStack,
                currentLeftSideToken,
                watchTheBracket,
                postFixOperators = ['^', '!', '\\%'];
            for (i = 0; i < tokens.length; i++) {
                currentToken = tokens[i];
                arrClosingBracketStack = [];
                //not stealing signs for cdot as it doesnt make a difference...
                if (postFixOperators.indexOf(currentToken.value) !== -1) {
                    if (i === 0) {
                        //this is an error condition
                        continue;
                    }

                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Checking for power sign at ' + i, []);

                    for (j = i - 1; j >= 0; j--) {
                        currentLeftSideToken = tokens[j];

                        if (currentLeftSideToken.type === "delim") {
                            if (arrClosingBracketStack.length === 0) {
                                watchTheBracket = true;
                            }

                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common,
                                'Recording bracket ' + currentLeftSideToken.value, []);
                            EquationEngine.ParsingProcedures.recordBracket(arrClosingBracketStack, currentLeftSideToken.value);


                            //this means all brackets are closed and its time to steal the sign;
                            if (watchTheBracket && arrClosingBracketStack.length === 0) {
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common,
                                    'stealing the sign of ' + currentLeftSideToken, []);
                                currentToken.sign = currentLeftSideToken.sign;
                                currentLeftSideToken.sign = "+";
                                break;
                            }
                            continue;
                        }

                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common,
                            'Current left token is ' + currentLeftSideToken + ' stack is ' + arrClosingBracketStack, []);
                        if (arrClosingBracketStack.length > 0) {
                            continue;
                        }

                        if (['var', 'const', 'digit'].indexOf(currentLeftSideToken.type) !== -1) {
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common,
                                'terminal found ignoring the sign ' + currentLeftSideToken, []);
                            currentToken.sign = currentLeftSideToken.sign;
                            currentToken.negativeCaseType = currentLeftSideToken.negativeCaseType;
                            currentLeftSideToken.sign = "+";
                            currentLeftSideToken.negativeCaseType = 0;
                            break;
                        }

                    }
                }
            }
        },


        "_printTokens": function(expression, name) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models;

            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '******************************************************************', []);
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, name + ' All Tokens Are ' + expression.tokens, []);
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '******************************************************************', []);
        },


        /**
        Function to add \cdot operator where a multiplication operator is assumed and not written

        @private
        @method _addInvisibleCdotToTokens
        @param  tokens{Array} array of objects
        @param equationData{Object} The equation data model object
        @return Void
        @static
        **/
        "_addInvisibleCdotToTokens": function(tokens, equationData) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                invisibleCdotTokenTypeCases = ['var', 'const', 'func'],
                invisibleCdotTokenValueCases = ['('],
                cdotAddCases = {
                    "var": {
                        "tokenTypes": ['var', 'const', 'digit'],
                        "tokenValues": [')', '!', '}']
                    },
                    "const": {
                        "tokenTypes": ['var', 'const', 'digit'],
                        "tokenValues": ['}', ')', '!', '\\%']
                    },
                    "func": {
                        "tokenTypes": ['var', 'const', 'digit'],
                        "tokenValues": [')', '!', '}', '\\%']
                    },
                    "(": {
                        "tokenTypes": ['var', 'const', 'digit'],
                        "tokenValues": [')', '!', '}']
                    }
                },
                tokenCounter = 0,
                previousToken,
                noDecimalDigitRegex = /^([0-9]+[\.])$/,
                currentToken,
                isTokenTypeCase,
                isTokenValueCase,
                tokensBeforeCdot,
                tokensAfterCdot,
                currentCase,
                isFractionBrace,
                cdotToken = EquationEngine.Parser._getFactoryToken();

            if (equationData.getSpecie() === 'function') {
                cdotAddCases['('].tokenTypes = ['var', 'digit'];
            }
            cdotToken.type = 'opr';
            cdotToken.value = '\\cdot';
            cdotToken.sign = '+';
            cdotToken.isValid = true;
            // The tokens length changes inside the for loop hence we have to calculate the length of the array on each iteration
            for (tokenCounter = 1; tokenCounter < tokens.length; tokenCounter++) {
                previousToken = tokens[tokenCounter - 1];
                currentToken = tokens[tokenCounter];
                isTokenTypeCase = invisibleCdotTokenTypeCases.indexOf(currentToken.type) !== -1;
                isTokenValueCase = invisibleCdotTokenValueCases.indexOf(currentToken.value) !== -1;
                if (isTokenTypeCase || isTokenValueCase) {
                    currentCase = isTokenTypeCase ? currentToken.type : currentToken.value;
                    if (currentCase === 'func' && currentToken.value === '\\mixedfrac') {
                        continue;
                    }
                    if (cdotAddCases[currentCase].tokenTypes.indexOf(previousToken.type) !== -1 ||
                        cdotAddCases[currentCase].tokenValues.indexOf(previousToken.value) !== -1) {
                        // this is done to solve case 0.x as cdot was appended between 0. and x
                        if (previousToken.type === 'digit' && previousToken.value.match(noDecimalDigitRegex) !== null) {
                            continue;
                        }
                        //condition for braces and bracket cdot added only when brace is of fraction
                        if (currentToken.value === '(' && previousToken.value === '}') {
                            isFractionBrace = EquationEngine.Parser._isFractionBrace(tokens.slice(0, tokenCounter));
                            if (!isFractionBrace || EquationEngine.Parser._checkLogToBasePowerCase(tokens.slice(0, tokenCounter)) !== null) {
                                continue;
                            }
                        }
                        tokensBeforeCdot = tokens.slice(0, tokenCounter);
                        tokensBeforeCdot.push(cdotToken);
                        tokensAfterCdot = tokens.slice(tokenCounter, tokens.length);
                        tokens = tokensBeforeCdot.concat(tokensAfterCdot);
                        tokenCounter++;
                    }
                }
            }
            return tokens;
        },

        /**
            Checks if the brace occurred in tokens is of fraction or not
            @private
            @method _isFractionBrace
            @param tokens{Array} array of token objects
            @return {Boolean} true if the brace was of a fraction
            @static
        **/
        "_isFractionBrace": function(tokens) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                tokenCounter,
                tokensLength = tokens.length,
                bracketCounter = 0,
                currentToken;
            for (tokenCounter = tokensLength - 1; tokenCounter >= 0; tokenCounter--) {
                currentToken = tokens[tokenCounter];
                if (EquationEngine.ParsingProcedures._isOpeningBracket(currentToken.value)) {
                    bracketCounter++;
                } else if (EquationEngine.ParsingProcedures._isClosingBracket(currentToken.value)) {
                    bracketCounter--;
                } else {
                    if (bracketCounter === 0) {
                        if (currentToken.value === '\\frac' || currentToken.value === '\\sqrt') {
                            return true;
                        }
                        if (currentToken.value === '\\log_') {
                            return false;
                        }
                    }
                }
            }
            return false;
        },

        "_processFunctionVariablePreference": function(freeVarPowers, equationData) {
            if (typeof freeVarPowers === 'undefined') {
                return void 0;
            }
            var freeVar,
                functionVar,
                freeVar2,
                functionVariablePreferences = equationData.getPossibleFunctionVariablesPreference(),
                freeVarCounter1,
                freeVarCounter2,
                freeVarPowersLength = freeVarPowers.length;
            for (freeVarCounter1 = 0; freeVarCounter1 < freeVarPowersLength; freeVarCounter1++) {
                freeVar = freeVarPowers[freeVarCounter1];
                if (freeVar.constantFound) {
                    for (freeVarCounter2 = 0; freeVarCounter2 < freeVarPowersLength; freeVarCounter2++) {
                        freeVar2 = freeVarPowers[freeVarCounter2];
                        if (freeVar === freeVar2) {
                            continue;
                        }
                        for (functionVar in freeVar2) {
                            if (functionVar === 'constantFound') {
                                continue;
                            }
                            if (freeVar2[functionVar] !== 0 && freeVar2[functionVar] !== 'c') {
                                functionVariablePreferences[functionVar] |= 1 >> 0;
                            }
                        }
                    }
                }
            }
        },

        /**
        Function to get calculate maximum power of variables. If variable is in denominator of fraction or
        if it is in the raised to part of raised to function or it is any other functions then the max power of variable is marked as complicated `c`.

        @private
        @method _getFreeVarPower
        @param rootNode{Object} The tree root node.
        @param freeVariables{Object} Variables present in the equation.
        @return {Object} object in the form `variable:power`
        @static
        **/
        "_getFreeVarPower": function(rootNode, freeVariables, equationData) {

            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                returnFreeVars = {},
                freeVarPowers,
                childNodeCounter,
                childNodesLength,
                freeVarObjectCounter,
                freeVarObjectsLength,
                freeVars,
                variable,
                isRaisedToComplicated,
                returnObjectsCounter,
                returnObjectsLength,
                currentfreeVarObject,
                currentReturnedFreeVarObject,
                setValueTo,
                nodePower;
            if (!rootNode.isTerminal) {
                // if not terminal node then we call the same function recursively with child nodes
                freeVarPowers = []; // variable to store all the results returned from child nodes
                childNodeCounter = 0;
                childNodesLength = rootNode.params.length;
                for (childNodeCounter; childNodeCounter < childNodesLength; childNodeCounter++) {
                    currentReturnedFreeVarObject = EquationEngine.Parser._getFreeVarPower(rootNode.params[childNodeCounter], freeVariables, equationData);
                    freeVarPowers.push(currentReturnedFreeVarObject);
                    if (currentReturnedFreeVarObject.constantFound) {
                        returnFreeVars.constantFound = true;
                    }
                }

                // Once all the results for the child nodes are calculated further processing is done according to the function or operator type
                switch (rootNode.name) {
                    case '+':
                        // This is the case where we just check the max power between the child and assign it to the variable
                        freeVarObjectCounter = 0;
                        freeVarObjectsLength = freeVarPowers.length;
                        for (freeVarObjectCounter; freeVarObjectCounter < freeVarObjectsLength; freeVarObjectCounter++) {
                            freeVars = freeVarPowers[freeVarObjectCounter];
                            variable = null;
                            for (variable in freeVars) {
                                if (variable in returnFreeVars) {
                                    if (variable !== 'constantFound' && returnFreeVars[variable] !== 'c' &&
                                        (freeVars[variable] === 'c' || returnFreeVars[variable] < freeVars[variable])) {
                                        returnFreeVars[variable] = freeVars[variable];
                                    }
                                } else {
                                    returnFreeVars[variable] = freeVars[variable];
                                }
                            }
                        }
                        break;
                    case '\\cdot':
                        //this case handles when a variable is multiplied with itself so their powers have to be added.
                        freeVarObjectCounter = 0;
                        freeVarObjectsLength = freeVarPowers.length;
                        EquationEngine.Parser._processFunctionVariablePreference(freeVarPowers, equationData);
                        for (freeVarObjectCounter; freeVarObjectCounter < freeVarObjectsLength; freeVarObjectCounter++) {
                            freeVars = freeVarPowers[freeVarObjectCounter];
                            variable = null;
                            for (variable in freeVars) {
                                if (variable in returnFreeVars) {
                                    if (variable !== 'constantFound' && returnFreeVars[variable] !== 'c') {
                                        if (freeVars[variable] === 'c') {
                                            returnFreeVars[variable] = freeVars[variable];
                                        } else {
                                            returnFreeVars[variable] += freeVars[variable];
                                        }
                                    }
                                } else {
                                    returnFreeVars[variable] = freeVars[variable];
                                }
                            }
                        }
                        break;
                    case '^':
                    case '\\frac':
                        // We check if the second child has returned any power value for variables. If yes then that variable is marked as complicated
                        variable = null;
                        for (variable in freeVarPowers[1]) {
                            if (variable !== 'constantFound') {
                                if (freeVarPowers[1][variable] !== 0) {
                                    returnFreeVars[variable] = 'c';
                                } else {
                                    returnFreeVars[variable] = freeVarPowers[0][variable];
                                }
                            }
                        }
                        isRaisedToComplicated = false;
                        variable = null;
                        for (variable in returnFreeVars) {
                            if (variable !== 'constantFound' &&
                                (returnFreeVars[variable] === 'c' || rootNode.name === '^' && returnFreeVars[variable] < 0)) {
                                isRaisedToComplicated = true;
                            }
                        }
                        // if the current case is of power operator then we check the mediate right child terminal for the digit value
                        if (rootNode.name === '^') {
                            variable = null;

                            for (variable in freeVarPowers[0]) {
                                if (variable !== 'constantFound') {
                                    if (isRaisedToComplicated && freeVarPowers[1][variable] > 0) {
                                        returnFreeVars[variable] = 'c';
                                    } else {
                                        if (freeVarPowers[0][variable] > 0) {
                                            if (rootNode.params[1].isTerminal && rootNode.params[1].type === 'digit') {
                                                nodePower = Number(EquationEngine.TreeProcedures._getValueFromParam(rootNode.params[1]));
                                                returnFreeVars[variable] = nodePower < 0 ? 'c' : returnFreeVars[variable] === 0 ? nodePower : returnFreeVars[variable] * nodePower;
                                            } else {
                                                returnFreeVars[variable] = 'c';
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            variable = null;
                            for (variable in freeVarPowers[0]) {
                                if (variable !== 'constantFound' && returnFreeVars[variable] !== 'c') {
                                    returnFreeVars[variable] = freeVarPowers[0][variable];
                                }
                            }
                        }
                        break;
                    default:
                        returnObjectsCounter = 0;
                        returnObjectsLength = freeVarPowers.length;
                        for (returnObjectsCounter; returnObjectsCounter < returnObjectsLength; returnObjectsCounter++) {
                            currentfreeVarObject = freeVarPowers[returnObjectsCounter];
                            variable = null;
                            for (variable in currentfreeVarObject) {
                                if (variable !== 'constantFound') {
                                    if (currentfreeVarObject[variable] > 0 || currentfreeVarObject[variable] === 'c') {
                                        returnFreeVars[variable] = 'c';
                                    } else {
                                        if (returnFreeVars[variable] !== 'c') {
                                            returnFreeVars[variable] = 0;
                                        }
                                    }
                                }
                            }
                        }
                }

            } else {
                // this is the terminal node condition where we check whether it is a variable. If it is a variable we assign power as 1 else 0.
                variable = null;
                // Check if constant is present as a co-effecient of variable. This is used to prioritize the choosing of function variable
                returnFreeVars.constantFound = rootNode.type === 'const';
                for (variable in freeVariables) {
                    setValueTo = 0;
                    if (rootNode.value === variable) {
                        setValueTo = 1;
                    }
                    returnFreeVars[variable] = setValueTo;
                }
            }
            return returnFreeVars;
        },

        /**
        Function to display array objects in a horizontal manner.
        The objects should have to string function to display their content.
        @param containerId: Id of the container div in which the objects will be displayed

        @private
        @method _displayArrayOfObjects
        @param objects {Object}array of objects to be displayed
        @param containerId {String} Container id in which the objects are to be displayed
        @param backgroundColor{String} background color of the boxes in the form `#fff`
        @param fontColor{String} font color of the text in the form `#fff`
        @return Void
        @static
        **/
        "_displayArrayOfObjects": function(objects, containerId, backgroundColor, fontColor) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                $container,
                objectCounter,
                objectsLength,
                currentObject,
                $childObject;
            if (EquationEngine.Parser._deploy) {
                return void 0;
            }
            if (objects !== void 0) {
                if (fontColor === void 0) {
                    fontColor = '#000';
                }
                if (backgroundColor === void 0) {
                    backgroundColor = '#770';
                }
                $container = $('#' + containerId);
                $container.parent().css({
                    "border": '1px solid #000'
                });
                $container.css({
                    "border": '1px solid',
                    "border-color": EquationEngine.Parser._borderColor,
                    "position": 'relative',
                    "overflow-x": 'hidden'
                });
                objectCounter = 0;
                objectsLength = objects.length;
                for (objectCounter; objectCounter < objectsLength; objectCounter++) {
                    currentObject = objects[objectCounter];
                    $childObject = $('<div>' + currentObject + '</div>');
                    $childObject.attr('class', 'tokens');
                    $container.append($childObject);
                }
                $('.tokens').css({
                    "float": 'left',
                    "border": '1px solid #000',
                    "margin": '5px',
                    "padding": '5px',
                    "background-color": backgroundColor,
                    "color": fontColor,
                    "font-weight": 'bold'
                });
            } else {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'The objects provided is undefined', []);
            }
        },
        "_showIntercepts": function(equationData) {
            var $displayDiv = $('#display-intercepts'),
                interceptsArr, counter, length, displaystr, $tempDiv;
            interceptsArr = equationData.getInterceptPoints();
            length = interceptsArr.length;
            for (counter = 0; counter < length; counter++) {
                $tempDiv = $('<div></div>');
                displaystr = 'Point' + (counter + 1) + '<br>';
                displaystr += 'x =' + interceptsArr[counter].x + '<br>';
                displaystr += 'y =' + interceptsArr[counter].y + '<br>';
                $tempDiv.html(displaystr).css({
                    "float": 'left',
                    "border": '1px solid #000',
                    "margin": '5px',
                    "padding": '5px',
                    "background-color": '#770',
                    "color": '#fff',
                    "font-weight": 'bold'
                });
                $displayDiv.append($tempDiv);
            }
        },

        "_checkIfFracHasNonFracChilds": function(root, equationData) {
            if (equationData.getFdFlag() === 'frac') {
                return void 0;
            }
            var childCounter,
                childLength,
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                children;
            if (!root.isTerminal) {
                if (root.name === '\\frac') {
                    children = root.params;
                    childLength = children.length;
                    for (childCounter = 0; childCounter < childLength; childCounter++) {
                        EquationEngine.Parser._checkIfFracHasNonFracChilds(children[childCounter], equationData);
                        if (equationData.getFdFlag() === 'frac') {
                            return void 0;
                        }
                    }
                } else {
                    equationData.setFdFlag('frac');
                }
            }
        },

        "_getAnalysisForFD": function(root) {
            var childCounter,
                EquationEngine = MathUtilities.Components.EquationEngine.Models,
                childLength,
                returnValue, childFlag = 1;
            //return type 1 means ignore, 0 means frac and NaN for decimal
            if (root.isTerminal) {
                if (root.type === 'digit') {
                    if (root.value.toString().indexOf('.') !== -1) {
                        return NaN;
                    }
                    return 1;
                } else if (root.type === 'const') {
                    if (root.value === 'e' || root.value === '\\pi') {
                        return NaN;
                    }
                }
                return 1;
            } else {
                if (EquationEngine.TreeProcedures.isOperator(root.name) || root.name === 'do') {
                    childLength = root.params.length;
                    for (childCounter = 0; childCounter < childLength; childCounter++) {
                        returnValue = EquationEngine.Parser._getAnalysisForFD(root.params[childCounter]);

                        childFlag = returnValue * childFlag;

                        if (isNaN(childFlag)) {
                            return NaN;
                        }
                    }
                    return childFlag;
                }
                if (root.name === '\\frac') {
                    return 0;
                }
                return NaN;
            }
        },

        /**
        Function to show production rules in a pop up window. The function is called on click of `View Rules` button

        @private
        @method _showRules
        @return Void
        @static
        **/


        "_showRules": function() {
            var rulesWindow = window.open('', '', 'width=700,height=700'),
                textArea = $('<textarea>' + $('#rules').text() + '</textarea>');
            textArea.css({
                "width": '600px',
                "height": '600px'
            });
            $(rulesWindow.document.body).append(textArea);
        },



        /**
        * @method printLatex Function to print the Latex expression and display the corresponding tree on the canvas for the different stages.
        * @param rootNode {Object} It provides the root node of the tree.
        * @param stageNumber {Number} It provides the stageNumber of the stage to be formed.
        * @param showTree {Boolean} Specifies whether the tree has to be shown or not.

        **/

        "_printLatex": function(rootNode, stageNumber, showTree) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                stage,
                $stage,
                $headerDiv,
                $inputContainer,
                latexString,
                $stageDiv,
                $treeCanvas,
                args;


            if (EquationEngine.Parser._deploy) {
                return void 0;
            }
            stage = {
                "0": 'Preprocessing',
                "1": 'Token Generation',
                "2": 'Create Production Rules',
                "3": 'Generate Equation Tree',
                "4": 'Simplify',
                "5": 'Find Equation Solvability',
                "6": 'Expand Equation',
                "7": 'Convert to Quadratic Form',
                "8": 'Solve'
            };
            $stage = $('<div></div>');
            $inputContainer = $('#display-outter-container');
            $inputContainer.append($stage);
            $headerDiv = $('<div></div>');
            $headerDiv.attr('id', 'header' + stageNumber).css({
                "font-weight": 'bold'
            }).html(stage[stageNumber]);
            $stage.attr('id', 'stage-number' + stageNumber).append($headerDiv).css({
                "border": '1px solid #000',
                "padding": '10px 5px 5px 10px',
                "margin": '25px 5px 5px'
            });

            latexString = EquationEngine.TreeProcedures._toLatex(rootNode);
            $stageDiv = $('<span></span>');
            $stageDiv.attr('id', 'stage' + stageNumber).css({
                "border": '1px solid',
                "border-color": EquationEngine.Parser._borderColor,
                "margin": '5px',
                "padding": '5px'
            });
            $stage.append($stageDiv);
            $('#stage' + stageNumber).append(latexString).mathquill();

            $stage.append('<br/>');
            if (showTree) {
                $treeCanvas = $('<canvas></canvas>');
                $treeCanvas.attr('id', 'canvas-stage' + stageNumber).css({
                    "border": '1px solid',
                    "border-color": EquationEngine.Parser._borderColor
                });
                $stage.append($treeCanvas);
                args = ['canvas-stage' + stageNumber];
                EquationEngine.Parser._displayTree(rootNode, args);

                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'The latex string is ' + latexString, []);
            }
            return void 0;
        },

        /**
        This function generates production rules from the series of token that represents a latex expression.

        @private
        @method _recursiveDescentParser
        @param equationData{Object} equation backbone model object
        @param tokens{Array} array of tokens
        @param startAtTokenIndex{Integer} location from where the analysis should be started in token array
        @param recursionIndex{Integer} the level of recursive call
        @param lookAhead{Array}
        @param isRange{Boolean} is the function call for range parsing
        @return
        @static
        **/
        "_recursiveDescentParser": function(equationData, tokens, startAtTokenIndex, recursionIndex, lookAhead, isRange) {
            if (!equationData.isCanBeSolved() || tokens.length === 0) {
                return void 0;
            }
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                peekToken = tokens[startAtTokenIndex],
                startedAtIndex = startAtTokenIndex,
                allValidRules = EquationEngine.ParsingProcedures.getPredictionStacksForToken(peekToken, '$%^&', isRange),
                tokenPointer,
                predictionStackPointer,
                predictionStack,
                i,
                j,
                k,
                peekStack,
                isPredictionAccepted,
                acceptedPredictions,
                currentSolution,
                recursiveTermExpandedFlag,
                recursiveSearchResult,
                stackRecursiveFlag,
                removedRecursiveGoal,
                numberOfLookaheadsAdded,
                currentRule,
                validRulesLength,
                upcomingToken;

            if (allValidRules === void 0) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '############################### ERROR ##########################', []);
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'no rules found for E ->' + peekToken.value, []);
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return void 0;
            }
            tokenPointer = startAtTokenIndex;
            predictionStackPointer = 0;
            j = 0;

            acceptedPredictions = [];
            validRulesLength = allValidRules.length;
            //TRACE
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '----------------------Begin recursion ' +
                recursionIndex + '------------------ with lookahead ' + lookAhead, []);
            for (i = 0; i < validRulesLength; i++) {
                currentRule = allValidRules[i];
                currentSolution = [];

                predictionStack = [];

                if (isRange) {
                    EquationEngine.ParsingProcedures.cloneStringStack(EquationEngine.RangeProductionRules.rangeRules[currentRule], predictionStack);
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, 'for ' +
                        currentRule + ' rules are ' + EquationEngine.RangeProductionRules.rangeRules[currentRule], []);
                } else {
                    EquationEngine.ParsingProcedures.cloneStringStack(EquationEngine.Parser._productions.productionRules[currentRule], predictionStack);
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, 'for ' +
                        currentRule + ' rules are ' + EquationEngine.Parser._productions.productionRules[allValidRules[i]], []);
                }
                currentSolution.push(currentRule);

                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[Predict ' +
                    recursionIndex + ']' + ' Level ' + recursionIndex + ' by rule ' + currentRule + ' Processing prediction ' +
                    predictionStack, [EquationEngine.Parser._HSTYLE]);

                tokenPointer = startAtTokenIndex;
                predictionStackPointer = 0;
                isPredictionAccepted = true;
                recursiveTermExpandedFlag = false;
                stackRecursiveFlag = EquationEngine.ParsingProcedures.isStackInfinite(predictionStack);
                if (stackRecursiveFlag &&
                    !EquationEngine.ParsingProcedures.verifyStackWithLookahead(predictionStack, lookAhead)) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[FAIL ' +
                        recursionIndex + ']' + 'Rejecting STACk ' + predictionStack + ' because we cant pursue same GOAL again...', [EquationEngine.Parser._NSTYLE]);
                    continue;
                }

                while (predictionStackPointer < predictionStack.length) {
                    peekStack = EquationEngine.ParsingProcedures.peekInPredictionStack(predictionStack, predictionStackPointer);
                    peekToken = tokens[tokenPointer];

                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, peekToken + ' <> ' +
                        peekStack + ' >> ' + EquationEngine.ParsingProcedures.isTokenSame(peekToken, peekStack), []);
                    if (EquationEngine.ParsingProcedures.isTokenSame(peekToken, peekStack)) {
                        currentSolution.push(peekToken);
                    } else if (EquationEngine.ParsingProcedures.isNonTerminal(peekStack)) {

                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, 'TErminal Node...going in...stack so far ' + currentSolution, []);
                        numberOfLookaheadsAdded = EquationEngine.ParsingProcedures.pushAllLookAheads(lookAhead, predictionStack, predictionStackPointer + 1);

                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[PAUSE ' +
                            recursionIndex + ']', [EquationEngine.Parser._BLUE_STYLE]);

                        recursiveSearchResult = EquationEngine.Parser._recursiveDescentParser(equationData, tokens, tokenPointer, recursionIndex + 1,
                            lookAhead, isRange);

                        if (!equationData.isCanBeSolved()) {
                            return void 0;
                        }
                        for (k = 0; k < numberOfLookaheadsAdded; k++) {
                            lookAhead.pop();
                        }

                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[RESUME ' + recursionIndex + ']' +
                            '>>>>Recursion level ' + recursionIndex + ' resumes with solution ' + recursiveSearchResult, [EquationEngine.Parser._BLUE_STYLE]);

                        if (recursiveSearchResult === void 0) {
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[FAIL ' + recursionIndex + ']' +
                                ' prediction ' + predictionStack + ' is invalid...REJECTING at ' + currentSolution, [EquationEngine.Parser._NSTYLE]);
                            isPredictionAccepted = false;
                            break;
                        }
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, ' recursion will resume from index ' +
                            recursiveSearchResult.tokenPointer, []);
                        tokenPointer = recursiveSearchResult.tokenPointer;

                        for (j = 0; j < recursiveSearchResult.length; j++) {
                            currentSolution.push(recursiveSearchResult[j]);
                        }
                    } else {
                        if (stackRecursiveFlag && recursiveTermExpandedFlag &&
                            EquationEngine.ParsingProcedures.isTermInfinite(predictionStack[predictionStackPointer])) {
                            removedRecursiveGoal = predictionStack[predictionStackPointer];

                            if (predictionStackPointer >= predictionStack.length) {
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, 'Finished chasing recursive term ' +
                                    removedRecursiveGoal + ' from total stack :' + predictionStack, []);
                                recursiveTermExpandedFlag = false;
                            } else {
                                isPredictionAccepted = true;
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[ACCEPT ' + recursionIndex + ']' +
                                    'Stack matched so far...dumping ALL infinite term and breaking: ' + predictionStack + " recursionIndex :: " +
                                    recursionIndex, [EquationEngine.Parser._YSTYLE]);
                            }

                        } else {
                            isPredictionAccepted = false;
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[FAIL ' + recursionIndex + ']' +
                                ' STack match failed...DISCARDING stack!!! ' + predictionStack, [EquationEngine.Parser._NSTYLE]);
                            break;
                        }
                    }

                    predictionStackPointer++;
                    tokenPointer++;
                    if (stackRecursiveFlag && EquationEngine.ParsingProcedures.isTermInfinite(predictionStack[predictionStackPointer])) {
                        upcomingToken = tokens[tokenPointer];
                        //check if next token matches with the peek from prediction stack. if it doesn't match then liberate this recursive goal

                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, 'trying to match peek from ' +
                            predictionStack[predictionStackPointer] + ' >> ' + EquationEngine.ParsingProcedures._getPeekValue(predictionStack[predictionStackPointer]) +
                            ' with next token ' + upcomingToken, []);

                        if (upcomingToken !== void 0) {
                            if (EquationEngine.ParsingProcedures._getPeekValue(predictionStack[predictionStackPointer]) !== tokens[tokenPointer].value) {
                                if (!recursiveTermExpandedFlag) {
                                    isPredictionAccepted = false;
                                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[FAIL ' + recursionIndex + ']' +
                                        ' ' + predictionStack[predictionStackPointer] + ' is NOT used...DISCARDING stack!!! ' + predictionStack, [EquationEngine.Parser._NSTYLE]);
                                    break;
                                }
                                if (predictionStackPointer + 1 >= predictionStack.length) {
                                    //Solution to fi operator is followed a another operator
                                    isPredictionAccepted = EquationEngine.ParsingProcedures.checkWithLookAhead(tokens[tokenPointer], lookAhead);
                                    break;
                                }
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, 'match FAILED so moving on to ' +
                                    predictionStack[predictionStackPointer + 1], []);
                                recursiveTermExpandedFlag = true;
                                EquationEngine.ParsingProcedures.expandRecursiveStack(predictionStack, predictionStackPointer + 1);
                                predictionStackPointer++;
                            } else {
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, 'match success expanding ' +
                                    predictionStack[predictionStackPointer], []);
                                recursiveTermExpandedFlag = true;
                                EquationEngine.ParsingProcedures.expandRecursiveStack(predictionStack, predictionStackPointer);
                            }
                        }
                    }

                    if (tokenPointer >= tokens.length && predictionStackPointer < predictionStack.length) {
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Checking when tokens are over and stack is not: recursive is ' + stackRecursiveFlag, []);
                        if (stackRecursiveFlag) {
                            if (recursiveTermExpandedFlag && predictionStackPointer === predictionStack.length - 1) {
                                //check if the stack is recursive and term we have in the end is also recursive, then that means we can safely assume that we can dump the recursive term
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[ACCEPT ' +
                                    recursionIndex + ']' + ' prediction accepted ' + predictionStack, [EquationEngine.Parser._YSTYLE]);
                                isPredictionAccepted = true;
                            } else {
                                isPredictionAccepted = false;
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[FAIL ' +
                                    recursionIndex + ']' + 'Tokens are finished but there are unexpanded recursive terms...rejecting the prediction ' + predictionStack + ' at index ' + predictionStackPointer, [EquationEngine.Parser._NSTYLE]);
                                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[FAIL]' +
                                    'There was an error in syntax of equation. We could not find ' + predictionStack[predictionStackPointer], [EquationEngine.Parser._NSTYLE]);
                            }

                        } else {
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[FAIL ' + recursionIndex + ']' +
                                'Tokens are finished when prediction stack is NOT...REJECTING the prediction', [EquationEngine.Parser._NSTYLE]);
                            isPredictionAccepted = false;
                        }
                        break;

                    }
                    if (predictionStackPointer >= predictionStack.length && tokenPointer < tokens.length) {
                        EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, 'Prediction Stack over: Checking with lookahead ' +
                            tokens[tokenPointer] + ' <> ' + lookAhead, []);
                        /*
                         * this logic checks if the lookahead symbol and next token are the same
                         *
                         * problems in this logic
                         *
                         * suppose we are processing (a+b)^2
                         * stack will be var(+E)+
                         * when u are at E your lookahead is ')' and stack peek will be (+E)
                         *
                         * possible solutions:
                         * 1.Reject infinite series when lookahead is ')' ie closing brackets ')','}'
                         * 2. make lookahead a stack, which will be checked if the terms on top are recursive, they will be ignored and next will be checked
                         *
                         */
                        if (EquationEngine.ParsingProcedures.checkWithLookAhead(tokens[tokenPointer], lookAhead)) {
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[ACCEPT ' + recursionIndex + ']' +
                                'Prediction stack finished and lookahead matches...ACCEPTING the prediction by rule ' + allValidRules[i], [EquationEngine.Parser._YSTYLE]);
                            isPredictionAccepted = true;
                        } else {
                            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '%c[FAIL ' + recursionIndex + ']' +
                                'Prediction stack finished and lookahead doesnt match...REJECTING the prediction by rule ' + allValidRules[i], [EquationEngine.Parser._NSTYLE]);
                            isPredictionAccepted = false;
                        }
                        break;
                    }
                }

                if (isPredictionAccepted) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, 'checking if the accepted solution is final :: ' +
                        EquationEngine.ParsingProcedures.checkWithLookAhead(peekToken, lookAhead), []);
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, 'checking if the accepted solution is final :: ' +
                        EquationEngine.ParsingProcedures.checkWithLookAhead(peekToken, lookAhead), []);

                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, 'Prediction accepted is ' + currentSolution, []);
                    currentSolution.tokenPointer = tokenPointer - 1;
                    acceptedPredictions.push(currentSolution);
                    break;
                }
            }
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, acceptedPredictions.length + ' Solutions found ....', []);
            EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.rules, '----------------------End recursion ' + recursionIndex +
                '------------------');

            if (acceptedPredictions.length > 1) {
                EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, '=================================ACCEPTED PREDICTIONS ARE MORE THAN ONE!!!!==================================after ' + startedAtIndex, []);

                for (k = 0; k < acceptedPredictions.length; k++) {
                    EquationEngine.Parser._showConsole(EquationEngine.Parser._debugFlag.common, 'Prediction is ' + acceptedPredictions[k], []);
                }
            } else if (acceptedPredictions.length === 1) {
                return acceptedPredictions[0];
            }
        },

        /**
        Display the equation tree for debugging purposes


        @method _displayTree
        @private
        @param rootNode{Object} Root node of the tree
        @param args{String|Array} canvas id or array of canvas ids
        @return Void
        @static
        **/
        "_displayTree": function(rootNode, args) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                containerWidth,
                canvasArray,
                i,
                canvasCounter = 0,
                totalCanvas,
                paperArray = [],
                element = null;
            /*width for outer container of canvas*/
            containerWidth = window.innerWidth - ($('#button-container').width() + $('#equation').width() + $('.mathquill-editable').width() + 100);
            $('#canvasContainer').width(containerWidth);

            canvasArray = [];
            if (typeof args === 'object') {
                canvasArray = args;
            } else {
                for (i = 1; i < arguments.length; i++) {
                    canvasArray[i - 1] = arguments[i];
                }
            }
            totalCanvas = canvasArray.length;
            /*set different canvases for paper object and call nodeDisplay function for that element*/
            for (; canvasCounter < totalCanvas; canvasCounter++) {
                if (typeof canvasArray[canvasCounter] === 'string') {
                    paperArray[canvasCounter] = new paper.PaperScope();
                    element = document.getElementById(canvasArray[canvasCounter]);
                    paperArray[canvasCounter].setup(element);
                    EquationEngine.Parser._nodeDisplay(rootNode, true, paperArray[canvasCounter], element);
                }
            }
        },

        /**
        Function to set up canvas also to check is given obj is parent node or not and call subnodeDisplay

        @method _nodeDisplay
        @private
        @param nodeObj{Object} tree node object to be displayed
        @param isFirstChild{Boolean} is root node of tree
        @param paperCanvasObject{Object} canvas element object
        @param canvasName {String} The id of the canvas on which the tree has to be drawn
        @return Void
        @static
        **/

        "_nodeDisplay": function(nodeObj, isFirstChild, paperCanvasObject, canvasName) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                subnode = 0,
                parentLength = 0,
                maxTextLength = EquationEngine.Parser._getTextWidth($('<div></div>').html(nodeObj.toString()), true),
                maxNodeLevel = [0],
                firstNodeName = 0,
                i,
                nodeCountObject,
                textLength,
                childs,
                canvasWidth,
                canvasHeight;
            if (isFirstChild) {

                /*array of node object*/
                nodeCountObject = [];


                if (!nodeObj.isTerminal) {
                    parentLength = nodeObj.params.length;
                }

                EquationEngine.Parser._nodeCounter(nodeObj, firstNodeName.toString(), nodeCountObject, maxNodeLevel);
                EquationEngine.Parser._totalNodeCounter(nodeCountObject);
                textLength = null;

                for (i = 0; i < parentLength; i++) {
                    textLength = EquationEngine.Parser._getTextWidth($('<div></div>').html(nodeObj.params[i].toString()), true);
                    if (maxTextLength < textLength) {
                        maxTextLength = textLength;
                    }
                }


                /*count childs node level(vertical)*/
                childs = 1;
                for (i = 0; i < nodeCountObject.length; i++) {
                    if (nodeCountObject[i].name.length === 2) {
                        childs += nodeCountObject[i].totalNode;
                    }
                }

                /*set canvas width and height*/
                canvasWidth = maxNodeLevel[0] * (100 + maxTextLength) + 100;
                canvasHeight = childs * 30;

                $(canvasName).height(canvasHeight).width(canvasWidth);

                paper = paperCanvasObject;
                paper.view.viewSize = [canvasWidth, canvasHeight];

                EquationEngine.Parser._textOnCanvas(nodeObj.toString(), subnode.toString(), maxTextLength, nodeCountObject);

                /*function Draw node content and its sub node content*/
                EquationEngine.Parser._subnodeDisplay(nodeObj, subnode.toString(), maxTextLength, nodeCountObject);

                EquationEngine.Parser._textOnCanvas(nodeObj.toString(), subnode.toString(), maxTextLength, nodeCountObject);

                EquationEngine.Parser._arrowGenerator();

                paper.view.draw();

            }
        },


        /**
        Count total child nodes


        @method _nodeCounter
        @private
        @param nodeObj{Object} tree node object
        @param subnodeName{String} name of the node
        @param nodeCountObject{Object} object containing properties name and the child count and child names
        @param nodeCount{Integer} current node level in the tree
        @return Void
        @static
        **/
        "_nodeCounter": function(nodeObj, subnodeName, nodeCountObject, nodeCount) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                obj,
                i = 0,
                nodeObjLength;
            if (!nodeObj.isTerminal) {
                i = 0;
                nodeObjLength = nodeObj.params.length;
                for (; i < nodeObjLength; i++) {
                    EquationEngine.Parser._nodeCounter(nodeObj.params[i], subnodeName + i, nodeCountObject, nodeCount);
                }
                if (subnodeName !== '0') {
                    obj = {
                        "name": subnodeName,
                        "childNode": nodeObjLength,
                        "totalNode": 0
                    };
                    nodeCountObject.push(obj);
                }
                nodeCount[0]++;
            } else {
                obj = {
                    "name": subnodeName,
                    "childNode": 0,
                    "totalNode": 0
                };
                nodeCountObject.push(obj);
            }
        },


        /**
        Function to set the count of child nodes

        @method _totalNodeCounter
        @private
        @param nodeCountObject{Object} node count object
        @return
        @static
        **/
        "_totalNodeCounter": function(nodeCountObject) {

            var i = 0,
                objectLength = nodeCountObject.length,
                currentObjectName,
                k,
                parentNodeName,
                currentObjectLength,
                node;
            for (; i < objectLength; i++) {
                currentObjectName = nodeCountObject[i].name;
                currentObjectLength = currentObjectName.length;
                parentNodeName = currentObjectName.substring(0, currentObjectLength - 1);
                for (k = i + 1; k < objectLength; k++) {
                    if (nodeCountObject[k].name === parentNodeName) {
                        if (nodeCountObject[i].totalNode !== 0) {
                            nodeCountObject[k].totalNode += nodeCountObject[i].totalNode;
                        } else {
                            node = nodeCountObject[i].childNode;
                            if (node === 0) {
                                node = 1;
                            }
                            nodeCountObject[k].totalNode = nodeCountObject[k].totalNode + node;
                        }
                        break;
                    }
                }

                if (nodeCountObject[i].childNode === 0) {
                    nodeCountObject[i].totalNode = 1;
                }
            }
        },

        /**
        Its recursive function,get text of node and its sub node,call textonCanvas to print text on canvas

        @method _subnodeDisplay
        @private
        @param nodeObj{object}tree node object
        @param subNodeRoot{String} Name of the node
        @param maxTextLength{Integer} node text width
        @param nodeCountObject{Object} node count object
        @return
        @static
        **/
        "_subnodeDisplay": function(nodeObj, subNodeRoot, maxTextLength, nodeCountObject) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                length,
                i = 0,
                text = 0;
            if (!nodeObj.isTerminal) {
                length = nodeObj.params.length;
                if (length !== 0) {
                    for (; i < length; i++) {
                        EquationEngine.Parser._subnodeDisplay(nodeObj.params[i], subNodeRoot + i, maxTextLength, nodeCountObject);
                        text = nodeObj.params[i].toString();
                        EquationEngine.Parser._textOnCanvas(text, subNodeRoot + i, maxTextLength, nodeCountObject);
                    }
                }
            }
        },

        /**
        Function to print nodes(text) in canvas for debugging purposes.


        @method _textOnCanvas
        @private
        @param text{String} text to be displayed
        @param subNodeRoot{String} Name of the node
        @param maxTextLength{Integer} node text width
        @param nodeCountObject{Object} node count object
        @return
        @static
        **/
        "_textOnCanvas": function(text, subNodeRoot, maxTextLength, nodeCountObject) {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models,
                nodeLevel = subNodeRoot.length,
                i = 0,
                j,
                k,
                x,
                y,
                width,
                checkName,
                checkNameLength,
                newCheckName,
                newName,
                position,
                counter,
                rectangle,
                textLength,
                textxPoint;

            x = (nodeLevel - 1) * (100 + maxTextLength);

            for (; i < nodeLevel; i++) {
                if (i === 0) {
                    y = 20;
                } else {
                    checkName = subNodeRoot.substring(0, i + 1);
                    checkNameLength = checkName.length;
                    position = checkName[checkNameLength - 1];
                    counter = parseInt(position, 10);
                    j = 0;
                    for (j = counter - 1; j >= 0; j--) {
                        newCheckName = checkName.split('');
                        newCheckName[checkNameLength - 1] = j.toString();
                        newName = newCheckName.join('');
                        k = 0;
                        for (k = 0; k < nodeCountObject.length; k++) {
                            if (nodeCountObject[k].name === newName) {
                                y += nodeCountObject[k].totalNode * 30;
                                break;
                            }
                        }
                    }
                }
            }

            width = maxTextLength + 30;

            rectangle = new Path.Rectangle({
                "point": [x, y - 12],
                "size": [width, 20],
                "strokeWidth": 2,
                "strokeColor": '#000'
            });
            rectangle.subNodeRoot = subNodeRoot;
            /*text of root node*/
            textLength = EquationEngine.Parser._getTextWidth($('<div></div>').html(text), true);
            textxPoint = (width - textLength) / 2;
            text = new PointText({
                "point": [x + textxPoint, y],
                "content": text,
                "fontSize": 12,
                "fillColor": '#000'
            });

        },

        /**

        Display arrow between parent and child nodes

        @method _arrowGenerator
        @private
        @return Void
        @static
        **/
        "_arrowGenerator": function() {

            var childrenPath = paper.project.activeLayer.children,
                length = childrenPath.length,
                i = 0,
                name, j,
                centerSource = new Point(),
                centerDest = new Point(),
                line, midPoint = new Point();


            for (; i < length; i++) {
                if (i % 2 === 0) {
                    name = childrenPath[i].subNodeRoot;
                    name = name.substring(0, name.length - 1);
                    j = i;
                    for (; j < length; j++) {
                        if (childrenPath[j].subNodeRoot === name) {
                            centerSource.x = (childrenPath[i].segments[0].point.x + childrenPath[i].segments[1].point.x) / 2;
                            centerSource.y = (childrenPath[i].segments[0].point.y + childrenPath[i].segments[1].point.y) / 2;
                            centerDest.x = (childrenPath[j].segments[2].point.x + childrenPath[j].segments[3].point.x) / 2;
                            centerDest.y = (childrenPath[j].segments[2].point.y + childrenPath[j].segments[3].point.y) / 2;
                            if (centerSource.y !== centerDest.y) {
                                midPoint.x = (centerDest.x + centerSource.x) / 2;
                                midPoint.y = centerDest.y;
                                line = new Path({
                                    "segments": [midPoint, [midPoint.x, centerSource.y], centerSource],
                                    "strokeWidth": 2,
                                    "strokeColor": '#000'
                                });
                            } else {
                                line = new Path({
                                    "segments": [centerSource, centerDest],
                                    "strokeWidth": 2,
                                    "strokeColor": '#000'
                                });
                            }
                        }
                    }
                }
            }
        },

        /**

        Function to get the width of the text

        @method _getTextWidth
        @private
        @param $div{Object} Jquery div object containing the text
        @param bDebug{Boolean} true if function is called from debugger console
        @return {Integer} width of the text
        @static
        **/
        "_getTextWidth": function($div, bDebug) {
            if (bDebug) {
                $('body').append($div);
            }
            var htmlOrg = $div.html(),
                htmlCalc = '<span>' + htmlOrg + '</span>',
                width;
            $div.html(htmlCalc);
            width = $div.find('span:first').width();
            $div.html(htmlOrg);
            if (bDebug) {
                $div.detach();
            }
            return width;
        },

        "_showConsole": function(flag, string, colorArray) {
            var length;
            if (window.console) {
                if (flag) {
                    if (colorArray === void 0) {
                        length = 0;
                    } else {
                        length = colorArray.length;
                    }
                    switch (length) {
                        case 0:
                            geomFunctions.traceConsole(string);
                            break;
                        case 1:
                            geomFunctions.traceConsole(string, colorArray[0]);
                            break;
                        case 2:
                            geomFunctions.traceConsole(string, colorArray[0], colorArray[1]);
                            break;
                    }
                }
            }
        }
    });


    MathUtilities.Components.EquationEngine.Models.EquationEnums = Backbone.Model.extend({}, {
        "ERROR_TOO_MANY_FREE_VARIABLES": 'Too many free variables.',
        "ERROR_CONSTANTS_NOT_DEFINED": 'Constants are not defined',
        "ERROR_COMPLICATED": 'Its complicated',
        "ERROR_SYNTAX_ERROR": 'Equation has syntax error',
        "ERROR_VARIABLE_HAS_TO_BE_QUADRATIC": 'At least one variable has to be quadratic',


        //all instructions related to processing
        "PROCESS_INSTRUCTION_USE_WORKER": 1
    });

}(window.MathUtilities));
