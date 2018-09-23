(function () {
    'use strict';
    var Classname = null,
        LAYER_NAMES = null,
        EVENTS = null;
    /**
    * 
    * @class ToolsGraph 
    * @extends MathInteractives.Common.Components.Theme2.Models.BaseInteractive
    * @namespace MathInteractives.Common.Components.Theme2
    */
    MathInteractives.Common.Components.Theme2.Models.ToolsGraph = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: function () {
            return {
                /**
                * View of grid graph.
                * @property gridGraphView
                * @type Object
                * @default null
                **/
                gridGraphView: null,

                /**
                * View of plotter.
                * @property plotterView
                * @type Object
                * @default null
                **/
                plotterView: null,

                /**
                * Paper tool required by interactives.
                * @property gridGraphTool
                * @type Object
                * @default null
                **/
                gridGraphTool: null,

                /**
                * Graph data provided by interactive at the time of initialization 
                * @property gridGraphData
                * @type Object
                * @default null
                **/
                gridGraphData: null,

                /**
                * Focus rect for the interactives end
                * @property focusRect
                * @type Object
                * @default null
                **/
                focusRect: null
            }

        },

        /**
        * Used to set defaults required by interactives that differ from the tools.
        *
        * @method intialize
        * @constructor
        */
        initialize: function initialize() {
            return this;
        },

        /**
        * Initializes the grid-graph with the given data.
        *
        * @param {Object} data Properties for initialization
        * @param {Object} data.gridGraphOptions Object for grid graph initialization 
        * @param {Object} data.gridGraphEl el for grid graph view
        * @param {Boolean} data.isPlotterRequired Set true if you intend to plot equations
        * @return {Object} wrapperModelInstance Wrapper class
        * @method initializeGridGraphView
        * @chainable
        **/
        initializeGridGraphView: function initializeGridGraphView(data) {
            var self = this,
                scope = null,
                gridGraphTool = null,
                gridGraphView = null;

            gridGraphView = new MathUtilities.Components.Graph.Views.GridGraph({
                option: data.gridGraphOptions,
                el: data.gridGraphEl
            });

            scope = gridGraphView.getPaperScope();
            gridGraphTool = new scope.Tool();

            self.set('gridGraphView', gridGraphView);
            self.set('gridGraphTool', gridGraphTool);
            self.set('gridGraphData', data);

            if (data.isPlotterRequired) {
                return self._initializePlotterView();
            }
            return self;
        },

        /**
        * Initializes the plotter and associates it with the grid-graph view
        *
        * @method _initializePlotterView
        * @private
        * @chainable
        **/
        _initializePlotterView: function _initializePlotterView() {
            var self = this,
                gridGraphView = self.get('gridGraphView');
            if (gridGraphView) {
                var plotterView = new MathUtilities.Components.Graph.Views.plotterView({
                    graphView: self.get('gridGraphView')
                });
                self.set('plotterView', plotterView);
                return self;
            }
            return false;
        },

        /**
        * Returns grid-graph paperscope
        *
        * @method getGridGraphScope
        * @return {Object} paperscope Grid-graph paperscope
        **/
        getGridGraphScope: function getGridGraphScope() {
            return this.get('gridGraphView').getPaperScope();
        },

        /**
        * Returns accessibility text for equations, equations with variable substituted and single sided expressions(lhs/rhs)
        *
        * @method getAccessibilityText
        * @param latex {String} in latex form
        * @return {String} text as returned by tools accessibility for equations
        * @public
        **/
        getAccessibilityText: function getAccessibilityText(latex) {
            var regexString = /[xy]/,
                isVariablePresent = latex.match(regexString);

            // If variable not present in equation split equation in lhs and rhs then get acc text 
            // for individual sides. Then combine all together to get whole equation.
            if (!isVariablePresent) {
                var mathML = latex.split('='),
                    mathMLAcc = [],
                    equalToString = 'x = x',    // Sample equation to get acc text for '='
                    equalToAcc = Classname.GET_ACC_TEXT(equalToString);

                // Remove unwanted added variables to get equal to acc text
                equalToAcc = equalToAcc.replace(/x/g, '');
                mathMLAcc[0] = Classname.GET_ACC_TEXT(mathML[0]);

                // If acc text for single sided expressions
                if (mathML[1] !== undefined) {
                    mathMLAcc[1] = Classname.GET_ACC_TEXT(mathML[1]);
                    return mathMLAcc[0] + equalToAcc + mathMLAcc[1];
                }
                else {
                    return mathMLAcc[0];
                }
            }
            else {
                return Classname.GET_ACC_TEXT(latex);
            }
        },

        /**
        * Returns the paper tool managed by interactives
        *
        * @method getCustomPaperTool
        * @public
        **/
        getCustomPaperTool: function getCustomPaperTool() {
            return this.get('gridGraphTool');
        },

        /**
        * Binds postdrag handler when an equation object is made draggable
        *
        * @param {Object} equationObject Equation on which post drag is bound
        * @return {Object} wrapperModelInstance Wrapper class
        * @method _bindPostDragHandler
        * @private
        * @chainable
        **/
        _bindPostDragHandler: function _bindPostDragHandler(equationObject) {
            var self = this;
            self.stopListening(equationObject, 'post-drag', self._triggerPostDrag);
            self.listenTo(equationObject, 'post-drag', self._triggerPostDrag);
            return self;
        },

        /**
        * Triggers postdrag event on the wrapper when an equation object is dragged
        *
        * @param {Object} postDragData Data from post drag event consisting equation, deltaX, deltaY, etc..
        * @return {Object} wrapperModelInstance Wrapper class
        * @method _bindPostDragHandler
        * @private
        * @chainable
        **/
        _triggerPostDrag: function _triggerPostDrag(postDragData) {
            var self = this;
            self.trigger(EVENTS.EQUATION_EVENTS.POST_DRAG, postDragData);
            return self;
        },


        /**
        * Forces the draw method of the grid graph paperscope
        *
        * @return {Object} wrapperModelInstance Wrapper class
        * @method forceRefreshGridGraph
        * @chainable
        **/
        forceRefreshGridGraph: function forceRefreshGridGraph() {
            var self = this,
                gridGraphView = self.get('gridGraphView'),
                paperScope = gridGraphView.getPaperScope();
            paperScope.view.draw();
            return self;
        },

        /**
        * Calls the refresh view of grid-graph
        *
        * @return {Object} wrapperModelInstance Wrapper class
        * @method refreshGridGraph
        * @chainable
        **/
        refreshGridGraph: function refreshGridGraph() {
            var self = this,
                gridGraphView = self.get('gridGraphView');
            gridGraphView.refreshView();

            return self;
        },

        /**
        * Redraws the entire graph
        *
        * @param {Object} supressRedraw Suppress the layers that you don't want to update
        * @return {Object} wrapperModelInstance Wrapper class
        * @method drawGridGraph
        * @chainable
        **/
        drawGridGraph: function drawGridGraph(supressRedraw) {
            var self = this,
                gridGraphView = self.get('gridGraphView');

            gridGraphView.drawGraph(supressRedraw);

            return self;
        },

        /**
        * Shifts the origin of graph and updates the grid
        *
        * @param {Array} point The point coordinates [x,y]
        * @return {Object} wrapperModelInstance Wrapper class
        * @method changeOriginOfGridGraph
        * @chainable
        **/
        changeOriginOfGridGraph: function changeOriginOfGridGraph(point) {
            var self = this,
                gridGraphView = self.get('gridGraphView');
            if (point) {
                gridGraphView.changeOriginPosition(point);
            }
            return self;
        },

        /**
        * Sets background col   or and opacity to grid-graph
        *
        * @param {String} backgroundColor Background color for grid
        * @param {Number} alpha Background alpha for grid
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setGridBackground
        * @chainable
        **/
        setGridBackground: function setGridBackground(backgroundColor, alpha) {
            var self = this,
                gridGraphView = self.get('gridGraphView');
            gridGraphView.setBackgroundColor(backgroundColor, alpha)
            return self;
        },

        /**
        * Sets style for the grid drawing
        *
        * @param {Object} data Options to be passed
        * @param {Object} data.gridStyle Style for grid
        * @param {Boolean} [data.shouldRefresh=false] Pass this as true to redraw the grid. Redraw when all changes are made.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setGridGraphStyle
        * @chainable
        **/
        setGridGraphStyle: function setGridGraphStyle(data) {
            var self = this,
                shouldRefresh = typeof data.shouldRefresh === 'undefined' ? false : data.shouldRefresh,
                gridGraphView = self.get('gridGraphView');

            gridGraphView.setGridStyle(data.gridStyle);
            if (data.shouldRefresh) {
                gridGraphView.drawGridLayer();
            }
            return self;
        },

        /**
        * Sets axis-lines visibility.
        *
        * @param {Object} data Options to be passed
        * @param {Boolean} data.isVisible Boolean for visibility
        * @param {Boolean} [data.shouldRefresh=false] Pass this as true to redraw the grid. Redraw when all changes are made.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setAxisLineVisibility
        * @chainable
        **/
        setAxisLineVisibility: function setAxisLineVisibility(data) {
            var self = this,
                shouldRefresh = typeof data.shouldRefresh === 'undefined' ? false : data.shouldRefresh,
                gridGraphView = self.get('gridGraphView');

            gridGraphView.setAxisLineVisibility(data.isVisible);
            if (data.shouldRefresh) {
                gridGraphView.drawGridLayer();
            }
            return self;
        },

        /**
        * Sets grid-lines visibility.
        *
        * @param {Object} data Options to be passed
        * @param {Boolean} data.isVisible Boolean for visibility
        * @param {Boolean} [data.shouldRefresh=false] Pass this as true to redraw the grid. Redraw when all changes are made.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setGridLineVisibility
        * @chainable
        **/
        setGridLineVisibility: function setGridLineVisibility(data) {
            var self = this,
                shouldRefresh = typeof data.shouldRefresh === 'undefined' ? false : data.shouldRefresh,
                gridGraphView = self.get('gridGraphView');

            gridGraphView.setGridLineVisibility(data.isVisible);
            if (data.shouldRefresh) {
                gridGraphView.drawGridLayer();
            }
            return self;
        },

        /**
        * Sets marker(axis-label) visibility.
        *
        * @param {Object} data Options to be passed
        * @param {Boolean} data.isVisible Boolean for visibility
        * @param {Boolean} [data.shouldRefresh=false] Pass this as true to redraw the grid. Redraw when all changes are made.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setGridGraphLabelVisibility
        * @chainable
        **/
        setGridGraphLabelVisibility: function setGridGraphLabelVisibility(data) {
            var self = this,
                shouldRefresh = typeof data.shouldRefresh === 'undefined' ? false : data.shouldRefresh,
                gridGraphView = self.get('gridGraphView');

            gridGraphView.setLabelVisibility(data.isVisible);
            if (data.shouldRefresh) {
                gridGraphView.drawGridLayer();
            }
            return self;
        },

        /**
        * Sets marker(axis-label) style.
        *
        * @param {Object} data Options to be passed
        * @param {Object} data.markerStyle Style for marker
        * @param {Boolean} [data.shouldRefresh=false] Pass this as true to redraw the grid. Redraw when all changes are made.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setGridGraphMarkerStyle
        * @chainable
        **/
        setGridGraphMarkerStyle: function setGridGraphMarkerStyle(data) {
            var self = this,
                shouldRefresh = typeof data.shouldRefresh === 'undefined' ? false : data.shouldRefresh,
                gridGraphView = self.get('gridGraphView');

            gridGraphView.setMarkerTextStyle(data.markerStyle);
            if (data.shouldRefresh) {
                gridGraphView.drawGridLayer();
            }
            return self;
        },

        /**
        * Gets Drag hit thickness for a given equation object
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @return {Number} thickness Drag hit thickness
        * @method getDragHitThicknessForEquation
        **/
        getDragHitThicknessForEquation: function getDragHitThicknessForEquation(equationObject) {
            return equationObject.getDragHitThickness();
        },

        /**
        * Sets Drag hit thickness for a given equation object
        *
        * @param {Object|Array} equationObject Equation as defined by the tools (Equation Data)
        * @param {Object} data Options to be passed
        * @param {Number} data.thickness Drag hit thickness
        * @return {Number} thickness Drag hit thickness
        * @method setDragHitThicknessForEquation
        * @chainable
        **/
        setDragHitThicknessForEquation: function setDragHitThicknessForEquation(equationObject, data) {
            if ($.isArray(equationObject)) {
                $.each(equationObject, function _changeDragHitThickness(index, equationObject) {
                    equationObject.setDragHitThickness(data.thickness);
                });
            }
            else {
                equationObject.setDragHitThickness(data.thickness);
            }
            return this;
        },

        /**
        * Returns limits of the grid graph
        *
        * @return {Object} limits Limits of grid graph
        * @method getGridLimits
        **/
        getGridLimits: function getGridLimits() {
            return this.get('gridGraphView').getLimits();
        },

        /**
        * Sets limits for the grid graph
        *
        * @param {Object} limits Limits for grid graph
        * @param {Number} limits.xLower Lower limit for x
        * @param {Number} limits.xUpper Upperer limit for x
        * @param {Number} limits.yLower Lower limit for y
        * @param {Number} limits.yUpper Upperer limit for y
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setGridLimits
        * @chainable
        **/
        setGridLimits: function setGridLimits(limits) {
            var self = this,
                gridGraphView = self.get('gridGraphView');
            gridGraphView.setLimits(limits.xLower, limits.xUpper, limits.yLower, limits.yUpper);
            gridGraphView.drawGridLayer();
            return self;
        },

        /**
        * Creates an equation object
        *
        * @param {Object} [data] Data related to equation.
        * @param {String} [data.latex] Latex as required by the tools.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method createEquationObject
        **/
        createEquationObject: function createEquationObject(data) {
            var self = this,
                gridGraphView = self.get('gridGraphView'),
                plotterView = self.get('plotterView'),
                equationObject = new MathUtilities.Components.EquationEngine.Models.EquationData(),
                _data = null;

            if (typeof data !== 'undefined') {
                //Avoind reference clashes
                _data = $.extend({}, data);

                //Set shouldRefresh to true
                _data.shouldRefresh = true;

                if (typeof _data.latex !== 'undefined') {
                    self.setLatex(equationObject, _data);
                }

            }
            return equationObject;
        },

        /**
        * Creates an equation object groomed to plot points.
        *
        * @param {Object} [data] Data related to plotting.
        * @param {Array} [data.points] Array of points (Eg. [[1,2],[2,3],...[Xn,Yn]]).
        * You can also set the points using
        * {{#crossLink "MathInteractives.Common.Components.Theme2.Models.ToolsGraph/setPoints:method"}}{{/crossLink}}.
        * @return {Object} wrapperModelInstance Wrapper class
        * @return {Object} pointsEquationObject Equation object as defined by the tools (Equation Data)
        * @method createPointsEquationObject
        **/
        createPointsEquationObject: function createPointsEquationObject(data) {
            var self = this,
                gridGraphView = self.get('gridGraphView'),
                plotterView = self.get('plotterView'),
                pointsEquationObject = self.createEquationObject(),
                _data = null;

            //Groom the object to be a point equation
            self
            .setBlindForEquation(pointsEquationObject, true)
            .setSpecieForEquation(pointsEquationObject, 'point');

            if (typeof data !== 'undefined') {
                //Avoind reference clashes
                _data = $.extend({}, data);

                //Set shouldRefresh to true
                _data.shouldRefresh = true;

                if (typeof _data.points !== 'undefined') {
                    self.setPoints(pointsEquationObject, _data);
                }

            }
            return pointsEquationObject;
        },

        /**
        * Creates an equation object groomed for ploygon plotting. 
        * The points are linked from first to last.
        * @param {Object} [data] Data related to the polygon rendering.
        * @param {Array} [data.points] Array of points (Eg. [[1,2],[2,3],...[Xn,Yn]]).
        * You can also set the points using
        * {{#crossLink "MathInteractives.Common.Components.Theme2.Models.ToolsGraph/setPoints:method"}}{{/crossLink}}.
        * @param {Boolean} [data.isClosedPolygon=false] Set to true if you want it to be a closed polygon
        * @return Object polygonEquationObject Equation object as defined by the tools (Equation Data)
        * @method createPolygonEquationObject
        **/
        createPolygonEquationObject: function createPolygonEquationObject(data) {
            var self = this,
                gridGraphView = self.get('gridGraphView'),
                plotterView = self.get('plotterView'),
                polygonEquationObject = self.createEquationObject(),
                _data = null;

            //Groom the object to be a polygon
            self
            .setBlindForEquation(polygonEquationObject, true)
            .setSpecieForEquation(polygonEquationObject, 'polygon');

            if (typeof data !== 'undefined') {
                //Avoind reference clashes
                _data = $.extend({}, data);

                //Set shouldRefresh to true
                data.shouldRefresh = true;

                if (typeof _data.isClosedPolygon !== 'undefined') {
                    polygonEquationObject.setClosedPolygon(_data.isClosedPolygon);
                }
                if (typeof _data.points !== 'undefined') {
                    self.setPoints(polygonEquationObject, _data);
                }

            }
            return polygonEquationObject;
        },

        /**
        * Returns the point of an equation. Can be called for equation that plots points.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @return {Object} points Array of points For eg. [[x1,y1],[x2,y2]....[xn,yn]]
        * @method getPointsForEquation
        **/
        getPointsForEquation: function getPointsForEquation(equationObject) {
            return equationObject.getPoints();
        },

        /**
        * Returns the points group of an equation. Can be called for equation that plots points.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @return {Object} pointsGroup Paper group
        * @method getPointsGroupForEquation
        **/
        getPointsGroupForEquation: function getPointsGroupForEquation(equationObject) {
            return equationObject.getPointsGroup();
        },

        /**
        * Returns the path group of an equation.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @return {Object} pathGroup Paper group
        * @method getPathGroupForEquation
        **/
        getPathGroupForEquation: function getPathGroupForEquation(equationObject) {
            return equationObject.getPathGroup();
        },

        /**
        * Returns grid distance for a given point.
        *
        * @param {Array} point Point in the form of [x,y]
        * @return {Array} gridDistance Corresponding grid distance
        * @method getGridDistanceForPoint
        **/
        getGridDistanceForPoint: function getGridDistanceForPoint(point) {
            return this.get('gridGraphView')._getGridDistance(point);
        },

        /**
        * Returns minimum marker values
        *
        * @return {Object} minMarkerValues Minimum marker values of the grid
        * @method getMinimumMarkerValuesForGrid
        **/
        getMinimumMarkerValuesForGrid: function getMinimumMarkerValuesForGrid() {
            return this.get('gridGraphView').getMinimumMarkerValues();
        },

        /**
        * Sets blind for an equation object. Setting equation to blind implies that it will not be parsed.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @param {Boolean} blind Blind as required by the tools.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setBlindForEquation
        * @chainable
        **/
        setBlindForEquation: function setBlindForEquation(equationObject, blind) {
            equationObject.setBlind(blind);
            return this;
        },

        /**
        * Sets specie for an equation object.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @param {String} blind Specie as required by the tools.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setSpecieForEquation
        * @chainable
        **/
        setSpecieForEquation: function setSpecieForEquation(equationObject, specie) {
            equationObject.setSpecie(specie);
            return this;
        },

        /**
        * Sets autonomous for an equation object. Setting eqn to autonomous implies that constants will not be generated for it.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @param {Boolean} autonomous Autonomous as required by the tools.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setAutonomousForEquation
        * @chainable
        **/
        setAutonomousForEquation: function setAutonomousForEquation(equationObject, autonomous) {
            equationObject.setAutonomous(autonomous);
            return this;
        },

        /**
        * Sets function code for an equation object.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @param {String} functionCode FunctionCode as required by the tools.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setFunctionCodeForEquation
        * @chainable
        **/
        setFunctionCodeForEquation: function setFunctionCodeForEquation(equationObject, functionCode) {
            equationObject.setFunctionCode(functionCode);
            return this;
        },

        /**
        * Sets function variable for an equation object.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @param {String} functionCode FunctionCode as required by the tools.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setFunctionVariableForEquation
        * @chainable
        **/
        setFunctionVariableForEquation: function setFunctionVariableForEquation(equationObject, functionVariable) {
            equationObject.setFunctionVariable(functionVariable);
            return this;
        },

        /**
        * Sets param variable for an equation object.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @param {String} paramVariable Param variable as required by the tools.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setParamVariableForEquation
        * @chainable
        **/
        setParamVariableForEquation: function setParamVariableForEquation(equationObject, paramVariable) {
            equationObject.setParamVariable(paramVariable);
            return this;
        },

        /**
        * Sets param variable order for an equation object.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @param {Number} paramVariableOrder Param variable order as required by the tools.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setParamVariableOrderForEquation
        * @chainable
        **/
        setParamVariableOrderForEquation: function setParamVariableOrderForEquation(equationObject, paramVariableOrder) {
            equationObject.setParamVariableOrder(paramVariableOrder);
            return this;
        },

        /**
        * Sets seed for an equation object.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @param {Object} seed Seed as required by the tools.
        * @param {Number} seed.x1 X Canvas coordinate of first point.
        * @param {Number} seed.y1 Y Canvas coordinate of first point.
        * @param {Number} seed.x2 X Canvas coordinate of second point.
        * @param {Number} seed.y2 Y Canvas coordinate of second point.
        * @param {Number} seed.a Corresponds to the 'a' in the general equation format (Eg. ax+by+c=0).
        * @param {Number} seed.b Corresponds to the 'b' in the general equation format (Eg. ax+by+c=0).
        * @param {Number} seed.c Corresponds to the 'c' in the general equation format (Eg. ax+by+c=0).
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setConstantsForEquation
        * @chainable
        **/
        setConstantsForEquation: function setConstantsForEquation(equationObject, seed) {
            equationObject.setConstants(seed);
            return this;
        },

        /**
        * Sets latex for an equation object.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @param {Object} data Data related to the changes expected
        * @param {String} data.latex Latex as required by the tools.
        * @param {Boolean} [data.shouldRefresh=false] Indicates the graph should be updated forcefully. Try refreshing it as rarely as 
        * possible. Use {{#crossLink "MathInteractives.Common.Components.Theme2.Models.ToolsGraph/updateEquationObject:method"}}{{/crossLink}} 
        * after all changes have been made to the equation object(s). All will be reflected at once.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setLatex
        * @chainable
        **/
        setLatex: function setLatex(equationObject, data) {
            var self = this,
                plotterView = self.get('plotterView'),
                shouldRefresh = typeof data.shouldRefresh === 'undefined' ? false : data.shouldRefresh;

            equationObject.setLatex(data.latex);

            if (shouldRefresh) {
                self.updateEquationObject(equationObject);
            }
            return self;
        },

        /**
        * Gets latex for an equation object.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @return {String} latex Latex of equation object
        * @method getLatex
        **/
        getLatex: function getLatex(equationObject) {
            return equationObject.getLatex();
        },

        /**
        * Sets points for an equation object that is groomed to draw points.
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @param {Object} data Data related to the changes expected
        * @param {Array} data.points Array of points (Eg. [[1,2],[2,3],...[Xn,Yn]])
        * @param {Boolean} [data.shouldRefresh=false] Indicates the graph should be updated forcefully. Try refreshing it as rarely as 
        * possible. Use {{#crossLink "MathInteractives.Common.Components.Theme2.Models.ToolsGraph/updateEquationObject:method"}}{{/crossLink}} 
        * after all changes have been made to the equation object(s). All will be reflected at once.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setPoints
        * @chainable
        **/
        setPoints: function setPoints(equationObject, data) {
            var self = this,
                plotterView = self.get('plotterView'),
                shouldRefresh = typeof data.shouldRefresh === 'undefined' ? false : data.shouldRefresh;

            equationObject.setPoints(data.points);

            if (shouldRefresh) {
                self.updateEquationObject(equationObject);
            }
            return self;
        },


        /**
        * Set draggable property of equation object.
        *
        * @param {Object|Array} equationObject Equation as defined by the tools (Equation Data)
        * If you pass an array of objects, it will update all.
        * @param {Object} data Data related to the changes expected
        * @param {Boolean} data.draggable Enable or disable dragging
        * @param {Boolean} [data.shouldRefresh=false] Indicates the graph should be updated forcefully. Try refreshing it as rarely as 
        * possible. Use {{#crossLink "MathInteractives.Common.Components.Theme2.Models.ToolsGraph/updateEquationObject:method"}}{{/crossLink}} after all changes have been made to the equation object(s).
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setDraggable
        * @chainable
        **/
        setDraggable: function setDraggable(equationObject, data) {
            var self = this,
                areMultipleEquations = $.isArray(equationObject),
                shouldRefresh = typeof data.shouldRefresh === 'undefined' ? false : data.shouldRefresh;


            if (areMultipleEquations) {
                $.each(equationObject, function _setDraggable(index, equationObject) {
                    equationObject.setDraggable(data.draggable);
                    self._bindPostDragHandler(equationObject);
                });
            }
            else {
                equationObject.setDraggable(data.draggable);
                self._bindPostDragHandler(equationObject);
            }

            if (shouldRefresh) {
                self.updateEquationObject(equationObject);
            }
            return self;
        },

        /**
        * Set range of an equation object.
        *
        * @param {Object|Array} equationObject Equation as defined by the tools (Equation Data)
        * If you pass an array of objects, it will update all.
        * @param {Object} data Data related to the changes expected
        * @param {Object} data.range Range for the equation
        * @param {Object} data.range.max Max value of the range
        * @param {Number} data.range.max.value The grid value of the max range
        * @param {Object} data.range.min Min value of the range
        * @param {Number} data.range.min.value The grid value of the min range
        * @param {Boolean} [data.shouldRefresh=false] Indicates the graph should be updated forcefully. Try refreshing it as rarely as 
        * possible. Use {{#crossLink "MathInteractives.Common.Components.Theme2.Models.ToolsGraph/updateEquationObject:method"}}{{/crossLink}} after all changes have been made to the equation object(s).
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setRange
        * @chainable
        **/
        setRange: function setRange(equationObject, data) {
            var self = this,
                areMultipleEquations = $.isArray(equationObject);

            if (areMultipleEquations) {
                $.each(equationObject, function _setRange(index, equationObject) {
                    equationObject.setRange(data.range);
                    equationObject.trigger('plot-equation');
                });
            }
            else {
                equationObject.setRange(data.range);
                equationObject.trigger('plot-equation');
            }

            return self;
        },

        

        /**
        * Returns the array of visible points.
        *
        * @param {Object|Array} equationObject Equation as defined by the tools (Equation Data)
        * @return {Array} arr Array of points within the view
        * @method getEquationArr
        **/

        getEquationArr: function getEquationArr(equationObject) {
            return equationObject.getArr();
        },

        /**
        * Forcefully trigger change if you modify equation.
        *
        * @param {Object} equationObject Equation object as defined by the tools.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method triggerChange
        * @chainable
        **/
        triggerChange: function triggerChange(equationObject) {
            equationObject.trigger('change-equation');
            return this;
        },

        /**
        * Update points/graph an an equation object.
        *
        * @param {Object|Array} equationObject Equation object as defined by the tools.
        * If you pass an array of objects, it will update all.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method updateEquationObject
        * @chainable
        **/
        updateEquationObject: function updateEquationObject(equationObject) {
            var self = this,
                plotterView = self.get('plotterView');
            if ($.isArray(equationObject)) {
                $.each(equationObject, function _addToGridGraph(index, equationObject) {
                    plotterView.addEquation(equationObject);
                    plotterView.addPlot(equationObject);
                });
            }
            else {
                plotterView.addEquation(equationObject);
                plotterView.addPlot(equationObject);
            }
            return self;
        },

        /**
        * Change opacity of an equation object.
        *
        * @param {Object|Array} equationObject Equation as defined by the tools (Equation Data)
        * If you pass an array of objects, it will update all.
        * @param {Object} data Data related to the changes expected.
        * @param {Number} data.opacity Opacity for a paper group.
        * @param {Boolean} [data.shouldRefresh=false] Indicates the graph should be updated forcefully. Try refreshing it as rarely as 
        * possible. Use {{#crossLink "MathInteractives.Common.Components.Theme2.Models.ToolsGraph/updateEquationObject:method"}}{{/crossLink}} after all changes have been made to the equation object(s).
        * @return {Object} wrapperModelInstance Wrapper class
        * @method changeEqnObjOpacity
        * @chainable
        **/
        changeEqnObjOpacity: function changeEqnObjOpacity(equationObject, data) {
            var self = this,
                areMultipleEquations = $.isArray(equationObject),
                plotterView = self.get('plotterView'),
                shouldRefresh = typeof data.shouldRefresh === 'undefined' ? false : data.shouldRefresh;

            if (areMultipleEquations) {
                $.each(equationObject, function _changeOpacity(index, equationObject) {
                    equationObject.setOpacity(data.opacity);
                });
            }
            else {
                equationObject.setOpacity(data.opacity);
            }

            if (shouldRefresh) {
                self.updateEquationObject(equationObject);
            }
            return self;
        },

        /**
        * Change thickness of an equation object.
        *
        * @param {Object|Array} equationObject Equation as defined by the tools (Equation Data)
        * If you pass an array of objects, it will update all.
        * @param {Object} data Data related to the changes expected.
        * @param {Number} data.thickness Thickness for a paper group.
        * @param {Boolean} [data.shouldRefresh=false] Indicates the graph should be updated forcefully. Try refreshing it as rarely as 
        * possible. Use {{#crossLink "MathInteractives.Common.Components.Theme2.Models.ToolsGraph/updateEquationObject:method"}}{{/crossLink}} after all changes have been made to the equation object(s).
        * @return {Object} wrapperModelInstance Wrapper class
        * @method changeEqnObjThickness
        * @chainable
        **/
        changeEqnObjThickness: function changeEqnObjThickness(equationObject, data) {
            var self = this,
                areMultipleEquations = $.isArray(equationObject),
                plotterView = self.get('plotterView'),
                shouldRefresh = typeof data.shouldRefresh === 'undefined' ? false : data.shouldRefresh;

            if (areMultipleEquations) {
                $.each(equationObject, function _changeThickness(index, equationObject) {
                    equationObject.changeThickness(data.thickness);
                });
            }
            else {
                equationObject.changeThickness(data.thickness);
            }

            if (shouldRefresh) {
                self.updateEquationObject(equationObject);
            }
            return self;
        },

        /**
        * Change color of an equation object.
        *
        * @param {Object|Array} equationObject Equation as defined by the tools (Equation Data)
        * If you pass an array of objects, it will update all.
        * @param {Object} data Data related to the changes expected
        * @param {String} data.color Color for a paper group.
        * @param {Boolean} [data.shouldRefresh=false] Indicates the graph should be updated forcefully. Try refreshing it as rarely as 
        * possible. Use {{#crossLink "MathInteractives.Common.Components.Theme2.Models.ToolsGraph/updateEquationObject:method"}}{{/crossLink}} after all changes have been made to the equation object(s).
        * @return {Object} wrapperModelInstance Wrapper class
        * @method changeEqnObjColor
        * @chainable
        **/
        changeEqnObjColor: function changeEqnObjColor(equationObject, data) {
            var self = this,
                areMultipleEquations = $.isArray(equationObject),
                shouldRefresh = typeof data.shouldRefresh === 'undefined' ? false : data.shouldRefresh;

            if (areMultipleEquations) {
                $.each(equationObject, function _changeColor(index, equationObject) {
                    equationObject.changeColor(data.color);
                });
            }
            else {
                equationObject.changeColor(data.color);
            }

            if (shouldRefresh) {
                self.updateEquationObject(equationObject);
            }
            return self;
        },

        /**
        * Changes the opacity of an inequality equation object.
        *
        * @param {Object|Array} equationObject Equation as defined by the tools (Equation Data)
        * If you pass an array of objects, it will update all.
        * @param {Object} data Data related to the changes expected
        * @param {Number} data.opacity Opacity for a paper group.
        * @param {Boolean} [data.shouldRefresh=false] Indicates the graph should be updated forcefully. Try refreshing it as rarely as 
        * possible. Use {{#crossLink "MathInteractives.Common.Components.Theme2.Models.ToolsGraph/updateEquationObject:method"}}{{/crossLink}} after all changes have been made to the equation object(s).
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setInEqualityOpacity
        * @chainable
        **/
        setInEqualityOpacity: function setInEqualityOpacity(equationObject, data) {
            var self = this,
                areMultipleEquations = $.isArray(equationObject),
                shouldRefresh = typeof data.shouldRefresh === 'undefined' ? false : data.shouldRefresh;

            if (areMultipleEquations) {
                $.each(equationObject, function _changeInequalityOpacity(index, equationObject) {
                    equationObject.setInEqualityOpacity(data.opacity);
                });
            }
            else {
                equationObject.setInEqualityOpacity(data.opacity);
            }

            if (shouldRefresh) {
                self.updateEquationObject(equationObject);
            }
            return self;
        },

        /**
        * Changes the opacity of an equation object.
        *
        * @param {Object|Array} equationObject Equation as defined by the tools (Equation Data)
        * If you pass an array of objects, it will update all.
        * @param {Object} data Data related to the changes expected
        * @param {Number} data.opacity Opacity for a paper group.
        * @param {Boolean} [data.shouldRefresh=false] Indicates the graph should be updated forcefully. Try refreshing it as rarely as 
        * possible. Use {{#crossLink "MathInteractives.Common.Components.Theme2.Models.ToolsGraph/updateEquationObject:method"}}{{/crossLink}} after all changes have been made to the equation object(s).
        * @return {Object} wrapperModelInstance Wrapper class
        * @method setEquationOpacity
        * @chainable
        **/
        setEquationOpacity: function setEquationOpacity(equationObject, data) {
            var self = this,
                areMultipleEquations = $.isArray(equationObject),
                shouldRefresh = typeof data.shouldRefresh === 'undefined' ? false : data.shouldRefresh;

            if (areMultipleEquations) {
                $.each(equationObject, function _changeInequalityOpacity(index, equationObject) {
                    equationObject.setOpacity(data.opacity);
                });
            }
            else {
                equationObject.setOpacity(data.opacity);
            }

            if (shouldRefresh) {
                self.updateEquationObject(equationObject);
            }
            return self;
        },

        /**
        * Changes the graph to dashed graph.
        *
        * @param {Object|Array} equationObject Equation as defined by the tools (Equation Data)
        * If you pass an array of objects, it will update all.
        * @method convertToDashedGraph
        * @chainable
        **/
        convertToDashedGraph: function convertToDashedGraph(equationObject) {
            var self = this,
                areMultipleEquations = $.isArray(equationObject);

            if (areMultipleEquations) {
                $.each(equationObject, function _dashedGraph(index, equationObject) {
                    equationObject.dashedGraph();
                });
            }
            else {
                equationObject.dashedGraph();
            }
            return self;
        },

        /**
        * Changes the graph to normal (continuous) graph.
        *
        * @param {Object|Array} equationObject Equation as defined by the tools (Equation Data)
        * If you pass an array of objects, it will update all.
        * @method convertToNormalGraph
        * @chainable
        **/
        convertToNormalGraph: function convertToNormalGraph(equationObject) {
            var self = this,
                areMultipleEquations = $.isArray(equationObject);

            if (areMultipleEquations) {
                $.each(equationObject, function _dashedGraph(index, equationObject) {
                    equationObject.normalGraph();
                });
            }
            else {
                equationObject.normalGraph();
            }
            return self;
        },

        /**
        * Returns Canvas cordinate for given graph point.
        *
        * @param {Array} graphPoint The graph point in [x,y] format
        * @return {Array} canvasPoint Wrapper class
        * @method convertToCanvasCoordinate
        * @chainable
        **/
        convertToCanvasCoordinate: function convertToCanvasCoordinate(graphPoint) {
            var self = this,
                gridGraphView = self.get('gridGraphView');

            return gridGraphView.convertToCanvasCoordinate(graphPoint);
        },

        /**
        * Returns Graph cordinate for given graph point.
        *
        * @param {Array} canvasPoint The canvas point in [x,y] format
        * @return {Array} graphPoint Wrapper class
        * @method convertToGraphCoordinate
        * @chainable
        **/
        convertToGraphCoordinate: function convertToGraphCoordinate(canvasPoint) {
            var self = this,
                gridGraphView = self.get('gridGraphView');

            return gridGraphView.convertToGraphCoordinate(canvasPoint);
        },

        /**
        * Remove equation from graph.
        *
        * @param {Object|Array} equationObject Equation object as defined by the tools.
        * If you pass an array of objects, it will update all.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method removeEquationFromGraph
        * @chainable
        **/
        removeEquationFromGraph: function removeEquationFromGraph(equationObject) {
            var self = this,
                areMultipleEquations = $.isArray(equationObject),
                plotterView = self.get('plotterView');

            if (areMultipleEquations) {
                $.each(equationObject, function _changeColor(index, equationObject) {
                    plotterView.removeEquation(equationObject);
                });
            }
            else {
                plotterView.removeEquation(equationObject);
            }
            return self;
        },

        /**
        * Show an equation on the graph if it is hidden (Unhide)
        *
        * @param {Object|Array} equationObject Equation object as defined by the tools.
        * If you pass an array of objects, it will update all.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method showEquation
        * @chainable
        **/
        showEquation: function showEquation(equationObject) {
            var areMultipleEquations = $.isArray(equationObject);

            if (areMultipleEquations) {
                $.each(equationObject, function showEquation(index, equationObject) {
                    equationObject.showGraph();
                });
            }
            else {
                equationObject.showGraph();
            }
            return this;
        },

        /**
        * Hide an equation on the graph if it is plotted
        *
        * @param {Object|Array} equationObject Equation object as defined by the tools.
        * If you pass an array of objects, it will update all.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method hideEquation
        * @chainable
        **/
        hideEquation: function hideEquation(equationObject) {
            var areMultipleEquations = $.isArray(equationObject);

            if (areMultipleEquations) {
                $.each(equationObject, function hideEquation(index, equationObject) {
                    equationObject.hideGraph();
                });
            }
            else {
                equationObject.hideGraph();
            }
            return this;
        },

        /**
        * Triggers custom event on wrapper class for specified grid events
        *
        * @param {String} gridEventName Event name of grid-graph for which you intend to trigger a custom event
        * The wrapper class will trigger an event on itself with the same name
        * @return {Object} wrapperModelInstance Wrapper class
        * @method triggerCustomEventsForGridEvent
        * @chainable
        **/
        triggerCustomEventsForGridEvent: function triggerCustomEventsForGridEvent(gridEventName) {
            var self = this,
                gridGraphView = self.get('gridGraphView');
            self.listenTo(gridGraphView, gridEventName, function triggerCustomEventForGrid() {
                self.trigger(gridEventName, arguments);
            });
            return self;
        },

        /**
        * Stops triggering custom event on wrapper class for specified grid events
        *
        * @param {String} gridEventName Event name of grid for which you need to stop triggering a custom event
        * @return {Object} wrapperModelInstance Wrapper class
        * @method stopTriggeringCustomEventsForGridEvent
        * @chainable
        **/
        stopTriggeringCustomEventsForGridEvent: function stopTriggeringCustomEventsForGridEvent(gridEventName) {
            var self = this,
                gridGraphView = self.get('gridGraphView');

            self.stopListening(gridGraphView, gridEventName);
            return self;
        },

        /**
        * Triggers custom event on wrapper class for specified grid events
        *
        * The wrapper class will trigger an event on itself for every mouse move on the grid after the delay
        * @param {number} delayTime Minimum delay required in milliseconds between two consecutive mouse move events.
        * @return {Object} wrapperModelInstance Wrapper class
        * @method triggerCustomEventsForGridEvent
        * @chainable
        **/
        triggerCustomMouseMoveEventForGrid: function triggerCustomMouseMoveEventForGrid(delayTime) {
            var self = this,
                gridGraphData = self.get('gridGraphData'),
                delayTime = delayTime ? delayTime : 0;
            $('#' + gridGraphData.gridGraphOptions.canvasId).on('mousemove.graphWrapper', function _fireMouseMove(event) {
                self._mouseMoveEventForGrid(event,delayTime);
            });
            return self;
        },

        /**
        * Stops triggering custom event on wrapper class for specified grid events
        *
        * @return {Object} wrapperModelInstance Wrapper class
        * @method stopTriggeringCustomEventsForGridEvent
        * @chainable
        **/
        stopTriggeringCustomMouseMoveEventForGrid: function stopTriggeringCustomMouseMoveEventForGrid() {
            var self = this,
                gridGraphData = self.get('gridGraphData');
            $('#' + gridGraphData.gridGraphOptions.canvasId).off('mousemove.graphWrapper', self._mouseMoveEventForGrid);
            return self;
        },

        /**
        * Mouse move listener for custom mouse move event of grid
        *
        * @param {Object} event Dom event object.
        * @method _mouseMoveEventForGrid
        * @private
        **/
        _mouseMoveEventForGrid: function (event, mouseMoveDelay) {
            var self = this,
                mouseMoveEventObject = event;
            if (!self.bMouseMoveTimer) {
                self.bMouseMoveTimer = true;
                window.setTimeout(function () {
                    self.bMouseMoveTimer = false;
                    self.trigger(MathInteractives.Common.Components.Theme2.Models.ToolsGraph.EVENTS.GRID_EVENTS.GRID_LAYER_MOUSEMOVE, mouseMoveEventObject);
                }, mouseMoveDelay);
            }
        },

        /**
        * Triggers custom event on wrapper class for specified equation events
        *
        * @param {Object} equationObject Equation object as defined by the tools.
        * @param {String} equationEventName Event name of equation for which you intend to trigger a custom event
        * @param {String} [uniqueIdentifier=''] An identifier for specific equation
        * The wrapper class will trigger an event on itself with the name equationEventName+uniqueIdentifier
        * @return {Object} wrapperModelInstance Wrapper class
        * @method triggerCustomEventsForGridEvent
        * @chainable
        **/
        triggerCustomEventsForEquation: function triggerCustomEventsForEquation(equationObject, equationEventName, uniqueIdentifier) {
            var self = this,
                uniqueIdentifier = uniqueIdentifier ? uniqueIdentifier : '',
                wrapperEventName = equationEventName + uniqueIdentifier;

            self.listenTo(equationObject, equationEventName, function triggerCustomEventForEquation() {
                self.trigger(wrapperEventName, arguments);
            });
            return self;
        },

        /**
        * Stops triggering custom event on wrapper class for specified equation object event
        *
        * @param {Object} equationObject Equation object as defined by the tools.
        * @param {String} equationEventName Event name of equation for which you need to stop triggering a custom event
        * @return {Object} wrapperModelInstance Wrapper class
        * @method stopTriggeringCustomEventsForGridEvent
        * @chainable
        **/
        stopTriggeringCustomEventsForEquation: function stopTriggeringCustomEventsForEquation(equationObject, equationEventName) {
            var self = this;
            self.stopListening(equationObject, equationEventName);
            return self;
        },

        /**
        * Set value of _isGraphDefaultZoomBehaviourAllowed object
        * @method setDefaultZoomBehaviour
        * @param {Boolean} isAllow  only boolean value allowed
        * @return {Object} wrapperModelInstance Wrapper class
        * @chainable
        */
        setDefaultZoomBehaviour: function setDefaultZoomBehaviour(isAllow) {
            var self = this,
                  gridGraphView = self.get('gridGraphView');
            gridGraphView.setDefaultZoomBehaviour(isAllow);
            return self;
        },

        /**
        * stop double click zoom behaviour of graph
        * @method stopDoubleClickZoom
        * @return {Object} wrapperModelInstance Wrapper class
        * @chainable
        */
        stopDoubleClickZoom: function stopDoubleClickZoom() {
            var self = this,
                     gridGraphView = self.get('gridGraphView');

            gridGraphView.stopDoubleClickZoom();
            return self;
        },

        /**
       * Set value of _isGraphDefaultPanBehaviourAllowed object
       * @method setDefaultPanBehaviour
       * @param {Boolean} isAllow  only boolean value allowed
        * @return {Object} wrapperModelInstance Wrapper class
        * @chainable
       */
        setDefaultPanBehaviour: function setDefaultPanBehaviour(isAllow) {
            var self = this,
                    gridGraphView = self.get('gridGraphView');

            gridGraphView.setDefaultPanBehaviour(isAllow);
            return self;
        },

        /**
        * Draw points for given equation data
        * @method drawPoint
        * @param {object} equation dta object
        * @return {Object} wrapperModelInstance Wrapper class
        * @chainable
        */
        drawPoint: function drawPoint(equationData, hollowPoints) {
            var self = this,
                    gridGraphView = self.get('gridGraphView');

            gridGraphView.drawPoint(equationData, hollowPoints);
            return self;
        },

        /**
        * Fill color to equation object
        * @method setFillColor
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @param color {object} color
        * @return {Object} wrapperModelInstance Wrapper class
        * @chainable
        */
        setFillColor: function setFillColor(equationObject, color) {
            var self = this,
                gridGraphView = self.get('gridGraphView');

            equationObject.setIsFilled(true);
            equationObject.setFillColor(color);
            return self;
        },

        /**
        * Remove fill color of equation object
        * @method removeFillColor
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @return {Object} wrapperModelInstance Wrapper class
        * @chainable
        */
        removeFillColor: function removeFillColor(equationObject) {
            var self = this,
                    gridGraphView = self.get('gridGraphView');

            equationObject.setIsFilled(false);
            return self;
        },

        /**
        * Acivates a specific grid layer
        * @method activateNewGridLayer
        *
        * @param {String} layerName Name of the new grid layer to be activated
        * @return {Object} wrapperModelInstance Wrapper class
        * @chainable
        */
        activateNewGridLayer: function activateNewGridLayer(layerName) {
            var self = this,
                gridGraphView = self.get('gridGraphView');

            gridGraphView.activateNewLayer(layerName);
            return self;
        },

        /**
        * Acivates a previous grid layer
        * @method activatePreviousGridLayer
        *
        * @return {Object} wrapperModelInstance Wrapper class
        * @chainable
        */
        activatePreviousGridLayer: function activatePreviousGridLayer() {
            var self = this,
                gridGraphView = self.get('gridGraphView');

            gridGraphView.activateEarlierLayer();
            return self;
        },

        /**
        * Initializes Accessibility of grid graph. 
        * @method initGridGraphAcc
        *
        * @return {Object} wrapperModelInstance Wrapper class
        * @chainable
        */
        initGridGraphAcc: function initGridGraphAcc() {
            var self = this,
                paperScope = self.getGridGraphScope(),
                gridGraphView = self.get('gridGraphView'),
                focusRect = null,
                style = self._getFocusRectStyle();

            //Activate the service layer to draw the focus rectangle
            self.activateNewGridLayer(LAYER_NAMES.SERVICE_LAYER);

            //The focus rect for acc
            focusRect = new paperScope.Path.Rectangle([0, 0, 1, 1]);
            self.set('focusRect', focusRect);
            focusRect.style = style;
            self.hideFocusRect();
            //Bring back the previous layer for Tools to continue
            self.activatePreviousGridLayer();
            return self
        },

        /**
        * Sets focus to the given equation graph
        * @method setFocus
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @return {Object} wrapperModelInstance Wrapper class
        * @chainable
        */
        setFocus: function setFocus(equationObject) {
            var self = this,
                FOCUS_OFFSET = Classname.FOCUS_OFFSET,
                //Get the paper group specific to the equation
                paperGroup = self._getPaperGroup(equationObject),
                bounds = paperGroup.bounds,
                topLeft = bounds.topLeft,
                bottomRight = bounds.bottomRight,
                //Calculate the new bounds
                topLeft = [topLeft.x - FOCUS_OFFSET, topLeft.y - FOCUS_OFFSET],
                bottomRight = [bottomRight.x + FOCUS_OFFSET, bottomRight.y + FOCUS_OFFSET],
                boundsData = {
                    topLeft: topLeft,
                    bottomRight: bottomRight
                };

            //Redraw the focus with new bounds
            return self._redrawFocus(boundsData);
        },

        /**
        * Get the paper group by calling specific functions for specific species
        * @method _getPaperGroup
        *
        * @param {Object} equationObject Equation as defined by the tools (Equation Data)
        * @return {Object} group Paper group of items
        * @private
        */
        _getPaperGroup: function _getPaperGroup(equationObject) {
            var self = this,
                specie = equationObject.getSpecie(),
                group = null;

            switch (specie) {
                case 'point':
                    group = self.getPointsGroupForEquation(equationObject);
                    break;
                case 'polygon':
                case 'plot':
                default:
                    group = self.getPathGroupForEquation(equationObject);
                    break;
            }
            return group;
        },

        /**
        * Show the focus rectangle on grid graph
        * @method showFocusRect
        *
        * @return {Object} wrapperModelInstance Wrapper class
        * @chainable
        */
        showFocusRect: function showFocusRect() {
            var self = this;
            self.get('focusRect').opacity = 1;
            self.refreshGridGraph();
            return self;
        },

        /**
        * Hide the focus rectangle on grid graph
        * @method hideFocusRect
        *
        * @return {Object} wrapperModelInstance Wrapper class
        * @chainable
        */
        hideFocusRect: function hideFocusRect() {
            var self = this;
            self.get('focusRect').opacity = 0;
            self.refreshGridGraph();
            return self;
        },

        /**
        * Redraw the focus rect with new data for hte bounds
        * @method _redrawFocus
        *
        * @return {Object} wrapperModelInstance Wrapper class
        * @private
        * @chainable
        */
        _redrawFocus: function _redrawFocus(boundsData) {
            var self = this,
                paperScope = self.getGridGraphScope(),
                style = self._getFocusRectStyle(),
                focusRect = null;

            //Remove the previous focus rect
            self.get('focusRect').remove();
            //Redraw with new bounds
            focusRect = new paperScope.Path.Rectangle(boundsData);
            focusRect.style = style;
            self.set('focusRect', focusRect);

            return self.showFocusRect();
        },

        /**
        * Get the style object for grid graph
        * @method _getFocusRectStyle
        *
        * @return {Object} style Style for the paper item (Focus rect)
        * @private
        */
        _getFocusRectStyle: function _getFocusRectStyle() {
            var strokeColor = '#aaa',
                strokeWidth = 2,
                dashArray = [2, 2],
                style = {
                    strokeColor: strokeColor,
                    dashArray: dashArray,
                    strokeWidth: strokeWidth
                };
            return style;
        }
    }, {
        /**
        * Returns accessibility text for equations
        *
        * @method GET_ACC_TEXT
        * @param latex {String} in latex form
        * @return {String} text as returned by tools accessibility for equations
        * @final
        **/
        GET_ACC_TEXT: function GET_ACC_TEXT(latex) {
            return MathUtilities.Components.EquationEngine.Models.ParserAssist.getEquationAccessibility(latex);
        },
        EVENTS: {
            EQUATION_EVENTS: {
                /**
                * Fired when an equation object is dragged
                *
                * @event post-drag
                * @param {Object} equation Equation as defined by the tools (Equation Data)
                * @param {Number} deltaX Shift in x coordinate
                * @param {Number} deltaY Shift in y coordinate
                * @param {Array} position Paper position array
                * @param {Boolean} forceDrawing If force draw is on or off
                */
                POST_DRAG: 'post-drag',

                DRAG_BEGIN: 'drag-begin',
                DRAG_END: 'post-relocate',

                PLOT_COMPLETE: 'plotComplete'
            },


            GRID_EVENTS: {
                GRID_LAYER_MOUSEDOWN_SENSED: 'grid-layer-mousedown-sensed',
                GRID_LAYER_CLICK: 'grid-layer-click',
                GRID_LAYER_DOUBLE_CLICK: 'grid-layer-doubleclick',
                GRID_LAYER_MOUSEDRAG: 'grid-layer-mousedrag',
                GRID_LAYER_MOUSEUP: 'grid-layer-mouseup',
                GRID_LAYER_DRAGBEGIN: 'grid-layer-dragBegin',
                GRAPH_ZOOM_PAN: 'graph:zoom-pan',

                POINT_LAYER_MOUSEUP: 'point-layer-mouseup',
                POINT_LAYER_MOUSEDOWN_SENSED: 'point-layer-mousedown-sensed',
                POINT_LAYER_CLICK: 'point-layer-click'
            }
        },

        LAYER_NAMES: {
            GRID_LAYER: 'grid',
            SHAPE_LAYER: 'shape',
            CUSTOM_SHAPE_LAYER: 'customShape',
            POINT_LAYER: 'point',
            BANNER_LAYER: 'banner',
            IMAGE_LAYER: 'image',
            ANNOTATION_LAYER: 'annotation',
            SERVICE_LAYER: 'service',
        },

        FOCUS_OFFSET: 2




    });

    Classname = MathInteractives.Common.Components.Theme2.Models.ToolsGraph;
    EVENTS = Classname.EVENTS;
    LAYER_NAMES = Classname.LAYER_NAMES;
})(window.MathInteractives);