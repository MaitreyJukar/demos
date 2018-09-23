/* globals $, _, window */

(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    MathUtilities.Components.ImageAsset = MathUtilities.Components.ImageAsset || {};
    MathUtilities.Components.ImageAsset.templates = MathUtilities.Components.ImageAsset.templates || {};

    //sketchpad view start **********************************************
    WhiteboardTool.Views.Sketchpad = MathUtilities.Components.ToolHolder.Views.ToolHolder.extend({
        "model": null,

        /**
         * Object which represents save state data
         * @property _appState
         * @type {Object}
         * @private
         */
        "_appState": null,

        "_selectionPath": null,

        /**
         * Boolean to suppress extra processing on mouse moves.
         * @property _bHasTouchOccurred
         * @type {Boolean}
         * @private
         */
        "_bHasTouchOccurred": false,

        /**
         * Boolean to make Controller know that current shape being drawn by user action has finished its drawing.
         * @property _bShapePlottingFinished
         * @type {Boolean}
         * @private
         */
        "_bShapePlottingFinished": false,

        VERTICAL_PADDING_UNDER_SHADOW: 5,

        /**
         * @property toolbarState
         * @type Object
         */
        "toolbarState": {
            "topToolbar": {
                "isVisible": true,
                "buttonProperty": {
                    "help": {
                        "isVisible": true,
                        "isDisabled": false,
                        "isPressed": false
                    }
                },
                "title": {
                    "titleText": ""
                },
                "toolIcon": {
                    "toolIconCSS": "whiteboard-tool-image-sprite whiteboard-tool-icon"
                },
                "toolId": {
                    "toolIdText": "7"
                }
            },
            "bottomToolbar": {
                "isVisible": true,
                "buttonProperty": {
                    "save": {
                        "isVisible": true,
                        "isDisabled": false,
                        "isPressed": false
                    },
                    "open": {
                        "isVisible": true,
                        "isDisabled": false,
                        "isPressed": false
                    },
                    "screenShot": {
                        "isVisible": true,
                        "isDisabled": false,
                        "isPressed": false
                    },
                    "print": {
                        "isVisible": true,
                        "isDisabled": false,
                        "isPressed": false
                    },
                    "csv": {
                        "isVisible": true,
                        "isDisabled": false,
                        "isPressed": false
                    }
                },
                "toolId": {
                    "toolIdText": "7"
                },
                "screenCaptureDiv": {
                    "screenCaptureHolder": "#whiteboard #whiteboard-canvas"
                }
            }
        },

        "_zIndexofShapes": null,

        "_selectedBackground": null,

        /**
         * Collection of shapes, that are being selected.
         * @property _arrSelectedShapes
         * @type {Object}
         * @private
         */
        "_arrSelectedShapes": null,

        /**
         * Collection of shapes, holds all the shapes that we have in our drawing port.
         * @property _arrShapes
         * @type {Object}
         * @public
         */
        "_arrShapes": null,

        /**
         * Current object that is been added and created in touch/mouse down,move and up events.
         * @property _addingObj
         * @type {Object}
         * @private
         */
        "_addingObj": null,

        /**
         * Shape toolbar that stores menu items for shapes.
         * @property _shapeToolbar
         * @type {Object}
         * @private
         */
        "_shapeToolbar": null,
        "_propertyToolbar": null,
        "_commonPropertiesToolbar": null,
        "_currentFillColor": null,
        "_currentStrokeColor": null,
        "_currentStrokeWidth": null,
        /**
         * Stores the temporary undo redo states.
         * @property _undoRedoStates
         * @type {Object}
         * @private
         */
        "_undoRedoStates": null,

        "_nIdCounter": 0,

        "_isRetrievingState": false,

        /**
         * Stores the current shape tool
         * @property _curShapeTool
         * @type {String}
         * @private
         */
        "_curShapeTool": -1,

        /**
         * The current action that is being carried out. Used for maintaining undo redo state.
         * @property _strActionName
         * @type {Object}
         * @private
         */
        "_strActionName": null,

        "managerModel": null,

        /**
         * The shape that is being hit even when multiple shapes are selected.
         * @property _hitShape
         * @type {Object}
         * @private
         */
        "_hitShape": null,

        "_whiteboardCanvas": null,

        "_accdivObjectMapping": null,

        "_prevResizeVal": null,

        "TOOLBAR": {
            "SHAPE_TOOLBAR": "shape_toolbar",
            "PROPERTY_TOOLBAR": "property_toolbar"
        },
        "_whiteboardPaperScope": null,

        "currentGridOption": null,


        "setToolData": function() {
            var toolState = {},
                menuItems = [{
                    "tool-type": 19
                }];

            toolState.menuItems = menuItems;
            this._shapeToolbar.setState(toolState);
        },

        "_setHitShape": function(hitShape) {
            this._hitShape = hitShape;
        },

        "_getHitShape": function() {
            return this._hitShape;
        },

        "_getAccDivNumber": function($shapeAccDiv) {
            return $shapeAccDiv.attr("shape-focusdiv-number");
        },

        "setCsvData": function(csvData) {
            if (csvData) {
                WhiteboardTool.Views.CsvData = csvData;
                this.$("#text-tool").trigger("click");
                WhiteboardTool.Views.CsvData = null;
            }
        },

        "updateVisibleDomain": function(includeVisibleArea) {
            var shape, cnt, box, visibleDomain = {
                    "xmin": 0,
                    "ymin": 0,
                    "xmax": 0,
                    "ymax": 0
                },
                bufferSpace = 5,
                visibleGridSize, path,
                gridCoords, boxSize,
                gridGraph = this.gridGraph;

            if (includeVisibleArea) {
                visibleGridSize = gridGraph.getLimits();
                visibleDomain.xmin = visibleGridSize.xLower;
                visibleDomain.xmax = visibleGridSize.xUpper;
                visibleDomain.ymin = visibleGridSize.yLower;
                visibleDomain.ymax = visibleGridSize.yUpper;
            }

            function getGridBox(canvasBox) {
                gridCoords = gridGraph._getGraphPointCoordinates([canvasBox.x, canvasBox.y]);
                boxSize = gridGraph._getGridDistance([box.width, box.height]);

                return {
                    "x": gridCoords[0],
                    "y": gridCoords[1],
                    "width": boxSize[0],
                    "height": boxSize[1]
                };
            }

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

            for (cnt in this._arrShapes) {
                shape = this._arrShapes[cnt];
                path = shape._intermediatePath;
                if (typeof shape !== void 0 && path !== null) {
                    box = path.bounds;
                }
                box = getGridBox(box);
                flexDomain(box.x, box.y);
                flexDomain(box.x + box.width, box.y + box.height);
            }
            this.visibleDomain = visibleDomain;
        },


        "snapshot": function(callback) {
            var visibleDomain, gridGraph = this.gridGraph,
                screenShotSize, continueWithScreenshot,
                ScreenUtils = MathUtilities.Components.Utils.Models.ScreenUtils;

            this.updateVisibleDomain(true);
            visibleDomain = this.visibleDomain;
            screenShotSize = gridGraph.getSizeForGraphScreenshot(visibleDomain);
            continueWithScreenshot = _.bind(function() {
                gridGraph.updateSizeForScreenshot(screenShotSize);
                this.recalculatePosition();
                _.delay(_.bind(function() {

                    MathUtilities.Components.Utils.Models.ScreenUtils.getScreenShot({
                        "container": "#whiteboard-canvas",
                        "type": MathUtilities.Components.Utils.Models.ScreenUtils.types.BASE64,
                        "debug": false,
                        "complete": _.bind(function(data) {
                            callback.call(this, data);
                            gridGraph.photoshootDone();

                            this.recalculatePosition();
                        }, this)
                    });

                }, this), 1000);

            }, this);
            ScreenUtils.confirmScreenshotSize(screenShotSize, continueWithScreenshot);
        },

        /**
         * Initializer of the application.
         * @method initialize
         */
        "initialize": function() {
            var ieVersion,
                managerModel = null,
                isTouchSupported = false,
                retrieveState = this.options.retrieveState,
                TransformModel = WhiteboardTool.Models.Transform,
                imageAssetView,
                ImageManager = MathUtilities.Components.ImageManager,
                propertyToolBar = null;

            this.createFnReference();
            this.model = new WhiteboardTool.Models.Sketchpad();

            this._zIndexofShapes = [];
            this._arrSelectedShapes = [];
            this._arrShapes = [];

            arguments[0].toolId = "7";
            WhiteboardTool.Views.Sketchpad.__super__.initialize.apply(this, arguments);

            this._containerElement.append(this.$("#whiteboard"));
            $("#tool-holder-7").addClass("math-utilities-manager").attr("role", "application");

            //Create undo-manager instance
            MathUtilities.undoManager = new MathUtilities.Components.Undo.Models.UndoManager({
                "maxStackSize": 20
            });
            MathUtilities.undoManagerView = new MathUtilities.Components.Undo.Views.UndoManager({
                "el": this.$("#whiteboard").parents(".math-utilities-components-tool-holder")
            });

            MathUtilities.undoManagerView.on("undo:actionPerformed", this._callUndo, this)
                .on("redo:actionPerformed", this._callRedo, this);

            this.initCanvas();

            WhiteboardTool.Views.Sketchpad._arrShapes = new WhiteboardTool.Collections.Shapes();

            //Set Accessibility related variables
            managerModel = this.managerModel = new MathUtilities.Components.Manager.Models.Manager({
                "isWrapOn": false,
                "debug": true,
                "noTextMode": false
            });
            WhiteboardTool.Views.isAccessible = false;
            isTouchSupported = this.isMobile();
            if (this.options.bAllowAccessibility && !isTouchSupported) {
                managerModel.isAccessible = true;
                WhiteboardTool.Views.isAccessible = true;
                this._accdivObjectMapping = {};
                this._prevResizeVal = {};
            } else {
                managerModel.isAccessible = false;
            }

            this._bindWhiteboardEvents();
            ieVersion = this.getIEVersion();

            if (MathUtilities.Components.Utils.Models.BrowserCheck.isIE || ieVersion === 11) {
                this._whiteboardCanvas.removeClass()
                    .addClass("whiteboard-arrow-cursor-ie");
            }

            // Code here to change the tool selection based on current settings obtained form global settings.
            this._initToolbars();

            imageAssetView = new MathUtilities.Components.ImageAssetView({
                "model": new MathUtilities.Components.ImageAssetModel(),
                "el": $("<div />")
            });
            imageAssetView.on("assetImageSelected", this._getImage, this);
            propertyToolBar = this._propertyToolbar;
            this._currentFillColor = propertyToolBar.getDefaultFillColor();
            this._currentStrokeColor = propertyToolBar.getDefaultStrokeColor();
            this._currentStrokeWidth = propertyToolBar.getDefaultStrokeWidth();
            this._strokeColorHexCode = propertyToolBar.getDefaultColorCode();
            this._fillColorHexCode = propertyToolBar.getDefaultColorCode();


            this.setState(this.toolbarState);

            WhiteboardTool.Models.Text.textToolCounter = 0;

            this.setAccessibility();
            this._updateEditOption();
            this.setGridOption(this.currentGridOption);



            TransformModel.CURRENT_ORIGIN.canvasCo = new WhiteboardTool.Models.Point(WhiteboardTool.Views.CanvasSize.width / 2, WhiteboardTool.Views.CanvasSize.height / 2);
            TransformModel.CURRENT_ORIGIN.graphCo = new WhiteboardTool.Models.Point(0, 0);
            TransformModel.DEFAULT_ORIGIN.canvasCo = new WhiteboardTool.Models.Point(WhiteboardTool.Views.CanvasSize.width / 2, WhiteboardTool.Views.CanvasSize.height / 2);
            TransformModel.DEFAULT_ORIGIN.graphCo = new WhiteboardTool.Models.Point(0, 0);

            ImageManager._paperScope = WhiteboardTool.Views.PaperScope;
            ImageManager._imageLayer = WhiteboardTool.Views.PaperScope.project.activeLayer;
            ImageManager._fallbackLayer = WhiteboardTool.Views.PaperScope.project.activeLayer;
            ImageManager.init();

            this.setGraphType(WhiteboardTool.Views.ToolType.NoGrid, true, true);

            if (retrieveState === void 0 || retrieveState === null) {
                this.model.set("resetToolState", MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.getSyncData()));
            } else {
                this.retrieveState(retrieveState);
            }

            this._resizeTool();
        },

        "createFnReference": function() {
            //This function are bind and unbind at multiple places,
            //To unbind them using off we create reference & used this reference.
            this.toggleMorePropertiesFn = _.bind(this._toggleMoreProperties, this);
            this.onDeleteFn = _.bind(this._onDelete, this);
            this.sendToBackFn = _.bind(this._sendToBack, this);
            this.bringToForwardFn = _.bind(this._bringToForward, this);
            this.shapePropertyKeyPressFn = _.bind(this.shapePropertyKeyPress, this);
            this.textFieldKeyPressFn = _.bind(this.textFieldKeyPress, this);
            this.canvasFakeDivkeyPressRef = _.bind(this.canvasFakeDivkeyPress, this);
        },

        "initCanvas": function() {
            var $canvasContainer = this.$("#whiteboard-canvas-container"),
                gridGraph = null,
                gridParameter = null,
                gridLayers = null,
                LAYERS_NAME = WhiteboardTool.Models.Sketchpad.LAYERS_NAME;

            //Install and setup paper
            this._whiteboardCanvas = this.$("#whiteboard #whiteboard-canvas");

            $canvasContainer.height(this.$("#whiteboard").height() - this.$("#whiteboard #whiteboard-header").height() + this.VERTICAL_PADDING_UNDER_SHADOW);
            this._whiteboardCanvas.width($canvasContainer.width()).height($canvasContainer.height());

            //create grid-graph object.
            gridParameter = {
                "canvasId": "whiteboard-canvas",
                "isGraphDefaultZoomBehaviourAllowed": false,
                "isGraphDefaultPanBehaviourAllowed": false,
                "backgroundColor": "#fff",
                "backgroundColorAlpha": 0,
                "dontBindEvents": true,
                "_useScrollBarsForPanning": true
            };

            gridGraph = new MathUtilities.Components.Graph.Views.GridGraph({
                "$el": $canvasContainer,
                "option": gridParameter
            });

            WhiteboardTool.Views.PaperScope = gridGraph.getPaperScope();

            WhiteboardTool.Views.CanvasSize = {
                "width": this._whiteboardCanvas.width(),
                "height": this._whiteboardCanvas.height()
            };

            gridLayers = gridGraph._projectLayers;

            this.projectLayers = {};
            this.projectLayers[LAYERS_NAME.SHAPE] = gridLayers.customShapeLayer;
            this.projectLayers[LAYERS_NAME.IMAGE] = gridLayers.imageLayer;
            this.projectLayers[LAYERS_NAME.BACKGROUND] = gridLayers.intermediateLayer; //intermediate layer as custom background
            this.projectLayers[LAYERS_NAME.GRAPH] = gridLayers.gridLayer;
            this.projectLayers[LAYERS_NAME.SERVICE] = gridLayers.serviceLayer;
            this.gridGraph = gridGraph;

            WhiteboardTool.Models.Transform.gridGraph = gridGraph;
            this.activateLayer(LAYERS_NAME.SHAPE);

            this.setGridDefaultOption();
            this.changeGridOptions(this.currentGridOption);
            this.gridGraph._scrollBarManager.customPanBy = _.bind(function(dx, dy) {
                this._panBy(dx, dy);
            }, this);
            this.updateObservableUniverse();
        },

        "_resizeTool": function(event) {
            var ToolHolderView = WhiteboardTool.Views.Sketchpad.__super__,
                $canvasContainer = this.$("#whiteboard-canvas-container"),
                canvasHt,
                canvasWidth,
                TOOLBAR_WIDTH_REDUCTION = 15,
                toolHolderSize;

            ToolHolderView._resizeTool.call(this, event);
            toolHolderSize = ToolHolderView.getToolSize.call(this);
            this.$("#whiteboard").height(toolHolderSize.height).width(toolHolderSize.width);
            canvasHt = this.$("#whiteboard").height() - this.$("#whiteboard #whiteboard-header").height() + this.VERTICAL_PADDING_UNDER_SHADOW;
            $canvasContainer.height(canvasHt);
            canvasWidth = $canvasContainer.width();
            this._whiteboardCanvas.width(canvasWidth).height(canvasHt);
            this.$('#whiteboard-canvas-fakediv-acc-elem').width(canvasWidth).height(canvasHt);
            this.$("#whiteboard-properties-toolbar").width(canvasWidth - TOOLBAR_WIDTH_REDUCTION);
            WhiteboardTool.Views.accManagerView.enableTab("whiteboard-canvas-fakediv", false);
            this.$("#whiteboard-canvas-fakediv").off("keydown", this.canvasFakeDivkeyPressRef);
            this._removeAccFocusRect();
            this.gridGraph.canvasResize(true);
            WhiteboardTool.Views.CanvasSize = {
                "width": canvasWidth,
                "height": canvasHt
            };
            this.recalculatePosition();
            this.recalculateAccDivPosition();
        },

        "zoomIn": function() {
            this.gridGraph._zoomGraph(1, true);
            this._zoomComplete();
        },

        "zoomDefault": function() {
            this.gridGraph.defaultGraphZoom();
            this._zoomComplete();
        },

        "zoomOut": function() {
            this.gridGraph._zoomGraph(-1, true);
            this._zoomComplete();
        },

        "_zoomComplete": function() {
            this.recalculateSizeForZoom();
            this.updateObservableUniverse();
            this.recalculateAccDivPosition();
        },

        "activatePaperScope": function() {
            if (WhiteboardTool.Views.PaperScope) {
                WhiteboardTool.Views.PaperScope.activate();
            }
        },

        "activateLayer": function(layerName) {
            if (this.projectLayers[layerName]) {
                this.gridGraph.activateNewLayer(layerName);
            } else {
                this.gridGraph.activateEarlierLayer();
            }
        },

        "setGraphType": function(graphType, supressStackRegister, changeMenustate, setFocus) {
            var getGraphTypeName = function(type) {
                    var GRAPH_TYPE = WhiteboardTool.Models.Sketchpad.GRAPH_TYPE,
                        ToolType = WhiteboardTool.Views.ToolType,
                        graphData = {
                            "name": "",
                            "tool": ""
                        };

                    switch (type) {
                        case ToolType.CartesianGrid:
                            graphData.name = GRAPH_TYPE.CARTESIAN;
                            graphData.tool = GRAPH_TYPE.CARTESIAN + "-tool";
                            break;
                        case ToolType.PolarGrid:
                            graphData.name = GRAPH_TYPE.POLAR;
                            graphData.tool = GRAPH_TYPE.POLAR + "-tool";
                            break;
                        case ToolType.NoGrid:
                            graphData.name = GRAPH_TYPE.NOGRID;
                            graphData.tool = "no-graph-tool";
                            break;
                    }
                    return graphData;
                },
                prevType = this.currentGraphType,
                prevGridData = getGraphTypeName(prevType),
                curGridData = getGraphTypeName(graphType),
                LAYERS_NAME = WhiteboardTool.Models.Sketchpad.LAYERS_NAME,
                undoRedoData = {},
                accText,
                accManager = WhiteboardTool.Views.accManagerView,
                isEnableGridOpt = false;

            if (prevGridData.name !== curGridData.name) {
                undoRedoData.oldState = {
                    "graphType": prevType
                };

                this.activateLayer(LAYERS_NAME.GRAPH);

                this.currentGraphType = graphType;

                if (curGridData.name === "no-grid") {
                    this.gridGraph.setLabelVisibility(false);
                    this.gridGraph.setAxisMarkerVisibility(false);
                    this.gridGraph.setGridLineVisibility(false);
                    this._shapeToolbar.enableGridOption(false);
                    this.gridGraph.drawGraph();

                } else {
                    //change graph type boolean
                    this.gridGraph._gridGraphModelObject.get('_graphDisplayValues')._graphDisplay.isCartesionCurrentGraphType = curGridData.name === 'cartesian-graph';
                    this._shapeToolbar.enableGridOption(true);
                    this.changeGridOptions(this.currentGridOption);
                    this.setGridOption(this.currentGridOption);
                }

                this.activateLayer(LAYERS_NAME.SHAPE);

                undoRedoData.newState = {
                    "graphType": graphType
                };
                if (supressStackRegister !== true) {
                    undoRedoData.actionName = WhiteboardTool.Views.UndoRedoActions.GraphChange;
                    this._saveToUndoRedoStack(undoRedoData);
                }

                if (changeMenustate) {
                    this._shapeToolbar.setGraphState({
                        "toolType": graphType
                    });
                }
            }

            if (setFocus) {
                accText = accManager.getAccMessage(curGridData.tool, 1);
                this.enableCanvasFakediv(accText, "whiteboard-canvas-fakediv");
            }
        },


        "setAccessibility": function() {
            var managerModel = this.managerModel,
                accData = WhiteboardTool.Models.Sketchpad._jsonData,
                managerView = null,
                backgroundPopUpCloseElements = null,
                element = null,
                disableProperties = null;

            managerModel.parse(accData);
            managerView = WhiteboardTool.Views.accManagerView = new MathUtilities.Components.Manager.Views.Manager({
                "el": "#tool-holder-7",
                "model": managerModel
            });
            managerView.loadScreen("whiteboard");
            managerView.loadScreen("CanvasScreen");
            managerView.setFocus("math-title-text-7");


            this._shapeToolbar.selectTool({
                "tool-type": WhiteboardTool.Views.ShapeType.None,
                "tool-group": "2",
                "bFireEvent": false
            });
            this.$("#whiteboard #rectangle-shape").addClass("selected item-selected");
            if (WhiteboardTool.Views.isAccessible) {

                this.$("#shape-tool-focus-rect").on("click", _.bind(function(event) {
                    event.stopPropagation();
                    this.$("#drop-down-icon-container").trigger("click");
                }, this));
            }
            disableProperties = _.bind(function() {
                this._enableShapeProperties(false);
            }, this);
            managerView.focusIn("shape-tool-focus-rect", disableProperties);
            managerView.focusIn("text-tool", _.bind(this._shapeToolbar.hideBackgroundPopup, this));
            managerView.focusIn("edit-focus-rect", _.bind(this._shapeToolbar.hideEditPopup, this));
            managerView.focusIn("undo-btn", _.bind(this._shapeToolbar.hideEditPopup, this));
            managerView.focusIn("redo-btn", _.bind(this._shapeToolbar.hideEditPopup, this));
            managerView.focusIn("reset-btn", _.bind(this._shapeToolbar.hideEditPopup, this));
            managerView.focusIn("background-tool-menu", _.bind(this._shapeToolbar.hideGraphPopup, this._shapeToolbar));
            managerView.focusIn("graph-focus-rect", _.bind(this._shapeToolbar.hideGraphPopup, this._shapeToolbar));
            managerView.focusIn("pan-tool", _.bind(this._shapeToolbar.hideGraphPopup, this._shapeToolbar));

            managerView.enableTab("undo-btn", false);
            managerView.enableTab("redo-btn", false);

            backgroundPopUpCloseElements = ["background-tool-menu", "graph-focus-rect"];
            for (element in backgroundPopUpCloseElements) {
                managerView.focusIn(backgroundPopUpCloseElements[element], _.bind(this._shapeToolbar.hideBackgroundPopup, this._shapeToolbar));
            }

            //for image-tool bind keydown events, to handle accessibility.
            this.$("#whiteboard #image-tool").on("keydown", _.bind(this._onImageToolKeydown, this));
            //create tool-tip
            this._createCustomToolTips();
            this._initBootstrapPopup();
        },

        "_onImageToolKeydown": function(event) {
            if ([WhiteboardTool.Models.Sketchpad.ENTER_KEY, WhiteboardTool.Models.Sketchpad.SPACE_BAR_KEY].indexOf(event.keyCode) > -1) {
                event.stopPropagation();
            }
        },

        /**
         * Create bootstrap custom popups.
         * @method _initBootstrapPopup
         * @private
         */
        "_initBootstrapPopup": function() {
            var manager = WhiteboardTool.Views.accManagerView,
                imageFileCustomPopup, resetScreen, $imageFileCustomPopup, $resetCustomPopup;

            manager.loadScreen("reset-screen-popup");
            manager.loadScreen("img-format-popup");

            imageFileCustomPopup = WhiteboardTool.Views.templates["custom-popup"]({
                "id": "img-format",
                "title": manager.getMessage("img-format-title", 0),
                "text": manager.getMessage("img-format-text", 0),
                "ok": manager.getMessage("img-format-ok-button", 0)
            }).trim();

            resetScreen = WhiteboardTool.Views.templates["custom-popup"]({
                "id": "reset-screen",
                "title": manager.getMessage("reset-screen-title", 0),
                "text": manager.getMessage("reset-screen-text", 0),
                "ok": manager.getMessage("reset-screen-ok-button", 0),
                "cancel": manager.getMessage("reset-screen-cancel-button", 0)
            }).trim();

            $imageFileCustomPopup = $(imageFileCustomPopup);
            $resetCustomPopup = $(resetScreen);

            $imageFileCustomPopup.find(".btn-cancel, .close").hide();
            $resetCustomPopup.find(".close").hide();
            this.$("#whiteboard").parent().append($imageFileCustomPopup).append($resetCustomPopup);

            manager.unloadScreen("reset-screen-popup");
            manager.unloadScreen("img-format-popup");
        },

        /**
         * Show custom popup model,bind popup ok and close events.
         * @method _showCustomPopup
         * @param {string} selectorId, id of custom popup element.
         * @param {Object} onOkClick, to be called when ok option is click.
         * @param {Object} onCancelClick, to be call when cancel option is click.
         */
        "_showCustomPopup": function(selectorId, onOkClick, onCancelClick) {
            var $customPopup = this.$("#" + selectorId),
                isModalHidetrigger = false,
                okclick = function() {
                    isModalHidetrigger = true;
                    $customPopup.modal("hide");
                    if (onOkClick) {
                        onOkClick();
                    }
                },
                onCancel = _.bind(function() {
                    this._enableTabs(true);
                    if (onCancelClick && !isModalHidetrigger) {
                        onCancelClick();
                    }
                }, this);

            $customPopup.off("hidden.bs.modal").on("hidden.bs.modal", onCancel)
                .find(".btn-primary").off("click").on("click", okclick);

            $customPopup.modal();
            this._enableTabs(false);

        },

        "_initToolbars": function() {
            this._shapeToolbar = new WhiteboardTool.Views.ShapeToolbar({
                "el": this.$el
            });
            this._shapeToolbar.on("assetImagePreloaded", this._getImage, this)
                .on("toolchange", this._onCurToolChange, this)
                .on("background-change", this._onBackgroundChange)
                .on("trigger-canvas-click", this.triggerCanvasClick, this)
                .on("triggerSelectTool", this.triggerSelectTool, this)
                .on('openImagePopup', this._getImageFile, this)
                .on('check-box-click', this.onGridOptionChange, this);
            this._commonPropertiesToolbar = new MathUtilities.Components.PropertiesBar.Views.MenuBar({
                "el": "#whiteboard-properties-toolbar"
            });
            this._propertyToolbar = new WhiteboardTool.Views.PropertyToolbar({
                "el": this.$('#whiteboard')
            });
            this._propertyToolbar.on("propertychange", this._onToolPropertyChange, this);
            this._commonPropertiesToolbar.hide();
            this._commonPropertiesToolbar.on("properties-bar-shown", this._onPropertiesBarShow, this)
                .on("properties-bar-hidden", this._propertyNavigationBarHidden, this);

            this.$("#whiteboard").parents("#tool-holder").on("mouseup", _.bind(function() {
                this.$(".more-menu-properties-label").removeClass("more-menu-label-down");
                this.$("#refresh-btn").removeClass("mousedown");
            }, this));

            if (this.isMobile()) {
                this.$(".whiteboard-tool-icon").on("touchstart", _.bind(this._onToolIconMouseEnter, this))
                    .on("touchend", _.bind(this._onToolIconMouseLeave, this));
                this.$(".shape-tool-menuitem").on("touchstart", _.bind(this._onShapeMenuItemEnter, this))
                    .on("touchend", _.bind(this._onShapeMenuItemLeave, this));
            } else {
                this.$(".whiteboard-tool-icon").on("mouseenter", _.bind(this._onToolIconMouseEnter, this))
                    .on("mouseleave", _.bind(this._onToolIconMouseLeave, this));
                this.$(".shape-tool-menuitem").on("mouseenter", _.bind(this._onShapeMenuItemEnter, this))
                    .on("mouseleave", _.bind(this._onShapeMenuItemLeave, this));
            }
            WhiteboardTool.Views.DrawingTool = WhiteboardTool.Views.ShapeType.None;
            WhiteboardTool.Views.CurTool = WhiteboardTool.Views.ShapeType.None;
        },

        "_onToolIconMouseEnter": function(eventObject) {
            var target = eventObject.delegateTarget;
            if (!$(target).parent().hasClass("selected")) {
                $(target).addClass("hovered");
            }
        },

        "_onToolIconMouseLeave": function(eventObject) {
            $(eventObject.delegateTarget).removeClass("hovered");
        },

        "_onShapeMenuItemEnter": function(eventObject) {
            var target = eventObject.delegateTarget;
            if (!($(target).hasClass("selected") || $(target).hasClass("background-option-selected"))) {
                $(target).addClass("hovered")
                    .children().addClass("hovered");
            }
        },

        "_onShapeMenuItemLeave": function(eventObject) {
            $(eventObject.delegateTarget).removeClass("hovered")
                .children().removeClass("hovered");
        },

        "_onBackgroundChange": function(backgroundData) {
            this.$(".math-utilities-whiteboard-tool #background-list-container .background-option-selected")
                .removeClass("background-option-selected");
            if (backgroundData.selectedBackground) {
                var imageData = backgroundData.selectedBackground.model.getData().imageData.split("/");

                imageData = imageData[imageData.length - 1].split(".");
                imageData = imageData[0];
                this.$(".math-utilities-whiteboard-tool #background-list-container .whiteboard-bg-list[data-image-name=" + imageData + "]").addClass("background-option-selected");
            } else { //if no-background option is selected
                this.$(".math-utilities-whiteboard-tool #background-list-container .whiteboard-bg-list[data-image-name=\"no-background\"]").addClass("background-option-selected");
            }
        },

        "_propertyNavigationBarHidden": function() {
            this._clearShapeSelection();
            this.triggerSelectTool();
        },

        "_onPropertiesBarShow": function(curshape) {
            var $propertiesMenuContainer = this.$("#math-utilities-properties-menu-container"),
                moreTemplateString,
                eventStartName = "mouseenter",
                eventEndName = "mouseleave",
                colorPickerOptions,
                accManagerView = WhiteboardTool.Views.accManagerView,
                fillColorPicker,
                strokeColorPicker,
                checkboxContainer,
                colorPicker = MathUtilities.Components.ColorPicker.Views.ColorPicker,
                propertyToolbar = this._propertyToolbar,
                colorCode = null,
                self = this,
                colorString = null,
                $dropDownBtn;

            if (this.isMobile()) {
                eventStartName = "touchstart";
                eventEndName = "touchend";
            }

            if ($propertiesMenuContainer.find("#strokeWidth-slider-container").length > 0) {
                propertyToolbar._createThicknessSlider();
            }
            if ($propertiesMenuContainer.find("#fill-color-palette #fill-color-palette-container").length > 0) {
                colorString = this._currentFillColor;
                colorCode = this._fillColorHexCode;
                if (curshape) {
                    colorCode = curshape.model.get("fill_color_code");
                    colorString = curshape.model.get("_data").strFillColor;
                }
                colorPickerOptions = {
                    "color": colorCode,
                    "holderDiv": "#fill-color-palette-holder",
                    "idPrefix": "fill-",
                    "manager": accManagerView,
                    "createAlphaSlider": false
                };
                fillColorPicker = new colorPicker.createColorPicker(colorPickerOptions);
                fillColorPicker.on(colorPicker.EVENTS.COLOR_CHANGE, _.bind(function(event, colorObj, movementData) {
                        propertyToolbar.setFillColor(colorObj.hex, movementData);
                    }, this))
                    .on(colorPicker.EVENTS.ALPHA_CHANGE, _.bind(function(event, colorObj) {
                        propertyToolbar.setFillColor(colorObj.hex);
                    }, this));
                $propertiesMenuContainer.find('#no-fill-check-holder').on('click', function(event) {
                    event.stopPropagation();
                    var $fillColor = $(this).parents('.palette-main-div').find('.fill-color');
                    $(this).find('.checkbox').toggleClass('selected');
                    $(this).siblings('.opacity-div').toggle();
                    $fillColor.toggleClass('no-fill');
                    if ($fillColor.hasClass('no-fill')) {
                        propertyToolbar.setFillColor("no-fill");
                        self.enableDisableTabIndexForPalette('fill', false);
                    } else {
                        propertyToolbar.setFillColor(fillColorPicker.getCurrentColor().hex);
                        self.enableDisableTabIndexForPalette('fill', true);
                    }
                    accManagerView.changeAccMessage("no-fill-check-holder", $fillColor.hasClass('no-fill') ? 1 : 0);
                    accManagerView.setFocus("whiteboard-temp-focus");
                    accManagerView.setFocus("no-fill-check-holder", 10);
                });
                $propertiesMenuContainer.find('#fill-color-palette .checkbox').toggleClass('selected', colorString === "no-fill");
                $propertiesMenuContainer.find('#fill-color-palette .opacity-div').toggle(colorString === "no-fill");
                $propertiesMenuContainer.find('#fill-color-palette .fill-color').toggleClass('no-fill', colorString === "no-fill");
                accManagerView.changeAccMessage("no-fill-check-holder", colorString === "no-fill" ? 1 : 0);

                $propertiesMenuContainer.find('#stroke-color-text').addClass('margin-for-stroke');
                $propertiesMenuContainer.find('#fill-color-picker-acc-disk-container, #fill-luminance-bar-holder, #fill-luminance-slider-handle').addClass('whiteboard-non-selectable-labels');
            }
            if ($propertiesMenuContainer.find("#stroke-color-palette #stroke-color-palette-container").length > 0) {
                colorString = this._currentStrokeColor;
                colorCode = this._strokeColorHexCode;
                if (curshape) {
                    colorString = curshape.model.get('_data').strStrokeColor;
                    colorCode = curshape.model.get("stroke_color_code");
                }
                colorPickerOptions = {
                    "color": colorCode,
                    "holderDiv": "#stroke-color-palette-holder",
                    "idPrefix": "stroke-",
                    "manager": accManagerView,
                    "createAlphaSlider": false
                };
                strokeColorPicker = new colorPicker.createColorPicker(colorPickerOptions);
                strokeColorPicker.on(colorPicker.EVENTS.COLOR_CHANGE, _.bind(function(event, colorObj, movementData) {
                        propertyToolbar.setStrokeColor(colorObj.hex, movementData);
                    }, this))
                    .on(colorPicker.EVENTS.ALPHA_CHANGE, _.bind(function(event, colorObj) {
                        propertyToolbar.setStrokeColor(colorObj.hex);
                    }, this));
                $propertiesMenuContainer.find('#stroke-color-palette .check-holder').on('click', function(event) {
                    event.stopPropagation();
                    var $strokeColor = $(this).parents('.palette-main-div').find('.stroke-color');
                    $(this).find('.checkbox').toggleClass('selected');
                    $(this).siblings('.opacity-div').toggle();
                    $strokeColor.toggleClass('no-stroke');
                    if ($strokeColor.hasClass('no-stroke')) {
                        propertyToolbar.setStrokeColor("no-stroke");
                        self.enableDisableTabIndexForPalette('stroke', false);
                    } else {
                        propertyToolbar.setStrokeColor(strokeColorPicker.getCurrentColor().hex);
                        self.enableDisableTabIndexForPalette('stroke', true);
                    }
                    accManagerView.changeAccMessage("no-stroke-check-holder", $strokeColor.hasClass('no-stroke') ? 1 : 0);
                    accManagerView.setFocus("whiteboard-temp-focus");
                    accManagerView.setFocus("no-stroke-check-holder", 10);
                });
                $propertiesMenuContainer.find('#stroke-color-palette .checkbox').toggleClass('selected', colorString === "no-stroke");
                $propertiesMenuContainer.find('#stroke-color-palette .opacity-div').toggle(colorString === "no-stroke");
                $propertiesMenuContainer.find('#stroke-color-palette .stroke-color').toggleClass('no-stroke', colorString === "no-stroke");
                $propertiesMenuContainer.find('#stroke-color-picker-acc-disk-container, #stroke-luminance-bar-holder, #stroke-luminance-slider-handle').addClass('whiteboard-non-selectable-labels');
                accManagerView.changeAccMessage("no-stroke-check-holder", colorString === "no-stroke" ? 1 : 0);
            }
            if ($propertiesMenuContainer.find(".more-menu-properties-container").length > 0) {
                $propertiesMenuContainer.find(".more-menu-properties-container").find(".more-menu-properties-label")
                    .on(eventStartName, function() {
                        $(this).addClass("more-menu-label-hovered");
                    }).on(eventEndName, function() {
                        $(this).removeClass("more-menu-label-hovered");
                    });

                $propertiesMenuContainer.find(".more-menu-properties-container").find(".more-menu-properties-label")
                    .on("mousedown", function() {
                        $(this).addClass("more-menu-label-down");
                    })
                    .on("mouseout", function() {
                        $(this).removeClass("more-menu-label-down");
                    })
                    .on("mouseup", function() {
                        $(this).removeClass("more-menu-label-down");
                    });
                moreTemplateString = WhiteboardTool.Views.templates["fill-opacity"]().trim();
                moreTemplateString += WhiteboardTool.Views.templates["rotate-shape"]().trim();
                $propertiesMenuContainer.find(".more-menu-properties").html(moreTemplateString).hide();

            }
            if ($propertiesMenuContainer.find("#rotate-shape-container").length > 0) {
                //to limit textbox value in given range
                new MathUtilities.Components.LimitTextBox.Views.limitTextBox({
                    "el": "#rotation-angle-text-box",
                    "option": {
                        "minInput": 0,
                        "maxInput": 360
                    }
                });
                if (curshape) {
                    $propertiesMenuContainer.find("#rotate-button")
                        .off("click", propertyToolbar.onRotateButtonClickFn)
                        .on("click", {
                            "shape": curshape
                        }, propertyToolbar.onRotateButtonClickFn);
                    $propertiesMenuContainer.find("#rotation-angle-text-box")
                        .off("keyup", propertyToolbar.onRotateTextBoxEnterFn)
                        .on("keyup", {
                            "shape": curshape
                        }, propertyToolbar.onRotateTextBoxEnterFn);
                }
            }
            if ($propertiesMenuContainer.find("#fill-opacity-container").length > 0) {
                //to limit textbox value in given range
                new MathUtilities.Components.LimitTextBox.Views.limitTextBox({
                    "el": "#change-opacity-text-box",
                    "option": {
                        "minInput": 0,
                        "maxInput": 100
                    }
                });
                $propertiesMenuContainer.find("#change-opacity-button")
                    .off("click", propertyToolbar.onChangeOpacityButtonClickFn)
                    .on("click", {
                        "shape": curshape
                    }, propertyToolbar.onChangeOpacityButtonClickFn);
                $propertiesMenuContainer.find("#change-opacity-text-box")
                    .off("keyup", propertyToolbar.onFillOpacityTextBoxEnterFn)
                    .on("keyup", {
                        "shape": curshape
                    }, propertyToolbar.onFillOpacityTextBoxEnterFn);
            }

            $propertiesMenuContainer.find(".whiteboard-tool-slider-handle-up")
                .on(eventStartName, function() {
                    $(this).addClass("hovered");
                }).on(eventEndName, function() {
                    $(this).removeClass("hovered");
                });
            $propertiesMenuContainer.find("#delete-shape, #send-to-back, #bring-to-front")
                .on(eventStartName, function() {
                    $(this).children().addClass("hovered");
                }).on(eventEndName, function() {
                    $(this).children().removeClass("hovered");
                });

            this.$("#whiteboard #change-opacity-button, #whiteboard #rotate-button")
                .on(eventStartName, function() {
                    $(this).addClass("hovered");
                }).on(eventEndName, function() {
                    $(this).removeClass("hovered");
                });

            $propertiesMenuContainer.find('.palette-drop-down-opener')
                .off("click", propertyToolbar.onPaletteDropdownClickFn).on("click", propertyToolbar.onPaletteDropdownClickFn);
            $propertiesMenuContainer.find("#max-strokeWidth")
                .off("click", propertyToolbar.increaseSliderValFn).on("click", propertyToolbar.increaseSliderValFn);
            $propertiesMenuContainer.find("#min-strokeWidth")
                .off("click", propertyToolbar.decreaseSliderValFn).on("click", propertyToolbar.decreaseSliderValFn);
            $propertiesMenuContainer.find(".more-menu-properties-label")
                .off("click", this.toggleMorePropertiesFn).on("click", this.toggleMorePropertiesFn);
            $propertiesMenuContainer.find("#delete-shape")
                .off("click", this.onDeleteFn).on("click", this.onDeleteFn);
            $propertiesMenuContainer.find("#send-to-back")
                .off("click", this.sendToBackFn).on("click", this.sendToBackFn);
            $propertiesMenuContainer.find("#bring-to-front")
                .off("click", this.bringToForwardFn).on("click", this.bringToForwardFn);
            $propertiesMenuContainer.find(".whiteboard-non-selectable-labels")
                .off("keydown", this.shapePropertyKeyPressFn).on("keydown", this.shapePropertyKeyPressFn);
            $propertiesMenuContainer.find(".whiteboard-tool-input-box")
                .off("keydown", this.textFieldKeyPressFn).on("keydown", this.textFieldKeyPressFn);

            $dropDownBtn = this.$('.palette-drop-down-opener');
            $dropDownBtn.on('mouseenter', function() {
                $(this).addClass('hover');
            }).on('mouseleave', function() {
                $(this).removeClass('hover');
            });
            //create tool-tips for properties
            this._createProprtiesToolTips();
            this.activatePaperScope();
        },
        "enableDisableTabIndexForPalette": function(palette, enable) {
            var $propertiesMenuContainer = this.$("#math-utilities-properties-menu-container"),
                managerView = WhiteboardTool.Views.accManagerView;
            managerView.enableTab(palette + "-color-picker-acc-disk-container", enable);
            managerView.enableTab(palette + "-luminance-bar-holder", enable);
            managerView.enableTab(palette + "-luminance-slider-handle", enable);
        },
        /**
         * Create custom tool-tips for properties.
         * @method _createProprtiesToolTips
         * @private
         */
        "_createProprtiesToolTips": function() {
            var elemId = null,
                options = null,
                tooltipView = null,
                accManagerView = WhiteboardTool.Views.accManagerView,
                $el = this.$el,
                tooltipElems = {
                    "change-opacity-button": {
                        "tooltipHolder": "change-opacity-button",
                        "position": "bottom"
                    },
                    "rotate-button": {
                        "tooltipHolder": "rotate-button",
                        "position": "bottom"
                    },
                    "bring-to-front": {
                        "tooltipHolder": "bring-to-front-icon",
                        "position": "bottom"
                    },
                    "send-to-back": {
                        "tooltipHolder": "send-to-back-icon",
                        "position": "bottom"
                    },
                    "delete-shape": {
                        "tooltipHolder": "delete-shape-icon",
                        "position": "bottom"
                    },
                    "math-utilities-properties-collapse-button": {
                        "tooltipHolder": "math-utilities-properties-collapse-button",
                        "position": "bottom",
                        "align": "right"
                    }
                },
                startEvents = "mouseenter",
                endEvents = "mouseleave";

            if ("ontouchstart" in window) {
                if (this.isMobile()) {
                    startEvents = "touchstart";
                    endEvents = "touchend";
                } else {
                    //touch and type device
                    startEvents += " touchstart";
                    endEvents += " touchend";
                }
            }

            for (elemId in tooltipElems) {
                options = {
                    "id": tooltipElems[elemId].tooltipHolder + "-tooltip",
                    "text": accManagerView.getMessage(elemId + "-tooltip", 0),
                    "position": tooltipElems[elemId].position,
                    "align": tooltipElems[elemId].align,
                    "tool-holder": $el
                };
                tooltipView = MathUtilities.Components.CustomTooltip.generateTooltip(options);
                this.$("#" + elemId).on(startEvents, _.bind(tooltipView.showTooltip, tooltipView))
                    .on(endEvents, _.bind(tooltipView.hideTooltip, tooltipView));
            }
        },

        "textFieldKeyPress": function(event) {
            var accManagerView = WhiteboardTool.Views.accManagerView,
                currentElemId = $(event.delegateTarget).attr("id"),
                textboxContainerId = $(event.delegateTarget).parents(".text-box-container").attr("id");


            if (event.keyCode === WhiteboardTool.Models.Sketchpad.ESCAPE_KEY) {
                accManagerView.setFocus(textboxContainerId);
                event.stopPropagation();
            } else if (event.keyCode === WhiteboardTool.Models.Sketchpad.TAB_KEY) {
                switch (currentElemId) {
                    case "change-opacity-text-box":
                        if (event.shiftKey === true) {
                            accManagerView.setFocus("change-opacity-button", 10);
                        } else {
                            accManagerView.setFocus("rotate-shape-text", 10);
                        }
                        break;
                    case "rotation-angle-text-box":
                        if (event.shiftKey === true) {
                            accManagerView.setFocus("rotate-button", 10);
                        } else if (this.$('#bring-to-front').children().hasClass('button-disabled')) {
                            accManagerView.setFocus("delete-shape", 10);
                        } else {
                            accManagerView.setFocus("bring-to-front", 10);
                        }
                        break;
                }
                event.preventDefault();
            }
        },

        "_okClicked": function() {
            this._okBtnClicked = true;
            if (this.$("#whiteboard-tool-popup .resetBoard-param-container").is(":visible")) {
                this._deleteAllShapes();
            }
            this.$("#whiteboard-tool-popup").modal("hide");
        },

        "_setOkFlag": function() {
            this._okBtnClicked = false;
        },

        "_toggleMoreProperties": function(event) {
            var $moreMenuProperties = $(event.target).parents(".more-menu-properties-container").find(".more-menu-properties"),
                managerView = WhiteboardTool.Views.accManagerView;

            if ($moreMenuProperties.is(":visible")) {
                $moreMenuProperties.hide();
            } else {
                if (this._arrSelectedShapes.length === 1) {
                    this.updatePropertyToolbar(this._arrSelectedShapes[0].model.getData());
                }
                $moreMenuProperties.show();
                managerView.enableTab("fill-opacity-text", true);
                managerView.updateFocusRect("fill-opacity-text");
                managerView.updateFocusRect("change-opacity-text-box-container");
                managerView.updateFocusRect("rotate-shape-text");
                managerView.updateFocusRect("rotation-angle-text-box-container");

                //set focus fill-opacity-text div.
                managerView.setFocus("fill-opacity-text");
            }
        },

        "updatePropertyToolbar": function(data) {
            var toolState = {},
                menuItems = [],
                managerView = WhiteboardTool.Views.accManagerView,
                selectedShapes = this._arrSelectedShapes,
                nSelectedShape = selectedShapes.length;

            if (data.strFillColor) {
                menuItems.push({
                    "tool-type": 11,
                    "tool-value": data.strFillColor,
                    "bSelected": true
                });
            }
            if (data.strStrokeColor) {
                menuItems.push({
                    "tool-type": 12,
                    "tool-value": data.strStrokeColor,
                    "bSelected": true
                });
            }
            if (typeof data.nStrokeWidth !== "undefined" && $("#strokeWidth-slider-container").is(":visible")) {
                this._propertyToolbar.sliderViewObject.set(data.nStrokeWidth, true);
            }
            if (typeof data.nFillAlpha !== "undefined") {
                this.$("#whiteboard #change-opacity-text-box").val(Math.round(data.nFillAlpha * 100));

                if (data.nFillAlpha === 0.5) { //0.5 to check opacity is 50%
                    managerView.changeAccMessage("change-opacity-button", 1);
                } else {
                    managerView.changeAccMessage("change-opacity-button", 0);
                }
            }
            if (nSelectedShape === 0) {
                this.$("#whiteboard #rotation-angle-text-box").attr("readonly", "readonly");
                this.$("#whiteboard .whiteboard-tool-rotate-icon").removeClass("whiteboard-tool-rotate-icon")
                    .addClass("whiteboard-tool-rotate-icon-disabled").css({
                        "cursor": "default"
                    });
                this.$('#whiteboard').find(".whiteboard-tool-bring-to-front-icon, .whiteboard-tool-send-to-back-icon, .whiteboard-tool-delete-icon")
                    .addClass("button-disabled");
                this.$("#whiteboard .right-menu-item-container").css({
                    "cursor": "default"
                });
            } else {
                if (typeof data.nRotation !== "undefined") {
                    this._updateRotationBox(data.nRotation);
                }
                if (nSelectedShape === 1 && selectedShapes[0].model.get("_data").nType === WhiteboardTool.Views.ShapeType.Image) {
                    this.$('#whiteboard').find(".whiteboard-tool-bring-to-front-icon, .whiteboard-tool-send-to-back-icon")
                        .addClass("button-disabled")
                        .parents(".right-menu-item-container")
                        .addClass("defaultCursor");
                }
            }
            toolState.menuItems = menuItems;
            this._propertyToolbar.setState(toolState);
            this._updatePropertyToolText(data);
        },

        "_updatePropertyToolText": function(data) {
            var accText = this._getShapeFocuDivText(data.nType),
                managerView = WhiteboardTool.Views.accManagerView;
            if (typeof data.nFillAlpha !== "undefined") {
                managerView.setAccMessage("fill-opacity-text", accText.opacityLabelText);
            }
            if (typeof data.nRotation !== "undefined") {
                managerView.setAccMessage("rotate-shape-text", accText.rotateLabelText);
            }
        },

        "_updateRotationBox": function(angle) {
            this.$("#whiteboard #rotation-angle-text-box").removeAttr("readonly").val();
        },

        "_touchDoubleTapCounter": null,
        "_DOUBLE_TAP_THRESHOLD": 600,

        /**
         * Binds events on sketch pad.
         * @method _bindWhiteboardEvents
         * @private
         */
        "_bindWhiteboardEvents": function() {
            var canvas = document.getElementById("whiteboard-canvas");
            MathUtilities.Components.Utils.TouchSimulator.enableTouch(canvas);

            WhiteboardTool.Views.PaperScope.tool.onMouseDown = _.bind(this._onTouchStart, this);
            WhiteboardTool.Views.PaperScope.tool.onMouseDrag = _.bind(this._onTouchDrag, this);
            WhiteboardTool.Views.PaperScope.tool.onMouseUp = _.bind(this._onTouchEnd, this);
            this.$("#whiteboard-canvas").on("mousewheel wheel", _.bind(this._zoomGraph, this));

            this.$("#whiteboard-canvas").on("dblclick", _.bind(this._onToolDoubleClick, this));
            canvas.addEventListener("touchstart", _.bind(this._onCanvasTouchStart, this));

            this.$("#whiteboard").parents(".math-utilities-components-tool-holder")
                .on("keydown", _.bind(this._onKeyDown, this)).attr("tabindex", -1);
            this.$("#whiteboard .whiteboard-bg-list").on("click", _.bind(this._onBackgroundClick, this));
        },
        "bindMouseMove": function() {
            WhiteboardTool.Views.PaperScope.tool.onMouseMove = _.bind(this._onTouchMove, this);
        },

        "unbindMouseMove": function() {
            WhiteboardTool.Views.PaperScope.tool.onMouseMove = null;
        },

        "_onCanvasTouchStart": function(event) {
            if (this._touchDoubleTapCounter === null) {
                this._touchDoubleTapCounter = new Date().getTime();
            } else {
                if (new Date().getTime() - this._touchDoubleTapCounter > this._DOUBLE_TAP_THRESHOLD) {
                    this._touchDoubleTapCounter = null;
                } else {
                    this._touchDoubleTapCounter = null;
                    this._onToolDoubleClick(event);
                }
            }
        },

        "_onToolDoubleClick": function(event) {
            if (WhiteboardTool.Views.DrawingTool !== WhiteboardTool.Views.ShapeType.None) {
                return;
            }
            var canvasPosition = this.$("#whiteboard-canvas").offset(),
                canvasX = event.pageX - canvasPosition.left,
                canvasY = event.pageY - canvasPosition.top,
                canvasPoint = null,
                sketchCounter,
                canvasChildren = this.projectLayers[WhiteboardTool.Models.Sketchpad.LAYERS_NAME.SHAPE].children,
                childIndex,
                hitResult,
                sketchesLength = this._arrShapes.length,
                currentSketch,
                sketchUnderPoint = null,
                highestZIndex = -1,
                selectedShapes = this._arrSelectedShapes,
                selectedShapesLen = selectedShapes.length,
                selectedShapesCnt = 0;

            //Handled especially for nexus since it returns wrong value for event.pageX
            if (this.isMobile()) {
                canvasX = event.changedTouches[0].pageX - canvasPosition.left;
                canvasY = event.changedTouches[0].pageY - canvasPosition.top;
            }
            canvasPoint = new WhiteboardTool.Views.PaperScope.Point(canvasX, canvasY);
            for (sketchCounter = 0; sketchCounter < sketchesLength; sketchCounter++) {
                currentSketch = this._arrShapes[sketchCounter];
                hitResult = currentSketch._intermediatePath.hitTest(canvasPoint);
                if (hitResult !== null && typeof hitResult !== "undefined") {
                    childIndex = canvasChildren.indexOf(currentSketch._intermediatePath);
                    if (childIndex > highestZIndex) {
                        highestZIndex = childIndex;
                        sketchUnderPoint = currentSketch;
                    }
                }
            }
            if (sketchUnderPoint !== null && sketchUnderPoint.model.getData().nType === WhiteboardTool.Views.ShapeType.Text) {
                for (selectedShapesCnt = selectedShapesLen - 1; selectedShapesCnt >= 0; selectedShapesCnt--) {
                    selectedShapes[selectedShapesCnt].deselect();
                }
                //delay is used to call code inside function after setting focus to shape which is asynchronous
                _.delay(_.bind(function() {
                    sketchUnderPoint.trigger("text-double-click");
                    this._enableTabs(false);
                }, this), 0);
            }
        },

        "_onBackgroundClick": function(event) {
            event.stopPropagation();
            var selectedBackground = this._selectedBackground,
                currentBgName = $(event.currentTarget).attr("data-image-name"),
                imagePath = WhiteboardTool.Models.Sketchpad.BASE_PATH + "img/tools/common/tools/whiteboard/",
                oldState = {},
                $targetElement = $(event.delegateTarget),
                manager = WhiteboardTool.Views.accManagerView,
                accText = "";

            this._shapeToolbar.hideBackgroundPopup();

            if ($targetElement.hasClass("background-option-selected")) {
                this.triggerSelectTool();
                return;
            }
            $targetElement.parent().find(".background-option-selected").removeClass("background-option-selected");
            $targetElement.addClass("background-option-selected");
            imagePath += "bg-small/";
            imagePath += currentBgName + ".png";
            if (currentBgName === "no-background") {
                if (selectedBackground !== null) {
                    this._onDelete(null, [selectedBackground], false, true);
                }
            } else {
                if (selectedBackground === null) {
                    this._selectedBackground = this.addShapeObject(WhiteboardTool.Views.ShapeType.BackgroundImage);
                    oldState.bRemove = true;
                    oldState.id = this._selectedBackground.getId();

                    this._selectedBackground.model.setOptions({
                        "imageData": imagePath
                    });

                    this._selectedBackground.model.setBoundingBox({
                        "x": WhiteboardTool.Views.PaperScope.view.center.x,
                        "y": WhiteboardTool.Views.PaperScope.view.center.y
                    });
                    this._selectedBackground.draw();
                    this._sendToBack(null, [this._selectedBackground]);
                    this._shapeToolbar.trigger("background-change", {
                        "selectedBackground": this._selectedBackground
                    });
                } else {
                    oldState = this._selectedBackground.model.getCloneData();
                    oldState.id = this._selectedBackground.getId();

                    this._selectedBackground.model.setOptions({
                        "imageData": imagePath
                    });
                    this._selectedBackground.draw();
                    this._updateShapeZIndex();
                    this._shapeToolbar.trigger("background-change", {
                        "selectedBackground": this._selectedBackground
                    });
                }
                this._selectedBackground._savePreviousState(oldState);

                // Set the current action name to be transform. Used in undo redo while saving states of shape.
                this._setCurrentActionName(WhiteboardTool.Views.UndoRedoActions.Add);
                // Save the data into the stack, as we have all data ready to extract.
                this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand([this._selectedBackground]));
            }

            if (WhiteboardTool.Views.isAccessible) {
                accText = manager.getAccMessage("whiteboard-canvas-fakediv", 0, [manager.getAccMessage($targetElement.attr("id"), 0)]);
                this.enableCanvasFakediv(accText, "whiteboard-canvas-fakediv");
            }


            this.triggerSelectTool();

        },

        "enableCanvasFakediv": function(accText, fakeDivId) {
            if (!WhiteboardTool.Views.isAccessible) {
                return;
            }
            var managerView = WhiteboardTool.Views.accManagerView,
                $selector = this.$("#" + fakeDivId),
                prevText = $selector.find(".acc-read-elem ").text(),
                onFocusIn = _.bind(function() {
                    this.onFakeDivFocusIn(fakeDivId);
                }, this),
                onFocusOut = _.bind(function() {
                    this.disbaleCanvasFakediv(fakeDivId);
                }, this),
                DELAY = 30; //delay for set focus

            this._removeAccFocusRect();
            if (typeof accText !== "undefined" && accText !== null) { //acctext can be string
                if (prevText === accText) {
                    accText += " ";
                }
                managerView.setAccMessage(fakeDivId, accText);
            }

            managerView.setTabIndex(fakeDivId, managerView.getTabIndex("shape-tool-focus-rect") - 1);

            managerView.setFocus("whiteboard-temp-focus");
            managerView.setFocus(fakeDivId, DELAY);

            this.$("#" + fakeDivId).one("focusin", onFocusIn)
                .one("focusout", onFocusOut);

            $selector.on("keydown", this.canvasFakeDivkeyPressRef);
        },

        "onFakeDivFocusIn": function(fakeDivId) {
            var $selector = this.$("#" + fakeDivId),
                position = [Number($selector.css("left").replace("px", "")), Number($selector.css("top").replace("px", ""))],
                MULTIPLIER = 2,
                size = [$selector.css("width").replace("px", "") - MULTIPLIER * Number($selector.css("left").replace("px", "")),
                    $selector.css("height").replace("px", "") - MULTIPLIER * Number($selector.css("top").replace("px", ""))
                ];
            this._removeAccFocusRect();
            //draw focus div on canvas
            this._drawAccFocusRect(position, size);
            this._redraw();
        },

        "disbaleCanvasFakediv": function(fakeDivId) {
            WhiteboardTool.Views.accManagerView.enableTab(fakeDivId, false);
            this.$("#" + fakeDivId).off("keydown", this.canvasFakeDivkeyPressRef);
            this._removeAccFocusRect();

            if (this._addingObj) {
                this.remove([this._addingObj]);
                this._addingObj.destroy();
                this._addingObj = null;
                this.unbindMouseMove();
                this._redraw();
            }
        },

        "canvasFakeDivkeyPress": function(event) {
            var keyCode = event.keyCode,
                SketchpadModel = WhiteboardTool.Models.Sketchpad,
                DELTA = 10,
                isArrowPressed = false,
                managerView = WhiteboardTool.Views.accManagerView,
                shapeType = WhiteboardTool.Views.ShapeType,
                drawingTool = WhiteboardTool.Views.DrawingTool,
                delta = {
                    "x": 0,
                    "y": 0
                },
                mouseEvent = {
                    "event": {
                        "which": 1,
                        "triggered": true
                    }
                },
                dataPts, lastPt;
            event = event || {};
            if ([shapeType.CanvasPan, shapeType.Polygon].indexOf(drawingTool) > -1) {
                switch (keyCode) {
                    case SketchpadModel.LEFT_ARROW_KEY:
                        isArrowPressed = true;
                        delta = new WhiteboardTool.Models.Point({
                            "x": -DELTA,
                            "y": 0
                        });
                        break;
                    case SketchpadModel.RIGHT_ARROW_KEY:
                        isArrowPressed = true;
                        delta = new WhiteboardTool.Models.Point({
                            "x": DELTA,
                            "y": 0
                        });
                        break;
                    case SketchpadModel.TOP_ARROW_KEY:
                        isArrowPressed = true;
                        delta = new WhiteboardTool.Models.Point({
                            "x": 0,
                            "y": -DELTA
                        });
                        break;
                    case SketchpadModel.BOTTOM_ARROW_KEY:
                        isArrowPressed = true;
                        delta = new WhiteboardTool.Models.Point({
                            "x": 0,
                            "y": DELTA
                        });
                        break;
                }
                if (drawingTool === shapeType.Polygon && this._addingObj) {
                    dataPts = this._addingObj.model.getFedPoints();
                    lastPt = dataPts[dataPts.length - 1];
                    mouseEvent.point = new WhiteboardTool.Views.PaperScope.Point({
                        "x": lastPt.x + delta.x,
                        "y": lastPt.y + delta.y
                    });
                }
                if (isArrowPressed) {
                    if (drawingTool === shapeType.Polygon) {
                        WhiteboardTool.Views.PaperScope.tool.fire("mousemove", mouseEvent);
                    } else {
                        event.delta = delta;
                        this._onCanvasPan(event);
                        this._onCanvasPanEnd(event);
                    }
                } else if (drawingTool === shapeType.Polygon && [SketchpadModel.ENTER_KEY, SketchpadModel.SPACE_BAR_KEY].indexOf(keyCode) > -1) {
                    WhiteboardTool.Views.PaperScope.tool.fire("mousedown", mouseEvent);
                    WhiteboardTool.Views.PaperScope.tool.fire("mouseup", mouseEvent);
                    mouseEvent.point.x += 10;
                    WhiteboardTool.Views.PaperScope.tool.fire("mousemove", mouseEvent);
                }
            } else if (keyCode === SketchpadModel.ENTER_KEY || keyCode === SketchpadModel.SPACE_BAR_KEY) { // this code is for multiple shape selection
                if (this.$('#delete-shape').is(':visible')) {
                    managerView.setTabIndex('delete-shape', managerView.getTabIndex("shape-tool-focus-rect") - 1);
                    managerView.setFocus('delete-shape', 10);
                }
            }
            WhiteboardTool.Views.PaperScope.view.draw();
        },

        "addShapeObject": function(shapeType) {
            return this.addShape(this.getShapeObject(shapeType));
        },

        "addShape": function(shapeObj) {
            var LAYERS_NAME = WhiteboardTool.Models.Sketchpad.LAYERS_NAME,
                zIndex = 0,
                layerName = LAYERS_NAME.SHAPE;

            shapeObj.on("equation-complete", this._onEquationComplete, this)
                .on("select", this._onShapeSelect, this)
                .on("deselect", this._onShapeDeselect, this)
                .on("image-drawing-complete", this._setTouchEndData, this)
                .on("shape-delete", this._onDelete, this)
                .on("update-index", this._updateImageIndex, this)
                .on("show-preloader", this.showPreloader, this)
                .on("hide-preloader", this.hidePreloader, this)
                .on("image-render", this.onImageRender, this)
                .on("image-loaded", this.updateObservableUniverse, this)
                .on("bind-bounds-handle-events", this._bindBoundsHandleEvents, this)
                .on("activate-layer", this.activateLayer, this)
                .on("setAccDivPosition", this.setShapeAccDivPosition, this)
                .on("bindMouseMove", this.bindMouseMove, this)
                .on("unbindMouseMove", this.unbindMouseMove, this);
            this._arrShapes.push(shapeObj);
            this._reArrangeShape();
            if (shapeObj.model.get('_data').nType === WhiteboardTool.Views.ShapeType.Image) {
                layerName = LAYERS_NAME.IMAGE;
            }
            zIndex = Math.max(this.projectLayers[layerName].children.length - 1, this._arrShapes.indexOf(shapeObj));
            shapeObj.model.setOptions({
                "zIndex": zIndex
            });
            return shapeObj;
        },
        "showPreloader": function(name, position) {
            this.activateLayer(WhiteboardTool.Models.Sketchpad.LAYERS_NAME.SERVICE);
            var PaperScope = WhiteboardTool.Views.PaperScope,
                preloader = new PaperScope.Path.Arc(0, Math.PI, 1.5 * Math.PI, 5), //(0, Math.PI)-from point,(1.5* Math.PI,5)-through Point, (0,0)-to point(default)
                $dropIn = this.$(".text-tool-drop-in"),
                ROTATE_ANGLE = 10;

            PaperScope.view.onFrame = function() {
                preloader.rotate(ROTATE_ANGLE);
            };
            preloader.position.x = position.x;
            preloader.position.y = position.y;
            preloader.strokeColor = "#000";
            preloader.strokeWidth = 3;
            if (!this._preloader) {
                this._preloader = {};
            }
            this._preloader[name] = preloader;

            if (!$dropIn.is(":visible")) {
                $dropIn.show();
            }
            this.activateLayer();
        },


        "hidePreloader": function(name) {
            if (this._preloader && this._preloader[name]) {
                this._preloader[name].remove();
                delete this._preloader[name];

                if (Object.getOwnPropertyNames(this._preloader).length === 0) {
                    this.$(".text-tool-drop-in").hide();
                }
            }
        },
        "onImageRender": function(imageObj) {
            if (imageObj) {
                imageObj.select();
                var accDivObject, $shapeAccDiv;
                for (accDivObject in this._accdivObjectMapping) {
                    if (this._accdivObjectMapping[accDivObject] === imageObj) {
                        $shapeAccDiv = this.$("#" + accDivObject).parent(".shape-focusdiv");
                        break;
                    }
                }
                this.setAccDivPosition($shapeAccDiv, true);


                //set zindex of shape in array
                this._zIndexofShapes.push({
                    "id": imageObj.getId(),
                    "zIndex": this.projectLayers[WhiteboardTool.Models.Sketchpad.LAYERS_NAME.IMAGE].children.indexOf(imageObj._intermediatePath)
                });

                //set bSelected to false if pen is drawn
                imageObj._updateCurrentState({
                    "bSelected": true
                });
                this._curShapeTool = WhiteboardTool.Views.ShapeType.None;
                WhiteboardTool.Views.CurTool = WhiteboardTool.Views.ShapeType.None;
                this._updateCanvasCursor(WhiteboardTool.Views.ShapeType.None);
                this._shapeToolbar.selectTool({
                    "tool-type": WhiteboardTool.Views.ShapeType.None,
                    "tool-group": "2",
                    "bFireEvent": false
                });

                if (WhiteboardTool.Views.isAccessible) { //Create acc divs if accessibility is on.
                    this._createAccessibilityDivs(this._addingObj);
                }

                // Set the current action name to be transform. Used in undo redo while saving states of shape.
                this._setCurrentActionName(WhiteboardTool.Views.UndoRedoActions.Add);
                // Save the data into the stack, as we have all data ready to extract.
                this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand([imageObj]));
            }
        },
        "_showConfirmBox": function() {
            var $whiteboardToolPopup = this.$("#whiteboard-tool-popup");
            $whiteboardToolPopup.modal();
            $whiteboardToolPopup.find(".beta-functionality-param-container").hide();
            $whiteboardToolPopup.find(".resetBoard-param-container").show();
            $whiteboardToolPopup.find(".btn-cancel").show();
        },

        "resetToolState": function() {
            var resetToolStateObject = this.model.get("resetToolState"),
                currentStateObject = this.getSyncData(),
                undoRedoData = {},
                setFocus = function setFocus() {
                    if (WhiteboardTool.Views.isAccessible) {
                        WhiteboardTool.Views.accManagerView.setFocus("math-title-text-7");
                    }
                },

                resetToolFunct = _.bind(function resetToolFunct() {
                    undoRedoData.oldState = {
                        "toolState": this.getSyncData()
                    };

                    this.loadState(resetToolStateObject);

                    undoRedoData.newState = {
                        "toolState": this.getSyncData()
                    };
                    undoRedoData.actionName = WhiteboardTool.Views.UndoRedoActions.Reset;
                    this._saveToUndoRedoStack(undoRedoData);
                    this.setDocumentClean();

                    setFocus();
                    this._updateEditOption();
                }, this),

                getProperData = _.bind(function(data) {
                    //neglect grid-data for comparing tool state
                    var cloneData = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(data);
                    if (cloneData && cloneData.origin_data && cloneData.origin_data.graphData) {
                        cloneData.origin_data.graphData = {};
                    }
                    return cloneData;
                }, this);


            if (MathUtilities.Components.Utils.Models.Utils.isEqual(getProperData(resetToolStateObject), getProperData(currentStateObject))) {
                setFocus();
            } else {
                this._showCustomPopup("reset-screen", resetToolFunct, setFocus);
            }
        },

        "remove": function(arrShapesToDelete, bSaveState) {

            var curShape = null,
                indexToDelete = -1,
                data = null;

            while (arrShapesToDelete.length > 0) {
                curShape = arrShapesToDelete[0];
                data = curShape.model.getData();

                indexToDelete = this._arrShapes.indexOf(curShape);

                curShape.remove(bSaveState);

                if (data.nType === WhiteboardTool.Views.ShapeType.BackgroundImage) {
                    this._selectedBackground = null;
                }

                if (indexToDelete !== -1) {
                    this._arrShapes.splice(indexToDelete, 1);
                }

                indexToDelete = arrShapesToDelete.indexOf(curShape);
                if (indexToDelete !== -1) {
                    arrShapesToDelete.splice(indexToDelete, 1);
                }
            }

            return true;
        },

        /**
         * Fires when the delete button is pressed on toolbar.
         * @event _onDelete
         * @params {Object} eventObject -- Event object that let the change in current tool.
         * @param {Array} arrSelectedShapes shape to be delete.
         * @param {Boolean} supressStackRegister, check to prevent undoManager register.
         * @param {Boolean} supressSelectTrigger, check to prevent select tool selection.
         * @private
         */
        "_onDelete": function(eventObject, arrSelectedShapes, supressStackRegister, supressSelectTrigger) {
            //Return if send-to-back button is disabled
            if (eventObject && $(eventObject.delegateTarget).children(".right-menu-item-icon").hasClass("button-disabled")) {
                return;
            }

            var shapeCounter = 0,
                clonedArrSelectedShapes,
                selectedShapeCounter = null,
                accdivToDeleteNumber = null,
                accDivObject = null,
                shapeLen = this._arrShapes.length,
                selectedShapeLen, accManager = WhiteboardTool.Views.accManagerView;

            if (typeof arrSelectedShapes === "undefined") {
                arrSelectedShapes = [];
                for (; shapeCounter < shapeLen; shapeCounter++) {
                    selectedShapeLen = this._arrSelectedShapes.length;
                    for (selectedShapeCounter = 0; selectedShapeCounter < selectedShapeLen; selectedShapeCounter++) {
                        if (this._arrShapes[shapeCounter] === this._arrSelectedShapes[selectedShapeCounter]) {
                            arrSelectedShapes[arrSelectedShapes.length] = this._arrSelectedShapes[selectedShapeCounter];
                        }
                    }
                }
            }

            if (arrSelectedShapes.length > 0) {
                clonedArrSelectedShapes = MathUtilities.Components.Utils.Models.Utils.getCloneOf(arrSelectedShapes);
                if (WhiteboardTool.Views.isAccessible) {
                    for (accDivObject in this._accdivObjectMapping) {
                        shapeLen = arrSelectedShapes.length;
                        for (selectedShapeCounter = 0; selectedShapeCounter < shapeLen; selectedShapeCounter++) {
                            if (this._accdivObjectMapping[accDivObject] === arrSelectedShapes[selectedShapeCounter]) {
                                accdivToDeleteNumber = this._getAccDivNumber(this.$("#" + accDivObject).parent(".shape-focusdiv"));
                                delete this._accdivObjectMapping[accDivObject]; //Remove canvas shape and acc div mapping
                                this.$("[shape-focusdiv-number=" + accdivToDeleteNumber + "]").parent(".focusDivContainer").remove();
                                break;
                            }
                        }
                    }
                }

                this.remove(arrSelectedShapes, true);

                this._clearShapeSelection();
                this._redraw();

                // Set the current action name to be transform. Used in undo redo while saving states of shape.
                this._setCurrentActionName(WhiteboardTool.Views.UndoRedoActions.Remove);
                if (WhiteboardTool.Views.DrawingTool === WhiteboardTool.Views.ShapeType.None) {
                    this._commonPropertiesToolbar.hide();
                }

                if (supressStackRegister !== true) {
                    // Save the data into the stack, as we have all data ready to extract.
                    this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand(clonedArrSelectedShapes));
                }
                if (supressSelectTrigger !== true) {
                    this.$("#select-tool").trigger("click");
                    if (WhiteboardTool.Views.isAccessible) {
                        accManager.setAccMessage("whiteboard-temp-focus", accManager.getAccMessage("delete-shape", 1));
                        accManager.setFocus("whiteboard-temp-focus");
                        accManager.setFocus("shape-tool-focus-rect", 60);
                    }
                }
            }
        },

        "_currentEvents": null,

        /**
         * Gets called when mouse down or touch start occurs based on device/browser used.
         * @method _onTouchStart
         * @params Paper mouse/touch event object.
         * @private
         */
        "_onTouchStart": function(eventObject) {
            if (eventObject.event.which === 3) { //3 for mouse right button click
                return;
            }
            var selectionObj = null,
                selectedShapeCounter = 0,
                curShape,
                selectedShapes = null,
                data,
                selectedshapesCount = null,
                selectedHandlerObj = null,
                shapeDimension = null;

            this._removeAccFocusRect();

            this.$("#change-opacity-text-box").blur();

            if (this.gridGraph._scrollBarManager.isScrollHit(eventObject.point) ||
             this._currentEvents !== null || eventObject.event.changedTouches !== void 0 && eventObject.event.changedTouches.length > 1) {
                return;
            }
            this._currentEvents = eventObject;


            this._bHasTouchOccurred = true;
            selectionObj = this._getShapeUnderCords(eventObject.point);
            if (selectionObj && selectionObj.model.getData().nType === WhiteboardTool.Views.ShapeType.BackgroundImage) {
                selectionObj = null;
            }

            //Set current shape tool to select tool when cancel is clicked on file input dialog box
            if (eventObject.type !== "user-trigger" && this._curShapeTool === WhiteboardTool.Views.ShapeType.Image) {
                this._curShapeTool = WhiteboardTool.Views.ShapeType.None;
                $("input:file:last").remove();
            }

            //If touchstart occur on shape and if shape is selected then it should act like select tool. That is, it should allow transformation.
            if (selectionObj && selectionObj.model.getData().bSelected) {
                WhiteboardTool.Views.DrawingTool = WhiteboardTool.Views.ShapeType.None;
            } else {
                WhiteboardTool.Views.DrawingTool = this._curShapeTool;
                selectedHandlerObj = this._getShapeUnderHandler(eventObject.point);
                if (selectedHandlerObj !== null) {
                    selectionObj = selectedHandlerObj;
                }
            }

            //if touchstart occur on canvas,if select tool is canvas-pan then it should return
            if (WhiteboardTool.Views.DrawingTool === WhiteboardTool.Views.ShapeType.CanvasPan) {
                return;
            }

            // If shape is hit then dragStart for the hit shape.
            if (WhiteboardTool.Views.DrawingTool === WhiteboardTool.Views.ShapeType.None) {
                if (selectionObj) {
                    this._setHitShape(selectionObj);
                    selectionObj.handleDragStart(eventObject);

                    if (selectionObj.model.getData().bSelected) { //Drag start only if shape is selected
                        // Give drag start to all selected shapes, so all can start their movement if any
                        selectedShapes = this._arrSelectedShapes;
                        selectedshapesCount = selectedShapes.length;

                        for (; selectedShapeCounter < selectedshapesCount; selectedShapeCounter++) {
                            curShape = selectedShapes[selectedShapeCounter];

                            //if shape is selected den stop repetitive handleDragStart
                            if (curShape !== selectionObj) {
                                curShape.handleDragStart(eventObject);
                            }
                        }
                    }
                } else {
                    this._handleDragSelectionStart(eventObject);
                    if (this._arrSelectedShapes.length === 0) {
                        if (this._commonPropertiesToolbar.isVisible()) {
                            this._commonPropertiesToolbar.hide({
                                "supressEvent": true
                            });
                        }
                    } else {
                        this._commonPropertiesToolbar.show(WhiteboardTool.Views.MenuItems[WhiteboardTool.Views.MenuBarType.Select], WhiteboardTool.Views.templates);
                    }
                }
            } else {
                // Check to see if we have current object being used on.
                if (WhiteboardTool.Views.DrawingTool !== WhiteboardTool.Views.ShapeType.BackgroundImage) {
                    if (!this._addingObj) {
                        this._clearShapeSelection();
                        if (WhiteboardTool.Views.DrawingTool !== WhiteboardTool.Views.ShapeType.Image) {
                            this._addingObj = this.addShapeObject(WhiteboardTool.Views.DrawingTool);
                        } else {
                            this._addingObj = this._imageView;
                        }
                        data = {
                            "strFillColor": this._currentFillColor,
                            "nStrokeWidth": this._currentStrokeWidth,
                            "strStrokeColor": this._currentStrokeColor
                        };
                        //Update eventObject points depending on width and height of shape so as to place shape in the center
                        if (WhiteboardTool.Views.isAccessible || this._addingObj.model.getData().nType === WhiteboardTool.Views.ShapeType.Image) {
                            shapeDimension = this._addingObj.model.getData().shapeDimension;
                            eventObject.point.x -= shapeDimension.width / 2;
                            eventObject.point.y -= shapeDimension.height / 2;
                        }
                        this._addingObj.setOptions(data);
                    }
                    if (WhiteboardTool.Views.DrawingTool === WhiteboardTool.Views.ShapeType.Polygon) {
                        this._commonPropertiesToolbar.hide();
                    }
                    this._addingObj.processTouchStart(eventObject);
                }
            }
        },

        "_createAccessibilityDivs": function(curShape, setFocus) {
            if (WhiteboardTool.Views.isAccessible === false) {
                return;
            }
            curShape = curShape || this._arrSelectedShapes[0];
            if (!curShape) {
                return;
            }
            var managerView = WhiteboardTool.Views.accManagerView,
                data = curShape.model.getData(),
                boundingBox = curShape.model.getBoundingBox(),
                shapeFocusDiv = null,
                shapeAttributes = null,
                resizeHandlerFocusDiv = null,
                resizeAttributes = null,
                rotateHandlerFocusDiv = null,
                rotateAttributes = null,
                accShapeObj = null,
                accResizeHandlerObj = null,
                accRotateHandlerObj = null,
                canvasOffset = null,
                focusPadding = WhiteboardTool.Models.Sketchpad.ACC_DIV_PADDING,
                shapeFocusdivNum = null,
                $lastFocusdiv = null,
                shapeFocusdivTabIndex = null,
                accText = this._getShapeFocuDivText(data.nType),
                flipData = curShape.model.getFlipData(),
                curShapeType = data.nType,
                ShapeType = WhiteboardTool.Views.ShapeType,
                allowResize = true,
                allowRotate = true,
                onShapeFocusIn = null,
                onResizeFocusIn = null,
                onRotateFocusIn = null,
                TAB_DIFF = 40,
                PADDING = 8,
                ROTATE_HANDLE_SIZE = 21;

            if ([ShapeType.Pencil, ShapeType.BackgroundImage, ShapeType.Text].indexOf(curShapeType) > -1) {
                allowResize = false;
            }
            if (curShapeType === ShapeType.BackgroundImage || curShapeType === ShapeType.LineSegment) {
                allowRotate = false;
            }

            //Create focus div of shape when accessibility is on.
            if (this.$(".shape-focusdiv").length > 0) {
                $lastFocusdiv = this.$(".shape-focusdiv:last");
                shapeFocusdivTabIndex = Number(managerView.getTabIndex($lastFocusdiv.find(".shapeChild").attr("id"))) + TAB_DIFF;
                shapeFocusdivNum = Number($lastFocusdiv.attr("shape-focusdiv-number")) + 1;
                $lastFocusdiv.removeClass("last").removeClass("selected item-selected");
            } else {
                shapeFocusdivTabIndex = 120;
                shapeFocusdivNum = 1;
            }
            canvasOffset = this.$("#whiteboard #whiteboard-canvas-container").offset();
            if (curShapeType === ShapeType.LineSegment) {
                focusPadding = 1;
            }
            shapeAttributes = {
                "width": boundingBox.width + flipData.x * (focusPadding * 2 + data.nStrokeWidth),
                "height": boundingBox.height + flipData.y * (focusPadding * 2 + data.nStrokeWidth),
                "left": canvasOffset.left + boundingBox.x - flipData.x * (focusPadding + data.nStrokeWidth / 2),
                "top": canvasOffset.top + boundingBox.y - flipData.y * (focusPadding + data.nStrokeWidth / 2)
            };

            resizeAttributes = {
                "width": "16",
                "height": "16",
                "left": canvasOffset.left + boundingBox.x + boundingBox.width + flipData.x * (data.nStrokeWidth / 2) - PADDING,
                "top": canvasOffset.top + boundingBox.y + boundingBox.height + flipData.y * (data.nStrokeWidth / 2) - PADDING
            };
            rotateAttributes = {
                "width": "16",
                "height": "16",
                "left": canvasOffset.left + boundingBox.x + boundingBox.width / 2 - PADDING,
                "top": canvasOffset.top + boundingBox.y - flipData.y * (data.nStrokeWidth / 2 + ROTATE_HANDLE_SIZE) - PADDING
            };

            this.$("#whiteboard").append(WhiteboardTool.Views.templates["canvas-focus"]({
                "num": shapeFocusdivNum,
                "bAllowResize": allowResize,
                "bAllowRotate": allowRotate,
                "shapeAttr": shapeAttributes,
                "rotateAttr": rotateAttributes,
                "resizeAttr": resizeAttributes
            }).trim());

            shapeFocusDiv = this.$("#whiteboard #shapeFocusDiv" + shapeFocusdivNum);
            shapeFocusDiv.on("keydown", _.bind(this._onShapeKeyPress, this));

            accShapeObj = {
                "elementId": "shapeChild" + shapeFocusdivNum,
                "type": "text",
                "tabIndex": shapeFocusdivTabIndex,
                "acc": accText.shapeText
            };
            managerView.createAccDiv(accShapeObj);
            if (setFocus !== false) {
                managerView.setFocus("shapeChild" + shapeFocusdivNum, 0);
            }
            this._accdivObjectMapping["shapeChild" + shapeFocusdivNum] = curShape;
            onShapeFocusIn = _.bind(function() {
                this._onAccDivFocusIn("#shapeChild" + shapeFocusdivNum);
            }, this);
            managerView.focusIn("shapeChild" + shapeFocusdivNum, onShapeFocusIn);

            //Create focus div of shape's resize handler.
            if (allowResize) {
                resizeHandlerFocusDiv = this.$("#whiteboard #resizeHandlerFocusDiv" + shapeFocusdivNum);
                resizeHandlerFocusDiv.on("keydown", _.bind(this._onResizeKeyPress, this));

                accResizeHandlerObj = {
                    "elementId": "resizeHandlerFocusDiv" + shapeFocusdivNum,
                    "type": "text",
                    "tabIndex": -1,
                    "acc": accText.resizeText
                };
                managerView.createAccDiv(accResizeHandlerObj);
                onResizeFocusIn = _.bind(function() {
                    this._onAccDivFocusIn("#resizeHandlerFocusDiv" + shapeFocusdivNum);
                }, this);
                managerView.focusIn("resizeHandlerFocusDiv" + shapeFocusdivNum, onResizeFocusIn);
            }

            //Create focus div of shape's rotate handler.
            if (allowRotate) {
                rotateHandlerFocusDiv = this.$("#whiteboard #rotateHandlerFocusDiv" + shapeFocusdivNum);
                rotateHandlerFocusDiv.on("keydown", _.bind(this._onRotateKeyPress, this));

                accRotateHandlerObj = {
                    "elementId": "rotateHandlerFocusDiv" + shapeFocusdivNum,
                    "type": "text",
                    "tabIndex": -1,
                    "acc": accText.rotateText
                };
                managerView.createAccDiv(accRotateHandlerObj);
                onRotateFocusIn = _.bind(function() {
                    this._onAccDivFocusIn("#rotateHandlerFocusDiv" + shapeFocusdivNum);
                }, this);
                managerView.focusIn("rotateHandlerFocusDiv" + shapeFocusdivNum, onRotateFocusIn);
            }

            this.$("#resizeHandlerFocusDiv" + shapeFocusdivNum + ", #rotateHandlerFocusDiv" + shapeFocusdivNum)
                .on("keydown", _.bind(this.shapePropertyKeyPress, this));
            this.$(".accFocusDiv, .whiteboard-non-selectable-labels").on("focusout", _.bind(this._removeAccFocusRect, this));
        },
        "_drawAccFocusRect": function(position, size) {
            var path,
                LAYERS_NAME = WhiteboardTool.Models.Sketchpad.LAYERS_NAME;

            this.activateLayer(LAYERS_NAME.SERVICE);
            path = new WhiteboardTool.Views.PaperScope.Path.Rectangle({
                "point": position,
                "size": size,
                "strokeColor": "#000",
                "dashArray": [4, 2], //dash ratio, for every 4px line 2px blank.
                "name": "canvasAccFocus"
            });
            this.activateLayer(LAYERS_NAME.SHAPE);
            return path;
        },
        "_removeAccFocusRect": function() {
            var canvasAccFocus = this.projectLayers[WhiteboardTool.Models.Sketchpad.LAYERS_NAME.SERVICE].children.canvasAccFocus;
            if (canvasAccFocus) {
                canvasAccFocus.remove();
                this._redraw();
            }
        },

        "_onAccDivFocusIn": function(selector) {
            var shapeFocusdivNum = null,
                $selectorParent = null;

            if ($(selector).hasClass("shapeChild")) {
                this._disableShapeProperties(this._arrShapes);
                $selectorParent = $(selector).parent(".accFocusDiv");
                shapeFocusdivNum = $selectorParent.attr("shape-focusdiv-number");
                this._clearShapeSelection();
                this._shapeSelectOnAccDivFocusIn(shapeFocusdivNum);
            }
            this._drawAccDivInCanvas(selector);
        },

        "_drawAccDivInCanvas": function(selector) {
            var shapeFocusdivNum = null,
                canvasOffset = this.$("#whiteboard #whiteboard-canvas-container").offset(),
                $selectorParent = null,
                position = null,
                size = null,
                path = null,
                shapeAccDiv = null,
                shapeAccDivCenter = null,
                angle = null,
                $selector = $(selector);

            //Remove previous acc focus
            this._removeAccFocusRect();

            if ($selector.hasClass("shapeChild")) {
                $selectorParent = $selector.parent(".accFocusDiv");
                shapeFocusdivNum = $selectorParent.attr("shape-focusdiv-number");
                position = [Number($selectorParent.attr("left")) - canvasOffset.left, Number($selectorParent.attr("top")) - canvasOffset.top];
                size = [Number($selectorParent.attr("width")), Number($selectorParent.attr("height"))];
            } else {
                shapeFocusdivNum = $selector.attr("shape-focusdiv-number");
                position = [Number($selector.attr("left")) - canvasOffset.left, Number($selector.attr("top")) - canvasOffset.top];
                size = [Number($selector.attr("width")), Number($selector.attr("height"))];
            }

            path = this._drawAccFocusRect(position, size);

            //Rotate Canvas Acc Div

            angle = this._arrSelectedShapes[0] ? this._arrSelectedShapes[0].model.getData().nRotation : 0;
            shapeAccDiv = this.$(".shape-focusdiv[shape-focusdiv-number=" + shapeFocusdivNum + "]");
            shapeAccDivCenter = [Number(shapeAccDiv.attr("left")) + Number(shapeAccDiv.attr("width")) / 2 - canvasOffset.left, Number(shapeAccDiv.attr("top")) + Number(shapeAccDiv.attr("height")) / 2 - canvasOffset.top];
            path.rotate(angle, shapeAccDivCenter);
            this._redraw();
        },

        "_getShapeFocuDivText": function(nType) {
            var manager = WhiteboardTool.Views.accManagerView,
                ShapeType = WhiteboardTool.Views.ShapeType,
                accText = {
                    "shapeText": "",
                    "resizeText": "",
                    "rotateText": "",
                    "opacityLabelText": "",
                    "rotateLabelText": ""
                },
                shapeText = this._getShapeText(nType);
            if (nType === ShapeType.Text) {
                accText.shapeText = manager.getAccMessage("shapeFocusRect", 1, [shapeText, shapeText, shapeText, shapeText]);

            } else {
                accText.shapeText = manager.getAccMessage("shapeFocusRect", 0, [shapeText, shapeText, shapeText]);
            }
            accText.resizeText = manager.getAccMessage("resizeText", 0, [shapeText]);
            accText.rotateText = manager.getAccMessage("rotateText", 0, [shapeText]);
            accText.opacityLabelText = manager.getAccMessage("fill-opacity-text", 0, [shapeText]);
            accText.rotateLabelText = manager.getAccMessage("rotate-shape-text", 0, [shapeText]);

            return accText;
        },
        "_getShapeText": function(nType) {
            var manager = WhiteboardTool.Views.accManagerView,
                ShapeType = WhiteboardTool.Views.ShapeType,
                shapeText = "";

            switch (nType) {
                case ShapeType.Arrow:
                    shapeText = manager.getAccMessage("arrow-shape", 0);
                    break;
                case ShapeType.Circle:
                    shapeText = manager.getAccMessage("circle-shape", 0);
                    break;
                case ShapeType.Ellipse:
                    shapeText = manager.getAccMessage("ellipse-shape", 0);
                    break;
                case ShapeType.Triangle:
                    shapeText = manager.getAccMessage("etriangle-shape", 0);
                    break;
                case ShapeType.RightTriangle:
                    shapeText = manager.getAccMessage("rtriangle-shape", 0);
                    break;
                case ShapeType.Trapezium:
                    shapeText = manager.getAccMessage("trapezoid-shape", 0);
                    break;
                case ShapeType.Square:
                    shapeText = manager.getAccMessage("square-shape", 0);
                    break;
                case ShapeType.Rectangle:
                    shapeText = manager.getAccMessage("rectangle-shape", 0);
                    break;
                case ShapeType.Parallelogram:
                    shapeText = manager.getAccMessage("parallelogram-shape", 0);
                    break;
                case ShapeType.Pentagon:
                    shapeText = manager.getAccMessage("pentagon-shape", 0);
                    break;
                case ShapeType.Hexagon:
                    shapeText = manager.getAccMessage("hexagon-shape", 0);
                    break;
                case ShapeType.LineSegment:
                    shapeText = manager.getAccMessage("tool-type", 1);
                    break;
                case ShapeType.Image:
                    shapeText = manager.getAccMessage("tool-type", 2);
                    break;
                case ShapeType.Text:
                    shapeText = manager.getAccMessage("tool-type", 3);
                    break;
                case ShapeType.Pencil:
                    shapeText = manager.getAccMessage("tool-type", 4);
                    break;
                case ShapeType.Polygon:
                    shapeText = manager.getAccMessage("tool-type", 5);
                    break;
            }
            return shapeText;
        },

        "_shapeSelectOnAccDivFocusIn": function(shapeFocusdivNum) {
            var canvasShapeObject = this._accdivObjectMapping["shapeChild" + shapeFocusdivNum],
                selectedShapes = this._arrSelectedShapes,
                selectedShapeCount = selectedShapes.length,
                iCounter = 0,
                curShapeType = canvasShapeObject.model.getData().nType;
            if (!canvasShapeObject.isSelected()) {
                for (; iCounter < selectedShapeCount; iCounter++) {
                    selectedShapes[iCounter].deselect();
                }
                canvasShapeObject.model.setOptions({
                    "bAllowSelectionBound": true,
                    "bAllowResize": curShapeType !== WhiteboardTool.Views.ShapeType.Text && curShapeType !== WhiteboardTool.Views.ShapeType.Pencil,
                    "bAllowRotate": curShapeType !== WhiteboardTool.Views.ShapeType.LineSegment
                });
                canvasShapeObject.select();
                this.$(".shape-focusdiv").removeClass("selected item-selected");
                this.$("#shapeFocusDiv" + shapeFocusdivNum).addClass("selected item-selected").removeClass("hovered");
                this._redraw();
            }
            this._enableShapeProperties(false);
        },

        "_handleShapeClick": function(shapeFocusdivNum) {
            this.setShapePropertiesTabIndex(shapeFocusdivNum);
        },

        "shapePropertyKeyPress": function(event) {
            if (event.keyCode === WhiteboardTool.Models.Sketchpad.ESCAPE_KEY) {
                if ($(event.delegateTarget).parent(".more-menu-properties").length) {
                    this._shapeToolbar.hideMoreMenuPopup();
                }
                this._enableShapeProperties(false);
                WhiteboardTool.Views.accManagerView.setFocus("shapeChild" + this.$(".shape-focusdiv.selected").attr("shape-focusdiv-number"));
            }
        },

        "getTransformOrigin": function(selector) {
            var transformOrigin = selector.css("-ms-transform-origin") || selector.css("-webkit-transform-origin") || selector.css("-o-transform-origin") || selector.css("transform-origin");
            return transformOrigin.split(" ");
        },

        "_onShapeKeyPress": function(event) {
            if ([WhiteboardTool.Models.Sketchpad.RIGHT_ARROW_KEY, WhiteboardTool.Models.Sketchpad.LEFT_ARROW_KEY, WhiteboardTool.Models.Sketchpad.TOP_ARROW_KEY, WhiteboardTool.Models.Sketchpad.BOTTOM_ARROW_KEY].indexOf(event.keyCode) > -1) {
                //Stop page scrolling when arrow keys are pressed
                event.preventDefault();
            }
            clearTimeout($.data(this, "timer"));
            //To call this function after manually setting focus on dummy div
            $.data(this, "timer", setTimeout(_.bind(function() {
                this._shapeKeyPress(event);
            }, this), 0));
        },

        "_shapeKeyPress": function(event, $shapeDiv, supressStackRegister) {
            if ([WhiteboardTool.Models.Sketchpad.RIGHT_ARROW_KEY, WhiteboardTool.Models.Sketchpad.LEFT_ARROW_KEY,
                    WhiteboardTool.Models.Sketchpad.TOP_ARROW_KEY, WhiteboardTool.Models.Sketchpad.BOTTOM_ARROW_KEY,
                    WhiteboardTool.Models.Sketchpad.ENTER_KEY, WhiteboardTool.Models.Sketchpad.SPACE_BAR_KEY,
                    WhiteboardTool.Models.Sketchpad.TAB_KEY
                ].indexOf(event.keyCode) === -1) {
                return;
            }

            var translateX = 0,
                translateY = 0,
                translateBy = 10,
                $shapeAccDiv = $shapeDiv || $(event.delegateTarget),
                shapeDivNum = $shapeAccDiv.attr("shape-focusdiv-number"),
                isArrowPressed = false,
                curShape = this._accdivObjectMapping["shapeChild" + shapeDivNum],
                text = typeof curShape !== "undefined" ? this._getShapeFocuDivText(curShape.model.get("_data").nType) : {},
                accText,
                manager = WhiteboardTool.Views.accManagerView,
                keyCode = event.keyCode,
                sketchPadModel = WhiteboardTool.Models.Sketchpad;

            if (keyCode === sketchPadModel.TAB_KEY && $shapeAccDiv.hasClass("last")) {
                this._removeAccFocusRect();
            }
            switch (keyCode) {
                case sketchPadModel.RIGHT_ARROW_KEY:
                    translateX = translateBy;
                    isArrowPressed = true;
                    break;
                case sketchPadModel.LEFT_ARROW_KEY:
                    translateX = -translateBy;
                    isArrowPressed = true;
                    break;
                case sketchPadModel.BOTTOM_ARROW_KEY:
                    translateY = translateBy;
                    isArrowPressed = true;
                    break;
                case sketchPadModel.TOP_ARROW_KEY:
                    translateY = -translateBy;
                    isArrowPressed = true;
                    break;
                case sketchPadModel.ENTER_KEY:
                    manager.setAccMessage("shapeChild" + shapeDivNum, text.shapeText);
                    if (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Text) {
                        //delay is used to call code inside function after setting focus to shape which is asynchronous
                        _.delay(_.bind(function() {
                            this._enableTabs(false);
                            curShape.trigger("text-double-click");
                        }, this), 0);
                    } else {
                        this._handleShapeClick(shapeDivNum);
                    }
                    break;
                case sketchPadModel.SPACE_BAR_KEY:
                    manager.setAccMessage("shapeChild" + shapeDivNum, text.shapeText);
                    this._handleShapeClick(shapeDivNum);
                    break;
                case sketchPadModel.TAB_KEY:
                    manager.setAccMessage("shapeChild" + shapeDivNum, text.shapeText);
                    break;
            }

            if (isArrowPressed) {
                curShape = this._accdivObjectMapping["shapeChild" + shapeDivNum];

                accText = manager.getAccMessage("shapeFocusRect", 2, [this._getShapeText(curShape.model.getData().nType)]);


                this.savePrevState(curShape);

                curShape._applyTranslation(null, translateX, translateY, true);


                this._translateAccDiv(shapeDivNum, {
                    "x": translateX,
                    "y": translateY
                });
                curShape.model.setBackupBoundingBox(curShape.model.getBoundingBox());

                if (typeof $shapeDiv === "undefined") {
                    this._drawAccDivInCanvas(event.delegateTarget);
                    this._reFocusElem("shapeChild" + shapeDivNum, accText, 0);
                }


                this._redraw();
                this.saveCurState(curShape, supressStackRegister);
            }
        },

        "_translateAccDiv": function(shapeDivNum, delta) {
            var $shapeAccDiv = this.$(".shape-focusdiv[shape-focusdiv-number=" + shapeDivNum + "]"),
                $resizeAccDiv = this.$(".resize-focusdiv[shape-focusdiv-number=" + shapeDivNum + "]"),
                $rotateAccDiv = this.$(".rotate-focusdiv[shape-focusdiv-number=" + shapeDivNum + "]");

            $shapeAccDiv.attr({
                "left": delta.x + Number($shapeAccDiv.attr("left")),
                "top": delta.y + Number($shapeAccDiv.attr("top"))
            });
            $resizeAccDiv.attr({
                "left": Number($resizeAccDiv.attr("left")) + delta.x,
                "top": Number($resizeAccDiv.attr("top")) + delta.y
            });
            $rotateAccDiv.attr({
                "left": Number($rotateAccDiv.attr("left")) + delta.x,
                "top": Number($rotateAccDiv.attr("top")) + delta.y
            });
        },
        "getMousePos": function(canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                "x": evt.clientX - rect.left,
                "y": evt.clientY - rect.top
            };
        },

        "_onResizeKeyPress": function(event) {
            if ([WhiteboardTool.Models.Sketchpad.RIGHT_ARROW_KEY, WhiteboardTool.Models.Sketchpad.LEFT_ARROW_KEY, WhiteboardTool.Models.Sketchpad.TOP_ARROW_KEY, WhiteboardTool.Models.Sketchpad.BOTTOM_ARROW_KEY].indexOf(event.keyCode) > -1) {
                //Stop page scrolling when arrow keys are pressed
                event.preventDefault();
            }
            clearTimeout($.data(this, "timer"));
            //To call this function after manually setting focus on dummy div.
            $.data(this, "timer", setTimeout(_.bind(function() {
                this._resizeKeyPress(event);
            }, this), 0));
        },

        "_resizeKeyPress": function(event) {
            if ([WhiteboardTool.Models.Sketchpad.RIGHT_ARROW_KEY, WhiteboardTool.Models.Sketchpad.LEFT_ARROW_KEY, WhiteboardTool.Models.Sketchpad.TOP_ARROW_KEY, WhiteboardTool.Models.Sketchpad.BOTTOM_ARROW_KEY, WhiteboardTool.Models.Sketchpad.TAB_KEY].indexOf(event.keyCode) === -1) {
                return;
            }
            var curShape = this._arrSelectedShapes[0],
                boundingBox = curShape.model.getBoundingBox(),
                resizeHandler = event.delegateTarget,
                shapeDivNum = $(resizeHandler).attr("shape-focusdiv-number"),
                $shapeAccDiv = this.$(".shape-focusdiv[shape-focusdiv-number=" + shapeDivNum + "]"),
                $rotateAccDiv = this.$(".rotate-focusdiv[shape-focusdiv-number=" + shapeDivNum + "]"),
                managerView = WhiteboardTool.Views.accManagerView,
                INCREASE_BY = 10,
                sketchPadModel = WhiteboardTool.Models.Sketchpad,
                focusPadding = sketchPadModel.ACC_DIV_PADDING,
                flipDirection = null,
                data = curShape.model.getData(),
                isArrowPressed = false,
                resizeX = 0,
                resizeY = 0,
                isSpecialShape = false,
                shapeNType = curShape.model.getData().nType,
                text, accText,
                keyCode = event.keyCode,
                ROTATE_TOP_PADDING = 54,
                PADDING = 27;


            if ([WhiteboardTool.Views.ShapeType.Circle, WhiteboardTool.Views.ShapeType.Square, WhiteboardTool.Views.ShapeType.Triangle, WhiteboardTool.Views.ShapeType.Pentagon, WhiteboardTool.Views.ShapeType.Hexagon].indexOf(shapeNType) > -1) {
                isSpecialShape = true;
            }

            switch (keyCode) {
                case sketchPadModel.RIGHT_ARROW_KEY:
                    this.savePrevState();
                    resizeX = INCREASE_BY;
                    if (isSpecialShape === true) {
                        if (boundingBox.width >= 0) {
                            if (boundingBox.height >= 0) {
                                resizeY = INCREASE_BY;
                            } else {
                                resizeY = -INCREASE_BY;
                            }
                        } else {
                            if (boundingBox.height < 0) {
                                resizeY = INCREASE_BY;
                            }
                            if (boundingBox.height > -INCREASE_BY) {
                                resizeY = -INCREASE_BY;
                                if (boundingBox.width > -INCREASE_BY && boundingBox.height > 0) {
                                    resizeY = INCREASE_BY;
                                } else {
                                    resizeY = -INCREASE_BY;
                                }
                            }
                        }
                    }
                    curShape._applyResize(resizeX, resizeY);
                    curShape.updateBoundingBox();
                    boundingBox = curShape.model.getBoundingBox().clone();
                    flipDirection = curShape.model.getFlipDirection(boundingBox);
                    if (typeof curShape._maxHeight !== "undefined" && (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Triangle || curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Pentagon)) {
                        boundingBox.height = curShape._maxHeight;
                    }
                    if (typeof curShape._maxWidth !== "undefined" && curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Hexagon) {
                        boundingBox.width = curShape._maxWidth;
                    }
                    if (boundingBox.width > 0) {
                        $shapeAccDiv.find(".accChild").attr("width", boundingBox.width + data.nStrokeWidth + focusPadding * 2);
                        $shapeAccDiv.find(".accChild").attr("height", Math.abs(boundingBox.height) + data.nStrokeWidth + focusPadding * 2);
                    } else {
                        if (boundingBox.width === 0) {
                            curShape.model.setFlipData({
                                "x": 1,
                                "y": flipDirection.y
                            });
                            $(resizeHandler).attr("left", Number($(resizeHandler).attr("left")) + focusPadding + data.nStrokeWidth);
                        }
                        $shapeAccDiv.attr("left", Number($shapeAccDiv.attr("left")) + INCREASE_BY)
                            .find(".accChild").attr({
                                "width": Number($shapeAccDiv.attr("width")) - INCREASE_BY,
                                "height": Math.abs(boundingBox.height) + data.nStrokeWidth + focusPadding * 2
                            });

                    }

                    $(resizeHandler).attr("left", Number($(resizeHandler).attr("left")) + INCREASE_BY);
                    $rotateAccDiv.attr("left", Number($(resizeHandler).attr("left")) + INCREASE_BY / 2);

                    isArrowPressed = true;
                    managerView.updateFocusRect($rotateAccDiv.attr("id"));
                    break;
                case sketchPadModel.LEFT_ARROW_KEY:
                    this.savePrevState();
                    resizeX = -INCREASE_BY;
                    if (isSpecialShape) {
                        if (boundingBox.width >= 0) {
                            if (boundingBox.height >= 0) {
                                resizeY = boundingBox.height < INCREASE_BY ? INCREASE_BY : -INCREASE_BY;
                            } else {
                                resizeY = boundingBox.height > -INCREASE_BY ? -INCREASE_BY : INCREASE_BY;
                            }
                        } else {
                            if (boundingBox.height <= 0) {
                                resizeY = -INCREASE_BY;
                            } else {
                                resizeY = INCREASE_BY;
                            }
                        }
                    }
                    curShape._applyResize(resizeX, resizeY);
                    curShape.updateBoundingBox();
                    boundingBox = curShape.model.getBoundingBox().clone();
                    flipDirection = curShape.model.getFlipDirection(boundingBox);
                    if (typeof curShape._maxHeight !== "undefined" && (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Triangle || curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Pentagon)) {
                        boundingBox.height = curShape._maxHeight;
                    }
                    if (typeof curShape._maxWidth !== "undefined" && curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Hexagon) {
                        boundingBox.width = curShape._maxWidth;
                    }
                    if (boundingBox.width < 0) {
                        if (boundingBox.width >= -INCREASE_BY) {
                            curShape.model.setFlipData({
                                "x": -1,
                                "y": flipDirection.y
                            });
                            $(resizeHandler).attr("left", Number($(resizeHandler).attr("left")) - (focusPadding + data.nStrokeWidth));
                        }
                        $shapeAccDiv.attr("left", Number($shapeAccDiv.attr("left")) - INCREASE_BY)
                            .find(".accChild").attr({
                                "width": -boundingBox.width + data.nStrokeWidth + focusPadding * 2,
                                "height": Math.abs(boundingBox.height) + data.nStrokeWidth + focusPadding * 2
                            });
                    } else {
                        $shapeAccDiv.find(".accChild").attr({
                            "width": boundingBox.width + data.nStrokeWidth + focusPadding * 2,
                            "height": Math.abs(boundingBox.height) + data.nStrokeWidth + focusPadding * 2
                        });
                    }

                    $(resizeHandler).attr("left", Number($(resizeHandler).attr("left")) - INCREASE_BY);
                    $rotateAccDiv.attr("left", Number($rotateAccDiv.attr("left")) - INCREASE_BY / 2);
                    isArrowPressed = true;
                    managerView.updateFocusRect($rotateAccDiv.attr("id"));
                    break;
                case sketchPadModel.TOP_ARROW_KEY:
                    this.savePrevState();
                    resizeY = -INCREASE_BY;
                    if (isSpecialShape) {
                        if (boundingBox.height > 0) {
                            if (boundingBox.width >= 0) {
                                if (boundingBox.width < INCREASE_BY) {
                                    resizeX = INCREASE_BY;
                                } else {
                                    resizeX = -INCREASE_BY;
                                }
                            } else {
                                if (boundingBox.width > -INCREASE_BY) {
                                    resizeX = -INCREASE_BY;
                                } else {
                                    resizeX = INCREASE_BY;
                                }
                            }
                        } else {
                            if (boundingBox.width >= 0 && boundingBox.height !== 0) {
                                resizeX = INCREASE_BY;
                            } else {
                                resizeX = -INCREASE_BY;
                            }
                        }
                    }
                    curShape._applyResize(resizeX, resizeY);
                    curShape.updateBoundingBox();
                    boundingBox = curShape.model.getBoundingBox().clone();
                    flipDirection = curShape.model.getFlipDirection(boundingBox);
                    if (typeof curShape._maxHeight !== "undefined" &&
                        (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Triangle ||
                            curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Pentagon)) {
                        boundingBox.height = curShape._maxHeight;
                    }
                    if (typeof curShape._maxWidth !== "undefined" && curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Hexagon) {
                        boundingBox.width = curShape._maxWidth;
                    }
                    $(resizeHandler).attr("top", Number($(resizeHandler).attr("top")) + INCREASE_BY);
                    if (boundingBox.height < 0) {
                        if (boundingBox.height >= -INCREASE_BY) {
                            curShape.model.setFlipData({
                                "x": flipDirection.x,
                                "y": -1
                            });
                            $(resizeHandler).attr("top", Number($(resizeHandler).attr("top")) - (focusPadding + data.nStrokeWidth));
                            $rotateAccDiv.attr("top", Number($rotateAccDiv.attr("top")) - INCREASE_BY + PADDING * 2 + data.nStrokeWidth);
                        }
                        $shapeAccDiv.attr("top", Number($shapeAccDiv.attr("top")) - INCREASE_BY);
                        $shapeAccDiv.find(".accChild").attr({
                            "height": -boundingBox.height + data.nStrokeWidth + focusPadding * 2,
                            "width": Math.abs(boundingBox.width) + data.nStrokeWidth + focusPadding * 2
                        });
                    } else {
                        $shapeAccDiv.find(".accChild").attr({
                            "height": boundingBox.height + data.nStrokeWidth + focusPadding * 2,
                            "width": Math.abs(boundingBox.width) + data.nStrokeWidth + focusPadding * 2
                        });
                    }
                    isArrowPressed = true;
                    break;
                case sketchPadModel.BOTTOM_ARROW_KEY:
                    this.savePrevState();
                    resizeY = INCREASE_BY;
                    if (isSpecialShape === true) {
                        if (boundingBox.height > 0) {
                            if (boundingBox.width < 0) {
                                resizeX = -INCREASE_BY;
                            } else {
                                resizeX = INCREASE_BY;
                            }
                        } else {
                            if (boundingBox.width < 0) {
                                if (boundingBox.width > -INCREASE_BY) {
                                    resizeX = -INCREASE_BY;
                                } else {
                                    resizeX = INCREASE_BY;
                                }
                            } else {
                                if (boundingBox.width < INCREASE_BY) {
                                    resizeX = INCREASE_BY;
                                } else {
                                    resizeX = -INCREASE_BY;
                                }
                            }
                        }
                    }
                    curShape._applyResize(resizeX, resizeY);
                    curShape.updateBoundingBox();
                    boundingBox = curShape.model.getBoundingBox().clone();
                    flipDirection = curShape.model.getFlipDirection(boundingBox);
                    if (typeof curShape._maxHeight !== "undefined" && (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Triangle || curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Pentagon)) {
                        boundingBox.height = curShape._maxHeight;
                    }
                    if (typeof curShape._maxWidth !== "undefined" && curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Hexagon) {
                        boundingBox.width = curShape._maxWidth;
                    }
                    $(resizeHandler).attr("top", Number($(resizeHandler).attr("top")) + INCREASE_BY);
                    if (boundingBox.height > 0) {
                        $shapeAccDiv.find(".accChild").attr({
                            "height": boundingBox.height + data.nStrokeWidth + focusPadding * 2,
                            "width": Math.abs(boundingBox.width) + data.nStrokeWidth + focusPadding * 2
                        });
                    } else {
                        if (boundingBox.height === 0) {
                            curShape.model.setFlipData({
                                "x": flipDirection.x,
                                "y": 1
                            });
                            $(resizeHandler).attr("top", Number($(resizeHandler).attr("top")) + focusPadding + data.nStrokeWidth);
                            $rotateAccDiv.attr("top", Number($rotateAccDiv.attr("top")) + INCREASE_BY - data.nStrokeWidth - ROTATE_TOP_PADDING);
                        }
                        $shapeAccDiv.attr("top", Number($shapeAccDiv.attr("top")) + INCREASE_BY);
                        $shapeAccDiv.find(".accChild").attr({
                            "height": -boundingBox.height + data.nStrokeWidth + focusPadding * 2,
                            "width": Math.abs(boundingBox.width) + data.nStrokeWidth + focusPadding * 2
                        });
                    }
                    isArrowPressed = true;
                    break;
                case sketchPadModel.TAB_KEY:
                    text = this._getShapeFocuDivText(data.nTye);
                    managerView.setAccMessage("resizeHandlerFocusDiv" + shapeDivNum, text.resizeText);
                    break;
            }
            if (isArrowPressed) {
                accText = managerView.getAccMessage("resizeText", 1, [this._getShapeText(data.nType)]);
                this._reFocusElem("resizeHandlerFocusDiv" + shapeDivNum, accText, 0);

                this._prevResizeVal = {
                    "x": resizeX,
                    "y": resizeY
                };
                curShape.updateBoundingBox();

                this._redraw();
                this.setAccDivPosition($shapeAccDiv);
                this._drawAccDivInCanvas(event.delegateTarget);
                this.saveCurState();
            }
        },
        "_onRotateKeyPress": function(event) {
            if (event.keyCode === WhiteboardTool.Models.Sketchpad.RIGHT_ARROW_KEY || event.keyCode === WhiteboardTool.Models.Sketchpad.LEFT_ARROW_KEY) {
                //Stop page scrolling when arrow keys are pressed
                event.preventDefault();
            }
            clearTimeout($.data(this, "timer"));
            //To call this function after manually setting focus on dummy div.
            $.data(this, "timer", setTimeout(_.bind(function() {
                this._rotateKeyPress(event);
            }, this), 0));
        },

        "_rotateKeyPress": function(event) {
            if ([WhiteboardTool.Models.Sketchpad.RIGHT_ARROW_KEY, WhiteboardTool.Models.Sketchpad.LEFT_ARROW_KEY, WhiteboardTool.Models.Sketchpad.TAB_KEY].indexOf(event.keyCode) === -1) {
                return;
            }
            var rotationAngle = null,
                isArrowPressed = false,
                shapeFocusdivNum = $(event.delegateTarget).attr("shape-focusdiv-number"),
                curShape = this._arrSelectedShapes[0],
                managerView = WhiteboardTool.Views.accManagerView,
                text, accText,
                keyCode = event.keyCode,
                SketchpadModel = WhiteboardTool.Models.Sketchpad,
                ROTATE_ANGLE = 15;

            if (keyCode === SketchpadModel.TAB_KEY) {
                if ($(".shape-focusdiv[shape-focusdiv-number=" + shapeFocusdivNum + "]").hasClass("last")) { //Remove canvas acc div on focus out of last rotate handler
                    this._removeAccFocusRect();
                    return;
                }
                text = this._getShapeFocuDivText(curShape.model.getData().nType);
                managerView.setAccMessage("rotateHandlerFocusDiv" + shapeFocusdivNum, text);
            }

            if (!curShape.model.getData().bAllowRotate) {
                return;
            }

            if (keyCode === SketchpadModel.RIGHT_ARROW_KEY) {
                accText = managerView.getAccMessage("rotateText", 1, [this._getShapeText(curShape.model.getData().nType)]);

                this.savePrevState();
                curShape.rotate(ROTATE_ANGLE);
                rotationAngle = curShape.model.getData().nRotation;
                isArrowPressed = true;
            } else if (keyCode === SketchpadModel.LEFT_ARROW_KEY) {
                accText = managerView.getAccMessage("rotateText", 2, [this._getShapeText(curShape.model.getData().nType)]);

                this.savePrevState();
                curShape.rotate(-ROTATE_ANGLE);
                rotationAngle = curShape.model.getData().nRotation;
                isArrowPressed = true;
            }

            if (isArrowPressed) { //Execute below code only if left or right arrow key is pressed.
                this._reFocusElem("rotateHandlerFocusDiv" + shapeFocusdivNum, accText, 0);

                this.rotateAccDivs($(event.delegateTarget), rotationAngle);
                if (curShape.model.get("_data").nType !== WhiteboardTool.Views.ShapeType.Pencil) {
                    curShape.updateBoundingBox();
                } else {
                    curShape.draw({
                        "type": "mouseup"
                    });
                }

                this._redraw();
                this._updateRotationBox(curShape.model.getData().nRotation % 360); //for 2PI
                this._drawAccDivInCanvas(event.delegateTarget);
                this.saveCurState();
            }
        },

        "rotateAccDivs": function($rotateHandler, rotationAngle) {
            var shapeDivNum = $rotateHandler.attr("shape-focusdiv-number"),
                $shapeAccDiv = this.$(".shape-focusdiv[shape-focusdiv-number=" + shapeDivNum + "]"),
                $resizeAccDiv = this.$(".resize-focusdiv[shape-focusdiv-number=" + shapeDivNum + "]"),
                rotationOriginX = null,
                rotationOriginY = null,
                rotationOrigin = null,
                resizeOriginX = null,
                resizeOriginY = null,
                resizeOrigin = null;

            rotationOriginX = Number($shapeAccDiv.attr("left")) + $shapeAccDiv.attr("width") / 2 - Number($rotateHandler.attr("left"));
            rotationOriginY = Number($shapeAccDiv.attr("top")) + $shapeAccDiv.attr("height") / 2 - Number($rotateHandler.attr("top"));
            rotationOrigin = rotationOriginX + "px " + rotationOriginY + "px";

            if ($resizeAccDiv.length === 1) {
                resizeOriginX = Number($shapeAccDiv.attr("left")) + $shapeAccDiv.attr("width") / 2 - Number($resizeAccDiv.attr("left"));
                resizeOriginY = Number($shapeAccDiv.attr("top")) + $shapeAccDiv.attr("height") / 2 - Number($resizeAccDiv.attr("top"));
                resizeOrigin = resizeOriginX + "px " + resizeOriginY + "px";
                this.rotateAccDiv($resizeAccDiv, rotationAngle, resizeOrigin);
            }

            this.rotateAccDiv($shapeAccDiv, rotationAngle);
            this.rotateAccDiv($rotateHandler, rotationAngle, rotationOrigin);
        },

        "savePrevState": function(curShape) {
            //Save previous state in undo-redo stack
            curShape = typeof curShape === "undefined" ? this._arrSelectedShapes[0] : curShape;
            var prevState = {};

            prevState = curShape.model.getCloneData();
            prevState.id = curShape.getId();
            prevState = curShape.getViewOptions(prevState);

            curShape._savePreviousState(prevState);
        },

        "saveCurState": function(curShape, supressStackRegister) {
            //save current state in undo-redo stack

            curShape = curShape || this._arrSelectedShapes[0];
            var curState = {};

            curState = curShape.model.getCloneData();
            curState.id = curShape.getId();
            curState = curShape.getViewOptions(curState);

            curShape._saveCurrentState(curState);

            if (supressStackRegister !== true) {
                // Set the current action name to be transform. Used in undo redo while saving states of shape.
                this._setCurrentActionName(WhiteboardTool.Views.UndoRedoActions.Transform);
                // Save the data into the stack, as we have all data ready to extract.
                this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());
            }
        },

        "setAccDivPosition": function($shapeAccDiv, isUndoRedo) { //Second parameter is a special condition to update width height of focus rect when undo redo is performed.
            if (!$shapeAccDiv) {
                return;
            }
            var shapeDivNum = $shapeAccDiv.attr("shape-focusdiv-number"),
                $rotateHandler = this.$(".rotate-focusdiv[shape-focusdiv-number=" + shapeDivNum + "]"),
                $resizeAccDiv = this.$(".resize-focusdiv[shape-focusdiv-number=" + shapeDivNum + "]"),
                canvasOffset = this.$("#whiteboard #whiteboard-canvas-container").offset(),
                prevShapeOffset = null,
                prevRotateAccOffset = null,
                prevResizeAccOffset = null,
                $shapeChildElem = $shapeAccDiv.find(".accChild"),
                rotationOriginX = null,
                rotationOriginY = null,
                rotationOrigin = null,
                resizeOriginX = null,
                resizeOriginY = null,
                resizeOrigin = null,
                curShape = null,
                boundingBox = null,
                focusPadding = WhiteboardTool.Models.Sketchpad.ACC_DIV_PADDING,
                data = null,
                flipData = null,
                TOP_PADDING = 27,
                FLIP_PADDING = 46;


            curShape = this._accdivObjectMapping[$shapeChildElem.attr("id")];
            boundingBox = curShape.model.getBoundingBox();
            flipData = curShape.model.getFlipData();
            data = curShape.model.getData();
            if (data.nType === WhiteboardTool.Views.ShapeType.LineSegment) {
                focusPadding = 1;
            }
            if (isUndoRedo === true) {
                if (typeof curShape._maxWidth !== "undefined" && data.nType === WhiteboardTool.Views.ShapeType.Hexagon) {
                    $shapeChildElem.attr("width", curShape._maxWidth * flipData.x + focusPadding * 2 + data.nStrokeWidth);
                } else {
                    $shapeChildElem.attr("width", boundingBox.width * flipData.x + focusPadding * 2 + data.nStrokeWidth);
                }
                if (typeof curShape._maxHeight !== "undefined" && (data.nType === WhiteboardTool.Views.ShapeType.Triangle || data.nType === WhiteboardTool.Views.ShapeType.Pentagon)) {
                    $shapeChildElem.attr("height", curShape._maxHeight * flipData.y + focusPadding * 2 + data.nStrokeWidth);
                } else {
                    $shapeChildElem.attr("height", boundingBox.height * flipData.y + focusPadding * 2 + data.nStrokeWidth);
                }
            }
            if (typeof curShape._hasHorizontalSpacing !== "undefined" && curShape._hasHorizontalSpacing !== null) {
                if (curShape.model.getFlipData().x === 1) {
                    boundingBox.x += curShape._xDiff * 2;
                } else {
                    boundingBox.x -= curShape._xDiff * 2;
                }
            }
            if (typeof curShape._hasVerticalSpacing !== "undefined" && curShape._hasVerticalSpacing !== null) {
                if (curShape.model.getFlipData().y === 1) {
                    boundingBox.y += curShape._yDiff / 2;
                } else {
                    boundingBox.y -= curShape._yDiff / 2;
                }
            }

            prevShapeOffset = {
                "left": boundingBox.x + canvasOffset.left - focusPadding - data.nStrokeWidth / 2,
                "top": boundingBox.y + canvasOffset.top - focusPadding - data.nStrokeWidth / 2
            };
            if (curShape.model.getFlipData().x === -1) {
                prevShapeOffset.left += boundingBox.width;
                if (typeof curShape._maxWidth !== "undefined" && data.nType === WhiteboardTool.Views.ShapeType.Hexagon) {
                    prevShapeOffset.left += curShape._maxWidth - boundingBox.width;
                }
            }
            if (curShape.model.getFlipData().y === -1) {
                prevShapeOffset.top += boundingBox.height;
                if (typeof curShape._maxHeight !== "undefined" && (data.nType === WhiteboardTool.Views.ShapeType.Triangle || data.nType === WhiteboardTool.Views.ShapeType.Pentagon)) {
                    prevShapeOffset.top += curShape._maxHeight - boundingBox.height;
                }
            }
            $shapeAccDiv.attr({
                "width": $shapeChildElem.attr("width"),
                "height": $shapeChildElem.attr("height"),
                "left": prevShapeOffset.left,
                "top": prevShapeOffset.top
            });
            this.rotateAccDiv($shapeAccDiv, null);

            if (data.bAllowRotate) {
                prevRotateAccOffset = {
                    "left": Number($shapeAccDiv.attr("left")) + Number($shapeAccDiv.attr("width")) / 2 - Number($rotateHandler.attr("width")) / 2,
                    "top": Number($shapeAccDiv.attr("top")) - TOP_PADDING
                };
                if (curShape.model.getFlipData().y === -1) {
                    prevRotateAccOffset.top -= boundingBox.height - FLIP_PADDING;
                    if (curShape._yDiff) {
                        prevRotateAccOffset.top -= curShape._yDiff / 2;
                    }
                }
                $rotateHandler.attr({
                    "left": prevRotateAccOffset.left,
                    "top": prevRotateAccOffset.top
                });

                rotationOriginX = Number($shapeAccDiv.attr("left")) + Number($shapeAccDiv.attr("width")) / 2 - Number($rotateHandler.attr("left"));
                rotationOriginY = Number($shapeAccDiv.attr("top")) + Number($shapeAccDiv.attr("height")) / 2 - Number($rotateHandler.attr("top"));
                rotationOrigin = rotationOriginX + "px " + rotationOriginY + "px";
                this.rotateAccDiv($rotateHandler, null, rotationOrigin);
            }

            if (data.bAllowResize) {
                prevResizeAccOffset = {
                    "left": Number($shapeAccDiv.attr("left")) + Number($shapeAccDiv.attr("width")) - Number($resizeAccDiv.attr("width")) / 2 - focusPadding,
                    "top": Number($shapeAccDiv.attr("top")) + Number($shapeAccDiv.attr("height")) - Number($resizeAccDiv.attr("height")) / 2 - focusPadding
                };
                if (curShape.model.getFlipData().x === -1) {
                    prevResizeAccOffset.left -= Number($shapeAccDiv.attr("width")) - focusPadding * 2;
                }
                if (curShape.model.getFlipData().y === -1) {
                    prevResizeAccOffset.top -= Number($shapeAccDiv.attr("height")) - focusPadding * 2;
                }
                $resizeAccDiv.attr({
                    "left": prevResizeAccOffset.left,
                    "top": prevResizeAccOffset.top
                });

                resizeOriginX = Number($shapeAccDiv.attr("left")) + Number($shapeAccDiv.attr("width")) / 2 - Number($resizeAccDiv.attr("left"));
                resizeOriginY = Number($shapeAccDiv.attr("top")) + Number($shapeAccDiv.attr("height")) / 2 - Number($resizeAccDiv.attr("top"));
                resizeOrigin = resizeOriginX + "px " + resizeOriginY + "px";
                this.rotateAccDiv($resizeAccDiv, null, resizeOrigin);
            }
        },

        "rotateAccDiv": function(selector, angle, origin) {
            if (angle === null) {
                return;
            }
            if (!origin) {
                origin = "center center";
            }
            selector.css({
                "-ms-transform": "rotate(" + angle + "deg)",
                "-webkit-transform": "rotate(" + angle + "deg)",
                "-o-transform": "rotate(" + angle + "deg)",
                "transform": "rotate(" + angle + "deg)",
                "-webkit-transform-origin": origin,
                "-ms-transform-origin": origin,
                "-o-transform-origin": origin,
                "transform-origin": origin
            });
        },

        "setShapePropertiesTabIndex": function(shapeFocusdivNum) {
            shapeFocusdivNum = typeof shapeFocusdivNum === "undefined" ? $(".shape-focusdiv.selected").attr("shape-focusdiv-number") : shapeFocusdivNum;
            var managerView = WhiteboardTool.Views.accManagerView,
                lastTabIndex = null,
                $bringToFront = this.$("#math-utilities-properties-menu-container #bring-to-front"),
                $sendToBack = this.$("#math-utilities-properties-menu-container #send-to-back"),
                tabFactor = 1;

            lastTabIndex = managerView.getTabIndex("shapeChild" + shapeFocusdivNum);

            managerView.setTabIndex("resizeHandlerFocusDiv" + shapeFocusdivNum, lastTabIndex + tabFactor++);
            managerView.setTabIndex("rotateHandlerFocusDiv" + shapeFocusdivNum, lastTabIndex + tabFactor++);

            if (this.$("#fill-color-palette").is(":visible")) {
                managerView.setTabIndex("fill-color-text", lastTabIndex + tabFactor++);
                managerView.setTabIndex("fill-top-focus-div", lastTabIndex + tabFactor++);
                managerView.setTabIndex("fill-color-picker-acc-disk-container", lastTabIndex + tabFactor++);
                managerView.setTabIndex("fill-luminance-bar-holder", lastTabIndex + tabFactor++);
                managerView.setTabIndex("fill-luminance-slider-handle", lastTabIndex + tabFactor++);
                managerView.setTabIndex("no-fill-check-holder", lastTabIndex + tabFactor++);
            }
            if (this.$("#stroke-color-palette").is(":visible")) {
                managerView.setTabIndex("stroke-color-text", lastTabIndex + tabFactor++);
                managerView.setTabIndex("stroke-top-focus-div", lastTabIndex + tabFactor++);
                managerView.setTabIndex("stroke-color-picker-acc-disk-container", lastTabIndex + tabFactor++);
                managerView.setTabIndex("stroke-luminance-bar-holder", lastTabIndex + tabFactor++);
                managerView.setTabIndex("stroke-luminance-slider-handle", lastTabIndex + tabFactor++);
                managerView.setTabIndex("no-stroke-check-holder", lastTabIndex + tabFactor++);
            }
            managerView.setTabIndex("size-text", lastTabIndex + tabFactor++);
            managerView.setTabIndex("slider-Handle", lastTabIndex + tabFactor++);
            managerView.setTabIndex("more-menu-properties-label", lastTabIndex + tabFactor++);
            managerView.setTabIndex("fill-opacity-text", lastTabIndex + tabFactor++);
            managerView.setTabIndex("change-opacity-button", lastTabIndex + tabFactor++);
            managerView.setTabIndex("change-opacity-text-box-container", lastTabIndex + tabFactor++);
            managerView.setTabIndex("rotate-shape-text", lastTabIndex + tabFactor++);
            managerView.setTabIndex("rotate-button", lastTabIndex + tabFactor++);
            managerView.setTabIndex("rotation-angle-text-box-container", lastTabIndex + tabFactor++);
            if (!($bringToFront.hasClass("button-disabled") || $bringToFront.children().hasClass("button-disabled"))) {
                managerView.setTabIndex("bring-to-front", lastTabIndex + tabFactor++);
            }
            if (!($sendToBack.hasClass("button-disabled") || !$sendToBack.children().hasClass("button-disabled"))) {
                managerView.setTabIndex("send-to-back", lastTabIndex + tabFactor++);
            }
            managerView.setTabIndex("delete-shape", lastTabIndex + tabFactor++);

            if (this.$("#resizeHandlerFocusDiv" + shapeFocusdivNum).length === 1) { //set focus on resize handler
                managerView.setFocus("resizeHandlerFocusDiv" + shapeFocusdivNum);
            } else if (this.$("#rotateHandlerFocusDiv" + shapeFocusdivNum).length === 1) { //set focus on rotate handler if resize handler is not present
                managerView.setFocus("rotateHandlerFocusDiv" + shapeFocusdivNum);
            }

            managerView.focusIn("slider-Handle", _.bind(this._sliderHandlerFocusIn, this));
            managerView.focusIn("fill-color-text", _.bind(this._shapeToolbar.hideColorPalettePopup, this));
            managerView.focusIn("stroke-color-text", _.bind(this._shapeToolbar.hideColorPalettePopup, this));
            managerView.focusIn("size-text", _.bind(this._shapeToolbar.hideColorPalettePopup, this));
            managerView.focusIn("more-menu-properties-label", _.bind(this._shapeToolbar.hideMoreMenuPopup, this));
            managerView.focusIn("bring-to-front", _.bind(this._shapeToolbar.hideMoreMenuPopup, this));
            managerView.focusIn("change-opacity-text-box-container", _.bind(this._opacityTextBoxFocusIn, this));
            managerView.focusIn("rotation-angle-text-box-container", _.bind(this._rotationTextBoxFocusIn, this));

            this.$(".tool-color-selector").on("click", _.bind(this._colorFocusIn, this));
            this.$("#slider-Handle").on("keydown", _.bind(this.onSliderKeyPress, this));
        },

        "_sliderHandlerFocusIn": function() {
            this._shapeToolbar.hideMoreMenuPopup();
        },

        "onSliderKeyPress": function(event) {
            if ([WhiteboardTool.Models.Sketchpad.RIGHT_ARROW_KEY, WhiteboardTool.Models.Sketchpad.TOP_ARROW_KEY, WhiteboardTool.Models.Sketchpad.LEFT_ARROW_KEY, WhiteboardTool.Models.Sketchpad.BOTTOM_ARROW_KEY, WhiteboardTool.Models.Sketchpad.TAB_KEY].indexOf(event.keyCode) === -1) {
                return;
            }
            var keyCode = event.keyCode,
                manager = WhiteboardTool.Views.accManagerView,
                sketchPadModel = WhiteboardTool.Models.Sketchpad,
                curSliderValue = this._propertyToolbar.sliderViewObject.get("currValue"),
                prevText = this.$("#slider-Handle-acc-elem").text(),
                curText = "";

            switch (keyCode) {
                case sketchPadModel.RIGHT_ARROW_KEY:
                case sketchPadModel.TOP_ARROW_KEY:
                    if (curSliderValue === 10) { //slider max value
                        curText = manager.getAccMessage("slider-Handle", 3);
                    } else {
                        curText = manager.getAccMessage("slider-Handle", 1);
                    }
                    break;
                case sketchPadModel.LEFT_ARROW_KEY:
                case sketchPadModel.BOTTOM_ARROW_KEY:
                    if (curSliderValue === 1) { //slider min value
                        curText = manager.getAccMessage("slider-Handle", 4);
                    } else {
                        curText = manager.getAccMessage("slider-Handle", 2);
                    }
                    break;
                case sketchPadModel.TAB_KEY:
                    curText = manager.getAccMessage("slider-Handle", 0);
                    break;
            }

            if (curText && curText !== "") {
                if (curText === prevText) {
                    curText += " ";
                }
                manager.setAccMessage("slider-Handle", curText);
                if (sketchPadModel.TAB_KEY !== keyCode) {
                    manager.setFocus("whiteboard-temp-focus");
                    manager.setFocus("slider-Handle", 10); //10 is delay
                }
            }
        },

        "_opacityTextBoxFocusIn": function() {
            var manager = WhiteboardTool.Views.accManagerView,
                $opacity = this.$("#change-opacity-text-box-container"),
                opacityValue = $opacity.find("#change-opacity-text-box").val();
            if ($opacity.attr("data-refocus") !== "true") {
                manager.changeAccMessage("change-opacity-text-box-container", 0, [opacityValue]);
                $opacity.attr("data-refocus", true);

                manager.setFocus("whiteboard-temp-focus");
                manager.setFocus("change-opacity-text-box-container");
                //To read opacity box text, by refocusing div after text change,
                //to avoid self calling dom attr change after delay.
                _.delay(function() {
                    $opacity.attr("data-refocus", false);
                }, 100);
            }
        },

        "_rotationTextBoxFocusIn": function() {
            var manager = WhiteboardTool.Views.accManagerView,
                $rotation = this.$("#rotation-angle-text-box-container"),
                rotationValue = $rotation.find("#rotation-angle-text-box").val();
            if ($rotation.attr("data-refocus") !== "true") {
                if (rotationValue === "") {
                    manager.changeAccMessage("rotation-angle-text-box-container", 1);
                } else {
                    manager.changeAccMessage("rotation-angle-text-box-container", 0, [rotationValue]);
                }
                $rotation.attr("data-refocus", true);

                manager.setFocus("whiteboard-temp-focus");
                manager.setFocus("rotation-angle-text-box-container");
                //To read rotation box text, by refocusing div after text change,
                // to avoid self calling dom attr change after delay.
                _.delay(function() {
                    $rotation.attr("data-refocus", false);
                }, 60);
            }

        },

        "_colorFocusIn": function(event) {
            var manager = WhiteboardTool.Views.accManagerView;

            manager.setFocus("whiteboard-temp-focus");
            manager.setFocus($(event.currentTarget).attr("id"));
        },

        "_enableShapeProperties": function(enable, shapeFocusdivNum) {
            shapeFocusdivNum = typeof shapeFocusdivNum === "undefined" ? $(".shape-focusdiv.selected").attr("shape-focusdiv-number") : shapeFocusdivNum;
            var managerView = WhiteboardTool.Views.accManagerView;
            if (this.$("#whiteboard-properties-toolbar").css("display") === "block") {
                managerView.enableTab("resizeHandlerFocusDiv" + shapeFocusdivNum, enable);
                managerView.enableTab("rotateHandlerFocusDiv" + shapeFocusdivNum, enable);
                managerView.enableTab("fill-color-text", enable);
                managerView.enableTab("fill-top-focus-div", enable);
                managerView.enableTab("stroke-color-text", enable);
                managerView.enableTab("stroke-top-focus-div", enable);
                managerView.enableTab("size-text", enable);
                managerView.enableTab("slider-Handle", enable);
                managerView.enableTab("more-menu-properties-label", enable);
                managerView.enableTab("fill-opacity-text", enable);
                managerView.enableTab("change-opacity-button", enable);
                managerView.enableTab("change-opacity-text-box-container", enable);
                managerView.enableTab("rotate-shape-text", enable);
                managerView.enableTab("rotate-button", enable);
                managerView.enableTab("rotation-angle-text-box-container", enable);
                managerView.enableTab("bring-to-front", enable);
                managerView.enableTab("send-to-back", enable);
                managerView.enableTab("delete-shape", enable);
            }
        },
        /**
         * Disable shape's property div's tab index.
         * @method _disableShapeProperties
         * @param {Array} shape array whose property to be disable
         */
        "_disableShapeProperties": function(arrShape) {
            var shape = null,
                curShape = null,
                accObjMap = this._accdivObjectMapping,
                accObj = null;

            for (shape in arrShape) {
                curShape = arrShape[shape];
                for (accObj in accObjMap) {
                    if (curShape === accObjMap[accObj]) {
                        this._enableShapeProperties(false, this._getAccDivNumber(this.$("#" + accObj).parent(".shape-focusdiv")));
                    }
                }
            }
        },

        "_enableDisableUndoBtn": function() {
            if (!MathUtilities.undoManager) {
                return;
            }
            var undoRedoStackMap = MathUtilities.undoManager._undoRedoStackMap;
            WhiteboardTool.Views.accManagerView.enableTab("undo-btn", !(typeof undoRedoStackMap.whiteboard === "undefined" || undoRedoStackMap.whiteboard.undo.length === 0));
        },

        "_enableDisableRedoBtn": function() {
            if (!MathUtilities.undoManager) {
                return;
            }
            var undoRedoStackMap = MathUtilities.undoManager._undoRedoStackMap;
            WhiteboardTool.Views.accManagerView.enableTab("redo-btn", !(typeof undoRedoStackMap.whiteboard === "undefined" || undoRedoStackMap.whiteboard.redo.length === 0));
        },

        /**
         * Create custom tool-tips
         * @method _createCustomToolTips
         * @private
         */
        "_createCustomToolTips": function() {
            var elemId = null,
                options = null,
                tooltipView = null,
                accManagerView = WhiteboardTool.Views.accManagerView,
                $el = this.$el,
                tooltipElems = {
                    "select-tool": {
                        "tooltipHolder": "select-tool",
                        "position": "bottom",
                        "selector": "#select-tool",
                        "align": "left"
                    },
                    "marker-tool": {
                        "tooltipHolder": "marker-tool",
                        "position": "bottom",
                        "selector": "#marker-tool"
                    },
                    "shape-tool-focus-rect": {
                        "tooltipHolder": "shape-tool",
                        "position": "bottom",
                        "selector": ".shape-tool-tooltip"
                    },
                    "arrow-shape": {
                        "tooltipHolder": "arrow-shape-icon",
                        "position": "bottom",
                        "selector": "#arrow-shape"
                    },
                    "circle-shape": {
                        "tooltipHolder": "circle-shape-icon",
                        "position": "bottom",
                        "selector": "#circle-shape"
                    },
                    "ellipse-shape": {
                        "tooltipHolder": "ellipse-shape-icon",
                        "position": "bottom",
                        "selector": "#ellipse-shape"
                    },
                    "etriangle-shape": {
                        "tooltipHolder": "etriangle-shape-icon",
                        "position": "bottom",
                        "selector": "#etriangle-shape"
                    },
                    "rtriangle-shape": {
                        "tooltipHolder": "rtriangle-shape-icon",
                        "position": "bottom",
                        "selector": "#rtriangle-shape"
                    },
                    "trapezoid-shape": {
                        "tooltipHolder": "trapezoid-shape-icon",
                        "position": "bottom",
                        "selector": "#trapezoid-shape"
                    },
                    "square-shape": {
                        "tooltipHolder": "square-shape-icon",
                        "position": "bottom",
                        "selector": "#square-shape"
                    },
                    "rectangle-shape": {
                        "tooltipHolder": "rectangle-shape-icon",
                        "position": "bottom",
                        "selector": "#rectangle-shape"
                    },
                    "parallelogram-shape": {
                        "tooltipHolder": "parallelogram-shape-icon",
                        "position": "bottom",
                        "selector": "#parallelogram-shape"
                    },
                    "pentagon-shape": {
                        "tooltipHolder": "pentagon-shape-icon",
                        "position": "bottom",
                        "selector": "#pentagon-shape"
                    },
                    "hexagon-shape": {
                        "tooltipHolder": "hexagon-shape-icon",
                        "position": "bottom",
                        "selector": "#hexagon-shape"
                    },
                    "line-tool-menu": {
                        "tooltipHolder": "line-tool-menu",
                        "position": "bottom",
                        "selector": "#line-tool-menu"
                    },
                    "line": {
                        "tooltipHolder": "line",
                        "position": "bottom",
                        "selector": "#line-icon"
                    },
                    "line-dashed": {
                        "tooltipHolder": "line-dashed",
                        "position": "bottom",
                        "selector": "#line-dashed-icon"
                    },
                    "line-dashed-arrow": {
                        "tooltipHolder": "line-dashed-arrow-icon",
                        "position": "bottom",
                        "selector": "#line-dashed-arrow"
                    },
                    "line-arrow": {
                        "tooltipHolder": "line-arrow-icon",
                        "position": "bottom",
                        "selector": "#line-arrow"
                    },

                    "image-tool": {
                        "tooltipHolder": "image-tool",
                        "position": "bottom",
                        "selector": "#image-tool"
                    },
                    "text-tool": {
                        "tooltipHolder": "text-tool",
                        "position": "bottom",
                        "selector": "#text-tool"
                    },
                    "background-tool-menu": {
                        "tooltipHolder": "background-tool-menu",
                        "position": "bottom",
                        "selector": "#background-tool-menu"
                    },
                    "graph-tool-menu": {
                        "tooltipHolder": "graph-tool",
                        "position": "bottom",
                        "selector": "#graph-tool-menu"
                    },
                    "no-graph-tool": {
                        "tooltipHolder": "no-graph-tool",
                        "position": "bottom",
                        "selector": "#no-graph-tool"
                    },
                    "cartesian-graph-tool": {
                        "tooltipHolder": "cartesian-graph-tool",
                        "position": "bottom",
                        "selector": "#cartesian-graph-tool"
                    },
                    "polar-graph-tool": {
                        "tooltipHolder": "polar-graph-tool",
                        "position": "bottom",
                        "selector": "#polar-graph-tool"
                    },
                    "edit-tool-menu": {
                        "tooltipHolder": "edit-tool",
                        "position": "bottom",
                        "selector": "#edit-tool-menu"
                    },
                    "cut-tool": {
                        "tooltipHolder": "cut-tool",
                        "position": "bottom",
                        "selector": "#cut-tool"
                    },
                    "copy-tool": {
                        "tooltipHolder": "copy-tool",
                        "position": "bottom",
                        "selector": "#copy-tool"
                    },
                    "paste-tool": {
                        "tooltipHolder": "paste-tool",
                        "position": "bottom",
                        "selector": "#paste-tool"
                    },
                    "pan-tool": {
                        "tooltipHolder": "pan-tool",
                        "position": "bottom",
                        "selector": "#pan-tool"
                    },
                    "polygon-tool": {
                        "tooltipHolder": "polygon-tool",
                        "position": "bottom",
                        "selector": "#polygon-tool"
                    },
                    "undo-btn": {
                        "tooltipHolder": "undo-btn",
                        "position": "bottom",
                        "selector": "#undo-btn"
                    },
                    "redo-btn": {
                        "tooltipHolder": "redo-btn",
                        "position": "bottom",
                        "selector": "#redo-btn"
                    },
                    "refresh-btn": {
                        "tooltipHolder": "refresh-btn",
                        "position": "bottom",
                        "selector": "#refresh-btn"
                    },
                    "math-tool-btn-help-7": {
                        "tooltipHolder": "math-tool-btn-help-7",
                        "position": "bottom",
                        "selector": "#math-tool-btn-help-7"
                    },
                    "math-tool-btn-restore-7": {
                        "tooltipHolder": "math-tool-btn-restore-7",
                        "position": "bottom",
                        "selector": "#math-tool-btn-restore-7"
                    },
                    "math-tool-btn-hide-7": {
                        "tooltipHolder": "math-tool-btn-hide-7",
                        "position": "bottom",
                        "selector": "#math-tool-btn-hide-7"
                    },
                    "math-tool-btn-close-7": {
                        "tooltipHolder": "math-tool-btn-close-7",
                        "position": "bottom",
                        "selector": "#math-tool-btn-close-7"
                    },
                    "math-tool-save-btn-icon-7": {
                        "tooltipHolder": "math-tool-btn-save-7",
                        "position": "top",
                        "selector": "#math-tool-save-btn-icon-7"
                    },
                    "math-tool-open-btn-icon-7": {
                        "tooltipHolder": "math-tool-btn-open-7",
                        "position": "top",
                        "selector": "#math-tool-open-btn-icon-7"
                    },
                    "math-tool-screenshot-btn-icon-7": {
                        "tooltipHolder": "math-tool-btn-screenshot-7",
                        "position": "top",
                        "selector": "#math-tool-screenshot-btn-icon-7"
                    },
                    "math-tool-btn-zoomin-7": {
                        "tooltipHolder": 'math-tool-btn-zoomin-7',
                        "position": 'top',
                        "selector": "#math-tool-btn-zoomin-7"
                    },
                    "math-tool-btn-zoomdefault-7": {
                        "tooltipHolder": 'math-tool-btn-zoomdefault-7',
                        "position": 'top',
                        "selector": "#math-tool-btn-zoomdefault-7"
                    },
                    "math-tool-btn-zoomout-7": {
                        "tooltipHolder": 'math-tool-btn-zoomout-7',
                        "position": 'top',
                        "selector": "#math-tool-btn-zoomout-7"
                    },
                    "math-tool-print-btn-icon-7": {
                        "tooltipHolder": "math-tool-btn-print-7",
                        "position": "top",
                        "selector": "#math-tool-print-btn-icon-7"
                    },
                    "math-tool-csv-btn-icon-7": {
                        "tooltipHolder": "math-tool-btn-csv-7",
                        "position": "top",
                        "selector": "#math-tool-btn-csv-7"
                    }
                },
                startEvents = "mouseenter",
                endEvents = "mouseleave mousedown";

            //load tool-tip screen
            accManagerView.loadScreen("ToolTips");

            if ("ontouchstart" in window) {
                if (this.isMobile()) {
                    startEvents = "touchstart";
                    endEvents = "touchend";
                } else {
                    //touch and type device
                    startEvents += " touchstart";
                    endEvents += " touchend";
                }
            }
            for (elemId in tooltipElems) {
                options = {
                    "id": tooltipElems[elemId].tooltipHolder + "-tooltip",
                    "text": accManagerView.getMessage(elemId + "-tooltip", 0),
                    "position": tooltipElems[elemId].position,
                    "align": tooltipElems[elemId].align,
                    "tool-holder": $el
                };
                tooltipView = MathUtilities.Components.CustomTooltip.generateTooltip(options);

                this.$(tooltipElems[elemId].selector).on(startEvents, _.bind(tooltipView.showTooltip, tooltipView))
                    .on(endEvents, _.bind(tooltipView.hideTooltip, tooltipView));
            }
        },

        /**
         * Gets called when mouse move or touch move occurs based on device/browser used.
         * @method _onTouchDrag
         * @params Paper mouse/touch event object.
         * @private
         */
        "_onTouchDrag": function(eventObject) {
            if (eventObject.event.which === 3 || eventObject.delta.x === 0 && eventObject.delta.y === 0) {
                return;
            }
            var curShape = this._getHitShape(),
                data = null,
                selectedShapeCounter,
                shape,
                selectedShapes = null,
                selectedShapesCount = null,
                curShapeType,
                shapeOldState;
            if (!this._isValidMove()) {
                return;
            }
            //if touch end occur on canvas,if select tool is canvas-pan then it should return
            if (WhiteboardTool.Views.DrawingTool === WhiteboardTool.Views.ShapeType.CanvasPan) {
                this._onCanvasPan(eventObject);
                return;
            }
            if (this._addingObj) {
                this._addingObj.processTouchMove(eventObject);
            } else if (this._selectionPath) {
                this._handleDragSelectionMove(eventObject);
            } else {
                if (curShape) {
                    data = curShape.model.getData();
                    curShapeType = curShape.model.getData().nType;
                    if (data && data.bSelected) {
                        selectedShapes = this._arrSelectedShapes;
                        selectedShapesCount = selectedShapes.length;
                        //if shape is selected den stop repetitive handleDragging
                        if (selectedShapesCount === 0) {
                            curShape.handleDragging(eventObject);
                        }

                        for (selectedShapeCounter = 0; selectedShapeCounter < selectedShapesCount; selectedShapeCounter++) {
                            shape = selectedShapes[selectedShapeCounter];
                            shape.handleDragging(eventObject);
                        }
                    } else {
                        if (data && !eventObject.event.ctrlKey) {
                            if (this._arrSelectedShapes.length !== 0 && !eventObject.event.ctrlKey) {
                                while (this._arrSelectedShapes.length !== 0) {
                                    this._arrSelectedShapes[0].deselect();
                                }
                            }
                            curShape.model.setOptions({
                                "bAllowSelectionBound": true,
                                "bAllowResize": curShapeType !== WhiteboardTool.Views.ShapeType.Text && curShape.model.getData().nType !== WhiteboardTool.Views.ShapeType.Pencil,
                                "bAllowRotate": curShapeType !== WhiteboardTool.Views.ShapeType.LineSegment
                            });
                            curShape.select();

                            //find more place for this
                            shapeOldState = curShape._getPreviousState();
                            shapeOldState.shapeData.bSelected = true;
                            curShape._savePreviousState(shapeOldState);

                            this._updateZIndexesOfShape();
                            selectedShapes = this._arrSelectedShapes;
                            selectedShapesCount = selectedShapes.length;
                            //if shape is selected den stop repetitive handleDragging
                            if (selectedShapesCount === 0) {
                                curShape.handleDragging(eventObject);
                            }

                            for (selectedShapeCounter = 0; selectedShapeCounter < selectedShapesCount; selectedShapeCounter++) {
                                shape = selectedShapes[selectedShapeCounter];

                                shape.handleDragging(eventObject);
                            }
                        }
                    }
                    this._redraw();
                }
            }
        },

        "_onTouchMove": function(event) {
            if (this._addingObj && this._addingObj.model.getData().nType === WhiteboardTool.Views.ShapeType.Polygon) {
                this._addingObj.processTouchMove(event);
            }
        },

        "_updateZIndexesOfShape": function() {
            var looper,
                curShape,
                shapeIndex,
                arrShapesLength = this._arrShapes.length,
                zIndexLooper,
                zIndexesShapesLength = this._zIndexofShapes.length;
            for (looper = 0; looper < arrShapesLength; looper++) {
                curShape = this._arrShapes[looper];
                // to avoid updating z index of background
                if (this._arrShapes[looper].model.getData().nType === WhiteboardTool.Views.ShapeType.BackgroundImage) {
                    this._arrShapes[looper]._intermediatePath.sendToBack();
                }
                shapeIndex = WhiteboardTool.Views.PaperScope.project.activeLayer.children.indexOf(curShape._intermediatePath);
                for (zIndexLooper = 0; zIndexLooper < zIndexesShapesLength; zIndexLooper++) {
                    if (this._zIndexofShapes[zIndexLooper].id === curShape.getId()) {
                        this._zIndexofShapes[zIndexLooper].zIndex = shapeIndex;
                    }
                }
            }
        },

        /**
         * Gets called when mouse move or touch move occurs based on device/browser used.
         * @method _onTouchEnd
         * @params Paper mouse/touch event object.
         * @private
         */
        "_onTouchEnd": function(eventObject) {
            if (!this._isValidMove()) {
                this._changeToDefaultCanvasCursor();
                return;
            }
            var curShape, data, hitShape, shape,
                selectedShapes = null,
                selectedShapeCount = null,
                selectedShapeCounter,
                accDivObject = null,
                $shapeAccDiv = null,
                managerView = WhiteboardTool.Views.accManagerView,
                focusPadding = WhiteboardTool.Models.Sketchpad.ACC_DIV_PADDING * 2,
                nType,
                ShapeType = WhiteboardTool.Views.ShapeType,
                addObj = null;


            if (this._currentEvents !== null || eventObject.changedTouches.length > 1) {
                this._currentEvents = null;
            } else {
                return;
            }

            if (this._isValidMove()) {
                this._bHasTouchOccurred = false;

                //if touch end occur on canvas,if select tool is canvas-pan then it should return
                if (WhiteboardTool.Views.DrawingTool === ShapeType.CanvasPan) {
                    this._onCanvasPanEnd(eventObject);
                    return;
                }

                if (this._addingObj) {
                    addObj = this._addingObj;
                    nType = addObj.model.getData().nType;
                    if (nType === ShapeType.LineSegment &&
                        addObj._hitPoint.x === addObj._curPoint.x && addObj._hitPoint.y === addObj._curPoint.y &&
                        !WhiteboardTool.Views.isAccessible) {
                        return;
                    }
                    //Update eventObject points depending on width and height of shape so as to place shape in the center
                    if (WhiteboardTool.Views.isAccessible && nType === ShapeType.Image) {
                        eventObject.point.x -= addObj.model.getData().shapeDimension.width / 2;
                        eventObject.point.y -= addObj.model.getData().shapeDimension.height / 2;
                    }
                    addObj.processTouchEnd(eventObject);
                    //set zindex of shape in array
                    this._zIndexofShapes.push({
                        "id": addObj.getId(),
                        "zIndex": WhiteboardTool.Views.PaperScope.project.activeLayer.children.indexOf(addObj._intermediatePath)
                    });

                    //set bSelected to false if pen is drawn
                    if (nType !== ShapeType.Pencil && nType !== ShapeType.Text) {
                        if (nType !== ShapeType.Polygon || addObj.checkPolygonComplete()) {
                            addObj.select();

                            addObj._updateCurrentState({
                                "bSelected": true
                            });
                            this._curShapeTool = ShapeType.None;
                            WhiteboardTool.Views.CurTool = ShapeType.None;
                            this._updateCanvasCursor(ShapeType.None);
                            this._shapeToolbar.selectTool({
                                "tool-type": ShapeType.None,
                                "tool-group": "2",
                                "bFireEvent": false
                            });

                            if (nType === ShapeType.Polygon && !addObj.isValidPolygon()) {
                                this.remove([addObj]);
                                this._commonPropertiesToolbar.hide();
                            } else if (WhiteboardTool.Views.isAccessible) { //Create acc divs if accessibility is on.
                                this._createAccessibilityDivs(addObj);
                            }
                        }

                    } else {
                        addObj.model.setOptions({
                            "bAllowSelectionBound": true,
                            "bAllowResize": false,
                            "bAllowRotate": true
                        });
                        if (nType === ShapeType.Pencil) {
                            this._createAccessibilityDivs(addObj, false);
                        }
                    }

                    if (nType === ShapeType.Text) {
                        this._enableTabs(false);

                    } else if (nType !== ShapeType.Polygon || addObj.checkPolygonComplete()) {
                        // Set the current action name to be transform. Used in undo redo while saving states of shape.
                        this._setCurrentActionName(WhiteboardTool.Views.UndoRedoActions.Add);
                        // Save the data into the stack, as we have all data ready to extract.
                        this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand([addObj]));
                        //store current shape tool
                    }
                } else if (this._selectionPath) {
                    this._handleDragSelectionEnd(eventObject);
                    this._accOnShapeSelect();
                } else {
                    // Block where handle drag end is called for each shapes.
                    // End result is transform of shape. That can be rotation, translation or resize.
                    hitShape = this._getHitShape();
                    curShape = this._getShapeUnderCords(eventObject.point);

                    if (hitShape && hitShape !== null) {
                        data = hitShape.model.getData();
                        if (data.nType === ShapeType.LineSegment) {
                            focusPadding = 2 + data.nStrokeWidth;// extra padding for line shape
                        }
                        if (hitShape._hitPoint && hitShape._curPoint) {
                            //Check if shape is clicked.

                            if (hitShape._hitPoint.x === hitShape._curPoint.x && hitShape._hitPoint.y === hitShape._curPoint.y && hitShape === curShape) {
                                if (!this._isCtrlSelect(eventObject) && this._arrSelectedShapes.length > 1) {
                                    this._clearShapeSelection();
                                }
                                this._handleSelection(eventObject);
                                this._redraw();
                                this._accOnShapeSelect();
                                this._disableShapeProperties();
                                return;
                            }
                            if (data && data.bSelected) {
                                //if shape is selected den stop repetitive handleDragEnd
                                if (selectedShapes === 0) {
                                    hitShape.handleDragEnd(eventObject);
                                }

                                selectedShapes = this._arrSelectedShapes;
                                selectedShapeCount = selectedShapes.length;
                                for (selectedShapeCounter = 0; selectedShapeCounter < selectedShapeCount; selectedShapeCounter++) {
                                    shape = selectedShapes[selectedShapeCounter];
                                    shape.handleDragEnd(eventObject);


                                    shape._selectionBound.trigger("handler-mouse-up", eventObject);
                                    if (WhiteboardTool.Views.isAccessible) {
                                        for (accDivObject in this._accdivObjectMapping) {
                                            if (this._accdivObjectMapping[accDivObject] === shape) {
                                                $shapeAccDiv = this.$("#" + accDivObject);
                                                break;
                                            }
                                        }
                                        if ($shapeAccDiv) {
                                            if (shape.model.getBoundingBox().width < 0) {
                                                $shapeAccDiv.attr("left", $shapeAccDiv.attr("left") - $shapeAccDiv.attr("width"));
                                            }
                                            $shapeAccDiv.attr("width", Math.abs(shape._selectionBound.model.getBoundingBox().width) + focusPadding);

                                            if (shape.model.getBoundingBox().height < 0) {
                                                $shapeAccDiv.attr("top", $shapeAccDiv.attr("top") - $shapeAccDiv.attr("height"));
                                            }


                                            $shapeAccDiv.attr("height", Math.abs(shape._selectionBound.model.getBoundingBox().height) + focusPadding);
                                            this.setAccDivPosition($shapeAccDiv.parent(".shape-focusdiv"));
                                            this.rotateAccDivs(this.$(".rotate-focusdiv[shape-focusdiv-number=" + $shapeAccDiv.parent(".shape-focusdiv").attr("shape-focusdiv-number") + "]"), shape.model.getData().nRotation);
                                        }
                                        managerView.setFocus("shape-tool-focus-rect");
                                    }

                                    this._accOnShapeSelect();
                                }
                            }
                        }
                    }
                    this._redraw();
                    this._disableShapeProperties();

                    // Set the current action name to be transform. Used in undo redo while saving states of shape.
                    this._setCurrentActionName(WhiteboardTool.Views.UndoRedoActions.Transform);
                    // Save the data into the stack, as we have all data ready to extract.
                    this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());
                }
                this._setHitShape(null);
            }
            //***********************************************************
            // Clean up procedure here
            this._bHasTouchOccurred = false;
            if (this._bShapePlottingFinished) {
                this._addingObj = null;
                this._bShapePlottingFinished = false;
            }
        },

        "_updateImageIndex": function() {
            var selectedShapeCounter,
                selectedShapes,
                selectedShapeCount,
                shapeCounter,
                zIndex,
                shape,
                shapeInZIndexArray = null,
                shapeStoredInZIndexCount;

            selectedShapes = this._arrSelectedShapes;
            selectedShapeCount = selectedShapes.length;
            shapeStoredInZIndexCount = this._zIndexofShapes.length;
            for (selectedShapeCounter = 0; selectedShapeCounter < selectedShapeCount; selectedShapeCounter++) {
                shape = selectedShapes[selectedShapeCounter];
                for (shapeCounter = 0; shapeCounter < shapeStoredInZIndexCount; shapeCounter++) {
                    shapeInZIndexArray = this._zIndexofShapes[shapeCounter];
                    if (shape.getId() === shapeInZIndexArray.id) {
                        zIndex = shapeInZIndexArray.zIndex;
                    }
                }
                WhiteboardTool.Views.PaperScope.project.activeLayer.insertChild(zIndex, shape._intermediatePath);
                this._updateZIndexesOfShape();
            }
        },

        "_setTouchEndData": function(args) {
            var noOfShapes,
                shapeCounter = 0,
                selectedShapes = this._arrSelectedShapes,
                shapesLength = selectedShapes.length;

            this._enableTabs(true);

            this._shapeToolbar.selectTool({
                "tool-type": WhiteboardTool.Views.ShapeType.None,
                "tool-group": "2",
                "bFireEvent": false
            });

            this._curShapeTool = WhiteboardTool.Views.ShapeType.None;
            WhiteboardTool.Views.CurTool = WhiteboardTool.Views.ShapeType.None;
            this._updateCanvasCursor(WhiteboardTool.Views.ShapeType.None);

            if (this._addingObj === null) {

                //If shape is double clicked
                // Set the current action name to be transform. Used in undo redo while saving states of shape.
                this._setCurrentActionName(WhiteboardTool.Views.UndoRedoActions.Add);
                // Save the data into the stack, as we have all data ready to extract.
                this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand([args.textView]));

                this._redraw();
            } else {
                if (this._addingObj._intermediatePath) {
                    this._addingObj.select();
                    this._addingObj._updateCurrentState({
                        "bSelected": true
                    });
                    this._zIndexofShapes.push({
                        "id": this._addingObj.getId(),
                        "zIndex": WhiteboardTool.Views.PaperScope.project.activeLayer.children.indexOf(this._addingObj._intermediatePath)
                    });
                }


                if (WhiteboardTool.Views.isAccessible && this._addingObj._intermediatePath) {
                    this._createAccessibilityDivs(this._addingObj, true);
                }

                if (this._addingObj._intermediatePath) {
                    // Set the current action name to be transform. Used in undo redo while saving states of shape.
                    this._setCurrentActionName(WhiteboardTool.Views.UndoRedoActions.Add);

                    // Save the data into the stack, as we have all data ready to extract.
                    this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand([this._addingObj]));
                } else {
                    this.remove(this._addingObj, true);
                    noOfShapes = this._arrShapes.length;
                    for (shapeCounter = 0; shapeCounter < noOfShapes; shapeCounter++) {
                        if (!this._arrShapes[shapeCounter]._intermediatePath && this._arrShapes[shapeCounter].model.getData().nType === WhiteboardTool.Views.ShapeType.Text) {
                            break;
                        }
                    }
                    this._arrShapes.splice(shapeCounter, 1);
                    this._addingObj.destroy();
                }
                this._addingObj = null;
                this._bShapePlottingFinished = false;
            }
            for (; shapeCounter < shapesLength; shapeCounter++) {
                selectedShapes[shapeCounter].deselect();
            }
            if (args.textView && args.text !== "") {
                args.textView.deselect();
                args.textView.select();
            }
            this._redraw();
            this.$("#whiteboard").parents(".math-utilities-components-tool-holder").focus();
            this._accOnShapeSelect(true);
        },

        /**
         * Gets fired when a key is pressed.
         * @method _onKeyDown
         * @params {Object} eventObject. Event Data
         * @private
         */
        "_onKeyDown": function(eventObject) {
            if ($(eventObject.target).closest('.text-tool-editor-modal-holder,.math-utilities-text-tool-math-editor').length) {
                //inside tinymce or keyboard text area.
                return void 0;
            }
            var shapes = this._arrShapes,
                isAccessible = WhiteboardTool.Views.isAccessible,
                isTextField = $(eventObject.target).is("input[type=\"text\"]"),
                keyCode = eventObject.keyCode,
                SketchpadModel = WhiteboardTool.Models.Sketchpad,
                isCtrlPressed = eventObject.ctrlKey && navigator.appVersion.indexOf("Mac") === -1 || eventObject.metaKey;

            switch (keyCode) {
                case SketchpadModel.ESCAPE_KEY:
                    if (!isAccessible) {
                        if (this._arrSelectedShapes.length > 0) {
                            while (this._arrSelectedShapes.length !== 0) {
                                this._arrSelectedShapes[0].deselect();
                            }
                            this._redraw();
                        } else {
                            this._shapeToolbar.hidePopup();
                            this._shapeToolbar.hideBackgroundPopup();
                            this._shapeToolbar.editPopup();
                        }
                    }
                    break;

                case SketchpadModel.DELETE_KEY:
                case SketchpadModel.BACKSPACE_KEY:
                    if (!isTextField) {
                        this._onDelete();
                        this._removeAccFocusRect();
                        if (eventObject.keyCode === WhiteboardTool.Models.Sketchpad.BACKSPACE_KEY) {
                            return false;
                        }
                    }
                    break;

                case SketchpadModel.ALPHABET_A_KEY:
                    if (isCtrlPressed) {
                        if (WhiteboardTool.Views.CurTool === WhiteboardTool.Views.ShapeType.Pencil || WhiteboardTool.Views.DrawingTool === WhiteboardTool.Views.ShapeType.CanvasPan) {
                            this.$("#select-tool").trigger("click");
                        }
                        this.selectShapes(shapes);
                        this._enableShapeProperties(false);
                        return false;
                    }
                    break;
                case SketchpadModel.ALPHABET_C_KEY:
                    if (!isTextField && (isCtrlPressed || isAccessible)) {
                        this.performCopyOperation();
                    }
                    break;
                case SketchpadModel.ALPHABET_X_KEY:
                    if (!isTextField && (isCtrlPressed || isAccessible)) {
                        this.performCutOperation();
                    }
                    break;
                case SketchpadModel.ALPHABET_V_KEY:
                    if (!isTextField && (isCtrlPressed || isAccessible)) {
                        this.performPasteOperation();
                    }
                    break;

                case SketchpadModel.LEFT_ARROW_KEY:
                case SketchpadModel.RIGHT_ARROW_KEY:
                case SketchpadModel.TOP_ARROW_KEY:
                case SketchpadModel.BOTTOM_ARROW_KEY:
                    if (!isTextField) {
                        this._performArrowAction(eventObject);
                    }
                    break;

            }
        },

        "selectShapes": function(arrShape, preventShapeAcc) {
            if (!arrShape) {
                return;
            }
            var selectableShape = arrShape.length,
                shape = null,
                curShape = null,
                backgroundImageCode = WhiteboardTool.Views.ShapeType.BackgroundImage;

            //if background image is present,
            for (shape in arrShape) {
                if (arrShape[shape].model.get("_data").nType === backgroundImageCode) {
                    selectableShape -= 1;
                }
            }

            for (shape in arrShape) {
                curShape = arrShape[shape];
                if (curShape.model.get("_data").nType === backgroundImageCode) {
                    continue;
                }
                //Deselect shape if already selected
                if (curShape.isSelected()) {
                    curShape.deselect();
                }
                curShape.isMultipleSelection = true;
                //For multiple shapes remove handlers
                if (selectableShape > 1) {
                    curShape.setOptions({
                        "bAllowResize": false,
                        "bAllowRotate": false
                    });
                }
                curShape.select();
                this._bindBoundsHandleEvents(curShape);
            }
            this._redraw();

            if (preventShapeAcc !== true) {
                this._accOnShapeSelect();
                this._disableShapeProperties();
            }
        },

        /**
         * Gets fired when a shape is selected.
         * @method _onShapeSelect
         * @params {Object} curShape that is selected
         * @private
         */
        "_onShapeSelect": function(curShape) {
            var data = curShape.model.getData();
            if (this._arrSelectedShapes.indexOf(curShape) === -1) {
                this._arrSelectedShapes.push(curShape);
            }
            if (this._arrSelectedShapes.length > 1 || this._arrSelectedShapes.length === 0) {
                this._hideAllProperitiesForMultipleSelect();
            } else {
                this._commonPropertiesToolbar.show(WhiteboardTool.Views.MenuItems[data.menuType], WhiteboardTool.Views.templates, curShape);
                WhiteboardTool.Views.accManagerView.loadScreen("property-toolbar");
                WhiteboardTool.Views.currentMenuTypeSelected = data.menuType;
            }
            this._bindBoundsHandleEvents(curShape);
            this.updatePropertyToolbar(data);
            this._updateEditOption();
        },

        "_accOnShapeSelect": function(updateDivParameter) {
            if (WhiteboardTool.Views.isAccessible === false) {
                return;
            }
            var arrShape = this._arrSelectedShapes,
                shapeLen = arrShape.length,
                accObjMap = this._accdivObjectMapping,
                accObj = null,
                curShape = null,
                accManager = WhiteboardTool.Views.accManagerView,
                accText;
            if (shapeLen === 1) {
                curShape = arrShape[0];
                for (accObj in accObjMap) {
                    if (accObjMap[accObj].cid === curShape.cid) {
                        if (updateDivParameter === true) {
                            this.setAccDivPosition(this.$("#" + accObj).parent(".shape-focusdiv"), true);
                        }
                        accManager.setFocus(accObj);
                    }
                }
            } else if (shapeLen > 1) {
                accText = accManager.getAccMessage("whiteboard-canvas-fakediv", 1);
                this.enableCanvasFakediv(accText, "whiteboard-canvas-fakediv");
            }
        },

        "_updateEditOption": function() {
            var arrSelectedShape = this._arrSelectedShapes,
                $edit = this.$("#whiteboard #edit-tool-menu"),
                $copy = this.$("#whiteboard #copy-tool"),
                $cut = this.$("#whiteboard #cut-tool"),
                $paste = this.$("#whiteboard #paste-tool"),
                accManager = WhiteboardTool.Views.accManagerView,
                isAccessible = WhiteboardTool.Views.isAccessible,
                isOptionEnable = false;

            if (arrSelectedShape.length === 0) {
                $copy.addClass("button-disabled");
                $cut.addClass("button-disabled");

                if (isAccessible) {
                    accManager.enableTab("copy-tool", false);
                    accManager.enableTab("cut-tool", false);
                }
            } else {
                $copy.removeClass("button-disabled");
                $cut.removeClass("button-disabled");

                if (isAccessible) {
                    accManager.enableTab("copy-tool", true);
                    accManager.enableTab("cut-tool", true);
                }
                isOptionEnable = true;
            }

            if (this.model.get("copyData") === null || this.model.get("copyData").length === 0) {
                $paste.addClass("button-disabled");
                if (isAccessible) {
                    accManager.enableTab("paste-tool", false);
                }
            } else {
                $paste.removeClass("button-disabled");
                if (isAccessible) {
                    accManager.enableTab("paste-tool", true);
                }
                isOptionEnable = true;
            }

            if (isOptionEnable) {
                $edit.removeClass("button-disabled");
                accManager.enableTab("edit-focus-rect", true);

                if (arrSelectedShape.length === 0 && $edit.attr("data-tool-type") !== WhiteboardTool.Views.ToolType.Paste) {
                    this._shapeToolbar.setEditState({
                        "toolType": WhiteboardTool.Views.ToolType.Paste
                    });
                }
            } else {
                $edit.addClass("button-disabled");
                accManager.enableTab("edit-focus-rect", false);
            }
        },
        "_onEquationComplete": function() {
            this._bShapePlottingFinished = true;
        },

        "_bindBoundsHandleEvents": function(shape) {
            if (shape && shape._selectionBound) {
                shape._selectionBound.off("rotate-handle-mouse-enter rotate-handle-mouse-leave rotate-handle-mouse-down handler-mouse-up resize-handle-mouse-enter resize-handle-mouse-leave resize-handle-mouse-down drag-handle-enter drag-handle-mouse-down drag-handle-leave")
                    .on("rotate-handle-mouse-enter", _.bind(function() {
                        if (MathUtilities.Components.Utils.Models.BrowserCheck.isIE || this.getIEVersion() === 11) {
                            this._changeCanvasCursor("whiteboard-rotate-handler-cursor-ie");
                        } else {
                            this._changeCanvasCursor("whiteboard-rotate-handler-cursor");
                        }
                    }, this))
                    .on("rotate-handle-mouse-down", _.bind(function() {
                        this._changeCanvasCursorOnRotateStart("whiteboard-rotate-handler-in-action-cursor", shape);
                    }, this))
                    .on("resize-handle-mouse-enter", _.bind(function(event) {
                        this._changeCanvasCursorOnResizeEnter(event, shape);
                    }, this))
                    .on("resize-handle-mouse-down", _.bind(function() {
                        this._onResizeHandlerDown(shape);
                    }, this))
                    .on("handler-mouse-up", _.bind(function(eventObject) {
                        this._onRotateHandleMouseUp(eventObject, shape);
                    }, this))
                    .on("rotate-handle-mouse-leave resize-handle-mouse-leave", _.bind(this._changeToDefaultCanvasCursor, this))
                    .on("drag-handle-enter", _.bind(this._dragHandleCursor, this))
                    .on("drag-handle-mouse-down", _.bind(function() {
                        this._dragHandleDown(shape);
                    }, this))
                    .on("drag-handle-leave", _.bind(function(eventObject) {
                        this._dragLeave(eventObject, shape);
                    }, this));
            }
        },

        "_dragLeave": function(eventObject, shape) {
            var hitTestResult,
                flipData;
            if (typeof shape === "undefined") {
                this._changeToDefaultCanvasCursor();
                return;
            }
            if (shape._selectionBound !== null && shape._selectionBound._resizeHandlePath !== null) {
                hitTestResult = shape._selectionBound._resizeHandlePath.hitTest(eventObject.point);
                if (hitTestResult !== null && typeof hitTestResult !== "undefined") {
                    flipData = shape.model.getFlipData();
                    if (flipData.x === -1 && flipData.y === 1 || flipData.x === 1 && flipData.y === -1) {
                        this._changeCanvasCursor("whiteboard-resize-left-bottom-right-top-cursor");
                    } else {
                        this._changeCanvasCursor("whiteboard-resize-right-bottom-left-top-cursor");
                    }
                    return;
                }
            }
            this._changeToDefaultCanvasCursor();
        },

        "_dragHandleDown": function(shape) {
            shape._selectionBound.off("resize-handle-mouse-enter resize-handle-mouse-leave drag-handle-leave drag-handle-enter rotate-handle-mouse-enter rotate-handle-mouse-leave");
            this._changeCanvasCursor("whiteBoard-move-cursor");
        },

        "_dragHandleCursor": function() {
            this._changeCanvasCursor("whiteBoard-move-cursor");
        },

        "_onResizeHandlerDown": function(shape) {
            shape._selectionBound.off("resize-handle-mouse-enter resize-handle-mouse-leave drag-handle-leave drag-handle-enter");
        },

        "_changeCanvasCursorOnResizeEnter": function(eventObject, shape) {
            var hitTestResult, flipData;
            if (shape && shape._intermediatePath) {
                hitTestResult = shape._intermediatePath.hitTest(eventObject.point);
                if (hitTestResult && hitTestResult.type !== "stroke") {
                    this._dragHandleCursor();
                }
                flipData = shape.model.getFlipData();
                if (flipData.x === -1 && flipData.y === 1 || flipData.x === 1 && flipData.y === -1) {
                    this._changeCanvasCursor("whiteboard-resize-left-bottom-right-top-cursor");
                } else {
                    this._changeCanvasCursor("whiteboard-resize-right-bottom-left-top-cursor");
                }
            }
        },

        "_changeToDefaultCanvasCursor": function() {
            this._updateCanvasCursor(WhiteboardTool.Views.CurTool);
        },

        "_onRotateHandleMouseUp": function(eventObject, shape) {
            var rotateHitTestResult,
                resizeHitTestResult,
                ieVersion = this.getIEVersion(),
                selectionBoundHitTestResult;
            if (shape._selectionBound === null) {
                return;
            }
            if (shape._selectionBound._rotateHandlePath !== null) {
                rotateHitTestResult = shape._selectionBound._rotateHandlePath.hitTest(eventObject.point);
            }
            if (shape._selectionBound._resizeHandlePath !== null) {
                resizeHitTestResult = shape._selectionBound._resizeHandlePath.hitTest(eventObject.point);
            }
            if (shape._selectionBound._intermediatePath !== null) {
                selectionBoundHitTestResult = shape._selectionBound._intermediatePath.hitTest(eventObject.point);
            }
            if (typeof rotateHitTestResult !== "undefined" && rotateHitTestResult !== null) {
                if (MathUtilities.Components.Utils.Models.BrowserCheck.isIE || ieVersion === 11) {
                    this._changeCanvasCursor("whiteboard-rotate-handler-cursor-ie");
                } else {
                    this._changeCanvasCursor("whiteboard-rotate-handler-cursor");
                }
            } else if (typeof resizeHitTestResult !== "undefined" && resizeHitTestResult !== null) {
                this._changeCanvasCursorOnResizeEnter(shape);
            } else if (typeof selectionBoundHitTestResult !== "undefined" && selectionBoundHitTestResult !== null) {
                this._dragHandleCursor();
            } else {
                this._changeToDefaultCanvasCursor();
            }
            this._bindBoundsHandleEvents(shape);
        },

        "_changeCanvasCursorOnRotateStart": function(cursorClass, shape) {
            shape._selectionBound.off("rotate-handle-mouse-enter rotate-handle-mouse-leave drag-handle-leave drag-handle-enter");
            if (MathUtilities.Components.Utils.Models.BrowserCheck.isIE || this.getIEVersion() === 11) {
                this._whiteboardCanvas.attr("class", cursorClass + "-ie");
            } else {
                this._whiteboardCanvas.attr("class", cursorClass);
            }
        },

        "_changeCanvasCursor": function(cursorClass) {
            this._whiteboardCanvas.attr("class", "").addClass(cursorClass);
        },

        /**
         * Gets fired when a shape is desected.
         * @method _onShapeDeselect
         * @params {Object} curShape that is de-selected
         * @private
         */
        "_onShapeDeselect": function(curShape) {
            var selectedShapesLength = null,
                data = null,
                index = this._arrSelectedShapes.indexOf(curShape);
            if (index !== -1) {
                this._arrSelectedShapes.splice(index, 1);
            }
            selectedShapesLength = this._arrSelectedShapes.length;
            if (this._arrSelectedShapes.length === 1) {
                data = this._arrSelectedShapes[0].model.getData();
                this._commonPropertiesToolbar.show(WhiteboardTool.Views.MenuItems[data.menuType], WhiteboardTool.Views.templates, this._arrSelectedShapes[0]);
                WhiteboardTool.Views.accManagerView.loadScreen("property-toolbar");
                WhiteboardTool.Views.currentMenuTypeSelected = data.menuType;
            } else {
                if (selectedShapesLength === 0) {
                    this._commonPropertiesToolbar.hide({
                        "supressEvent": true
                    });
                } else {
                    this._hideAllProperitiesForMultipleSelect();
                }
            }
            if (WhiteboardTool.Views.DrawingTool !== WhiteboardTool.Views.ShapeType.Pencil) {
                this._updateCanvasCursor(WhiteboardTool.Views.ShapeType.None);
            }

            this._updateEditOption();
        },

        "_hideAllProperitiesForMultipleSelect": function() {
            this._commonPropertiesToolbar.show(["properties-right-menu"], WhiteboardTool.Views.templates);
            WhiteboardTool.Views.accManagerView.loadScreen("property-toolbar");
            this.$("#bring-to-front, #send-to-back").hide();
        },

        /**
         * Handles the selection and deselection of shapes based on current event object.
         * @method _handleSelection
         * @params {Object} eventObject
         * @private
         */
        "_handleSelection": function(eventObject) {
            var curHitShape = this._getShapeUnderCords(eventObject.point),
                bShapeHit = false,
                selectedShape = null;

            // **************************************************************
            // Handle selection
            // If we don't have any hit shape or
            // the current shape being created is not our hit shape again. {In case of polygon, this can happen.}
            if (curHitShape === null || curHitShape !== this._addingObj) {
                if (curHitShape) {
                    bShapeHit = true;
                    if (!curHitShape.isSelected()) {
                        // If multiple selection by clicking is not allowed then remove the last selections.
                        if (!this._isCtrlSelect(eventObject)) {
                            this._clearShapeSelection();
                        }
                        if (this._arrSelectedShapes.length > 0) { //If multiple shapes are selected using control key
                            if (this._arrSelectedShapes.length === 1) {
                                //Remove rotate and resize handlers of previously selected shape
                                selectedShape = this._arrSelectedShapes[0];
                                selectedShape.deselect();
                                selectedShape.setOptions({
                                    "bAllowResize": false,
                                    "bAllowRotate": false
                                });
                                selectedShape.select();
                            }
                            //Draw bounds without rotate and resize handlers
                            curHitShape.setOptions({
                                "bAllowResize": false,
                                "bAllowRotate": false
                            });
                            curHitShape.select();
                            this._bindBoundsHandleEvents(curHitShape);
                        } else {
                            if (curHitShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Pencil || curHitShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Text) {
                                curHitShape.setOptions({
                                    "bAllowResize": false,
                                    "bAllowRotate": true,
                                    "bAllowSelectionBound": true
                                });
                            } else if (curHitShape.model.getData().nType === WhiteboardTool.Views.ShapeType.BackgroundImage) {
                                curHitShape.setOptions({
                                    "bAllowResize": false,
                                    "bAllowRotate": false
                                });
                            } else if (curHitShape.model.getData().nType === WhiteboardTool.Views.ShapeType.LineSegment) {
                                curHitShape.setOptions({
                                    "bAllowResize": true,
                                    "bAllowRotate": false
                                });
                            } else {
                                curHitShape.setOptions({
                                    "bAllowResize": true,
                                    "bAllowRotate": true
                                });
                            }
                            curHitShape.select();
                        }
                    } else {
                        //When second last selected shape is clicked, deselect the last remaining shape and again select it with rotate and resize handlers.
                        if (this._arrSelectedShapes.length === 2) {
                            curHitShape.deselect();
                            selectedShape = this._arrSelectedShapes[0];
                            selectedShape.deselect();
                            if (selectedShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Pencil || selectedShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Text) {
                                selectedShape.setOptions({
                                    "bAllowResize": false,
                                    "bAllowRotate": true,
                                    "bAllowSelectionBound": true
                                });
                            } else if (curHitShape.model.getData().nType === WhiteboardTool.Views.ShapeType.BackgroundImage) {
                                curHitShape.setOptions({
                                    "bAllowResize": false,
                                    "bAllowRotate": false
                                });
                            } else {
                                selectedShape.setOptions({
                                    "bAllowResize": true,
                                    "bAllowRotate": true
                                });
                            }
                            selectedShape.select();
                        } else {
                            curHitShape.deselect();
                        }
                    }
                } else {
                    this._clearShapeSelection();
                }
            }

            return {
                "objHitShape": curHitShape,
                "bHit": bShapeHit
            };
        },

        /**
         * Handles the rectangles for selection drawn while Select Tool.
         * @method _handleDragSelectionStart
         * @params {Object} eventObject
         * @private
         */
        "_handleDragSelectionStart": function(eventObject) {
            // Deselect any previous selected shapes
            this._clearShapeSelection();
            this._selectionPath = this.getShapeObject(WhiteboardTool.Views.ShapeType.Rectangle);
            this._selectionPath.setOptions({
                "strFillColor": null,
                "nStrokeWidth": 1,
                "nFillAlpha": 1,
                "strStrokeColor": "#a6a6a6"
            });
            this._selectionPath.processTouchStart(eventObject);
        },

        /**
         * Handles the rectangles for selection drawn while Select Tool.
         * @method _handleDragSelectionMove
         * @params {Object} eventObject
         * @private
         */
        "_handleDragSelectionMove": function(eventObject) {
            if (this._selectionPath._intermediatePath) {
                this._selectionPath._intermediatePath.remove();
            }
            this._selectionPath.processTouchMove(eventObject);
        },

        /**
         * Handles the rectangles for selection drawn while Select Tool.
         * @method _handleDragSelectionEnd
         * @params {Object} eventObject
         * @private
         */
        "_handleDragSelectionEnd": function(eventObject) {
            var strokeBounds = null,
                shapeStrokeBounds,
                shapeLen = this._arrShapes.length,
                shapeCounter = 0,
                curShape,
                shapesInSelectionRect = [],
                ShapeType = WhiteboardTool.Views.ShapeType,
                curShapeType = null;
            this._selectionPath.processTouchEnd(eventObject);
            strokeBounds = this._selectionPath.getBoundingRect();

            // Loop through all shapes to check if any shape comes within our bounds
            for (; shapeCounter < shapeLen; shapeCounter++) {
                curShape = this._arrShapes[shapeCounter];
                shapeStrokeBounds = curShape.getBoundingRect();

                if (MathUtilities.Components.Utils.Models.MathHelper.isRectInRect(shapeStrokeBounds, strokeBounds)) {
                    shapesInSelectionRect.push(curShape);
                }
            }

            //Remove resize and rotate handlers if multiple shapes are selected.
            shapeLen = shapesInSelectionRect.length;
            for (shapeCounter = 0; shapeCounter < shapeLen; shapeCounter++) {
                curShapeType = shapesInSelectionRect[shapeCounter].model.getData().nType;
                if (shapesInSelectionRect.length > 1) {
                    shapesInSelectionRect[shapeCounter].isMultipleSelection = true;
                    if (curShapeType === ShapeType.Pencil || curShapeType === ShapeType.LineSegment) {
                        shapesInSelectionRect[shapeCounter].setOptions({
                            "bAllowResize": false,
                            "bAllowRotate": false,
                            "bAllowSelectionBound": true
                        });
                    } else {
                        shapesInSelectionRect[shapeCounter].setOptions({
                            "bAllowResize": false,
                            "bAllowRotate": false
                        });
                    }
                } else {
                    if (curShapeType === ShapeType.Pencil || curShapeType === ShapeType.Text) {
                        shapesInSelectionRect[shapeCounter].setOptions({
                            "bAllowResize": false,
                            "bAllowRotate": true,
                            "bAllowSelectionBound": true
                        });
                    } else if (curShapeType === ShapeType.LineSegment) {
                        shapesInSelectionRect[shapeCounter].setOptions({
                            "bAllowResize": true,
                            "bAllowRotate": false
                        });
                    } else if (curShapeType !== ShapeType.BackgroundImage) {
                        shapesInSelectionRect[shapeCounter].setOptions({
                            "bAllowResize": true,
                            "bAllowRotate": true
                        });
                    }
                }
                if (curShapeType !== ShapeType.BackgroundImage) {
                    shapesInSelectionRect[shapeCounter].select();
                }
                this._bindBoundsHandleEvents(shapesInSelectionRect[shapeCounter]);
            }
            if (shapesInSelectionRect.length === 1) {
                this._updateZIndexesOfShape();
            }
            // Remove the current selection bound drawn
            this._selectionPath._intermediatePath.remove();
            this._selectionPath.remove();
            this._selectionPath = null;
        },

        /**
         * Creates the shape based on the tool passed and adds needed behaviors.
         * @method getShapeObject
         * @params {String} strTool - Type of shape to be created.
         */
        "getShapeObject": function(strTool) {
            var curShape = this._createObject(strTool);
            curShape.setOptions(this.model.getCurrentSettings());
            return curShape;
        },

        /**
         * Checks if the passed shape is currently selected or not.
         * @method _isShapeSelected
         * @params {Object} oShape - Shape to be checked if it is selected or not.
         * @private
         */
        "_isShapeSelected": function(oShape) {
            return this._arrSelectedShapes.indexOf(oShape) !== -1;
        },

        /**
         * Redraws the entire view port. Only used for paper object redrawing.
         * @method _redraw
         * @private
         */
        "_redraw": function() {
            WhiteboardTool.Views.PaperScope.view.draw();
        },

        /**
         * Draws all the shape on the view.
         * @method draw
         * @public
         */
        "draw": function() {
            var shapeCounter = 0,
                curShape = null,
                shapesLen = this._arrShapes.length;

            for (; shapeCounter < shapesLen; shapeCounter++) {
                curShape = this._arrShapes[shapeCounter];
                curShape.draw();
            }
        },

        "updateObservableUniverse": function() {

            var currentlimits = this.gridGraph._gridGraphModelObject.get('_graphDisplayValues')._graphsAxisLimits.currentLimits,
                visibleDomain = {
                    "xmin": currentlimits.xLower,
                    "xmax": currentlimits.xUpper,
                    "ymin": currentlimits.yLower,
                    "ymax": currentlimits.yUpper
                },
                arrShapes = this._arrShapes,
                shape,
                bufferSpace = 1,
                arrRuler = this._rulerArray,
                ruler,
                point,
                endPoints,
                path = null,
                curShape = null,

                flexDomain = function(x, y) {
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
                },

                checkBoundaries = function(pathBounds) {
                    if (!pathBounds) {
                        return;
                    }
                    var arrEndPoint = [],
                        curPoint,
                        PaperScope = WhiteboardTool.Views.PaperScope,
                        TransformModel = MathUtilities.Tools.WhiteboardTool.Models.Transform;

                    arrEndPoint.push(TransformModel.toGraphCo(new PaperScope.Point(pathBounds.x, pathBounds.y)),
                        TransformModel.toGraphCo(new PaperScope.Point(pathBounds.x + pathBounds.width, pathBounds.y + pathBounds.height))
                    );

                    for (curPoint in arrEndPoint) {
                        flexDomain(arrEndPoint[curPoint].x, arrEndPoint[curPoint].y);
                    }
                };

            for (shape in arrShapes) {
                curShape = arrShapes[shape];
                path = curShape._intermediatePath;
                if (path !== void 0 && path !== null) {
                    checkBoundaries(path.bounds);
                }
            }

            for (ruler in arrRuler) {
                endPoints = arrRuler[ruler].model.getEndPoints();
                for (point in endPoints) {
                    flexDomain(endPoints[point].x, endPoints[point].y);
                }
            }

            this.gridGraph.callUpdateObservableUniverse(visibleDomain);
        },

        "recalculatePosition": function() {
            var shapeCounter = 0,
                curShape = null,
                shapesLen = this._arrShapes.length;

            for (; shapeCounter < shapesLen; shapeCounter++) {
                curShape = this._arrShapes[shapeCounter];
                curShape.updateRotationPoint();
                if (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Text) {
                    curShape.updateCanvasBounds();
                }
                curShape.draw();
            }

            this.updateCanvasBoundsForTexttool();
        },

        "recalculateAccDivPosition": function() {
            var shapeCounter = 0,
                arrShape = this._arrShapes,
                shapeLen = arrShape.length;

            for (; shapeCounter < shapeLen; shapeCounter++) {
                if (this._arrSelectedShapes.indexOf(arrShape[shapeCounter]) === -1) {
                    this.setShapeAccDivPosition(arrShape[shapeCounter], false);
                }
            }
            this._accOnShapeSelect(true);
        },

        "recalculateSizeForZoom": function() {
            var shapeCounter = 0,
                curShape = null,
                shapesLen = this._arrShapes.length;

            for (; shapeCounter < shapesLen; shapeCounter++) {
                curShape = this._arrShapes[shapeCounter];
                curShape.updateBoundingBoxFromGridsize();
            }
        },

        "updateCanvasBoundsForTexttool": function() {
            var TOP_OFFSET = WhiteboardTool.Views.Text.TOP_OFFSET,
                CanvasSize = WhiteboardTool.Views.CanvasSize,
                PADDING = {
                    "left": 5,
                    "top": 2
                },
                canvasBounds = {
                    "left": PADDING.left,
                    "top": TOP_OFFSET,
                    "width": CanvasSize.width - 2 * PADDING.left,
                    "height": CanvasSize.height - PADDING.top
                },
                textToolView = WhiteboardTool.Views.Text.textToolView;

            if (textToolView) {
                textToolView.updateResizingData(canvasBounds);
            }
        },

        /**
         * Sends back the selected shapes.
         * @method _sendToBack
         * @private
         */
        "_sendToBack": function(event, args) {
            //Return if send-to-back button is disabled
            if (event && $(event.delegateTarget).children(".right-menu-item-icon").hasClass("button-disabled")) {
                return;
            }

            var arrShapes = args instanceof Array ? args : this._arrSelectedShapes,
                shapeCounter = null,
                currentShape,
                canvasChildren = WhiteboardTool.Views.PaperScope.project.activeLayer.children,
                shapeIndex = null,
                previousState = null,
                currentState = null,
                shapeLen = arrShapes.length;

            for (shapeCounter = 0; shapeCounter < shapeLen; shapeCounter++) {
                currentShape = arrShapes[shapeCounter];
                shapeIndex = $.inArray(currentShape, this._arrShapes);
                if (shapeIndex === 0) { //Return if shape is already behind all other shapes
                    return;
                }
                if (this._arrShapes[0].model.getData().nType === WhiteboardTool.Views.ShapeType.BackgroundImage &&
                    currentShape.model.getData().nType !== WhiteboardTool.Views.ShapeType.BackgroundImage) {

                    this._arrShapes.splice(shapeIndex, 1);
                    this._arrShapes.splice(1, 0, currentShape);
                } else {
                    this._arrShapes.splice(shapeIndex, 1);
                    this._arrShapes.splice(0, 0, currentShape);
                }
            }
            previousState = {
                "zIndex": this.getUndoDataForSendBring(currentShape)
            };

            this._updateShapeZIndex();

            if (this._arrSelectedShapes.length === 1) {
                currentShape = this._arrSelectedShapes[0];
                currentShape._savePreviousState(previousState);
                shapeIndex = canvasChildren.indexOf(currentShape._intermediatePath);
                shapeLen = this._zIndexofShapes.length;
                for (shapeCounter = 0; shapeCounter < shapeLen; shapeCounter++) {
                    if (this._zIndexofShapes[shapeCounter].id === currentShape.getId()) {
                        this._zIndexofShapes[shapeCounter].zIndex = shapeIndex;
                    }
                }
                this._updateZIndexesOfShape();
                currentState = {
                    "zIndex": this.getUndoDataForSendBring(currentShape)
                };
                currentShape._saveCurrentState(currentState);

                currentShape.drawBounds();
                this._redraw();

                // Set the current action name to be transform. Used in undo redo while saving states of shape.
                this._setCurrentActionName(WhiteboardTool.Views.UndoRedoActions.SendBack);
                // Save the data into the stack, as we have all data ready to extract.
                this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());
            }
        },

        /**
         * Change Shapes Z-index as per there indices in arrShapes
         * @method _updateShapeZIndex
         * @private
         */
        "_updateShapeZIndex": function() {
            var arrShapes = this._arrShapes,
                shape = null,
                curShape;
            for (shape in arrShapes) {
                curShape = arrShapes[shape];
                curShape.model.setOptions({
                    "zIndex": shape
                });
                curShape.updatePathZindex();
            }
        },

        "getUndoDataForSendBring": function(currentShape) {
            if (typeof currentShape === "undefined") {
                return void 0;
            }
            var newObject = null,
                zIndexArray = [],
                looper,
                arrayLength = this._zIndexofShapes.length;

            for (looper = 0; looper < arrayLength; looper++) {
                newObject = {
                    "id": this._zIndexofShapes[looper].id,
                    "zIndex": this._zIndexofShapes[looper].zIndex,
                    "currentShape": currentShape.cid
                };
                zIndexArray.push(newObject);
            }
            return zIndexArray;
        },

        /**
         * Bring forward the selected shapes.
         * @method _bringToForward
         * @private
         */
        "_bringToForward": function(event) {
            //Return if bring-to-forward button is disabled
            if (event && $(event.delegateTarget).children(".right-menu-item-icon").hasClass("button-disabled")) {
                return;
            }

            var arrShapes = this._arrSelectedShapes,
                shapeCounter = null,
                currentShape,
                canvasChildren = WhiteboardTool.Views.PaperScope.project.activeLayer.children,
                shapeIndex = null,
                previousState = null,
                currentState = null,
                shapeLen = arrShapes.length;

            for (shapeCounter = 0; shapeCounter < shapeLen; shapeCounter++) {
                currentShape = arrShapes[shapeCounter];
                shapeIndex = $.inArray(currentShape, this._arrShapes);
                this._arrShapes.splice(shapeIndex, 1);
                this._arrShapes.push(currentShape);
            }
            this._updateZIndexesOfShape();
            previousState = {
                "zIndex": this.getUndoDataForSendBring(currentShape)
            };
            this._updateShapeZIndex();

            if (this._arrSelectedShapes.length === 1) {
                currentShape = this._arrSelectedShapes[0];
                currentShape._savePreviousState(previousState);
                shapeIndex = canvasChildren.indexOf(currentShape._intermediatePath);
                shapeLen = this._zIndexofShapes.length;
                for (shapeCounter = 0; shapeCounter < shapeLen; shapeCounter++) {
                    if (this._zIndexofShapes[shapeCounter].id === currentShape.getId()) {
                        this._zIndexofShapes[shapeCounter].zIndex = shapeIndex;
                    }
                }

                this._updateZIndexesOfShape();
                currentState = {
                    "zIndex": this.getUndoDataForSendBring(currentShape)
                };

                currentShape._saveCurrentState(currentState);
                this._redraw();

                // Set the current action name to be transform. Used in undo redo while saving states of shape.
                this._setCurrentActionName(WhiteboardTool.Views.UndoRedoActions.BringForward);
                // Save the data into the stack, as we have all data ready to extract.
                this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());
            }
        },

        /**
         * Clears the shape from current shape selection, if no shape passed, removes all the shapes.
         * @method _clearShapeSelection
         * @params {Object} Shape object that has to be removed from the selected shape's collection.
         * @private
         */
        "_clearShapeSelection": function(oShape) {
            var curShape = null,
                len, shapeCounter;
            if (oShape) {
                oShape.deselect();
            } else {
                curShape = null;
                len = this._arrSelectedShapes.length;
                for (shapeCounter = len - 1; shapeCounter >= 0; shapeCounter--) {
                    curShape = this._arrSelectedShapes[shapeCounter];
                    curShape.deselect({
                        "suppressEvent": true
                    });
                    curShape.isMultipleSelection = false;
                }
                this._arrSelectedShapes.length = 0;
            }
            this._redraw();
            this._updateEditOption();
        },

        // Methods supporting new shapes

        /**
         * Factory method for creating shapes as per the passed type.
         * @method _createObject
         * @params {String} strObjType Shape type stored in enum of shapes type possible.
         * @private
         */
        "_createObject": function(strObjType) {
            var ShapeType = WhiteboardTool.Views.ShapeType,
                options = {
                    "el": this.$el
                };

            switch (strObjType) {
                case ShapeType.Circle:
                    return new WhiteboardTool.Views.Circle(options);

                case ShapeType.LineSegment:
                    return new WhiteboardTool.Views.Line(options);

                case ShapeType.DashedSegment:
                    options.dashed = true;
                    return new WhiteboardTool.Views.Line(options);

                case ShapeType.DashedArrow:
                    options.dashed = true;
                    options.arrow = true;
                    return new WhiteboardTool.Views.Line(options);

                case ShapeType.SolidArrow:
                    options.arrow = true;
                    return new WhiteboardTool.Views.Line(options);

                case ShapeType.RightTriangle:
                    return new WhiteboardTool.Views.RightTriangle(options);
                case ShapeType.Triangle:
                    options.sides = 3;
                    return new WhiteboardTool.Views.RegularShape(options);
                case ShapeType.Square:
                    options.sides = 4;
                    return new WhiteboardTool.Views.RegularShape(options);
                case ShapeType.Pentagon:
                    options.sides = 5;
                    return new WhiteboardTool.Views.RegularShape(options);
                case ShapeType.Hexagon:
                    options.sides = 6;
                    return new WhiteboardTool.Views.RegularShape(options);
                case ShapeType.Ellipse:
                    return new WhiteboardTool.Views.Ellipse(options);
                case ShapeType.Rectangle:
                    return new WhiteboardTool.Views.Rectangle(options);
                case ShapeType.Parallelogram:
                    return new WhiteboardTool.Views.Parallelogram(options);
                case ShapeType.Trapezium:
                    return new WhiteboardTool.Views.Trapezium(options);
                case ShapeType.Pencil:
                    return new WhiteboardTool.Views.BasePen(options);
                case ShapeType.Image:
                    return new WhiteboardTool.Views.Image(options);
                case ShapeType.BackgroundImage:
                    return new WhiteboardTool.Views.BackgroundImage(options);
                case ShapeType.Text:
                    return new WhiteboardTool.Views.Text(options);
                case ShapeType.Arrow:
                    return new WhiteboardTool.Views.Arrow(options);
                case ShapeType.Polygon:
                    return new WhiteboardTool.Views.Polygon(options);
                default:
                    return null;
            }
        },

        "_getImageFile": function() {
            var $file = $(WhiteboardTool.Views.templates["image-file"]().trim());

            this.$("#whiteboard").append($file);
            $file.hide();
            $file.on("change", _.bind(this.loadImage, this));
            $file.trigger("click");

            this.$("#select-tool").trigger("click");
            if (WhiteboardTool.Views.isAccessible) {
                WhiteboardTool.Views.accManagerView.setFocus("shape-tool-focus-rect");
            }
        },
        "loadImage": function(event) {
            if (!window.FileReader) {
                return;
            }
            var files = event.target.files,
                reader,
                managerView = WhiteboardTool.Views.accManagerView,
                setFocusFunc = null,
                imageType = /image\/(jpeg|jpg|png|bmp)/i; //to check supported image format

            reader = new window.FileReader();
            reader.onload = _.bind(function(frEvent) {
                this._getImage({
                    "img": frEvent.target.result
                });

            }, this);
            if (files[0].type.match(imageType) !== null) {
                reader.readAsDataURL(files[0]);
            } else {
                setFocusFunc = function() {
                    managerView.setFocus("image-tool");
                };
                this._showCustomPopup("img-format", setFocusFunc, setFocusFunc);
            }

        },

        "_getImage": function(event) {
            this.imageData = event.img;

            this._curShapeTool = WhiteboardTool.Views.ShapeType.Image;
            this.$("#change-opacity-text-box").val("");
            this._imageView = this.addShapeObject(this._curShapeTool);

            this._imageView.model.setOptions({
                "imageData": this.imageData,
                "nFillAlpha": 1
            });
            this._imageView._bLoaded = true;
            this._imageView.draw(true);
        },

        "_getShapeUnderHandler": function(objPoint) {
            var selectedShapes = this._arrSelectedShapes,
                selectedShapeCounter = selectedShapes.length - 1,
                curShape = null;
            for (; selectedShapeCounter >= 0; selectedShapeCounter--) {
                curShape = selectedShapes[selectedShapeCounter];
                if (curShape && curShape._selectionBound) {
                    if (curShape._selectionBound._rotateHandlePath !== null && curShape._selectionBound._rotateHandlePath.hitTest(objPoint)) {
                        return curShape;
                    }
                    if (curShape._selectionBound._resizeHandlePath !== null && curShape._selectionBound._resizeHandlePath.hitTest(objPoint)) {
                        return curShape;
                    }
                    if (curShape._selectionBound._intermediatePath !== null && curShape._selectionBound._intermediatePath.hitTest(objPoint)) {
                        return curShape;
                    }
                }
            }

            return null;
        },

        /**
         * Returns the shape that comes under the passed coordinates, Point object.
         * @method _getShapeUnderCords
         * @params {Object} objPoint that denotes a point object.
         * @private
         * @returns {Object} Returns first shape that comes under the point else returns null.
         */
        "_getShapeUnderCords": function(objPoint) {
            var shapeCounter = this._arrShapes.length - 1,
                curShape = null;
            for (; shapeCounter >= 0; shapeCounter--) {
                curShape = this._arrShapes[shapeCounter];
                if (curShape.isHit(objPoint)) {
                    return curShape;
                }
            }

            return null;
        },

        /**
         * Returns the shape, if any of the shape matches the criteria.
         * @method _getShapeById
         * @params {String} strId -- Id of the shape.
         * @private
         * @returns Returns shape that has the same Id as passed.
         */
        "_getShapeById": function(strId) {
            var shapeCounter = this._arrShapes.length - 1,
                curShape = null;
            for (; shapeCounter >= 0; shapeCounter--) {
                curShape = this._arrShapes[shapeCounter];
                if (curShape.getId() === strId) {
                    return curShape;
                }
            }
            return null;
        },

        /**
         * Returns True if touch occurred in processTouchStart, so that further mouse moves are not processed.
         * @method _isValidMove
         * @private
         * @returns True if move is valid else returns false.
         */
        "_isValidMove": function() {
            return this._bHasTouchOccurred;
        },

        /**
         * Changes the current tool property of app.
         * @event _onToolPropertyChange
         * @params {Object} toolDataObj -- Tool data object that let the change in current tool.
         * @private
         */
        "_onToolPropertyChange": function(toolDataObj) {
            var data = {},
                manager = WhiteboardTool.Views.accManagerView,
                divNumber = null,
                accDivObject = null,
                $shapeAccDiv = null,
                dontStorePrvState = toolDataObj.dontStorePrvState;

            if (MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.FillColor === toolDataObj.toolGroup) {
                data.strFillColor = toolDataObj.toolValue;
                data.actionName = WhiteboardTool.Views.UndoRedoActions.ColorAndStroke;
                this._currentFillColor = toolDataObj.toolValue;
                if (this._currentFillColor !== "no-fill") {
                    this._fillColorHexCode = toolDataObj.toolValue;
                }
            } else if (MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.StrokeColor === toolDataObj.toolGroup) {
                data.strStrokeColor = toolDataObj.toolValue;
                data.actionName = WhiteboardTool.Views.UndoRedoActions.ColorAndStroke;
                this._currentStrokeColor = toolDataObj.toolValue;
                if (this._currentStrokeColor !== "no-stroke") {
                    this._strokeColorHexCode = toolDataObj.toolValue;
                }
            } else if (MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.StrokeSize === toolDataObj.toolGroup) {
                data.nStrokeWidth = toolDataObj.toolValue;
                data.actionName = WhiteboardTool.Views.UndoRedoActions.ColorAndStroke;
                this._currentStrokeWidth = toolDataObj.toolValue;

                if (this._arrSelectedShapes[0] && WhiteboardTool.Views.isAccessible) {
                    for (accDivObject in this._accdivObjectMapping) {
                        if (this._accdivObjectMapping[accDivObject] === this._arrSelectedShapes[0]) {
                            divNumber = this._getAccDivNumber($("#" + accDivObject).parent(".shape-focusdiv"));
                            break;
                        }
                    }
                    if (divNumber !== null) {
                        $shapeAccDiv = this.$(".shape-focusdiv[shape-focusdiv-number=" + divNumber + "]");
                        this.setAccDivPosition($shapeAccDiv, true);
                    }
                }
                //set focus to handle
                manager.setFocus("slider-Handle");
            } else if (MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.FillOpacity === toolDataObj.toolGroup) {
                data.nFillAlpha = toolDataObj.nFillAlpha;
                data.actionName = WhiteboardTool.Views.UndoRedoActions.ColorAndStroke;
            } else if (MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.Rotate === toolDataObj.toolGroup) {
                data.nRotation = toolDataObj.angle;
                data.actionName = WhiteboardTool.Views.UndoRedoActions.Transform;
            }

            this.model.setOptions(data);
            //Apply style to currently selected shape
            this.applyOptions(this._arrSelectedShapes, data, dontStorePrvState);

            if (toolDataObj.registerToStack !== false && this._arrSelectedShapes.length && WhiteboardTool.Views.CurTool !== WhiteboardTool.Views.ShapeType.Pencil) {
                // Set the current action name to be transform. Used in undo redo while saving states of shape.
                this._setCurrentActionName(data.actionName);

                // Save the data into the stack, as we have all data ready to extract.
                this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());
            }
        },

        "_populateAndShowPropertiesToolBar": function(toolDataObj) {
            var ShapeType = WhiteboardTool.Views.ShapeType,
                ToolType = WhiteboardTool.Views.ToolType,
                arrPropertyHide = [ShapeType.None, ShapeType.Image, ShapeType.Text, ShapeType.BackgroundImage, ShapeType.CanvasPan, ToolType.Copy, ToolType.Cut, ToolType.Paste];

            //Hide property toolbar for select, image, text and background tool
            if (arrPropertyHide.indexOf(toolDataObj.toolType) !== -1) {
                if (this._commonPropertiesToolbar.isVisible()) {
                    this._commonPropertiesToolbar.hide();
                }
            } else if (WhiteboardTool.Views.currentMenuTypeSelected !== toolDataObj.toolMenuType || this.$("#whiteboard-properties-toolbar").is(":hidden")) {
                this._commonPropertiesToolbar.show(WhiteboardTool.Views.MenuItems[toolDataObj.toolMenuType], WhiteboardTool.Views.templates);
                WhiteboardTool.Views.accManagerView.loadScreen("property-toolbar");
                WhiteboardTool.Views.currentMenuTypeSelected = toolDataObj.toolMenuType;
            }
        },

        "getIEVersion": function() {
            var rv = -1,
                ua, re;
            if (navigator.appName === "Microsoft Internet Explorer") {
                ua = navigator.userAgent;
                re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})"); //check ie version IE9 and higher.
                if (re.exec(ua) !== null) {
                    rv = parseFloat(RegExp.$1);
                }
            } else if (navigator.appName === "Netscape") {
                ua = navigator.userAgent;
                re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})"); //check ie version IE9 and higher.
                if (re.exec(ua) !== null) {
                    rv = parseFloat(RegExp.$1);
                }
            }
            return rv;
        },

        "_updateCanvasCursor": function(toolType) {
            var $canvas = this._whiteboardCanvas,
                BrowserCheck = MathUtilities.Components.Utils.Models.BrowserCheck,
                ieVersion = this.getIEVersion(),
                ShapeType = WhiteboardTool.Views.ShapeType;
            $canvas.attr("class", "");

            switch (toolType) {

                case ShapeType.Pencil:
                    if (BrowserCheck.isIE || ieVersion === 11) {
                        $canvas.addClass("whiteboard-marker-cursor-ie");
                    } else {
                        $canvas.addClass("whiteboard-marker-cursor");
                    }
                    break;
                case ShapeType.Circle:
                case ShapeType.LineSegment:
                case ShapeType.DashedSegment:
                case ShapeType.DashedArrow:
                case ShapeType.SolidArrow:
                case ShapeType.Arrow:
                case ShapeType.Ellipse:
                case ShapeType.RightTriangle:
                case ShapeType.Triangle:
                case ShapeType.Square:
                case ShapeType.Pentagon:
                case ShapeType.Hexagon:
                case ShapeType.Rectangle:
                case ShapeType.Parallelogram:
                case ShapeType.Trapezium:
                case ShapeType.Point5Star:
                case ShapeType.Point6Star:
                case ShapeType.Polygon:
                    $canvas.addClass("whiteboard-shape-cursor");
                    break;
                case ShapeType.Text:
                    $canvas.addClass("whiteBoard-text-cursor");
                    break;
                case ShapeType.CanvasPan:
                    $canvas.addClass("whiteBoard-move-cursor");
                    break;
                default:
                    if (BrowserCheck.isIE || ieVersion === 11) {
                        $canvas.addClass("whiteboard-arrow-cursor-ie");
                    } else {
                        $canvas.addClass("whiteboard-arrow-cursor");
                    }
                    break;
            }

        },

        /**
         * Changes the current tool of app.
         * @event _onCurToolChange
         * @params {Object} toolDataObj -- Tool data object that let the change in current tool.
         * @private
         */
        "_onCurToolChange": function(toolDataObj) {
            var data = null,
                prevToolType = WhiteboardTool.Views.CurTool;

            if (this._addingObj && !this._addingObj._drawText) {
                this.remove([this._addingObj]);
                this._addingObj.destroy();
                this._addingObj = null;
                this.unbindMouseMove();
            }
            WhiteboardTool.Views.CurTool = toolDataObj.toolType;
            // Check if last tool and curTool are not same, there may be dataValue changes at this time.
            if (MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.DrawingTool === toolDataObj.toolGroup) {
                this._updateCanvasCursor(toolDataObj.toolType);

                WhiteboardTool.Views.DrawingTool = toolDataObj.toolType;
                this._populateAndShowPropertiesToolBar(toolDataObj);

                //store current shape tool
                this._curShapeTool = WhiteboardTool.Views.DrawingTool;
                //Clears shape selection.
                this._clearShapeSelection();
                data = {
                    "strFillColor": this._currentFillColor,
                    "nStrokeWidth": this._currentStrokeWidth,
                    "strStrokeColor": this._currentStrokeColor
                };
                this.updatePropertyToolbar(data);
            } else if (MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.Default === toolDataObj.toolGroup) {
                if (WhiteboardTool.Views.CurTool === WhiteboardTool.Views.ToolType.Delete) {
                    this._onDelete();
                } else if (WhiteboardTool.Views.CurTool === WhiteboardTool.Views.ToolType.SaveAll) {
                    this.saveToLocalStorage();
                    WhiteboardTool.Views.CurTool = prevToolType;
                } else if (WhiteboardTool.Views.CurTool === WhiteboardTool.Views.ToolType.Retrieve) {
                    this.retrieveFromLocalStorage();
                    WhiteboardTool.Views.CurTool = prevToolType;
                } else if (WhiteboardTool.Views.CurTool === WhiteboardTool.Views.ToolType.BringToForward) {
                    this._bringToForward();
                } else if (WhiteboardTool.Views.CurTool === WhiteboardTool.Views.ToolType.SendToBack) {
                    this._sendToBack();
                }
                data = {
                    "strFillColor": this._currentFillColor,
                    "nStrokeWidth": this._currentStrokeWidth,
                    "strStrokeColor": this._currentStrokeColor
                };
                this.updatePropertyToolbar(data);
            } else if (MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.UndoRedoReset === toolDataObj.toolGroup) {
                if (MathUtilities.undoManager) {
                    if (WhiteboardTool.Views.CurTool === WhiteboardTool.Views.ToolType.Undo) {
                        // Undo action
                        this._callUndo();



                        WhiteboardTool.Views.CurTool = prevToolType;

                    } else if (WhiteboardTool.Views.CurTool === WhiteboardTool.Views.ToolType.Redo) {
                        // Redo action
                        this._callRedo();


                        WhiteboardTool.Views.CurTool = prevToolType;
                    } else if (WhiteboardTool.Views.CurTool === WhiteboardTool.Views.ToolType.Reset) {
                        this.resetToolState();
                        WhiteboardTool.Views.CurTool = prevToolType;
                    }
                }
                if (MathUtilities.undoManager.isUndoAvailable("whiteboard") || MathUtilities.undoManager.isRedoAvailable("whiteboard")) {
                    data = {
                        "strFillColor": this._currentFillColor,
                        "nStrokeWidth": this._currentStrokeWidth,
                        "strStrokeColor": this._currentStrokeColor
                    };
                    this.updatePropertyToolbar(data);
                }
            } else if (MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.Edit === toolDataObj.toolGroup) {
                switch (WhiteboardTool.Views.CurTool) {
                    case WhiteboardTool.Views.ToolType.Copy:
                        this.performCopyOperation();
                        break;

                    case WhiteboardTool.Views.ToolType.Cut:
                        this.performCutOperation();
                        break;

                    case WhiteboardTool.Views.ToolType.Paste:
                        this.performPasteOperation();
                        break;
                }
            } else if (MathUtilities.Tools.Toolbar.WhiteboardTool.Views.Group.Graph === toolDataObj.toolGroup) {
                this.setGraphType(WhiteboardTool.Views.CurTool, false, false, true);
            }

        },

        "triggerCanvasClick": function() {
            if (WhiteboardTool.Views.DrawingTool === WhiteboardTool.Views.ShapeType.CanvasPan) {
                this.enableCanvasFakediv(WhiteboardTool.Views.accManagerView.getAccMessage("pan-tool", 1), "whiteboard-canvas-fakediv");
            } else {
                if (WhiteboardTool.Views.DrawingTool === WhiteboardTool.Views.ShapeType.Text) {
                    WhiteboardTool.Views.accManagerView.setFocus('whiteboard-canvas-fakediv');
                }
                //Trigger Mousedown n Mouseup on canvas when tool is changed with accessibility
                var canvasContainer = this.$("#whiteboard-canvas-container"),
                    pointX = canvasContainer.width(),
                    pointY = canvasContainer.height(),
                    mouseEvent = {
                        "point": new WhiteboardTool.Views.PaperScope.Point(pointX / 2, pointY / 2),
                        "event": {
                            "which": 1,
                            "triggered": true
                        }
                    };

                WhiteboardTool.Views.PaperScope.tool.fire("mousedown", mouseEvent);
                WhiteboardTool.Views.PaperScope.tool.fire("mouseup", mouseEvent);
                if (WhiteboardTool.Views.DrawingTool === WhiteboardTool.Views.ShapeType.Polygon) {
                    mouseEvent.point.x += 10; // padding for next point
                    WhiteboardTool.Views.PaperScope.tool.fire("mousemove", mouseEvent);
                    this.enableCanvasFakediv("", "whiteboard-canvas-fakediv");
                }
                this._redraw();
            }
        },

        "_handleUndoRedoShapeFrontBackAction": function(arrShapeStates) {
            var allShapes = this._arrShapes,
                totalShapes = allShapes.length,
                shapeCounter,
                currentShape,
                shapeIndex,
                zIndexShapesCounter,
                zIndexesOfShape = arrShapeStates[0].zIndex,
                zIndexShapesLength = zIndexesOfShape.length;

            this._clearShapeSelection();
            for (shapeCounter = 0; shapeCounter < totalShapes; shapeCounter++) {
                currentShape = allShapes[shapeCounter];
                for (zIndexShapesCounter = 0; zIndexShapesCounter < zIndexShapesLength; zIndexShapesCounter++) {
                    if (zIndexesOfShape[zIndexShapesCounter].id === currentShape.getId()) {
                        shapeIndex = zIndexesOfShape[zIndexShapesCounter].zIndex;
                        currentShape.updatePathZindex(shapeIndex);
                    }
                    if (currentShape.cid === zIndexesOfShape[zIndexShapesCounter].currentShape && !currentShape.model.getData().bSelected) {
                        currentShape.select();
                    }
                }
            }
            this._updateZIndexesOfShape();
            if (this._arrSelectedShapes.length === 0 && this.$("#whiteboard-properties-toolbar").is(":hidden")) {
                this._commonPropertiesToolbar.show(WhiteboardTool.Views.MenuItems[WhiteboardTool.Views.currentMenuTypeSelected], WhiteboardTool.Views.templates);
            }
            this._redraw();
        },

        "_handleUndoRedoShapeTransformAction": function(arrShapeStates) {
            var iShapesLen = arrShapeStates.length,
                curShape,
                shapeCounter = 0,
                curState = null,
                accDivObject = null,
                divNumber = null;

            if (iShapesLen !== 0) {
                this._clearShapeSelection();
            }
            for (; shapeCounter < iShapesLen; shapeCounter++) {
                curState = arrShapeStates[shapeCounter];
                curShape = this._getShapeById(curState.id);
                if (curShape) {

                    curShape.parseData(curState);
                    curShape.updateRotationPoint();
                    curShape.draw();
                    if (WhiteboardTool.Views.isAccessible) {
                        for (accDivObject in this._accdivObjectMapping) {
                            if (this._accdivObjectMapping[accDivObject] === curShape) {
                                divNumber = this._getAccDivNumber($("#" + accDivObject).parent(".shape-focusdiv"));
                                break;
                            }
                        }
                        if (divNumber !== null) {
                            this.setAccDivPosition(this.$(".shape-focusdiv[shape-focusdiv-number=" + divNumber + "]"), true);
                        }
                        this._removeAccFocusRect();
                    }

                    this._currentFillColor = curState.strFillColor || curState.shapeData.strFillColor;
                    this._currentStrokeWidth = curState.nStrokeWidth || curState.shapeData.nStrokeWidth;
                    this._currentStrokeColor = curState.strStrokeColor || curState.shapeData.strStrokeColor;
                    this.updatePropertyToolbar(curState);
                }

            }

            this._redraw();
        },

        "_handleUndoRedoAddDeleteAction": function(arrShapeStates) {
            var iShapesLen = arrShapeStates.length,
                curShape,
                shapeCounter = 0,
                selectedShapeCounter = 0,
                accDivObject = null,
                divNumber = null,
                curState = null,
                arrSelectedShapes = null,
                selectedShapesLength = null,
                shapes = null,
                shape = null,
                zIndex = null,
                zIndexOfShapes = null,
                zIndexOfShapesLength = null,
                shapeCnt = null,
                selectedShapesCnt = 0,
                managerView = WhiteboardTool.Views.accManagerView,
                selectedShapeLength = this._arrSelectedShapes.length,
                data;

            for (; shapeCounter < iShapesLen; shapeCounter++) {
                if (arrShapeStates[shapeCounter].shapeData !== void 0 && arrShapeStates[shapeCounter].shapeData.bSelected) {
                    selectedShapesCnt++;
                }
            }
            this._clearShapeSelection();

            shapes = this._arrShapes;
            for (shapeCounter = 0; shapeCounter < iShapesLen; shapeCounter++) {
                curState = arrShapeStates[shapeCounter];
                curShape = this._getShapeById(curState.id);
                if (curShape) {
                    if (curState && curState.bRemove === true) {
                        curShape.deselect();
                        if (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Pencil) {
                            this._updateCanvasCursor(WhiteboardTool.Views.ShapeType.Pencil);
                        }
                        if (WhiteboardTool.Views.isAccessible) {
                            //Remove Accessibility Divs when shape is deleted
                            for (accDivObject in this._accdivObjectMapping) {
                                if (this._accdivObjectMapping[accDivObject] === curShape) {
                                    divNumber = this._getAccDivNumber(this.$("#" + accDivObject).parent(".shape-focusdiv"));
                                    break;
                                }
                            }
                            this.$("[shape-focusdiv-number=" + divNumber + "]").parent(".focusDivContainer").remove();
                            this._removeAccFocusRect();
                            if (typeof divNumber !== "undefined" && divNumber !== null) {
                                delete this._accdivObjectMapping[accDivObject];
                            }
                        }
                        this.remove([curShape]);
                        if (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.BackgroundImage) {
                            this._selectedBackground = null;
                            this._shapeToolbar.trigger("background-change", {
                                "selectedBackground": this._selectedBackground
                            });
                        }
                        if (shapes.length > 0) {
                            //Remove selection of other shapes
                            arrSelectedShapes = this._arrSelectedShapes;
                            selectedShapesLength = arrSelectedShapes.length;
                            for (selectedShapeCounter = 0; selectedShapeCounter < selectedShapesLength; selectedShapeCounter++) {
                                shape = arrSelectedShapes[selectedShapeCounter];
                                if (typeof shape !== "undefined" && shape !== curShape) {
                                    shape.deselect();
                                }
                            }
                        }
                    } else {
                        if (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.BackgroundImage) {
                            curShape.model.setOptions({
                                "imageData": curState.shapeData.imageData
                            });
                            curShape.draw();
                            this._updateShapeZIndex();
                            this._shapeToolbar.trigger("background-change", {
                                "selectedBackground": this._selectedBackground
                            });
                        } else if (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Text) {
                            curShape.parseData(curState);
                            curShape.updateRotationPoint();
                            curShape.draw();
                            this.setShapeAccDivPosition(curShape);
                        }
                    }
                } else {
                    if (curState.shapeData.nType === WhiteboardTool.Views.ShapeType.BackgroundImage) {
                        curShape = this.addShapeObject(curState.shapeData.nType);
                        curShape.setOptions({
                            "imageData": curState.shapeData.imageData
                        });
                        this._shapeToolbar.trigger("background-change", {
                            "selectedBackground": this._selectedBackground
                        });
                    } else if (curState.shapeData.nType === WhiteboardTool.Views.ShapeType.Image) {
                        this._imageView = curShape = this.addShapeObject(curState.shapeData.nType);
                        curShape.model.setOptions({
                            "scaleFactor": curState.scaleFactor,
                            "imageData": curState.shapeData.imageData
                        });
                    } else {
                        curShape = this.addShapeObject(curState.shapeData.nType);
                    }
                    curShape.parseData(curState);
                    if (selectedShapesCnt !== 0) {
                        if (selectedShapesCnt > 1) {
                            curShape.setOptions({
                                "id": curState.id,
                                "bAllowRotate": false,
                                "bAllowResize": false
                            });
                        } else {
                            if (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Pencil || curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Text) {
                                curShape.setOptions({
                                    "id": curState.id,
                                    "bAllowSelectionBound": true,
                                    "bAllowResize": false,
                                    "bAllowRotate": true
                                });
                            } else if (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.LineSegment) {
                                curShape.setOptions({
                                    "id": curState.id,
                                    "bAllowResize": true,
                                    "bAllowRotate": false
                                });
                            } else if (curShape.model.getData().nType !== WhiteboardTool.Views.ShapeType.BackgroundImage) {
                                curShape.setOptions({
                                    "id": curState.id,
                                    "bAllowRotate": true,
                                    "bAllowResize": true
                                });
                            } else {
                                curShape.setOptions({
                                    "id": curState.id
                                });
                            }
                        }
                    } else if (iShapesLen > 1) {
                        curShape.setOptions({
                            "id": curState.id,
                            "bAllowRotate": false,
                            "bAllowResize": false
                        });
                    } else {
                        if (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Pencil || curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.Text) {
                            curShape.setOptions({
                                "id": curState.id,
                                "bAllowSelectionBound": true,
                                "bAllowResize": false,
                                "bAllowRotate": true
                            });
                        } else if (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.LineSegment) {
                            curShape.setOptions({
                                "bAllowResize": true,
                                "bAllowRotate": false
                            });
                        } else if (curShape.model.getData().nType !== WhiteboardTool.Views.ShapeType.BackgroundImage) {
                            curShape.setOptions({
                                "id": curState.id,
                                "bAllowRotate": true,
                                "bAllowResize": true
                            });
                        } else {
                            curShape.setOptions({
                                "id": curState.id
                            });
                        }
                    }
                    //Redraw shapes as per zIndex
                    zIndexOfShapes = this._zIndexofShapes;
                    zIndexOfShapesLength = zIndexOfShapes.length;
                    for (shapeCnt = 0; shapeCnt < zIndexOfShapesLength; shapeCnt++) {
                        if (zIndexOfShapes[shapeCnt].id === curShape.cid) {
                            zIndex = zIndexOfShapes[shapeCnt].zIndex;
                        }
                    }
                    curShape.updateRotationPoint();
                    curShape.draw();
                    if (curShape.model.getData().nType === WhiteboardTool.Views.ShapeType.BackgroundImage) {
                        this._selectedBackground = curShape;
                        this._sendToBack(null, [curShape]);
                        this._shapeToolbar.trigger("background-change", {
                            "selectedBackground": this._selectedBackground
                        });
                    }
                    if (curShape._intermediatePath) {
                        curShape.updatePathZindex(zIndex);
                    }
                    this._updateZIndexesOfShape();
                    if (selectedShapesCnt !== 0) {
                        if (curState.shapeData.bSelected === true) {
                            curShape.select();
                        }
                    } else if (iShapesLen > 0) {
                        if (curShape.model.getData().nType !== WhiteboardTool.Views.ShapeType.BackgroundImage) {
                            curShape.select();
                        }
                    }
                    //Create Accessibility Divs
                    if (WhiteboardTool.Views.isAccessible) {
                        this._createAccessibilityDivs(curShape, false);
                    }
                }
            }
            if (this._addingObj) {
                this._updateCanvasCursor(WhiteboardTool.Views.DrawingTool);
            }
            if (this._arrSelectedShapes.length === 0) {
                if (WhiteboardTool.Views.DrawingTool === WhiteboardTool.Views.ShapeType.Pencil) {
                    this._commonPropertiesToolbar.show(WhiteboardTool.Views.MenuItems[WhiteboardTool.Views.MenuBarType.Marker], WhiteboardTool.Views.templates);
                    managerView.loadScreen("property-toolbar");

                    //if one shape is in selected state then change cursor to arrow
                    if (selectedShapeLength === 1) {
                        this._updateCanvasCursor(WhiteboardTool.Views.ShapeType.None);
                    }
                    data = {
                        "strFillColor": this._currentFillColor,
                        "nStrokeWidth": this._currentStrokeWidth,
                        "strStrokeColor": this._currentStrokeColor
                    };
                    this.updatePropertyToolbar(data);
                }
            } else {
                this._curShapeTool = WhiteboardTool.Views.ShapeType.None;
                WhiteboardTool.Views.CurTool = WhiteboardTool.Views.ShapeType.None;
                this._updateCanvasCursor(WhiteboardTool.Views.ShapeType.None);
                this.triggerSelectTool();
            }
            this._redraw();
        },

        /**
         * Apply the options on the list of shapes that are passed.
         * @params [Array] lstShapes Array of shapes.
         * @params [Object] objOptions Style or other object data that is to applied on array of shapes passed.
         * @param [Boolean] dontStorePrvState check to prevent update of previous state of shape.
         */
        "applyOptions": function(lstShapes, objOptions, dontStorePrvState) {
            var accDivObject = null,
                divNumber = null,
                shapeCounter = null,
                shapeLen = lstShapes.length;

            for (shapeCounter = 0; shapeCounter < shapeLen; shapeCounter++) {
                lstShapes[shapeCounter].applyOptions(objOptions, dontStorePrvState);

                //Rotate Accessibility divs
                if (WhiteboardTool.Views.isAccessible && objOptions.actionName === WhiteboardTool.Views.UndoRedoActions.Transform && objOptions.nRotation) {
                    for (accDivObject in this._accdivObjectMapping) {
                        if (this._accdivObjectMapping[accDivObject] === lstShapes[shapeCounter]) {
                            divNumber = this._getAccDivNumber(this.$("#" + accDivObject).parent(".shape-focusdiv"));
                        }
                    }
                    this.rotateAccDivs(this.$(".rotate-focusdiv[shape-focusdiv-number=" + divNumber + "]"), objOptions.nRotation);
                }
            }
            this._redraw();
        },


        /**
         * Checks if multiple selection with ctrl Key is applicable or not.
         * @method _isCtrlSelect
         * @param {Object} event, Jquery event object.
         * @private
         */
        "_isCtrlSelect": function(event) {
            return event.event.ctrlKey && navigator.appVersion.indexOf("Mac") === -1 || event.event.metaKey;
        },


        /**
         * Generates the unique Id for shapes.
         * @method _isCtrlSelect
         * @private
         */
        "generateNextId": function() {
            return "_id" + ++this._nIdCounter;
        },

        /*************************************************************************************
        Saving and retrieving of shapes and settings.
        *************************************************************************************/

        /**
         * Save current tool state at local storage.
         * @method saveToLocalStorage
         */
        "saveToLocalStorage": function() {
            var appState = this.saveState();
            $("#retrieve-state-textarea").val(JSON.stringify(appState));
            if (typeof window.localStorage !== "undefined" && window.localStorage !== null) {
                localStorage.MathToolsWhiteboardAppState = JSON.stringify(appState);
            }
        },

        /**
         * Return current tool-state object.
         * @method saveState
         * @return {Object} current state of tool
         */
        "saveState": function() {
            return this.getSyncData();
        },

        /**
         * Gets the entire application state as of now.
         * @method getSyncData
         * @public
         */
        "getSyncData": function() {
            // Get Toolbar states.
            // Get shape states
            // return them to the callee.
            var currentState = {
                "shape-toolbar": this._shapeToolbar.getSyncData(),
                "property_toolbar": this.getPropertySyncData(),
                "shape_data": this.getShapeSyncData(),
                "shape_zindex_data": this._getViewData(),
                "origin_data": this._getSyncOriginData()
            };


            return MathUtilities.Components.Utils.Models.Utils.convertToSerializable(currentState);
        },
        /* Get view object state
         * @method _getViewData
         * @return {Object} view state
         */
        "_getViewData": function() {
            return this._zIndexofShapes;
        },

        /**
         * Set view's object values.
         * @method _parseViewData
         * @param {object} view data value
         */
        "_parseViewData": function(data) {
            this._zIndexofShapes = data;
        },

        /**
         * Get property bar current state value
         * @method getPropertySyncData
         * @return {object} current property tool bar value
         */
        "getPropertySyncData": function() {
            return {
                "currentStrokeColor": this._currentStrokeColor,
                "currentFillColor": this._currentFillColor,
                "currentStrokeWidth": this._currentStrokeWidth
            };
        },
        /**
         * set default property bar data value
         * @method parsePropertyData
         * @param {object} property tool bar value
         */
        "parsePropertyData": function(data) {
            this._currentStrokeColor = data.currentStrokeColor;
            this._currentFillColor = data.currentFillColor;
            this._currentStrokeWidth = data.currentStrokeWidth;
        },
        /**
         * Gets the state of individual shapes.
         * @method getShapeSyncData
         * @param {Array} arrShapes, array of shape object.
         * @public
         */
        "getShapeSyncData": function(arrShapes) {
            arrShapes = arrShapes || this._arrShapes;
            var shapeData = [],
                shapeCounter = 0,
                iShapesLen = arrShapes.length,
                curShape = null;

            for (; shapeCounter < iShapesLen; shapeCounter++) {
                curShape = arrShapes[shapeCounter];
                shapeData.push(curShape.getSyncData());
            }

            return shapeData;
        },

        /**
         * Parses the data given and creates needed shapes.
         * @method _parseShapeData
         * @param {Object} objToLoad, shape's state object.
         * @private
         */
        "_parseShapeData": function(objToLoad) {
            var curShapeData = null,
                shapeCounter = 0,
                curShape,
                arrShapesData = objToLoad.shape_data,
                iShapesLen = arrShapesData.length,
                prevAddedShapes = this._arrShapes,
                isGraphCoord = true,
                SketchpadModel = WhiteboardTool.Models.Sketchpad,
                curRetrieveCode = SketchpadModel.RetrieveCode;

            if (curRetrieveCode === SketchpadModel.Retrieve_Codes.CanvasCood || curRetrieveCode === SketchpadModel.Retrieve_Codes.GraphCoodEqualRation) {
                //for store data in canvas coordinate and for graph to canvas
                isGraphCoord = false;
            }
            //Clear all previously drawn shapes before restoring from local
            if (prevAddedShapes.length > 0) {
                this._onDelete(null, this._arrShapes, true, true);
            }
            for (; shapeCounter < iShapesLen; shapeCounter++) {
                curShapeData = arrShapesData[shapeCounter];
                curShape = this.addShapeObject(curShapeData.shapeData.nType);
                if (curShapeData.shapeData.nType === WhiteboardTool.Views.ShapeType.Text) {
                    curShapeData.shapeData.imageData.base64 = "";
                }

                //when we set model value only that point we need to use different filter method
                WhiteboardTool.Models.Transform.retrieveCode = curRetrieveCode;
                curShape.parseData(curShapeData, isGraphCoord);
                curShape.setOptions({
                    "id": curShapeData.id
                });
                WhiteboardTool.Models.Transform.retrieveCode = '';
                curShape.updateRotationPoint();
                curShape.draw();
                //If shape is background image then add curshape in variable _selectedBackground
                if (curShapeData.shapeData.nType === WhiteboardTool.Views.ShapeType.BackgroundImage) {
                    this._selectedBackground = curShape;
                    this._shapeToolbar.trigger("background-change", {
                        "selectedBackground": this._selectedBackground
                    });
                } else {
                    this._createAccessibilityDivs(curShape, false);
                    if (curShapeData.shapeData.bSelected === true) {
                        this._onShapeSelect(curShape);
                    }
                }

            }
            this._redraw();
        },

        /**
         * Loads the given state data into the application view.
         * @method loadState
         * @param {Object} objToLoad, tool state to be retrieve.
         * @param {Boolean} dontSetFocus, check to set focus on title.
         * @public
         */
        "loadState": function(objToLoad, dontSetFocus) {
            objToLoad = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(objToLoad);
            this._shapeToolbar._isRetrievingState = true;
            WhiteboardTool.Models.Sketchpad.RetrieveCode = WhiteboardTool.Models.Sketchpad.Retrieve_Codes.New;

            var zIndex = objToLoad.shape_zindex_data || objToLoad.view_data && objToLoad.view_data.arrZIndex || [];
            this._parseOriginData(objToLoad.origin_data);
            this.parsePropertyData(objToLoad.property_toolbar);
            this._shapeToolbar.parseData(objToLoad["shape-toolbar"]);
            this._parseShapeData(objToLoad);
            this._parseViewData(zIndex);
            this.updateObservableUniverse();
            this._shapeToolbar._isRetrievingState = false;
            if (dontSetFocus !== true) {
                //for accessibility set focus to shape-tool
                WhiteboardTool.Views.accManagerView.setFocus("math-title-text-7", 10);
            }
        },

        /**
         * Save current tool state at local storage.
         * @method retrieveFromLocalStorage
         */
        "retrieveFromLocalStorage": function() {
            var localAppState = null,
                data = $("#retrieve-state-textarea").val().trim();
            if (data !== "") {
                localAppState = JSON.parse(data);
                this.retrieveState(localAppState);
            } else {
                if (typeof window.localStorage !== "undefined" && window.localStorage !== null) {
                    localAppState = localStorage.MathToolsWhiteboardAppState;
                    if (typeof localAppState !== "undefined" && localAppState !== null) {
                        localAppState = JSON.parse(localAppState);
                        this.retrieveState(localAppState);
                    }
                }
            }
        },

        "saveSuccess": function() {
            this.setDocumentClean();
        },

        "isDocumentDirty": function() {
            return this._isDirty;
        },

        "setDocumentDirty": function() {
            this._isDirty = true;
        },

        "setDocumentClean": function() {
            this._isDirty = false;
        },

        "retrieveState": function(localAppState) {
            var _retrieveState = _.bind(function(retrieveState) {
                this._isRetrievingState = true;
                this.loadState(retrieveState);
                this.clearUndoRedoStack();
                this.model.set("resetToolState", this.saveState());
                this._isRetrievingState = false;
                this._redraw();
                this.setDocumentClean();
            }, this);
            if (typeof WhiteboardTool.Models.Sketchpad._jsonData === "undefined") {
                $.ajax({
                    "url": WhiteboardTool.Models.Sketchpad.BASE_PATH + "data/tools/lang/en/tools/whiteboard/acc-data.json",
                    "success": _.bind(function(json) {
                        WhiteboardTool.Models.Sketchpad._jsonData = json;
                        this.setAccessibility();
                        if (localAppState) {
                            if (typeof localAppState.toolState !== "undefined") {
                                _retrieveState(localAppState.toolState);
                            } else {
                                _retrieveState(localAppState);
                            }
                        }
                    }, this)
                });
            } else {
                if (localAppState) {
                    if (typeof localAppState.toolState !== "undefined") {
                        _retrieveState(localAppState.toolState);
                    } else {
                        _retrieveState(localAppState);
                    }
                }
            }
        },

        /**
         * Clear undo-redo stack for Whiteboard-tool module
         * @method clearUndoRedoStack
         */
        "clearUndoRedoStack": function() {
            MathUtilities.undoManager.clearModule(WhiteboardTool.Views.ModuleName);
        },
        /*************************************************************************************
        Top level Undo and Redo code goes here
        *************************************************************************************/
        /**
         * The only entry point for UndoRedo manager to pass the undo/redo operation called.
         * @method execute
         * @params {String} actionName The type of action for which undo/redo has been done.
         * @params {Object} data  The data that denotes a state of the object for which undo/redo will get carried out.
         * @public
         */
        "execute": function(actionName, data) {
            var undoRedoAction = WhiteboardTool.Views.UndoRedoActions;
            this.setDocumentDirty();
            this.updateObservableUniverse();
            //create data clone
            data = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(data);
            switch (actionName) {
                case undoRedoAction.Transform:
                case undoRedoAction.ColorAndStroke:
                    this._handleUndoRedoShapeTransformAction(data);
                    break;
                case undoRedoAction.Add:
                case undoRedoAction.Remove:
                    this._handleUndoRedoAddDeleteAction(data);
                    break;
                case undoRedoAction.BringForward:
                case undoRedoAction.SendBack:
                    this._handleUndoRedoShapeFrontBackAction(data);
                    break;
                case undoRedoAction.CanvasPan:
                    this._handleUndoRedoCanvasPanAction(data);
                    break;
                case undoRedoAction.Reset:
                    this.loadState(data.toolState, true);
                    this.setDocumentDirty();
                    break;
                case undoRedoAction.GraphChange:
                    this.setGraphType(data.graphType, true, true);
                    break;
                case undoRedoAction.GraphOptChange:
                    this.changeGridOptions(data);
                    this.setGridOption(data);
                    break;
            }
            this.updateObservableUniverse();
        },

        /**
         * Saves the action state data of the shape/shapes into undomanager stack available.
         * @method _saveToUndoRedoStack
         * @param {Object} commandData, undoManager data.
         * @private
         */
        "_saveToUndoRedoStack": function(commandData) {
            var undoActionData, redoActionData;

            undoActionData = new MathUtilities.Components.Undo.Models.Action({
                "name": commandData.actionName,
                "data": MathUtilities.Components.Utils.Models.Utils.convertToSerializable(commandData.oldState), //store clone
                "manager": this
            });

            redoActionData = new MathUtilities.Components.Undo.Models.Action({
                "name": commandData.actionName,
                "data": MathUtilities.Components.Utils.Models.Utils.convertToSerializable(commandData.newState), //store clone
                "manager": this
            });
            MathUtilities.undoManager.registerAction(WhiteboardTool.Views.ModuleName, undoActionData, redoActionData);
            this.updateObservableUniverse();
            this.setDocumentDirty();
            this._enableDisableUndoBtn();
            this._enableDisableRedoBtn();
        },


        /**
         * _callUndo calls undo function of UndoRedoManager
         * @method _callUndo
         * @return void
         *
         */
        "_callUndo": function() {
            var managerView = WhiteboardTool.Views.accManagerView;

            MathUtilities.undoManager.undo(WhiteboardTool.Views.ModuleName);
            this._enableDisableUndoBtn();
            this._enableDisableRedoBtn();

            //Set focus on redo button if undo stack is empty and vice versa
            if (MathUtilities.undoManager._undoRedoStackMap.whiteboard && MathUtilities.undoManager._undoRedoStackMap.whiteboard.undo.length === 0) {
                this._reFocusElem("redo-btn", managerView.getAccMessage("redo-btn", 1));
                //redo button text is change to indicate everything is redo, this text is read by refocusing it.
                //time out is used to reset text to default
                _.delay(function() {
                    managerView.changeAccMessage("redo-btn", 0);
                }, 70);
            } else {
                managerView.setFocus("undo-btn");
            }
        },

        /**
         * _callRedoc calls redo of UndoRedoManager
         * @method _callRedo
         * @return void
         */
        "_callRedo": function() {
            var managerView = WhiteboardTool.Views.accManagerView;
            MathUtilities.undoManager.redo(WhiteboardTool.Views.ModuleName);
            this._enableDisableUndoBtn();
            this._enableDisableRedoBtn();

            //Set focus on redo button if undo stack is empty and vice versa
            if (MathUtilities.undoManager._undoRedoStackMap.whiteboard && MathUtilities.undoManager._undoRedoStackMap.whiteboard.redo.length === 0) {
                this._reFocusElem("undo-btn", managerView.getAccMessage("undo-btn", 1));
                //undo button text is change to indicate everything is undo, this text is read by refocusing it.
                //delay is used to reset text to default
                _.delay(function() {
                    managerView.changeAccMessage("undo-btn", 0);
                }, 70);
            } else {
                managerView.setFocus("redo-btn");
            }
        },

        "_getPreparedOldStateCommand": function(arrShapes) {
            var curShape = null,
                shapeCounter = 0,
                iShapesLen = 0,
                arrOldStateCommand = [];

            arrShapes = arrShapes || this._arrSelectedShapes;
            iShapesLen = arrShapes.length;

            for (; shapeCounter < iShapesLen; shapeCounter++) {
                curShape = arrShapes[shapeCounter];
                arrOldStateCommand.push(curShape._getPreviousState());
            }

            return arrOldStateCommand;
        },

        "_getPreparedNewStateCommand": function(arrShapes) {
            var curShape = null,
                shapeCounter = 0,
                iShapesLen = 0,
                arrNewStateCommand = [];

            arrShapes = arrShapes || this._arrSelectedShapes;
            iShapesLen = arrShapes.length;

            for (; shapeCounter < iShapesLen; shapeCounter++) {
                curShape = arrShapes[shapeCounter];
                arrNewStateCommand.push(curShape._getCurrentState());
            }

            return arrNewStateCommand;
        },

        "_getPreparedUndoRedoStateCommand": function(arrSelectedShapes) {
            var commandState = {};
            commandState.oldState = this._getPreparedOldStateCommand(arrSelectedShapes);
            commandState.newState = this._getPreparedNewStateCommand(arrSelectedShapes);
            commandState.actionName = this._getCurrentActionName();
            return commandState;
        },

        "_getCurrentActionName": function() {
            return this._strActionName;
        },

        "_setCurrentActionName": function(strActionName) {
            this._strActionName = strActionName;
        },

        "_onCanvasPanEnd": function(event) {
            var oldState = {},
                newState = {},
                commandData = {
                    "actionName": WhiteboardTool.Views.UndoRedoActions.CanvasPan,
                    "oldState": oldState,
                    "newState": newState
                },
                delta = event.delta;

            if (event.delta.x !== 0 || event.delta.y !== 0) {
                oldState.delta = delta.clone();
                newState.delta = delta.clone();

                oldState.delta.x = -oldState.delta.x;
                oldState.delta.y = -oldState.delta.y;

                this._setCurrentActionName(commandData.actionName);
                this._saveToUndoRedoStack(commandData);

            }
            return;
        },

        "_onCanvasPan": function(event) {
            var delta = event.delta;

            this._panBy(delta.x, delta.y);
        },

        "_panBy": function(dx, dy) {
            var TransformModel = WhiteboardTool.Models.Transform,
                currentOrigin = TransformModel.CURRENT_ORIGIN.canvasCo,
                defaultOrigin = TransformModel.DEFAULT_ORIGIN,
                shape = null,
                arrShapes = this._arrShapes,
                curShape = null,
                projectLayers = this.projectLayers,
                LAYERS_NAME = WhiteboardTool.Models.Sketchpad.LAYERS_NAME,
                layerDontPan = [LAYERS_NAME.SERVICE], //to restore layer bounds,which are pan through grid-graph.
                layerPrevBounds = {},
                saveLayerBounds = function() {
                    var layer, curLayer;
                    for (layer in layerDontPan) {
                        curLayer = projectLayers[layerDontPan[layer]];
                        layerPrevBounds[curLayer] = curLayer.bounds;
                    }
                },
                retrieveLayerBounds = function() {
                    var layer, curLayer;
                    for (layer in layerDontPan) {
                        curLayer = projectLayers[layerDontPan[layer]];
                        if (!MathUtilities.Components.Utils.Models.Utils.isEqual(layerPrevBounds[curLayer], curLayer.bounds)) {
                            curLayer.bounds = layerPrevBounds[curLayer];
                        }
                    }
                };
            saveLayerBounds();

            //pan grid layer
            this.gridGraph._panBy(dx, dy);

            retrieveLayerBounds();

            currentOrigin.x += dx;
            currentOrigin.y += dy;
            this._removeAccFocusRect();
            this._clearShapeSelection();
            defaultOrigin.graphCo = TransformModel.toGraphCo(defaultOrigin.canvasCo);
            for (shape in arrShapes) {
                curShape = arrShapes[shape];
                curShape.model.setRotationPoint(curShape.model.getRotationReferencePoint());
            }
            this.recalculateAccDivPosition();
            this.activateLayer(WhiteboardTool.Models.Sketchpad.LAYERS_NAME.SHAPE);
            this._redraw();
        },

        "_zoomGraph": function(event) {

            var deltaY, deltaX, delta, FIREFOX_DELTA_FACTOR = 100;

            event.preventDefault();

            if (event && event.originalEvent && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                deltaX = event.originalEvent.deltaX * FIREFOX_DELTA_FACTOR;
                deltaY = event.originalEvent.deltaY * FIREFOX_DELTA_FACTOR;
                delta = -event.originalEvent.deltaY * FIREFOX_DELTA_FACTOR;
            } else if (MathUtilities.Components.Utils.Models.BrowserCheck.isIE || this.getIEVersion() === 11) {
                deltaX = event.originalEvent.deltaX;
                deltaY = event.originalEvent.deltaY;
                delta = -deltaY;
            } else {
                deltaX = event.originalEvent.deltaX;
                deltaY = event.originalEvent.deltaY;
                delta = event.originalEvent.wheelDelta;
            }

            if (event.shiftKey) {
                this._removeAccFocusRect();
                this.gridGraph._zoomGraph(delta, true);
                this._zoomComplete();

            } else {
                this._panBy(deltaX, -deltaY);
            }
        },

        "_handleUndoRedoCanvasPanAction": function(data) {
            this._onCanvasPan(data);
            this.$("#select-tool").trigger("click");
        },

        /**
         * Copy current selected shape object.
         * @method performCopyOperation.
         * @param {Array} arrShape, array of shape object which to be copy
         * @param {Boolean} preventFocus, check to prevent canvas focus.
         */
        "performCopyOperation": function(arrShape, preventFocus) {
            arrShape = typeof arrShape === "undefined" || arrShape === null ? this._arrSelectedShapes : arrShape;

            if (arrShape.length !== 0) {
                this.model.set("copyData", MathUtilities.Components.Utils.Models.Utils.convertToSerializable(this.getShapeSyncData(arrShape)));
                this._updateEditOption();
                if (preventFocus !== true) {
                    var accManager = WhiteboardTool.Views.accManagerView,
                        accText = accManager.getAccMessage("copy-tool", 1);
                    this.enableCanvasFakediv(accText, "whiteboard-canvas-fakediv");
                }
            }
        },

        /**
         * Cut current selected shape object.
         * @method performCutOperation.
         */
        "performCutOperation": function() {
            if (this._arrSelectedShapes.length === 0) {
                return;
            }

            this.performCopyOperation(null, true);

            var shape = null,
                arrSelectShape = this._arrSelectedShapes,
                oldState = null,
                curState = null,
                curShape = null,
                accManager = WhiteboardTool.Views.accManagerView,
                accText;

            for (shape in arrSelectShape) {
                curShape = arrSelectShape[shape];

                // Undo redo state saves
                oldState = curShape.model.getCloneData();
                oldState = curShape.getViewOptions(oldState);
                oldState.id = curShape.getId();
                curShape._savePreviousState(oldState);

                curState = {
                    "bRemove": true,
                    "id": curShape.getId()
                };
                curShape._saveCurrentState(curState);

            }

            // Set the current action name to be transform. Used in undo redo while saving states of shape.
            this._setCurrentActionName(WhiteboardTool.Views.UndoRedoActions.Remove);
            // Save the data into the stack, as we have all data ready to extract.
            this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand(arrSelectShape));

            this._onDelete(null, this._arrSelectedShapes, true, true);
            this._removeAccFocusRect();
            this._commonPropertiesToolbar.hide();

            accText = accManager.getAccMessage("cut-tool", 1);
            this.enableCanvasFakediv(accText, "whiteboard-canvas-fakediv");
        },

        /**
         * Perform paste operation.
         * @method performPasteOperation
         */
        "performPasteOperation": function() {
            var copyShapes = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(this.model.get("copyData")),
                pasteShapes = [],
                shape = null,
                curShapeData = null,
                curShape = null,
                delta = {
                    "x": 20,
                    "y": 20
                },
                oldState, curState,
                paperChildren = WhiteboardTool.Views.PaperScope.project.activeLayer.children,
                accText,
                accManager = WhiteboardTool.Views.accManagerView,
                boundingBox,
                zindex = null,
                isMarker = false,
                ShapeType = WhiteboardTool.Views.ShapeType;

            if (copyShapes.length > 0) {
                //trigger select tool as new shape will be selected shape
                this.triggerSelectTool();

                this._clearShapeSelection();

                for (shape in copyShapes) {
                    curShapeData = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(copyShapes[shape]);

                    curShape = this.addShapeObject(curShapeData.shapeData.nType);
                    //for Marker Paste Operation is perform differently,as its draw function required each segment points
                    //first Marker drawing is drawn and then its translated
                    if (curShapeData.shapeData.nType === ShapeType.Pencil) {
                        isMarker = true;
                    }

                    zindex = curShape.model.get("_data").zIndex;


                    pasteShapes.push(curShape);

                    curShape.parseData(curShapeData);


                    if (!isMarker) {
                        boundingBox = curShape.model.getBoundingBox();
                        boundingBox.x += delta.x;
                        boundingBox.y += delta.y;
                        curShape.model.setBoundingBox(boundingBox);
                        curShape.model.setRotationPoint(curShape.model.getRotationReferencePoint());
                        curShape.model.setBackupBoundingBox(curShape.model.getBoundingBox());
                    }


                    curShape.draw();

                    if (isMarker) {
                        curShape._applyTranslation(null, delta.x, delta.y, true);
                        curShape.model.setBackupBoundingBox(curShape.model.getBoundingBox());
                    }
                    curShape.updatePathZindex(zindex);


                    // Undo redo state saves
                    oldState = {
                        "bRemove": true,
                        "id": curShape.getId()
                    };

                    curState = curShape.model.getCloneData();
                    curState = curShape.getViewOptions(curState);
                    curState.id = curShape.getId();

                    curShape._savePreviousState(oldState);
                    curShape._saveCurrentState(curState);

                    copyShapes.push(curShape);



                    //set zindex of shape in array
                    this._zIndexofShapes.push({
                        "id": curShape.getId(),
                        "zIndex": paperChildren.indexOf(curShape._intermediatePath)
                    });

                    this._createAccessibilityDivs(curShape, false);

                }

                this._redraw();

                this.performCopyOperation(pasteShapes, true);

                this.selectShapes(pasteShapes, true);
                // Set the current action name to be transform. Used in undo redo while saving states of shape.
                this._setCurrentActionName(WhiteboardTool.Views.UndoRedoActions.Add);
                // Save the data into the stack, as we have all data ready to extract.
                this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand(pasteShapes));

                accText = accManager.getAccMessage("paste-tool", 1);
                this.enableCanvasFakediv(accText, "whiteboard-canvas-fakediv");
            }
        },

        "triggerSelectTool": function() {
            this.$("#select-tool").trigger("click");
        },

        /**
         * Return origin data object,for saving origin state.
         * @method _getSyncOriginData
         * @return originData {object}
         * @private
         */
        "_getSyncOriginData": function() {
            var TransformModel = WhiteboardTool.Models.Transform,
                originData = {
                    "currentOrigin": {
                        "canvasCo": MathUtilities.Components.Utils.Models.Utils.getCloneOf(TransformModel.CURRENT_ORIGIN.canvasCo),
                        "graphCo": MathUtilities.Components.Utils.Models.Utils.getCloneOf(TransformModel.CURRENT_ORIGIN.graphCo)
                    },
                    "defaultOrigin": {
                        "canvasCo": MathUtilities.Components.Utils.Models.Utils.getCloneOf(TransformModel.DEFAULT_ORIGIN.canvasCo),
                        "graphCo": MathUtilities.Components.Utils.Models.Utils.getCloneOf(TransformModel.DEFAULT_ORIGIN.graphCo)
                    },
                    "graphData": this.getGraphSyncData(),
                    "currentGridOption": this.currentGridOption
                };
            return originData;
        },

        /**
         * Set origin data value for retrieving state
         * @method _parseOriginData
         * @param parseData {object}, origin state to be retrieve.
         * @private
         */
        "_parseOriginData": function(parseData) {
            var TransformModel = WhiteboardTool.Models.Transform,
                newOrigin = {},
                defaultCanvasCo = null,
                SketchpadModel = WhiteboardTool.Models.Sketchpad,
                retrieveCodes = SketchpadModel.Retrieve_Codes,
                curCode = null,
                graphType = null,
                graphDisplay = null,
                resetGrid = _.bind(function() {
                    //if grid-data is not present set grid-graph to default values
                    this.gridGraph.defaultGraphZoom();
                    graphType = WhiteboardTool.Views.ToolType.NoGrid;
                    this.setGridDefaultOption();
                }, this);

            if (parseData) {
                TransformModel.DEFAULT_ORIGIN.graphCo = parseData.defaultOrigin.graphCo;
                TransformModel.CURRENT_ORIGIN.canvasCo = parseData.currentOrigin.canvasCo;

                defaultCanvasCo = parseData.defaultOrigin.canvasCo;
                if (defaultCanvasCo.x === 0 && defaultCanvasCo.y === 0) {
                    //for pre author data whose default canvas point is not updated properly.
                    TransformModel.DEFAULT_ORIGIN.canvasCo = defaultCanvasCo;
                    curCode = retrieveCodes.GraphCoodWithWrongOrigin;
                }
                newOrigin = this._getCurrentOriginCo();
                TransformModel.CURRENT_ORIGIN.canvasCo = new WhiteboardTool.Models.Point(newOrigin.point);


                if (parseData.graphData) {
                    this.gridGraph.retrieveState(parseData.graphData.gridData);
                    graphType = parseData.graphData.graphType;
                    if (parseData.currentGridOption) {
                        this.currentGridOption = parseData.currentGridOption;
                    } else {
                        graphDisplay = parseData.graphData.gridData.graphDisplay;
                        this.currentGridOption = {
                            "isLabelShown": graphDisplay.isLabelShown,
                            "isGridLineShown": graphDisplay.isGridLineShown,
                            "isAxisLinesShown": graphDisplay.isAxisLinesShown
                        };
                    }

                } else {
                    resetGrid();
                    curCode = retrieveCodes.GraphCoodEqualRation;
                }
            } else {
                //for pre-author data, not having originData object
                //if origin value is not defined, set origin data to default values.
                TransformModel.DEFAULT_ORIGIN.graphCo = new WhiteboardTool.Models.Point(0, 0);
                defaultCanvasCo = TransformModel.DEFAULT_ORIGIN.canvasCo;
                TransformModel.CURRENT_ORIGIN.canvasCo = new WhiteboardTool.Models.Point(defaultCanvasCo);

                curCode = retrieveCodes.CanvasCood;

                resetGrid();
            }
            this.currentGraphType = "";
            this.setGraphType(graphType, true, true);
            if (curCode) {
                SketchpadModel.RetrieveCode = curCode;
            }
        },

        /**
         * Return current-origin canvas co-ordinate,depending upon graph co-ordinate at default-origin(reference point)
         * also return delta value of prev & new origin
         * @method _getCurrentOriginCo
         * @return {object}, point and delta value
         * @private
         */
        "_getCurrentOriginCo": function() {
            var TransformModel = WhiteboardTool.Models.Transform,
                defaultOrigin = TransformModel.DEFAULT_ORIGIN,
                currentOrigin = TransformModel.CURRENT_ORIGIN,
                newCurrentOrigin = {};


            newCurrentOrigin.point = {
                "x": defaultOrigin.canvasCo.x - defaultOrigin.graphCo.x,
                "y": defaultOrigin.canvasCo.y + defaultOrigin.graphCo.y
            };
            newCurrentOrigin.delta = {
                "x": newCurrentOrigin.point.x - currentOrigin.canvasCo.x,
                "y": newCurrentOrigin.point.y - currentOrigin.canvasCo.y
            };
            return newCurrentOrigin;
        },

        "_performArrowAction": function(event) {
            if (WhiteboardTool.Views.Sketchpad.isAccessible === false || this._arrSelectedShapes.length === 0) {
                return;
            }
            var arrSelectedShape = this._arrSelectedShapes,
                accObjectModel = this._accdivObjectMapping,
                shape = null,
                $accDiv = null,
                mapObj = null,
                $target = $(event.target),
                elem = null,
                supressElement = ["#whiteboard .accFocusDiv", "#whiteboard #strokeWidth-slider-container #size-container", "#whiteboard #rotation-angle-text-box", "#whiteboard #change-opacity-text-box", "#whiteboard #rotation-angle-text-box", "#whiteboard #whiteboard-temp-focus", ".palette-main-div"];

            for (elem in supressElement) {
                if ($target.is(supressElement[elem]) || $target.parents().is(supressElement[elem])) {
                    return;
                }
            }

            for (shape in arrSelectedShape) {
                for (mapObj in accObjectModel) {
                    if (arrSelectedShape[shape] === accObjectModel[mapObj]) {
                        $accDiv = $("#whiteboard #" + mapObj).parent(".shape-focusdiv");
                        this._shapeKeyPress(event, $accDiv, true);
                    }
                }
            }

            event.preventDefault();

            // Set the current action name to be transform. Used in undo redo while saving states of shape.
            this._setCurrentActionName(WhiteboardTool.Views.UndoRedoActions.Transform);
            // Save the data into the stack, as we have all data ready to extract.
            this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());

        },

        "_enableMultipleTabIndices": function(arryElement, isEnable) {
            var elem = null,
                accManager = WhiteboardTool.Views.accManagerView;
            for (elem in arryElement) {
                accManager.enableTab(arryElement[elem], isEnable);
            }
        },

        "_enableTabs": function(isEnable) {
            var arryElem = ["math-title-text-7", "shape-tool-focus-rect", "line-tool",
                    "image-tool", "text-tool", "background-tool-menu", "edit-focus-rect", "undo-btn", "redo-btn", "refresh-btn",
                    "math-tool-save-btn-icon-7", "math-tool-open-btn-icon-7", "math-tool-screenshot-btn-icon-7", "math-tool-print-btn-icon-7",
                    "math-tool-csv-btn-icon-7", "math-tool-btn-help-7", "math-tool-btn-restore-7", "math-tool-btn-hide-7", "math-tool-btn-close-7",
                    "graph-focus-rect", "pan-tool"
                ],

                accObj = null,
                accObjMap = this._accdivObjectMapping;

            for (accObj in accObjMap) {
                arryElem.push(accObj);
            }

            this._enableMultipleTabIndices(arryElem, isEnable);

            if (isEnable === true) {
                this._enableDisableUndoBtn();
                this._enableDisableRedoBtn();
                this._updateEditOption();
            }
        },

        "_reFocusElem": function(accId, accText, delay) {
            var accManager = WhiteboardTool.Views.accManagerView,
                $elem = this.$("#whiteboard #" + accId + " .acc-read-elem"),
                prevText = $elem.text();

            if (accText && accText !== "") {
                if (prevText === accText) {
                    accText += " ";
                }
                accManager.setAccMessage(accId, accText);
                accManager.setFocus("whiteboard-temp-focus");
                accManager.setFocus(accId, delay);
            }

        },
        "_reArrangeShape": function() {
            //Arrange shape's in arr shape object as per there layer
            //sequence is background, image then other shapes
            var arrShape = this._arrShapes,
                dummyArray = [],
                shape = null,
                curShape = null,
                curShapeType,
                imageArray = [],
                shapeArray = [],
                ShapeType = WhiteboardTool.Views.ShapeType;

            for (shape in arrShape) {
                curShape = arrShape[shape];
                curShapeType = curShape.model.get("_data").nType;
                switch (curShapeType) {
                    case ShapeType.BackgroundImage:
                        dummyArray[0] = curShape;
                        break;
                    case ShapeType.Image:
                        imageArray.push(curShape);
                        break;
                    default:
                        shapeArray.push(curShape);
                        break;
                }
            }
            this._arrShapes = dummyArray.concat(imageArray, shapeArray);
        },
        "getGraphSyncData": function() {
            var graphData = {
                "gridData": this.gridGraph.saveState(),
                "graphType": this.currentGraphType
            };
            return graphData;
        },
        "setShapeAccDivPosition": function(curShape, createAccDiv) {
            if (!curShape) {
                return;
            }
            var accDivObject = null,
                divNumber = null;
            if (createAccDiv === void 0) {
                createAccDiv = true;
            }
            if (WhiteboardTool.Views.isAccessible) {
                for (accDivObject in this._accdivObjectMapping) {
                    if (this._accdivObjectMapping[accDivObject] === curShape) {
                        divNumber = this._getAccDivNumber($("#" + accDivObject).parent(".shape-focusdiv"));
                        break;
                    }
                }
                if (divNumber !== null) {
                    this.setAccDivPosition(this.$(".shape-focusdiv[shape-focusdiv-number=" + divNumber + "]"), true);
                } else if (createAccDiv) {
                    this._createAccessibilityDivs(curShape);
                }
            }
        },
        "isMobile": function() {
            return MathUtilities.Components.Utils.Models.BrowserCheck.isMobile;
        },

        "changeGridOptions": function(gridOptions) {
            if (!gridOptions) {
                return;
            }
            var functionMap = {
                    "isGridLineShown": "setGridLineVisibility",
                    "isAxisLinesShown": "setAxisMarkerVisibility",
                    "isLabelShown": "setLabelVisibility"
                },
                gridGraph = this.gridGraph,
                obj = null;
            for (obj in gridOptions) {
                if (functionMap.hasOwnProperty(obj) && gridGraph[functionMap[obj]]) {
                    gridGraph[functionMap[obj]](gridOptions[obj]);
                }
                this.currentGridOption[obj] = gridOptions[obj];
            }
            if (this.currentGraphType !== WhiteboardTool.Views.ToolType.NoGrid) {
                this.gridGraph.drawGraph();
            }
            this.enableCanvasFakediv("", "whiteboard-canvas-fakediv");
        },

        "setGridDefaultOption": function() {
            var GRID_DEFAULT_SETTING = WhiteboardTool.Views.Sketchpad.GRID_DEFAULT_SETTING;
            this.currentGridOption = {
                "isGridLineShown": GRID_DEFAULT_SETTING.GRID_LINES,
                "isAxisLinesShown": GRID_DEFAULT_SETTING.AXES_LINES,
                "isLabelShown": GRID_DEFAULT_SETTING.AXES_LABELS
            };
        },

        "onGridOptionChange": function(chkboxObj) {
            var option = this.currentGridOption,
                undoRedoData = {
                    "actionName": WhiteboardTool.Views.UndoRedoActions.GraphOptChange,
                    "oldState": MathUtilities.Components.Utils.Models.Utils.convertToSerializable(this.currentGridOption)
                };
            switch (chkboxObj.chkboxName) {
                case 'show-grid':
                    option.isGridLineShown = chkboxObj.isChecked;
                    break;

                case 'show-axes':
                    option.isAxisLinesShown = chkboxObj.isChecked;
                    break;

                case 'show-axes-labels':
                    option.isLabelShown = chkboxObj.isChecked;
                    break;

            }
            this.changeGridOptions(option);
            undoRedoData.newState = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(this.currentGridOption);
            this._saveToUndoRedoStack(undoRedoData);
        },
        "setGridOption": function(option) {
            var chkboxMapp = {
                    "isGridLineShown": 'show-grid',
                    "isAxisLinesShown": 'show-axes',
                    "isLabelShown": 'show-axes-labels'
                },
                obj = null;
            for (obj in option) {
                this._shapeToolbar.setChkboxState(chkboxMapp[obj], option[obj]);
            }
        }

    }, {
        "GRID_DEFAULT_SETTING": {
            "GRID_LINES": true,
            "AXES_LINES": false,
            "AXES_LABELS": false
        }
    });

    //sketchpad view end **********************************************

})(window.MathUtilities);
