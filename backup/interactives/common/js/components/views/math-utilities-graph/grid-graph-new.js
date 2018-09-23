/*
* Change Log
* For integration in MathInteractives namespace
* Authors: Sohel Ansari and Parag Datar 
* **********************************************
* 1
* Add property '_backgroundColor' and default set as 'White' that can be passed as option for layer background color
*
* **********************************************
* 2
* Add parameter 'forceApply' in function '_axisMarkerMultiplierAdjuster'
* **********************************************
* 3
* Add function 'hideGridLines'
* Add function 'hideLabels'
* Add function 'hideAxis'
* **********************************************
* 4
* line number 41 ID: null, removed its original structure
* and structure is apllied to variable ID on initialize of the view
* line number 41, 392-422
* **********************************************
* 5
* line 5684
* showToolTipForPoint function modified for interactives specific tooltip
* **********************************************
* 6
* this._paperScope.tool.onMouseDrag line 950, this._paperScope.tool.onMouseUp line 966 edited for changing cursor
* **********************************************
* 7
* mouseIn, mouseOut logic separated into two functions, changes into '_drawPoints' and '_redrawPoints' line number 5106, 5336
* path.onMouseEnter = pathMouseInFunction 
* path.onMouseLeave = pathMouseOutFunction
* **********************************************
* 8
* new functions for path changing color on hover added
* _togglePointsColor, _showHoverOnPoint, _removeHoverOnPoint
* on line 4983
*/
(function (MathInteractives) {
    'use strict';
    //paper.install(window);

    /**
    *@class GridGraph
    *@extends Backbone.View
    */
    MathInteractives.Common.Components.Views.MathUtilitiesGraphNew.GridGraph = Backbone.View.extend({

        /**
        * Contain ID's of Dom elements.
        * @property  ID
        * @type {Object}
        * @static
        */
        /*this is now achieve by using attributes not by id string*/
        ID: null,

        /**
        * Whether graph pan action performed or not.
        * @property _shapePan
        * @type {Boolean}
        */
        _shapePan: null,

        /**
        * Store project layers, it contain different layer object of paper
        * @property _projectLayers
        * @type {Object}
        */
        _projectLayers: null,

        /**
        * Store paper-scope for graph view
        *
        * @property _paperScope
        * @type {object}
        * @static
        */
        _paperScope: null,

        /**
        * Store value of canvas width and height. 
        * 
        * @property  _canvasSize
        * @type {Object}
        * @static
        */
        _canvasSize: null,

        /**
        * Contain graphs axis Limits
        * 
        * @property  markerBounds
        * @type {Object}
        */
        markerBounds: null,

        /**
        * It contains array for storing values of polar angles in radian and degrees
        *
        * @property  _polarLineAngleMarker
        * @type {Object}
        * @static
        */
        _polarLineAngleMarker: null,

        /**
        * It is array of values which are used as zooming factor,
        *
        * @property  _zoomFactors
        * @type Number
        * @static
        */
        _zoomFactors: [1, 2, 5],

        /**
        * It contain horizontal and vertical alignment string.
        *
        *@property TEXT_ALIGN
        *@type Object
        *@static
        */
        TEXT_ALIGN: {
            HORIZONTAL: {
                LEFT: 'left',
                RIGHT: 'right',
                CENTER: 'center'
            },
            VERTICAL: {
                TOP: 'top',
                BOTTOM: 'bottom',
                MIDDLE: 'middle'
            }
        },

        /**
        * It contain symbol for representing PI value.
        *
        * @property  PI
        * @type String
        * @Final
        */
        PI: 'π',

        /**
        * it contain minimum value,allowed between graph lines.
        * @property  ADJECENT_LINES_MIN_DISTANCE
        * @type Number
        * @Final
        */
        //Do not change this value.
        _ADJECENT_LINES_MIN_DISTANCE: 14,
	MINIMUM_THRESHOLD_LINE_DISTANCE: 15,

        /**
        * distance between adjecent lines.
        * @property  _ZOOM_DISTANCE
        * @type Number
        * @Final
        */
        //Do not change this value.
        _ZOOM_DISTANCE: 3,

        /**
        * Minimum level for graph zoom.
        * 
        * @property  _MINIMUM_ZOOM_LEVEL_FACTOR
        * @type {Object}
        */
        /*_MINIMUM_ZOOM_LEVEL_FACTOR: 0.65,*/

        /**
        * Value by which graph zoom level change.
        * 
        * @property  _ZOOM_LEVEL_INCREMENT_STEPS
        * @type {Object}
        */
        //zoom Level increment-decrement step
        /*_ZOOM_LEVEL_INCREMENT_STEPS: 0.1,*/

        /**
        * store value of number of steps if marker value is multiplier of 2 or 10
        * As per desmos, if marker value is multiplier of 2 or 10, then zoom Steps are 6
        * @property  _ZOOM_STEPS
        * @type {Object}
        */
        _ZOOM_STEPS: 6,

        /**
        * store value of number of steps if marker value is in multiplier of 5
        * As per desmos, if marker value is multiplier of 5, then zoom Steps are 8
        * @property  _ZOOM_STEPS_FOR_FIVE_MULTIPLIER
        * @type {Object}
        */
        _ZOOM_STEPS_FOR_FIVE_MULTIPLIER: 8,

        /**
       * store value of number of grid lines for two adjecent marker value
       * As per desmos, if marker value is multiplier of 5, then grid lines are 5 else 4
       * @property  GRID_LINES
       * @type {Object}
       */
        GRID_LINES: {
            DEFAULT: 4,
            FIVE_MULTIPLIER: 5
        },
        /**
        * Contains value of font size for marker.
        * @method MARKER_FONT_SIZE
        * @type {Object}
        */
        MARKER_FONT_SIZE: {
            ON_GRAPH_AREA: 12,
            ON_GRAPH_AREA_PROJECTOR_MODE: 16

        },
        /**
        * Contains value of font color for marker.
        * @method MARKER_FONT_COLOR
        * @type {Object}
        */
        MARKER_FONT_COLOR: {
            ON_GRAPH_AREA: '#000000',
            AT_END_OF_GRAPH_AREA: 'grey'
        },
        /**
        * It contain grid-graph model.
        * @property _gridGraphModelObject
        * @type  MathUtilities.Components.Graph.Models.GridGraphModel
        */
        _gridGraphModelObject: null,


        /**
        * It is used to stop or start default graph zoom behaviour.
        * if value is true, then graph default zoom behaviour is performed.
        * 
        * @property  isGraphDefaultZoomBehaviourAllowed
        * @type {Object}
        */

        _isGraphDefaultZoomBehaviourAllowed: null,

        /**
        * It is used to stop or start default graph pan behaviour.
        * if value is true, then graph default pan behaviour is performed.
        * 
        * @property  isGraphDefaultPanBehaviourAllowed
        * @type {Object}
        */
        _isGraphDefaultPanBehaviourAllowed: null,

        snapToGridFlag: undefined,

        isDragInProgress: undefined,

        _X10_STRING: '×10',

        _gridMode: null,

        _selectionRect: null,
        _touchDoubleTapCounter: null,
        _DOUBLE_TAP_THRESHOLD: 600,
        _pinchCounter: null,

        /*Minimum zoom Level step*/
        _MINIMUM_ZOOM_LEVEL_FACTOR: 0.65,

        /**
        * Maximun level for graph zoom.
        * 
        * @property  _MAXIMUM_ZOOM_LEVEL_FACTOR
        * @type {Object}
        */
        //Maximum zoom Level step
        _MAXIMUM_ZOOM_LEVEL_FACTOR: 1.5,

        /**
        * Value by which graph zoom level change.
        * 
        * @property  _ZOOM_LEVEL_INCREMENT_STEPS
        * @type {Object}
        */
        //zoom Level increment-decrement step
        _ZOOM_LEVEL_INCREMENT_STEPS: 0.1,



        /**
        * Maximun value by which graph can be shift.
        * 
        * @property  _GRAPH_SHIFT_DISTANCE
        * @type {Object}
        */
        //standard disiance for origin shift when zoom-in or zoom out
        _GRAPH_SHIFT_DISTANCE: 50,

        /**
        * Distance by which graph should be shift,during zoom-in and zoom-out
        * 
        * @property  graphShiftDistance
        * @type {Object}
        */
        graphShiftDistance: null,

        /**
        * Hold value by which graph shift by last dragging action.
        * 
        * @property  graphShiftDistance
        * @type {Object}
        */
        graphShiftDistanceAfterDrag: null,

		isSnap: false,

        /**
        * Determines whether drawn points, shapes on graph are draggable or not.
        * 
        * @property  isDrawingsDraggable
        * @type {boolean}
        */
        isDrawingsDraggable: null,

        /**
        * Determines whether to show tooltip when point is clicked
        * 
        * @property  isDrawingsDraggable
        * @type {boolean}
        */
        isTooltipForPoint: null,

        /**
        * Stores the amount of padding to be left at top & bottom in pixels
        * 
        * @property  paddingTop
        * @type {Number}
        */
        paddingTop: 0,

        /**
        * Stores the amount of padding to be left at left & right in pixels
        * 
        * @property  paddingLeft
        * @type {Number}
        */
        paddingLeft: 0,

        settingsOption: {
            XLowerTextBox: 'x-lower-text-box',
            XUpperTextBox: 'x-upper-text-box',
            YLowerTextBox: 'y-lower-text-box',
            YUpperTextBox: 'y-upper-text-box',
            graphTypeButton: 'change-graph-type',
            zoomInButton: 'zoom-graph',
            zoomOutButton: 'zoom-out-graph',
            restoreDefaultZooming: 'restore-default-zoom',
            gridLineDisplayButton: 'toggle-grid-line-display',
            labelLineDisplayButton: 'toggle-label-display',
            axesLinesDisplayButton: 'toggle-axes-display',
            equalizeAxisScaleButton: 'equalize-axis',
            projectorModeButton: 'toggle-projector-mode',
            xAxisLabelInRadian: 'change-x-axis-label-to-radian',
            xAxisLabelInDegree: 'change-x-axis-label-to-degree',
            yAxisLabelInRadian: 'change-y-axis-label-to-radian',
            yAxisLabelInDegree: 'change-y-axis-label-to-degree',
            polarAngleInDegree: 'change-polar-angle-label-to-degree',
            polarAngleInRadian: 'change-polar-angle-label-to-radian',
            polarAngleLinesButton: 'toggle-polar-angle-label-style',
            xAxisLableStyleButton: 'toggle-x-axis-label-style',
            yAxisLabelStyleButton: 'toggle-y-axis-label-style'
        },

        events: {
            'click': '_functionAttacher',
            'keyup': '_functionAttacher',
            'mousewheel': '_functionAttacher',
            //comment by shashank
            //'dblclick': '_functionAttacher'
        },

        /**
         * It is used to check if gesture is in progress
         * @property _isGestureProgress
         * @type Boolean
         * @default null
        */
        _isGestureProgress: true,

        resetGridMode: function resetGridMode() {
            this._gridMode = 'Graph';
        },

        getGridMode: function getGridMode() {
            return this._gridMode;
        },

        setGridMode: function setGridMode(gridMode) {
            this._gridMode = gridMode;
        },

        isSnapToGridEnabled: function () {
            return this.snapToGridFlag;
        },

        setSnapSnapToGridFlag: function (flag) {
            this.snapToGridFlag = flag;
        },

        _isGridRefreshPaused: undefined,


        pauseGridRefresh: function () {
            this._isGridRefreshPaused = true;
        },

        resumeGridRefresh: function () {
            this._isGridRefreshPaused = false;
        },


        /**
        *It is used to call different functions depending upon user action.
        *
        *@method _functionAttacher
        *@param {Object} event An user action,it can be click,keyup,mousewheel,double-click.
        *@param {Number} delta It will have an integer value for mouseWheel event,for other events its value will be undefined
        */


        /*attach different function to different click event*/
        _functionAttacher: function eventFunctionAttacher(event, delta) {
            var id = this.ID,
                keyCode,
                keyCodesToBeNeglected,
                option = this.settingsOption,
                currentOption = $(event.target).attr('data-setting-option');
            switch (event.type) {
                case 'click':
                    switch (currentOption) {
                        case option.graphTypeButton:
                            this._graphTypeChange();
                            break;

                        case option.gridLineDisplayButton:
                            this._gridLineDisplayChange();
                            break;

                        case option.labelLineDisplayButton:
                            this._labelDisplayChange();
                            break;

                        case option.axesLinesDisplayButton:
                            this._axisDisplayChange();
                            break;

                        case option.projectorModeButton:
                            this._projectorModeChange();
                            break;

                        case option.equalizeAxisScaleButton:
                            this._equalizeAxisScales();
                            break;

                        case option.xAxisLabelInRadian:
                            this._xAxisMarkerLineStyle(true);
                            break;

                        case option.xAxisLabelInDegree:
                            this._xAxisMarkerLineStyle(false);
                            break;

                        case option.yAxisLabelInRadian:
                            this._yAxisMarkerLineStyle(true);
                            break;

                        case option.yAxisLabelInDegree:
                            this._yAxisMarkerLineStyle(false);
                            break;

                        case option.polarAngleInDegree:
                            this._polarAngleLineMarkerStyle(false);
                            break;

                        case option.polarAngleInRadian:
                            this._polarAngleLineMarkerStyle(true);
                            break;

                        case option.polarAngleLinesButton:
                            this._polarAngleLineMarkerStyleToggle();
                            break;

                        case option.xAxisLableStyleButton:
                            this._xAxisMarkerStyleToggle();
                            break;

                        case option.yAxisLabelStyleButton:
                            this._yAxisMarkerStyleToggle();
                            break;

                        case option.zoomInButton:
                            this._zoomInButtonClicked();
                            break;

                        case option.restoreDefaultZooming:
                            this._restoreDefaultZoomingClicked();
                            break;

                        case option.zoomOutButton:
                            this._zoomOutButtonClicked();
                            break;

                        case option.XLowerTextBox:
                        case option.XUpperTextBox:
                        case option.YLowerTextBox:
                        case option.YUpperTextBox:
                            // this condition is added so that, curser doesn't change its position in textboxes,
                            // and in default condition we can call _setTextBoxValues
                            break;

                        default:
                            this._setTextBoxValues();
                            break;
                    }
                    break;

                case 'keyup':
                    keyCode = event.keyCode;
                    // keycodes enum 48-57 = Numbers 1-9
                    //               96-105 = Numpad 1-9
                    //               110 = decimal point
                    //               190 = period
                    //               109 = subtract
                    //               189 = dash
                    //               37-40 = arrow keys
                    //               13 = enter key
                    //               9 = tab
                    //               20 = CAPS LOCK
                    //               27 = esc
                    //               33 = page up
                    //               34 = page down
                    //               35 = end
                    //               36 = home
                    //               45 = insert
                    //keyCodesToBeAccepted = (event.shiftKey === false && ((keyCode >= 48 && keyCode <= 57 )|| (keyCode >= 96 && keyCode <= 105) || keyCode === 110 || keyCode=== 190 || keyCode===109||keyCode===189));
                    keyCodesToBeNeglected = [37, 38, 39, 40, 13, 9, 20, 27, 33, 34, 35, 36, 45];
                    switch (currentOption) {
                        case option.XLowerTextBox:
                        case option.XUpperTextBox:
                            //if (keyCodesToBeAccepted) {
                            if (keyCodesToBeNeglected.indexOf(keyCode) === -1) {
                                this._graphAxisLimitChangedByUserInput(true, keyCodesToBeNeglected);
                            }
                            //}
                            break;

                        case option.YLowerTextBox:
                        case option.YUpperTextBox:
                            //if (keyCodesToBeAccepted) {
                            if (keyCodesToBeNeglected.indexOf(keyCode) === -1) {
                                this._graphAxisLimitChangedByUserInput(false, keyCodesToBeNeglected);
                            }
                            //}
                            break;
                    }
                    break;

                case 'mousewheel':

                    switch (event.target.id) {
                        case id.canvasId:
                            MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('graph');

                            if (this._isGraphDefaultZoomBehaviourAllowed === true && this._gridMode === 'Graph') {
                                this.setDefaultPanBehaviour(false);
                                this._zoomGraph(delta, true);
                                this.setDefaultPanBehaviour(true);
                                event.preventDefault();
                            }

                            break;
                    }
                    break;

                case 'dblclick':
                    switch (event.target.id) {
                        case id.canvasId:
                            //comment by shashank
                            //this._graphDoubleClick();
                            break;
                    }
                    break;
            }
        },
        /**
        * trigger if graph is equalize or not
        * @method _triggerEqualizeEvent
        * @param {Boolean} true if graph equalize, else unequalize
        */

        _triggerEqualizeEvent: function _triggerEqualizeEvent(isGraphNotEqualize) {
            if (isGraphNotEqualize === true) {
                this.trigger('graph:un-equalize');
            }
            else {
                this.trigger('graph:equalize');
            }
        },


        _customZoomInMultiplier: null,
        _customZoomOutMultiplier: null,
        _backgroundColor: 'white',

        initialize: function initialize() {
            this.ID = {
                canvasId: null,
                XLowerTextBox: null,
                XUpperTextBox: null,
                YLowerTextBox: null,
                YUpperTextBox: null,
                graphTypeButton: null,
                zoomInButton: null,
                zoomOutButton: null,
                restoreDefaultZooming: null,
                gridLineDisplayButton: null,
                labelLineDisplayButton: null,
                axesLinesDisplayButton: null,
                equalizeAxisScaleButton: null,
                projectorModeButton: null,
                xAxisLabelInRadian: null,
                xAxisLabelInDegree: null,
                yAxisLabelInRadian: null,
                yAxisLabelInDegree: null,
                polarAngleInDegree: null,
                polarAngleInRadian: null,
                polarAngleLinesButton: null,
                xAxisLableStyleButton: null,
                yAxisLabelStyleButton: null
            };
            this._projectLayers = {
                gridLayer: null,
                shapeLayer: null,
                pointLayer: null,
                imageLayer: null,
                serviceLayer: null
            };
            this._canvasSize = {
                height: null,
                width: null
            };
            this.markerBounds = {
                max: {
                    x: null,
                    y: null,
                    '\\theta': null
                },
                min: {
                    x: null,
                    y: null,
                    '\\theta': null
                }
            };
            this._polarLineAngleMarker = {
                degree: [],
                radian: []
            }
            var option, target, equation, self;
            option = this.options.option;
            this.disableLineTooltip = this.options.option.disableLineTooltip;
            this._gridGraphModelObject = new MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.GridGraphModel();
            this.adjustGraphToPoints = this.options.option.adjustGraphToPoints;
            this._gridGraphModelObject.set('_points', []);
            this._gridGraphModelObject.set('_plots', []);
            this._gridGraphModelObject.set('_images', []);
            this._defaultClassVariblesValue();
            this._updateClassVariablesValue(option);
            if (typeof this.options.option.paddingTop !== 'undefined') {
                this.paddingTop = this.options.option.paddingTop;
            }
            if (typeof this.options.option.paddingLeft !== 'undefined') {
                this.paddingLeft = this.options.option.paddingLeft;
            }
            /*
            if (option.zoomInMultiplier) {
                this._customZoomInMultiplier = option.zoomInMultiplier;
            }
            if (option.zoomOutMultiplier) {
                this._customZoomOutMultiplier = option.zoomOutMultiplier;
            }
            */

            this.isDragInProgress = false;

            this.snapToGridFlag = false;
            this._gridMode = 'Graph';
            /*polar lines angle marker value generator*/
            this._polarAngleLinesMarkerArrayGenerator();

            /*function to set up canvas heigth and width*/
            this._canvasSetUp();
            if (option.backgroundColor) {
                //this._backgroundColor = 'black';
                this._backgroundColor = new this._paperScope.Color(option.backgroundColor[0], option.backgroundColor[1], option.backgroundColor[2], option.backgroundColor[3]);
            }
            /*function to attach canvas tool*/
            this._canvasTool();
            this.render();

            self = this;

            this._onShapeRollOver = function (event) {
                if (self.isDragInProgress || self._gridMode !== 'Graph') {
                    return;
                }
                target = event.target;
                if (!$(event.event.target).is('canvas')) {
                    //console.log('CANVAS!!!');
                    return;
                }
                equation = target.equation;
                if (!equation.isDraggable()) {
                    return;
                }
                equation.trigger('roll-over', equation);
            };
            this._onShapeRollOut = function (event) {
                if (self.isDragInProgress || self._gridMode !== 'Graph') {
                    return;
                }
                if (!$(event.event.target).is('canvas')) {
                    //console.log('CANVAS!!!');
                    return;
                }
                target = event.target;
                equation = target.equation;
                if (!equation.isDraggable()) {
                    return;
                }
                equation.trigger('roll-out', equation);
            };
        },

        render: function render() {
            this._cartesionSymbolGenerator();
            this._restoreDefaultZoom();
        },

        /**
        *Set values of default values of class variables.
        *
        *@private
        *@method _defaultClassVariblesValue
        *@return
        */

        /*set value of all global variable*/
        _defaultClassVariblesValue: function _defaultClassVariablesValue() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                canvas = this._canvasSize,
                origin = graphDisplay._graphOrigin,
                limits = graphDisplay._graphsAxisLimits,
                parameter = graphDisplay._graphParameters,
                scope = this._paperScope;

            /*Set canvasSize variable value*/
            canvas.height = 800;
            canvas.width = 1244;

            /*set graph Limits value*/
            limits.defaultLimits.xLower = limits.currentLimits.xLower = -10;
            limits.defaultLimits.xUpper = limits.currentLimits.xUpper = 10;
            limits.defaultLimits.yLower = limits.currentLimits.yLower = -10;
            limits.defaultLimits.yUpper = limits.currentLimits.yUpper = 10;

            /*grid Line count*/
            parameter.graphGridLine = 4;
            parameter.xGridLine = 4;
            parameter.yGridLine = 4;

            //            origin.defaultOrigin = new paper.Point(canvas.width / 2, canvas.height / 2);
            this._shapePan = false;
            this._isGraphDefaultZoomBehaviourAllowed = true;
            this._isGraphDefaultPanBehaviourAllowed = true;


            this.graphShiftDistance = this._GRAPH_SHIFT_DISTANCE;
            this.graphShiftDistanceAfterDrag = this.graphShiftDistance;

            this.isDrawingsDraggable = false;
            this.isTooltipForPoint = true;

        },

        /**
        *Update default values of class variable depending upon parameter passed while creating object of class.
        *
        *@private
        *@method _updateClassVariablesValue
        *@return
        */
        _updateClassVariablesValue: function _updateClassVariablesValue(option) {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                canvas = this._canvasSize,
                domElement = graphDisplay._graphLimitTextBoxDomElement,
                id = this.ID,
                limits = graphDisplay._graphsAxisLimits;


            /*set ids value*/
            id.canvasId = option.canvasId;
            id.XLowerTextBox = option.XLowerTextBox;
            id.XUpperTextBox = option.XUpperTextBox;
            id.YLowerTextBox = option.YLowerTextBox;
            id.YUpperTextBox = option.YUpperTextBox;
            id.graphTypeButton = option.graphTypeButton;
            id.zoomInButton = option.zoomInButton;
            id.zoomOutButton = option.zoomOutButton;
            id.restoreDefaultZooming = option.restoreDefaultZooming;
            id.gridLineDisplayButton = option.gridLineDisplayButton;
            id.labelLineDisplayButton = option.labelLineDisplayButton;
            id.axesLinesDisplayButton = option.axesLinesDisplayButton;
            id.equalizeAxisScaleButton = option.equalizeAxisScaleButton;
            id.projectorModeButton = option.projectorModeButton;
            id.xAxisLabelInRadian = option.xAxisLabelInRadian;
            id.xAxisLabelInDegree = option.xAxisLabelInDegree;
            id.yAxisLabelInRadian = option.yAxisLabelInRadian;
            id.yAxisLabelInDegree = option.yAxisLabelInDegree;
            id.polarAngleInRadian = option.polarAngleInRadian;
            id.polarAngleInDegree = option.polarAngleInDegree;
            id.yAxisLabelStyleButton = option.yAxisLabelStyleButton;
            id.xAxisLableStyleButton = option.xAxisLableStyleButton;
            id.polarAngleLinesButton = option.polarAngleLinesButton;


            /*get dom element for text box*/
            domElement.xLower = document.getElementById(id.XLowerTextBox);
            domElement.xUpper = document.getElementById(id.XUpperTextBox);
            domElement.yLower = document.getElementById(id.YLowerTextBox);
            domElement.yUpper = document.getElementById(id.YUpperTextBox);


            /*set canvas size*/
            if (typeof (option.canvasHeight) === 'number' && typeof (option.canvasWidth) === 'number') {
                canvas.height = option.canvasHeight;
                canvas.width = option.canvasWidth;
            }

            /*set axis Limits value*/
            if (typeof (option.xAxisMinValue) === 'number' && typeof (option.xAxisMaxValue) === 'number') {
                limits.defaultLimits.xLower = limits.currentLimits.xLower = option.xAxisMinValue;
                limits.defaultLimits.xUpper = limits.currentLimits.xUpper = option.xAxisMaxValue;
            }

            if (option._isGraphDefaultZoomBehaviourAllowed !== undefined) {
                this._isGraphDefaultZoomBehaviourAllowed = option.isGraphDefaultZoomBehaviourAllowed;
            }
            if (option._isGraphDefaultPanBehaviourAllowed !== undefined) {
                this._isGraphDefaultPanBehaviourAllowed = option.isGraphDefaultPanBehaviourAllowed;
            }

            //graphDisplay._graphOrigin.defaultOrigin = new paper.Point(canvas.width / 2, canvas.height / 2);

            if (option.isDrawingsDraggable) {
                this.isDrawingsDraggable = true;
            }

            /*set isTooltipForPoint when not undefined*/
            if (option.isTooltipForPoint || option.isTooltipForPoint === false) {
                this.isTooltipForPoint = option.isTooltipForPoint;
            }

            if (option.stopDoubleClickZoom) {
                graphDisplay._zoomingFactor.doubleClickZoomAllow = !option.stopDoubleClickZoom;
            }

        },


        /**
        *Set canvas width and height,also attach canvas element to paper object.
        *@private
        *@method _canvasSetUp
        *@return
        *
        */

        /*set canvas height and width also attach canvas element to paper object */
        _canvasSetUp: function _canvasSetUp() {

            var graphDisplay = this._gridGraphModelObject.get('_graphDisplayValues'),
                canvas = document.getElementById(this.ID.canvasId),
                height = this._canvasSize.height,
                width = this._canvasSize.width,
                $canvas = $(canvas),
                scope,
                Layer, self;

            if ($canvas.width() === 300 && $canvas.height() === 150) {
                /*set canvas size to above define height and width */
                $canvas.width(width).height(height);
            }
            else {
                this._canvasSize.width = $canvas.width();
                this._canvasSize.height = $canvas.height();
            }

            /*set canvas as paper object*/
            this._paperScope = new paper.PaperScope();
            this._paperScope.install($('#' + this.ID.canvasId))
            this._paperScope.setup(canvas);
            self = this;
            /*$('#' + this.ID.canvasId).parents('.math-utilities-components-tool-holder').on('mouseenter', function () {
                console.log(self._paperScope)
                self._paperScope.activate();
            });*/
            scope = this._paperScope,
            graphDisplay._graphOrigin.defaultOrigin = new this._paperScope.Point(canvas.width / 2, canvas.height / 2);


            //            paper.view.viewSize = [width, height];
            this._gridGraphModelObject.get('_graphDisplayValues')._graphOrigin.defaultOrigin = new scope.Point(this._canvasSize.width / 2, this._canvasSize.height / 2);
            this._projectLayers.gridLayer = scope.project.activeLayer;
            this._projectLayers.imageLayer = new scope.Layer();
            this._projectLayers.shapeLayer = new scope.Layer();
            this._projectLayers.pointLayer = new scope.Layer();

            this._projectLayers.labelLayer = new scope.Layer();
            this._projectLayers.bannerLayer = new scope.Layer();
            this._projectLayers.annotationLayer = new scope.Layer();
            this._projectLayers.serviceLayer = new scope.Layer();
            this._projectLayers.gridLayer.activate();
            self = this;
            this._pinchCounter = 1;
            canvas.addEventListener('gesturechange', function (event) {
                if (self._isGraphDefaultZoomBehaviourAllowed === true) {
                    self._pinchZoom(event);
                }
            });
            canvas.addEventListener('gesturestart', function (event) {
                self._gestureStartEvent = event;
                //self._isGraphDefaultPanBehaviourAllowed = false;
                self._isGestureProgress = false;
                //self.setDefaultPanBehaviour(false);
            });
            canvas.addEventListener('gestureend', function () {
                self._gestureStartEvent = null;
                //self._isGraphDefaultPanBehaviourAllowed = true;
                self._isGestureProgress = true;
                //self.setDefaultPanBehaviour(true);
            });
            canvas.addEventListener('touchstart', function (event) {
                if (self._touchDoubleTapCounter === null) {
                    self._touchDoubleTapCounter = new Date().getTime();
                }
                else {
                    if (new Date().getTime() - self._touchDoubleTapCounter > self._DOUBLE_TAP_THRESHOLD) {
                        self._touchDoubleTapCounter = null;
                    }
                    else {
                        self._touchDoubleTapCounter = null;
                        self._graphDoubleClick(event);
                    }
                }
            });
        },

        _gestureStartEvent: null,

        _pinchZoom: function _pinchZoom(event) {
            var self = this,
                canvasOffset = $('#' + self.ID.canvasId).offset(),
                    startPoint = {
                        x: self._gestureStartEvent.pageX - canvasOffset.left,
                        y: self._gestureStartEvent.pageY - canvasOffset.top
                    };
            //self._graphDoubleClick(event, startPoint);

            self.activateScope();
            //            console.log(this._shapePan)
            var i = 1, othis, totalShiftPoint, clickedPoint, origins, zoomCaller, currentOrigin, zoomingFactors,
                defaultOrigin, modelObject, graphDisplay, interval, height, width, clickedPointGraphCoOrdinate, shiftFactor, doubleClickZoomAllow;



            modelObject = self._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');
            //doubleClickZoomAllow = graphDisplay._zoomingFactor.doubleClickZoomAllow;

            //if (!this._shapePan && doubleClickZoomAllow !== false) {
            origins = graphDisplay._graphOrigin;
            clickedPoint = startPoint;
            currentOrigin = origins.currentOrigin;
            defaultOrigin = origins.defaultOrigin;
            zoomingFactors = graphDisplay._zoomingFactor;
            height = self._canvasSize.height;
            width = self._canvasSize.width;

            origins.isOriginPositionChanged = true;
            clickedPointGraphCoOrdinate = self._getGraphPointCoordinates([clickedPoint.x, clickedPoint.y]);

            //zoomCaller = function () {
            //    self._zoomGraph(1, false);
            //};

            //interval = setInterval(function () {

            shiftFactor = self._originShiftFactorForDoubleClick(clickedPointGraphCoOrdinate);
            self.graphShiftDistance = shiftFactor.distance;
            zoomingFactors.previousZoomAngle = shiftFactor.angle;
            if (event.scale > 1) {
                if (this._pinchCounter === 5) {

                    //self._zoomGraph(1, false, true);

                    this._zoomGraph(1, false, true);

                    this._pinchCounter = 0;
                }
                this._pinchCounter++;
            }
            else {
                if (this._pinchCounter === 5) {
                    //this._isGraphDefaultPanBehaviourAllowed = false;
                    this._zoomGraph(-1, false, true);
                    //this._isGraphDefaultPanBehaviourAllowed = true;
                    this._pinchCounter = 0;
                }
                this._pinchCounter++;
            }
        },

        //        _shapePanFlag: true,
        /**
        *Attach different functions to canvas mouse tool, 
        *
        *@private
        *@method _canvasTool
        *@return
        *
        */

        /*attach functions to different canvas mouse activity*/
        _canvasTool: function _canvasTool() {

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                width = this._canvasSize.width,
                height = this._canvasSize.height,
                zoomParameter = graphDisplay._zoomingFactor,
                origins = graphDisplay._graphOrigin,
                othis = this,
                shapePanFlag = false,
                hitResult, dragDistance,
                onMouseDrag, gridLayer, shapeLayer, gridGraph, pointLayer, bannerLayer, imageLayer, onGridMouseUp, onGridMouseDrag, gridLayerOnMouseUp,
                scope = this._paperScope,
                annotationLayer, labelLayer, distanceBetweenOrigins;
            //this._paperScope.tool.onMouseDown = function (event) {
            this._projectLayers.shapeLayer.onMouseDown = function (event) {
                othis.activateScope();
                othis.trigger('grid-mousedown', event);

                //                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('hittest');
                if (othis._isGraphDefaultPanBehaviourAllowed === true && othis._gridMode === 'Graph' && othis._isGestureProgress) {
                    othis._projectLayers.shapeLayer.activate();

                    hitResult = scope.project.activeLayer.hitTest(event.point, { stroke: true, type: scope.Group });

                    //othis.trigger('grid-graph-mousedown', [othis._getGraphPointCoordinates([event.point.x, event.point.y])]);

                    if ((hitResult !== undefined)) {
                        if (hitResult.type === 'stroke') {
                            shapePanFlag = true;
                        }

                        if (hitResult === null) {
                            shapePanFlag = false;
                        }
                        else {
                            if (hitResult.item !== null) {
                                if (hitResult.item._parent.type === 'group') {
                                    shapePanFlag = true;
                                }
                                else {
                                    shapePanFlag = false;
                                }
                            }
                            else {
                                shapePanFlag = false;
                            }

                        }
                    }
                    else {
                        shapePanFlag = false;
                    }

                    othis._shapePan = shapePanFlag;

                    if (shapePanFlag === true && this.disableLineTooltip === true) {
                        othis._projectLayers.shapeLayer.activate();
                        othis._traceMouseDownHandle.apply(othis, [event, hitResult.item._parent]);
                        othis._projectLayers.gridLayer.activate();
                    }
                    else {
                        othis.off('grid-graph-mousedrag', onGridMouseDrag).on('grid-graph-mousedrag', onGridMouseDrag).off('grid-graph-mouseup', onGridMouseUp).on('grid-graph-mouseup', onGridMouseUp);
                    }
                }
            };

            this._paperScope.tool.minDistance = 1;

            this._projectLayers.shapeLayer.onMouseDrag = function (event) {
                othis.activateScope();
                if (othis._isGraphDefaultPanBehaviourAllowed === true && othis._gridMode === 'Graph' && othis._isGestureProgress) {
                    if (othis._shapePan === true && this.disableLineTooltip === true) {
                        othis._projectLayers.shapeLayer.activate();
                        //                        othis._shapePan = true;
                        othis._traceMouseDragHandle.apply(othis, [event, hitResult.item._parent]);
                        othis._projectLayers.gridLayer.activate();
                    }
                }
            };

            //comment by shashank - listen to the listener
            onMouseDrag = function (event) {
                var plotsLength, imagesLength;
                othis.activateScope();
                if (othis._isGraphDefaultPanBehaviourAllowed === true && othis._gridMode === 'Graph') {
                    if (othis._shapePan === true) {
                        //othis._projectLayers.shapeLayer.activate();
                        ////                        othis._shapePan = true;
                        //othis._traceMouseDragHandle.apply(othis, [event, hitResult.item._parent]);
                        //othis._projectLayers.gridLayer.activate();
                    }
                    else {

                        origins.currentOrigin.x += event.delta.x;
                        origins.currentOrigin.y += event.delta.y;

                        othis._graphTypeSelector();
                        //zoomParameter.previousZoomAngle = othis._angleBetweenTwoPoints(origins.currentOrigin, origins.defaultOrigin);
                        origins.isOriginPositionChanged = true;
                        othis._graphLimitChangesDuringDragging();
                        othis._deltaAngle();
                        othis._previousMaxValue = othis._getGraphPointCoordinates([width, height / 2])[0];
                        plotsLength = modelObject.get('_plots').length;
                        imagesLength = modelObject.get('_images').length;
                        if (plotsLength !== 0 || imagesLength !== 0) {
                            if (plotsLength.length !== 0) {
                                othis._layerDrag(othis._projectLayers.shapeLayer, event.delta);
                                othis._layerDrag(othis._projectLayers.labelLayer, event.delta);
                                othis._layerDrag(othis._projectLayers.annotationLayer, event.delta);
                            }
                            if (imagesLength !== 0) {
                                othis._layerDrag(othis._projectLayers.imageLayer, event.delta);
                            }

                            clearTimeout($.data(othis, 'timer'));
                            $.data(othis, 'timer', setTimeout(function () {
                                othis.trigger('graph:zoom-pan');
                                //othis._paperScope.view.draw();
                                othis.refreshView();
                            }, 150));
                        }
                        if (modelObject.get('_points').length !== 0) {
                            othis._repositionPoints();
                        }
                    }

                }
                else if (othis._gridMode === 'SelectionRect') {
                    var selectionRectStart = othis._selectionRect._startPoint,
                        startPoint = othis._getMinXMinYFromPoints(event.point, selectionRectStart),
                        boxWidth = Math.abs(event.point.x - othis._selectionRect._startPoint.x),
                        boxHeight = Math.abs(event.point.y - othis._selectionRect._startPoint.y);
                    othis._selectionRect.remove();
                    othis._selectionRect = null;
                    othis._selectionRect = new othis._paperScope.Path.Rectangle(startPoint, { width: boxWidth, height: boxHeight });
                    othis._selectionRect.style = {
                        strokeColor: 'black',
                        strokeWidth: 2
                    };
                    othis._selectionRect._startPoint = selectionRectStart;
                }
            };
            gridLayer = this._projectLayers.gridLayer;
            gridLayer.name = 'grid';

            shapeLayer = this._projectLayers.shapeLayer;
            shapeLayer.name = 'shape';

            gridGraph = this;

            pointLayer = this._projectLayers.pointLayer;
            pointLayer.name = 'point';
            bannerLayer = this._projectLayers.bannerLayer;
            bannerLayer.name = 'banner';

            imageLayer = this._projectLayers.imageLayer;
            imageLayer.name = 'image';
            //var annotationLayer;
            annotationLayer = this._projectLayers.annotationLayer;
            annotationLayer.name = 'annotation';
            labelLayer = this._projectLayers.labelLayer;
            labelLayer.name = 'label';
            this._addLayerClickDoubleClickEvents(pointLayer);
            this._addLayerClickDoubleClickEvents(this._projectLayers.shapeLayer);
            this._addLayerClickDoubleClickEvents(bannerLayer);
            this._addLayerClickDoubleClickEvents(this._projectLayers.gridLayer);
            this._addLayerClickDoubleClickEvents(imageLayer);
            this._addLayerClickDoubleClickEvents(annotationLayer);
            this._addLayerClickDoubleClickEvents(labelLayer);
            this._paperScope.tool.onMouseDrag = function (event) {
                //'dragstart'
                if (typeof othis.$el.attr('ogCursor') === 'undefined') {

                    if (othis._isGraphDefaultPanBehaviourAllowed === true) {
                        othis.$el.attr('ogCursor', othis.$el.find('canvas').css('cursor'));
                        othis.$el.find('canvas').trigger('interactivegraphpanningstart');
                        othis.$el.find('canvas').css('cursor', 'move');
                    }
                }
                othis.trigger('grid-graph-mousedrag', event);
                othis.trigger('draw-annotation', event);
            };

            this._paperScope.tool.onMouseDown = function (event) {
                othis.trigger('grid-graph-mousedown', event);
                othis.trigger('annotation-start', event);
            };


            this._paperScope.tool.onMouseUp = function (event) {
                //'dragstop'
                if (othis.$el.attr('ogCursor')) {
                    othis.$el.find('canvas').css('cursor', othis.$el.attr('ogCursor'));
                    othis.$el.find('canvas').trigger('interactivegraphpanningstop');
                    othis.$el.removeAttr('ogCursor');
                }

                othis.activateScope();
                if (event.event.which === 3) {
                    return;
                }
                //VERIFY is this proper place to do this
                gridGraph.isDragInProgress = false;

                //console.log('tool mouse up');
                zoomParameter.previousZoomAngle = othis._angleBetweenTwoPoints(origins.currentOrigin, origins.defaultOrigin);

                distanceBetweenOrigins = othis._distanceBetweenPoints(origins.currentOrigin, origins.defaultOrigin);
                zoomParameter.zoomCounter = distanceBetweenOrigins / othis._GRAPH_SHIFT_DISTANCE;

                //dragDistance = Math.sqrt(Math.pow(event.delta.x, 2) + Math.pow(event.delta.y, 2));
                //if (dragDistance !== 0) {
                //    if (dragDistance > othis._GRAPH_SHIFT_DISTANCE) {
                //        othis.graphShiftDistance = othis._GRAPH_SHIFT_DISTANCE;
                //    }
                //    else {
                //        othis.graphShiftDistance = dragDistance;
                //    }
                //}
                if (othis._gridGraphModelObject.get('circleDrag') !== null) {
                    othis._gridGraphModelObject.get('circleDrag').visible = false;
                    othis.$('.drag-tooltip').remove();
                    othis._shapePan = false;
                }
                othis.trigger('grid-graph-mouseup', event);
                othis.trigger('annotation-end', event);
            };

            if (!('ontouchstart' in window)) {
                //                this._paperScope.tool.onMouseMove = function (event) {
                //                  //  othis.trigger('grid-graph-mousemove', event);
                //                };
            }

            onGridMouseUp = function () {
                if (this._gridMode === 'SelectionRect' && this._selectionRect) {
                    var selectionBound = this._selectionRect.bounds;
                    this._selectionRect.remove();
                    this._selectionRect = null;
                    this.trigger('selection-rect-complete', selectionBound);
                }
                this.off('grid-graph-mousedrag', onGridMouseDrag);
            };

            onGridMouseDrag = function (event) {
                onMouseDrag(event);
            };

            this.on('grid-layer-mousedown', function (event) {
                if (othis._gridMode === 'SelectionRect') {
                    othis._selectionRect = new this._paperScope.Path.Rectangle(event.point, { width: 1, height: 1 });
                    othis._selectionRect.strokeColor = 'black';
                    othis._selectionRect.strokeWidth = 2;
                    othis._selectionRect._startPoint = event.point;
                }
                this.on('grid-graph-mousedrag', onGridMouseDrag);
                this.on('grid-graph-mouseup', onGridMouseUp);

            });


            gridLayerOnMouseUp = function (event) {
                ////console.log('Grid mouse up');

                //return;
                //othis.trigger('grid-graph-mousedown', [othis._getGraphPointCoordinates([event.point.x, event.point.y])]);
                if (othis._isGraphDefaultPanBehaviourAllowed === true && othis._gridMode === 'Graph' && othis._isGestureProgress) {
                    othis.trigger('graph:zoom-pan');
                    //othis._paperScope.view.draw();
                    othis.refreshView();
                    othis._shapePan = false;
                }

                origins.doubleClickedPoint = event.point;

            };

            this.on('grid-layer-mouseup', gridLayerOnMouseUp);


            this.on('grid-layer-doubleclick', $.proxy(this._graphDoubleClick, this));
        },

        _getMinXMinYFromPoints: function _getMinXMinYFromPoints(point1, point2) {
            var returnPoint = {
                x: null,
                y: null
            };
            returnPoint.x = (point1.x <= point2.x) ? point1.x : point2.x;
            returnPoint.y = (point1.y <= point2.y) ? point1.y : point2.y;
            return returnPoint;
        },

        refreshView: function refreshView() {
            if (this._isGridRefreshPaused) {
                return;
            }
            //paper = this._paperScope;
            this._paperScope.view.draw();
        },

        _addLayerClickDoubleClickEvents: function _addLayerClickDoubleClickEvents(layer) {

            var lastDragCall, lastLayerClickCall, lastDraggedPath, gridGraph, mouseDownPosition, objectOffset, funcDragBegin, funcDragContinue, layerClickContinue, clickDelay = 200, delX, delY, lastPosition;

            //var lastDragCall;
            //var lastLayerClickCall;
            //var lastDraggedPath;
            gridGraph = this;

            //var mouseDownPosition;
            //var objectOffset;

            funcDragBegin = function (event) {
                if (event.event.which === 3) {
                    return;
                }
                if (gridGraph._gridMode !== 'Graph' && gridGraph._gridMode !== 'SelectionRect') {
                    //console.log('Ignoring Drag begin on grid...drawing mode is ' + gridGraph._gridMode);
                    return;
                }
                if (layer.name !== 'image' && layer.name !== 'service') {
                    //TODO find a better way
                    //gridGraph.trigger('remove-image-selection', event);
                }

                var funcDragUp, target, group, equation;

                if (lastDragCall) {
                    clearInterval(lastDragCall);
                }
                funcDragUp = function () {
                    if (lastDragCall) {
                        //console.log('!Mouse up before drag began...Drag call terminated');
                        lastDraggedPath = undefined;
                        clearInterval(lastDragCall);
                    }
                    gridGraph.isDragInProgress = false;
                    gridGraph.off('grid-graph-mouseup', funcDragUp);
                };

                target = event.target;
                group = target.parent;

                if (target.equation === undefined) {
                    equation = group.equation;
                }
                else {
                    equation = target.equation;
                }
                if (equation) {
                    if (equation.getLabelData().labelObject !== target) {
                        equation.trigger('drag-begin', gridGraph._getGraphPointCoordinates(getCanvasCoordinates(event)), equation);
                    }
                    else {
                        equation.trigger('label-drag-begin', getCanvasCoordinates(event), equation);
                        // return;
                    }
                }
                ////console.log('DRAG begin ...draggable is ' + equation.drawStyle.draggable);
                if (equation && !equation.isDraggable()) {
                    return;
                }

                mouseDownPosition = getCanvasCoordinates(event);
                if (layer.name !== 'label') {
                    objectOffset = [mouseDownPosition[0] - group.position.x, mouseDownPosition[1] - group.position.y];
                } //var equation;



                gridGraph.on('grid-graph-mouseup', funcDragUp);

                //console.log('>>call to drag........' + layer.name);
                //lastDragCall = setInterval(funcDragContinue, 200, event);
                gridGraph.isDragInProgress = true;
                lastDragCall = setInterval(function () { funcDragContinue(event); }, clickDelay / 2);
            };

            funcDragContinue = function (event) {
                var target, group, preDragPosition, lastDragPosition, funcOnMouseDrag, funcOnMouseUp;
                //console.log('__drag continue');
                clearInterval(lastDragCall);
                lastDragCall = undefined;

                //$('#dgt-canvas').css('cursor', 'move')
                //console.log('shape mouse down');

                target = event.target;
                gridGraph.trigger(layer.name + '-layer-mousedown', event);
                if (layer.name === 'grid') {
                    return;
                }

                //var lastPosition;
                group = target.parent;
                preDragPosition = getCanvasCoordinates(event);

                //var lastDragPosition;

                funcOnMouseDrag = function (event) {
                    ////console.log('dragging ' +event);
                    ////console.log(event.event);
                    lastDraggedPath = target;
                    var equation, group, canvasCoords, dx, dy;
                    if (lastLayerClickCall) {
                        //console.log('!click abort');
                        clearInterval(lastLayerClickCall);
                        lastLayerClickCall = undefined;
                    }

                    if (event.event === undefined) {
                        //console.log('mouseevent not found');
                        return;
                    }

                    if (!lastDragPosition) {
                        lastDragPosition = mouseDownPosition;
                        lastPosition = mouseDownPosition;
                    }
                    delX = getCanvasCoordinates(event)[0] - lastPosition[0];
                    delY = getCanvasCoordinates(event)[1] - lastPosition[1];
                    // console.log(lastDragPosition);
                    group = target.parent;
                    canvasCoords = getCanvasCoordinates(event);



                    dx = canvasCoords[0] - lastDragPosition[0];
                    dy = canvasCoords[1] - lastDragPosition[1];

                    if (target.equation === undefined) {
                        equation = group.equation;
                    }
                    else {
                        equation = target.equation;
                    }
                    if (objectOffset !== undefined) {
                        canvasCoords[0] -= objectOffset[0];
                        canvasCoords[1] -= objectOffset[1];
                    }
                    if (gridGraph.snapToGridFlag && layer.name === 'point') {
                        canvasCoords = gridGraph.getClosestCanvasPoint(canvasCoords);
                    }


                    if (equation) {
                        if (equation.getLabelData().labelObject !== target) {
                            equation.trigger('pre-drag', gridGraph._getGraphPointCoordinates(canvasCoords), equation, canvasCoords);

                        }

                        else {
                            //debugger;
                            equation.trigger('label-pre-drag', canvasCoords, equation);
                        }
                    }
                    //console.log('>Delta> ' + dx + ',' + dy);
                    //console.log('>> ' + group.position.x + ',' + group.position.y);
                    //console.log('>> ' + objectOffset);

                    if (layer.name !== 'label') {
                        group.position.x = canvasCoords[0];
                        group.position.y = canvasCoords[1];
                    } else {
                        target.position.x = canvasCoords[0];
                        target.position.y = canvasCoords[1];
                    }
                    //group.position.x += dx;//canvasCoords[0];
                    //group.position.y += dy;//canvasCoords[1];

                    lastDragPosition = canvasCoords;
                    this._paperScope.view.draw();
                    if (equation && equation.getLabelData().labelObject !== target) {

                        //////console.log('dispatching predrag on ' + equation);
                        equation.trigger('post-drag', equation, true, delX, delY);
                    }
                    lastPosition = getCanvasCoordinates(event);

                };


                funcOnMouseUp = function (event) {
                    if (event.event.which === 3) {
                        return;
                    }
                    var equation, dx, dy, canvasCoords, threshold, newPoint, newPointEquation;
                    //console.log('up...events removed');

                    gridGraph.off('grid-graph-mousedrag', funcOnMouseDrag);
                    gridGraph.off('grid-graph-mouseup', funcOnMouseUp);



                    canvasCoords = getCanvasCoordinates(event);
                    dx = canvasCoords[0] - preDragPosition[0];
                    dy = canvasCoords[1] - preDragPosition[1];


                    threshold = 10e-2;
                    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
                        //console.log('not dragged enough.(' + dx + ',' + dy + ')..discarding drag!!!!!!!!!!!!!!!!!');
                        return;
                    }


                    if (target.equation === undefined) {
                        equation = target.parent.equation;
                    }
                    else {
                        equation = target.equation;
                    }
                    if (objectOffset !== undefined) {
                        canvasCoords[0] -= objectOffset[0];
                        canvasCoords[1] -= objectOffset[1];
                    }
                    if (gridGraph.snapToGridFlag && layer.name === 'point') {
                        canvasCoords = gridGraph.getClosestCanvasPoint(canvasCoords);
                    }
                    if (layer.name !== 'label') {
                        equation.trigger('pre-relocate', gridGraph._getGraphPointCoordinates(canvasCoords), equation, canvasCoords);
                    }
                    gridGraph.isDragInProgress = false;




                    //  var equation = target.equation;

                    newPoint = gridGraph._getGraphPointCoordinates(canvasCoords);
                    //console.log('new point equation ' + newPointEquation);

                    //verify
                    if (layer.name !== 'label') {
                        if (equation.getSpecie() === 'point') {
                            //equation.setEquation(newPointEquation);
                            equation.setPoints([newPoint]);
                            equation.trigger('change-equation');
                        }
                        if (equation) {
                            equation.trigger('post-relocate', equation, newPoint);
                        }

                    }

                };

                gridGraph.on('grid-graph-mousedrag', funcOnMouseDrag);
                gridGraph.on('grid-graph-mouseup', funcOnMouseUp);
            };
            if (layer.name === 'grid' || gridGraph.isDrawingsDraggable === true) {
                layer.onMouseDown = funcDragBegin;
            }





            layer.onDoubleClick = function (event) {
                if (event.event.which === 3) {
                    return;
                }
                if (gridGraph._gridMode !== 'Graph') {
                    //console.log('Ignoring Double Click on grid...drawing mode is ' + gridGraph._gridMode);
                    return;
                }
                var target;
                if (lastDragCall) {
                    //console.log('!drag abort');
                    clearInterval(lastDragCall);
                    lastDragCall = undefined;
                }
                if (lastLayerClickCall) {
                    //console.log('!click abort');
                    clearInterval(lastLayerClickCall);
                    lastLayerClickCall = undefined;
                }
                gridGraph.isDragInProgress = false;
                //console.log('>>call to double click on layer ' + layer.name);
                target = event.target;
                gridGraph.trigger(layer.name + '-layer-doubleclick', event);
            };



            layerClickContinue = function (event) {
                ////console.log('layer click continue');
                if (lastLayerClickCall) {
                    clearInterval(lastLayerClickCall);
                    lastLayerClickCall = undefined;
                }
                gridGraph.isDragInProgress = false;
                if (lastDraggedPath === event.target) {
                    //console.log('not dispatching click on dragged path');
                    return;
                }
                //console.log('click continue on layer ' + layer.name);
                gridGraph.trigger(layer.name + '-layer-mouseup', event);
                gridGraph.trigger(layer.name + '-layer-click', event);
                gridGraph._paperScope.view.draw();

            };



            layer.onClick = function (event) {
                if (event.event.which === 3) {
                    return;
                }
                if (gridGraph._gridMode !== 'Graph' && (layer.name !== 'point') && gridGraph._gridMode !== 'tabletDrawing') {
                    //console.log('Ignoring Click on grid...drawing mode is ' + gridGraph._gridMode);
                    return;
                }
                //console.log('>>call to click ' + layer.name);
                if (lastLayerClickCall) {
                    clearInterval(lastLayerClickCall);
                    lastLayerClickCall = undefined;
                }
                lastLayerClickCall = setInterval(function () {
                    layerClickContinue(event);
                }, clickDelay); //doesn't work in ie
            };

            //layer.onMouseUp = function (event) {
            //    gridGraph.trigger(layer.name + '-layer-mouseup', event);
            //}
        },

        _onShapeRollOver: undefined,
        _onShapeRollOut: undefined,

        _setPathRollOverListeners: function (pointOrPlot) {
            //return;
            pointOrPlot.onMouseEnter = this._onShapeRollOver;
            pointOrPlot.onMouseLeave = this._onShapeRollOut;
        },

        _removePathRollOverListeners: function (pointOrPlot) {
            pointOrPlot.onMouseEnter = undefined;
            pointOrPlot.onMouseLeave = undefined;
        },


        /**
        *Hide or show label
        *
        *@private
        *@method _labelDisplayChange
        *@return
        */
        _labelDisplayChange: function _labelDisplayChange() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isLabelShown = !graphDisplay._graphDisplay.isLabelShown;

            this._graphTypeSelector();
        },

        /**
        *Hide or show axis
        *
        *@private
        *@method _axisDisplayChange
        *@return
        */
        _axisDisplayChange: function _axisDisplayChange() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isAxisLinesShown = !graphDisplay._graphDisplay.isAxisLinesShown;

            this._graphTypeSelector();
        },

        /**
        * Hide or show grid-lines
        *
        *@private
        *@method _gridLineDisplayChange
        *@return
        */
        _gridLineDisplayChange: function _gridLineDisplayChange() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isGridLineShown = !graphDisplay._graphDisplay.isGridLineShown;

            this._graphTypeSelector();
        },

        /**
        *Change projector mode from on to off or vice-versa
        *
        @private
        @method _projectorModeChange
        @return
        */
        _projectorModeChange: function _projectorModeChange() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');


            graphDisplay._graphDisplay.isProjectorModeOn = !graphDisplay._graphDisplay.isProjectorModeOn;
            //            if (graphDisplay._graphDisplay.isProjectorModeOn === true) {

            //                paper.view.zoom = 2;
            //            }
            //            else {
            //                paper.view.zoom = 1;
            //            }

            this._cartesionSymbolGenerator();

            this._graphTypeSelector();
        },

        /**
        *Zoom-in graph.
        *
        *@private
        *@method graphZoomIn
        *@return
        */
        graphZoomIn: function graphZoomIn() {
            if (this.isDragInProgress) {
                //debugger;
                return;
            }
            this._zoomInButtonClicked();
        },
        /**
        *Zoom-In graph,when user click 'zoom-in' button.
        *
        *@private
        *@method _zoomInButton
        *@return
        */

        _zoomInButtonClicked: function _zoomInButtonClicked() {
            if (this.isDragInProgress) {
                //debugger;
                return;
            }
            var i = 0,
                othis = this,
                totalShiftPoint = this._ZOOM_STEPS,
                zoomCaller, interval;

			if (this._customZoomInMultiplier) {
                totalShiftPoint = this._customZoomInMultiplier;
            }
//            } else {
//                totalShiftPoint = (this._MAXIMUM_ZOOM_LEVEL_FACTOR - this._MINIMUM_ZOOM_LEVEL_FACTOR) / this._ZOOM_LEVEL_INCREMENT_STEPS;
//            }

            zoomCaller = function () {
                othis._zoomGraph(1, true);
            };

            //            clearTimeout($.data(this, 'timer'));
            //            for (i = 1; i <= totalShiftPoint; i++) {
            //                $.data(this, 'timer', setTimeout(function () {
            //                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('zoomCaller');
            //                    zoomCaller();
            //                }, 10));
            //            }

            interval = setInterval(function () {
                zoomCaller();
                i++;
                if (i > totalShiftPoint) {
                    clearInterval(interval);
                }

            }, 0.1);

        },
        /**
        *Zoom-out graph.
        *
        *@private
        *@method graphZoomOut
        *@return
        */
        graphZoomOut: function graphZoomOut() {
            if (this.isDragInProgress) {
                return;
            }
            this._zoomOutButtonClicked();
        },

        /**
        *Zoom-out graph,when user click 'zoom-out' button.
        *
        *@private
        *@method _zoomOutButton
        *@return
        */
        _zoomOutButtonClicked: function _zoomOutButtonClicked() {
            //            MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('zoomOutButton');
            if (this.isDragInProgress) {
                return;
            }
            var i = 0,
                othis = this,
                totalShiftPoint = this._ZOOM_STEPS,
                zoomCaller, interval;

			if (this._customZoomOutMultiplier) {
                totalShiftPoint = this._customZoomOutMultiplier;
            } //else {
               // totalShiftPoint = (this._MAXIMUM_ZOOM_LEVEL_FACTOR - this._MINIMUM_ZOOM_LEVEL_FACTOR) / this._ZOOM_LEVEL_INCREMENT_STEPS;
            //}

            zoomCaller = function () {
                othis._zoomGraph(-1, true);
            };

            //            clearTimeout($.data(this, 'timer'));
            //            for (i = 1; i <= totalShiftPoint; i++) {
            //                $.data(this, 'timer', setTimeout(function () {
            //                    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getStartTime('zoomCaller');
            //                    zoomCaller();
            //                    console.log('zoomCaller>>' + MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.EquationEngine.Profile.getProcessingTime('zoomCaller'));
            //                }, 10));
            //            }

            interval = setInterval(function () {
                zoomCaller();
                i++;
                if (i > totalShiftPoint) {
                    clearInterval(interval);
                }
            }, 0.1);
        },

        /**
        *Zoom-In graph when user double click on graph.
        *
        *@private
        *@method _graphDoubleClick
        *@return
        */

        /*function called when mouse is double clicked on graph*/
        _graphDoubleClick: function _graphDoubleClick(event) {
            this.activateScope();

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                doubleClickZoomAllow = graphDisplay._zoomingFactor.doubleClickZoomAllow,
                i = 1,
                othis = this,
                origins = graphDisplay._graphOrigin,
                clickedPoint = event.point,
                currentOrigin = origins.currentOrigin,
                defaultOrigin = origins.defaultOrigin,
                zoomingFactors = graphDisplay._zoomingFactor,
                height = this._canvasSize.height,
                width = this._canvasSize.width,
                totalShiftPoint, zoomCaller,
                interval, clickedPointGraphCoOrdinate, shiftFactor, doubleClickZoomAllow,
                previousShiftDistance = this.graphShiftDistance,
                totalShiftPoint = this._ZOOM_STEPS;


            if (!this._shapePan && doubleClickZoomAllow !== false) {

                origins.isOriginPositionChanged = true;
                clickedPointGraphCoOrdinate = this._getGraphPointCoordinates([clickedPoint.x, clickedPoint.y]);

                zoomCaller = function () {
                    othis._zoomGraph(1, false);
                };

                interval = setInterval(function () {

                    shiftFactor = othis._originShiftFactorForDoubleClick(clickedPointGraphCoOrdinate);

                    othis.graphShiftDistance = shiftFactor.distance;
                    zoomingFactors.previousZoomAngle = shiftFactor.angle;

                    zoomCaller();
                    i++;

                    if (i > totalShiftPoint) {
                        clearInterval(interval);
                        othis.graphShiftDistance = previousShiftDistance;
                    }

                }, 0.1);
            }
        },

        /**
        *Change x-axis markers from degree to radians or vice-versa.
        *
        *@private
        *@method _xAxisMarkerStyleToggle
        *@return
        */
        _xAxisMarkerStyleToggle: function _xAxisMarkerStyleToggle() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isXmarkerInRadians = !graphDisplay._graphDisplay.isXmarkerInRadians;

            this._graphTypeSelector();
        },


        /**
        *Set x-Axis markers value to dergree or radian,depanding upon input parameter.
        *if input parameter is true then y-axis marker is in radian,otherwise in degree.
        *
        *@private
        *@method _xAxisMarkerLineStyle
        *@param {Boolean} isRadian
        *@return
        */

        _xAxisMarkerLineStyle: function _xAxisMarkerLineStyle(isInRadian) {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isXmarkerInRadians = isInRadian;

            this._graphTypeSelector();
        },

        /**
        *Change y-axis markers from degree to radians or vice-versa.
        *
        *@private
        *@method _yAxisMarkerStyleToggle
        *@return
        */

        _yAxisMarkerStyleToggle: function _yAxisMarkerStyleToggle() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');
            graphDisplay._graphDisplay.isYmarkerInRadians = !graphDisplay._graphDisplay.isYmarkerInRadians;

            this._graphTypeSelector();
        },

        /**
        *Set y-Axis markers value to dergree or radian,depanding upon input parameter.
        *if input parameter is true then y-axis marker is in radian,otherwise in degree.
        *
        *@private
        *@method _yAxisMarkerLineStyle
        *@param {Boolean} isRadian
        *@return
        */

        _yAxisMarkerLineStyle: function _yAxisMarkerLineStyle(isInRadian) {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isYmarkerInRadians = isInRadian;

            this._graphTypeSelector();
        },

        /**
        *Change graph type from polar to cartesion or vica-versa
        *
        *@private
        *@method _graphTypeChange
        *@return
        */
        _graphTypeChange: function _graphTypeChange() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isCartesionCurrentGraphType = !graphDisplay._graphDisplay.isCartesionCurrentGraphType;

            this._graphTypeSelector();

        },

        /**
        *Change polar angle markers from degree to radians or vice-versa
        *
        *@private
        *@method _polarAngleLineMarkerStyleToggle
        *@return
        */
        _polarAngleLineMarkerStyleToggle: function _polarAngleLineMarkerStyleToggle() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isPolarAngleInRadian = !graphDisplay._graphDisplay.isPolarAngleInRadian;

            this._graphTypeSelector();
        },

        /**
        *Set polar angle markers value to dergree or radian,depanding upon input parameter.
        *if input parameter is true then polar Angle Style is in radian,otherwise in degree.
        *
        *@private
        *@method _polarAngleLineMarkerStyle
        *@param {Boolean} isRadian
        *@return
        */

        _polarAngleLineMarkerStyle: function _polarAngleLineMarkerStyle(isInRadian) {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isPolarAngleInRadian = isInRadian;

            this._graphTypeSelector();
        },

        /**
        *Reset graph to default zoom-in value. 
        *
        *@private
        *@method defaultGraphZoom
        *@return
        */
        defaultGraphZoom: function defaultGraphZoom() {
            this._restoreDefaultZoomingClicked();
        },

        /**
        *Reset graph to default zoom-in value. 
        *
        *@private
        *@method _restoreDefaultZooming
        *@return
        */
        _restoreDefaultZoomingClicked: function _restoreDefaultZoomingClicked() {

            this._restoreDefaultZoom();

            this._deltaAngle();
            this._triggerEqualizeEvent(false);
        },

        /**
        *Set default graph parameters,as graph x-axis and y-axis limits and default zoom level.
        *@private
        *@method _restoreDefaultZoom
        *@return
        */

        /*default value of variable*/
        _restoreDefaultZoom: function _restoreDefaultZoom() {
            this.activateScope();

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                canvas = this._canvasSize,
                width = canvas.width,
                height = canvas.height,
                limits = graphDisplay._graphsAxisLimits,
                defaultLimits = limits.defaultLimits,
                zoomingFactor = graphDisplay._zoomingFactor,
                parameters = graphDisplay._graphParameters,
                factors = this._zoomFactors,
                origins = graphDisplay._graphOrigin,
                graphDisplayFactor = graphDisplay._graphDisplay,
                bounds = this.markerBounds,
                xLower, yLower, xUpper, yUpper;

            //origins.defaultOrigin = new Point(width / 2, height / 2);

            xLower = defaultLimits.xLower;
            xUpper = defaultLimits.xUpper;
            yLower = defaultLimits.yLower;
            yUpper = defaultLimits.yUpper;


            zoomingFactor.xCurrentFactor = zoomingFactor.yCurrentFactor = factors[1];
            zoomingFactor.xZoomMultiplier = zoomingFactor.yZoomMultiplier = 1;
            zoomingFactor.xTotalMultiplier = zoomingFactor.yTotalMultiplier = factors[1];


            parameters.yGridLine = 4;
            parameters.xGridLine = 4;

            zoomingFactor.zoomLevel = 1;///???

            origins.isOriginPositionChanged = false;

            limits.isXLastChangedLimit = true;

            //count number of time zoom-in and out
            zoomingFactor.zoomCounter = 0;

            this._setGraphLimits(xLower, xUpper, yLower, yUpper);

            /*equalize vertical axis as horizontal axis*/
            this._equalizeAxisScales();

        },
        /**
        *Zoom graph depending upon mouse-wheel movement.
        *
        *@private
        *@method _zoomGraph
        *@param {int} delta Graph is zoom in or out  depending on value of delta,if positive graph is zoom-in and if negative its been zoom-out
        *@return
        */
        /*Zooming Function*/
        _zoomGraph: function _zoomGraph(delta, ismouseWheel, isPinchZoom) {
            this.activateScope();

            var othis = this,
                modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                graphParameters = graphDisplay._graphParameters,
                origins = graphDisplay._graphOrigin,
                height = this._canvasSize.height,
                width = this._canvasSize.width,
                horizontalDistance = graphParameters.distanceBetweenTwoHorizontalLines,
                verticalDistance = graphParameters.distanceBetweenTwoVerticalLines,
                xGridLines = graphParameters.xGridLine,
                yGridLines = graphParameters.yGridLine,
                currentOrigin = origins.currentOrigin,
                defaultOrigin = origins.defaultOrigin,
                zoomingFactors = graphDisplay._zoomingFactor,
                factor = this._zoomFactors,
                shiftDistance = this.graphShiftDistance,
                horizontalDistance,
                verticalDistance,
                angle,
                distanceBetweenOrigin,
                newOriginPoint,
                zoomFactor = this._zoomLevelLimits(),
                distance = this._distanceBetweenPoints(currentOrigin, defaultOrigin) / 10;

            if (this.isDragInProgress) {
                if (!isPinchZoom) {
                    return;
                }
            }
            if (this._gridMode === 'annotation-mode') {
                if (!isPinchZoom) {
                    return;
                }
            }
            if (this._gridMode !== 'Graph') {
                return;
            }
            ismouseWheel = undefined;

            shiftDistance = this.graphShiftDistance;

            if (delta === 0) {
                return;
            }
            else if (delta > 0) {
                zoomingFactors.zoomCounter++;
                //zoom in //scroll up //increase
                //shiftDistance = this.graphShiftDistance;
                /*ShiftOrigin*/
                if (origins.isOriginPositionChanged === true && zoomingFactors.zoomCounter > 0) {
                    angle = zoomingFactors.previousZoomAngle - Math.PI;
                    newOriginPoint = new this._paperScope.Point((currentOrigin.x + Math.cos(angle) * (shiftDistance)), (currentOrigin.y - Math.sin(angle) * (shiftDistance)));
                    this._delta = new this._paperScope.Point(origins.currentOrigin.x - newOriginPoint.x, origins.currentOrigin.y - newOriginPoint.y);
                    origins.currentOrigin = newOriginPoint;
                    this._previousMaxValue = this._getGraphPointCoordinates([width, height / 2])[0];
                }
                else {
                    this._delta = new this._paperScope.Point(0, 0);
                }


                zoomingFactors.currentXZoomLevel += this._ZOOM_LEVEL_INCREMENT_STEPS;
                zoomingFactors.currentXZoomLevel = parseFloat(zoomingFactors.currentXZoomLevel.toFixed(4));

                if (zoomingFactors.currentXZoomLevel > zoomFactor.xMaxZoomLevel) {
                    /*vertical line distance Multiplier*/
                    this._xAxisZoomFactorModifier(false);

                    zoomFactor = this._zoomLevelLimits();

                    zoomingFactors.currentXZoomLevel = zoomFactor.xMinZoomLevel;
                }

                zoomingFactors.currentYZoomLevel += this._ZOOM_LEVEL_INCREMENT_STEPS;
                zoomingFactors.currentYZoomLevel = parseFloat(zoomingFactors.currentYZoomLevel.toFixed(4));
                if (zoomingFactors.currentYZoomLevel > zoomFactor.yMaxZoomLevel) {
                    /*horizontal line distance Multiplier*/
                    this._yAxisZoomFactorModifier(false);

                    zoomFactor = this._zoomLevelLimits();

                    zoomingFactors.currentYZoomLevel = zoomFactor.yMinZoomLevel;
                }

                xGridLines = graphParameters.xGridLine;
                yGridLines = graphParameters.yGridLine;


                graphParameters.currentDistanceBetweenTwoVerticalLines = zoomingFactors.currentXZoomLevel * graphParameters.distanceBetweenTwoVerticalLines;
                graphParameters.totalVerticalLines = width / graphParameters.currentDistanceBetweenTwoVerticalLines;

                graphParameters.currentDistanceBetweenTwoHorizontalLines = zoomingFactors.currentYZoomLevel * graphParameters.distanceBetweenTwoHorizontalLines;
                graphParameters.totalHorizontalLines = height / graphParameters.currentDistanceBetweenTwoHorizontalLines;

            }
            else {
                zoomingFactors.zoomCounter--;
                //zoom out //scroll down //decrease
                /*ShiftOrigin*/
                if (currentOrigin.x !== defaultOrigin.x || currentOrigin.y !== defaultOrigin.y) {
                    distanceBetweenOrigin = Math.sqrt(Math.pow(currentOrigin.x - defaultOrigin.x, 2) + Math.pow(currentOrigin.y - defaultOrigin.y, 2));
                    //TODO:change this implementation
                    if (distanceBetweenOrigin <= 25) {
                        //create an new point object and then assign to avoid currentorigin and deafult origin to refere same object
                        newOriginPoint = new this._paperScope.Point([defaultOrigin.x, defaultOrigin.y]);
                        this._delta = new this._paperScope.Point(origins.currentOrigin.x - newOriginPoint.x, origins.currentOrigin.y - newOriginPoint.y);
                        origins.currentOrigin = newOriginPoint;
                        this._previousMaxValue = this._getGraphPointCoordinates([width, height / 2])[0];
                    }
                    else {
                        //angle = this._angleBetweenTwoPoints(currentOrigin, defaultOrigin);
                        //zoomingFactors.previousZoomAngle = angle;
                        angle = zoomingFactors.previousZoomAngle;
                        newOriginPoint = new this._paperScope.Point(currentOrigin.x + Math.cos(angle) * (shiftDistance), currentOrigin.y - Math.sin(angle) * (shiftDistance));
                        this._delta = new this._paperScope.Point(origins.currentOrigin.x - newOriginPoint.x, origins.currentOrigin.y - newOriginPoint.y);
                        origins.currentOrigin = newOriginPoint;
                        this._previousMaxValue = this._getGraphPointCoordinates([width, height / 2])[0];
                    }
                }
                else {
                    this._delta = new this._paperScope.Point(0, 0);
                }

                zoomingFactors.currentXZoomLevel -= this._ZOOM_LEVEL_INCREMENT_STEPS;
                zoomingFactors.currentXZoomLevel = parseFloat(zoomingFactors.currentXZoomLevel.toFixed(4));

                if (zoomingFactors.currentXZoomLevel < zoomFactor.xMinZoomLevel) {
                    /*vertical line distance Multiplier*/
                    this._xAxisZoomFactorModifier(true);

                    zoomFactor = this._zoomLevelLimits();

                    zoomingFactors.currentXZoomLevel = zoomFactor.xMaxZoomLevel;
                }
                zoomingFactors.currentYZoomLevel -= this._ZOOM_LEVEL_INCREMENT_STEPS;
                zoomingFactors.currentYZoomLevel = parseFloat(zoomingFactors.currentYZoomLevel.toFixed(4));

                if (zoomingFactors.currentYZoomLevel < zoomFactor.yMinZoomLevel) {
                    /*horizontal line distance Multiplier*/
                    this._yAxisZoomFactorModifier(true);

                    zoomFactor = this._zoomLevelLimits();

                    zoomingFactors.currentYZoomLevel = zoomFactor.yMaxZoomLevel;
                }
                xGridLines = graphParameters.xGridLine;
                yGridLines = graphParameters.yGridLine;
                graphParameters.currentDistanceBetweenTwoVerticalLines = zoomingFactors.currentXZoomLevel * graphParameters.distanceBetweenTwoVerticalLines;
                graphParameters.totalVerticalLines = width / graphParameters.currentDistanceBetweenTwoVerticalLines;

                graphParameters.currentDistanceBetweenTwoHorizontalLines = zoomingFactors.currentYZoomLevel * graphParameters.distanceBetweenTwoHorizontalLines;
                graphParameters.totalHorizontalLines = height / graphParameters.currentDistanceBetweenTwoHorizontalLines;

            }

            this._graphTypeSelector();

            this._graphLimitChangesDuringDragging();

            //            var othis = this;
            //            clearTimeout($.data(this, 'timer'));
            //            $.data(this, 'timer', setTimeout(function () {
            //                othis._shapeRedraw();
            //                paper.view.draw();
            //            }, 250));

            //            paper = this._paperScope;
            //            this._projectLayers.shapeLayer.activate();

            //            this._shapeRedraw();

            this._deltaAngle();

            if (modelObject.get('_plots').length !== 0) {
                this._shapeZoom();

            }
            if (modelObject.get('_points').length !== 0) {
                this._repositionPoints();
                //this._redrawPoints();
            }

            othis = this;

            clearTimeout($.data(this, 'timer'));
            $.data(this, 'timer', setTimeout(function () {
                if (modelObject.get('_plots').length !== 0 || modelObject.get('_images').length !== 0) {
                    othis._shapeRedraw();
                    //othis._paperScope.view.draw();
                    othis.refreshView();
                }
                othis.$el.find('canvas').trigger('interactivegraphzoomcomplete');
            }, 100));

            //this._paperScope.view.draw();
            this.refreshView();

        },

        /**
        *It is used to increase or decrese X-axis zoomFactors values
        *
        *@private
        *@method _xAxisZoomFactorModifier
        *@param {Boolean} isXzoomFactorIncrease if true x-axis zoom-factor increase else decreases
        *@return
        */
        _xAxisZoomFactorModifier: function _xAxisZoomFactorModifier(isXzoomFactorIncrease) {
            var zoomingFactors, factor, modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            zoomingFactors = graphDisplay._zoomingFactor;
            factor = this._zoomFactors;

            if (isXzoomFactorIncrease === true) {
                //zoom Out
                switch (zoomingFactors.xCurrentFactor) {
                    case factor[0]:
                        zoomingFactors.xCurrentFactor = factor[1];
                        zoomingFactors.xTotalMultiplier = zoomingFactors.xCurrentFactor * zoomingFactors.xZoomMultiplier;
                        graphDisplay._graphParameters.xGridLine = 4;
                        break;

                    case factor[1]:
                        zoomingFactors.xCurrentFactor = factor[2];
                        zoomingFactors.xTotalMultiplier = zoomingFactors.xCurrentFactor * zoomingFactors.xZoomMultiplier;
                        graphDisplay._graphParameters.xGridLine = 5;
                        break;

                    case factor[2]:
                        zoomingFactors.xCurrentFactor = factor[0];
                        zoomingFactors.xZoomMultiplier = zoomingFactors.xZoomMultiplier * 10;
                        zoomingFactors.xTotalMultiplier = zoomingFactors.xCurrentFactor * zoomingFactors.xZoomMultiplier;
                        graphDisplay._graphParameters.xGridLine = 4;
                        break;
                }
            }
            else {
                //Zoom in
                switch (zoomingFactors.xCurrentFactor) {
                    case factor[0]:
                        zoomingFactors.xCurrentFactor = factor[2];
                        zoomingFactors.xZoomMultiplier = zoomingFactors.xZoomMultiplier / 10;
                        zoomingFactors.xTotalMultiplier = zoomingFactors.xCurrentFactor * zoomingFactors.xZoomMultiplier;
                        graphDisplay._graphParameters.xGridLine = 5;
                        break;

                    case factor[1]:
                        zoomingFactors.xCurrentFactor = factor[0];
                        zoomingFactors.xTotalMultiplier = zoomingFactors.xCurrentFactor * zoomingFactors.xZoomMultiplier;
                        graphDisplay._graphParameters.xGridLine = 4;
                        break;

                    case factor[2]:
                        zoomingFactors.xCurrentFactor = factor[1];
                        zoomingFactors.xTotalMultiplier = zoomingFactors.xCurrentFactor * zoomingFactors.xZoomMultiplier;
                        graphDisplay._graphParameters.xGridLine = 4;
                        break;
                }
            }
        },

        /**
        *It is used to increase or decrese Y-axis zoomFactors values
        *
        *@private
        *@method _yAxisZoomFactorModifier
        *@param {Boolean} isYzoomFactorIncrease if true y-axis zoom-factor increases else decreases
        *@return
        */
        _yAxisZoomFactorModifier: function _yAxisZoomFactorModifier(isYzoomFactorIncrease) {
            var zoomingFactors, factor, modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            zoomingFactors = graphDisplay._zoomingFactor;
            factor = this._zoomFactors;

            if (isYzoomFactorIncrease === true) {
                //zoom out
                switch (zoomingFactors.yCurrentFactor) {
                    case factor[0]:
                        zoomingFactors.yCurrentFactor = factor[1];
                        zoomingFactors.yTotalMultiplier = zoomingFactors.yCurrentFactor * zoomingFactors.yZoomMultiplier;
                        graphDisplay._graphParameters.yGridLine = 4;
                        break;

                    case factor[1]:
                        zoomingFactors.yCurrentFactor = factor[2];
                        zoomingFactors.yTotalMultiplier = zoomingFactors.yCurrentFactor * zoomingFactors.yZoomMultiplier;
                        graphDisplay._graphParameters.yGridLine = 5;
                        break;

                    case factor[2]:
                        zoomingFactors.yCurrentFactor = factor[0];
                        zoomingFactors.yZoomMultiplier = zoomingFactors.yZoomMultiplier * 10;
                        zoomingFactors.yTotalMultiplier = zoomingFactors.yCurrentFactor * zoomingFactors.yZoomMultiplier;
                        graphDisplay._graphParameters.yGridLine = 4;
                        break;
                }
            }
            else {
                //zoom in
                switch (zoomingFactors.yCurrentFactor) {
                    case factor[0]:
                        zoomingFactors.yCurrentFactor = factor[2];
                        zoomingFactors.yZoomMultiplier = zoomingFactors.yZoomMultiplier / 10;
                        zoomingFactors.yTotalMultiplier = zoomingFactors.yCurrentFactor * zoomingFactors.yZoomMultiplier;
                        graphDisplay._graphParameters.yGridLine = 5;
                        break;

                    case factor[1]:
                        zoomingFactors.yCurrentFactor = factor[0];
                        zoomingFactors.yTotalMultiplier = zoomingFactors.yCurrentFactor * zoomingFactors.yZoomMultiplier;
                        graphDisplay._graphParameters.yGridLine = 4;
                        break;

                    case factor[2]:
                        zoomingFactors.yCurrentFactor = factor[1];
                        zoomingFactors.yTotalMultiplier = zoomingFactors.yCurrentFactor * zoomingFactors.yZoomMultiplier;
                        graphDisplay._graphParameters.yGridLine = 4;
                        break;
                }
            }
        },

        /**
        *Calculate angle between given point and canvas center point.
        *
        *@private
        *@method _angleBetweenTwoPoints
        *@param point  angle made by point from canvas center is calculated.
        *@return
        */

        /*Calculate angle between current-origin and center of graph after graph is drag and garph limt change */
        _angleBetweenTwoPoints: function _angleBetweenTwoPoints(fromPoint, toPoint) {
            var height, width, angle;

            height = Math.abs(fromPoint.y - toPoint.y);
            width = Math.abs(fromPoint.x - toPoint.x);
            angle = Math.atan(width / height);

            if (fromPoint.y < toPoint.y) {
                if (fromPoint.x < toPoint.x) {
                    angle = 3 * Math.PI / 2 + angle;
                }
                else if (fromPoint.x > toPoint.x) {
                    angle = 3 * Math.PI / 2 - angle;
                }
                else {
                    angle = 3 * Math.PI / 2;
                }
            }
            else if (fromPoint.y > toPoint.y) {
                if (fromPoint.x < toPoint.x) {
                    angle = Math.PI / 2 - angle;
                }
                else if (fromPoint.x > toPoint.x) {
                    angle = Math.PI / 2 + angle;
                }
                else {
                    angle = Math.PI / 2;
                }
            }
            else {
                if (fromPoint.x < toPoint.x) {
                    angle = 0;
                }
                else if (fromPoint.x > toPoint.x) {
                    angle = Math.PI;
                }
                else {
                    angle = 0;
                }
            }
            return angle;
        },

        /**
        *Calculate graph limits(X-axis and Y-axis's upper and lower values ) when graph is dragged or zoom.
        *
        *@private
        *@method _graphLimitChangesDuringDragging
        *@return
        */
        _graphLimitChangesDuringDragging: function _graphLimitChangesDuringDragging() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                modelBounds = modelObject.get('markerBounds'),
                parameters = graphDisplay._graphParameters,
                xGridLines = parameters.xGridLine,
                yGridLines = parameters.yGridLine,
                verticalDistance = parameters.distanceBetweenTwoVerticalLines,
                horizontalDistance = parameters.distanceBetweenTwoHorizontalLines,
                currentOrigin = graphDisplay._graphOrigin.currentOrigin,
                zoomingFactor = graphDisplay._zoomingFactor,
                currentLimits = graphDisplay._graphsAxisLimits.currentLimits,
                canvasHeight = this._canvasSize.height,
                canvasWidth = this._canvasSize.width,
                LowerMultiplier, UpperMultiplier;


            if (currentOrigin.y < 0) {
                LowerMultiplier = -1;
                UpperMultiplier = -1;
            }
            else if (currentOrigin.y > canvasHeight) {
                LowerMultiplier = 1;
                UpperMultiplier = 1;
            }
            else {
                LowerMultiplier = -1;
                UpperMultiplier = 1;
            }

            //currentLimits.yLower = value;
            currentLimits.yLower = this._getGraphPointCoordinates([currentOrigin.x, canvasHeight])[1];

            //currentLimits.yUpper = value;
            currentLimits.yUpper = this._getGraphPointCoordinates([currentOrigin.x, 0])[1];

            if (currentOrigin.x < 0) {
                LowerMultiplier = 1;
                UpperMultiplier = 1;
            }
            else if (currentOrigin.x > canvasWidth) {
                LowerMultiplier = -1;
                UpperMultiplier = -1;
            }
            else {
                LowerMultiplier = -1;
                UpperMultiplier = 1;
            }

            //currentLimits.xUpper = value;
            currentLimits.xUpper = this._getGraphPointCoordinates([canvasWidth, currentOrigin.y])[0];


            //currentLimits.xLower = value;
            currentLimits.xLower = this._getGraphPointCoordinates([0, currentOrigin.y])[0];

            this._setBounds();

            this._setTextBoxValues();
        },

        /**
        *Set text boxes(X-Upper,X-Lower,Y-Upper,Y-Lower) value, when graph is dragged or zoom. 
        *
        *@private
        *@method _setTextBoxValues
        *@return
        */
        _setTextBoxValues: function _setTextBoxValues() {

            var domElement, graphLimit, modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            domElement = graphDisplay._graphLimitTextBoxDomElement;
            graphLimit = graphDisplay._graphsAxisLimits.currentLimits;

            if (domElement.xLower !== null && domElement.xUpper !== null && domElement.yLower !== null && domElement.yUpper !== null) {
                /*if text-box*/
                domElement.xLower.value = graphLimit.xLower;
                domElement.xUpper.value = graphLimit.xUpper;
                domElement.yLower.value = graphLimit.yLower;
                domElement.yUpper.value = graphLimit.yUpper;
                /*if div*/
                //                domElement.xLower.innerHTML = graphLimit.xLower;
                //                domElement.xUpper.innerHTML = graphLimit.xUpper;
                //                domElement.yLower.innerHTML = graphLimit.yLower;
                //                domElement.yUpper.innerHTML = graphLimit.yUpper;
            }
        },

        /**
        *Changes graph limits when user enter value in text-box(X-Upper,X-Lower,Y-Upper,Y-Lower).
        *
        *@private
        *@method _graphAxisLimitChangedByUserInput
        *@param {boolean} isXlimitChange  if `true` x-axis limit(X-Upper or X-Lower) change,if `false` y-axis(Y-Upper or Y-Lower) changed
        *@return
        */
        _graphAxisLimitChangedByUserInput: function _graphAxisLimitChangedByUserInput(isXlimitChange, isCorrectNumberCase) {
            var domElement, xLower, xUpper, yLower, yUpper, isXLowerProperNumber, isXUpperProperNumber, isYLowerProperNumber, isYUpperProperNumber,
                currentGraphOrigin, graphCenterPoint, canvas, origins, modelObject, graphDisplay, allowedString = [], limits, currentLimits;
            isCorrectNumberCase = undefined;
            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            domElement = graphDisplay._graphLimitTextBoxDomElement;
            canvas = this._canvasSize;
            origins = graphDisplay._graphOrigin;
            limits = graphDisplay._graphsAxisLimits;
            currentLimits = limits.currentLimits;

            /*if text-box*/
            xLower = domElement.xLower.value;
            xUpper = domElement.xUpper.value;
            yLower = domElement.yLower.value;
            yUpper = domElement.yUpper.value;

            /*if div*/
            //            xLower = domElement.xLower.innerHTML;
            //            xUpper = domElement.xUpper.innerHTML;
            //            yLower = domElement.yLower.innerHTML;
            //            yUpper = domElement.yUpper.innerHTML;

            isXLowerProperNumber = this._checkForNumericValue(xLower);
            isXUpperProperNumber = this._checkForNumericValue(xUpper);
            isYLowerProperNumber = this._checkForNumericValue(yLower);
            isYUpperProperNumber = this._checkForNumericValue(yUpper);

            if (isXLowerProperNumber === true && isXUpperProperNumber === true && isYLowerProperNumber === true && isYUpperProperNumber === true) {
                if (currentLimits.xLower !== parseFloat(xLower) || currentLimits.xUpper !== parseFloat(xUpper) || currentLimits.yLower !== parseFloat(yLower) || currentLimits.yUpper !== parseFloat(yUpper)) {
                    //if(isCorrectNumberCase) {
                    /*check is X is last chnged or not,it is used in equalizing axis scales*/
                    graphDisplay._graphsAxisLimits.isXLastChangedLimit = isXlimitChange;

                    //this._axisMarkerMultiplierAdjuster(xLower, xUpper, yLower, yUpper);

                    this._setGraphLimits(xLower, xUpper, yLower, yUpper);

                    graphCenterPoint = origins.defaultOrigin;
                    currentGraphOrigin = origins.currentOrigin;

                    graphDisplay._zoomingFactor.previousZoomAngle = this._angleBetweenTwoPoints(currentGraphOrigin, graphCenterPoint);

                    this._graphTypeSelector();

                    if (modelObject.get('_plots').length !== 0) {
                        this._shapeRedraw();
                    }
                    if (modelObject.get('_points').length !== 0) {
                        this._repositionPoints();
                    }
                    this._deltaAngle();

                    if (graphCenterPoint.x === currentGraphOrigin.x && graphCenterPoint.y === currentGraphOrigin.y) {
                        origins.isOriginPositionChanged = false;
                    }
                    else {
                        origins.isOriginPositionChanged = true;
                    }
                    if (Math.abs(graphDisplay._graphParameters.distanceBetweenTwoVerticalLines - graphDisplay._graphParameters.distanceBetweenTwoHorizontalLines) > 0.1) {
                        this._triggerEqualizeEvent(true);
                    }
                    else {
                        this._triggerEqualizeEvent(false);
                    }
                }
            }
            else {
                allowedString = ['', '-'];
                if (allowedString.indexOf(xLower) === -1 && allowedString.indexOf(xUpper) === -1 && allowedString.indexOf(yLower) === -1 && allowedString.indexOf(yUpper) === -1) {
                    this._setTextBoxValues();
                }
            }
        },

        /**
        *Adjust zoom factor if difference between upper and lower value of limit,is very high or very low. 
        *
        *@private
        *@method _axisMarkerMultiplierAdjuster
        *@param {String} xLower  x-axis Lower value
        *@param {String} xUpper  x-axis Upper value
        *@param {String} yLower  y-axis Lower value
        *@param {String} yUpper  y-axis Upper value
        *@return
        */

        _axisMarkerMultiplierAdjuster: function _axisMarkerMultiplierAdjuster(xLower, xUpper, yLower, yUpper, forceApply) {
            this.setLimits(xLower, xUpper, yLower, yUpper);
            this._gridGraphModelObject.get('_graphDisplayValues')._graphOrigin.isOriginPositionChanged = false;
        },
        /**
        *Trim given number to required decimal points. 
        *
        *@private
        *@method _convertNumberTillRequiredDecimalPoint
        *@param {Number} number an number to be converted to desired format.
        *@return {Number} formatted number.
        */
        _convertNumberTillRequiredDecimalPoint: function _convertNumberTillRequiredDecimalPoint(number) {
            if (Math.abs(number) > 1) {
                return number.toFixed(3);
            }
            else {
                return number.toFixed(10);
            }
        },
        /**
        *Check if given string contains all numeric character. 
        *
        *@private
        *@method _checkForNumericValue
        *@param {Number} inputNumber an sting to be check for required format.
        *@return {Boolean}  return `true` if string is in correct format,else false.
        */
        _checkForNumericValue: function _checkForNumericValue(inputNumber) {
            var inputText, asciiValue, flag, noofMinusSign, noofdots, counter;

            inputText = inputNumber.toString();

            if (inputText.length > 0) {
                flag = true;
                noofMinusSign = 0;
                noofdots = 0;
                for (counter = 0; counter < inputText.length; counter++) {
                    asciiValue = inputText[counter].charCodeAt();
                    if (!((asciiValue >= 48 && asciiValue <= 57) || (asciiValue === 45 || asciiValue === 46))) {
                        flag = false;
                        break;
                    }
                    else {
                        if (asciiValue === 45) {
                            noofMinusSign += 1;
                        }
                        else if (asciiValue === 46) {
                            noofdots += 1;
                        }
                        if (noofdots > 1 || noofMinusSign > 1) {
                            flag = false;
                            break;
                        }
                    }
                }
                if (inputText.length === 1) {
                    if (asciiValue === 45) {
                        flag = false;
                    }
                }
                return flag;
            }
        },
        /**
        *Check value of current graph type and call appropriate function to draw graph. 
        *
        *@private
        *@method _graphTypeSelector
        *@return 
        */
        _graphTypeSelector: function _graphTypeSelector() {

            //            paper = this._paperScope;
            this._projectLayers.gridLayer.activate();

            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');



            if (graphDisplay._graphDisplay.isCartesionCurrentGraphType === true) {
                this._cartesianGraph();
            }
            else {
                this._polarGraph();
            }
            this._drawAxisLines();
            this._axisMarker();

            this.refreshView();
        },

        getMarkerBounds: function () {
            return this.markerBounds;
        },

        /**
        *Equalize axis scales,when user click 'equalize scale' button 
        *
        *@private
        *@method _equalizeAxisScales
        *@return 
        */
        _equalizeAxisScales: function _equalizeAxisScales() {

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                modelBounds = modelObject.get('markerBounds'),
                markerBound = this.markerBounds,
                canvas = this._canvasSize,
                limits = graphDisplay._graphsAxisLimits,
                parameters = graphDisplay._graphParameters,
                canvasHeight = canvas.height,
                canvasWidth = canvas.width,
                origin = graphDisplay._graphOrigin.currentOrigin,
                zooming = graphDisplay._zoomingFactor,
                graphCurrentLimits = limits.currentLimits,
                xLowerMultiplier, xUpperMultiplier, yLowerMultiplier, yUpperMultiplier;

            //if (Math.abs(graphDisplay._graphParameters.distanceBetweenTwoVerticalLines - graphDisplay._graphParameters.distanceBetweenTwoHorizontalLines) > 0.1) {
            if (limits.isXLastChangedLimit === true) {
                if (origin.y < 0) {
                    yLowerMultiplier = -1;
                    yUpperMultiplier = -1;
                }
                else if (origin.y > canvasHeight) {
                    yLowerMultiplier = 1;
                    yUpperMultiplier = 1;
                }
                else {
                    yLowerMultiplier = -1;
                    yUpperMultiplier = 1;
                }

                parameters.distanceBetweenTwoHorizontalLines = parameters.distanceBetweenTwoVerticalLines;
                parameters.currentDistanceBetweenTwoHorizontalLines = parameters.currentDistanceBetweenTwoVerticalLines;
                parameters.totalHorizontalLines = canvasHeight / parameters.currentDistanceBetweenTwoHorizontalLines;

                zooming.yCurrentFactor = zooming.xCurrentFactor;
                zooming.yZoomMultiplier = zooming.xZoomMultiplier;
                zooming.yTotalMultiplier = zooming.xTotalMultiplier;
                parameters.yGridLine = parameters.xGridLine;


                zooming.currentYZoomLevel = zooming.currentXZoomLevel;

                graphCurrentLimits.yLower = (yLowerMultiplier * (Math.abs(origin.y - canvasHeight) / parameters.currentDistanceBetweenTwoHorizontalLines) / parameters.yGridLine) * zooming.yTotalMultiplier;
                graphCurrentLimits.yUpper = (yUpperMultiplier * (Math.abs(origin.y - 0) / parameters.currentDistanceBetweenTwoHorizontalLines) / parameters.yGridLine) * zooming.yTotalMultiplier;

            }
            else {
                if (origin.x < 0) {
                    xLowerMultiplier = 1;
                    xUpperMultiplier = 1;
                }
                else if (origin.x > canvasWidth) {
                    xLowerMultiplier = -1;
                    xUpperMultiplier = -1;
                }
                else {
                    xLowerMultiplier = -1;
                    xUpperMultiplier = 1;
                }


                zooming.xCurrentFactor = zooming.yCurrentFactor;
                zooming.xZoomMultiplier = zooming.yZoomMultiplier;
                zooming.xTotalMultiplier = zooming.yTotalMultiplier;
                parameters.xGridLine = parameters.yGridLine;

                zooming.currentXZoomLevel = zooming.currentYZoomLevel;

                parameters.distanceBetweenTwoVerticalLines = parameters.distanceBetweenTwoHorizontalLines;
                parameters.currentDistanceBetweenTwoVerticalLines = parameters.currentDistanceBetweenTwoHorizontalLines;
                parameters.totalVerticalLines = canvasWidth / parameters.currentDistanceBetweenTwoVerticalLines;

                graphCurrentLimits.xUpper = xUpperMultiplier * ((Math.abs(origin.x - canvasWidth) / parameters.currentDistanceBetweenTwoVerticalLines) / parameters.xGridLine) * zooming.xTotalMultiplier;
                graphCurrentLimits.xLower = (xLowerMultiplier * (Math.abs(origin.x - 0) / parameters.currentDistanceBetweenTwoHorizontalLines) / parameters.xGridLine) * zooming.xTotalMultiplier;
            }

            this._triggerEqualizeEvent(false);

            this._setBounds();

            this._originPositionOnGraph();

            this._graphTypeSelector();

            if (modelObject.get('_plots').length !== 0) {
                this._shapeRedraw();
            }
            if (modelObject.get('_points').length !== 0) {
                this._repositionPoints();
            }
            this._setTextBoxValues();
            //}

        },

        /**
        *Generate different Symbol for drawing cartesian graph 
        *
        *@private
        *@method _cartesianSymbolGenerator
        *@return 
        */

        /*create symbol for cartesion graph*/
        _cartesionSymbolGenerator: function _cartesionSymbolGenerator() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                height = this._canvasSize.height,
                width = this._canvasSize.width,
                symbols = graphDisplay._symbols,
                interactiveInnerAxisColor = '#787878', interactiveInnerAxisWidth = 1,
                currentStrokeWidth, innerLinesCurrentStokeColor, markerLinesCurrentStokeColor, innerXaxisPath, markerXaxisPath, innerXaxisSymbol, markerXaxisSymbol,
                innerYaxisPath, markerYaxisPath, innerYaxisSymbol, markerYaxisSymbol, XaxisPath, YaxisPath, XaxisSymbol, YaxisSymbol;

            if (graphDisplay._graphDisplay.isProjectorModeOn === true) {
                currentStrokeWidth = 2;
                innerLinesCurrentStokeColor = new this._paperScope.Color(0.8, 0.8, 0.8);
                markerLinesCurrentStokeColor = new this._paperScope.Color(0.4, 0.4, 0.4);
            }
            else {
                currentStrokeWidth = 1;
                innerLinesCurrentStokeColor = new this._paperScope.Color(0.9, 0.9, 0.9);
                markerLinesCurrentStokeColor = new this._paperScope.Color(0.7, 0.7, 0.7);
            }

            /////////////////----------- vertical Axis Symbol------------/////////////////
            /*Create path for X value(vertical inner Line) and set its property*/
            innerXaxisPath = new this._paperScope.Path.Line({
                from: [0, 0],
                to: [0, height],
                //strokeColor: innerLinesCurrentStokeColor,
                //strokeWidth: 1
                strokeColor: innerLinesCurrentStokeColor,
                strokeWidth: 1
            });

            /*Create path for X value(vertical line marker) and set its property*/
            markerXaxisPath = new this._paperScope.Path.Line({
                from: [0, 0],
                to: [0, height],
                strokeColor: markerLinesCurrentStokeColor,
                strokeWidth: 1
            });

            /*create Symbol for innerXaxisPath(vertical inner line)*/
            innerXaxisSymbol = new this._paperScope.Symbol(innerXaxisPath);

            /*create Symbol for markerXaxisPath(vertical line marker)*/
            markerXaxisSymbol = new this._paperScope.Symbol(markerXaxisPath);

            /*remove vertical line paths, after there symbol is created*/
            innerXaxisPath.remove();
            markerXaxisPath.remove();

            symbols.xInnerGridLines = innerXaxisSymbol;
            symbols.xMarkerLines = markerXaxisSymbol;


            /////////////////----------- horizontal Axis Symbol------------/////////////////

            /*Create path for Y value(Horizontal inner Line) and set its property*/
            innerYaxisPath = new this._paperScope.Path.Line({
                from: [0, 0],
                to: [width, 0],
                strokeColor: innerLinesCurrentStokeColor,
                strokeWidth: 1
            });

            /*Create path for Y value(Horizontal line marker) and set its property*/
            markerYaxisPath = new this._paperScope.Path.Line({
                from: [0, 0],
                to: [width, 0],
                strokeColor: markerLinesCurrentStokeColor,
                strokeWidth: 1
            });

            /*create Symbol for innerYaxisPath(Horizontal inner line)*/
            innerYaxisSymbol = new this._paperScope.Symbol(innerYaxisPath);

            /*create Symbol for markerYaxisPath(Horizontal line marker)*/
            markerYaxisSymbol = new this._paperScope.Symbol(markerYaxisPath);

            /*remove Horizontal line paths, after there symbol is created*/
            innerYaxisPath.remove();
            markerYaxisPath.remove();

            symbols.yInnerGridLines = innerYaxisSymbol;
            symbols.yMarkerLines = markerYaxisSymbol;

            //////////////////----------X-axis and Y-axis-----------------//////////////////////////

            YaxisPath = new this._paperScope.Path.Line({
                from: [0, 0],
                to: [0, height],
                strokeColor: (0, 0, 0),
                strokeWidth: currentStrokeWidth
            });

            XaxisPath = new this._paperScope.Path.Line({
                from: [0, 0],
                to: [width, 0],
                strokeColor: (0, 0, 0),
                strokeWidth: currentStrokeWidth
            });

            XaxisSymbol = new this._paperScope.Symbol(XaxisPath);
            YaxisSymbol = new this._paperScope.Symbol(YaxisPath);

            XaxisPath.remove();
            YaxisPath.remove();

            symbols.xAxis = XaxisSymbol;
            symbols.yAxis = YaxisSymbol;

        },

        /**
        *Calculate distance between two adjecent horizontal and vertical lines, also calculate total number of horizontal and vertical lines present on canvas.
        *
        *@private
        *@method _distanceBetweenLinesCalculator
        *@return 
        */

        /*calculate total number of vertical and horizontal lines on canvas and distance between them*/
        _distanceBetweenLinesCalculator: function _distanceBetweenLinesCalculator() {
            var graphDisplay = this._gridGraphModelObject.get('_graphDisplayValues'),
                currentLimits = graphDisplay._graphsAxisLimits.currentLimits,
                adjecentLinesParameter,
                parameters = graphDisplay._graphParameters;

            //call function to calculate distance between lines 
            adjecentLinesParameter = this._calculateDistanceBetweenAdjecentLines(currentLimits.xLower, currentLimits.xUpper, currentLimits.yLower, currentLimits.yUpper);

            parameters.totalVerticalLines = adjecentLinesParameter.totalVerticalLines;
            parameters.distanceBetweenTwoVerticalLines = parameters.currentDistanceBetweenTwoVerticalLines = adjecentLinesParameter.distanceBetweenVerticalLines;
            parameters.totalHorizontalLines = adjecentLinesParameter.totalHorizontalLines;
            parameters.distanceBetweenTwoHorizontalLines = parameters.currentDistanceBetweenTwoHorizontalLines = adjecentLinesParameter.distanceBetweenHorizontalLines;

        },
        /**
        * calculate distance between lines and number of lines depending upon axis limits.
        * @method _calculateDistanceBetweenAdjecentLines
        * @param xLower {Number} lower limit of x-axis
        * @param xUpper {Number} Upper limit of x-axis
        * @param yLower {Number} lower limit of y-axis
        * @param yUpper {Number} Upper limit of y-axis
        * @private
        */
        /*calculate distance between adjecent lines,it consider */
        _calculateDistanceBetweenAdjecentLines: function _calculateDistanceBetweenAdjecentLines(xLower, xUpper, yLower, yUpper) {

            var height = this._canvasSize.height,
                width = this._canvasSize.width,
                modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                currentLimits = graphDisplay._graphsAxisLimits.currentLimits,
                zoomingFactors = graphDisplay._zoomingFactor,
                parameters = graphDisplay._graphParameters,
                xMarkerGrid = parameters.xGridLine,
                yMarkerGrid = parameters.yGridLine,
                graphVerticalLines, verticalLineDistance,
                graphHorizontalLines, horizontalineDistance;

            /*count total number of vertical Line*/

            graphVerticalLines = ((xUpper - xLower) / graphDisplay._zoomingFactor.xTotalMultiplier) * xMarkerGrid;
            verticalLineDistance = width / graphVerticalLines;
            graphHorizontalLines = ((yUpper - yLower) / graphDisplay._zoomingFactor.yTotalMultiplier) * yMarkerGrid;
            horizontalineDistance = height / graphHorizontalLines;

            return {
                distanceBetweenVerticalLines: verticalLineDistance,
                totalVerticalLines: graphVerticalLines,
                distanceBetweenHorizontalLines: horizontalineDistance,
                totalHorizontalLines: graphHorizontalLines
            }
        },

        /**
        * Calculate origin co-ordinates.
        * @method _originPositionOnGraph
        * @private
        */
        _originPositionOnGraph: function () {

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                height = this._canvasSize.height,
                width = this._canvasSize.width,
                currentLimits = graphDisplay._graphsAxisLimits.currentLimits,
                parameters = graphDisplay._graphParameters,
                xLowerValue = currentLimits.xLower,
                yUpperValue = currentLimits.yUpper,
                xMarkerGrid = parameters.xGridLine,
                yMarkerGrid = parameters.yGridLine,
                scope = this._paperScope,
                xPosition, yPosition;

            /* condition to decide initial origin Position*/
            if (xLowerValue >= 0) {
                xPosition = (0 - xLowerValue);
            }
            else {
                xPosition = Math.abs(xLowerValue);
            }

            if (yUpperValue <= 0) {
                yPosition = 0 - Math.abs(yUpperValue);
            }
            else {
                yPosition = Math.abs(yUpperValue);
            }

            graphDisplay._graphOrigin.currentOrigin = new scope.Point((xPosition / graphDisplay._zoomingFactor.xTotalMultiplier * xMarkerGrid * parameters.currentDistanceBetweenTwoVerticalLines),
                                                                 (yPosition / graphDisplay._zoomingFactor.yTotalMultiplier * yMarkerGrid * parameters.currentDistanceBetweenTwoHorizontalLines));
            //graphDisplay._graphOrigin.currentOrigin = new scope.Point((xPosition / graphDisplay._zoomingFactor.xTotalMultiplier * xMarkerGrid * parameters.distanceBetweenTwoVerticalLines / xZoomingFactor),
            //                                                       (yPosition / graphDisplay._zoomingFactor.yTotalMultiplier * yMarkerGrid * parameters.distanceBetweenTwoHorizontalLines / yZoomingFactor));

            this._previousMaxValue = this._getGraphPointCoordinates([width, height / 2])[0];
        },

        /**
        *Draw Cartesion graph.
        *
        *@private
        *@method _cartesianGraph
        *@return 
        */

        /*Function Draw Cartesion graph*/
        _cartesianGraph: function _cartesianGraph() {

            this._paperScope.project.activeLayer.removeChildren();

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                modelBounds = modelObject.get('markerBounds'),
                canvas = this._canvasSize,
                parameters = graphDisplay._graphParameters,
                zoomingFactors = graphDisplay._zoomingFactor,
                symbols = graphDisplay._symbols,
                isGridLineShown = graphDisplay._graphDisplay.isGridLineShown,
                height = canvas.height,
                width = canvas.width,
                xMarkerGrid = parameters.xGridLine,
                yMarkerGrid = parameters.yGridLine,
                originPoint = graphDisplay._graphOrigin.currentOrigin,
                markerGrid, verticalLinesDistance, totalVerticalLinesOnCanvas,
                canvasDistanceLeftOfOrigin, canvasLinesLeftOfOrigin, xExtraCanvasDistance, lineCounter, xlineCountDecider, originDistanceLeftofCanvas, linesLeftOfCanvas,
                horizontalLinesDistance, totalHorizontalLinesOnCanvas, canvasDistanceaboveOfOrigin, canvasLinesAboveOfOrigin, yExtraCanvasDistance,
                ylineCountDecider, originDistanceAboveofCanvas, linesAboveCanvas, canvas,
                markerStartingValueInRadian, markerPosition, distanceBetweenOriginAndfirstPoint, adjecentVerticalLinesDistance, totalVerticalLines,
                minZoomInDistance, adjecentHorizontalLinesDistance, totalHorizontalLines, modelBounds, markerStartingValue, markerForRadian, point, size, shape;


            //code by shashank to add layer background
            point = new this._paperScope.Point(0, 0);
            size = new this._paperScope.Size(this._canvasSize.width, this._canvasSize.height);
            shape = new this._paperScope.Shape.Rectangle(point, size);
            shape.fillColor = this._backgroundColor;

            //condition to check if grid line to be drawn
            if (isGridLineShown === true) {

                //--------------------x-grid lines-----------------------------------//

                if (graphDisplay._graphDisplay.isXmarkerInRadians === false) {
                    //x-axis MarkerLines in degree
                    //                ////======vertical Lines  parametercalculator========/////
                    verticalLinesDistance = parameters.currentDistanceBetweenTwoVerticalLines;
                    totalVerticalLinesOnCanvas = parameters.totalVerticalLines;

                }
                else {
                    //x-axis Marker line in Radian
                    //minZoomInDistance = parameters.distanceBetweenTwoVerticalLines * xMarkerGrid / (xMarkerGrid / (xMarkerGrid - 2));

                    minZoomInDistance = this._zoomLevelLimits().xMinZoomLevel * parameters.distanceBetweenTwoVerticalLines;
                    markerForRadian = this._getRadianMarkers(minZoomInDistance, true);
                    markerStartingValueInRadian = markerForRadian.marker;

                    markerStartingValue = markerStartingValueInRadian / Math.PI;

                    xMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                    markerPosition = this._getCanvasPointCoordinates([markerStartingValueInRadian, 0]);
                    distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.x - markerPosition[0]);
                    adjecentVerticalLinesDistance = distanceBetweenOriginAndfirstPoint / xMarkerGrid;
                    totalVerticalLines = width / adjecentVerticalLinesDistance;

                    if (adjecentVerticalLinesDistance < minZoomInDistance) {
                        markerStartingValueInRadian = markerForRadian.maxMarker;
                        markerStartingValue = markerStartingValueInRadian / Math.PI;

                        xMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                        markerPosition = this._getCanvasPointCoordinates([markerStartingValueInRadian, 0]);
                        distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.x - markerPosition[0]);
                        adjecentVerticalLinesDistance = distanceBetweenOriginAndfirstPoint / xMarkerGrid;
                        totalVerticalLines = width / adjecentVerticalLinesDistance;
                    }
                    verticalLinesDistance = adjecentVerticalLinesDistance;
                    totalVerticalLinesOnCanvas = totalVerticalLines;
                }

                ////======vertical Lines  parameter calculation========/////
                if (originPoint.x >= 0) {
                    canvasDistanceLeftOfOrigin = originPoint.x;
                    canvasLinesLeftOfOrigin = parseInt(canvasDistanceLeftOfOrigin / verticalLinesDistance, 10);
                    xExtraCanvasDistance = canvasDistanceLeftOfOrigin - canvasLinesLeftOfOrigin * verticalLinesDistance;
                    lineCounter = 0;
                    xlineCountDecider = xMarkerGrid - (canvasLinesLeftOfOrigin % xMarkerGrid);
                }
                else {
                    originDistanceLeftofCanvas = Math.abs(originPoint.x);
                    linesLeftOfCanvas = parseInt(originDistanceLeftofCanvas / verticalLinesDistance, 10);
                    xExtraCanvasDistance = verticalLinesDistance - (originDistanceLeftofCanvas - linesLeftOfCanvas * verticalLinesDistance);
                    lineCounter = 0;
                    xlineCountDecider = linesLeftOfCanvas;

                    if (xExtraCanvasDistance !== 0) {
                        xlineCountDecider++;
                    }
                }
                //--------------------y-grid lines-----------------------------------//
                if (graphDisplay._graphDisplay.isYmarkerInRadians === false) {
                    //y-axis marker lines in degree
                    horizontalLinesDistance = parameters.currentDistanceBetweenTwoHorizontalLines;
                    totalHorizontalLinesOnCanvas = parameters.totalHorizontalLines;
                }
                else {
                    //y-axis Marker lines in radian
                    //minZoomInDistance = parameters.distanceBetweenTwoHorizontalLines * yMarkerGrid / (yMarkerGrid / (yMarkerGrid - 2));
                    minZoomInDistance = this._zoomLevelLimits().yMinDistance;
                    markerForRadian = this._getRadianMarkers(minZoomInDistance, false);
                    markerStartingValueInRadian = markerForRadian.marker;

                    markerStartingValue = markerStartingValueInRadian / Math.PI;

                    yMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                    markerPosition = this._getCanvasPointCoordinates([0, markerStartingValueInRadian]);
                    distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.y - markerPosition[1]);
                    adjecentHorizontalLinesDistance = distanceBetweenOriginAndfirstPoint / yMarkerGrid;
                    totalHorizontalLines = height / adjecentHorizontalLinesDistance;

                    if (adjecentHorizontalLinesDistance < minZoomInDistance) {
                        markerStartingValueInRadian = markerForRadian.maxMarker;
                        markerStartingValue = markerStartingValueInRadian / Math.PI;

                        yMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                        markerPosition = this._getCanvasPointCoordinates([0, markerStartingValueInRadian]);
                        distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.y - markerPosition[1]);
                        adjecentHorizontalLinesDistance = distanceBetweenOriginAndfirstPoint / yMarkerGrid;
                        totalHorizontalLines = height / adjecentHorizontalLinesDistance;
                    }
                    horizontalLinesDistance = adjecentHorizontalLinesDistance;
                    totalHorizontalLinesOnCanvas = totalHorizontalLines;
                }

                /////-----------horizontal Lines parameter calculator---------////////////
                if (originPoint.y >= 0) {
                    canvasDistanceaboveOfOrigin = originPoint.y;
                    canvasLinesAboveOfOrigin = parseInt(canvasDistanceaboveOfOrigin / horizontalLinesDistance, 10);
                    yExtraCanvasDistance = canvasDistanceaboveOfOrigin - canvasLinesAboveOfOrigin * horizontalLinesDistance;
                    ylineCountDecider = yMarkerGrid - (canvasLinesAboveOfOrigin % yMarkerGrid);
                }
                else {
                    originDistanceAboveofCanvas = Math.abs(originPoint.y);
                    linesAboveCanvas = parseInt(originDistanceAboveofCanvas / horizontalLinesDistance, 10);
                    yExtraCanvasDistance = horizontalLinesDistance - (originDistanceAboveofCanvas - linesAboveCanvas * horizontalLinesDistance);
                    ylineCountDecider = linesAboveCanvas;

                    if (yExtraCanvasDistance !== 0) {
                        ylineCountDecider++;
                    }
                }

                /*draw vertical innerGrid Line*/
                for (lineCounter = 0; lineCounter < totalVerticalLinesOnCanvas; lineCounter++, xlineCountDecider++) {
                    if (xlineCountDecider % xMarkerGrid === 0) {
                        symbols.xMarkerLines.place(new this._paperScope.Point(xExtraCanvasDistance + lineCounter * verticalLinesDistance, height / 2));

                    }
                    else {
                        symbols.xInnerGridLines.place(new this._paperScope.Point(xExtraCanvasDistance + lineCounter * verticalLinesDistance, height / 2));
                    }
                }

                /*Loops draw Horizontal Grid lines Lines */
                /*draw horizontal innerGrid Line*/
                for (lineCounter = 0; lineCounter < totalHorizontalLinesOnCanvas; lineCounter++, ylineCountDecider++) {
                    if (ylineCountDecider % yMarkerGrid === 0) {
                        symbols.yMarkerLines.place(new this._paperScope.Point(width / 2, yExtraCanvasDistance + lineCounter * horizontalLinesDistance));
                    }
                    else {

                        symbols.yInnerGridLines.place(new this._paperScope.Point(width / 2, yExtraCanvasDistance + lineCounter * horizontalLinesDistance));
                    }
                }
            }

        },
        /**
        * return number of grid lines marker value.
        * @method _numberOfMarkerLines
        * @param {Number} marker value
        * @return {Number} GridLines
        */
        _numberOfMarkerLines: function _numberOfMarkerLines(number) {
            var markerLines = this.GRID_LINES,
                regex = /5/g;
            //if (number !== 1 && number % 5 === 0 && (number / 5) % 2 === 0) {
            if(regex.test(number)){
                return markerLines.FIVE_MULTIPLIER;
            }
            else {
                return markerLines.DEFAULT;
            }

        },

        /**
        * return marker staring value in radian for current marker in degree
        * @method _getRadianMarkers
        * @param {Number} minimum zoom level distance
        * @param isXMarker {boolean} is marker is x or y
        */
        _getRadianMarkers: function _getRadianMarkers(minDistance, isXMarker) {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                count,
                maxMarker,
                minMarker,
                canvasCoordinatesOfCenter,
                canvasCoordinates,
                distance,
                totalMultiplier,
                currentFactor,
                zoomMultiplier;

            if (isXMarker === true) {
                totalMultiplier = graphDisplay._zoomingFactor.xTotalMultiplier;
                currentFactor = graphDisplay._zoomingFactor.xCurrentFactor;
                zoomMultiplier = graphDisplay._zoomingFactor.xZoomMultiplier;
            }
            else {
                totalMultiplier = graphDisplay._zoomingFactor.yTotalMultiplier;
                currentFactor = graphDisplay._zoomingFactor.yCurrentFactor;
                zoomMultiplier = graphDisplay._zoomingFactor.yZoomMultiplier;
            }

            if (totalMultiplier === 5) {
                maxMarker = Math.ceil(totalMultiplier / Math.PI) * Math.PI;
                minMarker = Math.floor(totalMultiplier / Math.PI) * Math.PI;
            }
            else if (currentFactor === 5) {
                if (zoomMultiplier < 1) {
                    count = Math.log(1 / zoomMultiplier) / Math.LN10;
                    maxMarker = Math.PI / (6 * Math.pow(8, count - 1));
                    minMarker = Math.PI / (12 * Math.pow(8, count - 1));
                }
                else {
                    maxMarker = 2 * (zoomMultiplier) * Math.PI;
                    minMarker = (zoomMultiplier) * Math.PI;
                }
            }
            if (totalMultiplier === 2) {
                maxMarker = Math.PI;
                minMarker = Math.PI / 2;
            }
            else if (currentFactor === 2) {
                if (zoomMultiplier < 1) {
                    count = Math.log(1 / zoomMultiplier) / Math.LN10;
                    maxMarker = Math.PI / (12 * Math.pow(8, count - 1));
                    minMarker = Math.PI / (3 * Math.pow(8, count));
                }
                else {
                    maxMarker = (zoomMultiplier) * Math.PI;
                    minMarker = 5 * (zoomMultiplier / 10) * Math.PI;
                }
            }
            if (totalMultiplier === 1) {
                maxMarker = Math.PI / 3;
                minMarker = Math.PI / 3;
            }
            else if (currentFactor === 1) {
                if (zoomMultiplier < 1) {
                    count = Math.log(1 / zoomMultiplier) / Math.LN10;
                    maxMarker = Math.PI / (3 * Math.pow(8, count));
                    minMarker = Math.PI / (6 * Math.pow(8, count));
                }
                else {
                    maxMarker = 5 * (zoomMultiplier / 10) * Math.PI;
                    minMarker = 2 * (zoomMultiplier / 10) * Math.PI;
                }
            }

            canvasCoordinatesOfCenter = this._getCanvasPointCoordinates([0, 0]);
            if (isXMarker) {
                canvasCoordinates = this._getCanvasPointCoordinates([maxMarker, 0]);
            }
            else {
                canvasCoordinates = this._getCanvasPointCoordinates([0, maxMarker]);
            }

            //            coordinatesTemp = this._getCanvasPointCoordinates([0.05, 0]);
            distance = Math.sqrt(Math.abs(Math.pow((canvasCoordinatesOfCenter[0] - canvasCoordinates[0]), 2) + Math.pow((canvasCoordinatesOfCenter[1] - canvasCoordinates[1]), 2)));

            if ((distance / 2) >= minDistance) {
                //                return minMarker;
                return { marker: minMarker, minMarker: minMarker, maxMarker: maxMarker };
            }
            else {
                //                return maxMarker;
                return { marker: maxMarker, minMarker: minMarker, maxMarker: maxMarker };

            }

        },

        _graphStartingGridLines: function () {
            var horizontalLinesCounter, height, width, markerGrid, originPoint, verticalLinesDistance, totalVerticalLinesOnCanvas,
                canvasDistanceLeftOfOrigin, canvasLinesLeftOfOrigin, xExtraCanvasDistance, lineCounter, xlineCountDecider, originDistanceLeftofCanvas, linesLeftOfCanvas,
                horizontalLinesDistance, totalHorizontalLinesOnCanvas, canvasDistanceaboveOfOrigin, canvasLinesAboveOfOrigin, yExtraCanvasDistance,
                ylineCountDecider, originDistanceAboveofCanvas, linesAboveCanvas, canvas, parameters, symbols, zoomingFactors, modelObject, graphDisplay, xMarkerText, yMarkerText, arr, xGridLines, yGridLines;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');


            canvas = this._canvasSize;
            parameters = graphDisplay._graphParameters;
            zoomingFactors = graphDisplay._zoomingFactor;
            symbols = graphDisplay._symbols;

            horizontalLinesCounter = 0;
            height = canvas.height;
            width = canvas.width;
            xGridLines = parameters.xGridLine;
            yGridLines = parameters.yGridLine;

            originPoint = graphDisplay._graphOrigin.currentOrigin;

            ////======vertical Lines  parametercalculator========/////
            verticalLinesDistance = parameters.distanceBetweenTwoVerticalLines;
            totalVerticalLinesOnCanvas = parameters.totalVerticalLines;

            if (originPoint.x >= 0) {
                canvasDistanceLeftOfOrigin = originPoint.x;
                canvasLinesLeftOfOrigin = parseInt(canvasDistanceLeftOfOrigin / verticalLinesDistance, 10);
                xExtraCanvasDistance = canvasDistanceLeftOfOrigin - canvasLinesLeftOfOrigin * verticalLinesDistance;
                lineCounter = 0;
                xlineCountDecider = xGridLines - (canvasLinesLeftOfOrigin % xGridLines);
                xMarkerText = parseInt(canvasLinesLeftOfOrigin / xGridLines, 10);
            }
            else {
                originDistanceLeftofCanvas = Math.abs(originPoint.x);
                linesLeftOfCanvas = parseInt(originDistanceLeftofCanvas / verticalLinesDistance, 10);
                xExtraCanvasDistance = verticalLinesDistance - (originDistanceLeftofCanvas - linesLeftOfCanvas * verticalLinesDistance);
                lineCounter = 0;
                xlineCountDecider = linesLeftOfCanvas;
                xMarkerText = parseInt(linesLeftOfCanvas / xGridLines, 10);

                if (xExtraCanvasDistance !== 0) {
                    xlineCountDecider++;
                }
            }

            /////-----------horizontal Lines parameter calculator---------////////////
            horizontalLinesDistance = parameters.distanceBetweenTwoHorizontalLines;
            totalHorizontalLinesOnCanvas = parameters.totalHorizontalLines;

            if (originPoint.y >= 0) {
                canvasDistanceaboveOfOrigin = originPoint.y;
                canvasLinesAboveOfOrigin = parseInt(canvasDistanceaboveOfOrigin / horizontalLinesDistance, 10);
                yExtraCanvasDistance = canvasDistanceaboveOfOrigin - canvasLinesAboveOfOrigin * horizontalLinesDistance;
                ylineCountDecider = yGridLines - (canvasLinesAboveOfOrigin % yGridLines);
                yMarkerText = parseInt(canvasLinesAboveOfOrigin / yGridLines, 10);
            }
            else {
                originDistanceAboveofCanvas = Math.abs(originPoint.y);
                linesAboveCanvas = parseInt(originDistanceAboveofCanvas / verticalLinesDistance, 10);
                yExtraCanvasDistance = verticalLinesDistance - (originDistanceAboveofCanvas - linesAboveCanvas * verticalLinesDistance);
                ylineCountDecider = linesAboveCanvas;
                yMarkerText = parseInt(linesAboveCanvas / yGridLines, 10);

                if (yExtraCanvasDistance !== 0) {
                    ylineCountDecider++;
                }
            }
            arr = [xExtraCanvasDistance, xlineCountDecider, xMarkerText, yExtraCanvasDistance, ylineCountDecider, yMarkerText];
            //            var arr = [height, width, markerGrid, symbols, verticalLinesDistance, totalVerticalLinesOnCanvas, xExtraCanvasDistance, xlineCountDecider, horizontalLinesDistance, totalHorizontalLinesOnCanvas, yExtraCanvasDistance, ylineCountDecider];
            return arr;
        },

        /**
        *Draw Polar graph.
        *
        *@private
        *@method _polarGraph
        *@return 
        */

        /*function draw polar graph*/
        //TODO: improve this function as per desmos,currentaly not as per desmos
        _polarGraph: function _polarGraph() {
            //            paper = this._paperScope;
            //            this._projectLayers.gridLayer.activate();
            this._paperScope.project.activeLayer.removeChildren();

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                parameters = graphDisplay._graphParameters,
                zoomingFactors = graphDisplay._zoomingFactor,
                canvas = this._canvasSize,
                isLabelShown = graphDisplay._graphDisplay.isLabelShown,
                isGridLineShown = graphDisplay._graphDisplay.isGridLineShown,
                verticalDistance = parameters.currentDistanceBetweenTwoVerticalLines,
                horizontalDistance = parameters.currentDistanceBetweenTwoHorizontalLines,
                maxCount = parameters.totalVerticalLines,
                canvasWidth = canvas.width,
                canvasHeight = canvas.height,
                xGridLines = parameters.xGridLine,
                yGridLines = parameters.yGridLine,
                origin = graphDisplay._graphOrigin.currentOrigin,
                endDistance = 0,
                path, startDistance, temp, distanceFrom0, distanceFrom1, distanceFrom2, distanceFrom3, minDistance,
                ellipseCount, firstEllipsePoint, secondEllipsePoint, distanceBetweenEllipsePoint, ellipseHorizontalWidth, ellipseVerticalHeight, angle, side, hypotenuse,
                angleLineStartDistance, ellipseHorizontalDistanceforAngleLine, ellipseVerticalDistanceForAngleLine, innerLinesCurrentStokeColor, markerLinesCurrentStokeColor,
                lineColor, textFontSize, textFontColor, angleStyle, arrayIndex, angleLineMultiplier, lineSpacingFactor, markerIncrementFactor, markerSpacingFactor, markerA, markerB,
                endXPoint, endYPoint, textEndXPoint, textEndYPoint, text, angleCounter, polarAngle,
                point, size, shape;

            //code by shashank to add layer background

            point = new this._paperScope.Point(0, 0);
            size = new this._paperScope.Size(this._canvasSize.width, this._canvasSize.height);
            shape = new this._paperScope.Shape.Rectangle(point, size);
            shape.fillColor = 'white';

            /*distanceFrom0, distanceFrom1, distanceFrom2, distanceFrom3 are distances from origin and 
            canvas four corners-(0,0),(canvasWidth,0),(canvasWidth,canvasHeight),(0,canvasHeight) respectively */
            distanceFrom0 = Math.sqrt(Math.pow((origin.x - 0), 2) + Math.pow((origin.y - 0), 2));
            distanceFrom1 = Math.sqrt(Math.pow((origin.x - canvasWidth), 2) + Math.pow((origin.y - 0), 2));
            distanceFrom2 = Math.sqrt(Math.pow((origin.x - canvasWidth), 2) + Math.pow((origin.y - canvasHeight), 2));
            distanceFrom3 = Math.sqrt(Math.pow((origin.x - 0), 2) + Math.pow((origin.y - canvasHeight), 2));

            /*enddistance will be maximum distance among distanceFrom0, distanceFrom1, distanceFrom2, distanceFrom3 */
            endDistance = (temp = ((temp = distanceFrom0 > distanceFrom1 ? distanceFrom0 : distanceFrom1) > distanceFrom2) ? temp : distanceFrom2) > distanceFrom3 ? temp : distanceFrom3;

            /*MinDistance increment factor of startDistance*/
            minDistance = verticalDistance < horizontalDistance ? verticalDistance : horizontalDistance;

            /*-----------------origin above canvas------------------------------------*/
            if (origin.y < 0) {
                /*origin outside canvas and on North-west side of canvas*/
                if (origin.x < 0) {
                    side = Math.abs(origin.y);
                    hypotenuse = Math.sqrt(Math.pow(origin.x - 0, 2) + Math.pow(origin.y - 0, 2));
                    angle = 2 * Math.PI - Math.acos(side / hypotenuse);

                    ellipseHorizontalWidth = Math.abs(origin.x);
                    ellipseVerticalHeight = Math.abs(origin.y);
                    startDistance = hypotenuse;
                }
                    /*origin outside canvas and on North-east side of canvas*/
                else if (origin.x > canvasWidth) {
                    side = Math.abs(origin.y);
                    hypotenuse = Math.sqrt(Math.pow(origin.x - canvasWidth, 2) + Math.pow(origin.y - 0, 2));
                    angle = (3 / 2) * Math.PI - Math.acos(side / hypotenuse);
                    ellipseHorizontalWidth = Math.abs(origin.x) - canvasWidth;
                    ellipseVerticalHeight = Math.abs(origin.y);
                    startDistance = hypotenuse;
                }
                    /*origin outside canvas and on North side of canvas*/
                else {
                    angle = Math.PI / 2;
                    ellipseVerticalHeight = Math.abs(origin.y);
                    ellipseHorizontalWidth = verticalDistance / horizontalDistance * ellipseVerticalHeight;
                    startDistance = Math.abs(origin.y);
                }
            }

                /*---------------------origin Below canvas-----------------------------*/
            else if (origin.y > canvasHeight) {
                /*origin outside canvas and on South-west side of canvas*/
                if (origin.x < 0) {
                    side = Math.abs(origin.x);
                    hypotenuse = Math.sqrt(Math.pow(origin.x - 0, 2) + Math.pow(origin.y - canvasHeight, 2));
                    angle = Math.acos(side / hypotenuse);
                    ellipseHorizontalWidth = Math.abs(origin.x);
                    ellipseVerticalHeight = Math.abs(origin.y) - canvasHeight;
                    startDistance = hypotenuse;
                }
                    /*origin outside canvas and on South-East side of canvas*/
                else if (origin.x > canvasWidth) {
                    side = Math.abs(origin.x) - canvasWidth;
                    hypotenuse = Math.sqrt(Math.pow(origin.x - canvasWidth, 2) + Math.pow(origin.y - canvasHeight, 2));
                    angle = Math.PI - Math.acos(side / hypotenuse);
                    ellipseHorizontalWidth = Math.abs(origin.x) - canvasWidth;
                    ellipseVerticalHeight = Math.abs(origin.y) - canvasHeight;
                    startDistance = hypotenuse;
                }
                    /*origin outside canvas and on South side of canvas*/
                else {
                    angle = Math.PI / 2;
                    ellipseVerticalHeight = Math.abs(origin.y) - canvasHeight;
                    ellipseHorizontalWidth = verticalDistance / horizontalDistance * ellipseVerticalHeight;
                    startDistance = Math.abs(origin.y) - canvasHeight;
                }
            }

                /*---------------------origin at canvas Level----------------------*/
            else {
                /*origin outside canvas and on west side of canvas*/
                if (origin.x < 0) {
                    angle = 0;
                    ellipseHorizontalWidth = Math.abs(origin.x);
                    ellipseVerticalHeight = ellipseHorizontalWidth * horizontalDistance / verticalDistance;
                    startDistance = Math.abs(origin.x);
                }
                    /*origin outside canvas and on east side of canvas*/
                else if (origin.x > canvasWidth) {
                    angle = 0;
                    ellipseHorizontalWidth = Math.abs(origin.x) - canvasWidth;
                    ellipseVerticalHeight = ellipseHorizontalWidth * horizontalDistance / verticalDistance;
                    startDistance = Math.abs(origin.x) - canvasWidth;
                }
                    /*origin within canvas*/
                else {
                    startDistance = 0;
                    ellipseCount = 0;
                    angle = 0;
                    ellipseHorizontalWidth = 0;
                    ellipseVerticalHeight = 0;
                }
            }


            /*ellipse count from origin */
            firstEllipsePoint = new this._paperScope.Point(origin.x + ellipseHorizontalWidth * Math.cos(angle), origin.y + ellipseVerticalHeight * Math.sin(angle));
            secondEllipsePoint = new this._paperScope.Point(origin.x + (ellipseHorizontalWidth + verticalDistance) * Math.cos(angle), origin.y + (ellipseVerticalHeight + horizontalDistance) * Math.sin(angle));
            distanceBetweenEllipsePoint = Math.sqrt(Math.pow(firstEllipsePoint.x - secondEllipsePoint.x, 2) + Math.pow(firstEllipsePoint.y - secondEllipsePoint.y, 2));
            ellipseCount = parseInt(startDistance / distanceBetweenEllipsePoint, 10);

            startDistance = ellipseCount * distanceBetweenEllipsePoint;
            ellipseHorizontalWidth = verticalDistance * ellipseCount;
            ellipseVerticalHeight = horizontalDistance * ellipseCount;

            angleLineStartDistance = startDistance;
            ellipseHorizontalDistanceforAngleLine = ellipseHorizontalWidth;
            ellipseVerticalDistanceForAngleLine = ellipseVerticalHeight;

            if (graphDisplay.isProjectorModeOn === true) {
                innerLinesCurrentStokeColor = new this._paperScope.Color(0.8, 0.8, 0.8);
                markerLinesCurrentStokeColor = new this._paperScope.Color(0.4, 0.4, 0.4);
            }
            else {
                innerLinesCurrentStokeColor = new this._paperScope.Color(0.9, 0.9, 0.9);
                markerLinesCurrentStokeColor = new this._paperScope.Color(0.7, 0.7, 0.7);
            }

            if (isGridLineShown === true) {
                /*Loop to draw ellipse */
                for (; startDistance <= endDistance; startDistance += minDistance, ellipseHorizontalWidth += verticalDistance, ellipseVerticalHeight += horizontalDistance) {
                    if (ellipseCount % xGridLines === 0) {
                        path = new this._paperScope.Path.Ellipse({
                            point: [origin.x - ellipseHorizontalWidth, origin.y - ellipseVerticalHeight],
                            size: [2 * ellipseHorizontalWidth, 2 * ellipseVerticalHeight],
                            strokeColor: markerLinesCurrentStokeColor
                        });
                    }
                    else {
                        path = new this._paperScope.Path.Ellipse({
                            point: [origin.x - ellipseHorizontalWidth, origin.y - ellipseVerticalHeight],
                            size: [2 * ellipseHorizontalWidth, 2 * ellipseVerticalHeight],
                            strokeColor: innerLinesCurrentStokeColor
                        });
                    }
                    ellipseCount++;
                }
            }


            /*Angle lines*/
            //axesAngles = [0, 90, 180, 270];

            if (graphDisplay._graphDisplay.isProjectorModeOn === true) {
                lineColor = new this._paperScope.Color(0.8, 0.8, 0.8);
                textFontSize = this.MARKER_FONT_SIZE.ON_GRAPH_AREA;
                textFontColor = new this._paperScope.Color(0.6, 0.6, 0.6);
            }
            else {
                lineColor = new this._paperScope.Color(0.9, 0.9, 0.9);
                textFontSize = 14;
                textFontColor = new this._paperScope.Color(0.7, 0.7, 0.7);
            }

            polarAngle = this._polarLineAngleMarker;
            if (graphDisplay._graphDisplay.isPolarAngleInRadian === true) {
                angleStyle = polarAngle.radian;
            }
            else {
                angleStyle = polarAngle.degree;
            }


            arrayIndex = 0;

            if ((origin.x < canvasWidth && origin.x > 0) && (origin.y < canvasHeight && origin.y > 0)) {
                angleLineMultiplier = 3;
                lineSpacingFactor = 3;
                markerIncrementFactor = 2;
                markerSpacingFactor = 6;

                if (origin.x <= horizontalDistance * xGridLines * 2 || canvasWidth - origin.x <= horizontalDistance * xGridLines * 2) {
                    markerA = ellipseVerticalDistanceForAngleLine + verticalDistance * xGridLines * 5 - verticalDistance;
                    markerB = ellipseHorizontalDistanceforAngleLine + horizontalDistance * xGridLines * 5 - horizontalDistance;
                }
                else {
                    markerA = ellipseVerticalDistanceForAngleLine + verticalDistance * xGridLines * 3 - verticalDistance;
                    markerB = ellipseHorizontalDistanceforAngleLine + horizontalDistance * xGridLines * 3 - horizontalDistance;
                }
            }
            else {
                angleLineMultiplier = 4;
                lineSpacingFactor = 1;
                markerIncrementFactor = 1;
                markerSpacingFactor = 3;

                markerA = ellipseVerticalDistanceForAngleLine + verticalDistance * xGridLines * 6;
                markerB = ellipseHorizontalDistanceforAngleLine + horizontalDistance * xGridLines * 6;
            }


            for (angleCounter = 0; angleCounter < 360; angleCounter += 5) {

                endXPoint = origin.x + endDistance * Math.cos(angleCounter * Math.PI / 180);
                endYPoint = origin.y + endDistance * Math.sin(angleCounter * Math.PI / 180);

                if (angleCounter % lineSpacingFactor === 0) {
                    //if (axesAngles.indexOf(angleCounter) === -1) {

                    if (isGridLineShown === true) {
                        path = new this._paperScope.Path.Line({
                            from: origin,
                            to: [endXPoint, endYPoint],
                            strokeColor: lineColor
                        });
                    }

                    //}
                    if (isLabelShown === true) {
                        if (angleCounter % markerSpacingFactor === 0) {

                            angle = angleCounter * Math.PI / 180;

                            textEndXPoint = origin.x + (markerA) * Math.cos(angle);
                            textEndYPoint = origin.y + (markerB) * Math.sin(angle);

                            text = new this._paperScope.PointText({
                                point: [textEndXPoint, textEndYPoint],
                                content: angleStyle[arrayIndex],
                                fontSize: textFontSize,
                                fillColor: textFontColor
                            });
                            arrayIndex += markerIncrementFactor;
                        }
                    }
                }
            }
        },

        /**
        *Add values of polar angles in radian and degree in respective angle array.
    
        *@private
        *@method _polarAngleLinesMarkerArrayGenerator
        *@return 
        */
        _polarAngleLinesMarkerArrayGenerator: function _polarAngleLinesMarkerArrayGenerator() {

            var degreeAngle, arrayIndex, radianMultiplier, pi, radAngle, minNumber, lcm, denominator, numerator, divisor;

            /*marker in degree*/
            degreeAngle = [0, 345, 330, 315, 300, 285, 270, 255, 240, 225, 210, 195, 180, 165, 150, 135, 120, 105, 90, 75, 60, 45, 30, 15];

            this._polarLineAngleMarker.degree = degreeAngle;

            /*Marker in radian*/
            pi = this.PI;
            radAngle = [0];
            arrayIndex = 1;

            for (radianMultiplier = 23; radianMultiplier > 0; radianMultiplier--) {
                minNumber = radianMultiplier < 12 ? radianMultiplier : 12;
                denominator = 12;
                numerator = radianMultiplier;
                lcm = 1;

                for (divisor = minNumber; divisor >= 2; divisor--) {
                    while (denominator % divisor === 0 && numerator % divisor === 0) {
                        denominator = denominator / divisor;
                        numerator = numerator / divisor;
                    }
                }
                if (numerator === 1 && denominator === 1) {
                    radAngle[arrayIndex] = pi;
                }
                else if (numerator === 1) {
                    radAngle[arrayIndex] = pi + '/' + denominator;
                }
                else if (denominator === 1) {
                    radAngle[arrayIndex] = numerator + pi;
                }
                else {
                    radAngle[arrayIndex] = numerator + pi + '/' + denominator;
                }
                arrayIndex++;
            }
            this._polarLineAngleMarker.radian = radAngle;

        },
        /**
        * draw axes line.
        * @method _drawAxisLines
        * @private
        */
        _drawAxisLines: function _drawAxisLines() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                originPoint = graphDisplay._graphOrigin.currentOrigin,
                isAxisLinesShown = graphDisplay._graphDisplay.isAxisLinesShown,
                symbols = graphDisplay._symbols,
                canvas = this._canvasSize,
                parameters = graphDisplay._graphParameters,
                symbols = graphDisplay._symbols,
                height = canvas.height,
                width = canvas.width;
            /*draw X-axis and  Y-axis*/
            if (isAxisLinesShown === true) {
                symbols.xAxis.place(new this._paperScope.Point(width / 2, originPoint.y));
                symbols.yAxis.place(new this._paperScope.Point(originPoint.x, height / 2));
            }
        },

        /**
        *Draw axis Marker Text.
        *
        *@private
        *@method _axisMarker
        *@return 
        */
        /*function draw axisLines and markerLabel*/
        _axisMarker: function _axisMarker() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                canvas = this._canvasSize,
                parameters = graphDisplay._graphParameters,
                symbols = graphDisplay._symbols,
                height = canvas.height,
                width = canvas.width,
                originPoint = graphDisplay._graphOrigin.currentOrigin,
                zoomingFactors = graphDisplay._zoomingFactor,
                xtenMultiplier = zoomingFactors.xZoomMultiplier,
                ytenMultiplier = zoomingFactors.yZoomMultiplier,
                xFactor = zoomingFactors.xTotalMultiplier,
                yFactor = zoomingFactors.yTotalMultiplier,
                xMarkerGrid = parameters.xGridLine,
                yMarkerGrid = parameters.yGridLine,
                isCartesianGraph = graphDisplay._graphDisplay.isCartesionCurrentGraphType,
                isProjectorModeOn = graphDisplay._graphDisplay.isProjectorModeOn,
                isLabelShown = graphDisplay._graphDisplay.isLabelShown,
                textColoronCanvas = this.MARKER_FONT_COLOR.ON_GRAPH_AREA,
                textColorAtEndOfCanvas = this.MARKER_FONT_COLOR.AT_END_OF_GRAPH_AREA,
                textFontColor = textColoronCanvas,
                textFontSize = isProjectorModeOn ? this.MARKER_FONT_SIZE.ON_GRAPH_AREA_PROJECTOR_MODE : this.MARKER_FONT_SIZE.ON_GRAPH_AREA,/* text FontSize, which is used in calculating text position*/
                textFontSize, lineCounter, verticalLinesDistance, totalVerticalLinesOnCanvas, horizontalLinesDistance, totalHorizontalLinesOnCanvas,
                canvasDistanceLeftOfOrigin, canvasLinesLeftOfOrigin, extraCanvasDistance, lineCountDecider, markerText, currentMarkerText, currentMarkerTextLength, textXPosition, textYPosition,
                originDistanceLeftofCanvas, linesLeftOfCanvas, xMarkerFactor, canvasDistanceaboveOfOrigin, canvasLinesAboveOfOrigin, originDistanceAboveofCanvas, linesAboveCanvas,
                number, powerValue, markerStartingValueInRadian, markerPosition, distanceBetweenOriginAndfirstPoint, adjecentVerticalLinesDistance, totalVerticalLines,
                minZoomInDistance, adjecentHorizontalLinesDistance, totalHorizontalLines, textHeight, markerStartingValue, markerForRadian,
                Horizontal_Align = this.TEXT_ALIGN.HORIZONTAL,
                Vertical_Align = this.TEXT_ALIGN.VERTICAL,
                horizontalAlign, verticalAlign, textCo, strokeWidth,
                textStyle = {}, xIncrementFactor, yIncrementFactor,
                isXMarkerRadian = graphDisplay._graphDisplay.isXmarkerInRadians,
                isYMarkerRadian = graphDisplay._graphDisplay.isYmarkerInRadians,
                xAxiLabelPadding=8,
                yAxisLabelPadding=8,
                canvasPaddingLeft=5,
                canvasPaddingTop=5,
                fontFamily='arial';


            /*Draw Line Marker Text */
            if (isLabelShown === false) {
                return;
            }
            /*X-axis Marker*/
            if (isXMarkerRadian === false || isCartesianGraph === false) {
                /*x-axis Marker is in degree or graph type is polar*/

                verticalLinesDistance = parameters.currentDistanceBetweenTwoVerticalLines;
                totalVerticalLinesOnCanvas = parameters.totalVerticalLines;

                /*condition to decide rank of first line,draw on canvas, from origin*/
                if (originPoint.x >= 0) {
                    canvasDistanceLeftOfOrigin = originPoint.x;
                    canvasLinesLeftOfOrigin = parseInt(canvasDistanceLeftOfOrigin / verticalLinesDistance, 10);
                    extraCanvasDistance = canvasDistanceLeftOfOrigin - canvasLinesLeftOfOrigin * verticalLinesDistance;
                    lineCountDecider = xMarkerGrid - (canvasLinesLeftOfOrigin % xMarkerGrid);
                    markerText = parseInt(canvasLinesLeftOfOrigin / xMarkerGrid, 10);
                }
                else {
                    originDistanceLeftofCanvas = Math.abs(originPoint.x);
                    linesLeftOfCanvas = parseInt(originDistanceLeftofCanvas / verticalLinesDistance, 10);
                    extraCanvasDistance = verticalLinesDistance - (originDistanceLeftofCanvas - linesLeftOfCanvas * verticalLinesDistance);
                    lineCountDecider = linesLeftOfCanvas;
                    markerText = parseInt(linesLeftOfCanvas / xMarkerGrid, 10);

                    if (extraCanvasDistance !== 0) {
                        lineCountDecider++;
                        markerText++;
                    }
                }

                /*create Marker Text and its Position*/
                xMarkerFactor = xFactor;

                if (originPoint.x >= 0 && graphDisplay._graphDisplay.isCartesionCurrentGraphType === true) {
                    xMarkerFactor = -(xFactor);
                }

                xIncrementFactor = 1;
            }
            else {
                /*x-axis Marker lines in radian and graph type is cartesian*/

                //minZoomInDistance = parameters.distanceBetweenTwoVerticalLines * xMarkerGrid / (xMarkerGrid / (xMarkerGrid - 2));

                minZoomInDistance = this._zoomLevelLimits().xMinDistance;

                markerForRadian = this._getRadianMarkers(minZoomInDistance, true);
                markerStartingValueInRadian = markerForRadian.marker;

                markerStartingValue = markerStartingValueInRadian / Math.PI;

                xMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                markerPosition = this._getCanvasPointCoordinates([markerStartingValueInRadian, 0]);
                distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.x - markerPosition[0]);
                adjecentVerticalLinesDistance = distanceBetweenOriginAndfirstPoint / xMarkerGrid;
                totalVerticalLines = width / adjecentVerticalLinesDistance;

                if (adjecentVerticalLinesDistance < minZoomInDistance) {
                    markerStartingValueInRadian = markerForRadian.maxMarker;
                    markerStartingValue = markerStartingValueInRadian / Math.PI;

                    xMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                    markerPosition = this._getCanvasPointCoordinates([markerStartingValueInRadian, 0]);
                    distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.x - markerPosition[0]);
                    adjecentVerticalLinesDistance = distanceBetweenOriginAndfirstPoint / xMarkerGrid;
                    totalVerticalLines = width / adjecentVerticalLinesDistance;
                }
                verticalLinesDistance = adjecentVerticalLinesDistance;
                totalVerticalLinesOnCanvas = totalVerticalLines;

                if (originPoint.x >= 0) {
                    canvasDistanceLeftOfOrigin = originPoint.x;
                    canvasLinesLeftOfOrigin = parseInt(canvasDistanceLeftOfOrigin / verticalLinesDistance, 10);
                    extraCanvasDistance = canvasDistanceLeftOfOrigin - canvasLinesLeftOfOrigin * verticalLinesDistance;
                    lineCounter = 0;
                    lineCountDecider = xMarkerGrid - (canvasLinesLeftOfOrigin % xMarkerGrid);
                    markerText = (markerStartingValueInRadian / Math.PI) * parseInt(canvasLinesLeftOfOrigin / xMarkerGrid, 10);

                }
                else {
                    originDistanceLeftofCanvas = Math.abs(originPoint.x);
                    linesLeftOfCanvas = parseInt(originDistanceLeftofCanvas / verticalLinesDistance, 10);
                    extraCanvasDistance = verticalLinesDistance - (originDistanceLeftofCanvas - linesLeftOfCanvas * verticalLinesDistance);
                    lineCounter = 0;
                    lineCountDecider = linesLeftOfCanvas;
                    markerText = (markerStartingValueInRadian / Math.PI) * parseInt(linesLeftOfCanvas / xMarkerGrid, 10);

                    if (extraCanvasDistance !== 0) {
                        lineCountDecider++;
                        markerText += markerStartingValueInRadian / Math.PI;
                    }
                }

                /*create Marker Text and its Position*/
                xMarkerFactor = 1;

                if (originPoint.x >= 0 && graphDisplay._graphDisplay.isCartesionCurrentGraphType === true) {
                    xMarkerFactor = -1;
                }

                xIncrementFactor = markerStartingValueInRadian / Math.PI;
            }



            //x-axis  Marker
            for (lineCounter = 0; lineCounter <= totalVerticalLinesOnCanvas; lineCounter++) {
                horizontalAlign = Horizontal_Align.CENTER;
                verticalAlign = Vertical_Align.BOTTOM;

                if (lineCountDecider % xMarkerGrid === 0) {

                    textXPosition = extraCanvasDistance + lineCounter * verticalLinesDistance;
                    textYPosition = originPoint.y

                    if (isXMarkerRadian === false || isCartesianGraph === false) {
                        currentMarkerText = this._getPowerOfNumber(markerText * xMarkerFactor, xtenMultiplier, xMarkerFactor);
                    }
                    else {
                        currentMarkerText = this._getProperFormedRadianMarkerText(markerText * xMarkerFactor, xtenMultiplier, xMarkerFactor);
                    }

                    //number = parseFloat(currentMarkerText[0].toFixed(3));
                    number = currentMarkerText[0];
                    powerValue = currentMarkerText[1];

                    if (powerValue === 0) {
                    //padding between x-axis and y-label 
                        textYPosition += xAxiLabelPadding;
                    }

                    /*if polar graph, then negative value marker-text is converted to corresponding positive value  */
                    if (isCartesianGraph === false && number < 0) {
                        number = -(number);
                    }

                    /*marker Position Shifting factor if its crossing canvas size*/
                    textCo = this._displayToPower10(number, powerValue, new this._paperScope.Point(textXPosition, textYPosition), { fontSize: textFontSize, fontColor: textFontColor, justification: horizontalAlign, verticalAlign: verticalAlign }, false);
                    if (markerText !== 0) {
                        if (textCo.base.x <= 0) {
                            textXPosition = canvasPaddingTop;
                            horizontalAlign = Horizontal_Align.left;
                        }
                        else if (textCo.base.x + textCo.base.width + textCo.power.width >= width && textCo.base.x + textCo.base.width / 2 <= width) {
                            textXPosition = width-canvasPaddingTop;
                            horizontalAlign = Horizontal_Align.RIGHT;
                        }
                        else if (textCo.base.x + textCo.base.width + textCo.power.width >= width && textCo.base.x + textCo.base.width / 2 > width) {
                            horizontalAlign = Horizontal_Align.LEFT;
                        }
                    }
                    else {
                        textXPosition -= 8;
                        horizontalAlign = Horizontal_Align.RIGHT;
                    }

                    /*if graph is cartesion then axis are present at canvas ends if origin is not on canvas*/
                    if (isCartesianGraph === true) {
                        if (textCo.base.y < 0 || textCo.power.y < 0) {
                            textYPosition = 0 + canvasPaddingTop;
                            textFontColor = textColorAtEndOfCanvas;
                            verticalAlign = Vertical_Align.BOTTOM;
                        }
                        else if (textCo.base.y + textCo.base.height > height) {
                            textYPosition = height-canvasPaddingTop;
                            textFontColor = textColorAtEndOfCanvas;
                            verticalAlign = Vertical_Align.TOP;
                        }
                    }

                    /*create PointText at corresponding Point*/
                    if (((originPoint.y > 0 && originPoint.y < height) && number === 0) || markerText !== 0) {
                        textStyle = {
                            fontSize: textFontSize,
                            fontColor: textFontColor,
                            justification: horizontalAlign,
                            verticalAlign: verticalAlign,
                            fontFamily:fontFamily
                        };
                        if (isProjectorModeOn) {
                            textStyle.strokeWidth = 0.3;
                            textStyle.strokeColor = textFontColor;
                        }
                        this._displayToPower10(number, powerValue, new this._paperScope.Point(textXPosition, textYPosition), textStyle);
                    }
                    /*if origin is left of canvas then all markertext are positive.*/
                    if (originPoint.x < 0) {
                        markerText += xIncrementFactor;
                    }
                    else {
                        markerText -= xIncrementFactor;
                    }
                }
                lineCountDecider++;
            }


            /*Y-axis Marker*/
            if (isYMarkerRadian === false || isCartesianGraph === false) {
                /*y-axis Marker is in degree or graph type is polar*/

                horizontalLinesDistance = parameters.currentDistanceBetweenTwoHorizontalLines;
                totalHorizontalLinesOnCanvas = parameters.totalHorizontalLines;

                /*condition to decide first canvas horizontal line, Marker Text*/
                if (originPoint.y >= 0) {
                    canvasDistanceaboveOfOrigin = originPoint.y;
                    canvasLinesAboveOfOrigin = parseInt(canvasDistanceaboveOfOrigin / horizontalLinesDistance, 10);
                    extraCanvasDistance = canvasDistanceaboveOfOrigin - canvasLinesAboveOfOrigin * horizontalLinesDistance;
                    lineCountDecider = yMarkerGrid - (canvasLinesAboveOfOrigin % yMarkerGrid);
                    markerText = parseInt(canvasLinesAboveOfOrigin / yMarkerGrid, 10);
                }
                else {
                    originDistanceAboveofCanvas = Math.abs(originPoint.y);
                    linesAboveCanvas = parseInt(originDistanceAboveofCanvas / horizontalLinesDistance, 10);
                    extraCanvasDistance = horizontalLinesDistance - (originDistanceAboveofCanvas - linesAboveCanvas * horizontalLinesDistance);
                    lineCountDecider = linesAboveCanvas;
                    markerText = parseInt(linesAboveCanvas / yMarkerGrid, 10);

                    if (extraCanvasDistance !== 0) {
                        lineCountDecider++;
                        markerText++;
                    }
                }

                /*if origin is above canvas all Y-marker values are negative*/
                if (originPoint.y < 0 && graphDisplay._graphDisplay.isCartesionCurrentGraphType === true) {
                    yFactor = -(yFactor);
                }
                yIncrementFactor = 1;
            }
            else {
                /* y-axis marker is in radian and graph type is cartesian*/

                //y-axis Marker lines in degree
                //minZoomInDistance = parameters.distanceBetweenTwoHorizontalLines * yMarkerGrid / (yMarkerGrid / (yMarkerGrid - 2));
                minZoomInDistance = this._zoomLevelLimits().yMinDistance;
                markerForRadian = this._getRadianMarkers(minZoomInDistance, false);
                markerStartingValueInRadian = markerForRadian.marker;

                markerStartingValue = markerStartingValueInRadian / Math.PI;
                yMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                markerPosition = this._getCanvasPointCoordinates([0, markerStartingValueInRadian]);
                distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.y - markerPosition[1]);
                adjecentHorizontalLinesDistance = distanceBetweenOriginAndfirstPoint / yMarkerGrid;
                totalHorizontalLines = height / adjecentHorizontalLinesDistance;

                if (adjecentHorizontalLinesDistance < minZoomInDistance) {
                    markerStartingValueInRadian = markerForRadian.maxMarker;
                    markerStartingValue = markerStartingValueInRadian / Math.PI;

                    yMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                    markerPosition = this._getCanvasPointCoordinates([0, markerStartingValueInRadian]);
                    distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.y - markerPosition[1]);
                    adjecentHorizontalLinesDistance = distanceBetweenOriginAndfirstPoint / yMarkerGrid;
                    totalHorizontalLines = height / adjecentHorizontalLinesDistance;
                }

                //                ////======vertical Lines  parametercalculator========/////
                horizontalLinesDistance = adjecentHorizontalLinesDistance;
                totalHorizontalLinesOnCanvas = totalHorizontalLines;

                if (originPoint.y >= 0) {
                    canvasDistanceaboveOfOrigin = originPoint.y;
                    canvasLinesAboveOfOrigin = parseInt(canvasDistanceaboveOfOrigin / horizontalLinesDistance, 10);
                    extraCanvasDistance = canvasDistanceaboveOfOrigin - canvasLinesAboveOfOrigin * horizontalLinesDistance;
                    lineCountDecider = yMarkerGrid - (canvasLinesAboveOfOrigin % yMarkerGrid);
                    markerText = (markerStartingValueInRadian / Math.PI) * parseInt(canvasLinesAboveOfOrigin / yMarkerGrid, 10);

                }
                else {
                    originDistanceAboveofCanvas = Math.abs(originPoint.y);
                    linesAboveCanvas = parseInt(originDistanceAboveofCanvas / horizontalLinesDistance, 10);
                    extraCanvasDistance = horizontalLinesDistance - (originDistanceAboveofCanvas - linesAboveCanvas * horizontalLinesDistance);
                    lineCountDecider = linesAboveCanvas;
                    markerText = (markerStartingValueInRadian / Math.PI) * parseInt(linesAboveCanvas / yMarkerGrid, 10);

                    if (extraCanvasDistance !== 0) {
                        lineCountDecider++;
                        markerText += markerStartingValueInRadian / Math.PI;
                    }
                }

                yFactor = 1;
                /*if origin is above canvas all Y-marker values are negative*/
                if (originPoint.y < 0 && graphDisplay._graphDisplay.isCartesionCurrentGraphType === true) {
                    yFactor = -1;
                }
                yIncrementFactor = markerStartingValueInRadian / Math.PI
            }

            textFontColor = textColoronCanvas;
            /*Calculate MarkerText and its Position of different marker on Y-axis*/

            for (lineCounter = 0; lineCounter <= totalHorizontalLinesOnCanvas; lineCounter++) {

                if (lineCountDecider % yMarkerGrid === 0) {
                    verticalAlign = Vertical_Align.MIDDLE;
                    horizontalAlign = Horizontal_Align.RIGHT;

                    /*Current Marker Text*/
                    if (isYMarkerRadian === false || isCartesianGraph === false) {
                        currentMarkerText = this._getPowerOfNumber(markerText * yFactor, ytenMultiplier, yFactor);
                    }
                    else {
                        currentMarkerText = this._getProperFormedRadianMarkerText(markerText * yFactor, ytenMultiplier, yFactor);
                    }

                    number = currentMarkerText[0];
                    //number = parseFloat(currentMarkerText[0].toFixed(4));
                    powerValue = currentMarkerText[1];

                    /*marker Y-Position*/
                    textYPosition = extraCanvasDistance + lineCounter * horizontalLinesDistance;
                    textXPosition = originPoint.x - yAxisLabelPadding;

                    /*canvert negative marker value to positive if graph type is Polar*/
                    if (isCartesianGraph === false && number < 0) {
                        number = -(number);
                    }

                    /*marker Position Shifting factor if its crossing canvas size*/
                    textCo = this._displayToPower10(number, powerValue, new this._paperScope.Point(textXPosition, textYPosition), { fontSize: textFontSize, fontColor: textFontColor, justification: horizontalAlign, verticalAlign: verticalAlign }, false);
                    if (textCo.base.y + textCo.base.height / 4 <= 0 || textCo.power.y <= 0) {
                        textYPosition = 2;
                        verticalAlign = Vertical_Align.BOTTOM;
                    }
                    else if (textCo.base.y + textCo.base.height > height) {
                        textYPosition = height;
                        verticalAlign = Vertical_Align.TOP;
                    }

                    /*X-position of markerText*/

                    /*if graph is cartesion then axis are present at canvas ends if origin is not on canvas*/
                    if (isCartesianGraph === true) {
                        if (textCo.base.x < 0) {
                            textXPosition = canvasPaddingLeft;
                            horizontalAlign = Horizontal_Align.LEFT;
                            textFontColor = textColorAtEndOfCanvas;
                        }
                        else if (originPoint.x > width) {
                            textXPosition = width-canvasPaddingLeft;
                            horizontalAlign = Horizontal_Align.RIGHT;
                            textFontColor = textColorAtEndOfCanvas;
                        }
                    }

                    if (number !== 0) {
                        textStyle = {
                            fontSize: textFontSize,
                            fontColor: textFontColor,
                            justification: horizontalAlign,
                            verticalAlign: verticalAlign,
                            fontFamily:fontFamily
                        };
                        if (isProjectorModeOn) {
                            textStyle.strokeWidth = 0.3;
                            textStyle.strokeColor = textFontColor;
                        }
                        this._displayToPower10(number, powerValue, new this._paperScope.Point(textXPosition, textYPosition), textStyle);
                    }
                    if (originPoint.y < 0) {
                        markerText += yIncrementFactor;
                    }
                    else {
                        markerText -= yIncrementFactor;
                    }
                }
                lineCountDecider++;
            }

        },

        /**
        * return marker text of given number in radian.
        * @method _getProperFormedRadianMarkerText
        * @param number {Number} number to be convarted in radian text
        * @param tenMultiplier {number} till this limit number is return in (numerator * π/denominator) format, after this limits number decimal value
        * @private
        */
        _getProperFormedRadianMarkerText: function _getProperFormedRadianMarkerText(number, tenMultiplier, factor) {
            var pi = Math.PI, piSymbol = this.PI, numberArray;
            if (tenMultiplier > 10000) {
                number = number * pi;
                numberArray = this._getPowerOfNumber(number, tenMultiplier, factor);
                //numberArray[0] = parseFloat(numberArray[0].toFixed(4));
                return numberArray;
            }
            else if (Math.abs(number) * pi < pi / 25) {
                number = number * pi;
                numberArray = this._getPowerOfNumber(number, tenMultiplier, factor);
                //numberArray[0] = parseFloat(numberArray[0].toFixed(4));
                return numberArray;
            }
            else {
                //               
                //                var temp = number * 100000000000000000;
                //                number = temp / 100000000000000000;
                //                number = parseFloat(number.toFixed(15));
                numberArray = this._convertToFractional(number);

                if (Math.abs(numberArray[0]) === 1 && numberArray[1] === 1) {
                    // if numerator and denominator both are 1 then number is 'π'
                    if (numberArray[0] === 1) {
                        number = piSymbol;
                    }
                    else {
                        number = '-' + piSymbol;
                    }

                }
                else if (Math.abs(numberArray[0]) === 1) {
                    //numerator is 1 then number is 'π/denominator'
                    if (numberArray[0] === 1) {
                        number = piSymbol + '/' + numberArray[1];
                    }
                    else {
                        number = '-' + piSymbol + '/' + numberArray[1];
                    }

                }
                else if (numberArray[1] === 1) {
                    //denominator is 1 then number is in form 'numerator π'
                    number = numberArray[0] + piSymbol;
                }
                else {
                    //numerator and denominator both are other than 1.
                    number = numberArray[0] + piSymbol + '/' + numberArray[1];
                }
                return [number, 0];
            }


        },

        /* Convert to fractional form
        * @method _convertToFractional
        * @param number {Number} to be converted in fraction form
        * @return {Array} zeroth element is numerator, first element is denominator
        */
        _convertToFractional: function _convertToFractional(number) {

            var decimal,
                EPSILON, n, d, fraction;

            //if (MathUtilities.Components.FractDec) {
            //    fraction = MathUtilities.Components.FractDec.Models.FD.toFraction(Math.abs(number));
            //    return [parseInt(fraction.numerator),parseInt(fraction.denominator)];
            //}


            //check if number is decimal or integer
            number = parseFloat(number.toFixed(2));
            if (number.toString().indexOf('.') === -1) {
                //number is integer
                return [number, 1];
            }
            else {
                // number is decimal
                decimal = number;

            }

            //=====
            EPSILON = 0.01;

            n = 1;  // numerator
            d = 1;  // denominator
            fraction = n / d;

            while (Math.abs(fraction - decimal) > EPSILON) {
                if (fraction < decimal) {
                    n++;
                }
                else {
                    d++;
                    n = parseInt(Math.round(decimal * d), 10);
                }

                fraction = n / d;
            }
            return [n, d];
        },


        /**
        *Return number and its power value. 
        *It returns an array,which contain base number and power value,
        *it will give non-zero power value if tenMultiplier is less than 10^-4 or tenMultiplier is greater than 10^4.
        *
        *@private
        *@method _getPowerOfNumber
        *@param {Number} number an number whose power value to be calculated.
        *@param {Number} tenMultiplier an multiplier factor used to decide when power value to be non-zero
        *@array 
        */
        _getPowerOfNumber: function _getPowerOfNumber(number, tenMultiplier, increseFactor) {
            number = parseFloat(number);
            var absNumber, powerValue = 0, baseNumber,
                arr, precision = 1,
                increseFactor = Math.abs(increseFactor);

            while (increseFactor < 1) {
                precision++;
                increseFactor = increseFactor * 10;
            }

            if (number < 0) {
                absNumber = Math.abs(number);
                if (tenMultiplier < 0.0001) {
                    while (absNumber < 1) {
                        absNumber = absNumber * 10;
                        powerValue -= 1;
                    }
                }
                else if (tenMultiplier > 10000) {
                    while (absNumber / 10 >= 1) {
                        absNumber = absNumber / 10;
                        powerValue += 1;
                    }
                }

                //                absNumber = parseFloat(absNumber.toFixed(4));
                number = -absNumber;
            }
            else {
                if (tenMultiplier < 0.0001 && number !== 0) {
                    while (number < 1) {
                        number = number * 10;
                        powerValue -= 1;
                    }
                }
                else if (tenMultiplier > 10000) {
                    while (number / 10 >= 1) {
                        number = number / 10;
                        powerValue += 1;
                    }
                }
                //                number = parseFloat(number.toFixed(4));
            }
            baseNumber = number;

            if (precision > 4) {
                baseNumber = parseFloat(number.toFixed(precision));
            }
            else {
                baseNumber = parseFloat(number.toFixed(4));
            }

            arr = [];
            arr.push(baseNumber);
            arr.push(powerValue);
            return arr;
        },

        //@method _displayToPower10 
        //@param  number {Number} The base value that is to be displayd
        //@param powerValue {Number} The power of 10 that is to be displayed 
       _displayToPower10: function _displayToPower10(base, power, point, style, toBedraw) {
            var tempBase,
                tempPower,
                baseText,
                powerText,
                strokeColor = style.strokeColor,
                fontSize = style.fontSize,
                justification = style.justification,
                verticalAlign = style.verticalAlign,
                fillColor = style.fontColor,
                strokeWidth = style.strokeWidth,
                base, baseHeight, baseWidth, powerHeight, powerWidth,
                Horizontal_align = this.TEXT_ALIGN.HORIZONTAL,
                fontFamily=style.fontFamily,
                Vertical_align = this.TEXT_ALIGN.VERTICAL, baseCo, powerCo;

            tempBase = new this._paperScope.PointText({
                point: point,
                justification: 'left',
                fontSize: fontSize,
                fillColor: fillColor,
                strokeColor: strokeColor,
                strokeWidth: strokeWidth,
                content: base,
                fontFamily:fontFamily
            });

            tempPower = new this._paperScope.PointText({
                point: [point.x + tempBase.bounds.width, point.y],
                justification: 'left',
                fontSize: fontSize * 3 / 4,
                fillColor: fillColor,
                strokeColor: strokeColor,
                strokeWidth: strokeWidth,
                fontFamily:fontFamily
            });

            if (power !== 0) {
                tempBase.content = tempBase.content + this._X10_STRING;
                tempPower.content = power;
                tempPower.bounds.x = tempBase.bounds.x + tempBase.bounds.width;
                tempPower.bounds.y = tempBase.bounds.y - tempPower.bounds.height / 4;
                //tempPower.position = new this._paperScope.Point([point.x + tempBase.bounds.width, point.y - tempBase.bounds.height ]);
            }

            baseHeight = tempBase.bounds.height;
            baseWidth = tempBase.bounds.width;
            powerHeight = tempPower.bounds.height;
            powerWidth = tempPower.bounds.width;

            if (verticalAlign === Vertical_align.MIDDLE) {
                tempBase.bounds.y += baseHeight / 4;
                tempPower.bounds.y += baseHeight / 4;
            }
            else if (verticalAlign === Vertical_align.BOTTOM) {
                tempBase.bounds.y += baseHeight / 2 + powerHeight / 2;
                tempPower.bounds.y += baseHeight / 2 + powerHeight / 2;

            }

            if (justification === Horizontal_align.RIGHT) {
                tempBase.bounds.x -= powerWidth + baseWidth;
                tempPower.bounds.x -= powerWidth + baseWidth;
            }
            else if (justification === Horizontal_align.CENTER) {
                tempBase.bounds.x -= powerWidth / 2 + baseWidth / 2;
                tempPower.bounds.x -= powerWidth / 2 + baseWidth / 2;
            }

            baseCo = {
                x: tempBase.bounds.x,
                y: tempBase.bounds.y,
                width: tempBase.bounds.width,
                height: tempBase.bounds.height
            };
            powerCo = {
                x: tempPower.bounds.x,
                y: tempPower.bounds.y,
                width: tempPower.bounds.width,
                height: tempPower.bounds.height
            };

            if (toBedraw === false) {
                tempBase.remove();
                tempPower.remove();
            }
            return {
                base: baseCo,
                power: powerCo
            }
        },

        /*
        * return array of canvas point co-ordinate 
        * @method _getCanvasPointCoordinates
        * @param pointCoordinates {Array} point co-ordinate in term of graph co-ordinate, 0th element x and 1st element y
        * @return {Array} co-ordiante in terms of canavs co-ordinate, 0th element x and 1st element y
        * @private
        */
        _getCanvasPointCoordinates: function _getCanvasPointCoordinates(pointCoordinates) {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                currentOrigin = graphDisplay._graphOrigin.currentOrigin,
                verticalLinesDistance = graphDisplay._graphParameters.currentDistanceBetweenTwoVerticalLines,
                horizontalLineDistance = graphDisplay._graphParameters.currentDistanceBetweenTwoHorizontalLines,
                xMarkerGridLines = graphDisplay._graphParameters.xGridLine,
                yMarkerGridLines = graphDisplay._graphParameters.yGridLine,
                zoomingFactors = graphDisplay._zoomingFactor,
                xMultiplier = zoomingFactors.xTotalMultiplier,
                yMultiplier = zoomingFactors.yTotalMultiplier,
                graphCoordinates = [], canvasX, canvasY;

            canvasX = currentOrigin.x + pointCoordinates[0] * xMarkerGridLines * verticalLinesDistance / xMultiplier;
            graphCoordinates.push(canvasX);

            canvasY = currentOrigin.y - pointCoordinates[1] * yMarkerGridLines * horizontalLineDistance / yMultiplier;
            graphCoordinates.push(canvasY);

            return graphCoordinates;
        },

        /*
        * return array of graph point co-ordinate 
        * @method _getGraphPointCoordinates
        * @param canvasPointCoordinates {Array} point co-ordinate in term of canvas co-ordinate, 0th element x and 1st element y
        * @return {Array} co-ordiante in terms of graph co-ordinate, 0th element x and 1st element y
        * @private
        */
        _getGraphPointCoordinates: function _getGraphPointCoordinates(canvasPointCoordinates) {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                currentOrigin = graphDisplay._graphOrigin.currentOrigin,
                verticalLinesDistance = graphDisplay._graphParameters.currentDistanceBetweenTwoVerticalLines,
                horizontalLineDistance = graphDisplay._graphParameters.currentDistanceBetweenTwoHorizontalLines,
                xMarkerGridLines = graphDisplay._graphParameters.xGridLine,
                yMarkerGridLines = graphDisplay._graphParameters.yGridLine,
                zoomingFactors = graphDisplay._zoomingFactor,
                xMultiplier = zoomingFactors.xTotalMultiplier,
                yMultiplier = zoomingFactors.yTotalMultiplier,
                canvasCoordinates = [],
                graphX, graphY;

            graphX = -((currentOrigin.x - canvasPointCoordinates[0]) / verticalLinesDistance / xMarkerGridLines) * xMultiplier;
            graphY = ((currentOrigin.y - canvasPointCoordinates[1]) / horizontalLineDistance / yMarkerGridLines) * yMultiplier;
            canvasCoordinates.push(graphX);
            canvasCoordinates.push(graphY);

            return canvasCoordinates;
        },

        /**
        * calculate min-max angle between origin and canvas ends.
        * @method _deltaAngle
        * @private
        */
        _deltaAngle: function _deltaAngle() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                modelBounds = modelObject.get('markerBounds'),
                origin = graphDisplay._graphOrigin.currentOrigin,
                canvasHeight = this._canvasSize.height,
                canvasWidth = this._canvasSize.width,
                minAnglePoint, maxAnglePoint, minDeltaAngle, maxDeltaAngle;

            if (origin.y < 0) {
                if (origin.x < 0) {
                    minAnglePoint = new this._paperScope.Point(0, canvasHeight);
                    minDeltaAngle = this._angleBetweenTwoPoints(origin, minAnglePoint);
                    maxAnglePoint = new this._paperScope.Point(canvasWidth, 0);
                    maxDeltaAngle = this._angleBetweenTwoPoints(origin, maxAnglePoint);
                }
                else if (origin.x > canvasWidth) {
                    minAnglePoint = new this._paperScope.Point(0, 0);
                    minDeltaAngle = this._angleBetweenTwoPoints(origin, minAnglePoint);
                    maxAnglePoint = new this._paperScope.Point(canvasWidth, canvasHeight);
                    maxDeltaAngle = this._angleBetweenTwoPoints(origin, maxAnglePoint);
                }
                else {
                    minAnglePoint = new this._paperScope.Point(0, 0);
                    minDeltaAngle = this._angleBetweenTwoPoints(origin, minAnglePoint);
                    maxAnglePoint = new this._paperScope.Point(canvasWidth, 0);
                    maxDeltaAngle = this._angleBetweenTwoPoints(origin, maxAnglePoint);
                }
            }
            else if (origin.y > canvasHeight) {
                if (origin.x < 0) {
                    minAnglePoint = new this._paperScope.Point(canvasWidth, canvasHeight);
                    minDeltaAngle = this._angleBetweenTwoPoints(origin, minAnglePoint);
                    maxAnglePoint = new this._paperScope.Point(0, 0);
                    maxDeltaAngle = this._angleBetweenTwoPoints(origin, maxAnglePoint);
                }
                else if (origin.x > canvasWidth) {
                    minAnglePoint = new this._paperScope.Point(canvasWidth, 0);
                    minDeltaAngle = this._angleBetweenTwoPoints(origin, minAnglePoint);
                    maxAnglePoint = new this._paperScope.Point(0, canvasHeight);
                    maxDeltaAngle = this._angleBetweenTwoPoints(origin, maxAnglePoint);
                }
                else {
                    minAnglePoint = new this._paperScope.Point(canvasWidth, canvasHeight);
                    minDeltaAngle = this._angleBetweenTwoPoints(origin, minAnglePoint);
                    maxAnglePoint = new this._paperScope.Point(0, canvasHeight);
                    maxDeltaAngle = this._angleBetweenTwoPoints(origin, maxAnglePoint);
                }
            }
            else {
                if (origin.x < 0) {
                    minAnglePoint = new this._paperScope.Point(canvasWidth, 0);
                    minDeltaAngle = this._angleBetweenTwoPoints(origin, minAnglePoint);
                    maxAnglePoint = new this._paperScope.Point(canvasWidth, canvasHeight);
                    maxDeltaAngle = this._angleBetweenTwoPoints(origin, maxAnglePoint);
                }
                else if (origin.x > canvasWidth) {
                    minAnglePoint = new this._paperScope.Point(canvasWidth, 0);
                    minDeltaAngle = this._angleBetweenTwoPoints(origin, minAnglePoint);
                    maxAnglePoint = new this._paperScope.Point(canvasWidth, canvasHeight);
                    maxDeltaAngle = this._angleBetweenTwoPoints(origin, maxAnglePoint);
                }
                else {
                    minAnglePoint = new this._paperScope.Point(canvasWidth, 0);
                    minDeltaAngle = this._angleBetweenTwoPoints(origin, minAnglePoint);
                    maxAnglePoint = new this._paperScope.Point(canvasWidth, canvasHeight);
                    maxDeltaAngle = this._angleBetweenTwoPoints(origin, maxAnglePoint);
                }
            }
            this.markerBounds.max['\\theta'] = modelBounds.max['\\theta'] = maxDeltaAngle;
            this.markerBounds.min['\\theta'] = modelBounds.min['\\theta'] = minDeltaAngle;
        },

        repositionImage: function repositionImage(equationData) {

            //var newCanvasCoords = this._getCanvasPointCoordinates(equationData.position);

            var newCanvasCoords = this._getCanvasPointCoordinates(equationData.getPoints());///???
            //debugger

            equationData.getRaster().position = { x: newCanvasCoords[0], y: newCanvasCoords[1] };
            //equationData.points = newCanvasCoords;
            this._paperScope.view.draw();
        },
        /**
        * redraw shape layer drawing.
        * @method _shapeRedraw
        * @private
        */
        _shapeRedraw: function _shapeRedraw() {
            this._projectLayers.shapeLayer.activate();

            if (this._paperScope.project.activeLayer.children !== null) {
                this._paperScope.project.activeLayer.removeChildren();
            }

            this.trigger('graph:zoom-pan');
            //            paper.view.draw();
            //            var othis = this;
            //            clearTimeout($.data(this, 'timer'));
            //            $.data(this, 'timer', setTimeout(function () {
            //                othis.trigger('graph:zoom-pan');
            //                paper.view.draw();
            //            }, 250));
            this._projectLayers.gridLayer.activate();
        },
        _delta: null,
        _previousMaxValue: null,

        /**
        * zoom shape layer elements.
        * @method _shapeZoom
        * @private 
        */
        _shapeZoom: function _shapeZoom() {
            this.activateScope();

            this._projectLayers.shapeLayer.activate();

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                currentOrigin = graphDisplay._graphOrigin.currentOrigin,
                canvasHeight = this._canvasSize.height,
                canvasWidth = this._canvasSize.width,
                currentMaxValue = this._getGraphPointCoordinates([canvasWidth, canvasHeight / 2])[0],
                scaleFactor = this._previousMaxValue / currentMaxValue,
                currentMaxValue, counter, children, length;

            children = this._paperScope.project.activeLayer.children;
            length = children.length;

            for (counter = 0; counter < length; counter++) {
                children[counter].bounds.x -= this._delta.x;
                children[counter].bounds.y -= this._delta.y;
                //                children[counter].position = currentOrigin;
                children[counter].scale(scaleFactor, currentOrigin);
                //                children[counter].opacity = 0.3;
            }

            this._previousMaxValue = currentMaxValue;
            //TODO check if its working::
            this.refreshView();
            // paper.view.draw();
        },

        _layerDrag: function (layer, delta) {
            //            MathUtilities.Components.EquationEngine.Models.Profile.getStartTime('shapeDrag');
            layer.activate();

            var children = this._paperScope.project.activeLayer.children,
            //counter,
                length = children.length;
            if (length !== 0) {
                layer.bounds.x += delta.x;
                layer.bounds.y += delta.y;
            }

        },
        /**
        * draw points for given equation data
        * @method drawPoint
        * @param {object} equation dta object
        */
        drawPoint: function drawPoint(equationData) {
            //paper = this._paperScope;
            this._projectLayers.pointLayer.activate();

            var modelObject = this._gridGraphModelObject,
                group, color, thickness, opacity, dashArray, isVisible;


            color = equationData.getColor();

            thickness = equationData.getThickness() * 3;

            opacity = equationData.getOpacity();

            dashArray = equationData.getDashArray();

            isVisible = equationData.getPointVisibility();

            group = new this._paperScope.Group();

            if (modelObject.get('_points').indexOf(equationData) === -1) {
                modelObject.get('_points').push(equationData);
            }

            this._drawPoints(equationData);
            this.refreshView();
            this._projectLayers.gridLayer.activate();

        },

        /**
        * Resets the zoom level of graph such that all points are visible. 
        * If param pointsToFit is passed, checks for visibility of only those points
        * @method resetGraph
        * @param{Array} pointsToFit Array of points what should be visible
        * @public
        */
        resetGraph: function resetGraph(pointsToFit) {
            var modelObject;
            modelObject = this._gridGraphModelObject;
            /**
            * Sets the axis limits of the graph
            * @method _adjustGraphScale
            * @param{Number} The lower y-limit of the graph
            * @param{Number} The upper y-limit of the graph
            * @param{Number} The lower x-limit of the graph
            * @param{Number} The upper x-limit of the graph
            * @private
            */
            var _adjustGraphScale = function (yLower, yUpper, xLower, xUpper) {
                this._axisMarkerMultiplierAdjuster(xLower, xUpper, yLower, yUpper, true);
                this._graphTypeSelector();

                this._repositionPoints();
                this._shapeRedraw();

            }

            var allEquations = modelObject.get('_points'), eqPoints, newPoints = [];

            if (typeof pointsToFit !== 'undefined') {
                newPoints = pointsToFit;
            }
            else {
                for (var a = 0; a < allEquations.length; a++) {
                    eqPoints = allEquations[a].getPoints();
                    for (var b = 0; b < eqPoints.length; b++) {
                        newPoints.push(eqPoints[b]);
                    }
                }
            }

            var markerBounds = this.getMarkerBounds(), minX = markerBounds['min']['x'], minY = markerBounds['min']['y'],
            maxX = markerBounds['max']['x'], maxY = markerBounds['max']['y'], points = newPoints/*equationData.getPoints()*/,
            maxPoint = null, signedMaxPoint = null, i = 0, flag = false;
            
            for (; i < points.length; i++) {
                if (maxPoint === null) {
                    maxPoint = [];
                    signedMaxPoint = [];
                    maxPoint.push(Math.abs(points[i][0]));
                    maxPoint.push(Math.abs(points[i][1]));
                    signedMaxPoint.push(points[i][0]);
                    signedMaxPoint.push(points[i][1]);
                    maxPoint.push(0);
                } else {
                    if (Math.abs(points[i][0]) > maxPoint[0] /*|| Math.abs(points[i][1]) > maxPoint[1]*/) {
                        maxPoint[0] = Math.abs(points[i][0]);
                        signedMaxPoint[0] = points[i][0];
                        maxPoint[2] = i;
                    }

                    if (Math.abs(points[i][1]) > maxPoint[1]) {
                        maxPoint[1] = Math.abs(points[i][1]);
                        signedMaxPoint[1] = points[i][1];
                        maxPoint[2] = i;
                    }
                }
                
            }

            //maxY -= this._getCurrentBandPadding(markerBounds['max']['y'] - markerBounds['min']['y'], this._canvasSize.height, this.paddingTop);
            //maxX -= this._getCurrentBandPadding(markerBounds['max']['x']- markerBounds['min']['x'], this._canvasSize.width, this.paddingLeft);

            var paddingY = Math.abs(this._getCurrentBandPadding(markerBounds['max']['y'] - markerBounds['min']['y'], this._canvasSize.height, this.paddingTop));
            var paddingX = Math.abs(this._getCurrentBandPadding(markerBounds['max']['x']- markerBounds['min']['x'], this._canvasSize.width, this.paddingLeft));

            var visibleMinX, visibleMinY, visibleMaxX, visibleMaxY;

            if(maxX / Math.abs(maxX) === -1){
                visibleMaxX = maxX + paddingX;
            } else if (maxX / Math.abs(maxX) === 1) {
                visibleMaxX = maxX - paddingX;
            }

            if(maxY / Math.abs(maxY) === -1){
                visibleMaxY = maxY - paddingY;
            } else if (maxY / Math.abs(maxY) === 1) {
                visibleMaxY = maxY - paddingY;
            }

            if(minX / Math.abs(minX) === -1){
                visibleMinX = minX + paddingX;  
            } else if (minX / Math.abs(minX) === 1) {
                visibleMinX = minX + paddingX;
            }

            if(minY / Math.abs(minY) === -1){
                visibleMinY = minY + paddingY;
            } else if (minY / Math.abs(minY) === 1) {
                visibleMinY = minY - paddingY;
            }
           
            //var newMaxPoint = points[maxPoint[2]];
            var newMaxPoint = signedMaxPoint;

            if (newMaxPoint[0] >= visibleMaxX 
                || newMaxPoint[1] >= visibleMaxY 
                || newMaxPoint[0] <= visibleMinX 
                || newMaxPoint[1] <= visibleMinY 
                || typeof pointsToFit === 'undefined') {
                var plotX = this._getNewBoundsWithPadding(maxPoint[0], this._canvasSize.width, this.paddingLeft),
                    plotY = this._getNewBoundsWithPadding(maxPoint[1], this._canvasSize.height, this.paddingTop);
                $.proxy(_adjustGraphScale, this)(-plotY, plotY, -plotX, plotX);

            }
            //this._axisMarkerMultiplierAdjuster(0, maxRange + unitsInOriginShiftXAxis, 0, maxRange + unitsInOriginShiftYAxis, true);

            
        },

        /**
        * Gets the padding to be considered when checking whether a point is visible in the graph
        * @method _getCurrentBandPadding
        * @param{Number} maxY The maximum value of y to be plotted on graph
        * @private
        */
        _getCurrentBandPadding: function _getCurrentBandPadding(graphRange, dimensionInPixels, paddingPixels) {
            var percentage,
                yDifference,
                unitsPerPixel;

                /*
            yDifference = graphRange * 2;
            unitsPerPixel = yDifference / dimensionInPixels;
            return Math.ceil(paddingPixels * unitsPerPixel);
            */
            return Math.ceil(paddingPixels / dimensionInPixels* graphRange);
        },

        /**
        * Gets the new limits for graph for a new point to be visible in graph
        * @method _getNewBoundsWithPadding
        * @param{Number} maxY The maximum value of y to be plotted on graph
        * @private
        */
        _getNewBoundsWithPadding: function _getNewBoundsWithPadding(maxValue, dimension, paddingPixels)
        {
            var newScale,
                unitsPerPixel;
            unitsPerPixel = maxValue / ((dimension / 2) - paddingPixels);
            newScale = unitsPerPixel * (dimension / 2);
            newScale = newScale + newScale/10;
            return newScale;
        },

        
        /**
        * changes paths color
        * @method _togglePointsColor
        * @param {object} equation dta object, string color
        * @private
        */
        _togglePointsColor: function _togglePointsColor(equationData, color) {
            var originalColor = equationData.getColor();
            if(color)
                equationData.changeColor(color);
            return originalColor;
        },
        
        
        /**
        * shows hover on point
        * @method _showHoverOnPoint
        * @param {object} equation dta object
        * @private
        */
        _showHoverOnPoint: function _showHoverOnPoint(equationData) {
            var originalColor; 
            if(equationData.getSpecie() !== 'point'){
                return;
            }
            originalColor = this._togglePointsColor(equationData, equationData.hoverColor);
            return originalColor;
        },

        /**
        * removes hover from point
        * @method _removeHoverOnPoint
        * @param {object} equation dta object, string original color
        * @private
        */
        _removeHoverOnPoint: function _removeHoverOnPoint(equationData, originalColor) {
            var originalColor; 
            if(equationData.getSpecie() !== 'point'){
                return;
            }
            originalColor = this._togglePointsColor(equationData, originalColor);
            return originalColor;
        },

        /**
        * draw points for given equation data
        * @method _drawPoints
        * @param {object} equation dta object
        * @private
        */
        _drawPoints: function _drawPoints(equationData) {
            this.activateScope();
            var point, group, color, thickness, opacity, dashArray, isVisible, pointCounter, path,
            self,
            points, ogColor,
            pointsLength, pathMouseInFunction, pathMouseOutFunction;
            color = equationData.getColor();
            thickness = equationData.getThickness() * 3;
            opacity = equationData.getOpacity();
            dashArray = equationData.getDashArray();
            isVisible = equationData.getPointVisibility();

            group = new this._paperScope.Group();
            self = this;
            pathMouseInFunction = function pathMouseInFunction() {
                var point = [this.tooltipPoint[0], this.tooltipPoint[1]],
                    currentTooltipForPoint;
                point[0] = self._getNumberForToolTip(point[0]);
                point[1] = self._getNumberForToolTip(point[1]);
                currentTooltipForPoint = $('.coordinate-tooltip[data-point="' + point[0] + '-' + point[1] + '"]').css('opacity', 0.4);
                self.$el.find('canvas').css('cursor', 'default');
                ogColor = self._showHoverOnPoint(equationData);
                if (currentTooltipForPoint.length === 0) {
                    self.showToolTipForPoint(this.bounds.center, [point[0], 0], [point[1], 0], false, equationData);
                }
                else {
                    currentTooltipForPoint.remove();
                }
            };

            pathMouseOutFunction = function pathMouseOutFunction() {
                var point = [this.tooltipPoint[0], this.tooltipPoint[1]],
                    currentTooltipForPoint;
                point[0] = self._getNumberForToolTip(point[0]);
                point[1] = self._getNumberForToolTip(point[1]);
                self.$el.find('canvas').css('cursor', 'pointer');
                self._removeHoverOnPoint(equationData, ogColor);
                currentTooltipForPoint = $('.coordinate-tooltip[data-point="' + point[0] + '-' + point[1] + '"]');
                currentTooltipForPoint.remove();
            };

            points = equationData.getPoints();
            pointsLength = points.length;
            for (pointCounter = 0; pointCounter < pointsLength; pointCounter++) {

                point = this._getCanvasPointCoordinates(points[pointCounter]);

                if (equationData.isDraggable()) {
                    path = this._getPointShapePath(equationData.pointShape, point, equationData.getDragHitThickness() / 2, equationData.getDragHitColor());
                    /*path = new Path.Circle({
                        center: point,
                        radius: equationData.drawStyle.dragHitThickness / 2,
                        fillColor: equationData.drawStyle.dragHitColor
                    });*/
                    path.hit = true;
                    path.fillColor.alpha = equationData.getDragHitAlpha();
                    path.equation = equationData;
                    path.data.point = points[pointCounter];
                    group.addChild(path);
                }
                path = this._getPointShapePath(equationData.pointShape, point, thickness / 2);
                /*path = new Path.Circle({
                    center: point,
                    radius: thickness / 2
                });*/
                path.data.point = points[pointCounter];
                path.equation = equationData;
                if (this.isTooltipForPoint) {
                    path.tooltipPoint = points[pointCounter];
                    //path.onMouseDown = null;
                    path.onMouseEnter = pathMouseInFunction;
                    path.onMouseLeave = pathMouseOutFunction;
                }
                group.addChild(path);

                if (equationData.getDashArray().length === 0) {
                    path.fillColor = color;
                }
                else {
                    path.fillColor = '#ffffff';
                    path.strokeColor = color;
                }

                path.visible = isVisible;
                self = this;

                // var label = this.addLabel(equationData);
                //  labelGroup.addChild(label);
                //this._addLabel(equationData);
                this.repositionPointsToolTip(point);
            }

            if (equationData.getPointsGroup() !== null) {
                this._removePathRollOverListeners(equationData.getPointsGroup());
                equationData.getPointsGroup().remove();
                equationData.setPointsGroup(null);
            }
            equationData.setPointsGroup(group);
            //equationData.labelData.labelObject = labelGroup;
            this._setPathRollOverListeners(group);
            this.refreshView();
        },

        _getPointShapePath: function _getPointShapePath(shapeName, centre, radius, fillColor) {
            var path;
            if (!fillColor) {
                fillColor = '#000000';
            }
            switch (shapeName) {
                case 'triangle':
                    path = new this._paperScope.Path.RegularPolygon(centre, 3, radius);
                    break;
                case 'square':
                    path = new this._paperScope.Path.RegularPolygon(centre, 4, radius);
                    break;
                default:
                    path = new this._paperScope.Path.Circle({
                        center: centre,
                        radius: radius
                    });
            }
            path.fillColor = fillColor;

            return path;
        },

		/**
        * reposition point layer elements after zoom and pan
        * @method _repositionPoints
        * @private
        */
        _repositionPoints: function _repositionPoints() {
            //paper = this._paperScope;
            this._projectLayers.pointLayer.activate();

            var pointArray = this._gridGraphModelObject.get('_points'),
                totalPointsEquation = pointArray.length,
                equationCounter, pointCounter, pointsLength, currentCoOrdinate,
                currentEquationPoints, currentEquation, currentPath, pointsPathGroup, pointCount;

            for (equationCounter = 0; equationCounter < totalPointsEquation; equationCounter++) {
                currentEquation = pointArray[equationCounter];
                currentEquationPoints = currentEquation.getPoints();
                pointsLength = currentEquationPoints.length;
                pointsPathGroup = currentEquation.getPointsGroup();

                for (pointCounter = 0, pointCount = 0; pointCounter < pointsLength; pointCounter++, pointCount++) {
                    currentCoOrdinate = this._getCanvasPointCoordinates(currentEquationPoints[pointCounter]);
                    currentPath = pointsPathGroup.children[pointCount];
					if (!currentPath) continue;
                    currentPath.position = new this._paperScope.Point(currentCoOrdinate);

                    if (currentPath.hit === true) {
                        pointCount++;
                        currentPath = pointsPathGroup.children[pointCount];
                        currentPath.position = new this._paperScope.Point(currentCoOrdinate);
                    }

                    this.repositionPointsToolTip(this._getGraphPointCoordinates(currentCoOrdinate));

                }
                if (currentEquation.getLabelData() !== null && currentEquation.getLabelData().labelObject !== null) {
                    this._updateLabelPosition(currentEquation);
                    //currentEquation.trigger('post-drag',currentEquation);
                }
            }

            this.refreshView();
        },

        _getNumberForToolTip: function _getNumberForToolTip(number) {
            if (number === undefined || number === null) {
                return;
            }
            var numberString = number.toString(),
                numberSplitted,
                decimalLength,
                toFixedBy = 3,
                decimalRegex,
                decimalNumber;

            if (numberString.indexOf('.') === -1) {
                return numberString;
            }
            numberString = Number(numberString).toFixed(toFixedBy);
            numberSplitted = numberString.split('.');
            //            numberSplitted[1] = Number(numberSplitted[1]).toFixed(toFixedBy);
            decimalRegex = /([0-9]*[1-9])([0]+)/g;
            numberSplitted[1] = numberSplitted[1].replace(decimalRegex, function ($0, $1, $2) {
                $2 = undefined;
                return $1;
            });
            decimalNumber = Number(numberSplitted[1]);
            if (decimalNumber === 0) {
                return Number(numberSplitted[0]);
            }
            decimalLength = numberSplitted[1].length;
            if (decimalLength < 3) {
                toFixedBy = decimalLength;
            }
            return Number(numberString).toFixed(toFixedBy);
        },

        /**
        * remove given point object from point layer
        * @method removePoint
        * @param plotObject {object}
        */
        removePoint: function removePoint(plotObject) {
            //paper = this._paperScope;
            if (plotObject === undefined || plotObject === null) {
                return;
            }
            this._projectLayers.pointLayer.activate();

            var index = this._gridGraphModelObject.get('_points').indexOf(plotObject),
                pointsGroup;
            if (index !== -1) {
                this._gridGraphModelObject.get('_points').splice(index, 1);
            }

            //this._redrawPoints();
            /*chack if this function contain is same as _redrawPoints*/
            this._repositionPoints();

            pointsGroup = plotObject.getPointsGroup();
            if (pointsGroup) {
                this._removePathRollOverListeners(pointsGroup);
                pointsGroup.remove();
                plotObject.setPointsGroup(null);
            }

            this.$('.coordinate-tooltip[data-equation-cid=' + plotObject.cid + ']').remove();
            this.refreshView();
            this._projectLayers.gridLayer.activate();
        },

        removeRaster: function removeRaster(rasterObject) {

            if (typeof rasterObject === 'undefined') {
                return;
            }

            this._projectLayers.imageLayer.activate();
            var raster = rasterObject.getRaster();
            if (raster) {
                raster.remove();
                rasterObject.setRaster(null);
            }
            this.refreshView();
        },
        // this functionality is moved to _repositionPoints,not any more use
        /**
        * redraw all elements of point layer.
        * @method _redrawPoints
        * @privte
        */
        _redrawPoints: function _redrawPoints() {
            //paper = this._paperScope;
            this._projectLayers.pointLayer.activate();
            if (this._paperScope.project.activeLayer.children !== null) {
                this._paperScope.project.activeLayer.removeChildren();
            }
            var pointArray = this._gridGraphModelObject.get('_points'),
                self = this, i,
                currentEquationData,
                pathMouseInFunction, pathMouseOutFunction;

            pathMouseInFunction = function () {
                var point = self._getGraphPointCoordinates([this.bounds.center.x, this.bounds.center.y]),
                    currentTooltipForPoint;
                point[0] = self._getNumberForToolTip(point[0]);
                point[1] = self._getNumberForToolTip(point[1]);
                currentTooltipForPoint = $('.coordinate-tooltip[data-point="' + point[0] + '-' + point[1] + '"]');
                if (currentTooltipForPoint.length === 0) {
                    self.showToolTipForPoint(this.bounds.center, [point[0], 0], [point[1], 0], false, currentEquationData);
                }
                else {
                    currentTooltipForPoint.remove();
                }
            };

            pathMouseOutFunction = function () {
                var point = self._getGraphPointCoordinates([this.bounds.center.x, this.bounds.center.y]),
                    currentTooltipForPoint;
                point[0] = self._getNumberForToolTip(point[0]);
                currentTooltipForPoint = $('.coordinate-tooltip[data-point="' + point[0] + '-' + point[1] + '"]');
                currentTooltipForPoint.remove();
            };

            for (i = 0; i < pointArray.length; i++) {
                this._drawPoints(pointArray[i]);
            }

            this.refreshView();
            this._projectLayers.gridLayer.activate();
        },

        repositionPointsToolTip: function repositionPointsToolTip(point) {
            var pointToolTip,
                $canvas = this.$('#' + this.ID.canvasId),
                canvasCoordinates,
                tooltipLeft,
                tooltipTop,
                tooltipHeight,
                tooltipWidth,
                canvasHeight,
                canvasWidth,
                canvasTopLeft;
            point[0] = this._getNumberForToolTip(point[0]);
            point[1] = this._getNumberForToolTip(point[1]);
            pointToolTip = $($('.coordinate-tooltip[data-point="' + point[0] + '-' + point[1] + '"]')[0]);
            //debugger;
            if (pointToolTip.length !== 0) {
                canvasCoordinates = this._getCanvasPointCoordinates(point);
                canvasHeight = $canvas.height();
                canvasWidth = $canvas.width();
                canvasTopLeft = $canvas.position();
                tooltipHeight = pointToolTip.height();
                tooltipWidth = pointToolTip.width();
                tooltipLeft = (canvasTopLeft.left + canvasCoordinates[0]);
                tooltipTop = (canvasTopLeft.top + canvasCoordinates[1] - (2 * tooltipHeight));
                if (canvasCoordinates[1] - tooltipHeight < 0 || canvasCoordinates[1] - tooltipHeight > canvasHeight || canvasCoordinates[0] < 0 || canvasCoordinates[0] + (2 * tooltipWidth) >= canvasWidth) {
                    pointToolTip.hide();
                }
                else {
                    pointToolTip.show();
                }
                //if (canvasCoordinates[0] + tooltipWidth >= canvasWidth && canvasCoordinates[0] < canvasWidth) {
                //    debugger;
                //    tooltipLeft = canvasWidth - (canvasCoordinates[0] + tooltipWidth);
                //}
                $(pointToolTip[0]).css({
                    'top': tooltipTop + 'px',
                    'left': tooltipLeft + 'px'
                });
            }
        },

        _changePlotColor: function () {
            var group = this.pathGroup;
            group.strokeColor = this.changed.color;
            this.refreshView();
        },
        /*
         *Adds label to the plotted shape
         @method addLabel
         @params {Object} equationData - containes the data about the shape to be plotted.
         @return void
        */
        setLabelStyle: function setLabelStyle(labelData) {
            var labelObject;
            labelObject = labelData.labelObject;
            labelObject.fillColor = 'red';
            labelObject.fontWeight = 'bold';
            labelObject.fontSize = 20;
            labelObject.fontFamily = 'Montserrat';
            labelObject.content = labelData.text;
        },
        addLabel: function addLabel(equationData) {

            var isLabel = false, self = this, labelObject,
            labelData = equationData.getLabelData(),
            pathGroup = equationData.getPathGroup();
            this._projectLayers.labelLayer.activate();
            switch (equationData.getSpecie()) {
                case 'point':

                    // point = this._getCanvasPointCoordinates(equationData.points[0]);
                    if (!labelData.labelObject) {
                        labelData.labelObject = new this._paperScope.PointText();
                        labelData.labelObject.equation = equationData;
                        this.setLabelStyle(labelData);
                        this._updateLabelPosition(equationData, true);

                        //  equationData.labelData.labelObject.visible = true;
                        isLabel = true;
                    }
                    else {
                        this._updateLabelPosition(equationData, true);
                        isLabel = true;
                    }
                    if (labelData.isSaveRestoreData === true) {
                        this._updateLabelPosition(equationData, true);
                        isLabel = true;
                    }



                    break;


                case 'polygon':
                    //                     var point1, point2;
                    //                     point1 = this._getCanvasPointCoordinates(equationData.points[0]);
                    //                     point2 = this._getCanvasPointCoordinates(equationData.points[1]);
                    //                     point = [(point1[0]+point2[0])/2, (point1[1] + point2[1])/2];
                    if (!labelData.labelObject) {
                        labelData.labelObject = new this._paperScope.PointText();
                        labelData.labelObject.equation = equationData;
                        this.setLabelStyle(labelData);
                        if (pathGroup) {
                            if (pathGroup.children[0] !== undefined) {
                                this._updateLabelPosition(equationData, true);
                                //equationData.labelData.labelObject.visible = true;
                                isLabel = true;
                            }

                        }



                    }
                    else {
                        this._updateLabelPosition(equationData, true);
                        isLabel = true;
                    }
                    if (labelData.isSaveRestoreData === true) {
                        this._updateLabelPosition(equationData, true);
                        isLabel = true;
                    }
                    break;
                case 'plot':
                    // var point = this._getCanvasPointCoordinates(equationData.points[0]);

                    if (!labelData.labelObject) {
                        labelData.labelObject = new this._paperScope.PointText();
                        labelData.labelObject.equation = equationData;
                        this.setLabelStyle(labelData);
                        if (pathGroup) {
                            if (pathGroup.children[0] !== undefined) {
                                this._updateLabelPosition(equationData, true);
                                isLabel = true;
                            }
                            // equationData.labelData.labelObject.visible = true;
                        }
                    }
                    else {
                        if (pathGroup) {
                            if (pathGroup.children[0] !== undefined) {
                                this._updateLabelPosition(equationData, true);
                                isLabel = true;
                            }
                        }

                    }
                    // point = equationData.pathGroup.children[0].segments[index].point;
                    //  this._updateLabelPosition(undefined, equationData, [point._x, point._y]);
                    //  isLabel = true;


                    //if (labelData.isSaveRestoreData === true) {
                    //    this._updateLabelPosition(equationData, true);
                    //    isLabel = true;
                    //}
                    break;

                case 'drawAnnotation':
                    isLabel = false;
                    return;
            }

            // equationData.labelData.labelObject = label;

            //  if(equationData.labelData.visible === true)
            // {
            //  equationData.labelData.labelObject.visible = true;
            // }
            // else{
            // equationData.labelData.visible = false;    
            //equationData.labelData.labelObject.visible = false; 
            //  }   
            //  equationData.labelData.visible = true;          
            //}
            this.refreshView();
            equationData.on('post-drag', function (equation, bAddLabel, dx, dy) { self._updateLabelPosition(equation, true, dx, dy); });
            equationData.on('post-relocate', function (equation) { self._updateLabelPosition(equation); });
            equationData.on('teleported', function (equation) { self._updateLabelPosition(equation); });
            equationData.on('drag-label', $.proxy(self._updateLabelPosition, self));
        },
        /*
        *Adds label to the plotted shape
        @private
        @method _updateLabelPosition
        @params {Array} graphCoordinates - contains the graph coordinates of the point around which label is to be plotted.
        @params {Object} equationData - containes the data about the shape to be plotted.
        @params {Array} coordinates - contains the canvas coordinates of the point around which label is to be plotted.
        @return void
        */
        _updateLabelPosition: function _updateLabelPosition(equationData, bAddLabel, dx, dy) {

            var labelData = equationData.getLabelData(),
                labelPosition;
            if (bAddLabel !== true || labelData.isSaveRestoreData === true) {
                //TODO:changed event to undefined for firefox issue;
                this.trigger('change-label-position', undefined, equationData);
            }

            labelPosition = [labelData.position.x, labelData.position.y];

            if (dx !== undefined && dy !== undefined) {
                labelData.labelObject.position.x += dx;
                labelData.labelObject.position.y += dy;

            } else {
                labelData.labelObject.position.x = labelPosition[0];
                labelData.labelObject.position.y = labelPosition[1];


            }

        },
        //_updateLabelPosition: function _updateLabelPosition(equationData) {

        //    //coordinates,
        //    //var index, point1,point2, segment, arr, mid, finalCoordinates;

        //    var path, offset, pointOnPath, normal, line, labelPosition, xcoord, ycoord,
        //        labelData = equationData.getLabelData(),
        //        pathGroup,
        //            pointsGroup;
        //    switch (equationData.getSpecie()) {

        //        case 'point':

        //            if (!labelData.position) {
        //                labelData.position = {};
        //            }
        //            if (labelData.position.x === undefined && labelData.position.y === undefined) {
        //                pointsGroup = equationData.getPointsGroup();
        //                xcoord = pointsGroup.firstChild.position.x + 10;
        //                ycoord = pointsGroup.firstChild.position.y + 20;
        //                labelData.labelObject.position.x = xcoord;
        //                labelData.labelObject.position.y = ycoord;
        //                labelData.position.x = xcoord;
        //                labelData.position.y = ycoord;
        //            } else {
        //                var labelPosition = this._getCanvasPointCoordinates([labelData.position.x, labelData.position.y]);
        //                labelData.labelObject.position.x = labelPosition[0];
        //                labelData.labelObject.position.y = labelPosition[1];
        //            }
        //            break;


        //        case 'polygon':
        //        case 'plot':
        //            var labelPosition = this._getCanvasPointCoordinates([labelData.position.x, labelData.position.y]);
        //            pathGroup = equationData.getPathGroup();
        //            if (!pathGroup) {
        //                return;
        //            }
        //            //if (pathGroup.children[0]) {
        //            //    path = pathGroup.children[0];
        //            //    //offset = path.length / 3;
        //            //    //pointOnPath = path.getPointAt(offset);
        //            //    // normal = path.getNormalAt(offset);
        //            //    pointOnPath = { x: labelPosition[0], y: labelPosition[1] };
        //            //    normal = path.getLocationOf(pointOnPath).normal;
        //            //    // Make the normal vector 30pt long:
        //            //    normal.length = 20;
        //            //    //var line = new Path({
        //            //    //    segments: [pointOnPath, pointOnPath + normal]

        //            //    //});
        //            //    line = new this._paperScope.Path();
        //            //    line.add(pointOnPath);
        //            //    line.add([pointOnPath.x + normal.x, pointOnPath.y + normal.y]);
        //            //    //line.strokeColor = 'black';
        //            //    labelPosition = line.getPointAt(normal.length / 2);
        //            //    //labelData = equationData.getLabelData();
        //            //    labelData.labelObject.position.x = labelPosition.x;
        //            //    labelData.labelObject.position.y = labelPosition.y;

        //            //}
        //            labelData.labelObject.position.x = labelPosition[0];
        //            labelData.labelObject.position.y = labelPosition[1];
        //            break;

        //        case 'drawAnnotation':

        //            break;

        //        case 'measurement':
        //            break;

        //    }
        //    //this.refreshView();
        //},


        setBannerPosition: function setBannerPosition(measureData, previousMeasurement) {
            var bannerObject = measureData.model.equation.getBannerData().bannerObject,

                //self = this,
                previousMeasurement,
                previousPointText,
                verticalCoordinate,
                horizontalCoordinate,
                height;
            this._projectLayers.bannerLayer.activate();
            this._paperScope.project.activeLayer.addChild(bannerObject);
            //previousMeasurement = MathUtilities.Tools.Dgt.Models.DgtMeasurement.previousMeasurement;
            if (previousMeasurement !== null) {
                previousPointText = previousMeasurement.equation.getBannerData().bannerObject.children[2];
                verticalCoordinate = previousPointText.bounds.y;
                horizontalCoordinate = previousPointText.bounds.x;
                height = previousPointText.bounds.height;

            }
            else {
                verticalCoordinate = 50;
                horizontalCoordinate = 10;
                height = 0;
            }
            bannerObject.children[2].bounds.y = verticalCoordinate + height + 10;
            bannerObject.children[2].bounds.x = horizontalCoordinate;
            this._projectLayers.pointLayer.activate();

        },



        showToolTipForPoint: function showToolTipForPoint(point, x, y, isDrag, equationData) {
            var $canvas = this.$('#' + this.ID.canvasId),
                canvasPosition = $canvas.position(),
                $tooltip,
                tooltipText = '',
                equationDataCid,
                borderColor, xValue, yValue;
            if (equationData) {
                equationDataCid = equationData.getCid();
                borderColor = equationData.getColor();
            }
            $tooltip = $('<div></div>').css({
                'position': 'absolute',
                'top': canvasPosition.top + point.y + 'px',
                'left': canvasPosition.left + point.x + 'px',
                'z-index': 1000,
                'border-color': borderColor
            }).attr('class', 'coordinate-tooltip');
            xValue = MathInteractives.Common.Utilities.Models.Utils.convertIntoScientificNotaion({ 'number': x[0], 'numberOfDigits': 5 }).number;
            yValue = MathInteractives.Common.Utilities.Models.Utils.convertIntoScientificNotaion({ 'number': y[0], 'numberOfDigits': 5 }).number;
            if (equationData.titleLabel) {
                tooltipText += equationData.titleLabel + '<br/>'
            }

            if (equationData.xToolTipLabel && equationData.yToolTipLabel) {
                tooltipText += equationData.xToolTipLabel + ':&nbsp';
                tooltipText += xValue;
                if (x[1] !== 0) {
                    tooltipText += ' × ' + x[1];
                }
                tooltipText += '<br>';
                tooltipText += equationData.yToolTipLabel + ':&nbsp;';
                tooltipText += yValue;
                if (y[1] !== 0) {
                    tooltipText += ' × ' + y[1];
                }
            } else {
                tooltipText = xValue;
                if (x[1] !== 0) {
                    tooltipText += ' × ' + x[1];
                }
                tooltipText += ',&nbsp;' + yValue;
                if (y[1] !== 0) {
                    tooltipText += ' × ' + y[1];
                }
            }

            $tooltip.html(tooltipText);
            if (isDrag) {
                this.$('.drag-tooltip').remove();
                $tooltip.addClass('drag-tooltip');
            }
            else {
                $tooltip.attr('data-point', x[0] + '-' + y[0]);
                $tooltip.attr('data-equation-cid', equationDataCid);
            }
            var ogWidth, ogHeight, tempTop = $tooltip.css('top'), tempLeft = $tooltip.css('left');
            this.$el.parents('.de-mathematics-interactive .player').append($tooltip);
            $tooltip.css({ 'top': 0, 'left': 0 });
            ogWidth = $tooltip.width() + 20 + 2;//padding 10 px top + bottom + 1px border
            ogHeight = $tooltip.height() + 6 + 2;//padding 3 px top + bottom + 1px border

            $tooltip.css({ 'top': tempTop, 'left': tempLeft });
            this.$el.find('.coordinate-tooltip').remove();
            this.$el.append($tooltip)
            $tooltip.css('top', $tooltip.position().top - (ogHeight + 15));// leave 15px space between tooltip and point

            if ($tooltip.position().left + ogWidth > this.$el.width()) {// if tooltip goes out from left
                $tooltip.css('left', $tooltip.position().left - ogWidth);
            }
            if ($tooltip.position().top < canvasPosition.top) {// if tooltip goes out from top
                $tooltip.css('top', $tooltip.position().top + (ogHeight + 15 + 15));// cancel original 15px difference and leave 15px space between tooltip and point
            }
        },

        /*
        Function to add array of points to a figure on the graph
        @param points: Array of points in the format [[point1 x co-ordinate,point1 y co-ordinate],[point2 x co-ordinate,point2 y co-ordinate],.........,[pointn x co-ordinate,pointn y co-ordinate]]
        */
        addPoints: function addPoints(equationData) {

            //paper = this._paperScope;
            this._projectLayers.shapeLayer.activate();

            var currentParam, previousParam, nextParam, currentPoint, previousPoint, currentPath, path, firstOrder, secondOrder, arrOrderNo, orderCounter, breakAfter, strPrint, arrTemp,
                arrPreviousOrder, newPath, orderCheck, arrTrace, arrColor, points, color, thickness, group, THRESHOLD, _NORMAL_STYLE, _HIGHLIGHT_STYLE, debugCoordinates, pointCounter, self, pathGroup;
            pathGroup = equationData.getPathGroup();
            if (pathGroup !== null) {
                pathGroup.remove();
                this._removePathRollOverListeners(pathGroup);
            }

            if (this._gridGraphModelObject.get('_plots').indexOf(equationData) === -1) {
                this._gridGraphModelObject.get('_plots').push(equationData);
            }

            Backbone.listenTo(equationData, 'change:color', $.proxy(this._changePlotColor, equationData));
            //            //console.log(this._gridGraphModelObject._plots);

            //Path = this._paperScope.path, Group = this._paperScope.Group, Point = this._paperScope.Point;

            points = equationData.getPoints();
            color = equationData.getColor();
            thickness = equationData.getThickness();

            currentParam = null;
            previousParam = null;
            nextParam = null;
            //            //console.log('No of points ::: ' + points.length);
            previousPoint = null;
            group = new this._paperScope.Group();
            currentPath = new this._paperScope.Path();
            currentPath.equation = equationData;
            currentPath.strokeColor = color;
            currentPath.strokeWidth = thickness;
            group.addChild(currentPath);
            firstOrder = new this._paperScope.Point(0, 0);
            secondOrder = new this._paperScope.Point(0, 0);

            arrOrderNo = [];

            breakAfter = false;



            arrTrace = [];
            arrColor = [];
            THRESHOLD = 1;
            _NORMAL_STYLE = 'color: #000';
            _HIGHLIGHT_STYLE = 'background: #0c0; color: #fff';

            for (pointCounter = 0; pointCounter < points.length; pointCounter++) {

                currentPoint = points[pointCounter];
                if (previousPoint !== null) {
                    if (previousPoint[0] === currentPoint[0] && previousPoint[1] === currentPoint[1]) {
                        continue;
                    }
                }
                //var graphX = GridGraphView.initialViewCenter.x + ((currentPoint[0] / GridGraphView.markerSkips.x) * GridGraphView.totalNoOfPartitions * GridGraphView.step.x);
                //var graphY = GridGraphView.initialViewCenter.y - ((currentPoint[1] / GridGraphView.markerSkips.y) * GridGraphView.totalNoOfPartitions * GridGraphView.step.y);

                //currentPoint[0] = this._setValuesForInfinity(currentPoint[0], true);
                //currentPoint[1] = this._setValuesForInfinity(currentPoint[1], false);
                newPath = false;

                for (orderCounter = 0; orderCounter < 4; orderCounter++) {
                    breakAfter = arrOrderNo[orderCounter] === undefined;


                    if (orderCounter === 0) {
                        strPrint = '';
                        if (breakAfter) {
                            arrOrderNo[orderCounter] = [];
                        }
                        arrOrderNo[orderCounter].push(currentPoint);
                    }
                    else {
                        if (breakAfter) {
                            arrOrderNo[orderCounter] = [];
                        }
                        arrPreviousOrder = arrOrderNo[orderCounter - 1];
                        arrOrderNo[orderCounter].push(this._getPointDiff(arrPreviousOrder));
                    }

                    arrTemp = arrOrderNo[orderCounter];

                    strPrint += '%c ' + arrTemp[arrTemp.length - 1][0].toFixed(5) + ',' + arrTemp[arrTemp.length - 1][1].toFixed(5) + '%c>>';
                    arrColor[orderCounter] = orderCounter >= 2 && (Math.abs(arrTemp[arrTemp.length - 1][0]) > THRESHOLD || Math.abs(arrTemp[arrTemp.length - 1][1]) > THRESHOLD) ? _HIGHLIGHT_STYLE : _NORMAL_STYLE;


                    if (orderCounter === 2) {
                        orderCheck = arrTemp[arrTemp.length - 1];
                        if (Math.abs(orderCheck[0]) > THRESHOLD || Math.abs(orderCheck[1]) > THRESHOLD) {

                            //newPath = true;
                            debugCoordinates = this._getCanvasPointCoordinates(currentPoint);
                            /*debugCircle = new Path.Circle({
                            center: [debugCoordinates[0], debugCoordinates[1]],
                            radius: 5,
                            strokeColor: 'blue'
                            });*/
                        }
                    }

                    if (breakAfter) {
                        //this._printOrder(strPrint, arrColor);
                        break;
                    }
                    else if (orderCounter === 3) {
                        //this._printOrder(strPrint, arrColor);
                    }

                }

                if (newPath) {
                    path = new this._paperScope.Path();
                    path.strokeColor = color;
                    path.equation = equationData;
                    path.strokeWidth = thickness;
                    currentPath = path;
                    group.addChild(currentPath);
                }

                currentPoint = this._getCanvasPointCoordinates(currentPoint);
                currentPath.add(currentPoint);

                this._plottingPoints(group, previousParam, currentParam, currentPoint);

                previousParam = currentParam;
                currentParam = currentPoint;

                previousPoint = currentPoint;
            }
            //currentPath.closed = true;
            //currentPath.smooth();

            group.strokeColor = color;
            //            group.opacity = opacity;
            //            group.dashArray = dashArray;
            this.refreshView();
            equationData.setPathGroup(group);

            self = this;

            //            group.onMouseDown = function (event) {

            //                self._projectLayers.shapeLayer.activate();
            //                self._shapePan = true;
            //                self._traceMouseDownHandle.apply(self, [event, this]);
            //                self._projectLayers.gridLayer.activate();
            //                paper = self._paperScope;
            //                group.onMouseDrag = function (event) {
            //                    self._projectLayers.shapeLayer.activate();
            //                    self._shapePan = true;
            //                    self._traceMouseDragHandle.apply(self, [event, this]);
            //                    self._projectLayers.shapeLayer.activate();
            //                };

            //                self._traceMouseDownHandle.apply(self, [event, this]);
            //                paper.view.draw();
            //            };
            //            group.onMouseDrag = function (event) {
            //                paper = self._paperScope;
            //                self._projectLayers.shapeLayer.activate();

            //                self._traceMouseDragHandle.apply(self, [event, this]);
            //                this._projectLayers.gridLayer.activate();
            //            };

            equationData.set({ color: 'black' });
        },

        _traceMouseDownHandle: function (event, curve) {
            //disabled by shashank
            if (!this.isTooltipForPoint || this.disableLineTooltip === true) {
                return;
            }


            //            paper = this._paperScope;
            //            this._projectLayers.shapeLayer.activate();
            // Bring curve which was clicked to front
            curve.bringToFront();

            var circleDrag, content, model,
            //positionBox,
            //coOrdinates,
                path, intersectPoint, canvasHeight, canvasWidth, i,
                //Path = this._paperScope.Path,
            //PointText = this._paperScope.PointText,
                contentX, contentY,
            //coOrdinatesX, coOrdinatesY,
                contextXLength,
                contextXheight, contextYLength, contextYheight, fontSize;
            //separator;


            fontSize = 15;
            // Create circle which traces the curve
            //circleDrag = new Path.Circle(event.point, 3);
            model = this._gridGraphModelObject;
            intersectPoint = [];
            canvasHeight = this._canvasSize.height;
            canvasWidth = this._canvasSize.width;

            //circleDrag.fillColor = curve.strokeColor;
            //            positionBox = new Path.Rectangle([circleDrag.position.x + 5, circleDrag.position.y - 25], 90, 20);
            //            positionBox = new Path.Rectangle([circleDrag.position.x + 5, circleDrag.position.y - 25]);
            //            positionBox.size = [90, 20];
            //            positionBox.strokeColor = '#000';
            //            positionBox.fillColor = '#fff';
            content = this._getGraphPointCoordinates([event.point.x, event.point.y]);

            contentX = this._getPowerOfNumber(content[0], this._gridGraphModelObject.get('_graphDisplayValues')._zoomingFactor.xTotalMultiplier);
            contentX[0] = parseFloat(contentX[0].toFixed(4));

            if (contentX[1] !== 0) {
                contextXLength = contentX[0].toString().length + contentX[1].toString().length + this._X10_STRING.length;
                contextXheight = 2;
            }
            else {
                contextXLength = contentX[0].toString().length;
                contextXheight = 1;
            }

            contentY = this._getPowerOfNumber(content[1], this._gridGraphModelObject.get('_graphDisplayValues')._zoomingFactor.yTotalMultiplier);
            contentY[0] = parseFloat(contentY[0].toFixed(4));

            if (contentY[1] !== 0) {
                contextYLength = contentY[0].toString().length + contentY[1].toString().length + this._X10_STRING.length;
                contextYheight = 2;
            }
            else {
                contextYLength = contentY[0].toString().length;
                contextYheight = 1;
            }

            // position box to get co ordinates
            //coOrdinates = new PointText({
            //    point: [circleDrag.position.x + 10, circleDrag.position.y - 10],
            //    content: content[0].toPrecision(4) + ', ' + content[1].toPrecision(4),
            //    fillColor: 'black',
            //    fontSize: 15
            //});
            //positionBox = new Path.Rectangle([circleDrag.position.x + 5, circleDrag.position.y - 25], ((contextXLength + contextYLength) * fontSize / 2 + 10), (contextXheight + contextYheight) * fontSize);
            //positionBox.strokeColor = '#000';
            //positionBox.fillColor = '#fff';
            //coOrdinatesX = this._displayToPower10(contentX[0], contentX[1], circleDrag.position.x, circleDrag.position.y, '#000000', fontSize, false);
            // comment due to new tooltip
            //separator = new PointText({
            //    point: [circleDrag.position.x + contextXLength * fontSize / 2, circleDrag.position.y],
            //    content: ', ',
            //    fillColor: 'black',
            //    fontSize: 15
            //});
            //coOrdinatesY = this._displayToPower10(contentY[0], contentY[1], (circleDrag.position.x + (contextXLength * fontSize / 2)) + 10, circleDrag.position.y, '#000000', fontSize, false)

            path = new this._paperScope.Path([event.point.x, 0], [event.point.x, canvasHeight]);
            //            intersectPoint = path.getIntersections(curve);
            // To check if the given path is not a group of paths
            if (!curve.children) {
                intersectPoint = curve.getIntersections(model.get('path'));
            }
            else {
                // Scan each path from the group
                for (i = 0; i < curve.children.length; i++) {
                    intersectPoint = intersectPoint.concat(path.getIntersections(curve.children[i]));
                }
            }
            if (intersectPoint.length < 1) {
                path = new this._paperScope.Path([0, event.point.y], [canvasWidth, event.point.y]);
                if (!curve.children) {
                    intersectPoint = curve.getIntersections(model.get('path'));
                }
                else {
                    // Scan each path from the group
                    for (i = 0; i < curve.children.length; i++) {
                        intersectPoint = intersectPoint.concat(path.getIntersections(curve.children[i]));
                    }
                }
                if (intersectPoint.length < 1) {
                    path = new this._paperScope.Path();
                }
            }
            curve.children[0].equation.trigger('focus-equation');
            //            //console.log(intersectPoint[0].point);
            circleDrag = new this._paperScope.Path.Circle(intersectPoint[0].point, 3);
            circleDrag.fillColor = curve.children[0].equation.getColor();

            if (this.disableLineTooltip !== true) {
                this.showToolTipForPoint(intersectPoint[0].point, contentX, contentY, true, curve.children[0].equation);
            }

            // Setting data into model
            //model.set('xCoOrdinateBase', coOrdinatesX[0]);
            //model.set('xCoOrdinatePower', coOrdinatesX[1]);
            //model.set('yCoOrdinateBase', coOrdinatesY[0]);
            //model.set('yCoOrdinatePower', coOrdinatesY[1]);
            //model.set('coOrdinateSeparator', separator);
            //            model.set('coOrdinates', coOrdinates);
            //            model.set('positionBox', positionBox);
            model.set('circleDrag', circleDrag);
            model.set('path', path);
            this.refreshView();
        },
        _traceMouseDragHandle: function (event, curve) {
            //disabled by shashank
            if (!this.isTooltipForPoint || this.disableLineTooltip === true) {
                return;
            }

            //            paper = this._paperScope;
            //            this._projectLayers.shapeLayer.activate();
            var intersectPoint = [],
            model = this._gridGraphModelObject, distanceArray, min, i, index, coordinate, contentX, contentY,
            //coOrdinatesX, coOrdinatesY,
            contextXLength,
            contextXheight, contextYLength, contextYheight,
            //fontSize = 15,
            contextYbaseLength, contextXbaseLength;
            //positionBox;

            if (this.$el.find('.hover-tooltip').attr('event-id')) {
                model.get('circleDrag').visible = false;
                this.isSnap = true;
                //console.log('return');
                return;
            }
            this.isSnap = false;
            model.get('circleDrag').visible = true;
            //            model.get('positionBox').visible = true;
            //            model.get('coOrdinates').visible = true;
            //model.get('xCoOrdinateBase').visible = true;
            //model.get('xCoOrdinatePower').visible = true;
            //model.get('yCoOrdinateBase').visible = true;
            //model.get('yCoOrdinatePower').visible = true;
            //model.get('coOrdinateSeparator').visible = true;
            if (model.get('path').firstSegment.point.y === 0) {
                model.get('path').position.x = event.point.x;
            }
            else {
                model.get('path').position.y = event.point.y;
            }
            // To check if the given path is not a group of paths
            if (!curve.children) {
                intersectPoint = curve.getIntersections(model.get('path'));
            }
            else {
                // Scan each path from the group
                for (i = 0; i < curve.children.length; i++) {
                    intersectPoint = intersectPoint.concat(curve.children[i].getIntersections(model.get('path')));
                }
            }
            if (intersectPoint.length < 1) {
                model.get('circleDrag').visible = false;
                this.$('.drag-tooltip').remove();
                //                model.get('positionBox').visible = false;
                //                model.get('coOrdinates').visible = false;
                //                model.get('xCoOrdinateBase').visible = false;
                //                model.get('xCoOrdinatePower').visible = false;
                //                model.get('yCoOrdinateBase').visible = false;
                //                model.get('yCoOrdinatePower').visible = false;
                //model.get('coOrdinateSeparator').visible = false;
                return;
            }
            distanceArray = new Array(intersectPoint.length);
            distanceArray[0] = intersectPoint[0].point.getDistance(event.point);
            min = distanceArray[0];
            // Finding the nearest distance among the nearset points
            for (i = 1; i < intersectPoint.length; i++) {
                distanceArray[i] = (intersectPoint[i].point).getDistance(event.point);
                if (distanceArray[i] < min) {
                    min = distanceArray[i];
                }
            }
            index = distanceArray.indexOf(min);
            model.get('circleDrag').position = intersectPoint[index].point;

            //            model.get('positionBox').position = [model.get('circleDrag').position.x + 50, model.get('circleDrag').position.y - 15];


            coordinate = this._getGraphPointCoordinates([model.get('circleDrag').position.x, model.get('circleDrag').position.y]);

            contentX = this._getPowerOfNumber(coordinate[0], this._gridGraphModelObject.get('_graphDisplayValues')._zoomingFactor.xTotalMultiplier);
            contentX[0] = parseFloat(contentX[0].toFixed(4));

            if (contentX[1] !== 0) {
                contextXbaseLength = contentX[0].toString().length + this._X10_STRING.length;
                contextXLength = contextXbaseLength + contentX[1].toString().length;
                contextXheight = 2;
            }
            else {
                contextXbaseLength = 0;
                contextXLength = contentX[0].toString().length;
                contextXheight = 1;
            }
            contentY = this._getPowerOfNumber(coordinate[1], this._gridGraphModelObject.get('_graphDisplayValues')._zoomingFactor.yTotalMultiplier);
            contentY[0] = parseFloat(contentY[0].toFixed(4));

            if (contentY[1] !== 0) {
                contextYbaseLength = contentY[0].toString().length + this._X10_STRING.length;
                contextYLength = contextYbaseLength + contentY[1].toString().length;
                contextYheight = 2;
            }
            else {
                contextYbaseLength = 0;
                contextYLength = contentY[0].toString().length;
                contextYheight = 1;
            }

            if (this.disableLineTooltip !== true) {
                this.showToolTipForPoint(intersectPoint[index].point, contentX, contentY, true, curve.children[0].equation);
            }
            this.refreshView();
        },

        drawInequalitites: function drawInequalitites(equationData) {
            var inEqualitityPlots = equationData.getInEqualityPlots(),
                totalPlots,
                plotCounter,
                path,
                group;

            if (inEqualitityPlots === null) {
                return;
            }
            group = new this._paperScope.Group();
            group.fillColor = equationData.getColor();
            group.strokeColor = equationData.getColor();
            group.fillColor.alpha = 0.5;
            group.strokeColor.alpha = 0;
            totalPlots = inEqualitityPlots.length;
            for (plotCounter = 0; plotCounter < totalPlots; plotCounter++) {
                path = new this._paperScope.Path({
                    segments: inEqualitityPlots[plotCounter]
                });
                path.fillColor = equationData.getColor();
                path.strokeColor = equationData.getColor();
                path.fillColor.alpha = 0.5;
                path.strokeColor.alpha = 0;
                group.addChild(path);
            }
            equationData.setInEqualititesPathGroup(group);
        },

        removeInEqualityPlots: function removeInEqualityPlots(equationData) {
            var inEqualityPlot = equationData.getInEqualititesPathGroup();
            if (inEqualityPlot !== null) {
                inEqualityPlot.remove();
                equationData.setInEqualititesPathGroup(null);
            }
        },

        _addSegments: function (equationData) {
            //paper = this._paperScope;
            this.activateScope();
            var leftArray, rightArray, path, group, equationLabelData,
            //self, newsegment, 
                i,
            //j,
                previousParam, currentParam,
            //nextParam,
                color, thickness, dashArray, isVisible;

            leftArray = equationData.getLeftArray();
            rightArray = equationData.getRightArray();


            this._projectLayers.shapeLayer.activate();

            if (equationData.getPathGroup() !== null) {
                //TODO remove reference of equationData from the path objects in the pathGroup
                this._removePathRollOverListeners(equationData.getPathGroup());
                equationData.getPathGroup().remove();
            }

            if (equationData.getColor() === undefined) {
                color = '#000000';
            }
            else {
                color = equationData.getColor();
            }
            if (equationData.getThickness() === undefined) {
                thickness = 1;
            }
            else {
                thickness = equationData.getThickness();
            }

            if (equationData.getDashArray() !== undefined) {
                dashArray = equationData.getDashArray();
            }

            if (equationData.getCurveVisibility() === undefined) {
                isVisible = true;
            }
            else {
                if (typeof (equationData.getCurveVisibility()) === 'object') {
                    isVisible = equationData.getCurveVisibility().curve;
                }
                else {
                    isVisible = equationData.getCurveVisibility();
                }
            }
            group = new this._paperScope.Group();
            previousParam = null;
            currentParam = null;

            for (i = 0; i < leftArray.length; i++) {
                if (equationData.isDraggable()) {
                    path = new this._paperScope.Path({ segments: leftArray[i] });
                    path.strokeColor = equationData.getDragHitColor();
                    path.strokeColor.alpha = equationData.getDragHitAlpha();
                    path.equation = equationData;
                    path.hit = true;
                    path.equationID = equationData.getId();
                    path.strokeWidth = equationData.getDragHitThickness();
                    group.addChild(path);
                }

                path = new this._paperScope.Path({ segments: leftArray[i] });
                path.strokeColor = color;
                path.strokeWidth = thickness;
                path.equation = equationData;
                path.equationID = equationData.getId();
                group.addChild(path);


            }

            if (rightArray !== null) {
                previousParam = null;
                for (i = 0; i < rightArray.length; i++) {
                    if (equationData.isDraggable()) {
                        path = new this._paperScope.Path({ segments: rightArray[i] });
                        path.strokeColor = equationData.getDragHitColor();
                        path.equation = equationData;
                        path.hit = true;
                        path.strokeColor.alpha = equationData.getDragHitAlpha();
                        path.equationID = equationData.getId();
                        path.strokeWidth = equationData.getDragHitThickness();
                        group.addChild(path);
                    }

                    path = new this._paperScope.Path({ segments: rightArray[i] });
                    path.strokeColor = color;
                    path.equation = equationData;
                    path.equationID = equationData.getId();
                    path.strokeWidth = thickness;
                    group.addChild(path);



                }
            }


            //            if (equationData.dashArray.length !== 0) {
            group.dashArray = equationData.getDashArray();
            group.visible = isVisible;
            this._setPathRollOverListeners(group);
            //            }
            equationData.setPathGroup(group);
            /*Uncomment for tooltip on graph on mouse over
            equationData.pathGroup.onMouseEnter = function (event) {
                equationData.dragCircle = new Path.Circle(event.point, 3);
                equationData.dragCircle.fillColor = 'black';
                var point = self._getGraphPointCoordinates([event.point.x, event.point.y]);
                point[0] = self._getNumberForToolTip(point[0]);
                point[1] = self._getNumberForToolTip(point[1]);
                self.showToolTipForPoint(event.point, [point[0], 0], [point[1], 0], true, equationData.cid);
            };
            equationData.pathGroup.onMouseMove = function (event) {
                var point = self._getGraphPointCoordinates([event.point.x, event.point.y]);
                point[0] = self._getNumberForToolTip(point[0]);
                point[1] = self._getNumberForToolTip(point[1]);
                if (equationData.dragCircle) {
                    equationData.dragCircle.bounds.center = event.point;
                }
                self.showToolTipForPoint(event.point, [point[0], 0], [point[1], 0], true, equationData.cid);
            };
            equationData.pathGroup.onMouseLeave = function (event) {
                if (equationData.dragCircle) {
                    equationData.dragCircle.remove();
                    equationData.dragCircle = null;
                }
                $('.coordinate-tooltip.drag-tooltip').remove();
            };*/
            // this.addLabel(equationData);

            equationLabelData = equationData.getLabelData();
            if (equationLabelData !== null && equationLabelData.labelObject !== null) {
                this._updateLabelPosition(equationData);
            }

            this._projectLayers.gridLayer.activate();
            this.refreshView();

            if (this._gridGraphModelObject.get('_plots').indexOf(equationData) === -1) {
                this._gridGraphModelObject.get('_plots').push(equationData);

            }

        },


        ////
        //_addGraph: function _addGraph(modelObject, functionVariable, order) {
        //    //            //console.log('add graph');
        //    //            //console.log('equation= ' + modelObject.equation + '>>variable= ' + functionVariable + '>>order= ' + order);
        //    //paper = this._paperScope;
        //    this._projectLayers.shapeLayer.activate();

        //    if (modelObject.getPathGroup() !== null) {
        //        modelObject.getPathGroup().remove();
        //        modelObject.setPathGroup(null);
        //    }

        //    var points, color, thickness, group, leftPath, rightPath, leftSegments, rightSegments, point1, point2, previousParam, currentParam,
        //        leftTracker, rightTracker, paramVariable, paramArrayIndex, newPath, debugCircle, canvasHeight, canvasWidth, self, i, opacity, dashArray, isVisible;
        //    //Group = this._paperScope.Group, Path = this._paperScope.Path;

        //    previousParam = null;
        //    currentParam = null;
        //    points = modelObject.getPoints();

        //    color = modelObject.getColor();

        //    thickness = modelObject.geThickness();

        //    opacity = modelObject.getOpacity();

        //    dashArray = modelObject.getDashArray();

        //    isVisible = modelObject.getCurveVisibility();

        //    group = new this._paperScope.Group();

        //    leftSegments = [];
        //    rightSegments = [];


        //    leftTracker = new CurveDerivativeTracker();
        //    rightTracker = new CurveDerivativeTracker();

        //    paramVariable = this._getOppositeAxis(functionVariable);
        //    paramArrayIndex = this._getAxisIndex(functionVariable);

        //    //////console.log('function var is ' + functionVariable);
        //    //////console.log('param var is ' + paramVariable + ' param axis index ' + paramArrayIndex);
        //    //////console.log('equation order is ' + order);
        //    newPath = false;

        //    canvasHeight = this._canvasSize.height;
        //    canvasWidth = this._canvasSize.width;

        //    for (i = 0; i < points.length; i++) {

        //        if (points[i] === undefined || newPath === true) {


        //            leftPath = new this._paperScope.Path({ segments: leftSegments });
        //            leftPath.strokeColor = color;
        //            leftPath.strokeWidth = thickness;
        //            group.addChild(leftPath);


        //            debugCircle = new this._paperScope.Path.Circle(new this._paperScope.Point(point1[0], point1[1]), 10);
        //            debugCircle.strokeColor = 'black';
        //            group.addChild(debugCircle);

        //            leftSegments = [];
        //            //leftTracker.clear();



        //            newPath = false;

        //            if (points[i] === undefined) {
        //                //                        //console.log('Discontinuous Curve jump');
        //                continue;
        //            }

        //        }
        //        point1 = this._generatePoint(points[i], functionVariable, 1);



        //        /*condition if point is far away from canvas*/
        //        //                if (point1[1] < -9999999 || point1[0] < -9999999 || point1[0] > canvasWidth + 9999999 || point1[1] > canvasHeight + 9999999) {
        //        //                    continue;
        //        //                }

        //        if (point1[1] < -5000 || point1[0] < -5000 || point1[0] > canvasWidth + 5000 || point1[1] > canvasHeight + 5000) {
        //            continue;
        //        }
        //        //                if (point1[1] < -50 || point1[0] < -50 || point1[0] > canvasWidth + 50 || point1[1] > canvasHeight + 50) {
        //        //                    continue;


        //        leftSegments.push(point1);


        //        if (order > 1) {
        //            point2 = this._getCanvasPointCoordinates(this._generatePoint(points[i], functionVariable, 2));
        //            rightSegments.push(point2);
        //            //rightTracker.trackPoint(point2);

        //            if (rightTracker.flipState[2] !== undefined && rightTracker.flipState[2][paramArrayIndex] === true) {
        //                rightSegments.pop();
        //                rightSegments.pop();
        //                //newPath = true;
        //                //                        debugCircle = new Path.Circle(new Point(point2[0], point2[1]), 10);
        //                //                        debugCircle.strokeColor = 'black';
        //                //                        group.addChild(debugCircle);
        //            }

        //        }

        //        if (leftTracker.flipState[2] !== undefined && leftTracker.flipState[2][paramArrayIndex] === true) {
        //            leftSegments.pop();
        //            leftSegments.pop();
        //            //////console.log('New path at ' + point1);
        //            //newPath = true;
        //            //                    debugCircle = new Path.Circle(new Point(point1[0], point1[1]), 10);
        //            //                    debugCircle.strokeColor = 'black';
        //            //                    group.addChild(debugCircle);
        //        }


        //        //lastPoint = currentPoint;
        //        /*graph -cross point*/
        //        this._plottingPoints(group, previousParam, currentParam, point1);

        //        previousParam = currentParam;
        //        currentParam = point1;

        //    }

        //    if (leftSegments.length > 0) {
        //        leftPath = new this._paperScope.Path({ segments: leftSegments });
        //        leftPath.strokeColor = color;
        //        leftPath.strokeWidth = thickness;
        //        group.addChild(leftPath);

        //        if (order > 1) {
        //            rightPath = new this._paperScope.Path({ segments: rightSegments });
        //            rightPath.strokeColor = 'red';
        //            rightPath.strokeWidth = thickness;
        //            group.addChild(rightPath);
        //        }
        //    }

        //    group.strokeColor = color;
        //    group.opacity = opacity;
        //    group.dashArray = dashArray;
        //    group.visible = isVisible;

        //    modelObject.setPathGroup(group);
        //    modelObject.set({ color: 'black' });

        //    self = this;
        //    if (this._gridGraphModelObject.get('_plots').indexOf(modelObject) === -1) {
        //        this._gridGraphModelObject.get('_plots').push(modelObject);

        //    }

        //    this.refreshView();

        //},

        /**
        *It is used to find opposite axis
        *
        *@private 
        *@method _getOppositeAxis
        *@param {String} input can be either 'x' or 'y'
        *@return {String} return 'y'if input param is 'x' and vice-versa.
        **/
        _getOppositeAxis: function getOppositeAxis(axis) {
            switch (axis) {
                case 'y':
                    return 'x';
                case 'x':
                    return 'y';
            }
        },

        /**
        *It is used to find index of axis
        *
        *@private 
        *@method _getOppositeAxis
        *@param {String} input can be either 'x' or 'y'
        *@return {Number} return 0 if input param is 'x' or 1 if input param is'y'.
        **/
        _getAxisIndex: function getAxisIndex(axis) {
            switch (axis) {
                case 'y':
                    return 1;
                case 'x':
                    return 0;
            }
        },

        _extendPathForConnection: function _extendPathForConnection(leftSegment, rightSegment) {
            var point1, point2, distance; //Point = this._paperScope.Point;

            point1 = leftSegment[0];
            point2 = rightSegment[0];
            if (point1 === undefined || point2 === undefined) {
                return;
            }
            distance = geomFunctions.distance(new this._paperScope.Point(point1[0], point1[1]), new this._paperScope.Point(point2[0], point2[1]));
            //            ////console.log('Curve start distance ' + distance);
            if (distance < 10) {
                leftSegment.unshift(point2);
            }

            point1 = leftSegment[leftSegment.length - 1];
            point2 = rightSegment[rightSegment.length - 1];


            distance = geomFunctions.distance(new this._paperScope.Point(point1[0], point1[1]), new this._paperScope.Point(point2[0], point2[1]));
            //            ////console.log('Curve end  distance ' + distance);
            if (distance < 50) {
                leftSegment.push(point2);
            }
            this.refreshView();
        },


        //solution index 1 or 2
        //function variable x or y
        _generatePoint: function _generatePoint(plotPoint, functionVariable, solutionIndex) {

            var arr = [];
            if (functionVariable !== 'y') {
                arr.push(plotPoint[0 + solutionIndex]);
                arr.push(plotPoint[0]);
            }
            else {
                arr.push(plotPoint[0]);
                arr.push(plotPoint[0 + solutionIndex]);
            }
            return arr;
        },



        //@param prevParam {array} Previous point on the curve.
        //@param currentParam {array} Current point on the curve.
        //@param nextParam {array} Next point on the curve.
        //@param paramVariable {character} Either x or y, specifiying whether y is displayed in terms of x or x is displayed in terms of y.
        _plottingPoints: function _plottingPoints(group, prevParam, currentParam, nextParam) {
            var dot; //Path = this._paperScope.Path;

            if (prevParam === null || currentParam === null) {
                return;
            }

            if ((currentParam[1] < prevParam[1] && currentParam[1] < nextParam[1]) || (currentParam[1] > prevParam[1] && currentParam[1] > nextParam[1])) {
                //                dot = new Path.Circle(new Point(currentParam[0], currentParam[1]), 2);
                //                dot.style = {
                //                    fillColor: 'black',
                //                    strokeColor: 'black'
                //                };


                dot = new this._paperScope.Path.Circle({
                    center: [currentParam[0], currentParam[1]],
                    radius: 2,
                    fillColor: '#666666',
                    strokeColor: '#666666'
                });
                group.addChild(dot);

                return;
            }
            else if ((currentParam[0] < prevParam[0] && currentParam[0] < nextParam[0]) || (currentParam[0] > prevParam[0] && currentParam[0] > nextParam[0])) {
                //                dot = new Path.Circle(new Point(currentParam[0], currentParam[1]), 2);
                //                dot.style = {
                //                    fillColor: 'black',
                //                    strokeColor: 'black'
                //                };
                dot = new this._paperScope.Path.Circle({
                    center: [currentParam[0], currentParam[1]],
                    radius: 2,
                    fillColor: '#666666',
                    strokeColor: '#666666'
                });
                group.addChild(dot);

                return;
            }
        },

        _getPointDiff: function _getPointDiff(array) {
            var lastPoint, secondLast;
            lastPoint = array[array.length - 1];
            secondLast = array[array.length - 2];
            return [lastPoint[0] - secondLast[0], lastPoint[1] - secondLast[1]];
        },
        _printorder: function _printorder(strprint, arrcolor) {
            arrcolor = undefined;
            strprint = undefined;
            //            console.log(strprint, arrcolor[0], undefined, arrcolor[1], undefined, arrcolor[2], undefined, arrcolor[3], undefined);
        },


        /**
        * return object which is required for saving graph state
        * @method getAttribute
        * @return {Object} contain state of graph
        */
        getAttribute: function getAttribute() {
            var object, model, clone;
            //generate copy of original object.
            clone = function (obj) {
                var temp, key;
                if (obj === null || typeof (obj) !== 'object') {
                    return obj;
                }

                temp = obj.constructor(); // changed
                //var temp = {};
                for (key in obj) {
                    temp[key] = clone(obj[key]);
                }
                return temp;
            };

            object = { markerBounds: {}, graphDisplay: {}, currentLimits: {}, graphOrigin: { currentOrigin: { x: {}, y: {} }, defaultOrigin: { x: {}, y: {} }, isOriginPositionChanged: null }, graphParameters: {}, zoomingFactor: {} };

            model = this._gridGraphModelObject.get('_graphDisplayValues');

            object.markerBounds = this._gridGraphModelObject.get('markerBounds');
            object.graphDisplay = model._graphDisplay;
            object.currentLimits = model._graphsAxisLimits.currentLimits;
            object.graphOrigin.currentOrigin.x = model._graphOrigin.currentOrigin.x;
            object.graphOrigin.currentOrigin.y = model._graphOrigin.currentOrigin.y;
            object.graphOrigin.defaultOrigin.x = model._graphOrigin.defaultOrigin.x;
            object.graphOrigin.defaultOrigin.y = model._graphOrigin.defaultOrigin.y;
            object.graphOrigin.isOriginPositionChanged = model._graphOrigin.isOriginPositionChanged;
            object.graphParameters = model._graphParameters;
            object.zoomingFactor = model._zoomingFactor;

            return clone(object);
        },
        /**
        * return object to save state
        * @method saveState
        * @return {Object} contain state of graph
        */
        saveState: function saveState() {
            return this.getAttribute();
        },
        /**
        * Retrieve graph state.
        * @method retrieveState
        * @param {Object} contain state of graph
        */
        retrieveState: function retrieveState(stateObject) {
            this.setAttribute(stateObject);
        },

        /**
        * Restore graph state.
        * @method setAttribute
        * @param {Object} contain state of graph
        */
        setAttribute: function (jsonObject) {
            //            var data = $.parseJSON(jsonObject);
            this._gridGraphModelObject.setModelAttribute(jsonObject);

            this._retrieveGraph();
        },

        /**
        * retrieve graph state
        * @method _retrieveGraph
        * @private
        */
        _retrieveGraph: function () {
            this._setBounds();
            //this._deltaAngle();

            //this.markerBounds = this._gridGraphModelObject.get('markerBounds');
            this._graphTypeSelector();
            //            this._shapeRedraw();
        },

        activateScope: function activateScope() {
            this._paperScope.activate();
        },

        drawPolygon: function drawPolygon(equationData) {
            this.activateScope();
            var pathGroup = equationData.getPathGroup();
            //paper = this._paperScope;
            if (equationData.getSpecie() === 'annotation') {
                this._projectLayers.annotationLayer.activate();
            }
            else {
                this._projectLayers.shapeLayer.activate();
                if (pathGroup !== null) {
                    this._removePathRollOverListeners(pathGroup);

                }
            }
            if (pathGroup !== null) {
                pathGroup.remove();
            }

            var modelObject,
                //Path = this._paperScope.Path,
                //Group = this._paperScope.Group,
                polygon = new this._paperScope.Path(),
                polygonhit,
                gridGraphPlots,
                polygonGroup = new this._paperScope.Group(),
                points,
                safePolygonPoints,
                //polygonHitGroup = new Group(),
                //allPoints,
                polygonStyle,
                coord,
                pointCounter,
                pointsLength,
                pointsCounter = 0,
                equationDataPoints = equationData.getPoints();

            if (equationData.isDraggable()) {
                polygonhit = new this._paperScope.Path();
                polygonhit.strokeColor = equationData.getDragHitColor();
                polygonhit.equation = equationData;
                polygonhit.strokeColor.alpha = equationData.getDragHitAlpha();
                polygonhit.equationID = equationData.getId();
                polygonhit.strokeWidth = equationData.getDragHitThickness();
                polygonhit.hit = true;
            }
            if (equationDataPoints === null) {
                return;
            }
            pointsLength = equationDataPoints.length;
            modelObject = this._gridGraphModelObject;
            gridGraphPlots = modelObject.get('_plots');
            if (gridGraphPlots.indexOf(equationData) === -1) {
                gridGraphPlots.push(equationData);
            }
            pointsLength = equationDataPoints.length;
            polygon.strokeColor = polygonGroup.strokeColor = equationData.getColor();
            polygon.strokeWidth = polygonGroup.strokeWidth = equationData.getThickness();
            polygon.opacity = polygonGroup.opacity = equationData.getOpacity();
            //reverse mapping of equationdata
            polygon.equation = equationData;
            polygon.visible = equationData.getCurveVisibility();
            polygonStyle = polygon.style;
            safePolygonPoints = [];
            if (equationData.getSpecie() !== 'annotation' && equationData.getRayPolygon()) {
                points = [];
                for (pointCounter = 1; pointCounter < pointsLength; pointCounter++) {
                    points.push(equationDataPoints[pointCounter - 1][0]);
                    points.push(equationDataPoints[pointCounter - 1][1]);
                    points.push(equationDataPoints[pointCounter][0]);
                    points.push(equationDataPoints[pointCounter][1]);
                }
                points = MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plottingFunctions.fitPointsInsideDomain({
                    domain: {
                        minX: this.markerBounds.min.x,
                        maxX: this.markerBounds.max.x,
                        minY: this.markerBounds.min.y,
                        maxY: this.markerBounds.max.y
                    }
                }, points);

            }
            else {
                points = equationDataPoints;
            }

            for (pointCounter = 0; pointCounter < pointsLength; pointCounter++) {
                if (equationData.getSpecie() === 'annotation') {
                    if ((equationDataPoints[pointCounter]) === undefined || (equationDataPoints[pointCounter] === null)) {

                        polygonGroup.addChild(polygon);

                        polygon = new this._paperScope.Path();
                        polygon.style = polygonStyle;
                        pointsCounter = 0;
                    }
                    else {
                        polygon.add(this._getCanvasPointCoordinates(equationDataPoints[pointCounter]));
                        if (polygonhit) {
                            polygonhit.add(this._getCanvasPointCoordinates(equationDataPoints[pointCounter]));
                        }
                        //polygon.smooth();
                    }
                }
                else {
                    if (equationData.getRayPolygon()) {
                        coord = [points[0][2 * pointCounter], points[0][2 * pointCounter + 1]];
                        polygon.add(this._getCanvasPointCoordinates(coord));
                        if (polygonhit) {
                            polygonhit.add(this._getCanvasPointCoordinates(coord));
                        }
                    }
                    else {
                        polygon.add(this._getCanvasPointCoordinates(points[pointCounter]));
                        if (polygonhit) {
                            polygonhit.add(this._getCanvasPointCoordinates(points[pointCounter]));
                        }
                    }


                }
            }

            if (equationData.isClosedPolygon() === true) {
                if (polygonhit) {
                    polygonhit.closed = true;
                }
                //polygon.add(this._getCanvasPointCoordinates(equationData.points[0]));
                polygon.closed = true;
            }
            if (equationData.isSmoothPolygon() === true) {
                polygon.smooth();
            }
            if (polygonhit) {
                polygonGroup.addChild(polygonhit);
            }
            polygonGroup.addChild(polygon);
            if (equationData.getSpecie() !== 'annotation') {
                this._setPathRollOverListeners(polygonGroup);
            }
            equationData.setPathGroup(polygonGroup);



            if (equationData.getLabelData().labelObject !== null) {
                this._updateLabelPosition(equationData);
                //equationData.trigger('pre-drag', this._getGraphPointCoordinates(canvasCoords), equationData, canvasCoords);
            }

            // this.addLabel(equationData);
            this.refreshView();
        },

        /**
        * removePlottedGraph removes plotted graph
        * @method removePlottedGraph
        * @return void
        */
        removePlottedGraph: function removePlottedGraph(equationData) {
            var pathGroup = equationData.getPathGroup();
            if (pathGroup) {
                this._removePathRollOverListeners(pathGroup);
                pathGroup.remove();
                equationData.setPathGroup(null);
            }
            this.refreshView();
        },

        /**
        * Change graph x-axis and y-axis upper and Lower limt if graph resize.
        * @method canvasResize
        * @return void
        */

        canvasResize: function () {
            this._paperScope.activate();

            var canvas = document.getElementById(this.ID.canvasId),
                modelObject = this._gridGraphModelObject,
                model = modelObject.get('_graphDisplayValues'),
                xMarkerLines = model._graphParameters.xGridLine,
                yMarkerLines = model._graphParameters.yGridLine,
                currentLimit = model._graphsAxisLimits.currentLimits,
                parameters = model._graphParameters,
                height = $(canvas).height(),
                width = $(canvas).width(),
                minDistanceBetweenHorizontalLines = model._graphParameters.currentDistanceBetweenTwoHorizontalLines,
                minDistanceBetweenVerticalLines = model._graphParameters.currentDistanceBetweenTwoVerticalLines,
                previousHeight = this._canvasSize.height,
                previousWidth = this._canvasSize.width,
                extraHeight = height - previousHeight,
                extraWidth = width - previousWidth,
                xExtraCount = 0, yExtraCount = 0,
                xPosition, yPosition;



            if (width > 0 && height > 0 && (extraHeight !== 0 || extraWidth !== 0)) {
                if (extraHeight !== 0) {
                    this._canvasSize.height = height;

                    yExtraCount = extraHeight / (minDistanceBetweenHorizontalLines * yMarkerLines) * model._zoomingFactor.yTotalMultiplier;
                    currentLimit.yLower = currentLimit.yLower - yExtraCount / 2;
                    currentLimit.yUpper = currentLimit.yUpper + yExtraCount / 2;
                    //                    currentLimit.yUpper = currentLimit.yLower + (height / minDistanceBetweenHorizontalLines) * (model._zoomingFactor.yTotalMultiplier / yMarkerLines);
                }

                if (extraWidth !== 0) {
                    this._canvasSize.width = width;

                    xExtraCount = extraWidth / (minDistanceBetweenVerticalLines * xMarkerLines) * model._zoomingFactor.xTotalMultiplier;
                    currentLimit.xLower = currentLimit.xLower - xExtraCount / 2;
                    currentLimit.xUpper = currentLimit.xUpper + xExtraCount / 2;
                    //                    currentLimit.xUpper = currentLimit.xLower + (width / minDistanceBetweenVerticalLines) * (model._zoomingFactor.xTotalMultiplier / xMarkerLines);
                }

                this._setBounds();

                this._setTextBoxValues();

                parameters = model._graphParameters;

                parameters.totalVerticalLines += extraWidth / minDistanceBetweenVerticalLines;
                parameters.totalHorizontalLines += extraHeight / minDistanceBetweenHorizontalLines;


                /* condition to decide initial origin Position*/
                if (currentLimit.xLower >= 0) {
                    xPosition = (0 - currentLimit.xLower);
                }
                else {
                    xPosition = Math.abs(currentLimit.xLower);
                }

                if (currentLimit.yUpper <= 0) {
                    yPosition = 0 - Math.abs(currentLimit.yUpper);
                }
                else {
                    yPosition = Math.abs(currentLimit.yUpper);
                }

                model._graphOrigin.currentOrigin = new this._paperScope.Point((((xPosition / model._zoomingFactor.xTotalMultiplier) * xMarkerLines) * minDistanceBetweenVerticalLines),
                                                                                                (((yPosition / model._zoomingFactor.yTotalMultiplier) * yMarkerLines) * minDistanceBetweenHorizontalLines));

                model._graphOrigin.defaultOrigin = new this._paperScope.Point(this._canvasSize.width / 2, this._canvasSize.height / 2);

                this._cartesionSymbolGenerator();

                this._deltaAngle();

                this._graphTypeSelector();

                if (modelObject.get('_plots').length !== 0) {
                    this._shapeRedraw();
                }
                if (modelObject.get('_points').length !== 0) {
                    this._repositionPoints();
                }
                this._paperScope.view.viewSize = [width, height];

                this.refreshView();
            }
        },

        /**
        * Return zoom distance and angle for graph double click.
        * @method _originShiftFactorForDoubleClick
        * @param {PointObject} double click point object
        * @private
        */
        _originShiftFactorForDoubleClick: function _originShiftFactorForDoubleClick(clickedPointGraphCoOrdinate) {

            var nextFactors = this._getNextMultipliers(),
                modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                zoomingFactors = graphDisplay._zoomingFactor,
                graphParameters = graphDisplay._graphParameters,
                currentOrigin = graphDisplay._graphOrigin.currentOrigin,
                nextXZoomLevel = zoomingFactors.currentXZoomLevel + this._ZOOM_LEVEL_INCREMENT_STEPS,
                nextYZoomLevel = zoomingFactors.currentYZoomLevel + this._ZOOM_LEVEL_INCREMENT_STEPS,
                zoomLevel = this._zoomLevelLimits(zoomingFactors.xTotalMultiplier, zoomingFactors.yTotalMultiplier),
                nextZoomLevels = this._zoomLevelLimits(nextFactors.xFactor.xTotalMultiplier, nextFactors.yFactor.yTotalMultiplier),
                verticalLinesDistance,
                horizontalLineDistance,
                xGridLines,
                yGridLines,
                xMultiplier,
                yMultiplier,
                currentClickedPoint,
                distance,
                angle,
                nextOriginPoint = {};

            if (nextXZoomLevel >= zoomLevel.xMaxZoomLevel) {
                nextXZoomLevel = nextZoomLevels.xMinZoomLevel;
                xGridLines = nextFactors.xFactor.xGridLine;
                xMultiplier = nextFactors.xFactor.xTotalMultiplier;
            }
            else {
                xGridLines = graphParameters.xGridLine;
                xMultiplier = zoomingFactors.xTotalMultiplier;
            }

            if (nextYZoomLevel >= zoomLevel.yMaxZoomLevel) {
                nextYZoomLevel = nextZoomLevels.yMinZoomLevel;
                yGridLines = nextFactors.yFactor.yGridLine;
                yMultiplier = nextFactors.yFactor.yTotalMultiplier;

            }
            else {
                yGridLines = graphParameters.yGridLine;
                yMultiplier = zoomingFactors.yTotalMultiplier;
            }

            verticalLinesDistance = nextXZoomLevel * graphParameters.distanceBetweenTwoVerticalLines;

            horizontalLineDistance = nextYZoomLevel * graphParameters.distanceBetweenTwoHorizontalLines;


            currentClickedPoint = this._getCanvasPointCoordinates(clickedPointGraphCoOrdinate);

            nextOriginPoint.x = currentClickedPoint[0] - clickedPointGraphCoOrdinate[0] * xGridLines * verticalLinesDistance / xMultiplier;
            nextOriginPoint.y = currentClickedPoint[1] + clickedPointGraphCoOrdinate[1] * yGridLines * horizontalLineDistance / yMultiplier;

            distance = Math.sqrt(Math.pow(nextOriginPoint.x - currentOrigin.x, 2) + Math.pow(nextOriginPoint.y - currentOrigin.y, 2));

            angle = this._angleBetweenTwoPoints(currentOrigin, nextOriginPoint) + Math.PI;

            return { distance: distance, angle: angle };
        },

        /**
        *Return object for next multiplier for zoom-in.
        *@method _getNextMultipliers
        *@private
        *@return {object} return factor for next x-marker and y-marker after zoom-in
        */
        _getNextMultipliers: function _getNextMultipliers() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                zoomingFactors = graphDisplay._zoomingFactor,
                factor = this._zoomFactors,
                xFactor = {},
                yFactor = {};

            switch (zoomingFactors.yCurrentFactor) {
                case factor[0]:
                    yFactor.yCurrentFactor = factor[2];
                    yFactor.yZoomMultiplier = zoomingFactors.yZoomMultiplier / 10;
                    yFactor.yTotalMultiplier = yFactor.yCurrentFactor * yFactor.yZoomMultiplier;
                    yFactor.yGridLine = 5;
                    break;

                case factor[1]:
                    yFactor.yCurrentFactor = factor[0];
                    yFactor.yZoomMultiplier = zoomingFactors.yZoomMultiplier;
                    yFactor.yTotalMultiplier = yFactor.yCurrentFactor * zoomingFactors.yZoomMultiplier;
                    yFactor.yGridLine = 4;
                    break;

                case factor[2]:
                    yFactor.yCurrentFactor = factor[1];
                    yFactor.yZoomMultiplier = zoomingFactors.yZoomMultiplier;
                    yFactor.yTotalMultiplier = yFactor.yCurrentFactor * zoomingFactors.yZoomMultiplier;
                    yFactor.yGridLine = 4;
                    break;
            }


            switch (zoomingFactors.xCurrentFactor) {
                case factor[0]:
                    xFactor.xCurrentFactor = factor[2];
                    xFactor.xZoomMultiplier = zoomingFactors.xZoomMultiplier / 10;
                    xFactor.xTotalMultiplier = xFactor.xCurrentFactor * xFactor.xZoomMultiplier;
                    xFactor.xGridLine = 5;
                    break;

                case factor[1]:
                    xFactor.xCurrentFactor = factor[0];
                    xFactor.xZoomMultiplier = zoomingFactors.xZoomMultiplier;
                    xFactor.xTotalMultiplier = xFactor.xCurrentFactor * zoomingFactors.xZoomMultiplier;
                    xFactor.xGridLine = 4;
                    break;

                case factor[2]:
                    xFactor.xCurrentFactor = factor[1];
                    xFactor.xZoomMultiplier = zoomingFactors.xZoomMultiplier;
                    xFactor.xTotalMultiplier = xFactor.xCurrentFactor * zoomingFactors.xZoomMultiplier;
                    xFactor.xGridLine = 4;
                    break;
            }

            return { xFactor: xFactor, yFactor: yFactor };
        },
        /**
        * Return value of _isGraphDefaultZoomBehaviourAllowed object
        * @method getDefaultZoomBehaviour
        * @return {Boolean} 
        */
        getDefaultZoomBehaviour: function getDefaultZoomBehaviour() {
            return this._isGraphDefaultZoomBehaviourAllowed;
        },
        /**
        * Set value of _isGraphDefaultZoomBehaviourAllowed object
        * @method setDefaultZoomBehaviour
        * @param {Boolean} isAllow  only boolean value allowed
        * @return {Boolean} 
        */
        setDefaultZoomBehaviour: function setDefaultZoomBehaviour(isAllow) {
            if (typeof (isAllow) === "boolean") {
                this._isGraphDefaultZoomBehaviourAllowed = isAllow;
            }
            return;
        },
        /**
        * Return value of _isGraphDefaultPanBehaviourAllowed object
        * @method getDefaultPanBehaviour
        * @return {Boolean} 
        */
        getDefaultPanBehaviour: function getDefaultPanBehaviour() {
            return this._isGraphDefaultPanBehaviourAllowed;
        },

        /**
        * Set value of _isGraphDefaultPanBehaviourAllowed object
        * @method setDefaultPanBehaviour
        * @param {Boolean} isAllow  only boolean value allowed
        * @return {Boolean} 
        */
        setDefaultPanBehaviour: function setDefaultPanBehaviour(isAllow) {
            if (typeof (isAllow) === "boolean") {
                if (isAllow === true) {
                    this.$el.attr('disabledCursor', this.$el.find('canvas').css('cursor'));
                    this.$el.find('canvas').css('cursor', 'pointer'/*this.$el.attr('disabledCursor')*/);
                }
                else if (isAllow === false) {
                    this.$el.find('canvas').css('cursor', 'default'/*this.$el.attr('disabledCursor')*/);
                    this.$el.removeAttr('disabledCursor');
                }

                this._isGraphDefaultPanBehaviourAllowed = isAllow;
            }
            return;
        },
        /**
        * Get Closest Point of given point.
        * @method getClosestGridPoint
        * @param {Point} 
        * @return {Point} 
        */
        getClosestGridPoint: function getClosestGridPoint(point, graphType) {
            var modelObject, graphDisplay, smallestXMultiplier, smallestYMultiplier, x, y,
                xGridLines, yGridLines, xMultiplier, yMultiplier, xMin, xMax, yMin, yMax, closerPoints = [], minDistance,
                counter, currentDistance, closestPoint, xSign = 1, ySign = 1, angleIncrement, currentAngle, minAngle, maxAngle, minRadius, maxRadius, radiusIncrement, radius,
            point1, point2, point3, point4, diagonalDistance;

            x = point[0];
            y = point[1];

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            xGridLines = graphDisplay._graphParameters.xGridLine;
            yGridLines = graphDisplay._graphParameters.yGridLine;

            xMultiplier = graphDisplay._zoomingFactor.xTotalMultiplier;
            yMultiplier = graphDisplay._zoomingFactor.yTotalMultiplier;

            if (graphType === undefined) {
                if (graphDisplay._graphDisplay.isCartesionCurrentGraphType) {
                    graphType = 'cartesian-graph';
                }
                else {
                    graphType = 'polar-graph';
                }
            }
            if (Math.abs(x) !== 0) {
                xSign = x / Math.abs(x);
            }
            if (Math.abs(y) !== 0) {
                ySign = y / Math.abs(y);
            }

            if (graphType === 'cartesian-graph') {
                smallestXMultiplier = xSign * xMultiplier / xGridLines;
                smallestYMultiplier = ySign * yMultiplier / yGridLines;

                xMin = x % smallestXMultiplier;
                xMax = smallestXMultiplier - xMin;

                yMin = y % smallestYMultiplier;
                yMax = smallestYMultiplier - yMin;


                closerPoints = [
                    [x - xMin, y - yMin],
                    [x + xMax, y - yMin],
                    [x - xMin, y + yMax],
                    [x + xMax, y + yMax]
                ];
            }
            else if (graphType === 'polar-graph') {

                angleIncrement = this._polarAngleIncrement();

                currentAngle = this.angleBetweenPoints(point, [0, 0], false);

                if (currentAngle < 0) {
                    currentAngle = 2 * Math.PI + currentAngle;
                }

                minAngle = currentAngle - currentAngle % angleIncrement;
                maxAngle = currentAngle + (angleIncrement - currentAngle % angleIncrement);


                radiusIncrement = xMultiplier / xGridLines;
                radius = Math.sqrt(Math.pow(point[0], 2) + Math.pow(point[1], 2));

                minRadius = radius - (radius % radiusIncrement);
                maxRadius = radius + (radiusIncrement - radius % radiusIncrement);

                point1 = [minRadius * Math.cos(maxAngle), minRadius * Math.sin(maxAngle)];
                point2 = [minRadius * Math.cos(minAngle), minRadius * Math.sin(minAngle)];
                point3 = [maxRadius * Math.cos(maxAngle), maxRadius * Math.sin(maxAngle)];
                point4 = [maxRadius * Math.cos(minAngle), maxRadius * Math.sin(minAngle)];

                closerPoints = [point1, point2, point3, point4];
            }


            diagonalDistance = geomFunctions.distance2(closerPoints[0][0], closerPoints[0][1], closerPoints[2][0], closerPoints[2][1]) * 0.4;

            for (counter = 0; counter < closerPoints.length; counter++) {
                currentDistance = Math.sqrt(Math.pow((x - closerPoints[counter][0]), 2) + Math.pow(y - closerPoints[counter][1], 2));

                if (minDistance === undefined) {
                    minDistance = currentDistance;
                    closestPoint = closerPoints[counter];
                }
                else if (currentDistance < minDistance) {
                    minDistance = currentDistance;
                    closestPoint = closerPoints[counter];
                }
            }
            if (minDistance > diagonalDistance) {
                return point;
            }
            else {
                return closestPoint;
            }
        },
        /**
        * Get Closest Point of given point in canvas-coOrdinate.
        * @method getClosestCanvasPoint
        * @param {Point} canvas-Point
        * @return {Point} closest point canvas co-ordinate
        */
        getClosestCanvasPoint: function (canvasPoint, graphType) {
            var closestCanvasPoint, gridPoint, closestGridPoint;

            gridPoint = this._getGraphPointCoordinates(canvasPoint);

            closestGridPoint = this.getClosestGridPoint(gridPoint, graphType);
            closestCanvasPoint = this._getCanvasPointCoordinates(closestGridPoint);
            return closestCanvasPoint;
        },

	 	/**
       *@method changeOriginPosition
       *@param {Array} point where new origin should be present
       */
        changeOriginPosition: function changeOriginPosition(point) {
            var modelObject, graphDisplay, currentOrigin;
            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            currentOrigin = graphDisplay._graphOrigin.currentOrigin;

            if (currentOrigin.x !== point[0] || currentOrigin.y !== point[1]) {
                graphDisplay._graphOrigin.currentOrigin = new this._paperScope.Point(point);


                this._graphLimitChangesDuringDragging();
                this._graphTypeSelector();

                this._deltaAngle();

                if (modelObject.get('_plots').length !== 0) {
                    this._shapeRedraw();
                }
                if (modelObject.get('_points').length !== 0) {
                    //this._redrawPoints();
                    this._repositionPoints();
                }

                this.refreshView();

            }
        },


        /**
        * return angle between two points.
        * @method angleBetweenPoints
        * @param {Array} first Point
        * @param {Array} second Point
        * @param {Boolean} true for angle to be in degree else radian
        */
        angleBetweenPoints: function (firstPointArray, secondPointArray, isDeg) {
            var x1, y1, x2, y2, ang;
            x1 = firstPointArray[0];
            y1 = firstPointArray[1];
            x2 = secondPointArray[0];
            y2 = secondPointArray[1];
            //var ang = Math.atan2(y1 - y2, x1 - x2) - Math.atan2(y3 - y2, x3 - x2);
            ang = Math.atan2(y1 - y2, x1 - x2);
            return isDeg ? ang * 180 / Math.PI : ang;
        },
        /**
        * Increment factor for polar angle lines.
        * as per desmos, number of angle lines are different if origin is at canvas and outside canvas
        * @method _polarAngleIncrement
        * @return angle increment factor
        */
        _polarAngleIncrement: function _polarAngleIncrement() {

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                currentOrigin = graphDisplay._graphOrigin.currentOrigin,
                canvasWidth = this._canvasSize.width,
                canvasHeight = this._canvasSize.height,
                angleCounter;

            if ((currentOrigin.x < canvasWidth && currentOrigin.x > 0) && (currentOrigin.y < canvasHeight && currentOrigin.y > 0)) {
                angleCounter = 15 * Math.PI / 180;
            }
            else {
                angleCounter = 5 * Math.PI / 180;
            }
            return angleCounter;
        },
        /**
        * set graph type to "no-grid","polar-grid' or "cartesian-graph'
        * @method setGraphType
        * @param {String} current graph type as "no-grid","polar-grid' or "cartesian-graph'
        */
        setGraphType: function setGraphType(graphType) {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            switch (graphType) {
                case 'no-grid':
                    graphDisplay._graphDisplay.isLabelShown = false;
                    graphDisplay._graphDisplay.isGridLineShown = false;
                    graphDisplay._graphDisplay.isAxisLinesShown = false;
                    this._graphTypeSelector();
                    break;
                case 'cartesian-graph':
                    graphDisplay._graphDisplay.isCartesionCurrentGraphType = true;
                    if (!(graphDisplay.isLabelShown || graphDisplay.isGridLineShown || graphDisplay.isAxisLinesShown)) {
                        graphDisplay._graphDisplay.isLabelShown = true;
                        graphDisplay._graphDisplay.isGridLineShown = true;
                        graphDisplay._graphDisplay.isAxisLinesShown = true;
                    }
                    this._graphTypeSelector();
                    break;
                case 'polar-graph':
                    graphDisplay._graphDisplay.isCartesionCurrentGraphType = false;
                    if (!(graphDisplay.isLabelShown || graphDisplay.isGridLineShown || graphDisplay.isAxisLinesShown)) {
                        graphDisplay._graphDisplay.isLabelShown = true;
                        graphDisplay._graphDisplay.isGridLineShown = true;
                        graphDisplay._graphDisplay.isAxisLinesShown = true;
                        this._graphTypeSelector();
                    }
                    break;
            }
        },
        /**
        * return graph type as "no-grid","polar-grid' or "cartesian-graph'
        * @method getGraphType
        * @return {String} current graph type as "no-grid","polar-grid' or "cartesian-graph'
        */
        getGraphType: function getGraphType() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            if (graphDisplay.isLabelShown || graphDisplay.isGridLineShown || graphDisplay.isAxisLinesShown) {
                return 'no-grid';
            }
            else if (graphDisplay.isCartesionCurrentGraphType) {
                return 'cartesian-graph';
            }
            else {
                return 'polar-graph';
            }
        },
        /**
        *return minimum graph Marker Values.
        *minimum Value between two adjecent grid lines.
        *
        * @method getMinimumMarkerValues
        * @return {Object} minimum value of x and y axis
        */
        getMinimumMarkerValues: function getMinimumMarkerValues() {
            var modelObject, graphDisplay, xMinMarker, yMinMarker, zoommingFactor, xGridLine, yGridLine;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');
            zoommingFactor = graphDisplay._zoomingFactor;
            xGridLine = graphDisplay._graphParameters.xGridLine;
            yGridLine = graphDisplay._graphParameters.yGridLine;

            xMinMarker = zoommingFactor.xTotalMultiplier / xGridLine;
            yMinMarker = zoommingFactor.yTotalMultiplier / yGridLine;
            return { xMinMarker: xMinMarker, yMinMarker: yMinMarker };
        },

		/**
        *return minimum graph Marker step value.
        *minimum Value between two adjecent marker linesthis.disableLineTooltip === true
        *
        * @method getMinimumSteps
        * @return {Object} minimum value of x and y axis
        */
        getMinimumSteps: function getMinimumSteps() {
            var markerValues = this.getMinimumMarkerValues(),
                xMarker = markerValues.xMinMarker * markerValues.xGridLines,
                yMarker = markerValues.yMinMarker * markerValues.yGridLines;
            return { xMarker: xMarker, yMarker: yMarker };
		},

        criticalPointsShowOnHover: function criticalPointsShowOnHover(pointsGroup, equationData) {
            if (pointsGroup === null) {
                return;
            }
            var child, eventPoint, temp,
                toolTips,
                pointCounter,
                noOfPoints,
                noOfToolTips,
                toolTipCoOrdinate,
                point,
            self = this;
            toolTips = self.$('.coordinate-tooltip[data-equation-cid="' + equationData.getCid() + '"]');
            noOfToolTips = toolTips.length;
            if (noOfToolTips !== 0) {
                noOfPoints = pointsGroup.children.length;
                for (pointCounter = 0; pointCounter < noOfPoints; pointCounter++) {
                    point = pointsGroup.children[pointCounter];
                    if (point.hit !== true) {
                        toolTipCoOrdinate = [self._getNumberForToolTip(point.data.point[0]), self._getNumberForToolTip(point.data.point[1])];
                        if (self.$(".coordinate-tooltip[data-point='" + toolTipCoOrdinate[0] + '-' + toolTipCoOrdinate[1] + "']").length != 0) {
                            point.fillColor = 'black';
                            point.opacity = 1;
                            point.data.selected = true;
                        }
                    }
                }
            }
            self.$('.hover-tooltip').remove();
            self.$el.removeClass('tool-tip-hover-cursor');
            //MathUtilities.Components.EquationEngine.Models.Profile.getStartTime('hoverpoints');
            pointsGroup.onMouseEnter = function (event) {
                //event.target.color = 'black';
                point = event.target;
                eventPoint = point.data.point;
                if (!point.hit) {
                    point.opacity = 1;
                    //point.fillColor = 'black';
                }
                else {
                    point = self._getPointPath(point.parent.children, point.data.point);
                    point.opacity = 1;
                    //point.fillColor = 'black';
                }
                self.showToolTipOnMouseEnter(eventPoint, event.target.id, equationData.getCid());
                self.$el.addClass('tool-tip-hover-cursor');
            };
            pointsGroup.onMouseLeave = function (event) {
                point = event.target;
                if (!point.hit) {
                    if (point.data.selected !== true) {
                        point.opacity = 0.5;
                        point.fillColor = '#8D8D8D';
                    }
                }
                else {
                    point = self._getPointPath(point.parent.children, point.data.point);
                    if (point.data.selected !== true) {
                        point.opacity = 0.5;
                        point.fillColor = '#8D8D8D';
                    }
                }

                if (parseInt(self.$el.find('.hover-tooltip').attr('event-id')) === event.target.id) {
                    self.$('.hover-tooltip').remove();
                }
                self.$el.removeClass('tool-tip-hover-cursor');
            };

            pointsGroup.onMouseUp = function (event) {
                point = event.target;
                eventPoint = point.data.point;
                if (!point.hit) {
                    if (self.isSnap === false) {
                        return;
                    }
                    point.fillColor = 'black';
                    point.data.selected = true;
                }
                else {
                    point = self._getPointPath(point.parent.children, point.data.point);
                    if (self.isSnap === false) {
                        return;
                    }
                    point.fillColor = 'black';
                    point.data.selected = true;
                }
                toolTipCoOrdinate = [self._getNumberForToolTip(point.data.point[0]), self._getNumberForToolTip(point.data.point[1])];
                self.showToolTipForPoint(point.bounds.center, [toolTipCoOrdinate[0], 0], [toolTipCoOrdinate[1], 0], false, point.equation.getCid());
                self.isSnap = false;
            }
            //console.log('processing time =' + MathUtilities.Components.EquationEngine.Models.Profile.getProcessingTime('hoverpoints'));
        },

        _getPointPath: function _getPointPath(points, point) {
            var pointCounter,
                noOfpoints = points.length;
            for (pointCounter = 0; pointCounter < noOfpoints; pointCounter++) {
                if (points[pointCounter].hit !== true && points[pointCounter].data.point[0] === point[0] && points[pointCounter].data.point[1] === point[1]) {
                    return points[pointCounter];
                }
            }
        },

        showToolTipOnMouseEnter: function showToolTipOnMouseEnter(point, eventId, equationCid) {
            //if(this.$('.coordinate-tooltip').attr('data-equation-cid')===equationCid && this.$(".coordinate-tooltip[top-pointx='"+ point.x+"']").length!=0 ){
            point = this._getCanvasPointCoordinates(point);
            var $canvas = this.$('#' + this.ID.canvasId),
                canvasPosition = $canvas.position(),
                $tooltip = $('<div></div>').css({
                    'position': 'absolute',
                    'top': canvasPosition.top + point[1] + 'px',
                    'left': canvasPosition.left + point[0] + 'px'
                }).attr('class', 'hover-tooltip'),
                tooltipText, displayPoint, tempx, tempy,
                self = this;
            $tooltip.attr('data-equation-cid', equationCid);
            if (self.$('.drag-tooltip').length !== 0) {
                self.$('.drag-tooltip').hide();
            }
            displayPoint = self._getGraphPointCoordinates(point);
            tempx = self._getNumberForToolTip(displayPoint[0]);
            tempy = self._getNumberForToolTip(displayPoint[1]);
            tooltipText = tempx;
            tooltipText += ',&nbsp;' + tempy;
            $tooltip.html(tooltipText);
            $tooltip.attr('event-id', eventId);
            if (this.$(".coordinate-tooltip[data-point='" + tempx + '-' + tempy + "']").length != 0) {
                console.log('return');
                return;
            }

            this.$el.append($tooltip);

            $tooltip.css('top', $tooltip.position().top - (2 * $tooltip.height()));

            if ($tooltip.position().top < canvasPosition.top) {
                $tooltip.remove();
            }
        },

        /**
        * start double click zoom behaviour of graph
        * @method startDoubleClickZoom
        */
        startDoubleClickZoom: function startDoubleClickZoom() {
            this._gridGraphModelObject.get('_graphDisplayValues')._zoomingFactor.doubleClickZoomAllow = true;
        },
        /**
        * stop double click zoom behaviour of graph
        * @method stopDoubleClickZoom
        */
        stopDoubleClickZoom: function stopDoubleClickZoom() {
            this._gridGraphModelObject.get('_graphDisplayValues')._zoomingFactor.doubleClickZoomAllow = false;
        },

        //TODO: make this implementation accurate
        /**
        * set graph Limits and adjust marker value
        * @method _setGraphLimits
        * @param xLower {Number} lower limit of x-axis
        * @param xUpper {Number} Upper limit of x-axis
        * @param yLower {Number} lower limit of y-axis
        * @param yUpper {Number} Upper limit of y-axis
        */
        _setGraphLimits: function _setGraphLimits(xLower, xUpper, yLower, yUpper) {
            var model = this._gridGraphModelObject,
                displayProperties = model.get('_graphDisplayValues'),
                currentLimits = displayProperties._graphsAxisLimits.currentLimits,
                origins = displayProperties._graphOrigin,
                graphCenterPoint, currentGraphOrigin;

            xLower = parseFloat(xLower);
            yLower = parseFloat(yLower);
            xUpper = parseFloat(xUpper);
            yUpper = parseFloat(yUpper);

            //if limits not in proper format return
            if (xLower >= xUpper || yLower >= yUpper) {
                return;
            }

            //set value
            currentLimits.xLower = xLower;
            currentLimits.xUpper = xUpper;
            currentLimits.yLower = yLower;
            currentLimits.yUpper = yUpper;


            this._setDistanceBetweenLines();

            //calculate origin position
            this._originPositionOnGraph();


            graphCenterPoint = origins.defaultOrigin;
            currentGraphOrigin = origins.currentOrigin;

            if (graphCenterPoint.x === currentGraphOrigin.x && graphCenterPoint.y === currentGraphOrigin.y) {
                origins.isOriginPositionChanged = false;
            }
            else {
                origins.isOriginPositionChanged = true;
            }

            this._setBounds();
        },
        /**
        * calculate starting zoom-level value,considering min-zoom distance.
        * @method _setDistanceBetweenLines
        * @private
        */
        _setDistanceBetweenLines: function _setDistanceBetweenLines() {

            var model = this._gridGraphModelObject,
                displayProperties = model.get('_graphDisplayValues'),
                zoomingFactor = displayProperties._zoomingFactor,
                distance = displayProperties._graphParameters,
                currentLimits = displayProperties._graphsAxisLimits.currentLimits,
                isXModify = false,
                isYModify = false,
                minimumDistance, maximumDistance, minMaxFactor, currentZoomLevel,
                distance0, distance1, xIteration = 1, yIteration = 1,
                xPreviousIteration = [], yPreviousIteration = [],
                min_Zoom_Level = this._MINIMUM_ZOOM_LEVEL_FACTOR,
                zoomLevel, modify,
                Increment_Step = this._ZOOM_LEVEL_INCREMENT_STEPS;


            var adjustDistance = function adjustDistance(minDistance, maxDistance, minZoomLevel, maxZoomLevel, lineDistance) {
                currentZoomLevel = parseFloat(minZoomLevel.toFixed(4));
                while (currentZoomLevel <= maxZoomLevel) {
                    distance0 = minZoomLevel / currentZoomLevel * lineDistance;
                    distance1 = maxZoomLevel / currentZoomLevel * lineDistance;
                    if (distance0 >= minDistance && distance1 <= maxDistance) {
                        zoomLevel = currentZoomLevel;
                        modify = true;
                    }
                    currentZoomLevel += Increment_Step;
                    currentZoomLevel = parseFloat(currentZoomLevel.toFixed(4))
                }
            };


            modify = false;
            while (!modify) {
                //calculate distance between vertical lines
                this._distanceBetweenLinesCalculator();

                minMaxFactor = this._zoomLevelLimits();

                if (distance.distanceBetweenTwoVerticalLines < minMaxFactor.xMinDistance) {
                    this._xAxisZoomFactorModifier(true);
                    xIteration++;
                }
                else {
                    adjustDistance(minMaxFactor.xMinDistance, minMaxFactor.xMaxDistance, minMaxFactor.xMinZoomLevel, minMaxFactor.xMaxZoomLevel, distance.distanceBetweenTwoVerticalLines);

                    if (!modify) {
                        this._xAxisZoomFactorModifier(false);
                        xIteration--;
                    }
                }
                //value is in infinite loop
                if (xPreviousIteration.indexOf(xIteration) !== -1) {
                    adjustDistance(minMaxFactor.xExtraMinDistance, minMaxFactor.xExtraMaxDistance, minMaxFactor.xMinZoomLevel, minMaxFactor.xMaxZoomLevel, distance.distanceBetweenTwoVerticalLines);
                }
                xPreviousIteration.push(xIteration);
            }

            zoomingFactor.currentXZoomLevel = zoomLevel;

            //y-axis limits
            modify = false;
            while (!modify) {
                //calculate distance between vertical lines
                this._distanceBetweenLinesCalculator();

                minMaxFactor = this._zoomLevelLimits();

                if (distance.distanceBetweenTwoHorizontalLines < minMaxFactor.yMinDistance) {
                    this._yAxisZoomFactorModifier(true);
                    yIteration++;
                }
                else {
                    adjustDistance(minMaxFactor.yMinDistance, minMaxFactor.yMaxDistance, minMaxFactor.yMinZoomLevel, minMaxFactor.yMaxZoomLevel, distance.distanceBetweenTwoHorizontalLines);

                    if (!modify) {
                        this._yAxisZoomFactorModifier(false);
                        yIteration--;
                    }
                }

                //value is in infinite loop
                if (!modify && yPreviousIteration.indexOf(yIteration) !== -1) {
                    adjustDistance(minMaxFactor.yExtraMinDistance, minMaxFactor.yExtraMaxDistance, minMaxFactor.yMinZoomLevel, minMaxFactor.yMaxZoomLevel, distance.distanceBetweenTwoHorizontalLines);
                }
                yPreviousIteration.push(yIteration);
            }
            zoomingFactor.currentYZoomLevel = zoomLevel;


            distance.distanceBetweenTwoVerticalLines = distance.distanceBetweenTwoVerticalLines / zoomingFactor.currentXZoomLevel;
            distance.distanceBetweenTwoHorizontalLines = distance.distanceBetweenTwoHorizontalLines / zoomingFactor.currentYZoomLevel;
        },

        /**
        * Draw Graph
        * @method drawGraph
        */
        drawGraph: function drawGraph() {
            this._graphTypeSelector();
        },

        /**
        * As per desmos zoom min-max level and distance is different for marker values multliple of 5,
        * this function returns zoom-levels and distance for different marker text
        * @method _zoomLevelLimits
        * @param xMultiplierValue {Number} x-axis Marker values, if not given will take graph current multiplier
        * @param yMultiplierValue {Number} y-axis Marker values, if not given will take graph current multiplier
        * @return {Objcet} contains min-max zoomLevels and distances
        * @private
        */
        _zoomLevelLimits: function _zoomLevelLimits(xMultiplierValue, yMultiplierValue) {
            var model = this._gridGraphModelObject,
                displayProperties = model.get('_graphDisplayValues'),
                zoomingFactor = displayProperties._zoomingFactor,
                xMultiplier = zoomingFactor.xTotalMultiplier,
                yMultiplier = zoomingFactor.yTotalMultiplier,
                xFactors, yFactors, xGridLines, yGridLines,
                MarkerLinesObject = this.GRID_LINES,
                stepsforFive = this._ZOOM_STEPS_FOR_FIVE_MULTIPLIER,
                defaultSteps = this._ZOOM_STEPS,
                minimumZoomLevel = this._MINIMUM_ZOOM_LEVEL_FACTOR,
                incrementValue = this._ZOOM_LEVEL_INCREMENT_STEPS,
                adjecentMinDistance = this._ADJECENT_LINES_MIN_DISTANCE,
                zoomDistance = this._ZOOM_DISTANCE,
                levelFunct;

            xMultiplier = xMultiplierValue ? xMultiplierValue : xMultiplier;
            yMultiplier = yMultiplierValue ? yMultiplierValue : yMultiplier;

            xGridLines = this._numberOfMarkerLines(xMultiplier);
            yGridLines = this._numberOfMarkerLines(yMultiplier);

            levelFunct = function levelFunct(lines) {
                var minDistance, maxDistance, minZoomLevel, maxZoomLevel, extraMinZoomDistance, extraMaxDistance, extraMinDistance;
                if (lines === MarkerLinesObject.FIVE_MULTIPLIER) {
                    minDistance = adjecentMinDistance;
                    maxDistance = minDistance + zoomDistance * stepsforFive;
                    //maxDistance = minDistance + zoomDistance;
                    minZoomLevel = minimumZoomLevel;
                    maxZoomLevel = minZoomLevel + incrementValue * stepsforFive;
                    extraMaxDistance = maxDistance + zoomDistance;
                    extraMinDistance = minDistance - zoomDistance;
                }
                else {
                    minDistance = adjecentMinDistance + zoomDistance;
                    maxDistance = minDistance + zoomDistance * defaultSteps;
                    //maxDistance = minDistance + zoomDistance;
                    minZoomLevel = minimumZoomLevel + incrementValue;
                    maxZoomLevel = minZoomLevel + incrementValue * defaultSteps;
                    extraMaxDistance = maxDistance + zoomDistance;
                    extraMinDistance = minDistance - zoomDistance;
                }
                return {
                    minDistance: minDistance,
                    maxDistance: maxDistance,
                    minZoomLevel: minZoomLevel,
                    maxZoomLevel: maxZoomLevel,
                    extraMaxDistance: extraMaxDistance,
                    extraMinDistance: extraMinDistance
                }
            }

            xFactors = levelFunct(xGridLines);
            yFactors = levelFunct(yGridLines);

            return {
                xMinDistance: xFactors.minDistance,
                xMaxDistance: xFactors.maxDistance,
                xMinZoomLevel: xFactors.minZoomLevel,
                xMaxZoomLevel: xFactors.maxZoomLevel,
                xExtraMaxDistance: xFactors.extraMaxDistance,
                xExtraMinDistance: xFactors.extraMinDistance,
                yMinDistance: yFactors.minDistance,
                yMaxDistance: yFactors.maxDistance,
                yMinZoomLevel: yFactors.minZoomLevel,
                yMaxZoomLevel: yFactors.maxZoomLevel,
                yExtraMaxDistance: yFactors.extraMaxDistance,
                yExtraMinDistance: yFactors.extraMinDistance
            }
        },

        /**
        * set model bounds object value as limits of graph.
        * @method _setBounds
        * @private
        */
        _setBounds: function _setBounds() {
            var modelbounds = this._gridGraphModelObject.get('markerBounds'),
                bounds = this.markerBounds,
                limits = this._gridGraphModelObject.get('_graphDisplayValues')._graphsAxisLimits.currentLimits;

            modelbounds.max.x = bounds.max.x = limits.xUpper;
            modelbounds.min.x = bounds.min.x = limits.xLower;
            modelbounds.max.y = bounds.max.y = limits.yUpper;
            modelbounds.min.y = bounds.min.y = limits.yLower;

            this._deltaAngle();
        },

        /**
        * return graph axis limits
        * @method getLimits
        * @return {Object} it contains value of xLower, xUpper, yLower, yUpper
        */
        getLimits: function getLimits() {
            var modelbounds = this._gridGraphModelObject.get('markerBounds');

            return {
                xLower: modelbounds.min.x,
                xUpper: modelbounds.max.x,
                yLower: modelbounds.min.y,
                yUpper: modelbounds.max.y
            }
        },

        /**
        * set graph limits
        * @method setLimits
        * @param xLower {Number} lower limit of x-axis
        * @param xUpper {Number} Upper limit of x-axis
        * @param yLower {Number} lower limit of y-axis
        * @param yUpper {Number} Upper limit of y-axis
        */
        setLimits: function setLimits(xLower, xUpper, yLower, yUpper) {
            if (!(isNaN(parseFloat(xUpper)) || isNaN(parseFloat(xLower)) || isNaN(parseFloat(yLower)) || isNaN(parseFloat(yUpper)))) {
                this._setGraphLimits(xLower, xUpper, yLower, yUpper);
            }
        },
        /**
        * Calculate absolute distance between two points
        * @method _distanceBetweenPoints
        * @param point1 {object} point object of first point
        * @param point2 {object} point object of second point
        */
        _distanceBetweenPoints: function _distanceBetweenPoints(point1, point2) {
            return Math.sqrt((point2.y - point1.y) * (point2.y - point1.y) + (point2.x - point1.x) * (point2.x - point1.x));
        },
        /**
        * Convert to Canvas-coordinate
        * @method convertToCanvasCoordinate
        * @param {Array} Point co-ordinate.
        * @return {Array} Point's canvas coordinate.
        */
        convertToCanvasCoordinate: function convertToCanvasCoordinate(graphPoint) {
            return this._getCanvasPointCoordinates(graphPoint);
        },
        /**
        * Convert to Graph-coordinate
        * @method convertToGraphCoordinate
        * @param {Array} Point co-ordinate.
        * @return {Array} Point's Graph coordinate.
        */
        convertToGraphCoordinate: function convertToGraphCoordinate(canvasPoint) {
            return this._getGraphPointCoordinates(canvasPoint);
        },

		hideGridLines: function hideGridLines() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isGridLineShown = false;

            this._graphTypeSelector();
        },

        hideLabels: function hideLabels() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isLabelShown = false;

            this._graphTypeSelector();
        },

        hideAxis: function hideAxis() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isAxisLinesShown = false;

            this._graphTypeSelector();
        }


    }, {
		/**
         * Holds amount by which the labels are padded when axis are not displayed (only for Y-axis labels)
         * @property AXIS_LABEL_RIGHT_PADDING
         * @static
        */
        AXIS_LABEL_RIGHT_PADDING: 5,
        /**
         * Holds amount by which the labels are padded when axis are not displayed (only for X-axis labels)
         * @property AXIS_LABEL_BOTTOM_PADDING
         * @static
        */
        AXIS_LABEL_BOTTOM_PADDING: 3
	
	});

}(window.MathInteractives));
