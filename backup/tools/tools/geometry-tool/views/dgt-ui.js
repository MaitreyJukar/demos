/* eslint no-undefined: 1 new-cap: 1, consistent-return: 1 */
/* global _, $, window, MathJax, imagesWithText, geomFunctions */
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Views.DgtUi = MathUtilities.Components.ToolHolder.Views.ToolHolder.extend({
        "keyDownEventsFuncRef": null,
        "setFocusFuncRef": null,
        "deleteTriggeredFuncRef": null,
        "deleteButtonMouseOverFuncRef": null,
        "deleteButtonMouseLeaveFuncRef": null,
        "_isDirty": null,

        /**
         *Sets the property of tool bar
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
                    "titleText": ''
                },
                "toolIcon": {
                    "toolIconCSS": 'tool-icon dgt-tool-icon'
                },
                "toolId": {
                    "toolIdText": '8'
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
                    "toolIdText": '8'
                },
                "screenCaptureDiv": {
                    "screenCaptureHolder": '#dgt-canvas-container'
                }
            }
        },
        /**
         *Used to call different methods to load tool and call render method
         *@method initialize
         **/
        "initialize": function() {
            arguments[0].toolId = '8';
            MathUtilities.Tools.Dgt.Views.DgtUi.__super__.initialize.apply(this, arguments);

            var animationModel,
                $el = $('#dgt-container'),
                gridGraphView,
                plotterView,
                ImageManager = MathUtilities.Components.ImageManager,
                PADDING = 4,
                engine;

            this.createFunctionReference();
            this._containerElement.append($el);

            this.$el = $el;
            //apple devices can not access div which has css display: none thats why used visibility property through class
            this.$('.dgt-footer-tooltip').addClass('hide-footer-tooltip');
            this.$('#dgt').addClass('disableDgtTapHighlight');
            /**
             *opens the dialog box to browse images or forwards the GUID
             *@method addImage
             */
            this.addImage = _.bind(function addImage(a) {
                if (a === void 0) {
                    var fileElem = this.$('#file-input'),
                        fileElemCopy = fileElem.clone();

                    fileElemCopy.attr('id', 'file-input1')
                        .on('change', _.bind(this.readImage, this));

                    this.$el.append(fileElemCopy);
                    if (fileElemCopy) {
                        fileElemCopy.trigger('click');
                    }
                } else {
                    this.model.engine.perform('addImage', {
                        "image": a.img
                    });
                    this.model.dgtMenuView.selectMenu(0, null);
                }
            }, this);


            this.constructClick = _.bind(function constructClick() {
                this.showHidePropertiesDropDown('construct');
            }, this);
            this.transformClick = _.bind(function transformClick() {
                this.showHidePropertiesDropDown('transform');
            }, this);
            this.measureClick = _.bind(function measureClick() {
                this.showHidePropertiesDropDown('measure');
            }, this);
            this.displayClick = _.bind(function displayClick() {
                this.showHidePropertiesDropDown('display');
            }, this);
            $el.width($el.parent().width())
                .height($el.parent().height());
            this.setState(this.toolbarState);
            this.initiateMathJaxHandler();

            $(window).on('mouseleave', _.bind(this.rearrangeShape, this));

            this.$('#dgt-canvas-container').height($el.height() - this.$('.dgt-menu-holder').height() + PADDING);
            this.$('#dgt-canvas').height(this.$("#dgt-canvas-container").height()).width(this.$el.width());
            this.$('#custom-modal-calculate-popup').hide();
            gridGraphView = new MathUtilities.Components.Graph.Views.GridGraph({
                "el": this.$("#dgt-canvas-container"),
                "option": {
                    "canvasId": 'dgt-canvas',
                    "canvasHeight": 610,
                    "canvasWidth": this.$el.width(),
                    "xAxisMinValue": -10,
                    "xAxisMaxValue": 10,
                    "zoomInButton": 'zoom-in',
                    "zoomOutButton": 'zoom-out',
                    "graphTypeButton": 'graph-type',
                    "isDrawingsDraggable": true,
                    "isTooltipForPoint": false,
                    "stopDoubleClickZoom": false,
                    "_useScrollBarsForPanning": true,
                    "dontBindEvents": true
                }
            });
            gridGraphView.setGridStyle({
                "color": {
                    "xLine": {
                        "axisLine": [1, 1, 1]
                    },
                    "yLine": {
                        "axisLine": [1, 1, 1]
                    }
                }
            });
            gridGraphView.drawGraph();
            plotterView = new MathUtilities.Components.Graph.Views.plotterView({
                "graphView": gridGraphView,
                "generateIntersections": false,
                "doesManageDepth": true
            });
            MathUtilities.Tools.Dgt.Models.DgtStatusMessage.init();
            this.model.dgtPaperScope = ImageManager._paperScope = gridGraphView._paperScope;
            ImageManager._imageLayer = gridGraphView._projectLayers.imageLayer;
            ImageManager._fallbackLayer = gridGraphView._projectLayers.gridLayer;
            engine = this.model.engine = new MathUtilities.Tools.Dgt.Models.DgtEngine({
                "dgtui": this
            });

            this.createAccManager();
            this.model.updateText();
            this.menuBar = this.createMenuBar();
            //added z-index because tool menubar was going beneath of properties bar
            this.$('.tool-menubar').addClass('z-index-for-tool-menubar');
            this.createPropertiesBar();

            //Load menu bar screens
            this.menuBar.loadMenuScreen('menubarScreen');

            engine.setGrid(plotterView, gridGraphView);
            engine.createGridAxes();
            gridGraphView.setDefaultZoomBehaviour(true);
            this.gridGraphView = gridGraphView;
            engine.setDgtUi(this);
            engine.textToolCounter = 0;
            this.initiateBootstrapPopup();
            this.initiateCalculator();
            this.$('#dgt-canvas').on('mouseleave', _.bind(this.removeHoverState, this));
            this.keyDownEventsFuncRef = _.bind(this.keyDownEvents, this);
            this.$el.on('keydown', this.keyDownEventsFuncRef);
            MathUtilities.Tools.Dgt.Models.DgtStatusMessage.setEngine(this.model.engine);
            this.changeManubarState(this.model.defaultMenuBarState.selectedMenuIndex,
                this.model.defaultMenuBarState.selectedSubMenuIndices);
            this._onTextReceived = _.bind(function(base64) {
                var dummyRaster;
                this.model.engine.textToolView.off('getBase64', this._onTextReceived);
                if (base64.editorText !== '') {
                    dummyRaster = new this.model.dgtPaperScope.Raster({
                        "source": 'data:image/png;base64,' + base64.base64
                    });
                    dummyRaster.onLoad = _.bind(function() {
                        base64.top += dummyRaster.height / 2;
                        base64.left += dummyRaster.width / 2;

                        if (base64.editorText) {
                            this.model.engine.perform('addText', base64);
                        }
                        this.removeDummyRaster(dummyRaster);
                        this.model.dgtMenuView.selectMenu(0, null);

                    }, this);

                } else {
                    this.model.dgtMenuView.selectMenu(0, null);
                }
                this.$el.focus(); //normally focus is window specific so we changed  the focus  to tool-specific
            }, this);
            this.$el.attr('tabindex', -1)
                .on('mouseleave', _.bind(this.dgtContainerMouseLeave, this))
                .on('mousemove', _.bind(this.shiftFooterTooltip, this));
            animationModel = new MathUtilities.Tools.Dgt.Models.AnimateModel();
            this.model.animationView = new MathUtilities.Tools.Dgt.Views.Animate({
                "model": animationModel,
                "grid": this.model.engine.grid,
                "animatePaperScope": this.model.dgtPaperScope
            });
            this.model.engine.off('set-focus', this._setFocusRef)
                .on('set-focus', this._setFocusRef);

            this.model.paramWidthTempDiv = $('<div>');
            this.model.paramWidthTempDiv.css({
                "width": 'auto'
            });
            if (this.options.data) {
                this.retrieveState(this.options.data);
            }
            this._createCustomToolTip();
            this.listenTo(this.model.engine.accessibilityView, 'focusOnPropertyMenu', this.onPropertyMenuFocus);
            this.model.engine.accManager.focusIn('dgt-container', _.bind(function() {
                if (tinymce && tinymce.activeEditor) {
                    tinymce.activeEditor.focus();
                    return false;
                }
            }, this));
            return this;
        },

        "_resizeTool": function(event) {
            var $elCurrent = this.$el,
                ToolHolderView = MathUtilities.Tools.Dgt.Views.DgtUi.__super__,
                PADDING = 4,
                SCROLL_BAR_WIDTH = 16, //property bar width
                canvasContainerHeight,
                engine = this.model.engine,
                newSize;

            ToolHolderView._resizeTool.call(this, event);
            newSize = ToolHolderView.getToolSize.call(this);

            $elCurrent.height(newSize.height)
                .width(newSize.width);


            this.$('#dgt-canvas-container').width(newSize.width)
                .height(newSize.height - this.$('.dgt-menu-holder').height() + PADDING);

            canvasContainerHeight = this.$("#dgt-canvas-container").height();


            this.$('#dgt-canvas, #canvas-event-listener, #canvas-event-listener-acc-elem, #dgt-container-acc-elem')
                .height(canvasContainerHeight)
                .width(newSize.width);


            this.$('.dgt-properties-bar')
                .width(newSize.width - SCROLL_BAR_WIDTH);
            engine.grid.canvasResize(true);
            engine.toolSizeChangeCallback();
            engine.updateTextToolResizingData();
        },

        "snapshot": function(callback) {
            var grid = this.gridGraphView,
                $canvas = this.$('#dgt-canvas-container'),
                snapshotSize,
                previousSize = {
                    "height": $canvas.height(),
                    "width": $canvas.width()
                },
                $toolContainer = $('#math-tool-container-8'),
                continueWithScreenShot,
                ScreenUtils = MathUtilities.Components.Utils.Models.ScreenUtils;

            if (this.model.engine._undergoingOperation) {
                this.model.engine._undergoingOperation.abort();
            }

            snapshotSize = this.gridGraphView.getSizeForGraphScreenshot();

            continueWithScreenShot = _.bind(function() {
                $canvas.height(snapshotSize.canvas[1]).width(snapshotSize.canvas[0]);
                this.gridGraphView.updateSizeForScreenshot(snapshotSize);

                _.delay(_.bind(function() {
                    $toolContainer.css("overflow", "visible");
                    ScreenUtils.getScreenShot({
                        "container": "#dgt-canvas-container",
                        "type": ScreenUtils.types.BASE64,
                        "debug": false,
                        "complete": _.bind(function(data) {
                            $toolContainer.css("overflow", "hidden");
                            $canvas.height(previousSize.height).width(previousSize.width);
                            grid.photoshootDone();
                            callback.call(this, data);
                        }, this)
                    });
                }, this), 1000);
            }, this);

            ScreenUtils.confirmScreenshotSize(snapshotSize, continueWithScreenShot);
        },

        "zoomIn": function() {
            this.model.dgtMenuView.selectMenu(0, null);
            this.model.engine.grid._zoomGraph(1, true);
        },

        "zoomDefault": function() {
            this.model.dgtMenuView.selectMenu(0, null);
            this.model.engine.grid.defaultGraphZoom();
        },

        "zoomOut": function() {
            this.model.dgtMenuView.selectMenu(0, null);
            this.model.engine.grid._zoomGraph(-1, true);
        },

        "createFunctionReference": function() {
            this.noCropBtnMouseEnterRef = _.bind(this.noCropBtnMouseEnter, this);
            this.noCropBtnMouseLeaveRef = _.bind(this.noCropBtnMouseLeave, this);
            this.cancelCropButtonRef = _.bind(this.cancelCropButton, this);
            this.yesCropBtnMouseEnterRef = _.bind(this.yesCropBtnMouseEnter, this);
            this.yesCropBtnMouseLeaveRef = _.bind(this.yesCropBtnMouseLeave, this);
            this.okCropButtonRef = _.bind(this.okCropButton, this);
            this.cropSelectionButtonRef = _.bind(this.cropSelectionButton, this);
            this.cropBtnMouseEnterRef = _.bind(this.cropBtnMouseEnter, this);
            this.cropBtnMouseLeaveRef = _.bind(this.cropBtnMouseLeave, this);
            this._deleteTriggeredRef = _.bind(this._deleteTriggered, this);
            this.deleteButtonMouseOverRef = _.bind(this.deleteButtonMouseOver, this);
            this.deleteButtonMouseLeaveRef = _.bind(this.deleteButtonMouseLeave, this);
            this._setFocusRef = _.bind(this._setFocus, this);
        },

        /**
         *Retrieve the state of tool from JSON data
         *@method retrieveState
         *@param {Object} restoreStateJSONData, state object to be retrieve
         */
        "retrieveState": function(restoreStateJSONData) {
            if (restoreStateJSONData) {
                this.setDocumentClean();
                this.model.engine.perform('resetBoard');

                if (restoreStateJSONData.isOwner !== void 0) {
                    this.model.engine.isOwner = restoreStateJSONData.isOwner;
                }
                // HardCoding 'isOwner' to true.
                this.model.engine.isOwner = true;
                if (typeof MathJax !== 'undefined' && _.hasPath(MathJax, "Hub.config.HTML-CSS")) { // Intentionally written typeof DO NOT Change
                    this.model.engine.perform('setData', JSON.stringify(restoreStateJSONData.toolState || restoreStateJSONData));
                } else {
                    this.model.isContinueRetriveOnMathjaxLoad = true;
                    this.model.restoreStateJSONData = restoreStateJSONData;
                }
            }
        },

        "setDocumentDirty": function() {
            this._isDirty = true;
        },

        "setDocumentClean": function(resetLastSavedState) {
            if (resetLastSavedState === void 0) {
                resetLastSavedState = true;
            }
            if (resetLastSavedState) {
                //only called when document is saved successfully
                this.model.engine.lastSavedState = null;
            }
            this._isDirty = false;
        },

        "isDocumentDirty": function() {
            return this._isDirty;
        },

        "saveSuccess": function() {
            this.setDocumentClean();
        },

        /**
         *Convert the current state of tool to JSON
         *@method saveState
         */
        "saveState": function() {
            return this.model.engine.perform('getData');
        },

        /**
         *Set configurations of already loaded file or load file and set configurations
         *@method initiateMathJaxHandler
         */
        "initiateMathJaxHandler": function() {
            var math, mathjaxHub, head, script, mathjaxConfig;

            if (typeof MathJax !== 'undefined') {
                //using already loaded mathjax file & its config
                mathjaxHub = MathJax.Hub;
                mathjaxConfig = mathjaxHub.config.tex2jax.inlineMath[0];
                this.$('#math-output').html(mathjaxConfig[0] + '{}' + mathjaxConfig[1]);
                mathjaxHub.Queue(['Typeset', mathjaxHub, 'math-output']);
                math = mathjaxHub.getAllJax('math-output')[0];
                mathjaxHub.queue.Push(['Text', math, '\loadMathjax']);
                //to allow text to come in next line...
                MathJax.Hub.config['HTML-CSS'].linebreaks.automatic = true;
                return;
            }

            //as mathjax file is not loaded, loading it with required configuration
            head = document.getElementsByTagName('head')[0];
            script = document.createElement('script');
            script.type = 'text/x-mathjax-config';
            script.src = '//app.discoveryeducation.com/static/interactives/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML';
            script[(window.opera ? 'innerHTML' : 'text')] = 'MathJax.Hub.Config({\n' +
                '  tex2jax: { inlineMath: [["$","$"], ["\\\\(","\\\\)"]] },\n' +
                '  "HTML-CSS": { linebreaks: {automatic: true} }\n' +
                '});';
            head.appendChild(script);
            $.getScript('//app.discoveryeducation.com/static/interactives/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML', _.bind(this.mathjaxFileLoaded, this));
        },

        "mathjaxFileLoaded": function() {
            var dgtPopUpView = this.model.dgtPopUpView,
                mathjaxHub = MathJax.Hub;
            mathjaxHub.processSectionDelay = 0;
            mathjaxHub.Queue(['Typeset', mathjaxHub, 'math-output'], _.bind(function() {
                if (typeof MathJax === 'undefined' || !_.hasPath(MathJax, "Hub.config.HTML-CSS") ||
                    !MathJax.Hub.getAllJax('math-output')[0]) {
                    if (dgtPopUpView.model.curPopupShown && dgtPopUpView.model.curPopupShown !== 'mathjax-load-error') {
                        dgtPopUpView.getPopupContainer().find('.btn-cancel').trigger('click');
                    }
                    if (!dgtPopUpView.model.curPopupShown) {
                        this.model.dgtPopUpView.showBootstrapPopup('mathjax-load-error');
                    }
                    return;
                }
                if (this.model.isContinueRetriveOnMathjaxLoad) {
                    this.retrieveState(this.model.restoreStateJSONData);
                }
            }, this));
        },
        /**
         *Read the save state of tool from JSON
         *@method readSaveStateJSON
         */
        "readSaveStateJSON": function() {
            var restoreStateJSONData = imagesWithText; //Set example name
            if (restoreStateJSONData) {
                this.model.engine.perform('setData', JSON.stringify(restoreStateJSONData));
            }
        },
        /**
         *generate JSON from current state of object
         *@method generateSaveStateJSON
         */
        "generateSaveStateJSON": function() {
            var saveStateJSON = 'restoreStateJSONData=' + JSON.stringify(this.model.engine.perform('getData'));
            geomFunctions.traceConsole(saveStateJSON);
            $('#dgt-temp-save-state-output').val(saveStateJSON); //code for testing purpose, not possible to use this.$
        },
        /**
         *Calls to rearrangement of unsettled point
         *@method rearrangeShape
         */
        "rearrangeShape": function() {
            var updateDataObject, engine = this.model.engine;
            if (engine._unsettledPoint) {
                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                updateDataObject.newPosition = engine.getPointCoordinate(engine._unsettledPoint);
                engine._unsettledPoint.triggerRearrangement(updateDataObject);
                this.model.dgtPaperScope.view.draw();
            }
        },
        /**
         *Call methods to create menubar and popup menu
         *@method createMenuBar
         */
        "createMenuBar": function() {
            var $menuHolder = this.$('.dgt-menu-holder'),
                dgtMenuModel = new MathUtilities.Components.MenuBar.Models.Menu({
                    "isAccessible": MathUtilities.Tools.Dgt.Models.DgtEngine.isAccessible,
                    "accManager": this.model.engine.accManager
                }),
                dgtMenuView = new MathUtilities.Components.MenuBar.Views.Menu({
                    "el": $menuHolder,
                    "model": dgtMenuModel
                }),
                buttonData = this.model.buttonBuildData,
                loopVar = 0,
                buttonList = [],
                newBtnModel = null;
            this.model.dgtMenuView = dgtMenuView;

            for (; loopVar < buttonData.length; loopVar++) {

                if (buttonData[loopVar].seperator === void 0) {
                    newBtnModel = new MathUtilities.Components.MenuBar.Models.Button();
                    newBtnModel.setBtnParameters(buttonData[loopVar]);
                    buttonList.push(newBtnModel);
                } else {
                    dgtMenuView.compileMenu(buttonList);
                    dgtMenuView.addSeperator(buttonData[loopVar].seperator);
                    buttonList = [];
                }
            }
            if (buttonList.length > 0) {
                dgtMenuView.compileMenu(buttonList);
            }
            $menuHolder.on('menuToolChanged', _.bind(this.menuToolChangeListner, this))
                .on('menubarRadioBtnChanged', _.bind(this.menuRadioBtnChangeListner, this));
            dgtMenuView.on('imageAssetSelected', _.bind(this.addImage, this))
                .on('popupMenuButtonhover', this.onStatusChange);
            dgtMenuView.model.get('menuPopupView').on('popupMenuButtonhover', this.onStatusChange);
            return dgtMenuView;
        },
        /**
         *Make call to display Properties Bar
         *@method createPropertiesBar
         */
        "createPropertiesBar": function() {
            var model = this.model,
                PROPERTY_WIDTH_REDUCTION = 15, //property bar width
                $propertyBarHolder = this.$('.dgt-properties-bar'),
                propertyBarWidth = $propertyBarHolder.width();

            $propertyBarHolder.width(propertyBarWidth - PROPERTY_WIDTH_REDUCTION);
            model.propertiesBar = new MathUtilities.Components.PropertiesBar.Views.MenuBar({
                "el": $propertyBarHolder
            });
            model.propertiesBar.on('properties-bar-shown', _.bind(this._propertyBarShown, this))
                .show(['Operations'], MathUtilities.Tools.Dgt.templates);

            //Load property bar top menu button
            this.model.engine.accManager.loadScreen('propertybar');
            this.$('.operation-container, #color-text, #delete-btn').on("focusin", _.bind(this.hidePropertiesDropDowns, this));
            this.$('.property-temp-elem').on("focusin", _.bind(this.shiftFromPropertyToCanvas, this));

        },
        /**
         *Change the label options when new label added or removed from set label option
         *@method onChangeLabelText
         */
        "onChangeLabelText": function(event) {
            if (event.target.value === '') {
                return 'no-name';
            }
            if (event.target.value.trim() !== '') {
                return 'current-label';
            }
        },

        "setStatusMessage": function(statusMessage) {
            if (statusMessage === void 0) {
                return;
            }
            if (statusMessage.trim().length === 0) {
                this.$('.dgt-footer-tooltip').addClass('hide-footer-tooltip')
                    .text('');
            } else {
                this.$('.dgt-footer-tooltip').removeClass('hide-footer-tooltip')
                    .text(statusMessage);
            }
        },
        "dgtContainerMouseLeave": function() {
            this.$('.dgt-footer-tooltip').addClass('hide-footer-tooltip');
        },
        "disableDeleteButton": function() {
            this.$('#delete-btn').addClass('disabled');
        },
        "enableDeleteButton": function() {
            this.$('#delete-btn').removeClass('disabled');
        },
        "shiftFooterTooltip": function(event) {
            var $footerTooltipDisplay = this.$('.dgt-footer-tooltip'),
                eventPageY = event.pageY,
                footerTooltipWidth = $footerTooltipDisplay.width(),
                offset = $footerTooltipDisplay.offset(),
                $canvasContainer = this.$('#dgt-canvas-container'),
                intersectionValueAtX = event.pageX - $canvasContainer.offset().left;

            if ($(event.target).hasClass('dgt-footer-tooltip')) {
                $footerTooltipDisplay.addClass('dgt-footer-tooltip-right');
            } else if (intersectionValueAtX > footerTooltipWidth || eventPageY < offset.top) {
                $footerTooltipDisplay.removeClass('dgt-footer-tooltip-right');
            }
        },

        /**
         *Binds the event to objects when property bar loaded
         *@method _propertyBarShown
         */
        "_propertyBarShown": function() {
            var $propertyBarHolder = this.$('.dgt-properties-bar'),
                dropDownModel, dropDownView,
                $propertyBarOperationContainer = $propertyBarHolder.find('.operation-container');
            if ('ontouchstart' in window) {
                $propertyBarOperationContainer.on('touchstart',
                        function() {
                            $(this).addClass('operation-container-hover');
                        })
                    .on('touchend',
                        function() {
                            $(this).removeClass('operation-container-hover operation-container-down');
                        });
            } else {
                $propertyBarOperationContainer.off('mouseenter', this.propertyButtonMouseEnter)
                    .on('mouseenter', this.propertyButtonMouseEnter)
                    .off('mouseleave', this.propertyButtonMouseLeave)
                    .on('mouseleave', this.propertyButtonMouseLeave);

            }

            $propertyBarHolder.find('.operation-container').off('mousedown', this.propertyButtonMouseDown)
                .on('mousedown', this.propertyButtonMouseDown)
                .off('mouseup', this.propertyButtonMouseUp)
                .on('mouseup', this.propertyButtonMouseUp);
            $propertyBarHolder.find('#no-crop-image-btn').off('mouseenter', this.noCropBtnMouseEnterRef)
                .on('mouseenter', this.noCropBtnMouseEnterRef)
                .off('mouseleave', this.noCropBtnMouseLeaveRef)
                .on('mouseleave', this.noCropBtnMouseLeaveRef)
                .off('click', this.cancelCropButtonRef)
                .on('click', this.cancelCropButtonRef);
            $propertyBarHolder.find('#yes-crop-image-btn').off('mouseenter', this.yesCropBtnMouseEnterRef)
                .on('mouseenter', this.yesCropBtnMouseEnterRef)
                .off('mouseleave', this.yesCropBtnMouseLeaveRef)
                .on('mouseleave', this.yesCropBtnMouseLeaveRef)
                .off('click', this.okCropButtonRef)
                .on('click', this.okCropButtonRef);
            $propertyBarHolder.find('#crop-image-btn').off('click', this.cropSelectionButtonRef)
                .on('click', this.cropSelectionButtonRef)
                .off('mouseenter', this.cropBtnMouseEnterRef)
                .on('mouseenter', this.cropBtnMouseEnterRef)
                .off('mouseleave', this.cropBtnMouseLeaveRef)
                .on('mouseleave', this.cropBtnMouseLeaveRef)
                .off('mousedown', this.cropBtnMouseDown)
                .on('mousedown', this.cropBtnMouseDown)
                .off('mouseup', this.cropBtnMouseUp)
                .on('mouseup', this.cropBtnMouseUp);
            this.model.propertiesBar.on('properties-bar-hidden', _.bind(this._propertiesBarHidden, this));

            dropDownModel = new MathUtilities.Components.MenuBar.dropDown.Model();
            dropDownModel.setData('construct', this.model.construct_menu);
            dropDownView = new MathUtilities.Components.MenuBar.dropDown.View({
                "model": dropDownModel
            }, 'dgt');
            dropDownView.on('change-status', this.onStatusChange);
            this.$('.construct-container').off('click', this.constructClick).on('click', this.constructClick);
            //rendering transform drop down
            dropDownModel.setData('transform', this.model.transform_menu);
            dropDownView = new MathUtilities.Components.MenuBar.dropDown.View({
                "model": dropDownModel
            }, 'dgt');
            dropDownView.on('change-status', this.onStatusChange);
            this.$('.transform-container').off('click', this.transformClick).on('click', this.transformClick);
            //rendering measure drop down.
            dropDownModel.setData('measure', this.model.measure_menu);
            dropDownView = new MathUtilities.Components.MenuBar.dropDown.View({
                "model": dropDownModel
            }, 'dgt');
            dropDownView.on('change-status', this.onStatusChange);
            this.$('.measure-container').off('click', this.measureClick).on('click', this.measureClick);
            //rendering display drop down.
            dropDownModel.setData('display', this.model.display_menu);
            dropDownView = new MathUtilities.Components.MenuBar.dropDown.View({
                "model": dropDownModel
            }, 'dgt');
            dropDownView.on('change-status', this.onStatusChange);
            this.$('.display-container').off('click', this.displayClick).on('click', this.displayClick);
            this.$('.tool-menubar-drop-down').on('dropDownItemClicked', _.bind(this._performRequiredOperation, this));
            this.$('.operations-holder .tool-color-selector').on('click', _.bind(this._onChangeColor, this))
                .on('mouseover', _.bind(this.onColorHover, this));
            this.$('.operations-holder .delete').off('click', this._deleteTriggeredRef)
                .on('click', this._deleteTriggeredRef)
                .off('mouseover', this.deleteButtonMouseOverRef)
                .on('mouseover', this.deleteButtonMouseOverRef)
                .off('mouseleave', this.deleteButtonMouseLeaveRef)
                .on('mouseleave', this.deleteButtonMouseLeaveRef);

        },

        /**
         *Add hover state class to cancel crop button
         *@method noCropBtnMouseEnter
         */
        "noCropBtnMouseEnter": function(event) {
            $(event.target).addClass('no-crop-image-btn-hover');
            this.onStatusChange('crop-cancel', 'hover');
        },
        /**
         *Remove hover state class to cancel crop button
         *@method noCropBtnMouseLeave
         */
        "noCropBtnMouseLeave": function(event) {
            $(event.target).removeClass('no-crop-image-btn-hover');
            this.onStatusChange('cursor', 'leave');
        },
        /**
         *Add hover state class to ok crop button
         *@method yesCropBtnMouseEnter
         */
        "yesCropBtnMouseEnter": function(event) {
            $(event.target).addClass('yes-crop-image-btn-hover');
            this.onStatusChange('crop-ok', 'hover');
        },
        /**
         *Remove hover state class to ok crop button
         *@method yesCropBtnMouseLeave
         */
        "yesCropBtnMouseLeave": function(event) {
            $(event.target).removeClass('yes-crop-image-btn-hover');
            this.onStatusChange('cursor', 'leave');
        },

        "onColorHover": function() {
            this.onStatusChange('color', 'hover');
        },
        /**
         *Validates the cropping area and if valid then create crop object and starts the cropping event
         *@method cropSelectionButton
         */
        "cropSelectionButton": function() {

            var engine = this.model.engine,
                $propertiesBar = this.$('.dgt-properties-bar'),
                DEFAULT_SIZE = 40,
                transform = MathUtilities.Tools.Dgt.Views.TransformationGridView.getTransformationGridViewObject(null, null, engine.selected[0].equation.getRaster()),
                scaledValueAtX = transform.distance(transform._tr.position, transform._tl.position),
                scaledValueAtY = transform.distance(transform._tl.position, transform._bl.position);


            if (scaledValueAtX < DEFAULT_SIZE || scaledValueAtY < DEFAULT_SIZE) {
                engine.dgtUI.model.dgtPopUpView.showBootstrapPopup('small-image-crop');
                return;
            }
            if (!engine._cropImageObj) {
                engine._cropImageObj = new MathUtilities.Components.ImageCrop.Views.CropImage({
                    "model": new MathUtilities.Components.ImageCrop.Models.CropImageModel({
                        "_paperscope": this.model.dgtPaperScope,
                        "_transform": engine.transform,
                        "_canvasElem": this.$('#dgt-canvas'),
                        "_engine": engine
                    })
                });
            }
            engine.perform('selectCursor');
            this.changeManubarState(this.model.previousMenubarState[0], this.model.previousMenubarState[1]);
            engine.selected[0].cropImage();
            $propertiesBar.find('#no-crop-image-btn, #yes-crop-image-btn').show();
            this.disableListenersDuringCrop();

        },
        /**
         *Crop the given area in selection area
         *@method okCropButton
         */
        "okCropButton": function() {
            var $propertyBarHolder = this.$('.dgt-properties-bar');
            $propertyBarHolder.find('.crop-options .image-btn-highlighter').removeClass('selected');
            $propertyBarHolder.find('#yes-crop-image-btn, #no-crop-image-btn').hide();
            this.model.engine._cropImageObj.getCroppedRaster();
            this.enableListnersAfterCropping();
        },
        /**
         *Cancel the cropping  by clearing the cropping object
         *@method cancelCropButton
         */
        "cancelCropButton": function() {
            var $propertyBarHolder = this.$('.dgt-properties-bar'),
                engine = this.model.engine,
                cropImageObj;
            $propertyBarHolder.find('.crop-options .image-btn-highlighter').removeClass('selected');
            $propertyBarHolder.find('#yes-crop-image-btn, #no-crop-image-btn').hide();
            cropImageObj = engine._cropImageObj;
            cropImageObj.clearCroppingObjects();
            cropImageObj.off('okClicked', engine.selected[0].createCropImageRelation);
            this.model.dgtPaperScope.view.draw();
            this.enableListnersAfterCropping();
        },
        /**
         *Disable all listeners when cropping option is selected
         *@method disableListenersDuringCrop

         */
        "disableListenersDuringCrop": function() {
            var engine = this.model.engine,
                grid = engine.grid;
            this.disableDgtPropertiesBar(true);
            grid.enableInputMode(grid.INPUT_MODE_MOUSEWHEEL, false);
            engine._enableDisableCanvasEvents(false);

        },
        /**
         *Enabled event listeners when cropping complete or canceled
         *@method enableListnersAfterCropping
         */
        "enableListnersAfterCropping": function() {
            var engine = this.model.engine,
                grid = engine.grid;
            this.enableDgtPropertiesBar();
            grid.enableInputMode(grid.INPUT_MODE_MOUSEWHEEL, true);
            engine._enableDisableCanvasEvents(true);
        },

        /**
         *Add hover state class to crop image button
         *@method cropBtnMouseEnter
         */
        "cropBtnMouseEnter": function(event) {
            $(event.target).addClass('crop-image-btn-hover');
            this.onStatusChange('crop', 'hover');
        },
        /**
         *Remove hover state class from crop image button
         *@method cropBtnMouseLeave
         */
        "cropBtnMouseLeave": function(event) {
            $(event.target).removeClass('crop-image-btn-hover crop-image-btn-click');
            this.onStatusChange('cursor', 'leave');
        },
        /**
         *Add click state class to crop image button
         *@method cropBtnMouseDown
         */
        "cropBtnMouseDown": function() {
            $(this).addClass('crop-image-btn-click')
                .parent().addClass('selected');
        },
        /**
         *Remove click state class from crop image button
         *@method cropBtnMouseDown
         */
        "cropBtnMouseUp": function() {
            $(this).removeClass('crop-image-btn-click');
        },
        /**
         *Add hover state class to delete button
         *@method deleteButtonMouseOver
         */
        "deleteButtonMouseOver": function(event) {
            $(event.target).addClass('hover');
            this.onStatusChange('delete', 'hover');
        },
        /**
         *Remove hover state class from delete button
         *@method deleteButtonMouseLeave
         */
        "deleteButtonMouseLeave": function(event) {
            $(event.target).removeClass('hover');
            this.onStatusChange('cursor', 'leave');
        },
        /**
         *Add hover state class to property button
         *@method propertyButtonMouseEnter
         */
        "propertyButtonMouseEnter": function() {
            $(this).addClass('operation-container-hover');
        },
        /**
         *Remove hover state class from property button
         *@method propertyButtonMouseLeave
         */
        "propertyButtonMouseLeave": function() {
            $(this).removeClass('operation-container-hover operation-container-down');
        },
        /**
         *Add click state class to property button
         *@method propertyButtonMouseDown
         */
        "propertyButtonMouseDown": function() {
            $(this).addClass('operation-container-down');
        },
        /**
         *Remove click state class from property button
         *@method propertyButtonMouseUp
         */
        "propertyButtonMouseUp": function() {
            $(this).removeClass('operation-container-down');
        },

        /**
         *Hides Property bar Internally
         *@method _propertiesBarHidden
         */
        "_propertiesBarHidden": function() {

            if (!this.model.hidePropBarInternally) {
                this.model.engine.deselectAll();
            }
        },
        /**
         *normally focus is window specific so we it sets  the focus  to tool-specific
         *@method _setFocus
         */
        "_setFocus": function() {
            this.$el.focus();
        },
        /**
         *Get triggered when drop down button is clicked and make call to create respective popup or to perform given operations
         *@method _performRequiredOperation
         *@param {Object} event passed on user performed action
         *@param {String} directive string of performed operation
         */
        "_performRequiredOperation": function(event, directive) {
            var DgtUiModel = MathUtilities.Tools.Dgt.Models.DgtUiModel,
                iteratePopupManager = this.model.dgtPopUpView.model.iteratePopupManager,
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                engine = this.model.engine,
                DEFAULT_DEPTH = 3,
                loopVar;

            if (directive === 'iterate' || directive === 'iterateToDepth') {
                //Iteration alternative callback
                if (directive === 'iterateToDepth') {
                    for (loopVar = engine.selected.length - 1; loopVar > -1; loopVar--) {
                        if (engine.selected[loopVar].division === 'measurement' && engine.selected[loopVar].species !== 'measureIteration') {
                            iteratePopupManager.params.depth = engine.selected[loopVar];
                            engine._select(engine.selected[loopVar]);
                            break;
                        }
                    }
                } else {
                    iteratePopupManager.params.depth = DEFAULT_DEPTH;
                }
                iteratePopupManager.enableFreePointsOnly();
                if (iteratePopupManager.numberOfSourcePoint === 0) {
                    directive = 'iterate-missing-destination-image';
                }
            }
            if (directive === 'properties') {
                if (engine.selected.length > 0 && engine.possible.indexOf('properties') > -1) {
                    engine.setPropertiesPopupTitle();
                }
            } else if (directive === 'parameter') {
                this.setTitleAndopenPopup(DgtUiModel.popupTitleMapping.newParameter, null, 'parameter');
            } else if (directive === 'calculator') {
                this.setTitleAndopenPopup(DgtUiModel.popupTitleMapping.newCalculation, null, 'calculator');
            } else if (['translate', 'parameter', 'calculator', 'iterate', 'iterateToDepth', 'iterate-missing-destination-image'].indexOf(directive) > -1) {
                this.model.dgtPopUpView.showBootstrapPopup(directive);
            } else if (['rotate', 'dilate', 'reflect'].indexOf(directive) > -1) {
                if (engine.anchor && engine.selected && engine.selected.length === 1 && $.inArray(engine.anchor, engine.selected) !== -1) {
                    if (directive === 'rotate' || directive === 'dilate') {
                        this.model.dgtPopUpView.showBootstrapPopup('transforming-center-only');
                    } else {
                        this.model.dgtPopUpView.showBootstrapPopup('reflecting-mirror-only');
                    }
                } else if (directive === 'reflect') {
                    this.model.engine.perform(directive, DgtOperation.lastOperationData ? DgtOperation.lastOperationData.params : null);
                } else {
                    this.model.dgtPopUpView.showBootstrapPopup(directive);
                }
            } else {
                this.model.engine.perform(directive, DgtOperation.lastOperationData ? DgtOperation.lastOperationData.params : null);
                if (['measure', 'markCenter', 'markMirror'].indexOf(directive) === -1) {
                    this.model.engine.accessibilityView.setFocusToCanvas();
                }
            }

            this.hidePropertiesDropDowns();
        },
        /**
         *Hides the drop down properties
         *@method hidePropertiesDropDowns
         */
        "hidePropertiesDropDowns": function() {
            this.$('.tool-menubar-drop-down').css({
                "display": 'none'
            });
            $(window).off('mousedown touchstart', this.hideDropDown);
        },
        /**
         *Hides the drop down properties when button is clicked
         *@method showHidePropertiesDropDown
         *@param {String} menuList value of menu list button
         */
        "showHidePropertiesDropDown": function(menuList) {
            var $dropDownList = this.$('.' + menuList + '-drop-down');
            if ($dropDownList.css('display') === 'none') {
                $dropDownList.css({
                    "display": 'block'
                });
                this.onPropertyDropDownOpen(menuList);
                $(window).on('mousedown touchstart', _.bind(function(event) {
                    this.hideDropDown(menuList, event);
                }, this));
            } else {
                this.hidePropertiesDropDowns();
            }
        },
        "onPropertyDropDownOpen": function(dropDownFor) {
            if (!dropDownFor) {
                return;
            }
            var accManager = this.model.engine.accManager,
                dropDown = dropDownFor + '-drop-down',
                $disableElem = this.$('.' + dropDown + ' .drop-down-item').not('.enabled');
            accManager.unloadScreen(dropDown);
            accManager.loadScreen(dropDown);
            _.each($disableElem, function(key) {
                accManager.enableTab($(key).attr('id'), false);
            });

            accManager.setFocus(this.$('.' + dropDown + ' .drop-down-item.enabled').attr('id'));

        },
        /**
         *Hide drop down menu when clicked else where
         *@method hideDropDown
         *@param {String} menuList class of menu list button
         *@param {Object} event the action the causes to call the method
         */
        "hideDropDown": function(menuList, event) {

            var $target = $(event.target);

            if ($target.hasClass(menuList + '-container') || $target.parents().hasClass(menuList + '-container') ||
                $target.hasClass('drop-down-item') || $target.parents().hasClass('drop-down-item') ||
                $target.hasClass('separator') || $target.hasClass('tool-menubar-drop-down')) {
                return;
            }
            this.$('.' + menuList + '-drop-down').css({
                "display": 'none'
            });
            $(window).off('mousedown touchstart', this.hideDropDown);

        },
        /**
         *Removes hover state on object when cursor moves outside canvas
         *@method removeHoverState
         */
        "removeHoverState": function() {
            var element, iLooper = 0,
                rolledOver = this.model.engine.rolledOver;
            for (; iLooper < rolledOver.length; iLooper++) {
                element = rolledOver[iLooper];
                if (element.species === 'iteration') {
                    rolledOver.splice(iLooper, 1);
                    iLooper--;
                    this.model.engine._updateDrawableColor(element, element.properties.color);
                } else {
                    element.equation.trigger('roll-out', element.equation);
                }
            }
        },
        /**
         *Enable dgt properties-bar on completion of cropping or cancellation of cropping
         *@method enableDgtPropertiesBar
         *@param {Boolean} forCropping Boolean that states if cropping is disabled or not.
         */
        "enableDgtPropertiesBar": function() {
            this.$('#disable-properties-modal, #disable-lower-properties-modal, #disable-properties-bar, #disable-properties-bar-right-side').remove();

        },
        "onStatusChange": function() {
            MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString(arguments[0], arguments[1], arguments[3]);
        },

        /**
         *Disable dgt properties bar on selection of cropping
         *@method disableDgtPropertiesBar
         *@param {Boolean} forCropping boolean value whether the cropping selected
         */
        "disableDgtPropertiesBar": function(forCropping) {
            var widthOfDisablePropertiesBarLeft, widthOfDisablePropertiesBarRight,
                $yesCropBtn;
            if (this.$('#disable-properties-modal').length === 0) {
                $('<div>').attr({
                    "id": 'disable-properties-modal'
                }).appendTo(this.$('.tool-menubar'));
                if (this.$('.dgt-properties-bar').is(':hidden') || forCropping) {
                    this.$('#disable-properties-modal').addClass('without-properties-bar');
                } else {
                    this.$('#disable-properties-modal').addClass('without-properties-bar');
                    $('<div>').attr({
                            "id": 'disable-lower-properties-modal'
                        }).appendTo(this.$('.tool-menubar'))
                        .addClass('lower-properties-bar');
                }
                /*To disable during cropping*/
                if (forCropping) {
                    $yesCropBtn = this.$('#yes-crop-image-btn');
                    widthOfDisablePropertiesBarLeft = $yesCropBtn.offset().left - this.$('#math-utilities-properties-menu-container').offset().left - parseInt($yesCropBtn.css('margin-right'), 10);
                    widthOfDisablePropertiesBarRight = this.$('.dgt-properties-bar.math-utilities-properties-tool-bar').width() -
                        (widthOfDisablePropertiesBarLeft + this.$('.crop-options').width() - $yesCropBtn.width() - parseInt($yesCropBtn.css('margin-left'), 10));
                    $('<div>').attr({
                            "id": 'disable-properties-bar'
                        }).appendTo(this.$('.dgt-properties-bar.math-utilities-properties-tool-bar'))
                        .addClass('disable-properties-bar').css('width', widthOfDisablePropertiesBarLeft);


                    $('<div>').attr({
                            "id": 'disable-properties-bar-right-side'
                        }).appendTo(this.$('.dgt-properties-bar.math-utilities-properties-tool-bar'))
                        .addClass('disable-properties-bar-right-side').css('width', widthOfDisablePropertiesBarRight);
                }
            }
        },
        /**
         *Show or hides the crop and color options
         *@method showHideProperties
         *@param {String} possibleOperations all possible operations that causes to hide crop and color options
         */
        "showHideProperties": function(possibleOperations) {
            var propertyBar = this.model.propertiesBar;
            if (possibleOperations.indexOf('changeColor') === -1) {
                propertyBar.$('.color-palette').hide();
            } else {
                propertyBar.$('.color-palette').show();
            }

            if (possibleOperations.indexOf('cropping') === -1) {
                propertyBar.$('.crop-options').hide();
            } else {
                propertyBar.$('.crop-options').show();
                /* hide ok, cancel buttons initially*/

                propertyBar.$('#yes-crop-image-btn, #no-crop-image-btn').hide();
            }
            this.showHidePropertiesBar(possibleOperations);

        },
        /**
         *Show or hide properties bar for given possible operations
         *@method showHidePropertiesBar
         *@param {Array} possibleOperations all possible operation that causes to hide or show properties bar
         */
        "showHidePropertiesBar": function(possibleOperations) {

            var possibleOperationsCount = possibleOperations.length,
                operation,
                exceptionalOperationsForPropertiesBar = ['hideObjects', 'showAllHidden', 'lockObject', 'unlockAll', 'unlock', 'calculator',
                    'calculation', 'parameter', 'cut', 'copy', 'paste', 'unmarkAll'
                ],
                ifOnlyExceptionalOperations = true;

            for (operation in possibleOperations) {
                if ($.inArray(possibleOperations[operation], exceptionalOperationsForPropertiesBar) === -1) {
                    ifOnlyExceptionalOperations = false;
                    break;
                }
            }
            if (possibleOperationsCount === 0 || ifOnlyExceptionalOperations) {
                if (this.model.propertiesBar.isVisible()) {
                    this.hidePropertiesBar();
                }
            } else {
                if (!this.model.propertiesBar.isVisible()) {
                    this.model.propertiesBar.show();
                }
            }
        },
        /**
         *Hide properties bar
         *@method hidePropertiesBar
         */
        "hidePropertiesBar": function() {
            this.model.hidePropBarInternally = true;
            this.model.propertiesBar.hide();
            this.model.hidePropBarInternally = false;
        },
        /**
         *Enable possible options on drop down menu for given objects
         *@method enableDropDownItems
         *@param {Array} possible operations to be enabled on drop down
         *@param {Boolean} showLabel to display hide or show on display drop down
         */
        "enableDropDownItems": function(possible, showLabel) {
            var dropDownModel = new MathUtilities.Components.MenuBar.dropDown.Model(),
                dropDownView = new MathUtilities.Components.MenuBar.dropDown.View({
                    "model": dropDownModel
                });
            dropDownView.enableDropDownItems(possible);

            this.changeLabelShowHideText(showLabel);

        },
        /**
         *Disable menubar items on selection of specific element or tools
         *@method disableMenuBarItems
         *@param {Array} possible array of possible elements or tools for which menubar items are disabled
         */
        "disableMenuBarItems": function(possible) {
            var disableOptions = {
                    "edit": ['cut', 'copy', 'paste'],
                    "lockPanel": ['hideObjects', 'showAllHidden', 'lockObject', 'unlockAll', 'unlock']
                },
                directiveToSubMenuIndexMap = this.model.directiveToSubMenuIndexMap,
                curDisableOptions = null,
                disabledItems = [],
                disabledMenuOptions = [],
                iLooper,
                disableOptionsAttr = null,
                disableOptionsLen = null;
            if (possible.indexOf('cut') === -1 && possible.indexOf('copy') === -1 && possible.indexOf('paste') === -1) {
                disabledItems.push(this.model.menuIndexMap.EDIT);
            }
            if (possible.indexOf('hideObjects') === -1 && possible.indexOf('showAllHidden') === -1 &&
                possible.indexOf('lockObject') === -1 && possible.indexOf('unlockAll') === -1 && possible.indexOf('unlock') === -1) {
                disabledItems.push(this.model.menuIndexMap.SHOWALLHIDDEN);
            }
            this.model.dgtMenuView.disableMenuBarBtn(disabledItems);
            for (disableOptionsAttr in disableOptions) {
                curDisableOptions = disableOptions[disableOptionsAttr];
                disableOptionsLen = curDisableOptions.length;
                for (iLooper = 0; iLooper < disableOptionsLen; iLooper++) {
                    if (possible.indexOf(curDisableOptions[iLooper]) === -1) {
                        disabledMenuOptions.push(directiveToSubMenuIndexMap[curDisableOptions[iLooper]]);
                    }
                }
                this.model.dgtMenuView.disablePopupMenuOptions(disableOptionsAttr, disabledMenuOptions);
                disabledMenuOptions = [];
            }
        },
        /**
         *Display show or hide label when object's label is hidden or shown respectively
         *@method changeLabelShowHideText
         *@param {Boolean} showLabel whether label is shown or hidden
         */
        "changeLabelShowHideText": function(showLabel) {
            var option;
            if (showLabel) {
                option = 'Show Label';
            } else {
                option = 'Hide Label';
            }
            if (this.model.engine.selected.length > 1) {
                option += 's';
            }
            this.model.propertiesBar.$('#showHideLabels').text(option);
        },

        /**
         *On change of color in color palette sets the color to selected objects
         *@method _onChangeColor
         *@param {Object} event the action the causes to call the method
         */
        "_onChangeColor": function(event) {
            var engine = this.model.engine,
                $currentTarget = $(event.currentTarget);

            this.$('div.tool-color-selector').removeClass('selected');
            $currentTarget.addClass('selected');
            engine.setProperty('color', MathUtilities.Tools.Dgt.Models.DgtUiModel.colorHexCodeMapping[$currentTarget.attr('id')], true);
            engine.accessibilityView.shiftToProperty = false;
            engine.accManager.setFocus('point-highlighter');
        },

        /**
         *Changes selected element's color to highlight color
         *@method highlightSelectedColor
         *@param {String} currentColor previous color of element before selection
         */
        "highlightSelectedColor": function(currentColor) {
            var $allElements = this.$('div.tool-color-selector');
            $allElements.removeClass('selected');

            $allElements.each(function() {
                if (MathUtilities.Tools.Dgt.Models.DgtUiModel.colorHexCodeMapping[$(this).attr('id')] === currentColor) {
                    $(this).addClass('selected');
                    return false;
                }
            });
        },

        /**
         *Pass call to respective function on menu tool change
         *@method menuToolChangeListner
         *@param {Object} event the action the causes to call the method
         *@param {Number} menuIndex index of selected element on menubar
         *@param {Number} subMenuIndex index of element on the selected menu index on menubar
         *@param {Object} $menuBtn, jQuery object of clicked button
         *@param {Object} clickEvent, image event, it is required for image asset
         *@param {String} fromKeyEvent, "true" if event is trigger by keyboard enter
         *@param {Boolean} fromPopup,  to check is popup option is selected.
         */
        "menuToolChangeListner": function(event, menuIndex, subMenuIndex, $menuBtn, clickEvent, fromKeyEvent, fromPopup) {
            var directive = this.model.toolButtonsActionMap[menuIndex][subMenuIndex],
                engine = this.model.engine,
                undergoingOperation,
                menuIndexMap = this.model.menuIndexMap,
                menubarLastState = this.model.menubarLastState;
            this.model.previousMenubarState = [menubarLastState.selectedMenuIndex, menubarLastState.selectedSubMenuIndices];
            fromKeyEvent = fromKeyEvent === 'true';
            this.setKeyBoolean(fromKeyEvent);
            //Removed this since setGridMode is shifted in perform for all the operations.
            MathUtilities.Tools.Dgt.Models.DgtPoint.createPointCoordinate = null;
            // clearing saved point coordinate since it is not required for new operation.
            engine.setDefaultPositionForPoint();
            if (['cut', 'paste'].indexOf(directive) > -1 && engine.possible.indexOf(directive) === -1) {
                return;
            }

            if ([menuIndexMap.UNDO, menuIndexMap.REDO, menuIndexMap.TEXT, menuIndexMap.IMAGE].indexOf(menuIndex) === -1) {
                if (!this.isHideSelection(menuIndex)) {
                    menubarLastState.selectedMenuIndex = this.model.menubarCurrentState.selectedMenuIndex = menuIndex;
                }
                menubarLastState.selectedSubMenuIndices[menuIndex] = this.model.menubarCurrentState.selectedSubMenuIndices[menuIndex] = subMenuIndex;
            }
            if (!fromPopup && (!this.model.toolButtonsActionMap[menuIndex][-1] || this.model.radioBtnActionMap[menuIndex]) && fromKeyEvent) {
                return;
            }
            if (menuIndex === menuIndexMap.RESET) {
                if (engine.points.length > 0 || engine.shapes.length > 0 || engine.annotations.length > 0 || engine.images.length > 0 || engine.measures.length > 0 ||
                    this.model.defaultMenuBarState.selectedMenuIndex !== this.model.menubarCurrentState.selectedMenuIndex ||
                    this.model.defaultMenuBarState.selectedSubMenuIndices.toString() !== this.model.menubarCurrentState.selectedSubMenuIndices.toString()) {
                    this.model.dgtPopUpView.showBootstrapPopup(directive);
                }
                return;
            }
            if (menuIndex === menuIndexMap.NUMBER) {
                if (subMenuIndex === 1) {
                    this.setTitleAndopenPopup(MathUtilities.Tools.Dgt.Models.DgtUiModel.popupTitleMapping.newParameter, null, directive);
                } else {
                    this.setTitleAndopenPopup(MathUtilities.Tools.Dgt.Models.DgtUiModel.popupTitleMapping.newCalculation, null, directive);
                }
                return;
            }

            switch (menuIndex) {
                case menuIndexMap.IMAGE:
                    this.openAddImageModal(clickEvent);
                    break;
                case menuIndexMap.UNDO:
                    engine._callUndo();
                    break;
                case menuIndexMap.REDO:
                    engine._callRedo();
                    break;
                case menuIndexMap.TEXT:
                    undergoingOperation = engine.getUndergoingOperation();
                    if (undergoingOperation) {
                        undergoingOperation.abort();
                    }
                    engine.deselectAll();
                    engine.setOperationMode('addText');
                    engine.grid.setGridMode('SelectionRect');
                    if (fromKeyEvent) {
                        this.createTextToolAtCenter();
                    }
                    break;
                default:
                    switch (this.model.radioBtnLatestState[this.model.radioBtnActionMap[menuIndex]]) {
                        case 'both':
                            engine.perform(directive, {
                                "stroke": true,
                                "fill": true
                            });
                            break;
                        case 'stroke':
                            engine.perform(directive, {
                                "stroke": true,
                                "fill": false
                            });
                            break;
                        default:
                            engine.perform(directive, {
                                "stroke": false,
                                "fill": true
                            });
                            break;
                    }
                    break;

            }
            if ([menuIndexMap.SELECT, menuIndexMap.POINT, menuIndexMap.LINE, menuIndexMap.SHAPES, menuIndexMap.CONICS, menuIndexMap.POLYGON, menuIndexMap.TEXT].indexOf(menuIndex) > -1) {
                this.model.lastDirective = this.model.lastDirective !== directive ? directive : this.model.lastDirective;
            }
            if (fromKeyEvent && [menuIndexMap.TEXT, menuIndexMap.IMAGE].indexOf(menuIndex) === -1) {
                this.model.engine.accManager.setFocus('canvas-event-listener');
            }
        },

        "setKeyBoolean": function(boolean) {
            MathUtilities.Tools.Dgt.Models.DgtUiModel.fromKeyEvent = boolean;
        },
        /**
         *Creates Text tool at center of canvas
         *@method createTextToolAtCenter
         */
        "createTextToolAtCenter": function() {
            var grid = this.model.engine.grid,
                origin = grid.getAttribute().graphOrigin.currentOrigin,
                center = [origin.x, origin.y],
                selRectDefaultWidth = 50,
                rect = new grid._paperScope.Path.Rectangle(center, [selRectDefaultWidth, selRectDefaultWidth]);
            grid.trigger('selection-rect-complete', rect.bounds);
            rect.remove();
        },

        /**
         *Removes selection from menu item when another tool is selected
         *@method isHideSelection
         *@param {Number} menuIndex index of tool on which selection to be removed
         */
        "isHideSelection": function(menuIndex) {
            return this.model.buttonBuildData[menuIndex].hideSelection;
        },
        /**
         *Changes radio button selection on selection changes
         *@method menuRadioBtnChangeListner
         *@param {Object} event the action the causes to call the method
         *@param {String} name type of tool
         *@param {String} radioType type radio button
         *@param {string} fromKeyEvent, 'true' if event trigger by keyboard event.
         */
        "menuRadioBtnChangeListner": function(event, name, radioType, fromKeyEvent) {
            var menuIndex = this.model.menubarLastState.selectedMenuIndex,
                subMenuIndex = this.model.menubarLastState.selectedSubMenuIndices[menuIndex];
            this.model.previousRadioBtnState[name] = this.model.radioBtnLatestState[name];
            this.model.radioBtnLatestState[name] = radioType;
            this.model.currentRadioButtontype = name;
            this.menuToolChangeListner(event, menuIndex, subMenuIndex, null, null, fromKeyEvent, true);
        },
        /**
         *Changed menubar status on selection action performed
         *@method changeManubarState
         *@param {Number} index of selected item on menubar
         *@param {Array} selectedSubMenuIndices index of selected tools
         */
        "changeManubarState": function(selectedMenuIndex, selectedSubMenuIndices) {
            var model = this.model,
                loopVar = 0,
                defaultselectedSubMenuIndicesClone, lastStateSubMenuIndicesClone,
                buttonBuildData = model.buttonBuildData,
                singleMenuOptionIndices = [],
                engine = this.model.engine,
                menuIndexMap = this.model.menuIndexMap,
                directive, changeRadioButton = {},
                arrChangeRadioBtn = [],
                isReset = false,
                lastState, subIndex,
                btn = null;

            /*get list of menu with no sub-menus*/
            for (; loopVar < buttonBuildData.length; loopVar++) {
                if (!buttonBuildData[loopVar].popupMenuOptions) {
                    singleMenuOptionIndices.push(loopVar);
                }
            }

            /*save current state & will reset the state of menubar*/
            if (typeof selectedMenuIndex !== 'undefined' && selectedSubMenuIndices) {
                /*set -1 for options with no submenu*/
                for (loopVar = 0; loopVar < singleMenuOptionIndices.length; loopVar++) {
                    selectedSubMenuIndices[singleMenuOptionIndices[loopVar]] = -1;
                }
                /*save current state*/

                defaultselectedSubMenuIndicesClone = model.defaultMenuBarState.selectedSubMenuIndices.slice();
                selectedMenuIndex = model.defaultMenuBarState.selectedMenuIndex;
                selectedSubMenuIndices = defaultselectedSubMenuIndicesClone;
                model.menubarLastState.selectedMenuIndex = model.menubarCurrentState.selectedMenuIndex = model.defaultMenuBarState.selectedMenuIndex;
                model.menubarLastState.selectedSubMenuIndices = model.menubarCurrentState.selectedSubMenuIndices = defaultselectedSubMenuIndicesClone;

                for (btn in model.radioBtnLatestState) {
                    model.previousRadioBtnState[btn] = model.radioBtnLatestState[btn];
                    model.radioBtnLatestState[btn] = 'stroke';
                }
                isReset = true;
                buttonBuildData[8].popupMenu[3].selected = false;
                engine.grid.snapToGridFlag = false;
                engine.perform('selectCursor');
                this._updateCanvasCursor('selectCursor');
            } else {
                lastState = model.menubarLastState.selectedMenuIndex;
                lastStateSubMenuIndicesClone = model.menubarLastState.selectedSubMenuIndices.slice();
                if ([menuIndexMap.SHOW, menuIndexMap.UNDO, menuIndexMap.TEXT, menuIndexMap.IMAGE].indexOf(lastState) === -1) {
                    selectedMenuIndex = model.menubarLastState.selectedMenuIndex;
                    selectedSubMenuIndices = lastStateSubMenuIndicesClone;
                    subIndex = selectedSubMenuIndices[selectedMenuIndex];
                    directive = this.model.toolButtonsActionMap[selectedMenuIndex][subIndex];
                    this._updateCanvasCursor(directive);

                }
            }

            /*set states on menubar*/
            for (btn in model.radioBtnLatestState) {
                changeRadioButton = {
                    "btnType": 'radio-btn',
                    "name": btn,
                    "setTool": model.radioBtnLatestState[btn]
                };
                arrChangeRadioBtn.push(changeRadioButton);
            }
            this.model.dgtMenuView.setMenubarState(selectedMenuIndex, selectedSubMenuIndices, singleMenuOptionIndices, arrChangeRadioBtn);
            if (this.model.wasInSnapGridMode && isReset === false) {
                buttonBuildData[8].popupMenu[3].selected = true;

            }

        },
        /**
         *On triggering of delete the selected objects are deleted
         *@method _deleteTriggered
         */
        "_deleteTriggered": function() {
            if (this.$('#delete-btn').hasClass('disabled')) {
                return;
            }
            this.model.engine.deleteSelectedItems();
        },
        /**
         *Sets the user selected grid options or remove already set grid
         *@method setSelectedGridInMenu
         *@param {String} gridOption the grid selected by user
         */
        "setSelectedGridInMenu": function(gridOption) {
            var $gridBtn = this.$('.tool-menubar .grid .menubar-button'),
                GRID_INDEX = 8;

            $gridBtn.removeClass($gridBtn.attr('data-tool'));

            if (gridOption === 'squareGrid') {
                $gridBtn.attr('data-tool', 'square-grid').attr('data-submenu-index', '1').addClass('square-grid');
                this.model.menubarCurrentState.selectedSubMenuIndices[GRID_INDEX] = this.model.menubarLastState.selectedSubMenuIndices[GRID_INDEX] = 1;
                this.model.engine.gridShown = true;
            } else if (gridOption === 'polarGrid') {
                $gridBtn.attr('data-tool', 'polar-grid').attr('data-submenu-index', '2').addClass('polar-grid');
                this.gridShown = true;
                this.model.menubarCurrentState.selectedSubMenuIndices[GRID_INDEX] = this.model.menubarLastState.selectedSubMenuIndices[GRID_INDEX] = 2;
                this.model.engine.gridShown = true;
            } else if (gridOption === 'noGrid') {
                $gridBtn.attr('data-tool', 'no-grid').attr('data-submenu-index', '0').addClass('no-grid');
                this.gridShown = false;
                this.model.engine.gridShown = false;
                this.model.menubarCurrentState.selectedSubMenuIndices[GRID_INDEX] = this.model.menubarLastState.selectedSubMenuIndices[GRID_INDEX] = 0;
            }
        },

        /**
         *read selected image from dialog box and display
         *@method readImage
         *@param {Object} e the action the causes to call the method
         */
        "readImage": function(e) {
            if (!e.target.files) {
                return;
            }
            var file = e.target.files[0],
                imageType = /image\/(jpeg|jpg|png|bmp)/i,
                reader;

            if (file === void 0) {
                return;
            }

            if (!file.type.match(imageType)) {
                this.changeManubarState(this.model.previousMenubarState[0], this.model.previousMenubarState[1]);
                this.model.dgtPopUpView.showBootstrapPopup('unsupported-file-error');
                return;
            }
            reader = new FileReader();
            reader.onload = _.bind(function(evt) {
                this.model.engine.perform('addImage', {
                    "image": evt.target.result
                });
                this.model.dgtMenuView.selectMenu(0, null);
            }, this);
            reader.readAsDataURL(file);
        },

        "openAddImageModal": function(event) {
            var imgPreload,
                fileElem,
                fileElemCopy,
                zeusSiteUpload;

            // For deciding whether to open the imageReader popup or not
            zeusSiteUpload = false;

            // Do not dig into this code...
            if (zeusSiteUpload) {
                fileElem = this.$('#file-input');
                fileElemCopy = fileElem.clone();

                fileElemCopy.attr('id', 'file-input1')
                    .on('change', _.bind(this.readImage, this));
                this.$el.append(fileElemCopy);
                if (fileElemCopy) {
                    fileElemCopy.trigger('click');
                }
                this.model.dgtMenuView.selectMenu(0, null);
            } else if (event.shiftKey && event.altKey) {
                this.menuBar.getImageAssetView().open();
            } else {
                $.de.browse({
                    "actionType": 'choose',
                    /* Searchable and Non-Searchable Images asset type GUID */
                    "onComplete": _.bind(function(evt) {
                        if (evt) {
                            $.ajax({
                                "url": "/api:mediafiles/list/",
                                "data": {
                                    "assetGuidList": evt.content.guid,
                                    "typeidlist": 37
                                }
                            }).always(_.bind(function(resp) {
                                imgPreload = new Image();
                                imgPreload.onload = _.bind(function() {
                                    this.addImage({
                                        "img": imgPreload.src
                                    });
                                }, this);
                                imgPreload.src = resp.data[0].mediaFileUrl;
                            }, this));
                        }
                    }, this)
                });
            }
        },
        /**
         *Removes dummy raster added during read image
         *@method removeDummyRaster
         *@param {Object} raster object of paperJS
         */
        "removeDummyRaster": function(dummyRaster) {
            dummyRaster.remove();
        },

        /**
         *Create instance of calculator and make call to set calculator function
         *@method initiateCalculator
         */
        "initiateCalculator": function() {
            var dgtCalculatorManager = new MathUtilities.Tools.Dgt.Models.DgtCalculatorManager({
                "engine": this.model.engine
            });
            this.model.engine.setDgtCalculatorManager(dgtCalculatorManager);
        },

        /**
         *Creates popup model and view object and sets engine
         *@method initiateBootstrapPopup
         */
        "initiateBootstrapPopup": function() {

            var dgtPopUpModel = new MathUtilities.Tools.Dgt.Models.DgtPopupModel({
                "engine": this.model.engine
            });
            this.model.dgtPopUpView = new MathUtilities.Tools.Dgt.Views.DgtPopup({
                "el": this.$el,
                "model": dgtPopUpModel
            });

        },
        /**
         *Handles the keydown events performed by user
         *@method keyDownEvents
         *@param {Object} event the action the causes to call the method
         */
        "keyDownEvents": function(event) {
            var OSName, bDefault = false,
                engine = this.model.engine,
                $popup, keyCode, ctrlDown = false,
                isMenubarDisabled = false,
                dgtPopUpView = this.model.dgtPopUpView,
                dgtPopUpModel = dgtPopUpView.model,
                keyCodeMap = this.model.keyCodeMap,
                performCancel = _.bind(function() {
                    engine.perform('resetOperation');
                    engine.deselectAll();
                    this._updateCanvasCursor('selectCursor');
                    engine.accessibilityView.shiftToProperty = false;
                    engine.accManager.setFocus('point-highlighter');
                    this.$('.popup-menu-container').hide();
                    this.$('.tool-menubar-drop-down').hide();
                }, this),
                callPerform = function(directive) {
                    //Executes perform function only when operation is available in possible.
                    if ($.inArray(directive, engine.possible) !== -1) {
                        engine.perform(directive);
                    }
                };
            if (this.$('.tool-menubar-drop-down').find(':visible').length !== 0) {
                return void 0; //drop down is open.
            }
            OSName = navigator.appVersion.indexOf("Mac") !== -1 ? 'MacOS' : 'Windows';
            isMenubarDisabled = this.$('#disable-properties-modal:visible').length > 0;
            bDefault = $(event.target).hasClass('parameter');
            keyCode = event.which || event.keyCode || event.charCode;
            ctrlDown = OSName === 'MacOS' && event.metaKey || OSName === 'Windows' && event.ctrlKey;
            if (dgtPopUpModel.bootstrapPopupShown) {

                if (dgtPopUpModel.curPopupShown === 'iterate' || dgtPopUpModel.curPopupShown === 'iterateToDepth') {
                    switch (keyCode) {
                        case keyCodeMap.SPECIAL_KEY_NUMPADPLUS:
                            dgtPopUpView._eventListenerForIterateMenuItem(null, 'increase-iterations');
                            break;
                        case keyCodeMap.SPECIAL_KEY_EQUAL:
                        case keyCodeMap.SPECIAL_KEY_EQUAL_MOZ:
                            if (event.shiftKey) {
                                dgtPopUpView._eventListenerForIterateMenuItem(null, 'increase-iterations');
                            }
                            break;
                        case keyCodeMap.SPECIAL_KEY_NUMPADMINUS:
                        case keyCodeMap.SPECIAL_KEY_MINUS:
                        case keyCodeMap.SPECIAL_KEY_MINUS_MOZ:
                            dgtPopUpView._eventListenerForIterateMenuItem(null, 'decrease-iterations');
                            break;
                        case keyCodeMap.ALPHABET_A:
                            if (ctrlDown) {
                                dgtPopUpView._eventListenerForIterateMenuItem(null, 'add-new-map');
                                return false;
                            }
                            break;
                        case keyCodeMap.SPECIAL_KEY_LEFT_ARROW:
                            dgtPopUpView._eventListenerForIterateMenuItem(null, 'iteration-data mapping-data', 'left');
                            break;
                        case keyCodeMap.SPECIAL_KEY_UP_ARROW:
                            dgtPopUpView._eventListenerForIterateMenuItem(null, 'iteration-data mapping-data', 'up');
                            break;
                        case keyCodeMap.SPECIAL_KEY_RIGHT_ARROW:
                            dgtPopUpView._eventListenerForIterateMenuItem(null, 'iteration-data mapping-data', 'right');
                            break;
                        case keyCodeMap.SPECIAL_KEY_DOWN_ARROW:
                            dgtPopUpView._eventListenerForIterateMenuItem(null, 'iteration-data mapping-data', 'down');
                            break;
                    }
                    return void 0;
                }


                $popup = dgtPopUpView.getPopupContainer();
                switch (keyCode) {
                    case keyCodeMap.SPECIAL_KEY_ENTER:
                        if (!(($(document.activeElement).hasClass('btn-cancel') || $(document.activeElement).hasClass('close')) &&
                                ($popup.attr('data-directive') === 'resetBoard' || $popup.attr('data-directive') === 'beta-functionality' ||
                                    $popup.attr('data-directive') === 'unsupported-file-error'))) {
                            $popup.find('.btn-primary').focus().trigger('click'); // giving focus so that values can be updated on focus out of text.
                        }
                        event.preventDefault();
                        break;
                    case keyCodeMap.SPECIAL_KEY_ESCAPE:
                        $popup.find('.btn-cancel').trigger('click');
                        break;
                    default:
                        if (dgtPopUpModel.curPopupShown === 'calculator' &&
                            !$(document.activeElement).hasClass('calculator-math-input') &&
                            this.model.dgtPopUpView.calculatorInputValidation(event) && !event.isTrigger) {
                            $popup.find('.calculator-math-input').focus();
                        }
                        break;
                }
                return void 0;
            }
            if ($(event.target).hasClass('parameter') && engine.editableMeasurementId &&
                engine.getEntityFromId(engine.editableMeasurementId).species === 'parameter') {
                keyCode = event.which || event.keyCode || event.charCode;
                if (keyCode === keyCodeMap.SPECIAL_KEY_ENTER) {
                    /* Instead of triggering blur event we are setting focus on tool-holder
                    because in IE both focus and blur are asynchronous so while blur is triggered
                    for textbox, internally jQuery invokes it after the textbox is hidden and hence it
                    has no effect and the focus remains in the text box*/
                    this.$el.focus();
                    return void 0;
                }
            }

            if (!($(event.target).is('input[type="text"]') || $(event.target).is('textarea')) && isMenubarDisabled === false) {
                switch (keyCode) {
                    case keyCodeMap.ALPHABET_A:

                        if (bDefault) {
                            return bDefault;
                        }
                        if (ctrlDown) {
                            if (engine._undergoingOperation) {
                                engine._undergoingOperation.abortAndReborn();
                            }
                            engine.selectAll();
                            return false;
                        }
                        break;
                    case keyCodeMap.ALPHABET_C:
                        if (ctrlDown) {
                            callPerform('copy');
                            return false;
                        }
                        break;
                    case keyCodeMap.ALPHABET_F:
                        if (event.shiftKey && ctrlDown) {
                            callPerform('markCenter');
                        }
                        return false;

                    case keyCodeMap.ALPHABET_H:
                        if (ctrlDown) {
                            if (event.shiftKey) {
                                callPerform('showAllHidden');
                            } else {
                                callPerform('hideObjects');
                            }
                            return false;
                        }
                        break;
                    case keyCodeMap.ALPHABET_I:
                        if (event.shiftKey && ctrlDown) {
                            callPerform('connectIntersection');
                            return false;
                        }
                        break;
                    case keyCodeMap.ALPHABET_K:
                        if (ctrlDown) {
                            callPerform('showHideLabels');
                            return false;
                        }
                        break;
                    case keyCodeMap.ALPHABET_J:
                        if (ctrlDown) {
                            callPerform('connectSegment');
                            return false;
                        }
                        break;
                    case keyCodeMap.ALPHABET_M:
                        if (ctrlDown) {
                            callPerform('connectMidpoint');
                            return false;
                        }
                        break;
                    case keyCodeMap.ALPHABET_P:
                        if (ctrlDown) {
                            if (event.shiftKey) {
                                this.setTitleAndopenPopup(MathUtilities.Tools.Dgt.Models.DgtUiModel.popupTitleMapping.newParameter, null, 'parameter');
                            } else {
                                callPerform('constructInterior');
                            }
                            return false;
                        }
                        break;
                    case keyCodeMap.ALPHABET_V:
                        if (ctrlDown) {
                            callPerform('paste');
                            return false;
                        }
                        break;
                    case keyCodeMap.ALPHABET_X:
                        if (ctrlDown) {
                            callPerform('cut');
                            return false;
                        }
                        break;
                    case keyCodeMap.SPECIAL_KEY_FRWD_SLASH:
                        if (event.altKey) {
                            this._performRequiredOperation(null, 'properties');
                            return false;
                        }
                        break;
                    case keyCodeMap.SPECIAL_KEY_EQUAL:
                    case keyCodeMap.SPECIAL_KEY_EQUAL_MOZ:
                        if (event.altKey) {
                            this.setTitleAndopenPopup(MathUtilities.Tools.Dgt.Models.DgtUiModel.popupTitleMapping.newCalculation, null, 'calculator');
                            return false;
                        }
                        break;
                    case keyCodeMap.SPECIAL_KEY_BACKSPACE:
                    case keyCodeMap.SPECIAL_KEY_DELETE:
                        if (bDefault) {
                            return bDefault;
                        }
                        if (engine.isCroppingInProgress) {
                            return false;
                        }
                        if (engine.dgtUI.$('#delete-btn').hasClass('disabled')) {
                            return void 0;
                        }
                        engine.deleteSelectedItems();
                        return false;

                    case keyCodeMap.SPECIAL_KEY_ESCAPE:
                        performCancel();
                }
            } else if (engine.isCroppingInProgress) {
                if (keyCode === keyCodeMap.SPECIAL_KEY_ESCAPE) { //ESC Key
                    this.cancelCropButton();
                    performCancel();
                }
                return false;
            }
        },

        /**
         *Sets default cursor
         *@method selectCursor
         */
        //......:change call
        "selectCursor": function() {
            var $buttons = this.$('.tool-menubar .button-highlighter'),
                menuIndexMap = this.model.menuIndexMap;
            this.model.menubarLastState.selectedMenuIndex = this.model.menubarCurrentState.selectedMenuIndex = menuIndexMap.SELECT;
            $buttons.removeClass('hover selected');
            $($buttons[0]).addClass('selected');
        },
        /**
         *Check whether the web browser is IE or not
         *@method _isIE
         */
        "_isIE": function() {
            var returnVal = -1,
                userAgent,
                matches,
                regEx;
            if (navigator.appName === 'Microsoft Internet Explorer') {
                userAgent = navigator.userAgent;
                regEx = new RegExp("MSIE (\d+[\.\d]*)"); //regex to check is IE9 or above
                matches = regEx.exec(userAgent);
                if (matches) {
                    returnVal = parseFloat(matches[1]);
                }
            } else if (navigator.appName === 'Netscape') {
                userAgent = navigator.userAgent;
                regEx = new RegExp('Trident/.*rv:(\d+[\.\d]*)'); //regex to check is IE9 or above
                matches = regEx.exec(userAgent);
                if (matches) {
                    returnVal = parseFloat(matches[1]);
                }
            }
            return returnVal;
        },
        /**
         *Set title of popup window
         *@method setTitleAndopenPopup
         *@param {String} title string to display as title
         *@param {String} operationType type of operation performed
         *@param {String} directive the data of element whose title is to be displayed
         *@param {Boolean} changed when clicked on another object other than the element for which popup was opened
         */
        "setTitleAndopenPopup": function(title, operationType, directive, changed) {
            var dgtPopUpView = this.model.dgtPopUpView;
            dgtPopUpView.model.paramPopupData[directive].title = title;
            dgtPopUpView.showBootstrapPopup(directive, operationType, changed);
        },
        /**
         *Add the selected measurement value to calculator
         *@method addMeasurementToCalculator
         *@param {Number} measurement value in measurement div
         */
        "addMeasurementToCalculator": function(measurement, event) {
            var engine = this.model.engine;
            /* The current calculation measurement that we are editing should not be added to the calculation data itself and also not
            more than one source should be added to the calculation measurement */
            if (engine.editableMeasurementId === measurement.id) {
                engine._select(measurement);
                return;
            }
            this.model.dgtPopUpView.addMeasurementToCalculator(measurement, event);
        },
        /**
         *Set the selected tool as a cursor when pen or pencil is selected
         *@method _updateCanvasCursor
         *@param {String} directive selected tool string
         */
        "_updateCanvasCursor": function(directive) {
            var $canvas = this.$('#dgt-canvas-container');
            $canvas.removeClass('dgt-marker-pencil-cursor ie-dgt-marker-pencil-cursor dgt-marker-pen-cursor ie-dgt-marker-pen-cursor dgt-default-cursor');

            switch (directive) {
                case 'pencilAnnotation':
                    if (this._isIE() === -1) {
                        $canvas.addClass('dgt-marker-pencil-cursor');
                    } else {
                        $canvas.addClass('ie-dgt-marker-pencil-cursor');
                    }
                    break;
                case 'penAnnotation':
                    if (this._isIE() === -1) {
                        $canvas.addClass('dgt-marker-pen-cursor');
                    } else {
                        $canvas.addClass('ie-dgt-marker-pen-cursor');
                    }
                    break;
                default:
                    $canvas.addClass('dgt-default-cursor');
                    break;
            }

        },
        /**
         *Shows drop down menu of 'display' drop down
         *@method showCustomLabelOption
         *@param {String} stringToDisplay the element text to display in drop down
         *@param {String} stringKey mapping key for comparison
         *@param {Boolean} forHideOption, check for hidden option
         */
        "showCustomLabelOption": function(stringToDisplay, stringKey, forHideOption) {

            var Utils = MathUtilities.Components.Utils.Models.Utils,
                DgtUiModel = MathUtilities.Tools.Dgt.Models.DgtUiModel,
                stringSpace, propertiesOption;
            if (forHideOption) {
                propertiesOption = '';
            } else {
                propertiesOption = stringToDisplay;

            }
            if (stringKey === 'coordinate' || stringKey === 'equation') {
                this.model.propertiesBar.$('#properties').text(Utils.replaceWords(DgtUiModel.dropDownListMap.string,
                    DgtUiModel.popupTitleMapping.label, '..', '', ''));
            } else {
                stringSpace = typeof stringToDisplay !== 'undefined' || typeof propertiesOption !== 'undefined' && propertiesOption.length > 0 ? ' ' : '';
                if (stringKey === 'tickMark') {
                    this.model.propertiesBar.$('#properties').text(Utils.replaceWords(DgtUiModel.dropDownListMap.string,
                        DgtUiModel.popupTitleMapping.propertiesOf, stringSpace, propertiesOption, '...'));
                } else {
                    this.model.propertiesBar.$('#properties').text(Utils.replaceWords(DgtUiModel.dropDownListMap.string,
                        DgtUiModel.popupTitleMapping.label, stringSpace, propertiesOption, '...'));
                }
            }

            if (stringKey === '..') {
                stringToDisplay = DgtUiModel.textMapping.objects;
            }

            this.model.propertiesBar.$('#hideObjects').text(Utils.replaceWords(DgtUiModel.dropDownListMap.string, DgtUiModel.popupTitleMapping.hide, stringToDisplay, '', ''));
        },
        "changeUnmarkOption": function(anchor) {
            var textMapping = MathUtilities.Tools.Dgt.Models.DgtUiModel.textMapping;
            if (anchor) {
                if (anchor.division === 'point') {
                    this.model.propertiesBar.$('#unmarkAll').text(textMapping.unmarkCenter);
                } else {
                    this.model.propertiesBar.$('#unmarkAll').text(textMapping.unmarkMirror);
                }
            } else {
                this.model.propertiesBar.$('#unmarkAll').text(textMapping.unmark);
            }
        },
        "_createCustomToolTip": function() {
            var elemId = null,
                tooltipElems = this.model.tooltipData,
                options = null,
                tooltipView = null,
                $el = this.$el;

            for (elemId in tooltipElems) {
                options = {
                    "id": tooltipElems[elemId].id + '-tooltip',
                    "text": tooltipElems[elemId].text,
                    "position": tooltipElems[elemId].position || 'bottom',
                    "align": tooltipElems[elemId].align,
                    "tool-holder": $el
                };
                tooltipView = MathUtilities.Components.CustomTooltip.generateTooltip(options);
                //In this case its not possible to use this.$,
                //as el for view is dgt-container and buttons (like screen-shot, save) are not inside el
                if ('ontouchstart' in window) {
                    $('#' + tooltipElems[elemId].id).on('touchstart', _.bind(tooltipView.showTooltip, tooltipView))
                        .on('touchend', _.bind(tooltipView.hideTooltip, tooltipView));
                } else {
                    $('#' + tooltipElems[elemId].id).on('mouseenter', _.bind(tooltipView.showTooltip, tooltipView))
                        .on('mouseleave click', _.bind(tooltipView.hideTooltip, tooltipView));
                }
            }
        },

        "disableOrEnableDragingOfMeasurementDivs": function(disable, measurement) {
            //true for disabling and false for enabling
            if (measurement) {
                if (measurement.$measureView) {
                    measurement.$measureView.attr('locked', !!disable)
                        .draggable({
                            "disabled": disable
                        });
                }
            } else {
                if (['iterate', 'iterateToDepth', 'properties', 'calculator'].indexOf(this.model.dgtPopUpView.model.directive) > -1) {
                    $(this.$('.dgt-measurement-container[locked=false]')).draggable({
                        "disabled": disable
                    });
                }
            }
        },

        "createAccManager": function() {
            //add class to parent container for accessibility
            this.$el.parents(".math-utilities-components-tool-holder").addClass("math-utilities-manager")
                .attr("role", "application");

            var accManagerModel = new MathUtilities.Components.Manager.Models.Manager({
                    "isWrapOn": false,
                    "debug": true,
                    "noTextMode": false
                }),
                accManagerView = null,
                DELAY = 20;

            if (MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) {
                this.options.bAllowAccessibility = false;
            }
            accManagerModel.parse(this.model.get('jsonData'));
            accManagerModel.isAccessible = this.options.bAllowAccessibility;
            MathUtilities.Tools.Dgt.Models.DgtEngine.isAccessible = this.options.bAllowAccessibility;
            this.model.engine.accManager = accManagerView = new MathUtilities.Components.Manager.Views.Manager({
                "el": "#tool-holder-8",
                "model": accManagerModel
            });
            accManagerView.loadScreen("geometry-tool");

            //set focus to tool title
            accManagerView.setFocus("math-title-text-8", DELAY);


        },

        "onPropertyMenuFocus": function() {
            var engine = this.model.engine,
                possible = engine.possible,
                focusElem = '',
                propertyMenu = this.getPropertyElem(),
                enablePropertyMenu = _.bind(function(id, elem) {
                    var item = null;
                    for (item in elem) {
                        if (possible.indexOf(elem[item].id) !== -1) {
                            focusElem = focusElem || id;
                            engine.accManager.enableTab(id, true);
                            return;
                        }
                    }
                    engine.accManager.enableTab(id, false);
                }, this),
                menuItem = null;
            this.enablePropertyMenu(true);
            for (menuItem in propertyMenu) {
                enablePropertyMenu(menuItem, propertyMenu[menuItem]);
            }
            engine.accManager.setFocus(focusElem);

        },
        "getPropertyElem": function() {
            var propertyMenu = {
                "construct-container": this.model.construct_menu,
                "transform-container": this.model.transform_menu,
                "measure-container": this.model.measure_menu,
                "display-container": this.model.display_menu,
                "color-text": [{
                    "id": "changeColor"
                }],
                "delete-btn": [{
                    "id": "delete"
                }]
            };
            return propertyMenu;
        },

        "enablePropertyMenu": function(isEnable) {
            var propertyMenu = this.getPropertyElem(),
                elem = null,
                arrElemId = ['start-temp-elem', 'end-temp-elem'],
                $color = this.$('.tool-color-selector');
            for (elem in propertyMenu) {
                arrElemId.push(elem);
            }
            for (elem in $color) {
                arrElemId.push($color[elem].id);
            }
            this.callManagerFn(arrElemId, "enableTab", [isEnable]);
        },

        "shiftFromPropertyToCanvas": function() {
            this.enablePropertyMenu(false);
            this.model.engine.accManager.setFocus('point-highlighter');
        },

        "callManagerFn": function(arrId, functionName, args) {
            var accManager = this.model.engine.accManager,
                id = null,
                parameter = [];
            for (id in arrId) {
                parameter = [arrId[id]].concat(args);
                accManager[functionName].apply(accManager, parameter);
            }

        }
    });
})(window.MathUtilities);
