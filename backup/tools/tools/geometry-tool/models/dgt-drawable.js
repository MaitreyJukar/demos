/* globals _, $, window, geomFunctions  */
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtDrawable = MathUtilities.Tools.Dgt.Models.DgtObject.extend({
        "creator": null,
        "id": null,
        "visible": null,
        /*
         * type can be segment, polygon,circleWithRadius, circleThroughPoints, parabola, hyperbola, ellipse
         * Document new type if any addition is made
         */
        "division": null, //previously type
        "species": null,
        //free, derived or complicated- this is to decide how to move parents when a translate call is made

        "_childrenRelationships": null,
        "_menteeRelations": null,
        "_children": null,
        "isSaveRestoreData": false,
        "label": null,
        "growthPhase": null,
        "incinerated": null,
        "engine": null,
        "equation": null,
        "_params": null,
        "selectionState": null,
        "_karma": null,
        "_lastSelectedTimestamp": null,
        "_followers": null,
        "_idol": null,
        "_creationMethod": null,

        //link to the universe it belongs to, for normal entities its engine, for iteration, relation in that iteration belongs to the iteration universe.
        //definition of universe here means where does it belong?
        //if undefined means it belongs to engine
        "_universe": null,

        "initialize": function() {

            this.equation = new MathUtilities.Components.EquationEngine.Models.EquationData();
            this.equation.setBlind(true);

            this._menteeRelations = [];
            this._followers = [];
            this._idol = [];
            this.selectionState = false;
            this.growthPhase = 'normal';
            this._params = [];
            this._childrenRelationships = [];

            MathUtilities.Tools.Dgt.Models.DgtDrawable.__super__.initialize.apply(this, arguments);
            this.onPostDrag = _.bind(function onPostDrag(postDragData) {
                if (this.engine.dgtUI.model.dgtPopUpView.model.bootstrapPopupShown) {
                    return;
                }
                var wheel, hamster, isPOB, pointCanvasPosition, pointGridPosition, locus, seed,
                    DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                    gridDistance, pointsGroup, effectiveDelX, effectiveDelY,
                    selectionPrison = this.engine.selectionPrison,
                    gridPosition, imageCords,
                    firstShockwave = this.engine.selectionFirstShockwave,
                    imagePosition, ctr, genesis, relocatedEntities, canvasPosition,
                    newCanvasPosition, genesisRelation, smallWheel, newGridPosition, hamsterGridPosition,
                    willUpdate = this.engine.seletionShockwaveWillUpdate,
                    oldX, oldY, transformationView,
                    engine = this.engine,
                    imgCanvasPos,
                    grid = this.engine.grid,
                    updateDataObject,
                    allSuccessorRelations = [],
                    successorRelation,
                    anchorData, offSpringCoordinate,
                    i, sourceCount, parentData = [],
                    paramsForCalculation, offspringCanvasPosition,
                    delX, delY,
                    equation = postDragData.equation,
                    deltaX = postDragData.deltaX,
                    deltaY = postDragData.deltaY,
                    position = postDragData.position,
                    forceDrawing = postDragData.forceDrawing,
                    point = equation.getParent();

                //experimental...restrain view refresh until next call of post drag
                if (!forceDrawing) {
                    forceDrawing = this.TRAVEL_NORMAL;
                }
                if (!relocatedEntities) {
                    relocatedEntities = [];
                }

                for (wheel in selectionPrison) {
                    if (this.engine.isStandardObject(selectionPrison[wheel])) {
                        this.engine.grid._panBy(deltaX, deltaY);
                        return;
                    }
                }
                if (this.engine.grid.getGridMode() === 'annotation-mode' && this.species === 'tickMark') {
                    selectionPrison = [this];
                    firstShockwave = null;
                    willUpdate = [];
                }

                if (!point) {
                    return;
                }

                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                updateDataObject.forceDrawing = forceDrawing;

                if (!this.dragging && !(forceDrawing & this.TRAVEL_FORCE) && (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0)) {
                    this.dragging = true;
                }

                if (this.species === 'point') {
                    pointsGroup = this.equation.getPointsGroup();

                    //this point is not a POB nor it is affected by it
                    if (this.engine.grid.isSnapToGridEnabled() && !this.engine.isPointOnObject(this) &&
                        this.engine.selectionParole.indexOf(this) === -1 && !DgtEngine.restoreKind) {

                        pointGridPosition = this.equation.getPoints();
                        pointCanvasPosition = grid._getCanvasPointCoordinates(pointGridPosition[0]);

                        oldX = pointCanvasPosition[0];
                        oldY = pointCanvasPosition[1];

                        newCanvasPosition = grid.getClosestCanvasPoint(position);

                        newGridPosition = grid._getGraphPointCoordinates(position);
                        newGridPosition = grid.getClosestGridPoint(newGridPosition);

                        delX = newGridPosition[0] - pointGridPosition[0][0];
                        delY = newGridPosition[1] - pointGridPosition[0][1];

                        deltaX = newCanvasPosition[0] - oldX;
                        deltaY = newCanvasPosition[1] - oldY;

                        position = newCanvasPosition;
                    }
                } else {
                    pointsGroup = this.getPath();
                }

                if (typeof pointsGroup === 'undefined') {
                    return;
                }

                if (_.isNumber(delX) && _.isNumber(delX)) {
                    gridDistance = [delX, delY];
                } else {
                    gridDistance = grid._getGridDistance([deltaX, deltaY]);
                }

                updateDataObject.dx = gridDistance[0];
                updateDataObject.dy = gridDistance[1];

                for (wheel in selectionPrison) {
                    hamster = selectionPrison[wheel];

                    for (ctr = 0; ctr < willUpdate.length; ctr++) {
                        if (hamster === willUpdate[ctr].entity) {
                            willUpdate.splice(ctr, 1);
                            break;
                        }
                    }

                    if (hamster.species === 'point') {
                        pointsGroup = hamster.equation.getPointsGroup();
                    } else if (hamster.division === 'interior') {
                        pointsGroup = hamster.equation.getPathGroup();
                    } else if (hamster.division !== 'measurement' && hamster.division !== 'marking' && hamster.division !== 'image' && hamster.division !== 'iteration') {
                        pointsGroup = hamster.getPath();
                    }

                    isPOB = false;
                    if (['point', 'notation'].indexOf(hamster.division) > -1) {
                        //check if its a POB and it has its powers
                        if (hamster.equation.getLocus() && (!hamster.creator || selectionPrison.indexOf(hamster.creator.getSource(0)) === -1)) {
                            isPOB = true;
                            locus = hamster.equation.getLocus();
                            seed = locus.getConstants();


                            if (hamster.creator.possibleOffset) {

                                pointGridPosition = [geomFunctions.getPointPositionFromOffset(seed.x1, seed.y1, seed.x2, seed.y2, hamster.creator.possibleOffset)];
                                pointCanvasPosition = grid._getCanvasPointCoordinates(pointGridPosition[0]);

                            } else {
                                pointGridPosition = hamster.equation.getPoints();
                                pointCanvasPosition = grid._getCanvasPointCoordinates(pointGridPosition[0]);
                            }

                            effectiveDelX = pointCanvasPosition[0];
                            effectiveDelY = pointCanvasPosition[1];

                            if (engine.areSuccessorRelationsForPOB(hamster, allSuccessorRelations)) {
                                while (allSuccessorRelations.length > 0) {
                                    successorRelation = allSuccessorRelations.pop();
                                    sourceCount = successorRelation.getSourceCount();
                                    if (successorRelation.anchor) {
                                        anchorData = DgtEngine.getDataOfEntity(successorRelation.anchor);
                                    }
                                    for (i = 0; i < sourceCount; i++) {
                                        parentData[i] = DgtEngine.getDataOfEntity(successorRelation.getSource(i));
                                    }
                                    if (!offSpringCoordinate) {
                                        offSpringCoordinate = DgtEngine.getDataOfEntity(successorRelation.offspring);
                                        offSpringCoordinate[0] += gridDistance[0];
                                        offSpringCoordinate[1] += gridDistance[1];
                                    }
                                    paramsForCalculation = {
                                        "relation": successorRelation,
                                        "target": 'source',
                                        "anchorData": anchorData,
                                        "parentData": parentData,
                                        "offSpringCoordinate": offSpringCoordinate
                                    };
                                    /*
                                    the below offspringCoordinate is source coordinate of current successor relation
                                    which will be treated as offspring coordinate for ancestor relation...
                                    */
                                    offSpringCoordinate = engine.findPointPosition(paramsForCalculation);
                                }
                                offspringCanvasPosition = grid._getCanvasPointCoordinates(offSpringCoordinate);
                                pointCanvasPosition[0] = offspringCanvasPosition[0];
                                pointCanvasPosition[1] = offspringCanvasPosition[1];
                            } else {
                                pointCanvasPosition[0] += deltaX;
                                pointCanvasPosition[1] += deltaY;
                            }

                            if (hamster.division === 'point') {
                                newCanvasPosition = hamster.setPositionOfPointOnObject(pointCanvasPosition);
                            } else {
                                newCanvasPosition = hamster.setPositionOfNotationOnObject(pointCanvasPosition);
                            }

                            effectiveDelX = newCanvasPosition[0] - effectiveDelX;
                            effectiveDelY = newCanvasPosition[1] - effectiveDelY;

                            if (hamster.creator.possibleOffset < 0 || hamster.creator.possibleOffset > 1) {
                                effectiveDelX = 0;
                                effectiveDelY = 0;
                            }

                            newGridPosition = grid._getGraphPointCoordinates(newCanvasPosition);

                            if (hamster.division === 'notation' && hamster.creator.getSource(0).species === 'circle') {
                                hamster.recalculateSlope(newGridPosition);
                            }

                            if (forceDrawing & this.TRAVEL_FORCE) {
                                hamster.creator.saveOffsetOfPointOnObject(newGridPosition);
                                delete hamster.creator.possibleOffset;
                            }
                        } else if (hamster.division === 'notation') {
                            if (this.engine.grid.getGridMode() === 'Graph') {
                                if (hamster.species === 'angleMark') {
                                    //since angleMark seed is already in canvas form
                                    hamster.shiftSeedBy(gridDistance[0], gridDistance[1]);
                                }
                                if (pointsGroup) {
                                    pointsGroup.position.x += deltaX;
                                    pointsGroup.position.y += deltaY;
                                }
                                if (hamster.species === 'tickMark') {
                                    hamsterGridPosition = hamster.equation.getPoints()[0];
                                    gridPosition = [hamsterGridPosition[0] + gridDistance[0], hamsterGridPosition[1] + gridDistance[1]];
                                    hamster.equation.setPoints([
                                        [gridPosition[0], gridPosition[1]]
                                    ]);
                                }
                            }
                        } else {
                            //cause hidden point doesn't have a points group now...
                            if (pointsGroup) {
                                canvasPosition = [pointsGroup.firstChild.position.x + deltaX, pointsGroup.firstChild.position.y + deltaY];
                                pointsGroup.firstChild.position.x = canvasPosition[0];
                                pointsGroup.firstChild.position.y = canvasPosition[1];

                                pointsGroup.lastChild.position.x = canvasPosition[0];
                                pointsGroup.lastChild.position.y = canvasPosition[1];
                            }
                            hamsterGridPosition = hamster.equation.getPoints()[0];
                            gridPosition = [hamsterGridPosition[0] + gridDistance[0], hamsterGridPosition[1] + gridDistance[1]];
                            hamster.equation.setPoints([
                                [gridPosition[0], gridPosition[1]]
                            ]);
                        }

                    } else if (hamster.division === 'marking') {
                        //4 types of marking mark angle, ratio, vector and distance...
                        //none of them changes if the marking is in prison
                        //in case of mark vector u need to update that stupid arrow so just make that call

                        hamster.shiftMarkingBy(deltaX, deltaY);

                    } else if (hamster.division === 'shape' || hamster.division === 'interior') {
                        //here if all sources are in prison then just move the shape with that same distance??
                        //not exactly a bright solution

                        hamster.shiftSeedBy(gridDistance[0], gridDistance[1]);

                        if (forceDrawing & this.TRAVEL_FORCE) {

                            hamster.redraw();
                        } else {
                            if (pointsGroup) {
                                pointsGroup.position.x += deltaX;
                                pointsGroup.position.y += deltaY;
                            }
                        }
                    } else if (hamster.division === 'annotation') {
                        hamster.shiftPointsBy(gridDistance[0], gridDistance[1]);

                        pointsGroup.position.x += deltaX;
                        pointsGroup.position.y += deltaY;

                    } else if (hamster.division === 'measurement') {
                        updateDataObject.genesis = this;
                        updateDataObject.caller = this;
                        updateDataObject.relocatedEntities = relocatedEntities;
                        hamster.update(updateDataObject);
                    } else if (hamster.division === 'image') {

                        imageCords = hamster.equation.getPoints()[0];
                        imagePosition = hamster.equation.getRaster().position;
                        imageCords[0] += gridDistance[0];
                        imageCords[1] += gridDistance[1];

                        hamster.equation.setPoints([imageCords]);
                        hamster.x = imageCords[0];
                        hamster.y = imageCords[1];
                        imgCanvasPos = this.engine.grid._getCanvasPointCoordinates(imageCords);
                        imagePosition.x = imgCanvasPos[0];
                        imagePosition.y = imgCanvasPos[1];
                        geomFunctions.nudgeRaster(hamster.equation.getRaster());

                        if ($.inArray(hamster, engine.selected) >= 0) {
                            transformationView = MathUtilities.Tools.Dgt.Views.TransformationGridView.getTransformationGridViewObject(engine.dgtUI.model.dgtPaperScope, engine, hamster.equation.getRaster());
                            transformationView._locatePoints();
                        }
                    }

                    if (hamster.equation && hamster.equation.getLabelData().labelObject && !DgtEngine.restoreKind) {
                        if (isPOB) {
                            grid._handleLabelPostDrag(hamster.equation, effectiveDelX, effectiveDelY);
                        } else {
                            grid._handleLabelPostDrag(hamster.equation, deltaX, deltaY);
                        }
                    } else if (DgtEngine.restoreKind && hamster.equation && hamster.equation.getSpecie() !== 'polygon' && hamster.equation.getLabelData().labelObject) {
                        grid._handleLabelPostDrag(hamster.equation, deltaX, deltaY, position);
                    }

                }
                /// ......pass shock to firstShockWaves


                relocatedEntities = selectionPrison.slice();
                for (smallWheel in firstShockwave) {

                    genesis = firstShockwave[smallWheel].shocker;

                    genesisRelation = firstShockwave[smallWheel].current;

                    if (relocatedEntities.indexOf(genesis) === -1) {
                        relocatedEntities.push(genesis);
                    }

                    //Shock launched from `genesis`
                    relocatedEntities.willUpdate = willUpdate;

                    updateDataObject.genesis = genesis;
                    updateDataObject.caller = genesis;
                    updateDataObject.relocatedEntities = relocatedEntities;
                    genesisRelation.moveRelatives(updateDataObject);

                }

                this.engine.grid.refreshView();

            }, this);
        },


        "follow": function(idol) {
            //sets follower and idol.
            if (idol._followers.indexOf(this) === -1) {
                this._idol.push(idol);
                idol._followers.push(this);
            }
        },

        "unfollowAll": function() {
            var index, entity;
            while (this._idol.length > 0) {
                entity = this._idol.pop();
                index = entity._followers.indexOf(this);
                if (index > -1) {
                    entity._followers.splice(index, 1);
                }
            }
        },

        //For ellipse interior inequalities path group is to be used.
        "getPath": function() {
            return this.equation.getPathGroup();
        },

        "getStateOfMind": function() {
            return 'serene';
        },

        "setLastSelectedTimestamp": function(timestamp) {
            this._lastSelectedTimestamp = timestamp;
        },

        "getLastSelectTimestamp": function() {
            return this._lastSelectedTimestamp;
        },

        "setGrowthPhase": function(phase) {
            this.growthPhase = phase;
            this.trigger('change-color');
        },


        "getPossibleUpdatingEntities": function(curWave) {
            function getProto(entity, caller) {
                return {
                    "entity": entity,
                    "caller": caller,
                    "toString": function() {
                        return this.entity.id;
                    }
                };
            }
            var selectionPrison = this.engine.selectionPrison,
                possibleUpdatingEntities = [],
                entityCntr, subRelationCntr, subRelationshipsLength, self = this,
                lastTrversedNode, curRippledEntity,
                possibleEntityCnt = 0,
                nextPossibleRippleSet,
                getNextRippleSet = function(relation, entity) {
                    var ripple = relation.getRippleEntities([entity]),
                        loopVar, rippleCtr, curRippled, curRippledIndex, anchor, anchorIndex,
                        rippleObject = [],
                        possibleUpdatingEntitiesLength, lastTrversedNodeIndex, lastTrversedNodeCallerLength;

                    // pushing rippleEntities to rippleObject Array
                    for (rippleCtr = 0; rippleCtr < ripple.length; rippleCtr++) {
                        rippleObject.push(getProto(ripple[rippleCtr], [entity]));
                    }

                    for (rippleCtr = 0; rippleCtr < rippleObject.length; rippleCtr++) {
                        curRippled = rippleObject[rippleCtr].entity;
                        curRippledIndex = self.engine.getIndexOfUpdatingEntity(curRippled, possibleUpdatingEntities);
                        possibleUpdatingEntitiesLength = possibleUpdatingEntities.length;
                        for (loopVar = 0; loopVar < possibleUpdatingEntitiesLength; loopVar++) {

                            //Checking for a circular Chain i.e an entity updated by a caller should not update the caller itself
                            if ($.inArray(curRippled, possibleUpdatingEntities[loopVar].caller) > -1 && entity === possibleUpdatingEntities[loopVar].entity) {
                                rippleObject.splice(rippleCtr, 1);
                                rippleCtr--;
                                break;
                            }
                        }
                        if (loopVar !== possibleUpdatingEntitiesLength) {
                            continue;
                        }

                        //if current updating entity is already pushed in the selection prison, then source should not be updated
                        if ($.inArray(curRippled, selectionPrison) > -1 || curRippledIndex > -1) {
                            rippleObject.splice(rippleCtr, 1);
                            rippleCtr--;
                            if (curRippledIndex > -1) {
                                possibleUpdatingEntities[curRippledIndex].caller.push(entity);
                            }
                            continue;
                        }

                        anchor = relation.anchor;
                        anchorIndex = self.engine.getIndexOfUpdatingEntity(anchor, possibleUpdatingEntities);
                        //if entityForChk is having anchor & anchor is already pushed in willUpdate or in prison... den source should not be updated
                        if (anchor && curRippled !== relation.offspring &&
                            ($.inArray(anchor, selectionPrison) > -1 || anchorIndex > -1)) {
                            rippleObject.splice(rippleCtr, 1);
                            rippleCtr--;
                            continue;
                        }

                        //if offspring & mentorMarking is in possible updating entities... source/anchor should not be pushed in updating entity
                        if (relation.offspring === entity && self.engine.getIndexOfUpdatingEntity(entity, possibleUpdatingEntities) > -1 &&
                            self.engine.getIndexOfUpdatingEntity(relation.getMentorMarking()[0], possibleUpdatingEntities) > -1 &&
                            (relation.isSource(rippleObject[rippleCtr].entity) || relation.isAnchor(rippleObject[rippleCtr].entity))) {
                            rippleObject.splice(rippleCtr, 1);
                            rippleCtr--;
                            continue;
                        }

                        lastTrversedNodeIndex = self.engine.getIndexOfUpdatingEntity(entity, possibleUpdatingEntities);
                        if (lastTrversedNodeIndex > -1) {
                            lastTrversedNode = possibleUpdatingEntities[lastTrversedNodeIndex];
                        }

                        //Eg: A source updating offspring segment then other source of segment should not be updated due to the segment itself
                        if (lastTrversedNode && relation.isSource(curRippled) && relation.isOffspring(entity) &&
                            $.inArray(lastTrversedNode.entity, rippleObject[rippleCtr].caller) !== -1) {
                            lastTrversedNodeCallerLength = lastTrversedNode.caller.length;
                            for (loopVar = 0; loopVar < lastTrversedNodeCallerLength; loopVar++) {
                                if ($.inArray(lastTrversedNode.caller[loopVar], relation.sources) !== -1) {
                                    rippleObject.splice(rippleCtr, 1);
                                    rippleCtr--;
                                    break;
                                }
                            }
                        }
                    }

                    return rippleObject;
                };

            //add genesis temporarily in possibleUpdatingEntities

            possibleUpdatingEntities.push(getProto(curWave.shockedEntity, [curWave.shocker]));

            for (entityCntr = possibleEntityCnt; entityCntr < possibleUpdatingEntities.length; entityCntr++) {
                curRippledEntity = possibleUpdatingEntities[entityCntr].entity;



                if (curRippledEntity.creator && (curRippledEntity.division === 'point' || curRippledEntity.division === 'shape' || curRippledEntity.division === 'interior')) {
                    nextPossibleRippleSet = getNextRippleSet(curRippledEntity.creator, curRippledEntity);
                    possibleUpdatingEntities = possibleUpdatingEntities.concat(nextPossibleRippleSet);

                }

                subRelationshipsLength = curRippledEntity._childrenRelationships.length;
                for (subRelationCntr = 0; subRelationCntr < subRelationshipsLength; subRelationCntr++) {
                    possibleUpdatingEntities = possibleUpdatingEntities.concat(getNextRippleSet(curRippledEntity._childrenRelationships[subRelationCntr], curRippledEntity));
                }

                subRelationshipsLength = curRippledEntity._menteeRelations.length;
                for (subRelationCntr = 0; subRelationCntr < subRelationshipsLength; subRelationCntr++) {
                    possibleUpdatingEntities = possibleUpdatingEntities.concat(getNextRippleSet(curRippledEntity._menteeRelations[subRelationCntr], curRippledEntity));
                }

            }


            possibleEntityCnt = possibleUpdatingEntities.length;

            return possibleUpdatingEntities;
        },

        "saveDataOnRelocate": function(relocateData) {

            var equation, delX, delY, position, actionName, selectionEntity, eventName,
                entity, redoData, undoData, selectedEntities = [],
                selectedArray,
                postDragDataObject;

            this.engine.eventListenerCanvas.attachMouseMoveFunction(null);

            equation = relocateData.equation;
            delX = relocateData.delX;
            delY = relocateData.delY;
            position = relocateData.position;
            actionName = relocateData.actionName;
            selectionEntity = relocateData.selectionEntity;
            eventName = relocateData.eventName;

            selectedArray = selectionEntity ? selectionEntity : this.engine.selected;

            postDragDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createPostDragDataObject();
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
                "id": this.id,
                "position": position,
                "actionName": actionName
            };
            undoData = {
                "deltaX": -delX,
                "deltaY": -delY,
                "id": this.id,
                "position": [position[0] - delX, position[1] - delY],
                "actionName": actionName
            };
            this.dragging = false;
            if (this.division === 'image') {
                redoData.matrix = this.getEquationMatrix();
                undoData.matrix = this.undoRedoData[0].matrix;
            }
            if (this._universe) {
                undoData.universeId = this._universe.id;
                redoData.universeId = this._universe.id;
            }
            for (entity = 0; entity < selectedArray.length; entity++) {
                if (selectedArray[entity].division !== 'annotation' || selectedArray[entity].division !== 'image') {
                    selectedEntities.push(selectedArray[entity].id);
                }
            }

            undoData.selectedEntities = selectedEntities;
            redoData.selectedEntities = selectedEntities;

            //this is to force refresh

            this.engine.execute('relocate', {
                "undo": {
                    "actionType": 'goToPrevPosition',
                    "undoData": undoData
                },
                "redo": {
                    "actionType": 'goToNewPosition',
                    "redoData": redoData
                }
            });

        },

        "setEngine": function(engine) {
            this.engine = engine;
        },
        "liberateKarma": function(operation) {
            var index = this._karma.indexOf(operation);
            if (index > -1) {
                this._karma.splice(index, 1);
            }

            if (this._karma.length === 0) {
                this.incinerate();
            }
        },

        "involveInRelation": function(relation) {
            if (this._childrenRelationships.indexOf(relation) === -1) {
                this._childrenRelationships.push(relation);
            }
        },

        //make sure the relation calls this function
        "forgetRelation": function(relation) {
            var index = this._childrenRelationships.indexOf(relation);
            if (index > -1) {
                this._childrenRelationships.splice(index, 1);
            }
        },

        "setCreationMethod": function(method) {
            this._creationMethod = method;
            this.updateGrowthPhase();
        },

        "updateVisibleDomain": function() {
            if (this.division !== 'point') {
                return;
            }
        },

        "updateGrowthPhase": function() {
            return 0;
        },

        "getLabelDataText": function() {
            return this.equation.getLabelData().text;
        },


        "_showLabel": function() {
            var labelData;
            if (this.equation) {
                labelData = this.equation.getLabelData();
                if (!labelData.labelObject) {
                    this.createLabel();
                }
                if (labelData) {
                    this.properties.labelVisibility = true;
                    this.setProperty('labelVisibility', true);
                }
            }
        },

        "_hideLabel": function() {
            if (this.equation) {
                this.properties.labelVisibility = false;
                this.setProperty('labelVisibility', false);
            }
        },
        "updateSelectionState": function(newState) {
            if (this.selectionState === newState) {
                return;
            }
            if (this.selectionState) {
                this.selectionState = false;
                this.engine.dgtUI.model.dgtPopUpView.trigger('selection-state-changed');

            } else {
                this.selectionState = true;
            }
        },
        "createLabel": function() {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            if (!DgtEngine.restoreKind) {
                this.calculateLabelPosition();
            }
            this.engine.grid.addLabel(this.equation);
            this.equation.on('label-drag-begin', this.updateCustomLabelPosition)
                .on('label-pre-drag', this.updateCustomLabelPosition)
                .on('label-roll-over', this.engine.onLabelRollOver) // for label Roll over
                .on('label-roll-out', this.engine.onLabelRollOut);
        },

        "assignLabel": function(predefinedShape) {
            if (this.creator && typeof this.creator._universe !== 'undefined' && this.creator._universe !== null) {
                return;
            }
            var labelText = '',
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                species = this.species;
            if (this.engine._undergoingOperation && this.engine._undergoingOperation.type === 'paste' && this.creator) {
                predefinedShape = MathUtilities.Tools.Dgt.Models.DgtOperation.isAPredefinedShape(this.creator.species);
            }
            if (!DgtEngine.restoreKind) {
                if (this.creator && this.getCreationMethod() !== 'withCircle' && this.creator.sources[0] &&
                    this.creator.sources[0].division === this.division && !predefinedShape) {
                    this.updateLabelText();
                } else {
                    if (this.engine.debugVariable === true) {
                        labelText = this.id;
                        if (species === 'point') {
                            MathUtilities.Tools.Dgt.Models.DgtEngine.naturalEntityCount.points++;
                        }
                    } else {
                        labelText = this.getTextForLabel(species, predefinedShape);
                        this.setProperty('labelText', labelText);
                    }
                    this.properties.labelText = labelText;
                }
            }
        },

        "getTextForLabel": function(species, predefinedShape) {
            var lineCount = MathUtilities.Tools.Dgt.Models.DgtEngine.naturalEntityCount.lineCount,
                pointCount = MathUtilities.Tools.Dgt.Models.DgtEngine.naturalEntityCount.points,
                a, labelText,
                NO_OF_CHAR = 26,
                ALPHABET_CAP_A = 65,
                ALPHABET_SMALL_A = 97;
            switch (species) {
                case 'point':
                    labelText = Math.floor(pointCount / NO_OF_CHAR) === 0 ? String.fromCharCode(pointCount % NO_OF_CHAR + ALPHABET_CAP_A) : String.fromCharCode(pointCount % NO_OF_CHAR + ALPHABET_CAP_A) + Math.floor(pointCount / NO_OF_CHAR);
                    this.properties.labelCount = pointCount;
                    MathUtilities.Tools.Dgt.Models.DgtEngine.naturalEntityCount.points++;
                    if (predefinedShape) {
                        labelText = '$' + labelText;
                    }
                    break;
                case 'line':
                case 'ray':
                case 'segment':
                case 'hyperbola':
                case 'parabola':
                case 'ellipse':
                    if (lineCount % NO_OF_CHAR === 11) { // l not allowed .
                        MathUtilities.Tools.Dgt.Models.DgtEngine.naturalEntityCount.lineCount++;
                        lineCount++;
                    }
                    this.properties.labelCount = lineCount;
                    labelText = Math.floor(lineCount / NO_OF_CHAR) === 0 ? String.fromCharCode(lineCount % NO_OF_CHAR + ALPHABET_SMALL_A) : String.fromCharCode(lineCount % NO_OF_CHAR + ALPHABET_SMALL_A) + Math.floor(lineCount / NO_OF_CHAR);
                    MathUtilities.Tools.Dgt.Models.DgtEngine.naturalEntityCount.lineCount++;
                    break;
                case 'arc':
                case 'circle':
                    if (species === 'circle') {
                        a = MathUtilities.Tools.Dgt.Models.DgtEngine.naturalEntityCount.circleCount++;
                    } else {
                        a = MathUtilities.Tools.Dgt.Models.DgtEngine.naturalEntityCount.arcCount++;
                    }
                    this.properties.labelCount = a;
                    labelText = species.charAt(0) + a;
                    break;
                case 'polygonInterior':
                    a = MathUtilities.Tools.Dgt.Models.DgtEngine.naturalEntityCount.interiorCount++;
                    this.properties.labelCount = a;
                    labelText = 'P' + a;
                    break;

                case 'circleInterior':
                    a = MathUtilities.Tools.Dgt.Models.DgtEngine.naturalEntityCount.interiorCount++;
                    this.properties.labelCount = a;
                    labelText = 'C' + a;
                    break;

                case 'ellipseInterior':
                    a = MathUtilities.Tools.Dgt.Models.DgtEngine.naturalEntityCount.interiorCount++;
                    this.properties.labelCount = a;
                    labelText = 'E' + a;
                    break;

                case 'arcSegmentInterior':
                case 'arcSectorInterior':
                    a = MathUtilities.Tools.Dgt.Models.DgtEngine.naturalEntityCount.interiorCount++;
                    this.properties.labelCount = a;
                    labelText = 'A' + a;
                    break;
                case 'angleMark':
                    labelText = this.constructOriginalLabel(this.creator)[0];
                    break;
            }
            return labelText;
        },

        "updateLabelVisibility": function(bVisibility) {
            if (bVisibility) {
                this._showLabel();
            } else {
                this._hideLabel();
            }
        },

        "getLabel": function(source) {
            var sourceParent = 0,
                label = "",
                parent;

            if (source.showParentLabel()) {
                while (sourceParent < source.creator.sources.length) {
                    parent = source.creator.sources[sourceParent];
                    if (this.division === 'measurement') {
                        this.labelingParents.push(parent);
                    }
                    label += parent.equation.getLabelData().text;
                    if (parent.properties.binaryInvisibility === 0) {
                        parent.updateLabelVisibility(true);
                    }
                    sourceParent++;
                }
            } else {
                if (this.division === 'measurement') {
                    this.labelingParents.push(source);
                }
                label = source.equation.getLabelData().text;
                if (this.division === 'measurement' && source.properties && !source.properties.binaryInvisibility) {
                    source.updateLabelVisibility(true);
                }
            }

            return label;
        },

        "constructOriginalLabel": function(creator) {
            var i, labels = [],
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                sourceData = [],
                orderLabel = '';

            for (i = 0; i < creator.getSourceCount(); i++) {
                sourceData[i] = DgtEngine.getDataOfEntity(creator.getSource(i));
                labels[i] = this.getLabel(creator.sources[i]);
            }
            for (i = 0; i < labels.length; i++) {
                orderLabel += labels[i];
            }
            return [orderLabel, labels];
        },
        "removeLastSeperator": function(lastParent, label) {
            if (label.charAt(label.length - 1) === '|' && lastParent.equation.getLabelData().text !== '|') {
                label = label.substring(0, label.length - 1);
            }
            return label;
        },
        "getLabelToDisplay": function() {
            var label = '',
                creationMethod = this.getCreationMethod(),
                sources, sourcesLength, loopCtr;
            if (creationMethod === 'natural' || creationMethod === 'circleWithPoints' && this.species !== 'point') {
                if (!this.equation.getLabelData().labelObject) {
                    sources = this.creator.sources;
                    sourcesLength = sources.length;
                    for (loopCtr = 0; loopCtr < sourcesLength; loopCtr++) {
                        label += sources[loopCtr].equation.getLabelData().text;
                    }
                    return label;
                }
                label = this.equation.getLabelData().text;
                return label;
            }
            label = this.properties.labelText;
            label = this.deletePrefixedString(label);
            return label;
        },

        "showParentLabel": function() {
            if (['natural', 'circleWithPoints', 'interiorWithPoints'].indexOf(this.getCreationMethod()) > -1 &&
                !this.equation.getLabelData().labelObject && this.creator.species !== 'terminalPoint') {

                if (this._childrenRelationships.length > 0) {
                    if (this._childrenRelationships[0].offspring.division === 'marking') {
                        return true;
                    }
                    return this._childrenRelationships[0].offspring.showParentLabelRecursive(this.division) === true;
                }
                return true;
            }
            return false;
        },

        "showParentLabelRecursive": function(division) {
            var divisionChild = this.division,
                j;
            if (divisionChild === division) {
                if (this.equation.getLabelData().labelObject) {
                    return false;
                }
                if (this._childrenRelationships.length > 0) {
                    for (j = 0; j < this._childrenRelationships.length; j++) {
                        if (this._childrenRelationships[j].offspring.division === 'marking') {
                            continue;
                        }
                        this._childrenRelationships[j].offspring.showParentLabelRecursive(divisionChild);
                    }
                }
            }
            return true;
        },

        "assignNumberLabel": function(obj) {
            var number;
            if (obj.equation.getLabelData().labelObject === null) {
                number = obj.id.match(/[0-9]+$/);
                return '#' + (parseInt(number, 10) + 1);
            }
            return obj.equation.getLabelData().text;
        },
        "updateLabelText": function(newName, appendPrefix, doesUpdateChildren) {
            if (this._universe || ['annotation', 'image'].indexOf(this.division) > -1) {
                return;
            }
            var i, j, customLabelText, offspring,
                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData(),
                followers = this._followers,
                childrenRelationshipsLength,
                followersLength,
                childrenRelationships;

            if (typeof newName === 'string') {
                if (typeof appendPrefix !== 'undefined' && appendPrefix !== false) {
                    customLabelText = '$' + newName;
                } else {
                    customLabelText = newName;
                }
                this.properties.labelText = customLabelText;
                this.setProperty('labelText', customLabelText);
                this.updateLabelVisibility(true);
                if (followers) {
                    followersLength = followers.length;
                    for (i = 0; i < followersLength; i++) {
                        if (followers[i].species === 'iteration') {
                            childrenRelationships = followers[i]._childrenRelationships;
                            childrenRelationshipsLength = childrenRelationships.length;
                            for (j = 0; j < childrenRelationshipsLength; j++) {
                                if (childrenRelationships[j].species === 'measureIteration') {
                                    childrenRelationships[j].offspring.update(updateDataObject);
                                }
                            }
                        }
                    }
                }
            } else {
                if (this.species === 'calculation') {
                    this.properties.labelTextOriginal = this.engine.dgtCalculatorManager.regenerateLatex({
                        "inputReference": this.creator._params.inputReference.slice(),
                        "objectIndexInInputReference": this.creator._params.objectIndexInInputReference,
                        "answer": this.value
                    }, this);
                    return;
                }
                if (this.creator) {
                    newName = this.creator.sources[0].properties.labelText;
                    if (newName && newName.substring(0, 1) === '$') {
                        newName = newName.substring(1);
                    }
                    if (this.division === this.creator.sources[0].division &&
                        this.getCreationMethod() !== 'withCircle') { //for arc label
                        if (typeof this.properties.labelText !== 'string' || this.properties.labelText.substring(0, 1) !== '$') {
                            if (this.engine.debugVariable === true) {
                                this.properties.labelText = this.id;
                            } else {
                                this.properties.labelText = newName + '\'';
                            }
                            this.setProperty('labelText', newName + '\'');
                        }
                    } else if (this.division === 'measurement') { //for measurement
                        if (this.species === 'measureIteration') {
                            this.trigger('update-iteration-table', this.creator.sources[0].generateMeasurementObject());
                        } else {
                            this.updateOriginalLabelText();
                        }
                    } else if (this.species === 'angleMark') {
                        this.properties.labelText = this.getTextForLabel(this.species);
                        this.setProperty('labelText', this.properties.labelText);
                    }
                }
            }

            if (doesUpdateChildren) {
                childrenRelationships = this._childrenRelationships;
                childrenRelationshipsLength = childrenRelationships.length;
                if (childrenRelationships) {
                    updateDataObject.genesis = this;
                    updateDataObject.caller = this;
                    updateDataObject.modifyAttributes = ['label'];

                    for (j = 0; j < childrenRelationshipsLength; j++) {
                        offspring = this._childrenRelationships[j].offspring;
                        if (offspring.division === 'marking' ||
                            offspring.getCreationMethod() === 'withCircle') {
                            continue;
                        }
                        childrenRelationships[j].moveRelatives(updateDataObject);
                    }
                }
            }
        },

        //this function is used to get SourceCreationMethod  for description String.
        "getCreationMethodAndLabel": function(sources) {
            var obj = [],
                loopVar,
                creationMethod,
                sourcesLength = sources.length,
                LABEL_MAX_LENGTH = 20,
                textMapping = this.engine.dgtUI.model.textMapping;
            for (loopVar = 0; loopVar < sourcesLength; loopVar++) {
                creationMethod = sources[loopVar].getCreationMethod();
                obj.push({});
                if (!creationMethod || ['natural', 'translate', 'rotate', 'reflect', 'dilate', 'circleWithPoints'].indexOf(creationMethod) > -1 &&
                    sources[loopVar].species === 'point') {
                    obj[loopVar].sourceCreationMethod = textMapping[sources[loopVar].species];
                } else {
                    obj[loopVar].sourceCreationMethod = textMapping[sources[loopVar].getCreationMethod()];
                    if (['perpendicular', 'parallel'].indexOf(obj[loopVar].sourceCreationMethod) > -1) {
                        obj[loopVar].sourceCreationMethod += ' line';
                    }
                }
                obj[loopVar].label = this.assignNumberLabel(sources[loopVar]);
                if (obj[loopVar].label.length > LABEL_MAX_LENGTH) {
                    obj[loopVar].label = obj[loopVar].label.slice(0, LABEL_MAX_LENGTH) + '...';
                }
            }
            return obj;
        },

        "getStringToDisplay": function(source) {
            var label = this.getLabel(source);

            if (!source.showParentLabel()) {
                if (source.getCreationMethod() !== 'natural') {
                    if (source.getCreationMethod()) {
                        label = source.getCreationMethod() + ' ' + label;
                    } else {
                        label = source.species + ' ' + label;
                    }
                } else {
                    label = source.species + ' ' + label;
                }
            }
            return label.charAt(0).toUpperCase() + label.substring(1);
        },

        "getUniqueLabel": function(p1, p2, p3, p4) {
            var str = [],
                counter, points = [p1, p2, p3, p4];

            for (counter = 0; counter < points.length; counter++) {
                str.push(points[counter].equation.getLabelData().text);
            }
            if (points[0] === points[2]) {
                return str[1] + '-' + str[0] + '-' + str[3];
            }
            if (points[0] === points[3]) {
                return str[1] + '-' + str[0] + '-' + str[2];
            }
            if (points[2] === points[1]) {
                return str[0] + '-' + str[1] + '-' + str[3];
            }
            return str[0] + '-' + str[1] + '-' + str[2];
        },

        "_getAngleData": function(angleData, angle, point1, point2) {
            angleData.push({
                "angle": angle,
                "points": [point1, point2]
            });
        },

        "_adjustAngle": function(angle) {
            var FULL_ANGLE = 360;
            if (angle < 0) {
                angle += FULL_ANGLE;
            }
            return angle;
        },

        "_getAngleBisectorCoordinates": function(seed, referencePt, distance) {
            return geomFunctions.getPointAtADistance(seed.a, seed.b, seed.c, referencePt[0], referencePt[1], distance);
        },

        "_getLabelCoordinates": function(maxAngleData) {
            var center, labelPosition = [],
                angleBisectorSeed = [],
                referencePtCanvasCoords, labelPositionCanvasCoords,
                ptOnBisector = [
                    [],
                    []
                ],
                temp = [],
                distance = this.engine.grid._getGridDistance([20, 0])[0],
                points = maxAngleData.points,
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                origLineCoefficient = DgtShape.getLineSeed([points[0], points[1]]),
                referencePt = [points[0][0], points[0][1]],
                FULL_ANGLE = 360,
                STRAIGHT_ANGLE = 180;

            if (maxAngleData.angle === -FULL_ANGLE) {
                ptOnBisector = this._getAngleBisectorCoordinates(origLineCoefficient, points[0], distance);
                labelPosition = ptOnBisector[0];
            } else {
                center = geomFunctions.getTriangleIncentre(points[1][0], points[1][1], points[0][0], points[0][1], points[2][0], points[2][1]);
                if (maxAngleData.points[3][1][0] === points[1][0] && maxAngleData.points[3][1][1] === points[1][1] || maxAngleData.points[3][1][0] === points[2][0] && maxAngleData.points[3][1][1] === points[2][1]) {
                    maxAngleData.points[3][1][0] = maxAngleData.points[3][2][0];
                    maxAngleData.points[3][1][1] = maxAngleData.points[3][2][1];
                }

                if (maxAngleData.angle === STRAIGHT_ANGLE) {
                    angleBisectorSeed = DgtShape.getLineSeed(points, origLineCoefficient, 'perpendicular');
                    if (angleBisectorSeed.a.toFixed(3) === 0) {
                        ptOnBisector[0][0] = referencePt[0] + distance;
                        ptOnBisector[0][1] = referencePt[1];
                        ptOnBisector[1][0] = referencePt[0] - distance;
                        ptOnBisector[1][1] = referencePt[1];
                    } else {
                        if (center[0].toFixed(3) === referencePt[0].toFixed(3) && center[1].toFixed(3) === referencePt[1].toFixed(3)) {
                            center[0] = (-angleBisectorSeed.b * (referencePt[1] + 1) - angleBisectorSeed.c) / angleBisectorSeed.a;
                            center[1] = referencePt[1] + 1;
                        }
                        ptOnBisector = this._getAngleBisectorCoordinates(angleBisectorSeed, referencePt, distance);
                    }
                    if ((origLineCoefficient.a * maxAngleData.points[3][1][0] + origLineCoefficient.b * maxAngleData.points[3][1][1] + origLineCoefficient.c).toFixed(3) > 0) {
                        if (origLineCoefficient.a * ptOnBisector[0][0] + origLineCoefficient.b * ptOnBisector[0][1] + origLineCoefficient.c > 0) {
                            labelPosition = ptOnBisector[1];
                        } else {
                            labelPosition = ptOnBisector[0];
                        }
                    } else if ((origLineCoefficient.a * maxAngleData.points[3][1][0] + origLineCoefficient.b * maxAngleData.points[3][1][1] + origLineCoefficient.c).toFixed(3) < 0) {
                        if ((origLineCoefficient.a * ptOnBisector[0][0] + origLineCoefficient.b * ptOnBisector[0][1] + origLineCoefficient.c).toFixed(3) > 0) {
                            labelPosition = ptOnBisector[0];
                        } else {
                            labelPosition = ptOnBisector[1];
                        }
                    } else {
                        if (ptOnBisector[0][1] <= ptOnBisector[1][1]) {
                            temp = ptOnBisector[0];
                            ptOnBisector[0] = ptOnBisector[1];
                            ptOnBisector[1] = temp;
                        }
                        if (['line', 'ray', 'segment'].indexOf(this.species) > -1) {
                            if (-(this.seed.a / this.seed.b) > -1) {
                                labelPosition = ptOnBisector[1];
                            } else {
                                labelPosition = ptOnBisector[0];
                            }
                        } else {
                            labelPosition = ptOnBisector[1];
                        }
                    }
                } else {
                    angleBisectorSeed = DgtShape.getLineSeed([center, referencePt]);
                    if (angleBisectorSeed.a.toFixed(3) === 0) {
                        if (maxAngleData.angle > STRAIGHT_ANGLE) {
                            if (referencePt[0] > center[0]) {
                                labelPosition[0] = referencePt[0] + distance;
                            } else {
                                labelPosition[0] = referencePt[0] - distance;
                            }
                        } else {
                            if (referencePt[0] < center[0]) {
                                labelPosition[0] = referencePt[0] + distance;
                            } else {
                                labelPosition[0] = referencePt[0] - distance;
                            }
                        }
                        labelPosition[1] = referencePt[1];
                    } else {
                        ptOnBisector = this._getAngleBisectorCoordinates(angleBisectorSeed, referencePt, distance);
                        if (ptOnBisector[0][1] < ptOnBisector[1][1]) {
                            temp = ptOnBisector[0];
                            ptOnBisector[0] = ptOnBisector[1];
                            ptOnBisector[1] = temp;
                        }
                        if (maxAngleData.angle > STRAIGHT_ANGLE) {
                            if (angleBisectorSeed.a < 0) {
                                labelPosition = ptOnBisector[0];
                            } else {
                                labelPosition = ptOnBisector[1];
                            }
                        } else {
                            if (angleBisectorSeed.a > 0) {
                                labelPosition = ptOnBisector[0];
                            } else {
                                labelPosition = ptOnBisector[1];
                            }
                        }
                    }
                }
            }

            labelPositionCanvasCoords = this.engine.grid._getCanvasPointCoordinates(labelPosition);
            this.properties.labelPosition.x = labelPositionCanvasCoords[0];
            this.properties.labelPosition.y = labelPositionCanvasCoords[1];
            referencePtCanvasCoords = this.engine.grid._getCanvasPointCoordinates(referencePt);

            this.properties.labelPosition.relativePosition.dx = referencePtCanvasCoords[0] - labelPositionCanvasCoords[0];
            this.properties.labelPosition.relativePosition.dy = referencePtCanvasCoords[1] - labelPositionCanvasCoords[1];
            this.setProperty('labelPosition', this.properties.labelPosition);
        },

        "calculateLineAngleData": function(currentPoint, seed, angleData) {
            var smallAngle, bigAngle,
                STRAIGHT_ANGLE = 180,
                otherPoint = this._getAngleBisectorCoordinates(seed, currentPoint, 0.45),
                currentAngle = this._adjustAngle(Math.atan((otherPoint[0][1] - currentPoint[1]) / (otherPoint[0][0] - currentPoint[0])) * STRAIGHT_ANGLE / Math.PI);

            if (currentAngle < STRAIGHT_ANGLE) {
                smallAngle = currentAngle;
                bigAngle = currentAngle + STRAIGHT_ANGLE;
            } else {
                smallAngle = currentAngle - STRAIGHT_ANGLE;
                bigAngle = currentAngle;
            }
            if (otherPoint[1][1] < otherPoint[0][1]) {
                this._getAngleData(angleData, smallAngle, currentPoint, otherPoint[0]);
                this._getAngleData(angleData, bigAngle, currentPoint, otherPoint[1]);
            } else {
                this._getAngleData(angleData, bigAngle, currentPoint, otherPoint[0]);
                this._getAngleData(angleData, smallAngle, currentPoint, otherPoint[1]);
            }
            return angleData;

        },
        "calculateSegmentAngleData": function(point1, point2, currentPoint, angleData, noOfRelations) {
            var otherPoint, currentAngle, x1, x2, y1, y2,
                dx, dy,
                STRAIGHT_ANGLE = 180,
                FULL_ANGLE = 360;
            if (currentPoint[0].toFixed(3) === point2[0].toFixed(3) && currentPoint[1].toFixed(3) === point2[1].toFixed(3)) {
                otherPoint = point1;
                x1 = currentPoint[0];
                y1 = currentPoint[1];
                x2 = point1[0];
                y2 = point1[1];
            } else {
                otherPoint = point2;
                x1 = currentPoint[0];
                y1 = currentPoint[1];
                x2 = point2[0];
                y2 = point2[1];
            }
            dx = x2 - x1;
            dy = y2 - y1;
            if (noOfRelations === 1) {

                this._getAngleData(angleData, -FULL_ANGLE, currentPoint, otherPoint);
            } else {
                if (y1 === y2 && x2 > x1) {
                    currentAngle = STRAIGHT_ANGLE; // for horizontal Case.
                } else {
                    currentAngle = Math.atan(dy / dx) * STRAIGHT_ANGLE / Math.PI;
                }
                if (dx < 0 && dy > 0 || dx < 0 && dy < 0) {
                    currentAngle += STRAIGHT_ANGLE;
                }
                if (dx > 0 && dy < 0) {
                    currentAngle = this._adjustAngle(currentAngle);
                }
                this._getAngleData(angleData, currentAngle, currentPoint, otherPoint);
            }
            return angleData;
        },

        "saveAngleData": function(currentChild, currentPoint, angleData, i, noOfRelations) {
            var smallAngle, bigAngle, radiusSeed, interiorSourcePoints = [],
                lineSeed, offset,
                tangentSeed, childIsShape = false,
                j, dist1, dist2,
                constants, pointAngle, angle1, angle2, angle3,
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                point1, point2, DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                INCREMENTBY = 2,
                FULL_ANGLE = 360,
                STRAIGHT_ANGLE = 180;

            switch (currentChild.species) {
                case 'line':
                    constants = DgtEngine.getDataOfEntity(currentChild);
                    angleData = this.calculateLineAngleData(currentPoint, constants, angleData);
                    angleData[i].angle = this._adjustAngle(angleData[i].angle);
                    break;
                case 'circle':
                case 'arc':
                case 'arcInterior':
                case 'circleInterior':
                    if (['arc', 'arcInterior'].indexOf(currentChild.species) > -1 && this !== currentChild.creator.sources[1]) {
                        for (j = 0; j < this._childrenRelationships.length; j++) {
                            if (this._childrenRelationships[j].offspring.division === 'shape' &&
                                this._childrenRelationships[j].offspring !== currentChild) {
                                childIsShape = true;
                            }
                        }
                    }
                    if (['circle', 'circleInterior'].indexOf(currentChild.species) > -1 || ['arc', 'arcInterior'].indexOf(currentChild.species) > -1 &&
                        (this !== currentChild.creator.sources[0] && this !== currentChild.creator.sources[2] || childIsShape === true)) {
                        point1 = [currentChild.seed.a, currentChild.seed.b];
                        if (currentPoint[0] === point1[0] && currentPoint[1] === point1[1]) {
                            break;
                        }
                        radiusSeed = DgtShape.getLineSeed([point1, currentPoint]);
                        tangentSeed = DgtShape.getLineSeed([currentPoint], radiusSeed, 'perpendicular');
                        angleData = this.calculateLineAngleData(currentPoint, tangentSeed, angleData);
                        angleData[i].angle = this._adjustAngle(angleData[i].angle);
                        i += INCREMENTBY;
                        angleData = this.calculateSegmentAngleData(point1, currentPoint, currentPoint, angleData, noOfRelations);
                        angleData[i].angle = this._adjustAngle(angleData[i].angle);
                        break;
                    }
                    pointAngle = Math.atan2(currentPoint[1] - currentChild.seed.b, currentPoint[0] - currentChild.seed.a);
                    angle1 = geomFunctions.getPositiveAngle(currentChild.seed.from);
                    angle2 = geomFunctions.getPositiveAngle(currentChild.seed.via);
                    angle3 = geomFunctions.getPositiveAngle(currentChild.seed.to);
                    pointAngle = geomFunctions.getPositiveAngle(pointAngle);
                    if (angle1 > angle3) {
                        bigAngle = angle1;
                        smallAngle = angle3;
                    } else {
                        bigAngle = angle3;
                        smallAngle = angle1;
                    }
                    if (smallAngle < angle2 && angle2 < bigAngle) {
                        if (pointAngle.toFixed(3) === smallAngle.toFixed(3)) {
                            point1 = geomFunctions.rotatePoint(currentPoint[0], currentPoint[1], currentChild.seed.a, currentChild.seed.b, -5, true);
                        } else {
                            point1 = geomFunctions.rotatePoint(currentPoint[0], currentPoint[1], currentChild.seed.a, currentChild.seed.b, 5, true);
                        }
                    } else {
                        if (pointAngle.toFixed(3) === smallAngle.toFixed(3)) {
                            point1 = geomFunctions.rotatePoint(currentPoint[0], currentPoint[1], currentChild.seed.a, currentChild.seed.b, 5, true);
                        } else {
                            point1 = geomFunctions.rotatePoint(currentPoint[0], currentPoint[1], currentChild.seed.a, currentChild.seed.b, -5, true);
                        }
                    }
                    point2 = geomFunctions.rotatePoint(point1[0], point1[1], currentPoint[0], currentPoint[1], STRAIGHT_ANGLE, true);
                    tangentSeed = DgtShape.getLineSeed([point2, currentPoint]);
                    radiusSeed = DgtShape.getLineSeed([currentPoint], tangentSeed, 'perpendicular');
                    angleData = this.calculateLineAngleData(currentPoint, radiusSeed, angleData);
                    angleData[i].angle = this._adjustAngle(angleData[i].angle);
                    i += INCREMENTBY;
                    angleData = this.calculateSegmentAngleData(point2, currentPoint, currentPoint, angleData, noOfRelations);
                    angleData[i].angle = this._adjustAngle(angleData[i].angle);

                    break;
                case 'ellipse':
                case 'ellipseInterior':
                case 'parabola':
                case 'hyperbola':
                    if (['ellipse', 'ellipseInterior'].indexOf(currentChild.species) > -1) {
                        point1 = [currentChild.seed.p, currentChild.seed.q];
                    } else if (currentChild.species === 'parabola') {
                        point1 = [currentChild.seed.l, currentChild.seed.m];
                    } else if (currentChild.species === 'hyperbola') {
                        dist1 = geomFunctions.distance2(currentChild.seed.i, currentChild.seed.j, currentChild.seed.g, currentChild.seed.h);
                        dist2 = geomFunctions.distance2(currentChild.seed.k, currentChild.seed.l, currentChild.seed.g, currentChild.seed.h);
                        if (dist1 < dist2) {
                            point1 = [currentChild.seed.i, currentChild.seed.j];
                        } else {
                            point1 = [currentChild.seed.k, currentChild.seed.l];
                        }
                    }
                    if (['ellipse', 'hyperbola', 'ellipseInterior'].indexOf(currentChild.species) > -1 && this !== currentChild.creator.sources[0] && this !== currentChild.creator.sources[1] || currentChild.species === 'parabola' && this !== currentChild.creator.sources[1]) {
                        radiusSeed = DgtShape.getLineSeed([point1, currentPoint]);
                        tangentSeed = DgtShape.getLineSeed([currentPoint], radiusSeed, 'perpendicular');
                        angleData = this.calculateLineAngleData(currentPoint, tangentSeed, angleData);
                        angleData[i].angle = this._adjustAngle(angleData[i].angle);
                        i += INCREMENTBY;
                        angleData = this.calculateSegmentAngleData(point1, currentPoint, currentPoint, angleData, noOfRelations);
                        angleData[i].angle = this._adjustAngle(angleData[i].angle);
                    }
                    break;
                case 'segment':
                    constants = DgtEngine.getDataOfEntity(currentChild);
                    if (currentPoint[0] === constants.x1 && currentPoint[1] === constants.y1 || currentPoint[0] === constants.x2 && currentPoint[1] === constants.y2) {
                        point1 = [currentChild.seed.x1, currentChild.seed.y1];
                        point2 = [currentChild.seed.x2, currentChild.seed.y2];
                        angleData = this.calculateSegmentAngleData(point1, point2, currentPoint, angleData, noOfRelations);
                    } else { // for Point On Object OR Midpoint.
                        angleData = this.calculateLineAngleData(currentPoint, constants, angleData);
                        angleData[i].angle = this._adjustAngle(angleData[i].angle);
                    }
                    break;
                case 'ray':
                    constants = DgtEngine.getDataOfEntity(currentChild);
                    if (this._childrenRelationships.length === 1 && currentPoint[0] === constants.x1 && currentPoint[1] === constants.y1) {
                        this._getAngleData(angleData, -FULL_ANGLE, [constants.x1, constants.y1], [constants.x2, constants.y2]);
                    } else if (currentPoint[0] === constants.x1 && currentPoint[1] === constants.y1) {
                        angleData = this.calculateSegmentAngleData([constants.x1, constants.y1], [constants.x2, constants.y2], currentPoint, angleData, noOfRelations);
                    } else {
                        angleData = this.calculateLineAngleData(currentPoint, constants, angleData);
                        angleData[i].angle = this._adjustAngle(angleData[i].angle);
                    }
                    break;
                case 'polygonInterior':
                    constants = currentChild.seed;
                    for (j = 0;; j++) {
                        if (typeof constants['x' + j] !== 'undefined' && constants['x' + j] !== null) {
                            interiorSourcePoints.push([constants['x' + j], constants['y' + j]]);
                        } else {
                            break;
                        }
                    }
                    for (j = 0; j < interiorSourcePoints.length - 1; j++) { // ^^^ (Check when duplicate point is added to seed)
                        if (interiorSourcePoints[interiorSourcePoints.length - 1][0] === interiorSourcePoints[j][0] && interiorSourcePoints[interiorSourcePoints.length - 1][1] === interiorSourcePoints[j][1]) {
                            interiorSourcePoints.pop(); // removing repeated point.
                            break;
                        }
                    }
                    if (['pointOnObject', 'lineInteriorIntersection'].indexOf(this.getCreationMethod()) > -1) {
                        offset = Math.floor(DgtShape.getOffsetForPointOnShape(currentChild.species, currentPoint, constants));
                        point1 = interiorSourcePoints[offset];
                        if (offset === interiorSourcePoints.length - 1) {
                            point2 = interiorSourcePoints[0];
                        } else {
                            point2 = interiorSourcePoints[offset + 1];
                        }
                        lineSeed = DgtShape.getLineSeed([point1, point2]);
                        angleData = this.calculateLineAngleData(currentPoint, lineSeed, angleData);
                        angleData[i].angle = this._adjustAngle(angleData[i].angle);
                    } else {
                        for (j = 0; j < interiorSourcePoints.length; j++) {
                            if (interiorSourcePoints[j][0] === this.equation.getPoints()[0][0] && interiorSourcePoints[j][1] === this.equation.getPoints()[0][1]) {
                                if (j === interiorSourcePoints.length - 1) {
                                    point1 = interiorSourcePoints[j - 1];
                                    point2 = interiorSourcePoints[0];
                                } else if (j === 0) {
                                    point1 = interiorSourcePoints[interiorSourcePoints.length - 1];
                                    point2 = interiorSourcePoints[1];
                                } else {
                                    point1 = interiorSourcePoints[j - 1];
                                    point2 = interiorSourcePoints[j + 1];
                                }
                            }
                        }

                        angleData = this.calculateSegmentAngleData(point1, currentPoint, currentPoint, angleData, noOfRelations);
                        angleData[i].angle = this._adjustAngle(angleData[i].angle);
                        i++;
                        angleData = this.calculateSegmentAngleData(currentPoint, point2, currentPoint, angleData, noOfRelations);
                        angleData[i].angle = this._adjustAngle(angleData[i].angle);
                    }
                    break;
            }

            return angleData;
        },
        "calculateLabelPosition": function() {
            var relation, relation1, currentChild,
                arcAngle, point1, point2,
                grid = this.engine.grid,
                halfArcAngle,
                xAxisLabelPos = grid._getGraphPointCoordinates([grid._getCanvasPointCoordinates([grid.markerBounds.max.x, 0])[0] - 30, 0])[0],
                yAxisLabelPos = grid._getGraphPointCoordinates([0, 60])[1],
                tempCount, arc, tempAngle, tempPoint, dx, dy, canvasPoint1, canvasPoint2,
                tempCount1, point, j, sourcePoints, anchorIsSource = false,
                angleData = [],
                noOfRelations = 0,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                maxAngle, maxAngleData, newAngleData = [],
                allRelations,
                FULL_ANGLE = 360,
                STRAIGHT_ANGLE = 180,
                RIGHT_ANGLE = 90,
                OFFSET_DISTANCE = 15,
                OFFSET_ANGLE = 315,
                i, angleData1, angle1, angleCount, currentPoint,
                labelData = this.equation.getLabelData();
            labelData.position = {};

            switch (this.division) {
                case 'point':
                    i = 0;
                    if (this._childrenRelationships) {
                        for (allRelations = 0; allRelations < this._childrenRelationships.length; allRelations++) {
                            currentChild = this._childrenRelationships[allRelations].offspring;
                            if (['shape', 'interior'].indexOf(currentChild.division) > -1) {
                                if (this._childrenRelationships[allRelations].anchor) { // Anchor Labeling
                                    sourcePoints = currentChild.equation.getPoints();
                                    if (sourcePoints) {
                                        for (j = 0; j < sourcePoints.length; j++) {
                                            if (this.equation.getPoints()[0][0] === sourcePoints[j][0] && this.equation.getPoints()[0][1] === sourcePoints[j][1]) {
                                                anchorIsSource = true;
                                                break;
                                            }
                                        }
                                        if (anchorIsSource !== true) {
                                            break;
                                        }
                                    }
                                } else {
                                    anchorIsSource = true;

                                }
                                if (['circle', 'circleInterior', 'arc', 'ellipse', 'ellipseInterior', 'parabola', 'hyperbola', 'polygonInterior', 'arcInterior'].indexOf(currentChild.species) > -1) {
                                    if (['circle', 'circleInterior'].indexOf(currentChild.species) > -1 &&
                                        currentChild.creator.sources[0] === this ||
                                        currentChild.species === 'parabola' &&
                                        currentChild.creator.sources[1] === this || ['ellipse', 'hyperbola', 'ellipseInterior'].indexOf(currentChild.species) > -1 &&
                                        (currentChild.creator.sources[0] === this || currentChild.creator.sources[1] === this)) {
                                        noOfRelations = 0;
                                        break;
                                    }
                                    noOfRelations += 2;
                                } else {
                                    noOfRelations++;
                                }
                            }
                        }
                    }
                    if (this.creator) {
                        for (allRelations = 0; allRelations < this.creator.sources.length; allRelations++) {
                            currentChild = this.creator.sources[allRelations];
                            if (currentChild.division === 'shape') {
                                if (['circle', 'arc', 'ellipse', 'parabola', 'hyperbola'].indexOf(currentChild.species) > -1) {
                                    noOfRelations += 2;
                                } else {
                                    noOfRelations++;
                                }
                            }
                        }
                    }
                    if (this._childrenRelationships) {
                        for (relation = 0; relation < this._childrenRelationships.length; relation++) {
                            currentChild = this._childrenRelationships[relation].offspring;
                            if (this._childrenRelationships[relation].anchor && this._childrenRelationships[relation].anchor.division !== 'point' || anchorIsSource === true) {
                                currentPoint = this.equation.getPoints()[0];
                                angleData = this.saveAngleData(currentChild, currentPoint, angleData, i, noOfRelations);
                            }
                        }
                    }
                    if (this.creator) {
                        for (relation1 = 0; relation1 < this.creator.sources.length; relation1++) {
                            currentChild = this.creator.sources[relation1];
                            currentPoint = this.equation.getPoints()[0];
                            angleData = this.saveAngleData(currentChild, currentPoint, angleData, i, noOfRelations);
                        }
                    }
                    if (angleData.length !== 0) {
                        angleData.sort(function(a, b) {
                            return a.angle - b.angle;
                        });
                        angleData1 = angleData[0];
                        angle1 = angleData1.angle;
                        maxAngle = -FULL_ANGLE;
                        if (angleData.length > 1) {
                            for (angleCount = 0; angleCount < angleData.length - 1; angleCount++) {
                                newAngleData[angleCount] = {
                                    "points": []
                                };
                                newAngleData[angleCount].angle = angleData[angleCount + 1].angle - angleData[angleCount].angle;
                                newAngleData[angleCount].points.push(angleData[angleCount].points[0], angleData[angleCount].points[1], angleData[angleCount + 1].points[1]);
                                if (maxAngle < newAngleData[angleCount].angle) {
                                    maxAngle = newAngleData[angleCount].angle;
                                    maxAngleData = newAngleData[angleCount];
                                    tempCount = angleCount;
                                }
                            }
                            newAngleData[angleCount] = {
                                "points": []
                            };
                            newAngleData[angleCount].angle = FULL_ANGLE - angleData[angleCount].angle + angle1;
                            newAngleData[angleCount].points.push(angleData[angleCount].points[0], angleData[angleCount].points[1], angleData1.points[1]);

                            if (maxAngle < newAngleData[angleCount].angle) {
                                maxAngle = newAngleData[angleCount].angle;
                                maxAngleData = newAngleData[angleCount];
                                tempCount = angleCount;
                            }

                            for (tempCount1 = 0; tempCount1 < newAngleData.length; tempCount1++) {
                                if (tempCount !== tempCount1) {
                                    maxAngleData.points[3] = newAngleData[tempCount1].points;
                                }
                            }

                        } else {
                            maxAngleData = angleData[0];
                        }
                        if (noOfRelations !== 0) {
                            this._getLabelCoordinates(maxAngleData);
                        }
                    }
                    if (noOfRelations === 0) {
                        this.getPointLabelCoordinate(this.engine.grid._getCanvasPointCoordinates(this.equation.getPoints()[0]), -OFFSET_DISTANCE, -OFFSET_DISTANCE);
                    }
                    break;

                case 'shape':
                    switch (this.species) {
                        case 'circle':
                            point = geomFunctions.getCartesianCoordinates(this.seed.a, this.seed.b, this.seed.r, OFFSET_ANGLE, true);
                            this._getAngleData(angleData, -FULL_ANGLE, point, [this.seed.a, this.seed.b]);
                            this._getLabelCoordinates(angleData[0]);
                            this.properties.labelPosition.offset = OFFSET_ANGLE;
                            break;

                        case 'line':
                        case 'segment':
                        case 'ray':
                            if (this.id === 'Xmirror') {
                                point = [xAxisLabelPos, 0];
                            } else if (this.id === 'Ymirror') {
                                point = [0, yAxisLabelPos];
                            } else {
                                point = geomFunctions.midPoint2(this.seed.x1, this.seed.y1, this.seed.x2, this.seed.y2);
                            }
                            this._getAngleData(angleData, STRAIGHT_ANGLE, point, [this.seed.x1, this.seed.y1]);
                            angleData[0].points.push([this.seed.x2, this.seed.y2], [this.seed.x2, this.seed.y2]);
                            this._getLabelCoordinates(angleData[0]);
                            this.properties.labelPosition.offset = 0.5;

                            break;

                        case 'arc':
                            arc = this.seed;
                            arcAngle = geomFunctions.getArcAngle(arc);
                            point = geomFunctions.rotatePoint(arc.x3, arc.y3, arc.a, arc.b, arcAngle, true);
                            point = DgtEngine.roundOffArray(point, 3);
                            point1 = DgtEngine.roundOffArray([arc.x1, arc.y1], 3);
                            point2 = DgtEngine.roundOffArray([arc.x2, arc.y2], 3);
                            if (arcAngle === STRAIGHT_ANGLE) {
                                tempAngle = geomFunctions.angleBetweenPoints(arc.x1, arc.y1, arc.a, arc.b, arc.x2, arc.y2);
                                tempPoint = geomFunctions.rotatePoint(arc.x1, arc.y1, arc.a, arc.b, tempAngle, true);
                                tempPoint = DgtEngine.roundOffArray(tempPoint, 3);
                                if (tempPoint[0] === point2[0] && tempPoint[1] === point2[1]) {
                                    point = geomFunctions.rotatePoint(arc.x1, arc.y1, arc.a, arc.b, 0.25 * arcAngle, true);
                                } else {
                                    point = geomFunctions.rotatePoint(arc.x3, arc.y3, arc.a, arc.b, 0.75 * arcAngle, true);
                                }
                            } else {
                                if (point[0] === point1[0] && point[1] === point1[1]) {
                                    point = geomFunctions.rotatePoint(arc.x3, arc.y3, arc.a, arc.b, 0.75 * arcAngle, true);
                                } else {
                                    point = geomFunctions.rotatePoint(arc.x1, arc.y1, arc.a, arc.b, 0.25 * arcAngle, true);
                                }
                            }
                            this._getAngleData(angleData, -FULL_ANGLE, point, [arc.a, arc.b]);
                            this.properties.labelPosition.offset = geomFunctions.getPolarCoordinates(point[0], point[1], arc.a, arc.b, true)[1];
                            this.properties.labelPosition.offset1 = 0.25;
                            this._getLabelCoordinates(angleData[0]);
                            break;

                        case 'parabola':
                        case 'hyperbola':
                        case 'ellipse':
                            if (this.species === 'parabola') {

                                tempPoint = [this.seed.l, this.seed.m];
                            } else if (this.species === 'ellipse') {

                                tempPoint = [this.seed.p, this.seed.q];
                            } else if (this.species === 'hyperbola') {

                                tempPoint = [this.seed.i, this.seed.j];
                            }
                            point = DgtEngine.getRandomPointOnObject(this, this.creator, -0.6); //value is the angle at which random point will be drawn.
                            this._getAngleData(angleData, -FULL_ANGLE, point, tempPoint);
                            this._getLabelCoordinates(angleData[0]);
                            this.properties.labelPosition.offset = -0.6;
                            break;
                    }
                    break;

                case 'notation':
                    point1 = geomFunctions.getCartesianCoordinates(this.seed.a, this.seed.b, this.seed.r, this.seed.via);
                    point2 = geomFunctions.getPointPositionFromOffset(this.seed.x2, this.seed.y2, point1[0], point1[1], 1.5);
                    canvasPoint1 = this.engine.grid._getCanvasPointCoordinates(point1);
                    canvasPoint2 = this.engine.grid._getCanvasPointCoordinates(point2);

                    dx = canvasPoint1[0] - canvasPoint2[0];
                    dy = canvasPoint1[1] - canvasPoint2[1];
                    this.getPointLabelCoordinate(canvasPoint1, dx, dy);
                    this.properties.labelPosition.offset = geomFunctions.getPolarCoordinates(point2[0], point2[1], this.seed.a, this.seed.b, true)[1];
                    break;

                case 'interior':
                    switch (this.species) {
                        case 'polygonInterior':
                            point = geomFunctions.getPointPositionFromOffset(this.seed.x1, this.seed.y1, this.seed.x2, this.seed.y2, 0.25);
                            this._getAngleData(angleData, STRAIGHT_ANGLE, point, [this.seed.x1, this.seed.y1]);
                            angleData[0].points.push([this.seed.x2, this.seed.y2], [this.seed.x2, this.seed.y2]); // pushed twice intentionally.
                            this._getLabelCoordinates(angleData[0]);
                            this.properties.labelPosition.offset = 1.25; // 1.25 because point is on the second segment of interior.
                            break;

                        case 'circleInterior':
                            point = geomFunctions.getCartesianCoordinates(this.seed.a, this.seed.b, this.seed.r, RIGHT_ANGLE, true);
                            this._getAngleData(angleData, -FULL_ANGLE, point, [this.seed.a, this.seed.b]);
                            this._getLabelCoordinates(angleData[0]);
                            this.properties.labelPosition.offset = RIGHT_ANGLE;
                            break;

                        case 'ellipseInterior':
                            tempPoint = [this.seed.p, this.seed.q];
                            point = DgtEngine.getRandomPointOnObject(this, this.creator, -0.3); //value is the angle at which random point will be drawn.
                            this._getAngleData(angleData, -FULL_ANGLE, point, tempPoint);
                            this._getLabelCoordinates(angleData[0]);
                            this.properties.labelPosition.offset = -0.3;
                            break;

                        case 'arcSegmentInterior':
                            arc = this.seed;
                            arcAngle = geomFunctions.getArcAngle(arc);
                            halfArcAngle = 0.5 * arcAngle;
                            point = geomFunctions.rotatePoint(arc.x3, arc.y3, arc.a, arc.b, arcAngle, true);
                            point = DgtEngine.roundOffArray(point, 3);
                            point1 = DgtEngine.roundOffArray([arc.x1, arc.y1], 3);
                            point2 = DgtEngine.roundOffArray([arc.x2, arc.y2], 3);
                            if (arcAngle === STRAIGHT_ANGLE) {
                                tempAngle = geomFunctions.angleBetweenPoints(arc.x1, arc.y1, arc.a, arc.b, arc.x2, arc.y2);
                                tempPoint = geomFunctions.rotatePoint(arc.x1, arc.y1, arc.a, arc.b, tempAngle, true);
                                tempPoint = DgtEngine.roundOffArray(tempPoint, 3);
                                if (tempPoint[0] === point2[0] && tempPoint[1] === point2[1]) {
                                    point = geomFunctions.rotatePoint(arc.x1, arc.y1, arc.a, arc.b, halfArcAngle, true);
                                } else {
                                    point = geomFunctions.rotatePoint(arc.x3, arc.y3, arc.a, arc.b, halfArcAngle, true);
                                }
                            } else {
                                if (point[0] === point1[0] && point[1] === point1[1]) {
                                    point = geomFunctions.rotatePoint(arc.x3, arc.y3, arc.a, arc.b, halfArcAngle, true);
                                } else {
                                    point = geomFunctions.rotatePoint(arc.x1, arc.y1, arc.a, arc.b, halfArcAngle, true);
                                }
                            }
                            this._getAngleData(angleData, -FULL_ANGLE, point, [arc.a, arc.b]);
                            this.properties.labelPosition.offset = geomFunctions.getPolarCoordinates(point[0], point[1], arc.a, arc.b, true)[1];
                            this.properties.labelPosition.offset1 = 0.5;
                            this._getLabelCoordinates(angleData[0]);
                            break;
                    }
            }
        },

        "getPointLabelCoordinate": function(point, dx, dy) {
            this.properties.labelPosition.x = point[0] - dx;
            this.properties.labelPosition.y = point[1] - dy;
            this.properties.labelPosition.relativePosition.dx = dx;
            this.properties.labelPosition.relativePosition.dy = dy;
            this.setProperty('labelPosition', this.properties.labelPosition);
        },

        "getLatexEquivalent": function(specie) {
            switch (specie) {
                case 'line':
                    return '\\overleftrightarrow';
                case 'segment':
                    return '\\overline';
                case 'ray':
                    return '\\overrightarrow';
                case 'circle':
                    return '\\bigodot';
                case 'arc':
                    return '\\widehat';
            }

        },
        //When user moves the entity ...moving the label along with it.
        "updateLabelPosition": function() {
            var seed = this.seed,
                offset, newPositionOnObject,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                segDistance,
                labelPosition = this.properties.labelPosition;

            switch (this.species) {
                case 'point':
                    newPositionOnObject = this.engine.grid._getCanvasPointCoordinates(this.equation.getPoints()[0]);
                    this.getPointLabelCoordinate(newPositionOnObject, labelPosition.relativePosition.dx, labelPosition.relativePosition.dy);
                    break;

                case 'angleMark':
                    newPositionOnObject = geomFunctions.getCartesianCoordinates(this.seed.a, this.seed.b, this.seed.r, this.seed.via);
                    this.getPointLabelCoordinate(this.engine.grid._getCanvasPointCoordinates(newPositionOnObject), labelPosition.relativePosition.dx, labelPosition.relativePosition.dy);
                    break;

                case 'line':
                case 'ray':
                case 'segment':
                    if (this.getCreationMethod() === 'axis') {
                        this.calculateLabelPosition();
                        return;
                    }
                    seed = this.seed;
                    segDistance = geomFunctions.distance2(seed.x1, seed.y1, seed.x2, seed.y2);
                    offset = 0.4 / segDistance; // to allow constraintLabel.
                    if (labelPosition.offset >= 1 + offset && this.species === 'segment') {
                        newPositionOnObject = this.engine.grid._getCanvasPointCoordinates(geomFunctions.getPointPositionFromOffset(seed.x1, seed.y1, seed.x2, seed.y2, 1 + offset));
                        labelPosition.x = newPositionOnObject[0] - labelPosition.relativePosition.dx;
                        labelPosition.y = newPositionOnObject[1] - labelPosition.relativePosition.dy;
                    } else if (labelPosition.offset <= -offset && (this.species === 'segment' || this.species === 'ray')) {
                        newPositionOnObject = this.engine.grid._getCanvasPointCoordinates(geomFunctions.getPointPositionFromOffset(seed.x1, seed.y1, seed.x2, seed.y2, -offset));
                        labelPosition.x = newPositionOnObject[0] - labelPosition.relativePosition.dx;
                        labelPosition.y = newPositionOnObject[1] - labelPosition.relativePosition.dy;
                    } else {
                        newPositionOnObject = this.engine.grid._getCanvasPointCoordinates(geomFunctions.getPointPositionFromOffset(seed.x1, seed.y1, seed.x2, seed.y2, labelPosition.offset));
                        labelPosition.x = newPositionOnObject[0] - labelPosition.relativePosition.dx;
                        labelPosition.y = newPositionOnObject[1] - labelPosition.relativePosition.dy;
                    }
                    break;

                case 'circle':
                case 'circleInterior':
                    seed = this.seed;
                    newPositionOnObject = this.engine.grid._getCanvasPointCoordinates(geomFunctions.getCartesianCoordinates(seed.a, seed.b, seed.r, labelPosition.offset, true));
                    labelPosition.x = newPositionOnObject[0] - labelPosition.relativePosition.dx;
                    labelPosition.y = newPositionOnObject[1] - labelPosition.relativePosition.dy;
                    break;

                case 'arc':
                case 'arcSegmentInterior':
                    seed = this.seed;
                    newPositionOnObject = geomFunctions.getPointOnArcFromOffset(seed, labelPosition.offset1, 1);
                    newPositionOnObject = this.engine.grid._getCanvasPointCoordinates(newPositionOnObject);
                    labelPosition.x = newPositionOnObject[0] - labelPosition.relativePosition.dx;
                    labelPosition.y = newPositionOnObject[1] - labelPosition.relativePosition.dy;
                    break;

                case 'polygonInterior':
                    newPositionOnObject = DgtShape.getPointOnPolygonFromOffset(this.seed, labelPosition.offset);
                    newPositionOnObject = this.engine.grid._getCanvasPointCoordinates(newPositionOnObject);
                    labelPosition.x = newPositionOnObject[0] - labelPosition.relativePosition.dx;
                    labelPosition.y = newPositionOnObject[1] - labelPosition.relativePosition.dy;
                    break;

                case 'hyperbola':
                case 'ellipse':
                case 'ellipseInterior':
                case 'parabola':
                    seed = this.seed;
                    newPositionOnObject = this.engine.grid._getCanvasPointCoordinates(DgtEngine.getRandomPointOnObject(this, this.creator, labelPosition.offset));
                    labelPosition.x = newPositionOnObject[0] - labelPosition.relativePosition.dx;
                    labelPosition.y = newPositionOnObject[1] - labelPosition.relativePosition.dy;
                    break;

            }
            if (isNaN(labelPosition.x) || isNaN(labelPosition.y)) {
                labelPosition.x = null;
                labelPosition.y = null;
            }
        },

        //When user drags the label..
        "updateCustomLabelPosition": function(event, equation) {
            var DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                direction,
                currentEntity = this.getParent(),
                newPosition = MathUtilities.Tools.Dgt.Models.DgtDrawable.constraintDrag([event.point.x, event.point.y], equation),
                labelPosition = currentEntity.properties.labelPosition,
                seed = currentEntity.seed,
                arcAngle,
                newPositionOnObjCanvasCoords, angle1,
                newPositionOnObject,
                newLabelPosition = currentEntity.engine.grid._getGraphPointCoordinates(newPosition);

            switch (currentEntity.species) {
                case 'point':
                    newPositionOnObject = equation.getPoints()[0];
                    break;
                case 'angleMark':
                    newPositionOnObject = equation.getPoints()[1];
                    labelPosition.offset = geomFunctions.getPolarCoordinates(newLabelPosition[0], newLabelPosition[1], seed.a, seed.b, true)[1];
                    break;
                case 'line':
                case 'segment':
                case 'ray':
                    seed = currentEntity.seed;
                    newPositionOnObject = DgtShape.getClosestPointOnShape(currentEntity.species, newLabelPosition, seed);
                    labelPosition.offset = geomFunctions.getPointOffset(seed.x1, seed.y1, seed.x2, seed.y2, newPositionOnObject[0], newPositionOnObject[1]);
                    break;
                case 'circle':
                case 'circleInterior':
                case 'arc':
                case 'arcSegmentInterior':

                    seed = currentEntity.seed;
                    newPositionOnObject = DgtShape.getClosestPointOnShape(currentEntity.species, newLabelPosition, currentEntity.seed);
                    labelPosition.offset = geomFunctions.getPolarCoordinates(newPositionOnObject[0], newPositionOnObject[1], seed.a, seed.b, true)[1];

                    seed = currentEntity.seed;
                    newPositionOnObject = DgtShape.getClosestPointOnShape(currentEntity.species, newLabelPosition, currentEntity.seed);

                    labelPosition.offset = geomFunctions.getPolarCoordinates(newPositionOnObject[0], newPositionOnObject[1], seed.a, seed.b, true)[1];
                    if (currentEntity.species === 'arc' || currentEntity.species === 'arcSegmentInterior') {
                        labelPosition.offset = geomFunctions.getPolarCoordinates(newPositionOnObject[0], newPositionOnObject[1], seed.a, seed.b)[1];
                        arcAngle = geomFunctions.getArcAngle(seed, true);
                        direction = geomFunctions.getArcDirection(seed.from, seed.via, seed.to);
                        angle1 = geomFunctions.calculateArcAngle(seed.from, seed.from + direction * 0.00001, labelPosition.offset, true);

                        labelPosition.offset1 = Math.abs(angle1 / arcAngle);
                        if (labelPosition.offset1 < 0) {
                            labelPosition.offset1 = 0;
                        }
                    }
                    break;

                case 'ellipse':
                case 'ellipseInterior':
                case 'parabola':
                case 'hyperbola':
                    seed = currentEntity.seed;
                    newPositionOnObject = DgtShape.getClosestPointOnShape(currentEntity.species, newLabelPosition, currentEntity.seed);
                    labelPosition.offset = DgtShape.getOffsetForPointOnShape(currentEntity.species, newPositionOnObject, seed);
                    break;
                case 'polygonInterior':
                    seed = currentEntity.seed;
                    newPositionOnObject = DgtShape.getClosestPointOnShape(currentEntity.species, newLabelPosition, currentEntity.seed);
                    labelPosition.offset = DgtShape.getOffsetForPointOnShape(currentEntity.species, newPositionOnObject, seed);
                    break;
            }
            labelPosition.x = newPosition[0];
            labelPosition.y = newPosition[1];
            newPositionOnObjCanvasCoords = currentEntity.engine.grid._getCanvasPointCoordinates(newPositionOnObject);
            labelPosition.relativePosition.dx = newPositionOnObjCanvasCoords[0] - newPosition[0];
            labelPosition.relativePosition.dy = newPositionOnObjCanvasCoords[1] - newPosition[1];
            currentEntity.setProperty('labelPosition', labelPosition);
        }
    }, {
        //STATIC
        "constraintDrag": function(eventPoint, equationData, forPtOnObj) {
            var distance, position = [],
                offset, point, grid = equationData.getParent().engine.grid,
                center, offset1, looper, minDistance, choice, width, height, padding = grid._getGridDistance([20, 0])[0],
                angleMarkPadding = grid._getGridDistance([40, 0])[0],
                seed = equationData.getConstants(),
                segmentPosition, segmentSeed,
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                DgtDrawable = MathUtilities.Tools.Dgt.Models.DgtDrawable,
                theta,
                labelData = equationData.getLabelData(),
                labelLength, dx, dy,
                parentOfPOB = equationData.getParent(),
                choices;

            eventPoint = equationData.getParent().engine.grid._getGraphPointCoordinates(eventPoint);

            switch (equationData.getParent().species) {
                case 'point':
                    labelLength = equationData.getLabelData().labelObject.content.length;
                    center = equationData.getPoints()[0];
                    if (labelLength === 1) {

                        distance = geomFunctions.distance2(center[0], center[1], eventPoint[0], eventPoint[1]);
                        if (distance < padding) {
                            position = eventPoint;
                        } else {
                            offset = padding / distance;
                            position = geomFunctions.getPointPositionFromOffset(center[0], center[1], eventPoint[0], eventPoint[1], offset);

                        }
                    } else {
                        dx = eventPoint[0] - center[0];
                        dy = eventPoint[1] - center[1];
                        height = grid._getGridDistance([labelData.labelObject.bounds.height, 0])[0] / 2 + padding;
                        width = grid._getGridDistance([labelData.labelObject.bounds.width, 0])[0] / 2 + padding;
                        offset = Math.pow(dx, 2) / Math.pow(width, 2) + Math.pow(dy, 2) / Math.pow(height, 2);
                        if (offset < 1) {
                            position = eventPoint;

                        } else {
                            theta = Math.atan2(dy, dx);
                            position[0] = width * Math.cos(theta) + center[0];
                            position[1] = height * Math.sin(theta) + center[1];
                        }
                    }
                    position = parentOfPOB.engine.grid._getCanvasPointCoordinates(position);
                    break;

                case 'angleMark':
                    center = equationData.getPoints()[1];
                    distance = geomFunctions.distance2(center[0], center[1], eventPoint[0], eventPoint[1]);
                    if (distance < angleMarkPadding) {
                        position = eventPoint;
                    } else {
                        offset = angleMarkPadding / distance;
                        position = geomFunctions.getPointPositionFromOffset(center[0], center[1], eventPoint[0], eventPoint[1], offset);

                    }
                    position = parentOfPOB.engine.grid._getCanvasPointCoordinates(position);
                    break;

                case 'circle':
                case 'circleInterior':
                    position = parentOfPOB.engine.grid._getCanvasPointCoordinates(DgtDrawable.getArcConstrainedPosition(eventPoint, seed, 'circle', forPtOnObj, grid));
                    break;

                case 'arc':
                case 'arcSegmentInterior':
                    position = DgtDrawable.getArcConstrainedPosition(eventPoint, seed, 'arc', forPtOnObj, grid);
                    if (equationData.getParent().species === 'arcSegmentInterior') {

                        segmentSeed = {};
                        segmentSeed.x1 = seed.x1;
                        segmentSeed.y1 = seed.y1;
                        segmentSeed.x2 = seed.x3;
                        segmentSeed.y2 = seed.y3;

                        geomFunctions.getLineABC(segmentSeed.x1, segmentSeed.y1, segmentSeed.x2, segmentSeed.y2, segmentSeed);

                        segmentPosition = DgtDrawable.getLinearConstrainedPosition(eventPoint, segmentSeed, 'segment', true, grid);

                        choices = [];
                        choices.push(position, segmentPosition);

                    } else if (equationData.getParent().species === 'arcSectorInterior') {
                        choices = [];
                        choices.push(position);

                        segmentSeed = {};
                        segmentSeed.x1 = seed.x1;
                        segmentSeed.y1 = seed.y1;
                        segmentSeed.x2 = seed.a;
                        segmentSeed.y2 = seed.b;

                        geomFunctions.getLineABC(segmentSeed.x1, segmentSeed.y1, segmentSeed.x2, segmentSeed.y2, segmentSeed);
                        segmentPosition = DgtDrawable.getLinearConstrainedPosition(eventPoint, segmentSeed, 'segment', true, grid);
                        choices.push(segmentPosition);

                        segmentSeed = {};
                        segmentSeed.x1 = seed.x3;
                        segmentSeed.y1 = seed.y3;
                        segmentSeed.x2 = seed.a;
                        segmentSeed.y2 = seed.b;

                        geomFunctions.getLineABC(segmentSeed.x1, segmentSeed.y1, segmentSeed.x2, segmentSeed.y2, segmentSeed);
                        segmentPosition = DgtDrawable.getLinearConstrainedPosition(eventPoint, segmentSeed, 'segment', forPtOnObj, grid);
                        choices.push(segmentPosition);
                    }

                    if (choices) {
                        minDistance = Infinity;
                        for (looper in choices) {
                            distance = geomFunctions.distance2(choices[looper][0], choices[looper][1], eventPoint[0], eventPoint[1]);
                            if (distance < minDistance) {
                                choice = looper;
                                minDistance = distance;
                            }
                        }
                        position = choices[choice];
                    }
                    position = parentOfPOB.engine.grid._getCanvasPointCoordinates(position);
                    break;

                case 'line':
                case 'ray':
                case 'segment':
                    position = DgtDrawable.getLinearConstrainedPosition(eventPoint, seed, parentOfPOB.species, forPtOnObj, grid);
                    offset1 = position.offset;
                    position = parentOfPOB.engine.grid._getCanvasPointCoordinates(position);
                    position.offset = offset1;
                    break;

                case 'ellipse':
                case 'ellipseInterior':
                case 'parabola':
                case 'hyperbola':

                    point = DgtShape.getClosestPointOnShape(parentOfPOB.species, eventPoint, seed);
                    if (forPtOnObj) {
                        return parentOfPOB.engine.grid._getCanvasPointCoordinates(point);
                    }
                    distance = geomFunctions.distance2(point[0], point[1], eventPoint[0], eventPoint[1]);
                    if (distance < padding) {
                        position = eventPoint;
                    } else {
                        offset = padding / distance;
                        position = geomFunctions.getPointPositionFromOffset(point[0], point[1], eventPoint[0], eventPoint[1], offset);
                    }
                    position = parentOfPOB.engine.grid._getCanvasPointCoordinates(position);
                    break;
                case 'polygonInterior':
                    center = DgtShape.getClosestPointOnShape(parentOfPOB.species, eventPoint, seed);
                    distance = geomFunctions.distance2(center[0], center[1], eventPoint[0], eventPoint[1]);
                    if (distance < padding) {
                        position = eventPoint;
                    } else {
                        offset = padding / distance;
                        position = geomFunctions.getPointPositionFromOffset(center[0], center[1], eventPoint[0], eventPoint[1], offset);
                    }
                    position = parentOfPOB.engine.grid._getCanvasPointCoordinates(position);
                    break;

            }
            return position;
        },

        "getArcConstrainedPosition": function(eventPoint, seed, arcSpecie, forPtOnObj, grid) {
            var position, offset, maxBoundry, minBoundry, distance1, distance2,
                inScope, padding = grid._getGridDistance([20, 0])[0],
                center = [seed.a, seed.b],
                distance = geomFunctions.distance2(center[0], center[1], eventPoint[0], eventPoint[1]),
                radius = seed.r;

            if (forPtOnObj) {
                maxBoundry = radius;
                minBoundry = radius;
            } else {
                maxBoundry = radius + padding;
                minBoundry = radius - padding;
            }
            if (distance < minBoundry) {
                offset = minBoundry / distance;
                position = geomFunctions.getPointPositionFromOffset(center[0], center[1], eventPoint[0], eventPoint[1], offset);
            } else if (distance > maxBoundry) {
                offset = maxBoundry / distance;
                position = geomFunctions.getPointPositionFromOffset(center[0], center[1], eventPoint[0], eventPoint[1], offset);
            } else {
                position = eventPoint;
            }
            if (arcSpecie === 'arc') {

                distance1 = geomFunctions.distance2(seed.x1, seed.y1, eventPoint[0], eventPoint[1]);
                distance2 = geomFunctions.distance2(seed.x3, seed.y3, eventPoint[0], eventPoint[1]);
                inScope = geomFunctions.isPointProjectionOnArc(seed, eventPoint);

                if (inScope === false) {
                    if (distance1 < distance2) {
                        if (forPtOnObj) {
                            position = [seed.x1, seed.y1];
                        } else {
                            position = geomFunctions.getPointPositionFromOffset(seed.x1, seed.y1, eventPoint[0], eventPoint[1], 0.4 / distance1);
                        }
                    } else {
                        if (forPtOnObj) {
                            position = [seed.x3, seed.y3];
                        } else {
                            position = geomFunctions.getPointPositionFromOffset(seed.x3, seed.y3, eventPoint[0], eventPoint[1], 0.4 / distance2);
                        }
                    }
                }
            }
            return position;
        },

        "getLinearConstrainedPosition": function(eventPoint, seed, lineSpecie, forPtOnObj, grid) {
            var position, offset, offset1,
                padding = grid._getGridDistance([20, 0])[0],
                center = geomFunctions.getProjectionOfPointOnLine(eventPoint[0], eventPoint[1], seed.a, seed.b, seed.c),
                distance = geomFunctions.distance2(center[0], center[1], eventPoint[0], eventPoint[1]);

            if (distance < padding) {
                if (forPtOnObj) {
                    position = center;
                } else {
                    position = eventPoint;
                }
            } else {
                if (forPtOnObj) {
                    position = center;
                } else {
                    offset = padding / distance;
                    position = geomFunctions.getPointPositionFromOffset(center[0], center[1], eventPoint[0], eventPoint[1], offset);
                }
            }
            if (['segment', 'ray'].indexOf(lineSpecie) > -1) {
                offset1 = geomFunctions.getPointOffset(seed.x1, seed.y1, seed.x2, seed.y2, center[0], center[1]);
                if (offset1 < 0) {
                    if (forPtOnObj) {
                        position = [seed.x1, seed.y1];
                    } else {
                        offset = padding / geomFunctions.distance2(seed.x1, seed.y1, eventPoint[0], eventPoint[1]);
                        position = geomFunctions.getPointPositionFromOffset(seed.x1, seed.y1, eventPoint[0], eventPoint[1], offset);
                    }
                }
                if (lineSpecie === 'segment' && offset1 > 1) {
                    if (forPtOnObj) {
                        position = [seed.x2, seed.y2];
                    } else {
                        offset = padding / geomFunctions.distance2(seed.x2, seed.y2, eventPoint[0], eventPoint[1]);
                        position = geomFunctions.getPointPositionFromOffset(seed.x2, seed.y2, eventPoint[0], eventPoint[1], offset);
                    }
                }
            }

            position.offset = offset1;
            return position;
        },

        "consumeId": function(entity) {
            switch (entity.division) {
                case 'point':
                    entity.id = 'p' + MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.points;
                    MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.points++;
                    break;
                case 'shape':
                    entity.id = 's' + MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.shapes; //Counter is incremented in init(shape) . WHY??
                    break;
                case 'measurement':
                    entity.id = 'm' + MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.measures;
                    MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.measures++;
                    break;
                case 'image':
                    entity.id = 'i' + MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.images;
                    MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.images++;
                    break;
                case 'marking':
                    entity.id = 'marking' + MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.markings;
                    MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.markings++;
                    break;
                case 'relation':
                    entity.id = 'rel' + MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.relationShips;
                    MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.relationShips++;
                    break;
                case 'interior':
                    entity.id = 'in' + MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.interiors; //Counter is incremented in init(interior) . WHY??
                    break;
                case 'annotation':
                    entity.id = 'a' + MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.annotations;
                    MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.annotations++;
                    break;
            }
        }
    });
})(window.MathUtilities);
