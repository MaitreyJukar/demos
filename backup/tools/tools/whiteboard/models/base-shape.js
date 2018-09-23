(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                          Base Shape                             */
    /*******************************************************************/
    /**
     * A customized Backbone.View that represents Baseshape Model.
     * @class BaseShape
     * @constructor
     * @extends Backbone.Model
     */
    WhiteboardTool.Models.BaseShape = Backbone.Model.extend({
        "defaults": function() {
            return {
                /**
                 * Indicates shape properties.
                 * @attribute _data
                 * @type Object
                 */
                "_data": {},

                /**
                 * Indicates rendering properties.
                 * @attribute _renderData
                 * @type Object
                 */
                "_renderData": {
                    "dataPoints": [],
                    "backupPoints": [],
                    "backupBoundingBox": null,
                    "boundingBox": null,
                    "flipDirection": null
                },
                "fill_color_code": null,
                "stroke_color_code": null
            };
        },

        /**
         * Initializer of the BaseShape model.
         * @private
         * @method initialize
         */
        "initialize": function() {
            this.setDefaults();
        },

        /**
         * Returns data attribute of BaseShapeModel.
         * @private
         * @method getData
         * @returns {Object} Reference object of data attribute.
         */
        "getData": function() {
            return this.get("_data");
        },

        /**
         * Sets data attribute of BaseShapeModel
         * @private
         * @method setData
         */
        "setData": function(objData) {
            this.set("_data", objData);
        },

        /**
         * Returns renderData attribute of BaseShapeModel.
         * @private
         * @method getRenderData
         */
        "getRenderData": function() {
            return this.get("_renderData");
        },

        /**
         * Sets renderData attribute of BaseShapeModel.
         * @method setRenderData
         */
        "setRenderData": function(objData, isGraphCoord) {
            if (!this.get("_renderData")) {
                this.set("_renderData", {});
            }
            if (objData) {
                if (objData.boundingBox) {
                    this.setBoundingBox(objData.boundingBox, isGraphCoord);
                }

                if (objData.backupBoundingBox) {
                    this.setBackupBoundingBox(objData.backupBoundingBox, isGraphCoord);
                }

                if (objData.flipDirection) {
                    this.setFlipData(objData.flipDirection);
                }

                if (objData.dataPoints) {
                    this.setFedPoints(objData.dataPoints, isGraphCoord);
                }
            }
        },


        "setOptions": function(oDataObject, isGraphCoord) {
            if (!oDataObject) {
                return;
            }
            var curData = this.get("_data");

            if (!curData) {
                this.set("_data", {});
                curData = this.get("_data");
            }
            if (typeof oDataObject.nID !== "number") {
                curData.nID = oDataObject.nID;
            }
            if (oDataObject.imageData) {
                curData.imageData = oDataObject.imageData;
            }
            if (typeof oDataObject.nStrokeWidth !== "undefined") {
                curData.nStrokeWidth = oDataObject.nStrokeWidth;
            }
            if (typeof oDataObject.bElementLocked !== "undefined") {
                curData.bElementLocked = oDataObject.bElementLocked;
            }
            if (typeof oDataObject.nType !== "undefined") {
                curData.nType = oDataObject.nType;
            }
            if (typeof oDataObject.strFillColor !== "undefined") {
                curData.strFillColor = oDataObject.strFillColor; //it can be null
                if (curData.strFillColor !== "no-fill") {
                    this.set("fill_color_code", curData.strFillColor);
                }
            }
            if (typeof oDataObject.strStrokeColor !== "undefined") {
                curData.strStrokeColor = oDataObject.strStrokeColor;
                if (curData.strStrokeColor !== "no-stroke") {
                    this.set("stroke_color_code", curData.strStrokeColor);
                }
            }
            if (typeof oDataObject.nFillAlpha !== "undefined") {
                curData.nFillAlpha = oDataObject.nFillAlpha;
            }
            if (typeof oDataObject.bVisible !== "undefined") {
                curData.bVisible = oDataObject.bVisible;
            }
            if (typeof oDataObject.nVersion !== "undefined") {
                curData.nVersion = oDataObject.nVersion;
            }
            if (typeof oDataObject.bSelected !== "undefined") {
                curData.bSelected = oDataObject.bSelected;
            }
            if (typeof oDataObject.zIndex !== "undefined") {
                curData.zIndex = Number(oDataObject.zIndex);
            }
            if (typeof oDataObject.nSelectionStrokeColor !== "undefined") {
                curData.nSelectionStrokeColor = oDataObject.nSelectionStrokeColor;
            }
            if (typeof oDataObject.nSelectionStrokeWidth !== "undefined") {
                curData.nSelectionStrokeWidth = oDataObject.nSelectionStrokeWidth;
            }
            if (typeof oDataObject.nRotation !== "undefined") {
                curData.nRotation = oDataObject.nRotation;
            }
            if (typeof oDataObject.bAllowSelectionBound !== "undefined") {
                curData.bAllowSelectionBound = oDataObject.bAllowSelectionBound;
            }
            if (typeof oDataObject.bAllowResize !== "undefined") {
                curData.bAllowResize = oDataObject.bAllowResize;
            }
            if (typeof oDataObject.menuType !== "undefined") {
                curData.menuType = oDataObject.menuType;
            }
            if (typeof oDataObject.bAllowRotate !== "undefined") {
                curData.bAllowRotate = oDataObject.bAllowRotate;
            }
            if (typeof oDataObject.bAllowTranslate !== "undefined") {
                curData.bAllowTranslate = oDataObject.bAllowTranslate;
            }
            if (typeof oDataObject.shapeDimension !== "undefined") {
                if (typeof curData.shapeDimension === "undefined") {
                    curData.shapeDimension = {};
                }
                if (typeof oDataObject.shapeDimension.height !== "undefined") {
                    curData.shapeDimension.height = oDataObject.shapeDimension.height;
                }
                if (typeof oDataObject.shapeDimension.width !== "undefined") {
                    curData.shapeDimension.width = oDataObject.shapeDimension.width;
                }
            }
            if (typeof oDataObject.flip !== "undefined") {
                this.setFlipData(oDataObject.flip);
            }
            if (typeof oDataObject.boundingBox !== "undefined") {
                this.setBoundingBox(oDataObject.boundingBox, isGraphCoord);
            }
            if (typeof oDataObject.backupBoundingBox !== "undefined") {
                this.setBackupBoundingBox(oDataObject.backupBoundingBox, isGraphCoord);
            }
            if (typeof oDataObject._rotationRefPoint !== "undefined") {
                this.setRotationPoint(oDataObject._rotationRefPoint);
            }

            if (oDataObject.isDashed !== void 0) {
                curData.isDashed = oDataObject.isDashed;
            }

            if (oDataObject.isArrow !== void 0) {
                curData.isArrow = oDataObject.isArrow;
            }

            this.trigger("optionschange", this);
        },


        "setDefaults": function() {
            var curData = {
                    "bElementLocked": false,
                    "strFillColor": "no-fill",
                    "nFillAlpha": 1, //0 - 1
                    "bVisible": true,
                    "nVersion": 0,
                    "bSelected": false,
                    "strStrokeColor": "#424242",
                    "nStrokeWidth": 4,
                    "strSelectionStrokeColor": "#424242",
                    "nSelectionStrokeWidth": 6,

                    // Default dimensions of shape being created.
                    "shapeDimension": {
                        "width": 100,
                        "height": 100
                    },
                    // Allow resize and rotate handle
                    "bAllowResize": true,
                    "bAllowRotate": true,
                    "bAllowTranslate": true,
                    "bAllowSelectionBound": true,
                    "nRotation": 0
                },

                renderData = {
                    "dataPoints": [],
                    "equationData": null,
                    "boundingBox": new WhiteboardTool.Models.Rect(),
                    "flipDirection": new WhiteboardTool.Models.Point({
                        "x": 1,
                        "y": 1
                    })
                },
                DEFAULT_COLOR_CODE = "#424242";

            //set deafult value for stroke and fill color code
            this.set({
                "fill_color_code": DEFAULT_COLOR_CODE,
                "stroke_color_code": DEFAULT_COLOR_CODE
            });
            this.setOptions(curData);
            this.setRenderData(renderData);
        },

        "getColorData": function(curObj) {
            var data = this.get("_data");
            curObj = curObj || {};

            curObj.strStrokeColor = data.strStrokeColor;
            curObj.strSelectionStrokeColor = data.strSelectionStrokeColor;
            curObj.strFillColor = data.strFillColor;
            curObj.nFillAlpha = data.nFillAlpha;

            return curObj;
        },

        "getRotationData": function(curObj) {
            var data = this.get("_data");
            curObj = curObj || {};

            curObj.boundingBox = this.getBoundingBox().clone();
            curObj.nRotation = data.nRotation;
            curObj.backupBoundingBox = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.getBackupBoundingBox());
            curObj.rotationReferencePoint = this.getRotationReferencePoint().clone();

            return curObj;
        },

        "getStrokeData": function(curObj) {
            var data = this.get("_data");
            curObj = curObj || {};

            curObj.nStrokeWidth = data.nStrokeWidth;
            curObj.nSelectionStrokeWidth = data.nSelectionStrokeWidth;

            return curObj;
        },

        "getCloneData": function() {
            var data = this.get("_data"),
                renderData = this.get("_renderData"),
                tmpRenderData = MathUtilities.Components.Utils.Models.Utils.getCloneOf(renderData),
                tmpData = MathUtilities.Components.Utils.Models.Utils.getCloneOf(data);

            return {
                "renderData": tmpRenderData,
                "shapeData": tmpData
            };

        },

        "parseData": function(objData, isGraphCoord) {
            if (objData.shapeData) {
                this.setOptions(objData.shapeData, isGraphCoord);
            }

            if (objData.renderData) {
                this.setRenderData(objData.renderData, isGraphCoord);
            }
        },

        "getSyncData": function() {
            var shapeData = this.get("_data"),
                renderData = this.get("_renderData"),
                data = null;

            shapeData.rotationReferencePoint = this.getRotationReferencePoint();
            data = {
                "shapeData": shapeData,
                "renderData": renderData
            };
            return data;
        },

        "_feedPoint": function(curPoint, index) {
            if (!curPoint.clone) {
                curPoint = new WhiteboardTool.Models.Point(curPoint);
            }

            var data = this.get("_renderData");

            if (typeof index !== "undefined") {
                data.dataPoints[index] = WhiteboardTool.Models.Transform.toGraphCo(curPoint);
            } else {
                data.dataPoints.push(WhiteboardTool.Models.Transform.toGraphCo(curPoint));
            }
        },

        "_clearFedPoints": function() {
            var renderData = this.get("_renderData");
            if (renderData.dataPoints) {
                renderData.dataPoints.length = 0;
            }
        },

        /**
         * Returns true if number passed as argument is a negative number
         * @method isNegative
         * @param {Number} number
         * @private
         * @return {Boolean}
         */
        "isNegative": function(number) {
            return number < 0 ? true : false;
        },

        "takeBackupPoints": function() {
            var arrPoints = this.getFedPoints(),
                clonePoints = [],
                renderData,
                iLooper;
            for (iLooper = 0; iLooper < arrPoints.length; iLooper++) {
                clonePoints.push(arrPoints[iLooper].clone());
            }

            renderData = this.get("_renderData");
            renderData.backupPoints = clonePoints;
        },

        "getBackupPoints": function() {
            return this.getRenderData().backupPoints;
        },

        "setBackupBoundingBox": function(boundingbox, isGraphCoord) {
            if (!boundingbox) {
                return;
            }

            var renderData = this.getRenderData(),
                gridSize = {};

            if (!renderData.backupBoundingBox) {
                renderData.backupBoundingBox = new WhiteboardTool.Models.Rect();
            }
            if (typeof boundingbox.x !== "undefined") {
                renderData.backupBoundingBox.x = isGraphCoord === true ? boundingbox.x : WhiteboardTool.Models.Transform.toGraphCo({
                    "x": boundingbox.x,
                    "y": 0
                }).x;
            }
            if (typeof boundingbox.y !== "undefined") {
                renderData.backupBoundingBox.y = isGraphCoord === true ? boundingbox.y : WhiteboardTool.Models.Transform.toGraphCo({
                    "x": 0,
                    "y": boundingbox.y
                }).y;
            }

            if (boundingbox.width !== void 0 && boundingbox.height !== void 0) {
                gridSize = WhiteboardTool.Models.Transform.toGraphSize({
                    "x": boundingbox.width,
                    "y": boundingbox.height
                });
                if (this.isScalable()) {
                    renderData.backupGridSize = {
                        "width": gridSize.x,
                        "height": gridSize.y
                    };
                }
            }

            if (typeof boundingbox.width !== "undefined") {
                renderData.backupBoundingBox.width = boundingbox.width;
            }
            if (typeof boundingbox.height !== "undefined") {
                renderData.backupBoundingBox.height = boundingbox.height;
            }
        },

        "getBackupBoundingBox": function() {
            var transformModel = WhiteboardTool.Models.Transform,
                backupBoundingBox = this.get("_renderData").backupBoundingBox,
                box = new WhiteboardTool.Models.Rect();

            if (backupBoundingBox) {
                box.x = transformModel.toCanvasCo(new WhiteboardTool.Models.Point(backupBoundingBox.x, 0)).x;
                box.y = transformModel.toCanvasCo(new WhiteboardTool.Models.Point(0, backupBoundingBox.y)).y;
                box.width = backupBoundingBox.width;
                box.height = backupBoundingBox.height;
            }

            return box;
        },

        /**
         * Sets datapoints of a shape.
         * @private
         * @method setFedPoints
         * @param {Object} points. Array of points
         */
        "setFedPoints": function(arrPoints, isGraphCoord) {
            var renderData = this.get("_renderData"),
                graphPoints = [],
                point,
                transformModel = WhiteboardTool.Models.Transform;

            for (point in arrPoints) {
                graphPoints.push(isGraphCoord === true ? arrPoints[point] : transformModel.toGraphCo(arrPoints[point]));
            }
            renderData.dataPoints = graphPoints;
        },

        "getFlipData": function() {
            return this.getRenderData().flipDirection;
        },

        "setFlipData": function(flipData) {
            var renderData = this.get("_renderData");
            renderData.flipDirection = {};

            if (typeof flipData !== "undefined" && flipData !== null) {
                if (typeof flipData.x !== "undefined" && flipData.x !== null) {
                    renderData.flipDirection.x = flipData.x;
                }
                if (typeof flipData.y !== "undefined" && flipData.y !== null) {
                    renderData.flipDirection.y = flipData.y;
                }
            }
        },


        /**
         * Returns bounding box of a shape.
         * @private
         * @method getBoundingBox
         * @returns {Object} An Object literal containing x, y, width and height of a shape.
         */
        "getBoundingBox": function() {
            var transformModel = WhiteboardTool.Models.Transform,
                boundingBox = this.get("_renderData").boundingBox,
                box = new WhiteboardTool.Models.Rect();

            box.x = transformModel.toCanvasCo(new WhiteboardTool.Models.Point(boundingBox.x, 0)).x;
            box.y = transformModel.toCanvasCo(new WhiteboardTool.Models.Point(0, boundingBox.y)).y;
            box.width = boundingBox.width;
            box.height = boundingBox.height;

            return box;
        },

        "isScalable": function() {
            var nType = this.getData().nType,
                ShapeType = WhiteboardTool.Views.ShapeType;

            switch (nType) {
                case ShapeType.Image:
                case ShapeType.BackgroundImage:
                case ShapeType.Text:
                    return false;

                default:
                    return true;
            }
        },

        "setBoundingBox": function(boundingbox, isGraphCoord) {
            var renderData = this.getRenderData(),
                gridSize = {};

            if (!boundingbox) {
                return;
            }

            if (!renderData.boundingBox) {
                renderData.boundingBox = new WhiteboardTool.Models.Rect();
            }
            if (typeof boundingbox.x !== "undefined") {
                renderData.boundingBox.x = isGraphCoord === true ? boundingbox.x : WhiteboardTool.Models.Transform.toGraphCo({
                    "x": boundingbox.x,
                    "y": 0
                }).x;
            }
            if (typeof boundingbox.y !== "undefined") {
                renderData.boundingBox.y = isGraphCoord === true ? boundingbox.y : WhiteboardTool.Models.Transform.toGraphCo({
                    "x": 0,
                    "y": boundingbox.y
                }).y;
            }

            if (boundingbox.width !== void 0 && boundingbox.height !== void 0) {
                gridSize = WhiteboardTool.Models.Transform.toGraphSize({
                    "x": boundingbox.width,
                    "y": boundingbox.height
                });
                if (this.isScalable()) {
                    renderData.gridSize = {
                        "width": gridSize.x,
                        "height": gridSize.y
                    };
                }
            }
            if (typeof boundingbox.width !== "undefined") {
                renderData.boundingBox.width = boundingbox.width;
            }
            if (typeof boundingbox.height !== "undefined") {
                renderData.boundingBox.height = boundingbox.height;
            }
        },



        "getRotationReferencePoint": function() {
            var boundingBox = this.getBoundingBox().clone(),
                point = new WhiteboardTool.Models.Point({
                    "x": boundingBox.x + boundingBox.width / 2,
                    "y": boundingBox.y + boundingBox.height / 2
                });

            return point;
        },

        /**
         * return datapoints of a shape.
         * @private
         * @method getFedPoints
         * @return {Object} points. Array of points
         */
        "getFedPoints": function() {
            var renderData = this.get("_renderData"),
                canvasPoints = [],
                point,
                points = renderData.dataPoints,
                transformModel = WhiteboardTool.Models.Transform;

            for (point in points) {
                canvasPoints.push(transformModel.toCanvasCo(points[point]));
            }
            return canvasPoints;
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
            return new WhiteboardTool.Models.Point({
                "x": Math.cos(rotateAngle) * (objPoint.x - objOrigin.x) - Math.sin(rotateAngle) * (objPoint.y - objOrigin.y) + objOrigin.x,
                "y": Math.sin(rotateAngle) * (objPoint.x - objOrigin.x) + Math.cos(rotateAngle) * (objPoint.y - objOrigin.y) + objOrigin.y
            });
        },

        "setRotationPoint": function(refPoint) {
            var data = this.get("_data");
            if (typeof refPoint !== "undefined" || refPoint !== null) {
                if (!data._rotationRefPoint) {
                    data._rotationRefPoint = new WhiteboardTool.Models.Point();
                }
                if (typeof refPoint.x !== "undefined" || refPoint.x !== null) {
                    data._rotationRefPoint.x = refPoint.x;
                }
                if (typeof refPoint.y !== "undefined" || refPoint.y !== null) {
                    data._rotationRefPoint.y = refPoint.y;
                }
            }
        },

        "getRotationPoint": function() {
            var data = this.get("_data"),
                rotationPt = data._rotationRefPoint || this.getRotationReferencePoint();
            return rotationPt;
        },

        "getFlipDirection": function(boundingBox) {
            var flip = {
                "x": 1,
                "y": 1
            };

            if (boundingBox.width < 0) {
                flip.x = -1;
            }
            if (boundingBox.height < 0) {
                flip.y = -1;
            }

            return flip;
        },


        /**
         * Returns maximum value among width or height
         * @method getMaxFactor
         * @param {Object} boundingRect Bounding rectangle.
         * @private
         * @return {Number}
         */
        "getMaxFactor": function(boundingRect) {
            var width, height,
                maxFactor = null;

            width = Math.abs(boundingRect.width);
            height = Math.abs(boundingRect.height);
            maxFactor = width > height ? width : height;

            return maxFactor;
        }
    });
})(window.MathUtilities);
