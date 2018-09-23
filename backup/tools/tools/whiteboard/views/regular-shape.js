(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //regular shape view start **********************************************
    WhiteboardTool.Views.RegularShape = WhiteboardTool.Views.BasePolygon.extend({
        "_maxWidth": null,
        "_maxHeight": null,
        "_hasHorizontalSpacing": null,
        "_hasVerticalSpacing": null,
        "_xDiff": null,
        "_yDiff": null,

        /**
         * Initializer of RegularShape view.
         * @private
         * @method initialize
         */
        "initialize": function() {
            WhiteboardTool.Views.RegularShape.__super__.initialize.apply(this, arguments);
            this.model.set("sidesCount", this.options.sides);

            if (arguments && arguments.length > 0) {
                this._setShapeType(arguments[0].sides);
            }
        },

        "initModel": function() {
            this.model = new WhiteboardTool.Models.RegularShape();
        },

        "_setShapeType": function(nSides) {
            var data = this.model.getData();
            if (typeof nSides !== "undefined" && data) {
                switch (nSides) {
                    case 3:
                        data.nType = WhiteboardTool.Views.ShapeType.Triangle;
                        break;
                    case 4:
                        data.nType = WhiteboardTool.Views.ShapeType.Square;
                        break;
                    case 5:
                        data.nType = WhiteboardTool.Views.ShapeType.Pentagon;
                        break;
                    case 6:
                        data.nType = WhiteboardTool.Views.ShapeType.Hexagon;
                        break;
                }
            }
        },

        "processTouchEnd": function() {
            WhiteboardTool.Views.RegularShape.__super__.processTouchEnd.apply(this, arguments);
            this.trigger("equation-complete");
        },

        "getShapePoints": function(boundingRect) {
            var shapeAttr = this.model.getShapeParameters(boundingRect, {
                    "hexagon": this._hasHorizontalSpacing,
                    "triangle": this._hasVerticalSpacing,
                    "pentagon": this._hasVerticalSpacing
                }),
                arrTempPoints = [],
                segments,
                segmentsCounter,
                polygonPath,
                maxX = 0,
                maxY = 0,
                minX = null,
                minY = null,
                segmentsLen;

            polygonPath = new WhiteboardTool.Views.PaperScope.Path.RegularPolygon({
                "center": shapeAttr.center,
                "sides": this.options.sides,
                "radius": shapeAttr.radius
            });

            segments = polygonPath.segments;
            segmentsLen = segments.length;
            for (segmentsCounter = 0; segmentsCounter < segmentsLen; segmentsCounter++) {
                arrTempPoints[segmentsCounter] = new WhiteboardTool.Views.PaperScope.Point(segments[segmentsCounter].point.x, segments[segmentsCounter].point.y);
                if (minX === null || minX > segments[segmentsCounter].point.x) {
                    minX = segments[segmentsCounter].point.x;
                }
                if (maxX < segments[segmentsCounter].point.x) {
                    maxX = segments[segmentsCounter].point.x;
                }
                if (maxY < segments[segmentsCounter].point.y) {
                    maxY = segments[segmentsCounter].point.y;
                }
                if (minY === null || minY > segments[segmentsCounter].point.y) {
                    minY = segments[segmentsCounter].point.y;
                }
            }

            this._xDiff = shapeAttr.radius - (shapeAttr.center.x - minX);
            this._yDiff = shapeAttr.radius - (maxY - shapeAttr.center.y);

            this._maxWidth = maxX - boundingRect.x;
            this._maxHeight = maxY - boundingRect.y;

            return arrTempPoints;
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

            WhiteboardTool.Views.RegularShape.__super__.resize.call(this, box.clone(), bReDraw);
        }
    });

    //regular shape view end **********************************************

})(window.MathUtilities);
