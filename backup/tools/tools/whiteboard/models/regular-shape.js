(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                          Regular Shape                          */
    /*******************************************************************/
    WhiteboardTool.Models.RegularShape = WhiteboardTool.Models.BasePolygon.extend({
        /**
         * Returns true if number passed as argument is an odd number
         * @method isOdd
         * @param {Number} number Sides of a regular polygon.
         * @private
         * @return {Boolean}
         */
        "isOdd": function(number) {
            return number % 2 !== 0;
        },

        "setDefaults": function() {
            WhiteboardTool.Models.RegularShape.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "nType": WhiteboardTool.Views.ShapeType.Rectangle,
                "menuType": 3
            });
        },

        /**
         * Returns radius and center of a regular polygon.
         * @method getShapeParameters
         * @param {Object} boundingRect Bounding Rectangle of a polygon where values should be in point form.
         * @private
         * @return {Object}
         */
        "getShapeParameters": function(boundingRect, param) {
            var pointSwapVar, polySide, maxFactor,
                polyRadius,
                centerX, centerY, apothem, startPoint, endPoint, diff,
                sides = this.get("sidesCount"),
                shapeWidth = Math.abs(boundingRect.width), //+ve width, so that shape is always drawn with positive values
                shapeHeight = Math.abs(boundingRect.height), // //+ve height, so that shape is always drawn with positive values
                parameter = null,
                point1,
                point2;

            point1 = startPoint = new WhiteboardTool.Models.Point(boundingRect.x, boundingRect.y);
            point2 = endPoint = new WhiteboardTool.Models.Point(startPoint.x + shapeWidth, startPoint.y + shapeHeight);
            maxFactor = this.getMaxFactor(boundingRect);
            polySide = this.getPolygonSide(maxFactor);
            polyRadius = this.getRadius(polySide);


            switch (this.getType()) {
                case WhiteboardTool.Views.ShapeType.Square:
                    centerX = startPoint.x + maxFactor / 2;
                    centerY = startPoint.y + maxFactor / 2;
                    break;
                case WhiteboardTool.Views.ShapeType.Hexagon:
                    if (param.hexagon === null) {
                        param.hexagon = 1;
                    }
                    centerX = startPoint.x + maxFactor / 2;
                    centerY = startPoint.y + polySide;
                    apothem = polySide * Math.cos(Math.PI / sides);
                    diff = polySide - apothem;
                    centerX = centerX - diff * param.hexagon;
                    break;
                default:
                    centerX = startPoint.x + maxFactor / 2;
                    parameter = this.getData().nType === WhiteboardTool.Views.ShapeType.Triangle ? param.triangle : param.pentagon;
                    if (parameter === null) {
                        centerY = startPoint.y + polyRadius;
                    } else {
                        apothem = polyRadius * Math.cos(Math.PI / sides);
                        centerY = endPoint.y + apothem * parameter;
                    }
                    break;
            }

            if (point2.x < point1.x) {
                pointSwapVar = startPoint.x;
                startPoint.x = endPoint.x;
                endPoint.x = pointSwapVar;
                centerX = endPoint.x - maxFactor / 2;
                if (diff) {
                    centerX = centerX + diff;
                }
            }
            if (point2.y < point1.y) {
                pointSwapVar = startPoint.y;
                startPoint.y = endPoint.y;
                endPoint.y = pointSwapVar;
                apothem = polyRadius * Math.cos(Math.PI / sides);
                centerY = endPoint.y - apothem;
                if (diff) {
                    centerY = centerY - diff;
                }
            }

            return {
                "radius": polyRadius,
                "center": new WhiteboardTool.Models.Point(centerX, centerY)
            };
        },

        /**
         * Returns side of a Regular polygon
         * @method getPolygonSide
         * @param {Object} maxFactor Maximum of (width,Height).
         * @private
         * @return {Object}
         */
        "getPolygonSide": function(maxFactor) {
            var side = null,
                sides = this.get("sidesCount"),
                interiorAng = 180 - 360 / sides;

            switch (this.getType()) {
                case WhiteboardTool.Views.ShapeType.Square:
                    side = maxFactor;
                    break;
                case WhiteboardTool.Views.ShapeType.Hexagon:
                    side = maxFactor / 2;
                    break;
                default:
                    side = maxFactor / 2 / Math.sin(interiorAng / 2 * Math.PI / 180);
                    break;
            }
            return side;
        },

        /**
         * Returns radius of a Regular polygon
         * @method getRadius
         * @param {Object} polySide Side of a polygon.
         * @private
         * @return {Object}
         */
        "getRadius": function(polySide) {
            var radius = null,
                sides = this.get("sidesCount"),
                interiorAng = 180 - 360 / sides;

            switch (this.getType()) {
                case WhiteboardTool.Views.ShapeType.Square:
                    radius = Math.sqrt(Math.pow(polySide / 2, 2) + Math.pow(polySide / 2, 2));
                    break;
                case WhiteboardTool.Views.ShapeType.Hexagon:
                    radius = polySide;
                    break;
                default:
                    radius = polySide * Math.sin(interiorAng / 2 * (Math.PI / 180)) / Math.sin(360 / sides * (Math.PI / 180));
                    break;
            }
            return radius;
        },

        "getType": function() {
            var data = this.getData();
            return data.nType;
        }
    });
})(window.MathUtilities);
