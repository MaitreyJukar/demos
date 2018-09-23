(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                            Circle                               */
    /*******************************************************************/
    WhiteboardTool.Models.Circle = WhiteboardTool.Models.BaseShape.extend({
        "setDefaults": function() {
            WhiteboardTool.Models.Circle.__super__.setDefaults.apply(this, arguments);
            //set type of shape
            this.setOptions({
                "nType": WhiteboardTool.Views.ShapeType.Circle,
                "menuType": 3
            });
        },

        "getRadius": function() {
            var boundingBox = this.getBoundingBox(),
                boxWidth = Math.abs(boundingBox.width),
                boxHeight = Math.abs(boundingBox.height);

            return Math.max(boxWidth / 2, boxHeight / 2);
        },

        "getCenterPoint": function(boundingRect) {
            var shapeWidth = boundingRect.width, //+ve width, so that shape is always drawn with positive values
                shapeHeight = boundingRect.height, // //+ve height, so that shape is always drawn with positive values
                pointSwapVar, maxFactor,
                centerX, centerY,
                point1, startPoint,
                point2, endPoint;
            point1 = startPoint = new WhiteboardTool.Models.Point(boundingRect.x, boundingRect.y);
            point2 = endPoint = new WhiteboardTool.Models.Point(startPoint.x + shapeWidth, startPoint.y + shapeHeight);
            maxFactor = this.getMaxFactor(boundingRect);

            centerX = startPoint.x + maxFactor / 2;
            centerY = startPoint.y + maxFactor / 2;
            if (point2.x < point1.x) {
                pointSwapVar = startPoint.x;
                startPoint.x = endPoint.x;
                endPoint.x = pointSwapVar;
                centerX = endPoint.x - maxFactor / 2;
            }
            if (point2.y < point1.y) {
                pointSwapVar = startPoint.y;
                startPoint.y = endPoint.y;
                endPoint.y = pointSwapVar;
                centerY = endPoint.y - maxFactor / 2;
            }

            return new WhiteboardTool.Models.Point(centerX, centerY);
        },

        "getType": function() {
            var data = this.getData();
            return data.nType;
        }
    });
})(window.MathUtilities);
