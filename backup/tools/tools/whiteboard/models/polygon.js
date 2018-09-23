(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                            Polygon                              */
    /*******************************************************************/
    WhiteboardTool.Models.Polygon = WhiteboardTool.Models.BasePolygon.extend({
        "setDefaults": function() {
            WhiteboardTool.Models.Polygon.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "nType": WhiteboardTool.Views.ShapeType.Polygon,
                "menuType": WhiteboardTool.Views.MenuBarType.Polygon
            });
        },
        "getBackupFedPoints": function() {
            var renderData = this.get("_renderData"),
                canvasPoints = [],
                point,
                points = renderData.backupPoints,
                TransformModel = WhiteboardTool.Models.Transform;

            for (point in points) {
                canvasPoints.push(TransformModel.toCanvasCo(points[point]));
            }
            return canvasPoints;
        },

        "setBackupFedPoints": function(arrPoints, isGraphCoord) {
            var renderData = this.get("_renderData"),
                graphPoints = [],
                point,
                TransformModel = WhiteboardTool.Models.Transform;

            for (point in arrPoints) {
                graphPoints.push(isGraphCoord ? arrPoints[point] : TransformModel.toGraphCo(arrPoints[point]));
            }
            renderData.backupPoints = graphPoints;
        },

        "setRenderData": function(objData, isGraphCoord) {
            WhiteboardTool.Models.Polygon.__super__.setRenderData.apply(this, arguments);

            if (objData.backupPoints !== void 0) {
                this.setBackupFedPoints(objData.backupPoints, isGraphCoord);
            }
        }

    });
})(window.MathUtilities);
