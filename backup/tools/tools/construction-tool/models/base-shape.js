(function(MathUtilities) {
    "use strict";
    var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                          Base Shape                             */
    /*******************************************************************/
    /**
     * A customized Backbone.Model that represents base shape.
     * @class MathUtilities.Tools.ConstructionTool.Models.BaseShape
     * @constructor
     * @extends Backbone.Model
     */
    ConstructionTool.Models.BaseShape = Backbone.Model.extend({
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
                    "boundingBox": null,
                    "flipDirection": null
                },

                /**
                 * Indicates undoRedo state
                 * @attribute
                 */
                "_undoRedoState": {
                    "previousState": null,
                    "newState": null
                }
            };
        },

        /**
         * Initializer of Baseshape model.
         * @private
         * @method initialize
         */
        "initialize": function initialize() {
            this.setDefaults();
        },

        "setRenderData": function(objData, isGraphCo) {
            // We need to save the Rect and Point object, so that we get clone function when needed.
            var renderData = this.get("_renderData");

            if (typeof objData !== "undefined" && objData !== null) {
                if (typeof objData.boundingBox !== "undefined" && objData.boundingbox !== null) {
                    renderData.boundingBox = new ConstructionTool.Models.Rect();
                    this.setBoundingBox(objData.boundingBox, isGraphCo);
                }

                if (typeof objData.flipDirection !== "undefined" && objData.flipDirection !== null) {
                    this.setFlipData(objData.flipDirection);
                }

                if (typeof objData.dataPoints !== "undefined" && objData.dataPoints !== null) {
                    this.setFedPoints(objData.dataPoints, isGraphCo);
                }
            }
        },

        /**
         * Sets multiple shape properties.
         * @private
         * @method setOptions
         * @param {Object} oDataObject An object with attributes name/value pairs.
         */
        "setOptions": function setOptions(oDataObject) {
            if (typeof oDataObject === "undefined" || oDataObject === null) {
                return;
            }

            var curData = this.get("_data");

            if (typeof oDataObject.imageData !== "undefined" && oDataObject.imageData !== null) {
                curData.imageData = oDataObject.imageData;
            }
            if (typeof oDataObject.backgroundData !== "undefined" && oDataObject.backgroundData !== null) {
                curData.backgroundData = oDataObject.backgroundData;
            }
            if (typeof oDataObject.strokeWidth !== "undefined" && oDataObject.strokeWidth !== null) {
                curData.strokeWidth = oDataObject.strokeWidth;
            }
            if (typeof oDataObject.radius !== "undefined" && oDataObject.radius !== null) {
                curData.radius = oDataObject.radius;
            }
            if (typeof oDataObject.isElementLocked !== "undefined" && oDataObject.isElementLocked !== null) {
                curData.isElementLocked = oDataObject.isElementLocked;
            }
            if (typeof oDataObject.shapeType !== "undefined" && oDataObject.shapeType !== null) {
                curData.shapeType = oDataObject.shapeType;
            }
            if (typeof oDataObject.fillColor !== "undefined" && oDataObject.fillColor !== null) {
                curData.fillColor = oDataObject.fillColor;
            }
            if (typeof oDataObject.strokeColor !== "undefined" && oDataObject.strokeColor !== null) {
                curData.strokeColor = oDataObject.strokeColor;
            }
            if (typeof oDataObject.fillAlpha !== "undefined" && oDataObject.fillAlpha !== null) {
                curData.fillAlpha = oDataObject.fillAlpha;
            }
            if (typeof oDataObject.isVisible !== "undefined" && oDataObject.isVisible !== null) {
                curData.isVisible = oDataObject.isVisible;
            }
            if (typeof oDataObject.isSelected !== "undefined" && oDataObject.isSelected !== null) {
                curData.isSelected = oDataObject.isSelected;
            }
            if (typeof oDataObject.zIndex !== "undefined" && oDataObject.zIndex !== null) {
                curData.zIndex = oDataObject.zIndex;
            }
            if (typeof oDataObject.rotationAngle !== "undefined" && oDataObject.rotationAngle !== null) {
                curData.rotationAngle = oDataObject.rotationAngle;
            }
            if (typeof oDataObject.allowSelectionBound !== "undefined" && oDataObject.allowSelectionBound !== null) {
                curData.allowSelectionBound = oDataObject.allowSelectionBound;
            }
            if (typeof oDataObject.allowSelection !== "undefined" && oDataObject.allowSelection !== null) {
                curData.allowSelection = oDataObject.allowSelection;
            }
            if (typeof oDataObject.allowResize !== "undefined" && oDataObject.allowResize !== null) {
                curData.allowResize = oDataObject.allowResize;
            }
            if (typeof oDataObject.allowRotate !== "undefined" && oDataObject.allowRotate !== null) {
                curData.allowRotate = oDataObject.allowRotate;
            }
            if (typeof oDataObject.allowTranslate !== "undefined" && oDataObject.allowTranslate !== null) {
                curData.allowTranslate = oDataObject.allowTranslate;
            }
            if (typeof oDataObject.shapeDimension !== "undefined" && oDataObject.shapeDimension !== null && typeof oDataObject.shapeDimension.height !== "undefined" && oDataObject.shapeDimension.height !== null) {
                if (typeof curData.shapeDimension === "undefined" && curData.shapeDimension !== null) {
                    curData.shapeDimension = {};
                }
                curData.shapeDimension.height = oDataObject.shapeDimension.height;
            }
            if (typeof oDataObject.shapeDimension !== "undefined" && oDataObject.shapeDimension !== null && typeof oDataObject.shapeDimension.width !== "undefined" && oDataObject.shapeDimension.width !== null) {
                if (typeof curData.shapeDimension === "undefined" && curData.shapeDimension !== null) {
                    curData.shapeDimension = {};
                }
                curData.shapeDimension.width = oDataObject.shapeDimension.width;
            }
            if (typeof oDataObject.flip !== "undefined" && oDataObject.flip !== null) {
                this.setFlipData(oDataObject.flip);
            }
            if (typeof oDataObject.boundingBox !== "undefined" && oDataObject.boundingBox !== null) {
                this.setBoundingBox(oDataObject.boundingBox);
            }
            if (typeof oDataObject.closed !== "undefined" && oDataObject.closed !== null) {
                curData.closed = oDataObject.closed;
            }
            if (typeof oDataObject.arcCenter !== "undefined" && oDataObject.arcCenter !== null) {
                if (typeof curData.arcCenter === "undefined" && curData.arcCenter !== null) {
                    curData.arcCenter = new ConstructionTool.Models.Point();
                }
                if (typeof oDataObject.arcCenter.x !== "undefined" && oDataObject.arcCenter.x !== null) {
                    curData.arcCenter.x = oDataObject.arcCenter.x;
                }
                if (typeof oDataObject.arcCenter.y !== "undefined" && oDataObject.arcCenter.y !== null) {
                    curData.arcCenter.y = oDataObject.arcCenter.y;
                }
            }
            if (typeof oDataObject._rotationRefPoint !== "undefined") {
                this.setRotationPoint(oDataObject._rotationRefPoint);
            }

            if (typeof oDataObject.accId !== "undefined") {
                curData.accId = oDataObject.accId;
            }
        },

        "setDefaults": function() {
            var curData = this.get("_data"),
                renderData = null;

            if (typeof curData === "undefined" || curData === null) {
                this.set("_data", {});
                curData = this.get("_data");
            }

            curData.isElementLocked = false;
            curData.fillColor = "no-fill";
            curData.fillAlpha = 1; //0 - 1
            curData.isVisible = true;
            curData.isSelected = false;
            curData.closed = false;

            curData.strokeColor = "#424242";
            curData.strokeWidth = 4;
            curData.selectionStrokeColor = "#424242";
            curData.selectionStrokeWidth = 6;

            // Default dimensions of shape being created.
            curData.shapeDimension = {};

            // Set render data defaults
            this.set("_renderData", {});
            renderData = {};
            renderData.dataPoints = [];
            renderData.boundingBox = new ConstructionTool.Models.Rect();
            renderData.flipDirection = new ConstructionTool.Models.Point({
                "x": 1,
                "y": 1
            });
            this.setRenderData(renderData);

            // Allow resize and rotate handle
            curData.allowSelection = true;
            curData.allowResize = true;
            curData.allowRotate = true;
            curData.allowTranslate = true;
            curData.allowSelectionBound = true;
            curData.rotationAngle = 0;
        },

        /**
         * Gets color properties of a shape.
         * @private
         * @method getColorData
         * @param {Object} [curObj] An object with attribute configuration property/value pairs.
         * This is optional, but if provided used to change color properties of a shape.
         * @returns {Object} Reference object with updated color data.
         */
        "getColorData": function(curObj) {
            var data = this.get("_data");
            if (curObj === null || typeof curObj === "undefined") {
                curObj = {};
            }
            curObj.strokeColor = data.strokeColor;
            curObj.selectionStrokeColor = data.selectionStrokeColor;
            curObj.fillColor = data.fillColor;
            curObj.fillAlpha = data.fillAlpha;

            return curObj;
        },

        /**
         * Gets rotation related data of a shape.
         * @private
         * @method getRotationData
         * @param {Object} [curObj] An object with attribute configuration property/value pairs.
         * This is optional, but if provided used to change rotation related data of a shape.
         * @returns {Object} Reference object with updated rotation data.
         */
        "getRotationData": function(curObj) {
            var data = this.get("_data");
            if (curObj === null || typeof curObj === "undefined") {
                curObj = {};
            }

            curObj.boundingBox = this.getBoundingBox().clone();
            curObj.rotationAngle = data.rotationAngle;
            curObj.rotationReferencePoint = this.getRotationReferencePoint().clone();

            return curObj;
        },

        /**
         * Gets stroke related data of a shape.
         * @private
         * @method getStrokeData
         * @param {Object} [curObj] An object with attribute configuration property/value pairs.
         * This is optional, but if provided used to change stroke related data of a shape.
         * @returns {Object} Reference object with updated stroke data.
         */
        "getStrokeData": function(curObj) {
            var data = this.get("_data");
            if (curObj === null || typeof curObj === "undefined") {
                curObj = {};
            }

            curObj.strokeWidth = data.strokeWidth;
            curObj.selectionStrokeWidth = data.selectionStrokeWidth;

            return curObj;
        },

        /**
         * Gets clone of shape data and render data.
         * @private
         * @method getCloneData
         * @returns {Object} A clone object.
         */
        "getCloneData": function() {
            var renderData = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.get("_renderData")),
                data = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.get("_data"));

            return {
                "renderData": renderData,
                "shapeData": data
            };
        },

        "parseData": function(objData) {
            if (typeof objData.shapeData !== "undefined" && objData.shapeData !== null) {
                this.setOptions(objData.shapeData);
            }
            if (typeof objData.renderData !== "undefined" && objData.renderData !== null) {
                this.setRenderData(objData.renderData, true);
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

        /**
         * Inserts canvas point in dataPoints array.
         * @private
         * @method _feedPoint
         * @param {Object} A point object to be inserted in dataPoints.
         * @param {Number} index where to insert the point.
         */
        "_feedPoint": function feedPoint(curPoint, index) {
            if (curPoint.length < 0 && (typeof curPoint.clone === "undefined" || curPoint.clone === null)) {
                curPoint = new ConstructionTool.Models.Point(curPoint);
            }

            var renderData = this.get("_renderData"),
                transformModel = ConstructionTool.Models.Transform;
            if (typeof index !== "undefined" && index !== null) {
                renderData.dataPoints[index] = transformModel.toGraphCo(curPoint);
            } else {
                renderData.dataPoints.push(transformModel.toGraphCo(curPoint));
            }
        },

        /**
         * Clears dataPoints array.
         * @private
         * @method _clearFedPoints
         */
        "_clearFedPoints": function() {
            var renderData = this.get("_renderData");
            if (typeof renderData.dataPoints !== "undefined" && renderData.dataPoints !== null) {
                renderData.dataPoints.length = 0;
            }
        },

        /**
         * Sets datapoints of a shape.
         * @private
         * @method setFedPoints
         * @param {Object} points. Array of points
         */
        "setFedPoints": function(points, isGraphCo) {
            var renderData = this.get("_renderData"),
                graphPoints = [],
                point,
                transformModel = ConstructionTool.Models.Transform;
            for (point in points) {
                graphPoints.push(isGraphCo === true ? points[point] : transformModel.toGraphCo(points[point]));
            }
            renderData.dataPoints = graphPoints;
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
                transformModel = ConstructionTool.Models.Transform;
            for (point in points) {
                canvasPoints.push(transformModel.toCanvasCo(points[point]));
            }
            return canvasPoints;
        },

        /**
         * Sets flip data of a shape.
         * @private
         * @method setFlipData
         * @param {Object} An Object literal containing x and y values of flip direction.
         */
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
            var transformModel = ConstructionTool.Models.Transform,
                boundingBox = this.get("_renderData").boundingBox,
                box = new ConstructionTool.Models.Rect();

            box.x = transformModel.toCanvasCo(new ConstructionTool.Models.Point(boundingBox.x, 0)).x;
            box.y = transformModel.toCanvasCo(new ConstructionTool.Models.Point(0, boundingBox.y)).y;
            box.width = boundingBox.width;
            box.height = boundingBox.height;

            return box;
        },

        "setBoundingBox": function(boundingbox, isGraphCo) {
            var renderData = this.get("_renderData"),
                transformModel = ConstructionTool.Models.Transform;

            if (typeof boundingbox === "undefined" || boundingbox === null) {
                return;
            }

            if (typeof boundingbox.x !== "undefined") {
                renderData.boundingBox.x = isGraphCo === true ? boundingbox.x : transformModel.toGraphCo(new ConstructionTool.Models.Point(boundingbox.x, 0)).x;
            }
            if (typeof boundingbox.y !== "undefined") {
                renderData.boundingBox.y = isGraphCo === true ? boundingbox.y : transformModel.toGraphCo(new ConstructionTool.Models.Point(0, boundingbox.y)).y;
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
                point = new ConstructionTool.Models.Point({
                    "x": boundingBox.x + boundingBox.width / 2,
                    "y": boundingBox.y + boundingBox.height / 2
                });

            return point;
        },

        "setRotationPoint": function(refPoint) {
            var data = this.get("_data");
            if (refPoint !== null) {
                if (typeof data._rotationRefPoint === "undefined") {
                    data._rotationRefPoint = new ConstructionTool.Models.Point();
                }
                if (refPoint.x !== null) {
                    data._rotationRefPoint.x = refPoint.x;
                }
                if (refPoint.y !== null) {
                    data._rotationRefPoint.y = refPoint.y;
                }
            }
        },

        "getRotationPoint": function() {
            return this.get("_data")._rotationRefPoint || this.getRotationReferencePoint();
        },

        "getShapeAttributes": function(point1, point2) {
            var difX, difY, radius, centerX, centerY;

            difX = point2.x - point1.x;
            difY = point2.y - point1.y;
            radius = Math.abs(difX) < Math.abs(difY) ? Math.abs(difY / 2) : Math.abs(difX / 2);

            centerX = difX < 0 ? point1.x - radius : point1.x + radius;
            centerY = difY < 0 ? point1.y - radius : point1.y + radius;

            return {
                "center": [centerX, centerY],
                "radius": radius
            };
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
                maxFactor = {};

            width = Math.abs(boundingRect.width);
            height = Math.abs(boundingRect.height);
            maxFactor = width > height ? width : height;

            return maxFactor;
        },

        "setPreviousState": function setPreviousState() {
            var previousState = this.getSyncData(),
                undoRedoState = this.get("_undoRedoState");

            undoRedoState.previousState = MathUtilities.Components.Utils.Models.Utils.getCloneOf(previousState);
        },

        "setCurrentState": function setCurrentState() {
            var newState = this.getSyncData(),
                undoRedoState = this.get("_undoRedoState");

            undoRedoState.newState = MathUtilities.Components.Utils.Models.Utils.getCloneOf(newState);
        }
    });
}(window.MathUtilities));
