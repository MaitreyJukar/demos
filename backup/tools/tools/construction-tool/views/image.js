(function(MathUtilities) {
    "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                          Image                                   */
    /*******************************************************************/
    ConstructionTool.Views.Image = ConstructionTool.Views.BaseShape.extend({
        /**
         * Store image tag
         * @property {Object} _imgEle
         * @private
         */
        "_imgEle": null,

        "_initialPosition": null,

        "_initialLoadPosition": null,
        "_registerUndoRedo": false,

        "renderImage": function renderImage(options) {
            this.setImageURI(options.imageSource, true);
            if (!options.cancelLoad) {
                this.onImgDataLoad();
            }
        },

        "initModel": function initialize() {
            this.model = new ConstructionTool.Models.Image();
        },

        "initImageElement": function() {
            if (this._imgEle) {
                this._unbindImageEvents();
                this._imgEle = null;
            }
            this._imgEle = $("<img />");
        },

        /**
         * Bind events to view image tag
         * @method _bindImageEvents
         * @private
         */
        "_bindImageEvents": function() {
            this._unbindImageEvents();
            this._imgEle.on("load", $.proxy(this.onImgDataLoad, this)).on("error", $.proxy(this.onImgDataError, this));
        },

        /**
         * Unbind events attach image tag
         * @method _unbindImageEvents
         * @private
         */
        "_unbindImageEvents": function() {
            this._imgEle.off();
        },

        "getImageURI": function() {
            var data = this.model.get("_data");
            return data.imageData;
        },

        "setImageURI": function(imgDataURI, bRedraw) {
            this.model.setOptions({
                "imageData": imgDataURI
            });
            if (bRedraw === true) {
                this.initImageElement();
                this._imgEle.attr("src", imgDataURI);
            }
        },

        "onImgDataLoad": function() {
            this.model.setOptions({
                "isLoaded": true
            });
            var canvasSize = ConstructionTool.Views.CanvasSize,
                pointX = canvasSize.width,
                pointY = canvasSize.height,
                mouseEvent = {
                    "point": new ConstructionTool.Views.PaperScope.Point(pointX / 2, pointY / 2),
                    "event": {
                        "which": 1,
                        "triggered": true
                    },
                    "type": "user-trigger"
                };
            this.processTouchStart(mouseEvent);
            this.processTouchEnd(mouseEvent);
        },

        "onImgDataError": function() {
            this.model.setOptions({
                "isLoaded": false
            });
        },

        "draw": function(selectedShapesCnt, curState, curShape) {
            var boundingBox = this.model.getBoundingBox(),
                imagePosition = null,
                data = this.model.get("_data"),
                imageData = data.imageData,
                drawImage, self = this;

            drawImage = function(src) {
                if (typeof src !== "string") {
                    //for firefox and ie10-11,to incorporate image manager change.
                    //image manager return raster for above platform.
                    self._intermediatePath = src;
                    self._intermediatePath.position.x = imagePosition.x;
                    self._intermediatePath.position.y = imagePosition.y;
                    self.updateImage();
                } else {
                    self._initialLoadPosition = imagePosition;
                    self._intermediatePath = new ConstructionTool.Views.PaperScope.Raster(src, imagePosition);

                    self._intermediatePath.off("load");
                    self._intermediatePath.on("load", $.proxy(self.updateImage, self));
                }
                if (selectedShapesCnt && curState && curShape) {
                    if (selectedShapesCnt !== 0) {
                        if (curState.shapeData.isSelected === true) {
                            curShape.select();
                        }
                    }
                }

            };

            if (data.isLoaded === true) {
                imagePosition = ConstructionTool.Views.PaperScope.view.center.clone();
                imagePosition.y += 32; //Add vertical padding for property toolbar
            } else {
                imagePosition = new ConstructionTool.Models.Point(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
            }

            if (imageData) {
                if (!this._intermediatePath) {
                    if (imageData.indexOf("data:image") === 0) {
                        //if image data is in base64 format
                        drawImage(imageData);
                    } else {
                        //image url is given.
                        this.trigger("show-preloader", this.getId(), imagePosition);
                        MathUtilities.Components.ImageManager.loadImage(imageData, $.proxy(function(base64, dimentions) {
                            drawImage(base64, dimentions);
                            this.trigger("hide-preloader", this.getId());
                        }, this));
                    }
                } else {
                    // if raster is already present, change matrix.
                    this._intermediatePath.matrix = new ConstructionTool.Views.PaperScope.Matrix();
                    this.updateImage();
                }
            }
        },

        "updateImage": function(dimension) {
            var boundingBox = this.model.getBoundingBox(),
                arrTempPoints = this.getShapePoints(boundingBox),
                data = this.model.get("_data"),
                style = this._getApplicableStrokeStyle(this.isSelected()),
                scaleFactorX = null,
                scaleFactorY = null,
                minScaleFactor = null,
                leftPadding = 50, //selection circle size and scrollbar
                topPadding = 115, //property-bar height and scrollbar size
                canvasSize = ConstructionTool.Views.CanvasSize,
                visibleCanvas = {
                    "width": canvasSize.width - leftPadding,
                    "height": canvasSize.height - topPadding
                },
                imageSize = {},
                curState = {};

            if (this._initialLoadPosition) {
                this._intermediatePath.position = this._initialLoadPosition;
                this._initialLoadPosition = null;
            }
            if (dimension) {
                // for firefox.
                imageSize.width = dimension[0];
                imageSize.height = dimension[1];
            } else {
                imageSize.width = this._intermediatePath.width;
                imageSize.height = this._intermediatePath.height;
            }

            if (data.isLoaded && (imageSize.width > visibleCanvas.width || imageSize.height > visibleCanvas.height)) {
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

            this._initialPosition.x = this._intermediatePath.position.x - this._initialPosition.width / 2;
            this._initialPosition.y = this._intermediatePath.position.y - this._initialPosition.height / 2;

            if (!data.isLoaded) {
                this.resize(boundingBox.clone(), false);
            }

            if (data.updateCanvasScroll) {
                this.trigger("update-canvas-scroll");
                data.updateCanvasScroll = false;
            }

            this.applyStyleToPathGroup(this._intermediatePath, style);
            this.applyFlip();
            this.applyRotation();

            if (data.isSelected) {
                this.drawBounds(this.getBoundingRect());
                if (data.bindCursorEvent) {
                    this.trigger("bind-bound-handle", this);
                    data.bindCursorEvent = false;
                }
            }

            if (data.isLoaded === true) {
                //initial load state.
                if (this._initialPosition === null) {
                    this._initialPosition = {
                        "width": this._intermediatePath.width,
                        "height": this._intermediatePath.height
                    };
                }


                data.isLoaded = false;

                //as bounding-box is not updated, when first time image draw called.
                arrTempPoints = this.getShapePoints(this._initialPosition);
                this.model._clearFedPoints();
                this.model.setFedPoints(arrTempPoints);
                this.model.setBoundingBox(this._initialPosition);

                this.updatePathZIndex();
                this.select();
            }
            if (this._registerUndoRedo) {
                curState = this.model.getCloneData();
                curState = this.getViewOptions(curState);
                curState.id = this.getId();
                if (this.model.get("_data").shapeType === ConstructionTool.Views.ToolType.Image) {
                    curState.scaleFactor = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.get("_data").scaleFactor);
                }
                this._saveCurrentState(curState);
                this.trigger("equation-complete");
                this.trigger("image-drawing-complete");
                this._registerUndoRedo = false;
            }
            this.updatePathZIndex();
            this.updateAccBoundingBox();
        },

        "processTouchStart": function(eventObject) {
            var boundingBox = this.model.getBoundingBox();

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

        },

        "processTouchEnd": function(eventObject) {
            var boundingBox = this.model.getBoundingBox();

            this.flip(this.model.getFlipDirection(boundingBox.clone()), false);

            this.draw();

            if (this._intermediatePath && this._initialPosition) {
                boundingBox.x = this._initialPosition.x;
                boundingBox.y = this._initialPosition.y;
                boundingBox.width = this._initialPosition.width;
                boundingBox.height = this._initialPosition.height;
            }

            this.resize(boundingBox.clone(), false);
            this.model.setBoundingBox(boundingBox);

            this._curPoint = new ConstructionTool.Models.Point(eventObject);

            this.model.setRotationPoint(this.model.getRotationReferencePoint());


            // Undo redo state saves
            this._registerUndoRedo = true;
        },

        "resize": function(box, bDraw) {
            var imagePath = this._intermediatePath,
                flipData = this.model.get("_renderData").flipDirection,
                position = {
                    "x": box.x + box.width / 2,
                    "y": box.y + box.height / 2
                },
                data = this.model.get("_data"),
                scaleFactor = data.scaleFactor;

            if (flipData.x === -1) {
                position.x -= box.width;
            }
            if (flipData.y === -1) {
                position.y -= box.height;
            }
            this.model.setBoundingBox(box.clone());
            if (typeof imagePath !== "undefined" && imagePath !== null) {
                imagePath.scale(scaleFactor.x * flipData.x, scaleFactor.y * flipData.y);
                imagePath.position = new ConstructionTool.Models.Point(position);
            }
            if (bDraw) {
                this.draw();
            }
            this.updateAccBoundingBox();
        }
    });
}(window.MathUtilities));
