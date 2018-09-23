(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //arrow view start **********************************************
    WhiteboardTool.Views.Arrow = WhiteboardTool.Views.BasePolygon.extend({
        "initModel": function() {
            this.model = new WhiteboardTool.Models.Arrow();
        },

        "processTouchEnd": function() {
            WhiteboardTool.Views.Arrow.__super__.processTouchEnd.apply(this, arguments);
            this.trigger("equation-complete");
        },

        "getShapePoints": function(boundingRect) {
            var centerY,
                upperCenterY,
                lowerCenterY,
                bottomY,
                middleX,
                rightX,
                boxWidth = Math.abs(boundingRect.width),
                boxHeight = Math.abs(boundingRect.height),
                arrTempPoints = [],
                PointModel = WhiteboardTool.Models.Point;

            centerY = boundingRect.y + boxHeight / 2;
            upperCenterY = boundingRect.y + 2 * boxHeight / 8;
            lowerCenterY = boundingRect.y + 6 * boxHeight / 8;
            bottomY = boundingRect.y + boxHeight;
            middleX = boundingRect.x + 2 * boxWidth / 3;
            rightX = boundingRect.x + boxWidth;

            arrTempPoints.push(new PointModel(boundingRect.x, upperCenterY));
            arrTempPoints.push(new PointModel(middleX, upperCenterY));
            arrTempPoints.push(new PointModel(middleX, boundingRect.y));
            arrTempPoints.push(new PointModel(rightX, centerY));
            arrTempPoints.push(new PointModel(middleX, bottomY));
            arrTempPoints.push(new PointModel(middleX, lowerCenterY));
            arrTempPoints.push(new PointModel(boundingRect.x, lowerCenterY));

            return arrTempPoints;
        }
    });

    //arrow view end **********************************************
})(window.MathUtilities);
