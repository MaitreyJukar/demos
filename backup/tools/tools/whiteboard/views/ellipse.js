(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //ellipse view start **********************************************
    WhiteboardTool.Views.Ellipse = WhiteboardTool.Views.BaseShape.extend({
        /**
         * Initializer of Triangle view.
         * @private
         * @method initialize
         */
        "initModel": function() {
            this.model = new WhiteboardTool.Models.Ellipse();
        },

        "processTouchEnd": function() {
            WhiteboardTool.Views.Ellipse.__super__.processTouchEnd.apply(this, arguments);
            this.trigger("equation-complete");
        },

        /**
         * Calls draw method of parent.
         * @private
         * @method draw
         */
        "draw": function() {
            WhiteboardTool.Views.Ellipse.__super__.draw.apply(this, arguments);

            var data = this.model.getData();

            this.applySizing();
            this.applyRotation();
            this.updatePathZindex();

            if (data.bSelected) {
                this.drawBounds(this.getBoundingRect());
            }
        },

        /**
         * Draws Shape. Overrides ApplySizing function of parent.
         * @method applySizing
         * @private
         */
        "applySizing": function() {
            var style = this._getApplicableStrokeStyle(this.isSelected()),
                boundingBox = this.model.getBoundingBox();

            this._intermediatePath = new WhiteboardTool.Views.PaperScope.Path.Ellipse({
                "point": new WhiteboardTool.Models.Point(boundingBox.x, boundingBox.y),
                "size": [boundingBox.width, boundingBox.height],
                "strokeColor": "black"
            });
            this.applyStyleToPathGroup(this._intermediatePath, style);
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
    //ellipse view end **********************************************
})(window.MathUtilities);
