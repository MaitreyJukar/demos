/* globals _, window, $ */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Graphing.Views.EquationPanel = Backbone.View.extend({

        "initialize": function() {
            this.model = new MathUtilities.Tools.Graphing.Models.EquationPanel({
                "accManager": this.options.accManagerView
            });
            this._graphingToolView = this.options._graphingToolView;
            this.model._graphingToolView = this._graphingToolView;
            this._vmkClicked = false;
            this._chartManagerView = this.options._chartManagerView;
            this.accManagerView = this.options.accManagerView;
            this.hasShowCriticalPoints = MathUtilities.Tools.SHOW_CRITICAL_POINTS === null || MathUtilities.Tools.SHOW_CRITICAL_POINTS === void 0 ? true : MathUtilities.Tools.SHOW_CRITICAL_POINTS;
            this._render();
            this._graphingToolView.on('keyboard-opened', _.bind(function() {
                this._sliderPanel.updatePanelPosition(this._graphingToolView.$('.keyboardContainer'), true);
            }, this)).on('keyboard-closed', _.bind(function() {
                this._sliderPanel.updatePanelPosition(this._graphingToolView.$('.keyboardContainer'), false);
            }, this)).on('close-slider-settings', _.bind(function() {
                this._sliderPanel.hideSliderSettings();
            }, this));
            this.$("#input-data").on('scroll', _.bind(this._equationPanelScrolls, this));
            this.listenTo(this.model, 'change:precision', _.bind(this.updatePrecision, this));
        },

        "events": {
            "click .delete-list-container , .edit-delete": "_deleteList",
            "paste.graphingTool .mathquill-editable": '_onPaste',
            "keydown .mathquill-editable": "_keyDownHandler",
            "keyup .mathquill-editable": "_keyUpHandler",
            "click .slider": "_addSlider",
            "click .graphing-tool-editor-color-style-box-table .graphing-tool-editor-graph-styles": "_changeTableColumnStyle",
            "click .show-hide-equation-container": "_toggleGraph",
            "click .graph-style-edit-options": "_showGraphStyleColorOptions",
            "click .graphing-tool-editor-style-label-head": "showStyleOptions",
            "click .graphing-tool-editor-color-style-box-equation .graphing-tool-editor-colors": "_setEquationDataColor",
            "click .graphing-tool-editor-color-style-box-table .graphing-tool-editor-colors": "_changeEquationDataColor",
            "click .graphing-tool-editor-color-style-box-equation .graphing-tool-editor-styles-container": "_setEquationDataStyle",
            "click .graphing-tool-editor-close-button": "_closeStyleEditBox",
            "click .graphing-tool-editor-best-fit-options-header": "_showBestFitOptions",
            "click .graphing-tool-editor-sort-selection-box": "_showSortOptions",
            "click .graphing-tool-editor-hide-column-container": "_hideTableColumnClickHandler",
            "click .graphing-tool-editor-toggle-column-graph-checkbox-container": "_checkToggleColumnGraph",
            "click .table-cell-warning-container .handler-warning": "_showFixedCellWarningText",
            "click .list-header-container .handler-warning": "_toggleHandlerWarningText",
            "click .graphing-tool-editor-data-analysis-options-header": "_showDataAnalysisOptions",
            "click .graphing-tool-editor-residuals-options": "_showResidualOptions",
            "click .graphing-tool-editor-sort-type-container": "_callSortTableColumn",
            "mouseenter .style-drop-down-option-panel": "_hoverStyleOptions",
            "mouseleave .style-drop-down-option-panel": "_removeHoverStyleOptions",
            "click .new-row": "_addTableRow",
            "click": "_resetExtensionWidth",
            "click .equation-edit-container": '_makeBestFitEquationEditable',
            "keydown .list": "_listKeyDown",
            "keydown .list-data-container": "_listTextAreaKeyDown",
            "blur .list-data-container textarea": "_removeTextAreaTabIndex",
            "keydown .graphing-tool-editor-style-box .graphing-tool-editor-style-label-head, #graphing-tool-editor-style-color": "_handleShiftTabOnType",
            "keydown .graphing-tool-editor-close-button": "_handleTabOnClose",
            "focusout .list": "_setAccTextForListOnFocusOut",
            "keydown .graphing-tool-editor-graph-thickness": "_setFocusOnSlider",
            "keydown .list-handle": "_keyDownOnListHandle",
            "focusout .list-handle": "_focusOutFromListHandle",
            "focusout .cell": "_setAccTextForCellOnFocusOut",
            "focusout .list-data-container": "_setAccTextForListDataOnFocusOut",
            "focusin .show-hide-equation-container": "_closeStyleEditBox",
            "focusin .graphing-tool-editor-hide-column-label, #graphing-tool-editor-graph-thickness-container": "focusOnHideColumn",
            "keydown .list-data-container textarea, .cell textarea": "setFocusToKeyboard",
            "touchend .cell": "setFocusToMathQuill"
        },
        /**
         * Flag to check of functions Clicked from virtual keyboard
         * @property _vmkClicked
         * @type {Boolean}
         */
        "_vmkClicked": null,
        /**
         * Chart window manager
         * @property _chartManagerView
         * @type {Object}
         */
        "_chartManagerView": null,
        /**
         * Graphing tool view
         * @property _graphingToolView
         * @type {Object}
         */
        "_graphingToolView": null,
        "showCopyBtn": true,
        "addSliderBackground": false,
        "_sliderPanel": null,
        /**
         * Holds different error message text
         * @property _errorMessage
         * @type {object}
         */
        "_errorMessage": null,
        "_projectorMode": null,
        "_lastBlurList": null,
        "_inputColOptions": null,
        "_zIndexForWarning": 9000,
        "_tooltipView": null,
        "_timerId": -1,
        "_bestFitAlertDisplayed": false,
        "TouchSimulator": MathUtilities.Components.Utils.TouchSimulator,
        "listOptionsContainerWidth": null,
        "listTabIndex": 110,
        "registerUndoRedo": true,
        "maxColumnCheck": false,

        "_render": function() {
            var $list,
                $elCurrent = this.$el,
                $listBox = this.$('#list-box'),
                equationDataCollection,
                $addFunction = $elCurrent.find('#add-function'),
                $addFunctionIcon = $elCurrent.find('#add-function-icon'),
                $addTable = $elCurrent.find('#item-table'),
                $addTableIcon = $elCurrent.find('#item-table-icon'),
                $hideColumn = $elCurrent.find('#hide-column'),
                $hideColumnIcon = $elCurrent.find('#hide-column-icon'),
                $deleteAll = $elCurrent.find('#delete-all'),
                $deleteAllIcon = $deleteAll.find('#delete-all-icon'),
                $deleteAllText = $deleteAll.find('#delete-all-text'),
                $elementsArray = [$addFunction, $addTable, $deleteAll, $hideColumn],
                _equationDataManager;
            $list = this._createListWithEditor(true);
            // Append list item to list box
            $listBox.append($list);
            // make list sortable
            this._createSortableList();
            // Apply equation parser rules
            MathUtilities.Components.EquationEngine.Models.Productions.init();
            // change later
            _equationDataManager = new MathUtilities.Components.EquationEngine.Models.ChangeConstantEquationManager({
                "graphView": this._graphingToolView._gridGraphView
            });
            this.model.set('_equationDataManager', _equationDataManager);
            equationDataCollection = new MathUtilities.Tools.Graphing.Collections.EquationDataCollection();
            this._sliderPanel = new MathUtilities.Tools.Graphing.Views.SliderPanel({
                "el": this._graphingToolView.$('#slider-panel-container'),
                "_equationDataManager": _equationDataManager,
                "_equationPanel": this
            });
            this._sliderPanel.on('slider-panel-max', _.bind(this._graphingToolView._updateListBoxHeightDueToSlider, this))
                .on('slider-panel-min', _.bind(this._graphingToolView._updateListBoxHeightDueToSlider, this));
            // set collection in model
            this.model.set('equationDataCollection', equationDataCollection);
            // create equation data model and map it to list
            this._createEquationData($list);

            //Changed Toggle Class to addClass and removeClass to fix touch and type as enable Touch fires mouseleave and not mouseenter on mouseclick

            $addFunction.on('mouseenter mousedown', function(event) {
                $addFunctionIcon.addClass('hovered');
            }).on('mouseleave mouseup', _.bind(function(event) {
                if (this._graphingToolView.removeHover(event) === true) {
                    $addFunctionIcon.removeClass('hovered');
                }
            }, this));


            $addTable.on('mouseenter mousedown', function(event) {
                $addTableIcon.addClass('hovered');
            }).on('mouseleave mouseup', _.bind(function(event) {
                if (this._graphingToolView.removeHover(event) === true) {
                    $addTableIcon.removeClass('hovered');
                }
            }, this));

            $deleteAll.on('mouseenter mousedown', function(event) {
                $deleteAllIcon.addClass('hovered');
                $deleteAllText.addClass('hovered');
            }).on('mouseleave mouseup', _.bind(function(event) {
                if (this._graphingToolView.removeHover(event) === true) {
                    $deleteAllIcon.removeClass('hovered');
                    $deleteAllText.removeClass('hovered');
                }
            }, this));

            $hideColumn.on('mouseenter mousedown', function(event) {
                $hideColumn.addClass('hovered');
                $hideColumnIcon.addClass('hovered');
            }).on('mouseleave mouseup', _.bind(function(event) {
                if (this._graphingToolView.removeHover(event) === true) {
                    $hideColumn.removeClass('hovered');
                    $hideColumnIcon.removeClass('hovered');
                }
            }, this));
            _.each($elementsArray, _.bind(function(value) {
                this.TouchSimulator.enableTouch(value);
            }, this));
            $list.find('textarea').on('focus', _.bind(function() {
                this.model.set('cursorClassTag', this.$('.outerDiv .hasCursor'));
                this._graphingToolView._updateListBoxHeight(false);
                this._graphingToolView._hidePopUps();
            }, this));
            this._updateHandles();
            this.model.set('cursorClassTag', this.$('.outerDiv .hasCursor'));
            this._graphingToolView._updateListBoxHeight(false);
            this._inputColOptions = this.$('#input-column-options');
            this._bindBestFitAlertEvents();
            this.$('#item-table').on('click', _.bind(this._addTableList, this));
            this.$('#add-function, #add-to-list').on('click', _.bind(this._addList, this));
            this._createAccDivForList($list, false);
        },

        "getAccTextFromLatex": function(latex) {
            var equationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
            equationData.setLatex(latex);
            this.model.get('_equationDataManager').parseEquation(equationData);
            return equationData.getAccText();
        },

        "focusOnHideColumn": function(event) {
            if ($(event.target).parent().is('.graphing-tool-editor-graph-thickness , .graphing-tool-editor-hide-column-label')) {
                this.accManagerView.enableTab('graphing-tool-editor-graph-style-thickness-handle', false);
            }
        },

        "setFocusToMathQuill": function(event) {
            if (MathUtilities.Components.Utils.Models.BrowserCheck.isIOS8) {
                var $currentElement = $(event.target);

                if ($currentElement.hasClass('change-graph-style') || $currentElement.hasClass('function-btn') ||
                    $currentElement.parents('.function-btn').length === 1 || $currentElement.hasClass('show-hide-column-icons') ||
                    $currentElement.hasClass('show-hide-column-icons-container') || $currentElement.children('.change-graph-style').length === 1) {
                    return;
                }
                this.$('textarea').blur();
                _.delay(function() {
                    $(event.currentTarget).find('textarea').focus();
                }, 0); // Intentionally set focus as jquery triggers blur for text area on tap of mathquill.
            }
        },

        "_focusOutFromListHandle": function(event) {
            var $list = $(event.target).parents('.list');
            if ($('.list').length > 1 && !$list.hasClass('list-focus')) {
                this.accManagerView.setAccMessage('list-handle-of-' + $list.attr('id'),
                    this.accManagerView.getAccMessage('list-equation-panel-messages', 2, [$list.find('.list-handle').attr('data-handle-number'),
                        this.accManagerView.getAccMessage('list-equation-panel-messages', 19)
                    ]));
            } else {
                this.accManagerView.setAccMessage('list-handle-of-' + $list.attr('id'),
                    this.accManagerView.getAccMessage('list-equation-panel-messages', 2, [$list.find('.list-handle').attr('data-handle-number'), '']));
            }
        },
        "setResidualError": function(options) {
            var $colHeader = options.colHeader,
                errorString = options.errorString,
                equationData = options.equationData,
                tableView = options.tableView,
                colNumber = options.colNumber,
                $list = options.list,
                residualEquationData;
            this._updateWarningForCell($colHeader, {
                "hasError": true,
                "errorCode": errorString,
                "equationData": equationData,
                "cid": tableView.cid
            });

            this.clearColumnData(colNumber, $list);
            if (equationData.getResidualColumnNo() || equationData.getDependentColumnNo()) {
                residualEquationData = this._getEquationDataUsingCid(tableView._getColumnCid(colNumber + 1));
                if (residualEquationData) {
                    this._updateWarningForCell(tableView.getColumn(colNumber + 1).first(), {
                        "hasError": true,
                        "errorCode": this._getErrorStringForTable("ResidualError"),
                        "equationData": residualEquationData
                    });
                    this.clearColumnData(colNumber + 1, $list);
                    this._removePlots(residualEquationData);
                }
            }

        },
        "_createAccDivForList": function($list, isTable, tableObject) {
            var listCounter = this.model.get('listCounter'),
                msg, equationData, equationText,
                listTabIndex = this.listTabIndex,
                plotText = '';
            this._createAccDiv("list-" + listCounter, listTabIndex, '', '');
            this._createListAccElements($list, listTabIndex);
            this.accManagerView.updateFocusRect("list-" + listCounter);
            if (isTable) {
                this._createTableAccElements(tableObject, $list, listTabIndex + 25);
                msg = this.accManagerView.getAccMessage('table-equation-panel-messages', 0);
            } else {
                equationData = this._getEquationDataUsingCid($list.attr('data-equation-cid'));
                equationText = equationData.getAccText();
                if (equationText === null) {
                    msg = this.accManagerView.getAccMessage('list-equation-panel-messages', 15);
                } else {
                    msg = this.accManagerView.getAccMessage('list-equation-panel-messages', 16, [equationText]);
                }
                if (equationData.getSpecie() === "plot") {
                    plotText = this.accManagerView.getAccMessage('list-equation-panel-messages', 18);
                }
                msg = msg + this.accManagerView.getAccMessage('list-equation-panel-messages', 21) +
                    this.accManagerView.getAccMessage('list-equation-panel-messages', 0, [plotText]);
            }
            this.accManagerView.setAccMessage('list-' + listCounter, msg);
        },

        "_setAccTextForListOnFocusOut": function(event) {
            var msg, equationData, equationText,
                $list = $(event.currentTarget),
                plotText = '';
            if ($list.attr('data-type') === 'table') {} else {
                equationData = this._getEquationDataUsingCid($list.attr('data-equation-cid'));
                if (equationData) {
                    equationText = equationData.getAccText();
                    if (equationText === null) {
                        msg = this.accManagerView.getAccMessage('list-equation-panel-messages', 15);
                        if (!(equationData.isCanBeSolved() || equationData.getLatex() === "")) {
                            msg = this.accManagerView.getAccMessage('list-equation-panel-messages', 22);
                        }
                    } else {
                        msg = this.accManagerView.getAccMessage('list-equation-panel-messages', 16, [equationText]);
                    }
                    if (equationData.getSpecie() === "plot") {
                        plotText = this.accManagerView.getAccMessage('list-equation-panel-messages', 18);
                    }
                    if ($list.hasClass('disabled')) {
                        msg = msg + this.accManagerView.getAccMessage('list-equation-panel-messages', 23) +
                            this.accManagerView.getAccMessage('list-equation-panel-messages', 0, [plotText]);
                    } else {
                        msg = msg + this.accManagerView.getAccMessage('list-equation-panel-messages', 21) +
                            this.accManagerView.getAccMessage('list-equation-panel-messages', 0, [plotText]);
                    }
                    this.accManagerView.setAccMessage($list.attr('id'), msg);
                }
            }
        },

        "_setAccTextForListDataOnFocusOut": function(event) {
            var msg, equationData, equationText,
                $listDataContainer = $(event.currentTarget),
                $list = $listDataContainer.parents('.list');
            if ($list.attr('data-type') === 'table') {} else {
                equationData = this._getEquationDataUsingCid($list.attr('data-equation-cid'));
                if (equationData) {
                    equationText = equationData.getAccText();
                    if (equationText === null) {
                        equationText = '';
                    }
                    msg = this.accManagerView.getAccMessage('table-equation-panel-messages', 10, [equationText]);
                    if (this._graphingToolView.isAccDivPresent($listDataContainer)) {
                        this.accManagerView.setAccMessage($listDataContainer.attr('id'), msg);
                    }
                }
            }
        },

        "_setAccTextForCellOnFocusOut": function(event) {
            var msg, equationData, equationText,
                $cell = $(event.currentTarget);
            if ($cell.parent().hasClass('row1')) {
                equationData = this._getEquationDataUsingCid($cell.attr('data-equation-cid'));
                if (equationData) {
                    equationText = equationData.getAccText();
                    if (['x', 'y'].indexOf(equationData._latex) !== -1) {
                        equationText = equationData._latex;
                    }
                    if (equationText === null) {
                        equationText = '';
                    }
                }

            } else {
                equationText = $cell.attr('cell-text');
                if (!(equationText || equationText === 0)) {
                    equationText = '';
                }
            }
            if (!$cell.attr('data-ignore-column')) {
                if ($cell.hasClass('cell-disabled')) {
                    msg = this.accManagerView.getAccMessage('table-equation-panel-messages', 13);
                } else {
                    msg = this.accManagerView.getAccMessage('table-equation-panel-messages', 10, [equationText]);
                }
                if (this._graphingToolView.isAccDivPresent($cell)) {
                    this.accManagerView.setAccMessage($cell.attr('id'), msg);
                }
            }
        },

        "_createAccDiv": function(elementId, tabindex, locMsg, accMsg) {
            var obj = {
                "elementId": elementId,
                "tabIndex": tabindex,
                "loc": locMsg,
                "acc": accMsg
            };
            this.accManagerView.createAccDiv(obj);
        },
        "_createTableAccElements": function(tableObject, $list, startIndex) {
            var listId = $list.attr('id'),
                listCounter = this.model.get('listCounter'),
                tableViewCid = tableObject.cid,
                tableCounter = tableObject.tableCounter,
                tableNameText = this.accManagerView.getMessage('table-number-text', 0, [tableCounter]),
                rowHeaderText = this.accManagerView.getAccMessage('row-header-text', 0),
                object = [{
                    "id": "table-number-of-" + tableViewCid,
                    "accId": "table-number-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 1, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": tableNameText,
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "row-header-container-of-" + tableViewCid,
                    "accId": "row-header-container-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 3, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": rowHeaderText,
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "1-1-of-" + tableViewCid,
                    "accId": "1-1-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 5, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 10, ['x']),
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "1-1-handler-warning-of-" + tableViewCid,
                    "accId": "1-1-handler-warning-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 5, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('handler-warning', 0),
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "1-2-of-" + tableViewCid,
                    "accId": "1-2-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 5, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 10, ['y']),
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "1-1-next-column-hidden-icon-" + tableViewCid,
                    "accId": "1-1-next-column-hidden-icon-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 5, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 8),
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "1-2-prev-column-hidden-icon-" + tableViewCid,
                    "accId": "1-2-prev-column-hidden-icon-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 5,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 9),
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "1-2-next-column-hidden-icon-" + tableViewCid,
                    "accId": "1-2-next-column-hidden-icon-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 5, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 8),
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "1-2-handler-warning-of-" + tableViewCid,
                    "accId": "1-2-handler-warning-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 5, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 2),
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "1-2-function-btn-" + tableViewCid,
                    "accId": "1-2-function-btn-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 5, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 7, [this.accManagerView.getMessage('function-text', 0), this.accManagerView.getMessage('label-text', 0)]),
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "2-1-of-" + tableViewCid,
                    "accId": "2-1-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 6, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 10, ['']),
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "2-1-handler-warning-of-" + tableViewCid,
                    "accId": "2-1-handler-warning-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 6, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('handler-warning', 0),
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "2-2-handler-warning-of-" + tableViewCid,
                    "accId": "2-2-handler-warning-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 6, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 2),
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "2-2-of-" + tableViewCid,
                    "accId": "2-2-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 6, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 10, ['']),
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "new-row-button-of-" + tableViewCid,
                    "accId": "new-row-button-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 214, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getMessage('add-row-button-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "remove-row-button-of-" + tableViewCid,
                    "accId": "remove-row-button-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 216, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getMessage('remove-row-button-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "new-col-button-of-" + tableViewCid,
                    "accId": "new-col-button-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 210, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getMessage('add-col-button-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "remove-col-button-of-" + tableViewCid,
                    "accId": "remove-col-button-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 212, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getMessage('remove-col-button-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "copy-table-data-btn-of-" + tableViewCid,
                    "accId": "copy-table-data-btn-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 218, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getMessage('copy-button-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "common-chart-button-of-" + tableViewCid,
                    "accId": "common-chart-button-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 222, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-btns-container-text', 0, [tableCounter]),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-btns-container-of-" + tableViewCid,
                    "accId": "chart-btns-container-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": -1, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-btns-container-text', 0, [tableCounter]),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "line-chart-btn-" + tableViewCid,
                    "accId": "line-chart-btn-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 224, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('line-chart-btn-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "bar-chart-btn-" + tableViewCid,
                    "accId": "bar-chart-btn-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 230, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('bar-chart-btn-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "dot-chart-btn-" + tableViewCid,
                    "accId": "dot-chart-btn-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 236, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('dot-chart-btn-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "histogram-chart-btn-" + tableViewCid,
                    "accId": "histogram-chart-btn-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 242, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('histogram-chart-btn-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "pie-chart-btn-" + tableViewCid,
                    "accId": "pie-chart-btn-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 248, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('pie-chart-btn-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "box-chart-btn-" + tableViewCid,
                    "accId": "box-chart-btn-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 254, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('box-chart-btn-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "column-chart-btn-" + tableViewCid,
                    "accId": "column-chart-btn-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 260, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('column-chart-btn-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "col-function-of-" + tableViewCid,
                    "accId": "col-function-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 310, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getMessage('function-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "col-label-of-" + tableViewCid,
                    "accId": "col-label-of-" + tableViewCid,
                    "type": "text",
                    "tabIndex": startIndex + 320, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getMessage('label-text', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "list-data-container-of-" + listId,
                    "accId": "list-data-container-of-" + listId,
                    "type": "text",
                    "tabIndex": -1,
                    "offsetTop": "-3",
                    "offsetLeft": "-3",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 10, ['']),
                            "loc": ""
                        }
                    }]
                }];
            this.addElementsInAccScreen(listId, object);
        },
        "_createListAccElements": function($list, startIndex) {
            var listId = $list.attr('id'),
                lineLabel = this.accManagerView.getMessage('line-label', 0),
                polynomialLabel = this.accManagerView.getMessage('polynomial-label', 0),
                expLabel = this.accManagerView.getMessage('exp-label', 0),
                object = [{
                    "id": "list-toggle-button-container-of-" + listId,
                    "accId": "list-toggle-button-container-of-" + listId,
                    "type": "text",
                    "tabIndex": startIndex + 1, // assign dynamic tab index
                    "offsetTop": "-3",
                    "offsetLeft": "-3",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('list-equation-panel-messages', 1, [this.accManagerView.getAccMessage('list-equation-panel-messages', 3),
                                this.accManagerView.getAccMessage('list-equation-panel-messages', 5)
                            ]),
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "list-handle-of-" + listId,
                    "accId": "list-handle-of-" + listId,
                    "type": "text",
                    "tabIndex": startIndex + 3, // assign dynamic tab index
                    "offsetTop": "-3",
                    "offsetLeft": "-3",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('list-equation-panel-messages', 2, [$list.find('.list-handle').attr('data-handle-number'), '']),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "handler-warning-of-" + listId,
                    "accId": "handler-warning-of-" + listId,
                    "type": "text",
                    "tabIndex": startIndex + 5, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('handler-warning', 0),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "list-header-description-of-" + listId,
                    "accId": "list-header-description-of-" + listId,
                    "type": "text",
                    "offsetTop": -3,
                    "offsetLeft": -1,
                    "tabIndex": startIndex + 7, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('list-equation-panel-messages', 14),
                            "loc": ""
                        }
                    }, {
                        "id": "1",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 1),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "equation-edit-container-of-" + listId,
                    "accId": "equation-edit-container-of-" + listId,
                    "type": "text",
                    "offsetTop": -2,
                    "offsetLeft": -2,
                    "tabIndex": startIndex + 285, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('list-equation-panel-messages', 24),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "graph-style-edit-options-of-" + listId,
                    "accId": "graph-style-edit-options-of-" + listId,
                    "type": "text",
                    "tabIndex": startIndex + 287, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('list-equation-panel-messages', 13),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "show-hide-equation-container-of-" + listId,
                    "accId": "show-hide-equation-container-of-" + listId,
                    "type": "text",
                    "tabIndex": startIndex + 540, // assign dynamic tab index
                    "offsetLeft": "-4",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": "",
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "delete-list-container-of-" + listId,
                    "accId": "delete-list-container-of-" + listId,
                    "type": "text",
                    "tabIndex": startIndex + 545, // assign dynamic tab index
                    "offsetTop": "-4",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('list-equation-panel-messages', 7),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "slider-of-" + listId,
                    "accId": "slider-of-" + listId,
                    "type": "text",
                    "offsetTop": "-3",
                    "offsetLeft": "-3",
                    "tabIndex": startIndex + 285, // assign dynamic tab index
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": "",
                            "loc": ""
                        }
                    }]
                }, {
                    "id": "list-data-container-of-" + listId,
                    "accId": "list-data-container-of-" + listId,
                    "type": "text",
                    "tabIndex": startIndex + 280, // assign dynamic tab index
                    "offsetTop": "-3",
                    "offsetLeft": "-3",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 10, ['']),
                            "loc": ""
                        }
                    }]
                }];

            this.addElementsInAccScreen(listId, object);
        },
        "addElementsInAccScreen": function(listId, object) {
            var accDataScreen;

            accDataScreen = {
                "id": listId,
                "name": listId,
                "elements": []
            };
            accDataScreen.elements = object;
            this.accManagerView.model.parse([accDataScreen]);
        },
        "_listKeyDown": function(event) {
            var $eventTarget = $(event.target),
                currentItem,
                $eventTargetParent = $eventTarget.parent(),
                listId = event.currentTarget.id,
                tableView,
                eventType = this.isEventTabOrShiftTab(event),
                $parentList = $eventTarget.hasClass('list') ? $eventTarget : $eventTarget.parents('.list'),
                msg, equationData, equationText, index, btnLength, $chartBtn, $currBtn,
                equationDataManager = this.model.get('_equationDataManager'),
                canvasItem,
                nextDivToFocus = this._getNextDivToFocus($parentList);
            if ([32, 71, 13].indexOf(event.keyCode) > -1 && ($eventTarget.hasClass('list') || $eventTargetParent.hasClass('list'))) { // 32 space key 71 g character key 13 enter key
                if (event.keyCode === 71) { // g character
                    this._graphingToolView.addAllPaperItems(true);

                    if ($parentList.attr('data-type') === "table") {
                        currentItem = equationDataManager.getEquationDataUsingCid(this._getTableViewObject($parentList).getRow(1).eq(1).attr('data-equation-cid'));
                        tableView = this._getTableViewObject($parentList);
                        if (tableView.model.get('eyeOpen') === false || tableView.model.get('plotColumnHidden').indexOf(currentItem.cid) > -1 ||
                            tableView.model.get('lineOptionSelected') === false) {
                            return void 0;
                        }
                    } else {
                        currentItem = equationDataManager.getEquationDataUsingCid($parentList.attr('data-equation-cid'));
                        if (currentItem.getCurveVisibility() === false) {
                            return void 0;
                        }
                    }
                    if (["points", "both", "line"].indexOf(currentItem.styleType) > -1) {
                        canvasItem = currentItem.getPlot().getPointsGroup().children[0];
                        if (currentItem.styleType === "line" && currentItem.getVisible().point === false && currentItem.getPoints().length === 1) {
                            return void 0;
                        }
                        if (["both", "line"].indexOf(currentItem.styleType) > -1 && currentItem.getPoints().length > 1) {
                            this.accManagerView.changeAccMessage('grid-graph-canvas-acc-container', 19);
                        } else {
                            canvasItem.data.displayPoint = canvasItem.data.point;
                            this._graphingToolView.setAccMessageOnTab(event, canvasItem);
                        }

                    } else {
                        this.accManagerView.changeAccMessage('grid-graph-canvas-acc-container', 1, [currentItem.getAccText()]);
                    }
                    if (currentItem.getPathGroup() && currentItem.styleType !== "points") {
                        this._graphingToolView._handleImageAccessibility(currentItem.getPathGroup());
                    } else if (currentItem.styleType === "points") {
                        this._graphingToolView._handleImageAccessibility(currentItem.getPlot().getPointsGroup().children[0]);
                    } else if (currentItem.getSpecie() === "point") {
                        this._graphingToolView._handleImageAccessibility(currentItem.getPointsGroup().children[0]);
                    }
                    return void 0;

                }
                this.accManagerView.loadScreen(listId);
                $chartBtn = $parentList.find('.chart-btns');
                btnLength = $chartBtn.length;
                if ($('#' + $($chartBtn[0]).attr('id')).find('.acc-read-elem').text().indexOf('%@$%') !== -1) {
                    for (index = 0; index < btnLength; index++) {
                        $currBtn = $($chartBtn[index]);
                        if ($currBtn.hasClass('selected')) {
                            this.accManagerView.changeAccMessage($currBtn.attr('id'), 0, [this.accManagerView.getAccMessage('selected-text', 0),
                                this.accManagerView.getAccMessage('table-equation-panel-messages', 6)
                            ]);
                        } else {
                            this.accManagerView.changeAccMessage($currBtn.attr('id'), 0, [this.accManagerView.getAccMessage('unselected-text', 0),
                                this.accManagerView.getAccMessage('table-equation-panel-messages', 5)
                            ]);
                        }
                    }
                }
                if (!event.isCustomEvent) {
                    this.accManagerView.setFocus('list-toggle-button-container-of-' + listId);
                }
                event.preventDefault();
                if ($('#' + listId).attr('data-type') === 'table') {
                    equationText = this._getTableViewObject($parentList).model.get('tableName');
                    this.accManagerView.changeAccMessage('list-header-description-of-' + listId, 1, [equationText]);
                } else {
                    equationData = this._getEquationDataUsingCid($parentList.attr('data-equation-cid'));
                    equationText = equationData.getAccText();
                    this.accManagerView.changeAccMessage('list-header-description-of-' + listId, 0, [equationText]);
                    this._graphingToolView.enableTab('graph-style-edit-options-of-' + $parentList.attr('id'),
                        $parentList.find('.change-graph-style').hasClass('visible'));
                }
                this.accManagerView.enableTab('list-answer-of-' + listId, true);
                if ($('.list').length > 1 && !$parentList.hasClass('list-focus')) {
                    this.accManagerView.setAccMessage('list-handle-of-' + listId,
                        this.accManagerView.getAccMessage('list-equation-panel-messages', 2, [$parentList.find('.list-handle').attr('data-handle-number'),
                            this.accManagerView.getAccMessage('list-equation-panel-messages', 19)
                        ]));
                } else {
                    this.accManagerView.setAccMessage('list-handle-of-' + listId,
                        this.accManagerView.getAccMessage('list-equation-panel-messages', 2, [$parentList.find('.list-handle').attr('data-handle-number'), '']));
                }
                if ($parentList.find('.show-hide-equation').hasClass('graph-hidden')) {
                    msg = this.accManagerView.getAccMessage('list-equation-panel-messages', 8, [this.accManagerView.getAccMessage('list-equation-panel-messages', 10),
                        this.accManagerView.getAccMessage('list-equation-panel-messages', 12)
                    ]);
                } else {
                    msg = this.accManagerView.getAccMessage('list-equation-panel-messages', 8, [this.accManagerView.getAccMessage('list-equation-panel-messages', 9),
                        this.accManagerView.getAccMessage('list-equation-panel-messages', 11)
                    ]);
                }

                if ($parentList.find(".row-header-check").hasClass("row-header-checked")) {
                    this.accManagerView.changeAccMessage($parentList.find('.row-header-check-container').attr('id'), 0, [this.accManagerView.getAccMessage('checked-text', 0)]);
                } else {
                    this.accManagerView.changeAccMessage($parentList.find('.row-header-check-container').attr('id'), 0, [this.accManagerView.getAccMessage('unchecked-text', 0)]);
                }
                this.accManagerView.setAccMessage('show-hide-equation-container-of-' + listId, msg);
                this._updateListWidth($parentList.find('.equation-box').outerWidth());
            } else if (event.keyCode === 27) { //esc key
                this.accManagerView.setFocus($parentList.attr('id'));
                this.accManagerView.unloadScreen(listId);
                this.accManagerView.enableTab('list-answer-of-' + listId, false);
            }
            if ($('#' + listId).attr('data-type') !== 'table' &&
                this._graphingToolView.isAccDivPresent(this.$('#graph-style-edit-options-of-' + $parentList.attr('id')))) {
                this._graphingToolView.enableTab('graph-style-edit-options-of-' + $parentList.attr('id'),
                    $parentList.find('.change-graph-style').hasClass('visible'));
            }
            if ((eventType.isTab && ($eventTarget.hasClass('delete-list-container') || $eventTargetParent.hasClass('delete-list-container'))) ||
                (eventType.isShiftTab && ($eventTarget.hasClass('list-toggle-button-container') || $eventTargetParent.hasClass('list-toggle-button-container')))
            ) {
                event.preventDefault();
                if (eventType.isTab) {
                    if ($parentList.next().length !== 0) {
                        this.accManagerView.setFocus($parentList.next().attr('id'));
                    } else {
                        this.accManagerView.setFocus('keyboard-title-container');
                    }
                } else {
                    if ($parentList.prev().length !== 0) {
                        this.accManagerView.setFocus($parentList.prev().attr('id'));
                    } else {
                        this.accManagerView.setFocus('hide-column');
                    }
                }
                this.accManagerView.unloadScreen(listId);
                this.accManagerView.enableTab('list-answer-of-' + listId, false);
            }
        },
        "setFocusToKeyboard": function(event) {
            var listId;
            if (event.keyCode === 75 && event.ctrlKey) { // k character key
                listId = $(event.target).parents('.list').attr('id');
                event.preventDefault();
                this.accManagerView.setFocus('keyboard-title-container');
                this.accManagerView.unloadScreen(listId);
                this.accManagerView.enableTab('list-answer-of-' + listId, false);
            }
        },
        "_listTextAreaKeyDown": function(event) {
            var $eventTarget = $(event.target),
                $eventTargetParent = $eventTarget.parent(),
                $parentList = $eventTarget.parents('.list'),
                $listDataContainer = $parentList.find('.list-data-container'),
                $listTextArea = $listDataContainer.find('textarea'),
                tabIndex = this.accManagerView.getTabIndex($listDataContainer.attr('id'));
            if ([32, 13].indexOf(event.keyCode) > -1 && ($eventTarget.hasClass('list-data-container') || $eventTargetParent.hasClass('list-data-container'))) { //space and enter key
                $listTextArea.attr('tabindex', tabIndex);
            }
        },
        "_handleShiftTabOnType": function(event) {
            var eventType = this.isEventTabOrShiftTab(event),
                $container = this.$('.graphing-tool-editor-color-style-box'),
                $cell = this.$('.cell[data-equation-cid=' + $container.attr('data-target-equation-data-cid') + ']'),
                $list = this.$('.list[data-equation-cid=' + $container.attr('data-target-equation-data-cid') + ']'),
                $targetId;
            if (eventType.isShiftTab && (this._graphingToolView.isAccDivPresent($list.find('.list-toggle-button-container')) ||
                    this._graphingToolView.isAccDivPresent($cell))) {
                if ($cell.length !== 0 && event.currentTarget.id === "graphing-tool-editor-style-type") {
                    $targetId = $cell.attr('id').replace('of', 'handler-warning-of');
                    this._closeStyleEditBox(event);
                    this.accManagerView.setFocus($targetId, 10);
                } else {
                    if (event.currentTarget.id === "graphing-tool-editor-style-color" && $('.graphing-tool-editor-style-box:hidden').length > 0 ||
                        event.currentTarget.id === "graphing-tool-editor-style-type") {
                        this._closeStyleEditBox(event);
                        this.accManagerView.setFocus('graph-style-edit-options-of-' + $list.attr('id'), 10);
                    }
                }
            }
        },
        "_handleTabOnClose": function(event) {
            var eventType = this.isEventTabOrShiftTab(event),
                $container = this.$('.graphing-tool-editor-color-style-box'),
                rowNo,
                $cell = this.$('.cell[data-equation-cid=' + $container.attr('data-target-equation-data-cid') + ']'),
                $targetId = $cell.attr('id').replace('of', 'function-btn');
            if (eventType.isTab) {
                this.accManagerView.setFocus('dummy-focus-container');
                this._closeStyleEditBox(event);
                if ($cell.hasClass('first-row first-col') || $cell.attr('data-ignore-column')) {
                    if ($cell.next().attr('id')) {
                        this.accManagerView.setFocus($cell.next().attr('id'), 10);
                    } else {
                        rowNo = Number($cell.attr('data-cell-id').slice(0, $cell.attr('data-cell-id').indexOf('-'))) + 1; // for accessing next row
                        this.accManagerView.setFocus(this.$('.cell[data-cell-id=' + rowNo + '-1]').attr('id'), 10);
                    }
                } else {
                    this.accManagerView.setFocus($targetId, 10);
                }

            }
        },
        "_setFocusOnSlider": function(event) {
            if (event.keyCode === 32) { //space key
                this.accManagerView.enableTab('graphing-tool-editor-graph-style-thickness-handle', true);
                this.accManagerView.setFocus('graphing-tool-editor-graph-style-thickness-handle');
            }
        },
        "_removeTextAreaTabIndex": function(event) {
            $(event.target).parents('.list').find('.list-data-container textarea').attr('tabindex', -1);
        },
        "isEventTabOrShiftTab": function(event) {
            var code = event.keyCode || event.which,
                obj = {
                    'isShiftTab': false,
                    'isTab': false
                };

            if (code === 9) {
                if (event.shiftKey) {
                    obj.isShiftTab = true;

                } else {
                    obj.isTab = true;
                }
            }
            return obj;
        },
        "_hoverStyleOptions": function(event) {
            $(event.currentTarget).addClass('hover-effect-drop-down');
        },
        "_removeHoverStyleOptions": function(event) {
            $(event.currentTarget).removeClass('hover-effect-drop-down');
        },

        /**
         * _bindBestFitAlertEvents binds events to show custom alerts
         * @method _bindBestFitAlertEvents
         * @return void
         */
        "_bindBestFitAlertEvents": function() {
            var _TABLE_ERRORS = this.model.get('ERROR_STRINGS').TABLE_ERRORS;
            this.model.on('best-fit-line-alert', _.bind(function(alertString, focusElementId) {
                if (!this._bestFitAlertDisplayed) {
                    $('#best-fit-line-text').html(alertString || _TABLE_ERRORS._BEST_FIT_ERROR_STRING);
                    this._showBestFitAlert('best-fit-line-model', focusElementId, true, true);
                }
            }, this)).on('best-fit-slope-alert', _.bind(function(alertString) {
                if (!this._bestFitAlertDisplayed) {
                    $('#best-fit-slope-text').html(alertString || _TABLE_ERRORS._BEST_FIT_UNDEFINED_ERROR);
                    this._showBestFitAlert('best-fit-slope');
                }
            }, this)).on('best-fit-curve-error-alert', _.bind(function(alertString) {
                if (!this._bestFitAlertDisplayed) {
                    $('#best-fit-curve-error-text').html(alertString || _TABLE_ERRORS._BEST_FIT_CALC_ERROR);
                    this._showBestFitAlert('best-fit-curve-error');
                }
            }, this)).on('best-fit-exp-alert', _.bind(function(alertString, focusElementId) {
                if (!this._bestFitAlertDisplayed) {
                    $('#best-fit-exp-model-text').html(alertString || _TABLE_ERRORS._BEST_FIT_EXP_ERROR);
                    this._showBestFitAlert('best-fit-exp-model', focusElementId, true, true);
                }
            }, this)).on('max-row-alert', _.bind(function(focusElementId) {
                this._showBestFitAlert('max-row', focusElementId);
            }, this)).on('max-row-and-col-alert', _.bind(function() {
                this._showBestFitAlert('max-row-and-col');
            }, this)).on('min-row-alert', _.bind(function() {
                this._showBestFitAlert('min-row');
            }, this)).on('min-row-delete-alert', _.bind(function(focusElementId) {
                this._showBestFitAlert('min-row-delete', focusElementId);
            }, this)).on('max-col-alert', _.bind(function(focusElementId) {
                this._showBestFitAlert('max-col', focusElementId, false, true);
            }, this)).on('min-col-delete-alert', _.bind(function(focusElementId) {
                this._showBestFitAlert('min-col-delete', focusElementId, true, true);
            }, this)).on('hidden-col-delete', _.bind(function() {
                this._showBestFitAlert('hidden-col-delete');
            }, this)).on('max-chart-alert', _.bind(function() {
                this._showBestFitAlert('max-chart');
            }, this)).on('max-chart-col-alert', _.bind(function() {
                this._showBestFitAlert('max-chart-col');
            }, this)).on('max-chart-row-alert', _.bind(function() {
                this._showBestFitAlert('max-chart-row');
            }, this)).on('chart-calc-error', _.bind(function() {
                this._showBestFitAlert('chart-calc-error');
            }, this)).on('column-delete-warning', _.bind(function() {
                this._showBestFitAlert('column-delete-warning');
            }, this)).on('row-delete-warning', _.bind(function() {
                this._showBestFitAlert('row-delete-warning');
            }, this)).on('table-delete-warning', _.bind(function() {
                this._showBestFitAlert('table-delete-warning');
            }, this)).on('image-filetype-error', _.bind(function() {
                this._showBestFitAlert('image-filetype-error', 'add-image');
            }, this)).on('box-chart-error', _.bind(function(focusElementId) {
                this._showBestFitAlert('box-chart-error', focusElementId, true);
            }, this)).on('invalid-set-of-data', _.bind(function() {
                this._showBestFitAlert('invalid-set-of-data');
            }, this)).on('empty-sort-alert', _.bind(function(focusElementId) {
                this._showBestFitAlert('empty-sort-alert', focusElementId);
            }, this));
        },
        /**
         * showStyleOptions
         *
         */
        "showStyleOptions": function(event) {
            var $target = $(event.target),
                $parent = $target.parents('.style-color-container'),
                $container = this.$('.graphing-tool-editor-color-style-box'),
                selectedText = this.accManagerView.getAccMessage('selected-text', 0),
                unselectedText = this.accManagerView.getAccMessage('unselected-text', 0);
            this._hideBestFitDataAnalysisOptions(this.$('.cell[data-equation-cid=' + $container.attr('data-target-equation-data-cid') + ']').parents('.list'));
            if (!$parent.hasClass('activated')) {
                $container.find('.activated').removeClass('activated');
                $parent.addClass('activated');
                if ($parent.hasClass('graphing-tool-editor-style-box')) {
                    if ($('#style-3').find('.hidden').length === 0) {
                        this.accManagerView.changeAccMessage('style-1', 1, [unselectedText]);
                        this.accManagerView.changeAccMessage('style-2', 1, [unselectedText]);
                        this.accManagerView.changeAccMessage('style-3', 1, [unselectedText]);
                    } else {
                        this.accManagerView.changeAccMessage('style-1', 0, [unselectedText]);
                        this.accManagerView.changeAccMessage('style-2', 0, [unselectedText]);
                    }
                } else {
                    this.accManagerView.changeAccMessage('purple-color', 0, ['']);
                    this.accManagerView.changeAccMessage('blue-color', 0, ['']);
                    this.accManagerView.changeAccMessage('orange-color', 0, ['']);
                    this.accManagerView.changeAccMessage('green-color', 0, ['']);
                    this.accManagerView.changeAccMessage('lightblue-color', 0, ['']);
                    this.accManagerView.changeAccMessage('pink-color', 0, ['']);
                }
            }
            $container.find('.graphing-tool-editor-colors-selected').parent().addClass('selected');
            this.accManagerView.changeAccMessage($container.find('.graphing-tool-editor-colors-selected').attr('id'), 0, [selectedText]);
            this.accManagerView.changeAccMessage($container.find('.graphing-tool-editor-styles-points-line-selected').attr('id'), 1, [selectedText]);
            this.accManagerView.changeAccMessage($container.find('.graphing-tool-editor-styles-points-selected').attr('id'), 1, [selectedText]);
            this.accManagerView.changeAccMessage($container.find('.graphing-tool-editor-styles-line-selected').attr('id'), 1, [selectedText]);
            this.accManagerView.changeAccMessage($container.find('.graphing-tool-editor-styles-dashed-graph-selected').attr('id'), 0, [selectedText]);
            this.accManagerView.changeAccMessage($container.find('.graphing-tool-editor-styles-curve-graph-selected').attr('id'), 0, [selectedText]);

            if ($target.attr("id") === "graphing-tool-editor-style-color") {
                this.accManagerView.setFocus('purple-color');
            } else {
                this.accManagerView.setFocus('style-1');
            }
        },
        "_equationPanelScrolls": function() {
            var $focusElement = $(document.activeElement).hasClass('acc-read-elem') ? $(document.activeElement).parent() : $(document.activeElement);
            this._hideTooltip();
            if ($focusElement && $focusElement.length > 0) {
                if ($('#input-data').offset().top - $focusElement.offset().top - $focusElement.height() > 0) {
                    $focusElement.trigger('mouseleave');
                } else {
                    $focusElement.trigger('mouseleave');
                    $focusElement.trigger('mouseenter');
                }
            }
        },
        /**
         * _getEditableHasCursor return the editable hasCursor among the given hasCursors
         * @method _getEditableHasCursor
         * @param cursorClassTag {Object} jQuery hasCursor class object
         * @return {Object}
         */
        "_getEditableHasCursor": function(cursorClassTag) {
            if (!cursorClassTag) {
                return void 0;
            }
            var listCounter,
                listLength = cursorClassTag.length,
                currentCursor;
            if (listLength === 0) {
                cursorClassTag = this.$('.hasCursor');
                listLength = cursorClassTag.length;
            }
            if (listLength > 1) {
                for (listCounter = listLength - 1; listCounter >= 0; listCounter--) {
                    currentCursor = cursorClassTag.eq(listCounter);
                    if (currentCursor.hasClass('mathquill-editable')) {
                        cursorClassTag = currentCursor;
                        return cursorClassTag;
                    } else {
                        if (currentCursor.parents('.mathquill-editable').length !== 0) {
                            cursorClassTag = currentCursor;
                            return cursorClassTag;
                        }
                    }
                }
                for (listCounter = 0; listCounter < listLength; listCounter++) {
                    currentCursor = cursorClassTag.eq(listCounter);
                    if (currentCursor.hasClass('hasCursor')) {
                        cursorClassTag = currentCursor;
                        return cursorClassTag;
                    }
                }
            } else {
                return cursorClassTag;
            }
            return $(cursorClassTag[0]);
        },
        /**
         * _createSortableList creates sortable list in equation panel
         * @method _createSortableList
         * @return void
         */
        "_createSortableList": function() {
            var listArr,
                $listBox = this.$('#list-box');
            // make list sortable
            $listBox.sortable({
                "handle": '.list-sortable',
                "containment": '#input-data',
                "tolerance": 'pointer',
                "axis": 'y',
                "start": _.bind(function(event, ui) {
                    listArr = this._startListSorting(event, ui);
                }, this),
                // change serial nos. of list
                "stop": _.bind(function() {
                    this._stopListSorting(listArr);
                }, this)
            });
            /* eslint-disable new-cap*/
            $.fn.EnableTouch('.list-handle');
            /* eslint-disable new-cap*/
        },

        "_startListSorting": function(event, ui) {
            var $pickedList,
                handleNumber,
                $prevListBeforeSort,
                $nextListBeforeSort,
                $prevListAfterSort,
                $nextListAfterSort,
                $listBox = this.$('#list-box');

            $pickedList = $(ui.item);
            this._graphingToolView._setMinWidth(event, $pickedList);
            handleNumber = $pickedList.find('.handler-number').html();
            $prevListBeforeSort = $pickedList.prev();
            $nextListBeforeSort = $pickedList.next();
            $pickedList.parent().find('.list').each(function() {
                var $currentList = $(this);
                $currentList.removeClass('list-focus');
                $currentList.find('.list-handle').removeClass('warning-list-focus').addClass('list-sortable');
                $currentList.find('.equation-box').removeClass('equation-box-focus');
                $currentList.find('.list-drag').show();
            });
            if (!this._isListCollapsed($pickedList)) {
                $pickedList.addClass('list-focus');
                $pickedList.find('.list-handle').addClass('warning-list-focus').removeClass('list-sortable');
                $pickedList.find('.equation-box').addClass('equation-box-focus');
                $pickedList.find('.list-drag').hide();
            }
            $pickedList.addClass('sortable-start');
            return {
                "pickedList": $pickedList,
                "prevList": $prevListBeforeSort,
                "nextList": $nextListBeforeSort,
                "handleNumber": handleNumber
            };
        },

        "_stopListSorting": function(listArr) {
            var handleNumber = listArr.handleNumber,
                $pickedList = listArr.pickedList,
                $prevListBeforeSort = listArr.prevList,
                $nextListBeforeSort = listArr.nextList,
                $prevListAfterSort,
                $nextListAfterSort,
                $listBox = this.$('#list-box');
            this._graphingToolView._resetMinWidth();
            $prevListAfterSort = $pickedList.prev();
            $nextListAfterSort = $pickedList.next();
            $pickedList.removeClass('sortable-start');
            var undoData = {},
                redoData = {};
            undoData = {
                "target": $pickedList.attr('data-equation-cid'),
                "prev": $prevListBeforeSort.attr('data-equation-cid'),
                "next": $nextListBeforeSort.attr('data-equation-cid')
            };
            redoData = {
                "target": $pickedList.attr('data-equation-cid'),
                "prev": $prevListAfterSort.attr('data-equation-cid'),
                "next": $nextListAfterSort.attr('data-equation-cid')
            };
            this._updateHandles();
            if ($pickedList.find('.handler-number').html() !== handleNumber) {
                this.execute('sortableChange', {
                    "undo": undoData,
                    "redo": redoData
                });
            }
            if ($pickedList.attr('data-type') !== 'table') {
                $pickedList.find('textarea').focus();
            } else {
                $pickedList.find('textarea').blur();
                $pickedList.find('textarea').first().focus();
                $prevListAfterSort.find('.list-drag').show();
                $nextListAfterSort.find('.list-drag').show();
            }
            if (!this._isListCollapsed($pickedList)) {
                this._focusOnList($pickedList);
            }
            this.$('#input-data-extension').height(0);
        },

        /**
         * showChartButtons shows chart buttons in table list
         * @param $list current list object
         * @method showChartButtons
         * @return void
         */
        "showChartButtons": function($list) {
            $list.find('.chart-btns-container').show();
        },
        /**
         * hideChartButtons hides chart buttons in table list
         * @param $list current list object
         * @method hideChartButtons
         * @return void
         */
        "hideChartButtons": function($list) {
            $list.find('.common-chart-button').removeClass('selected');
            $list.find('.chart-btns-container').hide();
        },
        /**
         * _hideAllChartButtons hides chart buttons
         * @method _hideAllChartButtons
         * @return void
         */
        "_hideAllChartButtons": function() {
            this.$('.common-chart-button').removeClass('selected');
            this.$('.chart-btns-container').hide();
        },
        /**
         * _keyDownHandler handles actions on key events
         * @method _keyDownHandler
         * @param event {Object} event object
         * @return void
         */
        "_keyDownHandler": function(event) {
            if ($(event.target).parents('.list').attr('data-type') === 'table') {
                this._keyDownOnTable(event);
            } else {
                this._keyDownOnList(event);
            }
        },
        "_getNextDivToFocus": function($list) {
            var nextList = $list.next(),
                isListCollapsed,
                nextDivToFocus;
            isListCollapsed = this._isListCollapsed(nextList);
            while (isListCollapsed === true && typeof nextList !== 'undefined') {
                nextList = nextList.next();
                isListCollapsed = this._isListCollapsed(nextList);
            }
            nextDivToFocus = nextList.find('.list-data-container textarea');
            return nextDivToFocus;
        },
        "_getPrevDivToFocus": function($list) {
            var prevList = $list.prev(),
                prevDivToFocus = prevList.find('.list-data-container textarea');
            while (this._isListCollapsed(prevList) && typeof prevList !== 'undefined') {
                prevList = prevList.prev();
            }
            prevDivToFocus = prevList.find('.list-data-container textarea');
            return prevDivToFocus;
        },
        "setFocusToTextArea": function($list) {
            var dummyEvent = $.Event("keydown"); // trigger keydown event
            dummyEvent.keyCode = 32; //space key
            dummyEvent.isCustomEvent = true;
            $list.trigger(dummyEvent);
            dummyEvent = $.Event("keydown"); // trigger keydown event
            dummyEvent.keyCode = 32; //space key
            dummyEvent.isCustomEvent = true;
            $list.find('.list-data-container').trigger(dummyEvent);
        },
        "_onPaste": function(event) {
            var parentList = $(event.target).parents('.list'),
                $mathQuill = parentList.find('.list-data-container .mathquill-editable'),
                equationData = this._getMappedEquationData(parentList),
                actualText = null;
            _.delay(_.bind(function() {
                actualText = $mathQuill.mathquill('latex');
                equationData.setLatex(actualText);
                this._keyDownOnList(event);
                this._parseAndPlotEquationData(equationData, parentList);
            }, this), 0);
        },
        /**
         * _keyDownOnList handles actions on key events on equation editors
         * @method _keyDownHandler
         * @param event {Object} event object
         * @return void
         */
        "_keyDownOnList": function(event) {
            var keyCode = event.keyCode,
                $list,
                EquationPanel = MathUtilities.Tools.Graphing.Models.EquationPanel,
                ENTER_KEY = EquationPanel.ENTER_KEY,
                BACKSPACE_KEY = EquationPanel.BACKSPACE_KEY,
                DELETE_KEY = EquationPanel.DELETE_KEY,
                DOWN_ARROW_KEY = EquationPanel.DOWN_ARROW_KEY,
                UP_ARROW_KEY = EquationPanel.UP_ARROW_KEY,
                TAB_KEY = EquationPanel.TAB_KEY,
                parentList = $(event.target).parents('.list'),
                nextDivToFocus = this._getNextDivToFocus(parentList),
                prevDivToFocus = this._getPrevDivToFocus(parentList),
                $mathQuill = parentList.find('.list-data-container .mathquill-editable'),
                latex = $mathQuill.mathquill('latex'),
                undoData = {},
                redoData = {},
                $targetList,
                cursorClassTag = this.model.get('cursorClassTag'),
                currentCursor = this.$('.outerDiv .hasCursor'),
                inputColumn = this.$('#input-data'),
                scrollTop = inputColumn[0].scrollHeight,
                parentPosition,
                $inputBox,
                keyBoardTitlePosition = this._graphingToolView.$('#keyboard-title-container').offset(),
                PADDING = 50,
                manualScrollRange = {
                    "min": keyBoardTitlePosition.top - PADDING,
                    "max": keyBoardTitlePosition.top + PADDING
                },
                SCROLL_BY = 80,
                currentScrollValue,
                prevLatex,
                equationData = this._getMappedEquationData(parentList);
            currentCursor = this._getEditableHasCursor(currentCursor);
            latex = this._processLatex(latex);
            cursorClassTag = this._getEditableHasCursor(cursorClassTag);
            parentPosition = parentList.offset();
            parentList.find('.equation-box-container, .slider-text-holder').removeAttr('style');
            this._resetHeaderMaxWidth();
            this._updateListWidth(parentList.find('.equation-box').outerWidth(), equationData.getCid());
            // for text-box behind keyboard title
            if (parentPosition.top > manualScrollRange.min && parentPosition.top < manualScrollRange.max) {
                $inputBox = this.$('#input-data');
                currentScrollValue = $inputBox.scrollTop();
                $inputBox.scrollTop(currentScrollValue + SCROLL_BY);
            }
            if (parentList.find('.list-header-container').hasClass('collapse')) {
                this._toggleList(parentList);
            }
            switch (keyCode) {
                // Enter key press
                case ENTER_KEY:
                    if (!event.shiftKey) {
                        equationData = this._getMappedEquationData(parentList);
                        if (equationData.getLatex() !== latex) {
                            this._parseAndPlotEquationData(equationData, parentList);
                        }
                        this._blurMathquill(cursorClassTag);
                        $list = this._createListWithEditor();
                        // create equation data model
                        $list = this._createEquationData($list);
                        $list.insertAfter($(parentList));
                        this._createAccDivForList($list, false);
                        undoData = this._getListData($list);
                        redoData = this._getListData($list);
                        undoData.actionType = 'deleteList';
                        undoData.target = redoData.target = $list.prev().attr('data-equation-cid');
                        redoData.index = parseInt($list.prev().find('.handler-number').text(), 10) + 1;
                        redoData.actionType = 'addList';
                        this.execute('addList', {
                            "undo": undoData,
                            "redo": redoData
                        });
                        this._updateHandles();
                        if (nextDivToFocus.length === 0) {
                            inputColumn.scrollTop(scrollTop);
                        }
                        _.delay(_.bind(function() {
                            this.model.set('cursorClassTag', this.$('.outerDiv .hasCursor'));
                            this._blurMathquill(parentList);
                            this._changePlotLatex();
                            this.setFocusToTextArea($list);
                        }, this), 5);
                        this.accManagerView.unloadScreen(parentList.attr('id'));
                        this.accManagerView.enableTab("list-answer-of-" + parentList.attr('id'), false);
                        return false;
                    }
                    break;
                    // down arrow key press
                case DOWN_ARROW_KEY:
                    if (cursorClassTag.attr('mathquill-block-id') === currentCursor.attr('mathquill-block-id') || cursorClassTag.length === 0) {
                        if (event.openBracket !== true) {
                            if (nextDivToFocus.length !== 1) {
                                if (nextDivToFocus.length === 0 && parentList.next().length === 0) {
                                    equationData = this._getMappedEquationData(parentList);
                                    if (equationData.getLatex() !== latex) {
                                        this._parseAndPlotEquationData(equationData, parentList);
                                    }
                                    _.delay(_.bind(function() {
                                        parentList.find('textarea').blur();
                                        this._changePlotLatex();
                                    }, this), 5);
                                    $list = this._createListWithEditor();
                                    this.$('#list-box').append($list);
                                    this.model.set('cursorClassTag', this.$('.outerDiv .hasCursor'));
                                    $list = this._createEquationData($list);
                                    this._createAccDivForList($list, false);
                                    undoData = this._getListData($list);
                                    redoData = this._getListData($list);
                                    if (typeof undoData !== 'undefined') {
                                        undoData.actionType = 'deleteList';
                                        undoData.target = $list.prev().attr('data-equation-cid');
                                        redoData.target = $list.prev().attr('data-equation-cid');
                                        redoData.index = parseInt($list.prev().find('.handler-number').text(), 10) + 1;
                                        redoData.actionType = 'addList';
                                    }
                                    this._updateHandles();
                                    inputColumn.scrollTop(scrollTop);
                                    this.execute('addList', {
                                        "undo": undoData,
                                        "redo": redoData
                                    });
                                    this.setFocusToTextArea($list);
                                } else {
                                    _.delay(_.bind(function() {
                                        this._blurMathquill(cursorClassTag);
                                        if (nextDivToFocus.length !== 0) {
                                            nextDivToFocus[0].focus();
                                        }
                                        this.model.set('cursorClassTag', this.$('.outerDiv .hasCursor'));
                                        this._changePlotLatex();
                                        this.setFocusToTextArea(nextDivToFocus.parents('.list'));
                                    }, this), 5);
                                }
                            } else {
                                _.delay(_.bind(function() {
                                    this._blurMathquill(cursorClassTag);
                                    this._focusOnList(nextDivToFocus.parents('.list'));
                                    this.model.set('cursorClassTag', this.$('.outerDiv .hasCursor'));
                                    this._changePlotLatex();
                                    this.setFocusToTextArea(nextDivToFocus.parents('.list'));
                                }, this), 5);
                            }
                            this.accManagerView.unloadScreen(parentList.attr('id'));
                            this.accManagerView.enableTab("list-answer-of-" + parentList.attr('id'), false);
                        }
                    }
                    break;
                    // backspace and delete key press
                case BACKSPACE_KEY:
                case DELETE_KEY:
                    nextDivToFocus = parentList.next().find('.list-data-container textarea');
                    $targetList = parentList;
                    if (typeof equationData === 'undefined') {
                        return void 0;
                    }
                    prevLatex = equationData.getPrevLatex();
                    if (prevLatex === '' || prevLatex === null) {
                        if (prevDivToFocus.length !== 0) {
                            if (equationData._latex !== '') {
                                this._keyUpHandler(event);
                            }
                            undoData = this._getListData($targetList);
                            redoData = this._getListData($targetList);
                            this._removeEquationData($targetList);
                            undoData.actionType = 'addList';
                            undoData.target = redoData.target = $targetList.prev().attr('data-equation-cid');
                            undoData.index = parseInt($targetList.prev().find('.handler-number').text(), 10) + 1;
                            redoData.actionType = 'deleteList';
                            this.execute('deleteList', {
                                "undo": undoData,
                                "redo": redoData
                            });
                            $targetList.remove();
                            this._vmkClicked = false;
                            if (this._isListCollapsed(prevDivToFocus.parents('.list')) !== true) {
                                this._focusOnList(prevDivToFocus.parents('.list'));
                            }
                            _.delay(_.bind(function() {
                                this._updateHandles();
                            }, this), 5);
                        } else {
                            if (nextDivToFocus.length !== 0) {
                                undoData = this._getListData($targetList);
                                redoData = this._getListData($targetList);
                                this._removeEquationData($targetList);
                                undoData.actionType = 'addListBefore';
                                undoData.target = redoData.target = $targetList.next().attr('data-equation-cid');
                                redoData.actionType = 'deleteList';
                                this.execute('deleteList', {
                                    "undo": undoData,
                                    "redo": redoData
                                });
                                $targetList.remove();
                                this._vmkClicked = false;
                                if (this._isListCollapsed(nextDivToFocus.parents('.list')) !== true) {
                                    this._focusOnList(nextDivToFocus.parents('.list'));
                                }
                                _.delay(_.bind(function() {
                                    this._updateHandles();
                                }, this), 5);
                            }
                        }
                    }
                    this.model.set('cursorClassTag', this.$('.outerDiv .hasCursor'));
                    break;
                    // up arrow key press
                case UP_ARROW_KEY:
                    if (cursorClassTag.attr('mathquill-block-id') === currentCursor.attr('mathquill-block-id') || cursorClassTag.length === 0) {
                        if (prevDivToFocus.length !== 0) {
                            if (latex === '' && nextDivToFocus.length !== 1) {
                                $targetList = parentList;
                                undoData = this._getListData($targetList);
                                redoData = this._getListData($targetList);
                                this._removeEquationData($targetList);
                                undoData.actionType = 'addList';
                                undoData.target = redoData.target = $targetList.prev().attr('data-equation-cid');
                                undoData.index = parseInt($targetList.prev().find('.handler-number').text(), 10) + 1;
                                redoData.actionType = 'deleteList';
                                this.execute('deleteList', {
                                    "undo": undoData,
                                    "redo": redoData
                                });
                                $targetList.remove();
                                this._vmkClicked = false;
                                this._focusOnList(prevDivToFocus.parents('.list'));
                                this._updateHandles();
                                this.setFocusToTextArea(prevDivToFocus.parents('.list'));
                            } else {
                                _.delay(_.bind(function() {
                                    parentList.find('.list-data-container textarea').blur();
                                    this._focusOnList(prevDivToFocus.parents('.list'));
                                    this._changePlotLatex();
                                    this.setFocusToTextArea(prevDivToFocus.parents('.list'));
                                }, this), 5);
                            }
                            this.accManagerView.unloadScreen(parentList.attr('id'));
                            this.accManagerView.enableTab("list-answer-of-" + parentList.attr('id'), false);
                        }
                        this.model.set('cursorClassTag', this.$('.outerDiv .hasCursor'));
                    }
                    break;
                case TAB_KEY:
                    _.delay(_.bind(function() {
                        this._changePlotLatex();
                    }, this), 5);
                    break;
            }
            equationData.setPrevLatex(latex);
            _.delay(_.bind(function() {
                this.model.set('cursorClassTag', this.$('.outerDiv .hasCursor'));
            }, this), 2);
        },
        /**
         * _keyUpHandler handles keyup events on lists
         * @method _keyUpHandler
         * @param event {Object} event object
         * @return void
         */
        // keyup handler for equation editor
        "_keyUpHandler": function(event) {
            if (event.keyCode && !this._vmkClicked && $(event.target).parents('.list').attr('data-type') !== 'table') {
                this._undoRedoHandler(event);
            }
            this._callParserOnKeyUp(event);
        },
        "_addLabelClassToMathquill": function($mathquillBox) {
            $mathquillBox.find('.non-italicized-function, .mathquill-rendered-math .text')
                .addClass('label-cell-italicized-function');
        },
        /**
         * _undoRedoHandler registers undo redo events on equation change
         * @method _undoRedoHandler
         * @param event {Object}
         * @return void
         */
        "_undoRedoHandler": function(event) {
            var undoRedoData,
                equationData,
                $targetList,
                equationCid,
                processedLatex,
                undoData = {},
                _equationDataManager = this.model.get('_equationDataManager'),
                redoData = {};
            if (this._vmkClicked === true) {
                return void 0;
            }
            $targetList = $(event.target).parents('.list');
            equationCid = $targetList.attr('data-equation-cid');
            equationData = _equationDataManager.getEquationDataUsingCid(equationCid);
            if (!equationData) {
                return void 0;
            }
            undoData.data = equationData.getLatex();
            redoData.data = $targetList.find('.mathquill-editable').mathquill('latex');
            processedLatex = this._processLatex(redoData.data);
            if (undoData.data === null && redoData.data === '' || undoData.data === processedLatex) {
                return void 0;
            }
            undoData.target = redoData.target = $targetList.attr('data-equation-cid');
            undoData.dataConstant = $targetList.find('.slider-box-container').attr('data-constant');
            redoData.dataConstant = undoData.dataConstant;
            undoRedoData = {
                "undo": undoData,
                "redo": redoData
            };
            this.execute('changeEquation', undoRedoData);
        },
        /**
         * _undoRedoHandlerForList registers undo redo events on equation-box
         * @method _undoRedoHandlerForList
         * @param $targetList {Object}
         * @return void
         */
        "_undoRedoHandlerForList": function($targetList) {
            var undoRedoData,
                equationData,
                equationCid,
                undoData = {},
                processedLatex,
                _equationDataManager = this.model.get('_equationDataManager'),
                redoData = {};
            equationCid = $targetList.attr('data-equation-cid');
            equationData = _equationDataManager.getEquationDataUsingCid(equationCid);
            if (!equationData) {
                return void 0;
            }
            undoData.data = equationData.getLatex();
            redoData.data = $targetList.find('.mathquill-editable').mathquill('latex');
            processedLatex = this._processLatex(redoData.data);
            if (undoData.data === null && redoData.data === '' && undoData.data === processedLatex) {
                return void 0;
            }
            undoData.target = redoData.target = $targetList.attr('data-equation-cid');
            undoData.dataConstant = $targetList.find('.slider-box-container').attr('data-constant');
            redoData.dataConstant = undoData.dataConstant;
            undoRedoData = {
                "undo": undoData,
                "redo": redoData
            };
            this.execute('changeEquation', undoRedoData);
        },
        // call parser on key up
        /**
         * _callParserOnKeyUp calls parser with event target
         * @method _callParserOnKeyUp
         * @param event {Object} event object
         * @return void
         */
        "_callParserOnKeyUp": function(event) {
            var $target = $(event.target),
                $targetList = $target.parents('.list'),
                EquationPanel = MathUtilities.Tools.Graphing.Models.EquationPanel,
                tableNoParsingKeyCodes = [
                    EquationPanel.RIGHT_ARROW_KEY,
                    EquationPanel.LEFT_ARROW_KEY,
                    EquationPanel.DOWN_ARROW_KEY,
                    EquationPanel.UP_ARROW_KEY
                ];
            this.model.set({
                "cursorClassTag": this.$('.outerDiv .hasCursor'),
                "tableCursorClassPrev": this.$('.mathquill-editable .cursor').prev(),
                "tableCursorClassNext": this.$('.mathquill-editable .cursor').next()
            });
            if ($targetList.attr('data-type') === 'table') {
                if (tableNoParsingKeyCodes.indexOf(event.keyCode) === -1 && event.ctrlKey === false) {
                    this._callParserForTable($targetList, $target, false);
                    this._adjustTableHeaderHeightForIE(this._getTableViewObject($targetList), event);
                    this.handleDependentColumn($targetList, $target);
                }
            } else {
                this._callParserWithList($targetList);
                this._sliderPanel.focusSliders(this._getEquationDataUsingCid($targetList.attr('data-equation-cid')).getAllConstants(),
                    $targetList.find('.list-handle').attr('data-handle-number'));
            }
        },

        "deleteColumnDependency": function($cell, tableView) {
            var residualColumnDependency = tableView.model.get('residualColumnDependency'),
                colNo = $cell.attr('data-dependent-no'),
                index;
            if (residualColumnDependency[colNo]) {
                index = residualColumnDependency[colNo].indexOf($cell.attr('data-equation-cid'));
                index = index % 2 === 0 ? index : index - 1; // mod by 2 to check even odd
                residualColumnDependency[colNo].splice(index, 2); // delete 2 column of residual
                if (residualColumnDependency[colNo].length === 0) {
                    delete residualColumnDependency[colNo];
                }
                tableView.model.set('residualColumnDependency', residualColumnDependency);
            }
        },

        "handleDependentColumn": function($targetList, $target, isUndoRedoAction) {
            var tableView = this._getTableViewObject($targetList),
                dataColumn = ($target.hasClass('cell') ? $target : $target.parents(".cell")).attr("data-column"),
                colNo = dataColumn.replace("col", ""),
                $header = $targetList.find("[data-column=" + dataColumn + "].first-row"),
                residualColumnNo = $header.attr('data-dependent-no'),
                residualColumnDependency = tableView.model.get('residualColumnDependency'),
                col1, col2, residual = [],
                Chart = MathUtilities.Components.GraphChart.Models.Chart,
                loopVar,
                equationData,
                residualEquationData,
                NUMBER_PRECISION = 12,
                $col1 = $(tableView.getCellAt(1, residualColumnNo)),
                $col2,
                $col3,
                col2No,
                col3No,
                isUpdate = true,
                dependentColLength,
                residualCounter = 0,
                pointLength = tableView.getRowCount() - 1;

            if (residualColumnDependency) {
                if (!residualColumnDependency[colNo]) {
                    if (residualColumnDependency[residualColumnNo]) {
                        residualCounter = residualColumnDependency[residualColumnNo].indexOf(tableView._getColumnCid(colNo));
                        dependentColLength = residualCounter + 2; // Number of columns added on residual select is 2
                        isUpdate = false;
                    }
                } else {
                    residualColumnNo = colNo;
                }
                if (residualColumnDependency[residualColumnNo]) {
                    if (isUpdate) {
                        dependentColLength = residualColumnDependency[residualColumnNo].length;
                    }
                    while (residualCounter !== dependentColLength) {
                        residual = [];
                        $col2 = this.$('.cell[data-equation-cid=' + residualColumnDependency[residualColumnNo][residualCounter] + ']');
                        $col3 = this.$('.cell[data-equation-cid=' + residualColumnDependency[residualColumnNo][residualCounter + 1] + ']');
                        col2No = tableView._getColumnNo(residualColumnDependency[residualColumnNo][residualCounter]);
                        col3No = tableView._getColumnNo(residualColumnDependency[residualColumnNo][residualCounter + 1]);
                        equationData = this._getEquationDataUsingCid($col2.attr('data-equation-cid'));
                        residualEquationData = this._getEquationDataUsingCid($col3.attr('data-equation-cid'));
                        if ($header.find(".handler-warning").hasClass('table-error') || this._getEquationDataUsingCid($header.attr('data-equation-cid')).getLatex() === "") {
                            this._updateWarningForCell($col2, {
                                "hasError": true,
                                "errorCode": equationData.getErrorCode(),
                                "equationData": equationData,
                                "cid": tableView.cid,
                                "skip": true
                            });
                            this._updateWarningForCell($col3, {
                                "hasError": true,
                                "errorCode": this._getErrorStringForTable("ResidualError"),
                                "equationData": residualEquationData,
                                "cid": tableView.cid
                            });
                            this.clearColumnData(col2No, $targetList);
                            this.clearColumnData(col3No, $targetList);
                            return void 0;
                        }
                        $col2.find(".handler-warning").removeClass('table-error');
                        $col3.find(".handler-warning").removeClass('table-error');
                        col1 = tableView.getColumnContent(residualColumnNo, {
                            "solution": true
                        });
                        col2 = tableView.getColumnContent(col2No, {
                            "solution": true
                        });
                        for (loopVar = 0; loopVar < pointLength; loopVar++) {
                            if (col1[loopVar] === "" || col2[loopVar] === "") {
                                residual.push("");
                            } else {
                                residual.push(Chart._getDisplayableDataValues(Number(col1[loopVar]).toPrecision(NUMBER_PRECISION) - Number(col2[loopVar]).toPrecision(NUMBER_PRECISION), 5, true));
                            }
                        }
                        tableView.setColumnContent(col3No, residual, {
                            "solution": false
                        });
                        this._parseTable($col3, tableView, true, isUndoRedoAction);
                        tableView.disableAllCellsInColumn(col3No);
                        residualCounter += 2; // Number of columns added on residual select is 2
                    }
                }
            }
        },

        /**
         * _callParserForTable calls function for parsing table
         * @method _callParserForTable
         * @param $list {Object} jQuery object
         * @param $target {Object} jQuery object
         * @return void
         */
        "_callParserForTable": function($list, $target) {
            var $cell = $target.parents('.cell'),
                tableView = this._getTableViewObject($list);
            if (tableView.getRowHeaderState() && $cell.hasClass('col1')) {
                this._addLabelClassToMathquill($cell);
            }
            tableView.setCopyBtnContainerWidth();
            this._parseTable($cell, tableView);
            this._focusTableConstants(tableView);
        },
        "_adjustTableHeaderHeightForIE": function($tableView, event) {
            var userAgent = navigator.userAgent.toLowerCase(),
                $headerCells, currentHeight = 0,
                $target, $headerRow;
            if (/msie\s(9|10)/.test(userAgent) || (!(window.ActiveXObject) && "ActiveXObject" in window)) {
                if (typeof event !== 'undefined') {
                    $target = $(event.target);
                    $headerRow = $target.parents("[data-row-id=row1]");
                } else {
                    $headerRow = $tableView.$("[data-row-id=row1]");
                }
                if ($headerRow.length > 0) {
                    $headerCells = $headerRow.find('.cell');
                    currentHeight = 0;
                    $headerCells.css({
                        "height": ''
                    });
                    currentHeight = $headerCells.height();
                    $headerCells.css({
                        "height": currentHeight + 'px'
                    });
                }
            }
        },
        /**
         * _createEquationData creates an equationData model for the given list and maps it
         * @method _createEquationData
         * @param $list {Object} jQuery object containing list
         * @return {Object} jQuery object containing list with mapped equationData model
         */
        "_createEquationData": function($list) {
            var equationData = new MathUtilities.Components.EquationEngine.Models.EquationData(),
                _equationDataManager = this.model.get('_equationDataManager'),
                color = this.model.generateRandomColorCode();
            equationData.on('error-in-response', _.bind(this._processErrorInResponse, this));
            equationData.setColor(color, true);
            equationData.colorName = this.model.get('COLOR_NAMES')[color];
            equationData.setDashArray([], true);
            if (this._projectorMode === true) {
                equationData.setThickness(7, true);
                equationData.setPreviousThickness(3);
            } else {
                equationData.setThickness(3, true);
            }
            equationData.setVisible(true);
            equationData.setLatex('', true);
            equationData.setPrevLatex('');
            equationData.setHasIntercepts(this.hasShowCriticalPoints);
            equationData.setHasDiscontinuousPoints(this.hasShowCriticalPoints);
            equationData.setHasMaximaMinima(this.hasShowCriticalPoints);
            equationData.setHasIntersections(this.hasShowCriticalPoints);
            equationData.setInEqualityOpacity(0.5);
            equationData.getDirectives().FDFlagMethod = 'graphing';
            equationData.getDirectives().processingInstructions = 11;
            equationData.getUnits().angle = this.model.get('equationDataUnits');
            equationData.on('focus-equation', _.bind(function() {
                this._blurMathquill($('.hasCursor'));
                _.delay(_.bind(function() {
                    this._blurMathquill($('.hasCursor'));
                    this._focusListBox(equationData);
                }, this), 0);
            }, this));
            equationData.on('change-in-point', _.bind(this.checkIfChangeInPoint, this));
            equationData.setExtraThickness(true);
            equationData.setDragHitThickness(20);
            _equationDataManager.addEquation(equationData);
            equationData.off('plotComplete').on('plotComplete', _.bind(this.updatePaperItems, this, false, 'point'));
            if ($list) {
                $list.attr('data-equation-cid', equationData.getCid())
                    .find('.mathquill-editable').addClass('equation-editor');
                return $list;
            }
            return equationData;
        },

        "updatePaperItems": function(isKeepCurrentItem, itemType) {
            this._graphingToolView.trigger("add-paper-items", isKeepCurrentItem, itemType);
        },


        "_createEquationDataList": function() {
            var elementsArr = this.$('div[data-equation-cid]:not([data-table-view-cid], [data-ignore-column=true], .first-row.first-col)'),
                counter = 0,
                elementsArrLength = elementsArr.length,
                equationDataArr = [],
                equationDataManager = this.model.get('_equationDataManager'),
                currentEquationData;

            for (; counter < elementsArrLength; counter++) {
                currentEquationData = equationDataManager.getEquationDataUsingCid($(elementsArr[counter]).attr('data-equation-cid'));
                if (currentEquationData !== void 0) {
                    equationDataArr.push(currentEquationData);
                }
            }
            return equationDataArr;
        },

        /**
         * _removeEquationData removes the mapped equationData model for the given list
         * @method _removeEquationData
         * @param $list {Object} jQuery object containing list
         * @param isCid {Boolean} Boolean to specify whether the first attribute is a backbone cid
         * @return void
         */
        "_removeEquationData": function($list, isCid) {
            var equationDataCid,
                _equationDataManager = this.model.get('_equationDataManager'),
                affectedEquationData,
                equationData;
            if (isCid) {
                equationDataCid = $list;
            } else {
                equationDataCid = $list.attr('data-equation-cid');
            }
            equationData = _equationDataManager.getEquationDataUsingCid(equationDataCid);
            if (equationData && equationData.getSpecie() === 'slider') {
                this._sliderPanel.removeSlider({
                    "sliderName": equationData.getDefinitionName(),
                    "doNotDeleteList": true
                });
            }
            affectedEquationData = _equationDataManager.removeEquation(equationData);
            this._processParsedEquationDataArray(affectedEquationData.equations);
            this._processTableCellsWithDefinitions(affectedEquationData.definitions);
        },
        // list parsing
        /**
         * _callParserWithListcalls parser with the given list
         * @method _callParserWithList
         * @param $targetList {Object} jQuery object of list div
         * @return void
         */
        "_callParserWithList": function($targetList) {
            this.model.set('cursorClassTag', this.$('.outerDiv .hasCursor'));
            if (this._vmkClicked === true) {
                return void 0;
            }
            // get mapped equation data
            var equationData = this._getMappedEquationData($targetList),
                latex = $targetList.find('.mathquill-editable').mathquill('latex');
            if (!equationData) {
                return void 0;
            }
            latex = this._processLatex(latex);
            // call parser only when latex changed
            if (latex !== equationData.getLatex()) {
                this._parseAndPlotEquationData(equationData, $targetList);
            }
        },
        /**
         * _processParsedEquationDataArray processes parsed equationData array
         * @method _processParsedEquationDataArray
         * @param equationDataArray {Array} array of equationData
         * @param ignoreEquationData {Object} equationData to be ignored
         * @return void
         */
        "_processParsedEquationDataArray": function(equationDataArray, ignoreEquationData) {
            var noOfEquationData,
                equationDataCounter;
            noOfEquationData = equationDataArray.length;
            for (equationDataCounter = 0; equationDataCounter < noOfEquationData; equationDataCounter++) {
                if (ignoreEquationData && equationDataArray[equationDataCounter].getCid() === ignoreEquationData.getCid()) {
                    continue;
                }
                this._processParsedEquationData(equationDataArray[equationDataCounter]);
            }
        },
        /**
         * _parseAndPlotEquationData parses and processes the given equationData
         * @method _parseAndPlotEquationData
         * @param equationData {Object} equationData model Object
         * @param $list {Object} jQuery div Object
         * @return void
         */
        "_parseAndPlotEquationData": function(equationData, $list) {
            var latex,
                _equationDataManager = this.model.get('_equationDataManager'),
                affectedEquationData;
            if (!equationData) {
                return void 0;
            }
            if (!$list) {
                $list = this.$('div[data-equation-cid=' + equationData.getCid() + ']');
                if ($list.attr('data-has-slider')) {
                    return void 0;
                }
            }
            if ($list.length) {
                latex = $list.find('.mathquill-editable').mathquill('latex');
                latex = this._processLatex(latex);
                this._callRemovePlottedGraph(equationData);
                $list.find('.list-answer').remove();
                equationData.setLatex(latex, true);
                affectedEquationData = _equationDataManager.changeInMathquill(equationData);
                this._processParsedEquationDataArray(affectedEquationData.equations);
                this._processTableCellsWithDefinitions(affectedEquationData.definitions);

                equationData.setPrevLatex(equationData.getLatex());
            }
        },
        /**
         * _processParsedEquationData processes parsed equationData
         * @method _processParsedEquationData
         * @param equationDataArray {Object} equationData
         * @param $list {Object} jQuery list object
         * @return void
         */
        "_processParsedEquationData": function(equationData, $list) {
            if (typeof $list === 'undefined') {
                $list = this.$('div[data-equation-cid=' + equationData.getCid() + ']');
            }
            if ($list.attr('data-type') === 'table' || $list.hasClass('cell') || $list.length === 0) {
                return void 0;
            }
            if (equationData.isCanBeSolved()) {
                this._processEquationData($list, equationData);
            } else {
                this._processEquation(equationData, $list);
            }
        },
        "_processEquationData": function($list, equationData) {
            var constant;
            $list.find('.slider-box-container').hide();
            if ($list.attr('data-has-slider')) {
                $list.find('.slider-box-container').html('').hide();
                constant = $list.attr('data-constant');
                this._sliderPanel.removeSlider({
                    "sliderName": constant,
                    "doNotDeleteList": true
                });
                $list.removeAttr('data-has-slider').removeAttr('data-constant');
            }
            if (equationData.getSpecie() === 'number') {
                if (equationData.getFdFlag() === 'frac') {
                    this._displaySolution(equationData, $list);
                }
            } else if (equationData.getSpecie() === 'linear' || equationData.getSpecie() === 'quadratic' || equationData.getSpecie() === 'expression') {
                this._displaySolution(equationData, $list);
            } else if (equationData.getSpecie() === 'plot') {
                $list.find('.list-answer').remove();
            } else if (equationData.getSpecie() === 'slider') {
                this._appendSlider(equationData, $list);
            }
            this._updateWarning($list, equationData);
        },
        /**
         * _displaySolution displays solutions of the given equation for the given list
         * @method _displaySolution
         * @param equationData {Object} equationData model Object
         * @param $list {Object} jQuery list Object
         * @return void
         */
        // if equation can be solved and cannot be plotted display solution
        "_displaySolution": function(equationData, $list) {
            var $listAnswer,
                solution,
                iLooper,
                fracdec,
                data,
                solutionDigit = [],
                accMessage,
                solutionDisplay = [],
                LAST_INDEX = 283,
                precision = this.model.get("precision"),
                MathHelper = MathUtilities.Components.Utils.Models.MathHelper;
            if (equationData.getSolution() === null) {
                return void 0;
            }
            solution = equationData.getSolution();
            if (solution === void 0) {
                solution = 'undefined';
            } else if (!isNaN(solution) && !isFinite(solution)) {
                solution = 'Overflow';
            }
            $listAnswer = $('<div/>', {
                "class": 'list-answer',
                "id": 'list-answer-of-' + $list.attr('id')
            });
            $listAnswer.mathquill('revert').mathquill();
            if (solution.length > 1 && solution[0] === 'undefined' && solution[1] === 'undefined' && !equationData.getRange()) {
                $listAnswer.mathquill('latex', '= complex\\text{ }roots');
                $list.find('.list-answer').remove();
                $listAnswer.insertAfter($list.find('.equation-box'));
                return void 0;
            }
            if (equationData.getSpecie() === 'quadratic') {
                solutionDigit.push(solution[0], solution[1]);
            } else if (solution === 'undefined' || solution === 'Overflow') {
                solutionDigit.push(solution);
            } else {
                solutionDigit.push(Number(solution));
            }

            function getDisplaySolution(num) {
                if (isNaN(num)) {
                    equationData.setCanBeSolved(false);
                    return;
                }
                if (equationData.getFdFlag() === 'frac' &&
                    !MathHelper._isNumberQualifiedForScientificNotations(num)) {
                    fracdec = MathUtilities.Components.FractDec.Models.FD.toFraction(num);
                    if (fracdec && fracdec.denominator > 1 &&
                        !(MathHelper._isNumberQualifiedForScientificNotations(fracdec.numerator) ||
                            MathHelper._isNumberQualifiedForScientificNotations(fracdec.denominator))) {
                        if (fracdec.numerator < 0 === fracdec.denominator < 0) {
                            //either is negative
                            return '\\frac{' + fracdec.numerator + '}{' + fracdec.denominator + '}';
                        }
                        //neither is negative
                        return '-\\frac{' + Math.abs(fracdec.numerator) + '}{' + Math.abs(fracdec.denominator) + '}';
                    }
                }
                return MathHelper._convertDisplayToAppliedPrecisionForm(num, precision); //trim number to precision digits
            }

            for (iLooper in solutionDigit) {
                if (solutionDigit[iLooper] === 'undefined' || solutionDigit[iLooper] === 'Overflow') {
                    data = solutionDigit[iLooper];
                } else {
                    data = getDisplaySolution(solutionDigit[iLooper]);
                    if (!data) {
                        return;
                    }

                }
                solutionDisplay.push(data);
            }
            if (solutionDisplay.length === 1) {
                $listAnswer.mathquill('latex', '=' + solutionDisplay[0]);
                accMessage = solutionDisplay[0] === Infinity ? 'Infinity' : this.getAccTextFromLatex(solutionDisplay[0]);
            } else {
                if (solutionDisplay[0] === 'undefined' && solutionDisplay[1] === 'undefined' && !equationData.getRange()) {
                    $listAnswer.mathquill('latex', '= complex  roots ');
                    accMessage = 'complex  roots';
                } else {
                    $listAnswer.mathquill('latex', equationData.getFunctionVariable() + '\\text{ }= ' +
                        solutionDisplay[0] + '\\text{ or }' + solutionDisplay[1]);
                }
            }
            accMessage = this.accManagerView.getAccMessage('output-text', 0, [equationData.getAccText(), accMessage]);
            $list.find('.list-answer').remove();
            $listAnswer.insertAfter($list.find('.equation-box'));
            this._createAccDiv('list-answer-of-' + $list.attr('id'), this.listTabIndex + LAST_INDEX, '', accMessage);
        },

        /**
         * updatePrecision updates the display when precision is set
         * @method updatePrecision
         * @return void
         */
        "updatePrecision": function() {
            var cid = [],
                index,
                equationData,
                precision = this.model.get("precision"),
                $list, toolTips,
                _equationDataManager = this.model.get('_equationDataManager'),
                $elements = this.$('.list-box').find('.list'),
                $el = $elements,
                $elementsLength = $el.length;

            MathUtilities.Components.GraphChart.Models.Chart.PRECISION_FOR_CHARTS = precision;
            MathUtilities.Components.Spinner.Models.Spinner.PRECISION_VALUE = precision;

            for (index = 0; index < $elementsLength; index++) {
                cid.push($el.attr('data-equation-cid'));
                $list = $list = this.$('div[data-equation-cid=' + cid[index] + ']');
                equationData = this._getEquationDataUsingCid(cid[index]);
                if (!$el.attr('data-has-slider') && equationData.getSpecie() !== "point" && equationData.getSpecie() !== "number") {
                    this._displaySolution(equationData, $list);
                }
                if (equationData.getSpecie() === "point") {
                    toolTips = this._graphingToolView._gridGraphView.$('.coordinate-tooltip[data-equation-cid="' + equationData.getCid() + '"]');
                    toolTips.remove();
                    this._graphingToolView._gridGraphView._redrawPoints();
                    this._showCriticalPoints(equationData);
                } else {
                    this._removeCriticalPoints(equationData);
                    _equationDataManager.get('_plotterView').changePlotVisibility(equationData);
                }
                $el = $el.next();
            }
            this._parseAllTables();
        },

        /**
         *getPrecision get precision
         *@method getPrecision
         *@return precision value
         */
        "getPrecision": function() {
            return this.model.get("precision");
        },

        /**
         * _processErrorInResponse processes equation data
         * @method _processErrorInResponse
         * @param equationData {Object} jQuery object
         */
        "_processErrorInResponse": function(equationData) {
            var $list = this.$('div[data-equation-cid=' + equationData.getCid() + ']');
            this._processEquation(equationData, $list);
        },
        // if equation cannot be solved process it
        /**
         * _processEquation is called when the equation cannot be solved
         * @method _processEquation
         * @param equationData {Object} equationData model Object
         * @param $list {Object} jQuery list Object
         * @return void
         */
        "_processEquation": function(equationData, $list) {
            var $warning = $list.find('.handler-warning'),
                $warningText = $list.find('.handler-warning-text'),
                $chngeGraphStyle = $list.find('.change-graph-style'),
                $sliderBox,
                prevMaxWidth,
                errorText,
                accMessage,
                plotEquationPoints = equationData.getPoints() || [],
                constants, sliderText,
                $listHandle = $list.find('.list-handle');
            $list.find('.graph-style-edit-options').hide();
            if ($list.attr('data-type') === 'table') {
                return void 0;
            }
            if (plotEquationPoints.length > 0) {
                this.checkIfChangeInPoint(plotEquationPoints, []);
                equationData.setPoints([]);
            }
            this.$('.hover-tooltip').remove();
            this.$('#grid-graph-container').removeClass('tool-tip-hover-cursor');
            this._callRemovePlottedGraph(equationData);
            $list.find('.list-answer').remove();
            $list.find('.show-hide-equation-container').hide();
            errorText = this.model.get('ERROR_STRINGS').LIST_ERRORS;
            if (equationData.getErrorCode() !== 'OnlyNumbers') {
                if ($list.attr('data-has-slider')) {
                    this._sliderPanel.removeSlider({
                        "sliderName": $list.attr('data-constant'),
                        "doNotDeleteList": true
                    });
                    $list.removeAttr('data-has-slider').find('.slider-box-container').html('').removeAttr('data-constant').hide();
                }
            }
            prevMaxWidth = $list.find('.slider-text-holder').css('max-width');
            $list.find('.slider-box-container').html('').removeAttr('data-constant').hide();
            $list.removeAttr('data-has-slider data-slider-view-cid');
            this.$('.coordinate-tooltip[data-equation-cid=' + equationData.getCid() + ']').remove();
            switch (equationData.getErrorCode()) {
                case 'ConstantDeclaration':
                    $sliderBox = this._createSliderElements(equationData.getErrorData(), $list);
                    $list.find('.slider-box-container').html($sliderBox);
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    $warningText.html(errorText.ConstantDeclaration);
                    $list.find('.slider-box-container').show();
                    this.accManagerView.unloadScreen($list.attr('id'));
                    this.accManagerView.loadScreen($list.attr('id'));
                    constants = $list.find('.slider-box-container .slider').attr('data-slider-constants');
                    if (constants.length === 1) {
                        sliderText = this.accManagerView.getAccMessage('slider-panel-title-text', 1);
                    } else {
                        sliderText = this.accManagerView.getAccMessage('slider-panel-title-text', 0);
                    }
                    accMessage = this.accManagerView.getAccMessage('list-equation-panel-messages', 20, [sliderText, constants]);
                    this.accManagerView.setAccMessage('slider-of-' + $list.attr('id'), accMessage);
                    if (prevMaxWidth && prevMaxWidth !== 'none') {
                        $list.find('.slider-text-holder').css('max-width', prevMaxWidth);
                    }
                    break;
                case 'UndefinedValues':
                case 'MixedFractionError':
                case 'CannotUnderstandThis':
                case 'InvalidRange':
                case 'AlreadyDefined':
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    $warningText.html(errorText[equationData.getErrorCode()]);
                    break;
                case 'FunctionVariable':
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    $warningText.html(errorText.FunctionVariable);
                    break;
                case 'InfinityPlot':
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    $warningText.html(errorText.InfinityPlot);
                    break;
                case 'SumProdForInEquality':
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    $warningText.html(errorText.SumProdForInEquality);
                    break;
                case 'CircularDependancy':
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    $warningText.html('There is a circular dependency');
                    break;
                case 'Blank':
                    $warning.removeClass('graph error no-graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.removeClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    $warningText.removeClass('dark').css({
                        "display": "none"
                    });
                    break;
                case 'NoneVariablesQuadratic':
                    $warningText.html(errorText.NoneVariablesQuadratic);
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    break;
                case 'NoneVariablesQuadraticInequality':
                    $warningText.html(errorText.NoneVariablesQuadraticInequality);
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    break;
                case 'Complicated':
                    $warningText.html(errorText.Complicated);
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    break;
                case 'FracDecError':
                    $warningText.html(errorText.FracDecError);
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    break;
                case 'OnlyY':
                    $warningText.html(errorText.OnlyY);
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    break;
                case 'InequalityOnlyNumbers':
                    $warningText.html(errorText.InequalityOnlyNumbers);
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    $warningText.html(errorText.InequalityOnlyNumbers);
                    break;
                case 'ComplexRootInequality':
                    $warningText.html(errorText.ComplexRootInequality);
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    break;
                case 'OnlyNumbers':
                    $warningText.html('Sorry-I don\'t understand this.');
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
                    if ($list.attr('data-has-slider')) {
                        $list.removeAttr('data-has-slider');
                        $list.find('.slider-box-container').html('').hide();
                    }
                    break;
                default:
                    $warningText.html('Sorry-I don\'t understand this.');
                    $warning.addClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.addClass('handle-error');
                    $chngeGraphStyle.removeClass('visible');
            }
        },
        /**
         * _blurMathquill calls blur for for the given jQuery object containing mathquill
         * @method _blurMathquill
         * @param {Object} jQuery object
         * @return void
         */
        "_blurMathquill": function($hasCursor) {
            var textarea,
                textareaCounter = 0,
                noOfTextarea;
            if ($hasCursor.length > 1) {
                noOfTextarea = $hasCursor.length;
                for (textareaCounter = 0; textareaCounter < noOfTextarea; textareaCounter++) {
                    this._blurMathquill($hasCursor.eq(textareaCounter));
                }
            }
            if ($hasCursor.hasClass('mathquill-editable')) {
                textarea = $hasCursor.find('textarea');
            } else {
                textarea = $hasCursor.parents('.mathquill-editable').find('textarea');
            }
            if ($hasCursor.hasClass('list')) {
                textarea = $hasCursor.find('textarea');
            }
            textarea.blur();
        },
        /**
         * _processLatex processes latex for few mathquill functions
         * @method _processLatex
         * @param latex {String} latex string to be processed
         * @return {String} processed latex
         */
        "_processLatex": function(latex) {
            var replaceString = {
                "\\{ceil}": '\\ceil',
                "\\{floor}": '\\floor',
                "round}": '\\round',
                "abs}": '\\abs',
                "nPr}": '\\nPr',
                "nCr}": '\\nCr',
                "npr}": '\\npr',
                "ncr}": '\\ncr',
                "fracdec}": '\\fracdec'
            };
            latex = latex.replace(/\\spacing@/gi, ""); // regex to replace string \\spacing@ from the latex
            latex = latex.replace(/\\text{/g, ''); // regex to replace string \\text from the latex
            latex = latex.replace(/round}|abs}|fracdec}|\\{ceil}|nPr}|nCr}|npr}|ncr}|\\{floor}/g, function(matched) {
                return replaceString[matched]; // Regex to replace match string from object `replaceString`
            });
            return latex;
        },
        /**
         * _revertProcessLatex reverts processes latex for few mathquill functions
         * @method _revertProcessLatex
         * @param latex {String} processed latex string to be processed
         * @return {String} reverted latex
         */
        "_revertProcessLatex": function(latex) {
            var replaceString = {
                "\\ceil": '\\{ceil}',
                "\\floor": '\\{floor}',
                "\\round": '\\text{round}',
                "\\abs": '\\text{abs}',
                "\\nPr": '\\text{nPr}',
                "\\nCr": '\\text{nCr}',
                "\\npr": '\\text{npr}',
                "\\ncr": '\\text{ncr}',
                "\\fracdec": '\\text{fracdec}'
            };
            latex = latex.replace(/(\\round|\\abs|\\ceil|\\npr|\\ncr|\\nPr|\\nCr|\\floor|\\fracdec)/g, function(matched) {
                return replaceString[matched]; // revert process for replacement done in function `processLatex`
            });
            return latex;
        },
        /**
         * sets projector mode on.
         * @method _projectorModeOn
         * @return void
         */
        "_projectorModeOn": function() {
            var equationDataList,
                equationCounter,
                MAX_THICKNESS = 7,
                equationData,
                plotEquation,
                noOfEquations;
            this._projectorMode = true;
            equationDataList = this.model.get('_equationDataManager').getEquationDataList();
            noOfEquations = equationDataList.length;
            for (equationCounter = 0; equationCounter < noOfEquations; equationCounter++) {
                equationData = equationDataList[equationCounter];
                plotEquation = equationData.getPlot();
                if (plotEquation !== null) {
                    plotEquation.setPreviousThickness(equationData.getThickness());
                    plotEquation.changeThickness(MAX_THICKNESS);
                }
                equationData.setPreviousThickness(equationData.getThickness());
                equationData.changeThickness(MAX_THICKNESS);
            }
        },
        /**
         * sets projector mode off.
         * @method _projectorModeOff
         * @return void
         */
        "_projectorModeOff": function() {
            if (this._projectorMode !== true) {
                return void 0;
            }
            var equationDataList,
                equationCounter,
                prevThickness,
                equationData,
                plotEquation,
                _equationDataManager = this.model.get('_equationDataManager'),
                noOfEquations;
            this._projectorMode = false;
            equationDataList = _equationDataManager.getEquationDataList();
            noOfEquations = equationDataList.length;
            for (equationCounter = 0; equationCounter < noOfEquations; equationCounter++) {
                equationData = equationDataList[equationCounter];
                prevThickness = equationData.getPreviousThickness();
                plotEquation = equationData.getPlot();
                if (plotEquation !== null) {
                    plotEquation.changeThickness(prevThickness);
                }
                equationData.changeThickness(prevThickness);
            }
        },
        /**
         * _equationUnitToggle toggles unit and sets units of all the equationData
         * @method _equationUnitToggle
         * @return void
         */
        "_equationUnitToggle": function(equationDataUnits) {
            var affectedEquations = [];
            if (typeof equationDataUnits === 'undefined' || typeof equationDataUnits === 'object') {
                if (this.model.get('equationDataUnits') === 'rad') {
                    equationDataUnits = 'deg';
                } else {
                    equationDataUnits = 'rad';
                }
            }
            this.model.set('equationDataUnits', equationDataUnits);
            affectedEquations = this.model.get('_equationDataManager').equationListUnitToggle(equationDataUnits);
            this._processParsedEquationDataArray(affectedEquations.equations);
            this._parseAllTables();
        },
        // slider related
        /**
         * Appends slider in the given list
         * @method _appendSlider
         * @param equationData {Object} Backbone model object of equationData
         * @param $list {Object} jQuery object in which slider is to be appended
         * @return void
         */
        "_appendSlider": function(equationData, $list) {
            var sliderBox,
                sliderOptions,
                definedConstant,
                constantValue,
                EquationPanel = MathUtilities.Tools.Graphing.Models.EquationPanel,
                prevSliderId = $list.attr('data-slider-view-cid'),
                minValue = EquationPanel.SLIDER_MIN_VALUE,
                maxValue = EquationPanel.SLIDER_MAX_VALUE,
                BASEPATH = MathUtilities.Tools.Graphing.Models.GraphingToolModel.BASEPATH,
                sliderCounter,
                listHandleNumber,
                sliderViewsCollection = this.model.get('sliderViewsCollection'),
                noOfSliders = sliderViewsCollection.length;
            definedConstant = equationData.getDefinitionName();
            constantValue = equationData.getSolution();
            if (constantValue < minValue) {
                minValue = constantValue;
            } else {
                if (constantValue > maxValue) {
                    maxValue = constantValue;
                }
            }
            sliderOptions = {
                "min": minValue,
                "max": maxValue,
                "val": constantValue,
                "step": EquationPanel.SLIDER_STEP_VALUE,
                "currValueHide": true,
                "addClass": 'graphing-tool-sprite-holder',
                "sliderBackground": {
                    "isSliderContainerImageSlice": true,
                    "sliderContainerLeftImage": BASEPATH + 'img/tools/common/tools/graphing-plotting/left-slider-base.png',
                    "sliderContainerRightImage": BASEPATH + 'img/tools/common/tools/graphing-plotting/right-slider-base.png',
                    "sliderContainerMiddleImage": BASEPATH + 'img/tools/common/tools/graphing-plotting/middle-slider-base.png',
                    "sliderHeaderImage": BASEPATH + 'img/tools/common/tools/graphing-plotting/slider-handle-up-icon.png',
                    "sliderHeaderImageOnMouseOver": BASEPATH + 'img/tools/common/tools/graphing-plotting/slider-handle-hover-icon.png'
                }
            };
            if (this.addSliderBackground === false) {
                sliderOptions.sliderBackground = void 0;
            }
            sliderBox = $list.find('.slider-box-container');
            sliderBox.html('');
            if (!definedConstant) {
                definedConstant = equationData.getDefinitionName();
            }
            listHandleNumber = $list.find('.list-handle').attr('data-handle-number');
            this._sliderPanel.addSlider({
                "sliderName": definedConstant,
                "sliderOptions": sliderOptions,
                "equationData": equationData,
                "dependent": true,
                "listNumber": listHandleNumber
            });
            this._sliderPanel.focusSliders(equationData.getAllConstants(), listHandleNumber);
            $list.attr('data-has-slider', true).attr('data-constant', definedConstant);
            if (prevSliderId) {
                for (sliderCounter = 0; sliderCounter < noOfSliders; sliderCounter++) {
                    if (sliderViewsCollection[sliderCounter].cid === prevSliderId) {
                        sliderViewsCollection.splice(sliderCounter, 1);
                        break;
                    }
                }
            }
            equationData.setSpecie('slider');
        },
        /**
         * returns slider view object for the given list
         * @method _getSliderViewObject
         * @param $list {Object} jQuery object
         * @return {Object} slider view object
         */
        "_getSliderViewObject": function($list) {
            var sliderName = $list.attr('data-constant'),
                sliderView = this._getSliderView(sliderName);
            return sliderView;
        },
        /**
         * returns slider view object for the given cid
         * @method _getSliderView
         * @param sliderName {String} name of constant for which slider is created
         * @return {Object} slider view object
         */
        "_getSliderView": function(sliderName) {
            return this._sliderPanel.getSliderFromCollectionUsingName(sliderName);
        },
        /**
         * _addSlider creates a list with a slider
         * @method _addSlider
         * @param event {Object} event object
         * @return void
         */
        "_addSlider": function(event) {
            var sliderBox = $(event.target).parents('.slider-box'),
                sliders = sliderBox.children('.slider').attr('data-slider-constants').split(','),
                sliderIndex,
                sliderView, listHandleNumber,
                undoRedoData = {},
                sliderOptions,
                sliderLength,
                equationData,
                constant, $list, listEquationData,
                undoDataForAll = [],
                redoDataForAll = [],
                $target = $(event.target),
                targetSliderElement,
                uniqueId,
                constantFieldName;
            if ($target.hasClass('slider')) {
                targetSliderElement = $target;
            } else {
                targetSliderElement = $target.parents('.slider');
            }
            $list = $target.parents('.list');
            $list.find('.slider-box-container').hide();
            listEquationData = this._getMappedEquationData($list);
            listHandleNumber = $list.find('.list-handle').attr('data-handle-number');
            if (targetSliderElement.hasClass('all-slider')) {
                sliderLength = sliders.length;
                for (sliderIndex = 0; sliderIndex < sliderLength; sliderIndex++) {
                    uniqueId = $list.attr('id') + sliderIndex;
                    undoRedoData = {};
                    constant = sliders[sliderIndex];
                    equationData = this._createEquationData();
                    sliderView = this._sliderPanel.addSlider({
                        "sliderName": constant,
                        "sliderOptions": sliderOptions,
                        "equationData": equationData,
                        "listNumber": listHandleNumber,
                        "uniqueId": uniqueId
                    });
                    this._sliderPanel.focusSliders(listEquationData.getAllConstants(), listHandleNumber);
                    undoRedoData.undo = this._sliderPanel.getSliderData(sliderView);
                    undoRedoData.undo.actionType = 'deleteSlider';
                    undoRedoData.redo = this._sliderPanel.getSliderData(sliderView);
                    undoRedoData.redo.actionType = 'addSlider';
                    undoDataForAll.push(undoRedoData.undo);
                    redoDataForAll.push(undoRedoData.redo);
                    constantFieldName = sliderView.$el.siblings('.constant-value-holder').find('.constant-name');
                    constantFieldName.hover(_.bind(this._displayTooltipOverConstantName, this), _.bind(this._hideTooltip, this));
                    this.accManagerView.createAccDiv({
                        "elementId": "slider-constant-textarea-holder-" + uniqueId,
                        "tabIndex": 5000,
                        "acc": this.accManagerView.getAccMessage('slider-panel-messages', 1, [constant, 1])
                    });
                    this.accManagerView.createAccDiv({
                        "elementId": 'delete-constant-slider-' + uniqueId,
                        "tabIndex": 5000,
                        "acc": this.accManagerView.getAccMessage('slider-panel-messages', 5, [constant])
                    });
                    this.accManagerView.createAccDiv({
                        "elementId": 'slider-' + uniqueId,
                        "tabIndex": 5000,
                        "acc": this.accManagerView.getAccMessage('slider-panel-messages', 6, [constant, 1])
                    });

                    this.accManagerView.createAccDiv({
                        "elementId": 'constant-name-cell-text-of-' + constant,
                        "tabIndex": 6005,
                        "acc": constant + this.accManagerView.getAccMessage('slider-panel-messages', 7)
                    });
                    this.accManagerView.createAccDiv({
                        "elementId": 'lower-limit-textbox-container-' + constant,
                        "tabIndex": 6005,
                        "acc": this.accManagerView.getAccMessage('slider-panel-messages', 2, [constant])
                    });
                    this.accManagerView.createAccDiv({
                        "elementId": 'upper-limit-textbox-container-' + constant,
                        "tabIndex": 6005,
                        "acc": this.accManagerView.getAccMessage('slider-panel-messages', 3, [constant])
                    });
                    this.accManagerView.createAccDiv({
                        "elementId": 'step-textbox-container-' + constant,
                        "tabIndex": 6005,
                        "acc": this.accManagerView.getAccMessage('slider-panel-messages', 4, [constant])
                    });
                }
                this.execute('sliderAppendAll', {
                    "undo": undoDataForAll,
                    "redo": redoDataForAll
                });
                this._updateHandles();
                this._updateAllWarnings();
            }
            this._changePlotLatex();
            this._sliderPanel.hideKeyboard();
            this._sliderPanel.showPanel();
            this.accManagerView.setFocus($($('#current-list-constants .constant-slider-container .constant-textarea-holder')[0]).attr('id'));
        },
        "_displayTooltipOverConstantName": function(event) {
            var $target = $(event.target),
                $sliderContainer = $target.parents('.constant-slider-container'),
                $sliderHolder = $sliderContainer.find('.slider-holder'),
                latex = $sliderHolder.attr('data-constant'),
                $sliderTextContainer = $sliderContainer.find('.constant-name'),
                $sliderText = $sliderTextContainer.find('.constant-name-text'),
                TEXT_MARGIN = 10;
            if ($sliderText.width() + TEXT_MARGIN > $sliderTextContainer.width()) {
                this._showTooltip({
                    "element": $sliderTextContainer,
                    "latex": latex,
                    "arrowPosition": 'top'
                });
            }
        },
        /**
         * returns slider data for the given list
         * @method _getSliderData
         * @param $list {Object} jQuery div object having slider
         * @return {Object} JSON object having slider data
         */
        "_getSliderData": function($list) {
            var listData = {},
                sliderViewObject;
            listData.equationData = this._getMappedEquationData($list);
            listData.equationCid = $list.attr('data-equation-cid');
            listData.equation = $list.find('.mathquill-editable').mathquill('latex');
            listData.type = $list.attr('data-type');
            listData.dataConstant = $list.find('.slider-box-container').attr('data-constant');
            sliderViewObject = this._getSliderViewObject($list);
            listData.sliderCid = sliderViewObject.cid;
            listData.currValue = sliderViewObject.get('currValue');
            listData.step = sliderViewObject.get('step');
            listData.min = sliderViewObject.get('min');
            listData.max = sliderViewObject.get('max');
            listData.addClass = 'graphing-tool-sprite-holder';
            return listData;
        },
        /**
         * _callUpdateLatex changes latex when the slider values are changed
         * @method _callUpdateLatex
         * @param equationCid {String} Backbone model cid for the equationData object
         * @param latex {String} Equation Latex
         * @return void
         */
        "_callUpdateLatex": function(equationCid, latex) {
            var equationData = this._getEquationDataUsingCid(equationCid),
                affectedEquationData,
                $list;
            equationData.setLatex(latex);
            affectedEquationData = this.model.get('_equationDataManager').changeInMathquill(equationData, true);
            $list = this.$('.list[data-equation-cid=' + equationCid + ']');
            if ($list.length !== 0) {
                $list.find('.mathquill-editable').mathquill('latex', latex);
            }
            this._processTableCellsWithDefinitions(affectedEquationData.definitions, true);
            this._processParsedEquationDataArray(affectedEquationData.equations, equationData);
            equationData.setSpecie('slider');
        },
        /**
         * _deleteSliderElements deletes slider elements for which sliders have been added
         * @method _deleteSliderElements
         * @return void
         */
        "_deleteSliderElements": function() {
            var constants = this.model.get('_equationDataManager').getConstants(),
                sliderBoxes = this.$('.slider-div'),
                sliderBoxIndex,
                sliderIndex,
                constant,
                sliders,
                sliderBoxesLength = sliderBoxes.length;
            for (sliderBoxIndex = 0; sliderBoxIndex < sliderBoxesLength; sliderBoxIndex++) {
                sliders = $(sliderBoxes[sliderBoxIndex]).children();
                for (sliderIndex = 0; sliderIndex < sliders.length; sliderIndex++) {
                    constant = sliders.eq(sliderIndex).attr('data-constant');
                    if (typeof constants[constant] !== 'undefined') {
                        sliders.eq(sliderIndex).remove();
                    }
                }
            }
            sliderBoxes = this.$('.slider-div');
            sliderBoxesLength = sliderBoxes.length;
            for (sliderBoxIndex = 0; sliderBoxIndex < sliderBoxesLength; sliderBoxIndex++) {
                sliders = sliderBoxes.eq(sliderBoxIndex).children();
                if (sliders.length === 2 && sliders.eq(1).hasClass('all-slider')) {
                    sliders.eq(1).remove();
                    sliderBoxes.eq(sliderBoxIndex).html('');
                }
                if (sliders.length === 1) {
                    sliderBoxes.eq(sliderBoxIndex).html('');
                }
            }
        },
        /**
         * _updateSliderElements again adds slider elements which have been deleted
         * @method _updateSliderElements
         * @return void
         */
        "_updateSliderElements": function() {
            var listEquationBoxes = this.$('.list'),
                eqautionBoxIndex,
                noOfEquationBoxes = listEquationBoxes.length;
            for (eqautionBoxIndex = 0; eqautionBoxIndex < noOfEquationBoxes; eqautionBoxIndex++) {
                listEquationBoxes.eq(eqautionBoxIndex).find('textarea').trigger('keyup');
            }
        },
        /**
         * sets thickness for eqautionData
         * @method _changeThickness
         * @param event {Object}
         * @return void
         */
        "_changeThickness": function(event) {
            var $list,
                panelView = event.data.self,
                sliderView = event.data.sliderView,
                equationData,
                plotEquation, $tooltip,
                thickness = sliderView.get('currValue'),
                undoData = {},
                redoData = {},
                tableView,
                tableVisible,
                cid = panelView.$('.graphing-tool-editor-color-style-box').attr('data-target-equation-data-cid'),
                prevThickness;

            if (panelView.$('.graphing-tool-editor-color-style-box-table').length === 1) {
                $list = panelView.$('.cell[data-equation-cid=' + cid + ']').parents('.list');
            } else {
                $list = panelView.$('.list[data-equation-cid=' + cid + ']');
            }
            if ($list.attr('data-type') === 'table') {
                tableView = panelView._getTableViewObject($list);
                tableVisible = tableView.getTableVisiblity();
                equationData = panelView._getEquationDataUsingCid(cid);
                undoData.equationData = equationData;
                prevThickness = equationData.getThickness();
                undoData.thickness = prevThickness;
                plotEquation = equationData.getPlot();
                if (thickness !== parseInt(equationData.getThickness(), 10)) {
                    plotEquation.setThickness(thickness, true);
                    equationData.setThickness(thickness, true);
                } else {
                    return void 0;
                }
                if (equationData.getStyleType() === 'points') {
                    plotEquation.setSpecie('point');
                    plotEquation.changeThickness(thickness);
                    redoData.thickness = thickness;
                    redoData.equationData = equationData;
                    panelView.execute('tableThicknessChange', {
                        "undo": undoData,
                        "redo": redoData
                    });
                } else {
                    if (equationData.getStyleType() === 'line') {
                        equationData.setThickness(thickness, true);
                        equationData.changeThickness(thickness);
                        plotEquation.changeThickness(thickness);
                        redoData.thickness = thickness;
                        redoData.equationData = equationData;
                        panelView.execute('tableThicknessChange', {
                            "undo": undoData,
                            "redo": redoData
                        });
                    } else {
                        equationData.changeThickness(thickness);
                        redoData.thickness = thickness;
                        redoData.equationData = equationData;
                        panelView.execute('tableThicknessChange', {
                            "undo": undoData,
                            "redo": redoData
                        });
                        if (tableVisible) {
                            plotEquation.setPointVisibility(true);
                        }
                        plotEquation.changeThickness(thickness);
                        redoData.thickness = thickness;
                    }
                }
                $tooltip = panelView.$('.coordinate-tooltip[data-equation-cid="' + equationData.getPlot().getCid() + '"]');
                if ($tooltip) {
                    $tooltip.show();
                }
            } else {
                equationData = panelView._getMappedEquationData($list);
                undoData.equationData = equationData;
                undoData.thickness = equationData.getThickness();
                if (thickness !== equationData.getThickness()) {
                    equationData.changeThickness(thickness);
                    redoData.thickness = thickness;
                    redoData.equationData = equationData;
                    panelView.execute('graphThicknessChange', {
                        "undo": undoData,
                        "redo": redoData
                    });
                }
            }
            panelView._graphingToolView._gridGraphView.refreshView();
            panelView.accManagerView.changeAccMessage(sliderView.$el.find('.sliderH').attr('id'), 0, [thickness]);
            panelView.accManagerView.setFocus('dummy-focus-container');
            panelView.accManagerView.setFocus(sliderView.$el.find('.sliderH').attr('id'));
        },
        /**
         * // toggles view of plotted equation
         * @method _toggleGraph
         * @param event {Object}
         * @return void
         */
        "_toggleGraph": function(event) {
            var $target = $(event.target),
                tableView,
                $list = $target.parents('.list'),
                criticalPoints,
                graphShown, msg,
                undo = {},
                redo = {},
                equationData,
                $cell;
            equationData = this._getMappedEquationData($list);
            this.$('#input-data').removeClass('input-data-scroll-hidden');
            this.$('#input-data-extension').height(0);
            if ($list.attr('data-type') === 'table') {
                this.$('.graphing-tool-editor-color-style-box-table').hide();
                tableView = this._getTableViewObject($list);
                $cell = $target.parents('.cell');
                $cell.find('textarea').blur();
                if (tableView.model.get('eyeOpen') === true) {
                    tableView.model.set('showTable', false);
                    tableView.model.set('eyeOpen', false);
                    tableView.trigger('table-hidden');
                    this._hideTableGraph($list, tableView);
                    $list.find('.show-hide-equation').addClass('graph-hidden');
                    graphShown = false;
                } else {
                    tableView.model.set('eyeOpen', true);
                    $list.find('.show-hide-equation').removeClass('graph-hidden');
                    graphShown = true;
                    tableView.trigger('table-shown');
                    if (tableView.model.get('lineOptionSelected') === true) {
                        tableView.model.set('showTable', true);
                        this._showTableGraph($list, tableView);
                    }
                }
                undo.targetCid = equationData.getCid();
                redo.targetCid = undo.targetCid;
                this.execute('hideShowTable', {
                    "undo": undo,
                    "redo": redo
                });
            } else {
                if (equationData.getCurveVisibility() === false) {
                    if (equationData.getSpecie() === 'point') {
                        this.checkIfChangeInPoint([], equationData.getPoints());
                    }
                    equationData.showGraph(true);
                    equationData.trigger('plot-equation');
                    this._graphingToolView.$('.coordinate-tooltip[data-equation-cid="' + equationData.getCid() + '"]').show();
                } else {
                    if (equationData.getSpecie() === 'point') {
                        this.checkIfChangeInPoint(equationData.getPoints(), []);
                    }
                    equationData.hideGraph();
                    this._graphingToolView.$('.coordinate-tooltip[data-equation-cid="' + equationData.getCid() + '"]').hide();
                }
                criticalPoints = equationData.getCriticalPoints();
                if (criticalPoints !== null) {
                    if (equationData.getCurveVisibility() && $list.hasClass('list-focus')) {
                        this._showCriticalPoints(equationData);
                        this.$('.coordinate-tooltip[data-equation-cid="' + criticalPoints.getCid() + '"]').show();
                        $list.find('.show-hide-equation').removeClass('graph-hidden');
                        graphShown = true;
                    } else {
                        this._hideCriticalPoints(equationData, true);
                        $list.find('.show-hide-equation').addClass('graph-hidden');
                        graphShown = false;
                        this.$('.coordinate-tooltip[data-equation-cid="' + criticalPoints.getCid() + '"]').hide();
                    }
                }
                this._updateWarning($list, equationData);
                this.execute('hideShowGraph', {
                    "undo": equationData,
                    "redo": equationData
                });
            }
            this._graphingToolView.closeKeyboard();
            this._graphingToolView._updateListBoxHeight(true);
            this._graphingToolView._setActiveElementFocus();
            if (equationData) {
                equationData.trigger('redraw-graph');
            }
            if (this._isListCollapsed($list)) {
                this._resetHeaderMaxWidth();
                this._updateListWidth();
            }
            this.$('#input-data-extension').height(0);
            if (!$list.hasClass('list-focus')) {
                this._hideCriticalPoints(equationData);
            }
            if (this._graphingToolView.isAccDivPresent($list.find('.show-hide-equation-container'))) {
                if (graphShown) {
                    msg = this.accManagerView.getAccMessage('list-equation-panel-messages', 8, [this.accManagerView.getAccMessage('list-equation-panel-messages', 9),
                        this.accManagerView.getAccMessage('list-equation-panel-messages', 11)
                    ]);
                } else {
                    msg = this.accManagerView.getAccMessage('list-equation-panel-messages', 8, [this.accManagerView.getAccMessage('list-equation-panel-messages', 10),
                        this.accManagerView.getAccMessage('list-equation-panel-messages', 12)
                    ]);
                }
                this.accManagerView.setAccMessage('show-hide-equation-container-of-' + $list.attr('id'), msg);
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setFocus('show-hide-equation-container-of-' + $list.attr('id'));
            }
            this._graphingToolView.addAllPaperItems(false);
        },
        /**
         * // toggles view of plotted equation
         * @method _toggleColumnGraph
         * @param event {Object}
         * @param isChecked {Bool} checkbox is checked or not
         * @return void
         */
        "_toggleColumnGraph": function(event, isChecked) {
            var $target = $(event.target),
                tableView,
                cid = this.$('.graphing-tool-editor-color-style-box-table').attr('data-target-equation-data-cid'),
                $list = this.$('.cell[data-equation-cid=' + cid + ']').parents('.list'),
                columnNo, $column, $colHeader,
                equationData,
                undoRedoData = {
                    'undo': {},
                    'redo': {}
                };
            this._hideBestFitDataAnalysisOptions($list);
            tableView = this._getTableViewObject($list);
            columnNo = tableView._getColumnNo(cid);
            $column = tableView.getColumn(columnNo);
            $colHeader = $column.eq(0);
            equationData = this._getEquationDataUsingCid($colHeader.attr('data-equation-cid'));
            this._hideShowColumnGraph(isChecked, tableView, columnNo, equationData);
            if (isChecked) {
                $column.removeClass('plot-column-disabled');
            } else {
                $column.splice(0, 1);
                $column.addClass('plot-column-disabled');
            }
            undoRedoData.undo.isChecked = !isChecked;
            undoRedoData.undo.tableView = tableView;
            undoRedoData.undo.columnNo = columnNo;
            undoRedoData.undo.equationData = equationData;
            undoRedoData.redo.isChecked = isChecked;
            undoRedoData.redo.tableView = tableView;
            undoRedoData.redo.columnNo = columnNo;
            undoRedoData.redo.equationData = equationData;
            this.execute('plotColumnCheckboxClick', undoRedoData);
        },
        "_checkToggleColumnGraph": function(event) {
            var $target = $(event.target),
                $checkBox = $target.find('.graphing-tool-editor-toggle-column-graph-checkbox'),
                messageArray = [];
            if ($checkBox.length === 0) {
                $checkBox = $target.parents().find('.graphing-tool-editor-toggle-column-graph-checkbox');
            }
            if ($checkBox.hasClass('toggle-column-checked')) {
                $checkBox.removeClass('toggle-column-checked');
                this._toggleColumnGraph(event, false);
                messageArray = [this.accManagerView.getAccMessage('unchecked-text', 0),
                    this.accManagerView.getAccMessage('table-equation-panel-messages', 5),
                    this.accManagerView.getAccMessage('show-text', 0)
                ];
            } else {
                $checkBox.addClass('toggle-column-checked');
                this._toggleColumnGraph(event, true);
                messageArray = [this.accManagerView.getAccMessage('checked-text', 0),
                    this.accManagerView.getAccMessage('table-equation-panel-messages', 6),
                    this.accManagerView.getAccMessage('hide-text', 0)
                ];
            }
            this._graphingToolView.addAllPaperItems(false);
            this.accManagerView.setFocus('dummy-focus-container');
            this.accManagerView.changeAccMessage('graphing-tool-editor-style-toggle-column-graph-checkbox-container', 0, messageArray);
            this.accManagerView.setFocus('graphing-tool-editor-style-toggle-column-graph-checkbox-container');

        },
        "_updatePlotColumnOption": function(equationData, column) {
            var doNoPlot = this._getPlotColumn(equationData);
            if (doNoPlot === false) {
                column.splice(0, 1);
                column.addClass('plot-column-disabled');
            } else {
                column.removeClass('plot-column-disabled');
            }
        },
        "_hideShowColumnGraph": function(isChecked, tableView, columnNo, equationData, isUndoRedoAction, isSaveState) {
            var $cell, $list, cid, $checkBox, plotEquationPoints, showBestFit,
                bestFit, styleType, plotEquation, equationDataManager;
            $cell = this.$("[data-equation-cid='" + equationData.getCid() + "']");
            $list = $cell.parents('.list');
            cid = equationData.getCid();
            if (isSaveState) {
                $checkBox = $list.find('.graphing-tool-editor-toggle-column-graph-checkbox');
                $checkBox.toggleClass('toggle-column-checked', isChecked);
            }
            if (isChecked) {
                tableView._removePlotColumnCid(cid);
                if (tableView.model.get('eyeOpen') === true) {
                    bestFit = equationData.getBestFit();
                    showBestFit = bestFit;
                    tableView.trigger('table-plot-column-checked', cid, isUndoRedoAction, showBestFit);
                    if (tableView.model.get('lineOptionSelected') === true) {
                        styleType = equationData.getStyleType();
                        plotEquation = equationData.getPlot();
                        equationDataManager = this.model.get('_equationDataManager');
                        if (showBestFit) {
                            this._showBestFit(bestFit, equationData.getColor());
                            this._hideResidualPlot(cid, tableView, true);
                        }
                        if (styleType === 'line') {
                            equationData.showGraph();
                            if (equationData.getSpecie() === 'polygon') {
                                equationDataManager.drawPolygon(equationData);
                            } else {
                                equationDataManager.parseEquation(equationData);
                            }
                        } else {
                            plotEquation.showGraph();
                            plotEquationPoints = plotEquation.getPoints() || [];
                            this.callCheckIfChangeInPoint(equationData, [], plotEquationPoints);
                            equationDataManager.drawPoint(plotEquation);
                            if (styleType !== 'points') {
                                equationData.showGraph();
                                if (equationData.getSpecie() === 'polygon') {
                                    equationDataManager.drawPolygon(equationData);
                                } else {
                                    equationDataManager.parseEquation(equationData);
                                }
                            }
                        }
                    }
                }
            } else {
                tableView._pushPlotColumnCid(cid);
                tableView.trigger('table-plot-column-unchecked', cid, isUndoRedoAction);
                bestFit = equationData.getBestFit();
                if (bestFit !== null) {
                    this._hideBestFit(bestFit);
                    this._hideResidualPlot(cid, tableView, false);
                }
                equationData.hideGraph();
                plotEquation = equationData.getPlot();
                plotEquationPoints = plotEquation.getPoints() || [];
                this.callCheckIfChangeInPoint(equationData, plotEquationPoints, []);
                plotEquation.hideGraph();
                this.trigger('hide-tooltip', plotEquation.getCid());
                equationData.trigger('redraw-graph');
            }
            if (equationData) {
                equationData.trigger('redraw-graph');
            }
        },
        "_hideShowColumnGraphForEntireTable": function(tableObject, plotColumnHidden, _equationDataManager) {
            var plotColumnHiddenLength = 0,
                tableEquationsData = null,
                cid = null,
                index = null;
            if (plotColumnHidden) {
                plotColumnHiddenLength = plotColumnHidden.length;
            }
            for (index = 0; index < plotColumnHiddenLength; index++) {
                cid = tableObject._getColumnCid(plotColumnHidden[index]);
                tableEquationsData = _equationDataManager.getEquationDataUsingCid(cid);
                this._hideShowColumnGraph(false, tableObject, plotColumnHidden[index], tableEquationsData, true);
                this._updatePlotColumnOption(tableEquationsData, tableObject.getColumn(plotColumnHidden[index]));
            }
        },
        /**
         * _showBestFit shows given bestFit object
         * @method _showBestFit
         * @param bestFit {Object} bestFit object
         * @param color {String} color for bestfit graphs
         * @return void
         */
        "_showBestFit": function(bestFit, color) {
            if (bestFit.line && bestFit.line.selected && bestFit.line.equationData) {
                bestFit.line.equationData.setColor(color);
                bestFit.line.equationData.showGraph();
                bestFit.line.equationData.trigger('change-equation');
            }
            if (bestFit.curve) {
                _.each(bestFit.curve, function(value) {
                    if (value.selected && value.equationData) {
                        value.equationData.setColor(color);
                        value.equationData.showGraph();
                        value.equationData.trigger('change-equation');
                    }
                });
            }
            if (bestFit.exp && bestFit.exp.selected && bestFit.exp.equationData) {
                bestFit.exp.equationData.setColor(color);
                bestFit.exp.equationData.showGraph();
                bestFit.exp.equationData.trigger('change-equation');
            }
            if (bestFit.polynomial && bestFit.polynomial.selected && bestFit.polynomial.equationData) {
                bestFit.polynomial.equationData.setColor(color);
                bestFit.polynomial.equationData.showGraph();
                bestFit.polynomial.equationData.trigger('change-equation');
            }
        },
        /**
         * _hideBestFit hides given bestFit object
         * @method _hideBestFit
         * @param bestFit {Object} bestFit object
         * @return void
         */
        "_hideBestFit": function(bestFit) {
            if (bestFit.line && bestFit.line.selected && bestFit.line.equationData) {
                bestFit.line.equationData.hideGraph();
            }
            if (bestFit.curve) {
                _.each(bestFit.curve, function(value) {
                    if (value.selected && value.equationData) {
                        value.equationData.hideGraph();
                    }
                });
            }
            if (bestFit.exp && bestFit.exp.selected && bestFit.exp.equationData) {
                bestFit.exp.equationData.hideGraph();
            }
            if (bestFit.polynomial && bestFit.polynomial.selected && bestFit.polynomial.equationData) {
                bestFit.polynomial.equationData.hideGraph();
            }
        },

        "_hideResidualPlot": function(cid, tableView, show) {
            var residualColumnStates = tableView.model.get('residualColumnStates');
            if (residualColumnStates && residualColumnStates[cid]) {
                _.each(residualColumnStates[cid], _.bind(function(value, key) {
                    if (key !== "residualColumnCount" && value.selected) {
                        if (show) {
                            this._showResidualPoints(value.residualEquationData);
                            this._showResidualPoints(value.residualColEquationData);
                        } else {
                            this._hideResidualPoints(value.residualEquationData);
                            this._hideResidualPoints(value.residualColEquationData);
                        }
                    }
                }, this));
            }
            this._graphingToolView._gridGraphView.refreshView();
        },
        "_showResidualPoints": function(equationData) {
            var equationPlot = equationData.getPlot(),
                points = equationPlot.getPoints(),
                plotColumn = this._getPlotColumn(equationData);
            equationData.setPointVisibility(true);
            equationPlot.setThickness(equationData.getThickness());
            equationPlot.changeThickness(equationData.getThickness());
            if (plotColumn) {
                equationPlot.showGraph();
                if (points && points.length > 0) {
                    this.checkIfChangeInPoint([], points.slice());
                }
                equationData.showGraph();
            }
        },
        "_hideResidualPoints": function(equationData) {
            var equationPlot = equationData.getPlot(),
                points = equationPlot.getPoints(),
                plotColumn = this._getPlotColumn(equationData);
            if (plotColumn) {
                equationPlot.hideGraph();
                if (points && points.length > 0) {
                    this.checkIfChangeInPoint(points.slice(), []);
                }
                equationData.hideGraph();
            }
        },

        /**
         * _showTableGraph shows given table
         * @method _showTableGraph
         * @param $list {Object} jQuery list object
         * @param tableView {Object} table view object
         * @return void
         */
        "_showTableGraph": function($list, tableView) {
            var loopVar,
                equationData,
                cid,
                bestFit,
                plotEquationPoints,
                styleType,
                plotEquation,
                equationDataManager = this.model.get('_equationDataManager'),
                equationDataArr = this._getTableEquationData(tableView);
            for (loopVar = 0; loopVar < equationDataArr.length; loopVar++) {
                equationData = equationDataArr[loopVar];
                if (this._getPlotColumn(equationData)) {
                    cid = equationData.getPlot().getCid();
                    bestFit = equationData.getBestFit();
                    styleType = equationData.getStyleType();
                    plotEquation = equationData.getPlot();
                    if (bestFit) {
                        this._showBestFit(bestFit, equationData.getColor());
                        this._hideResidualPlot(equationData.cid, tableView, true);
                    }
                    if (styleType === 'line') {
                        equationData.showGraph();
                        if (equationData.getSpecie() === 'polygon') {
                            equationDataManager.drawPolygon(equationData);
                        } else {
                            equationDataManager.parseEquation(equationData);
                        }
                    } else {
                        plotEquation.showGraph();
                        plotEquationPoints = plotEquation.getPoints();
                        if (plotEquationPoints) {
                            this.callCheckIfChangeInPoint(equationData, [], plotEquationPoints);
                            equationDataManager.drawPoint(plotEquation);
                        }
                        if (styleType !== 'points') {
                            equationData.showGraph();
                            if (equationData.getSpecie() === 'polygon') {
                                equationDataManager.drawPolygon(equationData);
                            } else {
                                equationDataManager.parseEquation(equationData);
                            }
                        }
                    }
                    this.trigger('show-tooltip', cid);
                    equationData.trigger('redraw-graph');
                }
            }
        },
        /**
         * _hideTableGraph hides given table
         * @method _hideTableGraph
         * @param $list {Object} jQuery list object
         * @param tableView {Object} table view object
         * @return void
         */
        "_hideTableGraph": function($list, tableView) {
            var loopVar,
                equationData, plotEquation, plotEquationPoints,
                cid,
                plotColumnHidden = tableView.model.get('plotColumnHidden'),
                bestFit,
                equationDataArr = this._getTableEquationData(tableView);
            for (loopVar = 0; loopVar < equationDataArr.length; loopVar++) {
                equationData = equationDataArr[loopVar];
                plotEquation = equationData.getPlot();
                cid = plotEquation.getCid();
                bestFit = equationData.getBestFit();
                if (bestFit !== null) {
                    this._hideBestFit(bestFit);
                    this._hideResidualPlot(equationData.cid, tableView, false);
                }
                plotEquationPoints = plotEquation.getPoints();
                if (plotEquationPoints !== null &&
                    plotEquationPoints !== void 0 &&
                    plotEquationPoints.length !== 0 &&
                    plotColumnHidden.indexOf(equationData.getCid()) === -1) {
                    this.checkIfChangeInPoint(plotEquationPoints.slice(), []);
                }
                plotEquationPoints = plotEquation.getPoints() || [];
                this.callCheckIfChangeInPoint(equationData, plotEquationPoints, []);
                equationData.hideGraph();
                plotEquation.hideGraph();
                this.trigger('hide-tooltip', cid);
                equationData.trigger('redraw-graph');
            }
        },
        /**
         * _togglePointsView toggles points view for given equationData
         * @method _togglePointsView
         * @param equationData {Object} equationData model object
         * @return void
         */
        "_togglePointsView": function(equationData) {
            var pathChildrenLength,
                pathChildrenCounter,
                pointsGroup = equationData.getPointsGroup();
            if (equationData.getPointVisibility()) {
                if (pointsGroup !== null) {
                    pointsGroup.visible = true;
                    pathChildrenLength = pointsGroup.children.length;
                    for (pathChildrenCounter = 0; pathChildrenCounter < pathChildrenLength; pathChildrenCounter++) {
                        pointsGroup.children[pathChildrenCounter].visible = true;
                    }
                }
            } else {
                if (pointsGroup !== null) {
                    pointsGroup.visible = false;
                }
            }
        },
        /**
         * _toggleLineView toggles line view for given equationData
         * @method _toggleLineView
         * @param equationData {Object} equationData model object
         * @return void
         */
        "_toggleLineView": function(equationData) {
            var plot = equationData.getPlot();
            if (equationData.getCurveVisibility()) {
                if (plot !== null) {
                    plot.showGraph();
                }
            } else {
                if (plot !== null) {
                    plot.hideGraph();
                }
            }
        },
        /**
         * _toggleBestFitLine toggles best fit line view for given equationData
         * @method _toggleBestFitLine
         * @param equationData {Object} equationData model object
         * @return void
         */
        "_toggleBestFitLine": function(equationData) {
            var bestFit = equationData.getBestFit();
            if (equationData.getCurveVisibility()) {
                if (bestFit !== null) {
                    if (bestFit.line && bestFit.line.selected) {
                        bestFit.line.equationData.showGraph();
                    }
                    if (equationData.bestfit.curve) {
                        _.each(equationData.bestfit.curve, function(value) {
                            if (value.selected === true) {
                                value.equationData.showGraph();
                            }
                        });
                    }
                    if (equationData.bestfit.exp && equationData.bestfit.exp.selected) {
                        equationData.bestfit.exp.equationData.showGraph();
                    }
                    if (equationData.bestfit.polynomial && equationData.bestfit.polynomial.selected) {
                        equationData.bestfit.polynomial.equationData.showGraph();
                    }
                }
            } else {
                if (bestFit) {
                    if (bestFit.line) {
                        bestFit.line.equationData.hideGraph();
                    }
                    if (equationData.bestfit.curve) {
                        _.each(equationData.bestfit.curve, function(value) {
                            if (value.selected === true) {
                                value.equationData.hideGraph();
                            }
                        });
                    }
                    if (equationData.bestfit.exp) {
                        equationData.bestfit.exp.equationData.hideGraph();
                    }
                    if (equationData.bestfit.polynomial && equationData.bestfit.polynomial.selected) {
                        equationData.bestfit.polynomial.equationData.hideGraph();
                    }
                }
            }
        },
        /**
         * _toggleDashedGraph toggles style of plotted equation
         * @method _toggleDashedGraph
         * @param event {Object}
         * @return void
         */
        "_toggleDashedGraph": function(event) {
            var $target = $(event.target).parents('.plot-colors'),
                equationData = this._getMappedEquationData($target.parents('.list'));
            if (equationData.getPathGroup() === null) {
                return void 0;
            }
            equationData.showGraph();
            equationData.toggleDashedGraph();
            this.execute('toggleDashedGraph', {
                "undo": equationData,
                "redo": equationData
            });
            this._updateWarning($target.parents('.list'), equationData);
            this._graphingToolView._gridGraphView.refreshView();
        },
        // list related
        /**
         * _addList add list item to list box
         * @method _addList
         * @return void
         */
        "_addList": function(event) {
            var undoData,
                $lastFocusedMathQuill = this.model.get('cursorClassTag'),
                $lastFocusedList = this.$('.list.list-focus'),
                $list = this._createListWithEditor(),
                inputColumn = this.$('#input-data'),
                scrollTop,
                redoData;
            this._blurMathquill(this.$('.hasCursor'));
            if ($(event.target).attr('id') === 'add-function' || $(event.target).attr('id') === 'add-function-icon') {
                if ($lastFocusedList.length !== 0) {
                    $list.insertAfter($lastFocusedList);
                } else {
                    this.$('#list-box').prepend($list);
                }
                $list = this._createEquationData($list);
            } else {
                this.$('#list-box').append($list);
                $list = this._createEquationData($list);
                this._graphingToolView._updateListBoxHeight(false);
                this._graphingToolView.openKeyboard();
            }
            scrollTop = inputColumn[0].scrollHeight - inputColumn.outerHeight();
            inputColumn.scrollTop(scrollTop);
            this._blurMathquill($lastFocusedMathQuill);
            // undo redo registration
            undoData = this._getListData($list);
            redoData = this._getListData($list);
            undoData.actionType = 'deleteList';
            undoData.target = $list.prev().attr('data-equation-cid');
            redoData.target = $list.prev().attr('data-equation-cid');
            redoData.index = parseInt($list.prev().find('.handler-number').text(), 10) + 1;
            redoData.actionType = 'addList';
            this.execute('addList', {
                "undo": undoData,
                "redo": redoData
            });
            // updates handles
            this._updateHandles();
            this._createAccDivForList($list, false);
            this.setFocusToTextArea($list);
        },
        /**
         * Delete all graphs and equations from the list box
         * @method _deleteAll
         * @return void
         */
        "_deleteAll": function(event, prevEquationData) {
            var undoData,
                redoData,
                $disabledLists = this.$('.list.disabled'),
                noOfDisabledLists = $disabledLists.length,
                listCounter,
                undoDataForDeleteAll = {},
                $list = this.$('#list-box'),
                $newlist,
                columnData = {},
                self = this,
                tableView,
                tableEquationsData,
                tableState,
                _equationDataManager = this.model.get('_equationDataManager'),
                index;
            undoDataForDeleteAll.undo = [];
            undoDataForDeleteAll.redo = [];
            columnData.bestFitInfo = [];
            for (listCounter = 0; listCounter < noOfDisabledLists; listCounter++) {
                columnData.bestFitInfo.push(this._getBestFitMapping($disabledLists.eq(listCounter)));
            }
            $list.find('.list:not(.disabled)').each(function() {
                var $currentThis = $(this);
                if ($currentThis.attr('data-type') === 'table') {
                    undoData = {};
                    redoData = {};
                    tableView = self._getTableViewObject($currentThis);
                    self._updateColumnCount(tableView, false);
                    undoData.chartBestFit = tableView.model.get('chartBestFit');
                    tableEquationsData = self._getTableEquationData(tableView);
                    tableState = self._getTableContent($currentThis, tableView);
                    undoData.tableState = tableState;
                    undoData.equationData = tableEquationsData;
                    redoData.tableState = tableState;
                    undoData.residualColumnStates = tableView.model.get('residualColumnStates');
                    redoData.residualColumnStates = undoData.residualColumnStates;
                    undoData.residualColumnDependency = tableView.model.get('residualColumnDependency');
                    redoData.residualColumnDependency = undoData.residualColumnDependency;
                    redoData.equationData = undoData.equationData;
                    undoData.chartData = self._chartManagerView.getSelectedChartsFromTable(tableView, true, true);
                    redoData.chartData = undoData.chartData;
                    undoData.isLineChartSelected = tableView.model.get('lineOptionSelected');
                    redoData.isLineChartSelected = tableView.model.get('lineOptionSelected');
                    undoData.actionType = 'addTable';
                    index = parseInt($currentThis.find('.handler-number').text(), 10);
                    redoData.index = index;
                    undoData.index = index;
                    redoData.actionType = 'deleteTable';
                    undoDataForDeleteAll.undo.push(undoData);
                    undoDataForDeleteAll.redo.push(redoData);
                    tableView.trigger('delete-table');
                    self._removeTableEquationDataPoints(tableEquationsData);
                    self._clearTableStylesOnDelete(tableView, true);
                } else {
                    undoData = self._getListData($currentThis);
                    redoData = self._getListData($currentThis);
                    undoData.actionType = 'addList';
                    undoData.target = redoData.target = $currentThis.prev().attr('data-equation-cid');
                    index = parseInt($currentThis.find('.handler-number').text(), 10);
                    redoData.index = index;
                    undoData.index = index;
                    redoData.actionType = 'deleteList';
                    undoDataForDeleteAll.undo.push(undoData);
                    undoDataForDeleteAll.redo.push(redoData);
                    if ($currentThis.attr('data-has-slider')) {
                        undoData.sliderData = self._getSliderLimits($currentThis);
                        redoData.sliderData = self._getSliderLimits($currentThis);
                        self._sliderPanel.removeSlider({
                            "sliderName": $currentThis.attr('data-constant'),
                            "doNotDeleteList": true
                        });
                    }
                }
            });
            this.model.set('tableViews', []);
            $list.find('.list').remove();
            _equationDataManager.deleteAllEquationData();
            this.removeAllPointIndicators();
            $newlist = this._createListWithEditor();
            $list.append($newlist);
            if (typeof prevEquationData === 'undefined') {
                this._createEquationData($newlist);
            } else {
                $newlist.attr('data-equation-cid', prevEquationData.getCid());
                _equationDataManager.addEquation(prevEquationData);
            }
            this._createAccDivForList($newlist, false);
            undoData.bestFitInfo = columnData.bestFitInfo;
            redoData.bestFitInfo = columnData.bestFitInfo;
            undoDataForDeleteAll.redo[0].equationData = this._getMappedEquationData($newlist);
            undoDataForDeleteAll.redo[0].equationCid = undoDataForDeleteAll.redo[0].equationData.getCid();
            this._updateHandles();
            return undoDataForDeleteAll;
        },
        /**
         * _deleteList deletes target list item from the list box
         * @method _deleteList
         * @param event {Object} event object
         * @return void
         */
        "_deleteList": function(event, options) {
            var self = this,
                $list,
                undoData = {},
                redoData = {},
                undoRedoData = {},
                equationData,
                hasSlider, chartData,
                isFirst,
                tableState,
                tableView,
                residualData = {},
                tableEquationsData,
                DEFAULT_EQUATION_THICKNESS = 3,
                DEFAULT_POINT_THICKNESS = 2.5,
                $focusList,
                index,
                counter, currentEquation,
                allCriticalPointsEquations = [],
                length,
                isToggleList = true;
            if (typeof event !== 'object') {
                $list = this.$('.list[data-equation-cid=' + event + ']');
                if ($list.length === 0) {
                    return void 0;
                }
            } else {
                $list = $(event.target).parents('.list');
                this.$('#input-data').removeClass('input-data-scroll-hidden');
                this.$('#input-data-extension').height(0);
            }
            if ($list.hasClass('disabled')) {
                this._removeBestFitEquationData($list, residualData);
            }
            this._sliderPanel.hideCurrentSliders();
            hasSlider = $list.attr('data-has-slider');
            this._graphingToolView._updateListBoxHeight(true);
            // undo redo data
            undoData = this._getListData($list);
            redoData = this._getListData($list);
            undoData.residualData = residualData;
            redoData.residualData = residualData;
            undoData.actionType = 'addList';
            if (typeof undoData.prevTarget === 'undefined') {
                undoData.actionType = 'addListBefore';
            }
            redoData.actionType = 'deleteList';

            if ($list.next().length !== 0) {
                this.accManagerView.setFocus($list.next().first().attr('id'));
            } else {
                if ($list.prev().length !== 0) {
                    this.accManagerView.setFocus($list.prev().first().attr('id'));
                }
            }
            // if list has slider constant
            if ($list.siblings(':not(.disabled)').length !== 0) {
                if ($list.attr('data-type') === 'table') {
                    tableView = this._getTableViewObject($list);
                    tableEquationsData = this._getTableEquationData(tableView);
                    tableState = this._getTableContent($list, tableView);
                    chartData = this._chartManagerView.getSelectedChartsFromTable(tableView, true, true);
                    this._updateColumnCount(tableView, false);
                    undoData.tableState = tableState;
                    undoData.equationData = tableEquationsData;
                    redoData.tableState = tableState;
                    redoData.equationData = undoData.equationData;
                    undoData.chartData = chartData;
                    redoData.chartData = chartData;
                    undoData.actionType = 'addTable';
                    redoData.actionType = 'deleteTable';
                    undoData.residualColumnStates = tableView.model.get('residualColumnStates');
                    redoData.residualColumnStates = undoData.residualColumnStates;
                    undoData.residualColumnDependency = tableView.model.get('residualColumnDependency');
                    redoData.residualColumnDependency = undoData.residualColumnDependency;
                    tableView.trigger('delete-table');
                    undoData.target = $list.next().attr('data-equation-cid');
                    //*get index of list*/
                    if ($list.prev().length === 0) {
                        undoData.index = 1;
                        redoData.index = 1;
                    } else {
                        index = parseInt($list.prev().find('.handler-number').text(), 10) + 1;
                        undoData.index = index;
                        redoData.index = index;
                    }
                    redoData.target = $list.prev().attr('data-equation-cid');
                    undoData.tableList = $list.attr('data-equation-cid');
                    undoData.removeFirstList = false;
                    this.execute('tableDeleteList', {
                        "undo": undoData,
                        "redo": redoData
                    });
                    this._removeTableEquationDataPoints(tableEquationsData);
                    this._clearTableStylesOnDelete(tableView, true);
                    this._deleteTableEquations(tableView);
                    $list.remove();
                    this._graphingToolView._setActiveElementFocus();
                } else {
                    if (options && options.fromSliderPanel) {
                        undoData.sliderData = options.undoRedoData.undo;
                        redoData.sliderData = options.undoRedoData.redo;
                    }
                    this.execute('deleteList', {
                        "undo": undoData,
                        "redo": redoData
                    });
                    equationData = this._getMappedEquationData($list);
                    if (typeof equationData !== 'undefined' && equationData.getSpecie() === 'slider') {
                        this._sliderPanel.removeSlider({
                            "sliderName": equationData.getDefinitionName(),
                            "doNotDeleteList": true
                        });
                    }
                    $list.fadeOut(100, function() {
                        $(this).remove();
                        self._removeEquationData($list);
                        self._updateHandles();
                    });
                }
            } else {
                undoRedoData = {};
                undoRedoData.undo = this._getListData($list);
                if ($list.attr('data-type') === 'table') {
                    tableView = this._getTableViewObject($list);
                    tableEquationsData = this._getTableEquationData(tableView);
                    tableState = this._getTableContent($list, tableView);
                    chartData = this._chartManagerView.getSelectedChartsFromTable(tableView, true, true);
                    this._updateColumnCount(tableView, false);
                    undoData.chartData = chartData;
                    redoData.chartData = chartData;
                    tableView.trigger('delete-table');
                    undoData.residualColumnStates = tableView.model.get('residualColumnStates');
                    redoData.residualColumnStates = undoData.residualColumnStates;
                    undoData.residualColumnDependency = tableView.model.get('residualColumnDependency');
                    redoData.residualColumnDependency = undoData.residualColumnDependency;
                    undoData.tableState = tableState;
                    undoData.equationData = tableEquationsData;
                    redoData.tableState = tableState;
                    redoData.equationData = undoData.equationData;
                    undoData.actionType = 'addTable';
                    //get index of list
                    undoData.index = 1;
                    redoData.actionType = 'deleteTable';
                    undoData.removeFirstList = true;
                    undoData.target = $list.prev().attr('data-equation-cid');
                    undoData.tableList = $list.attr('data-equation-cid');
                    this.execute('tableDelete', {
                        "undo": undoData,
                        "redo": redoData
                    });
                    this._removeTableEquationDataPoints(undoData.equationData);
                    this._clearTableStylesOnDelete(tableView, true);
                    this._deleteTableEquations(tableView);
                    $list.remove();
                    $list = this._createListWithEditor();
                    this._createEquationData($list);
                    this.$('#list-box').append($list);
                    this._createAccDivForList($list, false);
                    undoData.newEquationData = this._getMappedEquationData($list);
                    redoData.newEquationData = undoData.newEquationData;
                    this._deleteTableEquations(tableView);
                } else {
                    equationData = this._getMappedEquationData($list);
                    if (equationData.getLatex() === '') {
                        isToggleList = false;
                    }
                    $list.find('.mathquill-editable').mathquill('latex', '');
                    if (hasSlider) {
                        $list.removeAttr('data-has-slider');
                    }
                    if (this._isListCollapsed($list)) {
                        $list.find('.list-header-description').removeClass('visible');
                    }
                    undoRedoData.undo.visibility = equationData.getCurveVisibility();
                    undoRedoData.undo.thickness = equationData.getThickness();
                    undoRedoData.undo.dashArray = equationData.getDashArray();
                    equationData.setCurveVisibility(true);
                    equationData.setThickness(DEFAULT_EQUATION_THICKNESS, true);
                    if (equationData.getSpecie() === 'slider') {
                        this._sliderPanel.removeSlider({
                            "sliderName": equationData.getDefinitionName(),
                            "doNotDeleteList": true
                        });
                    }
                    allCriticalPointsEquations = [equationData.getCriticalPoints(),
                        equationData.getInterceptPoints(),
                        equationData.getDiscontinuousPoints(),
                        equationData.getHollowPoints()
                    ];
                    length = allCriticalPointsEquations.length;
                    for (counter = 0; counter < length; counter++) {
                        currentEquation = allCriticalPointsEquations[counter];
                        if (currentEquation !== null && currentEquation.getPointsGroup() !== null) {
                            undoRedoData.undo.pointThickness = currentEquation.getThickness();
                            currentEquation.setThickness(DEFAULT_POINT_THICKNESS, true);
                        }
                    }

                    equationData.setDashArray([]);
                    equationData.setVisible(true);
                    this._parseAndPlotEquationData(equationData, $list);
                    $list.find('textarea').blur();
                    this._blurListBox(equationData, $list);
                    undoRedoData.redo = this._getListData($list);
                    isFirst = true;
                    this.execute('firstListDelete', undoRedoData);
                }
                if (!$list.find('.list-data-container').hasClass('visible') && isToggleList) {
                    $list.find('.list-header-description').mathquill('editable').mathquill('revert').mathquill().mathquill('latex', '');
                }
            }
            $focusList = this.$('.list-focus');
            if ($focusList.attr('data-equation-cid') !== $list.attr('data-equation-cid') &&
                $focusList.length !== 0 && $focusList.attr('data-type') !== 'table') {
                this._sliderPanel.focusSliders(
                    this._getEquationDataUsingCid($focusList.attr('data-equation-cid')).getAllConstants(),
                    $focusList.find('.list-handle').attr('data-handle-number'));
            }
            this._graphingToolView.closeKeyboard();
            this._graphingToolView._updateListBoxHeight(true);
            _.delay(_.bind(function() {
                $('.tooltips').hide();
                this._updateHandles();
                this._graphingToolView.addAllPaperItems(false);
            }, this), 210); // to update items after fadeout
            if (isFirst) {
                return isFirst;
            }
            this.$('#input-data-extension').height(0);
        },
        /**
         * _createList creates a list item without equation editor
         * @method _createList
         * @return {Object} jQuery object containing div
         */
        // appends Handle, EquationBox, DeleteList, ListAnswer, ColorBox
        "_createList": function() {
            var listCounter = this.model.get('listCounter') + 1,
                accData,
                $list,
                $listHandlerWarning,
                $thicknessSliderContainer,
                thicknessSliderView,
                thicknessSliderOptions,
                $curveGraph,
                BASEPATH = MathUtilities.Tools.Graphing.Models.GraphingToolModel.BASEPATH,
                warningHandle = MathUtilities.Tools.Graphing.templates['graph-icon']({
                    "type": "graph",
                    "tableCell": false,
                    "dataEquationCid": 'list-' + listCounter
                }).trim(),
                listItem = MathUtilities.Tools.Graphing.templates['list-item']({
                    "dataEquationCid": 'list-' + listCounter
                }).trim(),
                colorBox = MathUtilities.Tools.Graphing.templates['graph-styles']({
                    "type": "equation",
                    "style-1": "normal-curve",
                    "style-2": "dashed-curve",
                    "style-3": "no-style"
                }).trim(),
                object = {
                    "id": "list-" + listCounter,
                    "name": "list-" + listCounter,
                    "elements": []
                };
            $list = $(listItem);
            thicknessSliderOptions = {
                "min": 2,
                "max": 7,
                "val": 3,
                "step": 1,
                "currValueHide": true,
                "addClass": 'graphing-tool-sprite-holder',
                "sliderBackground": {
                    "isSliderContainerImageSlice": true,
                    "sliderContainerLeftImage": BASEPATH + 'img/tools/common/tools/graphing-plotting/left-slider-base.png',
                    "sliderContainerRightImage": BASEPATH + 'img/tools/common/tools/graphing-plotting/right-slider-base.png',
                    "sliderContainerMiddleImage": BASEPATH + 'img/tools/common/tools/graphing-plotting/middle-slider-base.png',
                    "sliderHeaderImage": BASEPATH + 'img/tools/common/tools/graphing-plotting/slider-handle-up-icon.png',
                    "sliderHeaderImageOnMouseOver": BASEPATH + 'img/tools/common/tools/graphing-plotting/slider-handle-hover-icon.png'
                }
            };
            if (this.addSliderBackground === false) {
                thicknessSliderOptions.sliderBackground = void 0;
            }
            $list.find('.graph-warning-wrapper').append(warningHandle);
            $listHandlerWarning = $list.find('.handler-warning');
            $.fn.EnableTouch($list.find('.list-handle'));
            if (this.$('.graphing-tool-editor-color-style-box').length === 0) {
                this.$('.input-data').append(colorBox);
                $thicknessSliderContainer = this.$('.graphing-tool-editor-graph-thickness-value-container');
                thicknessSliderView = new MathUtilities.Components.Slider.Views.slider({
                    "option": thicknessSliderOptions,
                    "el": $thicknessSliderContainer
                });
                $thicknessSliderContainer.attr('data-slider-view-cid', thicknessSliderView.cid);
                $thicknessSliderContainer.on('change', {
                    "$list": $list,
                    "self": this,
                    "sliderView": thicknessSliderView
                }, this._changeThickness);
                $thicknessSliderContainer.find('.sliderH').attr('id', 'graphing-tool-editor-graph-style-thickness-handle');
                this.$('.residual-label.line').text(this.accManagerView.getMessage('best-fit-line-label', 0));
                this.$('.residual-label.polynomial').text(this.accManagerView.getMessage('best-fit-polynomial-label', 0));
                this.$('.residual-label.exponential').text(this.accManagerView.getMessage('best-fit-exp-label', 0));
                this.accManagerView.loadScreen('style-elements-screen-static');
                this.$('.graphing-tool-editor-best-fit-style-container').off('click')
                    .on('click', _.bind(this._drawBestFitLine, this));
                this.$('.graphing-tool-editor-residual-style-container').off('click')
                    .on('click', _.bind(this._addResidualColumn, this));
                $curveGraph = this.$('.graphing-tool-editor-styles-container .graphing-tool-editor-graph-styles');

                $listHandlerWarning.on('mouseenter mousedown', _.bind(this._showGraphErrorToolTip, this))
                    .on('mouseleave mouseup', _.bind(this._hideGraphErrorToolTip, this));

                $curveGraph = $list.find('.graphing-tool-editor-styles-container .graphing-tool-editor-graph-styles');
                $list.find('.graphing-tool-editor-best-fit-style-container').off('click')
                    .on('click', _.bind(this._drawBestFitLine, this));
                $list.find('.graphing-tool-editor-residual-style-container').off('click')
                    .on('click', _.bind(this._addResidualColumn, this));
                $curveGraph.on('touchstart', function() {
                    $(this).addClass('hovered').children().addClass('hovered');
                }).on('touchend', function() {
                    $(this).removeClass('hovered').children().removeClass('hovered');
                });
                if ('ontouchstart' in window) {
                    $curveGraph.on('touchstart',
                        function() {
                            $(this).addClass('hovered')
                                .children().addClass('hovered');
                        });

                    $curveGraph.on('touchend',
                        function() {
                            $(this).removeClass('hovered')
                                .children().removeClass('hovered');
                        });
                } else {
                    $curveGraph.on('mouseenter',
                        function() {
                            $(this).addClass('hovered')
                                .children().addClass('hovered');
                        });

                    $curveGraph.on('mouseleave',
                        function() {
                            $(this).removeClass('hovered')
                                .children().removeClass('hovered');
                        });
                }
            }
            this.model.get('thicknessSliderCollections').push(thicknessSliderView);

            $listHandlerWarning.on('mouseenter mousedown', _.bind(this._showGraphErrorToolTip, this))
                .on('mouseleave mouseup', _.bind(this._hideGraphErrorToolTip, this));
            $list.find('.list-toggle-button-container').on('click', _.bind(this._toggleListDescription, this));
            $list.find('.list-header-description').on('click', _.bind(this._toggleListDescription, this));
            $list.find('.list-handle').addClass('list-sortable');
            this.model.set('listCounter', listCounter);
            accData = [];
            accData.push(object);
            this.accManagerView.model.parse(accData);

            var tooltipView = null,
                options = null,
                elements = null,
                elemId = null,
                listNumber = this.$('#add-to-list').find('.list-handle').attr('data-handle-number');

            listNumber = listNumber ? Number(listNumber) : 0;

            elements = {
                'delete-list': {
                    'id': 'delete-list',
                    'text': this.accManagerView.getMessage('dummy-button-text', 46),
                    '$toolTipParent': $list.find('.delete-list-container'),
                    'topPadding': 0,
                    'position': 'bottom'
                },
                'show-hide': {
                    'id': 'show-hide-equation',
                    'text': this.accManagerView.getMessage('dummy-button-text', 43),
                    'alternateText': this.accManagerView.getMessage('dummy-button-text', 1),
                    'classIdentifier': 'graph-hidden',
                    '$toolTipParent': $list.find('.show-hide-equation-container'),
                    'topPadding': 10,
                    'position': 'bottom'
                },
                'style': {
                    'id': 'graph-style-edit-options-container',
                    'text': this.accManagerView.getMessage('dummy-button-text', 0),
                    '$toolTipParent': $list.find('.graph-style-edit-options-container'),
                    'topPadding': 0,
                    'position': 'bottom'
                },
                'collapse': {
                    'id': 'list-toggle-button-container',
                    'text': this.accManagerView.getMessage('dummy-button-text', 28),
                    'alternateText': this.accManagerView.getMessage('dummy-button-text', 44),
                    'classIdentifier': 'collapse',
                    '$toolTipParent': $list.find('.list-toggle-button-container'),
                    'topPadding': 0,
                    'position': 'bottom-center-right'
                }
            };


            for (elemId in elements) {
                options = {
                    'id': elements[elemId].id + '-tooltip-' + listNumber,
                    'text': elements[elemId].text,
                    '$toolTipParent': elements[elemId].$toolTipParent,
                    'topPadding': elements[elemId].topPadding,
                    'tool-holder': this._graphingToolView.$el,
                    'position': elements[elemId].position,
                    'alternateText': elements[elemId].alternateText,
                    'classIdentifier': elements[elemId].classIdentifier
                };
                tooltipView = MathUtilities.Components.CustomTooltip.generateTooltip(options);

            }
            return $list;
        },
        "_toggleListDescription": function(event) {
            var $list = $(event.target).parents('.list'),
                dummyEvent;
            if (typeof $list !== 'undefined') {
                this._toggleList($list);
            }
            if ($(event.target).hasClass('list-header-description')) {
                dummyEvent = $.Event("keydown"); // trigger keydown event
                dummyEvent.keyCode = 32; //space key
                $list.find('.list-data-container').trigger(dummyEvent);
                if ($list.attr('data-type') === "table") {
                    $list.find("#2-1-of-" + $list.attr('data-table-view-cid') + " textarea").focus();
                } else {
                    $list.find('textarea').focus();
                }
            }
        },
        "_toggleList": function($list, $exceptList) {
            var datatype = $list.attr('data-type'),
                $listData = $list.find('.list-data-container'),
                $listHeaderDesc = $list.find('.list-header-description'),
                $listHeaderContainer = $list.find('.list-header-container'),
                cid, tempEquationData, latex, listWidth,
                $toggleButton = $list.find('.list-toggle-button'),
                tableView, msg, collapsedEqnMsg,
                tableName = 'Table  ',
                model = this.model,
                cursorClassTag = model.get('cursorClassTag'),
                disabled = $list.hasClass('disabled');
            cid = $list.attr('data-equation-cid');
            tempEquationData = this._getEquationDataUsingCid(cid);
            if ($listData.hasClass('visible')) {
                // Collapsed
                msg = this.accManagerView.getAccMessage('list-equation-panel-messages', 1, [this.accManagerView.getAccMessage('list-equation-panel-messages', 4),
                    this.accManagerView.getAccMessage('list-equation-panel-messages', 6)
                ]);
                this._blurListBox(tempEquationData, $list);
                this._graphingToolView.closeKeyboard();
                this._changePlotLatex($list);
                $listHeaderContainer.removeClass("expanded").addClass("collapse");
                $listData.removeClass('visible');
                if (disabled) {
                    $listHeaderDesc.addClass('visible');
                } else {
                    if (datatype === 'equation') {
                        latex = tempEquationData.getLatex();
                        collapsedEqnMsg = tempEquationData.getAccText();
                    } else if (datatype === 'table') {
                        tableView = this._getTableViewObject($list);
                        tableName += tableView.tableCounter;
                        tableName = '\\text{' + tableName + '}';
                        $listHeaderDesc.addClass('table-text');
                        latex = tableName;
                        collapsedEqnMsg = tableView.model.get('tableName');
                    }
                    latex = this._revertProcessLatex(latex);
                    //this.accManagerView.setAccMessage($listHeaderDesc.attr('id'), collapsedEqnMsg);
                    if (latex && latex.length > 0) {
                        $listHeaderDesc.addClass('visible');
                        $listHeaderDesc.mathquill('editable').mathquill('revert').mathquill().mathquill('latex', latex)
                            .off('mousedown');
                    }
                }
                $toggleButton.removeClass('expanded').addClass('collapse');
                this._resetHeaderMaxWidth();
                if ($exceptList) {
                    this._updateListWidth($exceptList.find('.equation-box').outerWidth(), $exceptList.attr('data-equation-cid'));
                } else {
                    this._updateListWidth();
                }
                model.set('cursorClassTag', this.$('.outerDiv .mathquill-editable.hasCursor'));
            } else {
                // Expanded
                msg = this.accManagerView.getAccMessage('list-equation-panel-messages', 1, [this.accManagerView.getAccMessage('list-equation-panel-messages', 3),
                    this.accManagerView.getAccMessage('list-equation-panel-messages', 5)
                ]);
                $listHeaderContainer.removeClass("collapse").addClass("expanded");
                $listData.addClass('visible');
                $listHeaderDesc.removeClass('visible');
                $toggleButton.addClass('expanded').removeClass('collapse');
                // Give focus to text area when expand
                if (disabled) {
                    this._updateListWidth($list.find('.equation-box').outerWidth());
                    this._sliderPanel.hideKeyboard();
                } else {
                    if (cursorClassTag.length === 1) {
                        cursorClassTag.find('textarea').focus();
                    } else {
                        $list.find('textarea:last').focus();
                        model.set('cursorClassTag', this.$('.outerDiv .mathquill-editable.hasCursor'));
                    }
                    this._focusListBox(tempEquationData, $list);
                }
                listWidth = $list.find("[data-row-id=row1]").width();
                if (listWidth !== 0) {
                    $list.find('.table-button-container').width(listWidth);
                }
                this._updateListWidth($list.find('.equation-box').outerWidth());
            }
            if (this._graphingToolView.isAccDivPresent($list.find('.list-toggle-button-container'))) {
                this.accManagerView.unloadScreen($list.attr('id'));
                this.accManagerView.loadScreen($list.attr('id'));
                this.accManagerView.setAccMessage($list.find('.list-toggle-button-container').attr('id'), msg);
                if (collapsedEqnMsg) {
                    this.accManagerView.setAccMessage($listHeaderDesc.attr('id'), collapsedEqnMsg);
                }
                this.accManagerView.setFocus($list.find('.list-toggle-button-container').attr('id'));
            }
            this.accManagerView.updateFocusRect($list.attr('id'));
            this._setAccTextForListOnFocusOut({
                "currentTarget": $list
            });
            this.$('#input-data-extension').height(0);
        },
        "_isListCollapsed": function($list) {
            return $list.find('.list-header-container').hasClass('collapse');
        },
        "_createTooltipView": function($playerContainer) {
            this._tooltipView = MathUtilities.Components.MathJaxTooltip.Views.MathJaxTooltip.createTooltip({
                "appendTo": $playerContainer,
                "playerContainer": $playerContainer,
                "baseClass": 'base-class',
                "idPrefix": 'base-id',
                "hideArrow": true
            });

        },


        "_detachHoverEffect": function($list) {
            if (MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) {
                $list.find('.list-header-description').off('touchstart touchend');
            } else {
                $list.find('.list-header-description').unbind('mouseenter mouseleave');
            }
        },
        "_displayTooltipOverList": function(event) {
            var $list = $(event.target).parents('.list'),
                latex;
            if (!$list.hasClass('sortable-start')) {
                latex = $list.find('.list-header-description').mathquill('latex');
                if (latex) {
                    latex = this._revertProcessLatex(latex);
                    latex = latex.replace(/#/g, '\\#');
                    latex = latex.replace(/~/g, '\\sim '); // replace characters with their respective latexes
                    this._showTooltip({
                        "element": $list.find('.list-header-description'),
                        "latex": latex,
                        "arrowPosition": 'top',
                        "isLatex": true
                    });
                }
            }
        },
        "_showTooltip": function(elementProperties) {
            if (this._tooltipView) {
                this._tooltipView.showTooltip(elementProperties.element, elementProperties.latex, elementProperties.arrowPosition, elementProperties.isLatex);
            }
        },
        "_hideTooltip": function(event) {
            if (this._tooltipView) {
                this._tooltipView.hideTooltip();
            }
        },
        "_createSliderText": function(sliders) {
            var sliderCounter,
                currentSlider,
                sliderText = '',
                noOfSlider = sliders.length;
            for (sliderCounter = 0; sliderCounter < noOfSlider; sliderCounter++) {
                currentSlider = sliders[sliderCounter];
                currentSlider = this._processSliderLatex(currentSlider);
                if (sliderCounter + 1 === noOfSlider) {
                    sliderText += currentSlider;
                } else {
                    sliderText += currentSlider + ', ';
                }
            }
            return sliderText;
        },
        /**
         * _createSliderElements creates slider element divs with the given constants
         * @method _createSliderElements
         * @param sliders {Array} array of constants
         * @return {Object} jQuery object containing sliders
         */
        "_createSliderElements": function(sliders, $list) {
            var sliderBox,
                allSlider,
                sliderIndex,
                slidersText = sliders.slice(),
                sliderElement, MAX_SLIDERS = 2,
                slidersLength,
                preString,
                slides = [];
            preString = this.accManagerView.getMessage('dummy-slider-error-message', 0);
            if (sliders.length === 1) {
                preString = preString + this.accManagerView.getMessage('dummy-slider-error-message', 1);
            } else {
                preString = preString + this.accManagerView.getMessage('dummy-slider-error-message', 2);
            }
            slidersText = this._createSliderText(slidersText);
            sliderBox = $(MathUtilities.Tools.Graphing.templates['slider-elements']({
                "sliderName": this.accManagerView.getMessage('go-btn-text', 0),
                "cid": $list.attr('id')
            }).trim());
            allSlider = sliderBox.find('.slider');
            sliderBox.find('.slider-text').html(preString + slidersText);
            allSlider.addClass('all-slider').hover(function() {
                $(this).find('div').addClass('hovered');
            }, function() {
                $(this).find('div').removeClass('hovered');
            }).on('mousedown', function() {
                $(this).find('div').addClass('activated');
            });
            slidersLength = slides.length;
            for (sliderIndex = 0; sliderIndex < slidersLength; sliderIndex++) {
                sliderElement = slides[sliderIndex];
                if (sliderIndex > MAX_SLIDERS) {
                    $(sliderElement).hide();
                }
            }
            sliderBox.find('.slider').hover(function() {
                $(this).find('div').addClass('hovered');
            }, function() {
                $(this).find('div').removeClass('hovered');
            }).on('mousedown', function() {
                $(this).find('div').addClass('activated');
            }).on('mouseleave', function() {
                $(this).find('div').removeClass('activated');
            });
            allSlider.attr('data-slider-constants', sliders);
            return sliderBox;
        },
        /**
         * _processSliderLatex process latex for display
         * @method _processSliderLatex
         * @param latex {String} latex to be processed
         * @return {String} processed latex
         */
        "_processSliderLatex": function(latex) {
            var indexOfUnderscore = latex.indexOf('_');
            if (indexOfUnderscore !== -1) {
                latex = latex.replace('_', '<sub>');
                latex += '</sub>';
                latex = latex.replace('}', '');
                latex = latex.replace('{', '');
            }
            latex = latex.replace('\\theta', '<span class="theta-value">&theta;</span>').replace('\\pi', '&pi;');
            return latex;
        },
        /**
         * _adjustListPoistion adjusts list position
         * @method _adjustListPoistion
         * @param $list {Object} jQuery object of list to be adjusted
         * @param targetTop {Number} top position of the list
         * @return void
         */
        "_adjustListPoistion": function($list, targetTop) {
            var titleTop,
                titleHeight,
                listTop,
                currentScroll,
                scrollBy,
                $titleBox = this.$('#input-column-options'),
                $inputData = this.$('#input-data');
            if (targetTop > 270) { // keyboard height
                currentScroll = $inputData.scrollTop();
                titleTop = $titleBox.offset().top;
                titleHeight = $titleBox.height();
                listTop = $list.offset().top;
                scrollBy = Math.abs(titleTop + titleHeight - listTop);
                this.$('#input-data-extension').height($('#input-column').height());
                $inputData.scrollTop(currentScroll + scrollBy);
            }
        },
        /**
         * shows options for changing color and style of equationData
         * @method _showGraphStyleColorOptions
         * @param event {Object}
         * @return void
         */
        "_showGraphStyleColorOptions": function(event) {
            var $target = $(event.target),
                $list = $target.parents('.list'),
                equationData = this._getMappedEquationData($list),
                targetPosition,
                colorStyleOptions = this.$('.graphing-tool-editor-color-style-box-equation'),
                graphColor,
                LIST_HEADER_HEIGHT = 26;
            if (colorStyleOptions.length === 0) {
                colorStyleOptions = this.$('.graphing-tool-editor-color-style-box-table');
                colorStyleOptions.find('.first-row-style, .residual-col-style').show();
                colorStyleOptions.addClass('graphing-tool-editor-color-style-box-equation')
                    .removeClass('graphing-tool-editor-color-style-box-table');
                colorStyleOptions.find('.graphing-tool-editor-style-box-seperater').addClass('no-style');
                this.$('.graphing-tool-editor-best-fit-styles, .graphing-tool-editor-data-analysis-options,.graphing-tool-editor-hide-column-container,.graphing-tool-editor-residuals-options,.graphing-tool-editor-toggle-column-graph-checkbox-container').addClass('no-style');
                this.$('.no-style').hide();
            }
            if (!$list.find('.change-graph-style').is(':visible')) {
                this._sliderPanel.hideKeyboard();
                return void 0;
            }
            this._graphingToolView._updateListBoxHeight(true);
            colorStyleOptions.find('.activated').removeClass('activated');
            if (!$target.hasClass('graph-style-edit-options')) {
                $target = $target.parents('.graph-style-edit-options');
            }
            colorStyleOptions.toggleClass('inequality-options', equationData.getInEqualityType() !== 'equal');
            if ($target.hasClass('no-graph')) {
                return void 0;
            }
            colorStyleOptions.attr('data-target-equation-data-cid', $list.attr('data-equation-cid'));
            this.accManagerView.unloadScreen('style-elements-screen');
            this.accManagerView.loadScreen('style-elements-screen');
            if (colorStyleOptions.is(':visible')) {
                this.$('#input-data-extension').height(0);
                this.$('#input-data').removeClass('input-data-scroll-hidden');
                colorStyleOptions.hide();
            } else {
                this.accManagerView.changeAccMessage('purple-color', 0, ['']);
                this.accManagerView.changeAccMessage('blue-color', 0, ['']);
                this.accManagerView.changeAccMessage('orange-color', 0, ['']);
                this.accManagerView.changeAccMessage('green-color', 0, ['']);
                this.accManagerView.changeAccMessage('lightblue-color', 0, ['']);
                this.accManagerView.changeAccMessage('pink-color', 0, ['']);

                this.$('#input-data').addClass('input-data-scroll-hidden');
                colorStyleOptions.show().find('div[data-color=' + equationData.getColor() + ']').addClass('graphing-tool-editor-colors-selected');
                this.accManagerView.changeAccMessage(colorStyleOptions.find('.graphing-tool-editor-color-box .selected .graphing-tool-editor-colors-selected')
                    .attr('id'), 0, [this.accManagerView.getAccMessage('unselected-text', 0)]);
                colorStyleOptions.find('.graphing-tool-editor-color-box .selected .graphing-tool-editor-colors-selected').removeClass('graphing-tool-editor-colors-selected');
                colorStyleOptions.find('.graphing-tool-editor-color-box .selected').removeClass('selected');

                colorStyleOptions.find('.selected-color').css({
                    "background-color": equationData.getColor()
                });
                colorStyleOptions.find('[data-color=' + equationData.getColor() + ']').addClass('graphing-tool-editor-colors-selected')
                    .parent().addClass('selected');
                this.accManagerView.changeAccMessage(colorStyleOptions.find('[data-color=' + equationData.getColor() + ']').attr('id'), 0, [this.accManagerView.getAccMessage('selected-text', 0)]);
                targetPosition = $target.offset();
                this._adjustListPoistion($list, targetPosition.top);
                targetPosition = $target.offset();
                targetPosition.top -= $list.offsetParent().offset().top;
                colorStyleOptions.css({
                    "top": targetPosition.top + LIST_HEADER_HEIGHT,
                    "left": targetPosition.left
                });
                this.trigger('set-popup-open');
                graphColor = colorStyleOptions.find('.graphing-tool-editor-colors-selected').attr('data-color-name');
                equationData.colorName = graphColor;
                if (this._graphingToolView.isAccDivPresent($list.find('#list-data-container-of-' + $list.attr('id')))) {
                    this.accManagerView.updateFocusRect($list.attr('id'));
                    this.accManagerView.updateFocusRect('list-data-container-of-' + $list.attr('id'));
                }
                this._updateStyleForList(colorStyleOptions, equationData);
            }
            this._graphingToolView.closeKeyboard();
            this._sliderPanel.hidePanel();
            this._graphingToolView._updateListBoxHeight(true);
            this.$('#style-2').off('keydown').on('keydown', _.bind(this._handleTabOnTypeElements, this, 'style'));
            this.$('#pink-color').off('keydown').on('keydown', _.bind(this._handleTabOnTypeElements, this, 'color'));
            this.$('#style-1').off('keydown').on('keydown', _.bind(this._handleShiftTabOnStyle, this, 'style'));
            this.$('#purple-color').off('keydown').on('keydown', _.bind(this._handleShiftTabOnStyle, this, 'color'));
            if ($('.graphing-tool-editor-style-box:hidden').length > 0) {
                this.accManagerView.setFocus('graphing-tool-editor-style-color');
            } else {
                this.accManagerView.setFocus('graphing-tool-editor-style-type');
            }
            this.accManagerView.enableTab('graphing-tool-editor-graph-style-thickness-handle', false);
        },

        /**
         * sets color for eqautionData
         * @method _setEquationDataColor
         * @param event {Object}
         * @return void
         */
        "_setEquationDataColor": function(event) {
            var $target = $(event.target).hasClass('acc-read-elem') ? $(event.target).parent() : $(event.target),
                $targetBox = $target.parents('.graphing-tool-editor-color-box'),
                colorStyleOptions = this.$('.graphing-tool-editor-color-style-box-equation'),
                $list = this.$('.list[data-equation-cid=' + colorStyleOptions.attr('data-target-equation-data-cid') + ']'),
                equationData = this._getMappedEquationData($list),
                undoData = {},
                redoData = {};
            if ($target.hasClass('graphing-tool-editor-colors-selected')) {
                return void 0;
            }
            this.accManagerView.changeAccMessage($targetBox.find('.graphing-tool-editor-colors-selected').attr('id'), 0, ['']);
            $targetBox.find('.graphing-tool-editor-colors-selected').removeClass('graphing-tool-editor-colors-selected').parent().removeClass('selected');
            undoData.color = equationData.getColor();
            undoData.colorName = equationData.colorName;
            undoData.equationData = equationData;
            if (equationData.getPathGroup() !== null) {
                equationData.changeColor($target.attr('data-color'));
            } else {
                if (equationData.getSpecie() === 'point') {
                    equationData.changePointsColor($target.attr('data-color'));
                } else {
                    return void 0;
                }
            }
            $target.parent().addClass('selected');
            equationData.setColor($target.attr('data-color'));
            equationData.colorName = $target.attr('data-color-name');
            redoData.color = equationData.getColor();
            redoData.colorName = equationData.colorName;
            redoData.equationData = equationData;
            this.execute('changeColor', {
                "undo": undoData,
                "redo": redoData
            });
            this._updateStyleForList(colorStyleOptions, equationData);
            $target.addClass('graphing-tool-editor-colors-selected');
            this.accManagerView.changeAccMessage($target.attr('id'), 0, [this.accManagerView.getAccMessage('selected-text', 0)]);
            this.accManagerView.setFocus('dummy-focus-container');
            this.accManagerView.setFocus($target.attr('id'));
            colorStyleOptions.find('.selected-color').css({
                "background-color": equationData.getColor()
            });
            this._updateWarning($list, equationData);
        },
        /**
         * sets style for eqautionData
         * @method _setEquationDataStyle
         * @param event {Object}
         * @return void
         */
        "_setEquationDataStyle": function(event) {
            var $target = $(event.target).hasClass('acc-read-elem') ? $(event.target).parent() : $(event.target),
                $targetBox = $target.parents('.graphing-tool-editor-styles-container'),
                colorStyleOptions = this.$('.graphing-tool-editor-color-style-box-equation'),
                $list = this.$('.list[data-equation-cid=' + colorStyleOptions.attr('data-target-equation-data-cid') + ']'),
                equationData = this._getMappedEquationData($list),
                lineClass, undoData = {},
                redoData = {};
            if ($target.parent().find('[class$="selected"]').length) {
                return void 0;
            } else {
                lineClass = $target.hasClass('graphing-tool-editor-styles-curve-graph') || $target.hasClass('graphing-tool-editor-styles-curve-graph-selected');
                if (lineClass) {
                    equationData.normalGraph();
                } else {
                    equationData.dashedGraph();
                }
                this._updateStyleForList(colorStyleOptions, equationData);
                undoData.lineClass = !lineClass;
                redoData.lineClass = lineClass;
                undoData.equationData = equationData;
                redoData.equationData = equationData;
                this._graphingToolView._gridGraphView.refreshView();
                this.execute('graphStyleChange', {
                    "undo": undoData,
                    "redo": redoData
                });
                this._setGraphStyleLineClass($list, equationData);
            }
        },
        /**
         * _updateStyleForList updates styles for list
         * @method _updateStyleForList
         * @param colorStyleOptions {Object}
         * @param equationData {Object} equationData model object
         * @return void
         */
        "_updateStyleForList": function(colorStyleOptions, equationData) {
            var $sliderView,
                $selectedType,
                $styleIcons;
            $selectedType = colorStyleOptions.find('.selected-type');
            $selectedType.attr('class', '');
            $styleIcons = colorStyleOptions.find('.graphing-tool-editor-graph-style-icons');
            $styleIcons.addClass('hidden');
            colorStyleOptions.find('#style-1-container .graphing-tool-editor-graph-styles').attr('class', '')
                .addClass('graphing-tool-editor-graph-styles graphing-tool-sprite-holder normal-curve');
            colorStyleOptions.find('#style-2-container .graphing-tool-editor-graph-styles').attr('class', '')
                .addClass('graphing-tool-editor-graph-styles graphing-tool-sprite-holder dashed-curve');
            colorStyleOptions.find('.graphing-tool-editor-close-button').hide();
            $sliderView = this._getThicknessSliderFromCollection(colorStyleOptions.find('.graphing-tool-editor-graph-thickness-value-container')
                .attr('data-slider-view-cid'));
            if (typeof $sliderView !== 'undefined') {
                $sliderView.set(parseInt(equationData.getThickness(), 10));
            }
            if (equationData.getDashArray().length === 0) {
                colorStyleOptions.find('.normal-curve')
                    .removeClass('graphing-tool-editor-styles-curve-graph')
                    .addClass('graphing-tool-editor-styles-curve-graph-selected');
                this.accManagerView.changeAccMessage(colorStyleOptions.find('.normal-curve').attr('id'), 0, [this.accManagerView.getAccMessage('selected-text', 0)]);
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setFocus(colorStyleOptions.find('.normal-curve').attr('id'));
                colorStyleOptions.find('.dashed-curve')
                    .removeClass('graphing-tool-editor-styles-dashed-graph-selected')
                    .addClass('graphing-tool-editor-styles-dashed-graph');
                this.accManagerView.changeAccMessage(colorStyleOptions.find('.dashed-curve').attr('id'), 0, [this.accManagerView.getAccMessage('unselected-text', 0)]);
                $selectedType.addClass('graphing-tool-sprite-holder selected-type graphing-tool-editor-styles-curve-graph');
            } else {
                colorStyleOptions.find('.normal-curve')
                    .removeClass('graphing-tool-editor-styles-curve-graph-selected')
                    .addClass('graphing-tool-editor-styles-curve-graph');
                this.accManagerView.changeAccMessage(colorStyleOptions.find('.normal-curve').attr('id'), 0, [this.accManagerView.getAccMessage('unselected-text', 0)]);
                colorStyleOptions.find('.dashed-curve')
                    .removeClass('graphing-tool-editor-styles-dashed-graph')
                    .addClass('graphing-tool-editor-styles-dashed-graph-selected');

                this.accManagerView.changeAccMessage(colorStyleOptions.find('.dashed-curve').attr('id'), 0, [this.accManagerView.getAccMessage('selected-text', 0)]);
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setFocus(colorStyleOptions.find('.dashed-curve').attr('id'));
                $selectedType.addClass('graphing-tool-sprite-holder selected-type graphing-tool-editor-styles-dashed-graph');
            }
        },
        /**
         * updates warning-text for all list items
         * @method _updateAllWarnings
         * @return void
         */
        "_updateAllWarnings": function() {
            var self = this,
                $list,
                equationData,
                $warning,
                $warningText,
                $chngeGraphStyle,
                $listHandle;
            this.$('#list-box>div.list').each(function() {
                $list = $(this);
                $chngeGraphStyle = $list.find('.change-graph-style');
                if (!$list.attr('data-has-slider')) {
                    equationData = self._getMappedEquationData($list);
                    if (typeof equationData === 'undefined') {
                        return void 0;
                    }
                    if (equationData.isCanBeSolved()) {
                        $warning = $list.find('.handler-warning');
                        $warningText = $list.find('.handler-warning-text');
                        $listHandle = $list.find('.list-handle');
                        if (equationData.getSpecie() === 'plot' || equationData.getSpecie() === 'point' || equationData.getSpecie() === 'quadraticPlot') {
                            $list.find('.show-hide-equation-container').show();
                            if ($warning.hasClass('error')) {
                                $warning.addClass('graph').removeClass('error');
                                $listHandle.removeClass('handle-error');
                                $chngeGraphStyle.addClass('visible');
                                $warningText.hide();
                            }
                        } else {
                            $list.find('.graph-style-edit-options').hide();
                            if ($warning.hasClass('error')) {
                                $warning.first().removeClass('error').css({
                                    "background-color": 'inherit'
                                });
                            }
                            $listHandle.removeClass('handle-error');
                            $warningText.hide();
                        }
                    } else {
                        self._processEquation(equationData, $list);
                    }
                }
            });
        },
        /**
         * updates warning of the given list item
         * @method _updateWarning
         * @param $list {Obejct}
         * @param equationData {Object}
         * @return void
         */
        "_updateWarning": function($list, equationData) {
            var $warning = $list.find('.handler-warning'),
                $warningText = $list.find('.handler-warning-text'),
                $chngeGraphStyle = $list.find('.change-graph-style'),
                $listHandle = $list.find('.list-handle');
            if (typeof equationData === 'undefined') {
                equationData = this._getMappedEquationData($list);
            }
            if (equationData.isCanBeSolved()) {
                $warning = $list.find('.handler-warning');
                $warningText = $list.find('.handler-warning-text');
                if (equationData.getSpecie() === 'plot' || equationData.getSpecie() === 'point' || equationData.getSpecie() === 'quadraticPlot') {
                    if (equationData.getCurveVisibility() === true) {
                        $list.find('.show-hide-equation, .show-hide-equation-container, .graph-style-edit-options').show();
                        this._setGraphStyleLineClass($list, equationData);
                        $warning.addClass('graph').removeClass('no-graph error');
                        $listHandle.removeClass('handle-error');
                        $warningText.css({
                            "display": "none"
                        });
                        $list.find('.show-hide-equation').removeClass('graph-hidden');
                    } else {
                        $warning.removeClass('error').addClass('graph, no-graph');
                        $listHandle.removeClass('handle-error');
                        $warningText.hide();
                        $list.find('.graph-style-edit-options').hide();
                        $list.find('.show-hide-equation, .show-hide-equation-container').show();
                        $list.find('.show-hide-equation').addClass('graph-hidden');
                        if ($list.hasClass('disabled')) {
                            $list.find('.graph-style-edit-options').show();
                            this._setGraphStyleLineClass($list, equationData);
                        }
                    }
                    if ($list.find('.list-toggle-button').hasClass('expanded')) {
                        $chngeGraphStyle.addClass('visible');
                    }
                    if ($list.hasClass('disabled')) {
                        $list.find('.show-hide-equation-container').hide();
                    }
                } else {
                    $warning.removeClass('no-graph').removeClass('error').removeClass('graph').css({
                        "background-color": 'inherit'
                    });
                    $listHandle.removeClass('handle-error');
                    $warningText.hide();
                    $list.find('.show-hide-equation, .graph-style-edit-options').hide();
                }
            } else {
                $list.find('.show-hide-equation').hide();
                this._processEquation(equationData, $list);
            }
        },
        "_setGraphStyleLineClass": function($list, equationData) {
            var $graphStyle,
                lineClass = 'line-';
            if (!$list) {
                $list = this.$('.list[data-equation-cid=' + equationData.getCid() + ']');
            }
            lineClass += this.model.get('COLOR_NAMES')[equationData.getColor()] + '-';
            lineClass += equationData.getDashArray().length > 0 ? 'dashed' : 'solid';
            $graphStyle = $list.find('.graph-style');
            $graphStyle.removeClass().addClass('graphing-tool-sprite-holder graph-style ' + lineClass);
        },
        /**
         * _changePlotLatex converts valid plot equation to "y=" form
         * @method _changePlotLatex
         * @param $list {Obejct}
         * @return void
         */
        "_changePlotLatex": function($list) {
            var newLatex, equationData;
            if (typeof $list !== 'undefined') {
                this._lastBlurList = $list;
            }
            if (this._lastBlurList && this._lastBlurList.attr('data-type') !== 'table') {
                equationData = this._getMappedEquationData(this._lastBlurList);
                if (equationData) {
                    newLatex = this.model.get('_equationDataManager').changeListLatex(equationData);
                    if (newLatex !== null) {
                        this._lastBlurList.find('.mathquill-editable').mathquill('latex', newLatex);
                        newLatex = this._processLatex(newLatex);
                        equationData.setLatex(newLatex, true);
                        if ($list !== void 0 && this._isListCollapsed($list)) {
                            $list.find('.list-header-description').mathquill('editable').mathquill('revert').mathquill().mathquill('latex', newLatex);
                        }
                    }
                }
            }
        },
        /**
         * _adjustListPosition adjusts list position
         * @method _adjustListPosition
         * @param $list {Object} jQuery object of list to be adjusted
         * @param $target {Object}
         * @return void
         */
        "_adjustListPosition": function($list, $target) {
            var TOLERANCE = 65,
                keyBoardTitlePosition = this._graphingToolView.$('#keyboard-title-container').offset(),
                manualScrollRange = {
                    "min": keyBoardTitlePosition.top - TOLERANCE,
                    "max": keyBoardTitlePosition.top + TOLERANCE
                },
                scrollBy = $target.height(),
                $inputBox,
                parentPosition = $target.offset(),
                inputColOptionsPosition = this._inputColOptions.offset(),
                currentScrollValue;
            this._graphingToolView._hidePopUps();
            // for textbox behind keyboard title
            while (parentPosition.top > manualScrollRange.min) {
                $inputBox = this.$('#input-data');
                currentScrollValue = $inputBox.scrollTop();
                $inputBox.scrollTop(currentScrollValue + scrollBy);
                parentPosition = $target.offset();
            }
            if (parentPosition.top < inputColOptionsPosition.top + TOLERANCE - 20) { // Padding of 20 from the top
                $inputBox = this.$('#input-data');
                currentScrollValue = $inputBox.scrollTop();
                $inputBox.scrollTop(currentScrollValue - scrollBy);
            }
        },
        /**
         * _createListWithEditor creates list with equation editor and appends slider box div
         * @method _createListWithEditor
         * @param isFirst {Boolean} is first editor created
         * @param isUndoRedo {Boolean} is function call for undo redo
         * @return {Object} jQuery object having list with equation editor
         */
        "_createListWithEditor": function(isFirst, isUndoRedo) {
            if (typeof isUndoRedo === 'undefined') {
                isUndoRedo = true;
            }
            var $list = this._createList(),
                tempView,
                inputParams = {
                    "holderDiv": $list.find('.equation-box'),
                    "editorCall": true,
                    "enterClick": true,
                    "keyboardObject": this.model.get('keyboardView'),
                    "enterClickFunction": true,
                    "defaultFocus": isUndoRedo,
                    "allowAccessibility": this._graphingToolView.model.get('isAccessible'),
                    "donotBindTab": true
                };
            if (isFirst) {
                // create keyboard
                tempView = MathUtilities.Components.MathEditor.Models.Application.init({
                    "holderDiv": $list.find('.equation-box'),
                    "editorCall": true,
                    "enterClick": true,
                    "basePath": MathUtilities.Tools.Graphing.Models.GraphingToolModel.BASEPATH,
                    "allowAccessibility": this._graphingToolView.model.get('isAccessible'),
                    "donotBindTab": true,
                    "keyboardCall": true,
                    "keyboardHolder": '.keyboardContainer',
                    "enterClickFunction": true
                });
                this.model.set('keyboardView', tempView);
                this._graphingToolView.$('.keyboardContainer').on('keyboardMax', _.bind(this._keyBoardOpen, this))
                    .on('keyboardMin', _.bind(this._keyBoardClose, this));
                tempView.accManagerView.enableTab('keyboardTitleContainer', false);
            } else {
                this.model.set('keyboardView', MathUtilities.Components.MathEditor.Keyboard.Instance);
                MathUtilities.Components.MathEditor.Models.Application.init(inputParams);
            }
            // append slider box in equation
            $list.find('textarea').on('focus', _.bind(this._onListTextAreaFocus, this)).on('blur', _.bind(function(event) {
                $list = $(event.target).parents('.list');
                this._lastBlurList = $list;
            }, this)).attr('tabindex', -1);
            $list.attr('data-prev-latex', '').find('#editor-1')
                .on('mousedown', _.bind(this._graphingToolView._hideHandler, this._graphingToolView))
                .addClass('equation-editor');
            $list.find('.show-hide-equation-container').hide();
            //enable touch for buttons in the list on tap
            this.TouchSimulator.enableTouch($list.find('.show-hide-equation-container'), {
                "specificEvents": this.TouchSimulator.SPECIFIC_EVENTS.TAP
            });
            this.TouchSimulator.enableTouch($list.find('.delete-list-container'), {
                "specificEvents": this.TouchSimulator.SPECIFIC_EVENTS.TAP
            });
            this.TouchSimulator.enableTouch($list.find('.graph-style-edit-options'), {
                "specificEvents": this.TouchSimulator.SPECIFIC_EVENTS.TAP
            });
            this.TouchSimulator.enableTouch($list.find('.handler-warning'));
            this.TouchSimulator.enableTouch($list.find('.table-error'));
            $list.find('.list-header-description').on('mouseenter mousedown', _.bind(this._displayTooltipOverList, this))
                .on('mouseleave mouseup', _.bind(this._hideTooltip, this));
            this._hideFadeoutElement($list);
            return $list;
        },
        "_onListTextAreaFocus": function(event) {
            if (this.model.get('_columnHidden') !== true) {
                this._graphingToolView.openKeyboard();
                this._graphingToolView._updateListBoxHeight(false);
            }
            var equationData,
                $list = $(event.target).parents('.list'),
                tempEquationData,
                $currentList,
                self = this;
            this._adjustListPosition($list, $list);
            this._graphingToolView._hidePopUps();
            equationData = this._getMappedEquationData($list);
            if (typeof equationData === 'undefined') {
                return void 0;
            }
            $list.parent().find('.list').each(function() {
                $currentList = $(this);
                $currentList.removeClass('list-focus')
                    .find('.list-handle').removeClass('warning-list-focus').addClass('list-sortable');
                $currentList.find('.equation-box').removeClass('equation-box-focus');
                $currentList.find('.list-drag').show();
                tempEquationData = self._getEquationDataUsingCid($(this).attr('data-equation-cid'));
                self._blurListBox(tempEquationData, $(this));
            });
            this._focusListBox(equationData, $list);
            $list = $(event.target).parents('.list');
            $list.find('.equation-box-container, .slider-text-holder').removeAttr('style');
            this._updateListWidth($list.find('.equation-box').outerWidth(), $list.attr('data-equation-cid'));
        },
        "_hideFadeoutElement": function($list) {
            var userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.indexOf('firefox') > -1) {
                $list.find('.fade-out').addClass('firefox');
            }
        },
        /**
         * _updateListWidth updates width of all list object
         * @method _updateListWidth
         * @param maxWidth {Number} max width to be set
         * @return void
         */
        "_updateListWidth": function(maxWidth, except) {
            var $inputColumn = this.$('#input-data'),
                $lists = $inputColumn.find('.list'),
                listCounter,
                $list,
                DEFAULT_WIDTH = 329,
                sliderBoxWidth = 244,
                $exceptList,
                COLLAPSED_PADDING = 14,
                $exceptSliderBox,
                noOfList = $lists.length,
                DEFAULT_SLIDER_WIDTH = 237,
                isCollapse = false,
                withoutDescWidth,
                withoutSliderDescWidth = 120,
                CONSTANT_BUTTON_WIDTH = 115,
                TEXTBOX_PADDING = 26,
                constantHeaderWidth,
                DISABLED_PADDING = 28,
                listWidth;
            if (maxWidth < DEFAULT_WIDTH) {
                maxWidth = DEFAULT_WIDTH;
            }
            if (except) {
                $exceptList = this.$('.list[data-equation-cid="' + except + '"]');
                $exceptSliderBox = $exceptList.find('.slider-text-holder');
                if ($exceptSliderBox.length !== 0) {
                    sliderBoxWidth = $exceptSliderBox.outerWidth() + withoutSliderDescWidth;
                    if (sliderBoxWidth > maxWidth) {
                        maxWidth = sliderBoxWidth;
                    }
                }
            }
            for (listCounter = 0; listCounter < noOfList; listCounter++) {
                $list = $lists.eq(listCounter);
                isCollapse = $list.find('.list-toggle-button').hasClass('collapse');
                if ($list.hasClass('disabled')) {
                    constantHeaderWidth = CONSTANT_BUTTON_WIDTH - DISABLED_PADDING;
                } else {
                    constantHeaderWidth = CONSTANT_BUTTON_WIDTH;
                }
                $list.find('.list-header-description').css({
                    "max-width": "50px" //default max width
                });

                listWidth = $list.find('.list-options-container').width() || this.listOptionContainerWidth;
                withoutDescWidth = constantHeaderWidth + listWidth;
                if ($list.attr('data-equation-cid') !== except) {
                    if (typeof maxWidth === 'undefined') {
                        $list.find('.slider-text-holder').removeAttr('style').css({
                            "max-width": DEFAULT_SLIDER_WIDTH
                        });
                        if (isCollapse) {
                            $list.find('.list-header-description').removeAttr('style').css({
                                "max-width": DEFAULT_WIDTH
                            });
                        } else {
                            $list.find('.equation-box-container').removeAttr('style').css({
                                "max-width": DEFAULT_WIDTH - TEXTBOX_PADDING
                            });
                        }
                    } else {
                        $list.find('.slider-text-holder').removeAttr('style').css({
                            "max-width": maxWidth - withoutSliderDescWidth
                        });
                        if (isCollapse) {
                            $list.find('.list-header-description').removeAttr('style').css({
                                "max-width": maxWidth
                            });
                        } else {
                            $list.find('.equation-box-container').removeAttr('style').css({
                                "max-width": maxWidth
                            });
                        }
                    }
                }
            }
            this.listOptionsContainerWidth = listWidth;
            this.accManagerView.updateFocusRect($list.attr('id'));
            this.accManagerView.updateFocusRect('input-column');
        },
        "_resetHeaderMaxWidth": function() {
            var $inputColumn = this.$('#input-data'),
                $lists = $inputColumn.find('.list'),
                listCounter,
                $list,
                noOfList = $lists.length,
                isCollapse,
                DEFAULT_HEADER_DESC_WIDTH = 145;
            for (listCounter = 0; listCounter < noOfList; listCounter++) {
                $list = $lists.eq(listCounter);
                isCollapse = $list.find('.list-toggle-button').hasClass('collapse');
                if (isCollapse) {
                    $list.find('.list-header-description').css({
                        "max-width": DEFAULT_HEADER_DESC_WIDTH + "px"
                    });
                }
            }
        },
        /**
         * _keyBoardOpen focus last focused mathquill on keyboard open
         * @method _keyBoardOpen
         * @return void
         */
        "_keyBoardOpen": function() {
            this._graphingToolView.trigger('keyboard-opened');
            this._graphingToolView._updateListBoxHeight(false);
            var $textarea = this.$('.list-focus').find('.mathquill-editable').find('textarea');
            if ($('#input-column').is(':visible')) {
                if ($textarea.length !== 0) {
                    $textarea.eq($textarea.length - 1).focus();
                } else {
                    this.$('.list').last().find('.mathquill-editable').find('textarea').focus();
                }
            }
        },
        /**
         * _keyBoardClose updates listBox height on keyboard close
         * @method _keyBoardClose
         * @return void
         */
        "_keyBoardClose": function() {
            this._graphingToolView.trigger('keyboard-closed');
            this._graphingToolView._updateListBoxHeight(true);
        },
        /**
         * _getMappedEquationData returns mapped equationData for the given list
         * @method _getMappedEquationData
         * @param $list {Object}
         * @return {Object} mapped equationData model Object
         */
        // returns equation data mapped to the given list object
        "_getMappedEquationData": function($list) {
            var equationData, equationCid;
            equationCid = $list.attr('data-equation-cid');
            // change later
            equationData = this.model.get('_equationDataManager').getEquationDataUsingCid(equationCid);
            return equationData;
        },
        /**
         * Returns equationData from the collection with the given cid of equationData
         * @method _getEquationDataUsingCid
         * @param equationCid {String} cid of equationData to be searched
         * @return {Object} equationData model
         */
        "_getEquationDataUsingCid": function(equationCid) {
            return this.model.get('_equationDataManager').getEquationDataUsingCid(equationCid);
        },
        /**
         * calls function to remove plotted graph for given equationData
         * @method _callRemovePlottedGraph
         * @param equationData {Object}
         * @return void
         */
        "_callRemovePlottedGraph": function(equationData) {
            this.model.get('_equationDataManager').removeEquationDataFromGridGraph(equationData, true);
        },
        /**
         * _updateHandles updates the serial nos of equation lists
         * @method _updateHandles
         * @return void
         */
        "_updateHandles": function() {
            // get array of all handles
            var handles = this.$('.handler-number'),
                handlesLength = handles.length,
                handleCounter,
                $listHandle,
                currentHandle,
                $handle;
            // update handle names
            for (handleCounter = 0; handleCounter < handlesLength; handleCounter++) {
                $handle = handles.eq(handleCounter);
                currentHandle = handleCounter + 1;
                $handle.html(currentHandle);
                $listHandle = $handle.parents('.list-handle');
                $listHandle.attr('data-handle-number', currentHandle);
                if ($listHandle.hasClass('warning-list-focus')) {
                    this._sliderPanel.updateListNumber(currentHandle);
                }
            }
        },
        /**
         * _focusOnList focuses list
         * @method _focusOnList
         * @param $list {Object} jQuery object containing list
         * @param isParent {Boolean}
         * @return void
         */
        "_focusOnList": function($list, isParent) {
            if (typeof $list !== 'undefined' && this._isListCollapsed($list)) {
                return void 0;
            }
            var $prevList = this.$('.list-focus');
            if ($prevList.length !== 0) {
                if ($prevList.attr('data-type') !== 'table') {
                    this._blurListBox(this._getMappedEquationData($prevList), $prevList);
                } else {
                    this._blurListBox(false, $prevList);
                }
            }
            if ($list.attr('data-type') === 'table') {
                if (!isParent) {
                    if ($list.find('.acc-read-elem').length === 0) {
                        $list.find('textarea:last').focus();
                    } else {
                        this.accManagerView.setFocus($list.attr('id'));
                    }
                }
                $list.addClass('list-focus').find('.list-handle').addClass('warning-list-focus').removeClass('list-sortable');
                $list.find('.equation-box').addClass('equation-box-focus');
                $list.find('.list-drag').hide();
            } else {
                if (!$list.hasClass('disabled')) {
                    $list.addClass('list-focus').find('textarea').first().focus();
                    $list.find('.list-handle').addClass('warning-list-focus').removeClass('list-sortable');
                    $list.find('.equation-box').addClass('equation-box-focus');
                    $list.find('.list-drag').hide();
                }
            }
        },
        /**
         * _focusListBox focuses list box
         * @method _focusOnList
         * @param equationData {Object} equationData model object
         * @param $list {Object} jQuery object containing list
         * @return void
         */
        "_focusListBox": function(equationData, $list) {
            if (typeof equationData === 'undefined') {
                return void 0;
            }
            var prevList = $(this.$('.list-focus')),
                currentConstants, listHandleNumber;
            if (prevList.length !== 0) {
                if (prevList.attr('data-type') !== 'table') {
                    this._blurListBox(this._getMappedEquationData(prevList), prevList);
                } else {
                    this._blurListBox(false, prevList);
                }
            }
            if (typeof $list === 'undefined') {
                $list = this.$('.list[data-equation-cid="' + equationData.getCid() + '"]');
            }
            if (this._isListCollapsed($list)) {
                return void 0;
            }
            $list.addClass('list-focus');
            $list.find('.list-handle').addClass('warning-list-focus').removeClass('list-sortable');
            $list.find('.equation-box').addClass('equation-box-focus');
            $list.find('.list-drag').hide();
            listHandleNumber = $list.find('.list-handle').attr('data-handle-number');
            this._showCriticalPoints(equationData);
            if (equationData !== void 0) {
                equationData.trigger('redraw-graph');
                currentConstants = equationData.getAllConstants();
                this._sliderPanel.focusSliders(currentConstants, listHandleNumber);
            }
        },
        /**
         * _blurListBox blurs list box
         * @method _blurListBox
         * @param equationData {Object} equationData model object
         * @param $list {Object} jQuery object containing list
         * @return void
         */
        "_blurListBox": function(equationData, $list) {
            if (equationData) {
                if (typeof $list === 'undefined') {
                    $list = this.$('.list[data-equation-cid="' + equationData.getCid() + '"]');
                }
                equationData.trigger('redraw-graph');
            }
            if ($list) {
                $list.removeClass('list-focus').find('.list-handle').removeClass('warning-list-focus').addClass('list-sortable');
                $list.find('.equation-box').removeClass('equation-box-focus');
                $list.find('.list-drag').show();
                this._hideCriticalPoints(equationData);
                if ($list.attr('data-type') === 'table') {
                    this.hideChartButtons($list);
                }
            }
            if (equationData) {
                equationData.trigger('redraw-graph');
            }
        },
        /**
         * _showCriticalPoints shows critical points for given equationData
         * @method _showCriticalPoints
         * @param equationData {Object} equationData model object
         * @return void
         */
        "_showCriticalPoints": function(equationData) {
            if (typeof equationData === 'undefined') {
                return void 0;
            }
            var allCriticalPointsEquations = [equationData.getCriticalPoints(),
                    equationData.getInterceptPoints(),
                    equationData.getDiscontinuousPoints(),
                    equationData.getHollowPoints()
                ],
                counter, currentEquation,
                intersectionsObj = equationData.getIntersectionPoints(),
                length = allCriticalPointsEquations.length;
            equationData.hasFocus = true;
            if (equationData.getCurveVisibility()) {
                for (counter = 0; counter < length; counter++) {
                    currentEquation = allCriticalPointsEquations[counter];
                    if (currentEquation !== null && currentEquation.getPointsGroup() !== null) {
                        currentEquation.showGraph();
                        this._graphingToolView.$('.coordinate-tooltip[data-equation-cid="' + currentEquation.getCid() + '"]').show();
                    }
                }
                if (intersectionsObj !== null) {
                    for (counter in intersectionsObj) {
                        currentEquation = intersectionsObj[counter];
                        if (currentEquation !== null && currentEquation.getPointsGroup() !== null) {
                            currentEquation.showGraph();
                        }
                    }
                }
            }

            this._graphingToolView._gridGraphView.refreshView();
        },
        /**
         * _hideCriticalPoints hides critical points for given equationData
         * @method _hideCriticalPoints
         * @param equationData {Object} equationData model object
         * @param hideAnyway {Boolean} flag to hide selected points as well
         * @return void
         */
        "_hideCriticalPoints": function(equationData, hideAnyway) {
            if (typeof equationData === 'undefined' || equationData === false) {
                return void 0;
            }
            var allCriticalPointsEquations = [equationData.getCriticalPoints(),
                    equationData.getInterceptPoints(),
                    equationData.getDiscontinuousPoints(),
                    equationData.getHollowPoints()
                ],
                counter, currentEquation,
                length = allCriticalPointsEquations.length,
                intersectionPointsEquation = equationData.getIntersectionPoints(),
                intersectionEquationData,
                $toolTip,
                equationCounter;
            equationData.hasFocus = false;
            if (equationData.getCurveVisibility() || hideAnyway) {
                for (counter = 0; counter < length; counter++) {
                    currentEquation = allCriticalPointsEquations[counter];
                    if (currentEquation !== null && currentEquation.getPointsGroup() !== null) {
                        currentEquation.hideGraph(hideAnyway);
                        if (hideAnyway) {
                            this._graphingToolView.$('.coordinate-tooltip[data-equation-cid="' + currentEquation.getCid() + '"]').hide();
                        }
                    }
                }

                if (intersectionPointsEquation !== null) {
                    for (equationCounter in intersectionPointsEquation) {
                        intersectionEquationData = intersectionPointsEquation[equationCounter];
                        $toolTip = this._graphingToolView.$('.coordinate-tooltip[data-equation-cid="' + intersectionEquationData.getCid() + '"]');
                        if ($toolTip.is(':visible') === false) {
                            hideAnyway = true;
                        }
                        intersectionEquationData.hideGraph(hideAnyway);
                        if (hideAnyway) {
                            $toolTip.hide();
                        }
                    }
                }
            }
            this._graphingToolView._gridGraphView.refreshView();
        },

        /**
         * _removeCriticalPoints removes critical points for given equationData
         * @method _removeCriticalPoints
         * @param equationData {Object} equationData model object
         * @return void
         */
        "_removeCriticalPoints": function(equationData) {
            if (equationData === void 0 || equationData === false) {
                return;
            }
            var allCriticalPointsEquations = [equationData.getCriticalPoints(),
                    equationData.getInterceptPoints(),
                    equationData.getDiscontinuousPoints(),
                    equationData.getHollowPoints()
                ],
                counter, currentEquation,
                length = allCriticalPointsEquations.length,
                intersectionPointsEquation = equationData.getIntersectionPoints(),
                intersectionEquationData,
                $toolTip,
                equationCounter;

            equationData.hasFocus = false;

            for (counter = 0; counter < length; counter++) {
                currentEquation = allCriticalPointsEquations[counter];
                if (currentEquation !== null && currentEquation.getPointsGroup() !== null) {
                    this._graphingToolView.$('.coordinate-tooltip[data-equation-cid="' + currentEquation.getCid() + '"]').remove();
                }
            }

            if (intersectionPointsEquation !== null) {
                for (equationCounter in intersectionPointsEquation) {
                    intersectionEquationData = intersectionPointsEquation[equationCounter];
                    $toolTip = this._graphingToolView.$('.coordinate-tooltip[data-equation-cid="' + intersectionEquationData.getCid() + '"]');
                    $toolTip.remove();
                }
            }
            this._graphingToolView._gridGraphView.refreshView();
        },

        /**
         * _showFixedCellWarningText shows fixed warning text for cell
         * @method _showFixedCellWarningText
         * @param {Object} event
         * @return void
         */
        "_showFixedCellWarningText": function(event) {
            var $target = $(event.currentTarget),
                $cell,
                $cellWarningtextContainer,
                $list,
                handlerWarning;
            if (!$target.hasClass('table-error')) {
                return void 0;
            }
            $cell = $target.parents('.cell');
            $list = $cell.parents('.list');
            handlerWarning = $cell.find('.handler-warning').attr('id');
            $cellWarningtextContainer = $list.find('.table-error-text');
            if ($cellWarningtextContainer.hasClass('table-error-fixed')) {
                $cellWarningtextContainer.removeClass('table-error-fixed');
                this._showCellWarningText(event);
                if ($.support.touch) {
                    $cellWarningtextContainer.hide();
                }
                this._graphingToolView.setAccMessage(handlerWarning, this.accManagerView.getAccMessage('handler-warning', 0));
            } else {
                this._graphingToolView.setAccMessage(handlerWarning, $cellWarningtextContainer.text());
                $cellWarningtextContainer.addClass('table-error-fixed').show();
                this.trigger('set-popup-open');
            }
            if (this.$('#' + handlerWarning).find('.acc-read-elem').length !== 0) {
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setFocus(handlerWarning);
            }
        },
        /**
         * _toggleHandlerWarningText toggles handler warning text
         * @method _toggleHandlerWarningText
         * @param target {Object}
         * @param $inputColumn {Object}
         * @return void
         */
        "_toggleHandlerWarningText": function(event) {
            var $handler = $(event.currentTarget),
                $handleWarningText,
                $list = $handler.parents('.list'),
                $inputColumn = this.$el;
            if ($handler.hasClass('handler-warning')) {
                if ($handler.hasClass('error')) {
                    $handleWarningText = $list.find('.handler-warning-text');
                    if ($handleWarningText.hasClass('dark')) {
                        $handleWarningText.removeClass('dark');
                        if (MathUtilities.Components.Utils.Models.BrowserCheck.isMobile) {
                            $handleWarningText.hide();
                        }
                        this._graphingToolView.setAccMessage($handler.attr('id'), this._graphingToolView.getAccMessage('handler-warning', 0));
                    } else {
                        this._graphingToolView._updateListBoxHeight(true);
                        this._graphingToolView.closeKeyboard();
                        $handleWarningText.addClass('dark');
                        $handleWarningText.show();
                        this._graphingToolView.setAccMessage($handler.attr('id'), $handleWarningText.text());
                    }
                    this._graphingToolView.setFocus('dummy-focus-container');
                    this._graphingToolView.setFocus($handler.attr('id'));
                } else {
                    $inputColumn.find('.handler-warning-text').each(function() {
                        var $currentElement = $(this);
                        if ($currentElement.hasClass('dark')) {
                            $currentElement.toggleClass('dark');
                        }
                        $currentElement.hide();
                    });
                }
            } else {
                $inputColumn.find('.handler-warning-text').each(function() {
                    var $currentElement = $(this);
                    if ($currentElement.hasClass('dark')) {
                        $currentElement.toggleClass('dark');
                    }
                    $currentElement.hide();
                });
            }
        },
        /**
         * _showGraphErrorToolTip shows graph error tooltip
         * @method _showGraphErrorToolTip
         * @param {Object} event object
         * @return void
         */
        "_showGraphErrorToolTip": function(event) {
            var $target = $(event.currentTarget),
                $list = $target.parents('.list'),
                $warningText = $list.find('.handler-warning-text'),
                targetWidth = $target.width(),
                targetPosition = $target.offset();
            this._zIndexForWarning++;
            if ($target.hasClass('error') && typeof $warningText !== 'undefined') {
                $warningText.css({
                    "top": 1,
                    "left": targetPosition.left + targetWidth,
                    "z-index": this._zIndexForWarning
                }).show();
            }
        },
        /**
         * _hideGraphErrorToolTip hides graph error tooltip
         * @method _hideGraphErrorToolTip
         * @param {Object} event object
         * @return void
         */
        "_hideGraphErrorToolTip": function(event) {
            var $target = $(event.target),
                $list = $target.parents('.list'),
                $warningText = $list.find('.handler-warning-text');
            if (!$warningText.hasClass('dark')) {
                $warningText.css({
                    "z-index": 1
                });
                this._zIndexForWarning--;
                $warningText.hide();
            }
        },
        /**
         * _getListData returns JSON data of the given list
         * @method _getListData
         * @param $list {Object} jQuery object containing list
         * @return {Object} JSON object having list data
         */
        "_getListData": function($list) {
            var listData = {};
            listData.equationData = this._getMappedEquationData($list);
            listData.equationCid = $list.attr('data-equation-cid');
            listData.equation = $list.find('.outerDiv .mathquill-rendered-math').mathquill('latex');
            listData.type = $list.attr('data-type');
            listData.solution = $list.find('.list-answer').mathquill('latex');
            if (listData.solution) {
                listData.solution = listData.solution.replace('=', '');
            }
            listData.dataConstant = $list.find('.slider-box-container').attr('data-constant');
            if ($list.prev().attr('data-type') === 'table') {
                listData.prevDataType = 'table';
                listData.prevTarget = $list.prev().attr('data-table-view-cid');
            } else {
                listData.prevDataType = 'equation';
                listData.prevTarget = $list.prev().attr('data-equation-cid');
            }
            if ($list.next().attr('data-type') === 'table') {
                listData.nextDataType = 'table';
                listData.nextTarget = $list.next().attr('data-table-view-cid');
            } else {
                listData.nextDataType = 'equation';
                listData.nextTarget = $list.next().attr('data-equation-cid');
            }
            //*get index of list*/
            if ($list.prev().length === 0) {
                listData.index = 1;
            } else {
                listData.index = parseInt($list.prev().find('.handler-number').text(), 10) + 1;
            }
            listData.tableColEquationDataCid = $list.attr('table-col-equationdata-cid');
            listData.bestFitType = $list.attr('bestFitType');
            listData.degree = $list.attr('degree');
            listData.disabled = $list.hasClass('disabled');
            return listData;
        },
        /**
         * _setListData sets listData in the given list Object
         * @method _setListData
         * @param $list {Object} jQuery object containing list
         * @param listData {Object} JSON object of list data
         * @return {Object} updated list Object
         */
        "_setListData": function($list, listData) {
            this.model.get('_equationDataManager').addEquation(listData.equationData, true);
            $list.attr('data-equation-cid', listData.equationCid);
            $list.attr('data-type', listData.type);
            $list.find('.mathquill-editable').mathquill('latex', listData.equation);
            return $list;
        },
        // TABLE RELATED FUNCTIONS
        /**
         * _getTableViewObject returns table view object for the given list
         * @method _getTableViewObject
         * @param $list {Object} jQuery object
         * @return {Object} table view object
         */
        "_getTableViewObject": function($list) {
            var tableViewCid = $list.attr('data-table-view-cid'),
                tableViews = this.model.get('tableViews'),
                tableCounter,
                tableView,
                tableViewsLength = tableViews.length;
            for (tableCounter = 0; tableCounter < tableViewsLength; tableCounter++) {
                if (tableViews[tableCounter].cid === tableViewCid) {
                    tableView = tableViews[tableCounter];
                    break;
                }
            }
            return tableView;
        },
        /**
         * _getMappedTableColumnEquationData returns equationData for given cell
         * @method _getMappedTableColumnEquationData
         * @param $cell {Object} jQuery object
         * @return {Object} equationData model object
         */
        "_getMappedTableColumnEquationData": function($cell) {
            var cellCollumn = $cell.attr('data-column'),
                $equationBox = $cell.parents('.equation-box'),
                columnHeader = $equationBox.find('div[data-column=' + cellCollumn + ']').first(),
                equationDataCid = columnHeader.attr('data-equation-cid'),
                equationData = this._getEquationDataUsingCid(equationDataCid);
            return equationData;
        },
        /**
         * _getTableEquationData Get table's equation data.
         * @method _getTableEquationData
         * @param tableView {Object} view of the table
         * @return {Object} equationData Object
         */
        "_getTableEquationData": function(tableView) {
            var equationData = [],
                equationCid,
                columnCounter,
                $currentHeader,
                _equationDataManager = this.model.get('_equationDataManager'),
                tableCols = tableView.getColCount(),
                $firstRow = tableView.getRow(1);
            for (columnCounter = 0; columnCounter < tableCols; columnCounter++) {
                $currentHeader = $firstRow.eq(columnCounter);
                if ($currentHeader.attr('data-ignore-column') === 'true') {
                    continue;
                }
                equationCid = $currentHeader.attr('data-equation-cid');
                equationData.push(_equationDataManager.getEquationDataUsingCid(equationCid));
            }
            return equationData;
        },
        /**
         * _getTableContent gets table content data
         * @method _getTableContent
         * @param $list {Object} jQuery object containing list
         * @param tableView {Backbone View} table view object for which content is required
         * @return {Object} table contents Object
         */
        "_getTableContent": function($list, tableView) {
            var content;
            if (!tableView) {
                tableView = this._getTableViewObject($list);
                if (typeof tableView === 'undefined') {
                    return void 0;
                }
            }
            content = tableView.getTableState(true);
            return content;
        },
        /**
         * show best fit custom alert
         * @method _showBestFitAlert
         * @return void
         */
        "_showBestFitAlert": function(id, focusElementId, cancelFocus, updatelistWidth) {
            var $modal = $('#tool-holder-4').find('#' + id);
            $modal.modal({
                "manager": this._graphingToolView.$el
            });
            this._bestFitAlertDisplayed = true;
            $modal.find('.btn-primary').off('click.' + id).on('click.' + id, _.bind(function() {
                this._graphingToolView._closeAlertBox($modal);
                this._bestFitAlertDisplayed = false;
                if (this._graphingToolView.isAccDivPresent(this.$('#' + focusElementId))) {
                    this.accManagerView.setFocus(focusElementId);
                }
                if (updatelistWidth) {
                    this._updateListWidth(this.$('#' + focusElementId).parents('.list'));
                }
            }, this));
            if (cancelFocus) {
                $modal.find('.btn-cancel').off('click.' + id).on('click.' + id, _.bind(function() {
                    if (this._graphingToolView.isAccDivPresent(this.$('#' + focusElementId))) {
                        this.accManagerView.setFocus(focusElementId);
                    }
                    if (id === 'min-col-delete') {
                        this._updateListWidth(this.$('#' + focusElementId).parents('.list'));
                    }
                }, this));
            }
            this.accManagerView.unloadScreen('bootstrap-popup-text');
            this.accManagerView.loadScreen('bootstrap-popup-text');
            this.accManagerView.setFocus(id + '-title', 5);
        },
        /**
         * _createTableList creates table list with given rows n columns
         * @method _createTableList
         * @param tableRows {Number} no of rows for table
         * @param tableCols {Number} no of columns for table
         * @param $list {Object} Jquery object in which the table is created
         * @param tableNumber {Number} table name number
         * @return {Object} jQuery object containing table
         */
        "_createTableList": function(tableRows, tableCols, $list, tableNumber) {
            var inputParams, tableObject, tableViews,
                tableCounter,
                $newCell, showCopyBtn,
                counter,
                object = [],
                tabIndex = this.listTabIndex,
                listId,
                TAB_INDEX_TOLERANCE = 29;
            if ($list) {
                $list.find('.show-hide-equation').removeClass('graph-hidden');
                $list.find('.equation-box').html('');
            } else {
                $list = this._createList();
            }
            $list.attr('data-type', 'table');
            inputParams = {
                "holderDiv": $list.find('.equation-box'),
                "editorCall": true,
                "enterClick": true,
                "keyboardObject": this.model.keyboardView,
                "enterClickFunction": true,
                "defaultFocus": false
            };
            if (typeof tableNumber === 'undefined') {
                tableCounter = this.model.get('tableCounter') + 1;
                this.model.set('tableCounter', tableCounter);
            } else {
                tableCounter = tableNumber;
            }
            showCopyBtn = this.showCopyBtn;
            tableObject = new MathUtilities.Components.GraphTable.Views.Table({
                "el": $list.find('.equation-box'),
                "maxRows": 100,
                "maxColumns": 5,
                "rows": tableRows,
                "cols": tableCols,
                "oEditorParam": inputParams,
                "tableCounter": tableCounter,
                "showCopyBtn": showCopyBtn,
                "accManagerView": this.accManagerView,
                "equationPanel": this
            });
            tableObject.$('.table-text').text(this.accManagerView.getMessage('table-number-text', 0, [tableCounter]));
            tableObject.$('.row-header-text').text(this.accManagerView.getMessage('row-header-text', 0));
            tableObject.$('.common-chart-button').text(this.accManagerView.getMessage('chart-setting-selection-btn', 0));
            tableObject.$('.function-option.col-function').text(this.accManagerView.getMessage('function-text', 0));
            tableObject.$('.function-option.col-label').text(this.accManagerView.getMessage('label-text', 0));
            tableObject.on('function-dropdown-open', _.bind(this.includeHideScroll, this));
            tableObject.on('function-dropdown-closed', _.bind(this.includeShowScroll, this));
            tableObject.on('copy-table', _.bind(this.copyTableData, this, $list));
            tableObject.$('.next-column-hidden-icon-container, .prev-column-hidden-icon-container').off('click')
                .on('click', _.bind(this._showHiddenColumns, this));
            $list.find('.show-hide-equation-container').show();
            tableObject.on('col-add-acc', _.bind(function(cid, rowCounter, totalCols) {
                for (counter = 1; counter <= rowCounter; counter++) {
                    object.push({
                        "id": counter + "-" + totalCols + "-of-" + cid,
                        "accId": counter + "-" + totalCols + "-of-" + cid,
                        "type": "text",
                        "tabIndex": tabIndex + TAB_INDEX_TOLERANCE + counter,
                        "messages": [{
                            "id": "0",
                            "isAccTextSame": false,
                            "message": {
                                "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 10, ['']),
                                "loc": ""
                            }
                        }]
                    }, {
                        "id": counter + "-" + totalCols + "-handler-warning-of-" + cid,
                        "accId": counter + "-" + totalCols + "-handler-warning-of-" + cid,
                        "type": "text",
                        "tabIndex": tabIndex + TAB_INDEX_TOLERANCE + counter,
                        "messages": [{
                            "id": "0",
                            "isAccTextSame": false,
                            "message": {
                                "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 2),
                                "loc": ""
                            }
                        }]
                    });
                    if (counter === 1) {
                        if (!tableObject.$('#' + counter + "-" + totalCols + "-of-" + cid).hasClass('cell-disabled')) {
                            this._updateWarningForCell(tableObject.$('#' + counter + "-" + totalCols + "-of-" + cid), {
                                "hasError": false,
                                "errorCode": '',
                                "equationData": this._getEquationDataUsingCid(tableObject.$('#' + counter + "-" + totalCols + "-of-" + cid).attr('data-equation-cid')),
                                "cid": cid
                            });
                        }
                        object.push({
                            "id": counter + "-" + totalCols + "-function-btn-" + cid,
                            "accId": counter + "-" + totalCols + "-function-btn-" + cid,
                            "type": "text",
                            "tabIndex": tabIndex + TAB_INDEX_TOLERANCE + counter,
                            "messages": [{
                                "id": "0",
                                "isAccTextSame": false,
                                "message": {
                                    "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 7, [this.accManagerView.getMessage('function-text', 0), this.accManagerView.getMessage('label-text', 0)]),
                                    "loc": ""
                                }
                            }]
                        }, {
                            "id": counter + "-" + totalCols + "-prev-column-hidden-icon-" + cid,
                            "accId": counter + "-" + totalCols + "-prev-column-hidden-icon-" + cid,
                            "type": "text",
                            "tabIndex": tabIndex + TAB_INDEX_TOLERANCE + counter,
                            "messages": [{
                                "id": "0",
                                "isAccTextSame": false,
                                "message": {
                                    "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 9),
                                    "loc": ""
                                }
                            }]
                        }, {
                            "id": counter + "-" + totalCols + "-next-column-hidden-icon-" + cid,
                            "accId": counter + "-" + totalCols + "-next-column-hidden-icon-" + cid,
                            "type": "text",
                            "tabIndex": tabIndex + TAB_INDEX_TOLERANCE + counter,
                            "messages": [{
                                "id": "0",
                                "isAccTextSame": false,
                                "message": {
                                    "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 8),
                                    "loc": ""
                                }
                            }]
                        });
                    }
                }
                listId = $list.attr('id');
                this.addElementsInAccScreen(listId, object);
                this.accManagerView.unloadScreen(listId);
                this.accManagerView.loadScreen(listId);
            }, this)).on('row-add-acc', _.bind(function(cid, colCounter, rowNo) {
                for (counter = 1; counter <= colCounter; counter++) {
                    object.push({
                        "id": rowNo + 1 + "-" + counter + "-of-" + cid,
                        "accId": rowNo + 1 + "-" + counter + "-of-" + cid,
                        "type": "text",
                        "tabIndex": tabIndex + 29 + rowNo,
                        "messages": [{
                            "id": "0",
                            "isAccTextSame": false,
                            "message": {
                                "acc": this.accManagerView.getAccMessage('table-equation-panel-messages', 10, ['']),
                                "loc": ""
                            }
                        }]
                    }, {
                        "id": rowNo + 1 + "-" + counter + "-handler-warning-of-" + cid,
                        "accId": rowNo + 1 + "-" + counter + "-handler-warning-of-" + cid,
                        "type": "text",
                        "tabIndex": tabIndex + 29 + rowNo,
                        "messages": [{
                            "id": "0",
                            "isAccTextSame": false,
                            "message": {
                                "acc": this.accManagerView.getAccMessage('handler-warning', 0),
                                "loc": ""
                            }
                        }]
                    });
                }
                listId = $list.attr('id');
                this.addElementsInAccScreen(listId, object);
                this.accManagerView.unloadScreen(listId);
                this.accManagerView.loadScreen(listId);
            }, this)).on('row:created', _.bind(function(rows, isIgnoreRow) {
                var totalColumns = tableObject.getColCount(),
                    totalRows = tableObject.getRowCount(),
                    columnCounter;
                this._parseTableRow(rows, tableObject, false, isIgnoreRow);
                for (columnCounter = 1; columnCounter < totalColumns; columnCounter++) {
                    $newCell = tableObject.getCellAt(totalRows, columnCounter);
                    if ($newCell.length !== 0) {
                        $newCell.find('textarea').blur();
                    }
                }
                $list.find('.mathquill-editable')
                    .off('mousedown', _.bind(this._graphingToolView._hideHandler, this._graphingToolView))
                    .on('mousedown', _.bind(this._graphingToolView._hideHandler, this._graphingToolView));
            }, this)).on('row:deleted', _.bind(function(rows, isIgnoreRow) {
                this._deleteTableRow($list, tableObject, tableObject.getRowCount());
            }, this)).on('column:created', _.bind(function(isBindEventOnly) {
                if (!isBindEventOnly) {
                    var colCount = tableObject.getColCount();
                    this._createEquationDataForNewColumn(tableObject);
                    this._getEquationDataUsingCid(tableObject.getCellAt(1, tableObject.getColCount()).attr('data-equation-cid')).colDisabled = true;
                    $list.find('textarea').blur();
                    tableObject.getCellAt(1, colCount).find('textarea').focus();
                    $list.find('.mathquill-editable').off('mousedown.triggerHideHandler', this._graphingToolView._hideHandler, this._graphingToolView)
                        .on('mousedown.triggerHideHandler', _.bind(this._graphingToolView._hideHandler, this._graphingToolView));
                    tableObject._addRightHiddenIcon(colCount, true);
                }
                tableObject.$('.next-column-hidden-icon-container,.prev-column-hidden-icon-container').off('click')
                    .on('click', _.bind(this._showHiddenColumns, this));
            }, this)).on('column:deleted', _.bind(function() {
                var colCount = tableObject.getPreviousVisibleColumn(tableObject.getColCount() + 1, true);
                if (colCount !== 1) {
                    this._deleteTableColumn($list, tableObject, colCount, true);
                    tableObject.getCellAt(1, colCount - 1).find('textarea').focus();
                } else {
                    this.model.trigger('hidden-col-delete');
                }
                if (this._graphingToolView.isAccDivPresent($list.find('#list-data-container-of-' + $list.attr('id')))) {
                    this.accManagerView.updateFocusRect($list.attr('id'));
                    this.accManagerView.updateFocusRect('list-data-container-of-' + $list.attr('id'));
                }
            }, this)).on('cell:focussed', _.bind(function(cellId) {
                this._graphingToolView._hidePopUps();
                this._graphingToolView._updateListBoxHeight(false);
                this._focusTableConstants(tableObject);
                this._graphingToolView.openKeyboard();
                if (typeof cellId !== 'undefined') {
                    this._adjustListPosition($list, tableObject.$("[data-cell-id=" + cellId + "]"));
                }
                $list.find('.equation-box-container, .slider-text-holder').removeAttr('style');
                tableObject.$('.function-option-container').hide();
            }, this)).on('row:max', _.bind(function(focusElementId) {
                this.model.trigger('max-row-alert', 'new-row-button-of-' + focusElementId);
                return void 0;
            }, this)).on('column:max', _.bind(function(focusElementId) {
                this.model.trigger('max-col-alert', 'new-col-button-of-' + focusElementId);
                return void 0;
            }, this)).on('row:min', _.bind(function(focusElementId) {
                this.model.trigger('min-row-delete-alert', 'remove-row-button-of-' + focusElementId);
                return void 0;
            }, this)).on('column:min', _.bind(function(focusElementId) {
                this.model.trigger('min-col-delete-alert', 'remove-col-button-of-' + focusElementId);
                return void 0;
            }, this)).on('chart:max', _.bind(function(chartName) {
                tableObject.deselectChartButton(chartName);
                this.model.trigger('max-chart-alert');
                return void 0;
            })).on('histogram-calculation-error', _.bind(function() {
                var chartName = 'histogram';
                tableObject.deselectChartButton(chartName);
                this.model.trigger('chart-calc-error');
                return void 0;
            }, this)).on('box-calculation-error', _.bind(function() {
                var chartName = 'box';
                tableObject.deselectChartButton(chartName);
                this.model.trigger('box-chart-error', tableObject.$('.common-chart-button').attr('id'));
                return void 0;
            }, this)).on('no-valid-data-for-box', _.bind(function() {
                var chartName = 'box';
                tableObject.deselectChartButton(chartName);
                this.model.trigger('invalid-set-of-data');
                return void 0;
            }, this)).on('function-option-btn-clicked', _.bind(function(colNo) {
                this._tableFunctionLabelChange(tableObject, colNo);
            }, this)).on('hide-table-graph', _.bind(function() {
                this._hideTableGraph($list, tableObject);
            }, this)).on('show-table-graph', _.bind(function() {
                this._showTableGraph($list, tableObject);
            }, this)).on('row-header-changed', _.bind(function() {
                this._rowHeaderChanged(tableObject);
            }, this)).on('function-label-tab', _.bind(function(event, cellIdToFocus) {
                var eventType = this.isEventTabOrShiftTab(event);
                if (eventType.isTab) {
                    event.preventDefault();
                    tableObject.$el.find('.function-option-container').hide();
                    this.accManagerView.setFocus(cellIdToFocus, 10);
                }
            }, this)).on('function-shift-tab', _.bind(function(event, functionBtn) {
                var eventType = this.isEventTabOrShiftTab(event);
                if (eventType.isShiftTab) {
                    event.preventDefault();
                    tableObject.$el.find('.function-option-container').hide();
                    this.accManagerView.setFocus(functionBtn.attr('id'), 10);
                }
            }, this)).on('hide-other-chart-buttons', _.bind(function() {
                this._hideAllChartButtons();
            }, this));
            $list.find('.mathquill-editable').off('mousedown.triggerHideHandler')
                .on('mousedown.triggerHideHandler', _.bind(this._graphingToolView._hideHandler, this._graphingToolView));
            tableViews = this.model.get('tableViews');
            tableViews.push(tableObject);
            this.model.set('tableViews', tableViews);
            $list.attr('data-table-view-cid', tableObject.cid);
            this._chartManagerView.trigger('table-created', tableObject);
            this._hideFadeoutElement($list);
            this.TouchSimulator.enableTouch($list.find('.show-hide-equation-container'), {
                "specificEvents": this.TouchSimulator.SPECIFIC_EVENTS.TAP
            });
            this.TouchSimulator.enableTouch($list.find('.delete-list-container'), {
                "specificEvents": this.TouchSimulator.SPECIFIC_EVENTS.TAP
            });
            return $list;
        },
        "_focusTableConstants": function(tableObject) {
            var $table = tableObject.$el,
                $cells = $table.find('.cell[data-cell-definition]'),
                constants = [],
                noOfCells = $cells.length,
                $currentCell,
                $list,
                handleNumber,
                cellCounter;
            $list = $table.parents('.list');
            handleNumber = $list.find('.list-handle').attr('data-handle-number');
            for (cellCounter = 0; cellCounter < noOfCells; cellCounter++) {
                $currentCell = $cells.eq(cellCounter);
                constants = constants.concat(JSON.parse($currentCell.attr('data-cell-definition')));
            }
            this._sliderPanel.focusSliders(constants, handleNumber);
        },
        "_addExtraColumnsToTable": function(obj, tableView, chartName, colNo) {
            var columnNo, col = [],
                noOfRows,
                count,
                colCount,
                $newRow,
                dataRangeLength,
                rowNo,
                newRowLength,
                $headerRow,
                currentRow,
                rowHeaderStatus,
                dataCount,
                headerCounter,
                length,
                colContent = [],
                row = [],
                $list = $(tableView.el).parents('.list'),
                $equationBox = $list.find('.equation-box'),
                $cell,
                dataLength;
            $headerRow = tableView.getRow(1);
            rowHeaderStatus = tableView.getRowHeaderState();
            if (chartName !== 'box') {
                dataLength = $headerRow.length;
                for (count = 0; count < dataLength; count++) {
                    currentRow = $headerRow.eq(count);
                    if (currentRow.hasClass('chart-data-col')) {
                        columnNo = currentRow.attr('data-column');
                        columnNo = Number(columnNo.split('col')[1]);
                        col.push(columnNo);
                    }
                }
                if (chartName === 'dot') {
                    columnNo = col[0];
                } else {
                    columnNo = col[1];
                }
                if (colNo) {
                    columnNo = colNo;
                }
                noOfRows = tableView.getRowCount() - 1;
                length = obj.data.length;
                if (chartName === 'histogram') {
                    dataRangeLength = obj.data[0].length;
                    if (noOfRows < dataRangeLength) {
                        for (count = 0; count < dataRangeLength - noOfRows; count++) {
                            $newRow = tableView.insertRowAfter(noOfRows + count + 1, true, true);
                        }
                    }
                }
                for (dataCount = 0; dataCount < length; dataCount++) {
                    dataLength = obj.data[dataCount].length;
                    if (dataLength < noOfRows) {
                        for (count = noOfRows - dataLength; count >= 0; count--) {
                            obj.data[dataCount].push('');
                        }
                    }
                    this.addTableChartColumn({
                        "tableView": tableView,
                        "columnNo": ++columnNo,
                        "colContent": obj.data[dataCount],
                        "headerContent": obj.headers[dataCount],
                        "columnName": chartName
                    });
                    this._updateListWidth($equationBox.width());
                }
            } else if (obj.data.length > 0) {
                $headerRow = tableView.getHeaders();
                tableView.model.set('boxAndWhiskerSummary', obj.data);
                rowNo = tableView.getRowCount();
                dataLength = tableView.getColCount();
                newRowLength = obj.data[0].length;
                $cell = $(tableView.el).find('.cell-focus-border');
                for (count = 0; count < newRowLength; count++) {
                    $newRow = tableView.insertRowAfter(rowNo + count, true, true);
                    $newRow.attr('data-ignore-row', true);
                    $newRow.children().attr('data-ignore-cell', true);
                }
                row = tableView.getRow(rowNo + 1);
                $(row).addClass('chart-data-seperator');
                length = $headerRow.length;
                for (count = 0, colCount = 0; count < dataLength; count++) {
                    if (obj.ignoreCol.indexOf(count) === -1) {
                        if (rowHeaderStatus === true) {
                            headerCounter = 1;
                            dataCount = count;
                        } else {
                            headerCounter = 0;
                            dataCount = count;
                        }
                        for (; headerCounter < length; headerCounter++) {
                            if ($headerRow[headerCounter] === obj.headers[count]) {
                                colContent = tableView.getColumnContent(headerCounter + 1);
                                colContent = colContent.concat(obj.data[colCount]);
                                colCount++;
                                tableView.setColumnContent(count + 1, colContent, {
                                    'solution': true
                                }, rowNo);
                                break;
                            }
                        }
                    }
                }
                length = newRowLength + rowNo;
                for (count = rowNo + 1; count <= length; count++) {
                    tableView.disableAllCellsInRow(count);
                }
                $cell.find('textarea').focus();
            }
        },
        "addTableChartColumn": function(options) {
            var tableView = options.tableView,
                columnNo = options.columnNo,
                colContent = options.colContent,
                headerContent = options.headerContent,
                columnName = options.columnName,
                isUpdate = options.isUpdate,
                $header,
                points,
                MathHelper = MathUtilities.Components.Utils.Models.MathHelper,
                columnEquationData = this._getEquationDataUsingCid(tableView._getColumnCid(columnNo)),
                $list,
                xData = options.xData,
                plotEquationData,
                _equationDataManager = this.model.get('_equationDataManager'),
                modelTable = tableView.model,
                residualColumnCount = modelTable.get('residualColumnCount'),
                tableContents = modelTable.get('tableContents'),
                ySolution, $column, Chart = MathUtilities.Components.GraphChart.Models.Chart,
                xCoord, rowCounter, totalRows, yCoord, leftVal, rightVal,
                PRECISION = this.model.get("precision"),
                color;

            if (isUpdate) {
                $header = $(tableView.getCellAt(1, columnNo));
                $list = $header.parents('.list');
                this.clearColumnData(columnNo, $list);
            } else {
                tableView.newCol(false, columnNo);
                $header = $(tableView.getCellAt(1, columnNo));
                $header.find('.function-btn').hide();
                residualColumnCount++;
            }
            $header.attr({
                "data-ignore-column": true,
                "data-column-name": columnName
            });
            if (colContent.length > 0) {
                tableView.setColumnContent(columnNo, colContent, {
                    "solution": true
                });
            }
            columnEquationData = options.residualEquationData && !$.isEmptyObject(options.residualEquationData) ?
                options.residualEquationData : this._createEquationDataForColumn($header, tableView);
            if (!options.isHeaderUpadate || options.isHeaderUpadate === void 0) {
                tableView.setCellContent($header, headerContent, false, true);
                $header.attr({
                    "data-prev-latex": options.headerContent
                });
                columnEquationData.setLatex(options.headerContent, true);
            }
            if (options.residualEquationLatex) {
                tableView.setCellContent($header, options.residualEquationLatex, false, true);
                columnEquationData.setLatex(options.residualEquationLatex);
            }
            plotEquationData = columnEquationData.getPlot();
            if (colContent.length === 0) {
                columnEquationData.setConstants(_equationDataManager.getConstants());
                columnEquationData.setCustomFunctions(_equationDataManager.get('_parseFunctions'));
                columnEquationData.setFunctions(_equationDataManager.get('_parseFunctionsEngine'));
                _equationDataManager.parseEquation(columnEquationData, true);
                totalRows = xData.length;
                $column = tableView.getColumn(columnNo);

                for (rowCounter = 0; rowCounter <= totalRows; rowCounter++) {
                    xCoord = xData[rowCounter];
                    // if xCoord is not defined or blank set y as blank else solve
                    if (xCoord === '' || xCoord === void 0) {
                        yCoord = '';
                        leftVal = columnEquationData.getLeftInequalityRoot().value;
                        rightVal = this._solvelatex(columnEquationData.getRightInequalityRoot().value);
                        // since x=4 y=6 is considered as constant
                        if ((leftVal === 'x' || leftVal === 'y') && rightVal && !isNaN(rightVal)) {
                            yCoord = MathHelper._convertDisplayToAppliedPrecisionForm(rightVal, PRECISION);
                            ySolution = rightVal;
                        }
                    } else {
                        xCoord = Number(xCoord);
                        ySolution = this._getSolution(columnEquationData, xCoord);
                        yCoord = MathHelper._convertDisplayToAppliedPrecisionForm(ySolution, PRECISION);
                    }
                    if ($column.eq(rowCounter + 1).length > 0) {
                        tableView.setCellContent($column.eq(rowCounter + 1), yCoord, ySolution, true);
                    }
                }
            }
            points = this.model._updateInvalidPoints(tableView.getMultipleColContent(columnNo, true));
            if (columnEquationData.getStyleType() !== 'line' && plotEquationData.getPointVisibility() && modelTable.get("showTable")) {
                this.checkIfChangeInPoint(plotEquationData.getPoints(), points.slice());
            }
            plotEquationData.setPoints(points);
            _equationDataManager.drawPoint(columnEquationData.getPlot());
            this._setTableEquationData(columnEquationData, $header);
            this._updateWarningForCell($header, {
                "hasError": false,
                "errorCode": '',
                "equationData": columnEquationData,
                "cid": tableView.cid
            });
            if (headerContent === " Residual") {
                tableView.changeLabelOfFunctionOption(columnNo, "L");
                tableView.disableCell($header);
                $header.find('.mathquill-rendered-math').off('mousedown');
                columnEquationData.setBlind(true);
                columnEquationData.setResidualType("residual");
                $header.find(".handler-warning").removeClass('table-error');
            }
            $header.find('.mathquill-rendered-math .text').addClass('label-cell-italicized-function');
            tableView.disableAllCellsInColumn(columnNo);
            color = tableView.getColumnColor(columnNo - 1);
            tableView.setColumnColor(columnNo, color);
            modelTable.set('residualColumnCount', residualColumnCount);
            colContent.splice(0, 0, 'removable column');
            tableContents.splice(columnNo - 1, 0, colContent);
            modelTable.set('tableContents', tableContents);
            tableView.$('.next-column-hidden-icon-container, .prev-column-hidden-icon-container').off('click')
                .on('click', _.bind(this._showHiddenColumns, this));
            if (tableView.model.get('plotColumnHidden').indexOf(tableView._getColumnCid(columnNo)) > -1) {
                this._updatePlotColumnOption(columnEquationData, tableView.getColumn(columnNo));
            }
        },
        "_tableFunctionLabelChange": function(tableView, colNo, isUndoRedoAction) {
            var undoRedoData = {},
                undo = {},
                redo = {},
                $cell,
                targetCid;
            if (!isUndoRedoAction) {
                $cell = tableView.getCellAt(1, colNo);
                targetCid = $cell.attr('data-equation-cid');
                undoRedoData.undo = undo;
                undoRedoData.redo = redo;
                undo.target = targetCid;
                redo.target = targetCid;
                undo.colNo = colNo;
                redo.colNo = colNo;
                this.execute('tableFunctionLabelChange', undoRedoData);
            }
            this._parseTable(tableView.getCellAt(1, colNo), tableView, true);
        },
        "_rowHeaderChanged": function(tableView, isUndoRedoAction) {
            var undoRedoData = {},
                undo = {},
                redo = {},
                $cell,
                targetCid;
            if (isUndoRedoAction !== true) {
                $cell = tableView.getCellAt(1, 1);
                targetCid = $cell.attr('data-equation-cid');
                undoRedoData.undo = undo;
                undoRedoData.redo = redo;
                undo.target = targetCid;
                redo.target = targetCid;
                this.execute('tableRowHeaderChange', undoRedoData);
            }
            this._resetColumnCellSolution(1, tableView);
            this._resetTableCellSolution(tableView);
            tableView.trigger('update-hidden-series', tableView.model.get('rowHeaderChecked'));
            this._parseTable(tableView.getCellAt(1, 1), tableView, true);
        },
        "copyTableData": function($currList) {
            var tableData = this._getTableContent($currList),
                $list,
                tableView,
                dataArr = tableData.content,
                copyTableDataObj = {
                    "tableData": tableData,
                    "currentList": $currList
                },
                loopVar1,
                loopVar2,
                colNumber,
                rowData,
                options,
                dummyEvent,
                $cell;
            options = this._addTableList(tableData.rows, tableData.cols, copyTableDataObj);
            $list = options.list;
            tableView = this._getTableViewObject($list);
            $list.find('.show-hide-equation-container').show();
            for (loopVar1 = 0; loopVar1 < dataArr.length; loopVar1++) {
                rowData = dataArr[loopVar1];
                for (loopVar2 = 0; loopVar2 < rowData.length; loopVar2++) {
                    colNumber = loopVar2 + 1;
                    $cell = tableView.getCellAt(loopVar1 + 1, colNumber);
                    tableView.setCellContent($cell, rowData[loopVar2], false, true);
                    $cell.attr('data-prev-latex', rowData[loopVar2]);
                    if (colNumber !== 1) {
                        tableView.changeLabelOfFunctionOption(colNumber, tableData.functionLabelOptions[colNumber]);
                    } else {
                        $list.attr('data-equation-cid', $cell.attr('data-equation-cid'));
                    }
                }
            }
            this._resetTableCellSolution(tableView);
            $cell = tableView.getCellAt(1, 1);
            this._parseTable($cell, tableView, true, true);
            tableView.setCopyBtnContainerWidth();
            options.undoredo.redo.tableState = this._getTableContent($list, tableView);
            this.execute('addTable', options.undoredo);
            this.accManagerView.unloadScreen($currList.attr('id'));
            this._addTableElementsToAccOnCopy(tableView);
            this.accManagerView.updateFocusRect($list.attr('id'));
            dummyEvent = $.Event("keydown"); // trigger keydown event
            dummyEvent.keyCode = 32;
            dummyEvent.isCustomEvent = true;
            $list.trigger(dummyEvent);
            $list.find("#2-1-of-" + $list.attr('data-table-view-cid') + " textarea").focus(10);
            this._updateListWidth($list.find('.equation-box').outerWidth(), $list.attr('data-equation-cid'));
            this._adjustTableHeaderHeightForIE(tableView);
        },
        "_addTableElementsToAccOnCopy": function(tableView) {
            var index = 1,
                rows = tableView.getRowCount(),
                colCounter = tableView.getColCount();
            for (; index <= rows; index++) {
                tableView.trigger('row-add-acc', tableView.cid, colCounter, index);
            }
            index = 3;
            for (; index <= colCounter; index++) {
                tableView.trigger('col-add-acc', tableView.cid, 1, index);
            }
        },
        "includeShowScroll": function() {
            this.$('#input-data').removeClass('input-data-scroll-hidden');
        },
        "includeHideScroll": function() {
            this._sliderPanel.hideKeyboard();
            this.$('#input-data').addClass('input-data-scroll-hidden');
        },
        /**
         * _equationDataForTableColumn sets equation data for columns of table
         * @method _equationDataForTableColumn
         * @param $list {Object} jQuery div object
         */
        "_equationDataForTableColumn": function($list) {
            var headerRow = $list.find("[data-row-id=row1]"),
                headers = headerRow.children(),
                headerCounter,
                equationData,
                tableView = this._getTableViewObject($list),
                equationDataArray = [],
                noOfHeaders = headers.length - 1;
            for (headerCounter = 0; headerCounter < noOfHeaders; headerCounter++) {
                equationData = this._createEquationDataForColumn(headers.eq(headerCounter), tableView);
                tableView.setColumnColor(headerCounter, equationData.getColor());
                equationDataArray.push(equationData);
                if (headerCounter === 0) {
                    $list.attr('data-equation-cid', equationData.getCid());
                    equationData.setCurveVisibility(false);
                }
            }
            return equationDataArray;
        },
        /**
         * creates equation data for table column
         * @method _createEquationDataForColumn
         * @param $columnHeader {Object} jQuery object of column header
         * @param tableView {Object} Backbone view object for which column is created
         * @return void
         */
        "_createEquationDataForColumn": function($columnHeader, tableView) {
            var equationData, THICKNESS = 3,
                PROJECTOR_THICKNESS = 7,
                DRAG_HIT_THICKNESS = 20,
                PROCESSING_INSTRUCTIONS = 11,
                _equationDataManager = this.model.get('_equationDataManager'),
                columnNo = Number($columnHeader.attr('id').split('-')[1]),
                plotEquationData;
            equationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
            equationData.setTableName(tableView.tableCounter);
            plotEquationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
            $columnHeader.attr('data-equation-cid', equationData.getCid());
            equationData.setColor(this.model.generateRandomColorCode(), true);
            plotEquationData.setColor(equationData.getColor());
            if (this._projectorMode === true) {
                equationData.setThickness(PROJECTOR_THICKNESS, true);
                equationData.setPreviousThickness(THICKNESS);
                plotEquationData.setThickness(equationData.getThickness(), true);
                plotEquationData.setPreviousThickness(THICKNESS);
            } else {
                equationData.setThickness(THICKNESS, true);
                plotEquationData.setThickness(equationData.getThickness());
                plotEquationData.setExtraThickness(true);
                plotEquationData.setDragHitThickness(DRAG_HIT_THICKNESS);
            }
            equationData.setPlotInEqualities(false);
            equationData.getDirectives().FDFlagMethod = 'graphing';
            plotEquationData.getDirectives().FDFlagMethod = 'graphing';
            equationData.getDirectives().processingInstructions = PROCESSING_INSTRUCTIONS;
            plotEquationData.getDirectives().processingInstructions = PROCESSING_INSTRUCTIONS;
            equationData.setLatex('', true);
            plotEquationData.setLatex('', true);
            equationData.setStyleType('points');
            tableView.setColumnColor(columnNo - 1, equationData.getColor());
            equationData.setVisible({
                "curve": true,
                "point": false
            });
            plotEquationData.setVisible({
                "curve": false,
                "point": true
            });
            equationData.setPlot(plotEquationData);
            equationData.colDisabled = false;
            equationData.setIsTableEquation(true);
            equationData.off('plotComplete').on('plotComplete', _.bind(this.updatePaperItems, this, false, 'table-element'));
            _equationDataManager.addEquation(equationData);
            _equationDataManager.addPlotEquation(equationData);
            _equationDataManager.addPlotEquation(plotEquationData);
            this._adjustTableHeaderHeightForIE(tableView);
            return equationData;
        },
        /**
         * creates equation data for new table column
         * @method _createEquationDataForNewColumn
         * @param {Object} table view object
         * @return void
         */
        "_createEquationDataForNewColumn": function(tableView) {
            var $currentColumn = tableView.$("[data-row-id=row1]").find('.cell').last(),
                cellColumnNo,
                equationData,
                undoData = {},
                redoData = {},
                firstCellCid,
                $newCell,
                $list;
            cellColumnNo = Number($currentColumn.attr('id').split('-')[1]);
            $newCell = tableView.getCellAt(1, cellColumnNo);
            this._createEquationDataForColumn($newCell, tableView);
            equationData = this._getEquationDataUsingCid($currentColumn.attr('data-equation-cid'));
            $list = $currentColumn.parents('.list');
            $list.find('.mathquill-editable-size')
                .off('mousedown', _.bind(this._graphingToolView._hideHandler, this._graphingToolView))
                .on('mousedown', _.bind(this._graphingToolView._hideHandler, this._graphingToolView));
            undoData.actionType = 'deleteColumn';
            undoData.equationData = equationData;
            undoData.colNo = cellColumnNo;
            firstCellCid = $currentColumn.siblings('[data-cell-id=1-1]').attr('data-equation-cid');
            redoData.colNo = cellColumnNo;
            redoData.firstCellCid = firstCellCid;
            redoData.equationData = equationData;
            redoData.actionType = 'addColumn';
            redoData.functionOption = tableView.getLabelOfFunctionOption(cellColumnNo);
            if (this.registerUndoRedo) {
                this.execute('addTableColumn', {
                    "undo": undoData,
                    "redo": redoData
                });
            }
        },
        /**
         * _addTableRow registers event on table row addition
         * @method _addTableRow
         * @param event {Object}
         * @return void
         */
        "_addTableRow": function(event) {
            var undoData = {},
                redoData = {},
                $list,
                index,
                tableView,
                tableState;
            $list = $(event.target).parents('.list');
            tableView = this._getTableViewObject($list);
            tableView._addRow(event);
            tableState = this._getTableContent($list, tableView);
            undoData.actionType = 'deleteRow';
            index = parseInt($list.find('.handler-number').text(), 10);
            undoData.listIndex = index;
            redoData.listIndex = index;
            redoData.rowNo = tableState.rows - 1;
            redoData.columnNo = tableState.cols;
            undoData.rowNo = tableState.rows;
            redoData.actionType = 'addRow';
            this.execute('addTableRow', {
                "undo": undoData,
                "redo": redoData
            });
        },
        /**
         * _addTableList creates and adds table list to box
         * @method _addTableList
         */
        "_addTableList": function(rows, cols, copyTableData) {
            var $list,
                tableObject,
                headers,
                cell21,
                dummyEvent,
                cell11, tableCounter,
                cell12,
                tableRows = 2,
                tableCols = 2,
                $lastFocusedMathquill = this.model.get('cursorClassTag'),
                $lastFocusedList = $lastFocusedMathquill.parents('.list'),
                undoData = {},
                redoData = {},
                tableView,
                $listBox,
                listCounter,
                equationData,
                $mathquillCursor;
            $lastFocusedList = this.$('.list-focus');
            $listBox = this.$('#list-box');
            this._blurMathquill(this.$('.hasCursor'));
            this._blurMathquill($lastFocusedMathquill);
            this._blurListBox(this._getMappedEquationData($lastFocusedList), $lastFocusedList);
            if (rows && cols) {
                tableRows = rows;
                tableCols = cols;
            }
            if ($lastFocusedList.length > 1) {
                for (listCounter = 0; listCounter < $lastFocusedList.length; listCounter++) {
                    if ($lastFocusedList.eq(listCounter).attr('data-type') === 'table') {
                        $lastFocusedList.splice(listCounter);
                    }
                }
            }
            if ($lastFocusedList.attr('data-type') !== 'table') {
                if ($lastFocusedList.find('.mathquill-editable').mathquill('latex') === '') {
                    $list = this._createTableList(tableRows, tableCols, $lastFocusedList);
                    undoData.focusedListEquationData = this._getListData($lastFocusedList);
                    redoData.removeList = $lastFocusedList.index() === 0;
                    undoData.removeList = false;
                } else {
                    redoData.removeList = false;
                    $list = this._createTableList(tableRows, tableCols);
                    this.$('#list-box').prepend($list);
                    undoData.removeList = true;
                }
            } else {
                $list = this._createTableList(tableRows, tableCols);
                if (copyTableData) {
                    undoData.copyTable = true;
                    copyTableData.currentList.after($list);
                } else {
                    $listBox.prepend($list);
                }
                redoData.removeList = false;
                undoData.removeList = true;
            }


            $list.find('.show-hide-equation-container').show();
            $listBox.find('.list-handle').removeClass('warning-list-focus').find('.list-drag').show();
            $listBox.find('.equation-box').removeClass('equation-box-focus');
            $list.find('.list-handle').addClass('warning-list-focus').removeClass('list-sortable');
            $list.find('.equation-box').addClass('equation-box-focus');
            $list.addClass('list-focus');
            $list.find('.list-drag').hide();
            $mathquillCursor = this.$('.mathquill-editable .cursor');
            this.model.set({
                "tableCursorClassPrev": $mathquillCursor.prev(),
                "tableCursorClassNext": $mathquillCursor.next()
            });
            tableObject = this._getTableViewObject($list);
            this._createAccDivForList($list, true, tableObject);
            tableCounter = tableObject.tableCounter;
            undoData.tableNumber = tableCounter;
            redoData.tableNumber = tableCounter;
            headers = ['x', 'y'];
            tableObject.setHeader(headers);
            cell21 = tableObject.getCellAt(2, 1);
            cell11 = tableObject.getCellAt(1, 1);

            cell21.attr('data-prev-latex', '');
            cell11.attr('data-prev-latex', 'x');

            this._equationDataForTableColumn($list);
            this._updateHandles();
            equationData = this._getEquationDataUsingCid(cell11.attr('data-equation-cid'));
            equationData.setLatex('x', true);
            equationData.setCurveVisibility(false);
            this._updateWarningForCell(cell11, {
                "hasError": false,
                "cid": tableObject.cid
            });

            this._updateWarningForCell(cell21, {
                "hasError": false,
                "cid": tableObject.cid
            });
            if (tableCols !== 1) {
                cell12 = tableObject.getCellAt(1, 2);
                cell12.attr('data-prev-latex', 'y');
                equationData = this._getEquationDataUsingCid(cell12.attr('data-equation-cid'));
                equationData.setCanBeSolved(true);
                equationData.setLatex('y', true);
                this._updateWarningForCell(cell12, {
                    "hasError": false,
                    "cid": tableObject.cid
                });
                this._updateWarningForCell(tableObject.getCellAt(2, 2), {
                    "hasError": false,
                    "cid": tableObject.cid
                });
            }
            tableView = this._getTableViewObject($list);
            undoData.actionType = 'deleteTable';
            redoData.actionType = 'addTable';
            this.model.set('cursorClassTag', cell21.find('.mathquill-editable'));
            //*get index of list*/
            if ($list.prev().length === 0) {
                redoData.index = undoData.index = 1;
            } else {
                redoData.index = undoData.index = parseInt($list.prev().find('.handler-number').text(), 10) + 1;
            }
            undoData.target = $list.prev().attr('data-equation-cid');
            redoData.target = $list.prev().attr('data-equation-cid');
            if (!copyTableData) {
                redoData.tableState = this._getTableContent($list, tableView);
            }
            redoData.equationData = this._getTableEquationData(tableView);
            if (!copyTableData) {
                this.execute('addTable', {
                    "undo": undoData,
                    "redo": redoData
                });
            }
            $list.attr('data-equation-cid', $list.find('[data-cell-id=1-1]').attr('data-equation-cid'));
            this._detachHoverEffect($list);
            this._updateListWidth();
            if (copyTableData) {
                return {
                    "list": $list,
                    "undoredo": {
                        "undo": undoData,
                        "redo": redoData
                    }
                };
            }
            this.accManagerView.updateFocusRect($list.attr('id'));
            $list.find('textarea').attr('tabindex', -1);
            dummyEvent = $.Event("keydown"); // trigger keydown event
            dummyEvent.keyCode = 32; //space key
            dummyEvent.isCustomEvent = true;
            $list.trigger(dummyEvent);
            $list.find("#2-1-of-" + $list.attr('data-table-view-cid') + " textarea").focus(10);
        },
        "_getMappedBaseChartModel": function(equationCid) {
            var mappedObj = this.model.get('chartTableMapping'),
                modelCid = mappedObj[equationCid],
                baseModel = this._getBaseChartModelFromCollection(modelCid);
            return baseModel;
        },
        "_getBaseChartModelFromCollection": function(cid) {
            return this.model.get('baseChartModelCollection').get(cid);
        },
        /**
         * _keyDownOnTable handles actions on key events on equation editors of table
         * @method _keyDownOnTable
         * @param event {Object} event object
         * @return void
         */
        "_keyDownOnTable": function(event) {
            var keyCode = event.keyCode,
                $targetCell = $(event.target).parents('.cell'),
                prevLatex = $targetCell.attr('data-prev-latex'),
                targetId = $targetCell.attr('id'),
                rowColumnNo = targetId.split('-'),
                rowNo = Number(rowColumnNo[0]),
                columnNo = Number(rowColumnNo[1]),
                $targetTableBox = $targetCell.parents('.equation-box'),
                $list = $targetTableBox.parents('.list'),
                tableView = this._getTableViewObject($list),
                tableRows = tableView.getRowCount(),
                tableColumns = tableView.getColCount(),
                EquationPanel = MathUtilities.Tools.Graphing.Models.EquationPanel,
                ENTER_KEY = EquationPanel.ENTER_KEY,
                BACKSPACE_KEY = EquationPanel.BACKSPACE_KEY,
                DOWN_ARROW_KEY = EquationPanel.DOWN_ARROW_KEY,
                UP_ARROW_KEY = EquationPanel.UP_ARROW_KEY,
                LEFT_ARROW_KEY = EquationPanel.LEFT_ARROW_KEY,
                RIGHT_ARROW_KEY = EquationPanel.RIGHT_ARROW_KEY,
                cellIdToFocus,
                hasAlert = false,
                listToFocus,
                tableCursorClassPrev = this.model.get('tableCursorClassPrev'),
                tableCursorClassNext = this.model.get('tableCursorClassNext'),
                cursorClassTag = this.model.get('cursorClassTag'),
                currentCursor = this.$('.outerDiv .hasCursor'),
                undoData = {},
                redoData = {},
                index,
                minColNo,
                equationData,
                cellToFocus,
                latex,
                $row,
                keyBoardTitlePosition = this._graphingToolView.$('#keyboard-title-container').offset(),
                manualScrollRange = {
                    "min": keyBoardTitlePosition.top - 50, // To add a tolerance around the keyboard title
                    "max": keyBoardTitlePosition.top + 50
                },
                SCROLL_BY = 80,
                currentScrollValue, rowCount = tableRows,
                $inputBox, colCount = tableColumns,
                parentPosition,
                accManagerView = this.accManagerView,
                eventType = this.isEventTabOrShiftTab(event),
                $handleWarning, $functionBtn,
                cursorClassToSave;
            this._focusOnList($list, true);
            cursorClassTag = this._getEditableHasCursor(cursorClassTag);
            currentCursor = this._getEditableHasCursor(currentCursor);
            latex = $targetCell.find('.mathquill-editable').mathquill('latex');
            parentPosition = $targetCell.offset();
            $list.find('.equation-box-container, .slider-text-holder').removeAttr('style');
            if ($list.find('.list-header-container').hasClass('collapse')) {
                this._toggleList($list);
            }
            if (latex !== '' && (prevLatex === void 0 || prevLatex === '')) {
                this._parseTable($targetCell, tableView, false);
            }
            this._updateListWidth($list.find('.equation-box').outerWidth(), $list.attr('data-equation-cid'));
            // for textbox behind keyboard title
            if (parentPosition.top > manualScrollRange.min && parentPosition.top < manualScrollRange.max) {
                $inputBox = this.$('#input-data');
                currentScrollValue = $inputBox.scrollTop();
                $inputBox.scrollTop(currentScrollValue + SCROLL_BY);
            }
            switch (keyCode) {
                case ENTER_KEY:
                    if (!event.shiftKey) {
                        if (latex !== prevLatex) {
                            this._parseTable($targetCell, tableView, false);
                        }
                        tableView.insertRowAfter(rowNo, false, true);
                        if (!this.isRowFullyBlank(tableView.$('#row' + rowNo + '-of-' + tableView.cid))) {
                            tableView.trigger('data-changed', columnNo);
                        }
                        rowCount = tableView.getRowCount();
                        undoData.actionType = 'deleteRow';
                        index = parseInt($list.find('.handler-number').text(), 10);
                        undoData.listIndex = index;
                        redoData.listIndex = index;
                        redoData.rowNo = rowNo;
                        redoData.columnNo = columnNo;
                        undoData.rowNo = rowNo + 1;
                        redoData.actionType = 'addRow';
                        this.execute('addTableRow', {
                            "undo": undoData,
                            "redo": redoData
                        });
                        $targetCell = tableView.getCellAt(rowNo + 1, columnNo);
                        _.delay(function() {
                            $targetCell.find('textarea').focus();
                        }, 5);
                    }
                    break;
                case DOWN_ARROW_KEY:
                    if (latex !== prevLatex) {
                        this._parseTable($targetCell, tableView, false);
                    }
                    if (cursorClassTag.attr('mathquill-block-id') === currentCursor.attr('mathquill-block-id')) {
                        if (event.openBracket !== true) {
                            if (rowNo === tableRows) {
                                $row = $targetTableBox.find('#row' + rowNo + '-of-' + tableView.cid);
                                if (this.isRowBlank($row)) {
                                    rowCount = 0;
                                    if ($list.next().length !== 0 && $list.next().find('textarea').length !== 0) {
                                        _.delay(function() {
                                            $targetCell.find('textarea').blur();
                                            $list.next().find('textarea').first().focus();
                                        }, 5);
                                    } else {
                                        $list = this._createListWithEditor();
                                        this.$('#list-box').append($list);
                                        $list = this._createEquationData($list);
                                        this._createAccDivForList($list, false);
                                        this._updateHandles();
                                        undoData = this._getListData($list);
                                        redoData = this._getListData($list);
                                        undoData.actionType = 'deleteList';
                                        undoData.target = redoData.target = $list.prev().attr('data-equation-cid');
                                        redoData.index = parseInt($list.prev().find('.handler-number').text(), 10) + 1;
                                        redoData.actionType = 'addList';
                                        this.execute('addList', {
                                            "undo": undoData,
                                            "redo": redoData
                                        });
                                        _.delay(function() {
                                            $targetCell.find('textarea').blur();
                                            $list.find('textarea').first().focus();
                                        }, 5);
                                    }
                                } else {
                                    $targetCell.find('textarea').blur();
                                    tableView.insertRowAfter(rowNo);
                                    rowCount = tableView.getRowCount();
                                    if (rowNo + 1 === rowCount) {
                                        undoData.actionType = 'deleteRow';
                                        index = parseInt($list.find('.handler-number').text(), 10);
                                        undoData.listIndex = index;
                                        redoData.listIndex = index;
                                        redoData.rowNo = rowNo;
                                        redoData.columnNo = columnNo;
                                        undoData.rowNo = rowNo + 1;
                                        redoData.actionType = 'addRow';
                                        this.execute('addTableRow', {
                                            "undo": undoData,
                                            "redo": redoData
                                        });
                                        setTimeout(function() {
                                            // On down arrow key we have to set focus on the next cell, whereas mathquill resets focus
                                            // on the textarea field on which keyup is triggered
                                            $targetCell.find('textarea').blur();
                                            rowNo = rowNo + 1;
                                            tableView.$("[data-cell-id=" + rowNo + "-1]").find('textarea').first().focus();
                                        }, 0);
                                    } else {
                                        rowCount = 0;
                                    }
                                }
                            } else {
                                rowNo++;
                                cellIdToFocus = rowNo + '-' + columnNo;
                                cellToFocus = $targetTableBox.find("[data-cell-id=" + cellIdToFocus + "]").find('textarea');
                                if (cellToFocus.length !== 0 && rowCount !== 0) {
                                    _.delay(_.bind(function() {
                                        // On down arrow key we have to set focus on the next cell, whereas mathquill resets focus
                                        // on the textarea field on which keyup is triggered
                                        $targetCell.find('textarea').blur();
                                        cellToFocus.focus();
                                        this._changePlotLatex();
                                    }, this), 5);
                                }
                            }
                        }
                    }
                    break;
                case UP_ARROW_KEY:
                    if (latex !== prevLatex) {
                        this._parseTable($targetCell, tableView, false);
                    }
                    if (cursorClassTag.attr('mathquill-block-id') === currentCursor.attr('mathquill-block-id')) {
                        if (rowNo === 1) {
                            listToFocus = $list.prev();
                            if ($list.prev().length !== 0) {
                                cellToFocus = $list.prev().find('textarea');
                                _.delay(_.bind(function() {
                                    $targetCell.find('textarea').blur();
                                    this._focusOnList(listToFocus);
                                }, this), 5);
                            }
                        } else {
                            rowNo--;
                            cellIdToFocus = rowNo + '-' + columnNo;
                            cellToFocus = $targetTableBox.find("[data-cell-id=" + cellIdToFocus + "]").find('textarea');
                            if (cellToFocus.length !== 0) {
                                _.delay(_.bind(function() {
                                    $targetCell.find('textarea').blur();
                                    cellToFocus.focus();
                                    this._changePlotLatex();
                                }, this), 5);
                            }
                        }
                    }
                    break;
                case LEFT_ARROW_KEY:
                    if (latex !== prevLatex) {
                        this._parseTable($targetCell, tableView, false);
                    }
                    if (cursorClassTag.attr('mathquill-block-id') === currentCursor.attr('mathquill-block-id')) {
                        if (tableCursorClassPrev.hasClass('textarea')) {
                            if (columnNo === 1) {
                                rowNo--;
                                columnNo = tableColumns;
                            } else {
                                columnNo = tableView.getPreviousVisibleColumn(columnNo);
                            }
                            cellIdToFocus = rowNo + '-' + columnNo;
                            cellToFocus = $targetTableBox.find("[data-cell-id=" + cellIdToFocus + "]").find('textarea');
                            if (rowNo !== 0 && cellToFocus.length !== 0) {
                                _.delay(function() {
                                    $targetCell.find('textarea').blur();
                                    cellToFocus.focus();
                                }, 5);
                            }
                        }
                    }
                    break;
                case RIGHT_ARROW_KEY:
                    if (latex !== prevLatex) {
                        this._parseTable($targetCell, tableView, false);
                    }
                    if (cursorClassTag.attr('mathquill-block-id') === currentCursor.attr('mathquill-block-id') && !event.rightArrow) {
                        if (tableCursorClassNext.length === 0) {
                            if (columnNo === tableColumns) {
                                if (rowNo === 1) {
                                    if (prevLatex === '' || typeof prevLatex === 'undefined') {
                                        rowNo++;
                                        columnNo = 1;
                                    } else {
                                        $targetCell.find('textarea').blur();
                                        colCount = tableView.getColCount();
                                        tableView.addCol();
                                        if (colCount !== tableView.getColCount()) {
                                            this._createEquationDataForNewColumn(tableView);
                                            tableView.disableAllCellsInColumn(tableView.getColCount());
                                            this._getEquationDataUsingCid(tableView.getCellAt(1, tableView.getColCount())
                                                .attr('data-equation-cid')).colDisabled = true;
                                            columnNo++;
                                        } else {
                                            colCount = 0;
                                        }
                                    }
                                } else {
                                    rowNo++;
                                    columnNo = 1;
                                }
                            } else {
                                columnNo = tableView.getNextVisibleColumn(columnNo);
                            }
                            cellIdToFocus = rowNo + '-' + columnNo;
                            cellToFocus = $targetTableBox.find("[data-cell-id=" + cellIdToFocus + "]").find('textarea');
                            if (rowNo <= tableRows && colCount !== 0 && cellToFocus.length !== 0) {
                                _.delay(function() {
                                    $targetCell.find('textarea').blur();
                                    cellToFocus.focus();
                                }, 5);
                            }
                        }
                    }
                    break;
                case BACKSPACE_KEY:
                    if (latex !== prevLatex) {
                        this._parseTable($targetCell, tableView, false);
                    }
                    equationData = this._getTableEquationData(tableView);
                    minColNo = 1;
                    if (prevLatex === '' || typeof prevLatex === 'undefined') {
                        if (columnNo === 1) {
                            // check added for issue with undo redo
                            if (rowNo !== 1 && tableRows > 2) {
                                hasAlert = true;
                                if (this.isRowBlank(tableView.$("[data-row-id=row" + rowNo + "]"))) {
                                    this._deleteTableRow($list, tableView, rowNo);
                                } else {
                                    this._graphingToolView._showCustomPopupForRowDelete($list, tableView, rowNo);
                                }
                            }
                            rowNo--;
                        } else {
                            if (rowNo === 1 && colCount > minColNo) {
                                if (tableView._isColumnBlank(columnNo)) {
                                    if (tableView.getCellAt(1, columnNo - 1) && !tableView.getCellAt(1, columnNo).attr('data-ignore-column')) {
                                        this._deleteTableColumn($list, tableView, columnNo);
                                        if (this._graphingToolView.isAccDivPresent($list.find('.list-data-container'))) {
                                            this.accManagerView.updateFocusRect($list.attr('id'));
                                            this.accManagerView.updateFocusRect('list-data-container-of-' + $list.attr('id'));
                                        }
                                    }
                                } else {
                                    hasAlert = true;
                                    this._graphingToolView._showCustomPopupForColumnDelete($list, tableView, columnNo);
                                }
                            }
                            columnNo--;
                        }
                        cellIdToFocus = rowNo + '-' + columnNo;
                        if (rowNo !== 0) {
                            cellToFocus = $targetTableBox.find("[data-cell-id=" + cellIdToFocus + "]").find('textarea');
                            if (!hasAlert) {
                                if (cellToFocus.length !== 0) {
                                    if ('ontouchstart' in window) {
                                        _.delay(function() {
                                            $targetCell.find('textarea').blur();
                                            cellToFocus.focus();
                                        }, 5);
                                    } else {
                                        _.delay(function() {
                                            $targetCell.find('textarea').blur();
                                            cellToFocus.focus();
                                        }, 5);
                                    }
                                } else {
                                    cellIdToFocus = rowNo + '-' + (columnNo - tableView.getIgnoreColumnCount());
                                    cellToFocus = $targetTableBox.find("[data-cell-id=" + cellIdToFocus + "]").find('textarea');
                                    $targetCell.find('textarea').blur();
                                    cellToFocus.focus();
                                }
                            }
                        } else {
                            this._graphingToolView._showCustomPopupForTableDelete($list, $targetCell, equationData);
                        }
                    }
                    break;
            }


            if (eventType.isTab) {
                event.preventDefault();
                if (tableCursorClassNext.length === 0) {
                    if (columnNo === tableColumns) {
                        rowNo++;
                        columnNo = 1;
                    } else {
                        columnNo = tableView.getNextVisibleColumn(columnNo);
                    }
                    cellIdToFocus = rowNo + '-' + columnNo;
                    cellToFocus = $targetTableBox.find("[data-cell-id=" + cellIdToFocus + "]").attr('id');
                    $handleWarning = $targetCell.find('.handler-warning');
                    $functionBtn = $targetCell.find('.function-btn');
                    if (rowNo <= tableRows && colCount !== 0 && cellToFocus) {
                        $targetCell.find('textarea').blur();
                        if (this._graphingToolView.isAccDivPresent($targetCell)) {
                            if ($handleWarning.css('display') === 'none' || $handleWarning.length === 0) {
                                if ($functionBtn.length === 0) {
                                    accManagerView.setFocus(cellToFocus);
                                } else {
                                    accManagerView.setFocus($functionBtn.attr('id'));
                                }
                            } else {
                                accManagerView.setFocus($handleWarning.attr('id'));
                            }
                        }
                    } else {
                        if (this._graphingToolView.isAccDivPresent(this.$('#new-row-button-of-' + tableView.cid))) {
                            accManagerView.setFocus('new-col-button-of-' + tableView.cid);
                        }
                    }
                }
            } else {
                if (eventType.isShiftTab) {
                    event.preventDefault();
                    if (columnNo === 1) {
                        rowNo--;
                        columnNo = tableColumns;
                    } else {
                        columnNo = tableView.getPreviousVisibleColumn(columnNo);
                    }
                    cellIdToFocus = rowNo + '-' + columnNo;
                    cellToFocus = $targetTableBox.find("[data-cell-id=" + cellIdToFocus + "]").attr('id');
                    if (rowNo !== 0 && cellToFocus.length !== 0) {
                        $targetCell.find('textarea').blur();
                        if (this._graphingToolView.isAccDivPresent($targetCell)) {
                            accManagerView.setFocus(cellToFocus);
                        }
                    } else {
                        if (this._graphingToolView.isAccDivPresent(this.$('#row-header-container-of-' + tableView.cid))) {
                            accManagerView.setFocus('row-header-container-of-' + tableView.cid);
                        }
                    }
                }
            }
            _.delay(_.bind(function() {
                var $cursor = this.$('.mathquill-editable .cursor');
                this.model.set('tableCursorClassPrev', $cursor.prev());
                this.model.set('tableCursorClassNext', $cursor.next());
                cursorClassToSave = this.$('.outerDiv .mathquill-editable .hasCursor');
                if (cursorClassToSave.length !== 0) {
                    this.model.set('cursorClassTag', cursorClassToSave);
                } else {
                    this.model.set('cursorClassTag', this.$('.outerDiv .mathquill-editable.hasCursor'));
                }
            }, this), 5);
        },
        //end of _keyDownOnTable
        "_deleteTable": function($list, $targetCell, equationData) {
            var tableContent = this._getTableContent($list),
                isFirst = false,
                listToFocus,
                index, $newList,
                undoData = {},
                redoData = {},
                chartData,
                tableView;
            if ($list.prev().length !== 0) {
                listToFocus = $list.prev();
                if ('ontouchstart' in window) {
                    _.delay(_.bind(function() {
                        $targetCell.find('textarea').blur();
                        this._focusOnList(listToFocus);
                    }, this), 10);
                } else {
                    $targetCell.find('textarea').blur();
                    this._focusOnList(listToFocus);
                }
            } else {
                $newList = this._createListWithEditor();
                isFirst = true;
                this._createEquationData($newList);
                this.$('#list-box').prepend($newList);
                this._createAccDivForList($newList, false);
                $newList.find('textarea').focus();
            }
            tableView = this._getTableViewObject($list);
            chartData = this._chartManagerView.getSelectedChartsFromTable(tableView, true, true);
            if ($list.siblings().length !== 0 && isFirst !== true) {
                undoData.tableState = tableContent;
                undoData.equationData = equationData;
                redoData.tableState = undoData.tableState;
                redoData.equationData = undoData.equationData;
                undoData.actionType = 'addTable';
                redoData.actionType = 'deleteTable';
                undoData.chartNames = this._chartManagerView.getSelectedChartsFromTable(tableView, void 0, true);
                undoData.chartData = chartData;
                redoData.chartData = chartData;
                redoData.chartNames = undoData.chartNames;
                undoData.target = $list.prev().attr('data-equation-cid');
                if ($list.prev().length === 0) {
                    undoData.index = 1;
                    redoData.index = 1;
                } else {
                    index = parseInt($list.prev().find('.handler-number').text(), 10) + 1;
                    undoData.index = index;
                    redoData.index = index;
                }
                redoData.target = $list.prev().attr('data-equation-cid');
                undoData.tableList = $list.attr('data-equation-cid');
                undoData.removeFirstList = false;
                this._chartManagerView._removeTableOption(tableView.tableCounter);
                this.execute('tableDelete', {
                    "undo": undoData,
                    "redo": redoData
                });
            } else {
                undoData.tableState = tableContent;
                undoData.equationData = equationData;
                redoData.tableState = undoData.tableState;
                redoData.equationData = undoData.equationData;
                undoData.actionType = 'addTable';
                undoData.index = 1;
                redoData.actionType = 'deleteTable';
                undoData.removeFirstList = true;
                undoData.chartNames = this._chartManagerView.getSelectedChartsFromTable(tableView, void 0, true);
                redoData.chartNames = undoData.chartNames;
                undoData.chartData = chartData;
                redoData.chartData = chartData;
                undoData.target = $list.prev().attr('data-equation-cid');
                this.execute('tableDelete', {
                    "undo": undoData,
                    "redo": redoData
                });
            }
            tableView.trigger('table-removed');
            $list.remove();
            this._vmkClicked = false;
            this._updateHandles();
        },
        "_deleteTableRow": function($list, tableView, rowNo) {
            var tableContent,
                undoData = {},
                redoData = {},
                index;
            tableContent = this._getTableContent($list);
            undoData.rowNo = rowNo;
            redoData.rowNo = rowNo;
            index = parseInt($list.find('.handler-number').text(), 10);
            undoData.listIndex = index;
            redoData.listIndex = index;
            undoData.actionType = 'addRow';
            undoData.rowContent = tableContent.content[rowNo - 1];
            redoData.actionType = 'deleteRow';
            this.execute('deleteTableRow', {
                "undo": undoData,
                "redo": redoData
            });
            tableView.deleteRow(rowNo);
            tableView.getCellAt(rowNo - 1, 1).find('textarea').focus();
            this._parseTable(tableView.getCellAt(1, 1), tableView, true, true);
        },
        "_deleteTableColumn": function($list, tableView, columnNo, isRemoveColClicked) {
            var undoData = {
                    "functionOption": tableView.model.get('columnFunctionOption')[columnNo]
                },
                redoData = {},
                prevEquationData = this._getEquationDataUsingCid(tableView.$('[data-row-id=row1] [data-column="col' + columnNo + '"]')
                    .attr('data-equation-cid')),
                cellToFocus, columnContent,
                residualColumnDependency = $.extend(true, {}, tableView.model.get('residualColumnDependency')),
                plotEquationPoints,
                index = parseInt($list.find('.handler-number').text(), 10),
                $cell = tableView.getColumn(columnNo),
                cid = $($cell[0]).attr('data-equation-cid'),
                doNotPlotColumn = tableView._removePlotColumnCid(cid),
                equationData = this._getEquationDataUsingCid(tableView.$("[data-row-id=row1]").find('.cell').last()
                    .attr('data-equation-cid'));
            if (isRemoveColClicked) {
                columnContent = tableView.getColumnContent(columnNo, {
                    "latexAndSolution": undoData.functionOption === 'F'
                });
                undoData.columnContent = columnContent;
                undoData.latex = tableView.getCellContent(tableView.getCellAt(1, columnNo));
            }
            if (doNotPlotColumn) {
                undoData.doNotPlotColumn = true;
            }
            undoData.listIndex = index;
            redoData.listIndex = index;
            undoData.columnNo = columnNo;
            redoData.columnNo = columnNo;
            undoData.residualColumnDependency = residualColumnDependency;
            redoData.residualColumnDependency = residualColumnDependency;
            undoData.residualColumnNo = $cell.attr('residual-column-no');
            redoData.residualColumnNo = $cell.attr('residual-column-no');
            undoData.actionType = 'addColumn';
            redoData.actionType = 'deleteColumn';
            undoData.firstCellCid = $list.find('[data-cell-id=1-1]').attr('data-equation-cid');
            redoData.equationData = prevEquationData;
            undoData.prevEquationData = prevEquationData;
            redoData.prevEquationData = prevEquationData;
            undoData.equationData = equationData;
            this.execute('deleteTableColumn', {
                "undo": undoData,
                "redo": redoData
            });
            cellToFocus = tableView.getCellAt(1, columnNo - 1);
            this._deleteResidualColumns(prevEquationData, tableView, true);
            plotEquationPoints = prevEquationData.getPlot().getPoints();
            this._removePlots(prevEquationData);
            this.deleteColumnDependency($cell.eq(0), tableView);
            tableView.deleteCol(columnNo);
            cellToFocus.find('textarea').focus();
            tableView.trigger('data-changed', columnNo);
            this._adjustTableHeaderHeightForIE(tableView);
            this._vmkClicked = false;
            this._updateTableHeaderError($list);
        },
        "_updateTableHeaderError": function($list) {
            if ($list.find('.handler-warning.table-error').length === 0) {
                $list.find('.graph-warning-container .handler-warning').removeClass('error');
            }
        },
        /**
         * clears table styles on delete
         * @method _clearTableStylesOnDelete
         * @param table view
         * @return void
         */
        "_clearTableStylesOnDelete": function(tableView, callForReset) {
            var self = this,
                plot,
                _equationDataManager = this.model.get('_equationDataManager'),
                bestFit;
            if (tableView === void 0) {
                return void 0;
            }
            tableView.$('[data-row-id=row1] .cell').each(function() {
                var equationCid = $(this).attr('data-equation-cid'),
                    equationData;
                if (typeof equationCid === 'undefined') {
                    return void 0;
                }
                equationData = self._getEquationDataUsingCid(equationCid);
                plot = equationData.getPlot();
                if (plot !== null) {
                    _equationDataManager.removePlottedEquation(plot);
                    self._callRemovePlottedGraph(plot);
                    if (callForReset && equationData.getStyleType() !== 'line' && plot.getPointVisibility() && tableView.model.get('showTable')) {
                        self.checkIfChangeInPoint(plot.getPoints(), []);
                        plot.setPoints([]);
                    }
                }
                _equationDataManager.removePlottedEquation(equationData);
                bestFit = equationData.getBestFit();
                if (bestFit !== null) {
                    if (bestFit.line && bestFit.line.equationData) {
                        _equationDataManager.removePlottedEquation(bestFit.line.equationData);
                        self._callRemovePlottedGraph(bestFit.line.equationData);
                    }
                    if (bestFit.curve && bestFit.curve.equationData) {
                        _equationDataManager.removePlottedEquation(bestFit.curve.equationData);
                        self._callRemovePlottedGraph(bestFit.curve.equationData);
                    }
                    if (bestFit.exp && bestFit.exp.equationData) {
                        _equationDataManager.removePlottedEquation(bestFit.exp.equationData);
                        self._callRemovePlottedGraph(bestFit.exp.equationData);
                    }
                    if (bestFit.polynomial && bestFit.polynomial.equationData) {
                        _equationDataManager.removePlottedEquation(bestFit.polynomial.equationData);
                        self._callRemovePlottedGraph(bestFit.polynomial.equationData);
                    }
                }
                self.$('.coordinate-tooltip[data-equation-cid="' + equationCid + '"]').remove();
            });
        },
        "_deleteTableEquations": function(tableView) {
            var self = this,
                _equationDataManager = this.model.get('_equationDataManager');
            if (tableView === void 0) {
                return void 0;
            }
            tableView.$('[data-row-id=row1] .cell').each(function() {
                var equationCid = $(this).attr('data-equation-cid'),
                    equationData;
                if (equationCid === void 0) {
                    return void 0;
                }
                equationData = self._getEquationDataUsingCid(equationCid);
                _equationDataManager.removeEquation(equationData);
            });
        },
        /**
         * _changeEquationDataColor changes equationData color
         * @method _changeEquationDataColor
         * @param event {Object}
         */
        "_changeEquationDataColor": function(event) {
            var $target = $(event.target).hasClass('acc-read-elem') ? $(event.target).parent() : $(event.target),
                bestFit,
                colorOptionBox = this.$('.graphing-tool-editor-color-style-box-table'),
                equationCid = colorOptionBox.attr('data-target-equation-data-cid'),
                equationData = this._getEquationDataUsingCid(equationCid),
                plotEquation = equationData.getPlot(),
                $cell,
                $list = this.$('.cell[data-equation-cid=' + equationCid + ']').parents('.list'),
                tableView = this._getTableViewObject($list),
                undoData = {},
                redoData = {},
                bestFitEquationData;
            $cell = $list.find('.cell[data-equation-cid=' + equationCid + ']');
            undoData.equationData = equationData;
            undoData.color = equationData.getColor();
            undoData.colorName = equationData.colorName;
            undoData.target = $target;
            undoData.actionType = 'beforeChange';
            plotEquation.changeColor($target.attr('data-color'));
            plotEquation.changePointsColor($target.attr('data-color'));
            plotEquation.setColor($target.attr('data-color'));
            plotEquation.colorName = $target.attr('data-color-name');
            equationData.colorName = $target.attr('data-color-name');
            equationData.setColor(plotEquation.getColor());
            if (equationData.getStyleType() !== 'points') {
                equationData.changeColor(plotEquation.getColor());
            }
            bestFit = equationData.getBestFit();
            // to change bestfit line color
            if (bestFit !== null) {
                if (bestFit.line) {
                    bestFitEquationData = bestFit.line.equationData;
                    if (bestFitEquationData && bestFitEquationData.getCurveVisibility() === true) {
                        bestFitEquationData.changeColor(plotEquation.getColor());
                        bestFitEquationData.trigger('best-fit-equation-color-change', void 0, bestFitEquationData);
                    }
                }
                if (bestFit.curve) {
                    _.each(bestFit.curve, function(value) {
                        bestFitEquationData = value.equationData;
                        if (bestFitEquationData && bestFitEquationData.getCurveVisibility() === true) {
                            bestFitEquationData.changeColor(plotEquation.getColor());
                            bestFitEquationData.trigger('best-fit-equation-color-change', void 0, bestFitEquationData);
                        }
                    });
                }
                if (bestFit.exp) {
                    bestFitEquationData = bestFit.exp.equationData;
                    if (bestFitEquationData && bestFitEquationData.getCurveVisibility() === true) {
                        bestFitEquationData.changeColor(plotEquation.getColor());
                        bestFitEquationData.trigger('best-fit-equation-color-change', void 0, bestFitEquationData);
                    }
                }
                if (bestFit.polynomial) {
                    bestFitEquationData = bestFit.polynomial.equationData;
                    if (bestFitEquationData && bestFitEquationData.getCurveVisibility() === true) {
                        bestFitEquationData.changeColor(plotEquation.getColor());
                        bestFitEquationData.trigger('best-fit-equation-color-change', void 0, bestFitEquationData);
                    }
                }
            }
            this._updateWarningForCell($list.find('.cell[data-equation-cid=' + equationData.getCid() + ']'), {
                "hasError": false,
                "errorCode": '',
                "equationData": equationData,
                "cid": tableView.cid
            });
            colorOptionBox.find('.selected-color').css({
                "background-color": equationData.getColor()
            });
            colorOptionBox.find('.graphing-tool-editor-colors-selected').parent().removeClass('selected');
            this.accManagerView.changeAccMessage(colorOptionBox.find('.graphing-tool-editor-colors-selected').attr('id'), 0, ['']);
            colorOptionBox.find('.graphing-tool-editor-colors-selected').removeClass('graphing-tool-editor-colors-selected');
            $target.addClass('graphing-tool-editor-colors-selected');
            this._updateStyleForCell(colorOptionBox, equationData);
            this.accManagerView.changeAccMessage($target.attr('id'), 0, [this.accManagerView.getAccMessage('selected-text', 0)]);
            this.accManagerView.setFocus($target.attr('id'));
            this._setColumnColorForCharts(tableView, $cell, equationData);
            tableView.trigger('color-changed');
            $target.parent().addClass('selected');
            redoData.equationData = equationData;
            redoData.color = equationData.getColor();
            redoData.colorName = equationData.colorName;
            redoData.target = $target;
            redoData.actionType = 'afterChange';
            this.execute('tableCellColorChange', {
                "undo": undoData,
                "redo": redoData
            });
        },
        "_setColumnColorForCharts": function(tableView, $cell, equationData) {
            var colNo = Number($cell.attr('id').split('-')[1]);
            tableView.setColumnColor(colNo - 1, equationData.getColor());
        },
        /**
         * _removeTableEquationDataPoints removes plotted points of the table
         * @method _removeTableEquationDataPoints
         * @param equationDataArray {Array} containing list of equationData
         * @param removeOnlyBestFit {Boolean}
         * @return void
         */
        "_removeTableEquationDataPoints": function(equationDataArray, removeOnlyBestFit) {
            var equationDataCounter,
                equationDataPoints,
                equationDataLength = equationDataArray.length,
                currentEquation;
            for (equationDataCounter = 0; equationDataCounter < equationDataLength; equationDataCounter++) {
                currentEquation = equationDataArray[equationDataCounter];
                if (currentEquation === void 0) {
                    continue;
                }
                currentEquation.setLatex('', true);
                this._removePlots(currentEquation, removeOnlyBestFit);
            }
        },
        /**
         * _setTableEquationData Get table's equation data.
         * @method _setTableEquationData
         * @param equationData {Object} equationData Object
         * @param $columnHeader {Object} jQuery object containing column header
         * @return void
         */
        "_setTableEquationData": function(equationData, $columnHeader) {
            if ($columnHeader.attr('id') === '1-1-of-' + $columnHeader.parents('.list').attr('data-table-view-cid')) {
                $columnHeader.parents('.list').attr('data-equation-cid', equationData.getCid());
            }
            $columnHeader.attr({
                "data-equation-cid": equationData.getCid(),
                "data-prev-latex": equationData.getLatex()
            });
            this.model.get('_equationDataManager').addEquation(equationData, false);
        },
        /**
         * isRowBlank checks if row is blank
         * @method isRowBlank
         * @param {Object} json row object
         * @return boolean
         */
        "isRowBlank": function($row) {
            var cells = $row.find('.cell'),
                noOfCells = cells.length,
                cellLatex,
                cellCounter = 0;
            for (cellCounter = 0; cellCounter < noOfCells; cellCounter++) {
                cellLatex = cells.eq(cellCounter).find('.mathquill-editable').mathquill('latex');
                if (cellLatex !== '' && typeof cellLatex !== 'undefined') {
                    return false;
                }
            }
            return true;
        },
        "isRowFullyBlank": function($row) {
            var $cells = $row.find('.cell'),
                noOfCells = $cells.length,
                cellLatex,
                cellCounter = 0;
            for (cellCounter = 0; cellCounter < noOfCells; cellCounter++) {
                cellLatex = $cells.eq(cellCounter).find('.mathquill-editable').mathquill('latex');
                if (cellLatex !== '') {
                    return false;
                }
            }
            return true;
        },
        /**
         * _createTableWithCsvFile creates table using csv file
         * @method _createTableWithCsvFile
         * @param data {String} csv file data in string format
         */
        "_createTableWithCsvFile": function(data) {
            var $list,
                tableViewObject,
                headers = [],
                rows = [],
                rowCounter,
                targetCell,
                redoData = {},
                undoData = {},
                tableCounter,
                tableRowData,
                $focusedList = this.$('.list.list-focus'),
                columnCounter,
                cellData,
                noOfRows,
                noOfCols,
                MAX_COLS = 5,
                MIN_ROWS = 2,
                MIN_COLS = 1,
                maxColReached,
                rowLength,
                colLength,
                equationDataArray,
                MAX_ROWS = 101;
            rows = data.data;
            headers = data.data[0];
            noOfRows = rows.length;
            noOfCols = headers.length;
            if ($focusedList.length === 0) {
                $focusedList = false;
            } else {
                if ($focusedList.attr('data-type') === 'table') {
                    $focusedList = false;
                } else {
                    if ($focusedList.find('.mathquill-editable').mathquill('latex') !== '') {
                        $focusedList = false;
                    }
                }
            }
            if (noOfRows > MAX_ROWS || noOfCols > MAX_COLS || noOfRows < MIN_ROWS || noOfCols < MIN_COLS) {
                this.model.trigger('max-row-and-col-alert');
                return void 0;
            }
            redoData.removeList = false;
            $list = this._createTableList(noOfRows, noOfCols, $focusedList);
            undoData.removeList = true;
            if (!$focusedList) {
                $('#list-box').prepend($list);
            }
            tableViewObject = this._getTableViewObject($list);
            this._createAccDivForList($list, true, tableViewObject);
            tableViewObject.setHeader(headers);
            tableCounter = tableViewObject.tableCounter;
            undoData.tableNumber = tableCounter;
            redoData.tableNumber = tableCounter;
            undoData.actionType = 'deleteTable';
            redoData.actionType = 'addTable';
            rowLength = rows.length;
            for (rowCounter = 1; rowCounter < rowLength; rowCounter++) {
                tableRowData = rows[rowCounter];
                colLength = tableRowData.length;
                while (colLength > noOfCols) {
                    if (noOfCols >= MAX_COLS) {
                        maxColReached = true;
                        break;
                    }
                    headers.push('');
                    tableViewObject.addCol();
                    noOfCols++;
                    tableViewObject.enableAllCellsInColumn(noOfCols);
                }
                for (columnCounter = 0; columnCounter < colLength; columnCounter++) {
                    targetCell = tableViewObject.getCellAt(rowCounter + 1, columnCounter + 1);
                    cellData = tableRowData[columnCounter].toString().trim();
                    tableViewObject.setData([{
                        "object": targetCell,
                        "data": cellData
                    }]);
                }
            }
            if (maxColReached === true) {
                tableViewObject.trigger('column:max');
            }
            if ($list.prev().length === 0) {
                redoData.index = 1;
                undoData.index = 1;
            } else {
                redoData.index = parseInt($list.prev().find('.handler-number').text(), 10) + 1;
                undoData.index = parseInt($list.prev().find('.handler-number').text(), 10) + 1;
            }
            undoData.target = $list.prev().attr('data-equation-cid');
            redoData.target = $list.prev().attr('data-equation-cid');
            redoData.tableState = this._getTableContent($list, tableViewObject);
            equationDataArray = this._equationDataForTableColumn($list);
            this._processTable(tableViewObject, equationDataArray, headers);
            this._resetTableCellSolution(tableViewObject);
            redoData.equationData = this._getTableEquationData(tableViewObject);
            this.execute('addTable', {
                "undo": undoData,
                "redo": redoData
            });
            this._parseTable(tableViewObject.getCellAt(1, 1), tableViewObject, true, true);
            this._updateHandles();
            this._graphingToolView._showColumnHandler();
            this._focusOnList($list);
            this._updateListWidth($list.find('.equation-box').outerWidth(), $list.attr('data-equation-cid'));
        },
        /**
         * _processTable processes table data and plots points
         * @method _processTable
         * @param tableView {Object} Backbone view object for which column is created
         * @param equationDataArray {Array} Array containing all table equationData objects
         * @param headers {Array} Array containing header latex for all columns
         * @param $list {Object}
         */
        "_processTable": function(tableView, equationDataArray, headers) {
            var cols = headers.length,
                isVariable,
                variables = [],
                currentHeader,
                currentEquationData,
                specie, $modal, id,
                equationDataManager = this.model.get('_equationDataManager'),
                alertMsg = '',
                alertMsgsArr = [],
                loopVar,
                alertColLength,
                label = 'L',
                currentEquationConstant,
                noOfConstants,
                colCounter,
                currentHeaderIndex,
                $mathquillLabel,
                latex,
                makeLabel,
                constantCounter, accAlertMessage = '',
                tempGlobalConstant = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(equationDataManager.getConstants()),
                globalConstant = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(equationDataManager.getConstants());
            for (colCounter = 0; colCounter < cols; colCounter++) {
                currentHeader = headers[colCounter];
                currentEquationData = equationDataArray[colCounter];
                currentHeaderIndex = headers.indexOf(currentHeader);
                isVariable = this._checkIfVariable(currentHeader);
                currentHeader = this._processLatex(currentHeader);
                currentEquationData.setLatex(currentHeader, true);
                equationDataManager.parseEquation(currentEquationData, true);
                specie = currentEquationData.getSpecie();
                if (specie === 'plot') {
                    if (variables.indexOf('x') === -1 && currentHeader !== 'x') {
                        tableView.changeLabelOfFunctionOption(colCounter + 1, label);
                    } else {
                        if (currentHeader !== 'x' || currentHeaderIndex !== colCounter) {
                            alertMsg += ', ' + currentHeader;
                            accAlertMessage += currentEquationData.getAccText();
                        }
                    }
                } else {
                    currentEquationConstant = currentEquationData.getErrorData();
                    if (specie === 'expression' || specie === 'number' || currentHeaderIndex !== colCounter) {
                        alertMsg += ', ' + currentHeader;
                        accAlertMessage += currentEquationData.getAccText();
                    }
                    if (specie === 'error') {
                        if (currentHeader !== 'y' && colCounter !== 0) {
                            if (isVariable !== true) {
                                if (currentEquationData.getErrorCode() === 'ConstantDeclaration') {
                                    noOfConstants = currentEquationConstant.length;
                                    for (constantCounter = 0; constantCounter < noOfConstants; constantCounter++) {
                                        if (variables.indexOf(currentEquationConstant[constantCounter]) === -1) {
                                            tableView.changeLabelOfFunctionOption(colCounter + 1, label);
                                            makeLabel = true;
                                            break;
                                        } else {
                                            globalConstant[currentEquationConstant[constantCounter]] = 1;
                                            makeLabel = false;
                                        }
                                    }
                                    if (!makeLabel) {
                                        currentEquationData.setConstants(globalConstant);
                                        equationDataManager.parseEquation(currentEquationData, true);
                                        if (currentEquationData.isCanBeSolved() === false) {
                                            tableView.changeLabelOfFunctionOption(colCounter + 1, label);
                                        } else {
                                            alertMsg += ', ' + currentHeader;
                                            accAlertMessage += currentEquationData.getAccText();
                                        }
                                    }
                                } else {
                                    tableView.changeLabelOfFunctionOption(colCounter + 1, label);
                                }
                            }
                        }
                    }
                }
                currentEquationData.setConstants(tempGlobalConstant);
                if (isVariable) {
                    variables.push(currentHeader);
                }
            }
            if (alertMsg !== '') {
                alertMsgsArr = alertMsg.split(', ');
                alertColLength = alertMsgsArr.length;
                alertMsg = alertMsgsArr[1];
                for (loopVar = 2; loopVar < alertColLength - 1; loopVar++) {
                    alertMsg += '\\spacing@,\\spacing@' + alertMsgsArr[loopVar];
                }
                if (typeof alertMsgsArr[loopVar] !== 'undefined') {
                    alertMsg += '\\spacing@and\\spacing@' + alertMsgsArr[loopVar];
                }
                id = 'data-overridden';
                $modal = $('#tool-holder-4').find('#' + 'data-overridden');
                $mathquillLabel = $(MathUtilities.Components.GraphChart.templates['chart-mathquill']().trim());
                latex = alertMsg;
                latex = this._revertProcessLatex(latex);
                $modal.modal({
                    "manager": this._graphingToolView.$el
                }).addClass("data-overridden");
                $modal.find('.param-container').empty().append($mathquillLabel);
                $mathquillLabel.find('.chart-mathquill').mathquill('editable').mathquill('revert')
                    .mathquill().mathquill('latex', latex).addClass('mathquill-container').before('Data under columns: ').after(' will be overridden!');
                $modal.find('.btn-primary').focus().off('click.' + id).on('click.' + id, _.bind(function() {
                    this._graphingToolView._closeAlertBox($modal);
                    this.accManagerView.setFocus(tableView.$el.parents('.list').attr('id'));
                }, this));
                this.accManagerView.unloadScreen('bootstrap-popup-text');
                this.accManagerView.loadScreen('bootstrap-popup-text');
                this.accManagerView.changeAccMessage('data-overridden-text', 0, [accAlertMessage]);
                this.accManagerView.setFocus('data-overridden-title', 10);
            }
        },
        /**
         * _removePlots removes plots from equationData
         * @method _removePlots
         * @param equationData {Object} equationData model object for which plots are to be removed.
         * @param removeBestFitOnly {Boolean} True if only best fit plots are to be removed.
         * @return void
         */
        "_removePlots": function(equationData, removeBestFitOnly) {
            var bestFit,
                bestFitEquationData, plotEquationPoints,
                equationDataPlot = equationData.getPlot();
            if (!removeBestFitOnly) {
                this._callRemovePlottedGraph(equationData);
                if (equationDataPlot !== null) {
                    plotEquationPoints = equationDataPlot.getPoints();
                    if (plotEquationPoints && plotEquationPoints.length !== 0 && equationDataPlot.getPointVisibility()) {
                        this.checkIfChangeInPoint(plotEquationPoints.slice(), []);
                    }
                    this._callRemovePlottedGraph(equationDataPlot);
                    equationDataPlot.setPoints([]);
                }
                equationData.setPoints([]);
            }
            bestFit = equationData.getBestFit();
            if (bestFit !== null) {
                if (bestFit.line) {
                    bestFitEquationData = bestFit.line.equationData;
                    this._callRemovePlottedGraph(bestFitEquationData);
                    if (bestFitEquationData) {
                        bestFitEquationData.trigger('best-fit-equation-data-removed', bestFitEquationData);
                    }
                }
                if (bestFit.curve) {
                    _.each(bestFit.curve, _.bind(function(value) {
                        bestFitEquationData = value.equationData;
                        this._callRemovePlottedGraph(bestFitEquationData);
                        if (bestFitEquationData) {
                            bestFitEquationData.trigger('best-fit-equation-data-removed', bestFitEquationData);
                        }
                    }, this));
                }
                if (bestFit.exp) {
                    bestFitEquationData = bestFit.exp.equationData;
                    this._callRemovePlottedGraph(bestFitEquationData);
                    if (bestFitEquationData) {
                        bestFitEquationData.trigger('best-fit-equation-data-removed', bestFitEquationData);
                    }
                }
                if (bestFit.polynomial) {
                    bestFitEquationData = bestFit.polynomial.equationData;
                    this._callRemovePlottedGraph(bestFitEquationData);
                    if (bestFitEquationData) {
                        bestFitEquationData.trigger('best-fit-equation-data-removed', bestFitEquationData);
                    }
                }
            }
        },
        /**
         * updates column best fits on points add
         * @method _updateColumnBestFit
         * @param equationData {Object} equationData model object
         * @param tableView {Object} table view object for which best fit have to be updated
         * @param flag {Boolean} whether to update all columns or not
         * @param tableShown {Boolean} whether the table plots are visible or not
         * @return void
         */
        "_updateColumnBestFit": function(equationData, tableView, flag, tableShown) {
            var bestFit = equationData.getBestFit(),
                bestFitData,
                displayEquation = '',
                bestFitEquationData,
                equationDataPoints,
                _equationDataManager = this.model.get('_equationDataManager'),
                plot = equationData.getPlot(),
                bestFitEquationListData = {},
                $tableList = tableView.$el.parents('.list'),
                selectedChart = this._chartManagerView.getSelectedChartsFromTable(tableView, false, true),
                MIN_POINTS = 2;
            equationDataPoints = this._removeInvalidPoints(plot.getPoints());
            if (equationDataPoints.length < MIN_POINTS && !equationData.getResidualColumnNo()) {
                this._removePlots(equationData, true);
            }
            if (bestFit) {
                if (bestFit.line && bestFit.line.selected) {
                    bestFitData = this.model._getBestFitLine(equationDataPoints, true, bestFit);
                    if (bestFitData) {
                        bestFitEquationData = bestFit.line.equationData;
                        if (!bestFitEquationData) {
                            bestFit.line.equationData = this._createBestFitEquationData(bestFitData, equationData, tableShown, 'line');
                            bestFitEquationData = bestFit.line.equationData;
                            this._addBestFitEquationList({
                                "tableList": $tableList,
                                "equationData": bestFitEquationData,
                                "tableColEquationDataCid": equationData.getCid(),
                                "bestFitType": "line"
                            });
                        }
                        bestFitEquationData = this.updateBestFitEquationData(bestFitEquationData, bestFitData, equationData, tableShown);
                        // Trigger best-fit-equation-data-changed event.
                        bestFitEquationListData.tableColEquationData = equationData;
                        bestFitEquationListData.equationData = bestFit.line.equationData;
                        bestFitEquationListData.bestFitType = 'line';
                        bestFit.line.equationData.trigger('best-fit-equation-data-changed', bestFitEquationListData);
                    } else {
                        bestFitEquationData = bestFit.line.equationData;
                        if (bestFitEquationData) {
                            bestFitEquationData.setDisplayEquation(displayEquation);
                            this._removePlots(bestFitEquationData);
                            this._removeBestFitEquationList(bestFit.line.equationData);
                            if (selectedChart.length === 0) {
                                this._deSelectBestFitEquationMenuItem(equationData, 'line', void 0);
                            }
                        }
                    }
                }
                if (bestFit.curve) {
                    _.each(bestFit.curve, _.bind(function(value, counter) {
                        if (value.selected) {
                            bestFitData = this.model._getBestFitCurve(equationDataPoints, counter, true);
                            if (bestFitData) {
                                if (bestFitData.solutionString) {
                                    bestFitEquationData = value.equationData;
                                    if (!bestFitEquationData) {
                                        value.equationData = this._createBestFitEquationData(bestFitData, equationData, tableShown, 'curve', counter);
                                        bestFitEquationData = value.equationData;
                                        this._addBestFitEquationList({
                                            "tableList": $tableList,
                                            "equationData": bestFitEquationData,
                                            "tableColEquationDataCid": equationData.getCid(),
                                            "bestFitType": "curve",
                                            "degree": counter
                                        });
                                    }
                                    bestFitEquationData = this.updateBestFitEquationData(bestFitEquationData, bestFitData, equationData, tableShown);
                                    displayEquation = bestFitData.displayString;
                                } else {
                                    if (value.equationData) {
                                        this._removePlots(value.equationData);
                                    }
                                }
                                // Trigger best-fit-equation-data-changed event.
                                bestFitEquationListData.tableColEquationData = equationData;
                                bestFitEquationListData.equationData = value.equationData;
                                bestFitEquationListData.bestFitType = 'curve';
                                bestFitEquationListData.degree = counter;
                                value.equationData.trigger('best-fit-equation-data-changed', bestFitEquationListData);
                            } else {
                                if (value.equationData) {
                                    value.equationData.setDisplayEquation(displayEquation);
                                    this._removePlots(value.equationData);
                                    this._removeBestFitEquationList(value.equationData);
                                    if (selectedChart.length === 0) {
                                        this._deSelectBestFitEquationMenuItem(equationData, 'curve', counter);
                                    }
                                }
                            }
                        }
                    }, this));
                }
                if (bestFit.exp && bestFit.exp.selected) {
                    bestFitData = this.model._getBestFitExp(equationDataPoints, true);
                    if (bestFitData) {
                        displayEquation = bestFitData.displayString;
                        bestFitEquationData = bestFit.exp.equationData;
                        if (!bestFitEquationData) {
                            bestFit.exp.equationData = this._createBestFitEquationData(bestFitData, equationData, tableShown, 'exp');
                            bestFitEquationData = bestFit.exp.equationData;
                            this._addBestFitEquationList({
                                "tableList": $tableList,
                                "equationData": bestFitEquationData,
                                "tableColEquationDataCid": equationData.getCid(),
                                "bestFitType": "exp"
                            });
                        }
                        bestFitEquationData = this.updateBestFitEquationData(bestFitEquationData, bestFitData, equationData, tableShown);
                        // Trigger best-fit-equation-data-changed event.
                        bestFitEquationListData.tableColEquationData = equationData;
                        bestFitEquationListData.equationData = bestFit.exp.equationData;
                        bestFitEquationListData.bestFitType = 'exp';
                        bestFit.exp.equationData.trigger('best-fit-equation-data-changed', bestFitEquationListData);
                    } else {
                        if (bestFit.exp.equationData) {
                            bestFit.exp.equationData.setDisplayEquation(displayEquation);
                            this._removePlots(bestFit.exp.equationData);
                            this._removeBestFitEquationList(bestFit.exp.equationData);
                            if (selectedChart.length === 0) {
                                this._deSelectBestFitEquationMenuItem(equationData, 'exp', void 0);
                            }
                        }
                    }
                }
                if (bestFit.polynomial && bestFit.polynomial.selected) {
                    this._createBestFitCurveObject({
                        "parentEquation": equationData,
                        "points": equationDataPoints
                    });
                    bestFitData = this.model._getBestFitPolynomial({
                        "points": equationData.getPlot().getPoints(),
                        "isIntermediateCall": true,
                        "parentEquation": equationData
                    });
                    if (bestFitData) {
                        displayEquation = bestFitData.displayString;
                        bestFitEquationData = bestFit.polynomial.equationData;
                        if (!bestFitEquationData) {
                            bestFit.polynomial.equationData = this._createBestFitEquationData(bestFitData, equationData, tableShown, 'polynomial');
                            bestFitEquationData = bestFit.polynomial.equationData;
                            this._addBestFitEquationList({
                                "tableList": $tableList,
                                "equationData": bestFitEquationData,
                                "tableColEquationDataCid": equationData.getCid(),
                                "bestFitType": "polynomial"
                            });
                        }
                        bestFitEquationData = this.updateBestFitEquationData(bestFitEquationData, bestFitData, equationData, tableShown);
                        // Trigger best-fit-equation-data-changed event.
                        bestFitEquationListData.tableColEquationData = equationData;
                        bestFitEquationListData.equationData = bestFit.polynomial.equationData;
                        bestFitEquationListData.bestFitType = 'polynomial';
                        bestFit.polynomial.equationData.trigger('best-fit-equation-data-changed', bestFitEquationListData);
                    } else {
                        if (bestFit.polynomial.equationData) {
                            bestFit.polynomial.equationData.setDisplayEquation(displayEquation);
                            this._removePlots(bestFit.polynomial.equationData);
                            this._removeBestFitEquationList(bestFit.polynomial.equationData);
                            if (selectedChart.length === 0) {
                                this._deSelectBestFitEquationMenuItem(equationData, 'polynomial', void 0);
                            }
                        }
                    }
                }
            }
            this._updateResidualColumns({
                "equationData": equationData,
                "tableView": tableView
            });
        },
        "_updateResidualColumns": function(options) {
            var equationData = options.equationData,
                tableView = options.tableView,
                undoResiduals = options.undoResiduals,
                isUndoRedoAction = options.isUndoRedoAction,
                points = options.points || [],
                cid = equationData.getResidualColumnNo() ? tableView._getColumnCid(equationData.getResidualColumnNo()) : equationData.getCid(),
                isUpdate = true,
                type,
                colNo = tableView._getColumnNo(cid),
                columnEquationData = this._getEquationDataUsingCid(cid),
                currColNo,
                currEquationData,
                bestFitData,
                currResidual,
                prevLatex,
                residualPlotPoints = [],
                isHeaderUpadate = options.isUndoRedoAction ? false : !!equationData.getResidualColumnNo(),
                residualColumnStates = tableView.model.get('residualColumnStates');
            if (residualColumnStates && !$.isEmptyObject(residualColumnStates)) {
                currResidual = residualColumnStates[cid];
                for (type in currResidual) {
                    if (type !== "residualColumnCount") {
                        if (currResidual[type].selected && (equationData.getResidualType() === type || equationData.getResidualType() === void 0)) {
                            if (["addTable", "addResidualColumn"].indexOf(options.actionType) > -1) {
                                if (points.length === 0) {
                                    points = currResidual[type].points;
                                }
                                residualPlotPoints = currResidual[type].residualEquationData.getPlot().getPoints();
                                points = residualPlotPoints.length > 0 ? this._removeInvalidPoints(residualPlotPoints) : points;
                            } else {
                                points = options.points || this._removeInvalidPoints(equationData.getPlot().getPoints());
                            }
                            if (points.length !== 0) {
                                switch (type) {
                                    case 'line':
                                        bestFitData = this.model._getBestFitLine(points, true);
                                        break;
                                    case 'exp':
                                        bestFitData = this.model._getBestFitExp(points, true);
                                        break;
                                    case 'polynomial':
                                        this._createBestFitCurveObject({
                                            "parentEquation": columnEquationData,
                                            "points": points
                                        });
                                        bestFitData = this.model._getBestFitPolynomial({
                                            "points": points,
                                            "isIntermediateCall": true,
                                            "parentEquation": columnEquationData
                                        });
                                        break;
                                }
                            }
                            if (bestFitData) {
                                if (undoResiduals) {
                                    isUpdate = undoResiduals.indexOf(type) === -1;
                                }
                                if (!$.isEmptyObject(currResidual[type].residualEquationData)) {
                                    prevLatex = currResidual[type].residualEquationData.getLatex();
                                }
                                this.calculateResidual({
                                    "points": points,
                                    "colNo": colNo,
                                    "tableView": tableView,
                                    "bestFitData": bestFitData,
                                    "type": type,
                                    "cid": cid,
                                    "isUpdate": isUpdate,
                                    "isUndoRedoAction": isUndoRedoAction,
                                    "residualEquationData": currResidual[type].residualEquationData,
                                    "residualColEquationData": currResidual[type].residualColEquationData,
                                    "isHeaderUpadate": isHeaderUpadate,
                                    "isSaveState": options.isSaveState,
                                    "residualEquationLatex": options.isSaveState ? currResidual[type].residualEquationLatex : undefined
                                });
                                currResidual[type]["points"] = points;
                                if (currResidual[type].isDeleted) {
                                    delete currResidual[type].isDeleted;
                                    currColNo = Number(tableView._getColumnNo(currResidual[type].residualEquationData.cid));
                                    currEquationData = currResidual[type].residualEquationData;
                                    tableView.setCellContent(tableView.getCellAt(1, currColNo), prevLatex, false, true);
                                    currEquationData.setLatex(prevLatex);
                                    this._parseTableColumn(currColNo, tableView, currEquationData, false, true);
                                }
                            } else {
                                if (options.isDeleted) {
                                    currResidual[type].isDeleted = true;
                                }
                                currResidual[type].selected = false;
                                this._removeResidualColumns(cid, type, tableView);
                            }
                        }
                    }
                }
                tableView.model.set('residualColumnStates', residualColumnStates);
            }
        },
        "addResidualAsColumn": function(cid, residualType, $list, residualData) {
            var $parentList = this.$('.cell[data-equation-cid=' + cid + ']').parents('.list'),
                tableView = this._getTableViewObject($parentList),
                tableModel = tableView.model,
                residualColumnStates = tableModel.get('residualColumnStates'),
                currResidualState = residualColumnStates[cid],
                cols, counter,
                equationData,
                dataCol,
                colNo = [],
                columnNo,
                currCid,
                $header,
                dependentCid = [],
                residualColumnNo,
                residualColumnDependency = tableModel.get('residualColumnDependency'),
                residualColumnCount = tableModel.get('residualColumnCount'),
                headers = tableView.getHeaders(),
                columnContent = [],
                headerContent = [],
                length;
            if (currResidualState) {
                currResidualState = currResidualState[residualType];
                if (currResidualState && currResidualState.selected) {
                    residualColumnNo = currResidualState.residualEquationData.getResidualColumnNo();
                    this.registerUndoRedo = false;
                    cols = $(tableView.$el).find('.cell[data-column-name=' + residualType + cid + ']');
                    length = cols.length;
                    for (counter = 0; counter < length; counter++) {
                        $header = cols.eq(counter);
                        columnNo = $header.attr('data-column').split('col')[1];
                        $header.removeAttr('data-ignore-column data-column-name');
                        $header.attr('data-dependent-no', residualColumnNo);
                        if (counter === 0) {
                            $header.find('.function-btn').show();
                        }
                        currCid = tableView._getColumnCid(columnNo);
                        equationData = this._getEquationDataUsingCid(currCid);
                        equationData.setResidualColumnNo(void 0);
                        equationData.setDependentColumnNo(residualColumnNo);
                        if (counter === 1) {
                            equationData.setResidualType("residual");
                        }
                        dependentCid.push(currCid);
                        colNo.push(columnNo);
                        residualColumnCount--;
                        tableView.trigger('data-changed', columnNo);
                    }
                    residualColumnStates[cid]["residualColumnCount"] -= 2; // Number of columns added on residual select is 2
                    this._removeBestFitEquationData($list, residualData);
                    this.accManagerView.unloadScreen($header.parents('.list').attr('id'));
                    if (residualColumnDependency[residualColumnNo]) {
                        residualColumnDependency[residualColumnNo].push(dependentCid[0], dependentCid[1]);
                    } else {
                        residualColumnDependency[residualColumnNo] = dependentCid;
                    }
                    tableModel.set({
                        "residualColumnDependency": residualColumnDependency,
                        "residualColumnCount": residualColumnCount,
                        "residualColumnStates": residualColumnStates
                    });
                }
            }
            this._parseTable(tableView.getCellAt(1, 1), tableView, true, true);
            return colNo;
        },
        "_deleteResidualColumns": function(equationData, tableView, isDeleted) {
            var cid = equationData.getCid(),
                type,
                residualColumnStates = tableView.model.get('residualColumnStates');
            if (residualColumnStates) {
                residualColumnStates = residualColumnStates[cid];
                for (type in residualColumnStates) {
                    if (residualColumnStates[type].selected) {
                        residualColumnStates[type].selected = false;
                        residualColumnStates[type].isDeleted = !!isDeleted;
                        this._removeResidualColumns(cid, type, tableView);
                    }
                }
            }
        },

        "_updateColumnCount": function(tableView, isUpdate) {
            var residualColumnStates = tableView.model.get('residualColumnStates'),
                count = 0,
                residualType;
            if (residualColumnStates) {
                _.each(residualColumnStates, function(value) {
                    residualType = value;
                    count = 0;
                    _.each(value, function(type, key) {
                        if (key !== "residualColumnCount") {
                            count = residualType[key].selected ? count + 2 : count; // Number of columns added in residuals is 2
                        }
                    });
                    if (isUpdate) {
                        value["residualColumnCount"] += count;
                    } else {
                        value["residualColumnCount"] -= count;
                    }
                });
            }
            tableView.model.set('residualColumnStates', residualColumnStates);
        },

        /**
         * clearColumnData clears column data for the given column
         * @method clearColumnData
         * @param colNo {Number} column number
         * @param $targetList {Object}
         * @return void
         */
        "clearColumnData": function(colNo, $targetList) {
            var $cell,
                rowCounter,
                totalRows,
                tableView = this._getTableViewObject($targetList);
            totalRows = tableView.getRowCount();
            for (rowCounter = 2; rowCounter <= totalRows; rowCounter++) {
                $cell = tableView.getCellAt(rowCounter, colNo);
                tableView.setCellContent($cell, '', true);
                $cell.attr('data-prev-latex', '');
                this._updateWarningForCell($cell, {
                    "hasError": false,
                    "cid": tableView.cid
                });
            }
        },
        /**
         * _checkIfVariable checks if constant
         * @method _checkIfVariable
         * @param data {String} string to be checked
         * @return {Boolean} true if given data is constant
         */
        "_checkIfVariable": function(data) {
            if (data === '\\theta ' || data === '\\theta') {
                return true;
            }
            var constantsRegex = /^[a-z]$/,
                ignoreConstantsRegex = /[^ye]/,
                matches;
            matches = data.match(constantsRegex);
            return matches !== null && matches[0].match(ignoreConstantsRegex) !== null;
        },
        // table parsing
        /**
         * _setCellSolution sets the solution for expression or any value in the cell
         * @method _setCellSolution
         * @param {Object} $cell Json object of a cell
         * @param {Object} tableView object of table view
         * @param {Object} headerEquationData equationData model object for the header
         * @param {Boolean} parseWithoutConstants Boolean to specify to parse equation with or without constants
         * @param {Boolean} isIgnoreRow Boolean to specify to ignore row solution or not
         * @return void
         */
        "_setCellSolution": function($cell, tableView, headerEquationData, parseWithoutConstants, isIgnoreRow) {
            var equationData,
                latex,
                equationManager,
                constants, errorString,
                equationConstants,
                $xCoordCell,
                xCoord,
                yCoord,
                rowNo,
                colNo,
                specie,
                rowHeader,
                xDeclared,
                _equationDataManager = this.model.get('_equationDataManager'),
                solution;
            rowHeader = tableView.getRowHeaderState();
            rowNo = $cell.attr('id').split('-')[0];
            colNo = $cell.attr('id').split('-')[1];
            latex = tableView.getCellContent($cell);
            if (typeof headerEquationData !== 'undefined' && headerEquationData !== false) {
                equationConstants = _equationDataManager._callGetAllConstants(headerEquationData, true);
                $cell.attr('data-cell-definition', JSON.stringify(equationConstants));
                return void 0;
            }
            if (isNaN(latex)) {
                if (typeof latex === 'undefined' || latex === 'undefined') {
                    return void 0;
                }
                tableView.setCellDataArray(rowNo, colNo, latex, $cell, isIgnoreRow);
                latex = this._processLatex(latex);
                equationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
                equationData.getDirectives().FDFlagMethod = 'graphing';
                equationData.setLatex(latex, true);
                equationManager = _equationDataManager;
                equationData.setPointVisibility(false);
                equationData.setCurveVisibility(false);
                if (parseWithoutConstants !== true) {
                    constants = equationManager.getConstants();
                    equationData.setConstants(constants);
                }
                equationData.getUnits().angle = this.model.get('equationDataUnits');
                equationData.setConstants(equationManager.getConstants());
                equationData.setCustomFunctions(equationManager.get('_parseFunctions'));
                equationData.setFunctions(equationManager.get('_parseFunctionsEngine'));
                equationManager.parseEquation(equationData, true);
                solution = equationData.getSolution();
                equationConstants = _equationDataManager._callGetAllConstants(equationData, true);
                specie = equationData.getSpecie();
                $cell.attr('cell-text', equationData.getAccText());
                if (equationConstants.length !== 0) {
                    $cell.attr('data-cell-definition', JSON.stringify(equationConstants));
                }
                if (solution !== null && typeof solution !== 'object') {
                    this._updateWarningForCell($cell, {
                        "hasError": false,
                        "cid": tableView.cid
                    });
                    $cell.attr('data-solution', solution);
                    tableView.setCellDataArray(rowNo, colNo, solution, $cell, isIgnoreRow);
                } else {
                    errorString = this._getErrorStringForTable(equationData.getErrorCode());
                    if (specie === 'point') {
                        errorString = this._getErrorStringForTable('CannotUnderstandThis');
                    }
                    if ($cell.attr('data-column') === 'col1' && specie === 'plot') {
                        errorString = this._getErrorStringForTable('PlotInCell');
                    }
                    if (specie === 'plot' && equationData.getInEqualityType() !== 'equal') {
                        errorString = this._getErrorStringForTable('CannotUnderstandThis');
                    }
                    if (rowHeader === true && colNo === '1') {
                        this._updateWarningForCell($cell, {
                            "hasError": false,
                            "cid": tableView.cid
                        });
                    } else {
                        if (errorString === void 0) {
                            errorString = this._getErrorStringForTable('defineX');
                        }
                        this._updateWarningForCell($cell, {
                            "hasError": true,
                            "errorCode": errorString,
                            "cid": tableView.cid
                        });
                    }
                    $cell.attr('data-solution', '');
                    tableView.setCellDataArray(rowNo, colNo, solution, $cell, isIgnoreRow);
                    if (this._graphingToolView.isAccDivPresent($cell.find('.handler-warning'))) {
                        this.accManagerView.setAccMessage($cell.find('.handler-warning').attr('id'), errorString);
                    }
                }
                if (equationData.getSpecie() === 'plot' && equationData.getInEqualityType() === 'equal') {
                    xDeclared = this._isXDeclared(tableView, colNo, rowHeader);
                    if (xDeclared === false) {
                        if (rowHeader !== true && colNo !== '1') {
                            this._updateWarningForCell($cell, {
                                "hasError": true,
                                "errorCode": this._getErrorStringForTable('defineX'),
                                "cid": tableView.cid
                            });
                        }
                    } else {
                        $xCoordCell = tableView.getCellAt(rowNo, xDeclared);
                        xCoord = tableView.getCellContent($xCoordCell, {
                            "solution": true
                        });
                        yCoord = this._getSolution(equationData, xCoord);
                        tableView.setCellContent($cell, yCoord, true);
                        this._updateWarningForCell($cell, {
                            "hasError": false,
                            "cid": tableView.cid
                        });
                        latex = this._revertProcessLatex(latex);
                        $cell.find('.mathquill-editable').mathquill('latex', latex);
                    }
                }
            } else {
                this._updateWarningForCell($cell, {
                    "hasError": false,
                    "cid": tableView.cid
                });
                $cell.attr('data-solution', latex);
                tableView.setCellDataArray(rowNo, colNo, latex, $cell, isIgnoreRow);
                $cell.attr('cell-text', latex);
            }
        },
        /**
         * _setAndDrawPointsForTable sets and draws points for given equationData
         * @method _setAndDrawPointsForTable
         * @param equationData {Object} equationData model object
         * @param points {Array} array of points
         * @param tableView {Object} object of table view
         * @param onlyPolygon {Boolean} to plot the graph or just connect points
         * @param doNotPlot {Boolean} just set the points and don't draw
         * @param colNo {Number} Number of the column for which data has to set
         * @return void
         */
        "_setAndDrawPointsForTable": function(equationData, points, tableView, onlyPolygon, doNotPlot, colNo) {
            points = this.model._updateInvalidPoints(points);
            var plotEquation = equationData.getPlot(),
                isColHeaderBlank = equationData.getLatex() === '',
                plotColumn = this._getPlotColumn(equationData),
                plotEquationPoints = plotEquation.getPoints() || [],
                tableShown;
            tableShown = tableView.model.get('showTable');
            if (equationData.getStyleType() !== 'line' && plotEquation.getPointVisibility() && tableShown) {
                this.checkIfChangeInPoint(plotEquation.getPoints(), points);
            }
            plotEquation.setPoints(points);
            if (doNotPlot || points.length === 0) {
                this._removePlots(equationData);
                return void 0;
            }

            if (tableShown && !isColHeaderBlank && plotColumn) {
                this.model.get('_equationDataManager').drawPoint(plotEquation);
            }
            this._graphingToolView.$('.coordinate-tooltip[data-equation-cid="' + plotEquation.getCid() + '"]').remove();
            if (!onlyPolygon) {
                onlyPolygon = tableView.getRowHeaderState();
            }
            if (!isColHeaderBlank) {
                this._handleTableStyleType(equationData, equationData.getStyleType(), tableShown, onlyPolygon);
                this._updateColumnBestFit(equationData, tableView, true, tableShown, colNo);
            }
        },
        "callCheckIfChangeInPoint": function(equationData, previousPoints, updatedPoints) {
            if (!equationData.getPlot()) {
                return void 0;
            }
            var plotEquationPoints = equationData.getPlot().getPoints();
            if (equationData.getStyleType() !== 'line' && plotEquationPoints &&
                plotEquationPoints.length > 0) {
                this.checkIfChangeInPoint(previousPoints, updatedPoints);
            }
        },

        "checkIfChangeInPoint": function(previousPoints, updatedPoints) {
            var counter,
                prevLength,
                updatedLength,
                changedPoint = [],
                diffArray,
                length,
                isNewPoint,
                flag = 1;
            if (previousPoints) {
                prevLength = previousPoints.length;
            } else if (updatedPoints && updatedPoints.length > 0) {
                //add new point
                prevLength = 0;
                updatedLength = updatedPoints.length;
            } else {
                return;
            }
            if (!previousPoints) {
                previousPoints = [];
            }
            if (updatedPoints) {
                updatedLength = updatedPoints.length;
            }
            if (updatedLength > prevLength) {
                diffArray = this.getDifferenceBetweenArrays(updatedPoints.slice(), previousPoints.slice());
                isNewPoint = prevLength > 0;
                // new point added
            } else if (updatedLength < prevLength) {
                flag = -1;
                diffArray = this.getDifferenceBetweenArrays(previousPoints.slice(), updatedPoints.slice());
                isNewPoint = updatedLength > 0;
            } else {
                //same point changed loop and check
                for (counter = 0; counter < prevLength; counter++) {
                    if (Number(previousPoints[counter][0]) !== Number(updatedPoints[counter][0]) ||
                        Number(previousPoints[counter][1]) !== Number(updatedPoints[counter][1])) {
                        changedPoint = previousPoints[counter].slice();
                        changedPoint[0] = Number(changedPoint[0]);
                        changedPoint[1] = Number(changedPoint[1]);
                        flag = -1;
                        this._updatePointsIndicatorObject(changedPoint, flag);
                        changedPoint = updatedPoints[counter].slice();
                        changedPoint[0] = Number(changedPoint[0]);
                        changedPoint[1] = Number(changedPoint[1]);
                        flag = 1;
                        this._updatePointsIndicatorObject(changedPoint, flag);
                    }
                }
                return;
            }
            length = diffArray.length;
            if (isNewPoint && length > 1) {
                for (counter = 0; counter < prevLength; counter++) {
                    changedPoint = previousPoints[counter].slice();
                    changedPoint[0] = Number(changedPoint[0]);
                    changedPoint[1] = Number(changedPoint[1]);
                    flag = -1;
                    this._updatePointsIndicatorObject(changedPoint, flag);
                }
                for (counter = 0; counter < updatedLength; counter++) {
                    changedPoint = updatedPoints[counter].slice();
                    changedPoint[0] = Number(changedPoint[0]);
                    changedPoint[1] = Number(changedPoint[1]);
                    flag = 1;
                    this._updatePointsIndicatorObject(changedPoint, flag);
                }
            } else {
                for (counter = 0; counter < length; counter++) {
                    changedPoint = diffArray[counter].slice();
                    changedPoint[0] = Number(changedPoint[0]);
                    changedPoint[1] = Number(changedPoint[1]);
                    this._updatePointsIndicatorObject(changedPoint, flag);
                }
            }
        },
        "getDifferenceBetweenArrays": function(firstArray, secondArray) {
            var count, counter, currentPoint,
                diffArray = _.difference(firstArray, secondArray),
                diffArray1 = _.difference(secondArray, firstArray),
                length1 = diffArray.length,
                length2 = diffArray1.length;
            for (counter = 0; counter < length1; counter++) {
                currentPoint = diffArray[counter];
                for (count = 0; count < length2; count++) {
                    if (Number(currentPoint[0]) === Number(diffArray1[count][0]) &&
                        Number(currentPoint[1]) === Number(diffArray1[count][1])) {
                        diffArray1.splice(count, 1);
                        length2 = diffArray1.length;
                    }
                }

            }
            return diffArray.concat(diffArray1);
        },

        /**
         * updates the pointsIndicatorObject according to the flag (+1/-1) for point
         * @return {[void]}
         */
        "_updatePointsIndicatorObject": function(point, flag) {
            var pointName = point.toString(),
                pointsObject = this.model.get('pointsIndicatorObject')[pointName];
            if (pointsObject) {
                pointsObject.value += flag;
                if (pointsObject.value === 0) {
                    delete this.model.get('pointsIndicatorObject')[pointName];
                }
            } else {
                if (flag < 0) {
                    return;
                }
                this.model.get('pointsIndicatorObject')[pointName] = {
                    "value": 1
                };
                return;
            }
            if (pointsObject.value >= 2) { // minimum number of points for showing coinciding tooltip is 2
                this._graphingToolView._gridGraphView.showPointIndicatorForPoint(point, pointsObject.value);
            } else {
                this._graphingToolView._gridGraphView.removePointIndicatorForPoint(point);
            }
        },
        "removeAllPointIndicators": function() {
            var pointsObject = this.model.get('pointsIndicatorObject');
            _.each(pointsObject, _.bind(function(value, counter) {
                this._graphingToolView._gridGraphView.removePointIndicatorForPoint(counter);
            }, this));
            this.model.set('pointsIndicatorObject', {});
        },

        /**
         * _handleTableStyleType handles styles for given equationData
         * @method _handleTableStyleType
         * @param equationData {Object} equationData model object
         * @param styleType {String} style type of equationData
         * @param tableShown {Boolean} table visible property
         * @param onlyPolygon {Boolean} is column style polygon
         * @return void
         */
        "_handleTableStyleType": function(equationData, styleType, tableShown, onlyPolygon) {
            var plotEquation = equationData.getPlot(),
                equationPlotPathGroup,
                plotColumn = this._getPlotColumn(equationData),
                pathGroup,
                _equationDataManager = this.model.get('_equationDataManager');
            if (styleType === 'points') {
                this._showColEquationDataPoints(equationData, tableShown);
                this._graphingToolView.trigger("add-paper-items", false, "table-element");
            } else {
                if (styleType === 'line') {
                    this._showColGraphHidePoints(equationData, tableShown);
                } else {
                    this._showColGraphAndPoints(equationData, tableShown);
                }
                if (equationData.getSpecie() !== 'plot' || onlyPolygon) {
                    pathGroup = equationData.getPathGroup();
                    if (pathGroup !== null) {
                        pathGroup.remove();
                    }
                    equationData.flushPointsData();
                    equationData.setSpecie('polygon');
                    equationData.setPoints(plotEquation.getPoints());
                    equationData.setPointVisibility(false);
                    _equationDataManager.addPlotEquation(equationData);
                    if (tableShown === true) {
                        if (plotColumn) {
                            equationData.setCurveVisibility(tableShown);
                            _equationDataManager.drawPolygon(equationData);
                        }
                    }
                    equationPlotPathGroup = equationData.getPathGroup();
                    if (equationPlotPathGroup !== null) {
                        equationPlotPathGroup.strokeJoin = 'round';
                    }
                } else {
                    if (tableShown && plotColumn) {
                        _equationDataManager.parseEquation(equationData);
                        equationData.showGraph();
                    }
                }
            }
        },
        /**
         * _showColGraphAndPoints shows graph points
         * @method _showColGraphAndPoints
         * @param {Object} equationData model object
         * @return void
         */
        "_showColGraphAndPoints": function(equationData, tableShown) {
            var equationPlot = equationData.getPlot(),
                equationThickness = equationData.getThickness(),
                plotColumn = this._getPlotColumn(equationData);
            if (equationPlot !== null) {
                equationPlot.changeColor(equationData.getColor());
                if (tableShown === true && plotColumn) {
                    equationPlot.showGraph();
                }
                if (equationThickness !== equationPlot.getThickness()) {
                    equationPlot.setThickness(equationThickness);
                    equationPlot.changeThickness(equationThickness);
                }
            }
            if (tableShown === true && plotColumn) {
                equationData.showGraph();
            }
        },
        /**
         * _showColGraphHidePoints shows graph and hides points
         * @method _showColGraphHidePoints
         * @param {Object} equationData model object
         * @param {Boolean} tableShown Boolean whether the plots for the table are visible
         * @param {Boolean} hideTooltip flag to denote to hide tool tip for coinciding points
         * @return void
         */
        "_showColGraphHidePoints": function(equationData, tableShown, hideTooltip) {
            var equationPlot = equationData.getPlot(),
                points,
                plotColumn = this._getPlotColumn(equationData);
            if (equationData !== null && tableShown && plotColumn) {
                equationData.showGraph();
            }
            if (equationPlot !== null) {
                if (hideTooltip) {
                    points = equationPlot.getPoints();
                    if (points && points.length > 0) {
                        this.checkIfChangeInPoint(points.slice(), []);
                    }
                }
                equationPlot.hideGraph();
            }
        },
        /**
         * _showColEquationDataPoints shows column points
         * @method _showColEquationDataPoints
         * @param {Object} equationData model object
         * @param {Boolean} tableShown Boolean whether the plots for the table are visible
         * @param {Boolean} showTooltip flag to denote to show tool tip for coinciding points
         * @return void
         */
        "_showColEquationDataPoints": function(equationData, tableShown, showTooltip) {
            var equationPlot = equationData.getPlot(),
                points = equationPlot.getPoints(),
                plotColumn = this._getPlotColumn(equationData);
            equationData.setCurveVisibility(false);
            equationData.setPointVisibility(true);
            equationPlot.setThickness(equationData.getThickness());
            equationPlot.changeThickness(equationData.getThickness());
            if (tableShown && plotColumn) {
                equationPlot.showGraph();
                if (points && points.length > 0 && showTooltip) {
                    this.checkIfChangeInPoint([], points.slice());
                }
            }
            if (equationData !== null) {
                equationData.hideGraph();
                if (points && points.length > 0 && showTooltip) {
                    this.checkIfChangeInPoint(points.slice(), []);
                }
            }
        },
        /**
         * _parseTable parses the cell passed to this method
         * @method _parseTable
         * @param {Object} $cell Json object of a cell
         * @param {Object} tableView object of table view
         * @param {Boolean} isSliderChange flag for slider
         * @param {Boolean} isUndoRedoAction flag for undo redo action
         * @return void
         */
        "_parseTable": function($cell, tableView, isSliderChange, isUndoRedoAction) {
            if (this._vmkClicked || $cell.hasClass('cell-disabled') && !$cell.attr('data-dependent-no')) {
                return void 0;
            }
            var equationData,
                cellId,
                rowNo,
                colNo,
                $list,
                $listError,
                $colHeader,
                totalCols,
                colCounter,
                equationCid,
                latex,
                prevLatex = $cell.attr('data-prev-latex'),
                colContent,
                undoRedoData,
                isRowHeader,
                cellAttrId, columnCid,
                target,
                errorString;
            latex = $cell.find('.mathquill-editable-size').mathquill('latex').replace(/\\spacing@/g, '');
            if (latex === '' && prevLatex === void 0 && !isUndoRedoAction || prevLatex === latex && !isSliderChange) {
                return void 0;
            }
            $list = $cell.parents('.list');
            if (typeof tableView === 'undefined' || tableView === false) {
                tableView = this._getTableViewObject($list);
            }
            cellAttrId = $cell.attr('id');
            cellId = cellAttrId.split('-');
            target = tableView.getCellAt(1, 1).attr('data-equation-cid');
            rowNo = Number(cellId[0]);
            colNo = Number(cellId[1]);
            columnCid = tableView._getColumnCid(colNo);
            isRowHeader = tableView.getRowHeaderState();
            if (latex !== prevLatex) {
                tableView.setCopyBtnContainerWidth();
                if (!isUndoRedoAction) {
                    undoRedoData = {
                        "undo": {
                            "latex": prevLatex,
                            "cellId": cellAttrId,
                            "target": target,
                            "columnCid": columnCid,
                            "rowNo": rowNo
                        },
                        "redo": {
                            "latex": latex,
                            "cellId": cellAttrId,
                            "target": target,
                            "columnCid": columnCid,
                            "rowNo": rowNo
                        }
                    };
                }
            }
            totalCols = tableView.getColCount();
            $cell.attr('data-prev-latex', latex);
            if (rowNo === 1) {
                if (colNo === 1) {
                    if (isRowHeader) {
                        $cell.removeAttr('data-cell-definition');
                        this._updateWarningForCell($cell, {
                            "hasError": false,
                            "cid": tableView.cid
                        });
                        if (tableView.getCellAt(2, colNo).hasClass('cell-disabled')) { // check if column disabled by checking 2nd row
                            tableView.enableAllCellsInColumn(colNo);
                        }
                    } else {
                        colContent = this._parseTableColumn(colNo, tableView, false, true, isSliderChange);
                    }
                    for (colCounter = 2; colCounter <= totalCols; colCounter++) {
                        if (!tableView.getCellAt(1, colCounter).attr('data-ignore-column')) {
                            this._parseTableColumn(colCounter, tableView, false, true, isSliderChange);
                            totalCols = tableView.getColCount();
                        }
                    }
                } else {
                    $cell.find('.non-italicized-function, .mathquill-rendered-math .text').toggleClass('label-cell-italicized-function',
                        this._isHeaderlabel(tableView, colNo));
                    equationCid = $cell.attr('data-equation-cid');
                    equationData = this._getEquationDataUsingCid(equationCid);
                    equationData.setPrevLatex(prevLatex);
                    colContent = this._parseTableColumn(colNo, tableView, equationData, false, isUndoRedoAction);
                    tableView._addRightHiddenIconClasses($cell, true);
                }
            } else {
                this._setCellSolution($cell, tableView);
                if (colNo === 1) {
                    //call row function here
                    this._parseTableRow(rowNo, tableView);
                } else {
                    this._parseTableColumn(colNo, tableView, false, true, isSliderChange);
                    // plot Point
                }
            }
            if (!isUndoRedoAction && colContent !== void 0 && undoRedoData !== void 0) {
                undoRedoData.undo.colNo = colNo;
                undoRedoData.undo.colContent = colContent;
                colContent = tableView.getColumnContent(colNo);
                undoRedoData.redo.colNo = colNo;
                undoRedoData.redo.colContent = colContent;
            }
            if (!isUndoRedoAction && undoRedoData !== void 0) {
                this.execute('tableCellDataChange', undoRedoData);
            }
            $listError = $list.find('.list-header-container .handler-warning');
            if ($list.find('.table-error').length === 0) {
                $listError.removeClass('error');
            } else {
                errorString = this.model.get("ERROR_STRINGS").TABLE_ERRORS.TableHasError;
                $list.find('.handler-warning-text').html(errorString);
                if (this._graphingToolView.isAccDivPresent($list.find('.handler-warning.error'))) {
                    this.accManagerView.updateFocusRect($list.find('.handler-warning.error').attr('id'));
                }
            }
            tableView.trigger('data-changed', colNo, isUndoRedoAction);
            this._adjustTableHeaderHeightForIE(tableView);
        },
        /**
         * _parseTableRow parses the entire row according to the equationData in the specific column
         * @method _parseTableRow
         * @param {Number} rowNumber
         * @param {Object} tableView object of table view
         * @param {Number} colNo column number
         * @param {Boolean} isIgnoreRow Whether to ignore row data setting
         * @return void
         */
        "_parseTableRow": function(rowNumber, tableView, colNo, isIgnoreRow) {
            var $header,
                columnNo,
                headerEquationData,
                cid,
                isConstantInPrevHeaderCase,
                latex, specie, yCoord,
                colCount = tableView.getColCount(),
                point = [],
                equationPlot,
                isDeclared,
                $list = tableView.$el.parents('.list'),
                _equationDataManager = this.model.get('_equationDataManager'),
                $cell, errorSting,
                solution,
                inEqualityType,
                cellLatex,
                isXDeclared,
                leftVal,
                rightVal,
                equationXCoord,
                isPlotColumn,
                rowHeader,
                doNoPlot,
                isColDisable,
                xCoord = tableView.getCellContent(tableView.getCellAt(rowNumber, 1), {
                    "solution": true
                });
            rowHeader = tableView.getRowHeaderState();
            if (typeof colNo === 'undefined' || colNo === false) {
                colNo = 1;
                if (rowHeader) {
                    colNo = 2;
                }
            }
            if (xCoord !== '') {
                if (typeof xCoord === 'undefined') {
                    xCoord = '';
                }
                if (xCoord !== '') {
                    xCoord = Number(xCoord);
                }
            }
            for (columnNo = colNo; columnNo <= colCount; columnNo++) {
                $cell = tableView.getCellAt(rowNumber, columnNo);
                $header = tableView.getHeaderCellOfCell($cell);
                cid = $header.attr('data-equation-cid');
                headerEquationData = this._getEquationDataUsingCid(cid);
                isPlotColumn = this._getPlotColumn(headerEquationData);
                if (isPlotColumn === false && rowNumber !== 1) {
                    $cell.addClass('plot-column-disabled');
                }
                if (typeof $header.attr('data-ignore-column') !== 'undefined') {
                    continue;
                }
                equationPlot = headerEquationData.getPlot();
                latex = headerEquationData.getLatex();
                cellLatex = tableView.getCellContent($cell);
                if (this._isHeaderlabel(tableView, columnNo)) {
                    this._setCellSolution($cell, tableView, false, false, isIgnoreRow);
                    point = tableView.getMultipleColContent(columnNo, true);
                    this._setAndDrawPointsForTable(headerEquationData, point, tableView, true, doNoPlot);
                    colCount = tableView.getColCount();
                    continue;
                }
                if ($cell.hasClass('cell-disabled')) {
                    isColDisable = true;
                }
                // check if header is already declared
                isDeclared = this._isHeaderDeclared(latex, tableView, columnNo);
                if (isDeclared !== false) {
                    // copy column data
                    tableView.copyColumn(isDeclared, columnNo, true);
                    point = tableView.getMultipleColContent(columnNo, true);
                    if (isColDisable !== true) {
                        tableView.disableAllCellsInColumn(columnNo);
                    }
                    this._setAndDrawPointsForTable(headerEquationData, point, tableView, false, doNoPlot, columnNo);
                    colCount = tableView.getColCount();
                    continue;
                }
                if (latex === 'y' || latex === 'x') {
                    this._setCellSolution($cell, tableView, false, false, isIgnoreRow);
                    point = tableView.getMultipleColContent(columnNo, true);
                    this._setAndDrawPointsForTable(headerEquationData, point, tableView, false, doNoPlot, columnNo);
                    colCount = tableView.getColCount();
                    this._parseDependentCols(latex, tableView, columnNo);
                    continue;
                }
                specie = headerEquationData.getSpecie();
                inEqualityType = headerEquationData.getInEqualityType();
                if (specie === 'error') {
                    isConstantInPrevHeaderCase = this._checkForConstantCase(columnNo, headerEquationData, tableView);
                    if (isConstantInPrevHeaderCase === false) {
                        _equationDataManager.removePoint(equationPlot);
                        errorSting = this._getErrorStringForTable(headerEquationData.getErrorCode());
                        this._updateWarningForCell($header, {
                            "hasError": true,
                            "errorCode": errorSting,
                            "equationData": headerEquationData,
                            "cid": tableView.cid
                        });
                        this.clearColumnData(columnNo, $list);
                        if (isColDisable !== true) {
                            tableView.disableAllCellsInColumn(columnNo);
                        }
                    } else {
                        if (isConstantInPrevHeaderCase === true) {
                            if (cellLatex.indexOf('x') !== -1) {
                                yCoord = this._solvelatex(cellLatex, false, xCoord);
                                tableView.setCellContent($cell, yCoord, true);
                                $cell.find('.mathquill-editable').mathquill('latex', cellLatex);
                            }
                            point = tableView.getMultipleColContent(columnNo, true);
                            this._setAndDrawPointsForTable(headerEquationData, point, tableView, false, doNoPlot);
                            colCount = tableView.getColCount();
                            this._parseDependentCols(headerEquationData.getLatex(), tableView, colCount - 1);
                        } else {
                            this._callSolveEquationUsingConstant(isConstantInPrevHeaderCase, columnNo, headerEquationData, tableView);
                        }
                    }
                }
                if (headerEquationData.getSpecie() === 'error') {
                    continue;
                }
                if (specie === 'plot' && inEqualityType === 'equal') {
                    isXDeclared = this._isXDeclared(tableView, columnNo, rowHeader);
                    if (isXDeclared === false) {
                        leftVal = headerEquationData.getLeftInequalityRoot().value;
                        rightVal = this._solveLatexForRightValue(headerEquationData);
                        // since x=4 y=6 is considered as constant
                        if ((leftVal === 'x' || leftVal === 'y') && rightVal !== 'undefined' && !isNaN(rightVal) && rightVal !== null) {
                            yCoord = rightVal;
                            tableView.setCellContent($cell, yCoord, true);
                        }
                    }
                    equationXCoord = tableView.getCellContent(tableView.getCellAt(rowNumber, isXDeclared), {
                        "solution": true
                    });
                    yCoord = this._getSolution(headerEquationData, equationXCoord);
                    if (yCoord === '') {
                        leftVal = headerEquationData.getLeftInequalityRoot().value;
                        rightVal = this._solveLatexForRightValue(headerEquationData);
                        // since x=4 y=6 is considered as constant
                        if ((leftVal === 'x' || leftVal === 'y') && rightVal !== 'undefined' && !isNaN(rightVal) && rightVal !== null) {
                            yCoord = rightVal;
                        }
                    }
                    tableView.setCellContent($cell, yCoord, true);
                }
                solution = headerEquationData.getSolution();
                if (typeof solution === 'number') {
                    yCoord = headerEquationData.getSolution();
                    this._setCellSolution($cell, tableView);
                    tableView.setCellContent($cell, yCoord, true);
                } else if (specie !== 'linear' && specie !== 'quadratic' && specie !== 'plot' && specie !== 'polygon') {
                    //set solution
                    yCoord = this._getSolution(headerEquationData, xCoord);
                    this._setCellSolution($cell, tableView);
                    tableView.setCellContent($cell, yCoord, true);
                    // plot Point
                } else {
                    this._setCellSolution($cell, tableView);
                    //parse and set solution for constant columns
                }
                point = tableView.getMultipleColContent(columnNo, true);
                this._setAndDrawPointsForTable(headerEquationData, point, tableView, false, doNoPlot, columnNo);
                colCount = tableView.getColCount();
            }
        },
        /**
         * _parseDependentCols gets all the cells that contain the given constant value
         * @method _parseDependentCols
         * @param {Array} constants list
         * @param {Object} tableView view of table
         * @param {Number} colNumber column number
         * @return void
         */
        "_parseDependentCols": function(constant, tableView, colNumber) {
            var noOfCols = tableView.getColCount(),
                colCounter,
                headerContent,
                $headerCell;
            for (colCounter = colNumber + 1; colCounter <= noOfCols; colCounter++) {
                $headerCell = tableView.getCellAt(1, colCounter);
                if ($headerCell.attr('data-ignore-column') === 'true') {
                    continue;
                }
                headerContent = tableView.getCellContent($headerCell);
                if (headerContent.indexOf(constant) !== -1) {
                    this._parseTableColumn(colCounter, tableView);
                }
                noOfCols = tableView.getColCount();
            }
        },
        /**
         * _getCellsHavingDefinition gets all the cells that contain the given constant value
         * @method _getCellsHavingDefinition
         * @param {String} constants
         * @return array of JSON objects
         */
        "_getCellsHavingDefinition": function(constants) {
            var cellsHavingConstant = [],
                $cell,
                cellConstantList = [],
                cellsList = [],
                constantCounter,
                noOfConstants = constants.length,
                constant,
                length, count;
            cellsList = this.$('.cell[data-cell-definition]');
            length = cellsList.length;
            for (constantCounter = 0; constantCounter < noOfConstants; constantCounter++) {
                constant = constants[constantCounter].name;
                for (count = 0; count < length; count++) {
                    $cell = cellsList.eq(count);
                    cellConstantList = $cell.attr('data-cell-definition');
                    cellConstantList = JSON.parse(cellConstantList);
                    if (cellConstantList.indexOf(constant) !== -1) {
                        cellsHavingConstant.push($cell);
                    }
                }
            }
            return cellsHavingConstant;
        },
        /**
         * _isXDeclared checks if x is declared in prev cols
         * @method _isXDeclared
         * @param tableView {Object}
         * @param colNo {Number} column number
         * @param ignoreFirstCol {Boolean} to ignore first col
         * @return {Boolean}
         */
        "_isXDeclared": function(tableView, colNo, ignoreFirstCol) {
            var startCol,
                latex,
                $cell;
            if (ignoreFirstCol) {
                startCol = 2;
            } else {
                startCol = 1;
            }
            for (; startCol < colNo; startCol++) {
                if (this._isHeaderlabel(tableView, startCol) === false) {
                    $cell = tableView.getCellAt(1, startCol);
                    latex = $cell.find('.mathquill-editable').mathquill('latex');
                    if (latex === 'x') {
                        return startCol;
                    }
                }
            }
            return false;
        },
        /**
         * _parseTableColumn parses the table column
         * @method _parseTableColumn
         * @param {Object} equationData
         * @param {Object} tableView object of table view
         * @param {Number} colNumber
         * @param {Boolean} isSliderChange is the function call due to slider change
         * @param {Boolean} isUndoRedoAction is the function call for undo redo
         * @return void
         */
        "_parseTableColumn": function(colNumber, tableView, equationData, isSliderChange, isUndoRedoAction) {
            var $column = tableView.getColumn(colNumber),
                $table = tableView.$el,
                $list = $table.parents('.list'),
                $colHeader = $column.first(),
                latex,
                $header,
                rowCounter = 2,
                $xCoordCell,
                xCoord,
                points = [],
                specie,
                inEqualityType,
                solution,
                canDefine, $cell,
                errorString,
                yCoord,
                _equationDataManager = this.model.get('_equationDataManager'),
                undoRedoData,
                leftVal,
                rightVal,
                colData,
                prevLatex,
                isXDeclared,
                isConstant,
                residualEquationData,
                _TABLE_ERRORS = this.model.get('ERROR_STRINGS').TABLE_ERRORS,
                isConstantInPrevHeaderCase,
                totalRows = tableView.getRowCount(),
                isColDisabled,
                rowHeaderCheck = tableView.getRowHeaderState(),
                isDeclared,
                constantDeclarationErrorString,
                doNotPlot = null;
            // enable cell in column if col is disabled
            if ($column.eq(1).hasClass('cell-disabled')) {
                isColDisabled = true;
            }
            if (!equationData) {
                equationData = this._getEquationDataUsingCid($colHeader.attr('data-equation-cid'));
            }
            latex = tableView.getCellContent($colHeader);
            latex = this._processLatex(latex);
            if (equationData.getDependentColumnNo() && latex === "Residual" && $column.eq(0).find('.handler-warning').hasClass('table-error')) {
                return void 0;
            }
            prevLatex = equationData.getPrevLatex();
            equationData.setLatex(latex, true);
            // to avoid issues when a variable is previously declared in colheader and later changed
            if (typeof prevLatex !== 'undefined' && prevLatex !== null) {
                isConstant = this._checkIfVariable(prevLatex);
            }
            isConstant = prevLatex === 'y' || isConstant;
            // if header type is label ignore parsing and return
            if (this._isHeaderlabel(tableView, colNumber)) {
                if (isColDisabled && equationData && equationData.getResidualType() !== "residual") {
                    tableView.enableAllCellsInColumn(colNumber);
                }
                this._updateWarningForCell($colHeader, {
                    "hasError": false,
                    "errorCode": '',
                    "equationData": equationData,
                    "isLabel": true,
                    "cid": tableView.cid
                });
                this._resetColumnCellSolution(colNumber, tableView);
                points = tableView.getMultipleColContent(colNumber, true);
                if (latex === '') {
                    points = [];
                    this._removePlots(equationData);
                    this._setAndDrawPointsForTable(equationData, [], tableView, true, true);
                    this._updateResidualColumns({
                        "equationData": equationData,
                        "tableView": tableView,
                        "isDeleted": true
                    });
                } else {
                    this._setAndDrawPointsForTable(equationData, points, tableView, true, false);
                    this._updateResidualColumns({
                        "equationData": equationData,
                        "tableView": tableView
                    });
                }
                $colHeader.attr('data-prev-latex', latex);
                if (isConstant) {
                    this._parseDependentCols(latex, tableView, colNumber);
                }
                return void 0;
            }
            // parse header
            equationData.setConstants(_equationDataManager.getConstants());
            equationData.setCustomFunctions(_equationDataManager.get('_parseFunctions'));
            equationData.setFunctions(_equationDataManager.get('_parseFunctionsEngine'));
            _equationDataManager.parseEquation(equationData, true);
            this._setCellSolution($colHeader, tableView, equationData);
            // check if header is already declared
            isDeclared = this._isHeaderDeclared(latex, tableView, colNumber);
            if (isDeclared !== false) {
                // is declared already so copy column, draw points and return
                // copy column data

                tableView.copyColumn(isDeclared, colNumber, true);
                points = equationData.getResidualColumnNo() ? tableView.getMultipleColContent(colNumber, false) :
                    tableView.getMultipleColContent(colNumber, true);
                if (!isColDisabled) {
                    for (; rowCounter <= totalRows; rowCounter++) {
                        $cell = tableView.getCellAt(rowCounter, colNumber);
                        if (tableView.getCellContent($cell) === 'undefined') {
                            this._updateWarningForCell($cell, {
                                "hasError": false,
                                "cid": tableView.cid
                            });
                        }
                    }
                    tableView.disableAllCellsInColumn(colNumber);
                }
                $header = tableView.getCellAt(1, isDeclared);
                if ($header.find('.table-error').length !== 0) {
                    this._updateWarningForCell($colHeader, {
                        "hasError": true,
                        "errorCode": _TABLE_ERRORS.CANNOT_UNDERSTAND,
                        "equationData": equationData,
                        "cid": tableView.cid
                    });
                    this._removePlots(equationData);
                } else {
                    this._updateWarningForCell($colHeader, {
                        "hasError": false,
                        "errorCode": '',
                        "equationData": equationData,
                        "cid": tableView.cid
                    });
                    this._setAndDrawPointsForTable(equationData, points, tableView, null, null, colNumber);
                    this._updateResidualColumns({
                        "equationData": equationData,
                        "tableView": tableView
                    });
                }
                return void 0;
            }
            // is header a variable
            if (latex === 'y' || latex === 'x') {
                if (tableView.getHeaders(colNumber).indexOf(latex) === -1 && equationData.getResidualColumnNo()) {
                    this._updateWarningForCell($colHeader, {
                        "hasError": true,
                        "errorCode": this._getErrorStringForTable("ConstantDeclaration"),
                        "equationData": equationData
                    });
                    return void 0;
                }
                if (isColDisabled) {
                    tableView.enableAllCellsInColumn(colNumber);
                }
                this._updateWarningForCell($colHeader, {
                    "hasError": false,
                    "errorCode": '',
                    "equationData": equationData,
                    "rowHeader": rowHeaderCheck,
                    "cid": tableView.cid
                });
                points = tableView.getMultipleColContent(colNumber, true);
                if (colNumber !== 1) {
                    this._setAndDrawPointsForTable(equationData, points, tableView, null, null, colNumber);

                    this._updateResidualColumns({
                        "equationData": equationData,
                        "tableView": tableView
                    });
                }
                this._parseDependentCols(latex, tableView, colNumber);
                $colHeader.attr('data-prev-latex', latex);
                if (isColDisabled) {
                    tableView.enableAllCellsInColumn(colNumber);
                    for (rowCounter = 2; rowCounter <= totalRows; rowCounter++) {
                        $cell = tableView.getCellAt(rowCounter, colNumber);
                        if (tableView.getCellContent($cell) === 'undefined') {
                            constantDeclarationErrorString = this._getErrorStringForTable("ConstantDeclaration");
                            this._updateWarningForCell($cell, {
                                "hasError": true,
                                "errorCode": constantDeclarationErrorString,
                                "cid": tableView.cid
                            });
                        }
                    }
                }
                if (latex === 'x') {
                    this._parseDependentCols(latex, tableView, colNumber);
                }
                return void 0;
            }
            specie = equationData.getSpecie();
            inEqualityType = equationData.getInEqualityType();
            if (specie === 'plot' && inEqualityType === 'equal') {
                // check whether x is declared
                isXDeclared = this._isXDeclared(tableView, colNumber, rowHeaderCheck);
                if (isXDeclared === false && equationData.getFreeVars().x) {
                    // since x is not declared throw error and return
                    leftVal = equationData.getLeftInequalityRoot().value;
                    rightVal = this._solveLatexForRightValue(equationData);
                    // since x=4 y=6 is considered as constant
                    if (leftVal === 'x' && rightVal !== 'undefined' && !isNaN(rightVal) && rightVal !== null) {
                        yCoord = rightVal;
                        this._updateWarningForCell($colHeader, {
                            "hasError": false,
                            "errorCode": '',
                            "equationData": equationData,
                            "cid": tableView.cid
                        });
                        for (rowCounter = 2; rowCounter <= totalRows; rowCounter++) {
                            tableView.setCellContent($column.eq(rowCounter - 1), yCoord, true);
                        }
                    } else {
                        this._updateWarningForCell($colHeader, {
                            "hasError": true,
                            "errorCode": _TABLE_ERRORS.defineX,
                            "equationData": equationData,
                            "cid": tableView.cid
                        });
                        this.setResidualError({
                            "colHeader": $colHeader,
                            "equationData": equationData,
                            "colNumber": colNumber,
                            "errorString": _TABLE_ERRORS.defineX,
                            "tableView": tableView,
                            "list": $list
                        });
                        if (equationData.getPlot()) {
                            points = equationData.getPlot().getPoints();
                        }
                        this._removePlots(equationData);
                        doNotPlot = true;
                        this.clearColumnData(colNumber, $list);
                        if (equationData.getPlot()) {
                            equationData.getPlot().setPoints(points);
                        }
                        if (!isColDisabled) {
                            tableView.disableAllCellsInColumn(colNumber);
                        }
                        this._showSingleHiddenColumn(colNumber, tableView);
                    }
                } else {
                    // solve equation with the corresponding x coordinate.
                    for (rowCounter = 2; rowCounter <= totalRows; rowCounter++) {
                        $xCoordCell = tableView.getCellAt(rowCounter, isXDeclared);
                        xCoord = tableView.getCellContent($xCoordCell, {
                            "solution": true
                        });
                        // if xCoord is not defined or blank set y as blank else solve
                        if (xCoord === '' || typeof xCoord === 'undefined') {
                            yCoord = '';
                            leftVal = equationData.getLeftInequalityRoot().value;
                            rightVal = this._solveLatexForRightValue(equationData);
                            // since x=4 y=6 is considered as constant
                            if ((leftVal === 'x' || leftVal === 'y') && rightVal !== 'undefined' && !isNaN(rightVal)) {
                                yCoord = rightVal;
                            }
                            tableView.setCellContent($column.eq(rowCounter - 1), yCoord, true);
                        } else {
                            xCoord = Number(xCoord);
                            yCoord = this._getSolution(equationData, xCoord);
                            tableView.setCellContent($column.eq(rowCounter - 1), yCoord, true);
                        }
                    }
                    this._updateWarningForCell($colHeader, {
                        "hasError": false,
                        "errorCode": '',
                        "equationData": equationData,
                        "cid": tableView.cid
                    });
                }
                points = tableView.getMultipleColContent(colNumber, true);
                this._setAndDrawPointsForTable(equationData, points, tableView, null, doNotPlot, colNumber);
                this._updateResidualColumns({
                    "equationData": equationData,
                    "tableView": tableView
                });
                if (!isColDisabled) {
                    tableView.disableAllCellsInColumn(colNumber);
                }
            } else {
                solution = equationData.getSolution();
                // if it has a valid solution
                if (solution !== null && equationData.isCanBeSolved()) {
                    if (specie !== 'linear' && specie !== 'quadratic') {
                        // if equationData has solution and specie is not linear or quadratic blindly use it
                        for (rowCounter = 2; rowCounter <= totalRows; rowCounter++) {
                            yCoord = solution;
                            tableView.setCellContent($column.eq(rowCounter - 1), yCoord, !isNaN(solution));
                            if (!isColDisabled) {
                                $cell = tableView.getCellAt(rowCounter, colNumber);
                                this._updateWarningForCell($cell, {
                                    "hasError": false,
                                    "cid": tableView.cid
                                });
                            }
                        }
                        points = tableView.getMultipleColContent(colNumber, true);
                        this._updateWarningForCell($colHeader, {
                            "hasError": false,
                            "errorCode": '',
                            "equationData": equationData,
                            "cid": tableView.cid
                        });
                        this._setAndDrawPointsForTable(equationData, points, tableView, null, null, colNumber);
                        if (!isColDisabled) {
                            tableView.disableAllCellsInColumn(colNumber);
                        }
                    }
                } else {
                    // check for constant in header case where constant is not declared
                    isConstantInPrevHeaderCase = this._checkForConstantCase(colNumber, equationData, tableView);
                    if (isConstantInPrevHeaderCase === false) {
                        canDefine = false;
                        // has error return
                        if (equationData.getErrorCode() === 'OnlyNumbers') {
                            // to handle n=2 type cases
                            canDefine = this._solveOnlyNumbersEquation(equationData, $colHeader);
                        }
                        if (canDefine) {
                            if (equationData.getResidualColumnNo()) {
                                this._updateWarningForCell(tableView.getColumn(colNumber + 1).first(), {
                                    "hasError": true,
                                    "errorCode": errorString,
                                    "equationData": this._getEquationDataUsingCid(tableView._getColumnCid(colNumber + 1))
                                });
                                this.clearColumnData(colNumber + 1, $list);
                            }
                            this._updateWarningForCell($colHeader, {
                                "hasError": false,
                                "errorCode": '',
                                "equationData": equationData,
                                "cid": tableView.cid
                            });
                            solution = equationData.getSolution();
                            for (rowCounter = 2; rowCounter <= totalRows; rowCounter++) {
                                $xCoordCell = tableView.getCellAt(rowCounter, 1);
                                xCoord = tableView.getCellContent($xCoordCell, {
                                    "solution": true
                                });
                                yCoord = solution;
                                tableView.setCellContent($column.eq(rowCounter - 1), yCoord, true);
                                if (rowHeaderCheck) {
                                    points.push([rowCounter - 1, yCoord]);
                                } else if (xCoord !== '' && xCoord !== void 0 && colNumber !== 1) {
                                    points.push([xCoord, yCoord]);
                                }
                            }
                            this._updateWarningForCell($colHeader, {
                                "hasError": false,
                                "errorCode": '',
                                "equationData": equationData,
                                "cid": tableView.cid
                            });
                            this._setAndDrawPointsForTable(equationData, points, tableView);
                        } else {
                            this._setAndDrawPointsForTable(equationData, [], tableView, null, true);
                            this._removePlots(equationData);
                            if (equationData.getSpecie() === 'plot') {
                                errorString = 'CannotUnderstandThis';
                            } else {
                                errorString = equationData.getErrorCode();
                            }
                            errorString = this._getErrorStringForTable(errorString);
                            colData = tableView.getColumnContent(colNumber);
                            this.setResidualError({
                                "colHeader": $colHeader,
                                "equationData": equationData,
                                "colNumber": colNumber,
                                "errorString": errorString,
                                "tableView": tableView,
                                "list": $list
                            });
                            if (tableView.model.get('residualColumnStates') && tableView.model.get('residualColumnStates')[tableView._getColumnCid(colNumber)]) {
                                this._updateResidualColumns({
                                    "equationData": equationData,
                                    "tableView": tableView,
                                    "isDeleted": true
                                });
                            }
                        }
                        if (!isColDisabled) {
                            tableView.disableAllCellsInColumn(colNumber);
                        }
                    } else {
                        if (isConstantInPrevHeaderCase === true) {
                            // is a valid constant declaration mock as y
                            if (isColDisabled) {
                                tableView.enableAllCellsInColumn(colNumber);
                            }
                            if (specie === 'error' && isSliderChange) {
                                if (!isUndoRedoAction) {
                                    undoRedoData = {};
                                    undoRedoData.undo = {};
                                    undoRedoData.redo = {};
                                    undoRedoData.undo.target = equationData.getCid();
                                    undoRedoData.undo.colNo = colNumber;
                                    undoRedoData.redo.target = equationData.getCid();
                                    undoRedoData.redo.colNo = colNumber;
                                    undoRedoData.undo.colData = tableView.getColumnContent(colNumber);
                                }
                                if (!(isUndoRedoAction || isSliderChange || this._isArrayBlank(undoRedoData.undo.colData))) {
                                    undoRedoData.redo.colData = tableView.getColumnContent(colNumber);
                                }
                            }
                            points = tableView.getMultipleColContent(colNumber, true);
                            this._setAndDrawPointsForTable(equationData, points, tableView, null, null, colNumber);
                            this._updateWarningForCell($colHeader, {
                                "hasError": false,
                                "errorCode": '',
                                "equationData": equationData,
                                "cid": tableView.cid
                            });
                            this._parseDependentCols(equationData.getLatex(), tableView, colNumber);
                        } else {
                            // depends on constants declared in table hence solving
                            this._callSolveEquationUsingConstant(isConstantInPrevHeaderCase, colNumber, equationData, tableView);
                            if (!isColDisabled) {
                                tableView.disableAllCellsInColumn(colNumber);
                            }
                        }
                    }
                }
            }
            if (isConstant && !isSliderChange) {
                this._parseDependentCols(prevLatex, tableView, colNumber);
            }
            return colData;
        },
        /**
         * _solveLatexForRightValue solve latex for given value
         * @method _solveLatexForRightValue
         * @param headerEquationData {Object}
         */
        "_solveLatexForRightValue": function(headerEquationData) {
            return this._solvelatex(headerEquationData.getRightExpression().expression);
        },
        /**
         * _isHeaderlabel check if the given col header is label or function
         * @method _isHeaderlabel
         * @param tableView {Object}
         * @param colNo {Number}
         * @return {Boolean}
         */
        "_isHeaderlabel": function(tableView, colNo) {
            return tableView.getLabelOfFunctionOption(colNo) === 'L';
        },
        /**
         * _isArrayBlank checks if the given array is blank
         * @method _isArrayBlank
         * @param array {Array}
         * @return {Boolean}
         */
        "_isArrayBlank": function(array) {
            var length,
                counter;
            length = array.length;
            for (counter = 0; counter < length; counter++) {
                if (array[counter] === '') {
                    continue;
                }
                return false;
            }
            return true;
        },
        /**
         * _solveOnlyNumbersEquation handles case of OnlyNumbers
         * @method _solveOnlyNumbersEquation
         * @param equationData {Object} equationData object
         * @param $cell {Object} jQuery object
         * @return {Boolean}
         */
        "_solveOnlyNumbersEquation": function(equationData, $cell) {
            var rightExp = equationData.getRightExpression(),
                rightLatex = rightExp.expression,
                solution,
                tokens = equationData.getLeftExpression().tokens;
            if (equationData.getLatex().indexOf('=') > -1 && tokens.length === 1 &&
                (tokens[0].type === 'const' ||
                    tokens[0].type === 'func' &&
                    tokens[0].value === '\\customFunc')) {
                solution = this._solvelatex(rightLatex, $cell);
                if (solution !== null && typeof solution !== 'object') {
                    equationData.setSolution(solution);
                    equationData.setCanBeSolved(true);
                    equationData.setSpecie('expression');
                    return true;
                }
            }
            return false;
        },
        /**
         * _solvelatex solves given latex
         * @method _solvelatex
         * @param latex {String} latex string to be solved
         * @param $cell {Object}
         * @param xCoord {Number}
         * @return {Number} solution
         */
        "_solvelatex": function(latex, $cell, xCoord) {
            var equationData,
                equationManager,
                constants,
                solution = null;
            if (isNaN(latex)) {
                if (typeof latex === 'undefined') {
                    return null;
                }
                latex = this._processLatex(latex);
                equationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
                equationData.getDirectives().FDFlagMethod = 'graphing';
                equationData.setLatex(latex, true);
                equationManager = this.model.get('_equationDataManager');
                equationData.setPointVisibility(false);
                equationData.setCurveVisibility(false);
                constants = equationManager.getConstants();
                equationData.setConstants(constants);
                equationData.getUnits().angle = this.model.get('equationDataUnits');
                equationManager.parseEquation(equationData, true);
                if ($cell) {
                    $cell.attr('data-cell-definition', JSON.stringify(equationManager._callGetAllConstants(equationData, true)));
                }
                if (equationData.getSpecie() === 'plot') {
                    return this._getSolution(equationData, xCoord);
                }
                solution = equationData.getSolution();
            } else {
                solution = Number(latex);
            }
            return solution;
        },
        /**
         * _callSolveEquationUsingConstant creates constant object and solves equation
         * @method _callSolveEquationUsingConstant
         * @param {Array} array of headers
         * @param {Number} column number
         * @param {Object} equationData object
         * @param {Object} table view object
         * @return void
         */
        "_callSolveEquationUsingConstant": function(headerIndex, colNumber, equationData, tableView) {
            var managerConstants = this.model.get('_equationDataManager').getConstants(),
                rows = tableView.getRowCount(),
                $cell,
                $headerCell,
                xCoord,
                headerCellContent,
                cellContent,
                headerCounter,
                noOfHeaders = headerIndex.length,
                updatedConstants,
                yCoord,
                points = [],
                rowHeader = tableView.getRowHeaderState(),
                errorString,
                $currentHeader,
                wasBlank,
                xCoordColNo = 1,
                rowCounter;
            for (rowCounter = 2; rowCounter <= rows; rowCounter++) {
                updatedConstants = _.extend({}, managerConstants);
                wasBlank = false;
                for (headerCounter = 0; headerCounter < noOfHeaders; headerCounter++) {
                    $headerCell = tableView.getCellAt(1, headerIndex[headerCounter]);
                    headerCellContent = tableView.getCellContent($headerCell);
                    $cell = tableView.getCellAt(rowCounter, headerIndex[headerCounter]);
                    cellContent = tableView.getCellContent($cell, {
                        "solution": true
                    });
                    if (cellContent === '') {
                        wasBlank = true;
                    }
                    if (cellContent !== void 0) {
                        updatedConstants[headerCellContent] = Number(cellContent);
                    } else {
                        updatedConstants[headerCellContent] = 0;
                        wasBlank = true;
                    }
                }
                headerCellContent = tableView.getHeaders();
                xCoordColNo = headerCellContent.indexOf('x') > -1 ? headerCellContent.indexOf('x') + 1 : 1;
                $cell = tableView.getCellAt(rowCounter, colNumber);
                if (rowHeader && xCoordColNo === 1) {
                    headerCellContent.shift();
                    xCoordColNo = headerCellContent.indexOf('x') > -1 ? headerCellContent.indexOf('x') + 2 : 1;
                }
                xCoord = tableView.getCellContent(tableView.getCellAt(rowCounter, xCoordColNo), {
                    "solution": true
                });
                // xCoord passed instead of equationXcoord for ax issue
                yCoord = this._solveEquationUsingConstant(equationData, updatedConstants, xCoord);
                if (yCoord === null || yCoord === false || wasBlank) {
                    tableView.setCellContent($cell, '', true);
                    continue;
                }
                tableView.setCellContent($cell, yCoord, true);
                if (isNaN(xCoord) || xCoord === '') {
                    continue;
                }
                points.push([Number(xCoord), yCoord]);
                tableView.setCellContent($cell, yCoord, true);
            }
            $currentHeader = tableView.getCellAt(1, colNumber);
            if (equationData.isCanBeSolved() !== true) {
                errorString = this._getErrorStringForTable(equationData.getErrorCode());
                this._updateWarningForCell($currentHeader, {
                    "hasError": true,
                    "errorCode": errorString,
                    "cid": tableView.cid
                });
            } else {
                this._updateWarningForCell($currentHeader, {
                    "hasError": false,
                    "errorCode": '',
                    "equationData": equationData,
                    "cid": tableView.cid
                });
            }
            equationData.setSolution(null);
            equationData.setConstants(managerConstants);
            this._setAndDrawPointsForTable(equationData, points, tableView);
        },
        /**
         * _solveEquationUsingConstant solved equationData
         * @method _solveEquationUsingConstant
         * @param {Object} equationData model object
         * @paran {Object} constants object
         * @param {Number} x-coordinate to solve equation
         * @return {Boolean|Number} solves equation and returns solution else false
         */
        "_solveEquationUsingConstant": function(equationData, constants, xCoord) {
            var specie,
                inEqualityType,
                _equationDataManager = this.model.get('_equationDataManager'),
                shouldSolve = false;
            specie = equationData.getSpecie();
            equationData.setConstants(constants, true);
            inEqualityType = equationData.getInEqualityType();
            if (_equationDataManager.get('_plotterView')._checkIfEquationContainsFunction(equationData, ['\\prod', '\\sum']) === true) {
                _equationDataManager.parseEquation(equationData, true);
                specie = equationData.getSpecie();
                shouldSolve = true;
            }
            if (specie === 'error') {
                _equationDataManager.parseEquation(equationData, true);
                specie = equationData.getSpecie();
                shouldSolve = true;
            }
            if (specie === 'expression') {
                if (equationData.isCanBeSolved() === true && shouldSolve === false) {
                    _equationDataManager.solveEquationWithUpdatedConstants(equationData);
                }
                return equationData.getSolution();
            }
            if (specie === 'plot' && inEqualityType === 'equal') {
                // for aF(x) issue solution
                return this._getSolution(equationData, xCoord);
            }
            return false;
        },
        /**
         * _checkForConstantCase checks for constant case in table header
         * @method _checkForConstantCase
         * @param {Number} column number
         * @param {Object} equation data model object
         * @param {Object} table view object
         * @return {Boolean} {Array} true if valid for declaration else false
         */
        "_checkForConstantCase": function(colNumber, equationData, tableView) {
            var headers,
                equationLatex,
                constants,
                constant,
                constantCounter,
                noOfConstant,
                tempIndex,
                managerConstants,
                headerIndex = [],
                rowHeader,
                isXDeclared,
                _equationDataManager = this.model.get('_equationDataManager'),
                errorCode;
            rowHeader = tableView.getRowHeaderState();
            errorCode = equationData.getErrorCode();
            equationLatex = equationData.getLatex();
            equationLatex = equationLatex.trim();
            if (equationLatex.indexOf('x') !== -1) {
                isXDeclared = this._isXDeclared(tableView, colNumber, rowHeader);
                if (isXDeclared === false && (equationLatex.indexOf('x') !== 0 || equationLatex.indexOf('=') === -1)) {
                    return false;
                }
            }
            if (errorCode === 'ConstantDeclaration') {
                constants = _equationDataManager._callGetAllConstants(equationData, false);
                if (constants[0] === equationLatex) {
                    return true;
                }
                noOfConstant = constants.length;
                headers = tableView.getHeaders(colNumber, true);
                if (rowHeader === true) {
                    headers[0] = '';
                }
                managerConstants = _equationDataManager.getConstants();
                for (constantCounter = 0; constantCounter < noOfConstant; constantCounter++) {
                    constant = constants[constantCounter];
                    if (constant === '\\pi' || constant === 'e') {
                        continue;
                    }
                    tempIndex = headers.indexOf(constant);
                    if (typeof managerConstants[constant] === 'undefined') {
                        if (tempIndex !== -1) {
                            headerIndex.push(tempIndex + 1);
                        } else {
                            return false;
                        }
                    }
                }
                if (headerIndex.length !== 0) {
                    return headerIndex;
                }
            }
            return false;
        },
        /**
         * _getErrorStringForTable returns error string based on error code
         * @method _getErrorStringForTable
         * @param {String} errorCode of a cell
         * @return string
         */
        "_getErrorStringForTable": function(errorCode) {
            return this.model.get('ERROR_STRINGS').TABLE_ERRORS[errorCode];
        },
        /**
         * _resetColumnCellSolution sets solution for given table column
         * @method _resetColumnCellSolution
         * @param {Number} columnNo column number
         * @param tableView
         * @return void
         */
        "_resetColumnCellSolution": function(columnNo, tableView) {
            var column, counter, $cell, length, headerEquationData;
            column = tableView.getColumn(columnNo);
            length = column.length;
            headerEquationData = this._getMappedTableColumnEquationData($(column[counter]));
            for (counter = 1; counter < length; counter++) {
                $cell = column.eq(counter);
                this._setCellSolution($cell, tableView, headerEquationData, false);
            }
        },
        /**
         * _resetTableCellSolution sets solution for given table
         * @method _resetTableCellSolution
         * @param tableView
         * @return void
         */
        "_resetTableCellSolution": function(tableView) {
            var col, noOfColumns;
            noOfColumns = tableView.getColCount();
            for (col = 1; col <= noOfColumns; col++) {
                this._resetColumnCellSolution(col, tableView);
            }
        },
        /**
         * _parseAllTables parses all the tables
         * @method _parseAllTables
         * @return void
         */
        "_parseAllTables": function() {
            var tableList, counter, length, tableView, $cell;
            tableList = $('.list[data-type=table]');
            length = tableList.length;
            for (counter = 0; counter < length; counter++) {
                tableView = this._getTableViewObject($(tableList[counter]));
                this._resetTableCellSolution(tableView);
                $cell = tableView.getCellAt(1, 1);
                this._parseTable($cell, tableView, true, true);
            }
        },
        /**
         * _getSolution solves equation for a given value of x
         * @method _getSolution
         * @param {Object} equationData
         * @param {Number} xCoord x coordinate
         * @return number
         */
        "_getSolution": function(equationData, xCoord) {
            if (!equationData.isCanBeSolved()) {
                return '';
            }
            if (xCoord === '') {
                return xCoord;
            }
            return MathUtilities.Components.EquationEngine.Models.TreeProcedures.solveEquation(equationData, xCoord)[0];
        },
        /**
         * _isHeaderDeclared checks if header is declared or not.
         * if yes returns its column number if no returns false
         * @method _isHeaderDeclared
         * @param {Object} tableView object of table view
         * @param {Number} colNumber
         * @param {String} latex
         * @return number or boolean
         */
        "_isHeaderDeclared": function(latex, tableView, colNumber) {
            var headers = tableView.getHeaders(colNumber, true),
                rowHeader = tableView.getRowHeaderState(),
                index;
            if (rowHeader === true) {
                headers[0] = '';
            }
            index = headers.indexOf(latex);
            if (latex === '') {
                return false;
            }
            if (index !== -1) {
                return index + 1;
            }
            return false;
        },
        /**
         * _processTableCellsWithDefinitions sets the solution for expression or any value in the cell
         * @method _processTableCellsWithDefinitions
         * @param {Object} definitions data related to changed definitions
         * @param {Boolean} isSlider flag for change due to slider
         * @param {Number} ignoreCol column number to be ignored for parsing
         * @return void
         */
        "_processTableCellsWithDefinitions": function(definitions, isSlider, ignoreCol) {
            var constants = definitions.constants.concat(definitions.functions),
                cells = this._getCellsHavingDefinition(constants),
                cellCounter,
                noOfCells = cells.length,
                $cell,
                colNo,
                tableView;
            if (cells.length !== 0) {
                for (cellCounter = 0; cellCounter < noOfCells; cellCounter++) {
                    $cell = $(cells[cellCounter]); // cells not a jquery array
                    colNo = $cell.attr('data-column');
                    if (colNo !== 'col' + ignoreCol) {
                        tableView = this._getTableViewObject($cell.parents('.list'));
                        this._parseTable($cell, tableView, true);
                    }
                }
            }
        },
        //table style options
        /**
         * _adjustTablePoistion adjusts table position
         * @method _adjustTablePoistion
         * @param $list {Object}s
         * @return void
         */
        "_adjustTablePoistion": function($list) {
            var titleTop,
                titleHeight,
                listTop,
                currentScroll,
                scrollBy,
                $titleBox = this.$('#input-column-options'),
                $inputData = this.$('#input-data');
            if ($list.prev().length !== 0) {
                currentScroll = $inputData.scrollTop();
                titleTop = $titleBox.offset().top;
                titleHeight = $titleBox.height();
                listTop = $list.offset().top;
                scrollBy = listTop - (titleTop + titleHeight);
                this.$('#input-data-extension').height($('#input-column').height());
                $inputData.scrollTop(currentScroll + scrollBy);
            }
        },
        /**
         * Returns thickness-slider-view from the collection with the given cid of thickness-Slider
         * @method _getThicknessSliderFromCollection
         * @param thicknessSliderCid {String} cid of thicknessSliderView to be searched
         * @return {Object} thickness-slider view
         */
        "_getThicknessSliderFromCollection": function(thicknessSliderCid) {
            var sliderViewsCollection = this.model.get('thicknessSliderCollections'),
                sliderCounter,
                noOfSliders = sliderViewsCollection.length;
            for (sliderCounter = 0; sliderCounter < noOfSliders; sliderCounter++) {
                if (sliderViewsCollection[sliderCounter].cid === thicknessSliderCid) {
                    return sliderViewsCollection[sliderCounter];
                }
            }
        },
        /**
         * _updateStyleForCell updates style for cell
         * @method _updateStyleForCell
         * @param colorStyleOptions {Object}
         * @param equationData {Object} equationData model object
         * @return void
         */
        "_updateStyleForCell": function(colorStyleOptions, equationData, isShowTableStyleOptions) {
            var graphStyleClass = 'graphing-tool-editor-graph-styles ',
                bestFitStyle = 'graphing-tool-sprite-holder best-fit-styles graphing-tool-editor-best-fit-',
                residualStyle = 'graphing-tool-sprite-holder residual-styles graphing-tool-editor-residual-',
                $styles = colorStyleOptions.find('.graphing-tool-editor-styles-container .graphing-tool-editor-graph-styles'),
                bestFit,
                $sliderView,
                cid = colorStyleOptions.attr('data-target-equation-data-cid'),
                $list = this.$('.cell[data-equation-cid=' + cid + ']').parents('.list'),
                tableView = this._getTableViewObject($list),
                residualColumnState = tableView.model.get('residualColumnStates'),
                styleClass1 = graphStyleClass + 'graphing-tool-editor-styles-points',
                styleClass2 = graphStyleClass + 'graphing-tool-editor-styles-line',
                styleClass3 = graphStyleClass + 'graphing-tool-editor-styles-points-line',
                bestFitLineStyle = graphStyleClass + bestFitStyle + 'line graphing-tool-editor-styles-' + equationData.colorName + '-line-best-fit',
                exponentialStyle = graphStyleClass + bestFitStyle + 'exponential graphing-tool-editor-styles-' + equationData.colorName + '-exponential',
                polynomialBestFitStyle = graphStyleClass + bestFitStyle + 'polynomial graphing-tool-editor-styles-' + equationData.colorName + '-polynomial-graph',
                quadraticBestFitStyle = graphStyleClass + bestFitStyle + 'quadratic graphing-tool-editor-styles-' + equationData.colorName + '-quadratic-graph',
                cubicBestFitStyle = graphStyleClass + bestFitStyle + 'cubic graphing-tool-editor-styles-' + equationData.colorName + '-cubic-graph',
                quarticBestFitStyle = graphStyleClass + bestFitStyle + 'quartic graphing-tool-editor-styles-' + equationData.colorName + '-quartic-graph',
                quinticBestFitStyle = graphStyleClass + bestFitStyle + 'quintic graphing-tool-editor-styles-' + equationData.colorName + '-quintic-graph',
                sexticBestFitStyle = graphStyleClass + bestFitStyle + 'sextic graphing-tool-editor-styles-' + equationData.colorName + '-sextic-graph',
                septicBestFitStyle = graphStyleClass + bestFitStyle + 'septic graphing-tool-editor-styles-' + equationData.colorName + '-septic-graph',
                residualLineStyle = graphStyleClass + residualStyle + 'line graphing-tool-editor-styles-' + equationData.colorName + '-line-best-fit',
                exponentialResidualStyle = graphStyleClass + residualStyle + 'exponential graphing-tool-editor-styles-' + equationData.colorName + '-exponential',
                polynomialResidualStyle = graphStyleClass + residualStyle + 'polynomial graphing-tool-editor-styles-' + equationData.colorName + '-polynomial-graph',
                $styleIcons = colorStyleOptions.find('.graphing-tool-editor-styles-container .graphing-tool-editor-graph-style-icons'),
                degree = {
                    "two": '2',
                    "three": '3',
                    "four": '4',
                    "five": '5',
                    "six": '6',
                    "seven": '7'
                };
            $styleIcons.removeClass('hidden');
            this.accManagerView.changeAccMessage('style-1', 1, [this.accManagerView.getAccMessage('unselected-text', 0)]);
            this.accManagerView.changeAccMessage('style-2', 1, [this.accManagerView.getAccMessage('unselected-text', 0)]);
            this.accManagerView.changeAccMessage('style-3', 1, [this.accManagerView.getAccMessage('unselected-text', 0)]);
            if (equationData.getStyleType() === 'points') {
                styleClass1 += '-selected';
                $styles.first().attr('class', '').addClass(graphStyleClass).addClass('graphing-tool-editor-styles-points-selected');
                $styleIcons.first().attr('class', '').addClass('graphing-tool-editor-graph-style-icons')
                    .addClass('graphing-tool-editor-styles-icon-points-selected').addClass('graphing-tool-sprite-holder');
                $styles.eq(1).attr('class', '').addClass(graphStyleClass).addClass('graphing-tool-editor-styles-line');
                $styleIcons.eq(1).attr('class', '').addClass('graphing-tool-editor-graph-style-icons')
                    .addClass('graphing-tool-editor-styles-icon-line').addClass('graphing-tool-sprite-holder');
                $styles.eq(2).attr('class', '').addClass(graphStyleClass).addClass('graphing-tool-editor-styles-points-line');
                $styleIcons.eq(2).attr('class', '').addClass('graphing-tool-editor-graph-style-icons')
                    .addClass('graphing-tool-editor-styles-icon-points-line').addClass('graphing-tool-sprite-holder');
                colorStyleOptions.find('.selected-type').attr('class', '').addClass('selected-type graphing-tool-editor-graph-style-icons')
                    .addClass('graphing-tool-editor-styles-icon-points').addClass('graphing-tool-sprite-holder');
                this.accManagerView.changeAccMessage(colorStyleOptions.find('.graphing-tool-editor-styles-points-selected')
                    .attr('id'), 1, [this.accManagerView.getAccMessage('selected-text', 0)]);
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setFocus(colorStyleOptions.find('.graphing-tool-editor-styles-points-selected').attr('id'));
            } else {
                if (equationData.getStyleType() === 'line') {
                    styleClass2 += '-selected';
                    $styles.first().attr('class', '').addClass(graphStyleClass).addClass('graphing-tool-editor-styles-points');
                    $styleIcons.first().attr('class', '').addClass('graphing-tool-editor-graph-style-icons')
                        .addClass('graphing-tool-editor-styles-icon-points').addClass('graphing-tool-sprite-holder');
                    $styles.eq(1).attr('class', '').addClass(graphStyleClass).addClass('graphing-tool-editor-styles-line-selected');
                    $styleIcons.eq(1).attr('class', '').addClass('graphing-tool-editor-graph-style-icons')
                        .addClass('graphing-tool-editor-styles-icon-line-selected').addClass('graphing-tool-sprite-holder');
                    $styles.eq(2).attr('class', '').addClass(graphStyleClass).addClass('graphing-tool-editor-styles-points-line');
                    $styleIcons.eq(2).attr('class', '').addClass('graphing-tool-editor-graph-style-icons')
                        .addClass('graphing-tool-editor-styles-icon-points-line').addClass('graphing-tool-sprite-holder');
                    colorStyleOptions.find('.selected-type').attr('class', '').addClass('selected-type graphing-tool-editor-graph-style-icons')
                        .addClass('graphing-tool-editor-styles-icon-line').addClass('graphing-tool-sprite-holder');
                    this.accManagerView.changeAccMessage(colorStyleOptions.find('.graphing-tool-editor-styles-line-selected')
                        .attr('id'), 1, [this.accManagerView.getAccMessage('selected-text', 0)]);
                    this.accManagerView.setFocus('dummy-focus-container');
                    this.accManagerView.setFocus(colorStyleOptions.find('.graphing-tool-editor-styles-line-selected').attr('id'));
                } else {
                    styleClass3 += '-selected';
                    $styles.first().attr('class', '').addClass(graphStyleClass).addClass('graphing-tool-editor-styles-points');
                    $styleIcons.first().attr('class', '').addClass('graphing-tool-editor-graph-style-icons')
                        .addClass('graphing-tool-editor-styles-icon-points').addClass('graphing-tool-sprite-holder');
                    $styles.eq(1).attr('class', '').addClass(graphStyleClass).addClass('graphing-tool-editor-styles-line');
                    $styleIcons.eq(1).attr('class', '').addClass('graphing-tool-editor-graph-style-icons')
                        .addClass('graphing-tool-editor-styles-icon-line').addClass('graphing-tool-sprite-holder');
                    $styles.eq(2).attr('class', '').addClass(graphStyleClass).addClass('graphing-tool-editor-styles-points-line-selected');
                    $styleIcons.eq(2).attr('class', '').addClass('graphing-tool-editor-graph-style-icons')
                        .addClass('graphing-tool-editor-styles-icon-points-line-selected').addClass('graphing-tool-sprite-holder');
                    colorStyleOptions.find('.selected-type').attr('class', '').addClass('selected-type graphing-tool-editor-graph-style-icons')
                        .addClass('graphing-tool-editor-styles-icon-points-line').addClass('graphing-tool-sprite-holder');
                    this.accManagerView.changeAccMessage(colorStyleOptions.find('.graphing-tool-editor-styles-points-line-selected')
                        .attr('id'), 1, [this.accManagerView.getAccMessage('selected-text', 0)]);
                    this.accManagerView.setFocus('dummy-focus-container');
                    this.accManagerView.setFocus(colorStyleOptions.find('.graphing-tool-editor-styles-points-line-selected').attr('id'));
                }
            }
            bestFit = equationData.getBestFit();
            if (bestFit !== null) {
                if (bestFit.line && bestFit.line.selected === true) {
                    bestFitLineStyle += '-selected';
                }
                if (bestFit.curve) {
                    _.each(bestFit.curve, function(value, counter) {
                        if (value.selected === true) {
                            switch (counter) {
                                case degree.two:
                                    quadraticBestFitStyle += '-selected';
                                    break;
                                case degree.three:
                                    cubicBestFitStyle += '-selected';
                                    break;
                                case degree.four:
                                    quarticBestFitStyle += '-selected';
                                    break;
                                case degree.five:
                                    quinticBestFitStyle += '-selected';
                                    break;
                                case degree.six:
                                    sexticBestFitStyle += '-selected';
                                    break;
                                case degree.seven:
                                    septicBestFitStyle += '-selected';
                                    break;
                                default:
                                    quadraticBestFitStyle += '-selected';
                            }
                        }
                    });
                }
                if (bestFit.exp && bestFit.exp.selected) {
                    exponentialStyle += '-selected';
                }
                if (bestFit.polynomial && bestFit.polynomial.selected) {
                    polynomialBestFitStyle += '-selected';
                }
                if (residualColumnState[cid] && !isShowTableStyleOptions) {
                    if (residualColumnState[cid]['line'] && residualColumnState[cid]['line'].selected) {
                        residualLineStyle += '-selected';
                    }
                    if (residualColumnState[cid]['polynomial'] && residualColumnState[cid]['polynomial'].selected) {
                        polynomialResidualStyle += '-selected';
                    }
                    if (residualColumnState[cid]['exp'] && residualColumnState[cid]['exp'].selected) {
                        exponentialResidualStyle += '-selected';
                    }
                }
            }
            $styles.first().attr('class', '').addClass(styleClass1);
            $styles.eq(1).attr('class', '').addClass(styleClass2);
            $styles.eq(2).attr('class', '').addClass(styleClass3);
            this.$('.graphing-tool-editor-best-fit-line').attr('class', 'graphing-tool-sprite-holder').addClass(bestFitLineStyle);
            this.$('.graphing-tool-editor-best-fit-polynomial').attr('class', 'graphing-tool-sprite-holder').addClass(polynomialBestFitStyle);
            this.$('.graphing-tool-editor-best-fit-exponential').attr('class', 'graphing-tool-sprite-holder').addClass(exponentialStyle);
            this.$('.graphing-tool-editor-best-fit-quadratic').attr('class', 'graphing-tool-sprite-holder').addClass(quadraticBestFitStyle);
            this.$('.graphing-tool-editor-best-fit-cubic').attr('class', 'graphing-tool-sprite-holder').addClass(cubicBestFitStyle);
            this.$('.graphing-tool-editor-best-fit-quartic').attr('class', 'graphing-tool-sprite-holder').addClass(quarticBestFitStyle);
            this.$('.graphing-tool-editor-best-fit-quintic').attr('class', 'graphing-tool-sprite-holder').addClass(quinticBestFitStyle);
            this.$('.graphing-tool-editor-best-fit-sextic').attr('class', 'graphing-tool-sprite-holder').addClass(sexticBestFitStyle);
            this.$('.graphing-tool-editor-best-fit-septic').attr('class', 'graphing-tool-sprite-holder').addClass(septicBestFitStyle);
            this.$('.graphing-tool-editor-residual-line').attr('class', 'graphing-tool-sprite-holder').addClass(residualLineStyle);
            this.$('.graphing-tool-editor-residual-polynomial').attr('class', 'graphing-tool-sprite-holder').addClass(polynomialResidualStyle);
            this.$('.graphing-tool-editor-residual-exponential').attr('class', 'graphing-tool-sprite-holder').addClass(exponentialResidualStyle);
            $sliderView = this._getThicknessSliderFromCollection(colorStyleOptions.find('.graphing-tool-editor-graph-thickness-value-container')
                .attr('data-slider-view-cid'));
            $sliderView.set(parseInt(equationData.getThickness(), 10));
            this.accManagerView.changeAccMessage($sliderView.$el.find('.sliderH').attr('id'), 0, [parseInt(equationData.getThickness(), 10)]);
        },
        /**
         * _showTableStyleOptions shows table style options box
         * @method _showTableStyleOptions
         * @param event {Object}
         * @return void
         */
        "_showTableStyleOptions": function(event) {
            if (!($(event.target).hasClass('table-graph') || $(event.target).parents('.handler-warning').hasClass('table-graph'))) {
                return void 0;
            }
            var $target = $(event.target),
                $checkboxContainer,
                $checkbox,
                $cell = $target.parents('.cell'),
                TOP_TOLERANCE = 4,
                LEFT_TOLERANCE = 3,
                $list = $target.parents('.list'),
                tableView = this._getTableViewObject($list),
                $residualElement,
                $residualSymbol,
                $sortOptions = this.$('.graphing-tool-editor-sort-options-container'),
                $sortOptionsBox = this.$('.graphing-tool-editor-sort-selection-box'),
                residualIconClass,
                equationData = this._getEquationDataUsingCid($cell.attr('data-equation-cid')),
                targetPosition, $dataAnalysisBox,
                bestFit = equationData.getBestFit(),
                $bestFitIcon, bestFitIconClass, $bestFitConatiner,
                $residualBox = this.$('.graphing-tool-editor-residual-options-container'),
                colorStyleOptions = this.$('.graphing-tool-editor-color-style-box-table'),
                $bestFitOptionSelectionBox,
                $dataAnalysisOptionSelectionBox,
                $residualOptionsSelection,
                messageArray, $bestFitIconContainer,
                graphColor, bestFitIconList, bestFitLength, count, cid = equationData.getCid(),
                residualColumnStates = tableView.model.get('residualColumnStates'),
                selectedText = this.accManagerView.getAccMessage('selected-text', 0),
                selectText = this.accManagerView.getAccMessage('selected-text', 1),
                deselectedText = this.accManagerView.getAccMessage('deselected-text', 0),
                $bestFitBox = this.$('.graphing-tool-editor-best-fit-options-container');

            if (colorStyleOptions.length === 0) {
                colorStyleOptions = this.$('.graphing-tool-editor-color-style-box-equation')
                    .removeClass('graphing-tool-editor-color-style-box-equation')
                    .addClass('graphing-tool-editor-color-style-box-table');

            }
            $bestFitOptionSelectionBox = colorStyleOptions.find('.graphing-tool-editor-best-fit-styles');
            $dataAnalysisOptionSelectionBox = colorStyleOptions.find('.graphing-tool-editor-data-analysis-options');
            $residualOptionsSelection = colorStyleOptions.find('.graphing-tool-editor-residuals-options');
            this._graphingToolView._updateListBoxHeight(true);
            colorStyleOptions.find('.activated').removeClass('activated');
            $cell.find('textarea').blur();
            this._updateListWidth($list.find('.equation-box').outerWidth(), $list.attr('data-equation-cid'));
            $dataAnalysisBox = this.$('.graphing-tool-editor-data-analysis-options-container');
            this._adjustTablePoistion($list);
            // Calculate targetPosition using offset.
            targetPosition = $cell.position();
            targetPosition.top = $cell.offset().top;
            targetPosition.top = targetPosition.top - $list.offsetParent().offset().top;
            if ($residualBox.hasClass('residual-options-selected')) {
                $residualBox.hide().removeClass('residual-options-selected');
                $residualOptionsSelection.removeClass('graphing-tool-editor-residuals-options-selected');
                $residualOptionsSelection.find('.residual-arrow-selected').removeClass('residual-arrow-selected').addClass('residual-arrow');
            }
            if ($bestFitBox.hasClass('best-fit-options-selected')) {
                $bestFitBox.hide().removeClass('best-fit-options-selected');
                $bestFitOptionSelectionBox.removeClass('graphing-tool-editor-best-fit-styles-selected');
                $bestFitOptionSelectionBox.find('.best-fit-arrow-selected').removeClass('best-fit-arrow-selected').addClass('best-fit-arrow');
            }
            if ($dataAnalysisBox.hasClass('data-analysis-options-selected')) {
                $dataAnalysisBox.hide().removeClass('data-analysis-options-selected');
                $dataAnalysisOptionSelectionBox.removeClass('graphing-tool-editor-data-analysis-options-selected');
                $dataAnalysisOptionSelectionBox.find('.data-analysis-arrow-selected').removeClass('data-analysis-arrow-selected').addClass('data-analysis-arrow');
            }
            $sortOptions.hide();
            if ($sortOptionsBox.hasClass('selected')) {
                $sortOptionsBox.removeClass('selected');
                $sortOptionsBox.find('.sort-arrow-selected').removeClass('sort-arrow-selected').addClass('sort-arrow');
            }
            if (colorStyleOptions.length === 0) {
                colorStyleOptions = this.$('.graphing-tool-editor-color-style-box-equation')
                    .removeClass('graphing-tool-editor-color-style-box-equation')
                    .addClass('graphing-tool-editor-color-style-box-table');

            }
            this.accManagerView.unloadScreen('style-elements-screen');
            this.accManagerView.loadScreen('style-elements-screen');
            if (colorStyleOptions.is(':visible')) {
                colorStyleOptions.hide();
                this.$('#input-data-extension').height(0);
                this.$('#input-data').removeClass('input-data-scroll-hidden');
            } else {
                colorStyleOptions.removeClass('first-col-style-box-table residual-col-style-box-table');
                colorStyleOptions.find('.first-row-style, .residual-col-style').show();
                this.accManagerView.changeAccMessage(colorStyleOptions.find('.graphing-tool-editor-colors-selected')
                    .attr('id'), 0, [this.accManagerView.getAccMessage('unselected-text', 0)]);
                colorStyleOptions.find('.graphing-tool-editor-colors-selected').removeClass('graphing-tool-editor-colors-selected');
                colorStyleOptions.removeClass('inequality-options');
                colorStyleOptions.find('.graphing-tool-editor-close-button,.graphing-tool-editor-style-box,.graphing-tool-editor-graph-thickness').show();
                colorStyleOptions.attr('data-target-equation-data-cid', equationData.getCid()).show().css({
                    "top": targetPosition.top + TOP_TOLERANCE + $cell.find('.handler-warning').height(),
                    "left": targetPosition.left + LEFT_TOLERANCE
                }).find('div[data-color=' + equationData.getColor() + ']').addClass('graphing-tool-editor-colors-selected');
                this.accManagerView.changeAccMessage(colorStyleOptions.find('.graphing-tool-editor-colors-selected')
                    .attr('id'), 0, [this.accManagerView.getAccMessage('selected-text', 0)]);
                colorStyleOptions.find('.graphing-tool-editor-style-box-seperater').removeClass('no-style');
                colorStyleOptions.find('.selected-color').css({
                    "background-color": equationData.getColor()
                });
                this.$('#input-data').addClass('input-data-scroll-hidden');
                this.$('.graphing-tool-editor-best-fit-styles, .graphing-tool-editor-data-analysis-options, .graphing-tool-editor-residuals-options, .graphing-tool-editor-toggle-column-graph-checkbox-container').removeClass('no-style');
                graphColor = colorStyleOptions.find('.graphing-tool-editor-colors-selected').attr('data-color-name');
                equationData.colorName = graphColor;
                bestFitIconList = this.$('.graphing-tool-editor-best-fit-style-container');
                bestFitLength = bestFitIconList.length;
                for (count = 0; count < bestFitLength; count++) {
                    $bestFitIcon = bestFitIconList.eq(count).find('.graphing-tool-editor-graph-styles');
                    $bestFitIconContainer = $bestFitIcon.parents('.graphing-tool-editor-best-fit-style-container');
                    bestFitIconClass = $bestFitIcon.attr('class');
                    if (bestFitIconClass.indexOf('-selected') !== -1) {
                        bestFitIconClass = bestFitIconClass.replace('-selected', '');
                        $bestFitIcon.attr('class', bestFitIconClass);
                    }
                    this.accManagerView.changeAccMessage($bestFitIconContainer.attr('id'), 0, [deselectedText, this.accManagerView.getAccMessage('table-equation-panel-messages', 5)]);
                }
                this._updateStyleForCell(colorStyleOptions, equationData, true);
                if (tableView._getColumnNo($cell.attr('data-equation-cid')) === "1") {
                    colorStyleOptions.find('.first-row-style').hide();
                    colorStyleOptions.addClass('first-col-style-box-table');
                } else if ($cell.attr('data-ignore-column')) {
                    colorStyleOptions.find('.residual-col-style').hide();
                    colorStyleOptions.addClass('residual-col-style-box-table');
                }
            }
            this.$('.graphing-tool-editor-best-fit-line-display-equation').html('');
            bestFitIconList = this.$('.graphing-tool-editor-best-fit-style-container');
            bestFitLength = bestFitIconList.length;
            for (count = 0; count < bestFitLength; count++) {
                $bestFitIcon = bestFitIconList.eq(count).find('.graphing-tool-editor-graph-styles');
                $bestFitIconContainer = $bestFitIcon.parents('.graphing-tool-editor-best-fit-style-container');
                bestFitIconClass = $bestFitIcon.attr('class');
                if (bestFitIconClass.indexOf('-selected') !== -1) {
                    bestFitIconClass = bestFitIconClass.replace('-selected', '');
                    $bestFitIcon.attr('class', bestFitIconClass);
                    this.accManagerView.changeAccMessage($bestFitIconContainer.attr('id'), 0, [deselectedText, this.accManagerView.getAccMessage('table-equation-panel-messages', 5)]);
                }

            }
            messageArray = [deselectedText, this.accManagerView.getAccMessage('table-equation-panel-messages', 5)];
            this.accManagerView.changeAccMessage('residual-line', 0, messageArray);
            this.accManagerView.changeAccMessage('residual-polynomial', 0, messageArray);
            this.accManagerView.changeAccMessage('residual-exp', 0, messageArray);
            if (residualColumnStates) {
                residualColumnStates = residualColumnStates[cid];
                if (residualColumnStates) {
                    if (residualColumnStates.line) {
                        $residualElement = $residualBox.find('.container-1');
                        $residualSymbol = $residualElement.find('.graphing-tool-editor-graph-styles');
                        residualIconClass = $residualSymbol.attr('class');
                        if (residualColumnStates.line.selected === true && bestFitIconClass.indexOf('-selected') === -1) {
                            residualIconClass = residualIconClass + '-selected';
                            $residualSymbol.attr('class', residualIconClass);
                            messageArray = [selectedText, this.accManagerView.getAccMessage('table-equation-panel-messages', 6)];
                        } else if (residualColumnStates.line.selected === false) {
                            residualIconClass = residualIconClass.replace('-selected', '');
                            $residualSymbol.attr('class', residualIconClass);
                            messageArray = [deselectedText, this.accManagerView.getAccMessage('table-equation-panel-messages', 5)];
                        }
                        this.accManagerView.changeAccMessage($residualElement.attr('id'), 0, messageArray);
                    }
                    if (residualColumnStates.polynomial) {
                        $residualElement = $residualBox.find('.container-4');
                        $residualSymbol = $residualElement.find('.graphing-tool-editor-graph-styles');
                        residualIconClass = $residualSymbol.attr('class');
                        if (residualColumnStates.polynomial.selected === true && bestFitIconClass.indexOf('-selected') === -1) {
                            residualIconClass = residualIconClass + '-selected';
                            $residualSymbol.attr('class', residualIconClass);
                            messageArray = [selectedText, this.accManagerView.getAccMessage('table-equation-panel-messages', 6)];
                        } else if (residualColumnStates.polynomial.selected === false) {
                            residualIconClass = residualIconClass.replace('-selected', '');
                            $residualSymbol.attr('class', residualIconClass);
                            messageArray = [deselectedText, this.accManagerView.getAccMessage('table-equation-panel-messages', 5)];
                        }
                        this.accManagerView.changeAccMessage($residualElement.attr('id'), 0, messageArray);
                    }
                    if (residualColumnStates.exp) {
                        $residualElement = $residualBox.find('.container-3');
                        $residualSymbol = $residualElement.find('.graphing-tool-editor-graph-styles');
                        residualIconClass = $residualSymbol.attr('class');
                        if (residualColumnStates.exp.selected === true && bestFitIconClass.indexOf('-selected') === -1) {
                            residualIconClass = residualIconClass + '-selected';
                            $residualSymbol.attr('class', residualIconClass);
                            messageArray = [selectedText, this.accManagerView.getAccMessage('table-equation-panel-messages', 6)];
                        } else if (residualColumnStates.exp.selected === false) {
                            residualIconClass = residualIconClass.replace('-selected', '');
                            $residualSymbol.attr('class', residualIconClass);
                            messageArray = [deselectedText, this.accManagerView.getAccMessage('table-equation-panel-messages', 5)];
                        }
                        this.accManagerView.changeAccMessage($residualElement.attr('id'), 0, messageArray);
                    }
                }
            }
            if (bestFit) {
                if (bestFit.curve) {
                    _.each(bestFit.curve, _.bind(function(value, counter) {
                        bestFitIconList = this.$('.graphing-tool-editor-best-fit-style-container[data-degree=' + counter + ']');
                        $bestFitIcon = bestFitIconList.first().find('.graphing-tool-editor-graph-styles');
                        $bestFitIconContainer = $bestFitIcon.parents('.graphing-tool-editor-best-fit-style-container');
                        if (bestFit.curve[counter].selected === true) {
                            this._setSelectedBestFit($bestFitIcon, bestFitIconList.first().find('.graphing-tool-editor-best-fit-line-display-equation'), value.equationData, bestFit.curve[counter]);
                            this.accManagerView.changeAccMessage($bestFitIconContainer.attr('id'), 1, [selectedText, value.equationData.getAccText(), this.accManagerView.getAccMessage('table-equation-panel-messages', 6)]);
                        }
                    }, this));
                }
                if (typeof bestFit.line !== 'undefined') {
                    $bestFitConatiner = this.$('.graphing-tool-editor-best-fit-style-container.container-1');
                    if (bestFit.line.selected === true) {
                        $bestFitIcon = $bestFitConatiner.find('.graphing-tool-editor-graph-styles');
                        $bestFitIconContainer = $bestFitIcon.parents('.graphing-tool-editor-best-fit-style-container');
                        this._setSelectedBestFit($bestFitIcon, $bestFitConatiner.find('.graphing-tool-editor-best-fit-line-display-equation'), bestFit.line.equationData, bestFit.line);
                        this.accManagerView.changeAccMessage($bestFitIconContainer.attr('id'), 1, [selectedText, bestFit.line.equationData.getAccText(), this.accManagerView.getAccMessage('table-equation-panel-messages', 6)]);
                    }
                }
                if (bestFit.exp) {
                    $bestFitConatiner = this.$('.graphing-tool-editor-best-fit-style-container.container-3');
                    if (bestFit.exp.selected === true) {
                        $bestFitIcon = $bestFitConatiner.find('.graphing-tool-editor-graph-styles');
                        $bestFitIconContainer = $bestFitIcon.parents('.graphing-tool-editor-best-fit-style-container');
                        this._setSelectedBestFit($bestFitIcon, $bestFitConatiner.find('.graphing-tool-editor-best-fit-line-display-equation'), bestFit.exp.equationData, bestFit.exp);
                        this.accManagerView.changeAccMessage($bestFitIconContainer.attr('id'), 1, [selectedText, bestFit.exp.equationData.getAccText(), this.accManagerView.getAccMessage('table-equation-panel-messages', 6)]);
                    }
                }
                if (bestFit.polynomial) {
                    $bestFitConatiner = this.$('.graphing-tool-editor-best-fit-style-container.container-4');
                    if (bestFit.polynomial.selected === true) {
                        $bestFitIcon = $bestFitConatiner.find('.graphing-tool-editor-graph-styles');
                        $bestFitIconContainer = $bestFitIcon.parents('.graphing-tool-editor-best-fit-style-container');
                        this._setSelectedBestFit($bestFitIcon, $bestFitConatiner.find('.graphing-tool-editor-best-fit-line-display-equation'), bestFit.polynomial.equationData, bestFit.polynomial);
                        this.accManagerView.changeAccMessage($bestFitIconContainer.attr('id'), 1, [selectedText, bestFit.polynomial.equationData.getAccText(), this.accManagerView.getAccMessage('table-equation-panel-messages', 6)]);
                    }
                }
            }
            $checkboxContainer = this.$('.graphing-tool-editor-toggle-column-graph-checkbox-container');
            $checkbox = $checkboxContainer.find('.graphing-tool-editor-toggle-column-graph-checkbox');
            $checkbox.toggleClass('toggle-column-checked', this._getPlotColumn(equationData));
            if (this._getPlotColumn(equationData)) {
                messageArray = [this.accManagerView.getAccMessage('checked-text', 0),
                    this.accManagerView.getAccMessage('table-equation-panel-messages', 6), this.accManagerView.getAccMessage('hide-text', 0)
                ];
            } else {
                messageArray = [this.accManagerView.getAccMessage('unchecked-text', 0),
                    this.accManagerView.getAccMessage('table-equation-panel-messages', 5), this.accManagerView.getAccMessage('show-text', 0)
                ];
            }
            this.accManagerView.changeAccMessage('graphing-tool-editor-style-toggle-column-graph-checkbox-container', 0, messageArray);
            this._graphingToolView.closeKeyboard();
            this._sliderPanel.hidePanel();
            this.$('#style-2').off('keydown');
            this.$('#style-3').off('keydown').on('keydown', _.bind(this._handleTabOnTypeElements, this, 'style'));
            this.$('#pink-color').off('keydown').on('keydown', _.bind(this._handleTabOnTypeElements, this, 'color'));
            this.$('#style-1').off('keydown').on('keydown', _.bind(this._handleShiftTabOnStyle, this, 'style'));
            this.$('#purple-color').off('keydown').on('keydown', _.bind(this._handleShiftTabOnStyle, this, 'color'));

            this.trigger('set-popup-open');
            this.accManagerView.updateFocusRect('graphing-tool-editor-style-type');
            this.accManagerView.updateFocusRect('graphing-tool-editor-style-color');
            this.accManagerView.updateFocusRect('graphing-tool-editor-graph-thickness-container');
            this.accManagerView.updateFocusRect('graphing-tool-editor-style-hide-column-container');
            this.accManagerView.updateFocusRect('graphing-tool-editor-style-toggle-column-graph-checkbox-container');
            this.accManagerView.updateFocusRect($list.attr('id'));
            if (this._graphingToolView.isAccDivPresent($list.find('#list-data-container-of-' + $list.attr('id')))) {
                this.accManagerView.updateFocusRect('list-data-container-of-' + $list.attr('id'));
            }
            this.accManagerView.setFocus('graphing-tool-editor-style-type');
            this.accManagerView.enableTab('graphing-tool-editor-graph-style-thickness-handle', false);
            this.accManagerView.changeAccMessage('graphing-tool-editor-style-best-fit-options-header', 0, [deselectedText, selectText]);
            this.accManagerView.changeAccMessage('graphing-tool-editor-style-data-analysis-options-header', 0, [deselectedText, selectText]);
            this.accManagerView.changeAccMessage('graphing-tool-editor-style-residuals-option', 0, [deselectedText, selectText]);
            if (tableView._getColumnNo($cell.attr('data-equation-cid')) === "1" || $cell.attr('data-ignore-column')) {
                this.accManagerView.setFocus('graphing-tool-editor-style-color');
            }
        },

        "_handleTabOnTypeElements": function(type, event) {
            var eventType = this.isEventTabOrShiftTab(event),
                $targetLists = this.$('.graphing-tool-editor-color-style-box');
            if (eventType.isTab) {
                if (type === 'style') {
                    this.accManagerView.setFocus('graphing-tool-editor-style-color', 10);
                } else {
                    this.accManagerView.setFocus('graphing-tool-editor-graph-thickness-container', 10);
                }
                $targetLists.find('.activated').removeClass('activated');
            }
        },

        "_handleShiftTabOnStyle": function(type, event) {
            var eventType = this.isEventTabOrShiftTab(event),
                $targetLists = this.$('.graphing-tool-editor-color-style-box');
            if (eventType.isShiftTab) {
                if (type === 'style') {
                    this.accManagerView.setFocus('graphing-tool-editor-style-type', 10);
                } else {
                    this.accManagerView.setFocus('graphing-tool-editor-style-color', 10);
                }
                $targetLists.find('.activated').removeClass('activated');
            }
        },
        /**
         * _changeTableColumnStyle used to change table column style
         * @method _changeTableColumnStyle
         * @param {Object} jQuery event object
         * @return void
         */
        "_changeTableColumnStyle": function(event) {
            var currentStyleClicked = $(event.target).hasClass('acc-read-elem') ? $(event.target).parent() : $(event.target),
                currentElementClass = currentStyleClicked.attr('class'),
                currentElementClasses = currentElementClass.split(' '),
                styleParent = this.$('.graphing-tool-editor-color-style-box-table'),
                equationData,
                styleTypes,
                cid = $(styleParent).attr('data-target-equation-data-cid'),
                showTable,
                tableView,
                plotEquationData,
                plotEquationPoints,
                selectedStyleType,
                styleTypesLength, undoData = {},
                redoData = {},
                $list;
            if (currentElementClasses[1].indexOf('selected') !== -1 || currentStyleClicked.hasClass('best-fit-styles')) {
                return void 0;
            }
            $list = this.$('.cell[data-equation-cid=' + cid + ']').parents('.list');
            tableView = this._getTableViewObject($list);
            equationData = this._getEquationDataUsingCid(cid);
            styleTypes = currentElementClasses[1].split('-');
            styleTypesLength = styleTypes.length;
            undoData.styleType = equationData.styleType;
            undoData.equationData = equationData;
            plotEquationData = equationData.getPlot();
            plotEquationPoints = plotEquationData.getPoints() || [];
            if (styleTypes[styleTypesLength - 1] === 'points') {
                selectedStyleType = 'points';
            } else if (styleTypes[styleTypesLength - 2] === 'points') { // penultimate style type for table columns
                selectedStyleType = 'both';
            } else {
                this.$('.coordinate-tooltip[data-equation-cid="' + plotEquationData.getCid() + '"]').hide();
                selectedStyleType = 'line';
                this.callCheckIfChangeInPoint(equationData, plotEquationPoints, []);
            }
            equationData.setStyleType(selectedStyleType);
            showTable = tableView.model.get('showTable');
            this._handleTableStyleType(equationData, selectedStyleType, showTable, tableView.getRowHeaderState());
            redoData.styleType = selectedStyleType;
            redoData.equationData = equationData;
            this.execute('tableColumnStyleChange', {
                "undo": undoData,
                "redo": redoData
            });
            this._updateStyleForCell(styleParent, equationData);
            if (selectedStyleType !== 'line' && showTable) {
                this.$('.coordinate-tooltip[data-equation-cid="' + plotEquationData.getCid() + '"]').show();
            }
            this._updateWarningForCell($list.find('.cell[data-equation-cid=' + equationData.getCid() + ']'), {
                "hasError": false,
                "errorCode": '',
                "equationData": equationData,
                "cid": tableView.cid
            });
            if (undoData.styleType === 'line' && plotEquationData.getPoints()) {
                //show points
                this.checkIfChangeInPoint([], plotEquationData.getPoints().slice());

            }
            this._graphingToolView._gridGraphView.refreshView();
        },
        /**
         * _setSelectedBestFit sets selected bestFit class
         * @method _setSelectedBestFit
         * @param $bestFitIcon {Object}
         * @param $displayEqn {Object}
         * @param equationData {Object}
         * @param bestFitObj {Object}
         * @return void
         */
        "_setSelectedBestFit": function($bestFitIcon, $displayEqn, equationData, bestFitObj) {
            var bestFitIconClass = $bestFitIcon.attr('class');
            if (bestFitIconClass.indexOf('-selected') === -1) {
                bestFitIconClass = bestFitIconClass + '-selected';
                $bestFitIcon.attr('class', bestFitIconClass);
                if (equationData) {
                    $displayEqn.html(equationData.getDisplayEquation());
                }
            }
        },
        /**
         * _hideCellWarningText hides warning test
         * @method _hideCellWarningText
         * @param {Object} event object
         * @return void
         */
        "_hideCellWarningText": function(event) {
            var $target = $(event.target),
                $cell,
                $cellWarningtextContainer,
                $list;
            $cell = $target.parents('.cell');
            $list = $cell.parents('.list');
            $cellWarningtextContainer = $list.find('.table-error-text');
            if ($cellWarningtextContainer.hasClass('table-error-fixed')) {
                return void 0;
            }
            $cellWarningtextContainer.hide();
        },
        /**
         * _showCellWarningText shows cell text warning
         * @method _showCellWarningText
         * @param {Object} event
         * @return void
         */
        "_showCellWarningText": function(event) {
            var $target = $(event.currentTarget),
                $cell,
                $cellWarningtextContainer,
                $list,
                cellOffset,
                reqPosition, TOP_TOLERANCE = 33,
                LEFT_TOLERANCE = -7,
                errorString;
            if (!$target.hasClass('table-error')) {
                return void 0;
            }
            $cell = $target.parents('.cell');
            $list = $cell.parents('.list');
            cellOffset = $target.offset();
            $cellWarningtextContainer = $list.find('.table-error-text');
            errorString = $cell.attr('data-error-data');
            if ($cellWarningtextContainer.hasClass('table-error-fixed')) {
                return void 0;
            }
            reqPosition = {
                'top': cellOffset.top - $list.find('.list-data-container').offset().top + TOP_TOLERANCE,
                'display': 'inline-table',
                'left': cellOffset.left + LEFT_TOLERANCE
            };
            $cellWarningtextContainer.html(errorString);
            $cellWarningtextContainer.show().css(reqPosition);
        },
        /**
         * _updateWarningForCell updates cell warning for the given jQuery cell object
         * @method _updateWarningForCell
         * @param {Object} $cell jQuery cell object
         * @param errorCode {String} error message string for cell
         * @param hasError {Boolean} flag to check if the cell has error
         * @param equationData {Object} equationData model object
         * @return void
         */
        "_updateWarningForCell": function($cell, options) {
            var hasError = options.hasError,
                errorCode = options.errorCode,
                equationData = options.equationData,
                rowHeaderCheck = options.rowHeader,
                tableObjectCid = options.cid,
                $tableCellWarning,
                cellId, tableHasError,
                $listError,
                $warningHandle,
                $warning,
                cellRowNo,
                cellColNo,
                rowColNo,
                spriteClass = 'graphing-tool-sprite-holder',
                cellLatex;
            if ($cell.hasClass('cell-disabled') && ((equationData && equationData.getResidualType() !== "residual") || (!equationData))) {
                return void 0;
            }
            cellId = $cell.attr('data-cell-id');
            rowColNo = cellId.split('-');
            cellRowNo = rowColNo[0];
            cellColNo = rowColNo[1];
            cellLatex = $cell.find('.mathquill-editable').mathquill('latex');
            $tableCellWarning = $cell.find('.table-cell-warning-container');
            $listError = $cell.parents('.list').find('.list-header-container .handler-warning');
            if ($tableCellWarning.length === 0) {
                $warningHandle = MathUtilities.Tools.Graphing.templates['graph-icon']({
                    "type": 'table-cell',
                    "tableCell": true,
                    "rowNo": cellRowNo,
                    "colNo": cellColNo,
                    "cid": tableObjectCid
                }).trim();
                $cell.find('.outerDiv').prepend($warningHandle);
                $tableCellWarning = $cell.find('.table-cell-warning-container');
                $tableCellWarning.addClass('graphing-tool-editor-table-cell-props');
                $warning = $tableCellWarning.find('.handler-warning');
                $warning.on('click', _.bind(this._showTableStyleOptions, this))
                    .on('mouseenter mousedown', _.bind(this._showCellWarningText, this))
                    .on('mouseleave mouseup', _.bind(this._hideCellWarningText, this));
                this.TouchSimulator.enableTouch($warning);
            }
            $warning = $tableCellWarning.find('.handler-warning');
            tableHasError = $listError.hasClass('error');
            if (hasError) {
                $warning.removeClass('table-graph').css({
                    "background-color": 'inherit'
                });
                $tableCellWarning.find('.change-graph-style').removeClass('visible');
                $warning.addClass('table-error');
                if (!options.skip) {
                    this.accManagerView.unloadScreen($cell.parents('.list').attr('id'));
                    this.accManagerView.loadScreen($cell.parents('.list').attr('id'));
                }
                if (errorCode) {
                    $cell.attr('data-error-data', errorCode);
                }
                if (!(tableHasError || errorCode === '')) {
                    $listError.addClass('error').css({
                        "background-color": 'inherit'
                    });
                }
                this._graphingToolView.setAccMessage($warning.attr('id'), this.accManagerView.getAccMessage('handler-warning', 0));
                //add error to table list
            } else {
                $cell.parents('.list').find('.table-error-text').hide();
                if (cellLatex !== '') {
                    if (typeof equationData === 'undefined') {
                        equationData = this._getEquationDataUsingCid($cell.attr('data-equation-cid'));
                    }
                    if (cellRowNo === '1') {
                        $warning.addClass('table-graph').css({
                            "background-color": equationData.getColor()
                        });
                        $warning.find('.change-graph-style').attr('class', '').addClass('change-graph-style visible ' + spriteClass);
                        $warning.find('.change-graph-style').addClass(equationData.getStyleType());
                        $tableCellWarning.find('.change-graph-style').addClass('visible');
                    } else {
                        $warning.removeClass('table-graph').css({
                            "background-color": 'inherit'
                        });
                        $tableCellWarning.find('.change-graph-style').removeClass('visible');
                    }
                } else {
                    $warning.removeClass('table-graph').css({
                        "background-color": 'inherit'
                    });
                    $tableCellWarning.find('.change-graph-style').removeClass('visible');
                }
                $warning.removeClass('table-error');
                if (this._graphingToolView.isAccDivPresent($warning)) {
                    this.accManagerView.setAccMessage($warning.attr('id'), this.accManagerView.getAccMessage('table-equation-panel-messages', 2));
                }
            }
            if (errorCode === '') {
                $warning.removeClass('table-error');
            }
            if (this._graphingToolView.isAccDivPresent($warning)) {
                this.accManagerView.updateFocusRect($warning.attr('id'));
            }
        },
        "_hideBestFitDataAnalysisOptions": function($list) {
            var colorStyleBox = this.$('.graphing-tool-editor-color-style-box-table'),
                bestFitHandle, residualHandle,
                dataAnalysisHandle,
                residualOptions = $list.find('.graphing-tool-editor-residual-options-container'),
                bestFitOptions = $list.find('.graphing-tool-editor-best-fit-options-container'),
                dataAnalysisOptions = $list.find('.graphing-tool-editor-data-analysis-options-container');
            bestFitOptions.removeClass('best-fit-options-selected').hide();
            residualOptions.removeClass('residual-options-selected').hide();
            dataAnalysisOptions.removeClass('data-analysis-options-selected').hide();
            bestFitHandle = colorStyleBox.find('.graphing-tool-editor-best-fit-styles-selected');
            bestFitHandle.find('.best-fit-arrow-selected').removeClass('best-fit-arrow-selected').addClass('best-fit-arrow');
            bestFitHandle.removeClass('graphing-tool-editor-best-fit-styles-selected');
            residualHandle = colorStyleBox.find('.graphing-tool-editor-residuals-options-selected');
            residualHandle.find('.residual-arrow-selected').removeClass('residual-arrow-selected').addClass('residual-arrow');
            residualHandle.removeClass('graphing-tool-editor-residuals-options-selected');
            dataAnalysisHandle = colorStyleBox.find('.graphing-tool-editor-data-analysis-options-selected');
            dataAnalysisHandle.find('.data-analysis-arrow-selected').removeClass('data-analysis-arrow-selected').addClass('data-analysis-arrow');
            dataAnalysisHandle.removeClass('graphing-tool-editor-data-analysis-options-selected');
        },

        "_showSortOptions": function(event) {
            var $styleBox,
                stylePosition,
                topPosition,
                leftPosition,
                $optionSelectionBox,
                $sortOptions = this.$('.graphing-tool-editor-sort-options-container'),
                $list,
                $bestFitOptionSelectionBox = this.$('.graphing-tool-editor-best-fit-styles'),
                $residualOptionSelectionBox = this.$('.graphing-tool-editor-residuals-options'),
                $residualBox = this.$('.graphing-tool-editor-residual-options-container'),
                $bestFitBox = this.$('.graphing-tool-editor-best-fit-options-container'),
                $dataAnalysisBox = this.$('.graphing-tool-editor-data-analysis-options'),
                $dataAnalysisContainer = this.$('.graphing-tool-editor-data-analysis-options-container'),
                LEFT_TOLERANCE = 0,
                cid,
                $target = $(event.target);

            if ($target.hasClass('graphing-tool-editor-sort-selection-box')) {
                $optionSelectionBox = $target;
            } else {
                $optionSelectionBox = $target.parents('.graphing-tool-editor-sort-selection-box');
            }
            $styleBox = $optionSelectionBox.parent();
            cid = $styleBox.attr('data-target-equation-data-cid');
            $list = this.$('div[data-equation-cid=' + cid + ']').parents('.list');

            if ($optionSelectionBox.hasClass('selected')) {
                $sortOptions.hide();
                $optionSelectionBox.removeClass('selected');
                $optionSelectionBox.find('.sort-arrow-selected').removeClass('sort-arrow-selected').addClass('sort-arrow');
            } else {
                stylePosition = $styleBox.position();
                topPosition = stylePosition.top + $optionSelectionBox.position().top;
                leftPosition = stylePosition.left + $styleBox.width() + LEFT_TOLERANCE;
                $sortOptions.show().css({
                    "top": topPosition,
                    "left": leftPosition
                });
                $optionSelectionBox.addClass('selected');
                $optionSelectionBox.find('.sort-arrow').addClass('sort-arrow-selected').removeClass('sort-arrow');
                $bestFitBox.hide().removeClass('best-fit-options-selected');
                $residualBox.hide().removeClass('residual-options-selected');
                $bestFitOptionSelectionBox.removeClass('graphing-tool-editor-best-fit-styles-selected');
                $residualOptionSelectionBox.removeClass('graphing-tool-editor-residuals-options-selected');
                $residualOptionSelectionBox.find('.residual-arrow-selected').removeClass('residual-arrow-selected').addClass('residual-arrow');
                $bestFitOptionSelectionBox.find('.best-fit-arrow-selected').removeClass('best-fit-arrow-selected').addClass('best-fit-arrow');
                $dataAnalysisBox.removeClass('graphing-tool-editor-data-analysis-options-selected');
                $dataAnalysisContainer.hide().removeClass('data-analysis-options-selected');
                $dataAnalysisBox.find('.data-analysis-arrow-selected').removeClass('data-analysis-arrow-selected').addClass('data-analysis-arrow');
                this.accManagerView.unloadScreen('style-elements-screen');
                this.accManagerView.loadScreen('style-elements-screen');
                this.accManagerView.setFocus('graphing-tool-editor-sort-type-container-ascending');
            }
        },
        /**
         * check sort option and call _sortTableColumn
         * @param  {[object]} event
         * @return {void}
         */
        "_callSortTableColumn": function(event) {
            var $target = $(event.currentTarget),
                $sortLable = $target.find('.sort-label'),
                cid = this.$('.graphing-tool-editor-color-style-box-table').attr('data-target-equation-data-cid'),
                $list = this.$('div[data-equation-cid=' + cid + ']').parents('.list'),
                tableView = this._getTableViewObject($list),
                undoRedoData = null,
                columnEquationData,
                prevTableContents = tableView._getTableContent(tableView.getRowCount(), tableView.getColCount(), true).slice(),
                newTableContents,
                tableEquationsDataCid = this._getMappedEquationData($list).getCid(),
                $optionSelectionBox = this.$('.graphing-tool-editor-sort-selection-box'),
                $currCell,
                colNo = Number(tableView._getColumnNo(cid));
            undoRedoData = {
                "undo": "",
                "redo": ""
            };
            undoRedoData.undo = {
                "columnNo": colNo,
                "tableCid": tableEquationsDataCid,
                "tableContent": prevTableContents,
                "actionType": 'beforeSort'
            };
            this._graphingToolView._hidePopUps();
            $optionSelectionBox.removeClass('selected');
            $optionSelectionBox.find('.sort-arrow-selected').removeClass('sort-arrow-selected').addClass('sort-arrow');
            columnEquationData = this._getMappedTableColumnEquationData($(tableView.getColumn(colNo)[0]));
            if (tableView._isColumnBlank(colNo)) {
                this.model.trigger('empty-sort-alert', this.$('.cell[data-equation-cid=' + cid + '] .handler-warning.table-graph').attr('id'));
                return void 0;
            }
            colNo = this.getColumnForSorting(tableView, colNo);
            if ($target.hasClass('ascending') || $sortLable.hasClass('ascending')) {
                this._sortTableColumn(tableView, colNo, true);
            } else {
                this._sortTableColumn(tableView, colNo, false, true);
            }
            this._resetTableCellSolution(tableView);
            this._parseTable(tableView.getCellAt(1, 1), tableView, true, true);
            newTableContents = tableView._getTableContent(tableView.getRowCount(), tableView.getColCount(), true).slice();
            undoRedoData.redo = {
                "columnNo": colNo,
                "tableCid": tableEquationsDataCid,
                "tableContent": newTableContents,
                "actionType": 'afterSort'
            };
            this.execute('sortTableColumn', undoRedoData);
            $currCell = tableView.$('.cell[data-cell-id="1-' + colNo + '"]');
            if ($currCell.children('.acc-read-elem').length > 0) {
                this.accManagerView.setFocus($currCell.attr('id'));
            }
        },
        "getColumnForSorting": function(tableView, colNo, calledColNo) {
            var calculatedColNo = colNo,
                isConstant = true,
                checkLeft,
                plotEquationDataPoints,
                columnEquationData, column;
            if (colNo > tableView.getColCount() || tableView.getLabelOfFunctionOption(colNo) === "L") {
                return colNo;
            }
            do {
                column = tableView.getColumn(calculatedColNo);
                columnEquationData = this._getMappedTableColumnEquationData($(column[0]));
                plotEquationDataPoints = columnEquationData.getPlot().getPoints();
                if (columnEquationData.getSpecie() === 'number' || columnEquationData.getSpecie() === 'expression' ||
                    columnEquationData.getLatex() === '' || tableView._isColumnBlank(calculatedColNo)) {
                    calculatedColNo++;
                    if (calculatedColNo > tableView.getColCount() || checkLeft) {
                        checkLeft = true;
                        calculatedColNo = calledColNo ? --calledColNo : --colNo;
                        if (calculatedColNo <= 1) {
                            calculatedColNo = 1;
                            break;
                        }
                    }
                } else {
                    isConstant = false;
                }
            } while (isConstant)
            return calculatedColNo;
        },
        "_sortTableColumn": function(tableView, colNo, isAscending, isDescending) {
            var tableContent,
                tableDataColumnWise = tableView.getTableContentColumnWise({
                    "solution": true,
                    "getDisabledData": true
                }),
                numbers = [],
                letters = [],
                count = 0,
                originalArray = tableDataColumnWise[colNo].slice(),
                sortedArray = originalArray.slice(),
                originalArrayCopy = originalArray.slice(),
                length = sortedArray.length,
                dataObject = {};

            for (; count < length; count++) {
                if (isNaN(Number(sortedArray[count])) || sortedArray[count] === '') {
                    letters.push(sortedArray[count]);
                } else {
                    numbers.push(Number(sortedArray[count]));
                    originalArrayCopy[count] = Number(sortedArray[count]).toString();
                }
            }
            if (isAscending) {
                letters = letters.sort();
                numbers = numbers.sort(function(firstNumber, secondNumber) {
                    return firstNumber - secondNumber;
                });
            }
            if (isDescending) {
                letters = letters.sort().reverse();
                numbers = numbers.sort(function(firstNumber, secondNumber) {
                    return secondNumber - firstNumber;
                });
            }
            length = numbers.length;
            for (count = 0; count < length; count++) {
                numbers[count] = numbers[count].toString();
            }
            sortedArray = numbers.concat(letters);
            tableContent = tableView._getTableContent(tableView.getRowCount(), tableView.getColCount(), true);
            dataObject = {
                "tableView": tableView,
                "sortedArray": sortedArray.slice(),
                "originalArray": originalArrayCopy,
                "colNo": Number(colNo),
                "isAscending": isAscending,
                "tableContent": tableContent,
                "tableDataColumnWise": tableDataColumnWise,
                "originalColNo": Number(colNo)
            };
            this._sortAndSwapArray(dataObject);

        },
        "_sortAndSwapArray": function(dataObject, callForSameNumbers) {
            var sortedArray = dataObject.sortedArray,
                counter,
                hasSameNumbers = false,
                noOfOccurrence = [],
                oldRowNo,
                newRowNo,
                count,
                newObject,
                repeatedNumber = [],
                alreadySwapped = {
                    "repeatedNumber": null,
                    "noOfOccurrence": null
                },
                alreadySwappedObjs = {},
                lengthDiff,
                newPointsArray = [],
                newPointsArrayLength,
                originalArray = dataObject.originalArray,
                tableView = dataObject.tableView,
                colNo = dataObject.colNo,
                OCCURENCE = 2,
                count = 0,
                currLength,
                length = sortedArray.length;
            for (counter = 0; counter < length; counter++) {
                oldRowNo = originalArray.indexOf(sortedArray[counter]);
                if (sortedArray[counter] === sortedArray[counter + 1]) {
                    hasSameNumbers = true;
                    noOfOccurrence.push(counter);
                } else {

                    if (hasSameNumbers) {
                        //had same points before this counter
                        if (sortedArray[counter] === sortedArray[noOfOccurrence[0]]) {
                            noOfOccurrence.push(counter);
                        }
                        alreadySwapped = {
                            "repeatedNumber": null,
                            "noOfOccurrence": null
                        };
                        repeatedNumber.push(sortedArray[counter]);
                        alreadySwapped.repeatedNumber = sortedArray[counter];
                        alreadySwapped.noOfOccurrence = noOfOccurrence.length;
                        alreadySwappedObjs[sortedArray[counter]] = alreadySwapped;

                        hasSameNumbers = false;
                    }
                }
                lengthDiff = originalArray.length - length;
                if (noOfOccurrence.length >= OCCURENCE) {
                    originalArray.splice(oldRowNo, noOfOccurrence.length - 1);
                    oldRowNo = originalArray.indexOf(sortedArray[counter]) + noOfOccurrence.length - 1;
                }
                if (!hasSameNumbers) {
                    noOfOccurrence = [];
                }
                oldRowNo += OCCURENCE;
                if (lengthDiff >= 1 && lengthDiff < oldRowNo) {
                    newRowNo = counter + OCCURENCE + lengthDiff;
                } else {
                    newRowNo = counter + OCCURENCE;
                }
                tableView.swapRowContents(newRowNo, oldRowNo);
                if (newRowNo !== oldRowNo) {
                    this._resetTableCellSolution(tableView);
                    this._parseTableRow(newRowNo, tableView);
                    this._parseTableRow(oldRowNo, tableView);
                }
                if (callForSameNumbers) {
                    newPointsArrayLength = dataObject.oldRowNumbers.length;
                    originalArray = [];
                    newPointsArray = tableView.getColumnContent(dataObject.colNo, {
                        "solution": true,
                        "getDisabledData": true
                    });
                    for (count = 0; count < newPointsArrayLength; count++) {
                        originalArray[dataObject.oldRowNumbers[count]] = newPointsArray[dataObject.oldRowNumbers[count]];
                    }
                } else {
                    originalArray = tableView.getColumnContent(dataObject.colNo, {
                        "solution": true,
                        "getDisabledData": true
                    });
                    currLength = originalArray.length;
                    for (count = 0; count < currLength; count++) {
                        if (!isNaN(Number(originalArray[count])) && originalArray[count] !== '') {
                            originalArray[count] = Number(originalArray[count]).toString();
                        }
                    }
                }
            }
            colNo++;
            dataObject.originalArray = originalArray.slice();
            _.each(alreadySwappedObjs, _.bind(function(value) {
                dataObject.colNo = this.getColumnForSorting(dataObject.tableView, colNo, dataObject.originalColNo);
                newObject = this._getNewObjectToSwap(dataObject, value.repeatedNumber, value.noOfOccurrence);
                if (newObject) {
                    this._sortAndSwapArray(newObject, true);
                }
            }, this));

        },
        "_getNewObjectToSwap": function(dataObject, repeatedNumber, noOfOccurrences) {
            var tableView = dataObject.tableView,
                oldRowNumbers = [],
                colNo = dataObject.colNo,
                isAscending = dataObject.isAscending,
                sortedArray,
                arrayToSort = [],
                oldRowNo,
                counter,
                newObject,
                tableDataColumnWise = tableView.getTableContentColumnWise({
                    "solution": true,
                    "getDisabledData": true
                }),
                originalArray,
                tableContent = tableView._getTableContent(tableView.getRowCount(), tableView.getColCount(), true);
            if (colNo <= 0) {
                return dataObject;
            }
            originalArray = dataObject.originalArray;

            if (colNo > tableView.getColCount()) {
                colNo -= 2; //get colNo on left
            }
            if (colNo === dataObject.originalColNo) {
                return void 0;
            }
            for (counter = 0; counter < noOfOccurrences; counter++) {
                oldRowNo = originalArray.indexOf(repeatedNumber);
                originalArray.splice(oldRowNo, 1);
                oldRowNo += counter;
                oldRowNumbers.push(oldRowNo);
                arrayToSort.push(tableDataColumnWise[colNo][oldRowNo]);
            }
            originalArray = [];
            for (counter = 0; counter < noOfOccurrences; counter++) {
                originalArray[oldRowNumbers[counter]] = tableDataColumnWise[colNo][oldRowNumbers[counter]];
            }
            sortedArray = arrayToSort.slice();
            if (isAscending) {
                sortedArray = sortedArray.sort(function(a, b) {
                    return a - b;
                });
            } else {
                sortedArray = sortedArray.sort(function(a, b) {
                    return b - a;
                });
            }

            newObject = {
                "tableView": tableView,
                "sortedArray": sortedArray.slice(),
                "originalArray": originalArray.slice(),
                "colNo": Number(colNo),
                "isAscending": isAscending,
                "tableContent": tableContent,
                "tableDataColumnWise": tableDataColumnWise,
                "oldRowNumbers": oldRowNumbers,
                "originalColNo": dataObject.originalColNo
            };

            return newObject;
        },
        /**
         * show best fit options
         * @method _showBestFitOptions
         * @return void
         */
        "_showBestFitOptions": function(event) {
            var $target = $(event.target),
                $bestFitOptionSelectionBox,
                $dataAnalysisOptionSelectionBox,
                leftPosition,
                $bestFitBox, containerWidth,
                $dataAnalysisBox,
                $residualOptionSelectionBox,
                $sortOptionsBox,
                topPosition,
                $residualBox,
                calculateMinWidth,
                calculatedMaxWidth,
                $bestFitContainer,
                $graphContainer,
                $styleBox,
                BEST_FIT_BOX_PADDING = 17,
                MIN_WIDTH = 240,
                stylePosition,
                TOP_TOLERANCE = 4,
                LEFT_TOLERANCE = 2;
            if ($target.hasClass('graphing-tool-editor-best-fit-styles')) {
                $bestFitOptionSelectionBox = $target;
            } else {
                $bestFitOptionSelectionBox = $target.parents('.graphing-tool-editor-best-fit-styles');
            }
            $styleBox = $bestFitOptionSelectionBox.parent();
            $dataAnalysisOptionSelectionBox = this.$('.graphing-tool-editor-data-analysis-options');
            $residualOptionSelectionBox = this.$('.graphing-tool-editor-residuals-options');
            $bestFitContainer = this.$('.graphing-tool-editor-best-fit-options-container');
            $residualBox = this.$('.graphing-tool-editor-residual-options-container');
            $bestFitBox = this.$('.graphing-tool-editor-best-fit-options');
            $dataAnalysisBox = this.$('.graphing-tool-editor-data-analysis-options-container');
            $sortOptionsBox = this.$('.graphing-tool-editor-sort-options-container');
            if ($bestFitContainer.hasClass('best-fit-options-selected')) {
                $bestFitContainer.hide().removeClass('best-fit-options-selected');
                $bestFitOptionSelectionBox.removeClass('graphing-tool-editor-best-fit-styles-selected');
                $bestFitOptionSelectionBox.find('.graphing-tool-sprite-holder.best-fit-arrow-selected').removeClass('best-fit-arrow-selected').addClass('best-fit-arrow');
                this.accManagerView.changeAccMessage('graphing-tool-editor-style-best-fit-options-header', 0, [this.accManagerView.getAccMessage('deselected-text', 0), this.accManagerView.getAccMessage('selected-text', 1)]);
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setFocus('graphing-tool-editor-style-best-fit-options-header');
            } else {
                stylePosition = $styleBox.position();
                topPosition = stylePosition.top + $bestFitOptionSelectionBox.position().top + $bestFitOptionSelectionBox.height() - $bestFitContainer.height() - TOP_TOLERANCE;
                leftPosition = stylePosition.left + $styleBox.width() - LEFT_TOLERANCE;
                $graphContainer = this._graphingToolView.$('#input-column-graph-container');
                containerWidth = $graphContainer.width();
                $bestFitContainer.show().addClass('best-fit-options-selected');
                calculatedMaxWidth = containerWidth - leftPosition - 2 * BEST_FIT_BOX_PADDING;
                if (containerWidth - leftPosition - 2 * BEST_FIT_BOX_PADDING < MIN_WIDTH) {
                    calculateMinWidth = containerWidth - leftPosition - 2 * BEST_FIT_BOX_PADDING;
                    $bestFitBox.css('min-width', calculateMinWidth);
                    $bestFitContainer.css('min-width', calculateMinWidth);
                } else {
                    $bestFitBox.css('min-width', MIN_WIDTH);
                }
                if ($bestFitContainer.width() > calculatedMaxWidth) {
                    $bestFitBox.addClass('show-scroll');
                    $bestFitBox.height($bestFitBox.height() + BEST_FIT_BOX_PADDING);
                    topPosition = topPosition + BEST_FIT_BOX_PADDING;
                } else {
                    if ($bestFitBox.hasClass('show-scroll')) {
                        $bestFitBox.height($bestFitBox.height() - BEST_FIT_BOX_PADDING);
                        topPosition = topPosition - BEST_FIT_BOX_PADDING;
                    }
                    $bestFitBox.removeClass('show-scroll');
                }
                $bestFitBox.css('max-width', calculatedMaxWidth);
                $bestFitContainer.css({
                    "top": topPosition,
                    "left": leftPosition,
                    "max-width": calculatedMaxWidth
                });
                $bestFitOptionSelectionBox.addClass('graphing-tool-editor-best-fit-styles-selected');
                $bestFitOptionSelectionBox.find('.graphing-tool-sprite-holder.best-fit-arrow').addClass('best-fit-arrow-selected').removeClass('best-fit-arrow');
                $dataAnalysisBox.hide().removeClass('data-analysis-options-selected');
                $residualBox.hide().removeClass('residual-options-selected');
                $dataAnalysisOptionSelectionBox.removeClass('graphing-tool-editor-data-analysis-options-selected');
                $residualOptionSelectionBox.removeClass('graphing-tool-editor-residuals-options-selected');
                $residualOptionSelectionBox.find('.graphing-tool-sprite-holder.residual-arrow-selected')
                    .removeClass('residual-arrow-selected').addClass('residual-arrow');
                $dataAnalysisOptionSelectionBox.find('.graphing-tool-sprite-holder.data-analysis-arrow-selected')
                    .removeClass('data-analysis-arrow-selected').addClass('data-analysis-arrow');
                this.accManagerView.unloadScreen('style-elements-screen');
                this.$('.graphing-tool-editor-sort-selection-box').removeClass('selected')
                    .find('.sort-arrow-selected').removeClass('sort-arrow-selected').addClass('sort-arrow');
                $sortOptionsBox.hide();
                this.accManagerView.loadScreen('style-elements-screen');
                this.accManagerView.changeAccMessage('graphing-tool-editor-style-best-fit-options-header', 0, [this.accManagerView.getAccMessage('selected-text', 0), this.accManagerView.getAccMessage('deselected-text', 1)]);
                this.accManagerView.changeAccMessage('graphing-tool-editor-style-data-analysis-options-header', 0, [this.accManagerView.getAccMessage('deselected-text', 0), this.accManagerView.getAccMessage('selected-text', 1)]);
                this.accManagerView.changeAccMessage('graphing-tool-editor-style-residuals-option', 0, [this.accManagerView.getAccMessage('deselected-text', 0), this.accManagerView.getAccMessage('selected-text', 1)]);
                this.accManagerView.setFocus('best-fit-line');
            }
        },
        "_hideTableColumnClickHandler": function(event) {
            var $list = null,
                tableView = null,
                cid = null,
                prevColumnRow1,
                columnNo = null,
                equationData = null,
                $currentColumn = null,
                undoRedoData = null,
                $focusDivId,
                $prevColumnRow1;
            cid = this.$('.graphing-tool-editor-color-style-box-table').attr('data-target-equation-data-cid');
            $list = this.$('.cell[data-equation-cid=' + cid + ']').parents('.list');
            tableView = this._getTableViewObject($list);
            columnNo = tableView._getColumnNo(cid);
            this._hideTableColumn(columnNo, tableView);
            undoRedoData = {
                "undo": "",
                "redo": ""
            };
            $currentColumn = tableView.getColumn(columnNo);
            equationData = this._getEquationDataUsingCid($currentColumn.attr('data-equation-cid'));
            undoRedoData.undo = {
                "columnNo": columnNo,
                "equationData": equationData,
                "actionType": 'showColumn'
            };
            undoRedoData.redo = {
                "columnNo": columnNo,
                "equationData": equationData,
                "actionType": 'hideColumn'
            };
            $prevColumnRow1 = tableView.getColumn(tableView.getPreviousVisibleColumn(columnNo)).eq(0);
            $focusDivId = $prevColumnRow1.find('.next-column-hidden-icon-container');
            if (this._graphingToolView.isAccDivPresent($focusDivId)) {
                this.accManagerView.setFocus($focusDivId.attr('id'));
                this.accManagerView.updateFocusRect($list.attr('id'));
                this.accManagerView.updateFocusRect('list-data-container-of-' + $list.attr('id'));
            }
            this.execute('showHideTableColumn', undoRedoData);
        },
        "_hideTableColumn": function(columnNo, tableView, fromColumn, toColumn) {
            var index = null,
                lastColToHide = null,
                isResidual = null;
            if (fromColumn) {
                for (index = fromColumn + 1; index < toColumn; index++) {
                    tableView.getColumn(index).hide();
                }
                fromColumn = fromColumn + 1;
                toColumn = toColumn - 1;
                this._addLeftHiddenIcon(fromColumn, tableView);
                this._addRightHiddenIcon(toColumn, tableView);
            } else {
                isResidual = tableView.isNextColumnResidual(columnNo);
                if (isResidual) {
                    lastColToHide = tableView.getNextVisibleColumn(columnNo);
                    for (index = columnNo; index < lastColToHide; index++) {
                        tableView.getColumn(index).hide();
                    }
                } else {
                    tableView.getColumn(columnNo).hide();
                }
                this._addLeftHiddenIcon(columnNo, tableView);
                this._addRightHiddenIcon(columnNo, tableView);
            }
            this._adjustTableHeaderHeightForIE(tableView);
            tableView.setCopyBtnContainerWidth();
            this.$('.equation-box-focus').trigger('mousedown');
        },
        "_addLeftHiddenIcon": function(colNo, tableView, isDelete) {
            var prevColumn = null;
            tableView._addLeftHiddenIcon(colNo, isDelete);
            return prevColumn;
        },
        "_addRightHiddenIcon": function(colNo, tableView, isAdd) {
            tableView._addRightHiddenIcon(colNo, isAdd);
        },
        "_showHiddenColumns": function(event) {
            var $currCol = null,
                tableView = null,
                cid = null,
                fromColumn, toColumn, $list, undoRedoData, equationData, undoRedoToColumn,
                $eventTarget = $(event.target),
                columnNo = null,
                focusDivId;
            $currCol = $eventTarget.parents('.first-row');
            $list = $eventTarget.parents('.list');
            cid = $currCol.attr('data-equation-cid');
            tableView = this._getTableViewObject($list);
            columnNo = tableView._getColumnNo(cid);
            if ($eventTarget.hasClass('next-column-hidden-icon') || $eventTarget.find('.next-column-hidden-icon').length > 0) {
                if (tableView.isNextColumnResidual(columnNo)) {
                    fromColumn = tableView.getNextVisibleColumn(columnNo) - 1;
                    toColumn = tableView.getNextVisibleColumn(fromColumn);
                } else {
                    fromColumn = Number(columnNo);
                    toColumn = tableView.getNextVisibleColumn(columnNo);
                }
                undoRedoToColumn = toColumn;
                if (toColumn === null) {
                    toColumn = tableView.getColCount();
                }
            } else {
                toColumn = Number(columnNo);
                undoRedoToColumn = toColumn;
                columnNo = fromColumn = tableView.getPreviousVisibleColumn(columnNo);
                if (fromColumn === null) {
                    fromColumn = 1;
                }
            }
            this._removeHiddenIcon(Number(columnNo), toColumn, tableView);
            this.$('.equation-box-focus').trigger('mousedown');
            tableView.setCopyBtnContainerWidth();
            this._adjustTableHeaderHeightForIE(tableView);
            undoRedoData = {
                "undo": "",
                "redo": ""
            };
            equationData = this._getEquationDataUsingCid($currCol.attr('data-equation-cid'));
            undoRedoData.undo = {
                "toColumn": undoRedoToColumn,
                "fromColumn": fromColumn,
                "equationData": equationData,
                "actionType": 'hideColumn',
                "iconClicked": true
            };
            undoRedoData.redo = {
                "toColumn": undoRedoToColumn,
                "fromColumn": fromColumn,
                "equationData": equationData,
                "actionType": 'showColumn',
                "iconClicked": true
            };
            columnNo = Number(columnNo) + 1;
            focusDivId = "1-" + columnNo + "-of-" + tableView.cid;
            if (this._graphingToolView.isAccDivPresent($('#' + focusDivId))) {
                this.accManagerView.setFocus(focusDivId);
            }
            this.execute('showHideTableColumn', undoRedoData);
        },
        "_removeHiddenIcon": function(fromColumn, toColumn, tableView) {
            var $columns = null,
                $currentColumn = null,
                index = null;
            for (index = fromColumn; index <= toColumn; index++) {
                $columns = tableView.getColumn(index);
                $columns.show();
                $currentColumn = $($columns[0]);
                if (index === toColumn || index !== fromColumn) {
                    $currentColumn.find('.prev-column-hidden-icon-container').hide();
                    $currentColumn.find('.graphing-tool-editor-table-cell-props').removeClass('left-icon-position-adjuster');
                    $currentColumn.find('.mathquill-editable-size').removeClass('left-icon-position-adjuster');
                }
                if (index === fromColumn || index !== toColumn) {
                    $currentColumn.find('.next-column-hidden-icon-container').hide();
                    $columns.removeClass('hidden-column-border');
                    $currentColumn.find('.function-btn').removeClass('right-icon-position-adjuster');
                    $currentColumn.find('.mathquill-editable-size').removeClass('right-icon-position-adjuster');
                }
            }
        },
        "_showSingleHiddenColumn": function(columnNo, tableView) {
            var index = null,
                lastColToHide = null,
                nextCol = null,
                isResidual = null;
            isResidual = tableView.isNextColumnResidual(columnNo);
            if (isResidual) {
                lastColToHide = tableView.getResidualColumnCount(columnNo);
                for (index = columnNo; index <= lastColToHide; index++) {
                    tableView.getColumn(index).show();
                }
                nextCol = lastColToHide + 1;
            } else {
                nextCol = columnNo + 1;
                tableView.getColumn(columnNo).show();
            }
            if (tableView.getColumn(columnNo - 1).css('display') === 'none') {
                this._addLeftHiddenIcon(columnNo, tableView);
                this._addRightHiddenIcon(columnNo - 1, tableView);
            } else {
                this._removeHiddenIcon(columnNo - 1, columnNo, tableView);
            }
            if (tableView.getColumn(nextCol).css('display') === 'none') {
                this._addRightHiddenIcon(columnNo, tableView);
                this._addLeftHiddenIcon(nextCol, tableView);
            } else {
                this._removeHiddenIcon(columnNo, nextCol, tableView);
            }
            this._adjustTableHeaderHeightForIE(tableView);
            this.$('.equation-box-focus').trigger('mousedown');
            tableView.setCopyBtnContainerWidth();
        },
        /**
         * show data analysis best fit options
         * @method _showDataAnalysisOptions
         * @param event {Obejct}
         * @return void
         */
        "_showDataAnalysisOptions": function(event) {
            var $target = $(event.target),
                $dataAnalysisOptionSelectionBox,
                $bestFitOptionSelectionBox,
                leftPosition,
                $bestFitBox,
                cid,
                $residualBox,
                containerWidth,
                $dataAnalysisBox, $dataAnalysisContainer,
                topPosition,
                $residualOptionSelectionBox,
                $graphContainer,
                dataAnalysis,
                calculateMinWidth,
                DATA_ANALYSIS_BOX_PADDING = 17,
                $styleBox, tableView,
                $list, colNo,
                LEFT_TOLERANCE = 2,
                TOP_TOLERANCE = 4,
                styleBoxPosition,
                calculatedMaxWidth,
                $sortOptionsBox,
                $colorStyleBox, MIN_WIDTH = 262;
            if ($target.hasClass('graphing-tool-editor-data-analysis-options')) {
                $dataAnalysisOptionSelectionBox = $target;
            } else {
                $dataAnalysisOptionSelectionBox = $target.parents('.graphing-tool-editor-data-analysis-options');
            }
            $styleBox = $dataAnalysisOptionSelectionBox.parent();
            $colorStyleBox = this.$('.graphing-tool-editor-color-style-box-table');
            cid = $colorStyleBox.attr('data-target-equation-data-cid');
            $list = this.$('.cell[data-equation-cid=' + cid + ']').parents('.list');
            $bestFitOptionSelectionBox = $colorStyleBox.find('.graphing-tool-editor-best-fit-styles');
            $residualOptionSelectionBox = $colorStyleBox.find('.graphing-tool-editor-residuals-options');
            $residualBox = this.$('.graphing-tool-editor-residual-options-container');
            $bestFitBox = this.$('.graphing-tool-editor-best-fit-options-container');
            $dataAnalysisBox = this.$('.graphing-tool-editor-data-analysis-option');
            $dataAnalysisContainer = this.$('.graphing-tool-editor-data-analysis-options-container');
            $sortOptionsBox = this.$('.graphing-tool-editor-sort-options-container');
            if ($dataAnalysisContainer.hasClass('data-analysis-options-selected')) {
                $dataAnalysisContainer.hide().removeClass('data-analysis-options-selected');
                $dataAnalysisOptionSelectionBox.removeClass('graphing-tool-editor-data-analysis-options-selected');
                $dataAnalysisOptionSelectionBox.find('.graphing-tool-sprite-holder.data-analysis-arrow-selected')
                    .removeClass('data-analysis-arrow-selected').addClass('data-analysis-arrow');
                this.accManagerView.changeAccMessage('graphing-tool-editor-style-data-analysis-options-header', 0, [this.accManagerView.getAccMessage('deselected-text', 0), this.accManagerView.getAccMessage('selected-text', 1)]);
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setFocus('graphing-tool-editor-style-data-analysis-options-header');
            } else {
                $dataAnalysisContainer.find('.first-row-style').show();
                styleBoxPosition = $styleBox.position();
                topPosition = styleBoxPosition.top + $dataAnalysisOptionSelectionBox.position().top + $dataAnalysisOptionSelectionBox.height() - $dataAnalysisContainer.height() - TOP_TOLERANCE;
                leftPosition = styleBoxPosition.left + $styleBox.width() - LEFT_TOLERANCE;
                $graphContainer = this._graphingToolView.$('#input-column-graph-container');
                containerWidth = $graphContainer.width();
                colNo = $list.find('.cell[data-equation-cid=' + cid + ']').attr('data-cell-id').split('-')[1];
                tableView = this._getTableViewObject($list);
                dataAnalysis = this._calculateDataAnalysisVal(tableView, colNo);
                $dataAnalysisContainer.show();
                this._displayDataAnalysis(dataAnalysis, $dataAnalysisBox, cid);
                calculatedMaxWidth = containerWidth - leftPosition - DATA_ANALYSIS_BOX_PADDING;
                if (containerWidth - leftPosition - 2 * DATA_ANALYSIS_BOX_PADDING < MIN_WIDTH) {
                    calculateMinWidth = containerWidth - leftPosition - 2 * DATA_ANALYSIS_BOX_PADDING;
                    $dataAnalysisBox.css('min-width', calculateMinWidth);
                    $dataAnalysisContainer.css('min-width', calculateMinWidth);
                } else {
                    $dataAnalysisBox.css('min-width', MIN_WIDTH);
                }
                $dataAnalysisBox.css('max-width', calculatedMaxWidth);
                $dataAnalysisContainer.css('max-width', calculatedMaxWidth);
                $dataAnalysisOptionSelectionBox.addClass('graphing-tool-editor-data-analysis-options-selected');
                $dataAnalysisOptionSelectionBox.find('.graphing-tool-sprite-holder.data-analysis-arrow')
                    .addClass('data-analysis-arrow-selected').removeClass('data-analysis-arrow');
                $bestFitBox.hide().removeClass('best-fit-options-selected');
                $residualBox.hide().removeClass('residual-options-selected');
                $bestFitOptionSelectionBox.removeClass('graphing-tool-editor-best-fit-styles-selected');
                $residualOptionSelectionBox.removeClass('graphing-tool-editor-residuals-options-selected');
                $residualOptionSelectionBox.find('.graphing-tool-sprite-holder.residual-arrow-selected')
                    .removeClass('residual-arrow-selected').addClass('residual-arrow');
                $bestFitOptionSelectionBox.find('.graphing-tool-sprite-holder.best-fit-arrow-selected')
                    .removeClass('best-fit-arrow-selected').addClass('best-fit-arrow');
                if (tableView._getColumnNo(cid) === "1") {
                    $dataAnalysisContainer.find('.first-row-style').hide();
                    topPosition = styleBoxPosition.top + $dataAnalysisOptionSelectionBox.position().top +
                        $dataAnalysisOptionSelectionBox.height() - $dataAnalysisContainer.height() - TOP_TOLERANCE;
                    $dataAnalysisContainer.css({
                        "top": topPosition
                    });
                }
                $dataAnalysisContainer.css({
                    "top": topPosition,
                    "left": leftPosition
                }).addClass('data-analysis-options-selected');
                this.accManagerView.updateFocusRect('data-analysis-label-data-points');
                $sortOptionsBox.hide();
                this.$('.graphing-tool-editor-sort-selection-box').removeClass('selected')
                    .find('.sort-arrow-selected').removeClass('sort-arrow-selected').addClass('sort-arrow');
                this.accManagerView.updateFocusRect('data-analysis-label-mean');
                this.accManagerView.updateFocusRect('data-analysis-label-median');
                this.accManagerView.updateFocusRect('data-analysis-label-mode');
                this.accManagerView.updateFocusRect('data-analysis-label-standard-deviation');
                this.accManagerView.updateFocusRect('data-analysis-label-absolute-deviation');
                this.accManagerView.updateFocusRect('data-analysis-label-correlation');
                this.accManagerView.updateFocusRect('data-analysis-label-correlation-squared');
                this.accManagerView.updateFocusRect('data-analysis-label-summary');
                this.accManagerView.updateFocusRect('data-analysis-label-iqr');
                this.accManagerView.setFocus('data-analysis-label-data-points');

                this.accManagerView.changeAccMessage('graphing-tool-editor-style-best-fit-options-header', 0, [this.accManagerView.getAccMessage('deselected-text', 0), this.accManagerView.getAccMessage('selected-text', 1)]);
                this.accManagerView.changeAccMessage('graphing-tool-editor-style-data-analysis-options-header', 0, [this.accManagerView.getAccMessage('selected-text', 0), this.accManagerView.getAccMessage('deselected-text', 1)]);
                this.accManagerView.changeAccMessage('graphing-tool-editor-style-residuals-option', 0, [this.accManagerView.getAccMessage('deselected-text', 0), this.accManagerView.getAccMessage('selected-text', 1)]);
            }

        },
        "_showResidualOptions": function(event) {
            var $target = $(event.target),
                $dataAnalysisOptionSelectionBox,
                $residualOptionSelectionBox,
                $styleBox,
                leftPosition,
                topPosition,
                $residualBox,
                LEFT_TOLERANCE = 2,
                TOP_TOLERANCE = 4,
                $graphContainer,
                calculateMinWidth,
                $residualBoxContainer,
                containerWidth,
                calculatedMaxWidth,
                $bestFitOptionSelectionBox,
                $bestFitBox, MIN_WIDTH = 240,
                RESIDUAL_BOX_PADDING = 17,
                styleBoxPosition,
                $sortOptionsBox,
                $dataAnalysisBox;
            if ($target.hasClass('graphing-tool-editor-residuals-options')) {
                $residualOptionSelectionBox = $target;
            } else {
                $residualOptionSelectionBox = $target.parents('.graphing-tool-editor-residuals-options');
            }
            $styleBox = $residualOptionSelectionBox.parent();
            $bestFitOptionSelectionBox = $styleBox.find('.graphing-tool-editor-best-fit-styles');
            $dataAnalysisOptionSelectionBox = $styleBox.find('.graphing-tool-editor-data-analysis-options');
            $residualBoxContainer = this.$('.graphing-tool-editor-residual-options-container');
            $residualBox = this.$('.graphing-tool-editor-residual-options');
            $bestFitBox = this.$('.graphing-tool-editor-best-fit-options-container');
            $dataAnalysisBox = this.$('.graphing-tool-editor-data-analysis-options-container');
            $sortOptionsBox = this.$('.graphing-tool-editor-sort-options-container');
            if ($residualOptionSelectionBox.hasClass('graphing-tool-editor-residuals-options-selected')) {
                $residualBoxContainer.hide().removeClass('residual-options-selected');
                $residualOptionSelectionBox.removeClass('graphing-tool-editor-residuals-options-selected');
                $residualOptionSelectionBox.find('.graphing-tool-sprite-holder.residual-arrow-selected')
                    .removeClass('residual-arrow-selected').addClass('residual-arrow');
                this.accManagerView.changeAccMessage('graphing-tool-editor-style-residuals-option', 0, [this.accManagerView.getAccMessage('deselected-text', 0), this.accManagerView.getAccMessage('selected-text', 1)]);
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setFocus('graphing-tool-editor-style-residuals-option');
            } else {
                styleBoxPosition = $styleBox.position();
                topPosition = styleBoxPosition.top + $residualOptionSelectionBox.position().top + $residualOptionSelectionBox.height() - $residualBoxContainer.height() - TOP_TOLERANCE;
                leftPosition = styleBoxPosition.left + $styleBox.width() - LEFT_TOLERANCE;
                $graphContainer = this._graphingToolView.$('#input-column-graph-container');
                containerWidth = $graphContainer.width();
                $residualBoxContainer.show();
                calculatedMaxWidth = containerWidth - leftPosition - 2 * RESIDUAL_BOX_PADDING;
                if (containerWidth - leftPosition - 2 * RESIDUAL_BOX_PADDING < MIN_WIDTH) {
                    calculateMinWidth = containerWidth - leftPosition - 2 * RESIDUAL_BOX_PADDING;
                    $residualBox.css('min-width', calculateMinWidth);
                    $residualBoxContainer.css('min-width', calculateMinWidth);
                } else {
                    $residualBox.css('min-width', MIN_WIDTH);
                }
                if ($residualBoxContainer.width() > calculatedMaxWidth) {
                    $residualBox.addClass('show-scroll');
                    $residualBox.height($residualBox.height() + RESIDUAL_BOX_PADDING);
                    topPosition = topPosition + RESIDUAL_BOX_PADDING;
                } else {
                    if ($residualBox.hasClass('show-scroll')) {
                        $residualBox.height($residualBox.height() - RESIDUAL_BOX_PADDING);
                        topPosition = topPosition - RESIDUAL_BOX_PADDING;
                    }
                    $residualBox.removeClass('show-scroll');
                }
                $residualBox.css('max-width', calculatedMaxWidth);
                $residualBoxContainer.css({
                    "top": topPosition,
                    "left": leftPosition,
                    "max-width": calculatedMaxWidth
                }).addClass('residual-options-selected');
                $residualOptionSelectionBox.addClass('graphing-tool-editor-residuals-options-selected');
                $bestFitOptionSelectionBox.removeClass('graphing-tool-editor-best-fit-styles-selected');
                $dataAnalysisOptionSelectionBox.removeClass('graphing-tool-editor-data-analysis-options-selected');
                $residualOptionSelectionBox.find('.graphing-tool-sprite-holder.residual-arrow').addClass('residual-arrow-selected').removeClass('residual-arrow');
                this.accManagerView.unloadScreen('style-elements-screen');
                this.accManagerView.loadScreen('style-elements-screen');
                this.accManagerView.setFocus('residual-line');

                this.accManagerView.changeAccMessage('graphing-tool-editor-style-best-fit-options-header', 0, [this.accManagerView.getAccMessage('deselected-text', 0), this.accManagerView.getAccMessage('selected-text', 1)]);
                this.accManagerView.changeAccMessage('graphing-tool-editor-style-data-analysis-options-header', 0, [this.accManagerView.getAccMessage('deselected-text', 0), this.accManagerView.getAccMessage('selected-text', 1)]);
                this.accManagerView.changeAccMessage('graphing-tool-editor-style-residuals-option', 0, [this.accManagerView.getAccMessage('selected-text', 0), this.accManagerView.getAccMessage('deselected-text', 1)]);
            }
            $sortOptionsBox.hide();
            this.$('.graphing-tool-editor-sort-selection-box').removeClass('selected')
                .find('.sort-arrow-selected').removeClass('sort-arrow-selected').addClass('sort-arrow');
            $bestFitBox.hide().removeClass('best-fit-options-selected');
            $dataAnalysisBox.hide().removeClass('data-analysis-options-selected');
            $bestFitOptionSelectionBox.find('.graphing-tool-sprite-holder.best-fit-arrow-selected')
                .removeClass('best-fit-arrow-selected').addClass('best-fit-arrow');
            $dataAnalysisOptionSelectionBox.find('.graphing-tool-sprite-holder.data-analysis-arrow-selected')
                .removeClass('data-analysis-arrow-selected').addClass('data-analysis-arrow');
        },
        /**
         * removes invalid data from array
         * @method _removeInvalidData
         * @param data {Array}
         * @return {Array}
         */
        "_removeInvalidData": function(data) {
            var loopVar1,
                dataLength = data[0].length,
                dataEle,
                dataEleX;
            for (loopVar1 = 0; loopVar1 < dataLength; loopVar1++) {
                dataEle = data[1][loopVar1];
                dataEleX = data[0][loopVar1];
                if (typeof dataEle === 'undefined' || !isFinite(dataEle) || dataEle === '' || !isFinite(dataEleX)) {
                    data[0].splice(loopVar1, 1);
                    data[1].splice(loopVar1, 1);
                    loopVar1--;
                    dataLength--;
                }
            }
            return data;
        },
        "_removeInvalidPoints": function(points) {
            if (typeof points === 'undefined' || points === null) {
                return points;
            }
            var loopVar, noOfPoints = 0;
            points = points.slice();
            noOfPoints = points.length;
            for (loopVar = 0; loopVar < noOfPoints; loopVar++) {
                if (!(isFinite(points[loopVar][0]) && isFinite(points[loopVar][1]))) {
                    points.splice(loopVar, 1);
                    noOfPoints--;
                }
            }
            return points;
        },
        /**
         * calculates data analysis values
         * @method _calculateDataAnalysisVal
         * @param tableView {Object}
         * @param colNo {Number}
         * @return {Object}
         */
        "_calculateDataAnalysisVal": function(tableView, colNo) {
            var dataAnalysisModel = MathUtilities.Components.Utils.Models.DataAnalysis,
                dataArray,
                coloDataLength,
                col1 = tableView.getTableColumnData(1, true).slice(),
                colN,
                dataAnalysis,
                bestFitPointsObj,
                loopVar;

            colN = tableView.getTableColumnData(colNo, true).slice();
            col1.splice(0, 1);
            colN.splice(0, 1);
            if (tableView.getRowHeaderState() === true) {
                coloDataLength = col1.length;
                col1 = [];
                for (loopVar = 0; loopVar < coloDataLength; loopVar++) {
                    col1.push(loopVar + 1);
                }
            }
            dataArray = this._removeInvalidData([col1, colN]);
            if (dataArray[1].length > 0) {
                bestFitPointsObj = this._getBestFitPoints(tableView, colNo, dataArray);
                dataArray = bestFitPointsObj.dataArray;
                dataAnalysis = dataAnalysisModel.getStatisticalDataAnalysis(dataArray.slice(), true);
            }
            if (dataArray.length < 3 && bestFitPointsObj) { // there should be 3 values x,y and best fit
                dataAnalysis.coefficientOfCorrelation = bestFitPointsObj.errorCode;
            }
            return dataAnalysis;
        },

        "_getBestFitPoints": function(tableView, colNo, dataArray) {
            var equationData,
                tableEquationCid,
                $list,
                engine,
                engineToBePassed,
                counter = 0,
                xCoords = dataArray[0],
                length = xCoords.length,
                errorCode,
                noOfLists,
                bestFitPoints = [];

            tableEquationCid = tableView.getCellAt(1, Number(colNo)).attr('data-equation-cid');
            $list = this.$('.list[table-col-equationdata-cid =' + tableEquationCid + ']');
            noOfLists = $list.length;
            if (noOfLists === 1) {
                equationData = this._getMappedEquationData($list);
                engine = new Function('param,constants,functions', equationData.getFunctionCode());
                engineToBePassed = function eng1(param) {
                    return engine(param, equationData.getConstants(), equationData.getFunctions())[0];
                };
                for (; counter < length; counter++) {
                    bestFitPoints.push(engineToBePassed(xCoords[counter]));
                }
                dataArray.push(bestFitPoints);
            } else if (noOfLists === 0) {
                errorCode = 'no-bestfit-selected';
            } else {
                errorCode = 'multiple-bestfit-selected';
            }
            return {
                "dataArray": dataArray,
                "errorCode": errorCode
            };
        },

        "_getDisplaybleDataAnalysis": function(number, limit) {
            var numberString = number.toString(),
                numberArr = [],
                indexOfCDot,
                MathHelper = MathUtilities.Components.Utils.Models.MathHelper;

            numberString = MathHelper._convertDisplayToAppliedPrecisionForm(Number(number), limit);
            indexOfCDot = numberString.toString().indexOf('\\cdot10^{');
            if (indexOfCDot !== -1) {
                numberArr = numberString.split('\\cdot10^{');
                numberString = numberArr[0] + '· 10<sup>' + numberArr[1].split('}')[0] + '</sup>';
            }
            return numberString;
        },
        /**
         * displays data analysis values
         * @method _displayDataAnalysis
         * @param dataAnalysis {Object}
         * @param $dataAnalysisBox {Object}
         * @return void
         */
        "_displayDataAnalysis": function(dataAnalysis, $dataAnalysisBox, cid) {
            var iqr,
                coefficientOfCorrelation,
                coefficientOfCorrelationSquared,
                fivePointSummary,
                mean,
                meanAbsoluteDeviation,
                median,
                mode,
                limitFordisplay = this.model.get("precision"),
                modeLength,
                numberOfDataPoints,
                standardDeviation,
                populationStandardDeviation,
                loopVar,
                consistNan = false,
                DATA_ANALYSIS_ERRORS = MathUtilities.Tools.Graphing.Models.EquationPanel.DATA_ANALYSIS_ERRORS,
                FIVE_POINT_SUMMARY_LENGTH = 5;

            if (dataAnalysis) {
                iqr = dataAnalysis.IQR;
                coefficientOfCorrelation = dataAnalysis.coefficientOfCorrelation;
                coefficientOfCorrelationSquared = dataAnalysis.coefficientOfCorrelationSquared;
                fivePointSummary = dataAnalysis.fivePointSummary;
                mean = dataAnalysis.mean;
                meanAbsoluteDeviation = dataAnalysis.meanAbsoluteDeviation;
                median = dataAnalysis.median;
                mode = dataAnalysis.mode;
                numberOfDataPoints = dataAnalysis.numberOfDataPoints;
                standardDeviation = dataAnalysis.standardDeviation;
                populationStandardDeviation = dataAnalysis.populationStandardDeviation;

                if (fivePointSummary) {
                    for (loopVar = 0; loopVar < FIVE_POINT_SUMMARY_LENGTH; loopVar++) {
                        if (isNaN(fivePointSummary[loopVar])) {
                            consistNan = true;
                            break;
                        } else {
                            fivePointSummary[loopVar] = this._getDisplaybleDataAnalysis(fivePointSummary[loopVar], limitFordisplay);
                        }
                    }
                }

                if (mode) {
                    modeLength = mode.length;
                    for (loopVar = 0; loopVar < modeLength; loopVar++) {
                        mode[loopVar] = this._getDisplaybleDataAnalysis(mode[loopVar], limitFordisplay);
                    }
                }

                iqr = iqr !== null && !isNaN(iqr) ? this._getDisplaybleDataAnalysis(iqr, limitFordisplay) :
                    DATA_ANALYSIS_ERRORS.INSUFFICIENT_POINTS;

                if (coefficientOfCorrelation === "no-bestfit-selected") {
                    coefficientOfCorrelation = coefficientOfCorrelationSquared = DATA_ANALYSIS_ERRORS.NO_BESTFIT;
                } else if (coefficientOfCorrelation === "multiple-bestfit-selected") {
                    coefficientOfCorrelation = coefficientOfCorrelationSquared = DATA_ANALYSIS_ERRORS.MULTIPLE_BESTFIT;
                } else if (isNaN(coefficientOfCorrelation)) {
                    coefficientOfCorrelation = coefficientOfCorrelationSquared = 'undefined';
                } else {
                    coefficientOfCorrelation = coefficientOfCorrelation !== null ?
                        this._getDisplaybleDataAnalysis(coefficientOfCorrelation, limitFordisplay) :
                        DATA_ANALYSIS_ERRORS.INSUFFICIENT_POINTS;
                    coefficientOfCorrelationSquared = coefficientOfCorrelationSquared !== null &&
                        !isNaN(coefficientOfCorrelationSquared) ?
                        this._getDisplaybleDataAnalysis(coefficientOfCorrelationSquared, limitFordisplay) :
                        DATA_ANALYSIS_ERRORS.INSUFFICIENT_POINTS;
                }
                fivePointSummary = fivePointSummary !== null && !consistNan ? fivePointSummary.join() :
                    DATA_ANALYSIS_ERRORS.INSUFFICIENT_POINTS;

                mean = mean !== null && !isNaN(mean) ? this._getDisplaybleDataAnalysis(mean, limitFordisplay) :
                    DATA_ANALYSIS_ERRORS.INSUFFICIENT_POINTS;

                meanAbsoluteDeviation = meanAbsoluteDeviation !== null && !isNaN(meanAbsoluteDeviation) ?
                    this._getDisplaybleDataAnalysis(meanAbsoluteDeviation, limitFordisplay) :
                    DATA_ANALYSIS_ERRORS.INSUFFICIENT_POINTS;

                median = median !== null ? this._getDisplaybleDataAnalysis(median, limitFordisplay) :
                    DATA_ANALYSIS_ERRORS.INSUFFICIENT_POINTS;

                mode = mode !== null && mode.indexOf(NaN) === -1 ? mode.join() : DATA_ANALYSIS_ERRORS.NO_MODE;

                numberOfDataPoints = numberOfDataPoints !== null && !isNaN(numberOfDataPoints) ?
                    numberOfDataPoints : DATA_ANALYSIS_ERRORS.INSUFFICIENT_POINTS;

                standardDeviation = standardDeviation !== null && !isNaN(standardDeviation) ?
                    this._getDisplaybleDataAnalysis(standardDeviation, limitFordisplay) :
                    DATA_ANALYSIS_ERRORS.INSUFFICIENT_POINTS;

                populationStandardDeviation = populationStandardDeviation !== null &&
                    !isNaN(populationStandardDeviation) ?
                    this._getDisplaybleDataAnalysis(populationStandardDeviation, limitFordisplay) :
                    DATA_ANALYSIS_ERRORS.INSUFFICIENT_POINTS;

                this.accManagerView.changeAccMessage('data-analysis-label-data-points', 0, [numberOfDataPoints]);
                this.accManagerView.changeAccMessage('data-analysis-label-mean', 0, [mean]);
                this.accManagerView.changeAccMessage('data-analysis-label-median', 0, [median]);
                this.accManagerView.changeAccMessage('data-analysis-label-mode', 0, [mode]);
                this.accManagerView.changeAccMessage('data-analysis-label-standard-deviation', 0, [standardDeviation]);
                this.accManagerView.changeAccMessage('data-analysis-label-population-standard-deviation', 0, [populationStandardDeviation]);
                this.accManagerView.changeAccMessage('data-analysis-label-absolute-deviation', 0, [meanAbsoluteDeviation]);
                this.accManagerView.changeAccMessage('data-analysis-label-correlation', 0, [coefficientOfCorrelation]);
                this.accManagerView.changeAccMessage('data-analysis-label-correlation-squared', 0, [coefficientOfCorrelationSquared]);
                this.accManagerView.changeAccMessage('data-analysis-label-summary', 0, [fivePointSummary]);
                this.accManagerView.changeAccMessage('data-analysis-label-iqr', 0, [iqr]);

                $dataAnalysisBox.find('.iqr-value').html(iqr);
                $dataAnalysisBox.find('.correlation-value').html(coefficientOfCorrelation);
                $dataAnalysisBox.find('.correlation-squared-value').html(coefficientOfCorrelationSquared);
                $dataAnalysisBox.find('.summary-value').html(fivePointSummary);
                $dataAnalysisBox.find('.mean-value').html(mean);
                $dataAnalysisBox.find('.absolute-deviation-value').html(meanAbsoluteDeviation);
                $dataAnalysisBox.find('.median-value').html(median);
                $dataAnalysisBox.find('.mode-value').html(mode);
                $dataAnalysisBox.find('.data-points-value').html(numberOfDataPoints);
                $dataAnalysisBox.find('.standard-deviation-value').html(standardDeviation);
                $dataAnalysisBox.find('.population-standard-deviation-value').html(populationStandardDeviation);

            } else {
                $dataAnalysisBox.find('.data-analysis-value').html('');
                this.accManagerView.changeAccMessage('data-analysis-label-data-points', 0, ['']);
                this.accManagerView.changeAccMessage('data-analysis-label-mean', 0, ['']);
                this.accManagerView.changeAccMessage('data-analysis-label-median', 0, ['']);
                this.accManagerView.changeAccMessage('data-analysis-label-mode', 0, ['']);
                this.accManagerView.changeAccMessage('data-analysis-label-standard-deviation', 0, ['']);
                this.accManagerView.changeAccMessage('data-analysis-label-population-standard-deviation', 0, ['']);
                this.accManagerView.changeAccMessage('data-analysis-label-absolute-deviation', 0, ['']);
                this.accManagerView.changeAccMessage('data-analysis-label-correlation', 0, ['']);
                this.accManagerView.changeAccMessage('data-analysis-label-correlation-squared', 0, ['']);
                this.accManagerView.changeAccMessage('data-analysis-label-summary', 0, ['']);
                this.accManagerView.changeAccMessage('data-analysis-label-iqr', 0, ['']);

            }
        },
        // bestfit RELATED
        /**
         * _showBestFitGraph shows bestFit graph
         * @method _showBestFitGraph
         * @param equationData {Object}
         * @return void
         */
        "_showBestFitGraph": function(equationData, $tableList) {
            var bestFitData = equationData.getBestFit(),
                counter, bestFitEquationData,
                bestFitEquationListData = {},
                _equationDataManager = this.model.get('_equationDataManager'),
                bestFitEquationFunction = function(value, degree) {
                    bestFitEquationData = value.equationData;
                    if (value.selected && bestFitEquationData) {
                        _equationDataManager.addPlotEquation(bestFitEquationData);
                        bestFitEquationData.trigger('change-equation');
                        bestFitEquationListData.tableColEquationData = equationData;
                        bestFitEquationListData.equationData = bestFitEquationData;
                        bestFitEquationListData.bestFitType = counter;
                        bestFitEquationListData.degree = degree;
                        bestFitEquationListData.tableList = $tableList;
                        bestFitEquationData.trigger('best-fit-equation-data-added', bestFitEquationListData);
                    }
                };
            for (counter in bestFitData) {
                if (counter !== 'curve') {
                    bestFitEquationData = bestFitData[counter];
                    if (bestFitEquationData.equationData && bestFitEquationData.selected) {
                        _equationDataManager.addPlotEquation(bestFitEquationData.equationData);
                        bestFitEquationData.equationData.trigger('change-equation');
                        bestFitEquationListData.tableColEquationData = equationData;
                        bestFitEquationListData.equationData = bestFitEquationData.equationData;
                        bestFitEquationListData.bestFitType = counter;
                        bestFitEquationListData.tableList = $tableList;
                        bestFitEquationData.equationData.trigger('best-fit-equation-data-added', bestFitEquationListData);
                    }
                } else {
                    _.each(bestFitData.curve, bestFitEquationFunction);
                }
            }
        },
        /**
         * _hideBestFitGraph hides bestFit graph
         * @method _hideBestFitGraph
         * @param equationData {Object}
         * @return void
         */
        "_hideBestFitGraph": function(equationData) {
            var bestFitData = equationData.getBestFit(),
                counter, bestFitEquationData,
                bestFitEquationFunction = function(value) {
                    bestFitEquationData = value.equationData;
                    if (value.selected === false) {
                        bestFitEquationData.setCurveVisibility(true);
                        bestFitEquationData.hideGraph();
                    }
                };
            for (counter in bestFitData) {
                if (counter !== 'curve') {
                    bestFitEquationData = bestFitData[counter];
                    if (bestFitEquationData.selected === false) {
                        bestFitEquationData.equationData.setCurveVisibility(true);
                        bestFitEquationData.equationData.hideGraph();
                    }
                } else {
                    _.each(bestFitData.curve, bestFitEquationFunction);
                }
            }
        },
        /**
         * _retrieveBestFit retrieves bestFit graph
         * @method _retrieveBestFit
         * @param bestFit {Object}
         * @param equationData {Object}
         * @return void
         */
        "_retrieveBestFit": function(bestFit, equationData, tableView) {
            var bestFitData = {},
                points,
                equationBestFit = {
                    "line": {},
                    "curve": {},
                    "exp": {},
                    "polynomial": {}
                },
                bestFitEquationData,
                plotData = equationData.getPlot(),
                $tableList = tableView.$el.parents('.list');
            this._bestFitAlertDisplayed = true;
            points = this._removeInvalidPoints(plotData.getPoints());
            equationData.setBestFit(equationBestFit);
            if (bestFit) {
                if (bestFit.curve) {
                    _.each(bestFit.curve, _.bind(function(value, counter) {
                        if (bestFit.curve[counter].selected === true) {
                            bestFitData = this.model._getBestFitCurve(points, counter, false);
                            bestFitEquationData = this._createBestFitEquationData(bestFitData, equationData);
                            equationBestFit.curve[counter] = {
                                "selected": true,
                                "equationData": bestFitEquationData
                            };
                            tableView.trigger('draw-best-fit-chart', 'curve', counter, equationData.getCid());
                            this._addBestFitEquationList({
                                "tableList": $tableList,
                                "equationData": bestFitEquationData,
                                "tableColEquationDataCid": equationData.getCid(),
                                "bestFitType": "curve",
                                "degree": counter
                            });
                        }
                    }, this));
                }
                if (typeof bestFit.line !== 'undefined' && bestFit.line.selected === true) {
                    bestFitData = this.model._getBestFitLine(points, false, equationData.getBestFit());
                    bestFitEquationData = this._createBestFitEquationData(bestFitData, equationData);
                    equationBestFit.line = {
                        "selected": true,
                        "equationData": bestFitEquationData
                    };
                    tableView.trigger('draw-best-fit-chart', 'line', false, equationData.getCid());
                    this._addBestFitEquationList({
                        "tableList": $tableList,
                        "equationData": bestFitEquationData,
                        "tableColEquationDataCid": equationData.getCid(),
                        "bestFitType": "line"
                    });
                }
                if (bestFit.exp && bestFit.exp.selected) {
                    bestFitData = this.model._getBestFitExp(points, false);
                    bestFitEquationData = this._createBestFitEquationData(bestFitData, equationData);
                    equationBestFit.exp = {
                        "selected": true,
                        "equationData": bestFitEquationData
                    };
                    tableView.trigger('draw-best-fit-chart', 'exp', false, equationData.getCid());
                    this._addBestFitEquationList({
                        "tableList": $tableList,
                        "equationData": bestFitEquationData,
                        "tableColEquationDataCid": equationData.getCid(),
                        "bestFitType": "exp"
                    });
                }
                if (bestFit.polynomial && bestFit.polynomial.selected) {
                    this._createBestFitCurveObject({
                        "parentEquation": equationData,
                        "points": points
                    });
                    bestFitData = this.model._getBestFitPolynomial({
                        "points": points,
                        "isIntermediateCall": false,
                        "parentEquation": equationData
                    });
                    bestFitEquationData = this._createBestFitEquationData(bestFitData, equationData);
                    equationBestFit.polynomial = {
                        "selected": true,
                        "equationData": bestFitEquationData
                    };
                    tableView.trigger('draw-best-fit-chart', 'polynomial', false, equationData.getCid());
                    this._addBestFitEquationList({
                        "tableList": $tableList,
                        "equationData": bestFitEquationData,
                        "tableColEquationDataCid": equationData.getCid(),
                        "bestFitType": "polynomial"
                    });
                }
                equationData.setBestFit(equationBestFit);
            }
            this._bestFitAlertDisplayed = false;
        },
        "_getPlotColumn": function(equationData) {
            var $cell = null,
                colNo = null,
                tableView = null,
                plotColumnHidden = null,
                $list = null;
            $cell = this.$("[data-equation-cid='" + equationData.getCid() + "']");
            if ($cell.length > 1) {
                $cell = $($cell[1]);
            }
            colNo = $cell.attr('data-column').replace('col', '');
            $list = $cell.parents('.list');
            tableView = this._getTableViewObject($list);
            plotColumnHidden = tableView._getPlotColumnArrayFromCid();
            return plotColumnHidden.indexOf(colNo) === -1;
        },
        "_createBestFitEquationData": function(bestFitData, equationData, showTable) {
            var bestFitEquationData = new MathUtilities.Components.EquationEngine.Models.EquationData(),
                _equationDataManager = this.model.get('_equationDataManager'),
                plotColumn = this._getPlotColumn(equationData);

            if (typeof bestFitData === 'undefined' || bestFitData === null) {
                return void 0;
            }
            bestFitEquationData.setThickness(3, true);
            if (typeof showTable !== 'undefined') {
                showTable = showTable && plotColumn;
                bestFitEquationData.setVisible(showTable);
            } else {
                bestFitEquationData.setVisible(true);
            }
            bestFitEquationData.setColor(equationData.getColor(), true);
            bestFitEquationData.setDisplayEquation(bestFitData.displayString);
            bestFitEquationData.setParentEquation(equationData);
            bestFitEquationData.setEquationDataType('bestFit');
            bestFitEquationData.off('plotComplete').on('plotComplete', _.bind(this.updatePaperItems, this, false, 'best-fit'));
            bestFitEquationData.setLatex(bestFitData.orgSolution, true);
            bestFitEquationData.setSolutionLatex(bestFitData.solutionString);
            if (bestFitData.constants && bestFitData.functionCode) {
                bestFitEquationData.setBlind(true);
                bestFitEquationData.setFunctionVariable("y");
                bestFitEquationData.setConstants(bestFitData.constants);
                bestFitEquationData.setFunctionCode(bestFitData.functionCode);
                bestFitEquationData.setSpecie('plot');
                equationData.setConstants(bestFitData.constants);
                _equationDataManager.addPlotEquation(bestFitEquationData);
                bestFitEquationData.trigger('change-equation');
            } else {
                bestFitEquationData.setConstants(bestFitData.constants);
                bestFitEquationData.setFunctionCode(bestFitData.functionCode);
                equationData.setConstants(bestFitData.constants);
                MathUtilities.Components.EquationEngine.Models.Parser.parseEquationToGetTokens(bestFitEquationData);
                _equationDataManager.parseEquation(bestFitEquationData);
            }

            return bestFitEquationData;
        },
        "bestFitPointsCalculated": function(bestFitEquationData, currentType, chartSubtype, arr) {
            var loopVar1,
                loopVar2 = 0,
                point = [],
                points = [],
                currentCid,
                $list,
                tableView,
                color;
            if (arr) {
                for (loopVar1 = 0; loopVar1 < arr.length; loopVar1 = loopVar1 + 2) {
                    point = [arr[loopVar1], arr[loopVar1 + 1]];
                    points[loopVar2] = point;
                    loopVar2++;
                }
            }
            currentCid = bestFitEquationData.getParentEquation().getCid();
            color = bestFitEquationData.getColor();
            $list = this.$('.cell[data-equation-cid=' + currentCid + ']').parents('.list');
            tableView = this._getTableViewObject($list);
            tableView.trigger('set-bestfit-chart', points, currentCid, currentType, chartSubtype, color);
        },
        "_drawBestFitLine": function(event) {
            var equationData,
                $target = $(event.target).hasClass('acc-read-elem') ? $(event.target).parent() : $(event.target),
                $accCurrentTarget = event.isCustomTriggered ? $(event.residualTarget) : $(event.currentTarget),
                $targetContainer,
                tableView,
                currentType,
                chartSubtype,
                points,
                bestFitEquationData,
                displayEquation = '',
                currentTypeClass,
                bestFitType, showTable,
                currentBestFitObject,
                undoData = {},
                notPlottedOnGraph = false,
                isSelected, plotData,
                currentTarget, degree,
                equationBestFit,
                equationPathGroup,
                residualClass,
                $residualElementContainer,
                reqTarget,
                cid = this.$('.graphing-tool-editor-color-style-box-table').attr('data-target-equation-data-cid'),
                $list = this.$('.cell[data-equation-cid=' + cid + ']').parents('.list'),
                colNo, messageArray,
                bestFitData, residualColumnStates,
                redoData = {};
            equationData = this._getEquationDataUsingCid(cid);
            currentTarget = $(event.currentTarget);
            tableView = this._getTableViewObject($list);
            colNo = tableView._getColumnNo(cid);
            residualColumnStates = tableView.model.get('residualColumnStates')[cid];
            showTable = tableView.model.get('showTable');
            // check if selected
            if ($target.hasClass('graphing-tool-editor-best-fit-style-container')) {
                $targetContainer = $target;
            } else {
                $targetContainer = $target.parents('.graphing-tool-editor-best-fit-style-container');
            }
            reqTarget = $targetContainer.find('.graphing-tool-editor-graph-styles');
            isSelected = reqTarget.attr('class').indexOf('selected');
            if (equationData.getBestFit() === null) {
                equationData.setBestFit({});
            }
            if ($targetContainer.hasClass('container-4')) {
                bestFitType = 'polynomial';
            } else if ($targetContainer.hasClass('container-1')) {
                bestFitType = 'line';
            } else if ($targetContainer.hasClass('container-2')) {
                degree = Number(currentTarget.attr('data-degree'));
                bestFitType = 'curve';
            } else if ($targetContainer.hasClass('container-3')) {
                bestFitType = 'exp';
            }
            if (bestFitType === 'curve') {
                currentType = bestFitType;
                chartSubtype = degree;
            } else {
                currentType = bestFitType;
            }
            $residualElementContainer = this.$('.graphing-tool-editor-residual-style-container.' + bestFitType + ' .graphing-tool-editor-graph-styles');
            residualClass = $residualElementContainer.attr('class');
            currentTypeClass = reqTarget.attr('class');
            equationBestFit = equationData.getBestFit();
            if (isSelected !== -1) {
                currentTypeClass = currentTypeClass.replace('-selected', '');
                reqTarget.attr('class', currentTypeClass);
                messageArray = [this.accManagerView.getAccMessage('unselected-text', 0), this.accManagerView.getAccMessage('table-equation-panel-messages', 5)];
                this.accManagerView.changeAccMessage($targetContainer.attr('id'), 0, messageArray);
                tableView.trigger('set-best-fit-deselected', currentType, chartSubtype, cid, '', colNo);
                if (bestFitType !== 'curve') {
                    currentBestFitObject = equationBestFit[bestFitType];
                } else {
                    currentBestFitObject = equationBestFit[bestFitType][degree];
                }
                if (currentBestFitObject) {
                    currentBestFitObject.selected = false;
                }
                if (bestFitType !== 'curve' && residualColumnStates && residualColumnStates[bestFitType] && residualColumnStates[bestFitType].selected) {
                    this._removeResidualColumns(cid, bestFitType, tableView);
                    residualColumnStates[bestFitType].selected = false;
                    residualClass = residualClass.replace('-selected', '');
                    $residualElementContainer.attr('class', residualClass);
                    undoData.residualType = bestFitType;
                    redoData.residualType = bestFitType;
                    undoData.residualColumnState = tableView.model.get('residualColumnStates');
                    redoData.residualColumnState = tableView.model.get('residualColumnStates');
                }
                if (currentBestFitObject.equationData) {
                    equationPathGroup = currentBestFitObject.equationData.getPathGroup();
                }
                if (equationPathGroup && equationPathGroup !== null) {
                    equationPathGroup.visible = false;
                    currentBestFitObject.equationData.setVisible(false);
                    currentBestFitObject.selected = false;
                    displayEquation = '';
                    undoData.actionType = 'addBestFitLine';
                    undoData.bestFitType = bestFitType;
                    undoData.equationData = equationData;
                    redoData.actionType = 'removeBestFitLine';
                    redoData.bestFitType = bestFitType;
                    redoData.equationData = equationData;
                    if (bestFitType === 'curve') {
                        undoData.degree = degree;
                        redoData.degree = degree;
                    }
                    this.execute('bestFitLine', {
                        "undo": undoData,
                        "redo": redoData
                    });
                }
                this._removeBestFitEquationList(currentBestFitObject.equationData);
            } else {
                plotData = equationData.getPlot();
                points = this._removeInvalidPoints(plotData.getPoints());
                switch (bestFitType) {
                    case 'line':
                        bestFitData = this.model._getBestFitLine(points, false, equationData.getBestFit(), false, $accCurrentTarget.attr('id'));
                        break;
                    case 'curve':
                        bestFitData = this.model._getBestFitCurve(points, degree, false, false, $accCurrentTarget.attr('id'));
                        break;
                    case 'exp':
                        bestFitData = this.model._getBestFitExp(points, false, false, false, $accCurrentTarget.attr('id'));
                        break;
                    case 'polynomial':
                        this._createBestFitCurveObject({
                            "parentEquation": equationData,
                            "points": points
                        });
                        bestFitData = this.model._getBestFitPolynomial({
                            "points": points,
                            "isIntermediateCall": false,
                            "alertProp": false,
                            "focusElementId": $accCurrentTarget.attr('id'),
                            "parentEquation": equationData
                        });
                        break;
                }
                this.on('set-best-fit-option-selected', _.bind(this._selectBestFitOption, this));
                if (bestFitData === void 0 || bestFitData === null) {
                    notPlottedOnGraph = true;
                }
                tableView.trigger('draw-best-fit-chart', currentType, chartSubtype, cid, notPlottedOnGraph, colNo);
                if (bestFitData === void 0 || bestFitData === null) {
                    return void 0;
                }
                displayEquation = bestFitData.displayString;
                currentTypeClass += '-selected';
                reqTarget.attr('class', currentTypeClass);
                currentBestFitObject = equationBestFit.bestFitType;
                if (currentBestFitObject && currentBestFitObject.equationData.getPathGroup() !== null) {
                    if (bestFitType === 'curve') {
                        currentBestFitObject[degree].equationData.getPathGroup().visible = true;
                        currentBestFitObject[degree].equationData.setVisible(true);
                        currentBestFitObject[degree].selected = true;
                    } else {
                        currentBestFitObject.equationData.getPathGroup().visible = true;
                        currentBestFitObject.equationData.setVisible(true);
                        currentBestFitObject.selected = true;
                        currentBestFitObject.equationData.setDisplayEquation(bestFitData.displayString);
                    }
                } else {
                    bestFitEquationData = this._createBestFitEquationData(bestFitData, equationData, showTable);
                    displayEquation = bestFitData.displayString;
                    if (typeof equationBestFit[bestFitType] === 'undefined') {
                        equationBestFit[bestFitType] = {};
                    }
                    if (bestFitType === 'curve') {
                        equationBestFit[bestFitType][degree] = {
                            "selected": true,
                            "equationData": bestFitEquationData
                        };
                    } else {
                        equationBestFit[bestFitType] = {
                            "selected": true,
                            "equationData": bestFitEquationData
                        };
                    }
                }
                undoData.actionType = 'removeBestFitLine';
                undoData.bestFitType = bestFitType;
                undoData.equationData = equationData;
                redoData.actionType = 'addBestFitLine';
                redoData.bestFitType = bestFitType;
                redoData.equationData = equationData;
                if (bestFitType === 'curve') {
                    undoData.degree = degree;
                    redoData.degree = degree;
                }
                if (!event.isCustomTriggered) {
                    this.execute('bestFitLine', {
                        "undo": undoData,
                        "redo": redoData
                    });
                }
                this._addBestFitEquationList({
                    "tableList": $list,
                    "equationData": bestFitEquationData,
                    "tableColEquationDataCid": equationData.getCid(),
                    "bestFitType": bestFitType,
                    "degree": degree,
                    "drawChart": false
                });
                messageArray = [this.accManagerView.getAccMessage('selected-text', 0), bestFitEquationData.getAccText(),
                    this.accManagerView.getAccMessage('table-equation-panel-messages', 6)
                ];
                this.accManagerView.changeAccMessage($targetContainer.attr('id'), 1, messageArray);
            }
            this.accManagerView.updateFocusRect($list.attr('id'));
            if (this.$('#list-data-container-of-' + $list.attr('id')).find('.acc-read-elem').length !== 0) {
                this.accManagerView.updateFocusRect('list-data-container-of-' + $list.attr('id'));
            }
            this.accManagerView.setFocus('dummy-focus-container');
            this.accManagerView.setFocus($targetContainer.attr('id'));
            $targetContainer.find('.graphing-tool-editor-best-fit-line-display-equation').html(displayEquation);
            this.accManagerView.updateFocusRect($targetContainer.attr('id'));
            this._graphingToolView._gridGraphView.refreshView();
        },

        "_createBestFitCurveObject": function(columnData) {
            var bestFitEquationData,
                degree = 2,
                equationBestFit = columnData.parentEquation.getBestFit(),
                currentDegreeObj,
                bestFitData,
                selected = false,
                points = columnData.points,
                bestFitType = 'curve',
                MAX_DEGREE = 7;

            if (!equationBestFit) {
                equationBestFit = {};
                columnData.parentEquation.setBestFit(equationBestFit);
            }
            if (equationBestFit[bestFitType] === void 0) {
                equationBestFit[bestFitType] = {};
            }
            for (; degree <= MAX_DEGREE; degree++) {
                currentDegreeObj = equationBestFit[bestFitType][degree];
                bestFitData = this.model._getBestFitCurve(points, degree, false, false);
                if (currentDegreeObj && !$.isEmptyObject(currentDegreeObj) && currentDegreeObj.equationData) {
                    //update best fit equation
                    bestFitEquationData = currentDegreeObj.equationData;
                    selected = currentDegreeObj.selected;
                    bestFitEquationData = this.updateBestFitEquationData(bestFitEquationData, bestFitData, columnData.parentEquation, selected);
                } else {
                    selected = false;
                    bestFitEquationData = this._createBestFitEquationData(bestFitData, columnData.parentEquation, false);
                }
                if (bestFitEquationData) {
                    equationBestFit[bestFitType][degree] = {
                        "selected": selected,
                        "equationData": bestFitEquationData
                    };
                }
            }
        },

        "updateBestFitEquationData": function(bestFitEquationData, bestFitData, parentEquation, isTableShown) {
            bestFitEquationData.setLatex(bestFitData.orgSolution, true);
            bestFitEquationData.setSolutionLatex(bestFitData.solutionString);
            bestFitEquationData.setFunctionCode(bestFitData.functionCode);
            bestFitEquationData.setConstants(bestFitData.constants);
            parentEquation.setConstants(bestFitData.constants);
            this.model.get('_equationDataManager').addPlotEquation(bestFitEquationData);
            if (isTableShown) {
                bestFitEquationData.trigger('change-equation');
            }
            bestFitEquationData.setDisplayEquation(bestFitData.displayString);
            return bestFitEquationData;
        },

        "_addBestFitEquationList": function(options) {
            if (options.equationData === void 0) {
                return void 0;
            }
            var $tableList = options.tableList,
                equationData = options.equationData,
                tableColEquationDataCid = options.tableColEquationDataCid,
                bestFitType = options.bestFitType,
                degree = options.degree,
                drawChart = options.drawChart,
                residualData = options.residualData,
                listIndex = options.listIndex,
                $list = this._createListWithEditor(),
                latex, residualColumnStates,
                $editableElem = $list.find('.mathquill-editable-size'),
                tableView = this._getTableViewObject($tableList);
            if (tableView.model.get('residualColumnStates')) {
                residualColumnStates = tableView.model.get('residualColumnStates')[tableColEquationDataCid];
            }
            drawChart = drawChart === void 0 || drawChart;
            equationData.off('best-fit-equation-data-removed')
                .on('best-fit-equation-data-removed', _.bind(this._removeBestFitEquationList, this))
                .off('best-fit-equation-data-added')
                .on('best-fit-equation-data-added', _.bind(this._bestFitEquationDataAdded, this))
                .off('best-fit-equation-color-change')
                .on('best-fit-equation-color-change', _.bind(this._setGraphStyleLineClass, this))
                .off('best-fit-equation-data-changed')
                .on('best-fit-equation-data-changed', _.bind(this._bestFitEquationDataUpdated, this));
            this.model.get('_equationDataManager').addEquation(equationData, false);
            $list.attr('data-equation-cid', equationData.getCid());
            $list.find('.mathquill-editable').addClass('equation-editor');
            latex = equationData.getSolutionLatex();
            if (listIndex !== void 0) {
                $list.insertAfter($(this.$('.list').get(listIndex - 2)));
            } else {
                $list.insertAfter($tableList);
            }
            this._createAccDivForList($list, false);
            $editableElem.mathquill('latex', latex);
            $list.addClass('disabled').attr({
                "table-col-equationdata-cid": tableColEquationDataCid,
                "bestFitType": bestFitType,
                "data-table-id": $tableList.attr('data-equation-cid')
            });
            this._toggleList($list, $tableList);
            // Make equation box non editable
            this._makeEquationBoxNonEditable($list);
            // Set list header description
            latex = this._createBestFitListHeader(tableView, bestFitType, degree);
            $list.find('.list-header-description').mathquill('editable').mathquill('revert').mathquill().mathquill('latex', latex);
            // Add disable dependencies

            if (degree) {
                $list.attr('degree', degree);
            }
            $list.find('.list-options-container .change-graph-style').removeClass('visible');
            this._updateWarning($list);
            this._updateHandles();
            this._updateListWidth($tableList.find('.equation-box').outerWidth());
            if (drawChart) {
                tableView.trigger('draw-best-fit-chart', bestFitType, degree, tableColEquationDataCid);
            }
            if (residualData && residualColumnStates && residualColumnStates[residualData.bestFitType]) {
                residualColumnStates[residualData.bestFitType].selected = true;
                equationData = options.isUndoRedoAction ? options.residualData.residualEquationData : this._getEquationDataUsingCid(tableColEquationDataCid);
                this._updateResidualColumns({
                    "equationData": equationData,
                    "tableView": tableView,
                    "undoResiduals": [residualData.bestFitType],
                    "isUndoRedoAction": options.isUndoRedoAction,
                    "points": options.residualData.points
                });
            }
            return $list;
        },
        "_bestFitEquationDataAdded": function(bestFitEquationListData) {
            var tableColEquationData = bestFitEquationListData.tableColEquationData,
                equationData = bestFitEquationListData.equationData,
                bestFitType = bestFitEquationListData.bestFitType,
                degree = bestFitEquationListData.degree,
                $tableList = bestFitEquationListData.tableList;
            if ($tableList) {
                $tableList = this.$("[data-equation-cid='" + tableColEquationData.cid + "']").parents('.list');
            }
            this._addBestFitEquationList({
                "tableList": $tableList,
                "equationData": equationData,
                "tableColEquationDataCid": tableColEquationData.cid,
                "bestFitType": bestFitType,
                "degree": degree
            });
        },
        "_bestFitEquationDataUpdated": function(bestFitEquationListData) {
            var tableColEquationData = bestFitEquationListData.tableColEquationData,
                equationData = bestFitEquationListData.equationData,
                $targetList = this.$("[data-equation-cid='" + equationData.cid + "']"),
                $tableList = bestFitEquationListData.tableList;
            if (!$tableList) {
                $tableList = this.$("[data-equation-cid='" + tableColEquationData.cid + "']").parents('.list');
                bestFitEquationListData.tableList = $tableList;
            }
            if ($targetList.length === 0) {
                this._bestFitEquationDataAdded(bestFitEquationListData);
            } else {
                $targetList.find('.mathquill-editable-size').mathquill('latex', equationData.getSolutionLatex());
            }
        },
        "_createBestFitListHeader": function(tableView, bestFitType, degree) {
            var tableName = 'Table  ';
            tableName += tableView.tableCounter;
            tableName += ': ';
            tableName += this._getBestFitEquationName(bestFitType, degree);
            tableName = '\\text{' + tableName + '}';
            return tableName;
        },
        "_getBestFitEquationName": function(bestFitType, degree) {
            var bestFitEquationName = bestFitType;
            if (bestFitType === 'curve' && degree) {
                degree = parseInt(degree, 10);
                switch (degree) {
                    case 2:
                        bestFitEquationName = 'Quadratic';
                        break;
                    case 3:
                        bestFitEquationName = 'Cubic';
                        break;
                    case 4:
                        bestFitEquationName = 'Quartic';
                        break;
                    case 5:
                        bestFitEquationName = 'Quintic';
                        break;
                    case 6:
                        bestFitEquationName = 'Sextic';
                        break;
                    case 7:
                        bestFitEquationName = 'Septic';
                        break;
                }
            } else if (bestFitType === 'line') {
                bestFitEquationName = 'Line';
            } else if (bestFitType === 'polynomial') {
                bestFitEquationName = 'Polynomial';
            } else if (bestFitType === 'exp') {
                bestFitEquationName = 'Exponential';
            }
            bestFitEquationName += " Best Fit";
            return bestFitEquationName;
        },
        "_makeBestFitEquationEditable": function(event, $list, registerUndoRedo) {
            var $target,
                equationData,
                tableColEquationDataCid,
                bestFitType,
                degree,
                residualData = {},
                undoData = {},
                dummyEvent,
                redoData = {},
                colNo;
            if (event) {
                $target = $(event.target);
            }
            if (!$list) {
                $list = $target.parents('.list');
            }
            if (registerUndoRedo === void 0) {
                registerUndoRedo = true;
            }
            equationData = this._getEquationDataUsingCid($list.attr('data-equation-cid'));
            tableColEquationDataCid = $list.attr('table-col-equationdata-cid');
            bestFitType = $list.attr('bestFitType');
            degree = $list.attr('degree');
            colNo = this.addResidualAsColumn(tableColEquationDataCid, bestFitType, $list, residualData);
            if (colNo.length === 0) {
                this._removeBestFitEquationData($list, residualData);
            }
            // Remove disable dependancies
            $list.removeClass('disabled')
                .removeAttr('table-col-equationdata-cid', 'bestFitType', 'degree')
                .find('.list-options-container .change-graph-style').addClass('visible');
            // Expand the list if it is collapsed
            if (this._isListCollapsed($list)) {
                this._toggleList($list);
            }
            // Make equation box editable
            this._makeEquationBoxEditable($list);
            equationData.setVisible(true);
            equationData.setBlind(false);
            this._parseAndPlotEquationData(equationData);
            if (registerUndoRedo) {
                undoData.actionType = 'makeListNonEditable';
                undoData.equationData = equationData;
                undoData.tableColEquationDataCid = tableColEquationDataCid;
                undoData.bestFitType = bestFitType;
                undoData.degree = degree;
                undoData.residualData = residualData.bestFitType;
                redoData.actionType = 'makeListEditable';
                redoData.equationData = equationData;
                redoData.tableColEquationDataCid = tableColEquationDataCid;
                redoData.bestFitType = bestFitType;
                redoData.degree = degree;
                redoData.residualData = residualData.bestFitType;
                undoData.addedColumnNo = colNo;
                redoData.addedColumnNo = colNo;
                this.execute('bestFitEquationListEditable', {
                    "undo": undoData,
                    "redo": redoData
                });
            }
            if (this._graphingToolView.isAccDivPresent($list.find('.list-data-container'))) {
                dummyEvent = $.Event("keydown");
                dummyEvent.keyCode = 32; //space key
                dummyEvent.isCustomEvent = true;
                $list.find('.list-data-container').trigger(dummyEvent);
                this._graphingToolView.enableTab('graph-style-edit-options-of-' + $list.attr('id'), true);
            }
            $list = this.$('.cell[data-equation-cid=' + tableColEquationDataCid + ']').parents('.list');
            this.accManagerView.updateFocusRect($list.attr('id'));
            if (this._graphingToolView.isAccDivPresent($list.find('#list-data-container-of-' + $list.attr('id')))) {
                this.accManagerView.updateFocusRect('list-data-container-of-' + $list.attr('id'));
            }
        },
        "_removeBestFitEquationList": function(equationData) {
            if (equationData) {
                var $list = this.$('div[data-equation-cid=' + equationData.getCid() + ']');
                this._removeEquationData($list);
                $list.remove();
                this._updateHandles();
                this._hideTooltip();
            }
        },
        "_updateChartOnBestFitListChanges": function($list) {
            var tableColEquationDataCid = $list.attr('table-col-equationdata-cid'),
                bestFitType = $list.attr('bestFitType'),
                degree = $list.attr('degree'),
                $tableList = this.$("[data-equation-cid='" + tableColEquationDataCid + "']").parents('.list'),
                tableView = this._getTableViewObject($tableList);
            if (bestFitType !== 'curve') {
                degree = null;
            }
            if (tableView) {
                tableView.trigger('set-best-fit-deselected', bestFitType, degree, tableColEquationDataCid);
            }
        },
        "_deSelectBestFitEquationMenuItem": function(tableColEquationData, bestFitType, degree) {
            var $styleParent, $tableList,
                tableView, equationBestFit = tableColEquationData.getBestFit(),
                currentBestFitObject;
            $tableList = this.$("[data-equation-cid='" + tableColEquationData.cid + "']").parents('.list');
            tableView = this._getTableViewObject($tableList);
            tableView.trigger('set-best-fit-deselected', bestFitType, degree, tableColEquationData.getCid());
            $styleParent = this.$('.graphing-tool-editor-color-style-box-table');
            if ($styleParent.attr('data-target-equation-data-cid') === tableColEquationData.cid) {
                this._updateStyleForCell($styleParent, tableColEquationData);
            }
            if (bestFitType !== 'curve') {
                currentBestFitObject = equationBestFit[bestFitType];
            } else {
                currentBestFitObject = equationBestFit[bestFitType][degree];
            }
            if (currentBestFitObject) {
                currentBestFitObject.selected = false;
            }
            this._graphingToolView._gridGraphView.refreshView();
        },
        "_selectBestFitEquationMenuItem": function($tableList, equationData, tableColEquationDataCid, bestFitType, degree) {
            var tableColEquationData = this._getEquationDataUsingCid(tableColEquationDataCid),
                currentBestFitObject = tableColEquationData.getBestFit()[bestFitType],
                $bestFitIcon = this.$('.graphing-tool-editor-best-fit-style-container[data-degree=' + degree + ']');
            $bestFitIcon = $bestFitIcon.find('.graphing-tool-editor-graph-styles');
            if ($.isEmptyObject(currentBestFitObject) || degree && $.isEmptyObject(currentBestFitObject[degree])) {
                if (bestFitType === 'curve') {
                    tableColEquationData.getBestFit()[bestFitType][degree] = {
                        "selected": true,
                        "equationData": equationData
                    };
                    this._setSelectedBestFit($bestFitIcon, $bestFitIcon.parent().children().eq(2), equationData);
                } else {
                    tableColEquationData.getBestFit()[bestFitType] = {
                        "selected": true,
                        "equationData": equationData
                    };
                }
            }
        },
        "_removeBestFitEquationData": function($list, residualData) {
            var bestFitType = $list.attr('bestFitType'),
                degree = $list.attr('degree'),
                residualColumnStates,
                currResidual,
                tableView,
                tableColEquationData = this._getEquationDataUsingCid($list.attr('table-col-equationdata-cid')),
                cid = tableColEquationData.getCid();
            if (bestFitType === 'curve') {
                tableColEquationData.getBestFit()[bestFitType][degree] = {};
            } else {
                tableColEquationData.getBestFit()[bestFitType] = {};
            }
            tableView = this._getTableViewObject(this.$('.cell[data-equation-cid=' + cid + ']').parents('.list'));
            residualColumnStates = tableView.model.get('residualColumnStates');
            if (residualColumnStates[cid]) {
                currResidual = residualColumnStates[cid][bestFitType];
                if (currResidual && currResidual.selected) {
                    residualData.bestFitType = bestFitType;
                    residualData.residualEquationData = currResidual.residualEquationData;
                    residualData.points = currResidual.residualEquationData.getPlot().getPoints();
                    currResidual.selected = false;
                    this._removeResidualColumns(tableColEquationData.getCid(), bestFitType, tableView);
                }
            }
            this._updateChartOnBestFitListChanges($list);
            tableView.model.set("residualColumnStates", residualColumnStates);
        },
        "_makeEquationBoxEditable": function($list) {
            var inputParams = {
                    "holderDiv": $list.find('.equation-box'),
                    "editorCall": true,
                    "enterClick": true,
                    "keyboardObject": this.model.get('keyboardView'),
                    "enterClickFunction": true
                },
                $editableElem = $list.find('.list-data-container .mathquill-rendered-math'),
                latex = $editableElem.mathquill('latex');
            $list.find('.outerDiv').remove();
            inputParams.holderDiv = $list.find('.equation-box');
            this.model.set('keyboardView', MathUtilities.Components.MathEditor.Keyboard.Instance);
            MathUtilities.Components.MathEditor.Models.Application.init(inputParams);
            $list.find('.mathquill-editable').addClass('equation-editor')
                .mathquill('latex', latex);
            $list.find('textarea').on('focus', _.bind(this._onListTextAreaFocus, this))
                .on('blur', _.bind(function(event) {
                    $list = $(event.target).parents('.list');
                    this._lastBlurList = $list;
                }, this));
            $list.attr('data-prev-latex', '');
            $list.find('#editor-1').on('mousedown', _.bind(this._graphingToolView._hideHandler, this._graphingToolView))
                .addClass('equation-editor');
        },
        "_makeEquationBoxNonEditable": function($list) {
            var $editableElem = $list.find('.list-data-container .mathquill-rendered-math'),
                latex = $editableElem.mathquill('latex');
            $list.find('textarea').blur();
            $editableElem.mathquill('revert').mathquill().mathquill('latex', latex);
        },
        "_removeResidualColumns": function(cid, residualType, tableView) {
            var counter,
                colNo,
                tableModel = tableView.model,
                dataCol,
                plotEquationData,
                residualColumnCount = tableModel.get('residualColumnCount'),
                residualColumnStates = tableModel.get('residualColumnStates'),
                columnColors = tableModel.get('columnColors'),
                cols = $(tableView.$el).find('.cell[data-column-name=' + residualType + cid + ']'),
                length = cols.length;

            if (length === 0) {
                return void 0;
            }
            for (counter = 0; counter < length; counter++) {
                dataCol = cols.eq(counter).attr('data-column');
                colNo = dataCol.split('col')[1];
                tableView.deleteCol(colNo);
                columnColors.splice(colNo - 1, 1);
                residualColumnCount--;
            }
            tableModel.set('residualColumnCount', residualColumnCount);
            tableModel.set('columnColors', columnColors);
            this._removePlots(residualColumnStates[cid][residualType].residualEquationData);
            this._removePlots(residualColumnStates[cid][residualType].residualColEquationData);
            residualColumnStates[cid]["residualColumnCount"] -= 2; // Number of columns added on residual select is 2
            this._updateHideIconsForResidualColumn(colNo, tableView, true);
            tableModel.set('residualColumnStates', residualColumnStates);
        },
        "_addResidualColumn": function(event) {
            var $target = $(event.target),
                $targetContainer,
                reqTarget, points,
                isSelected,
                undoData = {},
                redoData = {},
                graphingModel = this.model,
                bestFitData,
                residualType, plotData,
                $toolHolder = $('#tool-holder-4').find('#best-fit-not-selected .param-container'),
                equationBestFit,
                currentBestFitObject,
                displayName,
                bestFitType,
                residualColEquationData,
                cid = this.$('.graphing-tool-editor-color-style-box-table').attr('data-target-equation-data-cid'),
                $list = this.$('.cell[data-equation-cid=' + cid + ']').parents('.list'),
                tableView = this._getTableViewObject($list),
                residualColumnState,
                residualColumnCount,
                colNo = tableView._getColumnNo(cid),
                equationData = this._getEquationDataUsingCid(cid),
                residualEquationData,
                currentTypeClass;
            if ($target.hasClass('graphing-tool-editor-residual-style-container')) {
                $targetContainer = $target;
            } else {
                $targetContainer = $target.parents('.graphing-tool-editor-residual-style-container');
            }
            reqTarget = $targetContainer.find('.graphing-tool-editor-graph-styles');
            isSelected = reqTarget.attr('class').indexOf('selected');
            if ($targetContainer.hasClass('container-4')) {
                residualType = 'polynomial';
                displayName = residualType;
            } else if ($targetContainer.hasClass('container-1')) {
                residualType = 'line';
                displayName = residualType;
            } else if ($targetContainer.hasClass('container-3')) {
                residualType = 'exp';
                displayName = 'exponential curve';
            }
            currentTypeClass = reqTarget.attr('class');
            equationBestFit = equationData.getBestFit();
            if (equationBestFit) {
                currentBestFitObject = equationBestFit[residualType];
            }
            if (isSelected !== -1) {
                currentTypeClass = currentTypeClass.replace('-selected', '');
                reqTarget.attr('class', currentTypeClass);
                this.accManagerView.changeAccMessage($targetContainer.attr('id'), 0, [this.accManagerView.getAccMessage('unselected-text', 0), this.accManagerView.getAccMessage('table-equation-panel-messages', 5)]);
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setFocus($targetContainer.attr('id'));
                this._removeResidualColumns(cid, residualType, tableView);
                residualColumnState = $.extend(true, {}, tableView.model.get('residualColumnStates'));
                residualColumnState[cid][residualType] = {
                    "selected": false,
                    "residualEquationData": residualColumnState[cid][residualType].residualEquationData,
                    "points": residualColumnState[cid][residualType].residualEquationData.getPlot().getPoints(),
                    "residualColEquationData": residualColumnState[cid][residualType].residualColEquationData
                };
                undoData.actionType = 'addResidualColumn';
                redoData.actionType = 'removeResidualColumn';
                undoData.equationData = equationData;
                redoData.equationData = equationData;
                redoData.tableView = tableView;
                undoData.tableView = tableView;
                undoData.residualType = residualType;
                redoData.residualType = residualType;
                undoData.residualColumnState = residualColumnState;
                redoData.residualColumnState = residualColumnState;
                undoData.targetCid = $list.attr('data-equation-cid');
                redoData.targetCid = $list.attr('data-equation-cid');
                redoData.cid = cid;
            } else {
                if (!currentBestFitObject || currentBestFitObject && !currentBestFitObject.selected) {
                    bestFitType = residualType;
                    if (residualType === "exp") {
                        bestFitType = "exponential";
                    }
                    event.isCustomTriggered = true;
                    event.target = this.$(".graphing-tool-editor-best-fit-" + bestFitType);
                    event.residualTarget = event.currentTarget;
                    event.currentTarget = this.$(".graphing-tool-editor-best-fit-style-container." + bestFitType);
                    this._drawBestFitLine(event);
                    if (this._bestFitAlertDisplayed) {
                        return void 0;
                    }
                    equationBestFit = equationData.getBestFit();
                    if (equationBestFit) {
                        currentBestFitObject = equationBestFit[residualType];
                    }
                }
                if (currentBestFitObject && currentBestFitObject.selected === true) {
                    plotData = equationData.getPlot();
                    points = this._removeInvalidPoints(plotData.getPoints());
                    switch (residualType) {
                        case 'line':
                            bestFitData = graphingModel._getBestFitLine(points, true, equationData.getBestFit());
                            break;
                        case 'exp':
                            bestFitData = graphingModel._getBestFitExp(points, true, void 0, true);
                            break;
                        case 'polynomial':
                            this._createBestFitCurveObject({
                                "parentEquation": equationData,
                                "points": points
                            });
                            bestFitData = graphingModel._getBestFitPolynomial({
                                "points": points,
                                "isIntermediateCall": true,
                                "parentEquation": equationData
                            });
                            break;
                    }
                    if (bestFitData) {
                        this.calculateResidual({
                            "points": points,
                            "colNo": colNo,
                            "tableView": tableView,
                            "bestFitData": bestFitData,
                            "type": residualType,
                            "cid": cid
                        });
                    } else {
                        $toolHolder.html(this.accManagerView.getMessage('bootstrap-popup-text-dummy', 21, [displayName]));
                        this._showBestFitAlert('best-fit-not-selected', $(event.currentTarget).attr('id'), true, true);
                        this.accManagerView.setAccMessage($toolHolder.attr('id'),
                            this.accManagerView.getMessage('bootstrap-popup-text-dummy', 21, [displayName]));
                        return void 0;
                        //can not plot best fit cause of insufficient point and hence cant display residual data
                    }
                    currentTypeClass += '-selected';
                    reqTarget.attr('class', currentTypeClass);
                    this.accManagerView.changeAccMessage($targetContainer.attr('id'), 0, [this.accManagerView.getAccMessage('selected-text', 0), this.accManagerView.getAccMessage('table-equation-panel-messages', 6)]);
                    this.accManagerView.setFocus('dummy-focus-container');
                    this.accManagerView.setFocus($targetContainer.attr('id'));
                    residualColumnState = $.extend(true, {}, tableView.model.get('residualColumnStates'));
                    if (residualColumnState[cid]) {
                        residualColumnState = tableView.model.get('residualColumnStates');
                        residualColumnCount = residualColumnState[cid]["residualColumnCount"];
                    } else {
                        residualColumnState[cid] = {};
                        residualColumnCount = 2;
                    }
                    residualEquationData = this._getEquationDataUsingCid(tableView._getColumnCid(Number(colNo) + residualColumnCount - 1));
                    residualColEquationData = this._getEquationDataUsingCid(tableView._getColumnCid(Number(colNo) + residualColumnCount));
                    residualColumnState[cid]["residualColumnCount"] = residualColumnCount;
                    residualColumnState[cid][residualType] = {
                        "selected": true,
                        "residualEquationData": residualEquationData,
                        "points": residualEquationData.getPlot().getPoints(),
                        "residualColEquationData": residualColEquationData
                    };
                    redoData.actionType = 'addResidualColumn';
                    undoData.actionType = 'removeResidualColumn';
                    undoData.tableView = tableView;
                    redoData.tableView = tableView;
                    undoData.targetCid = $list.attr('data-equation-cid');
                    redoData.targetCid = $list.attr('data-equation-cid');
                    undoData.cid = cid;
                    redoData.cid = cid;
                    undoData.equationData = equationData;
                    redoData.equationData = equationData;
                    undoData.residualType = residualType;
                    redoData.residualType = residualType;
                    undoData.residualColumnState = residualColumnState;
                    redoData.residualColumnState = residualColumnState;
                }
            }
            tableView.model.set('residualColumnStates', residualColumnState);
            if (tableView.model.get('plotColumnHidden').indexOf(cid) > -1) {
                this._hideResidualPlot(cid, tableView, false);
            }
            if (event.isCustomTriggered) {
                undoData.bestFitType = redoData.bestFitType = residualType;
                redoData.actionType = 'addBestFitLine';
                undoData.actionType = 'removeBestFitLine';
                this.execute('bestFitAndResidualColumn', {
                    "undo": undoData,
                    "redo": redoData
                });
            } else {
                this.execute('residualColumn', {
                    "undo": undoData,
                    "redo": redoData
                });
            }
            this._updateListWidth($list.find('.equation-box').outerWidth());
        },
        "_selectBestFitOption": function(tableView, cid, type, subType) {
            var symbolOptionClass,
                tableCid = tableView.cid,
                reqTarget,
                equationData = this._getEquationDataUsingCid(cid),
                bestFitClass, optionContainer,
                $list = this.$('.list[data-table-view-cid=' + tableCid + ']'),
                isSelected,
                equationBestFit = equationData.getBestFit();
            if (subType) {
                bestFitClass = type + '-' + subType;
            }
            if (['exp', 'polynomial', 'line'].indexOf(type) > -1) {
                bestFitClass = type;
            }
            optionContainer = this.$('.graphing-tool-editor-best-fit-style-container.' + bestFitClass);
            reqTarget = $(optionContainer.find('.graphing-tool-editor-graph-styles'));
            symbolOptionClass = reqTarget.attr('class');
            isSelected = symbolOptionClass.indexOf('selected');
            if (isSelected === -1) {
                symbolOptionClass += '-selected';
                reqTarget.attr('class', symbolOptionClass);
                if (!equationBestFit[type]) {
                    equationBestFit[type] = {};
                }
                if (type === 'curve') {
                    if (equationBestFit[type][subType]) {
                        equationBestFit[type][subType].selected = true;
                    } else {
                        equationBestFit[type][subType] = {
                            "selected": true
                        };
                    }
                } else {
                    if (equationBestFit[type]) {
                        equationBestFit[type].selected = true;
                    } else {
                        equationBestFit[type] = {
                            "selected": true
                        };
                    }
                }
            }
        },

        "handleBestFitAndResiduals": function(undoRedoData) {
            var currentBestFitObject,
                points,
                _equationDataManager = this.model.get('_equationDataManager'),
                bestFitEquationData,
                residualColumnStates,
                bestFitData,
                $styleParent,
                equationData = undoRedoData.equationData,
                plotObj = equationData.getPlot(),
                $list = this.$('.cell[data-equation-cid="' + equationData.getCid() + '"]').parents('.list'),
                tableView = this._getTableViewObject($list),
                $bestFitIcon = this.$('.graphing-tool-editor-best-fit-style-container[data-degree=' + undoRedoData.degree + '] .graphing-tool-editor-graph-styles');
            if (undoRedoData.actionType === 'addBestFitLine') {
                currentBestFitObject = equationData.getBestFit()[undoRedoData.bestFitType];
                if (currentBestFitObject) {
                    if (undoRedoData.bestFitType === 'curve') {
                        currentBestFitObject = currentBestFitObject[undoRedoData.degree];
                        this._setSelectedBestFit($bestFitIcon, $bestFitIcon.find('.graphing-tool-editor-best-fit-line-display-equation'), currentBestFitObject.equationData, currentBestFitObject);
                    }
                    if (currentBestFitObject.equationData.getPathGroup()) {
                        currentBestFitObject.equationData.showGraph();
                    } else {
                        if (this._getPlotColumn(equationData)) {
                            currentBestFitObject.equationData.setCurveVisibility(true);
                        }
                        _equationDataManager.addPlotEquation(currentBestFitObject.equationData);
                        currentBestFitObject.equationData.trigger("change-equation");
                    }
                    currentBestFitObject.equationData.setColor(equationData.getColor());
                    currentBestFitObject.selected = true;
                    this._addBestFitEquationList({
                        "tableList": $list,
                        "equationData": currentBestFitObject.equationData,
                        "tableColEquationDataCid": equationData.getCid(),
                        "bestFitType": undoRedoData.bestFitType,
                        "degree": undoRedoData.degree,
                        "drawChart": false
                    });
                } else {
                    points = this._removeInvalidPoints(plotObj.getPoints());
                    if (undoRedoData.bestFitType === 'line') {
                        bestFitData = this.model._getBestFitLine(points, true);
                    } else {
                        if (undoRedoData.bestFitType === 'curve') {
                            bestFitData = this.model._getBestFitCurve(points, undoRedoData.degree, true);
                        } else {
                            if (undoRedoData.bestFitType === 'exp') {
                                bestFitData = this.model._getBestFitExp(points, true);
                            } else {
                                this._createBestFitCurveObject({
                                    "parentEquation": equationData,
                                    "points": points
                                });
                                bestFitData = this.model.model._getBestFitPolynomial({
                                    "points": points,
                                    "isIntermediateCall": true,
                                    "parentEquation": equationData
                                });
                            }
                        }
                    }
                    if (bestFitData.solutionString) {
                        bestFitEquationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
                        bestFitEquationData.setThickness(3); // default thickness
                        bestFitEquationData.setVisible(true);
                        bestFitEquationData.setColor(equationData.getColor());
                        bestFitEquationData = this.updateBestFitEquationData(bestFitEquationData, bestFitData, equationData, true);
                        if (equationData.getBestFit().bestFitType === void 0) {
                            equationData.getBestFit()[undoRedoData.bestFitType] = {};
                        }
                        if (undoRedoData.bestFitType === 'curve') {
                            equationData.getBestFit()[undoRedoData.bestFitType][undoRedoData.degree] = {
                                "selected": true,
                                "equationData": bestFitEquationData
                            };
                            this._setSelectedBestFit($bestFitIcon, $bestFitIcon.parent().children().eq(2), bestFitEquationData); //access second child
                        } else {
                            equationData.getBestFit()[undoRedoData.bestFitType] = {
                                "selected": true,
                                "equationData": bestFitEquationData
                            };
                        }
                    }
                }
                tableView.trigger('draw-best-fit-chart', undoRedoData.bestFitType, undoRedoData.degree, equationData.getCid(), equationData);
                if (undoRedoData.residualType) {
                    residualColumnStates = undoRedoData.residualColumnState[equationData.getCid()];
                    tableView.model.set('residualColumnStates', undoRedoData.residualColumnState);
                    residualColumnStates[undoRedoData.residualType].selected = true;
                    this._updateResidualColumns({
                        "equationData": residualColumnStates[undoRedoData.residualType].residualEquationData,
                        "tableView": tableView,
                        "undoResiduals": [undoRedoData.residualType],
                        "isUndoRedoAction": true,
                        "points": residualColumnStates[undoRedoData.residualType].points
                    });
                }
            } else {
                currentBestFitObject = equationData.getBestFit()[undoRedoData.bestFitType];
                if (undoRedoData.bestFitType === 'curve') {
                    bestFitEquationData = currentBestFitObject[undoRedoData.degree].equationData;
                    if (bestFitEquationData.getPathGroup()) {
                        bestFitEquationData.getPathGroup().visible = false;
                        bestFitEquationData.setVisible(false);
                    }
                    currentBestFitObject[undoRedoData.degree].selected = false;
                } else {
                    bestFitEquationData = currentBestFitObject.equationData;
                    if (bestFitEquationData.getPathGroup()) {
                        bestFitEquationData.getPathGroup().visible = false;
                        bestFitEquationData.setVisible(false);
                    }
                    currentBestFitObject.selected = false;
                }
                if (undoRedoData.residualType) {
                    tableView.model.set('residualColumnStates', undoRedoData.residualColumnState);
                    residualColumnStates = tableView.model.get('residualColumnStates')[equationData.getCid()];
                    residualColumnStates[undoRedoData.residualType].selected = false;
                    this._removeResidualColumns(equationData.getCid(), undoRedoData.residualType, tableView);
                }
                tableView.trigger('set-best-fit-deselected', undoRedoData.bestFitType, undoRedoData.degree, equationData.getCid());
                this._removeBestFitEquationList(bestFitEquationData);
            }
            $styleParent = this.$('.graphing-tool-editor-color-style-box-table');
            if ($styleParent.attr('data-target-equation-data-cid') === equationData.cid) {
                this._updateStyleForCell($styleParent, equationData);
            }
            this._graphingToolView._gridGraphView.refreshView();
        },

        "calculateResidual": function(options) {
            var points = options.points,
                colNo = Number(options.colNo),
                tableView = options.tableView,
                bestFitData = options.bestFitData,
                residualType = options.type,
                cid = options.cid,
                isUpdate = options.isUpdate || false,
                loopVar, yDash, yData = [],
                xData = [],
                rowCount = tableView.getRowCount(),
                NUMBER_PRECISION = 12,
                noOfRows, EquationPanel = MathUtilities.Tools.Graphing.Models.EquationPanel,
                columnNo = colNo,
                firstColHeader,
                strHeader,
                col1, col2, Chart = MathUtilities.Components.GraphChart.Models.Chart,
                rowHeaderState = tableView.getRowHeaderState(),
                pointLength = points.length,
                rowCounter, colNo1, colNo2, text, residualText,
                residual = [],
                equationData,
                residualEquationData, residualColEquationData,
                residualColumnState = tableView.model.get('residualColumnStates'),
                residualColumnCount = residualColumnState && residualColumnState[cid] && residualColumnState[cid]["residualColumnCount"] ? residualColumnState[cid]["residualColumnCount"] : 0;
            if (isUpdate && tableView.$('.cell[data-column-name=' + residualType + cid + ']').first().length > 0) {
                colNo = tableView.$('.cell[data-column-name=' + residualType + cid + ']').first().attr('data-column').split('col')[1];
                colNo = Number(colNo) - 1;
            } else {
                isUpdate = false;
            }
            for (loopVar = 0; loopVar < pointLength; loopVar++) {
                xData.push(points[loopVar][0]);
            }
            if (rowHeaderState) {
                col1 = [];
                for (loopVar = 1; loopVar < rowCount; loopVar++) {
                    col1.push(loopVar);
                }
            } else {
                col1 = tableView.getColumnContent(1, {
                    "solution": true
                });
            }
            col2 = tableView.getColumnContent(columnNo, {
                "solution": true
            });
            yData = col2;
            colNo1 = (isUpdate || options.isSaveState) ? colNo + 1 : colNo + 1 + residualColumnCount;
            colNo2 = (isUpdate || options.isSaveState) ? colNo + 2 : colNo + 2 + residualColumnCount;
            firstColHeader = tableView.getHeaders()[0];
            text = bestFitData.solutionString;
            strHeader = firstColHeader !== "x" ? "{(" + firstColHeader + ")}" : firstColHeader;
            if (options.isHeaderUpadate) {
                text = bestFitData.solutionString.replace(/x/g, strHeader); //replace latex when x not present
                yDash = this.calculatePoints({
                    "degree": bestFitData.degree,
                    "coef": bestFitData.coef,
                    "xData": xData
                });
            } else {
                yDash = [];
                xData = col1;
                pointLength = xData.length;
            }
            residualText = this.accManagerView.getAccMessage('table-equation-panel-messages', 12);
            this.addTableChartColumn({
                "tableView": tableView,
                "columnNo": colNo1,
                "colContent": yDash,
                "headerContent": text,
                "columnName": residualType + cid,
                "isUpdate": isUpdate,
                "residualEquationData": options.residualEquationData,
                "isHeaderUpadate": options.isHeaderUpadate,
                "residualEquationLatex": options.isSaveState ? options.residualEquationLatex : void 0,
                "xData": xData
            });
            if (!options.isHeaderUpadate) {
                text = bestFitData.solutionString.replace(/x/g, strHeader); //replace latex when x not present
                tableView.setCellContent(tableView.getCellAt(1, colNo1), text, false, true);
            }
            yDash = tableView.getColumnContent(colNo1, {
                "solution": true,
                "getDisabledData": true
            });
            for (loopVar = 0; loopVar < pointLength; loopVar++) {
                residual.push(Number(yData[loopVar]) - Number(yDash[loopVar]));
            }
            noOfRows = col2.length;
            for (loopVar = 0; loopVar < noOfRows; loopVar++) {
                if (col2[loopVar] === '' || !isFinite(col2[loopVar]) || col1[loopVar] === '' || !isFinite(col1[loopVar])) {
                    residual[loopVar] = "";
                }
            }
            this.addTableChartColumn({
                "tableView": tableView,
                "columnNo": colNo2,
                "colContent": residual,
                "headerContent": residualText,
                "columnName": residualType + cid,
                "isUpdate": isUpdate,
                "isHeaderUpadate": options.isHeaderUpadate,
                "residualEquationData": options.residualColEquationData,
                "xData": xData
            });
            if (!isUpdate) {
                if (residualColumnState[cid] && !options.isSaveState) {
                    residualColumnState[cid]["residualColumnCount"] = residualColumnCount + 2; // Number of columns added on residual select is 2
                }
                equationData = this._getEquationDataUsingCid(tableView._getColumnCid(colNo1));
                equationData.setResidualColumnNo(colNo);
                equationData.setResidualType(residualType);
                this._getEquationDataUsingCid(tableView._getColumnCid(colNo2)).setResidualColumnNo(colNo);
                rowCounter = tableView.getRowCount();
                tableView.trigger('col-add-acc', tableView.cid, rowCounter, colNo1);
                tableView.trigger('col-add-acc', tableView.cid, rowCounter, colNo2);
                this.accManagerView.setAccMessage('1-' + colNo1 + '-of-' + tableView.cid, this.accManagerView.getAccMessage('table-equation-panel-messages', 10, [equationData.getAccText()]));
                this.accManagerView.setAccMessage('1-' + colNo2 + '-of-' + tableView.cid, residualText);
                tableView.model.set('residualColumnStates', residualColumnState);
            }
            if (options.isSaveState) {
                residualEquationData = this._getEquationDataUsingCid(tableView._getColumnCid(colNo1));
                residualColEquationData = this._getEquationDataUsingCid(tableView._getColumnCid(colNo2));
                residualColumnState[cid][residualType].residualEquationData = residualEquationData;
                residualColumnState[cid][residualType].residualColEquationData = residualColEquationData;
                tableView.model.set('residualColumnStates', residualColumnState);
            }
            this._updateHideIconsForResidualColumn(colNo, tableView);
        },
        "_updateHideIconsForResidualColumn": function(colNo, tableView, isRemove) {
            var lastColToHide = tableView.getResidualColumnCount(colNo),
                nextCol;
            if (isRemove) {
                nextCol = Number(colNo);
            } else {
                nextCol = lastColToHide + 1;
            }
            if (tableView.getColumn(nextCol).css('display') === 'none') {
                this._addLeftHiddenIcon(nextCol, tableView);
                if (!isRemove) {
                    this._removeHiddenIcon(colNo, lastColToHide, tableView);
                }
            }
        },
        "calculatePoints": function(data) {
            var degree = data.degree,
                range = data.range,
                coef = data.coef,
                xData = data.xData,
                xDataLength,
                step = 1,
                MathHelper = MathUtilities.Components.Utils.Models.MathHelper,
                currentX,
                maxX,
                points = [],
                solution,
                counter,
                loopVar,
                Chart = MathUtilities.Components.GraphChart.Models.Chart,
                coefCounter,
                solvePolynomial,
                solveExp;
            if (range) {
                currentX = range.min.x;
                maxX = range.max.x;
            }
            solvePolynomial = function(x) {
                solution = 0;
                coefCounter = 1;
                for (counter = degree; counter >= 0; counter--, coefCounter++) {
                    if (counter === 0 && x === 0) {
                        continue;
                    }
                    solution += Math.pow(x, counter) * MathHelper._generateNumberFromLatex(coef[coefCounter - 1]);
                }
                return Chart._getDisplayableDataValues(solution, 5, true); //trimmed to 5 digits
            };
            solveExp = function(x) {
                solution = MathHelper._generateNumberFromLatex(coef[0]) * Math.pow(MathHelper._generateNumberFromLatex(coef[1]), x);
                return Chart._getDisplayableDataValues(solution, 5, true); //trimmed to 5 digits
            };
            if (xData) {
                xDataLength = xData.length;
                if (degree === 'e') {
                    for (loopVar = 0; loopVar < xDataLength; loopVar++) {
                        points.push(solveExp(xData[loopVar]));
                    }
                } else {
                    for (loopVar = 0; loopVar < xDataLength; loopVar++) {
                        points.push(solvePolynomial(xData[loopVar]));
                    }
                }
            } else {
                if (degree === 'e') {
                    while (currentX < maxX) {
                        points.push([currentX, solveExp(currentX)]);
                        currentX += step;
                    }
                    points.push([currentX, solveExp(maxX)]);
                } else {
                    while (currentX < maxX) {
                        points.push([currentX, solvePolynomial(currentX + 1)]);
                        currentX += step;
                    }
                    points.push([currentX, solvePolynomial(maxX + 1)]);
                }
            }
            return points;
        },
        "_calculateBestFit": function(tableView, tableData) {
            var equationDataArray = this._getTableEquationData(tableView),
                noOfEquations,
                equationData,
                equationCounter,
                bestFits;
            noOfEquations = equationDataArray.length;
            for (equationCounter = 1; equationCounter < noOfEquations; equationCounter++) {
                bestFits = tableData.headerEquations[equationCounter].bestFit;
                equationData = equationDataArray[equationCounter];
                this._retrieveBestFit(bestFits, equationData, tableView);
            }
        },
        "_getSliderLimits": function($list) {
            var listData = [],
                sliderViewObject;
            sliderViewObject = this._getSliderViewObject($list);
            listData.push(sliderViewObject.get('min'), sliderViewObject.get('max'), sliderViewObject.get('step'));
            return listData;
        },
        // data related
        /**
         * _getInputColumnData returns input column data
         * @method _getInputColumnData
         * @return {Object} JSON object containing input column data
         */
        "_getInputColumnData": function() {
            var inputColumnData = {},
                lists = this.$('.list:not(.disabled)'),
                $disabledLists = this.$('.list.disabled'),
                noOfDisabledLists = $disabledLists.length,
                equationList = [],
                listCounter,
                listType,
                equationData,
                $list,
                tableCounter = this.model.get('tableCounter'),
                lineSelected,
                listData,
                columnCounter,
                tableEquationCid,
                headerEquationData = [],
                cid,
                colNo,
                residualToSave,
                tableData,
                tableView,
                graphHidden,
                residualStates,
                tableDataCols,
                equationDataUnits = this.model.get('equationDataUnits'),
                cell,
                residualType,
                _equationDataManager = this.model.get('_equationDataManager');
            for (listCounter = 0; listCounter < lists.length; listCounter++) {
                $list = lists.eq(listCounter);
                headerEquationData = [];
                listType = $list.attr('data-type');
                graphHidden = $list.find('.show-hide-equation').hasClass('graph-hidden');
                if (listType === 'equation') {
                    if ($list.attr('data-has-slider')) {
                        equationData = this._getMappedEquationData($list);
                        listData = this._getSliderLimits($list);
                        equationList.push({
                            "type": 'equation',
                            "sliderData": listData,
                            "data": equationData.getData(),
                            "isListCollapsed": $list.find('.list-header-container').hasClass('collapse'),
                            "graphHidden": graphHidden
                        });
                    } else {
                        equationData = this._getMappedEquationData($list);
                        equationList.push({
                            "type": 'equation',
                            "data": equationData.getData(),
                            "isListCollapsed": $list.find('.list-header-container').hasClass('collapse'),
                            "graphHidden": graphHidden
                        });
                    }
                } else {
                    if (listType === 'table') {
                        tableView = this._getTableViewObject($list);
                        lineSelected = $list.find('[data-chart-name="line"]').hasClass('selected');
                        residualToSave = {};
                        residualStates = tableView.model.get('residualColumnStates');
                        for (cid in residualStates) {
                            colNo = tableView._getColumnNo(cid);
                            colNo = tableView._getOriginalColumnNo(colNo);
                            residualToSave[colNo] = residualStates[cid];
                            for (residualType in residualToSave[colNo]) {
                                if (residualType !== 'residualColumnCount') {
                                    residualToSave[colNo][residualType].residualEquationLatex = residualToSave[colNo][residualType].residualEquationData._latex;
                                }
                            }
                        }
                        tableData = this._getTableContent($list, tableView);
                        tableDataCols = tableView.getColCount();
                        for (columnCounter = 0; columnCounter < tableDataCols; columnCounter++) {
                            if (tableView.isNextColumnResidual(columnCounter) === false) {
                                cell = tableView.getCellAt(1, columnCounter + 1);
                                tableEquationCid = cell.attr('data-equation-cid');
                                equationData = _equationDataManager.getEquationDataUsingCid(tableEquationCid);
                                headerEquationData.push(equationData.getData());
                            }
                        }
                        equationList.push({
                            "type": 'table',
                            "data": {
                                "tableData": tableData,
                                "tableResidual": residualToSave,
                                "headerEquations": headerEquationData,
                                "chartNames": this._chartManagerView.getSelectedChartsFromTable(tableView, true, false),
                                "lineSelected": lineSelected,
                                "graphHidden": graphHidden
                            },
                            "isListCollapsed": $list.find('.list-header-container').hasClass('collapse')
                        });
                    }
                }
            }
            inputColumnData.allSliderPanelSelected = this._sliderPanel._allSlidersVisible;
            inputColumnData.bestFitInfo = [];
            for (listCounter = 0; listCounter < noOfDisabledLists; listCounter++) {
                inputColumnData.bestFitInfo.push(this._getBestFitMapping($disabledLists.eq(listCounter)));
            }
            inputColumnData.sliderData = this._sliderPanel.getSliderPanelState();
            inputColumnData.hideOtherSliders = this._sliderPanel._hideOtherSliders;
            inputColumnData.tableCounter = tableCounter;
            inputColumnData.lists = equationList;
            inputColumnData.units = equationDataUnits;
            return inputColumnData;
        },
        "_getBestFitMapping": function($list) {
            var tableView;
            tableView = this._getTableViewObject(this.$('.list[data-equation-cid="' + $list.attr('data-table-id') + '"]'));
            return {
                "columnNo": tableView._getColumnNo($list.attr('table-col-equationdata-cid')),
                "tableNumber": tableView.tableCounter,
                "bestFitType": $list.attr('bestfittype'),
                "bestFitSubType": $list.attr('degree'),
                "isListCollapsed": $list.find('.list-header-container').hasClass('collapse'),
                "position": $list.find('.list-handle').attr('data-handle-number')
            };
        },
        "_getTableViewUsingNumber": function(number) {
            var tableViews = this.model.get('tableViews'),
                tableCounter,
                tableViewsLength = tableViews.length;
            for (tableCounter = 0; tableCounter < tableViewsLength; tableCounter++) {
                if (tableViews[tableCounter].tableCounter === number) {
                    return tableViews[tableCounter];
                }
            }
        },
        "_updateBestFitPositions": function(bestFitData) {
            if (!bestFitData) {
                return void 0;
            }
            var bestFitCounter,
                currentBestFitPosition,
                tableView,
                $list,
                colCid,
                noOfBestFits = bestFitData.length;
            for (bestFitCounter = 0; bestFitCounter < noOfBestFits; bestFitCounter++) {
                currentBestFitPosition = bestFitData[bestFitCounter];
                tableView = this._getTableViewUsingNumber(currentBestFitPosition.tableNumber);
                if (tableView) {
                    colCid = tableView._getColumnCid(currentBestFitPosition.columnNo);
                    if (currentBestFitPosition.bestFitSubType) {
                        $list = this.$('.list[table-col-equationdata-cid="' + colCid + '"][bestfittype="' + currentBestFitPosition.bestFitType + '"][degree="' + currentBestFitPosition.bestFitSubType + '"]');
                    } else {
                        $list = this.$('.list[table-col-equationdata-cid="' + colCid + '"][bestfittype="' + currentBestFitPosition.bestFitType + '"]');
                    }
                    if (!currentBestFitPosition.isListCollapsed) {
                        this._toggleList($list);
                    }
                    if ($list) {
                        this._swapListPositions($list, this.$('.list').eq(Number(currentBestFitPosition.position) - 1));
                    }
                }
            }
        },
        "_swapListPositions": function($listFirst, $listSecond) {
            var $listFirstBefore = $listFirst.prev(),
                $listFirstAfter = $listFirst.next(),
                $listSecondBefore = $listSecond.prev(),
                $listSecondAfter = $listSecond.next();
            if ($listFirstBefore.length > 0) {
                $listSecond.insertAfter($listFirstBefore);
            } else {
                $listSecond.insertBefore($listFirstAfter);
            }
            if ($listSecondBefore.length > 0) {
                $listFirst.insertAfter($listSecondBefore);
            } else {
                $listFirst.insertBefore($listSecondAfter);
            }
        },
        /**
         * _setInputColumnData sets input column data
         * @method _setInputColumnData
         * @param {Array} array of JSON object containing input column data
         * @param {Number} Table name counter value
         * @return void
         */
        "_setInputColumnData": function(listsData, bestFitInfo, tableCounter, isColumnHidden) {
            this._deleteAll();
            var listCounter,
                $list, tableView,
                _equationDataManager = this.model.get('_equationDataManager'),
                addResidualTypes, cid,
                savedResidual, colNo,
                tableEquationsData,
                residualStatesCopy,
                tableName = 0,
                equationData,
                sliderView, residualStates = {},
                hiddenColumns = null,
                hiddenColumnsLength = null,
                index = null,
                listData,
                counter,
                tableList = [],
                noOfEquations = listsData.length;
            tableCounter = this.model.get('tableCounter');
            for (listCounter = 0; listCounter < noOfEquations; listCounter++) {
                listData = listsData[listCounter];
                switch (listData.type) {
                    case 'equation':
                        $list = this._createListWithEditor();
                        $list = this._createEquationData($list);
                        equationData = this._getMappedEquationData($list);
                        this.$('#list-box').append($list);
                        this._createAccDivForList($list, false);
                        equationData.setColor(listData.data.color, true);
                        equationData.setThickness(listData.data.thickness, true);
                        equationData.setPreviousThickness(listData.data.prevThickness, true);
                        equationData.setLatex(listData.data.equation, true);
                        equationData.setDashArray(listData.data.dashArray, true);
                        equationData.setVisible(listData.data.visible, true);
                        listData.data.equation = this._revertProcessLatex(listData.data.equation);
                        $list.find('.mathquill-editable').mathquill('latex', listData.data.equation);
                        this.$('#list-box').append($list);
                        if (listCounter === 0) {
                            $list.prev().remove();
                        }
                        this._parseAndPlotEquationData(equationData, $list);
                        if (typeof listData.sliderData !== 'undefined') {
                            sliderView = this._getSliderViewObject($list);
                            sliderView.setLimits(listData.sliderData);
                        }

                        break;
                    case 'table':

                        $list = this._createAndSetTableData(listData);
                        tableList.push({
                            "list": $list,
                            "counter": listCounter
                        });
                        if (listCounter === 0) {
                            $list.prev().remove();
                        }

                }
                if (listData.isListCollapsed) {
                    this._toggleList($list);
                }
            }
            for (counter = 0; counter < tableList.length; counter++) {
                $list = tableList[counter].list;
                listData = listsData[tableList[counter].counter];
                tableView = this._getTableViewObject($list);
                this._resetTableCellSolution(tableView);
                this._parseTable(tableView.getCellAt(1, 1), false, true, true);
                if (listData.data.tableResidual) {
                    addResidualTypes = ['line', 'polynomial', 'exp'];
                    savedResidual = listData.data.tableResidual;
                    for (colNo in savedResidual) {
                        cid = tableView._getColumnCid(colNo);
                        residualStates[cid] = savedResidual[colNo];
                        tableView.model.set('residualColumnStates', residualStates);
                        residualStatesCopy = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(residualStates);
                    }
                    for (cid in residualStates) {
                        tableEquationsData = _equationDataManager.getEquationDataUsingCid(cid);
                        this._updateResidualColumns({
                            "equationData": tableEquationsData,
                            "tableView": tableView,
                            "undoResiduals": addResidualTypes,
                            "isSaveState": true
                        });
                    }
                }
                this._retrieveCharts(tableView, listData.data.chartNames, true, isColumnHidden);
                if (tableView.tableCounter > tableName) {
                    tableName = tableView.tableCounter;
                }

                hiddenColumns = listData.data.tableData.hiddenColumns;
                if (hiddenColumns) {
                    hiddenColumnsLength = hiddenColumns.length;
                }
                for (index = 0; index < hiddenColumnsLength; index++) {
                    this._hideTableColumn(hiddenColumns[index], tableView);
                }
                if (listData.data.graphHidden || listData.data.lineSelected === false) { // false check intentional to avoid issues with saved data
                    this._hideTableGraph($list, tableView);
                    $list.find('.show-hide-equation').addClass('graph-hidden');
                    tableView.model.set('showTable', false);
                }
                this._hideShowColumnGraphForEntireTable(tableView, listData.data.tableData.plotColumnHidden, _equationDataManager);
                residualStates = {};
            }


            if (typeof tableCounter === 'undefined') {
                this.model.set('tableCounter', tableName);
            }
            this._updateBestFitPositions(bestFitInfo);
            this._updateHandles();
            _.delay(_.bind(function() {
                this.$('.mathquill-editable textarea').blur();
            }, this), 10);
        },
        /**
         * _createAndSetTableData creates a table and sets data
         * @method _createAndSetTableData
         * @param {Object} listData JSON object containing table data
         * @return {Object} jQuery object containing table wuth updated data
         */
        "_createAndSetTableData": function(listData) {
            var tableRows,
                tableCols,
                tableContent,
                tableObject,
                $list,
                $cell,
                lineSelected,
                equationData,
                colCounter,
                i,
                rowCounter,
                tableData,
                header = [];
            tableData = listData.data.tableData;
            tableRows = tableData.rows;
            tableCols = tableData.cols;
            lineSelected = listData.data.lineSelected;
            tableContent = tableData.content;
            $list = this._createTableList(tableRows, tableCols, false, tableData.tableName);
            this.$('#list-box').append($list);
            tableObject = this._getTableViewObject($list);
            this._createAccDivForList($list, true, tableObject);
            this._updateHandles();
            for (i = 0; i < tableCols; i++) {
                header.push(tableContent[0][i]);
            }
            if (lineSelected === false) { // intentionally checked for false value to avoid issues with previously saved JSON data
                tableObject.deselectChartButton('line');
                tableObject.model.set({
                    "lineOptionSelected": false,
                    "showTable": false
                });
            }
            tableObject.setHeader(header);
            for (colCounter = 1; colCounter <= tableCols; colCounter++) {
                $cell = tableObject.getCellAt(1, colCounter);
                equationData = this._createEquationDataForColumn($cell, tableObject);
                equationData.setData(listData.data.headerEquations[colCounter - 1]);
                equationData.getPlot().setData(listData.data.headerEquations[colCounter - 1].plotEquation);
                equationData.getPlot().setPoints([]);
                this._setColumnColorForCharts(tableObject, $cell, equationData);
                if (colCounter !== 1) {
                    tableObject.changeLabelOfFunctionOption(colCounter, tableData.functionLabelOptions[colCounter]);
                } else {
                    $list.attr('data-equation-cid', $cell.attr('data-equation-cid'));
                }
            }
            tableObject.trigger('color-changed');
            if (tableData.rowHeaderState) {
                tableObject.checkRowHeader(true);
            }
            for (rowCounter = 2; rowCounter <= tableRows; rowCounter++) {
                for (colCounter = 1; colCounter <= tableCols; colCounter++) {
                    $cell = tableObject.getCellAt(rowCounter, colCounter);
                    tableObject.setData([{
                        "object": $cell,
                        "data": tableContent[rowCounter - 1][colCounter - 1]
                    }]);
                    if (colCounter === 1 && tableData.rowHeaderState) {
                        this._addLabelClassToMathquill($cell);
                    }
                }
            }
            if (listData.data.graphHidden || listData.data.lineSelected === false) { // false check intentional to avoid issues with saved data
                this._hideTableGraph($list, tableObject);
                tableObject.model.set('showTable', false);
            }
            this._resetTableCellSolution(tableObject);
            this._parseTable(tableObject.getCellAt(1, 1), false, true, true);
            this._calculateBestFit(tableObject, listData.data);
            tableObject.setCopyBtnContainerWidth();
            return $list;
        },
        /**
         * _closeStyleEditBox closes style box for table
         * @method _closeStyleEditBox
         * @return void
         */
        "_closeStyleEditBox": function(event) {
            this.$('#input-data-extension').height(0);
            var bestFitBox, dataAnalysisBox, residualBox,
                $list,
                $cell,
                colorOptionBox = this.$('.graphing-tool-editor-color-style-box'),
                $sortOptions = this.$('.graphing-tool-editor-sort-options-container'),
                cid = colorOptionBox.attr('data-target-equation-data-cid');
            if (colorOptionBox.css('display') === 'none') {
                return;
            }
            if (colorOptionBox.hasClass('graphing-tool-editor-color-style-box-table')) {
                $cell = this.$('.cell[data-equation-cid=' + cid + ']');
                $list = $cell.parents('.list');
                if ($('#' + $cell.attr('id').replace('of', 'function-btn')).find('.acc-read-elem').length !== 0 &&
                    $(event.target).parent().attr('id') !== "show-hide-equation-container-of-" + $list.attr('id')) {
                    this.accManagerView.setFocus($cell.attr('id').replace('of', 'function-btn'));
                }
            } else {
                $list = this.$('.list[data-equation-cid=' + cid + ']');
            }
            colorOptionBox.hide();
            if ($list.attr('data-type') === 'table') {
                this.$('.graphing-tool-editor-best-fit-options-container').hide();
                this.$('.graphing-tool-editor-residual-options-container').hide();
                this.$('.graphing-tool-editor-data-analysis-options-container').hide();
                this.$('#input-data').removeClass('input-data-scroll-hidden');
                $sortOptions.hide();
            }
            if (this._graphingToolView.isAccDivPresent($('#graphing-tool-editor-graph-style-thickness-handle'))) {
                this.accManagerView.enableTab('graphing-tool-editor-graph-style-thickness-handle', false);
            }
        },

        "_keyDownOnListHandle": function(event) {
            var actualTarget = $(event.target).parent(),
                $list = $(event.target).parents('.list'),
                $prevList = $list.prev(),
                $nextList = $list.next(),
                handleNumber = $list.find('.list-handle').attr('data-handle-number'),
                listArrObj,
                accText;
            if ([38, 40].indexOf(event.keyCode) > -1 && $('.list').length > 1) {
                if (event.keyCode === 38 && $prevList.length > 0) { //up arrow  key
                    $list.insertBefore($list.prev());
                    accText = this.accManagerView.getAccMessage('up-arrow-text', 0);
                } else if (event.keyCode === 40 && $nextList.length > 0) { //down arrow  key
                    $list.insertAfter($list.next());
                    accText = this.accManagerView.getAccMessage('down-arrow-text', 0);
                } else {
                    return void 0;
                }
                listArrObj = {
                    "pickedList": $list,
                    "prevList": $prevList,
                    "nextList": $nextList,
                    "handleNumber": handleNumber
                };
                this._stopListSorting(listArrObj);
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setAccMessage('list-handle-of-' + $list.attr('id'),
                    this.accManagerView.getAccMessage('list-equation-panel-messages', 17, [handleNumber, accText]));
                this.accManagerView.setFocus($(event.target.parentElement).attr('id'));
            }
        },

        "handleUndoRedoActions": function(actionName, undoRedoData) {
            var $targetList,
                $list,
                $upadatedList,
                targetCid,
                prevCid,
                functionOption,
                functionOptions,
                $dummyList,
                equationData,
                tableRows,
                tableCols,
                tableContent,
                tableEquationData,
                tableObject,
                $firstList,
                $cell,
                $colorOptionBox,
                $targetCell,
                thickness, chartBestFit,
                tableView,
                equationCid,
                $styleParent,
                colNo,
                currentBestFitObject,
                bestFitEquationData,
                bestFitData,
                plotObj,
                $bestFitIcon,
                header, i, j,
                $column,
                rowWidth,
                counter,
                points,
                $listBox = this.$('#list-box'),
                projectorMode,
                rowCounter,
                toColumn,
                fromColumn,
                noOfRows,
                isVisible,
                residualTableState,
                addResidualTypes,
                residualColumnStates,
                undoRedoCounter,
                _equationDataManager = this.model.get('_equationDataManager'),
                tableState,
                shouldRtrieve,
                cellContent,
                sliderView,
                replaceString = {
                    "\\ceil": '\\{ceil}',
                    "\\floor": '\\{floor}',
                    "\\round": '\\text{round}',
                    "\\abs": '\\text{abs}',
                    "\\nPr": '\\text{nPr}',
                    "\\nCr": '\\text{nCr}',
                    "\\npr": '\\text{npr}',
                    "\\ncr": '\\text{ncr}',
                    "\\fracdec": '\\text{fracdec}'
                },
                isToggleList = false,
                tableList = [],
                $toggleList,
                equationDataUnit = this.model.get('equationDataUnits'),
                tableColEquationDataCid, bestFitType, degree, latex, tableColEquationData, $tableList,
                hiddenColumns = null,
                cid, tableEquationsData,
                hiddenColumnsLength = null,
                residualTableStateKeys,
                residualTableStateKeysLength,
                index = null,
                $lastFocusedMathquill,
                $lastFocusedList;
            switch (actionName) {
                case 'showHideTableColumn':
                    colNo = Number(undoRedoData.columnNo);
                    equationData = undoRedoData.equationData;
                    $list = this.$('div[data-equation-cid=' + equationData.getCid() + ']').parents('.list');
                    tableView = this._getTableViewObject($list);
                    if (undoRedoData.iconClicked) {
                        toColumn = undoRedoData.toColumn;
                        fromColumn = undoRedoData.fromColumn;
                        if (toColumn === null) {
                            toColumn = tableView.getColCount() + 1;
                        }
                        if (undoRedoData.actionType === 'hideColumn') {
                            this._hideTableColumn(colNo, tableView, fromColumn, toColumn);
                        } else {
                            this._removeHiddenIcon(fromColumn, toColumn, tableView);
                            this._adjustTableHeaderHeightForIE(tableView);
                        }
                        this.$('.equation-box-focus').trigger('mousedown');
                        tableView.setCopyBtnContainerWidth();
                    } else {
                        if (undoRedoData.actionType === 'hideColumn') {
                            this._hideTableColumn(colNo, tableView);
                        } else {
                            this._showSingleHiddenColumn(colNo, tableView);
                        }
                    }
                    break;
                case 'plotColumnCheckboxClick':
                    $list = this.$('div[data-equation-cid=' + undoRedoData.equationData.getCid() + ']').parents('.list');
                    tableView = this._getTableViewObject($list);
                    this._hideShowColumnGraph(undoRedoData.isChecked, tableView, undoRedoData.columnNo, undoRedoData.equationData, true, true);
                    this._updatePlotColumnOption(undoRedoData.equationData, tableView.getColumn(undoRedoData.columnNo));
                    this.$('#input-data').removeClass('input-data-scroll-hidden');
                    this._graphingToolView._hidePopUps();
                    break;
                case 'residualColumn':
                    tableView = this._getTableViewObject(this.$('.list[data-equation-cid=' + undoRedoData.targetCid + ']'));
                    equationData = undoRedoData.equationData;
                    residualTableState = undoRedoData.residualColumnState;
                    tableView.model.set('residualColumnStates', residualTableState);
                    if (residualTableState) {
                        residualColumnStates = residualTableState[equationData.getCid()];
                    }
                    if (residualColumnStates) {
                        if (undoRedoData.actionType === 'addResidualColumn') {
                            residualColumnStates[undoRedoData.residualType].selected = true;
                            this._updateResidualColumns({
                                "equationData": equationData,
                                "tableView": tableView,
                                "undoResiduals": [undoRedoData.residualType],
                                "isUndoRedoAction": true,
                                "actionType": undoRedoData.actionType
                            });
                        } else {
                            residualColumnStates[undoRedoData.residualType].selected = false;
                            this._removeResidualColumns(undoRedoData.cid, undoRedoData.residualType, tableView);
                        }
                    }
                    break;
                case 'changeEquation':
                    if (undoRedoData.data === null) {
                        undoRedoData.data = '';
                    }
                    undoRedoData.data = undoRedoData.data.replace(/(\\round|\\abs|\\ceil|\\nPr|\\nCr|\\floor|\\fracdec)/g, function($0) {
                        return replaceString[$0];
                    });
                    $targetList = this.$('div[data-equation-cid=' + undoRedoData.target + ']');
                    if (!$targetList.length) {
                        $targetList = this.$('div[data-constant=' + undoRedoData.dataConstant + ']').parents('.list');
                        $targetList.find('.slider-view-container').css('display', 'block');
                    }
                    equationData = this._getMappedEquationData($targetList);
                    if (equationData.getPoints() && equationData.getSpecie() === 'point' && equationData.getPointVisibility()) {
                        this.checkIfChangeInPoint(equationData.getPoints().slice(), []);
                    }
                    _equationDataManager.removePoint(equationData);
                    this._removePlots(equationData);
                    $targetList.find('.mathquill-editable').mathquill('latex', undoRedoData.data);
                    $targetList.find('textarea').focus();
                    this._parseAndPlotEquationData(equationData, $targetList);
                    isToggleList = true;
                    $toggleList = $targetList;
                    break;
                case 'firstListDelete':
                    $targetList = this.$('div[data-equation-cid=' + undoRedoData.equationCid + ']');
                    $targetList.find('.mathquill-editable').mathquill('latex', undoRedoData.equation);
                    if (typeof undoRedoData.visibility !== 'undefined') {
                        undoRedoData.equationData.setCurveVisibility(undoRedoData.visibility);
                        undoRedoData.equationData.setThickness(undoRedoData.thickness);
                        undoRedoData.equationData.setDashArray(undoRedoData.dashArray);
                    } else {
                        undoRedoData.equationData.setCurveVisibility(true);
                        // 3 is the default thickness for plots
                        undoRedoData.equationData.setThickness(3, true);
                        undoRedoData.equationData.setDashArray([]);
                    }
                    if ($targetList.find('.list-header-container').hasClass('collapse')) {
                        isToggleList = true;
                        $toggleList = $targetList;
                    }
                    if (this._projectorMode) {
                        undoRedoData.equationData.changeThickness(7);
                    }
                    this._parseAndPlotEquationData(undoRedoData.equationData, $targetList);
                    if (typeof undoRedoData.thickness !== 'undefined') {
                        undoRedoData.equationData.changeThickness(undoRedoData.thickness);
                    }
                    $targetList.find('textarea').focus();
                    break;
                case 'deleteList':
                    if (undoRedoData.actionType === 'deleteList') {
                        if ($listBox.children().length === 1) {
                            return void 0;
                        }
                        $list = this.$('div[data-equation-cid=' + undoRedoData.equationCid + ']');
                        this._removeEquationData($list);
                        if (undoRedoData.bestFitType && undoRedoData.tableColEquationDataCid) {
                            $tableList = this.$('.cell[data-equation-cid="' + undoRedoData.tableColEquationDataCid + '"]').parents('.list');
                            tableView = this._getTableViewObject($tableList);
                            equationData = _equationDataManager.getEquationDataUsingCid(undoRedoData.tableColEquationDataCid);
                            currentBestFitObject = equationData.getBestFit();
                            if (undoRedoData.bestFitType === 'curve') {
                                currentBestFitObject[undoRedoData.bestFitType][undoRedoData.degree].selected = false;
                            } else {
                                currentBestFitObject[undoRedoData.bestFitType].selected = false;
                            }
                            if (Object.keys(undoRedoData.residualData).length > 0) {
                                residualColumnStates = tableView.model.get('residualColumnStates')[undoRedoData.tableColEquationDataCid];
                                residualColumnStates[undoRedoData.residualData.bestFitType].selected = false;
                                this._removeResidualColumns(undoRedoData.tableColEquationDataCid, undoRedoData.residualData.bestFitType, tableView);
                            }
                        }
                        if ($list.hasClass('list-focus')) {
                            this._sliderPanel.hideCurrentSliders();
                        }
                        $list.remove();
                        $('.coordinate-tooltip[data-equation-cid=' + undoRedoData.equationCid + ']').remove();
                        this._updateChartOnBestFitListChanges($list);
                    } else {
                        if (!undoRedoData.disabled) {
                            $list = this._createListWithEditor();
                            undoRedoData.equationData.setUnits({
                                "angle": this.model.get('equationDataUnits')
                            });
                            $targetList = this.$('#list-box').find('.list').eq(undoRedoData.index - 2);
                            $upadatedList = this._setListData($list, undoRedoData);
                            if (undoRedoData.index === 1) {
                                this.$('#list-box').prepend($upadatedList);
                            } else {
                                if (undoRedoData.actionType === 'addListBefore') {
                                    $upadatedList.insertBefore($targetList);
                                } else {
                                    if ($targetList.length === 0) {
                                        $listBox.append($upadatedList);
                                    } else {
                                        $upadatedList.insertAfter($targetList);
                                    }
                                }
                            }
                            this._parseAndPlotEquationData(undoRedoData.equationData, $upadatedList);
                            $upadatedList.find('.mathquill-editable').mathquill('latex', undoRedoData.equation);
                            $upadatedList.find('textarea').focus();
                        } else {
                            $tableList = this.$('.cell[data-equation-cid="' + undoRedoData.tableColEquationDataCid + '"]').parents('.list');
                            $upadatedList = this._addBestFitEquationList({
                                "tableList": $tableList,
                                "equationData": undoRedoData.equationData,
                                "tableColEquationDataCid": undoRedoData.tableColEquationDataCid,
                                "bestFitType": undoRedoData.bestFitType,
                                "degree": undoRedoData.degree,
                                "drawChart": void 0,
                                "residualData": undoRedoData.residualData,
                                "listIndex": undoRedoData.index,
                                "isUndoRedoAction": true
                            });
                            this._updateListWidth();
                            this._selectBestFitEquationMenuItem($tableList, undoRedoData.equationData, undoRedoData.tableColEquationDataCid, undoRedoData.bestFitType, undoRedoData.degree, void 0, undoRedoData.residualData);
                            tableView = this._getTableViewObject($tableList);
                            hiddenColumns = tableView._getHiddenColumns();
                            hiddenColumnsLength = hiddenColumns.length;
                            for (index = 0; index < hiddenColumnsLength; index++) {
                                this._hideTableColumn(hiddenColumns[index], tableView);
                            }
                        }
                    }
                    this._updateHandles();
                    break;
                case 'addList':
                    if (undoRedoData.actionType === 'deleteList') {
                        if ($listBox.children().length === 1) {
                            return void 0;
                        }
                        equationData = undoRedoData.equationData;
                        $list = this.$('div[data-equation-cid=' + equationData.getCid() + ']');
                        if ($list.hasClass('list-focus')) {
                            this._sliderPanel.hideCurrentSliders();
                        }
                        this._removeEquationData($list);
                        $list.remove();
                    } else {
                        undoRedoData.equationData.setUnits({
                            "angle": this.model.get('equationDataUnits')
                        });
                        $list = this._createListWithEditor();
                        $targetList = $listBox.find('.list').eq(undoRedoData.index - 2);
                        $upadatedList = this._setListData($list, undoRedoData);
                        if (typeof $targetList === 'undefined') {
                            $listBox.prepend($upadatedList);
                        } else {
                            $upadatedList.insertAfter($targetList);
                        }
                        this._createAccDivForList($upadatedList, false);
                        $upadatedList.find('.mathquill-editable').mathquill('latex', undoRedoData.equation);
                        $upadatedList.find('textarea').focus();
                        this._parseAndPlotEquationData(undoRedoData.equationData, $upadatedList);
                    }
                    this._updateHandles();
                    break;
                case 'addDuplicateList':
                    if (undoRedoData.actionType === 'deleteList') {
                        equationData = undoRedoData.listData.equationData;
                        $list = this.$('div[data-equation-cid=' + equationData.getCid() + ']');
                        $list.remove();
                        this._removeEquationData($list);
                    } else {
                        equationData = undoRedoData.listData.equationData;
                        $targetList = this.$('div[data-equation-cid=' + undoRedoData.targetCid + ']');
                        $list = this._createListWithEditor();
                        $upadatedList = this._setListData($list, undoRedoData.listData);
                        $upadatedList.insertAfter($targetList);
                        this._createAccDivForList($upadatedList, false);
                        $upadatedList.find('.mathquill-editable').mathquill('latex', equationData.getLatex());
                        this._parseAndPlotEquationData(equationData, $upadatedList);
                        if (this.$('#input-column-options-for-editing').hasClass('visible')) {
                            this._showEditOptions();
                        }
                    }
                    this._updateHandles();
                    break;
                case 'addTable':
                    if (undoRedoData.actionType === 'deleteTable') {
                        this._graphingToolView._hidePopUps();
                        if (undoRedoData.index === 1) {
                            if (undoRedoData.removeList === true) {
                                $list = $listBox.find('.list').first();
                                tableView = this._getTableViewObject($list);
                                tableView.trigger('delete-table');
                                this._removeTableEquationDataPoints(this._getTableEquationData(tableView));
                                this._clearTableStylesOnDelete(tableView);
                                $list.remove();
                            } else {
                                $list = $listBox.find('.list').first();
                                tableView = this._getTableViewObject($list);
                                tableView.trigger('delete-table');
                                $list.remove();
                                $list = this._createListWithEditor();
                                if (typeof undoRedoData.focusedListEquationData === 'undefined') {
                                    this._createEquationData($list);
                                } else {
                                    this._setListData($list, undoRedoData.focusedListEquationData);
                                }
                                $list.attr('data-type', 'equation');
                                $listBox.prepend($list);
                                this._createAccDivForList($list, false);
                            }
                        } else {
                            $targetList = $listBox.find('.list').eq(undoRedoData.index - 2);
                            tableView = this._getTableViewObject($targetList.next());
                            tableView.trigger('delete-table');
                            this._removeTableEquationDataPoints(this._getTableEquationData(tableView));
                            this._clearTableStylesOnDelete(tableView);
                            $targetList.next().remove();
                            if (!undoRedoData.copyTable) {
                                $list = this._createListWithEditor();
                                if (typeof undoRedoData.focusedListEquationData === 'undefined') {
                                    this._createEquationData($list);
                                } else {
                                    this._setListData($list, undoRedoData.focusedListEquationData);
                                }
                                $list.attr('data-type', 'equation');
                                $list.insertAfter($targetList);
                                this._createAccDivForList($list, false);
                            }
                        }
                    } else {
                        tableState = undoRedoData.tableState;
                        tableRows = tableState.rows;
                        tableCols = tableState.cols;
                        tableContent = tableState.content;
                        tableEquationData = undoRedoData.equationData;
                        $firstList = $listBox.find('.list').first();
                        $upadatedList = this._createTableList(tableRows, tableCols, $dummyList, tableState.tableName);
                        /*condition to decide position of add-table list*/
                        if (undoRedoData.index === 1) {
                            /*if index is 1*/
                            if (undoRedoData.removeList) {
                                $firstList.remove();
                            }
                            $listBox.prepend($upadatedList);
                        } else {
                            $targetList = $listBox.find('.list').eq(undoRedoData.index - 2);
                            $upadatedList.insertAfter($targetList);
                        }
                        tableObject = this._getTableViewObject($upadatedList);
                        this._createAccDivForList($upadatedList, true, tableObject);
                        this._updateHandles();
                        header = [];
                        for (i = 0; i < tableCols; i++) {
                            header.push(tableContent[0][i]);
                        }
                        tableObject.setHeader(header);
                        for (i = 1; i <= tableCols; i++) {
                            $cell = tableObject.getCellAt(1, i);
                            this._setTableEquationData(tableEquationData[i - 1], $cell);
                            tableObject.setColumnColor(i - 1, tableEquationData[i - 1].getColor());
                        }
                        for (i = 2; i <= tableRows; i++) {
                            for (j = 1; j <= tableCols; j++) {
                                $cell = tableObject.getCellAt(i, j);
                                tableObject.setData([{
                                    "object": $cell,
                                    "data": tableContent[i - 1][j - 1]
                                }]);
                            }
                        }
                        if (tableState.rowHeaderState === true) {
                            tableObject.checkRowHeader(true);
                        }
                        if (tableState.eyeOpen === false) {
                            tableObject.setTableVisiblity(false);
                            $upadatedList.find('.show-hide-equation').addClass('graph-hidden');
                        }
                        this._resetTableCellSolution(tableObject);
                        functionOptions = tableState.functionLabelOptions;
                        for (functionOption in functionOptions) {
                            tableObject.changeLabelOfFunctionOption(functionOption, functionOptions[functionOption]);
                        }
                        this._parseTable(tableObject.getCellAt(1, 1), false, true, true);
                    }
                    this._updateHandles();
                    break;
                case 'tableDeleteList':
                case 'tableDelete':
                    if (undoRedoData.actionType === 'addTable') {
                        tableState = undoRedoData.tableState;
                        hiddenColumns = tableState.hiddenColumns;
                        hiddenColumnsLength = hiddenColumns.length;
                        tableRows = tableState.rows;
                        tableCols = tableState.cols;
                        chartBestFit = tableState.chartBestFit;
                        tableContent = tableState.content;
                        tableEquationData = undoRedoData.equationData;
                        residualColumnStates = undoRedoData.residualColumnStates;
                        addResidualTypes = ['line', 'polynomial', 'exp'];
                        $upadatedList = this._createTableList(tableRows, tableCols, $dummyList, tableState.tableName);
                        $upadatedList.attr('data-equation-cid', undoRedoData.tableList);
                        if (undoRedoData.index === 1) {
                            if (undoRedoData.removeFirstList) {
                                $list = $listBox.find('.list').first();
                                $list.remove();
                                $listBox.prepend($upadatedList);
                            } else {
                                $listBox.prepend($upadatedList);
                            }
                        } else {
                            $targetList = $listBox.find('.list').eq(undoRedoData.index - 2);
                            $upadatedList.insertAfter($targetList);
                        }
                        tableObject = this._getTableViewObject($upadatedList);
                        this._createAccDivForList($upadatedList, true, tableObject);
                        tableObject.setHeader(tableContent[0]);
                        if (tableState.rowHeaderState === true) {
                            tableObject.checkRowHeader(true);
                        }
                        for (i = 1; i <= tableCols; i++) {
                            $cell = tableObject.getCellAt(1, i);
                            this._setTableEquationData(tableEquationData[i - 1], $cell);
                            tableObject.setColumnColor(i - 1, tableEquationData[i - 1].getColor());
                            if (tableObject.getRowHeaderState() && $cell.is('.col1')) {
                                this._addLabelClassToMathquill($cell);
                            }
                        }
                        for (i = 1; i <= tableCols; i++) {
                            plotObj = undoRedoData.equationData[i - 1].getPlot();
                            if (plotObj !== null) {
                                plotObj.setThickness(undoRedoData.equationData[i - 1].getThickness());
                            }
                            this._showBestFitGraph(undoRedoData.equationData[i - 1], $upadatedList);
                            for (j = 1; j <= tableRows; j++) {
                                $cell = tableObject.getCellAt(j, i);
                                tableObject.setData([{
                                    "object": $cell,
                                    "data": tableContent[j - 1][i - 1]
                                }]);
                            }
                            if (tableObject.getRowHeaderState() && $cell.is('.col1')) {
                                this._addLabelClassToMathquill($cell);
                            }
                        }
                        if (tableState.eyeOpen === false) {
                            tableObject.setTableVisiblity(false);
                            $upadatedList.find('.show-hide-equation').addClass('graph-hidden');
                        }
                        this._resetTableCellSolution(tableObject);
                        if (tableState.showTable === false) {
                            tableObject.trigger('hide-table-graph');
                            tableObject.deselectChartButton('line');
                            tableObject.model.set({
                                "lineOptionSelected": false,
                                "showTable": false
                            });
                        } else {
                            tableObject.trigger('show-table-graph');
                            tableObject.selectChartButton('line');
                            tableObject.model.set({
                                "lineOptionSelected": true,
                                "showTable": true
                            });
                        }
                        functionOptions = tableState.functionLabelOptions;
                        for (functionOption in functionOptions) {
                            tableObject.changeLabelOfFunctionOption(functionOption, functionOptions[functionOption]);
                        }
                        tableObject.model.set('chartBestFit', chartBestFit);
                        this._parseTable(tableObject.getCellAt(1, 1), false, true, true);
                        this._retrieveCharts(tableObject, undoRedoData.chartData);
                        tableObject.model.set('residualColumnStates', residualColumnStates);

                        tableObject.model.set('residualColumnDependency', undoRedoData.residualColumnDependency);
                        for (i = 0; i < tableCols; i++) {
                            $cell = tableObject.getCellAt(1, i + 1);
                            cid = tableObject._getColumnCid(i + 1);
                            this._updateResidualColumns({
                                "equationData": tableEquationData[i],
                                "tableView": tableObject,
                                "undoResiduals": addResidualTypes,
                                "isUndoRedoAction": void 0,
                                "actionType": undoRedoData.actionType
                            });

                            if (tableEquationData[i].getResidualColumnNo() && tableContent[0][i] === " Residual") {
                                tableObject.disableCell($cell);
                                tableObject.disableAllCellsInColumn(i + 1);
                                $cell.find('.function-btn, .handler-warning').hide();
                            }
                        }
                        this._hideShowColumnGraphForEntireTable(tableObject, tableState.plotColumnHidden, _equationDataManager);
                        for (index = 0; index < hiddenColumnsLength; index++) {
                            this._hideTableColumn(hiddenColumns[index], tableObject);
                        }
                        this._adjustTableHeaderHeightForIE(tableObject);
                        this._focusOnList($upadatedList);
                        this._updateListWidth($upadatedList.find('.equation-box').outerWidth());
                        tableObject.model.set('residualColumnStates', residualColumnStates);
                    } else {
                        this._graphingToolView._hidePopUps();
                        tableState = undoRedoData.tableState;
                        tableRows = tableState.rows;
                        tableCols = tableState.cols;
                        tableContent = tableState.content;
                        tableEquationData = undoRedoData.equationData;
                        $list = this.$('.list[data-equation-cid=' + tableEquationData[0].getCid() + ']');
                        this._removeTableEquationDataPoints(tableEquationData);
                        tableView = this._getTableViewObject($list);
                        tableView.trigger('delete-table');
                        this._clearTableStylesOnDelete(tableView);
                        $targetList = this.$('.list[data-equation-cid=' + undoRedoData.target + ']');
                        if ($targetList.length === 0) {
                            $list = $listBox.find('.list').first();
                            $list.remove();
                            $list = this._createListWithEditor();
                            if (undoRedoData.newEquationData) {
                                $list.attr('data-equation-cid', undoRedoData.newEquationData.getCid());
                            } else {
                                this._createEquationData($list);
                            }
                            $listBox.prepend($list);
                            this._createAccDivForList($list, false);
                            if (actionName === 'tableDeleteList') {
                                $list.remove();
                            }
                        } else {
                            $targetList = this.$('.list[data-equation-cid=' + undoRedoData.target + ']');
                            $targetList.next().remove();
                        }
                    }
                    this._updateHandles();
                    isToggleList = true;
                    $toggleList = $upadatedList;
                    break;
                case 'addTableRow':
                    $list = $listBox.find('.list').eq(undoRedoData.listIndex - 1);
                    tableView = this._getTableViewObject($list);
                    if (undoRedoData.actionType === 'deleteRow') {
                        tableView.deleteRow(undoRedoData.rowNo);
                        tableView.trigger('data-changed');
                    } else {
                        tableView.insertRowAfter(undoRedoData.rowNo, true, true);
                        this._parseTable(tableView.getCellAt(undoRedoData.rowNo, 1), tableView, true, true);
                        tableView._hideHiddenColumnNewRows();
                    }
                    isToggleList = true;
                    $toggleList = $list;
                    break;
                case 'deleteTableRow':
                    $list = $listBox.find('.list').eq(undoRedoData.listIndex - 1);
                    tableView = this._getTableViewObject($list);
                    if (undoRedoData.actionType === 'deleteRow') {
                        tableView.deleteRow(undoRedoData.rowNo);
                        tableView.trigger('data-changed');
                        this._parseTable(tableView.getCellAt(1, 1), tableView, true, true);
                    } else {
                        tableView.insertRowAfter(undoRedoData.rowNo - 1);
                        tableView.setRowContent(undoRedoData.rowNo, undoRedoData.rowContent, false, true);
                        this._parseTable(tableView.getCellAt(undoRedoData.rowNo, 1), tableView, true, true);
                        tableView._hideHiddenColumnNewRows();
                    }
                    isToggleList = true;
                    $toggleList = $list;
                    break;
                case 'showHideChart':
                    $list = this.$('.list[data-equation-cid=' + undoRedoData.equationCid + ']');
                    tableView = this._getTableViewObject($list);
                    if (undoRedoData.actionType === 'hideChart') {
                        this._chartManagerView.windowManagerView.isChartPositionUpdated = false;
                    }
                    if (undoRedoData.chartName !== 'line') {
                        isVisible = this._chartManagerView.showHideChart(undoRedoData.chartName, tableView, undoRedoData);
                    }
                    if (isVisible) {
                        //selectChart
                        if (undoRedoData.chartName === 'line') {
                            tableView.trigger('show-table-graph');
                        }
                        tableView.selectChartButton(undoRedoData.chartName);
                    } else {
                        if (undoRedoData.chartName === 'line') {
                            if (undoRedoData.actionType === 'hideChart') {
                                tableView.trigger('hide-table-graph');
                                tableView.deselectChartButton(undoRedoData.chartName);
                                tableView.model.set({
                                    "lineOptionSelected": false,
                                    "showTable": false
                                });
                            } else {
                                tableView.trigger('show-table-graph');
                                tableView.selectChartButton(undoRedoData.chartName);
                                tableView.model.set({
                                    "lineOptionSelected": true,
                                    "showTable": true
                                });
                            }
                        } else {
                            //deselectChart
                            tableView.deselectChartButton(undoRedoData.chartName);
                        }
                    }
                    break;
                case 'tableDropdownChanged':
                    $list = this.$('.list[data-equation-cid=' + undoRedoData.equationCid + ']');
                    tableView = this._getTableViewObject($list);
                    this._chartManagerView.showTableChangeAlert(undoRedoData.tableName, undoRedoData.chartName, tableView, true);
                    break;
                case 'addTableColumn':
                    if (undoRedoData.actionType === 'deleteColumn') {
                        equationData = undoRedoData.equationData;
                        $list = this.$('div[data-equation-cid=' + equationData.getCid() + ']').parents('.list');
                        tableObject = this._getTableViewObject($list);
                        tableObject.deleteCol(undoRedoData.colNo);
                        this._callRemovePlottedGraph(equationData);
                        _equationDataManager.removeEquation(equationData);
                    } else {
                        equationData = undoRedoData.equationData;
                        $list = this.$('div[data-equation-cid=' + undoRedoData.firstCellCid + ']').parents('.list');
                        tableObject = this._getTableViewObject($list);
                        tableObject.addCol();
                        tableObject.changeLabelOfFunctionOption(undoRedoData.colNo, undoRedoData.functionOption);
                        $cell = tableObject.getCellAt(1, undoRedoData.colNo);
                        this._setTableEquationData(equationData, $cell);
                        tableObject.setColumnColor(Number(undoRedoData.colNo) - 1, equationData.getColor());
                        this._adjustTableHeaderHeightForIE(tableObject);
                        tableObject._addRightHiddenIcon(undoRedoData.colNo, true);
                        this._updatePlotColumnOption(equationData, tableObject.getColumn(undoRedoData.colNo));
                    }
                    this._updateListWidth($list.find('.equation-box').outerWidth());
                    isToggleList = true;
                    $toggleList = $list;
                    break;
                case 'deleteTableColumn':
                    colNo = Number(undoRedoData.columnNo);
                    if (undoRedoData.actionType === 'deleteColumn') {
                        equationData = undoRedoData.equationData;
                        $list = this.$('div[data-equation-cid=' + equationData.getCid() + ']').parents('.list');
                        tableObject = this._getTableViewObject($list);
                        if (tableObject.getColCount() < colNo) {
                            colNo = tableObject._getColumnNo(equationData.getCid());
                        }
                        this._deleteResidualColumns(equationData, tableObject, true);
                        tableObject.deleteCol(colNo);
                        tableObject.trigger('data-changed', colNo);
                        if (typeof undoRedoData.prevEquationData !== 'undefined') {
                            this._removeTableEquationDataPoints([undoRedoData.prevEquationData]);
                            _equationDataManager.removeEquation(undoRedoData.prevEquationData);
                        } else {
                            this._removeTableEquationDataPoints([equationData]);
                            _equationDataManager.removeEquation(equationData);
                        }
                        this._updateTableHeaderError($list);
                        tableObject._removePlotColumnCid(equationData.getCid());
                    } else {
                        equationData = undoRedoData.prevEquationData || undoRedoData.equationData;
                        $list = this.$('div[data-equation-cid=' + undoRedoData.firstCellCid + ']').parents('.list');
                        tableObject = this._getTableViewObject($list);
                        tableObject.model.set('residualColumnDependency', undoRedoData.residualColumnDependency);
                        if (tableObject.getColCount() < colNo) {
                            colNo = tableObject.getColCount() + 1;
                        }
                        tableObject.addCol(colNo);
                        functionOption = undoRedoData.functionOption;
                        $cell = tableObject.getCellAt(1, colNo);
                        tableObject.changeLabelOfFunctionOption(colNo, functionOption);
                        this._setTableEquationData(equationData, $cell);
                        if (equationData.getDependentColumnNo()) {
                            $cell.attr('data-dependent-no', equationData.getDependentColumnNo());
                            if (equationData.getLatex() === "Residual") {
                                tableObject.disableCell($cell);
                                $cell.find('.mathquill-rendered-math').off('mousedown');
                                equationData.setBlind(true);
                                $cell.find('.function-btn').hide();
                            }
                        }
                        tableObject.setColumnColor(colNo - 1, equationData.getColor());
                        if (undoRedoData.latex && undoRedoData.columnContent) {
                            tableObject.setCellContent($cell, undoRedoData.latex, false, true);
                            if (functionOption === 'F') {
                                tableObject.setColumnContent(undoRedoData.columnNo, undoRedoData.columnContent, {
                                    "latexAndSolution": true
                                });
                            } else {
                                tableObject.setColumnContent(undoRedoData.columnNo, undoRedoData.columnContent, {
                                    "solution": false
                                });
                            }
                            this._parseTable($cell, tableObject, true, true);
                        }
                        tableObject._addRightHiddenIcon(colNo, true);
                        if (tableObject.getColumn(colNo + 1).css('display') === 'none') {
                            tableObject._addLeftHiddenIcon(colNo + 1);
                        }
                        if (undoRedoData.doNotPlotColumn) {
                            cid = tableObject._getColumnCid(colNo);
                            tableEquationsData = _equationDataManager.getEquationDataUsingCid(cid);
                            this._hideShowColumnGraph(false, tableObject, colNo, tableEquationsData, true);
                            this._updatePlotColumnOption(tableEquationsData, tableObject.getColumn(colNo));
                        }
                        residualTableState = tableObject.model.get('residualColumnStates');
                        if (!$.isEmptyObject(residualTableState)) {
                            addResidualTypes = ['line', 'polynomial', 'exp'];
                            cid = tableObject._getColumnCid(colNo);
                            equationData = this._getEquationDataUsingCid(cid);
                            residualTableState = residualTableState[cid];
                            if (residualTableState) {
                                residualTableStateKeys = Object.keys(residualTableState);
                                residualTableStateKeysLength = residualTableStateKeys.length;
                                for (index = 0; index < residualTableStateKeysLength; index++) {
                                    if (residualTableState[residualTableStateKeys[index]].isDeleted) {
                                        residualTableState[residualTableStateKeys[index]].selected = true;
                                    }
                                }
                                this._updateResidualColumns({
                                    "equationData": equationData,
                                    "tableView": tableObject,
                                    "undoResiduals": addResidualTypes,
                                    "isUndoRedoAction": true
                                });
                            }
                        }
                    }
                    this._adjustTableHeaderHeightForIE(tableObject);
                    this._updateListWidth($list.find('.equation-box').outerWidth());
                    isToggleList = true;
                    $toggleList = $list;
                    break;
                case 'tableCellColorChange':
                    equationData = undoRedoData.equationData;
                    $targetCell = this.$(".cell[data-equation-cid='" + equationData.getCid() + "']");
                    $list = $targetCell.parents('.list');
                    $colorOptionBox = this.$('.graphing-tool-editor-color-style-box-table');
                    tableView = this._getTableViewObject($list);
                    equationData.changeColor(undoRedoData.color);
                    if (equationData.getPlot()) {
                        equationData.getPlot().changePointsColor(undoRedoData.color);
                    }
                    bestFitData = equationData.getBestFit();
                    if (bestFitData !== null) {
                        if (bestFitData.line && bestFitData.line.selected === true) {
                            bestFitEquationData = bestFitData.line.equationData;
                            bestFitEquationData.changeColor(undoRedoData.color);
                            bestFitEquationData.trigger('best-fit-equation-color-change', void 0, bestFitEquationData);
                        }
                        if (bestFitData.curve) {
                            _.each(bestFitData.curve, function(value) {
                                if (value.selected === true) {
                                    bestFitEquationData = value.equationData;
                                    bestFitEquationData.changeColor(undoRedoData.color);
                                    bestFitEquationData.trigger('best-fit-equation-color-change', void 0, bestFitEquationData);
                                }
                            });
                        }
                        if (bestFitData.exp && bestFitData.exp.selected === true) {
                            bestFitEquationData = bestFitData.exp.equationData;
                            bestFitEquationData.changeColor(undoRedoData.color);
                            bestFitEquationData.trigger('best-fit-equation-color-change', void 0, bestFitEquationData);
                        }
                        if (bestFitData.polynomial && bestFitData.polynomial.selected === true) {
                            bestFitEquationData = bestFitData.polynomial.equationData;
                            bestFitEquationData.changeColor(undoRedoData.color);
                            bestFitEquationData.trigger('best-fit-equation-color-change', void 0, bestFitEquationData);
                        }
                    }
                    equationData.colorName = undoRedoData.colorName;
                    this._updateWarningForCell($targetCell, {
                        "hasError": false,
                        "errorCode": '',
                        "equationData": equationData,
                        "cid": tableView.cid
                    });
                    this._graphingToolView._gridGraphView.refreshView();
                    if ($colorOptionBox.attr('data-target-equation-data-cid') === equationData.getCid()) {
                        this._updateStyleForCell($colorOptionBox, equationData);
                        this.accManagerView.changeAccMessage($colorOptionBox.find('.graphing-tool-editor-colors-selected').attr('id'), 0, [this.accManagerView.getAccMessage('unselected-text', 0)]);
                        $colorOptionBox.find('.graphing-tool-editor-colors-selected').removeClass('graphing-tool-editor-colors-selected');

                        $colorOptionBox.find("[data-color-name='" + undoRedoData.colorName + "']").addClass('graphing-tool-editor-colors-selected');
                        this.accManagerView.changeAccMessage($colorOptionBox.find('.graphing-tool-editor-colors-selected').attr('id'), 0, [this.accManagerView.getAccMessage('selected-text', 0)]);
                    }
                    this._setColumnColorForCharts(tableView, $targetCell, equationData);
                    tableView.trigger('color-changed');
                    $colorOptionBox.find('.selected-color').css({
                        "background-color": equationData.getColor()
                    });
                    break;
                case 'tableColumnStyleChange':
                    equationData = undoRedoData.equationData;
                    plotObj = equationData.getPlot();
                    if (equationData.getStyleType() === 'line' && plotObj.getPoints()) {
                        //showpoints
                        this.checkIfChangeInPoint([], plotObj.getPoints().slice());
                    }
                    equationData.setStyleType(undoRedoData.styleType);
                    if (undoRedoData.styleType === 'line') {
                        this.checkIfChangeInPoint(plotObj.getPoints().slice(), []);
                    }
                    $targetCell = this.$("[data-equation-cid='" + equationData.getCid() + "']");
                    $list = $targetCell.parents('.list');
                    tableView = this._getTableViewObject($list);
                    this._handleTableStyleType(equationData, equationData.getStyleType(), true);
                    this._graphingToolView._gridGraphView.refreshView();
                    this._updateWarningForCell($targetCell, {
                        "hasError": false,
                        "errorCode": '',
                        "equationData": equationData,
                        "cid": tableView.cid
                    });
                    $styleParent = this.$('.graphing-tool-editor-color-style-box-table');
                    if ($styleParent.attr('data-target-equation-data-cid') === equationData.getCid()) {
                        this._updateStyleForCell($styleParent, equationData);
                    }
                    break;
                case 'hideShowTable':
                    $list = this.$("[data-equation-cid='" + undoRedoData.targetCid + "']");
                    this.$('.graphing-tool-editor-color-style-box-table').hide();
                    tableView = this._getTableViewObject($list);
                    if (tableView.model.get('eyeOpen') === true) {
                        tableView.model.set('showTable', false);
                        tableView.model.set('eyeOpen', false);
                        tableView.trigger('table-hidden');
                        this._hideTableGraph($list, tableView);
                        $list.find('.show-hide-equation').addClass('graph-hidden');
                    } else {
                        tableView.model.set('eyeOpen', true);
                        $list.find('.show-hide-equation').removeClass('graph-hidden');
                        tableView.trigger('table-shown');
                        if (tableView.model.get('lineOptionSelected') === true) {
                            tableView.model.set('showTable', true);
                            this._showTableGraph($list, tableView);
                        }
                    }
                    break;
                case 'tableFunctionLabelChange':
                    $list = this.$('.cell[data-equation-cid="' + undoRedoData.target + '"]').parents('.list');
                    tableObject = this._getTableViewObject($list);
                    tableObject.changeLabelOfFunctionOption(undoRedoData.colNo);
                    this._tableFunctionLabelChange(tableObject, undoRedoData.colNo, true);
                    this.accManagerView.unloadScreen($list.attr('id'));
                    break;
                case 'tableRowHeaderChange':
                    tableObject = this._getTableViewObject(this.$('.list[data-equation-cid="' + undoRedoData.target + '"]'));
                    tableObject.updateMathquillLabel();
                    tableObject.checkRowHeader(true);
                    this._rowHeaderChanged(tableObject, true);
                    isToggleList = true;
                    $toggleList = $list;
                    break;
                case 'sortTableColumn':
                    tableView = this._getTableViewObject(this.$('.list[data-equation-cid=' + undoRedoData.tableCid + ']'));
                    tableView.setTableContent(undoRedoData.tableContent);
                    this._resetTableCellSolution(tableView);
                    this._parseTable(tableView.getCellAt(1, 1), tableView, true, true);
                    break;
                case 'tableCellDataChange':
                    $list = this.$('.cell[data-equation-cid="' + undoRedoData.target + '"]').parents('.list');
                    tableView = this._getTableViewObject($list);
                    colNo = tableView._getColumnNo(undoRedoData.columnCid);
                    $targetCell = $list.find("[data-cell-id=" + undoRedoData.rowNo + "-" + colNo + "]");
                    if (typeof undoRedoData.latex === 'undefined') {
                        undoRedoData.latex = '';
                    }
                    $targetCell.find('.mathquill-editable').mathquill('latex', undoRedoData.latex);
                    this._updateWarningForCell($targetCell, {
                        "hasError": false,
                        "cid": tableView.cid
                    });
                    if (typeof undoRedoData.colContent !== 'undefined') {
                        $column = tableView.getColumn(colNo);
                        tableView.enableAllCellsInColumn(colNo);
                        noOfRows = $column.length;
                        for (rowCounter = 1; rowCounter < noOfRows; rowCounter++) {
                            cellContent = undoRedoData.colContent[rowCounter - 1];
                            if (typeof cellContent === 'undefined') {
                                cellContent = '';
                            }
                            $cell = $column.eq(rowCounter);
                            tableView.setCellContent($cell, cellContent, false, true);
                            $cell.attr('data-prev-latex', cellContent);
                            this._setCellSolution($cell, tableView);
                        }
                        this._parseTable($targetCell, tableView, true, true);

                    } else {
                        this._parseTable($targetCell, tableView, false, true);
                    }
                    if (tableView.model.get("residualColumnStates")) {
                        residualTableState = tableView.model.get("residualColumnStates")[tableView._getColumnCid(colNo)];
                    }
                    if (residualTableState) {
                        residualTableStateKeys = Object.keys(residualTableState);
                        residualTableStateKeysLength = residualTableStateKeys.length;
                        for (index = 0; index < residualTableStateKeysLength; index++) {
                            if (residualTableState[residualTableStateKeys[index]].isDeleted) {
                                residualTableState[residualTableStateKeys[index]].selected = true;
                                this._updateResidualColumns({
                                    "equationData": residualTableState[residualTableStateKeys[index]].residualEquationData,
                                    "tableView": tableView,
                                    "undoResiduals": residualTableStateKeys[index],
                                    "isUndoRedoAction": true,
                                    "points": residualTableState[residualTableStateKeys[index]].points
                                });
                            }
                        }

                    }
                    isToggleList = true;
                    this._graphingToolView._hidePopUps();
                    $toggleList = $list;
                    this._adjustTableHeaderHeightForIE(tableView);
                    this.handleDependentColumn($list, $targetCell, true);
                    break;
                case 'tableColDataChange':
                    $targetCell = this.$('.cell[data-equation-cid="' + undoRedoData.target + '"]');
                    $list = $targetCell.parents('.list');
                    tableView = this._getTableViewObject($list);
                    tableView.setColumnContent(undoRedoData.colNo, undoRedoData.colData);
                    this._resetColumnCellSolution(undoRedoData.colNo, tableView);
                    this._parseTable($targetCell, tableView, true, true);
                    isToggleList = true;
                    $toggleList = $list;
                    break;
                case 'tableThicknessChange':
                    equationData = undoRedoData.equationData;
                    thickness = parseInt(undoRedoData.thickness, 10);
                    plotObj = equationData.getPlot();
                    plotObj.changeThickness(thickness);
                    equationData.changeThickness(thickness);
                    equationData.setThickness(thickness);
                    plotObj.setThickness(thickness);
                    this._graphingToolView._gridGraphView.refreshView();
                    $styleParent = this.$('.graphing-tool-editor-color-style-box-table');
                    if ($styleParent.attr('data-target-equation-data-cid') === equationData.getCid()) {
                        this._updateStyleForCell($styleParent, equationData);
                    }
                    break;
                case 'bestFitLine':
                    this.handleBestFitAndResiduals(undoRedoData);
                    break;
                case 'bestFitEquationListEditable':
                    equationData = undoRedoData.equationData;
                    tableColEquationDataCid = undoRedoData.tableColEquationDataCid;
                    bestFitType = undoRedoData.bestFitType;
                    degree = undoRedoData.degree;
                    $list = this.$('div[data-equation-cid="' + equationData.getCid() + '"]');
                    // Get table list
                    $targetList = this.$('div[data-equation-cid="' + tableColEquationDataCid + '"]').parents('.list');
                    tableView = this._getTableViewObject($targetList);
                    if (tableView.model.get('residualColumnStates')) {
                        residualColumnStates = tableView.model.get('residualColumnStates')[tableColEquationDataCid];
                    }
                    tableColEquationData = this._getEquationDataUsingCid(tableColEquationDataCid);
                    plotObj = tableColEquationData.getPlot();
                    if (undoRedoData.actionType === 'makeListNonEditable') {
                        equationData.setVisible(tableColEquationData.getCurveVisibility() || tableColEquationData.getPlot().getPointVisibility());
                        this._makeEquationBoxNonEditable($list);
                        // Set list header description
                        latex = this._createBestFitListHeader(tableView, bestFitType, degree);
                        $list.find('.list-header-description').mathquill('editable').mathquill('revert').mathquill().mathquill('latex', latex);
                        // Add disable dependencies
                        $list.addClass('disabled').attr({
                            "table-col-equationdata-cid": tableColEquationDataCid,
                            "bestFitType": bestFitType
                        });
                        if (degree) {
                            $list.attr('degree', degree);
                        }
                        $list.find('.list-options-container .change-graph-style').removeClass('visible');
                        if (!this._isListCollapsed($list)) {
                            this._toggleList($list);
                        }
                        // update bestFit MenuItem
                        this._selectBestFitEquationMenuItem($targetList, equationData, tableColEquationDataCid, bestFitType, degree);
                        if (!equationData.getCurveVisibility()) {
                            this._hideTableGraph($targetList, tableView);
                        }
                        if (undoRedoData.residualData) {
                            this.deleteColumnDependency(this.$('.cell[data-equation-cid=' + residualColumnStates[undoRedoData.residualData].residualEquationData.cid + ']'), tableView);
                            tableView.deleteCol(undoRedoData.addedColumnNo[0]);
                            //delete col
                            tableView.deleteCol(undoRedoData.addedColumnNo[0]);
                            residualColumnStates[undoRedoData.residualData].selected = true;
                            this._updateResidualColumns({
                                "equationData": tableColEquationData,
                                "tableView": tableView,
                                "undoResiduals": [undoRedoData.residualData]
                            });
                        }
                        tableView.trigger('data-changed');
                        // Update chart
                        tableView.trigger('draw-best-fit-chart', bestFitType, degree, tableColEquationDataCid);
                    } else {
                        this._makeBestFitEquationEditable(void 0, $list, false);
                    }
                    break;
                case 'sortableChange':
                    targetCid = this.$('.list[data-equation-cid="' + undoRedoData.target + '"]');
                    prevCid = this.$('.list[data-equation-cid="' + undoRedoData.prev + '"]');
                    if (prevCid.length === 0) {
                        this.$('#list-box').prepend(targetCid);
                    } else {
                        targetCid.insertAfter(prevCid);
                    }
                    this._updateHandles();
                    break;
                case 'changeColor':
                    equationData = undoRedoData.equationData;
                    equationCid = equationData.getCid();
                    $list = this.$('#list-box div[data-equation-cid=' + equationCid + ']');
                    $colorOptionBox = this.$('.graphing-tool-editor-color-style-box-equation');
                    $colorOptionBox.find('.normal-curve')
                        .removeClass('graphing-tool-editor-styles-' + equationData.colorName + '-curve-graph graphing-tool-editor-styles-' + equationData.colorName + '-curve-graph-selected');
                    $colorOptionBox.find('.dashed-curve')
                        .removeClass('graphing-tool-editor-styles-' + equationData.colorName + '-dashed-graph-selected graphing-tool-editor-styles-' + equationData.colorName + '-dashed-graph');
                    equationData.changeColor(undoRedoData.color);
                    equationData.colorName = undoRedoData.colorName;
                    this._updateWarning($list, equationData);
                    $styleParent = this.$('.graphing-tool-editor-color-style-box-equation');
                    if ($styleParent.attr('data-target-equation-data-cid') === equationCid) {
                        this._updateStyleForList($styleParent, equationData);
                        this.accManagerView.changeAccMessage($colorOptionBox.find('.graphing-tool-editor-colors-selected').attr('id'), 0, [this.accManagerView.getAccMessage('unselected-text', 0)]);
                        $colorOptionBox.find('.graphing-tool-editor-colors-selected').removeClass('graphing-tool-editor-colors-selected');
                        $colorOptionBox.find("[data-color-name='" + undoRedoData.colorName + "']").addClass('graphing-tool-editor-colors-selected');
                        this.accManagerView.changeAccMessage($colorOptionBox.find('.graphing-tool-editor-colors-selected').attr('id'), 0, [this.accManagerView.getAccMessage('selected-text', 0)]);
                    }
                    $colorOptionBox.find('.selected-color').css({
                        "background-color": equationData.getColor()
                    });
                    this._graphingToolView._gridGraphView.refreshView();
                    break;
                case 'graphThicknessChange':
                    equationData = undoRedoData.equationData;
                    equationCid = equationData.getCid();
                    thickness = parseInt(undoRedoData.thickness, 10);
                    if (thickness !== equationData.getThickness()) {
                        equationData.changeThickness(thickness);
                    }
                    this._graphingToolView._gridGraphView.refreshView();
                    $styleParent = this.$('.graphing-tool-editor-color-style-box-equation');
                    if ($styleParent.attr('data-target-equation-data-cid') === equationCid) {
                        this._updateStyleForList($styleParent, equationData);
                    }
                    break;
                case 'toggleDashedGraph':
                    undoRedoData.showGraph();
                    undoRedoData.toggleDashedGraph();
                    $list = this.$('#list-box div[data-equation-cid=' + undoRedoData.cid + ']');
                    this._updateWarning($list, undoRedoData);
                    break;
                case 'graphStyleChange':
                    equationData = undoRedoData.equationData;
                    if (undoRedoData.lineClass) {
                        equationData.normalGraph();
                    } else {
                        equationData.dashedGraph();
                    }
                    equationCid = equationData.getCid();
                    $list = this.$('#list-box div[data-equation-cid=' + equationCid + ']');
                    this._setGraphStyleLineClass($list, equationData);
                    $styleParent = this.$('.graphing-tool-editor-color-style-box-equation');
                    if ($styleParent.attr('data-target-equation-data-cid') === equationCid) {
                        this._updateStyleForList($styleParent, equationData);
                    }
                    this._graphingToolView._gridGraphView.refreshView();
                    break;
                case 'hideShowGraph':
                    if (undoRedoData.getCurveVisibility()) {
                        undoRedoData.hideGraph();
                        if (undoRedoData.getSpecie() === 'point') {
                            this.checkIfChangeInPoint(undoRedoData.getPoints(), []);
                        }
                        this._hideCriticalPoints(undoRedoData, true);
                    } else {
                        undoRedoData.setCurveVisibility(true);
                        if (undoRedoData.getSpecie() !== 'point') {
                            undoRedoData.trigger('plot-equation');
                        } else {
                            undoRedoData.showGraph();
                            this.checkIfChangeInPoint([], undoRedoData.getPoints());
                        }
                        this._showCriticalPoints(undoRedoData);
                    }
                    $list = this.$('#list-box div[data-equation-cid=' + undoRedoData.cid + ']');
                    this._updateWarning($list, undoRedoData);
                    if (this.$('.graphing-tool-editor-color-style-box').length > 0) {
                        this.$('.graphing-tool-editor-color-style-box').hide();
                        this.$('#input-data-extension').height(0);
                        this.$('#input-data').removeClass('input-data-scroll-hidden');
                    }
                    undoRedoData.trigger('redraw-graph');
                    this._updateListWidth();
                    break;
                case 'sliderLimitChanged':
                case 'sliderDrag':
                case 'deleteSlider':
                case 'sliderDataChange':
                case 'sliderAppendAll':
                case 'sliderLimitsStepChange':
                    this._sliderPanel.execute(actionName, undoRedoData, true);
                    break;
                case 'deleteAll':
                    this._deleteAll();
                    this._sliderPanel.execute('deleteAll', undoRedoData.sliderData, true);
                    projectorMode = undoRedoData.projectorMode;
                    for (undoRedoCounter = 0; undoRedoCounter < undoRedoData.length; undoRedoCounter++) {
                        switch (undoRedoData[undoRedoCounter].actionType) {
                            case 'deleteList':
                                shouldRtrieve = true;
                                undoRedoCounter = undoRedoData.length;
                                break;
                            case 'addList':
                                $list = this._createListWithEditor(false, false);
                                $targetList = this.$('div[data-equation-cid=' + undoRedoData[undoRedoCounter].target + ']');
                                $upadatedList = this._setListData($list, undoRedoData[undoRedoCounter]);
                                equationData = undoRedoData[undoRedoCounter].equationData;
                                equationData.setUnits({
                                    "angle": equationDataUnit
                                });
                                if (undoRedoData[undoRedoCounter].index === 1) {
                                    $firstList = $listBox.find('.list').first();
                                    $firstList.remove();
                                }
                                $listBox.append($upadatedList);
                                this._createAccDivForList($upadatedList, false);
                                $upadatedList.find('.mathquill-editable').mathquill('latex', undoRedoData[undoRedoCounter].equation);
                                this._parseAndPlotEquationData(equationData, $upadatedList);
                                if (projectorMode === true && this._projectorMode !== true) {
                                    equationData.changeThickness(equationData.getPreviousThickness());
                                }
                                if (undoRedoData[undoRedoCounter].sliderData) {
                                    sliderView = this._getSliderViewObject($upadatedList);
                                    if (sliderView) {
                                        sliderView.setLimits(undoRedoData[undoRedoCounter].sliderData);
                                    }
                                }
                                break;
                            case 'deleteTable':
                                shouldRtrieve = true;
                                undoRedoCounter = undoRedoData.length;
                                break;
                            case 'addTable':
                                $lastFocusedMathquill = this.model.get('cursorClassTag');
                                $lastFocusedList = $lastFocusedMathquill.parents('.list');
                                this._blurMathquill(this.$('.hasCursor'));
                                this._blurMathquill($lastFocusedMathquill);
                                this._blurListBox(this._getMappedEquationData($lastFocusedList), $lastFocusedList);
                                tableState = undoRedoData[undoRedoCounter].tableState;
                                tableRows = tableState.rows;
                                tableCols = tableState.cols;
                                hiddenColumns = tableState.hiddenColumns;
                                hiddenColumnsLength = hiddenColumns.length;
                                addResidualTypes = ['line', 'polynomial', 'exp'];
                                tableContent = tableState.content;
                                tableEquationData = undoRedoData[undoRedoCounter].equationData;
                                $upadatedList = this._createTableList(tableRows, tableCols, $dummyList, tableState.tableName);
                                $upadatedList.attr('data-equation-cid', undoRedoData[undoRedoCounter].tableList);
                                if (undoRedoData[undoRedoCounter].index === 1) {
                                    $firstList = $listBox.find('.list').first();
                                    $firstList.remove();
                                }
                                $listBox.append($upadatedList);
                                tableObject = this._getTableViewObject($upadatedList);
                                this._createAccDivForList($upadatedList, true, tableObject);
                                tableObject.setHeader(tableContent[0]);
                                if (tableState.rowHeaderState === true) {
                                    tableObject.checkRowHeader(true);
                                }
                                for (i = 0; i < tableCols; i++) {
                                    $cell = tableObject.getCellAt(1, i + 1);
                                    this._setTableEquationData(tableEquationData[i], $cell);
                                    tableEquationData[i].setLatex(tableContent[0][i], true);
                                    tableEquationData[i].setUnits({
                                        "angle": equationDataUnit
                                    });
                                    tableObject.setColumnColor(i, tableEquationData[i].getColor());
                                    if (projectorMode === true && this._projectorMode !== true) {
                                        tableEquationData[i].changeThickness(equationData.getPreviousThickness());
                                    }
                                    if (tableObject.getRowHeaderState() && $cell.is('.col1')) {
                                        this._addLabelClassToMathquill($cell);
                                    }
                                }
                                for (i = 1; i <= tableCols; i++) {
                                    for (j = 1; j <= tableRows; j++) {
                                        if (i === 1 && j === 1) {
                                            continue;
                                        }
                                        $cell = tableObject.getCellAt(j, i);
                                        tableObject.setData([{
                                            "object": $cell,
                                            "data": tableContent[j - 1][i - 1]
                                        }]);
                                        if (tableObject.getRowHeaderState() && $cell.is('.col1')) {
                                            this._addLabelClassToMathquill($cell);
                                        }
                                    }
                                }
                                if (tableState.eyeOpen === false) {
                                    tableObject.setTableVisiblity(false);
                                    $upadatedList.find('.show-hide-equation').addClass('graph-hidden');
                                }
                                this._resetTableCellSolution(tableObject);
                                functionOptions = tableState.functionLabelOptions;
                                for (functionOption in functionOptions) {
                                    tableObject.changeLabelOfFunctionOption(functionOption, functionOptions[functionOption]);
                                }
                                tableList.push({
                                    "upadatedList": $upadatedList,
                                    "undoRedoCounter": undoRedoCounter
                                });
                                this._parseTable(tableObject.getCellAt(1, 1), false, true, true);
                                break;
                        }
                    }
                    if (undoRedoData[undoRedoCounter - 1]) {
                        this._updateBestFitPositions(undoRedoData[undoRedoCounter - 1].bestFitInfo);
                    }
                    if ($upadatedList) {
                        $upadatedList.find('.list-handle').removeClass('warning-list-focus list-sortable').addClass('warning-list-focus').find('.list-drag').show();
                        $upadatedList.find('.equation-box').removeClass('equation-box-focus').addClass('equation-box-focus');
                        $upadatedList.addClass('list-focus');
                        $upadatedList.find('.list-drag').hide();
                        $upadatedList.find('textarea:last').focus();
                    }
                    if (shouldRtrieve && undoRedoData.retrieveState !== void 0) {
                        this._graphingToolView.retrieveState(undoRedoData.retrieveState, true);
                    }
                    this._updateHandles();
                    for (counter = 0; counter < tableList.length; counter++) {
                        $upadatedList = tableList[counter].upadatedList;
                        tableObject = this._getTableViewObject($upadatedList);
                        tableCols = tableObject.getColCount();
                        undoRedoCounter = tableList[counter].undoRedoCounter;
                        tableEquationData = undoRedoData[undoRedoCounter].equationData;
                        tableObject.model.set('chartBestFit', undoRedoData[undoRedoCounter].chartBestFit);
                        this._retrieveCharts(tableObject, undoRedoData[undoRedoCounter].chartData);
                        tableObject.model.set('residualColumnStates', undoRedoData[undoRedoCounter].residualColumnStates);
                        for (i = 0; i < tableCols; i++) {
                            $cell = tableObject.getCellAt(1, i + 1);
                            if (!$cell.attr("data-ignore-column")) {
                                this._updateResidualColumns({
                                    "equationData": tableEquationData[i],
                                    "tableView": tableObject,
                                    "undoResiduals": addResidualTypes,
                                    "actionType": undoRedoData[counter].actionType
                                });
                                if (tableEquationData[i].getResidualColumnNo() && tableContent[0][i] === " Residual") {
                                    tableObject.disableCell($cell);
                                    tableObject.disableAllCellsInColumn(i + 1);
                                    $cell.find('.function-btn, .handler-warning').hide();
                                }
                            }
                        }
                        for (index = 0; index < hiddenColumnsLength; index++) {
                            this._hideTableColumn(hiddenColumns[index], tableObject);
                        }

                        this._hideShowColumnGraphForEntireTable(tableObject, tableState.plotColumnHidden, _equationDataManager);
                        if (!undoRedoData[undoRedoCounter].isLineChartSelected) {
                            tableObject.model.set('lineOptionSelected', undoRedoData[undoRedoCounter].isLineChartSelected);
                            tableObject.trigger('hide-table-graph');
                            tableObject.$('.graph-table-line-btn').removeClass('selected');
                            tableObject.$('.graph-table-line-btn').parent('.chart-btns').removeClass('selected');
                        }
                        this._updateListWidth($upadatedList.find('.equation-box').outerWidth());
                        this._adjustTableHeaderHeightForIE(tableObject);
                        this.model.set('cursorClassTag', $upadatedList.find('textarea:last').parents('.mathquill-editable'));
                        tableObject.model.set('residualColumnDependency', undoRedoData[counter].residualColumnDependency);
                    }
                    break;
                case 'bestFitAndResidualColumn':
                    this.handleBestFitAndResiduals(undoRedoData);
                    break;
            }
            // if target list is collapsed, then expands it.
            if (isToggleList && typeof $toggleList !== 'undefined') {
                if (this._isListCollapsed($toggleList)) {
                    this._toggleList($toggleList);
                    $toggleList.find('.change-graph-style').addClass('visible');
                }
                if ($toggleList.attr('data-type') === 'table') {
                    rowWidth = $toggleList.find('[data-row-id=row1]').width();
                    if (rowWidth !== 0) {
                        $toggleList.find('.table-button-container').width(rowWidth);
                    }
                }
            }
        },
        "isKeyboardVisible": function() {
            return this.model.get('keyboardView').$el.is(':visible');
        },
        "hasListBox": function(equationCid) {
            return this.$('.list[data-equation-cid=' + equationCid + ']').length !== 0;
        },
        "_retrieveCharts": function(tableView, charts, isFromSaveState, isColumnHidden) {
            var chartCounter,
                chartObj,
                noOfCharts,
                $gridGraph = $('#grid-graph'),
                gridOffset = $gridGraph.offset(),
                gridHt = $gridGraph.height(),
                gridWidth = $gridGraph.width(),
                maxWidth,
                maxHeight,
                objParam = {},
                retrieveChartFunction = function(value, index) {
                    if (isFromSaveState) {
                        index = tableView._getColumnNo(index);
                    }
                    if (charts[chartCounter].data[index]) {
                        value.setChartData(charts[chartCounter].data[index], tableView);
                    }
                };
            _.each(charts, function(value) {
                if (value.data.chartOptionsData) {
                    value.data = {
                        '1': value.data
                    };
                    value.data[1].isVisible = true;
                }
                _.each(value.data, function(chart) {
                    if (chart && chart.chartPosition.type !== "relative" && !isColumnHidden) {
                        chart.chartPosition.left -= 350; // 350 previous default value for chart left offset
                    }
                    if (chart && isFromSaveState) {
                        maxWidth = gridWidth - (chart.chartPosition.left - gridOffset.left);
                        maxHeight = gridHt - (chart.chartPosition.top - gridOffset.top);
                        if (chart.chartSize.chart.height > maxHeight || chart.chartSize.chart.width > maxWidth) {
                            chart.chartPosition.left = 0;
                            chart.chartPosition.top = 0;
                        }
                    }
                });
            });
            if (charts) {
                objParam.tableView = tableView;
                objParam.isUndoRedoAction = true;
                noOfCharts = charts.length;
                for (chartCounter = 0; chartCounter < noOfCharts; chartCounter++) {
                    objParam.chartName = charts[chartCounter].name;
                    chartObj = this._chartManagerView._chartHandler(objParam);
                    _.each(chartObj.view, retrieveChartFunction);
                    tableView.selectChartButton(objParam.chartName);
                }
            }
        },
        "execute": function(actionName, undoRedoData, skipRegistration) {
            if (!skipRegistration) {
                this._graphingToolView.execute(actionName, undoRedoData);
            }
        }
    });
})(window.MathUtilities);
