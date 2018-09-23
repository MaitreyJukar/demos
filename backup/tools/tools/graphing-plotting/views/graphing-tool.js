/* global _, $, window, MathJax*/

(function(MathUtilities) {
    'use strict';

    /**
     * GraphingToolView holds functionality related to adding and deleting equation boxes and plotting them on graph
     * @class GraphingToolView
     * @extends Backbone.View
     * @constructor
     */

    MathUtilities.Tools.Graphing.Views.GraphingToolView = MathUtilities.Components.ToolHolder.Views.ToolHolder.extend({

        /**
         * Holds plotter view object
         * @property _plotterView
         * @type {Object}
         */
        "_plotterView": null,

        /**
         * Holds undoRedoManager model Object
         * @property _undoRedoManager
         * @type {Object}
         */
        "_undoRedoManager": null,

        /**
         * Holds grid graph view Object
         * @property _gridGraphView
         * @type _gridGraphView
         */
        "_gridGraphView": null,

        /**
         * Holds undoRedoManager view Object
         * @property _undoManagerView
         * @type {Object}
         */
        "_undoManagerView": null,

        /**
         * Holds event manager class Object
         * @property _eventManager
         * @type {Object}
         */
        "_eventManager": null,
        "TouchSimulator": MathUtilities.Components.Utils.TouchSimulator,

        /**
         * Holds the height of the keyboard
         *@property _keyboardHeight
         *@type NUMBER
         */
        "_keyboardHeight": null,
        "_loadFileReader": false,
        "_equationPanel": null,

        "_lastBlurList": null,
        "_gridDefaultState": null,
        "_deploy": false,
        "isMathQuillTooltip": true,
        "canvasAcc": null,
        "focusRect": null,
        "previousItem": null,
        "previousParentItem": null,
        "nextParentItem": null,
        "isKeyboardClosed": false,
        "_isDirty": false,
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
                    "toolIconCSS": 'tool-symbol'
                },
                "toolId": {
                    "toolIdText": '4'
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
                    "toolIdText": '4'
                },
                "screenCaptureDiv": {
                    "screenCaptureHolder": '#grid-graph-container'
                }
            }
        },

        /**
         * Initialize method
         * @method initialize
         * @constructor
         */
        "initialize": function() {
            arguments[0].toolId = '4';
            MathUtilities.Tools.Graphing.Views.GraphingToolView.__super__.initialize.apply(this, arguments);

            var el = $("#main"),
                gridGraphView,
                selectedText,
                hideText;
            this._containerElement.append(el);

            this.$el = el;

            this._eventManager = new MathUtilities.Components.EventManager();
            _.bindAll(this, 'render');
            var managerModel = new MathUtilities.Components.Manager.Models.Manager({
                    "isWrapOn": false,
                    "debug": true,
                    "isAccessible": this.model.get('isAccessible')
                }),
                accData = MathUtilities.Tools.Graphing.Models.GraphingToolModel.JSON_DATA;

            managerModel.parse(accData);

            this.accManagerView = new MathUtilities.Components.Manager.Views.Manager({
                "el": '.math-utilities-components-tool-holder',
                "model": managerModel
            });
            this._chartManagerView = new MathUtilities.Tools.Graphing.Views.ChartManager({
                "graphingToolView": this,
                "container": this.$('#grid-graph-container')
            });

            selectedText = this.getAccMessage('selected-text', 0);
            hideText = this.getAccMessage('hide-text', 0);
            this.accManagerView.loadScreen('slider-panel-screen');
            this.accManagerView.loadScreen('button-tooltip-text');
            this._render();
            this._initBootstrapPopup();
            this.addPrecisionSpinner();
            this.setState(this.toolbarState);
            if (this.options.data) {
                if (typeof this.options.data.toolState !== 'undefined') {
                    this.retrieveState(this.options.data.toolState);
                } else {
                    this.retrieveState(this.options.data);
                }
            }
            gridGraphView = this._gridGraphView;
            MathUtilities.Components.ImageManager._paperScope = gridGraphView._paperScope;
            MathUtilities.Components.ImageManager._imageLayer = gridGraphView._projectLayers.imageLayer;
            MathUtilities.Components.ImageManager._fallbackLayer = gridGraphView._projectLayers.gridLayer;
            MathUtilities.Components.ImageManager.init();
            this._imageController = new MathUtilities.Tools.Graphing.Views.ImagesController({
                "graphingTool": this,
                "gridGraph": gridGraphView,
                "plotterView": this._equationPanel.model.get('_equationDataManager').get('_plotterView')
            });
            this.$el.parents('#tool-holder-4').off('keydown.image').on('keydown.image', _.bind(this._keyDownOnTool, this));
            this.initiateMathJaxHandler();
            this.$el.parents('#tool-holder-4').addClass('math-utilities-manager').attr('role', 'application');
            this.accManagerView.unloadScreen('slider-panel-screen');
            this.accManagerView.loadScreen('slider-panel-screen');
            this.accManagerView.loadScreen('base-screen');
            this.accManagerView.loadScreen('error-strings');
            this._initAccessibility();
            this._bindAccessibilityListeners();
            this.changeAccMessage('grid-line', 0, [selectedText, hideText]);
            this.changeAccMessage('label-line', 0, [selectedText, hideText]);
            this.changeAccMessage('axis-line', 0, [selectedText, hideText]);
            this.changeAccMessage('degree-radians-toggle-button', 0, [this.getMessage('radian-text', 0)]);
            this.enableTab('grid-graph-canvas-acc-container', false);
            _.delay(_.bind(function() {
                this.accManagerView.updateFocusRect('math-title-text-4');
                this.setFocus('math-title-text-4');
            }, this), 100);
            this._createCustomToolTips();
            this.createCommonTooltips();
            this.accManagerView.focusIn('input-column', function() {
                $(this).addClass('input-column-zindex');
            });
            this.accManagerView.focusOut('input-column', function() {
                $(this).removeClass('input-column-zindex');
            });
            this.TouchSimulator.enableTouch(this.$('.style-drop-down-option-panel'));
            this.$('#precision-text.spin-textbox-container').on('click', _.bind(function() {
                this.$('#precision-text.spin-textbox-container .textbox-field').focus()
                    .attr('tabindex', this.accManagerView.getTabIndex('precision-text'));
            }, this));
            this.$('.spin-textbox-container .textbox-field').on('blur', _.bind(function() {
                this.$('.spin-textbox-container .textbox-field').removeAttr('tabindex');
            }, this));
            this.listenTo(this.model, 'change:precision', _.bind(this.setPrecision, this));
        },

        "events": {
            "click .chart-setting-selection-btn": 'showChartSettings',
            "click .graph-setting-selection-btn": 'showGraphSettings',
            "click .animate-chart-check": 'animateChartsClicked',
            "click .arrange-to-fit-btn": 'arrangeToFit',
            "click .precision-ok-btn": 'setPrecision',
            "mouseenter .arrange-to-fit-btn, .chart-setting-selection-btn, .graph-setting-selection-btn": 'arrangeToFitHover',
            "mouseleave .arrange-to-fit-btn, .chart-setting-selection-btn, .graph-setting-selection-btn": 'arrangeToFitLeave',
            "mousedown .arrange-to-fit-btn, .chart-setting-selection-btn, .graph-setting-selection-btn": 'arrangeToFitDown',
            "mouseup .arrange-to-fit-btn, .chart-setting-selection-btn, .graph-setting-selection-btn": 'arrangeToFitUp',
            "mouseenter .precision-ok-btn, .chart-setting-selection-btn, .graph-setting-selection-btn": 'precisionOkHover',
            "mouseleave .precision-ok-btn, .chart-setting-selection-btn, .graph-setting-selection-btn": 'precisionOkLeave',
            "mousedown .precision-ok-btn, .chart-setting-selection-btn, .graph-setting-selection-btn": 'precisionOkDown',
            "mouseup .precision-ok-btn, .chart-setting-selection-btn, .graph-setting-selection-btn": 'precisionOkUp',
            "click .color": '_setColorCode',
            "click .change-thickness": '_changeThickness',
            "click #add-item": '_toggleItemBox',
            "click #save-state": 'callSaveState',
            "click #import-csv": 'callCSV',
            "click #retrieve-state": 'callRetrieveState',
            "click #degree": '_setEquationUnitDegree',
            "click #radian": '_setEquationUnitRadians',
            "click #degree-radians-toggle-button": '_toggleDegreeRadians',
            "change #file-input": '_callAddImage',
            "click .duplicate": '_createDuplicatelist',
            "keydown #equalize-axis": "_graphEqualize",
            "click .textbox-container, .chart-textbox, .chart-window .spin-textbox-container, .constant-textarea-holder, .slider-settings-textbox-container, .textbox-container": "_setTabIndexToInputBox",
            "blur .constant-textarea-holder input, .slider-settings-textbox-container input, .textbox-container input, .chart-textbox input, .chart-window .spin-textbox-container input": "_removeInputBoxTabIndex",
            "focus .constant-textarea-holder, .constant-slider-options-row .constant-name-cell-text, .all-constants-checkbox-container, .chart-options-container div": "_updateFocusRectForSliderInputBoxes",
            "keydown .chart-setting-selection-btn, .arrange-to-fit-btn": "_keyDownOnChartSetting",
            "keydown .graph-setting-selection-btn , .radian-option-container": "_ShiftTabOnGraphsSetting",
            "keydown #grid-graph-container": "_keyDownOnGridGraphContainer",
            "keydown #delete-image": "_focusOutOnDeleteImage",
            "focusin #precision-text, .setting-graph-precision-section": "_setPrecisionTextAcc",
            "focusin .spin-up-arrow, .spin-down-arrow": "_setDefaultSpinnerAccOnFocus",
            "click .spin-up-arrow, .spin-down-arrow": "_updateSpinnerAccOnClick",
            "focusin #undo-graph, #slider-title-holder": "_disableGraphAndChartAcc",
            "focusin #grid-graph-container , #slider-delete-icon-holder": "focusOnGridGraph",
            "keydown .graphing-tool-modal-label": "_handleShiftTabOnModalTitle",
            "keydown .modal .btn-cancel, .modal .btn-primary": "_handleTabOnModalBtn",
            "keydown .degree-option-container, .radian-option-container, .radio-btn-circle": "processKeyEventsOnRadioBtn",
            "focus .degree-option-container, .radian-option-container, .radio-btn-circle": "adjustTabIndex",
            "focusout .degree-option-container, .radian-option-container, .radio-btn-circle": "readjustTabIndex",
            "focusin .manual-scroll": "_manualScroll"
        },

        "_resizeTool": function(event, skipToolHolderResize) {
            if (event.target !== window) {
                return;
            }
            var $elCurrent = this.$el,
                ToolHolderView = MathUtilities.Tools.Graphing.Views.GraphingToolView.__super__,
                toolHolderSize, MAX_COLUMN_WIDTH = 348,
                columnWidth,
                margin, newSize, titleHeight, gridWidth, gridHeight;
            if (!skipToolHolderResize) {
                ToolHolderView._resizeTool.call(this, event);
            }
            toolHolderSize = ToolHolderView.getToolSize.call(this);
            $elCurrent.height(toolHolderSize.height);
            $elCurrent.width(toolHolderSize.width);

            newSize = {
                "width": toolHolderSize.width,
                "height": toolHolderSize.height
            };
            titleHeight = this.$('#title').height();

            columnWidth = Math.min(this.$('#input-column').width(), MAX_COLUMN_WIDTH);

            if (this.model.get('_columnHidden')) {
                gridWidth = $elCurrent.width();
            } else {
                gridWidth = $elCurrent.width() - columnWidth;
            }
            gridHeight = newSize.height - titleHeight;
            if (this.$('#input-column').is(':visible')) {
                margin = columnWidth;
            } else {
                margin = 0;
            }
            this.$('#grid-graph-container, #grid-graph-canvas-acc-container, #grid-graph-container-acc-elem')
                .width(gridWidth)
                .height(gridHeight)
                .css('margin-left', margin + 'px');

            this.$('#input-column').height(gridHeight);
            this.$('#grid-graph')
                .width(gridWidth)
                .height(gridHeight);

            this._updateListBoxHeight(true);
            this._gridGraphView.canvasResize(true);
            _.delay(_.bind(function() {
                this._updateChartsSizes();
            }, this), 500);
            if (this.focusRect) {
                this._focusOut();
            }
        },


        "snapshot": function(callback) {
            var prevWidth = this.$('#input-column').width(),
                prevMargin = this.$("#grid-graph-container").css('margin-left'),
                self = this,
                screenShotSize,
                PADDING = MathUtilities.Components.ToolHolder.Models.TopToolbar.TOP_TOOLBAR_HEIGHT +
                MathUtilities.Components.ToolHolder.Models.BottomToolbar.BOTTOM_TOOLBAR_HEIGHT + this.$('#title').height(),
                gridGraph = this._gridGraphView,
                $addSliderContainerArray = this.$('.slider-box-container:visible').addClass('visible'),
                continueWithScreenshot,
                BEST_FIT_WIDTH = 250,
                MAX_SCREENSHOT_SIZE = MathUtilities.Components.Utils.Models.ScreenUtils.MAX_SCREENSHOT_SIZE;

            this.prevListHeight = this.$('#input-data').height();
            this.setVisibilityScreenshotPreparationModal(true);
            //set 100% height
            this.$('#input-data').height('100%');
            this._setToolSizeForSnapShot(false);
            screenShotSize = this.getScreenShotSize();
            continueWithScreenshot = _.bind(function() {
                this.$('#input-column').removeClass('add-background');
                this.$('#keyboard-title-container, #slider-title-holder, .fade-out').hide();
                $addSliderContainerArray.hide();
                if (screenShotSize.cropped && screenShotSize.canvas[1] > MAX_SCREENSHOT_SIZE.height) {
                    this.$('#input-data').height(MAX_SCREENSHOT_SIZE.height);
                    this._callResizeTool({
                        "height": MAX_SCREENSHOT_SIZE.height + PADDING,
                        "width": screenShotSize.canvas[0] + screenShotSize.equationPanelWidth
                    });
                }
                this.setEquationPanelWidth(screenShotSize.equationPanelWidth);
                this.$('.list-header-description.visible').width(BEST_FIT_WIDTH);
                gridGraph.updateSizeForScreenshot(this._gridGraphView.getSizeForGraphScreenshot());
                _.delay(_.bind(function() {
                    MathUtilities.Components.Utils.Models.ScreenUtils.getScreenShot({
                        "container": "#input-column-graph-container",
                        "debug": false,
                        "type": MathUtilities.Components.Utils.Models.ScreenUtils.types.BASE64,
                        "complete": function(data) {
                            callback.call(self, data);
                            self.photoshootDone(prevWidth, prevMargin);
                        }
                    });
                }, this), 1000);
            }, this);

            MathUtilities.Components.Utils.Models.ScreenUtils.confirmScreenshotSize(screenShotSize, continueWithScreenshot, this.setVisibilityScreenshotPreparationModal);
        },

        "setVisibilityScreenshotPreparationModal": function(visible) {
            var graphingSelectorForOverflow = '#math-tool-container-4, #input-data, #input-column-graph-container, .equation-box-container, .equation-box, .equation-box .row, .list-header-description.visible, .list-header-description-container, .charts-container',
                graphingSelectorForGradient = '.list-header-container, #show-column-icon, #show-column, .graph-style-edit-options';

            if (visible) {
                $(graphingSelectorForOverflow).css("overflow", "visible");
                $(graphingSelectorForGradient).addClass('snapshot');
            } else {
                $(graphingSelectorForOverflow).css("overflow", "hidden");
                this.$('#input-data').css({
                    "overflow-x": "hidden",
                    "overflow-y": "auto"
                });
                $(graphingSelectorForGradient).removeClass('snapshot');
                this._setToolSizeForSnapShot(true);
            }
        },

        "_setToolSizeForSnapShot": function(isSnapShotDone) {
            var windowHeight = $('.tool-holder-tool-container').height(),
                windowWidth = $('.tool-holder-tool-container').width(),
                toolSize = {
                    "height": null,
                    "width": null
                },
                MAX_SCREENSHOT_SIZE = MathUtilities.Components.Utils.Models.ScreenUtils.MAX_SCREENSHOT_SIZE,
                prevHeight = this.prevListHeight,
                heightDiff;

            if (isSnapShotDone) {
                //set prevHeight
                heightDiff = prevHeight - this.$('#input-data').height();
                toolSize.width = '100%';
            } else {
                heightDiff = this.$('#input-data').height() - prevHeight;
                if (heightDiff < 0) {
                    this.$('#input-data').height(prevHeight);
                    return;
                }
                toolSize.width = windowWidth + heightDiff;
                if (toolSize.width > MAX_SCREENSHOT_SIZE.width) {
                    toolSize.width = MAX_SCREENSHOT_SIZE.width;
                }
            }
            toolSize.height = windowHeight + heightDiff;
            this._callResizeTool(toolSize);
        },

        "_callResizeTool": function(toolHolderSize) {
            var dummyEvent = new $.Event("keydown"),
                ToolHolderView = MathUtilities.Tools.Graphing.Views.GraphingToolView.__super__;

            dummyEvent.isCustomEvent = true;
            dummyEvent.target = window;
            $('.tool-holder-tool-container').width(toolHolderSize.width);
            ToolHolderView.setToolHolderContainerHeight(toolHolderSize.height);
            this._resizeTool(dummyEvent, true);
        },

        "setEquationPanelWidth": function(width) {
            if (!this.model.get('_columnHidden')) {
                this._equationPanel._updateListWidth(width);
                this.$('#input-column-graph-container').width(this.$('#input-column').width() + this.$('#grid-graph-container').width());
                this.$('#grid-graph-container').css({
                    "margin-left": this.$('#input-column').width()
                });
            }
        },

        "getScreenShotSize": function() {
            var equationPanelWidth = this.getMaxWidth(),
                equationPanelMinWidth = Number(this.$('#input-column').css('min-width').split('px')[0]),
                gridWidth = this.$('#grid-graph-container').width(),
                gridHeight = this.$('#grid-graph-container').height(),
                sizeWidth = equationPanelWidth + gridWidth,
                sizeHeight = this.$('#input-column-graph-container').height(),
                cropped = false,
                screenShotSize = {
                    "canvas": [gridWidth, gridHeight],
                    "grid": this._gridGraphView.getLimits(),
                    "cropped": cropped,
                    "equationPanelWidth": equationPanelWidth
                },
                MAX_SCREENSHOT_SIZE = MathUtilities.Components.Utils.Models.ScreenUtils.MAX_SCREENSHOT_SIZE;

            if (sizeWidth > MAX_SCREENSHOT_SIZE.width) {
                cropped = true;
                equationPanelWidth = MAX_SCREENSHOT_SIZE.width - gridWidth;
                if (equationPanelWidth < equationPanelMinWidth) {
                    gridWidth += equationPanelMinWidth - equationPanelWidth;
                    equationPanelWidth = equationPanelMinWidth;
                    screenShotSize.grid = this._gridGraphView.getSizeForGraphScreenshot().grid;
                }
            } else if (equationPanelWidth < equationPanelMinWidth) {
                equationPanelWidth = equationPanelMinWidth;
            }
            if (sizeHeight > MAX_SCREENSHOT_SIZE.height) {
                cropped = true;
            }
            screenShotSize.canvas = [gridWidth, gridHeight];
            screenShotSize.cropped = cropped;
            screenShotSize.equationPanelWidth = equationPanelWidth;
            return screenShotSize;
        },

        "getMaxWidth": function() {
            if (this.model.get('_columnHidden')) {
                return 0;
            }
            var $currentList, maxWidth,
                counter = 0,
                currentWidth;

            this.$('.list').each(function() {
                $currentList = $(this);
                currentWidth = $currentList.find('.equation-box').outerWidth();
                counter++;
                if (!maxWidth || maxWidth < currentWidth) {
                    maxWidth = currentWidth;
                }
            });
            return maxWidth;
        },

        "photoshootDone": function(prevWidth, prevMargin) {
            this.setVisibilityScreenshotPreparationModal(false);
            this.$('#input-column').addClass('add-background');
            this.$('#keyboard-title-container, #slider-title-holder, .slider-box-container.visible, .fade-out').show();
            this.$('.slider-box-container.visible').removeClass('visible');
            this.$('.list-header-description.visible').width('auto');
            if (!this.model.get('_columnHidden')) {
                this._equationPanel._updateListWidth(prevWidth);
                this.$('#input-column-graph-container').width('100%');
                this.$('#grid-graph-container').css({
                    "margin-left": prevMargin
                });
            }
        },

        "_manualScroll": function(event) {
            var keyBoardTitlePosition = this.$('#keyboard-title-container').offset(),
                $inputBox = this.$('#input-data'),
                $currentFocusElement = $(event.target).hasClass('acc-read-elem') ? $(event.target).parent() : $(event.target);
            if (keyBoardTitlePosition.top < $currentFocusElement.offset().top + $currentFocusElement.height()) {
                $inputBox.scrollTop($inputBox.scrollTop() + $currentFocusElement.offset().top + $currentFocusElement.height() - keyBoardTitlePosition.top);
            }
        },

        "focusOnGridGraph": function() {
            this._equationPanel._sliderPanel.hideSliderSettings();
        },

        "_keyDownOnGridGraphContainer": function(event) {
            var $chart, chartLength, index, topChart, tabIndex, dummyEvent, $currentChart;
            //set focus to chart or canvas
            if ($(event.target).parent().attr('id') === 'grid-graph-container') {
                if ([32, 13].indexOf(event.keyCode) > -1) { // space and enter key
                    $chart = this.$('.chart-window');
                    chartLength = $chart.length;
                    tabIndex = 0;
                    for (index = 0; index < chartLength; index++) {
                        $currentChart = $chart.eq(index);
                        this.enableTab($currentChart.attr('id'), true);
                        if ($currentChart.css('z-index') > tabIndex && $currentChart.css('display') !== 'none') {
                            tabIndex = $currentChart.css('z-index');
                            topChart = $currentChart.attr('id');
                        }
                    }
                    this.enableTab('grid-graph-canvas-acc-container', true);
                    if (topChart) {
                        this.setFocus(topChart);
                    } else if (this.canvasAcc.model.getCollectionItems().length > 0) {
                        dummyEvent = $.Event("keydown"); // trigger keydown event
                        dummyEvent.keyCode = 32; //space key
                        this.$('#grid-graph-canvas-acc-container').trigger(dummyEvent);
                    } else {
                        this.enableTab('grid-graph-canvas-acc-container', false);
                        return void 0;
                    }
                    this.enableTab('grid-graph-container', false);
                }
            }
        },

        "_disableGraphAndChartAcc": function() {
            var $chart, chartLength, index;
            if ($('#grid-graph-container-acc-elem').attr('tabindex') === '-1') {
                $chart = this.$('.chart-window');
                chartLength = $chart.length;
                for (index = 0; index < chartLength; index++) {
                    this.enableTab($($chart[index]).attr('id'), false);
                }
                this.enableTab('grid-graph-canvas-acc-container', false);
                this.enableTab('grid-graph-container', true);
            }
        },

        "_ShiftTabOnGraphsSetting": function(event) {
            if (event.keyCode === 9 && event.shiftKey === true && $(event.target).parent().attr('id') !== 'radian-option-container') { // tab key
                this.setFocus('settings', 10);
                this.$('#options-container').hide();
                this.$('#settings').removeClass('activated');
            } else if (event.keyCode === 9 && event.shiftKey === false) { //tab key
                this.accManagerView.unloadScreen('graph-settings');
                this.enableTab('graph-settings-x-axis-label', false);
                this.enableTab('graph-settings-y-axis-label', false);
                this.enableTab('graph-settings-value-label', false);
                this.setFocus('chart-setting-selection-btn', 10);
            }
        },
        "_keyDownOnChartSetting": function(event) {
            if (event.keyCode === 9 && event.shiftKey === false) { //tab key
                this.setFocus('math-tool-btn-screenshot-4', 10);
                this.$('#options-container').hide();
                this.$('#settings').removeClass('activated');
            }
        },

        "_handleShiftTabOnModalTitle": function(event) {
            var $eventCurrentTarget = $(event.currentTarget),
                $modal = $eventCurrentTarget.parents('.modal');
            if (event.keyCode === 9 && event.shiftKey) { // tab key
                event.preventDefault();
                if ($modal.find('.btn-cancel').css('display') === 'none') {
                    this.setFocus($modal.find('.btn-primary').attr('id'));
                } else {
                    this.setFocus($modal.find('.btn-cancel').attr('id'));
                }
            }
        },

        "_handleTabOnModalBtn": function(event) {
            var $eventCurrentTarget = $(event.currentTarget),
                shiftFocus,
                $modal = $eventCurrentTarget.parents('.modal');
            if (event.keyCode === 9 && event.shiftKey === false) { // tab key
                if ($eventCurrentTarget.hasClass('btn-primary') && $modal.find('.btn-cancel').css('display') === 'none') {
                    shiftFocus = true;
                } else {
                    if ($eventCurrentTarget.hasClass('btn-cancel')) {
                        shiftFocus = true;
                    }
                }
                if (shiftFocus) {
                    event.preventDefault();
                    this.setFocus($modal.find('.graphing-tool-modal-label').attr('id'));
                }
            }
        },

        "_triggerFileInput": function(event) {
            var $file;
            if (this._loadFileReader === false) {
                this._callAddImage(event);
            } else {
                this.$('#file-input').remove();
                this.$el.append('<input id="file-input" type="file" />');
                $file = this.$('#file-input');
                $file.on('change', _.bind(function() {
                    this._imageController._addNewImage(this.$('#file-input'));
                }, this));
                $file.trigger('click');
            }
        },
        "_callAddImage": function(event) {
            this._imageController.callAddImage(event, this._loadFileReader);
        },

        "_callDelteImage": function(event) {
            this._imageController.callDeleteImage(event);
            this.addAllPaperItems(false);
            this.previousParentItem = this.previousItem = this.nextParentItem = null;
            this.$('#grid-graph-canvas-acc-container-acc-elem').removeClass('hide-outline');
            this.setFocus('degree-radians-toggle-button');
            if (this.focusRect) {
                this.focusRect.opacity = 0;
            }
        },
        "showDeleteImage": function() {
            this.$('#delete-image').show();
        },
        "hideDeleteImage": function() {
            this.$('#delete-image').hide();
        },
        /**
         * _render view and appends elements
         * @method _render
         * @constructor
         * @return void
         */
        "_render": function() {
            var $options,
                $elCurrent = this.$el,
                //remove previous options and add new options div
                $showColumn = this.$('#show-column'),
                gridGraphOptions,
                data,
                inputColumnWidth, $yLabelsRadiansChkBox, $xLabelsRadiansChkBox,
                $hideColumn = this.$('#hide-column'),
                $undoGraph = this.$('#undo-graph'),
                $redoGraph = this.$('#redo-graph'),
                $deleteAll = this.$('#delete-all'),
                $degree = this.$('#degree'),
                $radian = this.$('#radian'),
                $xLabelsRadians = this.$('#x-axis-label-chk-box'),
                $yLabelsRadians = this.$('#y-axis-label-chk-box'),
                $settings = this.$('#settings'),
                $gridLine = this.$('#grid-line'),
                $axesLine = this.$('#axis-line'),
                $labelLine = this.$('#label-line'),
                $addImage = this.$('#add-image'),
                $deleteImage = this.$('#delete-image'),
                $reset = this.$('#delete-all'),
                $equalAxis = this.$('#equalize-axis'),
                $yAxisLabel,
                $xAxisLabel,
                $gridGraphContainer,
                $elementsArray = [$settings, $reset, $addImage, $deleteImage, $undoGraph, $redoGraph, $degree, $degree.parent(), $radian, $radian.parent(), $labelLine, $axesLine,
                    $gridLine, $yAxisLabel, $equalAxis, $xAxisLabel, $showColumn,
                    this.$('.graphing-tool-editor-color-style-box'),
                    this.$('.graphing-tool-editor-best-fit-style-container'),
                    this.$('.graphing-tool-editor-data-analysis-label'),
                    this.$('.graphing-tool-editor-residual-style-container')
                ],
                mouseEnterFunctionForAxesAndLabels,
                mouseLeaveFunctionForAxesAndLabels,
                rationalNumberText = this.getAccMessage('rational-number-text', 0),
                multipleOfPiText = this.getAccMessage('multiples-of-pi-text', 0),
                selectedText = this.getAccMessage('selected-text', 0),
                deselectedText = this.accManagerView.getAccMessage('deselected-text', 0),
                unselectedText = '',
                checkedText = this.getAccMessage('checked-text', 0),
                uncheckedText = this.getAccMessage('unchecked-text', 0),
                hideText = this.getAccMessage('hide-text', 0),
                showText = this.getAccMessage('show-text', 0),
                gridLineAccText = this.getAccMessage('grid-line', 0, [selectedText, hideText]),
                labelLineAccText = this.getAccMessage('label-line', 0, [selectedText, hideText]),
                axisLineAccText = this.getAccMessage('axis-line', 0, [selectedText, hideText]);

            $options = MathUtilities.Tools.Graphing.templates['graph-settings']().trim();
            this.$('#grid-graph-container').prepend($options);
            $yAxisLabel = this.$('#y-axis-label-container');
            $xAxisLabel = this.$('#x-axis-label-container');
            $elCurrent.parent().height($elCurrent.parent().height());
            $elCurrent.height($elCurrent.parent().height());
            $elCurrent.width($elCurrent.parent().width());
            data = $elCurrent.width() - this.$('#input-column').width();
            this.$('#grid-graph-container,#grid-graph-canvas-acc-container').width(data)
                .css('margin-left', $('#input-column').width() + 'px').attr('data-left-margin', $('#input-column').width())
                .height($elCurrent.height() - this.$('#title').height());
            this.$('#input-column').height($elCurrent.height() - this.$('#title').height());
            $undoGraph.on('click', _.bind(this._callUndo, this));
            $redoGraph.on('click', _.bind(this._callRedo, this));
            $deleteAll.on('click', _.bind(this._showCustomPopup, this));
            $settings.on('click', _.bind(this._toggleOptionsHandler, this));
            $hideColumn.on('click', _.bind(this._hideColumnHandler, this));
            $showColumn.on('click', _.bind(this._showColumnHandler, this));
            $addImage.on('click', _.bind(this._triggerFileInput, this));
            $deleteImage.on('click', _.bind(this._callDelteImage, this));
            this.$('#hide-column').on('mousedown', function() {
                $(this).addClass('activated');
            }).on('mouseup', function() {
                $(this).removeClass('activated');
            });
            // hide show button
            $showColumn.hide();
            // options for grid graph
            gridGraphOptions = {
                "canvasId": 'grid-graph',
                "zoomInButton": 'zoom-in',
                "zoomOutButton": 'zoom-out',
                "restoreDefaultZooming": 'zoom-default',
                "XLowerTextBox": 'x-lower',
                "XUpperTextBox": 'x-upper',
                "YLowerTextBox": 'y-lower',
                "YUpperTextBox": 'y-upper',
                "equalizeAxisScaleButton": 'equalize-axis',
                "equalizeAxisScaleLabel": 'equalize-axis-text',
                "xAxisLableStyleButton": 'toggle-x-axis-label-style',
                "yAxisLabelStyleButton": 'toggle-y-axis-label-style',
                "graphTypeButton": 'graph-type',
                "polarAngleLinesButton": 'degree-radians',
                "gridLineDisplayButton": 'grid-line-icon',
                "labelLineDisplayButton": 'label-line-icon',
                "axesLinesDisplayButton": 'axis-line-icon',
                "projectorModeButton": 'projector-mode',
                "polarAngleInDegree": 'polar-radian',
                "polarAngleInRadian": 'polar-degree',
                "doNotbindMouseMove": true
            };

            // create grid graph
            this._gridGraphView = new MathUtilities.Components.Graph.Views.GridGraph({
                "el": '#grid-graph-container',
                "option": gridGraphOptions
            });

            this._equationPanel = new MathUtilities.Tools.Graphing.Views.EquationPanel({
                "el": '#input-column',
                "_chartManagerView": this._chartManagerView,
                "_graphingToolView": this,
                "accManagerView": this.accManagerView
            });
            this._gridGraphView.on('graph:equalize', _.bind(function() {
                    this.$('#equalize-axis-chk-box, #equalize-axis').addClass('activated');
                    if (this.isAccDivPresent(this.$('#equalize-axis'))) {
                        this.changeAccMessage('equalize-axis', 0, [selectedText]);
                    }
                    this.setDocumentDirty();
                }, this)).on('graph:un-equalize', _.bind(function() {
                    this.$('#equalize-axis-chk-box, #equalize-axis').removeClass('activated');
                    if (this.isAccDivPresent(this.$('#equalize-axis'))) {
                        this.changeAccMessage('equalize-axis', 0, [unselectedText]);
                    }
                    this.setDocumentDirty();
                }, this))
                .on('graph:limits-changed zooming', _.bind(this.setDocumentDirty, this))
                .on('graph:projector-mode-on', _.bind(this._equationPanel._projectorModeOn, this._equationPanel))
                .on('graph:projector-mode-off', _.bind(this._equationPanel._projectorModeOff, this._equationPanel));


            this.on('show-tooltip', _.bind(this._equationPanel._showTooltip, this._equationPanel))
                .on('hide-tooltip', _.bind(this._equationPanel._hideTooltip, this._equationPanel))
                .on('image-filetype-error', _.bind(function() {
                    this.model.trigger('image-filetype-error');
                }, this._equationPanel)).on('add-paper-items', _.bind(this.addAllPaperItems, this));
            this._equationPanel.on('set-popup-open', _.bind(function() {
                this.model.set('_anyPopupOpen', true);
            }, this));
            this._equationPanel.on('hide-tooltip', _.bind(this._hideToolTip, this)).off('hide-tooltip', _.bind(this._hideToolTip, this));
            this._equationPanel.on('show-tooltip', _.bind(this._showToolTip, this)).off('show-tooltip', _.bind(this._showToolTip, this));
            this._gridDefaultState = this._gridGraphView.getAttribute();
            this._gridDefaultState = $.extend(true, {}, this._gridDefaultState);
            // adjust graph size according to canvas
            this._gridGraphView.canvasResize();
            this._eventManager.listenTo(this.$('#grid-graph-container')[0], MathUtilities.Components.EventManager.prototype.STATES.TOUCHSTART,
                this._hideHandler, this);
            this._keyboardHeight = this.$('#keyboardHolder').height() + this.$('#keyboard-title-container').height();
            // append slider box container in equation box
            this.$el.on('vmkClickStart', '.mathquill-editable', _.bind(this._vmlButtonClicked, this))
                .on('vmkClickEnd', '.mathquill-editable', _.bind(this._vmkButtonClickEnd, this));

            // UndoManager Object
            this._undoRedoManager = new MathUtilities.Components.Undo.Models.UndoManager({
                "maxStackSize": 20
            });
            this._undoManagerView = new MathUtilities.Components.Undo.Views.UndoManager({
                "el": this.$el.parents('.math-utilities-components-tool-holder')
            });

            this._undoManagerView.on('undo:actionPerformed', _.bind(function() {
                this._callUndo();
            }, this));
            this._undoManagerView.on('redo:actionPerformed', _.bind(function() {
                this._callRedo();
            }, this));
            _.each($elementsArray, _.bind(function(value) {
                this.TouchSimulator.enableTouch(value);
            }, this));


            //Changed Toggle Class to addClass and removeClass to fix touch and type as enable Touch fires mouseleave and not mouseenter on mouseclick

            $settings.on('mouseenter mousedown', function() {
                $settings.addClass('hovered');
            }).on('mouseleave mouseup', _.bind(function(event) {
                if (this.removeHover(event)) {
                    $settings.removeClass('hovered');
                }
            }, this));


            $reset.on('mouseenter mousedown', function() {
                $(this).addClass('hovered');
            }).on('mouseleave mouseup', _.bind(function(event) {
                if (this.removeHover(event)) {
                    $reset.removeClass('hovered');
                }
            }, this));
            $undoGraph.on('mouseenter mousedown', _.bind(function(event) {
                $undoGraph.addClass('hovered');
                this.enableTab('grid-graph-canvas-acc-container', false);
            }, this)).on('mouseleave mouseup', _.bind(function(event) {
                if (this.removeHover(event)) {
                    $undoGraph.removeClass('hovered');
                }
            }, this));

            $redoGraph.on('mouseenter mousedown', function() {
                $redoGraph.addClass('hovered');
            }).on('mouseleave mouseup', _.bind(function(event) {
                if (this.removeHover(event)) {
                    $redoGraph.removeClass('hovered');
                }
            }, this));

            $degree.on('mouseenter mousedown', function() {
                    $degree.addClass('hovered');
                }).on('mouseleave mouseup', _.bind(function(event) {
                    if (this.removeHover(event)) {
                        $degree.removeClass('hovered');
                    }
                }, this))
                .parent().on('mouseenter mousedown', function() {
                    $degree.addClass('hovered');
                }).on('mouseleave mouseup', _.bind(function(event) {
                    if (this.removeHover(event)) {
                        $degree.removeClass('hovered');
                    }
                }, this));

            $radian.on('mouseenter mousedown', function() {
                    $radian.addClass('hovered');
                }).on('mouseleave mouseup', _.bind(function(event) {
                    if (this.removeHover(event)) {
                        $radian.removeClass('hovered');
                    }
                }, this))
                .parent().on('mouseenter mousedown', function() {
                    $radian.addClass('hovered');
                }).on('mouseleave mouseup', _.bind(function(event) {
                    if (this.removeHover(event)) {
                        $radian.removeClass('hovered');
                    }
                }, this));
            $addImage.on('mouseenter mousedown', function() {
                $addImage.addClass('hovered');
            }).on('mouseleave mouseup', _.bind(function(event) {
                if (this.removeHover(event)) {
                    $addImage.removeClass('hovered');
                }
            }, this));
            $deleteImage.on('mouseenter mousedown', function() {
                $deleteImage.addClass('hovered');
            }).on('mouseleave mouseup', _.bind(function(event) {
                if (this.removeHover(event)) {
                    $deleteImage.removeClass('hovered');
                }
            }, this));

            $labelLine.on('mouseenter mousedown', function(event) {
                $labelLine.find('#label-line-icon').addClass('hovered').parent(event).addClass('hovered');
            }).on('mouseleave mouseup', _.bind(function(event) {
                if (this.removeHover(event)) {
                    $labelLine.find('#label-line-icon').removeClass('hovered').parent(event).removeClass('hovered');
                }
            }, this));

            $axesLine.on('mouseenter mousedown', function(event) {
                $axesLine.find('#axis-line-icon').addClass('hovered').parent(event).addClass('hovered');
            }).on('mouseleave mouseup', _.bind(function(event) {
                if (this.removeHover(event)) {
                    $axesLine.find('#axis-line-icon').removeClass('hovered').parent(event).removeClass('hovered');
                }
            }, this));

            $gridLine.on('mouseenter mousedown', function(event) {
                $gridLine.find('#grid-line-icon').addClass('hovered').parent(event).addClass('hovered');
            }).on('mouseleave mouseup', _.bind(function(event) {
                if (this.removeHover(event)) {
                    $gridLine.find('#grid-line-icon').removeClass('hovered').parent(event).removeClass('hovered');
                }
            }, this));

            mouseEnterFunctionForAxesAndLabels = function() {
                $(this).addClass('hovered');
            };

            mouseLeaveFunctionForAxesAndLabels = _.bind(function(event) {
                if (this.removeHover(event)) {
                    $(this).removeClass('hovered');
                }
            }, this);

            $yAxisLabel.on('mouseenter mousedown', mouseEnterFunctionForAxesAndLabels)
                .on('mouseleave mouseup', mouseLeaveFunctionForAxesAndLabels);

            $equalAxis.on('mouseenter mousedown', mouseEnterFunctionForAxesAndLabels)
                .on('mouseleave mouseup', mouseLeaveFunctionForAxesAndLabels);

            $xAxisLabel.on('mouseenter mousedown', mouseEnterFunctionForAxesAndLabels)
                .on('mouseleave mouseup', mouseLeaveFunctionForAxesAndLabels);

            $showColumn.on('mouseenter mousedown', mouseEnterFunctionForAxesAndLabels)
                .on('mouseleave mouseup', mouseLeaveFunctionForAxesAndLabels);


            $(document).on('mousedown', _.bind(this._hideHandler, this));

            this._gridGraphView._paperScope.view.onResize = _.bind(function() {
                var $currentEl = this.$el;
                $currentEl.height($currentEl.height());
                $gridGraphContainer = $currentEl.find('#grid-graph-container');
                if (this.$('#input-column').css('display') === 'none') {
                    inputColumnWidth = 0;
                } else {
                    inputColumnWidth = parseFloat($gridGraphContainer.attr('data-left-margin'));
                }
                $gridGraphContainer.width($currentEl.width() - inputColumnWidth).css('margin-left', inputColumnWidth + 'px');
                $gridGraphContainer.height($currentEl.height() - $currentEl.find('#title').height());
                this._gridGraphView.canvasResize();
            }, this);
            $degree = this.$('#degree');
            $radian = this.$('#radian');
            $xLabelsRadiansChkBox = this.$('#x-axis-label-chk-box');
            $yLabelsRadiansChkBox = this.$('#y-axis-label-chk-box');
            $xLabelsRadians = this.$('#x-labels-in-radian');
            $yLabelsRadians = this.$('#y-labels-in-radian');
            /*degree-radian marker style change*/
            /*toggle degree-radian class as default is radian*/

            this.$('#radian').on('click', function() {
                $degree.removeClass('activated');
                $radian.addClass('activated');
            });
            this.$('#degree').on('click', function() {
                $degree.addClass('activated');
                $radian.removeClass('activated');
            });
            /*x-axis marker style change*/
            /*set degree as default active*/
            $xAxisLabel.on('click', _.bind(function(event) {
                $xLabelsRadiansChkBox.toggleClass('activated');
                $xLabelsRadians.toggleClass('activated');
                if (this.isAccDivPresent($(event.target))) {
                    if (this.$('#x-axis-label-chk-box').hasClass('activated')) {
                        this.changeAccMessage('x-axis-label-container', 0, [checkedText, 'x', rationalNumberText]);
                    } else {
                        this.changeAccMessage('x-axis-label-container', 0, [uncheckedText, 'x', multipleOfPiText]);
                    }
                    this.setFocus('x-axis-label-container');
                }
                this.setDocumentDirty();
            }, this));

            /*y-axis marker style change*/
            /*set degree as default active*/
            $yAxisLabel.on('click', _.bind(function(event) {
                $yLabelsRadiansChkBox.toggleClass('activated');
                $yLabelsRadians.toggleClass('activated');
                if (this.isAccDivPresent($(event.target))) {
                    if (this.$('#y-axis-label-chk-box').hasClass('activated')) {
                        this.setAccMessage('y-axis-label-container', this.getAccMessage('x-axis-label-container', 0, [checkedText, 'y', rationalNumberText]));
                    } else {
                        this.setAccMessage('y-axis-label-container', this.getAccMessage('x-axis-label-container', 0, [uncheckedText, 'y', multipleOfPiText]));
                    }
                    this.setFocus('y-axis-label-container');
                }
                this.setDocumentDirty();
            }, this));

            /*label-line button style change*/
            this.$('#label-line').on('click', _.bind(function() {
                this.$('#label-line-icon').toggleClass('activated');
                this.$('#label-line').toggleClass('activated');
                if (this.$('#label-line').hasClass('activated')) {
                    this.setAccMessage('label-line', labelLineAccText);
                } else {
                    this.changeAccMessage('label-line', 0, [deselectedText, showText]);
                }
                this.setFocus('label-line');
                this._gridGraphView.callLabelDisplayChange();
                this.setDocumentDirty();
            }, this));
            /*grid-line button style change*/
            this.$('#grid-line').on('click', _.bind(function() {
                this.$('#grid-line-icon, #grid-line').toggleClass('activated');
                if (this.$('#grid-line').hasClass('activated')) {
                    this.setAccMessage('grid-line', gridLineAccText);
                } else {
                    this.changeAccMessage('grid-line', 0, [deselectedText, showText]);
                }
                this.setFocus('grid-line');
                this._gridGraphView.callGridDisplayChange();
                this.setDocumentDirty();
            }, this));
            /*axis-line button style change*/
            this.$('#axis-line').on('click', _.bind(function() {
                this.$('#axis-line-icon').toggleClass('activated');
                this.$('#axis-line').toggleClass('activated');
                this._gridGraphView.callAxisDisplayChange();
                if (this.$('#axis-line').hasClass('activated')) {
                    this.setAccMessage('axis-line', axisLineAccText);
                } else {
                    this.changeAccMessage('axis-line', 0, [deselectedText, showText]);
                }
                this.setFocus('axis-line');
                this.setDocumentDirty();
            }, this));
            this.accManagerView.loadScreen('keyboard-tab-screen');
            $('#math-tool-btn-screenshot-4').addClass('screenshot-btn');
            if ($.support.touch) {
                this.openKeyboard();
            } else {
                // delay required to close keyboard as mathquill automatically triggers focus on load
                _.delay(_.bind(this.closeKeyboard, this), 1000);
            }
        },
        "_hideToolTip": function(cid) {
            $('.coordinate-tooltip[data-equation-cid=' + cid + ']').hide();
        },

        "_showToolTip": function(cid) {
            $('.coordinate-tooltip[data-equation-cid=' + cid + ']').show();
        },

        "addAllPaperItems": function(isKeepCurrentItem, itemType) {
            var equationDataList = this._equationPanel._createEquationDataList(),
                equationDataListLength = equationDataList.length,
                counter = 0,
                pathGroupArr = [],
                pointsArr = [],
                tableView,
                $list,
                equationDataCid,
                rasterData = this._imageController.rasterData;
            for (; counter < equationDataListLength; counter++) {
                pointsArr = [];
                equationDataCid = equationDataList[counter].cid;
                $list = this.$("[data-equation-cid='" + equationDataCid + "']").parents('.list');
                if ($list.length === 0) {
                    $list = this.$("[data-equation-cid='" + equationDataCid + "']");
                }
                if ($list.attr('data-type') === "table") {
                    tableView = this._equationPanel._getTableViewObject($list);
                    if (tableView.model.get('eyeOpen') === false || tableView.model.get('plotColumnHidden').indexOf(equationDataCid) > -1 ||
                        tableView.model.get('lineOptionSelected') === false) {
                        continue;
                    }
                } else {
                    if (equationDataList[counter].getCurveVisibility() === false) {
                        continue;
                    }
                }
                if (["plot", "quadraticPlot", "polygon"].indexOf(equationDataList[counter].getSpecie()) > -1 &&
                    equationDataList[counter].styleType !== "points") {
                    if (equationDataList[counter].styleType === "line" && equationDataList[counter].getPoints() && equationDataList[counter].getPoints().length === 1) {
                        continue;
                    }
                    pathGroupArr.push(equationDataList[counter].getPathGroup());
                } else if (equationDataList[counter].getSpecie() === "point" && equationDataList[counter].getPointsGroup()) {
                    pointsArr = this._getCriticalPoints(equationDataList[counter].getPointsGroup().children, pointsArr);
                    pathGroupArr = pathGroupArr.concat(pointsArr);
                } else if (equationDataList[counter].styleType === "points" && equationDataList[counter].getPlot().getPointsGroup()) {
                    pointsArr = this._getCriticalPoints(equationDataList[counter].getPlot().getPointsGroup().children, pointsArr);
                    pathGroupArr = pathGroupArr.concat(pointsArr);
                }
            }
            $.merge(pathGroupArr, this._imageController.imageCollection);
            this.canvasAcc.updatePaperItems(pathGroupArr, isKeepCurrentItem);

            if (itemType === 'image') {
                this.changeAccMessage('grid-graph-canvas-acc-container', 7);
                this._handleImageAccessibility(rasterData.rasterImage);
            }
        },

        "_handleImageAccessibility": function(currentPaperItem, focusDelay) {
            this.enableTab('grid-graph-canvas-acc-container', true);
            this.setFocus('grid-graph-canvas-acc-container', focusDelay);
            this.$('#grid-graph-canvas-acc-container-acc-elem').addClass('hide-outline');
            this.canvasAcc.model.set('disableSelfFocusOnSpace', false);
            this.canvasAcc.setCurrentPaperItem(currentPaperItem, true);
            this.setFocusRectPosition(currentPaperItem);
            this.previousItem = currentPaperItem;
        },

        //end of _render

        /**
         * Create boostrap custom popups.
         * @method _initBootstrapPopup
         * @private
         */
        "_initBootstrapPopup": function() {
            var _TABLE_ERRORS = this._equationPanel.model.get('ERROR_STRINGS').TABLE_ERRORS,
                okText = this.getMessage('bootstrap-popup-text-dummy', 'ok'),
                titleText = this.getMessage('bootstrap-popup-text-dummy', 'alert'),
                cancelText = this.getMessage('bootstrap-popup-text-dummy', 'cancel'),
                clearListPopUp = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'clear-list',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 0),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                bestFitTwoPointsError = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'best-fit-line-model',
                    "text": _TABLE_ERRORS._BEST_FIT_ERROR_STRING,
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                bestFitSlopeError = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'best-fit-slope',
                    "text": _TABLE_ERRORS._BEST_FIT_UNDEFINED_ERROR,
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                bestFitError = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'best-fit-curve-error',
                    "text": _TABLE_ERRORS._BEST_FIT_CALC_ERROR,
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                bestFitExpError = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'best-fit-exp-model',
                    "text": _TABLE_ERRORS._BEST_FIT_EXP_ERROR,
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                maxRows = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'max-row',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 1),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                maxRowsCols = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'max-row-and-col',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 2),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                minRows = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'min-row',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 3),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                maxColumns = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'max-col',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 4),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                minRowsDelete = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'min-row-delete',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 5),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                minColumns = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'min-col-delete',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 6),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                hiddenColumns = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'hidden-col-delete',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 7),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                maxCharts = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'max-chart',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 8),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                maxColCharts = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'max-chart-col',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 9),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                maxRowCharts = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'max-chart-row',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 10),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                chartCalcError = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'chart-calc-error',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 11),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                chartBoxCalcError = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'box-chart-error',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 12),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                invalidSetOfData = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'invalid-set-of-data',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 13),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                colDeleteWarning = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'column-delete-warning',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 14),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                rowDeleteWarning = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'row-delete-warning',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 15),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                tableDeleteWarning = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'table-delete-warning',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 16),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                bestFitNotSelected = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'best-fit-not-selected',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 17),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                invalidBestFitData = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'invalid-best-fit-data',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 18),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                imageFileTypeError = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'image-filetype-error',
                    "text": this.getMessage('bootstrap-popup-text-dummy', 19),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                emptySortError = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'empty-sort-alert',
                    "text": this.getAccMessage('empty-sort-alert-text', 0),
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim(),
                dataOverridden = MathUtilities.Tools.Graphing.templates['alert-box']({
                    "id": 'data-overridden',
                    "text": '',
                    "ok": okText,
                    "title": titleText,
                    "cancel": cancelText
                }).trim();
            this.$el.append(clearListPopUp, bestFitTwoPointsError, bestFitSlopeError, invalidSetOfData,
                bestFitError, colDeleteWarning, rowDeleteWarning, tableDeleteWarning, invalidBestFitData, minRows,
                maxRowsCols, bestFitExpError, hiddenColumns, maxColumns, maxRows, minRowsDelete, minColumns, maxCharts,
                maxColCharts, maxRowCharts, bestFitNotSelected, chartCalcError, chartBoxCalcError, imageFileTypeError, dataOverridden, emptySortError);
            this.$el.find('.btn-cancel').hide();
            this.accManagerView.loadScreen('bootstrap-popup-text');
        },

        /**
         * create custom tool tip for hover.
         * @method _createCustomToolTips
         * @private
         */
        "_createCustomToolTips": function() {
            var tooltipElems = null,
                elemId = null,
                options = null,
                tooltipView = null,
                toolTipText = null,
                $toolholder = this.$el;
            //load tool-tip screen
            tooltipElems = {
                "undo-btn": {
                    "tooltipHolder": "undo-graph",
                    "position": "bottom-center-right",
                    "text": this.accManagerView.getMessage("dummy-button-text", 2)
                },
                "redo-btn": {
                    "tooltipHolder": "redo-graph",
                    "position": "bottom",
                    "text": this.accManagerView.getMessage("dummy-button-text", 3)
                },
                "reset-btn": {
                    "tooltipHolder": "delete-all",
                    "position": "bottom",
                    "text": this.accManagerView.getMessage("dummy-button-text", 4)
                },
                "add-image-btn": {
                    "tooltipHolder": "add-image",
                    "position": "bottom",
                    "text": this.accManagerView.getMessage("dummy-button-text", 5)
                },
                "settings-btn": {
                    "tooltipHolder": "settings",
                    "position": "bottom-center-left",
                    "text": this.accManagerView.getMessage("dummy-button-text", 9)
                },
                "show-column": {
                    "tooltipHolder": "show-column",
                    "position": "bottom-center-right",
                    "text": this.accManagerView.getMessage("dummy-button-text", 10)
                },
                "add-table": {
                    "tooltipHolder": "item-table",
                    "position": "bottom",
                    "text": this.accManagerView.getMessage("dummy-button-text", 11)
                },
                "hide-column": {
                    "tooltipHolder": "hide-column",
                    "position": "bottom",
                    "text": this.accManagerView.getMessage("dummy-button-text", 12)
                },
                "math-tool-btn-help-4": {
                    "tooltipHolder": "math-tool-btn-help-4",
                    "position": "bottom",
                    "text": this.accManagerView.getMessage("dummy-button-text", 13)
                },
                "math-tool-btn-restore-4": {
                    "tooltipHolder": "math-tool-btn-restore-4",
                    "position": "bottom",
                    "text": this.accManagerView.getMessage("dummy-button-text", 14)
                },
                "math-tool-btn-hide-4": {
                    "tooltipHolder": "math-tool-btn-hide-4",
                    "position": "bottom",
                    "text": this.accManagerView.getMessage("dummy-button-text", 15)
                },
                "math-tool-btn-close-4": {
                    "tooltipHolder": "math-tool-btn-close-4",
                    "position": "bottom",
                    "text": this.accManagerView.getMessage("dummy-button-text", 16)
                },
                "math-tool-save-btn-icon-4": {
                    "tooltipHolder": "math-tool-btn-save-4",
                    "position": "top",
                    "text": this.accManagerView.getMessage("dummy-button-text", 17)
                },
                "math-tool-open-btn-icon-4": {
                    "tooltipHolder": "math-tool-btn-open-4",
                    "position": "top",
                    "text": this.accManagerView.getMessage("dummy-button-text", 18)
                },
                "math-tool-print-btn-4": {
                    "tooltipHolder": "math-tool-btn-print-4",
                    "position": "top",
                    "text": this.accManagerView.getMessage("dummy-button-text", 19)
                },
                "math-tool-screenshot-btn-icon-4": {
                    "tooltipHolder": "math-tool-btn-screenshot-4",
                    "position": "top-center-right",
                    "text": this.accManagerView.getMessage("dummy-button-text", 20)
                },
                "math-tool-btn-zoomin-4": {
                    "tooltipHolder": "math-tool-btn-zoomin-4",
                    "position": "top",
                    "text": this.accManagerView.getMessage("dummy-button-text", 6)
                },
                "math-tool-btn-zoomdefault-4": {
                    "tooltipHolder": "math-tool-btn-zoomdefault-4",
                    "position": "top",
                    "text": this.accManagerView.getMessage("dummy-button-text", 7)
                },
                "math-tool-btn-zoomout-4": {
                    "tooltipHolder": "math-tool-btn-zoomout-4",
                    "position": "top",
                    "text": this.accManagerView.getMessage("dummy-button-text", 8)
                },
                "add-function": {
                    "tooltipHolder": "add-function",
                    "position": "bottom-center-right",
                    "text": this.accManagerView.getMessage("dummy-button-text", 21)
                },
                "math-tool-csv-btn-container-4": {
                    "tooltipHolder": "math-tool-csv-btn-container-4",
                    "position": "top",
                    "text": this.accManagerView.getMessage("dummy-button-text", 22)
                },
                "grid-line": {
                    "tooltipHolder": "grid-line",
                    "position": "bottom",
                    "text": this.accManagerView.getMessage("dummy-button-text", 23)
                },
                "axis-line": {
                    "tooltipHolder": "axis-line",
                    "position": "bottom",
                    "text": this.accManagerView.getMessage("dummy-button-text", 24)
                },
                "label-line": {
                    "tooltipHolder": "label-line",
                    "position": "bottom",
                    "text": this.accManagerView.getMessage("dummy-button-text", 25)
                },
                "slider-settings-icon": {
                    "tooltipHolder": "slider-settings-icon-holder",
                    "position": "top",
                    "text": this.accManagerView.getMessage("dummy-button-text", 26)
                },
                "slider-delete-icon": {
                    "tooltipHolder": "slider-delete-icon-holder",
                    "position": "top",
                    "text": this.accManagerView.getMessage("dummy-button-text", 46)
                },
                "delete-image": {
                    "tooltipHolder": "delete-image",
                    "text": this.accManagerView.getMessage("dummy-button-text", 46),
                    "topPadding": 0,
                    "position": "bottom"
                }
            };
            for (elemId in tooltipElems) {
                options = {
                    "id": tooltipElems[elemId].tooltipHolder + '-tooltip',
                    "text": tooltipElems[elemId].text,
                    "position": tooltipElems[elemId].position,
                    "tool-holder": $toolholder
                };
                tooltipView = MathUtilities.Components.CustomTooltip.generateTooltip(options);

            }
        },
        "createCommonTooltips": function() {
            var tooltipView = null,
                options = null,
                elements = null,
                elemId = null,
                $listBox = this.$('.list-box'),
                listNumber = this.$('#add-to-list').find('.list-handle').attr('data-handle-number');

            listNumber = listNumber ? Number(listNumber) : 0;

            elements = {
                'handler-warning': {
                    'id': 'handler-warning',
                    'text': this.accManagerView.getMessage('dummy-button-text', 29),
                    'delegateClass': '.handler-warning:not(".table-error,.error")',
                    'topPadding': 0,
                    'position': 'bottom'
                },
                'function-btn': {
                    'id': 'function-btn',
                    'text': this.accManagerView.getMessage('dummy-button-text', 30),
                    'delegateClass': '.function-btn',
                    'topPadding': 0,
                    'position': 'bottom'
                },
                'add-column': {
                    'id': 'new-col',
                    'text': this.accManagerView.getMessage('dummy-button-text', 31),
                    'delegateClass': '.new-col',
                    'topPadding': 0,
                    'position': 'bottom'
                },
                'remove-column': {
                    'id': 'remove-col',
                    'text': this.accManagerView.getMessage('dummy-button-text', 32),
                    'delegateClass': '.remove-col',
                    'topPadding': 0,
                    'position': 'bottom'
                },
                'remove-row': {
                    'id': 'remove-row',
                    'text': this.accManagerView.getMessage('dummy-button-text', 34),
                    'delegateClass': '.remove-row',
                    'topPadding': 0,
                    'position': 'bottom-center-right'
                },
                'add-row': {
                    'id': 'new-row',
                    'text': this.accManagerView.getMessage('dummy-button-text', 33),
                    'delegateClass': '.new-row',
                    'topPadding': 0,
                    'position': 'bottom'
                },
                'copy-btn': {
                    'id': 'copy-data-btn',
                    'text': this.accManagerView.getMessage('dummy-button-text', 35),
                    'delegateClass': '.copy-data-btn',
                    'topPadding': 0,
                    'position': 'bottom'
                },
                'line-chart': {
                    'id': 'line-chart-btn',
                    'text': this.accManagerView.getMessage('dummy-button-text', 36),
                    'delegateClass': '[data-chart-name="line"]',
                    'topPadding': 0,
                    'position': 'top'
                },
                'bar-chart': {
                    'id': 'bar-chart-btn',
                    'text': this.accManagerView.getMessage('dummy-button-text', 37),
                    'delegateClass': '[data-chart-name="bar"]',
                    'topPadding': 0,
                    'position': 'top'
                },
                'dot-chart': {
                    'id': 'dot-chart-btn',
                    'text': this.accManagerView.getMessage('dummy-button-text', 38),
                    'delegateClass': '[data-chart-name="dot"]',
                    'topPadding': 0,
                    'position': 'top'
                },
                'histogram-chart': {
                    'id': 'histogram-chart-btn',
                    'text': this.accManagerView.getMessage('dummy-button-text', 39),
                    'delegateClass': '[data-chart-name="histogram"]',
                    'topPadding': 0,
                    'position': 'top'
                },
                'pie-chart': {
                    'id': 'pie-chart-btn',
                    'text': this.accManagerView.getMessage('dummy-button-text', 40),
                    'delegateClass': '[data-chart-name="pie"]',
                    'topPadding': 0,
                    'position': 'top'
                },
                'box-chart': {
                    'id': 'box-chart-btn',
                    'text': this.accManagerView.getMessage('dummy-button-text', 41),
                    'delegateClass': '[data-chart-name="box"]',
                    'topPadding': 0,
                    'position': 'top'
                },
                'column-chart': {
                    'id': 'column-chart-btn',
                    'text': this.accManagerView.getMessage('dummy-button-text', 42),
                    'delegateClass': '[data-chart-name="column"]',
                    'topPadding': 0,
                    'position': 'top'
                },
                'edit-button': {
                    'id': 'equation-edit-container',
                    'text': this.accManagerView.getMessage('dummy-button-text', 45),
                    'delegateClass': '.equation-edit-container',
                    'topPadding': 0,
                    'position': 'bottom'
                },
                'graphing-tool-editor-close-button': {
                    'id': 'graphing-tool-editor-close-button',
                    'text': this.accManagerView.getMessage('dummy-button-text', 16),
                    'delegateClass': '.graphing-tool-editor-close-button',
                    'topPadding': 0,
                    'position': 'bottom',
                    '$toolTipParent': this.$('.graphing-tool-editor-color-style-box')
                },
                'chart-close-button-container': {
                    'id': 'chart-close-button-container',
                    'text': this.accManagerView.getMessage('dummy-button-text', 16),
                    'delegateClass': '.chart-close-button-container',
                    'topPadding': 0,
                    'position': 'bottom',
                    '$toolTipParent': this.$('#grid-graph-container')
                },
                'chart-options-button': {
                    'id': 'chart-options-button',
                    'text': this.accManagerView.getMessage('dummy-button-text', 9),
                    'delegateClass': '.chart-options-button',
                    'topPadding': 0,
                    'position': 'bottom',
                    '$toolTipParent': this.$('#grid-graph-container')
                }
            };

            for (elemId in elements) {
                options = {
                    "id": elements[elemId].id + '-tooltip-' + listNumber,
                    "text": elements[elemId].text,
                    "$toolTipParent": elements[elemId].$toolTipParent ? elements[elemId].$toolTipParent : $listBox,
                    "topPadding": elements[elemId].topPadding,
                    "tool-holder": this.$el,
                    "position": elements[elemId].position,
                    "delegateClass": elements[elemId].delegateClass
                };
                tooltipView = MathUtilities.Components.CustomTooltip.generateTooltip(options);
            }
        },
        "openKeyboard": function(isButtonClicked) {
            if (this.isKeyboardClosed && !isButtonClicked) {
                return void 0;
            }
            if (isButtonClicked) {
                this.isKeyboardClosed = false;
            }
            this.$('.keyboardContainer').show();
            this.$('#sliders-bottom-panel-container').hide();
            this._equationPanel._sliderPanel._hideDeleteOption();
            this.$('#slider-delete-icon-holder').removeClass('activated');
            this.$('#slider-title-holder').removeClass('bring-to-front');
            this.$('#keyboard-title-container').addClass('bring-to-front');
            this.$('#keyboard-arrow-icon').addClass('down-arrow').removeClass('up-arrow');
            this.trigger('keyboard-opened');
            this._updateListBoxHeight(false);
            this.accManagerView.changeAccMessage('keyboard-title-container', 1);
        },

        "closeKeyboard": function(isButtonClicked) {
            if (isButtonClicked) {
                this.isKeyboardClosed = true;
            }
            this.$('.keyboardContainer').hide();
            this.trigger('keyboard-closed');
            this.$('#keyboard-arrow-icon').addClass('up-arrow').removeClass('down-arrow');
            this.$('#keyboard-title-container').removeClass('bring-to-front');
            this._updateListBoxHeight(true);
            this.accManagerView.changeAccMessage('keyboard-title-container', 0);
        },
        /**
         * sets min width of the list-box with the list-item width
         * @method _setMinWidth
         * @param event {Object}
         * @return void
         */
        "_setMinWidth": function(event, $list) {
            var listWidth;
            if ($list) {
                listWidth = $list.width();
            } else {
                listWidth = $(event.target).parents('.list').width();
            }
            this.$('#input-column').css({
                "min-width": listWidth
            });
            this.$('#input-data-extension').height(this.$('.key-panels-wrapper').height());
        },

        /**
         * resets min width of the list-box
         * @method _resetMinWidth
         * @param event {Object}
         * @return void
         */
        "_resetMinWidth": function() {
            this.$('#input-column').css({
                "min-width": 348
            });
        },

        /**
         * Triggered when vmk click starts
         * @method _vmlButtonClicked
         * @param event {Object}
         * @return void
         */
        "_vmlButtonClicked": function(event) {
            this._equationPanel._vmkClicked = true;
        },

        /**
         * Triggered when vmk click ends
         * @method _vmkButtonClickEnd
         * @param event {Object}
         * @return void
         */
        "_vmkButtonClickEnd": function(event) {
            var equationPanel = this._equationPanel,
                $this = $(event.currentTarget),
                $list = $this.parents('.list');
            equationPanel._vmkClicked = false;
            if ($list.attr('data-type') === 'table') {
                equationPanel._parseTable($this.parents('.cell'), false, false);
            } else {
                equationPanel._undoRedoHandlerForList($list);
                equationPanel._callParserWithList($list);
            }
        },
        "_toggleDegreeRadians": function(event) {
            var $degree = this.$('#degree'),
                $radian = this.$('#radian');
            if ($degree.hasClass('activated')) {
                this._setEquationUnitRadians(event);
                $degree.removeClass('activated');
                $radian.addClass('activated');
            } else {
                this._setEquationUnitDegree(event);
                $degree.addClass('activated');
                $radian.removeClass('activated');
            }
        },
        "_equationUnitToggle": function(equationUnit) {
            this._equationPanel._equationUnitToggle(equationUnit);
        },
        "_setEquationUnitRadians": function(event) {
            this.setDocumentDirty();
            this.$('#degree-radians-toggle-button-switch').css({
                "right": 0
            });
            this._gridGraphView._polarAngleLineMarkerStyle(true);
            this._equationPanel._equationUnitToggle('rad');
            this.changeAccMessage('degree-radians-toggle-button', 0, [this.getMessage('radian-text', 0)]);
        },
        "_setEquationUnitDegree": function(event) {
            this.setDocumentDirty();
            this.$('#degree-radians-toggle-button-switch').css({
                "right": "auto"
            });
            this._gridGraphView._polarAngleLineMarkerStyle(false);
            this._equationPanel._equationUnitToggle('deg');
            this.changeAccMessage('degree-radians-toggle-button', 0, [this.getMessage('degree-text', 0)]);
        },
        "_keyDownOnTool": function(event) {
            var EquationPanel = MathUtilities.Tools.Graphing.Models.EquationPanel;

            if ([EquationPanel.DELETE_KEY, EquationPanel.BACKSPACE_KEY].indexOf(event.keyCode) > -1 &&
                this._imageController.getSelectedImageCount() > 0) {
                if (this.focusRect) {
                    this.focusRect.opacity = 0;
                }
                this._imageController.callDeleteImage();
                this.addAllPaperItems(false);
                this.previousParentItem = this.previousItem = this.nextParentItem = null;
                this.$('#grid-graph-canvas-acc-container-acc-elem').removeClass('hide-outline');
                this.setFocus('degree-radians-toggle-button');
            }
        },
        /**
         * hides graph settings options box
         * @method _hideGraphSettings
         * @return void
         */
        "_hideGraphSettings": function(event) {
            if (event.target.id === this.$('#grid-graph').first().id && this.$('#options-container').is(':visible')) {
                this._toggleOptionsHandler();
            }
        },

        /**
         * show custom pop up
         * @method _showCustomPopup
         * @return void
         */
        "_showCustomPopup": function() {
            var $modal = $('#tool-holder-4').find('#clear-list'),
                $okBtn = $modal.find('.btn-primary'),
                $cancelBtn = $modal.find('.btn-cancel');
            $cancelBtn.show();
            $modal.modal({
                'manager': this.$el
            }).on('hidden.bs.modal', _.bind(function() {
                this._bestFitAlertDisplayed = false;
            }, this));
            $('.modal-scrollable').removeClass('modal-scrollable');
            this.accManagerView.unloadScreen('bootstrap-popup-text');
            this.accManagerView.loadScreen('bootstrap-popup-text');
            this.setFocus('clear-list-title');
            $okBtn.off('click.deleteAll').on('click.deleteAll', _.bind(function() {
                this._closeAlertBox($modal);
                this._callDeleteAll(true);
                this.setFocus('add-function', 10);
                if (this.focusRect) {
                    this.focusRect.opacity = 0;
                }
            }, this));
            $cancelBtn.off('click.cancel').on('click.cancel', _.bind(function() {
                this._closeAlertBox($modal);
                this.setFocus('delete-all');
            }, this));
        },
        /**
         * show custom pop up
         * @method _showCustomPopupForColumnDelete
         * @return void
         */
        "_showCustomPopupForColumnDelete": function($list, tableView, columnNo) {
            var $modal = $('#tool-holder-4').find('#column-delete-warning'),
                $okBtn = $modal.find('.btn-primary'),
                $cancelBtn = $modal.find('.btn-cancel');
            $cancelBtn.show();
            $modal.modal({
                'manager': this.$el
            }).on('hidden.bs.modal', _.bind(function() {
                this._bestFitAlertDisplayed = false;
            }, this));
            this.accManagerView.unloadScreen('bootstrap-popup-text');
            this.accManagerView.loadScreen('bootstrap-popup-text');
            this.setFocus('column-delete-warning-title');
            $okBtn.off('click.deleteCol').on('click.deleteCol', _.bind(function() {
                this._closeAlertBox($modal);
                this._equationPanel._deleteTableColumn($list, tableView, columnNo);
            }, this));
            $cancelBtn.off('click.cancel').on('click.cancel', _.bind(function() {
                this._closeAlertBox($modal);
            }, this));
        },
        "_showCustomPopupForRowDelete": function($list, tableView, rowNo) {
            var $modal = $('#tool-holder-4').find('#row-delete-warning'),
                $okBtn = $modal.find('.btn-primary'),
                $cancelBtn = $modal.find('.btn-cancel');
            $cancelBtn.show();
            $modal.modal({
                'manager': this.$el
            }).on('hidden.bs.modal', _.bind(function() {
                this._bestFitAlertDisplayed = false;
            }, this));
            this.accManagerView.unloadScreen('bootstrap-popup-text');
            this.accManagerView.loadScreen('bootstrap-popup-text');
            this.setFocus('row-delete-warning-title');
            $okBtn.off('click.deleteRow').on('click.deleteRow', _.bind(function() {
                this._closeAlertBox($modal);
                this._equationPanel._deleteTableRow($list, tableView, rowNo);
            }, this));
            $cancelBtn.off('click.cancel').on('click.cancel', _.bind(function() {
                this._closeAlertBox($modal);
            }, this));
        },
        "_showCustomPopupForTableDelete": function($list, $targetCell, equationData) {
            var $modal = $('#tool-holder-4').find('#table-delete-warning'),
                $okBtn = $modal.find('.btn-primary'),
                accManagerView = this.accManagerView,
                $cancelBtn = $modal.find('.btn-cancel');
            $cancelBtn.show();
            $modal.modal({
                'manager': this.$el
            }).on('hidden.bs.modal', _.bind(function() {
                this._bestFitAlertDisplayed = false;
            }, this));
            accManagerView.unloadScreen('bootstrap-popup-text');
            accManagerView.loadScreen('bootstrap-popup-text');
            _.delay(function() {
                accManagerView.setFocus('table-delete-warning-title');
            }, 60);
            $okBtn.off('click.deleteTable').on('click.deleteTable', _.bind(function() {
                this._closeAlertBox($modal);
                this._equationPanel._deleteTable($list, $targetCell, equationData);
                accManagerView.setFocus($list.attr('id'));
            }, this));
            $cancelBtn.off('click.cancel').on('click.cancel', _.bind(function() {
                this._closeAlertBox($modal);
                accManagerView.setFocus($list.attr('id'));
            }, this));
        },
        "_callDeleteAll": function(event) {
            var sliderData = this._equationPanel._sliderPanel.resetSliderPanel(),
                undoredoData = this._equationPanel._deleteAll(event),
                imageData = this._imageController.callReset(event),
                prevState;
            this.resetPrecision();
            if (typeof event !== 'undefined' && event !== false) {
                prevState = this.model.get('loadedState');
                undoredoData.undo.projectorMode = this._equationPanel._projectorMode;
                undoredoData.redo.projectorMode = this._equationPanel._projectorMode;
                if (prevState !== null) {
                    prevState = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(prevState);
                    this.retrieveState(prevState, true);
                    undoredoData.undo.retrieveState = prevState;
                    undoredoData.redo.retrieveState = prevState;
                } else {
                    this._showColumnHandler();
                    this._gridGraphView.defaultGraphZoom();
                    this._resetGraphOptions();
                }
                undoredoData.undo.sliderData = {
                    "actionName": 'addAllSlider',
                    "sliderData": sliderData
                };
                undoredoData.redo.sliderData = {
                    "actionName": 'deleteAllSlider',
                    "sliderData": sliderData
                };
                undoredoData.undo.imageData = {
                    "actionName": 'addAllImages',
                    "imageData": imageData
                };
                undoredoData.redo.imageData = {
                    "actionName": 'deleteAllImages',
                    "imageData": imageData
                };
                this.execute('deleteAll', undoredoData);
            }
            this.addAllPaperItems(false);
            this.setDocumentClean();
        },
        /**
         * Hides equation column
         * @method _hideColumnHandler
         * @return void
         */
        "_hideColumnHandler": function(hideWithoutSlide) {
            // slide and hide input column
            var canvasWidth,
                $el = this.$el,
                $chartContainer = this.$('.chart-window-highcharts-container'),
                length = $chartContainer.length,
                $currElem, index;
            this.model.set('_columnHidden', true);
            //to over-ride width height applied by highcharts
            for (index = 0; index < length; index++) {
                $currElem = $chartContainer.eq(index);
                $currElem.css({
                    "height": $currElem.height(),
                    "width": $currElem.width()
                });
            }
            this.$('#grid-graph-container').addClass('panel-collapsed');
            if (hideWithoutSlide) {
                this.$('#input-column').hide();
                this.$('#show-column').fadeIn();
                canvasWidth = $el.width();
                this.$('#grid-graph-container').width($('#main').width()).css('margin-left', 0);
                this.$('#grid-graph').width(canvasWidth);
                this._gridGraphView.canvasResize();
                this.$el.parents('.math-utilities-components-tool-holder').focus();
                this.trigger('hide-equation-panel');
            } else {
                this.$('#input-column').hide('slide', {
                    "direction": 'left'
                }, 500, _.bind(function() { // slide animation time
                    // display show button
                    this.$('#show-column').fadeIn();
                    canvasWidth = $el.width();
                    this.$('#grid-graph-container').width($('#main').width()).css('margin-left', 0);
                    this.$('#grid-graph').width(canvasWidth);
                    this._gridGraphView.canvasResize();
                    this.$el.parents('.math-utilities-components-tool-holder').focus();
                    this.trigger('hide-equation-panel');
                    this.setFocus('show-column');
                }, this));
            }
            this.closeKeyboard();
            this._updateListBoxHeight(true);
            this.setDocumentDirty();
        },

        /**
         * Displays hidden equation column
         * @method _showColumnHandler
         * @return void
         */
        "_showColumnHandler": function() {
            var $gridGraphContainer = this.$('#grid-graph-container'),
                $addFunctionIcon = this.$('#add-function-icon'),
                $addTableIcon = this.$('#item-table-icon'),
                $deleteAllIcon = this.$('#delete-all-icon'),
                $deleteAllText = this.$('#delete-all-text'),
                cursorClassTag = this._equationPanel.model.get('cursorClassTag');
            this.$('#grid-graph-container').removeClass('panel-collapsed');
            // display input column
            this.model.set('_columnHidden', false);
            if (!this.$('#input-column').is(':visible')) {
                this.$('#input-column').show('slide', {
                    "direction": 'left'
                }, 500); // slide animation time
                _.delay(_.bind(function() {
                    this.$('#hide-column').removeClass('hovered').find('#hide-column-icon').removeClass('hovered');
                    $addFunctionIcon.removeClass('hovered');
                    $addTableIcon.removeClass('hovered');
                    $deleteAllIcon.removeClass('hovered');
                    $deleteAllText.removeClass('hovered');
                    if (cursorClassTag.length === 1) {
                        cursorClassTag.find('textarea').focus();
                    }
                    this.setFocus('hide-column');
                }, this), 500); // slide animation time
                this.$('#show-column').hide();
                $gridGraphContainer.width($('#main').width() - parseInt($gridGraphContainer.attr('data-left-margin'), 10))
                    .css('margin-left', $gridGraphContainer.attr('data-left-margin'));
                this.$('#grid-graph').width($gridGraphContainer.width());
                this._gridGraphView.canvasResize();
                this.trigger('show-equation-panel');
                this.openKeyboard();
                this.adjustCopyBtnWidth();
                this._updateChartsSizes();
                this.$('#grid-graph-container').removeClass('panel-collapsed');
            }
            this.setDocumentDirty();
        },

        "_updateChartsSizes": function() {
            var length = this.$('.chart-window-highcharts-container').length,
                maxWidth, maxHeight, dummyEvent,
                index = 0,
                currElemOffset,
                BORDER_ADJUST = 14,
                $charts = this.$('.chart-window-highcharts-container'),
                $gridGraph = this.$('#grid-graph'),
                gridWidth = $gridGraph.width(),
                gridHeight = $gridGraph.height(),
                gridOffset = $gridGraph.offset(),
                $currElem;

            for (; index < length; index++) {
                $currElem = $charts.eq(index);
                currElemOffset = $currElem.offset();
                maxWidth = gridWidth - (currElemOffset.left - gridOffset.left);
                maxHeight = gridHeight - (currElemOffset.top - gridOffset.top) - $currElem.find('.chart-header').height();
                if (maxWidth < 0 || maxHeight < 0) {
                    continue;
                }
                if ($currElem.height() > maxHeight || $currElem.width() > maxWidth) {
                    this.$('#grid-graph-container').removeClass('panel-collapsed');
                    dummyEvent = new $.Event("keydown");
                    dummyEvent.isCustomEvent = true;
                    $currElem.find('.ui-resizable-handle').trigger(dummyEvent);
                    dummyEvent = new $.Event("keyup");
                    $currElem.find('.ui-resizable-handle').trigger(dummyEvent);
                    if ($currElem.height() > maxHeight) {
                        $currElem.height(maxHeight - BORDER_ADJUST);
                    }
                    if ($currElem.width() > maxWidth) {
                        $currElem.width(maxWidth - BORDER_ADJUST);
                    }
                }
            }
            this.setDocumentDirty();
        },

        "adjustCopyBtnWidth": function() {
            var $list = this.$('.list'),
                index = 0,
                tableView = null,
                listLength = $list.length;
            for (; index < listLength; index++) {
                tableView = this._equationPanel._getTableViewObject($list.eq(index));
                if (tableView) {
                    tableView.setCopyBtnContainerWidth();
                }
            }
        },
        "callCSV": function() {
            this.$('#csv-reader').remove();
            this.$el.append('<input id="csv-reader" type="file"></input>');
            var $file = this.$('#csv-reader');
            $file.on('change', _.bind(this._getCSVFile, this)).trigger('click');
        },
        "_getCSVFile": function(event) {
            if (window.FileReader) {
                var files = event.target.files,
                    file = files[0],
                    reader,
                    supportedFormat = /(\.csv)$/i;
                reader = new window.FileReader();
                reader.onload = _.bind(function(event) {
                    this._equationPanel._createTableWithCsvFile(event.target.result);
                }, this);
                if (supportedFormat.exec(file.name)) {
                    reader.readAsText(file);
                }
            }
        },

        "setCsvData": function(csvData) {
            this._equationPanel._createTableWithCsvFile(csvData);
        },

        "callSaveState": function() {
            var data = this.saveState();
            $('#retrieve-state-textarea').val(JSON.stringify(data));
            MathUtilities.Tools.Components.SaveState.Models.MaintainState.saveState('gCal', data);
        },
        "callRetrieveState": function() {
            var data = $('#retrieve-state-textarea').val();
            if (typeof data !== 'undefined' && data !== '') {
                data = JSON.parse(data.trim());
                this.retrieveState(data);
            } else {
                this.retrieveState(MathUtilities.Tools.Components.SaveState.Models.MaintainState.retrieveState('gCal'));
            }
        },

        /**
         * addPrecisionSpinner add precision spinner to graph settings
         * @method addPrecisionSpinner
         * @return void
         */
        "addPrecisionSpinner": function() {
            var spinnerOptions,
                GraphingToolModel = MathUtilities.Tools.Graphing.Models.GraphingToolModel,
                intervalArray = _.range(GraphingToolModel.PRECISION_VALUE.MAX, GraphingToolModel.PRECISION_VALUE.MIN - 1, GraphingToolModel.PRECISION_VALUE.STEP); //Range from 10 to 0 with -1 as step value

            spinnerOptions = {
                "el": this.$('.setting-graph-precision-section .custom-spinner-container'),
                "maxValue": GraphingToolModel.PRECISION_VALUE.MAX,
                "minValue": GraphingToolModel.PRECISION_VALUE.MIN,
                "defaultValue": this.model.get('precision'),
                "allValues": intervalArray,
                "showSign": true,
                "isEditable": true,
                "title": 'Precision',
                "spinId": 'precision',
                "layout": 'horizontal',
                "allowDecimal": false
            };

            this.spinnerView = MathUtilities.Components.Spinner.Views.Spinner.generateCustomSpinner(spinnerOptions);
        },

        /**
         * _toggleOptionsHandler toggles view of graph options
         * @method _toggleOptionsHandler
         * @return void
         */
        "_toggleOptionsHandler": function() {
            var $settingOptionsContainer = this.$('#options-container'),
                $chartOptions,
                $graphOptions,
                $settings,
                $xLabelText = this.getMessage('x-labels-in-radian-text', 0);
            this.$('#options-container').toggle();
            $settings = this.$('#settings');
            if ($settings.hasClass('activated')) {
                $settings.removeClass('activated');
            } else {
                $settings.addClass('activated');
                this._equationPanel._sliderPanel.hidePanel();
            }
            this.model.set('_anyPopupOpen', true);
            $chartOptions = $settingOptionsContainer.find('#chart-options');
            $graphOptions = $settingOptionsContainer.find('#graph-settings-options-container');
            $chartOptions.hide();
            $graphOptions.show();
            $settingOptionsContainer.find('.graph-setting-selection-btn').addClass('activated');
            $settingOptionsContainer.find('.chart-setting-selection-btn').removeClass('activated');

            $settingOptionsContainer.find('#x-labels-in-radian,#y-labels-in-radian').text($xLabelText);
            this.setFocus('graph-setting-selection-btn');
            this.enableTab('graph-settings-x-axis-label', false);
            this.enableTab('graph-settings-y-axis-label', false);
            this.enableTab('graph-settings-value-label', false);
            this.restorePrecision();
            this.accManagerView.unloadScreen('graph-settings');
        },
        "showChartSettings": function() {
            var $settingOptionsContainer = this.$('#options-container'),
                $chartOptions, $graphOptions,
                $graphBtn = $settingOptionsContainer.find('.graph-setting-selection-btn'),
                $chartBtn = $settingOptionsContainer.find('.chart-setting-selection-btn');
            $chartOptions = $settingOptionsContainer.find('#chart-options');
            $graphOptions = $settingOptionsContainer.find('#graph-settings-options-container');
            $chartOptions.show();
            $chartBtn.addClass('activated');
            $graphOptions.hide();
            $graphBtn.removeClass('activated');
            this.accManagerView.unloadScreen('graph-settings');
            this.accManagerView.loadScreen('graph-settings');
            if (this.model.get('animateCharts')) {
                $chartOptions.find('.animate-chart-checkbox').addClass('checked');
                this.changeAccMessage('animate-chart-check', 0, [this.getAccMessage('checked-text', 0)]);
            } else {
                $chartOptions.find('.animate-chart-checkbox').removeClass('checked');
                this.changeAccMessage('animate-chart-check', 0, [this.getAccMessage('unchecked-text', 0)]);
            }
            this.setFocus('animate-chart-check');
        },
        "showGraphSettings": function() {
            var $settingOptionsContainer = this.$('#options-container'),
                $chartOptions, $graphOptions,
                $graphBtn = $settingOptionsContainer.find('.graph-setting-selection-btn'),
                $chartBtn = $settingOptionsContainer.find('.chart-setting-selection-btn'),
                selectedText = this.getAccMessage('selected-text', 0),
                rationalNumberText = this.getAccMessage('rational-number-text', 0),
                multipleOfPiText = this.getAccMessage('multiples-of-pi-text', 0),
                inputBoxTextMin = this.getAccMessage('input-box-text', 0),
                inputBoxTextMax = this.getAccMessage('input-box-text', 1),
                unselectedText = '',
                checkedText = this.getAccMessage('checked-text', 0),
                uncheckedText = this.getAccMessage('unchecked-text', 0);
            $chartOptions = $settingOptionsContainer.find('#chart-options');
            $graphOptions = $settingOptionsContainer.find('#graph-settings-options-container');

            $chartOptions.hide();
            $graphOptions.show();
            $chartBtn.removeClass('activated');
            $graphBtn.addClass('activated');
            this.accManagerView.unloadScreen('graph-settings');
            this.accManagerView.loadScreen('graph-settings');

            this.changeAccMessage('graph-settings-x-axis-label', 0, ['x']);
            this.setAccMessage('graph-settings-y-axis-label', this.getAccMessage('graph-settings-x-axis-label', 0, ['y']));
            if (this.$('#x-axis-label-chk-box').hasClass('activated')) {
                this.changeAccMessage('x-axis-label-container', 0, [checkedText, 'x', rationalNumberText]);
            } else {
                this.changeAccMessage('x-axis-label-container', 0, [uncheckedText, 'x', multipleOfPiText]);
            }
            if (this.$('#y-axis-label-chk-box').hasClass('activated')) {
                this.setAccMessage('y-axis-label-container', this.getAccMessage('x-axis-label-container', 0, [checkedText, 'y', rationalNumberText]));
            } else {
                this.setAccMessage('y-axis-label-container', this.getAccMessage('x-axis-label-container', 0, [uncheckedText, 'y', multipleOfPiText]));
            }

            if (this.$('#equalize-axis').hasClass('activated')) {
                this.changeAccMessage('equalize-axis', 0, [selectedText]);
            } else {
                this.changeAccMessage('equalize-axis', 0, [unselectedText]);
            }

            if (this.$('#equalize-axis').hasClass('activated')) {
                this.changeAccMessage('equalize-axis', 0, [selectedText]);
            } else {
                this.changeAccMessage('equalize-axis', 0, [unselectedText]);
            }
            if (this.$('.degree-radio-button').hasClass('activated')) {
                this.changeAccMessage('degree-option-container', 0, [selectedText]);
                this.changeAccMessage('radian-option-container', 0, [unselectedText]);
                this.enableTab('radian-option-container', false);
                this.enableTab('degree-option-container', true);
            } else {
                this.changeAccMessage('degree-option-container', 0, [unselectedText]);
                this.changeAccMessage('radian-option-container', 0, [selectedText]);
                this.enableTab('radian-option-container', true);
                this.enableTab('degree-option-container', false);
            }

            this.setAccMessage('x-lower-container', inputBoxTextMin.replace('%@$%', this.$('#x-lower-container input').val()));
            this.setAccMessage('x-upper-container', inputBoxTextMax.replace('%@$%', this.$('#x-upper-container input').val()));
            this.setAccMessage('y-lower-container', inputBoxTextMin.replace('%@$%', this.$('#y-lower-container input').val()));
            this.setAccMessage('y-upper-container', inputBoxTextMax.replace('%@$%', this.$('#y-upper-container input').val()));

            this.enableTab('graph-settings-x-axis-label', true);
            this.enableTab('graph-settings-y-axis-label', true);
            this.enableTab('graph-settings-value-label', true);
            this.accManagerView.updateFocusRect('graph-settings-value-label');
            this.setFocus('graph-settings-x-axis-label');
        },

        "setAccMessage": function(accId, msg) {
            if (this.isAccDivPresent($('#' + accId))) {
                return this.accManagerView.setAccMessage(accId, msg);
            }
        },

        "enableTab": function(accId, falg) {
            if (this.isAccDivPresent($('#' + accId))) {
                return this.accManagerView.enableTab(accId, falg);
            }
        },

        "getAccMessage": function(accId, msgNo, params) {
            return this.accManagerView.getAccMessage(accId, msgNo, params);
        },

        "changeAccMessage": function(accId, msgNo, params) {
            if (this.isAccDivPresent($('#' + accId))) {
                return this.accManagerView.changeAccMessage(accId, msgNo, params);
            }
        },

        "getMessage": function(accId, msgNo, params) {
            return this.accManagerView.getMessage(accId, msgNo, params);
        },

        "setFocus": function(accId, delay) {
            if (this.isAccDivPresent($('#' + accId))) {
                return this.accManagerView.setFocus(accId, delay);
            }
        },

        "animateChartsClicked": function() {
            var $chartOptions = this.$('#chart-options'),
                $animateChartCheckBox;
            $animateChartCheckBox = $chartOptions.find('.animate-chart-checkbox');
            if (this.model.get('animateCharts')) {
                $animateChartCheckBox.removeClass('checked');
                this.trigger('animate-chart-unchecked');
                this.model.set('animateCharts', false);
                this.changeAccMessage('animate-chart-check', 0, [this.getAccMessage('unchecked-text', 0)]);
            } else {
                $animateChartCheckBox.addClass('checked');
                this.trigger('animate-chart-checked');
                this.model.set('animateCharts', true);
                this.changeAccMessage('animate-chart-check', 0, [this.getAccMessage('checked-text', 0)]);
            }
            this.setFocus('animate-chart-check');
        },

        "arrangeToFit": function() {
            this._chartManagerView.arrangeToFitCharts();
        },
        "arrangeToFitHover": function(event) {
            $(event.currentTarget).children().addClass('hover');
        },
        "arrangeToFitLeave": function(event) {
            $(event.currentTarget).children().removeClass('hover').removeClass('down');
        },
        "arrangeToFitDown": function(event) {
            $(event.currentTarget).children().addClass('down');
        },
        "arrangeToFitUp": function(event) {
            $(event.currentTarget).children().removeClass('down');
        },

        "precisionOkHover": function(event) {
            $(event.currentTarget).children().addClass('hover');
        },

        "precisionOkLeave": function(event) {
            $(event.currentTarget).children().removeClass('hover').removeClass('down');
        },

        "precisionOkDown": function(event) {
            $(event.currentTarget).children().addClass('down');
        },

        "precisionOkUp": function(event) {
            $(event.currentTarget).children().removeClass('hover').removeClass('down');
        },

        /**
         *restorePrecision restore the precision value
         *@method restorePrecision
         *@return void
         */
        "restorePrecision": function() {
            this.spinnerView.updateSpinValue(this.model.get('precision'));
        },

        /**
         *setPrecision set precision
         *@method setPrecision
         *@return void
         */
        "setPrecision": function() {
            var precision = Math.round(this.spinnerView.currentValue);

            this.spinnerView.updateSpinValue(precision);
            this.model.set('precision', precision);
            this._gridGraphView.setToolTipPrecision(precision);
            this._equationPanel.model.set('precision', precision);
        },

        /**
         *getPrecision get precision
         *@method getPrecision
         *@return precision value
         */
        "getPrecision": function() {
            return this.model.get('precision');
        },

        /**
         *resetPrecision resets precision to default value
         *@method resetPrecision
         *@return precision value
         */
        "resetPrecision": function() {
            var precision = MathUtilities.Components.Utils.Models.MathHelper.DEFAULT_PRECISION_VALUE_GRAPHING_TOOL;
            this.spinnerView.updateSpinValue(precision);
            this.model.set('precision', precision);
            this._gridGraphView.setToolTipPrecision(precision);
        },

        /**
         * _toggleItemBox toggles view of add-item-box
         * @method _toggleItemBox
         * @return void
         */
        "_toggleItemBox": function() {
            this.$('#add-item-box').toggle();
        },

        "_showEditOptions": function() {
            this.$('#input-column-options-for-drawing,.delete-list').addClass('hidden');
            this.$('#input-column-options-for-editing,.graph-edit-options').addClass('visible');
            this.$('.list').each(function() {
                var currentElement = $(this);
                if (currentElement.is('[data-slider-view-cid]') || currentElement.is('[data-table-view-cid]')) {
                    currentElement.find('.duplicate').hide();
                } else {
                    currentElement.find('.duplicate').show();
                }
            });
        },

        /**
         * _callUndo calls undo function of UndoRedoManager
         * @method _callUndo
         * @return void
         *
         */
        "_callUndo": function() {
            this._undoRedoManager.undo(MathUtilities.Tools.Graphing.Models.GraphingToolModel.MODULE_NAME);
            this.setFocus('undo-graph', 10);
        },

        /**
         * _callRedoc calls redo of UndoRedoManager
         * @method _callRedo
         * @return void
         */
        "_callRedo": function() {
            this._undoRedoManager.redo(MathUtilities.Tools.Graphing.Models.GraphingToolModel.MODULE_NAME);
            this.setFocus('redo-graph', 10);
        },

        // undo redo
        /**
         * execute method for registering and handling undo redo functionality
         * @method execute
         * @param actionName {String}
         * @param undoRedoData {Object}
         * @param skipRegistration {Boolean} Skip registration of undo or redo event
         * @return void
         *
         */
        "execute": function(actionName, undoRedoData, skipRegistration) {
            if (skipRegistration) {
                if (undoRedoData.type === 'image') {
                    this._handleUndoRedoForImage(actionName, undoRedoData);
                } else {
                    if (actionName === 'deleteAll') {
                        this._handleUndoRedoForImage(actionName, undoRedoData);
                        this.setDocumentDirty();
                    }
                    this._equationPanel.handleUndoRedoActions(actionName, undoRedoData);
                    if (!this.$('#input-column').is(':visible')) {
                        this._showColumnHandler();
                    }
                    this._setActiveElementFocus();
                }
                this.addAllPaperItems(false);
            } else {
                var undoAction,
                    redoAction;
                undoAction = new MathUtilities.Components.Undo.Models.Action({
                    "name": actionName,
                    "data": undoRedoData.undo,
                    "manager": this
                });
                redoAction = new MathUtilities.Components.Undo.Models.Action({
                    "name": actionName,
                    "data": undoRedoData.redo,
                    "manager": this
                });
                this._undoRedoManager.registerAction(MathUtilities.Tools.Graphing.Models.GraphingToolModel.MODULE_NAME, undoAction, redoAction);
                this.setDocumentDirty();
            }
        },
        "_setActiveElementFocus": function() {
            if (document.activeElement !== null) {
                if (document.activeElement.tagName === 'BODY') {
                    this.$el.parents('.math-utilities-components-tool-holder').focus();
                }
            } else {
                this.$el.parents('.math-utilities-components-tool-holder').focus();
            }
        },
        "_handleUndoRedoForImage": function(actionName, undoRedoData) {
            switch (actionName) {
                case 'addImage':
                    if (undoRedoData.actionType === 'addImage') {
                        this._imageController.callAddForUndoRedo(undoRedoData);
                    } else {
                        this._imageController.callDeleteForUndoRedo(actionName, undoRedoData);
                        this.focusRect.opacity = 0;
                    }
                    break;
                case 'deleteImage':
                    if (undoRedoData.actionType === 'addImage') {
                        this._imageController.callAddForUndoRedo(undoRedoData);
                        this._imageController.deselectAll();
                    } else {
                        this._imageController.callDeleteForUndoRedo(actionName, undoRedoData);
                    }
                    this.focusRect.opacity = 0;
                    break;
                case 'transformImage':
                    this._imageController.undoRedoTransformation(undoRedoData);
                    this.focusRect.opacity = 0;
                    break;
                case 'deleteAll':
                    this._imageController.callReset();
                    if (this.focusRect) {
                        this.focusRect.opacity = 0;
                    }
                    if (undoRedoData.imageData.actionName === 'addAllImages') {
                        this._imageController.callAddForUndoRedo(undoRedoData.imageData.imageData, 'addAllImages');
                    }
            }
        },
        /**
         * _hidePopUps hides pop ups
         * @method _hidePopUps
         * @return void
         */
        "_hidePopUps": function() {
            this.$('.graphing-tool-editor-color-style-box').hide();
            this.$('#options-container').hide();
            this.$('.list .graphing-tool-editor-color-style-box-table').hide();
            this.$('.list .graphing-tool-editor-color-style-box-equation').hide();
            this.$('.graphing-tool-editor-best-fit-options-container').hide();
            this.$('.graphing-tool-editor-residual-options-container').hide();
            this.$('.graphing-tool-editor-data-analysis-options-container').hide();
            this.$('.graphing-tool-editor-sort-options-container').hide();
            this.$('.slider-box-container .limit-change').hide();
            this.$('.slider-box-container .slider-div').show();
            this.$('.handler-warning-text').hide();
            this.$('#input-data-extension').height(0);
            this.$('.input-data-scroll-hidden').removeClass('input-data-scroll-hidden');
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
         * saveState saves current graph state
         * @method saveState
         * @return void
         */
        "saveState": function() {
            var stateData = {},
                gridGraphData = this._gridGraphView.getAttribute();
            stateData.inputColumn = this._equationPanel._getInputColumnData();
            stateData.inputColumn.columnHidden = this.model.get('_columnHidden');
            stateData.graphData = gridGraphData;
            stateData.graphData.animateCharts = this.model.get('animateCharts');
            stateData.graphData.precision = this.model.get('precision');
            stateData.imageData = this._imageController.saveAllImagesData();
            this.setDocumentClean();
            return stateData;
        },

        /**
         * retrieveState retrieves saved graph state
         * @method retrieveState
         * @return void
         */
        "retrieveState": function(savedState, isReset) {
            if (savedState !== void 0 && savedState.toolState !== void 0) {
                savedState = savedState.toolState;
            }
            // reset tool
            this._imageController.callReset();
            this._equationPanel._sliderPanel.resetSliderPanel();
            this._equationPanel._deleteAll();
            if (typeof isReset === 'undefined') {
                if (typeof savedState === 'string') {
                    this.model.set('loadedState', MathUtilities.Components.Utils.Models.Utils.convertToSerializable(JSON.parse(savedState)));
                } else {
                    this.model.set('loadedState', MathUtilities.Components.Utils.Models.Utils.convertToSerializable(savedState));
                }
                // clear undo redo stack for module graphingTool
                this._undoRedoManager.clearModule(MathUtilities.Tools.Graphing.Models.GraphingToolModel.MODULE_NAME);
            }
            var listsData,
                colHidden,
                graphData,
                MathHelper = MathUtilities.Components.Utils.Models.MathHelper;

            if (savedState && Object.keys(savedState).length) {
                if (typeof savedState === 'string') {
                    savedState = JSON.parse(savedState);
                }
                listsData = savedState.inputColumn.lists;
                graphData = savedState.graphData;
                this._equationPanel.model.set('equationDataUnits', savedState.inputColumn.units);
                colHidden = savedState.inputColumn.columnHidden;
                if (colHidden) {
                    this._hideColumnHandler(true);
                } else {
                    this._showColumnHandler();
                }
                this._gridGraphView.setAttribute(graphData);
                this._updateGraphOption(graphData);
                this.model.set('animateCharts', false);
                if (typeof graphData.precision === 'undefined') {
                    this.model.set('precision', MathHelper.DEFAULT_PRECISION_VALUE_GRAPHING_TOOL);
                } else {
                    this.spinnerView.updateSpinValue(graphData.precision);
                    this.model.set('precision', graphData.precision);
                }
                if (graphData.animateCharts) {
                    this.animateChartsClicked();
                }
                this._equationPanel.model.set('tableCounter', savedState.inputColumn.tableCounter);
                this._equationPanel._setInputColumnData(listsData, savedState.inputColumn.bestFitInfo, savedState.inputColumn.tableCounter,
                    savedState.inputColumn.columnHidden);
                this._equationPanel._sliderPanel.setSliderPanelState(savedState.inputColumn.sliderData, savedState.inputColumn.hideOtherSliders);
                if (savedState.imageData) {
                    this._imageController.callAddForUndoRedo(savedState.imageData, true);
                }
                if (savedState.inputColumn.units === 'deg') {
                    this._setEquationUnitDegree('deg');
                    this.$('#degree').addClass('activated');
                    this.$('#radian').removeClass('activated');
                } else {
                    this._setEquationUnitRadians();
                    this.$('#degree').removeClass('activated');
                    this.$('#radian').addClass('activated');
                }
                if (colHidden) {
                    _.delay(_.bind(function() {
                        this.closeKeyboard();
                    }, this), 5);
                }
            } else {
                this._resetGraphOptions();
            }
            this.setDocumentClean();
        },
        "_updateGraphOption": function(graphdata) {
            var $optionDiv = this.$('#grid-graph-options'),
                graphDisplay = graphdata.graphDisplay;
            this.$('#axis-line-icon, #axis-line').toggleClass('activated', graphDisplay.isAxisLinesShown === true);
            this.$('#grid-line-icon, #grid-line').toggleClass('activated', graphDisplay.isGridLineShown === true);
            this.$('#label-line-icon, #label-line').toggleClass('activated', graphDisplay.isLabelShown === true);
            $optionDiv.find('#x-labels-in-radian, #x-axis-label-chk-box')
                .toggleClass('activated', !!graphDisplay.isXmarkerInRadians);
            $optionDiv.find('#y-labels-in-radian, #y-axis-label-chk-box')
                .toggleClass('activated', !!graphDisplay.isYmarkerInRadians);
            $optionDiv.find('#equalize-axis-chk-box, #equalize-axis')
                .toggleClass('activated', graphdata.graphParameters.distanceBetweenTwoHorizontalLines === graphdata.graphParameters.distanceBetweenTwoVerticalLines);
            if (graphDisplay.isProjectorModeOn) {
                this._equationPanel._projectorMode = true;
            }
        },
        "_resetGraphOptions": function() {
            this._equationPanel._projectorModeOff();
            var $optionDiv = this.$('#grid-graph-options'),
                selectedText = this.getAccMessage('selected-text', 0),
                hideText = this.getAccMessage('hide-text', 0);
            this._gridGraphView.setAttribute(jQuery.extend(true, {}, this._gridDefaultState));
            this.$('#axis-line-icon, #grid-line-icon, #label-line-icon, #axis-line, #grid-line, #label-line, #radian').addClass('activated');
            $optionDiv.find('#x-labels-in-radian, #y-labels-in-radian').removeClass('activated');
            this.$('#degree').removeClass('activated');
            this.model.set('equationDataUnits', 'rad');
            this._setEquationUnitRadians('rad');
            this.changeAccMessage('grid-line', 0, [selectedText, hideText]);
            this.changeAccMessage('label-line', 0, [selectedText, hideText]);
            this.changeAccMessage('axis-line', 0, [selectedText, hideText]);
        },
        "_updateListBoxHeightDueToSlider": function() {
            var $currentEl = this.$el,
                PADDING = 5,
                $sliderPanel = this._graphingToolView.$('#sliders-bottom-panel-container'),
                inputColumn = this.$('#input-data');
            if ($sliderPanel.is(':visible')) {
                inputColumn.height($currentEl.height() - $sliderPanel.height() - this._graphingToolView.$('#slider-title-holder').height() - PADDING);
            } else {
                inputColumn.height($currentEl.height() - this.$('#input-column-options').height() - this.$('#title').height());
            }
        },
        /**
         * _updateListBoxHeight updates listBox height
         * @method _updateListBoxHeight
         * @param isKeyboardClose {Boolean} flag to check keyboard is closed or opened
         * @return void
         */
        "_updateListBoxHeight": function(isKeyboardClose) {
            var $currentEl = this.$el,
                inputColumn = this.$('#input-data');
            if (isKeyboardClose) {
                if (!this.$('#sliders-bottom-panel-container').is(':visible')) {
                    inputColumn.height($currentEl.height() - this.$('#input-column-options').height() - this.$('#title').height());
                }
            } else if (!this.isKeyboardClosed) {
                inputColumn.height($currentEl.height() - this._keyboardHeight - this.$('#input-column-options').height());
            } else {
                inputColumn.height($currentEl.height() - this.$('#input-column-options').height() - this.$('#title').height());
            }
        },

        "_closeAlertBox": function($modal) {
            $modal.modal('hide');
            this._setActiveElementFocus();
        },

        "_callGetNumberForToolTip": function(newNumber, precision) {
            return this._gridGraphView._getNumberForToolTip(newNumber, precision);
        },

        "_callFocusTableConstants": function($list) {
            var tableView = this._equationPanel._getTableViewObject($list);
            this._equationPanel._focusTableConstants(tableView);
        },

        /**
         * Initializes accessibility
         *
         * @method _initAccessibility
         * @private
         */
        "_initAccessibility": function() {
            if (this.canvasAcc) {
                this.canvasAcc.unbind();
                this.canvasAcc.model.destroy();
            }
            var canvasAccOption = {
                "canvasHolderID": 'grid-graph-canvas-acc-container',
                "paperItems": [],
                "accManager": this.accManagerView
            };

            this.canvasAcc = MathUtilities.Components.CanvasAcc.Views.CanvasAcc.initializeCanvasAcc(canvasAccOption);
        },

        "_bindAccessibilityListeners": function() {
            var self = this,
                keyEvents = MathUtilities.Components.CanvasAcc.Models.CanvasAcc.CANVAS_KEY_EVENTS,
                canvasEvents = MathUtilities.Components.CanvasAcc.Models.CanvasAcc.CANVAS_EVENTS,
                keyUpEvents = MathUtilities.Components.CanvasAcc.Models.CanvasAcc.CANVAS_KEYUP_EVENTS,
                $canvasHolder = $('#grid-graph-canvas-acc-container');

            // Handle tab
            $canvasHolder.off(keyEvents.TAB).on(keyEvents.TAB, function(currEvent, data) {
                self._tabKeyPressed(currEvent, data);
            });

            // Handle space
            $canvasHolder.off(keyEvents.SPACE).on(keyEvents.SPACE, function(currEvent, data) {
                self._spaceKeyPressed(currEvent, data);
            });

            // Handle focus out
            $canvasHolder.off(canvasEvents.FOCUS_OUT).on(canvasEvents.FOCUS_OUT, function(currEvent, data) {
                self._focusOut(currEvent, data);
            });

            // Handle esc
            $canvasHolder.off(keyUpEvents.ANY_KEYUP).on(keyUpEvents.ANY_KEYUP, function(event, currEvent, keyCode, canvasItem) {
                self._anyKeyUp(event, currEvent, keyCode, canvasItem);
            });

            $canvasHolder.off(keyEvents.ARROW).on(keyEvents.ARROW, function(currEvent, data) {
                self._arrowKeyPressed(currEvent, data);
            });

        },

        /**
         * Gives focus effect to end point on tab
         * @method _tabKeyPressed
         * @param {Object} event Event object
         * @param {Object} data Data object
         * @private
         **/
        "_tabKeyPressed": function(event, data) {
            if (this.canvasAcc.model.get('disableSelfFocusOnSpace') === false) {
                this.canvasAcc.model.set('disableSelfFocusOnSpace', true);
            }
            if (data.item.children && data.item.children[0].equation.styleType === "line" && data.item.children[0].equation.getPoints().length === 1) {
                return void 0;
            }
            if (data.item.type === "raster") {
                this._imageController.deselectAll();
            }
            if (this.previousItem && this.previousItem.name === 'br' && data.item !== this.previousParentItem) {
                this.focusRect.opacity = 0;
                this._gridGraphView.trigger('image-layer-mousedown-sensed', event, this.previousParentItem);
                this.setFocus('delete-image', 100);
                this.$('#grid-graph-canvas-acc-container-acc-elem').removeClass('hide-outline');
                return void 0;
            }
            this.setAccMessageOnTab(event, data.item);
            if (this.previousParentItem === data.item || this.nextParentItem === data.item) {
                this.previousParentItem = null;
                this.nextParentItem = null;
                this.addAllPaperItems(true);
            }
            if (this.previousParentItem === null && data.item.type !== "raster") {
                if (data.item.children) {
                    data.item.children[0].equation.trigger('focus-equation');
                }
            }
            this.previousItem = data.item;
            this.setFocusRectPosition(data.item);
            this.$('#grid-graph-canvas-acc-container-acc-elem').addClass('hide-outline');
        },
        "setAccMessageOnTab": function(event, item) {
            var allPaperItems,
                equationData,
                accText,
                displayPoint,
                currentIndex,
                xPointText,
                yPointText,
                minusText = this.getAccMessage('grid-graph-canvas-acc-container', 17);
            switch (item.type) {
                case 'group':
                    equationData = item.children[0].equation;
                    if (equationData.getEquationDataType() === 'bestFit') {
                        this.changeAccMessage('grid-graph-canvas-acc-container', 9, [equationData.getAccText(), equationData.getParentEquation().getTableName()]);
                    } else if (["points", "both", "line"].indexOf(equationData.styleType) > -1) {
                        displayPoint = equationData.getPoints();
                        if (displayPoint.length === 1) {
                            this.changeAccMessage('grid-graph-canvas-acc-container', 18, [displayPoint[0][0], displayPoint[0][1]]);
                        } else {
                            this.changeAccMessage('grid-graph-canvas-acc-container', 19);
                        }
                    } else {
                        this.changeAccMessage('grid-graph-canvas-acc-container', 1, [equationData.getAccText()]);
                    }
                    this._triggerMouseLeaveOnPoints(item);
                    break;
                case 'path':
                    if (item.data.displayPoint) {
                        xPointText = Number(item.data.displayPoint[0]);
                        yPointText = Number(item.data.displayPoint[1]);
                        if (xPointText < 0) {
                            xPointText = minusText + " " + Math.abs(xPointText);
                        }
                        if (yPointText < 0) {
                            yPointText = minusText + " " + Math.abs(yPointText);
                        }
                    }
                    if (item.equation.getSpecie() === "point") {
                        this.accManagerView.changeAccMessage('grid-graph-canvas-acc-container', 1, [item.equation.getAccText()]);
                        break;
                    }
                    switch (item.equation.getEquationDataType()) {
                        case 'criticalPoints':
                            this.changeAccMessage('grid-graph-canvas-acc-container', 2, [xPointText, yPointText]);
                            this._triggerMouseEvents('criticalPoints', item, false);
                            break;
                        case 'interceptPoints':
                            displayPoint = item.data.displayPoint;
                            if (parseInt(displayPoint[0]) === 0 && parseInt(displayPoint[1]) === 0) {
                                accText = this.getAccMessage('grid-graph-canvas-acc-container', 16);
                            } else if (parseInt(displayPoint[0]) === 0) {
                                accText = 'y';
                            } else {
                                accText = 'x';
                            }

                            this.changeAccMessage('grid-graph-canvas-acc-container', 4, [accText, xPointText, yPointText]);
                            this._triggerMouseEvents('interceptPoints', item, false);
                            break;
                        case 'discontinousPoints':
                        case 'hollowPoints':
                            this.changeAccMessage('grid-graph-canvas-acc-container', 6, [xPointText, yPointText]);
                            this._triggerMouseEvents('discontinousPoints', item, false);
                            break;
                        case 'intersectionsPoints':
                            this.changeAccMessage('grid-graph-canvas-acc-container', 3, [item.equation.hasParent.getAccText(), xPointText, yPointText]);
                            this._triggerMouseEvents('intersectionsPoints', item, false);
                            break;
                    }
                    if (item.name === 'br') {
                        this.changeAccMessage('grid-graph-canvas-acc-container', 8);
                    }
                    if (item.equation.getSpecie() === "error") {
                        this.changeAccMessage('grid-graph-canvas-acc-container', 18, [xPointText, yPointText]);
                    }
                    break;
                case 'raster':
                    this._gridGraphView.trigger('image-layer-mousedown-sensed', event, item);
                    this.changeAccMessage('grid-graph-canvas-acc-container', 7);
                    this._triggerMouseLeaveOnPoints(item);
                    break;
            }
            this.canvasAcc.setSelfFocus();
        },

        /**
         *
         * @method _spaceKeyPressed
         * @param {Object} event Event object
         * @param {Object} data Data object
         * @private
         **/
        "_spaceKeyPressed": function(event, data) {
            if (this.canvasAcc.model.get('disableSelfFocusOnSpace') === false) {
                this.canvasAcc.model.set('disableSelfFocusOnSpace', true);
            }
            if (data.item.type === "raster" || this.previousParentItem === null &&
                data.item.children && data.item.children[0].equation.getEquationDataType() !== 'bestFit') {
                var criticalPoints = [],
                    equationData;

                if (data.item.type == "raster") {
                    criticalPoints = [this._imageController.rasterData.bottomRight];
                } else {
                    equationData = data.item.children[0].equation;
                    if (equationData.styleType === "line") {
                        return void 0;
                    }
                    if (equationData.getPlot()) {
                        criticalPoints = this._getCriticalPoints(equationData.getPlot().getPointsGroup().children, criticalPoints);
                    } else {
                        criticalPoints = this._getAllCriticalPoints(equationData);
                    }
                }
                this._updatePaperItemsArray(event, criticalPoints, data.item, true);
            } else if (data.item.type === 'path') {
                event.target = data.item;
                event.event = {
                    "which": 1
                };
                data.item.trigger('mousedown', event);
            }
        },

        /**
         * Removes focus effect from endpoint
         * @method _focusOut
         * @param {Object} event Event object
         * @param {Object} data Data object
         * @private
         **/
        "_focusOut": function(event, data) {
            if (this.canvasAcc.model.get('disableSelfFocusOnSpace') === false) {
                this.canvasAcc.model.set('disableSelfFocusOnSpace', true);
            }
            this.focusRect.opacity = 0;
            this._gridGraphView.refreshView();
            this.$('#grid-graph-canvas-acc-container-acc-elem').removeClass('hide-outline');
            if (event && this.previousItem.name === 'br') {
                this._gridGraphView.trigger('image-layer-mousedown-sensed', event, this.previousParentItem);
                this.setFocus('add-image');
                return void 0;
            }
            if (data && this.previousItem && this.previousItem.type === 'path') {
                this._triggerMouseEvents(this.previousItem.equation.getEquationDataType(), data.item, true);
                this._gridGraphView.refreshView();
            }
            this.previousParentItem = null;
            this.previousItem = null;
            this.nextParentItem = null;
            this.addAllPaperItems(false);
            this._imageController.deselectAll();
            this.changeAccMessage('grid-graph-canvas-acc-container', 0);

        },
        "_getAllCriticalPoints": function(equationData) {
            var allCriticalPoints = [],
                allCriticalPointsEquations = [equationData.getCriticalPoints(),
                    equationData.getInterceptPoints(),
                    equationData.getDiscontinuousPoints(),
                    equationData.getHollowPoints()
                ],
                counter, currentEquation,
                intersectionsObj = equationData.getIntersectionPoints(),
                length = allCriticalPointsEquations.length;
            for (counter = 0; counter < length; counter++) {
                currentEquation = allCriticalPointsEquations[counter];
                if (currentEquation !== null && currentEquation.getPointsGroup() !== null) {
                    this._getCriticalPoints(currentEquation.getPointsGroup().children, allCriticalPoints);
                }
            }
            this._getAllIntersectionPoints(intersectionsObj, allCriticalPoints);
            return allCriticalPoints;
        },

        "_getAllIntersectionPoints": function(intersectionsObj, actualArr) {
            var counter,
                currentEquation;
            if (intersectionsObj !== null) {
                for (counter in intersectionsObj) {
                    currentEquation = intersectionsObj[counter];
                    if (currentEquation !== null && currentEquation.getPointsGroup() !== null) {
                        this._getCriticalPoints(currentEquation.getPointsGroup().children, actualArr);
                    }
                }
            }
        },

        "_anyKeyUp": function(event, currEvent, keyCode, canvasItem) {
            var equationData,
                criticalPoints = [],
                points,
                criticalPointsLength;

            if ((this.previousParentItem === null && canvasItem.type !== "raster" ||
                    this.previousParentItem !== null && keyCode === 82 && canvasItem.name !== 'br') &&
                (canvasItem.children && canvasItem.children[0].equation.getSpecie() !== "polygon" ||
                    canvasItem.equation && ["error", "point"].indexOf(canvasItem.equation.getSpecie()) === -1)) {
                switch (keyCode) {
                    case 82: // r character key
                        if (this.previousParentItem !== null) {
                            this.addAllPaperItems(false);
                            this.setAccMessageOnTab(event, this.previousParentItem);
                            this.canvasAcc.setCurrentPaperItem(this.previousParentItem, true);
                            this.setFocusRectPosition(this.previousParentItem);
                            this.previousParentItem = null;
                            this.nextParentItem = null;
                        }
                        return void 0;
                    case 67: // c character key
                        criticalPoints = this._getCriticalPoints(canvasItem.children[0].equation.getCriticalPoints().getPointsGroup().children, criticalPoints);
                        break;
                    case 73: // i character key
                        criticalPoints = this._getCriticalPoints(canvasItem.children[0].equation.getInterceptPoints().getPointsGroup().children, criticalPoints);
                        break;
                    case 68: // d character key
                        points = canvasItem.children[0].equation.getDiscontinuousPoints().getPointsGroup().children;
                        criticalPoints = this._getCriticalPoints($.merge(points, canvasItem.children[0].equation.getHollowPoints().getPointsGroup().children), criticalPoints);
                        break;
                    case 83: // s character key
                        this._getAllIntersectionPoints(canvasItem.children[0].equation.getIntersectionPoints(), criticalPoints);
                        break;
                    default:
                        return void 0;
                }

                criticalPointsLength = criticalPoints.length;
                if (criticalPointsLength > 0) {
                    this._updatePaperItemsArray(event, criticalPoints, canvasItem, true);
                }
            }
        },
        "_arrowKeyPressed": function(event, data) {
            var item,
                arrowText,
                rasterData = this._imageController.rasterData,
                transformationView;
            if (data.directionX === 1) {
                arrowText = this.getAccMessage('grid-graph-canvas-acc-container', 12);
            } else if (data.directionX === -1) {
                arrowText = this.getAccMessage('grid-graph-canvas-acc-container', 11);
            } else if (data.directionY === 1) {
                arrowText = this.getAccMessage('grid-graph-canvas-acc-container', 14);
            } else if (data.directionY === -1) {
                arrowText = this.getAccMessage('grid-graph-canvas-acc-container', 13);
            }
            if (data.item.name === 'br') {
                event = {
                    "point": {
                        "x": data.point.x + data.directionX * 10,
                        "y": data.point.y + data.directionY * 10
                    },
                    "target": data.item,
                    "isAccessible": true
                };
                this._gridGraphView.trigger('service-layer-mousedown , grid-graph-mousedrag , grid-graph-mouseup', event);
                this.changeAccMessage('grid-graph-canvas-acc-container', 15);
            } else if (data.item.type === 'raster') {
                transformationView = MathUtilities.Tools.Graphing.Views.ImageTransformation.getTransformationGridViewObject(this._gridGraphView._paperScope, this, rasterData.rasterImage.equation.getRaster(), this._gridGraphView.$el);
                if (transformationView.lastMovePosition === null) {
                    transformationView.lastMovePosition = rasterData.rectangle.position;
                }
                item = rasterData.rectangle;
                event = {
                    "point": {
                        "x": item.position.x + data.directionX * 10,
                        "y": item.position.y + data.directionY * 10
                    },
                    "target": item.children[0]
                };
                this._gridGraphView.trigger('service-layer-mousedown , grid-graph-mousedrag , grid-graph-mouseup', event);
                this.changeAccMessage('grid-graph-canvas-acc-container', 10, [arrowText]);
            }
            this.setFocusRectPosition(data.item);
        },
        "_getCriticalPoints": function(pointsArr, actualPoints) {
            var counter = 0,
                pointsArrLength = pointsArr.length;
            for (; counter < pointsArrLength; counter++) {
                if (!pointsArr[counter].hit) {
                    actualPoints.push(pointsArr[counter]);
                }
            }
            return actualPoints;
        },

        "setFocusRectPosition": function(item) {
            var MINWIDTHANDHEIGHT = 20;
            if (!this.focusRect) {
                this.focusRect = this._gridGraphView.drawFocusRect();
            }
            this.focusRect.bounds.width = item.bounds.width > MINWIDTHANDHEIGHT ? item.bounds.width : MINWIDTHANDHEIGHT;
            this.focusRect.bounds.height = item.bounds.height > MINWIDTHANDHEIGHT ? item.bounds.height : MINWIDTHANDHEIGHT;
            this.focusRect.position = item.position;
            this.focusRect.opacity = 1;
            this._gridGraphView.refreshView();
        },

        "_triggerMouseEvents": function(equationDataType, item, isOnlyMouseLeave) {
            var points = [],
                eventObj = {
                    "target": this.previousItem,
                    "event": {}
                };
            if (['criticalPoints', 'interceptPoints', 'discontinousPoints', 'hollowPoints', 'intersectionsPoints'].indexOf(equationDataType) > -1) {
                points = item.type === 'group' ? this.previousItem._parent : item._parent;
            } else {
                return void 0;
            }
            if (this.previousItem.type === 'path') {
                points.trigger('mouseleave', eventObj);
            }
            if (!isOnlyMouseLeave) {
                eventObj.target = item;
                points.trigger('mouseenter', eventObj);
            }
        },

        "_triggerMouseLeaveOnPoints": function(item) {
            if (this.previousItem && this.previousItem.name !== "move" && this.previousItem.type === 'path') {
                this._triggerMouseEvents(this.previousItem.equation.getEquationDataType(), item, true);
            }
        },
        "_graphEqualize": function(event) {
            if (event.keyCode === 32) { // space key
                this.changeAccMessage('equalize-axis', 0, [this.getAccMessage('selected-text', 0)]);
                this.setFocus('equalize-axis');
            }
        },

        "isAccDivPresent": function(target) {
            if (target.hasClass('acc-read-elem') || target.children('.acc-read-elem').length > 0) {
                return true;
            }
            return false;
        },

        "_focusOutOnDeleteImage": function(event) {
            if (event.keyCode === 9) { // tab key
                if (event.shiftKey === false) {
                    this.addAllPaperItems(true);
                    this._imageController.deselectAll();
                    var allPaperItems = this.canvasAcc.model.getCollectionItems(),
                        itemsLength = allPaperItems.length,
                        currentIndex = allPaperItems.indexOf(this.previousParentItem);
                    if (currentIndex > -1 && currentIndex < itemsLength - 1) {
                        event.preventDefault();
                        this._gridGraphView.trigger('image-layer-mousedown-sensed', event, allPaperItems[currentIndex + 1]);
                        this._handleImageAccessibility(allPaperItems[currentIndex + 1], 10);
                    } else if (this.previousParentItem) {
                        this._gridGraphView.trigger('image-layer-mousedown-sensed', event, this.previousParentItem);
                    }
                } else if (event.shiftKey === true) {
                    if (this.previousParentItem) {
                        this._gridGraphView.trigger('image-layer-mousedown-sensed', event, this.previousParentItem);
                        this._updatePaperItemsArray(event, [this._imageController.rasterData.bottomRight], this.previousParentItem, true);
                        this._handleImageAccessibility(this.previousItem, 10);
                    }
                }
            }
        },

        "_updatePaperItemsArray": function(event, criticalPoints, item, isMsg) {
            var allPaperItems = this.canvasAcc.model.getCollectionItems(),
                counter = 0,
                currentIndex = allPaperItems.indexOf(item) + 1,
                criticalPointsLength = criticalPoints.length;
            this.nextParentItem = allPaperItems[currentIndex];
            for (; counter < criticalPointsLength; counter++) {
                allPaperItems.splice(currentIndex + counter, 0, criticalPoints[counter]);
            }
            this.canvasAcc.updatePaperItems(allPaperItems);
            this.previousParentItem = item;
            if (isMsg) {
                this.setAccMessageOnTab(event, allPaperItems[currentIndex]);
            }
            this.canvasAcc.setCurrentPaperItem(allPaperItems[currentIndex], true);
            this.setFocusRectPosition(allPaperItems[currentIndex]);
            this.previousItem = allPaperItems[currentIndex];

        },

        /**
         * _hideHandler handles hiding of opened pop ups on mousedown
         * @method _hideHandler
         * @param {event} event object
         * @return void
         */
        "_hideHandler": function(event, htmlElement, eventObject) {
            var target = $(event.target),
                targetId = target.attr('id'),
                self = this,
                targetClass = target.attr('class'),
                notHideableIds,
                targetAncestor = target.parents(),
                equationPanelView = this._equationPanel,
                $list, $lastFocusedMathquill = equationPanelView.model.get('cursorClassTag'),
                $targetLists, $targetLists1, $targetLists2, $targetLists3, cid,
                closeKeyboard = true,
                hasCursor = this.$('.outerDiv .hasCursor');
            if (targetId === 'math-tool-btn-screenshot-4' || targetId === 'math-tool-screenshot-btn-icon-4') {
                this._chartManagerView.hideAllTableChartOptions();
            }
            notHideableIds = ['grid-graph', 'delete-image-icon', 'clear-list-ok-button', 'delete-image', 'add-image-icon',
                'add-image', 'undo-graph', 'undo-graph-icon', 'redo-graph', 'redo-graph-icon', 'delete-all', 'delete-all-text',
                'save-state', 'retrieve-state', 'import-csv', 'clear-list-cancel-button', 'title',
                'grid-graph-canvas-acc-container-temp-focus-div', 'grid-graph-canvas-acc-container'
            ];
            if (this.focusRect && (event.which === 1 || MathUtilities.Components.Utils.Models.BrowserCheck.isMobile)) {
                this.focusRect.opacity = 0;
                this._gridGraphView.refreshView();
            }
            if (targetId === void 0 && eventObject !== void 0) {
                target = $(eventObject.target);
                targetId = target.attr('id');
            }
            if (!(notHideableIds.indexOf(targetId) !== -1 || targetAncestor.is('#title') ||
                    targetAncestor.is('#math-tool-top-toolbar-4') || targetAncestor.is('#math-tool-bottom-container') ||
                    targetAncestor.is('.modal'))) {
                this._imageController.deselectAll();
            }
            if ($(event.target).parent().is('#settings,.handler-warning,#undo-graph,#redo-graph,.btn-primary')) {
                target = $(event.target).hasClass('acc-read-elem') ? $(event.target).parent() : $(event.target);
            } else {
                target = $(event.target);
            }
            targetClass = target.attr('class');
            targetId = target.attr('id');
            this._gridGraphView.setTextBoxValuesToPrevious();
            if (!targetAncestor.is('.math-utilities-math-editor-keyboard')) {
                if (hasCursor.length === 1) {
                    equationPanelView._blurMathquill(hasCursor);
                    equationPanelView.model.set('cursorClassTag', hasCursor);
                } else {
                    equationPanelView._blurMathquill($lastFocusedMathquill.first());
                }
                if (this.$('.list-focus').length !== 0) {
                    equationPanelView._lastBlurList = this.$('.list-focus');
                    if ($lastFocusedMathquill.length > 1) {
                        $lastFocusedMathquill = $(equationPanelView._lastBlurList).find('.mathquill-editable');
                    }
                }
                if ($lastFocusedMathquill.first().parents('.list').attr('data-equation-cid') !== target.parents('.list').attr('data-equation-cid')) {
                    equationPanelView._changePlotLatex(equationPanelView._lastBlurList);
                } else {
                    if (target.parents('.list-handle').length !== 0 || target.hasClass('list-handle')) {
                        equationPanelView._changePlotLatex(equationPanelView._lastBlurList);
                    }
                }
            }
            notHideableIds = ['add-to-list', 'undo-graph', 'undo-graph-icon', 'redo-graph', 'redo-graph-icon',
                'delete-all', 'item-table', 'item-table-icon', 'add-function', 'add-function-icon',
                'keyboardTitleHolder', 'editor-1', 'keyboardContainer', 'delete-all-graph', 'undo-graph',
                'redo-graph', 'item-table', 'input-data'
            ];
            if (targetAncestor.is('.list') && (targetClass !== 'graphing-tool-editor-color-style-box-equation' &&
                    !targetAncestor.is('.graphing-tool-editor-color-style-box-equation')) && !(targetAncestor.is('.list-handle') ||
                    target.is('.list-handle') || target.is('.delete-list') || target.is('.show-hide-equation') ||
                    target.is('.graph-style-edit-options') || targetAncestor.is('.graph-style-edit-options')) &&
                !(targetClass === 'list-toggle-button-container' || target.hasClass('list-header-container') ||
                    targetAncestor.is('.list-header-container'))) {
                $list = target.parents('.list');
                if ($list.hasClass('disabled')) {
                    this._equationPanel._updateListWidth($list.find('.equation-box').outerWidth());
                } else {
                    $list.parent().find('.list.list-focus').each(function() {
                        var $currentElement = $(this),
                            equationPanel = self._equationPanel;
                        $currentElement.removeClass('list-focus');
                        if (!$currentElement.hasClass('disabled')) {
                            $currentElement.find('.list-handle').removeClass('warning-list-focus');
                        }
                        $currentElement.find('.list-drag').show();
                        $currentElement.find('.list-handle').removeClass('warning-list-focus').addClass('list-sortable');
                        $currentElement.find('.equation-box').removeClass('equation-box-focus');
                        equationPanel._hideCriticalPoints(equationPanel._getMappedEquationData($currentElement));
                    });
                    if (!equationPanelView._isListCollapsed($list)) {
                        $list.addClass('list-focus')
                            .find('.list-handle').addClass('warning-list-focus').removeClass('list-sortable');
                        $list.find('.equation-box').addClass('equation-box-focus');
                        $list.find('.list-drag').hide();
                        equationPanelView._showCriticalPoints(equationPanelView._getMappedEquationData($list));
                    }
                    closeKeyboard = false;
                    if ($list.attr('data-type') !== 'table') {
                        if (!(targetAncestor.is('.slider-box-container') || targetAncestor.is('.limit-change'))) {
                            equationPanelView._blurMathquill(hasCursor);
                            $list.find('textarea').focus();
                            event.preventDefault();
                        }
                    } else {
                        this._callFocusTableConstants($list);
                        equationPanelView._blurMathquill(hasCursor);
                        if (target.hasClass('equation-box')) {
                            closeKeyboard = true;
                        }
                    }
                }
            }
            if (!(target.hasClass('common-chart-button') || target.parent().hasClass('common-chart-button') ||
                    target.hasClass('chart-btns-container') || target.parent().hasClass('chart-btns-container') ||
                    target.hasClass('chart-btns') || target.parent().hasClass('chart-btns'))) {
                this.$('.chart-btns-container').hide();
                this.$('.common-chart-button').removeClass('selected');
            }
            if (!targetAncestor.is('.list-options-container, .graphing-tool-editor-sort-options-container') &&
                !target.hasClass('input-data') && !(target.is('#hide-column') || targetAncestor.is('#hide-column')) &&
                !(targetClass === 'list-toggle-button-container' || targetAncestor.is('.list-toggle-button-container'))) {
                if (targetAncestor.is('.list, .graphing-tool-editor-color-style-box, .graphing-tool-editor-best-fit-options-container, .graphing-tool-editor-data-analysis-options-container, .graphing-tool-editor-residual-options-container') ||
                    target.hasClass('graphing-tool-editor-color-style-box') || target.hasClass('graphing-tool-editor-best-fit-options-container') ||
                    target.hasClass('graphing-tool-editor-data-analysis-options-container') || target.hasClass('graphing-tool-editor-residual-options-container')) {
                    if (targetAncestor.is('.graphing-tool-editor-color-style-box, .graphing-tool-editor-best-fit-options-container, .graphing-tool-editor-data-analysis-options-container, .graphing-tool-editor-residual-options-container') ||
                        target.hasClass('graphing-tool-editor-color-style-box') || target.hasClass('graphing-tool-editor-best-fit-options-container') ||
                        target.hasClass('graphing-tool-editor-data-analysis-options-container') || target.hasClass('graphing-tool-editor-residual-options-container')) {
                        cid = $('.graphing-tool-editor-color-style-box').attr('data-target-equation-data-cid');
                        $list = $('.cell[data-equation-cid=' + cid + ']').parents('.list');
                    } else {
                        $list = target.parents('.list');
                    }
                    if (targetClass === 'slider-box' || targetAncestor.is('.list-options-container')) {
                        this._equationPanel._updateListWidth($list.find('.equation-box').outerWidth());
                    }
                    if ($list.attr('data-type') === 'table' && !targetAncestor.is('.chart-btns-container')) {
                        this._equationPanel._updateListWidth($list.find('.equation-box').outerWidth());
                    }
                    if (target.hasClass('list-drag') || target.hasClass('list-handle')) {
                        this._equationPanel._updateListWidth();
                    }
                } else {
                    if (['item-table', 'item-table-icon', 'add-function', 'add-function-icon', 'redo-graph', 'redo-graph-icon', 'undo-graph', 'undo-graph-icon'].indexOf(targetId) === -1 && !target.hasClass('btn-primary')) {
                        this._equationPanel._updateListWidth();
                    }
                }
            } else {
                closeKeyboard = false;
            }
            if (!(target.hasClass('function-option-container') || target.hasClass('function-option') ||
                    target.hasClass('function-btn') || targetAncestor.is('.function-btn') || targetAncestor.is('.function-option') ||
                    !this.$('.function-option-container').is(':visible'))) {
                this.$('.function-option-container').hide();
                this.$('#input-data').removeClass('input-data-scroll-hidden');
            }
            if (!(target.parents('.slider-div').length || target.parents('.limit-change').length)) {
                equationPanelView.$('.limit-change').hide();
                equationPanelView.$('.slider-div').show();
            }
            if (this.$('#sliders-bottom-panel-container').is(':visible') &&
                (["screenshot-btn", "math-tool-screenshot-btn-icon"].indexOf(targetClass) !== -1 || targetAncestor.is('.screenshot-btn'))) {
                closeKeyboard = false;
            }

            if (closeKeyboard && notHideableIds.indexOf(targetId) === -1 && !targetAncestor.is('#delete-all') &&
                !targetAncestor.is('#keyboardContainer') && !targetAncestor.is('#keyboardTitleHolder') &&
                !targetAncestor.is('#editor-1') && !targetAncestor.is('#slider-panel') &&
                !targetAncestor.is('.delete-list-container') && !target.hasClass('show-hide-equation') && ['slider', 'delete-list', 'graph-warning-container'].indexOf(targetClass) === -1 &&
                !targetAncestor.is('.graph-warning-container')) {
                this.closeKeyboard();
                if (!targetAncestor.is('#save-screen-shot-modal')) {
                    this._equationPanel._sliderPanel.hidePanel();
                    this._updateListBoxHeight(true);
                }
            }
            if ((targetAncestor.is('#keyboardTitleHolder') || targetId === 'keyboardTitleHolder') &&
                this.$('.keyboardContainer').is(':visible') && !this.$('#input-column').is(':visible')) {
                this._showColumnHandler();
            }
            if ((targetAncestor.is('#editor-1') || targetId === 'editor-1') && !$list.hasClass('disabled')) {
                this.openKeyboard();
                this._updateListBoxHeight(false);
            }
            if (!targetAncestor.is('.graph-warning-container')) {
                equationPanelView._toggleHandlerWarningText(event);
            }
            if (!(targetAncestor.is('.slider-settings-window') || targetAncestor.is('.slider-settings-icon-holder') ||
                    target.hasClass('slider-settings-icon-holder') || targetId === 'slider-settings-window')) {
                this.trigger('close-slider-settings');
            }
            this._setActiveElementFocus();
            if (!this.model.get('_anyPopupOpen') || targetAncestor.is('.modal-scrollable')) {
                return void 0;
            }
            if (targetAncestor.is('.modal-scrollable') || target.is('.modal-scrollable')) {
                this._equationPanel._bestFitAlertDisplayed = false;
                return void 0;
            }
            if (targetAncestor.is('.modal-scrollable')) {
                this._bestFitAlertDisplayed = false;
                return void 0;
            }
            this._equationPanel.model.set('tableCursorClassPrev', this.$('.cursor').prev());
            if (typeof targetId === 'undefined' && typeof eventObject !== 'undefined') {
                target = $(eventObject.target);
                targetId = target.attr('id');
            }
            if (['settings', 'options-container', 'settings-icon', 'grid-graph-options'].indexOf(targetId) === -1 &&
                target.parents('#options-container').length === 0 || targetId === 'arrow-left-panel' || targetId === 'arrow-right-panel') {
                this.$('#options-container').hide();
                this.$('#settings').removeClass('activated');
                this.restorePrecision();
            }
            if (!(targetAncestor.is('.graphing-tool-editor-color-style-box-equation') ||
                    target.hasClass('graphing-tool-editor-color-style-box-equation') || targetClass === 'change-graph-style')) {
                $targetLists = this.$('.graphing-tool-editor-color-style-box-equation');
                if (targetClass === 'handler-warning graph' || targetAncestor.hasClass('handler-warning graph') ||
                    targetClass === 'graph-style-edit-options' || targetAncestor.hasClass('graph-style-edit-options')) {
                    if (targetClass === 'handler-warning graph' || targetAncestor.hasClass('handler-warning graph')) {
                        this.$('#input-data').removeClass('input-data-scroll-hidden');
                    }
                    $targetLists.each(function() {
                        var $currentElement = $(this);
                        if ($currentElement.attr('data-target-equation-data-cid') !== target.parents('.list').attr('data-equation-cid')) {
                            $currentElement.hide();
                        }
                    });
                } else {
                    $targetLists.hide();
                }
            } else {
                $targetLists = this.$('.graphing-tool-editor-color-style-box-equation');
                if (!targetAncestor.is('.activated')) {
                    $targetLists.find('.activated').removeClass('activated');
                }
            }
            if (!targetAncestor.is('.graphing-tool-editor-color-style-box-table') &&
                !target.hasClass('graphing-tool-editor-best-fit-options-container') &&
                !target.hasClass('graphing-tool-editor-residual-options-container') &&
                !target.hasClass('graphing-tool-editor-color-style-box-table') &&
                targetClass !== 'change-graph-style' && targetClass !== '.graphing-tool-editor-best-fit-options-container' &&
                !targetAncestor.is('.graphing-tool-editor-best-fit-options-container') &&
                targetClass !== '.graphing-tool-editor-residual-options-container' &&
                !targetAncestor.is('.graphing-tool-editor-residual-options-container') &&
                !target.hasClass('graphing-tool-editor-data-analysis-options-container') &&
                !targetAncestor.is('.graphing-tool-editor-data-analysis-options-container') &&
                !targetAncestor.is('.graphing-tool-editor-sort-options-container') &&
                !target.hasClass('change-graph-style') &&
                !target.hasClass('handler-warning')) {
                $targetLists = this.$('.graphing-tool-editor-color-style-box-table');
                $targetLists1 = this.$('.graphing-tool-editor-best-fit-options-container');
                $targetLists2 = this.$('.graphing-tool-editor-data-analysis-options-container');
                $targetLists3 = this.$('.graphing-tool-editor-residual-options-container');
                $targetLists.hide();
                $targetLists1.hide();
                $targetLists2.hide();
                $targetLists3.hide();
                this.$('.graphing-tool-editor-sort-options-container').hide();
                if (!(targetAncestor.is('#best-fit-line') || targetAncestor.is('#best-fit-slope') ||
                        targetAncestor.is('#best-fit-exp') || targetAncestor.is('#best-fit-curve-error'))) {
                    if (targetClass === 'handler-warning table-graph' || targetAncestor.hasClass('handler-warning table-graph')) {
                        $targetLists.each(function() {
                            var $currentElement = $(this);
                            if ($currentElement.attr('data-target-equation-data-cid') !== target.parents('.cell').attr('data-equation-cid')) {
                                $currentElement.hide();
                            }
                        });
                    } else {
                        if (!(this.$('.graphing-tool-editor-color-style-box-equation').is(':visible') ||
                                targetAncestor.is('.delete-list-container') || targetAncestor.is('.show-hide-equation-container') ||
                                targetClass === 'list-toggle-button-container' || targetAncestor.is('.list-toggle-button-container') ||
                                target.hasClass('show-hide-equation') || target.hasClass('delete-list'))) {
                            this.$('#input-data').removeClass('input-data-scroll-hidden');
                            this.$('#input-data-extension').height(0);
                        }
                    }
                }
            } else {
                $targetLists = this.$('.graphing-tool-editor-color-style-box-table');
                if (!targetAncestor.is('.activated')) {
                    $targetLists.find('.activated').removeClass('activated');
                }
            }
            if (targetClass !== 'table-error-fixed' && targetClass !== 'handler-warning table-error') {
                this.$('.table-error-fixed').removeClass('table-error-fixed').hide();
            }
            if (this.$('.graphing-tool-editor-color-style-box-table').is(':visible') &&
                this.$('.graphing-tool-editor-color-style-box-equation').is(':visible') &&
                this.$('#options-container').is(':visible')) {
                this.model.set('_anyPopupOpen', false);
            }
        },
        /**
         * removeHover checks if hover is to be removed or not(Used across all three views)
         * @method removeHover
         * @param event {Object} event object
         * @return boolean
         */
        "removeHover": function(event) {
            return event.type === 'mouseleave' || ((event.originalEvent) ? (event.originalEvent.data &&
                event.originalEvent.data.simulatedEvent === true) : false);
        },
        /**
         * _copyEquationData copies equationData data into another equationData
         * @method _copyEquationData
         * @param fromEquationData {Object} equationData model object to be copied
         * @param toEquationData {Object} equationData model object
         * @return void
         */
        "_copyEquationData": function(fromEquationData, toEquationData) {
            if (typeof fromEquationData === 'undefined' || typeof toEquationData === 'undefined') {
                return void 0;
            }
            toEquationData.setLatex(fromEquationData.getLatex(), true);
            toEquationData.setThickness(fromEquationData.getThickness(), true);
            toEquationData.setColor(fromEquationData.getColor(), true);
            toEquationData.setDashArray(fromEquationData.getDashArray());
            toEquationData.setConstants(fromEquationData.getConstants(), true);
            toEquationData.setUnits(fromEquationData.getUnits(), true);
            toEquationData.setVisible(fromEquationData.getVisible());
            toEquationData.prevType = fromEquationData.prevType;
            toEquationData.setPrevLatex(fromEquationData.getPrevLatex());
        },

        "_createDuplicatelist": function(event) {
            var $targetList = $(event.target).parents('.list'),
                $list,
                targetEquationData = this._getMappedEquationData($targetList),
                newEquationData,
                undoData = {},
                redoData = {};
            if ($targetList.attr('data-type') === 'equation') {
                $list = this._createListWithEditor();
                this._createEquationData($list);
                newEquationData = this._getMappedEquationData($list);
                this._copyEquationData(targetEquationData, newEquationData);
                $list.find('.mathquill-editable').mathquill('latex', newEquationData.getLatex());
                $list.insertAfter($targetList);
                this._parseAndPlotEquationData(newEquationData, $list);
                this._updateHandles();
                undoData.actionType = 'deleteList';
                redoData.actionType = 'addList';
                undoData.listData = this._getListData($list);
                redoData.listData = this._getListData($list);
                redoData.targetCid = targetEquationData.getCid();
                this.execute('addDuplicateList', {
                    "undo": undoData,
                    "redo": redoData
                });
                _.delay(function() {
                    $list.find('textarea').blur();
                }, 10);
            }
            this._showEditOptions();
        },

        "_zoomCompleted": function(accId) {
            this._gridGraphView.off('grid:zoom-compleated').on('grid:zoom-compleated', _.bind(function() {

                var markerBounds = this._gridGraphView.getMarkerBounds();

                switch (accId) {
                    case 'zoom-in':
                        this.changeAccMessage(accId, 1, [this.getAccMessage('increased-text', 0), markerBounds.min.x, markerBounds.max.x, markerBounds.min.y, markerBounds.max.y]);
                        break;
                    case 'zoom-out':
                        this.setAccMessage(accId, this.getAccMessage('zoom-in', 1, [this.getAccMessage('decreased-text', 0), markerBounds.min.x, markerBounds.max.x, markerBounds.min.y, markerBounds.max.y]));
                        break;
                    case 'zoom-default':
                        this.changeAccMessage(accId, 1, [markerBounds.min.x, markerBounds.max.x, markerBounds.min.y, markerBounds.max.y]);
                        break;
                }
                this.setFocus(accId);
            }, this));
        },

        "zoomIn": function(event) {
            var target = $(event.target),
                accId;

            if (target.is('#math-tool-btn-zoomin-4') || target.parents().is('#math-tool-btn-zoomin-4')) {
                this._gridGraphView.graphZoomIn();
                accId = 'math-tool-btn-zoomin-4';
            }
            this._zoomCompleted(accId);
        },

        "zoomDefault": function(event) {
            var target = $(event.target),
                accId;

            if (target.is('#math-tool-btn-zoomdefault-4') || target.parents().is('#math-tool-btn-zoomdefault-4')) {
                this._gridGraphView.defaultGraphZoom();
                accId = 'math-tool-btn-zoomdefault-4';
            }
            this._zoomCompleted(accId);
        },

        "zoomOut": function(event) {
            var target = $(event.target),
                accId;

            if (target.is('#math-tool-btn-zoomout-4') || target.parents().is('#math-tool-btn-zoomout-4')) {
                this._gridGraphView.graphZoomOut();
                accId = 'math-tool-btn-zoomout-4';
            }
            this._zoomCompleted(accId);
        },

        "initiateMathJaxHandler": function() {
            if (this.isMathQuillTooltip) {
                this._equationPanel._createTooltipView(this.$el);
            } else {
                var math = null,
                    mathjaxHub = null,
                    head = null,
                    script = null,
                    mathjaxConfig = null;
                if (MathJax !== void 0) {
                    //using already loaded mathjax file & its config
                    mathjaxHub = MathJax.Hub;
                    mathjaxConfig = mathjaxHub.config.tex2jax.inlineMath[0];
                    mathjaxHub.config.tex2jax.processEscapes = false;
                    this.$('#math-output').html(mathjaxConfig[0] + '{}' + mathjaxConfig[1]);
                    mathjaxHub.Queue(['Typeset', mathjaxHub, 'math-output']);
                    math = mathjaxHub.getAllJax('math-output')[0];
                    mathjaxHub.queue.Push(['Text', math, '\loadMathjax']);
                    //to allow text to come in next line...
                    MathJax.Hub.config['HTML-CSS'].linebreaks.automatic = true;
                    return void 0;
                }
                //as mathjax file is not loaded, loading it with required configuration
                head = document.getElementsByTagName('head')[0];
                script = document.createElement('script');
                script.type = 'text/x-mathjax-config';
                script.src = '//app.discoveryeducation.com/static/interactives/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML';
                script[(window.opera ? 'innerHTML' : 'text')] = 'MathJax.Hub.Config({\n' +
                    '  tex2jax: { inlineMath: [["$","$"], ["\\\\(","\\\\)"]] },\n' +
                    '  "HTML-CSS": { linebreaks: {automatic: true, width: "910px"} }\n' + '});';
                head.appendChild(script);
                $.getScript('//app.discoveryeducation.com/static/interactives/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML', _.bind(this.mathjaxFileLoaded, this));
            }
        },

        "mathjaxFileLoaded": function() {
            var mathjaxHub = MathJax.Hub;
            mathjaxHub.Queue(['Typeset', mathjaxHub, 'math-output'], _.bind(function() {
                this._equationPanel._createTooltipView(this.$el);
            }, this));
        },

        "_setTabIndexToInputBox": function(event) {
            var $eventTarget = $(event.currentTarget),
                $inputBox = $eventTarget.find('input'),
                tabIndex = this.accManagerView.getTabIndex(event.currentTarget.id);
            $inputBox.focus();
            $inputBox.attr('tabindex', tabIndex);
            if ($eventTarget.find('.acc-read-elem').length !== 0) {
                this.enableTab(event.currentTarget.id, false);
            }
        },
        "_removeInputBoxTabIndex": function(event) {
            var $eventTarget = $(event.target),
                accMessageId, eventTargetClass = $eventTarget.attr('class'),
                sliderName, messageArray,
                accElementId;
            switch (eventTargetClass) {
                case 'chart-title-textbox':
                    accMessageId = 5;
                    accElementId = 'chart-acc-messages';
                    break;
                case 'chart-x-axis-title-textbox':
                    accMessageId = 7;
                    accElementId = 'chart-acc-messages';
                    break;
                case 'chart-y-axis-title-textbox':
                    accMessageId = 8;
                    accElementId = 'chart-acc-messages';
                    break;
                case 'constant-textarea':
                    accMessageId = 1;
                    accElementId = 'slider-panel-messages';
                    sliderName = $eventTarget.parents('.constant-value-holder').find('.constant-name-text').text().replace(' =', '');
                    messageArray = [sliderName, $eventTarget.val()];
                case 'textbox-field':
                    accMessageId = 30;
                    accElementId = 'chart-acc-messages';
                    break;
            }
            if (eventTargetClass.indexOf('x-y-lower-upper') !== -1) {
                if ($eventTarget.attr('data-setting-option').indexOf('upper') === -1) {
                    accMessageId = 0;
                    accElementId = 'input-box-text';
                } else {
                    accMessageId = 1;
                    accElementId = 'input-box-text';
                }
            }
            $eventTarget.removeAttr('tabindex');
            if ($eventTarget.parent().find('.acc-read-elem').length !== 0) {
                this.enableTab($eventTarget.parent().attr('id'), true);
                if (messageArray) {
                    this.accManagerView.setAccMessage($eventTarget.parent().attr('id'),
                        this.accManagerView.getAccMessage(accElementId, accMessageId, messageArray));
                } else {
                    if (accMessageId || accMessageId === 0) {
                        this.accManagerView.setAccMessage($eventTarget.parent().attr('id'),
                            this.accManagerView.getAccMessage(accElementId, accMessageId, [$eventTarget.val()]));
                    }
                }
            }
        },
        "_updateFocusRectForSliderInputBoxes": function(event) {
            this.accManagerView.updateFocusRect(event.currentTarget.id);
        },

        /**
         * Sets all elements other than the one currently focused, with tab index -1
         * @method adjustTabIndex
         * @param{Object} the event properties
         * @public
         */
        "adjustTabIndex": function(event) {
            var $currentTarget = this.$(event.currentTarget),
                $parent;
            if (this.isAccDivPresent($('#degree-option-container'))) {
                if ($currentTarget.parents('#degree-radians').length !== 0) {
                    this.enableTab('degree-option-container', false);
                    this.enableTab('radian-option-container', false);
                    this.enableTab($currentTarget.attr('id'), true);
                } else {
                    $parent = $currentTarget.parents('.orientation-btns-holder');
                    this.enableTab($parent.find('.vertical-radio-btn .radio-btn-circle').attr('id'), false);
                    this.enableTab($parent.find('.horizontal-radio-btn .radio-btn-circle').attr('id'), false);
                    this.enableTab($currentTarget.attr('id'), true);
                }
            }

        },

        /**
         * Resets all elements to their previous tabindex
         * @method readjustTabIndex
         * @public
         */
        "readjustTabIndex": function(event) {
            var $currentTarget = this.$(event.currentTarget);
            if ($currentTarget.parents('#degree-radians').length !== 0) {
                if ($('#degree-radians .activated').length !== 0) {
                    return;
                }
                this.enableTab('degree-option-container', true);
                this.enableTab('radian-option-container', true);
            }
        },

        /**
         * Processes KeyEvents
         * @method processKeyEvents
         * @param{Object} The event Object
         * @public
         */
        "processKeyEventsOnRadioBtn": function(event) {
            switch (event.keyCode) {
                case $.ui.keyCode.LEFT:
                case $.ui.keyCode.RIGHT:
                case $.ui.keyCode.UP:
                case $.ui.keyCode.DOWN:
                    this.selectRadioButton(event);
                    event.preventDefault();
                    break;
            }
        },

        "selectRadioButton": function(event) {
            var $currentTarget = this.$(event.currentTarget),
                $parent;
            if ($currentTarget.parents('#degree-radians').length !== 0) {
                if ($currentTarget.hasClass('radian-option-container')) {
                    this.$('.degree-option-container').trigger('click');
                    this.enableTab('radian-option-container', false);
                    this.enableTab('degree-option-container', true);
                } else {
                    this.$('.radian-option-container').trigger('click');
                    this.enableTab('radian-option-container', true);
                    this.enableTab('degree-option-container', false);
                }
            } else {
                $parent = $currentTarget.parents('.orientation-btns-holder');
                this.enableTab($parent.find('.vertical-radio-btn .radio-btn-circle').attr('id'), false);
                this.enableTab($parent.find('.horizontal-radio-btn .radio-btn-circle').attr('id'), false);
                if ($currentTarget.parent().hasClass('vertical-radio-btn')) {
                    $parent.find('.horizontal-radio-btn .radio-btn-circle').trigger('click');
                    this.enableTab($parent.find('.horizontal-radio-btn .radio-btn-circle').attr('id'), true);
                } else {
                    $parent.find('.vertical-radio-btn .radio-btn-circle').trigger('click');
                    this.enableTab($parent.find('.vertical-radio-btn .radio-btn-circle').attr('id'), true);
                }
            }
        },

        "_updateSpinnerAccOnClick": function(event) {
            var $target = $(event.currentTarget);

            if ($target.find('.acc-read-elem').length !== 0) {
                if ($target.hasClass('spin-up-arrow')) {
                    this.accManagerView.setAccMessage('precision-up-arrow',
                        this.accManagerView.getAccMessage('precision-down-arrow', 1), [this.spinnerView.currentValue]);
                } else {
                    this.accManagerView.setAccMessage('precision-down-arrow',
                        this.accManagerView.getAccMessage('precision-down-arrow', 1), [this.spinnerView.currentValue]);
                }
                this.accManagerView.changeAccMessage('precision-text', 0, [this.spinnerView.currentValue]);
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setFocus($target.attr('id'));
            }
        },

        "_setDefaultSpinnerAccOnFocus": function(event) {
            var $target = $(event.currentTarget);
            if ($target.find('.acc-read-elem').length !== 0) {
                if (!$target.hasClass('disabled')) {
                    this.accManagerView.changeAccMessage($target.attr('id'), 0);
                }
            }
        },

        "_setPrecisionTextAcc": function(event) {
            if (this.accManagerView.model.elementViews['precision-text']) {
                this.accManagerView.changeAccMessage('precision-text', 0, [this.spinnerView.currentValue]);
            }
        }
    });
})(window.MathUtilities);
