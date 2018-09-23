/* globals _, window */

(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //text view start **********************************************
    WhiteboardTool.Views.Text = WhiteboardTool.Views.Image.extend({
        "_topLeft": null,

        "_isDoubleClick": false,

        "initModel": function() {
            this.model = new WhiteboardTool.Models.Text();
            this._drawTextRef = _.bind(this._drawText, this);
        },

        "processTouchStart": function(eventObject) {
            this._textPath = new WhiteboardTool.Views.Rectangle();
            this._textPath.setOptions({
                "strFillColor": null,
                "nStrokeWidth": 1,
                "nFillAlpha": 1,
                "strStrokeColor": "#000"
            });
            this._textPath.processTouchStart(eventObject);
            this._hitPoint = eventObject.point;

            var oldState = {
                "bRemove": true,
                "id": this.getId()
            };
            this._savePreviousState(oldState);

            this._topLeft = {
                "x": eventObject.event.clientX,
                "y": eventObject.event.clientY
            };
        },

        "processTouchMove": function(eventObject) {
            this._textPath.processTouchMove(eventObject);
        },

        "processTouchEnd": function(eventObject) {
            this._textPath.processTouchEnd(eventObject);

            var heightWidth = this._textPath._intermediatePath.getBounds(),
                loadData = {
                    "height": heightWidth.height,
                    "width": heightWidth.width,
                    "text": "",
                    "isReEdit": false
                };

            this._topLeft = {
                "x": this._textPath._intermediatePath.bounds.topLeft.x,
                "y": this._textPath._intermediatePath.bounds.topLeft.y
            };

            this.model.setRotationPoint(this.model.getRotationReferencePoint());

            this.loadEditor(loadData);

            this._textPath._intermediatePath.remove();
        },

        "loadEditor": function(loadData) {
            var isAccessible = WhiteboardTool.Views.isAccessible,
                CsvData = WhiteboardTool.Views.CsvData,
                textToolCounter = WhiteboardTool.Models.Text.textToolCounter,
                BASE_PATH = WhiteboardTool.Models.Sketchpad.BASE_PATH,
                TOP_OFFSET = WhiteboardTool.Views.Text.TOP_OFFSET,
                CanvasSize = WhiteboardTool.Views.CanvasSize,
                PADDING = {
                    "left": 5,
                    "top": 2
                },
                canvasBounds = {
                    "left": PADDING.left,
                    "top": TOP_OFFSET,
                    "width": CanvasSize.width - 2 * PADDING.left,
                    "height": CanvasSize.height - PADDING.top
                },
                topLeft = this._topLeft,
                editorOptions = {
                    "height": loadData.height,
                    "width": loadData.width,
                    "text": loadData.text,
                    "counter": textToolCounter++,
                    "topLeft": topLeft,
                    "openModal": true,
                    "basePath": BASE_PATH,
                    "offset": TOP_OFFSET,
                    "csvData": CsvData,
                    "isAccessible": isAccessible,
                    "canvasBounds": canvasBounds,
                    "isReEdit": loadData.isReEdit

                },
                textToolView = this.getTextTool();

            textToolView.on("getBase64", this._drawTextRef);
            textToolView.loadEditor(editorOptions);
        },
        "updateCanvasBounds": function() {
            var TOP_OFFSET = WhiteboardTool.Views.Text.TOP_OFFSET,
                CanvasSize = WhiteboardTool.Views.CanvasSize,
                PADDING = {
                    "left": 5,
                    "top": 2
                },
                canvasBounds = {
                    "left": PADDING.left,
                    "top": TOP_OFFSET,
                    "width": CanvasSize.width - 2 * PADDING.left,
                    "height": CanvasSize.height - PADDING.top
                },
                textToolView = this.getTextTool();
            textToolView.updateResizingData(canvasBounds);
        },
        "_onDoubleClick": function() {
            var boundingBox = this.model.getBackupBoundingBox(),
                oldState = {},
                toolHeight, toolWidth,
                loadData;

            this._topLeft = this._getTopLeft();
            this._isDoubleClick = true;

            oldState = this.model.getCloneData();
            oldState = this.getViewOptions(oldState);
            oldState.backupBoundingBox = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.getBackupBoundingBox());
            oldState.id = this.getId();
            this._savePreviousState(oldState);

            this.deselect();
            this._intermediatePath.visible = false;
            WhiteboardTool.Views.PaperScope.view.draw();

            toolHeight = boundingBox.height;
            toolWidth = boundingBox.width;

            loadData = {
                "height": toolHeight,
                "width": toolWidth,
                "text": this._intermediatePath.data.textData,
                "isReEdit": true
            };
            this.loadEditor(loadData);
        },

        "_getTopLeft": function() {
            var boundingBox = this.model.getBoundingBox();
            return {
                "x": boundingBox.x,
                "y": boundingBox.y
            };
        },

        "_drawText": function(imageData) {
            WhiteboardTool.Views.Text.textToolView.off("getBase64", this._drawTextRef);

            var curState, box = {},
                boundingBox = this.model.getBoundingBox(),
                viewData = this.model.getData(),
                onTextRasterLoad,
                prevRefPoint = null,
                curRefPoint = null;

            if (typeof imageData.height !== "undefined" && typeof imageData.width !== "undefined") {
                this.model.setOptions({
                    "editorSize": {
                        "width": imageData.width,
                        "height": imageData.height
                    }
                });
            }
            // return if blank data in image
            if (imageData.editorText === "") {
                if (this._intermediatePath !== null) {
                    this.trigger("shape-delete", null, [this]);
                }
                this.trigger("image-drawing-complete", {
                    "textView": this,
                    "isDoubleClick": this._isDoubleClick,
                    "text": imageData.editorText
                });
                WhiteboardTool.Views.accManagerView.setFocus("shape-tool-focus-rect");
                return;
            }

            if (this._intermediatePath) {
                this._intermediatePath.remove();
            }
            this._intermediatePath = new WhiteboardTool.Views.PaperScope.Raster({
                "source": "data:image/jpeg;base64," + imageData.base64
            });

            onTextRasterLoad = _.bind(function() {
                this._intermediatePath.position = new WhiteboardTool.Models.Point(imageData.left + this._intermediatePath.width / 2, imageData.top + this._intermediatePath.height / 2);

                this.off("text-double-click").on("text-double-click", this._onDoubleClick, this);
                if (this._isDoubleClick) {
                    prevRefPoint = this.model.getRotationPoint();
                    curRefPoint = new WhiteboardTool.Models.Point({
                        "x": boundingBox.x + this._intermediatePath.width / 2,
                        "y": boundingBox.y + this._intermediatePath.height / 2
                    });
                    curRefPoint = this.model.getRotatedPoints([curRefPoint], prevRefPoint, viewData.nRotation)[0];

                    this._intermediatePath.position = {
                        "x": curRefPoint.x,
                        "y": curRefPoint.y
                    };
                    this._intermediatePath.rotate(viewData.nRotation);

                    this._isDoubleClick = false;
                }
                //to handle text blur issue
                geomFunctions.nudgeRaster(this._intermediatePath);
                // save image data
                this.model.setOptions({
                    "imageData": imageData
                });
                box.x = this._intermediatePath.position.x - this._intermediatePath.width / 2;
                box.y = this._intermediatePath.position.y - this._intermediatePath.height / 2;
                box.height = this._intermediatePath.height;
                box.width = this._intermediatePath.width;
                this.model.setBoundingBox(box);
                this.model.setBackupBoundingBox(this.model.getBoundingBox().clone());
                this.model.setRotationPoint(this.model.getRotationReferencePoint());

                // Undo redo  state saves
                curState = this.model.getCloneData();
                curState = this.getViewOptions(curState);
                curState.backupBoundingBox = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.getBackupBoundingBox());
                curState.id = this.getId();

                this._saveCurrentState(curState);
                this._intermediatePath.data = {
                    "textData": imageData.editorText
                };
                this.trigger("image-drawing-complete", {
                    "textView": this,
                    "isDoubleClick": this._isDoubleClick
                });
                this.updatePathZindex();
                this.trigger("image-loaded", this);
            }, this);

            this._intermediatePath.on("load", onTextRasterLoad);
        },

        "draw": function(isResize) {
            var viewData = this.model.getData(),
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
                    this.model.setBackupBoundingBox(this.model.getBoundingBox().clone());
                    this.model.setRotationPoint(this.model.getRotationReferencePoint());
                    this.trigger('setAccDivPosition', this);

                    //to handle text blur issue
                    geomFunctions.nudgeRaster(this._intermediatePath);
                    if (this.model.getData().bSelected) {
                        this.drawBounds();
                        this.trigger("bind-bounds-handle-events", this);
                    }
                }, this),
                drawText = _.bind(function(base64) {
                    if (base64) {
                        viewData.imageData.base64 = base64;
                    }
                    if (this._intermediatePath && this._intermediatePath.data.textData === viewData.imageData.editorText) {
                        // if raster is already present, change matrix.
                        this._intermediatePath.matrix = new WhiteboardTool.Views.PaperScope.Matrix();
                    } else {
                        if (this._intermediatePath) {
                            this._intermediatePath.remove();
                            this._intermediatePath = null;
                        }
                        this._intermediatePath = new WhiteboardTool.Views.PaperScope.Raster({
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
                    this.off("text-double-click").on("text-double-click", this._onDoubleClick, this);
                    if (isResize) {
                        this._intermediatePath.opacity = 0;
                    } else {
                        this._intermediatePath.opacity = 1;
                    }


                    this._intermediatePath.position = {
                        "x": boundingBox.x + boundingBox.width / 2,
                        "y": boundingBox.y + boundingBox.height / 2
                    };
                    this._intermediatePath.rotate(viewData.nRotation);
                    this.model.setOptions({
                        "nRotation": viewData.nRotation
                    });

                    this.model.setRotationPoint(this.model.getRotationReferencePoint());
                    this.updatePathZindex();
                    if (this.model.getData().bSelected) {
                        this.drawBounds();
                    }
                }, this),
                ImageManager = MathUtilities.Components.ImageManager;
            if (!viewData.imageData) {
                return;
            }
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
            if (!WhiteboardTool.Views.Text.textToolView) {
                WhiteboardTool.Views.Text.textToolView = new MathUtilities.Components.TextTool.Views.TextTool({
                    "el": "#whiteboard",
                    "model": new MathUtilities.Components.TextTool.Models.TextTool()
                });
            }
            return WhiteboardTool.Views.Text.textToolView;
        }
    }, {
        "TOP_OFFSET": 64 // shape-tool bar height
    });

    //text view end **********************************************

})(window.MathUtilities);
