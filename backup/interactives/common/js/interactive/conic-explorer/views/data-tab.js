(function () {
    'use strict';

    /**
    * Base model for Data tab.
    * @module DataTab
    * @namespace MathInteractives.Interactivities.ConicExplorer.Views
    * @extends MathInteractives.Common.Player.Views.Base
    * @constructor
    */
    MathInteractives.Common.Interactivities.ConicExplorer.Views.DataTab = MathInteractives.Common.Player.Views.Base.extend({
        /**
        * Unique interactivity id prefix
        * @property _idprefix
        * @default null
        * @private
        */
        idPrefix: null,
        /**
        * Model of path for preloading files
        * @property filePath
        * @type Object
        * @default null
        */
        filePath: null,
        /**
        * Manager object 
        * @property manager
        * @type Object
        * @default null
        */
        manager: null,
        /**
        * Reference to player object
        * @property player
        * @type Object
        * @default null
        */
        player: null,
        /**
        * Reference to model of the table to be rendered.
        * @property tableModel
        * @type
        * @default
        */
        tableModel: null,
        /**
        * Reference to view of the table to be rendered.
        * @property
        * @type
        * @default
        */
        tableView: null,
        /**
        * Reference to the view button of first entry.
        * @property viewBtn1
        * @type Backbone.View
        * @default null,
        */
        viewBtn1: null,
        /**
        * Reference to the view button of second entry.
        * @property viewBtn2
        * @type Backbone.View
        * @default null,
        */
        viewBtn2: null,
        /**
        * Reference to the view button of third entry.
        * @property viewBtn3
        * @type Backbone.View
        * @default null,
        */
        viewBtn3: null,

        /**
        * Holds the sort button is focused first time or not
        * @property firstTimeFocus
        * @type Boolean
        * @default true
        */
        firstTimeFocus: true,

        /**
        * Initializer function of view.
        * @method initialize
        * @constructor
        */
        initialize: function () {
            this.player = this.options.player;
            this.filePath = this.player.getPath();
            this.manager = this.player.getManager();
            this.idPrefix = this.player.getIDPrefix();
            this.render();
        },

        /**
        * Initializes all the controls required and add table to container element.
        * @method render
        * @private
        */
        render: function () {
            var currentNameSpace = MathInteractives.Common.Interactivities.ConicExplorer.templates,
                imagePath = this.filePath.getImagePath(this.options.imageID);
            this.$el.append(currentNameSpace.dataTab({ idPrefix: this.idPrefix }).trim());
            this.$('.horizontal-diagram-image').css({
                'background-image': 'url(' + imagePath + ')'
            });
            this.$('.vertical-diagram-image').css({
                'background-image': 'url(' + imagePath + ')'
            });
            this.$('.horizontal-equation-text').html(this.options.horizontalEquationText);
            this.$('.vertical-equation-text').html(this.options.verticalEquationText);
            this.loadScreen(this.options.screenID);
            this._createTable();
            this.renderButton();
        },

        renderButton: function () {

            this.backBtnView = MathInteractives.global.Theme2.Button.generateButton({

                path: this.filePath,
                player: this.player,
                idPrefix: this.idPrefix,
                manager: this.manager,
                data: {
                    id: this.idPrefix + 'go-back-btn',
                    text: this.getMessage('go-back-btn-text', 0),
                    type: MathInteractives.global.Theme2.Button.TYPE.FA_ICONTEXT,
                    colorType: MathInteractives.global.Theme2.Button.COLORTYPE.GREEN,
                    icon: { faClass: 'fa fa-arrow-left', height: 18, width: 28, fontColor: '#036f8a', fontSize: 18 },
                    textPosition: 'right',
                    width: 125,
                    height: 38,
                    textColor: '#036f8a'
                }
            });
            this.loadScreen('data-tab-button-screen');
        },

        /**
        * Renders a table into the table container.
        * @method _createTable
        * @private
        */
        _createTable: function _createTable() {
            var eventNamespace = MathInteractives.global.Theme2DataTable.Model.Events,
                tableProperties = {
                    idPrefix: this.idPrefix,
                    manager: this.manager,
                    player: this.player,
                    filePath: this.filePath,
                    defaultRowCount: 3,
                    defaultColumnCount: this.options.defaultColumnCount,
                    showCurrentRowColor: false,
                    enableTableSorting: true,
                    headerRowCustomClass: 'conic-header-row',
                    dataRowCustomClass: 'conic-data-row',
                    tableBorderClass: 'conic-table-border',
                    tableData: this.options.tableData,
                    hasInputBoxInTable: true,
                    classForCustomSort: 'center-sort',
                    columnsForCustomSort: this.options.columnsForCoordinateSort,
                    tabIndex: 1605
                };

            this.tableModel = new MathInteractives.global.Theme2DataTable.Model(tableProperties);
            this.tableView = new MathInteractives.global.Theme2DataTable.View({
                model: this.tableModel,
                el: '#' + this.idPrefix + 'record-data-table-container'
            });

            this.tableModel.enableDisableTableHeaderClicks(true);
            this.tableModel.enableDisableSortingOnColumn(false, this.options.disabledColumns);
            this.tableModel.setNextAccElement('tbl-sort-notation-0');
            this.tableModel.setPreviousAccElement('data-tab-acc-holder');
            this.listenTo(this.tableModel, eventNamespace.TABLE_SORT_COMPLETE, this._onTableSortComplete);
            this._setSortNotationIndex();
        },
        /**
      * Apply Tab indices to the sort notations
      * @method _setSortNotationIndex
      * @private
      */
        _setSortNotationIndex: function _setSortNotationIndex() {
            var accDivObject,
                counter, index = 2,
                self = this;

            for (counter = 0; counter < 5; counter++) {
                accDivObject = {
                    'elementId': 'tbl-sort-notation-' + counter,
                    'tabIndex': 1605 + index,
                    'offsetTop': 1,
                    'offsetLeft': 2,
                    'acc': this.getMessage('sort-notaion-acc-text', 0, [this.getAccMessage('data-table-header-text', counter), this.getMessage('sort-notaion-acc-text', 1)])
                };
                this.createAccDiv(accDivObject);
            }
            this.focusOut('tbl-sort-notation-0', function () {
                self.fousOnsort();
            });
            this.focusOut('tbl-sort-notation-1', function () {
                self.fousOnsort();
            });
            this.focusOut('tbl-sort-notation-2', function () {
                self.fousOnsort();
            });
            this.focusOut('tbl-sort-notation-3', function () {
                self.fousOnsort();
            });
            this.focusOut('tbl-sort-notation-4', function () {
                self.fousOnsort();
            });
        },
        fousOnsort: function () {
            var self = this;
            self.focusInSort('tbl-sort-notation-0');
            self.focusInSort('tbl-sort-notation-1');
            self.focusInSort('tbl-sort-notation-2');
            self.focusInSort('tbl-sort-notation-3');
            self.focusInSort('tbl-sort-notation-4');
        },
        /*
     * It change the acc text according to sort button class
     * It call when the sort button is focused
     * @method focusInSort
     */
        focusInSort: function (id) {
            var sortNo = parseInt(id.substr(id.length - 1, 1)),
                colAccText = null,
                sortAccText = null,
                accText = null,
                $tempDiv, object;
            //if (this.firstTimeFocus) {
            switch (sortNo) {
                case 0:
                    colAccText = this.getAccMessage('data-table-header-text', 0);
                    break;
                case 1:
                    colAccText = this.getAccMessage('data-table-header-text', 1);
                    break;
                case 2:
                    colAccText = this.getAccMessage('data-table-header-text', 2);
                    break;
                case 3:
                    colAccText = this.getAccMessage('data-table-header-text', 3);
                    break;
                case 4:
                    colAccText = this.getAccMessage('data-table-header-text', 4);
                    break;
            }
            if (this.$('#' + this.idPrefix + id).parent().parent().hasClass('sorting-enabled tbl-sort-asc')) {
                sortAccText = this.getMessage('sort-notaion-acc-text', 2);
                accText = this.getMessage('sort-notaion-acc-text', 0, [colAccText, sortAccText]);
                this.setAccMessage(id, accText);
            }
            else {
                sortAccText = this.getMessage('sort-notaion-acc-text', 1);
                accText = this.getMessage('sort-notaion-acc-text', 0, [colAccText, sortAccText]);
                this.setAccMessage(id, accText);
            }
            
        },
        /*
       * It change the help screen of view according to sort rows
       * It call when the data table is sort
       * @method _onTableSortComplete
       */
        _onTableSortComplete: function () {
            var newNo,
                length = null,
                player = this.player;
            if (this.$('.record-view-button').length === 3) {
                length = this.tableView.$("tr[rownumber*='1']").find('.record-view-button').attr('id').length;
                newNo = this.tableView.$("tr[rownumber*='1']").find('.record-view-button').attr('id').substring(length - 1);
                this.setTabIndex('view-button-' + newNo, 1630);
                newNo = this.tableView.$("tr[rownumber*='2']").find('.record-view-button').attr('id').substring(length - 1);
                this.setTabIndex('view-button-' + newNo, 1645);
                newNo = this.tableView.$("tr[rownumber*='3']").find('.record-view-button').attr('id').substring(length - 1);
                this.setTabIndex('view-button-' + newNo, 1660);
            }

        },

        /**
        * Modify a populated row into the table.
        * @method modifyTableRow
        * @param {Number} rowIndex Index of the row to be modified.
        * @param {Object} rowData Data to populate a row in table.
        * @public
        */
        modifyTableRow: function modifyTableRow(rowIndex, rowData) {
            var lastSorted = this.tableModel.get('lastSortedColumn'),
                columnNumber = lastSorted.get('columnNumber'),
                sortingOrder = lastSorted.get('sortingOrder');

            if (sortingOrder !== null && sortingOrder !== undefined) {
                this.tableModel.sortColumn(0, 0);
                this.tableModel.modifyTableRow(rowIndex, rowData);
                this.tableModel.sortColumn(columnNumber, sortingOrder);
            }
            else {
                this.tableModel.modifyTableRow(rowIndex, rowData);
            }

        },

        /**
        * Modify a populated row into the table.
        * @method modifyTableRow
        * @param {Number} rowIndex Index of the row to be modified.
        * @param {Object} rowData Data to populate a row in table.
        * @public
        */
        clearTableData: function clearTableData() {
            var rowIndex,
                rowObject,
                counter,
                columnCount = this.options.defaultColumnCount;
            if (this.viewBtn1 !== null) {
                this.viewBtn1.remove();
                this.viewBtn2.remove();
                this.viewBtn3.remove();
                this.viewBtn1 = null;
                this.viewBtn2 = null;
                this.viewBtn3 = null;
            }
            this.tableModel.clearDataFromTable();
            this.tableModel.enableDisableTableHeaderClicks(true);
            this.tableModel.enableDisableSortingOnColumn(false, this.options.disabledColumns);
            for (rowIndex = 1; rowIndex <= 3; rowIndex++) {
                rowObject = { isHeaderRow: false, rowData: [{ 'text': rowIndex }] };
                for (counter = 1; counter < columnCount; counter++) {
                    rowObject.rowData.push({ 'text': '' });
                }
                this.tableModel.addRow(rowObject);
            }
            this._setSortNotationIndex();
        },

        /**
        * Generates view buttons in the table
        * @method generateViewButtons
        * @public
        */
        generateViewButtons: function generateViewButtons() {
            var buttonProperties = {
                idPrefix: this.idPrefix,
                player: this.player,
                manager: this.manager,
                path: this.filePath,
                data: {
                    id: this.idPrefix + 'view-button-1',
                    text: this.getMessage('view-button-text', 0),
                    type: MathInteractives.global.Theme2.Button.TYPE.TEXT,
                    colorType: MathInteractives.global.Theme2.Button.COLORTYPE.GREEN,
                    height: 22,
                    width: 74
                }
            };

            this.viewBtn1 = new MathInteractives.global.Theme2.Button.generateButton(buttonProperties);
            buttonProperties.data.id = this.idPrefix + 'view-button-2';
            this.viewBtn2 = new MathInteractives.global.Theme2.Button.generateButton(buttonProperties);
            buttonProperties.data.id = this.idPrefix + 'view-button-3';
            this.viewBtn3 = new MathInteractives.global.Theme2.Button.generateButton(buttonProperties);

            this.$('.attempt-number').addClass('added-buttons');
            this.loadScreen('data-tab-table-button-screen');
        }
    });
})(window.MathInteractives);