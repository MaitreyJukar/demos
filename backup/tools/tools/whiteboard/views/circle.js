(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //circle view start **********************************************
    WhiteboardTool.Views.Circle = WhiteboardTool.Views.BaseShape.extend({
        "initModel": function() {
            this.model = new WhiteboardTool.Models.Circle();
        },

        "processTouchEnd": function() {
            WhiteboardTool.Views.Circle.__super__.processTouchEnd.apply(this, arguments);
            this.trigger("equation-complete");
        },

        "draw": function() {
            WhiteboardTool.Views.Circle.__super__.draw.apply(this, arguments);

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
                radius = this.model.getRadius(),
                boundingBox = this.model.getBoundingBox();

            this.resize(boundingBox, false);
            this._intermediatePath = new WhiteboardTool.Views.PaperScope.Path.Circle({
                "center": this.model.getCenterPoint(boundingBox),
                "radius": radius,
                "strokeColor": "black"
            });
            this.applyStyleToPathGroup(this._intermediatePath, style);
        },

        "resize": function(box, bReDraw) {
            var isNegativeNum = null;

            if (Math.abs(box.width) > Math.abs(box.height)) {
                isNegativeNum = this.model.isNegative(box.height);
                box.height = box.width;
                box.height = this.model.isNegative(box.height) === isNegativeNum ? box.height : -box.height;
            } else {
                isNegativeNum = this.model.isNegative(box.width);
                box.width = box.height;
                box.width = this.model.isNegative(box.width) === isNegativeNum ? box.width : -box.width;
            }

            WhiteboardTool.Views.Circle.__super__.resize.call(this, box.clone(), bReDraw);
        }
    });

    //circle view end **********************************************
})(window.MathUtilities);
