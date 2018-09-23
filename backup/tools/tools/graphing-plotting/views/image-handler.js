/* globals _, $, window, geomFunctions  */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Graphing.Views.ImageHandler = Backbone.View.extend({
        "_gridGraphView": null,
        "_plotterView": null,
        "_graphingToolView": null,
        "_selectedImages": null,
        "_currentSelectedImages": null,
        "_imagesControllerView": null,
        "matrix": null,
        "canvasSize": null,
        "equation": null,
        "undoRedoData": null,
        "id": null,
        "_preloader": null,

        "initialize": function() {
            this._graphingToolView = this.options.graphingTool;
            this._plotterView = this.options.plotterView;
            this._gridGraphView = this.options.gridGraph;
            this._imagesControllerView = this.options.imagesController;
            this.equation = new MathUtilities.Components.EquationEngine.Models.EquationData();
            this.equation.setParent(this);
            this.equation.setSpecie('image');
            this.equation.setRepositionOnDrag(false);
            this.equation.setDraggable(true);
            this._selectedImages = [];
            this.undoRedoData = [];
            this._currentSelectedImages = [];
            this.canvasSize = {
                "width": 642,
                "height": 517
            };

            this.onDragBegin = _.bind(function onDragBegin(previousPosition, equation, event, target) {
                this.deselectAll();
                this.selectImage(target);
            }, this);
            this.model = new MathUtilities.Tools.Graphing.Models.ImageHandler();
            this.id = this.model.cid;
            this.setGrid();
            this._updateRaster = _.bind(function _updateRaster(event, posX, posY, registerUndoRedoData, actionName) {
                if (!this.equation.getRaster()) {
                    return void 0;
                }
                this.setMatrixToRaster(this.getEquationMatrix());

                var gridCoordinates = this._gridGraphView._getGraphPointCoordinates([posX, posY]),
                    curPosition = this._gridGraphView._getCanvasPointCoordinates([this.x, this.y]),
                    delX, delY, saveRelocateDataObject;

                this.setRasterPosition(gridCoordinates);
                delX = this.x - this.undoRedoData[0].x;
                delY = this.y - this.undoRedoData[0].y;

                if (registerUndoRedoData) {
                    saveRelocateDataObject = this.createRelocateDataObject();
                    saveRelocateDataObject.equation = this.equation;
                    saveRelocateDataObject.delX = delX;
                    saveRelocateDataObject.delY = delY;
                    saveRelocateDataObject.position = curPosition;
                    saveRelocateDataObject.actionName = actionName;
                    saveRelocateDataObject.id = this.id;
                    this._imagesControllerView.saveDataOnRelocate(saveRelocateDataObject);
                }

            }, this);

            this._transformationDetached = _.bind(function() {
                this.equation.off('detach-transformation', this._transformationDetached)
                    .off('transformation-complete', this._updateRaster)
                    .off('transformation-rotate-start', this._transformationStart)
                    .off('transformation-resize-start', this._transformationStart)
                    .off('transformation-move-start', this._transformationStart)
                    .off('transforming:graphing', this._whileTransforming);

            }, this);

        },
        "_transformationStart": function() {
            var undoData = {
                "matrix": null,
                "id": null,
                "x": null,
                "y": null
            };
            if (!this.undoRedoData) {
                this.undoRedoData = [];
            }
            this.undoRedoData[0] = undoData;
            undoData.x = this.x;
            undoData.y = this.y;
            undoData.matrix = this.getEquationMatrix();
            undoData.id = this.id;
        },
        "getRasterForView": function() {
            return this.equation.getRaster();
        },
        "getEquationMatrix": function() {
            if (!this.matrix) {
                return void 0;
            }
            var tempMatrix;
            //SH: changing approach to fetch matrix of the data instead of the visual
            tempMatrix = this.matrix.clone();
            if (!tempMatrix) {
                tempMatrix = this.equation.getRaster().matrix.clone();
                this.matrix = tempMatrix;
            }
            return tempMatrix;
        },
        "setGrid": function() {
            var grid = this._gridGraphView;
            this._downSensed = _.bind(function(event, target) {
                var rasterImage = target.equation.getRaster();
                if (this._imagesControllerView.isImageSelected(rasterImage)) {

                    return void 0;
                }
                this.selectImage(rasterImage);

            }, this);

            this._serviceLayerClick = _.bind(function(event) {
                if (event.target && event.target.name === 'move' && event.target._parent.transformationView._currentSelectedShape) {
                    this.selectImage(event.target._parent.transformationView._currentSelectedShape.equation.getRaster());
                }
            }, this);
            this._serviceLayerDownAndClick = _.bind(function(event) {

                if (!(event.target && event.target._parent && event.target._parent.transformationView)) {
                    return void 0;
                }

                event.target._parent.transformationView.model.movingTarget = event.target;
                this._gridGraphView.on('grid-graph-mousedrag', event.target._parent.transformationView.onMouseMove)
                    .on('grid-graph-mouseup', event.target._parent.transformationView.onMouseUp);
                event.target._parent.transformationView._calculatePositions();

            }, this);
            this._imageLayerDrag = _.bind(function(event, target) {

                var transformationView = MathUtilities.Tools.Graphing.Views.ImageTransformation.getTransformationGridViewObject(grid._paperScope, this, target, grid.$el);

                transformationView.setTransformationObject(target, this._gridGraphView, 3);
                transformationView.model.movingTarget = transformationView._moveHit.firstChild;
                transformationView.model.movingTarget.name = 'move';
                this._gridGraphView.off('image-layer-mouseup')
                    .on('image-layer-mouseup', this._canvasLayersMouseUp);
                transformationView.onMouseMove(event);
            }, this);
            this._gridLayerDownAndClick = _.bind(function _gridLayerDownAndClick() {
                this.deselectAll();
            }, this);

            this._canvasLayersMouseUp = _.bind(function _canvasLayersMouseUp(event) {

                //if not polygon
                var transformationView;
                if (event.target.equation && event.target.equation.getParent()) {
                    transformationView = MathUtilities.Tools.Graphing.Views.ImageTransformation.getTransformationGridViewObject(grid._paperScope, this, event.target.equation.getRaster(), grid.$el);
                    transformationView.onMouseUp(event);
                }
            }, this);
            this.toggleClicknOnAllLayers(true);
            this._enableDisableCanvasEvents(true);
            this._toggleMouseUpOnAllLayers(true);
            this.toggleMouseDownOnAllLayers(true);
        },
        "createRelocateDataObject": function() {

            var saveDataOnRelocateObject = {
                "clone": function() {
                    var c = {},
                        looper;
                    for (looper in this) {
                        c[looper] = this[looper];
                    }
                    return c;
                }
            };

            saveDataOnRelocateObject.equation = null;
            saveDataOnRelocateObject.delX = null;
            saveDataOnRelocateObject.delY = null;
            saveDataOnRelocateObject.position = null;
            saveDataOnRelocateObject.actionName = null;
            saveDataOnRelocateObject.selectionEntity = null;
            saveDataOnRelocateObject.eventName = null;
            saveDataOnRelocateObject.id = null;

            return saveDataOnRelocateObject;
        },

        "_enableDisableCanvasEvents": function(state) {
            if (state) {

                this._gridGraphView.off('image-layer-doubleclick', this._canvasLayersDoubleClick)
                    .on('image-layer-doubleclick', this._canvasLayersDoubleClick)
                    .off('service-layer-doubleclick', this._canvasLayersDoubleClick)
                    .on('service-layer-doubleclick', this._canvasLayersDoubleClick)
                    .off('image-layer-mousedrag', this._imageLayerDrag)
                    .on('image-layer-mousedrag', this._imageLayerDrag);
            } else {
                this._gridGraphView.off('image-layer-doubleclick', this._canvasLayersDoubleClick)
                    .off('service-layer-doubleclick', this._canvasLayersDoubleClick)
                    .off('image-layer-mousedrag', this._imageLayerDrag);
            }
        },
        "_toggleMouseUpOnAllLayers": function(bind) {
            if (bind) {
                this._gridGraphView.off('grid-layer-mouseup', this._canvasLayersMouseUp)
                    .on('grid-layer-mouseup', this._canvasLayersMouseUp);
            } else {
                this._gridGraphView.off('grid-layer-mouseup', this._canvasLayersMouseUp);
            }
        },
        "toggleMouseDownOnAllLayers": function(bind) {
            if (bind) {
                this._gridGraphView.off('grid-layer-mousedown', this._gridLayerDownAndClick)
                    .on('grid-layer-mousedown', this._gridLayerDownAndClick)
                    .off('image-layer-mousedown-sensed', this._downSensed)
                    .on('image-layer-mousedown-sensed', this._downSensed)
                    .off('service-layer-mousedown')
                    .on('service-layer-mousedown', this._serviceLayerDownAndClick);
            } else {
                this._gridGraphView.off('grid-layer-mousedown', this._gridLayerDownAndClick)
                    .off('image-layer-mousedown-sensed', this._downSensed)
                    .off('service-layer-mousedown', this._serviceLayerDownAndClick);
            }
        },
        "toggleClicknOnAllLayers": function(bind) {
            if (bind) {
                this._gridGraphView.off('grid-layer-click', this._gridLayerDownAndClick)
                    .on('grid-layer-click', this._gridLayerDownAndClick)
                    .off('service-layer-click', this._serviceLayerClick)
                    .on('service-layer-click', this._serviceLayerClick);
            } else {
                this._gridGraphView.off('grid-layer-click', this._gridLayerDownAndClick)
                    .off('service-layer-click', this._serviceLayerClick);
            }
        },
        "selectImage": function(imageRaster) {
            this._imagesControllerView.selectImage(imageRaster);
        },
        "_whileTransforming": function(event, transformationType, newCenterX, newCenterY, delta) {

            var deltaX, deltaY,
                imageRaster = this.equation.getRaster(),
                gridCoords,
                oldCanvasCoords = this._gridGraphView._getCanvasPointCoordinates([this.x, this.y]),
                newMatrix, updateDataObject, postDragData;

            newMatrix = this.equation.getRaster().matrix;
            this.matrix._a = newMatrix._a;
            this.matrix._b = newMatrix._b;
            this.matrix._c = newMatrix._c;
            this.matrix._d = newMatrix._d;
            this.matrix._tx = 0;
            this.matrix._ty = 0;

            if (transformationType === 'dragging') {
                deltaX = newCenterX - oldCanvasCoords[0];
                deltaY = newCenterY - oldCanvasCoords[1];
                postDragData = this._imagesControllerView.createPostDragDataObject();
                postDragData.equation = this.equation;
                if (delta) {
                    postDragData.deltaX = delta.x;
                    postDragData.deltaY = delta.y;
                } else {
                    postDragData.deltaX = deltaX;
                    postDragData.deltaY = deltaY;
                }
                postDragData.imageRaster = imageRaster;
                this.onPostDrag(postDragData);
            } else {

                imageRaster.position.x = newCenterX;
                imageRaster.position.y = newCenterY;

                gridCoords = this._gridGraphView._getGraphPointCoordinates([imageRaster.position.x, imageRaster.position.y]);

                this.x = gridCoords[0];
                this.y = gridCoords[1];

                this.equation.setPoints([gridCoords]);

                /*update matrix of related images*/

                updateDataObject = this.createUpdateData();
                if (event) {
                    updateDataObject.genesis = this;
                }
                updateDataObject.newPosition = [imageRaster.position.x, imageRaster.position.y];
                updateDataObject.caller = this;
                updateDataObject.relocatedEntities = [];
                updateDataObject.forceDrawing = this.TRAVEL_NORMAL;

                this.update(updateDataObject);

            }
            this.updateVisibleDomain();
        },
        "deselectAll": function() {
            this._imagesControllerView.deselectAll();
        },
        "onPostDrag": function(postDragData) {
            this._imagesControllerView.onPostDrag(postDragData);

        },

        "createUpdateData": function() {

            var updateData = {
                "clone": function() {
                    var c = {},
                        looper;
                    for (looper in this) {
                        c[looper] = this[looper];
                    }
                    return c;
                }
            };

            updateData.seed = null;
            updateData.genesis = null;
            updateData.caller = null;
            updateData.newPosition = null;
            updateData.dx = null;
            updateData.dy = null;
            updateData.relocatedEntities = null;
            updateData.noBroadcast = null;
            updateData.forceDrawing = null;
            updateData.updateMeasurement = null;

            return updateData;
        },
        "updateVisibleDomain": function() {
            var visibleDomain, i, gridSize, positionSeed,
                BUFFER_SPACE = 0,
                bounds,

                flexDomain = function(x, y) {
                    if (!visibleDomain) {
                        visibleDomain = {
                            "xmin": x,
                            "xmax": x,
                            "ymin": y,
                            "ymax": y
                        };
                    }
                    if (x < visibleDomain.xmin) {
                        visibleDomain.xmin = x - BUFFER_SPACE;
                    } else if (x > visibleDomain.xmax) {
                        visibleDomain.xmax = x + BUFFER_SPACE;
                    }

                    if (y < visibleDomain.ymin) {
                        visibleDomain.ymin = y - BUFFER_SPACE;
                    } else if (y > visibleDomain.ymax) {
                        visibleDomain.ymax = y + BUFFER_SPACE;
                    }
                };
            if (!this.equation.getRaster()) {
                return void 0;
            }
            positionSeed = this.equation.getPoints()[0];
            bounds = this.equation.getRaster().bounds;
            for (i = 0; i < positionSeed.length; i += 2) {
                flexDomain(positionSeed[i], positionSeed[i + 1]);
            }
            gridSize = this._gridGraphView._getGridDistance([bounds.width, bounds.height]);
            gridSize = [Math.abs(gridSize[0]), Math.abs(gridSize[1])];

            flexDomain(positionSeed[0] - gridSize[0] / 2, positionSeed[1] - gridSize[1] / 2);
            flexDomain(positionSeed[0] + gridSize[0] / 2, positionSeed[1] + gridSize[1] / 2);
            this.equation.setCurveMinima([visibleDomain.xmin, visibleDomain.ymin]);
            this.equation.setCurveMaxima([visibleDomain.xmax, visibleDomain.ymax]);

        },
        "update": function(updateData) {
            var genesis = updateData.genesis,
                caller = updateData.caller,
                newPosition = updateData.newPosition,
                dx = updateData.dx,
                dy = updateData.dy,
                relocatedEntities = updateData.relocatedEntities,
                forceDrawing = updateData.forceDrawing,
                updateMeasurement = updateData.updateMeasurement,
                updateDataObject = this.createUpdateData();

            updateDataObject.genesis = genesis;
            updateDataObject.caller = caller;
            updateDataObject.newPosition = newPosition;
            updateDataObject.dx = dx;
            updateDataObject.dy = dy;
            updateDataObject.relocatedEntities = relocatedEntities;
            updateDataObject.forceDrawing = forceDrawing;
            updateDataObject.updateMeasurement = updateMeasurement;

            this.setImageSeed(updateDataObject);


        },

        "setImageSeed": function(updateData) {
            var imageSeed, genesis, caller, newPosition, dx, dy, relocatedEntities,
                forceDrawing, updateMeasurement,
                updateDataObject;

            imageSeed = updateData.seed;
            genesis = updateData.genesis;
            caller = updateData.caller;
            newPosition = updateData.newPosition;
            dx = updateData.dx;
            dy = updateData.dy;
            relocatedEntities = updateData.relocatedEntities;
            forceDrawing = updateData.forceDrawing;
            updateMeasurement = updateData.updateMeasurement;


            if (!relocatedEntities) {
                relocatedEntities = [];
            }

            if (relocatedEntities.indexOf(this) > -1) {
                return void 0;
            }
            relocatedEntities.push(this);

            updateDataObject = this.createUpdateData();
            updateDataObject.seed = imageSeed;
            updateDataObject.genesis = genesis;
            updateDataObject.caller = caller;
            updateDataObject.newPosition = newPosition;
            updateDataObject.dx = dx;
            updateDataObject.dy = dy;
            updateDataObject.relocatedEntities = relocatedEntities;
            updateDataObject.forceDrawing = forceDrawing;
            updateDataObject.updateMeasurement = updateMeasurement;

            updateDataObject.caller = this;
            updateDataObject.dx = NaN;
            updateDataObject.dy = NaN;

            if (!(forceDrawing & this.TRAVEL_TEST) && imageSeed) {

                this.setMatrixToRaster(imageSeed.matrix);
                this.setRasterPosition(imageSeed.position);
                this.updateVisibleDomain();
            }

        },
        /**
         *read selected image from dialog box and display
         *@method readImage
         *@param {Object} e the action the causes to call the method
         */
        "readImage": function(e) {

            var file,
                imageType = /(jpeg|jpg|png|bmp)/i,
                reader;
            if (e.img) {
                file = e.img;
            } else if (e.target && e.target.files) {
                file = e.target.files[0].type;
            } else {
                return void 0;
            }

            if (file === void 0) {
                return void 0;
            }
            if (!file.match(imageType)) {
                this._graphingToolView.trigger('image-filetype-error');
                return void 0;
            }
            if (e.img) {
                this.initiateImage({
                    "image": file
                });
            } else {
                reader = new FileReader();
                reader.onload = _.bind(function(e) {
                    this.initiateImage({
                        "image": e.target.result
                    });

                }, this);
                file = e.target.files[0];
                reader.readAsDataURL(file);
            }
        },

        "initiateImage": function(imageData) {
            var paperScopeCenter = this._gridGraphView._paperScope.view.center,
                image = imageData.image,
                position = imageData.position,
                isCropped = imageData.isCropped;

            if (!position) {
                position = [paperScopeCenter.x, paperScopeCenter.y, 0, 0];
            }

            this.data = image;

            if (isCropped) {
                this.setRasterData(this.equation.getRaster());

                this._plotterView.addEquation(this.equation);

                this._gridGraphView.model.get('_images').push(this.equation);
            } else {
                if (image.indexOf('data:image') === 0) {
                    this._loadImageData({
                        "image": image,
                        "position": position,
                        "callForUndoRedo": imageData.callForUndoRedo
                    });
                } else {
                    this._showPreloader(position);
                    MathUtilities.Components.ImageManager.loadImage(image, _.bind(function(data, dimensions) {
                        this._loadImageData({
                            "image": data,
                            "position": position,
                            "dimensions": dimensions,
                            "callForUndoRedo": imageData.callForUndoRedo,
                            "isRetrieve": imageData.isRetrieve
                        });
                    }, this));
                }
            }
            this.equation.off('drag-begin', this.onDragBegin)
                .on('drag-begin', _.bind(this.onDragBegin, this));
            this.equation.off('transformation-complete')
                .on('transformation-complete', _.bind(this._updateRaster, this));
            this._gridGraphView.refreshView();

        },

        "_loadImageData": function(imageData) {
            var rasterImage = null,
                visibleWidth,
                visibleHeight, OFFSET = 70,
                scaleFactorWidth, imgHeight,
                imgWidth, scaleFactorHeight,
                scale, gridPosition,
                image = imageData.image,
                position = imageData.position,
                dimensions = imageData.dimensions;
            this._hidePreloader();
            if (!(imageData.isRetrieve || imageData.callForUndoRedo)) {
                this.deselectAll();
            }
            //append the data:image/png;base64, header if its text and the header is absent
            //this is done to maintain consistency with construction and WB
            if (typeof image === 'string' && image.indexOf('data:') === -1) {
                image = 'data:image/png;base64,' + image;
            }

            rasterImage = this._plotterView.addImage(image, this.equation, position);

            if (position) {
                gridPosition = this._gridGraphView._getGraphPointCoordinates(position);
            }

            visibleWidth = this.canvasSize.width - OFFSET; // to make handles visible
            visibleHeight = this.canvasSize.height - OFFSET;
            if (dimensions) {
                //for firefox
                imgWidth = dimensions[0];
                imgHeight = dimensions[1];
            } else {

                imgWidth = rasterImage._size.width;
                imgHeight = rasterImage._size.height;
            }

            if (this.matrix) {
                //possible when setdata while restoring the images
                this.setMatrixToRaster(this.matrix);
            } else if (imgWidth > visibleWidth || imgHeight > visibleHeight) {
                scaleFactorWidth = visibleWidth / imgWidth;
                scaleFactorHeight = visibleHeight / imgHeight;


                if (scaleFactorWidth < scaleFactorHeight) {
                    scale = scaleFactorWidth;
                } else {
                    scale = scaleFactorHeight;
                }
                rasterImage.scale(scale);
                rasterImage.position.x = Math.round(position[0]);
                rasterImage.position.y = Math.round(position[1]);

                this.matrix = rasterImage.matrix.clone();
            }
            if (this.x && this.y) {
                this.setRasterPosition([this.x, this.y]);
                this.undoRedoData[0] = {
                    "x": this.x,
                    "y": this.y
                };
            } else {
                //cause problems with transformation otherwise
                this.setRasterPosition(gridPosition);
                this.undoRedoData[0] = {
                    "x": gridPosition[0],
                    "y": gridPosition[1]
                };
            }

            this.setRasterData(rasterImage);
            this.undoRedoData[0].matrix = rasterImage.matrix.clone();
            //for cases of undo-redo where image is not updated because getdata has received the old matrix
            if (this._matrixWaitingForImageLoad) {
                this._matrixWaitingForImageLoad._a = this.matrix._a;
                this._matrixWaitingForImageLoad._b = this.matrix._b;
                this._matrixWaitingForImageLoad._c = this.matrix._c;
                this._matrixWaitingForImageLoad._d = this.matrix._d;
                this._matrixWaitingForImageLoad._tx = this.matrix._tx;
                this._matrixWaitingForImageLoad._ty = this.matrix._ty;
                this._matrixWaitingForImageLoad = null;

            }

            this._gridGraphView._projectLayers.gridLayer.activate();

            geomFunctions.nudgeRaster(rasterImage);
            this.setTransformationObject(imageData);
            this._bindClickEvent(rasterImage);
            if (!(rasterImage._size.width === 0 || rasterImage._size.height === 0)) {
                this._imagesControllerView.trigger('add-raster', rasterImage, this, imageData.callForUndoRedo, imageData.isRetrieve);
            }
            this._graphingToolView.showDeleteImage();
        },
        "_showPreloader": function(position) {
            var PI_FACTOR = 1.5,
                ARC_FACTOR = 5;
            this._preloader = new this._gridGraphView._paperScope.Path.Arc(0, Math.PI, PI_FACTOR * Math.PI, ARC_FACTOR);
            this._gridGraphView.activateNewLayer('service');

            this._gridGraphView._paperScope.view.onFrame = _.bind(function() {
                this._preloader.rotate(10);
            }, this);
            this._preloader.position.x = position[0];
            this._preloader.position.y = position[1];
            this._preloader.strokeColor = '#000';
            this._preloader.strokeWidth = 3;

            this._gridGraphView.activateEarlierLayer();
        },

        "_hidePreloader": function() {
            if (this._preloader) {
                this._preloader.remove();
            }
        },
        "_bindClickEvent": function(rasterImage) {
            rasterImage.on('click', _.bind(function() {
                rasterImage.bringToFront();
                this._gridGraphView.refreshView();
            }, this));
        },
        "isPositionValid": function() {
            return geomFunctions.isPaperRenderableValue(this.x) && geomFunctions.isPaperRenderableValue(this.y);
        },

        "isMatrixValid": function() {
            return !this.isInvalidMatrix(this.matrix);
        },

        "setRasterPosition": function(position) {
            var canvasPosition = this._gridGraphView._getCanvasPointCoordinates(position),
                equationRaster, equationPosition;

            this.x = position[0];
            this.y = position[1];

            if (this.isPositionValid()) {
                equationPosition = this.equation.getPoints();
                if (equationPosition) {
                    equationPosition = equationPosition[0];
                    equationPosition[0] = position[0];
                    equationPosition[1] = position[1];
                }

                this.equation.trigger('change-equation', this.equation);
                equationRaster = this.equation.getRaster();
                if (equationRaster) {
                    equationRaster.position.x = Math.round(canvasPosition[0]);
                    equationRaster.position.y = Math.round(canvasPosition[1]);
                }

            }

        },
        "setMatrixToRaster": function(matrix) {
            var equationRaster;


            if (this.matrix) {
                this.matrix._a = matrix._a;
                this.matrix._b = matrix._b;
                this.matrix._c = matrix._c;
                this.matrix._d = matrix._d;
                this.matrix._tx = Math.round(matrix._tx);
                this.matrix._ty = Math.round(matrix._ty);

            } else {
                this.matrix = matrix.clone();
            }
            equationRaster = this.equation.getRaster();
            if (this.isMatrixValid() && equationRaster) {
                equationRaster.setMatrix(matrix);
            }

        },
        "isInvalidMatrix": function(matrix) {
            if (matrix) {
                return !(isFinite(matrix._a) && isFinite(matrix._b) && isFinite(matrix._c) && isFinite(matrix._d) && isFinite(matrix._tx) && isFinite(matrix._ty));

            }
            return true;
        },
        "setRasterData": function(raster) {
            var rasterImage = raster._image,
                equationPoints;

            this.base64 = rasterImage.src;
            this.originalHeight = rasterImage.naturalHeight;
            this.originalWidth = rasterImage.naturalWidth;

            this.setMatrixToRaster(raster.matrix);

            equationPoints = this.equation.getPoints();
            this.x = equationPoints[0][0];
            this.y = equationPoints[0][1];
            raster.equation = this.equation;
            raster.handlerId = this.id;
        },
        "deleteImage": function(entity) {

            this.grid.deleteImage(entity.equation);

        },
        "setTransformationObject": function(imageData) {
            var raster = this.equation.getRaster();

            if (!raster) {
                return void 0;
            }

            if (raster._size.width === 0 || raster._size.height === 0) {
                raster.on('load',
                    _.bind(function() {
                        this.callToSetTransformation();
                        this._imagesControllerView.trigger('add-raster', raster, this, imageData.callForUndoRedo, imageData.isRetrieve);
                    }, this));
            } else {
                this.callToSetTransformation();
            }

        },
        "callToSetTransformation": function() {
            var grid = this._gridGraphView,
                equation = this.equation,
                raster = equation.getRaster(),
                transformationGridView = MathUtilities.Tools.Graphing.Views.ImageTransformation.getTransformationGridViewObject(grid._paperScope, this, this.equation.getRaster(), grid.$el);
            if (transformationGridView._currentSelectedShape !== null) {
                if (!transformationGridView.isSurroundedAroundImage()) {
                    transformationGridView._locatePoints();
                }
                return void 0;
            }

            transformationGridView.setTransformationObject(raster, grid, 3);
            equation.off('detach-transformation', this._transformationDetached)
                .on('detach-transformation', this._transformationDetached);
            equation.off('transformation-complete')
                .on('transformation-complete', _.bind(this._updateRaster, this));
            equation.off('transformation-rotate-start', this._transformationStart)
                .on('transformation-rotate-start', _.bind(this._transformationStart, this));
            equation.off('transformation-resize-start', this._transformationStart)
                .on('transformation-resize-start', _.bind(this._transformationStart, this));
            equation.off('transformation-move-start')
                .on('transformation-move-start', _.bind(this._transformationStart, this));
            equation.off('transforming:graphing')
                .on('transforming:graphing', _.bind(this._whileTransforming, this));
        },
        "getData": function() {
            var imageJSON = {
                    "id": null,
                    "equation": null,
                    "base64": null,
                    "rasterId": null,
                    "matrix": {}
                },
                tempMatrix = {},
                mat;

            imageJSON.id = this.id;
            imageJSON.rasterId = this.id;
            imageJSON.division = this.division;

            //this could be base64 or just image url
            imageJSON.data = this.data;

            imageJSON.equation = this.equation;
            imageJSON.species = this.species;
            imageJSON.properties = this.properties;

            if (this.matrix) {
                mat = this.getEquationMatrix();

                tempMatrix._a = mat._a;
                tempMatrix._b = mat._b;
                tempMatrix._c = mat._c;
                tempMatrix._d = mat._d;
                tempMatrix._tx = mat._tx;
                tempMatrix._ty = mat._ty;
            } else {
                tempMatrix._a = tempMatrix._d = 1;
                tempMatrix._b = tempMatrix._c = 0;
                tempMatrix._tx = tempMatrix._ty = 0;

                this._matrixWaitingForImageLoad = tempMatrix;
            }

            imageJSON.matrix = tempMatrix;


            imageJSON.x = this.x;
            imageJSON.y = this.y;

            return imageJSON;
        },

        "setData": function(imageJson, isRetrieve) {

            var self = this,
                raster, transformationView,
                canvasPosition;
            this.id = imageJson.id;
            //first set data and then init the image
            this.matrix = new this._gridGraphView._paperScope.Matrix(imageJson.matrix._a, imageJson.matrix._c, imageJson.matrix._b, imageJson.matrix._d, imageJson.matrix._tx, imageJson.matrix._ty);
            this.equation.setData(imageJson.equation);
            this.x = imageJson.x;
            this.y = imageJson.y;
            transformationView = MathUtilities.Tools.Graphing.Views.ImageTransformation.getTransformationGridViewObject(this._gridGraphView._paperScope, this, this.equation.getRaster(), this._gridGraphView.$el);
            transformationView.removeTransformation();
            canvasPosition = this._gridGraphView._getCanvasPointCoordinates([this.x, this.y]);

            //set species before initiate image
            this.species = imageJson.species;
            this.initiateImage({
                "image": imageJson.data,
                "position": canvasPosition,
                "callForUndoRedo": true,
                "isRetrieve": isRetrieve
            });

            if (imageJson.division) {
                this.division = imageJson.division;
            }
            raster = this.equation.getRaster();
            if (raster) {
                raster.onLoad = function() {
                    self.setMatrixToRaster(self.matrix);
                    self.setRasterPosition([self.x, self.y]);
                    self.equation.setRaster(this);
                };

            }
        }

    });

}(window.MathUtilities));
