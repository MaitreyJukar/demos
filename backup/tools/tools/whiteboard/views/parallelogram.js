(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //parallelogram view start **********************************************
    WhiteboardTool.Views.Parallelogram = WhiteboardTool.Views.BasePolygon.extend({
        "initModel": function() {
            this.model = new WhiteboardTool.Models.Parallelogram();
        },

        "processTouchEnd": function() {
            WhiteboardTool.Views.Parallelogram.__super__.processTouchEnd.apply(this, arguments);
            this.trigger("equation-complete");
        },

        "getShapePoints": function(boundingRect) {
            var topLeft, topRight, bottomLeft, bottomRight,
                boxWidth = Math.abs(boundingRect.width),
                boxHeight = Math.abs(boundingRect.height),
                slantBy,
                arrTempPoints = [],
                bend = this.model.get("bend"),
                PointModel = WhiteboardTool.Models.Point;

            slantBy = bend * Math.abs(boundingRect.width);

            topLeft = new PointModel(boundingRect.x + slantBy, boundingRect.y);
            topRight = new PointModel(boundingRect.x + boxWidth, boundingRect.y);
            bottomLeft = new PointModel(boundingRect.x, boundingRect.y + boxHeight);
            bottomRight = new PointModel(boundingRect.x + boxWidth - slantBy, boundingRect.y + boxHeight);


            arrTempPoints.push(topLeft);
            arrTempPoints.push(topRight);
            arrTempPoints.push(bottomRight);
            arrTempPoints.push(bottomLeft);

            return arrTempPoints;
        }
    });

    //parallelogram view end **********************************************
})(window.MathUtilities);
