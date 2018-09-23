(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //trapezium view start **********************************************
    WhiteboardTool.Views.Trapezium = WhiteboardTool.Views.BasePolygon.extend({
        "initModel": function() {
            this.model = new WhiteboardTool.Models.Trapezium();
        },

        "processTouchEnd": function() {
            WhiteboardTool.Views.Trapezium.__super__.processTouchEnd.apply(this, arguments);
            this.trigger("equation-complete");
        },

        "getShapePoints": function(boundingRect) {
            var topLeft, topRight, bottomLeft, bottomRight,
                boxWidth = Math.abs(boundingRect.width),
                boxHeight = Math.abs(boundingRect.height),
                arrTempPoints = [],
                proportion = this.model.get("proportion"),
                PointModel = WhiteboardTool.Models.Point;

            topLeft = new PointModel(boundingRect.x + (boxWidth - boxWidth * proportion) / 2, boundingRect.y);
            topRight = new PointModel(topLeft.x + boxWidth * proportion, boundingRect.y);
            bottomLeft = new PointModel(boundingRect.x, boundingRect.y + boxHeight);
            bottomRight = new PointModel(boundingRect.x + boxWidth, boundingRect.y + boxHeight);

            arrTempPoints.push(topLeft);
            arrTempPoints.push(topRight);
            arrTempPoints.push(bottomRight);
            arrTempPoints.push(bottomLeft);

            return arrTempPoints;
        }
    });

    //trapezium view end **********************************************
})(window.MathUtilities);
