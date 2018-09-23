(function(MathUtilities) {
    "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                            Selection                            */
    /*******************************************************************/
    /**
     * A customized Backbone.View that represents SelectionRect.
     * @class MathUtilities.Tools.ConstructionTool.Views.SelectionRect
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Views.BaseShape
     */
    ConstructionTool.Views.SelectionRect = ConstructionTool.Views.BaseShape.extend({
        /**
         * Stores the path reference of rotate handle drawn for shape.
         * @property _rotateHandlePath
         */
        "_rotateHandlePath": null,

        /**
         * Stores the path reference of resize handle drawn for shape.
         * @property _resizeHandlePath
         */
        "_resizeHandlePath": null,

        "_selectionBoundDashedArray": null,

        "initModel": function initialize() {
            this.model = new ConstructionTool.Models.SelectionRect();
            this._selectionBoundDashedArray = [10, 4];
        },


        /**
         * Draws the entire selection within the bounding rect stored in data strucutre.
         * @method drawResizeHandle
         */
        "draw": function() {
            var data = this.model.get("_data");

            ConstructionTool.Views.SelectionRect.__super__.draw.apply(this, arguments);

            if (data.allowRotate) {
                this.drawRotateHandle();
            }
            if (data.allowResize) {
                this.drawResizeHandle();
            }
            this._intermediatePath.dashArray = this._selectionBoundDashedArray;

            this.bindStatesForSelectionBox();
        },

        "bindStatesForSelectionBox": function bindStatesForSelectionBox() {
            var self = this,
                rotateCircleHandlePath;

            this._intermediatePath.onMouseEnter = this._intermediatePath.onMouseLeave = this._intermediatePath.onMouseDown = null;

            this._intermediatePath.onMouseEnter = function() {
                self.trigger("drag-handle-enter");
            };
            this._intermediatePath.onMouseLeave = function(event) {
                self.trigger("drag-handle-leave", event);
            };
            this._intermediatePath.onMouseDown = function() {
                self.trigger("drag-handle-mouse-down");
            };
            if (this._rotateHandlePath !== null) {
                rotateCircleHandlePath = this._rotateHandlePath.children[0];
                rotateCircleHandlePath.onMouseEnter = rotateCircleHandlePath.onMouseLeave = rotateCircleHandlePath.onMouseDown = null;
                rotateCircleHandlePath.onMouseEnter = function() {
                    self.trigger("rotate-handle-mouse-enter");
                };
                rotateCircleHandlePath.onMouseLeave = function(event) {
                    self.trigger("rotate-handle-mouse-leave", event);
                };
                rotateCircleHandlePath.onMouseDown = function() {
                    self.trigger("rotate-handle-mouse-down");
                };
            }

            if (this._resizeHandlePath !== null) {
                this._resizeHandlePath.onMouseEnter = this._resizeHandlePath.onMouseLeave = this._resizeHandlePath.onMouseDown = null;
                this._resizeHandlePath.onMouseEnter = function(event) {
                    self.trigger("resize-handle-mouse-enter", event);
                };
                this._resizeHandlePath.onMouseLeave = function(event) {
                    self.trigger("resize-handle-mouse-leave", event);
                };
                this._resizeHandlePath.onMouseDown = function() {
                    self.trigger("resize-handle-mouse-down");
                };
            }
        },

        /**
         * Draws the rotate handle within the bounding rect stored in data strucutre.
         * @method drawRotateHandle
         */
        "drawRotateHandle": function() {
            var boundingBox = this.model.getBoundingBox(),
                rotateLineHandlePath, rotateCircleHandlePath, tempRotateCircleHandlePath,
                rotateHitPath,
                point1 = {
                    "x": boundingBox.x,
                    "y": boundingBox.y
                },
                point2 = {
                    "x": boundingBox.x + Math.abs(boundingBox.width),
                    "y": boundingBox.y + Math.abs(boundingBox.height)
                };
            if (!point1 || !point2) {
                return;
            }

            point1.x = point1.x + Math.abs(point1.x - point2.x) / 2 - 8;
            point1.y = point1.y - 16;

            rotateLineHandlePath = new ConstructionTool.Views.PaperScope.Path.Line({
                "from": [point1.x + 8, point1.y],
                "to": [point1.x + 8, point1.y + 16],
                "strokeColor": "#000",
                "strokeWidth": 2
            });

            tempRotateCircleHandlePath = new ConstructionTool.Views.PaperScope.Path.Circle({
                "center": [point1.x + 8, point1.y - 5],
                "radius": 6,
                "fillColor": "#6b37bf"
            });
            rotateCircleHandlePath = tempRotateCircleHandlePath.rasterize();
            tempRotateCircleHandlePath.remove();

            this._rotateHandlePath = new ConstructionTool.Views.PaperScope.Group([rotateCircleHandlePath, rotateLineHandlePath]);
            if ("ontouchstart" in window) {
                rotateHitPath = new ConstructionTool.Views.PaperScope.Path.Circle({
                    "center": [point1.x + 8, point1.y - 5],
                    "radius": 15
                });
                rotateHitPath.fillColor = "#6b37bf";
                rotateHitPath.fillColor.alpha = 0;
                this._rotateHandlePath.addChild(rotateHitPath);
            }
            this.applyFlip(this._rotateHandlePath);
            this.applyRotation(this._rotateHandlePath);
        },

        /**
         * Draws the resize handle within the bounding rect stored in data strucutre.
         * @method drawResizeHandle
         */
        "drawResizeHandle": function() {
            var boundingBox = this.model.getBoundingBox(),
                endPoint = {
                    "x": boundingBox.x + Math.abs(boundingBox.width),
                    "y": boundingBox.y + Math.abs(boundingBox.height)
                },
                resizeHandlesStyle = {
                    "fillColor": "#e6e6e6",
                    "strokeColor": "black",
                    "strokeWidth": 1
                },
                topLeftResizeHandlePath, topLeftResizeHandlePath2,
                bottomLeftResizeHandlePath, bottomLeftResizeHandlePath2,
                bottomRightResizeHandlePath, bottomRightResizeHandlePath2, brHitPath, tlHitPath, trHitPath, blHitPath,
                topRightResizeHandlePath, topRightResizeHandlePath2;

            if (!endPoint) {
                return;
            }
            //bottom right
            bottomRightResizeHandlePath2 = new ConstructionTool.Views.PaperScope.Path.Circle({
                "center": [endPoint.x, endPoint.y],
                "radius": 6
            });
            bottomRightResizeHandlePath2.style = resizeHandlesStyle;
            bottomRightResizeHandlePath = bottomRightResizeHandlePath2.rasterize();
            bottomRightResizeHandlePath2.remove();
            bottomRightResizeHandlePath.cornerName = "bottom-right";

            //topLeft
            topLeftResizeHandlePath2 = new ConstructionTool.Views.PaperScope.Path.Circle({
                "center": [boundingBox.x, boundingBox.y],
                "radius": 6
            });
            topLeftResizeHandlePath2.style = resizeHandlesStyle;
            topLeftResizeHandlePath = topLeftResizeHandlePath2.rasterize();
            topLeftResizeHandlePath2.remove();
            topLeftResizeHandlePath.cornerName = "top-left";

            //top right
            topRightResizeHandlePath2 = new ConstructionTool.Views.PaperScope.Path.Circle({
                "center": [endPoint.x, boundingBox.y],
                "radius": 6
            });
            topRightResizeHandlePath2.style = resizeHandlesStyle;
            topRightResizeHandlePath = topRightResizeHandlePath2.rasterize();
            topRightResizeHandlePath2.remove();
            topRightResizeHandlePath.cornerName = "top-right";


            //bottom left
            bottomLeftResizeHandlePath2 = new ConstructionTool.Views.PaperScope.Path.Circle({
                "center": [boundingBox.x, endPoint.y],
                "radius": 6
            });
            bottomLeftResizeHandlePath2.style = resizeHandlesStyle;
            bottomLeftResizeHandlePath = bottomLeftResizeHandlePath2.rasterize();
            bottomLeftResizeHandlePath2.remove();
            bottomLeftResizeHandlePath.cornerName = "bottom-left";


            this._resizeHandlePath = new ConstructionTool.Views.PaperScope.Group([bottomRightResizeHandlePath, topLeftResizeHandlePath, topRightResizeHandlePath, bottomLeftResizeHandlePath]);
            if ("ontouchstart" in window) {
                brHitPath = new ConstructionTool.Views.PaperScope.Path.Circle({
                    "center": [endPoint.x, endPoint.y],
                    "radius": 15
                });
                brHitPath.style = resizeHandlesStyle;
                brHitPath.cornerName = "bottom-right";
                brHitPath.fillColor.alpha = brHitPath.strokeColor.alpha = 0;

                tlHitPath = new ConstructionTool.Views.PaperScope.Path.Circle({
                    "center": [boundingBox.x, boundingBox.y],
                    "radius": 15
                });
                tlHitPath.style = resizeHandlesStyle;
                tlHitPath.cornerName = "top-left";
                tlHitPath.fillColor.alpha = tlHitPath.strokeColor.alpha = 0;

                trHitPath = new ConstructionTool.Views.PaperScope.Path.Circle({
                    "center": [endPoint.x, boundingBox.y],
                    "radius": 15
                });
                trHitPath.style = resizeHandlesStyle;
                trHitPath.cornerName = "top-right";
                trHitPath.fillColor.alpha = trHitPath.strokeColor.alpha = 0;

                blHitPath = new ConstructionTool.Views.PaperScope.Path.Circle({
                    "center": [boundingBox.x, endPoint.y],
                    "radius": 15
                });
                blHitPath.style = resizeHandlesStyle;
                blHitPath.cornerName = "bottom-left";
                blHitPath.fillColor.alpha = blHitPath.strokeColor.alpha = 0;

                this._resizeHandlePath.addChildren([brHitPath, trHitPath, tlHitPath, blHitPath]);
            }
            this.applyFlip(this._resizeHandlePath);
            this.applyRotation(this._resizeHandlePath);
        },

        /**
         * Checks if the point passed hits it or not.
         * @method isHit
         * @returns {Bool} Returns true if hit is made, else returns false.
         */
        "isHit": function(objPoint, hitOptions) {
            var hitResult = false,
                shapeGroup = this._intermediatePath;

            if (hitOptions && hitOptions.checkContains) {
                hitResult = shapeGroup.contains(objPoint);
            }

            if (!hitResult && this._rotateHandlePath) {
                hitResult = this._rotateHandlePath.hitTest(objPoint);
            }

            if (!hitResult && this._resizeHandlePath) {
                hitResult = this._resizeHandlePath.hitTest(objPoint);
            }

            return !!hitResult;

        },

        /**
         * Returns the type hit made on shape.
         * @method getHitType
         * @returns {Number} Number type related to hit type that is Select.Resize.Rotate
         */
        "getHitType": function(objPoint) {
            if (this._rotateHandlePath && this._rotateHandlePath.hitTest(objPoint)) {
                return ConstructionTool.Views.BaseShape.Mode.Rotate;
            }

            if (this._resizeHandlePath && this._resizeHandlePath.hitTest(objPoint)) {
                return ConstructionTool.Views.BaseShape.Mode.Resize;
            }

            return ConstructionTool.Views.BaseShape.Mode.Select;
        },

        /**
         * Removes the path from the canvas, removes all related data from it and nullifies the properties.
         * @method remove
         */
        "remove": function() {
            ConstructionTool.Views.SelectionRect.__super__.remove.apply(this, arguments);
            if (this._resizeHandlePath) {
                this._resizeHandlePath.remove();
            }
            if (this._rotateHandlePath) {
                this._rotateHandlePath.remove();
            }

            this._rotateHandlePath = null;
            this._resizeHandlePath = null;

        },

        /**
         * Clears the old path from canvas.
         * @method clearIntermediatePath
         */
        "clearIntermediatePath": function() {
            ConstructionTool.Views.SelectionRect.__super__.clearIntermediatePath.apply(this, arguments);

            if (this._resizeHandlePath) {
                this._resizeHandlePath.remove();
            }
            if (this._rotateHandlePath) {
                this._rotateHandlePath.remove();
            }
        },

        "resize": function() {
            var arg = [];
            arg.push(arguments[0]);
            arg.push(false);

            ConstructionTool.Views.SelectionRect.__super__.resize.apply(this, arg);
            this.draw();
        }

    });
}(window.MathUtilities));
