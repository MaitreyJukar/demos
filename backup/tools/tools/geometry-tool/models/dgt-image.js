/* globals _, $, window, geomFunctions */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtImage = MathUtilities.Tools.Dgt.Models.DgtDrawable.extend({

        "label": null,

        "_incinerated": false,
        "base64": null,
        "originalHeight": null,
        "undoRedoData": [],
        "originalWidth": null,
        "x": null,
        "y": null,
        "matrix": null,
        "cropRectTopLeft": null,
        "cropRectBottomRight": null,
        "isChained": null,
        "isCropped": null,
        "isGeneratedFromCroppedImage": null,
        "allowTransformation": null,
        "_textCounter": null,
        "_cropRectangle": null,
        "transformationGridView": null,
        "_matrixWaitingForImageLoad": null,
        "isImageLoading": null,
        "scheduledForIncineration": null,
        "textSize": null,
        "initialize": function() {
            var options = arguments[0],
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;

            MathUtilities.Tools.Dgt.Models.DgtImage.__super__.initialize.apply(this, arguments);
            this.division = 'image';

            this.equation.setDraggable(true);
            if (options && options.universe) {
                this._universe = options.universe;
            }
            this.id = DgtEngine.getIdForEntity(this);

            if (!DgtEngine.restoreKind) {
                DgtEngine.entityCount.images++;

            }
            this.setSerialNumber();
            this.equation.depthLevel = this.serialNumber;
            this._incinerated = false;
            this.species = 'image';
            this.equation.setParent(this);
            this.equation.setSpecie('image');
            this.isChained = false;
            this.isCropped = false;
            this.isGeneratedFromCroppedImage = false;
            this.allowTransformation = true;
            this.properties = {
                "binaryInvisibility": 0
            };
            this.equation.setRepositionOnDrag(false);

            this.onDragBegin = _.bind(function onDragBegin(previousPosition, equation, event) {
                if (event.sessionTimestamp === this.getLastSelectTimestamp()) {
                    this.engine.deselectAll();
                    this.engine._select(this);
                }
            }, this);
            this.createCropImageRelation = _.bind(function createCropImageRelation(cropRectTopLeft, cropRectBottomRight) {
                var params = {};

                params.sourceImageId = this.id;
                params.cropRectTopLeft = cropRectTopLeft;
                params.cropRectBottomRight = cropRectBottomRight;



                this.engine._cropImageObj.off('okClicked', this.createCropImageRelation);

                this.engine.perform('cropping', params);
            }, this);

            this.onNewImageFound = _.bind(function(base64) {
                this.engine.textToolView.off('getBase64', this.onNewImageFound);
                if (base64.editorText === '') {
                    this.engine.deleteSelectedItems(null, this);
                    return;
                }
                var strNewData, redoData, strNewText,
                    undoData = {
                        "id": this.id,
                        "base64": this.base64,
                        "text": this.text,
                        "top": base64.top,
                        "left": base64.left
                    };


                strNewData = 'data:image/png;base64,' + base64.base64;
                strNewText = base64.editorText;
                this.changeText(strNewData, strNewText, base64.top, base64.left);


                redoData = {
                    "id": this.id,
                    "base64": strNewData,
                    "text": strNewText,
                    "top": base64.top,
                    "left": base64.left
                };
                this.changeImageOpacity(1);
                this.undoRedoData[1] = redoData;
                this.engine.execute('text-change', {
                    "undo": {
                        "actionType": 'before',
                        "undoData": undoData
                    },
                    "redo": {
                        "actionType": 'after',
                        "redoData": redoData
                    }
                });
                this.engine.trigger('set-focus'); //normally focus is window specific so we changed  the focus  to tool-specific
                _.delay(_.bind(function() {
                    this.engine.accessibilityView.hoverEntity(this);
                }, this), 100); // 100 is delay.
            }, this);

            this._updateRaster = _.bind(function _updateRaster(event, posX, posY, registerUndoRedoData, actionName) {

                if (!this.equation.getRaster()) {
                    return;
                }
                this.setMatrixToRaster(this.getEquationMatrix());

                var gridCoordinates = this.engine.grid._getGraphPointCoordinates([posX, posY]),
                    curPosition = this.engine.grid._getCanvasPointCoordinates([this.x, this.y]),
                    delX, delY, saveRelocateDataObject;

                this.setRasterPosition(gridCoordinates);

                delX = this.x - this.undoRedoData[0].x;
                delY = this.y - this.undoRedoData[0].y;

                if (registerUndoRedoData) {
                    saveRelocateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createRelocateDataObject();
                    saveRelocateDataObject.equation = this.equation;
                    saveRelocateDataObject.delX = delX;
                    saveRelocateDataObject.delY = delY;
                    saveRelocateDataObject.position = curPosition;
                    saveRelocateDataObject.actionName = actionName;

                    this.saveDataOnRelocate(saveRelocateDataObject);

                }

            }, this);



            this._transformationStart = _.bind(function() {
                var undoData = {
                    "matrix": null,
                    "id": null,
                    "x": null,
                    "y": null
                };
                this.undoRedoData[0] = undoData;
                undoData.x = this.x;
                undoData.y = this.y;

                undoData.matrix = this.getEquationMatrix();
                undoData.id = this.id;
            }, this);


            this._transformationDetached = _.bind(function() {
                this.equation.off('detach-transformation', this._transformationDetached)
                    .off('transformation-complete', this._updateRaster)
                    .off('transformation-rotate-start', this._transformationStart)
                    .off('transformation-resize-start', this._transformationStart)
                    .off('transformation-move-start', this._transformationStart)
                    .off('transforming', this._whileTransforming);
            }, this);

        },


        "updateVisibleDomain": function() {
            if (!this.equation.getRaster()) {
                return;
            }

            var visibleDomain, i, gridSize, positionSeed,
                bufferSpace = 0,
                bounds,
                equationData = this.equation;

            function flexDomain(x, y) {
                if (!visibleDomain) {
                    visibleDomain = {
                        "xmin": x,
                        "xmax": x,
                        "ymin": y,
                        "ymax": y
                    };
                }
                if (x < visibleDomain.xmin) {
                    visibleDomain.xmin = x - bufferSpace;
                } else if (x > visibleDomain.xmax) {
                    visibleDomain.xmax = x + bufferSpace;
                }

                if (y < visibleDomain.ymin) {
                    visibleDomain.ymin = y - bufferSpace;
                } else if (y > visibleDomain.ymax) {
                    visibleDomain.ymax = y + bufferSpace;
                }
            }

            positionSeed = equationData.getPoints()[0];
            bounds = equationData.getRaster().bounds;
            for (i = 0; i < positionSeed.length; i += 2) {
                flexDomain(positionSeed[i], positionSeed[i + 1]);
            }
            gridSize = this.engine.grid._getGridDistance([bounds.width, bounds.height]);
            gridSize = [Math.abs(gridSize[0]), Math.abs(gridSize[1])];

            flexDomain(positionSeed[0] - gridSize[0] / 2, positionSeed[1] - gridSize[1] / 2);
            flexDomain(positionSeed[0] + gridSize[0] / 2, positionSeed[1] + gridSize[1] / 2);
            equationData.setCurveMinima([visibleDomain.xmin, visibleDomain.ymin]);
            equationData.setCurveMaxima([visibleDomain.xmax, visibleDomain.ymax]);

        },


        "changeImageOpacity": function(opacity) {
            var transform = this.engine.transform,
                dottedBorder,
                dottedBorderLength, i;
            if (transform) {
                dottedBorder = transform._dottedBorder;
                dottedBorderLength = dottedBorder.length;
                for (i = 0; i < dottedBorderLength; i++) {
                    dottedBorder[i].opacity = opacity;
                }
                transform._rotationDandi.opacity = opacity;
                transform._rotationPoint.opacity = opacity;
            }
            this.equation.getRaster().opacity = opacity;
        },
        "editImage": function() {
            var topLeft, raster, engine = this.engine,
                canvasBounds,
                TEXT_TOOL_PADDING = 5,
                editorOptions;

            if (this.text !== null) {
                raster = this.equation.getRaster();
                topLeft = {
                    "x": raster.position.x - raster.width / 2,
                    "y": raster.position.y - raster.height / 2
                };
                this.changeImageOpacity(0);
                engine.textToolView.on('getBase64', this.onNewImageFound);
                canvasBounds = {
                    "left": TEXT_TOOL_PADDING,
                    "top": engine.dgtUI.$el.parent().find('.dgt-menu-holder').height() + TEXT_TOOL_PADDING,
                    "height": engine.grid._canvasSize.height - engine.grid._scrollBarManager._scrollButtonSize - 2 * TEXT_TOOL_PADDING,
                    "width": engine.grid._canvasSize.width - engine.grid._scrollBarManager._scrollButtonSize - 2 * TEXT_TOOL_PADDING
                };
                editorOptions = {
                    "height": raster.height,
                    "width": raster.width,
                    "text": this.text,
                    "counter": engine.textToolCounter++,
                    "topLeft": topLeft,
                    "openModal": true,
                    "basePath": engine.dgtUI.model.basepath,
                    "offset": engine.dgtUI.$el.parent().find('.dgt-menu-holder').height(),
                    "csvData": null,
                    "isAccessible": MathUtilities.Tools.Dgt.Models.DgtEngine.isAccessible,
                    "canvasBounds": canvasBounds,
                    "isReEdit": true
                };
                engine.textToolView.loadEditor(editorOptions);
            }
        },

        "changeText": function(base64, text, top, left) {
            var equationRaster = this.equation.getRaster(),
                raster,
                engine = this.engine,
                equationData = this.equation,
                transformationView,
                TransformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView;
            if (equationRaster) {
                transformationView = TransformationGridView.getTransformationGridViewObject(engine.dgtUI.model.dgtPaperScope, engine, equationRaster);
                transformationView.removeTransformation();
                transformationView._grid.removeDrawingObject(equationRaster);
            }

            this.base64 = base64;

            engine.grid._projectLayers.textLayer.activate();
            this.text = text;
            engine.dgtUI.model.dgtPaperScope.activate();
            raster = new engine.dgtUI.model.dgtPaperScope.Raster({
                "source": base64
            });
            raster.equation = equationData;
            equationData.setRaster(raster);


            raster.onLoad = _.bind(function() {
                var posX, posY, gridPos;
                posY = top + raster.height / 2;
                posX = left + raster.width / 2;
                gridPos = engine.grid._getGraphPointCoordinates([posX, posY]);
                equationData.setPoints([gridPos]);

                this.setMatrixToRaster(this.matrix);
                this.setRasterPosition(gridPos);

                equationData.trigger('change-equation', equationData);

                if (engine.isSelected(this)) {
                    this.setTransformationObject();
                } else {
                    engine._select(this);
                    this.engine.accessibilityView.hoverEntity(self);
                }
            }, this);
        },

        "onNewImageFound": null,

        "_showPreloader": function(position) {
            if (this._preloader) {
                return;
            }
            var from = 0,
                through = Math.PI,
                to = 1.5 * through,
                grid = this.engine.grid,
                radius = 5;
            this._preloader = new this.engine.dgtUI.model.dgtPaperScope.Path.Arc(from, through, to, radius);
            grid.activateNewLayer('service');

            this.engine.dgtUI.model.dgtPaperScope.view.onFrame = _.bind(function() {
                var angle = 10;
                this._preloader.rotate(angle);
            }, this);
            this._preloader.position.x = position[0];
            this._preloader.position.y = position[1];
            this._preloader.strokeColor = 'black';
            this._preloader.strokeWidth = 3;

            grid.activateEarlierLayer();
        },


        "_hidePreloader": function() {
            if (this._preloader) {
                this._preloader.remove();
            }
        },

        "initiateImage": function(engine, image, position, isCropped) {
            var paperScopeCenter, propertiesBarHeight,
                dgtUI, DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;

            this.setEngine(engine);
            dgtUI = engine.dgtUI;
            if (!this.properties) {
                this.setProperties();
            }
            paperScopeCenter = dgtUI.model.dgtPaperScope.view.center;

            propertiesBarHeight = dgtUI.$('.math-utilities-properties-tool-bar').height();
            if (!position) {
                position = [paperScopeCenter.x, paperScopeCenter.y + propertiesBarHeight / 2, 0, 0];
            }

            if (this.species === 'image') {
                this.data = image;
            }

            if (!isCropped && image) {

                if (image && image.indexOf('data:image') === 0) {
                    this._loadImageData(image, position);
                    if (this.species === 'text' && !DgtEngine.isReset && !DgtEngine.restoreKind) {
                        this.isImageLoading = false;
                    }
                } else {
                    this.isImageLoading = true;
                    if (this.properties.binaryInvisibility === 0) {
                        this._showPreloader(position);
                    }
                    MathUtilities.Components.ImageManager.loadImage(image, _.bind(function(data, dimensions) {
                        if (data) {
                            this._loadImageData(data, position, dimensions);
                        } else {
                            this._hidePreloader();
                            this.scheduledForIncineration = true;
                        }
                        this.isImageLoading = false;
                        if (this.scheduledForIncineration) {
                            this.incinerate();
                        }
                    }, this), this.textSize);
                }
            } else if (isCropped) {

                this.setRasterData(this.equation.getRaster());

                this.engine.plotter.addEquation(this.equation);

                this.engine.grid._gridGraphModelObject.get('_images').push(this.equation);

            }
            engine.acknowledgeEntity(this);

            //to update visibility
            this.setVisibility(this.properties.binaryInvisibility, this.properties.binaryInvisibility & 1 ? 1 : null);

            dgtUI.model.dgtPaperScope.view.draw();
            engine.grid.on('image-roll-over', _.bind(this.onImageRollOver, this))
                .on('image-roll-out', _.bind(this.onImageRollOut, this));
        },

        "_loadImageData": function(image, position, dimensions) {
            this._hidePreloader();
            var rasterImage = null,
                visibleWidth, visibleHeight, offset = 70,
                engine = this.engine,
                dgtUI = engine.dgtUI,
                scaleFactorWidth, imgHeight, propertiesBarHeight = dgtUI.$('.math-utilities-properties-tool-bar').height(),
                imgWidth, scaleFactorHeight,
                scale, gridPosition, isText,
                dgtPaperScopeView = dgtUI.model.dgtPaperScope.view;

            //append the data:image/png;base64, header if its text and the header is absent
            //this is done to maintain consistency with construction and WB
            if (this.species === 'text' && image && typeof image === 'string' && image.indexOf('data:') === -1) {
                image = 'data:image/png;base64,' + image;
            }

            isText = this.species === 'text';
            rasterImage = engine.plotter.addImage(image, this.equation, position, isText);

            if (position) {
                gridPosition = engine.grid._getGraphPointCoordinates(position);
            }

            visibleWidth = dgtPaperScopeView.size.width - offset; // to make handles visible
            visibleHeight = dgtPaperScopeView.size.height - offset - propertiesBarHeight; // considering height of properties bar.

            imgWidth = dimensions ? dimensions[0] : rasterImage.width;
            imgHeight = dimensions ? dimensions[1] : rasterImage.height;

            if (this.matrix) {
                //possible when setdata while restoring the images
                this.setMatrixToRaster(this.matrix);
            } else if (this.species !== 'text' && (imgWidth > visibleWidth || imgHeight > visibleHeight)) {

                scaleFactorWidth = visibleWidth / imgWidth;
                scaleFactorHeight = visibleHeight / imgHeight;
                scale = Math.min(scaleFactorWidth, scaleFactorHeight);
                rasterImage.scale(scale);
                rasterImage.position.x = position[0];
                rasterImage.position.y = position[1];
                this.matrix = rasterImage.matrix.clone();
            }
            if (this.x === null || this.y === null) {
                //cause problems with transformation otherwise
                this.setRasterPosition(gridPosition);
            } else {
                this.setRasterPosition([this.x, this.y]);
            }

            this.setRasterData(rasterImage);

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

            this.updateVisibleDomain();

            engine.grid._projectLayers.gridLayer.activate();

            this.setVisibility(this.properties.binaryInvisibility, this.properties.binaryInvisibility & 1 ? 1 : null);
            geomFunctions.nudgeRaster(rasterImage);

            if (engine.selected.indexOf(this) > -1) {
                this.setTransformationObject();
            }
        },

        "update": function(updateData) {
            if (this._incinerated) {
                return;
            }
            var oData,
                genesis = updateData.genesis,
                caller = updateData.caller,
                newPosition = updateData.newPosition,
                forceDrawing = updateData.forceDrawing,
                updateDataObject = _.extend(MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData(), updateData);

            if (!(forceDrawing & this.TRAVEL_TEST) && genesis !== this && this.creator) {
                oData = this.getTransformedMatrix(this.creator, 'offspring', caller, newPosition);
            }

            updateDataObject.seed = oData;
            this.setImageSeed(updateDataObject);

        },

        "setImageSeed": function(updateData) {
            var loopVar,
                updateDataObject,
                imageSeed, caller,
                relocatedEntities = updateData.relocatedEntities,
                forceDrawing, len,
                transformationView, engine = this.engine,
                transformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView;
            if (!relocatedEntities) {
                relocatedEntities = [];
            }

            if (relocatedEntities.indexOf(this) > -1) {
                return;
            }
            imageSeed = updateData.seed;
            caller = updateData.caller;
            forceDrawing = updateData.forceDrawing;

            relocatedEntities.push(this);

            updateDataObject = _.extend(MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData(), updateData);
            updateDataObject.relocatedEntities = relocatedEntities;

            updateDataObject.caller = this;
            updateDataObject.dx = NaN;
            updateDataObject.dy = NaN;

            if (!(forceDrawing & this.TRAVEL_TEST) && imageSeed) {
                this.setMatrixToRaster(imageSeed.matrix);
                this.setRasterPosition(imageSeed.position);

                if ($.inArray(this, engine.selected) > -1) {
                    transformationView = transformationGridView.getTransformationGridViewObject(engine.dgtUI.model.dgtPaperScope, engine, this.equation.getRaster());
                    transformationView._locatePoints();
                }
                this.updateVisibleDomain();
            }
            if (this.properties.binaryInvisibility & this.INVALID) {
                return;
            }

            if (this.creator && caller && relocatedEntities.indexOf(this.creator) === -1) {
                this.creator.moveRelatives(updateDataObject);
            }

            len = this._childrenRelationships.length;
            for (loopVar = 0; loopVar < len; loopVar++) {
                this._childrenRelationships[loopVar].moveRelatives(updateDataObject);
            }
        },

        "_whileTransforming": function(event, transformationType, newCenterX, newCenterY) {

            var deltaX, deltaY, engine = this.engine,
                grid = engine.grid,
                imageRaster = this.equation.getRaster(),
                gridCoords,
                oldCanvasCoords = grid._getCanvasPointCoordinates([this.x, this.y]),
                updateDataObject, postDragData,
                DgtObject = MathUtilities.Tools.Dgt.Models.DgtObject,
                newMatrix = imageRaster.matrix,
                transformationView,
                transformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView;

            this.matrix._a = newMatrix._a;
            this.matrix._b = newMatrix._b;
            this.matrix._c = newMatrix._c;
            this.matrix._d = newMatrix._d;
            this.matrix._tx = 0;
            this.matrix._ty = 0;

            if (transformationType === 'dragging') {

                deltaX = newCenterX - oldCanvasCoords[0];
                deltaY = newCenterY - oldCanvasCoords[1];

                postDragData = DgtObject.createPostDragDataObject();
                postDragData.equation = this.equation;
                postDragData.deltaX = deltaX;
                postDragData.deltaY = deltaY;

                this.onPostDrag(postDragData);
            } else {
                imageRaster.position.x = newCenterX;
                imageRaster.position.y = newCenterY;

                gridCoords = grid._getGraphPointCoordinates([imageRaster.position.x, imageRaster.position.y]);

                this.x = gridCoords[0];
                this.y = gridCoords[1];

                this.equation.setPoints([gridCoords]);

                /*update matrix of related images*/

                updateDataObject = DgtObject.createUpdateData();
                updateDataObject.genesis = this;
                updateDataObject.newPosition = gridCoords;
                updateDataObject.caller = this;
                updateDataObject.relocatedEntities = [];
                updateDataObject.forceDrawing = this.TRAVEL_NORMAL;

                this.update(updateDataObject);
            }
            this.updateVisibleDomain();
        },
        "onImageRollOver": function() {
            var DgtStatusMessage = MathUtilities.Tools.Dgt.Models.DgtStatusMessage;
            if (this.text) {
                DgtStatusMessage.getStatusString('cursor', 'text', 'select');
            } else {
                DgtStatusMessage.getStatusString('cursor', 'image', 'select');
            }
        },
        "onImageRollOut": function() {
            MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'leave');
        },
        "getMatrixOfSourceImage": function() {
            if (this.creator) {
                return this.creator.getSource(0).getEquationMatrix();
            }
            return void 0;
        },

        "cropImage": function() {
            var engine = this.engine;
            engine._cropImageObj.off('okClicked', this.createCropImageRelation).on('okClicked', this.createCropImageRelation);
            engine._cropImageObj.setCropRect(this.equation.getRaster());
            engine.dgtUI.model.dgtPaperScope.view.draw();
        },

        "setImageProperties": function(allowTransformation, isCropped) {
            this.allowTransformation = allowTransformation;
            this.isGeneratedFromCroppedIamge = this.isCropped = isCropped;
        },

        "updateOriginalImage": function(deltaX, deltaY, reverse) {
            var imageRaster = this.equation.getRaster(),
                translationParams = {},
                matrixToPerformTransformation, originalImagePosition, centerToTransformCanvasCoordinates,
                transformedCenterCanvasCoords, transformedImageCenter;

            if (reverse) {
                translationParams.dx = -deltaX;
                translationParams.dy = -deltaY;

            } else {
                translationParams.dx = deltaX;
                translationParams.dy = deltaY;
            }


            matrixToPerformTransformation = this.getEquationMatrix().clone();

            originalImagePosition = imageRaster.position;
            centerToTransformCanvasCoordinates = [originalImagePosition.x, originalImagePosition.y];

            this.translateImage(matrixToPerformTransformation, translationParams);
            transformedCenterCanvasCoords = geomFunctions.translatePoint(centerToTransformCanvasCoordinates[0], centerToTransformCanvasCoordinates[1], translationParams);
            transformedImageCenter = this.engine.grid._getGraphPointCoordinates(transformedCenterCanvasCoords);

            imageRaster.equation.setPoints([transformedImageCenter]);

            imageRaster.position.x = transformedCenterCanvasCoords[0];
            imageRaster.position.y = transformedCenterCanvasCoords[1];
            geomFunctions.nudgeRaster(imageRaster);

            this.x = transformedImageCenter[0];
            this.y = transformedImageCenter[1];
        },

        "getTransformedMatrix": function(relation, target, movedParent, newPosition) {
            var matrixToPerformTransformation, transformedMatrix, creationMethod = relation.getCreationMethod(),
                params = relation.getParamValues(),
                tx, ty, r, angle,
                centerToTransformPosition, centerToTransformCanvasCoordinates,
                transformedImageCenter, degreeToRadians = Math.PI / 180,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                anchorData, sourceObject, oppositeParams;

            if (relation.anchor) {
                anchorData = DgtEngine.getDataOfEntity(relation.anchor, movedParent, newPosition);
            }

            function calculateTransformationFactor() {
                if (params.coordinateSystem === 'cartesian') {
                    tx = params.dx;
                    ty = params.dy;
                } else if (params.coordinateSystem === 'polar') {
                    r = params.r;
                    angle = params.angle * degreeToRadians;
                    tx = r * Math.cos(angle);
                    ty = r * Math.sin(angle);
                }
            }
            if (target === 'offspring') {
                sourceObject = relation.getSource(0);

                matrixToPerformTransformation = sourceObject.getEquationMatrix();
                centerToTransformPosition = [sourceObject.x, sourceObject.y];
                centerToTransformCanvasCoordinates = this.engine.grid._getCanvasPointCoordinates(centerToTransformPosition);

                switch (creationMethod) {
                    case 'translate':
                        calculateTransformationFactor();
                        transformedMatrix = matrixToPerformTransformation;
                        transformedImageCenter = [centerToTransformPosition[0] + tx, centerToTransformPosition[1] + ty];
                        break;

                    case 'rotate':

                        transformedMatrix = geomFunctions.getRotatedImageMatrix(matrixToPerformTransformation, anchorData, params);

                        transformedImageCenter = geomFunctions.rotatePoint(centerToTransformPosition[0], centerToTransformPosition[1], anchorData[0], anchorData[1], params.angle, true);


                        break;


                    case 'dilate':
                        transformedMatrix = geomFunctions.getDilatedImageMatrix(matrixToPerformTransformation, centerToTransformCanvasCoordinates, anchorData, params);

                        transformedImageCenter = geomFunctions.dilatePoint(centerToTransformPosition[0], centerToTransformPosition[1], anchorData[0], anchorData[1], params);

                        break;
                    case 'reflect':
                        transformedMatrix = this.reflectImage(matrixToPerformTransformation, anchorData);
                        transformedImageCenter = geomFunctions.reflectPointAroundLine(centerToTransformPosition[0], centerToTransformPosition[1], anchorData.a, anchorData.b, anchorData.c);
                        break;
                }
            } else {
                sourceObject = relation.offspring;
                matrixToPerformTransformation = sourceObject.getEquationMatrix();
                centerToTransformPosition = [sourceObject.x, sourceObject.y];

                centerToTransformCanvasCoordinates = this.engine.grid._getCanvasPointCoordinates(centerToTransformPosition);


                switch (creationMethod) {
                    case 'translate':
                        calculateTransformationFactor();
                        transformedMatrix = matrixToPerformTransformation;
                        transformedImageCenter = [centerToTransformPosition[0] - tx, centerToTransformPosition[1] - ty];
                        break;

                    case 'rotate':

                        oppositeParams = {
                            "angle": -params.angle
                        };

                        transformedMatrix = geomFunctions.getRotatedImageMatrix(matrixToPerformTransformation, anchorData, oppositeParams);

                        transformedImageCenter = geomFunctions.rotatePoint(centerToTransformPosition[0], centerToTransformPosition[1], anchorData[0], anchorData[1], oppositeParams.angle, true);


                        break;


                    case 'dilate':
                        params = {
                            "ratio": 1 / params.ratio
                        };
                        transformedMatrix = geomFunctions.getDilatedImageMatrix(matrixToPerformTransformation, centerToTransformCanvasCoordinates, anchorData, params);

                        transformedImageCenter = geomFunctions.dilatePoint(centerToTransformPosition[0], centerToTransformPosition[1], anchorData[0], anchorData[1], params);

                        break;
                    case 'reflect':
                        transformedMatrix = this.reflectImage(matrixToPerformTransformation, anchorData);
                        transformedImageCenter = geomFunctions.reflectPointAroundLine(centerToTransformPosition[0], centerToTransformPosition[1], anchorData.a, anchorData.b, anchorData.c);
                        break;
                }

            }

            transformedMatrix._tx = 0;
            transformedMatrix._ty = 0;

            return {
                "matrix": transformedMatrix,
                "position": transformedImageCenter
            };
        },
        "translateImage": function(matrix, params) {
            return geomFunctions.getTranslatedImageMatrix(matrix, params);
        },

        "dilateImage": function(matrix, matrixCenter, anchor, params) {
            return geomFunctions.getDilatedImageMatrix(matrix, matrixCenter, anchor, params);
        },


        "reflectImage": function(matrix, anchor) {
            return geomFunctions.getReflectedImageMatrix(matrix, anchor, this.engine.grid._getCanvasPointCoordinates([anchor.x1, anchor.y1]));
        },


        "setEngine": function(engine) {
            this.engine = engine;
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
        },

        "getMatrixString": function(matrix) {
            if (matrix) {
                return 'a:' + matrix._a + ' b:' + matrix._b + ' c:' + matrix._c + ' d:' + matrix._d + ' tx:' + matrix._tx + ' ty:' + matrix._ty;
            }
            return 'null matrix';
        },


        "incinerate": function() {
            if (this._incinerated) {
                return;
            }
            if (this.isImageLoading) {
                this.scheduledForIncineration = true;
                return;
            }
            var transformationView,
                indexSelected,
                engine = this.engine,
                TransformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView;

            this._incinerated = true;
            this.isImageLoading = null;
            this.scheduledForIncineration = null;
            indexSelected = engine.selected.indexOf(this);
            if (indexSelected !== -1) {
                engine.selected.splice(indexSelected, 1);
                transformationView = TransformationGridView.getTransformationGridViewObject(engine.dgtPaperScope, engine, this.equation.getRaster());
                transformationView.removeTransformation();
            }

            this.trigger('incinerated', this);
            engine.plotter.removeEquation(this.equation);
            this._transformationDetached();
            if (this.creator) {
                this.creator.incinerate();
            }
            while (this._childrenRelationships.length > 0) {
                this._childrenRelationships[0].incinerate();
            }

            delete this.equation;
        },

        "setTransformationObject": function() {

            var engine,
                raster = this.equation.getRaster(),
                transformationGridView, callToSetTransformation;

            if (!raster) {
                return;
            }

            engine = this.engine;
            callToSetTransformation = _.bind(function() {
                var flag;
                transformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView.getTransformationGridViewObject(engine.dgtUI.model.dgtPaperScope, engine, raster);
                if (transformationGridView._currentSelectedShape !== null) {
                    if (!transformationGridView.isSurroundedAroundImage()) {
                        transformationGridView._locatePoints();
                    }
                    return;
                }
                /* Sets flag depending on the shape selected, to enable rotate and/or resize handlers */
                flag = this.properties.locked ? 0 : (this.text ? 2 : 3);
                transformationGridView.setTransformationObject(raster, engine.grid, flag);

                this.equation.off('detach-transformation', this._transformationDetached)
                    .on('detach-transformation', this._transformationDetached)
                    .off('transformation-complete', this._updateRaster)
                    .on('transformation-complete', this._updateRaster)
                    .off('transformation-rotate-start', this._transformationStart)
                    .on('transformation-rotate-start', this._transformationStart)
                    .off('transformation-resize-start', this._transformationStart)
                    .on('transformation-resize-start', this._transformationStart)
                    .off('transformation-move-start', this._transformationStart)
                    .on('transformation-move-start', this._transformationStart)
                    .off('transforming', this._whileTransforming)
                    .on('transforming', this._whileTransforming, this);
            }, this);

            if (raster.isEmpty()) {
                raster.onLoad = callToSetTransformation;
            } else {
                callToSetTransformation();
            }

        },
        "setCropRect": function() {
            var radius = 5,
                minLength = 40,
                engine = this.engine,
                item = engine.selected[0].equation.getRaster(),
                transform = engine.transform,
                item2 = item.clone(),
                mouseDown, cropResult,
                group, circleTL, circleTR, circleBL, circleBR, circleGroup,
                cropRectHeight = 0.50 * item.getBounds().height,
                cropRectWidth = 0.50 * item.getBounds().width,
                cropRectSize = [cropRectWidth, cropRectHeight],
                cropRectPosition = new transform._paperScope.Point(item.getBounds().centerX - cropRectWidth / 2, item.getBounds().centerY - cropRectHeight / 2);
            this._layer = engine.grid._projectLayers.serviceLayer;
            this._layer.activate();
            this._cropRectangle = new transform._paperScope.Path.Rectangle(cropRectPosition, cropRectSize);
            this._cropRectangle.fillColor = 'transparent';
            item.opacity = 0.3;

            group = new transform._paperScope.Group(this._cropRectangle, item2);
            group.opacity = 0.99;
            group.clipped = true;
            circleTL = new transform._paperScope.Path.Circle(this._cropRectangle.bounds.topLeft, radius);
            circleTR = new transform._paperScope.Path.Circle(this._cropRectangle.bounds.topRight, radius);
            circleBL = new transform._paperScope.Path.Circle(this._cropRectangle.bounds.bottomLeft, radius);
            circleBR = new transform._paperScope.Path.Circle(this._cropRectangle.bounds.bottomRight, radius);
            circleGroup = new transform._paperScope.Group({
                "children": [circleTL, circleTR, circleBL, circleBR],
                "fillColor": '#8a57de'
            });


            group.onDoubleClick = _.bind(function() {
                cropResult = item.getSubRaster([this._cropRectangle.bounds.topLeft.x, this._cropRectangle.bounds.topLeft.y], [this._cropRectangle.bounds.bottomRight.x, this._cropRectangle.bounds.bottomRight.y]);

                cropResult.position = this._cropRectangle.bounds.center;
                this.equation.setRaster(cropResult);
                item.remove();
                item2.remove();
                circleGroup.remove();
                group.remove();

            }, this);

            group.onMouseDrag = _.bind(function(event) {
                mouseDown = new transform._paperScope.Point(event.point.x - event.delta.x, event.point.y - event.delta.y);
                if (mouseDown.isInside(this._cropRectangle)) {
                    if (this._cropRectangle.bounds.topRight.x + event.delta.x > item.bounds.topRight.x) {
                        this._cropRectangle.position.x = item.bounds.topRight.x - this._cropRectangle.bounds.width / 2;
                    } else if (this._cropRectangle.bounds.topLeft.x + event.delta.x < item.bounds.topLeft.x) {
                        this._cropRectangle.position.x = item.bounds.topLeft.x + this._cropRectangle.bounds.width / 2;
                    } else if (this._cropRectangle.bounds.topLeft.y + event.delta.y < item.bounds.topLeft.y) {
                        this._cropRectangle.position.y = item.bounds.topLeft.y + this._cropRectangle.bounds.height / 2;
                    } else if (this._cropRectangle.bounds.bottomLeft.y + event.delta.y > item.bounds.bottomLeft.y) {
                        this._cropRectangle.position.y = item.bounds.bottomLeft.y - this._cropRectangle.bounds.height / 2;
                    } else {
                        this._cropRectangle.position.x += event.delta.x;
                        this._cropRectangle.position.y += event.delta.y;
                    }
                    this.updateCirclePositions(circleGroup);
                }
            }, this);
            circleTL.onMouseDrag = _.bind(function(event) {
                if (circleTR.position.x - event.point.x > minLength && circleBL.position.y - event.point.y > minLength) {
                    if (event.point.x < item.bounds.topLeft.x) {
                        this._cropRectangle.bounds.topLeft.x = item.bounds.topLeft.x;
                    } else if (event.point.y < item.bounds.topLeft.y) {
                        this._cropRectangle.bounds.topLeft.y = item.bounds.topLeft.y;
                    } else {
                        this._cropRectangle.bounds.topLeft = event.point;
                    }

                } else if (circleTR.position.x - event.point.x < minLength) {
                    this._cropRectangle.bounds.topLeft.x = this._cropRectangle.bounds.topRight.x - minLength;
                } else {
                    this._cropRectangle.bounds.topLeft.y = this._cropRectangle.bounds.bottomLeft.y - minLength;
                }
                this.updateCirclePositions(circleGroup);
            }, this);
            circleTR.onMouseDrag = _.bind(function(event) {
                if (event.point.x - circleTL.position.x > minLength && circleBR.position.y - event.point.y > minLength) {
                    if (event.point.x > item.bounds.topRight.x) {
                        this._cropRectangle.bounds.topRight.x = item.bounds.topRight.x;
                    } else if (event.point.y < item.bounds.topRight.y) {
                        this._cropRectangle.bounds.topRight.y = item.bounds.topRight.y;
                    } else {
                        this._cropRectangle.bounds.topRight = event.point;
                    }
                } else if (event.point.x - circleTL.position.x < minLength) {
                    this._cropRectangle.bounds.topRight.x = this._cropRectangle.bounds.topLeft.x + minLength;
                } else {
                    this._cropRectangle.bounds.topRight.y = this._cropRectangle.bounds.bottomRight.y - minLength;
                }
                this.updateCirclePositions(circleGroup);
            }, this);
            circleBL.onMouseDrag = _.bind(function(event) {
                if (circleBR.position.x - event.point.x > minLength && event.point.y - circleTL.position.y > minLength) {
                    if (event.point.y > item.bounds.bottomLeft.y) {
                        this._cropRectangle.bounds.bottomLeft.y = item.bounds.bottomLeft.y;
                    } else if (event.point.x < item.bounds.bottomLeft.x) {
                        this._cropRectangle.bounds.bottomLeft.x = item.bounds.bottomLeft.x;
                    } else {
                        this._cropRectangle.bounds.bottomLeft = event.point;
                    }
                } else if (circleBR.position.x - event.point.x < minLength) {
                    this._cropRectangle.bounds.bottomLeft.x = this._cropRectangle.bounds.bottomRight.x - minLength;
                } else {
                    this._cropRectangle.bounds.bottomLeft.y = this._cropRectangle.bounds.topLeft.y + minLength;
                }
                this.updateCirclePositions(circleGroup);
            }, this);
            circleBR.onMouseDrag = _.bind(function(event) {
                if (event.point.x - circleBL.position.x > minLength && event.point.y - circleTR.position.y > minLength) {
                    if (event.point.y > item.bounds.bottomRight.y) {
                        this._cropRectangle.bounds.bottomRight.y = item.bounds.bottomRight.y;
                    } else if (event.point.x > item.bounds.bottomRight.x) {
                        this._cropRectangle.bounds.bottomRight.x = item.bounds.bottomRight.x;
                    } else {
                        this._cropRectangle.bounds.bottomRight = event.point;
                    }
                } else if (event.point.x - circleBL.position.x < minLength) {
                    this._cropRectangle.bounds.bottomRight.x = this._cropRectangle.bounds.bottomLeft.x + minLength;
                } else {
                    this._cropRectangle.bounds.bottomRight.y = this._cropRectangle.bounds.topRight.y + minLength;
                }
                this.updateCirclePositions(circleGroup);
            }, this);
            transform._paperScope.view.draw();
        },

        "updateCirclePositions": function(circleGroup) {
            var bounds = this._cropRectangle.bounds;
            circleGroup.children[0].position = bounds.topLeft;
            circleGroup.children[1].position = bounds.topRight;
            circleGroup.children[2].position = bounds.bottomLeft;
            circleGroup.children[3].position = bounds.bottomRight;
        },

        "getData": function() {
            var imageJSON = {
                    "id": null,
                    "equation": null,
                    "base64": null,
                    "matrix": {},
                    "incinerated": null
                },
                tempMatrix = {},
                mat;

            imageJSON.id = this.id;
            imageJSON.division = this.division;

            //this could be base64 or just image url
            imageJSON.data = this.data;

            imageJSON.equation = this.equation.getData();
            imageJSON.text = this.text;
            imageJSON.species = this.species;
            imageJSON.cropRectTopLeft = this.cropRectTopLeft;
            imageJSON.cropRectBottomRight = this.cropRectBottomRight;
            imageJSON.properties = this.properties;
            imageJSON.serialNumber = this.serialNumber;
            if (this.species === 'text' && this.equation && this.equation.getRaster()) {
                imageJSON.textSize = {
                    "width": this.equation.getRaster().width,
                    "height": this.equation.getRaster().height
                };
            }
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
            imageJSON.incinerated = this._incinerated;

            return imageJSON;
        },
        "getEquationMatrix": function() {
            if (!this.matrix) {
                return void 0;
            }
            var tempMatrix = this.matrix.clone();
            //SH: changing approach to fetch matrix of the data instead of the visual
            if (!tempMatrix) {
                tempMatrix = this.equation.getRaster().matrix.clone();
                this.matrix = tempMatrix;
            }
            return tempMatrix;
        },

        "getMatrixInObjectForm": function(matrixInArrayForm) {
            var loopCtr, matrixInObjectForm = {},
                len = matrixInArrayForm.length,
                objectData = ['_a', '_b', '_c', '_d', '_tx', '_ty'];

            //starting index from 1 as zeroth index contains 'matrix' as string...
            for (loopCtr = 1; loopCtr < len; loopCtr++) {
                matrixInObjectForm[objectData[loopCtr - 1]] = matrixInArrayForm[loopCtr];
            }

            return matrixInObjectForm;
        },

        "setData": function(imageJson, engine) {

            var updateDataObject,
                data, canvasPosition;
            this.id = imageJson.id;

            this.engine = engine;

            //first set data and then init the image
            this.matrix = new engine.grid._paperScope.Matrix(imageJson.matrix._a, imageJson.matrix._c, imageJson.matrix._b, imageJson.matrix._d, imageJson.matrix._tx, imageJson.matrix._ty);

            this.equation.setData(imageJson.equation);
            this.x = imageJson.x;
            this.y = imageJson.y;

            if (!isNaN(imageJson.serialNumber)) {
                this.serialNumber = imageJson.serialNumber;
                this.equation.depthLevel = imageJson.serialNumber;
            }

            canvasPosition = engine.grid._getCanvasPointCoordinates([this.x, this.y]);

            if (imageJson.serialNumber !== void 0 && imageJson.serialNumber !== null) {
                this.properties = imageJson.properties;
            }
            //set species before initiate image
            this.species = imageJson.species;

            if (this.species === 'text') {
                data = imageJson.text; // for text
            } else if (typeof imageJson.base64 === 'string') {
                data = imageJson.base64; // image base64
            } else {
                data = imageJson.data; // if data contains url
            }
            if (imageJson.textSize) {
                this.textSize = imageJson.textSize;
            }
            this.initiateImage(engine, data, [canvasPosition[0], canvasPosition[1], 0, 0]);

            this.cropRectTopLeft = imageJson.cropRectTopLeft;
            this.cropRectBottomRight = imageJson.cropRectBottomRight;
            if (imageJson.division) {
                this.division = imageJson.division;
            }
            this.text = imageJson.text;

            if (this.equation.getRaster()) {
                this.equation.getRaster().onLoad = _.bind(function() {
                    if (this._incinerated) {
                        return;
                    }
                    this.setMatrixToRaster(this.matrix);
                    this.setRasterPosition([this.x, this.y]);
                    updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                    this.update(updateDataObject);
                    this.isImageLoading = false;
                    if (this.scheduledForIncineration) {
                        this.incinerate();
                    }
                }, this);
            }
        },

        "isPositionValid": function() {
            return geomFunctions.isPaperRenderableValue(this.x) && geomFunctions.isPaperRenderableValue(this.y);
        },

        "isMatrixValid": function() {
            return !this.isInvalidMatrix(this.matrix);
        },

        "setRasterPosition": function(position) {
            var canvasPosition = this.engine.grid._getCanvasPointCoordinates(position),
                equationRaster, equationPosition,
                equationData = this.equation;

            this.x = position[0];
            this.y = position[1];

            if (this.isPositionValid()) {
                equationPosition = equationData.getPoints();
                if (equationPosition) {
                    equationPosition = equationPosition[0];
                    equationPosition[0] = position[0];
                    equationPosition[1] = position[1];
                }

                equationData.trigger('change-equation', equationData);
                equationRaster = equationData.getRaster();
                if (equationRaster) {
                    equationRaster.position.x = canvasPosition[0];
                    equationRaster.position.y = canvasPosition[1];
                }

            }

            this.changeObjectVisibility(this.isPositionValid() && this.isMatrixValid(), this.INVALID);
        },

        "isInvalidMatrix": function(matrix) {
            return !(matrix && isFinite(matrix._a) && isFinite(matrix._b) && isFinite(matrix._c) && isFinite(matrix._d) && isFinite(matrix._tx) && isFinite(matrix._ty));
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

            this.changeObjectVisibility(this.isPositionValid() && this.isMatrixValid(), this.INVALID);

        },

        "toString": function() {
            return this.id;
        }

    });
})(window.MathUtilities);
