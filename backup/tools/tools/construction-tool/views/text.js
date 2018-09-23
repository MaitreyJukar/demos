/* globals _, window */

(function(MathUtilities) {
    "use strict";
    var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                          Text                                   */
    /*******************************************************************/
    ConstructionTool.Views.Text = ConstructionTool.Views.BaseShape.extend({
        "_isDoubleClick": false,

        "initModel": function() {
            this.model = new ConstructionTool.Models.Text();
            this._drawTextRef = _.bind(this._drawText, this);
        },

        "processTouchStart": function(event) {
            //create temp path object.
            this._textPath = new ConstructionTool.Views.Rectangle();
            this._textPath.setOptions({
                "fillColor": null,
                "strokeWidth": 1,
                "fillAlpha": 1,
                "strokeColor": "#000"
            });
            this._textPath.processTouchStart(event);

            //create text-tool object
            var oldState = {
                "bRemove": true,
                "id": this.getId()
            };

            this._savePreviousState(oldState);

            this._hitPoint = new ConstructionTool.Models.Point(event.point);

            this.model.setOptions({
                "topLeft": {
                    "x": event.event.clientX,
                    "y": event.event.clientY
                }
            });
        },

        "processTouchMove": function(event) {
            this._textPath.processTouchMove(event);
        },

        "processTouchEnd": function(event) {
            this._textPath.processTouchEnd(event);

            var textToolProp = this._textPath._intermediatePath.getBounds(),
                loadData;

            this._topLeft = {
                "x": this._textPath._intermediatePath.bounds.topLeft.x,
                "y": this._textPath._intermediatePath.bounds.topLeft.y
            };

            this.model.setRotationPoint(this.model.getRotationReferencePoint());
            loadData = {
                "height": textToolProp.height,
                "width": textToolProp.width,
                "text": "",
                "isReEdit": false,
                "topLeft": this._topLeft
            };
            this.loadEditor(loadData);
            this._textPath._intermediatePath.remove();
        },

        "loadEditor": function(loadData) {
            var isAccessible = ConstructionTool.Views.isAccessible,
                csvData = null,
                textToolCounter = ConstructionTool.Models.Text.textToolCounter,
                BASE_PATH = ConstructionTool.Models.Sketchpad.BASEPATH,
                TEXT_TOOL_OFFSET = ConstructionTool.Views.TEXT_TOOL_OFFSET,
                CanvasSize = ConstructionTool.Views.CanvasSize,
                SCROLL_BUFFER_SPACE = ConstructionTool.Models.Sketchpad.SCROLL_BUFFER_SPACE,
                PADDING = {
                    "left": 5,
                    "top": 2
                },
                canvasBounds = {
                    "left": PADDING.left,
                    "top": TEXT_TOOL_OFFSET.top,
                    "width": CanvasSize.width - SCROLL_BUFFER_SPACE - 2 * PADDING.left,
                    "height": CanvasSize.height - SCROLL_BUFFER_SPACE - PADDING.top
                },
                editorOptions = {
                    "height": loadData.height,
                    "width": loadData.width,
                    "text": loadData.text,
                    "counter": textToolCounter++,
                    "topLeft": loadData.topLeft,
                    "openModal": true,
                    "basePath": BASE_PATH,
                    "offset": TEXT_TOOL_OFFSET.top,
                    "csvData": csvData,
                    "isAccessible": isAccessible,
                    "canvasBounds": canvasBounds,
                    "isReEdit": loadData.isReEdit

                },
                textToolView = this.getTextTool();

            textToolView.on("getBase64", this._drawTextRef);
            textToolView.loadEditor(editorOptions);
        },
        "updateCanvasBounds": function() {
            var TEXT_TOOL_OFFSET = ConstructionTool.Views.TEXT_TOOL_OFFSET,
                CanvasSize = ConstructionTool.Views.CanvasSize,
                SCROLL_BUFFER_SPACE = ConstructionTool.Models.Sketchpad.SCROLL_BUFFER_SPACE,
                PADDING = {
                    "left": 5,
                    "top": 2
                },
                canvasBounds = {
                    "left": PADDING.left,
                    "top": TEXT_TOOL_OFFSET.top,
                    "width": CanvasSize.width - SCROLL_BUFFER_SPACE - 2 * PADDING.left,
                    "height": CanvasSize.height - SCROLL_BUFFER_SPACE - PADDING.top
                },
                textToolView = this.getTextTool();
            textToolView.updateResizingData(canvasBounds);
        },
        "_onDoubleClick": function() {
            var boundingBox = this.model.getBoundingBox(),
                topLeft = {
                    "x": boundingBox.x,
                    "y": boundingBox.y
                },
                oldState = {},
                loadData;

            this.model.setOptions({
                "topLeft": topLeft
            });

            this._isDoubleClick = true;

            oldState = this.model.getCloneData();
            oldState = this.getViewOptions(oldState);
            oldState.id = this.getId();
            this._savePreviousState(oldState);

            this.deselect();

            //hide previous path
            this._intermediatePath.visible = false;
            ConstructionTool.Views.PaperScope.view.draw();

            loadData = {
                "height": boundingBox.height,
                "width": boundingBox.width,
                "text": this._intermediatePath.data.textData,
                "topLeft": topLeft,
                "isReEdit": true
            };
            this.loadEditor(loadData);

        },

        "_drawText": function(imageData) {
            ConstructionTool.Views.Text.textToolView.off("getBase64", this._drawTextRef);
            var box = {},
                boundingBox = this.model.getBoundingBox(),
                viewData = this.model.get("_data"),
                zIndex = null,
                onTextRasterLoad,
                prevRefPoint = null,
                curRefPoint = null,
                curState = {};

            // return if blank data in image
            if (imageData.editorText === "") {
                this.trigger("text-delete", [this], true);
                this.trigger("text-drawing-complete", {
                    "textView": this,
                    "isDoubleClick": this._isDoubleClick,
                    "text": imageData.editorText
                });
                return;
            }

            if (this._intermediatePath) {
                zIndex = ConstructionTool.Views.PaperScope.project.activeLayer.children.indexOf(this._intermediatePath);
                this._intermediatePath.remove();
            }
            this._intermediatePath = new ConstructionTool.Views.PaperScope.Raster({
                "source": "data:image/jpeg;base64," + imageData.base64
            });

            onTextRasterLoad = _.bind(function() {
                this._intermediatePath.position = new ConstructionTool.Models.Point(imageData.left + this._intermediatePath.width / 2, imageData.top + this._intermediatePath.height / 2);

                this.off("text-double-click").on("text-double-click", _.bind(this._onDoubleClick, this));
                if (this._isDoubleClick) {
                    prevRefPoint = this.model.getRotationPoint();
                    curRefPoint = new ConstructionTool.Models.Point({
                        "x": boundingBox.x + this._intermediatePath.width / 2,
                        "y": boundingBox.y + this._intermediatePath.height / 2
                    });
                    curRefPoint = this.model.getRotatedPoints([curRefPoint], prevRefPoint, viewData.rotationAngle)[0];

                    this._intermediatePath.position = {
                        "x": curRefPoint.x,
                        "y": curRefPoint.y
                    };
                    this._intermediatePath.rotate(viewData.rotationAngle);
                    ConstructionTool.Views.PaperScope.project.activeLayer.insertChild(zIndex, this._intermediatePath);

                    this._isDoubleClick = false;
                }
                // save image data
                this.model.setOptions({
                    "imageData": imageData
                });
                box.x = this._intermediatePath.position.x - this._intermediatePath.width / 2;
                box.y = this._intermediatePath.position.y - this._intermediatePath.height / 2;
                box.height = this._intermediatePath.height;
                box.width = this._intermediatePath.width;
                this.model.setBoundingBox(box);
                this.model.setRotationPoint(this.model.getRotationReferencePoint());

                // Undo redo  state saves
                curState = this.model.getCloneData();
                curState = this.getViewOptions(curState);
                curState.id = this.getId();
                this._saveCurrentState(curState);

                this._intermediatePath.data = {
                    "textData": imageData.editorText
                };
                this.trigger("equation-complete");
                this.trigger("text-drawing-complete", {
                    "textView": this,
                    "isDoubleClick": this._isDoubleClick,
                    "text": imageData.editorText
                });
            }, this);

            this._intermediatePath.on("load", onTextRasterLoad);
        },

        "draw": function(isResize) {
            var viewData = this.model.get("_data"),
                boundingBox = this.model.getBoundingBox(),
                topLeft = {},
                onTextRasterLoad = _.bind(function() {
                    this._intermediatePath.position.x = topLeft.x + this._intermediatePath.width / 2;
                    this._intermediatePath.position.y = topLeft.y + this._intermediatePath.height / 2;
                    var box = {
                        "x": this._intermediatePath.position.x - this._intermediatePath.width / 2,
                        "y": this._intermediatePath.position.y - this._intermediatePath.height / 2,
                        "height": this._intermediatePath.height,
                        "width": this._intermediatePath.width
                    };
                    this.model.setBoundingBox(box);
                    this.model.setRotationPoint(this.model.getRotationReferencePoint());
                    if (this.model.get('_data').isSelected) {
                        this.drawBounds();
                    }
                    this.updateAccBoundingBox();
                }, this),
                drawText = _.bind(function(base64) {
                    if (base64) {
                        viewData.imageData.base64 = base64;
                    }
                    if (this._intermediatePath && this._intermediatePath.data.textData === viewData.imageData.editorText) {
                        // if raster is already present, change matrix.
                        this._intermediatePath.matrix = new ConstructionTool.Views.PaperScope.Matrix();
                        this._intermediatePath.position.x = boundingBox.x + boundingBox.width / 2;
                        this._intermediatePath.position.y = boundingBox.y + boundingBox.height / 2;
                    } else {
                        if (this._intermediatePath) {
                            this._intermediatePath.remove();
                            this._intermediatePath = null;
                        }

                        this._intermediatePath = new ConstructionTool.Views.PaperScope.Raster({
                            "source": "data:image/jpeg;base64," + viewData.imageData.base64,
                            "position": {
                                "x": boundingBox.x + boundingBox.width / 2,
                                "y": boundingBox.y + boundingBox.height / 2
                            }
                        });

                        this._intermediatePath.data.textData = viewData.imageData.editorText;
                        this._intermediatePath.on("load", onTextRasterLoad);
                        topLeft = {
                            "x": boundingBox.x,
                            "y": boundingBox.y
                        };
                    }
                    this.off("text-double-click").on("text-double-click", this._onDoubleClick);

                    if (isResize) {
                        this._intermediatePath.opacity = 0;
                    } else {
                        this._intermediatePath.opacity = 1;
                    }

                    this._intermediatePath.rotate(viewData.rotationAngle);
                    this.model.setOptions({
                        "rotionAngle": viewData.rotionAngle
                    });

                    this.model.setRotationPoint(this.model.getRotationReferencePoint());

                    this.updatePathZIndex();

                    if (this.model.get("_data").isSelected) {
                        this.drawBounds();
                    }
                }, this),
                ImageManager = MathUtilities.Components.ImageManager;

            if (viewData.imageData.base64) {
                drawText();
            } else {
                ImageManager._textTool = ImageManager._textTool || this.getTextTool();
                ImageManager.loadImage(viewData.imageData.editorText, drawText, {
                    "width": boundingBox.width
                });
            }
        },

        "getTextTool": function() {
            if (!ConstructionTool.Views.Text.textToolView) {
                ConstructionTool.Views.Text.textToolView = new MathUtilities.Components.TextTool.Views.TextTool({
                    "el": "#construction-tool",
                    "model": new MathUtilities.Components.TextTool.Models.TextTool()
                });
            }
            return ConstructionTool.Views.Text.textToolView;
        }

    });

}(window.MathUtilities));
