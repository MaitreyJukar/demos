/* globals $, window, geomFunctions  */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtNotation = MathUtilities.Tools.Dgt.Models.DgtDrawable.extend({

        "_paperScope": null,
        "equation": null,
        "species": null,
        "_incinerated": null,
        "_menteeRelations": null,
        "strokeCount": null,
        "seed": null,
        "lastSeed": null,
        "notationGroup": null,
        "typeOfTickMark": '',
        "numberOfArc": 1,
        "creatorParams": null,
        "_creationMethod": null,
        "notationView": null,
        "plotCompleteEventBinded": null,
        "isPreview": null,
        "showDirection": null,

        "initialize": function(options) {


            MathUtilities.Tools.Dgt.Models.DgtNotation.__super__.initialize.apply(this, arguments);
            this.division = 'notation';



            this.equation.setParent(this);
            this.species = 'notation';
            this.seed = {};
            this.lastSeed = {};
            this.equation.setDraggable(true);
            this._incinerated = false;
            this.equation.setSpecie('curve');
            this.on('roll-over', $.proxy(this.marksRollOver, this))
                .on('roll-out', this.marksRollOut);
            this.onDrag = $.proxy(function(newPosition) {

                this.dragging = true;
                this.engine.deselectAll();
                this.engine._select(this);
                this.trigger('relocated', newPosition);
            }, this);

            this.onPreRelocate = $.proxy(function() {
                this.dragging = false;
            }, this);

            this.onRelocate = $.proxy(function(relocateData) {
                var selectionEntity = [],
                    updateDataObject, saveRelocateDataObject;
                if (['select', 'nonGeometricDrawing'].indexOf(this.engine.getOperationMode()) === -1) {
                    return;
                }

                selectionEntity.push(this);

                saveRelocateDataObject = relocateData.clone();
                saveRelocateDataObject.selectionEntity = selectionEntity;

                this.saveDataOnRelocate(saveRelocateDataObject);

                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                updateDataObject.seed = this.seed;
                updateDataObject.noBroadcast = false;
                this.setSeed(updateDataObject);
            }, this);

            this.equation.off('change-color').on('change-color', $.proxy(function() {
                this.changeNotationColor(this.equation);
            }, this));

        },

        "init": function(species, engine) {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            this.species = species;
            this.engine = engine;
            this._paperScope = this.engine.dgtUI.model.dgtPaperScope;
            if (!DgtEngine.restoreKind) {
                this.id = DgtEngine.getIdForEntity(this);
                /*...... :: label notation*/
                DgtEngine.entityCount.notations++;
            }
            if (isNaN(this.serialNumber)) {
                this.setSerialNumber();
                this.equation.depthLevel = this.serialNumber;
            }
            if (!this.engine.isSaveRestoreData) {
                this.notationView = new MathUtilities.Tools.Dgt.Views.DgtNotation({
                    "model": this
                });
            }
        },


        "toString": function() {
            return ' ' + this.id;
        },

        "setLocusOfNotation": function() {
            if (this.getCreationMethod() === 'tickMark') {
                this.equation.setLocus(this.creator.sources[0].equation);
            }
        },

        "setPositionOfNotationOnObject": function(canvasPosition) {

            var gridPosition, newGridPosition, newCanvasPosition, grid = this.engine.grid,
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                equation = this.equation,
                locus = equation.getLocus();

            gridPosition = grid._getGraphPointCoordinates(canvasPosition);

            newGridPosition = DgtShape.getClosestPointOnShape(locus.getParent().species, gridPosition, locus.getConstants());
            newCanvasPosition = grid._getCanvasPointCoordinates(newGridPosition);


            newCanvasPosition = MathUtilities.Tools.Dgt.Models.DgtDrawable.constraintDrag(newCanvasPosition, locus.getParent().equation, true);

            if (newCanvasPosition.offset) {
                this.creator.possibleOffset = newCanvasPosition.offset;
            }
            newGridPosition = grid._getGraphPointCoordinates(newCanvasPosition);
            this.notationGroup.setPosition(newCanvasPosition);
            this.engine.grid.refreshView();
            equation.setPoints([
                [newGridPosition[0], newGridPosition[1]]
            ]);

            return newCanvasPosition;
        },
        "marksRollOver": function() {
            if (this.engine.grid._gridGraphModelObject.get('_gridMode') !== 'Graph' && this.engine.grid._gridGraphModelObject.get('_gridMode') !== 'annotation-mode') {
                return;
            }

            if (this.engine.rolledOver.indexOf(this) === -1) {
                this.engine.rolledOver.push(this);
                this.engine._updateDrawableColor(this);
            }
        },
        "marksRollOut": function() {
            if (this.engine.grid._gridGraphModelObject.get('_gridMode') !== 'Graph' && this.engine.grid._gridGraphModelObject.get('_gridMode') !== 'annotation-mode') {
                return;
            }
            var index = this.engine.rolledOver.indexOf(this);
            if (index > -1) {
                this.engine.rolledOver.splice(index, 1);
                this.engine._updateDrawableColor(this);
            }
        },
        "updateStrokeCount": function() {
            var params = this.creator._getParamData(),
                changedParamsWithValues = {},
                undoData = {},
                redoData = {};

            if (params.strokeCount === 4) {
                changedParamsWithValues = {
                    "strokeCount": 1
                };
            } else {
                changedParamsWithValues = {
                    "strokeCount": params.strokeCount + 1
                };
            }

            undoData.id = redoData.id = this.id;
            undoData.params = params;
            redoData.params = changedParamsWithValues;

            this.engine.dgtUI.model.dgtPopUpView.changeDefaultMarkerParams(this.species, changedParamsWithValues);

            this.engine.execute('redrawNotation', {
                "undo": {
                    "actionType": 'delete',
                    "undoData": undoData
                },
                "redo": {
                    "actionType": 'draw',
                    "redoData": redoData
                }
            });

            this.changeParams(changedParamsWithValues);
        },

        "changeParams": function(changedParamsWithValues) {
            var updateDataObject;

            this.setParams(changedParamsWithValues);
            updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
            this.update(updateDataObject);
        },

        "setParams": function(changedParamsWithValues) {
            var keys;

            for (keys in changedParamsWithValues) {
                this.creator._params[keys] = changedParamsWithValues[keys];
            }

        },

        "renderNotation": function() {
            this.engine.acknowledgeEntity(this);
            this._paperScope = this.engine.dgtUI.model.dgtPaperScope;

            this.engine.grid.activateNewLayer('shape');
            /*create notation view*/
            this.notationView = new MathUtilities.Tools.Dgt.Views.DgtNotation({
                "model": this
            });

            this.engine.grid.activateEarlierLayer();
            /*call update*/
            this.update(MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData());
            /*set properties, if any*/
            this.setProperties();

        },


        "shiftSeedBy": function(dx, dy) {
            var positions = this.getPositionSeed(),
                i, len = positions.length;

            for (i = 0; i < len; i += 2) {
                positions[i] += dx;
                positions[i + 1] += dy;
            }
            return this.setPositionSeed(positions);
        },

        "setPositionSeed": function(positionSeed) {
            var seed = this.equation.getConstants();
            this.patchSeed(seed, positionSeed);
            return seed;
        },


        "patchSeed": function(seed, positionSeed) {
            var params = this.getPositionParamNames(),
                i, len = params.length;

            for (i = 0; i < len; i += 2) {
                seed[params[i]] = positionSeed[i];
                seed[params[i + 1]] = positionSeed[i + 1];
            }

            this.extraPolateSeed(seed);

        },

        "getPositionSeed": function(seed) {
            var params, arr, param;

            params = this.getPositionParamNames();

            seed = seed || this.equation.getConstants();

            arr = [];
            for (param in params) {
                arr.push(seed[params[param]]);
            }

            return arr;
        },

        "getPositionParamNames": function() {
            return MathUtilities.Tools.Dgt.Models.DgtShape.positionParamMap[this.species];
        },

        "setSeed": function(updateData) {
            var operationFlag,
                updateDataObject,
                i, updateValue,
                lastSeedPosition, currentSeedPosition,
                seed = updateData.seed,
                genesis = updateData.genesis,
                caller = updateData.caller,
                dx = updateData.dx,
                dy = updateData.dy,
                relocatedEntities = updateData.relocatedEntities,
                noBroadcast = updateData.noBroadcast,
                forceDrawing = updateData.forceDrawing,
                modifyAttributes = updateData.modifyAttributes,
                Utils = MathUtilities.Components.Utils.Models.Utils,
                DgtNotationModel = MathUtilities.Tools.Dgt.Models.DgtNotation;

            if (relocatedEntities) {
                if (relocatedEntities.indexOf(this) > -1) {
                    return;
                }
                relocatedEntities.push(this);
            } else {
                relocatedEntities = [this];
            }

            if (!genesis) {
                //this means that creator made the call
                relocatedEntities.push(this.creator);
            }

            if (!modifyAttributes) {
                updateValue = true;
            } else {
                updateValue = modifyAttributes.indexOf('value') > -1;
            }

            updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
            updateDataObject.genesis = genesis;
            updateDataObject.caller = caller;
            updateDataObject.dx = dx;
            updateDataObject.dy = dy;
            updateDataObject.relocatedEntities = relocatedEntities;
            updateDataObject.forceDrawing = forceDrawing;
            updateDataObject.modifyAttributes = modifyAttributes;

            if (!(forceDrawing & this.TRAVEL_TEST)) {

                if (updateValue) {
                    this.equation.setConstants(seed, true);
                    this.lastSeed = this.seed;
                    this.seed = seed;

                    operationFlag = this.setOperationFlag(this.creatorParams);

                    if (this.creator && (!this.creatorParams || operationFlag === DgtNotationModel.REDRAW_OPERATION)) {
                        this.creatorParams = Utils.convertToSerializable(this.creator._params);
                    }

                    if (operationFlag === DgtNotationModel.REDRAW_OPERATION) {
                        this.notationView.removeNotation();
                        this.notationView.drawMarkers();
                    }
                    if (typeof operationFlag === 'undefined') {
                        this.notationView.drawMarkers();
                    }
                    if (operationFlag === DgtNotationModel.UPDATE_OPERATION) {
                        this.updateMarkerPosition();
                    }
                    this.equation.trigger('teleported', this.equation);

                    /*
                        dx, dy is calculated based on 1st point in seed.
                        For shape, dx, dy can be different for different points in seed.
                        This dx, dy is useful when shape seed is moved by fixed dx, dy & not when shape is deformed (changes size).
                    */
                    lastSeedPosition = this.getPositionSeed(this.lastSeed);
                    currentSeedPosition = this.getPositionSeed(this.seed);
                    dx = currentSeedPosition[0] - lastSeedPosition[0];
                    dy = currentSeedPosition[1] - lastSeedPosition[1];
                }
            }



            if (!noBroadcast) {
                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                updateDataObject.caller = this;
                updateDataObject.dx = dx;
                updateDataObject.dy = dy;
                if (relocatedEntities.indexOf(this.creator) === -1 && (!caller || !this.creator.isPartOfThisRelation(caller))) {
                    this.creator.moveRelatives(updateDataObject);
                }


                //before triggering the equation change relocate children
                //only update the relations that belong the genesis universe
                for (i = 0; i < this._childrenRelationships.length; i++) {
                    if (Boolean(forceDrawing & this.TRAVEL_WARP) ^ Boolean(this._childrenRelationships[i]._universe) ||
                        Boolean(forceDrawing & this.TRAVEL_WARP) && this._childrenRelationships[i]._universe !== genesis) {
                        continue;
                    }

                    this._childrenRelationships[i].moveRelatives(updateDataObject);
                }
            }
        },

        "_setSeedForTickMark": function() {
            var creator, selectedItem, specieOfParent, slope, seedOfParent, tickMarkPoint, seed = {};
            creator = this.creator;
            selectedItem = creator.sources[0];
            specieOfParent = selectedItem.species;
            tickMarkPoint = MathUtilities.Tools.Dgt.Models.DgtEngine.getRandomPointOnObject(creator.sources[0], creator, creator.getParamValues().offset);
            this.equation.setPoints(tickMarkPoint);

            if (specieOfParent === 'segment' || specieOfParent === 'line' || specieOfParent === 'ray') {
                seedOfParent = selectedItem.seed;
            } else {
                seedOfParent = this._findTangent(specieOfParent);
            }

            slope = this._findSlope(seedOfParent);

            seed.x1 = tickMarkPoint[0];
            seed.y1 = tickMarkPoint[1];
            seed.slope = slope;
            this.seed = seed;
            this.equation.setConstants(this.seed, true);
        },

        "_findSlope": function(seed) {
            var radToDeg = 180 / Math.PI;
            return Math.atan2(seed.y2 - seed.y1, seed.x2 - seed.x1) * radToDeg;
        },

        "_getSetRegion": function(typeOfMarker, angleBetweenPoints) {
            switch (typeOfMarker) {
                case 'simple':
                    return 'inRegion';
                case 'reflex':
                    return 'outRegion';
                case 'clockwise':
                    if (angleBetweenPoints < 0) {
                        return 'inRegion';
                    }
                    return 'outRegion';
                case 'counter-clockwise':
                    if (angleBetweenPoints > 0) {
                        return 'inRegion';
                    }
                    return 'outRegion';
            }
        },

        "_calculateSeedForOutRegion": function(arcSeed) {
            var seed = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(arcSeed);
            if (seed.via < 0) {
                seed.via = Math.PI + seed.via;
            } else {
                seed.via = seed.via - Math.PI;
            }


            return seed;
        },

        "_setSeedForAngleMark": function(genesis, movedParent, newPosition, dx, dy, relocatedEntities, forceDrawing) {

            var DgtEngine, DgtShape, parentData, sourceCount, anchorData, i, creationMethod, params,
                creator, setRegion, arcSeed = {},
                seed = {},
                angleBetweenPoints;

            DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape;

            creator = this.creator;

            parentData = [];

            sourceCount = creator.getSourceCount();

            if (creator.anchor) {
                anchorData = DgtEngine.getDataOfEntity(creator.anchor, movedParent, newPosition);
            }

            for (i = 0; i < sourceCount; i++) {
                parentData[i] = DgtEngine.getDataOfEntity(creator.getSource(i), movedParent, newPosition);
            }

            creationMethod = this._creationMethod;

            params = creator._getParamData();

            arcSeed = DgtShape.getArcSeed(parentData, anchorData, creationMethod, params);

            angleBetweenPoints = geomFunctions.getArcAngle(arcSeed);
            setRegion = this._getSetRegion(params.typeOfMarker, angleBetweenPoints);
            if (setRegion === 'inRegion') {
                seed = arcSeed;
            } else {
                seed = this._calculateSeedForOutRegion(arcSeed);
            }
            this.seed = seed;
            this.equation.setConstants(this.seed, true);

        },

        "_drawLine": function(pt1, pt2) {
            var from = new this._paperScope.Point(pt1[0], pt1[1]),
                to = new this._paperScope.Point(pt2[0], pt2[1]),
                path = new this._paperScope.Path.Line(from, to);
            path.strokeColor = 'black';
        },

        "_findTangent": function(typeOfShape) {
            var tickMarkPoint, creator, source, tangent, seedOfParent, offset, DgtShape, DgtEngine,
                center, lineThroughTheCurrentPoint,
                a, b, c, pt = [],
                normal, seed;
            DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape;
            DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            creator = this.creator;
            offset = creator._params.offset;
            source = creator.sources[0];
            seedOfParent = source.seed;
            tickMarkPoint = DgtEngine.getRandomPointOnObject(source, creator, offset);
            switch (typeOfShape) {
                case 'circle':
                case 'arc':
                    center = [seedOfParent.a, seedOfParent.b];
                    lineThroughTheCurrentPoint = DgtShape.getLineSeed([tickMarkPoint, center]);
                    tangent = DgtShape.getLineSeed([tickMarkPoint], lineThroughTheCurrentPoint, 'perpendicular');
                    return tangent;


                case 'ellipse':
                    seed = seedOfParent;
                    a = Math.sqrt(tickMarkPoint[0] - seed.i * tickMarkPoint[0] - seed.i + (tickMarkPoint[1] - seed.j * tickMarkPoint[1] - seed.j));
                    b = Math.sqrt(tickMarkPoint[0] - seed.k * tickMarkPoint[0] - seed.k + (tickMarkPoint[1] - seed.l * tickMarkPoint[1] - seed.l));
                    c = Math.sqrt(seed.k - seed.i * seed.k - seed.i + (seed.l - seed.j * seed.l - seed.j));

                    pt[0] = (a * seed.k + b * seed.i + c * tickMarkPoint[0]) / (a + b + c);
                    pt[1] = (a * seed.l + b * seed.j + c * tickMarkPoint[1]) / (a + b + c);
                    normal = DgtShape.getLineSeed([pt, tickMarkPoint]);
                    tangent = DgtShape.getLineSeed([tickMarkPoint], normal, 'perpendicular');
                    return tangent;
            }

        },

        "setOperationFlag": function(previousParams) {
            var creator = this.creator,
                currentParams = creator ? creator._params : null,
                DgtNotationModel;

            DgtNotationModel = MathUtilities.Tools.Dgt.Models.DgtNotation;

            if (!creator && this.notationGroup || creator && !this.notationGroup) {
                return DgtNotationModel.REDRAW_OPERATION;
            }

            if (!previousParams) {
                return void 0;
            }
            switch (this.species) {
                case 'tickMark':
                    if (currentParams.strokeCount !== previousParams.strokeCount ||
                        currentParams.direction !== previousParams.direction ||
                        currentParams.showDirection !== previousParams.showDirection ||
                        currentParams.typeOfMarker !== previousParams.typeOfMarker ||
                        currentParams.thickness !== previousParams.thickness) {
                        return DgtNotationModel.REDRAW_OPERATION;
                    }
                    return DgtNotationModel.UPDATE_OPERATION;
                case 'angleMark':
                    return DgtNotationModel.REDRAW_OPERATION;
            }
        },

        "changeNotationVisibility": function(bVisible) {
            var updateDataObject;
            if (bVisible) {
                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                this.update(updateDataObject);
            } else {
                this.notationView.removeNotation();
            }
        },

        "changeNotationColor": function(propertyValue) {
            var notationGroup, color = this.equation.getColor();

            notationGroup = this.notationGroup;
            if (!notationGroup) {
                return;
            }
            if (this.species === 'tickMark') {
                notationGroup.strokeColor = color;
            } else if (this.species === 'angleMark') {
                notationGroup.strokeColor = color;
                notationGroup.children[1].fillColor = color;
                if (this.creator && this.creator._params && this.creator._params.showDirection) {
                    notationGroup.children[notationGroup.children.length - 1].fillColor = color;
                }
                notationGroup.children[1].fillColor.alpha = 0.5;
            }

        },

        "getArcSeed": function(parentData) {
            var seed;

            seed = {};

            seed.x1 = parentData[0][0];
            seed.y1 = parentData[0][1];
            seed.x2 = parentData[1][0];
            seed.y2 = parentData[1][1];
            seed.x3 = parentData[2][0];
            seed.y3 = parentData[2][1];

            this.extraPolateSeed(seed);

            return seed;
        },

        "extraPolateSeed": function(seed) {
            var incenterPoint, r, params, arcAngle;

            r = 0.5;

            seed.a = seed.x2;
            seed.b = seed.y2;
            seed.r = r;
            seed.from = Math.atan2(seed.y1 - seed.y2, seed.x1 - seed.x2);
            seed.to = Math.atan2(seed.y3 - seed.y2, seed.x3 - seed.x2);

            if (this.creator) {

                params = this.creator._getParamData();
                incenterPoint = geomFunctions.getTriangleIncentre(seed.x1, seed.y1, seed.x2, seed.y2, seed.x3, seed.y3);
                seed.via = Math.atan2(incenterPoint[1] - seed.y2, incenterPoint[0] - seed.x2);

                arcAngle = geomFunctions.getArcAngle(seed);

                if (params.typeOfMarker === 'reflex' || params.typeOfMarker === 'counter-clockwise' && arcAngle < 0 || params.typeOfMarker === 'clockwise' && arcAngle > 0) {
                    if (seed.via > 0) {
                        seed.via = seed.via - Math.PI;
                    } else {
                        seed.via = seed.via + Math.PI;
                    }
                }
            }

        },

        "recalculateSlope": function() {
            var centerPoint, source, sourceConstants, lineThroughTheCurrentPoint, tangent, pointOnObject,
                newSlopeInDeg, oldSlopeInDeg, angleDiffInDeg, seed, DgtShape;

            pointOnObject = this.engine.grid._getGraphPointCoordinates([this.notationGroup.position.x, this.notationGroup.position.y]);
            DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape;

            source = this.creator.getSource(0);

            sourceConstants = source.equation.getConstants();

            centerPoint = [sourceConstants.a, sourceConstants.b];

            lineThroughTheCurrentPoint = DgtShape.getLineSeed([pointOnObject, centerPoint]);
            tangent = DgtShape.getLineSeed([pointOnObject], lineThroughTheCurrentPoint, 'perpendicular');

            newSlopeInDeg = this._findSlope(tangent);

            seed = this.equation.getConstants();
            oldSlopeInDeg = seed.slope;

            this.lastSeed.slope = oldSlopeInDeg;
            seed.slope = newSlopeInDeg;

            angleDiffInDeg = oldSlopeInDeg - newSlopeInDeg;
            this.notationGroup.rotate(angleDiffInDeg, this.notationGroup.position);

        },

        "update": function(updateData) {

            if (this._incinerated || this.properties && this.properties.binaryInvisibility & this.USER) {
                return;
            }

            var i, parentData, source, sourceCount, params,
                creator, arcSeed,
                tickMarkPoint, specieOfParent, slope, seedOfParent, constants = {},
                self = this,
                updateValue, updateLabel,
                updateDataObject,
                genesis = updateData.genesis,
                movedParent = updateData.caller,
                newPosition = updateData.newPosition,
                dx = updateData.dx,
                dy = updateData.dy,
                relocatedEntities = updateData.relocatedEntities,
                forceDrawing = updateData.forceDrawing,
                modifyAttributes = updateData.modifyAttributes,
                DgtObject = MathUtilities.Tools.Dgt.Models.DgtObject,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;

            if (!modifyAttributes) {
                updateValue = true;
                updateLabel = false;
            } else {
                updateValue = modifyAttributes.indexOf('value') > -1;
                updateLabel = modifyAttributes.indexOf('label') > -1;
            }

            updateDataObject = DgtObject.createUpdateData();
            updateDataObject.genesis = genesis;
            updateDataObject.caller = movedParent;
            updateDataObject.newPosition = newPosition;
            updateDataObject.dx = dx;
            updateDataObject.dy = dy;
            updateDataObject.relocatedEntities = relocatedEntities;
            updateDataObject.forceDrawing = forceDrawing;
            updateDataObject.modifyAttributes = modifyAttributes;

            if (!(forceDrawing & this.TRAVEL_TEST)) {

                if (this.creator) {
                    creator = this.creator;
                    params = creator._getParamData();
                }

                switch (this.species) {
                    case 'tickMark':

                        source = creator.sources[0];
                        specieOfParent = source.species;

                        if (!this.plotCompleteEventBinded) {
                            source.equation.on('plotComplete', $.proxy(function() {
                                if (self.notationGroup && self.notationGroup._parent) {
                                    self.notationGroup.bringToFront();
                                }
                            }, self));
                            this.plotCompleteEventBinded = true;
                        }

                        tickMarkPoint = DgtEngine.getRandomPointOnObject(source, creator, params.offset);

                        this.equation.setPoints([tickMarkPoint]);

                        if (['segment', 'line', 'ray'].indexOf(specieOfParent) > -1) {
                            seedOfParent = source.equation.getConstants();
                        } else {
                            seedOfParent = this._findTangent(specieOfParent);
                        }

                        slope = this._findSlope(seedOfParent);

                        constants.offset = params.offset;
                        constants.slope = slope;

                        break;
                    case 'angleMark':
                        if (updateLabel) {
                            this.updateLabelText(null, null, false);
                        }
                        if (updateValue) {
                            parentData = [];

                            sourceCount = this.creator.getSourceCount();

                            for (i = 0; i < sourceCount; i++) {
                                source = creator.getSource(i);
                                if (source.properties.binaryInvisibility !== 2) {
                                    parentData[i] = DgtEngine.getDataOfEntity(source, movedParent, newPosition);
                                } else {
                                    parentData[i] = [NaN, NaN];
                                }
                            }
                            arcSeed = this.getArcSeed(parentData);

                            constants = arcSeed;
                        }

                        break;
                }
            }
            if (updateValue) {
                updateDataObject.seed = constants;
                updateDataObject.dx = NaN;
                updateDataObject.dy = NaN;
                updateDataObject.noBroadcast = null;
                this.setSeed(updateDataObject);
                if (this.species === 'angleMark') {
                    this.equation.setPoints([
                        [this.seed.x1, this.seed.y1],
                        [this.seed.x2, this.seed.y2],
                        [this.seed.x3, this.seed.y3]
                    ]);
                }
                this.equation.trigger('teleported', this.equation);
            }
        },

        "updateMarkerPosition": function() {

            var creator = this.creator,
                pointOnObject, canvasCoordsPointOnObject, oldSlopeInDeg, newSlopeInDeg,
                angleDiffInDeg, updateDataObject;

            if (this.species === 'tickMark') {

                oldSlopeInDeg = this.lastSeed.slope;
                newSlopeInDeg = this.seed.slope;
                pointOnObject = MathUtilities.Tools.Dgt.Models.DgtEngine.getRandomPointOnObject(creator.sources[0], creator, creator.getParamValues().offset);
                canvasCoordsPointOnObject = this.engine.grid._getCanvasPointCoordinates(pointOnObject);

                this.notationGroup.position.x = canvasCoordsPointOnObject[0];
                this.notationGroup.position.y = canvasCoordsPointOnObject[1];

                angleDiffInDeg = oldSlopeInDeg - newSlopeInDeg;

                this.notationGroup.rotate(angleDiffInDeg, this.notationGroup.position);
            } else {
                this.notationView.removeNotation();
                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                this.setSeed(updateDataObject);
                this.notationView.drawMarkers();

            }
        },

        "incinerate": function() {
            var labelData, creator = this.creator;
            if (this._incinerated) {
                return;
            }



            this._incinerated = true;

            this.trigger('incinerated', this);

            /*...... :: call to function which will remove drawn notation*/
            this.notationView.removeNotation();
            this.engine.grid.refreshView();

            labelData = this.equation.getLabelData();
            if (labelData && labelData.labelObject) {
                this.setProperty('labelVisibility', false);
                this.engine.grid.removeDrawingObject(labelData.labelObject);
            }


            this.equation.flushData();

            this.equation.setParent(null);


            delete this.equation;
            delete this.visible;

            if (creator) {
                if (this.species === 'tickMark') {
                    creator.getSource(0).equation.off('plotComplete');
                    this.plotCompleteEventBinded = null;
                }

                creator.incinerate();
            }
            while (this._childrenRelationships.length > 0) {
                //it in turn removes itself thats why
                this._childrenRelationships[0].incinerate();
            }
            delete this.creator;

        },
        "getData": function() {
            var notationJson = {
                "id": null,
                "type": null
            };
            notationJson.id = this.id;
            notationJson.creator = this.creator.id;
            notationJson.species = this.species;
            notationJson.properties = this.properties;
            notationJson.division = this.division;
            notationJson.type = this.type;
            notationJson.equation = this.equation.getData();
            notationJson.strokeCount = this.strokeCount;
            notationJson.serialNumber = this.serialNumber;
            return notationJson;
        },
        "setData": function(notationJson, engine) {

            MathUtilities.Tools.Dgt.Models.DgtEngine.restoreKind = MathUtilities.Tools.Dgt.Models.DgtEngine.ACTION_SAVE_RESTORE;
            this.init(notationJson.species, engine);
            this.id = notationJson.id;
            this.properties = notationJson.properties;
            this.division = notationJson.division;
            this.type = notationJson.type;

            this.equation.setData(notationJson.equation);
            this.equation.getLabelData().isSaveRestoreData = true;

            MathUtilities.Tools.Dgt.Models.DgtEngine.restoreKind = null;
            this.engine.acknowledgeEntity(this);
            this.equation.getLabelData().isSaveRestoreData = false;
            this.strokeCount = notationJson.strokeCount;
            if (!isNaN(notationJson.serialNumber)) {
                this.serialNumber = notationJson.serialNumber;
                this.equation.depthLevel = notationJson.serialNumber;
            }

            /*...... :: update drawing*/
        }


    }, {
        //STATIC
        "REDRAW_OPERATION": 0,
        "UPDATE_OPERATION": 1

    });

})(window.MathUtilities);
