(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //right triangle view start
    WhiteboardTool.Views.RightTriangle = WhiteboardTool.Views.BasePolygon.extend({
        /**
         * Initializer of Triangle view.
         * @private
         * @method initialize
         */
        "initModel": function() {
            this.model = new WhiteboardTool.Models.RightTriangle();
        },

        "processTouchEnd": function() {
            WhiteboardTool.Views.RightTriangle.__super__.processTouchEnd.apply(this, arguments);
            this.trigger("equation-complete");
        },

        "getShapePoints": function(boundingRect) {
            var topLeft, bottomLeft, bottomRight,
                boxWidth = Math.abs(boundingRect.width),
                boxHeight = Math.abs(boundingRect.height),
                arrTempPoints = [],
                PointModel = WhiteboardTool.Models.Point;

            topLeft = new PointModel(boundingRect.x, boundingRect.y);
            bottomLeft = new PointModel(boundingRect.x, boundingRect.y + boxHeight);
            bottomRight = new PointModel(boundingRect.x + boxWidth, boundingRect.y + boxHeight);

            arrTempPoints.push(topLeft);
            arrTempPoints.push(bottomRight);
            arrTempPoints.push(bottomLeft);

            return arrTempPoints;
        }
    });

    //right triangle view end **********************************************
})(window.MathUtilities);
