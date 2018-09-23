/* globals _, window */

(function(MathUtilities) {
    'use strict';

    /**
    Class to create equationData object to be used for plotting and parsing

    @class MathUtilities.Components.EquationEngine
    **/
    MathUtilities.Components.EquationEngine.Models.EquationData = Backbone.Model.extend({

        /**
            Units that are used to for calculations and parsing of equation

            @property _units
            @type {Object}
            @public
        **/
        "_units": null,

        /**
            Equation Latex that is to be parsed

            @property _latex
            @type {String}
            @public
        **/
        "_latex": null,

        "_style": null,

        "_plotData": null,

        "_parserData": null,

        "_error": null,

        "_pointsData": null,

        /**
            The value for the equation analysis information generated

            @property _analysis
            @type {Object}
            @public
        **/
        "_analysis": null,

        /**
            This value when set will indicate that equationData will act as container for the values. The equation will not be processed and the data of FunctionCode and plot is fed from outside. This flag is used in Dynamic Geometry Tool.
            @property _blind
            @type {Object}
            @public
        **/
        "_blind": false,

        "_autonomous": void 0,

        /**
            The type of equation that is set while parsing the equation.
            eg. linear,quadratic,error,expression, polygon, point, plot

            @property _specie
            @type {String}
            @public
        **/
        "_specie": null,

        /**
            If someone wants to use equation as part of their data structure then this can be used as pointer to that data structure. Used in DGT engine.

            @property _parent
            @type {String}
            @public
        **/
        "_parent": void 0,

        /**
            Will be array if two or more solutions, will be number if one, will be point if a point

            @property _solution
            @type {Number|Array}
            @public
        **/
        "_solution": null,
        /**
           Saves profiling data . Used for debugging purpose. Saves values in milliseconds

            @property _debugging
            @type {Number}
            @public
        **/
        "_debugging": null,

        "_id": null,

        /**

        Indicates whether the equationData is the saved data or new data.
            @property _isSaveRestoreData
            @type {Boolean}
            @public
        */
        "_isSaveRestoreData": false,

        /**

            Sets flags for special equation processing directives.
            Currently available directives
                FDFlagMethod : calculator*, graphing (based on tool name)

                *is default value


            @public
            @constant
        **/
        "_directives": void 0,

        "_prevLatex": null,

        "_constants": null,

        /**

            Constructor function called on creation of new instance of EquationData model

            @private
            @method initialize
        **/
        "initialize": function() {
            var EquationEngine = MathUtilities.Components.EquationEngine.Models;
            this._units = {
                "angle": 'rad'
            };
            this._debugging = {
                "profiles": []
            };
            this._autonomous = false;
            this._specie = 'error';
            this._id = EquationEngine.MathFunctions.getGUID();
            this._analysis = new EquationEngine.EquationAnalysis();
            this._style = new EquationEngine.EquationStyleData();
            this._plotData = new EquationEngine.PlotData();

            this._parserData = new EquationEngine.ParserData();

            this._error = new EquationEngine.EquationErrorData();

            this._pointsData = new EquationEngine.EquationPointsData();
            this._directives = {
                "FDFlagMethod": "calculator",
                "definedConstant": null,
                "range": null,
                "parentEquation": null,
                "hasHollowPointEquation": false,
                "criticalPointsFlags": {
                    "hasMaximaMinima": false,
                    "hasDiscontinuousPoints": false,
                    "hasIntercepts": false,
                    "hasIntersections": false
                },
                "displayEquation": null,
                "isTableEquation": false,
                //as instructions are added processing instructions constant will change
                "processingInstructions": 1,
                "repositionOnDrag": true,
                "saveInterceptsInEqn": false,
                "hasCoefficient": false,
                "plotInEqualities": true,
                "solveOnlyY": false,
                "_supportParamVar": null,
                "doNotAllowYRange": false,
                "equationDataType": null,
                "tableName": null,
                "rangeAccText": [],
                "residualColumnNo": null,
                "residualColumnType": null,
                "dependentColumnNo": null
            };
        },

        /**

            Returns equation String

            @public
            @method toString
            @return {String} Equation
        **/
        "toString": function() {
            return this.getLatex();
        },


        /**

            Sets latex string in the equationData object and triggers 'change-equation' event

            @public
            @method setLatex
            @param equationLatex{String} The latex string to be set as equation
            @param suppressEvent{boolean} flag to suppress event to be triggered
            @return void
        **/
        "setLatex": function(latex, suppressEvent) {
            this._latex = latex;
            if (!suppressEvent) {
                this.trigger('change-equation');
            }
        },
        "getLatex": function() {
            return this._latex;
        },
        "getTableName": function() {
            return this._directives.tableName;
        },
        "setTableName": function(tableName) {
            this._directives.tableName = tableName;
        },
        "getRangeAccText": function() {
            return this._directives.rangeAccText;
        },
        "setRangeAccText": function(rangeAccText) {
            this._directives.rangeAccText = rangeAccText;
        },
        "getEquationDataType": function() {
            return this._directives.equationDataType;
        },
        "setEquationDataType": function(type) {
            this._directives.equationDataType = type;
        },
        "getResidualColumnNo": function() {
            return this._analysis.get('residualColumnNo');
        },
        "getDependentColumnNo": function() {
            return this._analysis.get('dependentColumnNo');
        },
        "getResidualType": function() {
            return this._analysis.get('residualType');
        },
        "setResidualType": function(type) {
            this._analysis.set('residualType', type);
        },
        "setResidualColumnNo": function(colNo) {
            this._analysis.set('residualColumnNo', colNo);
        },
        "setDependentColumnNo": function(colNo) {
            this._analysis.set('dependentColumnNo', colNo);
        },
        "getSolveOnlyY": function() {
            return this._directives.solveOnlyY;
        },
        "setSolveOnlyY": function(flag) {
            this._directives.solveOnlyY = flag;
        },
        "getDoNotAllowYRange": function getDoNotAllowYRange() {
            return this._directives.doNotAllowYRange;
        },
        "setDoNotAllowYRange": function setDoNotAllowYRange(flag) {
            this._directives.doNotAllowYRange = flag;
        },
        "getPlotInEqualities": function() {
            return this._directives.plotInEqualities;
        },
        "setPlotInEqualities": function(flag) {
            this._directives.plotInEqualities = flag;
        },
        "getHasMaximaMinima": function() {
            return this._directives.criticalPointsFlags.hasMaximaMinima;
        },
        "setHasMaximaMinima": function(flag) {
            this._directives.criticalPointsFlags.hasMaximaMinima = flag;
        },
        "getHasIntersections": function() {
            return this._directives.criticalPointsFlags.hasIntersections;
        },
        "setHasIntersections": function(flag) {
            this._directives.criticalPointsFlags.hasIntersections = flag;
        },
        "getHasDiscontinuousPoints": function() {
            return this._directives.criticalPointsFlags.hasDiscontinuousPoints;
        },
        "setHasDiscontinuousPoints": function(flag) {
            this._directives.criticalPointsFlags.hasDiscontinuousPoints = flag;
        },
        "getHasIntercepts": function() {
            return this._directives.criticalPointsFlags.hasIntercepts;
        },
        "setHasIntercepts": function(flag) {
            this._directives.criticalPointsFlags.hasIntercepts = flag;
        },
        "getSaveIntercepts": function() {
            return this._directives.saveInterceptsInEqn;
        },
        "setSaveIntercepts": function(flag) {
            this._directives.saveInterceptsInEqn = flag;
        },
        "getHasHollowPointEquation": function() {
            return this._directives.hasHollowPointEquation;
        },
        "setHasHollowPointEquation": function(flag) {
            this._directives.hasHollowPointEquation = flag;
        },
        "getDisplayEquation": function() {
            return this._directives.displayEquation;
        },
        "setDisplayEquation": function(displayEqn) {
            this._directives.displayEquation = displayEqn;
        },
        "setSolutionLatex": function(solutionLatex) {
            this._directives.solutionLatex = solutionLatex;
        },
        "getSolutionLatex": function() {
            return this._directives.solutionLatex;
        },

        "getAccText": function() {
            return this._analysis.get('_accText');
        },

        "setAccText": function(accText) {
            this._analysis.set('_accText', accText);
        },

        "addToAccText": function(accText) {
            this._analysis.addToAccText(accText);
        },

        "getFreeVars": function() {
            return this._analysis.get('_freeVars');
        },
        "setInterceptPoints": function(points) {
            this._analysis.set('_interceptPoints', points);
        },
        "getInterceptPoints": function() {
            return this._analysis.get('_interceptPoints');
        },
        "setFreeVars": function(freeVars) {
            this._analysis.set('_freeVars', freeVars);
        },

        "getFunctionVariable": function() {
            return this._analysis.get('_functionVariable');
        },

        "setFunctionVariable": function(functionVariable) {
            this._analysis.set('_functionVariable', functionVariable);
        },

        "getParamVariable": function() {
            return this._analysis.get('_paramVariable');
        },

        "setParamVariable": function(paramVariable) {
            this._analysis.set('_paramVariable', paramVariable);
        },

        "setFdFlag": function(fdFlag) {
            this._analysis.set('_FDFlag', fdFlag);
        },

        "getFdFlag": function() {
            return this._analysis.get('_FDFlag');
        },
        "getSimplifiedFractionLatex": function() {
            return this._analysis.get('_simplifiedFractionLatex');
        },
        "setSimplifiedFractionLatex": function(latex) {
            this._analysis.set('_simplifiedFractionLatex', latex);
        },

        "getLeftInequalityRoot": function() {
            return this._parserData.get('_leftInequalityRoot');
        },

        "getRightInequalityRoot": function() {
            return this._parserData.get('_rightInequalityRoot');
        },
        "setLeftInequalityRoot": function(leftInequalityRoot) {
            this._parserData.set('_leftInequalityRoot', leftInequalityRoot);
        },

        "setRightInequalityRoot": function(rightInequalityRoot) {
            this._parserData.set('_rightInequalityRoot', rightInequalityRoot);
        },

        "getLeftRoot": function() {
            return this._parserData.get('_leftRoot');
        },

        "getRightRoot": function() {
            return this._parserData.get('_rightRoot');
        },

        "setLeftRoot": function(leftRoot) {
            return this._parserData.set('_leftRoot', leftRoot);
        },

        "setRightRoot": function(rightRoot) {
            return this._parserData.set('_rightRoot', rightRoot);
        },

        "setFunctionCode": function(functionCode) {
            this._analysis.set('_functionCode', functionCode);
        },
        "setTransposeFunctionCode": function(transposeFunctionCode) {
            this._analysis.set('_transposeFunctionCode', transposeFunctionCode);
        },
        "setFunctionCodeA": function(functionCodeA) {
            this._analysis.set('_functionCodeA', functionCodeA);
        },

        "setFunctionCodeB": function(functionCodeB) {
            this._analysis.set('_functionCodeB', functionCodeB);
        },

        "setFunctionCodeC": function(functionCodeC) {
            this._analysis.set('_functionCodeC', functionCodeC);
        },

        "setEngine": function(engine) {
            this._analysis.set('_engine', engine);
        },

        "getEngine": function() {
            return this._analysis.get('_engine');
        },

        "getFunctionCode": function() {
            return this._analysis.get('_functionCode');
        },
        "getTransposeFunctionCode": function() {
            return this._analysis.get('_transposeFunctionCode');
        },
        "getFunctionCodeA": function() {
            return this._analysis.get('_functionCodeA');
        },

        "getFunctionCodeB": function() {
            return this._analysis.get('_functionCodeB');
        },

        "getFunctionCodeC": function() {
            return this._analysis.get('_functionCodeC');
        },
        "getA": function() {
            return this._analysis.get('_A');
        },

        "getB": function() {
            return this._analysis.get('_B');
        },

        "getC": function() {
            return this._analysis.get('_C');
        },
        "setA": function(a) {
            this._analysis.set('_A', a);
        },

        "setB": function(b) {
            this._analysis.set('_B', b);
        },

        "setC": function(c) {
            this._analysis.set('_C', c);
        },

        "getCoefficients": function() {
            return this._analysis.get('_coefficients');
        },
        "setCoefficients": function(coeffObj) {
            this._analysis.set('_coefficients', coeffObj);
        },
        "getConstantTerm": function() {
            return this._analysis.get('_constantTerm');
        },
        "setConstantTerm": function(number) {
            this._analysis.set('_constantTerm', number);
        },
        "getParamVariableOrder": function() {
            return this._analysis.get('_paramVariableOrder');
        },

        "setParamVariableOrder": function(paramVariableOrder) {
            this._analysis.set('_paramVariableOrder', paramVariableOrder);
        },

        "getLeftEquationParameters": function() {
            return this._parserData.get('_leftExpression').equationParameters;
        },

        "getRightEquationParameters": function() {
            return this._parserData.get('_rightExpression').equationParameters;
        },

        "getAllFunctions": function() {
            var returnArray,
                leftFunctions = this.getLeftEquationParameters().functionsList,
                rightFunctions = this.getRightEquationParameters().functionsList;

            returnArray = _.union(leftFunctions, rightFunctions);
            return returnArray;
        },

        "getAllConstants": function() {
            var returnArray,
                leftConstants = this.getLeftEquationParameters().constantsList,
                rightConstants = this.getRightEquationParameters().constantsList;

            returnArray = _.union(leftConstants, rightConstants);
            return returnArray;
        },

        "setPlot": function(plot) {
            this._plotData.set('_plot', plot);
        },

        "getPlot": function() {
            return this._plotData.get('_plot');
        },

        "getBestFit": function() {
            return this._plotData.get('_bestFit');
        },

        "setBestFit": function(bestFit) {
            return this._plotData.set('_bestFit', bestFit);
        },

        "getPreviousThickness": function() {
            return this._style.get('_previousThickness');
        },

        "setPreviousThickness": function(thickness) {
            return this._style.set('_previousThickness', thickness);
        },

        "setInEqualityType": function(inEqualityType) {
            this._analysis.setInEqualityType(inEqualityType);
        },

        "getInEqualityType": function() {
            return this._analysis.get('_inEquatlityType');
        },

        "getInEqualityPlots": function() {
            return this._pointsData.get('_inEqualityPlots');
        },
        "setInEqualityPlots": function(inEqualityPlots) {
            this._pointsData.set('_inEqualityPlots', inEqualityPlots);
        },

        "setInEqualititesPathGroup": function(group) {
            this._plotData.set('_inEqualititesPathGroup', group);
        },

        "getInEqualititesPathGroup": function() {
            return this._plotData.get('_inEqualititesPathGroup');
        },
        "getDefinitionName": function() {
            return this._directives.definitionName;
        },
        "setDefinitionName": function(name) {
            this._directives.definitionName = name;
        },

        "getSupportedParamVar": function() {
            return this._directives._supportParamVar;
        },

        "setSupportedParamVar": function(variable) {
            this._directives._supportParamVar = variable;
        },
        "getDefinitionType": function() {
            return this._directives.definitionType;
        },
        "setDefinitionType": function(type) {
            this._directives.definitionType = type;
        },
        "getParentEquation": function() {
            return this._directives.parentEquation;
        },
        "setParentEquation": function(equationData) {
            this._directives.parentEquation = equationData;
        },
        "getRepositionOnDrag": function() {
            return this._directives.repositionOnDrag;
        },
        "setRepositionOnDrag": function(equationData) {
            this._directives.repositionOnDrag = equationData;
        },

        "getPossibleFunctionVariablesPreference": function() {
            return this._analysis.get('_possibleFunctionVariablesPreference');
        },

        "setPossibleFunctionVariablesPreference": function(possibleFunctionVariablesPreference) {
            this._analysis.set('_possibleFunctionVariablesPreference', possibleFunctionVariablesPreference);
        },

        "reverseInequality": function() {
            switch (this.getInEqualityType()) {
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
            @param suppressEvent{boolean} flag to suppress event to be triggered
            @return void
        **/
        "setConstants": function(constants, suppressEvent) {
            this._constants = constants;
            if (!suppressEvent) {
                this.trigger('change-constants');
            }
        },

        "getConstants": function() {
            return this._constants;
        },

        "setCustomFunctions": function(functions) {
            this._customFunctions = functions;
        },

        "getCustomFunctions": function() {
            return this._customFunctions;
        },
        "getFunctions": function() {
            return this._functions;
        },
        "setFunctions": function(functions) {
            this._functions = functions;
        },
        "getProfiles": function() {
            return this._debugging.profiles;
        },

        "getEquationParameters": function() {
            return this._analysis.getEquationParameters();
        },

        "setCanBeSolved": function(canBeSolved) {
            this._analysis.set('_canBeSolved', canBeSolved);
        },

        "isCanBeSolved": function() {
            return this._analysis.get('_canBeSolved');
        },

        "setPivot": function(pivot) {
            this._analysis.set('_pivot', pivot);
        },

        "getPivot": function() {
            return this._analysis.get('_pivot');
        },
        "getPostProcessFunctionCode": function() {
            return this._analysis.get('_postProcessFunction');
        },
        "setPostProcessFunctionCode": function(functionCode) {
            this._analysis.set('_postProcessFunction', functionCode);
        },
        "setErrorCode": function(errorCode) {
            this._error.set('_errorCode', errorCode);
        },

        "getErrorCode": function() {
            return this._error.get('_errorCode');
        },

        "setErrorData": function(errorData) {
            this._error.set('_errorData', errorData);
        },

        "getErrorData": function() {
            return this._error.get('_errorData');
        },

        "setErrorString": function(errorString) {
            this._error.set('_errorString', errorString);
        },

        "getErrorString": function() {
            return this._error.get('_errorString');
        },

        "getLeftExpression": function() {
            return this._parserData.get('_leftExpression');
        },

        "getRightExpression": function() {
            return this._parserData.get('_rightExpression');
        },

        "getRange": function() {
            return this._directives.range;
        },

        "setRange": function(range) {
            this._directives.range = range;
        },

        /**

            Sets Units value for the units object of equationData object

            @public
            @method setUnits
            @param units{Object} The units object for the current equation
            @return void
        **/
        "setUnits": function(units) {
            var unit = null;
            for (unit in units) {
                this._units[unit] = units[unit];
            }
        },
        "getUnits": function() {
            return this._units;
        },

        "setAnalysis": function(analysis) {
            this._analysis = analysis;
        },
        "getAnalysis": function() {
            return this._analysis;
        },
        "setSpecie": function(specie) {
            this._specie = specie;
        },
        "getSpecie": function() {
            return this._specie;
        },
        "setBlind": function(blind) {
            this._blind = blind;
        },
        "getBlind": function() {
            return this._blind;
        },
        "setAutonomous": function(autonomous) {
            this._autonomous = autonomous;
        },
        "getAutonomous": function() {
            return this._autonomous;
        },
        "setParent": function(parent) {
            this._parent = parent;
        },
        "getParent": function() {
            return this._parent;
        },
        "setSolution": function(solution) {
            this._solution = solution;
        },
        "getSolution": function() {
            return this._solution;
        },
        "setDebugging": function(debugging) {
            this._debugging = debugging;
        },
        "getDebugging": function() {
            return this._debugging;
        },
        "setId": function(id) {
            this._id = id;
        },
        "getId": function() {
            return this._id;
        },
        "setIsSaveRestoreData": function(isSaveRestoreData) {
            this._isSaveRestoreData = isSaveRestoreData;
        },
        "getIsSaveRestoreData": function() {
            return this._isSaveRestoreData;
        },
        "setDirectives": function(directives) {
            this._directives = directives;
        },
        "getDirectives": function() {
            return this._directives;
        },

        "setStyle": function(style) {
            this._style = style;
        },
        "getStyle": function() {
            return this._style;
        },

        "setPlotData": function(plotData) {
            this._plotData = plotData;
        },
        "getPlotData": function() {
            return this._plotData;
        },

        "setParserData": function(parserData) {
            this._parserData = parserData;
        },
        "getParserData": function() {
            return this._parserData;
        },

        "setError": function(error) {
            this._error = error;
        },
        "getError": function() {
            return this._error;
        },

        "setPointsData": function(points) {
            this._pointsData = points;
        },
        "getPointsData": function() {
            return this._pointsData;
        },
        "getCid": function() {
            return this.cid;
        },
        "setColor": function(color) {
            if (color) {
                this._style.set('_color', color);
            }
        },

        "setFillColor": function(color) {
            this._style.set('_fillColor', color);
        },

        "setInEqualityOpacity": function(opacity) {
            this._style.set('_inEqualityOpacity', opacity);
        },
        "setIsFilled": function(isFilled) {
            this._style.set('_isFilled', isFilled);
        },
        "getColor": function() {
            return this._style.get('_color');
        },

        "getFillColor": function() {
            return this._style.get('_fillColor');
        },

        "setThickness": function(thickness) {
            this._style.set('_thickness', thickness);
        },
        "getThickness": function() {
            return this._style.get('_thickness');
        },
        "setOpacity": function(opacity) {
            this._style.set('_opacity', opacity);
        },
        "getOpacity": function() {
            return this._style.get('_opacity');
        },
        "setDashArray": function(dash) {
            this._style.set('_dashArray', dash);
        },
        "getDashArray": function() {
            return this._style.get('_dashArray');
        },
        "getInequalityDashArray": function() {
            return this._style.get('_inqualityDashArray');
        },
        "setInequalityDashArray": function(dash) {
            this._style.set('_inqualityDashArray', dash);
        },
        "setVisible": function(visibility) {
            this._style.setVisible(visibility);
        },
        "getVisible": function() {
            return this._style.get('_visible');
        },
        "getInEqualityOpacity": function() {
            return this._style.get('_inEqualityOpacity');
        },
        "getIsFilled": function() {
            return this._style.get('_isFilled');
        },
        "setDraggable": function(draggable) {
            this._plotData.set('_draggable', draggable);
        },
        "isDraggable": function() {
            return this._plotData.get('_draggable');
        },
        "setExtraThickness": function(extraThickness) {
            this._plotData.set('_extraThickness', extraThickness);
        },
        "hasExtraThickness": function() {
            return this._plotData.get('_extraThickness');
        },
        "setDragHitThickness": function(thickness) {
            this._style.set('_dragHitThickness', thickness);
        },
        "getDragHitThickness": function() {
            return this._style.get('_dragHitThickness');
        },
        "getDragHitColor": function() {
            return this._style.get('_dragHitColor');
        },
        "setDragHitColor": function(newColor) {
            return this._style.set('_dragHitColor', newColor);
        },
        "getDragHitAlpha": function() {
            return this._style.get('_dragHitAlpha');
        },
        "setDragHitAlpha": function(dragHitAlpha) {
            this._style.set('_dragHitAlpha', dragHitAlpha);
        },
        "getLocus": function() {
            return this._plotData.get('_locus');
        },
        "getPointsGroup": function() {
            return this._plotData.get('_pointsGroup');
        },
        "setPointsGroup": function(group) {
            this._plotData.set('_pointsGroup', group);
        },
        "setLocus": function(locus) {
            this._plotData.set('_locus', locus);
        },
        "setLabelData": function(labelData) {
            this._plotData.set('_labelData', labelData);
        },
        "getLabelData": function() {
            return this._plotData.get('_labelData');
        },

        "getPathGroup": function() {
            return this._plotData.get('_pathGroup');
        },
        "setPathGroup": function(group) {
            this._plotData.set('_pathGroup', group);
        },

        "getRaster": function() {
            return this._plotData.get('_raster');
        },

        "setRaster": function(raster) {
            this._plotData.set('_raster', raster);
        },

        "getArr": function() {
            return this._pointsData.get('_arr');
        },
        "setArr": function(leftArray) {
            this._pointsData.set('_arr', leftArray);
        },

        "getCurveMinima": function() {
            return this._pointsData.get('_curveMinima');
        },

        "setCurveMinima": function(pt) {
            this._pointsData.set('_curveMinima', pt);
        },

        "getCurveMaxima": function() {
            return this._pointsData.get('_curveMaxima');
        },

        "setCurveMaxima": function(pt) {
            this._pointsData.set('_curveMaxima', pt);
        },

        "getLeftArray": function() {
            return this._pointsData.get('_leftArray');
        },
        "setLeftArray": function(leftArray) {
            this._pointsData.set('_leftArray', leftArray);
        },
        "getRightArray": function() {
            return this._pointsData.get('_rightArray');
        },
        "setRightArray": function(rightArray) {
            this._pointsData.set('_rightArray', rightArray);
        },


        "getPoints": function() {
            return this._pointsData.get('_points');
        },
        "setPoints": function(points) {
            this._pointsData.set('_points', points);
        },

        "getRayPolygon": function() {
            return this._plotData.get('_rayPolygon');
        },
        "setRayPolygon": function(rayPolygon) {
            this._plotData.set('_rayPolygon', rayPolygon);
        },
        "setClosedPolygon": function(isClosed) {
            this._style.set('_closedPolygon', isClosed);
        },
        "isClosedPolygon": function() {
            return this._style.get('_closedPolygon');
        },
        "setSmoothPolygon": function(isSmooth) {
            this._style.set('_smoothPolygon', isSmooth);
        },
        "isSmoothPolygon": function() {
            return this._style.get('_smoothPolygon');
        },
        "getRhsAuto": function() {
            return this._analysis.get('_rhsAuto');
        },

        "setRhsAuto": function(rhsAuto) {
            this._analysis.set('_rhsAuto', rhsAuto);
        },
        "getPlotSessionCount": function() {
            return this._plotData.get('_plotSessionCount');
        },
        "setPlotSessionCount": function(plotSessionCount) {
            this._plotData.set('_plotSessionCount', plotSessionCount);
        },

        "getPointVisibility": function() {
            return this._style.get('_visible').point;
        },

        "getCurveVisibility": function() {
            return this._style.get('_visible').curve;
        },

        "setPointVisibility": function(visibility) {
            this._style.get('_visible').point = visibility;
        },

        "setCurveVisibility": function(visibility) {
            this._style.get('_visible').curve = visibility;
        },
        "getCriticalPoints": function() {
            return this._pointsData.get('_criticalPoints');
        },
        "setCriticalPoints": function(criticalPoints) {
            this._pointsData.set('_criticalPoints', criticalPoints);
        },
        "getInterceptPlotPoints": function() {
            return this._pointsData.get('_interceptPlotPoints');
        },
        "setInterceptPlotPoints": function(interceptPoints) {
            this._pointsData.set('_interceptPlotPoints', interceptPoints);
        },
        "getHollowPoints": function() {
            return this._pointsData.get('_hollowPoints');
        },
        "setHollowPoints": function(_hollowPoints) {
            this._pointsData.set('_hollowPoints', _hollowPoints);
        },
        "getDiscontinuousPoints": function() {
            return this._pointsData.get('_discontinuousPoints');
        },
        "setDiscontinuousPoints": function(_discontinuousPoints) {
            this._pointsData.set('_discontinuousPoints', _discontinuousPoints);
        },
        "getIntersectionPoints": function() {
            return this._pointsData.get('_intersectionPoints');
        },
        "setIntersectionPoints": function(intersectionPoints) {
            this._pointsData.set('_intersectionPoints', intersectionPoints);
        },
        "getStyleType": function() {
            return this.styleType;
        },
        "setStyleType": function(style) {
            this.styleType = style;
        },
        "getIsTableEquation": function() {
            return this._directives.isTableEquation;
        },
        "setIsTableEquation": function(flag) {
            this._directives.isTableEquation = flag;
        },
        "getHasCoefficient": function() {
            return this._directives.hasCoefficient;
        },
        "setHasCoefficient": function(flag) {
            this._directives.hasCoefficient = flag;
        },
        "setPrevLatex": function(latex) {
            this._prevLatex = latex;
        },

        "getPrevLatex": function() {
            return this._prevLatex;
        },

        "flushAnalysis": function() {
            this._analysis.flush();
        },

        "flushError": function() {
            this._error.flush();
        },

        "flushParserData": function() {
            this._parserData.flush();
        },

        "flushPlotData": function() {
            this._plotData.flush();
        },

        "flushPointsData": function() {
            this._pointsData.flush();
        },

        "setPossibleFunctionVariables": function(possibleFunctionVariables) {
            this._analysis.set('_possibleFunctionVariables', possibleFunctionVariables);
        },

        "getPossibleFunctionVariables": function() {
            return this._analysis.get('_possibleFunctionVariables');
        },

        "getDefinitionFor": function() {
            return this._parserData.definitionFor;
        },

        "setDefinitionFor": function(definitionFor) {
            this._parserData.definitionFor = definitionFor;
        },

        /**

            Sets color value for the points of the current equationData object and triggers 'change-points-color' event

            @public
            @method changePointsColor
            @param color{String} color code or color name
            @param suppressEvent{boolean} flag to suppress event to be triggered
            @return void
        **/
        "changePointsColor": function(color, suppressEvent) {
            this.setColor(color);
            if (!suppressEvent) {
                this.trigger('change-points-color');
            }
        },
        /**

            Sets color value for the plot of the current equationData object and triggers 'change-color' event

            @public
            @method changeColor
            @param color{String} color code or color name
            @param suppressEvent{boolean} flag to suppress event to be triggered
            @return void
        **/
        "changeColor": function(color, suppressEvent) {
            this.setColor(color);
            if (!suppressEvent) {
                this.trigger('change-color');
            }
        },

        /**
            Changes the thickness of the equation plotted. The maximum value of thickness is 8 and minimum is 1.

            @public
            @method changeThickness
            @param thickness{String} plus for increasing thickness, minus for decreasing thickness.
            @param suppressEvent{boolean} flag to suppress event to be triggered
            @return void

        **/
        "changeThickness": function(thickness, suppressEvent) {
            this.setThickness(thickness);

            if (!suppressEvent) {
                this.trigger('change-thickness');
            }
        },
        "changeVisibility": function(bVisible) {
            this.setVisible(bVisible);
            this.trigger('change-visibility');
        },
        "removePathGroup": function() {
            this._plotData.removePathGroup();
        },
        /**

            Hides the plot for the current Equation

            @public
            @method hideGraph
            @return void
        **/
        "hideGraph": function(hideAnyway) {
            var pathGroup = this.getPathGroup(),
                pointsGroup = this.getPointsGroup(),
                inEqualitiesPathGroup = this.getInEqualititesPathGroup(),
                noOfChildren,
                pathCounter;
            if (pathGroup !== null) {
                noOfChildren = pathGroup.children.length;
                for (pathCounter = 0; pathCounter < noOfChildren; pathCounter++) {
                    pathGroup.children[pathCounter].visible = false;
                }
                pathGroup.visible = false;
            }
            if (inEqualitiesPathGroup !== null) {

                inEqualitiesPathGroup.visible = false;
            }
            if (pointsGroup !== null) {
                noOfChildren = pointsGroup.children.length;
                for (pathCounter = 0; pathCounter < noOfChildren; pathCounter++) {
                    pointsGroup.children[pathCounter].visible = pointsGroup.children[pathCounter].data.selected && !hideAnyway;
                }
            }

            this.setVisible(false);
        },

        /**
            Unhide or shows the plot for the current Equation

            @public
            @method showGraph
            @return void
        **/
        "showGraph": function(onlyParent) {
            var pathGroup = this.getPathGroup(),
                pointsGroup = this.getPointsGroup(),
                inEqualitiesPathGroup = this.getInEqualititesPathGroup(),
                pathCounter,
                noOfChildren,
                criticalPoints = this.getCriticalPoints();
            this.setVisible(true);
            if (pathGroup !== null) {
                noOfChildren = pathGroup.children.length;
                for (pathCounter = 0; pathCounter < noOfChildren; pathCounter++) {
                    pathGroup.children[pathCounter].visible = true;
                }
                pathGroup.visible = true;
            }
            if (inEqualitiesPathGroup !== null) {

                inEqualitiesPathGroup.visible = true;
            }
            if (pointsGroup !== null) {
                noOfChildren = pointsGroup.children.length;
                for (pathCounter = 0; pathCounter < noOfChildren; pathCounter++) {
                    pointsGroup.children[pathCounter].visible = true;
                }
                pointsGroup.visible = true;
            }
            if (!onlyParent && criticalPoints !== null && criticalPoints.getPointsGroup() !== null) {
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
        "toggleGraphView": function() {
            if (this.getCurveVisibility()) {
                this.hideGraph();
            } else {
                this.showGraph();
            }
        },

        /**
           Changes plot to dashed plot

           @public
           @method dashedGraph
           @param isInequality{boolean} to avoid the styling on inequality graph
           @return void
       **/
        "dashedGraph": function(isInequality) {
            if (this.getSpecie() === 'point') {
                var pointsGroup = this.getPointsGroup(),
                    childArray = pointsGroup.children,
                    length = childArray.length,
                    count, path;
                for (count = 0; count < length; count++) {
                    path = childArray[count];
                    if (path.hit) {
                        continue;
                    }
                    path.strokeColor = this.getColor();
                    path.fillColor = '#fff';
                }
            } else {
                if (this.getPathGroup()) {
                    this.getPathGroup().dashArray = MathUtilities.Components.EquationEngine.Models.EquationData.DASHED_ARRAY;
                }
            }
            if (isInequality === true) {
                this.setInequalityDashArray(MathUtilities.Components.EquationEngine.Models.EquationData.DASHED_ARRAY);
            } else {
                this.setDashArray(MathUtilities.Components.EquationEngine.Models.EquationData.DASHED_ARRAY);
            }
        },

        /**
           Changes plot to normal plot from dashed plot

           @public
           @method normalGraph
           @return void
       **/
        "normalGraph": function() {

            if (this.getSpecie() === 'point') {
                var labelData, pointsGroup,
                    count,
                    length,
                    childArray,
                    color,
                    path;
                pointsGroup = this.getPointsGroup();
                color = this.getColor();
                if (pointsGroup !== null) {
                    childArray = pointsGroup.children;
                    length = childArray.length;

                    for (count = 0; count < length; count++) {
                        path = childArray[count];
                        childArray = pointsGroup.children;
                        if (path.hit) {
                            continue;
                        }
                        path.strokeColor = color;
                        path.fillColor = color;
                    }
                }
                labelData = this.getLabelData();
                if (labelData.labelObject) {
                    labelData.labelObject.fillColor = this.getColor();
                }
            } else {
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
        "toggleDashedGraph": function() {
            if (this.getDashArray().length !== 0) {
                this.normalGraph();
            } else {
                this.dashedGraph();
            }
        },
        /**
            Returns JSON data of the model

            @public
            @method getData
            @return {Object}
        **/
        "getData": function() {
            var data = {},
                bestFit = {},
                plotEquation;
            data.equation = this.getLatex();
            data.color = this.getColor();
            data.thickness = this.getThickness();
            data.prevThickness = this.getPreviousThickness();
            data.styleType = this.styleType;
            data.visible = this.getVisible();
            data.points = this.getPoints();
            data.dashArray = this.getDashArray();
            data.labelText = this.getLabelData().text;
            data.position = this.getLabelData().position;
            data.labelVisibility = this.getLabelData().visible;
            data.bestFit = {
                "line": {},
                "curve": {},
                "exp": {},
                "polynomial": {}
            };
            plotEquation = this.getPlot();
            if (plotEquation !== null) {
                data.plotEquation = plotEquation.getData();
            }
            bestFit = this.getBestFit();
            if (bestFit) {
                if (bestFit.line && bestFit.line.selected === true) {
                    data.bestFit.line.selected = true;
                }
                if (bestFit.exp && bestFit.exp.selected === true) {
                    data.bestFit.exp.selected = true;
                }
                if (bestFit.polynomial && bestFit.polynomial.selected === true) {
                    data.bestFit.polynomial.selected = true;
                }
                if (bestFit.curve) {
                    _.each(bestFit.curve, function(value, counter) {
                        if (bestFit.curve[counter] && bestFit.curve[counter].selected === true) {
                            data.bestFit.curve[counter] = {};
                            data.bestFit.curve[counter].selected = true;
                        }
                    });
                }
            }
            return MathUtilities.Components.Utils.Models.Utils.convertToSerializable(data);
        },
        /**
            Sets given JSON data to the model

            @public
            @method setData
            @param data {Object} JSON object to be set
            @return void
        **/
        "setData": function(data) {
            var labelData = {};
            this.setLatex(data.equation);
            this.setColor(data.color);
            this.setThickness(data.thickness);
            this.styleType = data.styleType;
            this.setVisible(data.visible);
            this.setPoints(data.points);
            this.isSaveRestoreData = true;

            labelData.text = data.labelText;
            labelData.position = data.position;
            labelData.visible = data.labelVisibility;
            this.setLabelData(labelData);

        },

        /**
         * removePlottedGraph removes plotted graph
         * @method removePlottedGraph
         * @return void
         */
        "removePlottedGraph": function() {
            if (this.pathGroup) {
                this.pathGroup.remove();
            }
        },

        /**
         * flushData clears all data from equationData
         * @method flushData
         * @return void
         */
        "flushData": function() {
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
        "DASHED_ARRAY": [10, 4],

        /**
        Specifies the minimum value of thickness possible.

        @property minThickness
        @type {Number}
        @static
        @default 1
        **/
        "minThickness": 1,

        /**
        Specifies the maximum value of the thickness possible.

        @property maxThickness
        @type {Number}
        @static
        @default 8
        **/
        "maxThickness": 8
    });
}(window.MathUtilities));
