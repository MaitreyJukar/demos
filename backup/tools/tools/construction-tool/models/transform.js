(function(MathUtilities) {
     "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    ConstructionTool.Models.Transform = Backbone.Model.extend({}, {
        /**
         * Convert given canvas point to graph point.
         * @method toCanvasCo
         * @param graphCo {object} MathUtilities.Tools.ConstructionTool.Models.Point
         * @return point {object} MathUtilities.Tools.ConstructionTool.Models.Point
         * @private
         */

        "toCanvasCo": function toCanvasCo(graphCo) {
            if (ConstructionTool.Models.Transform.CURRENT_ORIGIN.canvasCo === null || typeof graphCo === "undefined" || graphCo === null) {
                return void 0;
            }
            var currentOrigin = ConstructionTool.Models.Transform.CURRENT_ORIGIN.canvasCo,
                canvasCo = {
                    "x": currentOrigin.x + graphCo.x,
                    "y": currentOrigin.y - graphCo.y
                };
            return new ConstructionTool.Models.Point(canvasCo);
        },
        /**
         * Convert given graph point to canvas point.
         * @method toGraphCo
         * @param canvasCo {object} MathUtilities.Tools.ConstructionTool.Models.Point
         * @return point {object} MathUtilities.Tools.ConstructionTool.Models.Point
         * @private
         */
        "toGraphCo": function toGraphCo(canvasCo) {
            if (ConstructionTool.Models.Transform.CURRENT_ORIGIN.canvasCo === null || typeof canvasCo === "undefined" || canvasCo === null) {
                return void 0;
            }
            var currentOrigin = ConstructionTool.Models.Transform.CURRENT_ORIGIN.canvasCo,
                graphCo = {
                    "x": canvasCo.x - currentOrigin.x,
                    "y": -canvasCo.y + currentOrigin.y
                };
            return new ConstructionTool.Models.Point(graphCo);
        },

        "CURRENT_ORIGIN": {
            "canvasCo": null,
            "graphCo": null
        },
        "DEFAULT_ORIGIN": {
            "canvasCo": null,
            "graphCo": null
        }
    });
}(window.MathUtilities));
