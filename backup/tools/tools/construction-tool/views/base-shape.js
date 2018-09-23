(function(MathUtilities) {
    "use strict";
    var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                          Base Shape                             */
    /*******************************************************************/
    /**
     * A customized Backbone.View that represents base shape.
     * @class MathUtilities.Tools.ConstructionTool.Views.BaseShape
     * @constructor
     * @extends Backbone.View
     */
    ConstructionTool.Views.BaseShape = Backbone.View.extend({
        /**
         * Stores model object associated with the view.
         * @private
         * @property model
         */
        "model": null,
        "_hitPoint": null,
        "_curPoint": null,
        "_rotationIntermediatePoint": null,
        "_selectionBound": null,
        "_intermediatePath": null,
        "_rotationRefPoint": null,
        "_resizeHitName": null,

        /**
         * Stores the temporary undo redo states.
         * @property _undoRedoStates
         * @type {Object}
         * @private
         */
        "_undoRedoState": null,

        /**
         * Initializer of Baseshape view.
         * @private
         * @method initialize
         */
        "initialize": function() {
            this.initModel();
            this._undoRedoState = {
                "oldState": {},
                "newState": {}
            };
        },

        "initModel": function() {
            this.model = new ConstructionTool.Models.BaseShape();
        },

        "getId": function() {
            return this.cid;
        },

        "setId": function(id) {
            this.cid = id;
        },

        "processTouchStart": function(eventObject) {
            var boundingBox = this.model.getBoundingBox(),
                oldState = {
                    "bRemove": true,
                    "id": this.getId()
                };

            // Sets default opacity for shapes
            this.model.setOptions({
                "fillAlpha": 1
            });

            boundingBox.x = eventObject.point.x;
            boundingBox.y = eventObject.point.y;

            //Set initial width and heigth to 0.
            boundingBox.width = 0;
            boundingBox.height = 0;

            this.model.setBoundingBox(boundingBox.clone());
            this._hitPoint = eventObject.point;
            this._curPoint = eventObject.point;

            // Undo redo state saves
            this._savePreviousState(oldState);
        },

        "processTouchMove": function(eventObject) {
            var boundingBox = this.model.getBoundingBox(),
                curPoint = eventObject.point;

            boundingBox.width = curPoint.x - boundingBox.x;
            boundingBox.height = curPoint.y - boundingBox.y;

            this.flip(this.model.getFlipDirection(boundingBox.clone()), false);
            this.resize(boundingBox.clone(), false);

            this.draw();

            this._curPoint = eventObject.point;
        },

        "processTouchEnd": function(eventObject) {
            var boundingBox = this.model.getBoundingBox(),
                defaultDimension = null,
                currentXDistance,
                currentYDistance,
                flipData = this.model.get("_renderData").flipDirection,
                bounds = null,
                curState = {};

            this.flip(this.model.getFlipDirection(boundingBox.clone()), false);
            currentXDistance = Math.abs(this._curPoint.x - this._hitPoint.x);
            currentYDistance = Math.abs(this._curPoint.y - this._hitPoint.y);

            if (this._hitPoint.x === this._curPoint.x && this._hitPoint.y === this._curPoint.y) {
                defaultDimension = this.model.get("_data").shapeDimension;
                boundingBox.width = defaultDimension.width;
                boundingBox.height = defaultDimension.height;
            } else if (currentXDistance < 20 && currentYDistance < 20) {
                defaultDimension = {
                    "width": 25,
                    "height": 25
                };
                boundingBox.width = defaultDimension.width;
                boundingBox.height = defaultDimension.height;
            }
            this.resize(boundingBox.clone(), false);
            this.draw();

            //Update Bounding box for regular shape
            if (typeof this._intermediatePath !== "undefined" && this._intermediatePath !== null) {
                bounds = this._intermediatePath.bounds;
                boundingBox.width = flipData.x * bounds.width;
                boundingBox.height = flipData.y * bounds.height;
            }
            this.model.setBoundingBox(boundingBox);
            this._curPoint = eventObject.point;
            this.model.setRotationPoint(this.model.getRotationReferencePoint());

            // Saves undo-redo state
            curState = this.model.getCloneData();
            curState.id = this.getId();
            this._saveCurrentState(curState);

            this.trigger("equation-complete");
        },

        "handleDragStart": function(eventObject) {
            var oldState = {};

            this.setHitType(eventObject.point);
            this._hitPoint = eventObject.point;
            this._curPoint = eventObject.point;
            this._intermediateResizePoint = eventObject.point;
            this._rotationIntermediatePoint = eventObject.point;
            if (this._selectionBound && this._selectionBound._resizeHandlePath !== null) {
                this._resizeHitName = this._selectionBound._resizeHandlePath.hitTest(this._hitPoint);
            }

            // Undo-Redo state saving
            oldState = this.model.getCloneData();
            oldState.id = this.getId();
            oldState = this.getViewOptions(oldState);
            this._savePreviousState(oldState);
        },

        "handleDragging": function(eventObject) {
            var curMode = this.getMode(),
                baseShapeMode = ConstructionTool.Views.BaseShape.Mode;
            this._curPoint = eventObject.point;

            switch (curMode) {
                case baseShapeMode.Select:
                    this._applyTranslation(eventObject);
                    break;
                case baseShapeMode.Resize:
                    this._applyResize(eventObject);
                    break;
                case baseShapeMode.Rotate:
                    this._applyRotation();
                    break;
            }
        },

        "handleDragEnd": function(eventObject) {
            var curState = {},
                baseShapeMode = ConstructionTool.Views.BaseShape.Mode;

            this._curPoint = eventObject.point;

            if ([baseShapeMode.Rotate, baseShapeMode.Resize].indexOf(this.getMode()) > -1) {
                this.updateBoundingBox();
            }

            // Undo/Redo state saving
            curState = this.model.getCloneData();
            curState.id = this.getId();
            curState = this.getViewOptions(curState);
            this._saveCurrentState(curState);

            // Nullify the hit and cur points.
            this._hitPoint = null;
            this._curPoint = null;
            this._rotationIntermediatePoint = null;
            this._resizeHitName = null;
        },

        "getMode": function() {
            return this._mode;
        },

        "setMode": function(objMode) {
            if (typeof objMode !== "undefined") {
                this._mode = objMode;
            }
        },

        /**
         * Update Bounding box on resize and rotation.
         * @method updateBoundingBox
         */
        "updateBoundingBox": function() {
            var prevRefPoint = null,
                curRefPoint = null,
                angle = this.model.get("_data").rotationAngle,
                box = new ConstructionTool.Models.Rect(),
                boundingBox = this.model.getBoundingBox();

            prevRefPoint = this.model.getRotationPoint();
            curRefPoint = this.model.getRotationReferencePoint();
            curRefPoint = this.model.getRotatedPoints([curRefPoint], prevRefPoint, angle)[0];
            this.model.setRotationPoint(curRefPoint);

            box.x = curRefPoint.x - boundingBox.width / 2;
            box.y = curRefPoint.y - boundingBox.height / 2;
            box.width = boundingBox.width;
            box.height = boundingBox.height;

            this.resize(box.clone(), true);
        },

        /**
         * Checks to see if the shape was hit or not.
         * @method isHit
         * @params objPoint {Object} Point on which the test for hit is to be made.
         */
        "isHit": function(objPoint) {
            var shapeGroup = this._intermediatePath,
                hitResult = null,
                isBounds;
            if (shapeGroup) {
                hitResult = shapeGroup.hitTest(objPoint);
            }

            if (this._selectionBound) {
                isBounds = this._selectionBound.isHit(objPoint, {
                    "checkContains": false
                });
            }
            if (isBounds === true) {
                hitResult = isBounds;
            }

            return !!hitResult;

        },

        /**
         * Sets the hitType of the shape.
         * @method setHitType
         * @params {Object} objPoint - Hit type to set based on the point passed to it.
         */
        "setHitType": function(objPoint) {
            var shapeGroup = this._intermediatePath,
                hitResult = null,
                className;

            if (shapeGroup && shapeGroup.hitTest) {
                hitResult = shapeGroup.hitTest(objPoint);
            }

            if (hitResult) {
                hitResult = ConstructionTool.Views.BaseShape.Mode.Select;
                this.setMode(hitResult);
            } else {
                hitResult = this._selectionBound.getHitType(objPoint);
                if (hitResult) {
                    this.setMode(hitResult);
                }
            }

            if (this.getMode() === 1 && !this.$("#construction-tool-canvas").hasClass("construction-tool-move-cursor") && this.model.get("_data").allowResize) {
                className = this.$("#construction-tool-canvas").attr("class");
                if (className.indexOf("resize") !== -1) {
                    this.setMode(ConstructionTool.Views.BaseShape.Mode.Resize);
                }
            }
        },

        /**
         * Returns the hit type of the shape
         * @method getHitType
         */
        "getHitType": function() {
            return ConstructionTool.Views.BaseShape.Mode.Select;
        },

        /**
         * Selects the current shape.
         * @method select
         * @params {Object} objSelectOptions -- Optional data for the changes in selection type.
         * @params {Object} objSelectOptions.suppressEvent -- Suppresses the event that is fired after the selection of the shape.
         */
        "select": function(objSelectOptions) {
            var shapeGroup = this._intermediatePath,
                data = this.model.get("_data");

            if (shapeGroup && data.allowSelection) {
                data.isSelected = true;
                this.drawBounds.apply(this, arguments);
                this.setMode(ConstructionTool.Views.BaseShape.Mode.Select);
                if (this._selectionBound) {
                    this._selectionBound.bindStatesForSelectionBox();
                }
                objSelectOptions = objSelectOptions || {};
                if (!objSelectOptions.suppressEvent) {
                    this.trigger("select", this, arguments);
                }
            }
        },

        /**
         * Selects the current shape.
         * @method deselect
         * @params {Object} objSelectOptions -- Optional data for the changes in selection type.
         * @params {Object} objSelectOptions.suppressEvent -- Suppresses the event that is fired after the deselection of the shape.
         */
        "deselect": function(objSelectOptions) {
            if (this.model.get("_data").allowSelection !== true || this.model.get("_data").isSelected === false) { //return if shape object is not allowed to select.
                return;
            }

            var shapeGroup = this._intermediatePath,
                data = this.model.get("_data");

            if (shapeGroup) {
                shapeGroup.strokeColor = data.strokeColor;
                shapeGroup.strokeWidth = data.strokeWidth;
                data.isSelected = false;

                if (this._selectionBound) {
                    this._selectionBound.remove();
                    this._selectionBound = null;
                }

                this.setMode(ConstructionTool.Views.BaseShape.Mode.None);
                objSelectOptions = objSelectOptions || {};
                if (!objSelectOptions.suppressEvent) {
                    this.trigger("deselect", this);
                }
            }
        },

        /**
         * Draws the selection around the shape as a selection.
         * @method drawBounds
         * @params args {Object} objRect denotes the rect to which the selection is to be drawn.
         */
        "drawBounds": function(args) {
            // Selection drawn on canvas
            var shapeGroup = this._intermediatePath,
                data = this.model.get("_data"),
                boundingBox = this.model.getBoundingBox(),
                box = new ConstructionTool.Models.Rect(),
                strokeWidth = Number(data.strokeWidth),
                xFactor = null,
                yFactor = null,
                allowRotate = null,
                allowResize = null;

            if (!data.allowSelectionBound || !shapeGroup) {
                return;
            }

            if (!this._selectionBound) {
                this._selectionBound = new ConstructionTool.Views.SelectionRect();
            }

            //Manipulate Shape Stroke Bounds so as to not clash with the shape boundary.
            if (boundingBox.width < 0) {
                xFactor = -strokeWidth;
            }
            if (boundingBox.height < 0) {
                yFactor = -strokeWidth;
            }

            box.x = boundingBox.x - xFactor - Math.abs(strokeWidth / 2);
            box.width = boundingBox.width + xFactor * 2 + Math.abs(strokeWidth);

            box.y = boundingBox.y - yFactor - Math.abs(strokeWidth / 2);
            box.height = boundingBox.height + yFactor * 2 + Math.abs(strokeWidth);

            allowRotate = typeof args !== "undefined" && typeof args.rotateHandle !== "undefined" ? args.rotateHandle : data.allowRotate;
            allowResize = typeof args !== "undefined" && typeof args.resizeHandle !== "undefined" ? args.resizeHandle : data.allowResize;
            this._selectionBound.setOptions({
                "boundingBox": box.clone(),
                "flip": this.model.get("_renderData").flipDirection,
                "rotationAngle": data.rotationAngle,
                "rotationReferencePoint": this.model.getRotationPoint(),
                "allowRotate": allowRotate,
                "allowResize": allowResize
            });
            this._selectionBound.resize(box.clone());
        },

        /**
         * Clears the intermediate path.
         * @method clearIntermediatePath
         */
        "clearIntermediatePath": function() {

            // Clear old intermediate drawings
            if (this._intermediatePath && this._intermediatePath.hitPath) {
                this._intermediatePath.hitPath.removeSegments();
                this._intermediatePath.hitPath = null;
            }
            if (this._intermediatePath) {
                this._intermediatePath.remove();
                this._intermediatePath = null;
            }
        },

        /**
        Base draw function, that clears the last shapeGroup trail.
        * @method draw
        */
        "draw": function() {
            var boundingBox = this.model.getBoundingBox(),
                arrTempPoints = null,
                data = this.model.get("_data");

            this.clearIntermediatePath();

            arrTempPoints = this.getShapePoints(boundingBox);

            this.model._clearFedPoints();
            this.model.setFedPoints(arrTempPoints);

            this.applySizing();
            this.applyFlip();
            this.applyRotation();

            if (data.isSelected === true) {
                this.drawBounds(this.getBoundingRect());
            }
            this.updatePathZIndex();
            this.updateAccBoundingBox();
        },

        /**
         * Checks to see if the shape is selected.
         * @method isSelected
         * @returns Returns true if shape is selected else returns false.
         */
        "isSelected": function() {
            return this.model.get("_data").isSelected;
        },

        "parseData": function(dataToParse) {
            if (typeof dataToParse !== "undefined" && dataToParse !== null) {
                this.model.parseData(dataToParse);
                if (typeof dataToParse.shapeData !== "undefined" && dataToParse !== null && dataToParse.shapeData.isSelected === true) {
                    this.select();
                }
            }
        },

        /**
         * Sets options to shape. Like color information, stroke sizing, etc...
         * @method setOptions, set shape properties.
         * @param {Object} objOptions, properties which should be updated.
         */
        "setOptions": function(objOptions) {
            this.model.setOptions(objOptions);
            this.setViewOptions(objOptions);
            this.applyStyle(this.model.get("_data"));
        },

        "setViewOptions": function(objOptions) {
            if (typeof objOptions !== "undefined" && typeof objOptions.rotationReferencePoint !== "undefined") {
                this.model.setRotationPoint(objOptions.rotationReferencePoint);
            }
            if (typeof objOptions !== "undefined" && typeof objOptions.id !== "undefined") {
                this.setId(objOptions.id);
            }
            if (typeof objOptions !== "undefined" && typeof objOptions.renderData !== "undefined" && typeof objOptions.renderData.dataPoints !== "undefined") {
                this.model.setFedPoints(MathUtilities.Components.Utils.Models.Utils.getCloneOf(objOptions.renderData.dataPoints));
            }
        },

        "getViewOptions": function(objData) {
            var pt = this.model.getRotationPoint();

            objData = objData || {};
            objData.rotationReferencePoint = pt && pt.clone ? pt.clone() : MathUtilities.Components.Utils.Models.Utils.getCloneOf(pt);
            return objData;
        },

        /**
         * Applies the style directly to the path group object lying in the shape.
         * @method applyStyle
         * @params {Object} data object that holds the style data.
         */
        "applyStyle": function(data) {
            var shapeGroup = this._intermediatePath;
            if (shapeGroup) {
                this.applyStyleToPathGroup(shapeGroup, data);
            }
        },

        /**
         * Applies the style directly to the path group passed to it.
         * @method applyStyleToPathGroup
         * @params {Object} pathGroup object to which style is to be applied.
         * @params {Object} styleData object that is the style data.
         */
        "applyStyleToPathGroup": function(pathGroup, styleData) {
            if (pathGroup) {
                if (styleData.strokeColor !== null) {
                    pathGroup.strokeColor = styleData.strokeColor;
                }
                if (styleData.strokeWidth !== null) {
                    pathGroup.strokeWidth = styleData.strokeWidth;
                }
                if (styleData.fillColor !== null) {
                    pathGroup.fillColor = styleData.fillColor;
                }
                if (styleData.fillAlpha !== null && pathGroup.fillColor) {
                    pathGroup.fillColor.alpha = styleData.fillAlpha;
                }
                /*We consider `no-fill` as value `null`.*/
                if (styleData.fillColor === "no-fill") {
                    pathGroup.fillColor = null;
                }
            }
        },
        /**
         * Translates the current instance by specified difference.
         * @method translate, translate shape by given value
         * @param {Object} objPoint, translate factor.
         * @param {Boolean} bDraw, check for shape redrawing.
         */
        "translate": function(objPoint, bDraw) {
            var boundingBox = this.model.getBoundingBox();

            if (typeof boundingBox !== "undefined" && boundingBox !== null) {
                boundingBox = boundingBox.clone();
            } else {
                return;
            }

            boundingBox.x += objPoint.x;
            boundingBox.y += objPoint.y;

            //Restrict translation of a shape when reached on canvas boundaries
            this.model.setBoundingBox(boundingBox.clone());
            this.model.setRotationPoint(this.model.getRotationReferencePoint());

            if (bDraw === true) {
                this.draw();
            }
            this.updateAccBoundingBox();
        },

        /**
         * Applies the translation occured by moving the shape so far.
         * @method _applyTranslation, call functions to translate shape.
         * @param {Object} eventObject, Jquery event object
         */
        "_applyTranslation": function(eventObject) {
            if (this.model.get("_data").allowSelection === false) {
                return;
            }
            var diffX = 0,
                diffY = 0;

            if (typeof eventObject !== "undefined") {
                diffX = eventObject.delta.x;
                diffY = eventObject.delta.y;
            }

            this.translate({
                "x": diffX,
                "y": diffY
            }, true);
        },

        "_applyResize": function(eventObject, incrX, incrY) {
            if (this.model.get("_data").allowSelection === false) {
                return;
            }
            var hitPoint = this._intermediateResizePoint,
                curPoint = eventObject.point,
                resizeWidth, resizeHeight, arrNewPoints,
                boundingBox = this.model.getBoundingBox(),
                data = this.model.get("_data"),
                angle = data.rotationAngle,
                refPoint = null,
                resizeHitName = this._resizeHitName,
                box = new ConstructionTool.Models.Rect();

            if (typeof incrX !== "undefined" && typeof incrY !== "undefined") {
                resizeWidth = incrX;
                resizeHeight = incrY;
                resizeHitName = {
                    "item": {
                        "cornerName": "bottom-right"
                    }
                };
            } else {
                if (angle === 0) {
                    resizeWidth = curPoint.x - hitPoint.x;
                    resizeHeight = curPoint.y - hitPoint.y;
                } else {
                    refPoint = this.model.getRotationPoint();
                    arrNewPoints = this.model.getRotatedPoints([eventObject.lastPoint, eventObject.point], refPoint, -angle);
                    resizeWidth = arrNewPoints[1].x - arrNewPoints[0].x;
                    resizeHeight = arrNewPoints[1].y - arrNewPoints[0].y;
                }
            }

            if (resizeHitName !== null && typeof resizeHitName !== "undefined" && resizeHitName.item && typeof resizeHitName.item.cornerName !== "undefined") {
                switch (resizeHitName.item.cornerName) {
                    case "top-left":
                        box.x = boundingBox.x + resizeWidth;
                        box.y = boundingBox.y + resizeHeight;
                        box.width = boundingBox.width - resizeWidth;
                        box.height = boundingBox.height - resizeHeight;
                        break;
                    case "bottom-left":
                        box.x = boundingBox.x + resizeWidth;
                        box.y = boundingBox.y;
                        box.width = boundingBox.width - resizeWidth;
                        box.height = boundingBox.height + resizeHeight;
                        break;
                    case "top-right":
                        box.x = boundingBox.x;
                        box.y = boundingBox.y + resizeHeight;
                        box.width = boundingBox.width + resizeWidth;
                        box.height = boundingBox.height - resizeHeight;
                        break;
                    case "bottom-right":
                        box.x = boundingBox.x;
                        box.y = boundingBox.y;
                        box.width = boundingBox.width + resizeWidth;
                        box.height = boundingBox.height + resizeHeight;
                        break;
                }
                //Returns if box height or width falls below minimum values.
                if (Math.abs(box.height) < data.minHeight || Math.abs(box.width) < data.minWidth) {
                    return;
                }
                if (resizeHitName.item.cornerName && data.shapeType === ConstructionTool.Views.ToolType.Image) {
                    this.model.setOptions({
                        "scaleFactor": {
                            "x": box.width / this._initialPosition.width,
                            "y": box.height / this._initialPosition.height
                        }
                    });
                }
                this.flip(this.model.getFlipDirection(box.clone()), false);

                this.resize(box.clone(), true);
                this._intermediateResizePoint = curPoint;
            }
        },

        "resize": function(boundingBox, bDraw) {
            this.model.setBoundingBox(boundingBox);
            if (bDraw) {
                this.draw();
            }
            this.updateAccBoundingBox();
        },

        "flip": function(flipDirection, bDraw) {
            this.model.setFlipData(flipDirection);
            if (bDraw) {
                this.draw();
            }
        },

        "_applyRotation": function() {
            if (!this.model.get("_data").allowRotate || this.model.get("_data").allowSelection === false) {
                return;
            }

            this.rotate(this.getAngle(new ConstructionTool.Models.Point(this._rotationIntermediatePoint),
                new ConstructionTool.Models.Point(this._curPoint)));
        },

        /**
         * Rotate the shape.
         * @method rotate
         * @params {Number} angle, number by which shape should rotate.
         * @param {Boolean} bDraw, check for shape redrawing.
         */
        "rotate": function(angle, bDraw) {
            var data = this.model.get("_data");
            this.model.setOptions({
                "rotationAngle": (Number(data.rotationAngle) + Number(angle)) % 360 // 360 for 2*pi
            });
            this.trigger("object:rotate");
            if (bDraw === true || typeof bDraw === "undefined") {
                this.draw();
            }
            this.updateAccBoundingBox();
        },

        /**
         * Returns the angle between the points passed as arguments.
         * @method getAngle
         * @params {Object} PointA the first point
         * @params {Object} PointB the second point
         * @returns {Number} The angle
         */
        "getAngle": function(pointA, pointB) {
            var angle, refPoint,
                boundingBox = this.model.getBoundingBox();
            pointA = new ConstructionTool.Models.Point(pointA);
            pointB = new ConstructionTool.Models.Point(pointB);
            //Here, Refpoint is the center pointer point of bounding box after flip
            refPoint = {
                "x": boundingBox.x + boundingBox.width / 2,
                "y": boundingBox.y + boundingBox.height / 2
            };

            angle = Math.atan2(pointB.y - refPoint.y, pointB.x - refPoint.x) - Math.atan2(pointA.y - refPoint.y, pointA.x - refPoint.x);
            angle = angle * 180 / Math.PI; // 180 for PI

            this._rotationIntermediatePoint = new ConstructionTool.Models.Point(pointB);
            return angle;
        },

        /**
         * Returns bounding rect of the current instance.
         * @method getBoundingRect
         */
        "getBoundingRect": function() {
            var pathGroup;
            if (this._intermediatePath) {
                pathGroup = this._intermediatePath;
                return pathGroup.strokeBounds;
            }

            return null;
        },

        /**
         * Returns the style applicable on shape object depending on param passed. If true it returns style for selected shape else for normal shape.
         * @method _getApplicableStrokeStyle
         * @private
         */
        "_getApplicableStrokeStyle": function() {
            var applicableData = {},
                data = this.model.get("_data");
            applicableData.strokeColor = data.strokeColor;
            applicableData.strokeWidth = data.strokeWidth;

            applicableData.fillColor = data.fillColor;
            applicableData.fillAlpha = data.fillAlpha;

            return applicableData;
        },

        "destroy": function() {
            this.model.destroy();
            this.remove();
        },

        "remove": function(bSaveState) {
            var oldState = {},
                curState = {};

            this.clearIntermediatePath();

            if (bSaveState) {
                // Undo redo state saves
                //oldState
                oldState = this.model.getCloneData();
                oldState = this.getViewOptions(oldState);
                oldState.id = this.getId();
                if (this.model.get("_data").shapeType === ConstructionTool.Views.ToolType.Image) {
                    oldState.scaleFactor = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.get("_data").scaleFactor);
                    $("#img-file").val("");
                }
                this._savePreviousState(oldState);

                //newState
                curState.bRemove = true;
                curState.id = this.getId();
                this._saveCurrentState(curState);
            }
            if (this._selectionBound) {
                this._selectionBound.remove();
                this._selectionBound = null;
            }
        },

        "getSyncData": function() {
            var syncData = this.model.getSyncData();
            //remove base64 for text, while saving data
            if (this.model.get('_data').shapeType === ConstructionTool.Views.ToolType.Text && syncData && syncData.shapeData && syncData.shapeData.imageData && syncData.shapeData.imageData.base64) {
                syncData.shapeData.imageData.base64 = "";
            }

            syncData.id = this.cid;
            return syncData;
        },

        "applyRotation": function(pathGroup) {
            var data = this.model.get("_data"),
                refPoint = this.model.getRotationPoint();
            pathGroup = pathGroup || this._intermediatePath;
            if (pathGroup) {
                pathGroup.rotate(data.rotationAngle, refPoint);
            }
        },

        "applyFlip": function(pathGroup) {
            var flipData = this.model.get("_renderData").flipDirection,
                boundingBox = this.model.getBoundingBox();

            pathGroup = pathGroup || this._intermediatePath;

            pathGroup.scale(flipData.x, flipData.y, {
                "x": boundingBox.x,
                "y": boundingBox.y
            });
        },

        "applySizing": function() {
            var style = this._getApplicableStrokeStyle(this.isSelected()),
                arrPoints = this.model.getFedPoints(),
                data = this.model.get("_data");
            this._intermediatePath = new ConstructionTool.Views.PaperScope.Path({
                "segments": arrPoints,
                "closed": data.closed,
                "strokeJoin": "round"
            });

            this.applyStyleToPathGroup(this._intermediatePath, style);
        },

        "getShapePoints": function(boundingRect) {
            var arrTempPoints = [],
                segments,
                iLooper,
                path;

            path = new ConstructionTool.Views.PaperScope.Path.Rectangle(boundingRect.x, boundingRect.y, Math.abs(boundingRect.width), Math.abs(boundingRect.height));

            segments = path.segments;
            for (iLooper = 0; iLooper < segments.length; iLooper++) {
                arrTempPoints[iLooper] = new ConstructionTool.Models.Point(segments[iLooper].point.x, segments[iLooper].point.y);
            }
            path.remove();
            return arrTempPoints;
        },

        "updatePathZIndex": function() {
            if (typeof this._intermediatePath === "undefined" || this._intermediatePath === null) {
                return;
            }

            var zIndex = this.model.get("_data").zIndex;
            ConstructionTool.Views.PaperScope.project.activeLayer.insertChild(zIndex, this._intermediatePath);
        },

        /*************************************************************************************
        Undo redo state saves, getters and mor...
        *************************************************************************************/
        "_savePreviousState": function(data) {
            this._undoRedoState.oldState = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(data);
        },

        "_getPreviousState": function() {
            return this._undoRedoState.oldState;
        },

        "_saveCurrentState": function(data) {
            this._undoRedoState.newState = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(data);
        },

        "_getCurrentState": function() {
            return this._undoRedoState.newState;
        },

        "_updateCurrentState": function(data) {
            if (data) {
                var currentState = null;
                currentState = this._getCurrentState();
                if (typeof data.isSelected !== "undefined") {
                    currentState.shapeData.isSelected = data.isSelected;
                }
            }
        },

        "updateAccBoundingBox": function() {
            if (typeof this.model.get("_data").accId === "undefined") {
                return;
            }
            var accBoundingBox = this.getAccBoundingBox(),
                accId = this.model.get("_data").accId,
                canvasAccView = ConstructionTool.Views.canvasAccView;

            canvasAccView.updateAccDivProp("shape-" + accId, accBoundingBox.shape);
            canvasAccView.updateAccDivProp("shape-resize-" + accId, accBoundingBox.resize);
            canvasAccView.updateAccDivProp("shape-rotate-" + accId, accBoundingBox.rotate);

        },

        "getAccBoundingBox": function() {
            var boundingBox = this.model.getBoundingBox(),

                RESIZE_PROP = {
                    "width": 13,
                    "height": 13,
                    "rightPadding": 5,
                    "topPadding": 5
                },

                rotateProp = {
                    "width": 12,
                    "height": 12,
                    "topPadding": 17
                },

                shapePadding = 2, //Padding around shape, considering bounding box size

                shapeAccProp = {
                    "left": boundingBox.x - shapePadding,
                    "top": boundingBox.y - shapePadding,
                    "width": boundingBox.width + 2 * shapePadding,
                    "height": boundingBox.height + 2 * shapePadding
                },

                resizeAccProp = {
                    "left": boundingBox.x + Math.abs(boundingBox.width) - RESIZE_PROP.rightPadding,
                    "top": boundingBox.y + Math.abs(boundingBox.height) - RESIZE_PROP.topPadding,
                    "height": RESIZE_PROP.height,
                    "width": RESIZE_PROP.width
                },

                rotateAccProp = {
                    "left": boundingBox.x + boundingBox.width / 2 - rotateProp.width / 2,
                    "top": boundingBox.y - rotateProp.topPadding - rotateProp.height,
                    "width": rotateProp.width,
                    "height": rotateProp.height
                };

            return {
                "shape": this._getRotatedPoints(shapeAccProp),
                "rotate": this._getRotatedPoints(rotateAccProp),
                "resize": this._getRotatedPoints(resizeAccProp)
            };


        },

        "_getRotatedPoints": function(prop) {
            var refPoint = this.model.getRotationPoint(),
                padding = ConstructionTool.Models.Sketchpad.ACC_PADDING,

                angle = this.model.get("_data").rotationAngle,
                points = [{
                    "x": prop.left - padding,
                    "y": prop.top - padding
                }, {
                    "x": prop.left + prop.width + padding,
                    "y": prop.top - padding
                }, {
                    "x": prop.left + prop.width + padding,
                    "y": prop.top + prop.height + padding
                }, {
                    "x": prop.left - padding,
                    "y": prop.top + prop.height + padding
                }],

                rotatedPoints = this.model.getRotatedPoints(points, refPoint, angle);


            prop.points = rotatedPoints;
            return prop;
        }
    }, {
        "Mode": {
            "None": 0,
            "Select": 1,
            "Resize": 2,
            "Rotate": 3
        }
    });

}(window.MathUtilities));
