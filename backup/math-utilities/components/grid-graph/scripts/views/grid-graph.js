/* globals _, $, paper, window, geomFunctions  */

(function(MathUtilities) {
    'use strict';

    /**
     *@class GridGraph
     *@extends Backbone.View
     */
    MathUtilities.Components.Graph.Views.GridGraph = Backbone.View.extend({

        /**
         * Whether graph pan action performed or not.
         * @property _shapePan
         * @type {Boolean}
         */
        "_shapePan": null,

        /**
         * Store project layers, it contain different layer object of paper
         * @property _projectLayers
         * @type {Object}
         */
        "_projectLayers": null,

        /**
         *Contain graphs axis Limits
         *
         * @property  markerBounds
         * @type {Object}
         */
        "markerBounds": null,

        /**
         * Store paper-scope for graph view
         *
         * @property _paperScope
         * @type {object}
         * @static
         */
        "_paperScope": null,

        /**
         * Store value of canvas width and height.
         *
         * @property  _canvasSize
         * @type {Object}
         * @static
         */
        "_canvasSize": null,

        /**
         * It contains array for storing values of polar angles in radian and degrees
         *
         * @property  _polarLineAngleMarker
         * @type {Object}
         * @static
         */
        "_polarLineAngleMarker": null,

        /**
         * It is array of values which are used as zooming factor,
         *
         * @property  _zoomFactors
         * @type Number
         * @static
         */
        "_zoomFactors": [1, 2, 5],

        /**
        Used when _useScrollBarsForPanning is set.
        **/
        "_visibleDomain": null,

        "_scrollBarManager": null,

        /**
         * It contain horizontal and vertical alignment string.
         *
         *@property TEXT_ALIGN
         *@type Object
         *@static
         */
        "TEXT_ALIGN": {
            "HORIZONTAL": {
                "LEFT": 'left',
                "RIGHT": 'right',
                "CENTER": 'center'
            },
            "VERTICAL": {
                "TOP": 'top',
                "BOTTOM": 'bottom',
                "MIDDLE": 'middle'
            }
        },

        /**
         * It contain symbol for representing PI value.
         *
         * @property  PI
         * @type String
         * @Final
         */
        "PI": '\u03C0',

        /**
         * it contain minimum value,allowed between graph lines.
         * @property  ADJACENT_LINES_MIN_DISTANCE
         * @type Number
         * @Final
         */
        //Do not change this value.
        "_ADJACENT_LINES_MIN_DISTANCE": 14,

        /**
         * distance between adjacent lines.
         * @property  _ZOOM_DISTANCE
         * @type Number
         * @Final
         */
        //Do not change this value.
        "_ZOOM_DISTANCE": 3,

        /**
         * Minimum level for graph zoom.
         *
         * @property  _MINIMUM_ZOOM_LEVEL_FACTOR
         * @type {Object}
         */
        "_MINIMUM_ZOOM_LEVEL_FACTOR": 0.65,

        /**
         * Value by which graph zoom level change.
         *
         * @property  _ZOOM_LEVEL_INCREMENT_STEPS
         * @type {Object}
         */
        //zoom Level increment-decrement step
        "_ZOOM_LEVEL_INCREMENT_STEPS": 0.1,

        /**
         * store value of number of steps if marker value is multiplier of 2 or 10
         * As per desmos, if marker value is multiplier of 2 or 10, then zoom Steps are 6
         * @property  _ZOOM_STEPS
         * @type {Object}
         */
        "_ZOOM_STEPS": 6,

        /**
         * store value of number of steps if marker value is in multiplier of 5
         * As per desmos, if marker value is multiplier of 5, then zoom Steps are 8
         * @property  _ZOOM_STEPS_FOR_FIVE_MULTIPLIER
         * @type {Object}
         */
        "_ZOOM_STEPS_FOR_FIVE_MULTIPLIER": 8,

        /**
         * store value of number of grid lines for two adjacent marker value
         * As per desmos, if marker value is multiplier of 5, then grid lines are 5 else 4
         * @property  GRID_LINES
         * @type {Object}
         */
        "GRID_LINES": {
            "DEFAULT": 4,
            "FIVE_MULTIPLIER": 5
        },
        /**
         * Contains value of font style for marker.
         * @method MARKER_FONT
         * @type {Object}
         */
        "MARKER_FONT": null,

        /**
         * It contain grid-graph model.
         * @property _gridGraphModelObject
         * @type  MathUtilities.Components.Graph.Models.GridGraphModel
         */
        "_gridGraphModelObject": null,

        "snapToGridFlag": null,

        "isDragInProgress": null,

        "_X10_STRING": '\u00D710',

        "_selectionRect": null,
        "_touchDoubleTapCounter": null,
        "_DOUBLE_TAP_THRESHOLD": 600,
        "_pinchCounter": null,
        "pointerTouches": null,
        "_criticalPointsProperties": null,
        "_discontinuosPointsProperties": null,
        "customGridbg": null,
        "isCustomModeOn": null,

        //FIRST CLICK NOT IMPLEMENTED
        "INPUT_MODE_FIRST_CLICK": 1,
        "INPUT_MODE_DOUBLE_CLICK": 2,
        "INPUT_MODE_MOUSEWHEEL": 4,
        "_openInputMode": null,
        "pointIndicatorPositionObject": null,
        "onMouseDrag": null,
        "dontBindEvents": null,
        /**
         * Maximum value by which graph can be shift.
         *
         * @property  _GRAPH_SHIFT_DISTANCE
         * @type {Object}
         */
        //standard distance for origin shift when zoom-in or zoom out
        "_GRAPH_SHIFT_DISTANCE": 50,

        /**
         * Distance by which graph should be shift during zoom-in and zoom-out
         *
         * @property  graphShiftDistance
         * @type {Object}
         */
        "graphShiftDistance": null,

        "isSnap": false,

        /**
         * Determines whether drawn points, shapes on graph are draggable or not.
         *
         * @property  isDrawingsDraggable
         * @type {boolean}
         */
        "isDrawingsDraggable": null,

        /**
         * Determines whether to show tool tip when point is clicked
         *
         * @property  isDrawingsDraggable
         * @type {boolean}
         */
        "isTooltipForPoint": null,

        /**
         * Determines whether double click has to be dispatched or not.
         *
         *@property _dispatchDoubleClick
         *@type {boolean}
         */
        "_dispatchDoubleClick": true,

        "_lastActiveLayer": null,

        "events": {
            "click": "_functionAttacher",
            "keyup": "_functionAttacher",
            "mousewheel": "_functionAttacher"
        },

        "resetGridMode": function() {
            this._gridGraphModelObject.set('_gridMode', 'Graph');
        },

        "getGridMode": function() {
            return this._gridGraphModelObject.get('_gridMode');
        },

        "setGridMode": function(gridMode) {
            this._gridGraphModelObject.set('_gridMode', gridMode);
        },

        "isSnapToGridEnabled": function() {
            return this.snapToGridFlag;
        },

        "setSnapSnapToGridFlag": function(flag) {
            this.snapToGridFlag = flag;
        },

        "_isGridRefreshPaused": null,
        "_isGridRefreshPausedLevel2": null,

        "restrainViewRefreshByModule": function(moduleName) {
            if (this._viewRefreshBlockers.indexOf(moduleName) === -1) {
                this._viewRefreshBlockers.push(moduleName);
            }
        },

        "freeViewRefreshByModule": function(moduleName) {
            var index = this._viewRefreshBlockers.indexOf(moduleName);
            if (index > -1) {
                this._viewRefreshBlockers.splice(index, 1);
            }
            this.refreshView();
        },

        "pauseGridRefreshLevel2": function() {
            this._isGridRefreshPausedLevel2 = true;
        },

        "resumeGridRefreshLevel2": function() {
            this._isGridRefreshPausedLevel2 = false;
        },

        "pauseGridRefresh": function() {
            this._isGridRefreshPaused = true;
        },

        "resumeGridRefresh": function() {
            this._isGridRefreshPaused = false;
        },

        /**
         *It is used to call different functions depending upon user action.
         *@private
         *@method _functionAttacher
         *@param {Object} event An user action,it can be click,keyup,mousewheel,double-click.
         *@param {Number} delta It will have an integer value for mouseWheel event,for other events its value will be undefined
         */

        /*attach different function to different click event*/
        "_functionAttacher": function(event, delta) {
            var id = this._gridGraphModelObject.get('ID'),
                keyCode,
                keyCodesToBeNeglected,
                option = this._gridGraphModelObject.get('settingsOption'),
                $target = $(event.target).hasClass('acc-read-elem') || !$(event.target).is('div') ? $(event.target).parent() : $(event.target),
                currentOption = $target.attr('data-setting-option'),
                panBehaviour = null,
                ZOOM_FACTOR = 100;
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
                        case option.equalizeAxisScaleLabel:
                            this.equalizeAxis();
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
                            // this condition is added so that, cursor doesn't change its position in textboxes,
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
                    keyCodesToBeNeglected = [37, 38, 39, 40, 13, 9, 20, 27, 33, 34, 35, 36, 45];
                    switch (currentOption) {
                        case option.XLowerTextBox:
                        case option.XUpperTextBox:
                            if (keyCodesToBeNeglected.indexOf(keyCode) === -1) {
                                this._graphAxisLimitChangedByUserInput(true);
                            }
                            break;

                        case option.YLowerTextBox:
                        case option.YUpperTextBox:
                            if (keyCodesToBeNeglected.indexOf(keyCode) === -1) {
                                this._graphAxisLimitChangedByUserInput(false);
                            }
                            break;
                    }
                    break;

                case 'mousewheel':
                    if (!this.isInputModeEnabled(this.INPUT_MODE_MOUSEWHEEL)) {
                        return;
                    }
                    switch (event.target.id) {
                        case id.canvasId:
                        case 'canvas-event-listener': // For dgt's Event Listener canvas...
                            if (!this._gridGraphModelObject.get('_useScrollBarsForPanning') || event.shiftKey) {
                                if (this._gridGraphModelObject.get('_isGraphDefaultZoomBehaviourAllowed') === true && this._gridGraphModelObject.get('_gridMode') === 'Graph') {
                                    //store previous pan behavior and apply is after zoom complete
                                    panBehaviour = this.getDefaultPanBehaviour();
                                    this.setDefaultPanBehaviour(false);
                                    this._zoomGraph(delta, true);
                                    this.setDefaultPanBehaviour(panBehaviour);
                                    //to prevent page mouse-wheel
                                    event.preventDefault();
                                }
                            } else if (this._gridGraphModelObject.get('_gridMode') === 'Graph') {
                                if (event && event.originalEvent && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                                    event.originalEvent.wheelDelta = delta * ZOOM_FACTOR;
                                }
                                this.onMouseDrag(event);
                                //to prevent page mouse-wheel
                                event.preventDefault();
                            }

                            break;
                        default:
                            if ($(event.target).hasClass('coordinate-tooltip')) {
                                MathUtilities.Components.EquationEngine.Models.Profile.getStartTime('graph');

                                if (this._gridGraphModelObject.get('_isGraphDefaultZoomBehaviourAllowed') === true && this._gridGraphModelObject.get('_gridMode') === 'Graph') {
                                    this.setDefaultPanBehaviour(false);
                                    this._zoomGraph(delta, true);
                                    this.setDefaultPanBehaviour(true);

                                    //to prevent page mouse-wheel
                                    event.preventDefault();
                                }
                            }
                            break;
                    }
                    break;
            }
        },
        "stealNextMouseDown": function(func) {
            this._mouseDownSteal = func;
        },

        /**
         * trigger if graph is equalize or not
         * @method _triggerEqualizeEvent
         * @param {Boolean} isGraphNotEqualize true if graph equalize, else unequalized
         */

        "_triggerEqualizeEvent": function(isGraphNotEqualize) {
            if (isGraphNotEqualize) {
                this.trigger('graph:un-equalize');
            } else {
                this.trigger('graph:equalize');
            }
        },

        "initialize": function() {
            this.markerBounds = {
                "max": {
                    "x": null,
                    "y": null,
                    "\\theta": null
                },
                "min": {
                    "x": null,
                    "y": null,
                    "\\theta": null
                }
            };
            this._viewRefreshBlockers = [];
            this._openInputMode = 7;
            this._projectLayers = {
                "gridLayer": null,
                "shapeLayer": null,
                "pointLayer": null,
                "imageLayer": null,
                "serviceLayer": null,
                "textLayer": null
            };
            this._canvasSize = {
                "height": null,
                "width": null
            };
            this._polarLineAngleMarker = {
                "degree": [],
                "radian": []
            };
            this.pointIndicatorPositionObject = {};
            var option = this.options.option,
                target, equation, currentlimits,
                frameSize, screenSize;
            this._gridGraphModelObject = new MathUtilities.Components.Graph.Models.GridGraphModel();
            this.dontBindEvents = option.dontBindEvents;
            this._defaultClassVariblesValue();
            this._updateClassVariablesValue(option);

            this.isDragInProgress = false;

            this.snapToGridFlag = false;

            /*polar lines angle marker value generator*/
            this._polarAngleLinesMarkerArrayGenerator();

            /*function to set up canvas height and width*/
            this._canvasSetUp();
            /*function to attach canvas tool*/
            this._canvasTool(option.doNotbindMouseMove);
            this._criticalPointsProperties = {
                "selected": {
                    "color": '#187cb6',
                    "opacity": 1
                },
                "normal": {
                    "color": '#00bff3',
                    "opacity": 0.5
                }
            };
            this._discontinuosPointsProperties = {
                "selected": {
                    "color": '#187cb6',
                    "strokeWidth": 2,
                    "opacity": 1
                },
                "normal": {
                    "color": '#00bff3',
                    "strokeWidth": 1,
                    "opacity": 0.5
                }
            };
            this.MARKER_FONT = {
                "SIZE": 12,
                "COLOR": {
                    "ON_GRAPH_AREA": '#000',
                    "AT_END_OF_GRAPH_AREA": '#000'
                },
                "FAMILY": 'Montserrat',
                "WEIGHT": 40
            };
            //white background for grid created
            this.createGridBackground();
            this.render();
            currentlimits = this._gridGraphModelObject.get('_graphDisplayValues')._graphsAxisLimits.currentLimits;
            if (this._gridGraphModelObject.get('_useScrollBarsForPanning')) {
                this._scrollBarManager = new MathUtilities.Components.ScrollBar.Views.CanvasScrollBar();

                frameSize = {
                    "xmin": currentlimits.xLower,
                    "xmax": currentlimits.xUpper,
                    "ymin": currentlimits.yLower,
                    "ymax": currentlimits.yUpper
                };
                this.activateScope();
                screenSize = new this._paperScope.Rectangle(0, 0, this._canvasSize.width, this._canvasSize.height);

                this._projectLayers.scrollLayer.activate();
                this._scrollBarManager.setFrameSize(this._paperScope, frameSize, screenSize, this.$('#' + this._gridGraphModelObject.get('ID').canvasId));
                this._scrollBarManager.parent = this;
            }

            this._onShapeRollOver = _.bind(function(event) {
                if (!$(event.event.target).is('canvas')) {
                    return;
                }
                target = event.target;
                equation = target.equation;
                if (!equation.isDraggable()) {
                    return;
                }

                if (this._gridGraphModelObject.get('_gridMode') === 'annotation-mode') {
                    equation.trigger('annotation-roll-over', equation, event);
                    return;
                }

                if (this.isDragInProgress || this._gridGraphModelObject.get('_gridMode') !== 'Graph') {
                    return;
                }

                equation.trigger('roll-over', equation);

            }, this);
            this._onShapeRollOut = _.bind(function(event) {

                if (!$(event.event.target).is('canvas')) {
                    return;
                }
                target = event.target;
                equation = target.equation;
                if (!equation.isDraggable()) {
                    return;
                }

                if (this._gridGraphModelObject.get('_gridMode') === 'annotation-mode') {
                    equation.trigger('annotation-roll-out', equation, event);
                    return;
                }

                if (this.isDragInProgress || this._gridGraphModelObject.get('_gridMode') !== 'Graph') {
                    return;
                }

                equation.trigger('roll-out', equation);
            }, this);
            this.onLabelRollOver = _.bind(function(event) {
                target = event.target;
                equation = target.equation;
                if (this.isDragInProgress || this._gridGraphModelObject.get('_gridMode') !== 'Graph' ||
                    !equation) {
                    return;
                }
                equation.trigger('label-roll-over');
            }, this);
            this.onLabelRollOut = _.bind(function(event) {
                target = event.target;
                equation = target.equation;
                if (this.isDragInProgress || this._gridGraphModelObject.get('_gridMode') !== 'Graph' ||
                    !equation) {
                    return;
                }
                equation.trigger('label-roll-out');
            }, this);
        },
        "createGridBackground": function() {
            this._projectLayers.gridBGLayer.activate();
            var point = new this._paperScope.Point(0, 0),
                screenSize = new this._paperScope.Size(this._canvasSize.width, this._canvasSize.height),
                shape = new this._paperScope.Shape.Rectangle(point, screenSize);
            shape.fillColor = this._gridGraphModelObject.get('backgroundColor');
            shape.fillColor.alpha = this._gridGraphModelObject.get('backgroundAlpha');
            this.gridBG = shape;
        },

        "coverGrid": function(coverType) {
            this.isGridCovered = coverType || null;
            this._scrollBarManager.enableDisableScrollBar(coverType);
        },

        "updateVisibleDomain": function() {
            if (!this.updateVisibleDomainCount) {
                this.updateVisibleDomainCount = 0;
            }
            this.updateVisibleDomainCount++;

            if (this._isGridRefreshPaused ||
                this._viewRefreshBlockers.length > 0) {
                return;
            }

            if (this._scrollBarManager) {
                this._scrollBarManager.updateObservableUniverse(this.getGraphDomain());
            }
        },

        "getGraphDomain": function() {
            var modelObject = this._gridGraphModelObject,
                points = modelObject.get('_points'),
                plots = modelObject.get('_plots'),
                currentLimits = this._gridGraphModelObject.get('_graphDisplayValues')._graphsAxisLimits.currentLimits,
                visibleDomain = {
                    "xmin": currentLimits.xLower,
                    "xmax": currentLimits.xUpper,
                    "ymin": currentLimits.yLower,
                    "ymax": currentLimits.yUpper
                },
                i, bufferSpace = 5,
                images = modelObject.get('_images'),
                equation, minima, maxima, coord;

            function flexDomain(x, y) {
                if (x < visibleDomain.xmin) {
                    visibleDomain.xmin = x - bufferSpace;
                } else if (x > visibleDomain.xmax) {
                    visibleDomain.xmax = x + bufferSpace;
                }

                if (y < visibleDomain.ymin) {
                    visibleDomain.ymin = y - bufferSpace;
                } else if (y > visibleDomain.ymax) {
                    visibleDomain.ymax = y + bufferSpace;
                }
            }

            for (i = 0; i < points.length; i++) {
                //fix for scrollbar Ui change bz21587
                if (points[i]._parent && points[i]._parent._stateOfMind === 'restless') {
                    continue;
                }
                if (points[i].getPoints()) {
                    coord = points[i].getPoints()[0];
                }
                if (coord) {
                    flexDomain(coord[0], coord[1]);
                }
            }

            for (i = 0; i < plots.length; i++) {
                equation = plots[i];
                minima = equation.getCurveMinima();
                maxima = equation.getCurveMaxima();

                if (minima) {
                    flexDomain(minima[0], minima[1]);
                }
                if (maxima) {
                    flexDomain(maxima[0], maxima[1]);
                }
            }

            for (i = 0; i < images.length; i++) {

                minima = images[i].getCurveMinima();
                maxima = images[i].getCurveMaxima();
                if (minima) {
                    flexDomain(minima[0], minima[1]);
                }
                if (maxima) {
                    flexDomain(maxima[0], maxima[1]);
                }
            }

            return visibleDomain;
        },

        "getSizeForGraphScreenshot": function(visibleDomain) {
            var expectedSize,
                maxAllowedGridSize,
                biasedCenter, currentVisibleGrid = this.getLimits(),
                cropped = false,
                maxAllowedGridSizeX,
                maxAllowedGridSizeY,
                ScreenUtils = MathUtilities.Components.Utils.Models.ScreenUtils;

            visibleDomain = visibleDomain || this.getGraphDomain();
            expectedSize = this._getCanvasDistance([visibleDomain.xmax - visibleDomain.xmin, visibleDomain.ymin - visibleDomain.ymax]);
            biasedCenter = {
                "x": (currentVisibleGrid.xUpper + currentVisibleGrid.xLower) / 2,
                "y": (currentVisibleGrid.yUpper + currentVisibleGrid.yLower) / 2
            };
            if (expectedSize[0] > ScreenUtils.MAX_SCREENSHOT_SIZE.width || expectedSize[1] > ScreenUtils.MAX_SCREENSHOT_SIZE.height) {
                cropped = true;
                maxAllowedGridSize = this._getGridDistance([ScreenUtils.MAX_SCREENSHOT_SIZE.width, ScreenUtils.MAX_SCREENSHOT_SIZE.height]);
                maxAllowedGridSizeX = maxAllowedGridSize[0] / 2;
                maxAllowedGridSizeY = maxAllowedGridSize[1] / 2;
                visibleDomain = {
                    "xmin": biasedCenter.x - maxAllowedGridSizeX,
                    "xmax": biasedCenter.x + maxAllowedGridSizeX,

                    "ymin": biasedCenter.y + maxAllowedGridSizeY,
                    "ymax": biasedCenter.y - maxAllowedGridSizeY
                };
                expectedSize = this._getCanvasDistance([visibleDomain.xmax - visibleDomain.xmin, visibleDomain.ymin - visibleDomain.ymax]);
            }
            return {
                "grid": visibleDomain,
                "canvas": expectedSize,
                "cropped": cropped
            };
        },

        "updateSizeForScreenshot": function(options) {
            //options should be taken from getSizeForGraphScreenshot()

            var expectedSize = options.canvas,
                $canvas = $("#" + this._gridGraphModelObject.get('ID').canvasId),
                visibleDomain = options.grid;

            this.oldDomain = this.getLimits();
            this.canvasOldDimentions = [$canvas.width(), $canvas.height()];
            $canvas.width(expectedSize[0]);
            $canvas.height(expectedSize[1]);
            this.canvasResize();
            this._setGraphLimits(visibleDomain.xmin, visibleDomain.xmax, visibleDomain.ymin, visibleDomain.ymax);
            if (this._scrollBarManager) {
                this._scrollBarManager.setVisibility(false);
            }
            this.drawGraph();
        },

        "photoshootDone": function() {
            if (!this.canvasOldDimentions) {
                return;
            }
            var $canvas = $("#" + this._gridGraphModelObject.get('ID').canvasId);

            if (this._scrollBarManager) {
                this._scrollBarManager.setVisibility(true);
            }
            $canvas.width(this.canvasOldDimentions[0]);
            $canvas.height(this.canvasOldDimentions[1]);
            this.canvasResize();
            this._setGraphLimits(this.oldDomain.xLower, this.oldDomain.xUpper, this.oldDomain.yLower, this.oldDomain.yUpper);
            this.drawGraph();
            this.canvasOldDimentions = null;
        },

        "callUpdateObservableUniverse": function(visibleDomain) {
            if (this._scrollBarManager) {
                this._scrollBarManager.updateObservableUniverse(visibleDomain);
            }
        },

        "render": function() {
            this._cartesionSymbolGenerator();
            this._restoreDefaultZoom();
        },

        "activateNewLayer": function(layerToActivate) {
            this._lastActiveLayer = this._paperScope.project.activeLayer;
            var layers = this._paperScope.project.layers,
                layersCount = layers.length,
                loopVar;

            for (loopVar = 0; loopVar < layersCount; loopVar++) {
                if (layers[loopVar].name === layerToActivate) {
                    layers[loopVar].activate();
                    return;
                }
            }
        },

        "activateEarlierLayer": function() {
            this._lastActiveLayer.activate();
        },

        /**
         *Set values of default values of class variables.
         *
         *@private
         *@method _defaultClassVariblesValue
         *@return
         */

        /*set value of all global variable*/
        "_defaultClassVariblesValue": function() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                canvas = this._canvasSize,
                limits = graphDisplay._graphsAxisLimits,
                parameter = graphDisplay._graphParameters;

            /*Set canvasSize variable value*/
            canvas.height = 800;
            canvas.width = 1244;

            /*set graph Limits value*/
            limits.defaultLimits.xLower = limits.currentLimits.xLower = -10;
            limits.defaultLimits.xUpper = limits.currentLimits.xUpper = 10;
            limits.defaultLimits.yLower = limits.currentLimits.yLower = -10;
            limits.defaultLimits.yUpper = limits.currentLimits.yUpper = 10;

            /*grid Line count*/
            parameter.xGridLine = 4;
            parameter.yGridLine = 4;

            this._shapePan = false;
            this._gridGraphModelObject.set('_isGraphDefaultZoomBehaviourAllowed', true);
            this._gridGraphModelObject.set('_isGraphDefaultPanBehaviourAllowed', true);

            this.graphShiftDistance = this._GRAPH_SHIFT_DISTANCE;

            this.isDrawingsDraggable = false;
            this.isTooltipForPoint = true;

            this.setBackgroundColor(null);

            this.isCustomModeOn = false;
        },

        /**
         *Update default values of class variable depending upon parameter passed while creating object of class.
         *
         *@private
         *@method _updateClassVariablesValue
         *@return
         */
        "_updateClassVariablesValue": function(option) {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                canvas = this._canvasSize,
                domElement = graphDisplay._graphLimitTextBoxDomElement,
                id = this._gridGraphModelObject.get('ID'),
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
            if (typeof option.canvasHeight === 'number' && typeof option.canvasWidth === 'number') {
                canvas.height = option.canvasHeight;
                canvas.width = option.canvasWidth;
            }
            /*set axis Limits value*/
            if (typeof option.xAxisMinValue === 'number' && typeof option.xAxisMaxValue === 'number') {
                limits.defaultLimits.xLower = limits.currentLimits.xLower = option.xAxisMinValue;
                limits.defaultLimits.xUpper = limits.currentLimits.xUpper = option.xAxisMaxValue;
            }

            if (typeof option.yAxisMinValue === 'number' && typeof option.yAxisMaxValue === 'number') {
                limits.defaultLimits.yLower = limits.currentLimits.xLower = option.yAxisMinValue;
                limits.defaultLimits.yUpper = limits.currentLimits.xUpper = option.yAxisMaxValue;
            }

            if (typeof option.isGraphDefaultZoomBehaviourAllowed === 'boolean') {
                this._gridGraphModelObject.set('_isGraphDefaultZoomBehaviourAllowed', option.isGraphDefaultZoomBehaviourAllowed);
            }
            if (typeof option.isGraphDefaultPanBehaviourAllowed === 'boolean') {
                this._gridGraphModelObject.set('_isGraphDefaultPanBehaviourAllowed', option.isGraphDefaultPanBehaviourAllowed);
            }

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

            this._gridGraphModelObject.set('_useScrollBarsForPanning', option._useScrollBarsForPanning);

            if (typeof option.backgroundColor === 'number') {
                this.setBackgroundColor(option.backgroundColor, option.backgroundColorAlpha);
            }

            if (typeof option.isCustomModeOn === 'boolean') {
                this.isCustomModeOn = Boolean(option.isCustomModeOn);
            }

            if (typeof option.isGraphEqualize === 'boolean') {
                graphDisplay._graphDisplay.isEqualizeAtDefault = Boolean(option.isGraphEqualize);
            }
        },

        /**
         *Set canvas width and height,also attach canvas element to paper object.
         *@private
         *@method _canvasSetUp
         *@return
         */

        /*set canvas height and width also attach canvas element to paper object */
        "_canvasSetUp": function() {
            var graphDisplay = this._gridGraphModelObject.get('_graphDisplayValues'),
                canvas = document.getElementById(this._gridGraphModelObject.get('ID').canvasId),
                limits = graphDisplay._graphsAxisLimits,
                canvasTop, canvasBottom, canvasLeft, canvasRight,
                point1X, point1Y, point2X, point2Y,
                height = this._canvasSize.height,
                width = this._canvasSize.width,
                GridGraphView = MathUtilities.Components.Graph.Views.GridGraph,
                $canvas = $(canvas),
                scope, scaling, prevPanBehavior,
                DEFAULT_WIDTH = 300,
                DEFAULT_HEIGHT = 150,
                xAspectRatio = width / Math.abs(limits.defaultLimits.xUpper - limits.defaultLimits.xLower),
                yAspectRatio = height / Math.abs(limits.defaultLimits.yUpper - limits.defaultLimits.yLower),
                xUnits, yUnits,
                layers;

            this.pointerTouches = {};

            if ($canvas.width() === DEFAULT_WIDTH && $canvas.height() === DEFAULT_HEIGHT || $canvas.width() === 0 || $canvas.height() === 0) {
                /*set canvas size to above define height and width */
                $canvas.width(width).height(height);
            } else {
                this._canvasSize.width = $canvas.width();
                this._canvasSize.height = $canvas.height();
            }

            /*update limits based on width and height*/
            xUnits = this._canvasSize.width / xAspectRatio;
            yUnits = this._canvasSize.height / yAspectRatio;
            limits.defaultLimits.xLower = limits.currentLimits.xLower = -xUnits / 2;
            limits.defaultLimits.xUpper = limits.currentLimits.xUpper = xUnits / 2;
            limits.defaultLimits.yLower = limits.currentLimits.yLower = -yUnits / 2;
            limits.defaultLimits.yUpper = limits.currentLimits.yUpper = yUnits / 2;

            /*set canvas as paper object*/
            this._paperScope = new paper.PaperScope();
            this._paperScope.install($('#' + this._gridGraphModelObject.get('ID').canvasId));
            this._paperScope.setup(canvas);
            scope = this._paperScope;
            graphDisplay._graphOrigin.defaultOrigin = new this._paperScope.Point(this._canvasSize.width / 2, this._canvasSize.height / 2);
            this._projectLayers.gridBGLayer = scope.project.activeLayer;
            //intermediateLayer layer is added for white board background drawing
            layers = [
                "intermediateLayer",
                "imageLayer",
                "gridLayer",
                "customGridLayer",
                "annotationLayer",
                "shapeLayer",
                "customShapeLayer",
                "textLayer",
                "pointLayer",
                "labelLayer",
                "serviceLayer",
                "scrollLayer",
                "modalLayer",
                "bannerLayer"
            ];

            _(layers).each(function(layer) {
                this._projectLayers[layer] = new scope.Layer();
            }, this);

            this.activateLayer();
            this._pinchCounter = 1;
            scaling = false;

            if (!this.dontBindEvents) {
                canvas.addEventListener('touchstart', _.bind(function(event) {
                    var canvasOffset = this.$('#' + this._gridGraphModelObject.get('ID').canvasId).offset();

                    if (event.touches.length === 2 && typeof event.touches !== 'undefined' && typeof event.touches[0] !== 'undefined' && typeof event.touches[0] !== 'undefined') {
                        this._pinchZoomDistance = Math.sqrt(Math.pow(event.touches[0].pageX - canvasOffset.left - (event.touches[1].pageX - canvasOffset.left), 2) +
                            Math.pow(event.touches[0].pageY - canvasOffset.top - (event.touches[1].pageY - canvasOffset.top), 2));

                        graphDisplay._zoomingFactor.refPoint = this._getGraphPointCoordinates([graphDisplay._graphOrigin.defaultOrigin.x, graphDisplay._graphOrigin.defaultOrigin.y]);
                        canvasTop = canvasOffset.top;
                        canvasLeft = canvasOffset.left;
                        canvasRight = canvasOffset.left + $canvas.width();
                        canvasBottom = canvasOffset.top + $canvas.height();
                        point1X = event.touches[0].pageX;
                        point1Y = event.touches[0].pageY;
                        point2X = event.touches[1].pageX;
                        point2Y = event.touches[1].pageY;
                        if (!(canvasLeft > point1X || point1X > canvasRight || point1Y < canvasTop || point1Y > canvasBottom || canvasLeft > point2X ||
                                point2X > canvasRight || point2Y < canvasTop || point2Y > canvasBottom)) {
                            scaling = true;
                        }

                        this._gestureStartEvent = {
                            "pageX": (event.touches[0].pageX + event.touches[1].pageX) / 2,
                            "pageY": (event.touches[0].pageY + event.touches[1].pageY) / 2
                        };
                    } else if (event.touches.length === 1) {
                        prevPanBehavior = this.getDefaultPanBehaviour();
                        if (this._touchDoubleTapCounter === null) {
                            this._touchDoubleTapCounter = new Date().getTime();
                        } else {
                            if (!(new Date().getTime() - this._touchDoubleTapCounter > this._DOUBLE_TAP_THRESHOLD)) {
                                this._graphDoubleClick(GridGraphView.simulateMouseEvent(event));
                            }
                            this._touchDoubleTapCounter = null;
                        }
                    }
                }, this));

                $canvas.on('pointerdown.pinchzoom', _.bind(function(event) {
                    var canvasOffset = $canvas.offset(),
                        objectKeys, originalEvent1, originalEvent2;

                    if (event.originalEvent.pointerType === 'touch') {
                        this.pointerTouches[event.originalEvent.pointerId] = event;

                        objectKeys = Object.keys(this.pointerTouches);

                        if (objectKeys.length === 2) { //2: Maximum touch points

                            originalEvent1 = this.pointerTouches[objectKeys[0]].originalEvent;
                            originalEvent2 = this.pointerTouches[objectKeys[1]].originalEvent;

                            this._pinchZoomDistance = Math.sqrt(Math.pow(originalEvent1.pageX - canvasOffset.left - (originalEvent2.pageX - canvasOffset.left), 2) +
                                Math.pow(originalEvent1.pageY - canvasOffset.top - (originalEvent2.pageY - canvasOffset.top), 2));

                            graphDisplay._zoomingFactor.refPoint = this._getGraphPointCoordinates([graphDisplay._graphOrigin.defaultOrigin.x, graphDisplay._graphOrigin.defaultOrigin.y]);
                            canvasTop = canvasOffset.top;
                            canvasLeft = canvasOffset.left;
                            canvasRight = canvasOffset.left + $canvas.width();
                            canvasBottom = canvasOffset.top + $canvas.height();
                            point1X = originalEvent1.pageX;
                            point1Y = originalEvent1.pageY;
                            point2X = originalEvent2.pageX;
                            point2Y = originalEvent2.pageY;

                            if (!(canvasLeft > point1X || point1X > canvasRight || point1Y < canvasTop || point1Y > canvasBottom ||
                                    canvasLeft > point2X || point2X > canvasRight || point2Y < canvasTop || point2Y > canvasBottom)) {
                                scaling = true;
                            }
                            this._gestureStartEvent = {
                                "pageX": (point1X + point2X) / 2,
                                "pageY": (point1Y + point2Y) / 2
                            };

                        } else if (objectKeys.length === 1) {
                            prevPanBehavior = this.getDefaultPanBehaviour();
                            if (this._touchDoubleTapCounter === null) {
                                this._touchDoubleTapCounter = new Date().getTime();
                            } else {
                                if (!(new Date().getTime() - this._touchDoubleTapCounter > this._DOUBLE_TAP_THRESHOLD)) {
                                    this._graphDoubleClick(GridGraphView.simulateMouseEvent(event));
                                }
                                this._touchDoubleTapCounter = null;
                            }
                        }
                    }
                }, this));
                canvas.addEventListener('touchmove', _.bind(function(event) {
                    if (scaling && typeof event.touches !== 'undefined' && typeof event.touches[0] !== 'undefined' && typeof event.touches[1] !== 'undefined') {
                        this._gestureStartEvent = {
                            "pageX": (event.touches[0].pageX + event.touches[1].pageX) / 2,
                            "pageY": (event.touches[0].pageY + event.touches[1].pageY) / 2
                        };

                        if (this.getDefaultZoomBehaviour() === true) {
                            this.setDefaultPanBehaviour(false);
                            this._pinchZoom(GridGraphView.simulateMouseEvent(event));
                        }
                    }
                }, this));


                $canvas.on('pointermove.pinchzoom', _.bind(function(event) {

                    if (event.originalEvent.pointerType === 'touch') {

                        this.pointerTouches[event.originalEvent.pointerId] = event;

                        var objectKeys = Object.keys(this.pointerTouches),
                            originalEvent1, originalEvent2;

                        if (scaling && objectKeys.length === 2) { //2: Maximum touch points

                            originalEvent1 = this.pointerTouches[objectKeys[0]].originalEvent;
                            originalEvent2 = this.pointerTouches[objectKeys[1]].originalEvent;

                            this._gestureStartEvent = {
                                "pageX": (originalEvent1.pageX + originalEvent2.pageX) / 2,
                                "pageY": (originalEvent1.pageY + originalEvent2.pageY) / 2
                            };

                            if (this.getDefaultZoomBehaviour() === true) {
                                this.setDefaultPanBehaviour(false);
                                event.touches = [];
                                event.touches[0] = {
                                    "pageX": originalEvent1.pageX,
                                    "pageY": originalEvent1.pageY
                                };
                                event.touches[1] = {
                                    "pageX": originalEvent2.pageX,
                                    "pageY": originalEvent2.pageY
                                };

                                this._pinchZoom(event);
                            }
                        }
                    }
                }, this));

                canvas.addEventListener('touchend', _.bind(function(event) {
                    this._gestureStartEvent = null;
                    scaling = false;
                    if (event.touches.length === 0) {
                        this.setDefaultPanBehaviour(prevPanBehavior);
                    }
                }, this));

                //Bind on document so that pointerup is detected outside canvas and since tool is not yet defined
                $(document).on('pointerup.pinchzoom', _.bind(function(event) {
                    var objectKeys;

                    if (event.originalEvent.pointerType === 'touch') {
                        this._gestureStartEvent = null;
                        scaling = false;
                        delete this.pointerTouches[event.originalEvent.pointerId];
                        objectKeys = Object.keys(this.pointerTouches);
                        if (objectKeys.length === 0) {
                            this.setDefaultPanBehaviour(prevPanBehavior);
                        }
                    }
                }, this));
                this.createCustomBackground();
            }
        },

        "_gestureStartEvent": null,
        "_pinchZoomDistance": null,

        "_pinchZoom": function(event) {
            var canvasOffset = $('#' + this._gridGraphModelObject.get('ID').canvasId).offset(),
                startPoint = {
                    "x": this._gestureStartEvent.pageX - canvasOffset.left,
                    "y": this._gestureStartEvent.pageY - canvasOffset.top
                },

                modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                origins = graphDisplay._graphOrigin,
                clickedPoint = startPoint,
                clickedPointGraphCoOrdinate, zoomIn = true,
                dist;

            event.preventDefault();

            dist = Math.sqrt(Math.pow(event.touches[0].pageX - canvasOffset.left - (event.touches[1].pageX - canvasOffset.left), 2) +
                Math.pow(event.touches[0].pageY - canvasOffset.top - (event.touches[1].pageY - canvasOffset.top), 2));

            if (Math.abs(dist - this._pinchZoomDistance) <= this._ADJACENT_LINES_MIN_DISTANCE) {
                return;
            }
            if (dist > this._pinchZoomDistance) {
                zoomIn = false;
            }
            this._pinchZoomDistance = dist;
            this.activateScope();

            origins.isOriginPositionChanged = true;
            clickedPointGraphCoOrdinate = this._getGraphPointCoordinates([clickedPoint.x, clickedPoint.y]);

            if (zoomIn === false) {
                this._zoomGraph(1, false, true, clickedPointGraphCoOrdinate);
            } else {
                this._zoomGraph(-1, false, true, clickedPointGraphCoOrdinate);

            }
        },

        /**
         *Attach different functions to canvas mouse tool,
         *
         *@private
         *@method _canvasTool
         *@param doNotbindMouseMove {boolean} flag to avoid move binding on grid
         *@return
         *
         */

        /*attach functions to different canvas mouse activity*/
        "_canvasTool": function(doNotbindMouseMove) {

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                zoomParameter = graphDisplay._zoomingFactor,
                origins = graphDisplay._graphOrigin,
                hitResult, intermediateLayer,
                gridLayer, shapeLayer, gridGraph, pointLayer, bannerLayer, serviceLayer, imageLayer, onGridMouseUp, onGridMouseDrag, gridLayerOnMouseUp,
                scope = this._paperScope,
                textLayer,
                customShapeLayer,
                annotationLayer, labelLayer, gridBGLayer;
            this._projectLayers.shapeLayer.onMouseDown = _.bind(function(event) {

                this.activateScope();
                this.trigger('grid-mousedown', event);

                if (this._gridGraphModelObject.get('_isGraphDefaultPanBehaviourAllowed') &&
                    this._gridGraphModelObject.get('_gridMode') === 'Graph') {
                    this._projectLayers.shapeLayer.activate();

                    hitResult = scope.project.activeLayer.hitTest(event.point, {
                        "stroke": true,
                        "type": scope.Group
                    });
                }
            }, this);

            this._paperScope.tool.minDistance = 1;

            this._projectLayers.shapeLayer.onMouseDrag = _.bind(function(event) {

                this.activateScope();
                if (this._gridGraphModelObject.get('_isGraphDefaultPanBehaviourAllowed') &&
                    this._gridGraphModelObject.get('_gridMode') === 'Graph' &&
                    this._shapePan && hitResult !== void 0) {

                    this._projectLayers.shapeLayer.activate();
                    this._traceMouseDragHandle.apply(this, [event, hitResult.item._parent]);
                    this.activateLayer();

                }
            }, this);

            //listen to the listener
            this.onMouseDrag = _.bind(function(event) {
                var selectionRectStart, deltaVar, rect;

                this.activateScope();
                if (this._gridGraphModelObject.get('_isGraphDefaultPanBehaviourAllowed') &&
                    this._gridGraphModelObject.get('_gridMode') === 'Graph' &&
                    (!gridGraph._gridGraphModelObject.get('_useScrollBarsForPanning') || event &&
                        event.event && event.event.shiftKey || event && event.type && event.type === 'mousewheel')) {
                    if (!this._shapePan) {

                        if (event.delta) {
                            deltaVar = event.delta;
                        } else {
                            //in IE wheel deltaX and deltaY are not given so just following wheel delta
                            deltaVar = {
                                "x": 0,
                                "y": event.originalEvent.wheelDelta
                            };
                        }
                        this._panBy(deltaVar.x, deltaVar.y);
                    }

                } else if (this._gridGraphModelObject.get('_gridMode') === 'SelectionRect' || this._gridGraphModelObject.get('_useScrollBarsForPanning') && event && event.type && event.type !== 'mousewheel' && this._gridGraphModelObject.get('_gridMode') === 'Graph' && !this.isGridCovered) {



                    this._projectLayers.serviceLayer.activate();

                    if (!this._selectionRectStart) {
                        this._selectionRectStart = event.downPoint;
                    }

                    selectionRectStart = this._selectionRectStart;

                    this.activateScope();
                    rect = new this._paperScope.Rectangle(
                        Math.min(event.point.x, selectionRectStart.x),
                        Math.min(event.point.y, selectionRectStart.y),
                        Math.abs(selectionRectStart.x - event.point.x),
                        Math.abs(selectionRectStart.y - event.point.y));

                    if (this._selectionRect) {
                        this._selectionRect.remove();
                        this._selectionRect = null;
                    }

                    this._selectionRect = new this._paperScope.Path.Rectangle(rect);
                    this._selectionRect.style = {
                        "strokeColor": '#d2d2d2',
                        "strokeWidth": 2
                    };
                    this._projectLayers.gridLayer.activate();
                }
            }, this);
            gridLayer = this._projectLayers.gridLayer;
            gridLayer.name = 'gridDrawing';

            shapeLayer = this._projectLayers.shapeLayer;
            shapeLayer.name = 'shape';
            intermediateLayer = this._projectLayers.intermediateLayer;
            intermediateLayer.name = 'intermediate';
            gridGraph = this;
            customShapeLayer = this._projectLayers.customShapeLayer;
            customShapeLayer.name = 'customShape';
            pointLayer = this._projectLayers.pointLayer;
            pointLayer.name = 'point';
            bannerLayer = this._projectLayers.bannerLayer;
            bannerLayer.name = 'banner';

            imageLayer = this._projectLayers.imageLayer;
            imageLayer.name = 'image';
            textLayer = this._projectLayers.textLayer;
            textLayer.name = 'text';
            annotationLayer = this._projectLayers.annotationLayer;
            annotationLayer.name = 'annotation';
            labelLayer = this._projectLayers.labelLayer;
            labelLayer.name = 'label';
            serviceLayer = this._projectLayers.serviceLayer;
            serviceLayer.name = 'service';
            gridBGLayer = this._projectLayers.gridBGLayer;
            gridBGLayer.name = 'grid';
            this._clickTracker = {
                "moveTime": [],
                "downTime": [],
                "upTime": [],
                "dragTime": []
            };
            if (!this.dontBindEvents) {
                this._addLayerClickDoubleClickEvents(pointLayer);
                this._addLayerClickDoubleClickEvents(this._projectLayers.shapeLayer);
                this._addLayerClickDoubleClickEvents(bannerLayer);
                this._addLayerClickDoubleClickEvents(this._projectLayers.gridLayer);
                this._addLayerClickDoubleClickEvents(imageLayer);
                this._addLayerClickDoubleClickEvents(textLayer);
                this._addLayerClickDoubleClickEvents(annotationLayer);
                this._addLayerClickDoubleClickEvents(labelLayer);
                this._addLayerClickDoubleClickEvents(serviceLayer);
                this._addLayerClickDoubleClickEvents(customShapeLayer);
                this._addLayerClickDoubleClickEvents(gridBGLayer);

                this._paperScope.tool.onMouseDrag = _.bind(function(event) {
                    this.trigger('grid-graph-mousedrag', event);
                }, this);

                this._paperScope.tool.onMouseDown = _.bind(function(event) {
                    this.trigger('grid-graph-mousedown', event);
                }, this);

                this._paperScope.tool.onMouseUp = _.bind(function(event) {
                    var circleDrag,
                        hollowPoints;
                    this.activateScope();
                    if (event.event.which === 3) {
                        return;
                    }
                    gridGraph.isDragInProgress = false;

                    zoomParameter.refPoint = this._getGraphPointCoordinates([origins.defaultOrigin.x, origins.defaultOrigin.y]);
                    circleDrag = this._gridGraphModelObject.get('circleDrag');
                    if (circleDrag !== null) {
                        circleDrag.visible = false;
                        this.$('.drag-tooltip').remove();
                        this._shapePan = false;
                        if (this.showGraph === true) {
                            hollowPoints = circleDrag.data.equation.getHollowPoints();
                            if (hollowPoints !== null) {
                                hollowPoints.showGraph();
                            }
                        }
                    }
                    this.trigger('grid-graph-mouseup', event);
                    this.trigger('annotation-end', event);
                }, this);

                if (!MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) {
                    this._paperScope.tool.onMouseMove = _.bind(function(event) {

                        this.trigger('grid-graph-mousemove', event);
                        if (gridGraph.getGridMode() === 'SelectionRect') {
                            this.trigger('mousemove-selecting-text-tool', event);
                        }
                    }, this);
                }

                onGridMouseUp = function() {
                    if ((this._gridGraphModelObject.get('_gridMode') === 'SelectionRect' || this._gridGraphModelObject.get('_useScrollBarsForPanning')) && this._selectionRect) {
                        var selectionBound = this._selectionRect.bounds;
                        this._selectionRect.remove();
                        this._selectionRectStart = null;
                        this._selectionRect = null;
                        this.trigger('selection-rect-complete', selectionBound);
                    }

                    gridGraph.off('grid-layer-mouseup', onGridMouseUp);
                    gridGraph.off('grid-layer-mousedrag', onGridMouseDrag);
                };

                onGridMouseDrag = function(event) {
                    //to prevent the dragging of page in tablets.
                    if (gridGraph.getGridMode() === 'drawing') {
                        return;
                    }
                    gridGraph.onMouseDrag(event);
                };

                this.on('grid-layer-mousedown', function() {

                    gridGraph.off('grid-layer-mousedrag', onGridMouseDrag).on('grid-layer-mousedrag', onGridMouseDrag);
                    gridGraph.off('grid-layer-mouseup', onGridMouseUp).on('grid-layer-mouseup', onGridMouseUp);

                });
                gridLayerOnMouseUp = _.bind(function(event) {
                    if (this._gridGraphModelObject.get('_isGraphDefaultPanBehaviourAllowed') &&
                        this._gridGraphModelObject.get('_gridMode') === 'Graph') {
                        this.trigger('graph:pan');
                        this.refreshView();
                        this._shapePan = false;
                    }

                    origins.doubleClickedPoint = event.point;

                }, this);
                this.on('grid-layer-mouseup', gridLayerOnMouseUp);
                this.on('grid-layer-doubleclick', _.bind(this._graphDoubleClick, this));
            }
        },

        "_panBy": function(dx, dy) {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                imagesLength, textLayerCount, serviceLayerCount,
                annotationLayerCount,
                origins = graphDisplay._graphOrigin,
                width = this._canvasSize.width,
                height = this._canvasSize.height,
                deltaVar = {
                    "x": dx,
                    "y": dy
                },
                lastTimer,
                intermediateLayerCount;

            origins.currentOrigin.x += deltaVar.x;
            origins.currentOrigin.y += deltaVar.y;
            this._graphTypeSelector();
            origins.isOriginPositionChanged = true;
            this._graphLimitChangesDuringDragging();
            this._deltaAngle();
            this._previousMaxValue = this._getGraphPointCoordinates([width, height / 2])[0];
            imagesLength = this._projectLayers.imageLayer.children.length;
            textLayerCount = this._projectLayers.textLayer.children.length;
            annotationLayerCount = this._projectLayers.annotationLayer.children.length;
            serviceLayerCount = this._projectLayers.serviceLayer.children && this._projectLayers.serviceLayer.children.length > 0;
            intermediateLayerCount = this._projectLayers.intermediateLayer.children && this._projectLayers.intermediateLayer.children.length > 0;
            if (this._projectLayers.customShapeLayer.children.length !== 0) {
                this._layerDrag(this._projectLayers.customShapeLayer, deltaVar);
            }
            if (intermediateLayerCount) {
                this._layerDrag(this._projectLayers.intermediateLayer, deltaVar);
            }
            if (this._projectLayers.shapeLayer.children.length !== 0 || imagesLength !== 0 ||
                textLayerCount !== 0 || annotationLayerCount !== 0) {
                if (this._projectLayers.shapeLayer.children.length !== 0) {
                    this._layerDrag(this._projectLayers.shapeLayer, deltaVar);
                    this._layerDrag(this._projectLayers.labelLayer, deltaVar);

                }
                if (annotationLayerCount !== 0) {
                    this._layerDrag(this._projectLayers.annotationLayer, deltaVar);
                }
                if (imagesLength !== 0) {
                    this._layerDrag(this._projectLayers.imageLayer, deltaVar);
                }
                if (textLayerCount !== 0) {
                    this._layerDrag(this._projectLayers.textLayer, deltaVar);
                }
                if (serviceLayerCount) {
                    this._layerDrag(this._projectLayers.serviceLayer, deltaVar);
                }

                lastTimer = $.data(this, 'timer');

                if (lastTimer) {
                    clearTimeout(lastTimer);
                }
                $.data(this, 'timer', setTimeout(_.bind(function() {
                    clearTimeout($.data(this, 'timer'));
                    $.data(this, 'timer', null);
                    this.trigger('graph:zoom-pan');
                    this.refreshView();

                }, this), 150));
            }
            if (modelObject.get('_points').length !== 0) {
                this._repositionPoints();
            }
        },

        "_getPathsUnderArea": function(rectangle) {
            var projectLayers = this._projectLayers,
                currentLayer = projectLayers.shapeLayer,
                numChildren = currentLayer.children.length,
                i, child, coordinate, arrSelected = [],
                pointArray, result, point;



            pointArray = this._gridGraphModelObject.get('_points');

            for (i = 0; i < numChildren; i++) {
                child = currentLayer.children[i];
                result = this._checkPathGroupForRectangle(child, rectangle);
                if (result && $.inArray(result, arrSelected) < 0) {
                    arrSelected.push(result);

                }
            }

            currentLayer = this._projectLayers.annotationLayer;
            numChildren = currentLayer.children.length;

            for (i = 0; i < numChildren; i++) {
                child = currentLayer.children[i];
                result = this._checkPathGroupForRectangle(child, rectangle);
                if (result && $.inArray(result, arrSelected) < 0) {
                    arrSelected.push(result);
                }
            }
            currentLayer = this._projectLayers.customShapeLayer;
            numChildren = currentLayer.children.length;

            for (i = 0; i < numChildren; i++) {
                child = currentLayer.children[i];
                result = this._checkPathGroupForRectangle(child, rectangle);
                if (result && $.inArray(result, arrSelected) < 0) {
                    arrSelected.push(result);
                }
            }

            currentLayer = this._projectLayers.textLayer;
            numChildren = currentLayer.children.length;
            result = null;
            for (i = 0; i < numChildren; i++) {
                child = currentLayer.children[i];
                if (child.equation && (child.bounds.intersects(rectangle) || child.bounds.contains(rectangle))) {
                    result = child.equation._parent;
                }
                if (result && $.inArray(result, arrSelected) < 0) {
                    arrSelected.push(result);
                }
            }

            currentLayer = this._projectLayers.imageLayer;
            numChildren = currentLayer.children.length;
            result = null;
            for (i = 0; i < numChildren; i++) {
                child = currentLayer.children[i];
                if (child.equation && (child.bounds.intersects(rectangle) || child.bounds.contains(rectangle))) {
                    result = child.equation._parent;
                }
                if (result && $.inArray(result, arrSelected) < 0) {
                    arrSelected.push(result);
                }
            }

            currentLayer = this._projectLayers.pointLayer;
            numChildren = currentLayer.children.length;

            for (i = 0; i < pointArray.length; i++) {
                point = pointArray[i];
                coordinate = point.getPoints();
                if (!(coordinate && coordinate[0])) {
                    continue;
                }
                coordinate = this._getCanvasPointCoordinates(coordinate[0]);
                if (rectangle.contains({
                        "x": coordinate[0],
                        "y": coordinate[1]
                    }) && $.inArray(point._parent, arrSelected) < 0) {
                    arrSelected.push(point._parent);
                }
            }
            return arrSelected;
        },

        "_checkPathGroupForRectangle": function(group, rectangle) {
            if (!group) {
                return void 0;
            }
            var children = group.children,
                i, child;
            if (children) {
                for (i = 0; i < children.length; i++) {
                    child = children[i];
                    if (!child) {
                        continue;
                    }
                    if (child._type === 'group') {
                        this._checkPathGroupForRectangle(child, rectangle);
                    } else {

                        if (child.equation && this._doesPathLieInRectangle(child, rectangle)) {

                            return child.equation._parent;
                        }
                    }
                }
            }
        },


        "_doesPathLieInRectangle": function(path, rectangle) {
            var segment, segment1, status,
                outcode1, i, outcode2;
            for (i = 0; i < path._segments.length - 1; i++) {
                segment = path._segments[i];
                segment1 = path._segments[i + 1];
                status = geomFunctions.doesLineIntersectRectangle(
                    segment._point.x, segment._point.y,
                    segment1._point.x, segment1._point.y,
                    rectangle.left, rectangle.right, rectangle.top, rectangle.bottom);

                if (!status) {
                    outcode1 = geomFunctions.calculateLineOutCode(segment._point.x, segment._point.y,
                        rectangle.left, rectangle.right, rectangle.top, rectangle.bottom);
                    outcode2 = geomFunctions.calculateLineOutCode(segment1._point.x, segment1._point.y,
                        rectangle.left, rectangle.right, rectangle.top, rectangle.bottom);

                    status = outcode1 === 0 && outcode2 === 0;
                }

                if (status) {
                    return status;
                }
            }
            return false;
        },


        "_getMinXMinYFromPoints": function(point1, point2) {
            var returnPoint = {
                "x": null,
                "y": null
            };
            returnPoint.x = point1.x <= point2.x ? point1.x : point2.x;
            returnPoint.y = point1.y <= point2.y ? point1.y : point2.y;
            return returnPoint;
        },

        "refreshView": function() {

            if (this._isGridRefreshPaused ||
                this._isGridRefreshPausedLevel2 ||
                this._viewRefreshBlockers.length > 0) {
                return;
            }

            var currentTime = new Date().getTime(),
                diff, CUT_OFF = 50;

            if (this._lastViewRefresh) {
                diff = currentTime - this._lastViewRefresh;
            }

            if (diff && diff < CUT_OFF) {
                if (this._refreshTimer) {
                    return;
                }
                this._refreshTimer = setInterval(_.bind(this.refreshView, this), CUT_OFF - diff);
                return;
            }

            if (this._refreshTimer) {
                clearInterval(this._refreshTimer);
                this._refreshTimer = null;
            }


            this._lastViewRefresh = currentTime;
            this._paperScope.view.draw();
        },

        "_addLayerClickDoubleClickEvents": function(layer) {
            var demon, expecting = 'DC',
                DOUBLE_CLICK_INTERVAL = 350,
                sessionTimestamp,
                SESSION_DRAGGED_FACTOR = 5,
                self = this,
                funcOnMouseDrag, funcOnMouseDown, funcOnMouseUp, funcOnMouseMove,
                dragTime = this._clickTracker.dragTime,
                downTime = this._clickTracker.downTime,
                upTime = this._clickTracker.upTime,
                moveTime = this._clickTracker.moveTime,
                processEvent, dispatch, target, group,
                objectOffset, fallbackLayerName,
                mouseDownPosition, lastPosition, delX, delY,
                sessionStats = {
                    "dragged": false
                },
                fallbackTarget, fallbackEquationData, sessionDraggedX, sessionDraggedY, sessionDragStart;

            funcOnMouseDrag = function(event) {
                if (!sessionDragStart && Math.abs(sessionDraggedX) < SESSION_DRAGGED_FACTOR && Math.abs(sessionDraggedY) < SESSION_DRAGGED_FACTOR) {
                    sessionDraggedX += event.delta.x;
                    sessionDraggedY += event.delta.y;
                    dragTime.push({
                        "time": new Date().getTime(),
                        "event": event
                    });
                } else {
                    sessionDragStart = true;
                    processEvent('drag', event);
                }
            };

            funcOnMouseUp = function(event) {
                processEvent('up', event);
            };
            funcOnMouseDown = _.bind(function(event) {

                sessionDraggedX = 0;
                sessionDraggedY = 0;
                sessionDragStart = false;
                // 2 --> mouse scroll button & 3 --> right mouse button
                if (event.event.which === 2 || event.event.which === 3) {
                    return;
                }

                if (this._mouseDownSteal) {
                    this._mouseDownSteal.call(event, event);
                    this._mouseDownSteal = null;
                    return;
                }

                sessionTimestamp = event.event.timeStamp;
                event.sessionTimestamp = sessionTimestamp;
                expecting = this.isInputModeEnabled(this.INPUT_MODE_DOUBLE_CLICK) ? 'DC' : 'drag';
                dispatch('down-sensed', event);

                if (downTime.length === 0) {
                    var target1 = event.target,
                        group1 = target1.parent;

                    if (this.getGridMode() !== 'drawing' && this.getGridMode() !== 'SelectionRect' || this.getGridMode() === 'SelectionRect') {
                        layer.onMouseMove = funcOnMouseMove;
                        this._paperScope.tool.attach('mousedrag', funcOnMouseDrag);
                    }
                    this.on('grid-graph-mouseup', funcOnMouseUp);

                    mouseDownPosition = geomFunctions.getCanvasCoordinates(event);
                    if (layer.name !== 'label') {
                        if (layer.name !== 'point') {
                            objectOffset = [mouseDownPosition[0] - group1.position.x, mouseDownPosition[1] - group1.position.y];
                        } else {
                            objectOffset = [mouseDownPosition[0] - group1.firstChild.position.x, mouseDownPosition[1] - group1.firstChild.position.y];
                        }
                    }

                    this.isDragInProgress = true;
                }
                if ((this.isInputModeEnabled(this.INPUT_MODE_DOUBLE_CLICK) || this.isInputModeEnabled(this.INPUT_MODE_FIRST_CLICK)) && !demon) {
                    demon = setInterval(function() {
                        processEvent('timeout', event);

                    }, this.isInputModeEnabled(this.INPUT_MODE_DOUBLE_CLICK) ? DOUBLE_CLICK_INTERVAL : DOUBLE_CLICK_INTERVAL / 2);
                }

                processEvent('down', event);
            }, this);

            funcOnMouseMove = function(event) {
                if (Math.abs(event.delta.x) > 1 || Math.abs(event.delta.y) > 1) {
                    processEvent('move', event);
                }
            };

            function cancelInterval() {
                if (demon) {
                    clearInterval(demon);
                    demon = null;
                }
            }

            processEvent = function(eventName, event) {
                function flushEvents() {
                    cancelInterval();
                    sessionStats.dragged = null;
                    sessionStats.downTriggerred = null;

                    while (self._clickTracker.dragTime.length) {
                        self._clickTracker.dragTime.pop();
                    }

                    while (self._clickTracker.downTime.length) {
                        self._clickTracker.downTime.pop();
                    }

                    while (self._clickTracker.upTime.length) {
                        self._clickTracker.upTime.pop();
                    }

                    while (self._clickTracker.moveTime.length) {
                        self._clickTracker.moveTime.pop();
                    }

                    expecting = self.isInputModeEnabled(self.INPUT_MODE_DOUBLE_CLICK) ? 'DC' : 'drag';

                    self._paperScope.tool.detach('mousedrag', funcOnMouseDrag);

                    self.off('grid-graph-mouseup', funcOnMouseUp);
                    layer.onMouseMove = null;

                    self.isDragInProgress = false;
                    sessionTimestamp = null;
                    lastPosition = null;
                    fallbackLayerName = null;
                }

                var time = new Date().getTime(),
                    clickInterval = DOUBLE_CLICK_INTERVAL / 2,
                    finish = false;
                switch (eventName) {
                    case 'up':
                        if (!(self.isInputModeEnabled(self.INPUT_MODE_DOUBLE_CLICK) || self.isInputModeEnabled(self.INPUT_MODE_FIRST_CLICK))) {

                            cancelInterval();
                            dispatch('up', event);

                            finish = true;
                            break;
                        }
                        if (self.isInputModeEnabled(self.INPUT_MODE_FIRST_CLICK) && time - downTime[0] > DOUBLE_CLICK_INTERVAL / 2) {
                            cancelInterval();
                            dispatch('click', event);
                            finish = true;
                            break;
                        }
                        if (upTime.length + 1 !== downTime.length || !demon) {
                            dispatch('up', event);
                            finish = true;
                            break;
                        }
                        upTime.push({
                            't': time,
                            'event': event
                        });

                        if (expecting === 'DC' && upTime.length === 2) {
                            dispatch('doubleClick', downTime[0].event);
                            finish = true;
                        } else if (expecting === 'drag' && sessionStats.dragged) {

                            dispatch('up', event);
                            finish = true;
                        }
                        break;

                    case 'down':
                        downTime.push({
                            't': time,
                            'event': event
                        });
                        if (!self.isInputModeEnabled(self.INPUT_MODE_DOUBLE_CLICK) && !self.isInputModeEnabled(self.INPUT_MODE_FIRST_CLICK)) {
                            cancelInterval();
                            dispatch('down', event);
                        }
                        break;

                    case 'drag':
                        cancelInterval();
                        if (expecting === 'DC') {
                            dispatch('down', downTime[0].event);
                            dispatch('dragBegin', downTime[0].event);
                            expecting = 'drag';
                        }
                        sessionStats.dragged = true;
                        while (dragTime.length > 0) {
                            dispatch('drag', dragTime.shift().event);
                        }
                        dispatch('drag', event);
                        break;

                    case 'move':
                        if (demon) {
                            cancelInterval();
                        }
                        moveTime.push({
                            't': time,
                            'event': event
                        });
                        //if uptime is zero that means drag begin is not correct
                        if (expecting === 'DC' && upTime.length === 0) {
                            dispatch('down', downTime[0].event);
                            dispatch('dragBegin', downTime[0].event);
                            expecting = 'drag';
                        } else if (upTime.length > 0) {
                            if (downTime.length > 0) {
                                dispatch('down', downTime[0].event);
                            }
                            dispatch('up', upTime[upTime.length - 1].event);
                            finish = true;
                        }

                        break;

                    case 'timeout':
                        cancelInterval();
                        if (upTime.length === 1) {
                            //removing check for DC...why do we need to check with DC?? removed for BZ26053
                            //after timeout check if the interval is sufficient for click
                            if (upTime[0].t - downTime[0].t <= clickInterval) {
                                event = downTime[0].event;
                                dispatch('click', event);
                            } else {
                                //otherwise break and dispatch individual events
                                dispatch('down', downTime[0].event);
                                dispatch('up', event);
                            }
                            finish = true;
                        } else if (upTime.length === 2 || upTime.length === 0) {
                            if (self.isInputModeEnabled(self.INPUT_MODE_DOUBLE_CLICK) && self.isInputModeEnabled(self.INPUT_MODE_FIRST_CLICK) && downTime.length > 0) {
                                dispatch('down', downTime[0].event);
                            }
                        }
                        break;

                    default:
                        return;
                }
                if (finish) {
                    flushEvents();
                }
            };

            dispatch = _.bind(function(eventName, event) {

                var GridView = MathUtilities.Components.Graph.Views.GridGraph,
                    relocateDataObject, postDragDataObject,
                    equation, dx, dy, SEL_RECT_DEFAULT_WIDTH = 50,
                    rect, counter, length, images,
                    firstPosition, scope = this._paperScope,
                    hitResult, shapePanFlag,
                    canvasCoords, targetStealEvent, targetLayerName = layer.name,
                    setShapePanFlag = _.bind(function() {
                        hitResult = scope.project.activeLayer.hitTest(event.point, {
                            "stroke": true,
                            "type": scope.Group
                        });

                        if (hitResult) {
                            if (hitResult.type === 'stroke') {
                                shapePanFlag = true;
                            }

                            if (hitResult === null) {
                                shapePanFlag = false;
                            } else {
                                if (hitResult.item !== null) {
                                    shapePanFlag = hitResult.item._parent.type === 'group' && scope.project.activeLayer.name === 'shape';
                                } else {
                                    shapePanFlag = false;
                                }
                            }
                        } else {
                            shapePanFlag = false;
                        }
                        this._shapePan = shapePanFlag;

                        if (shapePanFlag === true) {
                            this._projectLayers.shapeLayer.activate();
                            this._traceMouseDownHandle.apply(this, [event, hitResult.item._parent]);
                            this.activateLayer();
                        }
                    }, this);

                if (['up', 'click', 'doubleClick'].indexOf(eventName) > -1) {
                    targetStealEvent = downTime[0];
                    event.target = targetStealEvent.event.target;
                } else if (eventName === 'down') {
                    if (sessionStats.downTriggerred) {
                        return;
                    }
                    sessionStats.downTriggerred = true;
                }

                if (this.getGridMode() === 'annotation-mode') {
                    switch (eventName) {
                        case 'down-sensed':
                            eventName = 'annotate-down-sensed';
                            break;
                        case 'down':
                            eventName = 'annotate-start';
                            break;

                        case 'up':
                            eventName = 'annotate-end';
                            break;

                        case 'click':
                            eventName = 'annotate';
                            break;

                        case 'drag':
                            eventName = 'annotate-drag';
                            break;
                        default:
                            return;
                    }
                }
                target = event.target;
                event.sessionTimestamp = sessionTimestamp;
                event.sessionStats = sessionStats;

                if (target) {
                    group = target.parent;
                }

                if (this.getGridMode() === 'SelectionRect') {
                    targetLayerName = 'grid';
                    target = this._projectLayers.gridLayer;
                } else if (layer.name !== 'grid' && layer.name !== 'service') {
                    if (target) {
                        if (target.equation) {
                            equation = target.equation;
                        } else {
                            equation = group.equation;
                        }
                        //target layer to grid...if bypass events is true

                    } else if (fallbackTarget) {
                        target = fallbackTarget;
                        equation = fallbackEquationData;
                    }
                    //target and layer name changed when inequalities present
                    if (target && target.bypassMouseEvents) {
                        images = this._projectLayers.imageLayer.children;
                        length = images.length;

                        if (length === 0) {
                            targetLayerName = 'grid';
                        } else {
                            for (counter = 0; counter < length; counter++) {
                                hitResult = images[counter].hitTest(event.point);
                                if (hitResult && hitResult.item) {
                                    fallbackLayerName = 'image';
                                    target = images[counter];
                                    equation = images[counter].equation;
                                    break;
                                }

                            }
                            if (!hitResult) {
                                targetLayerName = 'grid';
                            }
                        }
                    }
                }
                if (fallbackLayerName) {
                    targetLayerName = fallbackLayerName;
                }
                canvasCoords = geomFunctions.getCanvasCoordinates(event);
                switch (eventName) {
                    case 'annotate-down-sensed':
                        fallbackEquationData = equation;
                        fallbackTarget = target;
                        break;
                    case 'down-sensed':
                        fallbackEquationData = equation;
                        fallbackTarget = target;

                        this.trigger(targetLayerName + '-layer-mousedown-sensed', event, target);
                        setShapePanFlag();
                        break;

                    case 'down':
                        this.trigger(targetLayerName + '-layer-mousedown', event);
                        break;

                    case 'annotate-start':

                        this.trigger(targetLayerName + '-layer-annotate-start', event);
                        break;
                    case 'dragBegin':
                        if (equation && equation.isDraggable()) {
                            if (equation) {
                                if (equation.getLabelData().labelObject !== target) {
                                    equation.trigger('drag-begin', this._getGraphPointCoordinates(geomFunctions.getCanvasCoordinates(event)), equation, event, target);
                                } else {
                                    equation.trigger('label-drag-begin', event, equation);
                                    this._updateLabelPosition(equation);
                                    //to set label to new position calculated above.
                                }
                            } else {
                                this.trigger(targetLayerName + '-layer-dragBegin', event);
                            }
                        }
                        break;

                    case 'up':
                    case 'annotate-end':
                        if (this.getGridMode() === 'annotation-mode') {
                            this.trigger(targetLayerName + '-layer-annotate-end', event);
                        } else {
                            this.trigger(targetLayerName + '-layer-mouseup', event);
                        }

                        if (this.getGridMode() === 'drawing') {
                            break;
                        }
                        // break skipped intentionally
                        this.updateVisibleDomain();
                        this._shapePan = false;
                        //falls through
                    case 'drag':
                    case 'annotate-drag':
                        //first check grid layer name n all
                        if (eventName !== 'annotate-drag') {
                            if (targetLayerName === 'grid' || equation && equation.getRepositionOnDrag() === false) {
                                if (eventName === 'drag') {
                                    this.trigger(targetLayerName + '-layer-mousedrag', event, target);
                                } else if (eventName === 'annotate-drag') {
                                    this.trigger(targetLayerName + '-layer-annotate-drag', event, target);
                                }
                                return;
                            }

                            if (equation && !equation.isDraggable()) {
                                break;
                            }
                            if (!equation && targetLayerName === 'service') {
                                return;
                            }
                        }
                        //snap to grid is deprecated from grid
                        if (!lastPosition) {
                            lastPosition = mouseDownPosition;
                        }

                        delX = canvasCoords[0] - lastPosition[0];
                        delY = canvasCoords[1] - lastPosition[1];

                        if (objectOffset && targetLayerName !== 'point') {
                            canvasCoords[0] -= objectOffset[0];
                            canvasCoords[1] -= objectOffset[1];
                        }
                        if (equation && equation.getLabelData() && eventName !== 'annotate-drag' && eventName !== 'annotate-end' && equation.getLabelData().labelObject === target) {
                            equation.trigger('label-pre-drag', event, equation);
                            this._updateLabelPosition(equation); //to set label to new position calculated above.
                        }

                        this.refreshView();

                        if (eventName === 'drag') {
                            if (equation && equation.getLabelData().labelObject !== target) {
                                postDragDataObject = GridView.createPostDragDataObject();
                                postDragDataObject.equation = equation;
                                postDragDataObject.deltaX = delX;
                                postDragDataObject.deltaY = delY;
                                postDragDataObject.position = canvasCoords;
                                postDragDataObject.eventName = eventName;
                                equation.trigger('post-drag', postDragDataObject);
                            }
                            lastPosition = geomFunctions.getCanvasCoordinates(event);

                        } else if (eventName === 'annotate-drag') {
                            if (equation && equation.getLabelData().labelObject !== target) {
                                postDragDataObject = GridView.createPostDragDataObject();
                                postDragDataObject.equation = equation;
                                postDragDataObject.deltaX = delX;
                                postDragDataObject.deltaY = delY;
                                postDragDataObject.position = canvasCoords;
                                postDragDataObject.eventName = eventName;
                                equation.trigger('annotate-drag', postDragDataObject);
                            }
                            lastPosition = geomFunctions.getCanvasCoordinates(event);
                        } else if (eventName === 'up' || eventName === 'annotate-end') {
                            //only applies for up event
                            if (equation && (!equation.getLabelData() || equation.getLabelData().labelObject !== target) && sessionStats.dragged) {
                                firstPosition = geomFunctions.getCanvasCoordinates(downTime[0].event);
                                dx = lastPosition[0] - firstPosition[0];
                                dy = lastPosition[1] - firstPosition[1];
                                relocateDataObject = GridView.createRelocateDataObject();
                                relocateDataObject.equation = equation;
                                relocateDataObject.delX = dx;
                                relocateDataObject.delY = dy;
                                relocateDataObject.position = canvasCoords;
                                relocateDataObject.eventName = eventName;
                                equation.trigger('post-relocate', relocateDataObject);
                            }
                        }
                        break;

                    case 'click':
                        event.eventType = 'click';
                        if (this.getGridMode() === 'SelectionRect') {
                            rect = new this._paperScope.Path.Rectangle([event.point.x, event.point.y], [SEL_RECT_DEFAULT_WIDTH, SEL_RECT_DEFAULT_WIDTH]);
                            this.trigger('selection-rect-complete', rect.bounds);
                            rect.remove();
                        }
                        setShapePanFlag();
                        this.trigger(targetLayerName + '-layer-click', event);
                        break;

                    case 'annotate':
                        this.trigger(targetLayerName + '-layer-annotate', event);
                        break;

                    case 'doubleClick':
                        this.trigger(targetLayerName + '-layer-doubleclick', event);
                        break;
                }

                //remove reference when work is done
                event.sessionStats = null;

            }, this);

            layer.onMouseDown = funcOnMouseDown;
        },

        "enableInputMode": function(inputMode, enable) {
            if (enable) {
                this._openInputMode |= inputMode;
            } else {
                this._openInputMode &= ~inputMode;
            }
        },

        "isInputModeEnabled": function(inputMethod) {
            return this._openInputMode & inputMethod;
        },

        "_onShapeRollOver": null,
        "_onShapeRollOut": null,
        "onLabelRollOver": null,
        "onLabelRollOut": null,

        "_setPathRollOverListeners": function(pointOrPlot) {
            if (!this.dontBindEvents) {
                pointOrPlot.onMouseEnter = this._onShapeRollOver;
                pointOrPlot.onMouseLeave = this._onShapeRollOut;
            }
        },

        "_removePathRollOverListeners": function(pointOrPlot) {
            if (!pointOrPlot) {
                return;
            }
            pointOrPlot.onMouseEnter = null;
            pointOrPlot.onMouseLeave = null;
        },

        /*
        For removing pathGroup we are not using paper.js remove function,
        because if we are sorting pathGroups in current layer &
        then removing a particular pathGroup using remove function
        then it removes inappropriate pathGroup from current layer...
        */
        "removeDrawingObject": function(pathGroup) {
            var currentPathGroupLayer, index;
            if (pathGroup !== null && pathGroup._parent) {
                currentPathGroupLayer = pathGroup._parent;
                index = currentPathGroupLayer.children.indexOf(pathGroup);
                pathGroup.removeChildren();
                if (index !== -1) {
                    currentPathGroupLayer.removeChildren(index, index + 1);
                }
            }
        },
        /**
         *Hide or show label
         *
         *@private
         *@method _labelDisplayChange
         *@return
         */
        "_labelDisplayChange": function() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isLabelShown = !graphDisplay._graphDisplay.isLabelShown;

            this._graphTypeSelector();
        },

        /**
         * Call _labelDisplayChange
         *@public
         *@method callLabelDisplayChange
         *@return
         */
        "callLabelDisplayChange": function() {
            this._labelDisplayChange();
        },
        /**
         *Hide or show axis
         *
         *@private
         *@method _axisDisplayChange
         *@return
         */
        "_axisDisplayChange": function() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isAxisLinesShown = !graphDisplay._graphDisplay.isAxisLinesShown;

            this._graphTypeSelector();
        },
        /**
         * Call _axisDisplayChange
         *@public
         *@method callAxisDisplayChange
         *@return
         */
        "callAxisDisplayChange": function() {
            this._axisDisplayChange();
        },
        /**
         * Hide or show grid-lines
         *
         *@private
         *@method _gridLineDisplayChange
         *@return
         */
        "_gridLineDisplayChange": function() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isGridLineShown = !graphDisplay._graphDisplay.isGridLineShown;

            this._graphTypeSelector();
        },
        /**
         * Call _gridLineDisplayChange
         *@public
         *@method callGridDisplayChange
         *@return
         */
        "callGridDisplayChange": function() {
            this._gridLineDisplayChange();
        },

        /**
        *Change projector mode from on to off or vice-versa
        *
        @private
        @method _projectorModeChange
        @return
        */
        "_projectorModeChange": function() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isProjectorModeOn = !graphDisplay._graphDisplay.isProjectorModeOn;
            if (graphDisplay._graphDisplay.isProjectorModeOn) {
                this.trigger('graph:projector-mode-on');
            } else {
                this.trigger('graph:projector-mode-off');
            }
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
        "graphZoomIn": function() {
            if (this.isDragInProgress) {
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

        "_zoomInButtonClicked": function() {
            if (this.isDragInProgress) {
                return;
            }
            var i = 0,
                totalShiftPoint = this._ZOOM_STEPS,
                zoomCaller, interval;

            zoomCaller = _.bind(function() {
                this._zoomGraph(1, true);
            }, this);

            interval = setInterval(function() {
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
        "graphZoomOut": function() {
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
        "_zoomOutButtonClicked": function() {
            if (this.isDragInProgress) {
                return;
            }
            var i = 0,
                totalShiftPoint = this._ZOOM_STEPS,
                zoomCaller, interval;

            zoomCaller = _.bind(function() {
                this._zoomGraph(-1, true);
            }, this);

            interval = setInterval(function() {
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
        "_graphDoubleClick": function(event) {
            this.activateScope();

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                doubleClickZoomAllow = graphDisplay._zoomingFactor.doubleClickZoomAllow,
                defaultZoomAllow = this.getDefaultZoomBehaviour(),
                i = 1,
                origins = graphDisplay._graphOrigin,
                clickedPoint = event.point,

                defaultOrigin = origins.defaultOrigin,
                zoomingFactors = graphDisplay._zoomingFactor,
                zoomCaller,
                interval, clickedPointGraphCoOrdinate,
                totalShiftPoint = this._ZOOM_STEPS;

            if (!this._shapePan && defaultZoomAllow !== false && doubleClickZoomAllow !== false) {

                origins.isOriginPositionChanged = true;
                clickedPointGraphCoOrdinate = this._getGraphPointCoordinates([clickedPoint.x, clickedPoint.y]);

                zoomCaller = _.bind(function() {
                    this._zoomGraph(1, false, false, clickedPointGraphCoOrdinate);
                }, this);

                interval = setInterval(_.bind(function() {
                    zoomCaller();
                    i++;

                    if (i > totalShiftPoint) {
                        clearInterval(interval);
                        zoomingFactors.refPoint = this._getGraphPointCoordinates([defaultOrigin.x, defaultOrigin.y]);
                    }

                }, this), 0.1);
            }
        },

        /**
         *Change x-axis markers from degree to radians or vice-versa.
         *
         *@private
         *@method _xAxisMarkerStyleToggle
         *@return
         */
        "_xAxisMarkerStyleToggle": function() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isXmarkerInRadians = !graphDisplay._graphDisplay.isXmarkerInRadians;

            this._graphTypeSelector();
        },

        /**
         *Set x-Axis markers value to degree or radian,depending upon input parameter.
         *if input parameter is true then y-axis marker is in radian,otherwise in degree.
         *
         *@private
         *@method _xAxisMarkerLineStyle
         *@param {Boolean} isRadian
         *@return
         */

        "_xAxisMarkerLineStyle": function(isInRadian) {
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

        "_yAxisMarkerStyleToggle": function() {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');
            graphDisplay._graphDisplay.isYmarkerInRadians = !graphDisplay._graphDisplay.isYmarkerInRadians;

            this._graphTypeSelector();
        },

        /**
         *Set y-Axis markers value to degree or radian,depending upon input parameter.
         *if input parameter is true then y-axis marker is in radian,otherwise in degree.
         *
         *@private
         *@method _yAxisMarkerLineStyle
         *@param {Boolean} isRadian
         *@return
         */

        "_yAxisMarkerLineStyle": function(isInRadian) {
            var modelObject, graphDisplay;

            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isYmarkerInRadians = isInRadian;

            this._graphTypeSelector();
        },

        /**
         *Change graph type from polar to Cartesian or vice-versa
         *
         *@private
         *@method _graphTypeChange
         *@return
         */
        "_graphTypeChange": function() {
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
        "_polarAngleLineMarkerStyleToggle": function() {
            var modelObject, graphDisplay;
            modelObject = this._gridGraphModelObject;
            graphDisplay = modelObject.get('_graphDisplayValues');

            graphDisplay._graphDisplay.isPolarAngleInRadian = !graphDisplay._graphDisplay.isPolarAngleInRadian;
            this._graphTypeSelector();
        },

        /**
         *Set polar angle markers value to degree or radian,depending upon input parameter.
         *if input parameter is true then polar Angle Style is in radian,otherwise in degree.
         *
         *@private
         *@method _polarAngleLineMarkerStyle
         *@param {Boolean} isRadian
         *@return
         */

        "_polarAngleLineMarkerStyle": function(isInRadian) {
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
        "defaultGraphZoom": function() {
            this._restoreDefaultZoomingClicked();
        },

        /**
         *Reset graph to default zoom-in value.
         *
         *@private
         *@method _restoreDefaultZooming
         *@return
         */
        "_restoreDefaultZoomingClicked": function() {

            this._restoreDefaultZoom();
            this.refreshView();
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
        "_restoreDefaultZoom": function() {
            this.activateScope();

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                limits = graphDisplay._graphsAxisLimits,
                defaultLimits = limits.defaultLimits,
                zoomingFactor = graphDisplay._zoomingFactor,
                parameters = graphDisplay._graphParameters,
                factors = this._zoomFactors,
                origins = graphDisplay._graphOrigin,
                xLower = defaultLimits.xLower,
                xUpper = defaultLimits.xUpper,
                yLower = defaultLimits.yLower,
                yUpper = defaultLimits.yUpper;

            zoomingFactor.xCurrentFactor = zoomingFactor.yCurrentFactor = factors[1];
            zoomingFactor.xZoomMultiplier = zoomingFactor.yZoomMultiplier = 1;
            zoomingFactor.xTotalMultiplier = zoomingFactor.yTotalMultiplier = factors[1];
            parameters.yGridLine = 4;
            parameters.xGridLine = 4;

            zoomingFactor.zoomLevel = 1;

            origins.isOriginPositionChanged = false;

            limits.isXLastChangedLimit = true;

            //count number of time zoom-in and out

            this._setGraphLimits(xLower, xUpper, yLower, yUpper);

            /*equalize vertical axis as horizontal axis*/
            this._equalizeAxisScales();

            zoomingFactor.refPoint = this._getGraphPointCoordinates([origins.defaultOrigin.x, origins.defaultOrigin.y]);
            clearTimeout($.data(this, 'timer'));
            $.data(this, 'timer', setTimeout(_.bind(function() {
                this.trigger('grid:zoom-compleated');
                if (modelObject.get('_plots').length !== 0 || modelObject.get('_images').length !== 0) {
                    this._shapeRedraw();
                }
            }, this), 100));
            this.trigger('zooming');
            this.updateVisibleDomain();
            this.refreshView();
        },
        /**
         *Zoom graph depending upon mouse-wheel movement.
         *
         *@private
         *@method _zoomGraph
         *@param {int} delta Graph is zoom in or out  depending on value of delta,if positive graph is zoom-in and if negative its been zoom-out
         *@param {Boolean} ismouseWheel Boolean to state whether the zoom is through mousewheel
         *@param {Boolean} isPinchZoom Boolean to state whether the zoom is through pinch
         *@param {Object} refPoint Object containing x and y coordinates for zoom reference point
         *@return
         */
        /*Zooming Function*/
        "_zoomGraph": function(delta, ismouseWheel, isPinchZoom, refPoint) {

            this.activateScope();
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                graphParameters = graphDisplay._graphParameters,
                origins = graphDisplay._graphOrigin,
                height = this._canvasSize.height,
                width = this._canvasSize.width,
                currentOrigin = origins.currentOrigin,
                zoomingFactors = graphDisplay._zoomingFactor,
                shiftDistance = null,
                angle = null,
                newOriginPoint,
                zoomFactor = this._zoomLevelLimits(),
                shiftFactor = null;
            refPoint = refPoint || zoomingFactors.refPoint;
            if (this.isDragInProgress && !isPinchZoom ||
                this._gridGraphModelObject.get('_gridMode') === 'annotation-mode' && !isPinchZoom ||
                this._gridGraphModelObject.get('_gridMode') !== 'Graph') {
                return;
            }
            ismouseWheel = null;

            if (delta === 0) {
                return;
            }
            if (delta > 0) {

                //zoom in //scroll up //increase
                shiftFactor = this._originShiftFactor(refPoint, true);
                shiftDistance = shiftFactor.distance;
                angle = shiftFactor.angle;

                /*ShiftOrigin*/
                this.activateScope();
                newOriginPoint = new this._paperScope.Point(currentOrigin.x + Math.cos(angle) * shiftDistance, currentOrigin.y - Math.sin(angle) * shiftDistance);
                this._delta = new this._paperScope.Point(origins.currentOrigin.x - newOriginPoint.x, origins.currentOrigin.y - newOriginPoint.y);
                origins.currentOrigin = newOriginPoint;
                this._previousMaxValue = this._getGraphPointCoordinates([width, height / 2])[0];

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

                graphParameters.currentDistanceBetweenTwoVerticalLines = zoomingFactors.currentXZoomLevel * graphParameters.distanceBetweenTwoVerticalLines;
                graphParameters.totalVerticalLines = width / graphParameters.currentDistanceBetweenTwoVerticalLines;

                graphParameters.currentDistanceBetweenTwoHorizontalLines = zoomingFactors.currentYZoomLevel * graphParameters.distanceBetweenTwoHorizontalLines;
                graphParameters.totalHorizontalLines = height / graphParameters.currentDistanceBetweenTwoHorizontalLines;

            } else {
                //zoom out //scroll down //decrease
                shiftFactor = this._originShiftFactor(refPoint, false);
                shiftDistance = shiftFactor.distance;
                angle = shiftFactor.angle;
                /*ShiftOrigin*/

                this.activateScope();
                newOriginPoint = new this._paperScope.Point(currentOrigin.x + Math.cos(angle) * shiftDistance, currentOrigin.y - Math.sin(angle) * shiftDistance);
                this._delta = new this._paperScope.Point(origins.currentOrigin.x - newOriginPoint.x, origins.currentOrigin.y - newOriginPoint.y);
                origins.currentOrigin = newOriginPoint;
                this._previousMaxValue = this._getGraphPointCoordinates([width, height / 2])[0];

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

                graphParameters.currentDistanceBetweenTwoVerticalLines = zoomingFactors.currentXZoomLevel * graphParameters.distanceBetweenTwoVerticalLines;
                graphParameters.totalVerticalLines = width / graphParameters.currentDistanceBetweenTwoVerticalLines;

                graphParameters.currentDistanceBetweenTwoHorizontalLines = zoomingFactors.currentYZoomLevel * graphParameters.distanceBetweenTwoHorizontalLines;
                graphParameters.totalHorizontalLines = height / graphParameters.currentDistanceBetweenTwoHorizontalLines;
            }

            this._graphLimitChangesDuringDragging();

            this._deltaAngle();

            this._graphTypeSelector();

            if (modelObject.get('_plots').length !== 0) {
                this._shapeZoom();
            }
            if (modelObject.get('_points').length !== 0) {
                this._repositionPoints();
            }

            clearTimeout($.data(this, 'timer'));
            $.data(this, 'timer', setTimeout(_.bind(function() {
                this.trigger('grid:zoom-compleated');
                if (modelObject.get('_plots').length !== 0 || modelObject.get('_images').length !== 0) {
                    this._shapeRedraw();
                }
            }, this), 100));
            this.trigger('zooming');
            this.updateVisibleDomain();
            this.refreshView();
        },

        /**
         *It is used to increase or decrease X-axis zoomFactors values
         *
         *@private
         *@method _xAxisZoomFactorModifier
         *@param {Boolean} isXzoomFactorIncrease if true x-axis zoom-factor increase else decreases
         *@return
         */
        "_xAxisZoomFactorModifier": function(isXzoomFactorIncrease) {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                zoomingFactors = graphDisplay._zoomingFactor,
                nextFactors = this._nextMarkerFactors(isXzoomFactorIncrease).xMarker;

            zoomingFactors.xCurrentFactor = nextFactors.xCurrentFactor;
            zoomingFactors.xTotalMultiplier = nextFactors.xTotalMultiplier;
            zoomingFactors.xZoomMultiplier = nextFactors.xZoomMultiplier;
            graphDisplay._graphParameters.xGridLine = this._numberOfMarkerLines(zoomingFactors.xTotalMultiplier);
        },

        /**
         *It is used to increase or decrease Y-axis zoomFactors values
         *
         *@private
         *@method _yAxisZoomFactorModifier
         *@param {Boolean} isYzoomFactorIncrease if true y-axis zoom-factor increases else decreases
         *@return
         */
        "_yAxisZoomFactorModifier": function(isYzoomFactorIncrease) {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                zoomingFactors = graphDisplay._zoomingFactor,
                nextFactors = this._nextMarkerFactors(isYzoomFactorIncrease).yMarker;

            zoomingFactors.yCurrentFactor = nextFactors.yCurrentFactor;
            zoomingFactors.yTotalMultiplier = nextFactors.yTotalMultiplier;
            zoomingFactors.yZoomMultiplier = nextFactors.yZoomMultiplier;
            graphDisplay._graphParameters.yGridLine = this._numberOfMarkerLines(zoomingFactors.yTotalMultiplier);
        },
        /**
         * Returns next marker multiplier values.
         * @method _nextMarkerFactors
         * @param isIncrease{Boolean} if true marker's value increase,else decrease
         * @private
         */
        "_nextMarkerFactors": function(isIncrease) {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                zoomingFactors = graphDisplay._zoomingFactor,
                factor = this._zoomFactors,
                newMarkerValue = {
                    "xMarker": {},
                    "yMarker": {}
                },
                multiplicationFactor = 10;

            if (isIncrease) {
                //x-Marker
                switch (zoomingFactors.xCurrentFactor) {
                    case factor[0]:
                        newMarkerValue.xMarker.xCurrentFactor = factor[1];
                        newMarkerValue.xMarker.xZoomMultiplier = zoomingFactors.xZoomMultiplier;
                        newMarkerValue.xMarker.xTotalMultiplier = newMarkerValue.xMarker.xCurrentFactor * newMarkerValue.xMarker.xZoomMultiplier;
                        break;

                    case factor[1]:
                        newMarkerValue.xMarker.xCurrentFactor = factor[2];
                        newMarkerValue.xMarker.xZoomMultiplier = zoomingFactors.xZoomMultiplier;
                        newMarkerValue.xMarker.xTotalMultiplier = newMarkerValue.xMarker.xCurrentFactor * newMarkerValue.xMarker.xZoomMultiplier;
                        break;

                    case factor[2]:
                        newMarkerValue.xMarker.xCurrentFactor = factor[0];
                        newMarkerValue.xMarker.xZoomMultiplier = zoomingFactors.xZoomMultiplier * multiplicationFactor;
                        newMarkerValue.xMarker.xTotalMultiplier = newMarkerValue.xMarker.xCurrentFactor * newMarkerValue.xMarker.xZoomMultiplier;
                        break;
                }
                //y-marker
                switch (zoomingFactors.yCurrentFactor) {
                    case factor[0]:
                        newMarkerValue.yMarker.yCurrentFactor = factor[1];
                        newMarkerValue.yMarker.yZoomMultiplier = zoomingFactors.yZoomMultiplier;
                        newMarkerValue.yMarker.yTotalMultiplier = newMarkerValue.yMarker.yCurrentFactor * newMarkerValue.yMarker.yZoomMultiplier;
                        break;

                    case factor[1]:
                        newMarkerValue.yMarker.yCurrentFactor = factor[2];
                        newMarkerValue.yMarker.yZoomMultiplier = zoomingFactors.yZoomMultiplier;
                        newMarkerValue.yMarker.yTotalMultiplier = newMarkerValue.yMarker.yCurrentFactor * newMarkerValue.yMarker.yZoomMultiplier;
                        break;

                    case factor[2]:
                        newMarkerValue.yMarker.yCurrentFactor = factor[0];
                        newMarkerValue.yMarker.yZoomMultiplier = zoomingFactors.yZoomMultiplier * multiplicationFactor;
                        newMarkerValue.yMarker.yTotalMultiplier = newMarkerValue.yMarker.yCurrentFactor * newMarkerValue.yMarker.yZoomMultiplier;
                        break;
                }

            } else {
                //x-Marker
                switch (zoomingFactors.xCurrentFactor) {
                    case factor[0]:
                        newMarkerValue.xMarker.xCurrentFactor = factor[2];
                        newMarkerValue.xMarker.xZoomMultiplier = zoomingFactors.xZoomMultiplier / multiplicationFactor;
                        newMarkerValue.xMarker.xTotalMultiplier = newMarkerValue.xMarker.xCurrentFactor * newMarkerValue.xMarker.xZoomMultiplier;
                        break;

                    case factor[1]:
                        newMarkerValue.xMarker.xCurrentFactor = factor[0];
                        newMarkerValue.xMarker.xZoomMultiplier = zoomingFactors.xZoomMultiplier;
                        newMarkerValue.xMarker.xTotalMultiplier = newMarkerValue.xMarker.xCurrentFactor * newMarkerValue.xMarker.xZoomMultiplier;
                        break;

                    case factor[2]:
                        newMarkerValue.xMarker.xCurrentFactor = factor[1];
                        newMarkerValue.xMarker.xZoomMultiplier = zoomingFactors.xZoomMultiplier;
                        newMarkerValue.xMarker.xTotalMultiplier = newMarkerValue.xMarker.xCurrentFactor * newMarkerValue.xMarker.xZoomMultiplier;
                        break;
                }
                //y-marker
                switch (zoomingFactors.yCurrentFactor) {
                    case factor[0]:
                        newMarkerValue.yMarker.yCurrentFactor = factor[2];
                        newMarkerValue.yMarker.yZoomMultiplier = zoomingFactors.yZoomMultiplier / multiplicationFactor;
                        newMarkerValue.yMarker.yTotalMultiplier = newMarkerValue.yMarker.yCurrentFactor * newMarkerValue.yMarker.yZoomMultiplier;
                        break;

                    case factor[1]:
                        newMarkerValue.yMarker.yCurrentFactor = factor[0];
                        newMarkerValue.yMarker.yZoomMultiplier = zoomingFactors.yZoomMultiplier;
                        newMarkerValue.yMarker.yTotalMultiplier = newMarkerValue.yMarker.yCurrentFactor * newMarkerValue.yMarker.yZoomMultiplier;
                        break;

                    case factor[2]:
                        newMarkerValue.yMarker.yCurrentFactor = factor[1];
                        newMarkerValue.yMarker.yZoomMultiplier = zoomingFactors.yZoomMultiplier;
                        newMarkerValue.yMarker.yTotalMultiplier = newMarkerValue.yMarker.yCurrentFactor * newMarkerValue.yMarker.yZoomMultiplier;
                        break;
                }
            }
            return newMarkerValue;
        },

        /**
         *Calculate angle between given point and canvas center point.
         *
         *@private
         *@method _angleBetweenTwoPoints
         *@param point  angle made by point from canvas center is calculated.
         *@return
         */

        /*Calculate angle between current-origin and center of graph after graph is drag and graph limit change */
        "_angleBetweenTwoPoints": function(fromPoint, toPoint) {
            var height = Math.abs(fromPoint.y - toPoint.y),
                width = Math.abs(fromPoint.x - toPoint.x),
                angle = Math.atan(width / height);

            if (fromPoint.y < toPoint.y) {
                if (fromPoint.x < toPoint.x) {
                    angle = 3 * Math.PI / 2 + angle;
                } else if (fromPoint.x > toPoint.x) {
                    angle = 3 * Math.PI / 2 - angle;
                } else {
                    angle = 3 * Math.PI / 2;
                }
            } else if (fromPoint.y > toPoint.y) {
                if (fromPoint.x < toPoint.x) {
                    angle = Math.PI / 2 - angle;
                } else if (fromPoint.x > toPoint.x) {
                    angle = Math.PI / 2 + angle;
                } else {
                    angle = Math.PI / 2;
                }
            } else {
                if (fromPoint.x < toPoint.x) {
                    angle = 0;
                } else if (fromPoint.x > toPoint.x) {
                    angle = Math.PI;
                } else {
                    angle = 0;
                }
            }
            return angle;
        },

        /**
         *Calculate graph limits(X-axis and Y-axis's upper and lower values ) when graph is dragged or zoom.
         *@private
         *@method _graphLimitChangesDuringDragging
         *@return
         */
        "_graphLimitChangesDuringDragging": function() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                currentOrigin = graphDisplay._graphOrigin.currentOrigin,
                currentLimits = graphDisplay._graphsAxisLimits.currentLimits,
                canvasHeight = this._canvasSize.height,
                canvasWidth = this._canvasSize.width;

            currentLimits.yLower = this._getGraphPointCoordinates([currentOrigin.x, canvasHeight])[1];
            currentLimits.yUpper = this._getGraphPointCoordinates([currentOrigin.x, 0])[1];
            currentLimits.xUpper = this._getGraphPointCoordinates([canvasWidth, currentOrigin.y])[0];
            currentLimits.xLower = this._getGraphPointCoordinates([0, currentOrigin.y])[0];

            this._setBounds();

            this._setTextBoxValues();
        },

        "setTextBoxValuesToPrevious": function() {
            this._setTextBoxValues();
        },

        /**
         *Set text boxes(X-Upper, X-Lower, Y-Upper, Y-Lower) value, when graph is dragged or zoom.
         *
         *@private
         *@method _setTextBoxValues
         *@return
         */
        "_setTextBoxValues": function() {
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
        "_graphAxisLimitChangedByUserInput": function(isXlimitChange) {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                domElement = graphDisplay._graphLimitTextBoxDomElement,
                limits = graphDisplay._graphsAxisLimits,
                currentLimits = limits.currentLimits,
                xLower = domElement.xLower.value,
                xUpper = domElement.xUpper.value,
                yLower = domElement.yLower.value,
                yUpper = domElement.yUpper.value,
                isXLowerProperNumber = this._checkForNumericValue(xLower),
                isXUpperProperNumber = this._checkForNumericValue(xUpper),
                isYLowerProperNumber = this._checkForNumericValue(yLower),
                isYUpperProperNumber = this._checkForNumericValue(yUpper),
                allowedString = [];


            if (isXLowerProperNumber && isXUpperProperNumber && isYLowerProperNumber && isYUpperProperNumber) {
                if (currentLimits.xLower !== parseFloat(xLower) || currentLimits.xUpper !== parseFloat(xUpper) ||
                    currentLimits.yLower !== parseFloat(yLower) || currentLimits.yUpper !== parseFloat(yUpper)) {
                    /*check is X is last changed or not, it is used in equalizing axis scales*/
                    graphDisplay._graphsAxisLimits.isXLastChangedLimit = isXlimitChange;

                    this._setGraphLimits(xLower, xUpper, yLower, yUpper);

                    this.drawGraph();

                    this._deltaAngle();

                    this._triggerEqualizeEvent(graphDisplay._zoomingFactor.xTotalMultiplier !== graphDisplay._zoomingFactor.yTotalMultiplier);
                }
            } else {
                allowedString = ['', '-'];
                if (allowedString.indexOf(xLower) === -1 && allowedString.indexOf(xUpper) === -1 &&
                    allowedString.indexOf(yLower) === -1 && allowedString.indexOf(yUpper) === -1) {
                    this._setTextBoxValues();
                }
            }
            this.trigger('graph:limits-changed');
            clearTimeout($.data(this, 'timer'));
            $.data(this, 'timer', _.delay(_.bind(function() {
                if (modelObject.get('_plots').length !== 0 || modelObject.get('_images').length !== 0) {
                    this._shapeRedraw();
                }
            }, this), 100)); // to redraw shapes after calculations are completed
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
        "_axisMarkerMultiplierAdjuster": function(xLower, xUpper, yLower, yUpper) {
            this._setGraphLimits(xLower, xUpper, yLower, yUpper);
        },

        /**
         *Check if given string contains all numeric character.
         *
         *@private
         *@method _checkForNumericValue
         *@param {Number} inputNumber an sting to be check for required format.
         *@return {Boolean}  return `true` if string is in correct format, else false.
         */
        "_checkForNumericValue": function(inputNumber) {
            var inputText = inputNumber.toString(),
                asciiValue, flag, noOfMinusSign, noOfDots, counter,
                ASCII_MINUS = 45,
                ASCII_DOT = 46,
                ASCII_ZERO = 48,
                ASCII_NINE = 57;

            if (inputText.length > 0) {
                flag = true;
                noOfMinusSign = 0;
                noOfDots = 0;
                for (counter = 0; counter < inputText.length; counter++) {
                    asciiValue = inputText[counter].charCodeAt();
                    if (!(asciiValue >= ASCII_ZERO && asciiValue <= ASCII_NINE || asciiValue === ASCII_MINUS || asciiValue === ASCII_DOT)) {
                        flag = false;
                        break;
                    }
                    if (asciiValue === ASCII_MINUS) {
                        noOfMinusSign++;
                        if (counter > 0) {
                            flag = false;
                            break;
                        }
                    } else if (asciiValue === ASCII_DOT) {
                        noOfDots++;
                    }
                    if (noOfDots > 1 || noOfMinusSign > 1) {
                        flag = false;
                        break;
                    }
                }
                if (inputText.length === 1 && asciiValue === ASCII_MINUS) {
                    flag = false;
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
        "_graphTypeSelector": function() {
            this.activateScope();

            this.activateLayer();

            if (this.isCustomModeOn === true) {
                return;
            }
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues');

            if (graphDisplay._graphDisplay.isCartesionCurrentGraphType === true) {
                this._cartesianGraph();
            } else {
                this._polarGraph();
            }

            this._drawAxisLines();
            this._axisMarker();

            this.refreshView();
        },

        "getMarkerBounds": function() {
            return this.markerBounds;
        },


        "equalizeAxis": function() {
            var graphParameters = this._gridGraphModelObject.get('_graphDisplayValues')._graphParameters;
            if (graphParameters.distanceBetweenTwoVerticalLines !== graphParameters.distanceBetweenTwoHorizontalLines) {
                this._equalizeAxisScales();
            }
        },
        /**
         *Equalize axis scales, when user click 'equalize scale' button
         *
         *@private
         *@method _equalizeAxisScales
         *@return
         */
        "_equalizeAxisScales": function() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                canvas = this._canvasSize,
                limits = graphDisplay._graphsAxisLimits,
                parameters = graphDisplay._graphParameters,
                canvasHeight = canvas.height,
                canvasWidth = canvas.width,
                origin = graphDisplay._graphOrigin.currentOrigin,
                defaultOrigin = graphDisplay._graphOrigin.defaultOrigin,
                zooming = graphDisplay._zoomingFactor,
                graphCurrentLimits = limits.currentLimits,
                xLowerMultiplier, xUpperMultiplier, yLowerMultiplier, yUpperMultiplier;

            if (graphDisplay._graphDisplay.isEqualizeAtDefault !== false) {
                if (limits.isXLastChangedLimit === true) {
                    if (origin.y < 0) {
                        yLowerMultiplier = -1;
                        yUpperMultiplier = -1;
                    } else if (origin.y > canvasHeight) {
                        yLowerMultiplier = 1;
                        yUpperMultiplier = 1;
                    } else {
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

                    graphCurrentLimits.yLower = yLowerMultiplier * (Math.abs(origin.y - canvasHeight) / parameters.currentDistanceBetweenTwoHorizontalLines) / parameters.yGridLine * zooming.yTotalMultiplier;
                    graphCurrentLimits.yUpper = yUpperMultiplier * (Math.abs(origin.y) / parameters.currentDistanceBetweenTwoHorizontalLines) / parameters.yGridLine * zooming.yTotalMultiplier;

                } else {
                    if (origin.x < 0) {
                        xLowerMultiplier = 1;
                        xUpperMultiplier = 1;
                    } else if (origin.x > canvasWidth) {
                        xLowerMultiplier = -1;
                        xUpperMultiplier = -1;
                    } else {
                        xLowerMultiplier = -1;
                        xUpperMultiplier = 1;
                    }

                    parameters.distanceBetweenTwoVerticalLines = parameters.distanceBetweenTwoHorizontalLines;
                    parameters.currentDistanceBetweenTwoVerticalLines = parameters.currentDistanceBetweenTwoHorizontalLines;
                    parameters.totalVerticalLines = canvasWidth / parameters.currentDistanceBetweenTwoVerticalLines;

                    graphCurrentLimits.xUpper = xUpperMultiplier * (Math.abs(origin.x - canvasWidth) / parameters.currentDistanceBetweenTwoVerticalLines) / parameters.xGridLine * zooming.xTotalMultiplier;
                    graphCurrentLimits.xLower = xLowerMultiplier * (Math.abs(origin.x) / parameters.currentDistanceBetweenTwoHorizontalLines) / parameters.xGridLine * zooming.xTotalMultiplier;
                }
            }

            this._triggerEqualizeEvent(false);

            this._setBounds();

            this._originPositionOnGraph();

            this.drawGraph();

            this._setTextBoxValues();

            zooming.refPoint = this._getGraphPointCoordinates([defaultOrigin.x, defaultOrigin.y]);
        },

        /**
         *Generate different Symbol for drawing Cartesian graph
         *
         *@private
         *@method _cartesianSymbolGenerator
         *@return
         */

        /*create symbol for Cartesian graph*/
        "_cartesionSymbolGenerator": function() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                height = this._canvasSize.height,
                width = this._canvasSize.width,
                symbols = graphDisplay._symbols,
                innerXaxisPath, markerXaxisPath, innerXaxisSymbol, markerXaxisSymbol,
                innerYaxisPath, markerYaxisPath, innerYaxisSymbol, markerYaxisSymbol, XaxisPath, YaxisPath, XaxisSymbol, YaxisSymbol,
                gridLineStyle = this._gridGraphModelObject.get('gridLineStyle'),
                paperScope = this._paperScope,
                projector = graphDisplay._graphDisplay.isProjectorModeOn === false ? '' : 'Projector';

            /////////////////----------- vertical Axis Symbol------------/////////////////
            /*Create path for X value(vertical inner Line) and set its property*/
            innerXaxisPath = new paperScope.Path.Line({
                "from": [0, 0],
                "to": [0, height],
                "strokeColor": new paperScope.Color(gridLineStyle.color.xLine['gridLine' + projector]),
                "strokeWidth": gridLineStyle.size.xLine['gridLine' + projector]
            });

            /*Create path for X value(vertical line marker) and set its property*/
            markerXaxisPath = new paperScope.Path.Line({
                "from": [0, 0],
                "to": [0, height],
                "strokeColor": new paperScope.Color(gridLineStyle.color.xLine['markerLine' + projector]),
                "strokeWidth": gridLineStyle.size.xLine['markerLine' + projector]
            });

            /*create Symbol for innerXaxisPath(vertical inner line)*/
            innerXaxisSymbol = new paperScope.Symbol(innerXaxisPath);

            /*create Symbol for markerXaxisPath(vertical line marker)*/
            markerXaxisSymbol = new paperScope.Symbol(markerXaxisPath);

            /*remove vertical line paths, after there symbol is created*/
            innerXaxisPath.remove();
            markerXaxisPath.remove();

            symbols.xInnerGridLines = innerXaxisSymbol;
            symbols.xMarkerLines = markerXaxisSymbol;

            /////////////////----------- horizontal Axis Symbol------------/////////////////

            /*Create path for Y value(Horizontal inner Line) and set its property*/
            innerYaxisPath = new paperScope.Path.Line({
                "from": [0, 0],
                "to": [width, 0],
                "strokeColor": new paperScope.Color(gridLineStyle.color.yLine['gridLine' + projector]),
                "strokeWidth": gridLineStyle.size.yLine['gridLine' + projector]
            });

            /*Create path for Y value(Horizontal line marker) and set its property*/
            markerYaxisPath = new paperScope.Path.Line({
                "from": [0, 0],
                "to": [width, 0],
                "strokeColor": new paperScope.Color(gridLineStyle.color.yLine['markerLine' + projector]),
                "strokeWidth": gridLineStyle.size.yLine['markerLine' + projector]
            });

            /*create Symbol for innerYaxisPath(Horizontal inner line)*/
            innerYaxisSymbol = new paperScope.Symbol(innerYaxisPath);

            /*create Symbol for markerYaxisPath(Horizontal line marker)*/
            markerYaxisSymbol = new paperScope.Symbol(markerYaxisPath);

            /*remove Horizontal line paths, after there symbol is created*/
            innerYaxisPath.remove();
            markerYaxisPath.remove();

            symbols.yInnerGridLines = innerYaxisSymbol;
            symbols.yMarkerLines = markerYaxisSymbol;

            //////////////////----------X-axis and Y-axis-----------------//////////////////////////

            YaxisPath = new paperScope.Path.Line({
                "from": [0, 0],
                "to": [0, height],
                "strokeColor": new paperScope.Color(gridLineStyle.color.yLine['axisLine' + projector]),
                "strokeWidth": gridLineStyle.size.yLine['axisLine' + projector]
            });

            XaxisPath = new paperScope.Path.Line({
                "from": [0, 0],
                "to": [width, 0],
                "strokeColor": new paperScope.Color(gridLineStyle.color.xLine['axisLine' + projector]),
                "strokeWidth": gridLineStyle.size.xLine['axisLine' + projector]
            });

            XaxisSymbol = new paperScope.Symbol(XaxisPath);
            YaxisSymbol = new paperScope.Symbol(YaxisPath);

            XaxisPath.remove();
            YaxisPath.remove();

            symbols.xAxis = XaxisSymbol;
            symbols.yAxis = YaxisSymbol;
        },

        /**
         *Calculate distance between two adjacent horizontal and vertical lines, also calculate total number of horizontal and vertical lines present on canvas.
         *
         *@private
         *@method _distanceBetweenLinesCalculator
         *@return
         */

        /*calculate total number of vertical and horizontal lines on canvas and distance between them*/
        "_distanceBetweenLinesCalculator": function() {
            var graphDisplay = this._gridGraphModelObject.get('_graphDisplayValues'),
                currentLimits = graphDisplay._graphsAxisLimits.currentLimits,
                adjacentLinesParameter,
                parameters = graphDisplay._graphParameters;

            //call function to calculate distance between lines
            adjacentLinesParameter = this._calculateDistanceBetweenAdjacentLines(currentLimits.xLower, currentLimits.xUpper, currentLimits.yLower, currentLimits.yUpper);

            parameters.totalVerticalLines = adjacentLinesParameter.totalVerticalLines;
            parameters.distanceBetweenTwoVerticalLines = parameters.currentDistanceBetweenTwoVerticalLines = adjacentLinesParameter.distanceBetweenVerticalLines;
            parameters.totalHorizontalLines = adjacentLinesParameter.totalHorizontalLines;
            parameters.distanceBetweenTwoHorizontalLines = parameters.currentDistanceBetweenTwoHorizontalLines = adjacentLinesParameter.distanceBetweenHorizontalLines;
        },
        /**
         * calculate distance between lines and number of lines depending upon axis limits.
         * @method _calculateDistanceBetweenAdjacentLines
         * @param xLower {Number} lower limit of x-axis
         * @param xUpper {Number} Upper limit of x-axis
         * @param yLower {Number} lower limit of y-axis
         * @param yUpper {Number} Upper limit of y-axis
         * @private
         */
        /*calculate distance between adjacent lines,it consider */
        "_calculateDistanceBetweenAdjacentLines": function(xLower, xUpper, yLower, yUpper) {
            var height = this._canvasSize.height,
                width = this._canvasSize.width,
                modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                parameters = graphDisplay._graphParameters,
                xMarkerGrid = parameters.xGridLine,
                yMarkerGrid = parameters.yGridLine,
                graphVerticalLines, verticalLineDistance,
                graphHorizontalLines, horizontalineDistance;

            /*count total number of vertical Line*/

            graphVerticalLines = (xUpper - xLower) / graphDisplay._zoomingFactor.xTotalMultiplier * xMarkerGrid;
            verticalLineDistance = width / graphVerticalLines;
            graphHorizontalLines = (yUpper - yLower) / graphDisplay._zoomingFactor.yTotalMultiplier * yMarkerGrid;
            horizontalineDistance = height / graphHorizontalLines;

            return {
                "distanceBetweenVerticalLines": verticalLineDistance,
                "totalVerticalLines": graphVerticalLines,
                "distanceBetweenHorizontalLines": horizontalineDistance,
                "totalHorizontalLines": graphHorizontalLines
            };
        },

        /**
         * Calculate origin co-ordinates.
         * @method _originPositionOnGraph
         * @private
         */
        "_originPositionOnGraph": function() {
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
                xPosition = -xLowerValue;
            } else {
                xPosition = Math.abs(xLowerValue);
            }
            if (yUpperValue <= 0) {
                yPosition = -Math.abs(yUpperValue);
            } else {
                yPosition = Math.abs(yUpperValue);
            }
            graphDisplay._graphOrigin.currentOrigin = new scope.Point(xPosition / graphDisplay._zoomingFactor.xTotalMultiplier * xMarkerGrid * parameters.currentDistanceBetweenTwoVerticalLines, yPosition / graphDisplay._zoomingFactor.yTotalMultiplier * yMarkerGrid * parameters.currentDistanceBetweenTwoHorizontalLines);

            this._previousMaxValue = this._getGraphPointCoordinates([width, height / 2])[0];
        },

        /**
         *Draw Cartesian graph.
         *
         *@private
         *@method _cartesianGraph
         *@return
         */

        /*Function Draw Cartesian graph*/
        "_cartesianGraph": function() {
            this._paperScope.project.activeLayer.removeChildren();

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                canvas = this._canvasSize,
                parameters = graphDisplay._graphParameters,
                symbols = graphDisplay._symbols,
                isGridLineShown = graphDisplay._graphDisplay.isGridLineShown,
                height = canvas.height,
                width = canvas.width,
                xMarkerGrid = parameters.xGridLine,
                yMarkerGrid = parameters.yGridLine,
                originPoint = graphDisplay._graphOrigin.currentOrigin,
                verticalLinesDistance, totalVerticalLinesOnCanvas,
                canvasDistanceLeftOfOrigin, canvasLinesLeftOfOrigin, xExtraCanvasDistance, lineCounter, xlineCountDecider, originDistanceLeftofCanvas, linesLeftOfCanvas,
                horizontalLinesDistance, totalHorizontalLinesOnCanvas, canvasDistanceaboveOfOrigin, canvasLinesAboveOfOrigin, yExtraCanvasDistance,
                ylineCountDecider, originDistanceAboveofCanvas, linesAboveCanvas,
                markerStartingValueInRadian, markerPosition, distanceBetweenOriginAndfirstPoint, adjacentVerticalLinesDistance, totalVerticalLines,
                minZoomInDistance, adjacentHorizontalLinesDistance, totalHorizontalLines, markerStartingValue, markerForRadian;

            //condition to check if grid line to be drawn
            if (isGridLineShown === true) {

                //--------------------x-grid lines-----------------------------------//

                if (graphDisplay._graphDisplay.isXmarkerInRadians === false) {
                    //x-axis MarkerLines in degree
                    //                ////======vertical Lines  parameter calculator========/////
                    verticalLinesDistance = parameters.currentDistanceBetweenTwoVerticalLines;
                    totalVerticalLinesOnCanvas = parameters.totalVerticalLines;

                } else {
                    //x-axis Marker line in Radian

                    minZoomInDistance = this._zoomLevelLimits().xMinZoomLevel * parameters.distanceBetweenTwoVerticalLines;
                    markerForRadian = this._getRadianMarkers(minZoomInDistance, true);
                    markerStartingValueInRadian = markerForRadian.marker;

                    markerStartingValue = markerStartingValueInRadian / Math.PI;

                    xMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                    markerPosition = this._getCanvasPointCoordinates([markerStartingValueInRadian, 0]);
                    distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.x - markerPosition[0]);
                    adjacentVerticalLinesDistance = distanceBetweenOriginAndfirstPoint / xMarkerGrid;
                    totalVerticalLines = width / adjacentVerticalLinesDistance;

                    if (adjacentVerticalLinesDistance < minZoomInDistance) {
                        markerStartingValueInRadian = markerForRadian.maxMarker;
                        markerStartingValue = markerStartingValueInRadian / Math.PI;

                        xMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                        markerPosition = this._getCanvasPointCoordinates([markerStartingValueInRadian, 0]);
                        distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.x - markerPosition[0]);
                        adjacentVerticalLinesDistance = distanceBetweenOriginAndfirstPoint / xMarkerGrid;
                        totalVerticalLines = width / adjacentVerticalLinesDistance;
                    }
                    verticalLinesDistance = adjacentVerticalLinesDistance;
                    totalVerticalLinesOnCanvas = totalVerticalLines;
                }
                ////======vertical Lines  parameter calculation========/////
                if (originPoint.x >= 0) {
                    canvasDistanceLeftOfOrigin = originPoint.x;
                    canvasLinesLeftOfOrigin = parseInt(canvasDistanceLeftOfOrigin / verticalLinesDistance, 10);
                    xExtraCanvasDistance = canvasDistanceLeftOfOrigin - canvasLinesLeftOfOrigin * verticalLinesDistance;
                    lineCounter = 0;
                    xlineCountDecider = xMarkerGrid - canvasLinesLeftOfOrigin % xMarkerGrid;
                } else {
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
                } else {
                    //y-axis Marker lines in radian
                    minZoomInDistance = this._zoomLevelLimits().yMinZoomLevel * parameters.distanceBetweenTwoVerticalLines;
                    markerForRadian = this._getRadianMarkers(minZoomInDistance, false);
                    markerStartingValueInRadian = markerForRadian.marker;

                    markerStartingValue = markerStartingValueInRadian / Math.PI;

                    yMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                    markerPosition = this._getCanvasPointCoordinates([0, markerStartingValueInRadian]);
                    distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.y - markerPosition[1]);
                    adjacentHorizontalLinesDistance = distanceBetweenOriginAndfirstPoint / yMarkerGrid;
                    totalHorizontalLines = height / adjacentHorizontalLinesDistance;

                    if (adjacentHorizontalLinesDistance < minZoomInDistance) {
                        markerStartingValueInRadian = markerForRadian.maxMarker;
                        markerStartingValue = markerStartingValueInRadian / Math.PI;

                        yMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                        markerPosition = this._getCanvasPointCoordinates([0, markerStartingValueInRadian]);
                        distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.y - markerPosition[1]);
                        adjacentHorizontalLinesDistance = distanceBetweenOriginAndfirstPoint / yMarkerGrid;
                        totalHorizontalLines = height / adjacentHorizontalLinesDistance;
                    }
                    horizontalLinesDistance = adjacentHorizontalLinesDistance;
                    totalHorizontalLinesOnCanvas = totalHorizontalLines;
                }

                /////-----------horizontal Lines parameter calculator---------////////////
                if (originPoint.y >= 0) {
                    canvasDistanceaboveOfOrigin = originPoint.y;
                    canvasLinesAboveOfOrigin = parseInt(canvasDistanceaboveOfOrigin / horizontalLinesDistance, 10);
                    yExtraCanvasDistance = canvasDistanceaboveOfOrigin - canvasLinesAboveOfOrigin * horizontalLinesDistance;
                    ylineCountDecider = yMarkerGrid - canvasLinesAboveOfOrigin % yMarkerGrid;
                } else {
                    originDistanceAboveofCanvas = Math.abs(originPoint.y);
                    linesAboveCanvas = parseInt(originDistanceAboveofCanvas / horizontalLinesDistance, 10);
                    yExtraCanvasDistance = horizontalLinesDistance - (originDistanceAboveofCanvas - linesAboveCanvas * horizontalLinesDistance);
                    ylineCountDecider = linesAboveCanvas;

                    if (yExtraCanvasDistance !== 0) {
                        ylineCountDecider++;
                    }
                }
                this.activateScope();
                /*draw vertical innerGrid Line*/
                for (lineCounter = 0; lineCounter < totalVerticalLinesOnCanvas; lineCounter++, xlineCountDecider++) {
                    if (xlineCountDecider % xMarkerGrid === 0) {
                        symbols.xMarkerLines.place(new this._paperScope.Point(xExtraCanvasDistance + lineCounter * verticalLinesDistance, height / 2)).guide = true;
                    } else {
                        symbols.xInnerGridLines.place(new this._paperScope.Point(xExtraCanvasDistance + lineCounter * verticalLinesDistance, height / 2)).guide = true;
                    }
                }

                /*Loops draw Horizontal Grid lines Lines */
                /*draw horizontal innerGrid Line*/
                for (lineCounter = 0; lineCounter < totalHorizontalLinesOnCanvas; lineCounter++, ylineCountDecider++) {
                    if (ylineCountDecider % yMarkerGrid === 0) {
                        symbols.yMarkerLines.place(new this._paperScope.Point(width / 2, yExtraCanvasDistance + lineCounter * horizontalLinesDistance)).guide = true;

                    } else {

                        symbols.yInnerGridLines.place(new this._paperScope.Point(width / 2, yExtraCanvasDistance + lineCounter * horizontalLinesDistance)).guide = true;
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
        "_numberOfMarkerLines": function(number) {
            var markerLines = this.GRID_LINES,
                regex = /5/; /*Checks for number five in a text*/
            if (regex.test(number)) {
                return markerLines.FIVE_MULTIPLIER;
            }
            return markerLines.DEFAULT;
        },

        /**
         * return marker staring value in radian for current marker in degree
         * @method _getRadianMarkers
         * @param {Number} minimum zoom level distance
         * @param isXMarker {boolean} is marker is x or y
         */
        "_getRadianMarkers": function(minDistance, isXMarker) {
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
            } else {
                totalMultiplier = graphDisplay._zoomingFactor.yTotalMultiplier;
                currentFactor = graphDisplay._zoomingFactor.yCurrentFactor;
                zoomMultiplier = graphDisplay._zoomingFactor.yZoomMultiplier;
            }

            if (totalMultiplier === 5) {
                maxMarker = Math.ceil(totalMultiplier / Math.PI) * Math.PI;
                minMarker = Math.floor(totalMultiplier / Math.PI) * Math.PI;
            } else if (currentFactor === 5) {
                if (zoomMultiplier < 1) {
                    count = Math.log(1 / zoomMultiplier) / Math.LN10;
                    maxMarker = Math.PI / (6 * Math.pow(8, count - 1));
                    minMarker = Math.PI / (12 * Math.pow(8, count - 1));
                } else {
                    maxMarker = 2 * zoomMultiplier * Math.PI;
                    minMarker = zoomMultiplier * Math.PI;
                }
            }
            if (totalMultiplier === 2) {
                maxMarker = Math.PI;
                minMarker = Math.PI / 2;
            } else if (currentFactor === 2) {
                if (zoomMultiplier < 1) {
                    count = Math.log(1 / zoomMultiplier) / Math.LN10;
                    maxMarker = Math.PI / (12 * Math.pow(8, count - 1));
                    minMarker = Math.PI / (3 * Math.pow(8, count));
                } else {
                    maxMarker = zoomMultiplier * Math.PI;
                    minMarker = 5 * (zoomMultiplier / 10) * Math.PI;
                }
            }
            if (totalMultiplier === 1) {
                maxMarker = Math.PI / 3;
                minMarker = Math.PI / 3;
            } else if (currentFactor === 1) {
                if (zoomMultiplier < 1) {
                    count = Math.log(1 / zoomMultiplier) / Math.LN10;
                    maxMarker = Math.PI / (3 * Math.pow(8, count));
                    minMarker = Math.PI / (6 * Math.pow(8, count));
                } else {
                    maxMarker = 5 * (zoomMultiplier / 10) * Math.PI;
                    minMarker = 2 * (zoomMultiplier / 10) * Math.PI;
                }
            }

            canvasCoordinatesOfCenter = this._getCanvasPointCoordinates([0, 0]);
            if (isXMarker) {
                canvasCoordinates = this._getCanvasPointCoordinates([maxMarker, 0]);
            } else {
                canvasCoordinates = this._getCanvasPointCoordinates([0, maxMarker]);
            }

            distance = Math.sqrt(Math.abs(Math.pow(canvasCoordinatesOfCenter[0] - canvasCoordinates[0], 2) + Math.pow(canvasCoordinatesOfCenter[1] - canvasCoordinates[1], 2)));

            if (distance / 2 >= minDistance) {
                return {
                    "marker": minMarker,
                    "minMarker": minMarker,
                    "maxMarker": maxMarker
                };
            }
            return {
                "marker": maxMarker,
                "minMarker": minMarker,
                "maxMarker": maxMarker
            };
        },

        /**
         *Draw Polar graph.
         *
         *@private
         *@method _polarGraph
         *@return
         */

        /*function draw polar graph*/
        // improve this function as per desmos, currently not as per desmos
        "_polarGraph": function() {
            this._paperScope.project.activeLayer.removeChildren();

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                parameters = graphDisplay._graphParameters,
                canvas = this._canvasSize,
                isLabelShown = graphDisplay._graphDisplay.isLabelShown,
                isGridLineShown = graphDisplay._graphDisplay.isGridLineShown,
                verticalDistance = parameters.currentDistanceBetweenTwoVerticalLines,
                horizontalDistance = parameters.currentDistanceBetweenTwoHorizontalLines,
                canvasWidth = canvas.width,
                canvasHeight = canvas.height,
                xGridLines = parameters.xGridLine,
                origin = graphDisplay._graphOrigin.currentOrigin,
                endDistance = 0,
                startDistance, distanceFrom0, distanceFrom1, distanceFrom2, distanceFrom3, minDistance,
                ellipseCount, firstEllipsePoint, secondEllipsePoint, distanceBetweenEllipsePoint, ellipseHorizontalWidth, ellipseVerticalHeight, angle, side, hypotenuse,
                ellipseHorizontalDistanceforAngleLine, ellipseVerticalDistanceForAngleLine, innerLinesCurrentStokeColor, markerLinesCurrentStokeColor,
                lineColor, textFontSize, textFontColor, angleStyle, arrayIndex, lineSpacingFactor, markerIncrementFactor, markerSpacingFactor, markerA, markerB,
                endXPoint, endYPoint, textEndXPoint, textEndYPoint, angleCounter, polarAngle;

            this.activateScope();
            /*distanceFrom0, distanceFrom1, distanceFrom2, distanceFrom3 are distances from origin and
            canvas four corners-(0,0),(canvasWidth,0),(canvasWidth,canvasHeight),(0,canvasHeight) respectively */
            distanceFrom0 = Math.sqrt(Math.pow(origin.x, 2) + Math.pow(origin.y, 2));
            distanceFrom1 = Math.sqrt(Math.pow(origin.x - canvasWidth, 2) + Math.pow(origin.y, 2));
            distanceFrom2 = Math.sqrt(Math.pow(origin.x - canvasWidth, 2) + Math.pow(origin.y - canvasHeight, 2));
            distanceFrom3 = Math.sqrt(Math.pow(origin.x, 2) + Math.pow(origin.y - canvasHeight, 2));

            /*end distance will be maximum distance among distanceFrom0, distanceFrom1, distanceFrom2, distanceFrom3 */
            endDistance = Math.max(distanceFrom0, distanceFrom1, distanceFrom2, distanceFrom3);
            /*MinDistance increment factor of startDistance*/
            minDistance = verticalDistance < horizontalDistance ? verticalDistance : horizontalDistance;

            /*-----------------origin above canvas------------------------------------*/
            if (origin.y < 0) {
                /*origin outside canvas and on North-west side of canvas*/
                if (origin.x < 0) {
                    side = Math.abs(origin.y);
                    hypotenuse = Math.sqrt(Math.pow(origin.x, 2) + Math.pow(origin.y, 2));
                    angle = 2 * Math.PI - Math.acos(side / hypotenuse);

                    ellipseHorizontalWidth = Math.abs(origin.x);
                    ellipseVerticalHeight = Math.abs(origin.y);
                    startDistance = hypotenuse;
                } else if (origin.x > canvasWidth) { /*origin outside canvas and on North-east side of canvas*/
                    side = Math.abs(origin.y);
                    hypotenuse = Math.sqrt(Math.pow(origin.x - canvasWidth, 2) + Math.pow(origin.y, 2));
                    angle = 3 / 2 * Math.PI - Math.acos(side / hypotenuse);
                    ellipseHorizontalWidth = Math.abs(origin.x) - canvasWidth;
                    ellipseVerticalHeight = Math.abs(origin.y);
                    startDistance = hypotenuse;
                } else { /*origin outside canvas and on North side of canvas*/
                    angle = Math.PI / 2;
                    ellipseVerticalHeight = Math.abs(origin.y);
                    ellipseHorizontalWidth = verticalDistance / horizontalDistance * ellipseVerticalHeight;
                    startDistance = Math.abs(origin.y);
                }
            } else if (origin.y > canvasHeight) { /*---------------------origin Below canvas-----------------------------*/
                /*origin outside canvas and on South-west side of canvas*/
                if (origin.x < 0) {
                    side = Math.abs(origin.x);
                    hypotenuse = Math.sqrt(Math.pow(origin.x, 2) + Math.pow(origin.y - canvasHeight, 2));
                    angle = Math.acos(side / hypotenuse);
                    ellipseHorizontalWidth = Math.abs(origin.x);
                    ellipseVerticalHeight = Math.abs(origin.y) - canvasHeight;
                    startDistance = hypotenuse;
                } else if (origin.x > canvasWidth) { /*origin outside canvas and on South-East side of canvas*/
                    side = Math.abs(origin.x) - canvasWidth;
                    hypotenuse = Math.sqrt(Math.pow(origin.x - canvasWidth, 2) + Math.pow(origin.y - canvasHeight, 2));
                    angle = Math.PI - Math.acos(side / hypotenuse);
                    ellipseHorizontalWidth = Math.abs(origin.x) - canvasWidth;
                    ellipseVerticalHeight = Math.abs(origin.y) - canvasHeight;
                    startDistance = hypotenuse;
                } else { /*origin outside canvas and on South side of canvas*/
                    angle = Math.PI / 2;
                    ellipseVerticalHeight = Math.abs(origin.y) - canvasHeight;
                    ellipseHorizontalWidth = verticalDistance / horizontalDistance * ellipseVerticalHeight;
                    startDistance = Math.abs(origin.y) - canvasHeight;
                }
            } else { /*---------------------origin at canvas Level----------------------*/
                /*origin outside canvas and on west side of canvas*/
                if (origin.x < 0) {
                    angle = 0;
                    ellipseHorizontalWidth = Math.abs(origin.x);
                    ellipseVerticalHeight = ellipseHorizontalWidth * horizontalDistance / verticalDistance;
                    startDistance = Math.abs(origin.x);
                } else if (origin.x > canvasWidth) { /*origin outside canvas and on east side of canvas*/
                    angle = 0;
                    ellipseHorizontalWidth = Math.abs(origin.x) - canvasWidth;
                    ellipseVerticalHeight = ellipseHorizontalWidth * horizontalDistance / verticalDistance;
                    startDistance = Math.abs(origin.x) - canvasWidth;
                } else { /*origin within canvas*/
                    startDistance = 0;
                    ellipseCount = 0;
                    angle = 0;
                    ellipseHorizontalWidth = 0;
                    ellipseVerticalHeight = 0;
                }
            }

            this.activateScope();
            /*ellipse count from origin */
            firstEllipsePoint = new this._paperScope.Point(origin.x + ellipseHorizontalWidth * Math.cos(angle), origin.y + ellipseVerticalHeight * Math.sin(angle));
            secondEllipsePoint = new this._paperScope.Point(origin.x + (ellipseHorizontalWidth + verticalDistance) * Math.cos(angle), origin.y + (ellipseVerticalHeight + horizontalDistance) * Math.sin(angle));
            distanceBetweenEllipsePoint = Math.sqrt(Math.pow(firstEllipsePoint.x - secondEllipsePoint.x, 2) + Math.pow(firstEllipsePoint.y - secondEllipsePoint.y, 2));
            ellipseCount = parseInt(startDistance / distanceBetweenEllipsePoint, 10);

            startDistance = ellipseCount * distanceBetweenEllipsePoint;
            ellipseHorizontalWidth = verticalDistance * ellipseCount;
            ellipseVerticalHeight = horizontalDistance * ellipseCount;

            ellipseHorizontalDistanceforAngleLine = ellipseHorizontalWidth;
            ellipseVerticalDistanceForAngleLine = ellipseVerticalHeight;
            this.activateScope();
            if (graphDisplay.isProjectorModeOn === true) {
                innerLinesCurrentStokeColor = new this._paperScope.Color(0.8, 0.8, 0.8);
                markerLinesCurrentStokeColor = new this._paperScope.Color(0.4, 0.4, 0.4);
            } else {
                innerLinesCurrentStokeColor = new this._paperScope.Color(0.9, 0.9, 0.9);
                markerLinesCurrentStokeColor = new this._paperScope.Color(0.7, 0.7, 0.7);
            }

            if (isGridLineShown === true) {
                /*Loop to draw ellipse */
                for (; startDistance <= endDistance; startDistance += minDistance, ellipseHorizontalWidth += verticalDistance, ellipseVerticalHeight += horizontalDistance) {
                    if (ellipseCount % xGridLines === 0) {
                        new this._paperScope.Path.Ellipse({
                            "point": [origin.x - ellipseHorizontalWidth, origin.y - ellipseVerticalHeight],
                            "size": [2 * ellipseHorizontalWidth, 2 * ellipseVerticalHeight],
                            "strokeColor": markerLinesCurrentStokeColor
                        });
                    } else {
                        new this._paperScope.Path.Ellipse({
                            "point": [origin.x - ellipseHorizontalWidth, origin.y - ellipseVerticalHeight],
                            "size": [2 * ellipseHorizontalWidth, 2 * ellipseVerticalHeight],
                            "strokeColor": innerLinesCurrentStokeColor
                        });
                    }
                    ellipseCount++;
                }
            }

            this.activateScope();
            /*Angle lines*/
            if (graphDisplay._graphDisplay.isProjectorModeOn === true) {
                lineColor = new this._paperScope.Color(0.8, 0.8, 0.8);
                textFontSize = this.MARKER_FONT.SIZE.ON_GRAPH_AREA;
                textFontColor = new this._paperScope.Color(0.6, 0.6, 0.6);
            } else {
                lineColor = new this._paperScope.Color(0.9, 0.9, 0.9);
                textFontSize = 14;
                textFontColor = new this._paperScope.Color(0.7, 0.7, 0.7);
            }

            polarAngle = this._polarLineAngleMarker;
            if (graphDisplay._graphDisplay.isPolarAngleInRadian === true) {
                angleStyle = polarAngle.radian;
            } else {
                angleStyle = polarAngle.degree;
            }

            arrayIndex = 0;

            if (origin.x < canvasWidth && origin.x > 0 && (origin.y < canvasHeight && origin.y > 0)) {
                lineSpacingFactor = 3;
                markerIncrementFactor = 2;
                markerSpacingFactor = 6;

                if (origin.x <= horizontalDistance * xGridLines * 2 || canvasWidth - origin.x <= horizontalDistance * xGridLines * 2) {
                    markerA = ellipseVerticalDistanceForAngleLine + verticalDistance * xGridLines * 5 - verticalDistance;
                    markerB = ellipseHorizontalDistanceforAngleLine + horizontalDistance * xGridLines * 5 - horizontalDistance;
                } else {
                    markerA = ellipseVerticalDistanceForAngleLine + verticalDistance * xGridLines * 3 - verticalDistance;
                    markerB = ellipseHorizontalDistanceforAngleLine + horizontalDistance * xGridLines * 3 - horizontalDistance;
                }
            } else {
                lineSpacingFactor = 1;
                markerIncrementFactor = 1;
                markerSpacingFactor = 3;

                markerA = ellipseVerticalDistanceForAngleLine + verticalDistance * xGridLines * 6;
                markerB = ellipseHorizontalDistanceforAngleLine + horizontalDistance * xGridLines * 6;
            }

            this.activateScope();
            for (angleCounter = 0; angleCounter < 360; angleCounter += 5) {

                endXPoint = origin.x + endDistance * Math.cos(angleCounter * Math.PI / 180);
                endYPoint = origin.y + endDistance * Math.sin(angleCounter * Math.PI / 180);

                if (angleCounter % lineSpacingFactor === 0) {
                    if (isGridLineShown === true) {
                        new this._paperScope.Path.Line({
                            "from": origin,
                            "to": [endXPoint, endYPoint],
                            "strokeColor": lineColor
                        });
                    }

                    if (isLabelShown === true) {
                        if (angleCounter % markerSpacingFactor === 0) {

                            angle = angleCounter * Math.PI / 180;

                            textEndXPoint = origin.x + markerA * Math.cos(angle);
                            textEndYPoint = origin.y + markerB * Math.sin(angle);

                            new this._paperScope.PointText({
                                "point": [textEndXPoint, textEndYPoint],
                                "content": angleStyle[arrayIndex],
                                "fontSize": textFontSize,
                                "fillColor": textFontColor
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
        "_polarAngleLinesMarkerArrayGenerator": function() {

            var arrayIndex, radianMultiplier, pi, radAngle, minNumber, denominator, numerator, divisor,
                degreeAngle = [0, 345, 330, 315, 300, 285, 270, 255, 240, 225, 210, 195, 180, 165, 150, 135, 120, 105, 90, 75, 60, 45, 30, 15] /*marker in degree*/ ;

            this._polarLineAngleMarker.degree = degreeAngle;

            /*Marker in radian*/
            pi = this.PI;
            radAngle = [0];
            arrayIndex = 1;

            for (radianMultiplier = 23; radianMultiplier > 0; radianMultiplier--) {
                minNumber = radianMultiplier < 12 ? radianMultiplier : 12;
                denominator = 12;
                numerator = radianMultiplier;

                for (divisor = minNumber; divisor >= 2; divisor--) {
                    while (denominator % divisor === 0 && numerator % divisor === 0) {
                        denominator = denominator / divisor;
                        numerator = numerator / divisor;
                    }
                }
                if (numerator === 1 && denominator === 1) {
                    radAngle[arrayIndex] = pi;
                } else if (numerator === 1) {
                    radAngle[arrayIndex] = pi + '/' + denominator;
                } else if (denominator === 1) {
                    radAngle[arrayIndex] = numerator + pi;
                } else {
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
        "_drawAxisLines": function() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                originPoint = graphDisplay._graphOrigin.currentOrigin,
                isAxisLinesShown = graphDisplay._graphDisplay.isAxisLinesShown,
                canvas = this._canvasSize,
                symbols = graphDisplay._symbols,
                height = canvas.height,
                width = canvas.width;
            /*draw X-axis and  Y-axis*/
            this.activateScope();
            if (isAxisLinesShown === true) {
                symbols.xAxis.place(new this._paperScope.Point(width / 2, originPoint.y)).guide = "true";
                symbols.yAxis.place(new this._paperScope.Point(originPoint.x, height / 2)).guide = "true";
            }
        },
        /**
         * Margin for x-axis labels and y-axis label
         *
         */
        "MARGIN": {
            'X-LABELS': {
                'ON-CANVAS': {
                    'LEFT': 0,
                    'RIGHT': 0,
                    'TOP': 7,
                    'BOTTOM': 0
                },
                'AT-CANVAS-END': {
                    'LEFT': 2,
                    'RIGHT': 2,
                    'TOP': 2,
                    'BOTTOM': 2
                }
            },
            'Y-LABELS': {
                'ON-CANVAS': {
                    'LEFT': 0,
                    'RIGHT': 7,
                    'TOP': 0,
                    'BOTTOM': 0
                },
                'AT-CANVAS-END': {
                    'LEFT': 2,
                    'RIGHT': 2,
                    'TOP': 2,
                    'BOTTOM': 2
                }
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
        "_axisMarker": function() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                canvas = this._canvasSize,
                parameters = graphDisplay._graphParameters,
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
                markerStyle = this.MARKER_FONT,
                textColoronCanvas = markerStyle.COLOR.ON_GRAPH_AREA,
                textColorAtEndOfCanvas = markerStyle.COLOR.AT_END_OF_GRAPH_AREA,
                textFontColor = textColoronCanvas,
                textFontSize = markerStyle.SIZE,
                lineCounter, verticalLinesDistance, totalVerticalLinesOnCanvas, horizontalLinesDistance, totalHorizontalLinesOnCanvas,
                canvasDistanceLeftOfOrigin, canvasLinesLeftOfOrigin, extraCanvasDistance, lineCountDecider, markerText, currentMarkerText, textXPosition, textYPosition,
                originDistanceLeftofCanvas, linesLeftOfCanvas, xMarkerFactor, canvasDistanceaboveOfOrigin, canvasLinesAboveOfOrigin, originDistanceAboveofCanvas, linesAboveCanvas,
                number, powerValue, markerStartingValueInRadian, markerPosition, distanceBetweenOriginAndfirstPoint, adjacentVerticalLinesDistance, totalVerticalLines,
                minZoomInDistance, adjacentHorizontalLinesDistance, totalHorizontalLines, markerStartingValue, markerForRadian,
                horizontalAlignment = this.TEXT_ALIGN.HORIZONTAL,
                vaericalAlignment = this.TEXT_ALIGN.VERTICAL,
                horizontalAlign, verticalAlign, textCo,
                textStyle = {},
                xIncrementFactor, yIncrementFactor,
                isXMarkerRadian = graphDisplay._graphDisplay.isXmarkerInRadians,
                isYMarkerRadian = graphDisplay._graphDisplay.isYmarkerInRadians,
                MARGIN = this.MARGIN,
                xLabelsMargin = MARGIN['X-LABELS'],
                yLabelsMargin = MARGIN['Y-LABELS'],
                fontFamily = markerStyle.FAMILY,
                fontWeight = markerStyle.WEIGHT;

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
                    lineCountDecider = xMarkerGrid - canvasLinesLeftOfOrigin % xMarkerGrid;
                    markerText = parseInt(canvasLinesLeftOfOrigin / xMarkerGrid, 10);
                } else {
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

                if (originPoint.x >= 0 && graphDisplay._graphDisplay.isCartesionCurrentGraphType) {
                    xMarkerFactor = -xFactor;
                }

                xIncrementFactor = 1;
            } else {
                /*x-axis Marker lines in radian and graph type is Cartesian*/
                minZoomInDistance = this._zoomLevelLimits().xMinZoomLevel * parameters.distanceBetweenTwoVerticalLines;

                markerForRadian = this._getRadianMarkers(minZoomInDistance, true);
                markerStartingValueInRadian = markerForRadian.marker;

                markerStartingValue = markerStartingValueInRadian / Math.PI;

                xMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                markerPosition = this._getCanvasPointCoordinates([markerStartingValueInRadian, 0]);
                distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.x - markerPosition[0]);
                adjacentVerticalLinesDistance = distanceBetweenOriginAndfirstPoint / xMarkerGrid;
                totalVerticalLines = width / adjacentVerticalLinesDistance;

                if (adjacentVerticalLinesDistance < minZoomInDistance) {
                    markerStartingValueInRadian = markerForRadian.maxMarker;
                    markerStartingValue = markerStartingValueInRadian / Math.PI;

                    xMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                    markerPosition = this._getCanvasPointCoordinates([markerStartingValueInRadian, 0]);
                    distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.x - markerPosition[0]);
                    adjacentVerticalLinesDistance = distanceBetweenOriginAndfirstPoint / xMarkerGrid;
                    totalVerticalLines = width / adjacentVerticalLinesDistance;
                }
                verticalLinesDistance = adjacentVerticalLinesDistance;
                totalVerticalLinesOnCanvas = totalVerticalLines;

                if (originPoint.x >= 0) {
                    canvasDistanceLeftOfOrigin = originPoint.x;
                    canvasLinesLeftOfOrigin = parseInt(canvasDistanceLeftOfOrigin / verticalLinesDistance, 10);
                    extraCanvasDistance = canvasDistanceLeftOfOrigin - canvasLinesLeftOfOrigin * verticalLinesDistance;
                    lineCounter = 0;
                    lineCountDecider = xMarkerGrid - canvasLinesLeftOfOrigin % xMarkerGrid;
                    markerText = markerStartingValueInRadian / Math.PI * parseInt(canvasLinesLeftOfOrigin / xMarkerGrid, 10);

                } else {
                    originDistanceLeftofCanvas = Math.abs(originPoint.x);
                    linesLeftOfCanvas = parseInt(originDistanceLeftofCanvas / verticalLinesDistance, 10);
                    extraCanvasDistance = verticalLinesDistance - (originDistanceLeftofCanvas - linesLeftOfCanvas * verticalLinesDistance);
                    lineCounter = 0;
                    lineCountDecider = linesLeftOfCanvas;
                    markerText = markerStartingValueInRadian / Math.PI * parseInt(linesLeftOfCanvas / xMarkerGrid, 10);

                    if (extraCanvasDistance !== 0) {
                        lineCountDecider++;
                        markerText += markerStartingValueInRadian / Math.PI;
                    }
                }

                /*create Marker Text and its Position*/
                xMarkerFactor = 1;

                if (originPoint.x >= 0 && graphDisplay._graphDisplay.isCartesionCurrentGraphType) {
                    xMarkerFactor = -1;
                }

                xIncrementFactor = markerStartingValueInRadian / Math.PI;
            }
            //x-axis  Marker
            for (lineCounter = 0; lineCounter <= totalVerticalLinesOnCanvas; lineCounter++) {
                horizontalAlign = horizontalAlignment.CENTER;
                verticalAlign = vaericalAlignment.BOTTOM;

                if (lineCountDecider % xMarkerGrid === 0) {

                    textXPosition = extraCanvasDistance + lineCounter * verticalLinesDistance;
                    textYPosition = originPoint.y;

                    if (isXMarkerRadian === false || isCartesianGraph === false) {
                        currentMarkerText = this._getPowerOfNumber(markerText * xMarkerFactor, xtenMultiplier, xMarkerFactor);
                    } else {
                        currentMarkerText = this._getProperFormedRadianMarkerText(markerText * xMarkerFactor, xtenMultiplier, xMarkerFactor);
                    }

                    number = currentMarkerText[0];
                    powerValue = currentMarkerText[1];

                    textYPosition += xLabelsMargin['ON-CANVAS'].TOP;

                    /*if polar graph, then negative value marker-text is converted to corresponding positive value  */
                    if (isCartesianGraph === false && number < 0) {
                        number = -number;
                    }
                    this.activateScope();
                    /*marker Position Shifting factor if its crossing canvas size*/
                    textCo = this._displayToPower10(number, powerValue, new this._paperScope.Point(textXPosition, textYPosition), {
                        "fontSize": textFontSize,
                        "fontColor": textFontColor,
                        "justification": horizontalAlign,
                        "verticalAlign": verticalAlign
                    }, false);
                    if (currentMarkerText[0] !== 0) {
                        if (textCo.base.x <= 0) {
                            textXPosition = xLabelsMargin['AT-CANVAS-END'].LEFT;
                            horizontalAlign = horizontalAlignment.left;
                        } else if (textCo.base.x + textCo.base.width + textCo.power.width >= width && textCo.base.x + textCo.base.width / 2 <= width) {
                            textXPosition = width - xLabelsMargin['AT-CANVAS-END'].RIGHT;
                            horizontalAlign = horizontalAlignment.RIGHT;
                        } else if (textCo.base.x + textCo.base.width + textCo.power.width >= width && textCo.base.x + textCo.base.width / 2 > width) {
                            horizontalAlign = horizontalAlignment.LEFT;
                        }
                    } else {
                        textXPosition -= yLabelsMargin['ON-CANVAS'].RIGHT; //to align with y marker
                        horizontalAlign = horizontalAlignment.RIGHT;
                    }

                    /*if graph is Cartesian then axis are present at canvas ends if origin is not on canvas*/
                    if (isCartesianGraph === true) {
                        if (textCo.base.y < 0 || textCo.power.y < 0) {
                            textYPosition = xLabelsMargin['AT-CANVAS-END'].TOP;
                            textFontColor = textColorAtEndOfCanvas;
                            verticalAlign = vaericalAlignment.BOTTOM;
                        } else if (textCo.base.y + textCo.base.height > height) {
                            textYPosition = height - xLabelsMargin['AT-CANVAS-END'].BOTTOM;
                            textFontColor = textColorAtEndOfCanvas;
                            verticalAlign = vaericalAlignment.TOP;
                        }
                    }

                    /*create PointText at corresponding Point*/
                    if (originPoint.y > 0 && originPoint.y < height && number === 0 || markerText !== 0) {
                        textStyle = {
                            "fontSize": textFontSize,
                            "fontColor": textFontColor,
                            "justification": horizontalAlign,
                            "verticalAlign": verticalAlign,
                            "fontFamily": fontFamily,
                            "fontWeight": fontWeight
                        };
                        if (isProjectorModeOn) {
                            textStyle.strokeWidth = 0.3;
                            textStyle.strokeColor = textFontColor;
                        }
                        this._displayToPower10(number, powerValue, new this._paperScope.Point(textXPosition, textYPosition), textStyle);
                    }
                    /*if origin is left of canvas then all marker text are positive.*/
                    if (originPoint.x < 0) {
                        markerText += xIncrementFactor;
                    } else {
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
                    lineCountDecider = yMarkerGrid - canvasLinesAboveOfOrigin % yMarkerGrid;
                    markerText = parseInt(canvasLinesAboveOfOrigin / yMarkerGrid, 10);
                } else {
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
                    yFactor = -yFactor;
                }
                yIncrementFactor = 1;
            } else {
                /* y-axis marker is in radian and graph type is Cartesian*/

                //y-axis Marker lines in degree

                minZoomInDistance = this._zoomLevelLimits().yMinZoomLevel * parameters.distanceBetweenTwoHorizontalLines;
                markerForRadian = this._getRadianMarkers(minZoomInDistance, false);
                markerStartingValueInRadian = markerForRadian.marker;

                markerStartingValue = markerStartingValueInRadian / Math.PI;
                yMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                markerPosition = this._getCanvasPointCoordinates([0, markerStartingValueInRadian]);
                distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.y - markerPosition[1]);
                adjacentHorizontalLinesDistance = distanceBetweenOriginAndfirstPoint / yMarkerGrid;
                totalHorizontalLines = height / adjacentHorizontalLinesDistance;

                if (adjacentHorizontalLinesDistance < minZoomInDistance) {
                    markerStartingValueInRadian = markerForRadian.maxMarker;
                    markerStartingValue = markerStartingValueInRadian / Math.PI;

                    yMarkerGrid = this._numberOfMarkerLines(markerStartingValue);

                    markerPosition = this._getCanvasPointCoordinates([0, markerStartingValueInRadian]);
                    distanceBetweenOriginAndfirstPoint = Math.abs(originPoint.y - markerPosition[1]);
                    adjacentHorizontalLinesDistance = distanceBetweenOriginAndfirstPoint / yMarkerGrid;
                    totalHorizontalLines = height / adjacentHorizontalLinesDistance;
                }

                //                ////======vertical Lines  parameter calculator========/////
                horizontalLinesDistance = adjacentHorizontalLinesDistance;
                totalHorizontalLinesOnCanvas = totalHorizontalLines;

                if (originPoint.y >= 0) {
                    canvasDistanceaboveOfOrigin = originPoint.y;
                    canvasLinesAboveOfOrigin = parseInt(canvasDistanceaboveOfOrigin / horizontalLinesDistance, 10);
                    extraCanvasDistance = canvasDistanceaboveOfOrigin - canvasLinesAboveOfOrigin * horizontalLinesDistance;
                    lineCountDecider = yMarkerGrid - canvasLinesAboveOfOrigin % yMarkerGrid;
                    markerText = markerStartingValueInRadian / Math.PI * parseInt(canvasLinesAboveOfOrigin / yMarkerGrid, 10);

                } else {
                    originDistanceAboveofCanvas = Math.abs(originPoint.y);
                    linesAboveCanvas = parseInt(originDistanceAboveofCanvas / horizontalLinesDistance, 10);
                    extraCanvasDistance = horizontalLinesDistance - (originDistanceAboveofCanvas - linesAboveCanvas * horizontalLinesDistance);
                    lineCountDecider = linesAboveCanvas;
                    markerText = markerStartingValueInRadian / Math.PI * parseInt(linesAboveCanvas / yMarkerGrid, 10);

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
                yIncrementFactor = markerStartingValueInRadian / Math.PI;
            }

            textFontColor = textColoronCanvas;
            /*Calculate MarkerText and its Position of different marker on Y-axis*/

            for (lineCounter = 0; lineCounter <= totalHorizontalLinesOnCanvas; lineCounter++) {

                if (lineCountDecider % yMarkerGrid === 0) {
                    verticalAlign = vaericalAlignment.MIDDLE;
                    horizontalAlign = horizontalAlignment.RIGHT;

                    /*Current Marker Text*/
                    if (isYMarkerRadian === false || isCartesianGraph === false) {
                        currentMarkerText = this._getPowerOfNumber(markerText * yFactor, ytenMultiplier, yFactor);
                    } else {
                        currentMarkerText = this._getProperFormedRadianMarkerText(markerText * yFactor, ytenMultiplier, yFactor);
                    }

                    number = currentMarkerText[0];
                    powerValue = currentMarkerText[1];

                    /*marker Y-Position*/
                    textYPosition = extraCanvasDistance + lineCounter * horizontalLinesDistance;
                    textXPosition = originPoint.x - yLabelsMargin['ON-CANVAS'].RIGHT;

                    /*convert negative marker value to positive if graph type is Polar*/
                    if (isCartesianGraph === false && number < 0) {
                        number = -number;
                    }
                    this.activateScope();
                    /*marker Position Shifting factor if its crossing canvas size*/
                    textCo = this._displayToPower10(number, powerValue, new this._paperScope.Point(textXPosition, textYPosition), {
                        "fontSize": textFontSize,
                        "fontColor": textFontColor,
                        "justification": horizontalAlign,
                        "verticalAlign": verticalAlign
                    }, false);
                    if (textCo.base.y + textCo.base.height / 4 <= 0 || textCo.power.y <= 0) {
                        textYPosition = yLabelsMargin['AT-CANVAS-END'].TOP;
                        verticalAlign = vaericalAlignment.BOTTOM;
                    } else if (textCo.base.y + textCo.base.height > height) {
                        textYPosition = height - yLabelsMargin['AT-CANVAS-END'].BOTTOM;
                        verticalAlign = vaericalAlignment.TOP;
                    }

                    /*X-position of markerText*/

                    /*if graph is Cartesian then axis are present at canvas ends if origin is not on canvas*/
                    if (isCartesianGraph === true) {
                        if (textCo.base.x < 0) {
                            textXPosition = yLabelsMargin['AT-CANVAS-END'].LEFT;
                            horizontalAlign = horizontalAlignment.LEFT;
                            textFontColor = textColorAtEndOfCanvas;
                        } else if (originPoint.x > width) {
                            textXPosition = width - yLabelsMargin['AT-CANVAS-END'].RIGHT;
                            horizontalAlign = horizontalAlignment.RIGHT;
                            textFontColor = textColorAtEndOfCanvas;
                        }
                    }

                    if (number !== 0) {
                        textStyle = {
                            "fontSize": textFontSize,
                            "fontColor": textFontColor,
                            "justification": horizontalAlign,
                            "verticalAlign": verticalAlign,
                            "fontFamily": fontFamily,
                            "fontWeight": fontWeight
                        };
                        if (isProjectorModeOn) {
                            textStyle.strokeWidth = 0.3;
                            textStyle.strokeColor = textFontColor;
                        }
                        this._displayToPower10(number, powerValue, new this._paperScope.Point(textXPosition, textYPosition), textStyle);
                    }
                    if (originPoint.y < 0) {
                        markerText += yIncrementFactor;
                    } else {
                        markerText -= yIncrementFactor;
                    }
                }
                lineCountDecider++;
            }
        },

        /**
         * return marker text of given number in radian.
         * @method _getProperFormedRadianMarkerText
         * @param number {Number} number to be converted in radian text
         * @param tenMultiplier {number} till this limit number is return in (numerator * π/denominator) format, after this limits number decimal value
         * @private
         */
        "_getProperFormedRadianMarkerText": function(number, tenMultiplier, factor) {
            var PI = Math.PI,
                piSymbol = this.PI,
                numberArray;
            if (tenMultiplier > 10000) {
                number = number * PI;
                numberArray = this._getPowerOfNumber(number, tenMultiplier, factor);
                return numberArray;
            }
            if (Math.abs(number) * PI < PI / 25) {
                number = number * PI;
                numberArray = this._getPowerOfNumber(number, tenMultiplier, factor);
                return numberArray;
            }
            numberArray = this._convertToFractional(number);

            if (Math.abs(numberArray[0]) === 1 && numberArray[1] === 1) {
                // if numerator and denominator both are 1 then number is 'p'
                if (numberArray[0] === 1) {
                    number = piSymbol;
                } else {
                    number = '-' + piSymbol;
                }

            } else if (Math.abs(numberArray[0]) === 1) {
                //numerator is 1 then number is 'p/denominator'
                if (numberArray[0] === 1) {
                    number = piSymbol + '/' + numberArray[1];
                } else {
                    number = '-' + piSymbol + '/' + numberArray[1];
                }

            } else if (numberArray[1] === 1) {
                //denominator is 1 then number is in form 'numerator p'
                number = numberArray[0] + piSymbol;
            } else {
                //numerator and denominator both are other than 1.
                number = numberArray[0] + piSymbol + '/' + numberArray[1];
            }
            return [number, 0];
        },

        /* Convert to fractional form
         * @method _convertToFractional
         * @param number {Number} to be converted in fraction form
         * @return {Array} zeroth element is numerator, first element is denominator
         */
        "_convertToFractional": function(number) {
            var decimal,
                EPSILON, n, d, fraction;

            //check if number is decimal or integer
            number = parseFloat(number.toFixed(2));
            if (number.toString().indexOf('.') === -1) {
                //number is integer
                return [number, 1];
            }
            // number is decimal
            decimal = number;

            EPSILON = 0.01;

            n = 1; // numerator
            d = 1; // denominator
            fraction = 1;

            while (Math.abs(fraction - decimal) > EPSILON) {
                if (fraction < decimal) {
                    n++;
                } else {
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
        "_getPowerOfNumber": function(number, tenMultiplier, increaseFactor) {
            number = parseFloat(number);
            var absNumber, powerValue = 0,
                baseNumber,
                arr, precision = 1,
                MAX_PRECISION = 10,
                MIN_PRECISION = 4;
            increaseFactor = Math.abs(increaseFactor);

            while (increaseFactor < 1) {
                precision++;
                increaseFactor *= 10;
            }
            if (number < 0) {
                absNumber = Math.abs(number);
                if (tenMultiplier < 0.0001) {
                    while (absNumber < 1) {
                        absNumber *= 10;
                        powerValue--;
                    }
                } else if (tenMultiplier > 10000) {
                    while (absNumber / 10 >= 1) {
                        absNumber /= 10;
                        powerValue++;
                    }
                }
                number = -absNumber;
            } else {
                if (tenMultiplier < 0.0001 && number !== 0) {
                    while (number < 1) {
                        number *= 10;
                        powerValue--;
                    }
                } else if (tenMultiplier > 10000) {
                    while (number / 10 >= 1) {
                        number /= 10;
                        powerValue++;
                    }
                }
            }
            baseNumber = number;
            if (precision > MAX_PRECISION) {
                baseNumber = parseFloat(number.toFixed(MAX_PRECISION));
            } else if (precision > MIN_PRECISION) {
                baseNumber = parseFloat(number.toFixed(precision));
            } else {
                baseNumber = parseFloat(number.toFixed(MIN_PRECISION));
            }
            arr = [baseNumber, powerValue];
            return arr;
        },

        /**
         *It is for the tooltip values
         *Return number and its power value.
         *It returns an array,which contain base number and power value,
         *it will give non-zero power value if number is less than 10^-5 or number is greater than 10^4.
         *
         *@private
         *@method getPowerOfNumber
         *@param {Number} number an number whose power value to be calculated.
         *@param {Number} tenMultiplier an multiplier factor used to decide when power value to be non-zero
         *@array
         */
        "getPowerOfNumber": function(number, tenMultiplier) {
            number = parseFloat(number);
            var absNumber, powerValue = 0,
                baseNumber,
                arr,
                numberString = number.toString(),
                precision = this._gridGraphModelObject.get('toolTipPrecision');

            if (numberString.indexOf('e') !== -1) {
                numberString = numberString.split('e');
                baseNumber = Number(numberString[0]);
                baseNumber = parseFloat(baseNumber.toFixed(precision));
                powerValue = Number(numberString[1]);
                arr = [baseNumber, powerValue];
                return arr;
            }
            if (isNaN(number)) {
                return ["undefined", 0];
            }
            if (!isFinite(number)) {
                return [Infinity, 0];
            }
            if (number < 0) {
                absNumber = Math.abs(number);
                if (absNumber < 0.00001) {
                    while (absNumber < 1) {
                        absNumber *= 10;
                        powerValue--;
                    }
                } else if (absNumber > 100000) {
                    while (absNumber / 10 >= 1) {
                        absNumber /= 10;
                        powerValue++;
                    }
                }
                number = -absNumber;
            } else {
                if (number < 0.00001 && number !== 0) {
                    while (number < 1) {
                        number *= 10;
                        powerValue--;
                    }
                } else if (number > 100000) {
                    while (number / 10 >= 1) {
                        number /= 10;
                        powerValue++;
                    }
                }
            }
            baseNumber = number;
            baseNumber = parseFloat(number);
            arr = [baseNumber, powerValue];
            return arr;
        },

        /*
         *@method setToolTipPrecision
         *@param precision{number}
         */
        "setToolTipPrecision": function(precision) {
            this._gridGraphModelObject.set('toolTipPrecision', precision);
        },

        //@method _displayToPower10
        //@param  number {Number} The base value that is to be displayed
        //@param powerValue {Number} The power of 10 that is to be displayed
        "_displayToPower10": function(base, power, point, style, toBedraw) {
            var tempBase,
                tempPower,
                strokeColor = style.strokeColor,
                fontSize = style.fontSize,
                justification = style.justification,
                verticalAlign = style.verticalAlign,
                fillColor = style.fontColor,
                strokeWidth = style.strokeWidth,
                fontFamily = style.fontFamily,
                fontWeight = style.fontWeight,
                baseHeight, baseWidth, powerWidth,
                horizontalAlign = this.TEXT_ALIGN.HORIZONTAL,
                vericalAlignment = this.TEXT_ALIGN.VERTICAL,
                baseCo, powerCo;

            tempBase = new this._paperScope.PointText({
                "point": point,
                "justification": 'left',
                "fillColor": fillColor,
                "strokeColor": strokeColor,
                "strokeWidth": strokeWidth,
                "fontFamily": fontFamily,
                "fontWeight": fontWeight,
                "content": base
            });

            tempPower = new this._paperScope.PointText({
                "point": [point.x + tempBase.bounds.width, point.y],
                "justification": 'left',
                "fillColor": fillColor,
                "strokeColor": strokeColor,
                "strokeWidth": strokeWidth,
                "fontFamily": fontFamily,
                "fontWeight": fontWeight
            });

            if (typeof fontSize !== 'undefined') {
                tempBase.fontSize = fontSize;
                tempPower.fontSize = fontSize * 3 / 4;
            }

            if (power !== 0) {
                tempBase.content = tempBase.content + this._X10_STRING;
                tempPower.content = power;
                tempPower.bounds.x = tempBase.bounds.x + tempBase.bounds.width;
                tempPower.bounds.y = tempBase.bounds.y - tempPower.bounds.height / 4;
            }

            baseHeight = tempBase.bounds.height;
            baseWidth = tempBase.bounds.width;
            powerWidth = tempPower.bounds.width;

            if (verticalAlign === vericalAlignment.MIDDLE) {
                tempBase.bounds.y += baseHeight / 4;
                tempPower.bounds.y += baseHeight / 4;
            } else if (verticalAlign === vericalAlignment.BOTTOM) {
                tempBase.bounds.y += baseHeight / 2;
                tempPower.bounds.y += baseHeight / 2;
            }

            if (justification === horizontalAlign.RIGHT) {
                tempBase.bounds.x -= powerWidth + baseWidth;
                tempPower.bounds.x -= powerWidth + baseWidth;
            } else if (justification === horizontalAlign.CENTER) {
                tempBase.bounds.x -= powerWidth / 2 + baseWidth / 2;
                tempPower.bounds.x -= powerWidth / 2 + baseWidth / 2;
            }

            baseCo = {
                "x": tempBase.bounds.x,
                "y": tempBase.bounds.y,
                "width": tempBase.bounds.width,
                "height": tempBase.bounds.height
            };
            powerCo = {
                "x": tempPower.bounds.x,
                "y": tempPower.bounds.y,
                "width": tempPower.bounds.width,
                "height": tempPower.bounds.height
            };

            if (toBedraw === false) {
                tempBase.remove();
                tempPower.remove();
            }

            return {
                "base": baseCo,
                "power": powerCo
            };
        },

        "_getCanvasDistance": function(pointCoordinates) {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                verticalLinesDistance = graphDisplay._graphParameters.currentDistanceBetweenTwoVerticalLines,
                horizontalLineDistance = graphDisplay._graphParameters.currentDistanceBetweenTwoHorizontalLines,
                xMarkerGridLines = graphDisplay._graphParameters.xGridLine,
                yMarkerGridLines = graphDisplay._graphParameters.yGridLine,
                zoomingFactors = graphDisplay._zoomingFactor,
                xMultiplier = zoomingFactors.xTotalMultiplier,
                yMultiplier = zoomingFactors.yTotalMultiplier,
                graphCoordinates = [],
                canvasX, canvasY;

            canvasX = pointCoordinates[0] * xMarkerGridLines * verticalLinesDistance / xMultiplier;
            graphCoordinates.push(canvasX);

            canvasY = -pointCoordinates[1] * yMarkerGridLines * horizontalLineDistance / yMultiplier;
            graphCoordinates.push(canvasY);

            return graphCoordinates;
        },

        "_getGridDistance": function(canvasPointCoordinates) {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                verticalLinesDistance = graphDisplay._graphParameters.currentDistanceBetweenTwoVerticalLines,
                horizontalLineDistance = graphDisplay._graphParameters.currentDistanceBetweenTwoHorizontalLines,
                xMarkerGridLines = graphDisplay._graphParameters.xGridLine,
                yMarkerGridLines = graphDisplay._graphParameters.yGridLine,
                zoomingFactors = graphDisplay._zoomingFactor,
                xMultiplier = zoomingFactors.xTotalMultiplier,
                yMultiplier = zoomingFactors.yTotalMultiplier,
                canvasCoordinates = [],
                graphX, graphY;

            graphX = canvasPointCoordinates[0] / verticalLinesDistance / xMarkerGridLines * xMultiplier;
            graphY = -(canvasPointCoordinates[1] / horizontalLineDistance / yMarkerGridLines) * yMultiplier;
            canvasCoordinates.push(graphX, graphY);

            return canvasCoordinates;
        },

        /*
         * return array of canvas point co-ordinate
         * @method _getCanvasPointCoordinates
         * @param pointCoordinates {Array} point co-ordinate in term of graph co-ordinate, 0th element x and 1st element y
         * @return {Array} co-ordinate in terms of canvas co-ordinate, 0th element x and 1st element y
         * @private
         */
        "_getCanvasPointCoordinates": function(pointCoordinates) {
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
                graphCoordinates = [],
                canvasX, canvasY;

            canvasX = currentOrigin.x + pointCoordinates[0] * xMarkerGridLines * verticalLinesDistance / xMultiplier;

            canvasY = currentOrigin.y - pointCoordinates[1] * yMarkerGridLines * horizontalLineDistance / yMultiplier;
            graphCoordinates.push(canvasX, canvasY);

            return graphCoordinates;
        },

        /*
         * return array of graph point co-ordinate
         * @method _getGraphPointCoordinates
         * @param canvasPointCoordinates {Array} point co-ordinate in term of canvas co-ordinate, 0th element x and 1st element y
         * @return {Array} co-ordinate in terms of graph co-ordinate, 0th element x and 1st element y
         * @private
         */
        "_getGraphPointCoordinates": function(canvasPointCoordinates) {
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
            graphY = (currentOrigin.y - canvasPointCoordinates[1]) / horizontalLineDistance / yMarkerGridLines * yMultiplier;
            canvasCoordinates.push(graphX, graphY);

            return canvasCoordinates;
        },

        /**
         * calculate min-max angle between origin and canvas ends.
         * @method _deltaAngle
         * @private
         */
        "_deltaAngle": function() {
            var model = this._gridGraphModelObject,
                graphDisplay = model.get('_graphDisplayValues'),
                modelBounds = model.get('markerBounds'),
                origin = graphDisplay._graphOrigin.currentOrigin,
                canvasHeight = this._canvasSize.height,
                canvasWidth = this._canvasSize.width,
                minAnglePoint, maxAnglePoint, minDeltaAngle, maxDeltaAngle;

            this.activateScope();
            if (origin.y < 0) {
                if (origin.x < 0) {
                    minAnglePoint = new this._paperScope.Point(0, canvasHeight);
                    maxAnglePoint = new this._paperScope.Point(canvasWidth, 0);
                } else if (origin.x > canvasWidth) {
                    minAnglePoint = new this._paperScope.Point(0, 0);
                    maxAnglePoint = new this._paperScope.Point(canvasWidth, canvasHeight);
                } else {
                    minAnglePoint = new this._paperScope.Point(0, 0);
                    maxAnglePoint = new this._paperScope.Point(canvasWidth, 0);
                }
            } else if (origin.y > canvasHeight) {
                if (origin.x < 0) {
                    minAnglePoint = new this._paperScope.Point(canvasWidth, canvasHeight);
                    maxAnglePoint = new this._paperScope.Point(0, 0);
                } else if (origin.x > canvasWidth) {
                    minAnglePoint = new this._paperScope.Point(canvasWidth, 0);
                    maxAnglePoint = new this._paperScope.Point(0, canvasHeight);
                } else {
                    minAnglePoint = new this._paperScope.Point(canvasWidth, canvasHeight);
                    maxAnglePoint = new this._paperScope.Point(0, canvasHeight);
                }
            } else {
                if (origin.x < 0) {
                    minAnglePoint = new this._paperScope.Point(canvasWidth, 0);
                    maxAnglePoint = new this._paperScope.Point(canvasWidth, canvasHeight);
                } else if (origin.x > canvasWidth) {
                    minAnglePoint = new this._paperScope.Point(canvasWidth, 0);
                    maxAnglePoint = new this._paperScope.Point(canvasWidth, canvasHeight);
                } else {
                    minAnglePoint = new this._paperScope.Point(canvasWidth, 0);
                    maxAnglePoint = new this._paperScope.Point(canvasWidth, canvasHeight);
                }
            }
            minDeltaAngle = this._angleBetweenTwoPoints(origin, minAnglePoint);
            maxDeltaAngle = this._angleBetweenTwoPoints(origin, maxAnglePoint);

            this.markerBounds.max['\\theta'] = modelBounds.max['\\theta'] = maxDeltaAngle;
            this.markerBounds.min['\\theta'] = modelBounds.min['\\theta'] = minDeltaAngle;
        },

        "repositionImage": function(equationData) {
            var newCanvasCoords = this._getCanvasPointCoordinates(equationData.getPoints()[0]);
            equationData.getRaster().position = {
                "x": Math.round(newCanvasCoords[0]),
                "y": Math.round(newCanvasCoords[1])
            };
            geomFunctions.nudgeRaster(equationData.getRaster());
            equationData.trigger('plotComplete', equationData);
            this._paperScope.view.draw();
        },

        /**
         * redraw shape layer drawing.
         * @method _shapeRedraw
         * @private
         */
        "_shapeRedraw": function() {
            this._projectLayers.shapeLayer.activate();

            if (this._paperScope.project.activeLayer.children !== null) {
                this._paperScope.project.activeLayer.removeChildren();
            }

            this.trigger('graph:zoom-pan');
            this.activateLayer();
            this.refreshView();
        },
        "_delta": null,
        "_previousMaxValue": null,

        /**
         * zoom shape layer elements.
         * @method _shapeZoom
         * @private
         */
        "_shapeZoom": function() {
            this.activateScope();

            this._projectLayers.shapeLayer.activate();

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                currentOrigin = graphDisplay._graphOrigin.currentOrigin,
                canvasHeight = this._canvasSize.height,
                canvasWidth = this._canvasSize.width,
                currentMaxValue = this._getGraphPointCoordinates([canvasWidth, canvasHeight / 2])[0],
                scaleFactor = this._previousMaxValue / currentMaxValue,
                counter,
                children = this._paperScope.project.activeLayer.children,
                length = children.length;

            for (counter = 0; counter < length; counter++) {
                children[counter].bounds.x -= this._delta.x;
                children[counter].bounds.y -= this._delta.y;

                children[counter].scale(scaleFactor, currentOrigin);
            }

            this._previousMaxValue = currentMaxValue;

            this.refreshView();
        },

        "_layerDrag": function(layer, delta) {
            var children = layer.children,
                length = children.length;
            if (length !== 0) {
                layer.bounds.x += delta.x;
                layer.bounds.y += delta.y;
            }
        },
        /**
         * draw points for given equation data
         * @method drawPoint
         * @param {object} equation data object
         */
        "drawPoint": function(equationData, hollowPoints) {
            this._projectLayers.pointLayer.activate();

            var modelObject = this._gridGraphModelObject;

            if (modelObject.get('_points').indexOf(equationData) === -1) {
                modelObject.get('_points').push(equationData);
            }

            this._drawPoints(equationData, hollowPoints);
            if (equationData.getLabelData() !== null && equationData.getLabelData().labelObject !== null) {
                this._updateLabelPosition(equationData);
            }
        },
        /**
         * draw points for given equation data
         * @method _drawPoints
         * @param {object} equation data object
         * @private
         */
        "_drawPoints": function(equationData, hollowPoints) {

            this.activateScope();
            var point,
                pointCounter,
                path,
                toolTips,
                points,
                pointsLength,
                pathMouseDownFunction,
                isHollow,
                displayPoint,
                tolerance,
                filterFunction = function(index, value) {
                    return $(value).attr('data-point') === displayPoint[0] + '-' + displayPoint[1] ? void 0 : value;
                },
                color = equationData.getColor(),
                thickness = equationData.getThickness() * 3,
                dashArray = equationData.getDashArray(),
                isVisible = equationData.getPointVisibility(),
                opacity = equationData.getOpacity(),
                group = new this._paperScope.Group();

            if (this.isTooltipForPoint) {
                toolTips = this.$('.coordinate-tooltip[data-equation-cid="' + equationData.getCid() + '"]');
                if (toolTips.length !== 0) {
                    toolTips.hide();
                }
            }

            pathMouseDownFunction = _.bind(function(eventObj) {

                if (eventObj.event.which === 3) {
                    return;
                }
                var pointPath = eventObj.target,
                    point1 = pointPath.data.point.slice(),
                    displayPoint1, equationParent = pointPath.equation.hasParent,
                    contentX,
                    contentY,
                    currentTooltipForPoint;

                if (pointPath.hit === true) {
                    pointPath = this._getPointPath(pointPath.parent.children, pointPath.data.point);
                }
                contentX = this.getPowerOfNumber(point1[0]);
                contentY = this.getPowerOfNumber(point1[1]);
                currentTooltipForPoint = this.$('.coordinate-tooltip[data-point="' + this._getNumberForToolTip(contentX[0] + 'e' + contentX[1]) + '-' + this._getNumberForToolTip(contentY[0] + 'e' + contentY[1]) + '"]');
                this.$('.hover-tooltip').remove();
                displayPoint1 = pointPath.data.displayPoint;
                if (currentTooltipForPoint.length === 0) {
                    this.showToolTipForPoint(pointPath.bounds.center, contentX, contentY, false, equationData.getCid(), displayPoint1);
                    if (equationParent) {
                        if (pointPath.data.isHollow !== true) {
                            pointPath.fillColor = this._criticalPointsProperties.selected.color;
                            pointPath.data.selected = true;
                            pointPath.opacity = this._criticalPointsProperties.selected.opacity;
                        } else {
                            pointPath.fillColor = '#fff';
                            pointPath.data.selected = true;
                            pointPath.strokeWidth = this._discontinuosPointsProperties.selected.strokeWidth;
                            pointPath.strokeColor = this._discontinuosPointsProperties.selected.color;
                            pointPath.opacity = this._discontinuosPointsProperties.selected.opacity;
                        }
                    }
                } else {
                    currentTooltipForPoint.remove();
                    if (pointPath.equation.hasParent) {

                        if (pointPath.data.isHollow !== true) {
                            pointPath.fillColor = this._criticalPointsProperties.normal.color;
                            pointPath.data.selected = true;
                            if (!('ontouchstart' in window)) {
                                this.showToolTipOnMouseEnter(point1, false, equationData.getCid(), displayPoint1);
                            } else {
                                pointPath.opacity = this._discontinuosPointsProperties.normal.opacity;
                            }
                        } else {
                            if ('ontouchstart' in window) {
                                pointPath.fillColor = this._discontinuosPointsProperties.normal.color;
                                pointPath.strokeColor = this._discontinuosPointsProperties.normal.color;
                                pointPath.strokeWidth = this._discontinuosPointsProperties.normal.strokeWidth;
                                pointPath.opacity = this._discontinuosPointsProperties.normal.opacity;
                            } else {
                                pointPath.fillColor = '#fff';
                                pointPath.strokeColor = this._discontinuosPointsProperties.normal.color;
                                this.showToolTipOnMouseEnter(point1, false, equationData.getCid(), displayPoint1);
                            }
                        }

                        pointPath.data.selected = false;
                        if (equationData.getPointVisibility() === false) {
                            pointPath.visible = false;
                        }
                    }
                }

            }, this);

            points = equationData.getPoints();
            pointsLength = points.length;

            this.restrainViewRefreshByModule('grid.drawPoints');
            for (pointCounter = 0; pointCounter < pointsLength; pointCounter++) {
                displayPoint = points[pointCounter].slice();
                if (Math.abs(points[pointCounter][0]) < tolerance) {
                    points[pointCounter][0] = 0;
                }
                if (Math.abs(points[pointCounter][1]) < tolerance) {
                    points[pointCounter][1] = 0;
                }
                if (typeof hollowPoints !== 'undefined') {
                    displayPoint = hollowPoints[pointCounter];
                    isHollow = true;
                } else {
                    isHollow = false;
                }
                displayPoint[0] = this._getNumberForToolTip(displayPoint[0], this._gridGraphModelObject.get('toolTipPrecision'));
                displayPoint[1] = this._getNumberForToolTip(displayPoint[1], this._gridGraphModelObject.get('toolTipPrecision'));

                point = this._getCanvasPointCoordinates(points[pointCounter]);

                if (equationData.hasExtraThickness()) {
                    this.activateScope();
                    path = new this._paperScope.Path.Circle({
                        "center": point,
                        "radius": equationData.getDragHitThickness() / 2,
                        "fillColor": equationData.getDragHitColor()
                    });
                    path.hit = true;
                    path.fillColor.alpha = equationData.getDragHitAlpha();
                    path.equation = equationData;
                    path.data.point = points[pointCounter].slice();
                    group.addChild(path);
                    if (this.isTooltipForPoint) {

                        path.onMouseDown = pathMouseDownFunction;
                    }
                    path.visible = isVisible;
                }
                path = new this._paperScope.Path.Circle({
                    "center": point,
                    "radius": thickness / 2
                });

                path.equation = equationData;

                if (this.isTooltipForPoint) {
                    path.data.point = points[pointCounter].slice();
                    path.data.displayPoint = displayPoint;

                    if (isFinite(path.data.displayPoint[0]) && isFinite(path.data.displayPoint[1])) {
                        path.data.isHollow = isHollow;
                    } else {
                        path.data.isHollow = true;
                    }
                    path.onMouseDown = pathMouseDownFunction;
                    toolTips = toolTips.filter(filterFunction);
                }
                group.addChild(path);

                if (dashArray.length === 0) {
                    path.fillColor = color;
                } else {
                    path.fillColor = '#fff';
                    path.strokeColor = color;
                }
                path.opacity = opacity;
                path.visible = isVisible;
                this.repositionPointsToolTip(points[pointCounter].slice(), path, equationData.getPointVisibility());
            }

            this.freeViewRefreshByModule('grid.drawPoints');

            if (equationData.getPointsGroup()) {
                this._removePathRollOverListeners(equationData.getPointsGroup());
                /*
                For removing pathGroup we are not using paper.js remove function,
                because if we are sorting pathGroups in current layer &
                then removing a particular pathGroup using remove function
                then it removes inappropriate pathGroup from current layer...
                */
                this.removeDrawingObject(equationData.getPointsGroup());
                equationData.setPointsGroup(null);
            }
            equationData.setPointsGroup(group);
            equationData.trigger('plotComplete', equationData);
            this._setPathRollOverListeners(group);
            this.refreshView();
        },

        "_verifyPointFromEngine": function(point, equationData, paramVariable, equationOrder) {

            if (!(isFinite(point[0]) && isFinite(point[1]))) {
                return point;
            }
            var engine = equationData.getEngine(),
                newPoint = [],
                engine1;

            if (equationOrder !== 2) {
                engine1 = engine.engine1;
                if (paramVariable === 'x') {
                    newPoint[0] = point[0];
                    newPoint[1] = engine1(newPoint[0]);

                    if (isNaN(newPoint[1])) {
                        newPoint[1] = NaN;
                    }
                } else {
                    newPoint[1] = point[1];
                    newPoint[0] = engine1(newPoint[1]);

                    if (isNaN(newPoint[0])) {
                        newPoint[0] = NaN;
                    }
                }
                return newPoint;
            }
        },

        /**
         * reposition point layer elements after zoom and pan
         * @method _repositionPoints
         * @private
         */
        "_repositionPoints": function() {
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
                if (!pointsPathGroup || pointsPathGroup.children.length === 0) {
                    continue;
                }
                for (pointCounter = 0, pointCount = 0; pointCounter < pointsLength; pointCounter++, pointCount++) {
                    this.activateScope();
                    currentCoOrdinate = this._getCanvasPointCoordinates(currentEquationPoints[pointCounter]);
                    currentPath = pointsPathGroup.children[pointCount];
                    currentPath.position = new this._paperScope.Point(currentCoOrdinate);

                    if (currentPath.hit === true) {
                        pointCount++;
                        currentPath = pointsPathGroup.children[pointCount];
                        currentPath.position = new this._paperScope.Point(currentCoOrdinate);
                    }
                    this.repositionPointIndicator(currentEquationPoints[pointCounter]);
                    this.repositionPointsToolTip(this._getGraphPointCoordinates(currentCoOrdinate), currentPath, currentEquation.getPointVisibility());
                }
                if (currentEquation.getLabelData() !== null && currentEquation.getLabelData().labelObject !== null) {
                    this._updateLabelPosition(currentEquation);
                }
            }
            this.refreshView();
        },

        "_trimNumber": function(number, precision) {
            number = Math.round(number * Math.pow(10, precision));
            number = number / Math.pow(10, precision);
            return String(number);
        },

        "_getNumberForToolTip": function(number, precision) {
            if (typeof number === 'undefined' || number === null) {
                return void 0;
            }
            var numberString = number.toString(),
                numberSplitted,
                decimalLength,
                decimalRegex,
                decimalNumber;

            if (typeof precision === 'undefined') {
                precision = 2;
            }
            if (isNaN(number)) {
                return 'undefined';
            }
            if (numberString.indexOf('.') === -1 && numberString.indexOf('e') === -1) {
                return numberString;
            }
            numberString = this._trimNumber(number, precision);
            if (precision === 0) {
                return numberString;
            }
            numberSplitted = numberString.split('.');
            if (typeof numberSplitted[1] === 'undefined') {
                return numberString;
            }
            decimalRegex = /([0-9]*[1-9])([0]$)/g;
            numberSplitted[1] = numberSplitted[1].replace(decimalRegex, function($0, $1, $2) {
                $2 = null;
                return $1;
            });
            decimalNumber = Number(numberSplitted[1]);
            if (decimalNumber === 0) {
                return Number(numberSplitted[0]);
            }
            decimalLength = numberSplitted[1].length;
            if (decimalLength < precision) {
                precision = decimalLength;
            }
            numberString = this._trimNumber(number, precision);
            return numberString;
        },
        "clearToolTip": function(equationData, isRemove) {
            var count,
                criticalPointsequationData = equationData.getCriticalPoints(),
                intersectionPointsObject = equationData.getIntersectionPoints();
            if (isRemove === true) {
                $('.coordinate-tooltip[data-equation-cid=' + equationData.getCid() + ']').remove();
                $('.coordinate-tooltip[data-equation-cid=' + criticalPointsequationData.getCid() + ']').remove();
                for (count in intersectionPointsObject) {
                    $('.coordinate-tooltip[data-equation-cid=' + intersectionPointsObject[count].getCid() + ']').remove();
                }
            } else {
                $('.coordinate-tooltip[data-equation-cid=' + equationData.getCid() + ']').hide();
                $('.coordinate-tooltip[data-equation-cid=' + criticalPointsequationData.getCid() + ']').hide();
                for (count in intersectionPointsObject) {
                    $('.coordinate-tooltip[data-equation-cid=' + intersectionPointsObject[count].getCid() + ']').hide();
                }
            }
        },

        /**
         * remove given point object from point layer
         * @method removePoint
         * @param plotObject {object}
         */
        "removePoint": function(plotObject) {
            if (plotObject === null) {
                return;
            }
            this._projectLayers.pointLayer.activate();

            var index = this._gridGraphModelObject.get('_points').indexOf(plotObject),
                pointsGroup, point, $pointIndicator;
            if (index !== -1) {
                this._gridGraphModelObject.get('_points').splice(index, 1);
            }

            /*check if this function contain is same as _redrawPoints*/
            this._repositionPoints();

            pointsGroup = plotObject.getPointsGroup();
            if (pointsGroup) {
                this._removePathRollOverListeners(pointsGroup);
                /*
                For removing pathGroup we are not using paper.js remove function,
                because if we are sorting pathGroups in current layer &
                then removing a particular pathGroup using remove function
                then it removes inappropriate pathGroup from current layer...
                */
                this.removeDrawingObject(pointsGroup);
                plotObject.setPointsGroup(null);
            }

            this.$('.coordinate-tooltip[data-equation-cid=' + plotObject.cid + ']').remove();
            this.refreshView();
            this.activateLayer();
        },
        "removePointIndicatorForPoint": function(point) {
            var $pointIndicator = this.$('.point-indicator[data-point="' + point.toString() + '"]');
            point = point.toString();
            if ($pointIndicator.length > 0) {
                delete this.pointIndicatorPositionObject[point];
                $pointIndicator.remove();
            }
        },
        "removeRaster": function(rasterObject) {
            if (typeof rasterObject === 'undefined') {
                return;
            }
            var images = this._gridGraphModelObject.get('_images'),
                raster = null,
                index = null;

            this._projectLayers.imageLayer.activate();
            raster = rasterObject.getRaster();
            index = images.indexOf(rasterObject);
            if (raster) {
                /*
                For removing pathGroup we are not using paper.js remove function,
                because if we are sorting pathGroups in current layer &
                then removing a particular pathGroup using remove function
                then it removes inappropriate pathGroup from current layer...
                */
                this.removeDrawingObject(raster);
                rasterObject.setRaster(null);
            }
            if (index > -1) {
                images.splice(index, 1);
            }
            this.refreshView();
        },

        // this functionality is moved to _repositionPoints,not any more use
        /**
         * redraw all elements of point layer.
         * @method _redrawPoints
         * @private
         */
        "_redrawPoints": function() {
            this._projectLayers.pointLayer.activate();
            if (this._paperScope.project.activeLayer.children !== null) {
                this._paperScope.project.activeLayer.removeChildren();
            }
            var pointArray = this._gridGraphModelObject.get('_points'),
                i;

            for (i = 0; i < pointArray.length; i++) {
                this._drawPoints(pointArray[i]);
            }
            this.refreshView();
            this.activateLayer();
        },

        "repositionPointsToolTip": function(point, path, isEquationVisible) {
            if (!this.isTooltipForPoint) {
                return;
            }
            var pointToolTip,
                $canvas = this.$('#' + this._gridGraphModelObject.get('ID').canvasId),
                canvasCoordinates,
                tooltipLeft,
                tooltipTop,
                tooltipHeight,
                canvasTopLeft;

            pointToolTip = $(this.$('.coordinate-tooltip[data-point="' + this._getNumberForToolTip(point[0]) + '-' + this._getNumberForToolTip(point[1]) + '"]')[0]);

            if (pointToolTip.length !== 0) {
                canvasCoordinates = this._getCanvasPointCoordinates(point);
                canvasTopLeft = $canvas.position();
                tooltipHeight = pointToolTip.height();
                tooltipLeft = canvasTopLeft.left + canvasCoordinates[0];
                tooltipTop = canvasTopLeft.top + canvasCoordinates[1] - 2 * tooltipHeight;

                $(pointToolTip[0]).css({
                    "top": tooltipTop + 'px',
                    "left": tooltipLeft + 'px'
                });
                if (path.data.selected === true && isEquationVisible === true) {
                    pointToolTip.show();
                }
            }
        },

        "_changePlotColor": function() {
            var group = this.pathGroup;
            group.strokeColor = this.changed.color;

            //optimization diversion
        },
        /*
         *Adds label to the plotted shape
         @method addLabel
         @params {Object} equationData - contains the data about the shape to be plotted.
         @return void
        */
        "setLabelStyle": function(labelData) {
            var labelObject;
            labelObject = labelData.labelObject;
            labelObject.fillColor = '#000';
            labelObject.fontWeight = 'bold';
            labelObject.fontSize = 20;
            labelObject.font = 'noto-sans-italic';
            labelObject.content = labelData.text;
        },

        "addLabel": function(equationData) {

            var labelData = equationData.getLabelData(),
                pathGroup = equationData.getPathGroup();
            this.activateScope();
            this._projectLayers.labelLayer.activate();
            switch (equationData.getSpecie()) {
                case 'point':
                    if (labelData.labelObject) {
                        this._updateLabelPosition(equationData, true);
                    } else {
                        labelData.labelObject = new this._paperScope.PointText();
                        labelData.labelObject.equation = equationData;
                        this.setLabelStyle(labelData);
                        this._updateLabelPosition(equationData, true);
                    }
                    this._updateLabelPosition(equationData, true);
                    if (labelData.isSaveRestoreData === true) {
                        this._updateLabelPosition(equationData, true);
                    }
                    break;

                case 'polygon':
                    if (labelData.labelObject) {
                        this._updateLabelPosition(equationData, true);
                    } else {
                        labelData.labelObject = new this._paperScope.PointText();
                        labelData.labelObject.equation = equationData;
                        this.setLabelStyle(labelData);
                        if (pathGroup && pathGroup.children[0]) {
                            this._updateLabelPosition(equationData, true);
                        }
                    }
                    if (labelData.isSaveRestoreData === true) {
                        this._updateLabelPosition(equationData, true);
                    }
                    break;

                case 'plot':
                case 'curve':
                    if (!labelData.labelObject) {
                        labelData.labelObject = new this._paperScope.PointText();
                        labelData.labelObject.equation = equationData;
                        this.setLabelStyle(labelData);
                    }
                    if (pathGroup && pathGroup.children[0]) {
                        this._updateLabelPosition(equationData, true);
                    }
                    break;
            }

            this.refreshView();
            if (labelData.labelObject) {
                labelData.labelObject.onMouseEnter = this.onLabelRollOver;
                labelData.labelObject.onMouseLeave = this.onLabelRollOut;
            }
            equationData.on('post-relocate', _.bind(function(entity) {
                this._updateLabelPosition(entity.equation);
            }, this));
            equationData.on('teleported', _.bind(function(equation) {
                this._updateLabelPosition(equation);
            }, this));
            equationData.on('drag-label', _.bind(this._updateLabelPosition, this));
        },

        "_handleLabelPostDrag": function(equationData, dx, dy) {
            this._updateLabelPosition(equationData, true, dx, dy);
        },

        /*
        *Adds label to the plotted shape
        @private
        @method _updateLabelPosition
        @params {Array} graphCoordinates - contains the graph coordinates of the point around which label is to be plotted.
        @params {Object} equationData - contains the data about the shape to be plotted.
        @params {Array} coordinates - contains the canvas coordinates of the point around which label is to be plotted.
        @return void
        */
        "_updateLabelPosition": function(equationData, bAddLabel, dx, dy) {
            var labelData = equationData.getLabelData(),
                labelPosition;
            if (!labelData.labelObject) {
                return;
            }
            if (bAddLabel !== true || labelData.isSaveRestoreData === true) {
                this.trigger('change-label-position', null, equationData);
            }

            labelPosition = [labelData.position.x, labelData.position.y];

            if (typeof dx === 'number' && typeof dy === 'number') {

                labelData.labelObject.position.x += dx;
                labelData.labelObject.position.y += dy;

            } else {
                labelData.labelObject.position.x = labelPosition[0];
                labelData.labelObject.position.y = labelPosition[1];
            }
        },
        "repositionPointIndicator": function(point) {
            if (!point) {
                return;
            }
            var $canvas = this.$('#' + this._gridGraphModelObject.get('ID').canvasId),
                canvasPosition = $canvas.position(),
                $pointIndicator = this.$('.point-indicator[data-point="' + point.toString() + '"]'),
                tooltipPosition = {
                    "top": null,
                    "left": null
                },
                PADDING = 10,
                FOLDING_DOUBLING_FACTOR = 2,
                canvasCoordinates = this._getCanvasPointCoordinates(point);
            if ($pointIndicator.length === 0) {
                return;
            }
            $pointIndicator.css({
                "top": canvasPosition.top + canvasCoordinates[1],
                "left": canvasPosition.left + canvasCoordinates[0]
            });
            tooltipPosition.top = $pointIndicator.position().top - FOLDING_DOUBLING_FACTOR * $pointIndicator.height() + PADDING;
            tooltipPosition.left = $pointIndicator.position().left - $pointIndicator.outerWidth(true);
            this.pointIndicatorPositionObject[point.toString()].topLeft = tooltipPosition;
            this.pointIndicatorPositionObject[point.toString()].bottomRight = {
                "top": tooltipPosition.top + $pointIndicator.outerHeight(true),
                "left": tooltipPosition.left + $pointIndicator.outerWidth(true)
            };


            tooltipPosition = this.getPositionForIndicator({
                "currentPosition": tooltipPosition,
                "currentPoint": point,
                "changeCounter": 1,
                "dx": $pointIndicator.width() / FOLDING_DOUBLING_FACTOR,
                "dy": ($pointIndicator.height() - (PADDING / FOLDING_DOUBLING_FACTOR)) / FOLDING_DOUBLING_FACTOR
            });
            $pointIndicator.css({
                "top": tooltipPosition.top,
                "left": tooltipPosition.left
            });
        },
        "showPointIndicatorForPoint": function(point, displayValue) {
            var $canvas = this.$('#' + this._gridGraphModelObject.get('ID').canvasId),
                canvasPosition = $canvas.position(),
                indicatorPosition = {
                    "top": null,
                    "left": null
                },
                PADDING = 10,
                FOLDING_DOUBLING_FACTOR = 2,
                $pointIndicator = this.$('.point-indicator[data-point="' + point.toString() + '"]'),
                canvasCoordinates = this._getCanvasPointCoordinates(point);
            if ($pointIndicator.length === 0) {
                $pointIndicator = $('<div class="point-indicator" />').css({
                    "top": canvasPosition.top + canvasCoordinates[1],
                    "left": canvasPosition.left + canvasCoordinates[0]
                });
                this.$el.append($pointIndicator);
                $pointIndicator.html(displayValue).attr('data-point', point.toString());
            } else {
                $pointIndicator.html(displayValue);
                return;
            }
            indicatorPosition.top = $pointIndicator.position().top - FOLDING_DOUBLING_FACTOR * $pointIndicator.height() + PADDING;
            indicatorPosition.left = $pointIndicator.position().left - $pointIndicator.outerWidth(true);
            this.pointIndicatorPositionObject[point.toString()] = {
                "topLeft": indicatorPosition,
                "bottomRight": {
                    "top": indicatorPosition.top + $pointIndicator.outerHeight(true),
                    "left": indicatorPosition.left + $pointIndicator.outerWidth(true)
                },
                "width": $pointIndicator.outerWidth(true),
                "height": $pointIndicator.outerHeight(true),
                "value": displayValue

            };
            indicatorPosition = this.getPositionForIndicator({
                "currentPosition": indicatorPosition,
                "currentPoint": point,
                "changeCounter": 1,
                "dx": $pointIndicator.width() / FOLDING_DOUBLING_FACTOR,
                "dy": ($pointIndicator.height() - (PADDING / FOLDING_DOUBLING_FACTOR)) / FOLDING_DOUBLING_FACTOR
            });
            $pointIndicator.css({
                "top": indicatorPosition.top,
                "left": indicatorPosition.left
            });

        },
        "getPositionForIndicator": function(dataObject) {
            var newPosition,
                currentPosition = dataObject.currentPosition,
                currentPoint = dataObject.currentPoint,
                changeCounter = dataObject.changeCounter,
                dx = dataObject.dx,
                dy = dataObject.dy,
                pointName = currentPoint.toString(),
                topLeft = this.pointIndicatorPositionObject[pointName].topLeft,
                bottomRight = this.pointIndicatorPositionObject[pointName].bottomRight,
                width = this.pointIndicatorPositionObject[pointName].width,
                height = this.pointIndicatorPositionObject[pointName].height;
            _.each(this.pointIndicatorPositionObject, _.bind(function(value, counter) {
                if (counter !== pointName) {
                    if (bottomRight.top > value.topLeft.top && topLeft.top < value.bottomRight.top &&
                        bottomRight.left > value.topLeft.left && topLeft.left < value.bottomRight.left) {
                        // calculate new position
                        changeCounter++;
                        if (changeCounter > 8) { //max positions possible are 8
                            return newPosition || currentPosition;
                        }
                        newPosition = this.getUpdatedPositionForPointIndicator(currentPosition, dx, dy, changeCounter);
                        this.pointIndicatorPositionObject[pointName].topLeft = topLeft = newPosition;
                        this.pointIndicatorPositionObject[pointName].bottomRight = bottomRight = {
                            "top": newPosition.top + height,
                            "left": newPosition.left + width
                        };
                        newPosition = this.getPositionForIndicator({
                            "currentPosition": newPosition,
                            "currentPoint": currentPoint,
                            "changeCounter": changeCounter,
                            "dx": dx,
                            "dy": dy
                        });
                    }
                }

            }, this));
            return newPosition || currentPosition;
        },
        "getUpdatedPositionForPointIndicator": function(position, dx, dy, flag) {
            var updatedPosition = {
                    "top": null,
                    "left": null
                },
                positionObject = {
                    "one": 1,
                    "two": 2,
                    "three": 3,
                    "four": 4,
                    "five": 5,
                    "six": 6,
                    "seven": 7,
                    "eight": 8
                },
                DOUBLING_FACTOR = 2,
                doubleDx = DOUBLING_FACTOR * dx,
                doubleDy = DOUBLING_FACTOR * dy,
                LEFT_PADDING = 5;
            switch (flag) {
                case positionObject.one:
                    updatedPosition.top = position.top;
                    updatedPosition.left = position.left + LEFT_PADDING;
                    break;
                case positionObject.two:
                    updatedPosition.top = position.top + dy;
                    updatedPosition.left = position.left;
                    break;
                case positionObject.three:
                    updatedPosition.top = position.top + doubleDy;
                    updatedPosition.left = position.left;
                    break;
                case positionObject.four:
                    updatedPosition.top = position.top + doubleDy;
                    updatedPosition.left = position.left + dx;
                    break;
                case positionObject.five:
                    updatedPosition.top = position.top + doubleDy;
                    updatedPosition.left = position.left + doubleDx;
                    break;
                case positionObject.six:
                    updatedPosition.top = position.top + dy;
                    updatedPosition.left = position.left + doubleDx
                    break;
                case positionObject.seven:
                    updatedPosition.top = position.top;
                    updatedPosition.left = position.left + doubleDx;
                    break;
                case positionObject.eight:
                    updatedPosition.top = position.top;
                    updatedPosition.left = position.left + dx;
                    break;
            }
            updatedPosition.left -= LEFT_PADDING;
            return updatedPosition;
        },

        "showToolTipForPoint": function(point, x, y, isDrag, equationDataCid, displayPoint) {
            var $canvas = this.$('#' + this._gridGraphModelObject.get('ID').canvasId),
                canvasPosition = $canvas.position(),
                $tooltip = $('<div class="coordinate-tooltip" />').css({
                    "top": canvasPosition.top + point.y,
                    "left": canvasPosition.left + point.x
                }),
                tooltipText = this._getNumberForToolTip(x[0], this._gridGraphModelObject.get("toolTipPrecision")),
                displayString;

            if (x[1] !== 0) {
                tooltipText += ' x 10 <sup>' + x[1] + '</sup>';
            }
            tooltipText += ',&nbsp;' + this._getNumberForToolTip(y[0], this._gridGraphModelObject.get("toolTipPrecision"));
            if (y[1] !== 0) {
                tooltipText += ' x 10 <sup>' + y[1] + '</sup>';
            }
            if (displayPoint) {
                if (displayPoint[0] !== 'undefined' && displayPoint[0].indexOf('e') !== -1) {
                    displayString = displayPoint[0].split('e');
                    displayPoint[0] = this._getNumberForToolTip(displayString[0], this._gridGraphModelObject.get("toolTipPrecision"))
                        + " x 10 <sup>" + displayString[1] + "</sup>";
                }
                if (displayPoint[1] !== 'undefined' && displayPoint[1].indexOf('e') !== -1) {
                    displayString = displayPoint[1].split('e');
                    displayPoint[1] = this._getNumberForToolTip(displayString[0], this._gridGraphModelObject.get("toolTipPrecision"))
                        + " x 10 <sup>" + displayString[1] + "</sup>";
                }
                tooltipText = displayPoint[0] + ',&nbsp;' + displayPoint[1];
            }
            $tooltip.html(tooltipText);
            if (isDrag) {
                this.$('.drag-tooltip').remove();
                $tooltip.addClass('drag-tooltip');
            } else {
                $tooltip.attr({
                    "data-point": this._getNumberForToolTip(x[0] + 'e' + x[1]) + '-' + this._getNumberForToolTip(y[0] + 'e' + y[1]),
                    "data-equation-cid": equationDataCid
                });
            }
            this.$el.append($tooltip);
            $tooltip.css('top', $tooltip.position().top - 2 * $tooltip.height());
        },

        /*
        Function to add array of points to a figure on the graph
        @param points: Array of points in the format [[point1 x co-ordinate,point1 y co-ordinate],[point2 x co-ordinate,point2 y co-ordinate],.........,[pointn x co-ordinate,pointn y co-ordinate]]
        */
        "addPoints": function(equationData) {
            this._projectLayers.shapeLayer.activate();

            var currentParam, previousParam, currentPoint, previousPoint, currentPath, path, arrOrderNo, orderCounter, breakAfter, arrTemp,
                arrPreviousOrder, newPath, arrColor, points, color, thickness, group, THRESHOLD, _NORMAL_STYLE, _HIGHLIGHT_STYLE, pointCounter,
                pathGroup = equationData.getPathGroup();

            if (pathGroup !== null) {
                /*
                For removing pathGroup we are not using paper.js remove function,
                because if we are sorting pathGroups in current layer &
                then removing a particular pathGroup using remove function
                then it removes inappropriate pathGroup from current layer...
                */
                this.removeDrawingObject(pathGroup);
                this._removePathRollOverListeners(pathGroup);
            }
            if (this._gridGraphModelObject.get('_plots').indexOf(equationData) === -1) {
                this._gridGraphModelObject.get('_plots').push(equationData);
            }

            Backbone.listenTo(equationData, 'change:color', _.bind(this._changePlotColor, equationData));

            points = equationData.getPoints();
            color = equationData.getColor();
            thickness = equationData.getThickness();

            currentParam = null;
            previousParam = null;

            previousPoint = null;
            group = new this._paperScope.Group();
            currentPath = new this._paperScope.Path();
            currentPath.equation = equationData;
            currentPath.strokeColor = color;
            currentPath.strokeWidth = thickness;
            group.addChild(currentPath);

            arrOrderNo = [];

            breakAfter = false;
            arrColor = [];
            THRESHOLD = 1;
            _NORMAL_STYLE = 'color: #000';
            _HIGHLIGHT_STYLE = 'background: #0c0; color: #fff';

            for (pointCounter = 0; pointCounter < points.length; pointCounter++) {
                currentPoint = points[pointCounter];
                if (previousPoint !== null &&
                    previousPoint[0] === currentPoint[0] &&
                    previousPoint[1] === currentPoint[1]) {
                    continue;
                }
                newPath = false;

                for (orderCounter = 0; orderCounter < 4; orderCounter++) {
                    breakAfter = arrOrderNo[orderCounter] === null || typeof arrOrderNo[orderCounter] === 'undefined';

                    if (orderCounter === 0) {
                        if (breakAfter) {
                            arrOrderNo[orderCounter] = [];
                        }
                        arrOrderNo[orderCounter].push(currentPoint);
                    } else {
                        if (breakAfter) {
                            arrOrderNo[orderCounter] = [];
                        }
                        arrPreviousOrder = arrOrderNo[orderCounter - 1];
                        arrOrderNo[orderCounter].push(this._getPointDiff(arrPreviousOrder));
                    }

                    arrTemp = arrOrderNo[orderCounter];
                    arrColor[orderCounter] = orderCounter >= 2 && (Math.abs(arrTemp[arrTemp.length - 1][0]) > THRESHOLD || Math.abs(arrTemp[arrTemp.length - 1][1]) > THRESHOLD) ? _HIGHLIGHT_STYLE : _NORMAL_STYLE;

                    if (breakAfter) {
                        break;
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
            group.strokeColor = color;

            this.refreshView();
            equationData.setPathGroup(group);

            equationData.set({
                "color": '#000'
            });

            this.updateVisibleDomain();
        },

        "addImage": function(equationData) {
            this._gridGraphModelObject.get('_images').push(equationData);
            equationData.getRaster().onMouseEnter = _.bind(this.imageRollOver, this);
            equationData.getRaster().onMouseLeave = _.bind(this.imageRollOut, this);
        },

        "deleteImage": function(equationData) {
            var images = this._gridGraphModelObject.get('_images'),
                index = images.indexOf(equationData);
            if (index > -1) {
                images.splice(index, 1);
            }
        },

        "imageRollOver": function() {
            this.trigger('image-roll-over');
        },

        "imageRollOut": function() {
            this.trigger('image-roll-out');
        },

        "bringGraphPointsToFront": function(equationPointsGroup) {
            equationPointsGroup.bringToFront();
        },

        "_traceMouseDownHandle": function(event, curve) {
            if (event.event.which === 3) {
                this._gridGraphModelObject.set('isRightClick', true);
                return;
            }
            this._gridGraphModelObject.set('isRightClick', false);

            if (!this.isTooltipForPoint) {
                return;
            }
            // Bring curve which was clicked to front
            curve.bringToFront();

            var circleDrag, model;

            model = this._gridGraphModelObject;

            curve.children[0].equation.trigger('focus-equation');

            circleDrag = new this._paperScope.Path.Circle({
                "x": 0,
                "y": 0
            }, curve.children[0].equation.getThickness());
            circleDrag.fillColor = curve.children[0].equation.getColor();

            if (model.get('circleDrag')) {
                model.get('circleDrag').remove();
            }

            model.set('circleDrag', circleDrag);
            this._traceMouseDragHandle(event, curve);
        },

        "_getPrecisePointBetween": function(x1, x2) {
            var mean, sign,
                u1, u2,
                m1, m2,
                e1, e2,
                precision,
                mCounter,
                minLength;

            mean = geomFunctions.mean(x1, x2);

            if (x1 > 0 !== x2 > 0 || (x1 === 0 || x2 === 0)) {
                return 0;
            }
            // Already know x1 and x2 have the same sign, so make them positive
            // to avoid complication of leading '-' sign.
            sign = x1 > 0 ? 1 : -1;
            u1 = (Math.abs(x1)).toExponential().split('e');
            u2 = (Math.abs(x2)).toExponential().split('e');
            m1 = u1[0];
            m2 = u2[0];
            e1 = u1[1];
            e2 = u2[1];
            if (e2 !== e1) {
                return sign * Math.pow(10, Math.max(parseFloat(e1), parseFloat(e2)));
            }
            if (m1[0] !== m2[0]) {
                return parseFloat(mean.toPrecision(1));
            }

            // Start at 2 to skip the decimal point. We've already examined
            // the leading digit.
            minLength = Math.min(m1.length, m2.length);
            for (mCounter = 2; mCounter < minLength; mCounter++) {
                if (m1[mCounter] !== m2[mCounter]) {
                    break;
                }
            }
            return mean;
        },

        "_getDistance": function(equationData, pt, paramVariable) {
            var minLeftDistance,
                minRightDistance,
                closestLeftPoint,
                closestRightPoint,
                segments,
                segment,
                noOfSegments,
                noOfSegment,
                segmentsCounter,
                segmentCounter,
                x1, y1,
                x2, y2,
                temp,
                p,
                distance,
                closestPoint,
                xClosest,
                yClosest,
                graphBounds = this.getMarkerBounds(),
                $canvas = this.$('canvas'),
                xscale = $canvas.width() / (graphBounds.max.x - graphBounds.min.x),
                yscale = $canvas.height() / (graphBounds.max.y - graphBounds.min.y),
                x = pt[0],
                y = pt[1];

            if (paramVariable !== 'x') {
                temp = x;
                x = y;
                y = temp;
                temp = xscale;
                xscale = yscale;
                yscale = temp;
            }

            minLeftDistance = Infinity;
            minRightDistance = Infinity;
            segments = equationData.getArr();
            if (!segments) {
                return null;
            }
            noOfSegments = segments.length;
            for (segmentsCounter = 0; segmentsCounter < noOfSegments; segmentsCounter++) {
                segment = segments[segmentsCounter];
                noOfSegment = segment.length;
                for (segmentCounter = 0; segmentCounter < noOfSegment - 3; segmentCounter += 2) {
                    x1 = segment[segmentCounter];
                    y1 = segment[segmentCounter + 1];
                    x2 = segment[segmentCounter + 2];
                    y2 = segment[segmentCounter + 3];
                    p = geomFunctions.closestPointOnSegment(
                        0, 0, (x1 - x) * xscale, (y1 - y) * yscale, (x2 - x) * xscale, (y2 - y) * yscale
                    );
                    distance = geomFunctions.hypotenuse(p[0], p[1]);
                    if (p[0] < 0) {
                        if (distance < minLeftDistance) {
                            minLeftDistance = distance;
                            closestLeftPoint = p;
                        }
                    } else {
                        if (distance < minRightDistance) {
                            minRightDistance = distance;
                            closestRightPoint = p;
                        }
                    }
                }
            }

            closestPoint = minLeftDistance < minRightDistance ? closestLeftPoint : closestRightPoint;

            // Can happen if the branch has no segments, or if there is a segment with no points.
            if (!closestPoint) {
                return null;
            }

            xClosest = closestPoint[0] / xscale + x;
            yClosest = closestPoint[1] / yscale + y;

            return {
                "closestPoint": {
                    "x": paramVariable === 'x' ? xClosest : yClosest,
                    "y": paramVariable === 'x' ? yClosest : xClosest
                },
                "minDistance": Math.min(minLeftDistance, minRightDistance),
                "secondDistance": Math.max(minLeftDistance, minRightDistance),
                "scale": [xscale, yscale]
            };
        },
        "_getYCoord": function(engine, xVal, xscale, yscale, x, y) {
            var xLeft,
                xRight,
                yLeft,
                yRight,
                dxLeft,
                dxRight,
                dyLeft,
                dyRight,
                yVal = engine(xVal);

            if (isFinite(yVal)) {
                return yVal;
            }

            xLeft = xVal - 0.00000000001;
            xRight = xVal + 0.00000000001;
            yLeft = engine(xLeft);
            yRight = engine(xRight);

            if (isNaN(yLeft) && isNaN(yRight)) {
                return NaN;
            }
            if (isNaN(yLeft)) {
                return yRight;
            }
            if (isNaN(yRight)) {
                return yLeft;
            }

            dxLeft = (x - xLeft) * xscale;
            dxRight = (x - xRight) * xscale;
            dyLeft = (y - yLeft) * yscale;
            dyRight = (y - yRight) * yscale;

            if (geomFunctions.hypotenuse(dxLeft, dyLeft) < geomFunctions.hypotenuse(dxRight, dyRight)) {
                return yLeft;
            }
            return yRight;
        },

        "_traceMouseDragHandle": function(event, curve) {

            if (this._gridGraphModelObject.get('isRightClick') || !this.isTooltipForPoint) {
                return void 0;
            }
            var model = this._gridGraphModelObject,
                coordinate,
                contentX,
                contentY,
                xscale,
                yscale,
                aboveWeight,
                xWeighted,
                dir,
                dx,
                dy,
                yLeft, yMid, yRight,
                dxRight, dxLeft,
                above,
                circleDrag,
                engine1, engine2,
                engineToBePassed,
                coordIndex = 0,
                sol1,
                sol2,
                hollowPoints,
                hollowPointsGroup,
                pointPath,
                temp,
                tempCoord,
                engine,
                functions,
                equationData = curve.children[0].equation,
                paramVariable = equationData.getParamVariable(),
                functionVariable = equationData.getFunctionVariable(),
                equationRange = equationData.getRange(),
                color = equationData.getColor(),
                equationDataConstants = equationData.getConstants(),
                point = this._getGraphPointCoordinates([event.point.x, event.point.y]),
                distanceInfo = this._getDistance(equationData, point, paramVariable);
            if (distanceInfo === null) {
                return void 0;
            }
            if (model.get('circleDrag')) {
                model.get('circleDrag').remove();
            }
            circleDrag = new this._paperScope.Path.Circle({
                "x": 0,
                "y": 0
            }, curve.children[0].equation.getThickness());
            circleDrag.fillColor = equationData.getColor();
            model.set('circleDrag', circleDrag);
            functions = equationData.getFunctions();
            engine = new Function('param,constants,functions', curve.children[0].equation.getFunctionCode());
            circleDrag.data.equation = equationData;
            // handling for 2nd order equations
            if (equationData.getParamVariableOrder() === 2) {
                engine1 = function eng1(param) {
                    var soln = engine(param, equationDataConstants, functions);
                    return soln[0];
                };
                engine2 = function eng2(param) {
                    var soln = engine(param, equationDataConstants, functions);
                    return soln[1];
                };
                sol1 = engine1(distanceInfo.closestPoint[paramVariable]);
                sol2 = engine2(distanceInfo.closestPoint[paramVariable]);
                if (Math.abs(sol1 - distanceInfo.closestPoint[functionVariable]) > Math.abs(sol2 - distanceInfo.closestPoint[functionVariable])) {
                    engineToBePassed = engine2;
                } else {
                    engineToBePassed = engine1;
                }
            } else {
                engineToBePassed = function eng1(param) {
                    return engine(param, equationDataConstants, functions)[0];
                };
            }

            if (this.$('.hover-tooltip').attr('event-id')) {
                circleDrag.visible = false;
                this.isSnap = true;
                return void 0;
            }
            this.isSnap = false;

            xscale = distanceInfo.scale[0];
            yscale = distanceInfo.scale[1];

            if (!distanceInfo) {
                return null;
            }

            aboveWeight = distanceInfo.minDistance / distanceInfo.secondDistance;

            aboveWeight = aboveWeight * aboveWeight;
            if (paramVariable === 'x') {
                dir = 'x';
                coordIndex = 0;
            } else {
                dir = 'y';
                coordIndex = 1;
            }

            xWeighted = distanceInfo.closestPoint[dir] * (1 - aboveWeight) + point[coordIndex] * aboveWeight;

            dx = 1 / (2 * xscale);
            dy = 1 / (2 * yscale);

            yLeft = engineToBePassed(xWeighted - dx);
            yMid = engineToBePassed(xWeighted);
            yRight = engineToBePassed(xWeighted + dx);

            dxLeft = dx * Math.min(1, dy / Math.abs(yLeft - yMid));
            dxRight = dx * Math.min(1, dy / Math.abs(yRight - yMid));

            if (!isFinite(dxLeft)) {
                dxLeft = dx;
            }
            if (!isFinite(dxRight)) {
                dxRight = dx;
            }

            xWeighted = this._getPrecisePointBetween(xWeighted - dxLeft, xWeighted + dxRight);

            above = this._getYCoord(engineToBePassed, xWeighted, xscale, yscale, point[0], point[1]);

            if (isNaN(above) || isNaN(xWeighted) || !isFinite(above) || !isFinite(xWeighted)) {
                this.$('.drag-tooltip').remove();
                return void 0;
            }
            if (paramVariable !== 'x') {
                temp = xWeighted;
                xWeighted = above;
                above = temp;
            }
            tempCoord = [xWeighted, Number(this._getNumberForToolTip(above))];
            coordinate = this._getCanvasPointCoordinates([xWeighted, above]);

            if (coordinate[0] > this.$el.width() || coordinate[1] > this.$el.height() || coordinate[0] < -10 || coordinate[1] < -10) {
                this.$('.drag-tooltip').remove();
                return void 0;
            }
            point = this._getGraphPointCoordinates(coordinate);

            if (equationRange) {
                if (equationRange.variable === 'x') {
                    if (equationRange.min !== null && equationRange.min.value > point[0] ||
                        equationRange.max !== null && equationRange.max.value < point[0]) {
                        this.$('.drag-tooltip').remove();
                        return void 0;
                    }
                } else if (equationRange.variable === 'y') {
                    if (equationRange.min !== null && equationRange.min.value > point[1] ||
                        equationRange.max !== null && equationRange.max.value < point[1]) {
                        this.$('.drag-tooltip').remove();
                        return void 0;
                    }
                }
                if (equationRange.rangeForFunctionVariable && equationRange.rangeForFunctionVariable.variable === 'x') {
                    if (equationRange.rangeForFunctionVariable.min !== null && equationRange.rangeForFunctionVariable.min.value > point[0] ||
                        equationRange.rangeForFunctionVariable.max !== null && equationRange.rangeForFunctionVariable.max.value < point[0]) {
                        this.$('.drag-tooltip').remove();
                        return void 0;
                    }
                } else if (equationRange.rangeForFunctionVariable && equationRange.rangeForFunctionVariable.variable === 'y') {
                    if (equationRange.rangeForFunctionVariable.min !== null && equationRange.rangeForFunctionVariable.min.value > point[1] ||
                        equationRange.rangeForFunctionVariable.max !== null && equationRange.rangeForFunctionVariable.max.value < point[1]) {
                        this.$('.drag-tooltip').remove();
                        return void 0;
                    }
                }
            }
            circleDrag.position = {
                "x": coordinate[0],
                "y": coordinate[1]
            };
            if (paramVariable === 'x') {
                above = engineToBePassed(xWeighted);
            } else {
                xWeighted = engineToBePassed(above);
            }
            hollowPoints = equationData.getHollowPoints();
            if (this.showGraph === true) {
                if (hollowPoints !== null) {
                    hollowPoints.showGraph();
                }
            }

            if (isNaN(above) || isNaN(xWeighted) || !isFinite(above) || !isFinite(xWeighted)) {
                circleDrag.fillColor = '#fff';
                circleDrag.strokeWidth = 2;
                circleDrag.strokeColor = color;
                coordinate[0] = 'undefined';
                if (hollowPoints !== null) {
                    hollowPointsGroup = hollowPoints.getPointsGroup();
                    if (hollowPointsGroup !== null) {
                        pointPath = this._getPointPath(hollowPointsGroup.children, tempCoord);

                        if (typeof pointPath !== 'undefined' && pointPath.data.selected !== true) {
                            pointPath.visible = false;
                        }
                    }
                }
                this.showGraph = true;
            } else {
                circleDrag.strokeWidth = 0;
                circleDrag.fillColor = color;
                circleDrag.strokeColor = color;
                this.showGraph = false;
            }

            circleDrag.visible = true;
            coordinate = [xWeighted, above];

            contentX = this.getPowerOfNumber(coordinate[0], this._gridGraphModelObject.get('_graphDisplayValues')._zoomingFactor.xTotalMultiplier);

            contentY = this.getPowerOfNumber(coordinate[1], this._gridGraphModelObject.get('_graphDisplayValues')._zoomingFactor.yTotalMultiplier);

            if (isNaN(contentX[0])) {
                contentX[0] = 'undefined';
            }
            if (isNaN(contentY[0])) {
                contentY[0] = 'undefined';
            }
            this.showToolTipForPoint(circleDrag.position, contentX, contentY, true);
        },

        "drawInequalitites": function(equationData) {
            var inEqualitityPlots = equationData.getInEqualityPlots(),
                totalPlots,
                plotCounter,
                opacity,
                path, oldGroup,
                group;

            this._projectLayers.shapeLayer.activate();
            if (inEqualitityPlots === null) {
                return;
            }
            this.removeInEqualityPlots(equationData);
            this.activateScope();
            this._projectLayers.shapeLayer.activate();
            opacity = equationData.getInEqualityOpacity();
            group = new this._paperScope.Group();
            group.fillColor = equationData.getColor();
            group.strokeColor = equationData.getColor();
            group.fillColor.alpha = opacity;
            group.strokeColor.alpha = 0;
            totalPlots = inEqualitityPlots.length;
            for (plotCounter = totalPlots - 1; plotCounter >= 0; plotCounter--) {
                path = new this._paperScope.Path({
                    "segments": inEqualitityPlots[plotCounter].reverse()
                });
                path.fillColor = equationData.getColor();
                path.strokeColor = equationData.getColor();
                path.fillColor.alpha = opacity;
                path.strokeColor.alpha = 0;
                path.equation = equationData;
                path.bypassMouseEvents = true;
                path.sendToBack();
                group.addChild(path);
            }

            oldGroup = group;
            //don't rasterize if its too small,paper js doesn't create the raster
            if (group.strokeBounds.width !== 0 && group.strokeBounds.height !== 0 && group.bounds.width > 50 && group.bounds.height > 50) {
                group = group.rasterize();
                /*
                For removing pathGroup we are not using paper.js remove function,
                because if we are sorting pathGroups in current layer &
                then removing a particular pathGroup using remove function
                then it removes inappropriate pathGroup from current layer...
                */
                this.removeDrawingObject(oldGroup);
            }
            group.sendToBack();
            group.bypassMouseEvents = true;
            group.equation = equationData;
            equationData.setInEqualititesPathGroup(group);
        },

        "removeInEqualityPlots": function(equationData) {
            var inEqualityPlot = equationData.getInEqualititesPathGroup();
            if (inEqualityPlot !== null) {
                /*
                For removing pathGroup we are not using paper.js remove function,
                because if we are sorting pathGroups in current layer &
                then removing a particular pathGroup using remove function
                then it removes inappropriate pathGroup from current layer...
                */
                this.removeDrawingObject(inEqualityPlot);
                equationData.setInEqualititesPathGroup(null);
            }
        },

        "_addCurve": function(equationData) {
            this.activateScope();
            this._projectLayers.shapeLayer.activate();

            if (equationData.getPathGroup() !== null) {
                this._removePathRollOverListeners(equationData.getPathGroup());
                /*
                For removing pathGroup we are not using paper.js remove function,
                because if we are sorting pathGroups in current layer &
                then removing a particular pathGroup using remove function
                then it removes inappropriate pathGroup from current layer...
                */
                this.removeDrawingObject(equationData.getPathGroup());
            }

            var path, equationLabelData,
                i, looper,
                color = equationData.getColor(),
                thickness = equationData.getThickness(),
                isVisible = equationData.getCurveVisibility(),
                leftArray = equationData.getLeftArray(),
                group = new this._paperScope.Group();

            for (i = 0; i < leftArray.length; i++) {
                if (equationData.hasExtraThickness()) {
                    path = new this._paperScope.Path();
                    path.strokeColor = equationData.getDragHitColor();
                    path.strokeColor.alpha = equationData.getDragHitAlpha();
                    path.equation = equationData;
                    path.hit = true;
                    path.equationID = equationData.getId();
                    path.strokeWidth = equationData.getDragHitThickness();

                    if (leftArray[i].length >= 8) {
                        //8 points are minimum for a curve
                        //8 points x y alternate
                        //first start of C Bezier and followed by 3 points of C Bezier
                        for (looper = 0; looper < leftArray[i].length; looper += 8) {

                            path.add(leftArray[i][looper], leftArray[i][looper + 1]);
                            path.cubicCurveTo(leftArray[i][looper + 2], leftArray[i][looper + 3],
                                leftArray[i][looper + 4], leftArray[i][looper + 5],
                                leftArray[i][looper + 6], leftArray[i][looper + 7]
                            );
                        }
                    } else {
                        //2 points means a path
                        path.lineTo(leftArray[i][0], leftArray[i][1]);
                    }

                    group.addChild(path);
                }
                if (leftArray[i].length >= 8) {
                    path = new this._paperScope.Path();
                    path.strokeWidth = thickness;
                }

                if (leftArray[i].length >= 8) {
                    //8 points are minimum for a curve
                    //8 points x y alternate
                    //first start of C Bezier and followed by 3 points of C Bezier
                    for (looper = 0; looper < leftArray[i].length; looper += 8) {
                        path.add(leftArray[i][looper], leftArray[i][looper + 1]);
                        path.cubicCurveTo(leftArray[i][looper + 2], leftArray[i][looper + 3],
                            leftArray[i][looper + 4], leftArray[i][looper + 5],
                            leftArray[i][looper + 6], leftArray[i][looper + 7]
                        );
                    }
                } else {
                    //2 points means a path
                    path.lineTo(leftArray[i][0], leftArray[i][1]);
                }

                if (equationData.getIsFilled()) {
                    path.fillColor = group.fillColor = color;
                    path.fillColor.alpha = group.fillColor.alpha = equationData.getInEqualityOpacity();
                    path.strokeColor = group.strokeColor = color;
                    path.strokeColor.alpha = group.strokeColor.alpha = 0;
                } else {
                    path.strokeColor = color;
                }

                path.equation = equationData;
                path.equationID = equationData.getId();
                group.addChild(path);
            }

            group.visible = isVisible;
            equationData.setPathGroup(group);
            if (equationData._parent) {
                this._setPathRollOverListeners(group);
            }

            equationLabelData = equationData.getLabelData();
            if (equationLabelData !== null && equationLabelData.labelObject !== null) {
                this._updateLabelPosition(equationData);
            }
            this.activateLayer();
            this.refreshView();

            if (this._gridGraphModelObject.get('_plots').indexOf(equationData) === -1) {
                this._gridGraphModelObject.get('_plots').push(equationData);
            }
        },

        "_addSegments": function(equationData) {

            this.activateScope();
            var path, group, equationLabelData,
                i,
                pointsLength,
                opacity,
                color, thickness, isVisible,
                leftArray = equationData.getLeftArray(),
                rightArray = equationData.getRightArray();

            this._projectLayers.shapeLayer.activate();

            if (equationData.getPathGroup() !== null) {
                this._removePathRollOverListeners(equationData.getPathGroup());
                /*
                For removing pathGroup we are not using paper.js remove function,
                because if we are sorting pathGroups in current layer &
                then removing a particular pathGroup using remove function
                then it removes inappropriate pathGroup from current layer...
                */
                this.removeDrawingObject(equationData.getPathGroup());
            }
            color = equationData.getColor();
            thickness = equationData.getThickness();
            isVisible = equationData.getCurveVisibility();
            opacity = equationData.getOpacity();
            group = new this._paperScope.Group();
            this.activateScope();

            for (i = 0; i < leftArray.length; i++) {
                pointsLength = leftArray[i].length;
                if (equationData.hasExtraThickness()) {
                    path = new this._paperScope.Path({
                        "segments": leftArray[i]
                    });
                    path.strokeColor = equationData.getDragHitColor();
                    path.strokeColor.alpha = equationData.getDragHitAlpha();
                    path.equation = equationData;
                    path.hit = true;
                    path.equationID = equationData.getId();
                    path.strokeWidth = equationData.getDragHitThickness();
                    if (pointsLength === 1) {
                        path.add(leftArray[0]);
                    }
                    group.addChild(path);
                }

                path = new this._paperScope.Path({
                    "segments": leftArray[i]
                });
                path.strokeColor = color;
                path.strokeWidth = thickness;
                path.opacity = opacity;
                if (equationData.getIsFilled()) {
                    path.fillColor = group.fillColor = color;
                    path.fillColor.alpha = group.fillColor.alpha = equationData.getInEqualityOpacity();
                    path.strokeColor = group.strokeColor = color;
                    path.strokeColor.alpha = group.strokeColor.alpha = 0;
                }
                path.equation = equationData;
                path.equationID = equationData.getId();
                path.strokeJoin = 'round';
                if (pointsLength === 1) {
                    path.add(leftArray[0]);
                }
                group.addChild(path);
            }

            if (rightArray !== null) {
                for (i = 0; i < rightArray.length; i++) {
                    if (equationData.hasExtraThickness()) {
                        path = new this._paperScope.Path({
                            "segments": rightArray[i]
                        });
                        path.strokeColor = equationData.getDragHitColor();
                        path.equation = equationData;
                        path.hit = true;
                        path.strokeColor.alpha = equationData.getDragHitAlpha();
                        path.equationID = equationData.getId();
                        path.strokeWidth = equationData.getDragHitThickness();
                        group.addChild(path);
                    }

                    path = new this._paperScope.Path({
                        "segments": rightArray[i]
                    });
                    path.strokeColor = color;
                    path.opacity = opacity;
                    if (equationData.getIsFilled()) {
                        path.fillColor = color;
                        path.fillColor.alpha = equationData.getInEqualityOpacity();
                        path.strokeColor = color;
                        path.strokeColor.alpha = 0;
                    }
                    path.equation = equationData;
                    path.equationID = equationData.getId();
                    path.strokeWidth = thickness;
                    group.addChild(path);
                }
            }

            group.visible = isVisible;
            equationData.setPathGroup(group);
            if (equationData._parent) {
                this._setPathRollOverListeners(group);
            }

            equationLabelData = equationData.getLabelData();
            if (equationLabelData !== null && equationLabelData.labelObject !== null) {
                this._updateLabelPosition(equationData);
            }
            this.activateLayer();
            this.refreshView();

            if (this._gridGraphModelObject.get('_plots').indexOf(equationData) === -1) {
                this._gridGraphModelObject.get('_plots').push(equationData);
            }
        },

        /**
         *It is used to find opposite axis
         *
         *@private
         *@method _getOppositeAxis
         *@param {String} input can be either 'x' or 'y'
         *@return {String} return 'y'if input param is 'x' and vice-versa.
         **/
        "_getOppositeAxis": function(axis) {
            if (axis === 'y') {
                return 'x';
            } else if (axis === 'x') {
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
        "_getAxisIndex": function(axis) {
            if (axis === 'y') {
                return 1;
            } else if (axis === 'x') {
                return 0;
            }
        },

        "_extendPathForConnection": function(leftSegment, rightSegment) {
            var distance,
                point1 = leftSegment[0],
                point2 = rightSegment[0];

            if (!point1 || !point2) {
                return;
            }
            this.activateScope();
            distance = geomFunctions.distance(new this._paperScope.Point(point1[0], point1[1]), new this._paperScope.Point(point2[0], point2[1]));
            if (distance < 10) {
                leftSegment.unshift(point2);
            }

            point1 = leftSegment[leftSegment.length - 1];
            point2 = rightSegment[rightSegment.length - 1];

            distance = geomFunctions.distance(new this._paperScope.Point(point1[0], point1[1]), new this._paperScope.Point(point2[0], point2[1]));
            if (distance < 50) {
                leftSegment.push(point2);
            }
            this.refreshView();
        },

        //solution index 1 or 2
        //function variable x or y
        "_generatePoint": function(plotPoint, functionVariable, solutionIndex) {

            var arr = [];
            if (functionVariable !== 'y') {
                arr.push(plotPoint[solutionIndex], plotPoint[0]);
            } else {
                arr.push(plotPoint[0], plotPoint[solutionIndex]);
            }
            return arr;
        },

        //@param prevParam {array} Previous point on the curve.
        //@param currentParam {array} Current point on the curve.
        //@param nextParam {array} Next point on the curve.
        //@param paramVariable {character} Either x or y, specifying whether y is displayed in terms of x or x is displayed in terms of y.
        "_plottingPoints": function(group, prevParam, currentParam, nextParam) {
            var dot;

            if (prevParam === null || currentParam === null) {
                return;
            }
            this.activateScope();
            if (currentParam[1] < prevParam[1] && currentParam[1] < nextParam[1] || currentParam[1] > prevParam[1] && currentParam[1] > nextParam[1]) {

                dot = new this._paperScope.Path.Circle({
                    "center": [currentParam[0], currentParam[1]],
                    "radius": 2,
                    "fillColor": '#666',
                    "strokeColor": '#666'
                });
                group.addChild(dot);
                return;
            }
            if (currentParam[0] < prevParam[0] && currentParam[0] < nextParam[0] || currentParam[0] > prevParam[0] && currentParam[0] > nextParam[0]) {
                dot = new this._paperScope.Path.Circle({
                    "center": [currentParam[0], currentParam[1]],
                    "radius": 2,
                    "fillColor": '#666',
                    "strokeColor": '#666'
                });
                group.addChild(dot);
            }
        },

        "_getPointDiff": function(array) {
            var lastPoint = array[array.length - 1],
                secondLast = array[array.length - 2];
            return [lastPoint[0] - secondLast[0], lastPoint[1] - secondLast[1]];
        },

        "_printorder": function(strprint, arrcolor) {
            arrcolor = null;
            strprint = null;
        },

        /**
         * return object which is required for saving graph state
         * @method getAttribute
         * @return {Object} contain state of graph
         */
        "getAttribute": function() {
            var object, model, clone;
            //generate copy of original object.
            clone = function(obj) {
                var temp, key;
                if (obj === null || typeof obj !== 'object') {
                    return obj;
                }
                temp = obj.constructor(); // changed
                for (key in obj) {
                    temp[key] = clone(obj[key]);
                }
                return temp;
            };

            object = {
                "markerBounds": {},
                "graphDisplay": {},
                "currentLimits": {},
                "graphOrigin": {
                    "currentOrigin": {
                        "x": {},
                        "y": {}
                    },
                    "defaultOrigin": {
                        "x": {},
                        "y": {}
                    },
                    "isOriginPositionChanged": null
                },
                "graphParameters": {},
                "zoomingFactor": {}
            };

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

            return MathUtilities.Components.Utils.Models.Utils.convertToSerializable(object);
        },
        /**
         * return object to save state
         * @method saveState
         * @return {Object} contain state of graph
         */
        "saveState": function() {
            return this.getAttribute();
        },
        /**
         * Retrieve graph state.
         * @method retrieveState
         * @param {Object} contain state of graph
         */
        "retrieveState": function(stateObject) {
            this.setAttribute(stateObject);
        },

        /**
         * Restore graph state.
         * @method setAttribute
         * @param {Object} contain state of graph
         */
        "setAttribute": function(jsonObject) {
            var newObj = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(jsonObject),
                limits = newObj.currentLimits,
                graphParameters = newObj.graphParameters,
                xGridDistance,
                yGridDistance,
                extraXunits,
                extraYunits;

            this._gridGraphModelObject.setModelAttribute(newObj);
            this._retrieveGraph();
            // calculate limits on retrieve based on canvas size
            graphParameters.totalVerticalLines = this._canvasSize.width / graphParameters.currentDistanceBetweenTwoVerticalLines;
            graphParameters.totalHorizontalLines = this._canvasSize.height / graphParameters.currentDistanceBetweenTwoHorizontalLines;
            xGridDistance = newObj.zoomingFactor.xTotalMultiplier / newObj.graphParameters.xGridLine;
            yGridDistance = newObj.zoomingFactor.yTotalMultiplier / newObj.graphParameters.yGridLine;
            extraXunits = (graphParameters.totalVerticalLines * xGridDistance - (limits.xUpper - limits.xLower)) / 2;
            extraYunits = (graphParameters.totalHorizontalLines * yGridDistance - (limits.yUpper - limits.yLower)) / 2;
            limits.xLower -= extraXunits;
            limits.xUpper += extraXunits;
            limits.yLower -= extraYunits;
            limits.yUpper += extraYunits;
            this._setGraphLimits(limits.xLower, limits.xUpper, limits.yLower, limits.yUpper);
        },

        /**
         * retrieve graph state
         * @method _retrieveGraph
         * @private
         */
        "_retrieveGraph": function() {
            this._setBounds();
            this._cartesionSymbolGenerator();
            this._graphTypeSelector();

            this._setTextBoxValues();
        },

        "activateScope": function() {
            this._paperScope.activate();
        },

        "drawPolygon": function(equationData) {
            if (!equationData.getVisible().curve) {
                return;
            }

            this.activateScope();
            var pathGroup = equationData.getPathGroup(),
                modelObject,
                polygon,
                polygonhit,
                gridGraphPlots,
                polygonGroup,
                points,
                polygonStyle,
                coord,
                pointCounter,
                pointsLength,
                equationDataPoints = equationData.getPoints();
            if (equationData.getSpecie() === 'annotation') {
                this._projectLayers.annotationLayer.activate();
            } else {
                this._projectLayers.shapeLayer.activate();
                if (pathGroup) {
                    this._removePathRollOverListeners(pathGroup);
                }
            }
            this.activateScope();
            polygon = new this._paperScope.Path();
            polygonGroup = new this._paperScope.Group();

            if (pathGroup !== null) {
                /*
                For removing pathGroup we are not using paper.js remove function,
                because if we are sorting pathGroups in current layer &
                then removing a particular pathGroup using remove function
                then it removes inappropriate pathGroup from current layer...
                */
                this.removeDrawingObject(pathGroup);
            }

            if (equationData.hasExtraThickness()) {
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
            polygon.strokeJoin = 'round';
            //reverse mapping of equationdata
            polygon.equation = equationData;
            polygon.dashArray = equationData.getDashArray();
            polygon.visible = equationData.getCurveVisibility();
            if (equationData.getIsFilled()) {
                polygon.fillColor = polygonGroup.fillColor = equationData.getColor();
                polygon.fillColor.alpha = polygonGroup.fillColor.alpha = equationData.getInEqualityOpacity();
                polygon.strokeColor.alpha = polygonGroup.strokeColor.alpha = 0;
            }

            polygonStyle = polygon.style;
            if (equationData.getSpecie() !== 'annotation' && equationData.getRayPolygon()) {
                points = [];
                for (pointCounter = 1; pointCounter < pointsLength; pointCounter++) {
                    points.push(equationDataPoints[pointCounter - 1][0]);
                    points.push(equationDataPoints[pointCounter - 1][1]);
                    points.push(equationDataPoints[pointCounter][0]);
                    points.push(equationDataPoints[pointCounter][1]);
                }

                points = MathUtilities.Components.Graph.Models.plottingFunctions.fitPointsInsideDomain({
                    "domain": {
                        "minX": this.markerBounds.min.x,
                        "maxX": this.markerBounds.max.x,
                        "minY": this.markerBounds.min.y,
                        "maxY": this.markerBounds.max.y
                    }
                }, points);

            } else {
                points = equationDataPoints;
            }
            this.activateScope();
            for (pointCounter = 0; pointCounter < pointsLength; pointCounter++) {
                if (equationData.getSpecie() === 'annotation') {
                    if (!equationDataPoints[pointCounter]) {

                        polygonGroup.addChild(polygon);
                        polygonGroup.addChild(polygonhit);
                        polygon = new this._paperScope.Path();
                        polygon.equation = equationData;

                        polygon.style = polygonStyle;
                        polygonhit = new this._paperScope.Path();
                        polygonhit.strokeColor = equationData.getDragHitColor();
                        polygonhit.equation = equationData;
                        polygonhit.strokeColor.alpha = equationData.getDragHitAlpha();
                        polygonhit.equationID = equationData.getId();
                        polygonhit.strokeWidth = equationData.getDragHitThickness();
                        polygonhit.hit = true;
                    } else {
                        polygon.add(this._getCanvasPointCoordinates(equationDataPoints[pointCounter]));
                        if (polygonhit) {
                            polygonhit.add(this._getCanvasPointCoordinates(equationDataPoints[pointCounter]));
                        }
                    }
                } else {
                    if (equationData.getRayPolygon()) {
                        coord = [points[0][2 * pointCounter], points[0][2 * pointCounter + 1]];
                        polygon.add(this._getCanvasPointCoordinates(coord));
                        if (polygonhit) {
                            polygonhit.add(this._getCanvasPointCoordinates(coord));
                        }
                    } else {
                        polygon.add(this._getCanvasPointCoordinates(points[pointCounter]));
                        if (polygonhit) {
                            polygonhit.add(this._getCanvasPointCoordinates(points[pointCounter]));
                        }
                    }
                }
            }
            if (pointsLength === 1) {
                coord = [points[0][0], points[0][1]];
                polygon.add(this._getCanvasPointCoordinates(coord));
            }

            if (equationData.isClosedPolygon() === true) {
                if (polygonhit) {
                    polygonhit.closed = true;
                }

                polygon.closed = true;
            }
            if (equationData.isSmoothPolygon() === true) {
                polygon.smooth();
            }
            if (polygonhit) {
                polygonGroup.addChild(polygonhit);
            }
            polygonGroup.addChild(polygon);

            this._setPathRollOverListeners(polygonGroup);

            equationData.setPathGroup(polygonGroup);

            if (equationData.getLabelData().labelObject !== null) {
                this._updateLabelPosition(equationData);
            }
            equationData.trigger('plotComplete');

            this.refreshView();
        },

        /**
         * removePlottedGraph removes plotted graph
         * @method removePlottedGraph
         * @return void
         */
        "removePlottedGraph": function(equationData) {
            var pathGroup = equationData.getPathGroup();
            if (pathGroup) {
                this._removePathRollOverListeners(pathGroup);
                /*
                For removing pathGroup we are not using paper.js remove function,
                because if we are sorting pathGroups in current layer &
                then removing a particular pathGroup using remove function
                then it removes inappropriate pathGroup from current layer...
                */
                this.removeDrawingObject(pathGroup);
                equationData.setPathGroup(null);
            }
            this.refreshView();
        },

        /**
         * Change graph x-axis and y-axis upper and Lower limt if graph resize.
         * @method canvasResize
         * @return void
         */

        "canvasResize": function() {
            this._paperScope.activate();

            var canvas = document.getElementById(this._gridGraphModelObject.get('ID').canvasId),
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
                xExtraCount = 0,
                yExtraCount = 0,
                supressRedraw = {
                    "gridLayer": false,
                    "shapeLayer": true,
                    "pointLayer": true
                },
                screenSize, frameSize,
                xPosition, yPosition;

            if (width > 0 && height > 0 && (extraHeight !== 0 || extraWidth !== 0)) {
                if (extraHeight !== 0) {
                    this._canvasSize.height = height;

                    yExtraCount = extraHeight / (minDistanceBetweenHorizontalLines * yMarkerLines) * model._zoomingFactor.yTotalMultiplier;
                    currentLimit.yLower = currentLimit.yLower - yExtraCount / 2;
                    currentLimit.yUpper = currentLimit.yUpper + yExtraCount / 2;
                }

                if (extraWidth !== 0) {
                    this._canvasSize.width = width;

                    xExtraCount = extraWidth / (minDistanceBetweenVerticalLines * xMarkerLines) * model._zoomingFactor.xTotalMultiplier;
                    currentLimit.xLower = currentLimit.xLower - xExtraCount / 2;
                    currentLimit.xUpper = currentLimit.xUpper + xExtraCount / 2;
                }

                this._setBounds();

                this._setTextBoxValues();

                parameters = model._graphParameters;

                parameters.totalVerticalLines += extraWidth / minDistanceBetweenVerticalLines;
                parameters.totalHorizontalLines += extraHeight / minDistanceBetweenHorizontalLines;

                /* condition to decide initial origin Position*/
                if (currentLimit.xLower >= 0) {
                    xPosition = -currentLimit.xLower;
                } else {
                    xPosition = Math.abs(currentLimit.xLower);
                }

                if (currentLimit.yUpper <= 0) {
                    yPosition = -Math.abs(currentLimit.yUpper);
                } else {
                    yPosition = Math.abs(currentLimit.yUpper);
                }
                this.activateScope();
                model._graphOrigin.currentOrigin = new this._paperScope.Point(xPosition / model._zoomingFactor.xTotalMultiplier * xMarkerLines * minDistanceBetweenVerticalLines, yPosition / model._zoomingFactor.yTotalMultiplier * yMarkerLines * minDistanceBetweenHorizontalLines);

                model._graphOrigin.defaultOrigin = new this._paperScope.Point(this._canvasSize.width / 2, this._canvasSize.height / 2);

                this._originPositionOnGraph();

                this._cartesionSymbolGenerator();

                this._deltaAngle();

                if (typeof this.gridBG !== 'undefined' && this.gridBG !== null) {
                    this.gridBG.size = [width, height];
                    this.gridBG.position = model._graphOrigin.defaultOrigin;
                }

                if (typeof this.customGridbg !== 'undefined' && this.customGridbg !== null) {
                    this.customGridbg.size = [width, height];
                    this.customGridbg.position = model._graphOrigin.defaultOrigin;
                }
                this.drawGraph(supressRedraw);

                this._paperScope.view.viewSize = [width, height];
                if (this._scrollBarManager) {
                    screenSize = new this._paperScope.Rectangle(0, 0, this._canvasSize.width, this._canvasSize.height);
                    frameSize = {
                        "xmin": currentLimit.xLower,
                        "ymin": currentLimit.yLower,
                        "xmax": currentLimit.xUpper,
                        "ymax": currentLimit.yUpper
                    };
                    this._projectLayers.scrollLayer.activate();
                    this._scrollBarManager.resizeFrameSize(frameSize, screenSize);
                }
                clearTimeout($.data(this, 'timer'));
                $.data(this, 'timer', setTimeout(_.bind(function() {
                    if (modelObject.get('_plots').length !== 0 || modelObject.get('_images').length !== 0) {
                        this._shapeRedraw();
                    }
                    if (modelObject.get('_points').length !== 0) {
                        this._repositionPoints();
                    }
                }, this), 100));

                this.refreshView();
            }
        },

        "_originShiftFactor": function(refPoint, isZoomIn) {
            var nextFactors = this._nextMarkerFactors(!isZoomIn),
                modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                zoomingFactors = graphDisplay._zoomingFactor,
                graphParameters = graphDisplay._graphParameters,
                currentOrigin = graphDisplay._graphOrigin.currentOrigin,
                zoomLevels = this._zoomLevelLimits(zoomingFactors.xTotalMultiplier, zoomingFactors.yTotalMultiplier),
                nextZoomLevels = this._zoomLevelLimits(nextFactors.xMarker.xTotalMultiplier, nextFactors.yMarker.yTotalMultiplier),
                verticalLinesDistance,
                horizontalLineDistance,
                xGridLines,
                yGridLines,
                xMultiplier,
                yMultiplier,
                currentClickedPoint,
                distance,
                angle,
                nextOriginPoint = {},
                nextXZoomLevel,
                nextYZoomLevel;

            if (isZoomIn) {
                nextXZoomLevel = zoomingFactors.currentXZoomLevel + this._ZOOM_LEVEL_INCREMENT_STEPS;
                nextYZoomLevel = zoomingFactors.currentYZoomLevel + this._ZOOM_LEVEL_INCREMENT_STEPS;

                if (nextXZoomLevel > zoomLevels.xMaxZoomLevel) {
                    nextXZoomLevel = nextZoomLevels.xMinZoomLevel;
                    xMultiplier = nextFactors.xMarker.xTotalMultiplier;
                } else {
                    xMultiplier = zoomingFactors.xTotalMultiplier;
                }

                if (nextYZoomLevel > zoomLevels.yMaxZoomLevel) {
                    nextYZoomLevel = nextZoomLevels.yMinZoomLevel;
                    yMultiplier = nextFactors.yMarker.yTotalMultiplier;

                } else {
                    yMultiplier = zoomingFactors.yTotalMultiplier;
                }
            } else {
                nextXZoomLevel = zoomingFactors.currentXZoomLevel - this._ZOOM_LEVEL_INCREMENT_STEPS;
                nextYZoomLevel = zoomingFactors.currentYZoomLevel - this._ZOOM_LEVEL_INCREMENT_STEPS;

                if (nextXZoomLevel < zoomLevels.xMinZoomLevel) {
                    nextXZoomLevel = nextZoomLevels.xMaxZoomLevel;
                    xMultiplier = nextFactors.xMarker.xTotalMultiplier;
                } else {
                    xMultiplier = zoomingFactors.xTotalMultiplier;
                }

                if (nextYZoomLevel < zoomLevels.yMinZoomLevel) {
                    nextYZoomLevel = nextZoomLevels.yMaxZoomLevel;
                    yMultiplier = nextFactors.yMarker.yTotalMultiplier;

                } else {
                    yMultiplier = zoomingFactors.yTotalMultiplier;
                }
            }
            xGridLines = this._numberOfMarkerLines(xMultiplier);
            yGridLines = this._numberOfMarkerLines(yMultiplier);

            verticalLinesDistance = nextXZoomLevel * graphParameters.distanceBetweenTwoVerticalLines;

            horizontalLineDistance = nextYZoomLevel * graphParameters.distanceBetweenTwoHorizontalLines;

            currentClickedPoint = this._getCanvasPointCoordinates(refPoint);

            nextOriginPoint.x = currentClickedPoint[0] - refPoint[0] * xGridLines * verticalLinesDistance / xMultiplier;
            nextOriginPoint.y = currentClickedPoint[1] + refPoint[1] * yGridLines * horizontalLineDistance / yMultiplier;

            distance = Math.sqrt(Math.pow(nextOriginPoint.x - currentOrigin.x, 2) + Math.pow(nextOriginPoint.y - currentOrigin.y, 2));

            angle = this._angleBetweenTwoPoints(currentOrigin, nextOriginPoint);

            return {
                "distance": distance,
                "angle": angle
            };
        },

        /**
         * Return value of _isGraphDefaultZoomBehaviourAllowed object
         * @method getDefaultZoomBehaviour
         * @return {Boolean}
         */
        "getDefaultZoomBehaviour": function() {
            return this._gridGraphModelObject.get('_isGraphDefaultZoomBehaviourAllowed');
        },
        /**
         * Set value of _isGraphDefaultZoomBehaviourAllowed object
         * @method setDefaultZoomBehaviour
         * @param {Boolean} isAllow  only boolean value allowed
         * @return {Boolean}
         */
        "setDefaultZoomBehaviour": function(isAllow) {
            if (typeof isAllow === "boolean") {
                this._gridGraphModelObject.set('_isGraphDefaultZoomBehaviourAllowed', isAllow);
            }
            return;
        },
        /**
         * Return value of _isGraphDefaultPanBehaviourAllowed object
         * @method getDefaultPanBehaviour
         * @return {Boolean}
         */
        "getDefaultPanBehaviour": function() {
            return this._gridGraphModelObject.get('_isGraphDefaultPanBehaviourAllowed');
        },

        /**
         * Set value of _isGraphDefaultPanBehaviourAllowed object
         * @method setDefaultPanBehaviour
         * @param {Boolean} isAllow  only boolean value allowed
         * @return {Boolean}
         */
        "setDefaultPanBehaviour": function(isAllow) {
            if (typeof isAllow === "boolean") {
                this._gridGraphModelObject.set('_isGraphDefaultPanBehaviourAllowed', isAllow);
            }
            return;
        },
        /**
         * Get Closer Grid Points of given point.
         * @method getCloserGraphPoints
         * @param {Point}
         * @return {Array}
         */
        "getCloserGraphPoints": function(point, graphType) {
            var smallestXMultiplier, smallestYMultiplier,
                xMin, xMax, yMin, yMax, closerPoints = [],
                xSign = 1,
                ySign = 1,
                angleIncrement, currentAngle, minAngle, maxAngle,
                minRadius, maxRadius, radiusIncrement, radius,
                point1, point2, point3, point4,
                x = point[0],
                y = point[1],
                modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                xGridLines = graphDisplay._graphParameters.xGridLine,
                yGridLines = graphDisplay._graphParameters.yGridLine,
                xMultiplier = graphDisplay._zoomingFactor.xTotalMultiplier,
                yMultiplier = graphDisplay._zoomingFactor.yTotalMultiplier;

            if (!graphType) {
                if (graphDisplay._graphDisplay.isCartesionCurrentGraphType) {
                    graphType = 'cartesian-graph';
                } else {
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
            } else if (graphType === 'polar-graph') {

                angleIncrement = this._polarAngleIncrement();

                currentAngle = this.angleBetweenPoints(point, [0, 0], false);

                if (currentAngle < 0) {
                    currentAngle = 2 * Math.PI + currentAngle;
                }
                minAngle = currentAngle - currentAngle % angleIncrement;
                maxAngle = currentAngle + (angleIncrement - currentAngle % angleIncrement);

                radiusIncrement = xMultiplier / xGridLines;
                radius = Math.sqrt(Math.pow(point[0], 2) + Math.pow(point[1], 2));

                minRadius = radius - radius % radiusIncrement;
                maxRadius = radius + (radiusIncrement - radius % radiusIncrement);

                point1 = [minRadius * Math.cos(maxAngle), minRadius * Math.sin(maxAngle)];
                point2 = [minRadius * Math.cos(minAngle), minRadius * Math.sin(minAngle)];
                point3 = [maxRadius * Math.cos(maxAngle), maxRadius * Math.sin(maxAngle)];
                point4 = [maxRadius * Math.cos(minAngle), maxRadius * Math.sin(minAngle)];

                closerPoints = [point1, point2, point3, point4];
            }

            return closerPoints;
        },
        /**
         * Get Closest Point of given point.
         * @method getClosestGridPoint
         * @param {Point}
         * @return {Point}
         */
        "getClosestGridPoint": function(point, graphType) {
            var minDistance,
                counter, currentDistance,
                closestPoint, diagonalDistance,
                x = point[0],
                y = point[1],
                closerPoints = this.getCloserGraphPoints(point, graphType);

            diagonalDistance = geomFunctions.distance2(closerPoints[0][0], closerPoints[0][1], closerPoints[2][0], closerPoints[2][1]) * 0.4;

            for (counter = 0; counter < closerPoints.length; counter++) {
                currentDistance = Math.sqrt(Math.pow(x - closerPoints[counter][0], 2) + Math.pow(y - closerPoints[counter][1], 2));

                if (typeof minDistance !== 'number') {
                    minDistance = currentDistance;
                    closestPoint = closerPoints[counter];
                } else if (currentDistance < minDistance) {
                    minDistance = currentDistance;
                    closestPoint = closerPoints[counter];
                }
            }
            if (minDistance > diagonalDistance) {
                return point;
            }
            return closestPoint;
        },
        /**
         * Get Closest Point of given point in canvas-coOrdinate.
         * @method getClosestCanvasPoint
         * @param {Point} canvas-Point
         * @return {Point} closest point canvas co-ordinate
         */
        "getClosestCanvasPoint": function(canvasPoint, graphType) {
            var gridPoint = this._getGraphPointCoordinates(canvasPoint),
                closestGridPoint = this.getClosestGridPoint(gridPoint, graphType);
            return this._getCanvasPointCoordinates(closestGridPoint);
        },

        /**
         * return angle between two points.
         * @method angleBetweenPoints
         * @param {Array} first Point
         * @param {Array} second Point
         * @param {Boolean} true for angle to be in degree else radian
         */
        "angleBetweenPoints": function(firstPointArray, secondPointArray, isDeg) {
            var x1 = firstPointArray[0],
                y1 = firstPointArray[1],
                x2 = secondPointArray[0],
                y2 = secondPointArray[1],
                ang = Math.atan2(y1 - y2, x1 - x2);
            return isDeg ? ang * 180 / Math.PI : ang;
        },
        /**
         * Increment factor for polar angle lines.
         * as per desmos, number of angle lines are different if origin is at canvas and outside canvas
         * @method _polarAngleIncrement
         * @return angle increment factor
         */
        "_polarAngleIncrement": function() {

            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                currentOrigin = graphDisplay._graphOrigin.currentOrigin,
                canvasWidth = this._canvasSize.width,
                canvasHeight = this._canvasSize.height,
                angleCounter;

            if (currentOrigin.x < canvasWidth && currentOrigin.x > 0 && currentOrigin.y < canvasHeight && currentOrigin.y > 0) {
                angleCounter = 15 * Math.PI / 180; //15 is increment factor to place polar lines, when origin of graph is outside canvas
            } else {
                angleCounter = 5 * Math.PI / 180; //5 is increment factor to place polar lines, when origin of graph is inside canvas visible area
            }
            return angleCounter;
        },
        /**
         * set graph type to "no-grid","polar-grid' or "Cartesian-graph'
         * @method setGraphType
         * @param {String} current graph type as "no-grid","polar-grid' or "Cartesian-graph'
         */
        "setGraphType": function(graphType) {
            var modelObject = this._gridGraphModelObject,
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
         * return graph type as "no-grid","polar-grid' or "Cartesian-graph'
         * @method getGraphType
         * @return {String} current graph type as "no-grid","polar-grid' or "Cartesian-graph'
         */
        "getGraphType": function() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues')._graphDisplay;

            if (!(graphDisplay.isLabelShown && graphDisplay.isGridLineShown && graphDisplay.isAxisLinesShown)) {
                return 'no-grid';
            }
            if (graphDisplay.isCartesionCurrentGraphType) {
                return 'cartesian-graph';
            }
            return 'polar-graph';
        },
        /**
         *return minimum graph Marker Values.
         *minimum Value between two adjacent grid lines.
         *
         * @method getMinimumMarkerValues
         * @return {Object} minimum value of x and y axis
         */
        "getMinimumMarkerValues": function() {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                zoommingFactor = graphDisplay._zoomingFactor,
                xGridLine = graphDisplay._graphParameters.xGridLine,
                yGridLine = graphDisplay._graphParameters.yGridLine,
                xMinMarker = zoommingFactor.xTotalMultiplier / xGridLine,
                yMinMarker = zoommingFactor.yTotalMultiplier / yGridLine;

            return {
                "xMinMarker": xMinMarker,
                "yMinMarker": yMinMarker
            };
        },

        "criticalPointsShowOnHover": function(pointsGroup, equationData) {
            if (pointsGroup === null) {
                return;
            }
            var toolTips,
                pointCounter,
                noOfPoints,
                noOfToolTips,
                toolTipCoOrdinate,
                point,
                contentX,
                contentY,
                $toolTip;

            toolTips = this.$('.coordinate-tooltip[data-equation-cid="' + equationData.getCid() + '"]');
            noOfToolTips = toolTips.length;
            if (noOfToolTips !== 0) {
                noOfPoints = pointsGroup.children.length;
                for (pointCounter = 0; pointCounter < noOfPoints; pointCounter++) {
                    point = pointsGroup.children[pointCounter];
                    if (point.hit !== true) {
                        toolTipCoOrdinate = [this._getNumberForToolTip(point.data.point[0]), this._getNumberForToolTip(point.data.point[1])];
                        $toolTip = this.$(".coordinate-tooltip[data-point='" + toolTipCoOrdinate[0] + '-' + toolTipCoOrdinate[1] + "']");
                        $toolTip.show();
                        if ($toolTip.length !== 0 && $toolTip.is(':visible')) {
                            if (point.data.isHollow !== true) {
                                point.fillColor = this._criticalPointsProperties.selected.color;
                                point.opacity = this._criticalPointsProperties.selected.opacity;
                            } else {
                                point.strokeWidth = this._discontinuosPointsProperties.selected.strokeWidth;
                                point.fillColor = '#fff';
                                point.strokeColor = this._discontinuosPointsProperties.selected.color;
                                point.opacity = this._discontinuosPointsProperties.selected.opacity;
                            }
                            point.data.selected = true;
                            if (point.visible === false) {
                                equationData.hideGraph();
                            }
                        }
                    }
                }
            }
            this.$('.hover-tooltip').remove();
            this.$el.removeClass('tool-tip-hover-cursor');

            pointsGroup.onMouseEnter = _.bind(function(event) {
                this._criticalPointsMouseEnter(event, equationData);
            }, this);
            pointsGroup.onMouseLeave = _.bind(function(event) {
                this._criticalPointsMouseLeave(event);
            }, this);

            pointsGroup.onMouseUp = _.bind(function(event) {
                point = event.target;

                if (point.hit) {
                    point = this._getPointPath(point.parent.children, point.data.point);
                }
                if (this.isSnap === false) {
                    return;
                }
                if (point.data.isHollow !== true) {
                    point.fillColor = this._criticalPointsProperties.selected.color;
                    point.opacity = this._criticalPointsProperties.selected.opacity;
                } else {
                    point.strokeWidth = this._discontinuosPointsProperties.selected.strokeWidth;
                    point.fillColor = '#fff';
                    point.strokeColor = this._discontinuosPointsProperties.selected.color;
                    point.opacity = this._discontinuosPointsProperties.selected.opacity;
                }
                point.data.selected = true;
                this.$('.drag-tooltip').remove();
                this.$('.hover-tooltip').remove();

                toolTipCoOrdinate = [this._getNumberForToolTip(point.data.point[0], this._gridGraphModelObject.get('toolTipPrecision')), this._getNumberForToolTip(point.data.point[1], this._gridGraphModelObject.get('toolTipPrecision'))];
                contentX = this.getPowerOfNumber(point.data.point[0]);
                contentY = this.getPowerOfNumber(point.data.point[1]);

                this.showToolTipForPoint(point.bounds.center, contentX, contentY, false, point.equation.getCid(), point.data.displayPoint);
                this.isSnap = false;
            }, this);
        },
        "_criticalPointsMouseEnter": function(event, equationData) {

            var point, eventPoint;
            point = event.target;
            eventPoint = point.data.point;
            if (point.hit === true) {
                point = this._getPointPath(point.parent.children, point.data.point);
            }
            if (point.data.selected !== true) {
                point.opacity = this._criticalPointsProperties.selected.opacity;
                if (point.data.isHollow === true) {
                    point.strokeWidth = this._discontinuosPointsProperties.selected.strokeWidth;
                    point.strokeColor = this._discontinuosPointsProperties.normal.color;
                    point.fillColor = '#fff';
                }
                this.showToolTipOnMouseEnter(eventPoint, event.target.id, equationData.getCid(), point.data.displayPoint);
            }

            this.$el.addClass('tool-tip-hover-cursor');

        },

        "_criticalPointsMouseLeave": function(event) {
            var point;
            point = event.target;
            if (point.hit === true) {
                point = this._getPointPath(point.parent.children, point.data.point);
            }
            if (point.data.selected !== true) {
                point.opacity = this._criticalPointsProperties.normal.opacity;
                point.fillColor = this._criticalPointsProperties.normal.color;
                if (point.data.isHollow) {
                    point.strokeWidth = this._discontinuosPointsProperties.normal.strokeWidth;
                    point.strokeColor = this._discontinuosPointsProperties.normal.color;
                }
            }

            this.$('.hover-tooltip').remove();
            this.$el.removeClass('tool-tip-hover-cursor');
        },

        "_getPointPath": function(points, point) {
            var pointCounter,
                noOfpoints = points.length;
            for (pointCounter = 0; pointCounter < noOfpoints; pointCounter++) {
                if (points[pointCounter].hit !== true && points[pointCounter].data.point[0] === point[0] && points[pointCounter].data.point[1] === point[1]) {
                    return points[pointCounter];
                }
            }
        },

        "showToolTipOnMouseEnter": function(point, eventId, equationCid, displayPoint) {
            if (!displayPoint) {
                displayPoint = point;
            }
            point = this._getCanvasPointCoordinates(point);
            var $canvas = this.$('#' + this._gridGraphModelObject.get('ID').canvasId),
                canvasPosition = $canvas.position(),
                $tooltip = $('<div></div>').css({
                    'position': 'absolute',
                    'top': canvasPosition.top + point[1] + 'px',
                    'left': canvasPosition.left + point[0] + 'px'
                }).attr('class', 'hover-tooltip'),
                tooltipText, tempx, tempy;
            $tooltip.attr('data-equation-cid', equationCid);
            if (this.$('.drag-tooltip').length !== 0) {
                this.$('.drag-tooltip').hide();
            }
            tempx = this.getPowerOfNumber(Number(displayPoint[0]));
            tempy = this.getPowerOfNumber(Number(displayPoint[1]));
            if (this.$(".coordinate-tooltip[data-point='" + this._getNumberForToolTip(tempx[0]) + '-' + this._getNumberForToolTip(tempy[0]) + "']").length !== 0) {
                return;
            }
            tempx[0] = this._getNumberForToolTip(tempx[0], this._gridGraphModelObject.get('toolTipPrecision'));
            tempy[0] = this._getNumberForToolTip(tempy[0], this._gridGraphModelObject.get('toolTipPrecision'));

            tooltipText = tempx[0];

            if (tempx[1] !== 0) {
                tooltipText += ' x 10 <sup>' + tempx[1] + '</sup>';
            }
            tooltipText += ',&nbsp;' + tempy[0];
            if (tempy[1] !== 0) {
                tooltipText += ' x 10 <sup>' + tempy[1] + '</sup>';
            }

            $tooltip.html(tooltipText)
                .attr('event-id', eventId);

            this.$el.append($tooltip);

            $tooltip.css('top', $tooltip.position().top - 2 * $tooltip.height());
        },

        /**
         * start double click zoom behavior of graph
         * @method startDoubleClickZoom
         */
        "startDoubleClickZoom": function() {
            this._gridGraphModelObject.get('_graphDisplayValues')._zoomingFactor.doubleClickZoomAllow = true;
        },
        /**
         * stop double click zoom behavior of graph
         * @method stopDoubleClickZoom
         */
        "stopDoubleClickZoom": function() {
            this._gridGraphModelObject.get('_graphDisplayValues')._zoomingFactor.doubleClickZoomAllow = false;
        },

        /**
         * set graph Limits and adjust marker value
         * @method _setGraphLimits
         * @param xLower {Number} lower limit of x-axis
         * @param xUpper {Number} Upper limit of x-axis
         * @param yLower {Number} lower limit of y-axis
         * @param yUpper {Number} Upper limit of y-axis
         */
        "_setGraphLimits": function(xLower, xUpper, yLower, yUpper, requestGenesis) {
            var model = this._gridGraphModelObject,
                displayProperties = model.get('_graphDisplayValues'),
                currentLimits = displayProperties._graphsAxisLimits.currentLimits,
                origins = displayProperties._graphOrigin,
                graphCenterPoint, currentGraphOrigin,
                zoommingFactors = displayProperties._zoomingFactor;

            xLower = parseFloat(xLower);
            yLower = parseFloat(yLower);
            xUpper = parseFloat(xUpper);
            yUpper = parseFloat(yUpper);

            //if limits not in proper format return
            if (isNaN(xLower) || isNaN(xUpper) || isNaN(yLower) || isNaN(yUpper) || xLower >= xUpper || yLower >= yUpper) {
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

            zoommingFactors.refPoint = this._getGraphPointCoordinates([graphCenterPoint.x, graphCenterPoint.y]);
            origins.isOriginPositionChanged = !(graphCenterPoint.x === currentGraphOrigin.x && graphCenterPoint.y === currentGraphOrigin.y);

            this._setBounds(requestGenesis);
        },
        /**
         * calculate starting zoom-level value,considering min-zoom distance.
         * @method _setDistanceBetweenLines
         * @private
         */
        "_setDistanceBetweenLines": function() {

            var model = this._gridGraphModelObject,
                displayProperties = model.get('_graphDisplayValues'),
                zoomingFactor = displayProperties._zoomingFactor,
                distance = displayProperties._graphParameters,
                minMaxFactor, currentZoomLevel,
                distance0, distance1, xIteration = 1,
                yIteration = 1,
                xPreviousIteration = [],
                yPreviousIteration = [],
                zoomLevel, modify,
                adjustDistance,
                incrementStep = this._ZOOM_LEVEL_INCREMENT_STEPS;

            adjustDistance = function adjustDistance(minDistance, maxDistance, minZoomLevel, maxZoomLevel, lineDistance) {
                currentZoomLevel = parseFloat(minZoomLevel.toFixed(4));
                while (currentZoomLevel <= maxZoomLevel) {
                    distance0 = minZoomLevel / currentZoomLevel * lineDistance;
                    distance1 = maxZoomLevel / currentZoomLevel * lineDistance;
                    if (distance0 >= minDistance && distance1 <= maxDistance) {
                        zoomLevel = currentZoomLevel;
                        modify = true;
                    }
                    currentZoomLevel += incrementStep;
                    currentZoomLevel = parseFloat(currentZoomLevel.toFixed(4));
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
                } else {
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
                } else {
                    adjustDistance(minMaxFactor.yMinDistance, minMaxFactor.yMaxDistance, minMaxFactor.yMinZoomLevel, minMaxFactor.yMaxZoomLevel, distance.distanceBetweenTwoHorizontalLines);

                    if (!modify) {
                        this._yAxisZoomFactorModifier(false);
                        yIteration--;
                    }
                }

                //value is in infinite loop
                if (yPreviousIteration.indexOf(yIteration) !== -1) {
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
         * @param supressShapeRedraw
         */
        "drawGraph": function(supressRedraw) {
            supressRedraw = supressRedraw || {};

            var modelObject = this._gridGraphModelObject;

            if (supressRedraw.gridLayer !== true) {
                this._graphTypeSelector();
            }

            if (supressRedraw.shapeLayer !== true) {
                if (modelObject.get('_plots').length !== 0) {
                    this._shapeRedraw();
                }
            }
            if (supressRedraw.pointLayer !== true) {
                if (modelObject.get('_points').length !== 0) {
                    this._repositionPoints();
                }
            }
        },

        /**
         * As per desmos zoom min-max level and distance is different for marker values multiple of 5,
         * this function returns zoom-levels and distance for different marker text
         * @method _zoomLevelLimits
         * @param xMultiplierValue {Number} x-axis Marker values, if not given will take graph current multiplier
         * @param yMultiplierValue {Number} y-axis Marker values, if not given will take graph current multiplier
         * @return {Objcet} contains min-max zoomLevels and distances
         * @private
         */
        "_zoomLevelLimits": function(xMultiplierValue, yMultiplierValue) {
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
                adjacentMinDistance = this._ADJACENT_LINES_MIN_DISTANCE,
                zoomDistance = this._ZOOM_DISTANCE,
                levelFunct;

            xMultiplier = xMultiplierValue || xMultiplier;
            yMultiplier = yMultiplierValue || yMultiplier;

            xGridLines = this._numberOfMarkerLines(xMultiplier);
            yGridLines = this._numberOfMarkerLines(yMultiplier);

            levelFunct = function levelFunct(lines) {
                var minDistance, maxDistance, minZoomLevel, maxZoomLevel, extraMaxDistance, extraMinDistance;
                if (lines === MarkerLinesObject.FIVE_MULTIPLIER) {
                    minDistance = adjacentMinDistance;
                    maxDistance = minDistance + zoomDistance * stepsforFive;
                    minZoomLevel = minimumZoomLevel;
                    maxZoomLevel = minZoomLevel + incrementValue * stepsforFive;
                    extraMaxDistance = maxDistance + zoomDistance;
                    extraMinDistance = minDistance - zoomDistance;
                } else {
                    minDistance = adjacentMinDistance + zoomDistance;
                    maxDistance = minDistance + zoomDistance * defaultSteps;
                    minZoomLevel = minimumZoomLevel + incrementValue;
                    maxZoomLevel = minZoomLevel + incrementValue * defaultSteps;
                    extraMaxDistance = maxDistance + zoomDistance;
                    extraMinDistance = minDistance - zoomDistance;
                }
                return {
                    "minDistance": minDistance,
                    "maxDistance": maxDistance,
                    "minZoomLevel": minZoomLevel,
                    "maxZoomLevel": maxZoomLevel,
                    "extraMaxDistance": extraMaxDistance,
                    "extraMinDistance": extraMinDistance
                };
            };

            xFactors = levelFunct(xGridLines);
            yFactors = levelFunct(yGridLines);

            return {
                "xMinDistance": xFactors.minDistance,
                "xMaxDistance": xFactors.maxDistance,
                "xMinZoomLevel": xFactors.minZoomLevel,
                "xMaxZoomLevel": xFactors.maxZoomLevel,
                "xExtraMaxDistance": xFactors.extraMaxDistance,
                "xExtraMinDistance": xFactors.extraMinDistance,
                "yMinDistance": yFactors.minDistance,
                "yMaxDistance": yFactors.maxDistance,
                "yMinZoomLevel": yFactors.minZoomLevel,
                "yMaxZoomLevel": yFactors.maxZoomLevel,
                "yExtraMaxDistance": yFactors.extraMaxDistance,
                "yExtraMinDistance": yFactors.extraMinDistance
            };
        },

        /**
         * set model bounds object value as limits of graph.
         * @method _setBounds
         * @private
         */
        "_setBounds": function(requestGenesis) {
            var modelbounds = this._gridGraphModelObject.get('markerBounds'),
                bounds = this.markerBounds,
                visibleRect,
                limits = this._gridGraphModelObject.get('_graphDisplayValues')._graphsAxisLimits.currentLimits;

            modelbounds.max.x = bounds.max.x = limits.xUpper;
            modelbounds.min.x = bounds.min.x = limits.xLower;
            modelbounds.max.y = bounds.max.y = limits.yUpper;
            modelbounds.min.y = bounds.min.y = limits.yLower;

            visibleRect = {
                "xmin": bounds.min.x,
                "ymin": bounds.min.y,
                "xmax": bounds.max.x,
                "ymax": bounds.max.y
            };
            if (this._scrollBarManager && (!requestGenesis || requestGenesis !== 'scrollbar')) {
                this._scrollBarManager.updateVisibleFrame(visibleRect);
            }

            this._deltaAngle();
        },

        /**
         * return graph axis limits
         * @method getLimits
         * @return {Object} it contains value of xLower, xUpper, yLower, yUpper
         */
        "getLimits": function() {
            var modelbounds = this._gridGraphModelObject.get('markerBounds');

            return {
                "xLower": modelbounds.min.x,
                "xUpper": modelbounds.max.x,
                "yLower": modelbounds.min.y,
                "yUpper": modelbounds.max.y
            };
        },

        /**
         * set graph limits
         * @method setLimits
         * @param xLower {Number} lower limit of x-axis
         * @param xUpper {Number} Upper limit of x-axis
         * @param yLower {Number} lower limit of y-axis
         * @param yUpper {Number} Upper limit of y-axis
         */
        "setLimits": function(xLower, xUpper, yLower, yUpper, requestGenesis) {
            var previousLimits = this._gridGraphModelObject.get('_graphDisplayValues')._graphsAxisLimits.currentLimits;
            xLower = isNaN(parseFloat(xLower)) ? previousLimits.xLower : xLower;
            xUpper = isNaN(parseFloat(xUpper)) ? previousLimits.xUpper : xUpper;
            yLower = isNaN(parseFloat(yLower)) ? previousLimits.yLower : yLower;
            yUpper = isNaN(parseFloat(yUpper)) ? previousLimits.yUpper : yUpper;

            this._setGraphLimits(xLower, xUpper, yLower, yUpper, requestGenesis);
        },
        /**
         * Calculate absolute distance between two points
         * @method _distanceBetweenPoints
         * @param point1 {object} point object of first point
         * @param point2 {object} point object of second point
         */
        "_distanceBetweenPoints": function(point1, point2) {
            return Math.sqrt((point2.y - point1.y) * (point2.y - point1.y) + (point2.x - point1.x) * (point2.x - point1.x));
        },
        /**
         * Convert to Canvas-coordinate
         * @method convertToCanvasCoordinate
         * @param {Array} Point co-ordinate.
         * @return {Array} Point's canvas coordinate.
         */
        "convertToCanvasCoordinate": function(graphPoint) {
            return this._getCanvasPointCoordinates(graphPoint);
        },
        /**
         * Convert to Graph-coordinate
         * @method convertToGraphCoordinate
         * @param {Array} Point co-ordinate.
         * @return {Array} Point's Graph coordinate.
         */
        "convertToGraphCoordinate": function(canvasPoint) {
            return this._getGraphPointCoordinates(canvasPoint);
        },

        "zoomGraph": function(delta, steps) {
            var zoomCounter = 0;
            for (; zoomCounter < steps; zoomCounter++) {
                this._zoomGraph(delta);
            }
        },

        "setChildrenPosition": function(entity, position) {
            if (!entity) {
                return;
            }
            var i = 0,
                length = entity.children.length;
            for (; i < length; i++) {
                entity.children[i].position.x = position[0];
                entity.children[i].position.y = position[1];
            }
        },
        /**
         *@method changeOriginPosition
         *@param {Array} point where new origin should be present
         */
        "changeOriginPosition": function(point) {
            var modelObject = this._gridGraphModelObject,
                graphDisplay = modelObject.get('_graphDisplayValues'),
                currentOrigin = graphDisplay._graphOrigin.currentOrigin;

            this.activateScope();
            if (currentOrigin.x !== point[0] || currentOrigin.y !== point[1]) {
                graphDisplay._graphOrigin.currentOrigin = new this._paperScope.Point(point);


                this._graphLimitChangesDuringDragging();
                this._graphTypeSelector();

                this._deltaAngle();

                if (modelObject.get('_plots').length !== 0) {
                    this._shapeRedraw();
                }
                if (modelObject.get('_points').length !== 0) {
                    this._repositionPoints();
                }
                this.refreshView();
            }
        },
        "setBackgroundColor": function(backgroundColor, alpha) {
            if (typeof backgroundColor === 'undefined') {
                return;
            }
            if (backgroundColor === null) {
                this._gridGraphModelObject.set('backgroundColor', '#fff');
                this._gridGraphModelObject.set('backgroundAlpha', 0);
            } else {
                this._gridGraphModelObject.set('backgroundColor', backgroundColor);
                if (typeof alpha !== 'undefined' || alpha !== null) {
                    this._gridGraphModelObject.set('backgroundAlpha', alpha);
                } else {
                    this._gridGraphModelObject.set('backgroundAlpha', 1);
                }
            }
            if (this.gridBG) {
                this.gridBG.fillColor = this._gridGraphModelObject.get('backgroundColor');
                this.gridBG.fillColor.alpha = this._gridGraphModelObject.get('backgroundAlpha');
            }
            if (this.customGridbg) {
                this.customGridbg.fillColor = this._gridGraphModelObject.get('backgroundColor');
                this.customGridbg.fillColor.alpha = this._gridGraphModelObject.get('backgroundAlpha');
            }
        },
        "getBackgroundColor": function() {
            return this._gridGraphModelObject.get('backgroundColor');
        },

        "setGridLineVisibility": function(isVisible, bDraw) {
            if (typeof isVisible !== 'boolean') {
                return;
            }
            this._gridGraphModelObject.get('_graphDisplayValues')._graphDisplay.isGridLineShown = isVisible;
        },
        "getGridLineVisibility": function() {
            return this._gridGraphModelObject.get('_graphDisplayValues')._graphDisplay.isGridLineShown;
        },
        "setAxisMarkerVisibility": function(isVisible, bDraw) {
            if (typeof isVisible !== 'boolean') {
                return;
            }
            this._gridGraphModelObject.get('_graphDisplayValues')._graphDisplay.isAxisLinesShown = isVisible;
        },
        "getAxisMarkerVisibility": function() {
            return this._gridGraphModelObject.get('_graphDisplayValues')._graphDisplay.isAxisLinesShown;
        },
        "setLabelVisibility": function(isVisible, bDraw) {
            if (typeof isVisible !== 'boolean') {
                return;
            }
            this._gridGraphModelObject.get('_graphDisplayValues')._graphDisplay.isLabelShown = isVisible;
        },
        "getLabelVisibility": function() {
            return this._gridGraphModelObject.get('_graphDisplayValues')._graphDisplay.isLabelShown;
        },
        "activateLayer": function() {
            if (this.isCustomMode === true) {
                this._projectLayers.customGridLayer.activate();
            } else {
                this._projectLayers.gridLayer.activate();
            }
        },
        "createCustomBackground": function() {
            if (this.isCustomModeOn === true && this.customGridbg === null) {
                this.activateScope();
                var point = new this._paperScope.Point(0, 0),
                    size = new this._paperScope.Size(this._canvasSize.width, this._canvasSize.height),
                    shape = new this._paperScope.Shape.Rectangle(point, size);

                shape.fillColor = this._gridGraphModelObject.get('backgroundColor');
                shape.fillColor.alpha = this._gridGraphModelObject.get('backgroundAlpha');
                this.customGridbg = shape;
            }
        },
        "getPaperScope": function() {
            return this._paperScope;
        },

        "setReferencePoint": function(point) {
            if (typeof point === 'undefined' || point === null) {
                return;
            }
            var pointX = typeof point.x !== 'undefined' ? point.x : point[0],
                pointY = typeof point.y !== 'undefined' ? point.y : point[1],
                defaultOrigin = this._gridGraphModelObject.get('_graphDisplayValues')._graphOrigin.defaultOrigin;

            defaultOrigin.x = pointX;
            defaultOrigin.y = pointY;
        },

        /**
         * Change Grid lines style.
         * Color and Size of individual lines can be change, also both lines style can change
         * @method setGridStyle
         * @param {Object} styleObj
         */
        "setGridStyle": function(styleObj) {
            var curGridStyle = this._gridGraphModelObject.get('gridLineStyle'),
                setObjectValue = function(destObj, sourceObj) {
                    var elem = null;
                    for (elem in sourceObj) {
                        if (destObj.hasOwnProperty(elem)) {
                            destObj[elem] = sourceObj[elem];
                        }
                    }
                };

            if (styleObj) {
                if (styleObj.color) {
                    if (styleObj.color.xLine) {
                        setObjectValue(curGridStyle.color.xLine, styleObj.color.xLine);
                    }
                    if (styleObj.color.yLine) {
                        setObjectValue(curGridStyle.color.yLine, styleObj.color.yLine);
                    }

                    if (!styleObj.color.xLine && !styleObj.color.yLine) {
                        setObjectValue(curGridStyle.color.xLine, styleObj.color);
                        setObjectValue(curGridStyle.color.yLine, styleObj.color);
                    }
                }

                if (styleObj.size) {
                    if (styleObj.size.xLine) {
                        setObjectValue(curGridStyle.size.xLine, styleObj.size.xLine);
                    }
                    if (styleObj.size.yLine) {
                        setObjectValue(curGridStyle.size.yLine, styleObj.size.yLine);
                    }
                    if (!styleObj.size.xLine && !styleObj.size.yLine) {
                        setObjectValue(curGridStyle.size.xLine, styleObj.size);
                        setObjectValue(curGridStyle.size.yLine, styleObj.size);
                    }
                }
                this._cartesionSymbolGenerator();
            }

        },
        /**
         * Change Marker Text style.
         * @method setMarkerTextStyle
         * @param {Object} styleObj
         */
        "setMarkerTextStyle": function(styleObj) {
            var curMarkerStyle = this.MARKER_FONT;

            if (styleObj.fontSize) {
                curMarkerStyle.SIZE = styleObj.fontSize;
            }
            if (styleObj.fontColor) {
                curMarkerStyle.COLOR.ON_GRAPH_AREA = styleObj.fontColor;
                curMarkerStyle.COLOR.AT_END_OF_GRAPH_AREA = styleObj.fontColor;
            }
            if (styleObj.fontFamily) {
                curMarkerStyle.FAMILY = styleObj.fontFamily;
            }
            if (styleObj.fontWeight) {
                curMarkerStyle.WEIGHT = styleObj.fontWeight;
            }
        },

        /**
         * Draw Grid Layer.
         * @method drawGridLayer
         */
        "drawGridLayer": function() {
            this._graphTypeSelector();
        },
        /**
         * Draw Focus Rect for Accessibility
         * @method drawFocusRect
         */
        "drawFocusRect": function() {
            var paperScope = this._paperScope,
                style = {
                    strokeColor: '#000',
                    dashArray: [2, 2],
                    strokeWidth: 2
                },
                SIDES = 4,
                RADIUS = 20,
                focusRect = new paperScope.Path.RegularPolygon(new paperScope.Point(10, 10), SIDES, RADIUS);
            focusRect.style = style;
            focusRect.opacity = 0;
            return focusRect;
        },

        /**
         * It return array of raster
         * @method getAllImageRaster
         */
        "getAllImageRaster": function() {
            return this._projectLayers.imageLayer.children;
        }
    }, { // STATIC

        "createRelocateDataObject": function() {

            var saveDataOnRelocateObject = {
                "clone": function() {
                    var obj = {},
                        looper;
                    for (looper in this) {
                        obj[looper] = this[looper];
                    }
                    return obj;
                }
            };

            saveDataOnRelocateObject.equation = null;
            saveDataOnRelocateObject.delX = null;
            saveDataOnRelocateObject.delY = null;
            saveDataOnRelocateObject.position = null;
            saveDataOnRelocateObject.actionName = null;
            saveDataOnRelocateObject.selectionEntity = null;
            saveDataOnRelocateObject.eventName = null;

            return saveDataOnRelocateObject;
        },

        "createPostDragDataObject": function() {

            var postDragDataObject = {
                "clone": function() {
                    var obj = {},
                        looper;
                    for (looper in this) {
                        obj[looper] = this[looper];
                    }
                    return obj;
                }
            };

            postDragDataObject.equation = null;
            postDragDataObject.deltaX = null;
            postDragDataObject.deltaY = null;
            postDragDataObject.position = null;
            postDragDataObject.forceDrawing = null;
            postDragDataObject.eventName = null;

            return postDragDataObject;
        },

        "simulateMouseEvent": function(event) {
            if (!event.point) {
                event.point = {};
                switch (event.type) {
                    case 'touchstart':
                    case 'touchmove':
                        event.point.x = event.touches[0].clientX;
                        event.point.y = event.touches[0].clientY;
                        break;
                    case 'touchend':
                        event.point.x = event.changedTouches[0].clientX;
                        event.point.y = event.changedTouches[0].clientY;
                        break;
                    case 'pointerdown':
                    case 'pointermove':
                        event.point.x = event.originalEvent.clientX;
                        event.point.y = event.originalEvent.clientY;
                        break;
                }
                return event;
            }
        }



    });

}(window.MathUtilities));
