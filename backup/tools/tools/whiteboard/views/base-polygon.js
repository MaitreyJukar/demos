(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //base polygon view start **********************************************
    WhiteboardTool.Views.BasePolygon = WhiteboardTool.Views.BaseShape.extend({
        "initModel": function() {
            this.model = new WhiteboardTool.Models.BasePolygon();
        },

        "draw": function() {
            WhiteboardTool.Views.BasePolygon.__super__.draw.apply(this, arguments);
            var boundingBox = this.model.getBoundingBox(),
                arrTempPoints = this.getShapePoints(boundingBox),
                data = this.model.getData();

            this.model._clearFedPoints();
            this.model.setFedPoints(arrTempPoints);

            this.applySizing();
            this.applyFlip();
            this.applyRotation();

            this.updatePathZindex();
            if (data.bSelected) {
                this.drawBounds(this.getBoundingRect());
            }
        },


        "applySizing": function() {
            var style = this._getApplicableStrokeStyle(this.isSelected()),
                arrPoints = this.model.getFedPoints(),
                data = this.model.getData(),
                isDashed = data.isDashed;

            this._intermediatePath = new WhiteboardTool.Views.PaperScope.Path({
                "segments": arrPoints,
                "closed": data.closed && !isDashed,
                "strokeJoin": "round"
            });

            this.applyStyleToPathGroup(this._intermediatePath, style);
        },

        "getShapePoints": function(boundingRect) {
            var arrTempPoints = [],
                segments = null,
                segmentsCounter = 0,
                totalSegments,
                intermediatePath = null;

            intermediatePath = new WhiteboardTool.Views.PaperScope.Path.Rectangle(boundingRect.x, boundingRect.y, Math.abs(boundingRect.width), Math.abs(boundingRect.height));

            segments = intermediatePath.segments;
            totalSegments = segments.length;
            for (; segmentsCounter < totalSegments; segmentsCounter++) {
                arrTempPoints[segmentsCounter] = new WhiteboardTool.Views.PaperScope.Point(segments[segmentsCounter].point.x, segments[segmentsCounter].point.y);
            }
            intermediatePath.remove();
            return arrTempPoints;
        }
    });

    //base polygon view end **********************************************

})(window.MathUtilities);
