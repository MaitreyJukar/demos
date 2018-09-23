
(function () {
    /**
    * Model structure for populating a data table.
    * @class DataTable
    * @namespace MathInteractives.Common.Components.Theme2.Models
    */
    MathInteractives.Common.Components.Theme2.Models.DataTable = Backbone.Model.extend({
        defaults: {
            /**
            * Whether table contains colspan / rowspan.
            * @property isSuperTable
            * @default false
            * @type Boolean
            */
            isSuperTable: false,
            /**
            * whther table has alternate coloring scheme.
            * @property hasAlternateRowColors
            * @default false
            * @type Boolean
            */
            hasAlternateRowColors: false,
            /**
            * Unique id prefix of the interactive.
            * @property idPrefix
            * @default ''
            * @type String
            */
            idPrefix: '',
            /**
            * Property used to distinguish between multiple tables in the same interactivity.
            * @property idSuffix
            * @default ''
            * @type String
            */
            idSuffix: null,
            /**
            * Whether duplicate row entries are to be displayed
            * @property showRedundantValues
            * @default false
            * @type Boolean
            */
            showRedundantValues: false,
            /**
            * Whether current row is to be highlighted.
            * @property showCurrentRowColor
            * @default true
            * @type Boolean
            */
            showCurrentRowColor: true,
            /**
            * Whether duplicate row is to be blinked.
            * @property blinkRedundantRow
            * @default false
            * @type Boolean
            */
            blinkRedundantRow: false,
            /**
            * Whether duplicate row is highlighted as current
            * @property changeRedundantRowToCurrent
            * @default false
            * @type Boolean
            */
            changeRedundantRowToCurrent: false,
            /**
            * Collection to hold data row models.
            * @property tableData
            * @default null
            * @type Object
            */
            tableData: null,
            /**
            * Number of empty rows to append
            * @property defaultRowCount
            * @default null
            * @type Number
            */
            defaultRowCount: null,
            /**
            * Number of columns table is to have.
            * @property defaultColumnCount
            * @default null
            * @type Number
            */
            defaultColumnCount: null,
            /**
            * Whether table is disabled
            * @property isTableDisabled
            * @default null
            * @type Boolean
            */
            isTableDisabled: null,
            /**
            * Tab index of the table component.
            * @property tabIndex
            * @default -1
            * @type Number
            */
            tabIndex: -1,
            /**
            * Whether table sorting has to be enabled.
            * @property enableTableSorting
            * @default false
            * @type Boolean
            */
            enableTableSorting: false,
            /**
            * Array of column numbers to be sorted based on a custom value
            * @property columnsForCustomSort
            * @default null
            * @type Array
            */
            columnsForCustomSort: null,
            /**
            * Class applied to hidden values
            * @property classForCustomSort
            * @default ''
            * @type String
            */
            classForCustomSort: '',
            /**
            * Order in which sorting is to be performed for specific columns.
            * @property customSortingOrder
            * @default null
            * @type Object
            */
            customSortingOrder: null,
            /**
            * Reference to model of path for preloading files.
            * @property filePath
            * @default null
            * @type Object
            */
            filePath: null,
            /**
            * Reference to model of manager object.
            * @property manager
            * @default null
            * @type Object
            */
            manager: null,
            /**
            * Reference to model of player object.
            * @property player
            * @default null
            * @type Object
            */
            player: null,
            /**
            * Screen Id for table componenets.
            * @property tableScreenId
            * @default null
            * @type String
            */
            tableScreenId: null,
            /**
            * Acc id of the element before table in tab order
            * @property prevElementAccId
            * @default null
            * @type String
            */
            prevElementAccId: null,
            /**
            * Acc id of the element after table in tab order
            * @property nextElementAccId
            * @default null
            * @type String
            */
            nextElementAccId: null,
            /**
            * Class added to header row(s) for customizing header styles.
            * @property headerRowCustomClass
            * @default null
            * @type String
            */
            headerRowCustomClass: null,
            /**
            * Background image path for header row.
            * @property headerRowBGPath
            * @default null
            * @type String
            */
            headerRowBGPath: null,
            /**
            * Class added to data rows for customizing styles.
            * @property dataRowCustomClass
            * @default null
            * @type String
            */
            dataRowCustomClass: null,
            /**
            * Background image path for data row.
            * @property dataRowBGPath
            * @default null
            * @type String
            */
            dataRowBGPath: null,
            /**
            * Class added to the table to adjust border color
            * @property tableBorderClass
            * @default null
            * @type String
            */
            tableBorderClass: null,
            /**
            * Whether table contains input box/tabbed elements.
            * @property hasInputBoxInTable
            * @default false
            * @type Boolean
            */
            hasInputBoxInTable: false,
            /**
            * Row number that is currently highlighted.
            * @property currentHighlightedRow
            * @default null
            * @type Number
            */
            currentHighlightedRow: null,
            /**
            * Header Column numbers that are disabled in the table.
            * @property disabledHeaders
            * @default null
            * @type Array
            */
            disabledHeaders: null,
            /**
            * Column numbers that are disabled in the table.
            * @property disabledColumns
            * @default null
            * @type Array
            */
            disabledColumns: null,
            /**
            * Column numbers that are disabled for sorting.
            * @property sortDisabledColumns
            * @default null
            * @type Array
            */
            sortDisabledColumns: null,
            /**
            * Row numbers that are disabled in the table.
            * @property disabledRows
            * @default null
            * @type Array
            */
            disabledRows: null,
            /**
            * Whether the table header has click event enabled.
            * @property enableTableHeaderClick
            * @default null
            * @type Boolean
            */
            enableTableHeaderClick: null,
            /**
            * Column numbers that have tick images.
            * @property columnsWithTicks
            * @default null
            * @type Array
            */
            columnsWithTicks: null,
            /**
            * Value of tab index assigned to table.
            * @property tableTabIndex
            * @default null
            * @type Number
            */
            tableTabIndex: null,
            /**
            * Class added to the table to adjust border color
            * @property tableBorderClass
            * @type String
            * @default null
            */
            tableBorderClass: null,
            /**
            * Whether delay has to be given when focus leaves the table
            * @property hasAccDelay
            * @type Boolean
            * @default null
            */
            hasAccDelay: null,
            /**
            * Whether table header text have a default 90% width or auto width
            * @property isHeaderAutoWidth
            * @type Boolean
            * @default null
            */
            isHeaderAutoWidth: null
        },

        /**
        * Intialize table properties
        * @method initialize
        * @constructor
        */
        initialize: function () {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            if (!this.get('tableData')) {
                this.set('tableData', new currentNamespace.DataRows());
            }
            else {
                this.set('tableData', new currentNamespace.DataRows(this.get('tableData')));
            }
            if (!this.get('lastSortedColumn')) {
                this.set('lastSortedColumn', new currentNamespace.LastSortedColumn());
            } else {
                this.set('lastSortedColumn', new currentNamespace.LastSortedColumn(this.get('lastSortedColumn')));
            }
            if (!this.get('tabIndexElements')) {
                this.set('tabIndexElements', new currentNamespace.ElementsTabIndex());
            } else {
                this.set('tabIndexElements', new currentNamespace.ElementsTabIndex(this.get('tabIndexElements')));
            }
            if (!this.get('hasAccDelay')) {
                this.set('hasAccDelay', false);
            }
        },

        /**
        * Highlight a particular row
        * @method highlightRowNumber
        * @param rowNumber {Number} Row number to be highlighted.
        * @public
        */
        highlightRowNumber: function highlightRowNumber(rowNumber) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            this.set('currentHighlightedRow', rowNumber);
            this.trigger(currentNamespace.Events.HIGHLIGHT_ROW_NUMBER);
        },

        /**
        * Scroll to a particular row
        * @method scrollToRowNumber
        * @param rowNumber {Number} Row to be brought in scroll view.
        * @public
        */
        scrollToRowNumber: function scrollToRowNumber(rowNumber) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            this.trigger(currentNamespace.Events.SCROLL_TO_ROW_NUMBER, rowNumber);
        },

        /**
        * Add a row in the table
        * @method addRow
        * @param rowData {Object} Properties of the row to be added.
        * @public
        */
        addRow: function addRow(rowData) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable,
                rowModel = new currentNamespace.DataRow(rowData);

            this.trigger(currentNamespace.Events.ADD_ROW, rowModel);
        },

        /**
        * Modify the data in a particular row of table
        * @method modifyTableRow
        * @param rowNumber {Number} Row to be modified
        * @param rowData {Object} Data of the modified row
        * @param isOriginalRowNumber {Boolean} Whether the original row number is to be cosidered (Optional)
        * @public
        */
        modifyTableRow: function modifyTableRow(rowNumber, rowData, isOriginalRowNumber) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable,
                tableData = this.get('tableData'),
                rowCount = tableData.length,
                initialRowNumber,
                originalRowNumber,
                rowModel,
                counter,
                currentModel;

            if (isOriginalRowNumber) {
                if (rowNumber < rowCount) {
                    for (counter = 0; counter < tableData.length; counter++) {
                        currentModel = tableData.at(counter);
                        if (currentModel.get('originalRowNumber') === rowNumber) {
                            initialRowNumber = currentModel.get('rowNumber');
                            rowNumber = currentModel.get('originalRowNumber');
                            rowModel = new MathInteractives.Common.Components.Theme2.Models.DataTable.DataRow(rowData);
                            rowModel.set('rowNumber', initialRowNumber);
                            rowModel.set('originalRowNumber', rowNumber);
                            break;
                        }
                    }
                }
                this.trigger(currentNamespace.Events.MODIFY_TABLE_ROW, { rowModel: rowModel, rowNumber: initialRowNumber });
            } else {
                if (rowNumber < rowCount) {
                    initialRowNumber = tableData.at(rowNumber).get('rowNumber');
                    originalRowNumber = tableData.at(rowNumber).get('originalRowNumber');
                    rowModel = new MathInteractives.Common.Components.Theme2.Models.DataTable.DataRow(rowData);
                    rowModel.set('rowNumber', initialRowNumber);
                    rowModel.set('originalRowNumber', originalRowNumber);
                }
                this.trigger(currentNamespace.Events.MODIFY_TABLE_ROW, { rowModel: rowModel, rowNumber: rowNumber });
            }
        },

        /**
        * Modify the data in a header row of table
        * @method modifyHeaderRow
        * @param rowNumber {Number} Row to be modified
        * @param rowData {Object} Data of the modified row
        * @public
        */
        modifyHeaderRow: function modifyHeaderRow(rowNumber, rowData) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable,
                tableData = this.get('tableData'),
                rowCount = tableData.length,
                initialRowNumber,
                originalRowNumber,
                rowModel,
                counter,
                currentModel;


            if (rowNumber < rowCount) {
                initialRowNumber = tableData.at(rowNumber).get('rowNumber');
                originalRowNumber = tableData.at(rowNumber).get('originalRowNumber');
                rowModel = new MathInteractives.Common.Components.Theme2.Models.DataTable.DataRow(rowData);
                rowModel.set('rowNumber', initialRowNumber);
                rowModel.set('originalRowNumber', originalRowNumber);
            }
            this.trigger(currentNamespace.Events.MODIFY_HEADER_ROW, { rowModel: rowModel, rowNumber: rowNumber });

        },

        /**
        * Show auto filled values in the table.
        * @method showAutoFilledValues
        * @public
        */
        showAutoFilledValues: function showAutoFilledValues() {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            this.trigger(currentNamespace.Events.SHOW_AUTO_FILLED_VALUES);
        },

        /**
        * Hide auto filled values in the table.
        * @method hideAutoFilledValues
        * @public
        */
        hideAutoFilledValues: function hideAutoFilledValues() {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            this.trigger(currentNamespace.Events.HIDE_AUTO_FILLED_VALUES);
        },
        /**
       * Enable or Disable a particular header in the table
       * @method enableDisableHeader
       * @param headerColumnNumber {Number} Zero indexed header column number
       * @param toBeDisabled {Boolean} Whether the column is to be disabled.
       * @public
       */
        enableDisableHeader: function enableDisableHeader(headerColumnNumber, toBeDisabled) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable,
                disabledHeaders = this.get('disabledHeaders');

            if (disabledHeaders === null || disabledHeaders === undefined) {
                disabledHeaders = [];
            }
            if (toBeDisabled === true) {
                if ($.inArray(headerColumnNumber, disabledHeaders) === -1) {
                    disabledHeaders.push(headerColumnNumber);
                }
            } else {
                disabledHeaders.splice($.inArray(headerColumnNumber, disabledHeaders), 1);
            }

            this.set('disabledHeaders', disabledHeaders);
            this.trigger(currentNamespace.Events.ENABLE_DISABLE_HEADER, { headerColumnNumber: headerColumnNumber, toBeDisabled: toBeDisabled });
        },
        /**
        * Enable or Disable a particular column in the table
        * @method enableDisableColumn
        * @param columnNumber {Number} Zero indexed column number
        * @param toBeDisabled {Boolean} Whether the column is to be disabled.
        * @public
        */
        enableDisableColumn: function enableDisableColumn(columnNumber, toBeDisabled) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable,
                disabledColumns = this.get('disabledColumns');

            if (disabledColumns === null || disabledColumns === undefined) {
                disabledColumns = [];
            }
            if (toBeDisabled === true) {
                if ($.inArray(columnNumber, disabledColumns) === -1) {
                    disabledColumns.push(columnNumber);
                }
            } else {
                disabledColumns.splice($.inArray(columnNumber, disabledColumns), 1);
            }

            this.set('disabledColumns', disabledColumns);
            this.trigger(currentNamespace.Events.ENABLE_DISABLE_COLUMN, { columnNumber: columnNumber, toBeDisabled: toBeDisabled });
        },

        /**
        * Enable or Disable a particular row in the table
        * @method enableDisableRow
        * @param rowNumber {Number} Zero indexed row number
        * @param toBeDisabled {Boolean} Whether the row is to be disabled.
        * @param cellList {Array} Optional paramter which specifies if specific cells are to be disabled
        * @public
        */
        enableDisableRow: function enableDisableRow(rowNumber, toBeDisabled, cellList) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable,
                disabledRows = this.get('disabledRows'), i = 0,
                disabledRowNumbers = [], // Array of disabledRowNumbers
                rowObject = {}; // rowObject contains row number and cell list

            //pushing rowNumber in row object
            rowObject.rowNumber = rowNumber;
            rowObject.cellList = cellList;

            if (disabledRows === null || disabledRows === undefined) {
                disabledRows = [];
            }
            if (toBeDisabled === true) {
                for (; i < disabledRows.length; i++) {
                    disabledRowNumbers.push(disabledRows[i].rowNumber);
                }
                if ($.inArray(rowNumber, disabledRowNumbers) === -1) {
                    disabledRows.push(rowObject);
                }
            } else {
                for (; i < disabledRows.length; i++) {
                    if (disabledRows[i].rowNumber === rowNumber) {
                        disabledRows.splice(i, 1);
                    }
                }
            }
            this.set('disabledRows', disabledRows);
            this.trigger(currentNamespace.Events.ENABLE_DISABLE_ROW, { rowNumber: rowNumber, toBeDisabled: toBeDisabled, cellList: cellList });
        },

        /**
        * Sort particular column of table in the order specified.
        * @method sortColumn
        * @param columnNumber {Number} Zero indexed column number
        * @param sortingOrder {Number} Order to sort the column. (0: Ascending, 1: Descending)
        * @public
        */
        sortColumn: function sortColumn(columnNumber, sortingOrder) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;

            if (this.isSortingDisabledOnColumn(columnNumber) === false) {
                this.set('lastSortedColumn', new currentNamespace.LastSortedColumn({
                    'columnNumber': columnNumber,
                    'sortingOrder': sortingOrder
                }));
                this.trigger(currentNamespace.Events.SORT_COLUMN);
            }
        },

        /**
        * Get the last sorted colum of table
        * @method getLastSortedColumn
        * @return {Object} Column number along with order in which it is sorted.
        * @public
        */
        getLastSortedColumn: function getLastSortedColumn() {
            return this.get('lastSortedColumn');
        },

        /**
        * Enable or disable sorting of entire table or specific columns.
        * @method enableDisableSortingOnColumn
        * @param enableSorting {Boolean} Whether to enable sorting on the column(s)
        * @param columnList {Array} List of columns on which sorting is to be enabled/disabled.
        * @public
        */
        enableDisableSortingOnColumn: function enableDisableSortingOnColumn(enableSorting, columnList) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable,
                sortDisabledColumns = this.get('sortDisabledColumns'),
                columnCount = this.get('defaultColumnCount'),
                counter;

            if (sortDisabledColumns === null || sortDisabledColumns === undefined) {
                sortDisabledColumns = [];
            }
            if (columnList !== undefined) {
                columnCount = columnList.length;
            }

            for (counter = 0; counter < columnCount; counter++) {
                if (columnList !== undefined && columnList !== null) {
                    if (enableSorting === true) {
                        sortDisabledColumns.splice($.inArray(columnList[counter], sortDisabledColumns), 1);
                    } else {
                        if ($.inArray(columnList[counter], sortDisabledColumns) === -1) {
                            sortDisabledColumns.push(columnList[counter]);
                        }
                    }
                }
                else {
                    if (enableSorting === true) {
                        sortDisabledColumns = [];
                    }
                    else {
                        if ($.inArray(counter, sortDisabledColumns) === -1) {
                            sortDisabledColumns.push(counter);
                        }
                    }
                }
            }
            this.set('sortDisabledColumns', sortDisabledColumns);
            this.trigger(currentNamespace.Events.ENABLE_DISABLE_SORT_COLUMN, { enableSorting: enableSorting, columnList: columnList });
        },

        /**
        * Enable or disable click on table headers of entire table.
        * @method enableDisableTableHeaderClicks
        * @param enableClick {Boolean} Whether to enable click handler on table header.
        * @public
        */
        enableDisableTableHeaderClicks: function enableDisableTableHeaderClicks(enableClick) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            this.set('enableTableHeaderClick', enableClick);
            this.trigger(currentNamespace.Events.ENABLE_DISABLE_TABLE_HEADER_CLICK);
        },

        /**
        * Gets index of currently highlighted row.
        * @method getHighlightedRowIndex
        * @return {Number} Indexed row number currently highlighted.
        * @public
        */
        getHighlightedRowIndex: function getHighlightedRowIndex() {
            return this.get('currentHighlightedRow');
        },

        /**
        * Show or hide the ticks or crosses, generated after column comparison, from table.
        * @method showHideComparisonTicksInTable
        * @param showTicks {Boolean} Whether to show ticks in the column
        * @param columnList {Array} List of columns to be compared
        * @private
        */
        showHideComparisonTicksInTable: function showHideComparisonTicksInTable(showTicks, columnList) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable,
                columnsWithTicks = this.get('columnsWithTicks'),
                columnCount;

            if (columnsWithTicks === null || columnsWithTicks === undefined) {
                columnsWithTicks = [];
            }
            if (columnList !== undefined) {
                columnCount = columnList.length;
            }

            for (var i = 0; i < columnCount; i++) {
                if (columnList !== undefined) {
                    if (showTicks === true) {
                        if ($.inArray(columnList[i], columnsWithTicks) === -1) {
                            columnsWithTicks.push(columnList[i]);
                        }
                    } else {
                        columnsWithTicks.splice($.inArray(columnList[i], columnsWithTicks), 1);
                    }
                }
            }
            this.set('columnsWithTicks', columnsWithTicks);
            this.trigger(currentNamespace.Events.SHOW_HIDE_COMPARISON_TICKS_IN_TABLE, { showTicks: showTicks, columnList: columnList });
        },

        /**
        * Set acc element which would be focused after the table.
        * @method setNextAccElement
        * @param {String} Acc id of the element
        * @public
        */
        setNextAccElement: function setNextAccElement(elementAccId) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            this.set('nextElementAccId', elementAccId);
            this.trigger(currentNamespace.Events.SET_NEXT_ACC_ELEMENT);
        },

        /**
        * Set acc element which would be focused before the table.
        * @method setPreviousAccElement
        * @param {String} elementAccId Acc id of the element
        * @public
        */
        setPreviousAccElement: function setPreviousAccElement(elementAccId) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            this.set('prevElementAccId', elementAccId);
            this.trigger(currentNamespace.Events.SET_PREV_ACC_ELEMENT);
        },

        /**
        * Deletes particular row of table
        * @method deleteTableRow
        * @param rowNumber {Number} Row to be deleted.
        * @param isOriginalRowNumber {Boolean} Whether original row number is to be considered (Optional)
        * @public
        */
        deleteTableRow: function deleteTableRow(rowNumber, isOriginalRowNumber) {
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable,
                tableData = this.get('tableData'),
                rowCount = tableData.length,
                initialRowNumber,
                counter,
                currentModel;

            if (isOriginalRowNumber === true) {
                if (rowNumber < rowCount) {
                    for (counter = 0; counter < tableData.length; counter++) {
                        currentModel = tableData.at(counter);
                        if (currentModel.get('originalRowNumber') === rowNumber) {
                            initialRowNumber = currentModel.get('rowNumber');
                            tableData.remove(tableData.at(initialRowNumber));
                            break;
                        }
                    }
                }
                // Loop for arranging the original rownumbers
                for (counter = 0; counter < tableData.length; counter++) {
                    currentModel = tableData.at(counter);
                    if (currentModel.get('originalRowNumber') > rowNumber) {
                        currentModel.set('originalRowNumber', (currentModel.get('originalRowNumber') - 1));
                    }
                }
            } else {
                if (rowNumber < rowCount) {
                    tableData.remove(tableData.at(rowNumber));
                }
                initialRowNumber = rowNumber;
            }
            for (counter = initialRowNumber; counter < rowCount - 1; counter++) {
                tableData.models[counter].set('rowNumber', counter);
            }
            this.trigger(currentNamespace.Events.DELETE_TABLE_ROW, { rowNumber: initialRowNumber });
        },

        /**
        * Set Tab index of table element.
        * @method setTableTabIndex
        * @param tabIndex {Number} Value of tab index to be set to table
        * @public
        */
        setTableTabIndex: function setTableTabIndex(tabIndex) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            this.set('tableTabIndex', tabIndex);
            this.trigger(currentNamespace.Events.SET_TABLE_TAB_INDEX);
        },

        /**
        * Set focus to table element.
        * @method setFocusToTable
        * @public
        */
        setFocusToTable: function setFocusToTable() {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            this.trigger(currentNamespace.Events.SET_FOCUS_TO_TABLE);
        },

        /**
        * Reset the table's sorting order.
        * @method resetTableSort
        * @private
        */
        resetTableSort: function resetTableSort() {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            this.get('lastSortedColumn').set({ 'sortingOrder': null, 'columnNumber': null });
            this.trigger(currentNamespace.Events.RESET_TABLE_SORT);
        },

        /**
        * Adds tab index to elements of 'selectorString' inside the table.
        * @method addTabIndexToElements
        * @param selectorString {String} Selector on which tab indices have to be set.
        * @param startTabIndex {Number} Tab index of the first element in the selector.
        * @param tabIndexIncrement {Number} Factor by which the tab indices have to be incremented.
        */
        addTabIndexToElements: function addTabIndexToElements(selectorString, startTabIndex, tabIndexIncrement) {
            'us strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable,
                tabIncrement = (tabIndexIncrement !== undefined) ? tabIndexIncrement : 5,
                baseTabIndex = this.get('manager').model.get('startTabindex'),
                startTabIndex = startTabIndex,
                element = new currentNamespace.ElementTabIndex(),
                elements;

            if (!this.get('tabIndexElements')) {
                this.set('tabIndexElements', new currentNamespace.ElementsTabIndex());
            }
            element.set({ 'selectorString': selectorString, 'startTabIndex': startTabIndex, 'tabIndexIncrement': tabIncrement });
            elements = this.get('tabIndexElements');
            if (this._isDuplicateTabIndexModel(element) === false) {
                elements.add(element);
            }
            this.trigger(currentNamespace.Events.ADD_TAB_INDEX_TO_ELEMENTS, {
                selectorString: selectorString,
                startTabIndex: startTabIndex,
                tabIndexIncrement: tabIndexIncrement
            });
        },

        /**
        * Returns if the passed model is a duplicate
        * @method _isDuplicateTabIndexModel
        * @param element {Backbone.Model} Element to be checked for duplicate
        * @return {Boolean} Whether the element has a duplicate tab index
        * @private
        */
        _isDuplicateTabIndexModel: function _isDuplicateTabIndexModel(element) {
            'use strict';
            var tabIndexElements = this.get('tabIndexElements'),
                eleSelectorString = element.get('selectorString'),
                eleStartTabIndex = element.get('startTabIndex'),
                eleTabIndexIncrement = element.get('tabIndexIncrement'),
                tabIndexElement,
                selectorString,
                startTabIndex,
                tabIndexIncrement,
                counter;

            if (tabIndexElements !== null && tabIndexElements !== undefined && tabIndexElements.models.length > 0) {
                for (counter = 0; counter < tabIndexElements.models.length; counter++) {
                    tabIndexElement = tabIndexElements.models[counter];
                    selectorString = tabIndexElement.get('selectorString');
                    startTabIndex = tabIndexElement.get('startTabIndex');
                    tabIndexIncrement = tabIndexElement.get('tabIndexIncrement');
                    if (selectorString === eleSelectorString && startTabIndex === eleStartTabIndex && tabIndexIncrement === eleTabIndexIncrement) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
        * Returns whether sorting is disabled on the passed column
        * @method isSortingDisabledOnColumn
        * @param column {Number} Column number to be checked
        * @return {Boolean} Whether sorting is disabled on the mentioned column
        * @type public
        */
        isSortingDisabledOnColumn: function isSortingDisabledOnColumn(column) {
            'use strict';
            var sortDisabledColumns = this.get('sortDisabledColumns');
            if (sortDisabledColumns !== null && sortDisabledColumns !== undefined &&
                sortDisabledColumns.length > 0 && $.inArray(column, sortDisabledColumns) !== -1) {
                return true;
            }
            return false;
        },

        /**
        * Clears data and displays the table back to default state maintaining the table headers
        * @method clearDataFromTable
        * @public
        */
        clearDataFromTable: function clearDataFromTable() {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable,
                currentModel = this,
                tableDataModel = currentModel.get('tableData'),
                rowCount = tableDataModel.length,
                headerRowModels = new currentNamespace.DataRows(),
                currentRowModel,
                counter;

            for (counter = 0; counter < rowCount; counter++) {
                currentRowModel = tableDataModel.at(counter);
                if (currentRowModel.get('isHeaderRow') === true || currentRowModel.get('isSubHeaderRow') === true || currentRowModel.get('isTableSectionHeaderRow') === true) {
                    headerRowModels.add(currentRowModel);
                }
            }

            this.set('tableData', new currentNamespace.DataRows())
            this.set('lastSortedColumn', new currentNamespace.LastSortedColumn());
            this.set('tabIndexElements', new currentNamespace.ElementsTabIndex());

            this.set('currentHighlightedRow', null);
            this.set('disabledHeaders', null);
            this.set('disabledColumns', null);
            this.set('disabledRows', null);
            this.set('columnsWithTicks', null);

            tableDataModel = currentModel.get('tableData');
            for (counter = 0; counter < headerRowModels.models.length; counter++) {
                currentRowModel = headerRowModels.at(counter);
                tableDataModel.add(currentRowModel);
            }
            this.trigger(currentNamespace.Events.CLEAR_DATA_FROM_TABLE);
        },

        /**
        * Trigger header click through accessibility.
        * @method triggerHeaderClick
        * @param columnIndex {Number} Column to be sorted.
        * @public
        */
        triggerHeaderClick: function triggerHeaderClick(columnIndex) {
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            this.trigger(currentNamespace.Events.COLUMN_HEADER_CLICK, { columnIndex: columnIndex });
        },

        /**
        * Renders the table again with the current data (called for cases like tab-switch)
        * @method refreshTable
        * @type public
        */
        refreshTable: function refreshTable() {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            this.trigger(currentNamespace.Events.REFRESH_TABLE);
        },

        /**
        * Set new default row count
        * @method setDefaultRowCount
        * @param {Number} defaultRowCount Default row count to be set
        * @public
        */
        setDefaultRowCount: function setNextAccElement(defaultRowCount) {
            'use strict';
            var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;
            this.set('defaultRowCount', defaultRowCount);
            this.trigger(currentNamespace.Events.MODIFY_DEFAULT_ROW_COUNT);
        }
    }, {

        /**
        * Conatins properties for a table row.
        * @class DataRow
        * @extends Backbone.Model
        * @static
        */
        DataRow: Backbone.Model.extend({
            defaults: {
                /**
                * Whether the current row is a table header
                * @property isHeaderRow
                * @type Boolean
                * @default false
                */
                isHeaderRow: false,
                /**
                * Whether the current row is a table sub-header
                * @property isSubHeaderRow
                * @type Boolean
                * @default false
                */
                isSubHeaderRow: false,
                /**
                * Whether the current row is a table section header
                * @property isTableSectionHeaderRow
                * @type Boolean
                * @default false
                */
                isTableSectionHeaderRow: false,
                /**
                * Data to be displayed in a row.
                * @property rowData
                * @type Object
                */
                rowData: null,
                /**
                * Row number associated with the current row.
                * @property rowNumber
                * @type Number
                */
                rowNumber: null,
                /**
                * The original Row number associated with the row.(This never changes not even on sorting)
                * @property originalRowNumber
                * @type Number
                */
                originalRowNumber: null,
                /**
                * Whether the current row is a separator row
                * @property isSeparatorRow
                * @type Boolean
                * @default null
                */
                isSeparatorRow: false,
                /**
                * Optional parameter which specifies the background image to be applied to the separator
                * @property separatorBackgroundImage
                * @type String
                * @default null
                */
                separatorBackgroundImage: null,
                /**
                * Optional parameter which specifies the background image position in case sprite is used
                * @property separatorBackgroundImagePosition
                * @type Object
                * @default null
                */
                separatorBackgroundImagePosition: null
            },

            /**
            * Intialize the properties of a table row.
            * @method initialize
            * @constructor
            */
            initialize: function initialize() {
                'use strict';
                var currentNamespace = MathInteractives.Common.Components.Theme2.Models.DataTable;

                if (this.get('isHeaderRow') === true) {
                    if (!this.get('rowData')) {
                        this.set('rowData', new currentNamespace.HeaderCells());
                    }
                    else {
                        this.set('rowData', new currentNamespace.HeaderCells(this.get('rowData')));
                    }
                }
                else {
                    if (!this.get('rowData')) {
                        this.set('rowData', new currentNamespace.DataCells());
                    }
                    else {
                        this.set('rowData', new currentNamespace.DataCells(this.get('rowData')));
                    }
                }
            }
        }),

        /**
        * Collection of table rows
        * @class DataRows
        * @extends Backbone.Collection
        * @static
        */
        DataRows: Backbone.Collection.extend({
            model: this.DataRow,

            /**
            * Intialize the collection of table rows.
            * @method initialize
            * @constructor
            */
            initialize: function () {
                'use strict';
                this.model = MathInteractives.Common.Components.Theme2.Models.DataTable.DataRow;
            }
        }),

        /**
        * Contains properties of a single data cell.
        * @class DataCell
        * @extends Backbone.Model
        * @static
        */
        DataCell: Backbone.Model.extend({
            defaults: {
                /**
                * Content of the cell.
                * @property text
                * @type String
                * @default null
                */
                text: null,
                /**
                * Whether to add default blank entry (---)
                * @property addBlankData
                * @type Boolean
                * @default null
                */
                addBlankData: null,
                /**
                * String containing the formula in the form "col0*col1/col2^col3"
                * @property formulaForCalculation
                * @type String
                * @default null
                */
                formulaForCalculation: null,
                /**
                * Whether to display calculated values
                * @property showCalculatedValues
                * @type Boolean
                * @default false
                */
                showCalculatedValues: false,
                /**
                * Compare data of the cell with specified columns
                * @property compareWithColumns
                * @type Array
                * @default null
                */
                compareWithColumns: null,
                /**
                * Display tick image in the metnioned column
                * @property columnNumberForTicks
                * @type Number
                * @default null
                */
                columnNumberForTicks: null,
                /**
                * Whether to show tick image in the cell.
                * @property showTicksInThisCell
                * @type Boolean
                * @default false
                */
                showTicksInThisCell: false
            }
        }),

        /**
        * Collection of table cells.
        * @class DataCells
        * @extends Backbone.Collection
        * @static
        */
        DataCells: Backbone.Collection.extend({
            model: this.DataCell,

            /**
            * Intialize the collection of table cells.
            * @method initialize
            * @constructor
            */
            initialize: function () {
                'use strict';
                this.model = MathInteractives.Common.Components.Theme2.Models.DataTable.DataCell;
            }
        }),

        /**
        * Contains properties of a single header cell.
        * @class HeaderCell
        * @extends Backbone.Model
        * @static
        */
        HeaderCell: Backbone.Model.extend({
            defaults: {
                /**
                * Content of the cell.
                * @property text
                * @type String
                */
                text: null,
                /**
                * Row span to be applied to the header cell.
                * @property rowSpan
                * @type Number
                * @default 1
                */
                rowSpan: 1,
                /**
                * Col-span to be applied to the header cell.
                * @property colSpan
                * @type Number
                * @default 1
                */
                colSpan: 1,
                /**
                * Width of the header cell.
                * @property width
                * @type Number
                * @default 100
                */
                width: 100
            }
        }),

        /**
        * Collection of table header cells.
        * @class HeaderCells
        * @extends Backbone.Collection
        * @static
        */
        HeaderCells: Backbone.Collection.extend({
            model: this.HeaderCell,
            /**
            * Intialize the collection of table header cells.
            * @method initialize
            * @constructor
            */
            initialize: function () {
                'use strict';
                this.model = MathInteractives.Common.Components.Theme2.Models.DataTable.HeaderCell;
            }
        }),

        /**
        * Stores the Last sorted column and order in which it was sorted
        * @property LastSortedColumn
        * @extends Backbone.Model
        * @static
        */
        LastSortedColumn: Backbone.Model.extend({
            defaults: {
                /**
                * The column number of the last sorted column
                * @property columnNumber
                * @type Number
                */
                columnNumber: null,
                /**
                * The sorting order
                * @property sortingOrder
                * @type Number (0 for asc and 1 for desc)
                */
                sortingOrder: null
            }
        }),

        /**
        * Stores the tab-index for a particular element
        * @property ElementTabIndex
        * @extends Backbone.Model
        * @static
        */
        ElementTabIndex: Backbone.Model.extend({
            defaults: {
                /**
                * The selector string
                * @property selectorString
                * @type String
                */
                selectorString: null,
                /**
                * The start tab index for the particular selector
                * @property startTabIndex
                * @type Number 
                */
                startTabIndex: null,
                /**
                * The tab index increment for the particular selector
                * @property tabIndexIncrement
                * @type Number 
                */
                tabIndexIncrement: null
            }
        }),

        /**
        * Collection of Element tab-indices
        * @class ElementsTabIndex
        * @extends Backbone.Collection
        * @static
        */
        ElementsTabIndex: Backbone.Collection.extend({
            model: this.ElementTabIndex,
            /**
            * Intialize the collection of element tab indices.
            * @method initialize
            * @constructor
            */
            initialize: function () {
                'use strict';
                this.model = MathInteractives.Common.Components.Theme2.Models.DataTable.ElementTabIndex;
            }
        }),

        /**
        * Holds the names of the events to be triggered.
        * @property Events
        * @type Object
        * @static
        */
        Events: {
            HIGHLIGHT_ROW_NUMBER: 'highlight-row-number',
            SCROLL_TO_ROW_NUMBER: 'scroll-to-row-number',
            ADD_ROW: 'add-row',
            SHOW_AUTO_FILLED_VALUES: 'show-auto-filled-values',
            HIDE_AUTO_FILLED_VALUES: 'hide-auto-filled-values',
            ENABLE_DISABLE_HEADER: 'enable-disable-header',
            ENABLE_DISABLE_COLUMN: 'enable-disable-column',
            ENABLE_DISABLE_ROW: 'enable-disable-row',
            SORT_COLUMN: 'sort-column',
            ENABLE_DISABLE_SORT_COLUMN: 'enable-disable-sort-column',
            ENABLE_DISABLE_TABLE_HEADER_CLICK: 'enable-disable-table-header-click',
            SHOW_HIDE_COMPARISON_TICKS_IN_TABLE: 'show-hide-comparison-ticks-in-table',
            SET_NEXT_ACC_ELEMENT: 'set-next-acc-element',
            SET_PREV_ACC_ELEMENT: 'set-prev-acc-element',
            MODIFY_TABLE_ROW: 'modify-table-row',
            MODIFY_HEADER_ROW: 'modify-header-row',
            SET_TABLE_TAB_INDEX: 'set-table-tab-index',
            SET_FOCUS_TO_TABLE: 'set-focus-to-table',
            ADD_TAB_INDEX_TO_ELEMENTS: 'add-tab-index-to-elements',
            CLEAR_DATA_FROM_TABLE: 'clear-data-from-table',
            REFRESH_TABLE: 'refresh-table',
            DELETE_TABLE_ROW: 'delete-table-row',
            TABLE_SORT_COMPLETE: 'table-sorting-complete',
            COLUMN_HEADER_CLICK: 'column-header-click',
            RESET_TABLE_SORT: 'reset-table-sort',
            MODIFY_DEFAULT_ROW_COUNT: 'modify-table-default-row'
        }
    });
    MathInteractives.global.Theme2DataTable = {};
    MathInteractives.global.Theme2DataTable.Model = MathInteractives.Common.Components.Theme2.Models.DataTable;
})();