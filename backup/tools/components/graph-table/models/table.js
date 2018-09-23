/* globals MathUtilities */

(function() {
    "use strict";
    /**
     * Creates a table model that stores table information.
     *
     * @class MathUtilities.Components.GraphTable.Models.Table
     * @extends Backbone.View
     * @constructor
     */
    MathUtilities.Components.GraphTable.Models.Table = Backbone.Model.extend({

        "defaults": function() {
            return {

                /**
                 * Contains the number of rows for the table.
                 *
                 * @property rowCount
                 * @type Number
                 * @default null
                 */
                "rowCount": null,
                "bestFitData": {},
                "chartBestFit": null,
                "boxAndWhiskerData": null,
                "boxBestFitCounters": null,
                /**
                 * Contains the number of columns for the table.
                 *
                 * @property colCount
                 * @type Number
                 * @default null
                 */
                "colCount": null,
                /**
                 * Contains the `Object` for Mathquill editor.
                 *
                 * @property oEditorParam
                 * @type Object
                 * @default null
                 */
                "oEditorParam": null,
                "rowHeaderChecked": false,
                "showTable": true,
                "lineOptionSelected": true,
                "eyeOpen": true,
                "columnColors": null,
                /**
                 * Contains the `JSON Object` for the entire table.
                 *
                 * @property tableData
                 * @type Object
                 * @default null
                 */
                "tableData": null,
                "histogramData": null,
                "dotChartData": null,
                "boxChartData": null,
                "tableContents": null,
                "tableName": null,
                "residualColumnCount": null,
                "tableDataAnalysis": {},
                "columnFunctionOption": null,
                "residualColumnStates": null,
                "isRowHeaderChange": false,
                "plotColumnHidden": [],
                "isTableStructureChange": false,
                "residualColumnDependency": {}
            };
        },
        /**
         * Acts as the constructor for this view, is initialized when this views's object is created.
         *
         * @method initialize
         */
        "initialize": function() {
            this.set({
                "colCount": this.get('colCount') || 2,
                "rowCount": this.get('rows') || 0,
                "oEditorParam": this.get('oEditorParam'),
                "tableData": [],
                "columnColors": [],
                "tableContents": [],
                "columnFunctionOption": {},
                "chartBestFit": {},
                "histogramData": {},
                "dotChartData": {},
                "boxAndWhiskerSummary": [],
                "boxBestFitCounters": {},
                "residualColumnStates": {},
                "residualColumnCount": 0
            });
        },

        /**
         * Sets the editor object for the model's oEditorParam.
         *
         * @method setEditor
         * @param {Object} editorObj contains editor's information used for initializing and setting the editor.
         */
        "setEditor": function(editorObj) {
            this.set("oEditorParam", editorObj);
        },
        "getEditor": function() {
            return this.get("oEditorParam");
        }

    }, {
        "MODULE_NAME": "graph-table"
    });
})();
