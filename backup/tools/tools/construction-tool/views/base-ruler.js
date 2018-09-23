/*globals paper,geomFunctions*/
(function(MathUtilities) {
    "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                           Base-ruler                            */
    /*******************************************************************/
    /**
     * A customized Backbone.View that represents BaseRuler.
     * @class MathUtilities.Tools.ConstructionTool.Views.BaseRuler
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Views.BaseShape
     */
    ConstructionTool.Views.BaseRuler = Backbone.View.extend({
        /**
         * Store model for BaseRuler view.
         * @property model
         * @type {object}
         */
        "model": null,

        "_hitPointOnLine": null,

        "_curPointOnLine": null,

        /**
         * Store ruler enable state
         * true if enable,else false
         * @property _isRulerEnable
         * @private
         */
        "_isRulerEnable": null,


        /**
         * Stores the temporary undo redo states.
         * @property _undoRedoStates
         * @type {Object}
         * @private
         */
        "_undoRedoState": null,

        /**
         * Initializer of BaseRuler view.
         * @private
         * @method initialize
         */
        "initialize": function() {
            this.initModel();
            this.enableDisableRuler(true);

            this._undoRedoState = {};
            this._undoRedoState.oldState = {};
            this._undoRedoState.newState = {};
        },

        /**
         * Initialize model of base-ruler view.
         * @model initModel
         */
        "initModel": function initModel() {
            this.model = new ConstructionTool.Models.BaseRuler();
        },

        /**
         * Return id of view
         * @method getId
         * @return {String} id of view
         */
        "getId": function() {
            return this.cid;
        },

        /**
         * Set id of view
         * @method setId
         * @param {String} id of view
         */
        "setId": function(id) {
            this.cid = id;
        },

        /**
         * Set view data.
         * this function is used for retriving old state.
         * @method setViewOptions
         * @param {object} view data
         */
        "setViewOptions": function(objOptions) {
            if (typeof objOptions !== "undefined" && typeof objOptions.id !== "undefined") {
                this.setId(objOptions.id);
            }
        },

        "processTouchStart": function() {
            var oldState = {};

            // Undo redo state saves
            oldState = this.model.getSyncData();
            oldState.id = this.getId();
            this._savePreviousState(oldState);
        },

        "processTouchEnd": function() {
            var curState = {};

            // Undo redo state saves
            curState = this.model.getSyncData();
            curState.id = this.getId();
            this._saveCurrentState(curState);
        },

        "_bindEvents": function _bindEvents() {
            var path = this.model.get("_path");

            path.onMouseEnter = $.proxy(this._onPathMouseEnter, this);
            path.onMouseLeave = $.proxy(this._onPathMouseLeave, this);
            path.onMouseDown = $.proxy(this._onPathMouseDown, this);
            path.onMouseDrag = $.proxy(this._onPathMouseDrag, this);
        },

        "parseData": function(dataToParse) {
            if (dataToParse) {
                this.model.parseData(dataToParse);
            }
        },

        "_onPathMouseDown": function _onPathMouseDown(event) {
            //Return when right click
            if (event.event.which === 3 || typeof event.event.changedTouches !== "undefined" && event.event.changedTouches.length > 1) {
                return;
            }
            var pathName = event.target.name;

            if (this._isRulerEnable === true) {
                this._onMouseDown(event);
                this.on("pencilDrag", this._onPencilMove);
                this.on("pencilPositionButtonDrag", this._onPencilMove);
                this.on("rotateButtonDrag", this._onRotateButtonDrag);
                this.on("rulerMoveButtonDrag", this._onRulerMoveButtonDrag);

                this.on("rulerResizeButtonDrag", this._onRulerResize);
                this.on("pathMouseUp", this._onPathMouseUp);

                switch (pathName) {
                    case "pencil":
                        this.trigger("ruler-pencil-mouse-down");
                        this.trigger("rulerPencilMouseDown");
                        break;
                    case "rotate-button":
                        this.trigger("ruler-rotate-handle-mouse-down");
                        break;
                    case "pencil-position-button":
                        this.trigger("pencil-handle-buttton-mouse-down");
                        break;
                    case "ruler-move-button":
                        this.trigger("ruler-move-handle-mouse-down");
                        break;
                    case "ruler-resize-button":
                        this.trigger("ruler-resize-handler-mouse-down");
                        break;
                    default:
                        break;
                }
            }
        },

        "_onPathMouseDrag": function _onPathMouseDrag(event) {
            if (event.delta.x === 0 && event.delta.y === 0) {
                return;
            }
            var pathName = event.target.name;

            switch (pathName) {
                case "pencil":
                    this.trigger("pencilDrag", event);
                    break;
                case "rotate-button":
                    this.trigger("rotateButtonDrag", event);
                    break;
                case "pencil-position-button":
                    this.trigger("pencilPositionButtonDrag", event);
                    break;
                case "ruler-move-button":
                    this.trigger("rulerMoveButtonDrag", event);
                    break;
                case "ruler-resize-button":
                    this.trigger("rulerResizeButtonDrag", event);
                    break;
                default:
                    break;
            }
        },

        "_onPathMouseEnter": function _onPathMouseEnter(event) {
            var pathName = event.target.name;

            if (this._isRulerEnable === true) {
                switch (pathName) {
                    case "pencil":
                        this.trigger("pencil-handle-mouse-enter", arguments);
                        break;
                    case "rotate-button":
                        this.trigger("ruler-rotate-handle-mouse-enter", arguments);
                        break;
                    case "pencil-position-button":
                        this.trigger("ruler-pencil-mouse-enter", arguments);
                        break;
                    case "ruler-move-button":
                        this.trigger("ruler-move-handle-mouse-enter", arguments);
                        break;
                    case "ruler-resize-button":
                        this.trigger("ruler-resize-handler-mouse-enter");
                        break;
                    default:
                        break;
                }
            }
        },

        "_onPathMouseLeave": function _onPathMouseLeave(event) {
            var pathName = event.target.name;

            switch (pathName) {
                case "pencil":
                    this.trigger("pencil-handle-mouse-leave", arguments);
                    break;
                case "rotate-button":
                    this.trigger("ruler-rotate-handle-mouse-leave", arguments);
                    break;
                case "pencil-position-button":
                    this.trigger("ruler-pencil-mouse-leave", arguments);
                    break;
                case "ruler-move-button":
                    this.trigger("ruler-move-handle-mouse-leave", arguments);
                    break;
                case "ruler-resize-button":
                    this.trigger("ruler-resize-handler-mouse-leave", arguments);
                    break;
                default:
                    break;
            }
        },

        "_onPathMouseUp": function _onPathMouseUp(event) {
            this.off("pencilDrag", this._onPencilMove);
            this.off("pencilPositionButtonDrag", this._onPencilMove);
            this.off("rotateButtonDrag", this._onRotateButtonDrag);
            this.off("rulerMoveButtonDrag", this._onRulerMoveButtonDrag);
            this.off("rulerResizeButtonDrag", this._onRulerResize);
            this.off("pathMouseUp", this._onPathMouseUp);

            this.updateAccBoundingBox();
            this.trigger("ruler-mouse-up", event, this);

            this._rotationIntermediatePoint = null;
        },

        "_onMouseDown": function _onMouseDown(event) {
            //Return when right click
            if (event.event.which === 3 || typeof event.event.changedTouches !== "undefined" && event.event.changedTouches.length > 1) {
                return;
            }

            this.isMouseDown = true;
            this._rotationIntermediatePoint = event.point;
            this._hitPoint = event.point;
            this._hitPointOnLine = this._getPointOnLine(event.point);
            this._intermediatePointOnLine = this._hitPointOnLine;
        },

        "_onPencilMove": function _onPencilMove(event, delta) {
            var curPointOnLine = null,

                renderData = this.model.get("_renderData"),

                angle = renderData.rotateAngle,

                pencilGrp = this.model.get("_path").children["pencil-helper"],
                leftArrow = pencilGrp.children["left-arrow"],
                rightArrow = pencilGrp.children["right-arrow"],


                positionerRotatedPositionOnLine = null,
                pencilGrpPosition = pencilGrp.position,


                //positioner top points
                positionerPosition = this.model.getPencilPositionerPosition(),
                positionerRotatedPosition = this.model._getRotatedPointAboutRuler(positionerPosition), //positioner top-left after rotation

                positionerRotatedCurPosition = null,
                positionerCurPosition = null,
                newCurPoint = curPointOnLine,
                newRenderData = {};

            if (typeof delta === "undefined") {
                curPointOnLine = this._getPointOnLine(new ConstructionTool.Models.Point(event.point.x, event.point.y));

                delta = {
                    "x": curPointOnLine.x - this._intermediatePointOnLine.x,
                    "y": curPointOnLine.y - this._intermediatePointOnLine.y
                };

                newCurPoint = curPointOnLine;
            }

            positionerRotatedCurPosition = new ConstructionTool.Models.Point(positionerRotatedPosition.x + delta.x, positionerRotatedPosition.y + delta.y);

            positionerRotatedPositionOnLine = this._getPointOnLine(positionerRotatedPosition);
            positionerRotatedPositionOnLine.x += delta.x;
            positionerRotatedPositionOnLine.y += delta.y;

            pencilGrpPosition.x += delta.x;
            pencilGrpPosition.y += delta.y;
            positionerCurPosition = this.model._getRotatedPointAboutRuler(positionerRotatedCurPosition, -angle);

            paper.view.draw();

            this.model.setPencilPositionerPosition(positionerCurPosition.clone());
            newRenderData._isArrowVisible = {
                "left": leftArrow.visible,
                "right": rightArrow.visible
            };

            this.model.setOptions(newRenderData);

            this._updateReferencePoint();

            this._curPointOnLine = newCurPoint;
            this._intermediatePointOnLine = newCurPoint;

            this.trigger("ruler-pencil-mouse-drag", arguments);
        },

        "getSyncData": function() {
            var data = this.model.getSyncData();
            data.id = this.cid;
            return data;
        },

        "_getPointOnLine": function(point) {
            var renderData = this.model.get("_renderData"),
                rulerTopLeft = this.model.getRulerTopLeft(),
                rulerProp = renderData._rulerProp,
                rulerTopRight = new ConstructionTool.Views.PaperScope.Point(rulerTopLeft.x + rulerProp.width, rulerTopLeft.y),
                p0 = this.model._getRotatedPointAboutRuler(rulerTopLeft), //ruler top-left after rotation
                p1 = this.model._getRotatedPointAboutRuler(rulerTopRight), //ruler top-right after rotation
                a = p0.y - p1.y,
                b = p1.x - p0.x,
                c = -b * p0.y - a * p0.x,
                curPoint = new ConstructionTool.Views.PaperScope.Point(geomFunctions.getProjectionOfPointOnLine(point.x, point.y, a, b, c));

            return curPoint;
        },

        "_onRulerMoveButtonDrag": function _onRulerMoveButtonDrag(event) {
            if (event.event.which === 3 || typeof event.event.changedTouches !== "undefined" && event.event.changedTouches.length > 1) {
                return;
            }

            if (this.isMouseDown === true) {
                this._applyTranslation(event);
            }
            this.trigger("ruler-move-handle-mouse-drag", arguments);
        },

        "_onRotateButtonDrag": function _onRotateButtonDrag(event) {
            if (event.event.which === 3 || typeof event.event.changedTouches !== "undefined" && event.event.changedTouches.length > 1) {
                return;
            }
            if (this.isMouseDown === true) {
                this._applyRotation(event);
            }
        },

        /**
         * Applies the translation occured by moving the helper so far.
         * @private
         * @method _applyTranslation
         */
        "_applyTranslation": function(event) {
            var diffX = 0,
                diffY = 0;

            if (typeof event !== "undefined") {
                diffX = event.delta.x;
                diffY = event.delta.y;
            }
            this.translate({
                "x": diffX,
                "y": diffY
            }, true);
        },

        /**
         * Translates the current instance by specified difference.
         * @params {Object} objPoint. The offset to translate the item by.
         * @method translate
         */
        "translate": function(objPoint, bDraw) {
            var pathPosition = this.model.get("_path").position,
                rulerTopLeft = this.model.getRulerTopLeft(),
                positionerPosition = this.model.getPencilPositionerPosition(),
                rulerExtremes = this.model.getRulerExtremes(),
                rulerCenter = this.model.getRulerCenter(),
                pencilTip = this.model.getPencilTip(),
                newRenderData = {};

            if (bDraw === true) {
                pathPosition.x += objPoint.x;
                pathPosition.y += objPoint.y;

                //Update Ruler extreme points
                rulerExtremes.left.x += objPoint.x;
                rulerExtremes.left.y += objPoint.y;
                rulerExtremes.right.x += objPoint.x;
                rulerExtremes.right.y += objPoint.y;

                rulerCenter.x += objPoint.x;
                rulerCenter.y += objPoint.y;
                this.model.setRulerCenter(rulerCenter);

                if (typeof pencilTip !== "undefined") {
                    pencilTip.x += objPoint.x;
                    pencilTip.y += objPoint.y;
                    this.model.setPencilTip(pencilTip);
                }
            }
            newRenderData.rulerExtremes = rulerExtremes;
            newRenderData.rulerTopLeft = new ConstructionTool.Models.Point({
                "x": rulerTopLeft.x + objPoint.x,
                "y": rulerTopLeft.y + objPoint.y
            });
            newRenderData.pencilPositionerPosition = new ConstructionTool.Models.Point({
                "x": positionerPosition.x + objPoint.x,
                "y": positionerPosition.y + objPoint.y
            });
            this.model.setOptions(newRenderData);
        },

        /**
         * Applies the rotation occured by moving the tool helper.
         * @private
         * @method _applyRotation
         * @params paper mouse/touch event object.
         */
        "_applyRotation": function(event) {
            var rotationRefPoint = this.model.getReferencePoint(),
                rotationIntermediatePoint = new ConstructionTool.Models.Point(this._rotationIntermediatePoint),
                curPoint = new ConstructionTool.Models.Point(event.point),
                angle = geomFunctions.angleBetweenPoints(rotationIntermediatePoint.x, rotationIntermediatePoint.y, rotationRefPoint.x, rotationRefPoint.y, curPoint.x, curPoint.y, true);

            this._rotationIntermediatePoint = curPoint;
            this.rotate(angle, true);
        },

        /**
         * Rotate the tool helper.
         * @method rotate
         * @params {Number} angle
         * @params {Boolean}
         */
        "rotate": function(angle, bDraw) {
            var path = this.model.get("_path"),
                renderData = this.model.get("_renderData"),
                rotateAngle = renderData.rotateAngle,
                rotationRefPoint = this.model.getReferencePoint(),
                newAngle = null;

            newAngle = (Number(rotateAngle) + Number(angle)) % 360;
            if (bDraw === true || typeof bDraw === "undefined") {
                path.rotate(angle, rotationRefPoint);
            }
            this.model.setOptions({
                "rotateAngle": newAngle
            });
        },

        "enableDisableRuler": function enableDisableRuler(isEnable) {
            if (typeof isEnable !== "boolean") {
                return;
            }
            this._isRulerEnable = isEnable;
        },

        "getRulerEnabled": function getRulerEnabled() {
            return this._isRulerEnable;
        },

        "setRulerEnabled": function setRulerEnabled(isEnable) {
            if (typeof isEnable !== "boolean") {
                return;
            }
            this._isRulerEnable = isEnable;
        },

        "getDistanceBetweenPoint": function getDistanceBetweenPoint(point1, point2) {
            return Math.sqrt(Math.pow(point2.y - point1.y, 2) + Math.pow(point2.x - point1.x, 2));
        },

        "isPointInBetween": function getDistanceBetweenPoint(point1, point2, point3) {
            return Math.round(this.getDistanceBetweenPoint(point1, point3) + this.getDistanceBetweenPoint(point3, point2)) === Math.round(this.getDistanceBetweenPoint(point1, point2));
        },

        "remove": function() {
            this.clearIntermediatePath();
        },

        "clearIntermediatePath": function() {
            var path = this.model.get("_path");

            if (typeof path !== "undefined" && path !== null) {
                path.removeChildren();
                path.remove();
                this.model.set("_path", null);
            }
        },

        /**
         * set visibility of ruler
         * @method setVisibility
         * @isVisible {Boolean, null}
         */
        "setVisibility": function setVisibility(isVisible) {
            var path = this.model.get("_path");

            if (typeof path !== "undefined") {
                if (typeof isVisible === "undefined") {
                    path.visible = !path.visible;
                } else {
                    path.visible = isVisible;
                }
            }
        },

        "updatePathZIndex": function updatePathZIndex() {
            if (typeof this.model.get("_path") === "undefined" || this.model.get("_path") === null) {
                return;
            }
            var renderData = this.model.get("_renderData"),
                zIndex = renderData.zIndex,
                path = this.model.get("_path");

            ConstructionTool.Views.PaperScope.project.activeLayer.insertChild(zIndex, path);
        },

        /*************************************************************************************
        Undo redo state saves, getters and mor...
        *************************************************************************************/
        "_savePreviousState": function(data) {
            this._undoRedoState.oldState = data;
        },

        "_getPreviousState": function() {
            return this._undoRedoState.oldState;
        },

        "_saveCurrentState": function(data) {
            this._undoRedoState.newState = data;
        },

        "_getCurrentState": function() {
            return this._undoRedoState.newState;
        }
    });
}(window.MathUtilities));
