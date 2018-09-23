(function(MathUtilities) {
     "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                          Compass                                */
    /*******************************************************************/
    /**
     * A customized Backbone.Model that represents Compass shape.
     * @class MathUtilities.Tools.ConstructionTool.Models.Compass
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Models.BaseShape
     */
    ConstructionTool.Models.Compass = ConstructionTool.Models.BaseShape.extend({
        "setDefaults": function() {
            ConstructionTool.Models.Compass.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "fillColor": "no-fill",
                "shapeType": ConstructionTool.Views.ToolType.Compass,
                "allowSelection": false
            });
        },
        /**
         * Sets datapoints of a shape.
         * @private
         * @method setFedPoints
         * @param {Object} points. Array of points
         */
        "setFedPoints": function(points, isGraphCo) {
            var renderData = this.get("_renderData"),
                graphPoints = [],
                point, subPoint, subPoints,
                transformModel = ConstructionTool.Models.Transform;
            for (point in points) {
                subPoints = points[point];
                graphPoints[point] = [];
                for (subPoint in subPoints) {
                    graphPoints[point].push(isGraphCo === true ? subPoints[subPoint] : transformModel.toGraphCo(subPoints[subPoint]));
                }
            }
            renderData.dataPoints = graphPoints;
        },

        /**
         * return datapoints of a shape.
         * @private
         * @method getFedPoints
         * @return {Object} points. Array of points
         */
        "getFedPoints": function() {
            var renderData = this.get("_renderData"),
                canvasPoints = [],
                point, subPoint, subPoints,
                points = renderData.dataPoints,
                transformModel = ConstructionTool.Models.Transform;
            for (point in points) {
                subPoints = points[point];
                canvasPoints[point] = [];
                for (subPoint in subPoints) {
                    canvasPoints[point].push(transformModel.toCanvasCo(subPoints[subPoint]));
                }
            }
            return canvasPoints;
        },

        /**
         * Inserts canvas point in dataPoints array.
         * @private
         * @method _feedPoint
         * @param {Object} A point object to be inserted in dataPoints.
         * @param {Number} index where to insert the point.
         */
        "_feedPoint": function _feedPoint(curPoint, index) {
            if (curPoint.length < 0 && (typeof curPoint.clone === "undefined" || curPoint.clone === null)) {
                curPoint = new ConstructionTool.Models.Point(curPoint);
            }

            var renderData = this.get("_renderData"),
                transformModel = ConstructionTool.Models.Transform,
                tempPoint = [],
                point;

            for (point in curPoint) {
                tempPoint.push(transformModel.toGraphCo(curPoint[point]));
            }

            if (typeof index !== "undefined" && index !== null) {
                renderData.dataPoints[index] = tempPoint;
            } else {
                renderData.dataPoints.push(tempPoint);
            }
        }
    });
}(window.MathUtilities));
