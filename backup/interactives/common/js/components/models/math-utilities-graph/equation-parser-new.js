﻿(function (MathInteractives) {
    'use strict';

    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Productions = Backbone.Model.extend({}, {
        _terminalProductions: null,
        _nonTerminalProductions: null,
        productionTable: null,
        productionRules: null,
        _seperatedTokens: null,
        treeGenerationRules: null,
        _nonTerminalRules: null,
        _operatorsInPrecedenceOrder: null,
        _terminalRules: null,

        init: function init() {
            if (MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Productions.productionRules === null) {
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Productions._populateProductionData();
            }
        },

        getMaximumParameters: function getMaximumParameters(functionName) {
            switch (functionName) {
                case '^':
                case '\\log_':
                case '\\sqrt':
                case '\\gcd':
                case '\\lcm':
                case '\\min':
                case '\\max':
                case '\\mod':
                case '\\nCr':
                case '\\nPr':
                case '\\frac':
                    return 2;

                case '+':
                case '-':
                case '\\cdot':
                case '.':
                    return Infinity;

                case '!':
                case '\\%':
                case '\\sin':
                case '\\cos':
                case '\\tan':
                case '\\csc':
                case '\\sec':
                case '\\cot':
                case '\\sinh':
                case '\\cosh':
                case '\\tanh':
                case '\\arcsin':
                case '\\arccos':
                case '\\arctan':
                case '\\log':
                case '\\ln':
                case '\\ceil':
                case '\\floor':
                case '\\round':
                case '\\abs':
                case '\\exp':
                case 'do':
                    return 1;

                case '\\sum':
                case '\\prod':
                    return 4;

            }
        },

        _populateProductionData: function _populateProductionData() {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                terminalProductionsCounter,
                terminalProductionsLength,
                currentRule,
                operatorCounter,
                operatorCount,
                totalOperatorCombinations,
                currentNonTerminalProduction,
                currentProduction,
                currentOperatorCombinationCounter,
                currentTerminalProduction,
                terminalMappingName,
                currentRuleNonTerminalPart;
            nameSpace.Productions._terminalProductions = ['\\frac', '(', '[', 'var', 'const', 'digit', '\\theta', '{', '\\sin', '\\cos', '\\tan', '\\csc', '\\sec', '\\cot', '\\arcsin', '\\arccos', '\\arctan', '\\arccsc', '\\arcsec', '\\arccot', '\\sinh', '\\cosh', '\\tanh', '\\csch', '\\sech', '\\coth', '\\log_', '\\ln', '\\log', '\\sqrt', '\\gcd', '\\lcm', '\\ceil', '\\floor', '\\round', '\\abs', '\\min', '\\max', '\\mod', '\\nPr', '\\nCr', '\\exp', '\\sum', '\\prod'];
            nameSpace.Productions._terminalRules = ['node.\\frac', 'node.do', 'node.do', 'terminal.var', 'terminal.const', 'terminal.digit', 'terminal.\\theta', 'node.do', 'node.\\sin', 'node.\\cos', 'node.\\tan', 'node.\\csc', 'node.\\sec', 'node.\\cot', 'node.\\arcsin', 'node.\\arccos', 'node.\\arctan', 'node.\\arccsc', 'node.\\arcsec', 'node.\\arccot', 'node.\\sinh', 'node.\\cosh', 'node.\\tanh', 'node.\\csch', 'node.\\sech', 'node.\\coth', 'node.\\log_', 'node.\\ln', 'node.\\log', 'node.\\sqrt', 'node.\\gcd', 'node.\\lcm', 'node.\\ceil', 'node.\\floor', 'node.\\round', 'node.\\abs', 'node.\\min', 'node.\\max', 'node.\\mod', 'node.\\nPr', 'node.\\nCr', 'node.\\exp', 'node.\\sum terminal.const', 'node.\\prod terminal.const'];

            nameSpace.Productions._seperatedTokens = {
                '\\frac': ['\\frac', '{', 'E', '}', '{', 'E', '}'],
                '(': ['(', 'E', ')'],
                '[': ['[', 'E', ']'],
                'var': ['var'],
                'const': ['const'],
                'digit': ['digit'],
                '\\theta': ['\\theta'],
                '{': ['{', 'E', '}'],
                '\\sin': ['\\sin', '(', 'E', ')'],
                '\\cos': ['\\cos', '(', 'E', ')'],
                '\\tan': ['\\tan', '(', 'E', ')'],
                '\\csc': ['\\csc', '(', 'E', ')'],
                '\\sec': ['\\sec', '(', 'E', ')'],
                '\\cot': ['\\cot', '(', 'E', ')'],
                '\\arcsin': ['\\arcsin', '(', 'E', ')'],
                '\\arccos': ['\\arccos', '(', 'E', ')'],
                '\\arctan': ['\\arctan', '(', 'E', ')'],
                '\\arccsc': ['\\arccsc', '(', 'E', ')'],
                '\\arcsec': ['\\arcsec', '(', 'E', ')'],
                '\\arccot': ['\\arccot', '(', 'E', ')'],
                '\\sinh': ['\\sinh', '(', 'E', ')'],
                '\\cosh': ['\\cosh', '(', 'E', ')'],
                '\\tanh': ['\\tanh', '(', 'E', ')'],
                '\\csch': ['\\csch', '(', 'E', ')'],
                '\\sech': ['\\sech', '(', 'E', ')'],
                '\\coth': ['\\coth', '(', 'E', ')'],
                '\\log_': ['\\log_', '{', 'E', '}', '(', 'E', ')'],
                '\\ln': ['\\ln', '(', 'E', ')'],
                '\\log': ['\\log', '(', 'E', ')'],
                '\\sqrt': ['\\sqrt', '[', 'E', ']', '{', 'E', '}'],
                '\\gcd': ['\\gcd', '(', 'E', ',', 'E', ')'],
                '\\lcm': ['\\lcm', '(', 'E', ',', 'E', ')'],
                '\\ceil': ['\\ceil', '(', 'E', ')'],
                '\\floor': ['\\floor', '(', 'E', ')'],
                '\\round': ['\\round', '(', 'E', ')'],
                '\\abs': ['\\abs', '(', 'E', ')'],
                '\\min': ['\\min', '(', 'E', ',', 'E', ')'],
                '\\max': ['\\max', '(', 'E', ',', 'E', ')'],
                '\\mod': ['\\mod', '(', 'E', ',', 'E', ')'],
                '\\nPr': ['\\nPr', '(', 'E', ',', 'E', ')'],
                '\\nCr': ['\\nCr', '(', 'E', ',', 'E', ')'],
                '\\exp': ['\\exp', '(', 'E', ')'],
                '\\sum': ['\\sum', '{', 'const', '}', '{', 'E', '}', '{', 'E', '}', '{', 'E', '}'],
                '\\prod': ['\\prod', '{', 'const', '}', '{', 'E', '}', '{', 'E', '}', '{', 'E', '}']
                //'\\%': ['digit', '\\%']
            };

            /*
            * -ve operator is not accounted since we will not expect it in parsing
            * the tokens will be preprocessed to remove negative signs
            *
            */
            nameSpace.Productions._operatorsInPrecedenceOrder = ['+', '\\cdot', '^', '!', '\\%'];
            //this._operatorsInPrecedenceOrder = ['+', '\\cdot', '^'];

            //this._nonTerminalProductions = [['(+,E)+'], ['(-,E)+'], ['(\\cdot,E)+'], ['^','E']];
            nameSpace.Productions._nonTerminalRules = ['node.+', 'node.\\cdot', 'node.^', 'node.!', 'node.\\%'];
            nameSpace.Productions.productionTable = {
                E: {}
            };
            terminalProductionsCounter = 0;
            terminalProductionsLength = nameSpace.Productions._terminalProductions.length;
            for (terminalProductionsCounter; terminalProductionsCounter < terminalProductionsLength; terminalProductionsCounter++) {
                nameSpace.Productions.productionTable.E[nameSpace.Productions._terminalProductions[terminalProductionsCounter]] = [];
            }
            //this.productionTable = {
            //    E: {
            //        'var': [],
            //        'const': [],
            //        'digit': [],
            //        '(': [],
            //        '\\frac': [],
            //        '{': [],
            //        '\\sin':[],
            //    }
            //};
            nameSpace.Productions.treeGenerationRules = [];

            nameSpace.Productions.productionRules = [];
            operatorCounter = 0;
            operatorCount = nameSpace.Productions._operatorsInPrecedenceOrder.length;
            terminalProductionsCounter = 0;
            terminalProductionsLength = nameSpace.Productions._terminalProductions.length;

            totalOperatorCombinations = Math.pow(2, operatorCount) - 1;

            for (terminalProductionsCounter = 0; terminalProductionsCounter < terminalProductionsLength; terminalProductionsCounter++) {

                currentTerminalProduction = nameSpace.Productions._terminalProductions[terminalProductionsCounter];
                terminalMappingName = nameSpace.Productions._seperatedTokens[currentTerminalProduction][0];

                for (currentOperatorCombinationCounter = 0; currentOperatorCombinationCounter < totalOperatorCombinations; currentOperatorCombinationCounter++) {

                    currentNonTerminalProduction = [];
                    currentRuleNonTerminalPart = '';
                    currentRule = '';

                    for (operatorCounter = 0; operatorCounter < operatorCount; operatorCounter++) {

                        if ((currentOperatorCombinationCounter & Math.pow(2, operatorCounter)) > 0) {
                            /*
                             * TODO
                             * i am keeping the recursive terminals(^E)+ rules to avoid storing seperate operator stack while parsing the input
                             * if you really want this to be proper, then find a good way to parse rules with a^E which is followed by E -> a(+E)+ without
                             * creating any problems
                             *
                             * examples where this problem was found
                             * (x^2 + x + y) = 1
                             * $\left(x^{2\space }+x\space \right)\cdot x=1$
                             *
                             *
                             */
                            /*if(this._operatorsInPrecedenceOrder[operatorCounter] === '^'){
                             currentNonTerminalProduction.unshift('E');
                             currentNonTerminalProduction.unshift(this._operatorsInPrecedenceOrder[operatorCounter]);
    
                             }
                             else{*/
                            //TODO make those rules for percentage that are going to be used
                            //if (nameSpace.Productions._operatorsInPrecedenceOrder[operatorCounter] === '\\%' && currentTerminalProduction !== 'digit') {
                            //    continue;
                            //}
                            if (nameSpace.Productions._operatorsInPrecedenceOrder[operatorCounter] === '!' || nameSpace.Productions._operatorsInPrecedenceOrder[operatorCounter] === '\\%') {
                                currentNonTerminalProduction.unshift('(' + nameSpace.Productions._operatorsInPrecedenceOrder[operatorCounter] + ')+');
                            }
                            else {
                                currentNonTerminalProduction.unshift('(' + nameSpace.Productions._operatorsInPrecedenceOrder[operatorCounter] + ',E)+');
                                //}
                            }
                            currentRuleNonTerminalPart = currentRuleNonTerminalPart + 'node.' + nameSpace.Productions._operatorsInPrecedenceOrder[operatorCounter] + ' ';

                        }

                    }

                    currentProduction = nameSpace.Productions._seperatedTokens[currentTerminalProduction].concat.apply(nameSpace.Productions._seperatedTokens[currentTerminalProduction], [currentNonTerminalProduction]);

                    //currentNonTerminalProduction  = ['('+this._operatorsInPrecedenceOrder[operatorCounter] + ',E)+'];

                    currentRule = currentRuleNonTerminalPart + nameSpace.Productions._terminalRules[terminalProductionsCounter];

                    //console.log(currentRule);

                    nameSpace.Productions.treeGenerationRules.push(currentRule);
                    nameSpace.Productions.productionRules.push(currentProduction);
                    nameSpace.Productions.productionTable.E[terminalMappingName].push(nameSpace.Productions.productionRules.length - 1);

                    if (currentTerminalProduction === '{' || currentTerminalProduction === '[') {
                        //dont generate rules after {E} they are not valid
                        break;
                    }
                    /*
                     * SKIPPING THESE RULES FOR NOW
                     * THINK PROPERLY BEFORE YOU IMPLEMENT RULES THAT CAN HANDLE
                     * a.(b+c)+c.d
                     * a.b + c.d
                     * a.b.c.d + e
                     *
                     *for(var i = operatorCounter + 1;i<operatorCount;i++){
                     //console.log('New
                    // rule....'+this._seperatedTokens[currentTerminalProduction]+this._operatorsInPrecedenceOrder[i]+'E('+this._operatorsInPrecedenceOrder[operatorCounter]+'E)+');
    
                     currentRule = 'node_' + this._operatorsInPrecedenceOrder[operatorCounter] + ' ' + 'node_' + this._operatorsInPrecedenceOrder[i] + ' '
                    + this._terminalRules[terminalProductionsCounter];
    
                     currentProduction =
                    this._seperatedTokens[currentTerminalProduction].concat.apply(this._seperatedTokens[currentTerminalProduction],[this._operatorsInPrecedenceOrder[i]]);
    
                     currentProduction =
                    currentProduction.concat.apply(currentProduction,['E','('+this._operatorsInPrecedenceOrder[operatorCounter]+',E)+']);
    
                     this.treeGenerationRules.push(currentRule);
                     this.productionRules.push(currentProduction);
                     this.productionTable.E[currentTerminalProduction].push(this.productionRules.length - 1);
    
                     console.log('New rule....'+currentProduction);
                     }*/
                }

                /*
                 * create rules that will facilitate creation of trees with operator precedence
                 *
                 * here we will create rules like
                 *
                 * {terminal Nodes} {all higher precedence operators} E ({current operator},E)+
                 *
                 */

                /*this.treeGenerationRules.push(this._terminalRules[terminalProductionsCounter]);
                 this.productionRules.push(this._seperatedTokens[currentTerminalProduction]);
                 this.productionTable.E[currentTerminalProduction].push(this.productionRules.length - 1);*/
            }
            //rule for const%
            //nameSpace.Productions.treeGenerationRules.push();
            //nameSpace.Productions.productionRules.push();
            //nameSpace.Productions.productionTable.E.digit.push(nameSpace.Productions.productionRules.length - 1);


            //console.log(nameSpace.Productions.productionRules);
            //console.log(JSON.stringify(this.productionTable));
            nameSpace.Productions._getProductionTableAsString();
        },

        _getProductionTableAsString: function _getProductionTableAsString() {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                productionTableString = '',
                productionRulesCounter = 0,
                productionRulesLength = nameSpace.Productions.productionRules.length;
            for (productionRulesCounter = 0; productionRulesCounter < productionRulesLength; productionRulesCounter++) {
                productionTableString += productionRulesCounter + ' : ' + nameSpace.Productions.productionRules[productionRulesCounter].join('') + '   >>    ' + nameSpace.Productions.treeGenerationRules[productionRulesCounter] + '\n';
            }
            $('#rules').text(productionTableString);
        }
    }),

    /**
    Class to create analysis object for analysis done during parsing of equation

    @class MathUtilities.Components.EquationAnalysis
    **/
    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationAnalysis = Backbone.Model.extend({
        /**
            The equation is solved using the form ax^2+bx+c. This is the 'a' part of the solving.
 
            @property A
            @type {Object}
            @public
        **/
        _A: null,

        /**
            The equation is solved using the form ax^2+bx+c. This is the 'b' part of the solving.
 
            @property B
            @type {Object}
            @public
        **/
        _B: null,

        /**
            The equation is solved using the form ax^2+bx+c. This is the 'c' part of the solving.
 
            @property C
            @type {Object}
            @public
        **/
        _C: null,

        /**
            This is a boolean whether the given equation can be solved or not.
 
            @property canBeSolved
            @type {Boolean}
            @public
        **/
        _canBeSolved: true,

        /**
            The possible variables for the equations along with their power in the equation.
 
            @property freeVars
            @type {Object}
            @public
        **/
        _freeVars: null,

        /**
            The function variable of the equation for which the solution has to be calculated
 
            @property functionVariable
            @type {String}
            @public
        **/
        _functionVariable: null,

        /**
            The param variable of the equation which is substituted to get the solution for the function variable of the equation
 
            @property paramVariable
            @type {String}
            @public
        **/
        _paramVariable: null,

        _equationParameters: null,

        _pivot: null,

        _accText: null,

        _rhsAuto: null,

        _order: null,

        _FDFlag: null,

        _functionCode: null,

        _paramVariableOrder: null,

        _inEquatlityType: null,

        initialize: function initialize() {
            this._A = {};
            this._B = {};
            this._C = {};
            this._freeVars = {};
            this._inEquatlityType = 'equal'
            //this._equationParameters = {

            //    operatorsList: [],

            //    variablesList: [],

            //    digitsList: [],

            //    constantsList: [],

            //    functionsList: []
            //};

        },

        getA: function getA() {
            return this._A;
        },

        getB: function getB() {
            return this._B;
        },

        getC: function getC() {
            return this._C;
        },

        isCanBeSolved: function isCanBeSolved() {
            return this._canBeSolved;
        },

        getFreeVars: function getFreeVars() {
            return this._freeVars;
        },

        getFunctionVariable: function getFunctionVariable() {
            return this._functionVariable;
        },

        getParamVariable: function getParamVariable() {
            return this._paramVariable;
        },

        //getEquationParameters: function getEquationParameters() {
        //    return this._equationParameters;
        //},

        getPivot: function getPivot() {
            return this._pivot;
        },

        getAccText: function getAccText() {
            return this._accText;
        },

        getRhsAuto: function getRhsAuto() {
            return this._rhsAuto;
        },

        getOrder: function getOrder() {
            return this._order;
        },

        getFdFlag: function getFdFlag() {
            return this._FDFlag;
        },

        getFunctionCode: function getFunctionCode() {
            return this._functionCode;
        },

        getParamVariableOrder: function getParamVariableOrder() {
            return this._paramVariableOrder;
        },

        setParamVariableOrder: function setParamVariableOrder(paramVariableOrder) {
            this._paramVariableOrder = paramVariableOrder;
        },

        setA: function setA(a) {
            this._A = a;
        },

        setB: function setB(b) {
            this._B = b;
        },

        setC: function setC(c) {
            this._C = c;
        },

        setCanBeSolved: function setCanBeSolved(canBeSolved) {
            this._canBeSolved = canBeSolved;
        },

        setFreeVars: function setFreeVars(freeVars) {
            this._freeVars = freeVars;
        },

        setFunctionVariable: function setFunctionVariable(functionVaraible) {
            this._functionVariable = functionVaraible;
        },

        setParamVariable: function setParamVariable(paramVariable) {
            this._paramVariable = paramVariable;
        },

        //setEquationParameters: function setEquationParameters(equationParameters) {
        //    this._equationParameters = equationParameters;
        //},

        setPivot: function setPivot(pivot) {
            this._pivot = pivot;
        },

        setAccText: function setAccText(accText) {
            this._accText = accText;
        },

        setRhsAuto: function setRhsAuto(rhsAuto) {
            this._rhsAuto = rhsAuto;
        },

        setOrder: function setOrder(order) {
            this._order = order;
        },

        setFdFlag: function setFdFlag(fdFlag) {
            this._FDFlag = fdFlag;
        },

        setFunctionCode: function setFunctionCode(functionCode) {
            this._functionCode = functionCode;
        },

        addToAccText: function addToAccText(accText) {
            this._accText += accText;
        },

        setInEqualityType: function setInEqualityType(inEqualityType) {
            switch (inEqualityType) {
                case '\\le':
                    this._inEquatlityType = 'ltequal';
                    break;
                case '\\ge':
                    this._inEquatlityType = 'gtequal';
                    break;
                case '>':
                    this._inEquatlityType = 'greater';
                    break;
                case '<':
                    this._inEquatlityType = 'lesser';
                    break;
                case '=':
                    this._inEquatlityType = 'equal';
                    break;
                default:
                    this._inEquatlityType = inEqualityType;
            }
        },

        getInEqualityType: function getInEqualityType() {
            return this._inEquatlityType;
        },

        /**
            Flushes all properties of the object and set them to their default values.
     
            @public
            @method flush
        **/
        flush: function flush() {
            this._A = {};
            this._B = {};
            this._C = {};
            this._freeVars = {};
            this._canBeSolved = true;
            this._functionVariable = null;
            this._paramVariable = null;
            //this._equationParameters = null;
            this._accText = null;

            this._rhsAuto = null;

            this._order = null;

            this._FDFlag = null;

            this._functionCode = null;

            this._inEquatlityType = 'equal';
        }

    }, {}),

    /**
    Class to create plot data object to be used to contain plotting related data.

    @class MathUtilities.Components.PlotData
    **/
    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.PlotData = Backbone.Model.extend({

        /**
            Contains banner(measurement) data, including bounding rect, text etc.
 
            @property bannerData
            @type {Object}
            @public
        **/
        _bannerData: {},

        /**
            Boolean whether the plot is draggable or not.
 
            @property draggable
            @type {Boolean}
            @public
        **/
        _draggable: false,

        /**
            Contains data related to labels used in DGT drawables.
 
            @property labelData
            @type {Object}
            @public
        **/
        _labelData: null,

        /**
            The paper Group object of the plot.
 
            @property pathGroup
            @type {Object}
            @public
        **/
        _pathGroup: null,

        /**
            The paper Group object of the points.
 
            @property pointsGroup
            @type {Object}
            @public
        **/
        _pointsGroup: null,

        /**
            [EXPERIMENTAL] was introduced for optimization in plotting
 
            @property plotSessionCount
            @type {Number}
            @public
        **/
        _plotSessionCount: 0,

        /**
            Contains plot groups of the best fit lines,curve and exponent for a list of points used in Graphing Tool
 
            @property bestFit
            @type {Object}
            @public
        **/
        _bestFit: null,

        /**
            Contains paper raster object used by DGT.
 
            @property raster
            @type {Object}
            @public
        **/
        _raster: null,
        _rayPolygon: null,

        _plot: null,

        _inEqualititesPathGroup: null,

        getBannerData: function getBannerData() {
            return this._bannerData;
        },

        isDraggable: function isDraggable() {
            return this._draggable;
        },

        getLabelData: function getLabelData() {
            return this._labelData;
        },

        getPathGroup: function getPathGroup() {
            return this._pathGroup;
        },
        removePathGroup: function removePathGroup() {
            delete this._pathGroup;
        },
        getPointsGroup: function getPointsGroup() {
            return this._pointsGroup;
        },

        getPlotSessionCount: function getPlotSessionCount() {
            return this._plotSessionCount;
        },

        getBestFit: function getBestFit() {
            return this._bestFit;
        },

        getRaster: function getRaster() {
            return this._raster;
        },
        getRayPolygon: function getRayPolygon() {
            return this._rayPolygon;
        },
        setRayPolygon: function setRayPolygon(rayPolygon) {
            this._rayPolygon = rayPolygon;
        },
        setBannerData: function setBannerData(bannerData) {
            this._bannerData = bannerData;
        },

        setDraggable: function setDraggable(isDraggable) {
            this._draggable = isDraggable;
        },

        setLabelData: function setLabelData(labelData) {
            this._labelData = labelData;
        },

        setPathGroup: function setPathGroup(pathGroup) {
            this._pathGroup = pathGroup;
        },

        setPointsGroup: function setPointsGroup(pointsGroup) {
            this._pointsGroup = pointsGroup;
        },

        setPlotSessionCount: function setPlotSessionCount(plotSessionCount) {
            this._plotSessionCount = plotSessionCount;
        },

        setBestFit: function setBestFit(bestFit) {
            this._bestFit = bestFit;
        },

        setRaster: function setRaster(raster) {
            this._raster = raster;
        },

        setPlot: function setPlot(plot) {
            this._plot = plot;
        },

        getPlot: function getPlot() {
            return this._plot;
        },

        setInEqualititesPathGroup: function setInEqualititesPathGroup(group) {
            this._inEqualititesPathGroup = group;
        },

        getInEqualititesPathGroup: function getInEqualititesPathGroup() {
            return this._inEqualititesPathGroup;
        },

        initialize: function initialize() {
            this._labelData = {
                labelObject: null
            };
        },

        /**
            Flushes all properties of the object and set them to their default values.
     
            @public
            @method flush
        **/
        flush: function flush() {
            this._bannerData = {};
            this._draggable = null;
            this._labelData = { labelObject: null };
            this._pathGroup = null;
            this._pointsGroup = null;
            this._plotSessionCount = null;
            this._bestFit;
            this._raster = null;
        }

    }, {}),

    /**
    Class to create equationData object to be used for plotting and parsing

    @class MathUtilities.Components.EquationEngine
    **/
    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.ParserData = Backbone.Model.extend({
        /**
            Constants that are used to for parsing of equation with their values specified
 
            @property constants
            @type {Object}
            @public
        **/
        _constants: null,

        /**
            This the object that contains data related to left expression of the equation.
            Properties : 
                expression: The latex left expression
                tokens: The left hand tokens
                constants: The constants existing in the left hand expression
                freevars: The variables existing in the left hand expression
 
            @property leftExpression
            @type {Object}
            @public
        **/
        _leftExpression: null,

        /**
            It contains the left tree of the equation
 
            @property leftRoot
            @type {Object}
            @public
        **/
        _leftRoot: null,

        /**
            This the object that contains data related to right expression of the equation.
            Properties : 
                expression: The latex right expression
                tokens: The right hand tokens
                constants: The constants existing in the right hand expression
                freevars: The variables existing in the right hand expression
 
            @property rightExpression
            @type {Object}
            @public
        **/
        _rightExpression: null,

        /**
            It contains the right tree of the equation
 
            @property leftRoot
            @type {Object}
            @public
        **/
        _rightRoot: null,

        getConstants: function getConstants() {
            return this._constants;
        },

        getLeftExpression: function getLeftExpression() {
            return this._leftExpression;
        },

        getLeftRoot: function getLeftRoot() {
            return this._leftRoot;
        },

        getRightExpression: function getRightExpression() {
            return this._rightExpression;
        },

        getRightRoot: function getRightRoot() {
            return this._rightRoot;
        },

        setConstants: function setConstants(constants) {
            this._constants = constants;
        },

        setLeftExpression: function setLeftExpression(leftExpression) {
            this._leftExpression = leftExpression;
        },

        setLeftRoot: function setLeftRoot(leftRoot) {
            this._leftRoot = leftRoot;
        },

        setRightExpression: function setRightExpression(rightExpression) {
            this._rightExpression = rightExpression;
        },

        setRightRoot: function setRightRoot(rightRoot) {
            this._rightRoot = rightRoot;
        },

        getLeftEquationParameters: function getLeftEquationParameters() {
            return this._leftExpression.equationParameters;
        },

        getRightEquationParameters: function getRightEquationParameters() {
            return this._rightExpression.equationParameters;
        },

        initialize: function initialize() {
            this._setInitialStates();
        },

        _setInitialStates: function _setInitialStates() {
            this._leftExpression = {
                constants: {},
                freevars: {},
                expression: null,
                equationParameters: {

                    operatorsList: [],

                    variablesList: [],

                    digitsList: [],

                    constantsList: [],

                    functionsList: []
                }
            };
            this._rightExpression = {
                constants: {},
                freevars: {},
                expression: null,
                equationParameters: {

                    operatorsList: [],

                    variablesList: [],

                    digitsList: [],

                    constantsList: [],

                    functionsList: []
                }
            };
        },

        /**
            Flushes all properties of the object and set them to their default values.
     
            @public
            @method flush
        **/
        flush: function flush() {
            this._constants = null;
            this._leftRoot = null;
            this._rightRoot = null;
            this._setInitialStates();
        }

    }, {}),

    /**
    Class to create equationData object to be used for plotting and parsing

    @class MathUtilities.Components.EquationEngine
    **/
    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationStyleData = Backbone.Model.extend({

        /**
            Color of the plot and points
 
            @property _color
            @type {String}
            @private
        **/
        _color: null,

        /**
            Thickness of the hit area of plot and points
 
            @property _dragHitThickness
            @type {Number}
            @private
        **/
        _dragHitThickness: null,

        /**
            Color of the hit area of plot and points
 
            @property _dragHitColor
            @type {String}
            @private
        **/
        _dragHitColor: null,

        /**
            Visible opacity of plot and points
 
            @property _opacity
            @type {Number}
            @private
        **/
        _opacity: null,

        /**
            Thickness of plot and points
 
            @property _thickness
            @type {Number}
            @private
        **/
        _thickness: null,

        /**
            Thickness of plot and points on focus of the equation
 
            @property _thicknessOnFocus
            @type {Number}
            @private
        **/
        _thicknessOnFocus: null,

        /**
            Boolean whether the plot and points should be visible or not
 
            @property _visible
            @type {Boolean}
            @private
        **/
        _visible: null,

        /**
            Array of values of dash to be applied for plots and points
 
            @property _dashArray
            @type {Array}
            @private
        **/
        _dashArray: null,

        /**
            Boolean whether the plot should be closed at the end or not
 
            @property _closedPolygon
            @type {Boolean}
            @private
        **/
        _closedPolygon: null,

        /**
            Boolean whether the plot should be smoothen or not
 
            @property _smoothPolygon
            @type {Boolean}
            @private
        **/
        _smoothPolygon: null,

        _dragHitAlpha: null,

        /**

            Constructor function called on creation of new instance of EquationStyleData model
     
            @private
            @method initialize
        **/
        initialize: function initialize() {
            this._setInitialStyles();
        },

        /**
            Flushes all properties of the object and set them to their default values.
     
            @public
            @method flush
        **/
        flush: function flush() {
            this._setInitialStyles();
        },

        /**
            Getter function to get the color of the plot equation
     
            @public
            @method getColor
            @return {String} color
        **/
        getColor: function getColor() {
            return this._color;
        },

        /**
            Getter function to get the drag hit thickness of the plot equation
     
            @public
            @method getDragHitThickness
            @return {Number} thickness
        **/
        getDragHitThickness: function getDragHitThickness() {
            return this._dragHitThickness;
        },

        /**
            Getter function to get the drag hit color of the plot equation
     
            @public
            @method getDragHitColor
            @return {String} color
        **/
        getDragHitColor: function getDragHitColor() {
            return this._dragHitColor;
        },

        /**
            Getter function to get the opacity of the plot equation
     
            @public
            @method getOpacity
            @return {Number} opacity of the equation
        **/
        getOpacity: function getOpacity() {
            return this._opacity;
        },

        /**
            Getter function to get the thickness of the plot equation
     
            @public
            @method getThickness
            @return {Number} thickness of the equation
        **/
        getThickness: function getThickness() {
            return this._thickness;
        },

        /**
            Getter function to get the value of thickness on focus of the plot equation
     
            @public
            @method getThicknessOnFocus
            @return {Number} thickness on focus of the equation
        **/
        getThicknessOnFocus: function getThicknessOnFocus() {
            return this._thicknessOnFocus;
        },

        /**
            Check whether the plot of the equation is visible or not
     
            @public
            @method isVisible
            @return {Boolean} true or false
        **/
        getVisible: function getVisible() {
            return this._visible;
        },

        getPointVisibility: function getPointVisibility() {
            return this._visible.point;
        },

        getCurveVisibility: function getCurveVisibility() {
            return this._visible.curve;
        },

        /**
            Getter function to get the value of dashed array of the plot equation
     
            @public
            @method getDashArray
            @return {Array} dashed array of the equation
        **/
        getDashArray: function getDashArray() {
            return this._dashArray;
        },

        /**
            Check whether the plot of the equation is closed or not
     
            @public
            @method isClosedPolygon
            @return {Boolean} true or false
        **/
        isClosedPolygon: function isClosedPolygon() {
            return this._closedPolygon;
        },

        /**
            Check whether the plot of the equation has been smoothen or not.
     
            @public
            @method isSmoothPolygon
            @return {Boolean} true or false
        **/
        isSmoothPolygon: function isSmoothPolygon() {
            return this._smoothPolygon;
        },

        getDragHitAlpha: function getDragHitAlpha() {
            return this._dragHitAlpha;
        },

        /**
            Function to set the color for the plot of the equation
     
            @public
            @method setColor
            @param newColor{String} new color to be set
        **/
        setColor: function setColor(newColor) {
            this._color = newColor;
        },

        /**
            Function to set the thickness for the plot of the equation
     
            @public
            @method setDragHitThickness
            @param newThickness{Number} new color to be set
        **/
        setDragHitThickness: function setDragHitThickness(newThickness) {
            this._dragHitThickness = newThickness;
        },

        setDragHitColor: function setDragHitColor(newColor) {
            this._dragHitColor = newColor;
        },

        setOpacity: function setOpacity(newOpacity) {
            this._opacity = newOpacity;
        },

        setThickness: function setThickness(newThickness) {
            this._thickness = newThickness;
        },

        setThicknessOnFocus: function setThicknessOnFocus(newThickness) {
            this._thicknessOnFocus = newThickness;
        },

        setVisible: function setVisible(visibility) {
            if (typeof visibility === 'object') {
                this._visible = visibility;
            }
            else {
                this._visible.point = visibility;
                this._visible.curve = visibility
            }
        },

        setPointVisibility: function setPointVisibility(visibility) {
            this._visible.point = visibility;
        },

        setCurveVisibility: function setCurveVisibility(visibility) {
            this._visible.curve = visibility;
        },

        setDashArray: function setDashArray(newDashArray) {
            this._dashArray = newDashArray;
        },

        setClosedPolygon: function setClosedPolygon(isClosed) {
            this._closedPolygon = isClosed;
        },

        setSmoothPolygon: function setSmoothPolygon(isSmooth) {
            this._smoothPolygon = isSmooth;
        },

        setDragHitAlpha: function setDragHitAlpha(dragHitAlpha) {
            this._dragHitAlpha = dragHitAlpha;
        },

        /**
            Set properties to default values
     
            @public
            @method _setInitialStyles
        **/
        _setInitialStyles: function _setInitialStyles() {
            this._color = '#000000';
            this._dragHitThickness = 15;
            this._dragHitColor = '#ff0000';
            this._opacity = 1;
            this._thickness = 1;
            this._thicknessOnFocus = 3;
            this._visible = {
                point: true,
                curve: true
            };
            this._dashArray = [];
            this._closedPolygon = false;
            this._smoothPolygon = false;
            this._dragHitAlpha = 0;
        }

    }, {}),

    /**
    Class to create points data object to be used to store points related to plots

    @class MathUtilities.Components.EquationPointsData
    **/
    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationPointsData = Backbone.Model.extend({
        _leftArray: null,

        _points: null,

        _rightArray: null,

        _criticalPoints: null,

        _intersectionPoints: null,

        _inEqualityPlots: null,

        getLeftArray: function getLeftArray() {
            return this._leftArray;
        },

        getPoints: function getPoints() {
            return this._points;
        },

        getRightArray: function getRightArray() {
            return this._rightArray;
        },

        setLeftArray: function setLeftArray(leftArray) {
            this._leftArray = leftArray;
        },

        setPoints: function setPoints(points) {
            this._points = points;
        },

        setRightArray: function setRightArray(rightArray) {
            this._rightArray = rightArray;
        },
        getCriticalPoints: function getCriticalPoints() {
            return this._criticalPoints;
        },
        setCriticalPoints: function setCriticalPoints(criticalPoints) {
            this._criticalPoints = criticalPoints;
        },
        getIntersectionPoints: function getIntersectionPoints() {
            return this._intersectionPoints;
        },
        setIntersectionPoints: function setIntersectionPoints(intersectionPoints) {
            this._intersectionPoints = intersectionPoints;
        },

        getInEqualityPlots: function getInEqualityPlots() {
            return this._inEqualityPlots;
        },
        setInEqualityPlots: function setInEqualityPlots(inEqualityPlots) {
            this._inEqualityPlots = inEqualityPlots;
        },

        /**
            Flushes all properties of the object and set them to their default values.
     
            @public
            @method flush
        **/
        flush: function flush() {
            this._leftArray = null;
            this._points = null;
            this._rightArray = null;
        }

    }, {}),

    /**
    Class to create equation error data object for error related to equation

    @class MathUtilities.Components.EquationErrorData
    **/
    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationErrorData = Backbone.Model.extend({
        _errorCode: null,

        _errorData: null,

        _errorString: null,

        getErrorCode: function getErrorCode() {
            return this._errorCode;
        },

        getErrorData: function getErrorData() {
            return this._errorData;
        },

        getErrorString: function getErrorString() {
            return this._errorString;
        },

        setErrorCode: function setErrorCode(errorCode) {
            this._errorCode = errorCode;
        },

        setErrorData: function setErrorData(errorData) {
            this._errorData = errorData;
        },

        setErrorString: function setErrorString(errorString) {
            this._errorString = errorString;
        },

        initialize: function initialize() {
            this._errorData = [];
        },

        /**
            Flushes all properties of the object and set them to their default values.
     
            @public
            @method flush
        **/
        flush: function flush() {
            this._errorCode = null;
            this._errorData = null;
            this._errorString = null;
        }

    }, {}),

    /**
    Class to create equationData object to be used for plotting and parsing

    @class MathUtilities.Components.EquationEngine
    **/
    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationData = Backbone.Model.extend({

        /**
            Units that are used to for calculations and parsing of equation
 
            @property units
            @type {Object}
            @public
        **/
        _units: null,

        /**
            Equation Latex that is to be parsed
 
            @property latex
            @type {String}
            @public
        **/
        _latex: null,

        _style: null,

        _plotData: null,

        _parserData: null,

        _error: null,

        _pointsData: null,

        /**
            The value for the equation analysis information generated
     
            @property constants
            @type {Object}
            @public
        **/
        _analysis: null,

        /**
            This value when set will indicate that equationData will act as container for the values. The equation will not be processed and the data of FunctionCode and plot is fed from outside. This flag is used in Dynamic Geometry Tool. 
            @property constants
            @type {Object}
            @public
        **/
        _blind: false,

        _autonomous: undefined,

        /**
            The type of equation that is set while parsing the equation.
            eg. linear,quadratic,error,expression, polygon, point, plot
     
            @property specie
            @type {String}
            @public
        **/
        _specie: null,

        /**
            If someone wants to use equation as part of their data structure then this can be used as pointer to that data structure. Used in DGT engine.

            @property type
            @type {String}
            @public
        **/
        _parent: undefined,

        /**
            Will be array if two or more solutions, will be number if one, will be point if a point
     
            @property type
            @type {Number|Array}
            @public
        **/
        _solution: null,
        /**
           Saves profiling data . Used for debugging purpose. Saves values in milliseconds
 
            @property type
            @type {Number}
            @public
        **/
        _debugging: null,

        _id: null,

        /**

        Indicates whether the equationData is the saved data or new data.
            @property type
            @type {Boolean}
            @public
        */
        _isSaveRestoreData: false,

        /**

            Sets flags for special equation processing directives. 
            Currently available directives 
                FDFlagMethod : calculator*, graphing (based on tool name)

                *is default value

 
            @public
            @constant
        **/
        _directives: undefined,

        _prevLatex: null,

        _constants: null,

        /**

            Constructor function called on creation of new instance of EquationData model
     
            @private
            @method initialize
        **/
        initialize: function initialize() {
            this._units = {
                angle: 'rad'
            };
            //this.constants = {};
            //this.coordinateSystem = 'cartesian';
            this._debugging = {
                profiles: []
            };
            this._autonomous = false;
            this._specie = 'error';
            //this.drawStyle = { draggable: false, dragHitThickness: 15, dragHitColor: '#ff0000', dragHitAlpha: 0 };
            //this.bannerData = { bannerObject: null, visible: false, bannerText: '' };
            this._id = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.MathFunctions.getGUID();
            //console.log('guid is ' + this.id);
            //this._analysis = { rhsAuto: null, accText: null, order: null, FDFlag: null, functionCode: null };
            this._analysis = new MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationAnalysis();
            this._style = new MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationStyleData();
            this._plotData = new MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.PlotData();

            this._parserData = new MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.ParserData();

            this._error = new MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationErrorData();

            this._pointsData = new MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationPointsData();
            //this.labelData = { text: 'A', visible: false, labelObject: null };
            this._directives = {
                'FDFlagMethod': 'calculator',
                definedConstant: null,
                range: null
            };
        },

        /**

            Returns equation String
     
            @public
            @method toString
            @return {String} Equation
        **/
        toString: function toString() {
            return this.getLatex();
        },


        /**

            Sets latex string in the equationData object and triggers 'change-equation' event
     
            @public
            @method setLatex
            @param equationLatex{String} The latex string to be set as equation
            @return void
        **/
        setLatex: function setLatex(latex, supressEvent) {
            this._latex = latex;
            if (!supressEvent) {
                this.trigger('change-equation');
            }
        },
        getLatex: function getLatex() {
            return this._latex;
        },

        getAccText: function getAccText() {
            return this._analysis.getAccText();
        },

        setAccText: function setAccText(accText) {
            this._analysis.setAccText(accText)
        },

        addToAccText: function addToAccText(accText) {
            this._analysis.addToAccText(accText);
        },

        getFreeVars: function getFreeVars() {
            return this._analysis.getFreeVars();
        },

        setFreeVars: function setFreeVars(freeVars) {
            this._analysis.setFreeVars(freeVars);
        },

        getFunctionVariable: function getFunctionVariable() {
            return this._analysis.getFunctionVariable()
        },

        setFunctionVariable: function setFunctionVariable(functionVariable) {
            this._analysis.setFunctionVariable(functionVariable);
        },

        getParamVariable: function getParamVariable() {
            return this._analysis.getParamVariable()
        },

        setParamVariable: function setParamVariable(paramVariable) {
            this._analysis.setParamVariable(paramVariable);
        },

        setFdFlag: function setFdFlag(fdFlag) {
            this._analysis.setFdFlag(fdFlag);
        },

        getFdFlag: function getFdFlag() {
            return this._analysis.getFdFlag();
        },

        getLeftRoot: function getLeftRoot() {
            return this._parserData.getLeftRoot();
        },

        getRightRoot: function getRightRoot() {
            return this._parserData.getRightRoot();
        },

        setLeftRoot: function setLeftRoot(leftRoot) {
            return this._parserData.setLeftRoot(leftRoot);
        },

        setRightRoot: function setRightRoot(rightRoot) {
            return this._parserData.setRightRoot(rightRoot);
        },

        setFunctionCode: function setFunctionCode(functionCode) {
            this._analysis.setFunctionCode(functionCode);
        },

        getFunctionCode: function getFunctionCode() {
            return this._analysis.getFunctionCode();
        },

        getA: function getA() {
            return this._analysis.getA();
        },

        getB: function getB() {
            return this._analysis.getB();
        },

        getC: function getC() {
            return this._analysis.getC();
        },
        setA: function setA(a) {
            this._analysis.setA(a);
        },

        setB: function setB(b) {
            this._analysis.setB(b);
        },

        setC: function setC(c) {
            this._analysis.setC(c);
        },

        getParamVariableOrder: function getParamVariableOrder() {
            return this._analysis.getParamVariableOrder();
        },

        setParamVariableOrder: function setParamVariableOrder(paramVariableOrder) {
            this._analysis.setParamVariableOrder(paramVariableOrder);
        },

        getLeftEquationParameters: function getLeftEquationParameters() {
            return this._parserData.getLeftEquationParameters();
        },

        getRightEquationParameters: function getRightEquationParameters() {
            return this._parserData.getRightEquationParameters();
        },

        getAllConstants: function getAllConstants() {
            var returnArray,
                leftConstants = this._parserData.getLeftEquationParameters().constantsList,
                rightConstants = this._parserData.getRightEquationParameters().constantsList;

            returnArray = _.union(leftConstants, rightConstants);
            return returnArray;
        },

        setPlot: function setPlot(plot) {
            this._plotData.setPlot(plot);
        },

        getPlot: function getPlot() {
            return this._plotData.getPlot();
        },

        getBestFit: function getBestFit() {
            return this._plotData.getBestFit();
        },

        setBestFit: function setBestFit(bestFit) {
            return this._plotData.setBestFit(bestFit);
        },

        getThicknessOnFocus: function getThicknessOnFocus() {
            return this._style.getThicknessOnFocus();
        },

        setThicknessOnFocus: function setThicknessOnFocus(thickness) {
            return this._style.setThicknessOnFocus(thickness);
        },

        setInEqualityType: function setInEqualityType(inEqualityType) {
            this._analysis.setInEqualityType(inEqualityType);
        },

        getInEqualityType: function getInEqualityType() {
            return this._analysis.getInEqualityType();
        },

        getInEqualityPlots: function getInEqualityPlots() {
            return this._pointsData.getInEqualityPlots();
        },
        setInEqualityPlots: function setInEqualityPlots(inEqualityPlots) {
            this._pointsData.setInEqualityPlots(inEqualityPlots);
        },

        setInEqualititesPathGroup: function setInEqualititesPathGroup(group) {
            this._plotData.setInEqualititesPathGroup(group);
        },

        getInEqualititesPathGroup: function getInEqualititesPathGroup() {
            return this._plotData.getInEqualititesPathGroup();
        },
        getDefinedConstant: function getDefinedConstant() {
            return this._directives.definedConstant;
        },
        setDefinedConstant: function setDefinedConstant(constant) {
            this._directives.definedConstant = constant;
        },

        reverseInequality: function reverseInequality() {
            var inEqualityType = this.getInEqualityType();
            switch (inEqualityType) {
                case 'lesser':
                    this.setInEqualityType('>');
                    break;
                case 'greater':
                    this.setInEqualityType('<');
                    break;
                case 'ltequal':
                    this.setInEqualityType('\\ge');
                    break;
                case 'gtequal':
                    this.setInEqualityType('\\le');
                    break;
            }
        },

        /**

            Sets constants value for the constant object of equationData object and triggers 'change-constants' event
     
            @public
            @method setConstants
            @param constants{Object} The constants object for the current equation
            @return void
        **/
        setConstants: function setConstants(constants, supressEvent) {
            //            var constant = null;
            //            for (constant in constants) {
            //                this.constants[constant] = constants[constant];
            //            }
            this._constants = constants;
            if (!supressEvent) {
                this.trigger('change-constants');
            }
        },

        getConstants: function getConstants() {
            return this._constants;
        },

        getProfiles: function getProfiles() {
            return this._debugging.profiles;
        },

        getEquationParameters: function getEquationParameters() {
            return this._analysis.getEquationParameters();
        },

        setCanBeSolved: function setCanBeSolved(canBeSolved) {
            this._analysis.setCanBeSolved(canBeSolved);
        },

        isCanBeSolved: function isCanBeSolved() {
            return this._analysis.isCanBeSolved();
        },

        setPivot: function setPivot(pivot) {
            this._analysis.setPivot(pivot);
        },

        getPivot: function getPivot() {
            return this._analysis.getPivot();
        },

        setErrorCode: function setErrorCode(errorCode) {
            this._error.setErrorCode(errorCode);
        },

        getErrorCode: function getErrorCode() {
            return this._error.getErrorCode();
        },

        setErrorData: function setErrorData(errorData) {
            this._error.setErrorData(errorData);
        },

        getErrorData: function getErrorData() {
            return this._error.getErrorData();
        },

        setErrorString: function setErrorString(errorString) {
            this._error.setErrorString(errorString);
        },

        getErrorString: function getErrorString() {
            return this._error.getErrorString();
        },

        getLeftExpression: function getLeftExpression() {
            return this._parserData.getLeftExpression();
        },

        getRightExpression: function getRightExpression() {
            return this._parserData.getRightExpression();
        },

        getRange: function getRange() {
            return this._directives.range;
        },

        setRange: function setRange(range) {
            this._directives.range = range;
        },

        /**

            Sets Units value for the units object of equationData object
     
            @public
            @method setunits
            @param units{Object} The units object for the current equation
            @return void
        **/
        setUnits: function setUnits(units) {
            var unit = null;
            for (unit in units) {
                this._units[unit] = units[unit];
            }
        },
        getUnits: function getUnits() {
            return this._units;
        },

        setAnalysis: function setAnalysis(analysis) {
            this._analysis = analysis;
        },
        getAnalysis: function getAnalysis() {
            return this._analysis;
        },
        setSpecie: function setSpecie(specie) {
            this._specie = specie;
        },
        getSpecie: function getSpecie() {
            return this._specie;
        },
        setBlind: function setBlind(blind) {
            this._blind = blind;
        },
        getBlind: function getBlind() {
            return this._blind;
        },
        setAutonomous: function setAutonomous(autonomous) {
            this._autonomous = autonomous;
        },
        getAutonomous: function getAutonomous() {
            return this._autonomous;
        },
        setParent: function setParent(parent) {
            this._parent = parent;
        },
        getParent: function getParent() {
            return this._parent;
        },
        setSolution: function setSolution(solution) {
            this._solution = solution;
        },
        getSolution: function getSolution() {
            return this._solution;
        },
        setDebugging: function setDebugging(debugging) {
            this._debugging = debugging;
        },
        getDebugging: function getDebugging() {
            return this._debugging;
        },
        setId: function setId(id) {
            this._id = id;
        },
        getId: function getId() {
            return this._id;
        },
        setIsSaveRestoreData: function setIsSaveRestoreData(isSaveRestoreData) {
            this._isSaveRestoreData = isSaveRestoreData;
        },
        getIsSaveRestoreData: function getIsSaveRestoreData() {
            return this._isSaveRestoreData;
        },
        setDirectives: function setDirectives(directives) {
            this._directives = directives;
        },
        getDirectives: function getDirectives() {
            return this._directives;
        },

        setStyle: function setStyle(style) {
            this._style = style;
        },
        getStyle: function getStyle() {
            return this._style;
        },

        setPlotData: function setPlotData(plotData) {
            this._plotData = plotData;
        },
        getPlotData: function getPlotData() {
            return this._plotData;
        },

        setParserData: function setParserData(parserData) {
            this._parserData = parserData;
        },
        getParserData: function getParserData() {
            return this._parserData;
        },

        setError: function setError(error) {
            this._error = error;
        },
        getError: function getError() {
            return this._error;
        },

        setPointsData: function setPointsData(points) {
            this._pointsData = points;
        },
        getPointsData: function getPointsData() {
            return this._pointsData;
        },
        getCid: function getCid() {
            return this.cid;
        },
        setColor: function setColor(color) {
            this._style.setColor(color);
        },
        getColor: function getColor() {
            return this._style.getColor();
        },
        setThickness: function setThickness(thickness) {
            this._style.setThickness(thickness);
        },
        getThickness: function getThickness() {
            return this._style.getThickness();
        },
        setOpacity: function setOpacity(opacity) {
            this._style.setOpacity(opacity);
        },
        getOpacity: function getOpacity() {
            return this._style.getOpacity();
        },
        setDashArray: function setDashArray(dash) {
            this._style.setDashArray(dash);
        },
        getDashArray: function getDashArray() {
            return this._style.getDashArray();
        },
        setVisible: function setVisible(visiblity) {
            this._style.setVisible(visiblity);
        },
        getVisible: function getVisible() {
            return this._style.getVisible();
        },
        setDraggable: function setDraggable(draggable) {
            this._plotData.setDraggable(draggable);
        },
        isDraggable: function isDraggable() {
            return this._plotData.isDraggable();
        },
        setDragHitThickness: function setDragHitThickness(thickness) {
            this._style.setDragHitThickness(thickness);
        },
        getDragHitThickness: function getDragHitThickness() {
            return this._style.getDragHitThickness();
        },
        getDragHitColor: function getDragHitColor() {
            return this._style.getDragHitColor();
        },
        getDragHitAlpha: function getDragHitAlpha() {
            return this._style.getDragHitAlpha();
        },
        getPointsGroup: function getPointsGroup() {
            return this._plotData.getPointsGroup();
        },
        setPointsGroup: function setPointsGroup(group) {
            this._plotData.setPointsGroup(group);
        },
        setLabelData: function setLabelData(labelData) {
            this._plotData.setLabelData(labelData);
        },
        getLabelData: function getLabelData() {
            return this._plotData.getLabelData();
        },
        getBannerData: function getBannerData() {
            return this._plotData.getBannerData();
        },
        setBannerData: function setBannerData(bannerData) {
            this._plotData.setBannerData(bannerData);
        },
        getPathGroup: function getPathGroup() {
            return this._plotData.getPathGroup();
        },
        setPathGroup: function setPathGroup(group) {
            this._plotData.setPathGroup(group);
        },

        getRaster: function getRaster() {
            return this._plotData.getRaster();
        },

        setRaster: function setRaster(raster) {
            this._plotData.setRaster(raster);
        },

        getLeftArray: function getLeftArray() {
            return this._pointsData.getLeftArray();
        },
        setLeftArray: function setLeftArray(leftArray) {
            this._pointsData.setLeftArray(leftArray);
        },
        getRightArray: function getRightArray() {
            return this._pointsData.getRightArray();
        },
        setRightArray: function setRightArray(rightArray) {
            this._pointsData.setRightArray(rightArray);
        },


        getPoints: function getPoints() {
            return this._pointsData.getPoints();
        },
        setPoints: function setPoints(points) {
            this._pointsData.setPoints(points);
        },

        getRayPolygon: function getRayPolygon() {
            return this._plotData.getRayPolygon();
        },
        setRayPolygon: function setRayPolygon(rayPolygon) {
            this._plotData.setRayPolygon(rayPolygon);
        },
        setClosedPolygon: function setClosedPolygon(isClosed) {
            this._style.setClosedPolygon(isClosed);
        },
        isClosedPolygon: function isClosedPolygon() {
            return this._style.isClosedPolygon();
        },
        setSmoothPolygon: function setSmoothPolygon(isSmooth) {
            this._style.setSmoothPolygon(isSmooth);
        },
        isSmoothPolygon: function isSmoothPolygon() {
            return this._style.isSmoothPolygon();
        },
        getRhsAuto: function getRhsAuto() {
            return this._analysis.getRhsAuto();
        },

        setRhsAuto: function setRhsAuto(rhsAuto) {
            this._analysis.setRhsAuto(rhsAuto);
        },
        getPlotSessionCount: function getPlotSessionCount() {
            return this._plotData.getPlotSessionCount();
        },
        setPlotSessionCount: function setPlotSessionCount(count) {
            this._plotData.setPlotSessionCount(count);
        },

        getPointVisibility: function getPointVisibility() {
            return this._style.getPointVisibility();
        },

        getCurveVisibility: function getCurveVisibility() {
            return this._style.getCurveVisibility();
        },

        setPointVisibility: function setPointVisibility(visibility) {
            this._style.setPointVisibility(visibility);
        },

        setCurveVisibility: function setCurveVisibility(visibility) {
            this._style.setCurveVisibility(visibility);
        },
        getCriticalPoints: function getCriticalPoints() {
            return this._pointsData.getCriticalPoints();
        },
        setCriticalPoints: function setCriticalPoints(criticalPoints) {
            this._pointsData.setCriticalPoints(criticalPoints);
        },
        getIntersectionPoints: function getIntersectionPoints() {
            return this._pointsData.getIntersectionPoints();
        },
        setIntersectionPoints: function setIntersectionPoints(intersectionPoints) {
            this._pointsData.setIntersectionPoints(intersectionPoints);
        },

        setPrevLatex: function setPrevLatex(latex) {
            this._prevLatex = latex;
        },

        getPrevLatex: function getPrevLatex() {
            return this._prevLatex;
        },

        flushAnalysis: function flushAnalysis() {
            this._analysis.flush();
        },

        flushError: function flushError() {
            this._error.flush();
        },

        flushParserData: function flushParserData() {
            this._parserData.flush();
        },

        flushPlotData: function flushPlotData() {
            this._plotData.flush();
        },

        /**

            Sets color value for the plot of the current equationData object and triggers 'change-color' event
     
            @public
            @method changeColor
            @param color{String} color code or color name
            @return void
        **/
        changePointsColor: function changePointsColor(color, supressEvent) {
            this._style.setColor(color);
            if (!supressEvent) {
                this.trigger('change-points-color');
            }
        },
        changeColor: function changeColor(color, supressEvent) {
            this._style.setColor(color);
            if (!supressEvent) {
                this.trigger('change-color');
            }
        },

        /**
            Changes the thickness of the equation plotted. The maximum value of thickness is 8 and minimum is 1.
           
            @public
            @method changeThickness
            @param thickness{String} plus for increasing thickness, minus for decreasing thickness.
            @return void
         
        **/
        changeThickness: function changeThickness(thickness, supressEvent) {
            //if(equationData.expression !== undefined) {
            //            if (thickness === 'plus') {
            //                if (this.thickness < MathUtilities.Components.EquationEngine.Models.EquationData.maxThickness) {
            //                    this.thickness += 1;
            //                }
            //            }
            //            else {
            //                if (this.thickness > MathUtilities.Components.EquationEngine.Models.EquationData.minThickness) {
            //                    this.thickness -= 1;
            //                }
            //            }
            this._style.setThickness(thickness);
            this._style.setThicknessOnFocus(thickness + 1);
            if (!supressEvent) {
                this.trigger('change-thickness');
            }
            //  }
        },
        changeVisibility: function changeVisibility(bVisible) {
            this.setVisible(bVisible);
            this.trigger('change-visibility');
        },
        removePathGroup: function removePathGroup(){
            this._plotData.removePathGroup();
        },
        /**

            Hides the plot for the current Equation
     
            @public
            @method hideGraph
            @return void
        **/
        hideGraph: function hideGraph() {
            //            this.opacity = 0;
            //            this.pathGroup.opacity = 0;
            var pathGroup = this.getPathGroup(),
                pointsGroup = this.getPointsGroup(),
                noOfChildren,
                pathCounter,
                criticalPoints = this.getCriticalPoints();
            if (pathGroup !== null) {
                pathGroup.visible = false;
            }
            if (pointsGroup !== null) {
                noOfChildren = pointsGroup.children.length;
                for (pathCounter = 0; pathCounter < noOfChildren; pathCounter++) {
                    pointsGroup.children[pathCounter].visible = false;
                }
                pointsGroup.visible = false;
            }
            if (criticalPoints !== null && criticalPoints.getPointsGroup() !== null) {
                pointsGroup = criticalPoints.getPointsGroup();
                noOfChildren = pointsGroup.children.length;
                for (pathCounter = 0; pathCounter < noOfChildren; pathCounter++) {
                    pointsGroup.children[pathCounter].visible = false;
                }
                pointsGroup.visible = false;
            }
            this.setVisible(false);
        },

        /**
            Unhide or shows the plot for the current Equation
     
            @public
            @method showGraph
            @return void
        **/
        showGraph: function showGraph() {
            //            this.opacity = 1;
            //            this.pathGroup.opacity = 1;
            var pathGroup = this.getPathGroup(),
                pointsGroup = this.getPointsGroup(),
                pathCounter,
                noOfChildren,
                criticalPoints = this.getCriticalPoints();
            this.setVisible(true);
            if (pathGroup !== null) {
                pathGroup.visible = true;
            }
            if (pointsGroup !== null) {
                noOfChildren = pointsGroup.children.length;
                for (pathCounter = 0; pathCounter < noOfChildren; pathCounter++) {
                    pointsGroup.children[pathCounter].visible = true;
                }
                pointsGroup.visible = true;
            }
            if (criticalPoints !== null && criticalPoints.getPointsGroup() !== null) {
                pointsGroup = criticalPoints.getPointsGroup();
                noOfChildren = pointsGroup.children.length;
                for (pathCounter = 0; pathCounter < noOfChildren; pathCounter++) {
                    pointsGroup.children[pathCounter].visible = true;
                }
                pointsGroup.visible = true;
            }
        },

        /**
            Toggles plot visibility
     
            @public
            @method toggleGraphView
            @return void
        **/
        toggleGraphView: function toggleGraphView() {
            if (this.getCurveVisibility()) {
                this.hideGraph();
            }
            else {
                this.showGraph();
            }
        },

        /**
           Changes plot to dashed plot
    
           @public
           @method dashedGraph
           @return void
       **/
        dashedGraph: function dashedGraph() {
            if (this.getSpecie() === 'point') {
                var pointsGroup = this.getPointsGroup()
                this.pointsGroup.strokeColor = this.getColor();
                this.pointsGroup.fillColor = '#ffffff';
            }
            else {
                this.getPathGroup().dashArray = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationData.DASHED_ARRAY;
            }
            this.setDashArray(MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationData.DASHED_ARRAY);
        },

        /**
           Changes plot to normal plot from dashed plot
    
           @public
           @method normalGraph
           @return void
       **/
        normalGraph: function normalGraph() {
            if (this.getSpecie() === 'point') {
                this.getPointsGroup().fillColor = this.getColor();
                var labelData = this.getLabelData();
                if (labelData.labelObject) {
                    labelData.labelObject.fillColor = this.getColor();
                }
            }
            else {
                this.getPathGroup().dashArray = [];
            }
            this.setDashArray([]);
        },

        /**
            Toggles plot between normal plot and dashed plot
     
            @public
            @method toggleDashedGraph
            @return void
        **/
        toggleDashedGraph: function toggleDashedGraph() {
            if (this.getDashArray().length !== 0) {
                this.normalGraph();
            }
            else {
                this.dashedGraph();
            }
        },
        /**
            Returns JSON data of the model
     
            @public
            @method getData
            @return {Object}
        **/
        getData: function getData() {
            var data = {},
            bounds;
            data.equation = this.getLatex();
            data.color = this.getColor();
            data.thickness = this.getThickness();
            data.styleType = this.styleType;
            data.visible = this.getVisible();
            data.points = this.getPoints();
//TODO::: verify
         //   data.labelText = this.labelData.text;
            //data.position = this.labelData.position;
           // data.labelVisibility = this.labelData.visible;
            // data.isSaveRestoreData = true;
            return data;
        },
        /**
            Sets given JSON data to the model
     
            @public
            @method setData
            @param data {Object} JSON object to be set
            @return void
        **/
        setData: function setData(data) {
            var bounds;
            this.setLatex(data.equation);
            this.setColor(data.color);
            this.setThickness(data.thickness);
            this.styleType = data.styleType;
            this.setVisible(data.visible);
            this.setPoints(data.points);
            this.isSaveRestoreData = true;
            this.labelData = {};
            this.labelData.text = data.labelText;
            this.labelData.position = data.position;
            this.labelData.visible = data.labelVisibility;
        },

        /**
        * removePlottedGraph removes plotted graph
        * @method removePlottedGraph
        * @return void
        */
        removePlottedGraph: function removePlottedGraph() {
            if (this.pathGroup) {
                this.pathGroup.remove();
            }
        },

        /**
        * flushData clears all data from equationData
        * @method flushData
        * @return void
        */
        flushData: function flushData() {
            delete this.A;
            delete this.B;
            delete this.C;
            delete this.errorCode;
            delete this.errorData;
            delete this.errorString;
            delete this.freeVars;
            delete this.functionVariable;
            delete this.isPolar;
            delete this.leftExpresstion;
            delete this.leftRoot;
            delete this.rightExpresstion;
            delete this.rightRoot;
            delete this.points;
            delete this.solution;
            delete this.type;
        }

    }, {
        /**
        Specifies the value of dash length and the blank space length for dashed plot
     
        @property DASHED_ARRAY
        @type {Array}
        @static
        @default [10, 4]
        **/
        DASHED_ARRAY: [10, 4],

        /**
        Specifies the minimum value of thickness possible.

        @property minThickness
        @type {Number}
        @static
        @default 1
        **/
        minThickness: 1,

        /**
        Specifies the maximum value of the thickness possible.
       
        @property maxThickness
        @type {Number}
        @static
        @default 8
        **/
        maxThickness: 8
    }),

    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.ParserAssist = Backbone.Model.extend({}, {

        getEquationAccessibility: function getEquationAccessibility(equationString) {
            MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Productions.init();

            var equationData = new MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationData(), strText;
            equationData.setLatex(equationString,true);

            MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Parser.parseEquation(equationData);

            strText = equationData.getAccText();
            equationData = null;
            return strText;
        }

    }),

    /**
    Class to parse and plot the equations

    @class MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine
    **/
    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Parser = Backbone.Model.extend({}, {
        /**
        Flag that tells if the api is running in test mode or deploy mode
     
        @property _deploy
        @type Boolean
        @private
        @static
        @default "true"
        **/
        _deploy: true,


        /**

        List of Mathematical constants used in the EquationEngine
     
        @property _constants
        @private
        @static
        @type Object
        **/

        _constants: {
            '\\pi': Math.PI,
            'e': Math.E
        },

        _debugFlag: {
            tokens: false,
            rules: false,
            tree: false,
            power: false,
            simplify: false,
            expand: false,
            convert2q: false,
            solve: false,
            plot: false,
            info: false,
            common: false,
            error: false
        },

        _INVERSIBLE_FUNCTIONS: ['\\sin^{-1}', '\\cos^{-1}', '\\tan^{-1}', '\\cot^{-1}', '\\csc^{-1}', '\\sec^{-1}', '\\sinh^{-1}', '\\cosh^{-1}', '\\tanh^{-1}', '\\coth^{-1}', '\\csch^{-1}', '\\sech^{-1}'],
        _INVERT_FUNCTIONS_IN_ORDER: ['\\arcsin', '\\arccos', '\\arctan', '\\arccot', '\\arccsc', '\\arcsec', '\\arsinh', '\\arcosh', '\\artanh', '\\arcoth', '\\arcsch', '\\arsech'],

        _productions: MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Productions,
        _mathFunctions: MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.MathFunctions,

        _NSTYLE: 'background: #c00; color: #fff',
        _HSTYLE: 'background: #cc0; color: #fff',
        _BLUE_STYLE: 'background: #004; color: #fff',
        _YSTYLE: 'background: #0c0; color: #fff',
        _borderColor: '#C1C1C1',
        /**

        Function to check whether a string is empty
     
        @private
        @method _isBlank
        @param stringToCheck{String} string to be checked if it is empty
        @return {Boolean} true if empty else false
        @static
        **/
        _isBlank: function _isBlank(stringToCheck) {
            if (stringToCheck === undefined) {
                return false;
            }
            stringToCheck = stringToCheck.trim();
            return stringToCheck === '';
        },

        /**
              Function process latex if it contains sum product case. It converts \sum_{n=1}^1x to \sum_{n}{1}{1}{x}
       
              @private
              @method _preProcessLatexSumProduct
              @param lastValue{String} Substring of the last value in the \sum or \prod case.
              @param lastValueRequired Substring of the last value required.
              @param $1 Substring of the first match(either \sum or \prod).
              @param match1 Substring of the second match.
              @param match2 Substring of the third match.
              @param match3 Substring of the fourth match.
              @param match3 Substring of the fifth match.
              @return {String} processed latex string
              @static
          **/
        _preProcessLatexSumProduct: function _preProcessLatexSumProdct(lastValue, lastValueRequired, $1, match1, match2, match3, match4) {
            var counter,
             bracketCounter = 0,
             isPivotError;
            for (counter = 0; counter < lastValue.length; counter++) {
                if (lastValue.charAt(counter) === ')') {
                    if (bracketCounter === 0) {
                        if (lastValue.charAt(0) === '(') {
                            lastValueRequired = lastValue.substring(1, counter - 1);
                            break;
                        }
                        else {
                            lastValueRequired = lastValue.substring(0, counter);
                            break;
                        }
                    }
                    else {
                        bracketCounter--;
                    }
                }
                else if (lastValue.charAt(counter) === '(') {
                    bracketCounter++;
                }
            }
            if (match4 === undefined || match4 === '') {
                if (match2.indexOf(match1) !== -1 || match3.indexOf(match1) !== -1) {
                    isPivotError = true;
                }
                return ($1 + '{' + match1 + '}{' + match2 + '}{' + match3 + '}{' + lastValueRequired + '}' + lastValue.substring(counter, lastValue.length));
            }
            else {
                if (match2.indexOf(match1) !== -1 || match4.indexOf(match1) !== -1) {
                    isPivotError = true;
                }
                return ($1 + '{' + match1 + '}{' + match2 + '}{' + match4 + '}{' + lastValueRequired + '}' + lastValue.substring(counter, lastValue.length));
            }
        },

        /**
              Function process latex if it contains sum product case. It converts \sum_{n=1}^1x to \sum_{n}{1}{1}{x}
       
              @private
              @method _preProcessSumProductCase
              @param latexString{String} Latex string
              @param equationData{Object} The equation data model object
              @return {String} processed latex string
              @static
          **/
        _preProcessSumProductCase: function _preProcessSumProductCase(latexString, equationData) {
            if (latexString === undefined || latexString === null) {
                return;
            }
            //equationData.pivot = undefined;
            var lastValue,
                lastValueRequired,
                strCounter,
                counterRegex = /(\\sum)|(\\prod)/g,
                count,
                constantsRegex = /^[a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|z|A-Z]$/,
                sumIndex,
                latexStringLength,
                sumProdLength,
                //pivotIndex,
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                isPivotError = false,
                sumReplaceRegex = /(\\sum|\\prod)[\_][\{]([A-Za-z])[\=]([0-9a-zA-Z\+\_\.\-\\{}()\[\]\^\!]+)([\}])[\^]([0-9A-Za-z]|[\{](([\{][0-9a-zA-Z\+\_\.\-\\()\[\]\^\!][\}])+|[0-9a-zA-Z\+\_\.\-\\()\[\]\^\!]+)[\}])([\(]([0-9a-zA-Z\s\+\_\.\-\\{}()\[\]\^\!]+)[\)])/g,
                sumReplaceRegex1 = /(\\sum|\\prod)[\_][\{]([A-Za-z])[\=]([0-9a-zA-Z\+\_\.\-\\{}()\[\]\^\!]+)([\}])[\^]([0-9A-Za-z]|[\{](([\{][0-9a-zA-Z\+\_\.\-\\()\[\]\^][\}])+|[0-9a-zA-Z\+\_\.\-\\()\[\]\^\!]+)[\}])([0-9a-zA-Z\s\+\_\.\-\\{}()\[\]\^\!]+)/g,
                sumReplaceRegex2 = /(\\sum|\\prod)[\^]([0-9A-Za-z]|[\{](([\{][0-9a-zA-Z\+\_\.\-\\()\[\]\^\!][\}])+|[0-9a-zA-Z\+\_\.\-\\()\[\]\^\!]+)[\}])[\_][\{]([A-Za-z])[\=]([0-9a-zA-Z\+\_\.\-\\{}()\[\]\^\!]+)([\}])([\(]([0-9a-zA-Z\+\_\.\-\\{}()\[\]\^]+)[\)])[^\^]/g,
                sumReplaceRegex3 = /(\\sum|\\prod)[\^]([0-9A-Za-z]|[\{](([\{][0-9a-zA-Z\+\_\.\-\\()\[\]\^\!][\}])+|[0-9a-zA-Z\+\_\.\-\\()\[\]\^\!]+)[\}])[\_][\{]([A-Za-z])[\=]([0-9a-zA-Z\+\_\.\-\\{}()\[\]\^\!]+)([\}])([0-9a-zA-Z\+\_\.\-\\{}()\[\]\^]+)/g,

                replaceRegexFunction1 = function ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
                    $9 = null;
                    equationData.setPivot($2);
                    lastValue = $8;
                    lastValueRequired = lastValue.substring(1, lastValue.length - 1);
                    return nameSpace.Parser._preProcessLatexSumProduct(lastValue, lastValueRequired, $1, $2, $3, $5, $6);
                },
                replaceRegexFunction2 = function ($0, $1, $2, $3, $4, $5, $6, $7, $8) {
                    equationData.setPivot($2);
                    lastValue = $8;
                    lastValueRequired = lastValue;
                    return nameSpace.Parser._preProcessLatexSumProduct(lastValue, lastValueRequired, $1, $2, $3, $5, $6);
                },
                replaceRegexFunction3 = function ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
                    equationData.setPivot($5);
                    lastValue = $9;
                    lastValueRequired = lastValue.substring(0, lastValue.length);
                    return nameSpace.Parser._preProcessLatexSumProduct(lastValue, lastValueRequired, $1, $5, $6, $2, $3);
                },
                replaceRegexFunction4 = function ($0, $1, $2, $3, $4, $5, $6, $7, $8) {
                    equationData.setPivot($5);
                    lastValue = $8;
                    lastValueRequired = lastValue.substring(0, lastValue.length);
                    return nameSpace.Parser._preProcessLatexSumProduct(lastValue, lastValueRequired, $1, $5, $6, $2, $3);
                };
            if (latexString.match(counterRegex) !== null) {
                count = latexString.match(counterRegex).length;
            }
            else {
                count = 0;
            }
            for (strCounter = 0; strCounter < count; strCounter++) {
                latexString = latexString.replace(sumReplaceRegex, replaceRegexFunction1);

                latexString = latexString.replace(sumReplaceRegex1, replaceRegexFunction2);

                latexString = latexString.replace(sumReplaceRegex2, replaceRegexFunction3);


                latexString = latexString.replace(sumReplaceRegex3, replaceRegexFunction4);

            }
            if (isPivotError) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return;
            }
            if (equationData.getPivot() === null) {
                sumIndex = latexString.indexOf('\\sum');
                if (sumIndex !== -1) {
                    sumProdLength = '\\sum';
                    sumProdLength = sumProdLength.length;
                    //pivotIndex = sumIndex + sumProdLength + 1;
                    //equationData.pivot = latexString.charAt(pivotIndex);
                }
                else {
                    sumIndex = latexString.indexOf('\\prod');
                    if (sumIndex !== -1) {
                        sumProdLength = '\\prod';
                        sumProdLength = sumProdLength.length + 1;
                        //pivotIndex = sumIndex + sumProdLength;
                        //equationData.pivot = latexString.charAt(pivotIndex);
                    }
                }
                if (sumIndex !== -1) {
                    latexStringLength = latexString.length;
                    for (strCounter = sumIndex + sumProdLength; strCounter < latexStringLength; strCounter++) {
                        if (latexString.charAt(strCounter).match(constantsRegex) !== null) {
                            if (latexString.charAt(strCounter + 1) === '=') {
                                equationData.setPivot(latexString.charAt(strCounter));
                                break;
                            }
                        }
                    }
                }
            }
            return latexString;
        },


        _checkSumProductCase: function _checkSumProductCase(latex, equationData) {
            var charCounter,
                latexLength = latex.length,
                sumProdOccurred = false,
                checkingLowerLimit = false,
                checkingUpperLimit = false,
                currentChar,
                useEquation = false,
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                bracketCounter = 0,
                lowerLimit = '',
                upperLimit = '',
                upperLimitDone = false,
                lowerLimitDone = false,
                lowerLimitSplit,
                addToLatex = '',
                sumProductEquation = '',
                sumIndex,
                prodIndex,
                returnLatex = '';
            for (charCounter = 0; charCounter < latexLength; charCounter++) {
                currentChar = latex.charAt(charCounter);
                if (sumProdOccurred === true) {
                    if (bracketCounter === 0 && lowerLimitDone === false && currentChar === '_') {
                        checkingLowerLimit = true;
                        checkingUpperLimit = false;

                    }
                    else if (bracketCounter === 0 && upperLimitDone === false && currentChar === '^') {
                        checkingLowerLimit = false;
                        checkingUpperLimit = true;
                    }
                    else {
                        if (nameSpace.ParsingProcedures._isOpeningBracket(currentChar)) {
                            bracketCounter++;
                        }
                        else if (nameSpace.ParsingProcedures._isClosingBracket(currentChar)) {
                            bracketCounter--;
                        }
                        if (checkingLowerLimit === true) {
                            lowerLimit += currentChar;
                            if (bracketCounter === 0) {
                                lowerLimitDone = true;
                                checkingLowerLimit = false;
                            }
                        }
                        else if (checkingUpperLimit === true) {
                            upperLimit += currentChar;
                            if (bracketCounter === 0) {
                                upperLimitDone = true;
                                checkingUpperLimit = false;
                            }
                        }
                        else {
                            if ((bracketCounter === 0 && currentChar === '+')) {
                                sumProdOccurred = false;
                                useEquation = false;
                                addToLatex = currentChar;
                                continue;
                            }
                            else if (bracketCounter === -1) {
                                if (charCounter === latexLength - 1) {
                                    sumProdOccurred = true;
                                }
                                else {
                                    sumProdOccurred = false;
                                }
                                useEquation = false;
                                addToLatex = currentChar;
                                continue;
                            }

                            sumProductEquation += currentChar;
                            sumIndex = sumProductEquation.lastIndexOf('\\sum');
                            if (sumIndex !== -1 && sumIndex === sumProductEquation.length - 4) {
                                equationData.setCanBeSolved(false);
                                equationData.setErrorCode('CannotUnderstandThis');
                                return;
                                //sumProductEquation = sumProductEquation.substring(0, charCounter - 4) + nameSpace.Parser._checkSumProductCase(latex.substring(charCounter - 4, latexLength),equationData);
                            }
                            prodIndex = sumProductEquation.lastIndexOf('\\prod');
                            if (prodIndex !== -1 && prodIndex === sumProductEquation.length - 5) {
                                //sumProductEquation = sumProductEquation.substring(0, charCounter - 5) + nameSpace.Parser._checkSumProductCase(latex.substring(charCounter - 5, latexLength), equationData);
                                equationData.setCanBeSolved(false);
                                equationData.setErrorCode('CannotUnderstandThis');
                                return;
                            }
                        }
                    }
                }
                else {
                    if (sumProductEquation !== '') {
                        returnLatex += nameSpace.Parser._prepareSumProductLatex(upperLimit, lowerLimit, sumProductEquation, equationData);
                        sumProductEquation = '';
                        lowerLimit = '';
                        upperLimit = '';
                        checkingLowerLimit = false;
                        upperLimitDone = false;
                        lowerLimitDone = false;
                        checkingUpperLimit = false;
                        bracketCounter = 0;
                    }
                    if (addToLatex !== '') {
                        returnLatex += addToLatex;
                        addToLatex = '';
                    }
                    returnLatex += currentChar;
                    if (useEquation === false && nameSpace.Parser._checkSumProductCondition(returnLatex)) {
                        sumProdOccurred = true;
                        useEquation = true;
                    }
                }
            }
            if (sumProdOccurred === true) {
                returnLatex += nameSpace.Parser._prepareSumProductLatex(upperLimit, lowerLimit, sumProductEquation, equationData);
                if (addToLatex !== '') {
                    returnLatex += addToLatex;
                    addToLatex = '';
                }
            }
            return returnLatex;
        },

        _checkSumProductCondition: function _checkSumProductCondition(returnLatex) {
            var sumIndex = returnLatex.lastIndexOf('\\sum'),
                prodIndex = returnLatex.lastIndexOf('\\prod'),
                latexLength = returnLatex.length;
            if (sumIndex === -1 && prodIndex === -1) {
                return false;
            }
            if (sumIndex !== -1 && sumIndex === latexLength - 4) {
                return true;
            }
            if (prodIndex !== -1 && prodIndex === latexLength - 5) {
                return true;
            }
            return false;
            //return sumIndex === returnLatex.length - 4 || prodIndex === returnLatex.length - 5;
        },

        _prepareSumProductLatex: function _prepareSumProductLatex(upperLimit, lowerLimit, sumProductEquation, equationData) {
            var returnLatex = '',
                lowerLimitSplit;
            if (lowerLimit.charAt(0) === '{') {
                lowerLimit = lowerLimit.substring(1, lowerLimit.length - 1);
            }
            lowerLimitSplit = lowerLimit.split('=');
            returnLatex += '{' + lowerLimitSplit[0] + '}{' + lowerLimitSplit[1] + '}';
            equationData.setPivot(lowerLimitSplit[0]);
            if (upperLimit.charAt(0) === '{') {
                upperLimit = upperLimit.substring(1, upperLimit.length - 1);
            }
            returnLatex += '{' + upperLimit + '}';
            returnLatex += '{' + sumProductEquation + '}';
            if (lowerLimitSplit[1].indexOf(equationData.getPivot()) !== -1 || upperLimit.indexOf(equationData.getPivot()) !== -1) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return;
            }
            return returnLatex;
        },

        //getAccessibleSolutionString: function getAccessibleSolutionString(latex) {
        //    var returnString = '',
        //        FRAC = '\\frac',
        //        CDOT = '\\cdot',
        //        nameSpace = MathUtilities.Components.EquationEngine.Models,
        //        charCounter,
        //        currentChar,
        //        latexLength = latex.length,
        //        openBraceCounter = 0,
        //        closeBraceCounter = 0,
        //        operatorText = nameSpace.TreeProcedures.OPERATOR_TEXT;

        //    for (charCounter = 0; charCounter < latexLength; charCounter++) {
        //        if(latex.)
        //        returnString += latex.charAt()
        //    }
        //},

        /**

        Takes equation data to parse the equation. This function parses the equation generates equation tree and saves it in the equationData.
     
        @public
        @method parseEquation
        @param equationData 
        @return Void
        @static
        **/
        parseEquation: function parseEquation(equationData) {
            if (equationData.getBlind()) {
                return;
            }
            var nameSpace,
                latexEquation,
                divideEquationIntoExpressionRegEx,
                expressionMatches,
                freeVariables,
                variable,
                noConstantDeclared,
                possibleFunctionVariables,
                freeVar,
                freeVarCount,
                equationRange,
                preferredFunctionVariable,
                chooseThis,
                possibleFunctionVariableCounter,
                possibleFunctionVariablesLength,
                isRVariablePresent,
                isXYVariablePresent,
                newFreeVariables,
                variableCounter,
                freeVariablesLength,
                equationFreeVars,
                tokenCounter,
                tokensLength,
                currentToken,
                equationParameters,
                leftExpression,
                rightExpression,
                directives = equationData.getDirectives(),
                profiles = equationData.getProfiles(),
                $leftPreprocessLatex,
                $leftPreProcessLatexExpression,
                $rightPreprocessLatex,
                $rightPreProcessLatexExpression;
            //isVariableConstantPresentRegex,
            //errorDataCounter,
            //errorDataLength,
            //currentErrorData;
            nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            if (!nameSpace.Parser._deploy) {
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
            *   isLinearEquation: TODO
            *   
            * units
            *  |- angle => "rad"/ "deg"
            *
            * Equation Data will have following data
            * free Vars and their status [nth degree or complicated] as follows
            *   freevars
            *    |- x => "c"
            *    |- y => "1"
            *
            *
            * -----------------RESULT DATA------------------------
            * canBeSolved? boolean
            * functionVariable
            * paramVariable
            * errorString
            *
            */

            /*
            * Expression will contain following data
            *
            *   freevars
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
            if (nameSpace.Parser._isBlank(equationData.getLatex())) {
                equationData.setCanBeSolved(false);
                equationData.setSpecie('error');
                equationData.setErrorCode('Blank');
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                return;
            }

            
            //equationData.flushPlotData();
            leftExpression = equationData.getLeftExpression();
            rightExpression = equationData.getRightExpression();
            latexEquation = equationData.getLatex();

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Processing equation ' + latexEquation, []);
            latexEquation = latexEquation.replace(/\\space/gi, "");
            latexEquation = latexEquation.replace(/\\left/gi, "");
            latexEquation = latexEquation.replace(/\\right/gi, "");
            latexEquation = latexEquation.replace(/\\:/gi, "");
            latexEquation = latexEquation.replace(/\$/gi, "");
            //negative lookbehind doesnt work (?<!\\cdot)\d so removing spaces and adding space manually after cdot
            latexEquation = latexEquation.replace(/\s/gi, "");
            latexEquation = latexEquation.replace(/\\cdot/gi, "\\cdot ");
            latexEquation = latexEquation.replace(/\\pi/gi, "\\pi ");
            latexEquation = latexEquation.replace(/\\le/gi, "\\le ");
            latexEquation = latexEquation.replace(/\\ge/gi, "\\ge ");
            latexEquation = latexEquation.replace(/\\theta/gi, "\\theta ");
            //latexEquation = latexEquation.replace(/\\log_/gi, "\\log _");
            //var i;
            latexEquation = nameSpace.Parser._splitRangeFromSolution(latexEquation, equationData);
            if (equationData.isCanBeSolved() === false) {
                return;
            }
            // Function to process sum product case
            //latexEquation = nameSpace.Parser._preProcessSumProductCase(latexEquation, equationData);
            latexEquation = nameSpace.Parser._checkSumProductCase(latexEquation, equationData);
            if (equationData.isCanBeSolved() === false) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, "%cError occured in sum pivot case", ['#ff0000']);
                return;
            }
            nameSpace.Parser._preProcessLatexForErrors(latexEquation, equationData);
            if (equationData.isCanBeSolved() === false) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, "%cError occured in syntax of latex", ['#ff0000']);
                return;
            }

            divideEquationIntoExpressionRegEx = /(.*?)(=|<|>|\\le|\\ge)(.*)/gi;
            expressionMatches = divideEquationIntoExpressionRegEx.exec(latexEquation);

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, latexEquation, []);

            if (expressionMatches === null) {
                equationData.setInEqualityType('=');
                leftExpression.expression = latexEquation;
                //equationData.rightExpression.expression = "0";

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Eqaution is an expression', []);
                //todo solve expression

            }
            else {

                if (expressionMatches[1] === '' || expressionMatches[3] === '') {
                    if (expressionMatches[3] === '') {
                        leftExpression.expression = expressionMatches[1];
                        nameSpace.Parser._preProcessExpression(leftExpression);
                        nameSpace.Parser._parseExpression(leftExpression, equationData);
                    }
                    else {
                        rightExpression.expression = expressionMatches[3];
                        nameSpace.Parser._preProcessExpression(rightExpression);
                        nameSpace.Parser._parseExpression(rightExpression, equationData);
                    }
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('CannotUnderstandThis');
                    return;
                }
                equationData.setInEqualityType(expressionMatches[2]);
                leftExpression.expression = expressionMatches[1];
                rightExpression.expression = expressionMatches[3];
            }

            //start time for left expression pre process stage.
            if (!nameSpace.Parser._deploy) {
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('leftPreProcess');
            }

            nameSpace.Parser._preProcessExpression(leftExpression);

            //processing time for left expression pre process stage.
            if (!nameSpace.Parser._deploy) {
                profiles[0] = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('leftPreProcess');

                $leftPreprocessLatex = $("#pre-process-latex-left");
                $leftPreProcessLatexExpression = $('<div></div>');
                $leftPreprocessLatex.append($leftPreProcessLatexExpression);
                $leftPreProcessLatexExpression.attr('id', 'left-preprocess-latex-expression')
                                              .append(leftExpression.expression)
                                              .css({ 'border': '1px solid', 'border-color': nameSpace.Parser._borderColor, 'padding': '5px 5px 5px 5px' });
                $leftPreprocessLatex.parent().css({ 'border': '1px solid black' });
            }
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'Left expression after preprocessing :: ', []);
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, leftExpression, []);
            if (!nameSpace.Parser._deploy) {
                //start time for left token generation stage.
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('leftTokenGeneration');
            }
            nameSpace.Parser._parseExpression(leftExpression, equationData);

            if (!nameSpace.Parser._deploy) {
                equationParameters = equationData.getLeftEquationParameters();
                nameSpace.Parser._displayArrayOfObjects(equationParameters.operatorsList, 'operators-display-container-left', '#777700', 'white');
                nameSpace.Parser._displayArrayOfObjects(equationParameters.constantsList, 'constants-display-container-left', '#777700', 'white');
                nameSpace.Parser._displayArrayOfObjects(equationParameters.variablesList, 'variables-display-container-left', '#777700', 'white');
                nameSpace.Parser._displayArrayOfObjects(equationParameters.digitsList, 'digits-display-container-left', '#777700', 'white');
                nameSpace.Parser._displayArrayOfObjects(equationParameters.functionsList, 'functions-display-container-left', '#777700', 'white');
            }
            if (!nameSpace.Parser._deploy) {
                //processing time for left token generation stage.
                profiles[1] = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('leftTokenGeneration');
            }
            if (equationData.isCanBeSolved() === false) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                return;
            }
            if (equationData.getSpecie() === 'point') {
                return;
            }


            nameSpace.Parser._displayArrayOfObjects(leftExpression.tokens, 'tokens-display-container-left', '#777700', 'white');

            // case where only digit is give to parse in expression. So no need to parse the whole equation
            if (rightExpression.expression === null) {
                if (leftExpression.tokens.length === 3) {
                    if (leftExpression.tokens[1].type === 'digit' && leftExpression.tokens[0].value === '(' && leftExpression.tokens[2].value === ')') {
                        equationData.setSpecie('number');
                        if (leftExpression.tokens[1].sign === '-') {
                            equationData.setSolution(Number(leftExpression.tokens[1].value) * -1);
                        }
                        else {
                            equationData.setSolution(Number(leftExpression.tokens[1].value));
                        }
                        return;
                    }

                }
                else if (leftExpression.tokens.length === 1) {
                    if (leftExpression.tokens[0].type === 'digit') {
                        equationData.setSpecie('number');
                        if (leftExpression.tokens[0].sign === '-') {
                            equationData.setAccText('-' + nameSpace.TreeProcedures._getAccessibleStringForNumber(leftExpression.tokens[0].value));
                            equationData.setSolution(Number(leftExpression.tokens[0].value) * -1);
                        }
                        else {
                            equationData.setAccText(nameSpace.TreeProcedures._getAccessibleStringForNumber(leftExpression.tokens[0].value));
                            equationData.setSolution(Number(leftExpression.tokens[0].value));
                        }
                        $('#accessibility-display').html('The Accesibility string is ' + equationData.getAccText());
                        return;
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
                if (!nameSpace.Parser._deploy) {
                    //start time for right expression pre process stage.
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('rightPreProcess');
                }

                nameSpace.Parser._preProcessExpression(rightExpression);
                if (!nameSpace.Parser._deploy) {
                    //processing time for pre process stage.
                    profiles[0] += MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('rightPreProcess');
                }

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'right expression after preprocessing :: ', []);
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, rightExpression, []);
                if (!nameSpace.Parser._deploy) {
                    //start time for right token generation stage.
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('rightTokenGeneration');
                }

                nameSpace.Parser._parseExpression(rightExpression, equationData);
                if (!nameSpace.Parser._deploy) {
                    //processing time for token generation stage.
                    profiles[1] += MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('rightTokenGeneration');
                }

                if (equationData.isCanBeSolved() === false) {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                    return;
                }
                //                if (equationData.type === 'point') {
                //                    return;
                //                }


                variable = null;
                for (variable in rightExpression.freevars) {
                    if (freeVariables.indexOf(variable) === -1) {
                        freeVariables.push(variable);
                    }
                }
            }
            else {
                if (freeVariables.length === 0) {
                    equationData.setRhsAuto(true);
                    //TODO just some constants on LHS, RHS should not be simply zero...it should be parsed without RHS in this case
                    rightExpression.expression = '0';
                }
                else if (freeVariables.length === 1) {
                    //check if its just x, if so then add y at RHS
                    if (freeVariables[0] === 'x') {
                        freeVariables.push('y');
                        equationData.setRhsAuto(true);
                        rightExpression.expression = 'y';
                    }
                    else {
                        //TODO CHECK AGAIN AND REVISE
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('Complicated');
                        equationData.setErrorString("Cant understand this");
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                        return;
                    }

                }
                else {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('Cant understand this');
                    equationData.setErrorString('Complicated');
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                    return;
                }
                if (!nameSpace.Parser._deploy) {
                    //start time for right expression pre processing stage.
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('rightPreProcess');
                }

                nameSpace.Parser._preProcessExpression(rightExpression);
                if (!nameSpace.Parser._deploy) {
                    //processing time for pre processing stage.
                    profiles[0] += MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('rightPreProcess');

                    //start time for right token generation stage. 
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('rightTokenGeneration');
                }
                nameSpace.Parser._parseExpression(rightExpression, equationData);
                if (!nameSpace.Parser._deploy) {
                    //processing time for token generation stage.
                    profiles[1] += MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('rightTokenGeneration');
                }
                if (equationData.isCanBeSolved() === false) {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                    return;
                }
                //                if (equationData.type === 'point') {
                //                    return;
                //                }


            }
            if (directives.FDFlagMethod === 'graphing') {
                nameSpace.Parser._getFracDecAnalysis(equationData);
            }
            if (equationData.isCanBeSolved() === false) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                return;
            }
            if (!nameSpace.Parser._deploy) {
                $rightPreprocessLatex = $("#pre-process-latex-right");
                $rightPreProcessLatexExpression = $('<div></div>');
                $rightPreprocessLatex.append($rightPreProcessLatexExpression);
                $rightPreProcessLatexExpression.attr('id', 'right-preprocess-latex-expression')
                                               .append(rightExpression.expression)
                                               .css({ 'border': '1px solid', 'border-color': nameSpace.Parser._borderColor, 'padding': '5px 5px 5px 5px' });
            }
            // If 'r' and 'x' or 'y' both are present in an equation then we consider r as a constant and not a variable
            isRVariablePresent = freeVariables.indexOf('r') !== -1;
            isXYVariablePresent = freeVariables.indexOf('x') !== -1 || freeVariables.indexOf('y') !== -1;
            newFreeVariables = [];
            if (isRVariablePresent && isXYVariablePresent) {
                variableCounter = 0;
                freeVariablesLength = freeVariables.length;
                for (variableCounter; variableCounter < freeVariablesLength; variableCounter++) {
                    if (freeVariables[variableCounter] === 'r') {
                        continue;
                    }
                    newFreeVariables.push(freeVariables[variableCounter]);
                }
                freeVariables = newFreeVariables;
                tokenCounter = 0;
                tokensLength = leftExpression.tokens.length;
                currentToken = null;
                for (tokenCounter; tokenCounter < tokensLength; tokenCounter++) {
                    currentToken = leftExpression.tokens[tokenCounter];
                    if (currentToken.value === 'r') {
                        currentToken.type = 'const';
                    }
                }
                tokensLength = rightExpression.tokens.length;
                for (tokenCounter = 0; tokenCounter < tokensLength; tokenCounter++) {
                    currentToken = rightExpression.tokens[tokenCounter];
                    if (currentToken.value === 'r') {
                        currentToken.type = 'const';
                    }
                }
            }
            //if (isRVariablePresent === true && isXYVariablePresent === false) {
            //    equationData.isPolar = true;
            //}
            //else {
            //    equationData.isPolar = false;
            //}


            nameSpace.Parser._displayArrayOfObjects(rightExpression.tokens, 'tokens-display-container-right', '#777700', 'white');
            if (freeVariables.length > 2) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('MoreFreeVariables');
                equationData.setErrorString(nameSpace.EquationEnums.ERROR_TOO_MANY_FREE_VARIABLES);
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
            }

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[READY]' + 'Final equation is ' + equationData, [nameSpace.Parser._YSTYLE]);
            //checkFreeVariablesCount(equationData);


            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, equationData, []);

            //check if we find any constants that we dont have value for
            noConstantDeclared = false;
            if (equationData.getConstants() === null) {
                noConstantDeclared = true;
            }
            nameSpace.Parser._checkIfOnlyNumbersAndConstantsPresent(equationData);
            if (equationData.isCanBeSolved() === false) {
                return;
            }
            //TODO add freevars count check like constants

            nameSpace.Parser._substituteConstants(leftExpression, equationData, noConstantDeclared);
            nameSpace.Parser._substituteConstants(rightExpression, equationData, noConstantDeclared);

            // The below check is for constants error handling 
            if (!equationData.isCanBeSolved()) {
                this._mergeConstantsErrorData(equationData);
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                return;
            }
            //isVariableConstantPresentRegex = /x|y|[0-9]/g;
            //if (equationData.rightExpression.expression.match(isVariableConstantPresentRegex) === null && equationData.leftExpression.expression.match(isVariableConstantPresentRegex) === null) {
            //    equationData.canBeSolved = false;
            //    equationData.errorCode = 'OnlyNumbers';
            //    return;
            //}

            nameSpace.Parser._printTokens(leftExpression, 'Left expression ');
            nameSpace.Parser._printTokens(rightExpression, 'Right expression ');

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE1 - Success]' + 'Token Generation Complete', [nameSpace.Parser._YSTYLE]);

            $('#production-rules-display').html('');
            if ($.isEmptyObject(leftExpression.freevars) && $.isEmptyObject(rightExpression.freevars)) {
                equationData.setSpecie('expression');
            }

            nameSpace.Parser._generateAnalysis(equationData);
            if (equationData.isCanBeSolved() === false) {
                equationData.setSpecie('error');
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                return;
            }
            else {
                if (equationData.getSpecie() === 'expression') {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'The equation is solved', []);
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, equationData.getSolution(), []);
                    return;
                }
            }


            nameSpace.Parser._calculateMaxPowerOfVariable(equationData);

            if (equationData.isCanBeSolved() === false) {
                equationData.setSpecie('error');
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                return;
            }

            possibleFunctionVariables = [];
            freeVar = null;

            equationFreeVars = equationData.getFreeVars();
            freeVarCount = 0;
            for (freeVar in equationFreeVars) {
                //TRACE
                freeVarCount++;
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'checking complexity of freevar ' + freeVar + ">> " + equationFreeVars[freeVar], []);

                if (typeof (equationFreeVars[freeVar]) === "number" && equationFreeVars[freeVar] <= 2) {
                    possibleFunctionVariables.push(freeVar);
                }

            }

            //check if the equation can be plotted
            //if the equation has 1 freevar and if there are no possible functional variable ie that free variable is complicated then the equation cant be solved
            // if the one free variable is the a function variable then the equation WILL NOT be plotted, it will be solved as a quadratic equation
            if (freeVarCount === 1) {
                if (possibleFunctionVariables.length === 0) {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('Complicated');
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%c ERROR: complicated equation. Cant solve');
                    equationData.setSpecie('error');
                    return;
                }
                else {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.info, '%c INFO %c: Equation will yield solutions', [nameSpace.Parser._BLUE_STYLE, undefined]);
                    if (equationFreeVars[possibleFunctionVariables[0]] > 1) {
                        equationData.setSpecie(('quadratic'));
                    }
                    else {
                        equationData.setSpecie('linear');
                        if (equationFreeVars.x === 1 || equationFreeVars.y === 1) {
                            equationData.setSpecie('plot');
                        }
                    }
                }
            }
            else {
                // free vars > 1
                equationData.setSpecie('plot');
            }

            if (possibleFunctionVariables.length <= 2) {
                chooseThis = false;
                possibleFunctionVariableCounter = 0;
                possibleFunctionVariablesLength = possibleFunctionVariables.length;
                for (possibleFunctionVariableCounter; possibleFunctionVariableCounter < possibleFunctionVariablesLength; possibleFunctionVariableCounter++) {

                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, nameSpace.Parser._getFunctionVariablePrecedenceIndex(preferredFunctionVariable) + ">>" + nameSpace.Parser._getFunctionVariablePrecedenceIndex(possibleFunctionVariables[possibleFunctionVariableCounter]), []);
                    if (preferredFunctionVariable === undefined) {
                        chooseThis = true;
                    }
                    else {
                        if (nameSpace.Parser._getFunctionVariablePrecedenceIndex(preferredFunctionVariable) < nameSpace.Parser._getFunctionVariablePrecedenceIndex(possibleFunctionVariables[possibleFunctionVariableCounter])) {

                            chooseThis = true;
                        }
                        else {
                            chooseThis = false;
                        }
                    }
                    if (chooseThis === true) {
                        preferredFunctionVariable = possibleFunctionVariables[possibleFunctionVariableCounter];
                    }

                }

                equationData.setFunctionVariable(preferredFunctionVariable);
                equationRange = equationData.getRange();
                if (possibleFunctionVariables.length > 1) {
                    if (equationRange !== null) {
                        if (possibleFunctionVariables.indexOf(equationRange.variable) !== -1) {
                            if (equationRange.variable === 'y') {
                                preferredFunctionVariable = 'x';
                                equationData.setFunctionVariable(preferredFunctionVariable);
                            }
                            else {
                                preferredFunctionVariable = 'y';
                                equationData.setFunctionVariable(preferredFunctionVariable);
                            }
                        }
                    }
                }

                //TODO remove hardcoding
                if (preferredFunctionVariable === 'y') {
                    equationData.setParamVariable('x');
                }
                else {
                    equationData.setParamVariable('y');
                }
                if (equationRange !== null) {
                    if (equationData.getParamVariable() !== equationRange.variable) {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('ComplicatedRange');
                    }
                }

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE5 - SUCCESS]' + ' Chosen function variable is ' + preferredFunctionVariable, [nameSpace.Parser._YSTYLE]);

            }
            else {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('MoreFreeVariables');
                equationData.setErrorString(nameSpace.EquationEnums.ERROR_TOO_MANY_FREE_VARIABLES);
                //it should not be detected so late

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%c[STAGE5 - FAIL]' + 'TOO many free variables...it should NOT have been be detected so late', [nameSpace.Parser._NSTYLE]);

            }
            return;
        },

        processTokensWithRules: function processTokensWithRules(equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                leftExpression = equationData.getLeftExpression(),
                rightExpression = equationData.getRightExpression(),
                leftTokens = leftExpression.tokens,
                rightTokens = rightExpression.tokens,
                rightValidPredictionStack,
                rootNode,
                equationLeftRoot,
                equationRightRoot,
                equationUnits = equationData.getUnits(),
                profiles = equationData.getProfiles(),
                directives = equationData.getDirectives(),
                leftValidPredictionStack;
            if (!nameSpace.Parser._deploy) {
                //start time for generating left production rules stage.
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('leftProductionRules');
            }
            leftExpression.validPredictionStack = nameSpace.Parser._recursiveDescentParser(equationData, leftTokens, 0, 0, [undefined], false);
            //if (leftValidPredictionStack === undefined) {
            //    equationData.CanBeSolved = false;
            //}
            if (!nameSpace.Parser._deploy) {
                //processing time for generating left production rules stage.
                profiles[2] = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('leftProductionRules');
            }
            if (equationData.isCanBeSolved() === false) {
                return;
            }
            nameSpace.Parser._displayArrayOfObjects(leftExpression.validPredictionStack, 'production-rules-display-left', '#777700', 'white');
            if (!nameSpace.Parser._deploy) {
                //start time for generating right production rules stage.
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('rightProductionRules');
            }
            rightExpression.validPredictionStack = nameSpace.Parser._recursiveDescentParser(equationData, rightTokens, 0, 0, [undefined], false);
            if (!nameSpace.Parser._deploy) {
                //processing time for generating production rules stage.
                profiles[2] += MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('rightProductionRules');
            }
            if (equationData.isCanBeSolved() === false) {
                return;
            }
            nameSpace.Parser._displayArrayOfObjects(rightExpression.validPredictionStack, 'production-rules-display-right', '#777700', 'white');
            //TODO shift right side to left
            //TODO redundant condition.
            if (leftExpression.validPredictionStack !== undefined && rightExpression.validPredictionStack !== undefined) {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE2 - Success]' + 'Prediction rules Generated Left:' + leftExpression.validPredictionStack, [nameSpace.Parser._YSTYLE]);
            }
            else {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE2 - FAIL]' + 'Left Prediction Rules Failed', [nameSpace.Parser._NSTYLE]);
                return;
            }
        },

        generateTreeFromRules: function generateTreeFromRules(equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                leftExpression = equationData.getLeftExpression(),
                rightExpression = equationData.getRightExpression(),
                leftTokens = leftExpression.tokens,
                rightTokens = rightExpression.tokens,
                rootNode,
                equationLeftRoot,
                equationRightRoot,
                equationUnits = equationData.getUnits(),
                directives = equationData.getDirectives(),
                possibleFunctionVariables,
                freeVar,
                freeVarCount,
                equationRange,
                preferredFunctionVariable,
                chooseThis,
                possibleFunctionVariableCounter,
                possibleFunctionVariablesLength,
                equationFreeVars,
                profiles = equationData.getProfiles();
            if (!nameSpace.Parser._deploy) {
                //start time for tree generation stage.
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('generateTree');
            }
            equationData.setLeftRoot(nameSpace.TreeProcedures.generateTree(leftExpression.validPredictionStack, 0, equationUnits));
            equationData.setRightRoot(nameSpace.TreeProcedures.generateTree(rightExpression.validPredictionStack, 0, equationUnits));

            if (!nameSpace.Parser._deploy) {
                //processing time for tree generation stage.
                profiles[3] = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('generateTree');
            }
            //Generate accessibility text
            equationLeftRoot = equationData.getLeftRoot();
            equationRightRoot = equationData.getRightRoot();
            var str = nameSpace.TreeProcedures._toAccessible(equationLeftRoot).expression;
            if (equationData.getRhsAuto() !== true) {
                str += " equal to " + nameSpace.TreeProcedures._toAccessible(equationRightRoot).expression;
            }
            //str = str.replace('-', 'negative ');
            //str = str.replace('+ negative', '- ');
            equationData.setAccText(str);
            $('#accessibility-display').html('The Accesibility string is ' + str);
            if (directives.FDFlagMethod === "graphing") {
                //var flag = nameSpace.Parser._getAnalysisForFD(equationData.leftRoot) === 0 ? "frac" : "decimal";
                //if (flag === "frac" && equationData.rightRoot && !equationData.analysis.rhsAuto) flag = nameSpace.Parser._getAnalysisForFD(equationData.rightRoot) === 0 ? "frac" : "decimal";
                if (equationData.getFdFlag() === "frac") {
                    //equationData.analysis.FDFlag = flag === "frac" ? "decimal" : flag === "decimal" ? "frac" : "decimal";
                    if (equationLeftRoot.name === '\\frac' || (equationLeftRoot.name === 'do' && equationLeftRoot.params[0].name === '\\frac')) {
                        equationData.setFdFlag('decimal');
                        if (equationLeftRoot.name === 'do') {
                            nameSpace.Parser._checkIfFracHasNonFracChilds(equationLeftRoot.params[0], equationData);
                        }
                        else {
                            nameSpace.Parser._checkIfFracHasNonFracChilds(equationLeftRoot, equationData);
                        }
                    }
                }
            }

            if (directives.FDFlagMethod === 'calculator') {
                equationData.setFdFlag(nameSpace.Parser._getAnalysisForFD(equationLeftRoot) === 0 ? "frac" : "decimal");
            }

            //simplify the equation

            if (!nameSpace.Parser._deploy) {
                //start time for simplify stage.
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('simplify');
            }
            if (!equationLeftRoot.isTerminal) {
                equationLeftRoot.simplify(equationData);
            }
            if (equationRightRoot && !equationRightRoot.isTerminal) {
                equationRightRoot.simplify(equationData);
            }

            if (!nameSpace.Parser._deploy) {
                //processing time for simplify stage.
                profiles[4] = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('simplify');
            }

            if (equationLeftRoot.isTerminal && equationLeftRoot.type === "digit" && equationRightRoot !== null && !equationData.getRhsAuto() && equationRightRoot.isTerminal && equationRightRoot.type === "digit") {
                equationData.setCanBeSolved(false);
                equationData.setErrorString('Try adding some free variables');
                equationData.setErrorCode('CannotUnderstandThis');
                return;
            }





            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE4 - SUCCESS]' + 'Tree Simplified', [nameSpace.Parser._YSTYLE]);
            if (!nameSpace.Parser._deploy) {
                nameSpace.Parser._printLatex(equationLeftRoot, 4, true);
                //nameSpace.Parser._printLatex(equationData.rightRoot, 4, true);
            }

            if (equationData.getSpecie() !== 'expression') {
                //delaying combining post simplify so that we have a clear idea of wheather 
                nameSpace.TreeProcedures.combineLeftRightTree(equationData);
            }
            rootNode = equationLeftRoot;

            //nameSpace.Parser._printLatex(equationData.leftRoot, 3, true);

            //if(equationData.leftRoot !== undefined && equationData.rightRoot !== undefined){
            if (equationLeftRoot !== undefined) {
                //nameSpace.Parser._nodeDisplay(rootNode, true);

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE3 - Success]' + 'Equation Tree Generated', [nameSpace.Parser._YSTYLE]);
                if (!nameSpace.Parser._deploy) {
                    nameSpace.Parser._printLatex(rootNode, 3, true);
                }
            }
            else {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE3 - FAIL]' + 'Left Equation Tree Generation Failed', [nameSpace.Parser._NSTYLE]);
                return;
            }







            //after simplification of the left side check if the leftside is reduced to terminal. if it has then that means it is a constant
            //if (rootNode.isTerminal === true) {
            //    equationData.type = 'expression';
            //    equationData.solution = [nameSpace.TreeProcedures._getValueFromParam(rootNode)];
            //}
            if (equationData.getSpecie() === 'expression') {
                //equationData.rightRoot;
                //var rightSide = nameSpace.TreeProcedures._substituteParamVariableAndGetValue(equationData.rightRoot, equationData.constants);
                equationData.setSolution(nameSpace.TreeProcedures._substituteParamVariableAndGetValue(equationData.getLeftRoot(), equationData.getConstants()));
                //equationData.solution = Number(equationData.solution.toPrecision(10));
            }
            if (!nameSpace.Parser._deploy) {
                nameSpace.TreeProcedures._toLatex(rootNode);
            }

            if (equationData.isCanBeSolved() === false) {
                equationData.setSpecie('error');
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                return;
            }
            else {
                if (equationData.getSpecie() === 'expression') {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'The equation is solved', []);
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, equationData.getSolution(), []);
                    return;
                }
            }

            nameSpace.Parser._calculateMaxPowerOfVariable(equationData);

            if (equationData.isCanBeSolved() === false) {
                equationData.setSpecie('error');
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                return;
            }

            possibleFunctionVariables = [];
            freeVar = null;

            equationFreeVars = equationData.getFreeVars();
            freeVarCount = 0;
            for (freeVar in equationFreeVars) {
                //TRACE
                freeVarCount++;
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'checking complexity of freevar ' + freeVar + ">> " + equationFreeVars[freeVar], []);

                if (typeof (equationFreeVars[freeVar]) === "number" && equationFreeVars[freeVar] <= 2) {
                    possibleFunctionVariables.push(freeVar);
                }

            }

            //check if the equation can be plotted
            //if the equation has 1 freevar and if there are no possible functional variable ie that free variable is complicated then the equation cant be solved
            // if the one free variable is the a function variable then the equation WILL NOT be plotted, it will be solved as a quadratic equation
            if (freeVarCount === 1) {
                if (possibleFunctionVariables.length === 0) {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('Complicated');
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%c ERROR: complicated equation. Cant solve');
                    equationData.setSpecie('error');
                    return;
                }
                else {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.info, '%c INFO %c: Equation will yield solutions', [nameSpace.Parser._BLUE_STYLE, undefined]);
                    if (equationFreeVars[possibleFunctionVariables[0]] > 1) {
                        equationData.setSpecie(('quadratic'));
                    }
                    else {
                        equationData.setSpecie('linear');
                        if (equationFreeVars.x === 1 || equationFreeVars.y === 1) {
                            equationData.setSpecie('plot');
                        }
                    }
                }
            }
            else {
                // free vars > 1
                equationData.setSpecie('plot');
            }

            if (possibleFunctionVariables.length <= 2) {
                chooseThis = false;
                possibleFunctionVariableCounter = 0;
                possibleFunctionVariablesLength = possibleFunctionVariables.length;
                for (possibleFunctionVariableCounter; possibleFunctionVariableCounter < possibleFunctionVariablesLength; possibleFunctionVariableCounter++) {

                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, nameSpace.Parser._getFunctionVariablePrecedenceIndex(preferredFunctionVariable) + ">>" + nameSpace.Parser._getFunctionVariablePrecedenceIndex(possibleFunctionVariables[possibleFunctionVariableCounter]), []);
                    if (preferredFunctionVariable === undefined) {
                        chooseThis = true;
                    }
                    else {
                        if (nameSpace.Parser._getFunctionVariablePrecedenceIndex(preferredFunctionVariable) < nameSpace.Parser._getFunctionVariablePrecedenceIndex(possibleFunctionVariables[possibleFunctionVariableCounter])) {

                            chooseThis = true;
                        }
                        else {
                            chooseThis = false;
                        }
                    }
                    if (chooseThis === true) {
                        preferredFunctionVariable = possibleFunctionVariables[possibleFunctionVariableCounter];
                    }

                }

                equationData.setFunctionVariable(preferredFunctionVariable);
                equationRange = equationData.getRange();
                if (possibleFunctionVariables.length > 1) {
                    if (equationRange !== null) {
                        if (possibleFunctionVariables.indexOf(equationRange.variable) !== -1) {
                            if (equationRange.variable === 'y') {
                                preferredFunctionVariable = 'x';
                                equationData.setFunctionVariable(preferredFunctionVariable);
                            }
                            else {
                                preferredFunctionVariable = 'y';
                                equationData.setFunctionVariable(preferredFunctionVariable);
                            }
                        }
                    }
                }

                //TODO remove hardcoding
                if (preferredFunctionVariable === 'y') {
                    equationData.setParamVariable('x');
                }
                else {
                    equationData.setParamVariable('y');
                }
                if (equationRange !== null) {
                    if (equationData.getParamVariable() !== equationRange.variable) {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('ComplicatedRange');
                    }
                }

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE5 - SUCCESS]' + ' Chosen function variable is ' + preferredFunctionVariable, [nameSpace.Parser._YSTYLE]);

            }
            else {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('MoreFreeVariables');
                equationData.setErrorString(nameSpace.EquationEnums.ERROR_TOO_MANY_FREE_VARIABLES);
                //it should not be detected so late

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%c[STAGE5 - FAIL]' + 'TOO many free variables...it should NOT have been be detected so late', [nameSpace.Parser._NSTYLE]);

            }
            return;
        },

        parseEquationToGetTokens: function parseEquationToGetTokens(equationData) {
            if (equationData.getBlind()) {
                return;
            }
            var nameSpace,
                latexEquation,
                divideEquationIntoExpressionRegEx,
                expressionMatches,
                freeVariables,
                variable,
                noConstantDeclared,
                possibleFunctionVariables,
                freeVar,
                freeVarCount,
                equationRange,
                preferredFunctionVariable,
                chooseThis,
                possibleFunctionVariableCounter,
                possibleFunctionVariablesLength,
                isRVariablePresent,
                isXYVariablePresent,
                newFreeVariables,
                variableCounter,
                freeVariablesLength,
                equationFreeVars,
                tokenCounter,
                tokensLength,
                currentToken,
                equationParameters,
                leftExpression,
                rightExpression,
                directives = equationData.getDirectives(),
                profiles = equationData.getProfiles(),
                $leftPreprocessLatex,
                $leftPreProcessLatexExpression,
                $rightPreprocessLatex,
                $rightPreProcessLatexExpression;
            nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            //isVariableConstantPresentRegex,
            //errorDataCounter,
            //errorDataLength,
            //currentErrorData;
            if (!nameSpace.Parser._deploy) {
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
            *   isLinearEquation: TODO
            *   
            * units
            *  |- angle => "rad"/ "deg"
            *
            * Equation Data will have following data
            * free Vars and their status [nth degree or complicated] as follows
            *   freevars
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
            *   freevars
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
            if (nameSpace.Parser._isBlank(equationData.getLatex())) {
                equationData.setCanBeSolved(false);
                equationData.setSpecie('error');
                equationData.setErrorCode('Blank');
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                return;
            }
            //equationData.flushPlotData();
            leftExpression = equationData.getLeftExpression();
            rightExpression = equationData.getRightExpression();
            latexEquation = equationData.getLatex();

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Processing equation ' + latexEquation, []);
            latexEquation = latexEquation.replace(/\\space/gi, "");
            latexEquation = latexEquation.replace(/\\left/gi, "");
            latexEquation = latexEquation.replace(/\\right/gi, "");
            latexEquation = latexEquation.replace(/\\:/gi, "");
            latexEquation = latexEquation.replace(/\$/gi, "");
            //negative lookbehind doesnt work (?<!\\cdot)\d so removing spaces and adding space manually after cdot
            latexEquation = latexEquation.replace(/\s/gi, "");
            latexEquation = latexEquation.replace(/\\cdot/gi, "\\cdot ");
            latexEquation = latexEquation.replace(/\\pi/gi, "\\pi ");
            latexEquation = latexEquation.replace(/\\le/gi, "\\le ");
            latexEquation = latexEquation.replace(/\\ge/gi, "\\ge ");
            latexEquation = latexEquation.replace(/\\theta/gi, "\\theta ");
            //latexEquation = latexEquation.replace(/\\log_/gi, "\\log _");
            //var i;
            latexEquation = nameSpace.Parser._splitRangeFromSolution(latexEquation, equationData);
            if (equationData.isCanBeSolved() === false) {
                return;
            }
            // Function to process sum product case
            //latexEquation = nameSpace.Parser._preProcessSumProductCase(latexEquation, equationData);
            latexEquation = nameSpace.Parser._checkSumProductCase(latexEquation, equationData);
            if (equationData.isCanBeSolved() === false) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, "%cError occured in sum pivot case", ['#ff0000']);
                return;
            }
            nameSpace.Parser._preProcessLatexForErrors(latexEquation, equationData);
            if (equationData.isCanBeSolved() === false) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, "%cError occured in syntax of latex", ['#ff0000']);
                return;
            }
            divideEquationIntoExpressionRegEx = /(.*?)(=|<|>|\\le|\\ge)(.*)/gi;
            expressionMatches = divideEquationIntoExpressionRegEx.exec(latexEquation);

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, latexEquation, []);

            if (expressionMatches === null) {
                equationData.setInEqualityType('=');
                leftExpression.expression = latexEquation;
                //equationData.rightExpression.expression = "0";

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Eqaution is an expression', []);
                //todo solve expression

            }
            else {
                if (expressionMatches[1] === '' || expressionMatches[3] === '') {
                    if (expressionMatches[3] === '') {
                        leftExpression.expression = expressionMatches[1];
                        nameSpace.Parser._preProcessExpression(leftExpression);
                        nameSpace.Parser._parseExpression(leftExpression, equationData);
                    }
                    else {
                        rightExpression.expression = expressionMatches[3];
                        nameSpace.Parser._preProcessExpression(rightExpression);
                        nameSpace.Parser._parseExpression(rightExpression, equationData);
                    }
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('CannotUnderstandThis');
                    return;
                }
                equationData.setInEqualityType(expressionMatches[2]);
                leftExpression.expression = expressionMatches[1];
                rightExpression.expression = expressionMatches[3];
            }

            //start time for left expression pre process stage.
            if (!nameSpace.Parser._deploy) {
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('leftPreProcess');
            }

            nameSpace.Parser._preProcessExpression(leftExpression);

            //processing time for left expression pre process stage.
            if (!nameSpace.Parser._deploy) {
                profiles[0] = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('leftPreProcess');

                $leftPreprocessLatex = $("#pre-process-latex-left");
                $leftPreProcessLatexExpression = $('<div></div>');
                $leftPreprocessLatex.append($leftPreProcessLatexExpression);
                $leftPreProcessLatexExpression.attr('id', 'left-preprocess-latex-expression')
                                              .append(leftExpression.expression)
                                              .css({ 'border': '1px solid', 'border-color': nameSpace.Parser._borderColor, 'padding': '5px 5px 5px 5px' });
                $leftPreprocessLatex.parent().css({ 'border': '1px solid black' });
            }
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'Left expression after preprocessing :: ', []);
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, leftExpression, []);
            if (!nameSpace.Parser._deploy) {
                //start time for left token generation stage.
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('leftTokenGeneration');
            }
            nameSpace.Parser._parseExpression(leftExpression, equationData);

            if (!nameSpace.Parser._deploy) {
                equationParameters = equationData.getLeftEquationParameters();
                nameSpace.Parser._displayArrayOfObjects(equationParameters.operatorsList, 'operators-display-container-left', '#777700', 'white');
                nameSpace.Parser._displayArrayOfObjects(equationParameters.constantsList, 'constants-display-container-left', '#777700', 'white');
                nameSpace.Parser._displayArrayOfObjects(equationParameters.variablesList, 'variables-display-container-left', '#777700', 'white');
                nameSpace.Parser._displayArrayOfObjects(equationParameters.digitsList, 'digits-display-container-left', '#777700', 'white');
                nameSpace.Parser._displayArrayOfObjects(equationParameters.functionsList, 'functions-display-container-left', '#777700', 'white');
            }
            if (!nameSpace.Parser._deploy) {
                //processing time for left token generation stage.
                profiles[1] = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('leftTokenGeneration');
            }
            if (equationData.isCanBeSolved() === false) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                return;
            }
            if (equationData.getSpecie() === 'point') {
                return;
            }


            nameSpace.Parser._displayArrayOfObjects(leftExpression.tokens, 'tokens-display-container-left', '#777700', 'white');

            // case where only digit is give to parse in expression. So no need to parse the whole equation
            if (rightExpression.expression === null) {
                if (leftExpression.tokens.length === 3) {
                    if (leftExpression.tokens[1].type === 'digit' && leftExpression.tokens[0].value === '(' && leftExpression.tokens[2].value === ')') {
                        equationData.setSpecie('number');
                        if (leftExpression.tokens[1].sign === '-') {
                            equationData.setSolution(Number(leftExpression.tokens[1].value) * -1);
                        }
                        else {
                            equationData.setSolution(Number(leftExpression.tokens[1].value));
                        }
                        return;
                    }

                }
                else if (leftExpression.tokens.length === 1) {
                    if (leftExpression.tokens[0].type === 'digit') {
                        equationData.setSpecie('number');
                        if (leftExpression.tokens[0].sign === '-') {
                            equationData.setAccText(nameSpace.TreeProcedures.OPERATOR_TEXT.NEGATIVE + ' ' + nameSpace.TreeProcedures._getAccessibleStringForNumber(leftExpression.tokens[0].value));
                            equationData.setSolution(Number(leftExpression.tokens[0].value) * -1);
                        }
                        else {
                            equationData.setAccText(nameSpace.TreeProcedures._getAccessibleStringForNumber(leftExpression.tokens[0].value));
                            equationData.setSolution(Number(leftExpression.tokens[0].value));
                        }
                        $('#accessibility-display').html('The Accesibility string is ' + equationData.getAccText());
                        return;
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
                if (!nameSpace.Parser._deploy) {
                    //start time for right expression pre process stage.
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('rightPreProcess');
                }

                nameSpace.Parser._preProcessExpression(rightExpression);
                if (!nameSpace.Parser._deploy) {
                    //processing time for pre process stage.
                    profiles[0] += MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('rightPreProcess');
                }

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'right expression after preprocessing :: ', []);
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, rightExpression, []);
                if (!nameSpace.Parser._deploy) {
                    //start time for right token generation stage.
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('rightTokenGeneration');
                }

                nameSpace.Parser._parseExpression(rightExpression, equationData);
                if (!nameSpace.Parser._deploy) {
                    //processing time for token generation stage.
                    profiles[1] += MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('rightTokenGeneration');
                }

                if (equationData.isCanBeSolved() === false) {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                    return;
                }
                //                if (equationData.type === 'point') {
                //                    return;
                //                }


                variable = null;
                for (variable in rightExpression.freevars) {
                    if (freeVariables.indexOf(variable) === -1) {
                        freeVariables.push(variable);
                    }
                }
            }
            else {
                if (freeVariables.length === 0) {
                    equationData.setRhsAuto(true);
                    //TODO just some constants on LHS, RHS should not be simply zero...it should be parsed without RHS in this case
                    rightExpression.expression = '0';
                }
                else if (freeVariables.length === 1) {
                    //check if its just x, if so then add y at RHS
                    if (freeVariables[0] === 'x') {
                        freeVariables.push('y');
                        equationData.setRhsAuto(true);
                        rightExpression.expression = 'y';
                    }
                    else {
                        //TODO CHECK AGAIN AND REVISE
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('Complicated');
                        equationData.setErrorString("Cant understand this");
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                        return;
                    }

                }
                else {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('Cant understand this');
                    equationData.setErrorString('Complicated');
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                    return;
                }
                if (!nameSpace.Parser._deploy) {
                    //start time for right expression pre processing stage.
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('rightPreProcess');
                }

                nameSpace.Parser._preProcessExpression(rightExpression);
                if (!nameSpace.Parser._deploy) {
                    //processing time for pre processing stage.
                    profiles[0] += MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('rightPreProcess');

                    //start time for right token generation stage. 
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('rightTokenGeneration');
                }
                nameSpace.Parser._parseExpression(rightExpression, equationData);
                if (!nameSpace.Parser._deploy) {
                    //processing time for token generation stage.
                    profiles[1] += MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('rightTokenGeneration');
                }
                if (equationData.isCanBeSolved() === false) {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                    return;
                }
                //                if (equationData.type === 'point') {
                //                    return;
                //                }


            }
            if (directives.FDFlagMethod === 'graphing') {
                nameSpace.Parser._getFracDecAnalysis(equationData);
            }
            if (equationData.isCanBeSolved() === false) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                return;
            }
            if (!nameSpace.Parser._deploy) {
                $rightPreprocessLatex = $("#pre-process-latex-right");
                $rightPreProcessLatexExpression = $('<div></div>');
                $rightPreprocessLatex.append($rightPreProcessLatexExpression);
                $rightPreProcessLatexExpression.attr('id', 'right-preprocess-latex-expression')
                                               .append(rightExpression.expression)
                                               .css({ 'border': '1px solid', 'border-color': nameSpace.Parser._borderColor, 'padding': '5px 5px 5px 5px' });
            }
            // If 'r' and 'x' or 'y' both are present in an equation then we consider r as a constant and not a variable
            isRVariablePresent = freeVariables.indexOf('r') !== -1;
            isXYVariablePresent = freeVariables.indexOf('x') !== -1 || freeVariables.indexOf('y') !== -1;
            newFreeVariables = [];
            if (isRVariablePresent && isXYVariablePresent) {
                variableCounter = 0;
                freeVariablesLength = freeVariables.length;
                for (variableCounter; variableCounter < freeVariablesLength; variableCounter++) {
                    if (freeVariables[variableCounter] === 'r') {
                        continue;
                    }
                    newFreeVariables.push(freeVariables[variableCounter]);
                }
                freeVariables = newFreeVariables;
                tokenCounter = 0;
                tokensLength = leftExpression.tokens.length;
                currentToken = null;
                for (tokenCounter; tokenCounter < tokensLength; tokenCounter++) {
                    currentToken = leftExpression.tokens[tokenCounter];
                    if (currentToken.value === 'r') {
                        currentToken.type = 'const';
                    }
                }
                tokensLength = rightExpression.tokens.length;
                for (tokenCounter = 0; tokenCounter < tokensLength; tokenCounter++) {
                    currentToken = rightExpression.tokens[tokenCounter];
                    if (currentToken.value === 'r') {
                        currentToken.type = 'const';
                    }
                }
            }
            //if (isRVariablePresent === true && isXYVariablePresent === false) {
            //    equationData.isPolar = true;
            //}
            //else {
            //    equationData.isPolar = false;
            //}


            nameSpace.Parser._displayArrayOfObjects(rightExpression.tokens, 'tokens-display-container-right', '#777700', 'white');
            if (freeVariables.length > 2) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('MoreFreeVariables');
                equationData.setErrorString(nameSpace.EquationEnums.ERROR_TOO_MANY_FREE_VARIABLES);
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
            }

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[READY]' + 'Final equation is ' + equationData, [nameSpace.Parser._YSTYLE]);
            //checkFreeVariablesCount(equationData);


            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, equationData, []);

            //check if we find any constants that we dont have value for

            noConstantDeclared = false;
            if (equationData.getConstants() === null) {
                noConstantDeclared = true;
            }
            nameSpace.Parser._checkIfOnlyNumbersAndConstantsPresent(equationData);
            if (equationData.isCanBeSolved() === false) {
                return;
            }
            //TODO add freevars count check like constants

            nameSpace.Parser._substituteConstants(leftExpression, equationData, noConstantDeclared);
            nameSpace.Parser._substituteConstants(rightExpression, equationData, noConstantDeclared);

            // The below check is for constants error handling 
            if (!equationData.isCanBeSolved()) {
                this._mergeConstantsErrorData(equationData);
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.error, '%cError occured :: ', ['#ff0000']);
                return;
            }

            nameSpace.Parser._printTokens(leftExpression, 'Left expression ');
            nameSpace.Parser._printTokens(rightExpression, 'Right expression ');

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE1 - Success]' + 'Token Generation Complete', [nameSpace.Parser._YSTYLE]);

            $('#production-rules-display').html('');
            if ($.isEmptyObject(leftExpression.freevars) && $.isEmptyObject(rightExpression.freevars)) {
                equationData.setSpecie('expression');
            }
        },

        _checkIfOnlyNumbersAndConstantsPresent: function _checkIfOnlyNumbersAndConstantsPresent(equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                isLeftOnlyValues,
                leftExpression = equationData.getLeftExpression(),
                rightExpression = equationData.getRightExpression(),
                isRightOnlyValues;
            isLeftOnlyValues = nameSpace.Parser._containsOnlyNumbersAndConstants(leftExpression.tokens);
            isRightOnlyValues = nameSpace.Parser._containsOnlyNumbersAndConstants(rightExpression.tokens);
            if (isLeftOnlyValues === true && isRightOnlyValues === true && equationData.getLatex().indexOf('=') !== -1) {
                equationData.setCanBeSolved(false);
                nameSpace.Parser._substituteConstants(leftExpression, equationData, false);
                nameSpace.Parser._substituteConstants(rightExpression, equationData, false);
                this._mergeConstantsErrorData(equationData);
                equationData.setErrorCode('OnlyNumbers');
            }
        },


        _getFracDecAnalysis: function _getFracDecAnalysis(equationData) {

            var removeFracDecTokens,
                flagL,
                leftExpression = equationData.getLeftExpression(),
                rightExpression = equationData.getRightExpression(),
                flagR,
                analyseForFracDec = function (tokens) {
                    var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                        fracDecErrorTokenValues = ['\\pi', 'e', 'x', 'y'],
                        i = 1,
                        bracketStack = [],
                        err = false,
                        errorString = 'Syntax Error in FracDec',
                        tokenCounter,
                        tokensLength = tokens.length,
                        fracdecOccured = false,
                        currentToken;
                    if (tokens === undefined || tokensLength === 0) {
                        return;
                    }
                    if (tokensLength < 2) {
                        removeFracDecTokens(tokens);
                        return;

                    }
                    if (tokens[0].value !== '\\fracdec') {
                        for (tokenCounter = 0; tokenCounter < tokensLength; tokenCounter++) {
                            currentToken = tokens[tokenCounter];
                            if (currentToken.value === '\\fracdec') {
                                fracdecOccured = true;
                                continue;
                            }
                            if (nameSpace.ParsingProcedures._isValidBracket(currentToken.value)) {
                                if (fracdecOccured) {
                                    nameSpace.ParsingProcedures.recordBracket(bracketStack, currentToken.value);
                                }
                            }
                            else {
                                if (bracketStack.length > 0) {
                                    if (fracDecErrorTokenValues.indexOf(currentToken.value) !== -1) {
                                        equationData.setCanBeSolved(false);
                                        equationData.setErrorString(errorString);
                                        equationData.setErrorCode('FracDecError');
                                        return;
                                    }
                                }
                            }
                        }
                        return 'decimal';
                    }

                    while (i < tokensLength) {
                        if (i === 1 && !nameSpace.ParsingProcedures._isValidBracket(tokens[i].value)) {
                            err = true;
                            break;
                        }
                        nameSpace.ParsingProcedures.recordBracket(bracketStack, tokens[i].value);

                        if (fracDecErrorTokenValues.indexOf(tokens[i].value) !== -1) {
                            err = true;
                            errorString = 'No π or e allowed in fracdec';
                            break;
                        }
                        i++;
                        if (bracketStack.length === 0) {
                            break;
                        }
                    }


                    err = err ? err : bracketStack.length > 0 ? (errorString = 'No π or e allowed in fracdec') : false;

                    if (err) {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorString(errorString);
                        equationData.setErrorCode('FracDecError');
                        return;
                    }

                    if (i < tokens.length) {
                        return "decimal";
                    }

                    return "frac";
                };

            removeFracDecTokens = function (tokens) {
                var i = 0;
                if (!tokens) {
                    return;
                }
                while (i < tokens.length) {
                    if (tokens[i].value === '\\fracdec') {
                        if (tokens.length > i + 1) {
                            if (tokens[i + 1].value !== '(') {
                                equationData.setCanBeSolved(false);
                                equationData.setErrorCode('CannotUnderstandThis');
                                return;
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
                (flagR = analyseForFracDec(rightExpression.tokens));
            }

            removeFracDecTokens(leftExpression.tokens);
            removeFracDecTokens(rightExpression.tokens);

            equationData.setFdFlag(flagR ? flagR : flagL);
        },


        _mergeConstantsErrorData: function _mergeConstantsErrorData(equationData) {
            var errorDataCounter,
                errorDataLength,
                errorData,
                leftExpression = equationData.getLeftExpression(),
                rightExpression = equationData.getRightExpression(),
                currentErrorData;
            equationData.setErrorData([]);
            errorData = equationData.getErrorData();
            if (leftExpression.errorData !== undefined) {
                errorDataCounter = 0;
                errorDataLength = leftExpression.errorData.length;
                for (errorDataCounter; errorDataCounter < errorDataLength; errorDataCounter++) {
                    currentErrorData = leftExpression.errorData[errorDataCounter];
                    if (errorData.indexOf(currentErrorData) === -1) {
                        errorData.push(currentErrorData);
                    }
                }
            }
            if (rightExpression.errorData !== undefined) {
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

        _containsOnlyNumbersAndConstants: function _containsOnlyNumbersAndConstants(tokens) {
            var tokenCounter,
                tokensLength = tokens.length,
                isOnlyValues = true,
                currentToken;
            for (tokenCounter = 0; tokenCounter < tokensLength; tokenCounter++) {
                currentToken = tokens[tokenCounter];
                if (currentToken.type === 'digit' || currentToken.type === 'opr') {
                    continue;
                }
                if (currentToken.type === 'const') {
                    if (currentToken.value === 'e' || currentToken.value === '\\pi') {
                        isOnlyValues = false;
                        break;
                    }
                    else {
                        continue;
                    }
                }
                else {
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
        _isCommaFunction: function _isCommaFunction(functionName) {
            var COMMA_FUNCTIONS = ['\\lcm', '\\gcd', '\\min', '\\nPr', '\\nCr', '\\mod'];
            return COMMA_FUNCTIONS.indexOf(functionName) !== -1;
        },

        _parseAndSetRange: function _parseAndSetRange(rangeTokens, equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
            predictionStack;
            if (rangeTokens.length < 2) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('ComplicatedRange');
                return;
            }
            nameSpace.RangeProductionRules.generateRules();
            predictionStack = nameSpace.Parser._recursiveDescentParser(equationData, rangeTokens, 0, 0, [undefined], true);
            if (predictionStack === undefined) {
                equationData.setCanBeSolved(false);
            }
            if (equationData.isCanBeSolved() === false) {
                equationData.setErrorCode('ComplicatedRange');
                return;
            }
            equationData.setRange(nameSpace.Parser._setRangeFromSequenceString(predictionStack, rangeTokens, equationData));
        },

        _setRangeFromSequenceString: function _setRangeFromSequenceString(predictionStack, tokens, equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                range = {
                    min: null,
                    max: null,
                    variable: null
                },
                sequenceString,
                sequences,
                //variable,
                //min,
                sequencesLength,
                //max,
                //varIndex,
                minMax,
                isMin,
                rangeSplits;
            sequenceString = nameSpace.RangeProductionRules.solution[predictionStack[0]];
            sequences = sequenceString.split(' ');
            sequencesLength = sequences.length;
            if (sequencesLength === 2) {
                if (sequences[0].indexOf('var') === -1) {
                    range.variable = sequences[1];
                    minMax = sequences[0];
                    isMin = sequences[0].indexOf('min') !== -1;
                }
                else {
                    range.variable = sequences[0];
                    minMax = sequences[1];
                    isMin = sequences[1].indexOf('min') !== -1;
                }
                if (isMin) {
                    range.min = nameSpace.Parser._createMinMaxObject(minMax, tokens);
                }
                else {
                    range.max = nameSpace.Parser._createMinMaxObject(minMax, tokens);
                }
            }
            else {
                range.variable = sequences[1];
                if (sequences[0].indexOf('min') !== -1) {
                    range.min = nameSpace.Parser._createMinMaxObject(sequences[0], tokens);
                    range.max = nameSpace.Parser._createMinMaxObject(sequences[2], tokens);
                }
                else {
                    range.min = nameSpace.Parser._createMinMaxObject(sequences[2], tokens);
                    range.max = nameSpace.Parser._createMinMaxObject(sequences[0], tokens);
                }
                if (range.min.value >= range.max.value) {
                    equationData.setCanBeSolved(false);
                }
            }
            rangeSplits = range.variable.split('.');
            range.variable = tokens[(Number)(rangeSplits[rangeSplits.length - 1])].value;
            return range;
        },

        _createMinMaxObject: function _createMinMaxObject(sequence, tokens) {
            var minMax = {
                include: sequence.indexOf('equal') !== -1,
                value: null
            },
            sequenceSplits,
            valueToken;
            sequenceSplits = sequence.split('.');
            valueToken = tokens[sequenceSplits[sequenceSplits.length - 1]];
            minMax.value = (Number)(valueToken.value);
            if (valueToken.sign === '-') {
                minMax.value *= -1;
            }
            return minMax;
        },

        //_parseAndSetRange: function _parseAndSetRange(rangeTokens, equationData) {
        //    var range = {
        //        min: null,
        //        max: null,
        //        variable: null
        //    },
        //    tokenCounter,
        //    tokensLength = rangeTokens.length,
        //    previousToken = null,
        //    nextToken = null,
        //    currentToken,
        //    firstToken = true,
        //    errorOccurred = false;
        //    for (tokenCounter = 0; tokenCounter < tokensLength; tokenCounter++) {
        //        nextToken = null;
        //        if (tokenCounter !== tokensLength - 1) {
        //            nextToken = rangeTokens[tokenCounter + 1];
        //        }
        //        currentToken = rangeTokens[tokenCounter];

        //        if (currentToken.type === 'func' || currentToken.type === 'opr') {
        //            if (firstToken) {
        //                errorOccurred = true;
        //            }
        //            else if (nextToken === null) {
        //                errorOccurred = true;
        //            }
        //            else{
        //                if (previousToken.type === 'func' || previousToken.type === 'opr') {
        //                    errorOccurred = true;
        //                }
        //                else if (nextToken !== null && (previousToken.type === 'func' || previousToken.type === 'opr')) {
        //                    errorOccurred = true;
        //                }
        //            }
        //        }
        //        if (errorOccurred === false) {
        //            switch (currentToken.value) {
        //                case '\\le':
        //                    if (previousToken.type === 'var') {
        //                        if (range.variable === null) {
        //                            range.variable = previousToken.value;
        //                        }
        //                        else {
        //                            errorOccurred = true;
        //                        }
        //                    }
        //                    else if(previousToken.type === 'var')
        //            }
        //        }
        //        if (errorOccurred === true) {
        //            equationData.canBeSolved = false;
        //            equationData.errorCode = 'RangeError';
        //            return;
        //        }
        //        firstToken = false;
        //    }
        //},

        /**

            Function to split range from the equation latex provided
     
            @private
            @method _splitRangeFromSolution
            @param latexString{String} The equation latex string
            @param equationData{Object} The equation data objetc for the current equation
            @return {String} The latex string with range seperated
            @static
        **/
        _splitRangeFromSolution: function _splitRangeFromSolution(latexString, equationData) {
            var regexEnd = /(\\\})/,
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                equationRangeList = latexString.split('\\{'),
                tokens;

            if (equationRangeList[1]) {
                if (equationRangeList[1].indexOf('\\}') !== (equationRangeList[1].length - 2) || latexString.indexOf('\\}') !== latexString.length - 2) {
                    equationData.setCanBeSolved(false);
                    equationData.setErrorCode('CannotUnderstandThis');
                    return;
                }
                equationRangeList[1] = equationRangeList[1].replace(regexEnd, '');
                tokens = nameSpace.Parser._generateTokens(equationRangeList[1], equationData);
                if (equationData.isCanBeSolved() === false) {
                    return;
                }
                nameSpace.Parser._parseAndSetRange(tokens, equationData);
            }
            if (equationRangeList[0] === '') {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
            }
            return equationRangeList[0];

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
        _preProcessLatexForErrors: function _preProcessLatexForErrors(latexEquation, equationData) {
            var raisedToErrorCaseRegex = /[\\a-zA-Z0-9]*[\^][a-zA-Z0-9](([0-9]+)|([\.]))/g,
                //raisedToDecimalErrorCase = /[\\a-zA-Z0-9]*[\^][0-9]+[\.]/g,
                matches,
                matchCounter,
                matchesLength,
                match,
                errorCaseRegex;

            if (latexEquation.indexOf('---') !== -1) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return;
            }

            matches = latexEquation.match(raisedToErrorCaseRegex);
            if (matches !== null) {
                matchesLength = matches.length;
                errorCaseRegex = /\\[a-zA-Z0-9]+[\^][a-zA-Z0-9][0-9]+(([\.]?[0-9])*)/g;
                for (matchCounter = 0; matchCounter < matchesLength; matchCounter++) {
                    match = errorCaseRegex.exec(matches[matchCounter]);
                    if (match === null) {
                        equationData.setCanBeSolved(false);
                        equationData.setErrorCode('CannotUnderstandThis');
                        return;
                    }
                }
            }
            //            matches = latexEquation.match(raisedToDecimalErrorCase);
            //            if (matches !== null) {
            //                equationData.canBeSolved = false;
            //                equationData.errorCode = 'Complicated';
            //                return;
            //            }
            if (latexEquation.indexOf('!!') !== -1) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return;
            }
            //if (match !== null) {
            //    equationData.canBeSolved = false;
            //}
        },

        /**
        Returns function variable precedence index. This is used when equation has two free variables that are eligible to be chosen as a function variable.
    
        @private
        @method _getFunctionVariablePrecedenceIndex
        @param functionVariable{String}
        @return {integer} function variable precedence index
        @static
        **/

        _getFunctionVariablePrecedenceIndex: function _getFunctionVariablePrecedenceIndex(funcVariable) {
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
        _shiftAllRightTokensToLeft: function _shiftAllRightTokensToLeft(equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
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
                plusToken = nameSpace.Parser._getFactoryToken();
                plusToken.value = '+';
                plusToken.isValid = true;
                plusToken.type = 'opr';
                plusToken.sign = '+';
                leftExpression.tokens.push(plusToken);
                if (currentRightToken.sign === '-') {
                    currentRightToken.sign = '+';
                }
                else {
                    currentRightToken.sign = '-';
                }
                leftExpression.tokens.push(currentRightToken);
            }
            zeroToken = nameSpace.Parser._getFactoryToken();
            zeroToken.value = '0';
            zeroToken.isValid = true;
            zeroToken.type = 'digit';
            zeroToken.sign = '+';

            rightExpression.tokens = [];
            rightExpression.tokens.push(zeroToken);
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Shifted all right tokens to left ----------------------------------------------', []);
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, equationData, []);
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
        _preProcessExpression: function _preProcessExpression(equationExpression) {
            if (equationExpression === undefined) {
                return;
            }
            //equationExpression.expression = equationExpression.expression.replace(/\s/g, '');// removes spaces
            //equationExpression.expression = equationExpression.expression.replace(/\-\-/g, '+');
            equationExpression.expression = equationExpression.expression.replace(/\\times/g, '\\cdot ');
            // replaces '--' with '+'
            var cdotCharString = '\\cdot ',
            cdotCharLength = cdotCharString.length,
            negativeNumberRegex = /(\(|\[|\{|\+|\\cdot\s|,)/,
            expressionCharCounter = 0,
            currentChar,
            previousChar,
            lengthCounter,
            //self,
            isMultiplyOperator,
            //i/p: \\text{fracdec} ; o/p: \\fracdec
            fracdecRegex = /\\text\{fracdec}/g,

            absRegex = /\\text\{abs}/g,

            //i/p:  \\left\\lceil ; o/p: \\ceil( ; same for floor
            leftCeilFloorRegex = /\\l((ceil)|(floor))/g,

            //i/p: \\right\\rceil ; o/p: ) ; same for floor
            rightCeilFloorRegex = /\\r(ceil|floor)/g,

            replaceFunction,
            //ip: \\sin^{-1}; o/p \\arcsin
            inverseTrigoReplacementRegex = /(\\sin\^\{\-1\}|\\cos\^\{\-1\}|\\tan\^\{\-1\}|\\cot\^\{\-1\}|\\csc\^\{\-1\}|\\sec\^\{\-1\}|\\sinh\^\{\-1\}|\\cosh\^\{\-1\}|\\tanh\^\{\-1\}|\\coth\^\{\-1\}|\\csch\^\{\-1\}|\\sech\^\{\-1\})/g,
            //i/p: sqrt{3}; o/p: sqrt[2]{3}

            sRootRegex = /\\sqrt\{/g,
            sRootReplacement = '\\sqrt[2]{',

            //i/p: \log_{x}y ; o/p: \log_{x}(y)
            log_Regex = /\\log_([\{]([0-9a-zA-Z\+\_\.\!\%\-\\()\[\]\^]+)[\}])(([0-9]+[\.]?[0-9]*)|([\.][0-9]+)[A-Za-z]*(\\theta)?(\\pi\s)?|\\theta|\\pi\s|[A-Za-z])/g,

            //i/p: \log_x(y) ; o/p: \log_{x}(y)
            log_Regex1 = /\\log_([0-9]|[A-Za-z])([\(]([0-9a-zA-Z\+\_\.\!\%\-\\{}()\[\]\^]+)[\)])/g,

            //i/p: \log_xy ; o/p: \log_{x}(y)
            log_Regex2 = /\\log_([0-9]|[A-Za-z])(([0-9]+[\.]?[0-9]*)|([\.][0-9]+)[A-Za-z]*(\\theta)?(\\pi\s)?|\\theta|\\pi\s|[A-Za-z])/g,

            //i/p: \prod{n=1.2}^555 ; o/p: \prod{n=1.2}^{5}55
            prodRegex = /\\prod_\{[A-Za-z]=(([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[\.][0-9]+)|([\-]?\\theta|[\-]?\\pi|[\-]?[A-Za-z])[A-Za-z]*(\\theta)*(\\pi)*|[\-]?\\theta|[\-]?\\pi|[\-]?[a-zA-Z])\}\^([0-9]|[A-Za-z])/g,

            //i/p: \sum_{n=1.2}^555 ; o/p: \sum_{n=1.2}^{5}55
            sumRegex = /\\sum_\{[A-Za-z]=(([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[\.][0-9]+)|([\-]?\\theta|[\-]?\\pi|[\-]?[A-Za-z])[A-Za-z]*(\\theta)*(\\pi)*|[\-]?\\theta|[\-]?\\pi|[\-]?[a-zA-Z])\}\^([0-9]|[A-Za-z])/g,

            //i/p: \log5.44 ; o/p: \log(5.44)
            logLnRegex = /(\\log|\\ln)((([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[\.][0-9]+)|([\-]?[A-Za-z])|([\-]?(\\theta))|([\-]?(\\pi\s)))[A-Za-z]*(\\theta)*(\\pi\s)*|[\-]?\\theta|[\-]?\\pi\s|[\-]?[a-zA-Z])/g,

            //i/p: \sinh2.5 ; o/p: \sinh(2.5)
            trigoRegex = /(\\sinh|\\cosh|\\tanh|\\csch|\\sech|\\coth)((([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[\.]?[0-9]+)|([\-]?[A-Za-z]+)|([\-]?(?:\\pi\s)+)|([\-]?(?:\\theta)+))((\\theta)*(\\pi\s)*[A-Za-z]*)|([\-]?[\w]))/g,

            //i/p: \sinh ; o/p: \sin(h)
            trigoRegex1 = /(\\sin|\\cos|\\tan|\\csc|\\sec|\\cot|\\arcsin|\\arccos|\\arctan|\\arccsc|\\arcsec|\\arccot)([\-]?[h])([^\w\d\(\^]|$)/g,

            //i/p: \arccos5.5 ; o/p: \arccos(5.5)
            trigoRegex2 = /(\\sin|\\cos|\\tan|\\csc|\\sec|\\cot|\\arcsin|\\arccos|\\arctan|\\arccsc|\\arcsec|\\arccot)((([\-]?(?:\\theta\s)+)|([\-]?(?:\\pi\s)+)|([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[\.]?[0-9]+)|([\-]?[A-Za-z]+))([A-Za-z]*(\\pi\s)*)(\\theta\s)*|([\-]?[\w]))/g,

            //i/p: 2^{25}! ; o/p: (2^{25})!
            powFactRegex = /(([\-]?[0-9]*[\.]?[0-9]*[A-Za-z]*(\\theta)*(\\pi\s)*)[\^][\{]([\-]?[0-9]*[\.]?[0-9]*[A-Za-z]*(\\theta)*(\\pi\s)*)[\}])[\!]/g,

            //i/p: 2^2! ; o/p: (2^2)!
            powFactRegex1 = /(([0-9]*[\.]?[0-9]*[A-Za-z]*(\\theta)*(\\pi\s)*)[\^]([0-9a-zA-Z]))[\!]/g,

            //i/p: 2^{25}\% ; o/p : (2^{25})\%
            powPercentRegex = /(([\-]?[0-9]*[\.]?[0-9]*[A-Za-z]*(\\theta)*(\\pi\s)*)[\^][\{]([\-]?[0-9]*[\.]?[0-9]*[A-Za-z]*(\\theta)*(\\pi\s)*)[\}])([\\][\%])/g,

            //i/p: 2^2\% ; o/p: (2^2)\%
            powPercentRegex1 = /(([0-9]*[\.]?[0-9]*[A-Za-z]*(\\theta)*(\\pi\s)*)[\^]([0-9]+[\.]?[0-9]*[A-Za-z]*(\\theta)*(\\pi\s)*))([\\][\%])/g,
            //casses commented below to handle only one factorial
            //i/p: 2!! ; o/p: (2!)!
            //factRegex = /([\(|\)|\{|\}|\[|\]|\+|\-|\/|\%|\*|\^])?((([\-]?[\.][0-9]+)|([\-]?[A-Za-z])|([\-]?(\\theta))|([\-]?(\\pi))|([\-]?[0-9]+[\.]?[0-9]*)))[\!]([\!])/g,

            //i/p: 2!!!! o/p: (((2!)!)!)!
            //factRegex1 = /([\(|\)|\{|\}|\[|\]|\+|\-|\/|\%|\*|\^])?([\(]+(([\-]?[\.][0-9]+)|([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[A-Za-z])|([\-]?(\\theta))|([\-]?(\\pi)))([\!][\)])+)([\!]([\!]+))/g,

            //i/p: x\\%\\% ; o/p: (x\\%)\\%
            percentRegex = /([\(|\)|\{|\}|\[|\]|\+|\-|\/|\%|\*|\^|])?((([\-]?[\.][0-9]+)|([\-]?[A-Za-z])|([\-]?(\\theta))|([\-]?(\\pi\s))|([\-]?[0-9]+[\.]?[0-9]*)))[\\][\%]([\\][\%])/g,

            //i/p: x\\%\\%\\% ; o/p: ((x\\%)\\%)\\%
            percentRegex1 = /([\(|\)|\{|\}|\[|\]|\+|\-|\/|\%|\*|\^])?([\(]+(([\-]?[\.][0-9]+)|([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[A-Za-z])|([\-]?(\\theta))|([\-]?(\\pi\s)))([\\][\%][\)])+)([\\][\%]([\\][\%]+))/g,

            //i/p: x!^y ; o/p: (x!)^y
            factPowRegex = /((([\-]?[0-9]+[\.]?[0-9]*)|([\-]?(\\theta))|([\-]?(\\pi\s))|([\-]?[\.][0-9]+)|([\-]?[a-zA-Z]))[\!])([/^]([\{]|[0-9A-Za-z]))/g,

            //i/p: \log_x^yz ; o/p: \log_{x}^{y}(z)
            logPowerRegex = /(\\log_)(([0-9A-Za-z])|[\{]([0-9a-zA-Z\+\_\.\-\\{}()\[\]\^]+|(?:[\-]?(\\pi\s)))[\}])[\^](([0-9A-Za-z])|[\{]([0-9a-zA-Z\+\_\.\-\\{}()\[\]\^]+|(?:[\-]?(\\pi\s)))[\}])(([\-]?[\.][0-9]+)|([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[A-Za-z])|([\-]?(\\theta))|([\-]?(\\pi\s)))/g,

            //i/p: \sin^2x o/p: \sin^2(x) 
            trigoLogRegex = /(\\sin|\\cos|\\tan|\\csc|\\sec|\\cot|\\sinh|\\cosh|\\tanh|\\csch|\\sech|\\coth|\\arcsin|\\arccos|\\arctan|\\arccsc|\\arcsec|\\arccot|\\log|\\ln)[\^]([0-9A-Za-z])(([\-]?[\.][0-9]+)|([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[A-Za-z])|([\-]?(\\theta))|([\-]?(\\pi\s)))/g,

             //i/p: \log^{3.5}y ; o/p: \log^{3.5}(y)
            trigoLogRegex1 = /(\\sin|\\cos|\\tan|\\csc|\\sec|\\cot|\\sinh|\\cosh|\\tanh|\\csch|\\sech|\\coth|\\arcsin|\\arccos|\\arctan|\\arccsc|\\arcsec|\\arccot|\\log|\\ln)[\^]([\{]([0-9a-zA-Z\+\_\.\-\\{}()\[\]\^]+|(?:[\-]?(\\pi\s)))[\}])(([\-]?[\.][0-9]+)|([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[A-Za-z])|([\-]?(\\theta))|([\-]?(\\pi\s)))/g,

            //i/p: x!\\% ; o/p: (x!)\\%
            //factPercentRegex = /([\(|\)|\{|\}|\[|\]|\+|\-|\/|\%|\*|\^|])?((([\-]?[\.][0-9]+)|([\-]?[A-Za-z])|([\-]?(\\theta))|([\-]?(\\pi\s))|([\-]?[0-9]+[\.]?[0-9]*)))(([\\][\%])|[\!])(([\\][\%])|[\!])/g;

            self = this;

            equationExpression.expression = equationExpression.expression.replace(inverseTrigoReplacementRegex, function ($0) {
                var trigIndex = self._INVERSIBLE_FUNCTIONS.indexOf($0);
                return self._INVERT_FUNCTIONS_IN_ORDER[trigIndex];
            });

            equationExpression.expression = equationExpression.expression.replace(fracdecRegex, '\\fracdec');
            equationExpression.expression = equationExpression.expression.replace(absRegex, '\\abs');
            equationExpression.expression = equationExpression.expression.replace(leftCeilFloorRegex, function ($0, $1) {

                return ('\\' + $1 + '(');
            });
            equationExpression.expression = equationExpression.expression.replace(rightCeilFloorRegex, ')');

            //i/p: x\\%!!\\% ; o/p: (((x\\%)!)!)\\%
            //factPercentRegex1 = /([\(|\)|\{|\}|\[|\]|\+|\-|\/|\%|\*|\^])?([\(]+(([\-]?[\.][0-9]+)|([\-]?[0-9]+[\.]?[0-9]*)|([\-]?[A-Za-z])|([\-]?(\\theta))|([\-]?(\\pi )))((([\\][\%])|[\!])[\)])+)(([\\][\%])|[\!])((([\\][\%])|[\!])+)/g;
            //return;
            //Handling square root cases
            // handled in token processing
            //equationExpression.expression = equationExpression.expression.replace(sRootRegex, sRootReplacement);

            // Handling log to the base cases
            // handled in token processing
            //equationExpression.expression = equationExpression.expression.replace(log_Regex, function ($0, $1, $2, $3) {
            //    return ("\\log_" + $1 + "(" + $3 + ")");
            //});
            //equationExpression.expression = equationExpression.expression.replace(log_Regex1, function ($0, $1, $2) {
            //    return ("\\log_{" + $1 + "}" + $2);
            //});
            //equationExpression.expression = equationExpression.expression.replace(log_Regex2, function ($0, $1, $2) {
            //    return ("\\log_{" + $1 + "}(" + $2 + ")");
            //});

            // Handling cases for product of terms from n=a to n=b
            equationExpression.expression = equationExpression.expression.replace(prodRegex, function ($0, $1, $2, $3, $4, $5, $6, $7) {
                return ("\\prod_{n=" + $1 + "}^{" + $7 + "}");
            });

            // Handling cases for sum of terms from n=a to n=b
            equationExpression.expression = equationExpression.expression.replace(sumRegex, function ($0, $1, $2, $3, $4, $5, $6, $7) {
                return ("\\sum_{n=" + $1 + "}^{" + $7 + "}");
            });
            //Handling cases for log and ln.
            // handled in token processing
            //equationExpression.expression = equationExpression.expression.replace(logLnRegex, function ($0, $1, $2) {
            //    return ($1 + "(" + $2 + ")");
            //});

            //Handling cases for trigonometric functions (sin, cos, tan, cosec, sec, cot), inverse trigonometric functions, hyperbolic functions. 
            // handled in token processing
            //equationExpression.expression = equationExpression.expression.replace(trigoRegex, function ($0, $1, $2) {
            //    return ($1 + "(" + $2 + ")");
            //});
            //equationExpression.expression = equationExpression.expression.replace(trigoRegex1, function ($0, $1, $2, $3) {
            //    if ($3 === undefined || $3 === '') {
            //        return ($1 + "(" + $2 + ")");
            //    }
            //    else {
            //        return ($1 + "(" + $2 + ")" + $3);
            //    }
            //});
            //equationExpression.expression = equationExpression.expression.replace(trigoRegex2, function ($0, $1, $2) {
            //    if ($2 === 'h') {

            //        return ($1 + $2);
            //    }
            //    return ($1 + "(" + $2 + ")");
            //});
            //Handling cases for factorial.
            //equationExpression.expression = equationExpression.expression.replace(powFactRegex, function ($0, $1) {
            //    return ("(" + $1 + ")!");
            //});
            //equationExpression.expression = equationExpression.expression.replace(powFactRegex1, function ($0, $1) {
            //    return ("(" + $1 + ")!");
            //});


            //Handling cases for ^ followed by \%
            equationExpression.expression = equationExpression.expression.replace(powPercentRegex, function ($0, $1, $2) {
                $2 = null;
                return ("(" + $1 + ")\\%");
            });
            equationExpression.expression = equationExpression.expression.replace(powPercentRegex1, function ($0, $1, $2) {
                $2 = null;
                return ("(" + $1 + ")\\%");
            });

            //Handling cases for multiple factorials.
            /*
            equationExpression.expression = equationExpression.expression.replace(factRegex, function ($0, $1, $2) {


                if ($1 === undefined) {
                    return ('(' + $2 + '!)!');
                }
                else {
                    return ($1 + '(' + $2 + '!)!');
                }
            });

            lengthCounter = 1;
            replaceFunction = function ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) {
                if ($13.length > lengthCounter) {
                    lengthCounter = $13.length;
                }
                if ($1 === undefined) {
                    return ('(' + $2 + '!)' + $13);
                }
                else {
                    return ($1 + '(' + $2 + '!)' + $13);
                }
            };
            while (lengthCounter !== 0) {
                equationExpression.expression = equationExpression.expression.replace(factRegex1, replaceFunction);
                lengthCounter--;
            }
            */
            //Handling cases for multiple \\%.
            equationExpression.expression = equationExpression.expression.replace(percentRegex, function ($0, $1, $2) {
                if ($1 === undefined || $1 === '') {
                    return ('(' + $2 + '\\%)\\%');
                }
                else {
                    return ($1 + '(' + $2 + '\\%)\\%');
                }
            });

            lengthCounter = 1;
            replaceFunction = function ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) {
                if ($13.length > lengthCounter) {
                    lengthCounter = $13.length;
                }
                if ($1 === undefined || $1 === '') {
                    return ('(' + $2 + '\\%)\\%');
                }
                else {
                    return ($1 + '(' + $2 + '\\%)\\%');
                }
            };
            while (lengthCounter !== 0) {
                equationExpression.expression = equationExpression.expression.replace(percentRegex1, replaceFunction);
                lengthCounter--;
            }

            //Handling cases for multiple factorials and percent.
            /*
            equationExpression.expression = equationExpression.expression.replace(factPercentRegex, function ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) {
                if ($1 === undefined) {

                    return ('(' + $2 + $11 + ')' + $13);
                }
                else {
                    return ($1 + '(' + $2 + $11 + ')' + $13);
                }

            });
            lengthCounter = 1;
            replaceFunction = function ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) {
                if ($16.length > lengthCounter) {
                    lengthCounter = $16.length;
                }
                if ($1 === undefined) {

                    return ('(' + $2 + $14 + ')' + $16);
                }
                else {
                    return ($1 + '(' + $2 + $14 + ')' + $16);
                }
            };
            while (lengthCounter !== 0) {
                equationExpression.expression = equationExpression.expression.replace(factPercentRegex1, replaceFunction);
                lengthCounter--;
            }*/
            //Handling cases for factorial followed by power.
            equationExpression.expression = equationExpression.expression.replace(factPowRegex, function ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) {
                return ("(" + $1 + ")" + $10);
            });


            //Handling cases for type log_x^yz.
            equationExpression.expression = equationExpression.expression.replace(logPowerRegex, function ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) {
                var value = '';
                if ($4 === undefined || $4 === '') {
                    value = $1 + '{' + $2 + '}^{';
                }
                else {
                    value = $1 + '{' + $4 + '}^{';
                }
                if ($8 === undefined || $8 === '') {
                    return (value + $6 + '}(' + $10 + ')');
                }
                else {
                    return (value + $8 + '}(' + $10 + ')');
                }
            });
            //Handling cases for trigononmetric or logarithmic functions to the power.
            // handled in token processing
            //equationExpression.expression = equationExpression.expression.replace(trigoLogRegex, function ($0, $1, $2, $3) {
            //    return ($1 + '^' + $2 + '(' + $3 + ')');
            //});
            //equationExpression.expression = equationExpression.expression.replace(trigoLogRegex1, function ($0, $1, $2, $3, $4, $5) {
            //    return ($1 + '^' + $2 + '(' + $5 + ')');
            //});

            //for (expressionCharCounter = 0; expressionCharCounter < equationExpression.expression.length; expressionCharCounter++) {

            //    currentChar = equationExpression.expression.charAt(expressionCharCounter);
            //    if (currentChar === '-') {
            //        // if first character is '-' then no need to replace it
            //        if (expressionCharCounter === 0) {
            //            continue;
            //        }
            //        previousChar = equationExpression.expression.charAt(expressionCharCounter - 1);
            //        //check for \cdot case
            //        if (previousChar === ' ') {
            //            if (expressionCharCounter > cdotCharLength) {
            //                isMultiplyOperator = (equationExpression.expression.substring(expressionCharCounter - cdotCharLength, expressionCharCounter) === cdotCharString);
            //            }
            //            if (isMultiplyOperator) {
            //                continue;
            //            }
            //        }
            //        // Check if '-' is for negative and minus operator
            //        if (negativeNumberRegex.test(previousChar)) {
            //            continue;
            //        }
            //        //TODO increment counter when '+-' is added for '-'
            //        equationExpression.expression = equationExpression.expression.substring(0, expressionCharCounter) + '+-' + equationExpression.expression.substring(expressionCharCounter + 1, equationExpression.expression.length);
            //    }
            //}
        },




        /**
        Function for processing errors occured during parsing of equation. The functions shows a popup with error description.
    
        @private
        @method _processError
        @param  equationData{Object} The equation object passed to the parser
        @return void
        @static
        @deprecated
        **/
        _processError: function _processError(equationData) {
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
        _getValueOfConstantFromEquationData: function _getValueOfConstantFromEquationData(equationData, constantName) {
            if (equationData === null || equationData === undefined) {
                return null;
            }
            var constants = equationData.getConstants();
            if (constants === null) {
                return null;
            }
            if (constants[constantName] === undefined) {
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
        _calculateMaxPowerOfVariable: function _calculateMaxPowerOfVariable(equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
            returnPowers = null,
            variable = null,
            freeVar = null,
            leftExpression = equationData.getLeftExpression(),
            leftRoot = equationData.getLeftRoot(),
            equationFreeVars,
            isQuadraticVariablePresent = false,
            isNonComplicatedVariablePresent = false,
            currentVariableValue;
            returnPowers = nameSpace.Parser._getFreeVarPower(leftRoot, leftExpression.freevars);
            for (variable in leftExpression.freevars) {
                leftExpression.freevars[variable] = returnPowers[variable];
            }
            /*
            Since we convert equation to a SOMETHING = 0 format, no need to check on right
            returnPowers = nameSpace.Parser._getFreeVarPower(equationData.rightRoot, equationData.rightExpression.freevars);
            variable = null;
            for (variable in equationData.rightExpression.freevars) {
                equationData.rightExpression.freevars[variable] = returnPowers[variable];
            }
            equationData.freeVars = {};
            for (freeVar in equationData.rightExpression.freevars) {
                if (freeVar in equationData.freeVars) {
                    if (equationData.freeVars[freeVar] !== 'c' && (equationData.freeVars[freeVar] < equationData.rightExpression.freevars[freeVar] || equationData.rightExpression.freevars[freeVar] === 'c')) {
                        equationData.freeVars[freeVar] = equationData.rightExpression.freevars[freeVar];
                    }
                }
                else {
                    equationData.freeVars[freeVar] = equationData.rightExpression.freevars[freeVar];
                }
            }*/
            freeVar = null;
            //equationData.freeVars = {};
            equationData.setFreeVars({});
            equationFreeVars = equationData.getFreeVars();
            for (freeVar in leftExpression.freevars) {
                if (freeVar in equationFreeVars) {
                    if (equationFreeVars[freeVar] !== 'c' && (equationFreeVars[freeVar] < leftExpression.freevars[freeVar] || leftExpression.freevars[freeVar] === 'c')) {
                        equationFreeVars[freeVar] = leftExpression.freevars[freeVar];
                    }
                }
                else {
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

            if (isNonComplicatedVariablePresent === true) {
                variable = null;
                for (variable in equationFreeVars) {
                    currentVariableValue = equationFreeVars[variable];
                    if (currentVariableValue !== 'c' && currentVariableValue !== Infinity && !isNaN(currentVariableValue)) {
                        if (currentVariableValue <= 2 && currentVariableValue !== 0) {
                            isQuadraticVariablePresent = true;
                            break;
                        }
                    }
                }
            }
            else {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('Complicated');
                equationData.setErrorString(nameSpace.EquationEnums.ERROR_COMPLICATED);
                return;
            }

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Max power', []);
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, equationData.freeVars, []);
            if (isQuadraticVariablePresent === false) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('NoneVariablesQuadratic');
                equationData.setErrorString(nameSpace.EquationEnums.ERROR_VARIABLE_HAS_TO_BE_QUADRATIC);
                return;
            }
        },

        /**
        Function to substitute value of constants provided inside the equation data object. If any of the constants has no value  provided then the error variable is set.
        This function also substitues value of `pi` and `e`.
           
        @private
        @method _substituteConstants
        @param expression{Object} left or right expression from equationData
        @param  equationData{Object}
        @param noConstantDeclared {Boolean} true if equationData object has a property `constant` else false
        @return Void
        @static
        **/
        _substituteConstants: function _substituteConstants(expression, equationData, noConstantDeclared) {
            var constantValue,
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                errorData = [],
                errorOccured = false,
                i,
                equationConstants = equationData.getConstants(),
                addToErrorData;
            for (i = 0; i < expression.tokens.length; i++) {
                constantValue = undefined;
                addToErrorData = false;
                if (expression.tokens[i].type === "const") {

                    //if (noConstantDeclared) {
                    //    errorOccured = true;
                    //    addToErrorData = true;
                    //    continue;
                    //}
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'substituting value of constant ' + expression.tokens[i].value, []);
                    //if (!noConstantDeclared) {
                    //    constantValue = equationData.constants[expression.tokens[i].value];
                    //}
                    if (constantValue === undefined) {
                        constantValue = nameSpace.Parser._constants[expression.tokens[i].value];
                        expression.tokens[i].constantSubstituted = expression.tokens[i].value;
                    }
                    if (constantValue === undefined) {
                        if (equationConstants === null || noConstantDeclared || equationConstants[expression.tokens[i].value] === undefined) {
                            if (expression.tokens[i].value !== equationData.getPivot()) {
                                addToErrorData = true;
                                errorOccured = true;
                            }
                        }
                    }
                    else {
                        expression.tokens[i].value = constantValue;
                        expression.tokens[i].type = "digit";
                    }
                }
                if (addToErrorData) {
                    if (errorData.indexOf(expression.tokens[i].value) === -1) {
                        errorData.push(expression.tokens[i].value);
                    }
                }
            }
            if (errorOccured) {
                expression.errorData = errorData;

                // changes for tei 
                // todo: give proper solution
                MathUtilities.Components.EquationEngine.Models.Parser.processTokensWithRules(equationData);
                if (equationData.isCanBeSolved() === false) {
                    equationData.setErrorCode('CannotUnderstandThis');
                }
                else {
                    equationData.setErrorCode('ConstantDeclaration');
                }
                equationData.setCanBeSolved(false);
                equationData.setErrorString(nameSpace.EquationEnums.ERROR_CONSTANTS_NOT_DEFINED);
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'I found a constant that didnt have value specified ', []);
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, equationData.getErrorData(), []);
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
        _getBracketBounds: function _getBracketBounds(tokens, startIndex) {
            var startToken = tokens[startIndex].value,
                endToken,
                repeatedStartTokensCount,
                tokensLength,
                tokensCounter,
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            if (tokens === null || tokens === undefined) {

                return -1;
            }
            if (tokens.length === 0) {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Empty tokens', []);
                return -1;
            }
            if (tokens.length < startIndex + 1) {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'invalid start index ' + startIndex, []);
                return -1;
            }

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, "Finding end token for " + startToken, []);
            if (startToken === "{") {
                endToken = "}";
            }
            else {
                if (startToken === "(") {
                    endToken = ")";
                }
                else {

                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Invalid Start Token ' + startToken, []);
                }
            }
            repeatedStartTokensCount = 0;
            tokensLength = tokens.length;
            tokensCounter = null;
            for (tokensCounter = startIndex + 1; tokensCounter < tokensLength; tokensCounter++) {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, tokens[tokensCounter].value + " >> " + startToken, []);
                if (tokens[tokensCounter].value === startToken) {
                    repeatedStartTokensCount++;
                }
                else {
                    if (tokens[tokensCounter].value === endToken) {
                        repeatedStartTokensCount--;
                        if (repeatedStartTokensCount === -1) {
                            return tokensCounter;
                        }
                    }
                }
            }

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, "Cant find end token", []);
            return -1;
        },

        /**
        Generates token factory object
        @private
        @method _getFactoryToken
        @return {Object} token object
        @static
        **/
        _getFactoryToken: function _getFactoryToken() {
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
        _processFunctionPowers: function _processFunctionPowers(tokens) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                tokenCounter,
                currentToken,
                previousToken,
                raisedToTokens,
                functionTokens,
                startToken,
                endToken,
                beforeTokens,
                afterTokens,
                //functionParameterStartToken,
                //functionParameterEndToken,
                isFunctionPowerCase,
                logToBasePower = null;
            for (tokenCounter = 0; tokenCounter < tokens.length; tokenCounter++) {
                isFunctionPowerCase = false;
                currentToken = tokens[tokenCounter];
                if (tokenCounter !== 0) {
                    previousToken = tokens[tokenCounter - 1];
                    if (previousToken.type === 'func') {
                        isFunctionPowerCase = true;
                    }
                    else {
                        logToBasePower = nameSpace.Parser._checkLogToBasePowerCase(tokens.slice(0, tokenCounter));
                        if (logToBasePower !== null) {
                            isFunctionPowerCase = true;
                        }
                    }
                    if (currentToken.value === '^' && isFunctionPowerCase) {
                        raisedToTokens = nameSpace.Parser._getFunctionTokens(tokens.slice(tokenCounter + 1));
                        functionTokens = nameSpace.Parser._getFunctionTokens(tokens.slice(tokenCounter + 1 + raisedToTokens.length));
                        startToken = nameSpace.Parser._getFactoryToken();
                        endToken = nameSpace.Parser._getFactoryToken();
                        //functionParameterStartToken = nameSpace.Parser._getFactoryToken();
                        //functionParameterEndToken = nameSpace.Parser._getFactoryToken();
                        //startToken.type = endToken.type = functionParameterStartToken.type = functionParameterEndToken.type = 'delim';
                        startToken.type = endToken.type = 'delim';
                        //startToken.isValid = endToken.isValid = functionParameterStartToken.isValid = functionParameterEndToken.isValid = true;
                        startToken.isValid = endToken.isValid = true;
                        //startToken.sign = endToken.sign = functionParameterStartToken.sign = functionParameterEndToken.sign = '+';
                        startToken.sign = endToken.sign = '+';
                        //startToken.value = functionParameterStartToken.value = '(';
                        startToken.value = '(';
                        //endToken.value = functionParameterEndToken.value = ')';
                        endToken.value = ')';
                        beforeTokens = tokens.slice(0, tokenCounter - 1);
                        afterTokens = tokens.slice(tokenCounter + raisedToTokens.length + 1 + functionTokens.length, tokens.length);
                        //functionTokens = ([functionParameterStartToken].concat(functionTokens)).concat([functionParameterEndToken]);
                        if (logToBasePower !== null) {
                            tokens = beforeTokens.slice(0, beforeTokens.length - logToBasePower.length - 2);
                            tokens.push(startToken);
                            tokens = tokens.concat(logToBasePower);
                        }
                        else {
                            tokens = beforeTokens;
                            tokens.push(startToken);
                            tokens.push(previousToken);
                        }
                        tokens = tokens.concat(functionTokens);
                        tokens.push(endToken);
                        tokens.push(currentToken);
                        tokens = tokens.concat(raisedToTokens);
                        tokens = tokens.concat(afterTokens);
                        //tokenCounter = tokenCounter + functionTokens.length + raisedToTokens.length + 2;
                    }
                }
            }
            return tokens;
        },

        /**
            Chec whether the power functions is for log to the base case
            @private
            @method _checkLogToBasePowerCase
            @param tokens{Array} array of token objects
            @return {Array} array of token objects
            @static
        **/
        _checkLogToBasePowerCase: function _checkLogToBasePowerCase(tokens) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                tokenCounter,
                tokensLength = tokens.length,
                currentToken,
                bracketCounter = 0,
                logToBasePower = null;
            for (tokenCounter = tokensLength - 1; tokenCounter >= 0; tokenCounter--) {
                currentToken = tokens[tokenCounter];
                if (nameSpace.ParsingProcedures._isOpeningBracket(currentToken.value)) {
                    bracketCounter++;
                }
                else if (nameSpace.ParsingProcedures._isClosingBracket(currentToken.value)) {
                    bracketCounter--;
                }
                else {
                    if (bracketCounter === 0) {
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
        _getFunctionTokens: function _getFunctionTokens(tokens) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                tokenCounter,
                tokensLength = tokens.length,
                currentToken,
                bracketCounter = 0,
                powerTokens = [];
            for (tokenCounter = 0; tokenCounter < tokensLength; tokenCounter++) {
                currentToken = tokens[tokenCounter];
                powerTokens.push(currentToken);
                if (nameSpace.ParsingProcedures._isOpeningBracket(currentToken.value)) {
                    bracketCounter++;
                }
                else if (nameSpace.ParsingProcedures._isClosingBracket(currentToken.value)) {
                    bracketCounter--;
                }
                if (bracketCounter === 0) {
                    break;
                }
            }
            return powerTokens;
        },

        _isFunctionSupported: function _isFunctionSupported(latex) {
            var supportedFunctions = ['\\cdot', '\\pi', '\\sqrt', '\\fracdec', '\\gcd', '\\lcm', '\\theta', '\\min', '\\max', '\\mod', '\\nCr', '\\nPr', '\\frac', '\\%', '\\sin', '\\cos', '\\tan', '\\csc', '\\sec', '\\cot', '\\arccot', '\\arccsc', '\\arcsin', '\\arcsec', '\\arccos', '\\arctan', '\\log', '\\ln', '\\ceil', '\\floor', '\\round', '\\abs', '\\exp', '\\sum', '\\prod'];
            if (supportedFunctions.indexOf(latex) !== -1) {
                return true;
            }
            return false;
        },

        _createToken: function _createToken(value, isValid, type, sign) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
            token = nameSpace.Parser._getFactoryToken();
            token.value = value;
            token.isValid = isValid;
            token.type = type;
            token.sign = sign;

            return token;
        },

        _generateTokens: function _generateTokens(expression, equationData) {

            /*
            * each token will have following data
            *
            * token value
            * isValid Boolean
            * token type [var,const,func,digit,delim,opr]
            *
            */
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                tokens = [],
                expressionString,
                tokenUnderInspection = '',
                verifiedToken,
                readPointer = 0,
                tokenTypesInOrder = ["func", "delim", "var", "opr", "digit", "const"],
                useThisToken = false,
                isRangeParse,
                tokenVerificationResult,
                expressionStringLength,
                tokenFound = false,
                tokenRegularExpressions = [
                /^\\[a-z|\%|\_]+[\s]?$/i,
                /^[\[|\]|\}|\{|\(|\)|\,|\{|\}]$/i,
                /^[x|y]{1}$/,
                /^[\+|\-|\^|\!|<|\>|\_]{1}$/,
                /^(([\.][0-9]+)|([0-9]+[\.]?[0-9]*))$/,
                /^[a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|z|A-Z]$/
                ],
                tokenRegularExpressionCounter = 0,
                prevIndex,
                tokenRegularExpressionsLength = tokenRegularExpressions.length;

            if (typeof (expression) === 'string') {
                expressionString = expression;
                isRangeParse = true;
            }
            else {
                expressionString = expression.expression;
                isRangeParse = false;
            }
            expressionString = expressionString.trim();
            expressionStringLength = expressionString.length;
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'parse expression called', []);

            while (readPointer < expressionStringLength) {
                tokenFound = false;
                //TRACE
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, '>>' + expressionString.charAt(readPointer) + '<<', []);
                if (tokenUnderInspection === ' ') {
                    tokenUnderInspection = '';
                }
                tokenUnderInspection = tokenUnderInspection + expressionString.charAt(readPointer);
                //TRACE
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'Analysing token ' + tokenUnderInspection, []);
                //couldMatchWithAtleastOne = false;

                for (tokenRegularExpressionCounter = 0; tokenRegularExpressionCounter < tokenRegularExpressionsLength; tokenRegularExpressionCounter++) {
                    tokenVerificationResult = tokenRegularExpressions[tokenRegularExpressionCounter].test(tokenUnderInspection);

                    if (tokenVerificationResult === false) {
                        //TRACE
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'NO!! match ' + tokenRegularExpressions[tokenRegularExpressionCounter] + ' >>' + tokenUnderInspection, []);
                        continue;
                    }
                    else {
                        readPointer++;
                        if (tokenTypesInOrder[tokenRegularExpressionCounter] === 'func') {
                            if (!nameSpace.Parser._isFunctionSupported(tokenUnderInspection)) {
                                useThisToken = false;
                                break;
                            }
                            else {
                                if (tokenUnderInspection === '\\frac') {
                                    if ((expressionString.charAt(readPointer) + expressionString.charAt(readPointer + 1) + expressionString.charAt(readPointer + 2)) === 'dec') {
                                        tokenUnderInspection = '\\fracdec';
                                        readPointer += 3;
                                    }
                                }
                                if (verifiedToken) {
                                    prevIndex = verifiedToken.index;
                                }
                                verifiedToken = nameSpace.Parser._createToken(tokenUnderInspection, true, tokenTypesInOrder[tokenRegularExpressionCounter], '+');
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>TOKEN FOUND ' + verifiedToken.value, []);
                                tokens.push(verifiedToken);
                                tokenFound = true;

                                if (prevIndex !== undefined) {
                                    verifiedToken.index = expressionString.indexOf(tokenUnderInspection, prevIndex + 1);
                                }
                                else {
                                    verifiedToken.index = expressionString.indexOf(tokenUnderInspection);
                                }
                                tokenUnderInspection = ''
                                break;
                            }
                        }
                        else {
                            if (tokenTypesInOrder[tokenRegularExpressionCounter] === 'digit') {
                                if (verifiedToken) {
                                    if (verifiedToken.type === 'opr') {
                                        if (verifiedToken.value === '_' || verifiedToken.value === '^') {
                                            if (verifiedToken) {
                                                prevIndex = verifiedToken.index;
                                            }
                                            verifiedToken = nameSpace.Parser._createToken(tokenUnderInspection, true, tokenTypesInOrder[tokenRegularExpressionCounter], '+');
                                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>TOKEN FOUND ' + verifiedToken.value, []);
                                            tokens.push(verifiedToken);
                                            tokenFound = true;
                                            if (prevIndex !== undefined) {
                                                verifiedToken.index = expressionString.indexOf(tokenUnderInspection, prevIndex + 1);
                                            }
                                            else {
                                                verifiedToken.index = expressionString.indexOf(tokenUnderInspection);
                                            }
                                            tokenUnderInspection = ''
                                            break;
                                        }
                                    }
                                }
                                while (true) {
                                    if (expressionString.charAt(readPointer) !== '') {
                                        tokenUnderInspection += expressionString.charAt(readPointer);
                                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'Digit found', []);
                                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'Analysing token ' + tokenUnderInspection, []);
                                        if (tokenRegularExpressions[4].test(tokenUnderInspection)) {
                                            readPointer++;
                                            continue;
                                        }
                                        else {
                                            readPointer--;
                                        }
                                        if (tokenUnderInspection.length !== 1) {
                                            tokenUnderInspection = tokenUnderInspection.substring(0, tokenUnderInspection.length - 1);
                                        }
                                    }
                                    if (verifiedToken) {
                                        prevIndex = verifiedToken.index;
                                    }
                                    verifiedToken = nameSpace.Parser._createToken(tokenUnderInspection, true, tokenTypesInOrder[tokenRegularExpressionCounter], '+');
                                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>TOKEN FOUND ' + verifiedToken.value, []);
                                    tokens.push(verifiedToken);
                                    tokenFound = true;
                                    if (prevIndex !== undefined) {
                                        verifiedToken.index = expressionString.indexOf(tokenUnderInspection, prevIndex + 1);
                                    }
                                    else {
                                        verifiedToken.index = expressionString.indexOf(tokenUnderInspection);
                                    }
                                    tokenUnderInspection = '';
                                    break;

                                }
                            }
                            else {
                                if (verifiedToken) {
                                    prevIndex = verifiedToken.index;
                                }
                                verifiedToken = nameSpace.Parser._createToken(tokenUnderInspection, true, tokenTypesInOrder[tokenRegularExpressionCounter], '+');
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>TOKEN FOUND ' + verifiedToken.value, []);
                                tokens.push(verifiedToken);
                                tokenFound = true;
                                if (prevIndex !== undefined) {
                                    verifiedToken.index = expressionString.indexOf(tokenUnderInspection, prevIndex + 1);
                                }
                                else {
                                    verifiedToken.index = expressionString.indexOf(tokenUnderInspection);
                                }
                                tokenUnderInspection = '';
                                break;
                            }
                        }
                    }
                }
                if (tokenRegularExpressionCounter === tokenRegularExpressionsLength) {
                    readPointer++;
                }
            }
            if (!tokenFound) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('Complicated');
                return;
            }
            tokens = nameSpace.Parser._processTokens(tokens, expression, equationData, isRangeParse);
            return tokens;
        },

        _processTokens: function _processTokens(tokens, expression, equationData, isRangeParse) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                tokenCounter,
                currentToken,
                nextToken,
                prevToken,
                startCounter,
                noOfTokenToBeDeleted = 0,
                verifiedToken,
                verifiedTokenValue,
                addDelim = 0,
                nextCounter,
                processedTokens,
                braceCounter = 0,
                processedTokensLength,
                processedTokenCounter,
                roundBracCounter = 0,
                curlyBracCounter = 0,
                curlyBracBeforeRound = 0,
                tokensLength;
            tokensLength = tokens.length;
            for (tokenCounter = 0; tokenCounter < tokensLength; tokenCounter++) {
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
                                break;
                            case '\\%':
                                currentToken.value = '\\%';
                                currentToken.type = 'opr';
                                break;
                            case '\\theta ':
                            case '\\theta':
                                currentToken.value = '\\theta';
                                currentToken.type = 'const';
                                break;
                        }
                        if (currentToken.type === 'func' && currentToken.value !== '\\frac') {
                            if (roundBracCounter !== 0) {
                                verifiedToken = nameSpace.Parser._createToken(')', true, 'delim', '+');
                                tokens.splice(tokenCounter, 0, verifiedToken);
                                roundBracCounter--;
                                tokensLength++;
                            }
                            if (nextToken) {

                                // Handle log to the base cases 
                                if (currentToken.value === '\\log') {
                                    // convert log toh log_
                                    currentToken.value = '\\log_';
                                    if (nextToken.value === '_') {

                                        // remove _ operator
                                        tokens.splice(++tokenCounter, 1);
                                        tokensLength--;
                                        if (tokens[tokenCounter].value !== '{') {
                                            verifiedToken = nameSpace.Parser._createToken('{', true, 'delim', '+');
                                            tokens.splice(tokenCounter++, 0, verifiedToken);
                                            verifiedToken = nameSpace.Parser._createToken('}', true, 'delim', '+');
                                            tokens.splice(++tokenCounter, 0, verifiedToken);
                                        }
                                        else {

                                            braceCounter = 1;
                                            tokenCounter++;
                                            startCounter = tokenCounter;
                                            while (braceCounter !== 0) {
                                                if (tokens[tokenCounter].value === '{') {
                                                    braceCounter++;
                                                }
                                                if (tokens[tokenCounter].value === '}') {
                                                    braceCounter--;
                                                }
                                                tokenCounter++;
                                            }
                                            tokenCounter--;
                                            // process skipped tokens
                                            processedTokens = tokens.splice(startCounter, tokenCounter - startCounter);

                                            if (processedTokens.length > 1) {
                                                processedTokens = nameSpace.Parser._processTokens(processedTokens, expression, equationData);
                                            }
                                            processedTokensLength = processedTokens.length;
                                            for (processedTokenCounter = 0; processedTokenCounter < processedTokensLength; processedTokenCounter++) {
                                                tokens.splice(startCounter, 0, processedTokens[processedTokenCounter]);
                                                startCounter++;
                                            }
                                            tokenCounter = startCounter;
                                        }
                                    }
                                    else {

                                        // add base value 10 for log without base
                                        verifiedToken = nameSpace.Parser._createToken('{', true, 'delim', '+');
                                        tokens.splice(++tokenCounter, 0, verifiedToken);
                                        verifiedToken = nameSpace.Parser._createToken('10', true, 'digit', '+');
                                        tokens.splice(++tokenCounter, 0, verifiedToken);
                                        verifiedToken = nameSpace.Parser._createToken('}', true, 'delim', '+');
                                        tokens.splice(++tokenCounter, 0, verifiedToken);
                                        tokensLength += 3;
                                    }
                                }
                                else {
                                    if (currentToken.value === '\\sqrt') {

                                        // add param 2 for sqrt
                                        if (nextToken.value === '{') {
                                            verifiedToken = nameSpace.Parser._createToken('[', true, 'delim', '+');
                                            tokens.splice(++tokenCounter, 0, verifiedToken);
                                            verifiedToken = nameSpace.Parser._createToken('2', true, 'digit', '+');
                                            tokens.splice(++tokenCounter, 0, verifiedToken);
                                            verifiedToken = nameSpace.Parser._createToken(']', true, 'delim', '+');
                                            tokens.splice(++tokenCounter, 0, verifiedToken);
                                            tokensLength += 3;
                                            curlyBracCounter++;
                                        }
                                    }
                                }
                                if (nextToken.value === '^') {

                                    if (tokens[tokenCounter + 2].value === '{') {

                                        braceCounter = 1;
                                        tokenCounter += 3;
                                        startCounter = tokenCounter;
                                        while (braceCounter !== 0) {
                                            if (tokens[tokenCounter].value === '{') {
                                                braceCounter++;
                                            }
                                            if (tokens[tokenCounter].value === '}') {
                                                braceCounter--;
                                            }
                                            tokenCounter++;
                                        }
                                        tokenCounter--;
                                        // process skipped tokens
                                        processedTokens = tokens.splice(startCounter, tokenCounter - startCounter);
                                        if (processedTokens.length > 1) {
                                            processedTokens = nameSpace.Parser._processTokens(processedTokens, expression, equationData);
                                        }
                                        processedTokensLength = processedTokens.length;
                                        for (processedTokenCounter = 0; processedTokenCounter < processedTokensLength; processedTokenCounter++) {
                                            tokens.splice(startCounter, 0, processedTokens[processedTokenCounter]);
                                            startCounter++;
                                        }
                                        tokenCounter = startCounter;
                                    }
                                    else {
                                        tokenCounter += 2;
                                    }
                                }
                                nextToken = tokens[tokenCounter + 1];
                                // change for // sin sin 60
                                if (nextToken && (nextToken.type !== 'delim' && nextToken.type !== 'func')) {
                                    if (curlyBracCounter !== 0) {
                                        curlyBracBeforeRound++;
                                    }
                                    verifiedToken = nameSpace.Parser._createToken('(', true, 'delim', '+');
                                    tokens.splice(tokenCounter + 1, 0, verifiedToken);
                                    roundBracCounter++;
                                    tokensLength = tokens.length;
                                }
                                else {
                                    if (nextToken && (nextToken.value === '\\frac')) {
                                        verifiedToken = nameSpace.Parser._createToken('(', true, 'delim', '+');
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
                        if (isRangeParse === false) {
                            if (expression.freevars === undefined) {
                                expression.freevars = {};
                            }
                            if (expression.freevars[currentToken.value] === undefined) {
                                //TRACE
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, '---------------------recording var ' + currentToken.value + "-------------------------", []);

                                //by default status is 1... this will be updated later on
                                expression.freevars[currentToken.value] = 0;
                            }
                        }
                        break;

                    case 'const':
                        if (isRangeParse === false) {
                            if (expression.constants === undefined) {
                                expression.constants = {};
                            }
                            if (expression.constants[currentToken.value] === undefined) {
                                //TRACE
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, '------------------ recording constant ' + currentToken.value + "--------------------", []);
                                //by default status is 1... this will be updated later on
                                expression.constants[currentToken.value] = 1;
                            }
                            equationData.containsConstant = true;
                            break;
                        }
                    case 'delim':
                        if ((currentToken.value === '}' || currentToken.value === ')') && roundBracCounter) {
                            if (curlyBracCounter === 0 || curlyBracBeforeRound !== 0) {
                                verifiedToken = nameSpace.Parser._createToken(')', true, 'delim', '+');
                                tokens.splice(tokenCounter, 0, verifiedToken);
                                roundBracCounter--;
                                tokensLength++;
                                if (curlyBracBeforeRound !== 0) {
                                    curlyBracBeforeRound--;
                                }
                            }
                            else {
                                curlyBracCounter--;
                            }
                        }
                        else {
                            if (currentToken.value === '{') {
                                curlyBracCounter++;
                            }
                        }
                        break;

                    case 'opr':
                        // || currentToken.value === '^'
                        if ((currentToken.value === '+' || currentToken.value === '-') && roundBracCounter !== 0) {
                            verifiedToken = nameSpace.Parser._createToken(')', true, 'delim', '+');
                            tokens.splice(tokenCounter, 0, verifiedToken);
                            roundBracCounter--;
                            tokensLength++;
                        }
                        else {
                            if (currentToken.value === '_') {
                                startCounter = tokenCounter - 1;
                                prevToken = tokens[tokenCounter - 1];
                                // convert to constants
                                if (prevToken.type === 'var' || prevToken.type === 'const') {
                                    if (nextToken.type !== 'delim') {
                                        verifiedToken = nameSpace.Parser._createToken(prevToken.value + currentToken.value + nextToken.value, true, 'const', '+');
                                        tokens.splice(tokenCounter - 1, 3);
                                        tokens.splice(tokenCounter - 1, 0, verifiedToken);
                                        tokenCounter--;
                                        tokensLength = tokens.length;
                                    }
                                    else {
                                        verifiedTokenValue = prevToken.value + currentToken.value + nextToken.value;
                                        noOfTokenToBeDeleted = 3;
                                        tokenCounter++;
                                        while (true) {
                                            tokenCounter++;
                                            if (tokens[tokenCounter].type === 'delim') {
                                                break;
                                            }
                                            else {
                                                verifiedTokenValue += tokens[tokenCounter].value;
                                                noOfTokenToBeDeleted++;
                                            }
                                        }
                                        tokenCounter++;
                                        noOfTokenToBeDeleted++;

                                        verifiedTokenValue = verifiedTokenValue.replace('{', '');
                                        verifiedToken = nameSpace.Parser._createToken(verifiedTokenValue, true, 'const', '+');
                                        tokens.splice(startCounter, noOfTokenToBeDeleted);
                                        tokens.splice(startCounter, 0, verifiedToken);
                                        tokensLength = tokens.length;
                                        tokenCounter = startCounter;
                                    }
                                }
                            }
                        }
                        break;
                }
                //tokenCounter = nextCounter - 1;
            }
            while (roundBracCounter !== 0) {
                verifiedToken = nameSpace.Parser._createToken(')', true, 'delim', '+');
                tokens.splice(tokenCounter + 1, 0, verifiedToken);
                roundBracCounter--;
                tokensLength++;
            }

            return tokens;
        },
        /*
        _generateTokens: function _generateTokens(expression, equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                tokens = [],
                expressionString,
                readPointer = 0,
                tokenUnderInspection = "",
                lastVerifiedToken,
                tokenRegularExpressions = [/^\\[a-z|\%|\_]+[\s]?$/i, /^[\[|\]|\}|\{|\(|\)|\,|\\{|\\}]$/i, /^[x|y]{1}$/, /^[\+|\-|\^|\!|<|\>]{1}$/, /^(([\.][0-9]+)|([0-9]+[\.]?[0-9]*))$/, /^[a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|z|A-Z]$/],
            //negativeNumberIndex = 6,
            //negativeNumberRegex = /(\{|^|\+|\-|\\cdot)/,
                tokenTypesInOrder = ["func", "delim", "var", "opr", "digit", "const"],
                tokenVerificationResult,
                couldMatchWithAtleastOne,
                useThisToken = false,
                lastSuccesfulToken = null,
                negativeNumberCase = false,
                expressionStringLength,
                tokenRegularExpressionCounter,
                isRangeParse,
                tokenRegularExpressionsLength;

            if (typeof (expression) === 'string') {
                expressionString = expression;
                isRangeParse = true;
            }
            else {
                expressionString = expression.expression;
                isRangeParse = false;
            }
            expressionStringLength = expressionString.length;
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'parse expression called', []);
            expressionString = expressionString.trim();

            /*
            * will have following data
            *
            * token value
            * isValid Boolean
            * token type [var,const,func,digit,delim,opr]
            *
            */
            /*
            while (readPointer < expressionStringLength) {
                //TRACE
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, '>>' + expressionString.charAt(readPointer) + '<<', []);

                tokenUnderInspection = tokenUnderInspection + expressionString.charAt(readPointer);
                //TRACE
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'Analysing token ' + tokenUnderInspection, []);

                couldMatchWithAtleastOne = false;

                //optimization tip - dont check with regex that already rejected the token
                tokenRegularExpressionCounter = 0;
                tokenRegularExpressionsLength = tokenRegularExpressions.length;
                for (tokenRegularExpressionCounter; tokenRegularExpressionCounter < tokenRegularExpressionsLength; tokenRegularExpressionCounter++) {
                    //TRACE
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'checking with token ' + tokenRegularExpressions[tokenRegularExpressionCounter] + ' >>' + tokenUnderInspection + '<<', []);
                    tokenVerificationResult = tokenRegularExpressions[tokenRegularExpressionCounter].test(tokenUnderInspection);

                    if (tokenVerificationResult === true) {
                        couldMatchWithAtleastOne = true;

                        if (lastVerifiedToken === undefined) {
                            lastVerifiedToken = nameSpace.Parser._getFactoryToken();
                        }
                        //TRACE
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'MATCH ' + tokenUnderInspection + ' with regex ' + tokenRegularExpressions[tokenRegularExpressionCounter], []);

                        lastVerifiedToken.value = tokenUnderInspection;
                        lastVerifiedToken.isValid = true;
                        lastVerifiedToken.type = tokenTypesInOrder[tokenRegularExpressionCounter];
                        lastVerifiedToken.sign = '+';
                        //find the index of the lastVerifiedToken. 
                        if (lastSuccesfulToken !== undefined && lastSuccesfulToken !== null) {
                            lastVerifiedToken.index = expressionString.indexOf(tokenUnderInspection, lastSuccesfulToken.index + 1);
                        }
                        else {
                            lastVerifiedToken.index = expressionString.indexOf(tokenUnderInspection);
                        }

                        if (lastVerifiedToken.type === "func") {
                            //TODO make function list and dont do preprocess of sinx to sin(x)
                            if (tokenUnderInspection.indexOf('\\%') !== -1 && tokenUnderInspection.length > '\\%'.length) {
                                couldMatchWithAtleastOne = false;
                                lastVerifiedToken.value = '\\%';
                                tokenUnderInspection = '\\%';
                            }
                            switch (tokenUnderInspection) {
                                case "\\cdot ":
                                    lastVerifiedToken.value = "\\cdot";
                                    lastVerifiedToken.type = "opr";
                                    break;
                                case '\\pi':
                                case '\\pi ':
                                    lastVerifiedToken.value = "\\pi";
                                    lastVerifiedToken.type = "const";
                                    break;
                                case '\\%':
                                    lastVerifiedToken.value = "\\%";
                                    lastVerifiedToken.type = "opr";
                                    break;
                                case '\\theta ':
                                case '\\theta':
                                    lastVerifiedToken.value = "\\theta";
                                    lastVerifiedToken.type = "const";
                                    break;
                                case '\\ge':
                                case '\\ge ':
                                    lastVerifiedToken.value = "\\ge";
                                    break;
                                case '\\le':
                                case '\\le ':
                                    lastVerifiedToken.value = "\\le";
                                    break;
                            }
                        }
                        break;
                    }
                    else {
                        //TRACE
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'NO!! match ' + tokenRegularExpressions[tokenRegularExpressionCounter] + ' >>' + tokenUnderInspection, []);
                        continue;
                    }
                }
                if (couldMatchWithAtleastOne === false) {
                    //TRACE
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'couldnt find a match for ' + tokenUnderInspection + " in all possibilities", []);
                }

                if (tokenVerificationResult === undefined && couldMatchWithAtleastOne === false) {
                    //TRACE
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'This expression is invalid', []);
                    useThisToken = false;
                    break;
                }
                else {
                    if (couldMatchWithAtleastOne === false) {
                        if (lastVerifiedToken !== undefined) {
                            useThisToken = true;
                            //not increasing and continuing so that we start with current character
                        }
                        else {
                            //TRACE
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'will continue searching...', []);
                            useThisToken = false;
                        }
                    }
                    else {
                        if (readPointer === expressionStringLength - 1 && lastVerifiedToken !== undefined) {
                            //TRACE
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'this is the last token it seems...finalizing..', []);
                            useThisToken = true;
                            readPointer++;

                        }
                        else {
                            useThisToken = false;
                        }
                        //TRACE
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, 'will confirm the match', []);
                    }
                }

                if (useThisToken === true) {
                    if (lastVerifiedToken !== undefined) {
                        //TRACE

                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>TOKEN FOUND ' + lastVerifiedToken.value, []);
                        if (isRangeParse === false) {
                            if (lastVerifiedToken.type === "var") {
                                if (expression.freevars === undefined) {
                                    expression.freevars = {};
                                }
                                if (expression.freevars[lastVerifiedToken.value] === undefined) {
                                    //TRACE
                                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, '---------------------recording var ' + lastVerifiedToken.value + "-------------------------", []);

                                    //by default status is 1... this will be updated later on
                                    expression.freevars[lastVerifiedToken.value] = 0;
                                }

                            }
                            else {
                                if (lastVerifiedToken.type === "const") {

                                    if (expression.constants === undefined) {
                                        expression.constants = {};
                                    }
                                    if (expression.constants[lastVerifiedToken.value] === undefined) {
                                        //TRACE
                                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tokens, '------------------ recording constant ' + lastVerifiedToken.value + "--------------------", []);
                                        //by default status is 1... this will be updated later on
                                        expression.constants[lastVerifiedToken.value] = 1;
                                    }
                                }
                            }
                        }
                        if (lastVerifiedToken.value === '-') {
                            if (readPointer === expressionStringLength) {
                                equationData.canBeSolved = false;
                                equationData.errorCode = 'Complicated';
                                return;
                            }
                            negativeNumberCase = true;
                        }
                        else {
                            if (negativeNumberCase) {
                                negativeNumberCase = false;
                                lastVerifiedToken.sign = '-';
                            }
                            if (lastVerifiedToken.type === 'const') {
                                equationData.containsConstant = true;
                            }
                            tokens.push(lastVerifiedToken);
                        }
                        tokenUnderInspection = "";
                        lastSuccesfulToken = lastVerifiedToken;
                        lastVerifiedToken = undefined;
                    }
                }
                else {
                    readPointer++;
                    //TODO review this condition with shashank
                    if (isRangeParse === false) {
                        if (readPointer >= expressionStringLength) {
                            if (lastVerifiedToken === undefined) {
                                equationData.canBeSolved = false;
                                equationData.errorCode = 'Complicated';
                                return;
                            }
                        }
                    }
                }

            }
            return tokens;

        },*/

        _checkIfFunctionParanthesis: function _checkIfFunctionParanthesis(tokens) {
            var tokenCounter,
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                tokensLength = tokens.length,
                currentToken,
                bracketCounter = 0, isFunctionCase = false;
            for (tokenCounter = tokensLength - 1; tokenCounter >= 0; tokenCounter--) {
                currentToken = tokens[tokenCounter];
                if (nameSpace.ParsingProcedures._isClosingBracket(currentToken.value)) {
                    bracketCounter++;
                }
                else if (nameSpace.ParsingProcedures._isOpeningBracket(currentToken.value)) {
                    bracketCounter--;
                    if (bracketCounter === 0 && tokenCounter !== 0) {
                        if (tokens[tokenCounter - 1].value === '^' && tokens[tokenCounter - 2].type === 'func') {
                            isFunctionCase = true;
                            break;
                        }
                        if (tokens[tokenCounter - 1].type === 'func') {
                            isFunctionCase = true;
                        }
                        else if (tokens[tokenCounter - 1].type === 'delim') {
                            continue;
                        }
                        break;
                    }
                }
            }
            return isFunctionCase;
        },

        _processPointEquation: function _processPointEquation(tokens, equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                tokenCounter,
                currentTokens = [],
                currentToken,
                previousToken,
                tokensLength = tokens.length,
                solution;
            if (tokens[0].value !== '(' || tokens[tokensLength - 1].value !== ')') {
                return;
            }
            equationData.setSolution([]);
            currentTokens.push(tokens[0]);
            for (tokenCounter = 1; tokenCounter < tokensLength; tokenCounter++) {
                previousToken = tokens[tokenCounter - 1];
                currentToken = tokens[tokenCounter];
                if ((previousToken.value === ')' && currentToken.value === ',') || (currentToken.value === ')' && tokenCounter === tokensLength - 1)) {

                    if (tokenCounter === tokensLength - 1) {
                        currentTokens.push(currentToken);
                    }
                    else {
                        if (nameSpace.Parser._checkIfFunctionParanthesis(tokens.slice(0, tokenCounter))) {
                            currentTokens.push(currentToken);
                            continue;
                        }
                    }
                    solution = nameSpace.Parser._checkIfPoint(currentTokens, equationData);
                    if (equationData.isCanBeSolved() === false || solution === undefined) {
                        return;
                    }
                    equationData.getSolution().push(solution);
                    currentTokens = [];
                }
                else {
                    currentTokens.push(currentToken);
                }
            }
            if (currentTokens.length > 0 && equationData.getSolution().length > 0) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return;
            }
            if (equationData.getSolution().length > 0) {
                equationData.setSpecie('point');
            }
        },

        /**

            Function to check whether the latex expression provided is a latex string to plot points. 
            If it is plot points latex the function splits the latex for x and y co-ordinate and calls parse equation for the individual latexes and finds the solution for it.
            
            @private
            @method _checkIfPoint
            @param tokens{Array} Array of token objects
            @param equationData{Object} equation data object for the current latex
            @return Void
            @static
        **/
        _checkIfPoint: function _checkIfPoint(tokens, equationData) {
            var xCoordinateTokens = [],
                yCoordinateTokens = [],
                isXTokens = true,
                tokenCounter,
                tokenLength = tokens.length,
                commaCounter = 0,
                currentToken,
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
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
                xCordinateEquationData,
                yCordinateEquationData,
                splitIndex = -1,
                constantError = false,
                errorDataCounter,
                errorDataLength,
                currentErrorData,
                solution;
            if (tokens[0].value !== '(' || tokens[tokenLength - 1].value !== ')') {
                return;
            }
            for (tokenCounter = 1; tokenCounter < tokenLength - 1; tokenCounter++) {
                currentToken = tokens[tokenCounter];
                if (currentToken.type === 'func') {
                    if (nameSpace.Parser._isCommaFunction(currentToken.value)) {
                        commaCounter++;
                    }
                }
                else if (currentToken.value === ',') {
                    if (commaCounter === 0) {
                        splitIndex = currentToken.index;
                        isXTokens = false;
                        continue;
                    }
                    else {
                        commaCounter--;
                    }
                }
                if (isXTokens) {
                    xCoordinateTokens.push(currentToken);
                }
                else {
                    yCoordinateTokens.push(currentToken);
                }
            }
            if (!isXTokens) {
                xCordinateEquationData = new MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationData();
                yCordinateEquationData = new MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationData();
                xCordinateEquationData.setLatex(equationData.getLeftExpression().expression.substring(tokens[0].index + 1, splitIndex), true);
                equationPivot = equationData.getPivot();
                if (equationPivot !== null) {
                    yCordinateEquationData.setPivot(equationPivot);
                    xCordinateEquationData.setPivot(equationPivot);
                }

                equationConstants = equationData.getConstants();
                yCordinateEquationData.setConstants(equationConstants, true);
                xCordinateEquationData.setConstants(equationConstants, true);

                equationUnits = equationData.getUnits();
                yCordinateEquationData.setUnits(equationUnits, true);
                xCordinateEquationData.setUnits(equationUnits, true);

                //nameSpace.Parser.parseEquation(xCordinateEquationData);
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Parser.parseEquationToGetTokens(xCordinateEquationData);
                if (xCordinateEquationData.isCanBeSolved() === false) {
                    return;
                }
                if (xCordinateEquationData.getSpecie() !== 'number' && xCordinateEquationData.getSpecie() !== 'point') {
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Parser.processTokensWithRules(xCordinateEquationData);
                    if (xCordinateEquationData.isCanBeSolved() === false) {
                        return;
                    }
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Parser.generateTreeFromRules(xCordinateEquationData);
                }

                xEquationSpecie = xCordinateEquationData.getSpecie();
                xEquationErrorCode = xCordinateEquationData.getErrorCode();

                if (xEquationSpecie === 'number' || xEquationErrorCode === 'ConstantDeclaration' || xEquationSpecie === 'expression') {
                    if (xEquationErrorCode === 'ConstantDeclaration') {
                        constantError = true;
                    }
                    yCordinateEquationData.setLatex(equationData.getLeftExpression().expression.substring(splitIndex + 1, (tokens[tokenLength - 1].index)), true);

                    //nameSpace.Parser.parseEquation(yCordinateEquationData);
                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Parser.parseEquationToGetTokens(yCordinateEquationData);
                    if (yCordinateEquationData.isCanBeSolved() === false) {
                        return;
                    }
                    if (yCordinateEquationData.getSpecie() !== 'number' && yCordinateEquationData.getSpecie() !== 'point') {
                        MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Parser.processTokensWithRules(yCordinateEquationData);
                        if (yCordinateEquationData.isCanBeSolved() === false) {
                            return;
                        }
                        MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Parser.generateTreeFromRules(yCordinateEquationData);
                    }

                    yEquationSpecie = yCordinateEquationData.getSpecie();
                    if (yEquationSpecie === 'number' || yEquationSpecie === 'expression') {
                        //equationData.type = 'point';
                        solution = [xCordinateEquationData.getSolution(), yCordinateEquationData.getSolution()];

                        equationData.setAccText('Point of ' + xCordinateEquationData.getSolution() + ' and ' + yCordinateEquationData.getSolution());
                        $('#accessibility-display').html('The Accesibility string is ' + equationData.getAccText());
                    }
                    else {
                        yEquationErrorCode = yCordinateEquationData.getErrorCode();
                        if (yEquationErrorCode === 'ConstantDeclaration') {
                            constantError = true;
                        }
                        else {
                            equationData.setCanBeSolved(false);
                            equationData.setErrorCode('CannotUnderstandThis');
                        }
                    }
                }
                else {
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
        Takes expression object and generates tokens that will be later used to parse the expression. These tokens are added as a property of the expression itself.         
            
        @private
        @method _parseExpression
        @param  expression{Object}
        @return Void
        @static
        **/
        _parseExpression: function _parseExpression(expression, equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                tokens;
            tokens = nameSpace.Parser._generateTokens(expression, equationData);
            //if (equationData.containsConstant !== true) {
            //    equationData.containsConstant = false;
            //}

            if (equationData.isCanBeSolved() === false) {
                return;
            }
            tokens = nameSpace.Parser._processNegativeTokens(tokens, equationData, expression.equationParameters);
            if (tokens.length < 1) {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return;
            }
            nameSpace.Parser._processPointEquation(tokens, equationData);
            if (equationData.isCanBeSolved() === false || equationData.getSpecie() === 'point') {
                return;
            }
            tokens = nameSpace.Parser._processFunctionPowers(tokens);
            //add cdot between expressions like 'abxy' to make them 'a.b.x.y'
            tokens = nameSpace.Parser._addInvisibleCdotToTokens(tokens);
            //adjust powers for postfix operators such as ^ and !
            nameSpace.Parser._adjustPostFixOperatorPowers(tokens);

            $('#left-column-container').width($('#button-container').width() + $('#equation').width() + $('.mathquill-editable').width() + 50);
            expression.tokens = tokens;
        },

        _NEGATIVE_CASE_TYPES: {
            'NONE': 0,
            'SINGLE': 1,
            'DOUBLE': 2,
            'PLUS_SINGLE': 3,
            'NEGATIVE': 4
        },

        _processNegativeTokens: function _processNegativeTokens(tokens, equationData, equationParameters) {
            var returnTokens = [],
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                tokenCounter,
                negativeNumberRegex = /(\(|\[|\{|\+|\\cdot|,)/,
                totalTokens = tokens.length,
                currentToken,
                plusToken,
                negativeCaseType = nameSpace.Parser._NEGATIVE_CASE_TYPES.NONE,
                previousToken = null;
            for (tokenCounter = 0; tokenCounter < totalTokens; tokenCounter++) {
                currentToken = tokens[tokenCounter];
                if (currentToken.value === '-') {
                    if (previousToken !== null) {
                        if (negativeCaseType === nameSpace.Parser._NEGATIVE_CASE_TYPES.NONE) {
                            if (previousToken.value === '+') {
                                negativeCaseType = nameSpace.Parser._NEGATIVE_CASE_TYPES.PLUS_SINGLE;
                            }
                            else if (previousToken !== null && previousToken.value.match(negativeNumberRegex) !== null) {
                                negativeCaseType = nameSpace.Parser._NEGATIVE_CASE_TYPES.NEGATIVE;
                            }
                            else {
                                equationParameters.operatorsList.push(currentToken.value);
                                negativeCaseType = nameSpace.Parser._NEGATIVE_CASE_TYPES.SINGLE;
                                plusToken = nameSpace.Parser._getFactoryToken();
                                plusToken.value = '+';
                                plusToken.isValid = true;
                                plusToken.type = 'opr';
                                plusToken.sign = '+';
                                plusToken.negativeCaseType = nameSpace.Parser._NEGATIVE_CASE_TYPES.NONE;
                                returnTokens.push(plusToken);
                            }
                        }
                        else {
                            //equationParameters.operatorsList.push(currentToken.value);
                            negativeCaseType = nameSpace.Parser._NEGATIVE_CASE_TYPES.DOUBLE;
                        }
                    }
                    else {
                        negativeCaseType = nameSpace.Parser._NEGATIVE_CASE_TYPES.NEGATIVE;
                    }
                }
                else {
                    switch (currentToken.type) {
                        case 'var':
                            if (negativeCaseType !== nameSpace.Parser._NEGATIVE_CASE_TYPES.NONE && (negativeCaseType === nameSpace.Parser._NEGATIVE_CASE_TYPES.DOUBLE || negativeCaseType === nameSpace.Parser._NEGATIVE_CASE_TYPES.PLUS_SINGLE || negativeCaseType === nameSpace.Parser._NEGATIVE_CASE_TYPES.NEGATIVE)) {
                                equationParameters.variablesList.push('-' + currentToken.value);
                            }
                            else {
                                equationParameters.variablesList.push(currentToken.value);
                            }
                            break;
                        case 'const':
                            if (currentToken.value !== equationData.getPivot()) {
                                if (negativeCaseType !== nameSpace.Parser._NEGATIVE_CASE_TYPES.NONE && (negativeCaseType === nameSpace.Parser._NEGATIVE_CASE_TYPES.DOUBLE || negativeCaseType === nameSpace.Parser._NEGATIVE_CASE_TYPES.PLUS_SINGLE || negativeCaseType === nameSpace.Parser._NEGATIVE_CASE_TYPES.NEGATIVE)) {
                                    equationParameters.constantsList.push('-' + currentToken.value);
                                }
                                else {
                                    equationParameters.constantsList.push(currentToken.value);
                                }
                                //equationParameters.constantsList.push(lastVerifiedToken.value);
                            }
                            break;
                        case 'digit':
                            if (negativeCaseType !== nameSpace.Parser._NEGATIVE_CASE_TYPES.NONE && (negativeCaseType === nameSpace.Parser._NEGATIVE_CASE_TYPES.DOUBLE || negativeCaseType === nameSpace.Parser._NEGATIVE_CASE_TYPES.PLUS_SINGLE || negativeCaseType === nameSpace.Parser._NEGATIVE_CASE_TYPES.NEGATIVE)) {
                                equationParameters.digitsList.push('-' + currentToken.value);
                            }
                            else {
                                equationParameters.digitsList.push(currentToken.value);
                            }
                            //equationParameters.digitsList.push(lastVerifiedToken.value);
                            break;
                        case 'opr':
                            equationParameters.operatorsList.push(currentToken.value);
                            break;
                        case 'func':
                            equationParameters.functionsList.push(currentToken.value);
                            break;
                    }
                    returnTokens.push(currentToken);
                    currentToken.negativeCaseType = negativeCaseType;
                    if (negativeCaseType !== nameSpace.Parser._NEGATIVE_CASE_TYPES.NONE && negativeCaseType !== nameSpace.Parser._NEGATIVE_CASE_TYPES.DOUBLE) {
                        if (currentToken.sign === '+') {
                            currentToken.sign = '-';
                        }
                        else {
                            currentToken.sign = '+';
                        }
                    }
                    negativeCaseType = nameSpace.Parser._NEGATIVE_CASE_TYPES.NONE;
                }
                previousToken = currentToken;
            }
            return returnTokens;
        },

        /**
            
        Manipulation for the power of the postfix operators such as ^,\\cdot and !. This is done for cases like -x^2. In this case if x gets -ve sign then it will be (-x)^2 which is +x^2  thus the sign is assigned to ^ operator.
    
        @private
        @method _adjustPostFixOperatorPowers
        @param  tokens{Array} 
        @return Void
        @static
        **/
        _adjustPostFixOperatorPowers: function _adjustPostFixOperatorPowers(tokens) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
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
                //not stealing signs for cdot as it doesnt make a difference...TODO find a case which fails this assumption
                if (postFixOperators.indexOf(currentToken.value) !== -1) {
                    if (i === 0) {
                        //this is an error condition
                        continue;
                    }

                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Checking for power sign at ' + i, []);

                    for (j = i - 1; j >= 0; j--) {
                        currentLeftSideToken = tokens[j];

                        if (currentLeftSideToken.type === "delim") {
                            if (arrClosingBracketStack.length === 0) {
                                watchTheBracket = true;
                            }

                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Recording bracket ' + currentLeftSideToken.value, []);
                            nameSpace.ParsingProcedures.recordBracket(arrClosingBracketStack, currentLeftSideToken.value);


                            //this means all brackets are closed and its time to steal the sign;
                            if (watchTheBracket === true && arrClosingBracketStack.length === 0) {

                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'stealing the sign of ' + currentLeftSideToken, []);
                                currentToken.sign = currentLeftSideToken.sign;
                                currentLeftSideToken.sign = "+";
                                break;
                            }
                            continue;
                        }

                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Current left token is ' + currentLeftSideToken + ' stack is ' + arrClosingBracketStack, []);
                        if (arrClosingBracketStack.length > 0) {
                            continue;
                        }

                        if (currentLeftSideToken.type === "var" || currentLeftSideToken.type === "const" || currentLeftSideToken.type === "digit") {

                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'terminal found ignoring the sign ' + currentLeftSideToken, []);
                            currentToken.sign = currentLeftSideToken.sign;
                            currentToken.negativeCaseType = currentLeftSideToken.negativeCaseType;
                            currentLeftSideToken.sign = "+";
                            currentLeftSideToken.negativeCaseType = 0;
                            break;
                        }

                    }
                }
                else {
                    continue;
                }
            }
        },


        _printTokens: function _printTokens(expression, name) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '******************************************************************', []);
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, name + ' All Tokens Are ' + expression.tokens, []);
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '******************************************************************', []);
        },

        /**
        Function to add \cdot operator where a multiplication operator is assumed and not written
            
        @private
        @method _addInvisibleCdotToTokens
        @param  tokens{Array} 
        @return Void
        @static
        **/
        _addInvisibleCdotToTokens: function _addInvisibleCdotToTokens(tokens) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
            invisibleCdotTokenTypeCases = ['var', 'const', 'func'],
            invisibleCdotTokenValueCases = ['('],
            cdotAddCases = {
                //'digit': {
                //    tokenTypes: [],
                //    tokenValues: ['!']
                //},
                'var': {
                    tokenTypes: ['var', 'const', 'digit'],
                    tokenValues: [')', '!', '}']
                },
                'const': {
                    tokenTypes: ['var', 'const', 'digit'],
                    tokenValues: ['}', ')', '!', '\\%']
                },
                'func': {
                    tokenTypes: ['var', 'const', 'digit'],
                    tokenValues: [')', '!', '}', '\\%']
                },
                '(': {
                    tokenTypes: ['var', 'const', 'digit'],
                    tokenValues: [')', '!', '}']
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
            cdotToken = nameSpace.Parser._getFactoryToken();
            cdotToken.type = 'opr';
            cdotToken.value = '\\cdot';
            cdotToken.sign = '+';
            cdotToken.isValid = true;
            for (tokenCounter = 1; tokenCounter < tokens.length; tokenCounter++) {
                previousToken = tokens[tokenCounter - 1];
                currentToken = tokens[tokenCounter];
                isTokenTypeCase = invisibleCdotTokenTypeCases.indexOf(currentToken.type) !== -1;
                isTokenValueCase = invisibleCdotTokenValueCases.indexOf(currentToken.value) !== -1;
                if (isTokenTypeCase || isTokenValueCase) {
                    currentCase = isTokenTypeCase ? currentToken.type : currentToken.value;
                    if (cdotAddCases[currentCase].tokenTypes.indexOf(previousToken.type) !== -1 || cdotAddCases[currentCase].tokenValues.indexOf(previousToken.value) !== -1) {
                        // this is done to solve case 0.x as cdot was appended between 0. and x
                        if (previousToken.type === 'digit') {
                            if (previousToken.value.match(noDecimalDigitRegex) !== null) {
                                continue;
                            }
                        }
                        //condition for braces and bracket cdot added only when brace is of fraction
                        if (currentToken.value === '(' && previousToken.value === '}') {
                            isFractionBrace = nameSpace.Parser._isFractionBrace(tokens.slice(0, tokenCounter));
                            if (!isFractionBrace) {
                                continue;
                            }
                            if (nameSpace.Parser._checkLogToBasePowerCase(tokens.slice(0, tokenCounter)) !== null) {
                                continue;
                            }
                        }
                        //if (tokens[tokenCounter - 2] !== undefined && tokens[tokenCounter - 2].value === '^') {
                        //    continue;
                        //}
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
            Checks if the brace occured in tokens is of fraction or not
            @private
            @method _isFractionBrace
            @param tokens{Array} array of token objects
            @return {Boolean} true if the brace was of a fraction
            @static
        **/
        _isFractionBrace: function _isFractionBrace(tokens) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                tokenCounter,
                tokensLength = tokens.length,
                bracketCounter = 0,
                currentToken;
            for (tokenCounter = tokensLength - 1; tokenCounter >= 0; tokenCounter--) {
                currentToken = tokens[tokenCounter];
                if (nameSpace.ParsingProcedures._isOpeningBracket(currentToken.value)) {
                    bracketCounter++;
                }
                else if (nameSpace.ParsingProcedures._isClosingBracket(currentToken.value)) {
                    bracketCounter--;
                }
                else {
                    if (bracketCounter === 0) {
                        if (currentToken.value === '\\frac' || currentToken.value === '\\sqrt') {
                            return true;
                        }
                    }
                }
            }
            return false;
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
        _getFreeVarPower: function _getFreeVarPower(rootNode, freeVariables) {

            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
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
            setValueTo,
            nodePower;
            if (!rootNode.isTerminal) {
                // if not terminal node then we call the same function recursively with child nodes
                freeVarPowers = []; // variable to stroe all the results returned from child nodes
                childNodeCounter = 0;
                childNodesLength = rootNode.params.length;
                for (childNodeCounter; childNodeCounter < childNodesLength; childNodeCounter++) {
                    freeVarPowers.push(nameSpace.Parser._getFreeVarPower(rootNode.params[childNodeCounter], freeVariables));
                }

                // Once all the results for the child nodes are calculated further processing is done according to the function or operator type
                switch (rootNode.name) {
                    case '+':
                        // This is the case where we just check the max power between the childs and assign it to the variable
                        freeVarObjectCounter = 0;
                        freeVarObjectsLength = freeVarPowers.length;
                        for (freeVarObjectCounter; freeVarObjectCounter < freeVarObjectsLength; freeVarObjectCounter++) {
                            freeVars = freeVarPowers[freeVarObjectCounter];
                            variable = null;
                            for (variable in freeVars) {
                                if (variable in returnFreeVars) {
                                    if (returnFreeVars[variable] !== 'c') {
                                        if (freeVars[variable] === 'c' || returnFreeVars[variable] < freeVars[variable]) {
                                            returnFreeVars[variable] = freeVars[variable];
                                        }
                                    }
                                }
                                else {
                                    returnFreeVars[variable] = freeVars[variable];
                                }
                                //var setValue = true;
                                //if (variable in returnFreeVars) {
                                //    if (returnFreeVars[variable] === 'c' || freeVars[variable] === null) {
                                //        setValue = false;
                                //    }
                                //}
                                //if (setValue) {
                                //    if (freeVars[variable] === 'c') {
                                //        returnFreeVars[variable] = 'c';
                                //    }
                                //    else if (variable in returnFreeVars) {
                                //        if (returnFreeVars[variable] < freeVars[variable]) {
                                //            returnFreeVars[variable] = freeVars[variable];
                                //        }
                                //    }
                                //    else {
                                //        returnFreeVars[variable] = freeVars[variable];
                                //    }
                                //}
                            }
                        }
                        break;
                    case '\\cdot':
                        //this case handles when a variable is multiplied with itself so their powers have to be added.
                        freeVarObjectCounter = 0;
                        freeVarObjectsLength = freeVarPowers.length;
                        for (freeVarObjectCounter; freeVarObjectCounter < freeVarObjectsLength; freeVarObjectCounter++) {
                            freeVars = freeVarPowers[freeVarObjectCounter];
                            variable = null;
                            for (variable in freeVars) {
                                if (variable in returnFreeVars) {
                                    if (returnFreeVars[variable] !== 'c') {
                                        if (freeVars[variable] === 'c') {
                                            returnFreeVars[variable] = freeVars[variable];
                                        }
                                        else {
                                            returnFreeVars[variable] += freeVars[variable];
                                        }
                                    }
                                }
                                else {
                                    returnFreeVars[variable] = freeVars[variable];
                                }
                                //if (variable in returnFreeVars) {
                                //    if (returnFreeVars[variable] !== null) {
                                //        if (returnFreeVars[variable] !== 'c') {
                                //            if (freeVars[variable] === 'c') {
                                //                returnFreeVars[variable] = 'c';
                                //            }
                                //            else if (freeVars[variable] !== null) {
                                //                returnFreeVars[variable] += freeVars[variable];
                                //            }
                                //        }
                                //    }
                                //    else {
                                //        returnFreeVars[variable] = freeVars[variable];
                                //    }
                                //}
                                //else {
                                //    returnFreeVars[variable] = freeVars[variable];
                                //}
                            }
                        }
                        break;
                    case '^':
                    case '\\frac':
                        // We check if the second child has returned any power value for variables. If yes then that variable is marked as complicated
                        variable = null;
                        for (variable in freeVarPowers[1]) {
                            if (freeVarPowers[1][variable] !== 0) {
                                returnFreeVars[variable] = 'c';
                            }
                            else {
                                //change by shashank...if not complicated then take power from first child and not second?? 
                                returnFreeVars[variable] = freeVarPowers[0][variable];
                            }
                        }
                        isRaisedToComplicated = false;
                        variable = null;
                        for (variable in returnFreeVars) {
                            if (returnFreeVars[variable] === 'c') {
                                isRaisedToComplicated = true;
                            }
                            if (rootNode.name === '^' && returnFreeVars[variable] < 0) {
                                isRaisedToComplicated = true;
                            }
                        }
                        // if the current case is of power operator then we check the imediate right child terminal for the digit value
                        if (rootNode.name === '^') {
                            variable = null;



                            for (variable in freeVarPowers[0]) {
                                if (isRaisedToComplicated && freeVarPowers[1][variable] > 0) {
                                    returnFreeVars[variable] = 'c';
                                }
                                else {
                                    if (freeVarPowers[0][variable] > 0) {

                                        if (rootNode.params[1].isTerminal === true && rootNode.params[1].type === 'digit') {
                                            nodePower = (Number)(nameSpace.TreeProcedures._getValueFromParam(rootNode.params[1]));
                                            returnFreeVars[variable] = nodePower < 0 ? 'c' : returnFreeVars[variable] === 0 ? nodePower : returnFreeVars[variable] * nodePower;
                                        }
                                        else {
                                            returnFreeVars[variable] = 'c';
                                        }


                                    }
                                }
                                //if (returnFreeVars[variable] !== 'c' && freeVarPowers[0][variable] !== 0) {
                                //    returnFreeVars[variable] = (Number)(rootNode.params[1].value);
                                //}
                            }
                        }
                        else {
                            variable = null;
                            for (variable in freeVarPowers[0]) {
                                if (returnFreeVars[variable] !== 'c') {
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
                                if (currentfreeVarObject[variable] > 0 || currentfreeVarObject[variable] === 'c') {
                                    returnFreeVars[variable] = 'c';
                                }
                                else {
                                    if (returnFreeVars[variable] !== 'c') {
                                        returnFreeVars[variable] = 0;
                                    }
                                }
                            }
                        }
                }

            }
            else {
                // this is the terminal node condition where we check whether it is a variable. If it is a variable we assign power as 1 else null.
                variable = null;
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
        @param backgroundColor{String} backgroung color of the boxes in the form `#ffffff`
        @param fontColor{String} font color of the text in the form `#ffffff`
        @return Void
        @static
        **/
        _displayArrayOfObjects: function _displayArrayOfObjects(objects, containerId, backgroundColor, fontColor) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                $container,
                objectCounter,
                objectsLength,
                currentObject,
                $childObject;
            if (nameSpace.Parser._deploy === true) {
                return;
            }
            if (objects !== undefined) {
                if (fontColor === undefined) {
                    fontColor = 'black';
                }
                if (backgroundColor === undefined) {
                    backgroundColor = '#777700';
                }
                $container = $('#' + containerId);
                $container.parent().css({ 'border': '1px solid black' });
                $container.css({
                    'border': '1px solid',
                    'border-color': nameSpace.Parser._borderColor,
                    'position': 'relative',
                    'overflow-x': 'hidden'
                });
                objectCounter = 0;
                objectsLength = objects.length;
                for (objectCounter; objectCounter < objectsLength; objectCounter++) {
                    currentObject = objects[objectCounter];
                    //if (currentObject.hasOwnProperty('toString')) {
                    $childObject = $('<div>' + currentObject + '</div>');
                    $childObject.attr('class', 'tokens');
                    $container.append($childObject);
                    //}
                    //else {
                    //    console.error('current object does not have toString function');
                    //}
                }
                $('.tokens').css({
                    'float': 'left',
                    'border': '1px solid black',
                    'margin': '5px',
                    'padding': '5px',
                    'background-color': backgroundColor,
                    'color': fontColor,
                    'font-weight': 'bold'
                });
            }
            else {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'The objects provided is undefined', []);
            }
        },

        /**
            
        This function makes the first call to recursiveDescentParser which parses the equation. 
        his function manages the left and right expression parsing, 
        converting the equation from A=B to A-B = 0 form,
        and then simplifying the A-B 
            
        @private
        @method _generateAnalysis
        @param  equationData{Object}
        @return Void
        @static
        **/
        _generateAnalysis: function _generateAnalysis(equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                leftTokens = equationData.getLeftExpression().tokens,
                rightTokens = equationData.getRightExpression().tokens,
                rightValidPredictionStack,
                rootNode,
                equationLeftRoot,
                equationRightRoot,
                equationUnits = equationData.getUnits(),
                profiles = equationData.getProfiles(),
                directives = equationData.getDirectives(),
                leftValidPredictionStack;

            if (!nameSpace.Parser._deploy) {
                //start time for generating left production rules stage.
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('leftProductionRules');
            }
            leftValidPredictionStack = nameSpace.Parser._recursiveDescentParser(equationData, leftTokens, 0, 0, [undefined], false);
            //if (leftValidPredictionStack === undefined) {
            //    equationData.canBeSolved = false;
            //}
            if (!nameSpace.Parser._deploy) {
                //processing time for generating left production rules stage.
                profiles[2] = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('leftProductionRules');
            }
            if (equationData.isCanBeSolved() === false) {
                return;
            }
            nameSpace.Parser._displayArrayOfObjects(leftValidPredictionStack, 'production-rules-display-left', '#777700', 'white');
            if (!nameSpace.Parser._deploy) {
                //start time for generating right production rules stage.
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('rightProductionRules');
            }
            rightValidPredictionStack = nameSpace.Parser._recursiveDescentParser(equationData, rightTokens, 0, 0, [undefined], false);
            if (!nameSpace.Parser._deploy) {
                //processing time for generating production rules stage.
                profiles[2] += MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('rightProductionRules');
            }
            if (equationData.isCanBeSolved() === false) {
                return;
            }
            nameSpace.Parser._displayArrayOfObjects(rightValidPredictionStack, 'production-rules-display-right', '#777700', 'white');
            //TODO shift right side to left
            //TODO redundant condition.
            if (leftValidPredictionStack !== undefined && rightValidPredictionStack !== undefined) {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE2 - Success]' + 'Prediction rules Generated Left:' + leftValidPredictionStack, [nameSpace.Parser._YSTYLE]);
            }
            else {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE2 - FAIL]' + 'Left Prediction Rules Failed', [nameSpace.Parser._NSTYLE]);
                return;
            }
            if (!nameSpace.Parser._deploy) {
                //start time for tree generation stage.
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('generateTree');
            }
            equationData.setLeftRoot(nameSpace.TreeProcedures.generateTree(leftValidPredictionStack, 0, equationUnits));
            equationData.setRightRoot(nameSpace.TreeProcedures.generateTree(rightValidPredictionStack, 0, equationUnits));

            if (!nameSpace.Parser._deploy) {
                //processing time for tree generation stage.
                profiles[3] = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('generateTree');
            }
            //Generate accessibility text 
            equationLeftRoot = equationData.getLeftRoot();
            equationRightRoot = equationData.getRightRoot();
            var str = nameSpace.TreeProcedures._toAccessible(equationLeftRoot).expression;
            if (equationData.getRhsAuto() !== true) {
                str += " equal to " + nameSpace.TreeProcedures._toAccessible(equationRightRoot).expression;
            }
            //str = str.replace('+ -', '- ');
            //str = str.replace('+ negative', '- ');
            equationData.setAccText(str);
            $('#accessibility-display').html('The Accesibility string is ' + str);
            if (directives.FDFlagMethod === "graphing") {
                //var flag = nameSpace.Parser._getAnalysisForFD(equationData.leftRoot) === 0 ? "frac" : "decimal";
                //if (flag === "frac" && equationData.rightRoot && !equationData.analysis.rhsAuto) flag = nameSpace.Parser._getAnalysisForFD(equationData.rightRoot) === 0 ? "frac" : "decimal";
                if (equationData.getFdFlag() === "frac") {
                    //equationData.analysis.FDFlag = flag === "frac" ? "decimal" : flag === "decimal" ? "frac" : "decimal";
                    if (equationLeftRoot.name === '\\frac' || (equationLeftRoot.name === 'do' && equationLeftRoot.params[0].name === '\\frac')) {
                        equationData.setFdFlag('decimal');
                        if (equationLeftRoot.name === 'do') {
                            nameSpace.Parser._checkIfFracHasNonFracChilds(equationLeftRoot.params[0], equationData);
                        }
                        else {
                            nameSpace.Parser._checkIfFracHasNonFracChilds(equationLeftRoot, equationData);
                        }
                    }
                }
            }

            if (directives.FDFlagMethod === 'calculator') {
                equationData.setFdFlag(nameSpace.Parser._getAnalysisForFD(equationLeftRoot) === 0 ? "frac" : "decimal");
            }

            //simplify the equation

            if (!nameSpace.Parser._deploy) {
                //start time for simplify stage.
                MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('simplify');
            }
            if (!equationLeftRoot.isTerminal) {
                equationLeftRoot.simplify(equationData);
            }
            if (equationRightRoot && !equationRightRoot.isTerminal) {
                equationRightRoot.simplify(equationData);
            }

            if (!nameSpace.Parser._deploy) {
                //processing time for simplify stage.
                profiles[4] = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('simplify');
            }

            if (equationLeftRoot.isTerminal && equationLeftRoot.type === "digit" && equationRightRoot !== null && !equationData.getRhsAuto() && equationRightRoot.isTerminal && equationRightRoot.type === "digit") {
                equationData.setCanBeSolved(false);
                equationData.setErrorString('Try adding some free variables');
                equationData.setErrorCode('CannotUnderstandThis');
                return;
            }





            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE4 - SUCCESS]' + 'Tree Simplified', [nameSpace.Parser._YSTYLE]);
            if (!nameSpace.Parser._deploy) {
                nameSpace.Parser._printLatex(equationLeftRoot, 4, true);
                //nameSpace.Parser._printLatex(equationData.rightRoot, 4, true);
            }

            if (equationData.getSpecie() !== 'expression') {
                //delaying combining post simplify so that we have a clear idea of wheather 
                nameSpace.TreeProcedures.combineLeftRightTree(equationData);
            }
            rootNode = equationLeftRoot;

            //nameSpace.Parser._printLatex(equationData.leftRoot, 3, true);

            //if(equationData.leftRoot !== undefined && equationData.rightRoot !== undefined){
            if (equationLeftRoot !== undefined) {
                //nameSpace.Parser._nodeDisplay(rootNode, true);

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE3 - Success]' + 'Equation Tree Generated', [nameSpace.Parser._YSTYLE]);
                if (!nameSpace.Parser._deploy) {
                    nameSpace.Parser._printLatex(rootNode, 3, true);
                }
            }
            else {
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE3 - FAIL]' + 'Left Equation Tree Generation Failed', [nameSpace.Parser._NSTYLE]);
                return;
            }







            //after simplification of the left side check if the leftside is reduced to terminal. if it has then that means it is a constant
            //if (rootNode.isTerminal === true) {
            //    equationData.type = 'expression';
            //    equationData.solution = [nameSpace.TreeProcedures._getValueFromParam(rootNode)];
            //}
            if (equationData.getSpecie() === 'expression') {
                //equationData.rightRoot;
                //var rightSide = nameSpace.TreeProcedures._substituteParamVariableAndGetValue(equationData.rightRoot, equationData.constants);
                equationData.setSolution(nameSpace.TreeProcedures._substituteParamVariableAndGetValue(equationData.getLeftRoot(), equationData.getConstants()));
                //equationData.solution = Number(equationData.solution.toPrecision(10));
            }
            if (!nameSpace.Parser._deploy) {
                nameSpace.TreeProcedures._toLatex(rootNode);
            }


        },

        _checkIfFracHasNonFracChilds: function _checkIfFracHasNonFracChilds(root, equationData) {
            if (equationData.getFdFlag() === 'frac') {
                return;
            }
            var childCounter,
                childLength,
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                children;
            if (!root.isTerminal) {
                if (root.name === '\\frac') {
                    children = root.params;
                    childLength = children.length;
                    for (childCounter = 0; childCounter < childLength; childCounter++) {
                        nameSpace.Parser._checkIfFracHasNonFracChilds(children[childCounter], equationData);
                        if (equationData.getFdFlag() === 'frac') {
                            return;
                        }
                    }
                }
                else {
                    equationData.setFdFlag('frac');
                }
            }
        },

        _getAnalysisForFD: function _getAnalysisForFD(root) {
            var childCounter,
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                childLength,
                returnValue, childFlag = 1;
            //return type 1 means ignore, 0 means frac and NaN for decimal
            if (root.isTerminal) {
                if (root.type === 'digit') {
                    if (root.value.toString().indexOf('.') !== -1) {
                        return NaN;
                    }
                    else {
                        return 1;
                    }
                }
                else if (root.type === 'const') {
                    //TODO replace with function that checks with natural constants
                    if (root.value === 'e' || root.value === '\\pi') {
                        return NaN;
                    }
                    else {
                        // To change return type when constants a b c used in graphing-tool
                        return 1;
                    }
                }
                else {
                    //var
                    return 1;
                }
            }
            else {
                if (nameSpace.TreeProcedures.isOperator(root.name) || root.name === 'do') {
                    childLength = root.params.length;
                    for (childCounter = 0; childCounter < childLength; childCounter++) {
                        returnValue = nameSpace.Parser._getAnalysisForFD(root.params[childCounter]);

                        childFlag = returnValue * childFlag;

                        if (isNaN(childFlag)) {
                            return NaN;
                        }
                    }
                    return childFlag;

                }
                else if (root.name === '\\frac') {
                    return 0;
                }
                else {
                    return NaN;
                }
            }
        },

        /**
        Function to show production rules in a popup window. The function is called on click of `View Rules` button

        @private
        @method _showRules
        @return Void
        @static
        **/


        _showRules: function _showRules() {
            var rulesWindow = window.open('', '', 'width=700,height=700'),
                textArea = $('<textarea>' + $('#rules').text() + '</textarea>');
            textArea.css({
                'width': '600px',
                'height': '600px'
            });
            $(rulesWindow.document.body).append(textArea);
            //textArea.text($('#rules').text());
            //rulesWindow.document.appendChild(textArea);
        },



        /**
        * @method printLatex Function to print the Latex expression and display the corresponding tree on the canvas for the different stages.        
        * @param rootNode {Object} It provides the root node of the tree.
        * @param stageNumber {Number} It provides the stageNumber of the stage to be formed.
        * @param showTree {Boolean} Specifies whether the tree has to be shown or not.
        
        **/

        _printLatex: function _printLatex(rootNode, stageNumber, showTree) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                stage,
                $stage,
                $headerDiv,
                $inputContainer,
                latexString,
                $stageDiv,
                $treeCanvas,
                args;


            if (nameSpace.Parser._deploy === true) {
                return;
            }
            stage = {
                '0': 'Preprocessing',
                '1': 'Token Generation',
                '2': 'Create Production Rules',
                '3': 'Generate Equation Tree',
                '4': 'Simplify',
                '5': 'Find Equation Solvability',
                '6': 'Expand Equation',
                '7': 'Convert to Quadratic Form',
                '8': 'Solve'
            };
            $stage = $('<div></div>');
            $inputContainer = $('#display-outter-container');
            $inputContainer.append($stage);
            $headerDiv = $('<div></div>');
            $headerDiv.attr('id', 'header' + stageNumber).css({ 'font-weight': 'bold' }).html(stage[stageNumber]);
            $stage.attr('id', 'stage-number' + stageNumber).append($headerDiv).css({ 'border': '1px solid black', 'padding': '10px 5px 5px 10px', 'margin': '25px 5px 5px 5px' });

            latexString = nameSpace.TreeProcedures._toLatex(rootNode);
            $stageDiv = $('<span></span>');
            $stageDiv.attr('id', 'stage' + stageNumber).css({ 'border': '1px solid', 'border-color': nameSpace.Parser._borderColor, 'margin': '5px 5px 5px 5px', 'padding': '5px 5px 5px 5px' });
            //.attr('class', 'mathquill-editable mathquill-editable-size');
            $stage.append($stageDiv);
            $('#stage' + stageNumber).append(latexString).mathquill();

            $stage.append('<br/>');
            if (showTree) {
                $treeCanvas = $('<canvas></canvas>');
                $treeCanvas.attr('id', 'canvas-stage' + stageNumber).css({ 'border': '1px solid', 'border-color': nameSpace.Parser._borderColor });
                $stage.append($treeCanvas);
                args = ['canvas-stage' + stageNumber];
                nameSpace.Parser._displayTree(rootNode, args);

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'The latex string is ' + latexString, []);
            }

            return;
        },

        /**
        This function generates production rules from the series of token that represents a latex expression.
            
        @private
        @method _recursiveDescentParser
        @param tokens{Array} array of tokens
        @param startAtTokenIndex{Integer} location from where the analysis should be started in token array
        @param recursionIndex{Integer} the level of recursive call
        @param lookAhead{Array} 
        @return
        @static
        **/
        _recursiveDescentParser: function _recursiveDescentParser(equationData, tokens, startAtTokenIndex, recursionIndex, lookAhead, isRange) {
            if (equationData.isCanBeSolved() === false) {
                return;
            }
            if (tokens.length === 0) {
                return;
            }
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                peekToken = tokens[startAtTokenIndex],
                startedAtIndex = startAtTokenIndex,
                allValidRules = nameSpace.ParsingProcedures.getPredictionStacksForToken(peekToken, 'E', isRange),
                tokenPointer,
                predictionStackPointer,
                predictionStack,
                i,
                j,
                k,
                peekStack,
                isPredictionAccepted,
                solutionPath,
                acceptedPredictions,
                currentSolution,
                recursiveTermExpandedFlag,
                recursiveSearchResult,
                stackRecursiveFlag,
            //lookAheadForNextRecursion,
                removedRecursiveGoal,
                numberOfLookaheadsAdded,
                currentRule,
                validRulesLength,
                upcomingToken;

            if (allValidRules === undefined) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '############################### ERROR ##########################', []);
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'no rules found for E ->' + peekToken.value, []);
                equationData.setCanBeSolved(false);
                equationData.setErrorCode('CannotUnderstandThis');
                return;
            }
            tokenPointer = startAtTokenIndex;
            predictionStackPointer = 0;
            j = 0;
            solutionPath = [];

            acceptedPredictions = [];
            validRulesLength = allValidRules.length;
            //TRACE
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '----------------------Begin recursion ' + recursionIndex + '------------------ with lookahead ' + lookAhead, []);
            for (i = 0; i < validRulesLength; i++) {
                currentRule = allValidRules[i];
                currentSolution = [];

                predictionStack = [];


                if (isRange) {
                    nameSpace.ParsingProcedures.cloneStringStack(nameSpace.RangeProductionRules.rangeRules[currentRule], predictionStack);
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, 'for ' + currentRule + ' rules are ' + nameSpace.RangeProductionRules.rangeRules[currentRule], []);
                }
                else {
                    nameSpace.ParsingProcedures.cloneStringStack(nameSpace.Parser._productions.productionRules[currentRule], predictionStack);
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, 'for ' + currentRule + ' rules are ' + nameSpace.Parser._productions.productionRules[allValidRules[i]], []);
                }

                //TODO check if this stack end is not pursuing same endless goal as the lookahead token eg check if this prediction stack and lookahead are both (+E)+ 
                currentSolution.push(currentRule);

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[Predict ' + recursionIndex + ']' + ' Level ' + recursionIndex + ' by rule ' + currentRule + ' Processing prediction ' + predictionStack, [nameSpace.Parser._HSTYLE]);

                tokenPointer = startAtTokenIndex;
                predictionStackPointer = 0;
                isPredictionAccepted = true;
                recursiveTermExpandedFlag = false;
                stackRecursiveFlag = nameSpace.ParsingProcedures.isStackInfinite(predictionStack);
                if (stackRecursiveFlag === true && nameSpace.ParsingProcedures.verifyStackWithLookahead(predictionStack, lookAhead) === false) {
                    //TRACE
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[FAIL ' + recursionIndex + ']' + 'Rejecting STACk ' + predictionStack + ' because we cant pursue same GOAL again...', [nameSpace.Parser._NSTYLE]);
                    continue;
                }

                while (predictionStackPointer < predictionStack.length) {
                    peekStack = nameSpace.ParsingProcedures.peekInPredictionStack(predictionStack, predictionStackPointer);
                    peekToken = tokens[tokenPointer];

                    //TRACE
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, peekToken + ' <> ' + peekStack + ' >> ' + nameSpace.ParsingProcedures.isTokenSame(peekToken, peekStack), []);
                    if (nameSpace.ParsingProcedures.isTokenSame(peekToken, peekStack)) {
                        currentSolution.push(peekToken);
                    }
                    else if (nameSpace.ParsingProcedures.isNonTerminal(peekStack)) {
                        //TRACE
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, 'TErminal Node...going in...stack so far ' + currentSolution, []);

                        //lookAheadForNextRecursion = predictionStack[predictionStackPointer + 1];

                        numberOfLookaheadsAdded = nameSpace.ParsingProcedures.pushAllLookAheads(lookAhead, predictionStack, predictionStackPointer + 1);


                        /*if (lookAheadForNextRecursion !== undefined) {
                        lookAhead.push(lookAheadForNextRecursion);
                        }*/


                        //TRACE
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[PAUSE ' + recursionIndex + ']', [nameSpace.Parser._BLUE_STYLE]);

                        recursiveSearchResult = nameSpace.Parser._recursiveDescentParser(equationData, tokens, tokenPointer, recursionIndex + 1, lookAhead, isRange);

                        if (equationData.isCanBeSolved() === false) {
                            return;
                        }
                        for (k = 0; k < numberOfLookaheadsAdded; k++) {
                            lookAhead.pop();
                        }

                        //TRACE
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[RESUME ' + recursionIndex + ']' + '>>>>Recursion level ' + recursionIndex + ' resumes with solution ' + recursiveSearchResult, [nameSpace.Parser._BLUE_STYLE]);

                        if (recursiveSearchResult === undefined) {
                            //TRACE
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[FAIL ' + recursionIndex + ']' + ' prediction ' + predictionStack + ' is invalid...REJECTING at ' + currentSolution, [nameSpace.Parser._NSTYLE]);
                            isPredictionAccepted = false;
                            break;
                        }
                        else {
                            //TRACE
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, ' recursion will resume from index ' + recursiveSearchResult.tokenPointer, []);
                            tokenPointer = recursiveSearchResult.tokenPointer;

                            for (j = 0; j < recursiveSearchResult.length; j++) {
                                currentSolution.push(recursiveSearchResult[j]);
                            }
                        }
                    }
                    else {
                        if (stackRecursiveFlag && recursiveTermExpandedFlag && nameSpace.ParsingProcedures.isTermInfinite(predictionStack[predictionStackPointer])) {
                            removedRecursiveGoal = predictionStack[predictionStackPointer];

                            //REVIEW THIS CONDITION
                            if (predictionStackPointer >= predictionStack.length) {
                                //TRACE
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, 'Finished chasing recursive term ' + removedRecursiveGoal + ' from total stack :' + predictionStack, []);
                                recursiveTermExpandedFlag = false;
                            }
                            else {
                                isPredictionAccepted = true;
                                //TRACE
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[ACCEPT ' + recursionIndex + ']' + 'Stack matched so far...dumping ALL infinite term and breaking: ' + predictionStack + " recursionIndex :: " + recursionIndex, [nameSpace.Parser._YSTYLE]);
                                //comment by shashank
                                //TODO check if this breaks the code
                                //if (recursionIndex > 0) {
                                //    break;
                                //}
                            }

                        }
                        else {
                            isPredictionAccepted = false;
                            //TRACE                    
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[FAIL ' + recursionIndex + ']' + ' STack match failed...DISCARDING stack!!! ' + predictionStack, [nameSpace.Parser._NSTYLE]);
                            break;
                        }


                    }

                    predictionStackPointer++;
                    tokenPointer++;
                    if (stackRecursiveFlag && nameSpace.ParsingProcedures.isTermInfinite(predictionStack[predictionStackPointer])) {
                        upcomingToken = tokens[tokenPointer];

                        //check if next token matches with the peek from prediction stack. if it doesnt match then liberate this recursive goal

                        //TRACE
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, 'trying to match peek from ' + predictionStack[predictionStackPointer] + ' >> ' + nameSpace.ParsingProcedures._getPeekValue(predictionStack[predictionStackPointer]) + ' with next token ' + upcomingToken, []);

                        if (upcomingToken !== undefined) {
                            if (nameSpace.ParsingProcedures._getPeekValue(predictionStack[predictionStackPointer]) !== tokens[tokenPointer].value) {
                                if (recursiveTermExpandedFlag === false) {
                                    isPredictionAccepted = false;
                                    //TRACE
                                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[FAIL ' + recursionIndex + ']' + ' ' + predictionStack[predictionStackPointer] + ' is NOT used...DISCARDING stack!!! ' + predictionStack, [nameSpace.Parser._NSTYLE]);
                                    break;
                                }
                                else {
                                    if (predictionStackPointer + 1 >= predictionStack.length) {
                                        //TRACE
                                        //Solution to fi operator is followed a another operator
                                        if (nameSpace.ParsingProcedures.checkWithLookAhead(tokens[tokenPointer], lookAhead)) {
                                            isPredictionAccepted = true;
                                            break;
                                        }
                                        else {
                                            isPredictionAccepted = false;
                                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, ' All recursive terms are used and exhausted...breaking the chain for stack ' + predictionStack + ' and lookahead ' + lookAhead, []);
                                            break;
                                        }

                                    }
                                    else {
                                        //TRACE
                                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, 'match FAILED so moving on to ' + predictionStack[predictionStackPointer + 1], []);
                                        recursiveTermExpandedFlag = true;
                                        nameSpace.ParsingProcedures.expandRecursiveStack(predictionStack, predictionStackPointer + 1);
                                        predictionStackPointer++;
                                    }

                                }

                            }
                            else {
                                //TRACE
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, 'match success expanding ' + predictionStack[predictionStackPointer], []);
                                recursiveTermExpandedFlag = true;
                                nameSpace.ParsingProcedures.expandRecursiveStack(predictionStack, predictionStackPointer);
                            }

                        }
                        else {
                            //TRACE
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, 'All tokens are over...No need to expand stack ' + predictionStack, []);
                        }






                    }


                    if (tokenPointer >= tokens.length && predictionStackPointer < predictionStack.length) {
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Checking when tokens are over and stack is not: recursive is ' + stackRecursiveFlag, []);
                        if (stackRecursiveFlag) {
                            if (recursiveTermExpandedFlag && predictionStackPointer === predictionStack.length - 1) {
                                //check if the stack is recursive and term we have in the end is also recursive, then that means we can safely assume that we can dump the recursive term
                                //TRACE
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[ACCEPT ' + recursionIndex + ']' + ' prediction accepted ' + predictionStack, [nameSpace.Parser._YSTYLE]);
                                isPredictionAccepted = true;
                            }
                            else {
                                isPredictionAccepted = false;
                                //TRACE
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[FAIL ' + recursionIndex + ']' + 'Tokens are finished but there are unexpanded recursive terms...rejecting the prediction ' + predictionStack + ' at index ' + predictionStackPointer, [nameSpace.Parser._NSTYLE]);
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[FAIL]' + 'There was an error in syntax of equation. We could not find ' + predictionStack[predictionStackPointer], [nameSpace.Parser._NSTYLE]);

                            }

                        }
                        else {
                            //TRACE
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[FAIL ' + recursionIndex + ']' + 'Tokens are finished when prediction stack is NOT...REJECTING the prediction', [nameSpace.Parser._NSTYLE]);
                            isPredictionAccepted = false;

                        }
                        break;

                    }
                    else if (predictionStackPointer >= predictionStack.length && tokenPointer < tokens.length) {
                        //TRACE
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, 'Prediction Stack over: Checking with lookahead ' + tokens[tokenPointer] + ' <> ' + lookAhead, []);
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
                        * 
                        * 
                        * 
                        * 
                        */
                        //if(ParsingProcedures.isTokenSame(tokens[tokenPointer],ParsingProcedures._getPeekValue(lookAhead))){

                        if (nameSpace.ParsingProcedures.checkWithLookAhead(tokens[tokenPointer], lookAhead)) {
                            //TRACE
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[ACCEPT ' + recursionIndex + ']' + 'Prediction stack finished and lookahead matches...ACCEPTING the prediction by rule ' + allValidRules[i], [nameSpace.Parser._YSTYLE]);

                            isPredictionAccepted = true;
                        }
                        else {
                            //TRACE
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '%c[FAIL ' + recursionIndex + ']' + 'Prediction stack finished and lookahead doesnt match...REJECTING the prediction by rule ' + allValidRules[i], [nameSpace.Parser._NSTYLE]);
                            isPredictionAccepted = false;
                        }

                        break;
                    }


                }

                if (isPredictionAccepted === true) {
                    //TRACE

                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, 'checking if the accepted solution is final :: ' + nameSpace.ParsingProcedures.checkWithLookAhead(peekToken, lookAhead), []);
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, 'checking if the accepted solution is final :: ' + nameSpace.ParsingProcedures.checkWithLookAhead(peekToken, lookAhead), []);

                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, 'Prediction accepted is ' + currentSolution, []);
                    currentSolution.tokenPointer = tokenPointer - 1;
                    acceptedPredictions.push(currentSolution);
                    //TODO check if accepting first matched prediction is the really the best way to go?
                    break;

                }


            }

            //TRACE
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, acceptedPredictions.length + ' Solutions found ....', []);
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '----------------------End recursion ' + recursionIndex + '------------------');

            //TRACE
            if (acceptedPredictions.length > 1) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '=================================ACCEPTED PREDICTIONS ARE MORE THAN ONE!!!!==================================after ' + startedAtIndex, []);

                for (k = 0; k < acceptedPredictions.length; k++) {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Prediction is ' + acceptedPredictions[k], []);
                }
            }
            else if (acceptedPredictions.length === 1) {
                return acceptedPredictions[0];
            }


        },

        /**
        Display the equation tree for debugging purposes           
            
        
        @method _displayTree
        @private
        @param rootNode{Object} Rootnode of the tree
        @param args{String|Array} canvas id or array of canvas ids
        @return Void
        @static
        **/
        _displayTree: function _displayTree(rootNode, args) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                containerWidth,
                canvasArray,
                i,
                canvasCounter = 0,
                totalCanvas,
                paperArray = [],
                element = null;
            /*width for outter container of canvas*/
            containerWidth = window.innerWidth - ($('#button-container').width() + $('#equation').width() + $('.mathquill-editable').width() + 100);
            $('#canvasContainer').width(containerWidth);

            canvasArray = [];
            if (typeof (args) === 'object') {
                canvasArray = args;
            }
            else {
                for (i = 1; i < arguments.length; i++) {
                    canvasArray[i - 1] = arguments[i];
                }
            }
            totalCanvas = canvasArray.length;
            /*set different canvases for paper object and call nodeDisplay function for that element*/
            for (; canvasCounter < totalCanvas; canvasCounter++) {
                if (typeof (canvasArray[canvasCounter]) === 'string') {
                    paperArray[canvasCounter] = new paper.PaperScope();
                    element = document.getElementById(canvasArray[canvasCounter]);
                    paperArray[canvasCounter].setup(element);
                    nameSpace.Parser._nodeDisplay(rootNode, true, paperArray[canvasCounter], element);
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

        _nodeDisplay: function _nodeDisplay(nodeObj, isFirstChild, paperCanvasObject, canvasName) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                subnode = 0,
                parentLength = 0,
                maxtextLength = nameSpace.Parser._getTextWidth($('<div></div>').html(nodeObj.toString()), true),
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

                nameSpace.Parser._nodeCounter(nodeObj, firstNodeName.toString(), nodeCountObject, maxNodeLevel);
                nameSpace.Parser._totalNodeCounter(nodeCountObject);
                textLength = null;

                for (i = 0; i < parentLength; i++) {
                    textLength = nameSpace.Parser._getTextWidth($('<div></div>').html(nodeObj.params[i].toString()), true);
                    if (maxtextLength < textLength) {
                        maxtextLength = textLength;
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
                canvasWidth = maxNodeLevel[0] * (100 + maxtextLength) + 100;
                canvasHeight = childs * 30;

                $(canvasName).height(canvasHeight);
                $(canvasName).width(canvasWidth);

                paper = paperCanvasObject;
                paper.view.viewSize = [canvasWidth, canvasHeight];

                nameSpace.Parser._textOnCanvas(nodeObj.toString(), subnode.toString(), maxtextLength, nodeCountObject);

                /*function Draw node content and its sub node content*/
                nameSpace.Parser._subnodeDisplay(nodeObj, subnode.toString(), maxtextLength, nodeCountObject);

                nameSpace.Parser._textOnCanvas(nodeObj.toString(), subnode.toString(), maxtextLength, nodeCountObject);

                nameSpace.Parser._arrowGenerator();

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
        _nodeCounter: function _nodeCounter(nodeObj, subnodeName, nodeCountObject, nodeCount) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                obj,
                i = 0,
                nodeObjLength;
            if (!nodeObj.isTerminal) {
                i = 0;
                nodeObjLength = nodeObj.params.length;
                for (; i < nodeObjLength; i++) {
                    nameSpace.Parser._nodeCounter(nodeObj.params[i], subnodeName + i, nodeCountObject, nodeCount);
                }
                if (subnodeName !== '0') {
                    obj = {
                        name: subnodeName,
                        childNode: nodeObjLength,
                        totalNode: 0
                    };
                    nodeCountObject.push(obj);
                }
                nodeCount[0]++;
            }
            else {
                obj = {
                    name: subnodeName,
                    childNode: 0,
                    totalNode: 0
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
        _totalNodeCounter: function _totalNodeCounter(nodeCountObject) {

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
                        }
                        else {
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
        @param maxtextLength{Integer} node text width
        @param nodeCountObject{Object} node count object
        @return
        @static
        **/
        _subnodeDisplay: function _subnodeDisplay(nodeObj, subNodeRoot, maxtextLength, nodeCountObject) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                length,
                i = 0,
                text = 0;
            if (!nodeObj.isTerminal) {
                length = nodeObj.params.length;
                if (length !== 0) {
                    for (; i < length; i++) {
                        nameSpace.Parser._subnodeDisplay(nodeObj.params[i], subNodeRoot + i, maxtextLength, nodeCountObject);
                        text = nodeObj.params[i].toString();
                        nameSpace.Parser._textOnCanvas(text, subNodeRoot + i, maxtextLength, nodeCountObject);
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
        @param maxtextLength{Integer} node text width
        @param nodeCountObject{Object} node count object
        @return
        @static
        **/
        _textOnCanvas: function _textOnCanvas(text, subNodeRoot, maxtextLength, nodeCountObject) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
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

            x = (nodeLevel - 1) * (100 + maxtextLength);

            for (; i < nodeLevel; i++) {
                switch (i) {
                    case 0:
                        y = 20;
                        break;
                    default:
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

            width = maxtextLength + 30;

            rectangle = new Path.Rectangle({
                point: [x, y - 12],
                size: [width, 20],
                strokeWidth: 2,
                strokeColor: '#000000'
                //name: subNodeRoot
            });
            rectangle.subNodeRoot = subNodeRoot;
            /*text of rootnode*/
            textLength = nameSpace.Parser._getTextWidth($('<div></div>').html(text), true);
            textxPoint = (width - textLength) / 2;
            text = new PointText({
                point: [x + textxPoint, y],
                content: text,
                fontSize: 12,
                fillColor: 'black'
            });

        },

        /**
                
        Display arrow between parent and child nodes     
       
        @method _arrowGenerator
        @private
        @return Void
        @static
        **/
        _arrowGenerator: function _arrowGenerator() {

            var childrenPath = paper.project.activeLayer.children,
                length = childrenPath.length,
                i = 0, name, j,
                centerSource = new Point(),
                centerDest = new Point(),
                line, midPoint = new Point();


            for (; i < length; i++) {
                if (i % 2 === 0) {
                    name = childrenPath[i].subNodeRoot;
                    name = name.substring(0, name.length - 1);
                    j = i;
                    for (; j < length; j++) {
                        if ((childrenPath[j].subNodeRoot) === name) {
                            centerSource.x = (childrenPath[i].segments[0].point.x + childrenPath[i].segments[1].point.x) / 2;
                            centerSource.y = (childrenPath[i].segments[0].point.y + childrenPath[i].segments[1].point.y) / 2;
                            centerDest.x = (childrenPath[j].segments[2].point.x + childrenPath[j].segments[3].point.x) / 2;
                            centerDest.y = (childrenPath[j].segments[2].point.y + childrenPath[j].segments[3].point.y) / 2;
                            if (centerSource.y !== centerDest.y) {
                                midPoint.x = (centerDest.x + centerSource.x) / 2;
                                midPoint.y = centerDest.y;
                                line = new Path({
                                    segments: [midPoint, [midPoint.x, centerSource.y], centerSource],
                                    strokeWidth: 2,
                                    strokeColor: '#000000'
                                });
                            }
                            else {
                                line = new Path({
                                    segments: [centerSource, centerDest],
                                    strokeWidth: 2,
                                    strokeColor: '#000000'
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
        @param $div{Object} Jquery div object containig the text
        @param bDebug{Boolean} true if function is called from debugger console
        @return {Integer} width of the text
        @static
        **/
        _getTextWidth: function _getTextWidth($div, bDebug) {
            if (bDebug) {
                $('body').append($div);
            }
            var html_org = $div.html(),
            html_calc = '<span>' + html_org + '</span>',
            width;
            $div.html(html_calc);
            width = $div.find('span:first').width();
            $div.html(html_org);
            if (bDebug) {
                $div.detach();
            }
            return width;
        },

        _showConsole: function _showConsole(flag, string, colorArray) {
            return;
            //flag = string = colorArray = undefined;
            //return;
            var length;
            if (window.console) {
                if (flag) {
                    if (colorArray === undefined) {
                        length = 0;
                    }
                    else {
                        length = colorArray.length;
                    }
                    switch (length) {
                        case 0:
                            console.log(string);
                            break;
                        case 1:
                            console.log(string, colorArray[0]);
                            break;
                        case 2:
                            console.log(string, colorArray[0], colorArray[1]);
                            break;
                    }
                }
            }
        }
    });

    /**
     
    @class MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.TreeProcedures
    @public
    **/
    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.TreeProcedures = Backbone.Model.extend({}, {

        _mathFunctions: MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.MathFunctions,
        _productions: MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Productions,



        OPERATOR_TEXT: {
            ADD: ' plus ',
            SUBTRACT: ' minus ',
            MULTIPLY: ' multiplied by ',
            NEGATIVE: ' negative ',
            DIVIDE: ' divided by ',
            SIN: 'sine of ',
            COS: 'cos of ',
            TAN: 'tan of ',
            CSC: 'cosec of ',
            FACTORIAL: ' factorial',
            NATURAL_LOG: 'Natural log of ',
            '\\pi': 'Pi',
            'e': ' Euler’s constant ',
            RECIPROCAL: 'Reciprocal of ',
            ABS: 'Absolute value of ',
            SIN_INV: 'Inverse sine of ',
            COS_INV: 'Inverse cos of ',
            TAN_INV: 'Inverse tan of ',
            CSC_INV: 'Inverse cosec of ',
            INV: 'Inverse ',
            SQUARE: ' squared',
            CUBE: ' cube',
            POWER: ' raised to ',
            SQUARE_ROOT: 'Square root of ',
            CUBE_ROOT: 'Cube root of ',
            ROOT: 'root of ',
            OPEN_BRACKET: 'open bracket ',
            CLOSE_BRACKET: ' close bracket ',
            PERCENT: ' Percentage',
            TH: 'th ',
            RD: 'rd ',
            ST: 'st ',
            ND: 'nd '
        },

        /*
        * @method _toLatex Function to get the latex expression.
        * Cases handled : () , ^ , + , \cdot, \frac.
        * @param rootNode {Object} It provides the root node of the tree.
        * @return {String} The function returns the latex expression.
            
        */
        _toLatex: function _toLatex(rootNode) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                latexArray,
                latexExpression,
                i,
                paramCount;
            if (rootNode.isTerminal === false) {
                latexArray = [];
                for (i = 0; i < rootNode.params.length; i++) {
                    latexArray.push(nameSpace.TreeProcedures._toLatex(rootNode.params[i]));
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, latexArray, []);
                }

                latexExpression = '';
                if (rootNode.sign === '-') {

                    latexExpression = '-';
                }

                switch (rootNode.name) {

                    case 'do':
                        //latexExpression += '\\left(' + latexArray[0] + '\\right)';
                        latexExpression += latexArray[0];
                        return latexExpression;
                    case '^':
                        if (rootNode.params[0].isTerminal === true) {
                            latexExpression += latexArray[0];
                        }
                        else {
                            if (nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.name) > nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.params[0].name)) {
                                latexExpression += '\\left(' + latexArray[0] + '\\right)';
                            }
                            else {
                                latexExpression += latexArray[0];
                            }
                            // TODO: dzdasd

                        }
                        if (rootNode.params[1].isTerminal === true) {
                            latexExpression += '^' + latexArray[1];
                        }
                        else {
                            if (nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.name) > nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.params[1].name)) {
                                latexExpression += '^' + '\\left(' + latexArray[1] + '\\right)';
                            }
                            else {
                                latexExpression += '^' + latexArray[1];
                            }

                        }

                        return latexExpression;
                    case '+':
                        latexExpression += latexArray[0];
                        for (paramCount = 1; paramCount < latexArray.length; paramCount++) {
                            latexExpression += '+' + latexArray[paramCount];
                        }

                        return latexExpression;

                    case '\\cdot':
                        if (rootNode.params[0].isTerminal === false) {
                            if (nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.name) > nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.params[0].name)) {
                                latexExpression += '\\left(' + latexArray[0] + '\\right)';
                            }
                            else {
                                latexExpression += latexArray[0];
                            }
                        }
                        else {
                            latexExpression += latexArray[0];
                        }
                        for (paramCount = 1; paramCount < latexArray.length; paramCount++) {
                            if (rootNode.params[paramCount].isTerminal === true) {
                                latexExpression += '\\cdot ' + latexArray[paramCount];
                            }
                            else {
                                if (nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.name) > nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.params[paramCount].name)) {
                                    latexExpression += '\\cdot ' + '\\left(' + latexArray[paramCount] + '\\right)';
                                }
                                else {
                                    latexExpression += '\\cdot ' + latexArray[paramCount];
                                }
                            }
                        }
                        return latexExpression;
                    case '\\frac':
                        latexExpression += '\\frac {' + latexArray[0] + '}{' + latexArray[1] + '}';
                        return latexExpression;
                    case '\\sqrt':
                        latexExpression = '';
                        if (rootNode.params[0].isTerminal === false) {
                            latexExpression += '\\sqrt [\\left(' + latexArray[0] + '\\right)]';
                        }
                        else {
                            latexExpression += '\\sqrt [' + latexArray[0] + ']';
                        }
                        if (rootNode.params[1].isTerminal === false) {
                            latexExpression = latexExpression + ' {\\left(' + latexArray[1] + '\\right)}';
                        }
                        else {
                            latexExpression = latexExpression + ' {' + latexArray[1] + '}';
                        }
                        return latexExpression;
                    case '\\log_':
                        latexExpression = '';
                        if (rootNode.params[0].isTerminal === false) {
                            latexExpression += '\\log_{\\left(' + latexArray[0] + '\\right)}';
                        }
                        else {
                            latexExpression += '\\log_{' + latexArray[0] + '}';
                        }
                        latexExpression = latexExpression + ' \\left(' + latexArray[1] + '\\right)';
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
                        if (rootNode.params[0].isTerminal === false) {

                            latexExpression += rootNode.name + ' \\left(' + latexArray[0] + '\\right)';
                        }
                        else {
                            latexExpression += rootNode.name + ' ' + latexArray[0];
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
                        if (rootNode.params[0].isTerminal === false) {
                            latexExpression = '\\left(' + latexArray[0] + '\\right)!';
                        }
                        else {
                            latexExpression = latexArray[0] + '!';
                        }
                        return latexExpression;
                    case '\\lcm':
                    case '\\gcd':
                    case '\\mod':
                    case '\\min':
                    case '\\max':
                    case '\\nCr':
                    case '\\nPr':
                        if (rootNode.params[0].isTerminal === false) {
                            latexExpression += rootNode.name + ' \\left( \\left( ' + latexArray[0] + '\\right) , ';
                        }
                        else {
                            latexExpression += rootNode.name + ' \\left( ' + latexArray[0] + ' , ';
                        }
                        if (rootNode.params[1].isTerminal === false) {
                            latexExpression += ' \\left( ' + latexArray[1] + '\\right) \\right)';
                        }
                        else {
                            latexExpression += latexArray[1] + '\\right)';
                        }
                        return latexExpression;
                    case '\\prod':
                    case '\\sum':
                        if (rootNode.params[0].isTerminal === false) {
                            latexExpression += rootNode.name + '{n=' + '\\left(' + latexArray[0] + '\\right)}^';
                        }
                        else {
                            latexExpression += rootNode.name + '{n=' + latexArray[0] + '}^';
                        }
                        if (rootNode.params[1].isTerminal === false) {
                            latexExpression += '{ \\left(' + latexArray[1] + '\\right)}';
                        }
                        else {
                            latexExpression += '{' + latexArray[1] + '}';
                        }
                        if (rootNode.params[2].isTerminal === false) {
                            latexExpression += ' \\left(' + latexArray[2] + '\\right)';
                        }
                        else {
                            latexExpression += latexArray[2];
                        }
                        return latexExpression;
                    case '\\%':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression += rootNode.params[0].value + rootNode.name;
                        }
                        else {
                            latexExpression += latexArray[0] + rootNode.name;
                        }
                        return latexExpression;
                }
            }
            else {
                if (rootNode.sign === '+') {
                    return rootNode.value;
                }
                else {
                    if (rootNode.value < 0) {
                        return rootNode.value * -1;
                    }
                    else {
                        return rootNode.sign + rootNode.value;
                    }

                }

            }

        },

        /*
        * Function get postfix string for the number eg . 'st' for 1 and 'nd' for 2
        * @method getNumberPostFix
        * @param number {Number|String} The number for whick the postfix operator has to be found out.
        * @return {String} The postfix string.
            
        */
        getNumberPostFix: function getNumberPostFix(number) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                numberString,
                numberStringLength,
                lastDigit,
                operatorText = nameSpace.TreeProcedures.OPERATOR_TEXT;
            if (isNaN(number) !== true) {
                numberString = number.toString();
                numberStringLength = numberString.length;
                if (numberString.indexOf('.') !== -1 || (numberString.charAt(numberStringLength - 2) === '1')) {
                    return operatorText.TH;
                }
                lastDigit = numberString.charAt(numberString.length - 1);
                switch (lastDigit) {
                    case '1':
                        return operatorText.ST;
                    case '2':
                        return operatorText.ND;
                    case '3':
                        return operatorText.RD;
                    default:
                        return operatorText.TH;
                }
            }
            else {
                return '';
            }
        },

        _toAccessible: function _toAccessible(rootNode) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                latexArray,
                latexExpression = {
                    'negativeCaseType': null,
                    'expression': '',
                },
                i,
                paramCount,
                operatorText = nameSpace.TreeProcedures.OPERATOR_TEXT;
            latexExpression.negativeCaseType = rootNode.negativeCaseType === undefined ? 0 : rootNode.negativeCaseType;
            if (rootNode.isTerminal === false) {
                latexArray = [];
                for (i = 0; i < rootNode.params.length; i++) {
                    latexArray.push(nameSpace.TreeProcedures._toAccessible(rootNode.params[i]));
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, latexArray, []);
                }
                //if (latexArray[0].negativeCaseType !== 0 && latexExpression.negativeCaseType === 0) {
                //    latexExpression.negativeCaseType = latexArray[0].negativeCaseType;
                //}
                latexExpression.expression = '';
                if (latexExpression.negativeCaseType === nameSpace.Parser._NEGATIVE_CASE_TYPES.NEGATIVE) {

                    latexExpression.expression = operatorText.NEGATIVE;
                }

                switch (rootNode.name) {

                    case 'do':
                        //latexExpression += '\\left(' + latexArray[0] + '\\right)';
                        if (rootNode.value == '{' || rootNode.value == '}') {
                            latexExpression.expression = '';
                        }
                        else if (rootNode.params[0].isTerminal === false && rootNode.params[0].name !== 'do') {
                            latexExpression.expression += operatorText.OPEN_BRACKET + latexArray[0].expression + operatorText.CLOSE_BRACKET;
                        }
                        else {
                            latexExpression.expression += latexArray[0].expression;
                        }
                        return latexExpression;
                    case '^':
                        if (rootNode.params[0].isTerminal === true) {
                            latexExpression.expression += latexArray[0].expression;
                        }
                        else {
                            if (nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.name) > nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.params[0].name)) {
                                latexExpression.expression += latexArray[0].expression;
                            }
                            else {
                                latexExpression.expression += latexArray[0].expression;
                            }
                            // TODO: dzdasd

                        }
                        if (rootNode.params[1].isTerminal === true) {
                            if (Number(rootNode.params[1].value) === 2) {
                                latexExpression.expression += operatorText.SQUARE;
                            }
                            else if (Number(rootNode.params[1].value) === 3) {
                                latexExpression.expression += operatorText.CUBE;
                            }
                            else {
                                latexExpression.expression += operatorText.POWER + latexArray[1].expression;
                            }
                        }
                        else {
                            if (nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.name) > nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.params[1].name)) {
                                latexExpression.expression += operatorText.POWER + latexArray[1].expression;
                            }
                            else {
                                latexExpression.expression += operatorText.POWER + latexArray[1].expression;
                            }

                        }

                        return latexExpression;
                    case '+':
                        latexExpression.expression += latexArray[0].expression;
                        for (paramCount = 1; paramCount < latexArray.length; paramCount++) {
                            switch (latexArray[paramCount].negativeCaseType) {
                                case nameSpace.Parser._NEGATIVE_CASE_TYPES.NONE:
                                case nameSpace.Parser._NEGATIVE_CASE_TYPES.NEGATIVE:
                                    latexExpression.expression += operatorText.ADD + latexArray[paramCount].expression;
                                    break;
                                case nameSpace.Parser._NEGATIVE_CASE_TYPES.SINGLE:
                                    //latexExpression.expression += latexArray[paramCount].expression;
                                    latexExpression.expression = latexExpression.expression + operatorText.SUBTRACT + latexArray[paramCount].expression.replace('-', '');
                                    break;
                                case nameSpace.Parser._NEGATIVE_CASE_TYPES.DOUBLE:
                                    latexExpression.expression += operatorText.SUBTRACT + operatorText.NEGATIVE + latexArray[paramCount].expression;
                                    break;
                                case nameSpace.Parser._NEGATIVE_CASE_TYPES.PLUS_SINGLE:
                                    latexExpression.expression += operatorText.ADD + latexArray[paramCount].expression.replace('-', '');
                                    break;
                            }
                            //if (latexArray[paramCount].indexOf('negative') === -1) {
                            //    latexExpression.expression += ' + ' + latexArray[paramCount].expression;
                            //}
                            //else {
                            //    latexExpression.expression += latexArray[paramCount].expression;
                            //}
                        }

                        return latexExpression;

                    case '\\cdot':
                        if (rootNode.params[0].isTerminal === false) {
                            if (nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.name) > nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.params[0].name)) {
                                latexExpression.expression += '(' + latexArray[0].expression + ')';
                            }
                            else {
                                latexExpression.expression += latexArray[0].expression;
                            }
                        }
                        else {
                            latexExpression.expression += latexArray[0].expression;
                        }
                        for (paramCount = 1; paramCount < latexArray.length; paramCount++) {
                            if (rootNode.params[paramCount].isTerminal === true) {
                                latexExpression.expression += operatorText.MULTIPLY + latexArray[paramCount].expression;
                            }
                            else {
                                if (nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.name) > nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(rootNode.params[paramCount].name)) {
                                    latexExpression.expression += operatorText.MULTIPLY + latexArray[paramCount].expression;
                                }
                                else {
                                    latexExpression.expression += operatorText.MULTIPLY + latexArray[paramCount].expression;
                                }
                            }
                        }
                        return latexExpression;
                    case '\\frac':
                        if (rootNode.params[0].isTerminal === false) {
                            latexExpression.expression += operatorText.OPEN_BRACKET + latexArray[0].expression + operatorText.CLOSE_BRACKET;
                        }
                        else {
                            latexExpression.expression += latexArray[0].expression;
                        }
                        latexExpression.expression += operatorText.DIVIDE;
                        if (rootNode.params[1].isTerminal === false) {
                            latexExpression.expression += operatorText.OPEN_BRACKET + latexArray[1].expression + operatorText.CLOSE_BRACKET;
                        }
                        else {
                            latexExpression.expression += latexArray[1].expression;
                        }
                        //latexExpression.expression += latexArray[0].expression + ' upon ' + latexArray[1].expression;
                        return latexExpression;

                    case '\\sqrt':
                        latexExpression.expression = '';
                        if (rootNode.params[0].isTerminal === true) {
                            if (Number(rootNode.params[0].value) === 2) {
                                latexExpression.expression += operatorText.SQUARE_ROOT;
                            }
                            else if (Number(rootNode.params[0].value) === 3) {
                                latexExpression.expression += operatorText.CUBE_ROOT;
                            }
                            else {
                                latexExpression.expression += latexArray[0].expression + nameSpace.TreeProcedures.getNumberPostFix(latexArray[0].expression) + operatorText.ROOT;
                            }
                        }
                        else {
                            latexExpression.expression += latexArray[0].expression + nameSpace.TreeProcedures.getNumberPostFix(latexArray[0].expression) + operatorText.ROOT;
                        }

                        if (rootNode.params[1].isTerminal === false) {
                            latexExpression.expression += operatorText.OPEN_BRACKET + latexArray[1].expression + operatorText.CLOSE_BRACKET;
                        }
                        else {
                            latexExpression.expression += latexArray[1].expression;
                        }

                        return latexExpression;

                    case '\\log_':
                        latexExpression.expression = '';

                        latexExpression.expression += 'Log of ';

                        latexExpression.expression += latexArray[1].expression;

                        latexExpression.expression += ' to the base ' + latexArray[0].expression;


                        return latexExpression;

                    case '\\log':
                        latexExpression.expression += 'Log of ' + latexArray[0].expression + ' to the base 10';
                        return latexExpression;

                    case '\\ln':
                        latexExpression.expression += operatorText.NATURAL_LOG + latexArray[0].expression;
                        return latexExpression;

                    case '\\sin':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression.expression += operatorText.SIN + latexArray[0].expression;
                        }
                        else {
                            latexExpression.expression += operatorText.SIN + operatorText.OPEN_BRACKET + latexArray[0].expression + operatorText.CLOSE_BRACKET;
                        }

                        return latexExpression;

                    case '\\csc':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression.expression += operatorText.CSC + latexArray[0].expression;
                        }
                        else {
                            latexExpression.expression += operatorText.CSC + operatorText.OPEN_BRACKET + latexArray[0].expression + operatorText.CLOSE_BRACKET;
                        }

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
                        }
                        else {
                            latexExpression.expression += rootNode.name.substring(1) + ' of ' + operatorText.OPEN_BRACKET + latexArray[0].expression + operatorText.CLOSE_BRACKET;
                        }

                        return latexExpression;

                    case '\\abs':
                        if (rootNode.params[0].isTerminal) {
                            latexExpression.expression += operatorText.ABS + latexArray[0].expression;
                        }
                        else {
                            latexExpression.expression += operatorText.ABS + operatorText.OPEN_BRACKET + latexArray[0].expression + operatorText.CLOSE_BRACKET;
                        }

                        return latexExpression;

                    case '\\arcsin':
                        latexExpression.expression += operatorText.SIN_INV + latexArray[0].expression;
                        return latexExpression;

                    case '\\arccsc':
                        latexExpression.expression += operatorText.CSC_INV + latexArray[0].expression;
                        return latexExpression;

                    case '\\arccos':
                    case '\\arctan':
                    case '\\arcsec':
                    case '\\arccot':
                        //if (rootNode.params[0].isTerminal) {
                        latexExpression.expression += operatorText.INV + rootNode.name.replace('\\arc', '') + ' of ' + latexArray[0].expression;
                        //}
                        //else {
                        //    latexExpression.expression += rootNode.name.substring(1) + ' of ' + latexArray[0].expression;
                        //}

                        return latexExpression;
                    case '!':
                        latexExpression.expression += latexArray[0].expression + operatorText.FACTORIAL;

                        return latexExpression;

                    case '\\lcm':
                    case '\\gcd':
                    case '\\mod':
                    case '\\min':
                    case '\\max':
                    case '\\nCr':
                    case '\\nPr':

                        latexExpression.expression += nameSpace.TreeProcedures._getAccessibleName(rootNode.name) + ' of ' + latexArray[0].expression + ' and ' + latexArray[1].expression;
                        return latexExpression;

                    case '\\prod':
                    case '\\sum':
                        //TODO: when treestructures r improved for this change
                        latexExpression.expression += rootNode.name.replace('\\', '') + ' from ' + latexArray[0].expression + ' equal to ';

                        if (rootNode.params[1].isTerminal === false) {
                            latexExpression.expression += operatorText.OPEN_BRACKET + latexArray[1].expression + operatorText.CLOSE_BRACKET;
                        }
                        else {
                            latexExpression.expression += latexArray[1].expression;
                        }
                        latexExpression.expression += ' to ';
                        if (rootNode.params[2].isTerminal === false) {
                            latexExpression.expression += operatorText.OPEN_BRACKET + latexArray[2].expression + operatorText.CLOSE_BRACKET;
                        }
                        else {
                            latexExpression.expression += latexArray[2].expression;
                        }
                        latexExpression.expression += ' of ';
                        latexExpression.expression += latexArray[3].expression;
                        return latexExpression;

                    case '\\%':
                        latexExpression.expression += latexArray[0].expression + operatorText.PERCENT;
                        return latexExpression;
                }
            }
            else {
                if (rootNode.sign === '+') {
                    if (rootNode.type === 'digit') {
                        if (rootNode.constantSubstituted !== undefined) {
                            latexExpression.expression = operatorText[rootNode.constantSubstituted];
                        }
                        else {
                            latexExpression.expression = nameSpace.TreeProcedures._getAccessibleStringForNumber(rootNode.value);
                        }
                    }
                    else {
                        latexExpression.expression = rootNode.value;
                    }
                    return latexExpression;
                }
                else {
                    if (rootNode.type === 'digit') {
                        if (rootNode.constantSubstituted !== undefined) {
                            if (rootNode.negativeCaseType !== nameSpace.Parser._NEGATIVE_CASE_TYPES.SINGLE && rootNode.negativeCaseType !== nameSpace.Parser._NEGATIVE_CASE_TYPES.NONE) {
                                latexExpression.expression = operatorText.NEGATIVE + operatorText[rootNode.constantSubstituted];
                            }
                            else {
                                latexExpression.expression = operatorText[rootNode.constantSubstituted];
                            }
                        }
                        else {
                            if (rootNode.negativeCaseType !== nameSpace.Parser._NEGATIVE_CASE_TYPES.SINGLE && rootNode.negativeCaseType !== nameSpace.Parser._NEGATIVE_CASE_TYPES.NONE) {
                                latexExpression.expression = operatorText.NEGATIVE + nameSpace.TreeProcedures._getAccessibleStringForNumber(rootNode.value);
                            }
                            else {
                                latexExpression.expression = nameSpace.TreeProcedures._getAccessibleStringForNumber(rootNode.value);
                            }
                        }
                    }
                    else {
                        latexExpression.expression = operatorText.NEGATIVE + rootNode.value;
                    }
                    //if (rootNode.value < 0) {
                    //    return rootNode.value * -1;
                    //}
                    //else {
                    return latexExpression;
                    //}

                }

            }

        },

        _DECIMAL_POINT: '.',

        _getAccessibleStringForNumber: function _getAccessibleStringForNumber(number) {
            var returnString = '',
                numberString,
                returnStringLength,
                stringLength,
                charCounter,
                decimalPointOccured = false,
                seperatorAddedCount = 0,
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                splittedString,
                returnStringArray = [];
            if (isNaN(number) === true) {
                return number;
            }
            numberString = number.toString();
            if (numberString.indexOf(nameSpace.TreeProcedures._DECIMAL_POINT) !== -1) {
                splittedString = numberString.split(nameSpace.TreeProcedures._DECIMAL_POINT);
                decimalPointOccured = true;
                numberString = splittedString[0];
            }
            stringLength = numberString.length;
            if (stringLength < 4) {
                return number;
            }
            for (charCounter = stringLength - 1; charCounter >= 0; charCounter--) {
                if (returnStringLength === 3 || (returnStringLength > 3 && (returnStringLength - (3 + seperatorAddedCount)) % 3 === 0)) {
                    returnString = ',' + returnString;
                    seperatorAddedCount++;
                }
                returnString = numberString.charAt(charCounter) + returnString;
                returnStringLength = returnString.length;
            }
            if (decimalPointOccured) {
                returnString += nameSpace.TreeProcedures._DECIMAL_POINT + splittedString[1];
            }
            return returnString;
        },

        _getAccessibleName: function _getAccessibleName(functionName) {
            var Map = {
                '\\lcm': 'least common multiplier',
                '\\gcd': 'greatest common divisor',
                '\\mod': 'modulas',
                '\\min': 'minimum',
                '\\max': 'maximum',
                '\\nCr': 'combinations',
                '\\nPr': 'permutations',
                '\\ceil': 'ceil value',
                '\\floor': 'floor value',
                '\\round': 'rounded value',
                '\\abs': 'absolute value',
                '\\exp': 'exponential value'
            };
            if (Map[functionName] === undefined) {
                return '';
            }

            return Map[functionName];
        },


        /**
        Clone the Tree node or terminal.           
            
        
        @method _clone
        @private
        @param nodeOrTerminal{Object}
        @return Void
        @static
        **/
        _clone: function _clone(nodeOrTerminal) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                clone,
                params,
                i;
            if (nodeOrTerminal.isTerminal === true) {
                clone = nameSpace.TreeProcedures._getParseTreeTerminalObject(undefined, nodeOrTerminal.type, nodeOrTerminal.sign, nodeOrTerminal.units);
                clone.isEmpty = nodeOrTerminal.isEmpty;
                clone.value = nodeOrTerminal.value;
            }
            else {
                clone = nameSpace.TreeProcedures._getParseTreeNodeObject(undefined, nodeOrTerminal.name, nodeOrTerminal.sign, undefined);
                params = [];
                for (i = 0; i < nodeOrTerminal.params.length; i++) {
                    clone._addParam(nameSpace.TreeProcedures._clone(nodeOrTerminal.params[i]));
                }
                clone.allTermsDigits = nodeOrTerminal.allTermsDigits;
                clone.isEmpty = nodeOrTerminal.isEmpty;
            }
            return clone;
        },

        /**
                   
        Converts the equation leftroot to a solvable form Ax^2 + Bx + C. This function assumes that equation data passed has the leftroot ready that is equation is parsed and converted in tree form. 
        
        @method convertToSolvableForm
        @private
        @param equationData{Object}
        @return Void
        @static
        **/
        convertToSolvableForm: function convertToSolvableForm(equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                rootNode,
                functionVariable,
                paramVariable,
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
                lastProperParam,
                solution;
            rootNode = equationData.getLeftRoot();

            functionVariable = equationData.getFunctionVariable();
            paramVariable = equationData.getParamVariable();
            rootNode.expand(functionVariable, equationData);



            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE6 - Complete]' + 'Expansion Complete', [nameSpace.Parser._YSTYLE]);
            if (!nameSpace.Parser._deploy) {
                nameSpace.Parser._printLatex(rootNode, 6, true);
            }
            if (!nameSpace.Parser._deploy) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[CHECKPOINT]' + ' after expansion... ' + nameSpace.TreeProcedures._toLatex(rootNode), [nameSpace.Parser._BLUE_STYLE]);
            }

            if (rootNode.isTerminal === false && rootNode.name === '+') {
                allParams = nameSpace.TreeProcedures._extractAllParams(rootNode);
            }
            else {
                //single segregation index            
                allParams = [];

                allParams.push(nameSpace.TreeProcedures._clone(rootNode));
                nameSpace.TreeProcedures._removeAllParams(rootNode);
                //not converting root node here...it will be converted later depending on number of params      
            }

            secondDegreeParams = [];
            firstDegreeParams = [];
            zeroDegreeParams = [];



            while (allParams.length > 0) {
                temp = nameSpace.TreeProcedures._getFunctionVariableSegregationIndex(allParams[0], functionVariable);

                if (temp === undefined) {

                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[FAIL - STAGE7]' + 'CANT CONVERT THIS EQUATION TO SOLVABLE FORM>>> SOMETHING IS WRONG', [nameSpace.Parser._NSTYLE]);
                    return;
                }
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.convert2q, 'Segregation index is ' + temp, []);

                switch (temp) {
                    case 2:
                        tempParam = allParams.shift();
                        nameSpace.TreeProcedures._commonOutFunctionVariable(tempParam, functionVariable);
                        secondDegreeParams.push(tempParam);
                        break;

                    case 1:
                        tempParam = allParams.shift();
                        nameSpace.TreeProcedures._commonOutFunctionVariable(tempParam, functionVariable);
                        firstDegreeParams.push(tempParam);
                        break;

                    case 0:
                        zeroDegreeParams.push(allParams.shift());
                        break;

                    default:

                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[FAIL - STAGE7]' + 'CANT CONVERT THIS EQUATION TO SOLVABLE FORM>>> SOMETHING IS WRONG', [nameSpace.Parser._NSTYLE]);
                        return;
                }
            }

            //for all params that are seperate
            //Ax^2 + Bx + C = 0 form

            //AX2
            if (secondDegreeParams.length > 0) {
                AX2 = nameSpace.TreeProcedures._getParseTreeNodeObject(undefined, '\\cdot', '+', undefined);

                //x^2
                powerTerm = nameSpace.TreeProcedures._getParseTreeNodeObject(AX2, '^', '+', undefined);

                fVarTerm = nameSpace.TreeProcedures._getParseTreeTerminalObject(powerTerm, 'var', '+');
                fVarTerm.value = functionVariable;

                powerDegreeTerm = nameSpace.TreeProcedures._getParseTreeTerminalObject(powerTerm, 'digit', '+');
                powerDegreeTerm.value = 2;

                if (secondDegreeParams.length > 1) {
                    A = nameSpace.TreeProcedures._getParseTreeNodeObject(AX2, '+', '+', undefined);

                    while (secondDegreeParams.length > 0) {
                        A._addParam(secondDegreeParams.shift());
                    }
                }
                else {
                    //length = 0                 
                    A = secondDegreeParams.shift();
                    AX2._addParam(A);
                }

                if (A.isTerminal === false) {
                    A.simplify(equationData);
                }
            }

            //BX
            if (firstDegreeParams.length > 0) {
                BX = nameSpace.TreeProcedures._getParseTreeNodeObject(undefined, '\\cdot', '+', undefined);


                fVarTerm = nameSpace.TreeProcedures._getParseTreeTerminalObject(BX, 'var', '+');
                fVarTerm.value = functionVariable;



                if (firstDegreeParams.length > 1) {
                    B = nameSpace.TreeProcedures._getParseTreeNodeObject(BX, '+', '+', undefined);

                    while (firstDegreeParams.length > 0) {
                        B._addParam(firstDegreeParams.shift());
                    }


                }
                else {
                    //length = 0                 
                    B = firstDegreeParams.shift();
                    BX._addParam(B);
                }

                if (B.isTerminal === false) {
                    B.simplify(equationData);
                }
            }

            if (zeroDegreeParams.length > 0) {

                if (zeroDegreeParams.length > 1) {
                    C = nameSpace.TreeProcedures._getParseTreeNodeObject(undefined, '+', '+', undefined);

                    while (zeroDegreeParams.length > 0) {
                        C._addParam(zeroDegreeParams.shift());
                    }

                }
                else {
                    //length = 0                 
                    C = zeroDegreeParams.shift();
                }

                if (C.isTerminal === false) {
                    C.simplify(equationData);
                }
            }
            quadraticParams = [AX2, BX, C];
            numberOfValidParams = 0;
            for (i = 0; i < quadraticParams.length; i++) {
                if (quadraticParams[i] !== undefined) {
                    numberOfValidParams++;
                    lastProperParam = quadraticParams[i];
                }
            }

            if (numberOfValidParams > 0) {
                nameSpace.TreeProcedures._convertTreeNodeTo(rootNode, '+');

                for (i = 0; i < quadraticParams.length; i++) {
                    if (quadraticParams[i] !== undefined) {
                        rootNode._addParam(quadraticParams[i]);
                    }
                }

            }
            else {
                nameSpace.TreeProcedures._convertTreeNodeTo(rootNode, lastProperParam);
            }
            equationData.setA(A);
            equationData.setB(B);
            equationData.setC(C);

            /*
            EXPERIMENTAL - Creating a mobile function 

            */


            equationData.setFunctionCode(nameSpace.TreeProcedures._getMobileFunction(equationData));
            equationData.setParamVariableOrder((equationData.getA() !== undefined) ? 2 : 1);
            //---------------------------------------------------------




            if (A !== undefined) {
                if (!nameSpace.Parser._deploy) {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'A:' + nameSpace.TreeProcedures._toLatex(A), []);
                }
            }
            else {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'A:undefined', []);
            }

            if (B !== undefined) {
                if (!nameSpace.Parser._deploy) {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'B:' + nameSpace.TreeProcedures._toLatex(B), []);
                }
            }
            else {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'B:undefined', []);
            }

            if (C !== undefined) {
                if (!nameSpace.Parser._deploy) {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'C:' + nameSpace.TreeProcedures._toLatex(C), []);
                }
            }
            else {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'C:undefined', []);
            }

            if (!nameSpace.Parser._deploy) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[STAGE7 - SUCCESS]' + 'Converted to quadratic form ' + nameSpace.TreeProcedures._toLatex(rootNode), [nameSpace.Parser._YSTYLE]);
            }

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, equationData, []);
            if (!nameSpace.Parser._deploy) {
                nameSpace.Parser._printLatex(rootNode, 7, false);
            }

            //in this case compute the solutions of the equation
            if (equationData.getSpecie() === 'linear' || equationData.getSpecie() === 'quadratic') {
                solution = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.TreeProcedures.solveEquation(equationData);
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.info, '%c INFO%c: finding solutions for eqution ' + solution, [nameSpace.Parser._BLUE_STYLE, undefined]);
            }


        },

        _getMobileFunction: function _getMobileFunction(equationData) {

            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                codeA,
                codeB,
                codeC,
                functionCode;

            if (equationData.getA() !== undefined) {
                //valueA = nameSpace.TreeProcedures._substituteParamVariableAndGetValue(equationData.A, equationData.constants, equationData.paramVariable, paramValue);
                codeA = nameSpace.TreeProcedures._toMobileFunction(equationData.getA(), equationData);

            }
            else {
                codeA = 0;
            }

            if (equationData.getB() !== undefined) {
                codeB = nameSpace.TreeProcedures._toMobileFunction(equationData.getB(), equationData);
            }
            else {
                codeB = 0;
            }
            if (equationData.getC() !== undefined) {
                codeC = nameSpace.TreeProcedures._toMobileFunction(equationData.getC(), equationData);
            }


            //var sumString = "function sum(pivot, start, end, expression, param, constants) {            var funcStartRange = new Function('param,constants', start);            var funcEndRange = new Function'param,constants', end);            var funcExpression = new Function('param,constants', expression);            var startValue = funcStartRange(param, constants);            var endValue = funcEndRangeparam, constants);            var result = 0;            for(i = startValue;i<endValue;i+= 1){                result +=funcExpression(param, constants);                if (!isFinite(result)) {                    return;                }            }            return result;        };";


            functionCode = 'var solution,a = (' + codeA + '),b=(' + codeB + '), c=(' + codeC + ');solution = []; a !== 0 ? (solution[0] = (-b + Math.sqrt(b*b - 4*a*c))/(2*a),solution[1] = (-b - Math.sqrt(b*b - 4*a*c))/(2*a)) :(solution[0] = -c/b,solution[1] = solution[0]); return solution;';

            if (functionCode.search('findFactorial') > -1) {
                functionCode = nameSpace.MathFunctions.findFactorialString + functionCode;

            }
            if (functionCode.search('gammaFunction') > -1) {
                functionCode = nameSpace.MathFunctions._gammaFunctionString + functionCode;

            }

            if (functionCode.search('sum') > -1) {
                functionCode = nameSpace.MathFunctions.getSumString() + functionCode;
            }

            if (functionCode.search('prod') > -1) {
                functionCode = nameSpace.MathFunctions.getProdString() + functionCode;
            }



            //console.log('function code is ' + functionCode);


            //var func = new Function('param,constants', functionCode);
            //return func;
            return functionCode;

        },


        _toMobileFunction: function _toMobileFunction(node, equationData, pivotConstant) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                myCode,
                childCode,
                pivot,
                functionName,
                inputAngleCode,
                outputAngleCode,
                i,
                factorial;
            if (node === undefined) {
                return;
            }
            myCode = "";
            if (node.isTerminal) {
                if (node.type === 'var') {
                    if (node.value === equationData.getParamVariable()) {
                        return node.sign === '-' ? '(param*-1)' : 'param';
                    }
                    else {
                        //console.log('invalid freevar found ' + node.value);
                    }
                }
                else if (node.type === 'const') {
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
                                myCode = node.value;//equationData.constants[node.value];
                            }
                            else {
                                myCode = 'constants[\'' + node.value + '\']';//equationData.constants[node.value];
                            }

                    }

                }
                else {
                    //todo give mathematical value
                    myCode = node.value;
                }
            }
            else {


                childCode = [];
                pivot = pivotConstant;

                if (node.name === '\\sum' || node.name === '\\prod') {
                    pivot = node.params[0].value;

                }
                for (i = 0; i < node.params.length; i++) {
                    childCode[i] = _toMobileFunction(node.params[i], equationData, pivot);
                }


                //TODO generate only if the node is an angle function

                if (equationData.getUnits().angle === 'rad') {
                    inputAngleCode = 'angle=' + childCode[0] + ',';
                    outputAngleCode = '';
                }
                else {
                    inputAngleCode = 'angle=' + childCode[0] + ',angle = angle*Math.PI /180,';
                    outputAngleCode = ',angle = angle*Math.PI /180';
                }

                factorial = "";

                switch (node.name) {
                    case "+":
                        functionName = "+";
                        myCode = childCode[0];

                        for (i = 1; i < childCode.length; i++) {
                            myCode += functionName + childCode[i];
                        }

                        break;


                    case "\\cdot":
                        functionName = "*";

                        myCode = childCode[0];

                        for (i = 1; i < childCode.length; i++) {
                            myCode += functionName + childCode[i];
                        }

                        break;



                    case "^":
                    case "pow":
                        //reverted to old logic by shashank because it was giving error for following graph
                        //$\left(-1\right)^nx^{\left(2n+1\right)}$
                        myCode = "raised=0,absBase=0,sign=0,num=" + childCode[0] + ",pow=" + childCode[1] + ",num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow)";
                        //myCode = "Math.pow(" + childCode[0] + "," + childCode[1] + ")";
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
                    case "\\sin":
                    case '\\cos':

                        myCode = inputAngleCode + nameSpace.TreeProcedures.getMathFunction(node.name) + '(angle)';

                        break;


                    case '\\tan':
                        myCode = inputAngleCode + "Math.sin(angle)/Math.cos(angle)";
                        break;
                    case '\\sec':
                        myCode = inputAngleCode + '1/Math.cos(angle)';
                        break;

                    case '\\csc':
                        myCode = inputAngleCode + '1/Math.sin(angle)';
                        break;
                    case '\\cot':
                        myCode = inputAngleCode + 'Math.cos(angle)/Math.sin(angle)';
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
                        myCode = 'angle = ' + childCode[0] + ',Math.asin(angle)' + outputAngleCode;
                        break;

                    case '\\arccos':
                        myCode = 'angle = ' + childCode[0] + ',Math.acos(angle)' + outputAngleCode;
                        break;

                    case '\\arctan':
                        myCode = 'angle = ' + childCode[0] + ',Math.atan(angle)' + outputAngleCode;
                        break;

                    case '\\arccsc':
                        myCode = 'angle = ' + childCode[0] + ',Math.asin(1/angle)' + outputAngleCode;
                        break;

                    case '\\arcsec':
                        myCode = 'angle = ' + childCode[0] + ',Math.acos(1/angle)' + outputAngleCode;
                        break;
                    case '\\arccot':
                        myCode = 'angle = ' + childCode[0] + ',Math.PI/2 - Math.atan(angle)' + outputAngleCode;
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
                        myCode = "num = " + childCode[0] + ",num>170||!isFinite(num)?Infinity:num === 0?1:num%1===0 && num > 0?(findFactorial(num)):num*gammaFunction(num)";
                        break;

                    case "\\gcd":
                    case "\\lcm":
                        //implement this
                        myCode = childCode[0];
                        break;

                    case '\\ceil':
                        myCode = 'Math.ceil(' + childCode[0] + ')';
                        break;
                    case '\\floor':
                        myCode = 'Math.floor(' + childCode[0] + ')';
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
                        myCode = 'num0=' + childCode[0] + ',num1=' + childCode[1] + ',num0<0||num1<0?0:(num0 = Math.floor(Math.abs(num0)),num1 = Math.floor(Math.abs(num1)),num0<num1?0:findFactorial(num0)/(findFactorial(num1) - findFactorial(num0 - num1)))';
                        break;

                    case '\\nPr':
                        myCode = 'num0=' + childCode[0] + ',num1=' + childCode[1] + ',num0<0||num1<0?0:(num0 = Math.floor(Math.abs(num0)),num1 = Math.floor(Math.abs(num1)),num0<num1?0:findFactorial(num0)/findFactorial(num0 - num1))';
                        break;

                    case '\\exp':
                        myCode = 'Math.exp(' + childCode[0] + ')';
                        break;

                    case '\\sum':
                        //$\sum _{n=\log 1}^{\log 100}x$

                        myCode = 'sum(\"' + node.params[0].value + '\",\"' + childCode[1] + '\",\"' + childCode[2] + '\",\"' + childCode[3] + '\",param,constants)';

                        break;

                    case '\\prod':
                        //$\sum _{n=\log 1}^{\log 100}x$

                        myCode = 'prod(\"' + node.params[0].value + '\",\"' + childCode[1] + '\",\"' + childCode[2] + '\",\"' + childCode[3] + '\",param,constants)';

                        break;

                    default:
                        myCode = 0;
                        //console.log('------------------------------Dont know how to make code for ' + node.name);
                        //return 'var paramValues; nameSpace.TreeProcedures._mathFunctions.performMathematicalCalculations(\"' + functionName + '\", paramValues, nameSpace.TreeProcedures._getUnits(term));'
                        //return '(' + childCode[0] + ')/(' + childCode[1] + ')';


                }

            }

            if (node.sign === "-") {
                myCode = '-(' + myCode + ')';
            }
            else {
                myCode = "(" + myCode + ")";
            }
            return myCode;
        },



        getMathFunction: function getMathFunction(func) {
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
        
        @deprecated
        @static
        **/
        solveEquation: function solveEquation(equationData, paramValue) {
            //return;
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            //if (equationData.isPolar === true) {
            //    return nameSpace.TreeProcedures._solvePolar();
            //}
            //else {
            return nameSpace.TreeProcedures._solveCartesian(equationData, paramValue);
            //}
        },

        _solvePolar: function _solvePolar() {

        },
        /**
                   
        Solves the equation from equationData that is in Ax^2 + Bx + C = 0 form
        
        @method solveEquation
        @private
        @param equationData {Object}
        @param paramValue {Number}
        
        @static
        **/
        _solveCartesian: function _solveCartesian(equationData, paramValue) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
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
                discriminant;

            if (nameSpace.Parser._debugFlag.solve) {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'For paramValue = ' + paramValue, []);
            }


            if (A !== undefined) {
                valueA = nameSpace.TreeProcedures._substituteParamVariableAndGetValue(A, equationConstants, equationParamVariable, paramValue);
            }

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.solve, 'A=' + valueA, []);

            if (B !== undefined) {
                valueB = nameSpace.TreeProcedures._substituteParamVariableAndGetValue(B, equationConstants, equationParamVariable, paramValue);
            }
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.solve, 'B=' + valueB, []);

            if (C !== undefined) {
                if (!nameSpace.Parser._deploy) {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.convert2q, 'C is ' + nameSpace.TreeProcedures._toLatex(C), []);
                }
                valueC = nameSpace.TreeProcedures._substituteParamVariableAndGetValue(C, equationConstants, equationParamVariable, paramValue);
            }
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.solve, 'C=' + valueC, []);

            if (valueA === undefined) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.convert2q, 'cant use quadratic formula since a = 0', []);
                if (valueB === undefined) {

                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[FAIL - STAGE7]' + 'Cant process this equation', [nameSpace.Parser._NSTYLE]);
                    return;
                }
                if (valueC === undefined) {
                    solution1 = solution2 = undefined;
                }
                else {
                    solution1 = solution2 = (-valueC) / valueB;
                }
            }
            else {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.convert2q, 'Using quadratic formula since a != 0', []);
                if (valueB === undefined) {
                    valueB = 0;
                }
                if (valueC === undefined) {
                    valueC = 0;
                }
                discriminant = valueB * valueB - 4 * valueA * valueC;
                if (discriminant < 0) {
                    solution1 = solution2 = 'undefined';
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.convert2q, 'Solution is complex', []);
                    //return;
                }
                else {
                    solution1 = (-valueB + Math.sqrt(discriminant)) / (2 * valueA);
                    if (discriminant === 0) {
                        solution2 = solution1;
                    }
                    else {
                        solution2 = (-valueB - Math.sqrt(discriminant)) / (2 * valueA);
                    }
                }

            }
            solution1 = (Number)(solution1);
            solution2 = (Number)(solution2);
            return [solution1, solution2];
        },

        /**
        Function that substitutes value of param variable and so that we can find values of A,B,C and find the roots of equation.
            
        
        @method _substituteParamVariableAndGetValue
        @private
        @param term {Object} Node root of A or  B or C term from the equation Ax^2 + Bx + C = 0
        @param fVar {String} name of the param variable
        @param fValue {Number} value of param variable
        @return {Integer} value of the term with param variable substituted
        @static
        **/
        _substituteParamVariableAndGetValue: function _substituteParamVariableAndGetValue(term, constants, fVar, fValue) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                paramValues,
                value,
                signFactor,
                i,
                result,
                currentFunctionConstant,
                sumRangeStart,
                sumRangeEnd,
                sumConstantCounter;

            //if (fVar === undefined) {
            //    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.convert2q, 'Undefined param passed to function param ' + fVar, []);
            //    return;
            //}
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.convert2q, 'Substituting param ' + fVar + ' with value ' + fValue, []);
            if (term.isTerminal === true) {
                if (term.type === 'digit') {
                    if (term.sign === '-') {
                        return -1 * (Number)(term.value);
                    }
                    else {
                        return (Number)(term.value);
                    }
                }
                else if (term.type === 'var') {
                    if (term.value === fVar) {
                        if (term.sign === '-') {
                            return -1 * (Number)(fValue);
                        }
                        else {
                            return (Number)(fValue);
                        }
                    }
                    else {
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[FAIL-STAGE8]' + 'Unknown freevar occured ' + term.value, [nameSpace.Parser._NSTYLE]);
                        return;
                    }
                }
                else {
                    if (nameSpace.Parser._constants[term.value] !== undefined) {
                        if (term.sign === '-') {
                            return -1 * nameSpace.Parser._constants[term.value];
                        }
                        else {
                            return nameSpace.Parser._constants[term.value];
                        }
                    }
                    if (constants[term.value] !== undefined) {
                        if (term.sign === '-') {
                            return -1 * constants[term.value];
                        }
                        else {
                            return constants[term.value];
                        }
                    }
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[FAIL-STAGE8]' + 'unsubstituted constant occured ' + term.value, [nameSpace.Parser._NSTYLE]);
                    return;
                }
            }
            paramValues = [];
            signFactor = term.sign === '-' ? -1 : 1;
            switch (term.name) {
                case '\\sum':
                case '\\prod':
                    currentFunctionConstant = constants[term.params[0].value];
                    sumRangeStart = nameSpace.TreeProcedures._substituteParamVariableAndGetValue(term.params[1], constants, fVar, fValue);
                    sumRangeEnd = nameSpace.TreeProcedures._substituteParamVariableAndGetValue(term.params[2], constants, fVar, fValue);

                    if (isNaN(sumRangeStart) || isNaN(sumRangeEnd) || sumRangeStart === undefined || sumRangeEnd === undefined || !isFinite(sumRangeEnd) || !isFinite(sumRangeStart)) {
                        return undefined;
                    }
                    for (sumConstantCounter = sumRangeStart; sumConstantCounter <= sumRangeEnd; sumConstantCounter++) {
                        constants[term.params[0].value] = sumConstantCounter;
                        value = nameSpace.TreeProcedures._substituteParamVariableAndGetValue(term.params[3], constants, fVar, fValue);
                        if (value === undefined) {

                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[FAIL-STAGE8]' + 'Cant Calculate value of ' + term.name, [nameSpace.Parser._NSTYLE]);
                            return;
                        }
                        paramValues.push(value);
                    }
                    if (term.name === '\\sum') {
                        result = nameSpace.TreeProcedures._mathFunctions.performMathematicalCalculations('+', paramValues, nameSpace.TreeProcedures._getUnits(term));
                    }
                    else {
                        result = nameSpace.TreeProcedures._mathFunctions.performMathematicalCalculations('\\cdot', paramValues, nameSpace.TreeProcedures._getUnits(term));
                    }
                    break;

                default:
                    for (i = 0; i < term.params.length; i++) {
                        value = nameSpace.TreeProcedures._substituteParamVariableAndGetValue(term.params[i], constants, fVar, fValue);
                        if (value === undefined) {

                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[FAIL-STAGE8]' + 'Cant Calculate value of ' + term.name, [nameSpace.Parser._NSTYLE]);
                            return;
                        }
                        paramValues.push(value);
                    }
                    result = nameSpace.TreeProcedures._mathFunctions.performMathematicalCalculations(term.name, paramValues, nameSpace.TreeProcedures._getUnits(term));
                    break;
            }
            if (result === null) {
                return undefined;
            }
            return signFactor * result;
        },


        /**
                   
        Removes occurances of functionVariable from the term. Eg. when functionVariable is 'x' it will convert (ax +bx) to (a + b); x to 1; y to y;
        
        @method _commonOutFunctionVariable
        @private
        @param term {Object} Node root from which functionVariable will be removed. 
        @return Void
        @static
        **/
        _commonOutFunctionVariable: function _commonOutFunctionVariable(term, functionVariable) {

            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                i,
                reply, gotFunctionVariable = false;
            if (term.isTerminal) {
                if (term.value === functionVariable) {
                    term.value = 1;
                    term.type = 'digit';
                    return 1;
                }
                return;
            }
            switch (term.name) {
                case '+':
                    for (i = 0; i < term.params.length; i++) {
                        reply = nameSpace.TreeProcedures._commonOutFunctionVariable(term.params[i], functionVariable);
                    }
                    break;

                case '\\cdot':
                    for (i = 0; i < term.params.length; i++) {
                        reply = nameSpace.TreeProcedures._commonOutFunctionVariable(term.params[i], functionVariable);
                        // Done below commenting and changes for (x+1)(x+1)=0 ..in this case we were not able to common out x.x
                        if (reply === 1) {
                            //    return 1;
                            gotFunctionVariable = true;
                        }
                    }
                    if (gotFunctionVariable === true) {
                        return 1;
                    }
                    break;

                case '\\frac':
                    return nameSpace.TreeProcedures._commonOutFunctionVariable(term.params[0], functionVariable);

                case '^':
                    return nameSpace.TreeProcedures._commonOutFunctionVariable(term.params[0], functionVariable);
            }
        },

        /**
        Will add two equation tree term1 into term2. 
         
        If term1 is + then term2 children are added in term1.
        If term2 is + then term1 children are added in term2.
        If neigher are +, then a new addition Node is created and then term1 and term2 are added as children to it
            
        
        @method _add
        @private
        @param term1{Object} First term to add
        @param term2{Object} Second term to add
        @return {Object} root of the result term 
        @static
        **/
        _add: function _add(term1, term2) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
            additionTerm,
            paramsToAdd,
            i;

            if (term1.isTerminal === false && term1.name === '+') {
                additionTerm = term1;

                if (term2.isTerminal === false && term2.name === '+') {
                    paramsToAdd = nameSpace.TreeProcedures._extractAllParams(term2);
                    term2.incinerate();
                }
                else {
                    paramsToAdd = [term2];
                }

            }
            else if (term2.isTerminal === false && term2.name === '+') {
                additionTerm = term2;

                if (term1.isTerminal === false && term1.name === '+') {
                    paramsToAdd = nameSpace.TreeProcedures._extractAllParams(term1);
                    term1.incinerate();
                }
                else {
                    paramsToAdd = [term1];
                }

            }
            else {
                additionTerm = nameSpace.TreeProcedures._getParseTreeNodeObject(undefined, '+', '+', undefined);
                paramsToAdd = [term1, term2];
            }

            for (i = 0; i < paramsToAdd.length; i++) {
                additionTerm._addParam(paramsToAdd[i]);
            }
            return additionTerm;
        },


        /**
        Multiply term1 to term2. If either of term1 and term2 are \\cdot nodes then children are accomodated in them or a new \\cdot node is created.    
        
        @method multiply
        @private
        @param term1{Object} First term to add
        @param term2{Object} Second term to add
        @return {Object} root of the result term
        @static
        **/
        multiply: function multiply(term1, term2) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                cdotParent,
                i;
            if (term1.isTerminal === false && term1.name === '\\cdot') {
                cdotParent = term1;

                if (term2.isTerminal === true) {
                    cdotParent._addParam(term2);
                }
                else {
                    for (i = 0; i < term2.params.length; i++) {
                        cdotParent._addParam(term2.params[i]);
                    }
                    term2.incinerate();
                }


            }
            else if (term2.isTerminal === false && term2.name === '\\cdot') {
                cdotParent = term2;

                if (term1.isTerminal === true) {
                    cdotParent._addParam(term1);
                }
                else {
                    for (i = 0; i < term1.params.length; i++) {
                        cdotParent._addParam(term1.params[i]);
                    }
                    term1.incinerate();
                }


            }
            else {
                cdotParent = nameSpace.TreeProcedures._getParseTreeNodeObject(undefined, '\\cdot', '+', undefined);
                cdotParent._addParam(term1);
                cdotParent._addParam(term2);

            }


            return cdotParent;
        },

        /**
        Update the count of free vars after shifting of right terms to left
        
        @method updateFreeVars
        @private 
        @param equationData{Object} the equation object that is parsed which containis the free vars
        @return Void
        @static
        **/
        // For jshint
        //updateFreeVars: function updateFreeVars(equationData) {
        updateFreeVars: function updateFreeVars() {
            //DOES this function even do anything -_-

            return;
            //var variable = null;
            //for (variable in equationData.rightExpression.freevars) {
            //    if (equationData.leftExpression.freevars[variable] === undefined) {
            //        equationData.leftExpression.freevars[variable] = equationData.leftExpression.freevars[variable];
            //    }
            //}
        },

        /**
                   
        Converts equation from Ax = By to Ax + By = 0; form.     
        
        @method combineLeftRightTree
        @private
        @param equationData{Object} 
        @return
        @static
        **/
        combineLeftRightTree: function combineLeftRightTree(equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                freevar,
                left,
                right,
                rightExpression = equationData.getRightExpression(),
                leftExpression = equationData.getLeftExpression(),
                rightRoot = equationData.getRightRoot(),
                leftRoot = equationData.getLeftRoot(),
                newFlag;
            if (rightRoot !== undefined && rightRoot !== null) {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Right tree is ' + equationData.rightRoot, []);
                nameSpace.TreeProcedures.negateTree(rightRoot);
                // This condition is if right equation is just zero then we dont shift it
                if (rightRoot.isTerminal === true && nameSpace.TreeProcedures._getValueFromParam(rightRoot) === 0) {
                    if (leftRoot.isTerminal === false) {
                        return;
                    }
                }
                equationData.setLeftRoot(nameSpace.TreeProcedures._add(leftRoot, rightRoot));

                equationData.setRightRoot(nameSpace.TreeProcedures._getParseTreeTerminalObject(undefined, 'digit', '+', equationData.getUnits()));
                equationData.getRightRoot().value = '0';


            }


            for (freevar in rightExpression.freevars) {
                left = leftExpression.freevars[freevar];
                right = rightExpression.freevars[freevar];

                newFlag = left ? left === 'c' ? left : right === 'c' ? right : left > right ? left : right : right;
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
        negateTree: function negateTree(node) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
            propogateSign = node.isTerminal === false && node.name === '+',
            i;

            if (propogateSign === true) {
                //only when sign is +
                for (i = 0; i < node.params.length; i++) {
                    nameSpace.TreeProcedures.negateTree(node.params[i]);
                }
            }
            else {
                if (node.sign === '+') {
                    node.sign = '-';
                }
                else {
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
        generateTree: function generateTree(validPredictionStack, pointer, units) {
            if (validPredictionStack === undefined) {
                return;
            }

            function getNextPromotionNode(node) {
                if (node.parentNode === undefined) {
                    return;
                }
                var myIndex = node.parentNode.params.indexOf(node),
                    sibling = node.parentNode.params[myIndex + 1];
                //console.log('my index is ' + myIndex);

                if (sibling === undefined) {
                    //console.log('___sibling not found...going to parent');
                    return node.parentNode;
                }
                //console.log('___promoting to sibling ' + sibling);
                return sibling;
            }

            //0,(\frac func),({ delim),13,(y var),(^ opr),29,({ delim),24,(2 digit),(} delim),(} delim),({ delim),18,(b const),(^ opr),24,(2 digit),(} delim),(+ opr),4,(\frac func),({ delim),8,(( delim),10,(x var),(+ opr),19,(a const),() delim),(^ opr),24,(2 digit),(} delim),({ delim),18,(a const),(^ opr),24,(2 digit),(} delim)
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                rootNode,

                currentNode,
                currentObject,
                bracketsStack = [],
                liberationCode;

            while (pointer < validPredictionStack.length) {
                currentObject = validPredictionStack[pointer];
                //TRACE
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, '...Processing object ' + currentObject, []);
                //TRACE
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, '...Current Parent is ' + currentNode, []);

                if (typeof (currentObject) === 'number') {
                    //its a rule
                    liberationCode = nameSpace.ParsingProcedures.getStackCode(bracketsStack);
                    currentNode = nameSpace.TreeProcedures._getNodeForRule(currentNode, currentObject, liberationCode, units);
                    if (rootNode === undefined) {
                        rootNode = currentNode;
                        while (rootNode.parentNode !== undefined) {
                            rootNode = rootNode.parentNode;
                        }
                    }
                    //TRACE
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, 'rule returned ' + currentNode, []);
                }
                else if (currentObject.type === 'func') {
                    //TRACE
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, 'ignoring func token ' + currentObject, []);
                    if (currentObject.value === currentNode.name) {
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, '%cCHECK' + '...function name matches with currentNode ' + currentObject + '<>' + currentNode, [nameSpace.Parser._YSTYLE]);
                        currentNode.sign = currentObject.sign;
                        currentNode.negativeCaseType = currentObject.negativeCaseType;
                    }
                    else {
                        //This case was to check that node returned from rule is same as the node in the function. But this error is caught in production rule generation
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, '%cFAIL' + '...function name does not match with currentNode ' + currentObject + '<>' + currentNode, [nameSpace.Parser._NSTYLE]);
                    }
                }
                else if (currentObject.type === 'delim') {
                    //TRACE
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, 'skipping delimiter ' + currentObject, []);

                    if (currentObject.value === ',' && !nameSpace.Parser._isCommaFunction(currentNode.name)) {
                        //console.log('Comma encountered ....going up till last comma function from '+currentNode.name); 
                        while (!nameSpace.Parser._isCommaFunction(currentNode.name)) {
                            currentNode = getNextPromotionNode(currentNode);
                            //console.log('Now node is ' + currentNode);
                        }
                        //console.log('Comma upgrades complete... current node is ' + currentNode.name);
                    }
                    nameSpace.ParsingProcedures.recordBracket(bracketsStack, currentObject.value);


                    //so that bracket signs are incorporated in the tree
                    if (currentNode.name === 'do') {
                        currentNode.sign = currentObject.sign;
                        currentNode.negativeCaseType = currentObject.negativeCaseType;
                    }

                    //TODO verify if promoting to parent on the basis of liberation code is only required when delimiter is encountered

                    while (currentNode.liberationCode > nameSpace.ParsingProcedures.getStackCode(bracketsStack)) {
                        //console.log('Liberation code ' + currentNode.liberationCode + ' stackcode ' + nameSpace.ParsingProcedures.getStackCode(bracketsStack));
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Current node type ' + currentNode.type, []);
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, 'shifting up parent because ' + currentNode + ' is Delimiter found... parent shift from ' + currentNode + ' to ' + currentNode.parentNode, []);
                        currentNode = getNextPromotionNode(currentNode);//currentNode.parentNode;
                        if (currentNode === undefined) {
                            // This is the case where `do` is the parent node. But this case will never occur now as we skip `do` before as an optimization.
                            break;
                        }
                    }



                    //console.log('after delim promoted to ' + currentNode);
                }
                else if (currentObject.type === 'opr') {
                    //TRACE
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, 'skipping operator ' + currentObject, []);
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, 'Operator found...shifting parent from ' + currentNode + ' to ' + currentNode.parentNode + currentObject, []);
                    //TODO Merge 2 same if as one
                    //means make parent current pointer and the bidding will be done for him
                    if (currentObject.value !== currentNode.name) {
                        //console.log('Operator and current object mismatch ' + currentObject.value + " <?> " + currentNode.name);
                        //This case was to check that node returned from rule is same as the node in the function. But this error is caught in production rule generation
                        do {
                            //TRACE
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, currentObject.value + '<> ' + currentNode.name, []);
                            //TRACE
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, '!!!!!!!!!!!!!!!!!!! current operator does not match the current node !!!!!!!!!!!!! SHOULD SHIFT parent up to!!' + currentNode.parentNode, []);
                            currentNode = getNextPromotionNode(currentNode);//currentNode.parentNode;
                        }
                        while (currentNode !== undefined && currentObject.value !== currentNode.name);

                    }
                    else {
                        //TRACE
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, 'Operator ' + currentNode.value + ' confirms with the parent >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', []);
                    }

                    if (currentNode !== undefined && currentObject.value === currentNode.name) {
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, '%cCHECK' + '...OPERATOR name matches with currentNode ' + currentObject + '<>' + currentNode, [nameSpace.Parser._YSTYLE]);
                        currentNode.sign = currentObject.sign;
                        currentNode.negativeCaseType = currentObject.negativeCaseType;
                    }
                    else {
                        //This case was to check that node returned from rule is same as the node in the function. But this error is caught in production rule generation
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%cFAIL' + '...OPERATOR name does not match with currentNode ' + currentObject + '<>' + currentNode, [nameSpace.Parser._NSTYLE]);
                    }
                }
                else if (currentObject.type === 'digit' || currentObject.type === 'const' || currentObject.type === 'var') {
                    if (currentNode.isTerminal === false) {
                        // This case will only occur if the production rules are wrong.
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, '!!!!!!!!!!!!!!!! ERROR terminal expected found NODE------------', []);
                        return;
                    }
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, '+++ found terminal ' + currentObject + ' will be filled into shell ' + currentNode, []);
                    currentNode.sign = currentObject.sign;
                    currentNode.negativeCaseType = currentObject.negativeCaseType;
                    currentNode.value = currentObject.value;
                    currentNode.type = currentObject.type;
                    currentNode.isEmpty = false;
                    if (currentObject.constantSubstituted !== undefined) {
                        currentNode.constantSubstituted = currentObject.constantSubstituted;
                    }

                }
                else {
                    //TRACE
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, '!!!!!!!!!!!!!!!!!!!!!!!!!!! DONT KNOW WHAT TO DO WITH ' + currentObject, []);
                }

                if (currentNode !== undefined) {
                    //TODO thoroughly check this stack condition wheather liberating infinite series on basis of stack code is correct??
                    //TRACE
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, 'Checking stackcode ' + currentNode + ' ' + currentNode.liberationCode + ' <> ' + nameSpace.ParsingProcedures.getStackCode(bracketsStack), []);


                    //not promoting operators to make sure they get the sign properly
                    while (currentNode.isEmpty === false && nameSpace.TreeProcedures.isOperator(currentNode.name) === false) {
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, 'Current node type ' + currentNode.type, []);
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.tree, 'shifting up parent because ' + currentNode + ' is NOT EMPTY parent shift from ' + currentNode + ' to ' + getNextPromotionNode(currentNode), []);
                        currentNode = getNextPromotionNode(currentNode); //currentNode.parentNode;
                        if (currentNode === undefined) {
                            break;
                        }
                    }


                    //todo when to break from infinite series?
                }

                pointer++;

                if (currentNode === undefined) {
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
        isOperator: function isOperator(opr) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            return nameSpace.TreeProcedures._productions._operatorsInPrecedenceOrder.indexOf(opr) !== -1;

        },

        /**
        
        Generates a dummy tree structure for the given rule no. 
            
        
        @method _getNodeForRule
        @private
        @param parent{Object} tree structure will be created with this parent
        @param ruleNo {Integer} rule number 
        @liberationCode {Integer} create the node with liberation code.Liberation code is the level of brackets we are currently in eg in a+(b+(c+d)) b will have liberation code 1 c will have 2.
        @return
        @static
        **/
        _getNodeForRule: function _getNodeForRule(parent, ruleNo, liberationCode, units) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
            rule = nameSpace.TreeProcedures._productions.treeGenerationRules[ruleNo],
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

                        currentParent = nameSpace.TreeProcedures._getParseTreeNodeObject(currentParent, directives[1], '+', liberationCode);
                    }
                    else {
                        if (returnNode === undefined) {
                            returnNode = nameSpace.TreeProcedures._getParseTreeTerminalObject(currentParent, directives[1], '+', units);
                        }
                        else {
                            nameSpace.TreeProcedures._getParseTreeTerminalObject(currentParent, directives[1], '+', units);
                        }
                    }

                    if (root === undefined) {
                        root = currentParent;
                    }
                }
                currentParent = returnNode;
            }
            else {
                for (i = 0; i < allTerms.length; i++) {
                    directives = allTerms[i].split('.');

                    if (directives[0] === 'node') {

                        currentParent = nameSpace.TreeProcedures._getParseTreeNodeObject(currentParent, directives[1], '+', liberationCode);
                    }
                    else {
                        currentParent = nameSpace.TreeProcedures._getParseTreeTerminalObject(currentParent, directives[1], '+', units);
                    }

                    if (root === undefined) {
                        root = currentParent;
                    }
                }
            }
            //TRACE
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '------ Rule ' + ruleNo + ' Processing complete---------------', []);
            //we make assumption that all rules will create a tree which has leftmost node empty
            //TRACE
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'returning ' + currentParent, []);
            return currentParent;

        },


        /**
        Generates an empty terminal node with given parameters.
        
        @method _getParseTreeTerminalObject
        @private
        @param parent{Object} 
        @param objectType{String} var/const/digit 
        @param sign {String} '+' or '-'
        @param units{Object} used later for processing the trignometric functions
        @return
        @static
        **/
        _getParseTreeTerminalObject: function _getParseTreeTerminalObject(parent, objectType, sign, units) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                nodeObject;
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Generating Node with parent ' + parent + ' and type ' + objectType, []);

            if (sign === undefined) {
                sign = '+';
            }
            //type will be const,digit,var
            nodeObject = {
                toString: function toString() {
                    return '[' + this.sign + this.value + ' ' + this.type + ']';
                },
                isTerminal: true,
                type: objectType,
                sign: sign,
                value: undefined,
                units: units,
                isEmpty: true,
                incinerate: function incinerate() {
                    this.value = 'incinerated (X)';
                    delete this.isTerminal;
                    delete this.type;
                    delete this.isEmpty;
                    delete this.units;
                    delete this.parentNode;
                    //TODO uncomment
                    //delete this.toString;
                },
                parentNode: parent
            };
            //TODO set isEmpty for terminal nodes

            if (parent !== undefined && parent.isEmpty === true) {
                parent._addParam(nodeObject);
            }
            return nodeObject;



        },


        /**
        Finds the power of function variable in the given term. eg. in term abx^2 power of x will be 2; in ax power of x will be 1.    
        
        @method getFunctionVariablePowerInTerm
        @private
        @param term{Object} 
        @deprecated use _getFunctionVariableSegregationIndex instead.
        @return
        @static
        **/
        getFunctionVariablePowerInTerm: function getFunctionVariablePowerInTerm(term) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            if (term.isTerminal) {
                return 0;
            }

            switch (term.name) {
                case '+':
                case '-':

                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[FAIL ]' + 'This term should have occured when looking  for power of function variable', [nameSpace.Parser._NSTYLE]);
                    break;

                case '\\cdot':
                    //Skipping the case x.x ...this should have been simplified. because this assumed simplification we just have to check maximum power encountered
                    break;
            }
        },

        /**
        Finds the power of function variable in the given term. eg. in the equation 4x^2+3x=5y, term = 4x^2-->returns 2; term = 3x-->returns 1; term = 4y-->returns 0
        for functionVar = x. term is-->each of the "+" separated terms in the equation.   
         
        @method getFunctionVariablePowerInTerm
        @private
        @param term{Object} 
        @param functionVar{String} name of the functionVariable to find.
        @return
        @static
        **/
        _getFunctionVariableSegregationIndex: function _getFunctionVariableSegregationIndex(term, functionVar) {
            var i,
            fVarPower = 0,
            temp,
            nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            if (functionVar === undefined) {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Cant segregate with unknown fVar', []);
                return;
            }

            if (term.isTerminal === true) {
                return (functionVar === term.value ? 1 : 0);
            }
            switch (term.name) {
                case '+':

                    for (i = 0; i < term.params.length; i++) {
                        temp = nameSpace.TreeProcedures._getFunctionVariableSegregationIndex(term.params[i], functionVar);
                        //it should be same for everyone 
                        if (i === 0) {
                            fVarPower = temp;
                        }
                        else {
                            //u cant common out function variable
                            if (temp !== fVarPower) {
                                return;
                            }
                        }

                    }

                    return fVarPower;

                case '\\cdot':

                    for (i = 0; i < term.params.length; i++) {
                        temp = nameSpace.TreeProcedures._getFunctionVariableSegregationIndex(term.params[i], functionVar);
                        if (temp === undefined) {
                            return;
                        }
                        if (temp > 0) {
                            fVarPower += temp;
                            //Commented and change made for solving case (x+1)(x-1)=0
                            //if (fVarPower === 0) {
                            //    fVarPower = temp;
                            //}
                            //else {
                            //    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.convert2q, '##########ERROR.... CDOT HAS TWO FUNCTION VARIABLES THAT WILL CHANGE POWER###########', []);
                            //    return;
                            //}
                        }

                    }
                    return fVarPower;

                case '\\frac':
                    temp = nameSpace.TreeProcedures._getFunctionVariableSegregationIndex(term.params[0], functionVar);
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.convert2q, 'fraction with numerator fvar power ' + temp, []);
                    return temp;

                case '^':
                    if (term.params[1].isTerminal === false || term.params[1].type !== 'digit') {
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.convert2q, 'No point in checking when power is complicated for ' + term + ' power is ' + term.params[1], []);
                        return 0;
                    }

                    temp = nameSpace.TreeProcedures._getFunctionVariableSegregationIndex(term.params[0], functionVar);
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.convert2q, 'power: fVar ' + temp + ' my power ' + term.params[1], []);
                    if (temp === undefined) {
                        return;
                    }
                    else {
                        if (temp > 0) {
                            return temp * nameSpace.TreeProcedures._getValueFromParam(term.params[1]);
                        }
                        else {
                            return 0;
                        }
                    }
                    break;

                default:
                    //this means any other function apart from above ones... in such cases we assume that Function variable is not part of this function as such cases are elimited in the round where we calculate powers.
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
        _findSameOperatorAndMerge: function _findSameOperatorAndMerge(node) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                extractedParams,
                arrNewParamsTobeAdded,
                i,
                param;
            if (node.name === '+' || node.name === '\\cdot' || node.name === '-') {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Merging operator ' + node, []);
                arrNewParamsTobeAdded = [];
                //merge children with same operator
                i = 0;
                param = null;
                for (i = 0; i < node.params.length; i++) {
                    param = node.params[i];

                    if (param.name === node.name) {
                        extractedParams = nameSpace.TreeProcedures._extractAllParams(param);
                        node._removeParam(param);
                        i--;
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
            }
            else {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Cant merge function ' + node, []);
                return;
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
        _getParseTreeNodeObject: function _getParseTreeNodeObject(parent, functionName, sign, liberationCode) {

            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine, functionObject;
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Generating function ' + functionName + ' with parent ' + parent, []);

            if (sign === undefined) {
                sign = '+';
            }
            functionObject = {
                toString: function toString() {
                    //return this.name+'(){ATD: '+this.allTermsDigits+' params:'+this.params+'}';
                    if (this.sign === '+') {
                        return this.name + '()';
                    }
                    else {
                        return this.sign + this.name + '()';
                    }
                    //return this.name +'[' + this.params+']';
                    //return this.name + '() '; //-> '+this.parentNode ;

                },
                params: [],
                isTerminal: false,
                name: functionName,
                isEmpty: true,
                sign: sign,
                allTermsDigits: undefined,
                liberationCode: liberationCode,
                maxParams: nameSpace.TreeProcedures._productions.getMaximumParameters(functionName),

                _addParam: function _addParam(param) {
                    if (this.params.length >= this.maxParams) {

                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '!!!!!!!! ERROR I CANT ACCEPT THIS CHILD', []);
                        return;
                    }

                    param.parentNode = this;
                    this.params.push(param);
                    //TRACE
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Adding param ' + param.name + ' to ' + this.name + ' at index ' + (this.params.length - 1), []);
                    if (this.params.length === this.maxParams) {
                        //
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '---Function ' + this.name + ' is full---', []);
                        this.isEmpty = false;
                    }
                },



                _removeParam: function _removeParam(param, shouldBeIncinerated) {
                    var index,
                        objects,
                        removed;

                    if (typeof (param) === 'number') {
                        index = param;
                    }
                    else {
                        index = this.params.indexOf(param);
                    }

                    //console.log('Removing from index '+param+' out of array '+this.params);

                    if (index === -1 || index >= this.params.length) {

                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Cant remove object at index ' + index, []);
                        return;
                    }
                    objects = this.params.splice(index, 1);
                    removed = objects[0];

                    if (shouldBeIncinerated === undefined) {
                        shouldBeIncinerated = true;
                    }

                    if (shouldBeIncinerated === true) {
                        removed.incinerate();
                    }
                    else {
                        return removed;
                    }

                },



                convertToTerminal: function convertToTerminal(terminalNode) {


                    this.isTerminal = true;


                    this.value = terminalNode.value;
                    this.isEmpty = terminalNode.isEmpty;
                    this.type = terminalNode.type;
                    this.units = terminalNode.units;
                    this.sign = terminalNode.sign;
                    this.toString = function toString() {
                        return '[' + this.sign + this.value + ' ' + this.type + ']';
                    };


                    //this.parentNode unaffected
                    if (terminalNode.parentNode !== undefined) {
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

                incinerate: function incinerate() {
                    this.name = 'incinerated (+)';
                    delete this.params;
                    delete this.isTerminal;
                    //TODO uncomment
                    //delete this.name;
                    delete this.isEmpty;
                    delete this.liberationCode;
                    delete this.parentNode;
                    delete this.maxParams;
                },

                toEquation: function toEquation() {
                    //getEquationString(this.name, this.params);
                },

                expand: function expand(functionVariable, equationData) {
                    /*
                    * expand function is used to facilitate solving of equations
                    * 
                    * it expands a few basic functions on following terms
                    * frac on the basis addition of variables in the numerator (a+b)/c => a/c + b/c
                    * 
                    * ^ func on the basis of left child is do with first child +, eg. (x+a)^2  
                    * 
                    */
                    var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                        numerator,
                        termsCount,
                        denominator,
                        newNumerator,
                        newDenominator,
                        firstParam,
                        secondParam,
                        i,
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
                        fractionSign;
                    switch (this.name) {

                        case '+':
                            //case '-':
                            for (i = 0; i < this.params.length; i++) {
                                if (this.params[i].isTerminal === false) {
                                    this.params[i].expand(functionVariable, equationData);
                                }

                            }

                            nameSpace.TreeProcedures._findSameOperatorAndMerge(this);

                            expandPerformed = true;
                            break;

                        case '\\cdot':
                            if (nameSpace.TreeProcedures._getAdditionGroupCount(this.params) > 0) {

                                additionGroups = [];
                                counter = 0;
                                while (counter < this.params.length) {
                                    if (this.params[counter].name === '+') {
                                        additionGroups.push(this._removeParam(this.params[counter], false));
                                    }
                                    else {
                                        counter++;
                                    }
                                }
                                if (additionGroups.length > 1) {
                                    while (additionGroups.length > 1) {
                                        multipliedTerm = nameSpace.TreeProcedures._expandMultiplication(additionGroups.shift(), additionGroups.shift(), this.sign);
                                        additionGroups.unshift(multipliedTerm);
                                    }
                                }
                                else {
                                    multipliedTerm = additionGroups[0];
                                }


                                /*
                                * if we have params left then there were non + terms, so just multiply them
                                */
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'Remaining non plus params count is ' + this.params.length, []);
                                if (this.params.length > 0) {
                                    if (this.params.length > 1) {

                                        cdotParam = nameSpace.TreeProcedures._getParseTreeNodeObject(undefined, '\\cdot', '+', undefined);
                                        nameSpace.TreeProcedures._adoptAllParams(this, cdotParam);
                                        multipliedTerm = nameSpace.TreeProcedures._expandMultiplication(cdotParam, multipliedTerm, this.sign);
                                    }
                                    else {
                                        multipliedTerm = nameSpace.TreeProcedures._expandMultiplication(this.params[0], multipliedTerm, this.sign);
                                        nameSpace.TreeProcedures._removeAllParams(this);
                                    }

                                }
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'Addition group is ' + multipliedTerm, []);

                                nameSpace.TreeProcedures._convertTreeNodeTo(this, '+');
                                nameSpace.TreeProcedures._adoptAllParams(multipliedTerm, this);


                            }
                            else {
                                //nothing to expand
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'Nothing to expand', []);
                            }
                            nameSpace.TreeProcedures._findSameOperatorAndMerge(this);

                            break;

                        case '^':
                            firstParam = this.params[0];
                            if (firstParam.isTerminal === false) {
                                firstParam.expand(equationData);
                            }
                            secondParam = this.params[1];
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'Expanding ^ with params ' + this.params, []);
                            //Removing && secondParam.type === 'digit' as constants WILL be encountered now
                            if (firstParam.name === '+' && secondParam.isTerminal === true) {
                                //values 0 and 1 will be excluded since they will be simplified
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'Possible expansion of ' + firstParam + ' at degree ' + secondParam, []);

                                if (secondParam.value === '2') {
                                    if (nameSpace.TreeProcedures._hasFreeVariable(this, functionVariable) === false) {
                                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'No function variable found in my params....Expansion is futile', []);
                                        return;
                                    }
                                    //check for + in do
                                    //expand only (x+a)^2 type of terms
                                    termsToExpand = nameSpace.TreeProcedures._extractAllParams(firstParam);


                                    nameSpace.TreeProcedures._convertTreeNodeTo(this, '+');
                                    nameSpace.TreeProcedures._removeAllParams(this);

                                    /*
                                    * all the terms in following array will be in first degree ONLY 
                                    * terms with higher degree of freevar should have been discarded when calculating powers of free variables
                                    */
                                    termsWithFreeVariable = nameSpace.TreeProcedures._seperateTermsWithFreeVariable(termsToExpand, functionVariable);

                                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'Terms with free Variable ' + functionVariable + ' are ' + termsWithFreeVariable, []);
                                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'Terms WITHOUT free Variable ' + functionVariable + ' are ' + termsToExpand, []);

                                    if (termsWithFreeVariable.length === 0) {
                                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, '##############ERROR THIS SHOULDNT HAPPEN...@#@#######', []);
                                    }
                                    else {
                                        power2Term = nameSpace.TreeProcedures._getParseTreeTerminalObject(undefined, 'digit', '+');
                                        power2Term.value = 2;

                                        //reusing firstParam and secondParam variable names here
                                        if (termsWithFreeVariable.length > 0) {
                                            firstParam = nameSpace.TreeProcedures._getParseTreeNodeObject(undefined, '+', undefined, undefined);
                                            for (i = 0; i < termsWithFreeVariable.length; i++) {
                                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'Adding param ' + termsWithFreeVariable[i], []);
                                                firstParam._addParam(termsWithFreeVariable[i]);
                                            }
                                        }
                                        else {
                                            firstParam = termsWithFreeVariable[0];
                                        }



                                        if (termsToExpand.length > 0) {
                                            secondParam = nameSpace.TreeProcedures._getParseTreeNodeObject(undefined, '+', undefined, undefined);
                                            for (i = 0; i < termsToExpand.length; i++) {
                                                secondParam._addParam(termsToExpand[i]);
                                            }
                                        }
                                        else {
                                            secondParam = termsToExpand[0];
                                        }

                                        //(a+b)^2

                                        //a^2
                                        expansionTerm = nameSpace.TreeProcedures._getParseTreeNodeObject(undefined, '^', undefined, undefined);
                                        expansionTerm._addParam(nameSpace.TreeProcedures._clone(firstParam));
                                        expansionTerm._addParam(nameSpace.TreeProcedures._clone(power2Term));
                                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'expansion term 1 generated ' + expansionTerm, []);
                                        expansionTerm.sign = nameSpace.TreeProcedures._multiplySigns(expansionTerm.sign, this.sign);
                                        this._addParam(expansionTerm);



                                        //b^2
                                        expansionTerm = nameSpace.TreeProcedures._getParseTreeNodeObject(undefined, '^', undefined, undefined);
                                        expansionTerm._addParam(nameSpace.TreeProcedures._clone(secondParam));
                                        expansionTerm._addParam(nameSpace.TreeProcedures._clone(power2Term));
                                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'expansion term 2 generated ' + expansionTerm, []);
                                        expansionTerm.sign = nameSpace.TreeProcedures._multiplySigns(expansionTerm.sign, this.sign);
                                        this._addParam(expansionTerm);


                                        //2ab
                                        expansionTerm = nameSpace.TreeProcedures.multiply(firstParam, secondParam);
                                        //since the value is 2 :P
                                        expansionTerm = nameSpace.TreeProcedures.multiply(expansionTerm, power2Term);
                                        expansionTerm.sign = nameSpace.TreeProcedures._multiplySigns(expansionTerm.sign, this.sign);
                                        this._addParam(expansionTerm);

                                        expandPerformed = true;
                                    }
                                }
                            }
                                //last 2 conditions to help skipping many useless expansions
                            else if (firstParam.name === '\\cdot' && secondParam.isTerminal && secondParam.type === 'digit') {
                                //simplify like (a.b)^2 -> a^2. b^2...it helps later segregating function variables 
                                powerTerm = this._removeParam(secondParam, false);
                                nameSpace.TreeProcedures._convertTreeNodeTo(this, '\\cdot');

                                termsToExpand = nameSpace.TreeProcedures._extractAllParams(firstParam);
                                nameSpace.TreeProcedures._removeAllParams(this);
                                firstParam.incinerate();

                                while (termsToExpand.length > 0) {
                                    powerFunction = nameSpace.TreeProcedures._getParseTreeNodeObject(undefined, '^', '+', undefined);
                                    powerFunction._addParam(termsToExpand.shift());
                                    powerFunction._addParam(nameSpace.TreeProcedures._clone(powerTerm));
                                    this._addParam(powerFunction);
                                }
                                powerTerm.incinerate();
                                expandPerformed = true;
                            }


                            break;

                        case '\\frac':
                            numerator = this.params[0];

                            if (numerator.isTerminal === false) {
                                numerator.expand(functionVariable);
                            }

                            if (numerator.name === '+') {
                                expandPerformed = true;

                                //TODO make this a function
                                this.name = '+';
                                this.maxParams = nameSpace.TreeProcedures._productions.getMaximumParameters(this.name);


                                denominator = this.params[1];

                                this._removeParam(numerator, false);
                                this._removeParam(denominator, false);

                                termsCount = numerator.params.length;

                                //fraction is expandable
                                while (numerator.params.length > 0) {
                                    fractionSign = this.sign;
                                    newNumerator = numerator.params[0];
                                    numerator._removeParam(newNumerator, false);

                                    if (numerator.params.length === 0) {
                                        newDenominator = denominator;
                                    }
                                    else {
                                        newDenominator = nameSpace.TreeProcedures._clone(denominator);
                                    }

                                    newFractionTerm = nameSpace.TreeProcedures._getParseTreeNodeObject(this, '\\frac');
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

                    if (expandPerformed === true) {
                        this.simplify(equationData);
                    }
                },

                simplify: function simplify(equationData) {
                    var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                        allTermsDigitsFlag = true,
                        i,
                        childParamsLength;


                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'Simplifying ' + this, []);

                    if (this.name === "\\sum" || this.name === "\\prod") {
                        nameSpace.TreeProcedures.simplifySumProd(this, equationData);
                        return;
                    }


                    //nameSpace.TreeProcedures._preNumericalStructuralOptimizations(this);
                    childParamsLength = this.params.length;


                    for (i = childParamsLength - 1 ; i >= 0; i--) {
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '...processing ' + this.params[i], []);

                        if (this.params[i].isTerminal === true) {
                            if (this.params[i].type !== 'digit') {
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, this.params[i] + ' is not digit', []);
                                allTermsDigitsFlag = false;
                            }
                            continue;
                        }
                        else {
                            this.params[i].simplify(equationData);
                        }


                        if (this.params[i].isTerminal === false || this.params[i].type !== 'digit') {
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, this.params[i] + ' is not digit', []);
                            allTermsDigitsFlag = false;
                        }

                    }




                    this.allTermsDigits = allTermsDigitsFlag;
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'all terms digit flag is ' + this.allTermsDigits + ' for function ' + this, []);

                    nameSpace.TreeProcedures._performNumericalOptimizations(this, equationData);

                    nameSpace.TreeProcedures._performStructuralOptimizations(this, equationData);
                },

                parentNode: parent
            };
            if (parent !== undefined && parent.isEmpty === true) {
                parent._addParam(functionObject);

            }
            //function can be parentless
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
        _isInversibleFunction: function _isInversibleFunction(functionName) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            return nameSpace.Parser._INVERSIBLE_FUNCTIONS.indexOf(functionName) !== -1;
        },

        /**
            Checks if the node has any variables in it. If it does then it is not simple.

            @method _isNodeSimple
            @private
            @param node{object} 
            @return {Boolean} true if node is simple/does not have any variable in it
            @static
        **/
        _isNodeSimple: function _isNodeSimple(node) {
            var result = true,
                i;
            if (node.isTerminal) {
                result = result && node.type !== "var";
            }
            else {
                for (i = 0; i < node.params.length; i++) {
                    result = result && _isNodeSimple(node.params[i]);
                    if (!result) {
                        return result;
                    }
                }


            }
            return result;
        },


        simplifySumProd: function simplifySumProd(node, equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                start,
                end,
                sum,
                sumCode,
                functionCode,
                func,
                result,
                terminal;

            if (!node || !node.params || node.params.length < 4) {
                return;
            }

            start = node.params[1];
            end = node.params[2];
            sum = node.params[3];

            if (!start.isTerminal) {
                start.simplify();
            }
            if (!end.isTerminal) {
                end.simplify();
            }
            if (!sum.isTerminal) {
                sum.simplify();
            }


            if (!(nameSpace.TreeProcedures._isNodeSimple(start) && nameSpace.TreeProcedures._isNodeSimple(end) && nameSpace.TreeProcedures._isNodeSimple(sum))) {
                //console.log('Cant simplify node ' + node + " with sumcode " + nameSpace.TreeProcedures._toMobileFunction(sum, equationData, node.params[0].value));
                return;
            }



            if (!start.isTerminal || start.type !== "digit") {
                return;
            }
            if (!end.isTerminal || end.type !== "digit") {
                return;
            }

            sumCode = nameSpace.TreeProcedures._toMobileFunction(sum, equationData, node.params[0].value);

            if (sumCode.search('param') > -1) {
                return;
            }
            functionCode = "return " + nameSpace.TreeProcedures._toMobileFunction(node, equationData) + ";";

            if (functionCode.search('findFactorial') > -1) {
                functionCode = nameSpace.MathFunctions.findFactorialString + functionCode;

            }
            if (functionCode.search('gammaFunction') > -1) {
                functionCode = nameSpace.MathFunctions._gammaFunctionString + functionCode;

            }

            if (functionCode.search('sum') > -1) {
                functionCode = nameSpace.MathFunctions.getSumString() + functionCode;
            }

            if (functionCode.search('prod') > -1) {
                functionCode = nameSpace.MathFunctions.getProdString() + functionCode;
            }


            func = new Function('param,constants', functionCode);
            result = func(0, equationData.getConstants());

            //TODO pass the units
            terminal = nameSpace.TreeProcedures._getParseTreeTerminalObject(undefined, 'digit', '+', node.params[0].units);
            terminal.value = result;

            node.convertToTerminal(terminal);


            /*
            var start = node.params[1];
            var end = node.params[2];
            var sum = node.params[3];

            start.isTerminal && start.simplify();
            end.isTerminal && end.simplify();
            sum.isTerminal && sum.simplify();

            if (!start.isTerminal || start.type !== "digit") return;
            if (!end.isTerminal || end.type !== "digit") return;
            
            var i = start;

            var pivotOriginalValue = 
            for (i; i <= end; i++) {
                nameSpace.TreeProcedures._substituteParamVariableAndGetValue(
            }
            
            */

        },

        /**
           Gets the first non-delimiter left child
           
       
           @method _getLeftChild
           @private
           @param node{Object} The node for which the left child is to be found out
           @return {Object} left child node object or null
           @static
       **/
        _getLeftChild: function _getLeftChild(node) {

            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            if (!node.isTerminal) {
                if (node.params[0].name === 'do') {
                    return nameSpace.TreeProcedures._getLeftChild(node.params[0]);
                }
                else {
                    return node.params[0];
                }
            }
            return null;
        },

        /**
           Gets the first non-delimiter right child
           
       
           @method _getRightChild
           @private
           @param node{Object} The node for which the right child is to be found out
           @return {Object} right child node object or null
           @static
       **/
        _getRightChild: function _getRightChild(node) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            if (!node.isTerminal) {
                if (node.params[1].name === 'do') {
                    return nameSpace.TreeProcedures._getLeftChild(node.params[1]);
                }
                else {
                    return node.params[1];
                }
            }
            return null;
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
        _getInversibleFunctionReplacement: function _getInversibleFunctionReplacement(functionName) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                inversibleFunctionIndex;
            inversibleFunctionIndex = nameSpace.Parser._INVERSIBLE_FUNCTIONS.indexOf(functionName);
            if (inversibleFunctionIndex !== -1) {
                return nameSpace.Parser._INVERT_FUNCTIONS_IN_ORDER[inversibleFunctionIndex];
            }
            return null;
        },

        /**
           Converts inverse trignometric function to corresponding inverse functions
           eg. sin^-1 to arcsin
           
       
           @method _preNumericalStructuralOptimizations
           @private
           @param node{Object} The node for which the optimization have to be done
           @return Void
           @static
       **/
        _preNumericalStructuralOptimizations: function _preNumericalStructuralOptimizations(node) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                leftChild,
                rightChild,
                leftGrandChildrens,
                functionToReplace,
                childCounter,
                childrenLength;
            switch (node.name) {
                case '^':
                    leftChild = nameSpace.TreeProcedures._getLeftChild(node);
                    if (leftChild !== null && nameSpace.TreeProcedures._isInversibleFunction(leftChild.name)) {
                        rightChild = nameSpace.TreeProcedures._getRightChild(node);
                        if (rightChild !== null && nameSpace.TreeProcedures._getValueFromParam(rightChild) === -1) {
                            functionToReplace = nameSpace.TreeProcedures._getInversibleFunctionReplacement(leftChild.name);
                            if (functionToReplace !== null) {
                                leftGrandChildrens = nameSpace.TreeProcedures._extractAllParams(leftChild);
                                nameSpace.TreeProcedures._convertTreeNodeTo(node, functionToReplace);
                                node.sign = nameSpace.TreeProcedures._multiplySigns(node.sign, leftChild.sign);

                                nameSpace.TreeProcedures._removeAllParams(node);

                                childCounter = 0;
                                childrenLength = leftGrandChildrens.length;
                                for (childCounter; childCounter < childrenLength; childCounter++) {
                                    node._addParam(leftGrandChildrens[childCounter]);
                                }
                            }
                        }

                    }
            }
        },

        /**
        Perform structural optimizations in the equation Tree.          
            
        
        @method _performStructuralOptimizations
        @private
        @param node{Object} node to be optimized
        @return Void
        @static
        **/
        _performStructuralOptimizations: function _performStructuralOptimizations(node, equationData) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                performNumericalOptimizations = false,
                sign,
                childTerm,
                childPower,
                doChildParams,
                powerTerm,
                //powerNode,
                leftChild,
                //leftGrandChildrens,
                //functionToReplace,
                //childCounter,
                //childrenLength,
                //rightGrandChild,
                //rightPercentNode,
                //factorialNode,
                numberOfPercentChilds,
                percentChild,
                value,
                replacementNode;
            //isZeroPresent = false;
            switch (node.name) {
                case '^':
                    //1. merge powers (a^2)^2 will be a^4
                    if (node.params[0].name === '^') {
                        //powerTerm =

                        powerTerm = node._removeParam(1, false);

                        childTerm = node.params[0]._removeParam(0, false);
                        childPower = node.params[0]._removeParam(0, false);

                        node._removeParam(0);

                        powerTerm = nameSpace.TreeProcedures.multiply(powerTerm, childPower);


                        node._addParam(childTerm);
                        node._addParam(powerTerm);

                        performNumericalOptimizations = true;
                    }
                    else if (node.params[0].name === '\\%') {
                        numberOfPercentChilds = nameSpace.TreeProcedures._getNumberOfPercentChilds(node);
                        leftChild = node.params[1];
                        percentChild = nameSpace.TreeProcedures._getPercentChild(node.params[0]);
                        sign = percentChild.sign;
                        value = Math.pow(0.01, numberOfPercentChilds);
                        value = Math.pow(value, leftChild.value);
                        value *= percentChild.value;
                        replacementNode = nameSpace.TreeProcedures._getParseTreeTerminalObject(undefined, 'digit', sign, undefined);
                        replacementNode.value = value;
                        nameSpace.TreeProcedures._removeAllParams(node);
                        node.convertToTerminal(replacementNode);
                        //rightGrandChild = node.params[0].params[0];
                        //sign = node.sign;
                        //nameSpace.TreeProcedures._removeAllParams(node);
                        //nameSpace.TreeProcedures._convertTreeNodeTo(node, '\\cdot');
                        //node.sign = sign;
                        //node._addParam(rightGrandChild);
                        //powerNode = nameSpace.TreeProcedures._getParseTreeNodeObject(node, '^', '+', undefined);
                        //rightPercentNode = nameSpace.TreeProcedures._getParseTreeTerminalObject(powerNode, 'digit', '+', undefined);
                        //rightPercentNode.value = '0.01';
                        //powerNode._addParam(leftChild);

                    }
                    break;

                    /*case '+':
                    nameSpace.TreeProcedures._findSameOperatorAndMerge(node);
                    break;*/

                case 'do':
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'optimizing ' + node + ' with params ' + node.params, []);
                    doChildParams = nameSpace.TreeProcedures._extractAllParams(node);
                    sign = node.sign;
                    nameSpace.TreeProcedures._convertTreeNodeTo(node, doChildParams[0]);
                    sign = nameSpace.TreeProcedures._multiplySigns(sign, doChildParams[0].sign);

                    if (doChildParams[0].name === '+' && sign === '-') {
                        nameSpace.TreeProcedures.negateTree(node);
                    }
                    else {
                        //pass on sign fron parent do to children
                        node.sign = sign;
                    }

                    break;

                case '!':
                    if (node.params[0].name === '\\%') {
                        numberOfPercentChilds = nameSpace.TreeProcedures._getNumberOfPercentChilds(node);
                        percentChild = nameSpace.TreeProcedures._getPercentChild(node.params[0]);
                        sign = percentChild.sign;
                        value = Math.pow(0.01, numberOfPercentChilds);
                        value = nameSpace.TreeProcedures._mathFunctions.performMathematicalCalculations('!', [value], nameSpace.TreeProcedures._getUnits(node));
                        value *= percentChild.value;
                        replacementNode = nameSpace.TreeProcedures._getParseTreeTerminalObject(undefined, 'digit', sign, undefined);
                        replacementNode.value = value;
                        nameSpace.TreeProcedures._removeAllParams(node);
                        node.convertToTerminal(replacementNode);
                        //rightGrandChild = node.params[0].params[0];
                        //sign = node.sign;
                        //nameSpace.TreeProcedures._removeAllParams(node, false);
                        //nameSpace.TreeProcedures._convertTreeNodeTo(node, '\\cdot');
                        //node.sign = sign;
                        //node._addParam(rightGrandChild);
                        //factorialNode = nameSpace.TreeProcedures._getParseTreeNodeObject(node, '!', '+', undefined);
                        //rightPercentNode = nameSpace.TreeProcedures._getParseTreeTerminalObject(factorialNode, 'digit', '+', undefined);
                        //rightPercentNode.value = '0.01';
                    }
                    break;
                    //case '\\cdot':
                    //    childrenLength = node.params.length;
                    //    for (childCounter = 0; childCounter < childrenLength; childCounter++) {
                    //        childTerm = node.params[childCounter];
                    //        if (childTerm.isTerminal === true) {
                    //            if (Number(childTerm.value) === 0) {
                    //                isZeroPresent = true;
                    //                break;
                    //            }
                    //        }
                    //    }
                    //    if (isZeroPresent === true) {
                    //        replacementNode = nameSpace.TreeProcedures._getParseTreeTerminalObject(undefined, 'digit', sign, undefined);
                    //        replacementNode.value = value;
                    //        nameSpace.TreeProcedures._removeAllParams(node);
                    //        node.convertToTerminal(replacementNode);
                    //    }
                    //    break;
            }


            if (performNumericalOptimizations) {
                nameSpace.TreeProcedures._performNumericalOptimizations(node, equationData);
            }



        },

        /**
            Get the number of percent child for the node
            
        
            @method _performStructuralOptimizations
            @private
            @param node{Object} node for which the number of percent childs have to be found out
            @return {Number} number of percent childs present
            @static
        **/
        _getNumberOfPercentChilds: function _getNumberOfPercentChilds(node) {
            var numberOfPercentChilds = 0,
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                childCounter,
                childLength,
                currentChild;
            if (node.isTerminal === false) {
                childCounter = 0;
                childLength = node.params.length;
                for (childCounter; childCounter < childLength; childCounter++) {
                    currentChild = node.params[childCounter];
                    if (currentChild.name === '\\%') {
                        numberOfPercentChilds++;
                        numberOfPercentChilds += nameSpace.TreeProcedures._getNumberOfPercentChilds(currentChild);
                    }
                }
            }
            return numberOfPercentChilds;
        },

        /**
            Get child node of percent node
            
        
            @method _getPercentChild
            @private
            @param node{Object} percent node for which the child has to be found out
            @return node{Object} percent child node
            @static
        **/
        _getPercentChild: function _getPercentChild(node) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            if (node.params[0].name === '\\%') {
                return nameSpace.TreeProcedures._getPercentChild(node.params[0]);
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
        _expandMultiplication: function _expandMultiplication(term1, term2, parentSign) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                term1Params,
                parentNode,
                incinerateTerm1Params,
                incinerateTerm2Params,
                term2Params,
                i,
                j,
                temp;

            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'multiplying ' + term1 + ' to ' + term2, []);
            //this function assumes that parent is cdot...since it is designed for cdot expansion
            if (term1.name !== '+' && term2.name !== '+') {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'Both terms are not + series...just multiplying', []);
                return nameSpace.TreeProcedures.multiply(term1, term2);
            }

            incinerateTerm1Params = false;
            incinerateTerm2Params = false;

            if (term1.name === '+') {
                term1Params = nameSpace.TreeProcedures._extractAllParams(term1);
                parentNode = term1;
                incinerateTerm1Params = true;
            }
            else {
                term1Params = [term1];
                incinerateTerm1Params = false;
            }

            if (term2.name === '+') {
                term2Params = nameSpace.TreeProcedures._extractAllParams(term2);

                incinerateTerm2Params = true;

                if (parentNode === undefined) {
                    parentNode = term2;
                }
                else {
                    term2.incinerate();
                }

            }
            else {
                term2Params = [term2];
                incinerateTerm2Params = false;
            }
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'term1 params ' + term1Params, []);
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'term2 params ' + term1Params, []);

            //if parent is not declared then skip adding
            if (parentNode === undefined) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, 'Parent node not found...skip expand multiplication', []);
                return;
            }


            for (i = 0; i < term1Params.length; i++) {
                for (j = 0; j < term2Params.length; j++) {
                    temp = nameSpace.TreeProcedures.multiply(
                        nameSpace.TreeProcedures._clone(term1Params[i]),
                            nameSpace.TreeProcedures._clone(term2Params[j]));
                    temp.sign = nameSpace.TreeProcedures._multiplySigns(parentSign, temp.sign);
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.expand, '>>>' + temp, []);
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
        _extractAllParams: function _extractAllParams(node) {
            var allParams = [];

            while (node.params.length > 0) {
                allParams.push(node._removeParam(node.params[0], false));
            }

            return allParams;
        },



        /**
        Removes all parameters from the node. It provides option wheather the parameters are to be incinerated.           
            
        
        @method _removeAllParams
        @private
        @param node{Object} node to remove params from
        @param shouldBeIncinerated{Boolean} should the params be incinerated?
        @return Void
        @static
        **/
        _removeAllParams: function _removeAllParams(node, shouldBeIncinerated) {
            if (shouldBeIncinerated === undefined) {
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
        _getAdditionGroupCount: function _getAdditionGroupCount(params) {
            var iCount = 0,
                i = 0;
            for (i = 0; i < params.length; i++) {
                if (params[i].name === '+') {
                    iCount++;
                }
            }
            return iCount;

        },

        /**
        Appends all params from oldNode to existing parameters of newNode.
            
        
        @method
        @private
        @param newNode{Object} params will be added in this node
        @param oldNode{Object} params will be added from this node
        @return
        @static
        **/
        _adoptAllParams: function _adoptAllParams(oldNode, newNode) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            if (oldNode === newNode) {

                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Skipping adopting your own params -_-', []);
                return;
            }
            while (oldNode.params.length > 0) {
                newNode._addParam(oldNode._removeParam(0, false));
            }
        },


        /**
        Remove all the terms with which has provided free variable in it. eg. 
        *REVIEW*
        
        @method _seperateTermsWithFreeVariable
        @private
        @param terms
        @return
        @static
        **/
        _seperateTermsWithFreeVariable: function _seperateTermsWithFreeVariable(terms, freeVar) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                termsWithFreeVariable = [],
                i;
            for (i = 0; i < terms.length; i++) {
                if (nameSpace.TreeProcedures._hasFreeVariable(terms[i], freeVar) === true) {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'term ' + terms[i] + ' have freevar ' + freeVar, []);
                    termsWithFreeVariable.push(terms[i]);
                    terms.splice(i, 1);
                    i--;
                }
                else {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'term ' + terms[i] + '  doesnt have freevar ' + freeVar, []);
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
        _hasFreeVariable: function _hasFreeVariable(nodeOrTerminal, freeVariable) {
            if (nodeOrTerminal.isTerminal === true) {
                return (nodeOrTerminal.type === 'var' && nodeOrTerminal.value === freeVariable);
            }
            else {
                var result,
                    i;
                for (i = 0; i < nodeOrTerminal.params.length; i++) {
                    result = _hasFreeVariable(nodeOrTerminal.params[i], freeVariable);
                    if (result === true) {
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
        @return Void
        @static
        **/
        _convertTreeNodeTo: function _convertTreeNodeTo(node, newNodeName) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                allParams;
            if (node.isTerminal === true) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Cant convert terminal to a NODE', []);
                return;
            }
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Converting the tree node ' + node + ' from ' + node.name + ' to ' + newNodeName, []);

            if (typeof (newNodeName) === 'string') {
                node.name = newNodeName;
                node.maxParams = nameSpace.TreeProcedures._productions.getMaximumParameters(newNodeName);
            }
            else {
                if (newNodeName.isTerminal === false) {
                    node.name = newNodeName.name;
                    node.sign = newNodeName.sign;
                    node.maxParams = nameSpace.TreeProcedures._productions.getMaximumParameters(node.name);

                    allParams = nameSpace.TreeProcedures._extractAllParams(newNodeName);
                    nameSpace.TreeProcedures._removeAllParams(node);

                    while (allParams.length > 0) {
                        node._addParam(allParams.shift());
                    }
                }
                else {
                    node.convertToTerminal(newNodeName);
                }
            }
            if (node.maxParams === Infinity) {
                node.isEmpty = true;
            }

            //not checking or updating isFull,parent,
        },


        /**
                   
        Get units from the node.     
        
        @method _getUnits
        @private
        @param node{Object} 
        @return
        @static
        **/
        _getUnits: function _getUnits(node) {
            var param = node.params[0],
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            if (param.isTerminal === true) {
                return param.units;
            }
            else {
                return nameSpace.TreeProcedures._getUnits(param);
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
        _getAllParamsValues: function _getAllParamsValues(node) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                values = [],
                paramChildCounter = 0,
                paramChildsLength = node.params.length,
                currentChild;

            for (paramChildCounter; paramChildCounter < paramChildsLength; paramChildCounter++) {
                currentChild = node.params[paramChildCounter];
                if (currentChild.isTerminal) {
                    values.push(nameSpace.TreeProcedures._getValueFromParam(currentChild));
                }
                else {

                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '%c[FAIL ]' + 'The Node provided is not terminal', [nameSpace.Parser._NSTYLE]);
                }
            }
            return values;
        },

        /**
        Function to get value of a node . The node has to be terminal node.
            
        
        @method _getValueFromParam
        @private
        @param node{Object} The node object whose value has to be retrieved
        @return {Integer} the value or else null
        @static
        **/
        _getValueFromParam: function _getValueFromParam(node) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                value;
            if (node.isTerminal) {
                value = (Number)(node.value);
                if (isNaN(value)) {
                    return node.value;
                }
                else {
                    if (node.sign === '-' && value !== 0) {
                        return -1 * value;
                    }
                    else {
                        return value;
                    }
                }
            }
            else {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Value for a non terminal node was asked' + node.name, []);
                return null;
            }
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
        _multiplySigns: function _multiplySigns(sign1, sign2) {
            if (sign1 === "+" && sign2 === "+") {
                return "+";
            }
            else if (sign1 === "+" || sign2 === "+") {
                //means one of them is - :P
                return "-";
            }
            else {
                //means both are -ve 
                return "+";
            }
        },

        /**
                   
            Returns additition of all terminal digit values of addition node

            @method _getAdditionValue
            @private
            @param node{Object} addition node
            @return {Number} addition value
            @static
        **/
        _getAdditionValue: function _getAdditionValue(node) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
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
                    value += nameSpace.TreeProcedures._getValueFromParam(currentChild);
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
        _performPercentOptimizations: function _performPercentOptimizations(node) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                parentNode = node.parentNode,
                value,
                allIncineratedChilds,
                percentOfValue;
            //percentRaisedTo;
            if (parentNode !== undefined) {
                if (parentNode.name === '+') {
                    percentOfValue = nameSpace.TreeProcedures._getAdditionValue(parentNode);
                    if (parentNode.onlyPercent === undefined) {
                        if (percentOfValue === null) {
                            parentNode.onlyPercent = true;
                        }
                        else {
                            parentNode.onlyPercent = false;
                        }
                    }
                    if (parentNode.onlyPercent === true) {
                        value = nameSpace.TreeProcedures._mathFunctions.performMathematicalCalculations(node.name, [nameSpace.TreeProcedures._getValueFromParam(node.params[0])], nameSpace.TreeProcedures._getUnits(node));
                    }
                    else {
                        value = nameSpace.TreeProcedures._mathFunctions.performMathematicalCalculations(node.name, [percentOfValue, nameSpace.TreeProcedures._getValueFromParam(node.params[0])], nameSpace.TreeProcedures._getUnits(node));
                    }
                    if (node.sign === '-') {
                        value *= -1;
                    }
                    allIncineratedChilds = nameSpace.TreeProcedures._extractAllParams(node, false);
                    node.convertToTerminal(allIncineratedChilds[0]);
                    node.sign = allIncineratedChilds[0].sign;
                    node.value = value;
                    allIncineratedChilds[0].incinerate();
                }
                else if (parentNode.name === '^' || parentNode.name === '!') {
                    return;
                }
                else {
                    return nameSpace.TreeProcedures._mathFunctions.performMathematicalCalculations(node.name, [nameSpace.TreeProcedures._getValueFromParam(node.params[0])], nameSpace.TreeProcedures._getUnits(node));
                }
            }
            else {
                return nameSpace.TreeProcedures._mathFunctions.performMathematicalCalculations(node.name, [nameSpace.TreeProcedures._getValueFromParam(node.params[0])], nameSpace.TreeProcedures._getUnits(node));
            }
        },

        /**
        Perform numerical optimizations in the equation tree.            
        
        @method _performNumericalOptimizations
        @private
        @param node{Object} node to perform numerical optimizations
        @return Void
        @static
        **/
        _performNumericalOptimizations: function _performNumericalOptimizations(node, equationData) {

            if (node.isTerminal === true) {
                return;
            }
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                result,
                solvingComplete,
                reducedToNode,
                signFactor,
                i,
                param,
                fractionInNumerator,
                denominator,
                newDenominator,
                lastParamLeft,
                convertToTerminal;
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'solving---------------' + node + ' with maxparams ' + node.maxParams, []);

            signFactor = 1;
            if (node.sign === '-') {
                signFactor = -1;
            }

            if (node.maxParams === Infinity) {
                //operator functions +,-,.
                i = 0;

                //1.ADD ALL DIGITS
                for (i = 0; i < node.params.length; i++) {
                    param = node.params[i];

                    if (param.isTerminal === true && param.type === 'digit') {
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'processing digit ' + param, []);
                        if (result === undefined) {
                            result = nameSpace.TreeProcedures._getValueFromParam(node.params[i]);
                            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'for operator ' + node.name + ' Result init to ' + result, []);
                            reducedToNode = node.params[i];
                        }
                        else {
                            switch (node.name) {
                                case '+':
                                    result += nameSpace.TreeProcedures._getValueFromParam(node.params[i]);
                                    break;

                                case '-':
                                    result -= nameSpace.TreeProcedures._getValueFromParam(node.params[i]);
                                    break;

                                case '\\cdot':
                                    result *= nameSpace.TreeProcedures._getValueFromParam(node.params[i]);
                                    break;

                            }

                            node._removeParam(param);
                            i--;
                            //loop adjustment
                        }

                    }
                    else {
                        nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'param ' + param + ' is not terminal', []);
                        // IF there are terminals other than digits we do not propogate the sign. Propogating the sign results in -ve sign in both the operator and the terminal node
                        signFactor = 1;
                    }


                }
                //2. convert x.x into x^2. Warning this wont convert (a+b).(a+b) into (a+b)^2. that is done when terms are expanded, since it is easier and meaningful at that time.
                if (node.name === '\\cdot') {

                }
                if (result !== undefined) {
                    result *= signFactor;
                }


                //all simplifications are done at this point. 

                if (node.params.length === 1) {
                    solvingComplete = true;
                }

                if (reducedToNode !== undefined) {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'Reduced to result ' + result, []);
                    reducedToNode.value = result;
                    reducedToNode.sign = '+';
                }


            }
            else {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, node + ' all terms digits flag is ' + node.allTermsDigits, []);
                if (node.allTermsDigits === true) {
                    //terminal function
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, '!!!Processing function ' + node.name + ' with params ' + node.params, []);
                    switch (node.name) {
                        //case '^':                                                                                                                                                                                                                                              
                        //    result = Math.pow(node.params[0].value, node.params[1].value);                                                                                                                                                                                                                                              
                        //    break;                                                                                                                                                                                                                                              

                        //case '\\frac':                                                                                                                                                                                                                                              
                        //    result = node.params[0].value / node.params[1].value;                                                                                                                                                                                                                                              
                        //    break;                                                                                                                                                                                                                                              
                        case '\\%':
                            result = nameSpace.TreeProcedures._performPercentOptimizations(node);
                            //percentParent = node.parentNode;
                            //if (percentParent !== undefined && percentParent.name === '+') {
                            //    index = percentParent.params.indexOf(node);
                            //    if (index - 1 >= 0) {
                            //        percentOf = percentParent.params[index - 1];
                            //        if (percentOf.isTerminal === true && percentOf.type === 'digit') {
                            //            percentOfValue = nameSpace.TreeProcedures._getValueFromParam(percentOf);
                            //        }
                            //    }
                            //}
                            //paramsForSolving = [nameSpace.TreeProcedures._getValueFromParam(node.params[0])];
                            //if (percentOfValue !== undefined) {
                            //    paramsForSolving.push(percentOfValue);
                            //}
                            //result = nameSpace.TreeProcedures._mathFunctions.performMathematicalCalculations(node.name, paramsForSolving, nameSpace.TreeProcedures._getUnits(node));


                            break;
                        case 'do':
                            solvingComplete = false;
                            break;

                        default:
                            result = nameSpace.TreeProcedures._mathFunctions.performMathematicalCalculations(node.name, nameSpace.TreeProcedures._getAllParamsValues(node), nameSpace.TreeProcedures._getUnits(node));
                            if (result === null) {
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'Dont know how to process function ' + node, []);
                            }


                    }




                    if (result !== undefined) {
                        result *= signFactor;
                        node.params[0].value = result;
                        node.params[0].type = 'digit';
                        node.params[0].sign = '+';


                        while (node.params.length > 1) {
                            node._removeParam(node.params[1]);
                        }

                        solvingComplete = true;
                    }



                }
                else {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'Not all terms are digits in function ' + node + ' params are ' + node.params, []);

                    //perform other miscellaneous simplifications
                    switch (node.name) {
                        case '\\frac':

                            //TODO implement better with getting all numerator and denominator array
                            if (node.params[0].isTerminal === false && node.params[0].name === '\\frac') {

                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'SImplifying fraction in numerator', []);
                                /**
                                *Test cases
                                * (a/b)/c , (a/b)/(c.d) , (a/(b.c))/d
                                *                           
                                */

                                fractionInNumerator = node.params[0];
                                denominator = node.params[1];

                                node._removeParam(fractionInNumerator, false);
                                node._removeParam(denominator, false);


                                node._addParam(fractionInNumerator.params[0]);

                                newDenominator = nameSpace.TreeProcedures.multiply(denominator, fractionInNumerator.params[1]);
                                node._addParam(newDenominator);

                                //no point in simplifying numerator cause if it was digits then it wud have simpliefied already :P
                                newDenominator.simplify(equationData);
                            }
                            else {
                                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'Cant simplify frac any further', []);
                            }

                            break;

                    }
                }

            }


            if (solvingComplete === true) {

                lastParamLeft = node.params[0];
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'node ' + node + ' has only param left ' + lastParamLeft, []);

                convertToTerminal = (lastParamLeft.isTerminal === true) || node.name === '+' || node.name === '\\cdot';


                if (convertToTerminal === true) {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'CONVERTING last node from ' + node + ' to ' + lastParamLeft, []);
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'before conversion it was ' + node, []);
                    //TODO handle case when first level turns to be digit
                    if (lastParamLeft.isTerminal) {
                        node.convertToTerminal(lastParamLeft);
                    }
                    else {
                        nameSpace.TreeProcedures._convertTreeNodeTo(node, lastParamLeft);
                        lastParamLeft.incinerate();
                    }
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'after conversion it is  ' + node, []);
                }
            }
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.simplify, 'Finished solving---------------' + node, []);
        }

    });


    /**
    @class MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.ParsingProcedures

    **/
    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.ParsingProcedures = Backbone.Model.extend({}, {

        _validOpeningBrackets: ['(', '{', '['],
        _validClosingBrackets: [')', '}', ']'],
        //we are supporting only + type recursion
        _recursiveTokenRegEx: /^\((.+)\)\+$/i,
        _productions: MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Productions,

        /**
        Returns peek value from the predictionStack. Normally the element at given index is finite term, then it will be returned. If it is infinite term (\\cdot,E)+ then the first token of that infinite term, \\cdot will be returned.


        @method peekInPredictionStack
        @private
        @param predictionStack{Array} prediction rule stack
        @param currentIndex{Integer} index of the stack element to peek into
        @return {String} the term at currentIndex, undefined in case of an error
        @static
        **/
        peekInPredictionStack: function peekInPredictionStack(predictionStack, currentIndex) {
            if (currentIndex > predictionStack.length) {
                return;
            }

            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            return nameSpace.ParsingProcedures._getPeekValue(predictionStack[currentIndex]);


        },

        /**
        Returns the peek value from any prediction stack element. 
        
        Eg.
        A  will return A
        (+,E)+ will return +
        (-,E)+ will return -
        x will return x
        E will return E

    

        @method _getPeekValue
        @private
        @param peekValue{Integer}
        @return {String} the peek value, undefined otherwise
        @static
        **/

        _getPeekValue: function _getPeekValue(peekValue) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                matches,
                tokens;
            if (peekValue === undefined) {
                return;
            }
            if (nameSpace.ParsingProcedures._recursiveTokenRegEx.test(peekValue)) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'peek term is recursive...' + peekValue, []);
                matches = peekValue.match(nameSpace.ParsingProcedures._recursiveTokenRegEx);
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'matches ' + matches, []);
                tokens = matches[1].split(',');
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'tokens are ' + tokens, []);
                return tokens[0];
            }
            return peekValue;
        },


        /**
                   
        It expands the infinite term in the prediction stack at index expandTermAt.    
        
        @method
        @private
        @param predictionStack{Array} 
        @param expandTermAt{Integer}
        @return
        @static
        **/
        expandRecursiveStack: function expandRecursiveStack(predictionStack, expandTermAt) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                lastTerm,
                matches,
                expandedTerms,
                i;
            //TRACE
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Expanding prediction stack ' + predictionStack + ' at index ' + expandTermAt, []);
            lastTerm = predictionStack[expandTermAt];

            matches = lastTerm.match(nameSpace.ParsingProcedures._recursiveTokenRegEx);

            expandedTerms = matches[1].split(',');
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Expanded terms are ' + expandedTerms, []);
            //TODO split on a decent method than character by character
            for (i = expandedTerms.length - 1; i >= 0; i--) {
                predictionStack.splice(expandTermAt, 0, expandedTerms[i]);
            }
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'now prediction stack is ' + predictionStack, []);

        },


        /**
        Checks if any term in the prediction stack is infinite. A infinite term such as const + (+E)+, in this prediction stack (+E)+ can be expanded to create expansions such as const + E + E + E (+E)+
        
        @method isStackInfinite
        @private
        @param predictionStack{Array} 
        @return {Boolean} 
        @static
        **/
        isStackInfinite: function isStackInfinite(predictionStack) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            return nameSpace.ParsingProcedures.isTermInfinite(predictionStack[predictionStack.length - 1]);
        },

        /**
        Checks if the term is infinite term which can be expanded eg. (+E)+ can be expanded for one or more times. Such terms will be infinite.
        
        @method isTermInfinite
        @private
        @param term{String}
        @return
        @static
        **/
        isTermInfinite: function isTermInfinite(term) {
            if (term === undefined) {
                return false;
            }
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            //
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'checking for recursive term ' + term + ' result is ' + this._recursiveTokenRegEx.test(term), []);
            return nameSpace.ParsingProcedures._recursiveTokenRegEx.test(term);
        },

        /**
        This function is used to verify prediction stack with the given lookahead. 
        The logic is to check the topmost prediction stack element with lookahead array...

        1. same or lower precedence infinite goal is not being chased in lookahead stack
        2. chasing of same infinite goal is allowed if after a closing delimiter is found in the lookahead array
        


        @method verifyStackWithLookahead
        @private
        @param predictionStack {Array} 
        @param lookAhead {Array} 
        @return {Boolean}
        @static
        **/
        verifyStackWithLookahead: function verifyStackWithLookahead(predictionStack, lookAhead) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                checkingWith,
                i;
            //TRACE
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '*******************verifying stack ' + predictionStack + ' with lookahead ' + lookAhead, []);
            if (lookAhead === undefined || lookAhead.length === 0) {
                return true;
            }

            /*
            * >>You cant allow to chase same right sided goals unless there is a delimiter in it
            * 
            * if you want to know why try solving a + b \cdot c + d with checking last goal only on the top of stack rather than in the entire stack
            * 
            * 
            * >>To implement operator precedence you must not allow higher precedence operators stacked over by lower precedence operators eg. \cdot cant be stacked over by +  
            * 
            */
            /*if (predictionStack[predictionStack.length - 1] === lookAhead[lookAhead.length - 1]) {
            return false;
            }*/
            //TODO check if > 0 or >= 0

            for (i = lookAhead.length - 1; i > 0; i--) {
                checkingWith = lookAhead[i];
                //TRACE
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, checkingWith + ' <> ' + predictionStack[predictionStack.length - 1], []);

                if (nameSpace.ParsingProcedures._isClosingBracket(checkingWith)) {
                    //if closing bracket is encountered means we can chase the infinite target
                    return true;
                }
                else if (predictionStack[predictionStack.length - 1] === checkingWith) {
                    return false;
                }
                else if (nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(nameSpace.ParsingProcedures._getPeekValue(predictionStack[predictionStack.length - 1])) < nameSpace.ParsingProcedures.getOperatorPrecedenceIndex(nameSpace.ParsingProcedures._getPeekValue(checkingWith))) {
                    //TRACE
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, '>>>>>>>>>>>!!!!!!>>>>>>>> REJECTING THE STACK because ' + predictionStack[predictionStack.length - 1] + ' should not be precededed by ' + checkingWith, []);
                    return false;
                }
            }
            return true;
        },


        /**
                   
        Returns precedence index of the given operator    
        
        @method getOperatorPrecedenceIndex
        @private
        @param operator{String}
        @return {Integer}
        @static
        **/
        getOperatorPrecedenceIndex: function getOperatorPrecedenceIndex(operator) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                index = nameSpace.Productions._operatorsInPrecedenceOrder.indexOf(operator);
            //switch (operator) {
            //case '+':
            //    index = 0;
            //    break;
            //case '-':
            //    index = 1;
            //    break;
            //case '\\cdot':
            //    index = 2;
            //    break;
            //case '^':
            //    index = 3;
            //    break;
            //case '!':
            //    index = 4;
            //    break;
            //case '\\%':
            //    index = 5;
            //    break;
            //default:
            //    index = -1;
            //    break;
            //}
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'checking operator precedence index for operator ' + operator + ' index is ' + index, []);
            return index;
        },

        /**
        Check if the token is same by name or by type.
        
        @method isTokenSame
        @private
        @param token{Object}
        @param tokenTypeOrName{String}
        @return {Boolean}
        @static
        **/
        isTokenSame: function isTokenSame(token, tokenTypeOrName) {
            if (token.value === tokenTypeOrName || token.type === tokenTypeOrName) {
                return true;
            }
            return false;
        },

        /**
        Simple clone string array.
        
        @method cloneStringStack
        @private
        @param fromArray{Array}
        @param toArray{Array}
        @return Void
        @static
        **/
        cloneStringStack: function cloneStringStack(fromArray, toArray) {
            for (var i = 0; i < fromArray.length; i++) {
                toArray[i] = fromArray[i];
            }
        },

        /**
        Function is used to update lookaheads when calling recursiveDescentParser recursively.   
        
        @method pushAllLookAheads
        @private
        @param lookAheadStack{Array} 
        @param prediction{Stack}
        @param pointerInPredictionStack{Integer}
        @return {Integer}
        @static
        **/
        pushAllLookAheads: function pushAllLookAheads(lookAheadStack, predictionStack, pointerInPredictionStack) {
            var count = 0, i;
            for (i = predictionStack.length - 1; i >= pointerInPredictionStack; i--) {
                count++;
                lookAheadStack.push(predictionStack[i]);
            }
            return count;
        },


        /**
        This function is used to check if the next token is compatible with the lookAheadStack    
        
        @method checkWithLookAhead
        @private
        @param token{Object}
        @param lookAheadStack {Array}
        @return {Boolean}
        @static
        **/
        checkWithLookAhead: function checkWithLookAhead(token, lookAheadStack) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                lookAheadPeek,
                isLookAheadRecursive,
                i;
            //TRACE
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, '------------------------------------------------------------------------------', []);
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.rules, 'checking token ' + token + ' from Lookahead stack ' + lookAheadStack, []);
            if (lookAheadStack === undefined) {
                return false;
            }

            /*
            * LHS is next token in queue from the INPUT
            * RHS is next predicted possible input
            * 
            * LHS is closing delimiter ),} then keep checking till u find a clear match with a non recursive term in RHS, skip all Recursive terms
            * LHS is anything other than closing delimiter and Recursive, then skip closing delimiters and keep checking till you find a clear mismatch with a non recursive term
            * 
            * 
            */

            for (i = lookAheadStack.length - 1; i >= 0; i--) {

                lookAheadPeek = nameSpace.ParsingProcedures._getPeekValue(lookAheadStack[i]);

                isLookAheadRecursive = nameSpace.ParsingProcedures.isTermInfinite(lookAheadStack[i]);

                if (lookAheadPeek === undefined) {
                    break;
                }



                if (nameSpace.ParsingProcedures._isClosingBracket(token.value)) {
                    if (isLookAheadRecursive === false) {
                        return nameSpace.ParsingProcedures.isTokenSame(token, lookAheadPeek);
                    }
                    continue;
                }

                if (nameSpace.ParsingProcedures._isClosingBracket(lookAheadPeek)) {
                    return nameSpace.ParsingProcedures.isTokenSame(token, lookAheadPeek);
                }

                if (isLookAheadRecursive) {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'checkign with recursive ' + nameSpace.ParsingProcedures._getPeekValue(lookAheadStack[i]), []);
                    if (nameSpace.ParsingProcedures.isTokenSame(token, lookAheadPeek)) {
                        return true;
                    }
                    else {
                        continue;
                    }
                }
                else {
                    nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, lookAheadStack[i] + ' is not recursive...checking normally now', []);
                    return nameSpace.ParsingProcedures.isTokenSame(token, lookAheadPeek);
                }

            }

            return false;
        },


        /**
        Checks if the passed string matches with terminal Symbol. In this project we have used only 'E' as non terminal symbol.           
            
        
        @method isNonTerminal
        @private
        @param value{String}
        @return {Boolean}
        @static
        **/
        isNonTerminal: function isNonTerminal(value) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'checking ' + value, []);
            return (value === 'E');
        },


        _isSpecialTerminal: function _isSpecialTerminal(type) {
            if (type === 'var' || type === 'const' || type === 'digit') {
                return true;
            }
            else {
                return false;
            }
        },

        /**
        Get prediction stack that matches the token.    
        
        @method getPredictionStacksForToken
        @private
        @param token{Object}
        @return {Array}
        @static
        **/
        getPredictionStacksForToken: function getPredictionStacksForToken(token, nodeName, isRange) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                nodeObjects,
                validRules,
                tokenValue;
            if (nameSpace.ParsingProcedures._isSpecialTerminal(token.type)) {
                tokenValue = token.type;
            }
            else {
                tokenValue = token.value;
            }
            //TRACE
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'token value is ' + tokenValue, []);
            if (isRange) {
                nodeObjects = nameSpace.RangeProductionRules.rangeRulesTable[nodeName];
            }
            else {
                nodeObjects = nameSpace.ParsingProcedures._productions.productionTable[nodeName];
            }
            //TRACE
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'node objects ' + nodeObjects, []);
            validRules = nodeObjects[tokenValue];
            //TRACE
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'valid rules ' + validRules, []);
            return validRules;
        },

        /**
        Records bracket stack for parsing.     
        
        @method recordBracket
        @private
        @param bracketStack {Array}
        @param currentBracket{String}
        @return Void
        @static
        **/
        recordBracket: function recordBracket(bracketStack, currentBracket) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                onTop;
            if (!nameSpace.ParsingProcedures._isValidBracket(currentBracket)) {
                return;
            }
            if (bracketStack.length === 0) {
                bracketStack.push(currentBracket);
                //TRACE
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Updating bracket stack ' + bracketStack, []);
                return;
            }
            onTop = bracketStack[bracketStack.length - 1];
            if (nameSpace.ParsingProcedures._isOppositeBracket(onTop, currentBracket)) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Opposites found ' + onTop + '<>' + currentBracket, []);
                bracketStack.pop();
            }
            else {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'pushing in stack ' + currentBracket, []);
                bracketStack.push(currentBracket);
            }

            //TRACE
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Updating bracket stack ' + bracketStack, []);
        },

        /**
        Checks if the bracket is a valid opening or closing bracket.           
        
        @method _isValidBracket
        @private 
        @param bracket{String}
        @return {Boolean}
        @static 
        **/
        _isValidBracket: function _isValidBracket(bracket) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            return (nameSpace.ParsingProcedures._validOpeningBrackets.indexOf(bracket) !== -1 || nameSpace.ParsingProcedures._validClosingBrackets.indexOf(bracket) !== -1);
        },



        /**
        Checks if the bracket is an opening bracket.
        
        @method _isOpeningBracket
        @private
        @param bracket{String}
        @return {Boolean}
        @static
        **/
        _isOpeningBracket: function _isOpeningBracket(bracket) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            return nameSpace.ParsingProcedures._validOpeningBrackets.indexOf(bracket) !== -1;
        },

        /**
        Checks if the bracket is an closing bracket.
        
        @method _isClosingBracket
        @private
        @param bracket{String}
        @return {Boolean}
        @static
        **/
        _isClosingBracket: function _isClosingBracket(bracket) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            return nameSpace.ParsingProcedures._validClosingBrackets.indexOf(bracket) !== -1;
        },

        /**
        Checks if the toCheckFor is opposite of the bracket toCheckWith. eg { X }; ( X )
        
        @method _isOppositeBracket
        @private
        @param toCheckFor{String}
        @param toCheckWith{String}
        @return {Boolean}
        @static
        **/
        _isOppositeBracket: function _isOppositeBracket(toCheckFor, toCheckWith) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                index;
            if (nameSpace.ParsingProcedures._isValidBracket(toCheckFor) === false || nameSpace.ParsingProcedures._isValidBracket(toCheckWith) === false) {
                nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'Wrong bracket Pair ' + toCheckFor + ' <> ' + toCheckWith, []);
                return;
            }

            if (nameSpace.ParsingProcedures._isOpeningBracket(toCheckFor)) {
                index = nameSpace.ParsingProcedures._validOpeningBrackets.indexOf(toCheckFor);
                return nameSpace.ParsingProcedures._validClosingBrackets[index] === toCheckWith;
            }
            else {
                index = nameSpace.ParsingProcedures._validClosingBrackets.indexOf(toCheckFor);
                return nameSpace.ParsingProcedures._validOpeningBrackets[index] === toCheckWith;
            }

        },

        //canCloseBracket: function canCloseBracket(toCheckFor, toCheckWith) {
        //    /*var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
        //    if (nameSpace.ParsingProcedures._isClosingBracket(toCheckFor) !== false && nameSpace.ParsingProcedures._isClosingBracket(toCheckWith) !== true) {
        //        console.log('Wrong bracket Pair ' + toCheckFor + ' <> ' + toCheckWith);
        //        return;
        //    }
        //    if (toCheckFor === '(') {
        //        return toCheckWith === ')';
        //    }
        //    if (toCheckFor === '{') {
        //        return toCheckWith === '}';
        //    }
        //    */

        //},

        //_isClosingBracket: function _isClosingBracket(currentBracket) {
        //    return (currentBracket === '}' || currentBracket === ')');
        //},


        /**
        Get the stack code for the ongoing parsing.
        
        @method getStackCode
        @private
        @param bracketsStack{Array}
        @return {Integer}
        @static
        **/
        getStackCode: function getStackCode(bracketsStack) {

            return bracketsStack.length;
        }
    });

    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.RangeProductionRules = Backbone.Model.extend({}, {
        rangeRules: null,
        rangeRulesTable: null,
        solution: null,

        generateRules: function generateRules() {
            var nodes = ['var', 'digit'],
                seperators = ['\\le', '\\ge', '<', '>'],
                possibleSeperatorCombinations = {
                    '\\le': '<',
                    '\\ge': '>',
                },
                nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                //nodeCounter,
                //nodesLength = nodes.length,
                seperatorsCounter,
                //innerSeperatorsCounter,
                currentSeperator,
                seperatorsLength = seperators.length,
                rule = null,
                possibleCombinationSeperator;
            //sequenceString;
            nameSpace.RangeProductionRules.rangeRulesTable = {
                E: {
                    'var': [],
                    'digit': []
                }
            };
            nameSpace.RangeProductionRules.rangeRules = [];
            nameSpace.RangeProductionRules.solution = [];

            for (seperatorsCounter = 0; seperatorsCounter < seperatorsLength; seperatorsCounter++) {
                currentSeperator = seperators[seperatorsCounter];

                // rule for var 'seperator' digit
                rule = [];
                rule.push(nodes[0]);
                rule.push(currentSeperator);
                rule.push(nodes[1]);
                nameSpace.RangeProductionRules._createAndPushRule(rule);
                nameSpace.RangeProductionRules.solution.push(nameSpace.RangeProductionRules._setSequenceRules(currentSeperator, 1, true));

                // rule for digit 'seperator' var
                rule = [];
                rule.push(nodes[1]);
                rule.push(currentSeperator);
                rule.push(nodes[0]);
                nameSpace.RangeProductionRules._createAndPushRule(rule);
                nameSpace.RangeProductionRules.solution.push(nameSpace.RangeProductionRules._setSequenceRules(currentSeperator, 1));

                // rule for digit 'seperator' var 'seperator' digit
                nameSpace.RangeProductionRules._getRulesForSeperatorCombination(currentSeperator);

                if (possibleSeperatorCombinations[currentSeperator] !== undefined) {
                    possibleCombinationSeperator = possibleSeperatorCombinations[currentSeperator];
                    nameSpace.RangeProductionRules._getRulesForSeperatorCombination(currentSeperator, possibleCombinationSeperator);
                    nameSpace.RangeProductionRules._getRulesForSeperatorCombination(possibleCombinationSeperator, currentSeperator);
                }
            }
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'rules :: ');
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, nameSpace.RangeProductionRules.rangeRules);
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, 'rules table :: ');
            nameSpace.Parser._showConsole(nameSpace.Parser._debugFlag.common, nameSpace.RangeProductionRules.rangeRulesTable);

        },

        _setSequenceRules: function _setSequenceRules(seperator, seperatorIndex, isVarFirst) {
            var sequenceString;
            switch (seperator) {
                case '\\le':
                    if (seperatorIndex === 1) {
                        if (isVarFirst) {
                            sequenceString = 'var.' + (seperatorIndex - 1) + ' max.equal.' + (seperatorIndex + 1);
                        }
                        else {
                            sequenceString = 'min.equal.0 var.' + (seperatorIndex + 1);
                        }
                    }
                    else {
                        sequenceString = 'max.equal.' + (seperatorIndex + 1);
                    }
                    break;
                case '\\ge':
                    if (seperatorIndex === 1) {
                        if (isVarFirst) {
                            sequenceString = 'var.' + (seperatorIndex - 1) + ' min.equal.' + (seperatorIndex + 1);
                        }
                        else {
                            sequenceString = 'max.equal.0 var.' + (seperatorIndex + 1);
                        }
                    }
                    else {
                        sequenceString = 'min.equal.' + (seperatorIndex + 1);
                    }
                    break;
                case '<':
                    if (seperatorIndex === 1) {
                        if (isVarFirst) {
                            sequenceString = 'var.' + (seperatorIndex - 1) + ' max.' + (seperatorIndex + 1);
                        }
                        else {
                            sequenceString = 'min.0 var.' + (seperatorIndex + 1);
                        }
                    }
                    else {
                        sequenceString = 'max.' + (seperatorIndex + 1);
                    }
                    break;
                case '>':
                    if (seperatorIndex === 1) {
                        if (isVarFirst) {
                            sequenceString = 'var.' + (seperatorIndex - 1) + ' min.' + (seperatorIndex + 1);
                        }
                        else {
                            sequenceString = 'max.0 var.' + (seperatorIndex + 1);
                        }
                    }
                    else {
                        sequenceString = 'min.' + (seperatorIndex + 1);
                    }
                    break;
            }
            return sequenceString;
        },

        _getRulesForSeperatorCombination: function _getRulesForSeperatorCombination(seperator1, seperator2) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine,
                rule = ['digit', 'var', 'digit'],
                sequenceString;

            if (seperator2 === undefined) {
                seperator2 = seperator1;
            }

            rule.splice(1, 0, seperator1);
            rule.splice(3, 0, seperator2);
            nameSpace.RangeProductionRules._createAndPushRule(rule);
            sequenceString = nameSpace.RangeProductionRules._setSequenceRules(seperator1, 1);
            sequenceString += ' ' + nameSpace.RangeProductionRules._setSequenceRules(seperator2, 3);
            nameSpace.RangeProductionRules.solution.push(sequenceString);
        },

        _createAndPushRule: function _createAndPushRule(rule) {
            var nameSpace = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine;
            nameSpace.RangeProductionRules.rangeRules.push(rule);
            nameSpace.RangeProductionRules.rangeRulesTable.E[rule[0]].push(nameSpace.RangeProductionRules.rangeRules.length - 1);
        }
    });

    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.EquationEnums = Backbone.Model.extend({}, {
        ERROR_TOO_MANY_FREE_VARIABLES: 'Too many free variables.',
        ERROR_CONSTANTS_NOT_DEFINED: 'Constants are not defined',
        ERROR_COMPLICATED: 'Its complicated',
        ERROR_SYNTAX_ERROR: 'Equation has syntax error',
        ERROR_VARIABLE_HAS_TO_BE_QUADRATIC: 'Atleast one variable has to be quadratic'
    });

}(window.MathInteractives));