/* globals geomFunctions*/
(function(MathUtilities) {
    "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                         Straight Liner                          */
    /*******************************************************************/
    /**
     * A customized Backbone.Model that represents base shape.
     * @class MathUtilities.Tools.ConstructionTool.Models.StraightLinerRuler
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Models.BaseRuler
     */
    ConstructionTool.Models.StraightLinerRuler = ConstructionTool.Models.BaseRuler.extend({
        "initialize": function() {
            var options = {
                "_rulerProp": {
                    "width": 418,
                    "height": 61,
                    "leftPadding": 1,
                    "rightPadding": 6,
                    "bottomPadding": 6
                },
                "_pencilPositionerProp": {
                    "width": 25,
                    "height": 27,
                    "leftPadding": 1,
                    "rightPadding": 2,
                    "bottomPadding": 1
                },
                "_pencilProp": {
                    "width": 11,
                    "height": 33
                },
                "_rulerPositionerProp": {
                    "width": 46,
                    "height": 38,
                    "leftPadding": 1,
                    "topPadding": -5,
                    "rightPadding": 5,
                    "bottomPadding": 6
                },
                "_rotateButtonProp": {
                    "rightPadding": 17,
                    "bottomPadding": -13,
                    "width": 28,
                    "height": 28
                },
                "_rulerType": ConstructionTool.Views.RulerType.StraightLiner,
                "_isArrowVisible": {
                    "left": true,
                    "right": true
                },
                "_arrowProp": {
                    "height": 9,
                    "width": 9
                }
            };

            this.setOptions(options);
            ConstructionTool.Models.StraightLinerRuler.__super__.initialize.apply(this, arguments);
        },

        "setDefaults": function() {
            ConstructionTool.Models.StraightLinerRuler.__super__.setDefaults.apply(this, arguments);
            var renderData = this.get("_renderData"),
                rulerProp = renderData._rulerProp,
                pencilPositionerProp = renderData._pencilPositionerProp,
                rotateButtonPadding = renderData._rotateButtonProp.rightPadding,
                canvasCenter = ConstructionTool.Views.PaperScope.view.center,
                rulerTopLeft = new ConstructionTool.Models.Point({
                    "x": canvasCenter.x - rulerProp.width / 2,
                    "y": canvasCenter.y - rulerProp.height / 2
                }),
                rulerTopRight = new ConstructionTool.Models.Point({
                    "x": rulerTopLeft.x + rulerProp.width - rulerProp.rightPadding - rotateButtonPadding,
                    "y": rulerTopLeft.y
                }); //rotate padding is subtracted from top-right of ruler so as to avoid overlapping of pencil positioner with rotate button

            renderData.rotateAngle = 0;
            renderData.rulerTopLeft = rulerTopLeft;
            renderData.rulerCenter = new ConstructionTool.Models.Point(rulerTopLeft.x + (rulerProp.width - rulerProp.rightPadding) / 2, rulerTopLeft.y + (rulerProp.height - rulerProp.bottomPadding) / 2);
            renderData.pencilTip = new ConstructionTool.Models.Point(rulerTopLeft.x, rulerTopLeft.y);
            renderData.rulerExtremes = {
                "left": rulerTopLeft.clone(),
                "right": rulerTopRight.clone()
            };
            renderData.pencilPositionerPosition = new ConstructionTool.Models.Point(rulerTopLeft.x + pencilPositionerProp.rightPadding / 2, rulerTopLeft.y + pencilPositionerProp.height / 2 + pencilPositionerProp.bottomPadding);
            this.setOptions(renderData);
        },

        "setOptions": function setOptions(options, isGraphCo) {
            if (typeof options === "undefined" || options === null) {
                return;
            }

            ConstructionTool.Models.StraightLinerRuler.__super__.setOptions.apply(this, arguments);

            var data = this.get("_renderData"),
                transformModel = ConstructionTool.Models.Transform;
            if (typeof options._pencilPositionerProp !== "undefined") {
                if (typeof data._pencilPositionerProp === "undefined") {
                    data._pencilPositionerProp = {};
                }
                if (typeof options._pencilPositionerProp.width !== "undefined") {
                    data._pencilPositionerProp.width = options._pencilPositionerProp.width;
                }
                if (typeof options._pencilPositionerProp.height !== "undefined") {
                    data._pencilPositionerProp.height = options._pencilPositionerProp.height;
                }
                if (typeof options._pencilPositionerProp.leftPadding !== "undefined") {
                    data._pencilPositionerProp.leftPadding = options._pencilPositionerProp.leftPadding;
                }
                if (typeof options._pencilPositionerProp.rightPadding !== "undefined") {
                    data._pencilPositionerProp.rightPadding = options._pencilPositionerProp.rightPadding;
                }
                if (typeof options._pencilPositionerProp.topPadding !== "undefined") {
                    data._pencilPositionerProp.topPadding = options._pencilPositionerProp.topPadding;
                }
                if (typeof options._pencilPositionerProp.bottomPadding !== "undefined") {
                    data._pencilPositionerProp.bottomPadding = options._pencilPositionerProp.bottomPadding;
                }
            }
            if (typeof options.rulerExtremes !== "undefined") {
                if (typeof data.rulerExtremes === "undefined") {
                    data.rulerExtremes = {};
                }
                if (typeof options.rulerExtremes.left !== "undefined") {
                    if (typeof data.rulerExtremes.left === "undefined") {
                        data.rulerExtremes.left = new ConstructionTool.Models.Point();
                    }
                    if (typeof options.rulerExtremes.left.x !== "undefined") {
                        data.rulerExtremes.left.x = isGraphCo === true ? options.rulerExtremes.left.x : transformModel.toGraphCo(new ConstructionTool.Models.Point(options.rulerExtremes.left.x, 0)).x;
                    }
                    if (typeof options.rulerExtremes.left.y !== "undefined") {
                        data.rulerExtremes.left.y = isGraphCo === true ? options.rulerExtremes.left.y : transformModel.toGraphCo(new ConstructionTool.Models.Point(0, options.rulerExtremes.left.y)).y;
                    }
                }
                if (typeof options.rulerExtremes.right !== "undefined") {
                    if (typeof data.rulerExtremes.right === "undefined") {
                        data.rulerExtremes.right = new ConstructionTool.Models.Point();
                    }
                    if (typeof options.rulerExtremes.right.x !== "undefined") {
                        data.rulerExtremes.right.x = isGraphCo === true ? options.rulerExtremes.right.x : transformModel.toGraphCo(new ConstructionTool.Models.Point(options.rulerExtremes.right.x, 0)).x;
                    }
                    if (typeof options.rulerExtremes.right.y !== "undefined") {
                        data.rulerExtremes.right.y = isGraphCo === true ? options.rulerExtremes.right.y : transformModel.toGraphCo(new ConstructionTool.Models.Point(0, options.rulerExtremes.right.y)).y;
                    }
                }
            }
            if (typeof options.pencilPositionerPosition !== "undefined") {
                if (typeof data.pencilPositionerPosition === "undefined") {
                    data.pencilPositionerPosition = new ConstructionTool.Models.Point();
                }
                if (typeof options.pencilPositionerPosition.x !== "undefined") {
                    data.pencilPositionerPosition.x = isGraphCo === true ? options.pencilPositionerPosition.x : transformModel.toGraphCo(new ConstructionTool.Models.Point(options.pencilPositionerPosition.x, 0)).x;
                }
                if (typeof options.pencilPositionerPosition.y !== "undefined") {
                    data.pencilPositionerPosition.y = isGraphCo === true ? options.pencilPositionerPosition.y : transformModel.toGraphCo(new ConstructionTool.Models.Point(0, options.pencilPositionerPosition.y)).y;
                }
            }
            if (typeof options.pencilTip !== "undefined") {
                if (typeof data.pencilTip === "undefined") {
                    data.pencilTip = new ConstructionTool.Models.Point();
                }
                if (typeof options.pencilTip.x !== "undefined") {
                    data.pencilTip.x = isGraphCo === true ? options.pencilTip.x : transformModel.toGraphCo(new ConstructionTool.Models.Point(options.pencilTip.x, 0)).x;
                }
                if (typeof options.pencilTip.y !== "undefined") {
                    data.pencilTip.y = isGraphCo === true ? options.pencilTip.y : transformModel.toGraphCo(new ConstructionTool.Models.Point(0, options.pencilTip.y)).y;
                }
            }
        },

        "getReferencePoint": function getReferencePoint() {
            return this.getPencilTip();
        },

        "getBoundingBox": function getBoundingBox() {
            var renderData = this.get("_renderData"),
                rulerTopLeft = this.getRulerTopLeft(),
                pencilTip = this.getPencilTip(),
                rulerProp = renderData._rulerProp,
                pencilProp = renderData._pencilProp,
                pencilPositionerProp = renderData._pencilPositionerProp,
                rulerTopRight = new ConstructionTool.Models.Point(rulerTopLeft.x + rulerProp.width, rulerTopLeft.y),
                pencilTipOffset = geomFunctions.getPointOffset(rulerTopLeft.x, rulerTopLeft.y, rulerTopRight.x, rulerTopRight.y, pencilTip.x, pencilTip.y),

                box = {};

            if (pencilTipOffset < 0) {
                box = {
                    "x": pencilTip.x - pencilPositionerProp.width / 2,
                    "y": pencilTip.y,
                    "width": rulerProp.width + Math.abs(pencilTip.x - pencilPositionerProp.width / 2 - rulerTopLeft.x),
                    "height": rulerProp.height + pencilProp.height

                };
            } else if (pencilTipOffset > 1) {
                box = {
                    "x": rulerTopLeft.x,
                    "y": rulerTopLeft.y,
                    "width": rulerProp.width + Math.abs(pencilTip.x + pencilPositionerProp.width / 2 - rulerTopRight.x),
                    "height": rulerProp.height + pencilProp.height
                };
            } else {
                box = {
                    "x": rulerTopLeft.x,
                    "y": rulerTopLeft.y,
                    "width": rulerProp.width,
                    "height": rulerProp.height + pencilProp.height
                };
            }

            return new ConstructionTool.Models.Rect(box);
        }
    });
}(window.MathUtilities));
