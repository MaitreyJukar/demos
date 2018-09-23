/*globals _, $, window, geomFunctions */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Dgt.Models.DgtEngine = Backbone.Model.extend({
        "points": null,

        "_undergoingOperation": null,
        "immatureRelation": null,
        "grid": null,
        "plotter": null,
        "notationEngine": null,
        "anchor": null,
        "selected": null,
        "rolledOver": null,
        "id": null,
        "indexForIntersection": null,
        "entityMap": {},
        "defaultProperties": {},
        "annotations": null,
        "markings": null,
        "parameterCount": null,
        "activeMarkings": null,
        "_latestMarking": null,
        "_previousMarking": null,
        "shapes": null,
        "debugMarkVector": true,
        "currentPasteData": null,
        "images": null,
        "measures": null,
        "interiors": null,
        "_cropImageObj": null,
        "isCroppingInProgress": null,
        "pathsBetweenEntities": null,
        "possible": [],
        "dgtUI": null,
        "clipBoardData": null,
        "selectionSteal": null,
        "_drawingMode": 'ray',
        "isPreviousAnnotation": false,
        "isSaveRestoreData": false,
        "pointEventsEnabled": null,
        "hiddenObjects": null,
        "pointShapeMap": null,
        "relationShips": null,
        "lastImageRaster": null,
        "gridPattern": null,
        "gridShown": null,
        "annotation": null,
        "textToolCounter": null,
        "textToolView": null,
        "nameInPopup": '',
        "_directiveStack": null,
        "_unsettledPoint": null,
        "selectionPrison": null,
        "_standardObjectIds": null,
        "_standardObjects": null,
        "eventListenerCanvas": null,
        "_annotationPaths": null,
        "incompleteAnnotations": null,
        "_selectionRectStart": null,
        "_selectionRect": null,
        "_firstPoint": null,
        "hackForLocked": null,
        "accessibilityView": null,
        "allEntities": [],
        "accManager": null,

        /**
         * Holds undoRedoManager model Object
         * @property _undoRedoManager
         * @type {Object}
         */
        "_undoRedoManager": null,

        /**
         * Holds undoRedoManager view Object
         * @property _undoManagerView
         * @type {Object}
         */
        "_undoManagerView": null,
        "isOwner": null,
        "lockUserMap": null,
        "userId": null,


        "initialize": function(options) {
            var defaultColor = '#424242';
            this.generateFunctionReference();

            this.points = [];
            this.selected = [];
            this.shapes = [];
            this.notations = [];
            this.images = [];
            this.pathArray = [];
            this.pointShapeMap = {};
            this.rolledOver = [];
            this.entityMap = {};
            this.relationShips = [];
            this.pointsMap = {};
            this.shapesMap = {};
            this.parameterCount = 1;
            this._directiveStack = [];
            this.annotations = [];
            this.measures = [];
            this.interiors = [];
            this.iterations = [];
            this.markings = [];
            this.purgatory = {
                "points": [],
                "shapes": [],
                "measures": [],
                "annotations": [],
                "images": [],
                "markings": [],
                "interiors": [],
                "notations": [],
                "iterations": []
            };
            this.incompleteAnnotations = [];
            this.clipBoardData = {
                "pasteData": {},
                "pasteCounter": 0
            };
            MathUtilities.Components.ImageManager.init();

            this.createTextTool();

            this._standardObjectIds = {
                "shapes": [],
                "points": []
            };
            this._doubleClickConstrainers = [];
            this.selectionPrison = [];

            this.activeMarkings = {
                "angle": [],
                "ratio": [],
                "vector": [],
                "distance": []
            };
            this.debugVariable = false;
            this.hiddenObjects = [];
            this.locked = [];
            //purposely passed by reference for common type species.
            this.setDefaultProperties(defaultColor);
            this._standardObjects = {};
            this.hackForLocked = false;
            this._unsettledPoint = null;
            this.gridShown = true;
            this.isSaveRestoreData = false;
            this.isCroppingInProgress = false;
            this.lockUserMap = {};
            this.hideUserMap = {};
            this.userId = "user";
            this.isOwner = null;

            this._operationOver = _.bind(function(operation) {
                this.dontWaitForTabletPoint();
                this._resetHitShapeColors();
                this.eventListenerCanvas.attachMouseMoveFunction(null);

                this.unscheduleMovingPointCreation();

                this._allowDoubleClickByModule('whileDrawing');

                operation.off('finish', this._operationOver)
                    .off('aborted', this._operationOver);

                if (this._undergoingOperation === operation) {
                    this._undergoingOperation = null;
                }
                this.grid.updateVisibleDomain();
            }, this);

            this._onEntityDelete = _.bind(function(entity) {

                var id = entity.id,
                    target, looper, index,
                    spliceTargetPropWithEntity;

                spliceTargetPropWithEntity = _.bind(function(targetObj, prop, currentEntity) {
                    var entityIndex, targetProp = targetObj[prop];

                    entityIndex = targetProp.indexOf(currentEntity);
                    if (entityIndex > -1) {
                        targetProp.splice(entityIndex, 1);
                    }
                }, this);

                entity.off('incinerated', this._onEntityDelete);

                spliceTargetPropWithEntity(this, 'locked', entity);

                if (this.entityMap[entity.id] && this.entityMap[entity.id] === entity) {
                    target = this;
                } else {
                    target = this.purgatory;
                }

                if (this.entityMap[entity.id]) {
                    target = this;
                } else {
                    target = this.purgatory;
                }

                switch (entity.division) {
                    case 'point':
                        entity.equation.off('post-drag', entity.onPostDrag)
                            .off('drag-begin', entity.onDragBegin)
                            .off('post-relocate', entity.onRelocate)
                            .off('roll-over', this._onRollOver)
                            .off('roll-out', this._onRollOut);

                        spliceTargetPropWithEntity(target, 'points', entity);
                        break;
                    case 'shape':
                        entity.equation.off('post-drag', entity.onPostDrag)
                            .off('drag-begin', entity.onDragBegin)
                            .off('post-relocate', entity.onRelocate)
                            .off('roll-over', this._onRollOver)
                            .off('roll-out', this._onRollOut);

                        spliceTargetPropWithEntity(target, 'shapes', entity);

                        break;
                    case 'measurement':
                        entity.equation.off('post-relocate', entity.onPreRelocate)
                            .off('pre-drag', entity.offDrag);

                        spliceTargetPropWithEntity(target, 'measures', entity);
                        break;

                    case 'image':
                        entity.equation.off('drag-begin', entity.onDragBegin);

                        spliceTargetPropWithEntity(target, 'images', entity);
                        if (this.transform) {
                            this.transform.removeTransformation();
                        }
                        break;
                    case 'marking':
                        spliceTargetPropWithEntity(target, 'markings', entity);
                        break;
                    case 'interior':
                        entity.equation.off('post-drag', entity.onPostDrag)
                            .off('drag-begin', entity.onDragBegin)
                            .off('post-relocate', entity.onRelocate);


                        entity.equation.off('roll-over', this._onRollOver)
                            .off('roll-out', this._onRollOut);

                        spliceTargetPropWithEntity(target, 'interiors', entity);
                        break;

                    case 'annotation':
                        entity.equation.off('post-drag', entity.onPostDrag)
                            .off('drag-begin', entity.onDragBegin)
                            .off('post-relocate', entity.onRelocate)
                            .off('roll-over', this._onRollOver)
                            .off('roll-out', this._onRollOut);

                        spliceTargetPropWithEntity(target, 'annotations', entity);
                        break;

                    case 'notation':
                        entity.equation.off('post-drag', entity.onPostDrag)
                            .off('drag-begin', entity.onDragBegin)
                            .off('post-relocate', entity.onRelocate)
                            .off('annotate-drag', this._onAnnotateDrag);

                        spliceTargetPropWithEntity(target, 'notations', entity);
                        break;

                    case 'iteration':
                        spliceTargetPropWithEntity(target, 'iterations', entity);
                        break;
                }
                if (this.entityMap[id] === entity) {
                    delete this.entityMap[id];
                }
                spliceTargetPropWithEntity(this, 'selected', entity);

                spliceTargetPropWithEntity(this, 'hiddenObjects', entity);

                spliceTargetPropWithEntity(this, 'rolledOver', entity);

                spliceTargetPropWithEntity(this, 'locked', entity);
                spliceTargetPropWithEntity(this, 'allEntities', entity);
            }, this);

            this._onRelationDelete = _.bind(function(relation) {
                relation.off('incinerated', this._onRelationDelete);
                if (this.relationShips.indexOf(relation) !== -1) {
                    this.relationShips.splice(this.relationShips.indexOf(relation), 1);
                }
            }, this);

            this._onRollOver = _.bind(function(equation) {
                var entity = equation.getParent(),
                    DgtStatusMessage = MathUtilities.Tools.Dgt.Models.DgtStatusMessage,
                    curPopup = this.dgtUI.model.dgtPopUpView.model.curPopupShown;
                if (this.selectionSteal) {
                    this.selectionSteal.rollOver(entity);
                    return;
                }
                if (entity._universe) {
                    if (this.rolledOver.indexOf(entity._universe) === -1) {
                        this.rolledOver.push(entity._universe);
                        this._updateDrawableColor(entity._universe);
                    }
                } else {
                    if (this.rolledOver.indexOf(entity) === -1) {
                        if (curPopup === 'properties' && (entity.division === 'annotation' || entity.properties.locked) ||
                            this._undergoingOperation && this._undergoingOperation.type === 'annotation' && ['ellipse', 'parabola', 'hyperbola'].indexOf(entity.species) > -1) {
                            return;
                        }
                        this.rolledOver.push(entity);
                        this._updateDrawableColor(entity);

                    }
                }
                if (curPopup === 'properties') {
                    DgtStatusMessage.getStatusString('cursor', 'properties-popup');
                } else {
                    if (entity.equation.getLabelData() && entity.equation.getLabelData().labelObject) {
                        DgtStatusMessage.getStatusString('cursor', entity.species + '-with-label', this.selected.indexOf(entity) > -1 ? 'deselect' : 'select', entity.species, entity.getLabelDataText());
                    } else if (entity._universe) {
                        DgtStatusMessage.getStatusString('cursor', 'iterate', this.selected.indexOf(entity._universe) > -1 ? 'deselect' : 'select', 'iterate');
                    } else if (entity.getCreationMethod() === 'axis') {
                        DgtStatusMessage.getStatusString('cursor', 'axis', this.selected.indexOf(entity) > -1 ? 'deselect' : 'select', 'axis');
                    } else {
                        DgtStatusMessage.getStatusString('cursor', entity.species, this.selected.indexOf(entity) > -1 ? 'deselect' : 'select', entity.species);
                    }
                }

            }, this);
            this._onRollOut = _.bind(function(equation) {
                var entity = equation.getParent();
                if (this.selectionSteal) {
                    this.selectionSteal.rollOut(entity);
                    return;
                }
                if (entity._universe) {
                    if (this.rolledOver.indexOf(entity._universe) > -1) {
                        this.rolledOver.splice(this.rolledOver.indexOf(entity._universe), 1);
                        this._updateDrawableColor(entity._universe, entity._universe.properties.color);
                    }
                } else {
                    if (this.rolledOver.indexOf(entity) > -1) {
                        this.rolledOver.splice(this.rolledOver.indexOf(entity), 1);
                        this._updateDrawableColor(entity, entity.properties.color);
                    }
                }
                if (this.dgtUI.model.dgtPopUpView.model.curPopupShown === 'properties') {
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'leave');
                } else {
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'grid', this.selected.length);
                }
            }, this);

            // UndoManager Object
            this._undoRedoManager = new MathUtilities.Components.Undo.Models.UndoManager({
                "maxStackSize": 20
            });
            this._undoManagerView = new MathUtilities.Components.Undo.Views.UndoManager({
                "el": options.dgtui.$el.parents('.math-utilities-components-tool-holder')
            });

            //notationEngine Object
            this.notationEngine = new MathUtilities.Tools.Dgt.Models.DgtNotationEngine({
                "engine": this,
                "grid": this.grid
            });

            this._undoManagerView.on('undo:actionPerformed', _.bind(function() {
                    this._callUndo();
                }, this))
                .on('redo:actionPerformed', _.bind(function() {
                    this._callRedo();
                }, this));
            this.on('calculator-state-change', this._onChangeCalculatorVisiblity)
                .on('properties-state-change', this.restoreClickEvents);
            MathUtilities.Tools.Dgt.Models.DgtEngine.setDefaultValuesForCounters();

        },

        "generateFunctionReference": function() {
            this._onZoomFunc = _.bind(this._onZoom, this);
            this._selectionRectCompleteFunc = _.bind(this._selectionRectComplete, this);
            this._createAnnotationMoveFunc = _.bind(this._createAnnotationMove, this);
        },

        "toolSizeChangeCallback": function() {
            var measure, looper, updateDataObject;

            for (measure in this.measures) {
                this.measures[measure].updateContainmentSize();
            }

            for (looper in this.markings) {
                if (this.markings[looper].species === 'vector' && this.markings[looper].markView) {
                    this.markings[looper].markView.update();
                }
            }
            for (looper in this.notations) {
                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                updateDataObject.genesis = this.notations[looper];
                this.notations[looper].update(updateDataObject);
            }
        },

        "onLabelRollOver": function() {
            MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'label');
        },

        "onLabelRollOut": function() {
            MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'leave');
        },

        "performPreviousOperation": function(index) {
            var previousOperation, DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation;
            if (index === 0 || index) {
                previousOperation = this.getDirectiveFromLast(index);
            } else {
                previousOperation = this.getDirectiveFromLast(1);
            }
            if (['draw', 'annotation'].indexOf(DgtOperation.getOperationType(previousOperation)) > -1 ||
                previousOperation === 'selectCursor') {
                if (previousOperation === 'selectCursor') {
                    this.dgtUI.model.dgtMenuView.selectMenu(0, null);
                }
                this.perform(previousOperation, DgtOperation.lastOperationData ? DgtOperation.lastOperationData.params : null);
            }
        },

        "waitForTabletPoint": function() {
            if (this.waitForTabletPoint) {
                return;
            }
            this.waitingForTabletClick = true;
        },

        "dontWaitForTabletPoint": function() {
            this.waitingForTabletClick = false;
        },


        "setDgtUi": function(dgtUI) {
            this.dgtUI = dgtUI;
            this.createUiDependentObjects();
        },
        "createUiDependentObjects": function() {
            this.eventListenerCanvas = new MathUtilities.Tools.Dgt.Models.DgtEventManager({
                "engine": this
            });
            this.accessibilityView = new MathUtilities.Tools.Dgt.Views.DgtAccessibility({
                "model": this
            });

        },

        "setDgtCalculatorManager": function(dgtCalculatorManager) {
            this.dgtCalculatorManager = dgtCalculatorManager;
        },
        "checkHitTestForAllObjects": function(canvasPosition, objectsToTestForHit, requiresSingleObject, checkInteriorSegment, considerLocked) {
            var key, ctr, objectSpecie,
                objects = [],
                checkHitTestForObject,
                hScrollBar = this.grid._scrollBarManager._horizontalScrollGroup._children,
                vScrollBar = this.grid._scrollBarManager._verticalScrollGroup._children,
                objectMappingForHitTest = {
                    // for hitPoint
                    "points": {
                        "points": this.points
                    },
                    // for hitShape
                    "allShapes": {
                        "shapes": this.shapes,
                        "standardObjects": [this._standardObjects.Xmirror, this._standardObjects.Ymirror],
                        "interiors": this.interiors
                    },

                    "allShapesAndPoints": {
                        "points": this.points,
                        "shapes": this.shapes,
                        "standardObjects": [this._standardObjects.Xmirror, this._standardObjects.Ymirror],
                        "interiors": this.interiors
                    },
                    "popupOptions": {
                        "points": this.points,
                        "notations": this.notations,
                        "shapes": this.shapes,
                        "standardObjects": [this._standardObjects.Xmirror, this._standardObjects.Ymirror],
                        "interiors": this.interiors
                    },
                    //For touch Devices tapping while Drawing...
                    "shapesAndPoints": {
                        "points": this.points,
                        "shapes": this.shapes,
                        "standardObjects": [this._standardObjects.Xmirror, this._standardObjects.Ymirror]
                    },
                    // for rollOver , select and drawing...
                    "all": {
                        "scrollBarElements": [
                            hScrollBar["horizontal-scroll"], hScrollBar["left-scroll-btn"], hScrollBar["right-scroll-btn"],
                            vScrollBar["vertical-scroll"], vScrollBar["upper-scroll-btn"], vScrollBar["lower-scroll-btn"]
                        ],
                        "serviceLayerElements": this.grid._projectLayers.serviceLayer._children,
                        "labels": this.grid._projectLayers.labelLayer._children,
                        "points": this.points,
                        "text": this.images,
                        "notations": this.notations,
                        "shapes": this.shapes,
                        "standardObjects": [this._standardObjects.Xmirror, this._standardObjects.Ymirror],
                        "interiors": this.interiors,
                        "images": this.images,
                        "annotations": this.annotations

                    },
                    //for image
                    "image": {
                        "serviceLayerElements": this.grid._projectLayers.serviceLayer._children
                    },
                    // for drawing notations...
                    "shapes": {
                        "shapes": this.shapes,
                        "standardObjects": [this._standardObjects.Xmirror, this._standardObjects.Ymirror]
                    },
                    // for roll over of notations in nonGeometricDrawing mode...
                    "notations": {
                        "notations": this.notations
                    }
                },
                transformationElements = ['tl', 'tr', 'bl', 'br', 'rotate', 'move'],
                drawingObjects;

            drawingObjects = objectMappingForHitTest[objectsToTestForHit];
            if (this.getOperationMode() === 'select') {
                for (key in drawingObjects) {
                    for (ctr in this.iterations) {
                        if (this.iterations[ctr][key] && this.iterations[ctr][key].length > 0) {
                            drawingObjects[key] = drawingObjects[key].concat(this.iterations[ctr][key]);
                        }
                    }
                }
            }
            for (key in drawingObjects) {
                for (ctr = drawingObjects[key].length - 1; ctr >= 0; ctr--) {
                    checkHitTestForObject = drawingObjects[key][ctr];
                    objectSpecie = checkHitTestForObject.species;
                    // since image and text are all pushed to this.images hence we
                    if (objectsToTestForHit === 'all' &&
                        (key === 'text' && objectSpecie !== 'text' || key === 'images' && objectSpecie !== 'image')) {
                        continue;
                    }

                    if (!considerLocked && checkHitTestForObject.properties &&
                        checkHitTestForObject.properties.locked) {
                        continue;
                    }

                    // For drawing notations on shapes...
                    if (objectsToTestForHit === 'shapes' && ['point', 'segment', 'ray', 'line', 'arc', 'circle'].indexOf(checkHitTestForObject.species) === -1) {
                        continue;
                    }

                    //For hit Test of points
                    if (objectsToTestForHit === 'points' &&
                        checkHitTestForObject === this._unsettledPoint) {
                        continue;
                    }

                    // Do not check for labels, serviceLayerElements and for those that are not visible or part of this operation...
                    if (key !== 'points' && this._undergoingOperation &&
                        this._undergoingOperation.isPartOfThisOperation(checkHitTestForObject.creator) || ['scrollBarElements', 'serviceLayerElements', 'labels'].indexOf(key) === -1 &&
                        checkHitTestForObject.properties.binaryInvisibility !== 0) {
                        continue;
                    }

                    if (key === 'scrollBarElements' &&
                        this.hitTestOfObjects(checkHitTestForObject, canvasPosition, checkInteriorSegment)) {
                        objects.push(checkHitTestForObject);
                    }

                    if (key === 'serviceLayerElements') {
                        if (!checkHitTestForObject.name ||
                            checkHitTestForObject.name &&
                            transformationElements.indexOf(checkHitTestForObject.name) === -1) {
                            continue;
                        }
                        if (this.hitTestOfObjects(checkHitTestForObject, canvasPosition, checkInteriorSegment)) {
                            objects.push(checkHitTestForObject);
                            break;
                        }
                    } else if (key !== 'labels' && key !== 'serviceLayerElements' && key !== 'scrollBarElements') {

                        if (this.hitTestOfObjects(checkHitTestForObject.equation, canvasPosition, checkInteriorSegment)) {
                            objects.push(checkHitTestForObject);
                        }
                    } else if (objectsToTestForHit === 'all' && key !== 'scrollBarElements') {
                        if (this.hitTestOfObjects(checkHitTestForObject, canvasPosition, checkInteriorSegment)) {
                            objects.push(checkHitTestForObject);
                        }
                    }

                    // Check hit for only single object if requiresSingleObject is set to true...
                    if (key === 'serviceLayerElements' && objects.length > 0) {
                        break;
                    }

                }
                if (objects.length > 0) {
                    objects.sort(function(a, b) {
                        return a.growthPhase === b.growthPhase ? 0 : (a.growthPhase < b.growthPhase ? 1 : -1);
                    });
                }
                // store the lasthitshape and undergoing operation hitshape while in drawing mode...
                if (requiresSingleObject && objectsToTestForHit === 'allShapes' && objects.length > 0) {
                    this._undergoingOperation.hitShape.push(objects[0]);
                    this.lastHitShape = objects[0];
                }

                if (objects.length > 0) {
                    return requiresSingleObject ? [objects[0]] : objects;
                }
            }
        },

        "hitTestOfObjects": function(equationData, hitPointCanvasCoords, checkInteriorSegment) {
            if (!equationData) {
                return void 0;
            }
            var constants,
                hitAreaCanvasDistAroundObject, raster,
                hitAreaGridDistAroundObject,
                radius, path, hitTest,
                leftSideInEquality, rightSideInEquality,
                semiMajorAxisDist,
                markerBounds, sources, extremePoint,
                parentData, imaginaryLineSeed, looper,
                noOfSources, firstEndPointOfSegment,
                secondEndPointOfSegment, lineSeed, data,
                creationMethod, intersectionPoint, windingNumber,
                centerPoint, perpendicularDistance,
                angleInRadian, offset, HALF_CIRCLE_ANGLE,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                species = equationData.getParent().species,
                hitPointGraphCoords = this.grid._getGraphPointCoordinates(hitPointCanvasCoords),
                hitPointGraphCoordsObj, THRICE = 3,
                orientation, CLOCKWISE_ORIENTATION = 1,
                COUNTER_CLOCKWISE_ORIENTATION = 2,
                arcAngle, distBetweenFociAndPointOnEllipse1,
                distBetweenFociAndPointOnEllipse2;

            switch (species) {
                case 'segment':
                case 'ray':
                case 'line':
                    hitAreaCanvasDistAroundObject = equationData.getDragHitThickness() / 2;
                    constants = equationData.getConstants();
                    hitAreaGridDistAroundObject = this.grid._getGridDistance([hitAreaCanvasDistAroundObject, 0])[0];
                    perpendicularDistance = Math.abs(constants.a * hitPointGraphCoords[0] + constants.b * hitPointGraphCoords[1] + constants.c) / Math.sqrt(Math.pow(constants.a, 2) + Math.pow(constants.b, 2));
                    hitTest = perpendicularDistance < hitAreaGridDistAroundObject;
                    if (hitTest && (species === 'segment' || species === 'ray')) {
                        hitTest = DgtEngine.isOnShape(constants, species, hitPointGraphCoords);
                    }
                    break;

                case 'point':
                case 'arc':
                case 'circle':
                case 'circleInterior':
                    hitAreaCanvasDistAroundObject = equationData.getDragHitThickness() / 2;
                    constants = equationData.getConstants();
                    hitAreaGridDistAroundObject = this.grid._getGridDistance([hitAreaCanvasDistAroundObject, 0])[0];
                    if (species === 'point') {
                        centerPoint = equationData.getPoints()[0];
                        radius = hitAreaGridDistAroundObject;
                        hitAreaGridDistAroundObject = 0;
                    } else {
                        centerPoint = [constants.a, constants.b];
                        radius = constants.r;
                    }
                    leftSideInEquality = geomFunctions.distance2(centerPoint[0], centerPoint[1], hitPointGraphCoords[0], hitPointGraphCoords[1]);
                    if (species === 'arc') {
                        rightSideInEquality = radius + hitAreaGridDistAroundObject;
                        angleInRadian = Math.atan2(hitPointGraphCoords[1] - centerPoint[1], hitPointGraphCoords[0] - centerPoint[0]);
                        hitTest = rightSideInEquality - leftSideInEquality > 0 && rightSideInEquality - leftSideInEquality <= 2 * hitAreaGridDistAroundObject && geomFunctions.isAngleInRegion(constants.from, constants.via, constants.to, angleInRadian);
                    }
                    if (species === 'circle' || species === 'point' || checkInteriorSegment && species !== 'arc') {
                        rightSideInEquality = radius + hitAreaGridDistAroundObject;
                        hitTest = leftSideInEquality <= rightSideInEquality;
                    }
                    if (species === 'circleInterior' || species === 'circle' && hitTest) {
                        rightSideInEquality = radius - hitAreaGridDistAroundObject;
                        hitTest = hitTest ? !(leftSideInEquality <= rightSideInEquality) : leftSideInEquality <= rightSideInEquality;
                    }
                    break;

                case 'ellipse':
                case 'ellipseInterior':
                    hitAreaCanvasDistAroundObject = equationData.getDragHitThickness() / 2;
                    constants = equationData.getConstants();
                    hitAreaGridDistAroundObject = this.grid._getGridDistance([hitAreaCanvasDistAroundObject, 0])[0];
                    distBetweenFociAndPointOnEllipse1 = geomFunctions.distance2(hitPointGraphCoords[0], hitPointGraphCoords[1], constants.i, constants.j);
                    distBetweenFociAndPointOnEllipse2 = geomFunctions.distance2(hitPointGraphCoords[0], hitPointGraphCoords[1], constants.k, constants.l);
                    semiMajorAxisDist = (distBetweenFociAndPointOnEllipse1 + distBetweenFociAndPointOnEllipse2) / 2;
                    if (species === 'ellipse' || checkInteriorSegment) {
                        hitTest = constants.a - hitAreaGridDistAroundObject < semiMajorAxisDist && semiMajorAxisDist < constants.a + hitAreaGridDistAroundObject;
                    } else if (species === 'ellipseInterior') {
                        hitTest = constants.a - hitAreaGridDistAroundObject >= semiMajorAxisDist;
                    }
                    break;

                case 'polygonInterior':
                    hitAreaCanvasDistAroundObject = equationData.getDragHitThickness() / 2;
                    hitAreaGridDistAroundObject = this.grid._getGridDistance([hitAreaCanvasDistAroundObject, 0])[0];

                    constants = equationData.getConstants();
                    sources = [];
                    for (looper = 0;; looper++) {
                        if (constants['x' + looper] === void 0 || constants['y' + looper] === void 0) {
                            break;
                        }
                        sources.push([constants['x' + looper], constants['y' + looper]]);
                    }
                    noOfSources = sources.length;

                    if (checkInteriorSegment) {
                        for (looper = 0; looper < noOfSources; looper++) {
                            firstEndPointOfSegment = sources[looper % noOfSources];
                            secondEndPointOfSegment = sources[(looper + 1) % noOfSources];
                            parentData = [firstEndPointOfSegment, secondEndPointOfSegment];
                            lineSeed = DgtShape.getLineSeed(parentData);
                            perpendicularDistance = Math.abs(lineSeed.a * hitPointGraphCoords[0] + lineSeed.b * hitPointGraphCoords[1] + lineSeed.c) / Math.sqrt(Math.pow(lineSeed.a, 2) + Math.pow(lineSeed.b, 2));
                            if (perpendicularDistance < hitAreaGridDistAroundObject && DgtEngine.isOnShape(lineSeed, 'segment', hitPointGraphCoords)) {
                                hitTest = true;
                                break;
                            }
                        }
                    } else {
                        windingNumber = 0;
                        markerBounds = this.grid.markerBounds;

                        extremePoint = {
                            "x": THRICE * markerBounds.max.x,
                            "y": hitPointGraphCoords[1]
                        };

                        hitPointGraphCoordsObj = {
                            "x": hitPointGraphCoords[0],
                            "y": hitPointGraphCoords[1]
                        };

                        for (looper = 0; looper < noOfSources; looper++) {
                            firstEndPointOfSegment = {
                                "x": sources[looper % noOfSources][0],
                                "y": sources[looper % noOfSources][1]
                            };
                            secondEndPointOfSegment = {
                                "x": sources[(looper + 1) % noOfSources][0],
                                "y": sources[(looper + 1) % noOfSources][1]
                            };
                            if (geomFunctions.doSegmentIntersect(firstEndPointOfSegment, secondEndPointOfSegment, hitPointGraphCoordsObj, extremePoint)) {
                                orientation = geomFunctions.orientation(firstEndPointOfSegment, hitPointGraphCoordsObj, secondEndPointOfSegment);
                                if (orientation === CLOCKWISE_ORIENTATION) {
                                    windingNumber++;
                                } else if (orientation === COUNTER_CLOCKWISE_ORIENTATION) {
                                    windingNumber--;
                                }
                            }
                        }
                        if (windingNumber !== 0) {
                            hitTest = true;
                        }
                    }
                    break;
                case 'arcSegmentInterior':
                    hitAreaCanvasDistAroundObject = equationData.getDragHitThickness() / 2;
                    hitAreaGridDistAroundObject = this.grid._getGridDistance([hitAreaCanvasDistAroundObject, 0])[0];
                    constants = equationData.getConstants();
                    firstEndPointOfSegment = [constants.x1, constants.y1];
                    secondEndPointOfSegment = [constants.x3, constants.y3];
                    parentData = [firstEndPointOfSegment, secondEndPointOfSegment];
                    lineSeed = DgtShape.getLineSeed(parentData);
                    perpendicularDistance = Math.abs(lineSeed.a * hitPointGraphCoords[0] + lineSeed.b * hitPointGraphCoords[1] + lineSeed.c) / Math.sqrt(Math.pow(lineSeed.a, 2) + Math.pow(lineSeed.b, 2));
                    if (checkInteriorSegment) {
                        if (perpendicularDistance < hitAreaGridDistAroundObject && DgtEngine.isOnShape(lineSeed, 'segment', hitPointGraphCoords)) {
                            hitTest = true;
                            break;
                        }
                    } else {
                        constants = equationData.getConstants();
                        centerPoint = [constants.a, constants.b];
                        radius = constants.r;
                        leftSideInEquality = geomFunctions.distance2(centerPoint[0], centerPoint[1], hitPointGraphCoords[0], hitPointGraphCoords[1]);
                        rightSideInEquality = radius;
                        if (checkInteriorSegment && perpendicularDistance < hitAreaGridDistAroundObject &&
                            DgtEngine.isOnShape(lineSeed, 'segment', hitPointGraphCoords) ||
                            leftSideInEquality >= rightSideInEquality) {
                            break;
                        }
                        HALF_CIRCLE_ANGLE = 180;
                        creationMethod = 'lineIntersection';
                        parentData = [
                            [centerPoint[0], centerPoint[1]],
                            [hitPointGraphCoords[0], hitPointGraphCoords[1]]
                        ];
                        imaginaryLineSeed = DgtShape.getLineSeed(parentData);
                        data = [imaginaryLineSeed, lineSeed];
                        intersectionPoint = this.getIntersectionPoint(data, creationMethod);
                        offset = geomFunctions.getPointOffset(centerPoint[0], centerPoint[1], intersectionPoint[0][0], intersectionPoint[0][1], hitPointGraphCoords[0], hitPointGraphCoords[1]);
                        arcAngle = Math.abs(geomFunctions.getArcAngle(constants));
                        if (arcAngle < HALF_CIRCLE_ANGLE && offset > 1 || arcAngle >= HALF_CIRCLE_ANGLE && offset <= 1) {
                            hitTest = true;
                            break;
                        }
                    }
                    break;

                case 'parabola':
                case 'hyperbola':
                    hitAreaCanvasDistAroundObject = equationData.getDragHitThickness() / 2;
                    hitAreaGridDistAroundObject = this.grid._getGridDistance([hitAreaCanvasDistAroundObject, 0])[0];
                    intersectionPoint = DgtShape.getClosestPointOnShape(species, hitPointGraphCoords, equationData.getParent().seed);
                    if (!intersectionPoint) {
                        hitTest = false;
                        break;
                    }
                    perpendicularDistance = geomFunctions.distance2(intersectionPoint[0], intersectionPoint[1], hitPointGraphCoords[0], hitPointGraphCoords[1]);
                    if (perpendicularDistance < hitAreaGridDistAroundObject) {
                        hitTest = true;
                    }
                    break;

                case 'image':
                case 'text':
                    raster = equationData.getRaster();
                    if (raster) {
                        hitTest = raster.hitTest(hitPointCanvasCoords);
                    }
                    break;

                case 'annotation':
                case 'angleMark':
                case 'tickMark':
                    path = equationData.getParent().getPath();
                    if (path) {
                        hitTest = path.hitTest(hitPointCanvasCoords);
                    }
                    break;

                default:
                    hitTest = equationData.hitTest(hitPointCanvasCoords);
                    break;
            }
            return hitTest;
        },



        "setGrid": function(plotter, grid) {
            this.plotter = plotter;
            this.grid = grid;
            this.grid.off('zooming', this._onZoomFunc).on('zooming', this._onZoomFunc);
            this.setDefaultPositionForPoint();
            this._downSensed = _.bind(function(event) {
                if (['properties', 'iterate', 'iterateToDepth'].indexOf(this.dgtUI.model.dgtPopUpView.model.curPopupShown) === -1 &&
                    this.getOperationMode() !== 'select' || !event.target.equation) {
                    return;
                }
                var target = event.target,
                    drawable = target.equation.getParent();

                if (this.selected.indexOf(drawable) > -1 || drawable._universe &&
                    this.selected.indexOf(drawable._universe) > -1) {
                    return;
                }
                this._select(drawable, null, event.sessionTimestamp);

            }, this);

            this._shapePointLayerMouseUp = _.bind(function(event) {
                if (!event.target.equation || this.getOperationMode() !== 'select' ||
                    this.dgtUI.model.dgtPopUpView.model.curPopupShown === 'properties') {
                    return;
                }
                var target = event.target,
                    shape;
                if (target && target.equation && target.equation.getParent()) {
                    shape = target.equation.getParent();
                } else {
                    return;
                }

                if (!event.sessionStats.dragged && event.sessionTimestamp !== shape.getLastSelectTimestamp() &&
                    this.selected.indexOf(shape) > -1) {
                    this._select(shape, false);
                }

            }, this);

            this._serviceLayerClick = _.bind(function(event) {
                if (event.target && event.target.name === 'move' &&
                    event.target.transformationView._currentSelectedShape) {
                    this._select(event.target.transformationView._currentSelectedShape.equation.getParent());
                }
            }, this);

            this._serviceLayerDownAndClick = _.bind(function(event) {
                this._imageLayerDownAndClick(event);

                if (!(event.target && event.target._parent && event.target._parent.transformationView)) {
                    return;
                }

                event.target._parent.transformationView.model.movingTarget = event.target;
                if (this.getOperationMode() === 'select') {
                    this.grid.on('grid-graph-mousedrag', event.target._parent.transformationView.onMouseMove)
                        .on('grid-graph-mouseup', event.target._parent.transformationView.onMouseUp);
                    event.target._parent.transformationView._calculatePositions();
                }
            }, this);

            this._shapeLayerAnnotate = _.bind(function(event) {
                this.notationEngine.shapeLayerAnnotateClick(event);
            }, this);

            this._pointLayerAnnotateStart = _.bind(function(event) {
                var target, pointObj;

                if (event) {
                    target = event.target;
                }

                if (target && target.equation) {
                    pointObj = target;
                }

                if (!(pointObj && pointObj.division === 'point')) {
                    return;
                }

                this.grid.off('grid-graph-mousedrag', this._gridLayerAnnotateDragFromPoint)
                    .on('grid-graph-mousedrag', this._gridLayerAnnotateDragFromPoint)
                    .off('point-layer-annotate-end', this._pointLayerAnnotateEnd)
                    .on('point-layer-annotate-end', this._pointLayerAnnotateEnd);

                this.notationEngine.pointLayerAnnotateStart(event);
            }, this);

            this._gridLayerAnnotateDragFromPoint = _.bind(function(event) {
                this.notationEngine.gridLayerAnnotateDragFromPoint(event);
            }, this);

            this._pointLayerAnnotateEnd = _.bind(function(event) {
                this.grid.off('grid-graph-mousedrag', this._gridLayerAnnotateDragFromPoint)
                    .off('point-layer-annotate-end', this._pointLayerAnnotateEnd);

                this.notationEngine.pointLayerAnnotateEnd();
            }, this);

            this._shapeLayerAnnotateStart = _.bind(function(event) {
                var key, target, shapeObj;

                if (event) {
                    target = event.target;
                }
                if (target && target.equation) {
                    shapeObj = target.equation.getParent();
                }

                if (!(shapeObj && ['line', 'ray', 'segment'].indexOf(shapeObj.species) > -1)) {
                    return;
                }

                this.notationEngine.shapeLayerAnnotateStart(event);

                this.grid.off('shape-layer-annotate-end', this._shapeLayerAnnotateEnd)
                    .on('shape-layer-annotate-end', this._shapeLayerAnnotateEnd);

                for (key in this.shapes) {
                    if (['line', 'ray', 'segment'].indexOf(this.shapes[key].species) > -1) {
                        this.shapes[key].equation.off('annotation-roll-over', this._annotateRollOverOnShape)
                            .on('annotation-roll-over', this._annotateRollOverOnShape)
                            .off('annotation-roll-out', this._annotateRollOutFromShape)
                            .on('annotation-roll-out', this._annotateRollOutFromShape);
                    }
                }
                for (key in this._standardObjects) {
                    if (['line', 'ray', 'segment'].indexOf(this._standardObjects[key].species) > -1) {
                        this._standardObjects[key].equation.off('annotation-roll-over', this._annotateRollOverOnShape)
                            .on('annotation-roll-over', this._annotateRollOverOnShape)
                            .off('annotation-roll-out', this._annotateRollOutFromShape)
                            .on('annotation-roll-out', this._annotateRollOutFromShape);
                    }
                }
            }, this);

            this._annotateRollOverOnShape = _.bind(function(equation, event) {
                this.notationEngine.annotateRollOverOnShape(equation, event);
            }, this);

            this._annotateRollOutFromShape = _.bind(function(equation, event) {
                this.notationEngine.annotateRollOutFromShape(equation, event);
            }, this);


            this._shapeLayerAnnotateEnd = _.bind(function(event) {
                var key, target, shapeObj, notationEngine;

                if (event.target) {
                    target = event.target;
                }

                if (target && target.equation) {
                    shapeObj = target.equation.getParent();
                }
                if (!shapeObj || shapeObj._universe || shapeObj.species === 'tickMark') {
                    return;
                }
                notationEngine = this.notationEngine;
                this.grid.off('shape-layer-annotate-end', this._shapeLayerAnnotateEnd);

                for (key in this.shapes) {
                    if (['line', 'ray', 'segment'].indexOf(this.shapes[key].species) > -1) {
                        this.shapes[key].equation.off('annotation-roll-over', this._annotateRollOverOnShape)
                            .off('annotation-roll-out', this._annotateRollOutFromShape);
                    }
                }

                if (notationEngine.endPt && notationEngine.considerationPoints.length > 0) {
                    notationEngine.drawAngleNotation();
                }

                this.eventListenerCanvas.notationFromShape = null;
                notationEngine.considerationPoints = [];
                notationEngine.startPt = null;
                notationEngine.endPt = null;
                notationEngine.startShapeObj = null;
                notationEngine.endShapeObj = null;
                notationEngine.regionPoints = [];
                notationEngine.pointsOnShapeObj = [];
                notationEngine.currentRegions = null;
                notationEngine.centerPtObject = null;
                notationEngine.via = null;
                notationEngine.showDirection = null;
                notationEngine.viaPoint = null;
            }, this);

            this._onAnnotateDrag = _.bind(function(postDragData) {
                var postDragDataObject = postDragData.clone();
                this.notationEngine.onAnnotateDrag(postDragDataObject);
            }, this);

            this._shapeLayerDownAndClick = _.bind(function(event) {
                var target = event.target,
                    hits,
                    isTouchDevice = 'ontouchstart' in window,
                    canvasCoords = geomFunctions.getCanvasCoordinates(event),
                    isPointOnShape, position, shape, DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                    curPopupShown = this.dgtUI.model.dgtPopUpView.model.curPopupShown;

                if (!target.equation) {
                    return;
                }
                shape = target.equation.getParent();
                this.hitTestOfObjects(target.equation, [event.point.x, event.point.y]);
                if (['iterate', 'iterateToDepth'].indexOf(curPopupShown) > -1) {
                    return;
                }
                if (this.grid.isSnapToGridEnabled()) {
                    canvasCoords = this.grid.getClosestCanvasPoint(canvasCoords);
                }

                if (this.getOperationMode() === 'select' || curPopupShown === 'properties') {

                    if (shape.getLastSelectTimestamp() === event.sessionTimestamp) {
                        return;
                    }
                    if (event.eventType === 'click') {
                        this._select(shape);
                    }
                } else {
                    if (!this._undergoingOperation) {
                        return;
                    }
                    if (!this._unsettledPoint) {
                        this.createNewPoint(canvasCoords);
                    }
                    hits = this.checkHitTestForAllObjects(canvasCoords, 'allShapes', true, true);
                    if (hits && hits.indexOf(shape) !== -1) {
                        isPointOnShape = this.checkForPointOnShape(canvasCoords);
                    }
                    if (isPointOnShape) {
                        if (isTouchDevice) {
                            position = this.grid._getCanvasPointCoordinates(DgtShape.getClosestPointOnShape(shape.species, this.grid._getGraphPointCoordinates(canvasCoords), shape.seed));
                            this.settleCurrentPoint(position);
                        } else {
                            position = this._unsettledPoint.equation.getPointsGroup().position;
                            this.settleCurrentPoint([position.x, position.y]);
                        }
                    }

                }
            }, this);
            this._shapeLayerDownAndClickForCanvas = _.bind(function(event) {
                var shape = event.target,
                    hits,
                    isTouchDevice = 'ontouchstart' in window,
                    canvasCoords = geomFunctions.getCanvasCoordinates(event),
                    isPointOnShape, position, DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                    curPopupShown = this.dgtUI.model.dgtPopUpView.model.curPopupShown;

                if (['iterate', 'iterateToDepth'].indexOf(curPopupShown) > -1) {
                    return;
                }
                if (this.grid.isSnapToGridEnabled()) {
                    canvasCoords = this.grid.getClosestCanvasPoint(canvasCoords);
                }

                if ((this.getOperationMode() === 'select' || curPopupShown === 'properties') &&
                    event.type === 'mousedown') {
                    this._select(shape);
                } else {
                    if (!this._undergoingOperation) {
                        return;
                    }
                    if (isTouchDevice) {
                        this.createNewPoint([event.point.x, event.point.y], true);
                    }
                    if (this.dummyPoint) {
                        this._unsettledPoint = this._undergoingOperation._unsettledPoint;

                        this.dummyPoint = null;
                    }
                    hits = this.checkHitTestForAllObjects(canvasCoords, 'allShapes', true, true, true);
                    if (hits && hits.indexOf(shape) !== -1) {
                        isPointOnShape = this.checkForPointOnShape(canvasCoords);
                    }
                    if (isPointOnShape) {
                        if (isTouchDevice) {
                            position = this.grid._getCanvasPointCoordinates(DgtShape.getClosestPointOnShape(shape.species, this.grid._getGraphPointCoordinates(canvasCoords), shape.seed));
                            this.settleCurrentPoint(position);
                        } else {
                            position = this._unsettledPoint.equation.getPointsGroup().position;
                            this.settleCurrentPoint([position.x, position.y]);
                        }
                    }
                }
            }, this);
            this._imageLayerDrag = _.bind(function(event, target) {
                if (!target) {
                    target = event.target;
                }
                var transformationView = MathUtilities.Tools.Dgt.Views.TransformationGridView.getTransformationGridViewObject(this.dgtUI.model.dgtPaperScope, this, target);
                if (target.equation.getParent().text) {
                    transformationView.setTransformationObject(target, this.grid, 2);
                } else {
                    transformationView.setTransformationObject(target, this.grid, 3);
                }
                transformationView.model.movingTarget = transformationView._moveHit.firstChild;
                transformationView.model.movingTarget.name = 'move';
                this.grid.off('image-layer-mouseup', this._canvasLayersMouseUp).on('image-layer-mouseup', this._canvasLayersMouseUp);
                transformationView.onMouseMove(event);
            }, this);


            this._zoomPanGraph = _.bind(function() {
                if (this.transform) {
                    this.transform.removeTransformation();
                }
            }, this);


            this._imageLayerDownAndClick = _.bind(function _imageLayerDownAndClick(event) {
                if (this.getOperationMode() !== 'select') {
                    this._gridLayerDownAndClick(event);
                }
            }, this);

            this._onChangeLabelPosition = _.bind(function _onChangeLabelPosition(event, equation) {
                equation.getParent().updateLabelPosition();
            }, this);


            this._annotationLayerDownAndClick = _.bind(function _annotationLayerDownAndClick(event) {
                var target,
                    annotationPath;
                target = event.target;
                if (this._undergoingOperation) {
                    this._gridLayerDownAndClick(event);
                }
                if (target.equation) {
                    annotationPath = target;
                } else {
                    annotationPath = target.parent;
                }

                if (annotationPath.equation.getParent().getLastSelectTimestamp() === event.sessionTimestamp) {
                    return;
                }
                if (!this._undergoingOperation && event.eventType === 'click') {
                    this._select(annotationPath.equation.getParent());
                }
            }, this);

            this._canvasLayersDoubleClickForCanvas = _.bind(function _canvasLayersDoubleClickForCanvas(event) {
                var target = event.target,
                    drawable,
                    centerPointCanvasCoordinates, centerPointGraphCoordinates, anchorSourceObject, operationRelationType,
                    sourcesLength, loopCtr;

                if (target.equation) {
                    drawable = target;
                }
                if (drawable && drawable.division === 'image' && typeof drawable.text !== 'undefined' && this.dgtUI.model.menubarCurrentState.selectedMenuIndex !== 0 ||
                    this.dgtUI.model.dgtPopUpView.model.curPopupShown === 'properties') {
                    return;
                }

                if (drawable && drawable.division === 'image' && typeof drawable.text !== 'undefined') {
                    //edit image to be called for textbox.
                    drawable.editImage();
                }
                if (this.getOperationMode() === 'select' && !drawable &&
                    MathUtilities.Tools.Dgt.Models.DgtOperation.isTouchDevice()) {
                    this.grid._graphDoubleClick(event);
                } else if (this.getOperationMode() === 'select' && drawable) {

                    if (['point', 'ray', 'segment', 'line'].indexOf(drawable.species) > -1) {
                        if (drawable._universe) {
                            return;
                        }
                        if (this.selected.indexOf(drawable) > -1) {
                            this._select(drawable);
                        }
                        this._makeAnchor(drawable);
                    } else if (drawable.species === 'text' && this.selected.indexOf(drawable) > -1) { // deselect text while editing.
                        this._select(drawable);
                    }

                } else {
                    //drawing predefined shapes on double click.
                    if (this.dgtUI.model.dgtPopUpView.model.curPopupShown === 'properties') {
                        return;
                    }
                    if (this.getOperationMode() === 'drawPredefinedShape') {

                        operationRelationType = this._undergoingOperation.operationRelationType;
                        centerPointCanvasCoordinates = geomFunctions.getCanvasCoordinates(event);
                        centerPointGraphCoordinates = this.grid._getGraphPointCoordinates(centerPointCanvasCoordinates);
                        anchorSourceObject = this.getAnchorSourcePoint(operationRelationType, centerPointGraphCoordinates);

                        switch (operationRelationType) {
                            case 'parabola':
                            case 'hyperbola':
                            case 'ellipse':
                            case 'circleWithPoints':
                                sourcesLength = anchorSourceObject.source.length;
                                for (loopCtr = 0; loopCtr < sourcesLength; loopCtr++) {
                                    if (this.dummyPoint) {
                                        this.dummyPoint.changePointVisibility(true);
                                        this.settleCurrentPoint(this.grid._getCanvasPointCoordinates(anchorSourceObject.source[loopCtr]));
                                    } else {
                                        this.createSettledPoint(this.grid._getCanvasPointCoordinates(anchorSourceObject.source[loopCtr]));
                                    }
                                }
                                break;

                            case 'ray':
                            case 'line':
                            case 'segment':
                                return;

                            default:
                                this.createSettledPoint(this.grid._getCanvasPointCoordinates(anchorSourceObject.anchor));
                                this.createSettledPoint(this.grid._getCanvasPointCoordinates(anchorSourceObject.source));
                        }
                    }
                }
            }, this);

            this._labelLayerDoubleClick = _.bind(function _labelLayerDoubleClick(event) {
                if (this.dgtUI.model.dgtPopUpView.model.curPopupShown === 'properties') {
                    return;
                }
                if (this.getOperationMode() === 'select') {
                    this.deselectAll();
                    this._select(event.target.equation.getParent());
                    var label = event.target.equation.getParent().equation.getLabelData().text;
                    this.setPropertiesPopupTitle(event.target.division, label);
                }
            }, this);

            this._canvasLayersMouseUp = _.bind(function _canvasLayersMouseUp(event) {
                //if not polygon
                var canvasCoordinates, position, isPointOnShape, transformationView;
                if (event.target.equation && event.target.equation.getParent().division === 'image') {
                    transformationView = MathUtilities.Tools.Dgt.Views.TransformationGridView.getTransformationGridViewObject(this.dgtUI.model.dgtPaperScope, this, event.target.equation.getRaster());
                }

                //for image dragging
                if (this.getOperationMode() === 'select' && event.target.equation.getParent().division === 'image') {
                    transformationView.onMouseUp(event);
                    this.grid.off('image-layer-mouseup', this._canvasLayersMouseUp);
                }
                if (this.getOperationMode() === 'drawPredefinedShape') {
                    this._toggleMouseUpOnAllLayers(false);
                }

                if (this._undergoingOperation) {
                    if (this._undergoingOperation._substitutePoint) {
                        this._undergoingOperation.replaceAgent(this._undergoingOperation._substitutePoint);
                    }

                    canvasCoordinates = geomFunctions.getCanvasCoordinates(event);
                    if (this._unsettledPoint) {
                        isPointOnShape = this.checkForPointOnShape(canvasCoordinates);
                        if (isPointOnShape) {
                            position = this._unsettledPoint.equation.getPointsGroup().position;
                            this.settleCurrentPoint([position.x, position.y]);
                        } else {
                            this.settleCurrentPoint(canvasCoordinates);
                        }
                    }
                }
            }, this);

            this._pointLayerDownAndClick = _.bind(function _pointLayerDownAndClick(event) {
                var target = event.target,
                    point,
                    isTouchDevice = 'ontouchstart' in window,
                    canvasCoordinates, position, isPointOnShape;

                if (target) {
                    if (target.equation) {
                        point = target.equation.getParent();
                    } else {
                        point = this._unsettledPoint;
                    }
                }

                // quick deletion of point || not selection iterated point for any operation
                if (!point || point._universe && this._undergoingOperation) {
                    return;
                }
                if (this.dummyPoint) {
                    this._unsettledPoint = this._undergoingOperation._unsettledPoint;
                    this.dummyPoint = null;
                }
                //if we have a unsettled point then delete it, and if we have a unsettled shape then replace that point with this point
                if (this._undergoingOperation && !this.selectionSteal) {

                    if (this.getOperationMode() === 'drawPredefinedShape') {
                        this._toggleMouseUpOnAllLayers(false);
                    }

                    if (point && point !== this._unsettledPoint) {
                        if (this.getOperationMode() !== 'drawPoint') {
                            if (this._unsettledPoint) {
                                if (point.properties.binaryInvisibility === 0 || isTouchDevice) {
                                    this._undergoingOperation.replaceAgent(point);
                                    if (this._unsettledPoint) {
                                        this._unsettledPoint.trigger('incinerated', this._unsettledPoint);
                                    }
                                }
                            } else {
                                this._undergoingOperation.recruitAgent(point);
                                this._undergoingOperation._unsettledRelationships[0]._onSpouseSettle(point);
                            }
                        } else {
                            if (this.selected.indexOf(point) < 0) {
                                this.deselectAll();
                                this._select(point);
                            }
                        }
                    } else {
                        canvasCoordinates = geomFunctions.getCanvasCoordinates(event);
                        if (this._unsettledPoint) {
                            isPointOnShape = this.checkForPointOnShape(canvasCoordinates);
                            if (isPointOnShape) {
                                position = this._unsettledPoint.equation.getPointsGroup().position;
                                this.settleCurrentPoint([position.x, position.y]);
                            } else if (point === this._unsettledPoint) {
                                this.settleCurrentPoint(canvasCoordinates);
                            }
                        }
                    }
                } else if (this.getOperationMode() === 'select' && event.eventType === 'click') {
                    if (point && point.getLastSelectTimestamp() === event.sessionTimestamp) {
                        return;
                    }
                    this._select(point);
                }
            }, this);

            this._pointLayerDownAndClickForCanvas = _.bind(function _pointLayerDownAndClickForCanvas(event) {
                var point,
                    canvasCoordinates, position, isPointOnShape,
                    clickTracker = this.eventListenerCanvas._clickTracker,
                    isTouchDevice = 'ontouchstart' in window,
                    target = event.target;

                if (target) {
                    if (target.equation) {
                        point = target;
                    } else {
                        point = this._unsettledPoint;
                    }
                }

                // quick deletion of point || not selection iterated point for any operation
                if (!point || point._universe && this._undergoingOperation) {
                    return;
                }
                if (isTouchDevice) {
                    this.createNewPoint([event.point.x, event.point.y]);
                }
                if (this.dummyPoint) {
                    this._unsettledPoint = this._undergoingOperation._unsettledPoint;
                    this.dummyPoint = null;
                }
                //if we have a unsettled point then delete it, and if we have a unsettled shape then replace that point with this point
                if (this._undergoingOperation && !this.selectionSteal) {

                    if (this.getOperationMode() === 'drawPredefinedShape' && clickTracker.downTime.length === clickTracker.upTime.length) {
                        this._toggleMouseUpOnAllLayers(false);
                    }

                    if (point && point !== this._unsettledPoint) {
                        if (this.getOperationMode() !== 'drawPoint') {
                            if (!this._unsettledPoint) {

                                this._undergoingOperation.recruitAgent(point);
                                this._undergoingOperation._unsettledRelationships[0]._onSpouseSettle(point);
                            } else if (point.properties.binaryInvisibility === 0) {
                                this._undergoingOperation.replaceAgent(point);
                                if (this._unsettledPoint) {
                                    this._unsettledPoint.trigger('incinerated', this._unsettledPoint);
                                }
                            }
                        } else if (this.selected.indexOf(point) < 0) {
                            this.deselectAll();
                            this._select(point);
                        }
                    } else {
                        canvasCoordinates = geomFunctions.getCanvasCoordinates(event);
                        if (this._unsettledPoint) {
                            isPointOnShape = this.checkForPointOnShape(canvasCoordinates);
                            if (isPointOnShape) {
                                position = this._unsettledPoint.equation.getPointsGroup().position;
                                this.settleCurrentPoint([position.x, position.y]);
                            } else if (point === this._unsettledPoint) {
                                this.settleCurrentPoint(canvasCoordinates);
                            }
                        }
                    }
                } else if (this.getOperationMode() === 'select' && event.type === 'click') {
                    this._select(point);
                }
            }, this);

            this._gridLayerDownAndClick = _.bind(function _gridLayerDownAndClick(event) {
                if (this.selectionSteal || this.dgtUI.model.dgtPopUpView.model.curPopupShown === 'properties') {
                    return;
                }

                var isTouchDevice = 'ontouchstart' in window,
                    canvasCoordinates;
                if (this.getOperationMode() !== 'select') {
                    if (this._undergoingOperation) {
                        if (this._unsettledPoint && !isTouchDevice && !this._unsettledPoint.visible) {
                            this._undergoingOperation.abortAndReborn();
                            return;
                        }
                        if (this.getOperationMode() === 'drawPredefinedShape') {
                            this._toggleMouseUpOnAllLayers(false);
                        }
                        canvasCoordinates = geomFunctions.getCanvasCoordinates(event);
                        if (this._unsettledPoint) {
                            this.settleCurrentPoint(canvasCoordinates);
                        } else {
                            this.createSettledPoint(canvasCoordinates);
                        }
                    }
                } else {
                    event = null;
                    this.deselectAll();
                }
            }, this);

            this.createPointMove = _.bind(function createPointMove(event) {
                if (!event) {
                    return;
                }

                var newPoint,
                    closestPoint,
                    coordinate, loopVar,
                    underlyingShape = [],
                    collidePoint,
                    DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                    currentPoint, mousePosition, willUpdate = [],
                    updateDataObject,
                    isTouchDevice = MathUtilities.Components.Utils.Models.BrowserCheck.isMobile,
                    clickTracker = this.eventListenerCanvas._clickTracker;

                this._resetHitShapeColors();

                if (isTouchDevice && this.getOperationMode() === 'drawPoint') {
                    return;
                }

                mousePosition = this.eventListenerCanvas.getMousePos(this.dgtUI.$('#canvas-event-listener'), event);
                newPoint = [mousePosition.x, mousePosition.y];
                if (this.grid.isSnapToGridEnabled()) {
                    newPoint = this.grid.getClosestCanvasPoint(newPoint);
                }
                if (this._unsettledPoint) {
                    currentPoint = this._unsettledPoint;
                } else {
                    currentPoint = this.dummyPoint;
                }

                currentPoint.equation.getPointsGroup().position = newPoint;
                coordinate = this.grid._getGraphPointCoordinates(newPoint);

                collidePoint = this.checkHitTestForAllObjects(newPoint, 'points', true, false, true);
                underlyingShape = this.checkHitTestForAllObjects(newPoint, 'allShapes', true, true, true);

                if (collidePoint) {
                    this._undergoingOperation.substitutePoint(collidePoint[0]);
                    this._setHitShapeColor(collidePoint[0]);

                    currentPoint.changePointVisibility(false);

                } else if (underlyingShape && underlyingShape.length > 0) {
                    currentPoint.changePointVisibility(true);
                    closestPoint = DgtShape.getClosestPointOnShape(underlyingShape[0].species, coordinate, underlyingShape[0].seed);
                    if (closestPoint) {
                        currentPoint.equation.getPointsGroup().position = this.grid._getCanvasPointCoordinates(closestPoint);
                    }
                    this._undergoingOperation.substitutePoint();
                    for (loopVar = 0; loopVar < underlyingShape.length; loopVar++) {
                        this._setHitShapeColor(underlyingShape[0]);
                    }
                } else {
                    this._undergoingOperation.substitutePoint();
                    if (this.dummyPoint) {
                        this.dummyPoint.changePointVisibility(true);
                    } else if (this._unsettledPoint) {
                        this._unsettledPoint.changePointVisibility(true);
                    }

                }
                // while drawing, all shape entities must be updated in order...
                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                updateDataObject.newPosition = this.getPointCoordinate(currentPoint);
                updateDataObject.relocatedEntities = willUpdate;
                updateDataObject.forceDrawing = this.TRAVEL_TEST;
                currentPoint.triggerRearrangement(updateDataObject);

                updateDataObject.forceDrawing = null;
                updateDataObject.relocatedEntities = [];
                updateDataObject.relocatedEntities.willUpdate = willUpdate;
                currentPoint.triggerRearrangement(updateDataObject);

                if (this.getOperationMode() === 'drawPredefinedShape' && this.eventListenerCanvas.triggeredDown &&
                    clickTracker.downTime.length !== clickTracker.upTime.length) {
                    this._toggleMouseUpOnAllLayers(true);
                }
                this.grid.refreshView();
            }, this);

            //create moving point (unsettled relationship or point)(B)
            this.createMovingPoint = _.bind(function createMovingPoint(event) {
                //creating unsettled point.
                var mousePosition, canvasCoordinate;

                this.grid.setDefaultZoomBehaviour(true);

                if (this._undergoingOperation._incinerated) {
                    return;
                }

                if (event) {
                    mousePosition = this.eventListenerCanvas.getMousePos(this.dgtUI.$('#canvas-event-listener'), event);
                    canvasCoordinate = [mousePosition.x, mousePosition.y];
                }

                this.createNewPoint(canvasCoordinate);
                //createMovingPoint is called in chrome even if user does not move the mouse.
                //Thus, to hide the newly created unsettled point call createPointMove
                this.createPointMove(event);

                this.eventListenerCanvas.attachMouseMoveFunction(null);

                this.eventListenerCanvas.attachMouseMoveFunction(this.createPointMove);
            }, this);

            this._enableDisableCanvasEvents(true);


            this.toggleMouseDownOnAllLayers(true);
            this.toggleClicknOnAllLayers(true);
            this.grid.on('selection-rect-complete', this._selectionRectCompleteFunc);
            this.changeGridPattern('noGrid', true);
            this.grid.refreshView();
        },

        "_resetHitShapeColors": function() {
            var hamster;
            while (this._undergoingOperation.hitShape &&
                this._undergoingOperation.hitShape.length > 0) {
                hamster = this._undergoingOperation.hitShape.pop();
                this._updateDrawableColor(hamster);
            }

            if (this._possibleHitShapes) {
                while (this._possibleHitShapes.length > 0) {
                    hamster = this._possibleHitShapes.pop();
                    this.changeHitColor(hamster, false);
                }
            }
        },

        "_onZoom": function() {
            this.toolSizeChangeCallback();
        },

        "_setHitShapeColor": function(entity) {
            if (!this._possibleHitShapes) {
                this._possibleHitShapes = [];
            }
            this._possibleHitShapes.push(entity);
            this.changeHitColor(entity, true);
        },

        "_enableDisableCanvasEvents": function(state) {
            if (state) {
                this.grid.off('image-layer-doubleclick', this._canvasLayersDoubleClickForCanvas).on('image-layer-doubleclick', this._canvasLayersDoubleClickForCanvas)
                    .off('point-layer-doubleclick', this._canvasLayersDoubleClickForCanvas).on('point-layer-doubleclick', this._canvasLayersDoubleClickForCanvas)
                    .off('change-label-position', this._onChangeLabelPosition).on('change-label-position', this._onChangeLabelPosition)
                    .off('shape-layer-doubleclick', this._canvasLayersDoubleClickForCanvas).on('shape-layer-doubleclick', this._canvasLayersDoubleClickForCanvas)
                    .off('service-layer-doubleclick', this._canvasLayersDoubleClickForCanvas).on('service-layer-doubleclick', this._canvasLayersDoubleClickForCanvas)
                    .off('label-layer-doubleclick', this._labelLayerDoubleClick).on('label-layer-doubleclick', this._labelLayerDoubleClick)
                    .off('mousemove-selecting-text-tool', this.onMoveDrawingTextTool).on('mousemove-selecting-text-tool', this.onMoveDrawingTextTool)
                    .off('image-layer-mousedrag', this._imageLayerDrag).on('image-layer-mousedrag', this._imageLayerDrag)
                    .off('grid-layer-doubleclick', this._canvasLayersDoubleClickForCanvas).on('grid-layer-doubleclick', this._canvasLayersDoubleClickForCanvas)
                    //......:::CHECK!!! Added these three up bindings. We are not using canvasLayersMouseUp since it is used while drawing the objects and we have to bind and unbind it while drawing for different cases.
                    // _shapePointLayerMouseUp will be on always and will be used for deselection of objects on mouseup.
                    .off('shape-layer-mouseup', this._shapePointLayerMouseUp).on('shape-layer-mouseup', this._shapePointLayerMouseUp)
                    .off('service-layer-mouseup', this._shapePointLayerMouseUp).on('service-layer-mouseup', this._shapePointLayerMouseUp)
                    .off('point-layer-mouseup', this._shapePointLayerMouseUp).on('point-layer-mouseup', this._shapePointLayerMouseUp);
                this._enableDisablePointEvents(true);
            } else {
                this.grid.off('image-layer-doubleclick', this._canvasLayersDoubleClickForCanvas)
                    .off('change-label-position', this._onChangeLabelPosition)
                    .off('point-layer-doubleclick', this._canvasLayersDoubleClickForCanvas)
                    .off('shape-layer-doubleclick', this._canvasLayersDoubleClickForCanvas)
                    .off('service-layer-doubleclick', this._canvasLayersDoubleClickForCanvas)
                    .off('label-layer-doubleclick', this._labelLayerDoubleClick)
                    .off('image-layer-mousedrag', this._imageLayerDrag)
                    .off('grid-layer-doubleclick', this._canvasLayersDoubleClickForCanvas)
                    .off('shape-layer-mouseup', this._shapePointLayerMouseUp)
                    .off('service-layer-mouseup', this._shapePointLayerMouseUp)
                    .off('point-layer-mouseup', this._shapePointLayerMouseUp)
                    .off('point-layer-mouseup', this._shapePointLayerMouseUp);
                this._enableDisablePointEvents(false);
            }
        },

        "onMoveDrawingTextTool": function() {
            MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('text-tool', 'grid');
        },

        "_toggleMouseUpOnAllLayers": function(bind) {
            if (bind) {
                this.grid.off('grid-layer-mouseup', this._canvasLayersMouseUp).on('grid-layer-mouseup', this._canvasLayersMouseUp)
                    .off('point-layer-mouseup', this._canvasLayersMouseUp).on('point-layer-mouseup', this._canvasLayersMouseUp)
                    .off('image-layer-mouseup', this._canvasLayersMouseUp).on('image-layer-mouseup', this._canvasLayersMouseUp)
                    .off('shape-layer-mouseup', this._canvasLayersMouseUp).on('shape-layer-mouseup', this._canvasLayersMouseUp)
                    .off('service-layer-mouseup', this._canvasLayersMouseUp).on('service-layer-mouseup', this._canvasLayersMouseUp);
            } else {
                this.grid.off('grid-layer-mouseup', this._canvasLayersMouseUp)
                    .off('point-layer-mouseup', this._canvasLayersMouseUp)
                    .off('image-layer-mouseup', this._canvasLayersMouseUp)
                    .off('shape-layer-mouseup', this._canvasLayersMouseUp)
                    .off('service-layer-mouseup', this._canvasLayersMouseUp);
            }
        },

        "toggleMouseDownOnAllLayers": function(bind) {
            var grid = this.grid;
            if (bind) {
                grid.on('grid-layer-mousedown', this._gridLayerDownAndClick)
                    .on('point-layer-mousedown', this._pointLayerDownAndClickForCanvas)
                    .on('annotation-layer-mousedown', this._annotationLayerDownAndClick)
                    .on('shape-layer-mousedown', this._shapeLayerDownAndClickForCanvas)
                    .on('customShape-layer-mousedown', this._shapeLayerDownAndClick)
                    .on('shape-layer-annotate', this._shapeLayerAnnotate)
                    .on('customShape-layer-annotate', this._shapeLayerAnnotate)
                    .on('shape-layer-annotate-start', this._shapeLayerAnnotateStart)
                    .on('point-layer-annotate-start', this._pointLayerAnnotateStart)
                    .on('annotation-layer-mousedown-sensed', this._downSensed)
                    .on('point-layer-mousedown-sensed', this._downSensed)
                    .on('image-layer-mousedown-sensed', this._downSensed)
                    .on('shape-layer-mousedown-sensed', this._downSensed)
                    .on('customShape-layer-mousedown-sensed', this._downSensed)
                    .on('service-layer-mousedown', this._serviceLayerDownAndClick)
                    .on('service-layer-click', this._serviceLayerClick)
                    .on('image-layer-mousedown', this._imageLayerDownAndClick);
            } else {
                grid.off('grid-layer-mousedown', this._gridLayerDownAndClick)
                    .off('point-layer-mousedown', this._pointLayerDownAndClickForCanvass)
                    .off('shape-layer-mousedown', this._shapeLayerDownAndClickForCanvas)
                    .off('customShape-layer-mousedown', this._shapeLayerDownAndClick)
                    .off('shape-layer-annotate', this._shapeLayerAnnotate)
                    .off('customShape-layer-annotate', this._shapeLayerAnnotate)
                    .off('shape-layer-annotate-start', this._shapeLayerAnnotateStart)
                    .off('grid-layer-annotate-drag', this._shapeLayerAnnotateDrag)
                    .off('point-layer-annotate-start', this._pointLayerAnnotateStart)
                    .off('shape-layer-mousedown-sensed', this._downSensed)
                    .off('annotation-layer-mousedown', this._annotationLayerDownAndClick)
                    .off('customShape-layer-mousedown-sensed', this._downSensed)
                    .off('point-layer-mousedown-sensed', this._downSensed)
                    .off('annotation-layer-mousedown-sensed', this._downSensed)
                    .off('image-layer-mousedown-sensed', this._downSensed)
                    .off('service-layer-mousedown', this._serviceLayerDownAndClick)
                    .off('service-layer-click', this._serviceLayerClick);
            }
        },

        "toggleClicknOnAllLayers": function(bind) {
            var grid = this.grid;
            if (bind) {
                grid.on('grid-layer-click', this._gridLayerDownAndClick)
                    .on('point-layer-click', this._pointLayerDownAndClick)
                    .on('annotation-layer-click', this._annotationLayerDownAndClick)
                    .on('shape-layer-click', this._shapeLayerDownAndClick)
                    .on('customShape-layer-click', this._shapeLayerDownAndClick)
                    .on('service-layer-click', this._serviceLayerDownAndClick)
                    .on('image-layer-click', this._imageLayerDownAndClick);
            } else {
                grid.off('grid-layer-click', this._gridLayerDownAndClick)
                    .off('point-layer-click', this._pointLayerDownAndClick)
                    .off('shape-layer-click', this._shapeLayerDownAndClick)
                    .on('customShape-layer-click', this._shapeLayerDownAndClick)
                    .off('annotation-layer-click', this._annotationLayerDownAndClick)
                    .off('service-layer-click', this._serviceLayerDownAndClick)
                    .off('image-layer-click', this._imageLayerDownAndClick);
            }
        },

        "pointDeleted": function pointDeleted(point) { //intentionally named function.
            // Using named function  intentionally since we are using the reference of 'pointDeleted'.
            var engine = point.engine;
            if (point !== engine._unsettledPoint && point !== engine.dummyPoint) {
                return;
            }

            engine.plotter.removeEquation(point.equation);
            if (point === engine._unsettledPoint) {
                engine._unsettledPoint = null;
            }
            if (point === engine.dummyPoint) {
                engine.dummyPoint = null;
            }

            point.off('incinerated', pointDeleted);
        },

        "checkForPointOnShape": function(canvasCoordinates) {
            var newPointCanvas,
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                hitShape = this._undergoingOperation.hitShape;

            this.indexForIntersection = 0;
            this._unsettledPoint.changePointVisibility(true);

            if (hitShape && hitShape.length > 0 &&
                this.hitTestOfObjects(hitShape[0].equation, canvasCoordinates, true)) {
                newPointCanvas = this.grid._getCanvasPointCoordinates(DgtShape.getClosestPointOnShape(hitShape[0].species, this.grid._getGraphPointCoordinates(canvasCoordinates), hitShape[0].seed));
                this._undergoingOperation.createPointOnObject(newPointCanvas);
                return true;
            }
            return false;
        },

        //creates a new point (A partial)
        "createNewPoint": function(coords, isDummy) {
            var unsettledPoint, updateDataObject,
                options = {},
                isTouchDevice = MathUtilities.Components.Utils.Models.BrowserCheck.isMobile;
            if (coords) {
                options.coords = this.grid._getGraphPointCoordinates(coords);
            }
            if (this.dummyPoint) {
                return;
            }
            //Creating new unsettled point (FIRST point)
            if (this._undergoingOperation && (!this._unsettledPoint || !this._undergoingOperation._unsettledPoint)) {
                unsettledPoint = new MathUtilities.Tools.Dgt.Models.DgtPoint(options);
                //dummy point is created when unsettled point is needed but only to show as on point on object
                if (isDummy) {
                    this.dummyPoint = unsettledPoint;
                } else {
                    this._unsettledPoint = unsettledPoint;
                }
                unsettledPoint.setEngine(this);
                unsettledPoint.setProperties();
                unsettledPoint.setStateOfMind('restless');
                unsettledPoint.aptitude = 'f';

                this.addPointToPlot(unsettledPoint);
                this._undergoingOperation.recruitAgent(unsettledPoint, true);
                this._enableDisablePointEvents(false);
                unsettledPoint.on('incinerated', this.pointDeleted);

                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                updateDataObject.genesis = unsettledPoint;
                updateDataObject.newPosition = this.getPointCoordinate(unsettledPoint);

                unsettledPoint.triggerRearrangement(updateDataObject);

                if (isDummy && !MathUtilities.Tools.Dgt.Models.DgtEngine.isAccessible) {
                    unsettledPoint.changePointVisibility(false);
                }
                this.grid.refreshView();
            }

            if (this._undergoingOperation && this._undergoingOperation.agents.length > 1) {
                this._preventDoubleClickByModule('whileDrawing');
            }
        },

        "createSelectionRect": function(event) {
            var rect, selectionRectStart;
            this.grid._projectLayers.serviceLayer.activate();
            if (!this._selectionRectStart) {
                this._selectionRectStart = event.downPoint;
            }

            selectionRectStart = this._selectionRectStart;

            rect = new this.grid._paperScope.Rectangle(
                Math.min(event.point.x, selectionRectStart.x),
                Math.min(event.point.y, selectionRectStart.y),
                Math.abs(selectionRectStart.x - event.point.x),
                Math.abs(selectionRectStart.y - event.point.y)
            );

            if (this._selectionRect) {
                this._selectionRect.remove();
                this._selectionRect = null;
            }

            this._selectionRect = new this.grid._paperScope.Path.Rectangle(rect);
            this._selectionRect.style = {
                "strokeColor": '#d2d2d2',
                "strokeWidth": 2
            };
            this.grid.refreshView();
            this.grid._projectLayers.gridLayer.activate();
        },

        "selectionRectComplete": function() {
            var selectionBound = this._selectionRect.bounds;
            this._selectionRect.remove();
            this._selectionRectStart = null;
            this._selectionRect = null;
            this.grid.trigger('selection-rect-complete', selectionBound);
        },

        "_preventDoubleClickByModule": function(who) {
            var index = this._doubleClickConstrainers.indexOf(who);
            if (index > -1) {
                return;
            }
            this._doubleClickConstrainers.push(who);
            if (this._doubleClickConstrainers.length > 0) {
                this.grid.enableInputMode(this.grid.INPUT_MODE_DOUBLE_CLICK, false);
                if (who === 'drawPoint') {
                    this.grid.enableInputMode(this.grid.INPUT_MODE_FIRST_CLICK, false);
                }
            }
        },

        "_allowDoubleClickByModule": function(who) {
            var index = this._doubleClickConstrainers.indexOf(who);
            if (who === 'whileDrawing' && index > -1 && this._doubleClickConstrainers[0] !== 'drawPoint') {
                this.grid.enableInputMode(this.grid.INPUT_MODE_FIRST_CLICK, true);
            }
            if (index > -1) {
                this._doubleClickConstrainers.splice(index, 1);
                if (this._doubleClickConstrainers.length === 0) {
                    this.grid.enableInputMode(this.grid.INPUT_MODE_DOUBLE_CLICK, true);
                }
            }
        },

        //creates a new settled point (A)[wont b called in case of points.]
        "createSettledPoint": function(coords) {
            if (this.dummyPoint) {
                this._unsettledPoint = this.dummyPoint;
                this._unsettledPoint.changePointVisibility(true);
                this.settleCurrentPoint(coords);
                this.dummyPoint = null;
            } else {
                if (!this._unsettledPoint) {
                    this.createNewPoint(coords);
                }
                this.settleCurrentPoint(coords);
            }
            //create a new unsettled pt also
        },

        //settles the unsettled point (A and C)
        "settleCurrentPoint": function(coordinates) {
            var unsettledPoint = this._undergoingOperation._unsettledPoint,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            if (unsettledPoint.getCreationMethod() === 'pointOnObject') {
                // For POB we are placing the point using offset instead of using canvas position.
                coordinates = DgtEngine.getRandomPointOnObject(unsettledPoint.creator.getSource(0), unsettledPoint.creator);
                coordinates = this.grid._getCanvasPointCoordinates(coordinates);
            } else if (this.grid.isSnapToGridEnabled()) {
                coordinates = this.grid.getClosestCanvasPoint(coordinates);
            }

            this.eventListenerCanvas.attachMouseMoveFunction(null);

            this._unsettledPoint = null;
            this.lastHitShape = null;
            this._undergoingOperation.hitShape = [];

            if (this.dummyPoint) {
                this.dummyPoint = null;
            }
            if (!DgtEngine.restoreKind && unsettledPoint.visible) {
                unsettledPoint.setProperties({
                    "color": this.defaultProperties.point.color // Applying default color because restless color is different.
                });
                unsettledPoint.settle(coordinates[0], coordinates[1]);
                this.acknowledgeEntity(unsettledPoint);

            } else {
                if (this.getOperationMode() !== 'drawPoint') {
                    this.trigger('settled');
                }
                this._enableDisablePointEvents(true);
            }

            if (this.getOperationMode() === 'drawPoint' && !unsettledPoint.visible && !DgtEngine.restoreKind) {
                this._undergoingOperation.abort();
                this.perform('drawPoint');
            }

            this._enableDisablePointEvents(false);
            //disable up on all layers...
            //setting the unsettled point to null once the point is settled.
        },

        "_onChangeCalculatorVisiblity": function() {
            var measure;
            for (measure in this.measures) {
                this.measures[measure].changeMeasurementBindings();
            }
        },

        "_canvasLayersDoubleClickForCanvas": null,
        "_bannerLayerClick": null,
        "_pointLayerClick": null,

        "_enableDisablePointEvents": function(state) {
            if (this.pointEventsEnabled === state) {
                return;
            }
            this.pointEventsEnabled = state;
            if (state) {
                this.grid.off('point-layer-doubleclick', this._canvasLayersDoubleClickForCanvas)
                    .on('point-layer-doubleclick', this._canvasLayersDoubleClickForCanvas);
            } else {
                this.grid.off('point-layer-doubleclick', this._canvasLayersDoubleClickForCanvas);
            }
        },

        "generateLabel": function(latestMarking, markingSource, forAccText) {
            var angleInitials = 'm\\angle ',
                markingSourcesLength, loopCtr, markingAngleLabel = '',
                tempString,
                markingRatioLabel = '',
                label, vectorInitials = 'Point\\thinspace{}',
                ratioInitials = '\\overline{',
                ratioEnd = '}',
                shape1, shape2,
                markingVectorLabel, markingDivision = latestMarking.division,
                markingType = latestMarking.creator.species,
                MathInput = MathUtilities.Tools.Dgt.Models.MathInput;

            if (markingDivision === 'measurement') {
                label = latestMarking.properties.labelTextOriginal;
            } else if (markingDivision === 'marking') {

                if (markingType === 'markAngle') {
                    markingSourcesLength = markingSource.length;
                    if (!forAccText) {
                        markingAngleLabel = markingAngleLabel.concat(angleInitials);
                    }

                    if (markingSourcesLength === 2 && ['ray', 'segment'].indexOf(markingSource[0].species) > -1 && markingSource[0].getCreationMethod() === 'natural' && markingSource[1].getCreationMethod() === 'natural') {
                        shape1 = markingSource[0].creator.sources;
                        shape2 = markingSource[1].creator.sources;

                        tempString = markingSource[0].getUniqueLabel(shape1[0], shape1[1], shape2[0], shape2[1]);
                        tempString = tempString.replace(/-/gi, ''); //To match '-' and replace with blank
                        if (forAccText) {
                            return tempString;
                        }
                        tempString = MathInput.updateMeasurementLabelLatex(tempString);
                        markingAngleLabel = markingAngleLabel.concat(tempString);
                    } else {
                        if (markingSourcesLength === 2 && (markingSource[0].getCreationMethod() !== 'natural' || markingSource[1].getCreationMethod() === 'natural')) {
                            tempString = markingSource[0].equation.getLabelData().text + markingSource[1].equation.getLabelData().text;
                            if (forAccText) {
                                return tempString;
                            }
                            tempString = MathInput.updateMeasurementLabelLatex(tempString);
                            markingAngleLabel = markingAngleLabel.concat(tempString);
                        } else {
                            for (loopCtr = 0; loopCtr < markingSourcesLength; loopCtr++) {
                                tempString = markingSource[loopCtr].getLabelToDisplay();
                                if (forAccText) {
                                    tempString = MathInput.updateMeasurementLabelLatex(tempString);
                                }
                                markingAngleLabel = markingAngleLabel.concat(tempString);
                            }
                            if (forAccText) {
                                return markingAngleLabel;
                            }
                        }
                    }
                    label = markingAngleLabel;
                } else if (markingType === 'markRatio') {
                    if (markingSource.showParentLabel()) {
                        markingRatioLabel = ratioInitials;
                    }
                    tempString = markingSource.getLabelToDisplay();
                    if (forAccText) {
                        return tempString;
                    }
                    tempString = MathInput.updateMeasurementLabelLatex(tempString);
                    markingRatioLabel = markingRatioLabel.concat(tempString);
                    if (markingSource.showParentLabel()) {
                        markingRatioLabel = markingRatioLabel.concat(ratioEnd);
                    }
                    label = markingRatioLabel;
                } else if (markingType === 'markVector') {
                    markingVectorLabel = vectorInitials;
                    tempString = markingSource.getLabelToDisplay();
                    if (forAccText) {
                        return tempString;
                    }
                    tempString = MathInput.updateMeasurementLabelLatex(tempString);
                    markingVectorLabel = markingVectorLabel.concat(tempString);
                    label = markingVectorLabel;
                }
            }
            return label;
        },

        "changePrecision": function(precision) {
            var precisionMap = {
                "units": 0,
                "tenths": 1,
                "hundredths": 2,
                "thousandths": 3,
                "ten-thousandths": 4,
                "hundred-thousandths": 5
            };
            this.selected[0].trigger('update-banner-value', precisionMap[precision]);
        },

        "setDefaultProperties": function(defaultColor) {
            var properties = {
                    "color": defaultColor,
                    "thickness": 3,
                    "labelVisibility": false,
                    "labelText": 'a',
                    "labelPosition": null,
                    "visibility": true,
                    "binaryInvisibility": 0,
                    "isMarkedAnchor": false,
                    "strokeStyle": 0,
                    "locked": false
                },
                properties1 = {
                    "color": defaultColor,
                    "thickness": 3,
                    "labelVisibility": false,
                    "labelText": 'a',
                    "labelPosition": null,
                    "visibility": true,
                    "binaryInvisibility": 0,
                    "isMarkedAnchor": false,
                    "strokeStyle": 0,
                    "locked": false
                },
                properties2 = {
                    "color": defaultColor,
                    "labelVisibility": false,
                    "labelText": 'a',
                    "labelPosition": null,
                    "visibility": true,
                    "binaryInvisibility": 0,
                    "isMarkedAnchor": false,
                    "strokeStyle": 0,
                    "locked": false
                },
                properties3 = {
                    "color": defaultColor,
                    "labelVisibility": false,
                    "labelText": 'a',
                    "labelPosition": null,
                    "visibility": true,
                    "binaryInvisibility": 0,
                    "isMarkedAnchor": false,
                    "strokeStyle": 0,
                    "locked": false
                };
            this.defaultProperties = {
                "point": {
                    "color": defaultColor,
                    "thickness": 3,
                    "labelVisibility": false,
                    "labelText": '',
                    "labelPosition": null,
                    "visibility": true,
                    "binaryInvisibility": 0,
                    "isMarkedAnchor": false,
                    "locked": false

                },
                "circle": properties1,
                "parabola": properties1,
                "ellipse": properties1,
                "hyperbola": properties1,
                "line": properties,
                "ray": properties,
                "segment": properties,
                "annotation": {
                    "color": defaultColor,
                    "thickness": 3,
                    "visibility": true,
                    "binaryInvisibility": 0,
                    "locked": false
                },
                "tickMark": {
                    "color": defaultColor,
                    "thickness": 3,
                    "visibility": true,
                    "binaryInvisibility": 0,
                    "locked": false
                },
                "angleMark": properties3,
                "iteration": {
                    "color": defaultColor,
                    "thickness": 3,
                    "visibility": true,
                    "binaryInvisibility": 0,
                    "locked": false
                },
                "measurement": {
                    "color": defaultColor,
                    "labelText": '',
                    "labelPosition": null,
                    "visibility": true,
                    "labelType": 'original-name',
                    "precision": 2,
                    "binaryInvisibility": 0,
                    "locked": false
                },
                "circleInterior": properties2,
                "arcSectorInterior": properties2,
                "arcSegmentInterior": properties2,
                "polygonInterior": properties2,
                "ellipseInterior": properties2,
                "image": {
                    "visibility": true,
                    "binaryInvisibility": 0,
                    "locked": false
                },
                "text": {
                    "binaryInvisibility": 0,
                    "locked": false
                },
                "arc": properties1
            };
        },

        "deselectAll": function() {
            var current, TransformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView,
                transformationView,
                DgtStatusMessage = MathUtilities.Tools.Dgt.Models.DgtStatusMessage;

            if (TransformationGridView.occupiedTransformationViews !== null) {
                while (TransformationGridView.occupiedTransformationViews.length > 0) {
                    transformationView = TransformationGridView.occupiedTransformationViews[0];
                    transformationView.removeTransformation();
                }
            }
            this.accessibilityView.deselectAllTriggered();
            while (this.rolledOver.length > 0) {
                current = this.rolledOver.pop();
                this._updateDrawableColor(current);
            }

            while (this.selected.length > 0) {
                current = this.selected.pop();
                this._updateDrawableColor(current);
                current.updateSelectionState(false);
                DgtStatusMessage.getStatusString('cursor', 'grid', this.selected.length);
            }
            if (this.selectionPrison) {
                while (this.selectionPrison.length > 0) {
                    this.selectionPrison.pop();
                }
            }

            if (this.selectionFirstShockwave) {
                while (this.selectionFirstShockwave.length > 0) {
                    this.selectionFirstShockwave.pop();
                }
            }

            this.updatePossibleOperations();
        },

        "handleEntityClicks": function() { // when properties popup opened
            var measure;
            this.grid.off('grid-layer-click');
            for (measure in this.measures) {
                this.measures[measure].changeMeasurementBindings();
            }
        },

        "restoreClickEvents": function() { // when properties popup closed
            var measure;
            this.grid.on('grid-layer-click', this._gridLayerClick);
            for (measure in this.measures) {
                this.measures[measure].changeMeasurementBindings();
            }
        },

        "selectAll": function() {
            if (this.getOperationMode() === 'nonGeometricDrawing') {
                return;
            }

            var i;
            for (i = 0; i < this.points.length; i++) {
                if (this.selected.indexOf(this.points[i]) === -1) {
                    this._select(this.points[i], null, null, true);
                }
            }
            for (i = 0; i < this.shapes.length; i++) {
                if (this.selected.indexOf(this.shapes[i]) === -1) {
                    this._select(this.shapes[i], null, null, true);
                }
            }
            for (i = 0; i < this.notations.length; i++) {
                if (this.selected.indexOf(this.notations[i]) === -1) {
                    this._select(this.notations[i], null, null, true);
                }
            }
            for (i = 0; i < this.annotations.length; i++) {
                if (this.selected.indexOf(this.annotations[i]) === -1) {
                    this._select(this.annotations[i], null, null, true);
                }
            }
            for (i = 0; i < this.measures.length; i++) {
                if (this.selected.indexOf(this.measures[i]) === -1) {
                    this._select(this.measures[i], null, null, true);
                }
            }
            for (i = 0; i < this.interiors.length; i++) {
                if (this.selected.indexOf(this.interiors[i]) === -1) {
                    this._select(this.interiors[i], null, null, true);
                }
            }
            for (i = 0; i < this.iterations.length; i++) {
                if (this.selected.indexOf(this.iterations[i]) === -1) {
                    this._select(this.iterations[i], null, null, true);
                }
            }
            //......images and text selection
            for (i = 0; i < this.images.length; i++) {
                if (this.selected.indexOf(this.images[i]) === -1) {
                    this._select(this.images[i], null, null, true);
                }
            }
            MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'grid', this.selected.length);
            this.postMultipleSelection();
        },

        "changePropertiesPopup": function(newObject) {
            this.setPropertiesPopupTitle(newObject.division, null, true);
        },

        "assignCustomName": function(newName, labelType) {
            var indexOfSelected, newName1;
            if (this.selected.length === 1 && this.selected[0].division === 'measurement' && labelType !== 'current-label') {
                if (['no-name', 'original-name'].indexOf(labelType) > -1) {
                    this.selected[0].trigger('update-banner-label');
                    this.selected[0].properties.labelText = newName;
                    return;
                }
            } else if (newName === '' && labelType === 'current-label') {
                this.selected[0].trigger('update-banner-label');
                return;
            } else {
                if (this.selected.length === 1 && labelType === 'original-name') { // for properties popup change
                    return;
                }
                if (this.selected.length === 1) {
                    this.selected[0].updateLabelText(newName, true, true);
                    this.selected[0].properties.labelType = 'current-label';
                } else {
                    for (indexOfSelected = 0; indexOfSelected < this.selected.length; indexOfSelected++) {

                        newName1 = this.getNextLabel(newName, true, indexOfSelected);
                        if (newName1[1] === false) {
                            newName = newName1[0];
                            continue;
                        }
                        newName1 = newName1[0];
                        this.selected[indexOfSelected].updateLabelText(newName, true, true);
                        this.selected[indexOfSelected].properties.labelType = 'current-label';
                        newName = newName1;
                    }
                }
            }
        },

        "getNextLabel": function(newName, fromAssignCustom, indexOfSelected) {
            var lineCount = newName.charCodeAt(newName.length - 1),
                newName1, lastChar, number,
                ALPHA_CAP_A = 65,
                ALPHA_CAP_Z = 90,
                ALPHA_SMALL_A = 97,
                ALPHA_SMALL_K = 107,
                ALPHA_SMALL_Z = 122;
            if (lineCount === ALPHA_SMALL_K) {
                lineCount++;
            }
            if (lineCount >= ALPHA_CAP_A && lineCount < ALPHA_CAP_Z || lineCount >= ALPHA_SMALL_A && lineCount < ALPHA_SMALL_Z) {
                lastChar = String.fromCharCode(lineCount + 1);
                newName1 = newName.slice(0, newName.length - 1) + lastChar;
            } else {
                number = newName.match(/[0-9]+$/); //Search occurrence of number at end
                if (number) {
                    lastChar = parseInt(number[0], 10) + 1;
                    newName1 = newName.replace(/[0-9]+$/, lastChar); //Search occurrence of number at end
                } else {
                    if (lineCount === ALPHA_CAP_Z || lineCount === ALPHA_SMALL_Z) {
                        lastChar = 1;
                        newName1 = newName + lastChar;
                    } else {
                        lastChar = 1;
                        newName += lastChar;
                        if (fromAssignCustom === true) {
                            this.selected[indexOfSelected].updateLabelText(newName, false, true);
                            lastChar = '2';
                            newName = newName.slice(0, newName.length - 1) + lastChar;
                            return [newName, false];
                        }
                        return [newName];
                    }
                }
            }
            return [newName1, true];
        },

        "updateCustomMeasurementLabel": function(forObject) {
            if (forObject === 'measurement') {
                this.selected[0].updateCustomLabelText();
            } else if (forObject === 'parameter') {
                this.selected[0].updateParameterLabelText();
            }
        },

        "setUndoRedoData": function(data, division, undoRedoData, idArray) {
            switch (division) {
                case 'point':
                    if (idArray.indexOf(data.id) === -1) {
                        undoRedoData.engine.drawing.points.push(data);
                        idArray.push(data.id);
                    }
                    break;
                case 'shape':
                    if (idArray.indexOf(data.id) === -1) {
                        undoRedoData.engine.drawing.shapes.push(data);
                        idArray.push(data.id);
                    }
                    break;
                case 'notation':
                    if (idArray.indexOf(data.id) === -1) {
                        undoRedoData.engine.drawing.notations.push(data);
                        idArray.push(data.id);
                    }
                    break;
                case 'interior':
                    if (idArray.indexOf(data.id) === -1) {
                        undoRedoData.engine.drawing.interiors.push(data);
                        idArray.push(data.id);
                    }
                    break;
                case 'measurement':
                    if (idArray.indexOf(data.id) === -1) {
                        undoRedoData.engine.drawing.measures.push(data);
                        idArray.push(data.id);
                    }
                    break;
                case 'marking':
                    if (idArray.indexOf(data.id) === -1) {
                        undoRedoData.engine.markings.push(data);
                        idArray.push(data.id);
                    }
                    break;
                case 'annotation':
                    if (idArray.indexOf(data.id) === -1) {
                        undoRedoData.engine.drawing.annotations.push(data);
                        idArray.push(data.id);
                    }
                    break;
                case 'image':
                    if (idArray.indexOf(data.id) === -1) {
                        undoRedoData.engine.drawing.images.push(data);
                        idArray.push(data.id);
                    }
                    break;
                case 'relation':
                    if (idArray.indexOf(data.id) === -1) {
                        undoRedoData.engine.drawing.relations.push(data);
                        idArray.push(data.id);
                    }
                    break;
                case 'iteration':
                    if (idArray.indexOf(data.id) === -1) {
                        undoRedoData.engine.drawing.iterations.push(data);
                        idArray.push(data.id);
                    }
                    break;
            }
        },

        "getChildrenRelationships": function(relation, undoData, idArray) {
            if (!relation.offspring || relation._universe) {
                return;
            }
            var division = relation.offspring.division,
                i,
                data = undoData.engine.drawing.relationShips;
            this.setUndoRedoData(relation.offspring.getData(), division, undoData, idArray);
            if (idArray.indexOf(relation.getData().id) !== -1) {
                for (i = 0; i < data.length; i++) {
                    if (data[i].id === relation.getData().id) {
                        undoData.engine.drawing.relationShips.splice(i, 1);
                    }
                }
            }
            undoData.engine.drawing.relationShips.push(relation.getData());
            idArray.push(relation.id);

            if (relation.offspring._childrenRelationships) {
                for (i = 0; i < relation.offspring._childrenRelationships.length; i++) {
                    if (!relation.offspring._childrenRelationships[i]._universe) {
                        this.getChildrenRelationships(relation.offspring._childrenRelationships[i], undoData, idArray);
                    }
                }
            }
            /* check for _menteeRelations*/
            if (relation.offspring._menteeRelations) {
                for (i = 0; i < relation.offspring._menteeRelations.length; i++) {
                    if (!relation.offspring._menteeRelations[i]._universe) {

                        this.getChildrenRelationships(relation.offspring._menteeRelations[i], undoData, idArray);
                    }
                }
            }
        },

        "postMultipleSelection": function() {
            this.getLockedSystem();
            this.updatePossibleOperations();
        },

        "deleteSelectedItems": function(reason, itemToBeDeleted) {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                undoData = {
                    "menubar": [],
                    "engine": {
                        "grid": {},
                        "drawing": {
                            "shapes": [],
                            "points": [],
                            "relationShips": [],
                            "annotations": [],
                            "images": [],
                            "measures": [],
                            "interiors": [],
                            "iterations": [],
                            "notations": []
                        },
                        "markings": [],
                        "selected": [],
                        "anchor": []
                    }
                },
                redoData = [],
                loopVar,

                deleteItem = _.bind(function(entity) {
                    var idArray = [],
                        division = entity.division,
                        i, TransformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView,
                        transformationView;
                    if (entity._incinerated) {
                        return;
                    }
                    switch (division) {
                        case 'point':
                            if (idArray.indexOf(entity.getData().id) === -1) {
                                undoData.engine.drawing.points.push(entity.getData());
                                idArray.push(entity.id);
                                if (entity.creator) {
                                    undoData.engine.drawing.relationShips.push(entity.creator.getData());
                                    idArray.push(entity.creator.id);
                                }
                                for (i = 0; i < entity._childrenRelationships.length; i++) {
                                    if (!entity._childrenRelationships[i]._incinerated) {
                                        this.getChildrenRelationships(entity._childrenRelationships[i], undoData, idArray);
                                    }
                                }
                                redoData.push(entity.id);
                            }
                            break;

                        case 'shape':
                        case 'notation':
                        case 'interior':
                            if (idArray.indexOf(entity.id) === -1) {
                                if (division === 'shape') {
                                    undoData.engine.drawing.shapes.push(entity.getData());
                                } else if (division === 'notation') {
                                    undoData.engine.drawing.notations.push(entity.getData());
                                } else {
                                    undoData.engine.drawing.interiors.push(entity.getData());
                                }
                                idArray.push(entity.id);
                                undoData.engine.drawing.relationShips.push(entity.creator.getData());
                                idArray.push(entity.creator.id);
                                for (i = 0; i < entity._childrenRelationships.length; i++) {
                                    if (!entity._childrenRelationships[i]._incinerated) {
                                        this.getChildrenRelationships(entity._childrenRelationships[i], undoData, idArray);
                                    }
                                }
                                redoData.push(entity.id);
                            }
                            break;

                        case 'annotation':
                            if (idArray.indexOf(entity.id) === -1) {
                                undoData.engine.drawing.annotations.push(entity.getData());
                                idArray.push(entity.id);
                                redoData.push(entity.id);
                            }
                            break;

                        case 'image':
                            if (this.accessibilityView.rolledOver === entity) {
                                this.accessibilityView.removeFocusRect();
                            }
                            transformationView = TransformationGridView.getTransformationGridViewObject(this.dgtPaperScope, this, entity.equation.getRaster());
                            transformationView.removeTransformation();

                            if (entity.isCropped) {
                                deleteItem(entity.creator.getSource(0));
                                return;
                            }
                            if (idArray.indexOf(entity.id) === -1) {
                                this.grid.deleteImage(entity.equation);
                                undoData.engine.drawing.images.push(entity.getData());
                                idArray.push(entity.id);
                                if (entity.creator) {
                                    undoData.engine.drawing.relationShips.push(entity.creator.getData());
                                    idArray.push(entity.creator.id);
                                }
                                for (i = 0; i < entity._childrenRelationships.length; i++) {
                                    if (!entity._childrenRelationships[i]._incinerated) {
                                        this.getChildrenRelationships(entity._childrenRelationships[i], undoData, idArray);
                                    }
                                }
                                redoData.push(entity.id);
                            }
                            break;

                        case 'measurement':

                            if (idArray.indexOf(entity.id) === -1) {
                                undoData.engine.drawing.measures.push(entity.getData());
                                idArray.push(entity.id);
                                if (entity.creator) {
                                    undoData.engine.drawing.relationShips.push(entity.creator.getData());
                                    idArray.push(entity.creator.id);
                                }
                                for (i = 0; i < entity._childrenRelationships.length; i++) {
                                    if (!entity._childrenRelationships[i]._incinerated) {
                                        this.getChildrenRelationships(entity._childrenRelationships[i], undoData, idArray);
                                    }
                                }
                                for (i = 0; i < entity._menteeRelations.length; i++) {
                                    if (!entity._menteeRelations[i]._incinerated) {
                                        this.getChildrenRelationships(entity._menteeRelations[i], undoData, idArray);
                                    }
                                }
                                redoData.push(entity.id);
                            }
                            break;

                        case 'iteration':
                            if (idArray.indexOf(entity.getData().id) === -1) {
                                undoData.engine.drawing.iterations.push(entity.getData());
                                idArray.push(entity.id);
                                if (entity.creator) {
                                    undoData.engine.drawing.relationShips.push(entity.creator.getData());
                                    idArray.push(entity.creator.id);
                                }
                                for (i = 0; i < entity._childrenRelationships.length; i++) {
                                    if (!entity._childrenRelationships[i]._incinerated) {
                                        this.getChildrenRelationships(entity._childrenRelationships[i], undoData, idArray);
                                    }
                                }
                                redoData.push(entity.id);
                            }
                            break;
                    }
                    entity.incinerate();
                }, this);

            if (itemToBeDeleted) {
                deleteItem(itemToBeDeleted);
            } else {
                for (loopVar = 0; loopVar < this.selected.length; loopVar++) {
                    if (this.selected[loopVar].dragging === true) {
                        return;
                    }
                }
                while (this.selected.length > 0) {
                    if (this.selected[0]._universe) {
                        this.selected.shift();
                        continue;
                    }
                    if (this.selected[0].properties.locked) {
                        this._select(this.selected[0]);
                        continue;
                    }
                    if (this.isStandardObject(this.selected[0])) {
                        this._select(this.selected[0], null, null, true);
                        continue;
                    }
                    deleteItem(this.selected[0]);
                }
            }

            this.updatePossibleOperations();
            if (reason !== 'redo') {
                undoData.engine.drawing.relationShips.sort(function(a, b) {
                    return Number(DgtEngine.getFirstNumberFromString(a.id)) > Number(DgtEngine.getFirstNumberFromString(b.id)) ? 1 : -1;
                });
                this.execute('deleteSelectedItems', {
                    "undo": {
                        "actionType": 'reDraw',
                        "undoData": undoData
                    },
                    "redo": {
                        "actionType": 'delete',
                        "redoData": redoData
                    }
                });
            }

            MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'leave');
            this.grid.updateVisibleDomain();
            this.accessibilityView.shiftToProperty = false;
            this.accManager.setFocus('point-highlighter'); // To set focus to point after delete
        },

        "_updateDrawableColor": function(drawable, entityColor) {
            var color, selected, rolledOver, anchorColor = '#00f';

            if (this.selectionSteal) {
                selected = this.selectionSteal.selected;
                rolledOver = this.selectionSteal.rolledOver;
            } else {
                selected = this.selected;
                rolledOver = this.rolledOver;
            }
            if (entityColor) {
                color = entityColor;
            } else {
                if (drawable.species !== 'image') {
                    color = drawable.properties.color;
                }
            }
            if (drawable.properties.locked) {
                color = '#a6bddb';
            }
            switch (drawable.division) {
                case 'point':
                case 'shape':
                case 'interior':
                case 'notation':
                case 'annotation':
                    if (this._undergoingOperation && this._undergoingOperation.type !== 'annotation' && (this._undergoingOperation.hitShape.indexOf(drawable) > -1 || this._undergoingOperation._substitutePoint === drawable)) {
                        color = entityColor || color;
                        if (this.anchor === drawable && !entityColor) {
                            color = anchorColor;
                        }
                    } else if (rolledOver.indexOf(drawable) > -1) {
                        color = '#db490e';
                    } else if (selected.indexOf(drawable) > -1 || drawable._universe && selected.indexOf(drawable._universe) > -1) {
                        if (drawable.properties.locked || (drawable._universe && drawable._universe.properties.locked)) {
                            color = '#2b8cbe';
                        } else {
                            color = '#01cc01';
                        }


                    } else if (this.anchor === drawable) {
                        color = anchorColor;
                    } else if (drawable.aptitude === 'c') {
                        color = '#f00';
                    } else if (drawable._incinerated) {
                        color = '#ff0';
                    }
                    if (drawable.equation) {
                        drawable.equation.changeColor(color);
                    }

                    switch (drawable.growthPhase) {
                        case 'normal':
                            drawable.opacity = 1;
                            break;
                        case 'embryo':
                            drawable.opacity = 0.5;
                            break;
                        default:
                            break;
                    }
                    break;
                case 'relation':
                    if (selected.indexOf(drawable) > -1) {
                        color = '#01cc01';
                    } else if (this.anchor === drawable) {
                        color = anchorColor;
                    }
                    drawable.offspring.equation.changeColor(color);
                    break;
                case 'measurement':
                    drawable.trigger('change-style');
                    break;

                case 'iteration':
                    if (rolledOver.indexOf(drawable) > -1) {
                        entityColor = '#db490e';
                    } else {
                        entityColor = color;
                    }
                    drawable.changeColor(entityColor);
                    break;
            }
        },

        "updateAxisColor": function(axis) {
            var gridStyle = {
                    "color": {
                        "xLine": {},
                        "yLine": {}
                    }
                },
                color;
            if (this.anchor === axis) {
                color = '#00f';
            } else if (this.rolledOver.indexOf(axis) > -1 || this.selected.indexOf(axis) > -1) {
                color = '#01ff01';
            } else {
                color = axis.properties.color;
            }
            if (this._standardObjects.Ymirror === axis) {
                gridStyle.color.yLine.axisLine = color;
            } else {
                gridStyle.color.xLine.axisLine = color;
            }
            this.grid.setGridStyle(gridStyle);
            this.grid.drawGraph();
        },

        "setProperty": function(propertyName, propertyValue, bSetProperty) {
            var entity,
                currentDefaultPropertyValue,
                currentEntity,
                isCurrentOperationDraw,
                drawRegex = /^(draw)/;
            if (this._undergoingOperation && this._undergoingOperation.directive.match(drawRegex)) {
                isCurrentOperationDraw = true;
            }
            switch (propertyName) {
                case 'color':
                    for (entity = 0; entity < this.selected.length; entity++) {
                        currentEntity = this.selected[entity];

                        if (currentEntity.species === 'image') {
                            continue;
                        }
                        if (currentEntity.division === 'measurement') {
                            if (bSetProperty) {
                                currentEntity.setProperty(propertyName, propertyValue);
                            }
                            continue;
                        }
                        if (currentEntity.division === 'iteration') {
                            currentEntity.setProperty(propertyName, propertyValue);
                        }
                        if (currentEntity.species === 'point' && isCurrentOperationDraw && this._undergoingOperation.agents[0]) {

                            this._undergoingOperation.agents[0].setProperty(propertyName, propertyValue);

                        }
                        currentDefaultPropertyValue = this.defaultProperties[currentEntity.species].color;
                        this.setDefaultProperty(propertyName, propertyValue, currentDefaultPropertyValue, currentEntity.species);
                        if (bSetProperty) {
                            currentEntity.setProperty(propertyName, propertyValue);
                        }
                    }
                    //......improvise selection style..
                    this.deselectAll();
                    break;
                case 'thickness':
                    for (entity = 0; entity < this.selected.length; entity++) {
                        currentEntity = this.selected[entity];
                        if (currentEntity.species === 'image') {
                            continue;
                        }
                        currentDefaultPropertyValue = this.defaultProperties[this.selected[entity].species].thickness;
                        this.setDefaultProperty(propertyName, propertyValue, currentDefaultPropertyValue, currentEntity.species);
                        if (bSetProperty) {
                            currentEntity.setProperty(propertyName, propertyValue);
                        }
                    }
                    break;
            }
        },

        "setDefaultProperty": function(propertyName, propertyValue, currentDefaultPropertyValue, species) {

            if (currentDefaultPropertyValue !== propertyValue) {
                switch (propertyName) {
                    case 'color':
                        this.defaultProperties[species].color = propertyValue;
                        break;
                    case 'thickness':
                        this.defaultProperties[species].thickness = propertyValue;
                        break;
                    case 'labelText':
                        this.defaultProperties[species].labelText = propertyValue;
                        break;
                    case 'labelPosition':
                        this.defaultProperties[species].labelPosition = propertyValue;
                        break;
                    case 'labelVisibility':
                        this.defaultProperties[species].labelVisibility = propertyValue;
                        break;
                }
            }
        },

        /*
        End the annotation operation on undo or select all etc.
        Since we usually end the operation when new operation begins we need to end it for these special cases.
        */
        "abortAnnotationOperation": function() {
            if (this._undergoingOperation) {
                var directive = this._undergoingOperation.directive;
                if (this._undergoingOperation.type === 'annotation') {
                    this._undergoingOperation.abort();
                    this.perform(directive);
                }

            }
        },

        "updateSegmentsForPoint": function(point, newPosition, repeatTracker) {
            var segmentsToUpdate = this.pointShapeMap[point.id],
                i, updateDataObject, len;

            if (segmentsToUpdate) {
                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                len = segmentsToUpdate.length;
                for (i = 0; i < len; i++) {
                    if (repeatTracker && repeatTracker.indexOf(segmentsToUpdate[i]) > -1) {
                        continue;
                    }
                    updateDataObject.genesis = point;
                    updateDataObject.caller = point;
                    segmentsToUpdate[i].update(updateDataObject);
                    if (repeatTracker) {
                        repeatTracker.push(segmentsToUpdate[i]);
                    }
                }
            }
        },

        "_select": function(object, forceState, timestamp, preventLockCreation, miscDirectives) {
            var currentState, obj, newState, exclusiveSelection,
                transformationView, originalSelection;
            exclusiveSelection = this.dgtUI.model.dgtPopUpView.model.curPopupShown === 'properties';
            if (exclusiveSelection && (object.species === 'measureIteration' || ['image', 'annotation'].indexOf(object.division) > -1 ||
                    object.properties.locked)) {
                return;
            }
            if (this.selectionSteal) {
                this.selectionSteal._select(object);
                object.setLastSelectedTimestamp(timestamp);
                return;
            }

            if (!object || object.properties && object.properties.binaryInvisibility !== 0) {
                return;
            }
            if (object._universe) {
                originalSelection = object;
                object = object._universe;
            }

            if (this.rolledOver.indexOf(object) > -1) {
                this.rolledOver.splice(this.rolledOver.indexOf(object), 1);
            }
            if (this._undergoingOperation && this._undergoingOperation.isInvolvedInOperation(object) && (!miscDirectives || miscDirectives.indexOf('forceOperationSelection') === -1)) {
                return;
            }
            if (object) {
                currentState = this.selected.indexOf(object) > -1;
                if (!forceState) {
                    newState = !currentState;
                } else if (currentState === forceState) {
                    return;
                } else {
                    newState = forceState;
                }

                if (originalSelection) {
                    originalSelection.setLastSelectedTimestamp(timestamp);
                }
                object.setLastSelectedTimestamp(timestamp);
                if (!newState && exclusiveSelection) {
                    return;
                }

                this.grid.restrainViewRefreshByModule('dgtEngine.select');

                if (newState) {

                    if (exclusiveSelection) {
                        while (this.selected.length > 0) {
                            obj = this.selected[this.selected.length - 1];
                            obj.updateSelectionState(false);
                            this.selected.pop();
                            this._updateDrawableColor(obj);

                        }
                    }
                    this.selected.push(object);

                    object.updateSelectionState(true);
                    if (!preventLockCreation && this.getOperationMode() === 'select') {
                        MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'grid', this.selected.length);
                    }
                } else {
                    this.selected.splice(this.selected.indexOf(object), 1);

                    object.updateSelectionState(false);

                    if (!preventLockCreation) {
                        MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('cursor', 'grid', this.selected.length);
                    }
                }
                switch (object.division) {
                    case 'point':
                        this._updateDrawableColor(object);
                        break;

                    case 'image':
                        /* select image */
                        if (this.selected.indexOf(object) > -1) {
                            object.setTransformationObject();
                        } else {
                            transformationView = MathUtilities.Tools.Dgt.Views.TransformationGridView.getTransformationGridViewObject(this.dgtUI.model.dgtPaperScope, this, object.equation.getRaster());
                            transformationView.removeTransformation();
                        }
                        break;
                    default:
                        this._updateDrawableColor(object);
                        break;
                }
                this.grid.freeViewRefreshByModule('dgtEngine.select');

                if (!preventLockCreation) {
                    this.postMultipleSelection();
                }
            }

            if (exclusiveSelection) {
                this.changePropertiesPopup(object);
            }
        },

        "isSelected": function(object) {
            return this.selected.indexOf(object) > -1;
        },

        "updatePossibleOperations": function() {
            var DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                codeName = this.getSelectedCodeName('transform'),
                operation, expectation, lookForAnchor, showLabel,
                drawRegex = /draw|Annotation|Image|Text[\w]*/;
            this.possible = [];
            for (operation in DgtOperation._prerequisitesMap) {
                if (drawRegex.test(operation)) {
                    continue;
                }

                expectation = DgtOperation._prerequisitesMap[operation];

                lookForAnchor = DgtOperation.getOperationType(operation) === 'transform' && operation !== 'translate';

                if (DgtOperation.matchExpectationCode(codeName, expectation, lookForAnchor)) {
                    this.possible.push(operation);
                }
            }

            this.extensiveRecheckingOfOperations();

            showLabel = this.checkLabelVisibility();
            this.checkSelectedColor();
            this.changeLabelOption('label');
            this.dgtUI.changeUnmarkOption(this.anchor);
            this.dgtUI.enableDropDownItems(this.possible, showLabel);
            this.dgtUI.disableMenuBarItems(this.possible);
            this.dgtUI.showHideProperties(this.possible);
        },

        "checkSelectedColor": function() {
            var selectedElements, index, currentColor;
            selectedElements = this.selected;
            for (index = 0; index < selectedElements.length; index++) {
                if (index === 0) {
                    currentColor = selectedElements[0].properties.color;
                } else if (selectedElements[index].properties.color !== currentColor) {
                    currentColor = "none";
                    break;
                }
            }
            this.dgtUI.highlightSelectedColor(currentColor);
        },

        "changeLabelOption": function(str) {

            var i, indexOfSelected, allMeasures = true,
                sendSpecie = false,
                firstSpecie, indexOfSelected1, curSpecie, sendDivision = false,
                stringKey, firstCreationMethod,
                creationMethod, stringToDisplay, noOfSelected,
                DgtUiModel = MathUtilities.Tools.Dgt.Models.DgtUiModel,
                textMapping = DgtUiModel.textMapping;
            if (this.selected.length === 0) {
                return void 0;
            }
            for (i = 0; i < this.selected.length; i++) {
                if (['annotation', 'image'].indexOf(this.selected[i].division) > -1 && this.possible.indexOf('properties') !== -1) {
                    this.possible.splice(this.possible.indexOf('properties'), 1);
                }
            }
            if (this.selected[0].division === 'annotation') {
                stringKey = 'annotation';
                stringToDisplay = textMapping.annotation;
            } else if (this.selected[0].division === 'image') {
                stringKey = 'image';
                stringToDisplay = textMapping.image;
            }
            firstSpecie = this.selected[0].species;
            firstCreationMethod = this.selected[0].getCreationMethod();
            noOfSelected = this.selected.length;
            if (str === 'label') {
                for (indexOfSelected = 0; indexOfSelected < noOfSelected; indexOfSelected++) {
                    if (this.selected[indexOfSelected].species !== firstSpecie ||
                        firstSpecie === 'line' && this.selected[indexOfSelected].getCreationMethod() !== firstCreationMethod) {
                        for (indexOfSelected1 = 0; indexOfSelected1 < noOfSelected; indexOfSelected1++) {
                            if (this.selected[indexOfSelected1].division !== 'measurement' || this.selected[indexOfSelected1].species === 'parameter') {
                                allMeasures = false;
                            }
                        }
                        if (allMeasures) {
                            stringKey = 'measurements';
                            stringToDisplay = textMapping.measurements;
                        } else {
                            stringKey = 'objects';
                            stringToDisplay = textMapping.objects;
                        }
                        this.dgtUI.showCustomLabelOption(stringToDisplay, stringKey);
                        return void 0;
                    }
                }
            }
            for (indexOfSelected = 0; indexOfSelected < noOfSelected; indexOfSelected++) {
                creationMethod = this.selected[indexOfSelected].getCreationMethod();
                curSpecie = this.selected[indexOfSelected].species;
                if (['point', 'parameter', 'calculation', 'iteration'].indexOf(curSpecie) > -1) {
                    sendSpecie = true;
                }
                if (['natural', 'circleWithPoints', 'circleWithRadius', 'measureAngle', 'measureSegmentAngle', 'measureRayAngle', 'withCircle'].indexOf(creationMethod) > -1) {
                    sendSpecie = true;
                    break;
                }
                if (this.selected[indexOfSelected].division === 'interior') {
                    sendDivision = true;
                }
                for (indexOfSelected1 = indexOfSelected; indexOfSelected1 < noOfSelected; indexOfSelected1++) {
                    if (this.selected[indexOfSelected1].getCreationMethod() !== creationMethod) {
                        sendSpecie = true;
                    }
                }
            }
            if (sendSpecie === true) {
                if (this.selected[0].division === 'measurement') {

                    stringKey = this.selected[0].type;
                    stringToDisplay = DgtUiModel.measureSpecie[stringKey]; //accessed from ui model
                    if (this.selected[0].species === 'parameter') {
                        stringKey = 'parameter';
                        stringToDisplay = textMapping.parameter;
                    }
                } else {
                    stringKey = this.selected[0].species;
                    stringToDisplay = textMapping[stringKey];
                }
            } else if (sendDivision === true) {
                stringKey = this.selected[0].division;
                stringToDisplay = textMapping[stringKey];
            } else if (['rotate', 'translate', 'dilate', 'reflect'].indexOf(this.selected[0].getCreationMethod()) > -1) {
                stringKey = this.selected[0].species;
                stringToDisplay = textMapping[stringKey];
            } else if (!stringKey) {
                stringKey = this.selected[0].getCreationMethod();
                if (stringKey.indexOf('Bisector') !== -1) {
                    stringKey = 'bisector';
                }
                if (stringKey.indexOf('Directrix') !== -1) {
                    stringKey = 'line';
                }
                stringToDisplay = textMapping[stringKey];
            }
            if (this.selected.length > 1 && stringKey !== 'coordinate') {
                stringToDisplay = DgtUiModel.pluralSpecieTextMapping[stringKey];
            }
            if (str === 'label') {
                if (this.possible.indexOf('properties') === -1) {
                    this.dgtUI.showCustomLabelOption(stringToDisplay, '', true);
                } else {
                    this.dgtUI.showCustomLabelOption(stringToDisplay, stringKey);
                }
                if (stringKey === '..') {
                    this.possible.splice(this.possible.indexOf(DgtUiModel.popupTitleMapping.label), 1);
                }
            } else {
                if (this.selected.length > 1) {
                    stringToDisplay = textMapping.multipleObjects;
                }
            }
            return stringToDisplay;
        },

        "checkLabelVisibility": function() {
            if (this.selected.length === 0) {
                return true;
            }
            var entity;
            for (entity in this.selected) {
                //if labelVisibility = false or undefined in case of image, text, measures, annotations
                if (this.selected[entity].properties && !this.selected[entity].properties.labelVisibility) {
                    if (typeof this.selected[entity].properties.labelVisibility === 'undefined' && this.possible.indexOf('showHideLabels') !== -1) {
                        this.possible.splice(this.possible.indexOf('showHideLabels'), 1);
                    }
                    return true;
                }
            }
            return false;
        },

        "_removeOperationsNotPossible": function(operation) {
            var index = this.possible.indexOf(operation);
            if (index > -1) {
                this.possible.splice(index, 1);
            }
        },

        "extensiveRecheckingOfOperations": function() {

            var DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                common, checkForCommonPoints,
                isOnShape, circleIndex, noOfTicks = 0,
                indexObject = this.possible.indexOf('showAllHidden'),
                loopVar, intersectionCreationMethod, pointsOnCircle = false,
                indexLabel, index, intersectionPoints, intersectionPossible = true,
                circleForArc = [],
                onlyLockedEntitiesSelected = true,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                parentData = [],
                isLockedEntitySelected = false,
                pointCount, freePointFound = false,
                freeMeasurementFound = false,
                sources, points = [],
                onlyImagesSelected = true,
                noOfMeasurementsFound = 0,
                iterateToDepthNotPossible = false,
                i = 0,
                j = 0,
                constructInteriorPossible = this.possible.indexOf('constructInterior');

            for (loopVar = 0; loopVar < this.selected.length; loopVar++) {
                if (this.selected[loopVar].properties.locked) {
                    isLockedEntitySelected = true;
                } else {
                    onlyLockedEntitiesSelected = false;
                }
            }
            if (this.hiddenObjects.length === 0 && indexObject !== -1 || !this.isOwner &&
                (!this.hideUserMap[this.userId] || this.hideUserMap[this.userId].length === 0)) {
                this.possible.splice(indexObject, 1);
            }
            if (constructInteriorPossible !== -1 && this.selected[0].division === 'point' && this.selected.length < 3) {
                this.possible.splice(constructInteriorPossible, 1);
            }
            index = this.possible.indexOf('delete');
            if (index > -1 && !isLockedEntitySelected) {
                this.dgtUI.enableDeleteButton();
            } else {
                this.dgtUI.disableDeleteButton();
                if (index > -1) {
                    this.possible.splice(index, 1);
                }

            }
            index = this.possible.indexOf('properties');
            if (index > -1 && isLockedEntitySelected) {
                this.possible.splice(index, 1);
            }
            index = this.possible.indexOf('markCenter');
            index = index > -1 ? index : this.possible.indexOf('markMirror');
            if (index > -1 && this.anchor && this.selected[0] === this.anchor) {
                this.possible.splice(index, 1);
            }
            index = this.possible.indexOf('unlock');
            if (index > -1 && !isLockedEntitySelected || !onlyLockedEntitiesSelected) {
                this.possible.splice(index, 1);
            }
            index = this.possible.indexOf('lockObject');
            if (index > -1 && isLockedEntitySelected) {
                this.possible.splice(index, 1);
            }
            index = this.possible.indexOf('cut');
            if (index > -1 && isLockedEntitySelected) {
                this.possible.splice(index, 1);
                this.possible.splice(this.possible.indexOf('copy'), 1);
            }
            index = this.possible.indexOf('changeColor');
            if (index !== -1) {
                for (loopVar = 0; loopVar < this.selected.length; loopVar++) {
                    if (this.selected[loopVar].division === 'image') {
                        this.possible.splice(index, 1);
                        break;
                    }
                }
            }
            if (this.possible.indexOf('unmarkAll') > -1 && !this.anchor) {
                this.possible.splice(this.possible.indexOf('unmarkAll'), 1);
            }

            if (this.possible.indexOf('unlockAll') > -1 && this.locked.length === 0 || !this.isOwner &&
                (!this.lockUserMap[this.userId] || this.lockUserMap[this.userId].length === 0)) {
                this.possible.splice(this.possible.indexOf('unlockAll'), 1);
            }
            if (this.possible.indexOf('iterate') !== -1) {
                for (loopVar = 0; loopVar < this.selected.length; loopVar++) {
                    if (this.selected[loopVar].division === 'point' && (!this.selected[loopVar].creator || this.selected[loopVar].creator.species === 'pointOnObject')) {
                        freePointFound = true;
                    } else if (this.selected[loopVar].species === 'parameter' || this.selected[loopVar].species === 'calculation' && this.selected[loopVar].creator.sources.length === 0) {
                        freeMeasurementFound = true;
                    }
                    if (this.selected[loopVar].division === 'measurement' && ['measureEquation', 'measureCoordinate', 'measureIteration'].indexOf(this.selected[loopVar].species) === -1) {
                        noOfMeasurementsFound++;
                    }

                    if (['measureEquation', 'measureCoordinate', 'measureIteration'].indexOf(this.selected[loopVar].species) > -1) {
                        iterateToDepthNotPossible = true;
                    }
                }
                if ((iterateToDepthNotPossible || !(freePointFound && noOfMeasurementsFound === 1 ||
                        !freePointFound && noOfMeasurementsFound >= 2)) && this.possible.indexOf('iterateToDepth') !== -1) {
                    this.possible.splice(this.possible.indexOf('iterateToDepth'), 1);
                }

                if (!freePointFound && !freeMeasurementFound) {
                    this.possible.splice(this.possible.indexOf('iterate'), 1);
                    if (this.possible.indexOf('iterateToDepth') !== -1) {
                        this.possible.splice(this.possible.indexOf('iterateToDepth'), 1);
                    }
                }
            }
            if (this.possible.indexOf('paste') !== -1 && jQuery.isEmptyObject(this.clipBoardData.pasteData)) {
                this.possible.splice(this.possible.indexOf('paste'), 1);
            }

            while (i < this.selected.length) {
                if (this.possible.indexOf('measurePerimeter') !== -1 && this.selected[i].species === 'ellipseInterior') {
                    this.possible.splice(this.possible.indexOf('measurePerimeter'), 1);
                }
                if (this.possible.indexOf('showHideLabels') !== -1 && (this.selected[i].division === 'image' || this.selected[i].division === 'annotation' || this.selected[i].species === 'tickMark')) {
                    this.possible.splice(this.possible.indexOf('showHideLabels'), 1);
                }

                if (this.selected[i].division === 'measurement') {
                    indexLabel = this.possible.indexOf('showHideLabels');
                    if (indexLabel > -1) {
                        this.possible.splice(indexLabel, 1);
                    }

                    if (['measureCoordinate', 'measureEquation', 'measureIteration'].indexOf(this.selected[i].species) > -1) {
                        index = this.possible.indexOf('properties');
                        if (index > -1) {
                            this.possible.splice(this.possible.indexOf('properties'), 1);
                        }
                    }

                } else if (this.selected[i].species === 'tickMark' && noOfTicks < 2) {
                    noOfTicks++;
                    if (noOfTicks > 1) {
                        index = this.possible.indexOf('properties');
                        if (index > -1) {
                            this.possible.splice(this.possible.indexOf('properties'), 1);
                        }
                    }
                }
                if (['annotation', 'measurement', 'notation'].indexOf(this.selected[i].division) !== -1) {
                    this._removeOperationsNotPossible('translate');
                    this._removeOperationsNotPossible('rotate');
                    this._removeOperationsNotPossible('dilate');
                    this._removeOperationsNotPossible('reflect');
                    this._removeOperationsNotPossible('connectPointOnObject');
                }
                if (this.isStandardObject(this.selected[i])) {
                    this._removeOperationsNotPossible('hideObjects');
                    this._removeOperationsNotPossible('cut');
                    this._removeOperationsNotPossible('copy');
                    if (this.possible.indexOf('delete') > -1 && this.isOnlyAxisSelected()) {
                        this.possible.splice(this.possible.indexOf('delete'), 1);
                        this.dgtUI.disableDeleteButton();
                    }
                }
                if (this.selected[i].division !== 'image') {
                    onlyImagesSelected = false;
                } else if (this.selected[i].division === 'image' && this.selected[i].isCropped === true) {
                    this._removeOperationsNotPossible('translate');
                    this._removeOperationsNotPossible('rotate');
                    this._removeOperationsNotPossible('dilate');
                    this._removeOperationsNotPossible('reflect');
                    this._removeOperationsNotPossible('cropping');
                }
                i++;
            }
            //for Collinear Points Case
            if (this.possible.indexOf('connectArc') !== -1) {
                for (loopVar = 0; loopVar < this.selected.length; loopVar++) {
                    points.push(this.selected[loopVar].equation.getPoints()[0]);
                }

                if (points.length === 3 && !geomFunctions.isArcPossible(points[0][0], points[0][1], points[1][0], points[1][1], points[2][0], points[2][1])) {

                    this.possible.splice(this.possible.indexOf('connectArc'), 1);
                }
            }
            //for perimeter
            if (this.possible.indexOf('measurePerimeter') !== -1) {
                for (loopVar = 0; loopVar < this.selected.length; loopVar++) {
                    if (this.selected[loopVar].species === 'circleInterior') {
                        index = this.possible.indexOf('measurePerimeter');
                        this.possible.splice(index, 1);
                        break;
                    }
                }
            }
            if (onlyImagesSelected === true && this.possible.indexOf('changeColor') !== -1) {
                this.possible.splice(this.possible.indexOf('changeColor'), 1);
            }

            if (onlyImagesSelected === false && this.possible.indexOf('cropping') > -1 || onlyImagesSelected === true && this.possible.indexOf('cropping') > -1 && (this.selected[0].isCropped === true || typeof this.selected[0].text === 'string')) {
                this.possible.splice(this.possible.indexOf('cropping'), 1);
            }
            if (this.selected.length < 2) {
                return;
            }
            // Arc On Circle
            if (this.possible.indexOf('connectArcOnCircle') !== -1) {
                sources = this.selected.slice();
                sources = DgtOperation.getInputsInOrder(sources, DgtOperation._prerequisitesMap.connectArcOnCircle);
                if (sources[0].species === 'circle') {
                    circleForArc.push(sources[0]);
                } else {
                    for (i = 0; i < this.selected[0]._childrenRelationships.length; i++) {
                        if (this.selected[0]._childrenRelationships[i].offspring.species === 'circle') {
                            circleForArc.push(this.selected[0]._childrenRelationships[i].offspring);
                        }
                    }
                }
                for (i = 0; i < circleForArc.length; i++) {

                    if (sources[1].creator && sources[1].creator.isPartOfThisRelation(circleForArc[i])) {
                        circleIndex = i;
                        if (sources[2].creator && sources[2].creator.isPartOfThisRelation(circleForArc[circleIndex])) {
                            pointsOnCircle = true;
                        } else {
                            for (loopVar = 0; loopVar < sources[2]._childrenRelationships.length; loopVar++) {
                                if (sources[2]._childrenRelationships[loopVar].isPartOfThisRelation(circleForArc[i]) && circleForArc[i].creator.sources[1] === sources[2]) {
                                    pointsOnCircle = true;
                                }
                            }
                        }
                    } else {
                        for (loopVar = 0; loopVar < sources[1]._childrenRelationships.length; loopVar++) {
                            if (sources[1]._childrenRelationships[loopVar].isPartOfThisRelation(circleForArc[i]) && circleForArc[i].creator.sources[1] === sources[1]) {
                                circleIndex = i;
                                if (sources[2].creator && sources[2].creator.isPartOfThisRelation(circleForArc[circleIndex])) {
                                    pointsOnCircle = true;
                                }
                            }
                        }
                    }
                }
                if (!pointsOnCircle) {
                    index = this.possible.indexOf('connectArcOnCircle');
                    this.possible.splice(index, 1);
                }
            }
            //for intersection
            intersectionPossible = this.possible.indexOf('connectIntersection') > -1;

            if (intersectionPossible) {
                sources = this.selected.slice();
                sources = DgtOperation.getInputsInOrder(sources, DgtOperation._prerequisitesMap.connectIntersection);
                parentData[0] = DgtEngine.getDataOfEntity(sources[0]);
                parentData[1] = DgtEngine.getDataOfEntity(sources[1]);
                intersectionCreationMethod = MathUtilities.Tools.Dgt.Models.DgtRelation.getCreationMethodForSources(sources, 'intersection');
                intersectionPoints = this.getIntersectionPoint(parentData, intersectionCreationMethod);

                if (intersectionPoints) {
                    for (i = 0; i < sources.length; i++) {
                        if (['arc', 'segment', 'ray'].indexOf(sources[i].species) > -1) {
                            for (j = 0; j < intersectionPoints.length; j++) {
                                isOnShape = DgtEngine.isOnShape(parentData[i], sources[i].species, intersectionPoints[j]);
                                if (isOnShape === false) {
                                    intersectionPoints.splice(j, 1);
                                    j--;
                                }
                            }

                        }
                    }
                }
                for (pointCount = 0; pointCount < intersectionPoints.length; pointCount++) {
                    if (isFinite(intersectionPoints[pointCount][0]) && isFinite(intersectionPoints[pointCount][1])) {
                        break;
                    }
                    if (pointCount === intersectionPoints.length - 1) {
                        intersectionPoints.splice(0, intersectionPoints.length);
                    }
                }
                if (intersectionPoints.length === 0 && this.possible.indexOf('connectIntersection') !== -1) {

                    index = this.possible.indexOf('connectIntersection');
                    this.possible.splice(index, 1);
                }
            }

            checkForCommonPoints = _.bind(function() {
                var checkFor = ['angleBisector', 'measureAngle', 'markAngle'],
                    looper;
                for (looper = 0; looper < checkFor.length; looper++) {
                    if (this.possible.indexOf(checkFor[looper]) === -1) {
                        continue;
                    }
                    if (!common) {
                        this.possible.splice(this.possible.indexOf(checkFor[looper]), 1);
                    }
                }
            }, this);

            //checkForCommonPoints for directives like 'angleBisector', 'measureAngle', 'markAngle'
            if (this.selected[0].division !== 'point' && this.selected[1].division !== 'point') {
                common = DgtOperation.getCommonPointCoords(this.selected[0], this.selected[1]);
                checkForCommonPoints();
            }
        },

        "getSelectedCodeName": function(directiveType) {
            var sources = this.selected,
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                codeName = '',
                i,
                regMeasure = /measure[\w]*/;
            directiveType = null;

            if (this.anchor && !this.anchor.properties.binaryInvisibility) { // consider anchor only if visible
                codeName += DgtOperation._drawableMapping[this.anchor.species];
            }
            codeName += '_';
            if (sources.length > 0) {
                for (i = 0; i < sources.length; i++) {
                    if (sources[i]._universe) {
                        return '_Y';
                    }
                    if (!DgtOperation._drawableMapping[sources[i].species]) {
                        if (regMeasure.test(sources[i].species)) {
                            codeName += 'M';
                        }
                        continue;
                    }
                    codeName += DgtOperation._drawableMapping[sources[i].species];
                }
            }
            return codeName;
        },


        "getDrawingMode": function() {
            return this._drawingMode;
        },

        "setDrawingMode": function(mode) {
            if (this._undergoingOperation) {
                this._undergoingOperation.abort();
                this.dontWaitForTabletPoint();
            }
            this._drawingMode = mode;
        },

        "addPointToPlot": function(point) {
            if (point.equation) {
                this.plotter.addEquation(point.equation);
            }
        },

        "_selectionRectComplete": function(selectionBound) {
            var operationMode = this.getOperationMode(),
                topLeft,
                $menuHolder, dgtUI = this.dgtUI,
                gridBounds = {},
                temp, ctr, selected,
                DgtStatusMessage = MathUtilities.Tools.Dgt.Models.DgtStatusMessage,
                canvasBounds,
                PADDING = 5,
                editorOptions;

            DgtStatusMessage.getStatusString('cursor', 'leave');
            temp = this.grid._getGraphPointCoordinates([selectionBound.x, selectionBound.y]);
            gridBounds.x = temp[0];
            gridBounds.y = temp[1];

            temp = this.grid._getGridDistance([selectionBound.width, selectionBound.height]);
            gridBounds.width = temp[0];
            gridBounds.height = temp[1];

            this.eventListenerCanvas.attachMouseMoveFunction(null);

            if (operationMode === 'select') {

                selected = this.grid._getPathsUnderArea(selectionBound);

                for (ctr = 0; ctr < selected.length; ctr++) {
                    if (selected[ctr].properties.binaryInvisibility !== 0 || selected[ctr].getCreationMethod() === 'axis') {
                        selected.splice(ctr, 1);
                        ctr--;
                    }
                }

                if (selected.length > 0) {

                    while (selected.length > 0) {
                        this._select(selected.pop(), true, null, true);
                    }
                    DgtStatusMessage.getStatusString('cursor', 'grid', this.selected.length);
                    this.postMultipleSelection();
                }
            } else if (operationMode === 'nonGeometricDrawing') {
                //for text case
                $menuHolder = dgtUI.$el.parent().find('.dgt-menu-holder');

                this.createTextTool();
                topLeft = {
                    "x": selectionBound.x,
                    "y": selectionBound.y
                };

                this.textToolView.on('getBase64', dgtUI._onTextReceived);

                canvasBounds = {
                    "left": PADDING,
                    "top": $menuHolder.height() + PADDING,
                    "height": this.grid._canvasSize.height - this.grid._scrollBarManager._scrollButtonSize - 2 * PADDING,
                    "width": this.grid._canvasSize.width - this.grid._scrollBarManager._scrollButtonSize - 2 * PADDING
                };
                editorOptions = {
                    "height": selectionBound.height,
                    "width": selectionBound.width,
                    "text": '',
                    "counter": this.textToolCounter++,
                    "topLeft": topLeft,
                    "openModal": true,
                    "basePath": dgtUI.model.basepath,
                    "offset": $menuHolder.height(),
                    "csvData": null,
                    "isAccessible": MathUtilities.Tools.Dgt.Models.DgtEngine.isAccessible,
                    "canvasBounds": canvasBounds,
                    "isReEdit": false
                };
                this.textToolView.loadEditor(editorOptions);
                this.grid.resetGridMode();
            }
            this.grid.refreshView();
        },

        "updateTextToolResizingData": function() {
            var $menuHolder = this.dgtUI.$el.parent().find('.dgt-menu-holder'),
                PADDING = 5,
                canvasBounds = {
                    "left": PADDING,
                    "top": $menuHolder.height() + PADDING,
                    "height": this.grid._canvasSize.height - this.grid._scrollBarManager._scrollButtonSize - 2 * PADDING,
                    "width": this.grid._canvasSize.width - this.grid._scrollBarManager._scrollButtonSize - 2 * PADDING
                };
            this.textToolView.updateResizingData(canvasBounds);
        },

        "createAnnotationStart": function(color, thickness) {
            var grid = this.grid;
            grid._projectLayers.annotationLayer.activate();
            grid.setGridMode('annotation-mode');
            grid.on('grid-layer-annotate-start', _.bind(this._createAnnotationMouseDown, this))
                .on('grid-layer-annotate-end', _.bind(this._createAnnotationMouseUp, this));
            this._annotationPaths = new grid._paperScope.Group();
            this._annotationPaths.strokeColor = color;
            this._annotationPaths.strokeWidth = thickness;
        },

        "_createAnnotationMouseDown": function(event) {
            var grid = this.grid,
                annotationPath;
            grid.on('grid-layer-annotate-drag', this._createAnnotationMoveFunc);
            grid.setGridMode('annotation-mode'); //when changing grid type during incomplete annotation operation

            annotationPath = new grid._paperScope.Path();
            annotationPath.strokeWidth = this._annotationPaths.strokeWidth;
            grid._paperScope.tool.minDistance = 1;
            annotationPath.strokeColor = this._annotationPaths.strokeColor;
            annotationPath.strokeWidth = this._annotationPaths.strokeWidth;
            this.incompleteAnnotations.push(grid._getGraphPointCoordinates(geomFunctions.getCanvasCoordinates(event)));
            this._firstPoint = event.point;
            this._annotationPaths.addChild(annotationPath);
            annotationPath.minimumDistance = 1;
            annotationPath.maximumDistance = 2;
            annotationPath.strokeCap = 'round';
            annotationPath.strokeJoin = 'round';
        },

        "_createAnnotationMove": function(event) {

            var annotationPathChildren = this._annotationPaths._children,
                grid = this.grid;
            if (!annotationPathChildren) {
                return;
            }
            if (this._firstPoint) {
                annotationPathChildren[annotationPathChildren.length - 1].add(this._firstPoint);
                this._firstPoint = null;
            }
            annotationPathChildren[annotationPathChildren.length - 1].add(event.point);
            this.incompleteAnnotations.push(grid._getGraphPointCoordinates(geomFunctions.getCanvasCoordinates(event)));
            grid.refreshView();
        },

        "_createAnnotationMouseUp": function(event) {
            var grid = this.grid,
                annotationPathChildren = this._annotationPaths._children,
                firstPointX, firstPointY, noOfPaths;
            this.eventListenerCanvas.attachMouseMoveFunction(null);
            event = null;

            noOfPaths = annotationPathChildren.length - 1;

            if (this._firstPoint) {
                firstPointX = this._firstPoint.x;
                firstPointY = this._firstPoint.y;
                annotationPathChildren[noOfPaths].add([firstPointX, firstPointY]);
                annotationPathChildren[noOfPaths].add([firstPointX + 1, firstPointY + 1]);
                this.incompleteAnnotations.push(grid._getGraphPointCoordinates([firstPointX + 2, firstPointY + 4]));
                this._firstPoint = null;
            }
            this.incompleteAnnotations.push(null);
            grid.refreshView();
        },

        "createAnnotationEnd": function() {
            var returnAnnotations, grid = this.grid;
            returnAnnotations = this.incompleteAnnotations;

            this.incompleteAnnotations.pop();

            this.incompleteAnnotations = [];
            while (this._annotationPaths._children.length > 0) {
                this._annotationPaths._children.pop();
            }

            grid.off('grid-layer-annotate-start')
                .off('draw-annotation')
                .off('grid-layer-annotate-end')
                .off('shape-layer-annotate-end', this.createAnnotationEnd);

            //removing call to reset grid from here for BZ17237: Shape/Circle is not drawn using click and drag if marker drawings are present
            return returnAnnotations;
        },

        "isOnlyAxisSelected": function() {
            var looper;
            for (looper in this.selected) {
                if (this.selected[looper].getCreationMethod() !== 'axis') {
                    return false;
                }
            }
            return true;
        },

        "createTextTool": function() {
            var textToolModel;
            if (this.textToolView === null) {
                textToolModel = new MathUtilities.Components.TextTool.Models.TextTool();
                this.textToolView = new MathUtilities.Components.TextTool.Views.TextTool({
                    "el": "#dgt-container",
                    "model": textToolModel
                });
                MathUtilities.Components.ImageManager._textTool = this.textToolView;
            }
        },

        "_onEntityDelete": null,

        "acknowledgeEntity": function(entity, ghost) {
            if (this.entityMap[entity.id] === entity) {
                return;
            }
            var isPurgatory, target,
                TIMER = 1000;
            entity.on('incinerated', this._onEntityDelete);
            /**
            NOTICE
            If you add anything here then make sure to clean up all listeners in _onEntityDelete
            **/
            if (this.entityMap[entity.id]) {
                isPurgatory = true;
                target = this.purgatory;
            } else if (ghost) {
                target = ghost;
            } else {
                target = this;
            }
            if (entity.division !== 'marking' && this.allEntities.indexOf('entity') === -1 && !entity._universe && (entity.division !== 'iteration' || entity.isOffspringCreated())) {
                this.allEntities.push(entity);
            }

            switch (entity.division) {
                case 'point':
                    entity.equation.on('post-drag', entity.onPostDrag)
                        .on('drag-begin', entity.onDragBegin)
                        .on('post-relocate', entity.onRelocate)
                        .on('roll-over', this._onRollOver)
                        .on('roll-out', this._onRollOut);

                    target.points.push(entity);
                    break;
                case 'shape':
                    entity.equation.on('post-drag', entity.onPostDrag)
                        .on('drag-begin', entity.onDragBegin)
                        .on('post-relocate', entity.onRelocate)
                        .on('roll-over', this._onRollOver)
                        .on('roll-out', this._onRollOut);

                    target.shapes.push(entity);
                    break;
                case 'measurement':
                    if (target.measures.indexOf(entity) === -1) {
                        target.measures.push(entity);
                    }
                    entity.equation.off('post-relocate', entity.onPreRelocate)
                        .on('post-relocate', entity.onPreRelocate);
                    break;
                case 'annotation':
                    target.annotations.push(entity);
                    entity.equation.on('post-drag', entity.onPostDrag)
                        .on('drag-begin', entity.onDragBegin)
                        .on('post-relocate', entity.onRelocate)
                        .on('roll-over', this._onRollOver)
                        .on('roll-out', this._onRollOut);
                    break;
                case 'image':
                    entity.equation.on('drag-begin', entity.onDragBegin);
                    target.images.push(entity);
                    break;
                case 'marking':
                    if ($.inArray(entity, target.markings) === -1) {
                        target.markings.push(entity);
                    }
                    break;
                    //......for the case of interior, review the code
                case 'interior':
                    target.interiors.push(entity);
                    entity.equation.on('post-drag', entity.onPostDrag)
                        .on('drag-begin', entity.onDragBegin)
                        .on('post-relocate', entity.onRelocate)
                        .on('roll-over', this._onRollOver)
                        .on('roll-out', this._onRollOut);
                    break;
                case 'notation':
                    entity.equation.on('post-drag', entity.onPostDrag)
                        .on('drag-begin', entity.onDragBegin)
                        .on('post-relocate', entity.onRelocate)
                        .on('annotate-drag', this._onAnnotateDrag)
                        .on('roll-over', this._onRollOver)
                        .on('roll-out', this._onRollOut);

                    target.notations.push(entity);
                    break;
                case 'iteration':
                    target.iterations.push(entity);
                    break;
            }
            if (!(ghost || isPurgatory)) {
                this.updateEntityMap(entity);
            }
        },

        "incineratePurgatoryObjects": function() {
            var division, key;
            for (division in this.purgatory) {
                for (key in this.purgatory[division]) {
                    this.purgatory[division][key].incinerate();
                }
            }
        },

        "_onRelationDelete": null,

        "acknowledgeRelation": function(relation, trialRelation) {
            var mentorMarkings, looper = 0,
                curMarking;
            relation.on('incinerated', this._onRelationDelete);

            mentorMarkings = relation.getMentorMarking();
            /* While popup is open for transformation we should not add mentee relation for marking in case of transform operation
               and it should be added while operation is finished */
            if (mentorMarkings.length > 0 && (!trialRelation || this._undergoingOperation && this._undergoingOperation.type !== 'transform')) {
                for (looper = 0; looper < mentorMarkings.length; looper++) {
                    curMarking = mentorMarkings[looper];
                    curMarking.setMenteeRelation(relation);
                    curMarking.on('marking-updated', relation._mentorMarkingUpdated);
                }
            }
            this.relationShips.push(relation);
            if (relation.species === 'iterate') {
                relation.trigger('iteration-acknowledged', relation);
            }
        },

        "updateEntityMap": function(entity) {
            this.entityMap[entity.id] = entity;
        },

        "_makeAnchor": function(anchor) {
            if (typeof anchor === 'string') {
                if (this.gridPattern === 'noGrid') {
                    return;
                }
                anchor = this._standardObjects[anchor];
            }
            var oldAnchor = this.anchor,
                replaceAnchor = false,
                doSetProperty = !!anchor;

            if (!anchor || anchor === oldAnchor) {
                replaceAnchor = true;
                anchor = this.anchor;
            }

            if (!anchor) {
                return;
            }

            if (replaceAnchor) {
                this.anchor = null;
            } else {
                this.anchor = anchor;
                this.compileDataForAnimation(anchor.species === 'point' ? 'markCenter' : 'markMirror', [anchor]);
            }
            if (oldAnchor) {
                this._updateDrawableColor(oldAnchor);
                if (doSetProperty) {
                    oldAnchor.setProperty('isMarkedAnchor', false);
                }
            }
            if (!replaceAnchor && this.anchor) {
                this._updateDrawableColor(this.anchor);
                anchor.setProperty('isMarkedAnchor', true);
            }
            this.updatePossibleOperations();
        },

        "positionChangeListener": function(newPosition, equation) {
            var point = equation.getParent(),
                updateDataObject;
            updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
            updateDataObject.genesis = point;
            updateDataObject.newPosition = newPosition;
            updateDataObject.relocatedEntities = [];
            point.triggerRearrangement(updateDataObject);
        },

        "setSnapToGrid": function() {
            this.grid.snapToGridFlag = !this.grid.snapToGridFlag;
            if (this.grid.snapToGridFlag) {
                this.changeGridPattern(this.gridPattern === 'polarGrid' ? 'polarGrid' : 'squareGrid');
                this.dgtUI.model.wasInSnapGridMode = true;
            } else {
                this.dgtUI.model.wasInSnapGridMode = false;
            }
            this.dgtUI.setSelectedGridInMenu(this.gridPattern);
        },

        //for aborting the undergoing operation from dgtUI in cases of text.
        "getUndergoingOperation": function() {
            return this._undergoingOperation;
        },

        "clearBoard": function() {
            //this function clears the board offline .. i.e it does not registers any action.
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;

            this.grid.restrainViewRefreshByModule('engine.clearBoard');
            this._makeAnchor(null);
            while (this.points.length > 0) {
                this.points.pop().incinerate();
            }
            while (this.measures.length > 0) {
                this.measures.pop().incinerate();
            }
            while (this.annotations.length > 0) {
                this.annotations.pop().incinerate();
            }
            while (this.images.length > 0) {
                this.images.pop().incinerate();
            }
            while (this.iterations.length > 0) {
                this.iterations.pop().incinerate();
            }
            DgtEngine.setDefaultValuesForCounters();
            this.parameterCount = 1;
            this.resetPasteCounter();
            this.grid._restoreDefaultZoom();
            this.updatePossibleOperations();
            this.grid.freeViewRefreshByModule('engine.clearBoard');
            this.changeGridPattern('squareGrid', true);
            this.changeGridPattern('noGrid', true);
            this.dgtUI.changeManubarState(this.dgtUI.model.previousMenubarState[0], this.dgtUI.model.previousMenubarState[1]); /*calls perform with selectCursor*/
            this.dgtUI.model.dgtPopUpView.resetTextFields();
            this.dgtUI.model.dgtPopUpView.resetMarkerParams();
        },

        "perform": function(directive, params) {
            if (directive === 'paste' && jQuery.isEmptyObject(this.clipBoardData.pasteData)) {
                return void 0;
            }
            /*If pushed to directive stack, then creates problem when popup is closed, as previous operation performed wud be one of these*/
            var parameters = {},
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                dgtuiModel = this.dgtUI.model,
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                undoData, jsonData, selectedMenuIndex, previousValue,
                redoData, anchor, sources, sourcesLength, selected, object,
                markUnmarkAnchor, previousOperation;

            if (DgtOperation.getOperationType(directive) === 'draw' && directive !== 'drawTickMark' && directive !== 'drawAngleMark' ||
                DgtOperation.getOperationType(directive) === 'annotation' || directive === 'selectCursor') {
                this.updateDirectiveStack(directive);
            }

            if (['noGrid', 'squareGrid', 'polarGrid', 'snapToGrid'].indexOf(directive) > -1) {
                if (directive === 'snapToGrid') {
                    this.setSnapToGrid();
                } else {
                    this.changeGridPattern(directive);
                }
                return void 0;
            }

            markUnmarkAnchor = _.bind(function(selectedEntity) {
                this._makeAnchor(selectedEntity);
                this.deselectAll();
                this.accessibilityView.shiftToProperty = false;
                this.accManager.setFocus('point-highlighter');
            }, this);

            if (['markCenter', 'markMirror'].indexOf(directive) > -1) {
                return markUnmarkAnchor(this.selected[0]);
            }
            if (directive === 'unmarkAll') {
                return markUnmarkAnchor();
            }
            this.setOperationMode(directive);

            if (['measureCoordinate', 'measureSlope', 'measureEquation', 'measureCoordinateDistance'].indexOf(directive) > -1) {
                parameters.measureCoordinate = {
                    "coordinateSystem": this.gridPattern === 'polarGrid' ? 'polar' : 'cartesian'
                };
                params = parameters.measureCoordinate;
                if (!this._isGridVisible()) {
                    this.changeGridPattern(this.gridPattern === 'polarGrid' ? 'polarGrid' : 'squareGrid');
                    this.dgtUI.setSelectedGridInMenu(this.gridPattern);
                }
            }

            if (['showAllHidden', 'hideObjects', 'showHideLabels'].indexOf(directive) > -1) {
                if (this._undergoingOperation) {
                    if (this._undergoingOperation.type === 'annotation') {
                        selected = this.selected.slice();
                    }
                    this._undergoingOperation.abort();
                    if (selected && selected.length > 0) {
                        for (object = 0; object < selected.length - 1; object++) {
                            this._select(selected[object], null, null, true);
                        }
                        this._select(selected[object]);
                    }
                }
                if (directive === 'showHideLabels') {
                    if (params) {
                        this.showHideLabels(params.visibility);
                    } else {
                        this.showHideLabels();
                    }
                    this.accessibilityView.shiftToProperty = false;
                } else {

                    this.showHideObjects(directive);
                }
                return void 0;
            }
            if (directive === 'lockObject') {
                this.lockSelectedObject();
                return void 0;
            }
            if (directive === 'unlockAll') {
                this.unlockAll();
                return void 0;
            }
            if (directive === 'unlock') {
                this.unlockAll(true);
                return void 0;
            }
            if (['rotate', 'dilate', 'reflect'].indexOf(directive) > -1) {
                if (this.anchor) {
                    anchor = this.anchor;
                }
                if (this.selected) {
                    sources = this.selected;
                    sourcesLength = sources.length;
                }
                if (anchor && sources && sourcesLength > 1 && jQuery.inArray(anchor, sources) !== -1) {
                    this._select(anchor);
                }
            }

            if (this._undergoingOperation) {
                selectedMenuIndex = dgtuiModel.menubarCurrentState.selectedMenuIndex;
                dgtuiModel.currentRadioButtontype = dgtuiModel.radioBtnActionMap[selectedMenuIndex];
                if (this._undergoingOperation.directive === directive && dgtuiModel.radioBtnLatestState[dgtuiModel.currentRadioButtontype] === dgtuiModel.previousRadioBtnState[dgtuiModel.currentRadioButtontype]) {
                    return void 0;
                }

                this._undergoingOperation.abort();
                if (directive === 'abortOperation') {
                    return void 0;
                }
            }

            if (directive === 'getData') {
                jsonData = this.getData();
                previousOperation = this.getDirectiveFromLast(0);
                if (DgtOperation.getOperationType(previousOperation) === 'draw' || DgtOperation.getOperationType(previousOperation) === 'annotation') {
                    this.perform(previousOperation, DgtOperation.lastOperationData.params);
                }
                return jsonData;
            }
            if (directive === 'setData') {
                DgtEngine.isReset = true;
                previousValue = DgtEngine.restoreKind;
                DgtEngine.restoreKind = DgtEngine.ACTION_SAVE_RESTORE;
                this.lastSavedState = params;
                jsonData = this.setData(params); /*save-restore object should be in a stringified format*/
                this.lockUserMap = {}; // clearing maps for save Restore.
                this.hideUserMap = {};
                this.grid.updateVisibleDomain();
                DgtEngine.isReset = false;
                this.accManager.setFocus(MathUtilities.Tools.Dgt.Views.DgtAccessibility.TITLE_DIV);
                DgtEngine.restoreKind = previousValue;
                this.grid.refreshView();
            }

            if (directive === 'resetBoard') {

                if (params && params.reason !== 'redo') {
                    DgtEngine.isReset = true;
                    undoData = JSON.stringify(this.getData());
                    DgtEngine.isReset = false;
                    redoData = null;
                    this.execute('resetBoard', {
                        "undo": {
                            "actionType": 'draw',
                            "undoData": undoData
                        },
                        "redo": {
                            "actionType": 'reset',
                            "redoData": redoData
                        }
                    });
                }

                this.grid.restrainViewRefreshByModule('engine.resetBoard');

                this._makeAnchor(null);
                while (this.points.length > 0) {
                    this.points.pop().incinerate();
                }
                while (this.measures.length > 0) {
                    this.measures.pop().incinerate();
                }
                while (this.annotations.length > 0) {
                    this.annotations.pop().incinerate();
                }
                while (this.images.length > 0) {
                    this.images.pop().incinerate();
                }
                while (this.iterations.length > 0) {
                    this.iterations.pop().incinerate();
                }
                while (this.shapes.length > 0) {
                    this.shapes.pop().incinerate();
                }
                while (this.notations.length > 0) {
                    this.notations.pop().incinerate();
                }
                DgtEngine.setDefaultValuesForCounters();
                this.parameterCount = 1;
                this.resetPasteCounter();
                this.grid._restoreDefaultZoom();
                this.resetGridLineProperties();
                this.updatePossibleOperations();
                this.grid.freeViewRefreshByModule('engine.resetBoard');
                this.changeGridPattern('squareGrid', true);
                this.changeGridPattern('noGrid', true);
                this.dgtUI.changeManubarState(this.dgtUI.model.previousMenubarState[0], this.dgtUI.model.previousMenubarState[1]); /*calls perform with selectCursor*/
                if (this.lastSavedState) {
                    DgtEngine.isReset = true;
                    this.setData(this.lastSavedState);
                    DgtEngine.isReset = false;
                }
                this.lockUserMap = {}; // When last state is retrieved objects are locked with current user
                this.hideUserMap = {}; // hence setting to empty object.
                this.updatePossibleOperations();
                this.dgtUI.model.dgtPopUpView.resetTextFields();
                this.dgtUI.model.dgtPopUpView.resetMarkerParams();
                this.grid.updateVisibleDomain();
                this.accManager.setFocus('point-highlighter'); // To set focus to point after reset
                this.dgtUI.setDocumentClean(false);
                return void 0;
            }

            this._enableDisablePointEvents(true);

            this.updatePossibleOperations();

            if (directive === 'resetOperation') {
                this.perform('selectCursor');
                this.dgtUI.selectCursor();
            }

            if (!MathUtilities.Tools.Dgt.Models.DgtOperation.checkPrerequisites(directive, this)) {
                return void 0;
            }

            this._undergoingOperation = new MathUtilities.Tools.Dgt.Models.DgtOperation();
            this._undergoingOperation.setEngine(this);

            this._undergoingOperation.on('finish', this._operationOver)
                .on('aborted', this._operationOver);

            this._undergoingOperation.setEngine(this);

            this._undergoingOperation.initiateOperation(directive, params);
        },
        "resetGridLineProperties": function() {
            var defaultColor = this.defaultProperties['line'].color,
                xAxis = this._standardObjects.Xmirror,
                yAxis = this._standardObjects.Ymirror;
            xAxis.setProperty('color', defaultColor);
            yAxis.setProperty('color', defaultColor);
            xAxis.updateLabelVisibility(false);
            yAxis.updateLabelVisibility(false);

        },
        "unlockAll": function(unlockSelected) {
            var entity, lockedArray = [],
                looper, index;
            if (unlockSelected) {
                for (looper = 0; looper < this.selected.length; looper++) {
                    if (this.selected[looper].properties.locked) {
                        lockedArray.push(this.selected[looper]);
                        if (this.lockUserMap[this.userId]) {
                            index = this.lockUserMap[this.userId].indexOf(this.selected[looper]);
                            if (index > -1) {
                                this.lockUserMap[this.userId].splice(index, 1);
                            }
                        }

                    }
                }
            } else {
                lockedArray = this.isOwner ? this.locked : this.lockUserMap[this.userId];
            }
            this.deselectAll();
            while (lockedArray.length > 0) {
                entity = lockedArray.pop();
                // getting from entity map just to be sure that entity is not incinerated.
                entity = this.getEntityFromId(entity.id);
                entity.setProperty('locked', false);
                if (!this._undergoingOperation || this._undergoingOperation.type !== 'annotation') {
                    this._select(entity);
                }
            }
            _.delay(_.bind(function() {
                this.accessibilityView.hoverEntity(entity);
            }, this), 500);

        },

        "lockSelectedObject": function() {
            var looper, previousOperation,
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation;
            for (looper in this.selected) {
                this.selected[looper].setProperty('locked', true);
                if (!this.lockUserMap[this.userId]) {
                    this.lockUserMap[this.userId] = [];
                }
                this.lockUserMap[this.userId].push(this.selected[looper]);
                if (this.locked.indexOf(this.selected[looper]) === -1) {
                    this.locked.push(this.selected[looper]);
                }
            }
            this.deselectAll();
            previousOperation = this.getDirectiveFromLast(0);
            if (DgtOperation.getOperationType(previousOperation) === 'draw' || DgtOperation.getOperationType(previousOperation) === 'annotation') {
                this.perform(previousOperation, DgtOperation.lastOperationData.params);
            }
        },

        "getVisiblePointsForLine": function(lineConstants) {
            var constantA, constantB, constantC, startX, endX, startY, endY, screenWidthHeight,
                screenBounds, heightOfScreen, widthOfScreen, lineVisiblePoints = [],
                startPoint = this.grid._getCanvasPointCoordinates([lineConstants.x1, lineConstants.y1]),
                endPoint = this.grid._getCanvasPointCoordinates([lineConstants.x2, lineConstants.y2]);

            constantA = startPoint[1] - endPoint[1];
            constantB = endPoint[0] - startPoint[0];
            constantC = -(constantA * endPoint[0] + constantB * endPoint[1]);

            screenBounds = this.grid.getMarkerBounds();
            screenWidthHeight = this.grid._getCanvasPointCoordinates([screenBounds.max.x, screenBounds.min.y]);
            widthOfScreen = screenWidthHeight[0];
            heightOfScreen = screenWidthHeight[1];

            if (constantA !== 0) {
                startX = -constantC / constantA;
                endX = (-constantC - constantB * heightOfScreen) / constantA;
            }
            if (constantB !== 0) {
                startY = -constantC / constantB;
                endY = (-constantC - constantA * widthOfScreen) / constantB;
            }

            if (constantA !== 0 && startX >= 0 && startX <= widthOfScreen) {
                lineVisiblePoints.push([startX, 0]);
            }
            if (constantB !== 0 && startY >= 0 && startY <= heightOfScreen) {
                lineVisiblePoints.push([0, startY]);
            }
            if (constantA !== 0 && endX >= 0 && endX <= widthOfScreen) {
                lineVisiblePoints.push([endX, heightOfScreen]);
            }
            if (constantB !== 0 && endY >= 0 && endY <= heightOfScreen) {
                lineVisiblePoints.push([widthOfScreen, endY]);
            }

            return lineVisiblePoints;
        },

        "compileDataForAnimation": function(directive, sources) {
            var animationType, animationPoints = [],
                selectionPoints, rowIndex, colIndex,
                sourcesPointLength, positionX, positionY, equationPoints,
                equationConstants, lineVisiblePoints,
                DgtMeasurementView = MathUtilities.Tools.Dgt.Views.DgtMeasurement,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                sourcesLength = sources.length,
                equationDataPoints, $measurementView;

            switch (sources[0].species) {
                case 'line':
                    lineVisiblePoints = this.getVisiblePointsForLine(sources[0].equation.getConstants());
                    selectionPoints = [lineVisiblePoints[0][0], lineVisiblePoints[0][1]];
                    animationPoints.push(selectionPoints);

                    selectionPoints = [lineVisiblePoints[1][0], lineVisiblePoints[1][1]];
                    animationPoints.push(selectionPoints);
                    break;
                case 'point':
                    for (rowIndex = 0; rowIndex < sourcesLength; rowIndex++) {
                        equationPoints = sources[rowIndex].equation.getPoints();
                        sourcesPointLength = equationPoints.length;

                        for (colIndex = 0; colIndex < sourcesPointLength; colIndex++) {
                            selectionPoints = equationPoints[colIndex];
                            selectionPoints = this.grid._getCanvasPointCoordinates(selectionPoints);

                            animationPoints.push(selectionPoints);
                        }
                    }
                    break;
                case 'angleMark':
                    equationConstants = DgtEngine.cloneObject(sources[0].equation.getConstants());
                    animationPoints.push(equationConstants);
                    break;
                case 'segment':
                case 'ray':
                    for (rowIndex = 0; rowIndex < sourcesLength; rowIndex++) {
                        equationConstants = sources[rowIndex].equation.getConstants();

                        if (directive !== 'markAngle') {
                            animationPoints.push(this.grid._getCanvasPointCoordinates([equationConstants.x1, equationConstants.y1]), this.grid._getCanvasPointCoordinates([equationConstants.x2, equationConstants.y2]));
                        } else {
                            /*check for segment, ray to sort points properly if they have common point*/
                            animationPoints = DgtEngine.getPointsToFindAngle(sources[0].equation.getConstants(), sources[1].equation.getConstants());
                            animationPoints[0] = this.grid._getCanvasPointCoordinates([animationPoints[0].x, animationPoints[0].y]);
                            animationPoints[1] = this.grid._getCanvasPointCoordinates([animationPoints[1].x, animationPoints[1].y]);
                            animationPoints[2] = this.grid._getCanvasPointCoordinates([animationPoints[2].x, animationPoints[2].y]);
                        }
                    }
                    break;
                default: //for measurement
                    equationDataPoints = sources[0].equation.getPoints();
                    $measurementView = sources[0].$measureView;
                    positionX = equationDataPoints[0][1] + DgtMeasurementView.bannerPositionOffset.left;
                    positionY = equationDataPoints[0][0] + DgtMeasurementView.bannerPositionOffset.top;
                    selectionPoints = [positionX, positionY];
                    animationPoints.push(selectionPoints);
                    positionX = equationDataPoints[0][1] + $measurementView.width() + DgtMeasurementView.bannerPositionOffset.right;
                    positionY = equationDataPoints[0][0] + $measurementView.height() + DgtMeasurementView.bannerPositionOffset.top;
                    selectionPoints = [positionX, positionY];
                    animationPoints.push(selectionPoints);
                    break;
            }

            switch (directive) {
                case 'markCenter':
                    animationType = 'markCenter';
                    break;
                case 'markMirror':
                    animationType = 'markMirror';
                    break;
                case 'markAngle':
                    if (['point', 'segment', 'ray', 'angleMark'].indexOf(sources[0].species) > -1) {
                        animationType = 'markAngle';
                    } else {
                        animationType = 'markMeasurement';
                    }
                    break;
                case 'markRatio':
                    if (sources[0].species === 'segment') {
                        animationType = 'markSegmentRatio';
                    } else {
                        animationType = 'markMeasurement';
                    }
                    break;
                case 'markVector':
                    animationType = 'markVector';
                    break;
                case 'markDistance':
                    animationType = 'markMeasurement';
                    break;
            }
            this.dgtUI.model.animationView.animation(animationPoints, animationType);
        },

        "showHideObjects": function(directive) {
            var object,
                undoRedoData = [],
                previousOperation, hideArrray,
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                i = 0;
            if (directive === 'showAllHidden') {
                hideArrray = this.isOwner ? this.hiddenObjects : this.hideUserMap[this.userId];
                while (hideArrray.length !== 0) {
                    object = hideArrray.pop();
                    object = this.getEntityFromId(object.id);
                    object.changeObjectVisibility(true, object.USER);
                    undoRedoData.push(object.id);
                }
                this.getLockedSystem();
                _.delay(_.bind(function() {
                    this.accessibilityView.hoverEntity(object);
                }, this), 500);

                this.execute('showHideObjects', {
                    "undo": {
                        "actionType": 'hide',
                        "undoData": undoRedoData
                    },
                    "redo": {
                        "actionType": 'show',
                        "redoData": undoRedoData
                    }
                });
            }
            if (directive === 'hideObjects') {
                while (this.selected.length > 0) {
                    object = this.selected[i];
                    //in order to deselect the item we call select from here
                    this._select(object, null, null, true);
                    object.changeObjectVisibility(false, object.USER);
                    undoRedoData.push(object.id);
                }

                this.execute('showHideObjects', {
                    "undo": {
                        "actionType": 'show',
                        "undoData": undoRedoData
                    },
                    "redo": {
                        "actionType": 'hide',
                        "redoData": undoRedoData
                    }
                });
            }
            previousOperation = this.getDirectiveFromLast(0);
            if (['draw', 'annotation'].indexOf(DgtOperation.getOperationType(previousOperation)) > -1) {
                this.perform(previousOperation, DgtOperation.lastOperationData.params);
                this.accManager.setFocus('canvas-event-listener');
            }
            this.updatePossibleOperations();
        },

        "showHideLabels": function(visibility) {
            var drawable,
                previousOperation,
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation;
            if (this.checkLabelVisibility() || typeof visibility !== 'undefined' && visibility === true) {

                for (drawable in this.selected) {
                    if (this.selected[drawable].properties.binaryInvisibility === 0) {
                        this.selected[drawable].updateLabelText(this.selected[drawable].properties.labelText, false, true);
                        if (this.selected[drawable].updateLabelVisibility) {
                            this.selected[drawable].updateLabelVisibility(true);
                        }
                    }
                }
                this.dgtUI.changeLabelShowHideText(false);

            } else {
                for (drawable in this.selected) {
                    if (this.selected[drawable].updateLabelVisibility) {
                        this.selected[drawable].updateLabelVisibility(false);
                    }
                }
                this.dgtUI.changeLabelShowHideText(true);
            }
            if (typeof visibility !== 'undefined' && visibility === false) {
                for (drawable in this.selected) {
                    if (this.selected[drawable].updateLabelVisibility) {
                        this.selected[drawable].updateLabelVisibility(false);
                    }
                }
                this.dgtUI.changeLabelShowHideText(true);
            }
            previousOperation = this.getDirectiveFromLast(0);
            if (['draw', 'annotation'].indexOf(DgtOperation.getOperationType(previousOperation)) > -1) {
                this.perform(previousOperation, DgtOperation.lastOperationData.params);
                this.accManager.setFocus('canvas-event-listener');
            }
        },

        "updateDirectiveStack": function(directive) {
            this._directiveStack.push(directive);
            if (this._directiveStack.length > 3) {
                this._directiveStack.shift();
            }
        },

        "getDirectiveFromLast": function(index) {
            if (this._directiveStack.length > index) {
                return this._directiveStack[this._directiveStack.length - index - 1];
            }
        },

        "scheduleMovingPointCreation": function() {
            if (this.newPointTimer) {
                clearInterval(this.newPointTimer);
            }
            this.newPointTimer = setInterval(_.bind(function() {
                this.createMovingPoint();
                this.trigger('scheduledPointCreated');
                clearInterval(this.newPointTimer);
            }, this), 50);
        },

        "unscheduleMovingPointCreation": function() {
            clearInterval(this.newPointTimer);
        },

        "getIndexOfUpdatingEntity": function(entity, possibleUpdatingEntities) {
            var loopCtr, possibleUpdatingEntitiesLength = possibleUpdatingEntities.length,
                index = -1;
            for (loopCtr = 0; loopCtr < possibleUpdatingEntitiesLength; loopCtr++) {
                if (entity === possibleUpdatingEntities[loopCtr].entity) {
                    index = loopCtr;
                    break;
                }
            }
            return index;
        },

        "_operationOver": null,

        "findPointPosition": function(paramsForCalculation) {
            var newCoordinate = [],
                angle, sources = [],
                params, DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                i, reverseParam, isOnShape, j,
                diagonalDistance, offset, sideOfSquare, tempPoint,
                isDegree = true,
                iteration,
                lengthOfRectangle, breadthOfRectangle,
                circumcenterOfPentagon, radiusOfCircumcircle,
                circumcenterOfHexagon, radiusOfHexagon,
                breadthOfParallelogram, lengthOfParallelogram,
                relation = paramsForCalculation.relation,
                target = paramsForCalculation.target,
                anchorData = paramsForCalculation.anchorData,
                parentData = paramsForCalculation.parentData,
                offSpringCoordinate = paramsForCalculation.offSpringCoordinate;
            /*
             *brainstorm: formula function and alternative inputs
             */
            params = relation.getParamValues();
            if (params && typeof params.angle === 'number') {
                angle = params.angle * Math.PI / 180;
            }

            if (target === 'offspring' || target === 'anchor') {
                switch (relation.species) {

                    case 'pointOnObject':
                        newCoordinate = DgtEngine.getRandomPointOnObject(relation.getSource(0), relation);
                        break;
                    case 'rotate':
                        newCoordinate = geomFunctions.rotatePoint(parentData[0][0], parentData[0][1], anchorData[0], anchorData[1], angle);
                        break;
                    case 'translate':
                        newCoordinate = geomFunctions.translatePoint(parentData[0][0], parentData[0][1], params);
                        break;
                    case 'dilate':
                        newCoordinate = geomFunctions.dilatePoint(parentData[0][0], parentData[0][1], anchorData[0], anchorData[1], params);
                        break;
                    case 'intersection':
                        sources.push(relation.getSource(0), relation.getSource(1));
                        newCoordinate = this.getIntersectionPoint(parentData, relation.getCreationMethod());

                        if (newCoordinate) {
                            for (i = 0; i < sources.length; i++) {
                                if (['arc', 'segment', 'ray'].indexOf(sources[i].species) > -1) {
                                    for (j = 0; j < newCoordinate.length; j++) {
                                        isOnShape = DgtEngine.isOnShape(parentData[i], sources[i].species, newCoordinate[j]);
                                        if (isOnShape === false) {
                                            newCoordinate[j] = [NaN, NaN];
                                        }
                                    }
                                }
                            }
                        }
                        if (newCoordinate) {
                            newCoordinate = newCoordinate[relation.getParams().index];
                        }
                        break;
                    case 'midpoint':
                        newCoordinate[0] = (parentData[0].x2 + parentData[0].x1) / 2;
                        newCoordinate[1] = (parentData[0].y2 + parentData[0].y1) / 2;
                        break;
                    case 'reflect':
                        newCoordinate = geomFunctions.reflectPointAroundLine(parentData[0][0], parentData[0][1], anchorData.a, anchorData.b, anchorData.c);
                        break;
                    case 'isoscelesTriangle':
                        angle = -30;
                        tempPoint = geomFunctions.rotatePoint(parentData[0][0], parentData[0][1], anchorData[0], anchorData[1], angle, isDegree, false);
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                    case 'equilateralTriangle':
                        angle = -60;
                        tempPoint = geomFunctions.rotatePoint(parentData[0][0], parentData[0][1], anchorData[0], anchorData[1], angle, isDegree, false);
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                    case 'square':
                        angle = 45;
                        diagonalDistance = geomFunctions.distance2(anchorData[0], anchorData[1], parentData[0][0], parentData[0][1]);
                        if (diagonalDistance === 0) {
                            tempPoint = parentData[0];
                        } else {
                            sideOfSquare = diagonalDistance / Math.sqrt(2);
                            offset = sideOfSquare / diagonalDistance;
                            if (params.index === 0) {
                                tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], parentData[0][0], parentData[0][1], angle, isDegree, false);
                                tempPoint = geomFunctions.getPointPositionFromOffset(parentData[0][0], parentData[0][1], tempPoint[0], tempPoint[1], offset);
                            } else {
                                tempPoint = geomFunctions.rotatePoint(parentData[0][0], parentData[0][1], anchorData[0], anchorData[1], angle, isDegree, false);
                                tempPoint = geomFunctions.getPointPositionFromOffset(anchorData[0], anchorData[1], tempPoint[0], tempPoint[1], offset);
                            }
                        }
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                    case 'rectangle':
                        isDegree = false;
                        diagonalDistance = geomFunctions.distance2(anchorData[0], anchorData[1], parentData[0][0], parentData[0][1]);
                        if (diagonalDistance === 0) {
                            tempPoint = parentData[0];
                        } else {
                            breadthOfRectangle = diagonalDistance / Math.sqrt(5);
                            lengthOfRectangle = 2 * breadthOfRectangle;
                            angle = Math.asin(breadthOfRectangle / diagonalDistance);
                            offset = lengthOfRectangle / diagonalDistance;
                            if (params.index === 0) {
                                tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], parentData[0][0], parentData[0][1], angle, isDegree, false);
                                tempPoint = geomFunctions.getPointPositionFromOffset(parentData[0][0], parentData[0][1], tempPoint[0], tempPoint[1], offset);
                            } else {
                                tempPoint = geomFunctions.rotatePoint(parentData[0][0], parentData[0][1], anchorData[0], anchorData[1], angle, isDegree, false);
                                tempPoint = geomFunctions.getPointPositionFromOffset(anchorData[0], anchorData[1], tempPoint[0], tempPoint[1], offset);
                            }
                        }
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                    case 'parallelogram':
                        diagonalDistance = geomFunctions.distance2(anchorData[0], anchorData[1], parentData[0][0], parentData[0][1]);
                        if (diagonalDistance === 0) {
                            tempPoint = parentData[0];
                        } else {
                            breadthOfParallelogram = diagonalDistance / Math.sqrt(3);
                            lengthOfParallelogram = 2 * breadthOfParallelogram;
                            offset = lengthOfParallelogram / diagonalDistance;
                            angle = 30;
                            if (params.index === 0) {
                                tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], parentData[0][0], parentData[0][1], angle, isDegree, false);
                                tempPoint = geomFunctions.getPointPositionFromOffset(parentData[0][0], parentData[0][1], tempPoint[0], tempPoint[1], offset);
                            } else {
                                tempPoint = geomFunctions.rotatePoint(parentData[0][0], parentData[0][1], anchorData[0], anchorData[1], angle, isDegree, false);
                                tempPoint = geomFunctions.getPointPositionFromOffset(anchorData[0], anchorData[1], tempPoint[0], tempPoint[1], offset);
                            }
                        }
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                    case 'pentagon':
                        angle = 18;
                        diagonalDistance = geomFunctions.distance2(anchorData[0], anchorData[1], parentData[0][0], parentData[0][1]);
                        if (diagonalDistance === 0) {
                            tempPoint = parentData[0];
                        } else {
                            radiusOfCircumcircle = diagonalDistance / (2 * Math.cos(angle * Math.PI / 180));
                            tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], parentData[0][0], parentData[0][1], angle, isDegree, false);
                            offset = radiusOfCircumcircle / diagonalDistance;
                            circumcenterOfPentagon = geomFunctions.getPointPositionFromOffset(parentData[0][0], parentData[0][1], tempPoint[0], tempPoint[1], offset);
                            if (params.index === 0) {
                                angle = 72;
                            } else if (params.index === 1) {
                                angle = 288;
                            } else {
                                angle = 216;
                            }
                            tempPoint = geomFunctions.rotatePoint(parentData[0][0], parentData[0][1], circumcenterOfPentagon[0], circumcenterOfPentagon[1], angle, isDegree, false);
                        }
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                    case 'hexagon':
                        angle = 60;
                        circumcenterOfHexagon = geomFunctions.midPoint2(anchorData[0], anchorData[1], parentData[0][0], parentData[0][1]);
                        if (params.index === 0) {
                            tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], circumcenterOfHexagon[0], circumcenterOfHexagon[1], -angle, isDegree, false);
                        } else if (params.index === 1) {
                            tempPoint = geomFunctions.rotatePoint(parentData[0][0], parentData[0][1], circumcenterOfHexagon[0], circumcenterOfHexagon[1], angle, isDegree, false);
                        } else if (params.index === 2) {
                            tempPoint = geomFunctions.rotatePoint(parentData[0][0], parentData[0][1], circumcenterOfHexagon[0], circumcenterOfHexagon[1], -angle, isDegree, false);
                        } else if (params.index === 3) {
                            tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], circumcenterOfHexagon[0], circumcenterOfHexagon[1], angle, isDegree, false);
                        }
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                    case "terminalPoint":
                        iteration = relation.sources[0];
                        tempPoint = iteration.getTerminalPointForPreImage(params.originalEntityId);
                        if (tempPoint) {
                            newCoordinate = tempPoint.equation.getPoints()[0];
                        }
                        break;
                }
            } else {

                switch (relation.species) {
                    case 'rotate':
                        //target is source
                        newCoordinate = geomFunctions.rotatePoint(offSpringCoordinate[0], offSpringCoordinate[1], anchorData[0], anchorData[1], -angle);
                        break;
                    case 'translate':
                        reverseParam = {
                            "dx": -params.dx,
                            "dy": -params.dy,
                            "r": -params.r,
                            "angle": -params.angle,
                            "coordinateSystem": params.coordinateSystem
                        };
                        newCoordinate[0] = offSpringCoordinate[0] - relation.getParamValues().dx;
                        newCoordinate[1] = offSpringCoordinate[1] - relation.getParamValues().dy;

                        newCoordinate = geomFunctions.translatePoint(offSpringCoordinate[0], offSpringCoordinate[1], reverseParam);
                        break;
                    case 'dilate':
                        reverseParam = {
                            "ratio": 1 / params.ratio
                        };
                        newCoordinate = geomFunctions.dilatePoint(offSpringCoordinate[0], offSpringCoordinate[1], anchorData[0], anchorData[1], reverseParam);
                        break;
                    case 'reflect':
                        newCoordinate = geomFunctions.reflectPointAroundLine(offSpringCoordinate[0], offSpringCoordinate[1], anchorData.a, anchorData.b, anchorData.c);
                        break;
                    case 'isoscelesTriangle':
                        angle = 30;
                        tempPoint = geomFunctions.rotatePoint(offSpringCoordinate[0], offSpringCoordinate[1], anchorData[0], anchorData[1], angle, isDegree, false);
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                    case 'equilateralTriangle':
                        angle = 60;
                        tempPoint = geomFunctions.rotatePoint(offSpringCoordinate[0], offSpringCoordinate[1], anchorData[0], anchorData[1], angle, isDegree, false);
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                    case 'square':
                        angle = 45;
                        sideOfSquare = geomFunctions.distance2(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1]);
                        diagonalDistance = Math.sqrt(2) * sideOfSquare;
                        offset = diagonalDistance / sideOfSquare;
                        if (params.index === 0) {
                            tempPoint = geomFunctions.rotatePoint(offSpringCoordinate[0], offSpringCoordinate[1], anchorData[0], anchorData[1], angle, isDegree, false);
                            tempPoint = geomFunctions.getPointPositionFromOffset(anchorData[0], anchorData[1], tempPoint[0], tempPoint[1], offset);
                        } else {
                            tempPoint = geomFunctions.rotatePoint(offSpringCoordinate[0], offSpringCoordinate[1], anchorData[0], anchorData[1], -angle, isDegree, false);
                            tempPoint = geomFunctions.getPointPositionFromOffset(anchorData[0], anchorData[1], tempPoint[0], tempPoint[1], offset);
                        }
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                    case 'rectangle':
                        angle = 90;
                        if (params.index === 0) {
                            breadthOfRectangle = geomFunctions.distance2(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1]);
                            lengthOfRectangle = 2 * breadthOfRectangle;
                            offset = lengthOfRectangle / breadthOfRectangle;
                            tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1], -angle, isDegree, false);
                        } else {
                            lengthOfRectangle = geomFunctions.distance2(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1]);
                            breadthOfRectangle = lengthOfRectangle / 2;
                            offset = breadthOfRectangle / lengthOfRectangle;
                            tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1], angle, isDegree, false);
                        }
                        tempPoint = geomFunctions.getPointPositionFromOffset(offSpringCoordinate[0], offSpringCoordinate[1], tempPoint[0], tempPoint[1], offset);
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                    case 'parallelogram':
                        angle = 60;
                        if (params.index === 0) {
                            breadthOfParallelogram = geomFunctions.distance2(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1]);
                            lengthOfParallelogram = 2 * breadthOfParallelogram;
                            tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1], -angle, isDegree, false);
                            offset = lengthOfParallelogram / breadthOfParallelogram;
                        } else {
                            lengthOfParallelogram = geomFunctions.distance2(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1]);
                            breadthOfParallelogram = lengthOfParallelogram / 2;
                            tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1], angle, isDegree, false);
                            offset = breadthOfParallelogram / lengthOfParallelogram;
                        }
                        tempPoint = geomFunctions.getPointPositionFromOffset(offSpringCoordinate[0], offSpringCoordinate[1], tempPoint[0], tempPoint[1], offset);
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                    case 'pentagon':
                        if (params.index === 0) {
                            angle = 108;
                            tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1], angle, isDegree, false);
                        } else if (params.index === 1) {
                            angle = 36;
                            tempPoint = geomFunctions.rotatePoint(offSpringCoordinate[0], offSpringCoordinate[1], anchorData[0], anchorData[1], angle, isDegree, false);
                        } else {
                            angle = 108;
                            tempPoint = geomFunctions.rotatePoint(offSpringCoordinate[0], offSpringCoordinate[1], anchorData[0], anchorData[1], angle, isDegree, false);
                            tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], tempPoint[0], tempPoint[1], angle, isDegree, false);
                        }
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                    case 'hexagon':
                        circumcenterOfHexagon = geomFunctions.midPoint2(anchorData[0], anchorData[1], parentData[0][0], parentData[0][1]);
                        if (params.index === 0) {
                            angle = 120;
                            tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1], angle, isDegree, false);
                            tempPoint = geomFunctions.rotatePoint(offSpringCoordinate[0], offSpringCoordinate[1], tempPoint[0], tempPoint[1], angle, isDegree, false);
                        } else if (params.index === 1) {
                            angle = 30;
                            diagonalDistance = geomFunctions.distance2(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1]);
                            radiusOfHexagon = diagonalDistance / (2 * Math.cos(angle * Math.PI / 180));
                            tempPoint = geomFunctions.rotatePoint(offSpringCoordinate[0], offSpringCoordinate[1], anchorData[0], anchorData[1], -angle, isDegree, false);
                            offset = 2 * radiusOfHexagon / diagonalDistance;
                            tempPoint = geomFunctions.getPointPositionFromOffset(anchorData[0], anchorData[1], tempPoint[0], tempPoint[1], offset);
                        } else if (params.index === 2) {
                            angle = 30;
                            diagonalDistance = geomFunctions.distance2(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1]);
                            radiusOfHexagon = diagonalDistance / (2 * Math.cos(angle * Math.PI / 180));
                            tempPoint = geomFunctions.rotatePoint(offSpringCoordinate[0], offSpringCoordinate[1], anchorData[0], anchorData[1], angle, isDegree, false);
                            offset = 2 * radiusOfHexagon / diagonalDistance;
                            tempPoint = geomFunctions.getPointPositionFromOffset(anchorData[0], anchorData[1], tempPoint[0], tempPoint[1], offset);
                        } else if (params.index === 3) {
                            angle = -120;
                            tempPoint = geomFunctions.rotatePoint(anchorData[0], anchorData[1], offSpringCoordinate[0], offSpringCoordinate[1], angle, isDegree, false);
                            tempPoint = geomFunctions.rotatePoint(offSpringCoordinate[0], offSpringCoordinate[1], tempPoint[0], tempPoint[1], angle, isDegree, false);
                        }
                        newCoordinate[0] = tempPoint[0];
                        newCoordinate[1] = tempPoint[1];
                        break;
                }
            }
            return newCoordinate;
        },

        "calculatePointPosition": function(relation, shocker, newPosition) {

            var parentData = [],
                anchorData, i,
                sourceCount = relation.getSourceCount(),
                target, offSpringCoordinate, paramsForCalculation = {},
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;

            if (relation.anchor) {
                anchorData = DgtEngine.getDataOfEntity(relation.anchor, shocker, newPosition);
            }

            for (i = 0; i < sourceCount; i++) {
                parentData[i] = DgtEngine.getDataOfEntity(relation.getSource(i), shocker, newPosition);
            }
            /*
             *brainstorm: formula function and alternative inputs
             */
            if (!shocker || shocker === relation.anchor || relation.sources.indexOf(shocker) > -1 || relation.isMentor(shocker)) {
                target = 'offspring';
            } else {
                target = 'source';
            }

            if (target === 'source') {
                offSpringCoordinate = DgtEngine.getDataOfEntity(relation.offspring, shocker, newPosition);
            }

            paramsForCalculation.relation = relation;
            paramsForCalculation.target = target;
            paramsForCalculation.anchorData = anchorData;
            paramsForCalculation.parentData = parentData;
            paramsForCalculation.offSpringCoordinate = offSpringCoordinate;

            return this.findPointPosition(paramsForCalculation);
        },

        "getAnchorSourcePoint": function(relationType, centerPoint) {
            var anchor = [],
                source = [],
                circumcircleRadius, tempPoint, angle, isDegree = true,
                sourcesLength, loopCtr, radiusOfCircle,
                sideOfSquare, diagonalDistance, breadthOfRectangle,
                breadthOfParallelogram,
                smallerDiagonalOfParallelogram,
                sideOfPentagon, radiusOfCircumcircle,
                sideOfHexagon, anchorSourceObject,
                focalDistance, majorRadius;

            switch (relationType) {
                case 'isoscelesTriangle':
                    circumcircleRadius = 2;
                    angle = -150;
                    anchor[0] = centerPoint[0];
                    anchor[1] = centerPoint[1] + circumcircleRadius;
                    tempPoint = geomFunctions.rotatePoint(anchor[0], anchor[1], centerPoint[0], centerPoint[1], angle, isDegree, false);
                    source[0] = tempPoint[0];
                    source[1] = tempPoint[1];
                    break;
                case 'equilateralTriangle':
                    circumcircleRadius = 2;
                    angle = -120;
                    anchor[0] = centerPoint[0];
                    anchor[1] = centerPoint[1] + circumcircleRadius;
                    tempPoint = geomFunctions.rotatePoint(anchor[0], anchor[1], centerPoint[0], centerPoint[1], angle, isDegree, false);
                    source[0] = tempPoint[0];
                    source[1] = tempPoint[1];
                    break;
                case 'square':
                    sideOfSquare = 3;
                    angle = 45;
                    diagonalDistance = sideOfSquare / Math.sqrt(2);
                    tempPoint = [centerPoint[0], centerPoint[1] + diagonalDistance];
                    tempPoint = geomFunctions.rotatePoint(tempPoint[0], tempPoint[1], centerPoint[0], centerPoint[1], angle, isDegree, false);
                    anchor[0] = tempPoint[0];
                    anchor[1] = tempPoint[1];
                    angle = -180;
                    tempPoint = geomFunctions.rotatePoint(anchor[0], anchor[1], centerPoint[0], centerPoint[1], angle, isDegree, false);
                    source[0] = tempPoint[0];
                    source[1] = tempPoint[1];
                    break;
                case 'rectangle':
                    breadthOfRectangle = 2;
                    isDegree = false;
                    angle = Math.atan(2);
                    diagonalDistance = Math.sqrt(5) * breadthOfRectangle / 2;
                    tempPoint = [centerPoint[0], centerPoint[1] + diagonalDistance];
                    tempPoint = geomFunctions.rotatePoint(tempPoint[0], tempPoint[1], centerPoint[0], centerPoint[1], angle, isDegree, false);
                    anchor[0] = tempPoint[0];
                    anchor[1] = tempPoint[1];
                    angle = -180 * Math.PI / 180;
                    tempPoint = geomFunctions.rotatePoint(anchor[0], anchor[1], centerPoint[0], centerPoint[1], angle, isDegree, false);
                    source[0] = tempPoint[0];
                    source[1] = tempPoint[1];
                    break;
                case 'parallelogram':
                    breadthOfParallelogram = 2;
                    smallerDiagonalOfParallelogram = Math.sqrt(3) * breadthOfParallelogram;

                    tempPoint = [centerPoint[0], centerPoint[1] + smallerDiagonalOfParallelogram / 2];
                    angle = 60;
                    tempPoint = geomFunctions.rotatePoint(tempPoint[0], tempPoint[1], centerPoint[0], centerPoint[1], angle, isDegree, false);
                    anchor[0] = tempPoint[0];
                    anchor[1] = tempPoint[1];
                    angle = -180;
                    tempPoint = geomFunctions.rotatePoint(anchor[0], anchor[1], centerPoint[0], centerPoint[1], angle, isDegree, false);
                    source[0] = tempPoint[0];
                    source[1] = tempPoint[1];
                    break;
                case 'pentagon':
                    sideOfPentagon = 3;
                    angle = 36 * Math.PI / 180;
                    radiusOfCircumcircle = sideOfPentagon / (2 * Math.sin(angle));
                    anchor[0] = centerPoint[0];
                    anchor[1] = centerPoint[1] + radiusOfCircumcircle;
                    angle = -144;
                    tempPoint = geomFunctions.rotatePoint(anchor[0], anchor[1], centerPoint[0], centerPoint[1], angle, isDegree, false);
                    source[0] = tempPoint[0];
                    source[1] = tempPoint[1];
                    break;
                case 'hexagon':
                    sideOfHexagon = 2;
                    tempPoint = [centerPoint[0], centerPoint[1] + sideOfHexagon];
                    angle = 30;
                    tempPoint = geomFunctions.rotatePoint(tempPoint[0], tempPoint[1], centerPoint[0], centerPoint[1], angle, isDegree, false);
                    anchor[0] = tempPoint[0];
                    anchor[1] = tempPoint[1];
                    angle = -180;
                    tempPoint = geomFunctions.rotatePoint(anchor[0], anchor[1], centerPoint[0], centerPoint[1], angle, isDegree, false);
                    source[0] = tempPoint[0];
                    source[1] = tempPoint[1];
                    break;
                case 'circleWithPoints':
                    radiusOfCircle = 2;
                    source[0] = centerPoint[0];
                    source[1] = centerPoint[1];
                    source[2] = centerPoint[0];
                    source[3] = centerPoint[1] + radiusOfCircle;
                    break;
                case 'parabola':
                    focalDistance = 1;
                    source[0] = centerPoint[0];
                    source[1] = centerPoint[1];
                    source[2] = centerPoint[0];
                    source[3] = centerPoint[1] + focalDistance;
                    break;
                case 'hyperbola':
                    majorRadius = 2;
                    source[0] = centerPoint[0];
                    source[1] = centerPoint[1];
                    source[2] = centerPoint[0] + majorRadius;
                    source[3] = centerPoint[1];
                    this._undergoingOperation.parameters.isDoubleClickMode = true;
                    break;
                case 'ellipse':
                    majorRadius = 2;
                    source[0] = centerPoint[0];
                    source[1] = centerPoint[1];
                    source[2] = centerPoint[0] + majorRadius;
                    source[3] = centerPoint[1];
                    this._undergoingOperation.parameters.isDoubleClickMode = true;
                    break;
            }
            if (['parabola', 'ellipse', 'hyperbola', 'circleWithPoints'].indexOf(relationType) > -1) {
                anchorSourceObject = {
                    "source": []
                };
                sourcesLength = source.length;
                for (loopCtr = 0; loopCtr < sourcesLength; loopCtr += 2) {
                    anchorSourceObject.source.push([source[loopCtr], source[loopCtr + 1]]);
                }
            } else {
                anchorSourceObject = {
                    "anchor": [anchor[0], anchor[1]],
                    "source": [source[0], source[1]]
                };
            }
            return anchorSourceObject;
        },

        "getPointCoordinate": function(point) {

            var equationPointsGroup = point.equation.getPointsGroup(),
                canvasPosition, gridPosition;

            if (!equationPointsGroup) {
                return void 0;
            }
            canvasPosition = [equationPointsGroup.position.x, equationPointsGroup.position.y];
            gridPosition = this.grid._getGraphPointCoordinates(canvasPosition);
            return gridPosition;
        },

        "calculateOffspringAptitude": function(source, anchor) {
            source = null;
            anchor = null;
            return 'f';

        },

        "changeHitColor": function(entity, isHit) {
            if (entity.properties.binaryInvisibility !== 0) {
                return;
            }
            if (isHit) {
                if (entity.division === 'interior') {
                    entity.getPath().strokeColor = '#ff980d';
                    entity.getPath().strokeColor.alpha = 1;
                } else {
                    this._updateDrawableColor(entity, '#ff980d');
                }
            } else {
                if (entity.division === 'interior') {
                    if (entity.getPath()) {
                        entity.getPath().strokeColor = null;
                    }
                } else {
                    if (this.selected.indexOf(entity) > -1) {
                        this._updateDrawableColor(entity, '#01cc01');
                    } else {
                        this._updateDrawableColor(entity);
                    }
                }
            }
        },

        "setParametersForStatusMessage": function(hitShapes, operation) {
            var param;

            if (operation.directive === 'drawPoint') {
                if (hitShapes.length === 1) {
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('point', 'shape', hitShapes[0].species);
                } else if (hitShapes.length === 0) {
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('point', 'grid');
                } else {
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('point', 'intersection');
                }
            } else if (operation.type === 'annotation') {
                if (hitShapes.length > 0) {
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('annotation', 'shape');
                } else {
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('annotation', 'grid');
                }
            } else {
                if (operation.agents.length === 1) {
                    param = 'from';
                } else if (operation._unsettledRelationships[0] && operation._unsettledRelationships[0].isMature()) {
                    param = 'to';
                } else {
                    param = 'via';
                }
                if (hitShapes.length === 1) {
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('shape', 'shape', param, hitShapes[0].species);
                } else if (hitShapes.length === 0) {
                    if (this._undergoingOperation.directive === 'drawPolygon') {
                        MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('shape', 'grid', 'polygon');
                    } else {
                        MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('shape', 'grid', this._undergoingOperation.operationRelationType);
                    }

                } else {
                    MathUtilities.Tools.Dgt.Models.DgtStatusMessage.getStatusString('shape', 'intersection', param);
                }
            }
        },

        "getIntersectionPoint": function(data, CreationMethod) {
            var det, pointToDisplay,
                newCoordinate = [
                    [],
                    []
                ],
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                parentData, lineSeeds, i, minDistance, isEndPoint, calDistance,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                linePoint, chkOnInterior, chkOnLine, intersectionPoint;
            switch (CreationMethod) {
                case 'lineIntersection':
                    det = data[1].a * data[0].b - data[1].b * data[0].a;
                    newCoordinate[0][0] = (-data[1].c * data[0].b + data[1].b * data[0].c) / det;
                    newCoordinate[0][1] = (-data[0].c * data[1].a + data[1].c * data[0].a) / det;
                    break;
                case 'circleIntersection':
                    newCoordinate = geomFunctions.intersectionOfCircles(data[0].a, data[0].b, data[1].a, data[1].b, data[0].r, data[1].r);
                    break;
                case 'lineCircleIntersection':
                    newCoordinate = geomFunctions.intersectionOfLineAndCircle(data[1].a, data[1].b, data[1].r, data[0].a, data[0].b, data[0].c);
                    break;
                case 'lineInteriorIntersection':
                    minDistance = 1000;
                    isEndPoint = false;
                    for (i = 0;; i++) {
                        if (typeof data[1]['x' + (i + 1)] !== 'number') {
                            parentData = [
                                [data[1]['x' + i], data[1]['y' + i]],
                                [data[1].x0, data[1].y0]
                            ];
                            isEndPoint = true;
                        } else {
                            parentData = [
                                [data[1]['x' + i], data[1]['y' + i]],
                                [data[1]['x' + (i + 1)], data[1]['y' + (i + 1)]]
                            ];
                        }
                        lineSeeds = DgtShape.getLineSeed(parentData);
                        linePoint = [data[0], lineSeeds];
                        intersectionPoint = this.getIntersectionPoint(linePoint, 'lineIntersection');
                        if (intersectionPoint[0].length > 1) {
                            chkOnInterior = DgtEngine.isOnShape(lineSeeds, 'segment', intersectionPoint[0]);
                            chkOnLine = DgtEngine.isOnShape(data[0], 'ray', intersectionPoint[0]);
                        }
                        if (chkOnInterior === true && chkOnLine === true) {
                            calDistance = geomFunctions.distance2(data[0].x1, data[0].y1, intersectionPoint[0][0], intersectionPoint[0][1]);
                            if (calDistance < minDistance) {
                                minDistance = calDistance;
                                pointToDisplay = intersectionPoint[0];
                            }
                        }
                        if (isEndPoint === true) {
                            break;
                        }
                    }
                    if (pointToDisplay) {
                        newCoordinate[0] = pointToDisplay;
                    }
                    break;
            }

            if (newCoordinate && newCoordinate[1] && newCoordinate[1].length === 0) {
                newCoordinate.splice(1, 1);
            }
            if (!newCoordinate || newCoordinate.length === 0) {
                newCoordinate = [
                    [NaN, NaN],
                    [NaN, NaN]
                ];
            }
            return newCoordinate;
        },

        "getOperationMode": function() {
            return this._operationMode;
        },

        "setOperationMode": function(directive) {
            var drawingMode = 'drawing',
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation;

            if (DgtOperation.lastOperationData) {
                this._allowDoubleClickByModule(DgtOperation.lastOperationData.directive);
            }

            switch (directive) {
                case 'drawPoint':
                    this._operationMode = 'drawPoint';
                    this._preventDoubleClickByModule('drawPoint');
                    this.grid.setGridMode(drawingMode);
                    break;
                case 'drawLine':
                case 'drawSegment':
                case 'drawRay':
                    this._operationMode = 'drawPredefinedShape';
                    this._preventDoubleClickByModule(directive);
                    this.grid.setGridMode(drawingMode);
                    break;
                case 'drawCircleWithPoints':
                case 'drawEllipse':
                case 'drawHyperbola':
                case 'drawParabola':
                case 'drawIsoscelesTriangle':
                case 'drawEquilateralTriangle':
                case 'drawRectangle':
                case 'drawSquare':
                case 'drawParallelogram':
                case 'drawPentagon':
                case 'drawHexagon':
                    this._operationMode = 'drawPredefinedShape';
                    this.grid.setGridMode(drawingMode);
                    break;
                case 'drawPolygon':
                    this._operationMode = 'drawPolygon';
                    this._preventDoubleClickByModule('drawPolygon');
                    this.grid.setGridMode(drawingMode);
                    break;
                case 'selectCursor':
                    this._operationMode = 'select';
                    this.grid.setGridMode('Graph');
                    this.grid.enableInputMode(this.grid.INPUT_MODE_DOUBLE_CLICK, true);
                    this.grid.enableInputMode(this.grid.INPUT_MODE_FIRST_CLICK, true);
                    break;
                case 'penAnnotation':
                case 'pencilAnnotation':
                    this._operationMode = 'nonGeometricDrawing';
                    this.grid.setGridMode('annotation-mode');
                    break;
                case 'addImage':
                case 'addText':
                case 'resetBoard':
                    this._operationMode = 'nonGeometricDrawing';
                    this.grid.setGridMode('Graph');
                    break;
                default:
                    //previous mode..
                    break;
            }
        },

        "getData": function() {
            var engineJson = {
                    "menubar": {},
                    "engine": {
                        "grid": {},
                        "drawing": {
                            "shapes": [],
                            "points": [],
                            "relationShips": [],
                            "annotations": [],
                            "images": [],
                            "measures": [],
                            "interiors": [],
                            "iterations": [],
                            "notations": []
                        },
                        "counters": [],
                        "markings": [],
                        "selected": [],
                        "hiddenObjects": [],
                        "anchor": null,
                        "locked": [],
                        "lockUserMap": {},
                        "hideUserMap": {}
                    },
                    "popupDefaultValues": {}
                },
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                defaultColor = '#424242',
                loopVar = 0,
                looper,
                length;

            engineJson.engine.anchor = this.anchor ? this.anchor.id : null; //check is required as system may not be having any anchor point

            //get points data
            length = this.points.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                engineJson.engine.drawing.points.push(this.points[loopVar].getData());
            }

            //get shapes data
            length = this.shapes.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                engineJson.engine.drawing.shapes.push(this.shapes[loopVar].getData());
            }

            //for notations data
            length = this.notations.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                engineJson.engine.drawing.notations.push(this.notations[loopVar].getData());
            }

            //for interiors data
            length = this.interiors.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                engineJson.engine.drawing.interiors.push(this.interiors[loopVar].getData());
            }

            //get measurement data
            length = this.measures.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                engineJson.engine.drawing.measures.push(this.measures[loopVar].getData());
            }
            //get points relationship data
            length = this.relationShips.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                if (!this.relationShips[loopVar]._universe) {
                    engineJson.engine.drawing.relationShips.push(this.relationShips[loopVar].getData());

                }
            }

            //get selected entities
            length = this.selected.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                engineJson.engine.selected.push(this.selected[loopVar].id);
            }

            //get hidden objects
            length = this.hiddenObjects.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                engineJson.engine.hiddenObjects.push(this.hiddenObjects[loopVar].id);
            }
            for (loopVar in this.hideUserMap) {
                engineJson.engine.hideUserMap[loopVar] = [];
                for (looper = 0; looper < this.hideUserMap[loopVar].length; looper++) {
                    engineJson.engine.hideUserMap[loopVar].push(this.hideUserMap[loopVar][looper].id);
                }
            }
            //get locked entities
            length = this.locked.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                engineJson.engine.locked.push(this.locked[loopVar].id);
            }
            for (loopVar in this.lockUserMap) {
                engineJson.engine.lockUserMap[loopVar] = [];
                for (looper = 0; looper < this.lockUserMap[loopVar].length; looper++) {
                    engineJson.engine.lockUserMap[loopVar].push(this.lockUserMap[loopVar][looper].id);
                }
            }
            //get annotations
            length = this.annotations.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                engineJson.engine.drawing.annotations.push(this.annotations[loopVar].getData());
            }
            //get images
            length = this.images.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                engineJson.engine.drawing.images.push(this.images[loopVar].getData());
            }
            //get iterations
            length = this.iterations.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                engineJson.engine.drawing.iterations.push(this.iterations[loopVar].getData());
            }
            //get acknowledged markings
            length = this.markings.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                engineJson.engine.markings.push(this.markings[loopVar].getData());
            }
            this.setDefaultProperties(defaultColor); // set default color.
            engineJson.engine.counters.push(DgtEngine.entityCount, DgtEngine.naturalEntityCount,
                DgtEngine.measurementCustomLabelCount, DgtEngine.allEntitiesCount);

            engineJson.engine.grid.lastGridPattern = this.dgtUI.model.lastGridPattern;
            engineJson.engine.grid.gridObject = this.grid.getAttribute();
            engineJson.menubar.selectedMenuIndex = this.dgtUI.model.menubarLastState.selectedMenuIndex;
            engineJson.menubar.selectedSubMenuIndices = this.dgtUI.model.menubarLastState.selectedSubMenuIndices.slice();
            engineJson.menubar.currentStateOfRadioBtn = DgtEngine.cloneObject(this.dgtUI.model.radioBtnLatestState);

            engineJson.popupDefaultValues = this.dgtUI.model.dgtPopUpView.getPopupStates();

            return engineJson;
        },

        "setData": function(engineJson) {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                isUndoRedoInProgress = DgtEngine.restoreKind,
                isReset = DgtEngine.isReset,
                loopVar = 0,
                key,
                newPoint, entity,
                newShape, newMeasurement,
                newInterior, newIteration, newNotation,
                length,
                isPaste,
                toBeHidden = [],
                newRelation, newAnnotation, newImage, gridDisplay, newMarking,
                selectedMenuIndex, selectedSubMenuIndices, subIndex, radioButtonState, directive,
                toBeSelected = [],
                shapesMenuIndex = 3,
                conicsMenuIndex = 4,
                shapeConicsStartIndex = 6;
            if (this._undergoingOperation) {
                isPaste = this._undergoingOperation.directive === 'paste';
            }
            if (isReset || isPaste) {
                this.deselectAll();
            }
            if (isReset) {

                engineJson = $.parseJSON(engineJson);

            }
            this.grid.restrainViewRefreshByModule('engine.setData');
            //1.restore grid
            if (isReset === true && !isPaste) {
                gridDisplay = engineJson.engine.grid.gridObject.graphDisplay;
                this.grid.setAttribute(engineJson.engine.grid.gridObject);

                if (gridDisplay.isLabelShown && gridDisplay.isGridLineShown && gridDisplay.isAxisLinesShown && gridDisplay.isCartesionCurrentGraphType) {

                    this.changeGridPattern('squareGrid', true);
                } else if (!(gridDisplay.isLabelShown || gridDisplay.isGridLineShown || gridDisplay.isAxisLinesShown)) {
                    this.changeGridPattern('noGrid', true);
                } else {
                    this.changeGridPattern('polarGrid', true);
                }

                this.dgtUI.model.lastGridPattern = engineJson.engine.grid.lastGridPattern;

                for (loopVar in engineJson.engine.counters[0]) {
                    DgtEngine.entityCount[loopVar] = engineJson.engine.counters[0][loopVar];
                }
                for (loopVar in engineJson.engine.counters[1]) {
                    DgtEngine.naturalEntityCount[loopVar] = engineJson.engine.counters[1][loopVar];
                }
                for (loopVar in engineJson.engine.counters[2]) {
                    DgtEngine.measurementCustomLabelCount[loopVar] = engineJson.engine.counters[2][loopVar];
                }
                if (engineJson.engine.counters[3]) {
                    DgtEngine.serialNumberPresentInData = true;
                    DgtEngine.allEntitiesCount.serialNumber = engineJson.engine.counters[3].serialNumber;
                }

                this.grid._gridGraphModelObject.set('_useScrollBarsForPanning', true);
            }
            // 2.restore points
            length = engineJson.engine.drawing.points.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                newPoint = new MathUtilities.Tools.Dgt.Models.DgtPoint();
                newPoint.setData(engineJson.engine.drawing.points[loopVar], this);

                if (isReset !== true && (isPaste || isUndoRedoInProgress === DgtEngine.ACTION_UNDO_REDO)) {
                    if (toBeSelected.indexOf(newPoint) === -1 && newPoint.properties.binaryInvisibility === 0) {
                        toBeSelected.push(newPoint);
                    }
                    if (toBeHidden.indexOf(newPoint) === -1 && newPoint.properties.binaryInvisibility & 1) {
                        toBeHidden.push(newPoint);
                    }
                }
                if (newPoint.properties.locked === true) {
                    newPoint.setProperty('locked', true);
                }
            }

            // restore shapes
            length = engineJson.engine.drawing.shapes.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                newShape = new MathUtilities.Tools.Dgt.Models.DgtShape();
                newShape.setData(engineJson.engine.drawing.shapes[loopVar], this);

                if ((isPaste || isUndoRedoInProgress === DgtEngine.ACTION_UNDO_REDO) && isReset === false) {
                    if (toBeSelected.indexOf(newShape) === -1 && newShape.properties.binaryInvisibility === 0) {
                        toBeSelected.push(newShape);
                    }
                    if (toBeHidden.indexOf(newShape) === -1 && newShape.properties.binaryInvisibility & 1) {
                        toBeHidden.push(newShape);
                    }
                }
                if (newShape.properties.locked === true) {
                    newShape.setProperty('locked', true);
                }
            }

            //restore notations
            if (engineJson.engine.drawing.notations) {
                length = engineJson.engine.drawing.notations.length;
                for (loopVar = 0; loopVar < length; loopVar++) {
                    newNotation = new MathUtilities.Tools.Dgt.Models.DgtNotation();
                    newNotation.setData(engineJson.engine.drawing.notations[loopVar], this);

                    if ((isPaste || isUndoRedoInProgress === DgtEngine.ACTION_UNDO_REDO) && isReset === false) {
                        if (toBeSelected.indexOf(newNotation) === -1 && newNotation.properties.binaryInvisibility === 0) {
                            toBeSelected.push(newNotation);
                        }
                        if (toBeHidden.indexOf(newNotation) === -1 && newNotation.properties.binaryInvisibility & 1) {
                            toBeHidden.push(newNotation);
                        }
                    }
                    if (newNotation.properties.locked === true) {
                        newNotation.setProperty('locked', true);
                    }
                }
            }

            //restore interiors
            if (engineJson.engine.drawing.interiors) {
                length = engineJson.engine.drawing.interiors.length;
                for (loopVar = 0; loopVar < length; loopVar++) {
                    newInterior = new MathUtilities.Tools.Dgt.Models.DgtInterior();
                    newInterior.setData(engineJson.engine.drawing.interiors[loopVar], this);

                    if ((isPaste || isUndoRedoInProgress === DgtEngine.ACTION_UNDO_REDO) && isReset === false) {
                        if (toBeSelected.indexOf(newInterior) === -1 && newInterior.properties.binaryInvisibility === 0) {
                            toBeSelected.push(newInterior);
                        }
                        if (toBeHidden.indexOf(newInterior) === -1 && newInterior.properties.binaryInvisibility & 1) {
                            toBeHidden.push(newInterior);
                        }
                    }
                    if (newInterior.properties.locked === true) {
                        newInterior.setProperty('locked', true);
                    }
                }
            }

            //  restore measurements
            length = engineJson.engine.drawing.measures.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                newMeasurement = new MathUtilities.Tools.Dgt.Models.DgtMeasurement();
                newMeasurement.setData(engineJson.engine.drawing.measures[loopVar], this);

                if ((isPaste || isUndoRedoInProgress === DgtEngine.ACTION_UNDO_REDO) && isReset === false) {
                    if (toBeSelected.indexOf(newMeasurement) === -1 && newMeasurement.properties.binaryInvisibility === 0) {
                        toBeSelected.push(newMeasurement);
                    }
                    if (toBeHidden.indexOf(newMeasurement) === -1 && newMeasurement.properties.binaryInvisibility & 1) {
                        toBeHidden.push(newMeasurement);
                    }
                }
                if (newMeasurement.properties.locked === true) {
                    newMeasurement.setProperty('locked', true);
                }
            }

            //restore iterations
            if (engineJson.engine.drawing.iterations) {
                length = engineJson.engine.drawing.iterations.length;
                for (loopVar = 0; loopVar < length; loopVar++) {
                    newIteration = new MathUtilities.Tools.Dgt.Models.DgtIteration();
                    newIteration.setData(engineJson.engine.drawing.iterations[loopVar], this);

                    if (toBeSelected.indexOf(newIteration) === -1 && newIteration.properties.binaryInvisibility === 0) {
                        toBeSelected.push(newIteration);
                    }
                    if (toBeHidden.indexOf(newIteration) === -1 && newIteration.properties.binaryInvisibility & 1) {
                        toBeHidden.push(newIteration);
                    }
                }
            }

            //set acknowledged markings
            length = engineJson.engine.markings.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                newMarking = new MathUtilities.Tools.Dgt.Models.DgtMarking();
                newMarking.setData(engineJson.engine.markings[loopVar], this);
            }

            //3. restore images
            length = engineJson.engine.drawing.images.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                newImage = new MathUtilities.Tools.Dgt.Models.DgtImage();
                newImage.setData(engineJson.engine.drawing.images[loopVar], this);

                if (newImage.species === 'text') {
                    this.createTextTool();
                }
                /*......only last image is pushed in selection array as now only single image selection is allowed*/

                if (isReset === false && newImage.properties.binaryInvisibility === 0) {
                    toBeSelected.push(newImage);
                }
                if (toBeHidden.indexOf(newImage) === -1 && newImage.properties.binaryInvisibility & 1) {
                    toBeHidden.push(newImage);
                }
                if (newImage.properties.locked === true) {
                    newImage.setProperty('locked', true);
                }
            }

            // 4.restore relations
            length = engineJson.engine.drawing.relationShips.length;
            for (loopVar = 0; loopVar < length; loopVar++) {

                newRelation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                newRelation.setData(engineJson.engine.drawing.relationShips[loopVar], this);
                if (isPaste && newRelation.isMature()) {
                    this._undergoingOperation.relations.push(newRelation);
                }
                if (DgtOperation.isAPredefinedShape(newRelation) && isUndoRedoInProgress === DgtEngine.ACTION_UNDO_REDO && isReset === false &&
                    newRelation.offspring.division === 'point' && toBeSelected.indexOf(newRelation.offspring) > -1) {
                    toBeSelected.splice(toBeSelected.indexOf(newRelation.offspring), 1);
                }
            }

            //5. restore annotations
            length = engineJson.engine.drawing.annotations.length;
            for (loopVar = 0; loopVar < length; loopVar++) {
                newAnnotation = new MathUtilities.Tools.Dgt.Models.DgtAnnotation();
                newAnnotation.setData(engineJson.engine.drawing.annotations[loopVar], this);

                this.addPointToPlot(newAnnotation);
                this.acknowledgeEntity(newAnnotation);
                if ((isPaste || isUndoRedoInProgress === DgtEngine.ACTION_UNDO_REDO) && isReset === false) {
                    if (toBeSelected.indexOf(newAnnotation) === -1 && newAnnotation.properties.binaryInvisibility === 0) {
                        this._select(newAnnotation);
                    }
                    if (toBeHidden.indexOf(newAnnotation) === -1 && newAnnotation.properties.binaryInvisibility & 1) {
                        toBeHidden.push(newAnnotation);
                    }
                }
                if (newAnnotation.properties.locked === true) {
                    newAnnotation.setProperty('locked', true);
                }
            }

            //select required points( done purposely to get proper selection prison)

            while (toBeHidden.length > 0) {
                this.hiddenObjects.push(toBeHidden.pop());
            }
            if (isReset && typeof engineJson.menubar.selectedSubMenuIndices !== 'undefined') {
                selectedMenuIndex = this.dgtUI.model.menubarLastState.selectedMenuIndex = this.dgtUI.model.menubarCurrentState.selectedMenuIndex = engineJson.menubar.selectedMenuIndex;
                selectedSubMenuIndices = this.dgtUI.model.menubarLastState.selectedSubMenuIndices = this.dgtUI.model.menubarCurrentState.selectedSubMenuIndices = engineJson.menubar.selectedSubMenuIndices.slice();
                this.dgtUI.model.wasInSnapGridMode = engineJson.menubar.wasInSnapGridMode;
                this.dgtUI.model.currentRadioButtontype = this.dgtUI.model.radioBtnActionMap[selectedMenuIndex];
                if (typeof engineJson.menubar.currentStateOfRadioBtn === 'object') {
                    this.dgtUI.model.radioBtnLatestState = DgtEngine.cloneObject(engineJson.menubar.currentStateOfRadioBtn);
                    radioButtonState = this.dgtUI.model.radioBtnLatestState[this.dgtUI.model.currentRadioButtontype];
                } else {
                    //For Compatibility issue:
                    for (key in this.dgtUI.model.radioBtnLatestState) {
                        this.dgtUI.model.radioBtnLatestState[key] = engineJson.menubar.currentStateOfRadioBtn;
                    }
                    //Previous JSON data has subMenuIndices based on the previous UI hence to maintain the menubar state for current UI we need to set subMenuIndices to default index..
                    selectedSubMenuIndices[shapesMenuIndex] = this.dgtUI.model.menubarLastState.selectedSubMenuIndices[shapesMenuIndex] = this.dgtUI.model.menubarCurrentState.selectedSubMenuIndices[shapesMenuIndex] = selectedSubMenuIndices[shapesMenuIndex] + shapeConicsStartIndex;
                    selectedSubMenuIndices[conicsMenuIndex] = this.dgtUI.model.menubarLastState.selectedSubMenuIndices[conicsMenuIndex] = this.dgtUI.model.menubarCurrentState.selectedSubMenuIndices[conicsMenuIndex] = selectedSubMenuIndices[conicsMenuIndex] + shapeConicsStartIndex;

                    radioButtonState = engineJson.menubar.currentStateOfRadioBtn;
                }
            }

            //6. restore the menubar state.
            this.dgtUI.changeManubarState();

            //7. start building new relations of iteration
            if (engineJson.engine.drawing.iterations) {
                length = engineJson.engine.drawing.iterations.length;
                for (loopVar = 0; loopVar < length; loopVar++) {
                    newIteration = this.getEntityFromId(engineJson.engine.drawing.iterations[loopVar].id);
                    newIteration.generateFirstMap();
                    if (newIteration.properties.locked === true) {
                        newIteration.setProperty('locked', true);
                    }
                    if (this.allEntities.indexOf(newIteration) === -1) {
                        this.allEntities.push(newIteration);
                    }
                }
            }

            if (isReset === true) {
                this.dgtUI.setSelectedGridInMenu(this.gridPattern);
                // 8.restore selected points / shapes??
                length = engineJson.engine.selected.length;
                for (loopVar = 0; loopVar < length; loopVar++) {
                    entity = this.getEntityFromId(engineJson.engine.selected[loopVar]);
                    if (!entity) {
                        continue;
                    }
                    if (this.getEntityFromId(engineJson.engine.selected[loopVar]).division === 'image') {
                        this._select(this.getEntityFromId(engineJson.engine.selected[loopVar]));
                    } else {
                        this._select(this.getEntityFromId(engineJson.engine.selected[loopVar]));
                    }
                }
                this.hiddenObjects = [];
                length = engineJson.engine.hiddenObjects.length;
                for (loopVar = 0; loopVar < length; loopVar++) {
                    entity = this.getEntityFromId(engineJson.engine.hiddenObjects[loopVar]);
                    if (!entity) {
                        continue;
                    }
                    if (this.selected.indexOf(this.getEntityFromId(engineJson.engine.hiddenObjects[loopVar])) > -1) {
                        this._select(this.getEntityFromId(engineJson.engine.hiddenObjects[loopVar]));
                    }
                    this.hiddenObjects.push(this.getEntityFromId(engineJson.engine.hiddenObjects[loopVar]));
                }
                // 9.restore anchor points
                this.anchor = this.getEntityFromId(engineJson.engine.anchor);
                if (this.anchor) {
                    this._updateDrawableColor(this.anchor);
                }

            } else {
                while (toBeSelected.length > 0) {
                    this._select(toBeSelected.pop());
                }
            }

            if (!isReset) {
                for (key in engineJson.engine.drawing) {
                    if (engineJson.engine.drawing[key].length > 0) {
                        this[key].sort(function(a, b) {
                            return a.serialNumber > b.serialNumber ? 1 : -1;
                        });
                    }
                }
            }

            if (typeof engineJson.popupDefaultValues !== 'undefined') {
                this.dgtUI.model.dgtPopUpView.restorePopupDefaultValues(engineJson.popupDefaultValues);
            }
            if (isReset && !isUndoRedoInProgress && !isPaste) {
                this.incineratePurgatoryObjects();
            }

            if (this.allEntities) {
                this.allEntities.sort(function(a, b) {
                    return a.serialNumber > b.serialNumber ? 1 : -1;
                });
            }
            /*While retrieving stored data perform is not invoked for the last selected menu */
            if (isReset) {

                if (typeof selectedMenuIndex === 'undefined' || typeof selectedSubMenuIndices === 'undefined') {
                    this.perform('selectCursor', null);
                } else {
                    subIndex = selectedSubMenuIndices[selectedMenuIndex];
                    directive = this.dgtUI.model.toolButtonsActionMap[selectedMenuIndex][subIndex];
                    if (DgtOperation.getOperationType(directive) === 'draw') {
                        if (radioButtonState === 'both') {
                            this.perform(directive, {
                                "fill": true,
                                "stroke": true
                            });
                        } else if (radioButtonState === 'stroke') {
                            this.perform(directive, {
                                "fill": false,
                                "stroke": true
                            });
                        } else {
                            this.perform(directive, {
                                "fill": true,
                                "stroke": false
                            });
                        }
                    } else {
                        this.perform(directive, null);
                    }
                }
            }
            this.createLockHideMaps(engineJson.engine.lockUserMap, engineJson.engine.hideUserMap);
            this.postMultipleSelection();
            DgtEngine.serialNumberPresentInData = false;
            this.grid.freeViewRefreshByModule('engine.setData');
        },
        "createLockHideMaps": function(lockMap, hideMap) {
            var looper1, looper2;
            for (looper1 in lockMap) {
                this.lockUserMap[looper1] = [];
                for (looper2 in lockMap[looper1]) {
                    this.lockUserMap[looper1].push(this.getEntityFromId(lockMap[looper1][looper2]));
                }
            }
            for (looper1 in hideMap) {
                this.hideUserMap[looper1] = [];
                for (looper2 in hideMap[looper1]) {
                    this.hideUserMap[looper1].push(this.getEntityFromId(hideMap[looper1][looper2]));
                }
            }
        },

        "areSuccessorRelationsForPOB": function(pointObj, allSuccessorRelations) {
            var relationCount,
                creationMethod, offspring,
                selectionParole = this.selectionParole,
                evenOddCtr = 0,
                _childrenRelationships = pointObj._childrenRelationships;

            for (relationCount = 0; relationCount < _childrenRelationships.length; relationCount++) {
                creationMethod = _childrenRelationships[relationCount].getCreationMethod();
                if (creationMethod && ['reflect', 'rotate', 'dilate'].indexOf(creationMethod) > -1) {
                    offspring = _childrenRelationships[relationCount].offspring;
                    if (selectionParole.indexOf(offspring) > -1) {
                        evenOddCtr++;
                        allSuccessorRelations.push(_childrenRelationships[relationCount]);
                        _childrenRelationships = _childrenRelationships.concat(offspring._childrenRelationships);
                    }
                }
            }

            return evenOddCtr > 0;
        },

        "buildAxisRelation": function() {
            var relation;
            relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
            relation.id = 'XmirrorRelation';
            relation.init('line', this);
            relation.addSpouse(this._standardObjects.center);
            relation.addSpouse(this._standardObjects.pointX);
            if (relation.offspring) {
                this._standardObjects.Xmirror = relation.offspring;
            }
            relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
            relation.id = 'YmirrorRelation';
            relation.init('line', this);
            relation.addSpouse(this._standardObjects.center);
            relation.addSpouse(this._standardObjects.pointY);
            if (relation.offspring) {
                this._standardObjects.Ymirror = relation.offspring;
            }
        },

        "_getCreatorRelationshipPaths": function(from, target, toHide, count) {
            var tempArr = [],
                check, match, i, j, k, loopVar;
            if (from.creator) {
                for (loopVar = 0; loopVar < from.creator.sources.length; loopVar++) {
                    tempArr.push(from.creator.sources[loopVar]);
                }

                if (from.creator.anchor) {
                    tempArr.push(from.creator.anchor);
                }
                for (i in tempArr) {
                    if (tempArr[i] === target) {
                        check = true;
                        break;
                    }
                }

                if (!check) {
                    for (j in tempArr) {
                        match = this._getCreatorRelationshipPaths(tempArr[j], target, toHide, count);
                        if (match) {
                            if (toHide.indexOf(tempArr[j].id) === -1 && this.selected.indexOf(tempArr[j]) === -1) {
                                toHide.push(tempArr[j].id);
                            }
                            if (this.pathArray[count].indexOf(tempArr[j]) === -1) {

                                this.pathArray[count].push(tempArr[j]);
                            }
                            return true;
                        }
                    }
                }
                if (check) {

                    this.pathArray.push([]);
                    if (this.pathArray[count].indexOf(tempArr[i]) === -1) {
                        this.pathArray[count].push(tempArr[i]);
                        for (k in tempArr) {
                            if (i !== k) {
                                this._getCreatorRelationshipPaths(tempArr[k], target, toHide, count + 1);
                                if (this.pathArray[count].length > 0) {
                                    this.pathArray[count].push(from);
                                    if (toHide.indexOf(from.id) === -1 && this.selected.indexOf(from) === -1) {
                                        toHide.push(from.id);
                                    }
                                }
                            }
                        }
                    }
                    return true;
                }
            }
        },
        "_getRelationsFromPaths": function(path) {
            var relations = [];
            while (path.length > 1) {
                if (path[path.length - 1].creator) {
                    relations.push(path.pop().creator);
                } else {
                    path.pop();
                }
            }
            path.pop();
            return relations;
        },
        "setPasteData": function(selected, operation) {
            var entities = {
                    "shape": [],
                    "point": [],
                    "relation": [],
                    "annotation": [],
                    "image": [],
                    "measurement": [],
                    "interior": [],
                    "notation": [],
                    "marking": [],
                    "iteration": [],
                    "toCut": [],
                    "toHide": []
                },
                count1, count2, count3, count5, curRelation, absorbChildRelations, k,
                absorbRelationParticipants, loopVar,
                absorbTillSourceIsPoint, copyRelation, parent, getMutualRelations, child;
            absorbChildRelations = function(entity) {
                var ctr2;
                if (entity._childrenRelationships) {
                    for (ctr2 = 0; ctr2 < entity._childrenRelationships.length; ctr2++) {
                        curRelation = entity._childrenRelationships[ctr2];
                        if (entities.relation.indexOf(curRelation) === -1) {
                            entities.relation.push(curRelation);
                            if (entities.toCut.indexOf(curRelation.offspring) === -1) {
                                entities.toCut.push(curRelation.offspring);
                            }
                            absorbChildRelations(curRelation.offspring);
                        }
                    }
                }
                if (entity._menteeRelations) {
                    for (ctr2 = 0; ctr2 < entity._menteeRelations.length; ctr2++) {
                        curRelation = entity._menteeRelations[ctr2];
                        if (entities.relation.indexOf(curRelation) === -1) {
                            entities.relation.push(curRelation);
                            if (entities.toCut.indexOf(curRelation.offspring) === -1) {
                                entities.toCut.push(curRelation.offspring);
                            }
                            absorbChildRelations(curRelation.offspring);
                        }
                    }
                }

            };
            absorbRelationParticipants = _.bind(function(relation, forCut) {
                var count4, currentEntity;
                if (relation.sources) {
                    for (count4 = 0; count4 < relation.sources.length; count4++) {
                        currentEntity = relation.sources[count4];
                        if (currentEntity.division !== 'point') {
                            absorbTillSourceIsPoint(currentEntity, entities.toHide, forCut);
                            if (this.selected.indexOf(currentEntity) === -1 && entities.toHide.indexOf(currentEntity.id) === -1 && !forCut) {
                                entities.toHide.push(currentEntity.id);
                            }
                        }
                        if (entities[currentEntity.division].indexOf(currentEntity) === -1) {
                            entities[currentEntity.division].push(currentEntity);
                            getMutualRelations(currentEntity);
                        }
                    }
                }
                if (relation.anchor) {
                    currentEntity = relation.anchor;
                    if (currentEntity.division !== 'point') {
                        absorbTillSourceIsPoint(currentEntity, entities.toHide, forCut);
                        if (this.selected.indexOf(currentEntity) === -1 && entities.toHide.indexOf(currentEntity.id) === -1 && !forCut) {
                            entities.toHide.push(currentEntity.id);
                        }
                    }
                    if (entities[currentEntity.division].indexOf(currentEntity) === -1) {
                        entities[currentEntity.division].push(currentEntity);
                        getMutualRelations(currentEntity);
                    }
                }
                if (relation.offspring) {
                    currentEntity = relation.offspring;
                    if (entities[currentEntity.division].indexOf(currentEntity) === -1) {
                        entities[currentEntity.division].push(currentEntity);
                        getMutualRelations(currentEntity);
                    }
                }
            }, this);
            getMutualRelations = _.bind(function(entity) {
                var ctr1, ctr2, father, curChild, looper, copyRelation1;
                for (ctr1 in entities) {
                    if (['relation', 'toCut', 'toHide'].indexOf(ctr1) > -1) {
                        continue;
                    }
                    for (ctr2 in entities[ctr1]) {
                        if (this.isChildOf(entity, entities[ctr1][ctr2])) {
                            if (entities.relation.indexOf(entity.creator) === -1) {
                                entities.relation.push(entity.creator);
                                absorbChildRelations(entity.creator);
                                if (entities.toHide.indexOf(entity.id) === -1 && this.selected.indexOf(entity) === -1) {
                                    entities.toHide.push(entity.id);
                                }
                            }
                        } else if (this.isChildOf(entities[ctr1][ctr2], entity)) {
                            if (entities.relation.indexOf(entities[ctr1][ctr2].creator) === -1) {
                                entities.relation.push(entities[ctr1][ctr2].creator);
                                absorbChildRelations(entities[ctr1][ctr2].creator);
                                if (entities.toHide.indexOf(entities[ctr1][ctr2].id) === -1 && this.selected.indexOf(entities[ctr1][ctr2]) === -1) {
                                    entities.toHide.push(entities[ctr1][ctr2].id);
                                }
                            }
                        }
                        father = entity;
                        curChild = entities[ctr1][ctr2];
                        this._getCreatorRelationshipPaths(father, curChild, entities.toHide, 0);
                        if (!this.pathArray[0] || this.pathArray[0].length === 0) {
                            father = entities[ctr1][ctr2];
                            curChild = entity;
                            this._getCreatorRelationshipPaths(father, curChild, entities.toHide, 0);
                        }

                        if (this.pathArray[0] && this.pathArray[0].length > 0 && this.pathArray[0].indexOf(father) === -1) {
                            this.pathArray[0].push(father);
                        }
                        for (loopVar = 0; loopVar < this.pathArray.length; loopVar++) {
                            copyRelation1 = this._getRelationsFromPaths(this.pathArray[loopVar]);

                            for (looper = 0; looper < copyRelation1.length; looper++) {
                                absorbRelationParticipants(copyRelation1[looper], operation === 'cut');
                                if (entities.relation.indexOf(copyRelation1[looper]) === -1) {
                                    entities.relation.push(copyRelation1[looper]);
                                }
                            }
                        }
                    }
                }
            }, this);

            absorbTillSourceIsPoint = _.bind(function(entity, toHide, forCut) {
                if (entity.creator) {
                    var loopVar1, mentors, count;
                    for (loopVar1 = 0; loopVar1 < entity.creator.sources.length; loopVar1++) {
                        if (entities.relation.indexOf(entity.creator) === -1) {
                            entities.relation.push(entity.creator);
                        }
                        if (entity.creator.sources[loopVar1].division === 'point') {
                            for (count = 0; count < entity.creator.sources.length; count++) {
                                if (count !== loopVar1 && this.isChildOf(entity.creator.sources[loopVar1], entity.creator.sources[count]) && entities.relation.indexOf(entity.creator.sources[loopVar1].creator) === -1) {
                                    if (toHide.indexOf(entity.creator.sources[loopVar1].id) === -1 && this.selected.indexOf(entity.creator.sources[loopVar1]) === -1) {
                                        toHide.push(entity.creator.sources[loopVar1].id);
                                    }
                                    entities.relation.push(entity.creator.sources[loopVar1].creator);
                                }
                            }
                            continue;
                        }
                        if (toHide.indexOf(entity.creator.sources[loopVar1].id) === -1 && this.selected.indexOf(entity.creator.sources[loopVar1]) === -1 && !forCut) {
                            toHide.push(entity.creator.sources[loopVar1].id);
                        }
                        absorbTillSourceIsPoint(entity.creator.sources[loopVar1], toHide);

                    }
                    if (entity.creator.sources.length === 0 && entities.relation.indexOf(entity.creator) === -1) {
                        entities.relation.push(entity.creator);
                    }
                    if (entity.creator.getMentorMarking) {
                        mentors = entity.creator.getMentorMarking();
                        for (loopVar1 = 0; loopVar1 < mentors.length; loopVar1++) {
                            if (entities.relation.indexOf(mentors[loopVar1].creator) === -1) {
                                if (mentors[loopVar1].division === 'measurement' && toHide.indexOf(mentors[loopVar1].id) === -1 && this.selected.indexOf(entity.creator.sources[loopVar1]) === -1 && !forCut) {
                                    toHide.push(mentors[loopVar1].id);
                                }
                                entities.relation.push(mentors[loopVar1].creator);
                                for (count in mentors[loopVar1].creator.sources) {
                                    if (mentors[loopVar1].creator.sources[count].division === 'point') {
                                        continue;
                                    }
                                    if (toHide.indexOf(mentors[loopVar1].creator.sources[count].id) === -1 && this.selected.indexOf(mentors[loopVar1].creator.sources[count]) === -1 && !forCut) {
                                        toHide.push(mentors[loopVar1].creator.sources[count].id);
                                    }
                                    absorbTillSourceIsPoint(mentors[loopVar1].creator.sources[count], toHide);
                                }
                            }
                        }
                    }
                }
            }, this);

            if (operation === 'cut') {
                for (count1 = 0; count1 < selected.length; count1++) {
                    entities.toCut.push(selected[count1]);
                    absorbChildRelations(selected[count1]);
                }
                for (count3 = 0; count3 < entities.relation.length; count3++) {
                    absorbRelationParticipants(entities.relation[count3], true);
                }
            }
            if (selected.length === 1) {
                if (['point', 'image'].indexOf(selected[0].division) > -1) {
                    if (entities[selected[0].division].indexOf(selected[0]) === -1) {
                        entities[selected[0].division].push(selected[0]);
                        getMutualRelations(selected[0]);
                    }
                } else {
                    if (selected[0].creator) {
                        absorbTillSourceIsPoint(selected[0], entities.toHide);
                        for (count1 = 0; count1 < entities.relation.length; count1++) {
                            absorbRelationParticipants(entities.relation[count1]);
                        }
                    } else if (entities[selected[0].division].indexOf(selected[0]) === -1) {
                        entities[selected[0].division].push(selected[0]);
                        getMutualRelations(selected[0]);

                    }
                }
            } else {
                for (count5 = 0; count5 < selected.length; count5++) {
                    for (count2 = count5 + 1; count2 < selected.length; count2++) {

                        if (selected[count5] && selected[count2]) {
                            parent = selected[count5];
                            child = selected[count2];
                            this._getCreatorRelationshipPaths(parent, child, entities.toHide, 0);
                            if (!this.pathArray[0] || this.pathArray[0].length === 0) {
                                parent = selected[count2];
                                child = selected[count5];
                                this._getCreatorRelationshipPaths(parent, child, entities.toHide, 0);
                            }

                            if (this.pathArray[0] && this.pathArray[0].length > 0 && this.pathArray[0].indexOf(parent) === -1) {
                                this.pathArray[0].push(parent);
                            }
                        }
                    }
                }
                for (loopVar = 0; loopVar < this.pathArray.length; loopVar++) {
                    copyRelation = this._getRelationsFromPaths(this.pathArray[loopVar]);

                    for (k = 0; k < copyRelation.length; k++) {
                        absorbRelationParticipants(copyRelation[k]);
                        if (entities.relation.indexOf(copyRelation[k]) === -1) {
                            entities.relation.push(copyRelation[k]);
                        }
                    }
                }
                for (count5 = 0; count5 < selected.length; count5++) {
                    if (selected[count5].creator && selected[count5].division !== 'point') {
                        absorbTillSourceIsPoint(selected[count5], entities.toHide);

                    } else {
                        if (entities[selected[count5].division].indexOf(selected[count5]) === -1) {
                            entities[selected[count5].division].push(selected[count5]);
                            getMutualRelations(selected[count5]);

                        }
                    }
                    for (count1 = 0; count1 < entities.relation.length; count1++) {
                        absorbRelationParticipants(entities.relation[count1]);
                    }
                }
            }
            this._createDummyJsonForCopyPaste(entities);
        },

        "isChildOf": function(entity, parent) {
            var loopVar;
            if (entity && entity.creator) {
                for (loopVar = 0; loopVar < entity.creator.sources.length; loopVar++) {
                    if (entity.creator.sources[loopVar] === parent) {
                        return true;
                    }
                }
                return entity.creator.anchor && entity.creator.anchor === parent;
            }
        },

        "_createDummyJsonForCopyPaste": function(entities) {
            var loopVar, DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                iterationData;
            this.clipBoardData.pasteData = {
                "engine": {
                    "drawing": {
                        "shapes": [],
                        "points": [],
                        "relationShips": [],
                        "annotations": [],
                        "images": [],
                        "interiors": [],
                        "measures": [],
                        "iterations": [],
                        "notations": []
                    },
                    "markings": [],
                    "toHide": [],
                    "locked": []
                }
            };
            //get relationship data
            entities.relation.sort(function(a, b) {
                return Number(DgtEngine.getFirstNumberFromString(a.id)) > Number(DgtEngine.getFirstNumberFromString(b.id)) ? 1 : -1;
            });
            for (loopVar = 0; loopVar < entities.relation.length; loopVar++) {
                if (!entities.relation[loopVar]._universe && entities.relation[loopVar].species !== 'measureIteration') {

                    this.clipBoardData.pasteData.engine.drawing.relationShips.push(entities.relation[loopVar].getData());
                }
            }

            //for points data
            entities.point.sort(function(a, b) {
                return Number(DgtEngine.getFirstNumberFromString(a.id)) > Number(DgtEngine.getFirstNumberFromString(b.id)) ? 1 : -1;
            });
            for (loopVar = 0; loopVar < entities.point.length; loopVar++) {
                if (!entities.point[loopVar]._universe) {
                    this.clipBoardData.pasteData.engine.drawing.points.push(entities.point[loopVar].getData());
                }
            }

            //for shapes data
            entities.shape.sort(function(a, b) {
                return Number(DgtEngine.getFirstNumberFromString(a.id)) > Number(DgtEngine.getFirstNumberFromString(b.id)) ? 1 : -1;
            });
            for (loopVar = 0; loopVar < entities.shape.length; loopVar++) {
                if (!entities.shape[loopVar]._universe) {
                    this.clipBoardData.pasteData.engine.drawing.shapes.push(entities.shape[loopVar].getData());
                }
            }

            //for notations data
            entities.notation.sort(function(a, b) {
                return Number(DgtEngine.getFirstNumberFromString(a.id)) > Number(DgtEngine.getFirstNumberFromString(b.id)) ? 1 : -1;
            });
            for (loopVar = 0; loopVar < entities.notation.length; loopVar++) {
                if (!entities.notation[loopVar]._universe) {

                    this.clipBoardData.pasteData.engine.drawing.notations.push(entities.notation[loopVar].getData());
                }
            }

            //for interiors data
            entities.interior.sort(function(a, b) {
                return Number(DgtEngine.getFirstNumberFromString(a.id)) > Number(DgtEngine.getFirstNumberFromString(b.id)) ? 1 : -1;
            });
            for (loopVar = 0; loopVar < entities.interior.length; loopVar++) {
                if (!entities.interior[loopVar]._universe) {
                    this.clipBoardData.pasteData.engine.drawing.interiors.push(entities.interior[loopVar].getData());
                }
            }

            //get measurement data
            entities.measurement.sort(function(a, b) {
                return Number(DgtEngine.getFirstNumberFromString(a.id)) > Number(DgtEngine.getFirstNumberFromString(b.id)) ? 1 : -1;
            });
            for (loopVar = 0; loopVar < entities.measurement.length; loopVar++) {
                if (!entities.measurement[loopVar]._universe && entities.measurement[loopVar].species !== 'measureIteration') {
                    this.clipBoardData.pasteData.engine.drawing.measures.push(entities.measurement[loopVar].getData());
                }
            }

            //get annotations
            entities.annotation.sort(function(a, b) {
                return Number(DgtEngine.getFirstNumberFromString(a.id)) > Number(DgtEngine.getFirstNumberFromString(b.id)) ? 1 : -1;
            });
            for (loopVar = 0; loopVar < entities.annotation.length; loopVar++) {
                if (!entities.annotation[loopVar]._universe) {
                    this.clipBoardData.pasteData.engine.drawing.annotations.push(entities.annotation[loopVar].getData());
                }
            }

            entities.iteration.sort(function(a, b) {
                return Number(DgtEngine.getFirstNumberFromString(a.id)) > Number(DgtEngine.getFirstNumberFromString(b.id)) ? 1 : -1;
            });
            for (loopVar = 0; loopVar < entities.iteration.length; loopVar++) {
                iterationData = entities.iteration[loopVar].getData();
                iterationData.bluePrint = null;
                iterationData.adamArray = null;
                iterationData.measurementAvtars = null;
                this.clipBoardData.pasteData.engine.drawing.iterations.push(iterationData);
            }

            //get images
            entities.image.sort(function(a, b) {
                return Number(DgtEngine.getFirstNumberFromString(a.id)) > Number(DgtEngine.getFirstNumberFromString(b.id)) ? 1 : -1;
            });
            for (loopVar = 0; loopVar < entities.image.length; loopVar++) {
                if (!entities.image[loopVar]._universe) {
                    this.clipBoardData.pasteData.engine.drawing.images.push(entities.image[loopVar].getData());
                }
            }

            //get acknowledged markings
            entities.marking.sort(function(a, b) {
                return Number(DgtEngine.getFirstNumberFromString(a.id)) > Number(DgtEngine.getFirstNumberFromString(b.id)) ? 1 : -1;
            });
            for (loopVar = 0; loopVar < entities.marking.length; loopVar++) {
                if (!entities.marking[loopVar]._universe) {
                    this.clipBoardData.pasteData.engine.markings.push(entities.marking[loopVar].getData());
                }
            }

            this.clipBoardData.pasteData.engine.toHide = entities.toHide;

            this.clipBoardData.pasteData = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(this.clipBoardData.pasteData);
        },

        "changePropertiesWhilePaste": function(entity, relationShips) {
            var newId, loopVar, count1, count2, count3,
                PASTE_DELTA = 20,
                /*delta for newly pasted measurements*/
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            switch (entity.division) {
                case 'relation':
                    newId = 'rel' + DgtEngine.entityCount.relationShips;
                    DgtEngine.entityCount.relationShips++;
                    break;
                case 'point':
                    newId = 'p' + DgtEngine.entityCount.points;
                    DgtEngine.entityCount.points++;
                    entity.equation.points[0][0] += this.clipBoardData.pasteCounter;
                    entity.equation.points[0][1] -= this.clipBoardData.pasteCounter;
                    break;
                case 'shape':
                    newId = 's' + DgtEngine.entityCount.shapes;
                    DgtEngine.entityCount.shapes++;
                    break;
                case 'interior':
                    newId = 'in' + DgtEngine.entityCount.interiors;
                    DgtEngine.entityCount.interiors++;
                    break;
                case 'measurement':
                    newId = 'm' + DgtEngine.entityCount.measures;
                    DgtEngine.entityCount.measures++;
                    entity.equation.points[0][0] += this.clipBoardData.pasteCounter * PASTE_DELTA;
                    entity.equation.points[0][1] += this.clipBoardData.pasteCounter * PASTE_DELTA;
                    break;
                case 'image':
                    newId = 'i' + DgtEngine.entityCount.images;
                    DgtEngine.entityCount.images++;
                    entity.equation.points[0][0] += this.clipBoardData.pasteCounter;
                    entity.equation.points[0][1] -= this.clipBoardData.pasteCounter;
                    entity.x += this.clipBoardData.pasteCounter;
                    entity.y -= this.clipBoardData.pasteCounter;
                    break;
                case 'annotation':
                    newId = 'a' + DgtEngine.entityCount.annotations;
                    DgtEngine.entityCount.annotations++;
                    for (loopVar in entity.equation.points) {
                        if (entity.equation.points[loopVar]) {
                            entity.equation.points[loopVar][0] += this.clipBoardData.pasteCounter;
                            entity.equation.points[loopVar][1] -= this.clipBoardData.pasteCounter;
                        }
                    }
                    break;
                case 'marking':
                    newId = 'm' + DgtEngine.entityCount.markings;
                    DgtEngine.entityCount.markings++;
                    break;
                case 'notation':
                    newId = 'n' + DgtEngine.entityCount.notations;
                    DgtEngine.entityCount.notations++;
                    break;
                case 'iteration':
                    newId = 'y' + DgtEngine.entityCount.shapes;
                    DgtEngine.entityCount.shapes++;
                    break;
            }

            function updateIdInParams(params) {
                var ctr1;
                if (params === entity.id) {
                    params = newId;
                } else {
                    for (ctr1 in params) {
                        if (params[ctr1] === entity.id) {
                            params[ctr1] = newId;

                        }
                        if (ctr1 === entity.id) {
                            params[newId] = params[ctr1];
                            delete params[ctr1];
                        }
                        if (typeof params[ctr1] === 'object') {
                            updateIdInParams(params[ctr1]);
                        }
                    }
                }
            }
            if (relationShips && entity.id !== newId) {
                for (loopVar = 0; loopVar < relationShips.length; loopVar++) {
                    for (count2 = 0; count2 < relationShips[loopVar].sources.length; count2++) {
                        if (relationShips[loopVar].sources[count2] === entity.id) {
                            relationShips[loopVar].sources[count2] = newId;
                        }
                    }

                    if (relationShips[loopVar].anchor === entity.id) {
                        relationShips[loopVar].anchor = newId;
                    }
                    if (relationShips[loopVar].offspring === entity.id) {
                        relationShips[loopVar].offspring = newId;
                    }
                    if (relationShips[loopVar].species === 'iterate') {
                        updateIdInParams(relationShips[loopVar]._params);
                    } else {
                        for (count1 in relationShips[loopVar]._params) {


                            if (relationShips[loopVar]._params[count1].id === entity.id) {
                                relationShips[loopVar]._params[count1].id = newId;
                            }
                            if (relationShips[loopVar]._params[count1].length > 0) {
                                for (count3 in relationShips[loopVar]._params[count1]) {
                                    if (relationShips[loopVar]._params[count1][count3] === entity.id) {
                                        relationShips[loopVar]._params[count1][count3] = newId;
                                        if (relationShips[loopVar].offspring[count1]) {
                                            relationShips[loopVar].offspring[count1][count3] = newId;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (entity.properties && entity.properties.isMarkedAnchor) {
                entity.properties.isMarkedAnchor = false;
            }
            if (entity.properties && entity.properties.isInActiveMarking) {
                entity.properties.isInActiveMarking = false;
            }
            entity.serialNumber = DgtEngine.allEntitiesCount.serialNumber;
            DgtEngine.allEntitiesCount.serialNumber++;
            entity.id = newId;
        },

        "getEntityFromId": function(id) {
            if (this._standardObjects[id]) {
                return this._standardObjects[id];
            }
            return this.entityMap[id];
        },

        "isStandardObject": function(entity) {
            var looper;
            for (looper in this._standardObjects) {
                if (this._standardObjects[looper] === entity) {
                    return true;
                }
            }
            return false;
        },

        "getDescriptionString": function() {
            return this.selected[0].createDescriptionString();
        },

        "editMeasurement": function(newParams) {
            this.getEntityFromId(this.editableMeasurementId).updateCurrentMeasurement(newParams);
        },

        "setPropertiesPopupTitle": function(operationType, label, changed) {
            var utilsCls = MathUtilities.Components.Utils.Models.Utils,
                DgtUiModel = MathUtilities.Tools.Dgt.Models.DgtUiModel,
                entity = this.changeLabelOption(DgtUiModel.popupTitleMapping.propertiesOf),
                title = utilsCls.replaceWords(DgtUiModel.propertyPopupMap.title, entity, ''),
                LABEL_LIMIT = 20;

            if (['image', 'annotation'].indexOf(this.selected[0].division) > -1) {
                operationType = 'noLabelEntities';
                this.dgtUI.setTitleAndopenPopup(title, operationType, 'properties', changed);
                return;
            }
            if (this.selected[0].division === 'measurement' && this.selected.length === 1) {
                if (this.selected[0].species === 'parameter') {
                    title = utilsCls.replaceWords(DgtUiModel.propertyPopupMap.title, entity, this.selected[0].updateParameterTitleText());
                } else {
                    title = utilsCls.replaceWords(DgtUiModel.propertyPopupMap.title, entity, this.selected[0].updateMeasureTitleText());
                }
                if (['measureCoordinate', 'measureEquation'].indexOf(this.selected[0].species) > -1) {
                    operationType = 'noLabelEntities';
                } else if (this.selected[0].species === 'parameter') {
                    operationType = 'parameter';
                } else {
                    operationType = this.selected[0].division;
                }
            } else if (this.selected[0].division === 'notation' && this.selected.length === 1) {
                if (this.selected[0].species === 'tickMark') {
                    operationType = 'tickMark';
                } else if (this.selected[0].species === 'angleMark') {
                    operationType = 'angleMark';
                }
            } else {
                if (!label) {
                    if (this.selected.length === 1) {
                        label = this.selected[0].equation.getLabelData().text;
                    }
                }
                if (label && label.length > LABEL_LIMIT) {
                    label = label.slice(0, LABEL_LIMIT) + '...';
                }
                if (label) {
                    title = utilsCls.replaceWords(DgtUiModel.propertyPopupMap.title, entity, label);
                }
                if (!operationType) {
                    if (this.selected.length > 1) {
                        operationType = 'multiple';
                    } else {
                        operationType = this.selected[0].division;
                    }
                }
            }
            this.dgtUI.setTitleAndopenPopup(title, operationType, 'properties', changed);
        },

        "createGridAxes": function() {
            var lineX, lineY, pointY,
                pointX, center;

            pointX = new MathUtilities.Tools.Dgt.Models.DgtPoint({
                "coords": [1, 0]
            });

            center = new MathUtilities.Tools.Dgt.Models.DgtPoint({
                "coords": [0, 0]
            });
            pointY = new MathUtilities.Tools.Dgt.Models.DgtPoint({
                "coords": [0, 1]
            });
            pointX.id = 'pointX';
            center.id = 'center';
            pointY.id = 'pointY';
            this._standardObjects.pointX = pointX;
            this._standardObjects.center = center;
            this._standardObjects.pointY = pointY;

            this._standardObjects.pointX.setEngine(this);
            this._standardObjects.center.setEngine(this);
            this._standardObjects.pointY.setEngine(this);
            pointX.setStateOfMind('serene');
            pointY.setStateOfMind('serene');
            center.setStateOfMind('serene');
            pointX.setProperties();
            pointY.setProperties();
            center.setProperties();
            pointX.changeObjectVisibility(false, pointX.SYSTEM);
            pointY.changeObjectVisibility(false, pointY.SYSTEM);
            center.changeObjectVisibility(false, center.SYSTEM);
            this.acknowledgeEntity(pointX, this._standardObjectIds);
            this.acknowledgeEntity(pointY, this._standardObjectIds);
            this.acknowledgeEntity(center, this._standardObjectIds);
            this.buildAxisRelation();
            lineX = this._standardObjects.Xmirror;
            lineX.id = 'Xmirror';
            lineX.properties.labelText = 'x';
            lineX.setProperty('labelText', lineX.properties.labelText);
            lineX.equation.setThickness(1.5);
            lineX.changeObjectVisibility(false, lineX.SYSTEM);
            lineY = this._standardObjects.Ymirror;
            lineY.id = 'Ymirror';
            lineY.equation.setThickness(1.5);
            lineY.properties.labelText = 'y';
            lineY.setProperty('labelText', lineY.properties.labelText);
            lineY.changeObjectVisibility(false, lineY.SYSTEM);
        },

        "changeGridPattern": function(gridOption, dontRegister) {

            if (this.gridPattern === gridOption) {
                return;
            }

            if (!dontRegister) {
                this.execute('changeGrid', {
                    "undo": {
                        "actionType": 'revertGrid',
                        "undoData": this.gridPattern
                    },
                    "redo": {
                        "actionType": 'changeGrid',
                        "redoData": gridOption
                    }
                });
            }

            var translator = {
                    "noGrid": 'no-grid',
                    "squareGrid": 'cartesian-graph',
                    "polarGrid": 'polar-graph'
                },
                xAxis = this._standardObjects.Xmirror,
                yAxis = this._standardObjects.Ymirror,
                index;

            this.grid.setGraphType(translator[gridOption]);
            this.gridPattern = gridOption;

            if (this.grid.snapToGridFlag && gridOption === 'noGrid') {
                this.dgtUI.model.dgtMenuView.deselectCheckBox('grid', 'snap-to-grid');
                this.grid.snapToGridFlag = false;
                this.dgtUI.model.wasInSnapGridMode = false;
            }
            if (this.dgtUI) {
                this.dgtUI.setSelectedGridInMenu(this.gridPattern);
            }
            if (xAxis && yAxis) {
                if (this.selected.indexOf(xAxis) > -1) {
                    this._select(xAxis);
                }
                if (this.selected.indexOf(yAxis) > -1) {
                    this._select(yAxis);
                }
                index = ['squareGrid', 'polarGrid'].indexOf(gridOption) > -1;
                xAxis.changeObjectVisibility(index, xAxis.SYSTEM);
                yAxis.changeObjectVisibility(index, yAxis.SYSTEM);
            }
        },

        "_isGridVisible": function() {
            return this.gridPattern !== 'noGrid';
        },

        /**
         * _callUndo calls undo function of UndoRedoManager
         * @method _callUndo
         * @return void
         *
         */
        "_callUndo": function() {
            if (!this.dgtUI.model.dgtPopUpView.model.bootstrapPopupShown) {
                var directive, parameters, DgtOperation, operationType;
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation;

                if (this._undergoingOperation) {
                    directive = this._undergoingOperation.directive;
                    parameters = this._undergoingOperation.parameters;
                    this._undergoingOperation.abort();
                }
                //annotation needs to be aborted before checking the undo stack length
                if (this._undoRedoManager.isUndoAvailable('dynamicGraphingTool') === false) {
                    if (directive) {
                        this.perform(directive, parameters);
                        this.dgtUI.changeManubarState();
                    }
                    return;
                }
                this.deselectAll();
                this._undoRedoManager.undo('dynamicGraphingTool');
                this.updatePossibleOperations(); // update operations after undo.
                operationType = DgtOperation.getOperationType(directive);
                if (directive && ['draw', 'annotation'].indexOf(operationType) > -1) {
                    this.perform(DgtOperation.lastOperationData.directive, DgtOperation.lastOperationData.params);
                }
            }
        },

        /**
         * _callRedoc calls redo of UndoRedoManager
         * @method _callRedo
         * @return void
         */
        "_callRedo": function() {
            var directive, parameters;

            if (!this.dgtUI.model.dgtPopUpView.model.bootstrapPopupShown) {

                if (this._undergoingOperation) {
                    directive = this._undergoingOperation.directive;
                    parameters = this._undergoingOperation.parameters;
                    this._undergoingOperation.abort('redo');
                    this.dgtUI.changeManubarState();
                }
                if (this._undoRedoManager.isRedoAvailable('dynamicGraphingTool') === false) {
                    this.perform(directive, parameters);
                    return;
                }
                this.deselectAll();
                this._undoRedoManager.redo('dynamicGraphingTool');
                if (MathUtilities.Tools.Dgt.Models.DgtEngine.isReset === false) {
                    this.perform(directive, parameters);
                } else {
                    MathUtilities.Tools.Dgt.Models.DgtEngine.isReset = false;
                }
            }
        },

        // undo redo

        /**
         * execute method for registering and handling undoredo functionality
         * @method execute
         * @param actionName {String}
         * @param undoRedoData {Object}
         * @param skipRegistration {boolean}
         * @return void
         *
         */
        "execute": function(actionName, undoRedoData, skipRegistration) {
            var postDragDataObject,
                undoAction,
                redoAction,
                currentEntity,
                currentId, pob = [],
                currentData, entity,
                currentCanvasCoordinates,
                menuIndex,
                subMenuIndex, canvasPosition = [],
                entityToBeSelected, i, universe,
                point, rel, relationShip, measure, annotation, image, notation, params, selectedItem, currentCoordinates = [],
                sourceImage, updatedRelations = [],
                transformationView, directive,
                menuIndexMap = this.dgtUI.model.menuIndexMap,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                undoRedoStack = this._undoRedoManager._undoRedoStackMap.dynamicGraphingTool,
                TransformationGridView = MathUtilities.Tools.Dgt.Views.TransformationGridView;

            this.dgtUI.setDocumentDirty();

            if (skipRegistration) {

                switch (actionName) {
                    case 'cropping':
                        if (undoRedoData.actionType === 'delete') {
                            for (image in undoRedoData.undoData.engine.drawing.images) {
                                currentEntity = this.getEntityFromId(undoRedoData.undoData.engine.drawing.images[image]);
                                sourceImage = currentEntity.creator.getSource(0);
                                sourceImage.changeObjectVisibility(true, sourceImage.HIDECROPPINGSOURCEIMAGE);
                                if (currentEntity.isChained === false) {
                                    currentEntity.creator.addCroppingProperties(true, updatedRelations);
                                } else {
                                    currentEntity.isCropped = false;
                                    currentEntity.isChained = false;
                                }
                            }
                        }
                        // falls through
                    case 'drawable':
                        if (undoRedoData.actionType === 'delete') {
                            for (point in undoRedoData.undoData.engine.drawing.points) {
                                currentEntity = this.getEntityFromId(undoRedoData.undoData.engine.drawing.points[point]);
                                if (currentEntity) {
                                    currentEntity.incinerate();
                                }
                            }
                            for (measure in undoRedoData.undoData.engine.drawing.measures) {
                                currentEntity = this.getEntityFromId(undoRedoData.undoData.engine.drawing.measures[measure]);
                                if (currentEntity) {
                                    currentEntity.incinerate();
                                }
                            }
                            for (image in undoRedoData.undoData.engine.drawing.images) {
                                currentEntity = this.getEntityFromId(undoRedoData.undoData.engine.drawing.images[image]);
                                if (currentEntity) {
                                    currentEntity.incinerate();
                                }
                            }
                            for (notation in undoRedoData.undoData.engine.drawing.notations) {
                                currentEntity = this.getEntityFromId(undoRedoData.undoData.engine.drawing.notations[notation]);
                                if (currentEntity) {
                                    currentEntity.incinerate();
                                }
                            }
                            for (rel in undoRedoData.undoData.engine.drawing.relationShips) {
                                for (relationShip in this.relationShips) {
                                    if (this.relationShips[relationShip].id === undoRedoData.undoData.engine.drawing.relationShips[rel]) {
                                        currentEntity = this.relationShips[relationShip];
                                        if (currentEntity) {
                                            currentEntity.incinerate();
                                        }
                                    }

                                }
                            }
                            for (annotation in undoRedoData.undoData.engine.drawing.annotations) {
                                currentEntity = this.getEntityFromId(undoRedoData.undoData.engine.drawing.annotations[annotation]);
                                if (currentEntity) {
                                    currentEntity.incinerate();
                                }
                            }
                            this.dgtUI.changeManubarState();

                        } else {
                            DgtEngine.restoreKind = DgtEngine.ACTION_UNDO_REDO;
                            this.dgtUI.changeManubarState();
                            this.setData(undoRedoData.redoData);
                            DgtEngine.restoreKind = null;
                        }
                        this.grid.updateVisibleDomain();
                        break;

                    case 'changeGrid':
                        if (undoRedoData.actionType === 'revertGrid') {
                            currentData = undoRedoData.undoData;
                        } else {
                            currentData = undoRedoData.redoData;
                        }

                        DgtEngine.restoreKind = DgtEngine.ACTION_UNDO_REDO;
                        this.changeGridPattern(currentData, true);
                        DgtEngine.restoreKind = null;
                        break;

                    case 'redrawNotation':

                        if (undoRedoData.actionType === 'draw') {
                            currentData = undoRedoData.redoData;
                        } else {
                            currentData = undoRedoData.undoData;
                        }
                        DgtEngine.restoreKind = DgtEngine.ACTION_UNDO_REDO;
                        currentEntity = this.getEntityFromId(currentData.id);
                        currentEntity.changeParams(currentData.params);
                        DgtEngine.restoreKind = null;
                        break;
                    case 'resetBoard':
                        if (undoRedoData.actionType === 'draw') {
                            this.clearBoard();
                            DgtEngine.restoreKind = DgtEngine.ACTION_SAVE_RESTORE;
                            MathUtilities.Tools.Dgt.Models.DgtEngine.isReset = true;
                            this.setData(undoRedoData.undoData);
                            menuIndex = this.dgtUI.model.menubarCurrentState.selectedMenuIndex;
                            subMenuIndex = this.dgtUI.model.menubarCurrentState.selectedSubMenuIndices[menuIndex];
                            if (menuIndex !== menuIndexMap.GRID || menuIndex === menuIndexMap.GRID && subMenuIndex !== menuIndexMap.SHAPES) {
                                directive = this.dgtUI.model.toolButtonsActionMap[menuIndex][subMenuIndex];
                                if (DgtOperation.getOperationType(directive) === 'draw') {
                                    if (this.dgtUI.model.radioBtnLatestState[this.dgtUI.model.currentRadioButtontype] === 'both') {
                                        this.perform(directive, {
                                            "stroke": true,
                                            "fill": true
                                        });
                                    } else if (this.dgtUI.model.radioBtnLatestState[this.dgtUI.model.currentRadioButtontype] === 'stroke') {
                                        this.perform(directive, {
                                            "stroke": true,
                                            "fill": false
                                        });
                                    } else {
                                        this.perform(directive, {
                                            "stroke": false,
                                            "fill": true
                                        });
                                    }
                                } else {
                                    this.perform(this.dgtUI.model.toolButtonsActionMap[menuIndex][subMenuIndex], params);
                                }
                            }
                            DgtEngine.restoreKind = null;
                            MathUtilities.Tools.Dgt.Models.DgtEngine.isReset = false;
                            this.grid.updateVisibleDomain();
                        } else {
                            MathUtilities.Tools.Dgt.Models.DgtEngine.isReset = true;
                            params = {
                                "reason": 'redo'
                            };
                            this.perform('resetBoard', params);
                        }
                        break;
                    case 'deleteSelectedItems':
                        if (undoRedoData.actionType === 'reDraw') {
                            DgtEngine.restoreKind = DgtEngine.ACTION_UNDO_REDO;
                            this.setData(undoRedoData.undoData);
                            DgtEngine.restoreKind = null;
                        } else {
                            for (selectedItem in undoRedoData.redoData) {
                                currentId = undoRedoData.redoData[selectedItem];
                                currentEntity = this.getEntityFromId(currentId);
                                this._select(currentEntity);
                                if ((currentEntity.properties.binaryInvisibility & ~currentEntity.HIDECROPPINGSOURCEIMAGE) === 0) {
                                    this.deleteSelectedItems('redo', currentEntity);
                                }
                            }
                            this.deleteSelectedItems('redo');
                        }
                        break;
                    case 'relocate':
                        this.hackForLocked = true;
                        this.hackForLocked = true;
                        if (undoRedoData.actionType === 'goToPrevPosition') {
                            currentData = undoRedoData.undoData;
                        } else {
                            currentData = undoRedoData.redoData;
                        }
                        currentId = currentData.id;
                        DgtEngine.restoreKind = DgtEngine.ACTION_UNDO_REDO;
                        if (currentData.universeId) {
                            universe = this.getEntityFromId(currentData.universeId);
                            currentEntity = universe.getEntityFromId(currentId);
                        } else {
                            currentEntity = this.getEntityFromId(currentId);
                        }

                        if (currentEntity.division === 'measurement') {
                            currentEntity.onDrag(currentData.position);
                        } else {
                            currentEntity.dragging = false;

                            for (i = 0; i < currentData.selectedEntities.length; i++) {
                                entityToBeSelected = this.getEntityFromId(currentData.selectedEntities[i]);
                                this._select(entityToBeSelected);
                                if (entityToBeSelected.getCreationMethod && entityToBeSelected.getCreationMethod() === 'pointOnObject') {
                                    pob.push(entityToBeSelected);
                                }
                                if (entityToBeSelected.division === 'image' && entityToBeSelected === currentEntity) {
                                    transformationView = TransformationGridView.getTransformationGridViewObject(this.dgtUI.dgtPaperScope, this, entityToBeSelected.equation.getRaster());
                                    transformationView._locatePoints();
                                }
                            }

                            if (currentData.actionName !== 'dragging' && currentEntity.division === 'image') {
                                currentCoordinates[0] = currentEntity.x + currentData.deltaX;
                                currentCoordinates[1] = currentEntity.y + currentData.deltaY;
                                currentEntity.setMatrixToRaster(currentData.matrix);
                                currentEntity.setRasterPosition(currentCoordinates);
                                currentCanvasCoordinates = this.grid._getCanvasPointCoordinates(currentCoordinates);
                                currentEntity.setTransformationObject();

                                currentEntity.equation.trigger('transforming', null, currentData.actionName, currentCanvasCoordinates[0], currentCanvasCoordinates[1]);
                                currentEntity.setTransformationObject();
                            } else {
                                for (i in pob) {
                                    entity = pob[i];
                                    canvasPosition = entity.originalDragPosition;
                                    entity.equation.setPoints([this.grid._getGraphPointCoordinates(canvasPosition)]);
                                }
                                postDragDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createPostDragDataObject();
                                postDragDataObject.equation = currentEntity.equation;
                                postDragDataObject.deltaX = this.grid._getCanvasDistance([currentData.deltaX, 0])[0];
                                postDragDataObject.deltaY = this.grid._getCanvasDistance([0, currentData.deltaY])[1];
                                postDragDataObject.position = currentData.position;
                                postDragDataObject.forceDrawing = currentEntity.TRAVEL_FORCE;

                                currentEntity.onPostDrag(postDragDataObject);
                            }
                            this.dgtUI.model.dgtPaperScope.view.draw();

                            currentEntity.updateVisibleDomain();
                        }
                        DgtEngine.restoreKind = null;
                        this.grid.updateVisibleDomain();

                        for (selectedItem in this.locked) {
                            if (this.selected.indexOf(this.locked[selectedItem]) > -1) {
                                this._select(this.locked[selectedItem]);
                            }
                        }
                        this.hackForLocked = false;
                        break;
                    case 'image-transform':
                        if (undoRedoData.actionType === 'before') {
                            currentData = undoRedoData.undoData;
                        } else {
                            currentData = undoRedoData.redoData;
                        }
                        DgtEngine.restoreKind = DgtEngine.ACTION_UNDO_REDO;
                        currentId = currentData.id;
                        currentEntity = this.getEntityFromId(currentId);
                        currentEntity.setMatrixToRaster(currentData.matrix);

                        currentEntity.setRasterPosition([currentData.x, currentData.y]);

                        DgtEngine.restoreKind = null;
                        this.dgtUI.model.dgtPaperScope.view.draw();
                        currentEntity.setTransformationObject();
                        break;
                    case 'showHideObjects':
                        if (undoRedoData.actionType === 'show') {
                            if (undoRedoData.undoData) {
                                for (currentEntity in undoRedoData.undoData) {
                                    currentEntity = this.getEntityFromId(undoRedoData.undoData[currentEntity]);
                                    currentEntity.changeObjectVisibility(true, currentEntity.USER);
                                }
                            } else {
                                for (currentEntity in undoRedoData.redoData) {
                                    currentEntity = this.getEntityFromId(undoRedoData.redoData[currentEntity]);
                                    currentEntity.changeObjectVisibility(true, currentEntity.USER);
                                }
                            }
                            this.postMultipleSelection();
                        } else {
                            if (undoRedoData.undoData) {
                                for (currentEntity in undoRedoData.undoData) {
                                    currentEntity = this.getEntityFromId(undoRedoData.undoData[currentEntity]);
                                    currentEntity.changeObjectVisibility(false, currentEntity.USER);
                                }
                            } else {
                                for (currentEntity in undoRedoData.redoData) {
                                    currentEntity = this.getEntityFromId(undoRedoData.redoData[currentEntity]);
                                    currentEntity.changeObjectVisibility(false, currentEntity.USER);
                                }
                            }
                        }

                        break;
                    case 'text-change':
                        if (undoRedoData.actionType === 'before') {
                            currentData = undoRedoData.undoData;
                        } else {
                            currentData = undoRedoData.redoData;
                        }

                        DgtEngine.restoreKind = DgtEngine.ACTION_UNDO_REDO;
                        currentId = currentData.id;
                        currentEntity = this.getEntityFromId(currentId);
                        currentEntity.changeText(currentData.base64, currentData.text, currentData.top, currentData.left);

                        DgtEngine.restoreKind = null;
                        this.dgtUI.model.dgtPaperScope.view.draw();
                        break;
                    case 'updateCalculation':
                        if (undoRedoData.actionType === 'previousCalculation') {
                            currentData = undoRedoData.undoData;

                        } else {
                            currentData = undoRedoData.redoData;
                        }
                        DgtEngine.restoreKind = DgtEngine.ACTION_UNDO_REDO;
                        currentId = currentData.id;
                        currentEntity = this.getEntityFromId(currentId);
                        currentEntity.updateCurrentMeasurement(currentData.calculationData);
                        if (currentEntity.creator) {
                            currentEntity.creator._setParamData(currentData.calculationData);
                        }
                        DgtEngine.restoreKind = null;
                        break;
                }
                if (undoRedoData) {
                    _.delay(_.bind(function() { //Focus should go to undo /redo button after the operation is finished
                        if (!undoRedoStack.redo.length || undoRedoData.undoData && undoRedoStack.undo.length) {
                            this.accManager.setFocus('undo-highlighter');
                        } else if (!undoRedoStack.undo.length || undoRedoData.redoData) {
                            this.accManager.setFocus('redo-highlighter');
                        }
                    }, this), 1000);
                }
            } else {
                undoAction = new MathUtilities.Components.Undo.Models.Action({
                    "name": actionName,
                    "data": undoRedoData.undo,
                    "manager": this
                });

                redoAction = new MathUtilities.Components.Undo.Models.Action({
                    "name": actionName,
                    "data": undoRedoData.redo,
                    "manager": this
                });
                this._undoRedoManager.registerAction('dynamicGraphingTool', undoAction, redoAction);
            }
        },

        //currently doesn't look in anchors
        "lookForPOBInAncestors": function(entity, result, parole, prison) {
            //no need to check ancestorPOB for measurement as measurement doesn't attest any entity (unless used as marking)
            if (entity.division === 'measurement') {
                return void 0;
            }
            var i, source, reply, found = false;
            if (this.isPointOnObject(entity) && prison.indexOf(entity.creator.getSource(0)) === -1) {
                result.push(entity);
                //no point checking parent of POB
                return true;
            }
            if (entity.creator) {
                for (i = 0; i < entity.creator.sources.length; i++) {
                    source = entity.creator.sources[i];
                    reply = this.lookForPOBInAncestors(source, result, parole, prison);
                    if (reply) {
                        if (parole.indexOf(source) === -1 && !this.isPointOnObject(source)) {
                            parole.push(source);
                        }
                        found = true;

                    }
                }
            }
            return found;
        },

        "getLockedSystem": function() {
            var firstShockwave = [],
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                smallWheel, smallHamster, waveElements = [],
                looper,
                hamster, wheel, traverseChildren, selected = this.selected.slice(),
                prison = [],
                dummyPrison, willUpdate = [],
                genesis, genesisRelation,
                curEntity, loopVar, prisonLength, sortPrison, POBancestors, parole = [],
                minions, entity, willBeAdded = [],
                updateDataObject;
            /*
            Absorb the mutual links of the selection
            */
            for (wheel = 0; wheel < selected.length; wheel++) {
                if (!selected[wheel].properties.locked || DgtEngine.restoreKind) {
                    this.absorbInPrison(selected[wheel], prison, parole);
                }
            }

            for (wheel = 0; wheel < prison.length;) {
                POBancestors = [];
                hamster = prison[wheel];
                this.lookForPOBInAncestors(hamster, POBancestors, parole, prison);

                if (POBancestors.length > 0 && hamster !== POBancestors[0]) {
                    dummyPrison = [hamster];
                    this.traverseToDetectLock(hamster, null, [hamster], dummyPrison, []);

                    if (dummyPrison.length > 1) {
                        for (looper in dummyPrison) {
                            this.absorbInPrison(dummyPrison[looper], prison, parole);
                        }
                        wheel++;
                        continue;
                    }

                    parole.push(prison.splice(wheel, 1)[0]);
                    this.absorbInPrison(POBancestors[0], prison, parole);

                } else {
                    wheel++;
                }

            }

            //THINK TWICE IF YOU ARE GOING TO OPTIMIZE THESE LOOPS...THEY ARE ISOLATED FOR GOOD REASONS

            for (wheel = 0; wheel < prison.length; wheel++) {
                hamster = prison[wheel];
                this.traverseToDetectLock(hamster, null, [hamster], prison, parole);
            }

            //REVIEW- redundant part mostly
            //absorb prison mutual points

            //SORT the points and shapes so that we update points first and shapes thereafter
            for (wheel = prison.length - 1; wheel >= 0; wheel--) {
                hamster = prison[wheel];
                if (hamster.species === 'point') {
                    continue;
                }
                prison.splice(wheel, 1);
                prison.push(hamster);
            }

            this.prisonBreakByPOB(prison, parole);

            //manipulation for iteration
            for (wheel = 0; wheel < prison.length; wheel++) {
                if (prison[wheel]._universe && prison.indexOf(entity) === -1 && willBeAdded.indexOf(entity) === -1) {
                    prison.push(prison[wheel]._universe);
                }
                if (prison[wheel].division === 'iteration') {

                    minions = prison[wheel].getAllEntitiesForPrison();
                    for (looper in minions) {
                        entity = minions[looper];

                        if (prison.indexOf(entity) === -1 && willBeAdded.indexOf(entity) === -1) {
                            willBeAdded.push(entity);
                        }
                    }
                }
            }

            if (willBeAdded.length > 0) {
                for (looper in willBeAdded) {
                    if (prison.indexOf(willBeAdded[looper]) === -1) {
                        prison.push(willBeAdded[looper]);
                    }
                }
            }
            //end of manipulation for iteration

            //detect open points and generate first shockwave
            for (wheel in prison) {
                hamster = prison[wheel];

                traverseChildren = DgtEngine.getTraverseChildren(hamster);

                for (smallWheel in traverseChildren) {
                    smallHamster = traverseChildren[smallWheel];
                    if (prison.indexOf(smallHamster.offspring) === -1 && waveElements.indexOf(smallHamster.offspring) === -1) {

                        waveElements.push(smallHamster.offspring);
                        firstShockwave.push({
                            "shockedEntity": smallHamster.offspring,
                            "shocker": hamster,
                            "current": smallHamster.relation
                        });
                    }
                }
            }

            updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();

            //STAGE: generate list of everyone that will be updated by shockwaves
            for (smallWheel in firstShockwave) {
                smallHamster = firstShockwave[smallWheel];
                genesis = firstShockwave[smallWheel].shocker;
                genesisRelation = firstShockwave[smallWheel].current;
                if (willUpdate.indexOf(genesis) === -1) {
                    willUpdate.push(genesis);
                }

                updateDataObject.genesis = genesis;
                updateDataObject.caller = genesis;
                updateDataObject.dx = 0;
                updateDataObject.dy = 0;
                updateDataObject.relocatedEntities = willUpdate;
                updateDataObject.forceDrawing = genesis.TRAVEL_TEST;
                genesisRelation.moveRelatives(updateDataObject);
            }

            this.selectionPrison = prison;
            this.selectionFirstShockwave = firstShockwave;
            this.selectionParole = parole;
            this.seletionShockwaveWillUpdate = willUpdate;

            sortPrison = function(entityDivisionToPushAtEnd) {
                prisonLength = prison.length;
                for (loopVar = 0; loopVar < prisonLength; loopVar++) {
                    curEntity = prison[loopVar];
                    if (curEntity.division === entityDivisionToPushAtEnd) {
                        prison.push(curEntity);
                        prison.splice(loopVar, 1);
                        loopVar--;
                        prisonLength--;
                    }
                }
            };

            sortPrison('measurement');
            sortPrison('marking');
        },

        "prisonBreakByPOB": function(prison) {
            var scofieldInPrison = [],
                i, freedEntities = [],
                source;

            function liberateFromPrison(entity, prison) {
                var ctr, j, relation, indexPrison;

                if (freedEntities.indexOf(entity) > -1) {
                    return;
                }

                freedEntities.push(entity);

                for (ctr = 0; ctr < entity._childrenRelationships.length; ctr++) {
                    relation = entity._childrenRelationships[ctr];

                    indexPrison = prison.indexOf(relation.offspring);

                    if (indexPrison > -1 && relation.offspring.division !== 'measurement') {
                        prison.splice(indexPrison, 1);
                    } else {
                        //check if ignoring impact from POB if the children are not in prison
                        continue;
                    }

                    //since parent is causing liberation...and child is being freed then it simply means anchors/other parents  from such relations must be freed

                    liberateFromPrison(relation.offspring, prison);

                    if (relation.anchor && prison.indexOf(relation.anchor) > -1) {
                        indexPrison = prison.indexOf(relation.anchor);
                        if (indexPrison > -1 && $.inArray(source, freedEntities) === -1) {
                            prison.splice(indexPrison, 1);
                            liberateFromPrison(relation.anchor, prison);
                        }
                    }
                    if (relation.getSourceCount() > 1) {
                        for (j = 0; j < relation.getSourceCount(); j++) {
                            source = relation.getSource(j);
                            indexPrison = prison.indexOf(source);

                            if (source !== entity && indexPrison > -1 && $.inArray(source, freedEntities) === -1) {
                                prison.splice(indexPrison, 1);
                                liberateFromPrison(source, prison);
                            }
                        }
                    }
                }
            }

            for (i = 0; i < prison.length; i++) {
                //only POB whose parents are not in prison.
                if (this.isPointOnObject(prison[i]) && prison.indexOf(prison[i].creator.getSource(0)) === -1) {
                    scofieldInPrison.push(prison[i]);
                }
            }

            for (i = 0; i < scofieldInPrison.length; i++) {
                liberateFromPrison(scofieldInPrison[i], prison);
            }
        },

        "isPointOnObject": function(entity) {
            return entity && entity.creator && entity.creator.species === 'pointOnObject';
        },

        "absorbInPrison": function(entity, prison, parole, retryForNewPossibilities) {

            if (entity._universe || prison.indexOf(entity) > -1 && !retryForNewPossibilities) {
                return;
            }

            var engine, i, isEntityPOB = this.isPointOnObject(entity);

            if (retryForNewPossibilities) {
                for (i = 0; i < parole.length; i++) {
                    if (prison.indexOf(parole[i]) === -1) {
                        this.absorbInPrison(parole[i], prison, parole);
                    }
                }
            }

            if (prison.indexOf(entity) === -1) {
                prison.push(entity);
            }
            if (['point', 'shape', 'marking', 'image', 'interior', 'notation'].indexOf(entity.division) < 0) {
                return;
            }
            /*
            When absorbing an entity...

            Parent to Child

            entity  is...

            anchor: if source or offspring is in prison then absorb the other

            source: if there is anchor then
            you are the only source. check if the offspring or anchor is in the prison..if yes then absorb the other

            if you are the source...then check if you are the only source... if yes then absorb the offspring
            if you are not the only source then stop


            Child to Parent

            Check if you are the only child...(case with loose ends)
            if you are then check for anchor

            if anchor is present then check if either source or anchor is in prison... if yes absorb source and anchor. otherwise stop

            if anchor is absent then absorb all of them

            */
            engine = this;

            function absorbRelation(relation) {
                var ctr, child;
                if (relation.anchor &&
                    (prison.indexOf(relation.anchor) === -1 || retryForNewPossibilities && parole && parole.indexOf(relation.anchor))) {
                    engine.absorbInPrison(relation.anchor, prison, parole);
                }

                if (relation.offspring &&
                    (prison.indexOf(relation.offspring) === -1 || retryForNewPossibilities && isEntityPOB && parole && parole.indexOf(relation.offspring))) {
                    engine.absorbInPrison(relation.offspring, prison, parole);
                }

                for (ctr = 0; ctr < relation.sources.length; ctr++) {
                    child = relation.sources[ctr];
                    if (prison.indexOf(child) === -1 || retryForNewPossibilities && isEntityPOB && parole && parole.indexOf(child)) {
                        engine.absorbInPrison(child, prison, parole);
                    }
                }
            }

            function absorbParentRelation(relation) {
                //NO POB CASES FOR PARENT RELATIONS
                if (engine.isStandardObject(relation.getSource(0)) && prison.indexOf(relation.getSource(0)) === -1) {
                    prison.push(relation.getSource(0));
                }
                if (relation.anchor) {
                    //assumed that there will be only one source... no relations with multiple sources when anchor is present as of yet
                    if (prison.indexOf(relation.anchor) > -1) {
                        engine.absorbInPrison(relation.getSource(0), prison, parole);
                    } else if (prison.indexOf(relation.getSource(0)) > -1) {
                        engine.absorbInPrison(relation.anchor, prison, parole);
                    }
                } else {
                    //absorb all sources if no anchor, except in case of 'point on object'
                    if (relation.species !== 'pointOnObject') {
                        absorbRelation(relation);
                    }
                }
            }


            //this is absorb if qualified
            function absorbChildRelation(relation) {
                if (relation._universe) {
                    return;
                }
                //if the to be absorbed relation is Point on object then retry absorbing the point on object
                //don't make this param pass through generations of calls
                var tryHarder = relation.species === 'pointOnObject' && prison.indexOf(relation.getSource(0)) > -1,
                    ctr;

                if (relation.anchor) {

                    if (relation.anchor === entity) {
                        if (prison.indexOf(relation.offspring) > -1 || retryForNewPossibilities && isEntityPOB && parole && parole.indexOf(relation.offspring) > -1) {
                            engine.absorbInPrison(relation.getSource(0), prison, parole);
                        } else if (prison.indexOf(relation.getSource(0)) > -1 || retryForNewPossibilities && isEntityPOB && parole && parole.indexOf(relation.getSource(0)) > -1) {
                            engine.absorbInPrison(relation.offspring, prison, parole, tryHarder);
                        }
                    } else if (relation.getSource(0) === entity) { //because we have no relations with multiple sources when anchor is present
                        if (prison.indexOf(relation.offspring) > -1 || retryForNewPossibilities && isEntityPOB && parole && parole.indexOf(relation.offspring) > -1) {
                            engine.absorbInPrison(relation.anchor, prison, parole);
                        } else if (prison.indexOf(relation.anchor) > -1 || retryForNewPossibilities && isEntityPOB && parole && parole.indexOf(relation.anchor) > -1) {
                            engine.absorbInPrison(relation.offspring, prison, parole, tryHarder);
                        }
                    }

                } else {
                    if (relation.getSourceCount() === 0) {
                        engine.absorbInPrison(relation.offspring, prison, parole, tryHarder);
                    } else {
                        //you are one of the many sources
                        //if all sources are in then pull offspring
                        for (ctr = 0; ctr < relation.getSourceCount(); ctr++) {
                            if (prison.indexOf(relation.getSource(ctr)) === -1 || retryForNewPossibilities && isEntityPOB && parole && parole.indexOf(relation.getSource(ctr)) > -1) {
                                return;
                            }
                        }

                        engine.absorbInPrison(relation.offspring, prison, parole, tryHarder);
                    }
                }
            }

            if (entity.creator && !isEntityPOB) {
                absorbParentRelation(entity.creator);
            }

            for (i in entity._childrenRelationships) {
                absorbChildRelation(entity._childrenRelationships[i]);
            }
        },

        "traverseToDetectLock": function(entity, lastTraversedRelation, path, prison, parole) {
            var rippleEntities = [],
                rippleRelations = [],
                affectedEntities, affectedEntity, newPath, wheel, hamster, smallWheel, smallHamster,
                affectedEntityCounter = 0,
                affctedEntitiesLength, isEntityPOB = this.isPointOnObject(entity);

            if (entity.creator && !isEntityPOB && (!lastTraversedRelation || lastTraversedRelation !== entity.creator)) {
                rippleRelations.push(entity.creator);
            }

            for (wheel in entity._childrenRelationships) {
                hamster = entity._childrenRelationships[wheel];
                if (hamster._universe) {
                    continue;
                }
                if (hamster !== lastTraversedRelation) {
                    rippleRelations.push(hamster);
                }
            }

            for (wheel in entity._menteeRelations) {
                hamster = entity._menteeRelations[wheel];
                if (hamster._universe) {
                    continue;
                }
                if (hamster !== lastTraversedRelation) {
                    rippleRelations.push(hamster);
                }
            }

            for (wheel in rippleRelations) {
                hamster = rippleRelations[wheel];

                affectedEntities = hamster.getRippleEntities([entity]);
                affctedEntitiesLength = affectedEntities.length;
                for (affectedEntityCounter = 0; affectedEntityCounter < affctedEntitiesLength; affectedEntityCounter++) {
                    affectedEntity = affectedEntities[affectedEntityCounter];

                    if (affectedEntities.length === 1) {
                        rippleEntities.push(affectedEntity);
                    }

                    if (prison.indexOf(affectedEntity) > -1) {
                        newPath = path.concat(affectedEntity);

                        for (smallWheel in newPath) {
                            smallHamster = newPath[smallWheel];
                            this.absorbInPrison(smallHamster, prison, parole);
                        }
                    } else if (affectedEntity) {
                        //Traverse loop detection... if you get more than 1 occurrence of affectedEntity then that means you are looping...

                        if (path.indexOf(affectedEntity) === path.lastIndexOf(affectedEntity)) {
                            // in case if both are not equal it means, Looping in the path...terminating the path
                            newPath = path.concat(affectedEntity);
                            this.traverseToDetectLock(affectedEntity, hamster, newPath, prison, parole);
                        }
                    }
                }
            }

        },

        "isAnyOperationInProgress": function() {
            return !!this._undergoingOperation;
        },

        "getPopupNameAndValue": function(objectType) {
            var currentLabel = this.selected[0].properties.labelText;
            if (objectType === 'multiple' && this.selected[0].division === 'measurement' && !currentLabel) {
                this.nameInPopup = 'm' + (MathUtilities.Tools.Dgt.Models.DgtEngine.measurementCustomLabelCount.nonParameterCount + 1);
            } else {
                if (currentLabel) {
                    currentLabel.trim();
                    currentLabel = this.selected[0].deletePrefixedString(currentLabel);
                    this.nameInPopup = currentLabel;
                } else {
                    this.nameInPopup = '';
                }
            }
        },
        "updateActiveMarkings": function(marking) {
            var activeMarkings = this.activeMarkings,
                limitForActiveMarkings = MathUtilities.Tools.Dgt.Models.DgtMarking.limitForActiveMarkings,
                species = marking.type,
                curMarking,
                markingIndex;

            if (!marking._incinerated) {
                if (activeMarkings[species].length === limitForActiveMarkings[species]) {
                    curMarking = activeMarkings[species][0];
                    if (curMarking.division === 'measurement') {
                        curMarking.properties.isInActiveMarking = false;
                    }
                    this._isToBeRemovedFromAcknowledgedMarking(activeMarkings[species][0]);
                    activeMarkings[species].splice(0, 1);
                }
                activeMarkings[species].push(marking);
                if (marking.division === 'measurement') {
                    marking.properties.isInActiveMarking = true;
                }
                this._latestMarking = marking;

            } else {
                markingIndex = $.inArray(marking, activeMarkings[species]);
                if (markingIndex > -1) {
                    this._isToBeRemovedFromAcknowledgedMarking(activeMarkings[species][markingIndex]);
                    activeMarkings[species].splice(markingIndex, 1);
                }
                this._latestMarking = null;
                this.dgtUI.model.dgtPopUpView.model.lastSelectedVector = null;
            }
        },

        "_isToBeRemovedFromAcknowledgedMarking": function(marking) {
            if (marking.division === 'marking' && marking._menteeRelations.length === 0) {
                marking.changeObjectVisibility(false, marking.HIDEUNUSEDMARKING);
            }
        },
        "resetPasteCounter": function() {
            this.clipBoardData.pasteCounter = 0;
        },
        "getLatestMarking": function() {
            return this._latestMarking;
        },

        "getActiveMarking": function(type, index) {
            var activeMarkingsForType = this.activeMarkings[type];
            if (!type) {
                return this.activeMarkings;
            }
            if (index) {
                return activeMarkingsForType[activeMarkingsForType.length - index];
            }
            return activeMarkingsForType[activeMarkingsForType.length - 1];
        },

        "setDefaultPositionForPoint": function() {
            var grid = this.grid,
                canvasSize = grid._canvasSize,
                Models = MathUtilities.Tools.Dgt.Models;
            Models.DgtEngine.defaultPointPosition = grid._getGraphPointCoordinates([-10, -10]); // -10 value is taken so that point won't be visible.
            Models.DgtEngine.canvasCenter = grid._getGraphPointCoordinates([canvasSize.width / 2, canvasSize.height / 2]);
        }
    }, {
        //STATIC
        "DIVISION_CONST_FOR_DEPTH_LEVEL": 10e5,
        "isUndoRedoInProgress": false,
        "isAccessible": false,
        "isSaveRestoreInProgress": false,
        "restoreKind": null,
        "defaultPointPosition": null,
        "canvasCenter": null,
        "getDataOfEntity": function(entity) {

            if (!entity || entity._incinerated) {
                return void 0;
            }
            var arr, engine;

            if (entity.division === 'point') {
                engine = entity.engine;

                if (engine._undergoingOperation && engine._undergoingOperation._substitutePoint && entity._stateOfMind === 'restless') {
                    arr = engine._undergoingOperation._substitutePoint.equation.getPoints()[0];
                } else {
                    arr = entity.equation.getPoints()[0];
                }
                return [Number(arr[0]), Number(arr[1])];
            }
            if (entity.division === 'measurement') {
                return entity.value;
            }
            if (entity.division === 'iteration') {
                return entity;
            }
            return entity.equation.getConstants();
        },

        "ACTION_SAVE_RESTORE": 1,
        "ACTION_UNDO_REDO": 2,
        "ACTION_PASTE": 4,

        "isOnShape": function(data, species, point) {
            var offset, fixedPrecisionOffset, precision = 10;
            switch (species) {
                case 'segment':
                    offset = geomFunctions.getPointOffset(data.x1, data.y1, data.x2, data.y2, point[0], point[1]);
                    fixedPrecisionOffset = Number(offset.toFixed(precision));
                    return offset >= 0 && offset <= 1 || fixedPrecisionOffset === 0 || fixedPrecisionOffset === 1;
                case 'ray':
                    offset = geomFunctions.getPointOffset(data.x1, data.y1, data.x2, data.y2, point[0], point[1]);
                    fixedPrecisionOffset = Number(offset.toFixed(precision));
                    return !(offset < 0 && fixedPrecisionOffset !== 0);
                case 'arc':
                    return geomFunctions.isPointProjectionOnArc(data, point);
            }
        },

        "getFirstNumberFromString": function(string) {
            // works for 're3' i.e returns 3.
            // for 'rel34pu23' returns 34.
            if (string === void 0 || string === null) {
                return void 0;
            }
            if (typeof string !== 'string') {
                string = string.toString();
            }
            return string.match(/\d+/) || -1;
        },

        "setDefaultValuesForCounters": function() {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                entityCount = DgtEngine.entityCount,
                naturalEntityCount = DgtEngine.naturalEntityCount,
                measurementCustomLabelCount = DgtEngine.measurementCustomLabelCount,
                allEntitiesCount = DgtEngine.allEntitiesCount;

            entityCount.points = 0;
            entityCount.shapes = 0;
            entityCount.measures = 0;
            entityCount.notations = 0;
            entityCount.annotations = 0;
            entityCount.images = 0;
            entityCount.annotations = 0;
            entityCount.interiors = 0;
            entityCount.relationShips = 0;
            entityCount.markings = 0;
            naturalEntityCount.lineCount = 0;
            naturalEntityCount.circleCount = 1;
            naturalEntityCount.arcCount = 1;
            naturalEntityCount.points = 0;
            naturalEntityCount.interiorCount = 0;
            measurementCustomLabelCount.parameterCount = 0;
            measurementCustomLabelCount.nonParameterCount = 0;
            measurementCustomLabelCount.measurementTitleCount = 0;
            allEntitiesCount.serialNumber = 0;
        },

        "shapeInLineFamily": function(type) {
            return ['line', 'segment', 'ray', 'parallel', 'perpendicular', 'angleBisector'].indexOf(type) > -1;
        },

        "roundOff": function(num, precision) {
            return Number(Number(num).toFixed(precision));
        },

        "roundOffArray": function(arr, precision) {
            arr[0] = this.roundOff(arr[0], precision);
            arr[1] = this.roundOff(arr[1], precision);
            return arr;
        },

        "generateRandomNumber": function(shape) {
            var range, randomNumber;
            range = MathUtilities.Tools.Dgt.Models.DgtShape.shapeOffsetRange[shape.species];
            //for interiors.
            if (!range) {
                range = [0, shape.equation.getPoints().length - 1];
            }
            randomNumber = Math.random() * (range[1] - range[0]) + range[0];
            return randomNumber;
        },

        "getRandomPointOnObject": function(shape, creator, offset1) {
            var point = [],
                segment, randomPointCount = 0,
                a, d, offsetGiven = false,
                grid = shape.engine.grid,
                possibleOffset,
                randomNumber, params = creator.getParams(),
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                offset, markedBounds = grid.getMarkerBounds(),
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                seed = shape.equation.getConstants(),
                x1 = seed.x1,
                x2 = seed.x2,
                y1 = seed.y1,
                y2 = seed.y2,
                abscissa = 0,
                ordinate = 0,
                MAX_ATTEMPTS = 10;

            if (offset1 || params.offset) {
                offsetGiven = true;
            }

            randomNumber = DgtEngine.generateRandomNumber(shape);

            if (offset1) {
                offset = offset1;
            } else if (params && isFinite(params.offset)) {
                offset = params.offset;
            } else if (creator._universe && creator.species === 'pointOnObject') {
                possibleOffset = params.offset.creator.possibleOffset;
                offset = possibleOffset < 0 ? 0 : possibleOffset;
                offset = offset > 1 ? 1 : offset;
                if (typeof possibleOffset !== 'number') {
                    offset = params.offset.creator._params.offset;
                }
            } else {
                if (!params) {
                    params = {};
                }
                params.offset = randomNumber;
                offset = randomNumber;
                creator._setParamData(params);
            }

            function getRandomPoint() {
                switch (shape.species) {
                    case 'line':
                    case 'ray':
                    case 'segment':
                        return geomFunctions.getPointPositionFromOffset(x1, y1, x2, y2, offset);
                    case 'circle':
                    case 'circleInterior':
                        return geomFunctions.rotatePoint(seed.a + seed.r, seed.b, seed.a, seed.b, offset, false);
                        // falls through
                    case 'arcSegmentInterior':
                    case 'arcSectorInterior':
                        if (offset > 1) {
                            if (shape.species === 'arcSegmentInterior') {
                                segment = {
                                    "x1": seed.x3,
                                    "y1": seed.y3,
                                    "x2": seed.x1,
                                    "y2": seed.y1
                                };
                            } else {
                                if (offset < 2) {
                                    segment = {
                                        "x1": seed.x3,
                                        "y1": seed.y3,
                                        "x2": seed.a,
                                        "y2": seed.b
                                    };
                                } else {
                                    segment = {
                                        "x1": seed.a,
                                        "y1": seed.b,
                                        "x2": seed.x1,
                                        "y2": seed.y1
                                    };
                                }
                            }
                            offset = offset - Math.floor(offset);
                            return geomFunctions.getPointPositionFromOffset(segment.x1, segment.y1, segment.x2, segment.y2, offset);
                        }
                        // falls through
                    case 'arc':
                        point = geomFunctions.getPointOnArcFromOffset(seed, offset, 1);
                        return point;
                    case 'parabola':
                        a = Math.sqrt(Math.pow(seed.i - seed.p, 2) + Math.pow(seed.j - seed.q, 2));
                        d = Math.atan((seed.j - seed.q) / (seed.i - seed.p));
                        if (seed.p - seed.i > 0) {
                            x1 = a * offset * (offset * Math.cos(d) - 2 * Math.sin(d)) + seed.p;
                            y1 = a * offset * (offset * Math.sin(d) + 2 * Math.cos(d)) + seed.q;
                        } else {
                            x1 = a * offset * (offset * Math.cos(d + 3.14) - 2 * Math.sin(d + 3.14)) + seed.p;
                            y1 = a * offset * (offset * Math.sin(d + 3.14) + 2 * Math.cos(d + 3.14)) + seed.q;
                        }
                        return [x1, y1];
                    case 'ellipse':
                    case 'ellipseInterior':
                        if (seed.k - seed.i > 0) {
                            d = seed.d;
                        } else {
                            d = seed.d + 3.14;
                        }
                        x2 = seed.p + seed.a * Math.cos(offset) * Math.cos(d) - seed.b * Math.sin(offset) * Math.sin(d);
                        y2 = seed.q + seed.a * Math.cos(offset) * Math.sin(d) + seed.b * Math.sin(offset) * Math.cos(d);

                        return [x2, y2];
                    case 'hyperbola':
                        x1 = seed.p + seed.a * (1 / Math.cos(offset)) * Math.cos(seed.d) - seed.b * Math.tan(offset) * Math.sin(seed.d);
                        y1 = seed.q + seed.a * (1 / Math.cos(offset)) * Math.sin(seed.d) + seed.b * Math.tan(offset) * Math.cos(seed.d);
                        return [x1, y1];
                    case 'polygonInterior':
                        return DgtShape.getPointOnPolygonFromOffset(seed, offset);
                }
            }
            point = getRandomPoint();

            while (!offsetGiven && (point[0] < markedBounds.min.x || point[0] > markedBounds.max.x || point[1] < markedBounds.min.y ||
                    point[1] > markedBounds.max.y) && randomPointCount < MAX_ATTEMPTS) {
                if (point) {
                    randomNumber = DgtEngine.generateRandomNumber(shape);
                    randomPointCount++;
                    params.offset = randomNumber;
                    offset = randomNumber;
                    creator._setParamData(params);
                    point = getRandomPoint();
                }
            }
            if (point) {
                return point;
            }
            return [abscissa, ordinate[0]];
        },

        "getCanvasPointDistance": function(point1, position) {
            var equationPointsGroup = point1.equation.getPointsGroup();
            return geomFunctions.distance2(equationPointsGroup.position.x, equationPointsGroup.position.y, position[0], position[1]);
        },

        //returns if in this relation parents will always follow the child wherever it goes
        "areParentsSticky": function(relation) {
            if (!relation) {
                return false;
            }
            return ['midpoint', 'translate', 'intersection', 'parallel', 'perpendicular'].indexOf(relation.species) > -1;
        },

        "areChildrenSticky": function(relation) {
            if (!relation) {
                return false;
            }
            return ['midpoint', 'translate'].indexOf(relation.species) > -1;
        },

        "getTraverseChildren": function(entity, lastTraversedNode) {
            var hamster, wheel, children = [],
                ripple, smallHamster, smallWheel;
            if (entity.creator && !entity.creator.isPartOfThisRelation(lastTraversedNode)) {
                ripple = entity.creator.getRippleEntities([entity]);
                for (wheel in ripple) {
                    hamster = ripple[wheel];
                    if (hamster._universe) {
                        continue;
                    }
                    if (children.indexOf(hamster) === -1) {
                        children.push({
                            "offspring": hamster,
                            "relation": entity.creator
                        });
                    }
                }
            }

            for (wheel in entity._childrenRelationships) {
                hamster = entity._childrenRelationships[wheel];
                if (hamster._universe || hamster.isPartOfThisRelation(lastTraversedNode)) {
                    continue;
                }

                ripple = hamster.getRippleEntities([entity]);

                for (smallWheel in ripple) {
                    smallHamster = ripple[smallWheel];


                    if (children.indexOf(smallHamster) === -1) {
                        children.push({
                            "offspring": smallHamster,
                            "relation": hamster
                        });
                    }
                }
            }


            for (wheel in entity._menteeRelations) {
                hamster = entity._menteeRelations[wheel];
                if (hamster._universe || hamster.isPartOfThisRelation(lastTraversedNode)) {
                    continue;
                }
                ripple = hamster.getRippleEntities([entity]);
                //check if ripple entities should consist of menteeRelation - returning
                for (smallWheel in ripple) {
                    smallHamster = ripple[smallWheel];
                    if (smallHamster._universe) {
                        continue;
                    }
                    if (children.indexOf(smallHamster) === -1) {
                        children.push({
                            "offspring": smallHamster,
                            "relation": hamster
                        });
                    }
                }
            }
            return children;
        },

        "comparePointsWithThreshold": function(point1, point2) {
            var thresholdValueX, thresholdValueY, tempPoint1, tempPoint2, precision = 10,
                thresholdAllowedPosDiff = 0.0000000000000009,
                thresholdAllowedNegDiff = thresholdAllowedPosDiff * -1;
            thresholdValueX = point1.x - point2.x;
            thresholdValueY = point1.y - point2.y;
            tempPoint1 = {
                "x": Number(point1.x.toFixed(precision)),
                "y": Number(point1.y.toFixed(precision))
            };
            tempPoint2 = {
                "x": Number(point2.x.toFixed(precision)),
                "y": Number(point2.y.toFixed(precision))
            };
            return tempPoint1.x === tempPoint2.x && tempPoint1.y === tempPoint2.y ||
                thresholdValueX > thresholdAllowedNegDiff && thresholdValueX < thresholdAllowedPosDiff && thresholdValueY > thresholdAllowedNegDiff && thresholdValueY < thresholdAllowedPosDiff;
        },

        "getSegmentPointsToFindAngle": function(shape1Data, shape2Data, orderOfPoints) {
            var loopVar, sortedPoints = [],
                orderOfPointsLength = orderOfPoints.length;

            for (loopVar = 0; loopVar < orderOfPointsLength; loopVar++) {
                if (sortedPoints.length < 2) {
                    if (orderOfPoints[loopVar] === 0) {
                        sortedPoints.push({
                            "x": shape1Data.x1,
                            "y": shape1Data.y1
                        });
                    } else {
                        sortedPoints.push({
                            "x": shape1Data.x2,
                            "y": shape1Data.y2
                        });
                    }
                } else {
                    if (orderOfPoints[loopVar] === 0) {
                        sortedPoints.push({
                            "x": shape2Data.x1,
                            "y": shape2Data.y1
                        });
                    } else {
                        sortedPoints.push({
                            "x": shape2Data.x2,
                            "y": shape2Data.y2
                        });
                    }
                }
            }
            return sortedPoints;
        },

        "cloneObject": function(source, cloneExecutedArray) {

            var value, arrExceptions = ['function'],
                type,
                dest = null,
                objectIndex,
                prop = null;
            if (!cloneExecutedArray) {
                cloneExecutedArray = [];
            }
            objectIndex = cloneExecutedArray.indexOf(source);
            if (objectIndex !== -1) {
                return cloneExecutedArray[objectIndex];
            }
            cloneExecutedArray.push(source);
            if (Object.prototype.toString.call(source) === '[object Array]') {
                dest = [];
            } else {
                dest = {};
            }
            for (prop in source) {
                if (!prop) {
                    continue;
                }

                value = source[prop];
                if (typeof value === 'undefined' || value === null) {
                    continue;
                }
                type = typeof value;

                if (arrExceptions.indexOf(type) > -1) {
                    continue;
                }
                if (value && type === 'object' && !value.division) {
                    value = this.cloneObject(value, cloneExecutedArray);
                }
                dest[prop] = value;
            }
            return dest;
        },

        "getPointsToFindAngle": function(shape1Data, shape2Data) {

            var pointsForAngle = [],
                comparePoints = _.bind(function(point1, point2) {

                    return point1.x === point2.x && point1.y === point2.y || this.comparePointsWithThreshold(point1, point2);
                }, this),

                alreadyInArray = function(point) {
                    var i;
                    for (i = 0; i < pointsForAngle.length; i++) {
                        if (comparePoints(pointsForAngle[i], point)) {
                            return i;
                        }
                    }
                    return -1;
                },
                checkForPointToPushInArray = function(point) {
                    var index = alreadyInArray(point),
                        commonAsLastPoint = false,
                        tempPoint;


                    switch (index) {
                        case -1:
                            pointsForAngle.push(point);
                            break;
                        case 0:
                            /*common point - remove from starting & add it again so it will be as 2nd or 3rd point*/
                            pointsForAngle.splice(index, 1);
                            pointsForAngle.push(point);
                            if (pointsForAngle.length === 3) {
                                commonAsLastPoint = true;
                            }
                            break;
                        case 1:
                            /*common point - simply ok at its position at middle*/
                            break;
                        case 2:
                            commonAsLastPoint = true;
                            break;
                    }

                    if (commonAsLastPoint) {
                        tempPoint = pointsForAngle[1];
                        pointsForAngle[1] = pointsForAngle[2];
                        pointsForAngle[2] = tempPoint;
                    }
                };

            pointsForAngle.push({
                "x": shape1Data.x1,
                "y": shape1Data.y1
            });
            pointsForAngle.push({
                "x": shape1Data.x2,
                "y": shape1Data.y2
            });

            checkForPointToPushInArray({
                "x": shape2Data.x1,
                "y": shape2Data.y1
            });
            checkForPointToPushInArray({
                "x": shape2Data.x2,
                "y": shape2Data.y2
            });
            if (pointsForAngle.length < 3) {
                pointsForAngle.push(pointsForAngle[0]);
            }
            return pointsForAngle;
        },

        "getIdForEntity": function(entity) {
            var entityCount, universeId, id;
            if (entity._universe) {
                universeId = entity._universe.id;
                entityCount = entity._universe.iterationEntityCount;
                switch (entity.division) {
                    case 'point':
                        id = universeId + '-p' + entityCount.points;
                        entity._universe.iterationEntityCount.points++;
                        break;
                    case 'shape':
                        id = universeId + '-s' + entityCount.shapes;
                        entity._universe.iterationEntityCount.shapes++;
                        break;
                    case 'measurement':
                        id = universeId + '-m' + entityCount.measures;
                        entity._universe.iterationEntityCount.measures++;
                        break;
                    case 'interior':
                        id = universeId + '-in' + entityCount.interiors;
                        entity._universe.iterationEntityCount.interiors++;
                        break;
                    case 'image':
                        id = universeId + '-i' + entityCount.images;
                        entity._universe.iterationEntityCount.images++;
                        break;
                    case 'annotation':
                        id = universeId + '-a' + entityCount.annotations;
                        entity._universe.iterationEntityCount.annotations++;
                        break;

                    case 'relation':
                        id = universeId + '-rel' + entityCount.relationShips;
                        entity._universe.iterationEntityCount.relationShips++;
                        break;
                    case 'marking':
                        id = universeId + '-marking' + entityCount.markings;
                        entity._universe.iterationEntityCount.markings++;
                        break;
                    case 'notation':
                        id = universeId + '- n' + entityCount.notations;
                        entity._universe.iterationEntityCount.notations++;
                        break;
                }
                return id;
            }
            entityCount = MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount;
            switch (entity.division) {
                case 'point':
                    return 'p' + entityCount.points;
                case 'shape':
                    return 's' + entityCount.shapes;
                case 'measurement':
                    return 'm' + entityCount.measures;
                case 'interior':
                    return 'in' + entityCount.interiors;
                case 'image':
                    return 'i' + entityCount.images;
                case 'annotation':
                    return 'a' + entityCount.annotations;
                case 'relation':
                    return 'rel' + entityCount.relationShips;
                case 'marking':
                    return 'marking' + entityCount.markings;
                case 'notation':
                    return 'n' + entityCount.notations;
            }
        },

        "anticendentOrder": {
            "point": null,
            "parallelLine": ['line', 'point']
        },

        "entityCount": {
            "points": 0,
            "shapes": 0,
            "measures": 0,
            "annotations": 0,
            "images": 0,
            "relationShips": 0,
            "markings": 0,
            "interiors": 0,
            "notations": 0
        },

        "naturalEntityCount": {
            "lineCount": 0,
            "circleCount": 1,
            "arcCount": 1,
            "points": 0,
            "interiorCount": 0
        },

        "measurementCustomLabelCount": {
            "parameterCount": 0,
            "nonParameterCount": 0,
            "measurementTitleCount": 0
        },

        "allEntitiesCount": {
            "serialNumber": 0
        },
        "serialNumberPresentInData": false,
        "isReset": false
    });
})(window.MathUtilities);
