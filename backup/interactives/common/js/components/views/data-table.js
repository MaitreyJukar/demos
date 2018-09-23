(function () {
    'use strict';

    /**
    * @property _filePath
    * type object
    * @default null
    * @private
    */
    var _filePath = null; // Path object to be used by table, row and cell views.

    /**
    * View for data Table  
    *
    * @class DataTable
    * @constructor
    * @namespace MathInteractives.Common.Player.Views.DataTable
    **/
    MathInteractives.Common.Player.Views.DataTable = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * @property manager
        * type object
        * @default null
        * @private
        */
        manager: null,
        /**
        * @property idPrefix
        * type string
        * @default null
        * @private
        */
        idPrefix: null,
        /**
        * @property player
        * type object
        * @default null
        * @private
        */
        player: null,
        /**
        * @property columnCount
        * type integer
        * @default null
        * @private
        */
        _columnCount: null,
        /**
        * @property _lastSortedColumn
        * type integer
        * @default null
        * @private
        */
        _lastSortedColumn: null,
        /**
        * @property _previousAccElementId
        * type string
        * @default null
        * @private
        */
        _previousAccElementId: null,
        /**
        * @property _nextAccElementId
        * type string
        * @default null
        * @private
        */
        _nextAccElementId: null,
        /**
        * @property _bShiftKeyPressed
        * type boolean
        * @default null
        * @private
        */
        _bShiftKeyPressed: false,

        /**
        * Calls render and renders table
        *
        * @method initialize
        **/
        initialize: function initialize() {
            this.manager = this.model.get('manager');
            this.idPrefix = this.model.get('idPrefix');
            this.player = this.model.get('player');
            this._nextAccElementId = this.model.get('nextElementAccId');
            this._previousAccElementId = this.model.get('prevElementAccId');
            this.render();
        },
        /**
        * Add event listeners
        *
        * events
        **/
        events: function events() {
            var events = {
                'click .header-table .tbl-header.sorting-enabled': '_onTableHeaderClick',
            };
            if (this.player !== null) {
                if (this.player.model.get('isAccessible')) {
                    events['focusin .body-table'] = '_onTableFocusIn';
                    events['focusout .body-table'] = '_onTableFocusOut';
                    events['keydown'] = '_onTableKeyDown';
                }
            }
            return events;
        },
        /**
        * renders table
        *
        * @method render
        **/
        render: function render() {
            var tableView = this,
                currentModel = this.model,
                rowsHtml = '',
                $tableHolder = null,
                $headerTableHolder = null,
                $headerTable = null,
                $bodyTableHolder = null,
                $bodyTable = null,
                $bottomBorder = null,
                $tableMask = null,
                rowCount = currentModel.get('tableData').length,
                $tHead = $('<thead></thead>'),
                $tBody = $('<tbody></tbody>'),
                headerRowCount = 0,
                duplicateRowCount = 0,
                tableBodyWidth = 0,
                tableHeaderWidth = 0,
                tablesWidth = 0,
                tableHeaderHeight = 0,
                idSuffix = currentModel.get('idSuffix'),
                isTableDisabled = currentModel.get('isTableDisabled'),
                showRedundantValues = currentModel.get('showRedundantValues'),
                showCurrentRowColor = currentModel.get('showCurrentRowColor'),
                blinkRedundantRow = currentModel.get('blinkRedundantRow'),
                changeRedundantRowToCurrent = currentModel.get('changeRedundantRowToCurrent'),
                columnsForCustomSort = currentModel.get('columnsForCustomSort'),
                textExtractionObject = {},
                startTabIndex = 0;

            if (this.manager !== null) {
                if (currentModel.get('tabIndex') !== -1) {
                    startTabIndex = this.manager.model.get('startTabindex');
                }
            }

            _filePath = currentModel.get('filePath');


            // instantiate and render children
            for (var i = 0; i < rowCount; i++) {
                var rowView = new MathInteractives.Common.Player.Views.DataRow({
                    model: tableView.model.get('tableData').models[i],
                    player: this.player,
                    enableTableSorting: currentModel.get('enableTableSorting')
                });
                if (rowView.model.get('isHeaderRow') === true || rowView.model.get('isSubHeaderRow') === true) {
                    $tHead.append(rowView.el);
                    headerRowCount++;
                    if (i == rowCount - 1) {
                        this._columnCount = rowView.model.get('rowData').length;
                    }
                }
                else {
                    var rowSame = false,
                        rowViewValues = [],
                        rowReference, rowValues;
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
                        for (var j = 0; j < rowViewValues.length; j++) {
                            if (rowViewValues[j] !== rowValues[j]) {
                                isSameRow = false;
                            }
                            if (isSameRow === false) break;
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
                        $tBody.append(rowView.el);
                    }
                    if (rowSame === true && changeRedundantRowToCurrent === true) {/*identify current row and color appropriate row*/
                        //setTimeout(function () {
                        $(rowReference[0]).parents().find('tr.table-row').find('td').removeClass('current-row currentRowColor');
                        rowReference.each(function () {
                            $(this).addClass('current-row currentRowColor');
                        });
                        //}, 2000);
                    }

                    if (i === rowCount - 1) {
                        $(rowView.el).parent().find('td').removeClass('current-row');
                        $(rowView.el).find('td').addClass('current-row');
                        if (showCurrentRowColor === true) {
                            $(rowView.el).parent().find('td').removeClass('currentRowColor');
                            $(rowView.el).find('td').addClass('currentRowColor');
                        }
                    }
                }
                rowView.model.set('rowNumber', i);
                $(rowView.el).find('td,th').addClass('row_' + i);
                $(rowView.el).attr('rowNumber', i);
            }
            if (showRedundantValues === true) duplicateRowCount = 0;
            if ((currentModel.get('defaultRowCount') + duplicateRowCount) >= rowCount) {//insert default empty rows
                var rowsToInsert = (currentModel.get('defaultRowCount') + duplicateRowCount) - (rowCount - 1),
                    currentRowData = [];
                for (var i = 0; i < currentModel.get('defaultColumnCount') ; i++) {
                    currentRowData.push({ text: MathInteractives.Common.Player.Views.DataCell.defaultTextString });
                }
                for (var i = 0; i < rowsToInsert; i++) {
                    var rowView = new MathInteractives.Common.Player.Views.DataRow({
                        model: new MathInteractives.Common.Player.Models.Table.DataRow({ isHeaderRow: false, rowData: currentRowData }),
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
            //            tableBodyWidth = this.$('.body-table').width();
            //            tableHeaderWidth = this.$('.header-table').width();
            tablesWidth = $(tableView.el).width() - 17; // 17 for scroll bar adjustment

            // this.$('.header-table, .body-table').css({ width: tablesWidth });
            this.$('.complete-table-holder').css({ width: tablesWidth });
            this._addImportantToStyle(this.$('.header-table, .body-table'), { width: tablesWidth + 'px' });

            //this.$('.table-bottom-border').css({ 'width': this.$('.body-table').width() + 1 });
            this._addImportantToStyle(this.$('.table-bottom-border'), { 'width': (tablesWidth) + 'px' });
            tableHeaderHeight = this.$('.header-table').height();
            if ((this.$('.body-table-holder')[0].scrollHeight - (tableHeaderHeight)) > this.$('.body-table-holder')[0].offsetHeight) {
                this.$('.complete-table-holder').css({ 'width': $(this.el).width() + 'px' });
            }

            this.$('.body-table').css({ 'margin-top': -(tableHeaderHeight + 1) + 'px' });

            if (this.$('.current-row').position()) {
                $bodyTableHolder.scrollTop(this.$('.current-row').position().top - $bodyTableHolder.height());
            }

            /* tableMask display none will stop table scroll */
            if (isTableDisabled === true) {
                $tableMask = $('<div></div>', { class: 'tableMask' });
                //$tableMask.css({
                //    'height': $bodyTableHolder.height() + tableHeaderHeight + 2,
                //    'width': $bodyTableHolder.width()
                //});

                this._addImportantToStyle($tableMask, {
                    'height': ($bodyTableHolder.height() + tableHeaderHeight + 2) + 'px',
                    'width': ($bodyTableHolder.width()) + 'px'
                });

                $bodyTableHolder.append($tableMask);
                $headerTableHolder.find('table').addClass('disabled');
            }

            //handle table sorting
            if (currentModel.get('enableTableSorting') === true) {
                // Creates text extraction object for ignoring dashes in cell values
                for (var i = 0; i < this._columnCount; i++) {
                    var textExtractionFunction = function (node, table, cellIndex) {
                        var blankDataNodes = $(node).find('.table-blank-data');
                        if (blankDataNodes.length > 0) {
                            if (blankDataNodes.is(':visible')) {
                                return '';
                            }
                        }
                        else
                            return $(node).text();
                    }
                    textExtractionObject[i] = textExtractionFunction;
                }
                // Creates text extraction object for custom sorting on hidden values
                if (columnsForCustomSort !== null) {
                    var classForSorting = currentModel.get('classForCustomSort'),
                        textExtractionFunction = function (node, table, cellIndex) { return $(node).find('.' + classForSorting).text(); };
                    for (var i = 0; i < columnsForCustomSort.length; i++) {
                        textExtractionObject[columnsForCustomSort[i]] = textExtractionFunction;
                    }
                }
                this.$('.body-table').tablesorter({
                    textExtraction: textExtractionObject
                });
                this.$('.body-table .tbl-header').removeAttr('tabindex');
                this.$('.body-table').on('sortEnd', function () {
                    tableView._rearrangeTableData();
                    tableView.trigger('table-sorting-complete');
                });
                for (var i = 0; i < this._columnCount; i++) {
                    this.$('.body-table')[0].config.headers[i] = { sorter: true };
                }
            }
            this.$('.body-table-holder').attr('tabindex', -1);
            this.$('.header-table-holder').attr('tabindex', -1);
            this._applyCustomStyles();
            //$('.body-table-holder tr:last').addClass('last-row');
        },

        /**
        * Apply custom background and font colors for header and data elements.
        * @method _applyCustomStyles
        * @private
        */
        _applyCustomStyles: function _applyCustomStyles() {
            var currentModel = this.model,
                headerElements = this.$('.tbl-header,.tbl-sub-header,.tbl-section-header'),
                arrowElements = this.$('.tbl-header-up-arrrow-image,.tbl-header-down-arrrow-image'),
                headerStyle = headerElements.attr('style'),
                cellElements = this.$('.tbl-cell'),
                cellStyle = cellElements.attr('style'),
                headerRowCustomClass = currentModel.get('headerRowCustomClass'),
                headerRowBGPath = currentModel.get('headerRowBGPath'),
                dataRowCustomClass = currentModel.get('dataRowCustomClass'),
                dataRowBGPath = currentModel.get('dataRowBGPath'),
                tableBorderClass = currentModel.get('tableBorderClass');

            /**Header row customization**/
            if (headerRowCustomClass !== null) {
                headerElements.addClass(headerRowCustomClass);
                arrowElements.addClass(headerRowCustomClass)
            }
            if (headerRowBGPath !== null) {
                headerStyle = headerElements.attr('style');
                if (headerStyle === null || headerStyle === undefined) {
                    headerStyle = '';
                }
                headerElements.attr('style', headerStyle + 'background-image: url("' + headerRowBGPath + '") !important;');
            }

            /**Data row customization**/
            if (dataRowCustomClass !== null) {
                cellElements.addClass(dataRowCustomClass);
            }
            if (dataRowBGPath !== null) {
                cellStyle = cellElements.attr('style');
                if (cellStyle === null || cellStyle === undefined) {
                    cellStyle = '';
                }
                cellElements.attr('style', cellStyle + 'background-image: url("' + dataRowBGPath + '") !important;');
            }

            /**Table custom border**/
            if (tableBorderClass !== null) {
                this.$('.tbl th, .tbl td, table.tbl, .table-bottom-border').addClass(tableBorderClass);
            }
        },

        /*
        * to highlight a particular row
        * @method highlightRowNumber
        * @param int rowNumber
        */
        highlightRowNumber: function highlightRowNumber(rowNumber) {
            this.$('.currentRowColor').removeClass('currentRowColor');
            this.$('.current-row').removeClass('current-row');
            $(this.$('.body-table-holder tbody').find('tr').get(rowNumber - 1)).find('td').addClass('current-row currentRowColor');
            if (this.$('.current-row').position()) {
                this.$('.body-table-holder').scrollTop(0);
                this.$('.body-table-holder').scrollTop(this.$('.current-row').position().top - this.$('.body-table-holder').height() + this.$('.current-row').height());
            }
        },


        /*
        * to scroll to a particular row
        * @method scrollToRowNumber
        * @param int rowNumber
        */
        scrollToRowNumber: function scrollToRowNumber(rowNumber) {
            var $bodyTableHolder = this.$('.body-table-holder'),
                $bodyTableTbody = this.$('.body-table-holder tbody'),
                rowTop = $($bodyTableTbody.find('tr').get(rowNumber - 1)).position().top;
            $bodyTableHolder.scrollTop(0);
            $bodyTableHolder.scrollTop(rowTop - $bodyTableHolder.height());
        },
        /* to add a row in the table
        * @method addRow
        * @param object rowData
        */
        addRow: function addRow(rowData) {
            var rowModel = new MathInteractives.Common.Player.Models.Table.DataRow(rowData);
            var rowView = new MathInteractives.Common.Player.Views.DataRow({ model: rowModel });
            this._checkDuplicateNAddRow(this, rowView);
            //console.log('offsetHeight ' + this.$('.body-table-holder')[0].offsetHeight + 'scrollHeight ' + this.$('.body-table-holder')[0].scrollHeight);
            if (this.$('.body-table-holder')[0].scrollHeight > this.$('.body-table-holder')[0].offsetHeight) {
                this.$('.complete-table-holder').css({ 'width': $(this.el).width() + 'px' });
            }
        },

        /* checks if the row already exists. If not, add to table.
        * @method _checkDuplicateNAddRow
        * @param tableView and rowView
        */
        _checkDuplicateNAddRow: function _checkDuplicateNAddRow(tableView, rowView) {
            var rowsHtml = '',
             $headerTableHolder = null,
             $headerTable = null,
             $bodyTableHolder = null,
             $bodyTable = null,
             $bottomBorder = null,
             $tableMask = null,
             rowCount = 1, //tableView.model.get('tableData').length,
             $tBody = tableView.$('tbody'),
             duplicateRowCount = 0,
             isTableDisabled = tableView.model.get('isTableDisabled'),
             showRedundantValues = tableView.model.get('showRedundantValues'),
             showCurrentRowColor = tableView.model.get('showCurrentRowColor'),
             blinkRedundantRow = tableView.model.get('blinkRedundantRow'),
             changeRedundantRowToCurrent = tableView.model.get('changeRedundantRowToCurrent'),
             rowNumber;
            for (var i = 0; i < rowCount; i++) {
                var rowSame = false,
                    rowViewValues = [],
                    rowReference, rowValues; // duplicateRowIndex, rowNo;
                $(rowView.el).find('div').each(function () {
                    rowViewValues.push($(this).text());
                });
                /*check for duplicate rows*/
                $tBody.find('tr').each(function (index) {
                    rowValues = [];
                    $(this).find('div').each(function () {
                        rowValues.push($(this).text());
                    });

                    var isSameRow = true;
                    for (var j = 0; j < rowViewValues.length; j++) {
                        if (rowViewValues[j] !== rowValues[j]) {
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
                    tableView.model.get('tableData').add(rowView.model);
                    $(rowView.el).find('td,th').addClass('row_' + rowNumber);
                    $(rowView.el).attr('rowNumber', rowNumber);
                }
                if (rowSame === true && changeRedundantRowToCurrent === true) {/*identify current row and color appropriate row*/
                    $(rowReference[0]).parents().find('tr.table-row').find('td').removeClass('current-row currentRowColor');
                    rowReference.each(function () {
                        $(this).addClass('current-row currentRowColor');
                    });
                }

                if (i === rowCount - 1) {
                    $(rowView.el).parent().find('td').removeClass('current-row');
                    $(rowView.el).find('td').addClass('current-row');
                    if (showCurrentRowColor === true) {
                        $(rowView.el).parent().find('td').removeClass('currentRowColor');
                        $(rowView.el).find('td').addClass('currentRowColor');
                    }
                }
                if (this.model.get('tableBorderClass') !== null) {
                    $(rowView.el).find('td').addClass(this.model.get('tableBorderClass'));
                }
            }
            if (showRedundantValues === true) duplicateRowCount = 0;
            //scroll to the current row
            if (tableView.$('.current-row').position()) {
                tableView.$('.body-table-holder').scrollTop(0);
                tableView.$('.body-table-holder').scrollTop(tableView.$('.current-row').position().top); //  - tableView.$('.body-table-holder').height());
            }
        },

        /* Adds tab index to elements of 'selectorString' 
        * @method addTabIndexToElements
        * @param selectorString, startTabIndex, tabIndexIncrement
        */
        addTabIndexToElements: function addTabIndexToElements(selectorString, startTabIndex, tabIndexIncrement) {
            var tabIncrement = (tabIndexIncrement !== undefined) ? tabIndexIncrement : 5,
                baseTabIndex = this.manager.model.get('startTabindex'),
                startTabIndex = startTabIndex;
            this.$(selectorString).each(function (index) {
                $(this).attr('tabindex', (baseTabIndex + startTabIndex + (index * tabIncrement))).addClass('hack-div');
            });
        },
        /* Show auto filled values
        * @method showAutoFilledValues
        * @param 
        */
        showAutoFilledValues: function showAutoFilledValues() {
            this.$('.hide-autofill-data+.table-blank-data').hide(); //hide dashes in respective cells
            this.$('.hide-autofill-data').removeClass('hide-autofill-data').addClass('show-autofill-data');
        },
        /* Hide auto filled values
        * @method hideAutoFilledValues
        * @param 
        */
        hideAutoFilledValues: function hideAutoFilledValues() {
            this.$('.show-autofill-data+.table-blank-data').show(); //show dashes in respective cells
            this.$('.show-autofill-data').removeClass('show-autofill-data').addClass('hide-autofill-data');
        },
        /* Enable or Disable a particular column in the table
        * @method enableDisableColumn
        * @param columnNumber: integer              0 indexed column number
        * @param toBeDisabled: boolean              whether to disable the column or not.
        */
        enableDisableColumn: function enableDisableColumn(columnNumber, toBeDisabled) {
            if (columnNumber >= 0 && columnNumber < this._columnCount) {
                if (toBeDisabled)
                    this.$('.body-table-holder tbody .col_' + columnNumber).addClass('table-column-disabled');
                else
                    this.$('.body-table-holder tbody .col_' + columnNumber).removeClass('table-column-disabled');
            }
        },
        /* Sort table on table header click
        * @method _onTableHeaderClick
        * @private
        */
        _onTableHeaderClick: function _onTableHeaderClick(event) {
            if (this.model.get('enableTableSorting') === true) {
                var $currentElement = $(event.currentTarget),
                    columnNumber,
                    sortCondition,
                    customSortingOrder,
                    previousColumnsList,
                    sortForceOrder = null;
                if (!$currentElement.hasClass('tbl-header'))
                    $currentElement = $(event.currentTarget).parents('.tbl-header');// to get the header element in case a child element is triggered.
                columnNumber = $currentElement.attr('class').split(' ')[1];
                columnNumber = Number(columnNumber.substr('col_'.length));
                //sortCondition = [[columnNumber, 1]];// to be used in case of external links.

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
                this._lastSortedColumn = columnNumber;
                this.sortColumn(columnNumber);
            }
        },

        /* Sort individual column of table
        * @method sortColumn
        * @public
        */
        sortColumn: function sortColumn(columnNumber, sortingOrder) {
            if (columnNumber >= 0 && columnNumber < this._columnCount) {
                var sortOrder = 0, // 0 for ascending, 1 for descending
                    sortOrderText;

                if (sortingOrder !== undefined)
                    sortOrder = sortingOrder;
                else {
                    if (!this.$('.body-table thead .col_' + columnNumber).hasClass('tablesorter-headerAsc'))
                        sortOrder = 0;
                    else
                        sortOrder = 1;
                }
                sortOrderText = (sortOrder === 0) ? 'asc' : 'desc';
                if (this.$('.body-table')[0].config.headers[columnNumber].sorter !== false) {//to counter sorting of table even when sorting is disabled.
                    this.$('.body-table').trigger('update');
                    //this.$('.body-table').find('th:eq(' + columnNumber + ')').trigger('sort');// triggers the sort of body table
                    this.$('.body-table').trigger('sorton', [[[columnNumber, sortOrder]]]);// triggers the sort of body table
                    this._lastSortedColumn = columnNumber;
                    this.$('.header-table thead .tbl-sort-asc').removeClass('tbl-sort-asc');
                    this.$('.header-table thead .tbl-sort-desc').removeClass('tbl-sort-desc');
                    this.$('.header-table thead .col_' + columnNumber).addClass('tbl-sort-' + sortOrderText);
                }
            }
        },

        /* Get the last sorted colum of table
        * @method getLastSortedColumn
        * @public
        */
        getLastSortedColumn: function getLastSortedColumn() {
            var lastColumnDetails = {},
                lastSortedColumn = this._lastSortedColumn,
                sortOrder,
                $tableHeader = this.$('.body-table thead .col_' + lastSortedColumn);
            if (!$tableHeader.hasClass('tablesorter-headerAsc') && !$tableHeader.hasClass('tablesorter-headerDesc'))
                sortOrder = 0;
            else if (!$tableHeader.hasClass('tablesorter-headerAsc'))
                sortOrder = 1;
            else
                sortOrder = 0;
            lastColumnDetails = {
                columnNumber: lastSortedColumn,
                sortOrder: sortOrder
            }
            return lastColumnDetails;
        },

        /* Enable or disable sorting of entire table or specific columns.
        * @method enableDisableSortingOnColumn
        * @parameter enableSorting: type boolean
        * @parameter columnList: type array
        * @public
        */
        enableDisableSortingOnColumn: function enableDisableSortingOnColumn(enableSorting, columnList) {
            var columnCount = this._columnCount,
                headersObject = {};
            // if columnList not provided, disable entire table sorting.
            if (columnList !== undefined) columnCount = columnList.length;
            for (var i = 0; i < columnCount; i++) {
                if (columnList !== undefined) {
                    headersObject[columnList[i]] = { sorter: enableSorting };
                    this.$('.body-table')[0].config.headers[columnList[i]] = headersObject[columnList[i]];
                    if (enableSorting) {
                        $(this.$('.header-table .tbl-header')[columnList[i]]).addClass('sorting-enabled').removeClass('sorting-disabled');
                    }
                    else {
                        $(this.$('.header-table .tbl-header')[columnList[i]]).addClass('sorting-disabled').removeClass('sorting-enabled');
                    }
                }
                else {
                    headersObject[i] = { sorter: enableSorting };
                    this.$('.body-table')[0].config.headers[i] = headersObject[i];
                }
            }
            this.$('.body-table').trigger('update');
        },

        /* Enable or disable click on table headers of entire table.
        * @method enableDisableTableHeaderClicks
        * @parameter enableClick: type boolean
        * @public
        */
        enableDisableTableHeaderClicks: function enableDisableTableHeaderClicks(enableClick) {
            if (enableClick) {
                this.$('.header-table .tbl-header').addClass('sorting-enabled');
            }
            else {
                this.$('.header-table .tbl-header').removeClass('sorting-enabled');
            }
        },

        /* Get Index of currently highlighted row
        * @method getHighlightedRowIndex
        * @public
        */
        getHighlightedRowIndex: function getHighlightedRowIndex() {
            var highlightedRowIndex = 0;
            this.$('.body-table tbody').find('tr').each(function (index) {
                if ($(this).find('td').first().hasClass('currentRowColor')) {
                    highlightedRowIndex = index + 1;
                    return false;
                }
            });
            return highlightedRowIndex;
        },

        /* Rearrange data in table model on sorting
        * @method _rearrangeTableData
        * @private
        */
        _rearrangeTableData: function _rearrangeTableData() {
            var rowOrder = [],
                tableData = this.model.get('tableData'),
                modelsArray = [];
            this.$('tbody tr.empty-bottom').each(function () {
                rowOrder.push(Number($(this).attr('rownumber')));
            });
            for (var i = 0; i < rowOrder.length; i++) {
                for (var j = 0; j < tableData.length; j++) {
                    if (rowOrder[i] == tableData.models[j].get('rowNumber')) {
                        modelsArray.push(this.model.get('tableData').models[j]);
                        break;
                    }
                }
            }
            for (var i = 0; i < modelsArray.length; i++) {
                tableData.models[i + 1] = modelsArray[i];
            }
            this.model.set('tableData', tableData);
        },

        /* Show or hide the ticks or crosses, generated after column comparison, from table.
        * @method showHideComparisonTicksInTable
        * @parameter showTicks: type boolean
        * @parameter columnList: type array
        * @private
        */
        showHideComparisonTicksInTable: function showHideComparisonTicksInTable(showTicks, columnList) {
            if (columnList !== undefined && columnList.length > 0) {
                for (var i = 0; i < columnList.length; i++) {
                    (showTicks) ? this.$('.body-table .col_' + columnList[i] + ' .comparison-result').removeClass('hide-autofill-data') : this.$('.body-table .col_' + columnList[i] + ' .comparison-result').addClass('hide-autofill-data');
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
         * @param [object] $element jquery object
         * @param [object] props style object
         * @private
         */
        _addImportantToStyle: function _addImportantToStyle($element, props) {
            var $this, style, prop;
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
        /* Set focus to table holder div on focus in
        * @method _onTableFocusIn
        * @public
        */
        _onTableFocusIn: function _onTableFocusIn() {
            if (this.player !== null) {
                if (!this.player.model.get('isAccessible')) { return false; }
            }
            var isTouchDevice = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile;
            if (this.player !== null) {
                this.player._enableDisableApplicationMode(false);
            }
            if (!isTouchDevice) {
                this.$('.complete-table-holder').addClass('on-focus-in');
            }
        },
        /* Remove focus from table holder div on focus out
        * @method _onTableFocusOut
        * @public
        */
        _onTableFocusOut: function _onTableFocusOut(event) {
            if (this.player !== null) {
                if (!this.player.model.get('isAccessible')) { return false; }
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();

            var self = this,
                nextAccElementExists = this.manager._checkElementExistsByAccId(this._nextAccElementId),
                prevAccElementExists = this.manager._checkElementExistsByAccId(this._previousAccElementId),
                isTouchDevice = MathInteractives.Common.Utilities.Models.BrowserCheck.isMobile,
                focusDelay = 0;

            if (this.model.get('hasAccDelay') === true) {
                focusDelay = 10;
            }
            if (!isTouchDevice) {
                self.$('.complete-table-holder').removeClass('on-focus-in');
                if (self.player !== null) {
                    self.player._enableDisableApplicationMode(true);
                }
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
        /* Handle keydown events on table
        * @method _onTableKeyDown
        * @private
        */
        _onTableKeyDown: function _onTableKeyDown(event) {
            if (this.player !== null) {
                if (!this.player.model.get('isAccessible')) { return false; }
            }
            if (this.model.get('hasInputBoxInTable')) {
                return;
            }
            else {
                event.preventDefault();
                event.stopImmediatePropagation();
                event.stopPropagation();
                var keyCode = event.which || event.keyCode,
                    $tableHolder = this.$('.body-table-holder'),
                    self = this,
                    nextAccElementExists = this.manager._checkElementExistsByAccId(this._nextAccElementId),
                    prevAccElementExists = this.manager._checkElementExistsByAccId(this._previousAccElementId),
                    focusDelay = 0;

                if (this.model.get('hasAccDelay') === true) {
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
            }
        },
        /* Set next acc element for the table
        * @method setNextAccElement
        * @parameter [string]: elementAccId
        * @public
        */
        setNextAccElement: function setNextAccElement(elementAccId) {
            var self = this;
            this.model.set('nextElementAccId', elementAccId);
            this._nextAccElementId = elementAccId;
            this.$('.body-table').off('focusout').on('focusout', function (event) {
                self._onTableFocusOut(event);
            });
            this.$el.off('keydown').on('keydown', function (event) {
                self._onTableKeyDown(event);
            });
        },
        /* Set previous acc element for the table
        * @method setPreviousAccElement
        * @parameter [string]: elementAccId
        * @public
        */
        setPreviousAccElement: function setPreviousAccElement(elementAccId) {
            var self = this;
            this.model.set('prevElementAccId', elementAccId);
            this._previousAccElementId = elementAccId;
            this.$('.body-table').off('focusout').on('focusout', function (event) {
                self._onTableFocusOut(event);
            });
            this.$el.off('keydown').on('keydown', function (event) {
                self._onTableKeyDown(event);
            });
        },
        /* Modify the data in a particular row of table
        * @method modifyTableRow
        * @parameter rowNumber: type number
        * @parameter rowData: type object
        * @public
        */
        modifyTableRow: function modifyTableRow(rowNumber, rowData) {
            var rowCount = this.model.get('tableData').length,
                initialRowNumber,
                rowModel,
                rowView,
                $currentRow;
            if (rowNumber < rowCount) {
                initialRowNumber = this.model.get('tableData').models[rowNumber].get('rowNumber');
                rowModel = new MathInteractives.Common.Player.Models.Table.DataRow(rowData);
                rowModel.set('rowNumber', initialRowNumber);
                rowView = new MathInteractives.Common.Player.Views.DataRow({ model: rowModel });
                $(rowView.el).attr('rowNumber', initialRowNumber);
                if (this.model.get('tableBorderClass') !== null) {
                    $(rowView.el).find('td').addClass(this.model.get('tableBorderClass'));
                }
                this.model.get('tableData').models[rowNumber] = rowModel;
                $currentRow = $(this.$('.body-table tbody').find('tr')[rowNumber - 1]);
                $currentRow.before($(rowView.el));
                $currentRow.remove();
            }
        },
        /* Load table screen
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

        /* Check if a row is visible or hidden behind scroll
        * @method isThisRowVisible
        * @parameter rowNumber: type number              zero indexed row number
        * @public
        * @returns boolean whether row visible or not
        */
        isThisRowVisible: function isThisRowVisible(rowNumber) {
            var $tableHolder = this.$('.body-table-holder'),
                tableHolderTop = $tableHolder.offset().top,
                tableHolderBottom = tableHolderTop + $tableHolder.height(),
                $rowHolder = this.$($('.body-table-holder tr').get(rowNumber)),
                rowHolderTop = $rowHolder.offset().top,
                rowHolderBottom = rowHolderTop + $rowHolder.height();

            return ((rowHolderBottom >= tableHolderTop) && (rowHolderTop <= tableHolderBottom)
              && (rowHolderBottom <= tableHolderBottom) && (rowHolderTop >= tableHolderTop));
        },

        /* Set Tab index of table to that specified.
        * @method setTabIndexTo
        * @parameter tabIndex: type number
        * @public
        */
        setTableTabIndex: function setTableTabIndex(tabIndex) {
            var startTabIndex = 0;
            if (this.manager !== null && tabIndex !== -1) {
                startTabIndex = this.manager.model.get('startTabindex');
            }
            this.$('.body-table').attr('tabindex', startTabIndex + tabIndex);
        },

        /* Set focus to table
        * @method setFocusToTable
        * @public
        */
        setFocusToTable: function setFocusToTable() {
            this.$('.body-table').focus();
        }
    }, {
        /*
        * to generate table
        * @method loadTable
        * @param {object} tableProperties, {DOM element} selector
        */
        loadTable: function (tableProperties, selector) {// static function to draw table
            var tableParent = $(selector).parent(),
                containerId = $(selector).attr('id'),
                containerClass = $(selector).attr('class'),
                tableDataModel,
                tableView;

            //if ($(selector).length > 0) {
            //    $('<div id="' + containerId + '" class="' + containerClass + '"></div>').insertAfter($(selector));
            //    $($(selector)[0]).remove();
            //}

            tableDataModel = new MathInteractives.Common.Player.Models.Table(tableProperties);
            tableView = new MathInteractives.global.DataTable({ model: tableDataModel, el: selector });
            return tableView;
        }
    });

    /**
    * View for data row
    *
    * @class DataRow
    * @constructor
    * @namespace MathInteractives.Common.Player.Views.DataRow
    **/
    MathInteractives.Common.Player.Views.DataRow = MathInteractives.Common.Player.Views.Base.extend({
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
            var rowView = this;
            var colCount = this.model.get('rowData').length,
                cellHtml = '';
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
                    var cellView = new MathInteractives.Common.Player.Views.DataCell({
                        model: rowView.model.get('rowData').models[i],
                        tagName: 'th',
                        className: className + ' col_' + i,
                        parent: this, cellNumber: i,
                        player: this.options.player,
                        enableTableSorting: this.options.enableTableSorting
                    });
                }
                else {
                    /*creates cell view <td>*/
                    var className = 'tbl-cell';
                    if (isTableSectionHeader) {
                        className = 'tbl-section-header';
                    }
                    /*creates cell view <td>*/
                    var cellView = new MathInteractives.Common.Player.Views.DataCell({
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
            // allows chaining
            return this;
        }
    });

    /**
    * View for data column
    *
    * @class DataCell
    * @constructor
    * @namespace MathInteractives.Common.Player.Views.DataCell
    **/
    MathInteractives.Common.Player.Views.DataCell = MathInteractives.Common.Player.Views.Base.extend({
        /*
        * calls render
        * @method initialize
        */
        initialize: function initialize() {
            this.render();
        },
        /*
        * initialises data column element td
        * @method render
        */
        render: function render() {
            var cellData = this.model.get('text'),
                initialText = cellData,
                currentNameSpace = MathInteractives.Common.Player.Views.DataCell,
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
                playerView = MathInteractives.Common.Player.Views.Player,
                sortNotations = MathInteractives.Common.Components.templates.tableSortNotation().trim(),
                playerTheme;


            if (this.model.get('colSpan')) { //typeof is giving 'undefined'
                $(this.el).attr('colspan', this.model.get('colSpan'));
            }
            if (this.model.get('rowSpan')) { //typeof is giving 'undefined'
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
                if (initialText === '' || initialText === null)
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
                    for (var i = 0; i < compareWithColumns.length; i++) {
                        if (cellData == rowView.model.get('rowData').models[compareWithColumns[i]].get('text')) {
                            comparisonClasses += ' equal-to-col-' + compareWithColumns[i];
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
                        cellData = '<div class="tbl-header-text">' + cellData + '</div>';
                        cellData += sortNotations;
                    }
                }
                $(this.el).html('<div class="tbl-data' + comparisonClasses + '">' + cellData + comparisonResultHtml + '</div>'); // + comparisonDivHtml);
            }
            if (this.model.get('showTicksInThisCell'))
                $(this.el).find('.comparison-result').removeClass('hide-autofill-data');
            if (this.$('.comparison-result').length > 0) {
                if (_filePath !== null && _filePath !== undefined) {
                    this.$('.comparison-result').css({ 'background-image': 'url(' + _filePath.getImagePath('table-tick-and-cross') + ')' });
                }
                else {
                    alert('Please specify filePath for table');
                }
            }
            return this;
        },

        //$comparisonDiv=$(this.el).find('.comparison-result');
        //if ($comparisonDiv.length > 0) {
        //    comparisonDivHtml = $('<div>').append($comparisonDiv.clone()).html();
        //}
        /*
        * checks if cell displays empty data
        * @method isCellDataBlank
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
        * returns result for a cell after applying formula
        * @method _getFormulaResult
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
        * returns resultant formula string to be evaluated.
        * @method _generateFormulaString
        */
        _generateFormulaString: function _generateFormulaString(inputFormula, rowView) {
            var resultantFormula = inputFormula,
                self = this,
                formulaPlaceHolder = MathInteractives.Common.Player.Views.DataCell.placeHolderInFormula,
                colNumbersOrder = [];

            function replaceColInString(formula) {
                if (formula.indexOf('col') !== -1) {
                    var position = formula.indexOf('col') + 3;//3 to get the position of the column number
                    colNumbersOrder.push(parseInt(formula.charAt(position), 10));
                    formula = self._setCharacterAt(formula, position, '');
                    formula = formula.replace('col', formulaPlaceHolder);
                }
                return formula;
            }

            do {
                resultantFormula = replaceColInString(resultantFormula);
            }
            while (resultantFormula.indexOf('col') != -1);
            resultantFormula = this._insertDataIntoFormula(resultantFormula, colNumbersOrder, rowView, formulaPlaceHolder);
            return resultantFormula;
        },

        /*
        * appends a string at specified location in another string
        * @method _setCharacterAt
        */
        _setCharacterAt: function _setCharacterAt(originalString, index, stringToBeAdded) {
            return originalString.substr(0, index) + stringToBeAdded + originalString.substr(index + 1);
        },

        /*
        * replaces place holders in formula, with its actual value
        * @method _insertDataIntoFormula
        */
        _insertDataIntoFormula: function _insertDataIntoFormula(formulaString, dataOrder, rowView, placeHolderString) {
            for (var i = 0; i < dataOrder.length; i++) {
                formulaString = formulaString.replace(placeHolderString, rowView.model.get('rowData').models[dataOrder[i]].get('text'));
            }
            return formulaString;
        },
    }, {
        /**
        * default text string
        * @property defaultTextString
        * @type string
        * @public
        */
        defaultTextString: '<span class="typography-label table-blank-data" >&#8211; &#8211; &#8211;</span>',

        /**
        * place holder string in formula
        * @property placeHolderInFormula
        * @type string
        * @public
        */
        placeHolderInFormula: 'DataPlaceHolder'
    });


    MathInteractives.global.DataTable = MathInteractives.Common.Player.Views.DataTable;

})()

