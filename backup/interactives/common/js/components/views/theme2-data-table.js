(function () {
    'use strict';

    /**
    * View to populate data table  
    * @class DataTable
    * @namespace MathInteractives.Common.Components.Theme2.Views
    */
    MathInteractives.Common.Components.Theme2.Views.DataTable = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Reference to manager object of the interactive
        * @property manager
        * @default null
        * @type Object
        */
        manager: null,
        /**
        * Unique id prefix of the interactive
        * @property idPrefix
        * @default null
        * @type String
        */
        idPrefix: null,
        /**
        * Reference to player object of the interactive
        * @property player
        * @default null
        * @type Object
        */
        player: null,
        /**
        * Reference to path object of the interactive.
        * @property filePath
        * @default null
        * @type Object
        */
        filePath: null,
        /**
        * Number of columns in the table.
        * @property columnCount
        * @default null
        * @type Number
        */
        _columnCount: null,
        /**
        * Acc id of the element before the table element.
        * @property _previousAccElementId
        * @default null
        * @type String
        */
        _previousAccElementId: null,
        /**
        * Acc id of the element after the table element.
        * @property _nextAccElementId
        * @default null
        * @type String
        */
        _nextAccElementId: null,
        /**
        * Whether shift key is pressed along with the key events.
        * @property _bShiftKeyPressed
        * @default false
        * @type Boolean
        */
        _bShiftKeyPressed: false,
        /**
        * Whether delay has to be given when focus leaves the table.
        * @property _hasAccDelay
        * @default null
        * @type Boolean
        */
        _hasAccDelay: null,

        /**
        * Initializes properties of the view.
        * @method initialize
        * @constructor
        */
        initialize: function initialize() {
            this.initializeDefaultProperties();
            this._initializeTable();
        },

        /**
        * Initializes and renders the table (whenever the model changes or in the beginning)
        * @method _initializeTable
        * @private
        */
        _initializeTable: function initializeTable() {
            this._nextAccElementId = this.model.get('nextElementAccId');
            this._previousAccElementId = this.model.get('prevElementAccId');
            this._hasAccDelay = this.model.get('hasAccDelay');
            this.render();
            this._bindEventListeners();
            this._populateSavedState();
        },

        /**
        * Backbone property for binding events to DOM elements.
        * @property events
        * @private
        */
        events: function events() {
            var events = {
                'click .header-table .tbl-header.sorting-enabled': '_onTableHeaderClick',
            };
            if (this.player.model.get('isAccessible')) {
                events['focusin .body-table'] = '_onTableFocusIn';
                events['focusout .body-table'] = '_onTableFocusOut';
                if (this.model.get('hasInputBoxInTable') === true) {
                    events['keydown'] = '_onTableKeyDown';
                }
            }
            return events;
        },

        /**
        * Initializes all the necessary table elements
        * @method render
        * @private
        */
        render: function render() {
            var tableView = this,
                currentModel = this.model,
                $tableHolder = null,
                $headerTableHolder = null,
                $headerTable = null,
                $bodyTableHolder = null,
                $bodyTable = null,
                $bottomBorder = null,
                rowCount = currentModel.get('tableData').length,
                $tHead = $('<thead></thead>'),
                $tBody = $('<tbody></tbody>'),
                headerRowCount = 0,
                duplicateRowCount = 0,
                idSuffix = currentModel.get('idSuffix'),
                showRedundantValues = currentModel.get('showRedundantValues'),
                showCurrentRowColor = currentModel.get('showCurrentRowColor'),
                blinkRedundantRow = currentModel.get('blinkRedundantRow'),
                changeRedundantRowToCurrent = currentModel.get('changeRedundantRowToCurrent'),
                startTabIndex = 0,
                counter,
                innerCounter,
                rowView;

            if (this.manager !== null) {
                if (currentModel.get('tabIndex') !== -1) {
                    startTabIndex = this.manager.model.get('startTabindex');
                }
            }
            idSuffix = (idSuffix === null || idSuffix === undefined) ? '' : '-' + idSuffix;
            // instantiate and render children
            for (counter = 0; counter < rowCount; counter++) {
                rowView = new MathInteractives.Common.Components.Theme2.Views.DataRow({
                    model: currentModel.get('tableData').models[counter],
                    player: this.player,
                    filePath: this.filePath,
                    idSuffix: idSuffix,
                    enableTableSorting: currentModel.get('enableTableSorting'),
                    isHeaderAutoWidth: currentModel.get('isHeaderAutoWidth'),
                    defaultColumnCount: currentModel.get('defaultColumnCount')
                });
                if (rowView.model.get('isHeaderRow') === true || rowView.model.get('isSubHeaderRow') === true) {
                    $tHead.append(rowView.el);
                    headerRowCount++;
                    if (counter == rowCount - 1) {
                        this._columnCount = rowView.model.get('rowData').length;
                    }
                }
                else {
                    var rowSame = false,
                        rowViewValues = [],
                        rowReference, rowValues,
                        isSepartor = rowView.model.get('isSeparatorRow');
                    this._columnCount = rowView.model.get('rowData').length;
                    $(rowView.el).find('div').each(function () {
                        rowViewValues.push($(this).text());
                    });
                    /*check for duplicate rows*/
                    $tBody.find('tr').each(function () {
                        rowValues = [];
                        $(this).find('div').each(function () {
                            rowValues.push($(this).text());
                        });

                        var isSameRow = true;
                        for (innerCounter = 0; innerCounter < rowViewValues.length; innerCounter++) {
                            if (rowViewValues[innerCounter] !== rowValues[innerCounter] || isSepartor === true) {
                                isSameRow = false;
                            }
                            //if (isSameRow === false) break;
                        }
                        if (isSameRow === true) {
                            rowReference = $(this).find('td');
                            rowSame = true;
                            duplicateRowCount++;
                        }
                    });

                    if (rowSame === true) {
                        if (blinkRedundantRow === true) {
                            // blink redundant row
                            rowReference.each(function () {
                                $(this).addClass('blinkRowColor');
                            });
                        }
                    }
                    if ((rowSame === true && showRedundantValues === true) || rowSame === false) {
                        $tBody.append(rowView.el);
                    }
                    // Identify current row and color appropriate row
                    if (rowSame === true && changeRedundantRowToCurrent === true) {
                        $(rowReference[0]).parents().find('tr.table-row').find('td').removeClass('current-row currentRowColor');
                        rowReference.each(function () {
                            $(this).addClass('current-row currentRowColor');
                        });
                    }

                    if (counter === rowCount - 1) {
                        $(rowView.el).parent().find('td').removeClass('current-row');
                        $(rowView.el).find('td').addClass('current-row');
                        if (showCurrentRowColor === true) {
                            $(rowView.el).parent().find('td').removeClass('currentRowColor');
                            $(rowView.el).find('td').addClass('currentRowColor');
                        }
                    }
                }
                rowView.model.set('rowNumber', counter);
                $(rowView.el).find('td,th').addClass('row_' + counter);
                $(rowView.el).attr('rownumber', counter);
            }

            if (showRedundantValues === true) duplicateRowCount = 0;
            if ((currentModel.get('defaultRowCount') + duplicateRowCount) >= rowCount) {
                //insert default empty rows
                var rowsToInsert = (currentModel.get('defaultRowCount') + duplicateRowCount) - (rowCount - 1),
                    currentRowData = [];
                for (counter = 0; counter < currentModel.get('defaultColumnCount') ; counter++) {
                    currentRowData.push({ text: MathInteractives.Common.Components.Theme2.Views.DataCell.defaultTextString });
                }
                for (counter = 0; counter < rowsToInsert; counter++) {
                    var rowView = new MathInteractives.Common.Components.Theme2.Views.DataRow({
                        model: new MathInteractives.Common.Components.Theme2.Models.DataTable.DataRow({
                            isHeaderRow: false,
                            rowData: currentRowData
                        }),
                        emptyRow: true
                    });
                    $tBody.append(rowView.el);
                }
            }

            $headerTable = $('<table></table>', { id: this.idPrefix + 'header-table' + idSuffix, class: 'header-table tbl', cellpadding: 0, cellspacing: 0, border: 0, role: 'presentation', tabIndex: -1 });

            $bodyTable = $('<table></table>', { id: this.idPrefix + 'body-table' + idSuffix, class: 'body-table tbl tablesorter', cellpadding: 0, cellspacing: 0, border: 0, tabIndex: (startTabIndex + this.model.get('tabIndex')) });
            $bottomBorder = $('<div></div>', { class: 'table-bottom-border' });

            $tHead.appendTo([$headerTable, $bodyTable]);
            $tBody.appendTo($bodyTable);

            $headerTableHolder = $('<div></div>', { id: this.idPrefix + 'header-table-holder' + idSuffix, class: 'header-table-holder' }).append($headerTable);
            $bodyTableHolder = $('<div></div>', { id: this.idPrefix + 'body-table-holder' + idSuffix, class: 'body-table-holder' }).append($bodyTable);

            $tableHolder = $('<div></div>', { id: this.idPrefix + 'complete-table-holder' + idSuffix, class: 'complete-table-holder' }).append($headerTableHolder);
            $tableHolder.append($bodyTableHolder);
            $tableHolder.append($bottomBorder);
            $(tableView.el).html('').append($tableHolder);
            // Apply necessary styles to table holders.
            this._refreshDOMElements();

            // Disable the table
            this._disableTableUI();

            // Handle table sorting
            this._initializeTableSorting();

            // Removing tab index for elements as it causes issue with JAWS
            this.$('.body-table-holder,.header-table-holder').removeAttr('tabindex');
        },

        /**
        * Apply custom background and font colors for header and data elements.
        * @method _applyCustomStyles
        * @private
        */
        _applyCustomStyles: function _applyCustomStyles() {
            var self = this,
                currentModel = this.model,
                $headerElements = this.$('.tbl-header,.tbl-sub-header,.tbl-section-header'),
                $arrowElements = this.$('.tbl-header-up-arrrow-image,.tbl-header-down-arrrow-image'),
                headerStyle = $headerElements.attr('style'),
                $cellElements = this.$('.tbl-cell'),
                emptyCellElements = this.$('.tbl-cell .table-blank-data'),
                cellStyle = $cellElements.attr('style'),
                headerRowCustomClass = currentModel.get('headerRowCustomClass'),
                headerRowBGPath = currentModel.get('headerRowBGPath'),
                dataRowCustomClass = currentModel.get('dataRowCustomClass'),
                dataRowBGPath = currentModel.get('dataRowBGPath'),
                tableBorderClass = currentModel.get('tableBorderClass'),
                notationPadding;

            /**Header row customization**/
            if (headerRowCustomClass !== null) {
                $headerElements.addClass(headerRowCustomClass);
                $arrowElements.addClass(headerRowCustomClass)
            }
            if (headerRowBGPath !== null) {
                headerStyle = $headerElements.attr('style');
                if (headerStyle === null || headerStyle === undefined) {
                    headerStyle = '';
                }
                $headerElements.attr('style', headerStyle + 'background-image: url("' + headerRowBGPath + '") !important;');
            }

            /**Data row customization**/
            if (dataRowCustomClass !== null) {
                $cellElements.addClass(dataRowCustomClass);
                emptyCellElements.addClass(dataRowCustomClass);
            }
            if (dataRowBGPath !== null) {
                cellStyle = $cellElements.attr('style');
                if (cellStyle === null || cellStyle === undefined) {
                    cellStyle = '';
                }
                $cellElements.attr('style', cellStyle + 'background-image: url("' + dataRowBGPath + '") !important;');
            }

            /**Table custom border**/
            if (tableBorderClass !== null) {
                this.$('.tbl th, .tbl td, table.tbl, .table-bottom-border').addClass(tableBorderClass);
            }
            // Adjusting margin-top of body table
            this.$('.body-table').css({ 'margin-top': -(this.$('.header-table').height() + 1) + 'px' });
        },

        /**
        * Binds event listeners based on changes in model.
        * @method _bindEventListeners
        * @type private
        */
        _bindEventListeners: function _bindEventListeners() {
            var eventNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable.Events,
                currentModel = this.model;

            this.listenTo(currentModel, eventNamespace.HIGHLIGHT_ROW_NUMBER, this._highlightRowNumber);
            this.listenTo(currentModel, eventNamespace.SCROLL_TO_ROW_NUMBER, this._scrollToRowNumber);
            this.listenTo(currentModel, eventNamespace.ADD_ROW, this._addRow);
            this.listenTo(currentModel, eventNamespace.SHOW_AUTO_FILLED_VALUES, this._showAutoFilledValues);
            this.listenTo(currentModel, eventNamespace.HIDE_AUTO_FILLED_VALUES, this._hideAutoFilledValues);
            this.listenTo(currentModel, eventNamespace.ENABLE_DISABLE_HEADER, this._enableDisableHeader);
            this.listenTo(currentModel, eventNamespace.ENABLE_DISABLE_COLUMN, this._enableDisableColumn);
            this.listenTo(currentModel, eventNamespace.ENABLE_DISABLE_ROW, this._enableDisableRow);
            this.listenTo(currentModel, eventNamespace.SORT_COLUMN, this._sortColumn);
            this.listenTo(currentModel, eventNamespace.ENABLE_DISABLE_SORT_COLUMN, this._enableDisableSortingOnColumn);
            this.listenTo(currentModel, eventNamespace.ENABLE_DISABLE_TABLE_HEADER_CLICK, this._enableDisableTableHeaderClicks);
            this.listenTo(currentModel, eventNamespace.SHOW_HIDE_COMPARISON_TICKS_IN_TABLE, this._showHideComparisonTicksInTable);
            this.listenTo(currentModel, eventNamespace.SET_NEXT_ACC_ELEMENT, this._setNextAccElement);
            this.listenTo(currentModel, eventNamespace.SET_PREV_ACC_ELEMENT, this._setPreviousAccElement);
            this.listenTo(currentModel, eventNamespace.MODIFY_TABLE_ROW, this._modifyTableRow);
            this.listenTo(currentModel, eventNamespace.MODIFY_HEADER_ROW, this._modifyHeaderRow);
            this.listenTo(currentModel, eventNamespace.DELETE_TABLE_ROW, this._deleteTableRow);
            this.listenTo(currentModel, eventNamespace.SET_TABLE_TAB_INDEX, this._setTableTabIndex);
            this.listenTo(currentModel, eventNamespace.SET_FOCUS_TO_TABLE, this._setFocusToTable);
            this.listenTo(currentModel, eventNamespace.ADD_TAB_INDEX_TO_ELEMENTS, this._addTabIndexToElements);
            this.listenTo(currentModel, eventNamespace.CLEAR_DATA_FROM_TABLE, this._renderModifiedTable);
            this.listenTo(currentModel, eventNamespace.REFRESH_TABLE, this._refreshTable);
            this.listenTo(currentModel, eventNamespace.COLUMN_HEADER_CLICK, this._triggerHeaderClick);
            this.listenTo(currentModel, eventNamespace.RESET_TABLE_SORT, this._resetTableSort);
            this.listenTo(currentModel, eventNamespace.MODIFY_DEFAULT_ROW_COUNT, this._updateTableWithNewRowCount);
        },

        /**
        * Renders table according to data from saved state
        * @method _populateSavedState
        * @private
        */
        _populateSavedState: function _populateSavedState() {
            var currentModel = this.model,
                currentHighlightedRow = currentModel.get('currentHighlightedRow'),
                disabledHeaders = currentModel.get('disabledHeaders'),
                disabledColumns = currentModel.get('disabledColumns'),
                disabledRows = currentModel.get('disabledRows'),
                lastSortedColumn = currentModel.get('lastSortedColumn'),
                sortDisabledColumns = currentModel.get('sortDisabledColumns'),
                enableTableHeaderClick = currentModel.get('enableTableHeaderClick'),
                columnsWithTicks = currentModel.get('columnsWithTicks'),
                nextElementAccId = currentModel.get('nextElementAccId'),
                prevElementAccId = currentModel.get('prevElementAccId'),
                tableTabIndex = currentModel.get('tableTabIndex'),
                tabIndexElements = currentModel.get('tabIndexElements'),
                lastSortedColumnNo,
                lastSortedOrder,
                selectorString,
                startTabIndex,
                tabIndexIncrement,
                tabIndexElement,
                sortOrderText,
                counter;

            // row-highlighing
            if (currentModel.get('showCurrentRowColor') === true && currentHighlightedRow !== null) {
                currentModel.highlightRowNumber(currentHighlightedRow);
            }
            // disable headers
            if (disabledHeaders !== null && disabledHeaders !== undefined && disabledHeaders.length > 0) {
                for (counter = 0; counter < disabledHeaders.length; counter++) {
                    currentModel.enableDisableHeader(disabledHeaders[counter], true);
                }
            }
            // disable columns
            if (disabledColumns !== null && disabledColumns !== undefined && disabledColumns.length > 0) {
                for (counter = 0; counter < disabledColumns.length; counter++) {
                    currentModel.enableDisableColumn(disabledColumns[counter], true);
                }
            }
            // disable rows
            if (disabledRows !== null && disabledRows !== undefined) {
                for (counter = 0; counter < disabledRows.length; counter++) {
                    currentModel.enableDisableRow(disabledRows[counter].rowNumber, true, disabledRows[counter].cellList);
                }
            }
            // table header click enable disable
            if (enableTableHeaderClick !== null && enableTableHeaderClick !== undefined) {
                currentModel.enableDisableTableHeaderClicks(enableTableHeaderClick);
            }
            // disable columns sort
            if (sortDisabledColumns !== null && sortDisabledColumns !== undefined && sortDisabledColumns.length > 0) {
                currentModel.enableDisableSortingOnColumn(false, sortDisabledColumns);
            }
            // last sorted column
            if (lastSortedColumn !== null && lastSortedColumn !== undefined) {
                lastSortedColumnNo = lastSortedColumn.get('columnNumber');
                lastSortedOrder = lastSortedColumn.get('sortingOrder');
                if (lastSortedColumnNo !== null && lastSortedColumnNo !== undefined) {
                    sortOrderText = (lastSortedOrder === 0) ? 'Asc' : 'Desc';
                    this.$('.body-table thead .col_' + lastSortedColumnNo).addClass('tablesorter-header' + sortOrderText);
                    currentModel.sortColumn(lastSortedColumnNo, lastSortedOrder);
                }
            }
            // show comparison ticks
            if (columnsWithTicks !== null && columnsWithTicks !== undefined && columnsWithTicks.length > 0) {
                currentModel.showHideComparisonTicksInTable(true, columnsWithTicks);
            }
            // set next acc id
            if (nextElementAccId !== null && nextElementAccId !== undefined) {
                currentModel.setNextAccElement(nextElementAccId);
            }
            // set prev acc id
            if (prevElementAccId !== null && prevElementAccId !== undefined) {
                currentModel.setPreviousAccElement(prevElementAccId);
            }
            // to set table tab index
            if (tableTabIndex !== null && tableTabIndex !== undefined) {
                currentModel.setTableTabIndex(tableTabIndex);
            }
            // tab index to elements
            if (tabIndexElements !== null && tabIndexElements !== undefined && tabIndexElements.models.length > 0) {
                for (counter = 0; counter < tabIndexElements.models.length; counter++) {
                    tabIndexElement = tabIndexElements.models[counter];
                    selectorString = tabIndexElement.get('selectorString');
                    startTabIndex = tabIndexElement.get('startTabIndex');
                    tabIndexIncrement = tabIndexElement.get('tabIndexIncrement');
                    if (startTabIndex !== null && startTabIndex !== undefined) {
                        currentModel.addTabIndexToElements(selectorString, startTabIndex, tabIndexIncrement);
                    }
                }
            }
        },

        /**
        * Initializes and handle table sorting.
        * @method _initializeTableSorting
        * @private
        */
        _initializeTableSorting: function _initializeTableSorting() {
            var currentModel = this.model,
                columnsForCustomSort = currentModel.get('columnsForCustomSort'),
                eventNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable.Events,
                self = this,
                counter,
                classForSorting,
                textExtractionFunction,
                blankDataNodes,
                textExtractionObject = {};

            if (currentModel.get('enableTableSorting') === true) {
                // Creates text extraction object for ignoring dashes in cell values
                for (counter = 0; counter < this._columnCount; counter++) {
                    textExtractionFunction = function (node, table, cellIndex) {
                        blankDataNodes = $(node).find('.table-blank-data');
                        if (blankDataNodes.length > 0) {
                            if (blankDataNodes.is(':visible')) {
                                return '';
                            }
                        }
                        else {
                            return $(node).text();
                        }
                    }
                    textExtractionObject[counter] = textExtractionFunction;
                }
                // Creates text extraction object for custom sorting on hidden values
                if (columnsForCustomSort !== null) {
                    this._setCoordinateSortValues();
                    classForSorting = currentModel.get('classForCustomSort');
                    textExtractionFunction = function (node, table, cellIndex) {
                        return $(node).find('.' + classForSorting).text();
                    };
                    for (counter = 0; counter < columnsForCustomSort.length; counter++) {
                        textExtractionObject[columnsForCustomSort[counter]] = textExtractionFunction;
                    }
                }
                this.$('.body-table').tablesorter({
                    textExtraction: textExtractionObject
                });
                this.$('.body-table .tbl-header').removeAttr('tabindex');
                this.$('.body-table').off('sortEnd').on('sortEnd', function (event) {
                    self._rearrangeTableData();
                    self.model.trigger(eventNamespace.TABLE_SORT_COMPLETE);
                    //self._setFocusToTable();
                });
                for (counter = 0; counter < this._columnCount; counter++) {
                    this.$('.body-table')[0].config.headers[counter] = { sorter: true };
                }

                if (currentModel.get('enableTableHeaderClick') === true) {
                    this._enableDisableTableHeaderClicks();
                }
            }
        },

        /**
        * Highlight a particular row
        * @method _highlightRowNumber
        * @param {Number} rowNumber Index of the row to be highlighted
        * @private
        */
        _highlightRowNumber: function _highlightRowNumber() {
            var rowNumber = this.model.get('currentHighlightedRow');
            this.$('.currentRowColor').removeClass('currentRowColor');
            this.$('.current-row').removeClass('current-row');
            $(this.$('.body-table-holder tbody').find('tr').get(rowNumber - 1)).find('td').addClass('current-row currentRowColor');
            if (this.$('.current-row').position()) {
                this.$('.body-table-holder').scrollTop(0);
                this.$('.body-table-holder').scrollTop(this.$('.current-row').position().top - this.$('.body-table-holder').height() + this.$('.current-row').height());
            }
        },

        /**
        * Scroll to a particular row
        * @method _scrollToRowNumber
        * @param {Number} rowNumber Index of the row to be brought into focus
        * @private
        */
        _scrollToRowNumber: function _scrollToRowNumber(rowNumber) {
            var $bodyTableHolder = this.$('.body-table-holder'),
                $bodyTableTbody = this.$('.body-table-holder tbody'),
                $row = $($bodyTableTbody.find('tr').get(rowNumber - 1)),
                $rowParent = null,
                rowTop = 0,
                parentTop = 0;

            if ($row) {
                $rowParent = $row.parent();
                rowTop = $row.position().top;
                parentTop = $rowParent.position().top;
            }
            $bodyTableHolder.scrollTop(0);
            $bodyTableHolder.scrollTop(rowTop - parentTop);
        },

        /**
        * Add a new row in the table
        * @method _addRow
        * @param {Backbone.Model} rowModel Model of the new row to be added.
        * @private
        */
        _addRow: function _addRow(rowModel) {
            var $bodyTableHolder = this.$('.body-table-holder'),
                $completeTableHolder = this.$('.complete-table-holder'),
                rowView = new MathInteractives.Common.Components.Theme2.Views.DataRow({
                    model: rowModel,
                    defaultColumnCount: this.model.get('defaultColumnCount'),
                    filePath: this.filePath
                });

            this._checkDuplicateNAddRow(this, rowView);
            this._setCoordinateSortValues();
            if ($bodyTableHolder[0].scrollHeight > $bodyTableHolder[0].offsetHeight) {
                $completeTableHolder.css({ 'width': $(this.el).width() + 'px' });
            }
        },

        /**
        * Checks if the row already exists; if not, adds it to table.
        * @method _checkDuplicateNAddRow
        * @param {Backbone.View} tableView View of the table.
        * @param {Backbone.View} rowView View of the new row to be added.
        * @private
        */
        _checkDuplicateNAddRow: function _checkDuplicateNAddRow(tableView, rowView) {
            var rowCount = 1, //tableView.model.get('tableData').length,
                $tBody = tableView.$('tbody'),
                duplicateRowCount = 0,
                showRedundantValues = tableView.model.get('showRedundantValues'),
                showCurrentRowColor = tableView.model.get('showCurrentRowColor'),
                blinkRedundantRow = tableView.model.get('blinkRedundantRow'),
                changeRedundantRowToCurrent = tableView.model.get('changeRedundantRowToCurrent'),
                rowNumber;

            for (var i = 0; i < rowCount; i++) {
                var rowSame = false,
                    rowViewValues = [],
                    rowReference, rowValues, // duplicateRowIndex, rowNo;
                    isSeparator = rowView.model.get('isSeparatorRow');

                $(rowView.el).find('div').each(function () {
                    rowViewValues.push($(this).text());
                });
                /*check for duplicate rows*/
                $tBody.find('tr').each(function () {
                    rowValues = [];
                    $(this).find('div').each(function () {
                        rowValues.push($(this).text());
                    });

                    var isSameRow = true;
                    for (var j = 0; j < rowViewValues.length; j++) {
                        if (rowViewValues[j] !== rowValues[j] || isSeparator === true) {
                            isSameRow = false;
                        }
                        //if (isSameRow === true) break;
                    }
                    if (isSameRow === true) {
                        rowReference = $(this).find('td');
                        rowSame = true;
                        duplicateRowCount++;
                    }
                });

                if (rowSame === true) {
                    if (blinkRedundantRow === true) {
                        /*blink redundant row*/
                        rowReference.each(function () {
                            $(this).addClass('blinkRowColor');
                        });
                    }
                }
                if ((rowSame === true && showRedundantValues === true) || rowSame === false) {
                    if (tableView.$('.empty-row').length > 0) {
                        //tableView.model.get('tableData').add(rowView.model);
                        tableView.$('.empty-row:first').before($(rowView.el));
                        tableView.$('.empty-row:last').remove();
                    }
                    else {
                        //tableView.model.get('tableData').add(rowView.model);
                        tableView.$('.body-table  tbody').append($(rowView.el))
                    }
                    rowNumber = $tBody.find('tr').length - tableView.$('.empty-row').length;
                    rowView.model.set('rowNumber', rowNumber);
                    rowView.model.set('originalRowNumber', rowNumber);
                    tableView.model.get('tableData').add(rowView.model);
                    $(rowView.el).find('td,th').addClass('row_' + rowNumber);
                    $(rowView.el).attr('rowNumber', rowNumber);
                }
                if (rowSame === true && changeRedundantRowToCurrent === true) {/*identify current row and color appropriate row*/
                    $(rowReference[0]).parents().find('tr.table-row').find('td').removeClass('current-row');
                    rowReference.each(function () {
                        $(this).addClass('current-row');
                    });
                    // only if current row has to be highlighted
                    if (showCurrentRowColor === true) {
                        $(rowReference[0]).parents().find('tr.table-row').find('td').removeClass('currentRowColor');
                        rowReference.each(function () {
                            $(this).addClass('currentRowColor');
                        });
                        // highlighting current row (store in model)
                        this.model.highlightRowNumber($(rowReference).parent().attr('rownumber'));
                    }
                }

                if (i === rowCount - 1) {
                    $(rowView.el).parent().find('td').removeClass('current-row');
                    $(rowView.el).find('td').addClass('current-row');
                    // only if current row has to be highlighted
                    if (showCurrentRowColor === true) {
                        $(rowView.el).parent().find('td').removeClass('currentRowColor');
                        $(rowView.el).find('td').addClass('currentRowColor');
                        // highlighting current row (store in model)
                        if (rowSame === false || (rowSame === true && showRedundantValues === true)) {
                            this.model.highlightRowNumber($(rowView.el).attr('rownumber'));
                        }
                    }
                }
                if (this.model.get('tableBorderClass') !== null) {
                    $(rowView.el).find('td').addClass(this.model.get('tableBorderClass'));
                }
                if (this.model.get('dataRowCustomClass') !== null) {
                    $(rowView.el).find('td').addClass(this.model.get('dataRowCustomClass'));
                    this.$('.tbl-cell .table-blank-data').addClass(this.model.get('dataRowCustomClass'))
                }
            }
            if (showRedundantValues === true) duplicateRowCount = 0;
            //scroll to the current row
            if (tableView.$('.current-row').position()) {
                tableView.$('.body-table-holder').scrollTop(0);
                tableView.$('.body-table-holder').scrollTop(tableView.$('.current-row').position().top); //  - tableView.$('.body-table-holder').height());
            }
        },

        /**
        * Disables entire table. (Grays out the table styles)
        * @method _disableTableUI
        * @private
        */
        _disableTableUI: function _disableTableUI() {
            var $tableMask,
                tableHeaderHeight = this.$('.header-table').height(),
                $bodyTableHolder = this.$('.body-table-holder'),
                $headerTableHolder = this.$('.header-table-holder');

            if (this.model.get('isTableDisabled') === true) {
                $tableMask = $('<div></div>', { class: 'tableMask' });

                this._addImportantToStyle($tableMask, {
                    'height': ($bodyTableHolder.height() + tableHeaderHeight + 2) + 'px',
                    'width': ($bodyTableHolder.width()) + 'px'
                });
                // $tableMask display none will stop table scroll
                $bodyTableHolder.append($tableMask);
                $headerTableHolder.find('table').addClass('disabled');
            }
        },

        /**
        * Adds tab index to elements of 'selectorString' 
        * @method _addTabIndexToElements
        * @param {Object} event Reference to selector and associated tab indices.
        * @private
        */
        _addTabIndexToElements: function _addTabIndexToElements(event) {
            var selectorString = event.selectorString,
                startTabIndex = event.startTabIndex,
                tabIndexIncrement = event.tabIndexIncrement,
                tabIncrement = (tabIndexIncrement !== undefined) ? tabIndexIncrement : 5,
                baseTabIndex = this.manager.model.get('startTabindex'),
                elementTabIndex;

            this.$(selectorString).each(function (index) {
                elementTabIndex = baseTabIndex + startTabIndex + (index * tabIncrement);
                $(this).attr('tabindex', elementTabIndex).addClass('hack-div');
            });
        },

        /**
        * Show auto filled values
        * @method _showAutoFilledValues
        * @private
        */
        _showAutoFilledValues: function _showAutoFilledValues() {
            this.$('.hide-autofill-data+.table-blank-data').hide(); //hide dashes in respective cells
            this.$('.hide-autofill-data').removeClass('hide-autofill-data').addClass('show-autofill-data');
        },

        /**
        * Hide auto filled values
        * @method _hideAutoFilledValues
        * @private
        */
        _hideAutoFilledValues: function _hideAutoFilledValues() {
            this.$('.show-autofill-data+.table-blank-data').show(); //show dashes in respective cells
            this.$('.show-autofill-data').removeClass('show-autofill-data').addClass('hide-autofill-data');
        },

        /**
        * Enable or Disable a particular header in the table
        * @method _enableDisableHeader
        * @param {Object} header data passed from the model.
        * @private
        */
        _enableDisableHeader: function _enableDisableHeader(headerData) {
            var headerColumnNumber = headerData.headerColumnNumber,
                toBeDisabled = headerData.toBeDisabled;

            if (headerColumnNumber >= 0 && headerColumnNumber < this._columnCount) {
                if (toBeDisabled) {
                    this.$('.header-table-holder thead .col_' + headerColumnNumber).addClass('table-header-disabled');
                }
                else {
                    this.$('.header-table-holder thead .col_' + headerColumnNumber).removeClass('table-header-disabled');
                }
            }
        },

        /**
        * Enable or Disable a particular column in the table
        * @method _enableDisableColumn
        * @param {Object} columnData Column data passed from the model.
        * @private
        */
        _enableDisableColumn: function _enableDisableColumn(columnData) {
            var columnNumber = columnData.columnNumber,
                toBeDisabled = columnData.toBeDisabled;

            if (columnNumber >= 0 && columnNumber < this._columnCount) {
                if (toBeDisabled) {
                    this.$('.body-table-holder tbody .col_' + columnNumber).addClass('table-column-disabled');
                }
                else {
                    this.$('.body-table-holder tbody .col_' + columnNumber).removeClass('table-column-disabled');
                }
            }
        },
        /**
        * Enable or Disable a particular row in the table
        * @method _enableDisableRow
        * @param {Object} rowData Row data passed from the model.
        * @private
        */
        _enableDisableRow: function _enableDisableRow(rowData) {
            var rowNumber = rowData.rowNumber,
                toBeDisabled = rowData.toBeDisabled,
                cellList = rowData.cellList,
                i = 0;

            if (rowNumber >= 0 && rowNumber < this.model.get('tableData').models.length) {
                if (toBeDisabled) {
                    if (cellList !== null && cellList !== undefined) {
                        for (; i < cellList.length; i++) {
                            this.$('.body-table-holder tbody .tbl-cell.row_' + rowNumber + '.col_' + cellList[i]).addClass('table-row-disabled');
                        }
                    } else {
                        this.$('.body-table-holder tbody .tbl-cell.row_' + rowNumber).addClass('table-row-disabled');
                    }
                }
                else {
                    if (cellList !== null && cellList !== undefined) {
                        for (; i < cellList.length; i++) {
                            this.$('.body-table-holder tbody .tbl-cell.row_' + rowNumber + '.col_' + cellList[i]).removeClass('table-row-disabled');
                        }
                    } else {
                        this.$('.body-table-holder tbody .tbl-cell.row_' + rowNumber).removeClass('table-row-disabled');
                    }
                }
            }
        },

        /**
        * Handler to sort table on header click event.
        * @method _onTableHeaderClick
        * @param {Object} event Object for click event
        * @private
        */
        _onTableHeaderClick: function _onTableHeaderClick(event) {
            if (this.model.get('enableTableSorting') !== true) { return false; }

            var $currentElement = $(event.currentTarget),
                columnNumber,
                customSortingOrder,
                previousColumnsList,
                sortForceOrder = null;

            if (!$currentElement.hasClass('tbl-header')) {
                // To get the header element in case a child element is triggered.
                $currentElement = $(event.currentTarget).parents('.tbl-header');
            }
            columnNumber = $currentElement.attr('class').split(' ')[1];
            columnNumber = Number(columnNumber.substr('col_'.length));

            if (this.model.get('customSortingOrder') !== null) {
                customSortingOrder = this.model.get('customSortingOrder');
                if (customSortingOrder[columnNumber] !== undefined) {
                    previousColumnsList = customSortingOrder[columnNumber];
                    sortForceOrder = [];
                    for (var i = 0; i < previousColumnsList.length; i++) {
                        sortForceOrder.push([previousColumnsList[i], 0]);
                    }
                }
            }

            this.$('.body-table')[0].config.sortForce = sortForceOrder;
            this.model.sortColumn(columnNumber, this._getSortOrderForColumn(columnNumber));
            this._scrollToRowNumber(1);
            this._setFocusToTable();
        },

        /**
        * Handler to sort table on header click event through accessibility.
        * @method _triggerHeaderClick
        * @param {Number} columnData Data of column to be sorted
        * @private
        */
        _triggerHeaderClick: function _triggerHeaderClick(columnData) {
            var columnIndex = columnData.columnIndex,
                $columnHeader = this.$('.tbl-header.sorting-enabled.row_0.col_' + columnIndex);
            if ($columnHeader.length > 0) {
                $columnHeader[0].click();
                this._setFocusToTable();
            }
        },

        /**
        * Gets the sorting order for the column based on how the column is currently sorted
        * @method _getSortOrderForColumn
        * @param columnNumber{Number} the column number
        * @private
        */
        _getSortOrderForColumn: function _getSortOrderForColumn(columnNumber) {
            var sortOrder = 0; // 0 for ascending, 1 for descending
            if (columnNumber >= 0 && columnNumber < this._columnCount) {
                if (!this.$('.body-table thead .col_' + columnNumber).hasClass('tablesorter-headerAsc'))
                    sortOrder = 0;
                else
                    sortOrder = 1;
            }
            return sortOrder;
        },

        /**
        * Sort individual column of table
        * @method _sortColumn
        * @private
        */
        _sortColumn: function _sortColumn() {
            var lastSortedColumn = this.model.get('lastSortedColumn'),
                columnNumber = lastSortedColumn.get('columnNumber'),
                sortingOrder = lastSortedColumn.get('sortingOrder'),
                sortOrder = 0, // 0 for ascending, 1 for descending
                sortOrderText;

            if (columnNumber >= 0 && columnNumber < this._columnCount) {
                if (sortingOrder !== undefined)
                    sortOrder = sortingOrder;
                else {
                    if (!this.$('.body-table thead .col_' + columnNumber).hasClass('tablesorter-headerAsc'))
                        sortOrder = 0;
                    else
                        sortOrder = 1;
                }

                lastSortedColumn.set('sortingOrder', sortOrder);

                sortOrderText = (sortOrder === 0) ? 'asc' : 'desc';
                if (this.$('.body-table')[0].config.headers[columnNumber].sorter !== false) {//to counter sorting of table even when sorting is disabled.
                    this.$('.body-table').trigger('update');
                    this.$('.body-table').trigger('sorton', [[[columnNumber, sortOrder]]]);// triggers the sort of body table
                    this.$('.header-table thead .tbl-sort-asc').removeClass('tbl-sort-asc');
                    this.$('.header-table thead .tbl-sort-desc').removeClass('tbl-sort-desc');
                    this.$('.header-table thead .col_' + columnNumber).addClass('tbl-sort-' + sortOrderText);
                }
            }
        },

        /**
        * Enable or disable sorting of entire table or specific columns.
        * @method _enableDisableSortingOnColumn
        * @param {Object} event Contains data from model for sorting
        * @private
        */
        _enableDisableSortingOnColumn: function _enableDisableSortingOnColumn(event) {
            var columnCount = this._columnCount,
                headersObject = {},
                enableSorting = event.enableSorting,
                columnList = event.columnList,
                counter;

            // if columnList not provided, disable entire table sorting.
            if (columnList !== undefined) columnCount = columnList.length;
            for (counter = 0; counter < columnCount; counter++) {
                if (columnList !== undefined && columnList !== null) {
                    headersObject[columnList[counter]] = { sorter: enableSorting };
                    this.$('.body-table')[0].config.headers[columnList[counter]] = headersObject[columnList[counter]];
                    if (enableSorting) {
                        $(this.$('.header-table .tbl-header')[columnList[counter]]).addClass('sorting-enabled').removeClass('sorting-disabled');
                    }
                    else {
                        $(this.$('.header-table .tbl-header')[columnList[counter]]).addClass('sorting-disabled').removeClass('sorting-enabled');
                    }
                }
                else {
                    headersObject[counter] = { sorter: enableSorting };
                    this.$('.body-table')[0].config.headers[counter] = headersObject[counter];
                    if (enableSorting) {
                        $(this.$('.header-table .tbl-header')[counter]).addClass('sorting-enabled').removeClass('sorting-disabled');
                    }
                    else {
                        $(this.$('.header-table .tbl-header')[counter]).addClass('sorting-disabled').removeClass('sorting-enabled');
                    }
                }
            }
            this.$('.body-table').trigger('update');
        },

        /**
        * Enable or disable click on table headers of entire table.
        * @method _enableDisableTableHeaderClicks
        * @private
        */
        _enableDisableTableHeaderClicks: function _enableDisableTableHeaderClicks() {
            var enableClick = this.model.get('enableTableHeaderClick');
            if (enableClick) {
                this.$('.header-table .tbl-header').addClass('sorting-enabled').removeClass('sorting-disabled');
            }
            else {
                this.$('.header-table .tbl-header').addClass('sorting-disabled').removeClass('sorting-enabled');
            }
        },

        /**
        * Reset table's sorting to default state.
        * @method _resetTableSort
        * @private
        */
        _resetTableSort: function _resetTableSort() {
            this.$('.body-table thead .tablesorter-headerAsc').removeClass('tablesorter-headerAsc');
            this.$('.body-table thead .tablesorter-headerDesc').removeClass('tablesorter-headerDesc');
            this.$('.header-table thead .tbl-sort-asc').removeClass('tbl-sort-asc');
            this.$('.header-table thead .tbl-sort-desc').removeClass('tbl-sort-desc');
        },

        /**
       * Update table entry with new default row count
       *
       * @method _updateTableWithNewRowCount
       * @private
       */
        _updateTableWithNewRowCount: function _updateTableWithNewRowCount() {
            var $tBody = this.$('tbody'),
                $tableRows = this.$('.body-table .table-row'),
                currentTableRowCount = $tableRows.length,
                $emptyRows = this.$('.body-table .empty-row'),
                noOfEmptyRows = $emptyRows.length,
                defaultRowCount = this.model.get('defaultRowCount'),
                currentRowData = [],
                rowsToDelete, rowCount, counter, rowsToInsert;

            if (currentTableRowCount > defaultRowCount && noOfEmptyRows > 0) {
                if ((currentTableRowCount - noOfEmptyRows) <= defaultRowCount) {
                    rowsToDelete = currentTableRowCount - defaultRowCount;
                }
                else {
                    rowsToDelete = noOfEmptyRows + 1;
                }

                // for rows to delete...
                rowCount = currentTableRowCount;
                // Delete from last row
                for (counter = rowsToDelete; counter > 0 ; counter--) {
                    this.model.deleteTableRow(rowCount);
                    rowCount--;
                }
            }
            else if (currentTableRowCount <= defaultRowCount) {
                //insert default empty rows
                rowsToInsert = defaultRowCount - (currentTableRowCount - 1);

                for (counter = 0; counter < this.model.get('defaultColumnCount') ; counter++) {
                    currentRowData.push({ text: MathInteractives.Common.Components.Theme2.Views.DataCell.defaultTextString });
                }
                for (counter = 0; counter < rowsToInsert; counter++) {
                    var rowView = new MathInteractives.Common.Components.Theme2.Views.DataRow({
                        model: new MathInteractives.Common.Components.Theme2.Models.DataTable.DataRow({
                            isHeaderRow: false,
                            rowData: currentRowData
                        }),
                        emptyRow: true
                    });
                    $tBody.append(rowView.el);
                }
                this._refreshDOMElements();
            }
        },

        /**
        * Rearrange order of data in table model on sorting
        * @method _rearrangeTableData
        * @private
        */
        _rearrangeTableData: function _rearrangeTableData() {
            var rowOrder = [],
                tableData = this.model.get('tableData'),
                modelsArray = [],
                counter,
                innerCounter;

            this.$('tbody tr.empty-bottom').each(function () {
                rowOrder.push(Number($(this).attr('rownumber')));
            });
            for (counter = 0; counter < rowOrder.length; counter++) {
                for (innerCounter = 0; innerCounter < tableData.length; innerCounter++) {
                    if (rowOrder[counter] == tableData.models[innerCounter].get('rowNumber')) {
                        modelsArray.push(this.model.get('tableData').models[innerCounter]);
                        break;
                    }
                }
            }
            for (counter = 0; counter < modelsArray.length; counter++) {
                $($(this.$('.body-table tbody')).find('tr')[counter]).attr('rownumber', counter + 1)
                modelsArray[counter].set('rowNumber', counter + 1);
                tableData.models[counter + 1] = modelsArray[counter];
            }
            this.model.set('tableData', tableData);

            if (this.model.get('showCurrentRowColor') === true) {
                // highlight current row
                this.model.highlightRowNumber($(this.$('.current-row')[0]).parent().attr('rownumber'));
            }
        },

        /**
        * Show or hide the ticks or crosses, generated after column comparison.
        * @method _showHideComparisonTicksInTable
        * @param {Object} event Data passed from model to display ticks and in which column(s)
        * @private
        */
        _showHideComparisonTicksInTable: function _showHideComparisonTicksInTable(event) {
            var showTicks = event.showTicks,
                columnList = event.columnList,
                counter;

            if (columnList !== undefined && columnList.length > 0) {
                for (counter = 0; counter < columnList.length; counter++) {
                    (showTicks) ? this.$('.body-table .col_' + columnList[counter] + ' .comparison-result').removeClass('hide-autofill-data') : this.$('.body-table .col_' + columnList[counter] + ' .comparison-result').addClass('hide-autofill-data');
                }
            }
            else {
                (showTicks) ? this.$('.body-table .comparison-result').removeClass('hide-autofill-data') : this.$('.body-table .comparison-result').addClass('hide-autofill-data');
            }
        },

        /*
         * Sets important to all style properties passed.
         * This is a temporary fix to solve DE enviromenet issue for table, need to remove this solution once fixed by DE.
         * @method _addImportantToStyle
         * @param {Object} $element jQuery DOM element(s)
         * @param {Object} props Style property of the element
         * @private
         */
        _addImportantToStyle: function _addImportantToStyle($element, props) {
            var $this,
                style,
                prop;

            $element.each(function () {
                $this = $(this);
                style = $this.attr('style');

                if (typeof style === 'undefined' || style === null) {
                    style = '';
                }
                for (prop in props) {
                    style += prop + ':' + props[prop] + ' !important;';
                }
                $this.attr('style', style);
            });
        },

        /**
        * Set focus to table holder
        * @method _onTableFocusIn
        * @private
        */
        _onTableFocusIn: function _onTableFocusIn() {
            if (!this.player.model.get('isAccessible')) { return false; }
            var self = this,
                isTouchDevice = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;

            self.player._enableDisableApplicationMode(false);
            if (!isTouchDevice) {
                self.$('.complete-table-holder').addClass('on-focus-in');
            }
        },

        /**
        * Remove focus from table holder div on focus out
        * @method _onTableFocusOut
        * @param {Object} event Reference to focus out event
        * @private
        */
        _onTableFocusOut: function _onTableFocusOut(event) {
            if (!this.player.model.get('isAccessible')) { return false; }
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();

            var self = this,
                nextAccElementExists = this.manager._checkElementExistsByAccId(this.idPrefix + this._nextAccElementId),
                prevAccElementExists = this.manager._checkElementExistsByAccId(this.idPrefix + this._previousAccElementId),
                isTouchDevice = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile,
                focusDelay = 0;

            if (this._hasAccDelay === true) {
                focusDelay = 10;
            }
            if (!isTouchDevice) {
                self.$('.complete-table-holder').removeClass('on-focus-in');
                self.player._enableDisableApplicationMode(true);
            }
            if (!self.model.get('hasInputBoxInTable')) {
                if (self._bShiftKeyPressed) {
                    (prevAccElementExists) ? self.setFocus(self._previousAccElementId, focusDelay) : $('#' + self.idPrefix + self._previousAccElementId).focus();
                }
                else {
                    (nextAccElementExists) ? self.setFocus(self._nextAccElementId, focusDelay) : $('#' + self.idPrefix + self._nextAccElementId).focus();
                }
            }
        },

        /**
        * Handle keydown events on table
        * @method _onTableKeyDown
        * @param {Object} event Reference to key down event
        * @private
        */
        _onTableKeyDown: function _onTableKeyDown(event) {
            if (!this.player.model.get('isAccessible') || this.model.get('hasInputBoxInTable')) { return false; }

            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();

            var keyCode = event.which || event.keyCode,
                $tableHolder = this.$('.body-table-holder'),
                self = this,
                nextAccElementExists = this.manager._checkElementExistsByAccId(this.idPrefix + this._nextAccElementId),
                prevAccElementExists = this.manager._checkElementExistsByAccId(this.idPrefix + this._previousAccElementId),
                focusDelay = 0;

            if (this._hasAccDelay === true) {
                focusDelay = 10;
            }

            self._bShiftKeyPressed = false;
            switch (keyCode) {//if tab key pressed
                case 9:
                    {
                        if (event.shiftKey) {//if shift-tab keys pressed
                            setTimeout(function () {
                                self._bShiftKeyPressed = true;
                                (prevAccElementExists) ? self.setFocus(self._previousAccElementId, focusDelay) : $('#' + self.idPrefix + self._previousAccElementId).focus();
                            }, 10);
                        }
                        else {
                            setTimeout(function () {
                                self._bShiftKeyPressed = false;
                                (nextAccElementExists) ? self.setFocus(self._nextAccElementId, focusDelay) : $('#' + self.idPrefix + self._nextAccElementId).focus();
                            }, 10);
                        }
                        return false;
                    }
                case 38://if up arrow pressed
                    {
                        $tableHolder.scrollTop($tableHolder.scrollTop() - 20);
                        break;
                    }
                case 40://if down arrow pressed
                    {
                        $tableHolder.scrollTop($tableHolder.scrollTop() + 20);
                        break;
                    }
                case 16: // if shift key is pressed
                    {
                        self._bShiftKeyPressed = true;
                        break;
                    }
            }
        },

        /**
        * Set previous acc element for the table
        * @method _setPreviousAccElement
        * @param {string} elementAccId Acc Id of element before table element
        * @private
        */
        _setPreviousAccElement: function _setPreviousAccElement() {
            var self = this;
            this._previousAccElementId = this.model.get('prevElementAccId');
            this.$('.body-table').off('focusout').on('focusout', function (event) {
                self._onTableFocusOut(event);
            });
            this.$el.off('keydown').on('keydown', function (event) {
                self._onTableKeyDown(event);
            });
        },

        /**
        * Set next acc element for the table
        * @method _setNextAccElement
        * @param {string} elementAccId Acc Id of element after table element
        * @private
        */
        _setNextAccElement: function _setNextAccElement() {
            var self = this;
            this._nextAccElementId = this.model.get('nextElementAccId');
            this.$('.body-table').off('focusout').on('focusout', function (event) {
                self._onTableFocusOut(event);
            });
            this.$el.off('keydown').on('keydown', function (event) {
                self._onTableKeyDown(event);
            });
        },

        /**
        * Modify the data in a particular row of table
        * @method modifyTableRow
        * @param {Object} event Data for a particular row passed from model
        * @private
        */
        _modifyTableRow: function _modifyTableRow(event) {
            var rowView,
                $currentRow,
                tableModel = this.model,
                rowModel = event.rowModel,
                rowNumber = event.rowNumber;

            rowView = new MathInteractives.Common.Components.Theme2.Views.DataRow({
                model: rowModel,
                defaultColumnCount: tableModel.get('defaultColumnCount'),
                filePath: this.filePath
            });
            $(rowView.el).attr('rownumber', rowModel.get('rowNumber'));

            tableModel.get('tableData').remove(tableModel.get('tableData').at(rowNumber));
            tableModel.get('tableData').add(rowModel, { at: rowNumber });

            $currentRow = $(this.$('.body-table tbody').find('tr')[rowNumber - 1]);
            $currentRow.before($(rowView.el));
            $currentRow.remove();

            this.$('.current-row').removeClass('current-row');
            $(rowView.el).find('td').addClass('current-row');

            if (tableModel.get('showCurrentRowColor') === true) {
                tableModel.highlightRowNumber(rowNumber);
            }
            this._refreshDOMElements();
            this._setCoordinateSortValues();
        },

        /**
        * Modify the data in a particular row of table header
        * @method _modifyHeaderRow
        * @param {Object} event Data for a particular row passed from model
        * @private
        */
        _modifyHeaderRow: function _modifyHeaderRow(event) {
            var rowView,
                $currentRow,
                tableModel = this.model,
                rowModel = event.rowModel,
                rowNumber = event.rowNumber;

            rowView = new MathInteractives.Common.Components.Theme2.Views.DataRow({
                model: rowModel,
                defaultColumnCount: tableModel.get('defaultColumnCount'),
                filePath: this.filePath
            });
            $(rowView.el).attr('rownumber', rowModel.get('rowNumber'));

            tableModel.get('tableData').remove(tableModel.get('tableData').at(rowNumber));
            tableModel.get('tableData').add(rowModel, { at: rowNumber });
            // for header table
            $currentRow = $(this.$('.header-table thead').find('tr')[rowNumber]);
            $currentRow.before($(rowView.el));
            $currentRow.remove();

            // for body table
            $currentRow = $(this.$('.body-table thead').find('tr')[rowNumber]);
            $currentRow.before($(rowView.el));
            $currentRow.remove();
            this._refreshDOMElements();
        },

        /**
        * Modify coordinate values to be sorted according to x and, if required, y
        * @method _setCoordinateSortValues
        * @private
        */
        _setCoordinateSortValues: function _setCoordinateSortValues() {
            var customColumns = this.model.get('columnsForCustomSort'),
                $valueSelector,
                $customSelector,
                customValues,
                counter,
                innerCounter,
                xValues = [],
                yValues = [],
                sortByValues = [];
            if (customColumns !== null && customColumns !== undefined) {
                for (counter = 0; counter < customColumns.length; counter++) {
                    $valueSelector = this.$('td.col_' + customColumns[counter] + ' .tbl-data .coordinate-sort');
                    $customSelector = this.$('td.col_' + customColumns[counter] + ' .' + this.model.get('classForCustomSort'));
                    xValues = [];
                    yValues = [];
                    sortByValues = [];

                    if ($valueSelector.length > 0) {
                        $valueSelector.each(function () {
                            customValues = $(this).text().replace('(', '').replace(')', '').split(',');
                            xValues.push(parseInt(customValues[0], 10));
                            yValues.push(parseInt(customValues[1], 10));
                        });

                        for (innerCounter = 0; innerCounter < xValues.length; innerCounter++) {
                            if (xValues.indexOf(xValues[innerCounter]) === xValues.lastIndexOf(xValues[innerCounter])) {
                                sortByValues.push(xValues[innerCounter]);
                            }
                            else {
                                sortByValues.push(xValues[innerCounter] + (yValues[innerCounter] / 100));
                            }
                        }

                        $customSelector.each(function (index) {
                            $(this).text(sortByValues[index]);
                        });
                    }
                }
            }
        },

        /**
        * Loads table screen.
        * @method _loadTableScreen
        * @private
        */
        _loadTableScreen: function _loadTableScreen() {
            var tableScreenId = this.model.get('tableScreenId');

            if (tableScreenId !== null && tableScreenId !== undefined && tableScreenId !== '') {
                this.unloadScreen(tableScreenId);
                this.loadScreen(tableScreenId);
            }
        },

        /** 
        * Check if a row is visible or hidden due to scroll
        * @method isThisRowVisible
        * @parameter {Number} rowNumber Indexed row number in the table
        * @return {Boolean} Whether row is visible.
        * @public
        */
        isThisRowVisible: function isThisRowVisible(rowNumber) {
            var $tableHolder = this.$('.body-table-holder'),
                tableHolderTop = $tableHolder.offset().top,
                tableHolderBottom = tableHolderTop + $tableHolder.height(),
                $rowHolder = this.$(this.$('.body-table-holder tr').get(rowNumber)),
                rowHolderTop = $rowHolder.offset().top,
                rowHolderBottom = rowHolderTop + $rowHolder.height();

            return ((rowHolderBottom >= tableHolderTop) && (rowHolderTop <= tableHolderBottom)
              && (rowHolderBottom <= tableHolderBottom) && (rowHolderTop >= tableHolderTop));
        },

        /**
        * Modify tab index of table element.
        * @method _setTableTabIndex
        * @private
        */
        _setTableTabIndex: function _setTableTabIndex() {
            var startTabIndex = 0,
                tabIndex = this.model.get('tableTabIndex');

            if (this.manager !== null && tabIndex !== -1) {
                startTabIndex = this.manager.model.get('startTabindex');
            }
            this.$('.body-table').attr('tabindex', startTabIndex + tabIndex);
        },

        /**
        * Set focus to table
        * @method _setFocusToTable
        * @private
        */
        _setFocusToTable: function _setFocusToTable() {
            this.$('.body-table').focus();
        },

        /**
        * Deletes a row from table.
        * @method _deleteTableRow
        * @param event {Object} Object containing data from event.
        * @private
        */
        _deleteTableRow: function _deleteTableRow(event) {
            var $currentRow,
                tableModel = this.model,
                rowNumber = event.rowNumber,
                $tBody = this.$('tbody'),
                currentRowData = [],
                rowsToInsert,
                $filledTableRows,
                $tableRows,
                rowView,
                counter;

            $currentRow = $(this.$('.body-table tbody').find('tr')[rowNumber - 1]);
            $currentRow.remove();

            $filledTableRows = this.$('tbody tr:not(.empty-row)');
            $tableRows = this.$('tbody .table-row');

            if ($tableRows.length < tableModel.get('defaultRowCount')) {
                rowsToInsert = tableModel.get('defaultRowCount') - $tableRows.length;

                //insert default empty rows
                for (counter = 0; counter < tableModel.get('defaultColumnCount') ; counter++) {
                    currentRowData.push({ text: MathInteractives.Common.Components.Theme2.Views.DataCell.defaultTextString });
                }

                for (counter = 0; counter < rowsToInsert; counter++) {
                    rowView = new MathInteractives.Common.Components.Theme2.Views.DataRow({
                        model: new MathInteractives.Common.Components.Theme2.Models.DataTable.DataRow({
                            isHeaderRow: false,
                            rowData: currentRowData
                        }),
                        emptyRow: true
                    });
                    $tBody.append(rowView.el);
                }
            }

            for (counter = 0; counter < $filledTableRows.length; counter++) {
                $($filledTableRows[counter]).attr('rownumber', counter + 1);
            }
            this._refreshDOMElements();
            if (tableModel.get('showCurrentRowColor') === true && $filledTableRows.length >= 1) {
                tableModel.highlightRowNumber(rowNumber);
            }
        },

        /**
        * Re-renders the table in case of model modification
        * @method _renderModifiedTable
        * @param event {Object} Event parameter
        * @private
        */
        _renderModifiedTable: function _renderModifiedTable(event) {
            this.render();
            this._populateSavedState();
        },

        /**
        * Refreshes DOM elements with modified styles.
        * @method _refreshDOMElements
        * @private
        */
        _refreshDOMElements: function _refreshDOMElements() {
            var currentNamespace = MathInteractives.Common.Components.Theme2.Views.DataTable,
                tableWidth = $(this.el).width() - currentNamespace.SCROLL_BAR_WIDTH,
                $bodyTableHolder = this.$('.body-table-holder'),
                $completeTableHolder = this.$('.complete-table-holder'),
                $headerElements = this.$('.tbl-header,.tbl-sub-header,.tbl-section-header'),
                tableHeaderHeight = this.$('.header-table').height(),
                $currentRow = this.$('.current-row'),
                headerLineHeight = currentNamespace.HEADER_LINE_HEIGHT,
                sortNotationHeight = currentNamespace.SORT_NOTATION_HEIGHT,
                notationPadding;

            this._applyCustomStyles();
            this._addImportantToStyle(this.$('.header-table, .body-table'), { width: tableWidth + 'px' });
            this._addImportantToStyle(this.$('.table-bottom-border'), { 'width': (tableWidth) + 'px' });
            if ($bodyTableHolder[0].scrollHeight > $bodyTableHolder[0].offsetHeight) {
                $completeTableHolder.css({ 'width': $(this.el).width() + 'px' });
            }
            else {
                $completeTableHolder.css({ 'width': tableWidth + 'px' });
            }
            this.$('.body-table').css({ 'margin-top': -(tableHeaderHeight + 1) + 'px' });

            //// Resetting scroll to 0
            //$bodyTableHolder.scrollTop(0);
            if ($currentRow.position()) {
                //$bodyTableHolder.scrollTop((this.$('.current-row').position().top + this.$('.current-row').height()) - $bodyTableHolder.height());
                $bodyTableHolder.scrollTop(Math.abs($currentRow.parents('tbody').position().top) + ($currentRow.position().top + $currentRow.height()) - $bodyTableHolder.height());
            }
            else {
                // Resetting scroll to 0
                $bodyTableHolder.scrollTop(0);
            }

            /**Adjusting table sort notations**/
            if (this.model.get('enableTableSorting') === true) {
                $headerElements.each(function () {
                    // Adjustment is done only for height above the default level.
                    if ($(this).find('.tbl-header-text').height() > headerLineHeight) {
                        notationPadding = Math.floor($(this).find('.tbl-header-text').height() / 2) - (sortNotationHeight / 2);
                        $(this).find('.tbl-header-sort-container').css({ 'margin-top': notationPadding + 'px' });
                    }
                });
            }
            this.$('.complete-table-holder').removeClass('on-focus-in');
        },

        /**
        * Rerenders the table (for tab switch like cases)
        * @method _refreshTable
        * @private
        */
        _refreshTable: function _refreshTable() {
            this._refreshDOMElements();
        },

        /**
        * Changes the model of the table to the passed model
        * @method changeModel
        * @public
        */
        changeModel: function changeModel(model) {
            this.model = model;
            this._initializeTable();
            return this.model;
        }
    }, {
        /**
        * Width of Scrollbar of the table when overflow
        * @property SCROLL_BAR_WIDTH
        * @static
        */
        SCROLL_BAR_WIDTH: 17,
        /**
        * Line height of the header text
        * @property HEADER_LINE_HEIGHT
        * @static
        */
        HEADER_LINE_HEIGHT: 18,
        /**
        * Height of the sort notations in header text
        * @property SORT_NOTATION_HEIGHT
        * @static
        */
        SORT_NOTATION_HEIGHT: 14,
    });

    /**
    * View for data row
    *
    * @class DataRow
    * @namespace MathInteractives.Common.Components.Theme2.Views
    */
    MathInteractives.Common.Components.Theme2.Views.DataRow = MathInteractives.Common.Player.Views.Base.extend({
        tagName: 'tr',
        className: function () {
            if (this.options.emptyRow === true)
                return 'table-row empty-row';
            else
                return 'table-row empty-bottom';
        },
        /*
        * calls render
        * @method initialize
        */
        initialize: function initialize() {
            this.render();
        },
        /*
        * initialises data row element
        * @method render
        */
        render: function render() {
            var rowView = this,
                colCount = this.model.get('rowData').length,
                cellHtml = '',
                isSeparator = rowView.model.get('isSeparatorRow');

            if (isSeparator) {
                var className = 'tbl-separator',
                    separatorModel = new MathInteractives.Common.Components.Theme2.Models.DataTable.DataCell(),
                    separatorBackgroundImage = rowView.model.get('separatorBackgroundImage'),
                    separatorBackgroundImagePosition = rowView.model.get('separatorBackgroundImagePosition');

                separatorModel.set({ 'colSpan': this.options.defaultColumnCount, 'text': ' ', 'addBlankData': false });
                /*creates cell view <td>*/
                var cellView = new MathInteractives.Common.Components.Theme2.Views.DataCell({
                    model: separatorModel,
                    tagName: 'td',
                    className: className + ' col_0',
                    parent: this, cellNumber: i,
                    player: this.options.player
                });
                cellHtml += cellView.el;
                $(this.el).append(cellView.el).addClass('tbl-separator-row');
                // adding background image to the separator
                if (separatorBackgroundImage !== null && separatorBackgroundImage !== undefined) {
                    $(this.el).css({ 'background-image': 'url("' + this.options.filePath.getImagePath(separatorBackgroundImage) + '")' });
                    if (separatorBackgroundImagePosition !== null && separatorBackgroundImagePosition !== undefined) {
                        $(this.el).css({ 'background-position': separatorBackgroundImagePosition.x + ' ' + separatorBackgroundImagePosition.y });
                    }
                }
            } else {
                for (var i = 0; i < colCount; i++) {
                    var isHeader = rowView.model.get('isHeaderRow'),
                        isSubheader = rowView.model.get('isSubHeaderRow'),
                        isTableSectionHeader = rowView.model.get('isTableSectionHeaderRow');

                    if (isHeader || isSubheader) {
                        var className = 'tbl-header';
                        if (isSubheader) {
                            className = 'tbl-sub-header';
                        }
                        /*creates cell view <th>*/
                        var cellView = new MathInteractives.Common.Components.Theme2.Views.DataCell({
                            model: rowView.model.get('rowData').models[i],
                            tagName: 'th',
                            className: className + ' col_' + i,
                            parent: this, cellNumber: i,
                            player: this.options.player,
                            idSuffix: this.options.idSuffix,
                            enableTableSorting: this.options.enableTableSorting,
                            isHeaderAutoWidth: this.options.isHeaderAutoWidth
                        });
                    }
                    else {
                        /*creates cell view <td>*/
                        var className = 'tbl-cell';
                        if (isTableSectionHeader) {
                            className = 'tbl-section-header';
                        }
                        /*creates cell view <td>*/
                        var cellView = new MathInteractives.Common.Components.Theme2.Views.DataCell({
                            model: rowView.model.get('rowData').models[i],
                            tagName: 'td',
                            className: className + ' col_' + i,
                            parent: this, cellNumber: i,
                            player: this.options.player
                        });
                    }
                    cellHtml += cellView.el;
                    $(this.el).append(cellView.el);
                }
            }
            // allows chaining
            return this;
        }
    });

    /**
    * View for data column
    *
    * @class DataCell
    * @namespace MathInteractives.Common.Components.Theme2.Views
    */
    MathInteractives.Common.Components.Theme2.Views.DataCell = MathInteractives.Common.Player.Views.Base.extend({
        /*
        * calls render
        * @method initialize
        */
        initialize: function initialize() {
            this.render();
        },

        /*
        * Initializes properties of data cell
        * @method render
        * @constructor
        */
        render: function render() {
            var cellData = this.model.get('text'),
                initialText = cellData,
                currentNameSpace = MathInteractives.Common.Components.Theme2.Views.DataCell,
                formulaForCalculation = this.model.get('formulaForCalculation'),
                showAutoFillValue = false,
                formulaResult = null,
                autoFillDataClass = 'hide-autofill-data',
                compareWithColumns = this.model.get('compareWithColumns'),
                comparisonClasses = '',
                showTicksInThisCell = this.model.get('showTicksInThisCell'),
                showTicksClass = (showTicksInThisCell) ? '' : 'hide-autofill-data',
                columnNumberForTicks = this.model.get('columnNumberForTicks'),
                comparisonResultHtml = '',
                rowView = this.options.parent,
                $comparisonDiv,
                comparisonDivHtml = '',
                currentCellNumber = this.options.cellNumber,
                player = this.options.player,
                enableTableSorting = this.options.enableTableSorting,
                isHeaderAutoWidth = this.options.isHeaderAutoWidth,
                idSuffix = (this.options.idSuffix === '') ? '-' : this.options.idSuffix + '-',
                playerView = MathInteractives.Common.Player.Views.Player,
                playerTheme,
                counter,
                headerTextClass = 'tbl-header-text',
                sortNotations;

            if (this.model.get('colSpan') !== null) { //typeof is giving 'undefined'
                $(this.el).attr('colspan', this.model.get('colSpan'));
            }
            if (this.model.get('rowSpan') !== null) { //typeof is giving 'undefined'
                $(this.el).attr('rowspan', this.model.get('rowSpan'));
            }

            if (formulaForCalculation !== null && formulaForCalculation !== undefined) {
                if (this.model.get('showCalculatedValues')) {
                    showAutoFillValue = true;
                    autoFillDataClass = '';
                }
                cellData = '<span class=' + autoFillDataClass + '>' + this._getFormulaResult(formulaForCalculation, rowView) + '</span>';
            }
            if (showAutoFillValue === false) {
                if ((initialText === '' || initialText === null) && this.model.get('addBlankData') !== false)
                    cellData += currentNameSpace.defaultTextString;
                else if (this.model.get('addBlankData') === true) {
                    cellData += currentNameSpace.defaultTextString;
                }
                else if (this.model.get('addBlankData') === null) {
                    if (this.isCellDataBlank(initialText) === true)
                        cellData += currentNameSpace.defaultTextString;
                }
            }

            if (compareWithColumns !== null && compareWithColumns !== undefined) {
                if (compareWithColumns.length > 0) {
                    for (counter = 0; counter < compareWithColumns.length; counter++) {
                        if (cellData == rowView.model.get('rowData').models[compareWithColumns[counter]].get('text')) {
                            comparisonClasses += ' equal-to-col-' + compareWithColumns[counter];
                            comparisonResultHtml = '<span class="' + showTicksClass + ' comparison-correct comparison-result"></span>';
                        }
                        else {
                            comparisonResultHtml = '<span class="' + showTicksClass + ' comparison-incorrect comparison-result"></span>';
                        }
                    }
                }
            }
            if (columnNumberForTicks !== null && columnNumberForTicks !== undefined && columnNumberForTicks !== currentCellNumber) {
                $(this.el).html('<div class="tbl-data' + comparisonClasses + '">' + cellData + '</div>');
                rowView.model.get('rowData').models[columnNumberForTicks].set('hasTick', true);
                rowView.model.get('rowData').models[columnNumberForTicks].set('tickHtmlStructure', comparisonResultHtml);
            }
            else {
                if (this.model.get('hasTick') === true) {
                    comparisonResultHtml = this.model.get('tickHtmlStructure');
                }

                if (player !== undefined && player !== null) {
                    playerTheme = player.getPlayerThemeType();
                    if (this.options.tagName === 'th' && playerTheme === playerView.THEMES.THEME_2 && enableTableSorting === true) {
                        sortNotations = MathInteractives.Common.Components.templates.tableSortNotation({
                            columnID: player.getIDPrefix() + 'tbl-sort-notation' + idSuffix + currentCellNumber
                        }).trim();

                        if (isHeaderAutoWidth === true) {
                            comparisonClasses += ' auto-width';
                        }
                        cellData = '<div class="tbl-header-text">' + cellData + '</div>';
                        cellData += sortNotations;
                    }
                }
                $(this.el).html('<div class="tbl-data' + comparisonClasses + '">' + cellData + comparisonResultHtml + '</div>'); // + comparisonDivHtml);
            }
            if (this.model.get('showTicksInThisCell'))
                $(this.el).find('.comparison-result').removeClass('hide-autofill-data');
            if (this.$('.comparison-result').length > 0) {
                if (this.filePath !== null && this.filePath !== undefined) {
                    this.$('.comparison-result').css({ 'background-image': 'url(' + this.filePath.getImagePath('table-tick-and-cross') + ')' });
                }
                else {
                    alert('Please specify filePath for table');
                }
            }
            return this;
        },

        /*
        * Checks if cell content is empty.
        * @method isCellDataBlank
        * @param {Object} cellData Content of a particular table cell
        * @return {Boolean} Whether the cell content is blank
        * @private
        */
        isCellDataBlank: function isCellDataBlank(cellData) {
            var isEmpty = true;

            $('<div></div>', { class: 'data-table-cell-data-container-dummy' }).append(cellData).appendTo('body');
            if ($('.data-table-cell-data-container-dummy').text().trim() !== '' || $('.data-table-cell-data-container-dummy input').length > 0)
                isEmpty = false;
            else {
                $('.data-table-cell-data-container-dummy').children().each(function () {
                    if ($(this).hasClass('table-blank-data')) {
                        isEmpty = false;
                        return false;
                    }
                    else if ($(this).prop('tagName').toLowerCase() === 'img') {
                        if ($(this).css('display') !== 'none' && $(this).attr('src') !== undefined) {
                            isEmpty = false;
                            return false;
                        }
                    }
                    else if ($(this).text().trim() !== '') {
                        isEmpty = false;
                        return false;
                    }
                    else if ($(this).css('display') !== 'none' && $(this).css('background-image') !== 'none') {
                        isEmpty = false;
                        return false;
                    }
                });
            }
            $('.data-table-cell-data-container-dummy').remove();
            return isEmpty;
        },

        /*
        * Returns result for a cell after applying formula
        * @method _getFormulaResult
        * @param {String} formulaString Formula to be applied
        * @param {Object} rowView Row on which the formula is to be applied
        * @return {Object} Resultant value of the formula applied on row
        * @private
        */
        _getFormulaResult: function _getFormulaResult(formulaString, rowView) {
            var result = this._generateFormulaString(formulaString, rowView);

            try { //try catch used in case eval gives errors
                result = eval(result);
            }
            catch (error) {
                console.log('Error ' + error + ' Please use a valid formula.');
            }
            return result;
        },

        /*
        * Returns resultant formula string to be evaluated.
        * @method _generateFormulaString
        * @param {String} inputFormula Formula to be applied
        * @param {Object} rowView Row on which the formula is to be applied
        * @return {String} Resultant string of the formula to be applied on row
        * @private
        */
        _generateFormulaString: function _generateFormulaString(inputFormula, rowView) {
            var resultantFormula = inputFormula,
                self = this,
                formulaPlaceHolder = MathInteractives.Common.Components.Theme2.Views.DataCell.placeHolderInFormula,
                colNumbersOrder = [],
                position;

            function replaceColInString(formula) {
                if (formula.indexOf('col') !== -1) {
                    position = formula.indexOf('col') + 3; //3 to get the position of the column number
                    colNumbersOrder.push(parseInt(formula.charAt(position), 10));
                    formula = self._setCharacterAt(formula, position, '');
                    formula = formula.replace('col', formulaPlaceHolder);
                }
                return formula;
            }

            do {
                resultantFormula = replaceColInString(resultantFormula);
            } while (resultantFormula.indexOf('col') != -1);

            resultantFormula = this._insertDataIntoFormula(resultantFormula, colNumbersOrder, rowView, formulaPlaceHolder);
            return resultantFormula;
        },

        /*
        * Appends a string at specified location in another string
        * @method _setCharacterAt
        * @param {String} originalString String in which another string is to be added.
        * @param {Number} index Index at which string is to be added
        * @param {String} stringToBeAdded String to be added at given index
        * @return {String} Resultant string
        * @private
        */
        _setCharacterAt: function _setCharacterAt(originalString, index, stringToBeAdded) {
            return originalString.substr(0, index) + stringToBeAdded + originalString.substr(index + 1);
        },

        /*
        * Replaces place holders in formula, with its actual value
        * @method _insertDataIntoFormula
        * @param {String} formulaString Formula to be applied
        * @param {Array} dataOrder Order in which the columns are in the formula
        * @param {Object} rowView Row on which the formula is to be applied
        * @param {String} placeHolderString String in which the actual value is to be placed.
        * @return {String} Resultant string of the formula to be applied on row
        * @private
        */
        _insertDataIntoFormula: function _insertDataIntoFormula(formulaString, dataOrder, rowView, placeHolderString) {
            var counter,
                rowText;

            for (counter = 0; counter < dataOrder.length; counter++) {
                rowText = rowView.model.get('rowData').models[dataOrder[counter]].get('text');
                formulaString = formulaString.replace(placeHolderString, rowText);
            }
            return formulaString;
        }
    }, {
        /**
        * Default string for empty cell.
        * @property defaultTextString
        * @type String
        * @static
        */
        defaultTextString: '<span class="typography-label table-blank-data" >&#8211; &#8211; &#8211;</span>',

        /**
        * Place holder string in formula
        * @property placeHolderInFormula
        * @type String
        * @static
        */
        placeHolderInFormula: 'DataPlaceHolder'
    });

    MathInteractives.global.Theme2DataTable.View = MathInteractives.Common.Components.Theme2.Views.DataTable;
})();