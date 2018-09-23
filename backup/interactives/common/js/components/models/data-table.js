//Rahul.M . TODO YUI comments. COmponents changes

(function () {
    //"use strict";

    // MathInteractives.DataTable.Models
    MathInteractives.Common.Player.Models.Table = Backbone.Model.extend({
        defaults: {
            /**
            * table containing colspan- rowspan
            * @property isSuperTable
            * @default false
            * @private
            */
            isSuperTable: false,
            /**
            * alternate coloring scheme for row
            * @property hasAlternateRowColors
            * @default false
            * @private
            */
            hasAlternateRowColors: false,
            /**
            * @property idPrefix
            * @default ''
            * @private
            */
            idPrefix: '',
            /**
            * To be used to distinguish between multiple tables in the same interactivity.
            * @property idSuffix
            * @default ''
            * @private
            */
            idSuffix: '',
            /**
            * duplicate rows visibility
            * @property showRedundantValues
            * @default false
            * @public
            */
            showRedundantValues: false,
            /**
            * highlight current row
            * @property showCurrentRowColor
            * @default true
            * @public
            */
            showCurrentRowColor: true,
            /**
            * blink duplicate row
            * @property blinkRedundantRow
            * @default false
            * @public
            */
            blinkRedundantRow: false,
            /**
            * highlight duplicate row as current
            * @property changeRedundantRowToCurrent
            * @default false
            * @public
            */
            changeRedundantRowToCurrent: false,
            /**
            * array to hold data rows
            * @property tableData
            * @default null
            * @public
            */
            tableData: null,
            /**
            * empty rows to append
            * @property defaultRowCount
            * @default null
            * @public
            */
            defaultRowCount: null,
            /**
            * column count
            * @property defaultColumnCount
            * @default null
            * @public
            */
            defaultColumnCount: null,
            /**
            * isTableDisabled
            * @property isTableDisabled
            * @default null
            * @public
            */
            isTableDisabled: null,
            /**
            * tabIndex
            * @property tabIndex
            * @default -1
            * @public
            */
            tabIndex: -1,
            /**
            * enableTableSorting
            * @property enableTableSorting
            * @default false
            * @public
            */
            enableTableSorting: false,
            /**
            * an array of column numbers to be sorted based on a hidden value
            * @property columnsForCustomSort
            * @default null
            * @public
            */
            columnsForCustomSort: null,
            /**
            * class applied to hidden values
            * @property classForCustomSort
            * @default blank string
            * @public
            */
            classForCustomSort: '',
            /**
            * contains order in which sorting is to be done for specific columns
            * @property customSortingOrder
            * @default null
            * @public
            */
            customSortingOrder: null,
            /**
            * Holds the model of path for preloading files
            *
            * @property filePath
            * @type Object
            * @default null
            */
            filePath: null,
            /**
            * Holds the model of manager
            *
            * @property manager
            * @type Object
            * @default null
            */
            manager: null,
            /**
            * Holds the model of player
            *
            * @property player
            * @type Object
            * @default null
            */
            player: null,
            /**
            * Holds the screen for table
            * @property tableScreenId
            * @type string
            * @default null
            */
            tableScreenId: null,
            /**
            * Acc id of the element before table in tab order
            * @property prevElementAccId
            * @type string
            * @default null
            */
            prevElementAccId: null,
            /**
            * Acc id of the element after table in tab order
            * @property nextElementAccId
            * @type string
            * @default null
            */
            nextElementAccId: null,
            /**
            * Class added to header row(s) for customizing header styles.
            * @property headerRowCustomClass
            * @type String
            * @default null
            */
            headerRowCustomClass: null,
            /**
            * Background image path for header row.
            * @property headerRowBGPath
            * @type string
            * @default null
            */
            headerRowBGPath: null,
            /**
            * Class added to data rows for customizing styles.
            * @property dataRowCustomClass
            * @type String
            * @default null
            */
            dataRowCustomClass: null,
            /**
            * Background image path for data row.
            * @property dataRowBGPath
            * @type string
            * @default null
            */
            dataRowBGPath: null,
            /**
            * Class added to the table to adjust border color
            * @property tableBorderClass
            * @type String
            * @default null
            */
            tableBorderClass: null,
            /**
            * Boolean to check if table contains input box
            * @property hasInputBoxInTable
            * @type boolean
            * @default false
            */
            hasInputBoxInTable: false,
            /**
            * Whether delay has to be given when focus leaves the table
            * @property hasAccDelay
            * @type Boolean
            * @default null
            */
            hasAccDelay: null
        },
        /**
        * intialise data and table rows
        *
        * @method initialize
        **/
        initialize: function () {
            "use strict";
            var currentNamespace = MathInteractives.Common.Player.Models.Table;
            if (!this.get("tableData")) {
                this.set("tableData", new currentNamespace.DataRows());
            }
            else {
                this.set("tableData", new currentNamespace.DataRows(this.get("tableData")));
            }
            if (!this.get('hasAccDelay')) {
                this.set('hasAccDelay', false);
            }
        }
    }, {
        /**
        * Conatins row data
        *
        * @class DataRow
        * @construtor
        * @extends Backbone.Model
        * @namespace MathInteractives.Common.Player.Models.DataRow
        */
        DataRow: Backbone.Model.extend({
            defaults: {
                isHeaderRow: false,
                isSubHeaderRow: false,
                isTableSectionHeaderRow: false,
                rowData: null,
                rowNumber: null
            },
            /**
            * intialise rowData
            *
            * @method initialize
            **/
            initialize: function initialize() {
                "use strict";
                var currentNamespace = MathInteractives.Common.Player.Models.Table;
                if (this.get("isHeaderRow") === true) {
                    if (!this.get("rowData"))
                        this.set("rowData", new currentNamespace.HeaderCells());
                    else this.set("rowData", new currentNamespace.HeaderCells(this.get("rowData")));
                }
                else {
                    if (!this.get("rowData"))
                        this.set("rowData", new currentNamespace.DataCells());
                    else this.set("rowData", new currentNamespace.DataCells(this.get("rowData")));
                }
            }
        }),
        /**
        * collection of rows
        *
        * @class DataRows
        * @construtor
        * @extends Backbone.Collection
        * @namespace MathInteractives.Common.Player.Models.DataRows
        */
        DataRows: Backbone.Collection.extend({
            model: this.DataRow,
            initialize: function () {
                "use strict";
                this.model = MathInteractives.Common.Player.Models.Table.DataRow;
            }
        }),
        /**
        * 
        *
        * @class DataCell
        * @construtor
        * @extends Backbone.Model
        * @namespace MathInteractives.Common.Player.Models.DataCell
        */
        DataCell: Backbone.Model.extend({
            defaults: {
                /**
                * @property text
                * type string
                * @default null
                * @public
                */
                text: null,
                /**
                * @property addBlankData
                * type boolean
                * @default null
                * @public
                */
                addBlankData: null,
                /**
                * @property formulaForCalculation
                * string containing the formula in the form "col0*col1/col2^col3"
                * @default null
                * @public
                */
                formulaForCalculation: null,
                /**
                * @property showCalculatedValues
                * type boolean
                * @default false
                * @public
                */
                showCalculatedValues: false,
                /**
                * @property compareWithColumns
                * type array
                * @default null
                * @public
                */
                compareWithColumns: null,
                /**
                * @property columnNumberForTicks
                * type number
                * @default null
                * @public
                */
                columnNumberForTicks: null,
                /**
                * @property showTicksInThisCell
                * type boolean
                * @default false
                * @public
                */
                showTicksInThisCell:false
            }
        }),
        /**
        * collection of DataCell
        *
        * @class DataCells
        * @construtor
        * @extends Backbone.Collection
        * @namespace MathInteractives.Common.Player.Models.DataCells
        */
        DataCells: Backbone.Collection.extend({
            model: this.DataCell,
            initialize: function () {
                "use strict";
                this.model = MathInteractives.Common.Player.Models.Table.DataCell;
            }
        }),
        /**
        *
        * @class HeaderCell
        * @construtor
        * @extends Backbone.Model
        * @namespace MathInteractives.Common.Player.Models.HeaderCell
        */
        HeaderCell: Backbone.Model.extend({
            defaults: {
                text: null,
                rowSpan: 1,
                colSpan: 1,
                width: 100
            }
        }),
        /**
        * collection of HeaderCell
        *
        * @class HeaderCells
        * @construtor
        * @extends Backbone.Collection
        * @namespace MathInteractives.Common.Player.Models.HeaderCells
        */
        HeaderCells: Backbone.Collection.extend({
            model: this.HeaderCell,
            initialize: function () {
                "use strict";
                this.model = MathInteractives.Common.Player.Models.Table.HeaderCell;
            }
        })
    })
})();