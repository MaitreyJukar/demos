/* globals _, $, window, geomFunctions */
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtRelation = Backbone.Model.extend({


        //type will always be relation to be consistent with DGTPoint and DGTShape
        "division": null,
        "species": null,
        "propertiesForOffspring": null,

        "engine": null,
        "_params": null,
        "_paramValues": null,

        "nature": null,

        "anchor": null,
        "sources": null,

        "relationCode": null,

        "minimumPointsNeeded": null,

        "offspring": null,
        "offspringData": null,

        "_expectation": null,

        "commited": null,
        "_operation": null,

        "_maturityFlag": null,

        "id": null,
        "isAMaturedRelation": null,


        "_universe": null,
        "_address": null,

        //TEST normal force should be mutually exclusive
        "TRAVEL_TEST": 1,
        "TRAVEL_NORMAL": 2,
        "TRAVEL_FORCE": 4,
        "TRAVEL_WARP": 8,

        "initialize": function(options) {
            this.division = 'relation';
            this.antecedents = [];
            this.sources = [];
            this.commited = true;
            this._params = {};
            this._paramValues = {};
            this.isAMaturedRelation = false;
            this._maturityFlag = false;
            this.propertiesForOffspring = {};
            if (options && options.universe) {
                this._universe = options.universe;
            }


            this._onSpouseSettle = _.bind(function(spouse) {
                spouse.off('settled', this._onSpouseSettle);

                var updateDataObject;

                if (this.isMature() && this.allPointsSerene()) {
                    this.commited = true;
                    this.trigger('committed', this);
                }
                this.trigger('spouseAdded', this, spouse);

                if (this.offspring && this.offspring.division === 'shape') {
                    updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                    this.offspring.update(updateDataObject);
                    this.checkForDottedOverlappedShapes();
                }
            }, this);

            this._onSpouseIncinerate = _.bind(function onSpouseIncinerate() {
                this.incinerate();
            }, this);

            this._mentorMarkingUpdated = _.bind(function(genesis, dx, dy, relocatedEntities, updatedMarking, forceDrawing) {
                var offspring = this.offspring,
                    newPosition, source, offspringIndexInWillUpdate;

                if ($.inArray(offspring, relocatedEntities) > -1) {
                    return;
                }
                if (!relocatedEntities) {
                    relocatedEntities = [];
                }

                relocatedEntities.push(this);

                if (relocatedEntities.willUpdate && relocatedEntities.willUpdate.length > 0) {
                    offspringIndexInWillUpdate = this.engine.getIndexOfUpdatingEntity(offspring, relocatedEntities.willUpdate);
                    if (offspringIndexInWillUpdate > -1) {
                        relocatedEntities.willUpdate.splice(offspringIndexInWillUpdate, 1);
                    }
                }

                /*calculate new position of offspring of relation & offspring.triggerRearrangement*/
                switch (offspring.division) {
                    case 'point':
                        newPosition = this.engine.calculatePointPosition(this);
                        offspring.triggerRearrangement(genesis, newPosition, dx, dy, relocatedEntities, forceDrawing);
                        break;

                        /*marking relation's offspring is shape*/
                    case 'shape':
                    case 'interior':
                        offspring.update(genesis, this.getSource(0), newPosition, dx, dy, relocatedEntities, forceDrawing);
                        break;

                    case 'image':
                        source = this.getSource(0);
                        offspring.update(genesis, source, newPosition, dx, dy, relocatedEntities, forceDrawing);
                        break;
                }

            }, this);
        },

        "setOperation": function(operation) {
            this._operation = operation;
            this.setOperationOffspring();
        },

        "setOperationOffspring": function() {
            this._operation.offspring = this;
        },

        "toString": function() {
            return 'Relation ' + this.id;
        },

        "allPointsSerene": function() {
            if (this.anchor && this.anchor.getStateOfMind() === 'restless') {
                return false;
            }
            var i = 0;
            while (i < this.sources.length) {
                if (this.sources[i].division === 'point' && this.sources[i].getStateOfMind() === 'restless') {
                    return false;
                }
                i++;
            }
            return true;
        },

        "setEngine": function(engine) {
            this.engine = engine;
            this._universe = engine;
        },

        "getSource": function(index) {
            return this.sources[index];
        },

        "getSourceCount": function() {
            return this.sources.length;
        },

        "getAnchor": function() {
            return this.anchor;
        },

        "moveRelatives": function(updateData) {

            /*
            Logic of this function:
            There are two types of ripple progression.

            One way transferable and two way transferable

            One way:
            points to shape. If point moves shape is updated. Progression complete.
            If shape moves... point can not be always located...progression not possible
            if shape moves with tracked delta... point can be shifted with the same delta...progression complete

            Two way:
            Source or Anchor point moves... offspring position is calculated...progression complete
            offspring moves... source point is calculated..progression complete

            */
            var DgtRelation = MathUtilities.Tools.Dgt.Models.DgtRelation,
                target, moveTarget, looper, mentor,
                i, positions, pointCount = 0,
                source,
                gridPosition, DgtPoint = MathUtilities.Tools.Dgt.Models.DgtPoint,
                newPositionOfTarget, reverseSeed, sourceCount, sourcePosition,
                updateDataObject,
                genesis = updateData.genesis,
                caller = updateData.caller,
                newPosition = updateData.newPosition,
                dx = updateData.dx,
                dy = updateData.dy,
                relocatedEntities = updateData.relocatedEntities,
                forceDrawing = updateData.forceDrawing,
                modifyAttributes = updateData.modifyAttributes,
                inputReferenceMentor, params, updateCreatorParams,
                DgtObject = MathUtilities.Tools.Dgt.Models.DgtObject;

            if (!relocatedEntities) {
                relocatedEntities = [];
            }
            if (relocatedEntities.indexOf(this) > -1) {
                return;
            }

            if (this.offspring) {
                target = DgtRelation.getTargetShiftRole(this, caller);
                if (!target) {
                    return;
                }

                moveTarget = target === 'source' ? this.getSource(0) : this[target];

                if (relocatedEntities.indexOf(moveTarget) > -1 ||
                    forceDrawing & this.TRAVEL_WARP && !moveTarget._universe) {
                    return;
                }

                if (relocatedEntities.willUpdate) {
                    if (target === 'offspring') {
                        for (looper in this.sources) {
                            source = this.sources[looper];
                            if (relocatedEntities.willUpdate.indexOf(source) > -1 && relocatedEntities.indexOf(source) === -1 && source !== genesis) {
                                return;
                            }
                        }
                        if (this.anchor && relocatedEntities.willUpdate.indexOf(this.anchor) > -1 && relocatedEntities.indexOf(this.anchor) === -1 && this.anchor !== genesis) {
                            return;
                        }
                        for (looper in this._params) {
                            mentor = this._params[looper];
                            if (mentor.division && mentor.getCreationMethod() !== 'pointOnObject' && relocatedEntities.willUpdate.indexOf(mentor) > -1 && relocatedEntities.indexOf(mentor) === -1) {
                                return;
                            }
                        }

                    } else if (target === 'source' && relocatedEntities.willUpdate.indexOf(this.offspring) > -1 && relocatedEntities.indexOf(this.offspring) === -1 && this.offspring !== genesis) {
                        return;
                    }
                }
                updateDataObject = DgtObject.createUpdateData();
                updateDataObject.genesis = genesis;
                updateDataObject.caller = caller;
                updateDataObject.newPosition = newPosition;
                updateDataObject.dx = dx;
                updateDataObject.dy = dy;
                updateDataObject.relocatedEntities = relocatedEntities;
                updateDataObject.forceDrawing = forceDrawing;
                updateDataObject.modifyAttributes = modifyAttributes;
                // check if we need to update params of numeric iterations
                if (modifyAttributes) {
                    updateCreatorParams = modifyAttributes.indexOf('changeParams') > -1;
                    params = this.getParams();
                    if (params) {
                        inputReferenceMentor = params.inputReferenceMentor;
                    }
                }
                // update params of numeric iterations if mentor is updated...
                if (updateCreatorParams && inputReferenceMentor && this.species === 'calculation') {
                    this.updateMenteeParamsForIteration(this.offspring, inputReferenceMentor.creator);
                }

                relocatedEntities.push(this);

                //point to point relations only
                //shape to point case in handled in case of offspring division is shape & moveTarget is source

                switch (this.offspring.division) {
                    case 'point':
                        //For intersection
                        if (moveTarget.species === 'point') {
                            newPositionOfTarget = this.engine.calculatePointPosition(this, caller, newPosition, target);
                            updateDataObject.newPosition = newPositionOfTarget;
                            if (this.engine._undergoingOperation) {
                                moveTarget.triggerRearrangement(updateDataObject);
                            } else {
                                if (isNaN(newPositionOfTarget[0]) || isNaN(newPositionOfTarget[1])) {
                                    moveTarget.changeObjectVisibility(false, moveTarget.INVALID);
                                } else {
                                    moveTarget.changeObjectVisibility(true, moveTarget.INVALID);
                                    moveTarget.triggerRearrangement(updateDataObject);
                                }

                            }
                        } else if (['shape', 'interior'].indexOf(moveTarget.division) > -1 && this.species !== 'pointOnObject' && !this.engine.isStandardObject(moveTarget)) {
                            sourceCount = this.getSourceCount();
                            for (i = 0; i < sourceCount; i++) {
                                source = this.getSource(i);
                                reverseSeed = source.shiftSeedBy(dx, dy);
                                updateDataObject.seed = reverseSeed;
                                source.setSeed(updateDataObject);
                            }
                        }
                        break;
                    case 'iteration':
                    case 'measurement':
                    case 'marking':
                    case 'notation':
                        if (target === 'offspring') {
                            this.offspring.update(updateDataObject);
                        }
                        //No need to update parent here.
                        break;

                    case 'image':
                        if (target === 'offspring') {
                            this.offspring.update(updateDataObject);
                        } else {
                            //in no case moveTarget will not be image... so assuming
                            reverseSeed = moveTarget.getTransformedMatrix(this, target);
                            updateDataObject.seed = reverseSeed;
                            moveTarget.setImageSeed(updateDataObject);
                        }
                        break;

                    case 'shape':
                    case 'interior':
                        if (target === 'offspring') {
                            this.offspring.update(updateDataObject);
                        } else {
                            //target is source
                            if (['shape', 'interior'].indexOf(moveTarget.division) > -1 && !this.engine.isStandardObject(moveTarget)) {
                                if (!(forceDrawing & this.TRAVEL_TEST)) {
                                    reverseSeed = this.offspring.getReverseSeed();
                                    updateDataObject.seed = reverseSeed;
                                }
                                moveTarget.setSeed(updateDataObject);
                            } else {
                                //Changing sources of a shape according to the seed
                                /*
                                WORD OF WISDOM:

                                When you come to a condition where you are moving the sources of an original shape,
                                the star alignment is such that you can simply trigger a wave on the source point,
                                while blocking the backfire by adding the shape in relocatedEntities, the trigger on the source
                                will always travel in one direction. You don't have to worry if the points are going to be interrelated,
                                cause if they were this condition would have been avoided by a higher power.
                                This is avoided by the prison system. If this is was to have entities which will lead to a lock,
                                then this would have been caught in the prison logic, if the shape was in prison,
                                then you will not be here.

                                Check 'Shape Complicated Example' from GSP Samples.

                                */

                                positions = this.offspring.getPositionSeed();
                                sourceCount = this.getSourceCount();

                                for (i = 0; i < sourceCount; i++) {
                                    source = this.getSource(i);

                                    if (source.division === 'point' && !(forceDrawing & this.TRAVEL_TEST)) {
                                        /*
                                        seed of shape contains 2 points... so when we have to position more than 2 sources seed cannot be used.
                                        For such cases, dx, dy is used to move all sources by that much distance...
                                        Example... : reposition source points of angle bisector (when angle bisector is not in prison)
                                        */
                                        if (sourceCount > 2 && this.species !== 'polygonInterior') {
                                            sourcePosition = source.equation.getPoints()[0];
                                            gridPosition = [sourcePosition[0] + dx, sourcePosition[1] + dy];
                                        } else {
                                            gridPosition = [positions[pointCount * 2], positions[pointCount * 2 + 1]];
                                        }
                                        DgtPoint.hackPointPosition(source, gridPosition, this.engine.grid._getCanvasPointCoordinates(gridPosition));
                                        pointCount++;
                                    }
                                    relocatedEntities.push(this.offspring);
                                    if (source.division === 'point') {
                                        updateDataObject.newPosition = null;
                                        source.triggerRearrangement(updateDataObject);
                                    }
                                }
                            }
                        }
                }

                this.trigger('spouseRelocated');
            }
        },

        "_getParamData": function() {
            var paramData = {},
                keys, curParam;

            for (keys in this._params) {
                curParam = this._params[keys];
                if (curParam.division !== 'marking' && curParam.division !== 'measurement') { //direct values
                    paramData[keys] = curParam;
                } else {
                    switch (keys) {
                        case 'angle':
                        case 'r':
                        case 'dx':
                        case 'dy':
                        case 'depth':
                            paramData[keys] = {
                                "division": curParam.division,
                                "id": curParam.id
                            };
                            break;
                        case 'dilate':
                        case 'ratio':
                            paramData.ratio = {
                                "division": curParam.division,
                                "id": curParam.id
                            };
                            break;
                    }
                }
            }

            return paramData;
        },

        "_setParamData": function(paramData) {
            var keys, mentor;
            if (!this._params) {
                this._params = {};
            }
            for (keys in paramData) {
                if (paramData[keys].division) {
                    mentor = this.engine.getEntityFromId(paramData[keys].id);
                    this._params[keys] = mentor;
                    if (mentor.setMenteeRelation) {
                        mentor.setMenteeRelation(this);
                    } else {
                        mentor._menteeRelations.push(this);
                    }
                } else { //direct values
                    this._params[keys] = paramData[keys];
                }
            }
        },

        "getData": function() {
            var relationJson = {
                    "id": this.id,
                    "_params": this._getParamData(),
                    "_paramValues": this._paramValues,
                    "anchor": this.anchor ? this.anchor.id : null,
                    "offspring": this.offspring.id,
                    "sources": [],
                    "species": this.species,
                    "division": this.division,
                    "type": this.type,
                    "serialNumber": this.serialNumber
                },
                i;
            relationJson.propertiesForOffspring = {
                "color": this.offspring.properties.color
            };
            for (i = 0; i < this.sources.length; i++) {
                relationJson.sources[i] = this.sources[i].id;
            }

            if (this.labelIdol) {
                relationJson.labelIdol = this.labelIdol;
            }
            return relationJson;
        },

        "setData": function(relationJson, engine) {
            var sources, sourceId, i, offspringEqLabelData, input, inputReference = relationJson._params.inputReference,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                tempOffset, THRESHOLD_VALUE = 1e-8;
            this.id = relationJson.id;

            this.setEngine(engine);
            DgtEngine.restoreKind = DgtEngine.ACTION_SAVE_RESTORE;
            sources = [];
            this.species = relationJson.species;
            this.init(this.species, this.engine, relationJson.params);
            this.type = relationJson.type;
            if (!isNaN(relationJson.serialNumber)) {
                this.serialNumber = relationJson.serialNumber;
            }
            this.propertiesForOffspring = relationJson.propertiesForOffspring;
            if (relationJson.anchor) {
                this.addSpouse(this.engine.getEntityFromId(relationJson.anchor));
            }

            for (input in inputReference) {
                if (typeof inputReference[input] === 'number') {
                    inputReference[input] = inputReference[input].toString();
                }
            }

            this._setParamData(relationJson._params);

            this.offspringId = relationJson.offspring;
            if (relationJson.sources.length === 0) {
                this.addSpouse(); //for calculation without sources.
            }
            for (i = 0; i < relationJson.sources.length; i++) {
                sourceId = relationJson.sources[i];
                sources[i] = this.engine.getEntityFromId(sourceId);
                this.addSpouse(sources[i]);
                DgtEngine.restoreKind = DgtEngine.ACTION_SAVE_RESTORE;
                //extra check since iteration has no equation
                if (sources[i].equation) {
                    sources[i].equation.isSaveRestoreData = false;
                }
            }
            if (relationJson.labelIdol) {
                this.labelIdol = relationJson.labelIdol;
            }
            this.offspring.id = relationJson.offspring;
            if (this.offspring.properties.locked === true) {
                this.offspring.setProperty('locked', true); // to set draggable false.
                if (this.engine.locked.indexOf(this.offspring) === -1) {
                    this.engine.locked.push(this.offspring);
                }
            }
            if (this.offspring.division === 'marking' && DgtEngine.restoreKind) {
                this.engine.acknowledgeEntity(this.offspring, this._universe);
            }

            if (this.offspring.equation && this.offspring.equation.getLabelData()) {
                offspringEqLabelData = this.offspring.equation.getLabelData();
                offspringEqLabelData.isSaveRestoreData = false;
            }

            if (this.species === 'pointOnObject') {
                tempOffset = MathUtilities.Tools.Dgt.Models.DgtShape.getOffsetForPointOnShape(this.sources[0].species,
                    this.offspring.equation.getPoints()[0], this.sources[0].seed);
                if (Math.abs(relationJson._params.offset - tempOffset) > THRESHOLD_VALUE) {
                    relationJson._params.offset = tempOffset;
                    this._setParamData(relationJson._params);
                }
            }

            DgtEngine.restoreKind = null;
            if (!this._universe) {
                this.engine.acknowledgeRelation(this);
            }
        },

        "init": function(species, engine, params, universe) {
            var natureMap = MathUtilities.Tools.Dgt.Models.DgtRelation.natureMap,
                key, DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            this.engine = engine;
            this.species = species;

            this._universe = universe;
            for (key in params) {
                this._params[key] = params[key];
            }

            if ((!DgtEngine.restoreKind || this.engine._undergoingOperation) && !this.id) {
                this.id = DgtEngine.getIdForEntity(this);
                DgtEngine.entityCount.relationShips++;
            }

            if (isNaN(this.serialNumber)) {
                this.serialNumber = DgtEngine.allEntitiesCount.serialNumber;
                DgtEngine.allEntitiesCount.serialNumber++;
            }

            for (key in natureMap) {
                if ($.inArray(this.species, natureMap[key]) > -1) {
                    this.nature = key;
                    break;
                }
            }
            this._expectation = MathUtilities.Tools.Dgt.Models.DgtOperation._relationRequirementMap[species];
        },

        "getAnchorOrSourceIndex": function(entity) {
            if (this.anchor === entity) {
                return 0;
            }
            return this.sources.indexOf(entity) + 1;
        },
        "getBinaryMappingOfParent": function(parent) {
            return Math.pow(2, this.getAnchorOrSourceIndex(parent) + 20); // 20 is offset for binary mapping.
        },

        "isAnchorNeeded": function() {
            if (this._expectation) {
                return this._expectation.indexOf('_') > 0;
            }
        },

        "updateRelationCode": function() {
            var codeName = '',
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                i, expectedCode, sources = [],
                key;
            if (['calculation', 'polygonInterior'].indexOf(this.species) > -1) {
                if (!this._params.noOfSources) {
                    for (key in this._params.sources) {
                        if (sources.indexOf(key) === -1) {
                            sources.push(key);
                        }
                        this._params.noOfSources = sources.length;
                    }
                }
                if (this.sources.length === this._params.noOfSources) {
                    this._maturityFlag = true;
                }
                return;
            }
            if (this.anchor) {
                codeName += DgtOperation._drawableMapping[this.anchor.species];
            }
            codeName += '_';
            if (this.sources.length > 0) {
                for (i = 0; i < this.sources.length; i++) {
                    codeName += DgtOperation._drawableMapping[this.sources[i].species];
                }
            }
            this.relationCode = codeName;

            expectedCode = DgtOperation._relationRequirementMap[this.species];
            this._maturityFlag = DgtOperation.matchExpectationCode(this.relationCode, expectedCode, DgtOperation.isAnchoredRelation(this.species));
        },

        "isMature": function() {
            return this._maturityFlag;
        },

        "isPartOfThisRelation": function(point) {
            if (point) {
                return this.anchor === point || this.sources.indexOf(point) > -1 || this.offspring === point;
            }
            return false;
        },

        "addSource": function(source) {
            var measurement,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            if (this._incinerated) {
                return;
            }
            if (source) {
                source = this.engine.getEntityFromId(source);
                this.sources.push(source);
                source.involveInRelation(this);
            }
            this.updateRelationCode();
            if (this.isMature()) {
                if (DgtEngine.restoreKind) {
                    measurement = this.engine.getEntityFromId(this.offspringId);
                } else {
                    measurement = new MathUtilities.Tools.Dgt.Models.DgtMeasurement();
                }
                measurement.creator = this;
                measurement.species = this.species;
                this.offspring = measurement;
            }
        },

        //Removes all the sources of a relationship
        "removeAllSources": function() {
            var sources = this.sources;

            while (sources.length > 0) {
                sources.pop().forgetRelation(this);
            }
            //Make it immature after removing all sources.
            this._maturityFlag = false;
        },

        "addCroppingProperties": function(allowTransformation, updatedRelations) {
            if (updatedRelations && $.inArray(this, updatedRelations) >= 0) {
                return;
            }

            var offspringImage, ctr, source, sourcesCount, childrenRelationsLength;

            updatedRelations.push(this);

            sourcesCount = this.getSourceCount();
            for (ctr = 0; ctr < sourcesCount; ctr++) {
                source = this.getSource(ctr);
                if (source.isCropped === true && this !== updatedRelations[0]) {
                    updatedRelations[0].offspring.isChained = true;
                }
                source.allowTransformation = allowTransformation;

                if (source.creator) {
                    source.creator.addCroppingProperties(allowTransformation, updatedRelations);
                }
                if (source._childrenRelationships && source._childrenRelationships.length > 0) {
                    childrenRelationsLength = source._childrenRelationships.length;
                    for (ctr = 0; ctr < childrenRelationsLength; ctr++) {
                        offspringImage = source._childrenRelationships[ctr].offspring;
                        offspringImage.allowTransformation = allowTransformation;
                        if (offspringImage.isCropped === true && this !== updatedRelations[0]) {
                            updatedRelations[0].offspring.isChained = true;
                        }
                        source._childrenRelationships[ctr].addCroppingProperties(allowTransformation, updatedRelations);
                    }
                }
            }
            if (this.offspring.isCropped === true && this !== updatedRelations[0]) {
                updatedRelations[0].offspring.isChained = true;
            }

            if (this.offspring.creator) {
                this.offspring.creator.addCroppingProperties(allowTransformation, updatedRelations);
            }
            if (this.offspring._childrenRelationships && this.offspring._childrenRelationships.length > 0) {
                childrenRelationsLength = this.offspring._childrenRelationships.length;
                for (ctr = 0; ctr < childrenRelationsLength; ctr++) {
                    this.offspring._childrenRelationships[ctr].addCroppingProperties(allowTransformation, updatedRelations);
                }
            }

            this.offspring.allowTransformation = allowTransformation;
        },

        "updateRelationParams": function(params) {
            var offspring = this.offspring,
                division = offspring.division,
                updateDataObject;
            this._params = params;
            if (division === 'point') {
                offspring.findDerivedPointPosition();
            } else {
                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                offspring.update(updateDataObject);
                if (division === 'iteration' && typeof params.depth === 'object') {
                    offspring.follow(params.depth);
                }
            }
            this.engine.grid.refreshView();
        },

        "addSpouse": function(spouse) {
            if (!spouse && this.species !== 'calculation') {
                return;
            }
            if (typeof spouse === 'string') {
                spouse = this.engine.getEntityFromId(spouse);
            }
            if (this._incinerated ||
                this.isPartOfThisRelation(spouse)) {
                return;
            }
            //In case of interior it should not return even if relation is mature.
            if (this.isMature() && (this.species !== 'polygonInterior' && this.species !== 'constructInterior' && this.species !== 'iterate')) {
                return;
            }

            var offspringType, offspringDataSpecie, imageCanvasPosition,
                relationCount, updatedRelations = [],
                ctr,
                DgtRelation = MathUtilities.Tools.Dgt.Models.DgtRelation,
                offspringData, shape, measurement, point, marking, interior, image, notation,
                source, sourcesCount, sourceCtr, sourceSpecie, sourceConstant, endPoints = [],
                params, points = [],
                PRECISION_LENGTH = 11,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                cropRectTopLeft, cropRectBottomRight, sourceImageRaster, croppedImageRaster, iteration,
                originalImagePosition, croppedImagePosition, offsetX, offsetY, canvasOffset = {},
                positionGraphCoords,
                updateDataObject;

            if (!this.anchor && this.isAnchorNeeded()) {
                this.anchor = spouse;
                this.updateRelationCode();
            } else {
                if (spouse) {
                    this.sources.push(spouse);
                }
                this.updateRelationCode();

                if (!this.offspring && this.isMature()) {
                    //......:: if all points satisfied create new Shape

                    //considering relation is matured by last added spouse and will always be source
                    offspringType = DgtRelation.getRelationOffspringKind(this.species, spouse);
                    offspringData = DgtRelation.getShapeOffspringData(this.species, this.sources);
                    this.offspringData = offspringData;
                    offspringDataSpecie = offspringData.specie;

                    if (['measureAngle', 'markAngle', 'angleBisector'].indexOf(offspringDataSpecie) > -1) {
                        sourceSpecie = this.getSource(0).species;
                        if (['segment', 'ray', 'line'].indexOf(sourceSpecie) > -1) {
                            source = this.sources;
                            sourcesCount = source.length;
                            for (sourceCtr = 0; sourceCtr < sourcesCount; sourceCtr++) {
                                sourceConstant = source[sourceCtr].equation.getConstants();
                                endPoints.push([Number(sourceConstant.x1.toString().substring(0, sourceConstant.x1.toString().indexOf('.') + PRECISION_LENGTH)),
                                    Number(sourceConstant.y1.toString().substring(0, sourceConstant.y1.toString().indexOf('.') + PRECISION_LENGTH))
                                ], [Number(sourceConstant.x2.toString().substring(0, sourceConstant.x2.toString().indexOf('.') + PRECISION_LENGTH)),
                                    Number(sourceConstant.y2.toString().substring(0, sourceConstant.y2.toString().indexOf('.') + PRECISION_LENGTH))
                                ]);
                            }

                            points[0] = {
                                "x": endPoints[0][0],
                                "y": endPoints[0][1]
                            };
                            points[1] = {
                                "x": endPoints[1][0],
                                "y": endPoints[1][1]
                            };
                            points[2] = {
                                "x": endPoints[2][0],
                                "y": endPoints[2][1]
                            };
                            points[3] = {
                                "x": endPoints[3][0],
                                "y": endPoints[3][1]
                            };

                            if (points[0].x === points[2].x && points[0].y === points[2].y || DgtEngine.comparePointsWithThreshold(points[0], points[2])) {
                                params = {
                                    "orderOfPointsToFindAngle": [1, 0, 1]
                                };
                            } else if (points[0].x === points[3].x && points[0].y === points[3].y || DgtEngine.comparePointsWithThreshold(points[0], points[3])) {
                                params = {
                                    "orderOfPointsToFindAngle": [1, 0, 0]
                                };
                            } else if (points[1].x === points[2].x && points[1].y === points[2].y || DgtEngine.comparePointsWithThreshold(points[1], points[2])) {
                                params = {
                                    "orderOfPointsToFindAngle": [0, 1, 1]
                                };
                            } else if (points[1].x === points[3].x && points[1].y === points[3].y || DgtEngine.comparePointsWithThreshold(points[1], points[3])) {
                                params = {
                                    "orderOfPointsToFindAngle": [0, 1, 0]
                                };
                            }
                            this._params = params;
                        }
                    }

                    switch (offspringType) {
                        case 'shape':
                            if (DgtEngine.restoreKind) {
                                shape = this.engine.getEntityFromId(this.offspringId);
                                shape.creator = this;
                            } else {
                                shape = new MathUtilities.Tools.Dgt.Models.DgtShape({
                                    "universe": this._universe
                                });
                                shape.creator = this;
                                shape.init(offspringData.specie, this.engine);
                            }

                            shape.aptitude = 'd';
                            shape.setCreationMethod(offspringData.creationMethod);
                            this.offspring = shape;
                            this.inheritPropertiesFromSource();
                            shape.setProperties(this.propertiesForOffspring);
                            //set properties first so that they can be used in update
                            updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                            shape.update(updateDataObject);

                            this.engine.plotter.addEquation(this.offspring.equation);
                            if (!DgtEngine.restoreKind) {
                                if (offspringData.creationMethod === 'axis') {
                                    this.engine.acknowledgeEntity(shape, this.engine._standardObjectIds);
                                } else {
                                    this.engine.acknowledgeEntity(shape, this._universe);
                                }
                            }

                            this.checkForDottedOverlappedShapes();

                            break;
                        case 'measurement':
                            if (DgtEngine.restoreKind) {
                                measurement = this.engine.getEntityFromId(this.offspringId);
                                measurement.creator = this;
                            } else {
                                measurement = new MathUtilities.Tools.Dgt.Models.DgtMeasurement({
                                    "universe": this._universe
                                });
                                //creator to be set before init.
                                measurement.creator = this;
                                measurement.init(this.species, this.engine);
                            }

                            measurement.setCreationMethod(offspringData.creationMethod);
                            measurement.aptitude = 'd';
                            this.offspring = measurement;
                            //should be before view is created
                            if (!DgtEngine.restoreKind) {
                                this.engine.acknowledgeEntity(measurement, this._universe);
                            }
                            new MathUtilities.Tools.Dgt.Views.DgtMeasurement({
                                "model": measurement
                            });
                            //should be after view is created.
                            this.inheritPropertiesFromSource();
                            measurement.setProperties(this.propertiesForOffspring);
                            //set properties first so that they can be used in update
                            if (this.species === 'measureIteration') {
                                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                                measurement.update(updateDataObject);
                            } else {
                                measurement.renderMeasurement(this.species, this.engine, this.species, this._params);
                            }

                            break;
                        case 'marking':
                            if (DgtEngine.restoreKind) {
                                marking = this.engine.getEntityFromId(this.offspringId);
                            } else {
                                marking = new MathUtilities.Tools.Dgt.Models.DgtMarking({
                                    "universe": this._universe
                                });
                            }
                            marking.creator = this;
                            this.offspring = marking;
                            marking.initialiseMarking(this.engine, this.species);
                            if (!DgtEngine.restoreKind) {
                                this.engine.acknowledgeEntity(marking, this._universe);
                            }
                            break;
                        case 'interior':
                            if (this.sources[0].division === 'shape' || ['rotate', 'dilate', 'translate', 'reflect'].indexOf(this.species) > -1 ||
                                this.getParams().noOfSources === this.sources.length) {

                                if (DgtEngine.restoreKind) {
                                    interior = this.engine.getEntityFromId(this.offspringId);
                                    interior.creator = this;
                                } else {
                                    interior = new MathUtilities.Tools.Dgt.Models.DgtInterior({
                                        "universe": this._universe
                                    });
                                    interior.creator = this;
                                    interior.init(offspringData.specie, this.engine);
                                }
                                this.offspring = interior;
                                interior.setCreationMethod(offspringData.creationMethod);
                                interior.isAMaturedRelation = true;
                                this.inheritPropertiesFromSource();
                                interior.setProperties(this.propertiesForOffspring);
                                //set properties first so that they can be used in update
                                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                                interior.update(updateDataObject);

                                interior.engine.plotter.addEquation(interior.equation);
                                if (!DgtEngine.restoreKind) {
                                    this.engine.acknowledgeEntity(interior, this._universe);
                                }
                            }

                            break;
                        case 'iterate':
                            if (this._params.map.preImage.length === this.sources.length) {
                                if (DgtEngine.restoreKind) {
                                    iteration = this.engine.getEntityFromId(this.offspringId);
                                } else {
                                    iteration = new MathUtilities.Tools.Dgt.Models.DgtIteration();
                                }
                                iteration.init('iteration', this.engine);
                                iteration.creator = this;

                                this.offspring = iteration;
                                iteration.setProperties(this.propertiesForOffspring);
                                if (!DgtEngine.restoreKind) {
                                    iteration.generateFirstMap();
                                    this.engine.acknowledgeEntity(iteration);
                                }
                            }
                            break;

                        case 'image':
                            offspringData = DgtRelation.getShapeOffspringData(this.species, this.sources);
                            if (DgtEngine.restoreKind) {
                                image = this.engine.getEntityFromId(this.offspringId);
                                if (!image.data && ['translate', 'rotate', 'dilate', 'reflect'].indexOf(offspringData.creationMethod) > -1) {
                                    imageCanvasPosition = this.engine.grid._getCanvasPointCoordinates([spouse.x, spouse.y]);
                                    image.initiateImage(this.engine, spouse.data, [imageCanvasPosition[0], imageCanvasPosition[1], 0, 0]);
                                }
                            } else {
                                image = new MathUtilities.Tools.Dgt.Models.DgtImage({
                                    "universe": this._universe
                                });

                                if (offspringDataSpecie === 'cropImage') {

                                    this.engine.grid._paperScope.activate();
                                    this.engine.grid._projectLayers.imageLayer.activate();

                                    cropRectTopLeft = this._params.cropRectTopLeft;
                                    cropRectBottomRight = this._params.cropRectBottomRight;

                                    sourceImageRaster = spouse.equation.getRaster();
                                    croppedImageRaster = sourceImageRaster.getSubRaster(cropRectTopLeft, cropRectBottomRight);

                                    image.base64 = croppedImageRaster.toDataURL();
                                    croppedImageRaster._image = {};
                                    croppedImageRaster._image.src = image.base64;

                                    originalImagePosition = sourceImageRaster.position;
                                    croppedImagePosition = croppedImageRaster.position;

                                    offsetX = originalImagePosition.x - croppedImagePosition.x;
                                    offsetY = originalImagePosition.y - croppedImagePosition.y;
                                    canvasOffset = {
                                        "dx": offsetX,
                                        "dy": offsetY
                                    };

                                    this._params.canvasOffset = canvasOffset;

                                    imageCanvasPosition = [croppedImagePosition.x, croppedImagePosition.y];

                                    positionGraphCoords = this.engine.grid._getGraphPointCoordinates(imageCanvasPosition);

                                    image.equation.setRaster(croppedImageRaster);

                                    image.equation.setPoints([positionGraphCoords]);

                                    image.equation.setParent(image);

                                    image.initiateImage(this.engine, spouse.base64, [imageCanvasPosition[0], imageCanvasPosition[1], 0, 0], true);
                                } else {
                                    imageCanvasPosition = this.engine.grid._getCanvasPointCoordinates([spouse.x, spouse.y]);
                                    image.initiateImage(this.engine, spouse.data, [imageCanvasPosition[0], imageCanvasPosition[1], 0, 0]);
                                }
                            }

                            image.setCreationMethod(offspringData.creationMethod);
                            image.creator = this;
                            this.offspring = image;

                            if (offspringDataSpecie !== 'cropImage') {
                                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                                image.update(updateDataObject);
                            } else {
                                image.isCropped = true;
                                image.allowTransformation = false;

                                spouse.changeObjectVisibility(false, spouse.HIDECROPPINGSOURCEIMAGE);

                                if (spouse.creator !== void 0) {
                                    this.addCroppingProperties(false, updatedRelations);
                                }
                                updatedRelations = [];
                                updatedRelations.push(this);
                                if (spouse._childrenRelationships !== void 0 && spouse._childrenRelationships.length > 0) {
                                    relationCount = spouse._childrenRelationships.length;
                                    for (ctr = 0; ctr < relationCount; ctr++) {
                                        spouse._childrenRelationships[ctr].addCroppingProperties(false, updatedRelations);
                                    }
                                }
                            }

                            //initiateImage not required even in case of restoring image in undo-redo

                            break;
                        case 'notation':
                            if (DgtEngine.restoreKind) {
                                notation = this.engine.getEntityFromId(this.offspringId);
                            } else {
                                notation = new MathUtilities.Tools.Dgt.Models.DgtNotation({
                                    "universe": this._universe
                                });
                            }

                            notation.init(offspringData.specie, this.engine);
                            this.offspring = notation;
                            notation.creator = this;
                            notation.setCreationMethod(offspringData.creationMethod);
                            notation.setProperties(this.propertiesForOffspring);
                            updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                            notation.update(updateDataObject);

                            notation.setLocusOfNotation();

                            if (!DgtEngine.restoreKind) {
                                this.engine.acknowledgeEntity(notation, this._universe);
                            }
                            break;
                        default:
                            if (DgtEngine.restoreKind) {
                                point = this.engine.getEntityFromId(this.offspringId);
                            } else {
                                point = new MathUtilities.Tools.Dgt.Models.DgtPoint({
                                    "universe": this._universe
                                });
                            }
                            point.creator = this;
                            point.setEngine(this.engine);
                            point.setStateOfMind('serene');

                            point.setCreationMethod(offspringData.creationMethod);
                            this.offspring = point;
                            if (!DgtEngine.restoreKind) {
                                this.inheritPropertiesFromSource();
                                point.setProperties(this.propertiesForOffspring);
                            }
                            if (!point.species === 'terminalPoint' || !DgtEngine.restoreKind) { // No need to find position in case of restore since iteration is yet to be acknowledged.
                                point.findDerivedPointPosition();
                            }
                            this.engine.addPointToPlot(point);
                            point.setLocusOfPoint();
                            if (!DgtEngine.restoreKind) {
                                this.engine.acknowledgeEntity(point, this._universe);
                            }
                    }
                } else {
                    //drawing interior along with drawing polygon
                    if (this.species === 'polygonInterior' && this.offspring) {
                        updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                        this.offspring.update(updateDataObject);
                    }
                }
            }
            //shifted out because now even the relations with anchors can be drawn
            if (spouse && spouse.division === 'point' && spouse.getStateOfMind() === 'restless') {
                spouse.on('settled', this._onSpouseSettle);
            }
            if (spouse) {
                spouse.involveInRelation(this);
            }
            if (this.offspring && this._universe) {
                this.offspring._universe = this._universe;
                if (this.offspring.updateGrowthPhase) {
                    this.offspring.updateGrowthPhase();
                }
            }
        },

        "inheritPropertiesFromSource": function() {
            if (this.sources.length === 1 && this.offspring.species === this.sources[0].species &&
                this.propertiesForOffspring && !this.propertiesForOffspring.color && this.sources[0].properties.color !== this.sources[0].restlessColor) {
                this.propertiesForOffspring.color = this.sources[0].properties.color;
            }
        },
        "getCreationMethod": function() {
            return this.offspringData ? this.offspringData.creationMethod : null;
        },

        /*returns marking stored when it was used for relation*/
        "getMentorMarking": function() {
            var params = this._params,
                keys, mentorMarkings = [],
                DgtRelation = MathUtilities.Tools.Dgt.Models.DgtRelation;

            for (keys in params) {
                if (keys === 'depth' || !params[keys]) {
                    continue;
                }
                if (DgtRelation.mentorableDivisions.indexOf(params[keys].division) > -1 && $.inArray(params[keys], mentorMarkings) === -1) {
                    mentorMarkings.push(params[keys]);
                }
            }
            return mentorMarkings;
        },

        "getParams": function() {
            return this._params;
        },
        // Update iteration relation params if mentor is updated...
        "updateMenteeParamsForIteration": function(menteeObject, mentorRelation) {
            var key,
                objectIndexInInputReference,
                block, cast, mapping,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                mentorParams = DgtEngine.cloneObject(mentorRelation.getParams()),
                params = DgtEngine.cloneObject(this.getParams());

            for (key in mentorParams) {
                if (key === 'mentorCalculation') {
                    continue;
                }
                params[key] = mentorParams[key];
            }
            objectIndexInInputReference = params.objectIndexInInputReference;

            for (key in objectIndexInInputReference) {
                block = menteeObject.birthdata.block;
                cast = block.cast;
                mapping = cast[params.inputReference[objectIndexInInputReference[key]]];
                if (mapping) {
                    params.inputReference[objectIndexInInputReference[key]] = mapping;
                }
            }
            this._setParamData(params);
        },

        "saveOffsetOfPointOnObject": function(position) {
            var shape = this.sources[0],
                params = this.getParams();
            if (!params) {
                params = {};
            }
            params.offset = MathUtilities.Tools.Dgt.Models.DgtShape.getOffsetForPointOnShape(shape.species, position, shape.seed);
            this._setParamData(params);
        },

        "checkForDottedOverlappedShapes": function(dontConvert) {
            if (this.sources.length < 2 || this._universe && !dontConvert) {
                return;
            }
            var DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                commonRels, i,
                possibleCombinations = ['LSg', 'LR', 'SgSg', 'RSg', 'CrA', 'CpA', 'CsA', 'CmA', 'AA'];

            commonRels = DgtOperation.getCommonRelations(this.sources);
            if (dontConvert) {
                return commonRels;
            }
            for (i = 0; i < commonRels.length; i++) {
                if (commonRels[i] === this || !commonRels[i].offspring) {
                    continue;
                }
                if (possibleCombinations.indexOf(DgtOperation._drawableMapping[commonRels[i].offspring.species] + DgtOperation._drawableMapping[this.offspring.species]) !== -1 &&
                    this.engine._standardObjectIds.shapes.indexOf(commonRels[i].offspring) === -1) {
                    commonRels[i].offspring.setProperty('strokeStyle', 1);
                    commonRels[i].offspring.setStayBelow(this.offspring);
                }
            }
        },

        "getParamValues": function() {
            var params = this._params,
                keys, curParam, paramValues = {};
            for (keys in params) {
                curParam = params[keys];
                if (curParam.division !== 'marking' && curParam.division !== 'measurement') {
                    paramValues[keys] = curParam;
                } else if (curParam.division === 'marking') {
                    switch (keys) {
                        case 'angle':
                            paramValues[keys] = curParam.params.angle;
                            break;
                        case 'dilate':
                        case 'ratio':
                            paramValues.ratio = curParam.params.ratio;
                            break;
                        case 'r':
                        case 'dx':
                        case 'dy':
                            if (curParam.species === 'vector') {
                                paramValues[keys] = curParam.params[keys];
                            } else {
                                paramValues[keys] = curParam.params.distance;
                            }
                            break;
                    }
                } else if (curParam.division === 'measurement') {
                    switch (keys) {
                        case 'angle':
                        case 'r':
                        case 'dx':
                        case 'dy':
                            paramValues[keys] = curParam.value;
                            break;
                        case 'dilate':
                        case 'ratio':
                            paramValues.ratio = curParam.value;
                            break;
                        case 'depth':
                            paramValues[keys] = Math.floor(curParam.value);
                            if (paramValues[keys] < 0) {
                                paramValues[keys] = 0;
                            }
                            break;
                    }
                }
            }
            return paramValues;
        },

        //here we assume that all entities that are passed are part of THIS relationship
        "getRippleEntities": function(entities) {
            if (!entities || entities.length === 0) {
                return void 0;
            }

            var ripple = [],
                wheel, hamster, mentors;
            if (entities.length === 1) {
                if (this.isAnchor(entities[0]) || this.isSource(entities[0]) || this.isMentor(entities[0])) {
                    ripple = [this.offspring];
                } else if (this.isOffspring(entities[0])) {
                    ripple = this.sources.slice();
                }
            } else {
                if (this.anchor && entities.indexOf(this.anchor) === -1) {
                    ripple.push(this.anchor);
                }

                if (entities.indexOf(this.offspring) === -1) {
                    ripple.push(this.offspring);
                }

                //should ripple consist of the other sources??
                //handle the case of shapes where passed entities are one of the sources. in this case the ripple entities should not be the rest of the sources

                mentors = this.getMentorMarking();
                for (wheel in mentors) {
                    hamster = mentors[wheel];
                    if (entities.indexOf(hamster) === -1) {
                        ripple.push(hamster);
                    }
                }
            }

            return ripple;
        },

        "dumpSpouse": function(spouse) {
            if (this.anchor === spouse) {
                this.anchor = null;
            } else if (this.sources.indexOf(spouse) > -1) {
                this.sources.splice(this.sources.indexOf(spouse), 1);
            } else {
                return -1;
            }
            spouse.forgetRelation(this);
            return 1;
        },


        "_onSpouseSettle": null,

        "_onSpouseIncinerate": null,

        "isSource": function(entity) {
            return this.sources.indexOf(entity) > -1;
        },

        "isAnchor": function(entity) {
            return this.anchor === entity;
        },

        "isOffspring": function(entity) {
            return this.offspring === entity;
        },

        "isMentor": function(entity) {
            return $.inArray(entity, this.getMentorMarking()) > -1;
        },

        "replacePoint": function(oldPoint, newPoint) {
            //check for polygon
            var updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData(),
                engine = this.engine,
                willUpdate = [];
            if (this.anchor === oldPoint) {
                this.anchor = newPoint;
            } else if (this.sources.indexOf(oldPoint) > -1) {
                this.sources.splice(this.sources.indexOf(oldPoint), 1, newPoint);

                if ('ontouchstart' in window && engine._undergoingOperation &&
                    engine._undergoingOperation.agents.length > 1) {
                    updateDataObject.relocatedEntities = willUpdate;
                    updateDataObject.forceDrawing = engine.TRAVEL_TEST;
                    newPoint.triggerRearrangement(updateDataObject);

                    updateDataObject.forceDrawing = null;
                    updateDataObject.relocatedEntities = [];
                    updateDataObject.relocatedEntities.willUpdate = willUpdate;
                    newPoint.triggerRearrangement(updateDataObject);
                }

                if (this.species === 'polygonInterior' && this.offspring && this.offspring.isAMaturedRelation) {
                    this.offspring.update(updateDataObject);
                }
            } else {
                return 0;
            }

            oldPoint.forgetRelation(this);
            newPoint.involveInRelation(this);

            if (oldPoint.getStateOfMind() === 'restless') {
                oldPoint.off('settled', this._onSpouseSettle);
                this.updateRelationCode();

                this._onSpouseSettle(newPoint);
            } else {
                newPoint.on('settled', this._onSpouseSettle);
            }

            return 1;
        },


        "incinerate": function() {
            if (this._incinerated) {
                return;
            }
            var i, prop, mentorMarkings;

            this._incinerated = true;
            if (this.offspring) {
                this.offspring.incinerate();
            }

            if (this.anchor) {
                this.anchor.forgetRelation(this);
            }
            if (this.sources) {
                for (i = 0; i < this.sources.length; i++) {
                    this.sources[i].forgetRelation(this);
                }
            }

            if (this.getMentorMarking()) {
                mentorMarkings = this.getMentorMarking();
                for (i = 0; i < mentorMarkings.length; i++) {
                    mentorMarkings[i].off('marking-updated', this._mentorMarkingUpdated);
                    mentorMarkings[i].forgetMenteeRelation(this);
                }
            }

            this.trigger('incinerated', this);
            for (prop in this) {
                if (prop === 'division') {
                    continue;
                }

                delete this[prop];
            }
            this._incinerated = true;
        }

    }, {
        "relationCount": 0,
        "mentorableDivisions": ['measurement', 'marking'],

        "getTargetShiftRole": function(relation, movedParent) {

            if (relation.isSource(movedParent) || relation.anchor === movedParent || relation.isMentor(movedParent)) {
                return 'offspring';
            }
            if (relation.species === 'pointOnObject' || movedParent.division === 'measurement') {
                return void 0;
            }
            return 'source';
        },

        "getRelationOffspringKind": function(relation, source) {
            var measureRegEx = /^measure[\w]*/,
                markRegEx = /^mark[\w]*/;
            if (measureRegEx.test(relation)) {
                return 'measurement';
            }
            if (markRegEx.test(relation)) {
                return 'marking';
            }

            switch (relation) {
                case 'rotate':
                case 'translate':
                case 'dilate':
                case 'reflect':
                    return source.division;

                case 'midpoint':
                case 'intersection':
                case 'pointOnObject':
                case 'isoscelesTriangle':
                case 'equilateralTriangle':
                case 'square':
                case 'rectangle':
                case 'parallelogram':
                case 'pentagon':
                case 'hexagon':
                case 'terminalPoint':
                    return 'point';
                case 'polygonInterior':
                case 'constructInterior':
                case 'circleInterior':
                case 'ellipseInterior':
                case 'arcSegmentInterior':
                    return 'interior';
                case 'calculation':
                    return 'measurement';
                case 'cropping':
                    return 'image';
                case 'tickMark':
                case 'angleMark':
                    return 'notation';

                case 'iterate':
                    return 'iterate';

                default:
                    return 'shape';
            }
        },

        "getShapeOffspringData": function(relation, sources) {
            var specie,
                DgtRelation = MathUtilities.Tools.Dgt.Models.DgtRelation,
                creationMethod, sourceSpecie, sourceDivision;

            switch (relation) {
                case 'rotate':
                case 'translate':
                case 'dilate':
                case 'reflect':
                    specie = sources[0].species;
                    creationMethod = relation;
                    break;

                case 'parallel':
                    specie = 'line';
                    creationMethod = 'parallel';
                    break;

                case 'perpendicular':
                    specie = 'line';
                    creationMethod = 'perpendicular';
                    break;
                case 'perpendicularBisector':
                    specie = 'line';
                    creationMethod = 'perpendicularBisector';
                    break;

                case 'angleBisector':
                    specie = 'ray';
                    sourceSpecie = sources[0].species;
                    if (sourceSpecie === 'point') {
                        creationMethod = 'bisector';
                    } else if (sourceSpecie === 'ray') {
                        creationMethod = 'rayBisector';
                    } else if (sourceSpecie === 'segment') {
                        creationMethod = 'segmentBisector';
                    }
                    break;

                case 'measureAngle':
                    specie = relation;
                    sourceSpecie = sources[0].species;
                    creationMethod = DgtRelation.getCreationMethodForSources(sources, relation);
                    break;

                case 'isoscelesTriangle':
                case 'equilateralTriangle':
                case 'rectangle':
                case 'square':
                case 'parallelogram':
                case 'pentagon':
                case 'hexagon':
                    specie = sources[0].species;
                    creationMethod = 'withPoints';
                    break;

                case 'circleWithRadius':
                    sourceSpecie = sources[1].division;
                    if (sourceSpecie === 'measurement') {
                        specie = 'circle';
                        creationMethod = 'circleWithRadius';
                    } else {
                        specie = 'circle';
                        creationMethod = 'circleWithSegment';
                    }
                    break;

                case 'circleWithPoints':
                    specie = 'circle';
                    creationMethod = 'circleWithPoints';
                    break;

                case 'circleWithMeasurement':
                    specie = 'circle';
                    creationMethod = 'withMeasurement';
                    break;
                case 'arcOnCircle':
                    specie = 'arc';
                    creationMethod = 'withCircle';
                    break;
                case 'circleInterior':
                    specie = 'circleInterior';
                    creationMethod = 'shapeInteriorWithPoints';
                    break;
                case 'ellipseInterior':
                    specie = 'ellipseInterior';
                    creationMethod = 'shapeInteriorWithPoints';
                    break;
                case 'constructInterior':
                case 'polygonInterior':

                    sourceDivision = sources[0].division;
                    sourceSpecie = sources[0].species;
                    if (sourceDivision === 'shape') {
                        creationMethod = 'interiorWithShape';
                        if (sourceSpecie === 'circle') {
                            specie = 'circleInterior';
                        } else if (sourceSpecie === 'ellipse') {
                            specie = 'ellipseInterior';
                        } else {
                            specie = 'arcSegmentInterior';
                        }
                    } else {
                        creationMethod = 'interiorWithPoints';
                        specie = 'polygonInterior';
                    }
                    break;

                case 'midpoint':
                    specie = 'point';
                    creationMethod = relation;
                    break;
                case 'intersection':
                    specie = 'point';
                    creationMethod = DgtRelation.getCreationMethodForSources(sources, relation);
                    break;
                case 'pointOnObject':
                    specie = 'point';
                    creationMethod = relation;
                    break;

                case 'tickMark':
                    specie = 'tickMark';
                    creationMethod = relation;
                    break;

                case 'angleMark':
                    specie = 'angleMark';
                    creationMethod = relation;
                    break;

                case 'cropping':
                    specie = 'cropImage';
                    creationMethod = 'natural';
                    break;
                case 'parabolaDirectrix':
                    specie = 'line';
                    creationMethod = relation;
                    break;
                case 'line':
                    specie = relation;
                    creationMethod = sources[0] === sources[0].engine._standardObjects.center ? 'axis' : 'natural';
                    break;

                default:
                    specie = relation;
                    creationMethod = 'natural';
            }

            return {
                "specie": specie,
                "creationMethod": creationMethod
            };
        },

        "getCreationMethodForSources": function(sources, relation) {
            var creationMethod, specie1, specie2, specieMap;
            switch (relation) {
                case 'angleBisector':
                    if (sources[0].species === 'point') {
                        creationMethod = 'bisector';
                    } else if (sources[0].species === 'ray') {
                        creationMethod = 'rayBisector';
                    }
                    break;
                case 'measureAngle':
                    if (sources[0].species === 'point') {
                        creationMethod = 'measureAngle';
                    } else if (sources[0].species === 'ray') {
                        creationMethod = 'measureRayAngle';
                    } else if (sources[0].species === 'segment') {
                        creationMethod = 'measureSegmentAngle';
                    } else if (sources[0].species === 'angleMark') {
                        creationMethod = 'measureMarkerAngle';
                    }
                    break;


                case 'circleWithRadius':
                    if (sources[0].division === 'measurement') {
                        creationMethod = 'withMeasurement';
                    } else {
                        creationMethod = 'circleWithRadius';
                    }
                    break;

                case 'intersection':
                    specie1 = sources[0].species;
                    specie2 = sources[1].species;
                    specieMap = {
                        "line": "line",
                        "segment": "line",
                        "ray": "line",
                        "circle": "circle",
                        "arc": "circle",
                        "circleInterior": "interior",
                        "ellipseInterior": "interior",
                        "polygonInterior": "interior",
                        "arcSectorInterior": "interior",
                        "arcSegmentInterior": "interior"
                    };
                    if (specieMap[specie1] === 'line' && specieMap[specie2] === 'line') {
                        creationMethod = 'lineIntersection';
                    } else if (specieMap[specie1] === 'line' && specieMap[specie2] === 'circle') {
                        creationMethod = 'lineCircleIntersection';
                    } else if (specieMap[specie1] === 'circle' && specieMap[specie2] === 'circle') {
                        creationMethod = 'circleIntersection';
                    } else if (specieMap[specie1] === 'line' && specieMap[specie2] === 'interior') {
                        creationMethod = 'lineInteriorIntersection';
                    }
                    break;
            }
            return creationMethod;

        }


    });
})(window.MathUtilities);
