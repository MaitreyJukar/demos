(function(MathUtilities) {
     "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                           Base-ruler                            */
    /*******************************************************************/
    /**
     * A customized Backbone.Model that represents base shape.
     * @class MathUtilities.Tools.ConstructionTool.Models.BaseRuler
     * @constructor
     * @extends Backbone.Model
     */
    ConstructionTool.Models.BaseRuler = Backbone.Model.extend({
        "defaults": function() {
            return {
                "_path": null,
                "_renderData": {}
            };
        },

        "initialize": function() {
            this.setDefaults();
        },

        "setDefaults": function() {
            var renderData = {},
                canvasCenter = ConstructionTool.Views.PaperScope.view.center,
                rulerTopLeft = new ConstructionTool.Models.Point({
                    "x": canvasCenter.x,
                    "y": canvasCenter.y
                });


            renderData.rotateAngle = 0;
            renderData.rulerTopLeft = rulerTopLeft;
            renderData.rulerCenter = rulerTopLeft.clone();
            this.setOptions(renderData);
        },

        "setOptions": function setOptions(options, isGraphCo) {
            if (typeof options === "undefined" || options === null) {
                return;
            }

            var data = this.get("_renderData"),
                transformModel = ConstructionTool.Models.Transform;
            if (typeof options.id !== "undefined") {
                data.id = options.id;
            }
            if (typeof options._rulerType !== "undefined") {
                data._rulerType = options._rulerType;
            }
            if (typeof options.rulerTopLeft !== "undefined") {
                if (typeof data.rulerTopLeft === "undefined") {
                    data.rulerTopLeft = new ConstructionTool.Models.Point();
                }
                if (typeof options.rulerTopLeft.x !== "undefined") {
                    data.rulerTopLeft.x = isGraphCo === true ? options.rulerTopLeft.x : transformModel.toGraphCo(new ConstructionTool.Models.Point(options.rulerTopLeft.x, 0)).x;
                }
                if (typeof options.rulerTopLeft.y !== "undefined") {
                    data.rulerTopLeft.y = isGraphCo === true ? options.rulerTopLeft.y : transformModel.toGraphCo(new ConstructionTool.Models.Point(0, options.rulerTopLeft.y)).y;
                }
            }
            if (typeof options.rotateAngle !== "undefined") {
                data.rotateAngle = options.rotateAngle;
            }
            if (typeof options.zIndex !== "undefined") {
                data.zIndex = options.zIndex;
            }
            if (typeof options.rulerCenter !== "undefined") {
                if (typeof data.rulerCenter === "undefined") {
                    data.rulerCenter = new ConstructionTool.Models.Point();
                }
                if (typeof options.rulerCenter.x !== "undefined") {
                    data.rulerCenter.x = isGraphCo === true ? options.rulerCenter.x : transformModel.toGraphCo(new ConstructionTool.Models.Point(options.rulerCenter.x, 0)).x;
                }
                if (typeof options.rulerCenter.y !== "undefined") {
                    data.rulerCenter.y = isGraphCo === true ? options.rulerCenter.y : transformModel.toGraphCo(new ConstructionTool.Models.Point(0, options.rulerCenter.y)).y;
                }
            }
            if (typeof options._rulerProp !== "undefined") {
                if (typeof data._rulerProp === "undefined") {
                    data._rulerProp = {};
                }
                if (typeof options._rulerProp.width !== "undefined") {
                    data._rulerProp.width = options._rulerProp.width;
                }
                if (typeof options._rulerProp.height !== "undefined") {
                    data._rulerProp.height = options._rulerProp.height;
                }
                if (typeof options._rulerProp.leftPadding !== "undefined") {
                    data._rulerProp.leftPadding = options._rulerProp.leftPadding;
                }
                if (typeof options._rulerProp.rightPadding !== "undefined") {
                    data._rulerProp.rightPadding = options._rulerProp.rightPadding;
                }
                if (typeof options._rulerProp.topPadding !== "undefined") {
                    data._rulerProp.topPadding = options._rulerProp.topPadding;
                }
                if (typeof options._rulerProp.bottomPadding !== "undefined") {
                    data._rulerProp.bottomPadding = options._rulerProp.bottomPadding;
                }
                if (typeof options._rulerProp.minWidth !== "undefined") {
                    data._rulerProp.minWidth = options._rulerProp.minWidth;
                }
                if (typeof options._rulerProp.maxWidth !== "undefined") {
                    data._rulerProp.maxWidth = options._rulerProp.maxWidth;
                }
            }
            if (typeof options._pencilProp !== "undefined") {
                if (typeof data._pencilProp === "undefined") {
                    data._pencilProp = {};
                }
                if (typeof options._pencilProp.width !== "undefined") {
                    data._pencilProp.width = options._pencilProp.width;
                }
                if (typeof options._pencilProp.height !== "undefined") {
                    data._pencilProp.height = options._pencilProp.height;
                }
                if (typeof options._pencilProp.leftPadding !== "undefined") {
                    data._pencilProp.leftPadding = options._pencilProp.leftPadding;
                }
                if (typeof options._pencilProp.rightPadding !== "undefined") {
                    data._pencilProp.rightPadding = options._pencilProp.rightPadding;
                }
                if (typeof options._pencilProp.topPadding !== "undefined") {
                    data._pencilProp.topPadding = options._pencilProp.topPadding;
                }
                if (typeof options._pencilProp.bottomPadding !== "undefined") {
                    data._pencilProp.bottomPadding = options._pencilProp.bottomPadding;
                }
            }
            if (typeof options._rotateButtonProp !== "undefined") {
                if (typeof data._rotateButtonProp === "undefined") {
                    data._rotateButtonProp = {};
                }
                if (typeof options._rotateButtonProp.width !== "undefined") {
                    data._rotateButtonProp.width = options._rotateButtonProp.width;
                }
                if (typeof options._rotateButtonProp.height !== "undefined") {
                    data._rotateButtonProp.height = options._rotateButtonProp.height;
                }
                if (typeof options._rotateButtonProp.leftPadding !== "undefined") {
                    data._rotateButtonProp.leftPadding = options._rotateButtonProp.leftPadding;
                }
                if (typeof options._rotateButtonProp.rightPadding !== "undefined") {
                    data._rotateButtonProp.rightPadding = options._rotateButtonProp.rightPadding;
                }
                if (typeof options._rotateButtonProp.topPadding !== "undefined") {
                    data._rotateButtonProp.topPadding = options._rotateButtonProp.topPadding;
                }
                if (typeof options._rotateButtonProp.bottomPadding !== "undefined") {
                    data._rotateButtonProp.bottomPadding = options._rotateButtonProp.bottomPadding;
                }
                if (typeof options._rotateButtonProp.padding !== "undefined") {
                    data._rotateButtonProp.padding = options._rotateButtonProp.padding;
                }
            }
            if (typeof options._rulerPositionerProp !== "undefined") {
                if (typeof data._rulerPositionerProp === "undefined") {
                    data._rulerPositionerProp = {};
                }
                if (typeof options._rulerPositionerProp.width !== "undefined") {
                    data._rulerPositionerProp.width = options._rulerPositionerProp.width;
                }
                if (typeof options._rulerPositionerProp.height !== "undefined") {
                    data._rulerPositionerProp.height = options._rulerPositionerProp.height;
                }
                if (typeof options._rulerPositionerProp.leftPadding !== "undefined") {
                    data._rulerPositionerProp.leftPadding = options._rulerPositionerProp.leftPadding;
                }
                if (typeof options._rulerPositionerProp.rightPadding !== "undefined") {
                    data._rulerPositionerProp.rightPadding = options._rulerPositionerProp.rightPadding;
                }
                if (typeof options._rulerPositionerProp.topPadding !== "undefined") {
                    data._rulerPositionerProp.topPadding = options._rulerPositionerProp.topPadding;
                }
                if (typeof options._rulerPositionerProp.bottomPadding !== "undefined") {
                    data._rulerPositionerProp.bottomPadding = options._rulerPositionerProp.bottomPadding;
                }
            }
            if (typeof options._isArrowVisible !== "undefined") {
                if (typeof data._isArrowVisible === "undefined") {
                    data._isArrowVisible = {};
                }
                if (typeof options._isArrowVisible.left !== "undefined") {
                    data._isArrowVisible.left = options._isArrowVisible.left;
                }
                if (typeof options._isArrowVisible.right !== "undefined") {
                    data._isArrowVisible.right = options._isArrowVisible.right;
                }
            }
            if (typeof options.accId !== "undefined") {
                data.accId = options.accId;
            }

            if (typeof options._arrowProp !== "undefined") {
                if (typeof data._arrowProp === "undefined") {
                    data._arrowProp = {};
                }
                if (typeof options._arrowProp.topPadding !== "undefined") {
                    data._arrowProp.topPadding = options._arrowProp.topPadding;
                }
                if (typeof options._arrowProp.bottomPadding !== "undefined") {
                    data._arrowProp.bottomPadding = options._arrowProp.bottomPadding;
                }
                if (typeof options._arrowProp.width !== "undefined") {
                    data._arrowProp.width = options._arrowProp.width;
                }
                if (typeof options._arrowProp.height !== "undefined") {
                    data._arrowProp.height = options._arrowProp.height;
                }
            }
        },

        "getRenderData": function getRenderData() {
            return MathUtilities.Components.Utils.Models.Utils.convertToSerializable(this.get("_renderData"));
        },

        "parseData": function(objData) {
            if (typeof objData.renderData !== "undefined") {
                this.setOptions(objData.renderData, true);
            }
        },

        "getSyncData": function getSyncData() {
            var renderData = this.getRenderData(),
                syncData = null;

            syncData = {
                "renderData": renderData
            };
            return syncData;
        },

        /**
         * Return ruler top-left point in canvas co-ordinate.
         * @method getRulerTopLeft
         * @return point {object} Canvas co-ordinate
         */
        "getRulerTopLeft": function getRulerTopLeft() {
            var rulerTopLeft = this.get("_renderData").rulerTopLeft;
            return ConstructionTool.Models.Transform.toCanvasCo(rulerTopLeft);
        },

        /**
         * Set ruler top-left point in graph co-ordinate.
         * @method setRulerTopLeft
         * @param point {object} canvas co-ordinate
         */
        "setRulerTopLeft": function setRulerTopLeft(point) {
            if (typeof point === "undefined" || point === null) {
                return;
            }
            this.setOptions({
                "rulerTopLeft": point
            });
        },


        /**
         * Return ruler top-left point in canvas co-ordinate.
         * @method getPencilPositionerPosition
         * @return point {object} Canvas co-ordinate
         */
        "getPencilPositionerPosition": function getPencilPositionerPosition() {
            var pencilPositionerPosition = this.get("_renderData").pencilPositionerPosition;
            return ConstructionTool.Models.Transform.toCanvasCo(pencilPositionerPosition);
        },

        /**
         * Set ruler top-left point in graph co-ordinate.
         * @method setPencilPositionerPosition
         * @param point {object} canvas co-ordinate
         */
        "setPencilPositionerPosition": function setPencilPositionerPosition(point) {
            if (typeof point === "undefined" || point === null) {
                return;
            }
            this.setOptions({
                "pencilPositionerPosition": point
            });
        },

        /**
         * Return ruler extremes point in canvas co-ordinate.
         * @method getRulerExtremes
         * @return point {object} Canvas co-ordinate
         */
        "getRulerExtremes": function getRulerExtremes() {
            var rulerExtremes = this.get("_renderData").rulerExtremes;
            return {
                "left": ConstructionTool.Models.Transform.toCanvasCo(rulerExtremes.left),
                "right": ConstructionTool.Models.Transform.toCanvasCo(rulerExtremes.right)
            };
        },

        /**
         * Set ruler extremes point in graph co-ordinate.
         * @method setRulerExtremes
         * @param {object} canvas co-ordinate
         */
        "setRulerExtremes": function setRulerExtremes(limits) {
            if (typeof limits === "undefined" || limits === null) {
                return;
            }
            this.setOptions({
                "rulerExtremes": limits
            });
        },

        /**
         * Return ruler Center point in canvas co-ordinate.
         * @method getRulerCenter
         * @return point {object} Canvas co-ordinate
         */
        "getRulerCenter": function getRulerCenter() {
            var rulerCenter = this.get("_renderData").rulerCenter;
            return ConstructionTool.Models.Transform.toCanvasCo(rulerCenter);
        },

        /**
         * Set ruler Center point in graph co-ordinate.
         * @method setRulerCenter
         * @param point {object} canvas co-ordinate
         */
        "setRulerCenter": function setRulerCenter(point) {
            if (typeof point === "undefined" || point === null) {
                return;
            }
            this.setOptions({
                "rulerCenter": point
            });
        },

        /**
         * Return pencil tip point in canvas co-ordinate.
         * @method getPencilTip
         * @return point {object} Canvas co-ordinate
         */
        "getPencilTip": function getPencilTip() {
            var pencilTip = this.get("_renderData").pencilTip;
            return ConstructionTool.Models.Transform.toCanvasCo(pencilTip);
        },

        /**
         * Set pencil tip point in graph co-ordinate.
         * @method setPencilTip
         * @param point {object} canvas co-ordinate
         */
        "setPencilTip": function setPencilTip(point) {
            if (typeof point === "undefined" || point === null) {
                return;
            }
            this.setOptions({
                "pencilTip": point
            });
        },

        /**
         * Returns true if pencil is hit.
         * @method isPencilHit
         * @params {Object} Point point on canvas.
         * @returns {Boolean} True if hit is on pencil, else false.
         */
        "isPencilHit": function isPencilHit(point) {
            var pencilPath = null,
                hitResult = null;
            if ("ontouchstart" in window) {
                pencilPath = this.get("_path")._children["pencil-helper"].children["pencil-holder"];
            } else {
                pencilPath = this.get("_path")._children["pencil-helper"].children["pencil-holder"].children.pencil;
            }
            hitResult = pencilPath.hitTest(point);
            if (typeof hitResult !== "undefined" && hitResult !== null) {
                return true;
            }
            return false;
        },

        /**
         * Returns true if ruler is hit.
         * @method isPencilHit
         * @params {Object} Point point on canvas.
         * @returns {Boolean} True if hit is on pencil, else false.
         */
        "isRulerHit": function isRulerHit(point) {
            var self = this,
                hitResult = self.get("_path").hitTest(point);

            if (typeof hitResult !== "undefined" && hitResult !== null) {
                return true;
            }
            return false;
        },

        /**
         * Returns the angle between the points passed as arguments.
         * @method getAngle
         * @params {Object} PointA the first point.
         * @params {Object} PointB the second point.
         * @params {Object} refPointB the reference point at which angle is formed.
         * @returns {Number} The angle
         */
        "getAngle": function(pointA, pointB, refPoint) {
            var dx1 = null,
                dx2 = null,
                dy1 = null,
                dy2 = null,
                angle = null;

            pointA = new ConstructionTool.Models.Point(pointA);
            pointB = new ConstructionTool.Models.Point(pointB);

            dx1 = pointA.x - refPoint.x;
            dx2 = pointB.x - refPoint.x;

            dy1 = pointA.y - refPoint.y;
            dy2 = pointB.y - refPoint.y;

            angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
            angle = angle * 180 / Math.PI;

            return angle;
        },

        /**
         * Given the arrPoints, context point and the angle to rotate. It returns the rotate points relating to that context.
         * @method getRotatedPoints
         * @params {Object} arrPoints the points needed to be rotated
         * @params {Object} contextPoint point that is taken care as main context
         * @params {Number} rotateAngle angle to rotate the points
         */
        "getRotatedPoints": function(arrPoints, contextPoint, rotateAngle) {
            var modifiedPoints = [],
                iLooper = 0,
                arrLen = arrPoints.length;

            for (; iLooper < arrLen; iLooper++) {
                modifiedPoints.push(this.getRotatedPoint(arrPoints[iLooper], contextPoint, rotateAngle));
            }
            return modifiedPoints;
        },

        "getRotatedPoint": function(objPoint, objOrigin, rotateAngle) {
            rotateAngle = rotateAngle * (Math.PI / 180.0);
            return new ConstructionTool.Models.Point({
                "x": Math.cos(rotateAngle) * (objPoint.x - objOrigin.x) - Math.sin(rotateAngle) * (objPoint.y - objOrigin.y) + objOrigin.x,
                "y": Math.sin(rotateAngle) * (objPoint.x - objOrigin.x) + Math.cos(rotateAngle) * (objPoint.y - objOrigin.y) + objOrigin.y
            });
        },

        "_getRotatedPointAboutRuler": function _getRotatedPointAboutRuler(point, angle) {
            var self = this,
                renderData = self.get("_renderData"),
                referencePoint = this.getReferencePoint();

            if (typeof angle === "undefined" || angle === null) {
                angle = renderData.rotateAngle;
            }
            return self.getRotatedPoint(point, referencePoint, angle).clone();
        },

        "getBoundingBox": function getBoundingBox() {
            var renderData = this.get("_renderData"),
                rulerTopLeft = this.getRulerTopLeft(),
                rulerProp = renderData._rulerProp,
                box = new ConstructionTool.Models.Rect({
                    "x": rulerTopLeft.x,
                    "y": rulerTopLeft.y,
                    "width": rulerProp.width,
                    "height": rulerProp.height
                });
            return box;
        },

        //this function return ruler bounds without considering extension lines
        "getEndPoints": function getEndPoints() {
            var boundingBox = this.getBoundingBox(),
                endPoints = [],
                transformModel = ConstructionTool.Models.Transform;

            endPoints.push(transformModel.toGraphCo(this._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(boundingBox.x, boundingBox.y))));
            endPoints.push(transformModel.toGraphCo(this._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(boundingBox.x, boundingBox.y + boundingBox.height))));
            endPoints.push(transformModel.toGraphCo(this._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(boundingBox.x + boundingBox.width, boundingBox.y))));
            endPoints.push(transformModel.toGraphCo(this._getRotatedPointAboutRuler(new ConstructionTool.Models.Point(boundingBox.x + boundingBox.width, boundingBox.y + boundingBox.height))));

            return endPoints;
        }
    });
}(window.MathUtilities));
