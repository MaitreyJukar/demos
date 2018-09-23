(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //Base shape view start **********************************************

    /**
     * A customized Backbone.View that represents Baseshape view.
     * @class BaseShape
     * @constructor
     * @namespace MathUtilities.Tools.WhiteboardTool.Views
     * @extends Backbone.View
     */
    WhiteboardTool.Views.BaseShape = Backbone.View.extend({
        "model": null,
        "_mode": null,
        "_hitPoint": null,
        "_curPoint": null,
        "_lastRotationPoint": null,
        "_selectionBound": null,
        "isMultipleSelection": false,
        "_intermediatePath": null,
        "_resizeHitName": null,

        "initialize": function() {
            this.initModel();
            this._mode = WhiteboardTool.Views.BaseShape.Mode.Select;

            this._undoRedoState = {
                "oldState": {},
                "newState": {}
            };
        },

        "initModel": function() {
            this.model = new WhiteboardTool.Models.BaseShape();
        },

        "getId": function() {
            return this.cid;
        },

        "setId": function(id) {
            this.cid = id;
        },

        "processTouchStart": function(eventObject) {
            var boundingBox = this.model.getBoundingBox(),
                oldState = {},
                opacity = this.$("#whiteboard #change-opacity-text-box").val(),
                CONVERSION_FACTOR = 0.01; //Factor to convert opacity value from 0 - 100 to 0 - 1.

            this.model._feedPoint(eventObject.point.clone());

            // sets default opacity for shapes
            if (opacity === "" || typeof opacity === "undefined") {
                this.model.setOptions({
                    "nFillAlpha": 1
                });
            } else {
                this.model.setOptions({
                    "nFillAlpha": Number(opacity) * CONVERSION_FACTOR
                });
            }
            if (boundingBox) {

                boundingBox.x = eventObject.point.x;
                boundingBox.y = eventObject.point.y;

                //Initially set width and height to 0
                boundingBox.width = 0;
                boundingBox.height = 0;
            }

            this.model.setBoundingBox(boundingBox.clone());

            this._hitPoint = eventObject.point;
            this._curPoint = eventObject.point;

            // Undo redo state saves
            oldState.bRemove = true;
            oldState.id = this.getId();
            this._savePreviousState(oldState);
        },

        "processTouchMove": function(eventObject) {
            var boundingBox = this.model.getBoundingBox(),
                curPoint = eventObject.point,
                lastIndex = this.model.getFedPoints().length - 1;

            this.model._feedPoint(curPoint.clone(), lastIndex);

            if (boundingBox) {
                boundingBox.width = curPoint.x - boundingBox.x;
                boundingBox.height = curPoint.y - boundingBox.y;
            }

            this.flip(this.model.getFlipDirection(boundingBox.clone()), false);
            this.resize(boundingBox.clone(), false);
            this.draw();

            this._curPoint = eventObject.point;
        },

        "processTouchEnd": function(eventObject) {
            var boundingBox = this.model.getBoundingBox(),
                curPoint = eventObject.point,
                defaultDimension = null,
                lastIndex = this.model.getFedPoints().length - 1,
                curState = {},
                currentXDistance = null,
                currentYDistance = null,
                flipData = this.model.getFlipData(),
                bounds = null;

            this.model._feedPoint(curPoint.clone(), lastIndex);

            this.flip(this.model.getFlipDirection(boundingBox.clone()), false);
            currentXDistance = Math.abs(this._curPoint.x - this._hitPoint.x);
            currentYDistance = Math.abs(this._curPoint.y - this._hitPoint.y);
            if (this._hitPoint.x === this._curPoint.x && this._hitPoint.y === this._curPoint.y) {
                defaultDimension = this.model.getData().shapeDimension;
                boundingBox.width = defaultDimension.width;
                boundingBox.height = defaultDimension.height;
            } else if (currentXDistance < 20 && currentYDistance < 20) { // If area selected to draw (bounding box) a shape is greater than 20px
                defaultDimension = {
                    //set width height to 25px
                    "width": 25,
                    "height": 25
                };
                boundingBox.width = defaultDimension.width;
                boundingBox.height = defaultDimension.height;
            }
            this.resize(boundingBox.clone(), false);
            this.draw();

            //Update Bounding box for regular shape
            if (this._intermediatePath) {
                bounds = this._intermediatePath.bounds;
                boundingBox.width = flipData.x * bounds.width;
                boundingBox.height = flipData.y * bounds.height;
            }
            this.model.setBoundingBox(boundingBox);
            this._curPoint = eventObject.point;
            this.model.setBackupBoundingBox(boundingBox.clone());
            this.model.setRotationPoint(this.model.getRotationReferencePoint());

            // Undo redo state saves
            curState = this.model.getCloneData();
            curState = this.getViewOptions(curState);
            curState.backupBoundingBox = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.getBackupBoundingBox());
            if (this.model.getData().nType === WhiteboardTool.Views.ShapeType.Image) {
                curState.scaleFactor = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.getData().scaleFactor);
            }
            curState.id = this.getId();
            this._saveCurrentState(curState);
        },

        "handleDragStart": function(eventObject) {
            var prevState = {};

            this.setHitType(eventObject.point);
            this._hitPoint = eventObject.point;
            this._curPoint = eventObject.point;
            this._lastRotationPoint = eventObject.point;
            if (this._selectionBound && this._selectionBound._resizeHandlePath !== null) {
                this._resizeHitName = this._selectionBound._resizeHandlePath.hitTest(this._hitPoint);
            }

            // Undo-Redo state saving
            prevState = this.model.getCloneData();
            prevState = this.getViewOptions(prevState);
            prevState.id = this.getId();
            this._savePreviousState(prevState);
        },

        "handleDragging": function(eventObject) {
            var baseShapeMode = WhiteboardTool.Views.BaseShape.Mode;

            this._curPoint = eventObject.point;

            switch (this.getMode()) {
                case baseShapeMode.Select:
                    this._applyTranslation(eventObject);
                    break;
                case baseShapeMode.Resize:
                    this._applyResize();
                    break;
                case baseShapeMode.Rotate:
                    this._applyRotation();
                    break;
            }
        },

        "handleDragEnd": function(eventObject) {
            var curMode = this.getMode(),
                curState = {},
                baseShapeMode = WhiteboardTool.Views.BaseShape.Mode;

            this._curPoint = eventObject.point;

            switch (curMode) {
                case baseShapeMode.Select:
                    this._applyTranslation(eventObject);
                    break;
                case baseShapeMode.Resize:
                    this._applyResize();
                    break;
                case baseShapeMode.Rotate:
                    this._applyRotation();
                    break;
            }

            this.model.setBackupBoundingBox(this.model.getBoundingBox());
            if (this.model.getData().nType === WhiteboardTool.Views.ShapeType.Pencil) {
                this.draw(eventObject, "dragEnd");
            }

            if ([baseShapeMode.Rotate, baseShapeMode.Resize].indexOf(curMode) > -1) {
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
            this._lastRotationPoint = null;
            this._resizeHitName = null;
        },

        /**
         * Update Bounding box on resize and rotation.
         * @method updateBoundingBox
         */
        "updateBoundingBox": function() {
            var prevRefPoint = null,
                curRefPoint = null,
                angle = this.model.getData().nRotation,
                box = new WhiteboardTool.Models.Rect(),
                boundingBox = this.model.getBoundingBox();

            //Update bounding box
            if (typeof this._maxWidth !== "undefined") {
                boundingBox.width = this._maxWidth;
            }
            if (this._maxHeight) {
                boundingBox.height = this._maxHeight;
            }
            this.model.setBoundingBox(boundingBox.clone());

            prevRefPoint = this.model.getRotationPoint();
            curRefPoint = this.model.getRotationReferencePoint();
            curRefPoint = this.model.getRotatedPoints([curRefPoint], prevRefPoint, angle)[0];
            this.model.setRotationPoint(curRefPoint);

            box.x = curRefPoint.x - boundingBox.width / 2;
            box.y = curRefPoint.y - boundingBox.height / 2;
            box.width = boundingBox.width;
            box.height = boundingBox.height;
            this.model.setBackupBoundingBox(box.clone());
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
            if (isBounds) {
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
                hitResult = WhiteboardTool.Views.BaseShape.Mode.Select;
                this.setMode(hitResult);
            }
            if (!hitResult) {
                hitResult = this._selectionBound.getHitType(objPoint);
            }
            if (hitResult) {
                this.setMode(hitResult);
            }
            if (this.getMode() === 1 && !this.$("#whiteboard-canvas").hasClass("whiteBoard-move-cursor") && this.model.getData().bAllowResize) {
                className = this.$("#whiteboard-canvas").attr("class");
                if (className.indexOf("resize") !== -1) {
                    this.setMode(WhiteboardTool.Views.BaseShape.Mode.Resize);
                }
            }
        },

        /**
         * Returns the hit type of the shape
         * @method getHitType
         * @returns {Number} Number denoting the hitType of the shape.
         */
        "getHitType": function() {
            return WhiteboardTool.Views.BaseShape.Mode.Select;
        },

        /**
         * Selects the current shape.
         * @method select
         * @params {Object} objSelectOptions -- Optional data for the changes in selection type.
         * @params {Object} objSelectOptions.suppressEvent -- Suppresses the event that is fired after the selection of the shape.
         */
        "select": function(objSelectOptions) {
            this.model.getData().bSelected = true;
            this.drawBounds.apply(this, arguments);
            this.setMode(WhiteboardTool.Views.BaseShape.Mode.Select);
            if (this._selectionBound) {
                this._selectionBound.bindStatesForSelectionBox();
            }
            if (!objSelectOptions || objSelectOptions && !objSelectOptions.suppressEvent) {
                this.trigger("select", this, arguments);
            }
        },

        /**
         * Selects the current shape.
         * @method deselect
         * @params {Object} objSelectOptions -- Optional data for the changes in selection type.
         * @params {Object} objSelectOptions.suppressEvent -- Suppresses the event that is fired after the deselection of the shape.
         */
        "deselect": function(objSelectOptions) {
            var shapeGroup = this._intermediatePath,
                data = this.model.getData();

            if (shapeGroup) {
                shapeGroup.strokeColor = data.strStrokeColor;
                if (data.strStrokeColor === "no-stroke") {
                    shapeGroup.strokeColor = null;
                }
                shapeGroup.strokeWidth = data.nStrokeWidth;
                data.bSelected = false;

                if (this._selectionBound) {
                    this._selectionBound.remove();
                    this._selectionBound = null;
                }

                this.setMode(WhiteboardTool.Views.BaseShape.Mode.None);
                if (!objSelectOptions || objSelectOptions && !objSelectOptions.suppressEvent) {
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
                data = this.model.getData(),
                boundingBox = this.model.getBoundingBox(),
                box = new WhiteboardTool.Models.Rect(),
                strokeWidth = Number(data.nStrokeWidth),
                xFactor = null,
                yFactor = null,
                allowRotate = null,
                allowResize = null;

            if (!data.bAllowSelectionBound || !shapeGroup) {
                return;
            }

            if (!this._selectionBound) {
                this._selectionBound = new WhiteboardTool.Views.SelectionRect();
                this.listenTo(this._selectionBound, "activate-layer", this.triggerActivateLayer);
            }

            allowRotate = args !== void 0 && args.rotateHandle !== void 0 ? args.rotateHandle : data.bAllowRotate;
            allowResize = args !== void 0 && args.resizeHandle !== void 0 ? args.resizeHandle : data.bAllowResize;
            if (data.nType === WhiteboardTool.Views.ShapeType.LineSegment) {
                this._selectionBound.setOptions({
                    "boundingBox": boundingBox.clone(),
                    "flip": this.model.getFlipData(),
                    "nRotation": data.nRotation,
                    "rotationReferencePoint": this.model.getRotationPoint(),
                    "bAllowRotate": allowRotate,
                    "bAllowResize": allowResize,
                    "nType": data.nType,
                    "bAllowSelectionBound": this.isMultipleSelection
                });
                this._selectionBound.resize(boundingBox.clone());
                return;
            }
            //Manipulate Shape Stroke Bounds so as to not clash with the shape boundary.
            if (boundingBox.width < 0) {
                xFactor = -strokeWidth;
                if (typeof this._maxWidth !== "undefined" && this._maxWidth > 0) {
                    this._maxWidth = -this._maxWidth;
                }
            }
            if (boundingBox.height < 0) {
                yFactor = -strokeWidth;
                if (typeof this._maxHeight !== "undefined" && this._maxHeight > 0) {
                    this._maxHeight = -this._maxHeight;
                }
            }

            box.x = boundingBox.x - xFactor - Math.abs(strokeWidth / 2);
            box.width = typeof this._maxWidth !== "undefined" ? this._maxWidth + xFactor * 2 + Math.abs(strokeWidth) : boundingBox.width + xFactor * 2 + Math.abs(strokeWidth);

            box.y = boundingBox.y - yFactor - Math.abs(strokeWidth / 2);
            box.height = typeof this._maxHeight !== "undefined" ? this._maxHeight + yFactor * 2 + Math.abs(strokeWidth) : boundingBox.height + yFactor * 2 + Math.abs(strokeWidth);

            if (this._hasHorizontalSpacing === -1) {
                if (this.model.getFlipData().x !== -1) {
                    box.x += this._xDiff * 2;
                    box.width -= this._xDiff * 2;
                } else {
                    box.x -= this._xDiff * 2;
                    box.width += this._xDiff * 2;
                }
            }
            if (this._hasVerticalSpacing === -1) {
                if (this.model.getFlipData().y !== -1) {
                    box.y += this._yDiff / 2;
                    box.height -= this._yDiff / 2;
                } else {
                    box.y -= this._yDiff / 2;
                    box.height += this._yDiff / 2;
                }
            }
            this._selectionBound.setOptions({
                "boundingBox": box.clone(),
                "flip": this.model.getFlipData(),
                "nRotation": data.nRotation,
                "rotationReferencePoint": this.model.getRotationPoint(),
                "bAllowRotate": allowRotate,
                "bAllowResize": allowResize,
                "nType": data.nType
            });
            this._selectionBound.resize(box.clone());
        },
        "triggerActivateLayer": function() {
            this.trigger("activate-layer", arguments[0]);
        },
        /**
         * Translates the fedpoints as per the difference point passed to it.
         * @method translateSelectionBounds
         * @params {Object} objPoint that is used to calculate the translated fedpoints.
         */
        "translateSelectionBounds": function(objPoint) {
            var fedPoints = this.model.getFedPoints(),
                fedPointsLen = fedPoints.length,
                backupPoints = this.model.getBackupPoints(),
                fedPointsCounter;

            // Cloning the array.
            fedPoints = fedPoints.slice(0);

            // Apply the actual translation occurred between hit and current point so far.
            for (fedPointsCounter = 0; fedPointsCounter < fedPointsLen; fedPointsCounter++) {
                fedPoints[fedPointsCounter].x = backupPoints[fedPointsCounter].x + objPoint.x;
                fedPoints[fedPointsCounter].y = backupPoints[fedPointsCounter].y + objPoint.y;
            }
            return fedPoints;
        },

        /**
         * Clears the last shape group drawn.
         * @method clearTrail
         */
        "clearTrail": function() {
            // Clear old intermediate drawings
            this.clearIntermediatePath();
        },

        /**
         * Clears the intermediate path.
         * @method clearIntermediatePath
         */
        "clearIntermediatePath": function() {
            // Clear old intermediate drawings
            if (this._intermediatePath && this._intermediatePath.hitPath) {
                this._intermediatePath.hitPath.removeSegments();
                this._intermediatePath.hitPath.remove();
                this._intermediatePath.hitPath = null;
            }
            if (this._intermediatePath) {
                this._intermediatePath.remove();
                this._intermediatePath = null;
            }

            if (this.arrowPath) {
                this.arrowPath.remove();
                this.arrowPath = null;
            }
        },

        /**
        Base draw function, that clears the last shapeGroup trail.
        * @method draw
        */
        "draw": function() {
            this.clearTrail();
        },

        /**
         * Checks to see if the shape is selected.
         * @method isSelected
         * @returns Returns true if shape is selected else returns false.
         */
        "isSelected": function() {
            return this.model.getData().bSelected;
        },

        "parseData": function(dataToParse, isGraphCoord) {
            if (dataToParse) {
                isGraphCoord = typeof isGraphCoord === "boolean" ? isGraphCoord : true;
                this.model.parseData(dataToParse, isGraphCoord);
                if (dataToParse.shapeData && dataToParse.shapeData.bSelected) {
                    this.select();
                }
            }
        },

        /**
         * Saves previous and current state information while applying the new set of data to shape.
         * @method applyOptions , apply given style to shape.
         * @param {Object} objOptions, style to be applied to given object.
         * @param {Boolean} dontStorePrvState, prevent function from updating previous save sate.
         */
        "applyOptions": function(objOptions, dontStorePrvState) {
            if (typeof objOptions.actionName === "undefined") {
                return;
            }
            var oldStateData = {},
                newStateData,
                UndoRedoAction = WhiteboardTool.Views.UndoRedoActions;

            oldStateData = this.model.getCloneData();
            oldStateData.id = this.getId();
            if (!dontStorePrvState) {
                this._savePreviousState(oldStateData);
            }

            switch (objOptions.actionName) {
                case UndoRedoAction.Color:
                    // Set the new options passed
                    this.setOptions(objOptions);
                    break;

                case UndoRedoAction.Stroke:
                    // Set the new options passed
                    this.setOptions(objOptions);
                    break;

                case UndoRedoAction.ColorAndStroke:
                    // Set the new options passed
                    this.setOptions(objOptions);
                    break;

            }

            newStateData = this.model.getCloneData();
            switch (objOptions.actionName) {
                case UndoRedoAction.ColorAndStroke:
                    if (typeof objOptions.nStrokeWidth !== "undefined") { //Update shape bounds only when stroke width changes.
                        this.drawBounds();
                    }
                    break;

                case UndoRedoAction.Transform:
                    this.model.setRotationPoint(this.model.getRotationReferencePoint());
                    this.rotate(objOptions.nRotation);
                    break;
            }

            newStateData.id = this.getId();
            this._saveCurrentState(newStateData);

        },

        /**
         * Sets options to shape. Like color information, stroke sizing, etc...
         * @method setOptions, function set shapes properties.
         * @param {Object} objOptions, shape property object.
         */
        "setOptions": function(objOptions) {
            this.model.setOptions(objOptions);
            this.setViewOptions(objOptions);
            this.applyStyle(this.model.get("_data"));
        },

        "setViewOptions": function(objOptions) {
            if (objOptions && objOptions.rotationReferencePoint) {
                this.model.setRotationPoint(objOptions.rotationReferencePoint);
            }
            if (objOptions && typeof objOptions.id !== "undefined") {
                this.setId(objOptions.id);
            }
            if (objOptions && objOptions.renderData && objOptions.renderData.dataPoints) {
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
            if (this.arrowPath) {
                this.applyStyleToPathGroup(this.arrowPath, data);
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
                if (styleData.strStrokeColor !== null) {
                    pathGroup.strokeColor = styleData.strStrokeColor;
                }
                if (styleData.nStrokeWidth !== null) {
                    pathGroup.strokeWidth = styleData.nStrokeWidth;
                }
                if (styleData.strFillColor !== null) {
                    pathGroup.fillColor = styleData.strFillColor;
                }
                if (styleData.nFillAlpha !== null) {
                    if (this.model.getData().nType === WhiteboardTool.Views.ShapeType.Image) {
                        pathGroup.opacity = styleData.nFillAlpha;
                    }
                    if (pathGroup.fillColor) {
                        pathGroup.fillColor.alpha = styleData.nFillAlpha;
                    }
                }
                /*We consider `no-fill` as value `null`.*/
                if (styleData.strFillColor === "no-fill") {
                    if (this.model.getData().nType !== WhiteboardTool.Views.ShapeType.Pencil) {
                        pathGroup.fillColor = "#fff";
                        pathGroup.fillColor.alpha = 0;
                    } else {
                        pathGroup.fillColor = null;
                    }
                }
                /*We consider `no-stroke` as value `null`.*/
                if (styleData.strStrokeColor === "no-stroke") {
                    pathGroup.strokeColor = null;
                }
            }
        },

        /**
         * Translates the current instance by specified difference.
         * @method translate
         * @param {Object} objPoint, value by which shape to be translate.
         * @param {Boolean} bDraw, check for shape redraw.
         */
        "translate": function(objPoint, bDraw) {
            var boundingBox = this.model.getBackupBoundingBox();

            if (boundingBox) {
                boundingBox = boundingBox.clone();
            } else {
                return;
            }

            boundingBox.x += objPoint.x;
            boundingBox.y += objPoint.y;

            this.model.setBoundingBox(boundingBox.clone());
            this.model.setRotationPoint(this.model.getRotationReferencePoint());

            if (bDraw) {
                this.draw();
            }
        },

        /**
         * Applies the translation occurred by moving the shape so far. Take internal hitPoint and CurPoint to calculate the different of translation.
         * @method _applyTranslation
         * @param {Object} eventObject, Jquery event object.
         * @param {Number} translateX, optional, x translate factor.
         * @param {Number} translateY, optional, y translate factor
         * @param {Boolean} isPan, optional, to check if panning.
         */
        "_applyTranslation": function(eventObject, translateX, translateY, isPan) {
            var hitPoint = this._hitPoint,
                curPoint = this._curPoint,
                diffX, diffY,
                bounds,
                deltaX = null,
                deltaY = null;

            //as canvas drag hitPoint and curPoint is not defined.
            if (hitPoint && curPoint) {
                diffX = curPoint.x - hitPoint.x;
                diffY = curPoint.y - hitPoint.y;
            }

            if (typeof translateX !== "undefined" && typeof translateY !== "undefined") {
                diffX = translateX;
                diffY = translateY;
            }
            if (this.model.getData().nType === WhiteboardTool.Views.ShapeType.Pencil) {
                if (eventObject && eventObject.event && eventObject.event.type !== "mouseup" || typeof translateX !== "undefined" && typeof translateY !== "undefined") {
                    deltaX = typeof translateX !== "undefined" ? translateX : eventObject.delta.x;
                    deltaY = typeof translateY !== "undefined" ? translateY : eventObject.delta.y;

                    bounds = this.model.getBoundingBox();
                    bounds.x += deltaX;
                    bounds.y += deltaY;
                    this.model.setBoundingBox(bounds);
                }
            }
            this.translate({
                "x": diffX,
                "y": diffY
            }, true, eventObject, isPan);
        },


        "updateBoundingBoxFromGridsize": function() {
            if (this.model.isScalable()) {
                if (!this.model.getRenderData()) {
                    return;
                }
                var renderData = this.model.getRenderData(),
                    canvasSize = WhiteboardTool.Models.Transform.toCanvasSize({
                        "x": renderData.gridSize.width,
                        "y": renderData.gridSize.height
                    }),
                    backupCanvasSize = WhiteboardTool.Models.Transform.toCanvasSize({
                        "x": renderData.backupGridSize.width,
                        "y": renderData.backupGridSize.height
                    });

                renderData.boundingBox.width = canvasSize.x;
                renderData.boundingBox.height = canvasSize.y;

                renderData.backupBoundingBox.width = backupCanvasSize.x;
                renderData.backupBoundingBox.height = backupCanvasSize.y;
            }
            this.updateRotationPoint();
            this.draw();
        },

        "updateRotationPoint": function() {
            this.model.setRotationPoint(this.model.getRotationReferencePoint());
        },

        "_applyResize": function(incrX, incrY) {
            var hitPoint = this._hitPoint,
                curPoint = this._curPoint,
                resizeWidth, resizeHeight, arrNewPoints,
                backupBoundingBox = this.model.getBackupBoundingBox(),
                data = this.model.getData(),
                flipData = this.model.getFlipData(),
                angle = data.nRotation,
                refPoint = null,
                resizeHitName = this._resizeHitName,
                yDiff, xDiff,
                changeY, changeX,
                box = new WhiteboardTool.Models.Rect();

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
                    arrNewPoints = this.model.getRotatedPoints([hitPoint.clone(), curPoint.clone()], refPoint, -angle);
                    resizeWidth = arrNewPoints[1].x - arrNewPoints[0].x;
                    resizeHeight = arrNewPoints[1].y - arrNewPoints[0].y;
                }
            }

            if (resizeHitName && resizeHitName.item && resizeHitName.item.cornerName) {
                switch (resizeHitName.item.cornerName) {
                    case "top-left":
                        box.x = backupBoundingBox.x + resizeWidth;
                        box.y = backupBoundingBox.y + resizeHeight;
                        box.width = backupBoundingBox.width + -1 * resizeWidth;
                        box.height = backupBoundingBox.height + -1 * resizeHeight;
                        changeX = true;
                        changeY = true;
                        if (data.nType === WhiteboardTool.Views.ShapeType.Hexagon) {
                            this._hasHorizontalSpacing = -1;
                        } else if (data.nType === WhiteboardTool.Views.ShapeType.Triangle || data.nType === WhiteboardTool.Views.ShapeType.Pentagon) {
                            this._hasVerticalSpacing = -1;
                        }
                        break;
                    case "bottom-left":
                        if (data.nType === WhiteboardTool.Views.ShapeType.Hexagon) {
                            this._hasHorizontalSpacing = -1;
                        } else if (this._hasVerticalSpacing === -1 && data.nType === WhiteboardTool.Views.ShapeType.Triangle ||
                            this._hasVerticalSpacing === -1 && data.nType === WhiteboardTool.Views.ShapeType.Pentagon) {
                            this._hasVerticalSpacing = null;
                            //Change y-coordinate of backup bounding box depending on flipData.
                            if (flipData.y !== -1) {
                                backupBoundingBox.y += this._yDiff / 2;
                            } else {
                                backupBoundingBox.y -= this._yDiff / 2;
                            }
                            this.model.setBackupBoundingBox(backupBoundingBox.clone());
                        }
                        box.x = backupBoundingBox.x + resizeWidth;
                        box.y = backupBoundingBox.y;
                        box.width = backupBoundingBox.width + -1 * resizeWidth;
                        box.height = backupBoundingBox.height + resizeHeight;
                        changeX = true;
                        break;
                    case "top-right":
                        if (this._hasHorizontalSpacing === -1 && data.nType === WhiteboardTool.Views.ShapeType.Hexagon) {
                            this._hasHorizontalSpacing = null;
                            backupBoundingBox.x += this._xDiff * 2;
                            this.model.setBackupBoundingBox(backupBoundingBox.clone());
                        } else if (data.nType === WhiteboardTool.Views.ShapeType.Triangle || data.nType === WhiteboardTool.Views.ShapeType.Pentagon) {
                            if (this._hasVerticalSpacing === null) {
                                this._hasVerticalSpacing = -1;
                            }
                        }
                        box.x = backupBoundingBox.x;
                        box.y = backupBoundingBox.y + resizeHeight;
                        box.width = backupBoundingBox.width + resizeWidth;
                        box.height = backupBoundingBox.height + -1 * resizeHeight;
                        changeY = true;
                        break;
                    case "bottom-right":
                        if (this._hasHorizontalSpacing === -1 && data.nType === WhiteboardTool.Views.ShapeType.Hexagon) {
                            this._hasHorizontalSpacing = null;
                            backupBoundingBox.x += this._xDiff * 2;
                            this.model.setBackupBoundingBox(backupBoundingBox.clone());
                        } else if (this._hasVerticalSpacing === -1 && data.nType === WhiteboardTool.Views.ShapeType.Triangle ||
                            this._hasVerticalSpacing === -1 && this.model.getData().nType === WhiteboardTool.Views.ShapeType.Pentagon) {
                            this._hasVerticalSpacing = null;
                            //Change y-coordinate of backup bounding box depending on flipData.
                            if (flipData.y !== -1) {
                                backupBoundingBox.y += this._yDiff / 2;
                            } else {
                                backupBoundingBox.y -= this._yDiff / 2;
                            }
                            this.model.setBackupBoundingBox(backupBoundingBox.clone());
                        }
                        box.x = backupBoundingBox.x;
                        box.y = backupBoundingBox.y;
                        box.width = backupBoundingBox.width + resizeWidth;
                        box.height = backupBoundingBox.height + resizeHeight;
                        break;
                }
                //Returns if box height or width falls below minimum values.
                if (Math.abs(box.height) < data.minHeight || Math.abs(box.width) < data.minWidth) {
                    return;
                }

                if (resizeHitName.item.cornerName && data.nType === WhiteboardTool.Views.ShapeType.Image) {
                    this.model.setOptions({
                        "scaleFactor": {
                            "x": box.width / this._initialPosition.width,
                            "y": box.height / this._initialPosition.height
                        }
                    });
                }
            }

            this.flip(this.model.getFlipDirection(box.clone()), false);
            this.resize(box.clone(), false);
            if (changeX) {
                xDiff = this.model.getBoundingBox().x + this.model.getBoundingBox().width - (backupBoundingBox.x + backupBoundingBox.width);
                box.x -= xDiff;
            }
            if (changeY) {
                yDiff = this.model.getBoundingBox().y + this.model.getBoundingBox().height - (backupBoundingBox.y + backupBoundingBox.height);
                if (this._hasVerticalSpacing !== -1) {
                    box.y -= yDiff;
                } else {
                    box.y -= yDiff;
                    box.height += yDiff;
                }
            }

            this.model.setBoundingBox(box.clone());
            this.draw(true);
        },

        "resize": function(boundingBox, bDraw) {
            this.model.setBoundingBox(boundingBox);
            if (bDraw) {
                this.draw();
            }
        },

        "flip": function(flipDirection, bDraw) {
            this.model.setFlipData(flipDirection);
            if (bDraw) {
                this.draw();
            }
        },

        "_applyRotation": function() {
            if (!this.model.getData().bAllowRotate) {
                return;
            }

            var lastRotationPoint = new WhiteboardTool.Models.Point(this._lastRotationPoint),
                curPoint = new WhiteboardTool.Models.Point(this._curPoint),
                angle;

            angle = this.getAngle(lastRotationPoint, curPoint);

            this.rotate(angle);
        },

        /**
         * Rotate the shape.
         * @method rotate
         * @params {Number} angle, value by which shape to be rotate.
         * @params {Boolean} bDraw, check for shape redraw.
         */
        "rotate": function(angle, bDraw) {
            var data = this.model.getData();
            this.model.setOptions({
                "nRotation": (Number(data.nRotation) + Number(angle)) % 360 //360 for 2*PI
            });
            //this.trigger("object:rotate");
            if (bDraw || typeof bDraw === "undefined") {
                this.draw();
            }

        },

        /**
         * Returns the angle between the point passed to it.
         * @method getAngle
         * @params {Object} PointA the first point
         * @params {Object} PointB the second point
         * @returns {Number} The angle
         */
        "getAngle": function(pointA, pointB) {
            var angle, refPoint,
                boundingBox = this.model.getBoundingBox();
            pointA = new WhiteboardTool.Models.Point(pointA);
            pointB = new WhiteboardTool.Models.Point(pointB);
            //Here, Refpoint is the center point of bounding box after flip
            refPoint = {
                "x": boundingBox.x + boundingBox.width / 2,
                "y": boundingBox.y + boundingBox.height / 2
            };

            angle = Math.atan2(pointB.y - refPoint.y, pointB.x - refPoint.x) - Math.atan2(pointA.y - refPoint.y, pointA.x - refPoint.x);
            angle = angle * 180 / Math.PI; //180 for PI

            this._lastRotationPoint = new WhiteboardTool.Models.Point(pointB);
            return angle;
        },

        /**
         * Returns bounding rect of the current instance.
         * @method getBoundingRect
         */
        "getBoundingRect": function() {
            var pathGroup = null;
            if (this._intermediatePath) {
                pathGroup = this._intermediatePath;
            }
            return pathGroup.strokeBounds;
        },

        /**
         * Returns the style applicable on shape object depending on param passed. If true it returns style for selected shape else for normal shape.
         * @method _getApplicableStrokeStyle , function return stroke style of object.
         * @private
         */
        "_getApplicableStrokeStyle": function() {
            var applicableData = {},
                data = this.model.getData();
            applicableData.strStrokeColor = data.strStrokeColor;
            applicableData.nStrokeWidth = data.nStrokeWidth;
            if (data.nType === WhiteboardTool.Views.ShapeType.LineSegment) {
                applicableData.strFillColor = "no-fill";
                applicableData.nFillAlpha = null;
                this.model.setOptions(applicableData);
            } else {
                applicableData.strFillColor = data.strFillColor;
                applicableData.nFillAlpha = data.nFillAlpha;
            }
            return applicableData;
        },

        "getMode": function() {
            return this._mode;
        },

        "setMode": function(objMode) {
            if (objMode) {
                this._mode = objMode;
            }
        },

        "destroy": function() {

            this.model.destroy();
            this.remove();
        },

        "remove": function(bSaveState) {
            var oldStateData = {},
                newStateData = {};

            if (bSaveState) {
                // Undo redo state saves
                oldStateData = this.model.getCloneData();
                oldStateData = this.getViewOptions(oldStateData);
                oldStateData.id = this.getId();

                this._savePreviousState(oldStateData);
            }
            this.clearTrail();
            // Clear the intermediate paths
            this.clearIntermediatePath();

            if (this._selectionBound) {
                this._selectionBound.remove();
                this._selectionBound = null;
            }

            if (bSaveState) {
                newStateData.bRemove = true;
                newStateData.id = this.getId();
                this._saveCurrentState(newStateData);
            }

        },

        "getSyncData": function() {
            var syncData = this.model.getSyncData();
            //remove base64 for text, while saving data
            if (this.model.get('_data').nType === WhiteboardTool.Views.ShapeType.Text && syncData && syncData.shapeData && syncData.shapeData.imageData &&
                syncData.shapeData.imageData.base64) {
                syncData.shapeData.imageData.base64 = "";
            }
            syncData.id = this.cid;
            return syncData;
        },

        "applyRotation": function(pathGroup) {
            pathGroup = pathGroup || this._intermediatePath;
            if (pathGroup) {
                pathGroup.rotate(this.model.getData().nRotation, this.model.getRotationPoint());
            }
        },

        "applyFlip": function(pathGroup) {
            var flipData = this.model.getFlipData(),
                boundingBox = this.model.getBoundingBox();

            pathGroup = pathGroup || this._intermediatePath;

            pathGroup.scale(flipData.x, flipData.y, {
                "x": boundingBox.x,
                "y": boundingBox.y
            });
        },
        /*************************************************************************************
        Undo redo state saves, getters and more...
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
            var currentState = null;
            if (data) {
                currentState = this._getCurrentState();
                if (typeof data.bSelected !== "undefined") {
                    currentState.shapeData.bSelected = data.bSelected;
                }
            }
        },

        "_getActionName": function() {
            return this._undoRedoState.actionName;
        },

        "getUndoRedoState": function() {
            return this._undoRedoState;
        },

        "updatePathZindex": function(zIndex) {
            if (typeof zIndex !== "undefined" && zIndex !== null) {
                this.model.setOptions({
                    "zIndex": zIndex
                });
            }

            var paperScope = WhiteboardTool.Views.PaperScope,
                intermediatePath = this._intermediatePath,
                data = this.model.get("_data"),
                shapeType = data.nType;
            zIndex = this.model.get("_data").zIndex;
            if (intermediatePath && typeof zIndex !== "undefined") {
                if (shapeType !== WhiteboardTool.Views.ShapeType.Image && shapeType !== WhiteboardTool.Views.ShapeType.BackgroundImage) {
                    this.trigger("activate-layer", WhiteboardTool.Models.Sketchpad.LAYERS_NAME.SHAPE);
                }
                paperScope.project.activeLayer.insertChild(zIndex, intermediatePath);
            }
        }
    }, {
        "Mode": {
            "None": 0,
            "Select": 1,
            "Resize": 2,
            "Rotate": 3
        }
    });

    //Base shape view end **********************************************
})(window.MathUtilities);
