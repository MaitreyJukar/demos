(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //selection view start **********************************************
    WhiteboardTool.Views.SelectionRect = WhiteboardTool.Views.BasePolygon.extend({
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

        "_selectionStrokeColor": null,

        "initModel": function() {
            this.model = new WhiteboardTool.Models.Selection();
            this._selectionBoundDashedArray = [10, 4];
            this._selectionStrokeColor = "#a6a6a6";
        },

        /**
         * Draws the entire selection within the bounding rect stored in data strucutre.
         * @method draw
         */
        "draw": function() {
            this.trigger("activate-layer", WhiteboardTool.Models.Sketchpad.LAYERS_NAME.SERVICE);
            WhiteboardTool.Views.SelectionRect.__super__.draw.apply(this, arguments);
            var data = this.model.getData();

            if (data.bAllowRotate) {
                this.drawRotateHandle();
            }
            if (data.bAllowResize) {
                this.drawResizeHandle();
            }
            if (data.nType !== WhiteboardTool.Views.ShapeType.LineSegment || data.bAllowSelectionBound) {
                this._intermediatePath.dashArray = this._selectionBoundDashedArray;
                this._intermediatePath.fillColor = "#fff";
                this._intermediatePath.fillColor.alpha = 0;
                this._intermediatePath.strokeColor = this._selectionStrokeColor;
            } else {
                this._intermediatePath.strokeWidth = 0;
            }
            this.bindStatesForSelectionBox();
            this.trigger("activate-layer");
        },

        "bindStatesForSelectionBox": function() {
            var self = this,
                rotateCircleHandlePath = null;

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
                rotateLineHandlePath, rotateCircleHandlePath, rotateCircleHandlePath2,
                rotateHitPath,
                point1 = {
                    "x": boundingBox.x,
                    "y": boundingBox.y
                },
                point2 = {
                    "x": boundingBox.x + Math.abs(boundingBox.width),
                    "y": boundingBox.y + Math.abs(boundingBox.height)
                };
            if (!point1 || !point2 || this.model.getData().nType === WhiteboardTool.Views.ShapeType.LineSegment) {
                return;
            }

            point1.x = point1.x + Math.abs(point1.x - point2.x) / 2 - 8;
            point1.y = point1.y - 16;
            rotateLineHandlePath = new WhiteboardTool.Views.PaperScope.Path.Line([point1.x + 8, point1.y], [point1.x + 8, point1.y + 16]);
            rotateLineHandlePath.strokeColor = "#000";
            rotateLineHandlePath.strokeWidth = 2;
            rotateCircleHandlePath2 = new WhiteboardTool.Views.PaperScope.Path.Circle({
                "center": [point1.x + 8, point1.y - 5],
                "radius": 6
            });
            rotateCircleHandlePath2.fillColor = "#6b37bf";
            rotateCircleHandlePath = rotateCircleHandlePath2.rasterize();
            rotateCircleHandlePath2.remove();
            this._rotateHandlePath = new WhiteboardTool.Views.PaperScope.Group([rotateCircleHandlePath, rotateLineHandlePath]);
            if ("ontouchstart" in window) {
                rotateHitPath = new WhiteboardTool.Views.PaperScope.Path.Circle({
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
                    "strokeColor": "#000",
                    "strokeWidth": 1
                },
                RADIUS = 6,
                TOUCH_RADIUS = 15,
                isLine = this.model.getData().nType === WhiteboardTool.Views.ShapeType.LineSegment,
                topLeftResizeHandlePath, topLeftResizeHandlePath2,
                bottomLeftResizeHandlePath, bottomLeftResizeHandlePath2,
                bottomRightResizeHandlePath, bottomRightResizeHandlePath2, brHitPath, tlHitPath, trHitPath, blHitPath,
                topRightResizeHandlePath, topRightResizeHandlePath2;

            if (!endPoint) {
                return;
            }
            //bottom right
            bottomRightResizeHandlePath2 = new WhiteboardTool.Views.PaperScope.Path.Circle({
                "center": [endPoint.x, endPoint.y],
                "radius": RADIUS
            });
            bottomRightResizeHandlePath2.style = resizeHandlesStyle;
            bottomRightResizeHandlePath = bottomRightResizeHandlePath2.rasterize();
            bottomRightResizeHandlePath2.remove();
            bottomRightResizeHandlePath.cornerName = "bottom-right";

            //topLeft
            topLeftResizeHandlePath2 = new WhiteboardTool.Views.PaperScope.Path.Circle({
                "center": [boundingBox.x, boundingBox.y],
                "radius": RADIUS
            });
            topLeftResizeHandlePath2.style = resizeHandlesStyle;
            topLeftResizeHandlePath = topLeftResizeHandlePath2.rasterize();
            topLeftResizeHandlePath2.remove();
            topLeftResizeHandlePath.cornerName = "top-left";
            if (!isLine) {
                //top right
                topRightResizeHandlePath2 = new WhiteboardTool.Views.PaperScope.Path.Circle({
                    "center": [endPoint.x, boundingBox.y],
                    "radius": RADIUS
                });
                topRightResizeHandlePath2.style = resizeHandlesStyle;
                topRightResizeHandlePath = topRightResizeHandlePath2.rasterize();
                topRightResizeHandlePath2.remove();
                topRightResizeHandlePath.cornerName = "top-right";

                //bottom left
                bottomLeftResizeHandlePath2 = new WhiteboardTool.Views.PaperScope.Path.Circle({
                    "center": [boundingBox.x, endPoint.y],
                    "radius": RADIUS
                });
                bottomLeftResizeHandlePath2.style = resizeHandlesStyle;
                bottomLeftResizeHandlePath = bottomLeftResizeHandlePath2.rasterize();
                bottomLeftResizeHandlePath2.remove();
                bottomLeftResizeHandlePath.cornerName = "bottom-left";

                this._resizeHandlePath = new WhiteboardTool.Views.PaperScope.Group([bottomRightResizeHandlePath, topLeftResizeHandlePath, topRightResizeHandlePath, bottomLeftResizeHandlePath]);
            } else {
                this._resizeHandlePath = new WhiteboardTool.Views.PaperScope.Group([bottomRightResizeHandlePath, topLeftResizeHandlePath]);
            }
            if ("ontouchstart" in window) {
                //Bottom-right Path
                brHitPath = new WhiteboardTool.Views.PaperScope.Path.Circle({
                    "center": [endPoint.x, endPoint.y],
                    "radius": TOUCH_RADIUS
                });
                brHitPath.style = resizeHandlesStyle;
                brHitPath.cornerName = "bottom-right";
                brHitPath.fillColor.alpha = brHitPath.strokeColor.alpha = 0;

                //Top-left Path
                tlHitPath = new WhiteboardTool.Views.PaperScope.Path.Circle({
                    "center": [boundingBox.x, boundingBox.y],
                    "radius": TOUCH_RADIUS
                });
                tlHitPath.style = resizeHandlesStyle;
                tlHitPath.cornerName = "top-left";
                tlHitPath.fillColor.alpha = tlHitPath.strokeColor.alpha = 0;

                //Top-right Path
                trHitPath = new WhiteboardTool.Views.PaperScope.Path.Circle({
                    "center": [endPoint.x, boundingBox.y],
                    "radius": TOUCH_RADIUS
                });
                trHitPath.style = resizeHandlesStyle;
                trHitPath.cornerName = "top-right";
                trHitPath.fillColor.alpha = trHitPath.strokeColor.alpha = 0;

                //Bottom-left Path
                blHitPath = new WhiteboardTool.Views.PaperScope.Path.Circle({
                    "center": [boundingBox.x, endPoint.y],
                    "radius": TOUCH_RADIUS
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
         * @returns {Boolean} Returns true if hit is made, else returns false.
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
            var hitResult = null;
            if (this._rotateHandlePath) {
                hitResult = this._rotateHandlePath.hitTest(objPoint);
            }

            if (hitResult) {
                return WhiteboardTool.Views.BaseShape.Mode.Rotate;
            }

            if (this._resizeHandlePath) {
                hitResult = this._resizeHandlePath.hitTest(objPoint);
            }

            if (hitResult) {
                return WhiteboardTool.Views.BaseShape.Mode.Resize;
            }

            return WhiteboardTool.Views.BaseShape.Mode.Select;
        },

        /**
         * Removes the path from the canvas, removes all related data from it and nullifies the properties.
         * @method remove
         */
        "remove": function() {
            WhiteboardTool.Views.SelectionRect.__super__.remove.apply(this, arguments);

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
         * @method clearTrail
         */
        "clearTrail": function() {
            WhiteboardTool.Views.SelectionRect.__super__.clearTrail.apply(this, arguments);

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

            WhiteboardTool.Views.SelectionRect.__super__.resize.apply(this, arg);
            this.draw();
        }
    });

    //selection view end **********************************************
})(window.MathUtilities);
