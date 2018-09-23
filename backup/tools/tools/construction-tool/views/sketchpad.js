/*globals paper*/
(function(MathUtilities) {
    "use strict";
    var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    //*******************************************************************/
    /*                           Sketch Pad                           */
    /*******************************************************************/
    /**
     * A customized Backbone.View that represents Construction Tool.
     * @class MathUtilities.Tools.ConstructionTool.Views.Sketchpad
     * @constructor
     * @namespace Tools.ConstructionTool.Views
     * @module ConstructionTool
     * @extends Backbone.View
     */
    ConstructionTool.Views.Sketchpad = MathUtilities.Components.ToolHolder.Views.ToolHolder.extend({

        /**
         * Holds undoRedoManager model Object
         * @property undoRedoManager
         * @type {Object}
         */
        "undoRedoManager": null,

        /**
         * Holds accLocManager model Object
         * @property accLocManager
         * @type {Object}
         */
        "accLocManager": null,

        /**
         * Boolean to suppress extra processing on mouse moves.
         * @property _hasTouchOccurred
         * @type {Boolean}
         * @private
         */
        "_hasTouchOccurred": false,

        /**
         * Boolean to make Controller know that current shape being drawn by user action has finished its drawing.
         * @property _isShapePlottingFinished
         * @type {Boolean}
         * @private
         */
        "_isShapePlottingFinished": false,

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
         * Collection of ruler objects, holds all the rulers that we have in our drawing port.
         * @property _rulerArray
         * @type {Object}
         * @public
         */
        "_rulerArray": null,

        /**
         * Active ruler, of which pencil is dragged.
         * @property _activeRuler
         * @type {Object}
         * @public
         */
        "_activeRuler": null,

        /**
         * Current object that is been added and created in touch/mouse down,move and up events.
         * @property _addingObj
         * @type {Object}
         * @private
         */
        "_addingObj": null,

        /**
         * The current action that is being carried out. Used for maintaining undo redo state.
         * @property _actionName
         * @type {Object}
         * @private
         */
        "_actionName": null,

        /**
         * The shape that is being hit even when multiple shapes are selected.
         * @property _hitShape
         * @type {Object}
         * @private
         */
        "_hitShape": null,

        /**
         * Hold canvas jquery element.
         * @property _$constructionToolCanvas
         * @type {Object}
         * @private
         */
        "_$constructionToolCanvas": null,

        /**
         * Boolean to make Controller know whether straight liner helper is visible on the canvas.
         * @property _isStraightLinerVisible
         * @type {Boolean}
         * @private
         */
        "_isStraightLinerVisible": null,

        /**
         * Boolean to make Controller know whether straight liner helper is visible on the canvas.
         * @property _isCompassVisible
         * @type {Boolean}
         * @private
         */
        "_isCompassVisible": null,

        /**
         * Property toolbar that stores shapes property.
         * @property _propertyToolbar
         * @type {Object}
         * @private
         */
        "_propertyToolbar": null,

        /**
         * Holds background view Object
         * @property _backgroundView
         * @type {Object}
         * @private
         */
        "_backgroundView": null,

        /**
         * Holds image view Object
         * @property _imageView
         * @type {Object}
         * @private
         */
        "_imageView": null,

        /**
         * Holds eventObject if right action is perform.
         * @property _currentEvents
         * @type {object}
         * @private
         */
        "_currentEvents": null,

        /**
         * Holds menu-bar view Object
         * @property _menuBarView
         * @type {Object}
         * @private
         */
        "_menuBarView": null,

        /**
         * Holds counter data related to double tap
         * @property _touchDoubleTapCounter
         * @type {Number}
         * @private
         */
        "_touchDoubleTapCounter": null,

        /**
         * Store project layers, it contain different layer object of paper
         * @property _projectLayers
         * @type {Object}
         */
        "_projectLayers": null,


        /**
         * Boolean to suppress canvas pan if, its start from scroll-bar
         * @property _isScrollHit
         * @type {Boolean} default is false
         * @private
         */
        "_isScrollHit": false,

        /**
         * Holder Scroll-bar view
         * @property _scrollBarManager
         * @type {Object}
         * @private
         */
        "_scrollBarManager": null,

        /**
         * Holds accessibility element.
         * @property _accdivObjectMapping
         * @type {object}
         * @private
         */
        "_accdivObjectMapping": null,

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
                    "toolIconCSS": "construction-tool-sprite construction-tool-icon"
                },
                "toolId": {
                    "toolIdText": "9"
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
                        "isVisible": false,
                        "isDisabled": false,
                        "isPressed": false
                    }
                },
                "toolId": {
                    "toolIdText": "9"
                },
                "screenCaptureDiv": {
                    "screenCaptureHolder": "#construction-tool-canvas"
                }
            }
        },
        "events": {
            "click .save-btn": "saveToLocalStorage",
            "click .retrieve-btn": "retrieveFromLocalStorage"
        },

        "_isDirty": false,

        /**
         * Initializer of the application.
         * @method initialize
         */
        "initialize": function() {
            arguments[0].toolId = "9";
            ConstructionTool.Views.Sketchpad.__super__.initialize.apply(this, arguments);
            this.listenTo(this.model, "change:jsonData", this.onModelLoaded);
        },
        "onModelLoaded": function() {
            var undoManagerView = null,
                accLocJsonData = this.model.get("jsonData"),
                retrieveState = this.model.get("resetToolState"),
                textToolOffset = {
                    "top": this.$("#menu-bar-holder").height(),
                    "left": 0
                },
                transformModel = ConstructionTool.Models.Transform,
                canvasAccModel = null,
                accManagerView = null;

            //text-tool offset,to adjust its position on canvas
            ConstructionTool.Views.TEXT_TOOL_OFFSET = textToolOffset;

            this._containerElement.append($("#construction-tool"));

            this.setState(this.toolbarState);

            this._arrSelectedShapes = [];
            this._arrShapes = [];

            //create loc-acc manager view
            this.accLocManager = new MathUtilities.Components.Manager.Models.Manager({
                "isWrapOn": false,
                "debug": true
            });
            this.accLocManager.parse(accLocJsonData);
            ConstructionTool.Views.accManagerView = new MathUtilities.Components.Manager.Views.Manager({
                "el": "#tool-holder-9",
                "model": this.accLocManager
            });

            this._setToolTipText();
            this._createCustomToolTips();

            this._createMenuBar();
            this._createPropertyBar();

            this._canvasSetUp();
            this._bindConstructionEvents();
            //add class to parent container for accessibility
            this.$("#construction-tool").parents(".math-utilities-components-tool-holder").addClass("math-utilities-manager").attr("role", "application");

            //load screens
            accManagerView = ConstructionTool.Views.accManagerView;
            accManagerView.loadScreen("construction-tool");
            accManagerView.loadScreen("canvasScreen");

            //create undo manager view
            this.undoRedoManager = new MathUtilities.Components.Undo.Models.UndoManager({
                "maxStackSize": 20
            });
            undoManagerView = new MathUtilities.Components.Undo.Views.UndoManager({
                "el": this.$(".math-utilities-components-tool-holder")
            });
            //bind undo manager events
            undoManagerView.on("undo:actionPerformed", this._callUndo, this).on("redo:actionPerformed", this._callRedo, this);

            //Set Resize-Image icon
            this.$("#construction-tool .resize-shape").addClass(MathUtilities.Components.Utils.Models.Utils.getFontAwesomeClass("expand"));

            this._initBootstrapPopup();
            this._setIsAccessibleFlag();
            this._isStraightLinerVisible = false;
            this._isCompassVisible = false;
            this._rulerArray = [];
            this.triggerMenuTool(ConstructionTool.Views.ToolType.Select);



            transformModel.CURRENT_ORIGIN.canvasCo = new ConstructionTool.Models.Point(ConstructionTool.Views.CanvasSize.width / 2, ConstructionTool.Views.CanvasSize.height / 2);
            transformModel.CURRENT_ORIGIN.graphCo = new ConstructionTool.Models.Point(0, 0);
            transformModel.DEFAULT_ORIGIN.canvasCo = new ConstructionTool.Models.Point(ConstructionTool.Views.CanvasSize.width / 2, ConstructionTool.Views.CanvasSize.height / 2);
            transformModel.DEFAULT_ORIGIN.graphCo = new ConstructionTool.Models.Point(0, 0);


            //Create scroll bar manager view
            this._updateLimits();
            if (this.model.get("isScrollbarVisible") === true) {
                this._scrollBarManager = new MathUtilities.Components.ScrollBar.Views.CanvasScrollBar();
                this.model.get("scrollbarData").defaultUniverse = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.get("scrollbarData").visibleFrame);

                this._scrollBarManager.parent = this;

            }
            this.updateScrollFrameSize();

            this._updateVisibleFrame();

            MathUtilities.Components.ImageManager._paperScope = ConstructionTool.Views.PaperScope;
            MathUtilities.Components.ImageManager._imageLayer = ConstructionTool.Views.PaperScope.project.activeLayer;
            MathUtilities.Components.ImageManager._fallbackLayer = ConstructionTool.Views.PaperScope.project.activeLayer;
            MathUtilities.Components.ImageManager.init();

            this._accdivObjectMapping = {};
            canvasAccModel = new ConstructionTool.Models.CanvasAcc({
                "isAccessible": ConstructionTool.Views.isAccessible,
                "accManager": ConstructionTool.Views.accManagerView,
                "startIndex": 20,
                "paperScope": ConstructionTool.Views.PaperScope
            });

            ConstructionTool.Views.canvasAccView = new ConstructionTool.Views.CanvasAcc({
                "el": "#construction-tool",
                "model": canvasAccModel
            });

            ConstructionTool.Views.canvasAccView
                .on("canvasKeyDown", this.onCanvasKeyDown, this)
                .on("canvasKeyUp", this.onCanvasKeyUp, this)
                .on("canvasElemFocusIn", this.onCanvasElemFocusIn, this)
                .on("canvasElemFocusOut", this.onCanvasElemFocusOut, this);
            //load Menu bar Screen
            this._menuBarView.loadMenuScreen();
            this.enableDisableRedoBtn();
            this.enableDisableUndoBtn();
            accManagerView.setFocus("math-title-text-9");

            //save-retrieve for testing, its for local testing stub
            $('.save-btn').on('click', _.bind(this.saveToLocalStorage, this));
            $('.retrieve-btn').on('click', _.bind(this.retrieveFromLocalStorage, this));

            if (!retrieveState) {
                this.model.set("resetToolState", MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.saveState()));
            } else {
                this.model.set("resetToolState", MathUtilities.Components.Utils.Models.Utils.getCloneOf(retrieveState));
                this.retrieveState(retrieveState);
            }

        },

        "_setToolTipText": function() {
            var model = this.model,
                menuItem = model.get("menuBarData"),
                managerView = ConstructionTool.Views.accManagerView,
                item = null;

            managerView.loadScreen("ToolTips");
            for (item in menuItem) {
                menuItem[item].tooltip = managerView.getMessage(menuItem[item].toolId + "-tooltip", 0);

                if (menuItem[item].toolId === "image-tool" && menuItem[item].popupMenu && menuItem[item].popupMenu[0]) {
                    menuItem[item].popupMenu[0].toolTip = managerView.getMessage(menuItem[item].toolId + "-tooltip", 1);
                    menuItem[item].popupMenu[0].text = managerView.getMessage(menuItem[item].toolId + "-tooltip", 1);
                }
            }
        },
        /**
         * Create custom tool-tips
         * @method _createCustomToolTips
         * @private
         */
        "_createCustomToolTips": function() {
            var tooltipElems = null,
                elemId = null,
                options = null,
                tooltipView = null,
                accManagerView = ConstructionTool.Views.accManagerView,
                $toolholder = this.$el;

            tooltipElems = {
                "math-tool-btn-help-9": {
                    "tooltipHolder": "math-tool-btn-help-9",
                    "position": "bottom",
                    "selector": "#math-tool-btn-help-9"
                },
                "math-tool-btn-restore-9": {
                    "tooltipHolder": "math-tool-btn-restore-9",
                    "position": "bottom",
                    "selector": "#math-tool-btn-restore-9"
                },
                "math-tool-btn-hide-9": {
                    "tooltipHolder": "math-tool-btn-hide-9",
                    "position": "bottom",
                    "selector": "#math-tool-btn-hide-9"
                },
                "math-tool-btn-close-9": {
                    "tooltipHolder": "math-tool-btn-close-9",
                    "position": "bottom",
                    "selector": "#math-tool-btn-close-9"
                },
                "math-tool-btn-save-9": {
                    "tooltipHolder": "math-tool-btn-save-9",
                    "position": "top",
                    "selector": "#math-tool-btn-save-9"
                },
                "math-tool-btn-open-9": {
                    "tooltipHolder": "math-tool-btn-open-9",
                    "position": "top",
                    "selector": "#math-tool-btn-open-9"
                },
                "math-tool-btn-screenshot-9": {
                    "tooltipHolder": "math-tool-btn-screenshot-9",
                    "position": "top",
                    "selector": "#math-tool-btn-screenshot-9"
                },
                "math-tool-btn-print-9": {
                    "tooltipHolder": "math-tool-btn-print-9",
                    "position": "top",
                    "selector": "#math-tool-btn-print-9"
                }
            };


            for (elemId in tooltipElems) {
                options = {
                    "id": tooltipElems[elemId].tooltipHolder + "-tooltip",
                    "text": accManagerView.getMessage(elemId + "-tooltip", 0),
                    "position": tooltipElems[elemId].position,
                    "align": tooltipElems[elemId].align,
                    "tool-holder": $toolholder
                };
                tooltipView = MathUtilities.Components.CustomTooltip.generateTooltip(options);
                if (this.isMobile()) {
                    $(tooltipElems[elemId].selector).on("touchstart", _.bind(tooltipView.showTooltip, tooltipView))
                        .on("touchend", _.bind(tooltipView.hideTooltip, tooltipView));
                } else {
                    $(tooltipElems[elemId].selector).on("mouseenter", _.bind(tooltipView.showTooltip, tooltipView))
                        .on("mouseleave mousedown", _.bind(tooltipView.hideTooltip, tooltipView));
                }
            }
        },


        /**
         * Install and set-up paper for canvas,also attach paper events.
         * @method _canvasSetUp
         * @private
         */
        "_canvasSetUp": function() {
            var constructionPaperScope = null;

            this._$constructionToolCanvas = this.$("#construction-tool-canvas");


            this._updateCanvasSize();

            constructionPaperScope = new paper.PaperScope();

            constructionPaperScope.install(this._$constructionToolCanvas);
            constructionPaperScope.setup(this._$constructionToolCanvas[0]);
            constructionPaperScope.activate();
            this._projectLayers = {};
            this._projectLayers.shapeLayer = constructionPaperScope.project.activeLayer;
            this._projectLayers.scrollLayer = new constructionPaperScope.Layer();

            ConstructionTool.Views.PaperScope = constructionPaperScope;

            this._projectLayers.shapeLayer.activate();
        },

        "_updateCanvasSize": function(canvasWidth, canvasHeight) {
            var ToolHolderView = ToolHolderView = ConstructionTool.Views.Sketchpad.__super__,
                toolHolderSize = ToolHolderView.getToolSize.call(this),
                $canvasContainer = this.$(".drawing-area-holder"),
                previousHeight,
                previousWidth, MENU_SHADOW_HEIGHT = 4,
                $menubar = this.$(".menu-bar-holder");

            if (canvasHeight && canvasWidth) {
                $canvasContainer.height(canvasHeight)
                    .width(canvasWidth);
            } else {
                $canvasContainer.height(toolHolderSize.height - $menubar.height() + MENU_SHADOW_HEIGHT)
                    .width(toolHolderSize.width);
            }
            if (ConstructionTool.Views.CanvasSize) {
                previousHeight = ConstructionTool.Views.CanvasSize.height;
                previousWidth = ConstructionTool.Views.CanvasSize.width;
            }
            ConstructionTool.Views.CanvasSize = {
                "width": this._$constructionToolCanvas.width(),
                "height": this._$constructionToolCanvas.height()
            };
            if (ConstructionTool.Views.PaperScope) {
                ConstructionTool.Views.PaperScope.view.viewSize = [$canvasContainer.width(), $canvasContainer.height()];
                this._shiftOrigin((ConstructionTool.Views.CanvasSize.width - previousWidth) / 2, (ConstructionTool.Views.CanvasSize.height - previousHeight) / 2);
            }
        },

        "_resizeTool": function(event) {
            var ToolHolderView = ConstructionTool.Views.Sketchpad.__super__,
                paperScope = ConstructionTool.Views.PaperScope,
                CanvasSize,
                screenSize,
                frameSize;

            ToolHolderView._resizeTool.call(this, event);
            this._updateCanvasSize();
            CanvasSize = ConstructionTool.Views.CanvasSize;
            if (this._scrollBarManager) {
                screenSize = new paperScope.Rectangle(0, 0, CanvasSize.width, CanvasSize.height);
                this._updateLimits();
                this.model.get("scrollbarData").defaultUniverse = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.get("scrollbarData").visibleFrame);
                this._updateVisibleFrame();
                this.updateObservableUniverse();
                frameSize = this.model.get("scrollbarData").visibleFrame;
                this._projectLayers.scrollLayer.activate();
                this._scrollBarManager.resizeFrameSize(frameSize, screenSize);
                this._projectLayers.shapeLayer.activate();
            }

            this._redraw();
            this.$('#construction-property-toolbar').width(CanvasSize.width - ConstructionTool.Views.PropertyToolBar.RIGHT_PADDING);
        },

        "_shiftOrigin": function(deltaX, deltaY) {
            var TransformModel = ConstructionTool.Models.Transform,
                currentOrigin = TransformModel.CURRENT_ORIGIN.canvasCo,
                DEFAULT_ORIGIN = TransformModel.DEFAULT_ORIGIN,
                CanvasSize = ConstructionTool.Views.CanvasSize,
                xPosition = currentOrigin.x,
                yPosition = currentOrigin.y;

            if (deltaY !== 0 || deltaX !== 0) {
                if (deltaY !== 0) {
                    yPosition = currentOrigin.y + deltaY;
                }

                if (deltaX !== 0) {
                    xPosition = currentOrigin.x + deltaX;
                }
                currentOrigin.x = xPosition;
                currentOrigin.y = yPosition;

                DEFAULT_ORIGIN.canvasCo.x = CanvasSize.width / 2;
                DEFAULT_ORIGIN.canvasCo.y = CanvasSize.height / 2;
                DEFAULT_ORIGIN.graphCo = TransformModel.toGraphCo(DEFAULT_ORIGIN.canvasCo);

            }
            this._panShapeLayer({
                "x": deltaX,
                "y": deltaY
            }, true);
        },

        "snapshot": function(callback) {
            var prevCanvasSize,
                screenshotSize,
                ScreenUtils = MathUtilities.Components.Utils.Models.ScreenUtils;

            if (ConstructionTool.Views.CanvasSize) {
                prevCanvasSize = {
                    "height": ConstructionTool.Views.CanvasSize.height,
                    'width': ConstructionTool.Views.CanvasSize.width
                };
            }
            screenshotSize = this.getScreenshotSize();
            ScreenUtils.confirmScreenshotSize(screenshotSize, _.bind(function() {
                this.prepareForScreenshot(screenshotSize);
                this._redraw();
                _.delay(_.bind(function() {
                    MathUtilities.Components.Utils.Models.ScreenUtils.getScreenShot({
                        "container": "#construction-tool-canvas",
                        "type": MathUtilities.Components.Utils.Models.ScreenUtils.types.BASE64,
                        "debug": false,
                        "complete": _.bind(function(data) {
                            callback.call(this, data);
                            this.photoshootDone(prevCanvasSize.width, prevCanvasSize.height);
                            this._redraw();
                        }, this)
                    });
                }, this), 1000);
            }, this));
        },

        "getScreenshotSize": function() {
            var expectedSize = this._scrollBarManager.getScrollBarData().scrollDomain,
                ScreenUtils = MathUtilities.Components.Utils.Models.ScreenUtils,
                screenshotSize, cropped = false;

            screenshotSize = {
                "width": Math.abs(expectedSize.xmax - expectedSize.xmin),
                "height": Math.abs(expectedSize.ymax - expectedSize.ymin)
            };
            if (screenshotSize.width > ScreenUtils.MAX_SCREENSHOT_SIZE.width || screenshotSize.height > ScreenUtils.MAX_SCREENSHOT_SIZE.height) {
                cropped = true;
                screenshotSize.width = Math.min(screenshotSize.width, ScreenUtils.MAX_SCREENSHOT_SIZE.width);
                screenshotSize.height = Math.min(screenshotSize.height, ScreenUtils.MAX_SCREENSHOT_SIZE.height);
            }
            screenshotSize.cropped = cropped;
            return screenshotSize;
        },

        "prepareForScreenshot": function(screenshotSize) {
            this._updateCanvasSize(screenshotSize.width, screenshotSize.height);

            this._updateLimits();
            this.model.get("scrollbarData").defaultUniverse = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.get("scrollbarData").visibleFrame);
            this._updateVisibleFrame();
            if (this._scrollBarManager) {
                this._scrollBarManager.setVisibility(false);
            }
        },

        "photoshootDone": function(width, height) {
            if (this._scrollBarManager) {
                this._scrollBarManager.setVisibility(true);
            }
            this._updateCanvasSize(width, height);
            this.draw();
        },

        /**
         * Binds events on sketch pad.
         * @method _bindConstructionEvents
         * @private
         */
        "_bindConstructionEvents": function() {
            MathUtilities.Components.Utils.TouchSimulator.enableTouch(this._$constructionToolCanvas);
            ConstructionTool.Views.PaperScope.tool.onMouseDown = _.bind(this._onTouchStart, this);
            ConstructionTool.Views.PaperScope.tool.onMouseDrag = _.bind(this._onTouchMove, this);
            ConstructionTool.Views.PaperScope.tool.onMouseUp = _.bind(this._onTouchEnd, this);

            this.$(".math-utilities-components-tool-holder").on("keydown", _.bind(this._onKeyDown, this)).attr("tabindex", -1);
            this._$constructionToolCanvas.on("dblclick", _.bind(this._onToolDoubleClick, this))
                .on("mousewheel", _.bind(this._onMouseWheel, this));
            document.getElementById("construction-tool-canvas").addEventListener("touchstart", _.bind(this._onCanvasTouchStart, this));
        },

        "_onMouseWheel": function(event, delta) {
            this._panBy(0, this._getCanvasDistance([0, -delta])[1]);
        },

        /**
         * Create Menu-bar structure,bind events to menubar item
         * @method _createMenuBar
         */
        "_createMenuBar": function() {
            var $menuHolder = this.$(".math-utilities-tools-construction-tool #menu-bar-holder"),
                constructionMenuModel = new MathUtilities.Components.MenuBar.Models.Menu({
                    "isAccessible": true,
                    "accManager": ConstructionTool.Views.accManagerView,
                    "screenId": "menubarScreen"
                }),
                constructionMenuView = new MathUtilities.Components.MenuBar.Views.Menu({
                    "el": $menuHolder,
                    "model": constructionMenuModel
                }),
                buttonData = this.model.get("menuBarData"),
                loopVar = 0,
                buttonList = [],
                newBtnModel = null;

            for (; loopVar < buttonData.length; loopVar++) {
                if (typeof buttonData[loopVar].seperator === "undefined") {
                    newBtnModel = new MathUtilities.Components.MenuBar.Models.Button();
                    newBtnModel.setBtnParameters(buttonData[loopVar]);
                    buttonList.push(newBtnModel);
                } else {
                    constructionMenuView.compileMenu(buttonList);
                    constructionMenuView.addSeperator(buttonData[loopVar].seperator);
                    buttonList = [];
                }
            }
            if (buttonList.length > 0) {
                constructionMenuView.compileMenu(buttonList);
            }
            $menuHolder.on("menuToolChanged", _.bind(this._onCurToolChange, this));

            this.listenTo(constructionMenuView, "imageAssetSelected", this._openAddFileDialogBox).listenTo(constructionMenuView, "menuButtonFocus", this.onMeuButtonFocusIn);
            this._menuBarView = constructionMenuView;
        },

        /**
         * Create property-bar object,bind events to property-bar.
         * @method _createPropertyBar
         * @private
         */
        "_createPropertyBar": function() {
            var propertyToolbar = null;

            propertyToolbar = this._propertyToolbar = new ConstructionTool.Views.PropertyToolBar({
                "el": "#construction-property-toolbar",
                "isScrollVisible": this.model.get("isScrollbarVisible")
            });
            propertyToolbar.on("propertyToolChanged", this._onPropertyValueChange, this)
                .on("property-toolbar-hide", this.propertyToolBarHide, this);
            propertyToolbar.hide();
        },

        /**
         * Create bootstrap custom popups.
         * @method _initBootstrapPopup
         * @private
         */
        "_initBootstrapPopup": function() {
            var $resetScreen, $featureScreen, $imgFile,
                manager = ConstructionTool.Views.accManagerView,
                popupTemplate = ConstructionTool.Views.templates["construction-custom-popup"];

            manager.loadScreen("reset-screen-popup");
            manager.loadScreen("feature-screen-popup");
            manager.loadScreen("img-format-popup");


            $resetScreen = $(popupTemplate({
                "id": "reset-screen",
                "title": manager.getMessage("reset-screen-title", 0),
                "text": manager.getMessage("reset-screen-text", 0),
                "ok": manager.getMessage("reset-screen-ok-button", 0),
                "cancel": manager.getMessage("reset-screen-cancel-button", 0)
            }).trim());

            $featureScreen = $(popupTemplate({
                "id": "feature-screen",
                "title": manager.getMessage("feature-screen-title", 0),
                "text": manager.getMessage("feature-screen-text", 0),
                "ok": manager.getMessage("feature-screen-ok-button", 0),
                "cancel": manager.getMessage("feature-screen-cancel-button", 0)
            }).trim());

            $imgFile = $(popupTemplate({
                "id": "img-format",
                "title": manager.getMessage("img-format-title", 0),
                "text": manager.getMessage("img-format-text", 0),
                "ok": manager.getMessage("img-format-ok-button", 0),
                "cancel": manager.getMessage("img-formatn-cancel-button", 0)
            }).trim());

            $featureScreen.find(".btn-cancel").hide();
            $imgFile.find(".btn-cancel").hide();
            this.$(".math-utilities-tools-construction-tool").append($resetScreen).append($featureScreen).append($imgFile);

            manager.unloadScreen("reset-screen-popup");
            manager.unloadScreen("feature-screen-popup");
            manager.unloadScreen("img-format-popup");
        },

        /**
         * Show custom popup model,bind popup ok and close events.
         * @method _showCustomPopup
         * @param {string} id of custom popup element.
         * @param {Object} to be called when ok option is click.
         * @param {Object} to be call when cancel option is click.
         */
        "_showCustomPopup": function(selectorId, onOkClick, onCancelClick) {
            var $customPopup = this.$("#" + selectorId),
                isModalHideTrigger = false,
                okclick = function() {
                    isModalHideTrigger = true;
                    $customPopup.modal("hide");
                    if (onOkClick) {
                        onOkClick();
                    }
                },
                onCancel = _.bind(function() {
                    if (onCancelClick && !isModalHideTrigger) {
                        onCancelClick();
                    }
                    this._enableTabs(true);
                }, this);

            $customPopup.find(".btn-primary").off("click").on("click", okclick);
            $customPopup.off("hidden.bs.modal").on("hidden.bs.modal", onCancel);

            $customPopup.modal();

            this._enableTabs(false);
        },

        /**
         * Set accessibility object.
         * @method setAccessibility
         * @private
         */
        "_setIsAccessibleFlag": function() {
            if (this.options.bAllowAccessibility && !this.isMobile()) {
                this.accLocManager.isAccessible = true;
                ConstructionTool.Views.isAccessible = true;
            } else {
                this.accLocManager.isAccessible = false;
                ConstructionTool.Views.isAccessible = false;
            }
        },

        /**
         * Trigger when menu item click.
         * @method _onCurToolChange
         * @private
         */
        "_onCurToolChange": function(event, menuIndex, subMenuIndex, $menuBtn, clickEvent, isAccTrigger) {
            var curTool = this.model.get("toolMenuBarActionMap")[menuIndex][subMenuIndex],
                rulerOldState = {},
                rulerNewState = {},
                rulerObject = null,
                curRulers = this._rulerArray,
                curRulersLen = curRulers.length,
                copyOfCurRulers = [],
                rulerCounter = 0,
                commandData = null,
                toolTypes = ConstructionTool.Views.ToolType,
                managerView = ConstructionTool.Views.accManagerView,
                canvasAccView = ConstructionTool.Views.canvasAccView;

            for (; rulerCounter < curRulersLen; rulerCounter++) {
                copyOfCurRulers.push(curRulers[rulerCounter]);
            }

            if (this._addingObj) {
                this._addingObj = null;
            }
            this.model.menubarLastState.selectedMenuIndex = this.model.menubarCurrentState.selectedMenuIndex;
            this.model.menubarLastState.selectedSubMenuIndices = this.model.menubarCurrentState.selectedSubMenuIndices;

            //as image-tool ui is change
            if (menuIndex === 4) {
                curTool = ConstructionTool.Views.ToolType.Image;
            }

            switch (curTool) {
                case toolTypes.Select:
                case toolTypes.CanvasPan:
                case toolTypes.Pencil:
                case toolTypes.Background:
                case toolTypes.Text:
                    ConstructionTool.Views.CurToolType = curTool;
                    this.onToolSelect();
                    this._deleteRuler(curRulers);

                    this.model.menubarCurrentState.selectedMenuIndex = menuIndex;
                    this.model.menubarCurrentState.selectedSubMenuIndices[menuIndex] = subMenuIndex;

                    if (copyOfCurRulers.length !== 0) {
                        // Set the current action name to be transform. Used in undo redo while saving states of shape.
                        this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.RulerTransform);
                        // Save the data into the stack, as we have all data ready to extract.
                        commandData = this._getPreparedUndoRedoStateCommand({
                            "ruler": copyOfCurRulers
                        });

                        commandData.oldState.menuData = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.menubarLastState);
                        commandData.newState.menuData = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.menubarCurrentState);

                        this._saveToUndoRedoStack(commandData);
                    }
                    if (isAccTrigger === "true") {
                        switch (curTool) {
                            case toolTypes.Text:
                                this.triggerCanvasClick();
                                break;
                            case toolTypes.CanvasPan:
                                managerView.setFocus("construction-temp-focus");
                                canvasAccView.createAccDiv({
                                    "isTemp": true
                                });
                                canvasAccView.updateAccDivProp("canvas-temp", this._getCanvasAccBoundingBox());

                                canvasAccView.setFocus("canvas-temp");
                                break;
                            case toolTypes.Background:
                                this.enableProperyTab(true, managerView.getTabIndex("background-tool-highlighter") + 1);
                                managerView.setFocus("background-color-text");
                                break;
                        }
                    }
                    break;

                case toolTypes.ResetAll:
                    this.resetToolState();
                    break;

                case toolTypes.StraightLiner:
                    ConstructionTool.Views.CurToolType = curTool;
                    this.onToolSelect();
                    this.model.menubarCurrentState.selectedMenuIndex = menuIndex;
                    this.model.menubarCurrentState.selectedSubMenuIndices[menuIndex] = subMenuIndex;
                    if (this._isStraightLinerVisible === false) {
                        this._deleteRuler(curRulers);
                        //Create Tool Helper
                        rulerObject = this.addRulerObject(ConstructionTool.Views.RulerType.StraightLiner);
                        rulerObject.drawHelper();
                        this._isStraightLinerVisible = true;

                        rulerOldState.bRemove = true;
                        rulerOldState.id = rulerObject.getId();

                        rulerNewState = rulerObject.model.getSyncData();
                        rulerNewState.id = rulerObject.getId();

                        copyOfCurRulers.push(rulerObject);
                        canvasAccView.setFocus("ruler-" + rulerObject.model.get("_renderData").accId);
                    } else {
                        rulerObject = curRulers[0];
                        rulerOldState = rulerObject.model.getSyncData();
                        rulerOldState.id = rulerObject.getId();

                        this._deleteRuler(curRulers);
                        this.triggerMenuTool(ConstructionTool.Views.ToolType.Select);

                        rulerNewState.bRemove = true;
                        rulerNewState.id = rulerObject.getId();
                    }

                    rulerObject._savePreviousState(rulerOldState);
                    rulerObject._saveCurrentState(rulerNewState);

                    // Set the current action name to be transform. Used in undo redo while saving states of shape.
                    this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.RulerTransform);
                    // Save the data into the stack, as we have all data ready to extract.
                    commandData = this._getPreparedUndoRedoStateCommand({
                        "ruler": copyOfCurRulers
                    });

                    commandData.oldState.menuData = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.menubarLastState);
                    commandData.newState.menuData = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.menubarCurrentState);

                    this._saveToUndoRedoStack(commandData);
                    break;

                case toolTypes.Compass:
                    ConstructionTool.Views.CurToolType = curTool;
                    this.onToolSelect();
                    this.model.menubarCurrentState.selectedMenuIndex = menuIndex;
                    this.model.menubarCurrentState.selectedSubMenuIndices[menuIndex] = subMenuIndex;
                    if (this._isCompassVisible === false) {
                        this._deleteRuler(curRulers);
                        //Create Tool Helper
                        rulerObject = this.addRulerObject(ConstructionTool.Views.RulerType.Compass);
                        rulerObject.drawHelper();
                        this._isCompassVisible = true;

                        rulerOldState.bRemove = true;
                        rulerOldState.id = rulerObject.getId();

                        rulerNewState = rulerObject.model.getSyncData();
                        rulerNewState.id = rulerObject.getId();

                        copyOfCurRulers.push(rulerObject);
                        canvasAccView.setFocus("ruler-" + rulerObject.model.get("_renderData").accId);
                    } else {
                        rulerObject = curRulers[0];
                        rulerOldState = rulerObject.model.getSyncData();
                        rulerOldState.id = rulerObject.getId();

                        this._deleteRuler(curRulers);
                        this.triggerMenuTool(ConstructionTool.Views.ToolType.Select);

                        rulerNewState.bRemove = true;
                        rulerNewState.id = rulerObject.getId();
                    }

                    rulerObject._savePreviousState(rulerOldState);
                    rulerObject._saveCurrentState(rulerNewState);

                    // Set the current action name to be transform. Used in undo redo while saving states of shape.
                    this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.RulerTransform);
                    // Save the data into the stack, as we have all data ready to extract.
                    commandData = this._getPreparedUndoRedoStateCommand({
                        "ruler": copyOfCurRulers
                    });

                    commandData.oldState.menuData = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.menubarLastState);
                    commandData.newState.menuData = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.menubarCurrentState);

                    this._saveToUndoRedoStack(commandData);
                    break;

                case toolTypes.Image:
                    ConstructionTool.Views.CurToolType = curTool;
                    this._deleteRuler(curRulers);

                    this.model.menubarCurrentState.selectedMenuIndex = menuIndex;
                    this.model.menubarCurrentState.selectedSubMenuIndices[menuIndex] = subMenuIndex;

                    if (copyOfCurRulers.length !== 0) {
                        // Set the current action name to be transform. Used in undo redo while saving states of shape.
                        this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.RulerTransform);
                        // Save the data into the stack, as we have all data ready to extract.
                        commandData = this._getPreparedUndoRedoStateCommand({
                            "ruler": copyOfCurRulers
                        });

                        commandData.oldState.menuData = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.menubarLastState);
                        commandData.newState.menuData = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.defaultMenuBarState);

                        this._saveToUndoRedoStack(commandData);
                    }
                    if (event.isUserTrigger !== true) {
                        this.openAddImageModal(clickEvent);
                    }
                    break;
                case toolTypes.Undo:
                    this._callUndo();
                    break;
                case toolTypes.Redo:
                    this._callRedo();
                    break;
            }

            this._redraw();
            this.changeRulerMenuText();
        },

        "onToolSelect": function(options) {
            var curTool = ConstructionTool.Views.CurToolType;

            options = typeof options !== "undefined" ? options : {};

            //Clears shape selection.
            if (options.supressClearSelection !== true) {
                this._clearShapeSelection();
            }
            if (curTool === ConstructionTool.Views.ToolType.Text) {
                this.showPropertyToolbar(ConstructionTool.Views.ToolType.Select);
            } else {
                this.showPropertyToolbar(curTool);
            }
            this._updateCanvasCursor(curTool);
        },

        /**
         * Return Shape object of given shape-type.
         * @method addShapeObject
         * @param {string} shape type
         * @return {object} shape object
         */
        "addShapeObject": function(shapeType) {
            var curShape = this.getShapeObject(shapeType);
            this.createAccDiv(curShape);
            return this.addShape(curShape);
        },

        /**
         * Return Ruler object of given ruler-type.
         * @method addRulerObject
         * @param {string} ruler type
         * @return {object} ruler object
         */
        "addRulerObject": function(rulerType) {
            var curRuler,
                accManager = ConstructionTool.Views.accManagerView,
                canvasAccView = ConstructionTool.Views.canvasAccView,
                rulerTypes = ConstructionTool.Views.RulerType,
                id,
                accObject = {
                    "isRuler": true,
                    "positioner": true,
                    "pencil": true,
                    "pencilPositioner": true,
                    "rotate": true,
                    "resize": true
                },
                idNum;

            curRuler = this.getRulerObject(rulerType);
            if (rulerType === rulerTypes.Compass) {
                accObject.pencilPositioner = false;
                accObject.rulerAccText = accManager.getAccMessage("compass-ruler", 0);
                accObject.rotateAccText = accManager.getAccMessage("compass-rotation-handler", 0);
                accObject.moveAccText = accManager.getAccMessage("compass-positioner", 0);
                accObject.pencilAccText = accManager.getAccMessage("compass-pencil", 0);
                accObject.resizeAccText = accManager.getAccMessage("compass-resize-handler", 0);
            } else if (rulerType === rulerTypes.StraightLiner) {
                accObject.resize = false;
                accObject.rulerAccText = accManager.getAccMessage("straight-liner-ruler", 0);
                accObject.rotateAccText = accManager.getAccMessage("straight-liner-rotation-handler", 0);
                accObject.moveAccText = accManager.getAccMessage("straight-liner-positioner", 0);
                accObject.pencilAccText = accManager.getAccMessage("straight-liner-pencil", 0);
                accObject.pencilPositionAccText = accManager.getAccMessage("straight-liner-pencil-positioner", 0);
            }

            //accessibility code
            id = canvasAccView.createAccDiv(accObject);
            idNum = Number(id.substring(id.lastIndexOf("-") + 1));
            curRuler.model.setOptions({
                "accId": idNum
            });

            this._accdivObjectMapping[id] = curRuler;

            this.enableProperyTab(true, accManager.getTabIndex("ruler-positioner-" + idNum) + 1);

            accManager.setAccMessage("ruler-" + idNum, accObject.rulerAccText);
            accManager.setAccMessage("ruler-pencil-" + idNum, accObject.pencilAccText);
            accManager.setAccMessage("ruler-pencil-positioner-" + idNum, accObject.pencilPositionAccText);
            accManager.setAccMessage("ruler-resize-" + idNum, accObject.resizeAccText);
            accManager.setAccMessage("ruler-rotate-" + idNum, accObject.rotateAccText);
            accManager.setAccMessage("ruler-positioner-" + idNum, accObject.moveAccText);

            return this.addRuler(curRuler);
        },

        /**
         * Attach different events to shape-object.
         * @method addShape
         * @param {object} shape-object
         */
        "addShape": function(shapeObj) {
            shapeObj.on("equation-complete", _.bind(function() {
                this._isShapePlottingFinished = true;
            }, this));
            shapeObj.on("select", this._onShapeSelect, this)
                .on("deselect", this._onShapeDeselect, this)
                .on("text-drawing-complete", this._onTextDrawingComplete, this)
                .on("text-delete", this._onDelete, this)
                .on("image-drawing-complete", this._onImageDrawingComplete, this)
                .on("show-preloader", this.showPreloader, this)
                .on("hide-preloader", this.hidePreloader, this)
                .on("bind-bound-handle", this._bindBoundsHandleEvents, this)
                .on("update-canvas-scroll", this.updateObservableUniverse, this);

            this._arrShapes.push(shapeObj);
            this.setShapeZIndex(shapeObj);
            return shapeObj;
        },

        "showPreloader": function(name, position) {
            var paperScope = ConstructionTool.Views.PaperScope,
                preloader = new paperScope.Path.Arc(0, Math.PI, 1.5 * Math.PI, 5), //(0, Math.PI)-from point,(1.5* Math.PI,5)-through Point, (0,0)-to point(default)
                rotateAngle = 10;
            this.$(".text-tool-drop-in").show();
            paperScope.view.onFrame = function() {
                preloader.rotate(rotateAngle);
            };
            preloader.position.x = position.x;
            preloader.position.y = position.y;
            preloader.strokeColor = "#000";
            preloader.strokeWidth = 3;
            if (!this._preloader) {
                this._preloader = {};
            }
            this._preloader[name] = preloader;
        },


        "hidePreloader": function(name) {
            if (this._preloader && this._preloader[name]) {
                this.$(".text-tool-drop-in").hide();
                this._preloader[name].remove();
            }
        },

        /**
         * Add rulerobject to ruler array.
         * @method addRuler
         * @param {object} ruler-object
         */
        "addRuler": function(rulerObj) {
            if (!rulerObj) {
                return void 0;
            }

            this._rulerArray.push(rulerObj);

            this._bindRulerHandleEvents(rulerObj);

            this.updateObservableUniverse();
            return rulerObj;
        },

        /**
         * Attach different events to shape-object.
         * @method _bindRulerHandleEvents
         * @param {object} ruler-object
         */
        "_bindRulerHandleEvents": function(rulerObj) {
            if (!rulerObj) {
                return;
            }

            var cursorTypes = ConstructionTool.Views.CursorType;

            rulerObj.off("ruler-mouse-up pencil-handle-mouse-enter ruler-pencil-mouse-enter ruler-rotate-handle-mouse-enter ruler-rotate-handle-mouse-down ruler-pencil-mouse-down pencil-handle-buttton-mouse-down ruler-move-handle-mouse-down ruler-rotate-handle-mouse-drag ruler-move-handle-mouse-enter ruler-rotate-handle-mouse-leave ruler-move-handle-mouse-leave ruler-pencil-mouse-leave pencil-handle-mouse-enter pencil-handle-buttton-mouse-down ruler-move-handle-mouse-down ruler-pencil-mouse-down ruler-resize-handler-mouse-down ruler-resize-handler-mouse-leave ruler-resize-handler-mouse-enter")
                .on("ruler-rotate-handle-mouse-leave ruler-move-handle-mouse-leave ruler-pencil-mouse-leave pencil-handle-mouse-leave ruler-resize-handler-mouse-leave", _.bind(function() {
                    this._selectCanvasCursorType(cursorTypes.Default);
                }, this))
                .on("ruler-rotate-handle-mouse-enter ruler-resize-handler-mouse-enter", _.bind(function() {
                    this._selectCanvasCursorType(cursorTypes.Pointer);
                }, this))
                .on("ruler-rotate-handle-mouse-down ruler-pencil-mouse-down ruler-move-handle-mouse-down pencil-handle-buttton-mouse-down ruler-resize-handler-mouse-down", _.bind(function() {
                    this._onRulerRotateButtonDown(cursorTypes.Pointer, rulerObj);
                }, this))
                .on("ruler-rotate-handle-mouse-drag ruler-resize-handler-mouse-drag", _.bind(function() {
                    this._selectCanvasCursorType(cursorTypes.Pointer);
                }, this))
                .on("ruler-move-handle-mouse-enter", _.bind(function() {
                    this._selectCanvasCursorType(cursorTypes.Pointer);
                }, this))
                .on("ruler-pencil-mouse-enter", _.bind(function() {
                    this._selectCanvasCursorType(cursorTypes.Pointer);
                }, this))
                .on("ruler-mouse-up", _.bind(this._onRulerRotateButtonUp, this))
                .on("pencil-handle-mouse-enter", _.bind(function() {
                    this._selectCanvasCursorType(cursorTypes.Pointer);
                }, this));
        },

        /**
         * Creates the shape based on the tool passed and adds needed behaviors.
         * @method getShapeObject
         * @params {String} strTool - Type of shape to be created.
         */
        "getShapeObject": function(strTool) {
            var curShape = this._createShapeObject(strTool);
            curShape.setOptions(this.model.get("_data").currentSettingsData);
            return curShape;
        },

        /**
         * Creates the ruler based on the tool passed and adds needed behaviors.
         * @method getRulerObject
         * @params {String} rulerType - Type of ruler to be created.
         */
        "getRulerObject": function(rulerType) {
            return this._createRulerObject(rulerType);
        },

        /**
         * Factory method for creating shapes as per the passed type.
         * @method _createShapeObject
         * @params {String} strObjType Shape type stored in enum of shapes type possible.
         * @private
         */
        "_createShapeObject": function(strObjType) {
            var toolType = ConstructionTool.Views.ToolType;
            switch (strObjType) {
                case toolType.Select:
                    break;
                case toolType.Compass:
                    return new ConstructionTool.Views.Compass({
                        "el": this.$el
                    });
                case toolType.Pencil:
                    return new ConstructionTool.Views.BasePen({
                        "el": this.$el
                    });
                case toolType.StraightLiner:
                    return new ConstructionTool.Views.StraightLiner({
                        "el": this.$el
                    });
                case toolType.Image:
                    return new ConstructionTool.Views.Image({
                        "el": this.$el
                    });
                case toolType.Text:
                    return new ConstructionTool.Views.Text({
                        "el": this.$el
                    });
                case toolType.Background:
                    return new ConstructionTool.Views.Background({
                        "el": this.$el
                    });
                case toolType.Rectangle:
                    return new ConstructionTool.Views.Rectangle({
                        "el": this.$el
                    });
                default:
                    return null;
            }
        },

        /**
         * Factory method for creating shapes as per the passed type.
         * @method _createRulerObject
         * @params {String} strObjType Shape type stored in enum of shapes type possible.
         * @private
         */
        "_createRulerObject": function(strObjType) {
            var rulerType = ConstructionTool.Views.RulerType;
            switch (strObjType) {
                case rulerType.Compass:
                    return new ConstructionTool.Views.CompassRuler();
                case rulerType.StraightLiner:
                    return new ConstructionTool.Views.StraightLinerRuler();
                default:
                    return null;
            }
        },

        /**
         * Set shape that is being hit when multiple shapes are selected.
         * @method _setHitShape
         * @param {Object} shape object which is hit.
         * @private
         */
        "_setHitShape": function(hitShape) {
            this._hitShape = hitShape;
        },

        /**
         * Return shape object that is being hit.
         * @method _getHitShape
         * @return {Object} shape object which is hit.
         * @private
         */
        "_getHitShape": function() {
            return this._hitShape;
        },

        /**
         * Gets called when mouse down or touch start occurs based on device/browser used.
         * @method _onTouchStart
         * @params Paper mouse/touch event object.
         * @private
         */
        "_onTouchStart": function(eventObject) {
            if (eventObject.event.which === 3 || typeof eventObject.event.changedTouches !== "undefined" && eventObject.event.changedTouches.length > 1) {
                return;
            }
            var hitShape = null,
                shapeUnderHandler = null,
                data = null,
                selectedShapes = null,
                selectedshapesCount = null,
                iLooper = null,
                curShape = null,
                toolTypes = ConstructionTool.Views.ToolType,
                event = eventObject.event || {};

            //this condition for,if left key and any other wrong key is pressed
            if (this._currentEvents !== null || typeof eventObject.event.changedTouches !== "undefined" && eventObject.event.changedTouches.length > 1) {
                return;
            }
            this._currentEvents = eventObject;

            this._hasTouchOccurred = true;
            if (this._scrollBarManager !== null) {
                this._isScrollHit = this._scrollBarManager.isScrollHit(eventObject.point);
            }

            if (ConstructionTool.Views.CurToolType === toolTypes.CanvasPan || this._isScrollHit === true) {
                return;
            }

            hitShape = this._getShapeUnderCords(eventObject.point);

            if (hitShape !== null && hitShape.model.get("_data").shapeType === toolTypes.Background) {
                hitShape = null;
            }
            if (ConstructionTool.Views.CurToolType === toolTypes.StraightLiner || ConstructionTool.Views.CurToolType === toolTypes.Compass) {
                this._activeRuler = this._getActiveRuler(eventObject);
                if (this._activeRuler !== null) {
                    this._activeRuler.rulerObj.processTouchStart();
                }
                hitShape = null;
                this._setHitShape(null);
            }
            if (hitShape !== null && hitShape.model.get("_data").isSelected === true) {
                //If touchstart occur on shape and if shape is selected then it should act like select tool. That is, it should allow transformation.
                ConstructionTool.Views.CurToolType = toolTypes.Select;
            } else {
                shapeUnderHandler = this._getShapeUnderHandler(eventObject.point);
                if (shapeUnderHandler !== null) {
                    hitShape = shapeUnderHandler;
                }
            }

            switch (ConstructionTool.Views.CurToolType) {
                case toolTypes.Select:
                    if (hitShape !== null) {
                        // If shape is hit then dragStart for the hit shape.
                        this._setHitShape(hitShape);

                        if (hitShape.model.get("_data").isSelected === true) { //Drag start only if shape is selected
                            // Give drag start to all selected shapes, so all can start their movement if any
                            selectedShapes = this._arrSelectedShapes;
                            selectedshapesCount = selectedShapes.length;

                            for (iLooper = 0; iLooper < selectedshapesCount; iLooper++) {
                                curShape = selectedShapes[iLooper];
                                curShape.handleDragStart(eventObject);
                            }
                        } else {
                            hitShape.handleDragStart(eventObject);
                        }
                    } else if (event.altKey !== true) {
                        this._handleDragSelectionStart(eventObject);
                    }
                    break;
                case toolTypes.StraightLiner:
                    this._activeRuler = this._getActiveRuler(eventObject);
                    if (this._activeRuler !== null && this._activeRuler.isPencilHit === true) {
                        if (this._addingObj === null) {
                            this._clearShapeSelection();
                            this._addingObj = this.addShapeObject(ConstructionTool.Views.CurToolType);

                            data = {
                                "strokeWidth": this._propertyToolbar.getStrokeWidth(),
                                "strokeColor": this._propertyToolbar.getStrokeColor()
                            };
                            this._addingObj.setOptions(data);
                        }
                        this._addingObj._ruler = this._activeRuler.rulerObj;
                        this._addingObj._ruler.processTouchStart();
                        this._addingObj.processTouchStart(eventObject);
                        this._bringRulersToFront();
                    }
                    break;
                case toolTypes.Compass:
                    this._activeRuler = this._getActiveRuler(eventObject);
                    if (this._activeRuler !== null && this._activeRuler.isPencilHit === true) {
                        if (this._addingObj === null) {
                            this._clearShapeSelection();
                            this._addingObj = this.addShapeObject(ConstructionTool.Views.CurToolType);

                            data = {
                                "strokeWidth": this._propertyToolbar.getStrokeWidth(),
                                "strokeColor": this._propertyToolbar.getStrokeColor()
                            };
                            this._addingObj.setOptions(data);
                        }
                        this._addingObj._ruler = this._activeRuler.rulerObj;
                        this._addingObj._ruler.processTouchStart();
                        this._addingObj.processTouchStart(eventObject);
                    }
                    break;
                case toolTypes.Pencil:
                case toolTypes.Text:
                    // Check to see if we have current object being used on.
                    if (this._addingObj === null) {
                        this._clearShapeSelection();
                        this._addingObj = this.addShapeObject(ConstructionTool.Views.CurToolType);

                        data = {
                            "strokeWidth": this._propertyToolbar.getStrokeWidth(),
                            "strokeColor": this._propertyToolbar.getStrokeColor()
                        };
                        this._addingObj.setOptions(data);
                    }
                    this._addingObj.processTouchStart(eventObject);
                    break;
            }
        },

        "_getActiveRuler": function(eventObject) {
            var rulerCounter = 0,
                rulers = this._rulerArray,
                rulerCnt = rulers.length,
                isPencilHit = null,
                curRulerModel = null;

            for (; rulerCounter < rulerCnt; rulerCounter++) {
                curRulerModel = rulers[rulerCounter].model;
                isPencilHit = curRulerModel.isPencilHit(eventObject.point);
                if (isPencilHit === true && curRulerModel.get("_renderData").isActive !== false) {
                    return {
                        "rulerObj": rulers[rulerCounter],
                        "isPencilHit": true
                    };
                }
                if (curRulerModel.isRulerHit(eventObject.point) === true) {
                    return {
                        "rulerObj": rulers[rulerCounter]
                    };
                }
            }
            return null;
        },

        /**
         * Gets called when mouse move or touch move occurs based on device/browser used.
         * @method _onTouchMove
         * @params Paper mouse/touch event object.
         * @private
         */
        "_onTouchMove": function(eventObject) {
            if (!this._isValidMove() || eventObject.delta.x === 0 && eventObject.delta.y === 0) {
                return;
            }
            var curShape = this._getHitShape(),
                data = null,
                curShapeType,
                shapeOldState = null,
                toolTypes = ConstructionTool.Views.ToolType,
                event = eventObject.event || {};

            if (this._addingObj) {
                this._addingObj.processTouchMove(eventObject);
                if (this._addingObj.model.get("_data").shapeType === toolTypes.Compass) {
                    this._bringRulersToFront();
                }
            } else if (this._selectionPath) {
                this._handleDragSelectionMove(eventObject);
            } else if (ConstructionTool.Views.CurToolType === toolTypes.CanvasPan) {
                this._onCanvasPan(eventObject);
            } else if (curShape) {
                data = curShape.model.get("_data");
                if (data && data.isSelected === true) {
                    this._handleDragShapeMove(eventObject);
                } else if (data && !event.ctrlKey) {
                    this._clearShapeSelection();

                    curShapeType = curShape.model.get("_data").shapeType;

                    if (curShapeType === toolTypes.Text) {
                        curShape.model.setOptions({
                            "allowSelectionBound": true,
                            "allowResize": false,
                            "allowRotate": true
                        });
                    } else {
                        curShape.model.setOptions({
                            "allowSelectionBound": true,
                            "allowResize": true,
                            "allowRotate": true
                        });
                    }
                    curShape.select();

                    //find more place for this
                    shapeOldState = curShape._getPreviousState();
                    shapeOldState.shapeData.isSelected = true;
                    curShape._savePreviousState(shapeOldState);

                    this._handleDragShapeMove(eventObject);
                }
                this._redraw();
            } else if (event.altKey === true) {
                this._onCanvasPan(eventObject);
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
                return;
            }
            var onShapePlottingFinish = null,
                hitShape,
                curShape,
                iLooper,
                selectedShapes,
                selectedShapeCount, data, shape,
                activeRuler = null,
                toolTypes = ConstructionTool.Views.ToolType,
                curToolType = ConstructionTool.Views.CurToolType;

            //this condition for,if left key and any other wrong key is pressed
            if (this._currentEvents !== null || eventObject.changedTouches.length > 1) {
                this._currentEvents = null;
            } else {
                return;
            }
            this._hasTouchOccurred = false;
            this._isScrollHit = false;
            //if touch end occur on canvas,if select tool is canvas-pan then it should return
            if (curToolType === toolTypes.CanvasPan) {
                this._onCanvasPanEnd(eventObject);
                return;
            }
            if (curToolType === toolTypes.StraightLiner || curToolType === toolTypes.Compass) {
                activeRuler = this._activeRuler;
                if (activeRuler !== null) {
                    activeRuler.rulerObj.trigger("pathMouseUp", eventObject);
                    activeRuler.rulerObj.processTouchEnd();
                    if (activeRuler.isPencilHit !== true) {
                        this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.RulerTransform);
                        this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());
                    }
                }
            }
            onShapePlottingFinish = _.bind(function() {
                // Clean up procedure here
                if (this._isShapePlottingFinished) {
                    this._addingObj = null;
                    this._isShapePlottingFinished = false;
                    this._hitShape = null;
                }
            }, this);
            if (typeof this._addingObj !== "undefined" && this._addingObj !== null) {
                this._addingObj.processTouchEnd(eventObject);
                this._activeRuler = null;
                this._addingObj.select();
                if (curToolType === toolTypes.StraightLiner) {
                    this._bringRulersToFront();
                }
                if (this._addingObj.model.get("_data").shapeType !== toolTypes.Text) {
                    // Set the current action name to be transform. Used in undo redo while saving states of shape.
                    this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.Add);
                    // Save the data into the stack, as we have all data ready to extract.
                    this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand({
                        "shape": [this._addingObj]
                    }));
                } else {
                    this._enableTabs(false);
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
                    data = hitShape.model.get("_data");

                    if (hitShape._hitPoint && hitShape._curPoint) {
                        //Check if shape is clicked.
                        if (hitShape._hitPoint.x === hitShape._curPoint.x && hitShape._hitPoint.y === hitShape._curPoint.y && hitShape === curShape) {
                            if (!this._isCtrlSelect(eventObject) && this._arrSelectedShapes.length > 1) {
                                this._clearShapeSelection();
                            }
                            this._handleSelection(eventObject);
                            this._accOnShapeSelect();
                        } else if (data && data.isSelected === true) {
                            //if shape is selected then stop repetitive handleDragEnd
                            selectedShapes = this._arrSelectedShapes;
                            selectedShapeCount = selectedShapes.length;
                            for (iLooper = 0; iLooper < selectedShapeCount; iLooper++) {
                                shape = selectedShapes[iLooper];
                                shape.handleDragEnd(eventObject);
                                shape._selectionBound.trigger("handler-mouse-up", eventObject);
                            }

                            if (shape.model.get("_data").shapeType === toolTypes.Image || shape.model.get("_data").shapeType === toolTypes.Text) {
                                // Set the current action name to be transform. Used in undo redo while saving states of shape.
                                this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.Transform);
                                // Save the data into the stack, as we have all data ready to extract.
                                this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());
                            }
                            this._accOnShapeSelect();
                        }
                    }
                    this._setHitShape(null);
                }
            }
            //call clean up procedure
            if (curToolType !== toolTypes.Text) {
                onShapePlottingFinish();

            }
            this.updateObservableUniverse();
        },

        /**
         * Returns the shape that comes under the passed coordinates, Point object.
         * @method _getShapeUnderCords
         * @params {Object} objPoint that denotes a point object.
         * @private
         * @returns Returns first shape that comes under the point else returns null.
         */
        "_getShapeUnderCords": function(objPoint) {
            var iLooper = this._arrShapes.length - 1,
                curShape = null;

            for (; iLooper >= 0; iLooper--) {
                curShape = this._arrShapes[iLooper];
                if (curShape.isHit(objPoint)) {
                    return curShape;
                }
            }
            return null;
        },

        /**
         * Returns shapes that comes under the passed coordinates, Point object.
         * @method _getShapeUnderHandler
         * @params {Object} objPoint that denotes a point object.
         * @private
         * @returns Returns all shape that comes under the point else returns null.
         */
        "_getShapeUnderHandler": function(objPoint) {
            var selectedShapes = this._arrSelectedShapes,
                iLooper = selectedShapes.length - 1,
                curShape = null;

            for (; iLooper >= 0; iLooper--) {
                curShape = selectedShapes[iLooper];

                if (typeof curShape !== "undefined" &&
                    (curShape._selectionBound._rotateHandlePath !== null && curShape._selectionBound._rotateHandlePath.hitTest(objPoint) ||
                        curShape._selectionBound._resizeHandlePath !== null && curShape._selectionBound._resizeHandlePath.hitTest(objPoint) ||
                        curShape._selectionBound._intermediatePath !== null && curShape._selectionBound._intermediatePath.hitTest(objPoint))) {
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
        "_getRulerById": function(strId) {
            var rulerCounter = this._rulerArray.length - 1,
                curRuler = null;
            for (; rulerCounter >= 0; rulerCounter--) {
                curRuler = this._rulerArray[rulerCounter];
                if (curRuler.getId() === strId) {
                    return curRuler;
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
            return this._hasTouchOccurred;
        },

        /**
         * Clears the shape from current shape selection, if no shape passed, removes all the shapes.
         * @method _clearShapeSelection
         * @params {Object} Shape object that has to be removed from the selected shape's collection.
         * @private
         */
        "_clearShapeSelection": function(oShape) {
            var curShape = null,
                iLooper = null,
                len = null;
            if (oShape) {
                oShape.deselect();
            } else {
                len = this._arrSelectedShapes.length;
                for (iLooper = len - 1; iLooper >= 0; iLooper--) {
                    curShape = this._arrSelectedShapes[iLooper];
                    curShape.deselect();
                }
                this._arrSelectedShapes.length = 0;
            }
            this._redraw();
        },

        /**
         * Redraws the entire view port. Only used for paper object redrawing.
         * @method _redraw
         * @private
         */
        "_redraw": function() {
            ConstructionTool.Views.PaperScope.view.draw();
        },

        /**
         * Draws all the shape on the view.
         * @method draw
         * @public
         */
        "draw": function() {
            var iLooper = 0,
                curShape = null,
                shapesLen = this._arrShapes.length;

            for (; iLooper < shapesLen; iLooper++) {
                curShape = this._arrShapes[iLooper];
                curShape.draw();
            }
        },

        /**
         * Draws all the shape on the view.
         * @method draw
         * @public
         */
        "drawHelper": function() {
            var rulerCounter = 0,
                curRuler = null,
                rulerLen = this._rulerArray.length;

            for (; rulerCounter < rulerLen; rulerCounter++) {
                curRuler = this._rulerArray[rulerCounter];
                curRuler.drawHelper();
            }
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
                selectedShapes = this._arrSelectedShapes,
                currShape = null,
                isCtrlKeyDown = this._isCtrlSelect(eventObject),
                curShapeType,
                toolTypes = ConstructionTool.Views.ToolType;

            // **************************************************************
            // Handle selection
            // If we don't have any hit shape or
            // the current shape being created is not our hit shape again. {In case of polygon, this can happen.}
            if (curHitShape !== null || curHitShape !== this._addingObj) {
                bShapeHit = true;
                if (curHitShape.model.get("_data").allowSelection !== false) {
                    if (!curHitShape.isSelected()) {
                        // If multiple selection by clicking is not allowed then remove the last selections.
                        if (!isCtrlKeyDown) {
                            this._clearShapeSelection();
                        }
                        if (this._arrSelectedShapes.length > 0) { //If multiple shapes are selected using control key
                            if (this._arrSelectedShapes.length === 1) {
                                //Remove rotate and resize handlers of previously selected shape
                                currShape = selectedShapes[0];
                                currShape.deselect();
                                currShape.setOptions({
                                    "allowResize": false,
                                    "allowRotate": false
                                });
                                currShape.select();
                            }
                            //Draw bounds without rotate and resize handlers
                            curHitShape.setOptions({
                                "allowResize": false,
                                "allowRotate": false
                            });
                            curHitShape.select();
                        } else {
                            curShapeType = curHitShape.model.get("_data").shapeType;
                            if (curShapeType === toolTypes.Pencil || curShapeType === toolTypes.Text) {
                                curHitShape.setOptions({
                                    "allowResize": false,
                                    "allowRotate": true,
                                    "allowSelectionBound": true
                                });
                            } else if (curShapeType === toolTypes.Background) {
                                curHitShape.setOptions({
                                    "allowResize": false,
                                    "allowRotate": false
                                });
                            } else {
                                curHitShape.setOptions({
                                    "allowResize": true,
                                    "allowRotate": true
                                });
                            }
                            curHitShape.select();
                        }
                    } else {
                        //When second last selected shape is clicked, deselect the last remaining shape and again select it with rotate and resize handlers.
                        if (this._arrSelectedShapes.length === 2) {
                            curHitShape.deselect();
                            currShape = selectedShapes[0];
                            currShape.deselect();
                            curShapeType = currShape.model.get("_data").shapeType;
                            if (curShapeType === toolTypes.Pencil || curShapeType === toolTypes.Text) {
                                currShape.setOptions({
                                    "allowResize": false,
                                    "allowRotate": true,
                                    "allowSelectionBound": true
                                });
                            } else if (curShapeType === toolTypes.Background) {
                                currShape.setOptions({
                                    "allowResize": false,
                                    "allowRotate": false
                                });
                            } else {
                                currShape.setOptions({
                                    "allowResize": true,
                                    "allowRotate": true
                                });
                            }
                            currShape.select();
                        } else {
                            curHitShape.deselect();
                        }
                    }
                }
            } else {
                this._clearShapeSelection();
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
            this._selectionPath = this.getShapeObject(ConstructionTool.Views.ToolType.Rectangle);
            this._selectionPath.setOptions({
                "fillColor": null,
                "strokeWidth": 1,
                "fillAlpha": 1,
                "strokeColor": "#A6A6A6"
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
                shapeData = null,
                shapeLen = this._arrShapes.length,
                shapeCounter = 0,
                curShape,
                shapesInSelectionRect = [],
                toolTypes = ConstructionTool.Views.ToolType;

            this._selectionPath.processTouchEnd(eventObject);
            strokeBounds = this._selectionPath.getBoundingRect();

            // Loop through all shapes to check if any shape comes within our bounds
            for (; shapeCounter < shapeLen; shapeCounter++) {
                curShape = this._arrShapes[shapeCounter];
                shapeStrokeBounds = curShape.getBoundingRect();

                if (shapeStrokeBounds !== null && MathUtilities.Components.Utils.Models.MathHelper.isRectInRect(shapeStrokeBounds, strokeBounds) && curShape.model.get("_data").allowSelection !== false) {
                    shapesInSelectionRect.push(curShape);
                }
            }

            //Remove resize and rotate handlers if multiple shapes are selected.
            for (shapeCounter = 0; shapeCounter < shapesInSelectionRect.length; shapeCounter++) {
                if (shapesInSelectionRect.length > 1) {
                    shapesInSelectionRect[shapeCounter].setOptions({
                        "allowResize": false,
                        "allowRotate": false
                    });
                } else {
                    shapeData = shapesInSelectionRect[shapeCounter].model.get("_data");
                    if (shapeData.shapeType === toolTypes.Text) {
                        shapesInSelectionRect[shapeCounter].setOptions({
                            "allowResize": false,
                            "allowRotate": true
                        });
                    } else {
                        shapesInSelectionRect[shapeCounter].setOptions({
                            "allowResize": shapeData.allowResize,
                            "allowRotate": shapeData.allowRotate
                        });
                    }
                }

                shapesInSelectionRect[shapeCounter].select();
            }

            // Remove the current selection bound drawn
            this._selectionPath._intermediatePath.remove();
            this._selectionPath.remove();
            this._selectionPath = null;
        },

        /**
         * Update canvas cursor class depending upon cursor-type.
         * @method _updateCanvasCursor
         * @param {Object} toolType
         * @private
         */
        "_updateCanvasCursor": function(currentToolType) {
            var toolTypes = ConstructionTool.Views.ToolType,
                cursorTypes = ConstructionTool.Views.CursorType,
                currCursor = null;

            switch (currentToolType) {
                case toolTypes.Pencil:
                    currCursor = cursorTypes.Pencil;
                    break;
                case toolTypes.CanvasPan:
                    currCursor = cursorTypes.Move;
                    break;
                case toolTypes.Text:
                    currCursor = cursorTypes.Text;
                    break;
                default:
                    currCursor = cursorTypes.Default;
                    break;
            }
            this._selectCanvasCursorType(currCursor);
        },

        /**
         * Change canvas cursor style
         * @method _changeCanvasCursor
         * @param {String} cursor class name.
         */
        "_changeCanvasCursor": function(cursorClass) {
            var $canvas = this._$constructionToolCanvas,
                cursorType = ConstructionTool.Views.CursorType,
                type;
            for (type in cursorType) {
                $canvas.removeClass(cursorType[type]).removeClass(cursorType[type] + "-ie");
            }
            $canvas.addClass(cursorClass);
        },

        /**
         * Select canvas cursor depending upon tool-type.
         * @method _selectCanvasCursorType
         * @param {Object} toolType
         * @private
         */
        "_selectCanvasCursorType": function(cursorType) {
            if (this.isMobile()) {
                return;
            }
            var cursorTypes = ConstructionTool.Views.CursorType,
                browserCheck = MathUtilities.Components.Utils.Models.BrowserCheck,
                isIE11 = browserCheck.isIE11;

            switch (cursorType) {
                case cursorTypes.Pencil:
                case cursorTypes.RotationStart:
                case cursorTypes.Rotation:
                    if (browserCheck.isIE || isIE11) {
                        this._changeCanvasCursor(cursorType + "-ie");
                    } else {
                        this._changeCanvasCursor(cursorType);
                    }
                    break;
                case cursorTypes.Move:
                case cursorTypes.Pointer:
                case cursorTypes.ResizeLeft:
                case cursorTypes.ResizeRight:
                case cursorTypes.Text:
                    this._changeCanvasCursor(cursorType);
                    break;
                default:
                    if (browserCheck.isIE || isIE11) {
                        this._changeCanvasCursor(cursorTypes.Default + "-ie");
                    } else {
                        this._changeCanvasCursor(cursorTypes.Default);
                    }
                    break;
            }
        },
        /**
         * Gets fired when a shape is selected.
         * @method _onShapeSelect
         * @params {Object} curShape that is selected
         * @private
         */
        "_onShapeSelect": function(curShape) {
            this._arrSelectedShapes.push(curShape);
            this._bindBoundsHandleEvents(curShape);
            this.showPropertyToolbar(curShape);
        },

        /**
         * Gets fired when a shape is delsected.
         * @method _onShapeDeselect
         * @params {Object} curShape that is de-selected
         * @private
         */
        "_onShapeDeselect": function(curShape) {
            this._arrSelectedShapes.splice(this._arrSelectedShapes.indexOf(curShape), 1);
            this.showPropertyToolbar();
            if (ConstructionTool.Views.CurToolType !== ConstructionTool.Views.ToolType.Pencil) {
                this._updateCanvasCursor(ConstructionTool.Views.CursorType.Default);
            }
        },

        /**
         * Gets fired when canvas pan
         * @method _onCanvasPan
         * @param {object} event
         * @private
         */
        //its called when canvas is pan after selecting pan-canvas tool, not by scroll-bar
        "_onCanvasPan": function(event) {
            if (this._isScrollHit === true) {
                return;
            }

            this._panCanvas(event.delta);

        },
        /**
         * Pan canvas by given delta value.
         * @method _panCanvas
         * @private
         */
        "_panCanvas": function(delta) {
            var transformModel = ConstructionTool.Models.Transform,
                currentOrigin = transformModel.CURRENT_ORIGIN.canvasCo,
                defaultOrigin = transformModel.DEFAULT_ORIGIN;

            currentOrigin.x += delta.x;
            currentOrigin.y += delta.y;

            defaultOrigin.graphCo = transformModel.toGraphCo(defaultOrigin.canvasCo);

            this._panShapeLayer(delta);
        },

        /**
         * Change bounds of shape layer by given delta value.
         * @method _panShapeLayer
         * @param {Object} delta value by which layer should be pan
         * @private
         */
        "_panShapeLayer": function(delta, isOriginShift) {
            var shapeLayer = this._projectLayers.shapeLayer,

                shape = null,
                arrShape = this._arrShapes,

                arrRuler = this._rulerArray,

                curShape = null,
                curRuler = null,

                redrawShape = function() {
                    var curShapeObj = null,
                        shapeObj = null,
                        ruler = null;
                    for (shapeObj in arrShape) {
                        curShapeObj = arrShape[shapeObj];
                        if (curShapeObj.model.get("_data").shapeType === ConstructionTool.Views.ToolType.Background) {
                            curShapeObj.draw();
                        } else if (isOriginShift && curShapeObj.model.get("_data").shapeType === ConstructionTool.Views.ToolType.Text) {
                            curShapeObj.updateCanvasBounds();
                        }
                        curShapeObj.updateAccBoundingBox();
                    }

                    for (ruler in arrRuler) {
                        curRuler = arrRuler[ruler];
                        if (curRuler.model.get("_renderData")._rulerType === ConstructionTool.Views.RulerType.StraightLiner) {
                            curRuler.drawExtensionLine();
                        }
                        curRuler.updateAccBoundingBox();
                    }

                };

            if (shapeLayer.children.length) {
                shapeLayer.bounds.x += delta.x;
                shapeLayer.bounds.y += delta.y;
            }

            for (shape in arrShape) {
                curShape = arrShape[shape];
                curShape.model.setRotationPoint(curShape.model.getRotationReferencePoint());
            }

            redrawShape();
            this._updateVisibleFrame();
        },

        /**
         * Gets fired when canvas pan end.
         * store value to undo-redo stack
         * @method _onCanvasPanEnd
         * @param {object} event
         * @private
         */

        //its called when canvas is pan after selecting pan-canvas tool, not by scroll-bar
        "_onCanvasPanEnd": function(event) {
            var oldState = {},
                newState = {},
                delta = event.delta,
                shapes = this._arrShapes;

            if (shapes.length !== 0 && (event.delta.x !== 0 || event.delta.y !== 0)) {
                oldState.delta = delta.clone();
                newState.delta = delta.clone();

                oldState.delta.x = -oldState.delta.x;
                oldState.delta.y = -oldState.delta.y;
            }
        },

        /**
         * Apply the options on the list of shapes that are passed.
         * @params [Array] lstShapes Array of shapes.
         * @params [Object] objOptions Style or other object data that is to applied on array of shapes passed.
         */
        "applyOptions": function(lstShapes, objOptions) {
            var iLooper = null;
            for (iLooper = 0; iLooper < lstShapes.length; iLooper++) {
                lstShapes[iLooper].setOptions(objOptions);
            }
            this._redraw();
        },

        /**
         * Changes the current tool property of app.
         * @event _onPropertyValueChange
         * @params {Object} toolDataObj -- Tool data object that let the change in current tool.
         * @private
         */
        "_onPropertyValueChange": function(toolDataObj) {
            var data = {};

            switch (toolDataObj.changeProperty) {
                case ConstructionTool.Views.PropertyToolBar.PROPERTY.DELETE_CLICK:
                    this._onDelete();
                    return;
                case ConstructionTool.Views.PropertyToolBar.PROPERTY.RESIZE_CLICK:
                    this._onImageResize();
                    return;
                case ConstructionTool.Views.PropertyToolBar.PROPERTY.STROKE_WIDTH_CHANGE:
                    data.strokeWidth = toolDataObj.toolValue;
                    break;
                case ConstructionTool.Views.PropertyToolBar.PROPERTY.STROKE_COLOR_CHANGE:
                    data.strokeColor = toolDataObj.toolValue;
                    break;
                case ConstructionTool.Views.PropertyToolBar.PROPERTY.BACKGROUND_COLOR_CHANGE:
                    this._onBackgroundChange(toolDataObj.toolValue);
                    break;
            }

            this.model.setOptions(data);

            //Apply style to currently selected shape
            this.applyOptions(this._arrSelectedShapes, data);
        },

        /**
         * Checks if multiple selection with cntrl Key is applicable or not.
         * @method _isCtrlSelect
         * @private
         */
        "_isCtrlSelect": function(event) {
            if (event.event.ctrlKey && navigator.appVersion.indexOf("Mac") === -1 || event.event.metaKey) {
                return true;
            }
            return false;
        },

        /**
         * Drag all selected shapes, if no shape is selected, then drag current hit shape.
         * @method _handleDragShapeMove
         * @params {Object} Shape object that has to be drag.
         * @private
         */
        "_handleDragShapeMove": function(eventObject) {
            var selectedShapes = this._arrSelectedShapes,
                selectedShapesCount = selectedShapes.length,
                iLooper = 0,
                shape = this._getHitShape();
            if (selectedShapesCount === 0 && shape !== null) {
                shape.handleDragging(eventObject);
            }
            for (; iLooper < selectedShapesCount; iLooper++) {
                shape = selectedShapes[iLooper];
                shape.handleDragging(eventObject);
            }
        },

        /**
         * Delete all selected shapes,if shapes passed then delete shapes.
         * @event _onDelete
         * @params {Array} arrShape -- shapes to be delete.
         * @private
         */
        "_onDelete": function(arrShape, supressStackPush) {
            var clonedShapes = null,
                accManagerView = ConstructionTool.Views.accManagerView;

            arrShape = arrShape || this._arrSelectedShapes;

            if (arrShape.length > 0) {
                clonedShapes = MathUtilities.Components.Utils.Models.Utils.getCloneOf(arrShape);
                this.remove(arrShape, true);
                this._clearShapeSelection();
                this.showPropertyToolbar(ConstructionTool.Views.ToolType.Select);
                this._redraw();

                if (supressStackPush !== true) {
                    // Set the current action name to be transform. Used in undo redo while saving states of shape.
                    this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.Remove);
                    this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand({
                        "shape": clonedShapes
                    }));
                }
                accManagerView.setFocus("straight-liner-tool-highlighter");
            }
        },

        "_onImageResize": function() {
            var selectedShapesArray = this._arrSelectedShapes,
                shapeCounter = 0,
                selectedShapesLen = selectedShapesArray.length,
                curShape = null;

            for (; shapeCounter < selectedShapesLen; shapeCounter++) {
                curShape = selectedShapesArray[shapeCounter];
                if (curShape.model.get("_data").shapeType === ConstructionTool.Views.ToolType.Image) {
                    if (curShape.model.get("_data").allowResize !== true) {

                        curShape.model.setOptions({
                            "allowResize": true
                        });
                        curShape.drawBounds();

                        this._bindBoundsHandleEvents(curShape);
                    }
                }
            }
            this._redraw();
        },

        "_deleteRuler": function(arrRuler) {
            var rulersLen = null,
                rulerCounter = 0,
                oldState = {},
                curState = {},
                curRuler = null;

            arrRuler = arrRuler || this._rulerArray;
            rulersLen = arrRuler.length;

            for (; rulerCounter < rulersLen; rulerCounter++) {
                curRuler = arrRuler[rulerCounter];
                oldState = curRuler.model.getSyncData();
                oldState.id = curRuler.getId();

                curState.bRemove = true;
                curState.id = curRuler.getId();

                curRuler._savePreviousState(oldState);
                curRuler._saveCurrentState(curState);
            }

            this.removeRuler(arrRuler, true);

            this.updateObservableUniverse();

            this._isStraightLinerVisible = false;
            this._isCompassVisible = false;
        },

        "removeRuler": function(arrRulersToDelete, bSaveState) {
            var curRuler = null,
                indexToDelete = -1,
                canvasAccView = ConstructionTool.Views.canvasAccView,
                accObjectMap = this._accdivObjectMapping,
                obj = null;

            while (arrRulersToDelete.length > 0) {
                curRuler = arrRulersToDelete[0];

                indexToDelete = this._rulerArray.indexOf(curRuler);

                curRuler.remove(bSaveState);
                for (obj in accObjectMap) {
                    if (accObjectMap[obj].cid === curRuler.cid) {
                        canvasAccView.removeAccDiv(obj);
                        canvasAccView.removeFocusRect();
                    }
                }
                if (indexToDelete !== -1) {
                    this._rulerArray.splice(indexToDelete, 1);
                }

                indexToDelete = arrRulersToDelete.indexOf(curRuler);
                if (indexToDelete !== -1) {
                    arrRulersToDelete.splice(indexToDelete, 1);
                }
            }
        },

        "changeRulersVisibility": function(arrRulers, isVisible) {
            var rulerCounter = null,
                rulerLength = null,
                cuRuler = null;
            arrRulers = arrRulers.length !== 0 ? arrRulers : this._rulerArray;
            rulerLength = arrRulers.length;
            for (rulerCounter = 0; rulerCounter < rulerLength; rulerCounter++) {
                cuRuler = arrRulers[rulerCounter];
                cuRuler.setVisibility(isVisible);
            }
        },

        /**
         * Remove shapes passed.
         * @event remove
         * @params {Array} arrShapesToDelete -- shapes to be removed.
         * @param {Boolean} bSaveState -- is state to be save before removing shape
         * @private
         */
        "remove": function(arrShapesToDelete, bSaveState) {
            var curShape = null,
                indexToDelete = -1,
                data = null,
                canvasAccView = ConstructionTool.Views.canvasAccView,
                toolTypes = ConstructionTool.Views.ToolType,
                curShapeType = null;

            while (arrShapesToDelete.length > 0) {
                curShape = arrShapesToDelete[0];
                data = curShape.model.get("_data");

                indexToDelete = this._arrShapes.indexOf(curShape);

                canvasAccView.removeAccDiv("canvas-acc-container-" + data.accId);
                canvasAccView.removeFocusRect();

                curShape.remove(bSaveState);
                curShapeType = curShape.model.get("_data").shapeType;
                if (curShapeType === toolTypes.Background) {
                    this._backgroundView = null;
                } else if (curShapeType === toolTypes.Image) {
                    this._imageView = null;
                }
                if (indexToDelete !== -1) {
                    this._arrShapes.splice(indexToDelete, 1);
                }

                indexToDelete = arrShapesToDelete.indexOf(curShape);
                if (indexToDelete !== -1) {
                    arrShapesToDelete.splice(indexToDelete, 1);
                }
            }
            this.updateObservableUniverse();
            return true;
        },

        /**
         * Fires when the reset button is pressed of menubar.
         * @event resetToolState
         * @private
         */
        "resetToolState": function() {
            var onRefresh = null,
                resetToolStateObject = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(this.model.get("resetToolState")),
                undoRedoData = {},
                setFocus = null,
                currentStateObject = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(this.saveState()),
                accManger = ConstructionTool.Views.accManagerView,
                isAccessible = ConstructionTool.Views.isAccessible;

            setFocus = _.bind(function setFocus() {
                if (isAccessible === true) {
                    accManger.setFocus("straight-liner-tool-highlighter", 5);
                } else {
                    //set focus to tool-holder to make it active element after pop-up is closed.
                    this.$(".math-utilities-components-tool-holder").focus();
                }

            }, this);

            onRefresh = _.bind(function onRefresh() {
                undoRedoData.oldState = {
                    "toolState": this.saveState(),
                    "isRetrieveState": false
                };

                this._propertyToolbar.setToDefaultState();
                this.parseData(resetToolStateObject);

                undoRedoData.newState = {
                    "toolState": this.saveState(),
                    "isRetrieveState": true
                };
                undoRedoData.actionName = ConstructionTool.Views.UndoRedoActions.Reset;
                this._saveToUndoRedoStack(undoRedoData);

                setFocus();
                this.setDocumentClean();

            }, this);

            if (MathUtilities.Components.Utils.Models.Utils.isEqual(resetToolStateObject, currentStateObject) === false) {
                this._showCustomPopup("reset-screen", onRefresh, setFocus);
            }
        },

        "showPropertyToolbar": function(curToolType) {
            var selectedShapes = this._arrSelectedShapes,
                selectedShapesLength = selectedShapes.length,
                manager = ConstructionTool.Views.accManagerView,
                ToolType = ConstructionTool.Views.ToolType;

            if (selectedShapesLength === 1) {
                //only single shape selection
                curToolType = selectedShapes[0].model.get("_data").shapeType;
            } else if (selectedShapesLength > 1) {
                //if multiple shapes selected
                curToolType = ToolType.None;
            }

            if (curToolType === ToolType.Image && this._imageView === null) {
                this._propertyToolbar.hide();
            } else {
                this._propertyToolbar.show(curToolType);
            }

            manager.unloadScreen("property-bar");
            manager.loadScreen("property-bar");
        },

        "_bindBoundsHandleEvents": function(shape) {
            if (shape._selectionBound) {
                var cursorTypes = ConstructionTool.Views.CursorType;
                shape._selectionBound.off("rotate-handle-mouse-enter rotate-handle-mouse-leave rotate-handle-mouse-down handler-mouse-up resize-handle-mouse-enter resize-handle-mouse-leave resize-handle-mouse-down drag-handle-enter drag-handle-mouse-down")
                    .on("rotate-handle-mouse-enter", _.bind(function() {
                        this._selectCanvasCursorType(cursorTypes.RotationStart);
                    }, this))
                    .on("resize-handle-mouse-enter", _.bind(function(event) {
                        this._changeCanvasCursorOnResizeEnter(event, shape);
                    }, this))
                    .on("resize-handle-mouse-down", _.bind(function() {
                        this._boundsHandleMouseDown(shape);
                    }, this))
                    .on("handler-mouse-up", _.bind(function(event) {
                        this._boundsHandleMouseUp(shape, event);
                    }, this))
                    .on("rotate-handle-mouse-down", _.bind(function() {
                        this._boundsHandleMouseDown(shape, ConstructionTool.Views.CursorType.Rotation);
                    }, this))
                    .on("drag-handle-enter", _.bind(function() {
                        this._selectCanvasCursorType(cursorTypes.Move);
                    }, this))
                    .on("drag-handle-mouse-down", _.bind(function() {
                        this._boundsHandleMouseDown(shape, ConstructionTool.Views.CursorType.Move);
                    }, this))
                    .on("drag-handle-leave rotate-handle-mouse-leave resize-handle-mouse-leave", _.bind(function() {
                        this._selectCanvasCursorType(cursorTypes.Default);
                    }, this));
            }
        },

        "_boundsHandleMouseDown": function(shape, cursorType) {
            shape._selectionBound.off("resize-handle-mouse-enter resize-handle-mouse-leave drag-handle-leave drag-handle-enter rotate-handle-mouse-enter rotate-handle-mouse-leave drag-handle-mouse-down");
            if (typeof cursorType !== "undefined") {
                this._selectCanvasCursorType(cursorType);
            }
        },

        "_boundsHandleMouseUp": function(shape, eventObject) {
            var rotateHitTestResult,
                resizeHitTestResult,
                selectionBoundHitTestResult,
                cursorTypes = ConstructionTool.Views.CursorType;
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
                this._selectCanvasCursorType(cursorTypes.Rotate);
            } else if (typeof resizeHitTestResult !== "undefined" && resizeHitTestResult !== null) {
                this._changeCanvasCursorOnResizeEnter(shape);
            } else if (typeof selectionBoundHitTestResult !== "undefined" && selectionBoundHitTestResult !== null) {
                this._changeCanvasCursor();
            } else {
                this._selectCanvasCursorType(cursorTypes.Default);
            }
            this._bindBoundsHandleEvents(shape);
        },

        "_changeCanvasCursorOnResizeEnter": function(eventObject, shape) {
            var hitTestResult, flipData,
                cursorTypes = ConstructionTool.Views.CursorType;

            if (shape && shape._intermediatePath) {
                hitTestResult = shape._intermediatePath.hitTest(eventObject.point);
                if (hitTestResult !== null && typeof hitTestResult !== "undefined") {
                    if (hitTestResult.type !== "stroke") {
                        this._selectCanvasCursorType(cursorTypes.Move);
                    }
                }
                flipData = shape.model.get("_renderData").flipDirection;
                if (flipData.x === -1 && flipData.y === 1 || flipData.x === 1 && flipData.y === -1) {
                    this._selectCanvasCursorType(cursorTypes.ResizeLeft);
                } else {
                    this._selectCanvasCursorType(cursorTypes.ResizeRight);
                }
            }
        },

        "_onBackgroundChange": function(newBackground) {
            var backgroundView = null,
                oldState = {};

            if (this._backgroundView === null) {
                this._backgroundView = this.addShapeObject(ConstructionTool.Views.ToolType.Background);
                oldState.bRemove = true;
            } else {
                oldState = this._backgroundView.model.getCloneData();
            }
            oldState.id = this._backgroundView.getId();
            backgroundView = this._backgroundView;
            backgroundView.model.setOptions({
                "backgroundData": newBackground
            });
            backgroundView.draw();
            this._sendToBack(backgroundView);

            this._backgroundView._savePreviousState(oldState);
            // Set the current action name to be transform. Used in undo redo while saving states of shape.
            this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.Add);
            // Save the data into the stack, as we have all data ready to extract.
            this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand({
                "shape": [this._backgroundView]
            }));
        },

        /**
         * Sends back the selected shapes.
         * @method _sendToBack
         * @private
         */
        "_sendToBack": function(shape) {
            this._changeZIndex(shape, 0);
        },

        "_changeZIndex": function(shape, newZindex) {
            var arrShape = this._arrShapes,
                shapeIndex = $.inArray(shape, arrShape);


            arrShape.splice(shapeIndex, 1);
            arrShape.splice(newZindex, 0, shape);
            this._updateZIndexes();
        },

        "_bringRulersToFront": function() {
            var paperScope = ConstructionTool.Views.PaperScope,
                activeLayer = paperScope.project.activeLayer,
                rulers = this._rulerArray,
                rulersLength = rulers.length,
                rulersCounter = 0,
                curRuler, zIndex,
                lastShapeIndex = null;

            if (rulersLength > 1) {
                this._updateZIndexes();
            }

            lastShapeIndex = activeLayer.children.indexOf(activeLayer.lastChild);

            for (; rulersCounter < rulersLength; rulersCounter++) {
                zIndex = lastShapeIndex + (rulersCounter + 1); //as indices start from 0

                curRuler = rulers[rulersCounter];
                curRuler.model.setOptions({
                    "zIndex": zIndex
                });
                curRuler.updatePathZIndex();
            }
            this._redraw();
        },

        "triggerMenuTool": function(curTool) {
            if (curTool === ConstructionTool.Views.ToolType.Select) {
                this.changeManubarState(this.model.defaultMenuBarState.selectedMenuIndex, this.model.defaultMenuBarState.selectedSubMenuIndices, this.model.defaultMenuBarState.singleMenuIndices);
            } else {
                this.changeManubarState(this.model.menubarLastState.selectedMenuIndex, this.model.menubarLastState.selectedSubMenuIndices, this.model.defaultMenuBarState.singleMenuIndices);
            }
        },

        "changeManubarState": function(selectedMenuIndex, selectedSubMenuIndices, singleMenuOptionIndices) {
            var model = this.model,
                subIndex = selectedSubMenuIndices[selectedMenuIndex],
                directive = model.get("toolMenuBarActionMap")[selectedMenuIndex][subIndex],
                isAccessible = ConstructionTool.Views.isAccessible;


            ConstructionTool.Views.CurToolType = directive;
            this._updateCanvasCursor(directive);

            this._menuBarView.setMenubarState(selectedMenuIndex, selectedSubMenuIndices, singleMenuOptionIndices);

            this.model.menubarLastState.selectedMenuIndex = this.model.menubarCurrentState.selectedMenuIndex;
            this.model.menubarCurrentState.selectedMenuIndex = selectedMenuIndex;

            this.onToolSelect({
                "supressClearSelection": true
            });
        },

        "_updateZIndexes": function() {
            var arrShapes = this._arrShapes,
                shapeCounter,
                shapeLen = arrShapes.length,
                curShape = null;

            for (shapeCounter = 0; shapeCounter < shapeLen; shapeCounter++) {
                curShape = arrShapes[shapeCounter];
                this.setShapeZIndex(curShape);
                curShape.updatePathZIndex();
            }
            this._redraw();
        },

        "setShapeZIndex": function(curShape) {
            if (typeof curShape === "undefined" || curShape === null) {
                return;
            }
            var arrShapes = this._arrShapes,
                index = arrShapes.indexOf(curShape);

            curShape.model.setOptions({
                "zIndex": index
            });
        },

        /**
         * Gets fired when a key is pressed.
         * @method _onKeyDown
         * @params {Object} eventObject. Event Data
         * @private
         */
        "_onKeyDown": function(eventObject) {
            var shapes = this._arrShapes,
                selectableShape = [],
                totalSelectableShapes = 0,
                curShape = null,
                index = null,
                defaultMenubarState = this.model.defaultMenuBarState,
                curToolType = ConstructionTool.Views.CurToolType,
                toolTypes = ConstructionTool.Views.ToolType,
                isAccessible = ConstructionTool.Views.isAccessible,
                sketchpadModel = ConstructionTool.Models.Sketchpad,
                isInputElem = $(eventObject.target).is("input[type=\"text\"]");

            switch (eventObject.keyCode) {
                case sketchpadModel.ESCAPE_KEY:
                    if (!isAccessible) {
                        if (this._arrSelectedShapes.length > 0) {
                            while (this._arrSelectedShapes.length !== 0) {
                                this._arrSelectedShapes[0].deselect();
                            }
                            this._redraw();
                        } else {
                            this._propertyToolbar.hide();
                        }
                    }
                    break;
                case sketchpadModel.DELETE_KEY:
                    if (!isInputElem) {
                        this._onDelete();
                    }
                    break;
                case sketchpadModel.BACKSPACE_KEY:
                    if (!isInputElem) {
                        this._onDelete();
                        return false;
                    }
                    break;

                case sketchpadModel.ALPHABET_A_KEY:
                    if (!isInputElem && (eventObject.ctrlKey || MathUtilities.Components.Utils.Models.BrowserCheck.isMac && eventObject.metaKey)) {
                        if (curToolType === toolTypes.Pencil || curToolType === toolTypes.CanvasPan) {
                            this.triggerMenuTool(toolTypes.Select);
                        } else if (curToolType === toolTypes.StraightLiner || curToolType === toolTypes.Compass) {
                            this._menuBarView.selectMenu(defaultMenubarState.selectedMenuIndex);
                        }
                        for (index in shapes) {
                            curShape = shapes[index];
                            if (curShape.model.get("_data").allowSelection !== false) {
                                selectableShape.push(curShape);
                            }
                        }

                        totalSelectableShapes = selectableShape.length;
                        for (index in selectableShape) {
                            curShape = selectableShape[index];
                            //Deselect shape if already selected
                            if (curShape.isSelected()) {
                                curShape.deselect();
                            }
                            //For multiple shapes remove handlers
                            if (totalSelectableShapes > 1) {
                                curShape.setOptions({
                                    "allowResize": false,
                                    "allowRotate": false
                                });
                            }
                            curShape.select();
                        }
                        this._redraw();

                        this._accOnShapeSelect();
                        return false;
                    }
                    break;

                case sketchpadModel.LEFT_ARROW_KEY:
                case sketchpadModel.RIGHT_ARROW_KEY:
                case sketchpadModel.TOP_ARROW_KEY:
                case sketchpadModel.BOTTOM_ARROW_KEY:
                    this._performArrowAction(eventObject);
                    break;
            }
        },

        "enableDisableRuler": function(isEnable, rulersArray) {
            if (typeof isEnable !== "boolean") {
                return;
            }
            var rulers = rulersArray !== null ? rulersArray : this._rulerArray,
                rulersLength = rulers.length,
                rulerCounter = null,
                curRuler = null;
            for (rulerCounter = 0; rulerCounter < rulersLength; rulerCounter++) {
                curRuler = rulers[rulerCounter];
                curRuler.enableDisableRuler(isEnable);
            }
        },

        "_onRulerRotateButtonDown": function(cursorType, ruler) {
            ruler.off("ruler-rotate-handle-mouse-enter ruler-rotate-handle-mouse-leave ruler-move-handle-mouse-enter ruler-move-handle-mouse-leave ruler-pencil-mouse-enter ruler-pencil-mouse-leave pencil-handle-mouse-enter pencil-handle-mouse-leave ruler-resize-handler-mouse-leave ruler-resize-handler-mouse-enter");
            this._selectCanvasCursorType(cursorType);
        },

        "_onRulerRotateButtonUp": function(eventObject, rulerView) {
            var point = eventObject.point,

                //Path
                rulerPath = rulerView.model.get("_path"),
                rulerMoveButtonPath = rulerPath.children["ruler-move-button"],
                rulerPencilPath = rulerPath.children["pencil-helper"].children["pencil-holder"],
                rulerPencilPositionerPath = rulerPath.children["pencil-helper"].children["pencil-position-button"],
                rulerRotatePath = rulerPath.children["rotate-button"],
                rulerResizePath = rulerPath.children["ruler-resize-button"],

                //hit test
                rulerMoveButtonHitTestResult = rulerMoveButtonPath.hitTest(point),
                rulerPencilHitTestResult = rulerPencilPath.hitTest(point),
                rulerPencilPositionerHitTestResult = typeof rulerPencilPositionerPath !== "undefined" ? rulerPencilPositionerPath.hitTest(point) : null,
                rulerRotateHitTestResult = rulerRotatePath.hitTest(point),
                rulerResizeHitTestResult = typeof rulerResizePath !== "undefined" ? rulerResizePath.hitTest(point) : null,

                curCursorType,
                cursorTypes = ConstructionTool.Views.CursorType;

            if (rulerPencilHitTestResult !== null && typeof rulerPencilHitTestResult !== "undefined" || rulerPencilPositionerHitTestResult !== null && typeof rulerPencilPositionerHitTestResult !== "undefined" ||
                rulerRotateHitTestResult !== null && typeof rulerRotateHitTestResult !== "undefined" || rulerMoveButtonHitTestResult !== null && typeof rulerMoveButtonHitTestResult !== "undefined" ||
                rulerResizeHitTestResult !== null && typeof rulerResizeHitTestResult !== "undefined") {
                curCursorType = cursorTypes.Pointer;
            } else {
                curCursorType = cursorTypes.Default;
            }
            this._selectCanvasCursorType(curCursorType);
            this._bindRulerHandleEvents(rulerView);
        },

        /**
         * Save current tool state at local storage.
         * @method saveToLocalStorage
         */
        "saveToLocalStorage": function() {
            var appState = this.saveState();
            $('#retrieve-state-textarea').val(JSON.stringify({
                "toolState": appState
            }));
            if (typeof window.localStorage !== "undefined" && window.localStorage !== null) {
                localStorage.MathToolsConstructionToolAppState = JSON.stringify({
                    "toolState": appState
                });
            }
        },

        /**
         * Return current tool-state object.
         * @method saveState
         * @return {Object} current state of tool
         */
        "saveState": function() {
            return MathUtilities.Components.Utils.Models.Utils.convertToSerializable(this.getSyncData());
        },

        /**
         * Gets the entire application state as of now.
         * @method getSyncData
         * @public
         */
        "getSyncData": function() {
            // Get Toolbar states.
            // Get shape states
            // return them to the caller.
            var menubarData = this.getMenubarSyncData(),
                propToolbarData = this._propertyToolbar.getSyncData(),
                shapeData = this.getShapeSyncData(),
                rulerData = this.getRulerSyncData(),
                originData = this._getSyncOriginData();

            return {
                "property_toolbar": propToolbarData,
                "shape_data": shapeData,
                "ruler_data": rulerData,
                "menu_bar": menubarData,
                "origin_data": originData
            };
        },

        /**
         * Gets the state of individual shapes.
         * @method getShapeSyncData
         * @public
         */
        "getShapeSyncData": function() {
            var shapeData = [],
                shapeCounter = 0,
                shapesLen = this._arrShapes.length,
                curShape = null;

            for (; shapeCounter < shapesLen; shapeCounter++) {
                curShape = this._arrShapes[shapeCounter];
                shapeData.push(curShape.getSyncData());
            }
            return shapeData;
        },

        /**
         * Gets the state of individual shapes.
         * @method getShapeSyncData
         * @public
         */
        "getRulerSyncData": function() {
            var rulerData = [],
                rulerCounter = 0,
                rulerArray = this._rulerArray,
                rulerLen = rulerArray.length,
                curRuler = null;

            for (; rulerCounter < rulerLen; rulerCounter++) {
                curRuler = rulerArray[rulerCounter];
                rulerData.push(curRuler.getSyncData());
            }
            return rulerData;
        },

        /**
         * Gets the state of menu bar.
         * @method getMenubarSyncData
         * @public
         */
        "getMenubarSyncData": function() {
            var menubarState = this.model.menubarCurrentState;
            return {
                "menuState": MathUtilities.Components.Utils.Models.Utils.getCloneOf(menubarState)
            };
        },

        /**
         * Save current tool state at local storage.
         * @method retrieveFromLocalStorage
         */
        "retrieveFromLocalStorage": function() {
            var localAppState = null,
                data = $('#retrieve-state-textarea').val().trim();
            if (data !== '') {
                localAppState = JSON.parse(data);
                this.retrieveState(localAppState);
            } else {
                if (typeof window.localStorage !== "undefined" && window.localStorage !== null) {
                    localAppState = localStorage.MathToolsConstructionToolAppState;
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

        /**
         * Set current tool-state as state-object passed.
         * @method retrieveState
         * @param {Object} stateObject: current state of tool
         */
        "retrieveState": function(stateObject) {
            if (stateObject === null) {
                return;
            }

            if (stateObject.toolState) {
                this.parseData(stateObject.toolState);
            }
            this.clearUndoRedoStack();
            this.setDocumentClean();
            this.model.set("resetToolState", stateObject.toolState);
        },

        /**
         * Parses the data given.
         * @method parseData
         * @private
         */
        "parseData": function(objToLoad) {
            // parse Toolbar states.
            // parse shape states
            this._parseOriginData(objToLoad.origin_data);
            this.parseShapeData(objToLoad.shape_data);
            this.parseRulerData(objToLoad.ruler_data);
            this.parseMenuData(objToLoad.menu_bar);
            this._propertyToolbar.parseToolbarData(objToLoad.property_toolbar);

            //update scroll-bar manager data
            this._updateVisibleFrame();
            this.updateObservableUniverse();

            this._redraw();
            this.setDocumentClean();
        },

        /**
         * Parses the data given and creates needed shapes.
         * @method parseShapeData
         * @private
         */
        "parseShapeData": function(arrShapesData) {
            var curShapeData = null,
                shapeCounter = 0,
                curShapeObject = null,
                shapesLen = arrShapesData.length,
                prevAddedShapes = this._arrShapes,
                data = null,
                toolTypes = ConstructionTool.Views.ToolType,
                shapeType = null;

            //Clear all previously drawn shapes before restoring from local
            if (prevAddedShapes.length > 0) {
                this._onDelete(prevAddedShapes, true);
            }
            for (; shapeCounter < shapesLen; shapeCounter++) {
                curShapeData = arrShapesData[shapeCounter];
                shapeType = curShapeData.shapeData.shapeType;
                curShapeObject = this.addShapeObject(shapeType);
                if (shapeType === toolTypes.Text) {
                    curShapeData.shapeData.imageData.base64 = "";
                }
                curShapeData.shapeData._rotationRefPoint = null;
                curShapeObject.parseData(curShapeData);
                curShapeObject.setOptions({
                    "id": curShapeData.id
                });
                curShapeObject.draw();
                data = curShapeObject.model.get("_data");

                if (data.shapeType === toolTypes.Background) {
                    this._backgroundView = curShapeObject;
                } else if (curShapeObject.model.get("_data").shapeType === toolTypes.Image) {
                    this._imageView = curShapeObject;
                    // To bind the cursor change on corners.
                    if (curShapeObject.isSelected()) {
                        data.bindCursorEvent = true;
                    }
                    // To update the canvas scroll when image first load.
                    data.updateCanvasScroll = true;
                }
                if (curShapeData.shapeData.isSelected === true) {
                    this._onShapeSelect(curShapeObject);
                }
            }
        },

        /**
         * Parses the data given and creates needed rulers.
         * @method parseRulerData
         * @private
         */
        "parseRulerData": function(arrRulerData) {
            arrRulerData = arrRulerData || this._rulerArray;
            var curRulerData = null,
                rulerCounter = 0,
                curRulerObject = null,
                rulerArrayLen = arrRulerData.length,
                prevAddedShapes = this._rulerArray,
                rulerTypes = ConstructionTool.Views.RulerType;

            //Clear all previously drawn shapes before restoring from local
            if (prevAddedShapes.length > 0) {
                this._deleteRuler(prevAddedShapes);
            }
            for (; rulerCounter < rulerArrayLen; rulerCounter++) {
                curRulerData = arrRulerData[rulerCounter];
                curRulerObject = this.addRulerObject(curRulerData.renderData._rulerType);
                curRulerObject.parseData(curRulerData);
                curRulerObject.setViewOptions(curRulerData);

                switch (curRulerData.renderData._rulerType) {
                    case rulerTypes.StraightLiner:
                        this._isStraightLinerVisible = true;
                        break;
                    case rulerTypes.Compass:
                        this._isCompassVisible = true;
                        break;
                }
            }
            this.drawHelper();
        },

        /**
         * Parses the data given,and state menu bar state.
         * @method parseMenuData
         * @private
         */
        "parseMenuData": function(menubarData) {
            if (typeof menubarData === "undefined" || menubarData === null) {
                return;
            }
            var model = this.model;
            model.menubarCurrentState = MathUtilities.Components.Utils.Models.Utils.getCloneOf(menubarData.menuState);
            this.changeManubarState(model.menubarCurrentState.selectedMenuIndex, model.menubarCurrentState.selectedSubMenuIndices, model.menubarCurrentState.singleMenuIndices);
        },

        /**
         * Calls undo function of UndoRedoManager
         * @method _callUndo
         *
         */
        "_callUndo": function() {
            var managerView = ConstructionTool.Views.accManagerView,
                moduleName = ConstructionTool.Views.ModuleName;

            this.undoRedoManager.undo(moduleName);

            this.enableDisableUndoBtn();
            this.enableDisableRedoBtn();

            //Set focus on redo button if undo stack is empty and vice versa
            if (this.undoRedoManager.isUndoAvailable(moduleName)) {
                managerView.setFocus("undo-highlighter");
            } else {
                this.refocusElem("redo-highlighter", managerView.getAccMessage("redo-highlighter", 1), 10, managerView.getAccMessage("redo-highlighter", 0));
            }
        },

        /**
         * Calls redo function of UndoRedoManager
         * @method _callRedo
         */
        "_callRedo": function() {
            var managerView = ConstructionTool.Views.accManagerView,
                moduleName = ConstructionTool.Views.ModuleName;

            this.undoRedoManager.redo(moduleName);

            this.enableDisableUndoBtn();
            this.enableDisableRedoBtn();

            //Set focus on undo button if redo stack is empty and vice versa
            if (this.undoRedoManager.isRedoAvailable(moduleName)) {
                managerView.setFocus("redo-highlighter");
            } else {
                this.refocusElem("undo-highlighter", managerView.getAccMessage("undo-highlighter", 1), 10, managerView.getAccMessage("undo-highlighter", 0));
            }
        },

        /**
         * Disable undo button focus rect if undo stack is empty or otherwise.
         * @method enableDisableUndoBtn
         */
        "enableDisableUndoBtn": function() {

            var managerView = ConstructionTool.Views.accManagerView,
                moduleName = ConstructionTool.Views.ModuleName;

            if (this.undoRedoManager.isUndoAvailable(moduleName)) {
                managerView.enableTab("undo-highlighter", true);
            } else {
                managerView.enableTab("undo-highlighter", false);
            }
        },

        /**
         * Disable undo button focus rect if redo stack is empty or otherwise.
         * @method enableDisableRedoBtn
         */
        "enableDisableRedoBtn": function() {

            var managerView = ConstructionTool.Views.accManagerView,
                moduleName = ConstructionTool.Views.ModuleName;

            if (this.undoRedoManager.isRedoAvailable(moduleName)) {
                managerView.enableTab("redo-highlighter", true);
            } else {
                managerView.enableTab("redo-highlighter", false);
            }
        },

        /**
         * Saves the action state data of the shape/shapes into undomanager stack available.
         * @method saveToUndoRedoStack
         * @private
         */
        "_saveToUndoRedoStack": function(commandData) {
            var undoActionData = null,
                redoActionData = null;

            undoActionData = new MathUtilities.Components.Undo.Models.Action({
                "name": commandData.actionName,
                "data": MathUtilities.Components.Utils.Models.Utils.convertToSerializable(commandData.oldState),
                "manager": this
            });

            redoActionData = new MathUtilities.Components.Undo.Models.Action({
                "name": commandData.actionName,
                "data": MathUtilities.Components.Utils.Models.Utils.convertToSerializable(commandData.newState),
                "manager": this
            });
            this.setDocumentDirty();
            this.undoRedoManager.registerAction(ConstructionTool.Views.ModuleName, undoActionData, redoActionData);

            this.enableDisableUndoBtn();
            this.enableDisableRedoBtn();
        },

        /**
         * The only entry point for UndoRedo manager to pass the undo/redo operation called.
         * @method execute
         * @params {String} actionName The type of action for which undo/redo has been done.
         * @params {Object} data  The data that denotes a state of the object for which undo/redo will get carried out.
         * @public
         */
        "execute": function(actionName, data) {
            var undoRedoAction = ConstructionTool.Views.UndoRedoActions;
            //clone data
            data = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(data);
            this.setDocumentDirty();
            switch (actionName) {
                case undoRedoAction.RulerTransform:
                    this._handleUndoRedoRulerTransformAction(data);
                    break;
                case undoRedoAction.Transform:
                    this._handleUndoRedoShapeTransformAction(data);
                    break;
                case undoRedoAction.Add:
                case undoRedoAction.Remove:
                    this._handleUndoRedoAddDeleteAction(data);
                    break;
                case undoRedoAction.CanvasPan:
                    this._handleUndoRedoCanvasPanAction(data);
                    break;
                case undoRedoAction.Reset:
                    this.parseData(data.toolState);
                    this.setDocumentDirty();
                    break;
            }
        },

        "_handleUndoRedoRulerTransformAction": function(data) {
            var arrRulerStates = data.rulerData,
                selectedShapes = this._arrSelectedShapes,
                SelectedShapeLen = selectedShapes.length,
                rulersLen = arrRulerStates.length,
                curRuler,
                rulerCounter = 0,
                shapeCounter = 0,
                curState = null;

            for (; rulerCounter < rulersLen; rulerCounter++) {
                curState = arrRulerStates[rulerCounter];
                curRuler = this._getRulerById(curState.id);

                if (curRuler !== null) {
                    if (curState.bRemove === true) {
                        this.removeRuler([curRuler]);
                        if (curRuler.model.get("_renderData")._rulerType === ConstructionTool.Views.RulerType.StraightLiner) {
                            this._isStraightLinerVisible = false;
                        } else if (curRuler.model.get("_renderData")._rulerType === ConstructionTool.Views.RulerType.Compass) {
                            this._isCompassVisible = false;
                        }
                    } else {
                        curRuler.model.parseData(curState);
                        curRuler.drawHelper();
                        if (curRuler.model.get("_renderData")._rulerType === ConstructionTool.Views.RulerType.StraightLiner) {
                            this._isStraightLinerVisible = true;
                        } else if (curRuler.model.get("_renderData")._rulerType === ConstructionTool.Views.RulerType.Compass) {
                            this._isCompassVisible = true;
                        }
                    }
                } else {
                    curRuler = this.addRulerObject(curState.renderData._rulerType);
                    curRuler.model.parseData(curState);
                    curRuler.setViewOptions(curState);
                    curRuler.drawHelper();
                    if (curRuler.model.get("_renderData")._rulerType === ConstructionTool.Views.RulerType.StraightLiner) {
                        this._isStraightLinerVisible = true;
                    } else if (curRuler.model.get("_renderData")._rulerType === ConstructionTool.Views.RulerType.Compass) {
                        this._isCompassVisible = true;
                    }
                    //Remove Selected states of Shapes
                    for (; shapeCounter < SelectedShapeLen; shapeCounter++) {
                        selectedShapes[shapeCounter].deselect();
                    }
                }
            }
            if (typeof data.menuData !== "undefined") {
                this.changeManubarState(data.menuData.selectedMenuIndex, data.menuData.selectedSubMenuIndices, this.model.defaultMenuBarState.singleMenuIndices);
            }
            this._bringRulersToFront();
            this.changeRulerMenuText();
        },

        "_handleUndoRedoShapeTransformAction": function(data) {
            var arrShapeStates = data.shapeData,
                iShapesLen = arrShapeStates.length,
                curShape = null,
                shapeCounter = 0,
                curState = null;

            if (iShapesLen !== 0) {
                this._clearShapeSelection();
            }
            for (; shapeCounter < iShapesLen; shapeCounter++) {
                curState = arrShapeStates[shapeCounter];
                curShape = this._getShapeById(curState.id);
                if (curShape !== null) {

                    curShape.parseData(curState);
                    curShape.setViewOptions(curState);
                    curShape.draw();
                    curShape.updateAccBoundingBox();
                }
            }
            this.updateObservableUniverse();
        },

        "_handleUndoRedoAddDeleteAction": function(data) {
            var arrShapeStates = data.shapeData,
                propertyBarState = data.propertyData,
                shapeStatesLen = arrShapeStates.length,
                curShape = null,
                shapeCounter = 0,
                selectedShapeCounter = 0,
                curState = null,
                arrSelectedShapes = null,
                selectedShapesLength = null,
                shapes = null,
                shape = null,
                selectedShapesCnt = 0,
                managerView = ConstructionTool.Views.accManagerView,
                selectedShapeLength = this._arrSelectedShapes.length,
                toolTypes = ConstructionTool.Views.ToolType;

            for (; shapeCounter < shapeStatesLen; shapeCounter++) {
                if (typeof arrShapeStates[shapeCounter].shapeData !== "undefined" && arrShapeStates[shapeCounter].shapeData.isSelected === true) {
                    selectedShapesCnt++;
                }
            }
            this._clearShapeSelection();

            shapes = this._arrShapes;
            for (shapeCounter = 0; shapeCounter < shapeStatesLen; shapeCounter++) {
                curState = arrShapeStates[shapeCounter];
                curShape = this._getShapeById(curState.id);
                if (curShape !== null) {
                    if (curState.bRemove === true) {
                        curShape.deselect();
                        if (curShape.model.get("_data").shapeType === toolTypes.Pencil) {
                            this._updateCanvasCursor(toolTypes.Pencil);
                        } else if (curShape.model.get("_data").shapeType === toolTypes.Background) {
                            //Update property tool bar
                            this._propertyToolbar.setBackgroundColor(propertyBarState.backgroundColor);
                        }
                        this.remove([curShape]);
                        if (curShape.model.get("_data").shapeType === toolTypes.StraightLiner || curShape.model.get("_data").shapeType === toolTypes.Compass) {
                            this._handleUndoRedoRulerTransformAction(data);
                        } else if (curShape.model.get("_data").shapeType === toolTypes.Image) {
                            this._imageView = null;
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
                        if (curShape.model.get("_data").shapeType === toolTypes.Background) {
                            curShape.model.setOptions({
                                "backgroundData": curState.shapeData.backgroundData
                            });
                            //Update property tool bar
                            this._propertyToolbar.setBackgroundColor(propertyBarState.backgroundColor);
                            curShape.draw();
                        } else if (curShape.model.get("_data").shapeType === toolTypes.Text) {
                            curShape.parseData(curState);
                            curShape.draw();
                        } else if (curShape.model.get("_data").shapeType === toolTypes.Image) {
                            if (this._imageView) {
                                //to remove intermediate path
                                curShape.remove(false);
                            }
                            curShape.parseData(curState);
                            curShape.draw();
                            // To update the canvas scroll when image first load.
                            curShape.model.get("_data").updateCanvasScroll = true;

                        }
                    }
                } else {
                    if (curState.shapeData.shapeType === toolTypes.Image) {
                        if (this._imageView) {
                            this.remove([this._imageView], false);
                        }
                        this._imageView = curShape = this.addShapeObject(toolTypes.Image);
                        this._imageView.renderImage({
                            "imageSource": curState.shapeData.imageData,
                            "scaleFactor": MathUtilities.Components.Utils.Models.Utils.getCloneOf(curState.scaleFactor),
                            "cancelLoad": true
                        });
                        this._setImageZIndex(curShape);
                    } else {
                        curShape = this.addShapeObject(curState.shapeData.shapeType);
                        if (curShape.model.get("_data").shapeType === toolTypes.Background) {
                            //Update property tool bar
                            this._propertyToolbar.setBackgroundColor(propertyBarState.backgroundColor);
                        } else if (curShape.model.get("_data").shapeType === toolTypes.StraightLiner || curShape.model.get("_data").shapeType === toolTypes.Compass) {
                            this._handleUndoRedoRulerTransformAction(data);
                        }
                    }
                    curShape.parseData(curState);
                    if (selectedShapesCnt !== 0) {
                        if (selectedShapesCnt > 1) {
                            curShape.setOptions({
                                "id": curState.id,
                                "allowRotate": false,
                                "allowResize": false
                            });
                        } else {
                            curShape.setOptions({
                                "id": curState.id
                            });
                        }
                    } else if (shapeStatesLen > 1) {
                        curShape.setOptions({
                            "id": curState.id,
                            "allowRotate": false,
                            "allowResize": false
                        });
                    } else {
                        if (curShape.model.get("_data").shapeType === toolTypes.Text) {
                            curShape.setOptions({
                                "id": curState.id,
                                "allowSelectionBound": true,
                                "allowResize": false,
                                "allowRotate": true
                            });
                        } else if (curShape.model.get("_data").shapeType !== toolTypes.Background) {
                            curShape.setOptions({
                                "id": curState.id,
                                "allowRotate": true,
                                "allowResize": true
                            });
                        } else {
                            curShape.setOptions({
                                "id": curState.id
                            });
                            this._sendToBack(curShape);
                        }
                    }
                    // To update the canvas scroll when image first load.
                    curShape.model.get("_data").updateCanvasScroll = true;

                    if (curShape.isSelected()) {
                        curShape.model.get("_data").bindCursorEvent = true;
                    }
                    if (curState.shapeData.shapeType === toolTypes.Image) {
                        curShape.draw(selectedShapesCnt, curState, curShape);
                    } else {
                        curShape.draw();

                        if (selectedShapesCnt !== 0) {
                            if (curState.shapeData.isSelected === true) {
                                curShape.select();
                            }
                        } else if (shapeStatesLen > 0) {
                            curShape.select();
                        }
                    }
                }
            }
            this._updateCanvasCursor(ConstructionTool.Views.CurToolType);
            if (selectedShapesCnt === 0) {
                if (ConstructionTool.Views.DrawingTool === toolTypes.Pencil) {
                    this._commonPropertiesToolbar.show(ConstructionTool.Views.MenuItems[ConstructionTool.Views.MenuBarType.Marker], ConstructionTool.Views.templates);
                    managerView.loadScreen("property-toolbar");

                    //if one shape is in selected state then change cursor to arrow
                    if (selectedShapeLength === 1) {
                        this._updateCanvasCursor(toolTypes.None);
                    }
                } else {
                    if (selectedShapesCnt !== 0) {
                        this._commonPropertiesToolbar.show(ConstructionTool.Views.MenuItems[ConstructionTool.Views.MenuBarType.Select], ConstructionTool.Views.templates);
                        managerView.loadScreen("property-toolbar");
                    }
                }
            } else {
                this.triggerMenuTool(toolTypes.Select);
            }
            this._bringRulersToFront();
            this.updateObservableUniverse();
        },

        "_handleUndoRedoCanvasPanAction": function(data) {
            this._panCanvas(data);
        },

        "_getPreparedOldStateCommand": function(arrShapes) {
            var curShape = null,
                shapeCounter = 0,
                shapesLen = 0,
                arrOldStateCommand = [];

            arrShapes = arrShapes || this._arrSelectedShapes;
            shapesLen = arrShapes.length;

            for (; shapeCounter < shapesLen; shapeCounter++) {
                curShape = arrShapes[shapeCounter];
                arrOldStateCommand.push(curShape._getPreviousState());
            }

            return arrOldStateCommand;
        },

        "_getPreparedNewStateCommand": function(arrShapes) {
            var curShape = null,
                shapeCounter = 0,
                shapesLen = 0,
                arrNewStateCommand = [];

            arrShapes = arrShapes || this._arrSelectedShapes;
            shapesLen = arrShapes.length;

            for (; shapeCounter < shapesLen; shapeCounter++) {
                curShape = arrShapes[shapeCounter];
                arrNewStateCommand.push(curShape._getCurrentState());
            }

            return arrNewStateCommand;
        },

        "_getRulerOldStateCommand": function(arrRulers) {
            var curRuler = null,
                rulerCounter = 0,
                rulersLen = 0,
                arrOldStateCommand = [];

            arrRulers = arrRulers || this._rulerArray;
            rulersLen = arrRulers.length;

            for (; rulerCounter < rulersLen; rulerCounter++) {
                curRuler = arrRulers[rulerCounter];
                arrOldStateCommand.push(curRuler._getPreviousState());
            }
            return arrOldStateCommand;
        },

        "_getRulerNewStateCommand": function(arrRulers) {
            var curRuler = null,
                rulerCounter = 0,
                rulersLen = 0,
                arrNewStateCommand = [];

            arrRulers = arrRulers || this._rulerArray;
            rulersLen = arrRulers.length;

            for (; rulerCounter < rulersLen; rulerCounter++) {
                curRuler = arrRulers[rulerCounter];
                arrNewStateCommand.push(curRuler._getCurrentState());
            }

            return arrNewStateCommand;
        },

        "_getPropertyOldStateCommand": function() {
            return this._propertyToolbar._getPreviousState();
        },

        "_getPropertyNewStateCommand": function() {
            return this._propertyToolbar._getCurrentState();
        },

        "_getPreparedUndoRedoStateCommand": function(data) {
            var commandState = {},
                arrSelectedShapes = null,
                arrRulers = null;

            if (typeof data !== "undefined") {
                arrSelectedShapes = data.shape;
                arrRulers = data.ruler;
            }

            commandState.oldState = {
                "shapeData": this._getPreparedOldStateCommand(arrSelectedShapes),
                "propertyData": this._getPropertyOldStateCommand(),
                "rulerData": this._getRulerOldStateCommand(arrRulers)
            };
            commandState.newState = {
                "shapeData": this._getPreparedNewStateCommand(arrSelectedShapes),
                "propertyData": this._getPropertyNewStateCommand(),
                "rulerData": this._getRulerNewStateCommand(arrRulers)
            };
            commandState.actionName = this._getCurrentActionName();
            return commandState;
        },

        "_getCurrentActionName": function() {
            return this._strActionName;
        },

        "_setCurrentActionName": function(strActionName) {
            this._strActionName = strActionName;
        },

        "_onTextDrawingComplete": function(args) {
            var noOfShapes,
                shapeCounter = 0,
                selectedShapes = this._arrSelectedShapes,
                shapesLength = selectedShapes.length,
                canvasAccView = ConstructionTool.Views.canvasAccView,
                toolTypes = ConstructionTool.Views.ToolType;

            this._enableTabs(true);
            this.triggerMenuTool(toolTypes.Select);
            if (this._addingObj === null) {
                //If shape is double clicked
                // Set the current action name to be transform. Used in undo redo while saving states of shape.
                this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.Add);
                // Save the data into the stack, as we have all data ready to extract.
                this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand({
                    "shape": [args.textView]
                }));
                this._redraw();
            } else {
                if (this._addingObj._intermediatePath) {
                    this._addingObj.select();
                    //update current state value,as we are selecting object after data is store.
                    this._addingObj._updateCurrentState({
                        "isSelected": true
                    });
                    // Set the current action name to be transform. Used in undo redo while saving states of shape.
                    this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.Add);
                    // Save the data into the stack, as we have all data ready to extract.
                    this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand([this._addingObj]));
                } else {
                    this.remove(this._addingObj, true);
                    noOfShapes = this._arrShapes.length;
                    for (shapeCounter = 0; shapeCounter < noOfShapes; shapeCounter++) {
                        if (!this._arrShapes[shapeCounter]._intermediatePath && this._arrShapes[shapeCounter].model.get("_data").shapeType === toolTypes.Text) {
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
                args.textView.updateAccBoundingBox();
                canvasAccView.setFocus("shape-" + args.textView.model.get("_data").accId, 5);
            }
            this._redraw();
            //set focus to tool-holder to make it active element after pop-up is closed.
            this.$(".math-utilities-components-tool-holder").focus();
            this.updateObservableUniverse();
            this._accOnShapeSelect();
        },

        /**
         * Triggers _onToolDoubleClick function on double tap (Handled for touch devices).
         * @method _onCanvasTouchStart
         * @private
         */
        "_onCanvasTouchStart": function(event) {
            var threshold = ConstructionTool.Views.DOUBLE_TAP_THRESHOLD,
                resetTapCounter = _.bind(function() {
                    this._touchDoubleTapCounter = null;
                }, this);
            if (event.touches.length !== 1) {
                resetTapCounter();
            } else if (this._touchDoubleTapCounter === null) {
                this._touchDoubleTapCounter = new Date().getTime();
            } else if (new Date().getTime() - this._touchDoubleTapCounter < threshold) {
                resetTapCounter();
                this._onToolDoubleClick(event);
            }
            clearTimeout($.data(this, "doubleTapTimer"));
            //to  reset tap counter after threshold time
            $.data(this, "doubleTapTimer", setTimeout(resetTapCounter, threshold));
        },

        "_onToolDoubleClick": function(event) {
            if (ConstructionTool.Views.CurToolType !== ConstructionTool.Views.ToolType.Select) {
                return;
            }
            var canvasPosition = this.$("#construction-tool-canvas").offset(),
                canvasX = event.pageX - canvasPosition.left,
                canvasY = event.pageY - canvasPosition.top,
                canvasPoint = null,
                sketchCounter,
                canvasChildren = ConstructionTool.Views.PaperScope.project.activeLayer.children,
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

            canvasPoint = new ConstructionTool.Views.PaperScope.Point(canvasX, canvasY);
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
            if (sketchUnderPoint !== null && sketchUnderPoint.model.get("_data").shapeType === ConstructionTool.Views.ToolType.Text) {
                for (selectedShapesCnt = selectedShapesLen - 1; selectedShapesCnt >= 0; selectedShapesCnt--) {
                    selectedShapes[selectedShapesCnt].deselect();
                }
                sketchUnderPoint.trigger("text-double-click");
                this._enableTabs(false);
            }
        },

        "_openAddFileDialogBox": function(imageData) {
            if (typeof imageData === "undefined") {
                var $file = this.$("#img-file"),
                    fileElemCopy = $file.clone();

                fileElemCopy.attr("id", "file-input");
                this.$el.append(fileElemCopy);
                fileElemCopy.hide();
                if (!this.getImageFn) {
                    this.getImageFn = _.bind(this._getImage, this);
                }
                fileElemCopy.off("change", this.getImageFn).on("change", this.getImageFn);
                if (fileElemCopy) {
                    fileElemCopy.trigger("click");
                }
            } else {
                this._onCurToolChange({
                    "isUserTrigger": true
                }, 4, 0);
                this._renderImage(imageData.img);
            }
            this.triggerMenuTool(ConstructionTool.Views.ToolType.Select);
        },

        "_getImage": function(event) {
            if (typeof window.FileReader === "undefined") {
                return;
            }
            var files = event.target.files,
                reader,
                imageData,
                imageType = /image\/(jpeg|jpg|png|bmp)/i; //to check supported image format

            reader = new window.FileReader();
            reader.onload = _.bind(function(frEvent) {
                imageData = frEvent.target.result;

                this._renderImage(imageData);
            }, this);
            if (typeof files[0] !== "undefined" && files[0] !== null) {
                //the user has clicked on open or double clicks on file
                if (files[0].type.match(imageType) !== null) {
                    reader.readAsDataURL(files[0]);
                } else {
                    this._showCustomPopup("img-format");
                }
            }
        },

        //porting discovery change
        "openAddImageModal": function(event) {
            var imgPreload,
                zeusSiteUpload = false; // For deciding whether to open the imageReader popup or not

            // Do not dig into this code...
            if (zeusSiteUpload) {
                this._openAddFileDialogBox();
            } else if (event.shiftKey && event.altKey) {
                this._menuBarView.getImageAssetView().open();
            } else {
                $.de.browse({
                    "actionType": 'choose',
                    /* Searchable and Non-Searchable Images asset type guids */
                    "assetTypeGuid": "3123B3AD-3C2D-49CF-92CE-9927C3C09E64,1AA883F4-B310-4A5A-9D35-D07DC8CADF6C,7859E39F-7300-4A63-86C9-8446E5B32037,89CB88BC-1B04-4DE2-8986-E82F65DF2755",
                    "onComplete": _.bind(function(evt) {
                        if (evt) {
                            $.ajax({
                                "url": "/api:mediafiles/list/",
                                "data": {
                                    "assetGuidList": evt.content.guid,
                                    "typeidlist": "37,38"
                                }
                            }).always(_.bind(function(resp) {
                                imgPreload = new Image();
                                imgPreload.onload = _.bind(function(e) {
                                    this._renderImage(imgPreload.src);
                                    this.triggerMenuTool(ConstructionTool.Views.ToolType.Select);
                                }, this);
                                imgPreload.src = resp.data[0].mediaFileUrl;
                            }, this));
                        }
                    }, this)
                });
            }
        },

        "_renderImage": function(imageData) {
            this.onToolSelect();
            var prevCId, oldState = {},
                imageView;
            if (this._imageView !== null) {
                prevCId = this._imageView.getId();
                oldState = this._imageView.model.getCloneData();
                this.remove([this._imageView], false);
            } else {
                oldState.bRemove = true;
            }

            imageView = this._imageView = this.addShapeObject(ConstructionTool.Views.ToolType.Image);
            if (prevCId !== null) {
                this._imageView.setViewOptions({
                    "id": prevCId
                });
            }
            oldState.id = imageView.getId();
            imageView._savePreviousState(oldState);

            this._imageView.model.setOptions({
                "isLoaded": true,
                "imageData": imageData
            });
            // Undo redo state saves
            this._imageView._registerUndoRedo = true;
            this._imageView.draw();
        },

        "_onImageDrawingComplete": function() {
            this._setImageZIndex(this._imageView);
            var accIdNum = this._imageView.model.get("_data").accId,
                canvasAccView = ConstructionTool.Views.canvasAccView;
            canvasAccView.reFocusElem("shape-" + accIdNum);

            // Set the current action name to be transform. Used in undo redo while saving states of shape.
            this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.Add);
            // Save the data into the stack, as we have all data ready to extract.
            this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand({
                "shape": [this._imageView]
            }));

            this._accOnShapeSelect();
        },

        "_setImageZIndex": function(imageObject) {
            if (typeof imageObject === "undefined") {
                return;
            }
            var shapes = this._arrShapes;
            //if back-ground is present then place image will be on second layer else on bottom layer
            if (shapes.length !== 0 && shapes[0].model.get("_data").shapeType !== ConstructionTool.Views.ToolType.Background) {
                this._changeZIndex(imageObject, 0);
            } else {
                this._changeZIndex(imageObject, 1);
            }
        },

        "propertyToolBarHide": function() {
            this._clearShapeSelection();
        },
        /**
         * Clear undo-redo stack for construction-tool module
         * @method clearUndoRedoStack
         */
        "clearUndoRedoStack": function() {
            this.undoRedoManager.clearModule(ConstructionTool.Views.ModuleName);
        },

        /**
         * Return current-origin canvas co-ordinate,depending upon graph co-ordinate at default-origin(reference point)
         * also return delta value of prev & new origin
         * @method _getCurrentOriginCo
         * @return {object}, point and delta value
         * @private
         */
        "_getCurrentOriginCo": function() {
            var transformModel = ConstructionTool.Models.Transform,
                defaultOrigin = transformModel.DEFAULT_ORIGIN,
                currentOrigin = transformModel.CURRENT_ORIGIN,
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

        /**
         * Return origin data object,for saving origin state.
         * @method _getSyncOriginData
         * @return originData {object}
         * @private
         */
        "_getSyncOriginData": function() {
            var transformModel = ConstructionTool.Models.Transform,
                originData = {
                    "currentOrigin": {
                        "canvasCo": MathUtilities.Components.Utils.Models.Utils.getCloneOf(transformModel.CURRENT_ORIGIN.canvasCo),
                        "graphCo": MathUtilities.Components.Utils.Models.Utils.getCloneOf(transformModel.CURRENT_ORIGIN.graphCo)
                    },
                    "defaultOrigin": {
                        "canvasCo": MathUtilities.Components.Utils.Models.Utils.getCloneOf(transformModel.DEFAULT_ORIGIN.canvasCo),
                        "graphCo": MathUtilities.Components.Utils.Models.Utils.getCloneOf(transformModel.DEFAULT_ORIGIN.graphCo)
                    }
                };
            return originData;
        },

        /**
         * Set origin data value for retrieving state
         * @method _parseOriginData
         * @param originData {object}
         * @private
         */
        "_parseOriginData": function(parseData) {
            if (!parseData) {
                return;
            }
            var transformModel = ConstructionTool.Models.Transform,
                newOrigin = {};

            transformModel.DEFAULT_ORIGIN.graphCo = parseData.defaultOrigin.graphCo;
            transformModel.CURRENT_ORIGIN.canvasCo = parseData.currentOrigin.canvasCo;

            newOrigin = this._getCurrentOriginCo();
            transformModel.CURRENT_ORIGIN.canvasCo = new ConstructionTool.Models.Point(newOrigin.point);
        },

        /**
         * Return canvas end points in term of graph co-ordinate
         * this method is used by scrollbar
         * @method getLimits
         */
        "getLimits": function() {
            return MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.get("scrollbarData").visibleFrame);
        },

        /**
         * Return minimum distance between two adjacent point in term of canvas co-ordinate
         * this method is used by scrollbar
         * @method _getCanvasDistance
         * @param pointCoordinates {Array}
         * @return {Array} x and y minimum distance
         */
        "_getCanvasDistance": function(pointCoordinates) {
            var displacementFactor = ConstructionTool.Models.Sketchpad.SCROLL_DISPLACEMENT_FACTOR,
                xDisplacement = pointCoordinates[0] === 0 ? pointCoordinates[0] : displacementFactor * pointCoordinates[0] / Math.abs(pointCoordinates[0]),
                yDisplacement = pointCoordinates[1] === 0 ? pointCoordinates[1] : -displacementFactor * pointCoordinates[1] / Math.abs(pointCoordinates[1]);
            return [xDisplacement, yDisplacement];
        },

        /**
         * Pan canvas by given delta value
         * this method is used by scrollbar
         * @method _panBy
         * @param {number} x-displacement value
         * @param {number} y-displacement value
         * @private
         */
        "_panBy": function(deltaX, deltaY) {
            this._panCanvas({
                "x": deltaX,
                "y": deltaY
            });
        },

        /**
         * Update visible frame limits of scrollbar manager
         * @method _updateVisibleFrame
         * @private
         */
        "_updateVisibleFrame": function() {
            this._updateLimits();
            if (this._scrollBarManager === null) {
                return;
            }
            var visibleFrame = this.model.get("scrollbarData").visibleFrame;
            this._scrollBarManager.updateVisibleFrame(visibleFrame);
            this._redraw();
        },

        /**
         * Update graph co-ordinates value at canvas end depending upon current origin position
         * @method _updateLimits
         * @private
         */
        "_updateLimits": function() {
            var transforModel = ConstructionTool.Models.Transform,
                currentOrigin = ConstructionTool.Models.Transform.CURRENT_ORIGIN.canvasCo,
                canvasSize = ConstructionTool.Views.CanvasSize,
                visibleFrame = this.model.get("scrollbarData").visibleFrame;

            visibleFrame.xmin = transforModel.toGraphCo(new ConstructionTool.Models.Point(0, currentOrigin.y)).x;
            visibleFrame.ymax = transforModel.toGraphCo(new ConstructionTool.Models.Point(currentOrigin.x, 0)).y;

            visibleFrame.xmax = transforModel.toGraphCo(new ConstructionTool.Models.Point(canvasSize.width, currentOrigin.y)).x;
            visibleFrame.ymin = transforModel.toGraphCo(new ConstructionTool.Models.Point(currentOrigin.x, canvasSize.height)).y;
        },

        "updateObservableUniverse": function() {
            if (this._scrollBarManager === null) {
                return;
            }
            var scrollbarData = this.model.get("scrollbarData"),
                visibleDomain = MathUtilities.Components.Utils.Models.Utils.getCloneOf(scrollbarData.defaultUniverse),
                arrShapes = this._arrShapes,
                shape,

                arrRuler = this._rulerArray,
                ruler,
                point,
                endPoints,
                bufferSpace = ConstructionTool.Models.Sketchpad.SCROLL_BUFFER_SPACE,

                shapeTypes = ConstructionTool.Views.ToolType,

                path = null,
                curShape = null,


                flexDomain = function(x, y) {
                    if (x < visibleDomain.xmin) {
                        visibleDomain.xmin = x;
                    } else if (x + bufferSpace > visibleDomain.xmax) {
                        visibleDomain.xmax = x + bufferSpace;
                    }

                    if (y + bufferSpace < visibleDomain.ymin) {
                        visibleDomain.ymin = y + bufferSpace;
                    } else if (y > visibleDomain.ymax) {
                        visibleDomain.ymax = y;
                    }
                },

                checkBoundaries = function(pathBounds) {
                    if (!pathBounds) {
                        return;
                    }
                    var arrEndPoint = [],
                        curPoint,
                        transformModel = ConstructionTool.Models.Transform;

                    arrEndPoint.push(transformModel.toGraphCo(new ConstructionTool.Models.Point(pathBounds.x, pathBounds.y)),
                        transformModel.toGraphCo(new ConstructionTool.Models.Point(pathBounds.x, pathBounds.y + pathBounds.height)),
                        transformModel.toGraphCo(new ConstructionTool.Models.Point(pathBounds.x + pathBounds.width, pathBounds.y)),
                        transformModel.toGraphCo(new ConstructionTool.Models.Point(pathBounds.x + pathBounds.width, pathBounds.y + pathBounds.height))
                    );

                    for (curPoint in arrEndPoint) {
                        flexDomain(arrEndPoint[curPoint].x, arrEndPoint[curPoint].y);
                    }
                };

            for (shape in arrShapes) {
                curShape = arrShapes[shape];
                if (curShape.model.get("_data").shapeType !== shapeTypes.Background) {
                    path = curShape._intermediatePath;
                    if (typeof path !== "undefined" && path !== null) {
                        checkBoundaries(path.bounds);
                    }
                }
            }

            for (ruler in arrRuler) {
                endPoints = arrRuler[ruler].model.getEndPoints();
                for (point in endPoints) {
                    flexDomain(endPoints[point].x, endPoints[point].y);
                }
            }

            this._scrollBarManager.updateObservableUniverse(visibleDomain);

            this._redraw();
        },

        "updateScrollFrameSize": function() {
            if (this._scrollBarManager === null) {
                return;
            }
            var frameSize = this.model.get("scrollbarData").visibleFrame,
                screenSize;

            screenSize = new ConstructionTool.Views.PaperScope.Rectangle(0, 0, ConstructionTool.Views.CanvasSize.width, ConstructionTool.Views.CanvasSize.height);

            this._projectLayers.scrollLayer.activate();
            this._scrollBarManager.setFrameSize(ConstructionTool.Views.PaperScope, frameSize, screenSize, this._$constructionToolCanvas);

            this._projectLayers.shapeLayer.activate();
        },

        "triggerCanvasClick": function() {
            //Trigger Mousedown n Mouseup on canvas when tool is changed with accessibility
            var canvasSize = ConstructionTool.Views.CanvasSize,
                canvasHeight = canvasSize.height,
                canvasWidth = canvasSize.width,
                mouseEvent = {
                    "point": new ConstructionTool.Views.PaperScope.Point(canvasWidth / 4, canvasHeight / 4),
                    "event": {
                        "which": 1,
                        "triggered": true
                    }
                };

            ConstructionTool.Views.PaperScope.tool.fire("mousedown", mouseEvent);
            ConstructionTool.Views.PaperScope.tool.fire("mouseup", mouseEvent);
            this._redraw();
        },

        "onMeuButtonFocusIn": function(event) {
            var $curTarget = $(event.currentTarget);

            if ($curTarget.is("#straight-liner-tool-highlighter")) {
                this.disableShapeTab();
            }
        },

        "createAccDiv": function(curShape) {
            var shapes = ConstructionTool.Views.ToolType,
                obj = null,
                curShapeType = curShape.model.get("_data").shapeType,
                canvasAccManager = ConstructionTool.Views.canvasAccView,
                accManager = ConstructionTool.Views.accManagerView,
                accId = null,
                accIdNum = null,
                shapeAcc = null;

            if (curShapeType === shapes.Text || curShapeType === shapes.Image) {
                obj = {
                    "isShape": true,
                    "isRotate": true
                };
                if (curShapeType === shapes.Image) {
                    obj.isResize = true;
                }
                accId = canvasAccManager.createAccDiv(obj);
                accIdNum = Number(accId.substring(accId.lastIndexOf("-") + 1));
                curShape.model.setOptions({
                    "accId": accIdNum
                });
                this._accdivObjectMapping[accId] = curShape;

                shapeAcc = this.getShapeText(curShape);
                accManager.setAccMessage("shape-" + accIdNum, shapeAcc.shapeText);
                accManager.setAccMessage("shape-resize-" + accIdNum, shapeAcc.resizeText);
                accManager.setAccMessage("shape-rotate-" + accIdNum, shapeAcc.rotateText);
                accManager.enableTab("shape-resize-" + accIdNum, false);
                accManager.enableTab("shape-rotate-" + accIdNum, false);
            }
        },

        "onCanvasKeyUp": function(event) {
            var $curTarget = $(event.currentTarget),
                keyCode = event.keyCode,
                sketchpad = ConstructionTool.Models.Sketchpad;

            if ($curTarget.hasClass("ruler-pencil")) {
                if (keyCode === sketchpad.LEFT_ARROW_KEY || keyCode === sketchpad.RIGHT_ARROW_KEY) {
                    if (this._addingObj) {
                        this._addingObj.processTouchEnd();

                        this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.Add);
                        this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand({
                            "shape": [this._addingObj]
                        }));
                        this._addingObj = null;
                    }
                }
            }

            this.updateObservableUniverse();
        },

        "onCanvasKeyDown": function(event) {
            var $curTarget = $(event.currentTarget),
                curTool = ConstructionTool.Views.CurToolType;

            if ($curTarget.hasClass("shape-acc")) {
                this.onShapeKeyDown(event);
            } else if ($curTarget.hasClass("rotate")) {
                this.rotateRuler(event);
            } else if ($curTarget.hasClass("resize")) {
                this.resizeRuler(event);
            } else if ($curTarget.hasClass("ruler-pencil")) {
                this.pencilMove(event);
            } else if ($curTarget.hasClass("ruler-pencil-positioner")) {
                this.pencilPositionerMove(event);
            } else if ($curTarget.hasClass("ruler-positioner-handler")) {
                this.rulerMove(event);
            } else if ($curTarget.hasClass("canvas-temp") && curTool === ConstructionTool.Views.ToolType.CanvasPan) {
                this.canvasPan(event);
            }

            this._redraw();
        },

        "rotateRuler": function(event) {
            var keyCode = event.keyCode,
                sketchpad = ConstructionTool.Models.Sketchpad,
                validKeys = [sketchpad.LEFT_ARROW_KEY, sketchpad.RIGHT_ARROW_KEY],
                accMapping = this._accdivObjectMapping,
                $curTarget = $(event.currentTarget),
                accDivId = $curTarget.parents(".canvas-acc-container").attr("id"),
                curRuler = accMapping[accDivId],
                angle = 15,
                canvasAccView = ConstructionTool.Views.canvasAccView,
                newState = null,
                oldState = null;

            if (validKeys.indexOf(keyCode) === -1) {
                return;
            }
            //to prevent page scroll on arrow keys down
            event.preventDefault();

            oldState = curRuler.model.getSyncData();
            oldState.id = curRuler.getId();

            curRuler._savePreviousState(oldState);

            if (keyCode === sketchpad.LEFT_ARROW_KEY) {
                curRuler.rotate(-angle, true);
            } else {
                curRuler.rotate(angle, true);
            }
            curRuler.updateAccBoundingBox();

            newState = curRuler.model.getSyncData();
            newState.id = curRuler.getId();

            curRuler._saveCurrentState(newState);
            canvasAccView.reFocusElem($curTarget.attr("id"));

            this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.RulerTransform);
            this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());
        },

        "pencilPositionerMove": function(event) {
            var keyCode = event.keyCode,
                sketchpad = ConstructionTool.Models.Sketchpad,
                validKeys = [sketchpad.LEFT_ARROW_KEY, sketchpad.RIGHT_ARROW_KEY],
                accMapping = this._accdivObjectMapping,
                $curTarget = $(event.currentTarget),
                accDivId = $curTarget.parents(".canvas-acc-container").attr("id"),
                curRuler = accMapping[accDivId],
                canvasAccView = ConstructionTool.Views.canvasAccView,
                pencilPosition = curRuler.model.getPencilPositionerPosition(),
                topLeft = curRuler.model.getRulerTopLeft(),
                point = {
                    "x": pencilPosition.x,
                    "y": topLeft.y
                },
                newState = null,
                oldState = null;


            if (validKeys.indexOf(keyCode) === -1) {
                return;
            }


            //to prevent page scroll on arrow keys down
            event.preventDefault();

            oldState = curRuler.model.getSyncData();
            oldState.id = curRuler.getId();


            curRuler._savePreviousState(oldState);

            if (curRuler.model.get("_renderData")._rulerType === ConstructionTool.Views.RulerType.Compass) {
                curRuler._intermediatePointOnArc = curRuler.model._getRotatedPointAboutRuler(point);
            } else {
                curRuler._intermediatePointOnLine = curRuler.model._getRotatedPointAboutRuler(point);
            }

            if (keyCode === sketchpad.LEFT_ARROW_KEY) {
                point.x -= 10;
                point.y -= 10;

            } else {
                point.x += 10;
                point.y += 10;
            }

            curRuler._onPencilMove({
                "point": curRuler.model._getRotatedPointAboutRuler(point)
            });
            curRuler.updateAccBoundingBox();
            newState = curRuler.model.getSyncData();
            newState.id = curRuler.getId();

            curRuler._saveCurrentState(newState);
            canvasAccView.reFocusElem($curTarget.attr("id"));

            this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.RulerTransform);
            this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());
        },

        "pencilMove": function(event) {
            var keyCode = event.keyCode,
                sketchpad = ConstructionTool.Models.Sketchpad,
                validKeys = [sketchpad.LEFT_ARROW_KEY, sketchpad.RIGHT_ARROW_KEY],
                accMapping = this._accdivObjectMapping,
                $curTarget = $(event.currentTarget),
                accDivId = $curTarget.parents(".canvas-acc-container").attr("id"),
                curRuler = accMapping[accDivId],
                canvasAccView = ConstructionTool.Views.canvasAccView,
                pencilPosition = curRuler.model.getPencilPositionerPosition(),
                topLeft = curRuler.model.getRulerTopLeft(),
                point = {
                    "x": pencilPosition.x,
                    "y": topLeft.y
                },
                angle = 15,
                rulerTypes = ConstructionTool.Views.RulerType,
                curRulerType = curRuler.model.get("_renderData")._rulerType,
                newState = null,
                oldState = null,
                data;


            if (validKeys.indexOf(keyCode) === -1) {
                return;
            }

            //to prevent page scroll on arrow keys down
            event.preventDefault();

            oldState = curRuler.model.getSyncData();
            oldState.id = curRuler.getId();

            oldState = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(oldState);


            if (curRulerType === rulerTypes.Compass) {
                curRuler._intermediatePointOnArc = curRuler.model._getRotatedPointAboutRuler(point);
                if (keyCode === sketchpad.LEFT_ARROW_KEY) {
                    point = curRuler.model._getRotatedPointAboutRuler(point, -angle);
                } else {
                    point = curRuler.model._getRotatedPointAboutRuler(point, angle);
                }
            } else {
                curRuler._intermediatePointOnLine = curRuler.model._getRotatedPointAboutRuler(point);
                if (keyCode === sketchpad.LEFT_ARROW_KEY) {
                    point.x -= 10;
                    point.y -= 10;
                } else {
                    point.x += 10;
                    point.y += 10;
                }
            }


            if (this._addingObj === null) {
                curRuler._savePreviousState(oldState);
                this._addingObj = this.addShapeObject(ConstructionTool.Views.CurToolType);

                data = {
                    "strokeWidth": this._propertyToolbar.getStrokeWidth(),
                    "strokeColor": this._propertyToolbar.getStrokeColor()
                };
                this._addingObj.setOptions(data);

                this._addingObj._ruler = curRuler;
                this._addingObj.processTouchStart();

            }

            curRuler._onPencilMove({
                "point": curRuler.model._getRotatedPointAboutRuler(point)
            });
            this._addingObj.processTouchMove();
            this._bringRulersToFront();
            curRuler.updateAccBoundingBox();

            newState = curRuler.model.getSyncData();
            newState.id = curRuler.getId();
            curRuler._saveCurrentState(newState);

            canvasAccView.drawFocusRect($curTarget.attr("id"));
        },

        "rulerMove": function(event) {
            var keyCode = event.keyCode,
                sketchpad = ConstructionTool.Models.Sketchpad,
                validKeys = [sketchpad.LEFT_ARROW_KEY, sketchpad.RIGHT_ARROW_KEY, sketchpad.TOP_ARROW_KEY, sketchpad.BOTTOM_ARROW_KEY],
                accMapping = this._accdivObjectMapping,
                $curTarget = $(event.currentTarget),
                accDivId = $curTarget.parents(".canvas-acc-container").attr("id"),
                curRuler = accMapping[accDivId],
                canvasAccView = ConstructionTool.Views.canvasAccView,
                PADDING = -10,
                delta,
                newState = null,
                oldState = null;


            if (validKeys.indexOf(keyCode) === -1) {
                return;
            }

            //to prevent page scroll on arrow keys down
            event.preventDefault();

            oldState = curRuler.model.getSyncData();
            oldState.id = curRuler.getId();

            curRuler._savePreviousState(oldState);
            switch (keyCode) {
                case sketchpad.TOP_ARROW_KEY:
                    delta = {
                        "x": 0,
                        "y": PADDING
                    };
                    break;
                case sketchpad.BOTTOM_ARROW_KEY:
                    delta = {
                        "x": 0,
                        "y": -PADDING
                    };
                    break;
                case sketchpad.LEFT_ARROW_KEY:
                    delta = {
                        "x": PADDING,
                        "y": 0
                    };
                    break;
                case sketchpad.RIGHT_ARROW_KEY:
                    delta = {
                        "x": -PADDING,
                        "y": 0
                    };
                    break;
            }
            curRuler.translate(delta, true);
            curRuler.updateAccBoundingBox();
            newState = curRuler.model.getSyncData();
            newState.id = curRuler.getId();

            curRuler._saveCurrentState(newState);
            canvasAccView.reFocusElem($curTarget.attr("id"));

            this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.RulerTransform);
            this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());
        },

        "resizeRuler": function(event) {
            var keyCode = event.keyCode,
                sketchpad = ConstructionTool.Models.Sketchpad,
                validKeys = [sketchpad.LEFT_ARROW_KEY, sketchpad.RIGHT_ARROW_KEY],
                accMapping = this._accdivObjectMapping,
                $curTarget = $(event.currentTarget),
                accDivId = $curTarget.parents(".canvas-acc-container").attr("id"),
                curRuler = accMapping[accDivId],
                canvasAccView = ConstructionTool.Views.canvasAccView,
                topLeft = curRuler.model.getRulerTopLeft(),
                point = {
                    "x": topLeft.x,
                    "y": topLeft.y
                },
                newState = null,
                oldState = null;

            if (validKeys.indexOf(keyCode) === -1) {
                return;
            }

            //to prevent page scroll on arrow keys down
            event.preventDefault();

            oldState = curRuler.model.getSyncData();
            oldState.id = curRuler.getId();

            curRuler._savePreviousState(oldState);

            if (keyCode === sketchpad.LEFT_ARROW_KEY) {
                curRuler._intermediatePointOnLine = curRuler.model._getRotatedPointAboutRuler(point);
                point.x -= 10;
                curRuler._onRulerResize({
                    "point": curRuler.model._getRotatedPointAboutRuler(point)
                });
            } else {
                curRuler._intermediatePointOnLine = curRuler.model._getRotatedPointAboutRuler(point);
                point.x += 10;
                curRuler._onRulerResize({
                    "point": curRuler.model._getRotatedPointAboutRuler(point)
                });
            }
            curRuler.updateAccBoundingBox();
            canvasAccView.reFocusElem($curTarget.attr("id"));

            newState = curRuler.model.getSyncData();
            newState.id = curRuler.getId();

            curRuler._saveCurrentState(newState);
            this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.RulerTransform);
            this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());
        },

        "onCanvasElemFocusIn": function(event) {
            var $curTarget = $(event.currentTarget),
                canvasAccView = ConstructionTool.Views.canvasAccView,
                id = $curTarget.attr("id"),
                num = Number(id.substring(id.lastIndexOf("-"))),
                curShape = null,
                curShapeType = null,
                toolTypes = ConstructionTool.Views.ToolType;

            if ($curTarget.hasClass("shape")) {
                this._clearShapeSelection();
                curShape = this._accdivObjectMapping[$curTarget.parents(".canvas-acc-container").attr("id")];
                curShapeType = curShape.model.get("_data").shapeType;
                if (curShapeType === toolTypes.Text) {
                    curShape.model.setOptions({
                        "allowResize": false,
                        "allowRotate": true
                    });
                } else if (curShapeType === toolTypes.Image) {
                    curShape.model.setOptions({
                        "allowResize": true,
                        "allowRotate": true
                    });
                }

                curShape.select();
                canvasAccView.enableFocusRect("shape-resize-" + num, false);
                canvasAccView.enableFocusRect("shape-rotate-" + num, false);
                this.enableProperyTab(false);
                this.disableShapeTab();
                this._redraw();
            }
        },

        "onCanvasElemFocusOut": function(event) {
            var $target = $(event.target),
                canvasAccView = ConstructionTool.Views.canvasAccView,
                $canvasTemp = this.$("#canvas-temp");

            if ($target.parents().is($canvasTemp)) {
                canvasAccView.removeAccDiv($canvasTemp.parents(".canvas-acc-container").attr("id"));
                canvasAccView.removeFocusRect();
            }
        },


        "onShapeKeyDown": function(event) {
            var $curTarget = $(event.currentTarget),
                shape = this._accdivObjectMapping[$curTarget.parents(".canvas-acc-container").attr("id")],
                keyCode = event.keyCode;

            if ($curTarget.hasClass("shape")) {
                this._moveShape(shape, keyCode, true, false);

            } else if ($curTarget.hasClass("rotate")) {
                this._rotateShape(shape, keyCode);

            } else if ($curTarget.hasClass("resize")) {
                this._resizeKeyPress(shape, keyCode);
            }
        },

        "_moveShape": function(curShape, keyCode, setRefocus, supressStackRegister) {
            var canvasAccView = ConstructionTool.Views.canvasAccView,
                managerView = ConstructionTool.Views.accManagerView,
                sketchpad = ConstructionTool.Models.Sketchpad,
                data = curShape.model.get("_data"),
                shapeType = data.shapeType,
                accId = data.accId,
                isArrowPressed = false,
                deltaFactor = 10,
                startTabIndex = null,
                delta = {},
                toolTypes = ConstructionTool.Views.ToolType;

            switch (keyCode) {
                case sketchpad.ENTER_KEY:
                    canvasAccView.enableFocusRect("shape-rotate-" + accId, true);
                    canvasAccView.enableFocusRect("shape-resize-" + accId, true);

                    if (shapeType === toolTypes.Text) {
                        curShape.trigger("text-double-click");
                        this._enableTabs(false);
                    } else {
                        canvasAccView.setFocus("shape-resize-" + accId);
                    }

                    startTabIndex = managerView.getTabIndex("shape-rotate-" + accId);
                    this.enableProperyTab(true, startTabIndex + 1);
                    break;

                case sketchpad.SPACE_BAR_KEY:
                    canvasAccView.enableFocusRect("shape-rotate-" + accId, true);
                    canvasAccView.enableFocusRect("shape-resize-" + accId, true);

                    if (shapeType === toolTypes.Text) {
                        canvasAccView.setFocus("shape-rotate-" + accId);
                    } else {
                        canvasAccView.setFocus("shape-resize-" + accId);
                    }

                    startTabIndex = managerView.getTabIndex("shape-rotate-" + accId);

                    this.enableProperyTab(true, startTabIndex + 1);
                    break;

                case sketchpad.LEFT_ARROW_KEY:
                    isArrowPressed = true;
                    delta = {
                        "x": -deltaFactor,
                        "y": 0
                    };
                    break;

                case sketchpad.RIGHT_ARROW_KEY:
                    isArrowPressed = true;
                    delta = {
                        "x": deltaFactor,
                        "y": 0
                    };
                    break;

                case sketchpad.TOP_ARROW_KEY:
                    isArrowPressed = true;
                    delta = {
                        "x": 0,
                        "y": -deltaFactor
                    };
                    break;

                case sketchpad.BOTTOM_ARROW_KEY:
                    isArrowPressed = true;
                    delta = {
                        "x": 0,
                        "y": deltaFactor
                    };
                    break;
                case sketchpad.TAB_KEY:
                    managerView.setAccMessage("shape-" + accId, this.getShapeText(curShape).shapeText);
                    break;
            }

            if (isArrowPressed) {

                this.savePrevState(curShape);
                curShape.translate(delta, true);
                this.saveCurState(curShape, supressStackRegister);

                if (setRefocus === true) {
                    this.refocusElem("shape-" + accId, managerView.getAccMessage("shape-handle", 2, [this.getShapeText(curShape).name]), 10);
                }
            }
        },

        "_rotateShape": function(curShape, keyCode) {
            var canvasAccView = ConstructionTool.Views.canvasAccView,
                managerView = ConstructionTool.Views.accManagerView,
                sketchpad = ConstructionTool.Models.Sketchpad,
                data = curShape.model.get("_data"),
                accId = data.accId,
                isArrowPressed = false,
                deltaFactor = 15,
                delta = {},
                accText = "";

            switch (keyCode) {
                case sketchpad.ESCAPE_KEY:
                    canvasAccView.setFocus("shape-" + accId);
                    break;

                case sketchpad.LEFT_ARROW_KEY:
                    isArrowPressed = true;
                    delta = -deltaFactor;
                    accText = managerView.getAccMessage("shape-rotate-handle", 2, [this.getShapeText(curShape).name]);
                    break;

                case sketchpad.RIGHT_ARROW_KEY:
                    isArrowPressed = true;
                    delta = deltaFactor;
                    accText = managerView.getAccMessage("shape-rotate-handle", 1, [this.getShapeText(curShape).name]);
                    break;

                case sketchpad.TAB_KEY:
                    managerView.setAccMessage("shape-rotate-" + accId, this.getShapeText(curShape).rotateText);
                    break;

            }
            if (isArrowPressed) {

                this.savePrevState(curShape);
                curShape.rotate(delta, true);
                this.saveCurState(curShape);

                this.refocusElem("shape-rotate-" + accId, accText, 10);
            }
        },

        "enableProperyTab": function(isEnable, startTabIndex) {
            var accManagerView = ConstructionTool.Views.accManagerView,
                accElem = ["stroke-color-text",
                    "stroke-color-blue",
                    "stroke-color-black",
                    "stroke-color-violet",
                    "stroke-color-pink",
                    "stroke-width-text",
                    "slider-Handle",
                    "background-color-text",
                    "background-color-blue",
                    "background-color-black",
                    "background-color-violet",
                    "background-color-pink",
                    "background-color-no-fill",
                    "delete-button"
                ],
                elem = null;
            for (elem in accElem) {
                if (typeof startTabIndex !== "undefined" || startTabIndex === null) {
                    accManagerView.setTabIndex(accElem[elem], startTabIndex++);
                }
                accManagerView.enableTab(accElem[elem], isEnable);
            }
        },

        "_resizeKeyPress": function(curShape, keyCode) {
            var sketchpad = ConstructionTool.Models.Sketchpad,

                managerView = ConstructionTool.Views.accManagerView,
                increaseBy = 10,
                flipDirection = null,
                isArrowPressed = false,
                resizeX = 0,
                resizeY = 0,
                boundingBox = null,
                accId = curShape.model.get("_data").accId;


            switch (keyCode) {
                case sketchpad.RIGHT_ARROW_KEY:
                    this.savePrevState();
                    resizeX = 10;

                    curShape._applyResize({}, resizeX, resizeY);
                    curShape.updateBoundingBox();
                    boundingBox = curShape.model.getBoundingBox().clone();
                    flipDirection = curShape.model.getFlipDirection(boundingBox);

                    if (boundingBox.width === 0) {
                        curShape.model.setFlipData({
                            "x": 1,
                            "y": flipDirection.y
                        });
                    }

                    isArrowPressed = true;
                    break;
                case sketchpad.LEFT_ARROW_KEY:
                    this.savePrevState();
                    resizeX = -10;

                    curShape._applyResize({}, resizeX, resizeY);
                    curShape.updateBoundingBox();
                    boundingBox = curShape.model.getBoundingBox().clone();
                    flipDirection = curShape.model.getFlipDirection(boundingBox);

                    if (boundingBox.width < 0) {
                        if (boundingBox.width >= -increaseBy) {
                            curShape.model.setFlipData({
                                "x": -1,
                                "y": flipDirection.y
                            });
                        }
                    }
                    isArrowPressed = true;
                    break;
                case sketchpad.TOP_ARROW_KEY:
                    this.savePrevState();
                    resizeY = -10;

                    curShape._applyResize({}, resizeX, resizeY);
                    curShape.updateBoundingBox();
                    boundingBox = curShape.model.getBoundingBox().clone();
                    flipDirection = curShape.model.getFlipDirection(boundingBox);

                    if (boundingBox.height < 0) {
                        if (boundingBox.height >= -increaseBy) {
                            curShape.model.setFlipData({
                                "x": flipDirection.x,
                                "y": -1
                            });
                        }
                    }
                    isArrowPressed = true;
                    break;

                case sketchpad.BOTTOM_ARROW_KEY:
                    this.savePrevState();
                    resizeY = 10;

                    curShape._applyResize({}, resizeX, resizeY);
                    curShape.updateBoundingBox();
                    boundingBox = curShape.model.getBoundingBox().clone();
                    flipDirection = curShape.model.getFlipDirection(boundingBox);
                    if (boundingBox.height <= 0) {
                        if (boundingBox.height === 0) {
                            curShape.model.setFlipData({
                                "x": flipDirection.x,
                                "y": 1
                            });
                        }
                    }
                    isArrowPressed = true;
                    break;

                case sketchpad.TAB_KEY:
                    managerView.setAccMessage("shape-resize-", this.getShapeText(curShape).resizeText);
                    break;
            }

            if (isArrowPressed) {
                curShape.updateBoundingBox();
                this._redraw();
                this.saveCurState();
                this.refocusElem("shape-resize-" + accId, managerView.getAccMessage("shape-resize-handle", 1, [this.getShapeText(curShape).name]), 10);
            }
        },

        "savePrevState": function(curShape) {
            //Save previous state in undo-redo stack
            var prevState = {};

            curShape = curShape || this._arrSelectedShapes[0];

            prevState = curShape.model.getCloneData();
            prevState = curShape.getViewOptions(prevState);
            prevState.id = curShape.getId();


            curShape._savePreviousState(prevState);
        },

        "saveCurState": function(curShape, supressStackRegister) {
            //save current state in undo-redo stack
            var curState = {};

            curShape = curShape || this._arrSelectedShapes[0];

            curState = curShape.model.getCloneData();
            curState.id = curShape.getId();

            curState = curShape.getViewOptions(curState);
            curShape._saveCurrentState(curState);

            if (supressStackRegister !== true) {
                // Set the current action name to be transform. Used in undo redo while saving states of shape.
                this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.Transform);
                // Save the data into the stack, as we have all data ready to extract.
                this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());
            }
        },

        "_getCanvasAccBoundingBox": function() {
            var canvasSize = ConstructionTool.Views.CanvasSize,
                canvasHeight = canvasSize.height,
                canvasWidth = canvasSize.width,
                propertybarHeight = 5,
                points = [],
                ACC_PADDING = ConstructionTool.Models.Sketchpad.ACC_PADDING,
                scrollbarSize = 0;

            if (this._propertyToolbar.model.get("properties").isVisible === true) {
                propertybarHeight = 50;
            }

            if (this.model.get("isScrollbarVisible") === true) {
                scrollbarSize = ConstructionTool.Models.Sketchpad.SCROLL_BUFFER_SPACE;
            }

            points = [
                new ConstructionTool.Models.Point({
                    "x": ACC_PADDING,
                    "y": propertybarHeight + ACC_PADDING
                }),
                new ConstructionTool.Models.Point({
                    "x": canvasWidth - ACC_PADDING - scrollbarSize,
                    "y": propertybarHeight + ACC_PADDING
                }),
                new ConstructionTool.Models.Point({
                    "x": canvasWidth - ACC_PADDING - scrollbarSize,
                    "y": canvasHeight - ACC_PADDING - scrollbarSize
                }),
                new ConstructionTool.Models.Point({
                    "x": ACC_PADDING,
                    "y": canvasHeight - ACC_PADDING - scrollbarSize
                })
            ];

            return {
                "points": points
            };
        },
        "canvasPan": function(event) {

            var keyCode = event.keyCode,
                sketchPadModel = ConstructionTool.Models.Sketchpad,
                delta = 10,
                allowedKeys = [sketchPadModel.LEFT_ARROW_KEY, sketchPadModel.RIGHT_ARROW_KEY, sketchPadModel.TOP_ARROW_KEY, sketchPadModel.BOTTOM_ARROW_KEY],
                canvasAccView = ConstructionTool.Views.canvasAccView;

            if (allowedKeys.indexOf(keyCode) === -1) {
                return;
            }

            //to prevent page scroll on arrow keys down
            event.preventDefault();

            switch (keyCode) {
                case sketchPadModel.LEFT_ARROW_KEY:
                    this._panBy(delta, 0);
                    break;
                case sketchPadModel.RIGHT_ARROW_KEY:
                    this._panBy(-delta, 0);
                    break;
                case sketchPadModel.TOP_ARROW_KEY:
                    this._panBy(0, delta);
                    break;
                case sketchPadModel.BOTTOM_ARROW_KEY:
                    this._panBy(0, -delta);
                    break;
            }
            canvasAccView.setFocus("canvas-temp");
        },

        "getShapeText": function(curShape) {
            var data = curShape.model.get("_data"),
                shapeType = data.shapeType,
                toolTypes = ConstructionTool.Views.ToolType,
                accManagerView = ConstructionTool.Views.accManagerView,
                shapeText = {},
                name = "";

            switch (shapeType) {
                case toolTypes.Text:
                    name = accManagerView.getAccMessage("shape", 0);
                    shapeText = {
                        "name": name,
                        "shapeText": accManagerView.getAccMessage("shape-handle", 1, [name, name, name, name]),
                        "resizeText": accManagerView.getAccMessage("shape-resize-handle", 0, [name]),
                        "rotateText": accManagerView.getAccMessage("shape-rotate-handle", 0, [name])
                    };
                    break;
                case toolTypes.Image:
                    shapeText = accManagerView.getAccMessage("shape", 1);
                    name = accManagerView.getAccMessage("shape", 1);
                    shapeText = {
                        "name": name,
                        "shapeText": accManagerView.getAccMessage("shape-handle", 0, [name, name, name]),
                        "resizeText": accManagerView.getAccMessage("shape-resize-handle", 0, [name]),
                        "rotateText": accManagerView.getAccMessage("shape-rotate-handle", 0, [name])
                    };

                    break;
            }

            return shapeText;
        },

        "refocusElem": function(id, accText, delay, textAfterFocus) {
            var accManager = ConstructionTool.Views.accManagerView,
                $accElem = this.$("#" + id).find(".acc-read-elem"),
                prevText = $accElem.text();

            if (accText) {
                if (prevText === accText) {
                    accText += " ";
                }
                accManager.setAccMessage(id, accText);
            }

            accManager.setFocus("construction-temp-focus");
            accManager.setFocus(id, delay);
            if (textAfterFocus) {
                //settimeout added to change elem text after it is read by jaws.
                setTimeout(function() {
                    accManager.setAccMessage(id, textAfterFocus);
                }, delay + 10);
            }

        },

        "_accOnShapeSelect": function() {
            if (ConstructionTool.Views.isAccessible === false) {
                return;
            }
            var arrShape = this._arrSelectedShapes,
                shapeLen = arrShape.length,
                curShape = null,
                accManager = ConstructionTool.Views.accManagerView,
                canvasAccView = ConstructionTool.Views.canvasAccView;

            if (shapeLen === 1) {
                curShape = arrShape[0];
                canvasAccView.setFocus("shape-" + curShape.model.get("_data").accId);
            } else if (shapeLen > 1) {
                accManager.setFocus("construction-temp-focus");
                canvasAccView.createAccDiv({
                    "isTemp": true
                });
                canvasAccView.updateAccDivProp("canvas-temp", this._getCanvasAccBoundingBox());
                accManager.setAccMessage("canvas-temp", accManager.getAccMessage("shape-handle", 3));
                accManager.setFocus("canvas-temp");
            }
        },

        "_performArrowAction": function(event) {
            if (ConstructionTool.Views.isAccessible === false || this._arrSelectedShapes.length === 0) {
                return;
            }
            var arrSelectedShape = this._arrSelectedShapes,
                shape = null,
                $target = $(event.target),
                elem = null,
                keyCode = event.keyCode,
                isInputElem = $target.is("input[type=\"text\"]"),
                supressElement = ["#construction-tool .accFocusDiv",
                    "#construction-tool .stroke-width-slider-container #size-container",
                    "#construction-tool #construction-temp-focus",
                    "#construction-tool .canvas-acc-div.shape-acc"
                ];
            if (isInputElem) {
                return;
            }
            for (elem in supressElement) {
                if ($target.is(supressElement[elem]) || $target.parents().is(supressElement[elem])) {
                    return;
                }
            }

            for (shape in arrSelectedShape) {
                this._moveShape(arrSelectedShape[shape], keyCode, false, true);
            }

            // Set the current action name to be transform. Used in undo redo while saving states of shape.
            this._setCurrentActionName(ConstructionTool.Views.UndoRedoActions.Transform);
            // Save the data into the stack, as we have all data ready to extract.
            this._saveToUndoRedoStack(this._getPreparedUndoRedoStateCommand());

        },

        "_enableMultipleTabIndices": function(arryElement, isEnable) {
            var elem = null,
                accManager = ConstructionTool.Views.accManagerView;
            for (elem in arryElement) {
                accManager.enableTab(arryElement[elem], isEnable);
            }
        },

        "_enableTabs": function(isEnable) {
            var arrayElem = ["math-title-text-9", "math-tool-save-btn-icon-9", "math-tool-open-btn-icon-9", "math-tool-screenshot-btn-icon-9", "math-tool-print-btn-icon-9",
                    "math-tool-csv-btn-icon-9", "math-tool-btn-help-9", "math-tool-btn-restore-9", "math-tool-btn-hide-9", "math-tool-btn-close-9"
                ],
                elem = null,
                arrRuler = this._rulerArray,
                propertToolType = this._propertyToolbar.model.get("properties").curToolType,
                toolTypes = ConstructionTool.Views.ToolType,
                arrShape = this._arrShapes,
                accId = null,
                $menuAccBtn = this.$("#menu-bar-holder .menubar-button-holder .button-highlighter");


            $.each($menuAccBtn, function(key, val) {
                arrayElem.push($(val).attr("id"));
            });

            for (elem in arrRuler) {
                accId = arrRuler[elem].model.get("_renderData").accId;
                if (typeof accId !== "undefined") {
                    arrayElem.push("ruler-" + accId,
                        "ruler-pencil-" + accId,
                        "ruler-pencil-positioner-" + accId,
                        "ruler-resize-" + accId,
                        "ruler-rotate-" + accId,
                        "ruler-positioner-" + accId
                    );
                }
            }

            for (elem in arrShape) {
                accId = arrShape[elem].model.get("_data").accId;
                if (typeof accId !== "undefined") {
                    arrayElem.push("shape-" + accId);
                }
            }

            this._enableMultipleTabIndices(arrayElem, isEnable);

            if (isEnable === true) {
                this.enableDisableRedoBtn();
                this.enableDisableUndoBtn();

                if (propertToolType !== toolTypes.StraightLiner && propertToolType !== toolTypes.Compass) {
                    this.enableProperyTab(false);
                } else {
                    this.enableProperyTab(true);
                }
            } else {
                this.enableProperyTab(false);
            }
            this.disableShapeTab();
        },

        "disableShapeTab": function() {
            var arrShape = this._arrShapes,
                accObjMap = this._accdivObjectMapping,
                accObj = null,
                shape = null,
                curShape = null,
                propertyToolType = this._propertyToolbar.model.get("properties").curToolType,
                toolTypes = ConstructionTool.Views.ToolType,
                accManager = ConstructionTool.Views.accManagerView,
                accId = null;

            for (accObj in accObjMap) {
                for (shape in arrShape) {
                    if (arrShape[shape] === accObjMap[accObj]) {
                        curShape = arrShape[shape];
                        accId = curShape.model.get("_data").accId;
                        accManager.enableTab("shape-rotate-" + accId, false);
                        accManager.enableTab("shape-resize-" + accId, false);
                    }
                }
            }
            if (propertyToolType !== toolTypes.StraightLiner && propertyToolType !== toolTypes.Compass) {
                this.enableProperyTab(false);
            }
        },
        "changeRulerMenuText": function() {
            var accManager = ConstructionTool.Views.accManagerView;
            //straight-liner
            if (this._isStraightLinerVisible) {
                accManager.changeAccMessage('straight-liner-tool-highlighter', 1);
            } else {
                accManager.changeAccMessage('straight-liner-tool-highlighter', 0);
            }
            //compass
            if (this._isCompassVisible) {
                accManager.changeAccMessage('compass-tool-highlighter', 1);
            } else {
                accManager.changeAccMessage('compass-tool-highlighter', 0);
            }
        },
        "isMobile": function() {
            return MathUtilities.Components.Utils.Models.BrowserCheck.isMobile;
        }

    });

}(window.MathUtilities));
