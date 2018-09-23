/*globals geomFunctions*/
(function(MathUtilities) {
    "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                       Compass Ruler                                   */
    /*******************************************************************/
    /**
     * A customized Backbone.View that represents Compass.
     * @class MathUtilities.Tools.ConstructionTool.Views.CompassRuler
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Views.BaseRuler
     */
    ConstructionTool.Views.CompassRuler = ConstructionTool.Views.BaseRuler.extend({
        "_hitPointOnLineOnArc": null,

        "_intermediatePointOnArc": null,

        "initModel": function initModel() {
            this.model = new ConstructionTool.Models.CompassRuler();
        },

        "_onMouseDown": function _onMouseDown(event) {
            ConstructionTool.Views.CompassRuler.__super__._onMouseDown.apply(this, arguments);

            this._hitPointOnLineOnArc = this._getPointOnArc(event.point);
            this._intermediatePointOnArc = this._hitPointOnLineOnArc;
        },

        "drawHelper": function drawHelper() {
            var model = this.model,
                path = model.get("_path"),
                basePath = ConstructionTool.Models.Sketchpad.BASEPATH,

                renderData = model.get("_renderData"),
                rulerProp = renderData._rulerProp,
                pencilProp = renderData._pencilProp,
                rulerResizeProp = renderData._rulerResizerProp,
                rulerPositionProp = renderData._rulerPositionerProp,
                rotateButtonProp = renderData._rotateButtonProp,
                arrowProp = renderData._arrowProp,
                pencilPointProp = renderData._pencilPoint,
                rulerCenterProp = renderData._centerProp,
                paperScope = ConstructionTool.Views.PaperScope,

                ruler = null,
                rulerResizeButton = null,
                moveButton = null,
                rotateButton = null,
                pencil = null,
                leftArrow = null,
                rightArrow = null,
                pencilHelper = null,
                intermediatePath = null,
                pencilImageRaster = null,
                pencilHitArea = null,
                rulerCenterRaster = null,

                rulerTopLeft = this.model.getRulerTopLeft(),
                //rotate padding is subtracted from tp-right of ruler so as to avoid overlapping of pencil positioner with rotate button
                rulerTopRight = new ConstructionTool.Models.Point({
                    "x": rulerTopLeft.x + rulerProp.width,
                    "y": rulerTopLeft.y
                }),
                rotationAngle = renderData.rotateAngle,
                pencilPoint;

            //Clear previous path
            if (path !== null) {
                path.remove();
            }

            //Draw Ruler
            ruler = new paperScope.Path.Rectangle({
                "point": new ConstructionTool.Models.Point(rulerTopLeft.x, rulerTopLeft.y),
                "size": [rulerProp.width, rulerProp.height],
                "fillColor": "#FFFFFF"
            });
            ruler.fillColor.alpha = 0.7;
            ruler.name = "ruler";


            //Draw Move Button
            moveButton = new paperScope.Raster({
                "position": new ConstructionTool.Models.Point(ruler.position.x - rulerPositionProp.rightPadding, ruler.position.y + rulerProp.height / 2 - rulerProp.bottomPadding + rulerPositionProp.height / 2 - rulerPositionProp.topPadding),
                "source": basePath + "../static/img/tools/common/tools/construction-tool/ruler-move-button.png"
            });
            moveButton.name = "ruler-move-button";

            //Draw ruler resize button
            rulerResizeButton = new paperScope.Raster({
                "position": new ConstructionTool.Models.Point(rulerTopLeft.x - rulerResizeProp.width / 2 - rulerResizeProp.leftPadding, rulerTopLeft.y + rulerProp.height / 2 + rulerResizeProp.topPadding),
                "source": basePath + "../static/img/tools/common/tools/construction-tool/compass-resize.png"
            });
            rulerResizeButton.name = "ruler-resize-button";

            //draw ruler center
            rulerCenterRaster = new paperScope.Raster({
                "position": new ConstructionTool.Models.Point(rulerTopRight.x + rulerCenterProp.width / 2, rulerTopLeft.y + rulerProp.height / 2),
                "source": basePath + "../static/img/tools/common/tools/construction-tool/compass-center.png"
            });
            rulerCenterRaster.name = "ruler-center";

            //Draw Rotate Button
            rotateButton = new paperScope.Raster({
                "position": new ConstructionTool.Models.Point(ruler.position.x - rulerProp.width / 2 - rotateButtonProp.rightPadding, ruler.position.y),
                "source": basePath + "../static/img/tools/common/tools/construction-tool/rotate.png"
            });
            rotateButton.name = "rotate-button";

            //Draw Pencil
            pencilImageRaster = new paperScope.Raster({
                "position": new ConstructionTool.Models.Point(ruler.position.x - rulerProp.width / 2 - pencilProp.width / 2 - pencilProp.rightPadding, ruler.position.y + pencilProp.topPadding),
                "source": basePath + "../static/img/tools/common/tools/construction-tool/pencil.png"
            });
            pencilImageRaster.name = "pencil";

            pencil = new ConstructionTool.Views.PaperScope.Group([pencilImageRaster]);
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
                "position": new ConstructionTool.Models.Point(pencilImageRaster.position.x, pencilImageRaster.position.y - pencilProp.height / 2 - arrowProp.bottomPadding),
                "source": basePath + "../static/img/tools/common/tools/construction-tool/pencil-arrow.png"
            });
            leftArrow.name = "left-arrow";

            rightArrow = new paperScope.Raster({
                "position": new ConstructionTool.Models.Point(pencilImageRaster.position.x, pencilImageRaster.position.y + pencilProp.height / 2 + arrowProp.topPadding),
                "source": basePath + "../static/img/tools/common/tools/construction-tool/pencil-arrow.png"
            });
            rightArrow.rotate(180);
            rightArrow.name = "right-arrow";

            pencilPoint = new paperScope.Path.Circle({
                "center": [pencilImageRaster.position.x + pencilPointProp.leftPadding, pencilImageRaster.position.y + pencilProp.height / 2 + pencilPointProp.topPadding],
                "radius": 2,
                "fillColor": "white"
            });
            pencilPoint.name = "pencil-point";
            pencilPoint.fillColor.alpha = 0;

            pencilHelper = new paperScope.Group([leftArrow, rightArrow, pencilPoint, pencil]);
            pencilHelper.name = "pencil-helper";

            intermediatePath = new paperScope.Group([ruler, rulerCenterRaster, moveButton, rotateButton, pencilHelper, rulerResizeButton]);
            intermediatePath.name = "compass-helper";

            model.set("_path", intermediatePath);

            this.model.setOptions({
                "rotateAngle": 0
            });
            this.rotate(rotationAngle, true);

            this._bindEvents();

            this.updatePathZIndex();

            this._drawCenterLine();
            this._drawTopBottomLine();
            this.updateAccBoundingBox();
        },

        "_onPencilMove": function _onPencilMove(event) {
            var model = this.model,
                pointOnArc = this._getPointOnArc(event.point),
                hitPoint = this._intermediatePointOnArc,
                rotationRefPoint = model.getReferencePoint(),
                rotationAngle = geomFunctions.angleBetweenPoints(hitPoint.x, hitPoint.y, rotationRefPoint.x, rotationRefPoint.y, pointOnArc.x, pointOnArc.y, true);

            this._togglePencilState = false;
            this.rotate(rotationAngle, true);

            this._curPointOnArc = pointOnArc.clone();
            this._intermediatePointOnArc = pointOnArc.clone();
        },

        "_onRulerResize": function _onRulerResize(event) {
            var model = this.model,
                curPointOnLine = this._getPointOnLine(new ConstructionTool.Models.Point(event.point.x, event.point.y)),

                path = model.get("_path"),
                rulerPath = path.children.ruler,

                renderData = model.get("_renderData"),
                rulerProp = renderData._rulerProp,
                rulerMaxWidth = rulerProp.maxWidth,
                rulerMinWidth = rulerProp.minWidth,
                rotationAngle = renderData.rotateAngle,

                resizePositionerProp = renderData._rulerResizerProp,

                rulerCurrentWidth = rulerProp.width,
                delta = {
                    "x": curPointOnLine.x - this._intermediatePointOnLine.x,
                    "y": curPointOnLine.y - this._intermediatePointOnLine.y
                },
                rulerTopLeft = model.getRulerTopLeft(),
                rulerTopLeftRotated = model._getRotatedPointAboutRuler(rulerTopLeft),

                rulerTopRight = new ConstructionTool.Models.Point(rulerTopLeft.x + rulerProp.width, rulerTopLeft.y),
                rulerTopRightRotated = model._getRotatedPointAboutRuler(rulerTopRight),


                resizeTopLeftMax = new ConstructionTool.Models.Point(rulerTopRight.x - rulerProp.maxWidth - resizePositionerProp.width, rulerTopRight.y),
                resizeTopLeftMaxRotated = model._getRotatedPointAboutRuler(resizeTopLeftMax),

                rulerNewWidth = Math.sqrt(Math.pow(rulerTopRightRotated.x - (rulerTopLeftRotated.x + delta.x), 2) + Math.pow(rulerTopRightRotated.y - (rulerTopLeftRotated.y + delta.y), 2)),
                scalingFactor = null,
                newTopLeft = null,
                curPointOffset = geomFunctions.getPointOffset(resizeTopLeftMaxRotated.x, resizeTopLeftMaxRotated.y, rulerTopRightRotated.x, rulerTopRightRotated.y, curPointOnLine.x, curPointOnLine.y);


            if (curPointOffset < 0) {
                curPointOnLine = resizeTopLeftMaxRotated.clone();
                rulerNewWidth = rulerMaxWidth;
            } else if (curPointOffset > 1) {
                curPointOnLine = rulerTopRightRotated.clone();
                rulerNewWidth = rulerMinWidth;
            }

            if (rulerNewWidth >= rulerMinWidth && rulerNewWidth <= rulerMaxWidth) {
                rulerProp.width = rulerNewWidth;

                //rotate to default
                this.rotate(-rotationAngle, true);

                scalingFactor = rulerNewWidth / rulerCurrentWidth;
                rulerPath.scale(scalingFactor, 1);
                this.rotate(rotationAngle, true);

                newTopLeft = new ConstructionTool.Models.Point(rulerTopLeft.x + (rulerCurrentWidth - rulerNewWidth), rulerTopLeft.y);
                this.model.setRulerTopLeft(new ConstructionTool.Models.Point(newTopLeft.x, newTopLeft.y));


                this._updatePathPosition();
                this._curPointOnLine = curPointOnLine.clone();
                this._intermediatePointOnLine = curPointOnLine.clone();

                this._drawCenterLine();

                this._drawTopBottomLine();
            }
        },

        "_updatePathPosition": function _updatePathPosition() {
            var model = this.model,
                renderData = model.get("_renderData"),
                rulerTopLeft = model.getRulerTopLeft(),
                rulerProp = renderData._rulerProp,
                resizePositionerProp = renderData._rulerResizerProp,
                moveButtonProp = renderData._rulerPositionerProp,
                rotateButtonProp = renderData._rotateButtonProp,
                pencilProp = renderData._pencilProp,

                path = model.get("_path"),
                rulerPath = path.children.ruler,
                rulerPositionerPath = path.children["ruler-move-button"],
                rulerResizePath = path.children["ruler-resize-button"],
                roateButtonPath = path.children["rotate-button"],
                pencilHelperPath = path.children["pencil-helper"],

                rulerWidth = rulerProp.width,
                rulerPosition = new ConstructionTool.Models.Point(rulerTopLeft.x + rulerWidth / 2, rulerTopLeft.y + rulerProp.height / 2),
                rulerRotatedPosition = null,
                moveButtonPosition = new ConstructionTool.Models.Point(rulerPosition.x - moveButtonProp.rightPadding, rulerPosition.y + rulerProp.height / 2 - rulerProp.bottomPadding + moveButtonProp.height / 2 - moveButtonProp.topPadding),
                moveButtonRotatedPosition = null,
                resizePosition = new ConstructionTool.Models.Point(rulerTopLeft.x - resizePositionerProp.width / 2 - resizePositionerProp.leftPadding, rulerPosition.y + resizePositionerProp.topPadding),
                resizeRotatedPosition = null,
                rotateButtonPosition = new ConstructionTool.Models.Point(rulerTopLeft.x - rotateButtonProp.rightPadding, rulerTopLeft.y + rulerProp.height / 2),
                rotateBtnRotatedPosition = null,
                pencilHelperPosition = new ConstructionTool.Models.Point(rulerTopLeft.x - pencilProp.rightPadding - pencilProp.width / 2, rulerTopLeft.y + rulerProp.height / 2 + pencilProp.topPadding),
                pencilHelperRotatedPosition = null;

            //change center point
            rulerRotatedPosition = model._getRotatedPointAboutRuler(rulerPosition);
            moveButtonRotatedPosition = model._getRotatedPointAboutRuler(moveButtonPosition);
            resizeRotatedPosition = model._getRotatedPointAboutRuler(resizePosition);
            rotateBtnRotatedPosition = model._getRotatedPointAboutRuler(rotateButtonPosition);
            pencilHelperRotatedPosition = model._getRotatedPointAboutRuler(pencilHelperPosition);

            rulerPath.position.x = rulerRotatedPosition.x;
            rulerPath.position.y = rulerRotatedPosition.y;

            rulerPositionerPath.position.x = moveButtonRotatedPosition.x;
            rulerPositionerPath.position.y = moveButtonRotatedPosition.y;

            rulerResizePath.position.x = resizeRotatedPosition.x;
            rulerResizePath.position.y = resizeRotatedPosition.y;

            roateButtonPath.position.x = rotateBtnRotatedPosition.x;
            roateButtonPath.position.y = rotateBtnRotatedPosition.y;

            pencilHelperPath.position.x = pencilHelperRotatedPosition.x;
            pencilHelperPath.position.y = pencilHelperRotatedPosition.y;


        },

        "_getPointOnArc": function _getPointOnArc(point) {
            var model = this.model,

                rulerCenter = model.getRulerCenter(),

                path = model.get("_path"),
                pencilPath = path.children["pencil-helper"].children["pencil-point"],
                pencilPosition = pencilPath.position,
                radius = Math.sqrt(Math.pow(rulerCenter.x - pencilPosition.x, 2) + Math.pow(rulerCenter.y - pencilPosition.y, 2)),
                seed = {
                    "a": rulerCenter.x,
                    "b": rulerCenter.y,
                    "r": radius
                },
                projectionPoint;

            projectionPoint = this._getProjectionOnArc([point.x, point.y], seed);

            return new ConstructionTool.Models.Point(projectionPoint[0], projectionPoint[1]);
        },

        /**
         * Return projection of point on arc
         * @param point {Object} point whose projection to be calculated.
         * @param seed {object} arc equation,arc center and radius values
         */
        "_getProjectionOnArc": function _getProjectionOnArc(point, seed) {
            var pt, angle;
            pt = [seed.a + seed.r, seed.b];
            angle = Math.PI * 2 - geomFunctions.angleBetweenPoints(point[0], point[1], seed.a, seed.b, pt[0], pt[1], false);
            return geomFunctions.rotatePoint(pt[0], pt[1], seed.a, seed.b, angle, false);
        },

        "_onPencilMouseDown": function onPencilMouseDown() {
            this._togglePencilState = true;
        },

        "_onPencilMouseUp": function onPencilMouseUp() {
            if (this._togglePencilState === true) {
                this._togglePencilState = false;
                var path = this.model.get("_path");
                if (path !== null) {
                    this.activatePencil(!this.model.get("_renderData").isActive);
                }
            }
        },

        "activatePencil": function activatePencil(isActive) {
            if (typeof isActive !== "boolean") {
                return;
            }

            var path = this.model.get("_path"),
                pencilHelper = path.children["pencil-helper"],
                leftArrow = pencilHelper.children["left-arrow"],
                rightArrow = pencilHelper.children["right-arrow"],
                renderData = this.model.get("_renderData"),
                rotateAngle = renderData.rotateAngle,
                pencilProp = renderData._pencilProp,
                prevState = renderData.isActive;

            this.rotate(-rotateAngle, true);
            if (isActive === true) {
                leftArrow.visible = true;
                rightArrow.visible = false;
                pencilHelper.position.y += pencilProp.topPadding;
            } else {
                leftArrow.visible = false;
                rightArrow.visible = true;
                if (prevState !== isActive) {
                    pencilHelper.position.y -= pencilProp.topPadding;
                }
            }
            this.rotate(rotateAngle, true);

            this.model.setOptions({
                "isActive": isActive
            });
        },


        "_drawCenterLine": function _drawCenterLine() {
            var model = this.model,

                renderData = model.get("_renderData"),
                pencilProp = renderData._pencilProp,
                rulerProp = renderData._rulerProp,

                rulerTopLeft = model.getRulerTopLeft(),
                rulerCenter = model.getRulerCenter(),

                pencilTip = model._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(rulerTopLeft.x - pencilProp.width / 2 - pencilProp.rightPadding, rulerTopLeft.y + rulerProp.height / 2)),

                path = model.get("_path"),
                centerLinePath = path.children["center-line"],
                newCenterLinePath = null,
                paperScope = ConstructionTool.Views.PaperScope;

            if (typeof centerLinePath !== "undefined") {
                centerLinePath.remove();
            }
            newCenterLinePath = new paperScope.Path.Line({
                "from": pencilTip,
                "to": rulerCenter,
                "dashArray": [2, 4],
                "strokeColor": "#a4a3a9",
                "name": "center-line"
            });
            path.insertChild(2, newCenterLinePath);
        },

        "_drawTopBottomLine": function _drawTopBottomLine() {
            var model = this.model,

                renderData = model.get("_renderData"),
                rulerProp = renderData._rulerProp,

                rulerTopLeft = model.getRulerTopLeft(),

                path = model.get("_path"),
                rulerTopLine = path.children["ruler-top-line"],
                rulerBottomLine = path.children["ruler-bottom-line"],
                paperScope = ConstructionTool.Views.PaperScope,
                newRulerTopLine = null,
                newRulerBottomLine = null,
                padding = 4;

            if (typeof rulerTopLine !== "undefined") {
                rulerTopLine.remove();
            }

            if (typeof rulerBottomLine !== "undefined") {
                rulerBottomLine.remove();
            }
            newRulerTopLine = new paperScope.Path.Line({
                "from": model._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(rulerTopLeft.x + padding, rulerTopLeft.y)),
                "to": model._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(rulerTopLeft.x + rulerProp.width, rulerTopLeft.y)),
                "strokeColor": "#808080",
                "strokeWidth": 1
            });
            newRulerTopLine.name = "ruler-top-line";

            newRulerBottomLine = new paperScope.Path.Line({
                "from": model._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(rulerTopLeft.x + padding, rulerTopLeft.y + rulerProp.height)),
                "to": model._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(rulerTopLeft.x + rulerProp.width, rulerTopLeft.y + rulerProp.height)),
                "strokeColor": "#808080",
                "strokeWidth": 1
            });
            newRulerBottomLine.name = "ruler-bottom-line";

            path.addChildren([newRulerTopLine, newRulerBottomLine]);
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
            canvasAccView.updateAccDivProp("ruler-resize-" + accId, accBox.resize);
            canvasAccView.updateAccDivProp("ruler-rotate-" + accId, accBox.rotate);


        },

        "getAccBoundingBox": function getAccBoundingBox() {
            var model = this.model,
                renderData = model.get("_renderData"),
                rulerTopLeft = model.getRulerTopLeft(),
                rulerCenter = model.getRulerCenter(),

                rulerProp = renderData._rulerProp,
                pencilProp = renderData._pencilProp,
                positionerProp = renderData._rulerPositionerProp,
                resizeProp = renderData._rulerResizerProp,
                rotateProp = renderData._rotateButtonProp,
                centerProp = renderData._centerProp,
                arrowProp = renderData._arrowProp,

                rotateAngle = renderData.rotateAngle,

                resizePadding = {
                    "bottom": 7,
                    "left": 11,
                    "top": 1,
                    "right": 1
                }, //extra transparent-image
                movePadding = {
                    "right": 5,
                    "bottom": 8,
                    "left": 2
                }, //extra transparent-image

                rulerAccProp = {
                    "left": rulerTopLeft.x - rotateProp.rightPadding - rotateProp.width / 2,
                    "top": rulerTopLeft.y + pencilProp.topPadding - pencilProp.height / 2,
                    "width": rulerProp.width + rotateProp.rightPadding + rotateProp.width / 2 + centerProp.width,
                    "height": rulerProp.height + positionerProp.height + pencilProp.height
                },

                pencilAccProp = {
                    "left": rulerTopLeft.x - pencilProp.rightPadding - pencilProp.width,
                    "top": rulerTopLeft.y + rulerProp.height / 2 + pencilProp.topPadding - pencilProp.height / 2 - arrowProp.height / 2 - arrowProp.topPadding,
                    "width": pencilProp.width,
                    "height": pencilProp.height + arrowProp.height + arrowProp.topPadding + arrowProp.bottomPadding
                },

                moveAccProp = {
                    "left": rulerTopLeft.x + rulerProp.width / 2 - positionerProp.width / 2 + movePadding.right,
                    "top": rulerTopLeft.y + rulerProp.height,
                    "width": positionerProp.width - movePadding.right - movePadding.left,
                    "height": positionerProp.height - movePadding.bottom,
                    "angle": rotateAngle,
                    "center": rulerCenter
                },

                rotateAccProp = {
                    "left": rulerTopLeft.x - rotateProp.width / 2 - rotateProp.rightPadding,
                    "top": rulerTopLeft.y + rulerProp.height / 2 - rotateProp.height / 2,
                    "width": rotateProp.width,
                    "height": rotateProp.height,
                    "angle": rotateAngle,
                    "center": rulerCenter
                },

                resizeAccProp = {
                    "left": rulerTopLeft.x - resizeProp.width + resizePadding.left,
                    "top": rulerTopLeft.y - resizePadding.top,
                    "width": resizeProp.width + resizeProp.leftPadding - resizePadding.right,
                    "height": resizeProp.height - resizePadding.bottom
                };

            return {
                "ruler": this._getRotatedPoints(rulerAccProp),
                "move": this._getRotatedPoints(moveAccProp),
                "pencil": this._getRotatedPoints(pencilAccProp),
                "resize": this._getRotatedPoints(resizeAccProp),
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
