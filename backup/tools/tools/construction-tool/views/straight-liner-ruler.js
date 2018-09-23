(function(MathUtilities) {
    "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                       Straight Liner Ruler                      */
    /*******************************************************************/
    /**
     * A customized Backbone.View that represents StraightLinerRuler.
     * @class MathUtilities.Tools.ConstructionTool.Views.StraightLinerRuler
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Views.BaseRuler
     */
    ConstructionTool.Views.StraightLinerRuler = ConstructionTool.Views.BaseRuler.extend({
        "initModel": function initModel() {
            this.model = new ConstructionTool.Models.StraightLinerRuler();
        },

        "drawHelper": function drawHelper() {
            var model = this.model,
                path = model.get("_path"),

                renderData = model.get("_renderData"),

                rulerProp = renderData._rulerProp,
                pencilProp = renderData._pencilProp,
                isArrowVisible = renderData._isArrowVisible,
                rulerPositionProp = renderData._rulerPositionerProp,
                pencilPositionerPosition = model.getPencilPositionerPosition(),
                rotateButtonButtonProp = renderData._rotateButtonProp,

                paperScope = ConstructionTool.Views.PaperScope,

                rotateAngle = renderData.rotateAngle,
                ruler = null,
                pencilPositionButton = null,
                moveButton = null,
                rotateButton = null,
                pencil = null,
                leftArrow = null,
                rightArrow = null,
                pencilHelper = null,
                pencilImageRaster = null,
                pencilHitArea = null,
                intermediatePath = null,

                rulerTopLeft = model.getRulerTopLeft(),
                rotationRefPoint = model.getReferencePoint(),
                basePath = ConstructionTool.Models.Sketchpad.BASEPATH,

                rotateRightPadding = rotateButtonButtonProp.rightPadding,
                rotateBottomPadding = rotateButtonButtonProp.bottomPadding,
                curState = {};

            //Clear previous path
            if (path !== null) {
                path.remove();
            }
            //Draw Ruler
            ruler = new paperScope.Raster({
                "position": new ConstructionTool.Models.Point(rulerTopLeft.x + rulerProp.width / 2, rulerTopLeft.y + rulerProp.height / 2),
                "source": basePath + "../static/img/tools/common/tools/construction-tool/straight-liner.png"
            });
            ruler.name = "ruler";

            //Draw Move Button
            moveButton = new paperScope.Raster({
                "position": new ConstructionTool.Models.Point(ruler.position.x, ruler.position.y + rulerProp.height / 2 - rulerProp.bottomPadding + rulerPositionProp.height / 2 - rulerPositionProp.topPadding),
                "source": basePath + "../static/img/tools/common/tools/construction-tool/ruler-move-button.png"
            });
            moveButton.name = "ruler-move-button";

            //Draw Pencil Position button
            pencilPositionButton = new paperScope.Raster({
                "position": pencilPositionerPosition,
                "source": basePath + "../static/img/tools/common/tools/construction-tool/pencil-positioner.png"
            });
            pencilPositionButton.name = "pencil-position-button";

            //Draw Rotate Button
            rotateButton = new paperScope.Raster({
                "position": new ConstructionTool.Models.Point(ruler.position.x + rulerProp.width / 2 - rotateRightPadding, ruler.position.y - rotateBottomPadding),
                "source": basePath + "../static/img/tools/common/tools/construction-tool/rotate.png"
            });
            rotateButton.name = "rotate-button";

            //Draw Pencil
            pencilImageRaster = new paperScope.Raster({
                "position": new ConstructionTool.Models.Point(pencilPositionerPosition.x, ruler.position.y - rulerProp.height / 2 - pencilProp.height / 2),
                "source": basePath + "../static/img/tools/common/tools/construction-tool/pencil.png"
            });
            pencilImageRaster.name = "pencil";
            pencilImageRaster.data = "pencil-raster";

            pencil = new paperScope.Group([pencilImageRaster]);
            pencil.name = "pencil-holder";
            if ("ontouchstart" in window) {
                pencilHitArea = new paperScope.Path.Rectangle({
                    "fillColor": "white",
                    "name": "pencil",
                    "size": [35, 35]
                });
                pencilHitArea.fillColor.alpha = 0;
                pencilHitArea.position = pencilImageRaster.position;
                pencil.addChild(pencilHitArea);
            }

            leftArrow = new paperScope.Raster({
                "position": new ConstructionTool.Models.Point(pencilImageRaster.position.x - pencilProp.width, pencilImageRaster.position.y),
                "source": basePath + "../static/img/tools/common/tools/construction-tool/pencil-arrow.png"
            });
            leftArrow.rotate(270);
            leftArrow.name = "left-arrow";
            leftArrow.visible = isArrowVisible.left;

            rightArrow = new paperScope.Raster({
                "position": new ConstructionTool.Models.Point(pencilImageRaster.position.x + pencilProp.width, pencilImageRaster.position.y),
                "source": basePath + "../static/img/tools/common/tools/construction-tool/pencil-arrow.png"
            });
            rightArrow.rotate(90);
            rightArrow.name = "right-arrow";
            rightArrow.visible = isArrowVisible.right;

            pencilHelper = new paperScope.Group([pencilPositionButton, leftArrow, rightArrow, pencil]);
            pencilHelper.name = "pencil-helper";

            intermediatePath = new paperScope.Group([ruler, moveButton, rotateButton, pencilHelper]);
            intermediatePath.name = "straight-liner-helper";
            model.set("_path", intermediatePath);
            this._bindEvents();
            this.drawExtensionLine();
            this.updateAccBoundingBox();

            //Rotate ruler
            ruler.rotate(rotateAngle, rotationRefPoint);
            moveButton.rotate(rotateAngle, rotationRefPoint);
            leftArrow.rotate(rotateAngle, rotationRefPoint);
            rightArrow.rotate(rotateAngle, rotationRefPoint);
            pencil.rotate(rotateAngle, rotationRefPoint);
            pencilPositionButton.rotate(rotateAngle, rotationRefPoint);
            rotateButton.rotate(rotateAngle, rotationRefPoint);

            curState = model.getSyncData();
            curState.id = this.getId();
            this._saveCurrentState(curState);
        },



        "drawExtensionLine": function drawExtensionLine() {
            var path = this.model.get("_path"),
                intersection = this.lineCanvasIntersection(),
                distance1 = this.distanceBetweenLines(intersection.firstIntesectionPoint, intersection.lineCoOrdinate1),
                distance2 = this.distanceBetweenLines(intersection.firstIntesectionPoint, intersection.lineCoOrdinate2),
                path1, path2, point1, point2, point3, point4, pathGroup;

            if (path.children.extensionLine) {
                path.children.extensionLine.remove();
            }

            if (distance1 < distance2) {
                point1 = intersection.firstIntesectionPoint;
                point2 = intersection.lineCoOrdinate1;
                point3 = intersection.secondIntesectionPoint;
                point4 = intersection.lineCoOrdinate2;
            } else {
                point1 = intersection.firstIntesectionPoint;
                point2 = intersection.lineCoOrdinate2;
                point3 = intersection.secondIntesectionPoint;
                point4 = intersection.lineCoOrdinate1;
            }
            path1 = new ConstructionTool.Views.PaperScope.Path.Line({
                "from": point1,
                "to": point2,
                "dashArray": [2, 4],
                "strokeColor": "#828282"
            });
            path2 = new ConstructionTool.Views.PaperScope.Path.Line({
                "from": point3,
                "to": point4,
                "dashArray": [2, 4],
                "strokeColor": "#828282"
            });
            pathGroup = new ConstructionTool.Views.PaperScope.Group([path1, path2]);
            pathGroup.name = "extensionLine";
            path.addChild(pathGroup);
        },

        "lineCanvasIntersection": function lineCanvasIntersection() {
            var renderData = this.model.get("_renderData"),
                rularProp = renderData._rulerProp,
                rularTopLeft = this.model.getRulerTopLeft(),
                canvasSize = ConstructionTool.Views.CanvasSize,
                lineCoOrdinate1 = this.model._getRotatedPointAboutRuler(rularTopLeft),
                lineCoOrdinate2 = this.model._getRotatedPointAboutRuler(new ConstructionTool.Models.Point({
                    "x": rularTopLeft.x + rularProp.width,
                    "y": rularTopLeft.y
                })),
                firstIntesectionPoint, secondIntesectionPoint,
                intersectionPoint = this.intersectionOfLines(lineCoOrdinate1.x, lineCoOrdinate1.y, lineCoOrdinate2.x, lineCoOrdinate2.y, 0, 0, 0, canvasSize.height);

            if (intersectionPoint.length === 0) {
                firstIntesectionPoint = this.intersectionOfLines(lineCoOrdinate1.x, lineCoOrdinate1.y, lineCoOrdinate2.x, lineCoOrdinate2.y, 0, 0, canvasSize.width, 0);
                secondIntesectionPoint = this.intersectionOfLines(lineCoOrdinate1.x, lineCoOrdinate1.y, lineCoOrdinate2.x, lineCoOrdinate2.y, 0, canvasSize.height, canvasSize.width, canvasSize.height);
            } else {
                firstIntesectionPoint = intersectionPoint;
                secondIntesectionPoint = this.intersectionOfLines(lineCoOrdinate1.x, lineCoOrdinate1.y, lineCoOrdinate2.x, lineCoOrdinate2.y, canvasSize.width, 0, canvasSize.width, canvasSize.height);
            }
            return {
                "firstIntesectionPoint": firstIntesectionPoint,
                "secondIntesectionPoint": secondIntesectionPoint,
                "lineCoOrdinate1": [lineCoOrdinate1.x, lineCoOrdinate1.y],
                "lineCoOrdinate2": [lineCoOrdinate2.x, lineCoOrdinate2.y]
            };
        },

        "intersectionOfLines": function intersectionOfLines(x1, y1, x2, y2, x3, y3, x4, y4) {
            var det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4),
                px = null,
                py = null;
            if (det === 0) {
                return [];
            }

            px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / det;
            py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / det;
            return [px, py];
        },

        "distanceBetweenLines": function distanceBetweenLines(point1, point2) {
            return Math.sqrt((point2[1] - point1[1]) * (point2[1] - point1[1]) + (point2[0] - point1[0]) * (point2[0] - point1[0]));
        },

        "_applyTranslation": function _applyTranslation() {
            ConstructionTool.Views.StraightLinerRuler.__super__._applyTranslation.apply(this, arguments);
            this.drawExtensionLine();
            this.updateAccBoundingBox();
        },

        "translate": function translate() {
            ConstructionTool.Views.StraightLinerRuler.__super__.translate.apply(this, arguments);
            this.drawExtensionLine();
        },

        "_applyRotation": function _applyRotation() {
            ConstructionTool.Views.StraightLinerRuler.__super__._applyRotation.apply(this, arguments);
            this.drawExtensionLine();
            this.updateAccBoundingBox();
        },

        "rotate": function rotate() {
            ConstructionTool.Views.StraightLinerRuler.__super__.rotate.apply(this, arguments);
            var renderData = this.model.get("_renderData"),
                rulerTopLeft = this.model.getRulerTopLeft(),
                rulerProp = renderData._rulerProp,
                rotateButtonPadding = renderData._rotateButtonProp.rightPadding,
                rulerTopRight = new ConstructionTool.Models.Point(rulerTopLeft.x + rulerProp.width - rulerProp.rightPadding - rotateButtonPadding, rulerTopLeft.y);

            this.model.setRulerExtremes({
                "left": this.model._getRotatedPointAboutRuler(rulerTopLeft),
                "right": this.model._getRotatedPointAboutRuler(rulerTopRight)
            });
        },

        "_updateReferencePoint": function _updateReferencePoint() {
            var model = this.model,

                renderData = model.get("_renderData"),
                rulerTopLeft = model.getRulerTopLeft(),

                rotateAngle = renderData.rotateAngle,


                prevReferencePoint = model.getReferencePoint(),
                rulerRotatedTopLeft = model._getRotatedPointAboutRuler(rulerTopLeft, renderData.rotateAngle),


                prevPencilPositionerPosition = model.getPencilPositionerPosition(),
                prevRotatedPositionerPosition = model._getRotatedPointAboutRuler(prevPencilPositionerPosition),

                pencilTip = new ConstructionTool.Models.Point(prevPencilPositionerPosition.x, rulerTopLeft.y),
                rotatedPencilTip = model._getRotatedPointAboutRuler(pencilTip),
                newReferencePoint;


            model.setPencilTip(rotatedPencilTip);
            newReferencePoint = model.getReferencePoint();

            if (newReferencePoint.x !== prevReferencePoint.x || newReferencePoint.y !== prevReferencePoint.y) {
                model.setRulerTopLeft(model._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(rulerRotatedTopLeft.x, rulerRotatedTopLeft.y), -rotateAngle));

                model.setPencilPositionerPosition(model._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(prevRotatedPositionerPosition.x, prevRotatedPositionerPosition.y), -rotateAngle));
            }
        },

        "updateAccBoundingBox": function updateAccBoundingBox() {
            var accId = this.model.get("_renderData").accId,
                canvasAccView = ConstructionTool.Views.canvasAccView,
                accBox = this.getAccBoundingBox();

            if (typeof accId === "undefined" || accId === null) {
                return;
            }

            canvasAccView.updateAccDivProp("ruler-" + accId, accBox.ruler);
            canvasAccView.updateAccDivProp("ruler-positioner-" + accId, accBox.move);
            canvasAccView.updateAccDivProp("ruler-pencil-" + accId, accBox.pencil);
            canvasAccView.updateAccDivProp("ruler-pencil-positioner-" + accId, accBox.pencilPosition);
            canvasAccView.updateAccDivProp("ruler-rotate-" + accId, accBox.rotate);


        },

        "getAccBoundingBox": function getAccBoundingBox() {
            var model = this.model,
                renderData = model.get("_renderData"),
                rulerTopLeft = model.getRulerTopLeft(),
                pencilPositionerPosition = model.getPencilPositionerPosition(),
                rulerCenter = model.getRulerCenter(),

                rulerProp = renderData._rulerProp,
                pencilProp = renderData._pencilProp,
                positionerProp = renderData._rulerPositionerProp,
                rotateProp = renderData._rotateButtonProp,
                pencilPositionerProp = renderData._pencilPositionerProp,
                arrowProp = renderData._arrowProp,

                rotateAngle = renderData.rotateAngle,

                movePadding = {
                    "right": 4,
                    "bottom": 8,
                    "left": 1
                }, //extra transparent image

                pencilPositionerPadding = {
                    "right": 2,
                    "bottom": 2
                }, //extra transparent image

                rulerAccProp = {
                    "left": rulerTopLeft.x,
                    "top": rulerTopLeft.y,
                    "width": rulerProp.width,
                    "height": rulerProp.height + positionerProp.height - positionerProp.bottomPadding,
                    "angle": rotateAngle,
                    "center": rulerCenter
                },

                pencilAccProp = {
                    "left": pencilPositionerPosition.x - pencilProp.width - arrowProp.width / 2,
                    "top": rulerTopLeft.y - pencilProp.height,
                    "width": 2 * pencilProp.width + arrowProp.width,
                    "height": pencilProp.height,
                    "angle": rotateAngle,
                    "center": rulerCenter
                },

                moveAccProp = {
                    "left": rulerTopLeft.x + rulerProp.width / 2 - positionerProp.width / 2,
                    "top": rulerTopLeft.y + rulerProp.height,
                    "width": positionerProp.width - movePadding.right,
                    "height": positionerProp.height - movePadding.bottom,
                    "angle": rotateAngle,
                    "center": rulerCenter
                },

                rotateAccProp = {
                    "left": rulerTopLeft.x + rulerProp.width - rotateProp.width / 2 - rotateProp.rightPadding,
                    "top": rulerTopLeft.y + rulerProp.height / 2 - rotateProp.bottomPadding - rotateProp.height / 2,
                    "width": rotateProp.width,
                    "height": rotateProp.height,
                    "angle": rotateAngle,
                    "center": rulerCenter
                },

                pencilPositionerAccProp = {
                    "left": pencilPositionerPosition.x - pencilPositionerProp.width / 2,
                    "top": rulerTopLeft.y,
                    "width": pencilPositionerProp.width - pencilPositionerPadding.right,
                    "height": pencilPositionerProp.height - pencilPositionerPadding.bottom,
                    "angle": rotateAngle,
                    "center": rulerCenter
                };

            return {
                "ruler": this._getRotatedPoints(rulerAccProp),
                "move": this._getRotatedPoints(moveAccProp),
                "pencil": this._getRotatedPoints(pencilAccProp),
                "pencilPosition": this._getRotatedPoints(pencilPositionerAccProp),
                "rotate": this._getRotatedPoints(rotateAccProp)
            };
        },

        "_getRotatedPoints": function _getRotatedPoints(prop) {
            var points = [],
                padding = ConstructionTool.Models.Sketchpad.ACC_PADDING;

            points.push(this.model._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(prop.left - padding, prop.top - padding)));
            points.push(this.model._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(prop.left + prop.width + padding, prop.top - padding)));
            points.push(this.model._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(prop.left + prop.width + padding, prop.top + prop.height + padding)));
            points.push(this.model._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(prop.left - padding, prop.top + prop.height + padding)));

            prop.points = points;
            return prop;
        }

    });
}(window.MathUtilities));
