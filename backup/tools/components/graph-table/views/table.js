/* globals _, $, window  */

(function(MathUtilities) {
    "use strict";
    /**
     * Provides the base class for graph-table.
     *
     * @module MathUtilities.Components.GraphTable
     */
    MathUtilities.Components.GraphTable = {};

    /**
     * Provides a `Models` submodule for the base class GraphTable.
     *
     * @submodule MathUtilities.Components.GraphTable.Models
     */
    MathUtilities.Components.GraphTable.Models = {};
    /**
     * Provides a `Views` submodule for the base class GraphTable.
     *
     * @submodule MathUtilities.Components.GraphTable.Views
     */
    MathUtilities.Components.GraphTable.Views = {};
    /**
     * Provides a `templates` submodule for the base class GraphTable.
     *
     * @submodule MathUtilities.Components.GraphTable.templates
     */
    MathUtilities.Components.GraphTable.templates = {};

    /**
     * Creates a table view.
     *
     * @class MathUtilities.Components.GraphTable.Views.Table
     * @extends Backbone.View
     * @constructor
     */
    MathUtilities.Components.GraphTable.Views.Table = Backbone.View.extend({
        /**
         * Holds the table's model object for this view.
         *
         * @property model
         * @default null
         * @type Object
         */
        "model": null,
        "maxRows": 100,
        "maxColumns": 5,
        "tableCounter": 0,
        "showCopyBtn": false,
        "showChartBtns": true,
        "maxColumnCheck": false,
        "TouchSimulator": MathUtilities.Components.Utils.TouchSimulator,
        /**
         * Acts as the constructor for this view, is initialized when this view's object is created.
         *
         * @method initialize
         */
        "initialize": function() {
            var $chartBtns = null;
            this.model = new MathUtilities.Components.GraphTable.Models.Table({
                "colCount": this.options.cols,
                "oEditorParam": this.options.oEditorParam
            });
            this.accManagerView = this.options.accManagerView;
            this.equationPanel = this.options.equationPanel;
            this.tableCounter = this.options.tableCounter;
            this.showCopyBtn = this.options.showCopyBtn;
            this.addTableName();
            this.addRowHeaderCheckBox();
            this._createTable(this.options.rows, this.options.cols);
            this._showCopyBtn();
            this._showChartBtns();
            this.addFunctionOptions();
            this.$el.addClass("math-utilities-components-graph-table")
                .on("mousedown", ".cell", _.bind(this._setFocusToCell, this));
            this.maxColumns = this.options.maxColumns;
            this.maxRows = this.options.maxRows;
            this.on("data-table-changed", this.selectTableBtn)
                .on("set-bestfit-chart", _.bind(this._setBestFit, this))
                .on("cell-data-set", _.bind(this.setCellDataArray, this));
            this.$(".chart-btns").each(_.bind(function(counter, value) {
                this.TouchSimulator.enableTouch(value, {
                    "specificEvents": this.TouchSimulator.SPECIFIC_EVENTS.UP_DOWN
                });
            }, this));
            this.TouchSimulator.enableTouch(this.$('.function-btn'), {
                "specificEvents": this.TouchSimulator.SPECIFIC_EVENTS.UP_DOWN
            });
            this.bindEventsForButtons();
            this.off("chart-close-btn-clicked").on("chart-close-btn-clicked", _.bind(this._closeChart, this));
        },

        "_closeChart": function(chartName, isChartVisible, currentTarget) {
            var $currentButton;
            this.$(".chart-btns").each(function() {
                $currentButton = $(this);
                if ($currentButton.attr("data-chart-name") === chartName) {
                    $currentButton.trigger("click", {
                        "isChartVisible": isChartVisible,
                        "currentTarget": currentTarget
                    });
                }
            });
        },

        "removeSelectedClass": function(chartName) {
            this.$(".graph-table-" + chartName).removeClass("selected").children().removeClass("selected");
        },
        "addRowHeaderCheckBox": function() {
            var rowHeaderCheckBox = MathUtilities.Components.GraphTable.templates["graph-table"]({
                "rowHeaderCheckShow": true,
                "cid": this.cid
            }).trim();
            this.$el.append(rowHeaderCheckBox);
        },
        "addTableName": function() {
            var tableName = MathUtilities.Components.GraphTable.templates["graph-table"]({
                "showTableText": true,
                "cid": this.cid
            }).trim();
            this.$el.append(tableName);
            this.model.set("tableName", "Table " + this.tableCounter);
        },
        "addFunctionOptions": function() {
            var functionOptions = MathUtilities.Components.GraphTable.templates["graph-table"]({
                "showFunctionOption": true,
                "cid": this.cid
            }).trim();
            this.$el.append(functionOptions);

            this.$(".function-option-container").hide();
        },
        "_showCopyBtn": function() {
            var copyBtn = MathUtilities.Components.GraphTable.templates["graph-table"]({
                "drawCopyBtn": true,
                "cid": this.cid
            }).trim();
            this.$(".table-button-container").append(copyBtn);
        },

        "_showChartBtns": function() {
            var chartBtns;
            if (this.showChartBtns === true) {
                chartBtns = MathUtilities.Tools.Graphing.templates["chart-buttons"]({
                    "cid": this.cid
                }).trim();
                this.$el.append(chartBtns);

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
        /**
         * Binds a collection of events and functionalities.
         *
         * @property events
         * @type Object
         */
        "events": {
            "click .function-btn": "showFunctionDropdown",
            "click .function-option": "setLabelOfFunctionOption",
            "click .row-header-check-container": "checkRowHeader",
            "mousedown .row-header-check-container": "updateMathquillLabel",
            "click .copy-data-btn": "copyTableData",
            "click .chart-btns": "_chartBtnClicked",
            "click .remove-row": "_removeRowClicked",
            "mouseenter .function-option": "_hoverFunctionOption",
            "mouseleave .function-option": "_removeHoverFunctionOption",
            "keydown .col-function": "_setFocusOnShiftTabOnFunction",
            "mousedown .common-chart-button": "_chartButtonClickHandler",
            "keydown .col-label": "_setFocusOnTabOnLabel",
            "focusin .chart-btns": "_changeMessageForChartBtns",
            "keydown .chart-btns": "_setFocusOnchart"
        },
        "_hoverFunctionOption": function(event) {
            this.$(event.currentTarget).addClass('hover-effect-drop-down');
        },
        "_removeHoverFunctionOption": function(event) {
            this.$(event.currentTarget).removeClass('hover-effect-drop-down');
        },

        "setCellDataArray": function(rowNo, colNo, solution, $cell, isIgnoreRow) {

            var model = this.model,
                tableContents = model.get("tableContents");
            if (!isIgnoreRow) {
                tableContents[(colNo - 1)][(rowNo - 1)] = solution;
                model.set("tableContents", tableContents);

            }
            this.setCopyBtnContainerWidth();
        },
        /**
         * Creates the default 2x2 table OR if dimensions given creates a rowXcols table.
         *
         * @method _createTable
         * @private
         * @param {Number} [rows] Number of rows.
         * @param {Number} [cols] Number of cols.
         */
        "_createTable": function(rows, cols) {
            var index = 0,
                newRowButton, model = this.model,
                tableContents, loopVar,
                columnFunctionOption = model.get("columnFunctionOption");
            rows = rows || this.options.rows;
            tableContents = model.get("tableContents");
            if (cols) {
                for (loopVar = 0; loopVar < cols; loopVar++) {
                    tableContents.push([]);
                    if (loopVar > 0) {
                        columnFunctionOption[loopVar + 1] = 'F';
                    }
                }
            } else {
                tableContents.push([], []);
                columnFunctionOption[2] = 'F';
            }
            model.set("tableContents", tableContents);
            if (!rows) {
                return void 0;
            }
            newRowButton = MathUtilities.Components.GraphTable.templates["graph-table"]({
                "drawRowButton": true,
                "cid": this.cid
            }).trim();
            this.$el.append(newRowButton);
            newRowButton = $(newRowButton).find(".new-row");
            newRowButton.hover(function() {
                    newRowButton.addClass("hovered");
                },
                function() {
                    newRowButton.removeClass("hovered activated");
                }
            ).on("mousedown", function() {
                newRowButton.addClass("activated");
            }).on("mouseup mouseleave", function() {
                newRowButton.removeClass("activated");
            });
            this.TouchSimulator.enableTouch(newRowButton, {
                "specificEvents": this.TouchSimulator.SPECIFIC_EVENTS.UP_DOWN
            });

            for (; index < rows; index++) {
                this._addRow(rows, cols);
            }
        },
        "copyTableData": function() {
            var $copybtn = this.$(".copy-data-btn");
            this.trigger("copy-table");

        },
        "setLabelOfFunctionOption": function(event) {
            var $currRow = this.$el.find("[data-row-id=row1]"),
                dropDownColIndex, $currCell,
                $target = $(event.currentTarget),
                model = this.model,
                msg,
                currFunctionBtn, $funcBtnContainer, columnFunctionOption = model.get('columnFunctionOption');

            $funcBtnContainer = this.$(".function-option-container");
            dropDownColIndex = $currRow.attr('data-drop-down-shown-index');
            currFunctionBtn = this.$el.find('#1-' + dropDownColIndex + "-of-" + this.cid).find('.function-btn');

            if ($target.hasClass('col-label')) {
                currFunctionBtn.find('.function-btn-text').addClass('labelBtn');
                columnFunctionOption[dropDownColIndex] = 'L';
                this.enableAllCellsInColumn(dropDownColIndex);
                msg = this.accManagerView.getAccMessage('table-equation-panel-messages', 7, [this.accManagerView.getMessage('label-text', 0),
                    this.accManagerView.getMessage('function-text', 0)
                ]);
            } else {
                currFunctionBtn.find('.function-btn-text').removeClass('labelBtn');
                columnFunctionOption[dropDownColIndex] = 'F';
                msg = this.accManagerView.getAccMessage('table-equation-panel-messages', 7, [this.accManagerView.getMessage('function-text', 0),
                    this.accManagerView.getMessage('label-text', 0)
                ]);
            }
            if (currFunctionBtn.find('.acc-read-elem').length > 0) {
                this.accManagerView.setAccMessage(currFunctionBtn.attr('id'), msg);
            }
            model.set("columnFunctionOption", columnFunctionOption);
            this.trigger("function-dropdown-closed");
            $funcBtnContainer.hide();
            this.trigger("function-option-btn-clicked", dropDownColIndex);
            if (!event.which) {
                this.accManagerView.setFocus(currFunctionBtn.attr('id'));
            } else {
                this.$el.parents('.math-utilities-components-tool-holder').focus(10);
            }
        },
        "_setFocusOnTabOnLabel": function(event) {
            var $currRow = this.$el.find("[data-row-id=row1]"),
                dropDownColIndex, $cell, rowColumnNo, rowNo, columnNo, cellIdToFocus,
                currFunctionBtn;

            dropDownColIndex = $currRow.attr('data-drop-down-shown-index');
            currFunctionBtn = this.$el.find('#1-' + dropDownColIndex + "-of-" + this.cid).find('.function-btn');
            $cell = currFunctionBtn.parents('.cell');
            rowColumnNo = $cell.attr('id').split('-');
            rowNo = Number(rowColumnNo[0]);
            columnNo = Number(rowColumnNo[1]);
            if (columnNo === this.getColCount()) {
                rowNo++;
                columnNo = 1;
            } else {
                columnNo = this.getNextVisibleColumn(columnNo);
            }
            cellIdToFocus = rowNo + '-' + columnNo;
            cellIdToFocus = this.$el.find("[data-cell-id=" + cellIdToFocus + "]").attr('id');
            this.trigger('function-label-tab', event, cellIdToFocus);
        },
        "_setFocusOnShiftTabOnFunction": function(event) {
            var $currRow = this.$el.find("[data-row-id=row1]"),
                dropDownColIndex,
                currFunctionBtn, $funcBtnContainer;

            $funcBtnContainer = this.$el.find('.function-option-container');
            dropDownColIndex = $currRow.attr('data-drop-down-shown-index');
            currFunctionBtn = this.$el.find('#1-' + dropDownColIndex + "-of-" + this.cid).find('.function-btn');
            this.trigger('function-shift-tab', event, currFunctionBtn);
        },
        "changeLabelOfFunctionOption": function(colIndex, newOption) {

            var $currCell, currFunctionBtn, model = this.model,
                columnFunctionOption = model.get("columnFunctionOption");
            $currCell = this.$("#1-" + colIndex + "-of-" + this.cid);

            currFunctionBtn = $currCell.find(".function-btn");
            if (newOption) {
                columnFunctionOption[colIndex] = newOption;
                currFunctionBtn.find(".function-btn-text").toggleClass("labelBtn", columnFunctionOption[colIndex] !== "F");
                $currCell.find(".non-italicized-function").toggleClass("label-cell-italicized-function", columnFunctionOption[colIndex] !== "F");

            } else {
                if (columnFunctionOption[colIndex] === 'F') {
                    columnFunctionOption[colIndex] = 'L';
                    currFunctionBtn.find('.function-btn-text').addClass('labelBtn');
                    $currCell.find('.non-italicized-function').addClass('label-cell-italicized-function');
                    $currCell.find('.mathquill-rendered-math .text').addClass('label-cell-italicized-function');
                } else {
                    columnFunctionOption[colIndex] = 'F';
                    currFunctionBtn.find('.function-btn-text').removeClass('labelBtn');
                    $currCell.find('.non-italicized-function').removeClass('label-cell-italicized-function');
                    $currCell.find('.mathquill-rendered-math .text').removeClass('label-cell-italicized-function');
                }
            }
            model.set("columnFunctionOption", columnFunctionOption);
        },
        "getLabelOfFunctionOption": function(colNo) {
            return this.model.get("columnFunctionOption")[colNo];
        },
        "changeTableName": function(newName) {
            this.$(".table-text").html("Table" + newName);
        },

        "updateMathquillLabel": function() {
            this.$('.col1 .non-italicized-function, .col1 .mathquill-rendered-math .text')
                .toggleClass('label-cell-italicized-function', !this.$('.row-header-check').hasClass('row-header-checked'));
        },

        "checkRowHeader": function(suppressEvent) {

            var $checkBox = this.$(".row-header-check-container").find(".row-header-check"),
                message;
            this.model.set('isRowHeaderChange', true);
            if ($checkBox.hasClass("row-header-checked")) {
                $checkBox.removeClass("row-header-checked");
                this.model.set("rowHeaderChecked", false);
                if (suppressEvent !== true) {
                    this.trigger("row-header-unchecked").trigger("row-header-changed");
                }
                message = this.accManagerView.getAccMessage('unchecked-text', 0);
            } else {
                $checkBox.addClass("row-header-checked");
                this.model.set("rowHeaderChecked", true);
                if (suppressEvent !== true) {
                    this.trigger("row-header-checked").trigger("row-header-changed");
                }
                message = this.accManagerView.getAccMessage('checked-text', 0);
            }
            if (this.$('#' + 'row-header-container-of-' + this.cid).find('.acc-read-elem').length !== 0) {
                this.accManagerView.changeAccMessage('row-header-container-of-' + this.cid, 0, [message]);
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setFocus('row-header-container-of-' + this.cid);
            }
        },
        "getRowHeaderState": function() {
            return this.model.get("rowHeaderChecked");
        },
        "_addRow": function(rows, cols) {
            var $row = null,
                $functionLabelOptions,
                $chartBtn,
                rowNo, insertRowAfter,
                loopVar, $buttonHolder,
                model = this.model,
                tableContents = model.get("tableContents"),
                tableCols,
                el = this.el,
                MIN_ROWS = 2,
                counter = 1,
                cid = this.cid,
                colCounter = this.getColCount();
            $buttonHolder = this.$(".table-button-container");
            $chartBtn = this.$(".chart-btns-container");
            $functionLabelOptions = this.$(".function-option-container");
            rowNo = this.getRowCount();
            if (rowNo >= MIN_ROWS) {
                $row = this.insertRowAfter(rowNo);
                if ($row === null || typeof $row === 'undefined') {
                    return void 0;
                }
                insertRowAfter = true;
            } else {
                $row = this.newRow(rows, cols);
            }
            if ($row !== null) {
                if (rowNo < MIN_ROWS) {
                    $buttonHolder.remove();
                    $chartBtn.remove();
                    $functionLabelOptions.remove();
                    $row.appendTo(el);
                    $buttonHolder.appendTo(el);
                    $chartBtn.appendTo(el);
                    $functionLabelOptions.appendTo(el);

                }
                this.trigger("row:created", [this.getRowCount()]);
                $row.find(".cell").first().find("textarea").focus();

            }
            if (!insertRowAfter) {
                tableCols = tableContents.length;
                for (loopVar = 0; loopVar < tableCols; loopVar++) {
                    tableContents[loopVar].push(void 0);
                }
                model.set("tableContents", tableContents);
            }
            this._hideHiddenColumnNewRows();
            this.trigger('data-changed');
            this.bindEventsForButtons();
        },
        "_hideHiddenColumnNewRows": function() {
            this._getHiddenColumns(true);
        },

        "_getHiddenColumns": function(isHide) {
            var hiddenColNumberArray = [],
                $currCol = null,
                totalColCount = this.getColCount(),
                index = null;
            for (index = 1; index <= totalColCount; index++) {
                $currCol = this.getColumn(index);
                if ($currCol.css('display') === 'none') {
                    hiddenColNumberArray.push(index);
                    if (isHide) {
                        $currCol.hide();
                    }
                } else {
                    if ($currCol.hasClass('hidden-column-border')) {
                        $currCol.removeClass('hidden-column-border').addClass('hidden-column-border');
                    }
                }
            }
            return hiddenColNumberArray;
        },


        "_getPlotColumnArrayFromCid": function() {
            var index = null,
                plotColumnNos = [],
                plotcolumnHidden = this.model.get('plotColumnHidden');
            for (index = 0; index < plotcolumnHidden.length; index++) {
                plotColumnNos.push(this._getColumnNo(plotcolumnHidden[index]));
            }
            return plotColumnNos;
        },
        "_getOriginalColumnNo": function(colNo) {
            var index = null,
                colName = null,
                updatedCol = Number(colNo),
                $cell;
            for (index = 1; index < colNo; index++) {
                $cell = this.getColumn(index).eq(0);

                colName = $cell.attr('data-column-name');
                if (colName && /line|polynomial|exp/.test(colName)) {
                    updatedCol--;
                }
            }
            return String(updatedCol);
        },
        "_getOriginalColumnNoArray": function() {
            var index = null,
                plotColumnNos = [],
                plotcolumnHidden = null;
            plotcolumnHidden = this._getPlotColumnArrayFromCid();
            for (index = 0; index < plotcolumnHidden.length; index++) {
                plotColumnNos.push(this._getOriginalColumnNo(plotcolumnHidden[index]));
            }
            return plotColumnNos;
        },
        "_pushPlotColumnCid": function(cid) {
            this.model.get('plotColumnHidden').push(cid);
        },
        "_removePlotColumnCid": function(cid) {
            var plotColumnHidden = this.model.get('plotColumnHidden'),
                index = null;

            index = plotColumnHidden.indexOf(cid);
            if (index !== -1) {
                plotColumnHidden.splice(index, 1);
            }
            return index > -1;
        },
        "addCol": function(e) {

            var totalCols = this.getColCount() + 1,
                model = this.model,
                triggerCheck = false,
                extraCols = model.get('residualColumnCount'),
                tableContents = model.get("tableContents"),
                textareaToFocus,
                tableContentsLength, newColData, loopVar, columnNo,
                counter,
                cid = this.cid,
                rowCounter = this.getRowCount();
            if (this.maxColumnCheck && totalCols - extraCols > this.maxColumns) {
                this.trigger("column:max", this.cid);
                return void 0;
            }
            if (typeof e !== "undefined" && typeof e !== "number") {
                this.newCol(e);
                this.trigger("column:created");
                textareaToFocus = this.$(".row").first().find(".cell").last().find("textarea");
                textareaToFocus.focus();
                triggerCheck = true;
            } else {
                this.newCol(void 0, e);
                this.trigger('column:created', true);
            }
            columnNo = model.get('colCount');
            newColData = [];
            tableContentsLength = tableContents[0].length;
            for (loopVar = 0; loopVar < tableContentsLength; loopVar++) {
                newColData.push(void 0);
            }
            tableContents.push(newColData);
            model.set('tableContents', tableContents);
            if (triggerCheck) {
                this.trigger('data-changed', columnNo);
            }
            this.trigger('col-add-acc', cid, rowCounter, totalCols);
        },

        /**
         * Creates a new row.
         *
         * @method newRow
         * @param {Number} [rows] Total number of rows.
         * @param {Number} [cols] Total number of cols.
         * @return {Object} Returns a row  as an `object`.
         */
        "newRow": function(rows, cols) {

            var totalRows = this.getRowCount(),
                totalCols = this.getColCount(),
                index = 1,
                column = "",
                cellRowClass = "",
                cellColClass = "",
                tableRow,
                colCount,
                model = this.model,
                $newRow, newCol, $header,
                $cell = null,
                tableDataObj = {};

            if (totalRows > this.maxRows) {
                this.trigger("row:max", this.cid);
                return null;
            }


            totalRows++;
            model.set("rowCount", totalRows);
            totalRows = this.getRowCount();
            colCount = cols || totalCols;
            tableRow = MathUtilities.Components.GraphTable.templates["graph-table"]({
                "totalRows": totalRows,
                "drawRow": true,
                "cid": this.cid
            }).trim();
            $newRow = $(tableRow);
            tableDataObj = {
                "rowId": $newRow.attr("id"),
                "cells": []
            };

            for (; index <= colCount; index++) {
                column = index;
                if (totalRows === 1) {
                    cellRowClass = "first-row";
                } else {
                    cellRowClass = "";
                }
                if (index === 1) {
                    cellColClass = "first-col";
                } else {
                    cellColClass = "";
                }
                $cell = this.newCell(totalRows, index, column, cellColClass, cellRowClass, $newRow);
                tableDataObj.cells[index - 1] = {
                    "cellId": $cell.attr("data-cell-id"),
                    "data": ""
                };

                if (totalRows > 1) {

                    $header = this.$(".cell[data-cell-id=" + (totalRows - 1) + "-" + index + "]");
                    if ($header.hasClass("cell-disabled") && $header.attr("data-ignore-cell") !== "true") {
                        this.disableCell($cell);
                    }
                }
            }
            model.get("tableData")[totalRows - 1] = tableDataObj;
            if (totalRows === 1) {
                newCol = MathUtilities.Components.GraphTable.templates["graph-table"]({
                    "drawColButton": true,
                    "cid": this.cid
                }).trim();
                $newRow.append($(newCol));
                $newRow.find('.remove-col').off('click.remove-column').on('click.remove-column', _.bind(this._removeColClicked, this));
                $newRow.find('.new-col').off('click.add-column').on('click.add-column', _.bind(this.addCol, this));
            }
            return $newRow;
        },
        "bindEventsForButtons": function() {
            var $buttonsList = this.$(".graphing-table-button"),
                counter,
                length = $buttonsList.length,
                addHoverClass = function(event) {
                    $(event.currentTarget).addClass("hovered");
                },
                removeHoverClass = function(event) {
                    $(event.currentTarget).removeClass("hovered");
                },
                addActivatedClass = function(event) {
                    var currentTarget = $(event.currentTarget);
                    $(document).off('mouseup.buttonMouseUp').on('mouseup.buttonMouseUp', function() {
                        currentTarget.removeClass('activated hovered');
                        $(this).off('mouseup.buttonMouseUp');
                    });
                    currentTarget.addClass("activated");
                },
                removeActivatedClass = function(event) {
                    $(event.currentTarget).removeClass("activated");
                };
            for (counter = 0; counter < length; counter++) {

                $buttonsList.eq(counter).on("mouseenter", addHoverClass)
                    .on("mouseleave", removeHoverClass)
                    .off("mousedown").on("mousedown", addActivatedClass)
                    .off("mouseup").on("mouseup", removeActivatedClass);
                this.TouchSimulator.enableTouch($buttonsList.eq(counter), {
                    "specificEvents": this.TouchSimulator.SPECIFIC_EVENTS.UP_DOWN
                });

            }
        },
        "insertRowAfter": function(rowNo, isIgnoreRow, doNotFocus) {

            var newRowNumber = this.getRowCount(),
                $newRow = this.newRow(),
                model = this.model,
                tableContents = model.get("tableContents"),
                tableCols,
                $targetRow = this.$(".row[data-row-id=row" + rowNo + "]"),
                loopVar, colCounter, newRowNumber,
                cellToFocus;
            if ($newRow === null || $newRow === void 0) {
                return void 0;
            }
            if ($targetRow.attr("data-ignore-row") === "true" && isIgnoreRow !== true) {
                $targetRow = this.$(".row[data-ignore-row=true]")[0];
                $newRow.insertBefore($targetRow);
                rowNo = rowNo - 5; //5 Rows used to display five point summary to be ignored
            } else {
                $newRow.insertAfter($targetRow);
            }
            if (!isIgnoreRow) {
                tableCols = tableContents.length;
                for (loopVar = 0; loopVar < tableCols; loopVar++) {
                    tableContents[loopVar].splice(rowNo, 0, void 0);
                }
                model.set("tableContents", tableContents);
            }
            this._hideHiddenColumnNewRows();
            this._updateTableCells(rowNo);
            this.trigger("row:created", [rowNo + 1], isIgnoreRow);
            colCounter = this.getColCount();
            this.trigger('row-add-acc', this.cid, colCounter, newRowNumber);
            rowNo++;
            if (doNotFocus !== true) {
                cellToFocus = this.$(".row[data-row-id=row" + rowNo + "]").last().find(".cell").first().find("textarea");
                this.$(".hasCursor").find("textarea").blur();
                cellToFocus.focus();
            }
            return $newRow;
        },
        /**
         * Creates a new column.
         * @method newCol
         * @return void
         */
        "newCol": function(e, colNo, showFunctionBtn) {

            var index = 1,
                rowCount,
                colCount,
                model = this.model,
                $colAdder = null,
                $cell,
                cellRowClass = "",
                cellColClass = "",
                columnFunctionOption = model.get("columnFunctionOption"),
                $el = this.$el,
                totalCols = this.getColCount(),
                $row;
            totalCols++;
            model.set("colCount", totalCols);
            rowCount = this.getRowCount();
            colCount = totalCols;
            for (; index <= rowCount; index++) {

                $row = this.$('.row[data-row-id=row' + index + ']');

                if (index === 1) {
                    cellRowClass = "first-row";
                } else {
                    cellRowClass = "";
                }
                $cell = this.newCell(index, colCount, colCount, cellColClass, cellRowClass, $row, colNo, showFunctionBtn);
                model.get("tableData")[index - 1].cells[totalCols - 1] = {
                    "cellId": $cell.attr("data-cell-id"),
                    "data": ""
                };
                if (index === 1) {
                    $colAdder = $row.find(".table-col-button-container");
                    $colAdder.remove().appendTo($row);
                    $colAdder.find('.remove-col').off('click.remove-column').on('click.remove-column', _.bind(this._removeColClicked, this));
                    $colAdder.find('.new-col').off('click.add-column').on('click.add-column', _.bind(this.addCol, this));
                    this.bindEventsForButtons();
                }
            }
            if (typeof colNo !== "undefined") {
                this._updateTableCells(false, colNo - 1);
                this.disableAllCellsInColumn(colNo);
                this.updateColumnFunctionOption(colNo, false);
            } else {
                this.disableAllCellsInColumn(colCount);
                this.updateColumnFunctionOption(colCount, false);
            }
            this.setCopyBtnContainerWidth();

            this.TouchSimulator.enableTouch(this.$('.function-btn'), {
                "specificEvents": this.TouchSimulator.SPECIFIC_EVENTS.UP_DOWN
            });
        },
        /**
         * Creates a new cell.
         *
         * @method newCell
         * @param {Number} [rows] Total number of rows.
         * @param {Number} [index] current column.
         * @param {Number} [colCount] current column
         * @param {String} [cellColClass] firstColumn class name
         * @param {String} [cellRowClass] firstRow class name
         * @param {Object} [$appendToDiv] div to append cell
         * @param {Number} cell to be insert after the given number cell
         * @param {Boolean} to show function button if cell is column header
         * @return {Object} Returns a cell  as an `object`.
         */
        "newCell": function(totalRows, index, colCount, cellColClass, cellRowClass, $appendToDiv, insertAfter, showFunctionBtn) {

            var $cell, $textContainer,
                functionBtn,
                tableCell = MathUtilities.Components.GraphTable.templates["graph-table"]({
                    "rows": totalRows,
                    "cols": index,
                    "col": "col" + colCount,
                    "firstRow": cellRowClass,
                    "drawCell": true,
                    "firstColumn": cellColClass,
                    "cid": this.cid
                }).trim();
            $cell = $(tableCell);
            $textContainer = $cell.find(".table-cell-text-container");
            if (showFunctionBtn !== false) {
                showFunctionBtn = true;
            }
            functionBtn = MathUtilities.Components.GraphTable.templates["graph-table"]({
                "functionBtn": showFunctionBtn,
                "rows": totalRows,
                "cols": index,
                "cid": this.cid
            }).trim();

            if (this.model.get("oEditorParam")) {
                $cell.prop("disable", false);
                this.model.get("oEditorParam").holderDiv = $textContainer;
                MathUtilities.Components.MathEditor.Models.Application.init(this.model.get("oEditorParam"));
                $cell.find(".mathquill-editable").addClass("cell-editor").find("textarea").blur();
            } else {
                $textContainer.attr("contentEditable", true);
            }
            if (cellColClass === "" && cellRowClass === "first-row") {
                $(functionBtn).attr({
                    "index": index,
                    "text-align": "center"
                }).appendTo($textContainer);
            }
            if (typeof insertAfter !== "undefined") {
                $cell.insertAfter($appendToDiv.find($(".cell[data-column='col" + (insertAfter - 1) + "']")));
            } else {
                $appendToDiv.append($cell);
            }
            this.bindCell($cell);
            return $cell;
        },
        "showFunctionDropdown": function(event) {
            var $target = $(event.currentTarget).parents('.cell'),
                functionBtnTop, functionBtnLeft, $funcBtnContainer, $currRow = this.$el.find("[data-row-id=row1]"),
                currTargetIndex = $(event.currentTarget).attr('index'),
                listId = this.$el.parents('.list').attr('id'),
                currShown, borderWidth = 1;
            $target.parents(".cell").find("textarea").blur();
            currShown = $currRow.attr("data-drop-down-shown-index");
            $funcBtnContainer = this.$(".function-option-container");
            if (currShown === currTargetIndex || typeof currShown === "undefined") {
                if ($funcBtnContainer.css("display") === "none") {
                    $target.children('.function-btn').addClass('function-btn-down-state');
                    this.trigger('function-dropdown-open');
                    $funcBtnContainer.show();
                    this.accManagerView.unloadScreen(listId);
                    this.accManagerView.loadScreen(listId);
                    this.accManagerView.enableTab('list-data-container-of-' + listId, false);
                    functionBtnTop = $target.position().top - $('#input-column').position().top + $target.height() + borderWidth;
                    functionBtnLeft = $target.position().left - $('#input-column').position().left - $funcBtnContainer.width() + $target.width() - borderWidth;
                    $currRow.attr('data-drop-down-shown-index', currTargetIndex);

                    this.trigger('function-dropdown-open');
                    $funcBtnContainer.css({
                        "top": functionBtnTop,
                        "left": functionBtnLeft
                    });
                    if (!event.which) {
                        this.accManagerView.setFocus('col-function-of-' + this.cid);
                    }
                } else {
                    $target.children('.function-btn').removeClass('function-btn-down-state');
                    this.trigger("function-dropdown-closed");
                    $funcBtnContainer.hide();
                }
            } else {
                $funcBtnContainer.show();
                functionBtnTop = $target.position().top - $('#input-column').position().top + $target.height() + borderWidth;
                functionBtnLeft = $target.position().left - $('#input-column').position().left - $funcBtnContainer.width() + $target.width() - borderWidth;
                $currRow.attr('data-drop-down-shown-index', currTargetIndex);

                this.trigger("function-dropdown-open");
                $funcBtnContainer.css({
                    "top": functionBtnTop,
                    "left": functionBtnLeft
                });
                this.accManagerView.setFocus('col-function-of-' + this.cid);
            }

        },
        "enableAllCellsInColumn": function(colNo) {
            var totalRows = this.getRowCount(),
                rowCounter;
            for (rowCounter = 2; rowCounter <= totalRows; rowCounter++) {
                this.enableCell($(this.getCellAt(rowCounter, colNo)));
            }
        },

        "disableAllCellsInColumn": function(colNo) {
            var totalRows = this.getRowCount(),
                rowCounter;
            for (rowCounter = 2; rowCounter <= totalRows; rowCounter++) {
                this.disableCell($(this.getCellAt(rowCounter, colNo)));
            }
        },
        "disableAllCellsInRow": function(rowNo) {
            var rowCells = this.getRow(rowNo),
                counter,
                length = rowCells.length;
            for (counter = 0; counter < length; counter++) {
                this.disableCell(rowCells.eq(counter));
            }
        },
        "disableCell": function($cell) {
            var $cellMathquill = $cell.find(".mathquill-editable-size"),
                latex = $cellMathquill.mathquill("latex");
            $cellMathquill.mathquill("revert").mathquill().mathquill("latex", latex);
            $cell.addClass("cell-disabled");
            if (this.equationPanel._graphingToolView.isAccDivPresent($cell)) {
                this.accManagerView.setAccMessage($cell.attr('id'), this.accManagerView.getAccMessage('table-equation-panel-messages', 13));
            }
        },

        "enableCell": function($cell) {
            var latex,
                equationData = this.equationPanel._getEquationDataUsingCid($cell.attr('data-equation-cid')),
                accText = '';
            latex = $cell.find(".mathquill-editable-size").mathquill("latex");
            $cell.find(".outerDiv").remove();
            this.model.get("oEditorParam").holderDiv = $cell.find(".table-cell-text-container");
            MathUtilities.Components.MathEditor.Models.Application.init(this.model.get("oEditorParam"));
            $cell.find(".mathquill-editable").addClass("cell-editor");
            $cell.attr("data-prev-latex", latex).removeClass("cell-disabled");
            latex = $cell.find(".mathquill-editable").mathquill("latex", latex);
            this.bindCell($cell);
            if (equationData) {
                accText = equationData.getAccText();
            }
            this.equationPanel._graphingToolView.setAccMessage($cell.attr('id'), this.accManagerView.getAccMessage('table-equation-panel-messages', 10, [accText]));
        },

        "_removeRowClicked": function() {
            if (this.getRowCount() > 2) {
                this.trigger("row:deleted");
            } else {
                this.trigger("row:min", this.cid);
            }
        },
        "deleteRow": function(rowNo) {
            var totalRows = this.getRowCount(),
                model = this.model,
                tableContents = model.get("tableContents"),
                tableContentsLength = tableContents.length,
                loopVar;
            totalRows--;
            this.$(".row[data-row-id=row" + rowNo + "]").remove();
            model.set("rowCount", totalRows);
            this._updateTableCells(rowNo - 1);
            for (loopVar = 0; loopVar < tableContentsLength; loopVar++) {
                tableContents[loopVar].splice(rowNo - 1, 1);
            }
            model.set("tableContents", tableContents);

        },
        "_removeColClicked": function() {
            if (this.getColCount() - this.model.get('residualColumnCount') > 1) { //min number of columns
                this.trigger("column:deleted");
            } else {
                this.trigger("column:min", this.cid);
            }
        },
        "deleteCol": function(colNo) {

            var model = this.model,
                tableContents = model.get("tableContents"),
                columnColors = model.get('columnColors'),
                totalCols = this.getColCount();
            totalCols--;
            this.updateColumnFunctionOption(colNo, true);
            this._addLeftHiddenIcon(colNo, true);
            this.getColumn(colNo).remove();
            model.set("colCount", totalCols);
            this._updateTableCells(false, colNo - 1);
            this.setCopyBtnContainerWidth();
            columnColors.splice(colNo - 1, 1);
            model.set('columnColors', columnColors);
            tableContents.splice(colNo - 1, 1);
            model.set("tableContents", tableContents);
        },
        "updateColumnFunctionOption": function(colNo, isDelete) {
            var columnFunctionOption = this.model.get('columnFunctionOption'),
                nextOpt, prevOpt;
            _.each(columnFunctionOption, function(value, counter) {
                if (isDelete) {
                    if (Number(colNo) < Number(counter)) {
                        columnFunctionOption[Number(counter) - 1] = value;
                    }
                } else {
                    if (Number(colNo) <= Number(counter)) {
                        if (Number(colNo) === Number(counter)) {
                            nextOpt = columnFunctionOption[Number(counter) + 1];
                            columnFunctionOption[Number(counter) + 1] = columnFunctionOption[Number(counter)];
                        } else {
                            prevOpt = columnFunctionOption[Number(counter) + 1];
                            columnFunctionOption[Number(counter) + 1] = nextOpt;
                            nextOpt = prevOpt;
                        }

                    }
                }

            });
            if (isDelete) {
                delete columnFunctionOption[Object.keys(columnFunctionOption).length + 1];
            } else {
                columnFunctionOption[colNo] = "F";
            }

            this.model.set('columnFunctionOption', columnFunctionOption);
        },
        "getPreviousVisibleColumn": function(colNo, escapeResidual) {
            var prevCol = null,
                $currCol = null,
                index = null;
            colNo = Number(colNo);
            for (index = colNo - 1; index >= 1; index--) {
                $currCol = this.getColumn(index);
                if (escapeResidual) {
                    if (!($currCol.css('display') === 'none' || $currCol.attr('data-ignore-column'))) {
                        prevCol = index;
                        break;
                    }
                } else if ($currCol.css('display') !== 'none') {
                    prevCol = index;
                    break;
                }
            }
            return prevCol;
        },

        "getNextVisibleColumn": function(colNo) {
            var totalCols = this.getColCount(),
                index = null,
                dataColumnName = null,
                $currCol = null,
                nextCol = null;
            colNo = Number(colNo);
            for (index = colNo + 1; index <= totalCols; index++) {
                $currCol = this.getColumn(index);
                dataColumnName = $currCol.attr('data-column-name');
                if ($currCol.css('display') !== 'none') {
                    if (dataColumnName && (dataColumnName.indexOf('line') !== -1 ||
                            dataColumnName.indexOf('exp') !== -1 || dataColumnName.indexOf('polynomial') !== -1)) {
                        nextCol = index + 1;
                    } else {
                        nextCol = index;
                        return nextCol;
                    }
                }
            }
            return nextCol;
        },

        "isNextColumnResidual": function(colNo, isCurrentColumn) {
            var dataColumnName = null;
            colNo = Number(colNo);
            if (isCurrentColumn === true) {
                dataColumnName = this.getColumn(colNo).attr('data-column-name');
            } else {
                dataColumnName = this.getColumn(colNo + 1).attr('data-column-name');
            }
            return !!(dataColumnName && (dataColumnName.indexOf('line') !== -1 ||
                dataColumnName.indexOf('exp') !== -1 || dataColumnName.indexOf('polynomial') !== -1));
        },

        "getResidualColumnCount": function(colNo) {
            var totalCols = this.getColCount(),
                index = null,
                dataColumnName = null,
                $currCol = null,
                nextCol = null;
            colNo = Number(colNo);
            for (index = colNo + 1; index <= totalCols; index++) {
                $currCol = this.getColumn(index);
                dataColumnName = $currCol.attr('data-column-name');
                if (dataColumnName && (dataColumnName.indexOf('line') !== -1 ||
                        dataColumnName.indexOf('exp') !== -1 || dataColumnName.indexOf('polynomial') !== -1)) {
                    nextCol = index;
                } else {
                    return nextCol;
                }
            }
            return nextCol;
        },
        "_addLeftHiddenIcon": function(colNo, isDelete) {
            var prevColumn = null,
                $prevColumnRow1 = null,
                $prevColumn = null,
                rightPositionAdjuster = 'right-icon-position-adjuster',
                addIcon = false,
                $functionBtn = null;
            if (isDelete) {
                if ($(this.getColumn(colNo)[0]).find('.' + rightPositionAdjuster).length !== 0) {
                    addIcon = true;
                }
            } else {
                addIcon = true;
            }
            if (addIcon) {
                prevColumn = this.getPreviousVisibleColumn(colNo);
                $prevColumn = this.getColumn(prevColumn);
                $prevColumnRow1 = $prevColumn.eq(0);

                $prevColumnRow1.find('.next-column-hidden-icon-container').show();
                $prevColumn.addClass('hidden-column-border');
                $functionBtn = $prevColumnRow1.find('.function-btn');
                if ($functionBtn.length !== 0) {
                    $functionBtn.removeClass(rightPositionAdjuster).addClass(rightPositionAdjuster);
                    $prevColumnRow1.find('.mathquill-editable-size').removeClass(rightPositionAdjuster).addClass(rightPositionAdjuster);
                }
            }
            return prevColumn;
        },

        "_addRightHiddenIcon": function(colNo, isAdd) {
            var nextColumn = null,
                addIcon = false,
                $prevCol,
                $nextColumnRow1 = null;
            colNo = Number(colNo);
            if (isAdd) {
                if (this.getColumn(colNo - 1).css('display') === 'none') {
                    addIcon = true;
                    $nextColumnRow1 = $(this.getColumn(colNo)[0]);
                } else {
                    $prevCol = this.getColumn(colNo - 1);
                    $prevCol.find('.next-column-hidden-icon-container').hide();
                    $prevCol.find('.function-btn').removeClass('right-icon-position-adjuster');
                    $prevCol.removeClass('hidden-column-border').find('.mathquill-editable-size').removeClass('right-icon-position-adjuster');
                }
            } else {
                addIcon = true;
                nextColumn = this.getNextVisibleColumn(colNo);
                $nextColumnRow1 = $(this.getColumn(nextColumn)[0]);
            }
            if (addIcon) {
                this._addRightHiddenIconClasses($nextColumnRow1);
            }
        },

        "_addRightHiddenIconClasses": function($columnRow, isCheck) {
            var leftPositionAdjuster = 'left-icon-position-adjuster';
            if (isCheck) {
                if ($columnRow.find('.prev-column-hidden-icon-container').css('display') !== 'none' &&
                    !$columnRow.find('.graphing-tool-editor-table-cell-props').hasClass('left-icon-position-adjuster')) {
                    $columnRow.find('.graphing-tool-editor-table-cell-props').removeClass(leftPositionAdjuster).addClass(leftPositionAdjuster);
                }
            } else {
                $columnRow.find('.prev-column-hidden-icon-container').show();
                $columnRow.find('.graphing-tool-editor-table-cell-props').removeClass(leftPositionAdjuster).addClass(leftPositionAdjuster);
                $columnRow.find('.mathquill-editable-size').removeClass(leftPositionAdjuster).addClass(leftPositionAdjuster);
            }
        },

        "setCopyBtnContainerWidth": function() {
            var rowWidth = this.$el.find("[data-row-id=row1]").width();
            if (rowWidth !== 0) {
                this.$('.table-button-container').width(rowWidth);
            }
        },

        "bindCell": function($cell) {
            $cell.find("textarea").off("focus", this._setFocusToCell).on("focus", _.bind(this._setFocusToCell, this))
                .off("blur", this._removeFocusFromCell).on("blur", _.bind(this._removeFocusFromCell, this));
        },
        /**
         * Sets data to a particular table-cell.
         *
         * @method setData
         * @param {Array} dataObjs Accepts an Array of `JSON` Objects containing data and the table-cell's `Jquery` object.
         */
        "setData": function(dataObjs) {
            var index = 0,
                length = dataObjs.length,
                dataObj = null,
                $mathquillEditable,
                updateArray = [];
            for (; index < length; index++) {
                dataObj = dataObjs[index];
                dataObj.object = this.$("#" + dataObj.object.attr("id"));
                if (typeof dataObj.data !== "object") {
                    $mathquillEditable = dataObj.object.find(".mathquill-editable");
                    if ($mathquillEditable && typeof dataObj.data !== "undefined") {
                        dataObj.object.attr("data-prev-latex", dataObj.data);
                        $mathquillEditable.mathquill("latex", dataObj.data.toString()).find("textarea").blur();
                    } else {
                        dataObj.object.val(dataObj.data);
                    }
                } else {
                    dataObj.object.html("").append(dataObj.data);
                }
                updateArray[index] = dataObj.object;
            }
            this.setCopyBtnContainerWidth();
        },
        "getBestFitData": function() {
            return this.model.get("bestFitData");
        },
        "setBestFitData": function(bestFitDataObj) {
            this.model.set("bestFitData", bestFitDataObj);
        },
        "_setBestFit": function(arr, currentCid, currentType, subType, color) {
            if (subType) {
                this.setBestFitCurves(currentType, subType, currentCid, arr, color);
            } else {
                this.setBestFitOthers(currentType, currentCid, arr, color);
            }
            if (!subType) {
                subType = "";
            }
            this.trigger("draw-bestfit-chart", currentType + subType + "-" + currentCid, arr, color);
        },
        "_hideBestFit": function(type, subType, bestFit) {
            if (bestFit) {
                if (subType && bestFit[type] && bestFit[type][subType].selected === true) {
                    bestFit[type][subType].selected = false;
                } else if (bestFit[type] && bestFit[type].selected === true) {
                    bestFit[type].selected = false;
                }
            }
            return bestFit;
        },
        "setBestFitOthers": function(type, bestFit, points, color) {

            if (!bestFit) {
                bestFit = {};
            }
            if (!bestFit[type]) {
                bestFit[type] = {
                    "selected": true
                };
            }
            var bestFitType = bestFit[type];
            if (bestFitType.selected === true) {
                bestFitType.data = points;

            } else {
                bestFitType.selected = true;
            }
            bestFit.color = color;
            return bestFit;
        },

        "setBestFitCurves": function(type, subType, bestFit, points, color) {

            if (!bestFit) {
                bestFit = {};
            }
            var bestFitType = bestFit[type],
                bestFitSubType;
            if (!bestFitType) {
                bestFitType = {};
                if (subType) {
                    bestFitType[subType] = {
                        "selected": true
                    };
                } else {
                    bestFitType = {
                        "selected": true
                    };
                }
            }
            if (subType) {
                if (!bestFitType[subType]) {
                    bestFitType[subType] = {
                        "selected": true
                    };
                }
                bestFitSubType = bestFitType[subType];
            } else {
                bestFitSubType = bestFitType;
            }
            if (bestFitSubType.selected === true) {
                bestFitSubType.data = points;

            } else {
                bestFitSubType.selected = true;
            }
            bestFit[type] = bestFitType;
            bestFit.color = color;
            return bestFit;
        },
        "getTableDataForCharts": function(filterData) {
            var totalCols = this.getColCount(),
                counter = 1,
                colColors = [],
                headersArray = [],
                headersAccArray = [],
                $header,
                columnContent,
                chartBestFit = this.model.get('chartBestFit'),
                tableDataLabels = [],
                rowHeaderChecked = this.getRowHeaderState(),
                functionLabelOptions = [],
                plotColumnHidden = this.model.get('plotColumnHidden'),
                returnBlank,
                actualTableData = [],
                headerContent,
                tableData = {
                    "points": [],
                    "labels": [],
                    "headers": [],
                    "headersAcc": [],
                    "tableName": null,
                    "columnColors": [],
                    "functionLabelOptions": []
                },
                tableDataPoints = [];
            if (rowHeaderChecked === true) {
                $header = $(this.getCellAt(1, 1));
                $header.removeClass('chart-data-col');
                if ($header.attr('data-ignore-column') !== 'true') {
                    if (!filterData || filterData && plotColumnHidden.indexOf($header.attr('data-equation-cid')) === -1) {
                        tableDataLabels = this.getColumnContent(1, {
                            "solution": false
                        });
                        actualTableData.push(this.getColumnContent(counter, {
                            "solution": true,
                            "convertToNum": true,
                            "returnBlank": returnBlank
                        }));
                    }
                }
                counter = 2;
            }
            for (; counter <= totalCols; counter++) {
                $header = $(this.getCellAt(1, counter));
                $header.removeClass('chart-data-col');
                if ($header.attr('data-ignore-column') !== 'true') {
                    returnBlank = false;
                    columnContent = this.getColumnContent(counter, {
                        "solution": true,
                        "convertToNum": true,
                        "returnBlank": returnBlank
                    });
                    actualTableData.push(columnContent);
                    if (!filterData || filterData && plotColumnHidden.indexOf($header.attr('data-equation-cid')) === -1) {
                        headerContent = this.getCellContent($header);
                        if ($header.find('.table-error').length !== 0) {
                            headerContent = '';
                        }
                        returnBlank = headerContent === '';
                        if (headerContent !== '') {
                            tableDataPoints.push(columnContent);
                            headersArray.push(headerContent);
                            headersAccArray.push(this.equationPanel._getEquationDataUsingCid($header.attr('data-equation-cid')).getAccText());
                            colColors.push(this.getColumnColor(counter - 1));
                            functionLabelOptions.push(this.getLabelOfFunctionOption(counter));
                        } else {
                            if (chartBestFit.bestFit && chartBestFit.bestFit[$header.attr('data-equation-cid')]) {
                                chartBestFit.bestFit[$header.attr('data-equation-cid')] = {};
                                this.model.set('chartBestFit', chartBestFit);
                            }
                        }
                        $header.addClass('chart-data-col');
                    }
                }
            }
            tableData.points = tableDataPoints.slice();
            tableData.headers = headersArray.slice();
            tableData.headersAcc = headersAccArray.slice();
            tableData.tableName = this.tableCounter;
            tableData.columnColors = colColors.slice();
            tableData.labels = tableDataLabels.slice();
            tableData.bestFit = this.getBestFitData();
            tableData.functionLabelOptions = functionLabelOptions.slice();
            tableData.actualTableData = actualTableData.slice();

            return tableData;
        },

        "_isColumnBlank": function(colNo) {
            return this.getColumnContent(colNo).join("") === "";
        },

        "_setFocusToCell": function(event) {
            var $currentElement = $(event.target),
                $equationBox,
                cellId, $cell1, $cell2,
                cellIdSplit,
                rowNo,
                colNo;
            $currentElement = $currentElement.hasClass('acc-read-elem') ? $currentElement.parent() : $currentElement;
            if (event.type === "mousedown") {
                this.$("textarea").blur();
                if ($currentElement.hasClass('change-graph-style') || $currentElement.hasClass('function-btn') ||
                    $currentElement.parents('.function-btn').length === 1 || $currentElement.hasClass('show-hide-column-icons') ||
                    $currentElement.hasClass('show-hide-column-icons-container') || $currentElement.children('.change-graph-style').length === 1) {
                    cellId = $currentElement.parents(".cell").attr("data-cell-id");
                    if (typeof cellId === "undefined") {
                        return void 0;
                    }
                    cellIdSplit = cellId.split("-");
                    rowNo = Number(cellIdSplit[0]);
                    colNo = Number(cellIdSplit[1]);

                    $equationBox = $currentElement.parents(".equation-box");
                    $cell1 = $equationBox.find(".cell[data-cell-id=" + rowNo + "-" + (colNo - 1) + "]");
                    $cell2 = $equationBox.find(".cell[data-cell-id=" + (rowNo - 1) + "-" + colNo + "]");
                    $equationBox.find(".cell").removeClass("cell-focus-border");
                    $cell1.removeClass("cell-focus-right-border").addClass("cell-blur-right-border");
                    $cell2.removeClass("cell-focus-bottom-border").addClass("cell-blur-bottom-border");
                    return void 0;
                }
                if ($currentElement.hasClass("cell")) {
                    window.setTimeout(function() {
                        $currentElement.find("textarea").focus();
                    }, 0);
                } else {
                    window.setTimeout(function() {
                        $currentElement.parents(".cell").find("textarea").focus();
                    }, 0);
                }
            } else {
                cellId = $currentElement.parents(".cell").attr("data-cell-id");
                if (typeof cellId === "undefined") {
                    return void 0;
                }
                cellIdSplit = cellId.split("-");
                rowNo = Number(cellIdSplit[0]);
                colNo = Number(cellIdSplit[1]);
                $equationBox = $currentElement.parents(".equation-box");
                $cell1 = $equationBox.find(".cell[data-cell-id=" + rowNo + "-" + (colNo - 1) + "]");
                $cell2 = $equationBox.find(".cell[data-cell-id=" + (rowNo - 1) + "-" + colNo + "]");
                $equationBox.find(".cell").removeClass("cell-focus-border");
                $cell1.removeClass("cell-focus-right-border").addClass("cell-blur-right-border");
                $cell2.removeClass("cell-focus-bottom-border").addClass("cell-blur-bottom-border");

                if ($currentElement.parents(".cell").find("textarea").length !== 0) {
                    $cell1.removeClass("cell-blur-right-border").addClass("cell-focus-right-border");
                    $cell2.removeClass("cell-blur-bottom-border");
                    $currentElement.parents(".cell").addClass("cell-focus-border");

                }
            }
            this.trigger("cell:focussed", cellId);
        },
        "_removeFocusFromCell": function(event) {
            var $currentElement = $(event.target),
                cellId,
                rowNo,
                colNo,
                cellIdSplit,
                $equationBox;
            $equationBox = $currentElement.parents(".equation-box");
            if ($currentElement.hasClass("cell")) {
                cellId = $currentElement.attr("data-cell-id");
                if (typeof cellId === "undefined") {
                    return void 0;
                }
                cellIdSplit = cellId.split("-");
                rowNo = Number(cellIdSplit[0]);
                colNo = Number(cellIdSplit[1]);
                $currentElement.removeClass("cell-focus-border");
            } else {
                cellId = $currentElement.parents(".cell").attr("data-cell-id");
                if (typeof cellId === "undefined") {
                    return void 0;
                }
                cellIdSplit = cellId.split("-");
                rowNo = Number(cellIdSplit[0]);
                colNo = Number(cellIdSplit[1]);
                $currentElement.parents(".cell").removeClass("cell-focus-border");
            }
            $equationBox.find(".cell[data-cell-id=" + rowNo + "-" + (colNo - 1) + "]")
                .removeClass("cell-focus-right-border").addClass("cell-blur-right-border");
            $equationBox.find(".cell[data-cell-id=" + (rowNo - 1) + "-" + colNo + "]")
                .removeClass("cell-focus-bottom-border").addClass("cell-blur-bottom-border");
            this.trigger("cell:blurred", cellId);
        },

        /**
         * Gets data for the current Table-cell.
         *
         * @method getData
         * @param {Object} [oSelected] Jquery's element object for table-cell.
         * @return {Object} Passes a `JSON` Object containing data and the element name.
         */
        "getData": function(oSelected) {
            var index = 0,
                cells = this.$(".cell"),
                length = cells.length,
                data = [];
            if (oSelected) {
                return this.model.get("oEditorParam") ? oSelected.find(".mathquill-editable").mathquill("latex") : oSelected.val();
            }
            for (; index < length; index++) {
                data[index] = {
                    "id": cells[index].id,
                    // Either adds latex from mathquill editor or takes value from the cell if no editor applied.
                    "data": this.model.get("oEditorParam") ? $(cells[index]).children().find(".mathquill-editable")
                        .mathquill("latex") : $(cells[index]).val()
                };
            }
            return data;
        },
        /**
         * Returns number of rows in the table
         *
         * @method getRowCount
         * @return {Number} Number of rows.
         */
        "getRowCount": function() {
            return this.model.get("rowCount");
        },

        /**
         * Returns number of columns in the table
         *
         * @method getColCount
         * @return {Number} Number of columns.
         */
        "getColCount": function() {
            return this.model.get("colCount");
        },
        "_updateTableCells": function(rowNo, colNo) {

            var $rows = this.$(".row:gt(" + (rowNo - 1) + ")"),
                noOfCols,
                noOfRows,
                colCounter = 0,
                $cells,
                cellCounter,
                cellClass,
                reqColNo,
                setCol,
                rowCounter = 0,
                cid = this.cid;
            if (rowNo) {
                $rows = this.$(".row:gt(" + (rowNo - 1) + ")");
                $rows.each(function() {
                    $(this).attr({
                        "id": "row" + ++rowNo + '-of-' + cid,
                        "data-row-id": "row" + rowNo
                    });
                    $cells = $(this).find(".cell");
                    cellCounter = 0;
                    $cells.each(function() {
                        $(this).attr({
                            "data-cell-id": rowNo + "-" + (cellCounter + 1),
                            "id": rowNo + "-" + (cellCounter + 1) + '-of-' + cid
                        });
                        cellCounter++;
                    });
                });
            }
            if (colNo) {
                noOfCols = this.getColCount();
                noOfRows = this.getRowCount();
                for (rowCounter = 1; rowCounter <= noOfRows; rowCounter++) {
                    $rows = this.$("#row" + rowCounter + "-of-" + this.cid);
                    for (colCounter = colNo + 1; colCounter <= noOfCols; colCounter++) {
                        reqColNo = colCounter + 1;
                        setCol = "col" + colCounter;
                        $cells = this.$(".cell[data-cell-id=" + rowCounter + "-" + reqColNo + "]");
                        $cells = $rows.children().eq(colCounter - 1);
                        cellClass = $cells.attr("class");
                        //update column number class
                        cellClass = cellClass.replace(/col\d/g, setCol);
                        $cells.attr({
                                "class": cellClass,
                                "data-column": setCol,
                                "column": setCol,
                                "id": rowCounter + "-" + colCounter + '-of-' + cid,
                                "data-cell-id": rowCounter + "-" + colCounter
                            })
                            .find(".function-btn").attr("index", colCounter);
                        $cells.find(".table-cell-text-container").attr("data-column", setCol);
                    }
                }
            }
            this.setCopyBtnContainerWidth();
        },


        /**
         * Sets header to the table's header elements|row.
         *
         * @method setHeader
         * @param {Array} headers An `Array` of string representing the header content for the table-columns.
         */
        "setHeader": function(headers) {
            var headerElements = this.$(".row[data-row-id=row1]").children(),
                objs = [],
                obj = {},
                index = 0,
                loopVar,
                model = this.model,
                tableContentsLength,
                tableContents = model.get("tableContents"),
                length = this.options.cols;

            for (; index < length; index++) {
                obj = {};
                obj.object = headerElements.eq(index);
                obj.data = headers[index];
                objs[index] = obj;
            }
            this.setData(objs);
            tableContentsLength = tableContents.length;
            for (loopVar = 0; loopVar < tableContentsLength; loopVar++) {
                tableContents[loopVar][0] = headers[loopVar];
            }
            model.set("tableContents", tableContents);

        },

        /**
         * Selects and return a specific cell from the table
         *
         * @method getCellAt
         * @param {Number} x Row number of the cell.
         * @param {Number} y Column number of the cell.
         * @return {Object} Jquery `div` element object.
         */
        "getCellAt": function(x, y) {
            return this.$(".cell[data-cell-id='" + x + "-" + y + "']");
        },

        "getMultipleColContent": function(colNo, solution) {
            var x, y,
                counter,
                $column,
                data = [],
                $xColumn,
                rows = this.getRowCount(),
                rowHeader = this.getRowHeaderState();

            $column = this.getColumn(colNo);
            if (rowHeader === false) {
                if (colNo === 1) {
                    return data;
                }
                $xColumn = this.getColumn(1);
            }

            for (counter = 1; counter < rows; counter++) {
                if (rowHeader === true) {
                    x = counter;
                } else {
                    x = this.getCellContent($xColumn.eq(counter), {
                        'solution': solution
                    });
                    if (x === "" || typeof x === "undefined") {
                        continue;
                    }
                }
                y = this.getCellContent($column.eq(counter), {
                    "solution": solution
                });
                if (y === "" || typeof y === "undefined") {
                    continue;
                }
                data.push([x, y]);
            }
            return data;
        },
        "_getColumnCid": function(colNo) {
            return this.$("#1-" + colNo + "-of-" + this.cid).attr("data-equation-cid");
        },
        "_getColumnNo": function(cid) {
            var $cell = this.$(".cell[data-equation-cid=" + cid + "]");
            if ($cell.length !== 0) {
                return $cell.attr("id").split("-")[1];
            }
        },
        "_setDataAnalysis": function(cid, dataAnalysis) {
            var tableDataAnalysis = this.model.get("tableDataAnalysis");
            if (tableDataAnalysis === null || typeof tableDataAnalysis === 'undefined') {
                tableDataAnalysis = {};
            }
            tableDataAnalysis[cid] = dataAnalysis;
            this.model.set("tableDataAnalysis", tableDataAnalysis);
        },
        "_getDataAnalysis": function(cid) {
            return this.model.get("tableDataAnalysis")[cid];
        },
        /**
         * Get content of each cell of table
         * @method _getTableContent
         * @return {Array} Returns content in each cell.
         */
        "_getTableContent": function(rows, cols, getDisabledData) {
            var rowCounter, colsCounter, content = [],
                contentCell = [],
                row, rowLength;
            for (rowCounter = 1; rowCounter <= rows; rowCounter++) {
                contentCell = [];
                row = this.getRowForContent(rowCounter, getDisabledData);
                rowLength = row.length;
                for (colsCounter = 0; colsCounter < rowLength; colsCounter++) {
                    contentCell.push(this.getCellContent(row[colsCounter]));
                }
                content.push(contentCell);
            }
            return content;
        },
        /**
         * set content of each cell of table
         * @method setTableContent
         * @param {Array} Array of content to be set in each cell.
         */
        "setTableContent": function(content) {
            var rowCounter, colsCounter,
                rowContent = [],
                rows = this.getRowCount(),
                row, rowLength;
            for (rowCounter = 1; rowCounter < rows; rowCounter++) {
                rowContent = content[rowCounter];
                row = this.getRowForContent(rowCounter + 1);
                rowLength = row.length;
                for (colsCounter = 0; colsCounter < rowLength; colsCounter++) {
                    this.setCellContent(row[colsCounter], rowContent[colsCounter], false, true);
                }
            }
        },
        "getTableState": function(avoidIgnoredColsRows) {
            var data = {},
                model = this.model,
                ignoreCols = this.$("div[data-ignore-column=true]").length,
                ignoreRows = this.$(".row[data-ignore-row=true]").length;

            data.rows = this.getRowCount();
            data.cols = this.getColCount();
            if (avoidIgnoredColsRows) {
                data.rows -= ignoreRows;
                data.cols -= ignoreCols;
            }
            data.content = this._getTableContent(data.rows, data.cols);
            data.rowHeaderState = this.getRowHeaderState();
            data.tableName = this.tableCounter;
            data.chartBestFit = model.get("chartBestFit");
            data.functionLabelOptions = model.get("columnFunctionOption");
            data.eyeOpen = model.get("eyeOpen");
            data.showTable = model.get("showTable");
            data.hiddenColumns = this._getHiddenColumns();
            data.plotColumnHidden = this._getPlotColumnArrayFromCid();
            return data;
        },

        /**
         * Get content of given cell of table
         * @method getCellContent
         * @return string Returns content in each cell.
         */
        "getCellContent": function($cell, flags) {
            var ans,
                cellContents = {
                    "latex": null,
                    "solution": null
                },
                solution, convertToNum, cellLatex, latexAndSolution,
                MathHelper = MathUtilities.Components.Utils.Models.MathHelper;
            if (flags) {
                solution = flags.solution;
                convertToNum = flags.convertToNum;
                latexAndSolution = flags.latexAndSolution;
            }
            if (this.model.get('oEditorParam')) {
                ans = $cell.attr('data-solution');
                cellLatex = $cell.find('.mathquill-editable-size').mathquill('latex');
                if (typeof ans !== 'undefined') {
                    if (convertToNum) {
                        ans = MathHelper._generateNumberFromLatex(ans);
                    }
                } else {
                    ans = '';
                }
                if (latexAndSolution) {
                    cellContents.latex = cellLatex;
                    cellContents.solution = ans;
                    return cellContents;
                }
                if (solution) {
                    return ans;
                }
                return cellLatex;
            }
            return $cell.value;
        },

        "getTableCellData": function(rowNo, colNo, convertToNum) {
            var ans = this.model.get("tableContents")[colNo - 1][rowNo - 1];

            if (typeof ans !== "undefined") {
                if (convertToNum) {
                    return MathUtilities.Components.Utils.Models.MathHelper._generateNumberFromLatex(ans);
                }
                return ans;
            }
            return "";
        },
        "getTableColumnData": function(colNo, convertToNum) {
            var tableContents = this.model.get("tableContents"),
                columnData = [],
                loopVar, colLength, col,
                currentCol;
            if (!convertToNum) {
                return tableContents[colNo - 1];
            }
            col = tableContents[colNo - 1];
            colLength = col.length;
            for (loopVar = 0; loopVar < colLength; loopVar++) {
                currentCol = col[loopVar];
                if (typeof currentCol !== "undefined") {
                    columnData.push(MathUtilities.Components.Utils.Models.MathHelper._generateNumberFromLatex(currentCol));
                } else {
                    columnData.push("");
                }
            }
            return columnData;
        },
        /**
         * Set content of given cell of table
         * @method setCellContent
         * @return void.
         */

        "setCellContent": function($cell, latex, solution, latexAndSolution) {
            if (typeof latex === "undefined" || latex === null) {
                return void 0;
            }
            var model = this.model,
                $mathquill, msg, latexText,
                tableContents = model.get("tableContents"),
                rowNo, colNo, id, column,
                precision = this.equationPanel._graphingToolView.getPrecision();

            if (solution === false) {
                $cell.attr('data-solution', "");
            } else {
                if (solution === true) {
                    $cell.attr('data-solution', latex);
                } else {
                    $cell.attr('data-solution', solution);
                }
            }

            id = $cell.attr("id");
            rowNo = id.split("-")[0];
            colNo = id.split("-")[1];
            if (isNaN(latex)) {
                if (solution && !latexAndSolution) {
                    //latex was previously set as text "undefined".
                    if (typeof solution === "boolean") {
                        latex = 'undefined';
                    } else {
                        latex = MathUtilities.Components.Utils.Models.MathHelper._convertDisplayToAppliedPrecisionForm(Number(solution), precision);
                    }
                } else if (!(solution || latexAndSolution)) {
                    latex = 'undefined';
                }
            } else if (latex !== "" && solution) {
                latex = MathUtilities.Components.Utils.Models.MathHelper._convertDisplayToAppliedPrecisionForm(Number(latex), precision);
            }
            latex = latex.toString();
            if (this.model.get("oEditorParam")) {
                $mathquill = $cell.find(".mathquill-editable-size");

                $mathquill.mathquill("latex", latex);

            } else {
                $cell.value = latex;
            }
            column = this.getColumn(colNo);
            if (!column.attr("data-ignore-column") && !$cell.parents(".row").attr("data-ignore-row")) {
                tableContents[colNo - 1][rowNo - 1] = $cell.attr("data-solution");
                model.set("tableContents", tableContents);
            }
            latexText = latex;
            $cell.attr('cell-text', latexText);
            msg = this.accManagerView.getAccMessage('table-equation-panel-messages', 10, [latexText]);
            if ($('#' + id).find('.acc-read-elem').length !== 0) {
                if ($cell.hasClass('cell-disabled')) {
                    this.accManagerView.setAccMessage(id, latexText);
                } else {
                    this.accManagerView.setAccMessage(id, msg);
                }
            }
            this.setCopyBtnContainerWidth();
        },
        /**
         * Gets headers of the given table upto specified column number
         * @method getHeaders
         * @return {Array} of headers.
         */
        "getHeaders": function(upto, onlyFunctions) {
            var headerElements = this.$(".row[data-row-id=row1] .cell"),
                headers = [],
                length = headerElements.length,
                $currentHeader,
                cellType,
                count = 0;
            if (typeof upto !== "undefined") {
                length = upto - 1;
            }
            for (count = 0; count < length; count++) {
                $currentHeader = headerElements.eq(count);
                cellType = this.getLabelOfFunctionOption(count + 1);
                if (onlyFunctions === true) {
                    if (cellType === "F" || typeof cellType === "undefined") {
                        headers.push(this.getCellContent($currentHeader));
                    } else {
                        headers.push("");
                    }
                } else {
                    headers.push(this.getCellContent($currentHeader));
                }
            }
            return headers;
        },
        /**
         * Gets header cell of the given table cell
         * @method getHeaderCellContentOfCell
         * @return json object
         */
        "getHeaderCellContentOfCell": function($cell) {
            return this.getCellContent(this.getHeaderCellOfCell($cell));
        },
        /**
         * Gets header cell of the given table cell
         * @method getHeaderCellOfCell
         * @return String header text
         */
        "getHeaderCellOfCell": function($cell) {
            var columnNo = Number($cell.attr("data-cell-id").split("-")[1]);
            return this.$(".cell[data-cell-id=1-" + columnNo + "]");
        },

        /**
         * Gets entire column of the given table
         * @method getColumn
         * @return {Array} of json objects
         */
        "getColumn": function(columnNo) {
            return this.$(".cell[data-column=col" + columnNo + "]");
        },

        /**
         *  Gets entire row of the given table
         * @method getRow
         * @return  {Array} of json objects
         */
        "getRow": function(rowNo) {
            return this.$(".row[data-row-id=row" + rowNo + "] .cell");
        },
        "getRowForContent": function(rowNo, getDisabledData) {
            var row = this.$(".row[data-row-id=row" + rowNo + "] .cell"),
                rowLength = row.length,
                currentCell,
                contentRow = [],
                $header, counter;
            for (counter = 0; counter < rowLength; counter++) {
                currentCell = row.eq(counter);
                $header = this.getHeaderCellOfCell(currentCell);
                if ($header.attr("data-ignore-column") !== "true" &&
                    currentCell.attr("data-ignore-cell") !== "true" || getDisabledData) {
                    contentRow.push(row.eq(counter));
                }
            }
            return contentRow;

        },
        /**
         * copies entire column data from source column to destination column
         * @method copyColumn
         * @return {array} of points
         */
        "copyColumn": function(source, destination, getSolution) {
            var sourceCol,
                destinationCol,
                sourceCell,
                destinationCell,
                length, cellContent,
                solution,
                counter, cellData,
                contentArray = [];
            sourceCol = this.getColumn(source);
            destinationCol = this.getColumn(destination);
            length = sourceCol.length;
            for (counter = 1; counter < length; counter++) {
                sourceCell = sourceCol[counter];
                destinationCell = destinationCol[counter];
                cellData = this.getCellContent(this.$(sourceCell), {
                    "solution": getSolution,
                    "latexAndSolution": getSolution,
                    "convertToNum": true
                });
                if (typeof cellData.latex !== 'undefined' && typeof cellData.solution !== 'undefined') {
                    // to display undefined for NaN values in table
                    if (cellData.solution === 'NaN') {
                        cellData.solution = false;
                    }
                    cellContent = cellData.latex;
                    solution = cellData.solution;
                } else {
                    cellContent = cellData;
                    solution = getSolution;
                }
                if (this.$(sourceCell).find('.table-error').length === 0) {
                    if (cellContent === void 0 || cellContent === '') {
                        this.setCellContent(this.$(destinationCell), '', solution);
                    } else {
                        this.setCellContent(this.$(destinationCell), cellContent, solution, false);
                        contentArray.push([cellContent, cellContent]);
                    }
                } else {
                    this.setCellContent(this.$(destinationCell), '', solution);
                }
            }
            return contentArray;
        },
        "getTableContentColumnWise": function(flags) {
            var data = [
                    []
                ],
                counter,
                length = this.getColCount();
            for (counter = 1; counter <= length; counter++) {
                data.push(this.getColumnContent(counter, flags));
            }
            return data;
        },
        "getColumnContent": function(columnNo, flags) {

            var column = this.getColumn(columnNo),
                length = column.length,
                columnContent = [],
                returnBlank,
                getDisabledData,
                currentCellContent,
                counter, $currentCell;
            if (flags) {
                returnBlank = flags.returnBlank;
                getDisabledData = flags.getDisabledData;
            }
            for (counter = 1; counter < length; counter++) {
                if (returnBlank) {
                    columnContent.push("");
                    continue;
                }
                $currentCell = column.eq(counter);
                currentCellContent = this.getCellContent($currentCell, flags);
                if (getDisabledData && currentCellContent === "") {
                    columnContent.push(this.getCellContent($currentCell));
                } else if ($currentCell.attr("data-ignore-cell") !== "true") {
                    columnContent.push(currentCellContent);
                }
            }
            return columnContent;
        },
        "setColumnContent": function(columnNo, columnContent, flags, startFrom) {
            var column,
                length,
                solution,
                latexAndSolution,
                counter;
            column = this.getColumn(columnNo);
            length = column.length;
            if (typeof startFrom === "undefined") {
                startFrom = 1;
            }
            if (flags) {
                solution = flags.solution;
                latexAndSolution = flags.latexAndSolution;
            } else {
                solution = flags;
            }
            for (counter = startFrom; counter < length; counter++) {
                if (latexAndSolution) {
                    this.setCellContent($(column[counter]), columnContent[counter - 1].latex, columnContent[counter - 1].solution, true);
                } else {
                    this.setCellContent($(column[counter]), columnContent[counter - 1], solution);
                }
            }
        },
        "setRowContent": function(rowNo, rowContent, solution, latexAndSolution) {
            var row = this.getRow(rowNo),
                length = rowContent.length,
                counter = 0;
            for (; counter < length; counter++) {
                this.setCellContent(row.eq(counter), rowContent[counter], solution, latexAndSolution);
            }
        },
        "swapRowContents": function(newRowNo, prevRowNo) {
            if (newRowNo === prevRowNo) {
                return;
            }
            var tableContent = this._getTableContent(this.getRowCount(), this.getColCount()),
                prevRowContent = tableContent[prevRowNo - 1],
                newRowContent = tableContent[newRowNo - 1];
            this.setRowContent(prevRowNo, newRowContent, false, true);
            this.setRowContent(newRowNo, prevRowContent, false, true);

        },
        "deselectChartButton": function(chartName) {
            this.$("div[data-chart-name=" + chartName + "]").removeClass("selected").children().removeClass("selected");
        },
        "selectChartButton": function(chartName) {
            this.$("div[data-chart-name=" + chartName + "]").addClass("selected").children().addClass("selected");
        },
        "getIgnoreColumnCount": function() {
            return this.$(".cell[data-ignore-column=true]").length;
        },
        "getIgnoreRowCount": function() {
            return this.$(".row[data-ignore-row=true]").length;
        },
        "getTableVisiblity": function() {
            return this.model.get("eyeOpen");
        },
        "setTableVisiblity": function(flag) {
            this.model.set({
                "eyeOpen": flag,
                "showTable": flag
            });
        },
        "getColumnColor": function(colNo) {
            return this.model.get("columnColors")[colNo];
        },
        "setColumnColor": function(colNo, color) {
            var model = this.model,
                colorArray = model.get('columnColors'),
                colCount = model.get('colCount');
            if (colCount === colorArray.length) {
                colorArray[colNo] = color;
            } else {
                colorArray.splice(colNo, 0, color);
            }

            this.model.set('columnColors', colorArray);
        },
        "_chartBtnClicked": function(event, closeOptions) {
            var $target = this.$(event.currentTarget),
                MAX_ROWS = 101,
                chartName = $target.attr('data-chart-name'),
                selectedClass = 'selected',
                setMessage,
                msg,
                tableModel = this.model;
            if ($target.find('.acc-read-elem').length > 0) {
                setMessage = true;
            }

            if ($target.hasClass(selectedClass)) {

                if (chartName === 'line') {
                    tableModel.set('showTable', false);
                    tableModel.set('lineOptionSelected', false);
                    this.trigger('hide-table-graph');
                    this.trigger('line-chart-clicked', false);
                }
                if (typeof closeOptions === 'undefined' || closeOptions.isChartVisible === false) {
                    $target.removeClass(selectedClass);
                    $target.children().removeClass(selectedClass);
                }
                if (chartName !== 'line') {
                    this.trigger('chart-btn-clicked', chartName, closeOptions);
                }
                if (setMessage) {
                    this.accManagerView.changeAccMessage($target.attr('id'), 0, [this.accManagerView.getAccMessage('unselected-text', 0),
                        this.accManagerView.getAccMessage('table-equation-panel-messages', 5)
                    ]);
                    this.accManagerView.setFocus('dummy-focus-container');
                    this.accManagerView.setFocus($target.attr('id'));
                }
            } else {
                $target.addClass(selectedClass).children().addClass(selectedClass);
                switch (chartName) {
                    case 'line':
                        tableModel.set('lineOptionSelected', true);
                        if (tableModel.get('eyeOpen') === true) {
                            tableModel.set('showTable', true);
                            this.trigger('show-table-graph');
                            this.trigger('line-chart-clicked', true);
                        }
                        break;
                    case 'box':
                        if (this.getRowCount() > MAX_ROWS) {
                            this.trigger('extra-rows-needed', chartName);
                            return void 0;
                        }
                        break;
                    case 'histogram':
                    case 'dot':

                        break;
                }
                if (chartName !== 'line') {
                    this.trigger('chart-btn-clicked', chartName, closeOptions);
                }
                if (setMessage && $target.hasClass(selectedClass)) {
                    msg = this.accManagerView.getAccMessage('table-equation-panel-messages', 4, [chartName]); // to get acc text for current element at the 4th index
                    this.accManagerView.setAccMessage($target.attr('id'), msg);
                    this.accManagerView.setFocus('dummy-focus-container');
                    this.accManagerView.setFocus($target.attr('id'));
                }
            }
            this.equationPanel._graphingToolView.addAllPaperItems(false);
        },

        "_changeMessageForChartBtns": function(event) {
            var $currentBtn = this.$(event.currentTarget);
            if ($currentBtn.find('.acc-read-elem').length !== 0) {
                if ($currentBtn.hasClass('selected')) {
                    this.accManagerView.changeAccMessage($currentBtn.attr('id'), 0, [this.accManagerView.getAccMessage('selected-text', 0),
                        this.accManagerView.getAccMessage('table-equation-panel-messages', 6)
                    ]);
                } else {
                    this.accManagerView.changeAccMessage($currentBtn.attr('id'), 0, [this.accManagerView.getAccMessage('unselected-text', 0),
                        this.accManagerView.getAccMessage('table-equation-panel-messages', 5)
                    ]);
                }
            }
        },
        "_chartButtonClickHandler": function(event) {
            var $target = $(event.currentTarget),
                isSelected = $target.hasClass('selected');
            this.trigger('hide-other-chart-buttons');
            if (isSelected) {
                this.$('.chart-btns-container').hide();
                $target.removeClass('selected');
            } else {
                this.$('.chart-btns-container').show();
                $target.addClass('selected');
                if (this.equationPanel._graphingToolView.isAccDivPresent($target)) {
                    this.accManagerView.setFocus('line-chart-btn-' + this.cid);
                }
            }
        },
        "_setFocusOnchart": function(event) {
            var $currentButton = this.$(event.currentTarget),
                chartName = $currentButton.attr("data-chart-name"),
                $list = $currentButton.parents('.list'),
                eventType = this.equationPanel.isEventTabOrShiftTab(event);
            if (event.keyCode === 67 && chartName !== 'line') { //c character key
                this.trigger('chart-shortcut-keypress', chartName);
            } else {
                this.equationPanel._updateListWidth($list.find('.equation-box').outerWidth());
            }
            if ((eventType.isShiftTab && chartName === 'line') || (eventType.isTab && chartName === 'column')) {
                event.preventDefault();
                if (chartName === 'line') {
                    this.accManagerView.setFocus('common-chart-button-of-' + this.cid);
                } else {
                    this.accManagerView.setFocus('show-hide-equation-container-of-' + $list.attr('id'));
                }
                this.$('.chart-btns-container').hide();
                this.$('.common-chart-button').removeClass('selected');
            }
        }
    });
})(window.MathUtilities);
