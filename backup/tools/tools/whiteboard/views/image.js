(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //image view start **********************************************
    WhiteboardTool.Views.Image = WhiteboardTool.Views.BasePolygon.extend({

        "_imgEle": null,
        "_bLoaded": false,
        "_initialPosition": null,

        "initialize": function() {
            WhiteboardTool.Views.Image.__super__.initialize.apply(this, arguments);
            this.model.setOptions({
                "scaleFactor": {
                    "x": 1,
                    "y": 1
                },
                "imageData": this.options.imageSource
            });
            this.renderImage(this.options);
        },
        "renderImage": function(options) {
            this.setImageURI(options.imageSource, true);
            if (!options.cancelLoad) {
                this._bindImageEvents();
            }
        },

        "initModel": function() {
            this.model = new WhiteboardTool.Models.Image();
        },

        "initImageElement": function() {
            if (this.imgEle) {
                this._unbindImageEvents();
                this.imgEle = null;
            }
            this.imgEle = $("<img />");
            this.imgEle.prop("crossOrigin", "anonymous");
        },

        "_bindImageEvents": function() {
            this._unbindImageEvents();
            this.imgEle.on("load", $.proxy(this.onImgDataLoad, this));
            this.imgEle.on("error", $.proxy(this.onImgDataError, this));
        },

        "_unbindImageEvents": function() {
            this.imgEle.off();
        },

        "getImageURI": function() {
            var data = this.model.getData();
            return data.imageData;
        },

        "setImageURI": function(imgDataURI, bRedraw) {
            var data = this.model.getData();
            data.imageData = imgDataURI;

            if (bRedraw) {
                this.initImageElement();
                this.imgEle.attr("src", data.imageData);
            }
        },

        "onImgDataLoad": function() {
            this._bLoaded = true;
            var canvasContainer = $("#whiteboard-canvas-container"),
                pointX = canvasContainer.width(),
                pointY = canvasContainer.height(),
                mouseEvent = {
                    "point": new WhiteboardTool.Views.PaperScope.Point(pointX / 2, pointY / 2),
                    "event": {
                        "which": 1,
                        "triggered": true
                    },
                    "type": "user-trigger"
                };
            WhiteboardTool.Views.PaperScope.tool.fire("mousedown", mouseEvent);
            WhiteboardTool.Views.PaperScope.tool.fire("mouseup", mouseEvent);
        },

        "onImgDataError": function() {
            this._bLoaded = false;
        },

        "draw": function(isFirstImageLoad) {
            var imageData = this.model.get("_data").imageData,
                imagePosition, boundingBox,
                topPadding = 25,
                drawImage = _.bind(function(src, dimension) {
                    this.trigger("activate-layer", WhiteboardTool.Models.Sketchpad.LAYERS_NAME.IMAGE);
                    if (typeof src !== "string") {
                        //for firefox and ie10-11,to incorporate image manager change.
                        //image manager return raster for above platform.
                        this._intermediatePath = src;
                        this._intermediatePath.position.x = imagePosition.x;
                        this._intermediatePath.position.y = imagePosition.y;
                        if (isFirstImageLoad) {
                            this.model.set("isFirstImageLoad", true);
                        }
                        this.updateScalingFactor();
                        this.updateImage();
                    } else {
                        this._intermediatePath = new WhiteboardTool.Views.PaperScope.Raster(src, imagePosition);
                        this._intermediatePath.on("load", _.bind(function() {
                            if (isFirstImageLoad) {
                                this.model.set("isFirstImageLoad", true);
                            }
                            this.updateScalingFactor();
                            this.updateImage();
                            this.trigger("image-loaded", this);
                        }, this));
                    }

                }, this),
                oldState = {};
            if (this._bLoaded) {
                imagePosition = WhiteboardTool.Views.PaperScope.view.center.clone();
                imagePosition.y += topPadding; //Add vertical padding for property toolbar

                //store previous data for undo-redo
                // Undo redo state saves
                oldState.bRemove = true;
                oldState.id = this.getId();
                this._savePreviousState(oldState);
            } else {
                boundingBox = this.model.getBoundingBox();
                imagePosition = new WhiteboardTool.Views.PaperScope.Point(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
            }

            if (imageData) {
                if (!this._intermediatePath) {
                    if (imageData.indexOf("data:image") === 0) {
                        //if image data is in base64 format
                        drawImage(imageData);
                    } else {
                        //image url is given.
                        this.trigger("show-preloader", this.getId(), imagePosition);
                        MathUtilities.Components.ImageManager.loadImage(imageData, $.proxy(function(data, dimentions) {
                            this.trigger("hide-preloader", this.getId());
                            if (data) {
                                drawImage(data, dimentions);
                            } else {
                                this.trigger("shape-delete", null, [this], true, true);
                            }
                        }, this));
                    }
                } else {
                    // if raster is already present, change matrix.
                    this._intermediatePath.matrix = new WhiteboardTool.Views.PaperScope.Matrix();
                    this.updateImage();
                }
            }
        },
        "updateScalingFactor": function() {
            var imageHt = this._intermediatePath.height,
                imageWidth = this._intermediatePath.width,
                boundingBox = this.model.getBoundingBox(),
                boxHt = boundingBox.height,
                boxWidth = boundingBox.width,
                newScaleFactorX,
                newScaleFactorY;
            if (this._bLoaded === true) {
                return;
            }
            if (imageHt !== boxHt || imageWidth !== boxWidth) {
                newScaleFactorY = boxHt / imageHt;
                newScaleFactorX = boxWidth / imageWidth;
                this.model.setOptions({
                    "scaleFactor": {
                        "x": newScaleFactorX,
                        "y": newScaleFactorY
                    }
                });
            }
        },

        "processTouchEnd": function(eventObject) {
            var boundingBox = this.model.getBoundingBox(),
                curState = {},
                flipData = this.model.getFlipData(),
                bounds = null;

            this.flip(this.model.getFlipDirection(boundingBox.clone()), false);
            this.draw();
            if (this._intermediatePath) {
                bounds = this._intermediatePath.bounds;
                boundingBox.x = bounds.x;
                boundingBox.y = bounds.y;
                boundingBox.width = flipData.x * bounds.width;
                boundingBox.height = flipData.y * bounds.height;
            }
            this.resize(boundingBox.clone(), false);
            this.model.setBoundingBox(boundingBox);
            this._curPoint = eventObject.point;
            this.model.setBackupBoundingBox(boundingBox.clone());
            this.model.setRotationPoint(this.model.getRotationReferencePoint());

            // Undo redo state saves
            curState = this.model.getCloneData();
            curState = this.getViewOptions(curState);
            curState.backupBoundingBox = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.getBackupBoundingBox());
            curState.id = this.getId();
            if (this.model.getData().nType === WhiteboardTool.Views.ShapeType.Image) {
                curState.scaleFactor = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.getData().scaleFactor);
            }
            this._saveCurrentState(curState);
            this.trigger("equation-complete");
        },

        "updateImage": function(dimension) {
            var boundingBox = this.model.getBoundingBox(),
                arrTempPoints = this.getShapePoints(boundingBox),
                data = this.model.getData(),
                style = this._getApplicableStrokeStyle(this.isSelected()),
                canvas = $("#whiteboard-canvas"),
                scaleFactorX = null,
                scaleFactorY = null,
                minScaleFactor = null,
                visibleCanvas = {
                    "width": canvas.width() - 25, //padding for scrollbar
                    "height": canvas.height() - 110 //padding for scrollbar and toolbar
                },
                imageSize = {},
                curState = {};

            if (dimension) {
                // for firefox.
                imageSize.width = dimension[0];
                imageSize.height = dimension[1];
            } else {
                imageSize.width = this._intermediatePath.width;
                imageSize.height = this._intermediatePath.height;
            }

            if (this.model.get("isFirstImageLoad") && (imageSize.width > visibleCanvas.width || imageSize.height > visibleCanvas.height)) {
                scaleFactorX = visibleCanvas.width / this._intermediatePath.width;
                scaleFactorY = visibleCanvas.height / this._intermediatePath.height;
                minScaleFactor = scaleFactorX > scaleFactorY ? scaleFactorY : scaleFactorX;
                //Apply minimum scaling factor to image so that image will not be stretched when too large.
                this._intermediatePath.scale(minScaleFactor, minScaleFactor);
                this._initialPosition = {
                    "width": this._intermediatePath.width * minScaleFactor,
                    "height": this._intermediatePath.height * minScaleFactor
                };
                this.model.setOptions({
                    "scaleFactor": {
                        "x": minScaleFactor,
                        "y": minScaleFactor
                    }
                });
            } else {
                this._initialPosition = {
                    "width": this._intermediatePath.width,
                    "height": this._intermediatePath.height
                };
            }
            if (this.model.get("isFirstImageLoad")) {
                this.model.set("isFirstImageLoad", false);
            }

            this._initialPosition.x = this._intermediatePath.position.x - this._initialPosition.width / 2;
            this._initialPosition.y = this._intermediatePath.position.y - this._initialPosition.height / 2;

            if (!this._bLoaded) {
                this.resize(boundingBox.clone(), false);
            }
            this.applyStyleToPathGroup(this._intermediatePath, style);
            this.applyFlip();
            this.applyRotation();
            this.updatePathZindex();
            if (data.bSelected) {
                this.drawBounds(this.getBoundingRect());
                this.trigger("bind-bounds-handle-events", this);
            }
            if (this._bLoaded === true) {
                //initial load state.
                if (this._initialPosition === null) {
                    this._initialPosition = {
                        "width": this._intermediatePath.width,
                        "height": this._intermediatePath.height
                    };
                }
                this._bLoaded = false;

                //as bounding-box is not updated, when first time image draw called.
                arrTempPoints = this.getShapePoints(this._initialPosition);
                this.model._clearFedPoints();
                this.model.setFedPoints(arrTempPoints);
                this.model.setBoundingBox(this._initialPosition);
                this.model.setBackupBoundingBox(this._initialPosition);

                // Undo redo state saves
                curState = this.model.getCloneData();
                curState = this.getViewOptions(curState);
                curState.backupBoundingBox = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.getBackupBoundingBox());
                curState.id = this.getId();
                this._saveCurrentState(curState);

                this.trigger("image-render", this);
            }
            this._initialPosition = {
                "width": this._intermediatePath.width,
                "height": this._intermediatePath.height
            };
        },

        "resize": function(box, bDraw) {
            var imagePath = this._intermediatePath,
                flipData = this.model.getFlipData(),
                position = {
                    "x": box.x + box.width / 2,
                    "y": box.y + box.height / 2
                },
                scaleFactor = this.model.getData().scaleFactor;
            if (flipData.x === -1) {
                position.x -= box.width;
            }
            if (flipData.y === -1) {
                position.y -= box.height;
            }
            this.model.setBoundingBox(box.clone());
            if (imagePath) {
                imagePath.scale(scaleFactor.x * flipData.x, scaleFactor.y * flipData.y);
                imagePath.position = new WhiteboardTool.Views.PaperScope.Point({
                    "x": position.x,
                    "y": position.y
                });
            }
            if (bDraw) {
                this.draw();
            }
        },

        "setViewOptions": function() {
            WhiteboardTool.Views.BackgroundImage.__super__.setViewOptions.apply(this, arguments);
            if (arguments && arguments[0].scaleFactor) {
                this.model.setOptions("scaleFactor", arguments[0].scaleFactor);
            }
        },
        "updatePathZindex": function() {
            this.trigger("activate-layer", WhiteboardTool.Models.Sketchpad.LAYERS_NAME.IMAGE);
            WhiteboardTool.Views.Image.__super__.updatePathZindex.apply(this, arguments);

        }
    });

    //image view end **********************************************
})(window.MathUtilities);
