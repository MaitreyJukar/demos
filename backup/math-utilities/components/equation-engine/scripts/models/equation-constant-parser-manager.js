/* globals _, $, window  */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Components.EquationEngine.Collections = {};

    /**
     * Collection of equationData models
     * @class EquationDataCollection
     * @constructor
     * @extends Backbone.Collection
     */
    MathUtilities.Components.EquationEngine.Collections.EquationDataCollection = Backbone.Collection.extend({

        "model": MathUtilities.Components.EquationEngine.Models.EquationData

    });

    MathUtilities.Components.EquationEngine.Models.ChangeConstantEquationManager = Backbone.Model.extend({

        "defaults": function() {
            return {
                //collection of equationData
                "_equationDataList": null,

                //object of constants with update and value property
                "_constantsList": {},

                //object of functions with update and value property
                "_functionList": {},

                //list of constants with updated and valid value
                "_parseConstants": {},

                //list of constants with updated and valid value
                "_parseFunctions": {},
                "_parseFunctionsEngine": {},

                "_parseFunctionsRanges": {},

                "_plotterView": null,

                "_gridGraphView": null,

                "_equationUnit": 'rad',

                "_errorMessages": {
                    "EQUATION_PRESENT": 'Equation already present',
                    "MULTIPLE_EQUALS": 'Equation can not have multiple equal to signs',
                    "CONSTANT_PRESENT": 'Constant already present',
                    "DECLARE_CONSTANT": 'Declare required constant',
                    "CYCLIC_CONSTANT": 'Cyclic constants',
                    "VARIABLE_VALUE": 'The values of a variable cannot be assigned to a constant.'
                }
            };
        },

        "initialize": function() {
            this.set({
                "_equationDataList": new MathUtilities.Components.EquationEngine.Collections.EquationDataCollection(),
                "_gridGraphView": this.get('graphView'),
                "_plotterView": new MathUtilities.Components.Graph.Views.plotterView({
                    "graphView": this.get('graphView'),
                    "generateIntersections": true
                })
            });
        },
        //adds equation to _equationDataList
        "addEquation": function(equationData, doNotParse) {

            var changedEquations = [],
                _equationDataList = this.get('_equationDataList');
            if (equationData !== _equationDataList.get(equationData.getCid())) {
                _equationDataList.add(equationData);
                equationData.setDefinitionName(null);
                equationData.setDefinitionType(null);
            }
            if (doNotParse !== false) {
                changedEquations = this.changeInMathquill(equationData);
            }
            return changedEquations;

        },

        "_canDefine": function(equationData) {
            var leftTokens,
                noOfTokens;
            if (equationData.getLatex().indexOf('=') === -1 || equationData.getInEqualityType() !== 'equal') {
                return false;
            }
            leftTokens = equationData.getLeftExpression().tokens;
            if (leftTokens) {
                noOfTokens = leftTokens.length;
                if (noOfTokens === 1 && leftTokens[0].type === 'const') {
                    return {
                        "type": 'constant',
                        "value": leftTokens[0].value
                    };
                }
                if (this._isFunctionDefinition(equationData)) {
                    return {
                        "type": 'function',
                        "value": leftTokens[0].value
                    };
                }
            }
            return false;
        },

        "_isDefined": function(equationData, definition) {
            var defType = definition.type;
            return defType === 'function' && this.get('_parseFunctions')[definition.value] !== void 0 ||
                defType === 'constant' && this.get('_parseConstants')[definition.value] !== void 0;
        },

        "_addNewDefinition": function(equationData, canDefine) {
            var definition,
                affectedObject = {};
            if (canDefine.type === 'function') {
                definition = {
                    "type": 'function',
                    "value": equationData,
                    "update": false,
                    "name": canDefine.value
                };
                this.get('_functionList')[canDefine.value] = definition;
            } else {
                definition = {
                    "type": 'constant',
                    "value": equationData,
                    "update": false,
                    "name": canDefine.value
                };
                this.get('_constantsList')[canDefine.value] = definition;
            }
            this.outdateDependentDefinitions(definition);
            affectedObject.definitions = this._updateDefinitions();

            // give circular dependency error to each equation
            if (equationData.isCanBeSolved() || equationData.getErrorCode() === 'CircularDependancy') {
                affectedObject.equations = this.parseDependentEquations(affectedObject.definitions, equationData);
            } else {
                affectedObject.equations = [equationData];
            }
            return affectedObject;
        },

        "_refineConstantsFunctions": function(data, equationData) {
            var counter,
                definitionParam = equationData.getDefinitionFor();
            definitionParam = definitionParam ? definitionParam.constants[0] : definitionParam;
            for (counter = 0; counter < data.length; counter++) {
                data[counter] = data[counter].replace('-', '');
                if (definitionParam && data[counter] === definitionParam) {
                    data.splice(counter, 1);
                }
            }
            return data;
        },

        "_equationContains": function(equationData, data) {
            var functions = data.functions,
                constants = data.constants,
                totalFunctionsConstants = functions.length,
                counter,
                equationFunctions = this._refineConstantsFunctions(equationData.getAllFunctions(), equationData),
                equationConstants = this._refineConstantsFunctions(equationData.getAllConstants(), equationData);

            for (counter = 0; counter < totalFunctionsConstants; counter++) {
                if (equationFunctions.indexOf(functions[counter].name) !== -1 || equationConstants.indexOf(functions[counter].name) !== -1) {
                    return true;
                }
            }
            totalFunctionsConstants = constants.length;
            for (counter = 0; counter < totalFunctionsConstants; counter++) {
                if (equationConstants.indexOf(constants[counter].name) !== -1) {
                    return true;
                }
            }
            return false;
        },

        "isPresentInDefinitions": function(equationData) {
            var canDefine = this._canDefine(equationData),
                definedConstant;
            if (canDefine && canDefine.type !== 'function') {
                definedConstant = this.get('_constantsList')[canDefine.value];
                if (definedConstant && definedConstant.value === equationData) {
                    return true;
                }
            }
            return false;
        },

        "parseDependentEquations": function(data, ignoreEquation, parseAnyway) {
            var equationList = this.get('_equationDataList'),
                noOfEquations = equationList.length,
                equationCounter,
                equations = [],
                affectedObject,
                currentEquationData;
            for (equationCounter = 0; equationCounter < noOfEquations; equationCounter++) {
                currentEquationData = equationList.at(equationCounter);

                if (this._equationContains(currentEquationData, data)) {
                    if (!(currentEquationData.getDefinitionName() || ignoreEquation === currentEquationData || this.isPresentInDefinitions(currentEquationData))) {
                        if (currentEquationData.getSpecie() !== "plot" || parseAnyway) {
                            affectedObject = this.changeInMathquill(currentEquationData);
                            equations = equations.concat(affectedObject.equations);
                        } else {
                            currentEquationData.setConstants(this.get('_parseConstants'));
                            currentEquationData.setCustomFunctions(this.get('_parseFunctions'));
                            currentEquationData.setFunctions(this.get('_parseFunctionsEngine'));
                            currentEquationData.trigger('plot-equation');
                            equations = equations.concat(currentEquationData);
                        }
                    }
                    equations.push(currentEquationData);
                }
            }
            equations = _.uniq(equations);
            return equations;
        },

        "_isFunctionDefinition": function(equationData) {
            var definition = equationData.getDefinitionFor();
            return equationData.getSpecie() === 'function' && !this._isConstantDefined(definition.name) && definition.name !== definition.constants[0] && !this._isConstantDefined(definition.constants[0], true);
        },
        "_isConstantDefined": function(constant, onlyStandardConstant) {
            if (onlyStandardConstant) {
                return MathUtilities.Components.EquationEngine.Models.Parser._isStandardConstant(constant);
            }
            return typeof this.get('_parseConstants')[constant] !== 'undefined' || MathUtilities.Components.EquationEngine.Models.Parser._isStandardConstant(constant);
        },

        "_generateNumberCode": function(number) {
            return 'return [' + number + ',' + number + '];';
        },
        "_getRightExpression": function(definitionEquation) {
            var latex = definitionEquation.getLatex();
            return latex.substr(latex.indexOf('=') + 1, latex.length);
        },
        "_setAndParseFunctionDefinition": function(definition) {
            var rhsEquationData = this.createNewEquationData(definition),
                definitionEquation = definition.value,
                leftExp = definition.name,
                solution,
                specie,
                functionCode,
                currentRange,
                range = {},
                currentObj,
                rightExpression = this._getRightExpression(definitionEquation),
                cloneFunction = $.extend({}, this.get('_parseFunctions')),
                definitionFor = definitionEquation.getDefinitionFor(),
                supportedParamVar = definitionFor ? definitionFor.constants[0] : null,
                solveOnlyY = supportedParamVar === 'y',
                rangeCheck;
            rightExpression = rightExpression || '';

            delete cloneFunction[definition.name];
            rhsEquationData.setLatex(rightExpression);
            rhsEquationData.setConstants(this.get('_parseConstants'));
            rhsEquationData.setCustomFunctions(cloneFunction);
            rhsEquationData.setFunctions(this.get('_parseFunctionsEngine'));
            supportedParamVar = supportedParamVar !== 'x' && supportedParamVar !== 'y' ? supportedParamVar : null;
            rhsEquationData.setSupportedParamVar(supportedParamVar);
            if (solveOnlyY) {
                rhsEquationData.setSolveOnlyY(solveOnlyY);
                rhsEquationData.setDoNotAllowYRange(false);
            } else {
                rhsEquationData.setDoNotAllowYRange(true);
            }
            this.parseEquation(rhsEquationData, true);

            currentRange = definitionEquation.getRange();
            currentObj = rhsEquationData.getRange();
            if (rhsEquationData.isCanBeSolved()) {
                specie = rhsEquationData.getSpecie();
                solution = rhsEquationData.getSolution();
                definitionEquation.setAccText(rhsEquationData.getAccText());
                if ((specie === 'plot' && rhsEquationData.getInEqualityType() === 'equal') || typeof solution === 'number') {
                    if (typeof solution === 'number') {
                        functionCode = this._generateNumberCode(solution);
                        if (supportedParamVar || definitionFor.constants[0] === 'x') {
                            definitionEquation.setFunctionVariable('y');
                            definitionEquation.setParamVariable('x');
                        } else {
                            definitionEquation.setFunctionVariable('x');
                            definitionEquation.setParamVariable('y');
                        }
                    } else {
                        functionCode = rhsEquationData.getFunctionCode();
                        definitionEquation.setFunctionVariable(rhsEquationData.getFunctionVariable());
                        definitionEquation.setParamVariable(rhsEquationData.getParamVariable());
                    }
                    if (currentObj) {
                        rangeCheck = this._getFunctionCodeRangeCheck(currentObj);
                        functionCode = rangeCheck + functionCode;
                    } else if (currentRange) {
                        rangeCheck = this._getFunctionCodeRangeCheck(currentRange);
                        functionCode = rangeCheck + functionCode;
                    }
                    definitionEquation.setCanBeSolved(true);
                    definitionEquation.setSpecie('plot');
                    definitionEquation.setFunctionCode(functionCode);
                    definitionEquation.setDefinitionName(leftExp);
                    definitionEquation.setDefinitionType('function');
                    definitionEquation.setCustomFunctions(this.get('_parseFunctions'));
                    definitionEquation.setParamVariableOrder(rhsEquationData.getParamVariableOrder());
                    definitionEquation.setRange(rhsEquationData.getRange());
                    if (this.get('_plotterView').addEquation(definitionEquation, true) === 'alreadyAdded') {
                        definitionEquation.trigger('plot-equation');
                    }
                    this.get('_parseFunctions')[leftExp] = functionCode;
                    this.get('_parseFunctionsEngine')[leftExp] = this._createEngine(functionCode, this.get('_parseConstants'), this.get('_parseFunctionsEngine'));
                } else {
                    definitionEquation.setErrorCode('CannotUnderstandThis');
                    definitionEquation.setCanBeSolved(false);
                    delete this.get('_parseFunctions')[leftExp];
                    delete this.get('_parseFunctionsEngine')[leftExp];
                    delete this.get('_parseFunctionsRanges')[leftExp];
                }
            } else {
                if (definitionEquation.getDefinitionName()) {
                    this._removeDefinition(definitionEquation, definition);
                }
                definitionEquation.setErrorCode('CannotUnderstandThis');
                definitionEquation.setCanBeSolved(false);
                if (rhsEquationData.getErrorCode() === 'ConstantDeclaration') {
                    this._setEquationErrorData(definitionEquation, rhsEquationData.getErrorData());
                }
            }
        },
        "_getFunctionCodeRangeCheck": function(rangeObject) {
            var rangeCheck = "param===0?param=0:param=param;", //this is to avoid conflicts for 0 and -0 in javascript
                min,
                max;
            if (rangeObject.min !== null) {
                min = rangeObject.min.value;
            }
            if (rangeObject.max !== null) {
                max = rangeObject.max.value;
            }
            if (min !== void 0 && max === void 0) {
                rangeCheck += "if(param<" + min + "){return [];}";
            } else if (max !== void 0 && min === void 0) {
                rangeCheck += "if(param>" + max + "){return [];}";
            } else {
                rangeCheck += "if(param>" + max + "||param<" + min + "){return [];}";
            }
            return rangeCheck;
        },

        "_setAndParseDefinition": function(definition) {
            var rhsEquationData = this.createNewEquationData(definition),
                definitionEquation = definition.value,
                specie,
                solution, stringSolution,
                definitionFor = definitionEquation.getDefinitionFor(),
                leftExp = definition.name,
                rightExpression = this._getRightExpression(definitionEquation) || '',
                _parseConstants = this.get('_parseConstants');

            definition.update = true;
            if (definition.type !== 'function') {
                rhsEquationData.setLatex(rightExpression);
                rhsEquationData.setConstants(_parseConstants);
                rhsEquationData.setCustomFunctions(this.get('_parseFunctions'));
                rhsEquationData.setFunctions(this.get('_parseFunctionsEngine'));
                this.parseEquation(rhsEquationData, true);
                if (rhsEquationData.isCanBeSolved()) {
                    specie = rhsEquationData.getSpecie();
                    solution = rhsEquationData.getSolution();
                    definitionEquation.setAccText(rhsEquationData.getAccText());
                    if (specie === 'number') {
                        definitionEquation.setSpecie('slider');
                        //To find whether solution contains 'e'
                        stringSolution = String(solution);
                        if (stringSolution.indexOf('e') !== -1) {
                            //To pass solution as latex value to avoid 'e' related problems for 10^-7/10^21 values
                            solution = rhsEquationData.getLatex();
                            definitionEquation.setSolution(solution);
                        } else {
                            definitionEquation.setSolution(solution);
                        }
                        definitionEquation.setDefinitionName(leftExp);
                        definitionEquation.setDefinitionType('constant');
                        definitionEquation.setCanBeSolved(true);
                        _parseConstants[leftExp] = Number(solution);
                        delete this.get('_functionList')[leftExp];
                    } else {
                        if (typeof solution === 'number') {
                            definitionEquation.setSpecie('expression');
                            definitionEquation.setCanBeSolved(true);
                            definitionEquation.setSolution(solution);
                            _parseConstants[leftExp] = solution;
                            definitionEquation.setDefinitionName(leftExp);
                            definitionEquation.setDefinitionType('constant');
                            delete this.get('_functionList')[leftExp];
                        } else {
                            definitionEquation.setErrorCode('CannotUnderstandThis');
                            definitionEquation.setCanBeSolved(false);
                            delete _parseConstants[leftExp];
                        }
                    }
                    definitionEquation.setAccText(definition.name + " equal to " + definitionEquation.getAccText());
                } else {
                    if (definitionEquation.getDefinitionName()) {
                        this._removeDefinition(definitionEquation, definition);
                    }
                    definitionEquation.setErrorCode('CannotUnderstandThis');
                    definitionEquation.setCanBeSolved(false);
                    if (rhsEquationData.getErrorCode() === 'ConstantDeclaration') {
                        this._setEquationErrorData(definitionEquation, rhsEquationData.getErrorData());
                    }
                }
            } else {
                this._setAndParseFunctionDefinition(definition);
                if (definitionFor) {
                    definitionEquation.setAccText(definitionFor.name + " of " + definitionEquation.getDefinitionFor().constants[0] +
                        " equal to " + definitionEquation.getAccText());
                }
            }

        },

        "setAllOutdated": function(definitions) {
            var counter,
                definition,
                noOfDefinitions = definitions.length;
            for (counter = 0; counter < noOfDefinitions; counter++) {
                definition = definitions[counter];
                if (definition.update === false) {
                    definition.value.flushError();
                    definition.value.setErrorCode('CircularDependancy');
                    definition.value.setErrorString(this.get('_errorMessages').CYCLIC_CONSTANT);
                    definition.value.setCanBeSolved(false);
                    definition.update = true;
                    delete this.get('_parseFunctions')[definition.name];
                    delete this.get('_parseConstants')[definition.name];
                }
            }
        },

        "_updateDefinition": function(definition, parents) {
            var dependentOutdatedDefinitions,
                counter = 0;
            if (!parents) {
                parents = [];
            }
            if (parents.indexOf(definition) > -1) {
                this.setAllOutdated(parents);
                return parents;
            }
            dependentOutdatedDefinitions = this.getDependentDefinitions(definition);
            parents.push(definition);

            // parse dependent outdated functions and constants
            while (dependentOutdatedDefinitions.constants[counter]) {
                this._updateDefinition(dependentOutdatedDefinitions.constants[counter], parents);
                counter++;
            }
            counter = 0;
            while (dependentOutdatedDefinitions.functions[counter]) {
                this._updateDefinition(dependentOutdatedDefinitions.functions[counter], parents);
                counter++;
            }
            if (!definition.update) {
                this._setAndParseDefinition(definition);
            }
            return parents;
        },

        "_updateDefinitions": function() {
            var data = {
                    "constants": [],
                    "functions": []
                },
                constantsList = this.get('_constantsList'),
                functionList = this.get('_functionList'),
                counter,
                currentObj;
            for (counter in constantsList) {
                currentObj = constantsList[counter];
                currentObj.name = counter;
                if (currentObj.update === false) {
                    data.constants = data.constants.concat(this._updateDefinition(currentObj));
                }
            }
            for (counter in functionList) {
                currentObj = functionList[counter];
                currentObj.name = counter;
                if (currentObj.update === false) {
                    data.functions = data.functions.concat(this._updateDefinition(currentObj));
                }
            }
            return data;
        },

        "_updateDefintionsAndParse": function(equationData, definition) {
            var affectedObject = {};
            this.outdateDependentDefinitions(definition);
            affectedObject.definitions = this._updateDefinitions();
            affectedObject.equations = this.parseDependentEquations(affectedObject.definitions, equationData);
            return affectedObject;
        },

        "_removeDefinition": function(equationData, definition) {
            var data,
                affectedEquations = {};
            if (definition.type === 'function') {
                delete this.get('_parseFunctionsEngine')[definition.name];
                delete this.get('_parseFunctions')[definition.name];
                delete this.get('_functionList')[definition.name];
                this.removeEquationDataFromGridGraph(equationData, true);
            } else {
                delete this.get('_parseConstants')[definition.name];
                delete this.get('_constantsList')[definition.name];
            }
            this.outdateDependentDefinitions(definition);
            affectedEquations.definitions = data = this._updateDefinitions();
            definition.value.setDefinitionName(null);
            definition.value.setDefinitionType(null);
            if (definition.type === 'function') {
                data.functions.push(definition);
            } else {
                data.constants.push(definition);
            }
            affectedEquations.equations = this.parseDependentEquations(data, equationData, true);
            affectedEquations.equations.push(equationData);
            equationData.setConstants(this.get('_parseConstants'));
            equationData.setCustomFunctions(this.get('_parseFunctions'));
            equationData.setFunctions(this.get('_parseFunctionsEngine'));
            this.parseEquation(equationData);
            return affectedEquations;
        },

        "getDependentDefinitions": function(definition) {
            var data = {
                    "constants": [],
                    "functions": []
                },
                counter,
                currentObj,
                constantsList = this.get('_constantsList'),
                functionList = this.get('_functionList'),
                equationData = definition.value,
                equationDefinitions = equationData.getRightEquationParameters().functionsList.concat(equationData.getRightEquationParameters().constantsList),
                equationDefinitionsLength = equationDefinitions.length;

            for (counter = 0; counter < equationDefinitionsLength; counter++) {
                equationDefinitions[counter] = equationDefinitions[counter].replace('-', '');
                currentObj = constantsList[equationDefinitions[counter]];
                if (currentObj && currentObj.update === false) {
                    data.constants.push(currentObj);
                }
                currentObj = functionList[equationDefinitions[counter]];
                if (currentObj && currentObj.update === false) {
                    data.functions.push(currentObj);
                }
            }
            data.constants = _.uniq(data.constants);
            data.functions = _.uniq(data.functions);
            return data;
        },

        "outdateDependentDefinitions": function(definition) {
            var counter,
                currentObj,
                data = {
                    "functions": [],
                    "constants": []
                },
                startAgain = true,
                constantsList = this.get('_constantsList'),
                functionList = this.get('_functionList');

            if (definition.type !== 'function') {
                data.constants.push(definition);
            } else {
                data.functions.push(definition);
            }
            while (startAgain) {
                startAgain = false;
                for (counter in constantsList) {
                    currentObj = constantsList[counter];
                    if (this._equationContains(currentObj.value, data)) {
                        currentObj.update = false;
                        if (data.constants.indexOf(currentObj) === -1) {
                            data.constants.push(currentObj);
                            startAgain = true;
                            break;
                        }
                    }
                }
                for (counter in functionList) {
                    currentObj = functionList[counter];
                    if (this._equationContains(currentObj.value, data)) {
                        currentObj.update = false;
                        if (data.functions.indexOf(currentObj) === -1) {
                            data.functions.push(currentObj);
                            startAgain = true;
                            break;
                        }
                    }
                }
            }
        },

        "changeInMathquill": function(equationData) {
            var definedConstant,
                canDefine,
                tokens,
                affectedEquations = {
                    "equations": [],
                    "definitions": {
                        "constants": [],
                        "functions": []
                    }
                },
                currentDefinition,
                dependentDefinitions,
                definitionType;

            equationData.setDefinitionFor(null);
            // create tokens to find constants & functions
            MathUtilities.Components.EquationEngine.Models.Parser.parseEquationToGetTokens(equationData);
            // check if already defines any constant or function
            definedConstant = equationData.getDefinitionName();
            // check if can define constant or function
            canDefine = this._canDefine(equationData);
            definitionType = equationData.getDefinitionType();
            if (definitionType === 'function') {
                currentDefinition = this.get('_functionList')[definedConstant];

            } else {
                currentDefinition = this.get('_constantsList')[definedConstant];
            }
            if (canDefine && definitionType && canDefine.type !== definitionType) {
                this._removeDefinition(currentDefinition.value, currentDefinition);
                definedConstant = equationData.getDefinitionName();
            }

            if (definedConstant) {
                if (canDefine) {

                    if (canDefine.value === definedConstant) {

                        //update dependent equations
                        affectedEquations = this._updateDefintionsAndParse(equationData, currentDefinition);
                    } else {

                        // remove defined and check new constant cases
                        if (this._isDefined(equationData, canDefine)) {

                            //set error and return
                            affectedEquations = this._removeDefinition(equationData, currentDefinition);
                        } else {

                            affectedEquations = this._removeDefinition(equationData, currentDefinition);
                            dependentDefinitions = this._addNewDefinition(equationData, canDefine);
                            affectedEquations.definitions.constants = affectedEquations.definitions.constants.concat(dependentDefinitions.definitions.constants);
                            affectedEquations.definitions.functions = affectedEquations.definitions.functions.concat(dependentDefinitions.definitions.functions);
                            affectedEquations.equations = affectedEquations.equations.concat(dependentDefinitions.equations);
                        }
                    }
                } else {

                    //remove defined set error and updated dependent equations
                    affectedEquations = this._removeDefinition(equationData, currentDefinition);
                }
            } else {

                if (canDefine) {

                    if (this._isDefined(equationData, canDefine)) {

                        //set error and return
                        equationData.setErrorCode('AlreadyDefined');
                        equationData.setCanBeSolved(false);
                        affectedEquations.equations.push(equationData);
                    } else {
                        affectedEquations = this._addNewDefinition(equationData, canDefine);
                    }
                } else {
                    definedConstant = equationData.getDefinitionFor();
                    if (definedConstant && (this._isConstantDefined(definedConstant.name) || typeof this.get('_parseFunctions')[definedConstant.name] !== 'undefined')) {
                        equationData.setErrorCode('AlreadyDefined');
                        equationData.setCanBeSolved(false);
                    } else {
                        tokens = equationData.getLeftExpression().tokens;
                        if (equationData.getLatex().indexOf('=') !== -1 && tokens && tokens[0].value === '\\customFunc') {
                            //set error since same function defined again and return
                            equationData.setErrorCode('AlreadyDefined');
                            equationData.setCanBeSolved(false);
                        } else {
                            equationData.setConstants(this.get('_parseConstants'));
                            equationData.setCustomFunctions(this.get('_parseFunctions'));
                            equationData.setFunctions(this.get('_parseFunctionsEngine'));
                            this.parseEquation(equationData);
                        }
                    }
                    affectedEquations.equations.push(equationData);
                }
            }

            return affectedEquations;
        },

        "_callGetAllConstants": function(equationData, isFunctionRequired) {
            var constants = isFunctionRequired ? equationData.getAllConstants().concat(equationData.getAllFunctions()) : equationData.getAllConstants(),
                constantCounter,
                noOfConstants = constants.length;
            for (constantCounter = 0; constantCounter < noOfConstants; constantCounter++) {
                constants[constantCounter] = constants[constantCounter].replace('-', '');
            }
            return constants;
        },
        "_handleSumProdCase": function(splitLatex) {
            var splitLatexLength = splitLatex.length;
            if (splitLatexLength < 3) {
                return splitLatex;
            }
        },

        //sets errorData for slider
        "_setEquationErrorData": function(currentEquation, constants) {

            currentEquation.setErrorCode('ConstantDeclaration');
            currentEquation.setErrorString(this.get('_errorMessages').DECLARE_CONSTANT);
            currentEquation.setCanBeSolved(false);
            currentEquation.setErrorData(constants);
        },

        //creates new equationData
        "createNewEquationData": function(definition) {
            var equationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
            equationData.setUnits({
                "angle": this.get('_equationUnit')
            });
            if (definition && definition.type === 'function') {
                equationData.setParentEquation(definition.value);
            }
            return equationData;
        },

        //parse the passed equation
        "parseEquation": function(equationData, doNotPlot) {
            var solution,
                point,
                pointsLength,
                pointCounter,
                equationOrder,
                paramVariable,
                errorOccurred = false,
                functionA,
                functionB,
                alreadyAdded,
                functionCooefecient,
                prevPoint = [],
                _plotterView = this.get('_plotterView');
            equationData.setDefinitionFor(null);
            equationData.flushError();

            MathUtilities.Components.EquationEngine.Models.Parser.parseEquationToGetTokens(equationData);
            if (equationData.isCanBeSolved() === false) {
                _plotterView._removeIntersectionsEquationData(equationData);
                return void 0;
            }
            if (equationData.getSpecie() !== 'number' && equationData.getSpecie() !== 'point') {

                MathUtilities.Components.EquationEngine.Models.Parser.processTokensWithRules(equationData);
                if (equationData.isCanBeSolved() === false) {
                    _plotterView._removeIntersectionsEquationData(equationData);
                    return void 0;
                }
                MathUtilities.Components.EquationEngine.Models.Parser.generateTreeFromRules(equationData);
            }
            if (equationData.getSpecie() !== 'plot') {
                _plotterView._removeIntersectionsEquationData(equationData);
            }
            if (equationData.getSpecie() === 'point') {

                if (!equationData.getBlind()) {
                    solution = equationData.getSolution();
                    pointsLength = solution.length;
                    if (equationData.getPoints()) {
                        prevPoint = equationData.getPoints();
                    }
                    equationData.setPoints([]);
                    for (pointCounter = 0; pointCounter < pointsLength; pointCounter++) {
                        point = [];
                        point.push(Number(solution[pointCounter][0]), Number(solution[pointCounter][1]));
                        equationData.getPoints().push(point);
                    }
                    if (equationData.getVisible().curve) {
                        equationData.trigger('change-in-point', prevPoint, equationData.getPoints());
                    }
                }
                _plotterView.bindEventsOnEquationData(equationData);
                if (equationData.getVisible().curve) {
                    this.get('_gridGraphView').drawPoint(equationData);
                }
            } else if (equationData.getBlind() === false && equationData.isCanBeSolved() && equationData.getSpecie() !== 'expression' && equationData.getSpecie() !== 'number') {

                MathUtilities.Components.EquationEngine.Models.TreeProcedures.convertToSolvableForm(equationData);
                functionA = equationData.getA();
                functionB = equationData.getB();
                MathUtilities.Components.EquationEngine.Models.TreeProcedures.checkForInfinity(equationData, functionA);
                MathUtilities.Components.EquationEngine.Models.TreeProcedures.checkForInfinity(equationData, functionB);
                if (!equationData.isCanBeSolved()) {
                    return void 0;
                }
                if ((functionA === void 0 || $.isEmptyObject(functionA) ||
                        functionA.value === 0 || functionA.value !== void 0 &&
                        isFinite(functionA.value) === false) && (functionB === void 0 ||
                        $.isEmptyObject(functionB) || functionB.value === 0 ||
                        functionB.value !== void 0 && isFinite(functionB.value) === false)) {
                    paramVariable = equationData.getParamVariable();
                    if (equationData.getPossibleFunctionVariables().indexOf(paramVariable) === -1) {
                        errorOccurred = true;
                    } else {
                        MathUtilities.Components.EquationEngine.Models.Parser.parseEquationToGetTokens(equationData);
                        if (equationData.isCanBeSolved() === false) {
                            _plotterView._removeIntersectionsEquationData(equationData);
                            return void 0;
                        }
                        if (equationData.getSpecie() !== 'number' && equationData.getSpecie() !== 'point') {

                            MathUtilities.Components.EquationEngine.Models.Parser.processTokensWithRules(equationData);
                            if (equationData.isCanBeSolved() === false) {
                                _plotterView._removeIntersectionsEquationData(equationData);
                                return void 0;
                            }
                            MathUtilities.Components.EquationEngine.Models.Parser.generateTreeFromRules(equationData);
                        }
                        equationData.setParamVariable(equationData.getFunctionVariable());
                        equationData.setFunctionVariable(paramVariable);
                        MathUtilities.Components.EquationEngine.Models.TreeProcedures.convertToSolvableForm(equationData);
                        functionA = equationData.getA();
                        functionB = equationData.getB();
                        if ((functionA === void 0 || $.isEmptyObject(functionA) ||
                                functionA.value === 0 || functionA.value !== void 0 &&
                                isFinite(functionA.value) === false) && (functionB === void 0 ||
                                $.isEmptyObject(functionB) || functionB.value === 0 || functionB.value !== void 0 &&
                                isFinite(functionB.value) === false)) {
                            errorOccurred = true;
                        }
                    }
                    if (errorOccurred) {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('CannotUnderstandThis');
                        return void 0;
                    }
                }
                if (equationData.getSpecie() === 'quadratic') {
                    if (!doNotPlot) {
                        solution = MathUtilities.Components.EquationEngine.Models.TreeProcedures.solveEquation(equationData, 1);
                        if (equationData.isCanBeSolved() === false) {
                            return void 0;
                        }
                        equationData.setSolution(solution);
                        if (equationData.getInEqualityType() !== 'equal') {
                            equationData.setSpecie('quadraticPlot');
                            alreadyAdded = _plotterView.addEquation(equationData, true);
                            if (alreadyAdded === 'alreadyAdded') {
                                equationData.trigger('plot-equation');
                            }
                        }
                    }
                } else if (equationData.getSpecie() === 'plot') {
                    if (!doNotPlot) {
                        MathUtilities.Components.EquationEngine.Models.TreeProcedures.checkForInfinity(equationData, equationData.getLeftRoot());
                        if (equationData.isCanBeSolved() === false) {
                            return void 0;
                        }

                        if (equationData.getInEqualityType() !== 'equal' && this.get('_plotterView')._checkIfEquationContainsFunction(equationData, ['\\prod', '\\sum'])) {
                            equationData.setCanBeSolved(false);
                            equationData.setErrorCode('SumProdForInEquality');
                            return void 0;
                        }
                        alreadyAdded = _plotterView.addEquation(equationData, true);
                        if (alreadyAdded === 'alreadyAdded') {
                            equationData.trigger('plot-equation');
                        }
                    }
                    equationOrder = equationData.getParamVariableOrder();
                    if (equationOrder < 2) {
                        functionCooefecient = equationData.getB();
                        if (functionCooefecient === void 0) {
                            return void 0;
                        }
                    } else {
                        functionCooefecient = equationData.getA();
                    }

                } else {
                    _plotterView.removeEquation(equationData);
                }
            }
        },
        "solveEquationWithUpdatedConstants": function(equationData) {
            equationData.setSolution(MathUtilities.Components.EquationEngine.Models.TreeProcedures._substituteParamVariableAndGetValue(equationData.getLeftRoot(), equationData.getConstants(), void 0, void 0, equationData));
        },
        //removes the equation and corresponding constant
        "removeEquation": function(equationData) {
            var definitionName,
                definitionType,
                affectedObject = {
                    "equations": [],
                    "definitions": {
                        "constants": [],
                        "functions": []
                    }
                },
                currentDefinition;
            if (!equationData) {
                return affectedObject;
            }
            definitionName = equationData.getDefinitionName();
            definitionType = equationData.getDefinitionType();
            if (definitionType === 'function') {
                currentDefinition = this.get('_functionList')[definitionName];
            } else {
                currentDefinition = this.get('_constantsList')[definitionName];
            }
            if (definitionName && currentDefinition) {
                equationData.setCanBeSolved(false);
                this.removeEquationDataFromGridGraph(equationData, false);
                affectedObject = this._removeDefinition(equationData, currentDefinition);
            } else {
                affectedObject.equations = [];
                this.removeEquationDataFromGridGraph(equationData, false);
            }
            if (equationData.getSpecie() === 'point') {
                if (equationData.getVisible().curve) {
                    equationData.trigger('change-in-point', equationData.getPoints(), []);
                }
                equationData.setPoints([]);
            }
            return affectedObject;
        },

        "removeEquationDataFromCollection": function(equationDataCid) {
            this.get('_equationDataList').remove(equationDataCid);
        },
        "removeEquationDataFromGridGraph": function(equationData, removeOnlyPlot) {
            if (equationData !== void 0) {
                if (equationData.getSpecie() === 'point') {
                    this.removePoint(equationData);
                } else if (equationData.getSpecie() === 'plot') {
                    this.removePlottedEquation(equationData);
                } else if (equationData.getSpecie() === 'error') {
                    this.removePoint(equationData);
                }
                if (equationData.getPathGroup() !== null) {
                    this.get('_gridGraphView').removePlottedGraph(equationData);
                }

                if (equationData.getCriticalPoints() !== null) {
                    this.removePoint(equationData.getCriticalPoints());
                }
                if (equationData.getHollowPoints() !== null) {
                    this.removePoint(equationData.getHollowPoints());
                }
                if (equationData.getIntersectionPoints() !== null) {
                    this.get('_plotterView')._removeIntersectionsEquationData(equationData);
                }
                if (equationData.getInterceptPoints() !== null) {
                    this.removePoint(equationData.getInterceptPoints());
                }
                if (equationData.getDiscontinuousPoints() !== null) {
                    this.removePoint(equationData.getDiscontinuousPoints());
                }

                this.get('_gridGraphView').removeInEqualityPlots(equationData);
                if (removeOnlyPlot === false) {
                    this.removePlottedEquation(equationData);
                    this.removeEquationDataFromCollection(equationData.getCid());
                }
            }

        },

        "getConstants": function() {
            return this.get('_parseConstants');
        },

        "removePoint": function(equationData) {
            this.get('_gridGraphView').removePoint(equationData);
        },
        "removePlottedEquation": function(equationData) {
            this.get('_plotterView').removeEquation(equationData);
        },

        "deleteAllEquationData": function() {
            var countEqn,
                equationData,
                _equationDataList = this.get('_equationDataList'),
                equationDataListLength = _equationDataList.length;
            for (countEqn = 0; countEqn < equationDataListLength; countEqn++) {
                equationData = _equationDataList.at(countEqn);
                equationData.setCustomFunctions({});
                this.removeEquationDataFromGridGraph(equationData);
                this.removePlottedEquation(equationData);
                equationData.setPoints([]);
            }
            _equationDataList.reset([]);
            this.set({
                "_constantsList": {},
                "_parseConstants": {},
                "_parseFunctions": {},
                "_parseFunctionsEngine": {},
                "_functionList": {}
            });
        },
        "getEquationDataUsingCid": function(cid) {
            return this.get('_equationDataList').get(cid);
        },
        "drawPoint": function(equationData) {
            this.get('_gridGraphView').drawPoint(equationData);
        },
        "drawPolygon": function(equationData) {
            this.get('_gridGraphView').drawPolygon(equationData);
        },
        "equationListUnitToggle": function(equationDataUnits) {
            var equationCounter,
                _equationDataList = this.get('_equationDataList'),
                collectionLength = _equationDataList.length,
                equationData, count,
                affectedEquations = {
                    "equations": []
                },
                _constantsList = this.get('_constantsList'),
                _functionList = this.get('_functionList');

            this.set('_equationUnit', equationDataUnits);
            for (count in _constantsList) {
                _constantsList[count].value.getUnits().angle = equationDataUnits;
                _constantsList[count].update = false;
            }
            for (count in _functionList) {
                _functionList[count].value.getUnits().angle = equationDataUnits;
                _functionList[count].update = false;
            }
            affectedEquations.definitions = this._updateDefinitions();
            for (equationCounter = 0; equationCounter < collectionLength; equationCounter++) {
                equationData = _equationDataList.at(equationCounter);
                equationData.getUnits().angle = equationDataUnits;
                if (equationData.getDefinitionName() === null && !equationData.getResidualColumnNo() && !equationData.getBlind()) {
                    this.parseEquation(equationData);
                }
                if (equationData.getSpecie() === 'plot' && $('.coordinate-tooltip[data-equation-cid=' + equationData.getCid() + ']').length !== 0) {
                    this.get('_gridGraphView').clearToolTip(equationData, true);
                }
                if (equationData.getSpecie() !== 'slider') {
                    affectedEquations.equations.push(equationData);
                }
            }
            return affectedEquations;
        },
        "getEquationDataList": function() {
            return this.get('_equationDataList').models;
        },
        "changeListLatex": function(equationData) {
            var latex,
                newLatex = null;

            latex = equationData.getLatex();
            if (equationData.getRhsAuto() && equationData.getSpecie() === 'plot') {
                latex = this._revertProcessLatex(latex);
                newLatex = 'y=' + latex;
                equationData.setRhsAuto(false);
                equationData.setAccText('y equal to ' + equationData.getAccText());
            }
            return newLatex;
        },

        "_revertProcessLatex": function(latex) {
            var replaceString = {
                "\\ceil": "\\{ceil}",
                "\\floor": "\\{floor}",
                "\\round": "\\text{round}",
                "\\abs": "\\text{abs}",
                "\\nPr": "\\text{nPr}",
                "\\nCr": "\\text{nCr}",
                "\\npr": "\\text{npr}",
                "\\ncr": "\\text{ncr}",
                "\\fracdec": "\\text{fracdec}"
            };
            latex = latex.replace(/(\\round|\\abs|\\ceil|\\nPr|\\nCr|\\npr|\\ncr|\\floor|\\fracdec)/g, function(matched) {
                return replaceString[matched];
            });
            return latex;
        },
        "addPlotEquation": function(equationData, isParsed) {
            this.get('_plotterView').addEquation(equationData, isParsed);
        },
        "_createEngine": function(currentFunction, constants, functions) {
            var engine1,
                engine;

            if (currentFunction) {
                engine = new Function('param,constants,functions', currentFunction);

                engine1 = function eng1(param) {
                    var soln = engine(param, constants, functions);
                    return soln[0];
                };
            }
            return engine1;
        }

    }, {});

}(window.MathUtilities));
