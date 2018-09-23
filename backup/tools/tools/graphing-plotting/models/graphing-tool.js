/* globals window, MatrixData */

(function(MathUtilities) {
    "use strict";

    MathUtilities.Tools.Graphing = {};

    MathUtilities.Tools.Graphing.Views = {};

    MathUtilities.Tools.Graphing.Models = {};

    /**
     * GraphingToolModel holds data related GraphingToolView
     * @class GraphingToolModel
     * @extends Backbone.View
     * @constructor
     */
    MathUtilities.Tools.Graphing.Models.GraphingToolModel = Backbone.Model.extend({
        "defaults": {
            /**
             * Identifies if any popup is open
             *@property _anyPopupOpen
             *@type boolean
             *@default null
             */
            "_anyPopupOpen": null,

            "loadedState": null,

            "_columnHidden": null,
            "isAccessible": false,

            /**
             * Flag which determines animate charts property
             * @property animateCharts
             * @type {Boolean}
             * @default false
             */
            "animateCharts": false,

            /**
             * Default precision value
             * @type {integer}
             */
            "precision": MathUtilities.Components.Utils.Models.MathHelper.DEFAULT_PRECISION_VALUE_GRAPHING_TOOL

        },

        "initialize": function() {
            this.set({
                "_anyPopupOpen": false,
                "_columnHidden": false
            });
        }

    }, {
        "BASEPATH": "",

        "MODULE_NAME": "graphingTool",

        /**
         * Precision related values
         * MIN is the minimum precision value
         * MAX is the maximum precision value
         * STEP is the step value for precision
         */
        "PRECISION_VALUE": {
            "MIN": 0,
            "MAX": 10,
            "STEP": -1
        }
    });
}(window.MathUtilities));
