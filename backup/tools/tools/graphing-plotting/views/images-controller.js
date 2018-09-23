/* globals _, geomFunctions, $, window  */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Components.ImageAsset = MathUtilities.Components.ImageAsset || {};
    MathUtilities.Components.ImageAsset.templates = MathUtilities.Components.ImageAsset.templates || {};
    MathUtilities.Tools.Graphing.Views.ImagesController = Backbone.View.extend({
        "_gridGraphView": null,
        "_plotterView": null,
        "_graphingToolView": null,
        "_selectedImages": null,
        "_imageHandlerCollection": null,
        "undoRedoData": null,
        "rasterData": null,
        "imageCollection": [],
        "initialize": function() {
            this._graphingToolView = this.options.graphingTool;
            this._plotterView = this.options.plotterView;
            this._gridGraphView = this.options.gridGraph;
            this.$el = this._graphingToolView.$el;
            this.imageAssetView = new MathUtilities.Components.ImageAssetView({
                "model": new MathUtilities.Components.ImageAssetModel({
                    "id": 'select-image',
                    "text": 'Enter Asset GUID'
                }),
                "el": this.$("#image-list-container")
            });

            this._selectedImages = [];
            this.undoRedoData = [];
            this._imageHandlerCollection = [];
            this.addImage = _.bind(function addImage(addedImage) {
                var length = this._imageHandlerCollection.length,
                    fileElem,
                    fileElemCopy, hasError,
                    imageView = this._imageHandlerCollection[length - 1];

                if (addedImage === void 0) {
                    fileElem = this.$('#file-input');
                    fileElemCopy = fileElem.clone();
                    fileElemCopy.attr('id', 'file-input1');
                    this.$el.append(fileElemCopy);
                    fileElemCopy.on('change', _.bind(imageView.readImage, this));
                    if (fileElemCopy) {
                        fileElemCopy.trigger('click');
                    }
                } else {
                    //call add image from engine
                    imageView = new MathUtilities.Tools.Graphing.Views.ImageHandler({
                        "graphingTool": this._graphingToolView,
                        "gridGraph": this._gridGraphView,
                        "plotterView": this._plotterView,
                        "imagesController": this
                    });
                    hasError = imageView.readImage(addedImage);
                    if (!hasError) {
                        this._imageHandlerCollection.push(imageView);
                    }

                }

            }, this);
            this.imageAssetView.on('assetImageSelected', _.bind(this.addImage, this));

            this.on('add-raster', _.bind(function(imageRaster, imageHandlerView, callforUndoRedo, isRetrieve) {
                _.delay(_.bind(function() {
                    this._imageAdded(imageRaster, imageHandlerView, callforUndoRedo, isRetrieve);
                }, this), 10);
            }, this));
        },
        "_imageAdded": function(imageRaster, imageHandlerView, callforUndoRedo, isRetrieve) {
            var transformationView = MathUtilities.Tools.Graphing.Views.ImageTransformation.getTransformationGridViewObject(this._gridGraphView._paperScope,
                    this, imageRaster.equation.getRaster(), this._gridGraphView.$el),
                undoRedoData;
            if (!callforUndoRedo) {
                undoRedoData = {
                    "undo": {
                        "type": 'image',
                        "actionType": 'deleteImage',
                        "rasterId": null

                    },
                    "redo": {
                        "type": 'image',
                        "actionType": 'addImage',
                        "images": []

                    }
                };
                undoRedoData.undo.rasterId = imageHandlerView.id;
                undoRedoData.redo.images.push(imageHandlerView.getData());
                undoRedoData.undo.actionType = 'deleteImage';
                undoRedoData.redo.actionType = 'addImage';
                this._graphingToolView.execute('addImage', undoRedoData);

                this._selectedImages.push(imageRaster);
            } else {
                if (this._selectedImages.indexOf(imageRaster) === -1) {
                    this._selectedImages.push(imageRaster);
                }
                if (this._selectedImages.length === this.savedState.images.length) {
                    this.selectForRetrieve(isRetrieve);
                }
            }
            this.$el.parents('.math-utilities-components-tool-holder').focus();
            this.rasterData = transformationView.getRasterDataForAcc();
            this.rasterData.rasterImage = imageRaster;
            this.imageCollection.push(imageRaster);
            this._graphingToolView.trigger('add-paper-items', false, 'image');
        },
        "selectForRetrieve": function(isRetrieve) {
            var loopVar, loopVar1, length1,
                savedSelectedLength,
                length, selectedArray = [],
                imageRaster,
                newImage;
            if (!this.savedState.selectedImages || this.savedState.selectedImages.length === 0) {
                length1 = this.savedState.images.length;
                for (loopVar = 0; loopVar < length1; loopVar++) {
                    selectedArray.push(this.savedState.images[loopVar].id);
                }
                savedSelectedLength = 0;
            } else {
                selectedArray = this.savedState.selectedImages;
                length1 = selectedArray.length;
            }

            this.deselectAll();

            length = this._imageHandlerCollection.length;
            for (loopVar1 = 0; loopVar1 < length1; loopVar1++) {
                newImage = selectedArray[loopVar1];
                for (loopVar = 0; loopVar < length; loopVar++) {
                    imageRaster = this._imageHandlerCollection[loopVar].getRasterForView();
                    if (newImage === imageRaster.handlerId) {
                        if (savedSelectedLength === 0 && isRetrieve) {
                            this.bringImageToFront(imageRaster);
                        } else {
                            this.selectImage(imageRaster);
                        }
                        break;
                    }
                }
            }
        },
        "callAddImage": function(event, loadReader) {
            var reader;
            if (!loadReader) {
                //call this._addNewImage() here to load through url on add-image btn click
                this.openAddImageModal(event);
                return;
            }
            reader = new FileReader();
            reader.onload = _.bind(function() {
                this.addImage(event);
            }, this);
            if (event.target.files.length > 0) {
                reader.readAsDataURL(event.target.files[0]);
            }
        },
        "openAddImageModal": function(event) {
            var imgPreload,
                self = this;
            if (event.shiftKey && event.altKey) {
                this.imageAssetView.open();
            } else {
                $.de.browse({
                    "actionType": 'choose',
                    /* Search able and Non-Search able Images asset type guides */
                    "assetTypeGuid": "3123B3AD-3C2D-49CF-92CE-9927C3C09E64,1AA883F4-B310-4A5A-9D35-D07DC8CADF6C,7859E39F-7300-4A63-86C9-8446E5B32037,89CB88BC-1B04-4DE2-8986-E82F65DF2755",
                    "onComplete": function(evt) {
                        if (evt) {
                            $.ajax({
                                "url": "/api:mediafiles/list/",
                                "data": {
                                    "assetGuidList": evt.content.guid,
                                    "typeidlist": 37
                                }
                            }).always(function(resp) {
                                imgPreload = new Image();
                                imgPreload.onload = function() {
                                    self.addImage({
                                        "img": imgPreload.src
                                    });
                                };
                                imgPreload.src = resp.data[0].mediaFileUrl;
                            });
                        }
                    }
                });
            }
        },
        "_addNewImage": function($fileInput) {
            if ($fileInput) {
                $fileInput.trigger('click');
            }
        },
        "deselectImage": function(imageRaster) {
            var transformationView = MathUtilities.Tools.Graphing.Views.ImageTransformation.getTransformationGridViewObject(this._gridGraphView._paperScope,
                this, imageRaster.equation.getRaster(), this._gridGraphView.$el);
            transformationView.removeTransformation();
        },
        "deselectAll": function() {
            var ImageTransformation = MathUtilities.Tools.Graphing.Views.ImageTransformation,
                transformationView;
            if (ImageTransformation.occupiedTransformationViews !== null) {
                while (ImageTransformation.occupiedTransformationViews.length > 0) {
                    transformationView = ImageTransformation.occupiedTransformationViews[0];
                    transformationView.removeTransformation();
                }
            }
            this._selectedImages = [];
            this._graphingToolView.hideDeleteImage();
        },
        "onPostDrag": function(postDragData) {
            var point, wheel, hamster,
                gridDistance, pointsGroup,
                item,
                imageCords = [],
                imagePosition,
                imgCanvasPos, imageHandler,
                grid = this._gridGraphView,
                equation, deltaX,
                deltaY,
                selectionPrison = MathUtilities.Tools.Graphing.Views.ImageTransformation.occupiedTransformationViews;

            equation = postDragData.equation;
            deltaX = postDragData.deltaX;
            deltaY = postDragData.deltaY;


            point = equation.getParent();
            if (!point) {
                return;
            }

            pointsGroup = equation.getPathGroup();
            if (pointsGroup === void 0) {
                return;
            }

            gridDistance = grid._getGridDistance([deltaX, deltaY]);
            for (wheel in selectionPrison) {
                hamster = selectionPrison[wheel];
                item = hamster.model.get('_item');
                imageHandler = this.getImageHandlerFromRaster(item);

                imageCords = imageHandler.equation.getPoints()[0];
                imagePosition = imageHandler.equation.getRaster().position;
                imageCords[0] += gridDistance[0];
                imageCords[1] += gridDistance[1];
                imageHandler.equation.setPoints([imageCords]);
                imageHandler.x = imageCords[0];
                imageHandler.y = imageCords[1];
                imgCanvasPos = this._gridGraphView._getCanvasPointCoordinates(imageCords);
                imagePosition.x = imgCanvasPos[0];
                imagePosition.y = imgCanvasPos[1];
                geomFunctions.nudgeRaster(imageHandler.equation.getRaster());


                hamster._locatePoints();
            }

        },
        "createPostDragDataObject": function() {

            var postDragDataObject = {
                "clone": function() {
                    var c = {},
                        looper;
                    for (looper in this) {
                        c[looper] = this[looper];
                    }
                    return c;
                }
            };

            postDragDataObject.equation = null;
            postDragDataObject.deltaX = null;
            postDragDataObject.deltaY = null;
            postDragDataObject.position = null;
            postDragDataObject.forceDrawing = null;
            postDragDataObject.eventName = null;
            postDragDataObject.imageRaster = null;

            return postDragDataObject;


        },
        "getSelectedImageCount": function() {
            return this._selectedImages.length;
        },
        "updateImageHandlerCollection": function(handlerId, newIndex) {
            var imageHandler, length,
                loopVar;
            length = this._imageHandlerCollection.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                imageHandler = this._imageHandlerCollection[loopVar];
                if (imageHandler.id === handlerId) {
                    this._imageHandlerCollection.splice(loopVar, 1);
                    break;
                }
            }
            if (newIndex) {
                this._imageHandlerCollection.splice(newIndex, 0, imageHandler);
            } else {
                this._imageHandlerCollection.push(imageHandler);
            }
        },
        "bringImageToFront": function(imageRaster) {
            imageRaster.bringToFront();
        },

        "selectImage": function(imageRaster, isSelectOnly) {
            var transformationView = MathUtilities.Tools.Graphing.Views.ImageTransformation.getTransformationGridViewObject(this._gridGraphView._paperScope, this,
                    imageRaster.equation.getRaster(), this._gridGraphView.$el),
                FLAG_VALUE = 3,
                index = this._selectedImages.indexOf(imageRaster);
            if (isSelectOnly && index !== -1) {
                this._selectedImages.splice(index, 1);
                index = -1;
            }
            if (index === -1) {
                transformationView.setTransformationObject(imageRaster, this._gridGraphView, FLAG_VALUE);
                this._selectedImages.push(imageRaster);
                this._graphingToolView.showDeleteImage();
                this.rasterData = transformationView.getRasterDataForAcc();
                this.rasterData.rasterImage = imageRaster;
            } else {
                transformationView.removeTransformation();
                this._selectedImages.splice(index, 1);
                if (this._selectedImages.length === 0) {
                    this._graphingToolView.hideDeleteImage();
                }
            }
            this.updateImageHandlerCollection(imageRaster.handlerId);
        },
        "callDeleteImage": function(event, callForReset) {
            var length, imageList = [],
                counter,
                undoRedoData = {
                    "undo": {
                        "type": 'image',
                        "actionType": 'addImage'
                    },
                    "redo": {
                        "type": 'image',
                        "actionType": 'deleteImage'
                    }
                },
                ret = true;
            undoRedoData.undo.images = [];
            if (callForReset) {
                length = this._imageHandlerCollection.length;
                for (counter = 0; counter < length; counter++) {
                    imageList.push(this._imageHandlerCollection[counter].equation.getRaster());
                }
            } else {
                imageList = this._selectedImages.slice();
            }
            length = imageList.length;
            if (length > 0) {
                for (counter = 0; counter < length; counter++) {
                    undoRedoData.undo.images.push(this.deleteImage(imageList[counter]));
                }
                if (!callForReset) {
                    undoRedoData.redo.images = undoRedoData.undo.images.slice();
                    this._graphingToolView.execute('deleteImage', undoRedoData);
                }
                this._selectedImages = [];
                ret = false;
            }
            return ret;
        },
        "callReset": function(event) {

            var undoRedoData = this.saveAllImagesData();

            this.callDeleteImage(event, true);
            return undoRedoData;
        },
        "saveAllImagesData": function() {
            var counter,
                selectedImages = this._selectedImages.slice(),
                selectedId = [],
                undoRedoData,
                length = selectedImages.length;
            for (counter = 0; counter < length; counter++) {
                selectedId.push(selectedImages[counter].handlerId);
            }
            undoRedoData = {
                "images": [],
                "selectedImages": selectedId
            };
            this._selectedImages = this._gridGraphView._projectLayers.imageLayer.children;
            length = this._selectedImages.length;
            for (counter = 0; counter < length; counter++) {
                undoRedoData.images.push(this.getImageHandlerFromRaster(this._selectedImages[counter]).getData());
            }
            return undoRedoData;
        },
        "callDeleteForUndoRedo": function(actionName, undoRedoData) {
            var entity, imageView, length, counter;
            if (actionName === 'addImage') {
                imageView = this.getEntityFromId(undoRedoData.rasterId);
                entity = imageView.equation.getRaster();
                this.deleteImage(entity, imageView);
                this._selectedImages.splice(this._selectedImages.indexOf(entity), 1);
            } else {
                length = undoRedoData.images.length;
                if (length > 0) {
                    for (counter = length - 1; counter >= 0; counter--) {
                        imageView = this.getEntityFromId(undoRedoData.images[counter].rasterId);
                        this.deleteImage(undoRedoData.images[counter], imageView);
                    }
                }
                this._selectedImages = [];
            }

        },
        "callAddForUndoRedo": function(undoRedoData, isRetrieve) {
            var length = undoRedoData.images.length,
                newImage, loopVar;
            this.savedState = undoRedoData;
            for (loopVar = 0; loopVar < length; loopVar++) {
                newImage = new MathUtilities.Tools.Graphing.Views.ImageHandler({
                    "graphingTool": this._graphingToolView,
                    "gridGraph": this._gridGraphView,
                    "plotterView": this._plotterView,
                    "imagesController": this
                });
                this._imageHandlerCollection.push(newImage);
                newImage.setData(undoRedoData.images[loopVar], isRetrieve);
            }

        },
        "deleteImage": function(entity, imageHandlerView) {
            var imageRaster = entity.equation.getRaster(),
                transformationView,
                undoData;
            if (!imageRaster) {
                imageRaster = imageHandlerView.equation.getRaster();
                entity.equation = imageHandlerView.equation;
            }
            transformationView = MathUtilities.Tools.Graphing.Views.ImageTransformation.getTransformationGridViewObject(this._gridGraphView._paperScope, this,
                imageRaster, this._gridGraphView.$el);
            if (!imageHandlerView) {
                imageHandlerView = this.getImageHandlerFromRaster(entity);
            }
            undoData = imageHandlerView.getData();
            transformationView.removeTransformation();
            imageHandlerView._transformationDetached();
            this._gridGraphView.deleteImage(entity.equation);
            this._plotterView.removeEquation(entity.equation);
            this._graphingToolView.hideDeleteImage();
            this._imageHandlerCollection.splice(this._imageHandlerCollection.indexOf(imageHandlerView), 1);
            imageHandlerView.remove();
            this.imageCollection.splice(this.imageCollection.indexOf(imageRaster), 1);
            return undoData;

        },
        "getImageHandlerFromRaster": function(imageRaster) {
            var rasterEqnCid = imageRaster.handlerId,
                length = this._imageHandlerCollection.length,
                counter;
            for (counter = 0; counter < length; counter++) {
                if (this._imageHandlerCollection[counter].id === rasterEqnCid) {
                    return this._imageHandlerCollection[counter];
                }
            }

        },
        "getEntityFromId": function(id) {
            var length = this._imageHandlerCollection.length,
                counter;
            for (counter = 0; counter < length; counter++) {
                if (this._imageHandlerCollection[counter].id === id) {
                    return this._imageHandlerCollection[counter];
                }
            }
        },
        "saveDataOnRelocate": function(relocateData) {

            var equation = relocateData.equation,
                delX = relocateData.delX,
                delY = relocateData.delY,
                position = relocateData.position,
                actionName = relocateData.actionName,
                selectionEntity = this.getEntityFromId(relocateData.id),
                eventName = relocateData.eventName,
                redoData, undoData, prevPosition,
                selectedArray = this._selectedImages.slice(),
                postDragDataObject = this.createPostDragDataObject();

            postDragDataObject.equation = equation;
            postDragDataObject.deltaX = 0;
            postDragDataObject.deltaY = 0;
            postDragDataObject.position = position;
            postDragDataObject.forceDrawing = this.TRAVEL_FORCE;
            postDragDataObject.eventName = eventName;

            this.onPostDrag(postDragDataObject);
            redoData = {
                "deltaX": delX,
                "deltaY": delY,
                "position": position,
                "actionName": actionName,
                "equation": selectionEntity.equation,
                "selectedEntities": selectedArray,
                "id": relocateData.id
            };
            prevPosition = this._gridGraphView._getGraphPointCoordinates(position);
            prevPosition[0] = prevPosition[0] - delX;
            prevPosition[1] = prevPosition[1] - delY;
            prevPosition = this._gridGraphView._getCanvasPointCoordinates(prevPosition);
            undoData = {
                "deltaX": -delX,
                "deltaY": -delY,
                "position": prevPosition,
                "actionName": actionName,
                "equation": selectionEntity.equation,
                "selectedEntities": selectedArray,
                "id": relocateData.id
            };
            redoData.matrix = selectionEntity.getEquationMatrix();
            undoData.matrix = selectionEntity.undoRedoData[0].matrix;
            this._graphingToolView.execute('transformImage', {
                "undo": {
                    "type": 'image',
                    "actionType": 'goToPrevPosition',
                    "undoData": undoData
                },
                "redo": {
                    "type": 'image',
                    "actionType": 'goToNewPosition',
                    "redoData": redoData
                }
            });
        },
        "isImageSelected": function(imageRaster) {
            return this._selectedImages.indexOf(imageRaster) !== -1;
        },
        "undoRedoTransformation": function(undoRedoData) {

            var currentData,
                currentEntity,
                currentCoordinates = [],
                raster,
                entityToBeSelected, currentCanvasCoordinates = [],
                updateData,
                i, length,
                ImageTransformation = MathUtilities.Tools.Graphing.Views.ImageTransformation,
                postDragDataObject,
                transformationView;
            if (undoRedoData.actionType === 'goToPrevPosition') {
                currentData = undoRedoData.undoData;
            } else {
                currentData = undoRedoData.redoData;
            }
            currentEntity = this.getEntityFromId(currentData.id);
            currentCoordinates = this._gridGraphView._getGraphPointCoordinates(currentData.position);

            updateData = currentEntity.createUpdateData();
            updateData.caller = currentEntity;
            updateData.seed = {
                "matrix": currentData.matrix,
                "position": currentCoordinates
            };
            if (currentData.actionName !== 'dragging') {
                currentEntity.setImageSeed(updateData);
            }

            length = currentData.selectedEntities.length;
            if (length > 1) {
                for (i = 1; i < length; i++) {
                    raster = currentData.selectedEntities[i];
                    entityToBeSelected = this.getImageHandlerFromRaster(raster);
                    raster = entityToBeSelected.equation.getRaster();
                    if (entityToBeSelected !== currentEntity) {
                        this.selectImage(raster, true);
                        transformationView = ImageTransformation.getTransformationGridViewObject(this._gridGraphView._paperScope, this, raster,
                            this._gridGraphView.$el);
                        transformationView._locatePoints();
                    }

                }
            } else {
                this.deselectAll();
                currentEntity.dragging = false;
                raster = currentEntity.equation.getRaster();
                this.selectImage(raster, true);
                transformationView = ImageTransformation.getTransformationGridViewObject(this._gridGraphView._paperScope, this, raster, this._gridGraphView.$el);
                transformationView._locatePoints();
            }
            currentCanvasCoordinates = this._gridGraphView._getCanvasPointCoordinates(currentCoordinates);
            if (currentData.actionName !== 'dragging') {
                currentEntity.equation.trigger('transforming:graphing', void 0, currentData.actionName, currentCanvasCoordinates[0], currentCanvasCoordinates[1]);
            } else {
                currentCanvasCoordinates = this._gridGraphView._getCanvasDistance([currentData.deltaX, currentData.deltaY]);
                postDragDataObject = this.createPostDragDataObject();
                postDragDataObject.equation = currentEntity.equation;
                postDragDataObject.deltaX = currentCanvasCoordinates[0];
                postDragDataObject.deltaY = currentCanvasCoordinates[1];
                postDragDataObject.position = currentData.position;
                postDragDataObject.forceDrawing = currentEntity.TRAVEL_FORCE;
                this.onPostDrag(postDragDataObject);
            }
            this._graphingToolView.setFocusRectPosition(transformationView.getRasterDataForAcc().bottomRight);
            this._gridGraphView.refreshView();

            currentEntity.updateVisibleDomain();


            this._gridGraphView.updateVisibleDomain();
        }
    });

}(window.MathUtilities));
