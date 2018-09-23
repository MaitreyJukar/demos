(function(MathUtilities) {
     "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                         Compass Ruler                                 */
    /*******************************************************************/
    /**
     * A customized Backbone.Model that represents base shape.
     * @class MathUtilities.Tools.ConstructionTool.Models.CompassRuler
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Models.BaseRuler
     */
    ConstructionTool.Models.CompassRuler = ConstructionTool.Models.BaseRuler.extend({
        "initialize": function() {
            var options = {
                    "_rulerProp": {
                        "width": 378,
                        "height": 34,
                        "leftPadding": -15,
                        "rightPadding": 6,
                        "bottomPadding": 1,
                        "topPadding": -12,
                        "maxWidth": 378,
                        "minWidth": 44
                    },
                    "_rulerType": ConstructionTool.Views.RulerType.Compass,
                    "_pencilProp": {
                        "width": 11,
                        "height": 33,
                        "rightPadding": 57,
                        "topPadding": -16.5
                    },
                    "_rulerPositionerProp": {
                        "width": 46,
                        "height": 38,
                        "leftPadding": 1,
                        "topPadding": 0,
                        "rightPadding": -4,
                        "bottomPadding": 6
                    },
                    "rotateAngle": 0,
                    "_rotateButtonProp": {
                        "rightPadding": 110,
                        "topPadding": 45,
                        "width": 28,
                        "height": 28
                    },
                    "_arrowProp": {
                        "topPadding": 10,
                        "bottomPadding": 10,
                        "height": 9,
                        "width": 9
                    },
                    "_rulerResizerProp": {
                        "width": 40,
                        "height": 43,
                        "leftPadding": -6,
                        "topPadding": 2
                    },
                    "_centerProp": {
                        "width": 20,
                        "height": 35,
                        "topPadding": -1,
                        "leftPadding": 5,
                        "bottomPadding": 0.5
                    },
                    "_pencilPoint": {
                        "topPadding": -2,
                        "leftPadding": 0
                    },
                    "_pencilPositionerProp": {
                        "width": 40,
                        "height": 42,
                        "leftPadding": 1,
                        "topPadding": 2
                    },
                    "isActive": true
                };
            this.setOptions(options);

            ConstructionTool.Models.CompassRuler.__super__.initialize.apply(this, arguments);
        },

        "setDefaults": function() {
            var renderData = this.get("_renderData"),
                rulerProp = renderData._rulerProp,
                rulerCenterProp = renderData._centerProp,
                canvasSize = ConstructionTool.Views.CanvasSize,
                canvasCenter = new ConstructionTool.Models.Point(canvasSize.width / 2, canvasSize.height / 2),
                rulerTopLeft = new ConstructionTool.Models.Point({
                    "x": canvasCenter.x - rulerProp.width / 2 + rulerProp.leftPadding,
                    "y": canvasCenter.y - rulerProp.height / 2 + rulerProp.topPadding
                }), //rotate padding is subtracted from top-right of ruler so as to avoid overlapping of pencil positioner with rotate button
                centerProp = renderData._centerProp;

            // Set render data defaults
            renderData.rotateAngle = 0;
            renderData.rulerTopLeft = rulerTopLeft;
            renderData.rulerCenter = new ConstructionTool.Models.Point(rulerTopLeft.x + rulerProp.width + rulerCenterProp.width - centerProp.leftPadding, rulerTopLeft.y + rulerProp.height / 2 + centerProp.bottomPadding);

            renderData.rulerExtremes = {
                "left": rulerTopLeft.clone(),
                "right": rulerTopLeft.clone()
            };
            renderData.pencilPositionerPosition = new ConstructionTool.Models.Point(0, 0);

            this.setOptions(renderData);
        },

        "setOptions": function setOptions(options) {
            if (typeof options === "undefined" || options === null) {
                return;
            }

            ConstructionTool.Models.CompassRuler.__super__.setOptions.apply(this, arguments);

            var data = this.get("_renderData");


            if (typeof options._rulerResizerProp !== "undefined") {
                if (typeof data._rulerResizerProp === "undefined") {
                    data._rulerResizerProp = {};
                }
                if (typeof options._rulerResizerProp.width !== "undefined") {
                    data._rulerResizerProp.width = options._rulerResizerProp.width;
                }
                if (typeof options._rulerResizerProp.height !== "undefined") {
                    data._rulerResizerProp.height = options._rulerResizerProp.height;
                }
                if (typeof options._rulerResizerProp.leftPadding !== "undefined") {
                    data._rulerResizerProp.leftPadding = options._rulerResizerProp.leftPadding;
                }
                if (typeof options._rulerResizerProp.rightPadding !== "undefined") {
                    data._rulerResizerProp.rightPadding = options._rulerResizerProp.rightPadding;
                }
                if (typeof options._rulerResizerProp.topPadding !== "undefined") {
                    data._rulerResizerProp.topPadding = options._rulerResizerProp.topPadding;
                }
                if (typeof options._rulerResizerProp.bottomPadding !== "undefined") {
                    data._rulerResizerProp.bottomPadding = options._rulerResizerProp.bottomPadding;
                }
            }
            if (typeof options._centerProp !== "undefined") {
                if (typeof data._centerProp === "undefined") {
                    data._centerProp = {};
                }
                if (typeof options._centerProp.width !== "undefined") {
                    data._centerProp.width = options._centerProp.width;
                }
                if (typeof options._centerProp.height !== "undefined") {
                    data._centerProp.height = options._centerProp.height;
                }
                if (typeof options._centerProp.leftPadding !== "undefined") {
                    data._centerProp.leftPadding = options._centerProp.leftPadding;
                }
                if (typeof options._centerProp.rightPadding !== "undefined") {
                    data._centerProp.rightPadding = options._centerProp.rightPadding;
                }
                if (typeof options._centerProp.topPadding !== "undefined") {
                    data._centerProp.topPadding = options._centerProp.topPadding;
                }
                if (typeof options._centerProp.bottomPadding !== "undefined") {
                    data._centerProp.bottomPadding = options._centerProp.bottomPadding;
                }
            }
            if (typeof options.isActive !== "undefined") {
                data.isActive = options.isActive;
            }
            if (typeof options._pencilPoint !== "undefined") {
                if (typeof data._pencilPoint === "undefined") {
                    data._pencilPoint = {};
                }
                if (typeof options._pencilPoint.leftPadding !== "undefined") {
                    data._pencilPoint.leftPadding = options._pencilPoint.leftPadding;
                }
                if (typeof options._pencilPoint.rightPadding !== "undefined") {
                    data._pencilPoint.rightPadding = options._pencilPoint.rightPadding;
                }
                if (typeof options._pencilPoint.topPadding !== "undefined") {
                    data._pencilPoint.topPadding = options._pencilPoint.topPadding;
                }
                if (typeof options._pencilPoint.bottomPadding !== "undefined") {
                    data._pencilPoint.bottomPadding = options._pencilPoint.bottomPadding;
                }
            }
        },

        "getReferencePoint": function getReferencePoint() {
            return this.getRulerCenter();
        },

        "getBoundingBox": function getBoundingBox() {
            var renderData = this.get("_renderData"),
                rulerTopLeft = this.getRulerTopLeft(),
                rulerProp = renderData._rulerProp,
                pencilProp = renderData._pencilProp,
                rotateButtonProp = renderData._rotateButtonProp,
                resizeButtonProp = renderData._rulerResizerProp,
                rulerPositionerProp = renderData._rulerPositionerProp,


                xPoint = rulerTopLeft.x - (pencilProp.width + pencilProp.rightPadding) - (rotateButtonProp.width / 2 + rotateButtonProp.rightPadding),
                width = rulerProp.width + (pencilProp.width + pencilProp.rightPadding) + (rotateButtonProp.width / 2 + rotateButtonProp.rightPadding) + resizeButtonProp.width,
                height = rulerProp.height + rulerPositionerProp.height,

                box = new ConstructionTool.Models.Rect({
                    "x": xPoint,
                    "y": rulerTopLeft.y,
                    "width": width,
                    "height": height
                });
            return box;
        },
        "getEndPoints": function getEndPoints() {
            var renderData = this.get("_renderData"),
                rulerTopLeft = this.getRulerTopLeft(),
                rulerProp = renderData._rulerProp,
                pencilProp = renderData._pencilProp,
                rotateButtonProp = renderData._rotateButtonProp,
                rulerPositionerProp = renderData._rulerPositionerProp,
                centerProp = renderData._centerProp,


                endPoints = [],
                point = null,
                transformModel = ConstructionTool.Models.Transform,
                boundingPoints = [{
                    "x": rulerTopLeft.x - rotateButtonProp.width / 2 - rotateButtonProp.rightPadding,
                    "y": rulerTopLeft.y + rulerProp.height / 2 - rotateButtonProp.height / 2
                }, {
                    "x": rulerTopLeft.x - rotateButtonProp.width / 2 - rotateButtonProp.rightPadding,
                    "y": rulerTopLeft.y + rulerProp.height / 2 + rotateButtonProp.height / 2
                }, {
                    "x": rulerTopLeft.x - pencilProp.width / 2 - pencilProp.rightPadding,
                    "y": rulerTopLeft.y - pencilProp.height / 2 + pencilProp.topPadding
                }, {
                    "x": rulerTopLeft.x + rulerProp.width,
                    "y": rulerTopLeft.y
                }, {
                    "x": rulerTopLeft.x + rulerProp.width + centerProp.width,
                    "y": rulerTopLeft.y + rulerProp.height / 2
                }, {
                    "x": rulerTopLeft.x + rulerProp.width,
                    "y": rulerTopLeft.y + rulerProp.height
                }, {
                    "x": rulerTopLeft.x + rulerProp.width / 2 - rulerPositionerProp.width / 2 - rulerPositionerProp.rightPadding,
                    "y": rulerTopLeft.y + rulerProp.height + rulerPositionerProp.height - rulerPositionerProp.topPadding
                }, {
                    "x": rulerTopLeft.x + rulerProp.width / 2 + rulerPositionerProp.width / 2,
                    "y": rulerTopLeft.y + rulerProp.height + rulerPositionerProp.height - rulerPositionerProp.topPadding
                }];

            for (point in boundingPoints) {
                endPoints.push(transformModel.toGraphCo(this._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(boundingPoints[point].x, boundingPoints[point].y))));
            }

            return endPoints;
        }
    });
}(window.MathUtilities));
